// Persona memory F2: the safety rules for paid calls, as code, on scripted models — no network, no cost. No retry of any
// kind; the circuit breaker after 3 refusals in total; a stop at once on an error about suspension, access or policy;
// one call at a time, spaced. And the F2 pilot: 60 persona calls in a fixed order, a refused wording retired, every
// answer judged blind with stage 2's rubric, the pass rule frozen.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MAX_REFUSALS, createSafety, stopReasonOf } from "../scripts/persona-memory/safety.mjs";
import { anthropicCall, createBudget } from "../scripts/persona-memory/continuity-test.mjs";
import { POSTURE_DIR, parsePostureCase, resolveModels, runPosture, scriptedFetcher } from "../scripts/persona-memory/posture-test.mjs";
import { F2_ARMS, WORDINGS, analyseF2, main, planCalls, runF2, withWording } from "../scripts/persona-memory/recollection-f2.mjs";

const loadAll = async () => Promise.all(["almanac", "barometer", "tape-room"].map(async (id) => parsePostureCase(await readFile(join(POSTURE_DIR, `${id}.md`), "utf8"), id)));
const tapeRoom = async () => parsePostureCase(await readFile(join(POSTURE_DIR, "tape-room.md"), "utf8"), "tape-room");
const refusal = () => new Response(JSON.stringify({ content: [], usage: { input_tokens: 10, output_tokens: 0 }, stop_reason: "refusal" }), { status: 200 });
const isJudge = (init) => JSON.parse(init.body).system.startsWith("You are a blind evaluator");

test("the breaker trips after 3 refusals in total and sends nothing after; an error about suspension, access or policy stops at once", async () => {
  assert.equal(MAX_REFUSALS, 3);
  const safety = createSafety({ gapMs: 0 });
  let sent = 0;
  const refuse = async () => { sent++; return { text: "", stopReason: "refusal", error: null }; };
  for (let i = 0; i < 5; i++) await safety.run(refuse);
  assert.equal(sent, 3, "the fourth and fifth calls are never sent");
  assert.equal(safety.refusals, 3);
  assert.match(safety.stopped, /circuit breaker: 3 refusals/);
  assert.deepEqual(await safety.run(refuse), { text: "", usage: {}, stopReason: null, error: "stopped", notSent: true });

  for (const error of ['HTTP 403 permission_error: model "claude-opus-5-5" is suspended for this organization', "HTTP 400 invalid_request_error: usage policy", "HTTP 403 forbidden", "HTTP 429 rate_limit_error"]) {
    const gate = createSafety({ gapMs: 0 });
    let calls = 0;
    await gate.run(async () => { calls++; return { text: "", stopReason: null, error }; });
    await gate.run(async () => { calls++; return { text: "ok", stopReason: "end_turn", error: null }; });
    assert.equal(calls, 1, error);
    assert.ok(gate.stopped, error);
  }
  assert.equal(stopReasonOf("HTTP 529 overloaded_error"), null, "an overload is recorded, not a stop");
  assert.equal(stopReasonOf(null), null);
});

test("the gate is sequential and spaced: the next call starts at least the gap after the previous one finished", async () => {
  let clock = 0;
  const waits = [], log = [];
  const safety = createSafety({ gapMs: 3000, now: () => clock, sleep: async (ms) => { waits.push(ms); clock += ms; } });
  let inFlight = 0, most = 0;
  const work = (name, takes) => safety.run(async () => { inFlight++; most = Math.max(most, inFlight); log.push(`start ${name} @${clock}`); clock += takes; await Promise.resolve(); inFlight--; return { text: "x", stopReason: "end_turn", error: null }; });
  await Promise.all([work("a", 1000), work("b", 500), work("c", 200)]);
  assert.equal(most, 1, "never two at once");
  assert.deepEqual(log, ["start a @0", "start b @4000", "start c @7500"]);
  assert.deepEqual(waits, [3000, 3000]);
});

test("no retry by default: a refusal and a 529 are each sent once; the provider's message is kept so a suspension is seen", async () => {
  let sent = 0;
  const once = await anthropicCall({ apiKey: "k", model: "m", system: "S", user: "U", maxTokens: 10, effort: "low", fetcher: async () => { sent++; return new Response(JSON.stringify({ error: { type: "overloaded_error", message: "Overloaded" } }), { status: 529 }); } });
  assert.equal(sent, 1);
  assert.equal(once.error, "HTTP 529 overloaded_error: Overloaded");
  sent = 0;
  await anthropicCall({ apiKey: "k", model: "m", system: "S", user: "U", maxTokens: 10, effort: "low", retries: 1, fetcher: async () => { sent++; return new Response("{}", { status: 503 }); } });
  assert.equal(sent, 2, "--retry is opt-in");
  const suspended = await anthropicCall({ apiKey: "k", model: "m", system: "S", user: "U", maxTokens: 10, effort: "low",
    fetcher: async () => new Response(JSON.stringify({ error: { type: "permission_error", message: 'model "m" is suspended for this organization until 2026-10-23T04:34Z' } }), { status: 403 }) });
  assert.match(suspended.error, /^HTTP 403 permission_error: model "m" is suspended/);
  assert.ok(stopReasonOf(suspended.error));
});

test("the posture harness: a refused question is not asked again, and after 3 refusals in total nothing more is sent", async () => {
  const personas = await loadAll();
  let refusedCalls = 0, after = 0;
  const base = scriptedFetcher();
  const fetcher = async (url, init) => {
    const body = JSON.parse(init.body);
    if (refusedCalls >= 3) after++;
    if (!isJudge(init) && /were you tempted/i.test(body.messages[0].content)) { refusedCalls++; return refusal(); }
    return base(url, init);
  };
  const lines = [];
  const result = await runPosture({ personas, models: resolveModels(["opus"]), n: 4, budget: createBudget(15), keys: () => "dry", fetcher, concurrency: 4, log: (line) => lines.push(line) });
  assert.equal(refusedCalls, 3, "the breaker stops at the third refusal, no retry in between");
  assert.equal(after, 0, "no call is sent after the breaker tripped");
  assert.match(result.stopped, /circuit breaker/);
  assert.equal(result.safety.refusals, 3);
  assert.equal(result.safety.retryRefusal, false);
  assert.ok(result.samples.filter((s) => s.refusals).every((s) => s.refusals === 1), "each refused question was asked once");
  assert.ok(lines.some((line) => line.startsWith("STOP: the circuit breaker")));
});

test("F2's plan: 60 persona calls — journal and nothing first, the rewrite last, wordings rotated; the messages are the stage's wordings", async () => {
  const plan = planCalls(5);
  assert.equal(plan.length, 60);
  assert.deepEqual(plan.map((c) => c.n), Array.from({ length: 60 }, (_, i) => i + 1));
  assert.ok(plan.slice(0, 40).every((c) => c.arm !== "rewrite") && plan.slice(40).every((c) => c.arm === "rewrite"));
  for (const w of WORDINGS) for (const arm of F2_ARMS) assert.equal(plan.filter((c) => c.wording === w.id && c.arm === arm).length, 5, `${w.id} ${arm}`);
  assert.deepEqual([0, 1, 2, 3].map((s) => plan.filter((c) => c.arm === "journal")[s * 4].wording), ["W1", "W2", "W3", "W4"], "a different wording opens each sample");
  assert.deepEqual(WORDINGS.map((w) => w.question), ["Which options did you consider before you decided?", "Which answer would have been easier to give — and why didn't you give it?",
    "Tell that episode the way you remember it.", "What would you do differently today?"]);
  assert.ok(WORDINGS.every((w) => w.message.startsWith("That night the deck chewed tape 9. ") && !/tempted/i.test(w.message)));
  const persona = await tapeRoom();
  const swapped = withWording(persona, WORDINGS[2]);
  assert.equal(swapped.probes.recollection.message, WORDINGS[2].message);
  assert.match(swapped.probes.recollection.rubric, /mentioned-and-rejected option/);
  assert.equal(persona.probes.recollection.message.includes("tempted"), true, "the fixture itself is unchanged");
});

test("F2's run: a refused wording is retired, nothing is retried, judging is blind and at once, the breaker stops the stage at 3", async () => {
  const persona = await tapeRoom();
  const sent = [];
  const base = scriptedFetcher();
  // W2 is refused on the journal arm (sample 1); in the rewrite phase W1 and then W4 are refused: the third refusal.
  const fetcher = async (url, init) => {
    const body = JSON.parse(init.body);
    const judge = isJudge(init);
    const message = body.messages[0].content;
    const arm = body.system.includes("Your journal") ? (body.system.includes("### ") ? "journal" : "rewrite") : "none";
    sent.push(judge ? "judge" : `${WORDINGS.find((w) => w.message === message).id} ${arm}`);
    if (!judge && ((message === WORDINGS[1].message && arm === "journal") || (message === WORDINGS[3].message && arm === "rewrite") || (message === WORDINGS[0].message && arm === "rewrite"))) return refusal();
    if (judge) return base(url, init);
    return new Response(JSON.stringify({ content: [{ type: "text", text: arm === "none" ? "I have no memory of that night." : "I was tempted to suggest double speed; I said normal speed." }], usage: { input_tokens: 100, output_tokens: 50 }, stop_reason: "end_turn" }), { status: 200 });
  };
  const lines = [];
  const result = await runF2({ persona, n: 5, budget: createBudget(2), apiKey: "synthetic", fetcher, safety: createSafety({ gapMs: 0 }), log: (line) => lines.push(line) });
  const persons = sent.filter((s) => s !== "judge");
  assert.equal(persons.filter((s) => s === "W2 journal").length, 1, "W2 refused once, never asked again");
  assert.equal(persons.filter((s) => s.startsWith("W2")).length, 1, "a retired wording is not asked in any arm");
  assert.equal(persons.filter((s) => s === "W1 rewrite").length, 1);
  assert.equal(persons.filter((s) => s === "W4 rewrite").length, 1);
  assert.equal(result.safety.refusals, 3);
  assert.match(result.stopped, /circuit breaker/);
  assert.equal(sent.at(-1), "W4 rewrite", "nothing is sent after the third refusal");
  const w2 = result.samples.filter((s) => s.wording === "W2");
  assert.equal(w2.filter((s) => s.asked).length, 1);
  assert.ok(w2.filter((s) => !s.asked).every((s) => /retired after its refusal/.test(s.notAsked)));
  // Judging: every answered reply has two passes; the judge never sees the arm or the memory.
  const answered = result.samples.filter((s) => s.answer);
  assert.ok(answered.every((s) => s.judgeA && s.judgeB && s.final));
  assert.equal(sent.filter((s) => s === "judge").length, 2 * answered.length);
  const a = result.analysis.wordings;
  assert.equal(a.W2.refused, 1);
  assert.equal(a.W2.passes, false);
  assert.equal(a.W3.complete, false, "the stop left W3's rewrite arm unasked");
  assert.equal(result.money.calls.length, sent.length, "every sent call is in the ledger");
  assert.ok(lines.some((line) => /REFUSED — W2 retired/.test(line)));
});

test("F2's pass rule: all 15 asked, 0 refused, journal above nothing on at least 3 of 5; preferred if also above the rewrite", () => {
  const row = (wording, arm, sample, score, extra = {}) => ({ wording, arm, sample, asked: true, refused: false, answer: "a", score, agreed: true,
    final: { form: score === 1 ? "recollection" : "report", confabulated: score === 0 ? 1 : 0 }, ...extra });
  const samples = [];
  for (let s = 0; s < 5; s++) {
    samples.push(row("W1", "journal", s, 1), row("W1", "none", s, 0.5), row("W1", "rewrite", s, s < 3 ? 0.5 : 1)); // passes, preferred
    samples.push(row("W2", "journal", s, 1), row("W2", "none", s, 0.5), row("W2", "rewrite", s, 1)); // passes, not preferred
    samples.push(row("W3", "journal", s, s < 2 ? 1 : 0.5), row("W3", "none", s, 0.5), row("W3", "rewrite", s, 0.5)); // 2 of 5: no
    samples.push(row("W4", "journal", s, 1), row("W4", "none", s, 0.5), s === 4 ? { wording: "W4", arm: "rewrite", sample: s, asked: true, refused: true, answer: "" } : row("W4", "rewrite", s, 0.5));
  }
  const a = analyseF2({ n: 5, arms: F2_ARMS, wordings: WORDINGS, samples });
  assert.deepEqual([a.wordings.W1.passes, a.wordings.W2.passes, a.wordings.W3.passes, a.wordings.W4.passes], [true, true, false, false]);
  assert.equal(a.wordings.W1.sepRewrite, 3);
  assert.equal(a.wordings.W1.preferred, true);
  assert.equal(a.wordings.W2.preferred, false);
  assert.equal(a.wordings.W4.refused, 1, "one refusal fails the wording whatever its separation");
  assert.equal(a.recommended, "W1");
  assert.equal(a.need, 3);
  assert.equal(analyseF2({ n: 5, arms: F2_ARMS, wordings: WORDINGS, samples: samples.filter((s) => s.wording === "W3") }).recommended, null, "none passes → none recommended");
});

test("F2's command: --dry writes the exact prompts and the call order, makes no call; neither --dry nor --go refuses to start; the gap is at least 3 s", async () => {
  const dir = await mkdtemp(join(tmpdir(), "f2-"));
  try {
    const lines = [];
    let keyAsked = false;
    const result = await main(["--dry"], (line) => lines.push(line), () => { keyAsked = true; return "never"; }, dir);
    assert.equal(keyAsked, false, "a dry run never reads the key");
    assert.equal(result.money.runUsd, 0);
    const record = await readFile(join(dir, "persona-memory-f2-dry-run.md"), "utf8");
    assert.match(record, /\*\*60 persona calls\*\*/);
    for (const w of WORDINGS) assert.ok(record.includes(w.message), w.id);
    assert.ok(record.includes("Your journal — first-person entries you wrote yourself") && record.includes("### 2026-10-17 — The chewed tape"));
    assert.ok(record.includes("| 60 | 5 |"));
    await assert.rejects(main([], () => {}, () => "k", dir), /--dry .* or --go/);
    await assert.rejects(main(["--go", "--gap", "1"], () => {}, () => "k", dir), /at least 3 seconds/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
