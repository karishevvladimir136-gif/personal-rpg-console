import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import {
  buildMapVisualJob,
  mapVisualAssetMutation,
  mapVisualDocumentMutation,
  parseMapVisualJob,
  safeMapVisualAsset,
} from "../src/lib/visual-frame/map-job.ts";

const model = "gpt-image-2.5-sunburst-2026-09-08";
const parameters = { size: "1536x1024", quality: "high", outputFormat: "png", n: 1 };
const call = (f, sql, args) => f.one(sql, args).then((row) => row.result);
const snapshot = (f, cid) => f.saves(cid, "campaign");
const placements = async (f, cid) => (await call(f,
  "select public.rpg_map_layout($1,$2,'read','{}'::jsonb,$3::jsonb) result",
  [f.owner, cid, JSON.stringify(await f.fence(cid))])).placements;
const sourceProof = async (f, cid) => call(f,
  "select public.rpg_frame_basis($1,$2,$3::jsonb) result",
  [f.owner, cid, JSON.stringify(await f.fence(cid))]);

test("map media schema 6 uses existing reservation, paid review, private draft and explicit owner acceptance", async () => {
  const f = await fixture(41);
  try {
    const w = await world(f);
    await call(f, "select public.rpg_map_layout($1,$2,'save',$3::jsonb,$4::jsonb) result", [
      f.owner, w.cid,
      JSON.stringify({
        requestId: randomUUID(), locationId: w.location,
        expectedRevision: null, level: "world", parentLocationId: null,
        x: 0.4, y: 0.6,
      }),
      JSON.stringify(await f.fence(w.cid)),
    ]);
    const budget = randomUUID();
    await f.one("select public.rpg_media_budget_prepare($1,$2,$3,1200000,2)", [
      f.owner, budget, model,
    ]);
    const first = await snapshot(f, w.cid);
    const job = buildMapVisualJob(first, await placements(f, w.cid), "world", null,
      [], model, parameters, await sourceProof(f, w.cid));
    assert.equal(job.basis.anchor, null);
    assert.equal(job.basis.locations.length, 1);
    assert.equal(job.prompt.includes("Synthetic crossing"), true);
    assert.equal(job.prompt.includes("PRIVATE_BEFORE_FORK"), false);
    const queue = { ...mapVisualDocumentMutation(first, job), requestId: randomUUID() };
    const created = await call(f,
      "select public.rpg_map_visual_lifecycle($1,$2::jsonb) result",
      [f.owner, JSON.stringify(queue)]);
    const saved = await snapshot(f, w.cid);
    const record = saved.documents.find((row) => row.id === created.id);
    assert.equal(parseMapVisualJob(record).status, "queued");
    const generating = {
      ...job, status: "generating",
      dispatch: { requestId: randomUUID(), reservationUsdMicros: 400000 },
    };
    const dispatch = {
      ...mapVisualDocumentMutation(saved, generating, record),
      requestId: generating.dispatch.requestId,
    };
    const claim = await call(f,
      "select public.rpg_map_visual_claim($1,$2::jsonb,$3) result",
      [f.owner, JSON.stringify(dispatch), budget]);
    assert.equal(claim.claimed, true);
    assert.equal((await call(f,
      "select public.rpg_map_visual_claim($1,$2::jsonb,$3) result",
      [f.owner, JSON.stringify(dispatch), budget])).claimed, false);
    const active = await snapshot(f, w.cid);
    const activeRecord = active.documents.find((row) => row.id === created.id);
    const output = {
      storagePath: w.cid + "/frames/" + created.id + "/output.png",
      sha256: "a".repeat(64), bytes: 100, contentType: "image/png",
      usage: { textInputTokens: 100, imageInputTokens: 0, outputTokens: 1372 },
      providerRequestId: "synthetic_only",
    };
    await call(f, "select public.rpg_frame_check_claim($1,$2,$3,$4,$5) result", [
      f.owner, w.cid, created.id, activeRecord.current_version_id, output.sha256,
    ]);
    await call(f, "select public.rpg_frame_check_complete($1,$2,$3,$4,$5,$6::jsonb) result", [
      f.owner, w.cid, created.id, activeRecord.current_version_id, output.sha256,
      JSON.stringify({
        schemaVersion: 2,
        verdict: { schemaVersion: 2, status: "safe_to_review", reasons: [] },
        actualModel: "gpt-5.4", inputTokens: 100, outputTokens: 100, latencyMs: 100,
      }),
    ]);
    const draft = {
      ...generating, status: "draft",
      review: { status: "safe_to_review", imageSha256: output.sha256 },
    };
    await call(f, "select public.rpg_map_visual_draft($1,$2::jsonb,$3::jsonb) result", [
      f.owner,
      JSON.stringify({
        ...mapVisualDocumentMutation(active, draft, activeRecord),
        requestId: created.id,
      }),
      JSON.stringify(output),
    ]);
    const beforeAccept = await snapshot(f, w.cid);
    assert.equal(beforeAccept.assets.find((asset) => asset.id === created.id), undefined);
    assert.equal(parseMapVisualJob(beforeAccept.documents.find((row) => row.id === created.id)).status, "draft");
    const draftRecord = beforeAccept.documents.find((row) => row.id === created.id);
    const accepted = { ...draft, status: "completed", resultAssetId: created.id };
    const approvalRequestId = randomUUID();
    const acceptMutation = {
      ...mapVisualDocumentMutation(beforeAccept, accepted, draftRecord),
      requestId: approvalRequestId,
    };
    const assetMutation = {
      ...mapVisualAssetMutation(beforeAccept, draftRecord, accepted, output, approvalRequestId),
      requestId: draftRecord.current_version_id,
    };
    await call(f,
      "select public.rpg_map_visual_complete($1,$2::jsonb,$3::jsonb,$4::jsonb) result",
      [f.owner, JSON.stringify(acceptMutation), JSON.stringify(assetMutation), JSON.stringify(output)]);
    const completed = await snapshot(f, w.cid);
    const asset = completed.assets.find((row) => row.id === created.id);
    assert.ok(asset);
    assert.ok(safeMapVisualAsset(completed, asset, await placements(f, w.cid)));
    const replay = await call(f,
      "select public.rpg_map_visual_complete($1,$2::jsonb,$3::jsonb,$4::jsonb) result",
      [f.owner, JSON.stringify(acceptMutation), JSON.stringify(assetMutation), JSON.stringify(output)]);
    assert.equal(replay.id, created.id);
  } finally {
    await f.db.close();
  }
});

test("map media rejects tampered prompt and cross-campaign basis without changing rows", async () => {

  const f = await fixture(41);
  try {
    const w = await world(f);
    const first = await snapshot(f, w.cid);
    const job = buildMapVisualJob(first, [], "world", null, [],
      model, parameters, await sourceProof(f, w.cid));
    const before = await f.one("select count(*)::integer n from public.rpg_documents where campaign_id=$1", [w.cid]);
    const badPrompt = { ...job, prompt: job.prompt + "\nPrivate hidden city" };
    await assert.rejects(call(f,
      "select public.rpg_map_visual_lifecycle($1,$2::jsonb) result",
      [f.owner, JSON.stringify({
        ...mapVisualDocumentMutation(first, badPrompt), requestId: randomUUID(),
      })]));
    const other = await world(f, "Other map");
    await assert.rejects(call(f,
      "select public.rpg_map_visual_lifecycle($1,$2::jsonb) result",
      [f.owner, JSON.stringify({
        ...mapVisualDocumentMutation(first, job),
        campaignId: other.cid,
        timeline: await f.fence(other.cid),
        requestId: randomUUID(),
      })]));
    const after = await f.one("select count(*)::integer n from public.rpg_documents where campaign_id=$1", [w.cid]);
    assert.equal(after.n, before.n);
  } finally {
    await f.db.close();
  }
});

test("an old playable save cannot authorize draft pixels from a later map basis", async () => {
  const f = await fixture(41);
  try {
    const w = await world(f);
    const before = await f.saves(w.cid, "create", await f.command(w.cid,
      { kind: "manual", name: "Before later map place" }));
    const later = (await f.mutation("location.save", w.cid, {
      name: "Later discovered coast",
      description: "Visible only after the earlier save",
      status: "known",
    })).id;
    await call(f, "select public.rpg_map_layout($1,$2,'save',$3::jsonb,$4::jsonb) result", [
      f.owner, w.cid,
      JSON.stringify({
        requestId: randomUUID(), locationId: later,
        expectedRevision: null, level: "world", parentLocationId: null,
        x: 0.5, y: 0.5,
      }), JSON.stringify(await f.fence(w.cid)),
    ]);
    const budget = randomUUID();
    await f.one("select public.rpg_media_budget_prepare($1,$2,$3,1200000,2)", [
      f.owner, budget, model,
    ]);
    const first = await snapshot(f, w.cid);
    const job = buildMapVisualJob(first, await placements(f, w.cid), "world", null,
      [], model, parameters, await sourceProof(f, w.cid));
    const created = await call(f,
      "select public.rpg_map_visual_lifecycle($1,$2::jsonb) result",
      [f.owner, JSON.stringify({
        ...mapVisualDocumentMutation(first, job), requestId: randomUUID(),
      })]);
    const queued = await snapshot(f, w.cid);
    const queuedRecord = queued.documents.find((row) => row.id === created.id);
    const generating = {
      ...job, status: "generating",
      dispatch: { requestId: randomUUID(), reservationUsdMicros: 400000 },
    };
    await call(f, "select public.rpg_map_visual_claim($1,$2::jsonb,$3) result", [
      f.owner, JSON.stringify({
        ...mapVisualDocumentMutation(queued, generating, queuedRecord),
        requestId: generating.dispatch.requestId,
      }), budget,
    ]);
    const active = await snapshot(f, w.cid);
    const activeRecord = active.documents.find((row) => row.id === created.id);
    const output = {
      storagePath: w.cid + "/frames/" + created.id + "/output.png",
      sha256: "b".repeat(64), bytes: 100, contentType: "image/png",
      usage: null, providerRequestId: "synthetic_only",
    };
    await call(f, "select public.rpg_frame_check_claim($1,$2,$3,$4,$5) result", [
      f.owner, w.cid, created.id, activeRecord.current_version_id, output.sha256,
    ]);
    await call(f, "select public.rpg_frame_check_complete($1,$2,$3,$4,$5,$6::jsonb) result", [
      f.owner, w.cid, created.id, activeRecord.current_version_id, output.sha256,
      JSON.stringify({
        schemaVersion: 2,
        verdict: { schemaVersion: 2, status: "safe_to_review", reasons: [] },
        actualModel: "gpt-5.4", inputTokens: 100, outputTokens: 100, latencyMs: 100,
      }),
    ]);
    const draft = {
      ...generating, status: "draft",
      review: { status: "safe_to_review", imageSha256: output.sha256 },
    };
    await call(f, "select public.rpg_map_visual_draft($1,$2::jsonb,$3::jsonb) result", [
      f.owner, JSON.stringify({
        ...mapVisualDocumentMutation(active, draft, activeRecord),
        requestId: created.id,
      }), JSON.stringify(output),
    ]);
    assert.ok(await call(f,
      "select public.rpg_map_visual_draft_pixels($1,$2,$3) result",
      [f.owner, w.cid, created.id]));
    await f.saves(w.cid, "load", await f.command(w.cid, {
      recovery: true, saveId: before.saveId, label: "Earlier playable fork",
    }));
    const old = await snapshot(f, w.cid);
    assert.equal(old.locations.some((row) => row.id === later), false);
    await assert.rejects(call(f,
      "select public.rpg_map_visual_draft_pixels($1,$2,$3) result",
      [f.owner, w.cid, created.id]));
  } finally {
    await f.db.close();
  }
});
