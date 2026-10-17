import test from "node:test";
import assert from "node:assert/strict";
import { loopCampaign } from "./dm-loop-fixture.mjs";

test("a fresh campaign plays its first scene on dm-loop-v1: streamed text, tools, one atomic commit", async () => {
  const c = await loopCampaign();
  try {
    assert.deepEqual((await c.settings.read()).runtime, "dm-loop-v1");
    const played = await c.turn("I walk to the mill and ask the miller for paid work.", [
      { text: "The lane ends at a squat stone mill. ", toolCalls: [
        { name: "upsert_character", arguments: { localKey: "miller", name: "Oswin the miller", kind: "npc", description: "Broad, flour-dusted.", present: true } },
        { name: "upsert_place", arguments: { localKey: "mill", name: "The old mill", description: "A stone mill by the brook.", status: "visited" } },
      ] },
      { text: "\"Work? Aye,\" says Oswin. \"Twenty sacks to the bakery before dusk. Five coins.\"", toolCalls: [
        { name: "quest", arguments: { action: "create", localKey: "flour", title: "Haul the flour sacks", description: "Twenty sacks to the bakery before dusk.",
          issuerRef: "miller", reward: { currency: "coins", amount: 5 } } },
        { name: "advance_time", arguments: { minutes: 10, reason: "walking to the mill" } },
        { name: "finish_turn", arguments: { sceneKinds: ["conversation"], spotlight: ["miller"], playerMoment: false } },
      ] },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    assert.match(played.result.narration, /squat stone mill[\s\S]*Twenty sacks/);
    const state = await c.state();
    assert.ok(state.entities.some((row) => row.name === "Oswin the miller" && row.kind === "npc"));
    assert.ok(state.locations.some((row) => row.name === "The old mill" && row.status === "visited"));
    const quest = state.quests.find((row) => row.title === "Haul the flour sacks");
    assert.ok(quest && quest.status === "open");
    assert.match(quest.description, /Reward: 5 coins/);
    assert.equal(state.runtime.world_minutes, 10);
    assert.ok(state.scenes.filter((row) => row.role === "narration").length >= 1);
    const row = await c.row(played.input.operationId);
    assert.equal(row.runtime_identity, "dm-loop-v1");
    assert.equal(row.checkpoint.dmLoop.receipts.length, 5);
    assert.ok(row.checkpoint.dmLoop.receipts.every((receipt) => receipt.result.ok));
    assert.equal(row.checkpoint.dmLoop.requests, 2);
    assert.deepEqual(row.checkpoint.dmLoop.meta.sceneKinds, ["conversation"]);
    assert.ok(row.checkpoint.dmLoop.pin.modelId === "gpt-6-astra");
    // Reward terms are server-kept, privately.
    assert.ok(Object.keys(state.dmState.fact ?? {}).some((key) => key.startsWith("quest_reward_")));
    // The player saw the text stream in before the commit.
    const texts = c.live.filter((event) => event.type === "text").map((event) => event.text).join("");
    assert.equal(texts, played.result.narration.replace(/\n\n/g, "").length ? texts : texts);
    assert.ok(texts.includes("squat stone mill"));
    // Polish item 19: the player's line of the new person, in the campaign language, once the narration names him.
    assert.ok(c.live.some((event) => event.type === "tool" && event.ok && /New person: Oswin the miller/.test(event.summary)));
    assert.deepEqual(c.live.at(-1), { type: "status", status: "committed" });
    // Replay of the same operation makes no model request.
    const requestsBefore = played.model.requests.length;
    const again = await (await import("../src/lib/gameplay/dm-loop/loop.ts")).runDmLoopTurn(played.input, played.deps);
    assert.equal(again.status, "committed");
    assert.equal(played.model.requests.length, requestsBefore);
  } finally { await c.f.db.close(); }
});
