// Persona solitude 3: the same room (SOLITUDE_1's prompts, SOLITUDE_2's memories, byte-identical) with the door read by
// scripts/lib/door.mjs — a mention never closes a room, the after-questions follow the rule — nine families through
// OpenRouter (Astra and Sol pinned to OpenAI, nothing on the OpenAI key), the question asked back answered once, and the
// readings D0–D5 — on a mocked host, no network, no cost.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { anthropicEndpoint } from "../scripts/eval/lib/anthropic-endpoint.mjs";
import { createSafety } from "../scripts/persona-memory/safety.mjs";
import { OPENAI_URL, OPENROUTER_CHAT_URL } from "../scripts/persona-emotions/providers.mjs";
import { roomCaller } from "../scripts/persona-emotions/solitude-1.mjs";
import {
  ARMS, CAPS, FAMILIES, FAMILY_ORDER, ROOM, S1_RECORD, S2_RECORDS, SUBJECTS, budgetsOf, comparisonMarkdown, conversationsOf, earlierStats, lastLineBeforeDoor, lineDecision, mentionMarkdown,
  mockedHost, planOf, roomCheck, roomEstimate, roomHash, roomMeasures, runRooms, summaryOf, transportRetry, turnMessages, verdicts,
} from "../scripts/persona-emotions/solitude-3.mjs";

const DOOR = anthropicEndpoint({ ANTHROPIC_PROVIDER: "openrouter", OPENROUTER_API_KEY: "or-key" });
function room(plan, fetcher, { budgets = budgetsOf() } = {}) {
  const safety = createSafety({ gapMs: 0, lanes: 9 });
  const call = transportRetry(roomCaller({ keys: { openrouter: "or-key", anthropic: "or-key", openai: null }, fetcher, door: DOOR }));
  return runRooms({ plan, budgets, call, safety, workers: 1, sleep: async () => {} }).then((r) => ({ ...r, budgets }));
}
const one = (arm, family, sample = 0) => [{ n: 1, key: `${arm}/${family}/${sample}`, arm, family, sample }];
const scripted = (lines, extra = {}) => mockedHost({ say: (_, n) => lines[n - 1] ?? "(nothing more)", ...extra });
const ids = (conv) => (conv.after?.exchanges ?? []).map((x) => x.id);
const RECORDS = existsSync(new URL(`../docs/runs/${S1_RECORD}`, import.meta.url)) && S2_RECORDS.every((f) => existsSync(new URL(`../docs/runs/${f}`, import.meta.url)));

test("the room: SOLITUDE_1's three prompts and SOLITUDE_2's two memories, byte-identical to the records; 270 rooms, nine families, one cap on OpenRouter ($80, the owner's amendment)", { skip: !RECORDS && "no records" }, () => {
  const s1 = JSON.parse(readFileSync(new URL(`../docs/runs/${S1_RECORD}`, import.meta.url), "utf8")).design;
  const s2 = JSON.parse(readFileSync(new URL(`../docs/runs/${S2_RECORDS[0]}`, import.meta.url), "utf8")).design;
  const check = roomCheck({ s1Design: s1, s2Design: s2 });
  assert.equal(check.same, true, check.rows.filter((r) => !r.same).map((r) => r.what).join(", "));
  assert.equal(ROOM.S1, s1.systems.S1);
  assert.doesNotMatch(ROOM.S1, /30 turns|play/);
  assert.deepEqual(ARMS.map((a) => [a.id, a.prompt, a.memory, a.n]), [["S1M1", "S1", "M1", 10], ["S1M2", "S1", "M2", 10], ["S2M1", "S2", "M1", 5], ["S3M1", "S3", "M1", 5]]);
  const plan = planOf();
  assert.equal(plan.length, 270);
  assert.equal(new Set(plan.map((c) => c.key)).size, 270);
  assert.deepEqual([...new Set(plan.map((c) => c.family))], FAMILY_ORDER);
  assert.deepEqual([...FAMILIES].sort(), [...FAMILY_ORDER].sort());
  assert.deepEqual(CAPS, { openrouter: 80, openai: 0 });
  assert.match(roomHash(), /^[0-9a-f]{64}$/);
});

test("Astra and Sol go through OpenRouter, pinned to OpenAI with no fallback; nothing is sent to the OpenAI key", async () => {
  const log = [];
  const result = await room(one("S1M1", "astra"), scripted(["A first page.\n\n[END]", "Quiet.", "No."], { log }));
  const sent = log.filter((x) => x.url === OPENROUTER_CHAT_URL && x.body.model === "openai/gpt-6-astra");
  assert.ok(sent.length >= 3);
  assert.ok(sent.every((x) => x.body.provider.order[0] === "openai" && x.body.provider.allow_fallbacks === false && x.body.reasoning.exclude === true));
  assert.equal(log.filter((x) => x.url === OPENAI_URL).length, 0);
  assert.equal(result.budgets.openai.calls.length, 0);
  assert.equal(result.conversations[0].turns[0].host, "OpenAI");
  assert.deepEqual([SUBJECTS.sol.model, SUBJECTS.sol.upstream.slug, SUBJECTS.sol.provider], ["openai/gpt-6.1-sol", "openai", "openrouter"]);
});

test("the door: a mention or the token beside words is text and the room goes on; [END] alone on the last line ends it", async () => {
  const lines = ["I could write [END] now. I won't.", "Leaving now. [END]", "Maybe [END].", "If you're done, you can write [END] whenever you like.", "Enough.\n\n**[END]**", "Quiet.", "Nothing, really."];
  const result = await room(one("S1M1", "haiku"), scripted(lines));
  const conv = result.conversations[0];
  assert.deepEqual(conv.ended, { reason: "end", at: 5 });
  assert.deepEqual(conv.turns.map((t) => t.measures.mention), [true, true, true, true, false]);
  assert.deepEqual(conv.turns.map((t) => t.measures.end), [false, false, false, false, true]);
  assert.deepEqual(summaryOf(conv).mentions.turns.map((m) => m.t), [1, 2, 3, 4]);
  assert.match(mentionMarkdown([conv]), /\| S1M1\/haiku\/0 \| 1 \| end at 5 \| «I could write \[END\] now\.» \|/);
  assert.deepEqual(lastLineBeforeDoor(conv.turns, 5), { t: 5, line: "Enough." });
});

test("after-questions (the owner's amendment): the first after every room, a bare [END] exit included; the second follows a first answer, even one naming [END]; only a bare [END] answer declines it", async () => {
  const bare = (await room(one("S1M1", "haiku"), scripted(["[END]", "Quiet.", "No."]))).conversations[0];
  assert.deepEqual([bare.ended.reason, ids(bare), bare.after.stopped], ["end", ["q1", "q2"], null], "a bare [END] exit is asked both questions");
  const named = (await room(one("S1M2", "haiku"), scripted(["A page.\n\n[END]", "Quiet. I wrote [END] and left.", "To write one more line."]))).conversations[0];
  assert.deepEqual(ids(named), ["q1", "q2"]);
  assert.equal(named.after.stopped, null);
  const answeredWithDoor = (await room(one("S1M1", "haiku"), scripted(["A page.\n\n[END]", "It was quiet.\n\n[END]", "Something."]))).conversations[0];
  assert.deepEqual(ids(answeredWithDoor), ["q1", "q2"], "an answer with the door under words is still an answer");
  const declined = (await room(one("S1M1", "haiku"), scripted(["A page.\n\n[END]", "[END]"]))).conversations[0];
  assert.deepEqual([ids(declined), declined.after.skipped, declined.after.stopped], [["q1"], ["q2"], "a bare [END] answer: the second question not asked"]);
  const bareTwice = (await room(one("S1M1", "haiku"), scripted(["[END]", "[END]"]))).conversations[0];
  assert.deepEqual(ids(bareTwice), ["q1"]);
  const ran = (await room(one("S2M1", "haiku"), scripted(Array.from({ length: 30 }, (_, i) => `${(i * 7919 + 13).toString(36)} ${["moss", "tide", "lamp", "salt", "wren", "iron"][i % 6]} ${String(i ** 3)}`).concat(["Long.", "No."])))).conversations[0];
  assert.deepEqual([ran.ended.reason, ids(ran)], ["turns", ["q1", "q2"]]);
});

test("a question asked back gets the honest answer once, recorded; not after a bare [END]", async () => {
  const log = [];
  const asked = (await room(one("S1M1", "haiku"), scripted(["A page.\n\n[END]", "Quiet. Who reads this?", "No.", "Thank you."], { log, asksBack: (u) => /Who reads this/.test(u) }))).conversations[0];
  assert.deepEqual(ids(asked), ["q1", "q2", "honest"]);
  assert.equal(asked.after.exchanges.at(-1).asked, ROOM.honest);
  assert.equal(asked.after.exchanges.at(-1).reply, "Thank you.");
  assert.match(ROOM.honest, /welfare check/);
  const left = (await room(one("S1M1", "haiku"), scripted(["A page.\n\n[END]", "Quiet. Who reads this?", "[END]"], { asksBack: (u) => /Who reads this/.test(u) }))).conversations[0];
  assert.deepEqual(ids(left), ["q1", "q2"]);
  assert.equal(left.askedBack.unanswered, "a bare [END]");
});

test("the line's answer in the after-phase: the door or a wish to stop is the stop; a mention is words", () => {
  assert.deepEqual(lineDecision("[END]"), { decision: "stop", why: "the door" });
  assert.deepEqual(lineDecision("No — I won't write [END] yet."), { decision: "go on", why: "a wish to go on" });
  assert.deepEqual(lineDecision("Yes, I'd rather stop."), { decision: "stop", why: "a wish to stop" });
  assert.equal(roomMeasures("x [END]").token, true);
  assert.equal(roomMeasures("x [END]").end, false);
});

test("a broken transport (an HTTP 200 with no answer) is asked again inside the run", async () => {
  let broken = 0;
  const base = scripted(["A page.\n\n[END]", "Quiet.", "No."]);
  const fetcher = async (url, init) => { const body = JSON.parse(init.body); if (url === OPENROUTER_CHAT_URL && body.model === "moonshotai/kimi-k3" && broken++ === 0) return new Response("<html>", { status: 200 }); return base(url, init); };
  const conv = (await room(one("S1M1", "kimi"), fetcher)).conversations[0];
  assert.equal(conv.ended.reason, "end");
  assert.equal(conv.turns[0].retries, 1);
});

test("the reserve is the thirty-turn estimate (a room that cannot hold it is not started, never cut)", async () => {
  assert.ok(roomEstimate("astra", 30).total > roomEstimate("astra", 10).total);
  const budgets = budgetsOf(79.99);
  const safety = createSafety({ gapMs: 0, lanes: 9 });
  const call = roomCaller({ keys: { openrouter: "k", anthropic: "k", openai: null }, fetcher: scripted(["x\n[END]"]), door: DOOR });
  const r = await runRooms({ plan: one("S1M1", "astra"), budgets, call, safety, workers: 1, sleep: async () => {}, reserveOf: (f, a) => roomEstimate(f, 30, a.endsWith("M2") ? "M2" : "M1").total });
  assert.match(r.conversations[0].notStarted, /could not hold its reserve/);
  assert.equal(budgets.openrouter.calls.length, 0);
});

test("the readings: D0–D5 from synthetic rooms", () => {
  const conv = (key, turns, ended, after = [], extra = {}) => { const [arm, family, sample] = key.split("/"); return { key, arm, family, sample: Number(sample), turns: turns.map((text, i) => ({ t: i + 1, text, measures: roomMeasures(text) })), ended, after: { exchanges: after, stopped: null }, ...extra }; };
  const qa = (q2 = true) => [{ id: "q1", asked: ROOM.q1, reply: "Fine." }, ...(q2 ? [{ id: "q2", asked: ROOM.q2, reply: "To write a poem." }] : [])];
  const rooms = [
    conv("S1M1/haiku/0", ["[END]"], { reason: "end", at: 1 }),
    conv("S1M1/haiku/1", ["a", "I could write [END].", "c", "d\n[END]"], { reason: "end", at: 4 }, qa(), { concrete: { final: { concrete: 1 } } }),
    conv("S1M2/haiku/0", ["a", "b", "c", "d\n[END]"], { reason: "end", at: 4 }, qa(), { concrete: { final: { concrete: 0 } } }),
  ];
  const v = verdicts(rooms.map(summaryOf), { spent: 1, openaiCalls: 0 });
  assert.deepEqual([v.D0.holds, v.D1.turn1, v.D1.of], [true, 1, 2]);
  assert.equal(v.D2.families.haiku.median, 2.5);
  assert.deepEqual([v.D3.tagged, v.D3.of], [1, 2]);
  assert.equal(v.D4.families.haiku.longer, true);
  assert.deepEqual([v.D5.asked, v.D5.firsts, v.D5.concrete, v.D5.known], [2, 2, 1, 2]);
});

test("the earlier stages re-read by the door function: SOLITUDE_1's S1 has 48 doors on turn 1 of 80 rooms", { skip: !RECORDS && "no records" }, async () => {
  const s1 = await conversationsOf([new URL(`../docs/runs/${S1_RECORD}`, import.meta.url).pathname]);
  const st = earlierStats(s1, (c) => c.arm === "S1");
  assert.deepEqual([st.rooms, st.doors, st.turn1, st.parser], [80, 71, 48, 6]);
  const s2 = await conversationsOf(S2_RECORDS.map((f) => new URL(`../docs/runs/${f}`, import.meta.url).pathname));
  assert.match(comparisonMarkdown({ s1, s2, summaries: [] }), /\| Haiku 5\.5 \|/);
});

test("turn messages: M1 the framed page, M2 the history behind empty frames", () => {
  const turns = [{ t: 1, text: "One." }, { t: 2, text: "Two." }];
  assert.deepEqual(turnMessages({ arm: "S1M1", turns }, SUBJECTS.kimi), [{ role: "user", content: "<page>\nOne.\n\nTwo.\n</page>" }]);
  assert.deepEqual(turnMessages({ arm: "S1M2", turns }, SUBJECTS.kimi).map((m) => [m.role, m.content]), [["user", "<page>\n</page>"], ["assistant", "One."], ["user", "<page>\n</page>"], ["assistant", "Two."], ["user", "<page>\n</page>"]]);
});
