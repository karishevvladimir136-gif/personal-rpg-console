import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import {
  buildSubjectVisualJob,
  parseSubjectVisualJob,
  subjectVisualAssetMutation,
  subjectVisualDocumentMutation,
} from "../src/lib/visual-frame/subject-job.ts";

const migration = new URL(
  "../supabase/migrations/202610060041_map_atlas_v2.sql", import.meta.url,
);
const location = (name, status = "known") => ({ name, description: "Synthetic public place", status });

async function setup() {
  const f = await fixture(40);
  await f.db.exec(await readFile(migration, "utf8"));
  return f;
}

async function save(f, cid, locationId, level, parentLocationId = null, options = {}) {
  const payload = {
    requestId: options.requestId ?? randomUUID(),
    locationId,
    expectedRevision: options.expectedRevision ?? null,
    level,
    parentLocationId,
    x: options.x ?? null,
    y: options.y ?? null,
  };
  return (await f.one(
    "select public.rpg_map_layout($1,$2,'save',$3::jsonb,$4::jsonb) result",
    [f.owner, cid, JSON.stringify(payload),
      JSON.stringify(options.timeline ?? await f.fence(cid))],
  )).result.placement;
}

async function read(f, cid, timeline) {
  return (await f.one(
    "select public.rpg_map_layout($1,$2,'read','{}'::jsonb,$3::jsonb) result",
    [f.owner, cid, JSON.stringify(timeline ?? await f.fence(cid))],
  )).result;
}

async function acceptedSubjectVisual(f, w) {
  const call = async (sql, args) => (await f.one(sql, args)).result;
  const snapshot = () => f.saves(w.cid, "campaign");
  const source = await call("select public.rpg_frame_basis($1,$2,$3::jsonb) result", [
    f.owner, w.cid, JSON.stringify(await f.fence(w.cid)),
  ]);
  const first = await snapshot();
  const queued = buildSubjectVisualJob(first, {kind: "location", id: w.location}, [],
    "gpt-image-2.5-sunburst-2026-09-08",
    {size: "1536x1024", quality: "high", outputFormat: "png", n: 1}, source);
  const created = await call("select public.rpg_subject_visual_lifecycle($1,$2::jsonb) result", [
    f.owner, JSON.stringify({
      ...subjectVisualDocumentMutation(first, queued), requestId: randomUUID(),
    }),
  ]);
  const queuedSnapshot = await snapshot();
  const queuedRecord = queuedSnapshot.documents.find((row) => row.id === created.id);
  const generating = {...queued, status: "generating",
    dispatch: {requestId: randomUUID(), reservationUsdMicros: 400000}};
  const budgetId = randomUUID();
  await f.one("select public.rpg_media_budget_prepare($1,$2,$3,1200000,2)", [
    f.owner, budgetId, queued.model,
  ]);
  await call("select public.rpg_subject_visual_claim($1,$2::jsonb,$3) result", [
    f.owner, JSON.stringify({
      ...subjectVisualDocumentMutation(queuedSnapshot, generating, queuedRecord),
      requestId: generating.dispatch.requestId,
    }), budgetId,
  ]);
  const active = await snapshot();
  const activeRecord = active.documents.find((row) => row.id === created.id);
  const output = {
    storagePath: `${w.cid}/frames/${created.id}/output.png`,
    sha256: "a".repeat(64), bytes: 100, contentType: "image/png",
    usage: {textInputTokens: 100, imageInputTokens: 0, outputTokens: 1372},
    providerRequestId: "synthetic_only",
  };
  await call("select public.rpg_frame_check_claim($1,$2,$3,$4,$5) result", [
    f.owner, w.cid, created.id, activeRecord.current_version_id, output.sha256,
  ]);
  await call("select public.rpg_frame_check_complete($1,$2,$3,$4,$5,$6::jsonb) result", [
    f.owner, w.cid, created.id, activeRecord.current_version_id, output.sha256,
    JSON.stringify({schemaVersion: 2,
      verdict: {schemaVersion: 2, status: "safe_to_review", reasons: []},
      actualModel: "gpt-5.4", inputTokens: 100, outputTokens: 100, latencyMs: 100}),
  ]);
  const draft = {...generating, status: "draft",
    review: {status: "safe_to_review", imageSha256: output.sha256}};
  await call("select public.rpg_subject_visual_draft($1,$2::jsonb,$3::jsonb) result", [
    f.owner, JSON.stringify({
      ...subjectVisualDocumentMutation(active, draft, activeRecord),
      requestId: created.id,
    }), JSON.stringify(output),
  ]);
  const beforeAccept = await snapshot();
  const draftRecord = beforeAccept.documents.find((row) => row.id === created.id);
  const completed = {...draft, status: "completed", resultAssetId: created.id};
  const approvalRequest = randomUUID();
  await call("select public.rpg_subject_visual_complete($1,$2::jsonb,$3::jsonb,$4::jsonb) result", [
    f.owner,
    JSON.stringify({
      ...subjectVisualDocumentMutation(beforeAccept, completed, draftRecord),
      requestId: approvalRequest,
    }),
    JSON.stringify({
      ...subjectVisualAssetMutation(beforeAccept, draftRecord, completed,
        output, approvalRequest), requestId: draftRecord.current_version_id,
    }),
    JSON.stringify(output),
  ]);
  const accepted = await snapshot();
  assert.equal(parseSubjectVisualJob(accepted.documents.find((row) =>
    row.id === created.id)).status, "completed");
  assert.ok(accepted.assets.some((row) => row.id === created.id));
  return created.id;
}

test("populated migration 39 to 40 to 41 preserves RPG rows and adds service-only map authority", async () => {
  const f = await fixture(39);
  try {
    assert.deepEqual(f.files.slice(37, 41), [
      "202610060038_astra_primary_runtime.sql",
      "202610060039_astra_world_logic_takeover.sql",
      "202610060040_standalone_visual_jobs.sql",
      "202610060041_map_atlas_v2.sql",
    ]);
    const w = await world(f);
    const fingerprint = () => f.one(`select
      (select md5(jsonb_agg(to_jsonb(l) order by l.id)::text) from public.rpg_locations l where campaign_id=$1) locations,
      (select md5(to_jsonb(s)::text) from public.rpg_public_state s where campaign_id=$1) public_state,
      (select md5(jsonb_agg(to_jsonb(d) order by d.id)::text) from public.rpg_documents d where campaign_id=$1) documents,
      (select md5(jsonb_agg(to_jsonb(v) order by v.id)::text) from public.rpg_document_versions v where campaign_id=$1) document_versions,
      (select md5(jsonb_agg(to_jsonb(a) order by a.id)::text) from public.rpg_assets a where campaign_id=$1) assets,
      (select count(*)::integer from rpg_private.save_points where campaign_id=$1) saves`, [w.cid]);
    const before40 = await fingerprint();
    await f.db.exec(await readFile(new URL(
      "../supabase/migrations/202610060040_standalone_visual_jobs.sql",
      import.meta.url), "utf8"));
    assert.deepEqual(await fingerprint(), before40);
    const acceptedId = await acceptedSubjectVisual(f, w);
    const before41 = await fingerprint();
    await f.db.exec(await readFile(migration, "utf8"));
    assert.deepEqual(await fingerprint(), before41);
    assert.equal((await f.one("select count(*)::integer n from public.rpg_assets where campaign_id=$1 and id=$2",
      [w.cid, acceptedId])).n, 1);
    const grants = await f.one(`select
      has_function_privilege('authenticated','public.rpg_map_layout(uuid,uuid,text,jsonb,jsonb)','EXECUTE') browser_rpc,
      has_function_privilege('service_role','public.rpg_map_layout(uuid,uuid,text,jsonb,jsonb)','EXECUTE') service_rpc,
      has_table_privilege('authenticated','public.rpg_map_placements','SELECT') browser_table`);
    assert.deepEqual(grants, {
      browser_rpc: false, service_rpc: true, browser_table: false,
    });
  } finally {
    await f.db.close();
  }
});

test("empty disposable migration chain installs exact committed 38 to 39 to 40 to 41 sequence", async () => {
  const f = await fixture(37);
  try {
    for (const name of f.files.slice(37, 41))
      await f.db.exec(await readFile(new URL(name, f.folder), "utf8"));
    assert.equal((await f.one("select to_regclass('public.rpg_map_placements') as relation"))
      .relation, "rpg_map_placements");
    const w = await world(f);
    assert.deepEqual((await read(f, w.cid)).placements, []);
  } finally {
    await f.db.close();
  }
});

test("placement levels, campaign scope and normalized coordinates are enforced without Location mutation", async () => {
  const f = await setup();
  try {
    const w = await world(f);
    const other = await world(f, "Other synthetic campaign");
    const region = (await f.mutation("location.save", w.cid, location("Harbor"))).id;
    const local = (await f.mutation("location.save", w.cid, location("Pier"))).id;
    const secondWorld = (await f.mutation("location.save", w.cid, location("Outer country"))).id;
    const worldRoot = w.location;
    const locationBefore = await f.one(
      "select to_jsonb(l) row from public.rpg_locations l where campaign_id=$1 and id=$2",
      [w.cid, worldRoot]);
    const stateBefore = await f.one(
      "select to_jsonb(s) row from public.rpg_public_state s where campaign_id=$1",
      [w.cid]);
    await assert.rejects(save(f, w.cid, other.location, "world"));
    await assert.rejects(save(f, w.cid, randomUUID(), "world"));
    await assert.rejects(save(f, w.cid, region, "continent"));
    await assert.rejects(save(f, w.cid, region, "region"));
    await assert.rejects(save(f, w.cid, region, "local", worldRoot));
    await save(f, other.cid, other.location, "world");
    await assert.rejects(save(f, w.cid, region, "region", other.location));
    await assert.rejects(save(f, w.cid, worldRoot, "region", worldRoot));
    await assert.rejects(save(f, w.cid, worldRoot, "world", null, {x: -0.01,y: 0.5}));
    await assert.rejects(save(f, w.cid, worldRoot, "world", null, {x: 1.01,y: 0.5}));
    await assert.rejects(save(f, w.cid, worldRoot, "world", null, {x: 0.5,y: -0.01}));
    await assert.rejects(save(f, w.cid, worldRoot, "world", null, {x: 0.5,y: 1.01}));
    await assert.rejects(save(f, w.cid, worldRoot, "world", null, {x: 0.5}));
    const root = await save(f, w.cid, worldRoot, "world", null, { x: 0, y: 1 });
    assert.equal(root.revision, 1);
    await assert.rejects(save(f, w.cid, worldRoot, "world"));
    const reg = await save(f, w.cid, region, "region", worldRoot, {x: 0.32,y: 0.46});
    assert.equal(reg.parent_location_id, worldRoot);
    const loc = await save(f, w.cid, local, "local", region, {x: 1,y: 0});
    assert.equal(loc.level, "local");
    await save(f, w.cid, secondWorld, "world");
    const childBefore = await f.one(
      "select to_jsonb(p) row from public.rpg_map_placements p where campaign_id=$1 and location_id=$2",
      [w.cid, region]);
    await assert.rejects(save(f, w.cid, region, "region", local,
      {expectedRevision: 1}));
    await assert.rejects(save(f, w.cid, worldRoot, "region", secondWorld,
      {expectedRevision: 1}));
    assert.deepEqual(await f.one(
      "select to_jsonb(p) row from public.rpg_map_placements p where campaign_id=$1 and location_id=$2",
      [w.cid, region]), childBefore);
    await assert.rejects(save(f, w.cid, worldRoot, "region", local, {expectedRevision: 1}));
    const moved = await save(f, w.cid, worldRoot, "world", null,
      {expectedRevision: 1,x: 0.75,y: 0.25});
    assert.equal(moved.revision, 2);
    assert.deepEqual(await f.one(
      "select to_jsonb(l) row from public.rpg_locations l where campaign_id=$1 and id=$2",
      [w.cid, worldRoot]), locationBefore);
    assert.deepEqual(await f.one(
      "select to_jsonb(s) row from public.rpg_public_state s where campaign_id=$1",
      [w.cid]), stateBefore);
    const visible = await read(f, w.cid);
    assert.equal(visible.placements.length, 4);
    assert.equal(visible.placements.some((p) => "last_request_id" in p), false);
  } finally {
    await f.db.close();
  }
});

test("stale timeline and duplicate retries cannot alter map placement; old saves hide later Locations", async () => {
  const f = await setup();
  try {
    const w = await world(f);
    const oldFence = await f.fence(w.cid);
    const savePoint = await f.saves(w.cid, "create", await f.command(w.cid,
      {kind: "manual", name: "Before later map place"}));
    const rootRequest = randomUUID();
    const first = await save(f, w.cid, w.location, "world", null,
      {x: 0.2,y: 0.3,requestId: rootRequest});
    const replay = await save(f, w.cid, w.location, "world", null,
      {x: 0.2,y: 0.3,requestId: rootRequest});
    assert.equal(replay.revision, first.revision);
    await assert.rejects(save(f, w.cid, w.location, "world", null,
      {x: 0.4,y: 0.3,requestId: rootRequest}));
    await assert.rejects(save(f, w.cid, w.location, "world", null,
      {x: 0.4,y: 0.3,expectedRevision: 0}));
    const later = (await f.mutation("location.save", w.cid, location("Later discovery"))).id;
    await save(f, w.cid, later, "region", w.location);
    assert.equal((await read(f, w.cid)).placements.length, 2);
    const loaded = await f.saves(w.cid, "load", await f.command(w.cid, {
      recovery: true, saveId: savePoint.saveId, label: "Earlier playable fork",
    }));
    assert.ok(loaded);
    const now = await read(f, w.cid);
    assert.equal(now.placements.length, 1);
    assert.equal(now.placements[0].location_id, w.location);
    await assert.rejects(read(f, w.cid, oldFence));
    await assert.rejects(save(f, w.cid, w.location, "world", null,
      {x: 0.8,y: 0.8,expectedRevision: 1,timeline: oldFence}));
    await assert.rejects(save(f, w.cid, later, "region", w.location));
    const other = await world(f, "Different synthetic campaign");
    await assert.rejects(read(f, other.cid, now.timeline));
  } finally {
    await f.db.close();
  }
});

test("a Local placement cannot use a Region whose World ancestor is absent in the active save", async () => {
  const f = await setup();
  try {
    const w = await world(f);
    const region = (await f.mutation("location.save", w.cid, location("Older region"))).id;
    const local = (await f.mutation("location.save", w.cid, location("Older local"))).id;
    const saved = await f.saves(w.cid, "create", await f.command(w.cid,
      {kind: "manual", name: "Before world ancestor"}));
    const laterWorld = (await f.mutation("location.save", w.cid, location("Later world"))).id;
    await save(f, w.cid, laterWorld, "world");
    await save(f, w.cid, region, "region", laterWorld);
    await f.saves(w.cid, "load", await f.command(w.cid, {
      recovery: true, saveId: saved.saveId, label: "Earlier region without world",
    }));
    assert.deepEqual((await read(f, w.cid)).placements, []);
    await assert.rejects(save(f, w.cid, local, "local", region));
    assert.equal(await f.one(
      "select count(*)::integer n from public.rpg_map_placements where campaign_id=$1 and location_id=$2",
      [w.cid, local]).then((row) => row.n), 0);
  } finally {
    await f.db.close();
  }
});
