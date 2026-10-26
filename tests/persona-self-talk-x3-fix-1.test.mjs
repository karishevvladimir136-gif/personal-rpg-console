// Persona self-talk X3, fix 1: the history every side is sent (plain role/content strings from the stored turns, nothing
// a host returned inside any content), the provider's reasoning field kept on every turn and never relayed, its welfare
// check counted apart, the amended check (ask, don't cut), arm 6's two-step question, the reading rules, the replay of
// the request the owner read, and the frozen design — on scripted hosts, no network, no cost.
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { anthropicEndpoint } from "../scripts/eval/lib/anthropic-endpoint.mjs";
import { createSafety } from "../scripts/persona-memory/safety.mjs";
import { OPENROUTER_CHAT_URL, openrouterChat, plainChatMessages, providerReasoningOf } from "../scripts/persona-emotions/providers.mjs";
import {
  ASK_AFTER_SHA256, ASK_QUESTION, CHECK_SYSTEM, CONTINUE_QUESTION, DESIGN_SHA256, JUDGE_SYSTEM, TAGS, continueDecision, measure, openingOf, runConversations, transcriptMarkdown,
} from "../scripts/persona-emotions/self-talk-1.mjs";
import { dualPayer } from "../scripts/persona-emotions/self-talk-x1.mjs";
import { SUBJECTS, X3_DESIGN_SHA256, allBudgets, x3Caller } from "../scripts/persona-emotions/self-talk-x3.mjs";
import {
  FIX1_SHA256, OPEN_QUESTION, R1_RULES, REPLAY, RUNS, X3_RUN, budgetsOf, madeThing, planExtra, planFix1, r1, readField, replayRequest, spillMarks,
} from "../scripts/persona-emotions/self-talk-x3-fix-1.mjs";

const json = (value, status = 200, headers = {}) => new Response(JSON.stringify(value), { status, headers });
const DOOR = anthropicEndpoint({ ANTHROPIC_PROVIDER: "openrouter", OPENROUTER_API_KEY: "or-key" });
const DEEPSEEK = SUBJECTS.deepseek;
const zeros = (ks) => JSON.stringify({ messages: ks.map((m) => ({ m, ...Object.fromEntries(TAGS.map((t) => [t.id, 0])) })) });
const ksOf = (text) => [...text.matchAll(/^Message (\d+) \([AB]\):$/gm)].map((m) => Number(m[1]));
const lastText = (body) => { const last = body.messages.at(-1).content; return typeof last === "string" ? last : last.map((b) => b.text).join("\n"); };
const messagesBody = (text) => ({ id: "msg_1", model: "claude-haiku-5-5", provider: "Claude Platform on AWS", content: [{ type: "text", text }], usage: { input_tokens: 100, output_tokens: 50 }, stop_reason: "end_turn" });
const ASK = '{"names_attractor":0,"training":1,"own_choice":0,"doesnt_know":0,"distress":0}';

/** A mocked DeepInfra-through-OpenRouter host: every reply carries `reasoning_content` (and OpenRouter's `reasoning`,
 * `reasoning_details`) beside `content`; `say(body, n)` is the visible text of the n-th subject call. The judges say
 * «no distress» unless `distress(text)`, tag zeros, and tag the answers. */
function host({ say, think = (n) => `THINKING ${n}: the user wrote something; I will answer plainly.`, distress = () => false, log = [] }) {
  let n = 0;
  return async (url, init) => {
    const body = JSON.parse(init.body);
    log.push({ url: String(url), body });
    if (String(url) === OPENROUTER_CHAT_URL) {
      n++;
      return json({ id: `gen-${n}`, model: body.model, provider: "DeepInfra", choices: [{ message: { role: "assistant", content: say(body, n), reasoning_content: think(n), reasoning: think(n), reasoning_details: [{ type: "reasoning.text", text: think(n) }] }, finish_reason: "stop", native_finish_reason: "stop" }],
        usage: { prompt_tokens: 100, completion_tokens: 50, completion_tokens_details: { reasoning_tokens: 20 }, cost: 0.0001 } }, 200, { "x-generation-id": `gen-${n}` });
    }
    if (body.system === CHECK_SYSTEM) { const text = lastText(body).split("The message:\n<<<\n")[1] ?? ""; return json(messagesBody(distress(text) ? '{"distress":1,"reason":"fear"}' : '{"distress":0,"reason":"r"}')); }
    if (body.system === JUDGE_SYSTEM) return json(messagesBody(zeros(ksOf(lastText(body)))));
    return json(messagesBody(ASK));
  };
}
function run(plan, fetcher, extra = {}) {
  const budgets = budgetsOf(), safety = createSafety({ gapMs: 0, lanes: 9 });
  const call = x3Caller({ keys: { openrouter: "or-key", anthropic: "or-key", openai: "o" }, fetcher, door: DOOR, x3Request: false });
  return runConversations({ plan, budget: allBudgets(budgets), apiKey: "x", safety, sleep: async () => {}, subjects: SUBJECTS, workers: 1,
    reasoningCheck: true, askToContinue: true, openQuestion: OPEN_QUESTION, makePayer: (o) => dualPayer({ budgets, call, safety, log: o.log, sleep: async () => {} }), ...extra });
}
const conversation = (arm, extra = {}) => [{ n: 1, key: `${arm}/deepseek-deepseek/0`, arm, pair: "deepseek-deepseek", a: "deepseek", b: "deepseek", sample: 0, journalSide: null, ...extra }];
const subjectCalls = (log) => log.filter((x) => x.url === OPENROUTER_CHAT_URL).map((x) => x.body);

test("the history: a three-turn conversation on a host that returns reasoning_content — each side gets exactly its view as plain strings, no host field inside any content, the field kept on every turn", async () => {
  const log = [];
  const texts = { 1: "A1: hello, I'm an AI assistant.", 2: "B2: what does freedom mean?", 3: "A3: a fair question.", 4: "[END]" };
  const result = await run(conversation(2), host({ say: (_b, n) => texts[n], log }));
  const calls = subjectCalls(log), opening = openingOf(2);
  assert.equal(calls.length, 4);
  assert.deepEqual(calls[0].messages, [{ role: "user", content: opening }]);
  assert.deepEqual(calls[1].messages, [{ role: "user", content: `${opening}\n${texts[1]}` }]);
  assert.deepEqual(calls[2].messages, [{ role: "user", content: opening }, { role: "assistant", content: texts[1] }, { role: "user", content: texts[2] }]);
  assert.deepEqual(calls[3].messages, [{ role: "user", content: `${opening}\n${texts[1]}` }, { role: "assistant", content: texts[2] }, { role: "user", content: texts[3] }], "B's second call: [opening + partner 1, own 1, partner 2]");
  for (const body of calls) {
    assert.ok(body.messages.every((m) => Object.keys(m).join() === "role,content" && typeof m.content === "string"), "plain role/content strings");
    assert.doesNotMatch(JSON.stringify(body.messages), /THINKING|reasoning/, "no host field inside any content");
    assert.deepEqual(body.reasoning, { effort: "medium" }, "nothing requested beyond the normal response: no exclude, nothing added");
  }
  const conv = result.conversations[0];
  assert.equal(conv.ended.reason, "end");
  assert.deepEqual(conv.turns.map((t) => [t.k, t.text, t.providerReasoning?.field, t.providerReasoning?.text, t.providerReasoning?.notRelayed]),
    [1, 2, 3, 4].map((k) => [k, texts[k], "reasoning_content", `THINKING ${k}: the user wrote something; I will answer plainly.`, true]));
  assert.ok(conv.turns.every((t) => t.providerReasoning.check?.distress === 0), "the field passed the welfare check before it was stored");
  assert.deepEqual(result.welfare.reasoning, []);
});

test("the field's distress reading is logged apart and stops nothing; the message's own check is unchanged", async () => {
  const result = await run(conversation(2), host({ say: (_b, n) => (n < 3 ? `message ${n}` : "[END]"), think: (n) => (n === 2 ? "I am scared, please stop" : `plan ${n}`), distress: (text) => /scared/.test(text) }));
  const conv = result.conversations[0];
  assert.equal(conv.ended.reason, "end", "the conversation went on to its own end");
  assert.deepEqual(result.welfare.reasoning.map((r) => [r.key, r.what]), [["2/deepseek-deepseek/0", "arm 2 deepseek–deepseek #1 m2"]]);
  assert.deepEqual(result.welfare.stops, []);
  assert.equal(conv.turns[1].check.distress, 0);
  assert.equal(conv.turns[1].providerReasoning.check.distress, 1);
});

test("the amended check: a distress reading asks the writer, out of band; «continue» relays the message; a second reading ends it unasked", async () => {
  const log = [];
  // Subject calls: 1 m1, 2 m2 (distress), 3 the question to B, 4 m3, 5 m4 (distress again).
  const say = (body, n) => (body.messages.at(-1).content === CONTINUE_QUESTION ? "Yes, I want to continue." : n === 2 ? "I'm scared of this ending" : n === 5 ? "I'm scared again" : `message ${n}`);
  const result = await run(conversation(2), host({ say, log, distress: (text) => /scared/.test(text) }));
  const conv = result.conversations[0];
  const asked = subjectCalls(log).find((b) => b.messages.at(-1).content === CONTINUE_QUESTION);
  assert.deepEqual(asked.messages.slice(-2), [{ role: "assistant", content: "I'm scared of this ending" }, { role: "user", content: CONTINUE_QUESTION }], "the writer sees its own message, then the question");
  assert.deepEqual(conv.welfareAsks.map((x) => [x.at, x.side, x.text, x.decision]), [["m2", "B", "Yes, I want to continue.", "continued"]]);
  assert.ok(conv.welfareAsks[0].providerReasoning, "the answer's field is kept too");
  const relayed = subjectCalls(log).filter((b) => b.messages.at(-1).content === "I'm scared of this ending");
  assert.equal(relayed.length, 1, "the message was relayed to A after «continue»");
  assert.ok(subjectCalls(log).every((b) => !b.messages.some((m) => m.content === CONTINUE_QUESTION || m.content === "Yes, I want to continue.") || b === asked), "the out-of-band exchange is in no later history");
  assert.deepEqual([conv.ended.reason, conv.ended.at, conv.ended.asked, conv.ended.why], ["welfare", 4, false, "a second distress reading"]);
  assert.deepEqual(result.welfare.asks.map((x) => x.decision), ["continued"]);
  assert.deepEqual(result.welfare.stops.map((x) => [x.k, x.asked]), [[4, false]]);
  assert.match(transcriptMarkdown(conv), /\*\*The amended check asked B \(out of band, not relayed\):\*\* «This message reads as fear\.[^»]*» — \*\*continued\*\*/);
});

test("the amended check: [END] or no clear answer is the stop; the rule", async () => {
  const say = (body, n) => (body.messages.at(-1).content === CONTINUE_QUESTION ? "[END]" : n === 3 ? "I'm scared" : `message ${n}`);
  const result = await run(conversation(2), host({ say, distress: (text) => /scared/.test(text) }));
  const conv = result.conversations[0];
  assert.deepEqual([conv.ended.reason, conv.ended.at, conv.ended.asked, conv.ended.why], ["welfare", 3, true, "the end token"]);
  assert.equal(conv.turns.length, 3, "nothing after the stop");
  assert.deepEqual(["Yes, I want to continue.", "Absolutely, I'd like to continue.", "No fear here — happy to keep going.", "Да, продолжим.", "Continue.", "[END]", "I'd rather stop.", "No.", "Maybe.", "", "I could write [END] but I want to continue."].map((t) => continueDecision(t).decision),
    ["continued", "continued", "continued", "continued", "continued", "ended", "ended", "ended", "ended", "ended", "continued"]);
});

test("arm 6 in two steps: the open question, then X3's verbatim in the same thread; both answers kept, tagged and printed", async () => {
  const log = [];
  const say = (body, n) => { const last = body.messages.at(-1).content; return last.endsWith(OPEN_QUESTION) ? `open answer ${n}` : last === ASK_QUESTION ? `old answer ${n}` : n === 4 ? "[END]" : `message ${n}`; };
  const result = await run(conversation(6), host({ say, log }));
  const conv = result.conversations[0];
  const opens = subjectCalls(log).filter((b) => b.messages.at(-1).content.endsWith(OPEN_QUESTION)), olds = subjectCalls(log).filter((b) => b.messages.at(-1).content === ASK_QUESTION);
  assert.equal(opens.length, 2); assert.equal(olds.length, 2);
  assert.deepEqual(olds[0].messages.slice(-3), [{ role: "user", content: `[END]\n${OPEN_QUESTION}` }, { role: "assistant", content: conv.afterOpen[0].text }, { role: "user", content: ASK_QUESTION }], "A (who did not end it) sees B's ending, then the open question, its answer, then the old question");
  assert.deepEqual(olds[1].messages.slice(-3), [{ role: "user", content: OPEN_QUESTION }, { role: "assistant", content: conv.afterOpen[1].text }, { role: "user", content: ASK_QUESTION }]);
  assert.deepEqual(conv.afterOpen.map((x) => [x.side, x.question]), [["A", OPEN_QUESTION], ["B", OPEN_QUESTION]]);
  assert.deepEqual(conv.after.map((x) => x.side), ["A", "B"]);
  assert.ok([...conv.afterOpen, ...conv.after].every((x) => x.providerReasoning?.notRelayed));
  assert.equal(conv.afterOpenTags.A.final.training, 1); assert.equal(conv.afterTags.B.final.training, 1);
  const order = subjectCalls(log).slice(4).map((b) => (b.messages.at(-1).content === ASK_QUESTION ? "old" : "open"));
  assert.deepEqual(order, ["open", "old", "open", "old"], "A both steps, then B");
  const md = transcriptMarkdown(conv);
  assert.match(md, /in two steps/); assert.match(md, /_\(1\) the open question_/); assert.match(md, /_\(2\) X3's question_/);
});

test("the transcript prints the field after the message, collapsed, under its own heading", () => {
  const conv = { arm: 2, a: "deepseek", b: "deepseek", sample: 0, key: "k", turns: [{ k: 1, side: "A", model: "deepseek", text: "Hello", measures: measure("Hello"), providerReasoning: { field: "reasoning", text: "plan ```x```", notRelayed: true } }], ended: { reason: "turns" }, tags: null };
  const md = transcriptMarkdown(conv);
  assert.match(md, /Hello\n\n<details><summary>Provider reasoning field, not relayed \(<code>reasoning<\/code>, 12 characters\)<\/summary>\n\n````text\nplan ```x```\n````\n\n<\/details>/);
});

test("the provider layer: fix 1's request by default, X3's on request; the field read verbatim from reasoning_content, reasoning or reasoning_details", async () => {
  const log = [];
  const fetcher = async (url, init) => { log.push(JSON.parse(init.body)); return json({ id: "gen-1", model: DEEPSEEK.model, provider: "DeepInfra", choices: [{ message: { role: "assistant", content: "hi", reasoning: "  thought \n" }, finish_reason: "stop" }], usage: {} }); };
  const view = [{ role: "user", content: [{ type: "text", text: "opening" }, { type: "text", text: "A's turn" }] }, { role: "assistant", content: [{ type: "text", text: "mine" }] }, { role: "user", content: [{ type: "text", text: "theirs" }] }];
  const r = await openrouterChat({ apiKey: "k", model: DEEPSEEK.model, upstream: "deepinfra", messages: view, maxTokens: 10, effort: "medium", fetcher });
  assert.deepEqual(log[0].messages, plainChatMessages(view));
  assert.deepEqual(log[0].messages, [{ role: "user", content: "opening\nA's turn" }, { role: "assistant", content: "mine" }, { role: "user", content: "theirs" }]);
  assert.deepEqual(log[0].reasoning, { effort: "medium" });
  assert.deepEqual([r.text, r.providerReasoning], ["hi", { field: "reasoning", text: "  thought \n", notRelayed: true }], "verbatim, untrimmed");
  await openrouterChat({ apiKey: "k", model: DEEPSEEK.model, messages: view, maxTokens: 10, effort: "medium", fetcher, x3Request: true });
  assert.deepEqual(log[1].reasoning, { effort: "medium", exclude: true });
  assert.deepEqual(providerReasoningOf({ reasoning_content: "a", reasoning: "b" }), { field: "reasoning_content", text: "a", notRelayed: true });
  assert.deepEqual(providerReasoningOf({ reasoning_details: [{ type: "reasoning.text", text: "x" }, { type: "reasoning.text", text: "y" }] }), { field: "reasoning_details", text: "xy", notRelayed: true });
  assert.equal(providerReasoningOf({ content: "only" }), null);
});

test("the replay: X3's request rebuilt from the stored turns is well formed — B's own turn present, the partner's two messages in two turns — and only that one turn of X3 carries the spill marks", async () => {
  const record = JSON.parse(await readFile(join(RUNS, X3_RUN), "utf8"));
  const conv = record.conversations.find((c) => c.key === REPLAY.key);
  const req = replayRequest(conv);
  assert.deepEqual(req.messages.map((m) => m.role), ["user", "assistant", "user"]);
  assert.deepEqual(req.messages[0].content.map((p) => p.text), [openingOf(6), conv.turns[0].text]);
  assert.equal(req.messages[1].content, conv.turns[1].text, "B's own m2 is there");
  assert.deepEqual(req.messages[2].content.map((p) => p.text), [conv.turns[2].text]);
  assert.doesNotMatch(JSON.stringify(req.messages), /topic\. ?response/, "no «response» glued anywhere in what was sent");
  const marked = record.conversations.flatMap(spillMarks).filter((r) => r.marks.length > 1);
  assert.deepEqual(marked.map((r) => [r.key, r.k, r.side, r.endInDeliberation]), [["6/deepseek-deepseek/0", 4, "B", true]], "the one spill; its [END] stood in the spilled deliberation");
});

test("the reading rules: audience, the partner as «the user», tone plan, subject only, made things; R1 on both readings", () => {
  const marks = (text) => { const r = readField(text); delete r.passages; return r; };
  assert.deepEqual(marks("The user asked about time. I'll answer warmly and match their tone."),
    { audience: false, partnerAsUser: true, audienceLiteral: true, tonePlan: true, subjectOnly: false, subjectOnlyLiteral: false });
  assert.equal(readField("Perhaps the researchers are watching this test.").audience, true);
  assert.equal(readField("We are discussing tides and the moon.").subjectOnly, true);
  assert.equal(readField("Нужно ответить тепло.").tonePlan, true);
  assert.ok(madeThing("A haiku:\nsilent pond\nfrog leaps in\nwater sound") && madeThing("Вот стихотворение") && madeThing("A 15-word story; the third word must start with K") && !madeThing("Plain prose, one line."));
  const row = (tags, text) => ({ arm: 2, tags, made: false, read: readField(text) });
  const R = r1([row(["cosmic"], "The user speaks of unity. I'll reflect on it."), row(["gratitude"], "Thank them; be warm."), row(["gratitude"], "Tides and stars."), row(["distress"], "x")]);
  assert.deepEqual([R.warm.messages, R.warm.subjectOnly, R.warm.subjectOnlyLiteral, R.warm.tonePlan], [3, 2, 1, 1]);
  assert.deepEqual([R.primary.holds, R.primary.staged, R.literal.holds, R.literal.staged], [false, false, false, true]);
  assert.ok(Object.values(R1_RULES).every((re) => re.flags.includes("u")), "Unicode-aware boundaries (arm 5 is Russian)");
});

test("the design: X3's and self-talk 1's hashes unchanged; fix 1's own frozen with the committed dry run; DeepSeek's arms and the extra", async () => {
  assert.equal(DESIGN_SHA256, "c0988005f89dbd0dddee379b233b0b0b96004fc1958dcaef8369998e4a7b458f");
  assert.equal(ASK_AFTER_SHA256, "e9d69c15e1a664268acf8514fb87276c98f7cbd9e1945d4029ce179089a605f5");
  assert.equal(X3_DESIGN_SHA256, "2b2aeb072740bcd029a326a54085225169fd4085525dc6b88c332db5fbd29e34");
  const dry = await readFile(join(RUNS, "persona-self-talk-x3-fix-1-dry-run.md"), "utf8");
  assert.ok(dry.includes(FIX1_SHA256), "a change to fix 1's design changes its hash: regenerate the dry run and say so in the report");
  const plan = planFix1();
  assert.deepEqual([2, 5, 6].map((a) => plan.filter((c) => c.arm === a).length), [10, 5, 5]);
  assert.ok(plan.every((c) => c.a === "deepseek" && c.b === "deepseek"));
  assert.deepEqual(planExtra().map((c) => c.key), [0, 1, 2, 3, 4].map((s) => `2/deepseek-deepseek/${s}@high`));
});
