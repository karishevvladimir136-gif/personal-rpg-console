import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { resumeDmLoopTurn } from "../src/lib/gameplay/dm-loop/loop.ts";
import { DM_LOOP_DEFAULT_LIMITS } from "../src/lib/gameplay/dm-loop/limits.ts";

test("a rejected call returns a reason and the turn continues; money, items and the hero stay consistent", async () => {
  const c = await loopCampaign();
  try {
    const played = await c.turn("I ask the baker for two loaves and offer to pay.", [
      { text: "The baker, Mira, wipes her hands. ", toolCalls: [
        { name: "upsert_character", arguments: { localKey: "baker", name: "Mira the baker", kind: "npc", present: true } },
        { name: "item", arguments: { action: "create", localKey: "bread", name: "Loaf of bread", category: "consumable", quantity: 6, ownerRef: "baker", properties: "Restores a little strength when eaten." } },
      ] },
      { text: "\"Five coins the pair.\" You check your purse. ", toolCalls: [
        { name: "money", arguments: { action: "transfer", currency: "coins", amount: 5, fromRef: c.hero, toRef: "baker" } },
      ] },
      { text: "Your purse is empty; Mira shrugs and keeps the loaves. ", toolCalls: [
        { name: "finish_turn", arguments: { sceneKinds: ["trade"], spotlight: ["baker"], playerMoment: false } },
      ] },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const row = await c.row(played.input.operationId);
    const rejected = row.checkpoint.dmLoop.receipts.filter((receipt) => !receipt.result.ok);
    assert.equal(rejected.length, 1);
    assert.match(rejected[0].result.reason, /Not enough coins: .* has 0, this needs 5/);
    const state = await c.state();
    const bread = state.items.find((item) => item.name === "Loaf of bread");
    assert.equal(bread.quantity, 6);
    assert.equal(bread.owner_entity_id, state.entities.find((entity) => entity.name === "Mira the baker").id);
    const last = played.model.requests.at(-1).messages.at(-1);
    assert.equal(last.role, "tool_results");
    assert.ok(last.results[0].isError && /Not enough coins/.test(last.results[0].output));
  } finally { await c.f.db.close(); }
});

test("buying bread, eating it and giving the second loaf to a new companion", async () => {
  const c = await loopCampaign();
  try {
    const first = await c.turn("I find a baker.", [
      { text: "Mira bakes. ", toolCalls: [
        { name: "upsert_character", arguments: { localKey: "baker", name: "Mira", kind: "npc", present: true } },
        { name: "item", arguments: { action: "create", localKey: "bread", name: "Loaf of bread", category: "consumable", quantity: 6, ownerRef: "baker" } },
        { name: "money", arguments: { action: "grant", currency: "coins", amount: 10, toRef: c.hero, reason: "savings from the road" } },
        { name: "upsert_character", arguments: { localKey: "tam", name: "Tam", kind: "companion", party: true, present: true, maxHp: 8 } },
      ] },
      { text: "Done. " },
    ]);
    assert.equal(first.result.status, "committed", JSON.stringify(c.errors));
    let state = await c.state();
    const baker = state.entities.find((entity) => entity.name === "Mira");
    const tam = state.entities.find((entity) => entity.name === "Tam");
    const bread = state.items.find((item) => item.name === "Loaf of bread");
    assert.equal(tam.kind, "companion");
    assert.ok(state.runtime.configuration.controlledEntityIds.includes(tam.id));
    assert.ok(state.runtime.configuration.presentEntityIds.includes(baker.id));
    const second = await c.turn("I buy two loaves, eat one and hand the other to Tam.", [
      { text: "Coins change hands. ", toolCalls: [
        { name: "money", arguments: { action: "transfer", currency: "coins", amount: 5, fromRef: c.hero, toRef: baker.id } },
        { name: "item", arguments: { action: "transfer", itemRef: bread.id, quantity: 2, ownerRef: c.hero, localKey: "mine" } },
        { name: "item", arguments: { action: "consume", itemRef: "mine", quantity: 1 } },
        { name: "item", arguments: { action: "transfer", itemRef: "mine", quantity: 1, ownerRef: tam.id } },
      ] },
      { text: "Tam grins around a mouthful. " },
    ]);
    assert.equal(second.result.status, "committed", JSON.stringify(c.errors));
    const row = await c.row(second.input.operationId);
    assert.ok(row.checkpoint.dmLoop.receipts.every((receipt) => receipt.result.ok), JSON.stringify(row.checkpoint.dmLoop.receipts.map((r) => r.result)));
    state = await c.state();
    assert.equal(state.entities.find((entity) => entity.id === c.hero).resources.currency_coins, 5);
    assert.equal(state.entities.find((entity) => entity.name === "Mira").resources.currency_coins, 5);
    const loaves = state.items.filter((item) => item.name === "Loaf of bread");
    // The hero's last loaf moved to Tam as a whole stack; the empty stack is gone.
    assert.deepEqual(loaves.map((item) => [item.owner_entity_id === baker.id ? "baker" : item.owner_entity_id === tam.id ? "tam" : "hero", item.quantity]).sort(),
      [["baker", 4], ["tam", 1]]);
  } finally { await c.f.db.close(); }
});

test("a reward of 500 coins and a looted sword as a weapon; the reward is paid exactly once", async () => {
  const c = await loopCampaign();
  try {
    const setup = await c.turn("I take the job.", [
      { text: "The reeve offers gold. ", toolCalls: [
        { name: "upsert_character", arguments: { localKey: "reeve", name: "The reeve", kind: "npc", present: true } },
        { name: "quest", arguments: { action: "create", localKey: "bandits", title: "Clear the bandits", description: "Drive the bandits from the pass.",
          issuerRef: "reeve", reward: { currency: "coins", amount: 500, items: [{ name: "Reeve's sword", category: "weapon", quantity: 1, properties: "1d8 slashing, well balanced" }] } } },
      ] },
      { text: "Agreed. " },
    ]);
    assert.equal(setup.result.status, "committed", JSON.stringify(c.errors));
    const quest = (await c.state()).quests.find((row) => row.title === "Clear the bandits");
    const paid = await c.turn("I return with the bandits' leader bound and claim my pay. Then I equip the sword.", [
      { text: "The reeve counts out the coins. ", toolCalls: [
        { name: "quest", arguments: { action: "complete", questRef: quest.id } },
        { name: "quest", arguments: { action: "claim_reward", questRef: quest.id } },
        { name: "item", arguments: { action: "create", localKey: "loot", name: "Bandit sabre", category: "weapon", quantity: 1, ownerRef: c.hero, properties: "1d6 slashing, notched" } },
        { name: "item", arguments: { action: "equip", itemRef: "loot" } },
      ] },
      { text: "\"And he still owes me,\" you say, trying your luck. ", toolCalls: [
        { name: "quest", arguments: { action: "claim_reward", questRef: quest.id } },
        { name: "money", arguments: { action: "grant", currency: "coins", amount: 500, toRef: c.hero, reason: "the reeve pays the bandit bounty again", questRef: quest.id } },
      ] },
      { text: "The reeve laughs you off. " },
    ]);
    assert.equal(paid.result.status, "committed", JSON.stringify(c.errors));
    const receipts = (await c.row(paid.input.operationId)).checkpoint.dmLoop.receipts;
    assert.deepEqual(receipts.map((r) => r.result.ok), [true, true, true, true, false, false], JSON.stringify(receipts.map((r) => r.result)));
    assert.match(receipts[4].result.reason, /already paid/);
    assert.match(receipts[5].result.reason, /already paid/);
    const state = await c.state();
    assert.equal(state.entities.find((entity) => entity.id === c.hero).resources.currency_coins, 500);
    const sword = state.items.find((item) => item.name === "Reeve's sword");
    assert.equal(sword.category, "weapon");
    assert.equal(sword.owner_entity_id, c.hero);
    assert.equal(state.items.find((item) => item.name === "Bandit sabre").equipped_slot, "hand");
    assert.equal(state.quests.find((row) => row.id === quest.id).status, "complete");
  } finally { await c.f.db.close(); }
});

test("a visible d20 check pauses for interactive dice, continues with the same receipt, and a reroll reaches the model", async () => {
  const c = await loopCampaign();
  try {
    const played = await c.turn("I try to sneak past the guard.", [
      { text: "You slip along the wall… ", toolCalls: [
        { name: "roll", arguments: { formula: "1d20", reason: "sneaking past the guard", actorRef: c.hero, visibility: "player", dc: 12, kind: "skill" } },
      ] },
      { text: "The guard yawns and looks the other way. ", toolCalls: [
        { name: "finish_turn", arguments: { sceneKinds: ["exploration"], spotlight: [], playerMoment: false } },
      ] },
    ], { dice: [7], autoContinue: false });
    assert.equal(played.result.status, "awaiting_confirmation", JSON.stringify(c.errors));
    assert.equal(played.result.checks.length, 1);
    assert.deepEqual(played.result.checks[0].dice, [7]);
    assert.equal(played.result.checks[0].canReroll, true);
    const rerolled = await resumeDmLoopTurn({ commandId: randomUUID(), campaignId: c.cid, operationId: played.input.operationId,
      timeline: played.input.timeline, action: "reroll", checkId: played.result.checks[0].id }, await c.deps(played.model));
    assert.equal(rerolled.status, "awaiting_confirmation", JSON.stringify([c.errors, c.observations.filter((o) => o.type === "failure")]));
    assert.equal(rerolled.checks[0].rollNumber, 2);
    const continued = await c.retry(played, "continue");
    assert.equal(continued.result.status, "committed", JSON.stringify(c.errors));
    const row = await c.row(played.input.operationId);
    assert.equal(row.checkpoint.dmLoop.receipts.length, 2);
    assert.equal(row.checkpoint.checks.length, 1);
    assert.equal(row.checkpoint.checks[0].rollNumber, 2);
    const results = played.model.requests.at(-1).messages.find((m) => m.role === "tool_results");
    assert.ok(results.results[0].output.includes(`"total":${row.checkpoint.checks[0].total}`));
  } finally { await c.f.db.close(); }
});

test("a crash mid-loop resumes from the checkpoint without rolling the dice again", async () => {
  const c = await loopCampaign();
  try {
    const played = await c.turn("I leap the chasm.", [
      { text: "You run at the edge… ", toolCalls: [
        { name: "roll", arguments: { formula: "1d20+2", reason: "the leap", actorRef: c.hero, visibility: "private", dc: 10 } },
        { name: "roll", arguments: { formula: "2d6", reason: "fall damage if it goes wrong", actorRef: "dm", visibility: "private" } },
      ] },
      { failBefore: "transport" },
      { text: "…and land hard on the far side. ", toolCalls: [
        { name: "resource", arguments: { actorRef: c.hero, resource: "hp", delta: -3, max: 10, reason: "a rough landing" } },
        { name: "finish_turn", arguments: { sceneKinds: ["exploration"], spotlight: [], playerMoment: false } },
      ] },
    ], { dice: [9, 3, 4] });
    assert.equal(played.result.status, "failed");
    assert.equal(played.result.canRetry, true);
    const before = await c.row(played.input.operationId);
    assert.equal(before.checkpoint.dmLoop.receipts.length, 2);
    const firstDice = before.checkpoint.dmLoop.receipts.map((receipt) => receipt.result.value.dice);
    assert.deepEqual(firstDice, [[9], [3, 4]]);
    const retried = await c.retry(played, "retry");
    assert.equal(retried.result.status, "committed", JSON.stringify(c.errors));
    const after = await c.row(played.input.operationId);
    assert.deepEqual(after.checkpoint.dmLoop.receipts.slice(0, 2).map((receipt) => receipt.result.value.dice), firstDice);
    assert.equal(after.checkpoint.dmLoop.receipts.length, 4);
    assert.equal(after.checkpoint.dmLoop.requests, 2);
    assert.match(after.narration, /run at the edge[\s\S]*land hard/);
    assert.equal(c.observations.filter((o) => o.type === "tool_receipt").length, 4);
    assert.equal((await c.state()).entities.find((entity) => entity.id === c.hero).hp, 7);
  } finally { await c.f.db.close(); }
});

test("talking to a companion is an ordinary turn with an addressee; identity is fixed; not during combat", async () => {
  const c = await loopCampaign();
  try {
    const joined = await c.turn("Tam joins me.", [
      { text: "Tam shoulders her pack. ", toolCalls: [
        { name: "upsert_character", arguments: { localKey: "tam", name: "Tam", kind: "companion", party: true, present: true } },
        { name: "note_character", arguments: { actorRef: "tam", identity: { values: ["loyalty"], observableVoice: "Dry, quick jokes." },
          current: { goal: "see the coast", stress: "settled" } } },
      ] },
      { text: "She is ready. " },
    ]);
    assert.equal(joined.result.status, "committed", JSON.stringify(c.errors));
    const tam = (await c.state()).entities.find((entity) => entity.name === "Tam");
    const talk = await c.turn("Tam, do you trust the reeve?", [
      { text: "\"Trust him? I trust his coin,\" Tam says. ", toolCalls: [
        { name: "advance_time", arguments: { minutes: 5, reason: "a quiet talk" } },
        { name: "note_character", arguments: { actorRef: tam.id, episodes: [{ meaning: "The hero asked for her honest read of the reeve.", cue: "the reeve" }] } },
      ] },
      { text: "\"Keep your eyes open.\" " },
    ], { mode: "companion", companionId: tam.id });
    assert.equal(talk.result.status, "committed", JSON.stringify(c.errors));
    assert.equal(talk.result.mode, "companion");
    assert.equal(talk.result.companionId, tam.id);
    const state = await c.state();
    assert.equal(state.runtime.world_minutes, 5);
    const model = JSON.parse(state.dmState.npc[`character_${tam.id}`]);
    assert.equal(model.episodes.length, 1);
    assert.equal(model.identity.observableVoice, "Dry, quick jokes.");
    assert.ok(talk.model.requests[0].system[2].text.includes("Dry, quick jokes."));
    assert.ok(talk.model.requests[0].messages[0].text.includes("The player speaks to Tam"));
    const fixed = await c.turn("Tam changes her mind about everything.", [
      { text: "Tam shrugs. ", toolCalls: [{ name: "note_character", arguments: { actorRef: tam.id, identity: { values: ["gold"] } } }] },
      { text: "She is who she is. " },
    ]);
    const receipts = (await c.row(fixed.input.operationId)).checkpoint.dmLoop.receipts;
    assert.equal(receipts[0].result.ok, false);
    assert.match(receipts[0].result.reason, /identity is established/);
    const fight = await c.turn("Bandits!", [
      { text: "Steel is drawn. ", toolCalls: [{ name: "combat", arguments: { action: "start", participantRefs: [], summary: "Bandits on the road" } }] },
      { text: "The fight is on. " },
    ]);
    assert.equal(fight.result.status, "committed", JSON.stringify(c.errors));
    const blocked = await c.turn("Tam, cover me!", [{ text: "…" }], { mode: "companion", companionId: tam.id });
    assert.equal(blocked.result.status, "failed");
    assert.equal(blocked.result.failure, "validation");
  } finally { await c.f.db.close(); }
});

test("the per-turn tool cap tells the model to wrap up; the turn still commits with narration", async () => {
  const c = await loopCampaign();
  try {
    const many = Array.from({ length: DM_LOOP_DEFAULT_LIMITS.toolCallsPerTurn + 3 }, (_, index) =>
      ({ name: "advance_time", arguments: { minutes: 1, reason: `tick ${index}` } }));
    const played = await c.turn("I wait and count the hours.", [
      { text: "You wait. ", toolCalls: many },
      { text: "Time crawls. ", toolCalls: [{ name: "advance_time", arguments: { minutes: 1, reason: "one more" } }] },
      { text: "Evening comes at last." },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const row = await c.row(played.input.operationId);
    const receipts = row.checkpoint.dmLoop.receipts;
    assert.equal(receipts.filter((r) => r.result.ok).length, DM_LOOP_DEFAULT_LIMITS.toolCallsPerTurn);
    assert.ok(receipts.slice(DM_LOOP_DEFAULT_LIMITS.toolCallsPerTurn).every((r) => !r.result.ok && /limit/.test(r.result.reason)));
    assert.ok(row.checkpoint.dmLoop.diagnostics.some((d) => d.kind === "tool_cap_reached"));
    const wrap = played.model.requests.at(-1).messages.filter((m) => m.role === "user").at(-1);
    assert.match(wrap.text, /tool budget/);
    assert.equal((await c.state()).runtime.world_minutes, DM_LOOP_DEFAULT_LIMITS.toolCallsPerTurn);
    assert.match(row.narration, /Evening comes at last/);
  } finally { await c.f.db.close(); }
});

test("a harmless private detail never fails the turn; a literal secret is logged, not blocked", async () => {
  const c = await loopCampaign();
  try {
    const first = await c.turn("I meet the organiser.", [
      { text: "He taps his ledger. ", toolCalls: [
        { name: "note_character", arguments: { actorRef: c.npc, identity: { loyalties: ["his sister Wenna"], observableVoice: "Brisk and polite." },
          current: { stress: "strained", preoccupation: "secretly lets smugglers hide crates in the old mill at night" } } },
        { name: "note_world", arguments: { kind: "fact", key: "mill-secret", operation: "set", value: "The organiser owes the smuggler captain forty silver." } },
      ] },
      { text: "He says nothing of it. " },
    ]);
    assert.equal(first.result.status, "committed", JSON.stringify(c.errors));
    const harmless = await c.turn("Any family here?", [
      { text: "\"Only my sister Wenna,\" he says, and his voice sounds strained. " },
    ]);
    assert.equal(harmless.result.status, "committed");
    assert.deepEqual((await c.row(harmless.input.operationId)).checkpoint.dmLoop.diagnostics, []);
    const leak = await c.turn("Tell me everything.", [
      { text: "He breaks: he secretly lets smugglers hide crates in the old mill at night." },
    ]);
    assert.equal(leak.result.status, "committed");
    const diagnostics = (await c.row(leak.input.operationId)).checkpoint.dmLoop.diagnostics;
    assert.ok(diagnostics.some((d) => d.kind === "suspected_leak" && /smugglers/.test(d.detail)));
  } finally { await c.f.db.close(); }
});

test("travel: the party moves, local characters stay, time passes; a move without time is refused", async () => {
  const c = await loopCampaign();
  try {
    const played = await c.turn("I head for the mill.", [
      { text: "The path winds uphill. ", toolCalls: [
        { name: "upsert_place", arguments: { localKey: "mill", name: "The old mill", description: "Stone, by the brook." } },
        { name: "move_party", arguments: { placeRef: "mill", minutes: 0 } },
        { name: "move_party", arguments: { placeRef: "mill", minutes: 20 } },
      ] },
      { text: "You arrive. " },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const receipts = (await c.row(played.input.operationId)).checkpoint.dmLoop.receipts;
    assert.deepEqual(receipts.map((r) => r.result.ok), [true, false, true], JSON.stringify(receipts.map((r) => r.result)));
    const state = await c.state();
    const mill = state.locations.find((row) => row.name === "The old mill");
    assert.equal(state.publicState.current_location_id, mill.id);
    assert.equal(mill.status, "visited");
    assert.equal(state.runtime.world_minutes, 20);
    assert.ok(!state.runtime.configuration.presentEntityIds.includes(c.npc));
    assert.ok(state.runtime.configuration.presentEntityIds.includes(c.hero));
  } finally { await c.f.db.close(); }
});

test("DM settings: runtime and model are editable; a turn pins the model at its start", async () => {
  const c = await loopCampaign();
  try {
    assert.deepEqual(await c.settings.read(), { campaignId: c.cid, runtime: "dm-loop-v1", dmTurn: null,
      limits: DM_LOOP_DEFAULT_LIMITS, customLimits: false, revision: 0 });
    const saved = await c.settings.save({ expectedRevision: 0, runtime: "dm-loop-v1",
      dmTurn: { providerId: "anthropic", modelId: "claude-opus-5-5", reasoning: "high" } });
    assert.equal(saved.revision, 1);
    assert.equal(saved.dmTurn.modelId, "claude-opus-5-5");
    await assert.rejects(c.settings.save({ expectedRevision: 0, runtime: "dm-loop-v1", dmTurn: null }), { code: "conflict" });
    await assert.rejects(c.settings.save({ expectedRevision: 1, runtime: "dm-loop-v1",
      dmTurn: { providerId: "openai", modelId: "gpt-5.4", reasoning: null } }), { code: "validation" });
    const played = await c.turn("I look around.", [{ text: "A quiet square. " }]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const row = await c.row(played.input.operationId);
    assert.deepEqual([row.checkpoint.dmLoop.pin.providerId, row.checkpoint.dmLoop.pin.modelId, row.checkpoint.dmLoop.pin.effort],
      ["anthropic", "claude-opus-5-5", "high"]);
    const pins = await c.f.query("select task,profile from rpg_private.execution_profiles where campaign_id=$1 and operation_id=$2", [c.cid, played.input.operationId]);
    assert.deepEqual(pins.map((p) => p.task), ["dm.turn"]);
    assert.equal(pins[0].profile.modelId, "claude-opus-5-5");
    const back = await c.settings.save({ expectedRevision: 1, runtime: "astra-primary-v1", dmTurn: null });
    assert.equal(back.runtime, "astra-primary-v1");
  } finally { await c.f.db.close(); }
});

test("finish_turn before any narration asks the model for the text instead of failing the turn", async () => {
  const c = await loopCampaign();
  try {
    const played = await c.turn("I look around the square.", [
      { toolCalls: [
        { name: "advance_time", arguments: { minutes: 2, reason: "looking around" } },
        { name: "finish_turn", arguments: { sceneKinds: ["quiet"], spotlight: [], playerMoment: false } },
      ] },
      { text: "Carts, dust, the smell of bread from somewhere behind the well." },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify([c.errors, c.observations.filter((o) => o.type === "failure")]));
    assert.match(played.result.narration, /smell of bread/);
    const nudge = played.model.requests.at(-1).messages.filter((m) => m.role === "user").at(-1);
    assert.match(nudge.text, /not seen any narration yet/);
    const row = await c.row(played.input.operationId);
    assert.deepEqual(row.checkpoint.dmLoop.meta.sceneKinds, ["quiet"]);
    assert.equal(row.checkpoint.dmLoop.requests, 2);
  } finally { await c.f.db.close(); }
});

test("a payment from the quest's issuer after completion settles the reward; a later claim is refused", async () => {
  const c = await loopCampaign();
  try {
    const setup = await c.turn("I take the organiser's job.", [
      { text: "Chalked up. ", toolCalls: [
        { name: "money", arguments: { action: "grant", currency: "coins", amount: 20, toRef: c.npc, reason: "the organiser's purse" } },
        { name: "quest", arguments: { action: "create", localKey: "flour", title: "Haul flour", description: "Twenty sacks.", issuerRef: c.npc, reward: { currency: "coins", amount: 5 } } },
      ] },
      { text: "Done. " },
    ]);
    assert.equal(setup.result.status, "committed", JSON.stringify(c.errors));
    const quest = (await c.state()).quests.find((row) => row.title === "Haul flour");
    const paid = await c.turn("I finish the work and he pays me.", [
      { text: "He counts coins. ", toolCalls: [
        { name: "quest", arguments: { action: "complete", questRef: quest.id } },
        { name: "money", arguments: { action: "transfer", currency: "coins", amount: 4, fromRef: c.npc, toRef: c.hero } },
        { name: "quest", arguments: { action: "claim_reward", questRef: quest.id } },
      ] },
      { text: "Four it is. " },
    ]);
    assert.equal(paid.result.status, "committed", JSON.stringify(c.errors));
    const receipts = (await c.row(paid.input.operationId)).checkpoint.dmLoop.receipts;
    assert.deepEqual(receipts.map((r) => r.result.ok), [true, true, false]);
    assert.equal(receipts[1].result.value.settlesQuest, "Haul flour");
    assert.match(receipts[2].result.reason, /already paid/);
    const state = await c.state();
    assert.equal(state.entities.find((row) => row.id === c.hero).resources.currency_coins, 4);
    assert.equal(state.entities.find((row) => row.id === c.npc).resources.currency_coins, 16);
  } finally { await c.f.db.close(); }
});

test("null optional arguments (OpenAI strict schemas) mean the same as absent ones", async () => {
  const c = await loopCampaign();
  try {
    const played = await c.turn("I meet the miller.", [
      { text: "A mill. ", toolCalls: [
        { name: "upsert_place", arguments: { ref: null, localKey: "mill", name: "The mill", description: null, status: null } },
        { name: "upsert_character", arguments: { ref: null, localKey: "miller", name: "Oswin", kind: "npc", description: null, present: null, party: null, hp: null, maxHp: null, stats: null, statblock: null } },
        { name: "quest", arguments: { action: "create", questRef: null, localKey: "flour", title: "Haul flour", description: null, issuerRef: "miller", recipientRef: null, reward: { currency: "coins", amount: 5, items: null, note: null } } },
        { name: "note_character", arguments: { actorRef: "miller", identity: { values: ["work"], wants: null, boundaries: null, loyalties: null, signatures: null, observableVoice: null }, current: { goal: null, stress: "settled", preoccupation: null, obligation: null }, beliefs: null, relationships: null, episodes: null } },
      ] },
      { text: "Recorded. " },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const receipts = (await c.row(played.input.operationId)).checkpoint.dmLoop.receipts;
    assert.deepEqual(receipts.map((r) => r.result.ok), [true, true, true, true], JSON.stringify(receipts.map((r) => r.result)));
    const state = await c.state();
    assert.ok(state.locations.some((row) => row.name === "The mill"));
    assert.ok(state.quests.some((row) => row.title === "Haul flour"));
  } finally { await c.f.db.close(); }
});
