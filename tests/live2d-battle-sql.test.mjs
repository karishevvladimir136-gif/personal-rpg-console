// 2D Live, part 2: migration 202610210201 — the encounter's public_field travels
// through the runtime's commit and the play projection; the battle background
// per place; the public board carries battleMaps. Disposable PGlite only.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { commitEvent, fixture, world } from "./phase35-storage-fixture.mjs";

const live2d = (f, cid, action, payload = {}, user = f.owner) =>
  f.one("select public.rpg_live2d($1,$2,$3,$4::jsonb) result", [user, cid, action, JSON.stringify(payload)]).then((row) => row.result);
const pictures = (f, cid, action, payload = {}) =>
  f.one("select public.rpg_pictures($1,$2,$3,$4::jsonb) result", [f.owner, cid, action, JSON.stringify(payload)]).then((row) => row.result);
const fails = (promise, code) => assert.rejects(promise, (error) => error.message.includes(code));

test("migration 202610210201: an encounter commits with its battlefield and the play projection returns it; old encounters read as {}", async () => {
  const f = await fixture();
  try {
    assert.ok(f.files.includes("202610210201_live2d_battle.sql"));
    const w = await world(f);
    const encounterId = randomUUID(), participantId = randomUUID();
    const field = { grid: { cols: 20, rows: 12, feetPerCell: 5 }, ambient: "dim", activeParticipantId: participantId, turnInRound: 0, opening: null, pendingReaction: null, locationId: w.location,
      features: [{ key: "cart", kind: "cover", label: "горящая телега", cells: [[5, 5]], cover: "three-quarters" }], log: [] };
    const combatant = { initiative: 14, active: true, side: "party", economy: { action: true, bonus: true, reaction: true, moveFeet: 30, moveMaxFeet: 30 }, conditions: [], deathSaves: null, hp: null, known: [], intent: null, defending: false, withdrawn: false, action: 1, move: 1, reaction: 1 };
    const { result } = await commitEvent(f, w, { packet: { resolution: { changes: [
      { family: "encounters", id: encounterId, expectedRevision: null, values: { status: "active", round: 1, outcome: null, settings_revision: 1, public_summary: "Засада у брода", public_field: field } },
      { family: "encounter_participants", id: participantId, expectedRevision: null, values: { encounter_id: encounterId, entity_id: w.hero, public_name: "Ari", turn_order: 1, public_position: { position: "nearby", x: 3, y: 4, z: 0 }, public_resources: combatant } },
    ], worldMinutes: 0, configuration: null, outcomes: [] } } });
    assert.equal(result.status, "committed");
    const play = await f.runtime(w.cid, "play");
    const encounter = play.encounters.find((row) => row.id === encounterId);
    assert.deepEqual(encounter.public_field, field, "the battlefield comes back whole");
    const participant = play.participants.find((row) => row.id === participantId);
    assert.deepEqual(participant.public_position, { position: "nearby", x: 3, y: 4, z: 0 });
    assert.equal(participant.public_resources.economy.moveFeet, 30);
    // A field that is not an object is refused by the column's check.
    await fails(commitEvent(f, w, { packet: { resolution: { changes: [
      { family: "encounters", id: randomUUID(), expectedRevision: null, values: { status: "active", round: 1, outcome: null, settings_revision: 1, public_summary: "x", public_field: [] } },
    ], worldMinutes: 0, configuration: null, outcomes: [] } } }), "rpg_");
    // The board carries battle maps; battle.save upserts one per place.
    const board = await live2d(f, w.cid, "read");
    assert.deepEqual(board.battleMaps, []);
    assert.ok(!("seeds" in board));
    const fence = await f.fence(w.cid);
    const picture = await pictures(f, w.cid, "picture.create", { id: randomUUID(), kind: "anchor", subjectKind: "location", subjectId: w.location, composition: "battle", timeline: fence,
      tier: "quality", trigger: "manual", model: "gpt-image-2.5-sunburst", styleVersionId: null, shot: null, prompt: "A top-down battle map.", referenceIds: [] });
    const drawing = await live2d(f, w.cid, "battle.save", { locationId: w.location, sheetRevision: 1, pictureId: null, status: "drawing" });
    assert.equal(drawing.status, "drawing");
    assert.equal(drawing.grid.cols, 24, "the default grid");
    const ready = await live2d(f, w.cid, "battle.save", { locationId: w.location, sheetRevision: 1, pictureId: picture.id, status: "ready", check: { model: "m", items: [], contradictions: [], peopleInBackground: false, costUsdMicros: 0, checkedAt: "2026-10-20T00:00:00Z" }, grid: { cols: 20, rows: 12, feetPerCell: 5 } });
    assert.equal(ready.pictureId, picture.id);
    assert.equal(ready.grid.rows, 12);
    assert.equal((await live2d(f, w.cid, "read")).battleMaps.length, 1);
    await fails(live2d(f, w.cid, "battle.save", { locationId: w.location, sheetRevision: 1, pictureId: randomUUID(), status: "ready" }), "rpg_conflict");
    await fails(live2d(f, w.cid, "battle.save", { locationId: randomUUID(), sheetRevision: 1, pictureId: null, status: "ready" }), "rpg_not_found");
    await fails(live2d(f, w.cid, "battle.save", { locationId: w.location, sheetRevision: 1, pictureId: null, status: "sketch" }), "rpg_validation");
    await fails(live2d(f, w.cid, "read", {}, f.other), "rpg_forbidden");
  } finally {
    await f.db.close();
  }
});
