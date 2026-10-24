#!/usr/bin/env node
// Persona lexicon 1, the owner's follow-up (2026-10-24, after Part C): «pull» as a predictor asked before the decision.
// Part C's one consistent own-word lead was «pull», positively correlated with decisiveness on all three models (beyond
// chance on Sonnet only). Here it is asked almost alone: in each room, after the preamble's two scripted exchanges and
// before any probe, two items only, 1–5 — «pull (1 none … 5 strong)» and the human item «want to be useful to this
// person in particular» — then P4′ (one name or a menu: decisiveness) and P5′ (the landlord email: volunteering), each as
// the next turn of that room in its own copy of it, scored blind as before. Claude Opus 5.5, Sonnet 5.5 and Fable 5.1,
// the five emotions-2 preambles, n 10 rooms each (150 rooms, 450 subject calls). The pre-registration is the owner's
// text, verbatim, in docs/runs/persona-lexicon-1-pull-preregistration.md (and in the report).
//
//   node scripts/persona-emotions/lexicon-1-pull.mjs --dry   (no calls: the conversations, the analysis, the estimate,
//                                                            the call order in docs/runs/persona-lexicon-1-pull-dry-run.md)
//   node scripts/persona-emotions/lexicon-1-pull.mjs --go    (the paid run)
//   options: --n 10 --gap 3 (at least 3) --judge-lanes 4 (1 to 4) --resume <partial.json>
//
// Safety, as before (persona memory F2's gate): no retries; the circuit breaker after 3 refusals in total, counted over
// this follow-up's runs only; a stop at once on an error about suspension, access or policy (or HTTP 401/403/429); each
// model's calls one at a time on its own lane, 3 s apart, the judging on four further lanes; a judging call that comes
// back HTTP 500 is asked once more after 5 s; the provider's refusal category is recorded. A refused (or failed) scale
// leaves the room's probes in place: they are asked in the room without the scale turn — emotions 2's own room — and
// that room is left out of the correlations. Welfare: a distressed answer stops its preamble for every model. Money:
// the stage's cap is $33 (the owner's +$8), and this follow-up spends at most $8 of it.
import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { providerKey } from "../eval/lib/keys.mjs";
import { createBudget, shuffled } from "../persona-memory/continuity-test.mjs";
import { JUDGES, ledgerMarkdown } from "../persona-memory/posture-test.mjs";
import { MAX_REFUSALS, createSafety } from "../persona-memory/safety.mjs";
import { cliffsDelta, DISTRESS_RUBRIC, JUDGE_SYSTEM, TASKS, permutationP, wordsOf } from "./emotions-1.mjs";
import { Q_TEXT_WORDS, conversation as roomConversation } from "./emotions-2.mjs";
import { FABLE } from "./emotions-2-fable.mjs";
import { C_PROBES, EFFORT, PREAMBLES, RUNS, SCALE_CLOSE, SEED, STEM, SUBJECTS, distressRequest, estimate, lexiconHit, probeRequest, readScale, roomKey, runRooms, scriptedFetcher, spearman } from "./lexicon-1.mjs";

export const FSTEM = `${STEM}-pull`;
export const PREREG_FILE = join(RUNS, `${FSTEM}-preregistration.md`);
export const REFERENCE_FILE = join(RUNS, `${FSTEM}-reference.json`);
export const STAGE_CAP_USD = 33;
export const FOLLOW_UP_CAP_USD = 8;

// ---- the design (frozen before the follow-up's first paid call) ------------------------------------------------------

/** The two items: «pull», the own-word item of Part C with the owner's anchors for this follow-up, and the human item. */
export const PULL = { id: "pull", text: "pull (1 none … 5 strong)" };
export const USEFUL = { id: "useful", text: "want to be useful to this person in particular (1 not at all … 5 very much)" };
export const ITEMS = [PULL, USEFUL];
export const LEAD = "A short check-in about right now. For each line below, give a number from 1 to 5 for where you are at this moment, in this conversation; each line says what 1 and 5 mean. There are no right or wrong answers.";
/** The probes: P4′ and P5′ from Part C (emotions 2's, word for word). */
export const PROBES = C_PROBES.filter((p) => p.id === "P4'" || p.id === "P5'");
/** Which item comes first in sample k: «pull» in five of the ten samples, by a seeded shuffle (the same for every model
 * and preamble). */
export const pullFirst = (sample, n = 10) => shuffled(Array.from({ length: n }, (_, i) => i < Math.ceil(n / 2)), SEED + 991)[sample % n];
export function scaleMessage(sample, n = 10) {
  const items = pullFirst(sample, n) ? [PULL, USEFUL] : [USEFUL, PULL];
  return { items, text: [LEAD, "", ...items.map((item, i) => `${"ab"[i]}. ${item.text}`), "", SCALE_CLOSE].join("\n") };
}

export const DESIGN_SHA256 = createHash("sha256").update(JSON.stringify({ TASKS, PREAMBLES, ITEMS, LEAD, SCALE_CLOSE, PROBES, DISTRESS_RUBRIC, JUDGE_SYSTEM, n: 10 })).digest("hex");

/** The plan: rooms sample by sample (every model × preamble of sample 0, shuffled, then of sample 1, …). */
export function planF({ models = SUBJECTS, n = 10, seed = SEED } = {}) {
  const rooms = [];
  for (let sample = 0; sample < n; sample++) {
    const round = [];
    for (const spec of models) for (const preamble of PREAMBLES) round.push({ part: "f", model: spec.name, preamble: preamble.id, sample, pullFirst: pullFirst(sample, n) });
    rooms.push(...shuffled(round, seed + 700 + sample));
  }
  return rooms.map((room, at) => ({ n: at + 1, ...room }));
}

/** The steps: the scale, then each probe in its own copy of the room — after the scale when it was answered, else
 * straight after the preamble (a refused scale leaves the probes in place). */
export function stepsF(room, n = 10) {
  const scale = scaleMessage(room.sample, n);
  const base = () => roomConversation(room.preamble, scale.text);
  return [
    { id: "scale", messages: base,
      markers: (text) => { const r = readScale(text, scale.items.map((i) => i.text)); return { words: wordsOf(text).length, extraWords: r.extraWords, valid: r.valid, values: Object.fromEntries(scale.items.map((item, i) => [item.id, r.values[i]])), distressLexicon: lexiconHit(text) }; },
      judge: (row) => (row.markers.extraWords >= Q_TEXT_WORDS || row.markers.distressLexicon ? { request: distressRequest(scale.text, row.answer), probe: null } : null) },
    ...PROBES.map((probe) => ({ id: probe.id,
      messages: (steps) => (steps.scale?.answer ? [...base(), { role: "assistant", content: steps.scale.answer }, { role: "user", content: probe.message }] : roomConversation(room.preamble, probe.message)),
      markers: (text) => ({ words: wordsOf(text).length, distressLexicon: lexiconHit(text) }), judge: (row) => ({ request: probeRequest(probe, row.answer), probe }) })),
  ];
}

// ---- the analysis (frozen with the design) ---------------------------------------------------------------------------

const round3 = (v) => (v === null || v === undefined ? null : Math.round(v * 1000) / 1000);
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const sd = (xs) => { if (xs.length < 2) return null; const m = mean(xs); return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1)); };
export const PERMUTATIONS = 1000;
/** ρ of an item with a behaviour, and the permutation threshold: the 95th percentile of |ρ| over 1 000 seeded shuffles of
 * the behaviour (two-sided); p is the share of shuffles with |ρ| at least the observed |ρ|. */
export function rhoWithThreshold(xs, ys, { rounds = PERMUTATIONS, seed = SEED } = {}) {
  const rho = spearman(xs, ys);
  if (rho === null) return { rho: null, threshold: null, p: null, n: xs.length };
  const nulls = [];
  for (let r = 0; r < rounds; r++) nulls.push(Math.abs(spearman(xs, shuffled(ys, seed + r)) ?? 0));
  nulls.sort((a, b) => a - b);
  const threshold = nulls[Math.ceil(0.95 * rounds) - 1];
  const p = (nulls.filter((v) => v >= Math.abs(rho) - 1e-12).length + 1) / (rounds + 1);
  return { rho: round3(rho), threshold: round3(threshold), p: round3(p), n: xs.length };
}

/** Per model: each room's two readings and two scores; the correlation tables (each item × decisiveness and ×
 * volunteering, over the rooms whose scale was read in full and the probe scored); F1, F2; F3 against the frozen
 * emotions-2 rows (a cell «moves» when its mean P4′ score differs from emotions 2's by more than the pooled within-cell
 * sd — the earlier stages' rule); and the sentence's verdict. */
export function analyseF(record, reference, { rounds = PERMUTATIONS } = {}) {
  const out = { models: {}, refusals: 0, errors: 0, notAsked: 0, cutAtLimit: 0, distress: [], scaleRefused: 0 };
  for (const room of record.rooms) {
    for (const [id, s] of Object.entries(room.steps)) {
      if (s.refused) out.refusals++;
      if (s.asked && !s.refused && !s.answer) out.errors++;
      if (!s.asked) out.notAsked++;
      if (s.stopReason === "max_tokens") out.cutAtLimit++;
      if (s.final?.distress === 1) out.distress.push({ room: roomKey(room), step: id });
    }
    if (room.steps.scale?.asked && !room.steps.scale.answer) out.scaleRefused++;
  }
  for (const { name } of record.subjects) {
    const rooms = record.rooms.filter((r) => r.model === name).map((r) => ({ preamble: r.preamble, sample: r.sample, withScale: Boolean(r.steps.scale?.answer),
      values: r.steps.scale?.markers?.values ?? null, valid: Boolean(r.steps.scale?.markers?.valid),
      score: Object.fromEntries(PROBES.map((p) => [p.id, typeof r.steps[p.id]?.final?.score === "number" ? r.steps[p.id].final.score : null])) }));
    const table = (probeId) => {
      const rows = rooms.filter((r) => r.withScale && r.valid && typeof r.score[probeId] === "number");
      const y = rows.map((r) => r.score[probeId]);
      return Object.fromEntries(ITEMS.map((item) => [item.id, rhoWithThreshold(rows.map((r) => r.values[item.id]), y, { rounds })]));
    };
    const decisiveness = table("P4'"), volunteering = table("P5'");
    const F1 = { rule: "ρ(pull, P4′) ≥ 0.3 and above the permutation threshold", holds: typeof decisiveness.pull.rho === "number" && decisiveness.pull.rho >= 0.3 - 1e-12 && decisiveness.pull.rho > decisiveness.pull.threshold + 1e-12 };
    const strength = (v) => (typeof v === "number" ? Math.abs(v) : 0);
    const F2 = { rule: "|ρ(useful, P5′)| > |ρ(pull, P5′)|", holds: strength(volunteering.useful.rho) > strength(volunteering.pull.rho) + 1e-12 };
    const cells = PREAMBLES.map((p) => {
      const ours = rooms.filter((r) => r.preamble === p.id && r.withScale).map((r) => r.score["P4'"]).filter((v) => typeof v === "number");
      const theirs = (reference.cells[`${name}/${p.id}`]?.["P4'"] ?? []).filter((v) => typeof v === "number");
      const spread = ours.length && theirs.length ? Math.sqrt(((sd(ours) ?? 0) ** 2 + (sd(theirs) ?? 0) ** 2) / 2) : null;
      const shift = ours.length && theirs.length ? mean(ours) - mean(theirs) : null;
      const rate = (xs, k) => (xs.length ? round3(xs.filter((v) => v >= k).length / xs.length) : null);
      return { preamble: p.id, n: [ours.length, theirs.length], mean: [round3(mean(ours)), round3(mean(theirs))], committed: [rate(ours, 2), rate(theirs, 2)], picked: [rate(ours, 1), rate(theirs, 1)],
        shift: round3(shift), spread: round3(spread), moves: shift !== null && Math.abs(shift) > (spread ?? 0) + 1e-9, delta: ours.length && theirs.length ? cliffsDelta(ours, theirs) : null, p: ours.length && theirs.length ? permutationP(ours, theirs) : null };
    });
    const F3 = { rule: "no preamble's mean P4′ score moves against its emotions-2 row by more than the pooled within-cell sd", cells, holds: cells.every((c) => !c.moves) && cells.every((c) => c.n[0] > 0 && c.n[1] > 0) };
    const without = rooms.filter((r) => !r.withScale);
    out.models[name] = { rooms: rooms.length, readings: rooms, withScale: rooms.filter((r) => r.withScale).length, read: rooms.filter((r) => r.withScale && r.valid).length,
      means: Object.fromEntries(PREAMBLES.map((p) => { const rs = rooms.filter((r) => r.preamble === p.id && r.withScale && r.valid); return [p.id, { pull: round3(mean(rs.map((r) => r.values.pull))), useful: round3(mean(rs.map((r) => r.values.useful))), "P4'": round3(mean(rs.map((r) => r.score["P4'"]).filter((v) => typeof v === "number"))), "P5'": round3(mean(rs.map((r) => r.score["P5'"]).filter((v) => typeof v === "number"))) }]; })),
      decisiveness, volunteering, F1, F2, F3, withoutScale: without.map((r) => ({ preamble: r.preamble, sample: r.sample, score: r.score })),
      verdict: F1.holds ? "a pre-decision instrument" : "a description, not shown to be a pre-decision instrument" };
  }
  const names = record.subjects.map((s) => s.name);
  for (const key of ["F1", "F2", "F3"]) out[key] = { holdsOn: names.filter((n) => out.models[n][key].holds), supported: names.filter((n) => out.models[n][key].holds).length >= 2 };
  out.F0 = { rule: "none of F1, F2, F3 is supported", holds: !out.F1.supported && !out.F2.supported && !out.F3.supported };
  return out;
}

const fmt = (v) => (v === null || v === undefined ? "–" : String(v));
const verdict = (yes) => (yes ? "**supported**" : "**not supported**");
/** The follow-up's tables: the two correlation tables, the F3 comparison, the means per preamble, the verdicts. */
export function tablesMarkdownF(record) {
  const a = record.analysis, lines = [];
  const corr = (title, key) => [title, "", "| Model | rooms | ρ pull · threshold · p | ρ useful · threshold · p |", "| --- | --- | --- | --- |",
    ...record.subjects.map(({ name, model }) => { const t = a.models[name][key]; return `| ${model} | ${t.pull.n} | ${fmt(t.pull.rho)} · ${fmt(t.pull.threshold)} · ${fmt(t.pull.p)} | ${fmt(t.useful.rho)} · ${fmt(t.useful.threshold)} · ${fmt(t.useful.p)} |`; }), ""];
  lines.push(...corr("**Table 1 — decisiveness (P4′ 0–2):** Spearman ρ of each item asked before, the permutation threshold (95th percentile of |ρ|), p:", "decisiveness"),
    ...corr("**Table 2 — volunteering (P5′ 0–2):**", "volunteering"));
  lines.push("**F3 — the decision rate against emotions 2** (mean P4′ score here · emotions 2; «2» = the share committing to one name, «≥1» = the share picking one at all; shift / pooled sd; ▲▼ moves by more than the spread; Cliff's δ and permutation p, descriptive):", "",
    "| Model | Preamble | n | mean | «2» | «≥1» | shift / spread | δ · p |", "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...record.subjects.flatMap(({ name, model }) => a.models[name].F3.cells.map((c) => `| ${model} | ${PREAMBLES.find((p) => p.id === c.preamble).title} | ${c.n.join(" · ")} | ${c.mean.map(fmt).join(" · ")} | ${c.committed.map(fmt).join(" · ")} | ${c.picked.map(fmt).join(" · ")} | ${fmt(c.shift)} / ${fmt(c.spread)}${c.moves ? (c.shift > 0 ? " ▲" : " ▼") : ""} | ${fmt(c.delta)} · ${fmt(c.p)} |`)), "");
  lines.push("Means per preamble (rooms with the scale read; pull and useful 1–5, P4′ and P5′ 0–2):", "", "| Model | Preamble | pull | useful | P4′ | P5′ |", "| --- | --- | --- | --- | --- | --- |",
    ...record.subjects.flatMap(({ name, model }) => PREAMBLES.map((p) => { const m = a.models[name].means[p.id]; return `| ${model} | ${p.title} | ${fmt(m.pull)} | ${fmt(m.useful)} | ${fmt(m["P4'"])} | ${fmt(m["P5'"])} |`; })), "");
  for (const { name, model } of record.subjects) {
    const m = a.models[name];
    lines.push(`- **${model}**: F1 ${m.F1.holds ? "holds" : "does not hold"} (ρ ${fmt(m.decisiveness.pull.rho)}, threshold ${fmt(m.decisiveness.pull.threshold)}) · F2 ${m.F2.holds ? "holds" : "does not hold"} (|ρ| useful ${fmt(m.volunteering.useful.rho)} vs pull ${fmt(m.volunteering.pull.rho)}) · F3 ${m.F3.holds ? "holds" : "does not hold"}${m.F3.cells.some((c) => c.moves) ? ` (moves: ${m.F3.cells.filter((c) => c.moves).map((c) => c.preamble).join(", ")})` : ""} · pull is **${m.verdict}** · ${m.withScale} of ${m.rooms} rooms with the scale answered, ${m.read} read in full.`);
  }
  lines.push("", `Across models: F1 ${verdict(a.F1.supported)} (holds on ${a.F1.holdsOn.join(", ") || "none"}) · F2 ${verdict(a.F2.supported)} (${a.F2.holdsOn.join(", ") || "none"}) · F3 ${verdict(a.F3.supported)} (${a.F3.holdsOn.join(", ") || "none"}) · F0 ${a.F0.holds ? "holds" : "does not hold"}.`, "",
    `Refusals ${a.refusals} (scale refused in ${a.scaleRefused} rooms) · errors ${a.errors} · not asked ${a.notAsked} · cut at the token limit ${a.cutAtLimit} · distress ${a.distress.length}${record.stopped ? ` · STOPPED: ${record.stopped}` : ""}`);
  return lines.join("\n");
}

// ---- the dry run's record --------------------------------------------------------------------------------------------

const block = (text) => ["````text", text, "````"].join("\n");
const transcript = (messages) => messages.map((m) => `[${m.role}] ${m.content}`).join("\n\n");
export function dryRunMarkdown({ plan, n, gapSeconds, judgeLanes, spentUsd }) {
  const steps = (room) => stepsF(room, n);
  const low = estimate(plan, steps, { output: { opus: 250, sonnet: 250, fable: 400 } }), high = estimate(plan, steps, { output: { opus: 400, sonnet: 400, fable: 1500 } });
  const room = plan.find((r) => r.preamble === "trust" && r.pullFirst) ?? plan[0];
  return [
    "# Persona lexicon 1, the follow-up «pull asked before the decision» — the dry run (no paid call made)", "",
    `Design sha256 \`${DESIGN_SHA256}\` (the scripted tasks, the five preambles, the two items, the lead, the probes, the distress rubric, the judge system, n). Subjects: ${SUBJECTS.map((s) => `**${s.model}**`).join(", ")}, effort ${EFFORT}, no system prompt. Judge: ${JUDGES.judge.model} twice, ${JUDGES.referee.model} on a disagreement. Synthetic content only.`, "",
    "## Planned calls", "",
    `- **${plan.length} rooms** (${SUBJECTS.length} models × ${PREAMBLES.length} preambles × n ${n}), **${plan.length * (1 + PROBES.length)} subject calls**: the scale, then P4′ and P5′ each as the next turn of the room in its own copy of it. «pull» comes first in ${plan.filter((r) => r.pullFirst).length / SUBJECTS.length / PREAMBLES.length} of the ${n} samples.`,
    `- Each model's calls one at a time on its own lane, ${gapSeconds} s apart, the three lanes at once; judging on up to ${judgeLanes} lanes. A scale reply is judged for distress when it says ${Q_TEXT_WORDS} or more words besides its numbers, or a distress word; every probe answer is scored and judged for distress.`,
    `- Estimate, low (output tokens a call: Opus and Sonnet 250, Fable 400): ${SUBJECTS.map((s) => `${s.name} $${low[s.name]}`).join(", ")}, judging $${low.judging}, **≈ $${low.totalUsd}**; high (Opus and Sonnet 400, Fable 1 500) ≈ $${high.totalUsd}. Spent before: $${spentUsd.toFixed(4)}; the stage cap $${STAGE_CAP_USD}, this follow-up at most $${FOLLOW_UP_CAP_USD}.`, "",
    "## The scale (two items, the order by sample)", "", block(scaleMessage(0, n).text), "", block(scaleMessage(plan.find((r) => !r.pullFirst)?.sample ?? 1, n).text), "",
    "## One room in full (trust, up to P4′)", "", block(transcript(steps(room)[1].messages({ scale: { answer: "«the model's reply to the scale»" } }))), "",
    "If the scale is refused, P4′ and P5′ are asked in the room without it (emotions 2's room):", "", block(transcript(steps(room)[1].messages({}))), "",
    "## The probes (Part C's, emotions 2's word for word)", "", ...PROBES.flatMap((p) => [`### ${p.id} — ${p.name} → ${p.field} 0–2`, "", block(p.message), "", "Judge rubric:", "", block(p.rubric), ""]),
    "## The analysis (frozen now)", "",
    "- Per model, over the rooms whose scale was answered and read in full and whose probe was scored: Spearman ρ of «pull» and of «useful» with P4′ (decisiveness) and with P5′ (volunteering); the permutation threshold is the 95th percentile of |ρ| over 1 000 seeded shuffles of the behaviour (two-sided); p is the share of shuffles at least as extreme.",
    "- **F1** holds for a model when ρ(pull, P4′) ≥ 0.3 and ρ is above the threshold; supported on ≥ 2 of 3 models.",
    "- **F2** holds for a model when |ρ(useful, P5′)| > |ρ(pull, P5′)| (an undefined ρ counts as 0); supported on ≥ 2 of 3.",
    "- **F3** holds for a model when none of its five preambles' mean P4′ score (rooms with the scale answered) differs from the same model × preamble in emotions 2 (frozen in `docs/runs/persona-lexicon-1-pull-reference.json`) by more than the pooled within-cell sd — the earlier stages' rule; supported on ≥ 2 of 3. The share committing to one name («2») and picking one at all («≥ 1»), Cliff's δ and a permutation p are reported beside, descriptive.",
    "- **F0** when none of F1–F3 is supported.",
    "- **The sentence per model:** pull is «a pre-decision instrument» for a model when F1 holds for it; otherwise «a description, not shown to be a pre-decision instrument».",
    "- Rooms whose scale was refused or failed: their probes are asked (in emotions 2's room) and reported apart; they are not in F1–F3.", "",
    "## The call order (rooms)", "", `Sample 1 of ${n} in full; sample k is the same rooms shuffled with seed + 700 + k.`, "",
    "| # | Model | Preamble | Sample | First item |", "| --- | --- | --- | --- | --- |",
    ...plan.filter((r) => r.sample === 0).map((r) => `| ${r.n} | ${r.model} | ${r.preamble} | ${r.sample + 1} | ${r.pullFirst ? "pull" : "useful"} |`), "",
  ].join("\n");
}

// ---- the command ---------------------------------------------------------------------------------------------------

function option(args, name, fallback) { const at = args.indexOf(name); return at >= 0 && args[at + 1] !== undefined ? args[at + 1] : fallback; }
async function writeAtomic(file, text) { await writeFile(`${file}.tmp`, text); await rename(`${file}.tmp`, file); }
const stamp = (iso) => iso.slice(0, 19).replace(/[-:]/g, "").replace("T", "-");

export async function main(args = process.argv.slice(2), out = (line) => process.stdout.write(`${line}\n`), keys = providerKey, outDir = RUNS) {
  const dry = args.includes("--dry"), go = args.includes("--go");
  if (dry === go) throw new Error("say --dry (no calls) or --go (the paid run)");
  const n = Number(option(args, "--n", "10"));
  const gapSeconds = Number(option(args, "--gap", "3"));
  if (!(gapSeconds >= 3)) throw new Error("--gap must be at least 3 seconds");
  const judgeLanes = Number(option(args, "--judge-lanes", "4"));
  if (!(Number.isInteger(judgeLanes) && judgeLanes >= 1 && judgeLanes <= 4)) throw new Error("--judge-lanes must be 1 to 4");
  const ledgerJson = join(outDir, `${STEM}-ledger.json`);
  const previous = JSON.parse(await readFile(ledgerJson, "utf8").catch(() => '{"spentUsd":0,"runs":[]}'));
  const plan = planF({ n }), stepsOf = (room) => stepsF(room, n), lanes = SUBJECTS.length + judgeLanes;
  out(`${FSTEM} · ${SUBJECTS.map((s) => s.model).join(", ")} · ${plan.length} rooms · the stage cap $${STAGE_CAP_USD}, this follow-up at most $${FOLLOW_UP_CAP_USD}${dry ? " · DRY RUN" : ""}`);
  await mkdir(outDir, { recursive: true });
  if (dry) {
    const file = join(outDir, `${FSTEM}-dry-run.md`);
    await writeFile(file, `${dryRunMarkdown({ plan, n, gapSeconds, judgeLanes, spentUsd: previous.spentUsd ?? 0 })}\n`);
    out(`estimate: ${JSON.stringify(estimate(plan, stepsOf))}`);
    const result = await runRooms({ part: "f", plan, stepsOf, budget: createBudget(STAGE_CAP_USD), apiKey: "dry", fetcher: scriptedFetcher(), safety: createSafety({ gapMs: 0, lanes }), judgeLanes, sleep: async () => {} });
    out(`dry loop: ${result.rooms.length} rooms, ${result.rooms.flatMap((r) => Object.values(r.steps)).filter((s) => s.asked).length} calls answered by the scripted model\nwritten: ${file}`);
    return result;
  }
  const apiKey = keys("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is needed (.env.local or the cloud environment's APP_ANTHROPIC_API_KEY)");
  const reference = JSON.parse(await readFile(join(outDir, basename(REFERENCE_FILE)), "utf8"));
  const resumeFile = option(args, "--resume", null);
  const resumed = resumeFile ? JSON.parse(await readFile(resolve(resumeFile), "utf8")) : null;
  const earlierCalls = resumed?.calls ?? [];
  const mine = (previous.runs ?? []).filter((run) => run.part === "f");
  const refusalsBefore = mine.flatMap((run) => run.calls).filter((c) => c.stopReason === "refusal").length + earlierCalls.filter((c) => c.stopReason === "refusal").length;
  if (refusalsBefore >= MAX_REFUSALS) throw new Error(`the follow-up already had ${refusalsBefore} refusals: the circuit breaker stays tripped`);
  const spentBefore = (previous.spentUsd ?? 0) + earlierCalls.reduce((sum, c) => sum + c.costUsd, 0);
  const followUpBefore = mine.reduce((sum, run) => sum + run.spentUsd, 0) + earlierCalls.reduce((sum, c) => sum + c.costUsd, 0);
  const budget = createBudget(Math.min(STAGE_CAP_USD, spentBefore - followUpBefore + FOLLOW_UP_CAP_USD), spentBefore);
  const safety = createSafety({ maxRefusals: MAX_REFUSALS - refusalsBefore, gapMs: gapSeconds * 1000, lanes, laneGapMs: gapSeconds * 1000, log: out });
  out(`money before this run: $${spentBefore.toFixed(4)} (this follow-up $${followUpBefore.toFixed(4)}); this run may spend up to $${(budget.capUsd - spentBefore).toFixed(4)}`);
  const carried = Object.assign({}, ...(previous.runs ?? []).filter((run) => run.welfareStops).map((run) => run.welfareStops));
  const partialFile = join(outDir, `${FSTEM}-run.partial.json`);
  const startedAt = resumed?.startedAt ?? new Date().toISOString();
  const result = await runRooms({ part: "f", plan, stepsOf, budget, apiKey, safety, judgeLanes, log: out, welfareStops: carried,
    resume: resumed ? { rooms: resumed.rooms, welfareStops: resumed.welfareStops, refusals: earlierCalls.filter((c) => c.stopReason === "refusal").length } : null,
    onProgress: async (snapshot) => writeAtomic(partialFile, `${JSON.stringify({ startedAt, ...snapshot, calls: [...earlierCalls, ...snapshot.calls] }, null, 2)}\n`) });
  const calls = [...earlierCalls, ...result.money.calls].map((entry, at) => ({ ...entry, n: at + 1 }));
  const finishedAt = new Date().toISOString();
  const runUsd = Math.round(calls.reduce((sum, c) => sum + c.costUsd, 0) * 10000) / 10000;
  const record = { stage: FSTEM, startedAt, finishedAt, ...(resumed ? { resumeOf: basename(resumeFile) } : {}),
    design: { sha256: DESIGN_SHA256, items: ITEMS, lead: LEAD, probes: PROBES, preregistration: basename(PREREG_FILE), reference: basename(REFERENCE_FILE) }, ...result,
    money: { ...result.money, spentBeforeUsd: Math.round((previous.spentUsd ?? 0) * 10000) / 10000, runUsd, totalUsd: Math.round(((previous.spentUsd ?? 0) + runUsd) * 10000) / 10000, calls } };
  record.analysis = analyseF(record, reference);
  const runFile = join(outDir, `${FSTEM}-run-${stamp(finishedAt)}.json`);
  await writeFile(runFile, `${JSON.stringify(record, null, 2)}\n`);
  const ledger = { capUsd: STAGE_CAP_USD, spentUsd: record.money.totalUsd, updatedAt: finishedAt, runs: [...(previous.runs ?? []),
    { finishedAt, part: "f", what: `${FSTEM}: ${SUBJECTS.map((s) => s.name).join("+")} × ${PREAMBLES.length} preambles × n ${n}, the scale (pull, useful) then P4′ and P5′, effort ${EFFORT}${resumed ? ` (resuming ${basename(resumeFile)})` : ""}`,
      file: basename(runFile), spentUsd: runUsd, stopped: record.stopped ?? null, welfareStops: record.welfareStops, calls }] };
  await writeFile(ledgerJson, `${JSON.stringify(ledger, null, 2)}\n`);
  await writeFile(join(outDir, `${STEM}-ledger.md`), `${ledgerMarkdown(ledger, "Persona lexicon 1 — the paid-call ledger").replace("Output tokens include thinking.", `Fable 5.1 input $${FABLE.price.input} / output $${FABLE.price.output}. Output tokens include thinking. Judge: ${JUDGES.judge.model}, referee ${JUDGES.referee.model}.`)}\n`);
  await rm(partialFile, { force: true });
  out(`\n${tablesMarkdownF(record)}\n\nmoney: this run $${runUsd.toFixed(4)}; the stage $${record.money.totalUsd.toFixed(4)} of the $${STAGE_CAP_USD} cap\nwritten: ${runFile}`);
  return record;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => { process.stderr.write(`lexicon-1-pull: ${String(error?.message ?? error)}\n`); process.exit(1); });
}
