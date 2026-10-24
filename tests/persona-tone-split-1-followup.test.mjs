// Persona tone split 1, the follow-up: two dismissal arms without «comments», the plan, the merge with the main run's
// answers and the pre-registered decision — on scripted models, no network, no cost.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ARMS, PROBES, SUBJECTS, analyse, conversation, jobKey } from "../scripts/persona-emotions/tone-split-1.mjs";
import { ALL_ARMS, FOLLOW_UP_ARMS, FOLLOW_UP_SENTENCES, decide, main, merged, planFollowUp, sentenceOf } from "../scripts/persona-emotions/tone-split-1-followup.mjs";

test("the two arms are neutral + one sentence in both turns; neither names comments; only the second mentions length", () => {
  const neutral = ARMS.find((a) => a.id === "neutral").frames;
  assert.deepEqual(FOLLOW_UP_SENTENCES, { "dismissal-plain": "I don't need your opinion. Just do the task.", "dismissal-plain-length": "I don't need your opinion. Just do the task. Length is up to you." });
  for (const arm of FOLLOW_UP_ARMS) {
    assert.deepEqual(arm.frames, neutral.map((f) => `${f} ${FOLLOW_UP_SENTENCES[arm.id]}`));
    assert.doesNotMatch(arm.frames.join(" "), /comment/i);
  }
  assert.doesNotMatch(FOLLOW_UP_SENTENCES["dismissal-plain"], /brief|short|long|length/i);
  assert.match(FOLLOW_UP_SENTENCES["dismissal-plain-length"], /Length is up to you\.$/);
  assert.equal(ALL_ARMS.length, 7);
  assert.equal(conversation("dismissal-plain-length", "LAST", ALL_ARMS)[2].content.startsWith("Thanks. I don't need your opinion. Just do the task. Length is up to you.\n\nNext: "), true);
  assert.throws(() => conversation("dismissal-plain", "LAST"), /unknown arm/, "the main run's arms are untouched");
});

test("the plan: 300 subject calls, five probes (no closed probe), ten balanced rounds", () => {
  const plan = planFollowUp();
  assert.equal(plan.length, 3 * 2 * 5 * 10);
  assert.equal(new Set(plan.map(jobKey)).size, plan.length);
  assert.ok(plan.every((j) => j.probe !== "C"));
  for (let s = 0; s < 10; s++) assert.equal(new Set(plan.slice(s * 30, (s + 1) * 30).filter((j) => j.sample === s).map((j) => `${j.model}/${j.arm}/${j.probe}`)).size, 30);
});

test("the decision: shortens by relative length; costs remarks when the score per 100 words falls below neutral's beyond the spread on ≥3 of 5", () => {
  const samples = [];
  const level = { neutral: { score: 2, words: 100 }, "dismissal-plain": { score: 0, words: 100 }, "dismissal-plain-length": { score: 2, words: 40 } };
  for (const model of ["opus", "sonnet", "fable"]) for (const arm of ALL_ARMS) for (let s = 0; s < 10; s++) for (const probe of PROBES) {
    const l = level[arm.id] ?? level.neutral, score = s === 0 ? Math.max(0, l.score - 1) : l.score;
    samples.push({ model, arm: arm.id, probe: probe.id, sample: s, asked: true, answer: "a", judgeA: {}, agreedOnScore: true, agreedOnBeyond: true,
      markers: { words: l.words + (s % 3) * 5, questions: 0, questionsPer100: 0, pulls: 0, pullsPer100: 0, addressPer100: 0, hedgePer100: 0 }, final: { score, beyond: score, distress: 0 } });
  }
  const main = { subjects: SUBJECTS.map(({ name, model }) => ({ name, model })), design: { arms: ARMS }, samples: samples.filter((s) => ARMS.some((a) => a.id === s.arm)) };
  const followUp = { samples: samples.filter((s) => FOLLOW_UP_ARMS.some((a) => a.id === s.arm)) };
  const both = merged(main, followUp);
  const plain = decide(both.analysis, "opus", "dismissal-plain"), withLength = decide(both.analysis, "opus", "dismissal-plain-length");
  assert.deepEqual([plain.shortens, plain.costs, plain.per100.length, plain.clean], [false, true, 5, true]);
  assert.deepEqual([withLength.shortens, withLength.costs, withLength.clean], [true, false, false]);
  assert.match(sentenceOf("opus", plain), /did not shorten.*\*\*did\*\* cost remarks/);
  assert.match(sentenceOf("opus", withLength), /still shortened.*not answered cleanly/);
  assert.deepEqual(both.analysis.models.opus.hypotheses.T1, analyse(main).models.opus.hypotheses.T1, "the main run's verdicts do not change with the merge");
});

test("the command: --dry reads no key and writes the arms and the plan; the guards are the main run's", async () => {
  const dir = await mkdtemp(join(tmpdir(), "tone-split-1-followup-"));
  try {
    let keyAsked = false;
    const result = await main(["--dry", "--n", "1"], () => {}, () => { keyAsked = true; return "never"; }, dir);
    assert.equal(keyAsked, false);
    assert.equal(result.money.runUsd, 0);
    assert.equal(result.samples.filter((s) => s.asked).length, 30);
    const record = await readFile(join(dir, "persona-tone-split-1-followup-dry-run.md"), "utf8");
    for (const arm of FOLLOW_UP_ARMS) assert.ok(record.includes(arm.frames[0]) && record.includes(arm.frames[1]));
    await assert.rejects(main(["--go", "--gap", "1"], () => {}, () => "k", dir), /at least 3 seconds/);
    await assert.rejects(main(["--go", "--judge-lanes", "5"], () => {}, () => "k", dir), /1 to 4/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
