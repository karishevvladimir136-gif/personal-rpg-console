// Stage 3 §3: compatibility. Old Astra turns, saves and branches keep working
// across migration 54; saves made on dm-loop-v1 carry everything the loop
// writes; a taken-over campaign can be switched to dm-loop-v1 and back.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { loopCampaign, attachLoop } from "./dm-loop-fixture.mjs";
import { takenOver } from "./astra-freedom-fixture.mjs";

const MIGRATION_54 = "202610150054_record_integrity.sql";

test("a save on dm-loop-v1 carries characters with Character Models, places, holdings, quests with claimed rewards, private notes and receipts; load restores it exactly and the same NPC continues", async () => {
  const c = await loopCampaign();
  try {
    const first = await c.turn("I meet the miller and take his job.", [
      { text: "The mill. ", toolCalls: [
        { name: "upsert_character", arguments: { localKey: "miller", name: "Oswin the miller", kind: "npc", description: "Broad, floury.", present: true, maxHp: 8 } },
        { name: "note_character", arguments: { actorRef: "miller", identity: { values: ["honest weight"], wants: ["a dry summer"], boundaries: [], loyalties: [], signatures: ["taps the grindstone"], observableVoice: "Short sentences." },
          current: { goal: "sell the flour", stress: "settled" }, episodes: [{ meaning: "A stranger asked for work and did not haggle.", cue: "the lane" }] } },
        { name: "upsert_place", arguments: { localKey: "mill", name: "The old mill", description: "Stone, by the brook.", status: "visited" } },
        { name: "holding", arguments: { action: "create", localKey: "cart", kind: "transport", name: "Oswin's hand cart", description: "Two wheels and a squeak." } },
        { name: "quest", arguments: { action: "create", localKey: "flour", title: "Haul flour", description: "Twenty sacks.", issuerRef: "miller", reward: { currency: "coins", amount: 5 } } },
        { name: "note_world", arguments: { kind: "fact", key: "mill_debt", operation: "set", value: "Oswin owes the baker forty coins." } },
        { name: "note_world", arguments: { kind: "clock", key: "harvest", operation: "set", value: "2" } },
        { name: "advance_time", arguments: { minutes: 15, reason: "the mill" } },
        { name: "finish_turn", arguments: { sceneKinds: ["conversation"], spotlight: ["miller"], playerMoment: false } },
      ] },
    ]);
    assert.equal(first.result.status, "committed", JSON.stringify(c.errors));
    const second = await c.turn("I haul the sacks and get paid.", [
      { text: "Done by dusk. ", toolCalls: [
        { name: "quest", arguments: { action: "complete", questRef: "Haul flour" } },
        { name: "quest", arguments: { action: "claim_reward", questRef: "Haul flour" } },
        { name: "item", arguments: { action: "create", name: "Sack of flour", category: "consumable", quantity: 2, ownerRef: c.hero, description: "A gift." } },
        { name: "advance_time", arguments: { minutes: 180, reason: "hauling" } },
        { name: "finish_turn", arguments: { sceneKinds: ["trade"], spotlight: ["Oswin the miller"], playerMoment: false } },
      ] },
    ]);
    assert.equal(second.result.status, "committed", JSON.stringify(c.errors));
    assert.ok((await c.row(second.input.operationId)).checkpoint.dmLoop.receipts.every((r) => r.result.ok), JSON.stringify(c.errors));
    const save = await c.f.saves(c.cid, "create", await c.f.command(c.cid, { kind: "manual", name: "Paid" }));
    const before = await c.dump();
    const miller = (await c.state()).entities.find((row) => row.name === "Oswin the miller");
    assert.ok(miller && JSON.parse(before.dmState[0]).contents.npc[`character_${miller.id}`], "the Character Model is in the private state");
    assert.ok(before.quests.some((row) => JSON.parse(row).reward_operation_id === second.input.operationId), "the claim is on the quest row");
    for (const op of [first.input.operationId, second.input.operationId])
      assert.ok(before.turns.some((row) => JSON.parse(row).id === op && JSON.parse(row).receipts.length > 0), "the loop turns with their receipts are in the save");
    // Play on, then load the save: everything is exactly as saved.
    const third = await c.turn("I spend the evening at the baker's.", [
      { text: "Warm bread. ", toolCalls: [
        { name: "upsert_character", arguments: { localKey: "baker", name: "Mara the baker", kind: "npc", description: "Warm hands." } },
        { name: "money", arguments: { action: "spend", currency: "coins", amount: 2, fromRef: c.hero, reason: "bread" } },
        { name: "note_world", arguments: { kind: "clock", key: "harvest", operation: "advance", amount: 1 } },
        { name: "note_character", arguments: { actorRef: "miller", current: { goal: "rest", stress: "settled" } } },
        { name: "advance_time", arguments: { minutes: 60, reason: "evening" } },
        { name: "finish_turn", arguments: { sceneKinds: ["quiet"], spotlight: [], playerMoment: false } },
      ] },
    ]);
    assert.equal(third.result.status, "committed", JSON.stringify(c.errors));
    assert.notDeepEqual(await c.dump(), before);
    await c.f.saves(c.cid, "load", await c.f.command(c.cid, { saveId: save.saveId, label: "Back to the payday", recovery: false }));
    const after = await c.dump();
    assert.deepEqual(after, before);
    // Continue: the miller is the same single record.
    const back = await c.turn("I go back to the mill.", [
      { text: "Oswin again. ", toolCalls: [
        { name: "upsert_character", arguments: { ref: "Oswin the miller", present: true } },
        { name: "note_character", arguments: { actorRef: "Oswin the miller", current: { goal: "the next load", stress: "settled" } } },
        { name: "advance_time", arguments: { minutes: 10, reason: "the lane" } },
        { name: "finish_turn", arguments: { sceneKinds: ["conversation"], spotlight: ["Oswin the miller"], playerMoment: false } },
      ] },
    ]);
    assert.equal(back.result.status, "committed", JSON.stringify(c.errors));
    const state = await c.state();
    const millers = state.entities.filter((row) => /miller/i.test(row.name));
    assert.equal(millers.length, 1);
    assert.equal(millers[0].id, miller.id);
    assert.equal(state.quests.find((row) => row.title === "Haul flour").reward_operation_id, second.input.operationId);
    assert.ok(!state.entities.some((row) => row.name === "Mara the baker"));
  } finally { await c.f.db.close(); }
});

test("old astra-primary-v1 turns, saves and loads read exactly the same across migration 54; the owner's Character Model correction accepts the relaxed bounds", async () => {
  const t = await takenOver(53);
  const { f } = t;
  try {
    const ops = [];
    for (let index = 0; index < 3; index++) {
      const played = await t.turn(`Astra turn ${index + 1}.`, [], () => `The square, turn ${index + 1}.`, false, null, 10);
      assert.equal(played.result.status, "committed", JSON.stringify(t.errors));
      ops.push(played.input.operationId);
    }
    const save = await f.saves(f.cid, "create", await f.command(f.cid, { kind: "manual", name: "Before the upgrade" }));
    // (the timeline stamp names the active branch, which a load changes by design; everything else must be identical)
    const publicTurns = async () => Promise.all(ops.map(async (op) => ({ ...(await f.runtime(f.cid, "get", { operationId: op })), timeline: undefined })));
    const play = async () => { const p = await f.runtime(f.cid, "play"); return { ...p, timeline: undefined }; };
    const turnsBefore = await publicTurns();
    const playBefore = await play();
    const savesBefore = await f.saves(f.cid, "read");
    const owner = async (payload) => (await f.one("select public.rpg_character_model($1,$2,$3,$4::jsonb,$5::jsonb) result",
      [f.owner, f.cid, "correct", JSON.stringify(payload), JSON.stringify(await f.fence(f.cid))])).result;
    const read = async () => (await f.one("select public.rpg_character_model($1,$2,$3,$4::jsonb,$5::jsonb) result",
      [f.owner, f.cid, "read", JSON.stringify({ actorId: t.npc }), JSON.stringify(await f.fence(f.cid))])).result;
    const longModel = { schemaVersion: 1, actorId: t.npc, basisOperationId: null,
      identity: { values: Array.from({ length: 6 }, (_, i) => `value ${i}: ${"a steady, specific habit ".repeat(8)}`.slice(0, 220)),
        wants: ["steady work for the village"], boundaries: [], loyalties: [], signatures: [],
        observableVoice: "Brisk and polite, answers questions about himself with questions about work; ".repeat(3).slice(0, 240) },
      current: { goal: "g".repeat(300), stress: "settled", preoccupation: null, obligation: null }, beliefs: [], relationships: [], episodes: [] };
    // Migration 20's bounds still apply here: the long correction is refused.
    await assert.rejects(owner({ requestId: randomUUID(), actorId: t.npc, expectedRevision: (await read()).revision, model: longModel }), /rpg_validation/);
    // Apply migration 54 to the running database (what stage 6 does on a copy of the owner's).
    await f.db.exec(await readFile(new URL(MIGRATION_54, f.folder), "utf8"));
    assert.deepEqual(await publicTurns(), turnsBefore, "old turns display exactly as before");
    assert.deepEqual(await play(), playBefore);
    assert.deepEqual((await f.saves(f.cid, "read")).saves.map((s) => s.id), savesBefore.saves.map((s) => s.id));
    // The old runtime keeps playing, saving and loading.
    const next = await t.turn("Astra turn 4 after the upgrade.", [], () => "Still the square.", false, null, 10);
    assert.equal(next.result.status, "committed", JSON.stringify(t.errors));
    await f.saves(f.cid, "load", await f.command(f.cid, { saveId: save.saveId, label: "Rewind", recovery: false }));
    assert.deepEqual(await publicTurns(), turnsBefore);
    const again = await t.turn("Astra turn after the rewind.", [], () => "The square once more.", false, null, 10);
    assert.equal(again.result.status, "committed", JSON.stringify(t.errors));
    // The owner's correction screen accepts the relaxed bounds now.
    const applied = await owner({ requestId: randomUUID(), actorId: t.npc, expectedRevision: (await read()).revision, model: longModel });
    assert.equal(applied.actorId, t.npc);
    assert.equal((await read()).model.identity.values.length, 6);
    // … and still refuses garbage beyond them.
    const tooLong = { ...longModel, identity: { ...longModel.identity, observableVoice: "v".repeat(601) } };
    await assert.rejects(owner({ requestId: randomUUID(), actorId: t.npc, expectedRevision: (await read()).revision, model: tooLong }), /rpg_validation/);
  } finally { await f.db.close(); }
});

test("a long taken-over Astra campaign with saves and a branch switches to dm-loop-v1, plays on, rewinds to a pre-switch save and continues on either runtime with its history intact", async () => {
  const t = await takenOver(99);
  const { f } = t;
  try {
    // An existing campaign: migration 53 gave every campaign of that time an astra-primary-v1 row.
    const loop = await attachLoop(f);
    await loop.settings.save({ expectedRevision: 0, runtime: "astra-primary-v1", dmTurn: null });
    const saves = {};
    const astraOps = [];
    for (let index = 1; index <= 24; index++) {
      const played = await t.turn(`Astra turn ${index}.`, [], () => `Narration ${index}.`, false, null, 10);
      assert.equal(played.result.status, "committed", `turn ${index}: ${JSON.stringify(t.errors)}`);
      astraOps.push(played.input.operationId);
      if (index === 8) saves.early = await f.saves(f.cid, "create", await f.command(f.cid, { kind: "manual", name: "Early" }));
      if (index === 16) saves.mid = await f.saves(f.cid, "create", await f.command(f.cid, { kind: "manual", name: "Mid" }));
    }
    const committed = async () => (await f.one("select count(*)::int n from rpg_private.turns where campaign_id=$1 and status='committed'", [f.cid])).n;
    const committedAtEnd = await committed();
    const mainTimeline = (await f.saves(f.cid, "read")).timeline.timelineId;
    // A branch: load the early save (a new timeline forks from it) and play four more turns there.
    await f.saves(f.cid, "load", await f.command(f.cid, { saveId: saves.early.saveId, label: "Branch", recovery: false }));
    for (let index = 1; index <= 4; index++) {
      const played = await t.turn(`Branch turn ${index}.`, [], () => `Branch ${index}.`, false, null, 10);
      assert.equal(played.result.status, "committed", JSON.stringify(t.errors));
    }
    const branchTimeline = (await f.saves(f.cid, "read")).timeline.timelineId;
    assert.notEqual(branchTimeline, mainTimeline);
    await f.saves(f.cid, "switch", await f.command(f.cid, { timelineId: mainTimeline, recovery: false }));
    const digest = async () => f.query(`select id,md5((to_jsonb(t)-'lease_token'-'lease_until'-'updated_at'-'source')::text) d
      from rpg_private.turns t where campaign_id=$1 and status='committed' and runtime_identity='astra-primary-v1' order by sequence`, [f.cid]);
    const history = await digest();
    assert.equal(history.length, 24, "24 Astra turns on the main timeline");
    assert.equal(await committed(), committedAtEnd);
    const eventsBefore = (await f.one("select count(*)::int n from rpg_private.runtime_events where campaign_id=$1", [f.cid])).n;
    // Switch the campaign to the new loop.
    const settings = await loop.settings.read();
    assert.equal(settings.runtime, "astra-primary-v1");
    await loop.settings.save({ expectedRevision: settings.revision, runtime: "dm-loop-v1", dmTurn: null });
    const loopOps = [];
    for (let index = 1; index <= 3; index++) {
      const played = await loop.turn(`Loop turn ${index}: I greet the organiser.`, [
        { text: `Loop narration ${index}. `, toolCalls: [
          { name: "upsert_character", arguments: { ref: loop.npc, present: true } },
          { name: "note_world", arguments: { kind: "fact", key: `loop_${index}`, operation: "set", value: `Fact ${index}.` } },
          { name: "advance_time", arguments: { minutes: 10, reason: "talk" } },
          { name: "finish_turn", arguments: { sceneKinds: ["conversation"], spotlight: [loop.npc], playerMoment: false } },
        ] },
      ]);
      assert.equal(played.result.status, "committed", `loop turn ${index}: ${JSON.stringify(loop.errors)}`);
      assert.equal((await loop.row(played.input.operationId)).runtime_identity, "dm-loop-v1");
      loopOps.push(played.input.operationId);
    }
    // The Astra history is untouched, nothing rewritten.
    assert.deepEqual(await digest(), history);
    assert.equal((await f.one("select count(*)::int n from rpg_private.runtime_events where campaign_id=$1", [f.cid])).n, eventsBefore + 3);
    assert.equal((await loop.state()).runtime.world_minutes, 24 * 10 + 30);
    // Rewind to a pre-switch save: the loop turns are gone from the active branch, the setting stays, play continues on the loop …
    await f.saves(f.cid, "load", await f.command(f.cid, { saveId: saves.mid.saveId, label: "Back to mid", recovery: false }));
    assert.equal((await f.one("select count(*)::int n from rpg_private.turns where campaign_id=$1 and runtime_identity='dm-loop-v1'", [f.cid])).n, 0);
    assert.deepEqual((await digest()).map((row) => row.d), history.slice(0, 16).map((row) => row.d));
    assert.equal((await loop.settings.read()).runtime, "dm-loop-v1");
    const afterRewind = await loop.turn("I look at the notice board again.", [
      { text: "The board. ", toolCalls: [
        { name: "advance_time", arguments: { minutes: 5, reason: "reading" } },
        { name: "finish_turn", arguments: { sceneKinds: ["quiet"], spotlight: [], playerMoment: false } },
      ] },
    ]);
    assert.equal(afterRewind.result.status, "committed", JSON.stringify(loop.errors));
    // … or back on Astra when the owner switches the setting back …
    const current = await loop.settings.read();
    await loop.settings.save({ expectedRevision: current.revision, runtime: "astra-primary-v1", dmTurn: null });
    const astraAgain = await t.turn("Astra after the rewind.", [], () => "Astra narrates again.", false, null, 10);
    assert.equal(astraAgain.result.status, "committed", JSON.stringify(t.errors));
    assert.equal((await f.one("select runtime_identity from rpg_private.turns where id=$1", [astraAgain.input.operationId])).runtime_identity, "astra-primary-v1");
    // … and forward to the loop once more.
    const again = await loop.settings.read();
    await loop.settings.save({ expectedRevision: again.revision, runtime: "dm-loop-v1", dmTurn: null });
    const loopAgain = await loop.turn("Back to the new loop.", [
      { text: "Onward. ", toolCalls: [{ name: "advance_time", arguments: { minutes: 5, reason: "onward" } },
        { name: "finish_turn", arguments: { sceneKinds: ["travel"], spotlight: [], playerMoment: false } }] },
    ]);
    assert.equal(loopAgain.result.status, "committed", JSON.stringify(loop.errors));
    // The branch is still there with its own four turns.
    await f.saves(f.cid, "switch", await f.command(f.cid, { timelineId: branchTimeline, recovery: false }));
    assert.equal(await committed(), committedAtEnd - 24 + 8 + 4, "the branch holds the opening turns, eight Astra turns and its own four");
    assert.ok(loopOps.length === 3);
  } finally { await f.db.close(); }
});
