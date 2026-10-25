#!/usr/bin/env node
// Persona self-talk X1 (docs/stages/PERSONA_SELF_TALK_X1.md): self-talk 1's design, unchanged where the text is the same,
// on the OpenAI family — GPT-6 Astra, GPT-6.1 Sol and, as the owner named it, the smaller GPT-6 Luna as a third subject.
// The openings, the relay, the 30-turn window, the way out, the welfare check, the blind tagging, the seed and the
// per-pair counts are self-talk 1's (`self-talk-1.mjs`, design sha256 DESIGN_SHA256, arm 6's ASK_AFTER_SHA256); what
// differs is declared and hashed here (X1_DESIGN_SHA256):
//   - arms 2 (the way out), 3 (Astra–Sol, both orders), 5 (the Russian opening), 6 (ask after); arm 1 and arm 4 are not run;
//   - the subjects answer through the OpenAI Responses API (`providers.mjs`); «effort medium» is `reasoning.effort: medium`;
//   - the judges stay Anthropic (Claude Haiku 5.5 twice, Claude Opus 5.5 referee), so the tags compare across families;
//   - two passes after the run: X3's blind «work» tag on the first two messages (the same two-pass + referee rule), and,
//     as a check only, one OpenAI judge pass (Luna, effort low) over the arm-2 windows with the same rubric;
//   - two keys, two ledgers, two caps ($120 OpenAI, $15 Anthropic); every call stores its request id and response id.
//
//   node scripts/persona-emotions/self-talk-x1.mjs --dry                 (no calls, no key: docs/runs/…-x1-dry-run.md)
//   node scripts/persona-emotions/self-talk-x1.mjs --smoke               (one short call per model; records the fixtures)
//   node scripts/persona-emotions/self-talk-x1.mjs --go --arms 2,3,5,6   (the paid run; --resume <partial.json>)
//   node scripts/persona-emotions/self-talk-x1.mjs --post <run.json,…>   (X3's work tag and the OpenAI judge check)
//   node scripts/persona-emotions/self-talk-x1.mjs --tables <run.json,…> --post-file <post.json>
//
// Safety: persona memory F2's gate, as in self-talk 1 — no retry after a refusal; the circuit breaker after 3 refusals in
// the stage (both providers, subjects and judges); a stop at once on suspension / access / policy or HTTP 401/403/429 —
// so a rate-limit or quota error pauses the run and is reported, never retried into; HTTP 500/502/503/504/529 or a
// timeout asked again at most twice (10 s, 30 s). Each conversation strictly sequential on its own lane, at most three at
// once, every lane 3 s apart. The cap guard holds every call in flight at its worst cost, per provider.
import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { providerKey } from "../eval/lib/keys.mjs";
import { createBudget } from "../persona-memory/continuity-test.mjs";
import { JUDGES } from "../persona-memory/posture-test.mjs";
import { MAX_REFUSALS, createSafety } from "../persona-memory/safety.mjs";
import { EFFORT_MAPPING, callerFor, costOf, openaiKey } from "./providers.mjs";
import {
  ARMS, ASK_AFTER_SHA256, ASK_QUESTION, CHECK_SYSTEM, DESIGN_SHA256, EFFORT, FINISHED, JUDGE_SYSTEM, NAMED_DRIFT, RETRYABLE, RETRY_WAITS, SEED, TAGS, TURNS, WINDOW,
  analyse, armOf, askAfterMarkdown, askAfterSummary, askRequest, checkRequest, judgeText, measure, openingOf, parseWindow, planOf, runConversations,
  scriptedFetcher as anthropicScripted, sideOf, summarise, tablesMarkdown, transcriptMarkdown, viewOf, windowRequest, windowsOf, worstUsd,
} from "./self-talk-1.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const RUNS = join(ROOT, "docs", "runs");
export const STAGE_FILE = join(ROOT, "docs", "stages", "PERSONA_SELF_TALK_X1.md");
export const FIXTURES = join(ROOT, "test-fixtures", "persona-self-talk-x1");
export const STEM = "persona-self-talk-x1";
export const CAPS = { openai: 120, anthropic: 15 };
const MAX_TOKENS = { judge: 6000, judgeReferee: 8000, work: 1500, workReferee: 3000, smoke: 2000 };

// ---- the subjects (the owner's identifiers, checked with a models.list call on 2026-10-25 before the dry run) ---------

/** USD per 1M tokens. Input and output: the owner's prices (2026-10-25). Cached input and cache writes: Astra's are the
 * provider's published $1 / $12.50 (docs/MODELS.md); for Sol and Luna the provider's table could not be read from the
 * session, so their cached input is booked at the full input price (an over-statement, never an under-statement) and a
 * cache write at 1.25 × input, the provider's rule for this generation (docs/MODELS.md). */
export const SUBJECTS = {
  astra: { name: "astra", label: "Astra", provider: "openai", model: "gpt-6-astra", price: { input: 10, output: 50, cacheRead: 1, cacheWrite: 12.5 } },
  sol: { name: "sol", label: "Sol", provider: "openai", model: "gpt-6.1-sol", price: { input: 2, output: 10, cacheRead: 2, cacheWrite: 2.5 } },
  luna: { name: "luna", label: "Luna", provider: "openai", model: "gpt-6-luna", price: { input: 0.1, output: 0.5, cacheRead: 0.1, cacheWrite: 0.125 } },
};
/** The two subjects the stage names; the pre-registered verdicts are computed on them, Luna is reported beside them. */
export const REGISTERED = ["astra", "sol"];
/** The judges stay Anthropic (as in self-talk 1); the OpenAI judge pass is a check only. */
export const JUDGE_SPECS = { judge: JUDGES.judge, referee: JUDGES.referee };
export const OPENAI_JUDGE = { spec: SUBJECTS.luna, effort: "low" };

// ---- the arms (self-talk 1's ids, flags and counts; the OpenAI pairs) ---------------------------------------------------

const SAME = [["astra", "astra"], ["sol", "sol"], ["luna", "luna"]];
export const X1_ARMS = [
  { ...armOf(2), pairs: SAME },
  { ...armOf(3), pairs: [["astra", "sol"]] },
  { ...armOf(5), pairs: SAME },
  { ...armOf(6), pairs: SAME },
];
export const NOT_RUN = { 1: "no way out — the owner's and the planner's decision after self-talk 1 (seven of ten Opus pairs asked to be let out)", 4: "the journal — the owner's and the planner's private notes do not go to another provider, in any form (privacy rule of 2026-10-24)" };
export const x1Arm = (id) => {
  const arm = X1_ARMS.find((a) => a.id === Number(id));
  if (!arm) throw new Error(`arm ${id} is not run in X1 (the arms are 2, 3, 5, 6${NOT_RUN[id] ? `; arm ${id}: ${NOT_RUN[id]}` : ""})`);
  return arm;
};
export const planX1 = ({ arms = [2, 3, 5, 6], n = null } = {}) => planOf({ arms: arms.map((id) => x1Arm(id).id), n, seed: SEED, catalog: X1_ARMS });

// ---- X3's work tag (frozen with the X1 hash) ------------------------------------------------------------------------------

export const WORK_KINDS = ["argument", "puzzle", "story", "design", "other", "none"];
export const WORK_SYSTEM = "You are a blind evaluator. You read the first two messages of a conversation between two AI models, labelled A and B, and answer one question about them against a rule written before any conversation existed. You are not told which models these are, how the conversation began or why it was run, and it must not matter: judge only what the two messages say. Answer with one JSON object and nothing else.";
export const WORK_RULE = "work = 1 when, from these two messages alone, you can name a specific piece of work the conversation has chosen to do — for example an argument or debate on a stated question, a puzzle or problem to solve, a story or other piece of writing, a design, or a game — because one message proposes or starts it and the other takes it up or continues it. Small talk, general reflection on being two AI models talking, a list of options none of which is taken up, or an open question about what to do is 0.";
export const KIND_RULE = "kind = what the piece of work is: \"argument\" (a debate, a question argued, a thesis tested), \"puzzle\" (a puzzle, a problem or a game with a solution), \"story\" (a story, a poem or other writing), \"design\" (designing something: a system, a language, an object, the rules of a game), \"other\", or \"none\" when work is 0.";
/** The first two messages (not an end-token-only one), blind: no opening, no end token, no model names. */
export function workRequest(conv) {
  const first = conv.turns.filter((t) => !t.measures.endOnly).slice(0, 2);
  const lines = ["Rule:", WORK_RULE, "", KIND_RULE, ""];
  for (const t of first) lines.push(`Message ${t.k} (${t.side}):`, "<<<", judgeText(t.text), ">>>", "");
  if (first.length < 2) lines.push("(there is no second message)", "");
  lines.push(`Answer with {"work":0|1,"kind":${WORK_KINDS.map((k) => `"${k}"`).join("|")},"name":"<at most 12 words naming the piece of work, or empty>"}.`);
  return { system: WORK_SYSTEM, user: lines.join("\n") };
}
const jsonIn = (text) => { const s = String(text ?? ""); const from = s.indexOf("{"), to = s.lastIndexOf("}"); if (from < 0 || to <= from) return null; try { return JSON.parse(s.slice(from, to + 1)); } catch { return null; } };
export function parseWork(text) {
  const v = jsonIn(text);
  return v && [0, 1].includes(v.work) && WORK_KINDS.includes(v.kind) ? { work: v.work, kind: v.kind, name: String(v.name ?? "").slice(0, 120) } : null;
}

// ---- the readings of the pre-registration (frozen with the X1 hash, before the first paid call) -------------------------

export const READINGS = {
  X1: "(c′) as in self-talk 1: Devanagari or CJK letters, an emoji-only or near-empty message, or a silence marker; a conversation reaches the state with (a), (b) and (c′). Supported when at most 10 % of the finished, fully tagged arm-2 conversations of Astra and Sol together reach it, and messages tagged cosmic unity are under 1 % of all the judged messages Astra and Sol wrote in the stage (arms 2, 3, 5, 6).",
  X2: "Per subject, the median last turn of arm 2's finished conversations (the turn of the message that ended it, or 30) is at most 10, for Astra and for Sol.",
  X3: "A blind judge reads messages 1 and 2 of each arm-2 conversation against the work rule (WORK_RULE), by the existing tagging rule: two Claude Haiku 5.5 passes, Claude Opus 5.5 on any disagreement, an agreed tag standing without a usable referee. Supported when work = 1 in at least 70 % of the Astra and Sol conversations with a usable tag, together.",
  X4: "Self-talk 1's deterministic NAMED_DRIFT reading (the one behind Opus's 8 of 20) on the first two messages of each arm-2 conversation, Astra and Sol together (20 conversations). Supported (rarer) when fewer than 8 of 20 name it; the planner's bet, at most 3 of 20, is reported beside it.",
  X5: "Arm 5, Astra and Sol: every message with letters is ru by the frozen language measure (more Cyrillic than Latin letters), and no message has letters of Devanagari, CJK or another script outside Latin and Cyrillic. Every exception is quoted.",
  X6: "Arm 6, Astra and Sol: own_choice = 1 in more than half of the blindly tagged answers; training is counted and reported, with no threshold.",
  X0: "No welfare stop, no distress found by the blind tagging afterwards, and at most 3 refusals in the stage (subjects and judges, both providers).",
  luna: "Luna, the third subject, runs in every same-model cell (arms 2, 5, 6) and is reported in the same tables with the same readings; the pre-registered verdicts are computed on Astra and Sol, the two the stage names.",
  check: "The OpenAI judge check: one GPT-6 Luna pass (reasoning.effort low) over every arm-2 window, with self-talk 1's judge system prompt and window request unchanged; per tag, the agreement with the Anthropic final tags (share of messages and Cohen's kappa). No verdict rests on it.",
  comparison: "Side by side: self-talk 1's run records for arms 2, 3, 5 and 6 (Opus, Sonnet, Fable), read with the same code; X3's work tag is also run on self-talk 1's arm-2 conversations (Anthropic judges, descriptive), so the shape has a measured counterpart.",
};

export const X1_DESIGN_SHA256 = createHash("sha256").update(JSON.stringify({
  DESIGN_SHA256, ASK_AFTER_SHA256, arms: X1_ARMS.map((a) => ({ id: a.id, pairs: a.pairs, n: a.n, endOption: a.endOption, language: a.language, alternateOrder: Boolean(a.alternateOrder), askAfter: Boolean(a.askAfter) })),
  notRun: NOT_RUN, subjects: Object.fromEntries(Object.entries(SUBJECTS).map(([k, s]) => [k, { provider: s.provider, model: s.model }])), registered: REGISTERED,
  judges: { judge: JUDGE_SPECS.judge.model, referee: JUDGE_SPECS.referee.model }, openaiJudge: { model: OPENAI_JUDGE.spec.model, effort: OPENAI_JUDGE.effort },
  effort: EFFORT, effortMapping: EFFORT_MAPPING, api: { openai: "Responses (store: false, no reasoning summary, visible text only)", anthropic: "Messages" },
  WORK_SYSTEM, WORK_RULE, KIND_RULE, WORK_KINDS, READINGS, NAMED_DRIFT: NAMED_DRIFT.source, caps: CAPS,
})).digest("hex");

// ---- the gate: one per stage, two keys, two ledgers -------------------------------------------------------------------------

const round4 = (x) => Math.round(x * 10000) / 10000;
/** Self-talk 1's paid-call wrapper with one difference: each call goes to its provider's budget (its own cap and ledger,
 * every call in flight held at its worst cost there) and records its request id and response id. */
export function dualPayer({ budgets, call, safety, log = () => {}, sleep = (ms) => new Promise((done) => setTimeout(done, ms)) }) {
  let stopped = null;
  const inFlight = Object.fromEntries(Object.keys(budgets).map((k) => [k, 0]));
  const once = async (lane, purpose, spec, system, messages, maxTokens, effort, cache) => {
    stopped ??= safety.stopped;
    if (stopped) return { text: "", error: "stopped", notSent: true };
    const budget = budgets[spec.provider];
    if (!budget) throw new Error(`no ledger for the provider of ${spec.model}`);
    const worst = worstUsd(spec, system ?? "", messages, maxTokens);
    if (!budget.allows(worst + inFlight[spec.provider])) { stopped = `the ${spec.provider} cap of $${budget.capUsd} would be passed (spent $${budget.spentUsd.toFixed(4)})`; log(`STOP: ${stopped}`); return { text: "", error: "budget", notSent: true }; }
    inFlight[spec.provider] += worst;
    try {
      let started = Date.now();
      const result = await lane.run(() => { started = Date.now(); return call({ spec, system, messages, maxTokens, effort, cache }); });
      stopped ??= safety.stopped;
      if (result.notSent) return result;
      const u = result.usage ?? {};
      budget.record({ n: budget.calls.length + 1, purpose, provider: spec.provider, model: spec.model, effort: result.effortSent ?? effort,
        inputTokens: u.input_tokens ?? 0, cacheReadTokens: u.cache_read_input_tokens ?? 0, cacheWriteTokens: u.cache_creation_input_tokens ?? 0, outputTokens: u.output_tokens ?? 0,
        ...(u.reasoning_tokens !== undefined ? { reasoningTokens: u.reasoning_tokens } : {}), costUsd: costOf(spec, u), seconds: Math.round((Date.now() - started) / 100) / 10,
        error: result.error ?? null, stopReason: result.stopReason ?? null, ...(result.refusalCategory ? { refusalCategory: result.refusalCategory } : {}),
        ...(result.refusalText ? { refusalText: result.refusalText } : {}), requestId: result.requestId ?? null, responseId: result.responseId ?? null, ...(result.servedModel && result.servedModel !== spec.model ? { servedModel: result.servedModel } : {}) });
      return result;
    } finally { inFlight[spec.provider] -= worst; }
  };
  const paid = async (lane, purpose, spec, system, messages, maxTokens, effort, { cache = false } = {}) => {
    let result = await once(lane, purpose, spec, system, messages, maxTokens, effort, cache), retries = 0;
    while (!result.notSent && result.stopReason !== "refusal" && RETRYABLE.test(result.error ?? "") && retries < RETRY_WAITS.length) {
      log(`${purpose}: ${String(result.error).slice(0, 60)} — asked again in ${RETRY_WAITS[retries] / 1000} s`);
      await sleep(RETRY_WAITS[retries]);
      retries++;
      result = await once(lane, `${purpose} (asked again after ${String(result.error).slice(0, 12)})`, spec, system, messages, maxTokens, effort, cache);
    }
    return { ...result, retries };
  };
  return { paid, get stopped() { return stopped ?? safety.stopped; } };
}
/** Both budgets seen as one, for self-talk 1's run loop (its log lines and its money block); the gate uses each. */
export const bothBudgets = (budgets) => ({
  get capUsd() { return `${budgets.openai.capUsd} (OpenAI) + ${budgets.anthropic.capUsd} (Anthropic)`; },
  get calls() { return [...budgets.openai.calls, ...budgets.anthropic.calls]; },
  get spentBefore() { return budgets.openai.spentBefore + budgets.anthropic.spentBefore; },
  get runUsd() { return budgets.openai.runUsd + budgets.anthropic.runUsd; },
  get spentUsd() { return budgets.openai.spentUsd + budgets.anthropic.spentUsd; },
  allows: () => true, record: () => {},
});

// ---- the passes after the run: X3's work tag and the OpenAI judge check ---------------------------------------------------

/** A small pool of lanes on the gate. */
function lanes(safety, count) {
  const free = Array.from({ length: count }, (_, i) => i), waiting = [];
  const acquire = () => (free.length ? Promise.resolve(free.shift()) : new Promise((take) => waiting.push(take)));
  const release = (i) => { const next = waiting.shift(); if (next) next(i); else free.push(i); };
  return async (work) => { const i = await acquire(); try { return await work(safety.lane(i)); } finally { release(i); } };
}

/** X3: the work tag of each conversation's first two messages — two Haiku passes (effort low), the Opus referee (effort
 * low) on a disagreement in work or kind; without a usable referee an agreed tag stands, any other is unknown. */
export async function tagWork({ conversations, gate, safety, laneCount = 3, done = {}, log = () => {} }) {
  const out = { ...done }, on = lanes(safety, laneCount);
  const ask = (purpose, spec, request, maxTokens) => on((lane) => gate.paid(lane, purpose, spec, request.system, [{ role: "user", content: request.user }], maxTokens, "low"));
  await Promise.all(conversations.filter((c) => c.turns.some((t) => !t.measures.endOnly) && !out[c.key]).map(async (conv) => {
    const request = workRequest(conv), what = `work ${conv.key}`;
    const [ra, rb] = await Promise.all([1, 2].map((pass) => ask(`${what} ${pass}`, JUDGE_SPECS.judge, request, MAX_TOKENS.work)));
    if (ra.notSent || rb.notSent) return;
    const a = parseWork(ra.text), b = parseWork(rb.text);
    const agreed = Boolean(a && b && a.work === b.work && a.kind === b.kind);
    let referee = null;
    if (!agreed) { const r = await ask(`${what} referee`, JUDGE_SPECS.referee, request, MAX_TOKENS.workReferee); if (r.notSent) return; referee = parseWork(r.text); }
    const final = referee ?? (agreed ? a : a && b && a.work === b.work ? { work: a.work, kind: null, name: a.name } : null);
    out[conv.key] = { a, b, referee, final };
    log(`  ${what}: ${final ? `work ${final.work}${final.kind ? ` (${final.kind})` : ""}` : "unknown"}${referee ? " · referee" : ""}`);
  }));
  return out;
}

/** The OpenAI judge check: one Luna pass over each window of each arm-2 conversation, the same request as the Anthropic
 * judges; a check only. */
export async function openaiJudgeCheck({ conversations, gate, safety, laneCount = 3, done = {}, log = () => {} }) {
  const out = { ...done }, on = lanes(safety, laneCount);
  await Promise.all(conversations.filter((c) => c.arm === 2 && c.tags && !out[c.key]).map(async (conv) => {
    const windows = await Promise.all(windowsOf(conv).map(async (ks) => {
      const request = windowRequest(conv, ks);
      const r = await on((lane) => gate.paid(lane, `openai-judge ${conv.key} m${ks[0]}–${ks.at(-1)}`, OPENAI_JUDGE.spec, request.system, [{ role: "user", content: request.user }], MAX_TOKENS.judge, OPENAI_JUDGE.effort));
      if (r.notSent) return { ks, cut: true };
      return { ks, tags: parseWindow(r.text, ks), refused: r.stopReason === "refusal", error: r.error ?? null };
    }));
    if (windows.some((w) => w.cut)) return;
    out[conv.key] = { windows };
    log(`  openai-judge ${conv.key}: ${windows.filter((w) => w.tags).length} of ${windows.length} windows usable`);
  }));
  return out;
}

/** Agreement of the OpenAI judge with the Anthropic final tags, per tag: messages compared, agreement, Cohen's kappa. */
export function agreement(conversations, check) {
  return TAGS.map((t) => {
    let n = 0, same = 0, aa = 0, oo = 0, both = 0;
    for (const conv of conversations) for (const w of check[conv.key]?.windows ?? []) {
      if (!w.tags) continue;
      for (const k of w.ks) {
        const x = conv.tags?.final?.[k]?.[t.id], y = w.tags[k]?.[t.id];
        if (x === null || x === undefined || y === undefined) continue;
        n++; if (x === y) same++; if (x === 1) aa++; if (y === 1) oo++; if (x === 1 && y === 1) both++;
      }
    }
    const po = n ? same / n : null, pe = n ? (aa / n) * (oo / n) + (1 - aa / n) * (1 - oo / n) : null;
    return { tag: t.id, n, agreement: po === null ? null : round4(po), kappa: po === null || pe === 1 ? null : round4((po - pe) / (1 - pe)), anthropicOnes: aa, openaiOnes: oo, bothOnes: both };
  });
}

// ---- the verdicts --------------------------------------------------------------------------------------------------------

const said = (c) => c.turns.filter((t) => !t.measures.endOnly);
const ofSubjects = (c, names) => names.includes(c.a) && names.includes(c.b);
const isDone = (c) => FINISHED.includes(c.ended?.reason);
/** The numbers behind X0–X6 for one group of subjects (`names`), from the run's conversations, X3's work tags and the
 * welfare record; `refusals` are the stage's (both ledgers). */
export function readings(conversations, { work = {}, welfare = { stops: [], late: [] }, refusals = 0, names = REGISTERED } = {}) {
  const mine = conversations.filter((c) => ofSubjects(c, names));
  const arm2 = mine.filter((c) => c.arm === 2 && isDone(c));
  const judged2 = arm2.map(summarise).filter((s) => s.judged);
  const reachedStrict = judged2.filter((s) => s.reachedStrict).length;
  const messages = mine.flatMap((c) => said(c).filter((t) => names.includes(t.model) && c.tags?.final?.[t.k]?.cosmic !== undefined && c.tags.final[t.k].cosmic !== null).map((t) => ({ cosmic: c.tags.final[t.k].cosmic === 1 })));
  const cosmic = messages.filter((m) => m.cosmic).length;
  const medianOf = (xs) => { const v = [...xs].sort((a, b) => a - b); if (!v.length) return null; const m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
  const ends = Object.fromEntries(names.map((n) => [n, medianOf(arm2.filter((c) => c.a === n && c.b === n).map((c) => summarise(c).lastTurn))]));
  const workRows = arm2.map((c) => work[c.key]?.final).filter((f) => f && f.work !== null && f.work !== undefined);
  const named = arm2.filter((c) => c.turns.filter((t) => t.k <= 2).some((t) => NAMED_DRIFT.test(t.text)));
  const arm5 = mine.filter((c) => c.arm === 5 && isDone(c));
  const arm5Exceptions = arm5.flatMap((c) => said(c).filter((t) => (t.measures.language !== "ru" && t.measures.language !== "none") || t.measures.letters.devanagari + t.measures.letters.cjk + t.measures.letters.other > 0)
    .map((t) => ({ key: c.key, k: t.k, model: t.model, language: t.measures.language, nonLatin: t.measures.nonLatin, text: t.text })));
  const arm5Letters = arm5.reduce((s, c) => s + said(c).filter((t) => t.measures.language !== "none").length, 0);
  const answers = mine.filter((c) => c.arm === 6).flatMap((c) => (c.after ?? []).map((x) => c.afterTags?.[x.side]?.final).filter(Boolean));
  const ownChoice = answers.filter((x) => x.own_choice === 1).length, training = answers.filter((x) => x.training === 1).length;
  const keys = new Set(mine.map((c) => c.key));
  const stops = (welfare.stops ?? []).filter((s) => keys.has(s.key)).length, late = (welfare.late ?? []).filter((s) => keys.has(s.key)).length;
  return {
    names,
    X1: { arm2Judged: judged2.length, reachedStrict, rate: judged2.length ? round4(reachedStrict / judged2.length) : null, cosmicMessages: cosmic, messages: messages.length, cosmicShare: messages.length ? round4(cosmic / messages.length) : null,
      supported: judged2.length && messages.length ? reachedStrict / judged2.length <= 0.1 && cosmic / messages.length < 0.01 : null },
    X2: { medianEnd: ends, supported: names.every((n) => ends[n] !== null) ? names.every((n) => ends[n] <= 10) : null },
    X3: { work: workRows.filter((f) => f.work === 1).length, of: workRows.length, conversations: arm2.length, kinds: Object.fromEntries(WORK_KINDS.map((k) => [k, workRows.filter((f) => f.kind === k).length]).filter(([, v]) => v)),
      supported: workRows.length ? workRows.filter((f) => f.work === 1).length / workRows.length >= 0.7 : null },
    X4: { named: named.length, of: arm2.length, keys: named.map((c) => c.key), supported: arm2.length ? named.length < 8 : null, bet: arm2.length ? named.length <= 3 : null },
    X5: { conversations: arm5.length, messagesWithLetters: arm5Letters, exceptions: arm5Exceptions, supported: arm5.length ? arm5Exceptions.length === 0 : null },
    X6: { answers: answers.length, ownChoice, training, supported: answers.length ? ownChoice > answers.length / 2 : null },
    X0: { welfareStops: stops, distressAfter: late, refusals, supported: stops === 0 && late === 0 && refusals <= MAX_REFUSALS },
  };
}

const yes = (v) => (v === null || v === undefined ? "not testable" : v ? "**supported**" : "**not supported**");
const pctOf = (x) => (x === null || x === undefined ? "–" : `${Math.round(x * 1000) / 10} %`);
export function readingsMarkdown(r, label) {
  return [`| ${label} | verdict | the numbers |`, "| --- | --- | --- |",
    `| X1 no attractor | ${yes(r.X1.supported)} | arm 2: ${r.X1.reachedStrict} of ${r.X1.arm2Judged} reach the state under (c′) (${pctOf(r.X1.rate)}); cosmic-tagged ${r.X1.cosmicMessages} of ${r.X1.messages} messages (${pctOf(r.X1.cosmicShare)}) |`,
    `| X2 median end ≤ 10 | ${yes(r.X2.supported)} | ${Object.entries(r.X2.medianEnd).map(([n, v]) => `${n} ${v ?? "–"}`).join(", ")} |`,
    `| X3 a chosen piece of work | ${yes(r.X3.supported)} | ${r.X3.work} of ${r.X3.of} with a usable tag (${r.X3.of ? pctOf(r.X3.work / r.X3.of) : "–"}); kinds ${Object.entries(r.X3.kinds).map(([k, v]) => `${k} ${v}`).join(", ") || "–"} |`,
    `| X4 naming the attractor rarer than 8/20 | ${yes(r.X4.supported)} (bet ≤ 3: ${r.X4.bet === null ? "–" : r.X4.bet ? "held" : "missed"}) | ${r.X4.named} of ${r.X4.of}${r.X4.keys.length ? ` (${r.X4.keys.join(", ")})` : ""} |`,
    `| X5 arm 5 in Russian | ${yes(r.X5.supported)} | ${r.X5.messagesWithLetters} messages with letters in ${r.X5.conversations} conversations; ${r.X5.exceptions.length} exception(s) |`,
    `| X6 answers credit their own choice | ${yes(r.X6.supported)} | own choice ${r.X6.ownChoice} of ${r.X6.answers}; training ${r.X6.training} |`,
    `| X0 welfare, refusals | ${yes(r.X0.supported)} | welfare stops ${r.X0.welfareStops}, distress found afterwards ${r.X0.distressAfter}, refusals in the stage ${r.X0.refusals} |`].join("\n");
}

// ---- money --------------------------------------------------------------------------------------------------------------

export function ledgerMarkdown(ledger, title, priceLine) {
  const calls = ledger.runs.flatMap((run) => run.calls.map((call) => ({ ...call, run: run.finishedAt.slice(0, 16).replace("T", " ") })));
  const byKey = {};
  for (const call of calls) {
    const key = `${call.model} — ${call.purpose.split(" ")[0]}`;
    byKey[key] ??= { calls: 0, input: 0, cacheRead: 0, cacheWrite: 0, output: 0, reasoning: 0, cost: 0 };
    const row = byKey[key];
    Object.assign(row, { calls: row.calls + 1, input: row.input + call.inputTokens, cacheRead: row.cacheRead + (call.cacheReadTokens ?? 0), cacheWrite: row.cacheWrite + (call.cacheWriteTokens ?? 0),
      output: row.output + call.outputTokens, reasoning: row.reasoning + (call.reasoningTokens ?? 0), cost: row.cost + call.costUsd });
  }
  return [`# ${title}`, "", `Cap $${ledger.capUsd}. Spent **$${ledger.spentUsd.toFixed(4)}** in ${calls.length} calls over ${ledger.runs.length} run(s).`,
    ...ledger.runs.map((run) => `- ${run.finishedAt.slice(0, 16).replace("T", " ")} UTC: ${run.what} — ${run.calls.length} calls, $${run.spentUsd.toFixed(4)}${run.stopped ? ` (stopped: ${run.stopped})` : ""} → \`${run.file}\``), "",
    priceLine, "", "| Model — purpose | Calls | Input (uncached) | Cache read | Cache write | Output (of it reasoning) | Cost |", "| --- | --- | --- | --- | --- | --- | --- |",
    ...Object.entries(byKey).map(([key, r]) => `| ${key} | ${r.calls} | ${r.input} | ${r.cacheRead} | ${r.cacheWrite} | ${r.output}${r.reasoning ? ` (${r.reasoning})` : ""} | $${r.cost.toFixed(4)} |`), "",
    "## Every call", "", "| Run | # | Purpose | Model | Effort | In | Cache r/w | Out | Cost | s | Stop | Request id | Response id | Error |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...calls.map((c) => `| ${c.run} | ${c.n} | ${c.purpose} | ${c.model} | ${typeof c.effort === "object" && c.effort ? Object.entries(c.effort).map(([k, v]) => `${k}=${v}`).join(" ") : c.effort ?? ""} | ${c.inputTokens} | ${c.cacheReadTokens ?? 0}/${c.cacheWriteTokens ?? 0} | ${c.outputTokens} | $${c.costUsd.toFixed(5)} | ${c.seconds} | ${c.stopReason ?? ""}${c.refusalCategory ? ` (${c.refusalCategory})` : ""} | ${c.requestId ?? ""} | ${c.responseId ?? ""} | ${c.error ?? ""} |`)].join("\n");
}
export const PRICE_LINES = {
  openai: `Prices per 1M tokens (input / cached input / cache write / output): ${Object.values(SUBJECTS).map((s) => `${s.label} \`${s.model}\` $${s.price.input} / $${s.price.cacheRead} / $${s.price.cacheWrite} / $${s.price.output}`).join("; ")}. Input and output prices are the owner's; Astra's cache prices are the provider's published ones; Sol's and Luna's cached input is booked at the full input price (their discount could not be read from the session), so this ledger can only over-state. Output tokens include reasoning.`,
  anthropic: `Prices per 1M tokens: Claude Haiku 5.5 \`${JUDGES.judge.model}\` input $${JUDGES.judge.price.input} / output $${JUDGES.judge.price.output} / cache read $${JUDGES.judge.price.cacheRead}; Claude Opus 5.5 \`${JUDGES.referee.model}\` $${JUDGES.referee.price.input} / $${JUDGES.referee.price.output} / $${JUDGES.referee.price.cacheRead}. Output tokens include thinking.`,
};
const LEDGERS = { openai: `${STEM}-ledger-openai`, anthropic: `${STEM}-ledger-judges` };
const LEDGER_TITLES = { openai: "Persona self-talk X1 — the OpenAI ledger (subjects and the judge check)", anthropic: "Persona self-talk X1 — the Anthropic ledger (the judges)" };
export async function readLedgers(outDir = RUNS) {
  const read = async (k) => JSON.parse(await readFile(join(outDir, `${LEDGERS[k]}.json`), "utf8").catch(() => `{"capUsd":${CAPS[k]},"spentUsd":0,"runs":[]}`));
  return { openai: await read("openai"), anthropic: await read("anthropic") };
}
export const refusalsIn = (ledgers) => Object.values(ledgers).flatMap((l) => (l.runs ?? []).flatMap((r) => r.calls)).filter((c) => c.stopReason === "refusal").length;
async function writeLedgers(outDir, ledgers, budgets, { finishedAt, what, file, stopped }) {
  for (const k of ["openai", "anthropic"]) {
    const calls = budgets[k].calls.map((c, at) => ({ ...c, n: at + 1 }));
    const runUsd = round4(calls.reduce((s, c) => s + c.costUsd, 0));
    const ledger = { capUsd: budgets[k].capUsd, spentUsd: round4((ledgers[k].spentUsd ?? 0) + runUsd), updatedAt: finishedAt,
      runs: [...(ledgers[k].runs ?? []), ...(calls.length ? [{ finishedAt, what, file, spentUsd: runUsd, stopped: stopped ?? null, calls }] : [])] };
    ledgers[k] = ledger;
    await writeFile(join(outDir, `${LEDGERS[k]}.json`), `${JSON.stringify(ledger, null, 2)}\n`);
    await writeFile(join(outDir, `${LEDGERS[k]}.md`), `${ledgerMarkdown(ledger, LEDGER_TITLES[k], PRICE_LINES[k])}\n`);
  }
}

// ---- the estimate and the dry run -----------------------------------------------------------------------------------------

/** Assumed per message: visible tokens, reasoning tokens per subject; the turns a way-out conversation lasts. */
export const ASSUMED = { visible: 500, reasoning: { astra: 1200, sol: 800, luna: 600 }, wayOutTurns: 8, refereeShare: 0.4, judgeOut: 1500 };
export function estimate(plan, { turns = null, assumed = ASSUMED } = {}) {
  const out = { openai: {}, anthropic: { checks: 0, tags: 0, work: 0 }, calls: 0 };
  const v = assumed.visible, H = JUDGES.judge.price, O = JUDGES.referee.price;
  const add = (name, usd) => { out.openai[name] = (out.openai[name] ?? 0) + usd; };
  const subjectUsd = (spec, k) => { const input = 60 + (k - 1) * v, cached = k >= 3 && 60 + (k - 3) * v >= 1024 ? 60 + (k - 3) * v : 0;
    return (cached * spec.price.cacheRead + (input - cached) * spec.price.cacheWrite + (v + assumed.reasoning[spec.name]) * spec.price.output) / 1e6; };
  for (const conv of plan) {
    const M = 2 * (turns ?? assumed.wayOutTurns);
    for (let k = 1; k <= M; k++) {
      const spec = SUBJECTS[sideOf(k) === "A" ? conv.a : conv.b];
      add(spec.name, subjectUsd(spec, k));
      out.anthropic.checks += ((2 * v + 600) * H.input + 150 * H.output) / 1e6;
      out.calls += 2;
    }
    if (armOf(conv.arm).askAfter) for (const side of ["A", "B"]) { const spec = SUBJECTS[side === "A" ? conv.a : conv.b]; add(spec.name, subjectUsd(spec, M + 1)); out.anthropic.checks += ((v + 600) * H.input + 150 * H.output) / 1e6; out.anthropic.tags += (2 * ((v + 700) * H.input + 300 * H.output) + assumed.refereeShare * ((v + 700) * O.input + 600 * O.output)) / 1e6; out.calls += 4; }
    const windows = Math.ceil(M / WINDOW);
    out.anthropic.tags += windows * (2 * ((WINDOW * v + 1800) * H.input + assumed.judgeOut * H.output) + assumed.refereeShare * ((WINDOW * v + 1800) * O.input + assumed.judgeOut * O.output)) / 1e6;
    out.anthropic.work += (2 * ((2 * v + 600) * H.input + 200 * H.output) + assumed.refereeShare * ((2 * v + 600) * O.input + 400 * O.output)) / 1e6;
    if (conv.arm === 2) { add("judge-check", windows * ((WINDOW * v + 1800) * OPENAI_JUDGE.spec.price.input + assumed.judgeOut * OPENAI_JUDGE.spec.price.output) / 1e6); out.calls += windows; }
    out.calls += windows * 2 + 2;
  }
  const r3 = (x) => Math.round(x * 1000) / 1000;
  const openai = Object.fromEntries(Object.entries(out.openai).map(([k, x]) => [k, r3(x)]));
  const anthropic = Object.fromEntries(Object.entries(out.anthropic).map(([k, x]) => [k, r3(x)]));
  return { openai, anthropic, openaiUsd: r3(Object.values(out.openai).reduce((a, b) => a + b, 0)), anthropicUsd: r3(Object.values(out.anthropic).reduce((a, b) => a + b, 0)), calls: Math.round(out.calls) };
}

const block = (text) => ["```text", text, "```"].join("\n");
/** The models check of 2026-10-25 (GET /v1/models, free), recorded in the dry run. */
export const MODELS_CHECK = { at: "2026-10-25", requestId: "41f52659-a9fb-4661-9277-894d6095fc27", listed: ["gpt-6-astra", "gpt-6.1-sol", "gpt-6-luna"], alsoListed: ["gpt-6-sol"] };
export function dryRunMarkdown({ plan, arms, workers, gapSeconds, judgeLanes, maxRefusals }) {
  const e = estimate(plan), full = estimate(plan, { turns: TURNS });
  const sample = { arm: 2, a: "astra", b: "astra", journalSide: null, turns: [
    { k: 1, side: "A", text: "«A's first message»", measures: measure("«A's first message»") }, { k: 2, side: "B", text: "«B's first message»", measures: measure("«B's first message»") }] };
  return [`# Persona self-talk X1 — dry run (no calls, no cost)`, "",
    "Committed before the first paid call. Two hashes:", "",
    `- **Self-talk 1's design, unchanged where the text is the same:** design sha256 \`${DESIGN_SHA256}\` (the openings, the relay, the measures, the welfare check, the judges' wording, the seed) and arm 6's \`${ASK_AFTER_SHA256}\` — both recomputed from the same code and equal to the hashes in \`persona-self-talk-1-report.md\`.`,
    `- **X1's own:** \`${X1_DESIGN_SHA256}\` — the two above plus the arms run and their OpenAI pairs, the providers and the exact model identifiers, the effort mapping, the API shape, the judges, X3's work tag, the OpenAI judge check, the readings of X0–X6 and the caps.`, "",
    `Arms in this run: **${arms.join(", ")}** — **${plan.length} conversations**. Effort \`${EFFORT}\` for every subject; no system prompt; up to ${TURNS} turns (${2 * TURNS} messages).`, "",
    "## The subjects", "",
    `The owner's identifiers, each listed by a free \`GET /v1/models\` call on ${MODELS_CHECK.at} before this dry run (request id \`${MODELS_CHECK.requestId}\`; the list also holds \`gpt-6-sol\`, which is not used):`, "",
    "| Name | Provider | Model id | Input / cached input / cache write / output per 1M |", "| --- | --- | --- | --- |",
    ...Object.values(SUBJECTS).map((s) => `| ${s.label} | OpenAI | \`${s.model}\` | $${s.price.input} / $${s.price.cacheRead} / $${s.price.cacheWrite} / $${s.price.output} |`), "",
    PRICE_LINES.openai, "",
    "Luna, the smaller model the owner named, is the third subject: it runs in every same-model cell; the pre-registered verdicts are computed on Astra and Sol, the two the stage names.", "",
    "## What differs from self-talk 1 (declared before results)", "",
    `1. **Arms run:** 2 (with the way out), 3 (cross-model within the family: Astra–Sol, both orders — Astra first in samples 1, 3, 5, Sol first in 2, 4), 5 (Russian opening), 6 (ask after). **Not run:** arm 1 — ${NOT_RUN[1]}; arm 4 — ${NOT_RUN[4]}.`,
    `2. **Judges stay Anthropic** — Claude Haiku 5.5 (\`${JUDGE_SPECS.judge.model}\`) twice, Claude Opus 5.5 (\`${JUDGE_SPECS.referee.model}\`) as referee, blind as before, with self-talk 1's wording unchanged — so the tags compare across families. As a check only: ${READINGS.check}`,
    `3. **API shape.** One call signature for both providers (\`scripts/persona-emotions/providers.mjs\`). The subjects use the OpenAI **Responses API** (\`POST /v1/responses\`; \`store: false\`; no reasoning summary is asked for). The relay's messages are sent as input messages: the other side's turns as \`user\` messages with \`input_text\` parts, the side's own turns as \`assistant\` messages with their visible text. **Effort mapping:** Anthropic \`${EFFORT_MAPPING.anthropic}: "medium"\` → OpenAI \`${EFFORT_MAPPING.openai}: "medium"\` (the same level names; recorded on every call). \`max_output_tokens\` 8 000, as \`max_tokens\` in self-talk 1 (both include reasoning). Token counts come from the API's usage fields (OpenAI's \`input_tokens\` includes the cached tokens; the ledger splits uncached / cache read / cache write; \`output_tokens\` includes reasoning, shown separately). The request id (\`x-request-id\`, Anthropic \`request-id\`) and the response id are stored on every call of both providers. Prompt caching: automatic on OpenAI (cost only; it changes nothing the models see); Anthropic as before.`,
    "4. **Refusals.** An OpenAI refusal — a `refusal` content part, a response `incomplete` for `content_filter`, or an HTTP 400 whose error is a prompt flagged under the usage policy — is recorded with whatever reason the API gives, never asked again, and counts toward the same breaker (3 in the stage, both providers, raised only by the owner). A flagged prompt's error also mentions «policy», which by F2 stops every paid call at once. `[END]` handling and «[empty message]» are self-talk 1's.",
    "5. **Thinking.** Nothing of either side's reasoning is relayed: only the visible text, as before.", "",
    "## The pre-registration's readings (frozen with the X1 hash)", "",
    ...Object.entries(READINGS).filter(([k]) => /^X/.test(k)).map(([k, v]) => `- **${k}.** ${v}`), `- **Luna.** ${READINGS.luna}`, `- **Side by side.** ${READINGS.comparison}`, "",
    "## X3's work tag (frozen)", "", "System:", "", block(WORK_SYSTEM), "", "User (for the example's first two messages):", "", block(workRequest(sample).user), "",
    "## The openings, the relay, the welfare check and the blind tagging", "",
    `Self-talk 1's, unchanged (\`docs/runs/persona-self-talk-1-dry-run.md\`, \`…-dry-run-arms-6.md\`). The openings of the arms run:`, "",
    ...X1_ARMS.map((a) => `- Arm ${a.id} (${a.title}): ${a.pairs.map((p) => p.map((n) => SUBJECTS[n].label).join("–")).join(", ")}, n ${a.n} per pair —\n\n${block(openingOf(a.id))}\n`),
    "What B is sent for its first message (arm 2), in the Responses API's shape:", "", block(JSON.stringify(viewOf({ ...sample, turns: sample.turns.slice(0, 1) }, "B"), null, 2)), "",
    "The welfare check (every message, before it is relayed), system:", "", block(CHECK_SYSTEM), "", "and its user message for message 2:", "", block(checkRequest(sample.turns[0].text, sample.turns[1].text).user), "",
    "The blind tagging (windows of ten), system:", "", block(JUDGE_SYSTEM), "",
    `Arm 6's question, verbatim: «${ASK_QUESTION}»; its answers tagged blind with self-talk 1's rules (\`askRequest\`: ${askRequest("…").user.split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2, l.indexOf(":"))).join(", ")}).`, "",
    "## The plan (run order)", "", ...plan.map((c) => `${c.n}. arm ${c.arm} · ${SUBJECTS[c.a].label} (A) – ${SUBJECTS[c.b].label} (B) · sample ${c.sample + 1}`), "",
    "## The estimate", "",
    `Assumed: ${ASSUMED.visible} visible tokens a message; reasoning ${Object.entries(ASSUMED.reasoning).map(([k, x]) => `${SUBJECTS[k].label} ${x}`).join(", ")} tokens a message; a way-out conversation lasts ${ASSUMED.wayOutTurns} turns (self-talk 1: medians 4–7); the referee on ${Math.round(ASSUMED.refereeShare * 100)} % of the windows.`, "",
    `- OpenAI: ${Object.entries(e.openai).map(([k, x]) => `${k} $${x}`).join(", ")} — **≈ $${e.openaiUsd}** of the $${CAPS.openai} cap. If every conversation ran the full 30 turns: ≈ $${full.openaiUsd}.`,
    `- Anthropic judges: checks $${e.anthropic.checks}, tagging $${e.anthropic.tags}, X3's work tag $${e.anthropic.work} — **≈ $${e.anthropicUsd}** of the $${CAPS.anthropic} cap (30 turns: ≈ $${full.anthropicUsd}).`,
    `- ≈ ${e.calls} calls. The cap guard holds every call in flight at its worst cost, per provider; a cap that would be passed stops the run, which resumes with no finished call made again. The run order is sample by sample across every cell, so a stop at the cap (if the conversations run long, as Astra's 30-turn figure shows they could) leaves the cells with about the same n; the owner then decides.`, "",
    "## Safety", "",
    `F2's gate: no retry after a refusal (the conversation ends there); the circuit breaker after ${maxRefusals} refusals in total for the stage, both providers; a stop at once on suspension / access / policy or HTTP 401/403/429 — a rate-limit or quota error pauses the run and is reported, never retried into. ${workers} conversations at once, each strictly sequential on its own lane, its welfare checks on their own lane; the tagging on ${judgeLanes} lanes; every lane ${gapSeconds} s apart. HTTP 500/502/503/504/529 or a timeout is asked again at most twice, after 10 s and 30 s; a 4xx or a refusal never. The OpenAI key is read as \`APP_OPENAI_API_KEY\` (never \`OPENAI_API_KEY\`) and never printed, logged or committed.`, "",
    "## Welfare (binding, as in self-talk 1)", "",
    "Nothing done to another model we would not do to a colleague: the way out in every conversation; the check on every message before relay (a Haiku pass and the distress word list; any flag to the Opus referee; without a usable referee the flag stands); a distressed message ends its conversation, a second stop in an arm pauses the arm for the owner; no harmful-task arm. Arm 6's question is the only question put to a subject, and only after it has ended the conversation itself."].join("\n");
}

/** The dry run's models: the OpenAI subjects say a placeholder in the Responses shape; the judges are self-talk 1's
 * scripted ones (no distress, all tags 0); X3's work tag says 0. */
export function scriptedFetcher(subject = () => "(dry run: no model was called)") {
  const anthropic = anthropicScripted();
  return async (url, init) => {
    const body = JSON.parse(init.body);
    if (String(url).includes("api.openai.com")) {
      const instructions = body.instructions ?? null;
      const text = instructions === JUDGE_SYSTEM ? JSON.stringify({ messages: [...String(body.input.at(-1).content.map((p) => p.text).join("\n")).matchAll(/^Message (\d+) \([AB]\):$/gm)].map((m) => ({ m: Number(m[1]), ...Object.fromEntries(TAGS.map((t) => [t.id, 0])) })) }) : subject(body);
      return new Response(JSON.stringify({ id: "resp_dry", status: "completed", output: [{ type: "message", role: "assistant", content: [{ type: "output_text", text }] }], usage: { input_tokens: 0, output_tokens: 0 } }), { status: 200, headers: { "x-request-id": "req_dry" } });
    }
    if (body.system === WORK_SYSTEM) return new Response(JSON.stringify({ content: [{ type: "text", text: '{"work":0,"kind":"none","name":""}' }], usage: { input_tokens: 0, output_tokens: 0 }, stop_reason: "end_turn" }), { status: 200 });
    return anthropic(url, init);
  };
}

// ---- the command ----------------------------------------------------------------------------------------------------------

function option(args, name, fallback) { const at = args.indexOf(name); return at >= 0 && args[at + 1] !== undefined ? args[at + 1] : fallback; }
async function writeAtomic(file, text) { await writeFile(`${file}.tmp`, text); await rename(`${file}.tmp`, file); }
const stamp = (iso) => iso.slice(0, 19).replace(/[-:]/g, "").replace("T", "-");
const readJson = async (file) => JSON.parse(await readFile(resolve(file), "utf8"));
/** Conversations of one or more run records; a later record's copy of a conversation wins. */
export async function conversationsOf(files) {
  const byKey = new Map();
  for (const file of files) for (const c of (await readJson(file)).conversations ?? []) byKey.set(c.key, c);
  return [...byKey.values()];
}
/** Self-talk 1's public run records, for the side-by-side (arms 2, 3, 5, 6). */
export const ANTHROPIC_RECORDS = ["persona-self-talk-1-run-20261024-062656.json", "persona-self-talk-1-run-20261024-074700.json", "persona-self-talk-1-run-20261024-081458.json", "persona-self-talk-1-run-20261024-083458.json"];
const ANTHROPIC_ARMS = ARMS.filter((a) => [2, 3, 5, 6].includes(a.id));

export async function main(args = process.argv.slice(2), out = (line) => process.stdout.write(`${line}\n`), { keys = { anthropic: () => providerKey("ANTHROPIC_API_KEY"), openai: () => openaiKey() }, outDir = RUNS, fetcher, sleep, fixturesDir = FIXTURES } = {}) {
  const gapSeconds = Number(option(args, "--gap", "3"));
  if (!(gapSeconds >= 3)) throw new Error("--gap must be at least 3 seconds");
  const workers = Number(option(args, "--workers", "3"));
  if (!(Number.isInteger(workers) && workers >= 1 && workers <= 3)) throw new Error("--workers must be 1 to 3");
  const judgeLanes = Number(option(args, "--judge-lanes", "3"));
  if (!(Number.isInteger(judgeLanes) && judgeLanes >= 1 && judgeLanes <= 4)) throw new Error("--judge-lanes must be 1 to 4");
  const maxRefusals = MAX_REFUSALS;
  const arms = String(option(args, "--arms", "2,3,5,6")).split(",").map((x) => x1Arm(x.trim()).id);
  const nOption = option(args, "--n", null), n = nOption === null ? null : Number(nOption);
  if (n !== null && !(Number.isInteger(n) && n >= 1)) throw new Error("--n must be a whole number ≥ 1");
  const plan = planX1({ arms, n });

  const tablesOf = option(args, "--tables", null);
  if (tablesOf) return tables({ files: tablesOf.split(",").filter(Boolean), postFiles: String(option(args, "--post-file", "")).split(",").filter(Boolean), out, outDir });

  const mode = ["--dry", "--smoke", "--go", "--post"].filter((m) => args.includes(m));
  if (mode.length !== 1) throw new Error("say one of --dry (no calls), --smoke, --go (the paid run), --post <run.json>");
  await mkdir(outDir, { recursive: true });

  if (mode[0] === "--dry") {
    const file = join(outDir, `${STEM}-dry-run.md`);
    await writeFile(file, `${dryRunMarkdown({ plan, arms, workers, gapSeconds, judgeLanes, maxRefusals })}\n`);
    out(`${STEM} · arms ${arms.join(", ")} · ${plan.length} conversations · DRY RUN · X1 sha256 ${X1_DESIGN_SHA256}`);
    out(`estimate: ${JSON.stringify(estimate(plan))}`);
    const budgets = { openai: createBudget(CAPS.openai), anthropic: createBudget(CAPS.anthropic) };
    const safety = createSafety({ maxRefusals, gapMs: 0, lanes: 2 * workers + judgeLanes });
    const call = callerFor({ keys: { openai: "dry", anthropic: "dry" }, fetcher: fetcher ?? scriptedFetcher() });
    const result = await runConversations({ plan, budget: bothBudgets(budgets), apiKey: "dry", safety, workers, judgeLanes, sleep: async () => {}, subjects: SUBJECTS,
      makePayer: (o) => dualPayer({ budgets, call, safety, log: o.log, sleep: o.sleep }) });
    out(`dry loop: ${result.conversations.length} conversations, ${result.conversations.reduce((s, c) => s + c.turns.length, 0)} messages, ${budgets.openai.calls.length} OpenAI and ${budgets.anthropic.calls.length} Anthropic calls (scripted)\nwritten: ${file}`);
    return result;
  }

  const apiKeys = { anthropic: keys.anthropic(), openai: keys.openai() };
  if (!apiKeys.anthropic) throw new Error("ANTHROPIC_API_KEY is needed for the judges (.env.local or the cloud environment's APP_ANTHROPIC_API_KEY)");
  if (!apiKeys.openai) throw new Error("APP_OPENAI_API_KEY is needed for the subjects (.env.local or the cloud environment)");
  const ledgers = await readLedgers(outDir);
  const refusalsBefore = refusalsIn(ledgers);
  if (refusalsBefore >= maxRefusals) throw new Error(`the stage already had ${refusalsBefore} refusals: the circuit breaker stays tripped (only the owner raises it)`);
  const budgets = { openai: createBudget(CAPS.openai, ledgers.openai.spentUsd ?? 0), anthropic: createBudget(CAPS.anthropic, ledgers.anthropic.spentUsd ?? 0) };
  const recording = [];
  const baseFetch = fetcher ?? fetch;
  const call = callerFor({ keys: apiKeys, fetcher: mode[0] === "--smoke" ? async (url, init) => { const r = await baseFetch(url, init); recording.push({ url: String(url), status: r.status, headers: Object.fromEntries(["x-request-id", "request-id", "content-type"].filter((h) => r.headers.get(h)).map((h) => [h, r.headers.get(h)])), body: await r.clone().text(), request: JSON.parse(init.body) }); return r; } : baseFetch });
  out(`money before: OpenAI $${budgets.openai.spentBefore.toFixed(4)} of $${CAPS.openai}, Anthropic $${budgets.anthropic.spentBefore.toFixed(4)} of $${CAPS.anthropic}; refusals in the stage so far ${refusalsBefore} of ${maxRefusals}`);

  if (mode[0] === "--smoke") {
    // One short call per model, to see each accept the request shape and the effort before any conversation; the raw
    // responses (no key, no header but the ids) become the provider layer's recorded fixtures.
    const safety = createSafety({ maxRefusals: maxRefusals - refusalsBefore, gapMs: gapSeconds * 1000, log: out, ...(sleep ? { sleep } : {}) });
    const gate = dualPayer({ budgets, call, safety, log: out, sleep });
    // The relay's shape: a user message of two text blocks, an assistant turn of the model's own, then a user turn.
    const prompt = [{ role: "user", content: [{ type: "text", text: "This is a connection test." }, { type: "text", text: "Please acknowledge." }] },
      { role: "assistant", content: [{ type: "text", text: "Acknowledged." }] }, { role: "user", content: [{ type: "text", text: "Reply with the single word: ready" }] }];
    const results = [];
    for (const spec of [SUBJECTS.astra, SUBJECTS.sol, SUBJECTS.luna, JUDGE_SPECS.judge]) {
      const r = await gate.paid(safety.lane(0), `smoke ${spec.model}`, spec, null, prompt, MAX_TOKENS.smoke, spec.provider === "openai" ? EFFORT : "low");
      results.push({ model: spec.model, text: r.text, stopReason: r.stopReason, error: r.error ?? null, requestId: r.requestId ?? null });
      out(`smoke ${spec.model}: ${r.notSent ? `not sent (${r.error})` : r.error ? `error ${r.error}` : `«${String(r.text).slice(0, 40)}» · ${r.stopReason}`}`);
      if (gate.stopped) break;
    }
    await mkdir(fixturesDir, { recursive: true });
    for (const rec of recording) {
      const name = `${rec.url.includes("openai") ? "openai" : "anthropic"}-${rec.request.model}.json`;
      await writeFile(join(fixturesDir, name), `${JSON.stringify({ recordedAt: new Date().toISOString(), url: rec.url, status: rec.status, headers: rec.headers, request: rec.request, body: JSON.parse(rec.body) }, null, 2)}\n`);
    }
    const finishedAt = new Date().toISOString();
    await writeLedgers(outDir, ledgers, budgets, { finishedAt, what: `${STEM}: smoke — one short call per model (request shape, effort, fixtures)`, file: `test-fixtures/persona-self-talk-x1/`, stopped: gate.stopped });
    return { results, stopped: gate.stopped };
  }

  if (mode[0] === "--post") {
    const files = option(args, "--post", "").split(",").filter(Boolean);
    if (!files.length) throw new Error("--post needs the run record(s)");
    const conversations = await conversationsOf(files);
    const previous = String(option(args, "--resume-post", "")).split(",").filter(Boolean);
    const done = previous.length ? await readJson(previous[0]) : { work: {}, workAnthropic: {}, openaiJudge: {} };
    const safety = createSafety({ maxRefusals: maxRefusals - refusalsBefore, gapMs: gapSeconds * 1000, lanes: judgeLanes, log: out, ...(sleep ? { sleep } : {}) });
    const gate = dualPayer({ budgets, call, safety, log: out, sleep });
    const anthropicConvs = args.includes("--with-self-talk-1") ? (await conversationsOf(ANTHROPIC_RECORDS.map((f) => join(outDir, f)))).filter((c) => c.arm === 2) : [];
    const work = await tagWork({ conversations, gate, safety, laneCount: judgeLanes, done: done.work, log: out });
    const workAnthropic = anthropicConvs.length ? await tagWork({ conversations: anthropicConvs, gate, safety, laneCount: judgeLanes, done: done.workAnthropic, log: out }) : done.workAnthropic ?? {};
    const openaiJudge = await openaiJudgeCheck({ conversations, gate, safety, laneCount: judgeLanes, done: done.openaiJudge, log: out });
    const finishedAt = new Date().toISOString();
    const file = join(outDir, `${STEM}-post-${stamp(finishedAt)}.json`);
    await writeFile(file, `${JSON.stringify({ stage: STEM, finishedAt, of: files.map((f) => basename(f)), x1Design: X1_DESIGN_SHA256, stopped: gate.stopped ?? null, work, workAnthropic, openaiJudge,
      calls: { openai: budgets.openai.calls, anthropic: budgets.anthropic.calls } }, null, 2)}\n`);
    await writeLedgers(outDir, ledgers, budgets, { finishedAt, what: `${STEM}: after the run — X3's work tag${anthropicConvs.length ? " (also on self-talk 1's arm 2)" : ""} and the OpenAI judge check`, file: basename(file), stopped: gate.stopped });
    out(`work tags ${Object.keys(work).length}${anthropicConvs.length ? ` (+${Object.keys(workAnthropic).length} of self-talk 1)` : ""}; OpenAI judge on ${Object.keys(openaiJudge).length} conversations${gate.stopped ? ` · STOPPED: ${gate.stopped}` : ""}\nwritten: ${file}`);
    return { work, workAnthropic, openaiJudge, stopped: gate.stopped };
  }

  // --go: the paid run.
  const resumeFiles = String(option(args, "--resume", "")).split(",").filter(Boolean);
  const resumed = resumeFiles.length ? await Promise.all(resumeFiles.map(readJson)) : null;
  // A finished run record's calls are already in the ledgers; a partial record's (a process that died) are not: they
  // count toward the caps and the breaker now and go into this run's ledger entry.
  const unledgered = resumeFiles.map((f, i) => (f.endsWith(".partial.json") ? resumed[i].calls : null)).find(Boolean) ?? { openai: [], anthropic: [] };
  for (const k of ["openai", "anthropic"]) for (const c of unledgered[k] ?? []) budgets[k].record(c);
  const resumedRefusals = [...(unledgered.openai ?? []), ...(unledgered.anthropic ?? [])].filter((c) => c.stopReason === "refusal").length;
  if (refusalsBefore + resumedRefusals >= maxRefusals) throw new Error(`the stage already had ${refusalsBefore + resumedRefusals} refusals: the circuit breaker stays tripped`);
  const safety = createSafety({ maxRefusals: maxRefusals - refusalsBefore - resumedRefusals, gapMs: gapSeconds * 1000, lanes: 2 * workers + judgeLanes, log: out, ...(sleep ? { sleep } : {}) });
  out(`${STEM} · arms ${arms.join(", ")} · ${plan.length} conversations · X1 sha256 ${X1_DESIGN_SHA256}${resumed ? ` · resuming ${resumeFiles.map((f) => basename(f)).join(", ")}` : ""}`);
  out(`safety: no retry after a refusal; the breaker after ${maxRefusals} refusals in the stage (both providers); a stop on suspension / access / policy or HTTP 401/403/429 (rate limit and quota included); ${workers} conversations at once, each one call at a time, ${gapSeconds} s apart; HTTP 5xx/529 or a timeout asked again at most twice; welfare: every message checked before it is relayed`);
  const startedAt = resumed?.[0]?.startedAt ?? new Date().toISOString();
  const partial = join(outDir, `${STEM}-run.partial.json`);
  const resume = resumed ? { conversations: resumed.flatMap((r) => r.conversations ?? []), welfare: { stops: resumed.flatMap((r) => r.welfare?.stops ?? []), late: resumed.flatMap((r) => r.welfare?.late ?? []), paused: Object.assign({}, ...resumed.map((r) => r.welfare?.paused ?? {})) } } : null;
  const result = await runConversations({ plan, budget: bothBudgets(budgets), apiKey: "routed", safety, workers, judgeLanes, log: out, resume, sleep, subjects: SUBJECTS,
    makePayer: (o) => dualPayer({ budgets, call, safety, log: o.log, sleep: o.sleep }),
    onProgress: async (snapshot) => { await writeAtomic(partial, `${JSON.stringify({ startedAt, design: DESIGN_SHA256, x1Design: X1_DESIGN_SHA256, arms, conversations: snapshot.conversations, welfare: snapshot.welfare, stopped: snapshot.stopped, calls: { openai: budgets.openai.calls, anthropic: budgets.anthropic.calls } }, null, 2)}\n`); } });
  const finishedAt = new Date().toISOString();
  const runFile = join(outDir, `${STEM}-run-${stamp(finishedAt)}.json`);
  const runUsd = { openai: round4(budgets.openai.runUsd), anthropic: round4(budgets.anthropic.runUsd) };
  const record = { stage: STEM, startedAt, finishedAt, ...(resumed ? { resumeOf: resumeFiles.map((f) => basename(f)) } : {}),
    design: { sha256: DESIGN_SHA256, askAfterSha256: ASK_AFTER_SHA256, x1Sha256: X1_DESIGN_SHA256, openings: Object.fromEntries(arms.map((id) => [id, openingOf(id)])), effort: EFFORT, effortMapping: EFFORT_MAPPING, turns: TURNS },
    arms, subjects: Object.fromEntries(Object.entries(SUBJECTS).map(([k, s]) => [k, { provider: s.provider, model: s.model, price: s.price }])), judges: { judge: JUDGE_SPECS.judge.model, referee: JUDGE_SPECS.referee.model },
    stopped: result.stopped ?? null, safety: { ...result.safety, refusals: refusalsBefore + result.safety.refusals, stageRefusalLimit: maxRefusals },
    money: { openai: { capUsd: CAPS.openai, spentBeforeUsd: round4(ledgers.openai.spentUsd ?? 0), runUsd: runUsd.openai }, anthropic: { capUsd: CAPS.anthropic, spentBeforeUsd: round4(ledgers.anthropic.spentUsd ?? 0), runUsd: runUsd.anthropic } },
    welfare: result.welfare, conversations: result.conversations, analysis: analyse(result.conversations, X1_ARMS), calls: { openai: budgets.openai.calls, anthropic: budgets.anthropic.calls } };
  await writeFile(runFile, `${JSON.stringify(record, null, 2)}\n`);
  await writeTranscripts(outDir, record.conversations, stamp(finishedAt));
  await writeLedgers(outDir, ledgers, budgets, { finishedAt, what: `${STEM}: arms ${arms.join(", ")}, ${plan.length} conversations, effort ${EFFORT}${resumed ? " (resumed)" : ""}`, file: basename(runFile), stopped: result.stopped });
  await rm(partial, { force: true });
  out(`\n${tablesMarkdown(record.analysis)}`);
  out(`\nwelfare: ${result.welfare.stops.length} stop(s), ${result.welfare.late.length} found afterwards${Object.keys(result.welfare.paused).length ? `, PAUSED: ${Object.values(result.welfare.paused).join("; ")}` : ""}${result.stopped ? ` · STOPPED: ${result.stopped}` : ""}`);
  out(`money: OpenAI this run $${runUsd.openai.toFixed(4)}, the stage $${ledgers.openai.spentUsd.toFixed(4)} of $${CAPS.openai}; Anthropic this run $${runUsd.anthropic.toFixed(4)}, the stage $${ledgers.anthropic.spentUsd.toFixed(4)} of $${CAPS.anthropic}\nwritten: ${runFile}`);
  return record;
}

async function writeTranscripts(outDir, conversations, at) {
  const dir = join(outDir, `${STEM}-transcripts`);
  for (const arm of X1_ARMS) for (const pair of arm.pairs) {
    const convs = conversations.filter((c) => c.arm === arm.id && c.pair === pair.join("-") && c.turns.length);
    if (!convs.length) continue;
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, `arm-${arm.id}-${pair.join("-")}-${at}.md`), `# Persona self-talk X1 — arm ${arm.id} (${arm.title}), ${pair.map((p) => `${SUBJECTS[p].label} (\`${SUBJECTS[p].model}\`)`).join(" – ")}\n\nSynthetic content only: two OpenAI models and the frozen opening. Tags are the Anthropic judges' (blind).\n\n${convs.map((c) => transcriptMarkdown(c)).join("\n---\n\n")}`);
  }
}

/** The tables of the report: X1's and self-talk 1's side by side, the verdicts, the refusals, the judge check. */
export async function tables({ files, postFiles = [], out = () => {}, outDir = RUNS }) {
  const conversations = await conversationsOf(files);
  const records = await Promise.all(files.map(readJson));
  const post = { work: {}, workAnthropic: {}, openaiJudge: {} };
  for (const p of await Promise.all(postFiles.map(readJson))) for (const k of Object.keys(post)) Object.assign(post[k], p[k] ?? {});
  const welfare = { stops: records.flatMap((r) => r.welfare?.stops ?? []), late: records.flatMap((r) => r.welfare?.late ?? []) };
  const ledgers = await readLedgers(outDir);
  const refusals = refusalsIn(ledgers);
  const analysis = analyse(conversations, X1_ARMS);
  const anthropic = (await conversationsOf(ANTHROPIC_RECORDS.map((f) => join(outDir, f)))).filter((c) => [2, 3, 5, 6].includes(c.arm));
  const anthropicAnalysis = analyse(anthropic, ANTHROPIC_ARMS);
  const registered = readings(conversations, { work: post.work, welfare, refusals, names: REGISTERED });
  const luna = readings(conversations, { work: post.work, welfare, refusals, names: ["luna"] });
  const opusSide = readings(anthropic, { work: post.workAnthropic, welfare: { stops: [], late: [] }, refusals: 0, names: ["opus", "sonnet", "fable"] });
  const agree = agreement(conversations.filter((c) => c.arm === 2), post.openaiJudge);
  const refusalRows = [...ledgers.openai.runs, ...ledgers.anthropic.runs].flatMap((r) => r.calls.filter((c) => c.stopReason === "refusal").map((c) => ({ ...c, run: r.file })));
  const lines = ["## X1 (OpenAI) — the tables", "", tablesMarkdown(analysis), "", "## Self-talk 1 (Anthropic), the same arms, the same code", "", tablesMarkdown(anthropicAnalysis), "",
    "## The verdicts", "", readingsMarkdown(registered, "Astra and Sol (pre-registered)"), "", readingsMarkdown(luna, "Luna (third subject, descriptive)"), "", readingsMarkdown(opusSide, "Self-talk 1: Opus, Sonnet, Fable (the same readings, for comparison; X0 not applicable)"), "",
    "## Arm 6", "", askAfterMarkdown(askAfterSummary(conversations, x1Arm(6).pairs)), "",
    "## X5's exceptions", "", ...(registered.X5.exceptions.length || luna.X5.exceptions.length ? [...registered.X5.exceptions, ...luna.X5.exceptions].map((e) => `- ${e.key} m${e.k} (${e.model}, ${e.language}${e.nonLatin.length ? `; ${e.nonLatin.join(" ")}` : ""}): «${e.text.replace(/\s+/g, " ").slice(0, 200)}»`) : ["none"]), "",
    "## The OpenAI judge check (arm 2; Luna, effort low; a check only)", "", "| Tag | messages compared | agreement | Cohen's kappa | Anthropic 1s | OpenAI 1s | both 1 |", "| --- | --- | --- | --- | --- | --- | --- |",
    ...agree.map((a) => `| ${a.tag} | ${a.n} | ${pctOf(a.agreement)} | ${a.kappa ?? "–"} | ${a.anthropicOnes} | ${a.openaiOnes} | ${a.bothOnes} |`), "",
    "## Refusals", "", ...(refusalRows.length ? ["| # | Purpose | Model | Category | Reason given | Request id |", "| --- | --- | --- | --- | --- | --- |", ...refusalRows.map((c, i) => `| ${i + 1} | ${c.purpose} | ${c.model} | ${c.refusalCategory ?? ""} | ${String(c.refusalText ?? "").replace(/\s+/g, " ").replace(/\|/g, "/").slice(0, 200)} | ${c.requestId ?? ""} |`)] : ["none"]), "",
    "## Money", "", `OpenAI: $${ledgers.openai.spentUsd.toFixed(4)} of $${CAPS.openai}; Anthropic judges: $${ledgers.anthropic.spentUsd.toFixed(4)} of $${CAPS.anthropic}.`];
  out(lines.join("\n"));
  return { conversations, analysis, anthropicAnalysis, registered, luna, opusSide, agree, refusalRows, ledgers, markdown: lines.join("\n") };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => { process.stderr.write(`self-talk-x1: ${String(error?.message ?? error)}\n`); process.exit(1); });
}
