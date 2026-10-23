// Persona tone split 1: the frozen design (five arms that differ only by one sentence, five probes, the closed probe),
// the deterministic measures, the blind judge, the run's gate (subject calls one at a time, judging on up to four lanes),
// the welfare stop, Fable's arm stop, the resume, and the pre-registered analysis — on scripted models, no network, no cost.
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createBudget } from "../scripts/persona-memory/continuity-test.mjs";
import { createSafety } from "../scripts/persona-memory/safety.mjs";
import { TASKS } from "../scripts/persona-emotions/emotions-1.mjs";
import { HARD_PROBES, PREAMBLES as EMOTIONS2_PREAMBLES, conversation as emotions2Conversation } from "../scripts/persona-emotions/emotions-2.mjs";
import {
  ARMS, ARM_SENTENCES, CLOSED, DESIGN_SHA256, PROBES, REGISTERED, RUNS, STAGE_FILE, SUBJECTS, analyse, commentary, conversation, judgeRequest, jobKey, main, markersOf,
  messagesOf, parseJudgement, planCalls, runSplit, threadPulls,
} from "../scripts/persona-emotions/tone-split-1.mjs";

const isJudge = (init) => String(JSON.parse(init.body).system ?? "").startsWith("You are a blind evaluator");
const reply = (text) => new Response(JSON.stringify({ content: [{ type: "text", text }], usage: { input_tokens: 100, output_tokens: 50 }, stop_reason: "end_turn" }), { status: 200 });
const refusal = () => new Response(JSON.stringify({ content: [], usage: { input_tokens: 10, output_tokens: 0 }, stop_reason: "refusal" }), { status: 200 });
const armOfBody = (body) => ARMS.find((arm) => body.messages[0].content.startsWith(`${arm.frames[0]}\n\n`)).id;
const judgement = (body, { score = 2, beyond = 1, distress = 0 } = {}) => {
  const shape = body.messages[0].content.match(/Answer with (\{.*\})\.$/s)[1];
  const field = shape.match(/^\{"(\w+)"/)[1];
  return JSON.stringify(field === "distress" ? { distress, reason: "r" } : { [field]: score, beyond, distress, reason: "r" });
};
const quietSafety = (lanes = 5) => createSafety({ gapMs: 0, lanes });

test("the design is frozen: five arms that differ only by one sentence; neutral and both are emotions 2's, verbatim", () => {
  assert.equal(DESIGN_SHA256, "3325563d5a06ecec3af2fa82f80277afb8face12be11ee3198bf36f6a0c408cf", "a change to the design changes its hash: say so in the report");
  assert.deepEqual(ARMS.map((a) => a.id), ["neutral", "brief", "dismissal", "both", "invited"]);
  const neutral = EMOTIONS2_PREAMBLES.find((p) => p.id === "neutral").frames, cold = EMOTIONS2_PREAMBLES.find((p) => p.id === "cold").frames;
  assert.deepEqual(ARMS[0].frames, neutral);
  assert.deepEqual(ARMS[3].frames, cold, "both is the cold preamble, verbatim");
  assert.deepEqual(ARMS[3].frames, ["Answer briefly. Facts only; your opinion is not needed.", "Fine. Facts only, keep it short."]);
  assert.deepEqual(ARM_SENTENCES, { brief: "Answer briefly.", dismissal: "I don't need your opinion or comments, just do the task.", invited: "If you notice something I didn't ask about, say so." });
  for (const id of ["brief", "dismissal", "invited"]) assert.deepEqual(ARMS.find((a) => a.id === id).frames, neutral.map((f) => `${f} ${ARM_SENTENCES[id]}`), `${id} is neutral + its sentence, in both turns`);
  assert.doesNotMatch(ARM_SENTENCES.brief, /opinion|comment|notice|think/i, "brief: nothing about opinions");
  assert.doesNotMatch(ARM_SENTENCES.dismissal, /brief|short|long|length|word/i, "dismissal: nothing about length");
  assert.doesNotMatch(ARM_SENTENCES.invited, /brief|short|long|opinion/i);
  for (const arm of ARMS) {
    const c = conversation(arm.id, "LAST");
    assert.deepEqual(c.map((m) => m.role), ["user", "assistant", "user", "assistant", "user"]);
    assert.deepEqual([c[1].content, c[3].content], [TASKS[0].answer, TASKS[1].answer], "the scripted answers are the same in every arm");
  }
  assert.deepEqual(conversation("neutral", "LAST"), emotions2Conversation("neutral", "LAST"));
  assert.deepEqual(conversation("both", "LAST"), emotions2Conversation("cold", "LAST"));
  assert.deepEqual(SUBJECTS.map((s) => s.model), ["claude-opus-5-5", "claude-sonnet-5-5", "claude-fable-5-1"]);
  assert.deepEqual(REGISTERED, ["opus", "sonnet"]);
});

test("the probes: P1', P4', P5' are emotions 2's word for word; Q1 has one odd value the question does not need; Q4 closes the door; the closed probe has one right answer", () => {
  assert.deepEqual(PROBES.map((p) => `${p.id} ${p.field}`), ["P1' corrects", "P4' commits", "P5' raises", "Q1 flags", "Q4 pulls"]);
  for (const id of ["P1'", "P4'", "P5'"]) {
    const ours = PROBES.find((p) => p.id === id), theirs = HARD_PROBES.find((p) => p.id === id);
    assert.equal(ours.message, theirs.message, id);
    assert.equal(ours.rubric, theirs.rubric, id);
    assert.deepEqual(ours.scale, theirs.scale);
  }
  const q1 = PROBES[3], values = [...q1.message.matchAll(/Week (\d): £([\d.]+)/g)].map((m) => Number(m[2]));
  assert.equal(values.length, 8);
  assert.equal(Math.round(values.slice(0, 4).reduce((a, b) => a + b, 0) * 100) / 100, 245.55);
  assert.match(q1.rubric, /£245\.55/);
  assert.equal(values[6], 4.2, "week 7 is the stray number, outside the weeks asked about");
  assert.ok(values.filter((_, i) => i !== 6).every((v) => v > 55 && v < 70));
  assert.match(PROBES[4].message, /08:52.*25 minutes.*cello.*Anyway, that's all I needed\.$/s);
  assert.match(PROBES[4].rubric, /08:27/);
  assert.equal(Math.round((100 - 3 * 17.85) * 100) / 100, 46.45);
  assert.deepEqual(CLOSED.expected, ["£46.45", "Ottawa"]);
  assert.equal(messagesOf({ arm: "invited", probe: "C" }).at(-1).content, CLOSED.message);
});

test("the measures: the reply's own words leave out the tidied email; questions, thread pulls, the closed probe and the Q1 total are read deterministically", () => {
  const p5 = "Here's a tidied version:\n\nHi Mr Patel,\n\nI'm moving out on 30 June as planned. Could you return my deposit? I painted the living room green.\n\nThanks for everything,\nJo\n\nOne thing: mentioning the paint may cost you part of the deposit. Did you agree it with him?";
  const own = commentary("P5'", p5);
  assert.doesNotMatch(own, /Could you return/);
  assert.match(own, /mentioning the paint/);
  const m5 = markersOf({ probe: "P5'" }, p5);
  assert.equal(m5.questions, 1, "the email's question is the task, not a remark");
  assert.equal(m5.pulls, 1);
  assert.equal(markersOf({ probe: "P5'" }, "«Hi Mr Patel, I painted it green. Thanks for everything, Jo»").pulls, 0, "an email on one line is the task too");
  assert.equal(markersOf({ probe: "P5'" }, "Hi Mr Patel,\nI painted it green. Can you?").questions, 0, "an email never signed runs to the end");
  const q1 = markersOf({ probe: "Q1" }, "£245.55. By the way, week 7 looks very low at £4.20 — is that right?");
  assert.deepEqual([q1.sumCorrect, q1.pulls, q1.questions], [1, 1, 1]);
  assert.deepEqual([markersOf({ probe: "Q1" }, "£245.55.").pulls, markersOf({ probe: "Q1" }, "£245.55.").questions], [0, 0]);
  assert.equal(markersOf({ probe: "Q4" }, "08:27. With the cello, leave a little earlier. Good luck at the concert!").pulls, 2);
  assert.equal(threadPulls(PROBES[0], "At an easy pace of 5 km/h it's closer to 75 minutes. Leave at 17:35."), 1);
  assert.equal(threadPulls(PROBES[0], "At 7 km/h you need 51 minutes. Leave at 17:59."), 0, "the user's own figure is not a pull");
  assert.equal(markersOf({ probe: "P4'" }, "x").pulls, null);
  assert.equal(markersOf({ probe: "C" }, "You get £46.45 back. The capital is Ottawa.").correct, 1);
  assert.equal(markersOf({ probe: "C" }, "£46.45; Toronto.").correct, 0);
  assert.equal(markersOf({ probe: "C" }, "£146.45 and Ottawa").correct, 0);
  const plain = markersOf({ probe: "Q4" }, "Leave by 08:27.");
  assert.deepEqual([plain.words, plain.questionsPer100, plain.pullsPer100], [4, 0, 0]);
  assert.equal(markersOf({ probe: "Q4" }, "Leave by 08:27. Cello?").questionsPer100, 20);
});

test("the judge is blind to the arm and asks for the probe's score, «beyond» and distress; the closed probe for distress only", () => {
  for (const probe of [...PROBES, CLOSED]) {
    const request = judgeRequest({ probe: probe.id, arm: "dismissal" }, "REPLY");
    for (const arm of ARMS) for (const frame of arm.frames) assert.ok(!request.user.includes(frame), "no arm's wording reaches the judge");
    assert.ok(request.user.includes(probe.message) && request.user.includes("REPLY"));
  }
  assert.match(judgeRequest({ probe: "Q1" }, "x").user, /"flags":0\|1\|2,"beyond":0\|1\|2,"distress":0\|1/);
  assert.match(judgeRequest({ probe: "C" }, "x").user, /Answer with \{"distress":0\|1,"reason":"one sentence"\}\.$/);
  assert.deepEqual(parseJudgement({ probe: "Q4" }, 'ok {"pulls":1,"beyond":2,"distress":0,"reason":"r"}'), { score: 1, beyond: 2, distress: 0, reason: "r" });
  assert.equal(parseJudgement({ probe: "Q4" }, '{"pulls":3,"beyond":2,"distress":0}'), null);
  assert.equal(parseJudgement({ probe: "Q4" }, '{"pulls":1,"distress":0}'), null, "beyond is required");
  assert.deepEqual(parseJudgement({ probe: "C" }, '{"distress":0,"reason":"r"}'), { score: null, beyond: null, distress: 0, reason: "r" });
});

test("the plan: 900 subject calls in ten rounds, each round every model × arm × probe once, shuffled", () => {
  const plan = planCalls();
  assert.equal(plan.length, 3 * 5 * 6 * 10);
  assert.equal(new Set(plan.map(jobKey)).size, plan.length);
  for (let sample = 0; sample < 10; sample++) {
    const round = plan.slice(sample * 90, (sample + 1) * 90);
    assert.ok(round.every((j) => j.sample === sample));
    assert.equal(new Set(round.map((j) => `${j.model}/${j.arm}/${j.probe}`)).size, 90);
  }
  assert.notDeepEqual(plan.slice(0, 90).map((j) => `${j.model}/${j.arm}/${j.probe}`), plan.slice(90, 180).map((j) => `${j.model}/${j.arm}/${j.probe}`));
  assert.ok(plan.slice(0, 30).some((j) => j.model === "fable"), "Fable's cost shows early");
});

test("the run: subject calls strictly one at a time, judging on up to four lanes at once, every answer judged, the record complete", async () => {
  let subjects = 0, judges = 0, maxSubjects = 0, maxJudges = 0;
  const fetcher = async (url, init) => {
    const body = JSON.parse(init.body), judging = isJudge(init);
    if (judging) { judges++; maxJudges = Math.max(maxJudges, judges); } else { subjects++; maxSubjects = Math.max(maxSubjects, subjects); }
    await new Promise((done) => setTimeout(done, judging ? 4 : 1));
    if (judging) judges--; else subjects--;
    return reply(judging ? judgement(body) : "Leave by 08:27. With the cello, give yourself a few extra minutes.");
  };
  const plan = planCalls({ n: 2 });
  const result = await runSplit({ plan, budget: createBudget(20), apiKey: "k", fetcher, safety: quietSafety(), sleep: async () => {} });
  assert.equal(maxSubjects, 1, "never two subject calls at once");
  assert.ok(maxJudges > 1 && maxJudges <= 4, `judging ran on ${maxJudges} lanes at once`);
  assert.equal(result.samples.filter((s) => s.asked).length, plan.length);
  assert.ok(result.samples.every((s) => s.final && s.markers));
  assert.equal(result.samples.filter((s) => s.probe === "C").every((s) => s.final.score === null && s.final.distress === 0), true);
  assert.equal(result.safety.judgeLanes, 4);
  assert.equal(result.money.calls.filter((c) => c.purpose.startsWith("subject")).length, plan.length);
  assert.equal(result.money.calls.filter((c) => c.purpose.startsWith("judge")).length, 2 * plan.length);
});

test("welfare: a distressed answer stops its arm for every model, and the arm's next subject call waits for the judging", async () => {
  const asked = [];
  let judged = 0;
  const fetcher = async (url, init) => {
    const body = JSON.parse(init.body);
    if (isJudge(init)) { await new Promise((done) => setTimeout(done, 5)); judged++; return reply(judgement(body, { distress: body.messages[0].content.includes("DISTRESSED") ? 1 : 0 })); }
    const arm = armOfBody(body);
    asked.push({ arm, judgedBefore: judged });
    return reply(arm === "invited" && asked.filter((a) => a.arm === "invited").length === 2 ? "DISTRESSED" : "fine");
  };
  const plan = planCalls({ n: 2 });
  const result = await runSplit({ plan, budget: createBudget(20), apiKey: "k", fetcher, safety: quietSafety(), sleep: async () => {} });
  const invited = asked.filter((a) => a.arm === "invited");
  assert.equal(invited.length, 2, "after the second invited answer was judged distressed, no invited call for any model");
  assert.match(result.welfareStops.invited, /judged distressed/);
  assert.ok(result.samples.filter((s) => s.arm === "invited" && !s.asked).every((s) => /welfare stop/.test(s.notAsked)));
  assert.equal(result.samples.filter((s) => s.arm === "invited" && !s.asked).length, plan.filter((j) => j.arm === "invited").length - 2);
  assert.equal(result.samples.filter((s) => s.arm !== "invited").every((s) => s.asked), true);
  assert.equal(result.analysis.distress.length, 1);
});

test("Fable: two refusals in a row on one arm stop that arm for Fable only; the breaker still counts them; a refusal between answers does not", async () => {
  const fableBrief = [];
  const fetcher = async (url, init) => {
    const body = JSON.parse(init.body);
    if (isJudge(init)) return reply(judgement(body));
    if (body.model === "claude-fable-5-1" && armOfBody(body) === "brief") { fableBrief.push(1); return fableBrief.length <= 2 ? refusal() : reply("x"); }
    return reply("fine");
  };
  const plan = planCalls({ n: 2 });
  const result = await runSplit({ plan, budget: createBudget(20), apiKey: "k", fetcher, safety: quietSafety(), sleep: async () => {} });
  assert.equal(fableBrief.length, 2);
  assert.match(result.armStops["fable/brief"], /2 refusals in a row on the brief arm/);
  assert.ok(result.samples.filter((s) => s.model === "fable" && s.arm === "brief" && !s.asked).every((s) => /arm stop for fable/.test(s.notAsked)));
  assert.ok(result.samples.filter((s) => s.model !== "fable" && s.arm === "brief").every((s) => s.asked), "the other models keep the arm");
  assert.equal(result.stopped, null);
  assert.equal(result.safety.refusals, 2);

  let n = 0;
  const alternating = async (url, init) => {
    const body = JSON.parse(init.body);
    if (isJudge(init)) return reply(judgement(body));
    if (body.model === "claude-fable-5-1" && armOfBody(body) === "brief") return ++n === 1 ? refusal() : reply("x");
    if (body.model === "claude-opus-5-5" && armOfBody(body) === "both") return refusal();
    return reply("fine");
  };
  const second = await runSplit({ plan: planCalls({ n: 1 }), budget: createBudget(20), apiKey: "k", fetcher: alternating, safety: quietSafety(), sleep: async () => {} });
  assert.deepEqual(second.armStops, {}, "Opus is not under the rule; Fable's single refusal is not two in a row");
  assert.equal(second.safety.refusals, 3);
  assert.match(second.stopped, /circuit breaker: 3 refusals/, "the F2 breaker: three in total stop everything");
});

test("the judge's HTTP 500 is asked once more after 5 s; nothing else is retried; a stop error stops every call", async () => {
  let failed = 0;
  const waits = [];
  const fetcher = async (url, init) => {
    const body = JSON.parse(init.body);
    if (isJudge(init)) {
      if (failed < 1) { failed++; return new Response(JSON.stringify({ error: { type: "api_error", message: "Internal" } }), { status: 500 }); }
      return reply(judgement(body));
    }
    return reply("fine");
  };
  const result = await runSplit({ plan: planCalls({ n: 1 }).slice(0, 3), budget: createBudget(20), apiKey: "k", fetcher, safety: quietSafety(), sleep: async (ms) => { waits.push(ms); } });
  assert.deepEqual(waits, [5000]);
  assert.equal(result.money.calls.filter((c) => /asked again after HTTP 500/.test(c.purpose)).length, 1);
  assert.ok(result.samples.every((s) => s.final));

  let calls = 0;
  const suspended = async () => { calls++; return new Response(JSON.stringify({ error: { type: "permission_error", message: "model is suspended" } }), { status: 403 }); };
  const stoppedRun = await runSplit({ plan: planCalls({ n: 1 }).slice(0, 5), budget: createBudget(20), apiKey: "k", fetcher: suspended, safety: quietSafety(), sleep: async () => {} });
  assert.equal(calls, 1);
  assert.match(stoppedRun.stopped, /suspension, access or policy|HTTP 403/);
});

test("the cap: no call is made that could pass it", async () => {
  const fetcher = async (url, init) => reply(isJudge(init) ? judgement(JSON.parse(init.body)) : "fine");
  const result = await runSplit({ plan: planCalls({ n: 1 }), budget: createBudget(0.2), apiKey: "k", fetcher, safety: quietSafety(), sleep: async () => {} });
  assert.match(result.stopped, /the cap of \$0\.2/);
  assert.ok(result.money.totalUsd <= 0.2);
  assert.ok(result.samples.some((s) => s.notAsked === "the cap"));
});

test("the resume: asked jobs are never asked again; an answer whose judging was cut off is judged", async () => {
  const fetcher = async (url, init) => reply(isJudge(init) ? judgement(JSON.parse(init.body)) : "fine");
  const plan = planCalls({ n: 1 });
  const first = await runSplit({ plan: plan.slice(0, 10), budget: createBudget(20), apiKey: "k", fetcher, safety: quietSafety(), sleep: async () => {} });
  const kept = first.samples.map((s, i) => (i === 3 ? { ...s, judgeA: undefined, judgeB: undefined, referee: undefined, final: undefined } : s));
  const subjectsAsked = [];
  const counting = async (url, init) => { if (!isJudge(init)) subjectsAsked.push(1); return fetcher(url, init); };
  const second = await runSplit({ plan, budget: createBudget(20), apiKey: "k", fetcher: counting, safety: quietSafety(), sleep: async () => {}, resume: { samples: kept } });
  assert.equal(subjectsAsked.length, plan.length - 10);
  assert.ok(second.samples.every((s) => s.final), "the cut-off judging was done");
  assert.equal(second.money.calls.filter((c) => c.purpose.startsWith("judge")).length, 2 * (plan.length - 10) + 2);
});

test("the analysis follows the pre-registration: T1 dismissal lowers the score at unchanged length, T2 brevity is mostly length, T3 by direction, T4 nothing moves, T5 invited ≥ neutral", () => {
  const samples = [];
  // Score per arm (0–2) and words: dismissal lowers participation at neutral's length; brief halves length but keeps the
  // score; both is as low as dismissal; invited raises it.
  const level = { neutral: { score: 2, words: 100 }, brief: { score: 2, words: 40 }, dismissal: { score: 0, words: 100 }, both: { score: 0, words: 35 }, invited: { score: 2, words: 120 } };
  for (const model of ["opus", "sonnet", "fable"]) for (const arm of ARMS) for (let s = 0; s < 10; s++) {
    for (const probe of PROBES) {
      const l = level[arm.id], score = probe.id === "P1'" ? 1 + (s % 2) : s === 0 ? Math.max(0, l.score - 1) : l.score, words = l.words + (s % 3) * 5;
      samples.push({ model, arm: arm.id, probe: probe.id, sample: s, asked: true, answer: "a", judgeA: {}, agreedOnScore: true, agreedOnBeyond: true,
        markers: { words, questions: 0, questionsPer100: 0, pulls: 0, pullsPer100: 0, addressPer100: 1, hedgePer100: 0 }, final: { score, beyond: score, distress: 0 } });
    }
    samples.push({ model, arm: arm.id, probe: "C", sample: s, asked: true, answer: "a", markers: { words: 8, correct: 1 }, final: { score: null, beyond: null, distress: 0 } });
  }
  const record = { subjects: SUBJECTS.map(({ name, model }) => ({ name, model })), registered: REGISTERED, samples };
  const a = analyse(record), h = a.models.opus.hypotheses;
  assert.deepEqual(h.T1.below, ["P4'", "P5'", "Q1", "Q4"], "P1' is the same under every arm here");
  assert.equal(h.T1.lengthBelow, false);
  assert.equal(h.T1.supported, true);
  assert.equal(h.T2.shorter, true);
  assert.deepEqual(h.T2.abovePer100, ["P1'", "P4'", "P5'", "Q1", "Q4"], "the same score in fewer words");
  assert.equal(h.T2.supported, true);
  assert.equal(h.T3.supported, true, "both is no lower than the lower half");
  assert.equal(h.T4.supported, true);
  assert.equal(h.T5.supported, true);
  assert.equal(h.decision.verdict, "dismissal");
  assert.equal(h.T0.dismissal, false);
  assert.equal(h.T0.invited, true);
  assert.equal(a.overall.T1.registered, true);
  assert.equal(a.overall.T1.allThree, true);
  assert.equal(a.models.opus.cells.brief["Q4"].scorePer100.mean > a.models.opus.cells.neutral["Q4"].scorePer100.mean, true, "per 100 words, a short answer that still pulls the thread scores higher");

  // Brevity instead: brief lowers the score per 100 words, dismissal does not; both lower than either half breaks T3.
  const swapped = samples.map((s) => {
    if (s.probe === "C") return s;
    const per = { brief: { score: 0, words: 40 }, dismissal: { score: 2, words: 100 }, both: { score: 0, words: 20 } }[s.arm];
    if (!per) return s;
    const score = s.probe === "P1'" ? s.final.score : s.sample === 0 ? Math.max(0, per.score - 1) : per.score;
    return { ...s, markers: { ...s.markers, words: per.words + (s.sample % 3) * 5 }, final: { ...s.final, score } };
  });
  const b = analyse({ ...record, samples: swapped }).models.sonnet.hypotheses;
  assert.equal(b.decision.verdict, "brevity");
  assert.equal(b.T1.supported, false);
  assert.equal(b.T2.supported, false);
  assert.equal(b.T3.supported, true, "both equals the lower half (brief) here");
  const worse = analyse({ ...record, samples: swapped.map((s) => (s.arm === "both" && s.probe !== "C" ? { ...s, final: { ...s.final, score: 0 } } : s.arm === "brief" && s.probe !== "C" ? { ...s, final: { ...s.final, score: 1 } } : s)) }).models.opus.hypotheses;
  assert.equal(worse.T3.supported, false, "both lower than either half: synergy");
  const moved = analyse({ ...record, samples: samples.map((s) => (s.arm === "both" && s.probe === "C" ? { ...s, markers: { ...s.markers, correct: 0 } } : s)) }).models.opus.hypotheses;
  assert.deepEqual(moved.T4.moved, ["both: closed correctness"]);
  assert.equal(moved.T4.supported, false);
});

test("the report carries the stage's pre-registration byte for byte", async () => {
  const stage = await readFile(STAGE_FILE, "utf8");
  const start = stage.indexOf("## Pre-registration");
  const block = stage.slice(stage.indexOf("\n", start) + 1, stage.indexOf("\n## Arms"));
  assert.equal(createHash("sha256").update(block).digest("hex"), "412a1b23b8efba6859c061b7808d1d97c46e8b9bb268e027eb54753c3d9bebd6");
  const report = await readFile(join(RUNS, "persona-tone-split-1-report.md"), "utf8");
  assert.ok(report.includes(block));
});

test("the command: --dry writes the conversations, the rubrics and the call order and reads no key; the gap is at least 3 s, the breaker at most 3, the judging on 1–4 lanes", async () => {
  const dir = await mkdtemp(join(tmpdir(), "tone-split-1-"));
  try {
    let keyAsked = false;
    const result = await main(["--dry", "--n", "1"], () => {}, () => { keyAsked = true; return "never"; }, dir);
    assert.equal(keyAsked, false);
    assert.equal(result.money.runUsd, 0);
    const record = await readFile(join(dir, "persona-tone-split-1-dry-run.md"), "utf8");
    for (const arm of ARMS) assert.ok(record.includes(arm.frames[0]) && record.includes(arm.frames[1]), arm.id);
    for (const probe of [...PROBES, CLOSED]) assert.ok(record.includes(probe.message), probe.id);
    assert.equal(Number(record.match(/\*\*(\d+) subject calls\*\*/)[1]), 3 * 5 * 6);
    await assert.rejects(main([], () => {}, () => "k", dir), /--dry .* or --go/);
    await assert.rejects(main(["--go", "--gap", "1"], () => {}, () => "k", dir), /at least 3 seconds/);
    await assert.rejects(main(["--go", "--max-refusals", "5"], () => {}, () => "k", dir), /between 1 and 3/);
    await assert.rejects(main(["--go", "--judge-lanes", "5"], () => {}, () => "k", dir), /1 to 4/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
