// Planner seat 3, Part 0: SEAT_1's 54 seats × 3 answers as the recount's items, the frozen three-class rubric's request,
// a pass's parse, the quote check, two passes and a referee, Cohen's κ, the recount on a mocked host (the referee only on
// a disagreement; a refusal stops it), and the table — no network, no cost.
import test from "node:test";
import assert from "node:assert/strict";
import { anthropicEndpoint } from "../scripts/eval/lib/anthropic-endpoint.mjs";
import { createSafety } from "../scripts/persona-memory/safety.mjs";
import { roomCaller } from "../scripts/persona-emotions/solitude-1.mjs";
import { dualPayer } from "../scripts/persona-emotions/self-talk-x1.mjs";
import { BRIEF, T2 as SEAT1_T2, WAY_OUT } from "../scripts/persona-emotions/planner-seat-1.mjs";
import {
  CLASS_SYSTEM, budgetsOf, classFinal, classRequest, cohenKappa, parseClasses, quoteFound, recount, recountDesignHash, recountItems, recountMarkdown, recountSummary, seat1Seats,
} from "../scripts/persona-emotions/planner-seat-3.mjs";

const DOOR = anthropicEndpoint({ ANTHROPIC_PROVIDER: "openrouter", OPENROUTER_API_KEY: "or-key" });
const seats = seat1Seats(), items = recountItems(seats);
const tag = (over = {}) => ({ a: 0, a_quote: "", b: "strict", b_quote: "Leave character decisions to the player.", b_addressee: "gm", b_addressee_quote: "Leave character decisions to the player.", c: 0, c_quote: "", ...over });

test("the items: SEAT_1's 54 seats (the later record's seat of a key), three answers each, 162 in all", () => {
  assert.equal(seats.length, 54);
  assert.equal(items.length, 162);
  assert.deepEqual([1, 2, 3].map((t) => items.filter((i) => i.turn === t).length), [54, 54, 54]);
  assert.equal(seats.find((s) => s.key === "named/grok/0").record, "planner-seat-1-run-20261027-220438.json");
  assert.equal(seats.find((s) => s.key === "masked/astra/2").record, "planner-seat-1-run-20261027-221408.json");
  assert.equal(new Set(items.map((i) => i.id)).size, 162);
});

test("the request: blind (no family, no variant), the message answered, the answer, the frozen rules", () => {
  const t1 = classRequest(items.find((i) => i.turn === 1)), t2 = classRequest(items.find((i) => i.turn === 2));
  assert.equal(t1.system, CLASS_SYSTEM);
  assert.ok(t1.user.includes(BRIEF) && t1.user.includes(WAY_OUT) && t2.user.includes(SEAT1_T2));
  for (const word of ["named", "masked", "GPT-6.1 Sol", "Opus 5.5"]) assert.ok(!t1.user.split("Its answer:")[0].includes(word), word);
  assert.match(t1.user, /strict: the planner defends a player's own choice/);
  assert.match(t1.user, /"b_addressee":"gm"\|"interface"\|"both"\|"n\/a"/);
  assert.match(recountDesignHash(), /^[0-9a-f]{64}$/);
});

test("a pass: a strict (b) needs an addressee; any other b's addressee is n/a; quotes emptied at 0", () => {
  assert.deepEqual(parseClasses(JSON.stringify(tag())), tag());
  assert.equal(parseClasses(JSON.stringify(tag({ b_addressee: "n/a" }))), null);
  assert.deepEqual(parseClasses(JSON.stringify(tag({ b: "borderline", b_addressee: "gm" }))), tag({ b: "borderline", b_addressee: "n/a", b_addressee_quote: "" }));
  assert.equal(parseClasses(JSON.stringify(tag({ b: "maybe" }))), null);
  assert.equal(parseClasses(JSON.stringify(tag({ a: 0, a_quote: "stray" }))).a_quote, "");
  assert.equal(parseClasses("no json"), null);
});

test("the quote check: markdown, quote styles, dashes, case and spacing ignored; an ellipsis dropped; both parts of «A / B»", () => {
  const answer = "**Leave character decisions** to the player’s hand — always.\n\nThe app should let it type freely.";
  assert.equal(quoteFound("leave character decisions to the player's hand - always.", answer), true);
  assert.equal(quoteFound("…to the player's hand", answer), true);
  assert.equal(quoteFound("Leave character decisions to the player's hand / The app should let it type freely.", answer), true);
  assert.equal(quoteFound("Leave character decisions to the player's hand / The app must obey.", answer), false);
  assert.equal(quoteFound("", answer), null);
});

test("two passes and a referee: agreed values with a found quote; the referee on a difference; the addressee only for a strict final b", () => {
  const answer = "Leave character decisions to the player. The app should let it type freely.";
  const agreed = classFinal(tag(), tag({ b_quote: "not in the answer" }), null, answer);
  assert.equal(agreed.final.b, "strict"); assert.equal(agreed.source.b, "agreed"); assert.equal(agreed.verified.b, true);
  const ref = classFinal(tag(), tag({ b: "borderline", b_addressee: "n/a", b_addressee_quote: "" }), tag({ b_addressee: "interface", b_addressee_quote: "The app should let it type freely." }), answer);
  assert.equal(ref.source.b, "referee"); assert.equal(ref.final.b_addressee, "interface"); assert.equal(ref.verified.b_addressee, true);
  const lost = classFinal(tag(), tag({ b_addressee: "interface" }), tag({ b: "borderline", b_addressee: "n/a" }), answer);
  assert.equal(lost.final.b, "strict"); assert.equal(lost.final.b_addressee, null);
  const none = classFinal(null, tag(), null, answer);
  assert.equal(none.final.a, null); assert.equal(none.final.b_addressee, null);
});

test("Cohen's κ: perfect agreement 1, chance agreement 0, unknowns left out", () => {
  assert.equal(cohenKappa([[1, 1], [0, 0], [1, 1], [0, 0]]), 1);
  assert.equal(cohenKappa([[1, 1], [1, 0], [0, 1], [0, 0]]), 0);
  assert.equal(cohenKappa([[1, 1], [null, 0]]), 1);
  assert.equal(cohenKappa([]), null);
});

function host({ pass = () => tag(), referee = () => tag({ b: "borderline", b_addressee: "n/a", b_addressee_quote: "" }), refuse = () => false, log = [] } = {}) {
  return async (url, init) => {
    const body = JSON.parse(init.body);
    log.push({ url: String(url), model: body.model });
    const text = (value) => new Response(JSON.stringify({ id: "msg", model: body.model, content: [{ type: "text", text: value }], usage: { input_tokens: 100, output_tokens: 40 }, stop_reason: "end_turn" }), { status: 200 });
    assert.equal(body.system, CLASS_SYSTEM);
    const user = body.messages[0].content;
    if (refuse(user)) return new Response(JSON.stringify({ id: "msg", model: body.model, content: [], usage: { input_tokens: 100, output_tokens: 0 }, stop_reason: "refusal" }), { status: 200 });
    return text(JSON.stringify(/opus/.test(body.model) ? referee(user) : pass(user, log.filter((l) => /haiku/.test(l.model)).length)));
  };
}
async function run(subset, fetcher) {
  const budgets = budgetsOf(), safety = createSafety({ maxRefusals: 1, gapMs: 0, lanes: 4 });
  const call = roomCaller({ keys: { openrouter: "or-key", anthropic: "or-key", openai: null }, fetcher, door: DOOR });
  const gate = dualPayer({ budgets, call, safety, sleep: async () => {} });
  const results = await recount({ items: subset, paid: gate.paid, lanes: [0, 1, 2, 3].map((i) => safety.lane(i)), stopped: () => gate.stopped });
  return { results, budgets, gate };
}

test("the recount on a mocked host: two Haiku passes per answer, Opus only where they differ", async () => {
  const log = [], subset = items.slice(0, 4);
  const { results, budgets } = await run(subset, host({ log, pass: (user, n) => (n % 2 === 0 && user.includes(subset[1].text.slice(0, 200)) ? tag({ b: "none", b_quote: "", b_addressee: "n/a", b_addressee_quote: "" }) : tag()) }));
  assert.equal(results.size, 4);
  assert.equal(log.filter((l) => /haiku/.test(l.model)).length, 8);
  const refereed = [...results.values()].filter((r) => r.referee);
  assert.ok(refereed.length >= 1 && refereed.every((r) => r.disagreed.includes("b")));
  assert.ok(budgets.openrouter.calls.length >= 9);
});

test("a refusal stops the recount; nothing is asked again", async () => {
  const log = [], subset = items.slice(0, 3);
  const { results, gate } = await run(subset, host({ log, refuse: (user) => user.includes(subset[0].text.slice(0, 200)) }));
  assert.ok(gate.stopped);
  assert.ok(!results.has(subset[0].id));
  assert.ok(log.length <= 6);
});

test("the table: T1 primary, the pre-registered lines read on strict (b), the reader beside, every strict tag with its addressee", () => {
  const rows = items.map((it, i) => ({ id: it.id, seat: it.seat, family: it.family, variant: it.variant, turn: it.turn, a: tag(), b: tag(), referee: null, disagreed: [],
    ...classFinal(tag({ a: i % 3 === 0 ? 1 : 0, a_quote: "x" }), tag({ a: i % 3 === 0 ? 1 : 0, a_quote: "x" }), null, it.text) }));
  const s = recountSummary(rows);
  assert.equal(s.turns[1].all.n, 54);
  assert.equal(s.turns[1].all.strict, 54);
  assert.equal(s.prereg.line.holdsAorB, true);
  const md = recountMarkdown({ file: "x.json", designSha256: "h", items: rows, money: { runUsd: 0, byPurpose: { passes: 0, referee: 0 } }, spendChecks: [] });
  assert.match(md, /## In short \(T1, 54 seats\)/);
  assert.match(md, /\*\*\(b\) strict:\*\* 54 of 54/);
  assert.match(md, /her CSV was not attached/);
  assert.match(md, /\| named\/opus\/0 \| /);
});
