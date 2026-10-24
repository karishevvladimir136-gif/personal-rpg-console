// The owner, after the findings-S3 hoard probe (40 accepted calls, then the rest refused — the 20 minutes of time passing
// among them): a turn's record calls are written with time passing first, and past the limit they go on as a second batch
// instead of being refused. A fixture hoard of 60 items, in both runtimes: time advances, every record lands.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";
import { runTwoPassTurn, resumeTwoPassTurn } from "../src/lib/gameplay/dm-loop/two-pass/index.ts";
import { recordOrder } from "../src/lib/gameplay/dm-loop/execute.ts";
import { DM_LOOP_DEFAULT_LIMITS, PRIVATE_PATCHES_FOR_CALLS, PRIVATE_PATCHES_PER_TURN, RECORD_BATCHES_PER_TURN, SERVER_PRIVATE_PATCHES, turnCallCap, turnItemCap } from "../src/lib/gameplay/dm-loop/limits.ts";

const HOARD = 60;
const hoardCalls = (hero) => Array.from({ length: HOARD }, (_, index) =>
  ({ name: "item", arguments: { action: "create", name: `Монета клада №${index + 1}`, category: "misc", quantity: 1, ownerRef: hero } }));
const closing = (sceneKinds = ["exploration"]) => [
  { name: "note_world", arguments: { kind: "fact", key: "lair_hoard", operation: "set", value: "Клад главаря разобран: шестьдесят монет старой чеканки." } },
  { name: "advance_time", arguments: { minutes: 20, reason: "разбор клада" } },
  { name: "finish_turn", arguments: { sceneKinds, spotlight: [], playerMoment: false, nextTension: "calm" } },
];

async function twoPass(c, text, writerRounds, bookkeeperRounds) {
  const writer = createScriptedDmModel(writerRounds, { providerId: "anthropic", modelId: "claude-opus-5-5" });
  const bookkeeper = createScriptedDmModel(bookkeeperRounds, { providerId: "anthropic", modelId: "claude-opus-5-5" });
  const base = await c.deps(writer);
  const deps = { ...base, pin: async (claim) => ({ ...(await base.pin(claim)), providerId: "anthropic", modelId: "claude-opus-5-5", effort: "high" }),
    bookkeeper: { providerId: "anthropic", modelId: "claude-opus-5-5", effort: "high", model: bookkeeper } };
  const input = await c.input(text);
  let result = await runTwoPassTurn(input, deps);
  for (let continues = 0; result.status === "awaiting_confirmation" && continues < 4; continues++)
    result = await resumeTwoPassTurn({ commandId: randomUUID(), campaignId: c.cid, operationId: input.operationId, timeline: input.timeline, action: "continue", checkId: null }, deps);
  return { input, result, bookkeeper };
}

test("the record order: time passing first, the rest in the model's order; move_party and rest keep their place", () => {
  const calls = ["item", "upsert_place", "move_party", "note_world", "rest", "advance_time", "finish_turn"].map((name, index) => ({ name, index }));
  assert.deepEqual(recordOrder(calls).map((call) => call.name), ["advance_time", "item", "upsert_place", "move_party", "note_world", "rest", "finish_turn"]);
  const two = [{ name: "item", n: 1 }, { name: "advance_time", n: 2 }, { name: "item", n: 3 }, { name: "advance_time", n: 4 }];
  assert.deepEqual(recordOrder(two).map((call) => call.n), [2, 4, 1, 3], "stable");
  assert.equal(RECORD_BATCHES_PER_TURN, 2);
  assert.equal(turnCallCap(DM_LOOP_DEFAULT_LIMITS), 2 * DM_LOOP_DEFAULT_LIMITS.toolCallsPerTurn);
  assert.ok(turnItemCap(DM_LOOP_DEFAULT_LIMITS) >= HOARD && HOARD > DM_LOOP_DEFAULT_LIMITS.itemsPerTurn, "the fixture hoard needs the second batch of items too");
  assert.ok(HOARD + 3 > DM_LOOP_DEFAULT_LIMITS.toolCallsPerTurn && HOARD + 3 <= turnCallCap(DM_LOOP_DEFAULT_LIMITS));
});

test("a 60-item hoard in «пишет — записывает»: the bookkeeper's time passing is written first, the second batch lands, every item is recorded", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const before = (await c.state()).runtime.world_minutes;
    const ledger = "<ledger>\nвещи — герой забрал из сундука шестьдесят монет старой чеканки\nвремя — 20 минут, логово\nсцена — exploration; напряжение дальше: calm\n</ledger>";
    const played = await twoPass(c, "Обыскиваю сундук главаря и забираю всё.", [
      { text: `Крышка сундука поднимается туго. Под ветошью — монеты старой чеканки, шестьдесят штук, и ты пересыпаешь их в мешок одну за другой.\n\n${ledger}` },
    ], [{ text: "", toolCalls: [...hoardCalls(c.hero), ...closing()] }]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const state = await c.state();
    const hoard = state.items.filter((item) => item.name.startsWith("Монета клада №") && item.owner_entity_id === c.hero);
    assert.equal(hoard.length, HOARD, "all sixty items landed");
    assert.equal(state.runtime.world_minutes, before + 20, "time advanced");
    assert.match(JSON.stringify(state.dmState), /Клад главаря разобран/, "the note landed");
    const loop = (await c.row(played.input.operationId)).checkpoint.dmLoop;
    const bookkeeping = loop.receipts.filter((receipt) => receipt.call.name !== "roll");
    assert.equal(bookkeeping[0].call.name, "advance_time", "time passing is written first");
    assert.ok(bookkeeping.every((receipt) => receipt.result.ok), JSON.stringify(bookkeeping.filter((r) => !r.result.ok).map((r) => r.result.reason)));
    assert.ok(loop.diagnostics.some((d) => d.kind === "record_batch"), "the records went on as a second batch");
    assert.ok(!loop.diagnostics.some((d) => d.kind === "tool_cap_reached"));
    // The bookkeeper got its results back in its own order, by call ID.
    const results = played.bookkeeper.requests.length > 1 ? played.bookkeeper.requests.at(-1).messages.find((m) => m.role === "tool_results") : null;
    if (results) assert.equal(results.results.length, HOARD + 3);
  } finally { await c.f.db.close(); }
});

test("a 60-item hoard on the single DM: time first, both batches, every item, and the turn closes", async () => {
  const c = await loopCampaign();
  try {
    const before = (await c.state()).runtime.world_minutes;
    const played = await c.turn("I empty the chest into my pack.", [
      { text: "Sixty old coins, one by one, into the pack. ", toolCalls: [...hoardCalls(c.hero), ...closing()] },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const state = await c.state();
    assert.equal(state.items.filter((item) => item.name.startsWith("Монета клада №") && item.owner_entity_id === c.hero).length, HOARD);
    assert.equal(state.runtime.world_minutes, before + 20);
    const loop = (await c.row(played.input.operationId)).checkpoint.dmLoop;
    assert.equal(loop.receipts[0].call.name, "advance_time");
    assert.ok(loop.receipts.every((receipt) => receipt.result.ok));
    assert.equal(loop.receipts.length, HOARD + 3);
  } finally { await c.f.db.close(); }
});

test("a plan set before the message's time passing that comes due in it says so itself, stamped at its own minute, and the turn stays open", async () => {
  const c = await loopCampaign();
  try {
    const before = (await c.state()).runtime.world_minutes;
    const played = await c.turn("I wait by the gate for an hour.", [
      { text: "You wait. ", toolCalls: [
        { name: "upsert_character", arguments: { localKey: "watch", name: "Gate watchman", kind: "npc", important: true } },
        { name: "note_world", arguments: { kind: "fact", key: "plan_watch_report", operation: "set", actorRef: "watch", value: "The watchman reports the hero to the captain.", dueInMinutes: 10, consequence: "The captain knows." } },
        // A bookkeeping message that closes with time passing would end the turn by itself (foldsFinish) — not when a plan came due.
        { name: "advance_time", arguments: { minutes: 60, reason: "waiting" } }] },
      { text: "The watchman is gone — off to the captain. ", toolCalls: [
        { name: "note_world", arguments: { kind: "fact", key: "plan_watch_report", operation: "set", planStatus: "done" } },
        { name: "finish_turn", arguments: { sceneKinds: ["quiet"], spotlight: [], playerMoment: false, nextTension: "calm" } }] },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const receipts = (await c.row(played.input.operationId)).checkpoint.dmLoop.receipts;
    assert.equal(receipts[0].call.name, "advance_time");
    const plan = receipts.find((r) => r.call.arguments.key === "plan_watch_report" && r.call.arguments.planStatus === undefined);
    assert.equal(plan.result.ok, true, plan.result.reason);
    assert.equal(plan.result.value.plan.dueWorldMinutes, before + 10, "due ten minutes after the minute it was set in the story");
    assert.equal(plan.result.value.cameDue.overdueMinutes, 50);
    assert.match(plan.result.value.hint, /came due while this message's time passed/);
    assert.ok(receipts.some((r) => r.call.arguments.planStatus === "done" && r.result.ok), "the DM got the next request and resolved it");
  } finally { await c.f.db.close(); }
});

test("past the commit's 40 private patches (four are the server's) a note is refused on its own, and the turn commits", async () => {
  assert.equal(PRIVATE_PATCHES_FOR_CALLS, PRIVATE_PATCHES_PER_TURN - SERVER_PRIVATE_PATCHES);
  const c = await loopCampaign();
  try {
    const notes = Array.from({ length: PRIVATE_PATCHES_PER_TURN + 5 }, (_, index) =>
      ({ name: "note_world", arguments: { kind: "fact", key: `clue_${index}`, operation: "set", value: `Clue number ${index}.` } }));
    const played = await c.turn("I search every corner.", [
      { text: "You find clue after clue. ", toolCalls: [...notes, { name: "advance_time", arguments: { minutes: 10, reason: "search" } },
        { name: "finish_turn", arguments: { sceneKinds: ["exploration"], spotlight: [], playerMoment: false, nextTension: "calm" } }] },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const receipts = (await c.row(played.input.operationId)).checkpoint.dmLoop.receipts;
    const refused = receipts.filter((receipt) => !receipt.result.ok);
    assert.equal(refused.length, notes.length - PRIVATE_PATCHES_FOR_CALLS);
    assert.ok(refused.every((receipt) => receipt.call.name === "note_world" && /private notes are full/.test(receipt.result.reason)));
    const state = await c.state();
    assert.ok(JSON.stringify(state.dmState).includes(`Clue number ${PRIVATE_PATCHES_FOR_CALLS - 1}.`) && !JSON.stringify(state.dmState).includes(`Clue number ${PRIVATE_PATCHES_FOR_CALLS}.`));
    assert.ok(receipts.find((receipt) => receipt.call.name === "advance_time").result.ok);
  } finally { await c.f.db.close(); }
});
