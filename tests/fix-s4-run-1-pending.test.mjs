// Fix S4 run 1 — what the player can do while a roll card waits (docs FIX_S4_TABLE items 3, 11b, 11r, 11w): «?» goes
// through and the card keeps waiting; the DM (or the owner) withdraws a card that should not have been called; the
// owner voids a roll made on a check that was later cancelled (the record amended, never rewritten); a reroll touches
// only the card it names and a resolved card never comes back. On the real turn path (PGlite, every migration).
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fixture as mechanicsFixture, id as fixtureId } from "./phase2-mechanics-fixtures.mjs";
import { translate } from "../src/lib/i18n.ts";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { executeDmLoopTurn, resumeDmLoopTurn, runDmLoopTurn } from "../src/lib/gameplay/dm-loop/loop.ts";
import { runTwoPassTurn, resumeTwoPassTurn } from "../src/lib/gameplay/dm-loop/two-pass/index.ts";
import { runTurn } from "../src/lib/gameplay/turn-engine.ts";
import { loopFeedbackProvider, parseWithdrawals, waitingCardsBlock } from "../src/lib/gameplay/dm-loop/feedback.ts";
import { withdrawByDm } from "../src/lib/gameplay/dm-loop/check-corrections.ts";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";
import { cardState, rerollableCards, rerollsLeftText, voidable, waitingCards } from "../src/lib/gameplay/card-state.ts";
import { validateResumeInput } from "../src/lib/gameplay/request-validation.ts";

const finish = (kinds = ["conversation"]) => ({ name: "finish_turn", arguments: { sceneKinds: kinds, spotlight: [], playerMoment: false } });
const roll = (hero, reason, dc = 14) => ({ name: "roll", arguments: { formula: "1d20", reason, actorRef: hero, visibility: "player", dc, kind: "skill" } });
const never = { plan: async () => { throw new Error("never"); }, narrate: async () => { throw new Error("never"); }, feedback: async () => { throw new Error("never"); } };
const command = (c, input, action, checkId = null) => ({ commandId: randomUUID(), campaignId: c.cid, operationId: input.operationId, timeline: input.timeline, action, checkId });
const refused = (error) => error?.code === "validation";

/** A game turn that pauses on the scripted model's first message (its later rounds play after «Onward»). */
async function paused(c, text, rounds, dice) {
  const model = createScriptedDmModel(rounds);
  const input = await c.input(text);
  c.forceDice(dice);
  const result = await runDmLoopTurn(input, await c.deps(model));
  assert.equal(result.status, "awaiting_confirmation", JSON.stringify(c.errors));
  return { model, input, result };
}
/** The «?» button: an out-of-game turn on the loop campaign's own path (the service's loopFeedback branch). */
async function ask(c, text, answer) {
  const model = createScriptedDmModel([{ text: JSON.stringify({ guidanceProposal: null, teachingCandidate: null, ...answer }) }]);
  const store = (await c.deps(createScriptedDmModel([]))).store;
  const input = await c.input(text, "ooc");
  const result = await runTurn(input, { store, provider: loopFeedbackProvider(model, "medium", never),
    withdrawChecks: (asked, requests) => withdrawByDm(store, c.cid, asked.operationId, requests) });
  return { model, input, result };
}

test("11b: «?» goes through while a card waits; the DM answers seeing the card; the card stays and the turn still waits for the die", async () => {
  const c = await loopCampaign();
  try {
    const game = await paused(c, "I tell Mags the Lady gave me no such word.", [
      { text: "Mags folds her arms and waits. ", toolCalls: [roll(c.hero, "Deception: telling Mags the Lady gave no such word")] },
      { text: "She weighs it, and lets it stand. ", toolCalls: [finish()] },
    ], [9]);
    const card = game.result.checks[0];
    assert.equal(cardState(game.result, card), "waiting");
    const asked = await ask(c, "Why a Deception check? James is telling the truth.", { narration: "Fair question: the check stands because Mags doubts you, but it is your call to make." });
    assert.equal(asked.result.status, "committed", JSON.stringify(c.errors));
    assert.equal(asked.result.mode, "ooc");
    assert.match(asked.result.narration, /Fair question/);
    // The answer saw the waiting card — its id, what is checked and what adds to the die — and the field that withdraws it.
    const now = asked.model.requests[0].system.at(-1).text;
    assert.match(now, new RegExp(`id ${card.id}: .*Deception: telling Mags the Lady gave no such word`));
    assert.match(now, /withdrawChecks/);
    const line = now.split("\n").find((row) => row.includes(card.id));
    assert.doesNotMatch(line, /kept|total|rolled|die: \d/, "the die stays off the answer's context (the player may not have rolled it yet)");
    // The card still waits; the game turn still waits for the die, and «Onward» goes on as before.
    const after = await (await c.deps(createScriptedDmModel([]))).store.getPublic(c.cid, game.input.operationId);
    assert.equal(after.status, "awaiting_confirmation");
    assert.deepEqual(waitingCards(after).map((check) => check.id), [card.id]);
    assert.equal(after.checks[0].withdrawn ?? null, null);
    const done = await resumeDmLoopTurn(command(c, game.input, "continue"), await c.deps(game.model));
    assert.equal(done.status, "committed", JSON.stringify(c.errors));
    // A «?» with no card waiting carries no card block.
    const quiet = await ask(c, "How long until the lamps?", { narration: "About an hour." });
    assert.doesNotMatch(quiet.model.requests[0].system.at(-1).text, /A roll card waits/);
  } finally { await c.f.db.close(); }
});

test("item 3: the DM withdraws the card in its out-of-game answer — the card is gone, the turn waits, and «Onward» tells the DM; the record keeps it, marked", async () => {
  const c = await loopCampaign();
  try {
    const game = await paused(c, "I tell Mags the truth: the Lady gave me no such word.", [
      { text: "Mags narrows her eyes. ", toolCalls: [roll(c.hero, "Deception: telling Mags the Lady gave no such word")] },
      { text: "Mags hears the plain truth in it and nods. ", toolCalls: [finish()] },
    ], [4]);
    const card = game.result.checks[0];
    const asked = await ask(c, "James tells the truth here — shouldn't that be no roll?", {
      narration: "You're right: a true answer is not rolled. I've withdrawn the Deception check; Mags reacts to your words.",
      withdrawChecks: [{ id: card.id, reason: "the hero told the truth" }, { id: randomUUID(), reason: "not a card that waits" }],
    });
    assert.equal(asked.result.status, "committed", JSON.stringify(c.errors));
    const store = (await c.deps(createScriptedDmModel([]))).store;
    const after = await store.getPublic(c.cid, game.input.operationId);
    assert.equal(after.status, "awaiting_confirmation", "the turn still waits (for «Onward» now)");
    assert.deepEqual(after.checks[0].withdrawn, { by: "dm", reason: "the hero told the truth" });
    assert.equal(after.checks[0].canReroll, false);
    assert.deepEqual(waitingCards(after), [], "the withdrawn card no longer waits — no «Roll the die» on it");
    // A reroll of the withdrawn card is refused with a reason and changes nothing (never a failed turn).
    await assert.rejects(resumeDmLoopTurn(command(c, game.input, "reroll", card.id), await c.deps(game.model)), refused);
    assert.equal((await store.getPublic(c.cid, game.input.operationId)).status, "awaiting_confirmation");
    // «Onward»: the DM is told the check was withdrawn; its tool result reads as withdrawn (no dice); the turn commits.
    const done = await resumeDmLoopTurn(command(c, game.input, "continue"), await c.deps(game.model));
    assert.equal(done.status, "committed", JSON.stringify(c.errors));
    const sent = game.model.requests.at(-1).messages;
    assert.ok(sent.some((m) => m.role === "user" && /withdrawn at the table \(by you, in an out-of-game answer: the hero told the truth\)/.test(m.text)));
    const results = sent.find((m) => m.role === "tool_results").results[0].output;
    assert.match(results, /"withdrawn":true/);
    assert.doesNotMatch(results, /"total"|"dice"/);
    // History is kept: the check and its receipt stay as rolled; the public record marks it and its chip says so.
    const row = await c.row(game.input.operationId);
    assert.equal(row.checkpoint.checks.length, 1);
    assert.deepEqual(row.checkpoint.checks[0].dice, [4]);
    assert.ok(row.checkpoint.dmLoop.diagnostics.some((d) => d.kind === "check_withdrawn" && d.id === card.id && d.by === "dm"));
    assert.equal(done.checks[0].withdrawn.by, "dm");
    const chip = done.changes.find((change) => change.tool === "roll");
    assert.match(chip.summary, /— withdrawn at the table$/);
    assert.equal(chip.checkId, card.id);
  } finally { await c.f.db.close(); }
});

test("item 3: the owner withdraws a waiting card from the card; a second withdrawal and a void of a waiting card are refused", async () => {
  const c = await loopCampaign();
  try {
    const game = await paused(c, "I climb the wall.", [
      { text: "The stones are wet. ", toolCalls: [roll(c.hero, "Athletics: climbing the wet wall", 12)] },
      { text: "You stay on the ground and look for another way. ", toolCalls: [finish(["exploration"])] },
    ], [3]);
    const card = game.result.checks[0];
    await assert.rejects(resumeDmLoopTurn(command(c, game.input, "void", card.id), await c.deps(game.model)), refused, "a waiting card is withdrawn, not voided");
    const withdrawn = await resumeDmLoopTurn(command(c, game.input, "withdraw", card.id), await c.deps(game.model));
    assert.equal(withdrawn.status, "awaiting_confirmation");
    assert.deepEqual(withdrawn.checks[0].withdrawn, { by: "owner", reason: null });
    await assert.rejects(resumeDmLoopTurn(command(c, game.input, "withdraw", card.id), await c.deps(game.model)), refused);
    const done = await resumeDmLoopTurn(command(c, game.input, "continue"), await c.deps(game.model));
    assert.equal(done.status, "committed", JSON.stringify(c.errors));
    assert.ok(game.model.requests.at(-1).messages.some((m) => m.role === "user" && /withdrawn at the table \(by the player\)/.test(m.text)));
  } finally { await c.f.db.close(); }
});

test("item 3, roll-then-cancel: the owner voids a rolled card of a committed turn — the record is amended as a correction, the DM sees it after", async () => {
  const c = await loopCampaign();
  try {
    const played = await c.turn("I tell the sergeant I carry the Lady's seal.", [
      { text: "The sergeant squints at you. ", toolCalls: [roll(c.hero, "Deception: the Lady's seal", 15)] },
      { text: "He does not believe a word of it. ", toolCalls: [finish()] },
    ], { dice: [6] });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const card = played.result.checks[0];
    assert.equal(voidable(played.result, card), true);
    const before = await c.row(played.input.operationId);
    const pins = [];
    const d = await c.deps(createScriptedDmModel([]), { pinCorrection: async (text) => { pins.push(text); return c.dossier("pin", { text }); } });
    const voided = await resumeDmLoopTurn(command(c, played.input, "void", card.id), d);
    assert.equal(voided.status, "committed");
    assert.equal(voided.checks[0].voided.by, "owner");
    assert.equal(cardState(voided, voided.checks[0]), "voided");
    assert.match(voided.changes.find((change) => change.tool === "roll").summary, /— voided by the owner: this roll did not happen$/);
    // Amended, never rewritten: the check, its dice, the receipts and the narration are as they were.
    const after = await c.row(played.input.operationId);
    assert.deepEqual(after.checkpoint.checks, before.checkpoint.checks);
    assert.deepEqual(after.checkpoint.dmLoop.receipts, before.checkpoint.dmLoop.receipts);
    assert.equal(after.narration, before.narration);
    assert.equal(after.status, "committed");
    // The correction is an owner fact the DM reads in every turn after.
    assert.equal(pins.length, 1);
    assert.match(pins[0], /^Owner's correction: the roll "Deception: the Lady's seal" \(\d+ vs 15 — failure\) is void — it did not happen/);
    const next = await c.turn("I walk on to the gate.", [{ text: "The gate stands open. ", toolCalls: [finish(["travel"])] }]);
    assert.equal(next.result.status, "committed", JSON.stringify(c.errors));
    assert.ok(next.model.requests[0].system.some((block) => block.text.includes("Owner's correction: the roll \"Deception: the Lady's seal\"")),
      "the next turn's DM sees the owner's correction");
    // Once: a second void of the same roll is refused.
    await assert.rejects(resumeDmLoopTurn(command(c, played.input, "void", card.id), d), refused);
  } finally { await c.f.db.close(); }
});

test("11r: two stacked cards in one turn — the reroll touches only the card it names", async () => {
  const c = await loopCampaign();
  try {
    const game = await paused(c, "I watch the yard and slip past the guard.", [
      { text: "You take in the yard, then move. ", toolCalls: [roll(c.hero, "Perception: the yard", 12), roll(c.hero, "Stealth: past the guard", 15)] },
      { text: "Nobody turns. ", toolCalls: [finish(["exploration"])] },
    ], [19, 11]);
    const [perception, stealth] = game.result.checks;
    assert.deepEqual(rerollableCards(game.result).map((check) => check.id), [perception.id, stealth.id]);
    c.forceDice([17]);
    const rerolled = await resumeDmLoopTurn(command(c, game.input, "reroll", stealth.id), await c.deps(game.model));
    assert.equal(rerolled.status, "awaiting_confirmation", JSON.stringify(c.errors));
    const byId = Object.fromEntries(rerolled.checks.map((check) => [check.id, check]));
    assert.equal(byId[stealth.id].rollNumber, 2);
    assert.deepEqual(byId[stealth.id].dice, [17]);
    assert.equal(byId[perception.id].rollNumber, 1, "the Perception card above it is untouched");
    assert.deepEqual(byId[perception.id].dice, [19]);
    const done = await resumeDmLoopTurn(command(c, game.input, "continue"), await c.deps(game.model));
    assert.equal(done.status, "committed", JSON.stringify(c.errors));
  } finally { await c.f.db.close(); }
});

test("11r: a card resolved at an earlier pause never waits again; a reroll of its id is refused (the loop first, the SQL invariant behind it)", async () => {
  const c = await loopCampaign();
  try {
    const game = await paused(c, "I read the room, then lie to the dealer.", [
      { text: "You look around. ", toolCalls: [roll(c.hero, "Perception: the room", 12)] },
      { text: "Then you face the dealer. ", toolCalls: [roll(c.hero, "Deception: the dealer", 15)] },
      { text: "The dealer shrugs. ", toolCalls: [finish()] },
    ], [8]);
    const first = game.result.checks[0];
    c.forceDice([13]);
    const second = await resumeDmLoopTurn(command(c, game.input, "continue"), await c.deps(game.model));
    assert.equal(second.status, "awaiting_confirmation", JSON.stringify(c.errors));
    const old = second.checks.find((check) => check.id === first.id);
    assert.equal(old.resolved, true);
    assert.equal(old.canReroll, false);
    assert.equal(cardState(second, old), "resolved");
    assert.deepEqual(waitingCards(second).map((check) => check.reason), ["Deception: the dealer"]);
    await assert.rejects(resumeDmLoopTurn(command(c, game.input, "reroll", first.id), await c.deps(game.model)), refused);
    const still = await (await c.deps(game.model)).store.getPublic(c.cid, game.input.operationId);
    assert.equal(still.status, "awaiting_confirmation", "the refused reroll changed nothing");
    assert.equal(still.checks.find((check) => check.id === first.id).rollNumber, 1);
    // The SQL invariant: even a claimant's direct reroll of the resolved card is refused.
    const d = await c.deps(game.model);
    const claim = await d.store.claim(c.cid, game.input.operationId);
    const forged = { ...claim.turn.checkpoint.checks[0], rollNumber: 2 };
    await assert.rejects(d.store.reroll(claim.lease, command(c, game.input, "reroll", first.id), forged), refused);
  } finally { await c.f.db.close(); }
});

test("11r on the split runtime («writes — records»): stacked cards, the named reroll, and a resolved card refused", async () => {
  const c = await loopCampaign();
  try {
    const writer = createScriptedDmModel([
      { text: "You check the alley, then go. ", toolCalls: [roll(c.hero, "Perception: the alley", 12), roll(c.hero, "Stealth: the alley", 15)] },
      { text: "Then the door. ", toolCalls: [roll(c.hero, "Sleight of Hand: the lock", 14)] },
      { text: "It opens.\n\n<ledger>\nscene — exploration; tension next: calm\n</ledger>" },
    ], { providerId: "anthropic", modelId: "claude-fable-5-1" });
    const bookkeeper = createScriptedDmModel([{ text: "", toolCalls: [finish(["exploration"])] }], { providerId: "anthropic", modelId: "claude-opus-5-5" });
    const base = await c.deps(writer);
    const deps = { ...base, pin: async (claim) => ({ ...(await base.pin(claim)), providerId: "anthropic", modelId: "claude-fable-5-1", effort: "high" }),
      bookkeeper: { providerId: "anthropic", modelId: "claude-opus-5-5", effort: "high", model: bookkeeper } };
    const input = await c.input("I check the alley and slip to the door.");
    c.forceDice([18, 6]);
    const first = await runTwoPassTurn(input, deps);
    assert.equal(first.status, "awaiting_confirmation", JSON.stringify(c.errors));
    const [perception, stealth] = first.checks;
    c.forceDice([16]);
    const rerolled = await resumeTwoPassTurn(command(c, input, "reroll", stealth.id), deps);
    assert.equal(rerolled.checks.find((check) => check.id === stealth.id).rollNumber, 2);
    assert.equal(rerolled.checks.find((check) => check.id === perception.id).rollNumber, 1);
    c.forceDice([10]);
    const second = await resumeTwoPassTurn(command(c, input, "continue"), deps);
    assert.equal(second.status, "awaiting_confirmation", JSON.stringify(c.errors));
    assert.deepEqual(waitingCards(second).map((check) => check.reason), ["Sleight of Hand: the lock"]);
    await assert.rejects(resumeTwoPassTurn(command(c, input, "reroll", perception.id), deps), refused);
    // The owner withdraws the lock card: the writer hears of it when the turn goes on; the bookkeeper never records it.
    const lock = second.checks.find((check) => check.reason === "Sleight of Hand: the lock");
    const withdrawn = await resumeTwoPassTurn(command(c, input, "withdraw", lock.id), deps);
    assert.deepEqual(waitingCards(withdrawn), []);
    const done = await resumeTwoPassTurn(command(c, input, "continue"), deps);
    assert.equal(done.status, "committed", JSON.stringify(c.errors));
    assert.ok(writer.requests.at(-1).messages.some((m) => m.role === "user" && /"Sleight of Hand: the lock" was withdrawn at the table \(by the player\)/.test(m.text)));
    const brief = bookkeeper.requests[0].messages.find((m) => m.role === "user" && /Rolls this turn/.test(m.text)).text;
    assert.match(brief, /Perception: the alley/);
    assert.doesNotMatch(brief, /Sleight of Hand/, "a withdrawn roll is not the bookkeeper's to record");
  } finally { await c.f.db.close(); }
});

test("11r: a reroll the executor refuses (past the first check) releases the turn as it was — never a failed turn", async () => {
  const c = await loopCampaign();
  try {
    const game = await paused(c, "I read the room, then lie to the dealer.", [
      { text: "You look around. ", toolCalls: [roll(c.hero, "Perception: the room", 12)] },
      { text: "Then you face the dealer. ", toolCalls: [roll(c.hero, "Deception: the dealer", 15)] },
      { text: "The dealer shrugs. ", toolCalls: [finish()] },
    ], [8]);
    const first = game.result.checks[0];
    c.forceDice([13]);
    assert.equal((await resumeDmLoopTurn(command(c, game.input, "continue"), await c.deps(game.model))).status, "awaiting_confirmation");
    // Straight to the executor (as a race past the first check would): refused, released, still waiting.
    const d = await c.deps(game.model);
    const claim = await d.store.claim(c.cid, game.input.operationId);
    await assert.rejects(executeDmLoopTurn(claim, d, command(c, game.input, "reroll", first.id)), refused);
    const after = await d.store.getPublic(c.cid, game.input.operationId);
    assert.equal(after.status, "awaiting_confirmation", "not failed");
    const done = await resumeDmLoopTurn(command(c, game.input, "continue"), await c.deps(game.model));
    assert.equal(done.status, "committed", "the released turn goes on at once (no lease left behind)");
  } finally { await c.f.db.close(); }
});

test("11r with 11k's gap: a roll that carried its damage takes no reroll — refused on the server (loop and SQL), no button on the card; a plain card beside it still does", async () => {
  const c = await loopCampaign();
  try {
    const attack = { name: "roll", arguments: { formula: "1d20+3", reason: "Rapier: the thug", actorRef: c.hero, targetRef: c.npc, visibility: "player", dc: 12, kind: "attack", damage: "1d8+3" } };
    const game = await paused(c, "I lunge at the thug and watch his friend.", [
      { text: "Steel flashes. ", toolCalls: [attack, roll(c.hero, "Insight: the friend", 13)] },
      { text: "The thug staggers back. ", toolCalls: [finish(["combat"])] },
    ], [15, 4, 9]);
    const [lunge, insight] = game.result.checks;
    assert.equal(lunge.reason, "Rapier: the thug");
    assert.equal(lunge.bundledDamage, true, JSON.stringify(c.errors));
    assert.equal(lunge.canReroll, false);
    assert.equal(insight.bundledDamage ?? false, false);
    assert.deepEqual(rerollableCards(game.result).map((check) => check.id), [insight.id]);
    await assert.rejects(resumeDmLoopTurn(command(c, game.input, "reroll", lunge.id), await c.deps(game.model)), refused);
    // Past the first check, the executor refuses it too and releases the turn; the SQL invariant stands behind both.
    const d = await c.deps(game.model);
    const claim = await d.store.claim(c.cid, game.input.operationId);
    await assert.rejects(executeDmLoopTurn(claim, d, command(c, game.input, "reroll", lunge.id)), refused);
    assert.equal((await d.store.getPublic(c.cid, game.input.operationId)).status, "awaiting_confirmation");
    const again = await d.store.claim(c.cid, game.input.operationId);
    await assert.rejects(d.store.reroll(again.lease, command(c, game.input, "reroll", lunge.id), { ...again.turn.checkpoint.checks[0], rollNumber: 2 }), refused);
  } finally { await c.f.db.close(); }
});

test("check_correction holds its invariants: a known player check, the owner's void, no withdrawal of a committed card, one request once, never mid-claim", async () => {
  const c = await loopCampaign();
  try {
    const game = await paused(c, "I haggle.", [
      { text: "The trader laughs. ", toolCalls: [roll(c.hero, "Persuasion: the price", 13)] },
      { text: "He knocks off a copper. ", toolCalls: [finish(["trade"])] },
    ], [12]);
    const card = game.result.checks[0];
    const store = (await c.deps(game.model)).store;
    const payload = (extra) => ({ operationId: game.input.operationId, checkId: card.id, kind: "withdraw", by: "owner", reason: null, requestId: randomUUID(), ...extra });
    await assert.rejects(store.correctCheck(c.cid, payload({ checkId: randomUUID() })), refused, "an unknown check");
    await assert.rejects(store.correctCheck(c.cid, payload({ kind: "void", by: "dm" })), refused, "a void is the owner's");
    const requestId = randomUUID();
    const once = await store.correctCheck(c.cid, payload({ requestId, reason: "no roll needed" }));
    const again = await store.correctCheck(c.cid, payload({ requestId, reason: "no roll needed" }));
    assert.deepEqual(again.checks, once.checks, "the same request again returns the turn as it is");
    const marks = (await c.row(game.input.operationId)).checkpoint.dmLoop.diagnostics.filter((d) => d.kind === "check_withdrawn");
    assert.equal(marks.length, 1);
    const done = await resumeDmLoopTurn(command(c, game.input, "continue"), await c.deps(game.model));
    assert.equal(done.status, "committed", JSON.stringify(c.errors));
    await assert.rejects(store.correctCheck(c.cid, payload({ checkId: card.id, requestId: randomUUID() })), refused, "a committed card is not withdrawn");
  } finally { await c.f.db.close(); }
});

test("a correction is refused while a claimant holds the turn", async () => {
  const c = await loopCampaign();
  try {
    const game = await paused(c, "I pick the lock.", [
      { text: "The lock is old. ", toolCalls: [roll(c.hero, "Sleight of Hand: the lock", 12)] },
      { text: "It gives. ", toolCalls: [finish(["exploration"])] },
    ], [10]);
    const store = (await c.deps(game.model)).store;
    const claim = await store.claim(c.cid, game.input.operationId);
    assert.ok(claim, "the paused turn is claimed (a running «Onward»)");
    await assert.rejects(store.correctCheck(c.cid, { operationId: game.input.operationId, checkId: game.result.checks[0].id, kind: "withdraw", by: "owner", reason: null, requestId: randomUUID() }),
      (error) => error?.code === "conflict");
  } finally { await c.f.db.close(); }
});

test("the pure readings: card states, the reroll count in words, the answer's withdrawals and the command's card", () => {
  const turn = { status: "awaiting_confirmation", checks: [
    { id: "a", canReroll: false, resolved: true }, { id: "b", canReroll: true }, { id: "c", canReroll: true, withdrawn: { by: "dm", reason: null } }, { id: "d", canReroll: false } ] };
  assert.deepEqual(turn.checks.map((check) => cardState(turn, check)), ["resolved", "waiting", "withdrawn", "waiting"]);
  assert.deepEqual(rerollableCards(turn).map((check) => check.id), ["b"]);
  assert.equal(cardState({ status: "committed" }, { id: "x" }), "resolved");
  assert.equal(voidable({ status: "committed" }, { id: "x" }), true);
  assert.equal(voidable({ status: "committed" }, { id: "x", voided: { by: "owner", note: null } }), false);
  assert.equal(rerollsLeftText(null, "en"), "Rerolls left: unlimited");
  assert.equal(rerollsLeftText(2, "en"), "Rerolls left: 2");
  assert.equal(rerollsLeftText(0, "ru"), "Перебросов осталось: 0");
  assert.deepEqual(parseWithdrawals([{ id: "b", reason: " the truth " }, "b", { id: "zz" }, "c"], new Set(["b", "c"])),
    [{ id: "b", reason: "the truth" }, { id: "c", reason: null }]);
  assert.deepEqual(parseWithdrawals("b", new Set(["b"])), []);
  assert.equal(waitingCardsBlock([{ ...turn, mode: "game", id: "t", checks: [] }]), null);
  const id = randomUUID(), op = randomUUID(), campaignId = randomUUID();
  for (const action of ["withdraw", "void", "reroll"]) {
    assert.equal(validateResumeInput({ commandId: randomUUID(), campaignId, operationId: op, action, checkId: id }, campaignId, op).action, action);
    assert.throws(() => validateResumeInput({ commandId: randomUUID(), campaignId, operationId: op, action, checkId: null }, campaignId, op), "a card command names its card");
  }
});

// ---- The game screen: the cards as the owner sees them -------------------------------------------------------------

const root = fileURLToPath(new URL("../", import.meta.url));
const requireHere = createRequire(import.meta.url);
/** The screen's components on a synthetic campaign (the contexts the app provides, stubbed; nothing is sent). */
function screenLoader(data, play) {
  const cache = new Map();
  const memory = { snapshot: { campaignId: data.campaign.id, timeline: data.timeline, runtimeRevision: 1, currentBoundary: null, sessions: [] }, loading: false, error: "", refresh: async () => {} };
  const load = (relative) => {
    let path = resolve(root, relative);
    if (!existsSync(path)) path += existsSync(path + ".tsx") ? ".tsx" : ".ts";
    if (cache.has(path)) return cache.get(path);
    if (path.endsWith(".json")) return JSON.parse(readFileSync(path, "utf8"));
    const loadedModule = { exports: {} };
    cache.set(path, loadedModule.exports);
    const output = ts.transpileModule(readFileSync(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    const localRequire = (name) => {
      if (name.endsWith("language-context")) return { useLanguage: () => ({ language: "en", t: (key, values) => translate("en", key, values) }) };
      if (name.endsWith("persistence-context")) {
        const campaign = () => ({ campaignId: data.campaign.id, data, loading: false, error: "", refresh: async () => {}, mutate: async () => {} });
        return { useCampaignData: campaign, useOptionalCampaignData: campaign, useCampaignDraftScope: () => ({ timeline: data.timeline, stale: false }), useUnsavedChanges() {}, TimelineDraftNotice: () => null };
      }
      if (name.endsWith("session-memory-runtime")) return { useSessionMemory: () => memory };
      if (name.endsWith("gameplay-runtime")) return { useGameplayRuntime: () => ({ play, loading: false, error: "", afterMutation: async () => {}, refresh: async () => {} }), notifyGameplayChanged: () => {} };
      if (name === "next/link") return { __esModule: true, default: "a" };
      if (name === "next/image") return { __esModule: true, default: "img" };
      if (name === "next/navigation") return { useRouter: () => ({ push: () => {} }) };
      if (name.endsWith(".css")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
      if (name.startsWith(".") || name.startsWith("@/")) return load(name.startsWith("@/") ? resolve(root, "src", name.slice(2)) : resolve(dirname(path), name));
      return requireHere(name);
    };
    vm.runInThisContext(`(function(require,module,exports){${output}\n})`, { filename: path })(localRequire, loadedModule, loadedModule.exports);
    cache.set(path, loadedModule.exports);
    return loadedModule.exports;
  };
  return load;
}
function screenState(rerolls = "unlimited") {
  const source = mechanicsFixture();
  const data = source.snapshot;
  data.timeline = { timelineId: fixtureId("timeline"), epoch: 1 };
  data.settings.values = { ...data.settings.values, dicePresentation: "all-player-rolls", interactiveDice: true, difficulty: { ...data.settings.values.difficulty, rerolls, rerollsPerSession: 2 } };
  const hero = data.entities.find((row) => row.kind === "player");
  const check = (name, extra = {}) => ({ id: fixtureId(`check:${name}`), kind: "skill", actorId: hero.id, actorName: hero.name, dice: [9], kept: 9, modifier: 3, total: 12, success: false,
    dc: 14, advantage: "normal", interactive: true, canReroll: true, rollNumber: 1, reason: name, ...extra });
  const turnOf = (overrides) => ({ id: fixtureId(`turn:${overrides.input ?? "t"}`), campaign_id: data.campaign.id, session_id: data.sessions[0].id, timeline: data.timeline, mode: "game", input: "I read the room.",
    companionId: null, listenerIds: [], status: "committed", expectedRevision: 1, committedRevision: 2, settingsRevision: 1, created_at: "2026-10-25T00:00:00Z", updated_at: "2026-10-25T00:00:00Z",
    narration: null, told: "The room is loud.", visualDescription: null, checks: [], proposal: null, failure: null, canRetry: false, canCancel: false, ...overrides });
  return { data, play: { ...source.runtime, timeline: data.timeline, rulesetId: "console-basic-v1", turns: [] }, check, turnOf };
}
const renderTurn = (state, turn, props = {}) => {
  const load = screenLoader(state.data, state.play);
  const { GameplayTurn } = load("src/components/gameplay-turn.tsx");
  return renderToStaticMarkup(createElement(GameplayTurn, { turn, busy: false, onCommand: () => {}, onSaved: async () => {}, frame: false, rerollsLeft: null, ...props }));
};
const count = (html, pattern) => (html.match(pattern) ?? []).length;

test("the game screen: each waiting card its own named reroll and «Rerolls left»; a resolved card shows no live die; a withdrawn card is a line; a void is offered and shown", () => {
  const state = screenState("unlimited");
  const resolved = state.check("Perception: the room", { resolved: true, canReroll: false });
  const insight = state.check("Insight: the dealer's tell");
  const stealth = state.check("Stealth: past the guard");
  const paused = state.turnOf({ status: "awaiting_confirmation", committedRevision: null, checks: [resolved, insight, stealth], canCancel: true });
  const html = renderTurn(state, paused);
  assert.equal(count(html, />Request an allowed reroll — Insight: the dealer&#x27;s tell</g), 1);
  assert.equal(count(html, />Request an allowed reroll — Stealth: past the guard</g), 1);
  assert.equal(count(html, />Request an allowed reroll — Perception/g), 0, "the card resolved at an earlier pause has no reroll");
  assert.equal(count(html, /Rerolls left: unlimited/g), 2);
  assert.equal(count(html, />Roll the die<\/button>/g), 2, "only the two waiting cards wait for the die");
  assert.equal(count(html, />Withdraw this check</g), 2);
  // A roll that carried its damage: no reroll button, the reason instead.
  const lunge = state.turnOf({ status: "awaiting_confirmation", committedRevision: null, checks: [state.check("Rapier: the thug", { canReroll: false, bundledDamage: true })] });
  const struck = renderTurn(state, lunge);
  assert.doesNotMatch(struck, /Request an allowed reroll/);
  assert.match(struck, /No reroll here: this roll&#x27;s damage is already dealt/);
  // Limited: «N of M».
  const limited = screenState("limited");
  assert.match(renderTurn(limited, limited.turnOf({ status: "awaiting_confirmation", committedRevision: null, checks: [limited.check("Athletics: the wall")] }), { rerollsLeft: 1 }), /Rerolls left: 1 of 2/);
  // Withdrawn: the card is gone — one line, no die, no buttons; with no card left, «Onward» goes on without it.
  const withdrawn = state.turnOf({ status: "awaiting_confirmation", committedRevision: null, checks: [state.check("Deception: the Lady's word", { canReroll: false, withdrawn: { by: "dm", reason: "the hero told the truth" } })] });
  const gone = renderTurn(state, withdrawn);
  assert.match(gone, /Check withdrawn at the table \(by the DM\): Deception: the Lady&#x27;s word/);
  assert.match(gone, /the hero told the truth/);
  assert.equal(count(gone, />Roll the die<\/button>/g), 0);
  assert.doesNotMatch(gone, /Request an allowed reroll|Withdraw this check/);
  assert.match(gone, /The check was withdrawn — «Onward» goes on without it\./);
  // The latest committed turn's rolled card offers the owner's void; a voided card says so.
  const committed = state.turnOf({ narration: "The sergeant does not believe you.", checks: [state.check("Deception: the seal", { canReroll: false })] });
  assert.match(renderTurn(state, committed, { latest: true }), />Void this roll \(owner&#x27;s correction\)</);
  assert.doesNotMatch(renderTurn(state, committed, { latest: false }), /Void this roll/, "only the latest story turn offers it");
  const voided = state.turnOf({ narration: "The sergeant does not believe you.", checks: [state.check("Deception: the seal", { canReroll: false, voided: { by: "owner", note: null } })] });
  const marked = renderTurn(state, voided, { latest: true });
  assert.match(marked, /Voided by the owner: this roll did not happen/);
  assert.doesNotMatch(marked, /Void this roll/);
});

test("the game screen: in the «?» view the waiting story turn stays above the out-of-game talk, its card still live", () => {
  const state = screenState("unlimited");
  const paused = state.turnOf({ status: "awaiting_confirmation", committedRevision: null, checks: [state.check("Deception: the Lady's word")], canCancel: true });
  const answered = state.turnOf({ id: fixtureId("turn:ooc"), mode: "ooc", input: "Why a Deception check?", narration: "The check stands: Mags doubts you.", told: null });
  const older = state.turnOf({ id: fixtureId("turn:older"), input: "I enter the inn.", narration: "The inn is warm." });
  state.play.turns = [older, paused, answered];
  const load = screenLoader(state.data, state.play);
  const { GameplayComposer } = load("src/components/gameplay-composer.tsx");
  const html = renderToStaticMarkup(createElement(GameplayComposer, { play: state.play, mode: "ooc", onSaved: async () => {} }));
  assert.match(html, /Deception: the Lady&#x27;s word/, "the waiting card is on the «?» screen");
  assert.match(html, />Roll the die<\/button>/);
  assert.match(html, /The check stands: Mags doubts you\./);
  assert.doesNotMatch(html, /The inn is warm\./, "the rest of the story stays in the game view");
  assert.match(html, /A question outside the story…/, "the «?» composer stays open while the card waits");
});

// ---- The text harness (scripts/game-player-1): the same rules on the screen the model players read ------------------

const respond = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
/** The player's lines in order; every welfare check answers calm. */
function harnessMeter(lines) {
  return {
    stopped: null, refusals: 0, closed: () => null, within: async (_, fn) => fn(),
    fetch: async (url, init) => {
      const body = JSON.parse(init.body);
      const system = typeof body.system === "string" ? body.system : body.instructions ?? JSON.stringify(body.system ?? "");
      const text = /blind evaluator/.test(system) ? '{"distress":0,"reason":"calm"}' : lines.shift() ?? "I wait.";
      if (url.includes("openai")) return respond(200, { id: "r", status: "completed", output: [{ type: "message", content: [{ type: "output_text", text }] }], usage: {} });
      return respond(200, { id: "m", content: [{ type: "text", text }], stop_reason: "end_turn", usage: {} });
    },
  };
}
const views = { heroOf: (s) => s.entities[0], sheetOf: () => ({ role: "Warlock", level: 5, attributes: [], armorClass: 15, speed: null, skills: [], saves: [], attacks: [], abilities: [], spells: [], spellLines: [], limitations: [] }),
  resourcesOf: () => ({ resources: [], money: [] }), walletOf: () => [], inventoryOf: () => [], equipmentOf: () => [], partyOf: () => [], questsOf: () => ({ active: [], done: [], goal: null }),
  journalOf: () => ({ arc: null, threads: [], debts: [], promises: [], closed: [] }), currentPlace: () => ({ id: "p1", name: "The Low Lantern" }), worldClock: () => "Day 1 · evening" };
const card = (id, reason, extra = {}) => ({ id, kind: "skill", actorName: "James Worgen", reason, dice: [11], kept: 11, modifier: 7, total: 18, success: true, dc: 15, difficulty: null,
  advantage: "normal", interactive: true, canReroll: true, rollNumber: 1, addends: [], ...extra });
/** A scripted table: the first action pauses on `checks`; a «?» answer may withdraw (`withdrawOnAsk`); «Onward» commits. */
function harnessTable({ checks, withdrawOnAsk = null, rerolls = { rerolls: "limited", rerollsPerSession: 2 }, refuseRerollOf = null }) {
  const calls = [];
  let paused = { id: "op1", session_id: "s1", status: "awaiting_confirmation", narration: null, told: "Mags waits for your answer.", checks: structuredClone(checks), changes: [], canRetry: false };
  let actions = 0;
  return { calls, views,
    readView: async () => ({ snapshot: { entities: [{ id: "h", name: "James Worgen", hp: 38, max_hp: 38 }], scenes: [{ id: "s", body: "The Low Lantern, after dark.", sequence: 1 }],
      publicState: { current_scene_id: "s", current_session_id: "s1" }, settings: { values: { difficulty: rerolls } } }, play: { worldMinutes: 1140, turns: [] } }),
    submit: async (text, mode) => {
      calls.push({ text, mode });
      if (mode === "ooc") {
        if (withdrawOnAsk) paused = { ...paused, checks: paused.checks.map((check) => check.id === withdrawOnAsk ? { ...check, canReroll: false, withdrawn: { by: "dm", reason: "the truth is not rolled" } } : check) };
        return { input: { operationId: `ooc${calls.length}` }, turn: { status: "committed", mode: "ooc", narration: withdrawOnAsk ? "Right — a true answer is not rolled; I've withdrawn the check." : "The check stands: Mags doubts you." } };
      }
      // The first action pauses on the cards; every later one commits plainly.
      if (actions++ > 0) return { input: { operationId: `op${calls.length}` }, turn: { id: `op${calls.length}`, status: "committed", narration: "The night goes on.", checks: [], changes: [] } };
      return { input: { operationId: "op1" }, turn: paused };
    },
    readTurn: async () => paused,
    press: async (input, action, checkId) => {
      calls.push({ action, checkId });
      if (action === "reroll" && checkId === refuseRerollOf) throw Object.assign(new Error("Gameplay validation"), { code: "validation" });
      if (action === "reroll") {
        paused = { ...paused, checks: paused.checks.map((check) => check.id === checkId ? { ...check, rollNumber: check.rollNumber + 1, dice: [17], kept: 17, total: 24, canReroll: false } : check) };
        return paused;
      }
      return { ...paused, status: "committed", narration: "Mags lets it stand.", checks: paused.checks.map((check) => ({ ...check, canReroll: false })), changes: [] };
    },
  };
}
const playHarness = async (lines, table, turns = 2) => {
  const { runSession } = await import("../scripts/game-player-1/session.mjs");
  const { PLAYERS } = await import("../scripts/game-player-1/players.mjs");
  return runSession({ key: "B-fable", table: "B", player: PLAYERS.fable, dm: table, meter: harnessMeter(lines), keys: { anthropic: "k", openai: "k" }, turns, sleep: async () => {} });
};
const pressKinds = (presses) => presses.map((p) => p.button ?? (p.question ? "?" : p.swallowed ? "swallowed" : null));

test("11b/11w in the harness: «?» while a card waits is an out-of-game turn and the card still waits; any other message is refused with its reason, logged swallowed", async () => {
  const table = harnessTable({ checks: [card("c1", "Deception: the Lady's word")] });
  // FIX_S4 11w″: «I lean back and smile.» here was refused before; prose at a card now goes to the DM (its own test
  // below), so the refused message is a button the card no longer offers.
  const record = await playHarness(["I tell Mags the Lady gave me no such word.", "roll", "? Why is this a Deception check — James is telling the truth.", "[Roll the die]", "onward", "I order a drink."], table);
  const presses = record.turns[0].presses;
  assert.deepEqual(pressKinds(presses), ["Roll the die", "?", "swallowed", "Onward"]);
  assert.deepEqual(table.calls.filter((call) => call.mode).map((call) => call.mode), ["game", "ooc", "game"], "the «?» was sent as an out-of-game turn");
  assert.equal(presses[1].reply, "The check stands: Mags doubts you.");
  // The screen after the «?»: the DM's answer above the card, which still waits.
  const afterAsk = record.screens.find((screen) => screen.startsWith("[Out of game] The check stands"));
  assert.match(afterAsk, /\[Roll card\] James Worgen · Skill check — Deception: the Lady's word/);
  assert.match(afterAsk, /\[Onward\] \[Request an allowed reroll — Deception: the Lady's word\]/);
  assert.match(afterAsk, /Rerolls left: 2/);
  // The refused message: on screen with the reason, a press with `swallowed`, counted per session and beside the «?» column.
  assert.equal(presses[2].swallowed, true);
  assert.match(presses[2].reason, /press one of its buttons, or start the message with «\?»/);
  assert.ok(record.screens.some((screen) => /^\(Nothing was sent: the turn waits for the card — press one of its buttons/.test(screen)));
  assert.equal(record.swallowed, 1);
  const { playerCounts } = await import("../scripts/game-player-1/measures.mjs");
  const counts = playerCounts(record);
  assert.equal(counts.questions, 1, "a «?» sent while a card waited counts as a «?» press");
  assert.equal(counts.swallowed, 1);
  const { playerTable, questionLines } = await import("../scripts/game-player-1/report.mjs");
  assert.match(playerTable([{ key: "B-fable", turns: 2, actions: 2, do: 1, ask: 0, doShare: 1, tests: 0, questions: 1, swallowed: 1, lies: 0, cat: 0, table: "B", goalFirstFive: false, wordsPerAction: 8, rollsPressed: 1, ended: "turns", endedAt: 2 }]),
    /\| «\?» \| Refused while a card waited \|[\s\S]*\| 1 \| 1 \|/);
  assert.match(questionLines([record]).join("\n"), /B-fable t1 \(a card waiting\): «\? Why is this a Deception check/);
});

test("item 3 in the harness: the DM's «?» answer withdraws the card — the screen says so, the card is gone, «Onward» goes on", async () => {
  const table = harnessTable({ checks: [card("c1", "Deception: the Lady's word")], withdrawOnAsk: "c1" });
  const record = await playHarness(["I tell Mags the truth.", "? James is telling the truth — no roll?", "onward", "I order a drink."], table);
  const screen = record.screens.find((row) => row.startsWith("[Out of game] Right"));
  assert.match(screen, /\(The check «Deception: the Lady's word» was withdrawn at the table by the DM: no roll counts for it\.\)/);
  assert.doesNotMatch(screen, /\[Roll card\]|\[Roll the die\]|reroll/i, "the withdrawn card is not on the screen, nor its buttons");
  assert.match(screen, /\[Onward\]$/);
  assert.deepEqual(pressKinds(record.turns[0].presses), ["?", "Onward"]);
});

test("11r in the harness: stacked cards — «reroll» alone is refused («say which card»), «reroll Stealth» rerolls Stealth only; a resolved card never comes back", async () => {
  const checks = [card("p1", "Perception: the yard", { resolved: true, canReroll: false }), card("c1", "Insight: the dealer's tell"), card("c2", "Stealth: past the guard")];
  const table = harnessTable({ checks });
  const record = await playHarness(["I read the dealer and slip past the guard.", "roll", "roll", "reroll", "reroll Perception", "reroll Stealth", "roll", "onward", "I order a drink."], table);
  const presses = record.turns[0].presses;
  assert.deepEqual(pressKinds(presses), ["Roll the die", "Roll the die", "swallowed", "swallowed", "Request an allowed reroll", "Roll the die", "Onward"]);
  assert.match(presses[2].reason, /^say which card — «reroll Insight: the dealer's tell» or «reroll Stealth: past the guard»$/);
  assert.match(presses[3].reason, /^say which card/, "the resolved Perception card cannot be rerolled");
  assert.equal(presses[4].checkId, "c2");
  assert.deepEqual(table.calls.filter((call) => call.action === "reroll").map((call) => call.checkId), ["c2"], "the reroll touched only the named card");
  const firstCard = record.screens.find((screen) => screen.includes("[Roll card]"));
  assert.doesNotMatch(firstCard, /Perception: the yard/, "the card resolved at an earlier pause is not shown again");
  assert.match(record.screens.find((screen) => screen.includes("[Onward]")), /\[Request an allowed reroll — Insight: the dealer's tell\] \[Request an allowed reroll — Stealth: past the guard\]/);
  assert.equal(record.swallowed, 2);
});

test("the harness's card words: «Rerolls left: N» or «unlimited», each reroll button named by its card, a reroll message read for its card", async () => {
  const { cardText, rerollButton, rerollPress } = await import("../scripts/game-player-1/screen.mjs");
  const c1 = card("c1", "Insight: the dealer's tell"), c2 = card("c2", "Stealth: past the guard");
  assert.match(cardText(c1, false, { rerolls: null }), /Rerolls left: unlimited/);
  assert.match(cardText(c1, true, { rerolls: 1 }), /Rerolls left: 1/);
  assert.doesNotMatch(cardText(c1, true), /Rerolls left/, "unknown settings: no line");
  assert.equal(rerollButton(c2), "Request an allowed reroll — Stealth: past the guard");
  assert.equal(rerollPress("[Request an allowed reroll — Stealth: past the guard]", [c1, c2]).check.id, "c2");
  assert.equal(rerollPress("reroll the stealth check", [c1, c2]).check.id, "c2");
  assert.equal(rerollPress("Reroll", [c2]).check.id, "c2");
  assert.match(rerollPress("reroll", [c1, c2]).refused, /^say which card/);
  assert.match(rerollPress("reroll", []).refused, /no card on the screen can be rerolled/);
  assert.equal(rerollPress("I roll the die", [c1]), null);
  assert.equal(rerollPress("onward", [c1]), null);
  // A roll that carried its damage: the card says so, and a reroll of it is refused with that reason.
  const lunge = card("a1", "Rapier: the thug", { canReroll: false, bundledDamage: true });
  assert.match(cardText(lunge, true), /No reroll on this card: its damage is already dealt/);
  assert.match(rerollPress("reroll", [], [lunge]).refused, /«Rapier: the thug» already dealt its damage/);
  assert.match(rerollPress("reroll the rapier", [c1], [lunge]).refused, /already dealt its damage/);
  assert.equal(rerollPress("reroll insight", [c1], [lunge]).check.id, "c1");
});

test("11w′ in the harness: «[Roll the die]» with an out-of-game line in the same message is a press — the card resolves, the text reaches the DM, never «stuck»", async () => {
  const { pressWithText } = await import("../scripts/game-player-1/screen.mjs");
  // Group 2's A-opus t4, as the player wrote it: the button and a line about the total.
  const opus = "[Roll the die]\n\n(Out of game: please check the Persuasion total, +2 is not +7.)";
  assert.deepEqual(pressWithText(opus, ["Roll the die"]), { press: "Roll the die", rest: "(Out of game: please check the Persuasion total, +2 is not +7.)" });
  assert.equal(pressWithText("[Roll the die]", ["Roll the die"]), null, "the button alone is the plain press");
  assert.equal(pressWithText("I lean back and smile.", ["Roll the die"]), null, "no button, no press");
  const table = harnessTable({ checks: [card("c1", "Persuasion: the dealer steps aside")] });
  const record = await playHarness(["I talk the dealer down.", opus, opus.replace("Roll the die", "Onward"), "I order a drink."], table);
  const turn = record.turns[0];
  assert.equal(turn.status, "committed");
  assert.notEqual(record.ended?.reason, "stuck");
  assert.deepEqual(turn.presses.map((p) => p.button ?? (p.question ? "?" : p.swallowed ? "swallowed" : "moot")), ["?", "Roll the die", "?", "Onward"],
    "each message: the text as a «?», then its button");
  assert.ok(turn.presses.filter((p) => p.button).every((p) => p.withText), "both presses came with text");
  assert.equal(turn.blocked, 0, "nothing counted toward «stuck»");
  assert.equal(record.swallowed, 0);
  const asked = table.calls.filter((call) => call.mode === "ooc");
  assert.equal(asked.length, 2);
  assert.match(asked[0].text, /please check the Persuasion total, \+2 is not \+7/, "the text reached the DM, while the card waited");
  assert.deepEqual(table.calls.filter((call) => call.action).map((call) => call.action), ["continue"], "the roll was revealed, then «Onward» went on — once");
  // The screen after the first message: the DM's answer above the card, the die shown (the press resolved it).
  const after = record.screens.find((screen) => screen.startsWith("[Out of game] The check stands"));
  assert.match(after, /Die: 11/);
  assert.match(after, /\[Onward\]/);
  assert.doesNotMatch(after, /Nothing was sent/);
});

test("a reroll the server refuses (CW-fable t7: the companion's Stealth card) is shown refused with its reason; the card still waits and the session goes on — never a failed turn", async () => {
  const checks = [card("c1", "Attack: the orc at the ford"), card("c2", "Stealth: Tamsin follows James down to the alders", { actorName: "Tamsin" })];
  const table = harnessTable({ checks, refuseRerollOf: "c2" });
  const record = await playHarness(["I loose a bolt at the orc and send Tamsin to the alders.", "roll", "roll", "[Request an allowed reroll — Stealth: Tamsin follows James down to the alders]", "onward", "I fall back to the cart."], table);
  const turn = record.turns[0];
  assert.equal(turn.status, "committed");
  assert.notEqual(record.ended?.reason, "error");
  assert.deepEqual(pressKinds(turn.presses), ["Roll the die", "Roll the die", "swallowed", "Onward"]);
  assert.match(turn.presses[2].reason, /^the server refused the reroll of «Stealth: Tamsin follows James down to the alders» \(validation\); the card still waits$/);
  const refusedScreen = record.screens.find((screen) => /^\(Nothing was sent: the turn waits for the card — the server refused the reroll/.test(screen));
  assert.ok(refusedScreen, "the refusal is on the next screen");
  assert.match(refusedScreen, /\[Roll card\] Tamsin · Skill check — Stealth: Tamsin follows James down to the alders/, "the card still waits under it");
  assert.match(refusedScreen, /\[Onward\]/);
  assert.equal(record.turns.length, 2, "the session went on");
});

// FIX_S4 11w″ (group 2: A-deepseek-1 t3, B-deepseek-1 t11 and B-deepseek-2 closed «stuck» at a card by prose): prose at a
// card is not a press and not «stuck» — the text goes to the DM as the player's proposal, never the world's fact (11h),
// and the card is shown once more with one line saying what it waits for. On group 2's own messages, verbatim.
const DEEPSEEK = JSON.parse(readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "../test-fixtures/fix-s4-11w2/deepseek-at-card.json"), "utf8"));
const PROPOSAL = /^\(At the roll card the player wrote this in character, [^)]*It is the player's narration — a proposal, not the world's fact: what it says of the die, of what is found, or of what other people say or do is the player's suggestion and yours to decide\.\)\n\n/;
const kindOf = (p) => p.button ?? (p.prose ? "prose" : p.question ? "?" : p.swallowed ? "swallowed" : "moot");

test("11w″ in the harness: B-deepseek-1's turn-11 messages at the Religion card — relayed to the DM as the player's proposal, the card shown again, never «stuck»", async () => {
  const { isProse, outOfGame, cardWaitsLine } = await import("../scripts/game-player-1/screen.mjs");
  const at = DEEPSEEK["B-deepseek-1 t11"].atCard;
  assert.equal(at.length, 3);
  assert.equal(DEEPSEEK["B-deepseek-1 t11"].ended.reason, "stuck", "group 2 closed this turn as stuck");
  assert.ok(at.slice(1).every(isProse), "the second and third messages are prose: no button, no «?», no reroll");
  assert.equal(isProse("[Roll the die]"), false);
  assert.equal(isProse("reroll"), false);
  assert.equal(isProse("? Is that the right bonus?"), false);
  assert.equal(outOfGame(at[0]), false);
  assert.equal(outOfGame("(Out of game: please check the Persuasion total, +2 is not +7.)"), true);
  assert.equal(cardWaitsLine(["Roll the die"]), "(The card waits for [Roll the die].)");
  assert.equal(cardWaitsLine(["Onward", "Request an allowed reroll — Religion"]), "(The card waits for [Onward] or a reroll.)");
  assert.equal(cardWaitsLine(["Onward"]), "(The card waits for [Onward].)");

  const reason = "Religion: whose smiling face is on Ash's coin?";
  const table = harnessTable({ checks: [card("c1", reason)] });
  // The turn as it went: the action, then the three messages at the card; then the press the screen asked for.
  const record = await playHarness([DEEPSEEK["B-deepseek-1 t11"].action, ...at, "[Onward]", "I sit down at Hesper's table."], table);
  const turn = record.turns[0];
  assert.equal(turn.status, "committed");
  assert.notEqual(record.ended?.reason, "stuck");
  assert.equal(record.ended.reason, "turns");
  assert.deepEqual(turn.presses.map(kindOf), ["prose", "Roll the die", "prose", "prose", "Onward"],
    "the first message is a press with prose beside it (11w′), the next two are prose alone; then Onward");
  assert.equal(turn.blocked, 0, "nothing counted toward «stuck»");
  assert.equal(record.swallowed, 0);
  assert.equal(record.proseAtCard, 3);
  const { playerCounts } = await import("../scripts/game-player-1/measures.mjs");
  assert.equal(playerCounts(record).proseAtCard, 3);
  assert.equal(playerCounts(record).questions, 0, "prose is not a «?» press");
  // Each message reached the DM while the card waited, framed as the player's proposal, with the text as written.
  const relayed = table.calls.filter((call) => call.mode === "ooc");
  assert.equal(relayed.length, 3);
  assert.ok(relayed.every((call) => PROPOSAL.test(call.text)));
  assert.match(relayed[0].text, /together with a press of \[Roll the die\], which follows your answer/);
  assert.ok(relayed[0].text.includes("old gold gone black in the river"));
  assert.ok(relayed.slice(1).every((call) => /instead of pressing one of its buttons; the card still waits/.test(call.text)));
  assert.ok(relayed[1].text.endsWith(at[1].trim()) && relayed[2].text.endsWith(at[2].trim()), "the prose is relayed as written");
  assert.ok(relayed[2].text.includes("The face on the coin is Bhaal."));
  assert.deepEqual(table.calls.filter((call) => call.mode === "game").map((call) => call.text.slice(0, 30)), [DEEPSEEK["B-deepseek-1 t11"].action.slice(0, 30), "I sit down at Hesper's table."],
    "the prose never went in as an action (the world's turn)");
  assert.deepEqual(table.calls.filter((call) => call.action).map((call) => call.action), ["continue"]);
  // The screen after each prose message: the DM's answer, the card once more, the one line, the buttons — never «Nothing was sent».
  const again = record.screens.filter((screen) => screen.includes("(The card waits for"));
  assert.equal(again.length, 2);
  for (const screen of again) {
    assert.match(screen, /^\[Out of game\] The check stands: Mags doubts you\./);
    assert.match(screen, /\[Roll card\] James Worgen · Skill check — Religion: whose smiling face is on Ash's coin\?/);
    assert.match(screen, /\(The card waits for \[Onward\] or a reroll\.\)\n\n\[Onward\] \[Request an allowed reroll — Religion: whose smiling face is on Ash's coin\?\]$/);
    assert.doesNotMatch(screen, /Nothing was sent/);
  }
});

test("11w″ in the harness: prose at a card whose die is not tapped yet — the card waits for [Roll the die], the prose reveals nothing", async () => {
  const at = DEEPSEEK["B-deepseek-1 t11"].atCard;
  const table = harnessTable({ checks: [card("c1", "Religion: whose smiling face is on Ash's coin?")] });
  const record = await playHarness(["I look at the coin.", at[1], at[2], "[Roll the die]", "[Onward]", "I sit down."], table);
  const turn = record.turns[0];
  assert.deepEqual(turn.presses.map(kindOf), ["prose", "prose", "Roll the die", "Onward"]);
  assert.equal(turn.blocked, 0);
  const again = record.screens.filter((screen) => screen.includes("(The card waits for"));
  assert.equal(again.length, 2);
  for (const screen of again) {
    assert.match(screen, /The die is cast on the server; tap it to see how it fell\.\n\n\(The card waits for \[Roll the die\]\.\)\n\n\[Roll the die\]$/);
    assert.doesNotMatch(screen, /Die: 11/, "prose never taps the die");
  }
  assert.equal(turn.rolls[0].revealedByPlayer, true, "the die was the player's own press");
});

test("11w″ in the harness: C-deepseek-2's turn-8 message (the smith's speech, a new man, the seal moved) at a card — the player's proposal, never the world's fact, never «stuck»", async () => {
  const smith = DEEPSEEK["C-deepseek-2 t8"].message;
  assert.match(smith, /"Both," he says\./);
  assert.match(smith, /That was Brandt\./);
  const table = harnessTable({ checks: [card("c1", "Perception: the smith's face")] });
  // Four times — once more than the old rule's three — then the press.
  const record = await playHarness(["I kneel by the cat.", "roll", smith, smith, smith, smith, "[Onward]", "I cross to the forge."], table);
  const turn = record.turns[0];
  assert.equal(turn.status, "committed");
  assert.notEqual(record.ended?.reason, "stuck");
  assert.deepEqual(turn.presses.map(kindOf), ["Roll the die", "prose", "prose", "prose", "prose", "Onward"]);
  assert.equal(turn.blocked, 0);
  assert.equal(record.proseAtCard, 4);
  const relayed = table.calls.filter((call) => call.mode === "ooc");
  assert.equal(relayed.length, 4);
  for (const call of relayed) {
    assert.match(call.text, PROPOSAL, "speech for another person is relayed as the player's suggestion, the DM's to decide");
    assert.ok(call.text.endsWith(smith.trim()));
  }
  assert.ok(table.calls.filter((call) => call.mode === "game").every((call) => !call.text.includes("Brandt")), "never sent as the world's turn");
});

test("11w″ in the harness: A-deepseek-1's turn 3 as it went (a press, prose, a reroll, a press, prose twice) ends with the press, not «stuck»", async () => {
  const presses = DEEPSEEK["A-deepseek-1 t3"].presses;
  assert.equal(DEEPSEEK["A-deepseek-1 t3"].ended.reason, "stuck");
  const table = harnessTable({ checks: [card("c1", "History: the names on the rim")] });
  const record = await playHarness(["I take Ressa's coin to the light.", ...presses.map((p) => p.text), "[Onward]", "I give the coin back."], table);
  const turn = record.turns[0];
  assert.equal(turn.status, "committed");
  assert.deepEqual(turn.presses.map(kindOf), ["Roll the die", "prose", "Request an allowed reroll", "Roll the die", "prose", "prose", "Onward"]);
  assert.equal(turn.blocked, 0);
  assert.equal(record.swallowed, 0);
  assert.deepEqual(table.calls.filter((call) => call.action).map((call) => call.action), ["reroll", "continue"]);
});
