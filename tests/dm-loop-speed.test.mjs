// Stage 2b (speed and fluency): narration first with tools inside the story,
// one retry after a rejection, relaxed Character Model bounds, per-round
// effort, and the cache key. The model is scripted; the real loop runs on PGlite.
import test from "node:test";
import assert from "node:assert/strict";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { continuation, joinText, textSeparator } from "../src/lib/gameplay/dm-loop/loop.ts";
import { CHARACTER_MODEL_BOUNDS } from "../src/lib/gameplay/character-model.ts";

test("text written around a tool call joins as one narration: a dash continues, a sentence breaks the paragraph", () => {
  assert.equal(textSeparator("He swings—", "—and misses."), "");
  assert.equal(joinText("He swings—", "—and misses."), "He swings—and misses.");
  assert.equal(joinText("He swings —", " and misses."), "He swings —and misses.");
  assert.equal(joinText("The hinge grinds.", "Nobody stirs."), "The hinge grinds.\n\nNobody stirs.");
  assert.equal(joinText("\"Two coins,\" she says", "and does not look up."), "\"Two coins,\" she says and does not look up.");
  assert.equal(joinText("First part.\n", "\nSecond part."), "First part.\n\nSecond part.");
  assert.equal(joinText("", "  Opening."), "  Opening.");
  assert.equal(joinText("Kept.", "   "), "Kept.");
  assert.equal(continuation("He swings—", "\n—and misses."), "and misses.");
});

test("the live stream shows each request's text at once and ends up identical to the saved narration", async () => {
  const c = await loopCampaign();
  try {
    const before = c.live.length;
    const played = await c.turn("I slip into the storeroom.", [
      { text: "Rowan eases the shutter open; the hinge grinds—", toolCalls: [
        { name: "roll", arguments: { formula: "1d20", reason: "sneaking in", actorRef: c.hero, visibility: "private", dc: 12 } },
      ] },
      { text: "\n\n—and the courtyard stays quiet. He slips inside.", toolCalls: [
        { name: "upsert_place", arguments: { localKey: "storeroom", name: "The storeroom", description: "Sacks of flour in the dark.", status: "visited" } },
        { name: "advance_time", arguments: { minutes: 10, reason: "sneaking" } },
        { name: "finish_turn", arguments: { sceneKinds: ["exploration"], spotlight: [], playerMoment: false } },
      ] },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    assert.equal(played.result.narration, "Rowan eases the shutter open; the hinge grinds—and the courtyard stays quiet. He slips inside.");
    const streamed = c.live.slice(before).filter((event) => event.type === "text").map((event) => event.text);
    assert.equal(streamed.join(""), played.result.narration);
    // The first text reached the player before the roll was executed.
    const order = c.live.slice(before).map((event) => event.type);
    assert.ok(order.indexOf("text") < order.indexOf("tool"));
    // Two requests: narration + the deciding roll, then the rest with the bookkeeping and finish_turn.
    assert.equal(played.model.requests.length, 2);
    const row = await c.row(played.input.operationId);
    assert.equal(row.checkpoint.dmLoop.receipts.filter((r) => r.result.ok).length, 4);
  } finally { await c.f.db.close(); }
});

test("the instructions teach narration first, parallel calls and the examples in the campaign language; the request carries the cache key", async () => {
  const c = await loopCampaign();
  try {
    const played = await c.turn("I look around.", [{ text: "Carts, dust, a well.", toolCalls: [
      { name: "finish_turn", arguments: { sceneKinds: ["quiet"], spotlight: [], playerMoment: false } }] }]);
    assert.equal(played.result.status, "committed");
    const request = played.model.requests[0];
    const layer1 = request.system[0].text;
    assert.match(layer1, /tell the story first, act inside it/);
    assert.match(layer1, /Independent calls always travel together in one message/);
    assert.match(layer1, /Shape of a turn \(examples/);
    assert.match(layer1, /Do not call query_state for what is there/);
    assert.equal(request.system[0].cache, true);
    assert.equal(request.cacheKey, c.cid);
    assert.equal(request.effort, "high");
    assert.equal(request.turnEffort, undefined);
  } finally { await c.f.db.close(); }
});

test("a reference nobody has names the closest existing records with their IDs, so one retry is enough", async () => {
  const c = await loopCampaign();
  try {
    const played = await c.turn("I nod to the organiser.", [
      { text: "He nods back.", toolCalls: [
        { name: "note_character", arguments: { actorRef: "Local organiser", current: { stress: "settled" } } },
      ] },
      { text: "", toolCalls: [
        { name: "note_character", arguments: { actorRef: c.npc, current: { stress: "settled" } } },
        { name: "finish_turn", arguments: { sceneKinds: ["quiet"], spotlight: [], playerMoment: false } },
      ] },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const receipts = (await c.row(played.input.operationId)).checkpoint.dmLoop.receipts;
    assert.equal(receipts[0].result.ok, false);
    assert.match(receipts[0].result.reason, /nothing named "Local organiser" exists yet/);
    assert.match(receipts[0].result.hint, new RegExp(`Did you mean Local work organiser \\(${c.npc}\\)`));
    assert.equal(receipts[1].result.ok, true);
  } finally { await c.f.db.close(); }
});

test("Character Model bounds are generous: long lists and texts are kept; an oversized field is named in the rejection", async () => {
  const c = await loopCampaign();
  try {
    const B = CHARACTER_MODEL_BOUNDS;
    const long = (n, seed) => Array.from({ length: n }, (_, i) => `${seed} ${i}: ${"a long, specific note about this person ".repeat(3)}`.slice(0, 120));
    const played = await c.turn("I watch the organiser work.", [
      { text: "He works.", toolCalls: [
        { name: "note_character", arguments: { actorRef: c.npc,
          identity: { values: long(4, "value"), wants: long(3, "want"), boundaries: long(2, "boundary"), loyalties: long(2, "loyalty"), signatures: long(4, "signature"),
            observableVoice: "Brisk and polite, with a habit of answering questions about himself with questions about work; ".repeat(4).slice(0, 300) },
          current: { goal: "x".repeat(200), stress: "strained", preoccupation: "y".repeat(200) },
          beliefs: Array.from({ length: 4 }, (_, i) => ({ text: `Belief ${i}: ${"z".repeat(120)}`, confidence: "tentative" })),
          episodes: Array.from({ length: 5 }, (_, i) => ({ meaning: `Episode ${i}: ${"w".repeat(80)}`, cue: "the mill" })),
        } },
        { name: "note_character", arguments: { actorRef: c.npc, current: { goal: "g".repeat(B.listText + 1) } } },
        { name: "finish_turn", arguments: { sceneKinds: ["quiet"], spotlight: [c.npc], playerMoment: false } },
      ] },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const receipts = (await c.row(played.input.operationId)).checkpoint.dmLoop.receipts;
    assert.equal(receipts[0].result.ok, true, receipts[0].result.reason);
    assert.equal(receipts[1].result.ok, false);
    // The schema check names the field and the bound before the model is even built.
    assert.match(receipts[1].result.reason, new RegExp(`current\\.goal: longer than ${B.listText}`));
    const stored = JSON.parse((await c.state()).dmState.npc[`character_${c.npc}`]);
    assert.equal(stored.identity.values.length, 4);
    assert.equal(stored.beliefs.length, 4);
    assert.equal(stored.episodes.length, 5);
    assert.ok(stored.identity.observableVoice.length > 180);
  } finally { await c.f.db.close(); }
});

test("a pinned continuation effort applies to every request after the first and survives a retry", async () => {
  const c = await loopCampaign();
  try {
    const pin = async () => ({ providerId: "openai", modelId: "gpt-6-astra", effort: "high", continuationEffort: "low" });
    const played = await c.turn("I knock on the mill door.", [
      { text: "Knock, knock.", toolCalls: [{ name: "advance_time", arguments: { minutes: 1, reason: "knocking" } }] },
      { text: "", failBefore: "transport" },
      { text: "No answer.", toolCalls: [{ name: "finish_turn", arguments: { sceneKinds: ["quiet"], spotlight: [], playerMoment: false } }] },
    ], { deps: { pin } });
    assert.equal(played.result.status, "failed");
    const retried = await c.retry(played);
    assert.equal(retried.result.status, "committed", JSON.stringify(c.errors));
    const requests = played.model.requests;
    assert.deepEqual(requests.map((r) => [r.effort, r.turnEffort ?? null]), [["high", null], ["low", "high"], ["low", "high"]]);
    const loop = (await c.row(played.input.operationId)).checkpoint.dmLoop;
    assert.deepEqual([loop.pin.effort, loop.pin.continuationEffort], ["high", "low"]);
    assert.deepEqual(loop.usage.map((u) => u.effort), ["high", "low"]);
    // Without a different continuation level the pin carries no such field.
    const plain = await c.turn("I wait.", [{ text: "Nothing.", toolCalls: [{ name: "finish_turn", arguments: { sceneKinds: ["quiet"], spotlight: [], playerMoment: false } }] }],
      { deps: { pin: async () => ({ providerId: "openai", modelId: "gpt-6-astra", effort: "high", continuationEffort: "high" }) } });
    assert.equal((await c.row(plain.input.operationId)).checkpoint.dmLoop.pin.continuationEffort, undefined);
  } finally { await c.f.db.close(); }
});
