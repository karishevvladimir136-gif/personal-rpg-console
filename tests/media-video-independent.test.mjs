import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { pathToFileURL, fileURLToPath } from "node:url";
import { registerHooks } from "node:module";

// Exercise the integration source and its actual migrations rather than the
// independent worker's historical checkout. No credentials or live calls.
const root = process.env.VIDEO_REVIEW_ROOT
  ? pathToFileURL(
      process.env.VIDEO_REVIEW_ROOT.replaceAll("\\", "/").replace(/\/$/, "") +
        "/",
    )
  : new URL("../", import.meta.url);
const { fixture, world, commitEvent } = await import(
  new URL("tests/phase35-storage-fixture.mjs", root)
);
const real = await import(new URL("src/lib/visual-frame/real-frame.ts", root));
const visual = await import(new URL("src/lib/visual-frame/model.ts", root));
const video = await import(new URL("src/lib/scene-video/model.ts", root));
const { storedPixels } = await import(
  new URL("src/lib/server/media/png.ts", root)
);
const { png } = await import(new URL("tests/media-frame-fixture.mjs", root));
const { closedWorldFramePrompt } = await import(
  new URL("src/lib/visual-frame/closed-world.ts", root)
);
const hook = registerHooks({
  resolve(specifier, context, next) {
    return specifier === "server-only"
      ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
      : next(specifier, context);
  },
});
const { executeSceneVideo } = await import(
  new URL("src/lib/server/media/video-orchestration.ts", root)
);
const { falVideoProvider, storedVideo, checkedMp4, permittedVideoUrl } =
  await import(new URL("src/lib/server/media/video-provider.ts", root));
hook.deregister();
const { readFoundationLoop, loopCommand, createLoopStore } = await import(
  new URL("src/lib/foundation-loop/authority.ts", root)
);
const { planCommerceConfiguration } = await import(
  new URL("src/lib/foundation-loop/configuration.ts", root)
);
const { createTradeQuote, executeTradeQuote } = await import(
  new URL("src/lib/commerce/index.ts", root)
);

let base;
const originalFetch = globalThis.fetch;
before(async () => {
  globalThis.fetch = () =>
    assert.fail("Independent VIDEO QA must never contact a provider");
  try {
    base = await fixture();
  } catch (error) {
    throw new Error(
      `Disposable migration setup failed (${error.code}, position ${error.position}): ${error.message}`,
    );
  }
  assert.ok(base.files.length >= 29, "VIDEO migration must be present");
});
after(async () => {
  globalThis.fetch = originalFetch;
  if (base) await base.db.close();
});

const frameModel = "gpt-image-2.5-sunburst-2026-09-08";
const frameParameters = {
  size: "1536x1024",
  quality: "high",
  outputFormat: "png",
  n: 1,
};
const verdict = (status = "safe_to_review") => ({
  schemaVersion: 2,
  verdict: {
    schemaVersion: 2,
    status,
    reasons:
      status === "safe_to_review"
        ? []
        : [{ category: "illustrative_variation", detail: "PRIVATE_QA_CANARY" }],
  },
  actualModel: "gpt-5.4-2026-03-05",
  inputTokens: 3000,
  outputTokens: 200,
  latencyMs: 20,
});
const denied = (promise) =>
  assert.rejects(
    promise,
    /rpg_validation|rpg_conflict|rpg_not_found|rpg_forbidden|validation|conflict|not_found|unavailable|not_configured/,
  );

async function setup(
  f = base,
  limit = 20_000_000,
  existing = undefined,
  maximumFrameCalls = 8,
) {
  const w = existing ?? (await world(f, "Independent VIDEO boundary"));
  const budgetId = randomUUID();
  await f.one("select public.rpg_media_budget_prepare($1,$2,$3,$4,$5)", [
    f.owner,
    budgetId,
    frameModel,
    limit,
    maximumFrameCalls,
  ]);
  const rpc = async (name, values, owner = f.owner) => {
    const params = [owner, ...values];
    return (
      await f.one(
        `select public.${name}(${params.map((_, i) => "$" + (i + 1)).join(",")}) v`,
        params,
      )
    ).v;
  };
  const snapshot = () => f.saves(w.cid, "campaign");
  const source = async () =>
    rpc("rpg_frame_basis", [w.cid, await f.fence(w.cid)]);
  const record = async (id) =>
    (await snapshot()).documents.find((d) => d.id === id);
  const receipt = (input) => rpc("rpg_mutation_receipt", [input]);
  const frameLifecycle = (input) => rpc("rpg_real_frame_lifecycle", [input]);
  const lifecycle = (input, owner) =>
    rpc("rpg_video_lifecycle", [input], owner);
  const claim = (input, budget = budgetId, owner) =>
    rpc("rpg_video_claim", [input, budget], owner);
  const submission = (cid, jid, requestId = null, owner) =>
    rpc("rpg_video_submission", [cid, jid, requestId], owner);
  const complete = (input, asset, output, owner) =>
    rpc("rpg_video_complete", [input, asset, output], owner);
  const pixels = (jid, cid = w.cid, owner) =>
    rpc("rpg_video_pixels", [cid, jid], owner);
  const videoSource = (assetId, cid = w.cid, owner) =>
    rpc("rpg_video_source", [cid, assetId], owner);
  async function videoMutation(id, patch, requestId = randomUUID()) {
    const s = await snapshot(),
      row = s.documents.find((d) => d.id === id),
      value = video.parseSceneVideo(row);
    return {
      ...video.videoDocumentMutation(s, { ...value, ...patch }, row),
      requestId,
    };
  }
  async function queueVideo(approved, retryOf = null) {
    await rpc("rpg_media_video_enable", [budgetId]);
    const s = await snapshot(),
      value = video.buildSceneVideo(
        s,
        approved.id,
        await videoSource(approved.id),
        retryOf,
      ),
      input = {
        ...video.videoDocumentMutation(s, value),
        requestId: randomUUID(),
      },
      result = await lifecycle(input);
    return { input, result, value, record: await record(result.id) };
  }
  async function frameMutation(id, patch, requestId = randomUUID()) {
    const s = await snapshot(),
      row = s.documents.find((d) => d.id === id),
      frame = real.parseRealFrame(row);
    return {
      ...real.realFrameDocumentMutation(s, { ...frame, ...patch }, row),
      requestId,
    };
  }
  async function frame({
    accept = true,
    status = "safe_to_review",
    legacy = null,
  } = {}) {
    const s = await snapshot(),
      value = real.buildRealFrame(
        s,
        [],
        "wide",
        frameModel,
        frameParameters,
        await source(),
      ),
      queue = {
        ...real.realFrameDocumentMutation(s, value),
        requestId: randomUUID(),
      },
      dispatchId = randomUUID();
    if (legacy) {
      value.schema = legacy;
      delete value.review;
      value.prompt =
        legacy === 2
          ? real.legacyRealFramePrompt(value.basis.scene, [], "wide")
          : closedWorldFramePrompt(value.basis.scene, [], "wide");
      queue.payload.body = visual.VISUAL_FRAME_PREFIX + JSON.stringify(value);
    }
    const queued = await frameLifecycle(queue),
      dispatch = await frameMutation(
        queued.id,
        {
          status: "generating",
          dispatch: { requestId: dispatchId, reservationUsdMicros: 400000 },
        },
        dispatchId,
      );
    await rpc("rpg_real_frame_claim", [dispatch, budgetId]);
    const generating = await record(queued.id),
      pixels = storedPixels(
        w.cid,
        generating.id,
        png(),
        { textInputTokens: 100, imageInputTokens: 0, outputTokens: 1372 },
        "independent_video_frame_stub",
      ),
      check = [
        w.cid,
        generating.id,
        generating.current_version_id,
        pixels.output.sha256,
      ];
    if (legacy !== 2) {
      await rpc("rpg_frame_check_claim", check);
      await rpc("rpg_frame_check_complete", [
        ...check,
        legacy === 3
          ? {
              ...verdict(),
              schemaVersion: 1,
              verdict: { schemaVersion: 1, status: "pass", reasons: [] },
            }
          : verdict(status),
      ]);
    }
    let draft = null;
    if (!legacy) {
      draft = await frameMutation(
        generating.id,
        {
          status: "draft",
          review: { status, imageSha256: pixels.output.sha256 },
        },
        generating.id,
      );
      await rpc("rpg_real_frame_draft", [draft, pixels.output]);
    }
    let acceptance = null,
      assetMutation = null,
      acceptedReceipt = null;
    if (accept) {
      const current = await snapshot(),
        row = current.documents.find((d) => d.id === generating.id),
        v = real.parseRealFrame(row);
      acceptance = {
        ...real.realFrameDocumentMutation(
          current,
          { ...v, status: "completed", resultAssetId: row.id },
          row,
        ),
        requestId: legacy ? generating.id : randomUUID(),
      };
      assetMutation = {
        ...real.realFrameAssetMutation(
          current,
          row,
          v,
          pixels.output,
          row.id,
          acceptance.requestId,
        ),
        requestId: row.current_version_id,
      };
      acceptedReceipt = await rpc("rpg_real_frame_complete", [
        acceptance,
        assetMutation,
        pixels.output,
      ]);
    }
    return {
      id: generating.id,
      pixels,
      dispatch,
      draft,
      acceptance,
      assetMutation,
      acceptedReceipt,
      record: await record(generating.id),
    };
  }
  const budget = async () =>
    await f.one("select * from rpg_private.media_budgets where id=$1", [
      budgetId,
    ]);
  async function authoritative() {
    const s = await snapshot(),
      { assets, documents, ...publicState } = s;
    publicState.assets = assets.filter(
      (a) => !real.realFrameAssetInfo(a) && a.kind !== "video",
    );
    publicState.documents = documents.filter(
      (d) => !real.parseRealFrame(d) && !video.parseSceneVideo(d),
    );
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
    // Accepted media bookkeeping already advances the existing Memory cache
    // generation. Canon, actual public/private facts and caches remain pinned.
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
    rpc,
    snapshot,
    source,
    record,
    receipt,
    frameLifecycle,
    frameMutation,
    frame,
    lifecycle,
    claim,
    submission,
    complete,
    pixels,
    videoSource,
    videoMutation,
    queueVideo,
    budget,
    authoritative,
  };
}

function mp4(marker = "independent") {
  const box = (name, data = Buffer.alloc(0)) => {
    const bytes = Buffer.alloc(8 + data.length);
    bytes.writeUInt32BE(bytes.length);
    bytes.write(name, 4);
    data.copy(bytes, 8);
    return bytes;
  };
  return new Uint8Array(
    Buffer.concat([
      box("ftyp", Buffer.from("isom0000")),
      box("moov"),
      box("mdat", Buffer.from(marker)),
    ]),
  );
}

function pipeline(f, approved, statuses = ["ready"]) {
  const outputs = new Map(),
    submissions = [],
    polls = [],
    completions = [],
    frameReads = [],
    writes = [];
  const authority = {
    authorize: async (cid) => assert.equal(cid, f.cid),
    snapshot: f.snapshot,
    source: f.source,
    receipt: f.receipt,
    lifecycle: f.lifecycle,
    claim: f.claim,
    submission: f.submission,
    complete: async (...args) => {
      completions.push(structuredClone(args));
      return f.complete(...args);
    },
  };
  const deps = {
    authority,
    policy: {
      model: video.VIDEO_MODEL,
      budgetId: f.budgetId,
      reservationUsdMicros: 7_000_000,
    },
    store: {
      frame: async (cid, id) => {
        assert.equal(cid, f.cid);
        assert.equal(id, approved.id);
        frameReads.push({ cid, id });
        return structuredClone(approved.pixels);
      },
      read: async (cid, id) => {
        assert.equal(cid, f.cid);
        return outputs.get(id) ?? null;
      },
      put: async (cid, id, pixels) => {
        assert.equal(cid, f.cid);
        assert.equal(
          outputs.has(id),
          false,
          "Scoped VIDEO pixels are immutable",
        );
        writes.push({ cid, id });
        outputs.set(id, structuredClone(pixels));
      },
    },
    provider: {
      submit: async (value, bytes) => {
        assert.deepEqual(bytes, approved.pixels.bytes);
        const requestId = randomUUID();
        submissions.push({ value: structuredClone(value), requestId });
        const evidence = await f.f.query(
          "select * from rpg_private.media_video_submissions where campaign_id=$1",
          [f.cid],
        );
        assert.ok(
          evidence.some(
            (q) => q.dispatch_request_id === value.dispatch.requestId,
          ),
          "Durable reservation and evidence must precede submission",
        );
        return requestId;
      },
      poll: async (requestId, cid, id) => {
        assert.equal(cid, f.cid);
        assert.ok(submissions.some((s) => s.requestId === requestId));
        polls.push({ requestId, cid, id });
        const status =
          statuses[Math.min(polls.length - 1, statuses.length - 1)];
        return status === "ready"
          ? {
              status,
              pixels: storedVideo(cid, id, mp4(), requestId, video.VIDEO_MODEL),
            }
          : { status };
      },
    },
  };
  return {
    deps,
    outputs,
    submissions,
    polls,
    completions,
    frameReads,
    writes,
    run: (action, input) => executeSceneVideo({ action, input }, deps),
    poll: (jobId, campaignId = f.cid) =>
      executeSceneVideo({ action: "video.poll", campaignId, jobId }, deps),
  };
}
async function dispatchInput(f, q) {
  const requestId = randomUUID();
  return f.videoMutation(
    q.record.id,
    {
      status: "generating",
      dispatch: { requestId, reservationUsdMicros: 7_000_000 },
    },
    requestId,
  );
}

async function completionInput(f, q, output) {
  const s = await f.snapshot(),
    row = s.documents.find((d) => d.id === q.record.id),
    old = video.parseSceneVideo(row),
    ready = { ...old, status: "ready", resultAssetId: row.id, failure: null };
  return {
    mutation: {
      ...video.videoDocumentMutation(s, ready, row),
      requestId: row.id,
    },
    asset: {
      ...video.videoAssetMutation(s, row, ready, output),
      requestId: row.current_version_id,
    },
    output,
  };
}

test("normal SQL VIDEO lifecycle submits once, polls the same request, preserves art and has no RPG/Canon effect", async () => {
  const f = await setup(),
    approved = await f.frame(),
    before = await f.authoritative(),
    image = (await f.snapshot()).assets[0],
    q = await f.queueVideo(approved),
    p = pipeline(f, approved, ["queued", "generating", "ready"]),
    dispatch = await dispatchInput(f, q),
    started = await p.run("video.dispatch", dispatch);
  assert.equal(started.status, "generating");
  assert.equal(started.dispatched, true);
  assert.equal((await p.run("video.dispatch", dispatch)).dispatched, false);
  assert.equal((await p.poll(q.record.id)).status, "queued");
  assert.equal((await p.poll(q.record.id)).status, "generating");
  const completed = await p.poll(q.record.id),
    s = await f.snapshot(),
    asset = s.assets.find((a) => a.id === q.record.id);
  assert.equal(completed.status, "ready");
  assert.ok(video.safeVideoAsset(s, asset));
  assert.deepEqual(
    s.assets.find((a) => a.id === image.id),
    image,
  );
  assert.equal(p.submissions.length, 1);
  assert.equal(new Set(p.polls.map((poll) => poll.requestId)).size, 1);
  assert.equal(p.writes.length, 1);
  assert.equal((await f.budget()).reserved_usd_micros, 7_600_000);
  assert.deepEqual(await f.authoritative(), before);
  assert.deepEqual(
    await f.pixels(q.record.id),
    p.outputs.get(q.record.id).output,
  );
  assert.deepEqual(await p.poll(q.record.id), completed);
  assert.equal(p.polls.length, 3);
  const versions = await f.f.query(
    "select body from public.rpg_document_versions where campaign_id=$1 and document_id=$2 order by version",
    [f.cid, q.record.id],
  );
  assert.deepEqual(
    versions.map((d) => video.parseSceneVideo(d).status),
    ["queued", "generating", "ready"],
  );
});

test("simultaneous dispatch and poll requests claim one reservation and persist one immutable VIDEO result", async () => {
  const f = await setup(),
    approved = await f.frame(),
    q = await f.queueVideo(approved),
    p = pipeline(f, approved),
    dispatch = await dispatchInput(f, q),
    started = await Promise.all(
      Array.from({ length: 5 }, () => p.run("video.dispatch", dispatch)),
    );
  assert.equal(started.filter((r) => r.dispatched).length, 1);
  assert.equal(p.submissions.length, 1);
  const ready = await Promise.all(
    Array.from({ length: 5 }, () => p.poll(q.record.id)),
  );
  assert.ok(ready.every((r) => r.status === "ready"));
  assert.equal(
    (await f.snapshot()).assets.filter((a) => a.kind === "video").length,
    1,
  );
  assert.equal(p.writes.length, 1);
  assert.equal((await f.budget()).reserved_usd_micros, 7_600_000);
  const reservations = await f.f.query(
    "select * from rpg_private.media_reservations where budget_id=$1 and media_kind='video'",
    [f.budgetId],
  );
  assert.equal(reservations.length, 1);
  assert.equal(reservations[0].grounding_reservation_usd_micros, 0);
  const changed = structuredClone(dispatch);
  changed.payload.title += " changed replay";
  await denied(p.run("video.dispatch", changed));
});

test("unknown provider submission retains the claim and never automatically resubmits or creates a replacement", async () => {
  const f = await setup(),
    approved = await f.frame(),
    q = await f.queueVideo(approved),
    p = pipeline(f, approved),
    dispatch = await dispatchInput(f, q),
    submit = p.deps.provider.submit;
  p.deps.provider.submit = async (...args) => {
    await submit(...args);
    throw new Error("Synthetic lost submit response");
  };
  assert.equal((await p.run("video.dispatch", dispatch)).status, "uncertain");
  assert.equal(await f.submission(f.cid, q.record.id), null);
  assert.equal(
    video.parseSceneVideo(await f.record(q.record.id)).status,
    "generating",
  );
  await p.run("video.dispatch", dispatch);
  for (let i = 0; i < 3; i++)
    assert.equal((await p.poll(q.record.id)).status, "uncertain");
  assert.equal(p.submissions.length, 1);
  assert.equal(p.polls.length, 0);
  await denied(f.queueVideo(approved));
  const cancel = await f.videoMutation(q.record.id, { status: "cancelled" });
  assert.equal((await p.run("video.save", cancel)).status, "cancelled");
  const replacement = await f.queueVideo(approved, q.record.id);
  assert.notEqual(replacement.record.id, q.record.id);
  assert.equal(p.submissions.length, 1);
  assert.equal((await f.budget()).reserved_usd_micros, 7_600_000);
});

test("lost claim response holds one reservation without submission and recovery does not dispatch", async () => {
  const f = await setup(),
    approved = await f.frame(),
    q = await f.queueVideo(approved),
    p = pipeline(f, approved),
    dispatch = await dispatchInput(f, q),
    claim = p.deps.authority.claim;
  p.deps.authority.claim = async (...args) => {
    await claim(...args);
    throw new Error("Synthetic lost claim response");
  };
  await assert.rejects(p.run("video.dispatch", dispatch), /lost claim/);
  await p.run("video.dispatch", dispatch);
  assert.equal((await p.poll(q.record.id)).status, "uncertain");
  assert.equal(p.submissions.length, 0);
  assert.equal(p.polls.length, 0);
  assert.equal((await f.budget()).reserved_usd_micros, 7_600_000);
});

for (const persistFirst of [true, false])
  test(`lost submission recording ${persistFirst ? "after" : "before"} persistence never repeats a paid call`, async () => {
    const f = await setup(),
      approved = await f.frame(),
      q = await f.queueVideo(approved),
      p = pipeline(f, approved),
      dispatch = await dispatchInput(f, q),
      submission = p.deps.authority.submission;
    p.deps.authority.submission = async (...args) => {
      if (!args[2]) return submission(...args);
      if (persistFirst) await submission(...args);
      throw new Error("Synthetic lost submission receipt");
    };
    await assert.rejects(p.run("video.dispatch", dispatch), /lost submission/);
    await p.run("video.dispatch", dispatch);
    assert.equal(
      (await p.poll(q.record.id)).status,
      persistFirst ? "ready" : "uncertain",
    );
    assert.equal(p.submissions.length, 1);
    assert.equal(p.polls.length, persistFirst ? 1 : 0);
    assert.equal((await f.budget()).reserved_usd_micros, 7_600_000);
  });

test("lost storage/completion responses recover retained MP4 and exact ready receipts without another provider poll", async () => {
  const f = await setup(),
    approved = await f.frame(),
    q = await f.queueVideo(approved),
    p = pipeline(f, approved),
    dispatch = await dispatchInput(f, q),
    put = p.deps.store.put,
    complete = p.deps.authority.complete;
  await p.run("video.dispatch", dispatch);
  p.deps.store.put = async (...args) => {
    await put(...args);
    throw new Error("Synthetic lost storage response");
  };
  p.deps.authority.complete = async () => {
    throw new Error("Synthetic interruption before completion");
  };
  await assert.rejects(p.poll(q.record.id), /before completion/);
  assert.ok(p.outputs.has(q.record.id));
  assert.equal(
    video.parseSceneVideo(await f.record(q.record.id)).status,
    "generating",
  );
  p.deps.authority.complete = async (...args) => {
    await complete(...args);
    throw new Error("Synthetic lost completion response");
  };
  await assert.rejects(p.poll(q.record.id), /lost completion/);
  const replay = await p.poll(q.record.id),
    saved = p.completions.at(-1);
  assert.equal(replay.status, "ready");
  assert.deepEqual(await f.complete(...saved), replay.result);
  assert.equal(p.polls.length, 1);
  assert.equal(p.submissions.length, 1);
  assert.equal(p.writes.length, 1);
  assert.equal(
    (await f.snapshot()).assets.filter((a) => a.kind === "video").length,
    1,
  );
});

test("the same combined ledger enforces total dollars, at most two clips and unchanged FRAME call accounting", async () => {
  const f = await setup(base, 14_600_000),
    approved = await f.frame(),
    p = pipeline(f, approved),
    first = await f.queueVideo(approved);
  await p.run("video.dispatch", await dispatchInput(f, first));
  await p.poll(first.record.id);
  const second = await f.queueVideo(approved, first.record.id);
  await p.run("video.dispatch", await dispatchInput(f, second));
  await p.poll(second.record.id);
  const third = await f.queueVideo(approved, second.record.id);
  await denied(p.run("video.dispatch", await dispatchInput(f, third)));
  assert.equal(
    video.parseSceneVideo(await f.record(third.record.id)).status,
    "queued",
  );
  assert.equal(p.submissions.length, 2);
  assert.equal((await f.budget()).reserved_usd_micros, 14_600_000);
  const rows = await f.f.query(
    "select media_kind,reservation_usd_micros,grounding_reservation_usd_micros from rpg_private.media_reservations where budget_id=$1 order by media_kind",
    [f.budgetId],
  );
  assert.deepEqual(rows, [
    {
      media_kind: "frame",
      reservation_usd_micros: 400000,
      grounding_reservation_usd_micros: 200000,
    },
    {
      media_kind: "video",
      reservation_usd_micros: 7_000_000,
      grounding_reservation_usd_micros: 0,
    },
    {
      media_kind: "video",
      reservation_usd_micros: 7_000_000,
      grounding_reservation_usd_micros: 0,
    },
  ]);
  const smaller = await setup(base, 7_599_999),
    otherFrame = await smaller.frame(),
    other = await smaller.queueVideo(otherFrame),
    blocked = pipeline(smaller, otherFrame);
  await denied(
    blocked.run("video.dispatch", await dispatchInput(smaller, other)),
  );
  assert.equal(blocked.submissions.length, 0);
  assert.equal((await smaller.budget()).reserved_usd_micros, 600000);
});

test("unconfigured VIDEO policy causes zero claims, reads or provider calls", async () => {
  const f = await setup(),
    approved = await f.frame(),
    q = await f.queueVideo(approved),
    p = pipeline(f, approved);
  p.deps.policy = null;
  await denied(p.run("video.dispatch", await dispatchInput(f, q)));
  assert.equal(p.submissions.length, 0);
  assert.equal(p.frameReads.length, 0);
  assert.equal((await f.budget()).reserved_usd_micros, 600000);
  assert.equal(
    (
      await f.f.query(
        "select * from rpg_private.media_video_submissions where campaign_id=$1",
        [f.cid],
      )
    ).length,
    0,
  );
});

test("VIDEO reservations do not consume the existing separate FRAME call allowance", async () => {
  const f = await setup(base, 20_000_000, undefined, 2),
    approved = await f.frame(),
    q = await f.queueVideo(approved),
    p = pipeline(f, approved);
  await p.run("video.dispatch", await dispatchInput(f, q));
  await p.poll(q.record.id);
  const secondFrame = await f.frame();
  assert.ok(secondFrame.acceptance);
  assert.equal((await f.budget()).reserved_usd_micros, 8_200_000);
  assert.equal((await f.budget()).maximum_calls, 2);
  assert.equal((await f.budget()).maximum_video_calls, 2);
});

test("a forged owner-approval prefix cannot replace the private approval receipt or cross campaign boundaries", async () => {
  const f = await setup(),
    other = await setup(),
    approved = await f.frame(),
    foreign = await other.frame(),
    original = await f.snapshot(),
    asset = original.assets.find((a) => a.id === approved.id),
    provenance = real.realFrameAssetInfo(asset);
  assert.deepEqual(await f.videoSource(approved.id), await f.source());
  await denied(f.videoSource(foreign.id));
  await denied(f.videoSource(approved.id, other.cid));
  await denied(f.videoSource(approved.id, f.cid, f.f.other));
  provenance.ownerApproval.requestId = randomUUID();
  await f.f.mutation(
    "asset.save",
    f.cid,
    {
      id: asset.id,
      title: asset.title,
      kind: asset.kind,
      storage_path: asset.storage_path,
      description: "RPG_OWNER_FRAME_ASSET_V1\n" + JSON.stringify(provenance),
    },
    asset.revision,
  );
  const forged = await f.snapshot();
  assert.ok(
    real.ownerAcceptedFrameAsset(
      forged,
      forged.assets.find((a) => a.id === approved.id),
    ),
    "Pure provenance reader is not private acceptance authority",
  );
  const value = video.buildSceneVideo(forged, approved.id, await f.source()),
    intent = {
      ...video.videoDocumentMutation(forged, value),
      requestId: randomUUID(),
    };
  await denied(f.videoSource(approved.id));
  await denied(f.lifecycle(intent));
  assert.equal(
    (
      await f.f.query(
        "select * from rpg_private.media_video_submissions where campaign_id=$1",
        [f.cid],
      )
    ).length,
    0,
  );
  assert.equal((await f.budget()).reserved_usd_micros, 600000);
});

test("draft pixels and browser-saved forged completed FRAME records do not supply missing private acceptance evidence", async () => {
  const f = await setup(),
    draft = await f.frame({ accept: false }),
    s = await f.snapshot(),
    row = s.documents.find((d) => d.id === draft.id),
    value = real.parseRealFrame(row),
    acceptanceId = randomUUID(),
    completed = { ...value, status: "completed", resultAssetId: row.id },
    normalAsset = real.realFrameAssetMutation(
      s,
      row,
      value,
      draft.pixels.output,
      row.id,
      acceptanceId,
    );
  await denied(f.videoSource(draft.id));
  await f.f.mutation(
    "document.save",
    f.cid,
    {
      id: row.id,
      title: row.title,
      status: row.status,
      body: visual.VISUAL_FRAME_PREFIX + JSON.stringify(completed),
    },
    row.revision,
    "campaign",
  );
  await f.f.mutation("asset.save", f.cid, normalAsset.payload, 0);
  const publicForgery = await f.snapshot();
  assert.ok(
    real.ownerAcceptedFrameAsset(
      publicForgery,
      publicForgery.assets.find((a) => a.id === draft.id),
    ),
  );
  const checks = await f.f.query(
    "select owner_acceptance_request_id from rpg_private.media_frame_checks where campaign_id=$1 and job_id=$2",
    [f.cid, draft.id],
  );
  assert.equal(checks[0].owner_acceptance_request_id, null);
  await denied(f.videoSource(draft.id));
});

test("direct completion rejects forged outputs/provenance, foreign owner and extra gameplay fields atomically", async () => {
  const f = await setup(),
    other = await setup(),
    approved = await f.frame(),
    q = await f.queueVideo(approved),
    p = pipeline(f, approved);
  await p.run("video.dispatch", await dispatchInput(f, q));
  const output = storedVideo(
      f.cid,
      q.record.id,
      mp4(),
      p.submissions[0].requestId,
      video.VIDEO_MODEL,
    ).output,
    x = await completionInput(f, q, output),
    before = await f.authoritative();
  await denied(f.complete(x.mutation, x.asset, x.output, f.f.other));
  await denied(
    f.complete(x.mutation, x.asset, {
      ...x.output,
      providerRequestId: randomUUID(),
    }),
  );
  await denied(
    f.complete(x.mutation, x.asset, {
      ...x.output,
      storagePath: `${other.cid}/videos/${q.record.id}/output.mp4`,
    }),
  );
  await denied(
    f.complete(x.mutation, x.asset, { ...x.output, sha256: "not_a_digest" }),
  );
  await denied(
    f.complete(x.mutation, x.asset, { ...x.output, actualModel: "unapproved" }),
  );
  await denied(
    f.complete(x.mutation, x.asset, {
      ...x.output,
      privatePatch: { secret: "forged" },
    }),
  );
  const badAsset = structuredClone(x.asset);
  badAsset.requestId = randomUUID();
  await denied(f.complete(x.mutation, badAsset, x.output));
  const cross = structuredClone(x.asset);
  cross.campaignId = other.cid;
  await denied(f.complete(x.mutation, cross, x.output));
  const badProvenance = structuredClone(x.asset),
    parsed = JSON.parse(
      badProvenance.payload.description.slice(video.VIDEO_ASSET_PREFIX.length),
    );
  parsed.source.ownerApprovalRequestId = randomUUID();
  badProvenance.payload.description =
    video.VIDEO_ASSET_PREFIX + JSON.stringify(parsed);
  await denied(f.complete(x.mutation, badProvenance, x.output));
  await denied(f.lifecycle(x.mutation));
  assert.equal(
    (await f.snapshot()).assets.filter((a) => a.kind === "video").length,
    0,
  );
  assert.deepEqual(await f.authoritative(), before);
  const result = await f.complete(x.mutation, x.asset, x.output);
  assert.deepEqual(await f.complete(x.mutation, x.asset, x.output), result);
  assert.deepEqual(await f.pixels(q.record.id), x.output);
  await denied(f.pixels(q.record.id, other.cid));
  await denied(f.pixels(q.record.id, f.cid, f.f.other));
});

for (const type of ["scene", "head", "timeline", "Canon", "source", "event"])
  test(`SQL refuses stale ${type} VIDEO dispatch and completion while preserving retained pixels`, async () => {
    const f = await setup(),
      approved = await f.frame(),
      q = await f.queueVideo(approved),
      p = pipeline(f, approved),
      dispatch = await dispatchInput(f, q);
    await p.run("video.dispatch", dispatch);
    const output = storedVideo(
        f.cid,
        q.record.id,
        mp4(),
        p.submissions[0].requestId,
        video.VIDEO_MODEL,
      ).output,
      x = await completionInput(f, q, output);
    p.outputs.set(q.record.id, { bytes: mp4(), output });
    await changeAuthority(f, type, approved);
    const before = await f.authoritative();
    await denied(f.complete(x.mutation, x.asset, x.output));
    await denied(p.poll(q.record.id));
    assert.deepEqual(await f.authoritative(), before);
    assert.equal(p.submissions.length, 1);
    assert.equal(p.polls.length, 0);
    assert.ok(p.outputs.has(q.record.id));
    assert.equal((await f.budget()).reserved_usd_micros, 7_600_000);
    const fresh = await setup(),
      freshFrame = await fresh.frame(),
      pending = await fresh.queueVideo(freshFrame),
      blocked = pipeline(fresh, freshFrame),
      staleDispatch = await dispatchInput(fresh, pending);
    await changeAuthority(fresh, type, freshFrame);
    await denied(fresh.claim(staleDispatch));
    await denied(blocked.run("video.dispatch", staleDispatch));
    assert.equal(blocked.submissions.length, 0);
    assert.equal((await fresh.budget()).reserved_usd_micros, 600000);
  });

test("private provider dispatch evidence is immutable, scoped and unavailable to browser roles", async () => {
  for (const role of ["anon", "authenticated", "service_role"]) {
    const grants = await base.one(
      "select has_function_privilege($1,'public.rpg_video_source(uuid,uuid,uuid)','execute') source,has_function_privilege($1,'public.rpg_video_claim(uuid,jsonb,uuid)','execute') claim,has_function_privilege($1,'public.rpg_video_submission(uuid,uuid,uuid,uuid)','execute') submission,has_function_privilege($1,'public.rpg_video_complete(uuid,jsonb,jsonb,jsonb)','execute') complete,has_function_privilege($1,'public.rpg_video_pixels(uuid,uuid,uuid)','execute') pixels,has_table_privilege($1,'rpg_private.media_video_submissions','select') evidence",
      [role],
    );
    assert.deepEqual(grants, {
      source: role === "service_role",
      claim: role === "service_role",
      submission: role === "service_role",
      complete: role === "service_role",
      pixels: role === "service_role",
      evidence: false,
    });
  }
  const f = await setup(),
    other = await setup(),
    approved = await f.frame(),
    q = await f.queueVideo(approved),
    p = pipeline(f, approved);
  await p.run("video.dispatch", await dispatchInput(f, q));
  const id = p.submissions[0].requestId;
  assert.equal(await f.submission(f.cid, q.record.id, id), id);
  await denied(f.submission(f.cid, q.record.id, randomUUID()));
  await denied(f.submission(other.cid, q.record.id));
  await denied(f.submission(f.cid, q.record.id, null, f.f.other));
  await p.poll(q.record.id);
  const before = await f.f.query(
    "select * from rpg_private.media_video_submissions where campaign_id=$1",
    [f.cid],
  );
  for (const sql of [
    "update rpg_private.media_video_submissions set provider_request_id=null where campaign_id=$1",
    "update rpg_private.media_video_submissions set output=null where campaign_id=$1",
    "update rpg_private.media_video_submissions set dispatch_request_id=gen_random_uuid() where campaign_id=$1",
    "update rpg_private.media_video_submissions set job_version_id=gen_random_uuid() where campaign_id=$1",
    "delete from rpg_private.media_video_submissions where campaign_id=$1",
  ])
    await denied(f.f.one(sql, [f.cid]));
  assert.deepEqual(
    await f.f.query(
      "select * from rpg_private.media_video_submissions where campaign_id=$1",
      [f.cid],
    ),
    before,
  );
});

test("actual fal adapter sends only scoped accepted PNG/public animation and fixed paid parameters, then reads the same request", async () => {
  const f = await setup(),
    other = await setup(),
    privateCanary = "VIDEO_DM_PRIVATE_CANARY",
    foreignCanary = "VIDEO_FOREIGN_CAMPAIGN_CANARY";
  await f.f.one(
    "update rpg_private.dm_state set contents=$2::jsonb where campaign_id=$1",
    [f.cid, JSON.stringify({ hidden: privateCanary })],
  );
  await f.f.mutation(
    "document.save",
    other.cid,
    {
      title: "Foreign private basis",
      status: "reference",
      body: foreignCanary,
    },
    0,
    "campaign",
  );
  await f.f.mutation(
    "document.save",
    f.cid,
    {
      title: "Unapproved appearance",
      status: "reference",
      body: "VIDEO_UNAPPROVED_REFERENCE_CANARY",
    },
    0,
    "campaign",
  );
  const approved = await f.frame({ status: "review_warning" }),
    q = await f.queueVideo(approved),
    p = pipeline(f, approved),
    requestId = randomUUID(),
    requests = [],
    bytes = mp4(),
    json = (body) =>
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
  p.deps.provider = falVideoProvider(
    "SYNTHETIC_OFFLINE_FAL_KEY",
    async (url, init) => {
      requests.push({ url, init });
      assert.equal(init.redirect, "error");
      if (url === "https://queue.fal.run/" + video.VIDEO_MODEL)
        return json({
          request_id: requestId,
          status: "IN_QUEUE",
          model: video.VIDEO_MODEL,
        });
      if (
        url ===
        `https://queue.fal.run/bytedance/seedance-2.5/requests/${requestId}/status?logs=0`
      )
        return json({
          request_id: requestId,
          status: "COMPLETED",
          model: video.VIDEO_MODEL,
        });
      if (
        url ===
        `https://queue.fal.run/bytedance/seedance-2.5/requests/${requestId}`
      )
        return json({
          video: {
            url: "https://v3.fal.media/files/offline-video.mp4",
            content_type: "video/mp4",
            file_size: bytes.length,
          },
          model: video.VIDEO_MODEL,
        });
      assert.equal(url, "https://v3.fal.media/files/offline-video.mp4");
      assert.equal(
        init.headers,
        undefined,
        "Provider credential must never accompany CDN bytes",
      );
      return new Response(bytes, {
        status: 200,
        headers: { "content-type": "video/mp4" },
      });
    },
  );
  const before = await f.authoritative();
  await p.run("video.dispatch", await dispatchInput(f, q));
  assert.equal((await p.poll(q.record.id)).status, "ready");
  assert.equal(requests.filter((r) => r.init.method === "POST").length, 1);
  const submit = requests[0],
    body = JSON.parse(submit.init.body);
  assert.deepEqual(Object.keys(body).sort(), [
    "aspect_ratio",
    "bitrate_mode",
    "codec",
    "duration",
    "generate_audio",
    "image_url",
    "prompt",
    "resolution",
  ]);
  assert.equal(
    body.image_url,
    "data:image/png;base64," +
      Buffer.from(approved.pixels.bytes).toString("base64"),
  );
  assert.equal(body.prompt, q.value.prompt);
  assert.equal(body.duration, "10");
  assert.equal(body.generate_audio, true);
  assert.equal(body.resolution, "720p");
  assert.equal(body.aspect_ratio, "auto");
  assert.equal(body.bitrate_mode, "standard");
  assert.equal(body.codec, "H264");
  assert.equal(submit.init.headers["X-Fal-No-Retry"], "1");
  assert.equal(
    submit.init.headers.Authorization,
    "Key SYNTHETIC_OFFLINE_FAL_KEY",
  );
  assert.doesNotMatch(
    JSON.stringify(body),
    /VIDEO_DM_PRIVATE_CANARY|PRIVATE_BEFORE_FORK|VIDEO_FOREIGN_CAMPAIGN_CANARY|VIDEO_UNAPPROVED_REFERENCE_CANARY|PRIVATE_QA_CANARY|ownerApprovalRequestId|expectedHeadId|canonGeneration|campaign_id|sourceVersionId|jobVersionId|privatePatch|publicPatch|SYNTHETIC_OFFLINE_FAL_KEY/,
  );
  assert.equal(requests.length, 4);
  assert.deepEqual(await f.authoritative(), before);
  assert.equal((await f.budget()).reserved_usd_micros, 7_600_000);
});

test("fal adapter refuses wrong-request status, unexpected model and arbitrary or credential-bearing result URLs", async () => {
  const requestId = randomUUID();
  for (const status of [
    { request_id: randomUUID(), status: "COMPLETED" },
    { request_id: requestId, status: "COMPLETED", model: "unapproved" },
  ]) {
    let calls = 0;
    const provider = falVideoProvider("OFFLINE", async () => {
      calls++;
      return new Response(JSON.stringify(status));
    });
    await denied(provider.poll(requestId, randomUUID(), randomUUID()));
    assert.equal(calls, 1);
  }
  for (const url of [
    "http://fal.media/files/output.mp4",
    "https://fal.media.evil/files/output.mp4",
    "https://user:pass@fal.media/files/output.mp4",
    "https://fal.media:8443/files/output.mp4",
    "https://fal.media/files/output.mp4?secret=token",
    "https://fal.media/files/output.mp4#fragment",
    "https://127.0.0.1/files/output.mp4",
    "https://storage.googleapis.com/another-bucket/output.mp4",
    "https://v3.fal.media/files/output.png",
    "file:///tmp/output.mp4",
  ]) {
    assert.equal(permittedVideoUrl(url), false, url);
    let calls = 0;
    const provider = falVideoProvider("OFFLINE", async () => {
      calls++;
      return new Response(
        JSON.stringify(
          calls === 1
            ? { request_id: requestId, status: "COMPLETED" }
            : { video: { url, content_type: "video/mp4", file_size: 32 } },
        ),
      );
    });
    await denied(provider.poll(requestId, randomUUID(), randomUUID()));
    assert.equal(calls, 2, "Disallowed URL is never downloaded");
  }
});

test("MP4/download boundary rejects HTML, truncated boxes, wrong content type and lying size metadata", async () => {
  assert.match(checkedMp4(mp4()), /^[a-f0-9]{64}$/);
  for (const bytes of [
    new Uint8Array(),
    new Uint8Array(Buffer.from("<html>not a clip</html>")),
    mp4().subarray(0, 30),
    new Uint8Array(Buffer.alloc(40)),
  ])
    assert.throws(() => checkedMp4(bytes), /unavailable/);
  const requestId = randomUUID();
  for (const kind of ["content", "size"]) {
    let calls = 0;
    const bytes = mp4(),
      provider = falVideoProvider("OFFLINE", async () => {
        calls++;
        if (calls === 1)
          return new Response(
            JSON.stringify({ request_id: requestId, status: "COMPLETED" }),
          );
        if (calls === 2)
          return new Response(
            JSON.stringify({
              video: {
                url: "https://fal.media/files/offline.mp4",
                content_type: "video/mp4",
                file_size: bytes.length + (kind === "size" ? 1 : 0),
              },
            }),
          );
        return new Response(bytes, {
          headers: {
            "content-type": kind === "content" ? "text/html" : "video/mp4",
          },
        });
      });
    await denied(provider.poll(requestId, randomUUID(), randomUUID()));
    assert.equal(calls, 3);
  }
});

test("failed or cancelled new VIDEO retains the previous FRAME and ready VIDEO assets", async () => {
  const f = await setup(),
    approved = await f.frame(),
    first = await f.queueVideo(approved),
    p = pipeline(f, approved);
  await p.run("video.dispatch", await dispatchInput(f, first));
  await p.poll(first.record.id);
  const retained = (await f.snapshot()).assets,
    failed = await f.queueVideo(approved, first.record.id),
    failure = pipeline(f, approved, ["failed"]);
  await failure.run("video.dispatch", await dispatchInput(f, failed));
  assert.equal((await failure.poll(failed.record.id)).status, "failed");
  const pending = await f.queueVideo(approved, failed.record.id),
    cancellation = await f.videoMutation(pending.record.id, {
      status: "cancelled",
    });
  await p.run("video.save", cancellation);
  assert.deepEqual((await f.snapshot()).assets, retained);
  assert.equal((await f.budget()).reserved_usd_micros, 14_600_000);
  assert.equal(failure.submissions.length, 1);
  assert.equal(p.submissions.length, 1);
});

async function commerce(f, w) {
  const merchant = (
      await f.mutation("entity.save", w.cid, {
        kind: "npc",
        name: "Synthetic merchant",
        details: "Public trader",
        hp: null,
        max_hp: null,
        stats: {},
        resources: { credits: 200 },
        conditions: [],
        equipment_slots: [],
      })
    ).id,
    stockStorage = (
      await f.mutation("storage.save", w.cid, {
        kind: "merchant",
        name: "Synthetic stock",
        entity_id: merchant,
      })
    ).id,
    stock = (
      await f.mutation("item.save", w.cid, {
        name: "Public lantern",
        category: "tool",
        quantity: 6,
        description: "Public stock",
        mechanics: "",
        owner_entity_id: merchant,
        storage_id: stockStorage,
        equipped_entity_id: null,
        equipped_slot: null,
      })
    ).id;
  await f.one(
    "update public.rpg_entities set resources=resources||'{\"credits\":100}'::jsonb,revision=revision+1 where id=$1",
    [w.hero],
  );
  const rpc = async (args) => {
      try {
        return {
          data: (
            await f.one(
              "select public.rpg_world($1,$2,$3,$4::jsonb,$5::jsonb) result",
              [
                args.p_owner_id,
                args.p_campaign_id,
                args.p_action,
                JSON.stringify(args.p_payload),
                JSON.stringify(args.p_timeline),
              ],
            )
          ).result,
        };
      } catch (error) {
        return { error: { message: error.message, code: error.code } };
      }
    },
    read = async () =>
      readFoundationLoop(rpc, f.owner, w.cid, await f.fence(w.cid)),
    store = createLoopStore(rpc, f.owner, w.cid),
    definitions = {
      currencies: [
        { id: "credits", label: "Credits", resourceKey: "credits", version: 1 },
      ],
      itemPolicies: [
        {
          itemId: stock,
          currencyId: "credits",
          unitValue: 10,
          version: 1,
          trade: "allowed",
          origin: "legitimate",
          visibility: "public",
        },
      ],
      merchants: [
        {
          actorId: merchant,
          entityId: merchant,
          label: "Synthetic merchant",
          version: 1,
          storageId: stockStorage,
          currencyIds: ["credits"],
          available: true,
          acceptsStolen: false,
          usesFunds: true,
          capacity: null,
          buyBasisPoints: 5000,
          sellBasisPoints: 10000,
          haggleLimitBasisPoints: 1000,
        },
      ],
    },
    context = await read(),
    command = loopCommand(context, randomUUID()),
    request = { command, kind: "commerce.configure", input: definitions };
  await store.commit(
    request,
    planCommerceConfiguration(context, command, definitions),
  );
  const current = await read(),
    tradeCommand = loopCommand(current, randomUUID()),
    input = createTradeQuote(current, tradeCommand, {
      merchantActorId: merchant,
      playerEntityId: w.hero,
      take: [{ itemId: stock, quantity: 2 }],
      give: [],
      currencyId: "credits",
      haggle: "none",
    }),
    trade = { command: tradeCommand, kind: "trade", input },
    plan = executeTradeQuote(current, input),
    result = await store.commit(trade, plan);
  return { merchant, stock, store, trade, plan, result };
}

for (const prefix of [24, 25, 26, 27, 28])
  test(`populated prefix-${prefix} commerce receipts/public-private state/save history remain exact through VIDEO migration29`, async () => {
    const f = await fixture(prefix);
    try {
      const w = await world(f, `Historical populated VIDEO prefix${prefix}`),
        c = await commerce(f, w),
        snapshot = await f.saves(w.cid, "campaign"),
        value = visual.buildFrame(snapshot, w.scene, [], "wide"),
        document = visual.visualDocumentMutation(snapshot, value),
        savedDoc = await f.mutation(
          "document.save",
          w.cid,
          document.payload,
          0,
          "campaign",
        ),
        row = (await f.saves(w.cid, "campaign")).documents.find(
          (d) => d.id === savedDoc.id,
        ),
        asset = visual.mockAssetMutation(
          await f.saves(w.cid, "campaign"),
          row,
          value,
        );
      await f.mutation("asset.save", w.cid, asset.payload);
      const old = await f.saves(w.cid, "campaign"),
        save = await f.saves(
          w.cid,
          "create",
          await f.command(w.cid, {
            kind: "manual",
            name: "Historical populated commerce/media",
          }),
        ),
        vault = await f.query(
          "select id,digest,payload from rpg_private.timeline_versions where campaign_id=$1 order by id",
          [w.cid],
        ),
        manifests = await f.query(
          "select * from rpg_private.timeline_manifests where campaign_id=$1 order by id",
          [w.cid],
        );
      for (const file of f.files.slice(prefix))
        await f.db.exec(await readFile(new URL(file, f.folder), "utf8"));
      assert.deepEqual(await c.store.commit(c.trade, c.plan), c.result);
      assert.deepEqual(await c.store.receipt(c.trade), c.result);
      const upgraded = await f.saves(w.cid, "campaign");
      // Stage 4 added item rarity (null for older rows); everything else stays exact.
      assert.deepEqual(upgraded.items, old.items.map((item) => ({ ...item, rarity: null })));
      assert.ok(upgraded.entities.every((entity) => entity.character_sheet === null));
      assert.deepEqual(
        upgraded.entities,
        old.entities.map((entity) => ({ ...entity, character_sheet: null, public_profile: {} })),
      );
      assert.deepEqual(upgraded.documents, old.documents);
      assert.deepEqual(upgraded.assets, old.assets);
      assert.equal(
        upgraded.entities.find((e) => e.id === w.hero).resources.credits,
        80,
      );
      assert.equal(
        upgraded.entities.find((e) => e.id === c.merchant).resources.credits,
        220,
      );
      assert.equal(upgraded.items.find((i) => i.id === c.stock).quantity, 4);
      assert.equal(
        visual.parseVisualMetadata(
          upgraded.documents.find((d) => d.id === row.id),
        ).schema,
        1,
      );
      assert.ok(visual.mockArtForAsset(upgraded.assets[0]));
      assert.equal(
        real.ownerAcceptedFrameAsset(upgraded, upgraded.assets[0]),
        null,
      );
      assert.deepEqual(
        await f.query(
          "select id,digest,payload from rpg_private.timeline_versions where campaign_id=$1 and id=any($2::uuid[]) order by id",
          [w.cid, vault.map((v) => v.id)],
        ),
        vault,
      );
      assert.deepEqual(
        await f.query(
          "select * from rpg_private.timeline_manifests where campaign_id=$1 and id=any($2::uuid[]) order by id",
          [w.cid, manifests.map((m) => m.id)],
        ),
        manifests,
      );
      await f.saves(
        w.cid,
        "load",
        await f.command(w.cid, {
          saveId: save.saveId,
          label: "Owner reads historical point",
          recovery: false,
        }),
      );
      const loaded = await f.saves(w.cid, "campaign");
      assert.deepEqual(loaded.items, old.items.map((item) => ({ ...item, rarity: null })));
      assert.ok(loaded.entities.every((entity) => entity.character_sheet === null));
      assert.deepEqual(
        loaded.entities,
        old.entities.map((entity) => ({ ...entity, character_sheet: null, public_profile: {} })),
      );
      assert.equal(
        (
          await f.one(
            "select contents from rpg_private.dm_state where campaign_id=$1",
            [w.cid],
          )
        ).contents.fact.secret,
        "PRIVATE_BEFORE_FORK",
      );
      assert.deepEqual(
        await f.query(
          "select id,digest,payload from rpg_private.timeline_versions where campaign_id=$1 and id=any($2::uuid[]) order by id",
          [w.cid, vault.map((v) => v.id)],
        ),
        vault,
      );
    } finally {
      await f.db.close();
    }
  });

test("ready VIDEO history remains readable after save/load while its archived basis cannot dispatch again", async () => {
  const f = await setup(),
    approved = await f.frame(),
    q = await f.queueVideo(approved),
    p = pipeline(f, approved);
  await p.run("video.dispatch", await dispatchInput(f, q));
  await p.poll(q.record.id);
  const completed = await f.snapshot(),
    oldRecord = completed.documents.find((d) => d.id === q.record.id),
    oldAsset = completed.assets.find((a) => a.id === q.record.id),
    oldValue = video.parseSceneVideo(oldRecord),
    output = await f.pixels(q.record.id),
    save = await f.f.saves(
      f.cid,
      "create",
      await f.f.command(f.cid, {
        kind: "manual",
        name: "Completed VIDEO history",
      }),
    ),
    manifests = await f.f.query(
      "select * from rpg_private.timeline_manifests where campaign_id=$1 order by id",
      [f.cid],
    );
  await f.f.saves(
    f.cid,
    "load",
    await f.f.command(f.cid, {
      saveId: save.saveId,
      label: "Archived public scene art",
      recovery: false,
    }),
  );
  const loaded = await f.snapshot();
  assert.deepEqual(
    loaded.assets.find((a) => a.id === q.record.id),
    oldAsset,
  );
  assert.equal(
    video.parseSceneVideo(loaded.documents.find((d) => d.id === q.record.id))
      .status,
    "ready",
  );
  assert.ok(video.safeVideoAsset(loaded, oldAsset));
  assert.deepEqual(await f.pixels(q.record.id), output);
  assert.equal(video.videoIsCurrent(loaded, oldValue, await f.source()), false);
  await denied(f.complete(...p.completions[0]));
  assert.equal((await p.poll(q.record.id)).status, "ready");
  assert.equal(p.submissions.length, 1);
  assert.equal(p.polls.length, 1);
  assert.deepEqual(
    await f.f.query(
      "select * from rpg_private.timeline_manifests where campaign_id=$1 and id=any($2::uuid[]) order by id",
      [f.cid, manifests.map((m) => m.id)],
    ),
    manifests,
  );
});

test("VIDEO lifecycle preserves an exact Lab continuation; ordinary owner correction still invalidates it", async () => {
  const previousOverride = process.env.D2A_SOURCE_ROOT;
  process.env.D2A_SOURCE_ROOT = fileURLToPath(root);
  const { integrationFixture, command } = await import(
    new URL("tests/d2a-integration-fixture.mjs", root)
  );
  if (previousOverride === undefined) delete process.env.D2A_SOURCE_ROOT;
  else process.env.D2A_SOURCE_ROOT = previousOverride;
  const integrated = await integrationFixture({
    beforeSave: async (f) => {
      for (const file of f.files.slice(16))
        await f.db.exec(await readFile(new URL(file, f.folder), "utf8"));
    },
  });
  try {
    const f = await setup(integrated, 20_000_000, integrated),
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
      },
      checkpoint = await integrated.lab("continuation_base", selection),
      before = await f.authoritative(),
      frame = await f.frame(),
      first = await f.queueVideo(frame),
      p = pipeline(f, frame);
    await p.run("video.dispatch", await dispatchInput(f, first));
    await p.poll(first.record.id);
    const next = await f.queueVideo(frame, first.record.id),
      failed = pipeline(f, frame, ["failed"]);
    await failed.run("video.dispatch", await dispatchInput(f, next));
    await failed.poll(next.record.id);
    const queued = await f.queueVideo(frame, next.record.id);
    await p.run(
      "video.save",
      await f.videoMutation(queued.record.id, { status: "cancelled" }),
    );
    assert.deepEqual(await f.authoritative(), before);
    assert.deepEqual(
      await integrated.lab("continuation_base", selection),
      checkpoint,
    );
    const { createLabContinuationService } = await import(
        new URL("src/lib/world-lab/continuation.ts", root)
      ),
      continuation = createLabContinuationService({
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
      }),
      interpreted = await continuation.perform({
        action: "interpret",
        input: {
          operationId: randomUUID(),
          campaignId: integrated.cid,
          source: selection,
          premise: "Synthetic continuation after optional VIDEO.",
          model: {
            providerId: "openai",
            modelId: "gpt-6-astra",
            reasoning: "max",
          },
        },
      }),
      child = await continuation.perform({
        action: "approve",
        input: {
          operationId: randomUUID(),
          campaignId: integrated.cid,
          source: selection,
          versionId: interpreted.draft.versionId,
        },
      });
    assert.equal(child.run.status, "prepared");
    const sourceBefore = await f.source();
    await integrated.mutation(
      "document.save",
      integrated.cid,
      {
        title: "Ordinary owner correction",
        status: "reference",
        body: "The owner corrected public Canon.",
      },
      0,
      "campaign",
    );
    assert.ok(
      (await f.source()).canonGeneration > sourceBefore.canonGeneration,
    );
    assert.equal(
      (
        await continuation.inspect(
          integrated.cid,
          parent.id,
          selection.sourceCheckpointId,
        )
      ).eligible,
      false,
    );
  } finally {
    await integrated.db.close();
  }
});

test("ordinary document correction cannot acquire lifecycle immunity by using a valid VIDEO prefix", async () => {
  const f = await setup(),
    approved = await f.frame(),
    q = await f.queueVideo(approved),
    p = pipeline(f, approved),
    before = await f.source(),
    row = await f.record(q.record.id),
    original = video.parseSceneVideo(row),
    changed = {
      ...original,
      prompt: original.prompt + " Owner corrected the presentation guidance.",
    };
  await f.f.mutation(
    "document.save",
    f.cid,
    {
      id: row.id,
      title: row.title,
      status: row.status,
      body: video.VIDEO_PREFIX + JSON.stringify(changed),
    },
    row.revision,
    "campaign",
  );
  assert.ok((await f.source()).canonGeneration > before.canonGeneration);
  await denied(p.run("video.dispatch", await dispatchInput(f, q)));
  assert.equal(p.submissions.length, 0);
  assert.equal((await f.budget()).reserved_usd_micros, 600000);
});

test("VIDEO pins the exact genuinely owner-approved FRAME and permits warning drafts only after acceptance", async () => {
  const f = await setup(),
    accepted = await f.frame({ status: "review_warning" }),
    snapshot = await f.snapshot(),
    asset = snapshot.assets.find((a) => a.id === accepted.id),
    info = real.ownerAcceptedFrameAsset(snapshot, asset),
    value = video.buildSceneVideo(snapshot, accepted.id, await f.source());
  assert.deepEqual(value.source, {
    assetId: asset.id,
    assetRevision: asset.revision,
    frameJobId: accepted.id,
    frameVersionId: accepted.record.current_version_id,
    imageSha256: info.output.sha256,
    ownerApprovalRequestId: accepted.acceptance.requestId,
  });
  assert.deepEqual(value.basis, real.parseRealFrame(accepted.record).basis);
  assert.deepEqual(value.parameters, {
    resolution: "720p",
    duration: "10",
    aspectRatio: "auto",
    generateAudio: true,
    bitrateMode: "standard",
    codec: "H264",
  });
  assert.equal(value.dispatch, null);
  assert.equal(video.videoIsCurrent(snapshot, value, await f.source()), true);
  const parsed = video.parseSceneVideo({
    body: video.VIDEO_PREFIX + JSON.stringify(value),
  });
  assert.deepEqual(parsed, value);
  assert.doesNotMatch(value.prompt, /PRIVATE_BEFORE_FORK|PRIVATE_QA_CANARY/);
});

test("unaccepted/discarded FRAME, foreign source and historical never-approved art are not VIDEO sources", async () => {
  const f = await setup(),
    other = await setup(),
    draft = await f.frame({ accept: false }),
    foreign = await other.frame(),
    source = await f.source();
  const s = await f.snapshot();
  assert.throws(() => video.buildSceneVideo(s, draft.id, source), /conflict/);
  assert.throws(() => video.buildSceneVideo(s, foreign.id, source), /conflict/);
  await f.frameLifecycle(
    await f.frameMutation(draft.id, { status: "discarded" }),
  );
  const discarded = await f.snapshot();
  assert.throws(
    () => video.buildSceneVideo(discarded, draft.id, source),
    /conflict/,
  );
  const accepted = await f.frame(),
    historical = await f.snapshot(),
    asset = historical.assets.find((a) => a.id === accepted.id),
    info = real.realFrameAssetInfo(asset);
  delete info.ownerApproval;
  asset.description = real.REAL_FRAME_ASSET_PREFIX + JSON.stringify(info);
  assert.ok(real.safeFrameAsset(historical, asset));
  assert.equal(real.ownerAcceptedFrameAsset(historical, asset), null);
  assert.throws(
    () => video.buildSceneVideo(historical, accepted.id, source),
    /conflict/,
  );
});

test("VIDEO readers reject extra gameplay patches, private reference basis and malformed fixed parameters", async () => {
  const f = await setup(),
    approved = await f.frame(),
    s = await f.snapshot(),
    value = video.buildSceneVideo(s, approved.id, await f.source());
  const alter = [
    (v) => {
      v.privatePatch = { secret: "FORGED_PRIVATE_PATCH" };
    },
    (v) => {
      v.parameters.duration = "5";
    },
    (v) => {
      v.parameters.generateAudio = false;
    },
    (v) => {
      v.parameters.hiddenEndFrame = true;
    },
    (v) => {
      v.source.assetId = randomUUID();
    },
    (v) => {
      v.source.assetRevision = 0;
    },
    (v) => {
      v.source.ownerApprovalRequestId = null;
    },
    (v) => {
      v.source.imageSha256 = "NOT_A_DIGEST";
    },
    (v) => {
      v.basis.references.push({ private: "FORGED_PRIVATE_REFERENCE" });
    },
    (v) => {
      v.status = "ready";
    },
    (v) => {
      v.model = "unapproved-video-model";
    },
    (v) => {
      v.dispatch = { requestId: randomUUID(), reservationUsdMicros: 1 };
    },
  ];
  for (const change of alter) {
    const changed = structuredClone(value);
    change(changed);
    assert.equal(
      video.parseSceneVideo({
        body: video.VIDEO_PREFIX + JSON.stringify(changed),
      }),
      null,
    );
  }
});

async function changeAuthority(f, type, approved) {
  if (type === "scene") {
    const row = (await f.snapshot()).scenes.find((s) => s.id === f.scene);
    await f.f.mutation(
      "scene.save",
      f.cid,
      {
        id: row.id,
        session_id: row.session_id,
        role: row.role,
        title: row.title,
        body: row.body + " Owner corrected the visible public action.",
      },
      row.revision,
    );
  } else if (type === "Canon") {
    await f.f.mutation(
      "document.save",
      f.cid,
      {
        title: "Ordinary owner fact",
        status: "reference",
        body: "The owner corrected a public fact.",
      },
      0,
      "campaign",
    );
  } else if (type === "source") {
    const asset = (await f.snapshot()).assets.find((a) => a.id === approved.id);
    await f.f.mutation(
      "asset.save",
      f.cid,
      {
        id: asset.id,
        title: asset.title + " Owner correction",
        kind: asset.kind,
        storage_path: asset.storage_path,
        description: asset.description,
      },
      asset.revision,
    );
  } else if (type === "event") {
    await commitEvent(f.f, f);
  } else {
    const save = await f.f.saves(
      f.cid,
      "create",
      await f.f.command(f.cid, {
        kind: "manual",
        name: "Changed VIDEO head",
      }),
    );
    if (type === "timeline")
      await f.f.saves(
        f.cid,
        "load",
        await f.f.command(f.cid, {
          saveId: save.saveId,
          label: "Owner loaded a separate branch",
          recovery: false,
        }),
      );
  }
}

for (const type of ["scene", "head", "timeline", "Canon", "source", "event"])
  test(`an inherited ${type} change invalidates an existing VIDEO basis`, async () => {
    const f = await setup(),
      approved = await f.frame(),
      value = video.buildSceneVideo(
        await f.snapshot(),
        approved.id,
        await f.source(),
      );
    assert.equal(
      video.videoIsCurrent(await f.snapshot(), value, await f.source()),
      true,
    );
    const before = await f.source();
    await changeAuthority(f, type, approved);
    assert.equal(
      video.videoIsCurrent(await f.snapshot(), value, await f.source()),
      false,
    );
    if (type === "Canon")
      assert.ok((await f.source()).canonGeneration > before.canonGeneration);
  });

for (const [prefix, schema] of [
  [26, 2],
  [27, 3],
  [28, 4],
])
  test(`genuine migration-${prefix} schema-${schema} FRAME history and save upgrade without rewriting approval`, async () => {
    const previous = await fixture(prefix);
    try {
      const f = await setup(previous),
        approved = await f.frame({ legacy: schema < 4 ? schema : null }),
        oldSnapshot = await f.snapshot(),
        oldAsset = oldSnapshot.assets.find((a) => a.id === approved.id),
        oldRecord = oldSnapshot.documents.find((d) => d.id === approved.id),
        oldBudget = await f.budget(),
        save = await previous.saves(
          f.cid,
          "create",
          await previous.command(f.cid, {
            kind: "manual",
            name: `Historical schema-${schema} art`,
          }),
        );
      const manifests = () =>
          previous.query(
            "select m.* from rpg_private.timeline_manifests m join rpg_private.save_points s on s.campaign_id=m.campaign_id and s.manifest_id=m.id where s.campaign_id=$1 and s.id=$2",
            [f.cid, save.saveId],
          ),
        originalManifests = await manifests();
      for (const file of previous.files.slice(prefix))
        await previous.db.exec(
          await readFile(new URL(file, previous.folder), "utf8"),
        );
      const current = await f.snapshot();
      assert.deepEqual(
        current.assets.find((a) => a.id === approved.id),
        oldAsset,
      );
      assert.deepEqual(
        current.documents.find((d) => d.id === approved.id),
        oldRecord,
      );
      assert.ok(real.safeFrameAsset(current, oldAsset));
      if (schema < 4) {
        assert.equal(real.ownerAcceptedFrameAsset(current, oldAsset), null);
        assert.equal(
          real.realFrameAssetInfo(oldAsset).ownerApproval,
          undefined,
        );
      } else {
        assert.equal(
          real.ownerAcceptedFrameAsset(current, oldAsset).ownerApproval
            .requestId,
          approved.acceptance.requestId,
        );
      }
      assert.deepEqual(
        await f.rpc("rpg_real_frame_complete", [
          approved.acceptance,
          approved.assetMutation,
          approved.pixels.output,
        ]),
        approved.acceptedReceipt,
      );
      assert.deepEqual(await f.budget(), {
        ...oldBudget,
        video_model: null,
        maximum_video_calls: 0,
      });
      assert.deepEqual(await manifests(), originalManifests);
      await previous.saves(
        f.cid,
        "load",
        await previous.command(f.cid, {
          saveId: save.saveId,
          label: "Historical media read",
          recovery: false,
        }),
      );
      const loaded = await f.snapshot();
      assert.equal(
        real.parseRealFrame(loaded.documents.find((d) => d.id === approved.id))
          .schema,
        schema,
      );
      assert.ok(
        real.safeFrameAsset(
          loaded,
          loaded.assets.find((a) => a.id === approved.id),
        ),
      );
      assert.deepEqual(await manifests(), originalManifests);
    } finally {
      await previous.db.close();
    }
  });
