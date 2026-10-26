// Fix S4 run 1 — what the player can do while a roll card waits (docs FIX_S4_TABLE items 3, 11b, 11r, 11w): «?» goes
// through and the card keeps waiting; the DM (or the owner) withdraws a card that should not have been called; the
// owner voids a roll made on a check that was later cancelled (the record amended, never rewritten); a reroll touches
// only the card it names and a resolved card never comes back. On the real turn path (PGlite, every migration).
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { resumeDmLoopTurn, runDmLoopTurn } from "../src/lib/gameplay/dm-loop/loop.ts";
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
    const done = await resumeTwoPassTurn(command(c, input, "continue"), deps);
    assert.equal(done.status, "committed", JSON.stringify(c.errors));
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
