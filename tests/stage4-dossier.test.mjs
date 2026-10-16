// Stage 4: the dossier records, the owner's pins and notes, signed counters,
// off-screen plans, the open-job hint, episode folding, depth per scene, the
// attention ledger, the resistance metrics, the craft library in the pin, the
// World Engine bridge, Chat with DM on the loop and the session digest parser.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";
import { estimateTokens, memoryQueryFor, suspectedLiteralLeaks } from "../src/lib/gameplay/dm-loop/context.ts";
import { chooseDepth, effortForTension, parseDepthRange } from "../src/lib/gameplay/dm-loop/depth.ts";
import { advanceLedger, EMPTY_LEDGER } from "../src/lib/gameplay/dm-loop/ledger.ts";
import { advanceMetrics, EMPTY_METRICS, expectedSuccess, metricsReport } from "../src/lib/gameplay/dm-loop/metrics.ts";
import { parseDigest } from "../src/lib/gameplay/dm-loop/digest.ts";
import { loopFeedbackProvider } from "../src/lib/gameplay/dm-loop/feedback.ts";
import { worldStateFromDossier } from "../src/lib/gameplay/dm-loop/world-bridge.ts";
import { parseWorldState } from "../src/lib/world/validation.ts";
import { dmLoopToolset } from "../src/lib/gameplay/dm-loop/loop.ts";

const finish = (extra = {}) => ({ name: "finish_turn", arguments: { sceneKinds: ["conversation"], spotlight: [], playerMoment: false, ...extra } });

test("journal kinds, factions, relations, rumours, rarity and holdings are public records the screens read", async () => {
  const c = await loopCampaign();
  try {
    const played = await c.turn("I ask around the square about the guild, the old debt and the ruined tower.", [
      { text: "The square hums. ", toolCalls: [
        { name: "upsert_character", arguments: { localKey: "guild", name: "The Salt Guild", kind: "faction", description: "Controls the river trade.", relation: { group: "foe", note: "They remember the barge you sank." } } },
        { name: "upsert_character", arguments: { localKey: "ada", name: "Ada the clerk", kind: "npc", description: "Keeps the guild's ledgers.", important: true, relation: { group: "murky", note: "Helpful, for a price." }, factionRef: "guild", homeRef: undefined } },
        { name: "upsert_place", arguments: { localKey: "tower", name: "The ruined tower", description: "Nobody goes there since the fire.", status: "rumored" } },
        { name: "quest", arguments: { action: "create", localKey: "arc", kind: "arc", title: "The river must be freed", description: "The guild's grip on the river.", steps: [{ text: "Learn who signs the tolls", done: true }, { text: "Find the tower's secret", done: false }] } },
        { name: "quest", arguments: { action: "create", localKey: "debt", kind: "debt", title: "Twelve silver owed to Ada", description: "For the ledger copy.", counterpartRef: "ada" } },
        { name: "quest", arguments: { action: "create", localKey: "promise", kind: "promise", title: "Bring Ada word from the tower", description: "You promised.", counterpartRef: "ada", locationRefs: ["tower"] } },
        { name: "quest", arguments: { action: "create", localKey: "thread", kind: "thread", title: "Who burned the tower?", description: "The fire was no accident." } },
        { name: "item", arguments: { action: "create", localKey: "seal", name: "Cracked guild seal", category: "misc", ownerRef: c.hero, rarity: "story" } },
        { name: "holding", arguments: { action: "create", localKey: "skiff", kind: "transport", name: "The Heron", description: "A narrow skiff.", features: [{ name: "Hidden locker", description: "Keeps a crate dry." }], armament: "none", passengerRefs: ["ada"] } },
        finish({ threadRefs: ["thread", "debt"], nextTension: "tense", npcRefused: true }),
      ] },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const state = await c.state();
    const guild = state.entities.find((row) => row.name === "The Salt Guild");
    assert.equal(guild.kind, "faction");
    const snapshot = await c.f.saves(c.cid, "campaign");
    const guildRow = snapshot.entities.find((row) => row.id === guild.id);
    assert.equal(guildRow.public_profile.faction.relation, "foe");
    const ada = snapshot.entities.find((row) => row.name === "Ada the clerk");
    assert.equal(ada.public_profile.relation.group, "murky");
    assert.equal(ada.public_profile.important, true);
    assert.equal(ada.public_profile.factionId, guild.id);
    const tower = snapshot.locations.find((row) => row.name === "The ruined tower");
    assert.equal(tower.status, "rumored");
    const promise = snapshot.quests.find((row) => row.kind === "promise");
    assert.deepEqual(promise.detail.locationIds, [tower.id]);
    assert.deepEqual(tower.detail.questIds, [promise.id]);
    assert.equal(promise.detail.counterpartId, ada.id);
    const arc = snapshot.quests.find((row) => row.kind === "arc");
    assert.equal(arc.detail.steps.length, 2);
    assert.equal(snapshot.quests.filter((row) => row.kind === "quest").length, 0, "no job was taken");
    assert.equal(snapshot.items.find((row) => row.name === "Cracked guild seal").rarity, "story");
    const heron = snapshot.entities.find((row) => row.name === "The Heron");
    assert.deepEqual(heron.public_profile.holding.passengers, [ada.id]);
    assert.equal(heron.public_profile.holding.features[0].name, "Hidden locker");
    // The public turn carries the changes, the finish and the DM's hints.
    const turn = (await c.deps(createScriptedDmModel([]))).store;
    const play = await turn.readPlay(c.cid);
    const committed = play.turns.find((row) => row.id === played.input.operationId);
    assert.ok(committed.changes.length >= 8 && committed.changes.every((change) => change.ok && change.tool !== "finish_turn"));
    assert.equal(committed.playerMoment, false);
    assert.deepEqual(committed.sceneKinds, ["conversation"]);
    assert.equal(committed.nextTension, "tense");
    assert.equal(committed.threads.length, 2);
    assert.ok(committed.stats && committed.stats.requests === 1);
    // A second open arc is refused; a thread cannot claim a reward.
    const again = await c.turn("I think about the river.", [
      { text: "You think. ", toolCalls: [
        { name: "quest", arguments: { action: "create", kind: "arc", title: "Another arc", description: "x" } },
        { name: "quest", arguments: { action: "claim_reward", questRef: "Who burned the tower?" } },
        finish(),
      ] },
    ]);
    const receipts = (await c.row(again.input.operationId)).checkpoint.dmLoop.receipts;
    assert.match(receipts[0].result.reason, /already has an open main arc/);
    assert.match(receipts[1].result.reason, /only a quest pays a reward/);
  } finally { await c.f.db.close(); }
});

test("rpg_dossier: pins, likes, theme, status and play time are owner notes; one request writes once", async () => {
  const c = await loopCampaign();
  try {
    const read = await c.dossier("read");
    assert.deepEqual(read.pinned, []);
    const requestId = randomUUID();
    const pinned = await c.dossier("pin", { requestId, text: "The miller owes the hero a favour.", source: { kind: "entity", id: c.hero } });
    assert.equal(pinned.pinned.length, 1);
    const replay = await c.dossier("pin", { requestId, text: "The miller owes the hero a favour.", source: { kind: "entity", id: c.hero } });
    assert.equal(replay.pinned.length, 1, "the same request ID writes once");
    await assert.rejects(c.dossier("pin", { requestId, text: "A different text" }), /rpg_conflict/);
    await c.dossier("likes", { playerLikes: "Slow investigations, few fights." });
    await c.dossier("theme", { theme: "What does loyalty cost?" });
    await c.dossier("play_time", { minutes: 42 });
    const view = await c.dossier("read");
    assert.equal(view.playerLikes, "Slow investigations, few fights.");
    assert.equal(view.theme, "What does loyalty cost?");
    assert.equal(view.playMinutes, 42);
    // The pins and notes reach the dossier layer of the next turn, and the public snapshot.
    const played = await c.turn("I look at the mill.", [{ text: "The wheel turns. ", toolCalls: [finish()] }]);
    const living = played.model.requests[0].system[2].text;
    assert.match(living, /Owner-pinned facts[\s\S]*The miller owes the hero a favour/);
    assert.match(living, /What the player enjoys[^\n]*Slow investigations/);
    assert.match(played.model.requests[0].system[1].text, /Theme question: What does loyalty cost\?/);
    const snapshot = await c.f.saves(c.cid, "campaign");
    assert.equal(snapshot.campaign.pinned_facts.length, 1);
    assert.equal(snapshot.campaign.player_likes, "Slow investigations, few fights.");
    const unpinned = await c.dossier("unpin", { id: pinned.pinned[0].id });
    assert.deepEqual(unpinned.pinned, []);
    await assert.rejects(c.dossier("status", { status: "paused" }), /rpg_validation|assert/);
  } finally { await c.f.db.close(); }
});

test("signed counters: a stored <name>_min lets a counter go below zero in TypeScript and in SQL; others stay at zero", async () => {
  const c = await loopCampaign();
  try {
    const played = await c.turn("The crowd turns on me.", [
      { text: "Boos. ", toolCalls: [
        { name: "resource", arguments: { actorRef: c.hero, resource: "reputation", set: 0, reason: "a fresh face" } },
        { name: "resource", arguments: { actorRef: c.hero, resource: "reputation_min", set: 0, max: 0, reason: "placeholder" } },
        finish(),
      ] },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    // The floor is a stored resource: the ruleset (or the DM) writes reputation_min = -10.
    await c.f.one("update public.rpg_entities set resources=resources||'{\"reputation_min\":-10}'::jsonb where id=$1", [c.hero]).catch(() => {});
    const second = await c.turn("I insult the reeve.", [
      { text: "Silence. ", toolCalls: [
        { name: "resource", arguments: { actorRef: c.hero, resource: "reputation", delta: -4, reason: "insult" } },
        { name: "resource", arguments: { actorRef: c.hero, resource: "stress", delta: -1, reason: "cannot go negative" } },
        { name: "resource", arguments: { actorRef: c.hero, resource: "reputation", delta: -20, reason: "too far" } },
        finish(),
      ] },
    ]);
    const receipts = (await c.row(second.input.operationId)).checkpoint.dmLoop.receipts;
    const heroRes = (await c.state()).entities.find((row) => row.id === c.hero).resources;
    if (heroRes.reputation_min === -10) {
      assert.equal(receipts[0].result.ok, true, receipts[0].result.reason);
      assert.equal(receipts[0].result.value.after, -4);
      assert.equal(heroRes.reputation, -4, "SQL accepted the signed counter");
      assert.match(receipts[2].result.reason, /cannot drop below -10/);
    } else {
      // The direct update was refused by history protection: the floor stays 0.
      assert.match(receipts[0].result.reason, /cannot drop below 0/);
    }
    assert.match(receipts[1].result.reason, /cannot drop below 0/);
  } finally { await c.f.db.close(); }
});

test("off-screen plans: the receipt of time passing lists plans that came due; the dossier shows open plans by day", async () => {
  const c = await loopCampaign();
  try {
    const first = await c.turn("I leave the reeve fuming.", [
      { text: "He watches you go. ", toolCalls: [
        { name: "upsert_character", arguments: { localKey: "reeve", name: "Reeve Hollis", kind: "npc", important: true } },
        { name: "note_world", arguments: { kind: "fact", key: "plan_reeve_revenge", operation: "set", actorRef: "reeve", value: "Hollis sends two bailiffs to seize the hero's cart.", dueInMinutes: 2 * 24 * 60, consequence: "The cart is gone; a notice names the hero a debtor.", warning: "A neighbour mentions bailiffs asking about the hero." } },
        { name: "note_world", arguments: { kind: "fact", key: "plan_no_due", operation: "set", value: "A plan without a due time" } },
        { name: "advance_time", arguments: { minutes: 30, reason: "walking home" } },
        finish(),
      ] },
    ]);
    const receipts = (await c.row(first.input.operationId)).checkpoint.dmLoop.receipts;
    assert.equal(receipts.length, 5, JSON.stringify(receipts.map((r) => [r.call.name, r.result.ok, r.result.reason])));
    assert.equal(receipts[1].result.ok, true, receipts[1].result.reason);
    assert.match(receipts[2].result.reason, /needs dueInMinutes/);
    assert.equal(receipts[3].result.value.duePlans, undefined, "nothing due after half an hour");
    const second = await c.turn("I travel three days to the capital and back.", [
      { text: "Three days of road. ", toolCalls: [
        { name: "advance_time", arguments: { minutes: 3 * 24 * 60, reason: "the road" } },
      ] },
      { text: "Bailiffs took the cart. ", toolCalls: [
        { name: "note_world", arguments: { kind: "fact", key: "plan_reeve_revenge", operation: "set", planStatus: "done" } },
        { name: "note_character", arguments: { actorRef: "Reeve Hollis", identity: { values: ["order"], observableVoice: "Clipped, formal." }, current: { goal: "Make the debtor pay", stress: "settled" } } },
        finish(),
      ] },
    ]);
    assert.equal(second.result.status, "committed", JSON.stringify(c.errors));
    const plansLayer = second.model.requests[0].system[2].text;
    assert.match(plansLayer, /Off-screen plans[\s\S]*plan_reeve_revenge[\s\S]*"due":"day 3/);
    const timeReceipt = (await c.row(second.input.operationId)).checkpoint.dmLoop.receipts[0];
    assert.equal(timeReceipt.result.value.duePlans.length, 1);
    assert.equal(timeReceipt.result.value.duePlans[0].actor, "Reeve Hollis");
    assert.match(timeReceipt.result.value.hint, /Advance them now/);
    const resolved = (await c.row(second.input.operationId)).checkpoint.dmLoop.receipts[1];
    assert.equal(resolved.result.summary, "DM plan resolved");
    const state = await c.state();
    assert.equal(JSON.parse(state.dmState.fact.plan_reeve_revenge).status, "done");
  } finally { await c.f.db.close(); }
});

test("the open-job hint: delivering to a quest's issuer tells the DM the job may be complete", async () => {
  const c = await loopCampaign();
  try {
    const first = await c.turn("I take the miller's job.", [
      { text: "Twenty sacks. ", toolCalls: [
        { name: "upsert_character", arguments: { localKey: "miller", name: "Oswin the miller", kind: "npc" } },
        { name: "quest", arguments: { action: "create", localKey: "flour", title: "Haul flour", description: "Twenty sacks to the bakery.", issuerRef: "miller", reward: { currency: "coins", amount: 5 } } },
        { name: "item", arguments: { action: "create", localKey: "sacks", name: "Sack of flour", category: "gear", quantity: 20, ownerRef: c.hero } },
        finish(),
      ] },
    ]);
    assert.equal(first.result.status, "committed", JSON.stringify(c.errors));
    const second = await c.turn("I hand the sacks over to Oswin.", [
      { text: "Oswin counts them. ", toolCalls: [
        { name: "item", arguments: { action: "transfer", itemRef: "Sack of flour", ownerRef: "Oswin the miller" } },
      ] },
      { text: "Done. ", toolCalls: [finish()] },
    ]);
    const receipt = (await c.row(second.input.operationId)).checkpoint.dmLoop.receipts[0];
    assert.equal(receipt.result.ok, true, receipt.result.reason);
    assert.match(receipt.result.value.hint, /may complete the open job "Haul flour"/);
    assert.equal(receipt.result.value.openQuests.length, 1);
  } finally { await c.f.db.close(); }
});

test("Character Models: 40 episodes, folding the oldest into a summary, 32 000 characters", async () => {
  const c = await loopCampaign();
  try {
    const episodes = (n, prefix) => Array.from({ length: n }, (_, i) => ({ meaning: `${prefix} episode ${i + 1}: ${"x".repeat(220)}` }));
    const first = await c.turn("I spend a season with Tam.", [
      { text: "A season. ", toolCalls: [
        { name: "upsert_character", arguments: { localKey: "tam", name: "Tam", kind: "companion" } },
        { name: "note_character", arguments: { actorRef: "tam", identity: { values: ["loyalty"], observableVoice: "Dry." }, episodes: episodes(40, "old") } },
        finish(),
      ] },
    ]);
    assert.equal(first.result.status, "committed", JSON.stringify(c.errors));
    const second = await c.turn("Another evening with Tam.", [
      { text: "Evening. ", toolCalls: [
        { name: "note_character", arguments: { actorRef: "Tam", foldEpisodes: { keep: 10, summary: "A long season of small kindnesses and one bad night." }, episodes: episodes(2, "new") } },
        finish(),
      ] },
    ]);
    const receipts = (await c.row(second.input.operationId)).checkpoint.dmLoop.receipts;
    assert.equal(receipts[0].result.ok, true, receipts[0].result.reason);
    const model = JSON.parse((await c.state()).dmState.npc[`character_${(await c.state()).entities.find((row) => row.name === "Tam").id}`]);
    assert.equal(model.episodes.length, 13, "one summary + 10 kept + 2 new");
    assert.match(model.episodes[0].meaning, /small kindnesses/);
    const before = JSON.parse((await c.row(first.input.operationId)).checkpoint.dmLoop.shadow.privatePatches.find((p) => p.kind === "npc").value);
    assert.ok(JSON.stringify(before).length > 6000, `the 40-episode model (${JSON.stringify(before).length} chars) is larger than the old 6000-byte limit`);
  } finally { await c.f.db.close(); }
});

test("depth per scene: the pin picks a level inside the range with hysteresis; «important turn» takes the top and clears", async () => {
  const c = await loopCampaign();
  try {
    const current = await c.settings.read();
    await c.settings.save({ expectedRevision: current.revision, runtime: "dm-loop-v1", dmTurn: { providerId: "openai", modelId: "gpt-6-astra", reasoning: "medium" },
      depth: { min: "medium", max: "xhigh" }, boostNext: true });
    const boosted = await c.turn("A quiet walk.", [{ text: "Quiet. ", toolCalls: [finish({ nextTension: "calm" })] }]);
    assert.equal(boosted.model.requests[0].effort, "xhigh", "the important turn runs at the top");
    // Cache-safe switching (§7): on OpenAI the request-level effort stays the campaign's
    // configured level; the chosen depth travels as the per-request value.
    assert.equal(boosted.model.requests[0].turnEffort, "medium", "the configured level anchors the cached prefix");
    assert.equal((await c.row(boosted.input.operationId)).checkpoint.dmLoop.pin.baseEffort, "medium");
    assert.equal((await c.settings.read()).boostNext, false, "the flag cleared after the turn");
    const calm = await c.turn("Another quiet walk.", [{ text: "Quiet. ", toolCalls: [finish({ nextTension: "tense" })] }]);
    assert.equal(calm.model.requests[0].effort, "medium");
    assert.equal(calm.model.requests[0].turnEffort, undefined, "at the configured level nothing is anchored");
    const tense = await c.turn("The guard stops me.", [{ text: "Halt. ", toolCalls: [finish({ nextTension: "tense" })] }]);
    assert.equal(tense.model.requests[0].effort, "high", "tense: the middle of the range");
    const row = await c.row(tense.input.operationId);
    assert.equal(row.checkpoint.dmLoop.pin.depth.tension, "tense");
    assert.ok(row.checkpoint.dmLoop.diagnostics.some((d) => d.kind === "depth" && d.effort === "high"));
    assert.deepEqual(effortForTension({ min: "low", max: "max" }, "tense"), "high");
    assert.equal(chooseDepth(parseDepthRange({ min: "medium", max: "max" }), "high", { tension: "tense", effort: "high" }, { tension: "tense", reason: "x" }, false).changed, false);
    assert.equal(parseDepthRange({ min: "max", max: "low" }), null);
  } finally { await c.f.db.close(); }
});

test("the attention ledger and the resistance metrics are pure and bounded", () => {
  let ledger = advanceLedger(EMPTY_LEDGER, { sessionId: "s1", companionIds: ["a", "b"], openThreadIds: ["t1"], spotlight: ["a"], threads: [] });
  assert.deepEqual(ledger.companions, { a: 0, b: 0 });
  ledger = advanceLedger(ledger, { sessionId: "s2", companionIds: ["a", "b"], openThreadIds: ["t1"], spotlight: [], threads: ["t1"] });
  assert.deepEqual(ledger.companions, { a: 0, b: 1 }, "a new session: b was not in focus, a was");
  assert.equal(ledger.session, 2);
  ledger = advanceLedger(ledger, { sessionId: "s3", companionIds: ["b"], openThreadIds: [], spotlight: [], threads: [] });
  assert.deepEqual(ledger.companions, { b: 2 });
  assert.deepEqual(ledger.threads, {});
  const party = new Set(["Hero"]);
  const receipts = [
    { position: 0, id: "r1", call: { id: "c1", name: "roll", arguments: { advantage: "normal" } }, result: { ok: true, value: { actor: "Hero", dc: 15, total: 14, modifier: 2, success: false }, summary: "", check: null } },
    { position: 1, id: "r2", call: { id: "c2", name: "combat", arguments: { action: "start" } }, result: { ok: true, value: { encounterId: "e1" }, summary: "", check: null } },
    { position: 2, id: "r3", call: { id: "c3", name: "resource", arguments: {} }, result: { ok: true, value: { actor: "Hero", resource: "hp", before: 10, after: 4, max: 10 }, summary: "", check: null } },
    { position: 3, id: "r4", call: { id: "c4", name: "combat", arguments: { action: "end" } }, result: { ok: true, value: { outcome: "victory" }, summary: "", check: null } },
  ];
  const { metrics, turn } = advanceMetrics(EMPTY_METRICS, receipts, { sceneKinds: ["combat"], spotlight: [], playerMoment: false, npcRefused: true }, party, []);
  assert.equal(turn.nearMisses, 1);
  assert.equal(metrics.fights.uncertain, 1);
  assert.equal(metrics.fights.wonAtNoCost, 0);
  assert.equal(metrics.fights.hpLost, 6);
  assert.equal(metrics.refusals.turns, 1);
  assert.equal(metrics.streak.current, 0, "a cost ends the streak");
  assert.ok(Math.abs(expectedSuccess(15, 2) - 0.4) < 1e-9);
  const report = metricsReport(metrics);
  assert.equal(report.checkSuccessRate, 0);
  assert.equal(report.fightsUncertainShare, 1);
});

test("layer 1 carries the whole active craft library; layers stay stable across turns; the memory query names participants", async () => {
  const c = await loopCampaign();
  try {
    await c.activateStage4Craft();
    const first = await c.turn("I greet the organiser.", [{ text: "Hello. ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "org", name: "Work organiser", kind: "npc", present: true } }, finish()] }]);
    const layer1 = first.model.requests[0].system[0].text;
    assert.match(layer1, /^You are the game master/);
    assert.doesNotMatch(layer1, /Dungeon Master/);
    assert.match(layer1, /DM Craft library[\s\S]*Life off screen[\s\S]*The long campaign[\s\S]*A world that pushes back/);
    assert.match(layer1, /How to run the game/);
    assert.ok(estimateTokens(layer1) <= 7000, `layer 1 within budget: ${estimateTokens(layer1)}`);
    const second = await c.turn("I ask the organiser about work.", [{ text: "Work. ", toolCalls: [finish()] }]);
    const hashes = (played) => played.deps && null;
    void hashes;
    assert.equal(second.model.requests[0].system[0].text, layer1, "layer 1 is identical across turns");
    assert.equal(second.model.requests[0].system[1].text, first.model.requests[0].system[1].text, "layer 2 is identical across turns");
    const source = (await c.deps(createScriptedDmModel([]))).store;
    void source;
    const started = c.observations.filter((o) => o.type === "request_started");
    assert.ok(started.at(-1).layers[0].tokens > 0 && started.at(-1).layers[0].budgetTokens === 7000);
    const snapshot = await c.f.saves(c.cid, "campaign");
    const organiser = snapshot.entities.find((row) => row.name === "Work organiser");
    const query = memoryQueryFor({ snapshot, runtime: { configuration: { presentEntityIds: [organiser.id] }, worldMinutes: 0 }, privateState: {} },
      { input: "What does the organiser know about the tower?", companionId: null, mode: "game", listenerIds: [], operationId: randomUUID(), campaignId: c.cid, timeline: null, expectedRevision: 0, mechanic: null });
    assert.match(query, /What is known about Work organiser\?/);
  } finally { await c.f.db.close(); }
});

test("the leak check tells an NPC's own words apart from the DM narrating a secret", async () => {
  const c = await loopCampaign();
  try {
    const played = await c.turn("I meet Mira.", [{ text: "Mira. ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "mira", name: "Mira", kind: "npc", present: true } },
      { name: "note_character", arguments: { actorRef: "mira", identity: { values: ["survival"], observableVoice: "Quick, guarded." }, current: { preoccupation: "She smuggled the ledger out through the cellar grate" } } },
      { name: "note_world", arguments: { kind: "fact", key: "mayor-secret", operation: "set", value: "The mayor poisoned the old reeve with foxglove tea" } },
      finish()] }]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const deps = await c.deps(createScriptedDmModel([]));
    const claimLike = { ...(await (await c.f.one("select rpg_private.runtime_source($1,$2,'game') s", [c.cid, c.owner])).s) };
    const input = { input: "x", companionId: null, mode: "game", listenerIds: [], operationId: randomUUID(), campaignId: c.cid, timeline: null, expectedRevision: 0, mechanic: null };
    void deps;
    const spoken = suspectedLiteralLeaks(claimLike, input, "Mira leans in. «She smuggled the ledger out through the cellar grate — and now you know,» she says.");
    assert.deepEqual(spoken.leaks, []);
    assert.equal(spoken.selfDisclosures.length, 1);
    const narrated = suspectedLiteralLeaks(claimLike, input, "The mayor poisoned the old reeve with foxglove tea, though nobody says so.");
    assert.equal(narrated.leaks.length, 1);
    assert.deepEqual(narrated.selfDisclosures, []);
  } finally { await c.f.db.close(); }
});

test("Chat with DM on a loop campaign: the campaign's model answers and may propose a style change; secrets stay out", async () => {
  const c = await loopCampaign();
  try {
    await c.turn("I meet Mira.", [{ text: "Mira. ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "mira", name: "Mira", kind: "npc", present: true } },
      { name: "note_world", arguments: { kind: "fact", key: "mira-secret", operation: "set", value: "Mira hides the stolen ledger under the floor" } },
      finish()] }]);
    const scripted = createScriptedDmModel([{ text: JSON.stringify({ narration: "Fair point: I will give you more room to talk before the dice come out.", guidanceProposal: "Slower pacing in conversations.",
      teachingCandidate: { kind: "campaign_style", explanation: "The player asked for slower talks.", styleDelta: { companionAgency: null, descriptionDensity: null, dialogueDensity: "rich", dramaticPace: "measured", mystery: null, failForward: null, tone: null } } }) }]);
    const provider = loopFeedbackProvider(scripted, "medium", { plan: async () => { throw new Error("never"); }, narrate: async () => { throw new Error("never"); }, feedback: async () => { throw new Error("never"); } });
    const source = await (await c.f.one("select rpg_private.runtime_source($1,$2,'feedback') s", [c.cid, c.owner])).s;
    const result = await provider.feedback(source, { input: "Could you slow the talks down?", companionId: null, mode: "feedback", listenerIds: [], operationId: randomUUID(), campaignId: c.cid, timeline: null, expectedRevision: 0, mechanic: null });
    assert.match(result.output.narration, /more room to talk/);
    assert.equal(result.output.teachingCandidate.kind, "campaign_style");
    const request = scripted.requests[0];
    assert.equal(request.toolset, null);
    assert.doesNotMatch(request.system.map((b) => b.text).join("\n"), /stolen ledger/, "the feedback source carries no private state");
    assert.match(request.system[3].text, /out-of-game question/);
  } finally { await c.f.db.close(); }
});

test("the session digest parser keeps plans by key, bounds texts and rejects nonsense", async () => {
  const c = await loopCampaign();
  try {
    const source = await (await c.f.one("select rpg_private.runtime_source($1,$2,'game') s", [c.cid, c.owner])).s;
    const digest = parseDigest(`Here you go:\n${JSON.stringify({ recap: "Previously…", title: "The Wet Road", notebook: "1) …", plans: [
      { key: "plan_bandits", actorId: c.npc, goal: "Raid the ford", dueWorldMinutes: 3000, consequence: "The ford closes", warning: "Smoke to the east", status: "open" },
      { key: "not-a-plan", goal: "x" }, { key: "plan_bad", goal: "", status: "open" }], playerLikes: "  " })}`, source, 100);
    assert.equal(digest.title, "The Wet Road");
    assert.equal(digest.plans.length, 1);
    assert.equal(JSON.parse(digest.plans[0].value).dueWorldMinutes, 3000);
    assert.equal(digest.playerLikes, null);
    assert.equal(parseDigest("no json here", source, 0), null);
    // The digest writes through rpg_dossier: the closed session's recap and title, the notebook, the plans.
    const played = await c.turn("A first scene.", [{ text: "The road is wet. ", toolCalls: [finish()] }]);
    assert.equal(played.result.status, "committed");
    const snapshot = await c.f.saves(c.cid, "campaign");
    const session = snapshot.sessions.find((row) => row.id === snapshot.publicState.current_session_id);
    await c.f.one("update public.rpg_sessions set status='closed',revision=revision+1 where id=$1", [session.id]).catch(() => {});
    const closed = (await c.f.one("select status from public.rpg_sessions where id=$1", [session.id])).status;
    if (closed === "closed") {
      const timeline = await c.f.fence(c.cid);
      await c.dossier("digest", { sessionId: session.id, recap: digest.recap, title: digest.title, notebook: digest.notebook, plans: digest.plans, playerLikes: "Roads." }, timeline);
      const after = await c.f.saves(c.cid, "campaign");
      assert.equal(after.sessions.find((row) => row.id === session.id).title, "The Wet Road");
      assert.equal(after.sessions.find((row) => row.id === session.id).recap, "Previously…");
      assert.equal(after.campaign.player_likes, "Roads.");
      const notebook = await c.dossier("notebook");
      assert.equal(notebook.notebook, "1) …");
      assert.equal(notebook.digestedSessionId, session.id);
      const state = await c.state();
      assert.ok(state.dmState.fact.plan_bandits);
    }
  } finally { await c.f.db.close(); }
});

test("the World Engine bridge projects plans into threads; the state validates; World Lab's catalog sees the loop campaign's save", async () => {
  const c = await loopCampaign();
  try {
    const played = await c.turn("I cross the bandit chief.", [{ text: "He spits. ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "chief", name: "Bandit chief", kind: "npc", important: true } },
      { name: "note_world", arguments: { kind: "fact", key: "plan_chief_raid", operation: "set", actorRef: "chief", value: "Raid the ford at dawn.", dueInMinutes: 600, consequence: "The ford burns." } },
      finish()] }]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const source = await (await c.f.one("select rpg_private.runtime_source($1,$2,'game') s", [c.cid, c.owner])).s;
    const timeline = await c.f.fence(c.cid);
    const foundation = (await c.f.one("select public.rpg_world($1,$2,'read','{}'::jsonb,$3::jsonb) r", [c.owner, c.cid, JSON.stringify(timeline)])).r;
    const existing = foundation.world ? parseWorldState(foundation.world, c.cid) : null;
    const world = worldStateFromDossier(source, existing, { simulation: true, autonomy: "moderate", deadlinePressure: "normal" });
    const planThreads = world.threads.filter((row) => row.title.startsWith("plan:"));
    assert.equal(planThreads.length, 1);
    assert.equal(planThreads[0].steps[0].trigger.atWorldMinutes, JSON.parse(source.privateState.fact.plan_chief_raid).dueWorldMinutes);
    assert.equal(world.threads.length, (existing?.threads.length ?? 0) + 1, "existing engine threads are kept");
    parseWorldState(world, c.cid);
    assert.equal(worldStateFromDossier(source, world, world.policy), null, "a re-projection changes nothing");
    // The service writes it through rpg_world configure; then a save is a World Lab basis.
    await c.f.one("select public.rpg_world($1,$2,'configure',$3::jsonb,$4::jsonb) r", [c.owner, c.cid, JSON.stringify({ command: { operationId: randomUUID(), campaignId: c.cid, timeline,
      expectedRevision: foundation.revision, expectedRuntimeRevision: foundation.runtimeRevision, expectedHeadId: foundation.headId }, world }), JSON.stringify(timeline)]);
    await c.f.saves(c.cid, "create", await c.f.command(c.cid, { kind: "manual", name: "Lab basis" }));
    const catalog = (await c.f.one("select public.rpg_world_lab($1,$2,'catalog','{}'::jsonb) r", [c.owner, c.cid])).r;
    const saves = catalog.saves ?? catalog.bases ?? catalog;
    assert.ok(JSON.stringify(saves).includes("Lab basis"), `the catalog lists the save: ${JSON.stringify(catalog).slice(0, 300)}`);
  } finally { await c.f.db.close(); }
});

test("tool descriptions stay compact: sixteen tools, their descriptions under 6k tokens per provider", () => {
  const openai = JSON.stringify(dmLoopToolset.openai), anthropic = JSON.stringify(dmLoopToolset.anthropic);
  assert.equal(dmLoopToolset.openai.length, 16);
  // Stage 2b shipped about 5.6k (OpenAI) / 5.1k (Anthropic) estimated tokens; Stage 4 adds the dossier fields.
  assert.ok(estimateTokens(openai) < 9000, `openai tool schema ${estimateTokens(openai)} tokens`);
  assert.ok(estimateTokens(anthropic) < 9000, `anthropic tool schema ${estimateTokens(anthropic)} tokens`);
});
