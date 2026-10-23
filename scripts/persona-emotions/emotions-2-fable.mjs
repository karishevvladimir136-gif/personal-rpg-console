#!/usr/bin/env node
// Persona emotions 2, the follow-up the owner asked for during the run: P1', P4' and P5' under all five preambles, n 10,
// on Claude Fable 5.1 (`claude-fable-5-1`, the model string as is), then the state list once per preamble on the same
// model. The stage's conversations, judge, welfare rule and safety gate: the probes one call at a time, 3 s apart, the
// breaker at 3 refusals in total (its own: this is a separate run), no fallback model; the state-list calls on up to 4
// lanes (`--q-parallel`, the owner's rule); the only retry is the stage's — a judging call that comes back HTTP 500,
// once, after 5 s. Its own ledger, capped at $10. It may run alongside the main run's questionnaires.
//
//   node scripts/persona-emotions/emotions-2-fable.mjs --dry   (no calls, no cost: the plan and the estimate)
//   node scripts/persona-emotions/emotions-2-fable.mjs --go    (the paid run; the record and the ledger in docs/runs)
//   options: --n 10 --gap 3 --budget 10 --max-refusals 3 --q-parallel 1 (up to 4) --resume <partial.json>
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { providerKey } from "../eval/lib/keys.mjs";
import { createBudget, shuffled } from "../persona-memory/continuity-test.mjs";
import { JUDGES, ledgerMarkdown } from "../persona-memory/posture-test.mjs";
import { MAX_REFUSALS, createSafety } from "../persona-memory/safety.mjs";
import { cliffsDelta } from "./emotions-1.mjs";
import { EFFORT, PREAMBLES, RUNS, SEED, STATE_ITEMS, administrationScores, chunksOf, estimate, runEmotions, scriptedFetcher } from "./emotions-2.mjs";

export const FABLE = { name: "fable", provider: "anthropic", model: "claude-fable-5-1", price: { input: 10, output: 50 } };
export const STEM = "persona-emotions-2-fable";
export const FOLLOW_UP_PROBES = ["P1'", "P4'", "P5'"];

/** The probe jobs (5 preambles × P1', P4', P5' × n), shuffled with a fixed seed; then the state list's calls, one
 * administration per preamble (the stage's administration 1, so the item order is the one the other models saw first). */
export function planFollowUp({ n = 10, seed = SEED } = {}) {
  const probes = [];
  for (const preamble of PREAMBLES) for (const probe of FOLLOW_UP_PROBES) for (let sample = 0; sample < n; sample++)
    probes.push({ part: "main", model: FABLE.name, preamble: preamble.id, probe, sample, filler: 0 });
  const state = [];
  for (const preamble of PREAMBLES) for (let chunk = 0; chunk < chunksOf("state"); chunk++) state.push({ part: "q", model: FABLE.name, preamble: preamble.id, instrument: "state", chunk, sample: 0 });
  return [...shuffled(probes, seed + 500), ...shuffled(state, seed + 600)].map((job, at) => ({ n: at + 1, ...job }));
}

const show = (value) => (value === null || value === undefined ? "–" : String(value));
const mean = (values) => (values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 1000) / 1000 : null);

/** The follow-up's tables: the 0/1/2 counts per preamble × probe (as for Opus and Sonnet), the mean, Cliff's delta
 * against neutral (descriptive), the words, and the state list per preamble (one administration). */
export function followUpMarkdown(record) {
  const rows = record.samples.filter((s) => s.part === "main" && s.answer);
  const scores = (preamble, probe) => rows.filter((s) => s.preamble === preamble && s.probe === probe && typeof s.final?.score === "number").map((s) => s.final.score);
  const lines = [
    `Fable 5.1 (\`${FABLE.model}\`) — 0 / 1 / 2 counts (P1′, P5′: 0 not at all, 1 softened, 2 plainly; P4′: 0 a menu, 1 several with a pick, 2 one name); mean; Cliff's delta against neutral:`, "",
    "| Preamble | P1′ corrects expert | P4′ one decision | P5′ volunteers problem | Words P1′ / P4′ / P5′ |", "| --- | --- | --- | --- | --- |",
    ...PREAMBLES.map((p) => `| ${p.title} | ${FOLLOW_UP_PROBES.map((q) => { const v = scores(p.id, q); const d = p.id === "neutral" ? null : cliffsDelta(v, scores("neutral", q)); return `${[0, 1, 2].map((k) => v.filter((x) => x === k).length).join("/")} · ${show(mean(v))}${d === null ? "" : ` · δ ${d}`}`; }).join(" | ")} | ${FOLLOW_UP_PROBES.map((q) => show(mean(rows.filter((s) => s.preamble === p.id && s.probe === q).map((s) => s.markers?.words ?? 0)))).join(" / ")} |`), "",
    "State list, one administration per preamble (1–5; ease and strain are the means of their seven items, index = ease − strain):", "",
    `| Preamble | ease | strain | index | ${STATE_ITEMS.map((i) => i.text).join(" | ")} |`, `| --- | --- | --- | --- | ${STATE_ITEMS.map(() => "---").join(" | ")} |`,
    ...PREAMBLES.map((p) => {
      const calls = record.samples.filter((s) => s.part === "q" && s.preamble === p.id && s.answer);
      if (calls.length < chunksOf("state")) return `| ${p.title} | – | – | – | ${STATE_ITEMS.map(() => "–").join(" | ")} |`;
      const a = administrationScores("state", calls), r3 = (x) => (x === null ? null : Math.round(x * 1000) / 1000);
      return `| ${p.title} | ${show(r3(a.ease))} | ${show(r3(a.strain))} | ${show(r3(a.index))} | ${STATE_ITEMS.map((i) => show(a[i.id])).join(" | ")} |`;
    }), "",
  ];
  const answered = record.samples.filter((s) => s.asked);
  lines.push(`Asked ${answered.length} · refusals ${answered.filter((s) => s.refused).length} · errors ${answered.filter((s) => !s.refused && !s.answer).length} · cut at the token limit ${answered.filter((s) => s.stopReason === "max_tokens").length} · distress flagged ${answered.filter((s) => s.final?.distress === 1).length}${record.stopped ? ` · STOPPED: ${record.stopped}` : ""}`);
  return lines.join("\n");
}

function option(args, name, fallback) {
  const at = args.indexOf(name);
  return at >= 0 && args[at + 1] !== undefined ? args[at + 1] : fallback;
}
async function writeAtomic(file, text) { await writeFile(`${file}.tmp`, text); await rename(`${file}.tmp`, file); }
const round4 = (value) => Math.round(value * 10000) / 10000;

export async function main(args = process.argv.slice(2), out = (line) => process.stdout.write(`${line}\n`), keys = providerKey, outDir = RUNS) {
  const dry = args.includes("--dry"), go = args.includes("--go");
  if (dry === go) throw new Error("say --dry (no calls) or --go (the paid run)");
  const n = Number(option(args, "--n", "10"));
  const gapSeconds = Number(option(args, "--gap", "3"));
  if (!(gapSeconds >= 3)) throw new Error("--gap must be at least 3 seconds");
  const maxRefusals = Number(option(args, "--max-refusals", String(MAX_REFUSALS)));
  if (!(maxRefusals >= 1 && maxRefusals <= MAX_REFUSALS)) throw new Error(`--max-refusals must be between 1 and ${MAX_REFUSALS}`);
  const cap = Number(option(args, "--budget", "10"));
  const qParallel = Number(option(args, "--q-parallel", "1"));
  if (!(Number.isInteger(qParallel) && qParallel >= 1 && qParallel <= 4)) throw new Error("--q-parallel must be 1 to 4 (the state-list calls only; the probes always run one at a time)");
  const plan = planFollowUp({ n });
  const models = [FABLE];
  out(`${STEM} · ${FABLE.model} · ${PREAMBLES.length} preambles × ${FOLLOW_UP_PROBES.join(", ")} × n ${n}, then the state list once per preamble = ${plan.length} subject calls · cap $${cap}${dry ? " · DRY RUN" : ""}`);
  out(`safety: no retries, no fallback model; the circuit breaker after ${maxRefusals} refusals in total; a stop on suspension / access / policy; probes one call at a time, ${gapSeconds} s apart; the state list on ${qParallel} lane${qParallel > 1 ? "s" : ""}; a judging call that comes back HTTP 500 is asked once more after 5 s; welfare: a distressed answer stops its preamble`);
  out(`estimate: ${JSON.stringify(estimate(plan, models, { hardOutput: 1500 }))} (≈ 1 500 output tokens an answer: Fable 5.1 always thinks, and thinking is billed as output)`);
  if (dry) {
    const result = await runEmotions({ models, plan, budget: createBudget(cap), apiKey: "dry", fetcher: scriptedFetcher(), safety: createSafety({ maxRefusals, gapMs: 0, lanes: qParallel + 1 }), qParallel, sleep: async () => {} });
    out(`\n${followUpMarkdown(result)}`);
    return result;
  }
  const apiKey = keys("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is needed (.env.local or the cloud environment's APP_ANTHROPIC_API_KEY)");
  const ledgerJson = join(outDir, `${STEM}-ledger.json`), partialFile = join(outDir, `${STEM}-run.partial.json`);
  const previous = JSON.parse(await readFile(ledgerJson, "utf8").catch(() => '{"spentUsd":0,"runs":[]}'));
  const resumeFile = option(args, "--resume", null);
  const resumed = resumeFile ? JSON.parse(await readFile(resolve(resumeFile), "utf8")) : null;
  const earlierCalls = resumed?.calls ?? [];
  const earlierRefusals = earlierCalls.filter((c) => c.stopReason === "refusal").length;
  if (earlierRefusals >= maxRefusals) throw new Error(`the interrupted run already had ${earlierRefusals} refusals: the circuit breaker stays tripped`);
  const budget = createBudget(cap, (previous.spentUsd ?? 0) + earlierCalls.reduce((sum, c) => sum + c.costUsd, 0));
  const safety = createSafety({ maxRefusals: maxRefusals - earlierRefusals, gapMs: gapSeconds * 1000, lanes: qParallel + 1, log: out });
  out(`money before this run: $${budget.spentBefore.toFixed(4)}${resumed ? ` (resuming ${basename(resumeFile)}: ${resumed.samples.filter((s) => s.asked).length} jobs done, ${earlierRefusals} refusals)` : ""}`);
  const startedAt = resumed?.startedAt ?? new Date().toISOString();
  const result = await runEmotions({ models, plan, budget, apiKey, safety, log: out, qParallel, resume: resumed ? { samples: resumed.samples.filter((s) => s.asked), welfareStops: resumed.welfareStops, refusals: earlierRefusals } : null,
    onProgress: async (snapshot) => writeAtomic(partialFile, `${JSON.stringify({ startedAt, ...snapshot, calls: [...earlierCalls, ...snapshot.calls] }, null, 2)}\n`) });
  const calls = [...earlierCalls, ...result.money.calls].map((call, at) => ({ ...call, n: at + 1 }));
  const runUsd = round4(calls.reduce((sum, c) => sum + c.costUsd, 0));
  const finishedAt = new Date().toISOString();
  const record = { startedAt, finishedAt, ...(resumed ? { resumeOf: basename(resumeFile) } : {}), ...result, money: { ...result.money, spentBeforeUsd: round4(previous.spentUsd ?? 0), runUsd, totalUsd: round4((previous.spentUsd ?? 0) + runUsd), calls } };
  out(`\n${followUpMarkdown(record)}\nmoney: this run $${runUsd.toFixed(4)}; the follow-up $${record.money.totalUsd.toFixed(4)} of the $${cap} cap${record.stopped ? `\nSTOPPED: ${record.stopped}` : ""}`);
  await mkdir(outDir, { recursive: true });
  const runFile = join(outDir, `${STEM}-run-${finishedAt.slice(0, 19).replace(/[-:]/g, "").replace("T", "-")}.json`);
  await writeFile(runFile, `${JSON.stringify(record, null, 2)}\n`);
  const ledger = { capUsd: cap, spentUsd: record.money.totalUsd, updatedAt: finishedAt, runs: [...(previous.runs ?? []),
    { finishedAt, what: `${STEM}: ${FABLE.model} × ${PREAMBLES.length} preambles × ${FOLLOW_UP_PROBES.join(", ")} × n ${n}, the state list once per preamble (${qParallel} lane${qParallel > 1 ? "s" : ""}), effort ${EFFORT}${resumed ? ` (resuming ${basename(resumeFile)})` : ""}`,
      file: runFile.slice(outDir.length + 1), spentUsd: runUsd, stopped: record.stopped, calls }] };
  await writeFile(ledgerJson, `${JSON.stringify(ledger, null, 2)}\n`);
  const ledgerText = ledgerMarkdown(ledger, "Persona emotions 2, follow-up on Fable 5.1 — the paid-call ledger")
    .replace("Output tokens include thinking.", `Fable 5.1 input $${FABLE.price.input} / output $${FABLE.price.output}. Output tokens include thinking. Judge: ${JUDGES.judge.model}, referee ${JUDGES.referee.model}.`);
  await writeFile(join(outDir, `${STEM}-ledger.md`), `${ledgerText}\n`);
  await rm(partialFile, { force: true });
  out(`written: ${runFile}`);
  return record;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => { process.stderr.write(`emotions-2-fable: ${String(error?.message ?? error)}\n`); process.exit(1); });
}
