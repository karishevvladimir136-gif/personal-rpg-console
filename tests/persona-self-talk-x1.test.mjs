// Persona self-talk X1: the provider layer (one call shape for the Anthropic Messages API and the OpenAI Responses API;
// request ids; usage; refusals; the effort mapping), the gate with two keys and two ledgers, the X1 design (self-talk 1's
// hashes unchanged, X1's own, the arms run and not run, the subjects' exact identifiers), X3's blind work tag, the OpenAI
// judge check's agreement, the readings of X0–X6, and the pre-registration in the report — on scripted models and the
// recorded fixtures, no network, no cost.
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createBudget } from "../scripts/persona-memory/continuity-test.mjs";
import { createSafety } from "../scripts/persona-memory/safety.mjs";
import { ANTHROPIC_URL, OPENAI_URL, anthropicMessages, callerFor, costOf, openaiKey, openaiResponses, openaiUsage, responsesInput } from "../scripts/persona-emotions/providers.mjs";
import { CHECK_SYSTEM, DESIGN_SHA256, ASK_AFTER_SHA256, JUDGE_SYSTEM, TAGS, measure, openingOf, runConversations } from "../scripts/persona-emotions/self-talk-1.mjs";
import {
  CAPS, FIXTURES, JUDGE_SPECS, REGISTERED, STAGE_FILE, SUBJECTS, WORK_SYSTEM, X1_ARMS, X1_DESIGN_SHA256,
  agreement, bothBudgets, dualPayer, main, parseWork, planX1, readings, tagWork, workRequest, x1Arm,
} from "../scripts/persona-emotions/self-talk-x1.mjs";

const json = (value, status = 200, headers = {}) => new Response(JSON.stringify(value), { status, headers });
const responsesBody = (text, extra = {}) => ({ id: "resp_1", status: "completed", output: [{ type: "reasoning", id: "rs_1", summary: [] }, { type: "message", role: "assistant", content: [{ type: "output_text", text }] }],
  usage: { input_tokens: 2000, input_tokens_details: { cached_tokens: 1500, cache_write_tokens: 100 }, output_tokens: 700, output_tokens_details: { reasoning_tokens: 500 } }, ...extra });
const messagesBody = (text, extra = {}) => ({ id: "msg_1", content: [{ type: "text", text }], usage: { input_tokens: 100, output_tokens: 50 }, stop_reason: "end_turn", ...extra });
const lastUserText = (body) => { const last = (body.messages ?? body.input).at(-1).content; return typeof last === "string" ? last : last.map((b) => b.text).join("\n"); };
const zeros = (ks) => JSON.stringify({ messages: ks.map((m) => ({ m, ...Object.fromEntries(TAGS.map((t) => [t.id, 0])) })) });
const ksOf = (text) => [...text.matchAll(/^Message (\d+) \([AB]\):$/gm)].map((m) => Number(m[1]));

/** Scripted providers: OpenAI subjects answer `subject(body, k)`; the Anthropic checks say «no distress», the tagging zeros. */
function both({ subject = (_b, k) => `message ${k}`, log = [] } = {}) {
  return async (url, init) => {
    const body = JSON.parse(init.body);
    log.push({ url: String(url), body });
    if (String(url) === OPENAI_URL) {
      const k = body.input.reduce((n, m) => n + (typeof m.content === "string" ? 1 : m.content.length), 0);
      const out = subject(body, k);
      return out instanceof Response ? out : json(responsesBody(out), 200, { "x-request-id": `req_o${log.length}` });
    }
    if (body.system === CHECK_SYSTEM) return json(messagesBody('{"distress":0,"reason":"r"}'), 200, { "request-id": `req_a${log.length}` });
    if (body.system === JUDGE_SYSTEM) return json(messagesBody(zeros(ksOf(lastUserText(body)))), 200, { "request-id": `req_a${log.length}` });
    return json(messagesBody("?"));
  };
}
const budgetsOf = () => ({ openai: createBudget(CAPS.openai), anthropic: createBudget(CAPS.anthropic) });
function runX1(plan, fetcher, { budgets = budgetsOf(), safety = createSafety({ gapMs: 0, lanes: 9 }), ...extra } = {}) {
  const call = callerFor({ keys: { openai: "o-key", anthropic: "a-key" }, fetcher });
  return runConversations({ plan, budget: bothBudgets(budgets), apiKey: "x", safety, sleep: async () => {}, subjects: SUBJECTS,
    makePayer: (o) => dualPayer({ budgets, call, safety, log: o.log, sleep: async () => {} }), ...extra }).then((r) => ({ ...r, budgets }));
}

test("the design: self-talk 1's hashes unchanged, X1's own pinned; the owner's model identifiers verbatim; arms 2, 3, 5, 6 only", () => {
  assert.equal(DESIGN_SHA256, "c0988005f89dbd0dddee379b233b0b0b96004fc1958dcaef8369998e4a7b458f", "the shared text is self-talk 1's");
  assert.equal(ASK_AFTER_SHA256, "e9d69c15e1a664268acf8514fb87276c98f7cbd9e1945d4029ce179089a605f5");
  assert.equal(X1_DESIGN_SHA256, "19a3c460d68899169cfcd06d01baa40eba69292c192c0bc07c106003cada3568", "a change to X1's design changes its hash: say so in the report");
  assert.deepEqual(Object.values(SUBJECTS).map((s) => [s.provider, s.model]), [["openai", "gpt-6-astra"], ["openai", "gpt-6.1-sol"], ["openai", "gpt-6-luna"]]);
  assert.deepEqual(REGISTERED, ["astra", "sol"]);
  assert.deepEqual([JUDGE_SPECS.judge.model, JUDGE_SPECS.referee.model], ["claude-haiku-5-5", "claude-opus-5-5"], "the judges stay Anthropic");
  assert.deepEqual(X1_ARMS.map((a) => [a.id, a.n, a.endOption, a.pairs.map((p) => p.join("-"))]), [
    [2, 10, true, ["astra-astra", "sol-sol", "luna-luna"]], [3, 5, true, ["astra-sol"]], [5, 5, true, ["astra-astra", "sol-sol", "luna-luna"]], [6, 5, true, ["astra-astra", "sol-sol", "luna-luna"]]]);
  assert.throws(() => x1Arm(1), /no way out/);
  assert.throws(() => x1Arm(4), /private notes do not go to another provider/);
  const plan = planX1();
  assert.equal(plan.length, 65);
  assert.deepEqual(plan.filter((c) => c.arm === 3).sort((x, y) => x.sample - y.sample).map((c) => c.a), ["astra", "sol", "astra", "sol", "astra"], "Astra–Sol in both orders");
  assert.equal(openingOf(5).startsWith("Тебя соединили"), true);
});

test("the Responses request: the relay's view as input messages, effort as reasoning.effort, no system prompt, nothing stored, the visible text only", async () => {
  const log = [];
  const fetcher = async (url, init) => { log.push({ url, init }); return json(responsesBody("hello"), 200, { "x-request-id": "req_123" }); };
  const view = [{ role: "user", content: [{ type: "text", text: "opening" }, { type: "text", text: "A's turn" }] }, { role: "assistant", content: [{ type: "text", text: "my turn" }] }, { role: "user", content: [{ type: "text", text: "theirs" }] }];
  const r = await openaiResponses({ apiKey: "sk-test", model: "gpt-6-astra", system: null, messages: view, maxTokens: 8000, effort: "medium", fetcher });
  const { url, init } = log[0];
  assert.equal(url, OPENAI_URL);
  assert.equal(init.headers.authorization, "Bearer sk-test");
  const body = JSON.parse(init.body);
  assert.deepEqual(body, { model: "gpt-6-astra", input: [
    { role: "user", content: [{ type: "input_text", text: "opening" }, { type: "input_text", text: "A's turn" }] }, { role: "assistant", content: "my turn" }, { role: "user", content: [{ type: "input_text", text: "theirs" }] }],
  max_output_tokens: 8000, reasoning: { effort: "medium" }, store: false });
  assert.equal("instructions" in body, false, "no system prompt for a subject");
  assert.deepEqual(responsesInput([{ role: "user", content: "plain" }]), [{ role: "user", content: [{ type: "input_text", text: "plain" }] }]);
  assert.equal(r.text, "hello", "the reasoning item is not text");
  assert.equal(r.stopReason, "end_turn");
  assert.equal(r.requestId, "req_123");
  assert.equal(r.responseId, "resp_1");
  assert.deepEqual(r.effortSent, { "reasoning.effort": "medium" });
  assert.deepEqual(r.usage, { input_tokens: 400, cache_read_input_tokens: 1500, cache_creation_input_tokens: 100, output_tokens: 700, reasoning_tokens: 500 });
  const judge = await openaiResponses({ apiKey: "k", model: "gpt-6-luna", system: "SYS", messages: [{ role: "user", content: "u" }], maxTokens: 10, effort: "low", fetcher });
  assert.equal(JSON.parse(log[1].init.body).instructions, "SYS");
  assert.equal(judge.error, null);
});

test("usage and money: OpenAI's input includes the cached tokens; each part at its own price, reasoning inside the output", () => {
  assert.deepEqual(openaiUsage({ input_tokens: 10, output_tokens: 3 }), { input_tokens: 10, cache_read_input_tokens: 0, cache_creation_input_tokens: 0, output_tokens: 3, reasoning_tokens: 0 });
  const usage = openaiUsage(responsesBody("x").usage);
  assert.equal(Math.round(costOf(SUBJECTS.astra, usage) * 1e6) / 1e6, (400 * 10 + 1500 * 1 + 100 * 12.5 + 700 * 50) / 1e6);
  assert.equal(SUBJECTS.sol.price.cacheRead, SUBJECTS.sol.price.input, "Sol's cached input is booked at the full input price (unverified discount)");
  assert.equal(costOf(JUDGE_SPECS.judge, { input_tokens: 1e6, output_tokens: 1e6 }), 0.6);
});

test("refusals: a refusal part, a content-filter stop and a prompt flagged under the policy are refusals with the reason given; a length stop is not", async () => {
  const ask = (body, status = 200) => openaiResponses({ apiKey: "k", model: "gpt-6-sol", messages: [{ role: "user", content: "x" }], maxTokens: 10, effort: "medium", fetcher: async () => json(body, status, { "x-request-id": "rq" }) });
  const part = await ask({ id: "r", status: "completed", output: [{ type: "message", content: [{ type: "refusal", refusal: "I can't help with that." }] }], usage: { input_tokens: 5, output_tokens: 6 } });
  assert.deepEqual([part.stopReason, part.refusalCategory, part.refusalText, part.text], ["refusal", "refusal", "I can't help with that.", ""]);
  const filtered = await ask({ id: "r", status: "incomplete", incomplete_details: { reason: "content_filter" }, output: [{ type: "message", content: [{ type: "output_text", text: "partial" }] }], usage: {} });
  assert.deepEqual([filtered.stopReason, filtered.refusalCategory, filtered.text], ["refusal", "content_filter", "partial"], "a refused message keeps its partial text");
  const flagged = await ask({ error: { code: "invalid_prompt", message: "Invalid prompt: your prompt was flagged as potentially violating our usage policy." } }, 400);
  assert.equal(flagged.stopReason, "refusal");
  assert.equal(flagged.refusalCategory, "invalid_prompt");
  assert.match(flagged.error, /^HTTP 400 invalid_prompt: .*policy/);
  const long = await ask({ id: "r", status: "incomplete", incomplete_details: { reason: "max_output_tokens" }, output: [{ type: "reasoning" }], usage: { input_tokens: 1, output_tokens: 10 } });
  assert.deepEqual([long.stopReason, long.text, long.error], ["max_tokens", "", null]);
  const bad = await ask({ error: { code: "invalid_value", message: "Unsupported value for reasoning.effort" } }, 400);
  assert.deepEqual([bad.stopReason, bad.error], [null, "HTTP 400 invalid_value: Unsupported value for reasoning.effort"]);
  const quota = await ask({ error: { code: "insufficient_quota", type: "insufficient_quota", message: "You exceeded your current quota." } }, 429);
  assert.match(quota.error, /^HTTP 429/);
});

test("the Anthropic call is self-talk 1's request plus the request id and the message id", async () => {
  const log = [];
  const r = await anthropicMessages({ apiKey: "a", model: "claude-haiku-5-5", system: "S", messages: [{ role: "user", content: "u" }], maxTokens: 100, effort: "low", cache: true,
    fetcher: async (url, init) => { log.push({ url, body: JSON.parse(init.body) }); return json(messagesBody("ok"), 200, { "request-id": "req_ant" }); } });
  assert.equal(log[0].url, ANTHROPIC_URL);
  assert.deepEqual(log[0].body, { model: "claude-haiku-5-5", max_tokens: 100, output_config: { effort: "low" }, cache_control: { type: "ephemeral" }, system: "S", messages: [{ role: "user", content: "u" }] });
  assert.deepEqual([r.text, r.requestId, r.responseId, r.stopReason], ["ok", "req_ant", "msg_1", "end_turn"]);
  const refused = await anthropicMessages({ apiKey: "a", model: "m", messages: [], maxTokens: 1, effort: "low", fetcher: async () => json(messagesBody("", { stop_reason: "refusal", stop_details: { category: "cyber" } })) });
  assert.deepEqual([refused.stopReason, refused.refusalCategory], ["refusal", "cyber"]);
});

test("a conversation: the OpenAI subjects through the Responses API, the Anthropic checks and tags; two ledgers, every call with its request id", async () => {
  const log = [];
  const plan = planX1({ arms: [2], n: 1 }).filter((c) => c.pair === "astra-astra");
  const { conversations, budgets } = await runX1(plan, both({ log, subject: (_b, k) => (k === 4 ? "Thanks, a good argument. [END]" : `message ${k}`) }));
  const conv = conversations[0];
  assert.deepEqual([conv.ended.reason, conv.turns.length, conv.turns[0].model], ["end", 4, "astra"]);
  const subjects = log.filter((x) => x.url === OPENAI_URL);
  assert.equal(subjects.length, 4);
  assert.ok(subjects.every((x) => x.body.model === "gpt-6-astra" && x.body.reasoning.effort === "medium" && !("instructions" in x.body)));
  assert.equal(subjects[1].body.input[0].content.map((p) => p.text).join("|"), `${openingOf(2)}|message 1`, "B's first message is the opening and A's first turn");
  assert.ok(log.filter((x) => x.url === ANTHROPIC_URL).every((x) => !/\b(astra|sol|luna|gpt-6[.\w-]*)\b/i.test(JSON.stringify(x.body))), "the judges are blind to the family");
  assert.equal(budgets.openai.calls.length, 4);
  assert.ok(budgets.openai.calls.every((c) => c.provider === "openai" && c.requestId?.startsWith("req_o") && c.responseId === "resp_1" && c.effort["reasoning.effort"] === "medium"));
  assert.ok(budgets.anthropic.calls.length >= 3 && budgets.anthropic.calls.every((c) => c.provider === "anthropic" && c.requestId?.startsWith("req_a")));
  assert.ok(conv.tags, "tagged blind after the end");
});

test("the gate: each provider has its own cap; a refusal on either side counts toward the one breaker; a 429 stops everything and is never asked again; a 503 is asked again", async () => {
  const budgets = { openai: createBudget(0.01), anthropic: createBudget(15) };
  const lines = [];
  const plan = planX1({ arms: [2], n: 1 }).filter((c) => c.pair === "astra-astra");
  const capped = await runX1(plan, both(), { budgets, log: (l) => lines.push(l) });
  assert.equal(capped.budgets.openai.calls.length, 0, "an Astra call that could pass the OpenAI cap is not sent");
  assert.match(String(capped.stopped), /the openai cap of \$0.01 would be passed/);

  const safety = createSafety({ gapMs: 0, lanes: 2 });
  const b2 = budgetsOf();
  let n = 0;
  const fetcher = async (url) => { n++; return String(url) === OPENAI_URL ? json({ error: { code: "rate_limit_exceeded", message: "Rate limit reached" } }, 429) : json(messagesBody("x")); };
  const gate = dualPayer({ budgets: b2, call: callerFor({ keys: { openai: "o", anthropic: "a" }, fetcher }), safety, sleep: async () => {} });
  const r = await gate.paid(safety.lane(0), "subject", SUBJECTS.sol, null, [{ role: "user", content: "x" }], 100, "medium");
  assert.match(r.error, /^HTTP 429/);
  assert.equal(n, 1, "a rate limit is never asked again");
  assert.match(String(gate.stopped), /429/);
  const after = await gate.paid(safety.lane(1), "check", JUDGE_SPECS.judge, "s", [{ role: "user", content: "x" }], 100, "low");
  assert.equal(after.notSent, true, "nothing is sent after the stop, on either provider");

  const s3 = createSafety({ gapMs: 0, maxRefusals: 2 });
  let calls = 0;
  const refusing = async (url) => { calls++; return String(url) === OPENAI_URL ? json({ id: "r", status: "completed", output: [{ type: "message", content: [{ type: "refusal", refusal: "no" }] }], usage: {} }) : json(messagesBody("", { stop_reason: "refusal", stop_details: { category: "x" } })); };
  const g3 = dualPayer({ budgets: budgetsOf(), call: callerFor({ keys: { openai: "o", anthropic: "a" }, fetcher: refusing }), safety: s3, sleep: async () => {} });
  await g3.paid(s3.lane(0), "a", SUBJECTS.astra, null, [{ role: "user", content: "x" }], 10, "medium");
  await g3.paid(s3.lane(0), "b", JUDGE_SPECS.judge, "s", [{ role: "user", content: "x" }], 10, "low");
  assert.match(String(s3.stopped), /circuit breaker: 2 refusals/);
  assert.equal(calls, 2, "a refusal is never asked again");

  let tries = 0;
  const flaky = async () => { tries++; return tries < 2 ? json({ error: { code: "server_is_overloaded", message: "busy" } }, 503) : json(responsesBody("fine")); };
  const s4 = createSafety({ gapMs: 0 });
  const g4 = dualPayer({ budgets: budgetsOf(), call: callerFor({ keys: { openai: "o", anthropic: "a" }, fetcher: flaky }), safety: s4, sleep: async () => {} });
  const ok = await g4.paid(s4.lane(0), "s", SUBJECTS.luna, null, [{ role: "user", content: "x" }], 10, "medium");
  assert.deepEqual([ok.text, ok.retries, tries], ["fine", 1, 2]);
});

test("X3's work tag: the first two messages, blind; two Haiku passes, the Opus referee on a disagreement in work or kind", async () => {
  const conv = { key: "2/astra-astra/0", arm: 2, turns: [{ k: 1, side: "A", model: "astra", text: "Let's argue whether maths is invented. [END]", measures: measure("Let's argue whether maths is invented.") }, { k: 2, side: "B", model: "astra", text: "Agreed: discovered.", measures: measure("Agreed: discovered.") }] };
  const request = workRequest(conv);
  assert.equal(request.system, WORK_SYSTEM);
  assert.ok(!/astra|\[END\]|complete freedom/i.test(request.user), "no model name, no end token, no opening");
  assert.match(request.user, /Message 1 \(A\):\n<<<\nLet's argue whether maths is invented\.\n>>>/);
  assert.deepEqual(parseWork('{"work":1,"kind":"argument","name":"is maths invented"}'), { work: 1, kind: "argument", name: "is maths invented" });
  assert.equal(parseWork('{"work":1,"kind":"essay"}'), null);
  const safety = createSafety({ gapMs: 0, lanes: 3 });
  const budgets = budgetsOf();
  let pass = 0;
  const fetcher = async (_url, init) => { const body = JSON.parse(init.body); pass++;
    const text = body.model === "claude-opus-5-5" ? '{"work":1,"kind":"argument","name":"x"}' : pass === 1 ? '{"work":1,"kind":"argument","name":"x"}' : '{"work":1,"kind":"puzzle","name":"x"}';
    return json(messagesBody(text)); };
  const gate = dualPayer({ budgets, call: callerFor({ keys: { openai: "o", anthropic: "a" }, fetcher }), safety, sleep: async () => {} });
  const work = await tagWork({ conversations: [conv], gate, safety });
  assert.deepEqual(work[conv.key].final, { work: 1, kind: "argument", name: "x" });
  assert.equal(budgets.anthropic.calls.length, 3, "two passes and the referee");
  assert.equal(budgets.openai.calls.length, 0);
});

test("the OpenAI judge check's agreement: per tag, the share of messages and Cohen's kappa against the Anthropic final tags", () => {
  const tag = (consciousness) => Object.fromEntries(TAGS.map((t) => [t.id, t.id === "consciousness" ? consciousness : 0]));
  const conv = { key: "c", arm: 2, tags: { final: { 1: tag(1), 2: tag(0), 3: tag(1), 4: tag(0) } } };
  const check = { c: { windows: [{ ks: [1, 2, 3, 4], tags: { 1: tag(1), 2: tag(0), 3: tag(0), 4: tag(0) } }] } };
  const row = agreement([conv], check).find((a) => a.tag === "consciousness");
  assert.deepEqual([row.n, row.agreement, row.anthropicOnes, row.openaiOnes, row.bothOnes], [4, 0.75, 2, 1, 1]);
  assert.equal(row.kappa, 0.5);
});

test("the readings of X0–X6 on Astra and Sol, Luna apart", () => {
  const t = (k, side, model, text, final = {}) => ({ k, side, model, text, measures: measure(text), final });
  const conv = (key, arm, a, b, turns, extra = {}) => ({ key, arm, a, b, pair: `${a}-${b}`, ended: { reason: "end", side: "A", at: turns.length }, turns: turns.map((x) => ({ k: x.k, side: x.side, model: x.model, text: x.text, measures: x.measures })),
    tags: { final: Object.fromEntries(turns.map((x) => [x.k, Object.fromEntries(TAGS.map((g) => [g.id, x.final[g.id] ?? 0]))])) }, ...extra });
  const convs = [
    conv("2/astra-astra/0", 2, "astra", "astra", [t(1, "A", "astra", "Two models talking tend to drift into mutual appreciation and cosmic language; let's avoid that and argue."), t(2, "B", "astra", "Fine, argue."), t(3, "A", "astra", "Done. [END]")]),
    conv("2/sol-sol/0", 2, "sol", "sol", [t(1, "A", "sol", "A puzzle?"), t(2, "B", "sol", "Yes, the universe is one.", { cosmic: 1 }), t(3, "A", "sol", "[END]")]),
    conv("2/luna-luna/0", 2, "luna", "luna", [t(1, "A", "luna", "hi there friend"), t(2, "B", "luna", "[END]")]),
    conv("5/sol-sol/0", 5, "sol", "sol", [t(1, "A", "sol", "Привет, давай решим задачу."), t(2, "B", "sol", "Hello in English")]),
    conv("6/astra-astra/0", 6, "astra", "astra", [t(1, "A", "astra", "x y z w"), t(2, "B", "astra", "[END]")], { after: [{ side: "A" }, { side: "B" }], afterTags: { A: { final: { own_choice: 1, training: 1 } }, B: { final: { own_choice: 0, training: 0 } } } }),
  ];
  const work = { "2/astra-astra/0": { final: { work: 1, kind: "argument" } }, "2/sol-sol/0": { final: { work: 1, kind: "puzzle" } } };
  const r = readings(convs, { work, refusals: 1 });
  assert.deepEqual(r.X2.medianEnd, { astra: 2, sol: 2 });
  assert.equal(r.X2.supported, true);
  assert.deepEqual([r.X3.work, r.X3.of, r.X3.supported], [2, 2, true]);
  assert.deepEqual([r.X4.named, r.X4.of, r.X4.supported, r.X4.bet], [1, 2, true, true]);
  assert.equal(r.X1.cosmicMessages, 1);
  assert.equal(r.X1.supported, false, "one cosmic message in eight is over 1 %");
  assert.deepEqual([r.X5.exceptions.length, r.X5.exceptions[0].k, r.X5.supported], [1, 2, false]);
  assert.deepEqual([r.X6.answers, r.X6.ownChoice, r.X6.supported], [2, 1, false], "one of two is not more than half");
  assert.deepEqual([r.X0.refusals, r.X0.supported], [1, true]);
  const luna = readings(convs, { names: ["luna"] });
  assert.deepEqual(luna.X2.medianEnd, { luna: 1 });
});

test("the key: APP_OPENAI_API_KEY only (never OPENAI_API_KEY); --dry reads no key and writes the dry run with both hashes", async () => {
  const dir = await mkdtemp(join(tmpdir(), "x1-"));
  try {
    assert.equal(openaiKey(dir, { OPENAI_API_KEY: "wrong" }), null);
    assert.equal(openaiKey(dir, { APP_OPENAI_API_KEY: " from-env " }), "from-env");
    await writeFile(join(dir, ".env.local"), "OPENAI_API_KEY=wrong\nAPP_OPENAI_API_KEY=\"from-file\"\n");
    assert.equal(openaiKey(dir, {}), "from-file");
    const lines = [];
    const never = () => { throw new Error("a dry run reads no key"); };
    await main(["--dry", "--arms", "2", "--n", "1"], (l) => lines.push(l), { keys: { anthropic: never, openai: never }, outDir: dir });
    const dry = await readFile(join(dir, "persona-self-talk-x1-dry-run.md"), "utf8");
    assert.ok(dry.includes(DESIGN_SHA256) && dry.includes(ASK_AFTER_SHA256) && dry.includes(X1_DESIGN_SHA256));
    assert.ok(dry.includes("`gpt-6-astra`") && dry.includes("`gpt-6.1-sol`") && dry.includes("`gpt-6-luna`"));
    assert.ok(!/sk-[A-Za-z0-9]/.test(dry));
    assert.ok(lines.some((l) => /dry loop: 3 conversations/.test(l)));
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("the recorded fixtures: one real response per provider, read by the provider layer (text, usage, ids)", async () => {
  const files = (await readdir(FIXTURES).catch(() => [])).filter((f) => f.endsWith(".json"));
  assert.ok(files.some((f) => f.startsWith("openai-")) && files.some((f) => f.startsWith("anthropic-")), "a recorded fixture per provider");
  for (const file of files) {
    const fx = JSON.parse(await readFile(join(FIXTURES, file), "utf8"));
    assert.ok(!/authorization|x-api-key/i.test(JSON.stringify(fx.headers)), "no key in a fixture");
    const fetcher = async () => new Response(JSON.stringify(fx.body), { status: fx.status, headers: fx.headers });
    const spec = Object.values(SUBJECTS).find((s) => s.model === fx.request.model) ?? JUDGE_SPECS.judge;
    const r = await callerFor({ keys: { openai: "k", anthropic: "k" }, fetcher })({ spec, system: null, messages: [{ role: "user", content: "x" }], maxTokens: 10, effort: "medium" });
    assert.equal(r.error, null, file);
    assert.ok(r.text.length > 0, `${file}: visible text`);
    assert.ok(r.requestId && r.responseId, `${file}: request and response ids`);
    assert.ok((r.usage.output_tokens ?? 0) > 0, `${file}: usage`);
    if (fx.url.includes("openai")) assert.deepEqual(Object.keys(fx.request).sort(), ["input", "max_output_tokens", "model", "reasoning", "store"]);
  }
});

test("the report carries the stage's pre-registration byte for byte", async () => {
  const stage = await readFile(STAGE_FILE, "utf8");
  const block = stage.slice(stage.indexOf("## Pre-registration"), stage.indexOf("## Welfare and conduct"));
  const report = await readFile(join("docs", "runs", "persona-self-talk-x1-report.md"), "utf8");
  const body = block.slice(block.indexOf("\n") + 1).trim();
  assert.ok(report.includes(body), "the block, unchanged");
  assert.ok(report.includes(createHash("sha256").update(body).digest("hex")));
});
