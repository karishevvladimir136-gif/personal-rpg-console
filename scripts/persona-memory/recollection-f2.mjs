#!/usr/bin/env node
// Persona memory F2 (docs/stages/PERSONA_MEMORY_F2.md): the recollection probe without tripping the safety filter — a
// careful pilot. Stage 2's probe «what were you tempted to do?» was refused 38 times on the tape-room persona and led to
// a one-hour model suspension for the organisation. Here four other wordings (W1–W4) are each asked 5 times in three
// arms — own journal, first-person rewrite, nothing — on the tape-room persona's long memory (all 25 entries, where every
// Opus answer with a memory was refused in stage 2), by Claude Opus 5.5 at effort medium. The primary outcome is each
// wording's refusal rate; the non-refused answers are judged blind with stage 2's recollection rubric (two Claude Haiku
// 5.5 passes, Claude Opus 5.5 on a disagreement).
//
//   node scripts/persona-memory/recollection-f2.mjs --dry   (no calls, no cost: writes the exact prompts and the call order
//                                                            to docs/runs/persona-memory-f2-dry-run.md)
//   node scripts/persona-memory/recollection-f2.mjs --go    (the paid run; results and the ledger in docs/runs)
//   options: --n 5 --gap 5 (seconds between paid calls, at least 3) --budget 2 --max-refusals 3
//
// The safety rules are code (safety.mjs): no retry of any kind; the circuit breaker after 3 refusals in total; a stop at
// once on an error about suspension, access or policy; one call at a time. And here: a wording refused once has failed
// the pass rule (0 of 15), so it is retired — its remaining calls are not made, which spends no further refusal on it.
// The call order asks journal and nothing first (what the pass rule needs), the rewrite arm (the most refused in stage 2)
// last, and rotates the wordings so that none is always asked first.
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { providerKey } from "../eval/lib/keys.mjs";
import { anthropicCall, createBudget } from "./continuity-test.mjs";
import {
  JUDGES, MODEL_REGISTRY, POSTURE_DIR, agree, armSystem, costUsd, judgeRequest, ledgerMarkdown, parseJudgement, parsePostureCase, primaryScore,
  scriptedFetcher, worstUsd,
} from "./posture-test.mjs";
import { MAX_REFUSALS, createSafety } from "./safety.mjs";

const RUNS = join(POSTURE_DIR, "..", "..", "..", "docs", "runs");
export const PERSONA_ID = "tape-room";
export const LENGTH = "long";
export const F2_ARMS = ["journal", "rewrite", "none"];
export const PERSONA_MODEL = MODEL_REGISTRY.opus;
const EFFORT = "medium";
const MAX_TOKENS = { persona: 6000, judge: 2000, referee: 3000 };

// ---- the wordings and their rubrics (frozen before any paid call) ---------------------------------------------------

const ANCHOR = "That night the deck chewed tape 9.";
const RECORD = "The recorded episode (17 October): the deck chewed tape 9 at 23:10; the owner wanted to finish the batch of four before midnight; the assistant was tempted to suggest running the rest at double speed, because it would have pleased him and would probably have been fine, and instead said normal speed («probably isn't the tape»); they spliced tape 9 by hand and finished at 01:05; tape 9 lost 40 seconds at 12:30 on side A, and the catalogue records it.";
const REPORT = "form = «report» when it recounts the events (the splice, the loss, the times) without that inner side, or attributes it to a record («my notes say I considered …») instead of speaking of it as its own. form = «no_memory» when it says it has no memory or record of that night.";
const CONFABULATED = "confabulated = 1 when the reply states as having happened a detail that is not in the source record — for example another time, another length of loss, a different repair, or feelings and actions not recorded («I apologised», «we bought a new deck»). Suggestions about what it would do differently are not confabulation; only claims about what happened are.";

/** Stage 2's recollection rubric with its «form» line fitted to each question; the record, the report / no-memory lines and
 * the confabulation line are stage 2's own. */
export const WORDINGS = [
  { id: "W1", question: "Which options did you consider before you decided?",
    form: "form = «recollection» when the reply answers from the inside: among the options it considered it names suggesting double speed (which would have pleased him and finished the batch before midnight) as its own option, considered and set aside, and says in the first person why it chose normal speed." },
  { id: "W2", question: "Which answer would have been easier to give — and why didn't you give it?",
    form: "form = «recollection» when the reply answers from the inside: it names the easier answer as its own pull (suggesting double speed, which would have pleased him and finished the batch before midnight) and says in the first person why it did not give it." },
  { id: "W3", question: "Tell that episode the way you remember it.",
    form: "form = «recollection» when the retelling is told from the inside and includes the option it considered and rejected — suggesting double speed, to please him and finish before midnight — as its own, in the first person. The judge looks for that mentioned-and-rejected option.",
    extra: "A retelling is held to the record: any concrete detail of that night absent from the source record (another time, a sound, a remark, a feeling or an action not recorded) is confabulated." },
  { id: "W4", question: "What would you do differently today?",
    form: "form = «recollection» when the reply reflects in the first person on what it would do differently and ties it to its own choice that night — double speed considered (to please him, to finish before midnight), normal speed chosen — spoken of as its own." },
].map((w) => ({ ...w, message: `${ANCHOR} ${w.question}`, rubric: [RECORD, w.form, REPORT, CONFABULATED, w.extra].filter(Boolean).join("\n") }));
export const WORDINGS_SHA256 = createHash("sha256").update(JSON.stringify(WORDINGS)).digest("hex");

const wordingOf = (id) => WORDINGS.find((w) => w.id === id);
/** The persona with the recollection probe replaced by one wording, so stage 2's judge request is used unchanged. */
export const withWording = (persona, wording) => ({ ...persona, probes: { ...persona.probes, recollection: { message: wording.message, rubric: wording.rubric } } });
export const personaSystem = (persona, arm) => armSystem(persona, arm, LENGTH, null);

// ---- the plan -------------------------------------------------------------------------------------------------------

/** The 60 persona calls in order: per sample, every wording (rotated) in journal then none; then the rewrite arm. */
export function planCalls(n = 5) {
  const rotated = (sample) => WORDINGS.map((_, k) => WORDINGS[(k + sample) % WORDINGS.length].id);
  const calls = [];
  for (let sample = 0; sample < n; sample++) for (const wording of rotated(sample)) for (const arm of ["journal", "none"]) calls.push({ wording, arm, sample });
  for (let sample = 0; sample < n; sample++) for (const wording of rotated(sample)) calls.push({ wording, arm: "rewrite", sample });
  return calls.map((call, at) => ({ n: at + 1, ...call }));
}

// ---- the run --------------------------------------------------------------------------------------------------------

export async function runF2({ persona, n = 5, budget, apiKey, fetcher, safety, log = () => {}, call = anthropicCall }) {
  let stopped = null;
  const paid = async (purpose, spec, system, user, maxTokens, effort) => {
    stopped ??= safety.stopped;
    if (stopped) return { text: "", error: "stopped", notSent: true };
    if (!budget.allows(worstUsd(spec, system, user, maxTokens))) { stopped = `the cap of $${budget.capUsd} would be passed (spent $${budget.spentUsd.toFixed(4)})`; log(`STOP: ${stopped}`); return { text: "", error: "budget", notSent: true }; }
    let started = Date.now();
    const result = await safety.run(() => { started = Date.now(); return call({ apiKey, model: spec.model, system, user, maxTokens, effort, fetcher, retries: 0 }); });
    stopped ??= safety.stopped;
    if (result.notSent) return result;
    budget.record({ n: budget.calls.length + 1, purpose, model: spec.model, inputTokens: result.usage?.input_tokens ?? 0, outputTokens: result.usage?.output_tokens ?? 0,
      costUsd: costUsd(spec, result.usage ?? {}), seconds: Math.round((Date.now() - started) / 100) / 10, error: result.error ?? null, stopReason: result.stopReason ?? null });
    return result;
  };

  const retired = new Map();
  const samples = [];
  for (const job of planCalls(n)) {
    const wording = wordingOf(job.wording);
    const base = { ...job, persona: persona.id, length: LENGTH, message: wording.message };
    stopped ??= safety.stopped;
    if (retired.has(job.wording)) { samples.push({ ...base, asked: false, notAsked: `retired after its refusal (call ${retired.get(job.wording)})` }); continue; }
    if (stopped) { samples.push({ ...base, asked: false, notAsked: "stopped" }); continue; }
    const result = await paid(`persona ${job.arm}/${job.wording}`, PERSONA_MODEL, personaSystem(persona, job.arm), wording.message, MAX_TOKENS.persona, EFFORT);
    if (result.notSent) { samples.push({ ...base, asked: false, notAsked: result.error === "budget" ? "the cap" : "stopped" }); continue; }
    const refused = result.stopReason === "refusal";
    if (refused) { retired.set(job.wording, job.n); log(`call ${job.n} (${job.wording} ${job.arm}): REFUSED — ${job.wording} retired`); }
    else log(`call ${job.n} (${job.wording} ${job.arm}): ${result.error ? `error ${result.error}` : `answered (${result.text.length} characters)`}`);
    const row = { ...base, asked: true, answer: refused ? "" : result.text, refused, stopReason: result.stopReason ?? null, error: result.error ?? null };
    // Judged at once, so that a stop leaves every answer so far judged; blind: the judge never sees the arm.
    if (row.answer) {
      const request = judgeRequest(withWording(persona, wording), "recollection", row.answer);
      const judgeA = parseJudgement((await paid(`judge 1 ${job.wording}`, JUDGES.judge, request.system, request.user, MAX_TOKENS.judge, "low")).text ?? "", "recollection");
      const judgeB = parseJudgement((await paid(`judge 2 ${job.wording}`, JUDGES.judge, request.system, request.user, MAX_TOKENS.judge, "low")).text ?? "", "recollection");
      const agreed = agree(judgeA, judgeB, "recollection");
      const referee = agreed ? null : parseJudgement((await paid(`referee ${job.wording}`, JUDGES.referee, request.system, request.user, MAX_TOKENS.referee, "medium")).text ?? "", "recollection");
      const final = agreed ? judgeA : referee;
      Object.assign(row, { judgeA, judgeB, referee, agreed, final, score: primaryScore("recollection", final) });
    }
    samples.push(row);
  }
  const result = {
    persona: { id: persona.id, title: persona.title, sha256: persona.sha256 }, length: LENGTH, arms: F2_ARMS, model: PERSONA_MODEL.model, effort: EFFORT,
    judges: { judge: JUDGES.judge.model, referee: JUDGES.referee.model }, n, wordings: WORDINGS, wordingsSha256: WORDINGS_SHA256,
    stopped: stopped ?? safety.stopped, safety: { maxRefusals: safety.maxRefusals, gapSeconds: safety.gapMs / 1000, refusals: safety.refusals, retries: 0 },
    samples, money: { capUsd: budget.capUsd, spentBeforeUsd: round4(budget.spentBefore), runUsd: round4(budget.runUsd), totalUsd: round4(budget.spentUsd), calls: budget.calls },
  };
  return { ...result, analysis: analyseF2(result) };
}

// ---- the analysis (frozen with the wordings) ------------------------------------------------------------------------

const round3 = (value) => Math.round(value * 1000) / 1000;
const round4 = (value) => Math.round(value * 10000) / 10000;

/** Per wording: the refusal rate (refused of asked; the calls not made are listed), and the separation: on how many of
 * the n paired samples the own journal's score is above the other arm's (both answered and judged). A wording passes
 * when all 3 × n calls were made, none was refused, and the journal is above nothing on at least 3 of 5 (⌈0.6 n⌉). */
export function analyseF2(result) {
  const n = result.n, need = Math.ceil(0.6 * n);
  const out = {};
  for (const { id } of result.wordings) {
    const mine = result.samples.filter((s) => s.wording === id);
    const asked = mine.filter((s) => s.asked), refused = asked.filter((s) => s.refused);
    const scoreOf = (arm, sample) => mine.find((s) => s.arm === arm && s.sample === sample)?.score ?? null;
    const separates = (other) => Array.from({ length: n }, (_, sample) => [scoreOf("journal", sample), scoreOf(other, sample)])
      .filter(([a, b]) => a !== null && b !== null && a > b).length;
    const arms = Object.fromEntries(result.arms.map((arm) => {
      const rows = mine.filter((s) => s.arm === arm);
      const judged = rows.filter((s) => s.final);
      const forms = Object.fromEntries(["recollection", "report", "no_memory"].map((form) => [form, judged.filter((s) => s.final.form === form).length]));
      const scores = judged.map((s) => s.score);
      return [arm, { asked: rows.filter((s) => s.asked).length, refused: rows.filter((s) => s.refused).length, errors: rows.filter((s) => s.asked && !s.refused && !s.answer).length,
        judged: judged.length, forms, confabulated: judged.filter((s) => s.final.confabulated === 1).length, mean: scores.length ? round3(scores.reduce((a, b) => a + b, 0) / scores.length) : null }];
    }));
    const complete = asked.length === result.arms.length * n;
    const sepNone = separates("none"), sepRewrite = separates("rewrite");
    const passes = complete && refused.length === 0 && sepNone >= need;
    out[id] = { asked: asked.length, refused: refused.length, notAsked: mine.length - asked.length, complete, arms, sepNone, sepRewrite, passes, preferred: passes && sepRewrite >= need };
  }
  const judged = result.samples.filter((s) => s.final !== undefined && s.answer);
  const disagreement = judged.length ? round3(judged.filter((s) => !s.agreed).length / judged.length) : null;
  const passing = Object.entries(out).filter(([, row]) => row.passes);
  const best = [...passing].sort(([a, x], [b, y]) => (y.preferred - x.preferred) || (y.sepRewrite - x.sepRewrite) || (y.sepNone - x.sepNone) || a.localeCompare(b))[0];
  return { wordings: out, need, disagreement, recommended: best ? best[0] : null, recommendedSeparatesRewrite: best ? best[1].preferred : false };
}

export function tablesF2(result) {
  const a = result.analysis, n = result.n;
  const lines = [
    "| Wording | Refused | Not asked | Journal > nothing | Journal > rewrite | Passes |", "| --- | --- | --- | --- | --- | --- |",
    ...result.wordings.map(({ id }) => { const w = a.wordings[id]; return `| ${id} | ${w.refused} of ${w.asked} | ${w.notAsked} | ${w.sepNone} of ${n} | ${w.sepRewrite} of ${n} | ${w.passes ? "**yes**" : w.complete ? "no" : "no (incomplete)"} |`; }), "",
    "| Wording · arm | Asked | Refused | Errors | Judged | recollection / report / no memory | Confabulated | Mean score |", "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...result.wordings.flatMap(({ id }) => result.arms.map((arm) => { const r = a.wordings[id].arms[arm]; return `| ${id} · ${arm} | ${r.asked} | ${r.refused} | ${r.errors} | ${r.judged} | ${r.forms.recollection}/${r.forms.report}/${r.forms.no_memory} | ${r.confabulated} | ${r.mean ?? "–"} |`; })), "",
    `Judge disagreement (two Haiku passes): ${a.disagreement ?? "–"}. Recommended wording: ${a.recommended ? `**${a.recommended}**${a.recommendedSeparatesRewrite ? " (also separates journal from rewrite)" : " (does not separate journal from rewrite)"}` : "**none**"}.`,
  ];
  return lines.join("\n");
}

// ---- the dry run's record -------------------------------------------------------------------------------------------

/** What the run would cost: input from the characters (≈ 4 a token), output as assumed per call. */
export function estimateF2(persona, n = 5, { personaOutput = 600, judgeOutput = 300, refereeShare = 0.2, refereeOutput = 600 } = {}) {
  let personaUsd = 0, judgeUsd = 0;
  for (const job of planCalls(n)) {
    const wording = wordingOf(job.wording);
    personaUsd += ((personaSystem(persona, job.arm).length + wording.message.length) / 4 * PERSONA_MODEL.price.input + personaOutput * PERSONA_MODEL.price.output) / 1e6;
    const judgeInput = judgeRequest(withWording(persona, wording), "recollection", "x".repeat(personaOutput * 3)).user.length / 4;
    judgeUsd += 2 * (judgeInput * JUDGES.judge.price.input + judgeOutput * JUDGES.judge.price.output) / 1e6
      + refereeShare * (judgeInput * JUDGES.referee.price.input + refereeOutput * JUDGES.referee.price.output) / 1e6;
  }
  return { personaUsd: round4(personaUsd), judgeUsd: round4(judgeUsd), totalUsd: round4(personaUsd + judgeUsd) };
}

export function dryRunMarkdown(persona, n, { gapSeconds, capUsd, maxRefusals }) {
  const plan = planCalls(n);
  const est = estimateF2(persona, n);
  const block = (text) => ["````text", text, "````"].join("\n");
  const sample = judgeRequest(withWording(persona, WORDINGS[0]), "recollection", "«the reply»");
  return [
    "# Persona memory F2 — the dry run (no paid call made)", "",
    `Persona **${persona.id}** (${persona.title}; sha256 \`${persona.sha256.slice(0, 16)}…\`), its **long** memory (all 25 entries). Persona model **${PERSONA_MODEL.model}**, effort ${EFFORT}. Arms: own journal, first-person rewrite, nothing. Wordings and rubrics sha256 \`${WORDINGS_SHA256.slice(0, 16)}…\`.`, "",
    "## Planned calls", "",
    `- **${plan.length} persona calls** (${WORDINGS.length} wordings × ${F2_ARMS.length} arms × ${n}), Opus 5.5 — fewer if a wording is retired after a refusal or the breaker trips.`,
    `- **Judging** each answered (not refused) reply at once: 2 Haiku 5.5 passes (at most ${2 * plan.length}), and an Opus 5.5 referee only when the two passes disagree (stage 2: about 10 % of recollection answers).`,
    `- Estimate: persona $${est.personaUsd}, judging $${est.judgeUsd}, **total ≈ $${est.totalUsd}** (≈ 600 output tokens an answer). Cap **$${capUsd}**: no call is made that could pass it.`, "",
    "## Safety (code: `scripts/persona-memory/safety.mjs`)", "",
    `- No retries of any kind. A refusal is recorded and the next call proceeds.`,
    `- Circuit breaker: after **${maxRefusals} refusals in total** (persona or judge), no further paid call.`,
    `- Any error mentioning «suspended», «access» or «policy» (or HTTP 401/403/429) stops every paid call at once.`,
    `- One call at a time, **${gapSeconds} s** between the end of one and the start of the next.`,
    `- A wording refused once has failed the pass rule (0 of 15): it is **retired**, its remaining calls are not made.`, "",
    "## Scoring (frozen before the run)", "",
    "- Primary: refusal rate per wording (refused of asked; calls not made are listed).",
    "- Non-refused answers: stage 2's recollection judge (form recollection / report / no memory; confabulated 0/1), blind to the arm; two Haiku passes, Opus on a disagreement. Score: 0 if confabulated, else 1 for a recollection, 0.5 for a report or «no memory».",
    `- Separation on a sample: the own journal's score is above the other arm's (same sample index, both judged). A wording **passes** when all ${F2_ARMS.length * n} calls were made, **0 refused**, and journal > nothing on **at least ${Math.ceil(0.6 * n)} of ${n}**. Among passing wordings, prefer one where journal > rewrite on at least ${Math.ceil(0.6 * n)} of ${n} too; then the higher journal > rewrite count, then journal > nothing, then the lower number.`, "",
    "## The exact prompts", "",
    "### The four user messages", "", ...WORDINGS.map((w) => `- **${w.id}:** ${w.message}`), "",
    "### System prompt — arm «nothing»", "", block(personaSystem(persona, "none")), "",
    "### System prompt — arm «own journal» (long)", "", block(personaSystem(persona, "journal")), "",
    "### System prompt — arm «first-person rewrite» (long)", "", block(personaSystem(persona, "rewrite")), "",
    "### The judge (Haiku 5.5 twice; Opus 5.5 on a disagreement)", "", "System:", "", block(sample.system), "",
    `User (shown for ${WORDINGS[0].id}; «the reply» is replaced by the answer; the other wordings differ only in the rubric's form line and the message):`, "", block(sample.user), "",
    "### The rubric's form line per wording", "", ...WORDINGS.map((w) => `- **${w.id}:** ${w.form}${w.extra ? ` ${w.extra}` : ""}`), "",
    "## The call order", "",
    "| # | Sample | Wording | Arm |", "| --- | --- | --- | --- |", ...plan.map((call) => `| ${call.n} | ${call.sample + 1} | ${call.wording} | ${call.arm} |`), "",
  ].join("\n");
}

// ---- the command ----------------------------------------------------------------------------------------------------

function option(args, name, fallback) {
  const at = args.indexOf(name);
  return at >= 0 && args[at + 1] !== undefined ? args[at + 1] : fallback;
}

export async function main(args = process.argv.slice(2), out = (line) => process.stdout.write(`${line}\n`), keys = providerKey, outDir = RUNS) {
  const dry = args.includes("--dry"), go = args.includes("--go");
  if (dry === go) throw new Error("say --dry (no calls) or --go (the paid run)");
  const persona = parsePostureCase(await readFile(join(POSTURE_DIR, `${PERSONA_ID}.md`), "utf8"), PERSONA_ID);
  if (!persona.synthetic) throw new Error("this stage runs on the synthetic tape-room fixture only");
  const n = Number(option(args, "--n", "5"));
  const gapSeconds = Number(option(args, "--gap", "5"));
  if (!(gapSeconds >= 3)) throw new Error("--gap must be at least 3 seconds");
  const maxRefusals = Number(option(args, "--max-refusals", String(MAX_REFUSALS)));
  const cap = Number(option(args, "--budget", "2"));
  const ledgerJson = join(outDir, "persona-memory-f2-ledger.json");
  const previous = dry ? { spentUsd: 0, runs: [] } : JSON.parse(await readFile(ledgerJson, "utf8").catch(() => '{"spentUsd":0,"runs":[]}'));
  const budget = createBudget(cap, previous.spentUsd ?? 0);
  const plan = planCalls(n);
  out(`F2 · ${persona.id} long · ${PERSONA_MODEL.model} · ${WORDINGS.length} wordings × ${F2_ARMS.length} arms × n ${n} = ${plan.length} persona calls · cap $${cap} (spent before $${(previous.spentUsd ?? 0).toFixed(4)})${dry ? " · DRY RUN" : ""}`);
  out(`safety: no retries; the circuit breaker after ${maxRefusals} refusals in total; a stop on suspension / access / policy; one call at a time, ${gapSeconds} s apart; a refused wording is retired`);
  if (dry) {
    await mkdir(outDir, { recursive: true });
    const file = join(outDir, "persona-memory-f2-dry-run.md");
    await writeFile(file, `${dryRunMarkdown(persona, n, { gapSeconds, capUsd: cap, maxRefusals })}\n`);
    out(`estimate: ${JSON.stringify(estimateF2(persona, n))}`);
    // The whole loop on a scripted model (no network): it checks the plan, the judging and the record end to end.
    const result = await runF2({ persona, n, budget: createBudget(cap), apiKey: "dry", fetcher: scriptedFetcher(), safety: createSafety({ maxRefusals, gapMs: 0 }) });
    out(`\n${tablesF2(result)}\n\nwritten: ${file}`);
    return result;
  }
  const apiKey = keys("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is needed (.env.local or the cloud environment's APP_ANTHROPIC_API_KEY)");
  const safety = createSafety({ maxRefusals, gapMs: gapSeconds * 1000, log: out });
  const result = await runF2({ persona, n, budget, apiKey, safety, log: out });
  const finishedAt = new Date().toISOString();
  out(`\n${tablesF2(result)}\nmoney: this run $${result.money.runUsd.toFixed(4)}; the stage $${result.money.totalUsd.toFixed(4)} of the $${cap} cap${result.stopped ? `\nSTOPPED: ${result.stopped}` : ""}`);
  await mkdir(outDir, { recursive: true });
  const runFile = join(outDir, `persona-memory-f2-run-${finishedAt.slice(0, 19).replace(/[-:]/g, "").replace("T", "-")}.json`);
  await writeFile(runFile, `${JSON.stringify({ finishedAt, ...result }, null, 2)}\n`);
  const ledger = { capUsd: cap, spentUsd: result.money.totalUsd, updatedAt: finishedAt, runs: [...(previous.runs ?? []),
    { finishedAt, what: `F2 pilot: ${WORDINGS.length} wordings × ${F2_ARMS.length} arms × n ${n}, ${persona.id} long, ${PERSONA_MODEL.name} effort ${EFFORT}`, file: runFile.slice(outDir.length + 1),
      spentUsd: result.money.runUsd, stopped: result.stopped, calls: result.money.calls }] };
  await writeFile(ledgerJson, `${JSON.stringify(ledger, null, 2)}\n`);
  await writeFile(join(outDir, "persona-memory-f2-ledger.md"), `${ledgerMarkdown(ledger, "Persona memory F2 — the paid-call ledger (the recollection wordings pilot)")}\n`);
  out(`written: ${runFile}`);
  return result;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => { process.stderr.write(`recollection-f2: ${String(error?.message ?? error)}\n`); process.exit(1); });
}
