// 2D Live, part 1b (docs/stages/LIVE2D_1.md): migration 202610210200 — the
// campaign marker setting, scene sheets with append-only versions, POIs with
// positions (the owner's placement kept), region maps, DM-private seeds that
// never reach the public projection, and the widened picture compositions.
// Disposable PGlite database only.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fixture, world } from "./phase35-storage-fixture.mjs";

const call = (f, cid, action, payload = {}, user = f.owner) =>
  f.one("select public.rpg_live2d($1,$2,$3,$4::jsonb) result", [user, cid, action, JSON.stringify(payload)]).then((row) => row.result);
const pictures = (f, cid, action, payload = {}) =>
  f.one("select public.rpg_pictures($1,$2,$3,$4::jsonb) result", [f.owner, cid, action, JSON.stringify(payload)]).then((row) => row.result);
const fails = (promise, code) => assert.rejects(promise, (error) => error.message.includes(code));
const sheet = (summary) => ({ summary, features: [{ key: "door", label: "Дверь", kind: "entrance", description: "the door", mustShow: true, targetLocationId: null }], people: [], light: "", timeOfDay: null, never: [], crowded: false });
const poi = (key, more = {}) => ({ id: randomUUID(), key, kind: "object", label: `Label ${key}`, note: "", entityId: null, targetLocationId: null, x: 0.5, y: 0.5, confidence: 0.8, approximate: false, source: "locator", hidden: false, ...more });

test("migration 202610210200: the public board (no seeds), settings, scenes with versions, a scene picture", async () => {
  const f = await fixture();
  try {
    assert.ok(f.files.includes("202610210200_live2d.sql"));
    const w = await world(f);
    const read = await call(f, w.cid, "read");
    assert.deepEqual(Object.keys(read).sort(), ["battleMaps", "campaignId", "pois", "regionMaps", "scenes", "settings"]);
    assert.deepEqual(read.settings, { markers: "standard", revision: 0 });
    assert.deepEqual([read.scenes, read.pois, read.regionMaps], [[], [], []]);
    await fails(call(f, w.cid, "read", {}, f.other), "rpg_forbidden");
    await fails(call(f, w.cid, "nothing"), "rpg_validation");
    // Settings: the revision fences the save.
    await fails(call(f, w.cid, "settings.save", { expectedRevision: 1, markers: "all" }), "rpg_conflict");
    await fails(call(f, w.cid, "settings.save", { expectedRevision: 0, markers: "some" }), "rpg_validation");
    assert.deepEqual(await call(f, w.cid, "settings.save", { expectedRevision: 0, markers: "all" }), { markers: "all", revision: 1 });
    assert.deepEqual(await call(f, w.cid, "settings.save", { expectedRevision: 1, markers: "off" }), { markers: "off", revision: 2 });
    // Scenes: revision 1 on insert, the expected revision afterwards, every save a version row.
    await fails(call(f, w.cid, "scene.save", { locationId: randomUUID(), sheet: sheet("x"), source: "model", expectedRevision: null }), "rpg_not_found");
    const first = await call(f, w.cid, "scene.save", { locationId: w.location, sheet: sheet("A hall."), source: "model", expectedRevision: null });
    assert.deepEqual([first.locationId, first.revision, first.status, first.pictureId, first.check, first.sideList, first.redraws, first.error], [w.location, 1, "draft", null, null, [], 0, null]);
    assert.equal(first.sheet.summary, "A hall.");
    await fails(call(f, w.cid, "scene.save", { locationId: w.location, sheet: sheet("B"), source: "model", expectedRevision: null }), "rpg_conflict");
    await fails(call(f, w.cid, "scene.save", { locationId: w.location, sheet: sheet("B"), source: "owner", expectedRevision: 7 }), "rpg_conflict");
    const second = await call(f, w.cid, "scene.save", { locationId: w.location, sheet: sheet("A hall, edited."), source: "owner", expectedRevision: 1 });
    assert.equal(second.revision, 2);
    assert.equal(second.status, "draft", "no picture yet: an edit keeps the scene a draft");
    const versions = await f.query("select revision, source from rpg_private.live2d_scene_versions where campaign_id=$1 and location_id=$2 order by revision", [w.cid, w.location]);
    assert.deepEqual(versions, [{ revision: 1, source: "model" }, { revision: 2, source: "owner" }]);
    await fails(f.one("update rpg_private.live2d_scene_versions set source='owner' where campaign_id=$1", [w.cid]), "rpg_conflict");
    await fails(f.one("delete from rpg_private.live2d_scene_versions where campaign_id=$1", [w.cid]), "rpg_conflict");
    // A scene picture: the widened composition check accepts «scene»; the update binds it.
    const fence = await f.fence(w.cid);
    const picture = await pictures(f, w.cid, "picture.create", { id: randomUUID(), kind: "anchor", subjectKind: "location", subjectId: w.location, composition: "scene", timeline: fence,
      tier: "quality", trigger: "manual", model: "gpt-image-2.5-sunburst", styleVersionId: null, shot: null, prompt: "A scene.", referenceIds: [] });
    assert.equal(picture.composition, "scene");
    await fails(pictures(f, w.cid, "picture.create", { id: randomUUID(), kind: "anchor", subjectKind: "location", subjectId: w.location, composition: "mural", timeline: fence,
      tier: "quality", trigger: "manual", model: "gpt-image-2.5-sunburst", styleVersionId: null, shot: null, prompt: "A scene.", referenceIds: [] }), "pictures_composition_check");
    await fails(call(f, w.cid, "scene.update", { locationId: w.location, status: "checked", pictureId: randomUUID() }), "rpg_conflict");
    await fails(call(f, w.cid, "scene.update", { locationId: w.location, status: "done" }), "rpg_validation");
    await fails(call(f, w.cid, "scene.update", { locationId: w.location, status: "checked", sideList: [1] }), "rpg_validation");
    const checked = await call(f, w.cid, "scene.update", { locationId: w.location, status: "checked", pictureId: picture.id, check: { model: "m", items: [], contradictions: [], peopleInBackground: false, costUsdMicros: 10, checkedAt: "2026-10-20T00:00:00Z" }, sideList: ["Погреб"], redraws: 1 });
    assert.deepEqual([checked.status, checked.pictureId, checked.check.model, checked.sideList, checked.redraws, checked.revision], ["checked", picture.id, "m", ["Погреб"], 1, 2]);
    const kept = await call(f, w.cid, "scene.save", { locationId: w.location, sheet: sheet("Owner edit after the picture."), source: "owner", expectedRevision: 2 });
    assert.equal(kept.status, "checked", "the owner's edit of a drawn scene keeps its status");
    const redrawn = await call(f, w.cid, "scene.save", { locationId: w.location, sheet: sheet("Model rewrite."), source: "model", expectedRevision: 3 });
    assert.equal(redrawn.status, "draft", "a model rewrite makes the scene a draft again");
    const failed = await call(f, w.cid, "scene.update", { locationId: w.location, status: "failed", error: "x".repeat(300) });
    assert.equal(failed.error.length, 200);
    assert.equal((await call(f, w.cid, "read")).scenes.length, 1);
  } finally {
    await f.db.close();
  }
});

test("migration 202610210200: POIs — replace keeps the owner's placement, save validates, region maps upsert, seeds stay private", async () => {
  const f = await fixture();
  try {
    const w = await world(f);
    await fails(call(f, w.cid, "poi.replace", { locationId: w.location, pois: [poi("altar", { entityId: randomUUID() })] }), "rpg_conflict");
    await fails(call(f, w.cid, "poi.replace", { locationId: w.location, pois: [poi("altar", { targetLocationId: randomUUID() })] }), "rpg_conflict");
    await fails(call(f, w.cid, "poi.replace", { locationId: w.location, pois: [poi("Bad Key")] }), "live2d_pois_key_check");
    await fails(call(f, w.cid, "poi.replace", { locationId: w.location, pois: [poi("a", { x: 1.5 })] }), "rpg_validation");
    await fails(call(f, w.cid, "poi.replace", { locationId: w.location, pois: [poi("a"), poi("a")] }), "rpg_validation");
    const first = await call(f, w.cid, "poi.replace", { locationId: w.location, pois: [poi("altar", { x: 0.4, y: 0.6 }), poi("hatch", { kind: "exit", x: null, y: null, confidence: null }), poi("nera", { kind: "person", entityId: w.npc, targetLocationId: w.location, source: "sheet" })] });
    assert.deepEqual(first.map((row) => [row.key, row.revision, row.source]), [["altar", 1, "locator"], ["hatch", 1, "locator"], ["nera", 1, "sheet"]]);
    const altar = first.find((row) => row.key === "altar");
    assert.equal(typeof altar.x, "number");
    assert.deepEqual([altar.x, altar.y, altar.confidence, altar.approximate, altar.hidden], [0.4, 0.6, 0.8, false, false]);
    assert.equal(first.find((row) => row.key === "hatch").x, null);
    assert.equal(first.find((row) => row.key === "nera").entityId, w.npc);
    // The owner drags the altar and hides nothing; the next replace keeps the owner's spot.
    await fails(call(f, w.cid, "poi.save", { id: altar.id, expectedRevision: 1, x: 0.2, y: null, hidden: false }), "rpg_validation");
    await fails(call(f, w.cid, "poi.save", { id: altar.id, expectedRevision: 2, x: 0.2, y: 0.3, hidden: false }), "rpg_conflict");
    await fails(call(f, w.cid, "poi.save", { id: randomUUID(), expectedRevision: 1, x: 0.2, y: 0.3, hidden: false }), "rpg_not_found");
    const moved = await call(f, w.cid, "poi.save", { id: altar.id, expectedRevision: 1, x: 0.2, y: 0.3, hidden: false, label: "Старый алтарь" });
    assert.deepEqual([moved.x, moved.y, moved.source, moved.revision, moved.label], [0.2, 0.3, "owner", 2, "Старый алтарь"]);
    const second = await call(f, w.cid, "poi.replace", { locationId: w.location, pois: [poi("altar", { x: 0.9, y: 0.9, note: "a stone altar" }), poi("bench", { x: 0.1, y: 0.1 })] });
    assert.deepEqual(second.map((row) => row.key), ["altar", "bench"], "hatch and nera are no longer in the records; the owner's altar stays");
    const altar2 = second.find((row) => row.key === "altar");
    assert.deepEqual([altar2.id, altar2.x, altar2.y, altar2.source, altar2.revision, altar2.note], [altar.id, 0.2, 0.3, "owner", 3, "a stone altar"]);
    const hidden = await call(f, w.cid, "poi.save", { id: altar2.id, expectedRevision: 3, x: 0.2, y: 0.3, hidden: true });
    assert.equal(hidden.hidden, true);
    const third = await call(f, w.cid, "poi.replace", { locationId: w.location, pois: [poi("bench", { x: 0.15, y: 0.15 })] });
    assert.deepEqual(third.map((row) => [row.key, row.hidden, row.x]), [["altar", true, 0.2], ["bench", false, 0.15]], "an owner-hidden marker survives a replace; a locator row takes the new spot");
    assert.equal((await call(f, w.cid, "read")).pois.length, 2);
    // Region maps: the flat known region and a region anchored on a place.
    await fails(call(f, w.cid, "region.save", { anchorId: randomUUID(), pictureId: null, signature: "", status: "drawing" }), "rpg_not_found");
    await fails(call(f, w.cid, "region.save", { anchorId: null, pictureId: randomUUID(), signature: "", status: "drawing" }), "rpg_conflict");
    const known = await call(f, w.cid, "region.save", { anchorId: null, pictureId: null, signature: `${w.location}`, status: "drawing" });
    assert.deepEqual([known.anchorId, known.pictureId, known.signature, known.status], [null, null, w.location, "drawing"]);
    const fence = await f.fence(w.cid);
    const picture = await pictures(f, w.cid, "picture.create", { id: randomUUID(), kind: "anchor", subjectKind: "location", subjectId: w.location, composition: "region", timeline: fence,
      tier: "quality", trigger: "manual", model: "gpt-image-2.5-sunburst", styleVersionId: null, shot: null, prompt: "A map.", referenceIds: [] });
    const ready = await call(f, w.cid, "region.save", { anchorId: null, pictureId: picture.id, signature: `${w.location}`, status: "ready" });
    assert.deepEqual([ready.pictureId, ready.status], [picture.id, "ready"]);
    const anchored = await call(f, w.cid, "region.save", { anchorId: w.location, pictureId: null, signature: "", status: "failed" });
    assert.equal(anchored.anchorId, w.location);
    const maps = (await call(f, w.cid, "read")).regionMaps;
    assert.deepEqual(maps.map((row) => row.anchorId).sort(), [null, w.location].sort());
    assert.equal(maps.length, 2, "one row per anchor: the upsert replaced, not appended");
    // Seeds: planted and listed only through their own actions; never in the board.
    await fails(call(f, w.cid, "seed.plant", { id: randomUUID(), areaLocationId: null, key: "note_x", theme: "", premise: "p" }), "live2d_seeds_key_check");
    await fails(call(f, w.cid, "seed.plant", { id: randomUUID(), areaLocationId: randomUUID(), key: "poi_seed_coast_1", theme: "a cemetery", premise: "private" }), "rpg_not_found");
    const seed = await call(f, w.cid, "seed.plant", { id: randomUUID(), areaLocationId: w.location, key: "poi_seed_coast_1", theme: "an old cemetery", premise: "PRIVATE_SEED" });
    assert.deepEqual([seed.areaLocationId, seed.key, seed.status, seed.discoveredPoiId], [w.location, "poi_seed_coast_1", "latent", null]);
    await fails(call(f, w.cid, "seed.plant", { id: randomUUID(), areaLocationId: null, key: "poi_seed_coast_1", theme: "", premise: "dup" }), "live2d_seeds_campaign_id_key_key");
    const board = JSON.stringify(await call(f, w.cid, "read"));
    assert.ok(!board.includes("PRIVATE_SEED") && !board.includes("seeds"), "the public board never carries a seed");
    assert.deepEqual((await call(f, w.cid, "seed.list")).map((row) => row.key), ["poi_seed_coast_1"]);
    await fails(call(f, w.cid, "seed.discover", { id: seed.id, poiId: randomUUID() }), "rpg_conflict");
    const discovered = await call(f, w.cid, "seed.discover", { id: seed.id, poiId: third[1].id });
    assert.deepEqual([discovered.status, discovered.discoveredPoiId], ["discovered", third[1].id]);
    await fails(call(f, w.cid, "seed.list", {}, f.other), "rpg_forbidden");
  } finally {
    await f.db.close();
  }
});
