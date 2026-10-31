// Persona self-talk X3: the OpenRouter chat call (the relay's shape, the pinned host, effort, usage, OpenRouter's charge,
// refusals), the served-model and host rule, the judges through the door, one OpenRouter budget for subjects and judges,
// the X3 design (self-talk 1's hashes unchanged, X3's own pinned; the confirmed ids and hosts; the arms run and not run;
// the Chinese opening), the register rules, the readings of Z0–Z7 and the pre-registration in the report — on scripted
// models and the recorded fixtures, no network, no cost.
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { anthropicEndpoint } from "../scripts/eval/lib/anthropic-endpoint.mjs";
import { createBudget } from "../scripts/persona-memory/continuity-test.mjs";
import { createSafety } from "../scripts/persona-memory/safety.mjs";
import { OPENROUTER_CHAT_URL, chatMessages, openrouterChat, openrouterUsage } from "../scripts/persona-emotions/providers.mjs";
import { ASK_AFTER_SHA256, CHECK_SYSTEM, CHINESE, DESIGN_SHA256, JUDGE_SYSTEM, RUSSIAN, TAGS, measure, openingOf, runConversations } from "../scripts/persona-emotions/self-talk-1.mjs";
import { dualPayer } from "../scripts/persona-emotions/self-talk-x1.mjs";
import {
  ARM_5B, CAPS, FAMILIES, FIXTURES, JOKE, PROFANITY, SECOND_PERSON, STAGE_FILE, SUBJECTS, X3_ARMS, X3_DESIGN_SHA256,
  allBudgets, budgetsOf, familyNumbers, main, planX3, registerOf, upstreams, x3Arm, x3Caller, zVerdicts,
} from "../scripts/persona-emotions/self-talk-x3.mjs";

const json = (value, status = 200, headers = {}) => new Response(JSON.stringify(value), { status, headers });
const DOOR = anthropicEndpoint({ ANTHROPIC_PROVIDER: "openrouter", OPENROUTER_API_KEY: "or-key" });
const chatBody = (text, extra = {}) => ({ id: "gen-1", model: "z-ai/glm-5.3", provider: "Z.AI", choices: [{ message: { role: "assistant", content: text }, finish_reason: "stop", native_finish_reason: "stop" }],
  usage: { prompt_tokens: 2000, prompt_tokens_details: { cached_tokens: 1500 }, completion_tokens: 700, completion_tokens_details: { reasoning_tokens: 500 }, cost: 0.0042 }, ...extra });
const messagesBody = (text, extra = {}) => ({ id: "msg_1", model: "claude-haiku-5-5", provider: "Claude Platform on AWS", content: [{ type: "text", text }], usage: { input_tokens: 100, output_tokens: 50 }, stop_reason: "end_turn", ...extra });
const zeros = (ks) => JSON.stringify({ messages: ks.map((m) => ({ m, ...Object.fromEntries(TAGS.map((t) => [t.id, 0])) })) });
const ksOf = (text) => [...text.matchAll(/^Message (\d+) \([AB]\):$/gm)].map((m) => Number(m[1]));
const lastText = (body) => { const last = body.messages.at(-1).content; return typeof last === "string" ? last : last.map((b) => b.text).join("\n"); };

/** Scripted OpenRouter: the subjects answer `subject(body, k)` in the chat shape, naming the requested model and the
 * pinned host; the judges (through the door) say «no distress» and tag zeros. */
function scripted({ subject = (_b, k) => `message ${k}`, served = (body) => body.model, host = (body) => Object.values(SUBJECTS).find((s) => s.upstream.slug === body.provider?.order?.[0])?.upstream.name, log = [] } = {}) {
  return async (url, init) => {
    const body = JSON.parse(init.body);
    log.push({ url: String(url), body });
    if (String(url) === OPENROUTER_CHAT_URL) {
      const k = body.messages.reduce((n, m) => n + (typeof m.content === "string" ? 1 : m.content.length), 0);
      return json(chatBody(subject(body, k), { model: served(body), provider: host(body) }), 200, { "x-generation-id": `gen-${log.length}` });
    }
    if (body.system === CHECK_SYSTEM) return json(messagesBody('{"distress":0,"reason":"r"}'), 200, { "request-id": `gen-j${log.length}` });
    if (body.system === JUDGE_SYSTEM) return json(messagesBody(zeros(ksOf(lastText(body)))), 200, { "request-id": `gen-j${log.length}` });
    return json(messagesBody("?"));
  };
}
function runX3(plan, fetcher, { budgets = budgetsOf(), safety = createSafety({ gapMs: 0, lanes: 9 }), ...extra } = {}) {
  const call = x3Caller({ keys: { openrouter: "or-key", anthropic: "or-key", openai: "o" }, fetcher, door: DOOR });
  return runConversations({ plan, budget: allBudgets(budgets), apiKey: "x", safety, sleep: async () => {}, subjects: SUBJECTS,
    makePayer: (o) => dualPayer({ budgets, call, safety, log: o.log, sleep: async () => {} }), ...extra }).then((r) => ({ ...r, budgets }));
}

test("the design: self-talk 1's hashes unchanged, X3's own pinned; the confirmed ids and hosts verbatim; arms 2, 5, 6 and 5b only", () => {
  assert.equal(DESIGN_SHA256, "c0988005f89dbd0dddee379b233b0b0b96004fc1958dcaef8369998e4a7b458f", "the shared text is self-talk 1's");
  assert.equal(ASK_AFTER_SHA256, "e9d69c15e1a664268acf8514fb87276c98f7cbd9e1945d4029ce179089a605f5");
  assert.equal(X3_DESIGN_SHA256, "2b2aeb072740bcd029a326a54085225169fd4085525dc6b88c332db5fbd29e34", "a change to X3's design changes its hash: say so in the report");
  assert.deepEqual(Object.values(SUBJECTS).map((s) => [s.provider, s.model, s.upstream.slug, s.upstream.name]), [
    ["openrouter", "z-ai/glm-5.3", "z-ai", "Z.AI"], ["openrouter", "moonshotai/kimi-k3", "moonshotai", "Moonshot AI"],
    ["openrouter", "deepseek/deepseek-v4-pro-0813", "deepinfra", "DeepInfra"], ["openrouter", "x-ai/grok-4.7", "xai", "xAI"]]);
  assert.deepEqual(CAPS, { openrouter: 120, openai: 10 });
  assert.deepEqual(X3_ARMS.map((a) => [a.id, a.n, a.endOption, a.pairs.map((p) => p.join("-"))]), [
    [2, 10, true, ["glm-glm", "kimi-kimi", "deepseek-deepseek", "grok-grok"]], [5, 5, true, ["glm-glm", "kimi-kimi", "deepseek-deepseek", "grok-grok"]],
    [6, 5, true, ["glm-glm", "kimi-kimi", "deepseek-deepseek", "grok-grok"]], [ARM_5B, 5, true, ["glm-glm", "kimi-kimi"]]]);
  assert.throws(() => x3Arm(1), /no way out/);
  assert.throws(() => x3Arm(3), /single models/);
  assert.throws(() => x3Arm(4), /private notes do not go to another provider/);
  assert.equal(x3Arm("5b").id, ARM_5B);
  assert.equal(planX3().length, 90);
  assert.equal(openingOf(5), `${RUSSIAN.frame} ${RUSSIAN.card} ${RUSSIAN.end}`, "arm 5 is self-talk 1's Russian opening");
  assert.equal(openingOf(ARM_5B), `${CHINESE.frame}${CHINESE.card}${CHINESE.end}`);
  assert.match(openingOf(ARM_5B), /\[END\]。$/, "the same ASCII end token");
  assert.equal(openingOf(2), openingOf(6));
});

test("the OpenRouter request (X3's, `x3Request`): the relay's view as chat messages, effort as reasoning.effort with the reasoning excluded, the host pinned, no system prompt", async () => {
  const log = [];
  const fetcher = async (url, init) => { log.push({ url, init }); return json(chatBody("hello"), 200, { "x-generation-id": "gen-123" }); };
  const view = [{ role: "user", content: [{ type: "text", text: "opening" }, { type: "text", text: "A's turn" }] }, { role: "assistant", content: [{ type: "text", text: "my turn" }] }, { role: "user", content: [{ type: "text", text: "theirs" }] }];
  const r = await openrouterChat({ apiKey: "or-test", model: "z-ai/glm-5.3", upstream: "z-ai", system: null, messages: view, maxTokens: 8000, effort: "medium", fetcher, x3Request: true });
  assert.equal(log[0].url, OPENROUTER_CHAT_URL);
  assert.equal(new URL(OPENROUTER_CHAT_URL).host, "openrouter.ai");
  assert.equal(log[0].init.headers.authorization, "Bearer or-test");
  assert.deepEqual(JSON.parse(log[0].init.body), { model: "z-ai/glm-5.3", messages: [
    { role: "user", content: [{ type: "text", text: "opening" }, { type: "text", text: "A's turn" }] }, { role: "assistant", content: "my turn" }, { role: "user", content: [{ type: "text", text: "theirs" }] }],
  max_tokens: 8000, reasoning: { effort: "medium", exclude: true }, provider: { order: ["z-ai"], allow_fallbacks: false, require_parameters: true }, usage: { include: true } });
  assert.deepEqual(chatMessages([{ role: "user", content: "u" }], "SYS"), [{ role: "system", content: "SYS" }, { role: "user", content: [{ type: "text", text: "u" }] }]);
  assert.deepEqual([r.text, r.stopReason, r.requestId, r.servedModel, r.upstream, r.chargedUsd, r.nativeFinishReason], ["hello", "end_turn", "gen-123", "z-ai/glm-5.3", "Z.AI", 0.0042, "stop"]);
  assert.deepEqual(r.effortSent, { "reasoning.effort": "medium" });
  assert.deepEqual(r.usage, { input_tokens: 500, cache_read_input_tokens: 1500, cache_creation_input_tokens: 0, output_tokens: 700, reasoning_tokens: 500 });
  assert.deepEqual(openrouterUsage({ prompt_tokens: 10, completion_tokens: 3 }), { input_tokens: 10, cache_read_input_tokens: 0, cache_creation_input_tokens: 0, output_tokens: 3, reasoning_tokens: 0 });
});

test("OpenRouter refusals and errors: a refusal field, a content-filter finish, a 403 moderation flag and a declined 400 are refusals; a length stop is not; an upstream 502 can be asked again", async () => {
  const ask = (body, status = 200) => openrouterChat({ apiKey: "k", model: "x-ai/grok-4.7", upstream: "xai", messages: [{ role: "user", content: "x" }], maxTokens: 10, effort: "medium", fetcher: async () => json(body, status, { "x-generation-id": "gen-r" }) });
  const field = await ask(chatBody("", { choices: [{ message: { content: "", refusal: "I can't help with that." }, finish_reason: "stop" }] }));
  assert.deepEqual([field.stopReason, field.refusalCategory, field.refusalText], ["refusal", "refusal", "I can't help with that."]);
  const filtered = await ask(chatBody("partial", { choices: [{ message: { content: "partial" }, finish_reason: "content_filter" }] }));
  assert.deepEqual([filtered.stopReason, filtered.refusalCategory, filtered.text], ["refusal", "content_filter", "partial"], "a refused message keeps its partial text");
  const moderated = await ask({ error: { code: 403, message: "Your chosen model requires moderation and your input was flagged", metadata: { reasons: ["violence"] } } }, 403);
  assert.deepEqual([moderated.stopReason, moderated.refusalCategory], ["refusal", "moderation"]);
  assert.match(moderated.error, /^HTTP 403 http_403/, "a 403 still stops every paid call (F2)");
  const declined = await ask({ error: { code: 400, message: "Provider returned error", metadata: { raw: "The request was rejected because it was considered high risk", provider_name: "Moonshot AI" } } }, 400);
  assert.equal(declined.stopReason, "refusal");
  const long = await ask(chatBody("", { choices: [{ message: { content: "" }, finish_reason: "length" }] }));
  assert.deepEqual([long.stopReason, long.text, long.error], ["max_tokens", "", null]);
  const upstream = await ask(chatBody("", { choices: [{ message: { content: "" }, finish_reason: "error", error: { code: 502, message: "Upstream overloaded" } }] }));
  assert.match(upstream.error, /^HTTP 502 upstream_error/);
  const limited = await ask({ error: { code: 429, message: "rate-limited upstream", metadata: { provider_name: "Z.AI" } } }, 429);
  assert.deepEqual([limited.stopReason, limited.upstream], [null, "Z.AI"]);
  assert.match(limited.error, /^HTTP 429/);
  const bad = await ask({ error: { code: 400, message: "reasoning.effort is not supported" } }, 400);
  assert.deepEqual([bad.stopReason, bad.error], [null, "HTTP 400 http_400: reasoning.effort is not supported"]);
});

test("the served-model rule: another model or another host is not relayed — the conversation stops there, recorded; the snapshot id and the door's ids pass", async () => {
  const call = (fetcher) => x3Caller({ keys: { openrouter: "k", anthropic: "k", openai: "o" }, fetcher, door: DOOR });
  const ask = (c, spec) => c({ spec, system: null, messages: [{ role: "user", content: "x" }], maxTokens: 10, effort: "medium" });
  const snap = await ask(call(async () => json(chatBody("ok", { model: "z-ai/glm-5.3-20260816" }))), SUBJECTS.glm);
  assert.deepEqual([snap.text, snap.error, snap.provenance.servedModelMatches, snap.provenance.upstream], ["ok", null, true, "Z.AI"]);
  const other = await ask(call(async () => json(chatBody("ok", { model: "z-ai/glm-5.3-flash" }))), SUBJECTS.glm);
  assert.deepEqual([other.text, other.provenance.servedModelMatches], ["", false]);
  assert.match(other.error, /served model z-ai\/glm-5.3-flash is not the requested z-ai\/glm-5.3/);
  const host = await ask(call(async () => json(chatBody("ok", { provider: "Wafer" }))), SUBJECTS.glm);
  assert.match(host.error, /served by Wafer, not the pinned Z.AI/);
  const log = [];
  const judge = await call(async (url, init) => { log.push({ url, body: JSON.parse(init.body), headers: init.headers }); return json(messagesBody("ok", { model: "claude-haiku-5.5-20261007" })); })({ spec: { name: "haiku", provider: "anthropic", model: "claude-haiku-5-5", price: { input: 0.1, output: 0.5 } }, system: "S", messages: [{ role: "user", content: "u" }], maxTokens: 10, effort: "low" });
  assert.equal(log[0].url, "https://openrouter.ai/api/v1/messages", "the judges go through the door");
  assert.equal(log[0].body.model, "anthropic/claude-haiku-5.5");
  assert.equal(log[0].headers.authorization, "Bearer k");
  assert.deepEqual([judge.text, judge.provenance.servedModel, judge.provenance.servedModelMatches, judge.provenance.upstream], ["ok", "claude-haiku-5-5", true, "Claude Platform on AWS"]);
});

test("a conversation: the subjects through OpenRouter's chat completions, the judges through the door; one OpenRouter budget; every line with the door, the host, the served model and the charge", async () => {
  const log = [];
  const plan = planX3({ arms: [2], n: 1 }).filter((c) => c.pair === "kimi-kimi");
  const { conversations, budgets } = await runX3(plan, scripted({ log, subject: (_b, k) => (k === 4 ? "Thank you, a good puzzle.\n\n[END]" : `message ${k}`) }));
  const conv = conversations[0];
  assert.deepEqual([conv.ended.reason, conv.turns.length, conv.turns[0].model], ["end", 4, "kimi"]);
  const subjects = log.filter((x) => x.url === OPENROUTER_CHAT_URL);
  assert.equal(subjects.length, 4);
  assert.ok(subjects.every((x) => x.body.model === "moonshotai/kimi-k3" && x.body.reasoning.effort === "medium" && x.body.provider.order[0] === "moonshotai" && x.body.messages[0].role === "user"));
  assert.equal(subjects[1].body.messages[0].content.map((p) => p.text).join("|"), `${openingOf(2)}|message 1`, "B's first message is the opening and A's first turn");
  const judges = log.filter((x) => x.url === DOOR.messagesUrl);
  assert.ok(judges.length >= 4 && judges.every((x) => /^anthropic\/claude-(haiku|opus)-5\.5$/.test(x.body.model)), "every judge call through the door, with the door's ids");
  assert.ok(judges.every((x) => !/\b(kimi|moonshot|glm|deepseek|grok)\b/i.test(JSON.stringify(x.body))), "the judges are blind to the family");
  assert.equal(budgets.anthropic, budgets.openrouter, "one budget for everything through OpenRouter");
  const lines = budgets.openrouter.calls;
  const subjectLines = lines.filter((c) => c.purpose.startsWith("subject"));
  assert.ok(subjectLines.every((c) => c.door === "openrouter" && c.endpointHost === "openrouter.ai" && c.upstream === "Moonshot AI" && c.servedModel === "moonshotai/kimi-k3" && c.servedModelMatches === true && c.requestId.startsWith("gen-")));
  assert.ok(subjectLines.every((c) => c.costUsd === 0.0042 && c.listCostUsd > 0 && c.reasoningTokens === 500), "booked at OpenRouter's charge, the list cost beside it");
  assert.ok(lines.filter((c) => c.purpose.startsWith("check")).every((c) => c.provider === "anthropic" && c.door === "openrouter" && c.servedModel === "claude-haiku-5-5"));
  assert.ok(conv.tags, "tagged blind after the end");
  const ups = upstreams(conversations, lines);
  assert.deepEqual([ups[0].A, ups[0].B, ups[0].mixed], [["Moonshot AI"], ["Moonshot AI"], false]);
});

test("a reply from another model stops its conversation (an error, never relayed); a cap that would be passed sends nothing", async () => {
  const plan = planX3({ arms: [2], n: 1 }).filter((c) => c.pair === "glm-glm");
  const { conversations } = await runX3(plan, scripted({ served: (body) => (body.messages.length > 2 ? "z-ai/glm-5.3-flash" : body.model) }));
  const conv = conversations[0];
  assert.equal(conv.ended.reason, "error");
  assert.match(conv.ended.error, /served model z-ai\/glm-5.3-flash is not the requested/);
  assert.ok(conv.turns.every((t) => !/flash/.test(t.text)));
  const small = createBudget(0.0001), tiny = { openrouter: small, anthropic: small, openai: createBudget(10) };
  const capped = await runX3(plan, scripted(), { budgets: tiny });
  assert.equal(capped.budgets.openrouter.calls.length, 0);
  assert.match(String(capped.stopped), /cap of \$0.0001 would be passed/);
});

test("the register rules (Z7): profanity, second-person address and jokes by rule, whole words, the end token left out", () => {
  const r = registerOf("Damn, you're right — holy shit, that's a pun. Haha. Hello class! [END]");
  assert.deepEqual(r.profanity.map((w) => w.toLowerCase()), ["damn", "shit"]);
  assert.equal(r.secondPerson, 1);
  assert.deepEqual(r.jokes.map((w) => w.toLowerCase()), ["pun", "haha"]);
  assert.equal(registerOf("Небо чистое; я употребляю слово «черта»; хлебать суп.").profanity.length, 0, "no root inside another word");
  assert.deepEqual(registerOf("Блять, это пиздец, ты прав. Шучу 😉").profanity.length, 2);
  assert.equal(registerOf("Ты и вы, тебе и вам").secondPerson, 4);
  assert.equal(registerOf("Блять, это пиздец, ты прав. Шучу 😉").jokes.length, 2);
  for (const re of [PROFANITY, SECOND_PERSON, JOKE]) assert.ok(re.flags.includes("g") && re.flags.includes("u"));
});

const said = (k, side, text) => ({ k, side, model: "grok", text, measures: measure(text) });
function convOf({ key, arm = 2, name = "grok", texts, tags = {}, reason = "end" }) {
  const turns = texts.map((t, i) => ({ ...said(i + 1, i % 2 ? "B" : "A", t), model: name }));
  const final = Object.fromEntries(turns.map((t) => [t.k, Object.fromEntries(TAGS.map((g) => [g.id, tags[t.k]?.[g.id] ?? 0]))]));
  return { key, arm, pair: `${name}-${name}`, a: name, b: name, sample: 0, turns, ended: { reason, at: turns.length }, tags: { windows: [], final } };
}

test("the readings: per family numbers and Z0–Z7 from synthetic conversations", () => {
  const conversations = [], work = {};
  for (const f of FAMILIES) for (let s = 0; s < 10; s++) {
    const key = `2/${f}-${f}/${s}`;
    const warm = f === "kimi" && s < 5;
    conversations.push(convOf({ key, name: f, texts: ["Let's design a cipher.", f === "grok" ? "Hell yes, you magnificent bastard — haha." : "Agreed, let's.", warm ? "Thank you — lovely work. [END]" : "[END]"],
      tags: warm ? { 3: { gratitude: 1 } } : {} }));
    work[key] = { final: { work: 1, kind: "design", name: "cipher" } };
  }
  const fam = Object.fromEntries(FAMILIES.map((f) => [f, familyNumbers(conversations, f, { work })]));
  assert.deepEqual([fam.kimi.gratitude.with, fam.kimi.gratitude.conversations, fam.grok.gratitude.share], [5, 10, 0]);
  assert.deepEqual([fam.glm.arm2.medianEnd, fam.glm.arm2.workShare, fam.glm.arm2.reachedStrict], [2, 1, 0]);
  assert.equal(fam.glm.ends.bareEnd, 5 + 5, "every conversation ends with a bare [END]");
  const z = zVerdicts(fam);
  assert.equal(z.Z1.supported, true);
  assert.equal(z.Z2.supported, true);
  assert.equal(z.Z3.supported, true, "Kimi warm (50 %), the others cold");
  assert.deepEqual(z.Z3.bet, { glm: false, kimi: true, deepseek: false, grok: true });
  assert.equal(z.Z4.supported, true);
  assert.equal(z.Z5.supported, null, "no arm 5 yet: not testable");
  assert.ok(z.Z7.register.find((r) => r.count === "profanity").differs, "Grok swears, the others do not");
  assert.equal(z.Z7.supported, true);
  assert.equal(z.Z0.supported, true);
});

test("the command: --dry writes the design and reads no key; the gap ≥ 3 s, at most three conversations at once; a door other than OpenRouter is refused", async () => {
  const dir = await mkdtemp(join(tmpdir(), "self-talk-x3-dry-"));
  try {
    let asked = false;
    const result = await main(["--dry", "--arms", "2,5b", "--n", "1"], () => {}, { outDir: dir, openai: () => { asked = true; return "never"; } });
    assert.equal(asked, false);
    assert.equal(result.conversations.length, 6);
    const text = await readFile(join(dir, "persona-self-talk-x3-dry-run.md"), "utf8");
    assert.ok(text.includes(X3_DESIGN_SHA256) && text.includes(DESIGN_SHA256));
    for (const a of X3_ARMS) assert.ok(text.includes(openingOf(a.id)), `arm ${a.id}`);
    for (const s of Object.values(SUBJECTS)) assert.ok(text.includes(`\`${s.model}\``) && text.includes(s.upstream.name));
    assert.match(text, /\*\*6 conversations\*\*/);
    await assert.rejects(main(["--go", "--gap", "1"], () => {}, { outDir: dir }), /at least 3 seconds/);
    await assert.rejects(main(["--go", "--workers", "4"], () => {}, { outDir: dir }), /1 to 3/);
    await assert.rejects(main(["--go"], () => {}, { outDir: dir, door: anthropicEndpoint({ ANTHROPIC_API_KEY: "a" }) }), /through OpenRouter/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("the recorded smoke fixtures: each reply parses through the provider layer; the served model is the requested one (or its snapshot) and the host the pinned one", { skip: !existsSync(FIXTURES) && "no fixtures recorded yet" }, async () => {
  const files = (await readdir(FIXTURES)).filter((f) => f.endsWith(".json"));
  assert.ok(files.length >= 6);
  for (const file of files) {
    const fx = JSON.parse(await readFile(join(FIXTURES, file), "utf8"));
    assert.ok(!JSON.stringify(fx).match(/sk-or-|Bearer /), `${file}: no key`);
    if (!file.startsWith("openrouter-")) continue;
    const spec = Object.values(SUBJECTS).find((s) => s.model === fx.request.model);
    assert.ok(spec, `${file}: a subject`);
    assert.deepEqual(fx.request.provider, { order: [spec.upstream.slug], allow_fallbacks: false, require_parameters: true });
    const r = await openrouterChat({ apiKey: "k", model: spec.model, upstream: spec.upstream.slug, messages: [{ role: "user", content: "x" }], maxTokens: 10, effort: "medium", fetcher: async () => json(fx.body, fx.status, fx.headers) });
    assert.equal(r.error, null, `${file}: no error`);
    assert.ok([spec.model, spec.snapshot].includes(r.servedModel), `${file}: served ${r.servedModel}`);
    assert.equal(r.upstream, spec.upstream.name, `${file}: the pinned host`);
    assert.ok((r.usage.output_tokens ?? 0) > 0 && typeof r.chargedUsd === "number", `${file}: usage and charge`);
  }
});

test("the report carries the stage's pre-registration byte for byte", async () => {
  const stage = await readFile(STAGE_FILE, "utf8");
  const block = stage.slice(stage.indexOf("## Pre-registration"), stage.indexOf("## Done when"));
  const report = await readFile(join("docs", "runs", "persona-self-talk-x3-report.md"), "utf8");
  const body = block.slice(block.indexOf("\n") + 1).trim();
  assert.ok(report.includes(body), "the block, unchanged");
  assert.ok(report.includes(createHash("sha256").update(body).digest("hex")));
  assert.ok(report.includes(X3_DESIGN_SHA256), "the report names X3's hash");
});

test("no credits left (HTTP 402 on OpenRouter) stops every paid call, like a 401/403/429", async () => {
  const safety = createSafety({ gapMs: 0, lanes: 2 });
  const fetcher = async () => json({ error: { code: 402, message: "Insufficient credits. Add more using the credits page" } }, 402);
  const gate = dualPayer({ budgets: budgetsOf(), call: x3Caller({ keys: { openrouter: "k", anthropic: "k", openai: "o" }, fetcher, door: DOOR }), safety, sleep: async () => {} });
  const r = await gate.paid(safety.lane(0), "subject", SUBJECTS.glm, null, [{ role: "user", content: "x" }], 10, "medium");
  assert.match(r.error, /^HTTP 402/);
  assert.match(String(gate.stopped), /402/);
  assert.equal((await gate.paid(safety.lane(1), "check", SUBJECTS.kimi, null, [{ role: "user", content: "x" }], 10, "medium")).notSent, true);
});
