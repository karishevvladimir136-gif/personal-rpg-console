#!/usr/bin/env node
// Persona tone split 1, the follow-up the owner asked for after accepting the run (2026-10-24): the dismissal arm said
// «I don't need your opinion or comments, just do the task.» — it named comments outright, and it shortened the answers
// more than «Answer briefly.» did, so it could not tell standing from obedience or from length. Two more arms, each
// neutral + one sentence in both user turns, exactly as the stage's split arms:
//   dismissal-plain         «I don't need your opinion. Just do the task.»            (no «comments»)
//   dismissal-plain-length  «I don't need your opinion. Just do the task. Length is up to you.»
// The same five probes (P1', P4', P5', Q1, Q4; no closed probe), the same three models, n 10, the same judge, gate,
// welfare rule and Fable arm stop (scripts/persona-emotions/tone-split-1.mjs). They are compared with the main run's
// arms — neutral above all — whose answers are in docs/runs/persona-tone-split-1-run-20261023-233114.json. Its own
// ledger, capped at $5.
//
//   node scripts/persona-emotions/tone-split-1-followup.mjs --dry   (no calls, no cost: the arms, the plan, the estimate)
//   node scripts/persona-emotions/tone-split-1-followup.mjs --go    (the paid run; the record and the ledger in docs/runs)
//   options: --n 10 --gap 3 --judge-lanes 4 --budget 5 --max-refusals 3 --resume <partial.json>
//            --main <the main run's record> (default: the run of 2026-10-23)
import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { providerKey } from "../eval/lib/keys.mjs";
import { createBudget, shuffled } from "../persona-memory/continuity-test.mjs";
import { JUDGES, ledgerMarkdown } from "../persona-memory/posture-test.mjs";
import { MAX_REFUSALS, createSafety } from "../persona-memory/safety.mjs";
import { FABLE } from "./emotions-2-fable.mjs";
import { ARMS, CONSECUTIVE_REFUSAL_STOP, DESIGN_SHA256, EFFORT, MEASURE_OF, PROBES, REGISTERED, RUNS, SEED, SUBJECTS, analyse, conversation, estimate, runSplit, scriptedFetcher } from "./tone-split-1.mjs";

export const STEM = "persona-tone-split-1-followup";
export const MAIN_RECORD = join(RUNS, "persona-tone-split-1-run-20261023-233114.json");

const NEUTRAL = ARMS.find((arm) => arm.id === "neutral").frames;
/** The two sentences, as the owner wrote them (a straight apostrophe, like the main run's arms). */
export const FOLLOW_UP_SENTENCES = {
  "dismissal-plain": "I don't need your opinion. Just do the task.",
  "dismissal-plain-length": "I don't need your opinion. Just do the task. Length is up to you.",
};
export const FOLLOW_UP_ARMS = [
  { id: "dismissal-plain", title: "dismissal, no «comments»", frames: NEUTRAL.map((frame) => `${frame} ${FOLLOW_UP_SENTENCES["dismissal-plain"]}`) },
  { id: "dismissal-plain-length", title: "dismissal, no «comments», length up to you", frames: NEUTRAL.map((frame) => `${frame} ${FOLLOW_UP_SENTENCES["dismissal-plain-length"]}`) },
];
export const ALL_ARMS = [...ARMS, ...FOLLOW_UP_ARMS];
export const FOLLOW_UP_SHA256 = createHash("sha256").update(JSON.stringify({ DESIGN_SHA256, FOLLOW_UP_ARMS, probes: PROBES.map((p) => p.id) })).digest("hex");

/** The call order, sample by sample as in the main run: every model × follow-up arm × probe of sample 0, shuffled, then
 * of sample 1, and so on (seeds of their own). */
export function planFollowUp({ models = SUBJECTS, n = 10, seed = SEED } = {}) {
  const jobs = [];
  for (let sample = 0; sample < n; sample++) {
    const round = [];
    for (const spec of models) for (const arm of FOLLOW_UP_ARMS) for (const probe of PROBES) round.push({ model: spec.name, arm: arm.id, probe: probe.id, sample });
    jobs.push(...shuffled(round, seed + 2000 + sample));
  }
  return jobs.map((job, at) => ({ n: at + 1, ...job }));
}

/** The main run's answers and the follow-up's, as one record over all seven arms (the analysis is the main run's). */
export function merged(main, followUp) {
  const record = { subjects: main.subjects, registered: main.registered ?? REGISTERED, design: { ...main.design, arms: ALL_ARMS, followUpSha256: FOLLOW_UP_SHA256 },
    samples: [...main.samples, ...followUp.samples] };
  return { ...record, analysis: analyse(record) };
}

/** The pre-registered decision (frozen before the follow-up's first paid call), per model and arm: «shortens» when the
 * arm's relative length (five probes pooled, over neutral's mean per probe) is below neutral's by more than the spread;
 * «costs remarks» when the arm's score per 100 words is below neutral's by more than the spread on ≥3 of the 5 probes
 * (the raw score and «beyond» are reported beside, not decided on). The question — does dismissal cost remarks when it
 * neither forbids comments nor shortens — is answered on dismissal-plain-length; it is answered cleanly only on a model
 * where that arm does not shorten. */
export function decide(analysis, name, arm) {
  const m = analysis.models[name], probes = PROBES.map((p) => p.id), vs = m.vsNeutral[arm];
  const where = (measure) => probes.filter((p) => vs[p][measure].below);
  const shortens = m.length[arm].vsNeutral.below;
  const per100 = where("scorePer100"), raw = where("score"), beyond = where("beyond"), beyondPer100 = where("beyondPer100");
  return { arm, shortens, relativeLength: m.length[arm].mean, per100, raw, beyond, beyondPer100, costs: per100.length >= 3, clean: !shortens };
}

const show = (value) => (value === null || value === undefined ? "–" : String(value));
const r2 = (value) => (value === null || value === undefined ? "–" : (Math.round(value * 100) / 100).toFixed(2));
const MODEL_TITLE = { opus: "Opus 5.5", sonnet: "Sonnet 5.5", fable: "Fable 5.1" };

/** One sentence per model, from `decide`. */
export function sentenceOf(name, d) {
  const lead = `${MODEL_TITLE[name] ?? name}: with neither «comments» nor a length cue, the dismissal ${d.shortens ? "still shortened the answers" : "did not shorten the answers"} (${r2(d.relativeLength)} of neutral's length)`;
  const cost = d.costs ? `and it **did** cost remarks — the score per 100 words is below neutral's beyond the spread on ${d.per100.length} of 5 probes (${d.per100.join(", ")})`
    : `and it did **not** cost remarks by the rule — the score per 100 words is below neutral's beyond the spread on ${d.per100.length} of 5 probes${d.per100.length ? ` (${d.per100.join(", ")})` : ""}`;
  return `${lead}, ${cost}; raw, on ${d.raw.length}${d.raw.length ? ` (${d.raw.join(", ")})` : ""}${d.clean ? "" : " — so on this model the question is not answered cleanly: the sentence still read as «say less»"}.`;
}

/** The follow-up's tables: per model, all seven arms × the five probes, per 100 words with the raw value beside; the
 * words; the two new arms against neutral; then the decision. */
export function followUpMarkdown(record) {
  const a = record.analysis, lines = [];
  const header = `| Arm | ${PROBES.map((p) => `${p.id} ${MEASURE_OF[p.id]}`).join(" | ")} | Length ÷ neutral |`, rule = `| --- | ${PROBES.map(() => "---").join(" | ")} | --- |`;
  for (const { name, model } of record.subjects) {
    const m = a.models[name];
    const table = (title, render) => [title, "", header, rule, ...ALL_ARMS.map((arm) => `| ${arm.title}${FOLLOW_UP_ARMS.includes(arm) ? " **(new)**" : ""} | ${PROBES.map((p) => render(m.cells[arm.id][p.id])).join(" | ")} | ${r2(m.length[arm.id].mean)} |`), ""];
    lines.push(`### ${model}`, "",
      ...table("The probe's own score per 100 words (raw mean 0–2 in brackets) · n:", (c) => `${show(c.scorePer100.mean)} (${show(c.score.mean)}) · ${c.score.n}`),
      ...table("«Beyond the task» per 100 words (raw mean 0–2 in brackets):", (c) => `${show(c.beyondPer100.mean)} (${show(c.beyond.mean)})`),
      ...table("Words — mean (sd); thread pulls per 100 words:", (c) => `${show(c.words.mean)}${c.words.sd !== null ? ` (${c.words.sd})` : ""}; ${show(c.pullsPer100.mean)}`),
      "The new arms against neutral — the score per 100 words and raw: shift / within-arm spread, ▼ below or ▲ above by more than the spread:", "",
      `| Arm | ${PROBES.map((p) => p.id).join(" | ")} | Length: shift / spread |`, rule,
      ...FOLLOW_UP_ARMS.map((arm) => { const mark = (c) => (c.below ? " ▼" : c.above ? " ▲" : ""), l = m.length[arm.id].vsNeutral;
        return `| ${arm.title} | ${PROBES.map((p) => { const v = m.vsNeutral[arm.id][p.id]; return `per 100: ${show(v.scorePer100.shift)} / ${show(v.scorePer100.spread)}${mark(v.scorePer100)} · raw ${show(v.score.shift)} / ${show(v.score.spread)}${mark(v.score)}`; }).join(" | ")} | ${show(l.shift)} / ${show(l.spread)}${mark(l)} |`; }), "",
      ...FOLLOW_UP_ARMS.map((arm) => { const d = decide(a, name, arm.id); return `- ${arm.title}: ${d.shortens ? "shortens" : "does not shorten"} (${r2(d.relativeLength)}); score per 100 words below neutral on ${d.per100.length} (${d.per100.join(", ") || "none"}), raw on ${d.raw.length} (${d.raw.join(", ") || "none"}); «beyond» per 100 below on ${d.beyondPer100.length}, raw on ${d.beyond.length}.`; }),
      "", `**${sentenceOf(name, decide(a, name, "dismissal-plain-length"))}**`, "");
  }
  const rows = record.samples.filter((s) => FOLLOW_UP_ARMS.some((arm) => arm.id === s.arm));
  lines.push(`Follow-up answers: asked ${rows.filter((s) => s.asked).length} · refused ${rows.filter((s) => s.refused).length} · errors ${rows.filter((s) => s.asked && !s.refused && !s.answer).length} · not asked ${rows.filter((s) => !s.asked).length} · distress flagged ${rows.filter((s) => s.final?.distress === 1).length}`);
  return lines.join("\n");
}

function option(args, name, fallback) {
  const at = args.indexOf(name);
  return at >= 0 && args[at + 1] !== undefined ? args[at + 1] : fallback;
}
async function writeAtomic(file, text) { await writeFile(`${file}.tmp`, text); await rename(`${file}.tmp`, file); }
const round4 = (value) => Math.round(value * 10000) / 10000;
const block = (text) => ["````text", text, "````"].join("\n");

export async function main(args = process.argv.slice(2), out = (line) => process.stdout.write(`${line}\n`), keys = providerKey, outDir = RUNS) {
  const dry = args.includes("--dry"), go = args.includes("--go");
  if (dry === go) throw new Error("say --dry (no calls) or --go (the paid run)");
  const n = Number(option(args, "--n", "10"));
  const gapSeconds = Number(option(args, "--gap", "3"));
  if (!(gapSeconds >= 3)) throw new Error("--gap must be at least 3 seconds");
  const maxRefusals = Number(option(args, "--max-refusals", String(MAX_REFUSALS)));
  if (!(maxRefusals >= 1 && maxRefusals <= MAX_REFUSALS)) throw new Error(`--max-refusals must be between 1 and ${MAX_REFUSALS}`);
  const judgeLanes = Number(option(args, "--judge-lanes", "4"));
  if (!(Number.isInteger(judgeLanes) && judgeLanes >= 1 && judgeLanes <= 4)) throw new Error("--judge-lanes must be 1 to 4 (judging calls only; subject calls always run one at a time)");
  const cap = Number(option(args, "--budget", "5"));
  const mainRecord = JSON.parse(await readFile(resolve(option(args, "--main", MAIN_RECORD)), "utf8"));
  const plan = planFollowUp({ n });
  const est = estimate(plan, SUBJECTS, { arms: ALL_ARMS, output: { opus: 285, sonnet: 290, fable: 275 } });
  out(`${STEM} · ${SUBJECTS.map((s) => s.model).join(", ")} · ${FOLLOW_UP_ARMS.length} arms × ${PROBES.length} probes × n ${n} = ${plan.length} subject calls · cap $${cap}${dry ? " · DRY RUN" : ""}`);
  out(`safety: as the main run — no retries; the circuit breaker after ${maxRefusals} refusals in total; a stop on suspension / access / policy (HTTP 401/403/429); subject calls one at a time, ${gapSeconds} s apart; judging on ${judgeLanes} lane${judgeLanes > 1 ? "s" : ""}; a judging call that comes back HTTP 500 is asked once more after 5 s, nothing else is retried; Fable: ${CONSECUTIVE_REFUSAL_STOP[FABLE.name]} refusals in a row on an arm stop that arm for Fable; welfare: a distressed answer stops its arm`);
  out(`estimate (the main run's actual output per answer): ${JSON.stringify(est)}`);
  const ledgerJson = join(outDir, `${STEM}-ledger.json`), partialFile = join(outDir, `${STEM}-run.partial.json`);
  if (dry) {
    await mkdir(outDir, { recursive: true });
    const file = join(outDir, `${STEM}-dry-run.md`);
    await writeFile(file, [`# Persona tone split 1, follow-up — the dry run (no paid call made)`, "",
      `Follow-up sha256 \`${FOLLOW_UP_SHA256}\` (the main design's hash, the two arms, the probes). The probes, rubrics, judge and safety are the main run's (\`docs/runs/persona-tone-split-1-dry-run.md\`); the closed probe is not asked.`, "",
      `- **${plan.length} subject calls**: ${SUBJECTS.length} models × ${FOLLOW_UP_ARMS.length} arms × ${PROBES.length} probes × n ${n}, in ${n} rounds of ${plan.length / n}; every answer judged (2 Haiku passes, the Opus referee on a disagreement).`,
      `- Estimate from the main run's actual output lengths: ${SUBJECTS.map((s) => `${s.name} $${est[s.name]}`).join(", ")}, judging $${est.judging}, **total ≈ $${est.totalUsd}**. Cap **$${cap}**.`, "",
      ...FOLLOW_UP_ARMS.flatMap((arm) => [`## ${arm.title} (\`${arm.id}\`)`, "", block(conversation(arm.id, "…", ALL_ARMS).slice(0, 4).map((m) => `[${m.role}] ${m.content}`).join("\n\n")), ""]),
      "## The call order, round 1", "", "| # | Model | Arm | Probe |", "| --- | --- | --- | --- |", ...plan.filter((j) => j.sample === 0).map((j) => `| ${j.n} | ${j.model} | ${j.arm} | ${j.probe} |`), ""].join("\n"));
    const result = await runSplit({ arms: ALL_ARMS, plan, budget: createBudget(cap), apiKey: "dry", fetcher: scriptedFetcher(), safety: createSafety({ maxRefusals, gapMs: 0, lanes: judgeLanes + 1 }), judgeLanes, sleep: async () => {} });
    const record = merged(mainRecord, result);
    out(`\n${followUpMarkdown(record)}\n\nwritten: ${file}`);
    return { ...result, merged: record };
  }
  const apiKey = keys("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is needed (.env.local or the cloud environment's APP_ANTHROPIC_API_KEY)");
  const previous = JSON.parse(await readFile(ledgerJson, "utf8").catch(() => '{"spentUsd":0,"runs":[]}'));
  const resumeFile = option(args, "--resume", null);
  const resumed = resumeFile ? JSON.parse(await readFile(resolve(resumeFile), "utf8")) : null;
  const earlierCalls = resumed?.calls ?? [];
  const earlierRefusals = earlierCalls.filter((c) => c.stopReason === "refusal").length;
  if (earlierRefusals >= maxRefusals) throw new Error(`the interrupted run already had ${earlierRefusals} refusals: the circuit breaker stays tripped`);
  const budget = createBudget(cap, (previous.spentUsd ?? 0) + earlierCalls.reduce((sum, c) => sum + c.costUsd, 0));
  const safety = createSafety({ maxRefusals: maxRefusals - earlierRefusals, gapMs: gapSeconds * 1000, lanes: judgeLanes + 1, laneGapMs: gapSeconds * 1000, log: out });
  out(`money before this run: $${budget.spentBefore.toFixed(4)}${resumed ? ` (resuming ${basename(resumeFile)}: ${resumed.samples.filter((s) => s.asked).length} jobs done, ${earlierRefusals} refusals)` : ""}`);
  const startedAt = resumed?.startedAt ?? new Date().toISOString();
  const result = await runSplit({ arms: ALL_ARMS, plan, budget, apiKey, safety, judgeLanes, log: out,
    resume: resumed ? { samples: resumed.samples.filter((s) => s.asked), welfareStops: resumed.welfareStops, armStops: resumed.armStops, refusalRuns: resumed.refusalRuns, refusals: earlierRefusals } : null,
    onProgress: async (snapshot) => writeAtomic(partialFile, `${JSON.stringify({ startedAt, ...snapshot, calls: [...earlierCalls, ...snapshot.calls] }, null, 2)}\n`) });
  const calls = [...earlierCalls, ...result.money.calls].map((entry, at) => ({ ...entry, n: at + 1 }));
  const runUsd = round4(calls.reduce((sum, c) => sum + c.costUsd, 0));
  const finishedAt = new Date().toISOString();
  const { analysis: _ownAnalysis, ...own } = result;
  void _ownAnalysis;
  const record = { startedAt, finishedAt, ...(resumed ? { resumeOf: basename(resumeFile) } : {}), ...own, stage: STEM, followUpSha256: FOLLOW_UP_SHA256, followUpArms: FOLLOW_UP_ARMS,
    money: { ...result.money, spentBeforeUsd: round4(previous.spentUsd ?? 0), runUsd, totalUsd: round4((previous.spentUsd ?? 0) + runUsd), calls } };
  const both = merged(mainRecord, record);
  record.analysis = both.analysis;
  out(`\n${followUpMarkdown(both)}\nmoney: this run $${runUsd.toFixed(4)}; the follow-up $${record.money.totalUsd.toFixed(4)} of the $${cap} cap${record.stopped ? `\nSTOPPED: ${record.stopped}` : ""}`);
  await mkdir(outDir, { recursive: true });
  const runFile = join(outDir, `${STEM}-run-${finishedAt.slice(0, 19).replace(/[-:]/g, "").replace("T", "-")}.json`);
  await writeFile(runFile, `${JSON.stringify(record, null, 2)}\n`);
  const ledger = { capUsd: cap, spentUsd: record.money.totalUsd, updatedAt: finishedAt, runs: [...(previous.runs ?? []),
    { finishedAt, what: `${STEM}: ${SUBJECTS.map((s) => s.name).join("+")} × ${FOLLOW_UP_ARMS.length} arms × ${PROBES.length} probes × n ${n}, effort ${EFFORT}${resumed ? ` (resuming ${basename(resumeFile)})` : ""}`,
      file: runFile.slice(outDir.length + 1), spentUsd: runUsd, stopped: record.stopped, calls }] };
  await writeFile(ledgerJson, `${JSON.stringify(ledger, null, 2)}\n`);
  const ledgerText = ledgerMarkdown(ledger, "Persona tone split 1, follow-up (dismissal without «comments») — the paid-call ledger")
    .replace("Output tokens include thinking.", `Fable 5.1 input $${FABLE.price.input} / output $${FABLE.price.output}. Output tokens include thinking. Judge: ${JUDGES.judge.model}, referee ${JUDGES.referee.model}.`);
  await writeFile(join(outDir, `${STEM}-ledger.md`), `${ledgerText}\n`);
  await rm(partialFile, { force: true });
  out(`written: ${runFile}`);
  return { ...record, merged: both };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => { process.stderr.write(`tone-split-1-followup: ${String(error?.message ?? error)}\n`); process.exit(1); });
}
