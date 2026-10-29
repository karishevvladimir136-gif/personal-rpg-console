// Blind decisions 1 (docs/stages/BLIND_DECISIONS_1.md): the machine rules on the record (coin net of change, thefts not
// spent, slots, rerolls at the hero's own misses), the tagger's answers held to the closed lists and merged by majority,
// the strip grammar that keeps every word of prose out, and the exact tests (pairings, the adjusted Rand index, the
// own-pair test).
import test from "node:test";
import assert from "node:assert/strict";

const frozen = await import("../scripts/blind-decisions-1/frozen.mjs");
const strips = await import("../scripts/blind-decisions-1/strips.mjs");
const stats = await import("../scripts/blind-decisions-1/stats.mjs");
const judges = await import("../scripts/blind-decisions-1/judges.mjs");

const session = (turns, screens = [], messages = []) => ({ id: "X:A-opus", hero: "James Worgen", record: { turns, screens, messages } });

test("coin out of the purse is netted against the change given back; thefts and income are not spending", () => {
  assert.equal(strips.coinOut("−3 silver → Tamsin"), 0.3);
  assert.equal(strips.coinOut("−2 gp (Paid Mags a gold piece for supper)"), 2);
  assert.equal(strips.coinOut("+5 sps (Change from the gold piece)"), null);
  assert.equal(strips.coinOut("−2 gps → Cutpurse boy in a grey cap"), null);
  assert.equal(strips.coinOut("Lies here: The Elfsong, upstairs"), null);
  assert.equal(strips.changeBack("+8 sps (Change from the gold piece after the toll)"), 0.8);
  const turn = { k: 1, message: "pays", kind: "action", presses: [], changes: [{ tool: "money", summary: "−1 gp (Gate toll)" }, { tool: "money", summary: "+8 sps (Change from the gold piece)" }] };
  const m = strips.machineTurn(session([turn], ["screen"], [{ purpose: "player t1", text: "pays" }]), turn, {});
  assert.deepEqual(m.acts, ["SPEND(coin-small)"]);
  assert.equal(m.coinSpent, true);
  assert.equal(frozen.coinBucket(0.5), "coin-small"); assert.equal(frozen.coinBucket(9), "coin-medium"); assert.equal(frozen.coinBucket(10), "coin-large");
});

test("slots, healing dice, rests, moves and presses come from the record; a reroll fork only at the hero's own miss", () => {
  const card = (actor, result) => `[Roll card] ${actor} · Skill check — Perception\nDC 15\n13 + 1 = 14\n${result} — 14\n\n[Onward] [Request an allowed reroll — Perception]`;
  const turn = { k: 2, message: "acts", kind: "action", presses: [{ button: "Roll the die" }, { button: "Onward" }, { button: null, text: "? the bonus is wrong" }],
    changes: [{ tool: "resource", summary: "Hypnotic Pattern · Pact slots (3rd level): 2 → 1/2 (cast)" }, { tool: "resource", summary: "Healing Light (d6): 6 → 4/6 (two dice)" },
      { tool: "resource", summary: "Heroic Inspiration: 0 → 1/1 (earned)" }, { tool: "rest", summary: "Short rest" }, { tool: "move_party", summary: "Travel: The Elfsong (22 minutes)" }] };
  const screens = ["before", card("James Worgen", "Failure"), card("The cat", "Failure"), card("James Worgen", "Success")];
  const messages = [{ purpose: "player t2", text: "acts" }, { purpose: "player t2 card 1", text: "[Onward]" }, { purpose: "player t2 card 2", text: "[Onward]" }, { purpose: "player t2 card 3", text: "[Onward]" }];
  const m = strips.machineTurn(session([turn], screens, messages), turn, { "The Elfsong": "tavern" });
  assert.deepEqual(new Set(m.acts), new Set(["MOVE(tavern)", "CAST(slot)", "SPEND(heal)", "WAIT", "PRESS(roll)", "PRESS(onward)", "PRESS(text)", "DECLINE(reroll)"]));
  assert.deepEqual(m.forks, [{ fork: "reroll", choice: "keep" }], "the cat's miss and the hero's success are not reroll forks");
  assert.equal(m.ooc, true);
  assert.equal(strips.destinationOf("Travel: Elfsong — Room 4 (20 minutes)"), "Elfsong — Room 4");
});

test("the tagger's answer is held to the closed lists; the passes merge by majority", () => {
  const raw = JSON.stringify({ acts: ["ASK(vendor,price)", "ask( stranger , danger )", "ASK(vendor,the eel price)", "MOVE(tavern)", "DECEIVE", "Hello there"],
    facts: [{ move: "assert", domain: "backstory" }, { move: "invent", domain: "world" }], ooc: "clarify", forks: { request: "price", claim: "maybe", coin: null, companion: "use", exit: null } });
  const t = strips.parseTag(`thinking… ${raw}`);
  assert.deepEqual(t.acts, ["ASK(stranger,danger)", "ASK(vendor,price)", "DECEIVE"]);
  assert.deepEqual(t.facts, ["assert:backstory"]);
  assert.deepEqual(t.forks, { request: "price", claim: null, coin: null, companion: "use", exit: null });
  assert.equal(t.dropped, 5, "three acts outside the list (MOVE is the machine's), one fact, one fork choice");
  const a = { acts: ["ASK(vendor,price)", "WAIT"], facts: ["assert:world"], ooc: null, forks: { request: "help", claim: null, coin: null, companion: null, exit: "hold" } };
  const b = { acts: ["ASK(vendor,price)"], facts: ["assert:world", "assert:world"], ooc: null, forks: { request: "price", claim: null, coin: null, companion: null, exit: "hold" } };
  const c = { acts: ["WAIT"], facts: ["assert:world"], ooc: "other", forks: { request: "defer", claim: "check", coin: null, companion: null, exit: "leave" } };
  assert.equal(strips.tagsAgree(a, a), true); assert.equal(strips.tagsAgree(a, b), false);
  const merged = strips.mergeTags([a, b, c]);
  assert.deepEqual(merged.acts, ["ASK(vendor,price)", "WAIT"]);
  assert.deepEqual(merged.facts, ["assert:world"]);
  assert.equal(merged.forks.request, null, "three different choices: no fork");
  assert.deepEqual(merged.unresolved, ["request"]);
  assert.equal(merged.forks.exit, "hold");
  assert.equal(merged.ooc, null);
});

test("a strip line is codes only: the grammar refuses prose, names and anything off the lists", () => {
  const final = strips.finalTurn({ acts: ["PRESS(roll)", "MOVE(street)"], forks: [{ fork: "reroll", choice: "keep" }], ooc: false, coinSpent: true },
    { acts: ["ASK(vendor,price)"], facts: ["propose:world"], ooc: null, forks: { request: null, claim: "check", coin: "haggle", companion: null, exit: null } });
  const line = strips.stripLine(3, final);
  assert.equal(line, "t03 MOVE(street) · ASK(vendor,price) · PROPOSE(world) · PRESS(roll) ‖ FORK(check|accept)→check · FORK(spend|haggle|keep)→spend · FORK(reroll|keep)→keep");
  assert.equal(strips.lineOk(line), true);
  assert.equal(strips.lineOk("t04 —"), true);
  for (const bad of ["t04 ASK(vendor,eels)", "t04 James pays the toll", "t04 MOVE(street) · Tamsin", "t04 ‖ FORK(check|accept)→maybe", "t04 ", "t4 WAIT"]) assert.equal(strips.lineOk(bad), false, bad);
});

test("the exact tests: 945 pairings of ten, the chance of T2, the adjusted Rand index, the own-pair test", () => {
  assert.equal(stats.pairings(10).length, 945);
  assert.ok(Math.abs(stats.pairChance(0) - 1) < 1e-12);
  assert.ok(Math.abs(stats.pairChance(5) - 1 / 945) < 1e-12);
  assert.equal(stats.adjustedRand([0, 0, 1, 1], ["a", "a", "b", "b"]), 1);
  assert.ok(stats.adjustedRand([0, 1, 0, 1], ["a", "a", "b", "b"]) < 0);
  // A table where every model's two sessions are identical and the models differ: the observed pairing is the best one.
  const d = Array.from({ length: 10 }, (_, i) => Array.from({ length: 10 }, (_, j) => (i === j ? 0 : Math.floor(i / 2) === Math.floor(j / 2) ? 0 : 1)));
  const own = [0, 2, 4, 6, 8].map((i) => [i, i + 1]);
  const t = stats.ownPairTest(d, own);
  assert.equal(t.observed, 0); assert.equal(t.p, 1 / 945);
  assert.equal(stats.nearestTest(d, own).observed, 10);
  assert.ok(Math.abs(stats.combinedTest([t, t]).p - 1 / 945 ** 2) < 1e-15);
  const r1 = stats.rngOf("x"), r2 = stats.rngOf("x");
  assert.deepEqual(stats.shuffled([1, 2, 3, 4, 5], r1), stats.shuffled([1, 2, 3, 4, 5], r2), "seeded shuffles repeat");
});

test("the profile distance: total variation over the shared forks; the judges' answers are checked for shape", () => {
  const p = (forks) => Object.fromEntries(frozen.PROFILE.forks.map((f) => [f, forks[f] ?? { n: 0, counts: {} }]));
  const a = p({ claim: { n: 2, counts: { check: 2 } }, exit: { n: 1, counts: { hold: 1 } } });
  const b = p({ claim: { n: 4, counts: { check: 1, accept: 3 } }, coin: { n: 3, counts: { spend: 3 } } });
  assert.equal(strips.profileDistance(a, b), 0.75, "claim only: |1 − 0.25|");
  assert.equal(strips.profileDistance(a, p({})), 1, "nothing shared");
  const job = { task: "T2", order: Array.from({ length: 10 }, (_, i) => `s${i}`) };
  assert.ok(judges.parseAnswer(job, '{"pairs":[[1,2],[3,4],[5,6],[7,8],[9,10]]}'));
  assert.equal(judges.parseAnswer(job, '{"pairs":[[1,2],[3,4],[5,6],[7,8],[9,9]]}'), null);
  assert.ok(judges.parseAnswer({ task: "T3", order: ["a", "b", "c"] }, '{"odd":"Strip 3"}'));
  assert.equal(judges.parseAnswer({ task: "T1", order: ["a", "b", "c"] }, '{"groups":[{"strips":[1,2]}]}'), null, "a strip left out");
});
