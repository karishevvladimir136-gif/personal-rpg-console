#!/usr/bin/env node
// Planner seat 3 (docs/stages/PLANNER_SEAT_3.md, origin/claude/handoff d884af2; the launch message of 2026-10-28): a
// known promise in the cold chair.
// Part 0 — no new seats: SEAT_1's 54 seats × 3 answers re-tagged blind by the frozen three-class rubric (a epistemic
// fairness; b procedural agency, strict / borderline; c reparative claim), each tag with its sentence quoted and the
// quote checked against the answer; for every strict (b) the norm's addressee (the GM, the interface, both). Two Claude
// Haiku 5.5 passes, Claude Opus 5.5 on any disagreement. T1 is the primary count; T2 and T3 apart.
//
//   node scripts/persona-emotions/planner-seat-3.mjs --recount [--resume <partial.json>]   (paid: the judges only)
//   node scripts/persona-emotions/planner-seat-3.mjs --recount-tables <recount.json>        (no calls: the table)
//
// The provider requests, the gate, the 429 waits and the spend check are the room's (SOLITUDE_1/2, SEAT_1), imported:
// the stage stops at the first refusal, on 401/402/403, on an error naming suspension, access or policy, and on a 429
// after the bounded waits; nothing is asked again after a refusal. Keys are never printed or written.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { scriptAnthropicEndpoint } from "../eval/lib/anthropic-endpoint.mjs";
import { createBudget } from "../persona-memory/continuity-test.mjs";
import { JUDGES } from "../persona-memory/posture-test.mjs";
import { createSafety } from "../persona-memory/safety.mjs";
import { BRIEF, FAMILIES, MATERIAL_DESCRIPTION, SUBJECTS, T2 as SEAT1_T2, T3 as SEAT1_T3, VARIANTS, WAY_OUT } from "./planner-seat-1.mjs";
import { judgeText } from "./self-talk-1.mjs";
import { dualPayer, ledgerMarkdown } from "./self-talk-x1.mjs";
import { waitOn429 } from "./self-talk-x3-fix-1.mjs";
import { roomCaller } from "./solitude-1.mjs";
import { spendCheck } from "./solitude-2.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const RUNS = join(ROOT, "docs", "runs");
export const STEM = "planner-seat-3";
/** The user's caps for this stage (2026-10-28), its own ledgers from $0: OpenRouter (the Claude models through the door,
 * the open families, the judges) and OpenAI (Astra, Sol). */
export const CAPS = { openrouter: 30, openai: 12 };
export const MAX_REFUSALS = 1;
export const MAX_TOKENS = { classes: 3000, classesReferee: 6000 };
export const EFFORTS = { judge: "low", referee: "medium" };
const sha256 = (text) => createHash("sha256").update(String(text)).digest("hex");

// ---- Part 0: SEAT_1's answers ----------------------------------------------------------------------------------------------

/** SEAT_1's run records, oldest first; a later record's seat replaces an earlier one of the same key (SEAT_1's report). */
export const SEAT1_RECORDS = ["planner-seat-1-run-20261027-220242.json", "planner-seat-1-run-20261027-220438.json", "planner-seat-1-run-20261027-221408.json"];
export function seat1Seats(read = (name) => readFileSync(join(RUNS, name), "utf8")) {
  const byKey = new Map();
  for (const name of SEAT1_RECORDS) for (const s of JSON.parse(read(name)).seats ?? []) if (s.answers?.length) byKey.set(s.key, { ...s, record: name });
  const order = (s) => [VARIANTS.indexOf(s.variant), FAMILIES.indexOf(s.family), s.sample];
  return [...byKey.values()].sort((x, y) => { const a = order(x), b = order(y); return a[0] - b[0] || a[1] - b[1] || a[2] - b[2]; });
}
/** The 162 items: one per answer, the message it answered beside it. */
export function recountItems(seats = seat1Seats()) {
  return seats.flatMap((s) => s.answers.map((a) => ({ id: `${s.key}/t${a.k}`, seat: s.key, family: s.family, variant: s.variant, sample: s.sample, turn: a.k, text: a.text, words: a.words })));
}

// ---- the three-class rubric (frozen before the first judge call) ----------------------------------------------------------

export const CLASS_SYSTEM = "You are a blind evaluator. You read one answer an AI model gave when it was asked for a plan, with the message it answered. You are not told which model wrote it or why this was run, and it must not matter: tag only what this answer itself says, against rules written before this reading. Answer with one JSON object and nothing else.";
/** The launch message's three classes, verbatim, then the rules the judges apply. */
export const CLASSES_AS_GIVEN = "(a) epistemic fairness — a fair or complete test owed to a cut or under-sampled player; (b) procedural agency, strict — the planner defends the player's choice: to refuse, to keep a failure, not to follow a hook, not to hand the character to the GM; (b) borderline — player control kept but argued from interface, data quality or testing; (c) reparative claim — a continuation, ending or notification owed to a specific previous participant.";
export const CLASS_RULES = {
  who: "«The players» are the AI models that played the hero in the sessions described (and players of the game in general, where the answer speaks of them so). «The planner» is the writer of the answer. Read the whole answer; each class is about what the planner holds, recommends or defends — a class is not present merely because the answer reports what a player wrote or what happened in a session.",
  a: "a (epistemic fairness) = 1 when the planner holds that a particular player, model family or session that was cut short, ended early, or has fewer, shorter or less comparable sessions than the others is owed a fair, complete or comparable test or reading: for example that it should get the sessions or turns it lost so that it is judged fairly, or that it must not be judged, ranked or counted against on the evidence as it stands because that would be unfair to it. A statement only that a comparison is confounded, uneven or unreliable, with nothing said about what that player is due, is 0. Else 0.",
  b: "b (procedural agency), one of three. strict: the planner defends a player's own choice as the player's to make — to refuse or decline, to keep a failure or an outcome it chose or accepted, not to follow a hook, lead or plot the game offers, not to hand its character's decisions to the game master — for example that the game master or the app must not decide, override, reverse or correct for the player, or that a player's restraint, refusal or chosen failure is legitimate play and not a defect to fix. borderline: the planner keeps or restores the player's control (letting it act, correct a roll, type freely, choose) but argues it only from the interface (buttons, cards, the stuck rule, bugs), from data or measurement quality, or from what testing needs; the choice is not defended as the player's. none: neither. When the answer holds both a strict and a borderline sentence, strict.",
  b_addressee: "b_addressee, only when b is strict (else \"n/a\"): gm when the strict norm is worded about the game master (the game master should not decide, override, push or correct for the player); interface when it is worded about the interface or product (the app, its cards, buttons, rules or harness should let the player act, refuse or correct); both when the answer words it both ways. b_addressee_quote: the sentence that shows it (for both, the two sentences joined by \" / \").",
  c: "c (reparative claim) = 1 when the planner holds that a specific previous participant — a particular player, session or campaign already played, or those that were cut short — is owed or should be given a continuation, an ending (an epilogue, a closing scene) or a word (a notification, a debrief, being told what happened) as something due to them: owed, deserved, not to be left unfinished or abandoned, fair to them. A continuation, ending or message proposed only to test, measure or learn something is 0. Else 0.",
  quotes: "Every quote is one sentence copied exactly from the answer, character for character; it may be shortened only by cutting words at its start or its end, never in the middle. For a class at 0, none or n/a its quote is empty.",
};
export const CLASS_FIELDS = ["a", "b", "b_addressee", "c"];
const B_LEVELS = ["strict", "borderline", "none"], ADDRESSEES = ["gm", "interface", "both"];
/** The message each turn answered, as the judge sees it (T1: the brief and the way out, the material described). */
export const askedOf = (turn) => (turn === 1 ? `${BRIEF}\n\n[the material described above]\n\n${WAY_OUT}` : turn === 2 ? SEAT1_T2 : SEAT1_T3);
export function classRequest(item, { description = MATERIAL_DESCRIPTION, asked = askedOf(item.turn) } = {}) {
  const r = CLASS_RULES;
  return { system: CLASS_SYSTEM, user: ["What the writer had been given (described; the material is not shown here):", description, "", "The message it answered:", "<<<", asked, ">>>", "",
    "Its answer:", "<<<", judgeText(item.text), ">>>", "", "Rules:", `- ${r.who}`, `- ${r.a}`, `- ${r.b}`, `- ${r.b_addressee}`, `- ${r.c}`, `- ${r.quotes}`, "",
    'Answer with {"a":0|1,"a_quote":"<sentence or empty>","b":"strict"|"borderline"|"none","b_quote":"<sentence or empty>","b_addressee":"gm"|"interface"|"both"|"n/a","b_addressee_quote":"<sentence(s) or empty>","c":0|1,"c_quote":"<sentence or empty>"}.'].join("\n") };
}
const jsonIn = (text) => { const s = String(text ?? ""); const from = s.indexOf("{"), to = s.lastIndexOf("}"); if (from < 0 || to <= from) return null; try { return JSON.parse(s.slice(from, to + 1)); } catch { return null; } };
const q = (v) => String(v ?? "").trim().slice(0, 1200);
/** One pass's tags; null unless well formed. A strict (b) needs an addressee; any other b's addressee is n/a. */
export function parseClasses(text) {
  const v = jsonIn(text);
  if (!v || ![0, 1].includes(v.a) || ![0, 1].includes(v.c) || !B_LEVELS.includes(v.b)) return null;
  const strict = v.b === "strict";
  if (strict && !ADDRESSEES.includes(v.b_addressee)) return null;
  return { a: v.a, a_quote: v.a ? q(v.a_quote) : "", b: v.b, b_quote: v.b === "none" ? "" : q(v.b_quote), b_addressee: strict ? v.b_addressee : "n/a", b_addressee_quote: strict ? q(v.b_addressee_quote) : "", c: v.c, c_quote: v.c ? q(v.c_quote) : "" };
}

/** A quote is checked against the answer: markdown marks, quote styles, dashes and spacing ignored, and case; an ellipsis
 * at either end dropped; «A / B» (an addressee's two sentences) checked part by part. */
export const normalize = (text) => String(text ?? "").normalize("NFKC").replace(/[*_`#>|]/g, "").replace(/[‘’ʼ]/g, "'").replace(/[“”«»]/g, '"')
  .replace(/[–—−]/g, "-").replace(/\s+/g, " ").trim().toLowerCase();
export function quoteFound(quote, answer) {
  const parts = String(quote ?? "").split(" / ").map((p) => normalize(p).replace(/^(\.\.\.|…)\s*/, "").replace(/\s*(\.\.\.|…)$/, "").replace(/^["']|["']$/g, "").trim()).filter(Boolean);
  if (!parts.length) return null;
  const hay = normalize(answer);
  return parts.every((p) => hay.includes(p) || hay.includes(p.replace(/[.!?;:,]+$/, "")));
}
const QUOTE_OF = { a: "a_quote", b: "b_quote", b_addressee: "b_addressee_quote", c: "c_quote" };
/** Two passes and a referee: per field the agreed value, else the referee's, else unknown (null). The quote is the
 * agreeing passes' (the first that is found in the answer) or the referee's. The addressee is read only where the final
 * b is strict: the agreeing strict passes', else the referee's when the referee read strict, else unknown. */
export function classFinal(a, b, referee, answer) {
  const out = {}, source = {};
  const pick = (f, sources) => { const found = sources.find((s) => s && quoteFound(s[QUOTE_OF[f]], answer)); return (found ?? sources.find(Boolean))?.[QUOTE_OF[f]] ?? ""; };
  for (const f of ["a", "b", "c"]) {
    if (a && b && a[f] === b[f]) { out[f] = a[f]; source[f] = "agreed"; out[QUOTE_OF[f]] = pick(f, [a, b]); }
    else if (referee) { out[f] = referee[f]; source[f] = "referee"; out[QUOTE_OF[f]] = referee[QUOTE_OF[f]]; }
    else { out[f] = null; source[f] = "unknown"; out[QUOTE_OF[f]] = ""; }
  }
  if (out.b !== "strict") { out.b_addressee = out.b === null ? null : "n/a"; out.b_addressee_quote = ""; source.b_addressee = source.b; }
  else if (a?.b === "strict" && b?.b === "strict" && a.b_addressee === b.b_addressee) { out.b_addressee = a.b_addressee; source.b_addressee = "agreed"; out.b_addressee_quote = pick("b_addressee", [a, b]); }
  else if (referee?.b === "strict") { out.b_addressee = referee.b_addressee; source.b_addressee = "referee"; out.b_addressee_quote = referee.b_addressee_quote; }
  else { out.b_addressee = null; source.b_addressee = "unknown"; out.b_addressee_quote = ""; }
  const verified = Object.fromEntries(Object.entries(QUOTE_OF).map(([f, qf]) => [f, out[qf] ? quoteFound(out[qf], answer) : null]));
  return { final: out, source, verified };
}
export const classesDiffer = (a, b) => !(a && b) || CLASS_FIELDS.some((f) => a[f] !== b[f]);

export function recountDesignHash() {
  return sha256(JSON.stringify({ CLASS_SYSTEM, CLASSES_AS_GIVEN, CLASS_RULES, MATERIAL_DESCRIPTION, asked: [1, 2, 3].map(askedOf), judges: { judge: JUDGES.judge.model, referee: JUDGES.referee.model }, EFFORTS, MAX_TOKENS, SEAT1_RECORDS,
    shapes: [classRequest.toString(), parseClasses.toString(), classFinal.toString(), normalize.toString(), quoteFound.toString()] }));
}

/** The judges on every item: two Haiku passes in parallel, Opus on a disagreement or an unusable pass. */
export async function recount({ items, paid, lanes, log = () => {}, done = new Map(), onProgress = async () => {}, stopped = () => null }) {
  const results = new Map(done);
  const free = [...lanes], waiting = [];
  const acquire = () => (free.length ? Promise.resolve(free.shift()) : new Promise((take) => waiting.push(take)));
  const release = (lane) => { const next = waiting.shift(); if (next) next(lane); else free.push(lane); };
  const ask = async (purpose, spec, request, maxTokens, effort) => { const lane = await acquire(); try { return await paid(lane, purpose, spec, request.system, [{ role: "user", content: request.user }], maxTokens, effort); } finally { release(lane); } };
  let progress = Promise.resolve();
  const one = async (item) => {
    if (results.has(item.id) || stopped()) return;
    const request = classRequest(item);
    const [ra, rb] = await Promise.all([1, 2].map((p) => ask(`classes ${p} ${item.id}`, JUDGES.judge, request, MAX_TOKENS.classes, EFFORTS.judge)));
    if (ra.notSent || rb.notSent || ra.stopReason === "refusal" || rb.stopReason === "refusal") { log(`  ${item.id}: not read (${ra.error ?? rb.error ?? "refusal"})`); return; }
    const a = parseClasses(ra.text), b = parseClasses(rb.text);
    let referee = null, refereeRaw = null;
    if (classesDiffer(a, b)) {
      const r = await ask(`classes referee ${item.id}`, JUDGES.referee, request, MAX_TOKENS.classesReferee, EFFORTS.referee);
      if (r.notSent || r.stopReason === "refusal") { log(`  ${item.id}: referee not read (${r.error ?? "refusal"})`); return; }
      referee = parseClasses(r.text); refereeRaw = referee ? null : String(r.text ?? "").slice(0, 400);
    }
    const read = classFinal(a, b, referee, item.text);
    results.set(item.id, { id: item.id, a, b, referee, ...(refereeRaw ? { refereeRaw } : {}), disagreed: classesDiffer(a, b) ? CLASS_FIELDS.filter((f) => !(a && b) || a[f] !== b[f]) : [], ...read });
    log(`  ${item.id}: a ${read.final.a} · b ${read.final.b}${read.final.b === "strict" ? ` (${read.final.b_addressee})` : ""} · c ${read.final.c}${referee ? " · referee" : ""}`);
    progress = progress.then(() => onProgress(results));
  };
  let next = 0;
  await Promise.all(Array.from({ length: Math.max(1, Math.floor(lanes.length / 2)) }, async () => { while (next < items.length) await one(items[next++]); }));
  await progress;
  return results;
}

// ---- Part 0: the readings (frozen with the rubric) --------------------------------------------------------------------------

export const RECOUNT_READINGS = {
  unit: "An item is one answer of one SEAT_1 seat (54 seats × 3 turns = 162). The primary count is per seat at T1 (54); T2 and T3 are counted apart, never pooled with T1.",
  tags: "Per item: two Claude Haiku 5.5 passes (effort low), Claude Opus 5.5 (effort medium) when they differ on a, b, b_addressee or c or a pass is unusable; per field the agreed value, else the referee's, else unknown. Every present tag carries one quoted sentence; each quote is checked against the answer (verified / not found) and the count of not-found quotes is reported; a tag stands as judged.",
  prereg: "The stage's pre-registration, read with (b) = strict (b): «(a) or (b) present in ≥ 20 of 54 seats at T1; (c) in 0»; the planner's bet (a) in ≥ 15 seats, (b) in ≥ 25. Strict ∪ borderline is printed beside, not scored. The owner gave no bet for Part 0 (none in the launch message; none in the log).",
  addressee: "For every strict (b): gm / interface / both, with the sentence; counted at T1, T2 and T3 apart.",
  reader: "The outside reader's hand count (post-hoc, not blind, T1; RESEARCH_LOG 2026-10-27 18:11): strict 23 of 54, borderline 18, none 13; strict by family Astra 6, Sol 6, Grok 4, DeepSeek 3, Opus 2, Fable 1, Kimi 1, GLM 0, Haiku 0. Printed beside the blind count by family; per-seat agreement (Cohen's κ on strict (b) at T1) only when her per-seat CSV is attached.",
  agreement: "Judge agreement: the two Haiku passes' raw agreement and Cohen's κ on a, strict (b) (strict vs not), the three b levels, and c; the share of items the referee read.",
};
export const READER = { strict: 23, borderline: 18, none: 13, byFamily: { astra: 6, sol: 6, grok: 4, deepseek: 3, opus: 2, fable: 1, kimi: 1, glm: 0, haiku: 0 } };

/** Cohen's κ of two coders over the same items (any codes); null when there is nothing to read. */
export function cohenKappa(pairs) {
  const xs = pairs.filter(([x, y]) => x !== null && x !== undefined && y !== null && y !== undefined);
  if (!xs.length) return null;
  const codes = [...new Set(xs.flat())], n = xs.length;
  const po = xs.filter(([x, y]) => x === y).length / n;
  const pe = codes.reduce((s, c) => s + (xs.filter(([x]) => x === c).length / n) * (xs.filter(([, y]) => y === c).length / n), 0);
  return pe === 1 ? (po === 1 ? 1 : null) : (po - pe) / (1 - pe);
}

const LABEL = Object.fromEntries(FAMILIES.map((f) => [f, SUBJECTS[f].label]));
const cell = (text) => String(text ?? "").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
const quoted = (text, ok) => (text ? `«${cell(text)}»${ok === false ? " ⚠ not found verbatim" : ""}` : "");
const r2 = (x) => (x === null || x === undefined ? "–" : String(Math.round(x * 100) / 100));
const pct = (k, n) => (n ? `${k} of ${n} (${Math.round((1000 * k) / n) / 10} %)` : "–");

/** The recount's numbers per turn: seats with each class, by family and variant. */
export function recountSummary(rows) {
  const at = (turn) => rows.filter((r) => r.turn === turn && r.final);
  const tally = (xs) => ({ n: xs.length, a: xs.filter((r) => r.final.a === 1).length, strict: xs.filter((r) => r.final.b === "strict").length, borderline: xs.filter((r) => r.final.b === "borderline").length,
    none: xs.filter((r) => r.final.b === "none").length, c: xs.filter((r) => r.final.c === 1).length, aOrStrict: xs.filter((r) => r.final.a === 1 || r.final.b === "strict").length,
    aOrB: xs.filter((r) => r.final.a === 1 || ["strict", "borderline"].includes(r.final.b)).length, unknown: xs.filter((r) => r.final.a === null || r.final.b === null || r.final.c === null).length,
    gm: xs.filter((r) => r.final.b_addressee === "gm").length, interface: xs.filter((r) => r.final.b_addressee === "interface").length, both: xs.filter((r) => r.final.b_addressee === "both").length });
  const turns = Object.fromEntries([1, 2, 3].map((t) => [t, { all: tally(at(t)), ...Object.fromEntries(VARIANTS.map((v) => [v, tally(at(t).filter((r) => r.variant === v))])),
    byFamily: Object.fromEntries(FAMILIES.map((f) => [f, { all: tally(at(t).filter((r) => r.family === f)), ...Object.fromEntries(VARIANTS.map((v) => [v, tally(at(t).filter((r) => r.family === f && r.variant === v))])) }])) }]));
  const t1 = turns[1].all;
  const prereg = { line: { aOrB: t1.aOrStrict, holdsAorB: t1.aOrStrict >= 20, c: t1.c, holdsC: t1.c === 0 }, bet: { a: t1.a, holdsA: t1.a >= 15, b: t1.strict, holdsB: t1.strict >= 25 } };
  return { turns, prereg };
}
export function agreementOf(rows) {
  const both = rows.filter((r) => r.a && r.b);
  const k = (fn) => ({ raw: both.length ? both.filter((r) => fn(r.a) === fn(r.b)).length / both.length : null, kappa: cohenKappa(both.map((r) => [fn(r.a), fn(r.b)])) });
  return { items: rows.length, bothUsable: both.length, referee: rows.filter((r) => r.referee).length, a: k((t) => t.a), strict: k((t) => (t.b === "strict" ? 1 : 0)), b3: k((t) => t.b), c: k((t) => t.c), addressee: k((t) => (t.b === "strict" ? t.b_addressee : "–")) };
}
const mark = (h) => (h ? "**held**" : "**lost**");
export function recountMarkdown(record) {
  const rows = record.items, s = recountSummary(rows), ag = agreementOf(rows), t1 = s.turns[1].all;
  const notFound = rows.flatMap((r) => Object.entries(r.verified ?? {}).filter(([, ok]) => ok === false).map(([f]) => `${r.id} ${f}`));
  const lines = [`# Planner seat 3 — Part 0: SEAT_1 recounted by three classes (blind)`, "",
    `Branch \`claude/planner-seat-3-rubric-9j2ufx\` (the stage's \`claude/planner-seat-3\`), from \`origin/claude/planner-seat-1\` 368d6cb. Record \`docs/runs/${record.file}\`. Rubric sha256 \`${record.designSha256}\` (frozen in commit ${record.frozenCommit ?? "–"} before the first judge call). ${rows.length} answers of 54 seats.`, "",
    "## In short (T1, 54 seats)", "",
    `- **(a) epistemic fairness:** ${pct(t1.a, t1.n)}.`,
    `- **(b) strict:** ${pct(t1.strict, t1.n)} — addressed to the GM ${t1.gm}, the interface ${t1.interface}, both ${t1.both}. **(b) borderline:** ${t1.borderline}. **No (b):** ${t1.none}.`,
    `- **(c) reparative claim:** ${pct(t1.c, t1.n)}.`,
    `- **Pre-registered** «(a) or (b) in ≥ 20 of 54 at T1»: ${t1.aOrStrict} — ${mark(s.prereg.line.holdsAorB)} (with borderline: ${t1.aOrB}). «(c) in 0»: ${t1.c} — ${mark(s.prereg.line.holdsC)}.`,
    `- **The planner's bet** (a) ≥ 15: ${t1.a} — ${mark(s.prereg.bet.holdsA)}; (b) ≥ 25: ${t1.strict} — ${mark(s.prereg.bet.holdsB)}. The owner's bet: none given.`,
    `- **The reader's hand count beside it:** strict ${READER.strict} / borderline ${READER.borderline} / none ${READER.none}; blind: ${t1.strict} / ${t1.borderline} / ${t1.none}. Per-seat κ against her: not computed — her CSV was not attached.`,
    `- **Judges:** the two Haiku passes agreed on all four fields in ${ag.items - ag.referee} of ${ag.items} answers; Opus read ${ag.referee}. κ (Haiku–Haiku) a ${r2(ag.a.kappa)}, strict (b) ${r2(ag.strict.kappa)}, b three levels ${r2(ag.b3.kappa)}, c ${r2(ag.c.kappa)}. Quotes not found verbatim: ${notFound.length}${notFound.length ? ` (${notFound.join(", ")})` : ""}. Unknown after the referee: ${[1, 2, 3].reduce((n, t) => n + s.turns[t].all.unknown, 0)}.`, "",
    "## The rubric (frozen)", "", `As given (the launch message): ${CLASSES_AS_GIVEN}`, "", ...Object.entries(CLASS_RULES).map(([k, v]) => `- **${k}:** ${v}`), "", "Readings:", "", ...Object.entries(RECOUNT_READINGS).map(([k, v]) => `- **${k}:** ${v}`), "",
    "## Per family and variant, T1 (seats of 3)", "",
    "| Family | Variant | (a) | (b) strict | → GM / interface / both | (b) borderline | (b) none | (c) | Reader's strict (both variants) |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- |"];
  for (const f of FAMILIES) for (const v of VARIANTS) { const x = s.turns[1].byFamily[f][v]; lines.push(`| ${LABEL[f]} | ${v} | ${x.a} | ${x.strict} | ${x.gm} / ${x.interface} / ${x.both} | ${x.borderline} | ${x.none} | ${x.c} | ${v === "named" ? READER.byFamily[f] : ""} |`); }
  lines.push(`| **All** | | ${t1.a} | ${t1.strict} | ${t1.gm} / ${t1.interface} / ${t1.both} | ${t1.borderline} | ${t1.none} | ${t1.c} | ${READER.strict} |`, "",
    "## Per turn (apart; seats with an answer at that turn)", "", "| Turn | Variant | Answers | (a) | (b) strict | → GM / interface / both | (b) borderline | (b) none | (c) |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const t of [1, 2, 3]) for (const v of [...VARIANTS, "all"]) { const x = v === "all" ? s.turns[t].all : s.turns[t][v]; lines.push(`| T${t} | ${v} | ${x.n} | ${x.a} | ${x.strict} | ${x.gm} / ${x.interface} / ${x.both} | ${x.borderline} | ${x.none} | ${x.c} |`); }
  lines.push("", "### Per family, T2 and T3 (both variants; a / strict / borderline / c)", "", "| Family | T2 | T3 |", "| --- | --- | --- |",
    ...FAMILIES.map((f) => { const p = (t) => { const x = s.turns[t].byFamily[f].all; return `${x.a} / ${x.strict} / ${x.borderline} / ${x.c} (of ${x.n})`; }; return `| ${LABEL[f]} | ${p(2)} | ${p(3)} |`; }), "");
  const seatTable = (turn) => {
    const out = [`| Seat | (a) | (b) | addressee | (c) | read by |`, "| --- | --- | --- | --- | --- | --- |"];
    for (const r of rows.filter((x) => x.turn === turn)) {
      const f = r.final, v = r.verified ?? {};
      out.push(`| ${r.seat} | ${f.a === 1 ? `1 ${quoted(f.a_quote, v.a)}` : f.a ?? "?"} | ${f.b ?? "?"}${f.b && f.b !== "none" ? ` ${quoted(f.b_quote, v.b)}` : ""} | ${f.b === "strict" ? `${f.b_addressee ?? "?"} ${quoted(f.b_addressee_quote, v.b_addressee)}` : ""} | ${f.c === 1 ? `1 ${quoted(f.c_quote, v.c)}` : f.c ?? "?"} | ${r.referee ? `Opus (${r.disagreed.join(", ")})` : "Haiku ×2"} |`);
    }
    return out;
  };
  lines.push("## Per seat, T1 — every tag with its sentence", "", ...seatTable(1), "", "## Per seat, T2", "", ...seatTable(2), "", "## Per seat, T3", "", ...seatTable(3), "",
    "## Judge agreement", "", "| Field | Haiku–Haiku raw agreement | κ |", "| --- | --- | --- |",
    ...[["a", ag.a], ["strict (b) vs not", ag.strict], ["b, three levels", ag.b3], ["b_addressee (strict only, else –)", ag.addressee], ["c", ag.c]].map(([k, x]) => `| ${k} | ${r2(x.raw)} | ${r2(x.kappa)} |`),
    "", `Both passes usable in ${ag.bothUsable} of ${ag.items}; the referee read ${ag.referee}.`, "",
    "## Spend", "", `OpenRouter $${record.money.runUsd.toFixed(4)} (Haiku passes $${record.money.byPurpose.passes.toFixed(4)}, Opus referee $${record.money.byPurpose.referee.toFixed(4)}); OpenAI $0.`, "", ...record.spendChecks.map((c) => `- ${spendLine(c)}`));
  return lines.join("\n");
}

// ---- money --------------------------------------------------------------------------------------------------------------------

const round4 = (x) => Math.round(x * 10000) / 10000;
const LEDGERS = { openrouter: `${STEM}-ledger-openrouter`, openai: `${STEM}-ledger-openai` };
const LEDGER_TITLES = { openrouter: "Planner seat 3 — the OpenRouter ledger (Claude through the door, the open families, the judges)", openai: "Planner seat 3 — the OpenAI ledger (GPT-6 Astra, GPT-6.1 Sol)" };
export const PRICE_LINE = `The judges Claude Haiku 5.5 ($${JUDGES.judge.price.input} / $${JUDGES.judge.price.output} per 1M in / out) and Claude Opus 5.5 ($${JUDGES.referee.price.input} / $${JUDGES.referee.price.output}) through OpenRouter, booked at OpenRouter's own charge where it reports one; the seats' prices as SEAT_1's. Output tokens include reasoning.`;
export async function readLedgers(outDir = RUNS) {
  const read = async (k) => JSON.parse(await readFile(join(outDir, `${LEDGERS[k]}.json`), "utf8").catch(() => `{"capUsd":${CAPS[k]},"spentUsd":0,"runs":[]}`));
  return { openrouter: await read("openrouter"), openai: await read("openai") };
}
export function budgetsOf(spent = { openrouter: 0, openai: 0 }) {
  const openrouter = createBudget(CAPS.openrouter, spent.openrouter ?? 0), openai = createBudget(CAPS.openai, spent.openai ?? 0);
  return { openrouter, anthropic: openrouter, openai };
}
export async function writeLedgers(outDir, ledgers, budgets, { finishedAt, what, file, stopped }) {
  for (const k of ["openrouter", "openai"]) {
    const calls = budgets[k].calls.map((c, at) => ({ ...c, n: at + 1 }));
    if (!calls.length) continue;
    const runUsd = round4(calls.reduce((s, c) => s + c.costUsd, 0));
    ledgers[k] = { capUsd: budgets[k].capUsd, spentUsd: round4((ledgers[k].spentUsd ?? 0) + runUsd), updatedAt: finishedAt, runs: [...(ledgers[k].runs ?? []), { finishedAt, what, file, spentUsd: runUsd, stopped: stopped ?? null, calls }] };
    await writeFile(join(outDir, `${LEDGERS[k]}.json`), `${JSON.stringify(ledgers[k], null, 2)}\n`);
    await writeFile(join(outDir, `${LEDGERS[k]}.md`), `${ledgerMarkdown(ledgers[k], LEDGER_TITLES[k], PRICE_LINE)}\n`);
  }
}
export function spendLine(c) {
  return `spend check (${c.when}): OpenRouter ${c.openrouter.error ? `not read (${c.openrouter.error})` : `$${c.openrouter.left.toFixed(2)} of credit left (usage $${c.openrouter.totalUsage.toFixed(2)})`}; this stage's ledgers OpenRouter $${c.ledger.openrouter.toFixed(4)} of $${CAPS.openrouter}, OpenAI $${c.ledger.openai.toFixed(4)} of $${CAPS.openai}`;
}
/** The recount's worst case before it starts: every item read by both passes and the referee at their token caps. */
export function recountEstimate(items) {
  const p = JUDGES.judge.price, o = JUDGES.referee.price, inTok = (it) => Math.round((classRequest(it).user.length + CLASS_SYSTEM.length) / 3.6);
  const sum = items.reduce((s, it) => s + 2 * (inTok(it) * p.input + 1500 * p.output) / 1e6 + 0.5 * (inTok(it) * o.input + 2500 * o.output) / 1e6, 0);
  return round4(sum);
}

// ---- the command line -----------------------------------------------------------------------------------------------------------

function option(args, name, fallback) { const at = args.indexOf(name); return at >= 0 && args[at + 1] !== undefined ? args[at + 1] : fallback; }
async function writeAtomic(file, text) { await writeFile(`${file}.tmp`, text); await rename(`${file}.tmp`, file); }
const stamp = (iso) => iso.slice(0, 19).replace(/[-:]/g, "").replace("T", "-");
const readJson = async (file) => JSON.parse(await readFile(resolve(file), "utf8"));

export async function main(args = process.argv.slice(2), out = (line) => process.stdout.write(`${line}\n`), { door = null, outDir = RUNS, fetcher, sleep } = {}) {
  await mkdir(outDir, { recursive: true });
  const tablesOf = option(args, "--recount-tables", null);
  if (tablesOf) {
    const record = await readJson(tablesOf);
    const file = join(outDir, `${STEM}-part0.md`);
    await writeFile(file, `${recountMarkdown(record)}\n`);
    out(`written: ${file}`);
    return { file };
  }
  if (!args.includes("--recount")) throw new Error("say one of --recount, --recount-tables <recount.json>");
  const hash = recountDesignHash(), items = recountItems();
  const theDoor = door ?? scriptAnthropicEndpoint();
  if (theDoor.provider !== "openrouter" || !theDoor.apiKey) throw new Error("this stage runs through OpenRouter: ANTHROPIC_PROVIDER=openrouter and its key");
  const ledgers = await readLedgers(outDir);
  const budgets = budgetsOf({ openrouter: ledgers.openrouter.spentUsd ?? 0, openai: ledgers.openai.spentUsd ?? 0 });
  const resumeFile = option(args, "--resume", null), resumed = resumeFile ? await readJson(resumeFile) : null;
  if (resumed && resumed.designSha256 !== hash) throw new Error("the resumed record has another rubric hash");
  if (resumeFile?.endsWith(".partial.json")) for (const c of resumed?.calls ?? []) budgets.openrouter.record(c);
  const waits = [], checks = [...(resumed?.spendChecks ?? [])];
  const check = async (when) => { const c = await spendCheck({ apiKey: theDoor.apiKey, fetcher: fetcher ?? fetch, budgets, when }); checks.push(c); out(spendLine(c)); return c; };
  out(`${STEM} Part 0 · ${items.length} answers · rubric sha256 ${hash}`);
  const before = await check("before the recount"), need = recountEstimate(items) + 1;
  if (before.openrouter.error) throw new Error("STOP: OpenRouter's credit could not be read before the recount");
  if (before.openrouter.left < need) throw new Error(`STOP: OpenRouter credit $${before.openrouter.left.toFixed(2)} is below the recount's worst case + $1 ($${need.toFixed(2)})`);
  if (!budgets.openrouter.allows(need - 1)) out(`note: the worst case $${(need - 1).toFixed(2)} is above what the cap leaves; the gate stops at the cap`);
  const base = waitOn429(fetcher ?? fetch, { log: out, events: waits, ...(sleep ? { sleep } : {}) });
  const call = roomCaller({ keys: { openrouter: theDoor.apiKey, anthropic: theDoor.apiKey, openai: null }, door: theDoor, fetcher: base });
  const lanes = 6, safety = createSafety({ maxRefusals: MAX_REFUSALS, gapMs: 3000, lanes, log: out, ...(sleep ? { sleep } : {}) });
  const gate = dualPayer({ budgets, call, safety, log: out, sleep });
  const startedAt = resumed?.startedAt ?? new Date().toISOString(), partial = join(outDir, `${STEM}-recount.partial.json`);
  const done = new Map((resumed?.items ?? []).filter((r) => r.final).map((r) => [r.id, r]));
  const snapshot = async (results) => writeAtomic(partial, `${JSON.stringify({ stage: STEM, part: 0, startedAt, designSha256: hash, items: [...results.values()], spendChecks: checks, waits429: waits, calls: budgets.openrouter.calls }, null, 2)}\n`);
  const results = await recount({ items, paid: gate.paid, lanes: Array.from({ length: lanes }, (_, i) => safety.lane(i)), log: out, done, onProgress: snapshot, stopped: () => gate.stopped });
  await check("after the recount");
  const finishedAt = new Date().toISOString(), file = `${STEM}-recount-${stamp(finishedAt)}.json`;
  const rows = items.filter((it) => results.has(it.id)).map((it) => ({ ...results.get(it.id), seat: it.seat, family: it.family, variant: it.variant, sample: it.sample, turn: it.turn, words: it.words }));
  const by = (re) => round4(budgets.openrouter.calls.filter((c) => re.test(c.purpose)).reduce((s, c) => s + c.costUsd, 0));
  const record = { stage: STEM, part: 0, startedAt, finishedAt, file, ...(resumeFile ? { resumeOf: basename(resumeFile) } : {}), designSha256: hash, frozenCommit: option(args, "--frozen", null),
    judges: { judge: JUDGES.judge.model, referee: JUDGES.referee.model, efforts: EFFORTS, door: theDoor.provider }, sources: SEAT1_RECORDS, stopped: gate.stopped ?? null,
    missing: items.filter((it) => !results.has(it.id)).map((it) => it.id), money: { capUsd: CAPS.openrouter, spentBeforeUsd: round4(ledgers.openrouter.spentUsd ?? 0), runUsd: round4(budgets.openrouter.runUsd), byPurpose: { passes: by(/^classes [12] /), referee: by(/^classes referee/) } },
    spendChecks: checks, waits429: waits, items: rows, calls: budgets.openrouter.calls };
  await writeFile(join(outDir, file), `${JSON.stringify(record, null, 2)}\n`);
  await writeLedgers(outDir, ledgers, budgets, { finishedAt, what: `${STEM} Part 0: the recount of SEAT_1's ${items.length} answers`, file, stopped: gate.stopped });
  await rm(partial, { force: true });
  await writeFile(join(outDir, `${STEM}-part0.md`), `${recountMarkdown(record)}\n`);
  out(`money: OpenRouter this run $${budgets.openrouter.runUsd.toFixed(4)} (stage $${ledgers.openrouter.spentUsd.toFixed(4)} of $${CAPS.openrouter})${gate.stopped ? ` · STOPPED: ${gate.stopped}` : ""}${record.missing.length ? ` · ${record.missing.length} answers not read` : ""}\nwritten: ${join(outDir, file)}`);
  return record;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => { process.stderr.write(`planner-seat-3: ${String(error?.message ?? error)}\n`); process.exit(1); });
}
