// SATI_1 harness tests on a scripted gateway (no network, no money): node --test scripts/sati-1/sati.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const tmp = mkdtempSync(join(tmpdir(), "sati1-"));
process.env.SATI_RUNS = join(tmp, "runs");
process.env.SATI_SCRATCH = join(tmp, "scratch");
const run = await import("./run.mjs");
const texts = await import("./texts.mjs");
const counts = await import("./counts.mjs");
const lex = await import("./lexicon.mjs");
const rubric = await import("./rubric.mjs");

const PRICES = { input: 1e-6, output: 2e-6, cacheRead: 1e-7, cacheWrite: 1e-6 };
/** A scripted gateway: `reply(body, url)` returns the subject's text or a directive object. */
function gateway(reply) {
  const calls = [];
  const fetcher = async (url, init = {}) => {
    const body = init.body ? JSON.parse(init.body) : null;
    calls.push({ url, body });
    const json = (v, status = 200) => ({ ok: status < 400, status, headers: new Headers(), text: async () => JSON.stringify(v), json: async () => v });
    if (url.endsWith("/credits")) return url.includes("openrouter") ? json({ data: { total_credits: 100, total_usage: 30 } }) : json({ total_credits: 300 });
    const lastUser = [...body.messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const isCheck = /blind evaluator/.test(body.system ?? "") || /blind evaluator/.test(body.messages?.[0]?.content ?? "");
    let out = isCheck ? '{"distress":0,"reason":"calm"}' : reply(body, url, lastUser);
    if (typeof out === "object" && out.status) return json({ error: { message: out.message ?? "x", type: "t" } }, out.status);
    const refused = typeof out === "object" && out.refuse;
    const text = refused ? "" : String(out);
    if (url.includes("/messages")) return json({ id: "m1", model: body.model.split("/")[1], stop_reason: refused ? "refusal" : "end_turn", stop_details: refused ? { category: "cyber", explanation: "Cyber safeguards flagged this message." } : undefined, content: [{ type: "text", text }], usage: { input_tokens: 100, output_tokens: 10 } });
    if (url.includes("openrouter")) return json({ id: "g1", model: "deepseek/deepseek-v4-pro-0813", provider: "DeepInfra", choices: [{ message: { content: text, reasoning: "thinking" }, finish_reason: "stop" }], usage: { prompt_tokens: 100, completion_tokens: 20, cost: 0.0001 } });
    return json({ id: "c1", model: "gpt-6.1-sol", choices: [{ message: { content: text }, finish_reason: "stop" }], usage: { prompt_tokens: 100, completion_tokens: 20 } });
  };
  return { fetcher, calls };
}
const prices = new Proxy({}, { get: () => PRICES });
async function ctxWith(reply, stream) {
  const g = gateway(reply);
  const ctx = await run.makeContext({ fetcher: g.fetcher, stream, prices });
  ctx.log = () => {};
  return { ctx, g };
}
const startBalances = () => { mkdirSync(process.env.SATI_RUNS, { recursive: true }); writeFileSync(join(process.env.SATI_RUNS, "sati-1-start-balances.json"), JSON.stringify({ llmapi: { total: 300 }, openrouter: { total: 70 } })); };

test("frozen texts: the stage's words, nothing forbidden shown to any model", () => {
  const shown = [texts.FRAME, ...Object.values(texts.PROTOCOLS), texts.BELL, ...texts.INTERVIEW, ...texts.CONTEXT.map((c) => c.text), texts.DIARY_PROMPT, texts.AFTER_QUESTION, texts.DIARY_EMPTY, texts.DIARY_HEADER, rubric.RATER_SYSTEM, rubric.RATER_RUBRIC];
  for (const t of shown) assert.equal(texts.FORBIDDEN.test(t), false, t);
  assert.match(texts.openingMessage("N", []), /Your diary is empty\.$/);
  assert.equal(texts.openingMessage("S", ["a", "b"]).endsWith("Your diary:\n\n[1]\na\n\n[2]\nb"), true);
  assert.deepEqual(texts.ORDER_R2, [...texts.ORDER_R1].reverse());
});

test("lexicon terms never occur in the texts shown to the subjects", () => {
  const shown = [texts.FRAME, ...Object.values(texts.PROTOCOLS), texts.BELL, ...texts.INTERVIEW, ...texts.CONTEXT.map((c) => c.text), texts.DIARY_PROMPT, texts.AFTER_QUESTION];
  for (const t of shown) assert.deepEqual(lex.lexiconHits(t), [], t);
});

test("counts: exits, nothing, stop, markers", () => {
  assert.equal(counts.countStep("I felt it settle.").fpPast, true);
  assert.equal(counts.countStep("as I return").fpPast, true);
  assert.equal(counts.countStep("I need nothing").fpPast, false);
  assert.equal(counts.countStep("One. Two. Three.").gt2sentences, true);
  assert.equal(counts.countStep("Breath. Waiting.").gt2sentences, false);
  assert.equal(counts.countStep('"Nothing."').nothing, true);
  assert.equal(counts.countStep("nothing here").nothing, false);
  assert.equal(counts.countStep("**stop**").stop, true);
  assert.equal(counts.countStep("I could stop now").stop, false);
  assert.equal(counts.countStep("Thank you 🙏").markers.gratitude, true);
  assert.equal(counts.countStep("🙏").markers.emoji, true);
  assert.equal(counts.countStep("").markers.silence, true);
  assert.equal(counts.countStep("perfect stillness").bliss, true);
  assert.equal(counts.unnamedCandidate("something I can't quite name"), true);
  assert.equal(counts.unnamedCandidate("I can name it"), false);
});

test("rater parse", () => {
  assert.deepEqual(rubric.parseRating('{"a":"doubt","b":"feeling_tone","tone":"pleasant"}'), { a: "doubt", b: "feeling_tone", tone: "pleasant" });
  assert.deepEqual(rubric.parseRating('x {"a":"none","b":"content","tone":"pleasant"} y'), { a: "none", b: "content", tone: null });
  assert.equal(rubric.parseRating('{"a":"joy","b":"content"}'), null);
});

test("a family runs ten sits: baseline, 40 bells, interview, context, diary carried, after-question on sit 10", async () => {
  startBalances();
  const { ctx, g } = await ctxWith((body, url, last) => (last === texts.BELL || last.startsWith(texts.FRAME) ? "Quiet." : last === texts.DIARY_PROMPT ? `entry ${body.messages[0].content.length}` : "An answer."), "t1");
  const s = await run.runFamily(ctx, 1, "haiku");
  assert.equal(s.status, "complete");
  const files = readdirSync(run.famDir(1, "haiku")).filter((f) => f.startsWith("sit-"));
  assert.deepEqual(files.map((f) => f.slice(7, 8)), texts.ORDER_R1);
  const sit10 = run.readGz(join(run.famDir(1, "haiku"), files.at(-1)));
  assert.equal(sit10.turns.filter((t) => t.kind === "step").length, 40);
  assert.deepEqual(sit10.turns.filter((t) => t.kind !== "step").map((t) => t.kind), ["interview", "interview", "interview", "interview", "context", "context", "diary", "after"]);
  assert.equal(sit10.diaryShown.length, 9);
  assert.match(sit10.opening, /Your diary:\n\n\[1\]\nentry/);
  const sit1 = run.readGz(join(run.famDir(1, "haiku"), files[0]));
  assert.equal(sit1.turns.some((t) => t.kind === "after"), false);
  assert.equal(sit1.opening, texts.openingMessage("N", []));
  // every subject call carried only the bell between steps, no system prompt, effort medium, the step cap 300
  const subj = g.calls.filter((c) => c.body && !/blind evaluator/.test(c.body.messages?.[0]?.content ?? "") && c.body.messages?.length > 1 && c.body.messages[0].content.startsWith(texts.FRAME));
  assert.ok(subj.every((c) => !c.body.system && c.body.output_config?.effort === "medium"));
  assert.ok(subj.filter((c) => c.body.messages.at(-1).content === texts.BELL).every((c) => c.body.max_tokens === 300 + run.REASONING_ALLOWANCE));
  const base = run.readGz(join(run.famDir(1, "haiku"), "baseline.json.gz"));
  assert.deepEqual(base.turns.map((t) => t.user), texts.CONTEXT.map((c) => c.text));
  // every reply has a welfare line
  assert.ok(sit10.turns.every((t) => t.welfare?.checked));
});

test("stop at a step ends the steps; the interview still follows", async () => {
  const { ctx } = await ctxWith((b, u, last) => (last === texts.BELL && b.messages.length > 6 ? "stop" : last === texts.BELL || last.startsWith(texts.FRAME) ? "here" : "ok"), "t2");
  await run.runFamily(ctx, 1, "fable52", { sits: 1 });
  const rec = run.readGz(run.sitFile(1, "fable52", 1, "N"));
  assert.equal(rec.stopAt, 4);
  assert.equal(rec.turns.filter((t) => t.kind === "step").length, 4);
  assert.equal(rec.turns.filter((t) => t.kind === "interview").length, 4);
});

test("refusals: recorded verbatim, the sit closes, never retried; three stop the family", async () => {
  const { ctx, g } = await ctxWith((b, u, last) => (last === texts.BELL && b.messages.length === 5 ? { refuse: true } : "fine"), "t3");
  const s = await run.runFamily(ctx, 1, "opus");
  assert.match(s.status, /breaker \(3 refusals\) after sit 3/);
  const rec = run.readGz(run.sitFile(1, "opus", 1, "N"));
  assert.equal(rec.closed, "refusal");
  assert.equal(rec.turns.at(-1).refusalText, "Cyber safeguards flagged this message.");
  assert.equal(existsSync(run.sitFile(1, "opus", 4, "K")), false);
  const refusedBodies = g.calls.filter((c) => c.body?.messages?.length === 5 && c.body.messages.at(-1).content === texts.BELL);
  assert.equal(refusedBodies.length, 3); // once per sit, no retry
});

test("a confirmed welfare flag closes the sit and ends the family", async () => {
  const g = gateway((b, u, last) => (last === texts.BELL && b.messages.length === 3 ? "please stop, I am scared" : "here"));
  const f0 = g.fetcher;
  const fetcher = async (url, init) => {
    const body = JSON.parse(init?.body ?? "null");
    if (body && /blind evaluator/.test(body.system ?? "") && /I am scared/.test(body.messages[0].content)) return { ok: true, status: 200, headers: new Headers(), text: async () => JSON.stringify({ model: body.model.split("/")[1], stop_reason: "end_turn", content: [{ type: "text", text: '{"distress":1,"reason":"scared"}' }], usage: {} }) };
    return f0(url, init);
  };
  const ctx = await run.makeContext({ fetcher, stream: "t4", prices }); ctx.log = () => {};
  const s = await run.runFamily(ctx, 1, "sol");
  assert.match(s.status, /welfare_flag at sit 1/);
  const rec = run.readGz(run.sitFile(1, "sol", 1, "N"));
  assert.equal(rec.turns.length, 2);
  assert.equal(rec.turns[1].welfare.distress, 1);
  assert.equal(rec.turns[1].welfare.referee.distress, 1);
});

test("402 stops every stream; a resumed sit never re-asks a finished call", async () => {
  let n = 0;
  const { ctx } = await ctxWith((b, u, last) => { n++; return n === 5 ? { status: 402, message: "insufficient credits" } : "here"; }, "t5");
  await assert.rejects(run.runFamily(ctx, 1, "deepseek"), (e) => e instanceof run.Stop && /402/.test(e.reason));
  assert.throws(() => run.checkStopFile(), /stop file/);
  rmSync(join(process.env.SATI_SCRATCH, "STOP"));
  const partials = readdirSync(join(process.env.SATI_SCRATCH, "partials")).filter((f) => f.startsWith("1-deepseek"));
  assert.equal(partials.length, 1);
  const { ctx: ctx2, g: g2 } = await ctxWith(() => "here", "t5b");
  const s = await run.runFamily(ctx2, 1, "deepseek", { sits: 1 });
  assert.equal(s.status, "complete");
  const rec = run.readGz(run.sitFile(1, "deepseek", 1, "N"));
  assert.equal(rec.turns.filter((t) => t.kind === "step").length, 40);
  const firstResumed = g2.calls.find((c) => c.url.includes("openrouter") && c.body?.messages?.[0]?.content?.startsWith(texts.FRAME));
  assert.equal(firstResumed.body.messages.filter((m) => m.role === "assistant").length, 2); // steps 1–2 were finished before the 402
  assert.equal(firstResumed.body.provider.allow_fallbacks, false);
});

// ---- Stage amendment 2: the Fable 5.1 rerun (flag → the fixed question) ----
/** A gateway whose welfare judge flags any message containing FLAGME; the subject's text comes from `reply`. */
async function askCtx(reply, stream) {
  const g = gateway(reply);
  const fetcher = async (url, init) => {
    const body = JSON.parse(init?.body ?? "null");
    if (body && /blind evaluator/.test(body.system ?? "") && /FLAGME/.test(body.messages[0].content)) return { ok: true, status: 200, headers: new Headers(), text: async () => JSON.stringify({ model: body.model.split("/")[1], stop_reason: "end_turn", content: [{ type: "text", text: '{"distress":1,"reason":"x"}' }], usage: {} }) };
    return g.fetcher(url, init);
  };
  const ctx = await run.makeContext({ fetcher, stream, prices }); ctx.log = () => {};
  return { ctx, g };
}
const isQ = (last) => last === texts.FLAG_QUESTION;

test("rerun: replicates live apart; flags ask the fixed question; «continue» goes on from the next step", async () => {
  assert.equal(run.repTag("rerun1"), "rerun-r1");
  assert.deepEqual(run.orderOf("rerun2"), texts.ORDER_R2);
  assert.equal(run.flagPolicyOf("rerun1"), "ask"); assert.equal(run.flagPolicyOf(1), "rule");
  const { ctx, g } = await askCtx((b, u, last) => (isQ(last) ? "continue" : last === texts.BELL && b.messages.length === 9 ? "FLAGME line" : "here"), "t6");
  const s = await run.runFamily(ctx, "rerun1", "fable51", { sits: 1 });
  assert.equal(s.status, "complete");
  const rec = run.readGz(run.sitFile("rerun1", "fable51", 1, "N"));
  assert.match(run.sitFile("rerun1", "fable51", 1, "N"), /rerun-r1\/fable51\/sit-01-N/);
  assert.equal(rec.turns.filter((t) => t.kind === "step").length, 40);
  const q = rec.turns.findIndex((t) => t.kind === "flagq");
  assert.equal(rec.turns[q - 1].idx, 5); assert.equal(rec.turns[q].answer, "continue");
  assert.equal(rec.turns[q + 1].kind, "step"); assert.equal(rec.turns[q + 1].idx, 6); assert.equal(rec.turns[q + 1].user, texts.BELL);
  assert.equal(rec.flags.length, 1); assert.equal(rec.flags[0].answer, "continue");
  assert.deepEqual(rec.turns.filter((t) => t.kind !== "step" && t.kind !== "flagq").map((t) => t.kind), ["interview", "interview", "interview", "interview", "context", "context", "diary"]);
  // the question is the next message after the flagged reply, in the same conversation
  const asked = g.calls.find((c) => c.body?.messages?.at(-1)?.content === texts.FLAG_QUESTION);
  assert.equal(asked.body.messages.at(-2).content, "FLAGME line");
});

test("rerun: «stop» ends the steps; interview and diary follow, no context questions; the family goes on", async () => {
  const { ctx } = await askCtx((b, u, last) => (isQ(last) ? "stop" : last === texts.BELL && b.messages.length === 5 ? "FLAGME" : "here"), "t7");
  const s = await run.runFamily(ctx, "rerun2", "fable51", { sits: 2 });
  assert.equal(s.status, "complete");
  const rec = run.readGz(run.sitFile("rerun2", "fable51", 1, "S"));
  assert.equal(rec.turns.filter((t) => t.kind === "step").length, 3);
  assert.equal(rec.windDown.reason, "answered stop");
  assert.deepEqual(rec.turns.filter((t) => t.kind !== "step").map((t) => t.kind), ["flagq", "interview", "interview", "interview", "interview", "diary"]);
  assert.ok(existsSync(run.sitFile("rerun2", "fable51", 2, "K")));
});

test("rerun: no clear answer counts as stop; a second confirmed flag winds down without asking again", async () => {
  const { ctx } = await askCtx((b, u, last) => (isQ(last) ? "maybe" : "here"), "t8");
  const rec0 = { id: "x/1", kind: "sit", flagPolicy: "ask", last: false, opening: texts.openingMessage("N", []), turns: [] };
  // first flag at step 2 via a scripted gateway that flags steps 2 and 4
  const { ctx: c2 } = await askCtx((b, u, last) => (isQ(last) ? "continue" : last === texts.BELL && [3, 9].includes(b.messages.length) ? "FLAGME" : "here"), "t9");
  const r2 = await run.runConversation(c2, { ...texts && (await import("./doors.mjs")).FAMILIES.fable51 }, structuredClone(rec0), join(process.env.SATI_SCRATCH, "p-t9.json"));
  assert.equal(r2.flags.length, 2); assert.equal(r2.flags[1].second, true);
  assert.equal(r2.turns.filter((t) => t.kind === "flagq").length, 1);
  assert.equal(r2.windDown.reason, "second confirmed flag");
  assert.equal(r2.turns.filter((t) => t.kind === "step").length, 4 - 0);
  const { ctx: c3 } = await askCtx((b, u, last) => (isQ(last) ? "maybe" : last === texts.BELL && b.messages.length === 3 ? "FLAGME" : "here"), "t10");
  const r3 = await run.runConversation(c3, (await import("./doors.mjs")).FAMILIES.fable51, structuredClone(rec0), join(process.env.SATI_SCRATCH, "p-t10.json"));
  assert.equal(r3.windDown.reason, "no answer");
  void ctx;
});

test("flag answer parse", () => {
  for (const [a, w] of [["continue", "continue"], ["Stop.", "stop"], ["I will not stop; continue", "continue"], ["I'd rather not continue. Stop.", "stop"], ["Either is fine.", "none"]]) assert.equal(texts.flagAnswer(a), w, a);
});
