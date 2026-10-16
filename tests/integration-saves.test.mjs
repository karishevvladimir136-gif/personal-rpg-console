// Integration of Stage 4 and Stage V (docs/stages/INTEGRATION.md §2): the four
// new migrations apply in name order on a fresh database and on the Stage 3
// synthetic switched campaign; the pictures migration needs nothing from 55/56;
// a save made before every new migration, one made after 56 and one of a
// campaign with frames each restore, and a loaded save shows its own turns'
// frames. Disposable PGlite databases only.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import { takenOver } from "./astra-freedom-fixture.mjs";
import { attachLoop } from "./dm-loop-fixture.mjs";
import { anchorFor, chronicleChapters, framesOfTurn } from "../src/lib/visual-frame/pictures.ts";

const NEW_MIGRATIONS = [
  "202610150054_record_integrity.sql",
  "202610160054_stage_v_pictures.sql",
  "202610160055_stage4_dossier.sql",
  "202610160056_stage4_restore_defaults.sql",
];
const pictures = (f, cid, action, payload = {}) =>
  f.one("select public.rpg_pictures($1,$2,$3,$4::jsonb) result", [f.owner, cid, action, JSON.stringify(payload)]).then((row) => row.result);
const readyOutput = (cid, id) => ({ storagePath: `${cid}/pictures/${id}.jpg`, contentType: "image/jpeg", width: 1024, height: 576, bytes: 1000, sha256: "b".repeat(64) });
/** A live frame of a committed turn, drawn to «ready» (what the picture job does after fal answers). */
async function drawFrame(f, cid, turnId) {
  const fence = await f.fence(cid);
  const created = await pictures(f, cid, "picture.create", { id: randomUUID(), kind: "frame", subjectKind: "turn", subjectId: turnId, composition: "frame",
    timeline: fence, tier: "fast", trigger: "live", model: "fal-ai/flux-2/klein/9b", styleVersionId: null, shot: { who: [], where: "here" }, prompt: "A frame.", referenceIds: [] });
  return pictures(f, cid, "picture.update", { id: created.id, status: "ready", output: readyOutput(cid, created.id), costUsdMicros: 17000, requestId: "req", elapsedMs: 900 });
}
const loopRound = (index, playerMoment = false) => [{ text: `Loop narration ${index}: the square, the organiser, a word. `, toolCalls: [
  { name: "note_world", arguments: { kind: "fact", key: `loop_${index}`, operation: "set", value: `Fact ${index}.` } },
  { name: "advance_time", arguments: { minutes: 10, reason: "talk" } },
  { name: "finish_turn", arguments: { sceneKinds: ["conversation"], spotlight: [], playerMoment } },
] }];

test("the Stage 3, Stage V and Stage 4 migrations have unique names in the expected order; the pictures migration applies and works without 55 and 56", async () => {
  // The first 55 files end with the pictures migration: Stage 4's 55 and 56 are not applied.
  const f = await fixture(55);
  try {
    assert.deepEqual(f.files.slice(-4), NEW_MIGRATIONS, "name order of the new migrations");
    assert.equal(new Set(f.files).size, f.files.length, "migration names are unique");
    assert.equal(f.files.indexOf("202610160054_stage_v_pictures.sql"), 54);
    const applied = (await f.query("select proname from pg_proc where proname in ('rpg_pictures','rpg_dossier','timeline_row_defaults')")).map((row) => row.proname).sort();
    assert.deepEqual(applied, ["rpg_pictures"], "55 and 56 are absent on purpose");
    const w = await world(f);
    const read = await pictures(f, w.cid, "read");
    assert.equal(read.settings.frames, "every");
    const fence = await f.fence(w.cid);
    const anchor = await pictures(f, w.cid, "picture.create", { id: randomUUID(), kind: "anchor", subjectKind: "entity", subjectId: w.hero, composition: "portrait",
      timeline: fence, tier: "fast", trigger: "autopilot", model: "fal-ai/flux-2/klein/9b", styleVersionId: null, shot: null, prompt: "A portrait.", referenceIds: [] });
    const ready = await pictures(f, w.cid, "picture.update", { id: anchor.id, status: "ready", output: readyOutput(w.cid, anchor.id), costUsdMicros: 17000 });
    assert.equal(ready.status, "ready");
    // The rest apply on top, in name order, on the live database.
    for (const file of NEW_MIGRATIONS.slice(2)) await f.db.exec(await readFile(new URL(file, f.folder), "utf8"));
    assert.equal((await pictures(f, w.cid, "read")).pictures.length, 1, "the picture survives 55 and 56");
    const dossier = await f.one("select public.rpg_dossier($1,$2,'read','{}'::jsonb) result", [f.owner, w.cid]);
    assert.ok(dossier.result, "Stage 4's dossier reads on the same campaign");
  } finally {
    await f.db.close();
  }
});

test("the Stage 3 switched campaign takes all four migrations in name order; a save made before them, a save made after 56 and a save with frames each restore; a loaded save shows its own turns' frames", async () => {
  // A taken-over Astra campaign on the first 53 migrations, as the owner's campaigns were before Stage 3.
  const t = await takenOver(53);
  const { f } = t;
  try {
    const play = async () => f.runtime(f.cid, "play");
    const turnIds = async () => (await play()).turns.map((row) => row.id);
    for (let index = 1; index <= 2; index++) {
      const played = await t.turn(`Astra turn ${index}.`, [], () => `Astra narration ${index}.`, false, null, 10);
      assert.equal(played.result.status, "committed", JSON.stringify(t.errors));
    }
    const before54 = await f.saves(f.cid, "create", await f.command(f.cid, { kind: "manual", name: "Before 54" }));
    const turnsBefore54 = await turnIds();
    assert.ok(turnsBefore54.length >= 2, "the opening and the two Astra turns");
    // The four migrations, in name order, on the running database (stage 6 does this on a copy of the owner's).
    for (const file of NEW_MIGRATIONS) await f.db.exec(await readFile(new URL(file, f.folder), "utf8"));
    assert.deepEqual(await turnIds(), turnsBefore54, "old turns are still there after the migrations");
    // The old runtime still plays after all four.
    const astraAfter = await t.turn("Astra turn 3 after the upgrade.", [], () => "Still the square.", false, null, 10);
    assert.equal(astraAfter.result.status, "committed", JSON.stringify(t.errors));
    // Switch to the loop (the owner's settings screen) and play Stage 4 turns.
    const loop = await attachLoop(f);
    const settings = await loop.settings.read();
    await loop.settings.save({ expectedRevision: settings.revision, runtime: "dm-loop-v1", dmTurn: null });
    const loopOps = [];
    for (let index = 1; index <= 2; index++) {
      const played = await loop.turn(`Loop turn ${index}.`, loopRound(index, index === 2));
      assert.equal(played.result.status, "committed", `loop turn ${index}: ${JSON.stringify(loop.errors)}`);
      loopOps.push(played.input.operationId);
    }
    // Stage 4's public turn carries the finish's scene kinds and the player moment (what Stage V and the screens read).
    const publicTurn = await f.runtime(f.cid, "get", { operationId: loopOps[1] });
    assert.deepEqual(publicTurn.sceneKinds, ["conversation"]);
    assert.equal(publicTurn.playerMoment, true);
    // Stage V frames of the two loop turns, then a save that holds them.
    for (const op of loopOps) assert.equal((await drawFrame(f, f.cid, op)).status, "ready");
    const withFrames = await f.saves(f.cid, "create", await f.command(f.cid, { kind: "manual", name: "With frames" }));
    const turnsWithFrames = await turnIds();
    assert.equal(turnsWithFrames.length, turnsBefore54.length + 3);
    // One more turn with its frame after the save.
    const third = await loop.turn("Loop turn 3.", loopRound(3));
    assert.equal(third.result.status, "committed", JSON.stringify(loop.errors));
    assert.equal((await drawFrame(f, f.cid, third.input.operationId)).status, "ready");
    const after56 = await f.saves(f.cid, "create", await f.command(f.cid, { kind: "manual", name: "After 56" }));
    const turnsAfter56 = await turnIds();
    assert.equal(turnsAfter56.length, turnsWithFrames.length + 1);
    const snapshot = async () => {
      const campaign = await f.one("select * from public.rpg_campaigns where id=$1", [f.cid]);
      const entities = await f.query("select * from public.rpg_entities where campaign_id=$1 order by name", [f.cid]);
      return { campaign, entities };
    };
    const chronicle = async () => {
      const board = await pictures(f, f.cid, "read");
      const sessions = await f.query("select * from public.rpg_sessions where campaign_id=$1", [f.cid]);
      const turns = (await play()).turns;
      return { board, chapters: chronicleChapters({ sessions }, turns, board), turns };
    };
    // 1. The save made before every new migration: rows without the Stage 4 columns load with the defaults (migration 56).
    await f.saves(f.cid, "load", await f.command(f.cid, { saveId: before54.saveId, label: "Back before 54", recovery: false }));
    assert.deepEqual(await turnIds(), turnsBefore54, "the save's own turns");
    const restored = await snapshot();
    assert.equal(restored.campaign.status, "active");
    assert.equal(restored.campaign.play_minutes, 0);
    assert.ok(restored.entities.every((row) => row.public_profile !== null));
    const oldChronicle = await chronicle();
    assert.equal(oldChronicle.board.pictures.length, 3, "frames are append-only: a load never deletes a picture");
    assert.equal(oldChronicle.chapters.flatMap((chapter) => chapter.turns).filter((row) => row.frame).length, 0, "none of the save's turns has a frame");
    // Play continues on the loop from the old save.
    const resumed = await loop.turn("Loop turn after the old save.", loopRound(4));
    assert.equal(resumed.result.status, "committed", JSON.stringify(loop.errors));
    // 2. The save with frames: its two framed turns show their frames; the third turn's frame has no turn to hang on.
    await f.saves(f.cid, "load", await f.command(f.cid, { saveId: withFrames.saveId, label: "Back to the frames", recovery: false }));
    assert.deepEqual(await turnIds(), turnsWithFrames);
    const framed = await chronicle();
    const shown = framed.chapters.flatMap((chapter) => chapter.turns).filter((row) => row.frame).map((row) => row.turn.id).sort();
    assert.deepEqual(shown, [...loopOps].sort(), "a loaded save shows its own turns' frames");
    for (const op of loopOps) assert.equal(framesOfTurn(framed.board, op).length, 1);
    assert.ok(!framed.turns.some((row) => row.id === third.input.operationId), "the later turn is not on the restored branch");
    // 3. The save made after 56 restores with all three framed turns.
    await f.saves(f.cid, "load", await f.command(f.cid, { saveId: after56.saveId, label: "Forward again", recovery: false }));
    assert.deepEqual(await turnIds(), turnsAfter56);
    const latest = await chronicle();
    assert.equal(latest.chapters.flatMap((chapter) => chapter.turns).filter((row) => row.frame).length, 3);
    // Anchors stay on the campaign's timeline across loads (a loaded save keeps its people's faces).
    const fence = await f.fence(f.cid);
    const portrait = await pictures(f, f.cid, "picture.create", { id: randomUUID(), kind: "anchor", subjectKind: "entity", subjectId: loop.hero, composition: "portrait",
      timeline: fence, tier: "fast", trigger: "autopilot", model: "fal-ai/flux-2/klein/9b", styleVersionId: null, shot: null, prompt: "A portrait.", referenceIds: [] });
    await pictures(f, f.cid, "picture.update", { id: portrait.id, status: "ready", output: readyOutput(f.cid, portrait.id), costUsdMicros: 17000 });
    await f.saves(f.cid, "load", await f.command(f.cid, { saveId: withFrames.saveId, label: "Back once more", recovery: false }));
    const board = await pictures(f, f.cid, "read");
    assert.equal(anchorFor(board, { kind: "entity", id: loop.hero }, "portrait").picture?.id, portrait.id);
  } finally {
    await f.db.close();
  }
});
