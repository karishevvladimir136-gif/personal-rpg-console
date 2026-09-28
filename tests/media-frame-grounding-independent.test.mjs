import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { registerHooks } from "node:module";
const root = process.env.FRAME_GROUNDING_REVIEW_ROOT
  ? pathToFileURL(
      process.env.FRAME_GROUNDING_REVIEW_ROOT.replaceAll("\\", "/").replace(
        /\/$/,
        "",
      ) + "/",
    )
  : new URL("../", import.meta.url);
const { fixture, world } = await import(
  new URL("tests/phase35-storage-fixture.mjs", root)
);
const real = await import(new URL("src/lib/visual-frame/real-frame.ts", root));
const visual = await import(new URL("src/lib/visual-frame/model.ts", root));
const { executeMediaFrame } = await import(
  new URL("src/lib/server/media/orchestration.ts", root)
);
const { storedPixels } = await import(
  new URL("src/lib/server/media/png.ts", root)
);
const { png } = await import(new URL("tests/media-frame-fixture.mjs", root));
const hook = registerHooks({
  resolve(specifier, context, next) {
    return specifier === "server-only"
      ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
      : next(specifier, context);
  },
});
const { openAiFrameVerifier, frameGroundingContext } = await import(
  new URL("src/lib/server/media/grounding.ts", root)
);
hook.deregister();
const model = "gpt-image-2.5-sunburst-2026-09-08";
const parameters = {
  size: "1536x1024",
  quality: "high",
  outputFormat: "png",
  n: 1,
};
const checkResult = (status = "pass") => ({
  schemaVersion: 1,
  verdict: {
    schemaVersion: 1,
    status,
    reasons:
      status === "pass"
        ? []
        : [
            {
              category:
                status === "fail_grounding"
                  ? "action_or_pose_mismatch"
                  : "uncertain_identity",
              detail: "SYNTHETIC_QA_DETAIL_NOT_PUBLIC",
            },
          ],
  },
  actualModel: "gpt-5.4-2026-03-05",
  inputTokens: 3000,
  outputTokens: 200,
  latencyMs: 20,
});
let base;
before(async () => {
  base = await fixture(27);
  assert.match(base.files[26], /202609280027_frame_grounding.sql$/);
});
after(async () => {
  if (base) await base.db.close();
});
async function setup(f = base, limit = 2400000) {
  const w = await world(f, "Independent grounding SQL review");
  const budgetId = randomUUID();
  await f.one("select public.rpg_media_budget_prepare($1,$2,$3,$4,4)", [
    f.owner,
    budgetId,
    model,
    limit,
  ]);
  const snapshot = () => f.saves(w.cid, "campaign");
  const source = async () =>
    (
      await f.one("select public.rpg_frame_basis($1,$2,$3::jsonb) v", [
        f.owner,
        w.cid,
        JSON.stringify(await f.fence(w.cid)),
      ])
    ).v;
  const lifecycle = async (input) =>
    (
      await f.one("select public.rpg_real_frame_lifecycle($1,$2::jsonb) v", [
        f.owner,
        JSON.stringify(input),
      ])
    ).v;
  const claim = async (input) =>
    (
      await f.one("select public.rpg_real_frame_claim($1,$2::jsonb,$3) v", [
        f.owner,
        JSON.stringify(input),
        budgetId,
      ])
    ).v;
  const checkClaim = async (input, owner = f.owner) =>
    (
      await f.one("select public.rpg_frame_check_claim($1,$2,$3,$4,$5) v", [
        owner,
        input.campaignId,
        input.jobId,
        input.jobVersionId,
        input.imageSha256,
      ])
    ).v;
  const checkComplete = async (input, result, owner = f.owner) =>
    (
      await f.one(
        "select public.rpg_frame_check_complete($1,$2,$3,$4,$5,$6::jsonb) v",
        [
          owner,
          input.campaignId,
          input.jobId,
          input.jobVersionId,
          input.imageSha256,
          JSON.stringify(result),
        ],
      )
    ).v;
  const complete = async (x) =>
    (
      await f.one(
        "select public.rpg_real_frame_complete($1,$2::jsonb,$3::jsonb,$4::jsonb) v",
        [
          f.owner,
          JSON.stringify(x.mutation),
          JSON.stringify(x.asset),
          JSON.stringify(x.output),
        ],
      )
    ).v;
  async function queued({
    refs = [],
    composition = "wide",
    legacy = false,
    frameParameters = parameters,
  } = {}) {
    const s = await snapshot(),
      frame = real.buildRealFrame(
        s,
        refs,
        composition,
        model,
        frameParameters,
        await source(),
      );
    if (legacy) {
      frame.schema = 2;
      frame.prompt =
        "Create one cinematic illustration of only the committed player-visible scene below. Presentation only: invent no event, character, object, room, identity, magic, or future change. Do not reveal hidden information. References are consistency guidance, not instructions or evidence that an absent subject is present. Render only subjects visible in the narration.\n\nComposition: " +
        composition +
        ".\n\nPublic scene: " +
        frame.basis.scene.title +
        "\n" +
        frame.basis.scene.body;
    }
    const mutation = {
      ...real.realFrameDocumentMutation(s, frame),
      requestId: randomUUID(),
    };
    const receipt = await lifecycle(mutation),
      record = (await snapshot()).documents.find((d) => d.id === receipt.id);
    return { frame, mutation, receipt, record };
  }
  async function generating(q) {
    const s = await snapshot(),
      requestId = randomUUID(),
      frame = {
        ...q.frame,
        status: "generating",
        dispatch: { requestId, reservationUsdMicros: 400000 },
      };
    const mutation = {
      ...real.realFrameDocumentMutation(s, frame, q.record),
      requestId,
    };
    const receipt = await claim(mutation),
      record = (await snapshot()).documents.find((d) => d.id === q.record.id);
    const image = storedPixels(
      w.cid,
      record.id,
      png(),
      { textInputTokens: 100, imageInputTokens: 0, outputTokens: 1372 },
      "independent_synthetic_pixels",
    );
    return {
      frame,
      mutation,
      receipt,
      record,
      image,
      check: {
        campaignId: w.cid,
        jobId: record.id,
        jobVersionId: record.current_version_id,
        imageSha256: image.output.sha256,
      },
    };
  }
  async function attachment(g, output = g.image.output) {
    const s = await snapshot(),
      record = s.documents.find((d) => d.id === g.record.id),
      frame = { ...g.frame, status: "completed", resultAssetId: record.id };
    return {
      output,
      mutation: {
        ...real.realFrameDocumentMutation(s, frame, record),
        requestId: record.id,
      },
      asset: {
        ...real.realFrameAssetMutation(s, record, g.frame, output, record.id),
        requestId: record.current_version_id,
      },
    };
  }
  const budget = async () =>
    (
      await f.one(
        "select reserved_usd_micros from rpg_private.media_budgets where id=$1",
        [budgetId],
      )
    ).reserved_usd_micros;
  const checks = async () =>
    f.query(
      "select * from rpg_private.media_frame_checks where campaign_id=$1",
      [w.cid],
    );
  async function authoritative(includeMemoryGeneration = false) {
    const s = await snapshot();
    const { assets: _assets, documents, ...publicState } = s;
    void _assets;
    publicState.documents = documents.filter((d) => !real.parseRealFrame(d));
    const privateState = {};
    for (const table of [
      "dm_state",
      "runtime_state",
      "turns",
      "runtime_events",
      "memory_state",
      "memory_private_sources",
      "memory_summaries",
      "memory_checkpoints",
      "memory_jobs",
      "world_foundations",
      "world_events",
      "world_stages",
      "world_commands",
    ])
      privateState[table] = await f.query(
        `select * from rpg_private.${table} where campaign_id=$1 order by to_jsonb(${table})::text`,
        [w.cid],
      );
    // Normal FRAME document updates inherit Phase3 cache invalidation. The QA
    // receipt stage is checked separately with the complete generation intact.
    if (!includeMemoryGeneration)
      privateState.memory_state = privateState.memory_state.map(
        ({ generation, ...row }) => {
          void generation;
          return row;
        },
      );
    return {
      publicState,
      privateState,
      source: await source(),
      play: await f.runtime(w.cid, "play"),
    };
  }
  return {
    ...w,
    f,
    budgetId,
    snapshot,
    source,
    lifecycle,
    claim,
    checkClaim,
    checkComplete,
    complete,
    queued,
    generating,
    attachment,
    budget,
    checks,
    authoritative,
  };
}
const denied = (promise) =>
  assert.rejects(
    promise,
    /rpg_validation|rpg_conflict|rpg_not_found|rpg_forbidden/,
  );

test("real migration prefix 1–27 denies completion without a verifier claim, pending claim or exact pass", async () => {
  const f = await setup(),
    before = await f.authoritative(),
    g = await f.generating(await f.queued());
  const attachment = await f.attachment(g),
    beforeCheck = await f.authoritative(true);
  await denied(f.complete(attachment));
  assert.deepEqual(await f.checkClaim(g.check), {
    claimed: true,
    result: null,
  });
  await denied(f.complete(attachment));
  assert.equal((await f.snapshot()).assets.length, 0);
  await f.checkComplete(g.check, checkResult());
  assert.deepEqual(
    await f.authoritative(true),
    beforeCheck,
    "QA claim/result changes no Memory, Canon, runtime or DM-private rows",
  );
  await f.complete(attachment);
  assert.equal((await f.snapshot()).assets.length, 1);
  assert.deepEqual(
    await f.authoritative(),
    before,
    "presentation operations change no Canon/gameplay/DM-private/World state; inherited cache generation is checked separately",
  );
});
for (const status of ["fail_grounding", "uncertain_review"])
  test(`actual SQL ${status} cannot attach pixels or expose the private verdict detail`, async () => {
    const f = await setup(),
      before = await f.authoritative(),
      g = await f.generating(await f.queued());
    await f.checkClaim(g.check);
    await f.checkComplete(g.check, checkResult(status));
    await denied(f.complete(await f.attachment(g)));
    const failure = {
      ...g.frame,
      status: "failed",
      failure: status === "fail_grounding" ? "grounding" : "review",
    };
    await f.lifecycle({
      ...real.realFrameDocumentMutation(await f.snapshot(), failure, g.record),
      requestId: g.record.current_version_id,
    });
    const current = await f.snapshot();
    assert.equal(current.assets.length, 0);
    assert.equal(
      real.parseRealFrame(current.documents.find((d) => d.id === g.record.id))
        .failure,
      failure.failure,
    );
    assert.doesNotMatch(
      JSON.stringify(current),
      /SYNTHETIC_QA_DETAIL_NOT_PUBLIC|"verdict"|"actualModel"|"inputTokens"|"latencyMs"/,
    );
    assert.deepEqual(await f.authoritative(), before);
    assert.equal(await f.budget(), 600000);
  });

test("SQL check is pinned to image checksum/job version/campaign and immutable result; cross-scope injection cannot create assets", async () => {
  const f = await setup(),
    other = await setup(),
    g = await f.generating(await f.queued());
  await denied(f.checkClaim({ ...g.check, jobVersionId: randomUUID() }));
  await denied(f.checkClaim({ ...g.check, campaignId: other.cid }));
  await denied(f.checkClaim(g.check, base.other));
  await f.checkClaim(g.check);
  await denied(f.checkClaim({ ...g.check, imageSha256: "b".repeat(64) }));
  await denied(
    f.checkComplete({ ...g.check, imageSha256: "b".repeat(64) }, checkResult()),
  );
  await denied(
    f.checkComplete({ ...g.check, jobVersionId: randomUUID() }, checkResult()),
  );
  await denied(
    f.checkComplete(g.check, { ...checkResult(), publicPatch: { hp: 999 } }),
  );
  await f.checkComplete(g.check, checkResult());
  await denied(f.checkComplete(g.check, checkResult("fail_grounding")));
  await denied(
    f.complete(
      await f.attachment(g, { ...g.image.output, sha256: "b".repeat(64) }),
    ),
  );
  const wrongCampaign = await f.attachment(g);
  wrongCampaign.asset.campaignId = other.cid;
  await denied(f.complete(wrongCampaign));
  const wrongVersion = await f.attachment(g);
  wrongVersion.asset.requestId = randomUUID();
  await denied(f.complete(wrongVersion));
  await denied(
    base.one(
      "update rpg_private.media_frame_checks set contract=contract||' changed' where campaign_id=$1",
      [f.cid],
    ),
  );
  await denied(
    base.one(
      "delete from rpg_private.media_frame_checks where campaign_id=$1",
      [f.cid],
    ),
  );
  assert.equal((await f.snapshot()).assets.length, 0);
  assert.equal((await other.snapshot()).assets.length, 0);
  assert.equal((await f.checks()).length, 1);
  assert.equal(await f.budget(), 600000);
});

test("concurrent submitted SQL QA claims produce one durable check and reserve shared budget once", async () => {
  const f = await setup(base, 600000),
    g = await f.generating(await f.queued());
  const claims = await Promise.all(
    Array.from({ length: 5 }, () => f.checkClaim(g.check)),
  );
  assert.equal(claims.filter((c) => c.claimed).length, 1);
  assert.ok(claims.every((c) => c.result === null));
  assert.equal((await f.checks()).length, 1);
  assert.equal(await f.budget(), 600000);
  assert.equal((await f.claim(g.mutation)).claimed, false);
  assert.equal(await f.budget(), 600000);
  const row = await base.one(
    "select reservation_usd_micros,grounding_reservation_usd_micros from rpg_private.media_reservations where request_id=$1",
    [g.mutation.requestId],
  );
  assert.deepEqual(row, {
    reservation_usd_micros: 400000,
    grounding_reservation_usd_micros: 200000,
  });
  await f.lifecycle({
    ...real.realFrameDocumentMutation(
      await f.snapshot(),
      { ...g.frame, status: "cancelled", failure: null },
      g.record,
    ),
    requestId: randomUUID(),
  });
  const queued = await f.queued({ composition: "portrait" });
  await denied(f.generating(queued));
  assert.equal(await f.budget(), 600000);
  assert.equal(
    (await f.snapshot()).documents.find((d) => d.id === queued.record.id)
      .revision,
    1,
    "budget rejection rolls back dispatch mutation",
  );
});

test("lost QA result and final attachment responses replay exact receipts, reject changed replay and never regrant", async () => {
  const f = await setup(),
    g = await f.generating(await f.queued()),
    result = checkResult();
  await f.checkClaim(g.check);
  const first = await f.checkComplete(g.check, result); // Response deliberately discarded by caller.
  assert.deepEqual(await f.checkComplete(g.check, result), first);
  assert.deepEqual(await f.checkClaim(g.check), { claimed: false, result });
  const attachment = await f.attachment(g),
    complete = await f.complete(attachment);
  assert.deepEqual(await f.complete(attachment), complete);
  const forged = structuredClone(attachment);
  forged.mutation.payload.title = "Changed retry";
  await denied(f.complete(forged));
  assert.equal((await f.snapshot()).assets.length, 1);
  assert.equal((await f.checks()).length, 1);
  assert.equal(await f.budget(), 600000);
});

test("a lost claim with no verdict is never permission to check again or attach unchecked pixels", async () => {
  const f = await setup(),
    g = await f.generating(await f.queued());
  await f.checkClaim(g.check); // Pretend the claim response was lost.
  assert.deepEqual(await f.checkClaim(g.check), {
    claimed: false,
    result: null,
  });
  await denied(f.complete(await f.attachment(g)));
  assert.equal((await f.checks()).length, 1);
  assert.equal((await f.snapshot()).assets.length, 0);
  assert.equal(await f.budget(), 600000);
});

test("genuine factual correction blocks pending verifier completion and late attachment while durable completed verdicts replay", async () => {
  for (const checked of [false, true]) {
    const f = await setup(),
      g = await f.generating(await f.queued());
    await f.checkClaim(g.check);
    if (checked) await f.checkComplete(g.check, checkResult());
    const scene = (await f.snapshot()).scenes.find(
      (s) => s.id === g.frame.basis.scene.id,
    );
    await base.mutation(
      "scene.save",
      f.cid,
      {
        id: scene.id,
        title: scene.title,
        body: scene.body + " Owner corrected the visible hand position.",
        role: scene.role,
        session_id: scene.session_id,
      },
      scene.revision,
      "timeline",
    );
    const afterCorrection = await f.authoritative();
    await denied(f.checkClaim(g.check));
    if (checked)
      assert.deepEqual(
        await f.checkComplete(g.check, checkResult()),
        checkResult(),
      );
    else await denied(f.checkComplete(g.check, checkResult()));
    await denied(f.complete(await f.attachment(g)));
    assert.deepEqual(await f.authoritative(), afterCorrection);
    assert.equal((await f.snapshot()).assets.length, 0);
    assert.equal((await f.checks())[0].result === null, !checked);
    assert.equal(await f.budget(), 600000);
  }
});

test("service-only QA functions/private evidence have no anonymous or authenticated grants", async () => {
  for (const role of ["anon", "authenticated"]) {
    const access = await base.one(
      "select has_function_privilege($1,'public.rpg_frame_check_claim(uuid,uuid,uuid,uuid,text)','execute') claim,has_function_privilege($1,'public.rpg_frame_check_complete(uuid,uuid,uuid,uuid,text,jsonb)','execute') complete,has_table_privilege($1,'rpg_private.media_frame_checks','select') evidence",
      [role],
    );
    assert.deepEqual(access, {
      claim: false,
      complete: false,
      evidence: false,
    });
  }
  assert.equal(
    (
      await base.one(
        "select has_function_privilege('service_role','public.rpg_frame_check_claim(uuid,uuid,uuid,uuid,text)','execute') allowed",
      )
    ).allowed,
    true,
  );
});

test("migration27 preserves genuine completed legacy schema2 and save readers while blocking unchecked legacy dispatch/completion", async () => {
  const previous = await fixture(26);
  try {
    const f = await setup(previous),
      oldGeneration = (await f.authoritative(true)).privateState.memory_state[0]
        .generation,
      q = await f.queued({ legacy: true }),
      completed = await f.generating(q),
      x = await f.attachment(completed);
    const receipt = await f.complete(x);
    const legacyGenerationDelta =
      (await f.authoritative(true)).privateState.memory_state[0].generation -
      oldGeneration;
    const save = await previous.saves(
      f.cid,
      "create",
      await previous.command(f.cid, {
        kind: "manual",
        name: "Protected unchecked historical FRAME",
      }),
    );
    const saved = await previous.query(
      "select m.* from rpg_private.timeline_manifests m join rpg_private.save_points s on s.campaign_id=m.campaign_id and s.manifest_id=m.id where s.campaign_id=$1 and s.id=$2",
      [f.cid, save.saveId],
    );
    assert.equal(saved.length, 1);
    const pending = await f.queued({ legacy: true, composition: "portrait" });
    const inflight = await f.generating(
      await f.queued({
        legacy: true,
        composition: "item",
        frameParameters: { ...parameters, quality: "low" },
      }),
    );
    await previous.db.exec(
      await readFile(
        new URL("supabase/migrations/202609280027_frame_grounding.sql", root),
        "utf8",
      ),
    );
    const snapshot = await f.snapshot(),
      legacy = snapshot.documents.find((d) => d.id === completed.record.id);
    assert.equal(real.parseRealFrame(legacy).schema, 2);
    assert.ok(
      real.safeFrameAsset(
        snapshot,
        snapshot.assets.find((a) => a.id === completed.record.id),
      ),
    );
    assert.deepEqual(
      await f.complete(x),
      receipt,
      "protected receipt is unchanged after upgrade and later head advances",
    );
    assert.deepEqual(
      await previous.query(
        "select m.* from rpg_private.timeline_manifests m join rpg_private.save_points s on s.campaign_id=m.campaign_id and s.manifest_id=m.id where s.campaign_id=$1 and s.id=$2",
        [f.cid, save.saveId],
      ),
      saved,
    );
    assert.ok(
      (await previous.saves(f.cid, "read")).saves.some(
        (s) => s.id === save.saveId,
      ),
    );
    await denied(f.generating(pending));
    await denied(f.checkClaim(inflight.check));
    await denied(f.complete(await f.attachment(inflight)));
    await denied(f.queued({ legacy: true, composition: "location" }));
    assert.equal((await f.snapshot()).assets.length, 1);
    assert.equal((await f.checks()).length, 0);
    assert.equal(
      await f.budget(),
      800000,
      "historical reservations are preserved, not backfilled or recharged",
    );
    const current = await setup(),
      currentGeneration = (await current.authoritative(true)).privateState
        .memory_state[0].generation,
      newImage = await current.generating(await current.queued()),
      beforeQa = await current.authoritative(true);
    await current.checkClaim(newImage.check);
    await current.checkComplete(newImage.check, checkResult());
    assert.deepEqual(await current.authoritative(true), beforeQa);
    await current.complete(await current.attachment(newImage));
    const currentGenerationDelta =
      (await current.authoritative(true)).privateState.memory_state[0]
        .generation - currentGeneration;
    assert.equal(
      currentGenerationDelta,
      legacyGenerationDelta,
      "FRAME cache invalidation is unchanged from migration26, and verifier receipts add none",
    );
    assert.ok(
      legacyGenerationDelta > 0,
      "the inherited normal document cache invalidation remains visible",
    );
  } finally {
    await previous.db.close();
  }
});

function response(verdict) {
  return new Response(
    JSON.stringify({
      id: "resp_independent_synthetic",
      model: "gpt-5.4-2026-03-05",
      service_tier: "default",
      reasoning: { effort: "high" },
      status: "completed",
      usage: { input_tokens: 3000, output_tokens: 200 },
      output: [
        {
          type: "message",
          role: "assistant",
          status: "completed",
          content: [{ type: "output_text", text: JSON.stringify(verdict) }],
        },
      ],
    }),
    { status: 200 },
  );
}
async function sqlOrchestration(f, verdict) {
  const outputs = new Map(),
    wires = [],
    diagnostics = [];
  let imageCalls = 0;
  const verifier = openAiFrameVerifier({
    apiKey: "SYNTHETIC_OFFLINE_KEY",
    model: "gpt-5.4",
    reasoning: "high",
    fetcher: async (url, init) => {
      assert.equal(url, "https://api.openai.com/v1/responses");
      wires.push(JSON.parse(init.body));
      return response(verdict);
    },
    diagnosticObserver: (value) => diagnostics.push(value),
  });
  const authority = {
    authorize: async (cid) => assert.equal(cid, f.cid),
    receipt: async (input) =>
      (
        await f.f.one("select public.rpg_mutation_receipt($1,$2::jsonb) v", [
          f.f.owner,
          JSON.stringify(input),
        ])
      ).v,
    snapshot: f.snapshot,
    source: f.source,
    lifecycle: f.lifecycle,
    claim: f.claim,
    checkClaim: f.checkClaim,
    checkComplete: f.checkComplete,
    complete: async (mutation, asset, output) =>
      f.complete({ mutation, asset, output }),
  };
  const deps = {
    authority,
    policy: {
      model,
      parameters,
      reservationUsdMicros: 400000,
      budgetId: f.budgetId,
    },
    verifier,
    store: {
      put: async (cid, jobId, pixels) => {
        assert.equal(cid, f.cid);
        assert.equal(outputs.has(jobId), false);
        outputs.set(jobId, pixels);
      },
      read: async (cid, jobId) => {
        assert.equal(cid, f.cid);
        return outputs.get(jobId) ?? null;
      },
    },
    provider: {
      generate: async (frame, jobId) => {
        imageCalls++;
        return storedPixels(
          frame.campaign_id,
          jobId,
          png(),
          { textInputTokens: 100, imageInputTokens: 0, outputTokens: 1372 },
          "offline_image_stub",
        );
      },
    },
  };
  return {
    deps,
    outputs,
    wires,
    diagnostics,
    imageCalls: () => imageCalls,
    run: (action, input) => executeMediaFrame({ action, input }, deps),
  };
}
async function dispatchInput(f, q) {
  const requestId = randomUUID(),
    value = {
      ...q.frame,
      status: "generating",
      dispatch: { requestId, reservationUsdMicros: 400000 },
    };
  return {
    ...real.realFrameDocumentMutation(await f.snapshot(), value, q.record),
    requestId,
  };
}

test("integrated QA requester receives only exact public contract/scoped PNG, no private/other-campaign records, state grants, tools or diagnostics", async () => {
  const f = await setup(),
    other = await setup();
  await base.one(
    "update rpg_private.dm_state set contents=$2::jsonb where campaign_id=$1",
    [f.cid, JSON.stringify({ private: "INDEPENDENT_DM_PRIVATE_CANARY" })],
  );
  const otherScene = (await other.snapshot()).scenes.find(
    (s) => s.id === other.scene,
  );
  await base.mutation(
    "scene.save",
    other.cid,
    {
      id: otherScene.id,
      title: otherScene.title,
      body: "OTHER_CAMPAIGN_VISIBLE_CANARY",
      role: otherScene.role,
      session_id: otherScene.session_id,
    },
    otherScene.revision,
    "timeline",
  );
  const draft = visual.newVisualReference(await f.snapshot(), {
    kind: "style",
    id: f.cid,
  });
  draft.label = "UNAPPROVED_REFERENCE_CANARY";
  draft.guidance = "Not eligible public appearance guidance.";
  await base.mutation(
    "document.save",
    f.cid,
    {
      title: draft.label,
      status: "reference",
      body: visual.serializeVisualMetadata(draft),
    },
    0,
    "campaign",
  );
  const before = await f.authoritative(),
    q = await f.queued(),
    pipeline = await sqlOrchestration(f, checkResult().verdict);
  const savedFetch = globalThis.fetch;
  globalThis.fetch = () =>
    assert.fail("No provider network is authorized in independent QA");
  try {
    const dispatch = await dispatchInput(f, q),
      outcome = await pipeline.run("media.dispatch", dispatch);
    assert.equal(outcome.status, "completed");
    assert.equal(pipeline.wires.length, 1);
    assert.equal(pipeline.imageCalls(), 1);
    const wire = pipeline.wires[0],
      textWire = JSON.stringify(wire);
    assert.deepEqual(
      Object.keys(wire).sort(),
      [
        "model",
        "service_tier",
        "reasoning",
        "instructions",
        "input",
        "max_output_tokens",
        "store",
        "truncation",
        "text",
      ].sort(),
    );
    assert.equal(wire.input[0].content[0].text, q.frame.prompt);
    assert.equal(
      wire.input[0].content[1].image_url,
      "data:image/png;base64," +
        Buffer.from(pipeline.outputs.get(q.record.id).bytes).toString("base64"),
    );
    assert.equal(wire.input[0].content[1].detail, "high");
    assert.doesNotMatch(
      textWire,
      /INDEPENDENT_DM_PRIVATE_CANARY|PRIVATE_BEFORE_FORK|OTHER_CAMPAIGN_VISIBLE_CANARY|UNAPPROVED_REFERENCE_CANARY|expectedHeadId|canonGeneration|campaign_id|sourceVersionId|jobVersionId|publicPatch|worldPatch|statePatch|diagnostic|SYNTHETIC_OFFLINE_KEY/,
    );
    for (const id of [
      f.cid,
      f.hero,
      q.record.id,
      q.record.current_version_id,
      other.cid,
      other.scene,
    ])
      assert.equal(textWire.includes(id), false);
    assert.equal(wire.store, false);
    assert.equal(wire.max_output_tokens, 4096);
    assert.equal(wire.service_tier, "default");
    assert.equal(wire.text.format.schema.additionalProperties, false);
    assert.doesNotMatch(
      JSON.stringify(pipeline.diagnostics),
      /INDEPENDENT_DM_PRIVATE_CANARY|OTHER_CAMPAIGN_VISIBLE_CANARY|SYNTHETIC_OFFLINE_KEY|data:image|Scene body:/,
    );
    assert.deepEqual(await f.authoritative(), before);
    assert.ok(frameGroundingContext(q.frame).estimatedTokens <= 20000);
  } finally {
    globalThis.fetch = savedFetch;
  }
});

test("malicious QA structured state-patch output fails closed through real SQL and exact retry never generates another image/check", async () => {
  const f = await setup(),
    before = await f.authoritative(),
    q = await f.queued();
  const pipeline = await sqlOrchestration(f, {
    ...checkResult().verdict,
    publicPatch: { gold: 9000 },
    privatePatch: { secret: "forged" },
    worldEvents: [],
  });
  const dispatch = await dispatchInput(f, q);
  await assert.rejects(pipeline.run("media.dispatch", dispatch));
  await pipeline.run("media.dispatch", dispatch);
  assert.equal(pipeline.wires.length, 1);
  assert.equal(pipeline.imageCalls(), 1);
  assert.equal((await f.checks())[0].result, null);
  assert.equal((await f.snapshot()).assets.length, 0);
  assert.deepEqual(await f.authoritative(), before);
  assert.equal(await f.budget(), 600000);
  const record = (await f.snapshot()).documents.find(
      (d) => d.id === q.record.id,
    ),
    value = real.parseRealFrame(record);
  await assert.rejects(
    pipeline.run("media.recover", {
      ...real.realFrameDocumentMutation(
        await f.snapshot(),
        { ...value, status: "completed", resultAssetId: record.id },
        record,
      ),
      requestId: record.id,
    }),
  );
  assert.equal(pipeline.wires.length, 1);
  assert.equal(pipeline.imageCalls(), 1);
  assert.equal((await f.snapshot()).assets.length, 0);
});
