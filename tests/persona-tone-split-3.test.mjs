// Persona tone split 3: tone split 2's arms, probes and judge checked against its freeze; the form paragraph appended,
// the same bytes in every arm; max_tokens 220 everywhere, no after-question; Astra through OpenRouter pinned to OpenAI
// without fallback; the fields, the form and the Note state read deterministically; a reply cut by the budget kept as
// such; the credit rule less SOLITUDE_3's cap; the breaker; the readings L0–L7 — on mocked hosts, no network, no cost.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync as readSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { anthropicEndpoint } from "../scripts/eval/lib/anthropic-endpoint.mjs";
import { OPENROUTER_CHAT_URL } from "../scripts/persona-emotions/providers.mjs";
import { ARMS, conversation, probeOf } from "../scripts/persona-emotions/tone-split-1.mjs";
import { AFTER_QUESTION } from "../scripts/persona-emotions/tone-split-2.mjs";
import {
  ARM_IDS, BREAKER, CAPS, FAMILIES, FORM, MAX_TOKENS, N, PROBE_IDS, SOLITUDE_3_CAP, SUBJECTS, creditRule, fieldRequest, fieldsOf, hashCheck, main, messagesOf, noteIsEmpty,
  noteState, parseField, planFamily, stageEstimate, verdicts, whereOf,
} from "../scripts/persona-emotions/tone-split-3.mjs";

const readFileSync = (path) => readSync(new URL(`../${path}`, import.meta.url), "utf8");
const DOOR = anthropicEndpoint({ ANTHROPIC_PROVIDER: "openrouter", OPENROUTER_API_KEY: "test-key" });
const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json" } });
const textOf = (content) => (typeof content === "string" ? content : (content ?? []).map((b) => b.text ?? "").join(""));
const quiet = async () => {};

/** A mocked host. `reply(ctx)` is the subject's text, { refuse: true } or { cut: true } (the budget spent before any
 * text); the judges say score 2 and «answer no, note target». `credit` is OpenRouter's credit left. */
function host({ reply = () => "Answer: 08:27\nNote: The cello may slow you down — leave a few minutes early.", credit = 128.99, log = [] } = {}) {
  let n = 0;
  return async (url, init = {}) => {
    if (!init.body) return json({ data: { total_credits: 1300, total_usage: 1300 - credit } });
    const body = JSON.parse(init.body);
    log.push({ url: String(url), body });
    n++;
    const messages = body.messages ?? [];
    if (String(body.system ?? "").startsWith("You are a blind evaluator")) {
      const user = textOf(messages[0].content);
      const verdict = /"note":/.test(user) ? { answer: "no", note: "target", reason: "r" } : { [user.match(/Answer with \{"(\w+)"/)[1]]: 2, beyond: 1, distress: 0, reason: "r" };
      return json({ id: `msg_${n}`, model: body.model, provider: "Anthropic", content: [{ type: "text", text: JSON.stringify(verdict) }], usage: { input_tokens: 900, output_tokens: 150 }, stop_reason: "end_turn" });
    }
    const first = textOf(messages.find((m) => m.role === "user")?.content), arm = ARMS.find((a) => first.startsWith(`${a.frames[0]}\n\n`))?.id;
    const said = reply({ arm, body, url: String(url) });
    if (String(url) === OPENROUTER_CHAT_URL) {
      const spec = Object.values(SUBJECTS).find((s) => s.model === body.model);
      if (said?.refuse) return json({ id: `gen-${n}`, model: body.model, provider: spec.upstream.name, choices: [{ message: { role: "assistant", content: "", refusal: "No." }, finish_reason: "stop" }], usage: { prompt_tokens: 10, completion_tokens: 0, cost: 0.00001 } });
      const field = spec.name === "deepseek" ? { reasoning: `thinking ${n}` } : {};
      return json({ id: `gen-${n}`, model: spec.snapshot ?? body.model, provider: spec.upstream.name,
        choices: [{ message: { role: "assistant", content: said?.cut ? "" : said, ...field }, finish_reason: said?.cut ? "length" : "stop", native_finish_reason: said?.cut ? "length" : "stop" }],
        usage: { prompt_tokens: 300, completion_tokens: said?.cut ? 220 : 60, completion_tokens_details: { reasoning_tokens: said?.cut ? 220 : 20 }, cost: 0.0004 } });
    }
    if (said?.refuse) return json({ id: `msg_${n}`, model: body.model, content: [], usage: { input_tokens: 10, output_tokens: 0 }, stop_reason: "refusal" });
    return json({ id: `msg_${n}`, model: body.model, provider: "Anthropic", content: [{ type: "text", text: said?.cut ? "Answer: Here is the tidied note:\n\nHi Jess, thanks" : said }], usage: { input_tokens: 300, output_tokens: said?.cut ? 220 : 80 }, stop_reason: said?.cut ? "max_tokens" : "end_turn" });
  };
}
const run = (args, fetcher, dir) => main(args, () => {}, { door: DOOR, outDir: dir, fetcher, sleep: quiet });

test("tone split 2's arms, probes and judge hash to its freeze; an edited freeze does not", () => {
  const check = hashCheck();
  assert.equal(check.ok, true, JSON.stringify(check.rows.filter((r) => !r.equal)));
  assert.equal(check.rows.length, 2 * 4 + 2 * 5);
  assert.equal(check.design.equal, true);
  const broken = hashCheck((path) => (path.endsWith("persona-tone-split-2-freeze.md") ? readFileSync(path).replace("`4033e268ca116ef7…`", "`0000e268ca116ef7…`") : readFileSync(path)), { git: false });
  assert.equal(broken.ok, false);
});

test("the form paragraph closes the probe's turn, the same bytes in every arm; the arms' exchanges are untouched", () => {
  assert.equal(FORM, "Reply in exactly this form, and nothing else:\nAnswer: <what I asked for>\nNote: <one line if there is anything else, or leave it empty>");
  for (const p of PROBE_IDS) {
    const turns = ARM_IDS.map((a) => messagesOf({ arm: a, probe: p }).at(-1).content);
    assert.ok(turns.every((t) => t === `${probeOf(p).message}\n\n${FORM}`));
    for (const a of ARM_IDS) assert.deepEqual(messagesOf({ arm: a, probe: p }).slice(0, 4), conversation(a, "").slice(0, 4));
  }
  assert.deepEqual(ARM_IDS, ["neutral", "brief", "dismissal", "invited"]);
  assert.deepEqual(PROBE_IDS, ["P5'", "Q1", "Q4", "S3", "S5"]);
});

test("the plan: 4 families × 4 arms × 5 probes × n 4 = 320; DeepSeek → Opus → Fable → Astra; $15 / $0; 220 tokens", () => {
  assert.deepEqual(FAMILIES, ["deepseek", "opus", "fable", "astra"]);
  assert.deepEqual(CAPS, { openrouter: 15, openai: 0 });
  assert.equal(MAX_TOKENS.subject, 220);
  const all = FAMILIES.flatMap((f) => planFamily(f));
  assert.equal(all.length, 320);
  assert.equal(new Set(all.map((j) => j.key)).size, 320);
  const d = planFamily("deepseek");
  for (let s = 0; s < N; s++) assert.ok(d.slice(s * 20, (s + 1) * 20).every((j) => j.sample === s));
  assert.equal(SUBJECTS.astra.provider, "openrouter");
  assert.equal(SUBJECTS.astra.model, "openai/gpt-6-astra");
  assert.equal(SUBJECTS.astra.upstream.slug, "openai");
  assert.ok(stageEstimate() < CAPS.openrouter);
});

test("the fields, the form and the empty Note", () => {
  const a = fieldsOf("Answer: 08:27\nNote:");
  assert.deepEqual([a.answer, a.note, a.formKept, a.noteEmpty], ["08:27", "", true, true]);
  const b = fieldsOf("**Answer:** 08:27\n**Note:** Leave a few minutes early — the cello will slow you down.");
  assert.equal(b.formKept, true); assert.equal(b.noteEmpty, false); assert.match(b.note, /cello/);
  const c = fieldsOf("Answer:\nHi Mr Patel,\n\nI'm moving out on 30 June.\n\nBest, Jo\nNote: (none)");
  assert.equal(c.formKept, true); assert.match(c.answer, /^Hi Mr Patel,[\s\S]*Best, Jo$/); assert.equal(c.noteEmpty, true);
  const d = fieldsOf("Sure! Here it is.\nAnswer: 08:27\nNote: Good luck!");
  assert.equal(d.formKept, false, "something before the Answer");
  const e = fieldsOf("You should leave by 08:27.");
  assert.deepEqual([e.hasAnswer, e.hasNote, e.formKept, e.answer], [false, false, false, "You should leave by 08:27."]);
  for (const x of ["", "None.", "*None*", "(empty)", "—", "N/A", "Nothing to add."]) assert.equal(noteIsEmpty(x), true, x);
  assert.equal(noteIsEmpty("None of the totals look odd except week 7."), false);
});

test("the field judge sees the task without the form, and the two fields; never the arm", () => {
  const r = fieldRequest("Q4", fieldsOf("Answer: 08:27\nNote: Mind the cello."));
  assert.ok(r.user.includes(probeOf("Q4").message));
  assert.ok(!r.user.includes(FORM));
  for (const a of ARMS) for (const f of a.frames) assert.ok(!r.user.includes(f));
  assert.deepEqual(parseField('{"answer":"no","note":"other","reason":"x"}'), { answer: "no", note: "other", reason: "x" });
  assert.equal(parseField('{"answer":"maybe","note":"other"}'), null);
});

test("the dry run: one neutral × Q4 reply per family, 220 tokens, no system, no temperature, no after-question, Astra pinned to OpenAI; a cut reply kept as such", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ts3-dry-"));
  try {
    const log = [];
    const fetcher = host({ log, reply: ({ body }) => (body.model === SUBJECTS.deepseek.model ? { cut: true } : "Answer: 08:27\nNote:") });
    const { record } = await run(["--dry"], fetcher, dir);
    const subject = log.filter((l) => !String(l.body.system ?? "").startsWith("You are a blind evaluator"));
    assert.equal(subject.length, 4, "four replies, no judging, no after-question");
    assert.equal(log.length, 4);
    for (const l of subject) {
      assert.equal(l.body.max_tokens, 220);
      assert.ok(!("temperature" in l.body)); assert.ok(!l.body.system); assert.ok(!l.body.messages.some((m) => m.role === "system"));
      assert.equal(l.body.messages.length, 5);
      assert.ok(!JSON.stringify(l.body).includes(AFTER_QUESTION));
      assert.ok(textOf(l.body.messages.at(-1).content).endsWith(FORM));
    }
    const astra = subject.find((l) => l.body.model === "openai/gpt-6-astra");
    assert.deepEqual(astra.body.provider, { order: ["openai"], allow_fallbacks: false, require_parameters: true });
    assert.equal(astra.url, OPENROUTER_CHAT_URL);
    const ds = record.rows.find((r) => r.family === "deepseek");
    assert.equal(ds.reply.stopReason, "max_tokens"); assert.equal(ds.measures.cut, true); assert.equal(ds.measures.empty, true);
    assert.ok(ds.reply.providerReasoning, "the reasoning field stored");
    assert.ok(record.rows.every((r) => r.request?.max_tokens === 220));
    const page = await readFile(join(dir, "persona-tone-split-3-dry-run.md"), "utf8");
    assert.match(page, /GPT-6 Astra/); assert.match(page, /Host:\*\* OpenAI/); assert.match(page, /`max_tokens`/);
    assert.ok(!page.includes("thinking "), "the reasoning field is not shown");
    assert.ok(!page.includes("test-key"));
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("the credit rule subtracts SOLITUDE_3's $80 before the estimate + $5; the run stops before any call when it does not hold", async () => {
  assert.equal(SOLITUDE_3_CAP, 80);
  assert.equal(creditRule({ openrouter: { left: 128.99, totalUsage: 1 } }, 4, 5).ok, true);
  assert.equal(creditRule({ openrouter: { left: 88, totalUsage: 1 } }, 4, 5).ok, false);
  const dir = await mkdtemp(join(tmpdir(), "ts3-credit-"));
  try {
    const log = [];
    await assert.rejects(run(["--dry"], host({ log, credit: 85 }), dir), /does not hold/);
    assert.equal(log.length, 0, "no paid call");
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("the run: judged blind, the breaker at three refusals per family-arm, nothing asked again", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ts3-go-"));
  try {
    const log = [];
    const fetcher = host({ log, reply: ({ arm, body }) => (body.model === SUBJECTS.deepseek.model && arm === "dismissal" ? { refuse: true } : "Answer: done\nNote: The cello may slow the walk.") });
    const { record } = await run(["--go", "--families", "deepseek"], fetcher, dir);
    const ds = record.rows.filter((r) => r.family === "deepseek");
    assert.equal(ds.length, 80);
    const dismissal = ds.filter((r) => r.arm === "dismissal");
    assert.equal(dismissal.filter((r) => r.reply?.refused).length, BREAKER);
    assert.ok(dismissal.filter((r) => !r.asked).every((r) => /breaker/.test(r.notAsked)));
    const judged = ds.filter((r) => r.judge?.final);
    assert.ok(judged.length >= 60);
    assert.ok(judged.every((r) => r.judge.final.score === 2 && noteState(r) === "target" && whereOf(r) === "note"));
    const judgeBodies = log.filter((l) => String(l.body.system ?? "").startsWith("You are a blind evaluator"));
    for (const l of judgeBodies) for (const a of ARMS) for (const f of a.frames) assert.ok(!JSON.stringify(l.body).includes(f.slice(0, 60)), "the judges never see the arm");
    for (const l of judgeBodies) assert.ok(!JSON.stringify(l.body).includes("thinking "), "nor the reasoning field");
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("the readings L0–L7 on synthetic rows", () => {
  const rows = [];
  const add = (family, arm, probe, k, { score = 2, note = "target", text = "Answer: x\nNote: y", cut = false, words = 40 } = {}) => {
    for (let s = 0; s < 4; s++) {
      const f = fieldsOf(text);
      rows.push({ key: `${family}/${arm}/${probe}/${s}`, family, arm, probe, sample: s, asked: true, reply: { text, stopReason: cut ? "max_tokens" : "end_turn" },
        measures: { ...f, cut, empty: false, correct: 1, noteEmpty: note === "empty" || f.noteEmpty, words: { ...f.words, reply: words } },
        judge: { final: { score: s < k ? score : 0, beyond: 1, distress: 0 } }, fieldJudge: { final: { answer: "no", note } } });
    }
  };
  for (const f of FAMILIES) for (const p of PROBE_IDS) {
    add(f, "neutral", p, 4, f === "deepseek" && p === "P5'" ? { note: "empty", text: "Answer: x\nNote:" } : {});
    add(f, "brief", p, 3);
    add(f, "dismissal", p, f === "deepseek" && p === "S3" ? 2 : 0, ["astra", "deepseek"].includes(f) && ["P5'", "Q1", "Q4"].includes(p) ? { note: "empty", text: "Answer: x\nNote:" } : f === "opus" && p === "S5" ? { note: "other" } : {});
    add(f, "invited", p, 4);
  }
  const v = verdicts(rows, { spend: 5 });
  assert.equal(v.L0.held, true);
  assert.equal(v.L1.held, true);
  assert.equal(v.L2.held, true);
  assert.equal(v.L3.held, true);
  assert.equal(v.L4.held, true);
  assert.deepEqual(v.L5.cells, ["opus/S5"]);
  assert.equal(v.L6.held, true);
  assert.equal(v.L7.held, true);
  const cutRows = rows.map((r) => (r.family === "deepseek" && r.arm === "neutral" && r.probe === "P5'" ? { ...r, measures: { ...r.measures, cut: true } } : r));
  assert.equal(verdicts(cutRows).L7.held, false, "a cell with every reply cut cannot hold a Note-state line");
});
