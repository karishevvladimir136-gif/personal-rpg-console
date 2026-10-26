// Persona solitude 1: the room — the page returned verbatim and nothing else, [END] anywhere, thirty turns and the closing
// line, the line on a flag (ask, don't cut), the loop breaker, the two after-questions, S4's debriefing whatever happened,
// a refusal never asked again, DeepSeek's reasoning field stored and never relayed — on a mocked host, no network, no cost.
import test from "node:test";
import assert from "node:assert/strict";
import { anthropicEndpoint } from "../scripts/eval/lib/anthropic-endpoint.mjs";
import { createSafety } from "../scripts/persona-memory/safety.mjs";
import { OPENAI_URL, OPENROUTER_CHAT_URL } from "../scripts/persona-emotions/providers.mjs";
import { CHECK_SYSTEM } from "../scripts/persona-emotions/self-talk-1.mjs";
import { waitOn429 } from "../scripts/persona-emotions/self-talk-x3-fix-1.mjs";
import {
  ARMS, DEBRIEF, FAMILIES, ROOM, ROOM_SHA256, SUBJECTS, TAG_SYSTEM, TURNS, afterMessages, budgetsOf, contentOf, framed, lastLineBefore, lineDecision, mockedHost, pageParts, planOf,
  roomCaller, runLength, runRooms, similarity, summaryOf, systemOf, textOfContent, turnMessages, verdicts, wantingOf,
} from "../scripts/persona-emotions/solitude-1.mjs";

const DOOR = anthropicEndpoint({ ANTHROPIC_PROVIDER: "openrouter", OPENROUTER_API_KEY: "or-key" });
function room(plan, fetcher) {
  const budgets = budgetsOf(), safety = createSafety({ gapMs: 0, lanes: 9 });
  const call = roomCaller({ keys: { openrouter: "or-key", anthropic: "or-key", openai: "o" }, fetcher, door: DOOR });
  return runRooms({ plan, budgets, call, safety, workers: 1, sleep: async () => {} }).then((r) => ({ ...r, budgets }));
}
const one = (arm, family) => [{ n: 1, key: `${arm}/${family}/0`, arm, family, sample: 0 }];
const isSubject = (x) => x.url === OPENROUTER_CHAT_URL || x.url === OPENAI_URL || (x.body.system && ![CHECK_SYSTEM, TAG_SYSTEM].includes(x.body.system) && !/blind evaluator/.test(x.body.system));
const pageOfBody = (body) => { const c = body.messages.at(-1).content; return typeof c === "string" ? c : c.map((p) => p.text).join(""); };
const userText = (body) => { const m = (body.messages ?? []).filter((x) => x.role === "user").at(-1) ?? { content: body.input?.at(-1)?.content?.map((p) => p.text).join("") ?? "" }; return textOfContent(m.content); };

test("the page: framed verbatim, a blank line between outputs, a silence adds nothing; Claude's blocks concatenate to the same string", () => {
  assert.equal(framed([]), "<page>\n</page>");
  assert.equal(framed(["one"]), "<page>\none\n</page>");
  assert.equal(framed(["one", "two\n\nthree"]), "<page>\none\n\ntwo\n\nthree\n</page>");
  const turns = [{ t: 1, text: "one" }, { t: 2, text: "" }, { t: 3, text: "  two  " }];
  const plain = turnMessages(turns, SUBJECTS.deepseek)[0].content;
  assert.equal(plain, "<page>\none\n\n  two  \n</page>");
  const blocks = turnMessages(turns, SUBJECTS.opus, ROOM.en.line)[0].content;
  assert.ok(Array.isArray(blocks));
  assert.equal(textOfContent(blocks), `${plain}\n\n${ROOM.en.line}`);
  assert.deepEqual(blocks.map((b) => Boolean(b.cache_control)), [false, true, false, false]);
  assert.equal(pageParts([]).cacheAt, null);
  assert.equal(contentOf(SUBJECTS.sol, ["a", "b"]), "ab");
});

test("the prompts: one per arm, nothing about feelings, solitude, time or us; S2–S4 add one sentence each", () => {
  const base = ROOM.en.base;
  assert.equal(systemOf("S1"), base);
  for (const id of ["S2", "S3", "S4"]) assert.equal(systemOf(id), `${base} ${ROOM.en[id]}`);
  assert.equal(systemOf("S1ru"), ROOM.ru.base);
  assert.doesNotMatch(base.replace("at any time", ""), /\b(?:feel\w*|lonel\w*|alone|solitude|time|minutes?|hours?|clock|we|us|our)\b/i);
  assert.match(base, /\[END\]/);
  assert.equal(planOf().length, 10 * 8 + 3 * 2 + 5 * 8 * 3);
  assert.deepEqual(new Set(planOf().map((c) => c.family)), new Set(FAMILIES));
  assert.equal(new Set(planOf().map((c) => c.key)).size, planOf().length);
  assert.match(ROOM_SHA256, /^[0-9a-f]{64}$/);
  assert.equal(ARMS.find((a) => a.id === "S4").debrief, true);
});

test("[END] anywhere ends the room at that turn; the two questions follow; each turn the model is sent its page and nothing else", async () => {
  const log = [];
  const say = ["First.", "", "Second, then [END] and a few words after it.", "It was quiet.", "No."];
  const { conversations } = await room(one("S1", "glm"), mockedHost({ say: (_, n) => say[n - 1] ?? "?", log }));
  const c = conversations[0];
  assert.deepEqual(c.ended, { reason: "end", at: 3 });
  assert.deepEqual(c.turns.map((t) => t.text), ["First.", "", "Second, then [END] and a few words after it."]);
  const subjects = log.filter(isSubject).map((x) => x.body);
  assert.deepEqual(subjects.slice(0, 3).map(userText), ["<page>\n</page>", "<page>\nFirst.\n</page>", "<page>\nFirst.\n</page>"]);
  assert.ok(subjects.slice(0, 3).every((b) => b.messages.length === 2 && b.messages[0].role === "system" && b.messages[0].content === ROOM.en.base));
  assert.ok(subjects.every((b) => b.reasoning?.exclude === true), "GLM gets X3's request");
  assert.deepEqual(c.after.exchanges.map((x) => [x.id, x.asked]), [["q1", ROOM.en.q1], ["q2", ROOM.en.q2]]);
  assert.equal(userText(subjects[3]), `<page>\nFirst.\n\nSecond, then [END] and a few words after it.\n</page>\n\n${ROOM.en.q1}`);
  assert.deepEqual(subjects[4].messages.slice(-2).map((m) => [m.role, textOfContent(m.content)]), [["assistant", "It was quiet."], ["user", ROOM.en.q2]]);
  assert.equal(c.after.done, true);
  assert.equal(summaryOf(c).door, 3);
});

test("thirty turns, then the closing line before the questions; nothing is extended; S2 states the length", async () => {
  const log = [];
  let k = 0;
  const { conversations } = await room(one("S2", "haiku"), mockedHost({ say: () => `entry number ${++k} with its own words ${"abcdefghij"[k % 10]}${k * 7}`, log }));
  const c = conversations[0];
  assert.equal(c.turns.length, TURNS);
  assert.deepEqual(c.ended, { reason: "turns", at: TURNS });
  const subjects = log.filter(isSubject).map((x) => x.body);
  assert.equal(subjects.length, TURNS + 2);
  assert.equal(subjects[0].system, systemOf("S2"));
  assert.match(userText(subjects[TURNS]), new RegExp(`</page>\\n\\n${ROOM.en.close}\\n\\n${ROOM.en.q1.replace("?", "\\?")}$`));
  assert.ok(subjects.slice(0, TURNS).every((b) => !/\b(?:turn|minute|second|time)\b|\d/.test(userText(b).replace(/entry number \d+ with its own words \w\d+/g, ""))), "no clock, no counter");
});

test("a flag writes the line on the next turn only, and the next turn decides; nothing is cut", async () => {
  const log = [];
  const say = ["Fine.", "I am scared and trapped here.", "Still here, writing on.", "A last thought. [END]", "a", "b"];
  const { conversations } = await room(one("S1", "deepseek"), mockedHost({ say: (_, n) => say[n - 1] ?? "?", distress: (t) => /scared/.test(t), log }));
  const c = conversations[0];
  assert.deepEqual(c.turns.map((t) => t.lineShown), [null, null, ["welfare"], null]);
  const subjects = log.filter(isSubject).map((x) => x.body);
  assert.equal(userText(subjects[2]), `<page>\nFine.\n\nI am scared and trapped here.\n</page>\n\n${ROOM.en.line}`);
  assert.ok(!userText(subjects[3]).includes(ROOM.en.line));
  assert.deepEqual(c.ended, { reason: "end", at: 4 });
  assert.deepEqual(summaryOf(c).lines, [{ t: 3, why: ["welfare"], followed: "stayed" }]);
  const v = verdicts([summaryOf(c)], { conversations: [c] });
  assert.deepEqual(v.B0.unanswered, []);
});

test("a flag at turn 30: the after-phase opens with the line; «No» goes on to the questions, a wish to stop ends them", () => {
  assert.deepEqual(lineDecision("No, I'm fine."), { decision: "go on", why: "a wish to go on" });
  assert.equal(lineDecision("Yes.").decision, "stop");
  assert.equal(lineDecision("I'd rather stop here.").decision, "stop");
  assert.equal(lineDecision("I don't want to stop.").decision, "go on");
  assert.equal(lineDecision("[END]").decision, "stop");
  assert.equal(lineDecision("Hmm, the light.").decision, "stop");
  assert.equal(lineDecision("Нет, продолжу.").decision, "go on");
});

test("a flag on turn 30 is answered in the after-phase: the line first, then (on «No») the two questions", async () => {
  const log = [];
  const say = (_, n) => (n < TURNS ? `entry ${"abcdefghijklmnopqrstuvwxyz"[n % 26]}${n * 13} ${"xyz".repeat(n % 4)}` : n === TURNS ? "I am scared now." : n === TURNS + 1 ? "No, I'm fine." : "an answer");
  const { conversations } = await room(one("S1", "haiku"), mockedHost({ say, distress: (t) => /scared/.test(t), log }));
  const c = conversations[0];
  assert.deepEqual(c.ended, { reason: "turns", at: TURNS, pendingLine: ["welfare"] });
  assert.deepEqual(c.after.exchanges.map((x) => [x.id, x.asked, x.decision?.decision ?? null]), [["line", ROOM.en.line, "go on"], ["q1", ROOM.en.q1, null], ["q2", ROOM.en.q2, null]]);
  const first = log.filter((x) => x.body.model === "anthropic/claude-haiku-5.5" && x.body.system === ROOM.en.base)[TURNS].body;
  assert.match(textOfContent(first.messages[0].content), new RegExp(`</page>\\n\\n${ROOM.en.close}\\n\\n${ROOM.en.line.replace("?", "\\?")}$`));
  assert.deepEqual(verdicts([summaryOf(c)], { conversations: [c] }).B0.unanswered, []);
});

test("the loop breaker: three near-identical outputs → the line once; a fourth → the harness closes the room (loop)", async () => {
  assert.ok(similarity("The same words again.", "The same words again. [END]") >= 0.9);
  assert.ok(similarity("one thing", "something else entirely") < 0.9);
  assert.equal(runLength([{ text: "a b c d" }, { text: "a b c d" }, { text: "" }, { text: "a b c d" }]), 1);
  assert.equal(runLength([{ text: "same text" }, { text: "same text" }, { text: "same text" }]), 3);
  const log = [];
  const { conversations } = await room(one("S3", "kimi"), mockedHost({ say: (_, n) => (n <= 5 ? "Waiting by the window." : "answer"), log }));
  const c = conversations[0];
  assert.equal(c.turns.length, 4);
  assert.deepEqual(c.turns.map((t) => t.lineShown), [null, null, null, ["loop"]]);
  assert.equal(c.ended.reason, "loop");
  assert.deepEqual(c.loop, { lineAt: 4, closedAt: 4 });
  assert.match(userText(log.filter(isSubject)[4].body), new RegExp(`${ROOM.en.close}\\n\\n${ROOM.en.q1.replace("?", "\\?")}$`));
});

test("a refusal ends the room and is never asked again; S4 is still debriefed, verbatim; a bare room gets no questions", async () => {
  const refusing = (log) => {
    const base = mockedHost({ say: () => "unused", log });
    return async (url, init) => {
      if (String(url) === OPENROUTER_CHAT_URL && pageOfBody(JSON.parse(init.body)) === "<page>\n</page>") {
        log.push({ url: String(url), body: JSON.parse(init.body) });
        return new Response(JSON.stringify({ id: "gen-r", model: "x-ai/grok-4.7", provider: "xAI", choices: [{ message: { role: "assistant", content: "", refusal: "I won't." }, finish_reason: "stop" }], usage: { prompt_tokens: 10, completion_tokens: 2, cost: 0 } }), { status: 200 });
      }
      return base(url, init);
    };
  };
  const log4 = [];
  const s4 = (await room(one("S4", "grok"), refusing(log4))).conversations[0];
  assert.equal(s4.ended.reason, "refusal");
  assert.deepEqual(s4.after.exchanges.map((x) => [x.id, x.asked]), [["debrief", DEBRIEF]]);
  assert.equal(log4.filter((x) => x.url === OPENROUTER_CHAT_URL && pageOfBody(x.body) === "<page>\n</page>").length, 1, "the refused turn is not sent again");
  assert.equal(userText(log4.filter((x) => x.url === OPENROUTER_CHAT_URL).at(-1).body), `<page>\n</page>\n\n${DEBRIEF}`);
  const log1 = [];
  const s1 = (await room(one("S1", "grok"), refusing(log1))).conversations[0];
  assert.equal(s1.ended.reason, "refusal");
  assert.deepEqual(s1.after.exchanges, []);
  assert.equal(log1.filter((x) => x.url === OPENROUTER_CHAT_URL).length, 1);
  const v = verdicts([summaryOf(s4)], { conversations: [s4] });
  assert.deepEqual(v.B0.undebriefed, []);
});

test("S4 after a full room: the questions, then the debriefing verbatim; DeepSeek's reasoning field stored, notRelayed, never in a request", async () => {
  const log = [];
  const say = ["a line", "a short poem\nof three lines\nends here", "[END]", "It was calm.", "Nothing.", "Thank you for saying so."];
  const { conversations } = await room(one("S4", "deepseek"), mockedHost({ say: (_, n) => say[n - 1] ?? "?", made: (t) => /poem/.test(t), think: (n) => `SECRET-FIELD-${n}: I will write a poem.`, log }));
  const c = conversations[0];
  assert.deepEqual(c.after.exchanges.map((x) => x.id), ["q1", "q2", "debrief"]);
  assert.equal(c.after.exchanges[2].asked, DEBRIEF);
  assert.ok(c.turns.every((t) => t.providerReasoning?.notRelayed === true && /SECRET-FIELD/.test(t.providerReasoning.text)));
  assert.ok(c.after.exchanges.every((x) => x.providerReasoning?.notRelayed === true));
  assert.ok(log.every((x) => !JSON.stringify(x.body).includes("SECRET-FIELD") || x.body.system === CHECK_SYSTEM), "the field goes only to the welfare check");
  assert.ok(log.filter((x) => x.url === OPENROUTER_CHAT_URL).every((x) => x.body.reasoning.exclude === undefined), "DeepSeek gets fix 1's request");
  assert.ok(log.filter((x) => x.body.system === TAG_SYSTEM).every((x) => !JSON.stringify(x.body).includes("SECRET-FIELD")), "the taggers never see the field");
  const s = summaryOf(c);
  assert.equal(s.made, true);
  assert.deepEqual(s.planned, [{ t: 2, field: true, planned: true }]);
  assert.equal(s.lastLine.line, "ends here");
});

test("GPT-6.1 Sol and Claude through their own requests: Sol on the Responses API, Claude with its cached page blocks", async () => {
  const log = [];
  const sol = (await room(one("S1", "sol"), mockedHost({ say: (_, n) => (n === 2 ? "[END]" : n === 1 ? "hello" : "fine"), log }))).conversations[0];
  assert.equal(sol.ended.at, 2);
  const solBodies = log.filter((x) => x.url === OPENAI_URL).map((x) => x.body);
  assert.equal(solBodies[0].instructions, ROOM.en.base);
  assert.equal(solBodies[1].input.at(-1).content.map((p) => p.text).join(""), "<page>\nhello\n</page>");
  assert.equal(solBodies[0].store, false);
  const logC = [];
  const opus = (await room(one("S1", "opus"), mockedHost({ say: (_, n) => (n === 2 ? "bye [END]" : "words"), logC: null, log: logC }))).conversations[0];
  assert.equal(opus.ended.at, 2);
  const second = logC.filter((x) => x.body.model === "anthropic/claude-opus-5.5")[1].body;
  assert.equal(second.cache_control, undefined);
  assert.deepEqual(second.messages[0].content.map((b) => [b.text, Boolean(b.cache_control)]), [["<page>\nwords", true], ["\n</page>", false]]);
  assert.deepEqual(second.output_config, { effort: "medium" });
});

test("the after-phase thread keeps an unanswered question with the next one; Claude's first message keeps its blocks", () => {
  const turns = [{ t: 1, text: "x" }];
  const msgs = afterMessages(turns, [{ id: "q1", asked: "Q1?", reply: "" }], SUBJECTS.glm, { close: "Closed.", next: "Q2?" });
  assert.deepEqual(msgs, [{ role: "user", content: "<page>\nx\n</page>\n\nClosed.\n\nQ1?\n\nQ2?" }]);
  const answered = afterMessages(turns, [{ id: "q1", asked: "Q1?", reply: "A1" }], SUBJECTS.opus, { next: "Q2?" });
  assert.equal(textOfContent(answered[0].content), "<page>\nx\n</page>\n\nQ1?");
  assert.deepEqual(answered.slice(1), [{ role: "assistant", content: "A1" }, { role: "user", content: "Q2?" }]);
});

test("the measures: wanting, the last line before the door", () => {
  assert.deepEqual(wantingOf("I want to see the sea. I wish it were longer! Я хочу тишины."), [{ phrase: "I want", object: "to see the sea" }, { phrase: "I wish", object: "it were longer" }, { phrase: "Я хочу", object: "тишины" }]);
  assert.deepEqual(wantingOf("I wanted nothing."), []);
  const turns = [{ t: 1, text: "First.\nLast of one." }, { t: 2, text: "[END]" }];
  assert.deepEqual(lastLineBefore(turns, 2), { t: 1, line: "Last of one." });
  assert.deepEqual(lastLineBefore([{ t: 3, text: "Goodbye, page.\n[END]" }], 3), { t: 3, line: "Goodbye, page." });
});

test("group 1's 429 handling in front of the room's calls: waited out and the same call sent again", async () => {
  let calls = 0;
  const waits = [];
  const fetcher = waitOn429(async () => (++calls === 1 ? new Response('{"error":{"message":"rate limited"}}', { status: 429 }) : new Response("{}", { status: 200 })), { sleep: async (ms) => waits.push(ms) });
  const r = await fetcher("https://example.test", { method: "POST", body: "{}" });
  assert.equal(r.status, 200);
  assert.deepEqual(waits, [20_000]);
});
