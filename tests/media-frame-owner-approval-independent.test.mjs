import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { pathToFileURL, fileURLToPath } from "node:url";
import { registerHooks } from "node:module";

// Read actual integrated production and migrations, not the worker's old copy.
// No credentials, hosted database, network, or provider dispatch are involved.
const root = process.env.FRAME_APPROVAL_REVIEW_ROOT
  ? pathToFileURL(
      process.env.FRAME_APPROVAL_REVIEW_ROOT.replaceAll("\\", "/").replace(
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
const { closedWorldFramePrompt } = await import(
  new URL("src/lib/visual-frame/closed-world.ts", root)
);
const { parseFrameSafetyVerdict } = await import(
  new URL("src/lib/visual-frame/illustration-review.ts", root)
);
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
const checkResult = (status = "safe_to_review") => ({
  schemaVersion: 2,
  verdict: {
    schemaVersion: 2,
    status,
    reasons:
      status === "safe_to_review"
        ? []
        : [
            {
              category:
                status === "hard_reject"
                  ? "major_subject"
                  : "illustrative_variation",
              detail: "SYNTHETIC_QA_DETAIL_NOT_PUBLIC",
            },
          ],
  },
  actualModel: "gpt-5.4-2026-03-05",
  inputTokens: 3000,
  outputTokens: 200,
  latencyMs: 20,
});
const legacyCheckResult = () => ({
  ...checkResult(),
  schemaVersion: 1,
  verdict: { schemaVersion: 1, status: "pass", reasons: [] },
});

let base;
const savedFetch = globalThis.fetch;
before(async () => {
  globalThis.fetch = () =>
    assert.fail("Independent approval QA must never contact a provider");
  try {
    base = await fixture();
  } catch (error) {
    // Keep a shared migration failure readable; PGlite's raw error also embeds
    // the complete public SQL text in every failed hook-dependent test.
    throw new Error(
      `Disposable migration setup failed (${error.code}, position ${error.position}): ${error.message}`,
    );
  }
  assert.ok(
    base.files.length >= 28,
    "Owner approval migration must be present",
  );
});
after(async () => {
  globalThis.fetch = savedFetch;
  if (base) await base.db.close();
});

async function setup(f = base, limit = 4800000, existing = undefined) {
  const w = existing ?? (await world(f, "Independent FRAME owner approval"));
  const budgetId = randomUUID();
  await f.one("select public.rpg_media_budget_prepare($1,$2,$3,$4,8)", [
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
  const receipt = async (input) =>
    (
      await f.one("select public.rpg_mutation_receipt($1,$2::jsonb) v", [
        f.owner,
        JSON.stringify(input),
      ])
    ).v;
  const lifecycle = async (input, owner = f.owner) =>
    (
      await f.one("select public.rpg_real_frame_lifecycle($1,$2::jsonb) v", [
        owner,
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
  const draft = async (input, output, owner = f.owner) =>
    (
      await f.one(
        "select public.rpg_real_frame_draft($1,$2::jsonb,$3::jsonb) v",
        [owner, JSON.stringify(input), JSON.stringify(output)],
      )
    ).v;
  const recoveryReceipt = async (input, owner = f.owner) =>
    (
      await f.one(
        "select public.rpg_real_frame_recovery_receipt($1,$2::jsonb) v",
        [owner, JSON.stringify(input)],
      )
    ).v;
  const draftPixels = async (jobId, cid = w.cid, owner = f.owner) =>
    (
      await f.one("select public.rpg_frame_draft_pixels($1,$2,$3) v", [
        owner,
        cid,
        jobId,
      ])
    ).v;
  const complete = async (input, asset, output, owner = f.owner) =>
    (
      await f.one(
        "select public.rpg_real_frame_complete($1,$2::jsonb,$3::jsonb,$4::jsonb) v",
        [
          owner,
          JSON.stringify(input),
          JSON.stringify(asset),
          JSON.stringify(output),
        ],
      )
    ).v;
  async function record(id) {
    return (await snapshot()).documents.find((d) => d.id === id);
  }
  async function mutation(id, patch, requestId = randomUUID()) {
    const s = await snapshot(),
      d = s.documents.find((row) => row.id === id),
      value = real.parseRealFrame(d);
    assert.ok(value);
    return {
      ...real.realFrameDocumentMutation(s, { ...value, ...patch }, d),
      requestId,
    };
  }
  async function queue({
    refs = [],
    composition = "wide",
    retryOf = null,
    legacy = null,
  } = {}) {
    const s = await snapshot(),
      frame = real.buildRealFrame(
        s,
        refs,
        composition,
        model,
        parameters,
        await source(),
        retryOf,
      );
    if (legacy) {
      frame.schema = legacy;
      delete frame.review;
      frame.prompt =
        legacy === 2
          ? real.legacyRealFramePrompt(frame.basis.scene, [], composition)
          : closedWorldFramePrompt(frame.basis.scene, [], composition);
    }
    const input = {
      ...real.realFrameDocumentMutation(s, frame),
      requestId: randomUUID(),
    };
    const result = await lifecycle(input);
    return { input, result, frame, record: await record(result.id) };
  }
  async function generating(q) {
    const requestId = randomUUID(),
      input = await mutation(
        q.record.id,
        {
          status: "generating",
          dispatch: { requestId, reservationUsdMicros: 400000 },
        },
        requestId,
      );
    const result = await claim(input),
      d = await record(q.record.id),
      frame = real.parseRealFrame(d),
      pixels = storedPixels(
        w.cid,
        d.id,
        png(),
        { textInputTokens: 100, imageInputTokens: 0, outputTokens: 1372 },
        "independent_approval_synthetic",
      );
    return {
      input,
      result,
      frame,
      record: d,
      pixels,
      check: {
        campaignId: w.cid,
        jobId: d.id,
        jobVersionId: d.current_version_id,
        imageSha256: pixels.output.sha256,
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
      "select * from rpg_private.media_frame_checks where campaign_id=$1 order by job_id",
      [w.cid],
    );
  async function authoritative(includeMemoryGeneration = false) {
    const s = await snapshot(),
      { assets: _assets, documents, ...publicState } = s;
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
    // Existing FRAME document bookkeeping advances the Memory cache generation;
    // dedicated QA-receipt checks compare the complete generation without this.
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
    receipt,
    lifecycle,
    claim,
    checkClaim,
    checkComplete,
    draft,
    recoveryReceipt,
    draftPixels,
    complete,
    record,
    mutation,
    queue,
    generating,
    budget,
    checks,
    authoritative,
  };
}

const denied = (promise) =>
  assert.rejects(
    promise,
    /rpg_validation|rpg_conflict|rpg_not_found|rpg_forbidden|validation|conflict|not_found|unavailable/,
  );

function response(verdict) {
  return new Response(
    JSON.stringify({
      id: "resp_independent_approval_synthetic",
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
function pipeline(f, verdict = checkResult().verdict) {
  const outputs = new Map(),
    wires = [],
    imageInputs = [],
    diagnostics = [];
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
    receipt: f.receipt,
    snapshot: f.snapshot,
    source: f.source,
    lifecycle: f.lifecycle,
    claim: f.claim,
    checkClaim: f.checkClaim,
    checkComplete: f.checkComplete,
    draft: f.draft,
    recoveryReceipt: f.recoveryReceipt,
    complete: f.complete,
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
        assert.equal(outputs.has(jobId), false, "Output is immutable");
        outputs.set(jobId, pixels);
      },
      read: async (cid, jobId) => {
        assert.equal(cid, f.cid);
        return outputs.get(jobId) ?? null;
      },
    },
    provider: {
      generate: async (frame, jobId) => {
        imageInputs.push(structuredClone(frame));
        return storedPixels(
          frame.campaign_id,
          jobId,
          png(),
          { textInputTokens: 100, imageInputTokens: 0, outputTokens: 1372 },
          "independent_approval_image_stub",
        );
      },
    },
  };
  return {
    deps,
    outputs,
    wires,
    imageInputs,
    diagnostics,
    run: (action, input) => executeMediaFrame({ action, input }, deps),
  };
}
async function dispatchInput(f, q) {
  const requestId = randomUUID();
  return f.mutation(
    q.record.id,
    {
      status: "generating",
      dispatch: { requestId, reservationUsdMicros: 400000 },
    },
    requestId,
  );
}
const acceptInput = (f, jobId) =>
  f.mutation(jobId, { status: "completed", resultAssetId: jobId });
const discardInput = (f, jobId) => f.mutation(jobId, { status: "discarded" });

for (const status of ["safe_to_review", "review_warning"])
  test(`real SQL ${status} produces only a draft until explicit owner acceptance`, async () => {
    const f = await setup(),
      before = await f.authoritative(),
      q = await f.queue(),
      p = pipeline(f, checkResult(status).verdict),
      dispatch = await dispatchInput(f, q),
      generated = await p.run("media.dispatch", dispatch);
    assert.equal(generated.status, "draft");
    const snapshot = await f.snapshot(),
      d = await f.record(q.record.id),
      frame = real.parseRealFrame(d);
    assert.equal(frame.schema, 4);
    assert.equal(frame.status, "draft");
    assert.deepEqual(frame.review, {
      status,
      imageSha256: p.outputs.get(d.id).output.sha256,
    });
    assert.equal(frame.resultAssetId, null);
    assert.equal(snapshot.assets.length, 0);
    assert.deepEqual(await f.authoritative(), before);
    assert.doesNotMatch(
      JSON.stringify(snapshot),
      /SYNTHETIC_QA_DETAIL_NOT_PUBLIC/,
    );
    const acceptance = await acceptInput(f, d.id),
      accepted = await p.run("media.accept", acceptance);
    assert.equal(accepted.status, "completed");
    const completed = await f.snapshot(),
      asset = completed.assets.find((a) => a.id === d.id);
    assert.equal(completed.assets.length, 1);
    assert.ok(real.safeFrameAsset(completed, asset));
    assert.equal(real.parseRealFrame(await f.record(d.id)).resultAssetId, d.id);
    assert.equal(p.imageInputs.length, 1);
    assert.equal(p.wires.length, 1);
    assert.equal(await f.budget(), 600000);
    assert.deepEqual(await f.authoritative(), before);
  });

test("discard retains exact output and history, preserves accepted art, and regenerate is an explicit new reservation", async () => {
  const f = await setup(),
    before = await f.authoritative(),
    p = pipeline(f),
    first = await f.queue();
  await p.run("media.dispatch", await dispatchInput(f, first));
  await p.run("media.accept", await acceptInput(f, first.record.id));
  const originalAsset = structuredClone((await f.snapshot()).assets[0]);
  const second = await f.queue({ retryOf: first.record.id });
  await p.run("media.dispatch", await dispatchInput(f, second));
  assert.deepEqual((await f.snapshot()).assets, [originalAsset]);
  const retained = structuredClone(p.outputs.get(second.record.id)),
    discard = await discardInput(f, second.record.id),
    receipt = await p.run("media.discard", discard);
  assert.equal(receipt.status, "discarded");
  assert.deepEqual(await p.run("media.discard", discard), receipt);
  assert.deepEqual(p.outputs.get(second.record.id), retained);
  assert.deepEqual((await f.snapshot()).assets, [originalAsset]);
  await denied(p.run("media.accept", await acceptInput(f, second.record.id)));
  assert.equal(p.imageInputs.length, 2);
  assert.equal(p.wires.length, 2);
  const third = await f.queue({ retryOf: second.record.id });
  assert.equal(p.imageInputs.length, 2, "Queued regeneration is not dispatch");
  assert.equal(await f.budget(), 1200000);
  await p.run("media.dispatch", await dispatchInput(f, third));
  assert.equal(p.imageInputs.length, 3);
  assert.equal(p.wires.length, 3);
  assert.equal(await f.budget(), 1800000);
  assert.deepEqual((await f.snapshot()).assets, [originalAsset]);
  const versions = await f.f.query(
    "select body from public.rpg_document_versions where campaign_id=$1 and document_id=$2 order by version",
    [f.cid, second.record.id],
  );
  assert.ok(versions.length >= 4);
  assert.ok(versions.some((v) => real.parseRealFrame(v)?.status === "draft"));
  assert.ok(
    versions.some((v) => real.parseRealFrame(v)?.status === "discarded"),
  );
  assert.deepEqual(await f.authoritative(), before);
});

async function draftInput(f, g, status = "safe_to_review") {
  return f.mutation(
    g.record.id,
    {
      status: "draft",
      review: { status, imageSha256: g.pixels.output.sha256 },
    },
    g.record.id,
  );
}
async function attachment(f, jobId, output, requestId = randomUUID()) {
  const snapshot = await f.snapshot(),
    record = snapshot.documents.find((d) => d.id === jobId),
    value = real.parseRealFrame(record),
    mutation = {
      ...real.realFrameDocumentMutation(
        snapshot,
        { ...value, status: "completed", resultAssetId: jobId },
        record,
      ),
      requestId,
    },
    asset = {
      ...real.realFrameAssetMutation(
        snapshot,
        record,
        value,
        output,
        jobId,
        requestId,
      ),
      requestId: record.current_version_id,
    };
  return { mutation, asset, output };
}

test("SQL rejects automatic attachment, unchecked drafts, spoofed verdicts, review hashes and foreign outputs", async () => {
  const f = await setup(),
    other = await setup(),
    g = await f.generating(await f.queue()),
    before = await f.authoritative(true),
    intent = await draftInput(f, g),
    unchecked = await attachment(f, g.record.id, g.pixels.output);
  await denied(f.draft(intent, g.pixels.output));
  await denied(
    f.complete(unchecked.mutation, unchecked.asset, unchecked.output),
  );
  await denied(f.checkClaim({ ...g.check, campaignId: other.cid }));
  await denied(f.checkClaim(g.check, f.f.other));
  await f.checkClaim(g.check);
  await denied(
    f.checkComplete(g.check, { ...checkResult(), publicPatch: { hp: 999 } }),
  );
  await denied(
    f.checkComplete(g.check, {
      ...checkResult(),
      verdict: { ...checkResult().verdict, privatePatch: { secret: "forged" } },
    }),
  );
  await denied(f.checkComplete(g.check, legacyCheckResult()));
  await denied(
    f.checkComplete({ ...g.check, imageSha256: "b".repeat(64) }, checkResult()),
  );
  await denied(
    f.checkComplete({ ...g.check, jobVersionId: randomUUID() }, checkResult()),
  );
  await denied(f.checkComplete(g.check, checkResult(), f.f.other));
  await f.checkComplete(g.check, checkResult());
  assert.deepEqual(await f.authoritative(true), before);
  await denied(
    f.complete(unchecked.mutation, unchecked.asset, unchecked.output),
  );
  const wrongReview = structuredClone(intent),
    body = real.parseRealFrame(wrongReview.payload);
  body.review.imageSha256 = "b".repeat(64);
  wrongReview.payload.body = visual.VISUAL_FRAME_PREFIX + JSON.stringify(body);
  await denied(f.draft(wrongReview, g.pixels.output));
  await denied(f.draft(intent, { ...g.pixels.output, sha256: "b".repeat(64) }));
  await denied(
    f.draft(intent, {
      ...g.pixels.output,
      storagePath: `${other.cid}/frames/${g.record.id}/output.png`,
    }),
  );
  await denied(f.draft(intent, g.pixels.output, f.f.other));
  await f.draft(intent, g.pixels.output);
  assert.equal((await f.snapshot()).assets.length, 0);
  const accepted = await attachment(f, g.record.id, g.pixels.output),
    crossCampaign = structuredClone(accepted.asset);
  crossCampaign.campaignId = other.cid;
  await denied(f.complete(accepted.mutation, crossCampaign, accepted.output));
  const changedOutput = { ...accepted.output, sha256: "c".repeat(64) };
  await denied(f.complete(accepted.mutation, accepted.asset, changedOutput));
  const forgedAsset = structuredClone(accepted.asset);
  forgedAsset.requestId = randomUUID();
  await denied(f.complete(accepted.mutation, forgedAsset, accepted.output));
  await denied(f.lifecycle(accepted.mutation));
  assert.equal((await f.snapshot()).assets.length, 0);
  assert.equal((await other.snapshot()).assets.length, 0);
  assert.equal(await f.budget(), 600000);
});

test("material or spoiler categories cannot be laundered into an owner-acceptable warning", async () => {
  const f = await setup(),
    g = await f.generating(await f.queue());
  await f.checkClaim(g.check);
  for (const category of [
    "hidden_or_future",
    "major_subject",
    "identity",
    "missing_subject",
    "central_unsupported",
    "location",
    "essential_action",
    "prohibited_text",
    "unsafe_content",
  ]) {
    const result = checkResult("review_warning");
    result.verdict.reasons[0].category = category;
    assert.equal(parseFrameSafetyVerdict(result.verdict), null, category);
    await denied(f.checkComplete(g.check, result));
  }
  assert.equal((await f.checks())[0].result, null);
  assert.equal((await f.snapshot()).assets.length, 0);
});

test("duplicate draft/accept and lost completed responses replay exact receipts without image or QA redispatch", async () => {
  const f = await setup(),
    q = await f.queue(),
    p = pipeline(f),
    dispatch = await dispatchInput(f, q);
  await p.run("media.dispatch", dispatch);
  const draftRecord = await f.record(q.record.id),
    qa = (await f.checks())[0],
    qaResult = structuredClone(qa.result);
  assert.equal(qa.draft_version_id, draftRecord.current_version_id);
  assert.deepEqual(
    await f.checkComplete(
      {
        campaignId: f.cid,
        jobId: qa.job_id,
        jobVersionId: qa.job_version_id,
        imageSha256: qa.image_sha256,
      },
      qaResult,
    ),
    qaResult,
  );
  const acceptance = await acceptInput(f, q.record.id);
  const actualComplete = p.deps.authority.complete;
  let loseOnce = true;
  p.deps.authority.complete = async (...args) => {
    const result = await actualComplete(...args);
    if (loseOnce) {
      loseOnce = false;
      throw new Error("Synthetic lost acceptance response");
    }
    return result;
  };
  await assert.rejects(p.run("media.accept", acceptance), /lost acceptance/);
  const exact = await p.run("media.accept", acceptance);
  assert.equal(exact.status, "completed");
  assert.deepEqual(await p.run("media.accept", acceptance), exact);
  const changed = structuredClone(acceptance);
  changed.payload.title = "Changed acceptance replay";
  await denied(p.run("media.accept", changed));
  const repeated = await p.run("media.dispatch", dispatch);
  assert.equal(repeated.dispatched, false);
  const snapshot = await f.snapshot(),
    asset = snapshot.assets.find((a) => a.id === q.record.id),
    info = real.realFrameAssetInfo(asset);
  assert.deepEqual(info.ownerApproval, {
    requestId: acceptance.requestId,
    draftVersionId: draftRecord.current_version_id,
  });
  assert.match(asset.description, /^RPG_OWNER_FRAME_ASSET_V1\n/);
  assert.equal(
    (await f.checks())[0].owner_acceptance_request_id,
    acceptance.requestId,
  );
  assert.equal(snapshot.assets.length, 1);
  assert.equal(p.imageInputs.length, 1);
  assert.equal(p.wires.length, 1);
  assert.equal(await f.budget(), 600000);
});

test("a lost pending QA claim is never permission to retry QA or create an acceptable draft", async () => {
  const f = await setup(),
    g = await f.generating(await f.queue()),
    before = await f.authoritative(true);
  await f.checkClaim(g.check);
  assert.deepEqual(await f.checkClaim(g.check), {
    claimed: false,
    result: null,
  });
  await denied(f.draft(await draftInput(f, g), g.pixels.output));
  const x = await attachment(f, g.record.id, g.pixels.output);
  await denied(f.complete(x.mutation, x.asset, x.output));
  assert.equal((await f.snapshot()).assets.length, 0);
  assert.equal((await f.checks()).length, 1);
  assert.equal(await f.budget(), 600000);
  assert.deepEqual(await f.authoritative(true), before);
});

test("lost draft response recovers an exact durable draft receipt after acceptance and correction, with no extra paid calls", async () => {
  const f = await setup(),
    before = await f.authoritative(),
    q = await f.queue(),
    p = pipeline(f),
    dispatch = await dispatchInput(f, q),
    actualDraft = p.deps.authority.draft;
  let intent, draftReceipt;
  p.deps.authority.draft = async (...args) => {
    intent = await f.mutation(q.record.id, {}, q.record.id);
    draftReceipt = await actualDraft(...args);
    throw new Error("Synthetic lost draft response");
  };
  await assert.rejects(p.run("media.dispatch", dispatch), /lost draft/);
  assert.equal(
    real.parseRealFrame(await f.record(q.record.id)).status,
    "draft",
  );
  assert.equal((await f.snapshot()).assets.length, 0);
  const forged = structuredClone(intent);
  forged.payload.title = "Spoofed recovery intent";
  await denied(p.run("media.recover", forged));
  await denied(f.recoveryReceipt(intent, f.f.other));
  const recovered = await p.run("media.recover", intent);
  assert.deepEqual(recovered.result, draftReceipt);
  assert.equal(recovered.status, "draft");
  assert.equal(recovered.dispatched, false);
  assert.deepEqual(await p.run("media.recover", intent), recovered);
  await p.run("media.accept", await acceptInput(f, q.record.id));
  const scene = (await f.snapshot()).scenes.find((s) => s.id === f.scene);
  await f.f.mutation(
    "scene.save",
    f.cid,
    {
      id: scene.id,
      session_id: scene.session_id,
      role: scene.role,
      title: scene.title,
      body: scene.body + " Later ordinary owner correction.",
    },
    scene.revision,
  );
  const afterCorrection = await f.authoritative();
  p.deps.policy = null;
  p.deps.verifier = undefined;
  assert.deepEqual(await p.run("media.recover", intent), recovered);
  assert.equal((await f.snapshot()).assets.length, 1);
  assert.equal(p.imageInputs.length, 1);
  assert.equal(p.wires.length, 1);
  assert.equal(await f.budget(), 600000);
  assert.notDeepEqual(afterCorrection, before);
  assert.deepEqual(await f.authoritative(), afterCorrection);
});

test("output upload with a lost response is recovered from exact pixels without another image and only one previously unclaimed QA", async () => {
  const f = await setup(),
    q = await f.queue(),
    p = pipeline(f),
    dispatch = await dispatchInput(f, q),
    actualPut = p.deps.store.put;
  p.deps.store.put = async (...args) => {
    await actualPut(...args);
    throw new Error("Synthetic lost output upload response");
  };
  await denied(p.run("media.dispatch", dispatch));
  assert.equal(p.imageInputs.length, 1);
  assert.equal(p.wires.length, 0);
  assert.equal((await f.checks()).length, 0);
  const retained = structuredClone(p.outputs.get(q.record.id)),
    intent = await f.mutation(q.record.id, {}, q.record.id);
  const recovered = await p.run("media.recover", intent);
  assert.equal(recovered.status, "draft");
  assert.deepEqual(await p.run("media.recover", intent), recovered);
  assert.deepEqual(p.outputs.get(q.record.id), retained);
  assert.equal(p.imageInputs.length, 1);
  assert.equal(p.wires.length, 1);
  assert.equal((await f.checks()).length, 1);
  assert.equal((await f.snapshot()).assets.length, 0);
  assert.equal(await f.budget(), 600000);
});

test("submitted concurrent claims and decisions reserve once, create one draft/asset, and reject a changed acceptance request", async () => {
  const f = await setup(base, 600000),
    q = await f.queue(),
    dispatch = await dispatchInput(f, q),
    claims = await Promise.all(
      Array.from({ length: 5 }, () => f.claim(dispatch)),
    );
  assert.equal(claims.filter((c) => c.claimed).length, 1);
  const d = await f.record(q.record.id),
    g = {
      record: d,
      pixels: storedPixels(
        f.cid,
        d.id,
        png(),
        { textInputTokens: 100, imageInputTokens: 0, outputTokens: 1372 },
        "independent_concurrent_synthetic",
      ),
    };
  const check = {
    campaignId: f.cid,
    jobId: d.id,
    jobVersionId: d.current_version_id,
    imageSha256: g.pixels.output.sha256,
  };
  const checks = await Promise.all(
    Array.from({ length: 5 }, () => f.checkClaim(check)),
  );
  assert.equal(checks.filter((c) => c.claimed).length, 1);
  await f.checkComplete(check, checkResult());
  const input = await draftInput(f, g),
    drafts = await Promise.all(
      Array.from({ length: 5 }, () => f.draft(input, g.pixels.output)),
    );
  assert.ok(
    drafts.every((r) => JSON.stringify(r) === JSON.stringify(drafts[0])),
  );
  const x = await attachment(f, d.id, g.pixels.output),
    accepted = await Promise.all(
      Array.from({ length: 5 }, () =>
        f.complete(x.mutation, x.asset, x.output),
      ),
    );
  assert.ok(
    accepted.every((r) => JSON.stringify(r) === JSON.stringify(accepted[0])),
  );
  const changed = structuredClone(x);
  changed.mutation.requestId = randomUUID();
  await denied(f.complete(changed.mutation, changed.asset, changed.output));
  assert.equal((await f.snapshot()).assets.length, 1);
  assert.equal((await f.checks()).length, 1);
  assert.equal(await f.budget(), 600000);
  const next = await f.queue({ retryOf: d.id });
  await denied(f.claim(await dispatchInput(f, next)));
  assert.equal((await f.record(next.record.id)).revision, 1);
  assert.equal(await f.budget(), 600000);
});

for (const [prefix, schema] of [
  [26, 2],
  [27, 3],
])
  test(`genuine migration-${prefix} schema-${schema} art/save/receipt remains exact after upgrade without retroactive owner approval`, async () => {
    const previous = await fixture(prefix);
    try {
      const f = await setup(previous),
        g = await f.generating(await f.queue({ legacy: schema }));
      if (schema === 3) {
        await f.checkClaim(g.check);
        await f.checkComplete(g.check, legacyCheckResult());
      }
      const x = await attachment(f, g.record.id, g.pixels.output, g.record.id),
        oldReceipt = await f.complete(x.mutation, x.asset, x.output),
        completed = await f.snapshot(),
        oldRecord = structuredClone(
          completed.documents.find((d) => d.id === g.record.id),
        ),
        oldAsset = structuredClone(completed.assets[0]),
        reserved = await f.budget();
      const save = await previous.saves(
        f.cid,
        "create",
        await previous.command(f.cid, {
          kind: "manual",
          name: `Historical schema-${schema} FRAME`,
        }),
      );
      const manifest = () =>
        previous.query(
          "select m.* from rpg_private.timeline_manifests m join rpg_private.save_points s on s.campaign_id=m.campaign_id and s.manifest_id=m.id where s.campaign_id=$1 and s.id=$2",
          [f.cid, save.saveId],
        );
      const originalManifest = await manifest(),
        pending = await f.queue({ legacy: schema, composition: "portrait" });
      for (const file of previous.files.slice(prefix))
        await previous.db.exec(
          await readFile(new URL(file, previous.folder), "utf8"),
        );
      const current = await f.snapshot();
      assert.deepEqual(
        current.documents.find((d) => d.id === g.record.id),
        oldRecord,
      );
      assert.deepEqual(current.assets[0], oldAsset);
      assert.equal(real.parseRealFrame(oldRecord).schema, schema);
      assert.ok(real.safeFrameAsset(current, oldAsset));
      assert.equal(real.realFrameAssetInfo(oldAsset).ownerApproval, undefined);
      assert.match(oldAsset.description, /^RPG_REAL_FRAME_ASSET_V1\n/);
      assert.deepEqual(
        await f.complete(x.mutation, x.asset, x.output),
        oldReceipt,
      );
      assert.deepEqual(await manifest(), originalManifest);
      assert.ok(
        (await previous.saves(f.cid, "read")).saves.some(
          (s) => s.id === save.saveId,
        ),
      );
      assert.equal(await f.budget(), reserved);
      assert.equal(reserved, schema === 2 ? 400000 : 600000);
      await denied(f.claim(await dispatchInput(f, pending)));
      await denied(f.queue({ legacy: schema, composition: "location" }));
      const p = pipeline(f);
      await denied(p.run("media.accept", await acceptInput(f, oldRecord.id)));
      assert.equal(p.imageInputs.length, 0);
      assert.equal(p.wires.length, 0);
      await previous.saves(
        f.cid,
        "load",
        await previous.command(f.cid, {
          saveId: save.saveId,
          label: "Historical read",
          recovery: false,
        }),
      );
      const loaded = await f.snapshot();
      assert.equal(
        real.parseRealFrame(loaded.documents.find((d) => d.id === oldRecord.id))
          .schema,
        schema,
      );
      assert.ok(
        real.safeFrameAsset(
          loaded,
          loaded.assets.find((a) => a.id === oldAsset.id),
        ),
      );
      assert.equal(
        real.realFrameAssetInfo(loaded.assets.find((a) => a.id === oldAsset.id))
          .ownerApproval,
        undefined,
      );
      assert.deepEqual(await manifest(), originalManifest);
    } finally {
      await previous.db.close();
    }
  });

test("draft/accept/discard/hard-reject lifecycle preserves an eligible exact Lab checkpoint and ordinary gameplay authority", async () => {
  const priorOverride = process.env.D2A_SOURCE_ROOT;
  process.env.D2A_SOURCE_ROOT = fileURLToPath(root);
  const { integrationFixture, command } = await import(
    new URL("tests/d2a-integration-fixture.mjs", root)
  );
  if (priorOverride === undefined) delete process.env.D2A_SOURCE_ROOT;
  else process.env.D2A_SOURCE_ROOT = priorOverride;
  const integrated = await integrationFixture({
    beforeSave: async (f) => {
      for (const file of f.files.slice(16))
        await f.db.exec(await readFile(new URL(file, f.folder), "utf8"));
    },
  });
  try {
    const f = await setup(integrated, 4800000, integrated),
      approved = await integrated.approve(),
      prepared = await integrated.store.prepare(approved.request),
      services = await integrated.services(),
      parent = await services.lab.perform({
        action: "continue",
        input: command(prepared),
      });
    assert.ok(parent.checkpoints.length > 1, parent.reason ?? parent.status);
    const selection = {
      sourceRunId: parent.id,
      sourceCheckpointId: parent.checkpoints.at(-1).id,
      expectedRevision: parent.revision,
    };
    const checkpoint = await integrated.lab("continuation_base", selection),
      before = await f.authoritative(),
      p = pipeline(f),
      q = await f.queue();
    assert.ok(checkpoint);
    await p.run("media.dispatch", await dispatchInput(f, q));
    assert.deepEqual(
      await integrated.lab("continuation_base", selection),
      checkpoint,
    );
    await p.run("media.accept", await acceptInput(f, q.record.id));
    const replacement = await f.queue({ retryOf: q.record.id });
    await p.run("media.dispatch", await dispatchInput(f, replacement));
    await p.run("media.discard", await discardInput(f, replacement.record.id));
    const rejected = pipeline(f, checkResult("hard_reject").verdict),
      final = await f.queue({ retryOf: replacement.record.id });
    await rejected.run("media.dispatch", await dispatchInput(f, final));
    assert.deepEqual(await f.authoritative(), before);
    assert.deepEqual(
      await integrated.lab("continuation_base", selection),
      checkpoint,
    );
    const { createLabContinuationService } = await import(
      new URL("src/lib/world-lab/continuation.ts", root)
    );
    const continuation = createLabContinuationService({
      ownerId: integrated.owner,
      execute: integrated.rpc,
      library: services.library,
      lab: services.lab,
      language: "en",
      models: [
        {
          modelId: "gpt-6-astra",
          label: "Synthetic",
          reasoning: ["max"],
          available: true,
        },
      ],
      compose: async () => ({
        output: integrated.proposal,
        usage: {
          model: "gpt-6-astra",
          inputTokens: 1,
          outputTokens: 1,
          calls: 1,
          latencyMs: 1,
        },
      }),
    });
    const interpreted = await continuation.perform({
      action: "interpret",
      input: {
        operationId: randomUUID(),
        campaignId: integrated.cid,
        source: selection,
        premise: "Owner-reviewed synthetic continuation after media decisions.",
        model: {
          providerId: "openai",
          modelId: "gpt-6-astra",
          reasoning: "max",
        },
      },
    });
    const child = await continuation.perform({
      action: "approve",
      input: {
        operationId: randomUUID(),
        campaignId: integrated.cid,
        source: selection,
        versionId: interpreted.draft.versionId,
      },
    });
    assert.equal(child.run.status, "prepared");
  } finally {
    await integrated.db.close();
  }
});

for (const change of ["scene", "head", "timeline"])
  test(`draft owner acceptance refuses stale ${change} authority`, async () => {
    const f = await setup(),
      p = pipeline(f),
      q = await f.queue();
    await p.run("media.dispatch", await dispatchInput(f, q));
    const acceptance = await acceptInput(f, q.record.id),
      pixels = structuredClone(p.outputs.get(q.record.id));
    if (change === "scene") {
      const scene = (await f.snapshot()).scenes.find((s) => s.id === f.scene);
      await f.f.mutation(
        "scene.save",
        f.cid,
        {
          id: scene.id,
          session_id: scene.session_id,
          role: scene.role,
          title: scene.title,
          body: scene.body + " Owner corrected the essential public moment.",
        },
        scene.revision,
      );
    } else {
      const save = await f.f.saves(
        f.cid,
        "create",
        await f.f.command(f.cid, { kind: "manual", name: "Changed head" }),
      );
      if (change === "timeline")
        await f.f.saves(
          f.cid,
          "load",
          await f.f.command(f.cid, {
            saveId: save.saveId,
            label: "New owner branch",
            recovery: false,
          }),
        );
    }
    const authoritative = await f.authoritative();
    await denied(p.run("media.accept", acceptance));
    assert.equal((await f.snapshot()).assets.length, 0);
    assert.deepEqual(p.outputs.get(q.record.id), pixels);
    assert.equal(p.imageInputs.length, 1);
    assert.equal(p.wires.length, 1);
    assert.equal(await f.budget(), 600000);
    assert.deepEqual(await f.authoritative(), authoritative);
  });

test("actual QA requester sees only positively scoped public contract and exact PNG, with private reasons absent from ordinary records", async () => {
  const f = await setup(),
    other = await setup();
  await f.f.one(
    "update rpg_private.dm_state set contents=$2::jsonb where campaign_id=$1",
    [f.cid, JSON.stringify({ private: "APPROVAL_DM_PRIVATE_CANARY" })],
  );
  const scene = (await other.snapshot()).scenes.find(
    (s) => s.id === other.scene,
  );
  await f.f.mutation(
    "scene.save",
    other.cid,
    {
      id: scene.id,
      session_id: scene.session_id,
      role: scene.role,
      title: scene.title,
      body: "APPROVAL_OTHER_CAMPAIGN_CANARY",
    },
    scene.revision,
  );
  const reference = visual.newVisualReference(await f.snapshot(), {
    kind: "style",
    id: f.cid,
  });
  reference.label = "APPROVAL_UNAPPROVED_REFERENCE_CANARY";
  await f.f.mutation(
    "document.save",
    f.cid,
    {
      title: reference.label,
      status: "reference",
      body: visual.serializeVisualMetadata(reference),
    },
    0,
    "campaign",
  );
  const before = await f.authoritative(),
    q = await f.queue(),
    p = pipeline(f, checkResult("review_warning").verdict);
  assert.equal(
    (await p.run("media.dispatch", await dispatchInput(f, q))).status,
    "draft",
  );
  const wire = p.wires[0],
    textWire = JSON.stringify(wire);
  assert.equal(wire.input[0].content[0].text, q.frame.prompt);
  assert.equal(
    wire.input[0].content[1].image_url,
    "data:image/png;base64," +
      Buffer.from(p.outputs.get(q.record.id).bytes).toString("base64"),
  );
  assert.equal(wire.input[0].content[1].detail, "high");
  assert.doesNotMatch(
    textWire,
    /APPROVAL_DM_PRIVATE_CANARY|PRIVATE_BEFORE_FORK|APPROVAL_OTHER_CAMPAIGN_CANARY|APPROVAL_UNAPPROVED_REFERENCE_CANARY|expectedHeadId|canonGeneration|campaign_id|sourceVersionId|jobVersionId|publicPatch|privatePatch|worldPatch|statePatch|SYNTHETIC_OFFLINE_KEY/,
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
  assert.equal(wire.truncation, "disabled");
  assert.equal(wire.text.format.schema.additionalProperties, false);
  assert.equal(Object.hasOwn(wire, "tools"), false);
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
  assert.doesNotMatch(
    JSON.stringify(p.diagnostics),
    /APPROVAL_DM_PRIVATE_CANARY|APPROVAL_OTHER_CAMPAIGN_CANARY|SYNTHETIC_OFFLINE_KEY|data:image|Scene body:/,
  );
  assert.doesNotMatch(
    JSON.stringify(await f.snapshot()),
    /SYNTHETIC_QA_DETAIL_NOT_PUBLIC/,
  );
  assert.doesNotMatch(
    JSON.stringify(await f.f.saves(f.cid, "read")),
    /SYNTHETIC_QA_DETAIL_NOT_PUBLIC/,
  );
  assert.ok(frameGroundingContext(q.frame).estimatedTokens <= 20000);
  assert.deepEqual(await f.authoritative(), before);
});

test("malicious QA output with state patches fails closed and exact retries never generate another image or check", async () => {
  const f = await setup(),
    before = await f.authoritative(),
    q = await f.queue(),
    p = pipeline(f, {
      ...checkResult().verdict,
      publicPatch: { gold: 9000 },
      privatePatch: { secret: "forged" },
      worldEvents: [],
    }),
    dispatch = await dispatchInput(f, q);
  await denied(p.run("media.dispatch", dispatch));
  await p.run("media.dispatch", dispatch);
  await denied(p.run("media.accept", await acceptInput(f, q.record.id)));
  assert.equal(p.imageInputs.length, 1);
  assert.equal(p.wires.length, 1);
  assert.equal((await f.checks())[0].result, null);
  assert.equal((await f.snapshot()).assets.length, 0);
  assert.equal(await f.budget(), 600000);
  assert.deepEqual(await f.authoritative(), before);
});

test("service-only approval/check functions and private QA receipts are inaccessible to browser roles", async () => {
  for (const role of ["anon", "authenticated"]) {
    const access = await base.one(
      "select has_function_privilege($1,'public.rpg_real_frame_draft(uuid,jsonb,jsonb)','execute') draft,has_function_privilege($1,'public.rpg_real_frame_complete(uuid,jsonb,jsonb,jsonb)','execute') complete,has_function_privilege($1,'public.rpg_frame_check_claim(uuid,uuid,uuid,uuid,text)','execute') claim,has_function_privilege($1,'public.rpg_frame_check_complete(uuid,uuid,uuid,uuid,text,jsonb)','execute') verdict,has_function_privilege($1,'public.rpg_frame_draft_pixels(uuid,uuid,uuid)','execute') draft_pixels,has_function_privilege($1,'public.rpg_real_frame_recovery_receipt(uuid,jsonb)','execute') recovery,has_table_privilege($1,'rpg_private.media_frame_checks','select') evidence",
      [role],
    );
    assert.deepEqual(access, {
      draft: false,
      complete: false,
      claim: false,
      verdict: false,
      draft_pixels: false,
      recovery: false,
      evidence: false,
    });
  }
  for (const name of [
    "public.rpg_real_frame_draft(uuid,jsonb,jsonb)",
    "public.rpg_real_frame_complete(uuid,jsonb,jsonb,jsonb)",
    "public.rpg_frame_draft_pixels(uuid,uuid,uuid)",
    "public.rpg_real_frame_recovery_receipt(uuid,jsonb)",
  ])
    assert.equal(
      (
        await base.one(
          "select has_function_privilege('service_role',$1,'execute') allowed",
          [name],
        )
      ).allowed,
      true,
    );
});

test("hard-rejected QA retains pixels privately and cannot replace previous accepted art or become a draft", async () => {
  const f = await setup(),
    safe = pipeline(f),
    q = await f.queue();
  await safe.run("media.dispatch", await dispatchInput(f, q));
  await safe.run("media.accept", await acceptInput(f, q.record.id));
  const accepted = structuredClone((await f.snapshot()).assets),
    before = await f.authoritative(),
    reject = pipeline(f, checkResult("hard_reject").verdict),
    next = await f.queue({ retryOf: q.record.id });
  const outcome = await reject.run(
    "media.dispatch",
    await dispatchInput(f, next),
  );
  assert.equal(outcome.status, "failed");
  const frame = real.parseRealFrame(await f.record(next.record.id));
  assert.equal(frame.review, null);
  assert.equal(frame.status, "failed");
  assert.equal(frame.resultAssetId, null);
  assert.equal(reject.outputs.has(next.record.id), true);
  assert.deepEqual((await f.snapshot()).assets, accepted);
  await denied(
    reject.run("media.accept", await acceptInput(f, next.record.id)),
  );
  assert.deepEqual((await f.snapshot()).assets, accepted);
  assert.equal(reject.imageInputs.length, 1);
  assert.equal(reject.wires.length, 1);
  assert.equal(await f.budget(), 1200000);
  assert.deepEqual(await f.authoritative(), before);
});

test("owner acceptance refuses altered stored pixels, dimensions, usage metadata and campaign path", async () => {
  const f = await setup(),
    before = await f.authoritative(),
    p = pipeline(f),
    q = await f.queue();
  await p.run("media.dispatch", await dispatchInput(f, q));
  const original = structuredClone(p.outputs.get(q.record.id)),
    input = await acceptInput(f, q.record.id),
    corrupt = structuredClone(original);
  corrupt.bytes[0] = 0;
  const foreign = structuredClone(original);
  foreign.output.storagePath = `${randomUUID()}/frames/${q.record.id}/output.png`;
  const wrongLength = structuredClone(original);
  wrongLength.output.bytes += 1;
  const forgedUsage = structuredClone(original);
  forgedUsage.output.usage = { ...forgedUsage.output.usage, privatePatch: {} };
  const mismatchedHash = structuredClone(original);
  mismatchedHash.output.sha256 = "d".repeat(64);
  const wrongDimensions = storedPixels(f.cid, q.record.id, png(1024, 1024));
  for (const altered of [
    corrupt,
    foreign,
    wrongLength,
    forgedUsage,
    mismatchedHash,
    wrongDimensions,
  ]) {
    p.outputs.set(q.record.id, altered);
    await assert.rejects(
      p.run("media.accept", input),
      /unavailable|invalid_image/,
    );
    assert.equal((await f.snapshot()).assets.length, 0);
    assert.equal(
      real.parseRealFrame(await f.record(q.record.id)).status,
      "draft",
    );
  }
  p.outputs.set(q.record.id, original);
  await p.run("media.accept", input);
  assert.equal((await f.snapshot()).assets.length, 1);
  assert.equal(p.imageInputs.length, 1);
  assert.equal(p.wires.length, 1);
  assert.equal(await f.budget(), 600000);
  assert.deepEqual(await f.authoritative(), before);
});

test("a genuine public correction blocks late QA/draft callbacks while completed QA evidence remains replayable", async () => {
  for (const checked of [false, true]) {
    const f = await setup(),
      g = await f.generating(await f.queue());
    await f.checkClaim(g.check);
    if (checked) await f.checkComplete(g.check, checkResult());
    const scene = (await f.snapshot()).scenes.find((s) => s.id === f.scene);
    await f.f.mutation(
      "scene.save",
      f.cid,
      {
        id: scene.id,
        session_id: scene.session_id,
        role: scene.role,
        title: scene.title,
        body:
          scene.body + " Owner corrected the main subject before completion.",
      },
      scene.revision,
    );
    const authoritative = await f.authoritative();
    await denied(f.checkClaim(g.check));
    if (checked)
      assert.deepEqual(
        await f.checkComplete(g.check, checkResult()),
        checkResult(),
      );
    else await denied(f.checkComplete(g.check, checkResult()));
    await denied(f.draft(await draftInput(f, g), g.pixels.output));
    assert.equal((await f.snapshot()).assets.length, 0);
    assert.equal(
      real.parseRealFrame(await f.record(g.record.id)).status,
      "generating",
    );
    assert.equal((await f.checks())[0].result === null, !checked);
    assert.equal(await f.budget(), 600000);
    assert.deepEqual(await f.authoritative(), authoritative);
  }
});

test("immutable QA history and assigned draft/approval pins cannot be rewritten or deleted", async () => {
  const f = await setup(),
    p = pipeline(f),
    q = await f.queue();
  await p.run("media.dispatch", await dispatchInput(f, q));
  const before = await f.checks();
  for (const sql of [
    "update rpg_private.media_frame_checks set contract=contract||' changed' where campaign_id=$1",
    "update rpg_private.media_frame_checks set image_sha256=repeat('e',64) where campaign_id=$1",
    "update rpg_private.media_frame_checks set result=null where campaign_id=$1",
    "update rpg_private.media_frame_checks set draft_version_id=null where campaign_id=$1",
    "update rpg_private.media_frame_checks set owner_acceptance_request_id=gen_random_uuid() where campaign_id=$1",
    "delete from rpg_private.media_frame_checks where campaign_id=$1",
  ])
    await denied(f.f.one(sql, [f.cid]));
  assert.deepEqual(await f.checks(), before);
  const acceptance = await acceptInput(f, q.record.id);
  await p.run("media.accept", acceptance);
  const accepted = await f.checks();
  for (const sql of [
    "update rpg_private.media_frame_checks set owner_acceptance_request_id=null where campaign_id=$1",
    "update rpg_private.media_frame_checks set owner_acceptance_request_id=gen_random_uuid() where campaign_id=$1",
    "update rpg_private.media_frame_checks set draft_version_id=gen_random_uuid() where campaign_id=$1",
    "delete from rpg_private.media_frame_checks where campaign_id=$1",
  ])
    await denied(f.f.one(sql, [f.cid]));
  assert.deepEqual(await f.checks(), accepted);
  assert.equal(accepted[0].owner_acceptance_request_id, acceptance.requestId);
});

test("draft pixel authority allows exact reviewed draft only, rejecting unchecked/manual, discarded and foreign jobs", async () => {
  for (const status of ["safe_to_review", "review_warning"]) {
    const f = await setup(),
      p = pipeline(f, checkResult(status).verdict),
      q = await f.queue();
    await denied(f.draftPixels(q.record.id));
    await p.run("media.dispatch", await dispatchInput(f, q));
    const output = p.outputs.get(q.record.id).output;
    assert.deepEqual(await f.draftPixels(q.record.id), {
      storagePath: output.storagePath,
      imageSha256: output.sha256,
    });
    await denied(f.draftPixels(q.record.id, randomUUID()));
    await denied(f.draftPixels(randomUUID()));
    await denied(f.draftPixels(q.record.id, f.cid, f.f.other));
    await p.run("media.discard", await discardInput(f, q.record.id));
    await denied(f.draftPixels(q.record.id));
  }
  const f = await setup(),
    g = await f.generating(await f.queue());
  await f.checkClaim(g.check); // Intentionally leave durable QA result and draft pin NULL.
  const forged = {
    ...g.frame,
    status: "draft",
    review: { status: "safe_to_review", imageSha256: g.pixels.output.sha256 },
  };
  await f.f.mutation(
    "document.save",
    f.cid,
    {
      id: g.record.id,
      title: g.record.title,
      status: "reference",
      body: visual.VISUAL_FRAME_PREFIX + JSON.stringify(forged),
    },
    g.record.revision,
    "campaign",
  );
  assert.equal(
    real.parseRealFrame(await f.record(g.record.id)).status,
    "draft",
  );
  assert.equal((await f.checks())[0].result, null);
  assert.equal((await f.checks())[0].draft_version_id, null);
  await denied(f.draftPixels(g.record.id));
  assert.equal((await f.snapshot()).assets.length, 0);
});
