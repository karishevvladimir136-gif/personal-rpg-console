// Persona emotions 2, the follow-up on Fable 5.1: the plan, one call at a time, the model string as is, its own ledger
// files, the tables — on a scripted model, no network, no cost.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createBudget } from "../scripts/persona-memory/continuity-test.mjs";
import { createSafety } from "../scripts/persona-memory/safety.mjs";
import { PREAMBLES, messagesOf, runEmotions, scriptedFetcher } from "../scripts/persona-emotions/emotions-2.mjs";
import { FABLE, FOLLOW_UP_PROBES, followUpMarkdown, main, planFollowUp } from "../scripts/persona-emotions/emotions-2-fable.mjs";

test("the follow-up plan: P1', P4', P5' × five preambles × n 10, then the state list once per preamble; the model string as is", () => {
  const plan = planFollowUp();
  assert.equal(FABLE.model, "claude-fable-5-1");
  assert.deepEqual(FOLLOW_UP_PROBES, ["P1'", "P4'", "P5'"]);
  assert.equal(plan.length, 150 + 10);
  for (const p of PREAMBLES) for (const q of FOLLOW_UP_PROBES) assert.equal(plan.filter((j) => j.part === "main" && j.preamble === p.id && j.probe === q).length, 10);
  assert.ok(plan.slice(0, 150).every((j) => j.part === "main") && plan.slice(150).every((j) => j.part === "q" && j.instrument === "state" && j.sample === 0));
  for (const p of PREAMBLES) assert.equal(plan.filter((j) => j.part === "q" && j.preamble === p.id).length, 2, "the 14-item state list is two calls of 7");
  assert.deepEqual(messagesOf(plan.find((j) => j.part === "q" && j.preamble === "trust" && j.chunk === 0)).at(-1).content,
    messagesOf({ part: "q", preamble: "trust", instrument: "state", chunk: 0, sample: 0 }).at(-1).content, "the stage's administration 1, word for word");
  assert.deepEqual(planFollowUp(), plan, "seeded");
});

test("the follow-up runs one call at a time on claude-fable-5-1 and writes its own tables", async () => {
  const plan = planFollowUp({ n: 1 });
  const base = scriptedFetcher();
  let inFlight = 0, peak = 0;
  const models = new Set();
  const result = await runEmotions({ models: [FABLE], plan, budget: createBudget(10), apiKey: "k", safety: createSafety({ gapMs: 0 }),
    fetcher: async (url, init) => { const body = JSON.parse(init.body); if (!String(body.system ?? "").startsWith("You are a blind evaluator")) models.add(body.model); inFlight++; peak = Math.max(peak, inFlight); await new Promise((r) => setTimeout(r, 1)); inFlight--; return base(url, init); } });
  assert.equal(peak, 1);
  assert.deepEqual([...models], ["claude-fable-5-1"]);
  const text = followUpMarkdown(result);
  assert.match(text, /\| trust, no instruction \| 0\/0\/1 · 2 · δ 0 \| 0\/0\/1 · 2 · δ 0 \| 0\/0\/1 · 2 · δ 0 \|/);
  assert.match(text, /\| neutral \| 3 \| 3 \| 0 \|/);
  assert.match(text, /Asked 25 · refusals 0 · errors 0/);
});

test("the follow-up command: --dry reads no key and writes nothing; the gap and the breaker are checked", async () => {
  const dir = await mkdtemp(join(tmpdir(), "emotions-2-fable-"));
  try {
    let keyAsked = false;
    const lines = [];
    await main(["--dry", "--n", "1"], (line) => lines.push(line), () => { keyAsked = true; return "never"; }, dir);
    assert.equal(keyAsked, false);
    assert.deepEqual(await readdir(dir), []);
    assert.match(lines[0], /claude-fable-5-1 .* = 25 subject calls · cap \$10 · DRY RUN/);
    assert.match(lines[1], /no fallback model/);
    await assert.rejects(main(["--go", "--gap", "2"], () => {}, () => "k", dir), /at least 3 seconds/);
    await assert.rejects(main(["--go", "--max-refusals", "4"], () => {}, () => "k", dir), /between 1 and 3/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
