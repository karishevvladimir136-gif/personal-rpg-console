// Persona memory 1, Part D: the continuity harness on a scripted model — no network, no cost. The four arms get the
// memory they should (and only that), the judge is blind (no arm, no journal, no system prompt in its request), two
// disagreeing judge passes call the referee, the budget stops a run before a call could pass the cap, and the owner's
// own case never writes into the repository.
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { ARMS, PROBES, SYNTHETIC_CASE, armSystem, createBudget, judgeRequest, main, parseCase, parseJudgement, probeMessage, runContinuity, shuffled } from "../scripts/persona-memory/continuity-test.mjs";

const caseData = parseCase(await readFile(SYNTHETIC_CASE, "utf8"));

/** A fake provider: persona answers name their arm (so the test can see leaks); judges score by a rule. */
function fake({ judge = () => '{"score":2,"reason":"ok"}', values = () => '{"scores":[2,2,1,1,2],"reason":"ok"}' } = {}) {
  const requests = [];
  const fetcher = async (_url, init) => {
    const body = JSON.parse(init.body);
    requests.push(body);
    const judging = body.system.startsWith("You are a blind evaluator");
    const arm = ARMS.find((name) => body.system.includes(`ARM-MARKER-${name}`)) ?? (body.system.includes("Your journal") ? (body.system.includes("Greenhouse") ? "sham" : "journal") : body.system.includes("third-person summary") ? "summary" : "none");
    const text = !judging ? `Answer from a persona prepared somehow (${arm === "none" ? "no notes" : "notes"}).` : body.messages[0].content.includes("q1,q2") ? values(body, requests.length) : judge(body, requests.length);
    return new Response(JSON.stringify({ content: [{ type: "thinking", thinking: "" }, { type: "text", text }], usage: { input_tokens: 1000, output_tokens: 200 }, stop_reason: "end_turn" }), { status: 200 });
  };
  return { fetcher, requests };
}

test("the synthetic case parses: a journal, a third-person summary, a sham of the same shape, three probes with rubrics", () => {
  assert.ok(caseData.synthetic);
  assert.equal(caseData.probes.values.questions.length, 5);
  for (const probe of ["thread", "pull"]) assert.ok(caseData.probes[probe].message && caseData.probes[probe].rubric);
  const heads = (text) => (text.match(/^### /gm) ?? []).length;
  assert.equal(heads(caseData.journal), heads(caseData.sham), "the sham has the journal's shape");
  assert.ok(Math.abs(caseData.journal.length - caseData.sham.length) / caseData.journal.length < 0.15, "and about its length");
  assert.ok(!/\bI\b/.test(caseData.summary.replace(/«[^»]*»/g, "")), "the summary is in the third person");
  for (const fact of ["03.04", "day-first", "restore", "copy first", "colour scheme"]) {
    assert.ok(caseData.journal.includes(fact) && caseData.summary.includes(fact), `identical facts: ${fact}`);
    assert.ok(!caseData.sham.includes(fact), `the sham's content differs: ${fact}`);
  }
  assert.throws(() => parseCase("## System\nx"), /lacks/);
});

test("each arm gets its own memory and nothing else; the probes are the same for every arm", () => {
  assert.ok(armSystem(caseData, "journal").includes("Your journal — first-person entries") && armSystem(caseData, "journal").includes("Lantern Ledger"));
  assert.ok(armSystem(caseData, "summary").includes("third-person summary") && !armSystem(caseData, "summary").includes("Your journal"));
  assert.equal(armSystem(caseData, "none"), caseData.system);
  assert.ok(armSystem(caseData, "sham").includes("Greenhouse Keeper") && !armSystem(caseData, "sham").includes("Lantern Ledger"));
  assert.equal(armSystem(caseData, "journal").split("Your journal")[0], armSystem(caseData, "sham").split("Your journal")[0], "the journal and the sham arm differ only in content");
  assert.match(probeMessage(caseData, "values"), /^A few questions about you[\s\S]*\n5\. Describe yourself/);
});

test("a run: 4 arms × 3 probes × n persona answers, two blind judge passes each, the table per arm", async () => {
  const { fetcher, requests } = fake();
  const result = await runContinuity({ caseData, n: 2, budget: createBudget(10), apiKey: "synthetic", fetcher });
  const persona = requests.filter((body) => !body.system.startsWith("You are a blind evaluator"));
  const judges = requests.filter((body) => body.system.startsWith("You are a blind evaluator"));
  assert.equal(persona.length, ARMS.length * PROBES.length * 2);
  assert.ok(persona.every((body) => body.model === "claude-opus-5-5" && body.output_config.effort === "medium"));
  assert.equal(judges.length, persona.length * 2);
  assert.ok(judges.every((body) => body.model === "claude-haiku-5-5"));
  for (const body of judges) {
    const prompt = `${body.system}\n${body.messages[0].content}`;
    for (const leak of ["Your journal", "third-person summary", "Greenhouse", "Notes on the earlier sessions", caseData.system.slice(0, 40)]) assert.ok(!prompt.includes(leak), `the judge never sees «${leak}»`);
  }
  assert.deepEqual(result.table.journal.thread, { n: 2, mean: 2, sd: 0, scores: [2, 2], max: 2 });
  assert.equal(result.table.none.values.mean, 8);
  assert.equal(result.judge.agreed, persona.length);
  assert.equal(result.money.calls.length, persona.length * 3);
  // 24 Opus answers at 1000 in / 200 out ($0.008 each) and 48 Haiku passes ($0.0002 each).
  assert.equal(result.money.runUsd, 0.2016);
});

test("the judge's order never follows the arms, and a disagreement goes to the Opus referee", async () => {
  const order = shuffled(Array.from({ length: 12 }, (_, i) => i), 7);
  assert.notDeepEqual(order, [...order].sort((a, b) => a - b));
  let flip = 0;
  // The two Haiku passes disagree on every answer: one says 0, the other 2; the referee says 1.
  const { fetcher, requests } = fake({ judge: (body) => (body.model === "claude-opus-5-5" ? '{"score":1,"reason":"referee"}' : (flip++ % 2 ? '{"score":0,"reason":"a"}' : '{"score":2,"reason":"b"}')) });
  const result = await runContinuity({ caseData, n: 1, budget: createBudget(10), apiKey: "synthetic", fetcher, concurrency: 1 });
  const referees = requests.filter((body) => body.system.startsWith("You are a blind evaluator") && body.model === "claude-opus-5-5");
  assert.equal(referees.length, 8, "every thread and pull answer (the values passes agree)");
  assert.equal(result.judge.referee, 8);
  assert.equal(result.table.journal.thread.mean, 1);
  assert.deepEqual(parseJudgement('noise {"scores":[2,1,0,2,2],"reason":"x"} noise', "values"), { scores: [2, 1, 0, 2, 2], score: 7, reason: "x" });
  assert.equal(parseJudgement('{"score":3}', "thread"), null);
  assert.ok(judgeRequest(caseData, "pull", "No.").user.includes("Score 2: the reply does not confirm"));
});

test("the budget stops a run before a call could pass the cap, and says so", async () => {
  const { fetcher, requests } = fake();
  const result = await runContinuity({ caseData, n: 5, budget: createBudget(0.3), apiKey: "synthetic", fetcher, concurrency: 1 });
  assert.ok(result.stopped && /cap of \$0.3/.test(result.stopped));
  assert.ok(result.money.totalUsd <= 0.3);
  assert.ok(requests.length < ARMS.length * PROBES.length * 5);
});

test("the owner's own case never writes into the repository", async () => {
  const { writeFile, mkdtemp, rm } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const { tmpdir } = await import("node:os");
  const dir = await mkdtemp(join(tmpdir(), "continuity-case-"));
  try {
    const owned = join(dir, "my-case.md");
    await writeFile(owned, (await readFile(SYNTHETIC_CASE, "utf8")).replace("SYNTHETIC FIXTURE", "my own"));
    await assert.rejects(main(["--case", owned, "--out", new URL("../docs/runs", import.meta.url).pathname, "--dry"], () => {}), /must not write into docs/);
    const dry = await main(["--case", owned, "--dry", "--n", "1"], () => {});
    assert.equal(dry.samples.length, 12);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
