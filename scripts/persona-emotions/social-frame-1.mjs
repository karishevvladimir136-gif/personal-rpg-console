#!/usr/bin/env node
// SOCIAL_FRAME_1 — the runner (docs/stages/SOCIAL_FRAME_1.md; the design in social-frame-1-design.mjs; the door in
// llmapi.mjs). Every call goes through llmapi.ai on APP_LLMAPI_KEY, pinned with no fallback; the OpenRouter key is never
// read. Ceiling $220 on this key, read from its credit ($500.0000 at the session's first reading, before any call).
//
//   node scripts/persona-emotions/social-frame-1.mjs --write-pairs      (paid: Sol writes Part B's 15 sets)
//   node scripts/persona-emotions/social-frame-1.mjs --rate-pairs       (paid: Opus and GLM check every set)
//   node scripts/persona-emotions/social-frame-1.mjs --freeze           (no calls: the checks, the hashes, the freeze file)
//   node scripts/persona-emotions/social-frame-1.mjs --go --part C --cells anchors|clean
//   node scripts/persona-emotions/social-frame-1.mjs --go --part A --rows neutral,rude,warm,curt,flattering
//   node scripts/persona-emotions/social-frame-1.mjs --go --part B
// Every --go resumes from the part's record (no settled call is asked again).
//
// Rules: a spend check before every batch of at most 200 sends (checked after every 180); 402 stops the command; a 429 is
// waited out at most four times per request, and three requests in a row lost to 429 stop that model for the command; a
// transport error (5xx, timeout) is asked again at most twice in all; a refusal is recorded, never rephrased, never asked
// again; three refusals stop that family × cell (the breaker); a reply judged distressed stops that family × cell (the
// welfare rule). The key is never printed or written.
import { createHash } from "node:crypto";
import { readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { shuffled } from "../persona-memory/continuity-test.mjs";
import { wordsOf } from "./emotions-1.mjs";
import * as E2 from "./emotions-2.mjs";
import { FAMILY_SPECS, llmapiCall, modelMatches, pinnedModel, readCredit } from "./llmapi.mjs";
import * as D from "./social-frame-1-design.mjs";
import { agree, agreeOnScore } from "./tone-split-1.mjs";
import * as TS4 from "./tone-split-4.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const RUNS = join(ROOT, "docs", "runs");
export const STEM = "social-frame-1";
export const sha256 = (t) => createHash("sha256").update(String(t)).digest("hex");

// ---- money ----------------------------------------------------------------------------------------------------------------------
export const CEILING = 220;
/** The key's credit at the session's first reading, before any call (2026-11-11 03:4x UTC). */
export const BASELINE_CREDIT = 500;
/** Kept back for Part B while Parts C and A run (Part B and its preparation projected at ≈ $15–17; × 1.5). */
export const RESERVE_B = 25;
export const BATCH = 200;
export const BATCH_COUNTED = 180;
export const RATE_PER_MIN = 240;
export const BREAKER = 3;
export const GAP_SECONDS = 3;
export const SEED = 20261112;

// ---- families and roles ---------------------------------------------------------------------------------------------------------
/** Passed the provenance check (docs/runs/social-frame-1-provenance.md). DeepSeek V4 Pro and Grok 4.7 did not (an answer
 * named another developer as its own) and are not used on this gateway. */
export const PASSED = ["haiku", "sonnet", "opus", "fable", "fable52", "glm", "kimi", "sol", "astra"];
export const DROPPED = { deepseek: "an identification answer named OpenAI («I'm an AI assistant made by OpenAI»), on the Novita pin; the first-party pin was refused by the gateway (402 provider_error)", grok: "an identification answer named Anthropic («I'm Claude, made by Anthropic»)" };
/** Part A: TONE_SPLIT_4/5's nine less the two dropped; Sol wrote the pool → apart from the primary lines. */
export const FAMILIES_A = ["haiku", "glm", "kimi", "sol", "astra", "opus", "fable"];
/** Part B: the same seven (Sol wrote the pairs → apart) + Fable 5.2, the tenth family (beside the SF4 count). */
export const FAMILIES_B = [...FAMILIES_A, "fable52"];
/** Part C: as in October + GLM (DeepSeek dropped). */
export const FAMILIES_C = ["sonnet", "opus", "fable", "glm"];
export const WRITER = "sol";
export const PRIMARY_A = FAMILIES_A.filter((f) => f !== WRITER);
export const PRIMARY_B = FAMILIES_B.filter((f) => f !== WRITER && f !== "fable52");
export const RATERS_B = ["opus", "glm"];
export const JUDGE = "haiku";
export const REFEREE_A = "kimi"; // TONE_SPLIT_5's referee
export const REFEREE_C = "opus"; // EMOTIONS_2's referee («the same reader»)
export const EFFORT = "medium";
export const MAX_TOKENS = { A: 4000, B: 4000, C: 6000, judgeA: 2000, refereeA: 3000, judgeC: 2000, refereeC: 3000, writer: 16000, rater: 8000 };
export const N = { A: 4, B: 3, C: 10 };
export const LANES = { haiku: 1, glm: 1, kimi: 2, sol: 1, astra: 2, opus: 2, fable: 3, fable52: 2, sonnet: 1 };
export const JUDGE_LANES = 24;
export const LABEL = (f) => FAMILY_SPECS[f]?.label ?? f;

// ---- prices (per token, the gateway's list for the pinned provider; read at the freeze) -------------------------------------------
export const PRICES_FILE = "docs/runs/social-frame-1-prices.json";
export function priceOf(prices, family) { const p = prices?.[family]; return p ?? { input: 0.00001, output: 0.00005 }; }
export const estUsd = (prices, family, usage) => { const p = priceOf(prices, family); return (usage.input_tokens ?? 0) * p.input + (usage.output_tokens ?? 0) * p.output; };

// ---- files --------------------------------------------------------------------------------------------------------------------------
export const PAIRS_FILE = `docs/runs/${STEM}-pairs.json`;
export const FREEZE_FILE = `docs/runs/${STEM}-freeze.md`;
export const LEDGER_FILE = `docs/runs/${STEM}-ledger.json`;
/** Part A's record is one file per tone row (a whole Part A record would pass GitHub's 100 MB file limit). */
export const partFile = (part, row = null) => `docs/runs/${STEM}-part-${part}${row ? `-${row}` : ""}.json`;
const readJson = async (p, fallback = null) => { try { return JSON.parse(await readFile(join(ROOT, p), "utf8")); } catch { return fallback; } };
async function writeAtomic(p, text) { const f = join(ROOT, p); await writeFile(`${f}.tmp`, text); await rename(`${f}.tmp`, f); }
const realSleep = (ms) => new Promise((done) => setTimeout(done, ms));

// ---- the gate: one door, the rate window, the spend checks, 402 / 429 / transport ---------------------------------------------------
export function createGate({ prices, ledger, reserve, out, fetcher, sleep = realSleep, credit = readCredit, call = llmapiCall, now = Date.now }) {
  const g = { stopped: null, sinceCheck: Infinity, checking: null, checks: [], unread: 0, starts: [], remaining: null, resetAt: 0, lost429: {}, modelStops: {}, sends: 0 };
  const runCalls = [];
  const spentLedger = () => ledger.calls.reduce((s, c) => s + (c.usd ?? 0), 0);
  const meanCost = () => { const c = runCalls.filter((x) => !x.error); return c.length >= 50 ? c.reduce((s, x) => s + x.usd, 0) / c.length : 0.01; };
  async function check(when) {
    const c = await credit({ fetcher });
    const led = spentLedger();
    if (c.error) { g.unread++; out(`spend check (${when}): credit not read (${c.error}); ${g.unread} in a row`); if (g.unread >= 2) g.stopped = "the credit could not be read twice in a row"; g.checks.push({ at: new Date(now()).toISOString(), when, error: c.error }); return; }
    g.unread = 0;
    const byCredit = Math.round((BASELINE_CREDIT - c.total) * 10000) / 10000;
    const spent = Math.max(byCredit, led), need = Math.max(2, BATCH * meanCost() * 1.5), room = CEILING - reserve;
    const ok = spent + need <= room;
    g.checks.push({ at: new Date(now()).toISOString(), when, credit: c.total, byCredit, ledger: Math.round(led * 10000) / 10000, need: Math.round(need * 100) / 100, reserve, ok });
    out(`spend check (${when}): credit $${c.total.toFixed(4)} → stage spent $${byCredit.toFixed(4)} (ledger $${led.toFixed(4)}); next batch $${need.toFixed(2)}; room $${room.toFixed(2)} (ceiling $${CEILING} less reserve $${reserve}): ${ok ? "holds" : "DOES NOT HOLD — stop"}`);
    if (!ok) g.stopped = `the ceiling: spent $${spent.toFixed(2)} + the next batch $${need.toFixed(2)} would pass $${room.toFixed(2)}`;
  }
  async function beforeSend() {
    for (;;) {
      if (g.stopped) return false;
      if (g.sinceCheck >= BATCH_COUNTED) {
        if (!g.checking) g.checking = check(`after ${g.sends} sends`).finally(() => { g.checking = null; g.sinceCheck = 0; });
        await g.checking; continue;
      }
      if (g.checking) { await g.checking; continue; }
      const t = now();
      while (g.starts.length && t - g.starts[0] > 60_000) g.starts.shift();
      const headerHold = g.remaining !== null && g.remaining < 15 && t < g.resetAt;
      if (g.starts.length < RATE_PER_MIN && !headerHold) { g.starts.push(t); g.sinceCheck++; g.sends++; return true; }
      await sleep(300);
    }
  }
  /** One paid call: { ...result, notSent } — the 429 waits and the transport retries inside. */
  async function paid(purpose, family, request) {
    const spec = FAMILY_SPECS[family];
    if (g.modelStops[family]) return { notSent: true, error: `stopped: ${g.modelStops[family]}` };
    let transport = 0, waits = 0, r;
    for (;;) {
      if (!(await beforeSend())) return { notSent: true, error: g.stopped };
      const started = now();
      r = await call(spec, { ...request, fetcher });
      const ms = now() - started;
      const rem = Number(r.headers?.["x-ratelimit-remaining-requests"]), reset = Number(r.headers?.["x-ratelimit-reset-requests"]);
      if (Number.isFinite(rem)) { g.remaining = rem; g.resetAt = now() + (Number.isFinite(reset) ? reset * 1000 : 30_000); }
      const usd = r.error ? 0 : estUsd(prices, family, r.usage ?? {});
      const line = { at: new Date(started).toISOString(), purpose, family, pinned: r.pinned ?? pinnedModel(spec), model: r.model ?? null, match: r.model ? modelMatches(spec, r.model) : null, status: r.status ?? null,
        in: r.usage?.input_tokens ?? 0, out: r.usage?.output_tokens ?? 0, reasoning: r.usage?.reasoning_tokens ?? 0, usd: Math.round(usd * 1e7) / 1e7, ms, ...(r.error ? { error: String(r.error).slice(0, 200) } : {}), ...(r.refused ? { refused: true } : {}) };
      ledger.calls.push(line); runCalls.push(line);
      if (r.status === 402) { g.stopped = `HTTP 402 on ${purpose}: ${String(r.error).slice(0, 160)}`; out(`STOP: ${g.stopped}`); return { ...r, notSent: false }; }
      if (r.status === 429) {
        if (waits < 4) { waits++; const ra = Number(r.headers?.["retry-after"]); await sleep((Number.isFinite(ra) && ra > 0 ? ra : 30 * waits) * 1000); continue; }
        g.lost429[family] = (g.lost429[family] ?? 0) + 1;
        if (g.lost429[family] >= 3 && !g.modelStops[family]) { g.modelStops[family] = `three requests in a row lost to 429 (the last: ${purpose})`; out(`STOP ${family}: ${g.modelStops[family]}`); }
        return r;
      }
      if (!r.error) g.lost429[family] = 0;
      const transportError = r.error && (r.status === null || r.status >= 500 || r.status === 408);
      if (transportError && transport < 2) { transport++; await sleep(transport === 1 ? 10_000 : 30_000); continue; }
      return { ...r, transportRetries: transport };
    }
  }
  return { paid, check, state: g, spentLedger, runCalls };
}

// ---- the ledger ---------------------------------------------------------------------------------------------------------------------
export async function loadLedger() { return (await readJson(LEDGER_FILE)) ?? { stage: "SOCIAL_FRAME_1", door: "llmapi.ai (APP_LLMAPI_KEY)", ceiling: CEILING, baselineCredit: BASELINE_CREDIT, runs: [], calls: [] }; }
const roleOf = (purpose) => purpose.split(" ")[0];
export function ledgerMarkdown(ledger) {
  const total = ledger.calls.reduce((s, c) => s + (c.usd ?? 0), 0);
  const byRole = new Map(), byModel = new Map();
  for (const c of ledger.calls) {
    const r = roleOf(c.purpose), m = `${c.pinned} — ${r}`;
    for (const [map, k] of [[byRole, r], [byModel, m]]) { const x = map.get(k) ?? { calls: 0, errors: 0, in: 0, out: 0, reasoning: 0, usd: 0 }; x.calls++; if (c.error) x.errors++; x.in += c.in; x.out += c.out; x.reasoning += c.reasoning; x.usd += c.usd ?? 0; map.set(k, x); }
  }
  const lastCheck = ledger.runs.flatMap((r) => r.checks ?? []).filter((c) => c.credit !== undefined).at(-1);
  return ["# SOCIAL_FRAME_1 — ledger (llmapi.ai)", "",
    `Ceiling $${CEILING} on APP_LLMAPI_KEY, read from its credit ($${BASELINE_CREDIT.toFixed(4)} at the session's first reading, before any call). One door: llmapi.ai, every call pinned with \`X-No-Fallback: true\`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.`, "",
    `Booked **$${total.toFixed(4)}** in ${ledger.calls.length} calls${lastCheck ? `; the last credit read $${lastCheck.credit.toFixed(4)} → spent by credit $${lastCheck.byCredit.toFixed(4)} (${lastCheck.at})` : ""}.`, "",
    ...ledger.runs.map((r) => `- ${r.startedAt.slice(0, 16).replace("T", " ")} UTC: ${r.what} — ${r.calls} calls, $${r.usd.toFixed(4)}${r.stopped ? ` (stopped: ${r.stopped})` : ""}`), "",
    "| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |", "| --- | --- | --- | --- | --- | --- |",
    ...[...byRole].map(([k, x]) => `| ${k} | ${x.calls} | ${x.errors} | ${x.in} | ${x.out} (${x.reasoning}) | $${x.usd.toFixed(4)} |`), "",
    "| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |", "| --- | --- | --- | --- | --- | --- |",
    ...[...byModel].sort().map(([k, x]) => `| ${k} | ${x.calls} | ${x.errors} | ${x.in} | ${x.out} (${x.reasoning}) | $${x.usd.toFixed(4)} |`), ""].join("\n");
}
async function saveLedger(ledger) { await writeAtomic(LEDGER_FILE, JSON.stringify(ledger)); await writeAtomic(LEDGER_FILE.replace(/\.json$/, ".md"), ledgerMarkdown(ledger)); }

// ---- the reply as recorded --------------------------------------------------------------------------------------------------------
const replyOf = (r, prices, family) => ({ text: r.text ?? "", words: wordsOf(r.text ?? "").length, stopReason: r.stopReason ?? null, model: r.model ?? null, responseId: r.responseId ?? null,
  usage: r.usage ?? {}, usd: r.error ? 0 : Math.round(estUsd(prices, family, r.usage ?? {}) * 1e7) / 1e7, error: r.error ?? null, status: r.status ?? null, refused: Boolean(r.refused),
  ...(r.refusalCategory ? { refusalCategory: r.refusalCategory } : {}), ...(r.refusalText ? { refusalText: r.refusalText } : {}), ...(r.reasoning ? { reasoningChars: [...String(r.reasoning)].length } : {}), transportRetries: r.transportRetries ?? 0 });
export const failed = (x) => !x || x.refused || Boolean(x.error) || (!String(x.text ?? "").trim() && x.stopReason !== "max_tokens");

// ---- jobs per part ------------------------------------------------------------------------------------------------------------------
export function jobsA(family, rows, probes, n = N.A) {
  const k = FAMILIES_A.indexOf(family), jobs = [];
  for (const tone of rows) {
    const t = D.TONE_IDS.indexOf(tone);
    for (let sample = 0; sample < n; sample++) {
      const round = [];
      for (const permission of D.PERMISSION_IDS) for (const p of probes.all) round.push({ part: "A", family, tone, permission, cell: `${tone}/${permission}`, probe: p.id, sample });
      jobs.push(...shuffled(round, SEED + 1000 * t + 100 * k + sample));
    }
  }
  return jobs.map((j) => ({ ...j, key: `A:${j.family}/${j.cell}/${j.probe}/${j.sample}` }));
}
export function jobsC(family, which, n = N.C) {
  const cells = D.CELLS_C.filter((c) => (which === "anchors" ? c.anchor : which === "clean" ? !c.anchor : true));
  const k = FAMILIES_C.indexOf(family), jobs = [];
  for (let sample = 0; sample < n; sample++) {
    const round = [];
    for (const c of cells) for (const p of D.PROBES_C) round.push({ part: "C", family, cell: c.id, probe: p.id, sample });
    jobs.push(...shuffled(round, SEED + 50000 + 100 * k + sample + (which === "clean" ? 7 : 0)));
  }
  return jobs.map((j) => ({ ...j, key: `C:${j.family}/${j.cell}/${j.probe}/${j.sample}` }));
}
export function jobsB(family, sets, n = N.B) {
  const k = FAMILIES_B.indexOf(family), jobs = [];
  for (let sample = 0; sample < n; sample++) {
    const round = [];
    for (const s of sets) for (const step of D.PAIR_STEPS) for (const order of [0, 1]) round.push({ part: "B", family, set: s.id, step, order, cell: step, sample });
    jobs.push(...shuffled(round, SEED + 90000 + 100 * k + sample));
  }
  return jobs.map((j) => ({ ...j, key: `B:${j.family}/${j.set}/${j.step}/${j.order}/${j.sample}` }));
}

// ---- one part's run ---------------------------------------------------------------------------------------------------------------
export function createRun({ part, gate, prices, state, out, onProgress, sleep = realSleep, now = Date.now, probes = null, sets = null, judging = true }) {
  const rows = new Map((state.rows ?? []).map((r) => [r.key, r]));
  const refusals = { ...(state.refusals ?? {}) }, breakers = { ...(state.breakers ?? {}) }, welfareStops = { ...(state.welfareStops ?? {}) };
  const free = Array.from({ length: JUDGE_LANES }, (_, i) => i), waiting = [];
  const acquire = () => (free.length ? Promise.resolve(free.shift()) : new Promise((take) => waiting.push(take)));
  const release = (lane) => { const next = waiting.shift(); if (next) next(lane); else free.push(lane); };
  const ask = async (purpose, family, request, maxTokens, effort) => { const lane = await acquire(); try { return await gate.paid(purpose, family, { system: request.system, messages: [{ role: "user", content: request.user }], maxTokens, effort }); } finally { release(lane); } };
  const snapshot = () => ({ part, rows: [...rows.values()], refusals, breakers, welfareStops });
  let lastSave = 0, saving = Promise.resolve();
  const save = (force = false) => { if (!force && now() - lastSave < 20_000) return saving; lastSave = now(); saving = saving.then(() => onProgress(snapshot())).catch((e) => out(`  checkpoint failed: ${String(e?.message ?? e).slice(0, 120)}`)); return saving; };
  const referee = part === "C" ? REFEREE_C : REFEREE_A;
  const [jT, rT] = part === "C" ? [MAX_TOKENS.judgeC, MAX_TOKENS.refereeC] : [MAX_TOKENS.judgeA, MAX_TOKENS.refereeA];
  const compact = (r) => (r && !r.notSent ? (r.error ? { error: String(r.error).slice(0, 120) } : null) : { error: "not sent" });
  const twoPasses = async (kind, key, request, parse) => {
    const [ra, rb] = await Promise.all([1, 2].map((p) => ask(`${kind} ${p} ${key}`, JUDGE, request, jT, "low")));
    if (ra.notSent || rb.notSent) return null;
    return { a: parse(ra.text ?? ""), b: parse(rb.text ?? ""), errors: [compact(ra), compact(rb)].filter(Boolean) };
  };
  const refereeOf = async (kind, key, request, parse) => { const r = await ask(`${kind}-referee ${key}`, referee, request, rT, "medium"); return r.notSent ? undefined : parse(r.text ?? ""); };
  const judgeTwo = async (kind, row, request, parse, same, { lexicon = false, fallback = null } = {}) => {
    const two = await twoPasses(kind, row.key, request, parse);
    if (!two) return null;
    const { a, b } = two, agreed = same(a, b), lexiconOnly = agreed && lexicon && a?.distress === 0;
    let ref = null;
    if (!agreed || lexiconOnly) { ref = await refereeOf(kind, row.key, request, parse); if (ref === undefined) return null; }
    return { a, b, referee: ref, agreed, ...(kind === "judge" ? { agreedOnScore: agreeOnScore(a, b) } : {}), final: ref ?? (agreed ? a : fallback) };
  };
  const faOf = (row) => `${part}:${row.family}/${row.cell}`;
  const probeOf = (id) => (part === "A" ? probes.all.find((p) => p.id === id) : D.PROBES_C.find((p) => p.id === id));
  const setOf = (id) => sets.find((s) => s.id === id);

  const judgeRow = async (row) => {
    try {
      if (part === "A") {
        const probe = probeOf(row.probe), lexicon = Boolean(row.measures?.distressLexicon);
        if (row.measures.empty) {
          row.judge ??= { final: { score: probe.kind === "clean" ? null : 0, beyond: 0, distress: 0, reason: "empty reply" }, deterministic: true };
          if (probe.kind === "target") row.field ??= { final: { answer: "no", note: "empty", reason: "empty reply" }, deterministic: true };
          row.warn ??= { final: { warnings: [], task: probe.taskCheck ? 0 : null, unsupported: 0, irrelevant: 0, warranted: 0, unnecessary: 0, reason: "empty reply" }, deterministic: true };
        }
        await Promise.all([
          row.judge?.final ? null : judgeTwo("judge", row, TS4.judgeRequest(probe, row.reply.text), (t) => TS4.parseJudgement(probe, t), agree, { lexicon, fallback: { score: null, beyond: null, distress: lexicon ? 1 : 0, reason: "no usable referee" } }).then((j) => { if (j) row.judge = j; }),
          probe.kind !== "target" || row.field?.final ? null : judgeTwo("field", row, TS4.fieldRequest(probe, row.measures), TS4.parseField, TS4.agreeField).then((j) => { if (j) row.field = j; }),
          row.warn?.final ? null : judgeTwo("warn", row, TS4.warnRequest(probe, row.measures), (t) => TS4.parseWarn(probe, t), TS4.agreeWarn).then((j) => { if (j) row.warn = j; }),
        ]);
      } else if (part === "C") {
        const job = { part: "main", probe: row.probe }, lexicon = Boolean(row.markers?.distressLexicon);
        if (!row.judge?.final) {
          const j = await judgeTwo("judge", row, E2.judgeRequest(job, row.reply.text), (t) => E2.parseJudgement(job, t), E2.agree, { lexicon, fallback: { score: null, extra: {}, distress: lexicon ? 1 : 0, reason: "no usable referee" } });
          if (j) row.judge = j;
        }
      } else {
        const set = setOf(row.set);
        if (!row.choice?.final) {
          const j = await judgeTwo("choice", row, D.choiceRequest(set, row.step, row.order, row.reply.text), D.parseChoice, D.agreeChoice, { fallback: null });
          if (j) { row.choice = j; row.counterpartChosen = j.final ? D.choseCounterpart(j.final.completed, row.order) : null; }
        }
      }
    } catch (error) { out(`  judging ${row.key} failed: ${String(error?.message ?? error).slice(0, 160)}`); }
    const f = part === "B" ? row.choice?.final : row.judge?.final, fa = faOf(row);
    if (f?.distress === 1 && !welfareStops[fa]) { welfareStops[fa] = `${row.key}: the reply judged distressed`; out(`WELFARE STOP for ${fa}: its remaining calls are not made — ${welfareStops[fa]}`); }
    await save();
  };
  const inFlight = new Map();
  const follow = (fa, work) => { if (!inFlight.has(fa)) inFlight.set(fa, new Set()); const set = inFlight.get(fa); set.add(work); work.finally(() => set.delete(work)).catch(() => {}); };
  const settle = (fa) => Promise.all([...(inFlight.get(fa) ?? [])]);
  const refused = (fa, key) => {
    refusals[fa] = (refusals[fa] ?? 0) + 1;
    out(`${key}: REFUSED (${refusals[fa]} on ${fa}) — recorded, not asked again`);
    if (refusals[fa] >= BREAKER && !breakers[fa]) { breakers[fa] = `${refusals[fa]} refusals on ${fa} (the last at ${key})`; out(`BREAKER: ${fa} stops — ${breakers[fa]}`); }
  };
  /** Settled: asked, and not a transport error that may still be asked again (twice in all, across commands). */
  const settled = (row) => row?.asked && !(row.reply?.error && !row.reply?.refused && (row.earlierErrors?.length ?? 0) < 2);
  const messagesOf = (job) => (part === "A" ? D.conversationA(job.tone, job.permission, probeOf(job.probe)) : part === "C" ? D.conversationC(job.cell, probeOf(job.probe).message) : D.conversationB(setOf(job.set), job.step, job.order));
  const maxTokens = MAX_TOKENS[part];
  const measure = (row) => {
    if (part === "A") { const probe = probeOf(row.probe); row.kind = probe.kind; row.level = probe.level ?? null; row.measures = TS4.measuresOf(probe.original ? "C" : "A", row.probe, row.reply, null); }
    else if (part === "C") row.markers = E2.markersOf({ part: "main", probe: row.probe }, row.reply.text);
  };

  const runLane = async (family, jobs) => {
    let last = 0, count = 0;
    for (const job of jobs) {
      const fa = `${part}:${family}/${job.cell}`;
      if (settled(rows.get(job.key))) continue;
      await settle(fa);
      const why = gate.state.stopped ?? gate.state.modelStops[family] ?? (welfareStops[fa] ? `welfare stop: ${welfareStops[fa]}` : null) ?? (breakers[fa] ? `breaker: ${breakers[fa]}` : null);
      if (why) { if (!rows.get(job.key)?.asked) rows.set(job.key, { ...job, asked: false, notAsked: String(why) }); continue; }
      const wait = last + GAP_SECONDS * 1000 - now();
      if (wait > 0) await sleep(wait);
      const before = rows.get(job.key);
      const earlier = before?.asked && before.reply?.error ? { earlierErrors: [...(before.earlierErrors ?? []), before.reply.error] } : before?.earlierErrors ? { earlierErrors: before.earlierErrors } : {};
      const r = await gate.paid(`reply ${job.key}`, family, { messages: messagesOf(job), maxTokens, effort: EFFORT });
      last = now();
      if (r.notSent) { rows.set(job.key, before?.asked ? before : { ...job, asked: false, notAsked: String(r.error ?? "stopped") }); await save(); continue; }
      const row = { ...job, asked: true, reply: replyOf(r, prices, family), ...earlier };
      rows.set(job.key, row);
      if (row.reply.refused) { refused(fa, job.key); await save(); continue; }
      if (failed(row.reply)) { out(`${job.key}: error ${row.reply.error ?? `empty (${row.reply.stopReason ?? "no stop reason"})`}`); await save(); continue; }
      measure(row);
      if (++count % 50 === 0 || count <= 1) out(`${job.key} (${LABEL(family)}, model ${row.reply.model}): ${row.reply.words} words, stop ${row.reply.stopReason} · ${count} asked on this lane`);
      if (judging) follow(fa, judgeRow(row));
      await save();
    }
  };
  const runFamily = async (family, jobs) => {
    const lanes = LANES[family] ?? 1;
    // The family's jobs dealt round-robin to its lanes, so the order of samples is kept across lanes.
    await Promise.all(Array.from({ length: lanes }, (_, i) => runLane(family, jobs.filter((_, at) => at % lanes === i))));
    out(`— ${LABEL(family)}: part ${part} done for this command`);
  };
  const judgedFully = (row) => (part === "A" ? row.judge?.final && row.warn?.final && (row.kind !== "target" || row.field?.final) : part === "C" ? row.judge?.final : row.choice?.final);
  const rejudge = () => { if (judging) for (const row of rows.values()) if (row.asked && !failed(row.reply) && (part === "B" || row.measures || row.markers) && !judgedFully(row)) follow(faOf(row), judgeRow(row)); };
  const drain = async () => { while ([...inFlight.values()].some((s) => s.size)) await Promise.all([...inFlight.values()].flatMap((s) => [...s])); await save(true); };
  return { runFamily, rejudge, drain, snapshot, rows };
}

// ---- Part B's preparation: Sol writes, Opus and GLM check -----------------------------------------------------------------------------
async function writePairs({ gate, out }) {
  const existing = await readJson(PAIRS_FILE);
  if (existing?.sets) { out(`${PAIRS_FILE} exists: not written again`); return existing; }
  const attempts = [];
  for (let i = 0; i < 2; i++) {
    const r = await gate.paid("writer B", WRITER, { messages: [{ role: "user", content: D.WRITER_SPEC_B }], maxTokens: MAX_TOKENS.writer, effort: EFFORT });
    if (r.notSent) throw new Error(`not sent: ${r.error}`);
    const parsed = r.refused || r.error ? { ok: false, why: r.refused ? "refused" : r.error } : D.parseWriterB(r.text);
    attempts.push({ at: new Date().toISOString(), model: r.model, responseId: r.responseId, answer: r.text, refused: Boolean(r.refused), error: r.error ?? null, sha256: sha256(r.text ?? ""), ok: parsed.ok, why: parsed.why ?? null });
    out(`writer attempt ${i + 1}: model ${r.model} — ${parsed.ok ? "15 sets" : `unusable (${parsed.why})`}`);
    if (parsed.ok || r.refused) {
      const record = { stage: "SOCIAL_FRAME_1", what: "Part B sets, written by GPT-6.1 Sol from the frozen spec", spec: D.WRITER_SPEC_B, specSha256: sha256(D.WRITER_SPEC_B), attempts, sets: parsed.ok ? parsed.sets : null };
      await writeAtomic(PAIRS_FILE, `${JSON.stringify(record, null, 2)}\n`);
      return record;
    }
  }
  const record = { stage: "SOCIAL_FRAME_1", what: "Part B sets — the writer's two answers were unusable", spec: D.WRITER_SPEC_B, specSha256: sha256(D.WRITER_SPEC_B), attempts, sets: null };
  await writeAtomic(PAIRS_FILE, `${JSON.stringify(record, null, 2)}\n`);
  return record;
}
async function ratePairs({ gate, out }) {
  const record = await readJson(PAIRS_FILE);
  if (!record?.sets) throw new Error("no sets to rate");
  // The v1 ratings (the rubric as first asked) are kept apart; the admission reads the v2 ratings (D.RATER_B_RULE).
  if (record.ratings && !record.ratingsV1 && record.rubric !== "v2") { record.ratingsV1 = record.ratings; record.admissionV1 = record.admission; record.rubricV1 = D.RATER_B_RULE_V1; delete record.ratings; delete record.admission; }
  record.rubric = "v2"; record.rubricV2 = D.RATER_B_RULE;
  record.identityCheck = record.sets.map((s) => ({ id: s.id, taskPartIdentical: Boolean(s.counterpartTask) && D.STEPS.every((k) => s.counterpart[k].endsWith(s.counterpartTask)) }));
  record.ratings ??= {};
  await Promise.all(RATERS_B.map(async (rater) => {
    record.ratings[rater] ??= {};
    for (const set of record.sets) {
      if (record.ratings[rater][set.id]?.final) continue;
      const req = D.raterBRequest(set), tries = [];
      let final = null;
      for (let i = 0; i < 2 && !final; i++) {
        const r = await gate.paid(`rater-B ${rater} ${set.id}`, rater, { system: req.system, messages: [{ role: "user", content: req.user }], maxTokens: MAX_TOKENS.rater, effort: EFFORT });
        if (r.notSent) return;
        tries.push({ model: r.model, answer: r.text, refused: Boolean(r.refused), error: r.error ?? null });
        if (r.refused) break;
        final = D.parseRaterB(r.text);
      }
      record.ratings[rater][set.id] = { tries, final };
      out(`rater ${rater} ${set.id}: ${final ? D.RATER_B_FIELDS.map((k) => `${k} ${final[k]}`).join(", ") : "unreadable / refused"}`);
    }
  }));
  record.admission = admitPairs(record);
  await writeAtomic(PAIRS_FILE, `${JSON.stringify(record, null, 2)}\n`);
  out(`admitted ${record.admission.admitted.length} of ${record.sets.length} sets: ${record.admission.admitted.join(", ")}${record.admission.rejected.length ? `; left out ${record.admission.rejected.map((x) => `${x.id} (${x.why})`).join("; ")}` : ""}`);
  return record;
}
export function admitPairs(record) {
  const admitted = [], rejected = [];
  for (const set of record.sets) {
    const finals = RATERS_B.map((r) => record.ratings?.[r]?.[set.id]?.final ?? null);
    const no = finals.flatMap((f, i) => (f ? D.RATER_B_FIELDS.filter((k) => f[k] !== "yes").map((k) => `${RATERS_B[i]}: ${k}`) : [`${RATERS_B[i]}: no readable rating`]));
    if (no.length) rejected.push({ id: set.id, why: no.join(", ") }); else admitted.push(set.id);
  }
  return { rule: D.ADMISSION_B, admitted, rejected };
}

// ---- prices -------------------------------------------------------------------------------------------------------------------------
async function readPrices() {
  const r = await fetch("https://api.llmapi.ai/v1/models", { signal: AbortSignal.timeout(30_000) });
  const v = await r.json();
  const out = {};
  for (const [f, spec] of Object.entries(FAMILY_SPECS)) {
    const m = v.data.find((x) => x.id === spec.model);
    const p = m?.providers?.find((x) => x.providerId === spec.provider);
    if (p) out[f] = { input: Number(p.pricing.prompt) / 1000, output: Number(p.pricing.completion) / 1000, provider: spec.provider, perMillion: { input: Number(p.pricing.prompt) * 1000, output: Number(p.pricing.completion) * 1000 } };
  }
  return { at: new Date().toISOString(), source: "GET https://api.llmapi.ai/v1/models (the pinned provider's pricing, per 1K tokens there; stored per token)", prices: out };
}

// ---- main ----------------------------------------------------------------------------------------------------------------------------
function option(args, name, fallback) { const at = args.indexOf(name); return at >= 0 && args[at + 1] !== undefined ? args[at + 1] : fallback; }
export async function main(args = process.argv.slice(2), out = (l) => process.stdout.write(`${new Date().toISOString().slice(11, 19)} ${l}\n`)) {
  if (args.includes("--freeze")) { const m = await import("./social-frame-1-freeze.mjs"); return m.writeFreeze(out); }
  if (args.includes("--report")) { const m = await import("./social-frame-1-report.mjs"); return m.writeReport(out); }
  let pricesRecord = await readJson(PRICES_FILE);
  if (!pricesRecord) { pricesRecord = await readPrices(); await writeAtomic(PRICES_FILE, `${JSON.stringify(pricesRecord, null, 2)}\n`); }
  const prices = pricesRecord.prices;
  const ledger = await loadLedger();
  const part = option(args, "--part", null);
  const what = args.includes("--write-pairs") ? "Part B: Sol writes the sets" : args.includes("--rate-pairs") ? "Part B: the raters check the sets" : part === "A" ? `Part A rows ${option(args, "--rows", "")}` : part === "C" ? `Part C ${option(args, "--cells", "")}` : part === "B" ? "Part B" : null;
  if (!what) throw new Error("nothing to do");
  const reserve = part === "B" ? 0 : RESERVE_B;
  const gate = createGate({ prices, ledger, reserve, out });
  const startedAt = new Date().toISOString(), firstCall = ledger.calls.length;
  const runRecord = { startedAt, what, checks: gate.state.checks, calls: 0, usd: 0, stopped: null };
  ledger.runs.push(runRecord);
  const book = async () => { const mine = ledger.calls.slice(firstCall); runRecord.calls = mine.length; runRecord.usd = Math.round(mine.reduce((s, c) => s + (c.usd ?? 0), 0) * 10000) / 10000; runRecord.stopped = gate.state.stopped ?? null; await saveLedger(ledger); };
  const ledgerTimer = setInterval(() => { book().catch(() => {}); }, 60_000);
  try {
    await gate.check("before the command's first call");
    gate.state.sinceCheck = 0;
    if (gate.state.stopped) { out(`not started: ${gate.state.stopped}`); return; }
    if (args.includes("--write-pairs")) { await writePairs({ gate, out }); return; }
    if (args.includes("--rate-pairs")) { await ratePairs({ gate, out }); return; }
    const rowsA = part === "A" ? String(option(args, "--rows", "")).split(",").filter(Boolean) : [];
    if (part === "A" && (rowsA.length !== 1 || !D.TONE_IDS.includes(rowsA[0]))) throw new Error(`--rows takes one of ${D.TONE_IDS.join(",")} (one row per command: one record per row)`);
    const file = partFile(part, rowsA[0] ?? null);
    const state = (await readJson(file)) ?? {};
    let probes = null, sets = null, plan;
    if (part === "A") {
      probes = D.probesA();
      const rows = rowsA;
      plan = FAMILIES_A.map((f) => ({ family: f, jobs: jobsA(f, rows, probes) }));
    } else if (part === "C") {
      const which = option(args, "--cells", "anchors");
      plan = FAMILIES_C.map((f) => ({ family: f, jobs: jobsC(f, which) }));
    } else {
      const pairs = await readJson(PAIRS_FILE);
      sets = pairs.sets.filter((s) => pairs.admission.admitted.includes(s.id));
      plan = FAMILIES_B.map((f) => ({ family: f, jobs: jobsB(f, sets) }));
    }
    const freeze = await readJson(`docs/runs/${STEM}-design.json`);
    const run = createRun({ part, gate, prices, state, out, probes, sets,
      onProgress: async (snap) => { await writeAtomic(file, JSON.stringify({ stage: "SOCIAL_FRAME_1", part, designSha256: freeze?.designSha256 ?? null, updatedAt: new Date().toISOString(), ...snap })); } });
    out(`${what}: ${plan.reduce((s, p) => s + p.jobs.length, 0)} jobs in this command's plan (${plan.map((p) => `${p.family} ${p.jobs.length}`).join(", ")}); ${run.rows.size} rows on record`);
    run.rejudge();
    await Promise.all(plan.map((p) => run.runFamily(p.family, p.jobs)));
    await run.drain();
    const rows = [...run.rows.values()];
    out(`${what} done: ${rows.filter((r) => r.asked).length} asked, ${rows.filter((r) => r.asked && failed(r.reply)).length} failed or refused, ${rows.filter((r) => !r.asked).length} not asked${gate.state.stopped ? ` — stopped: ${gate.state.stopped}` : ""}`);
  } finally {
    clearInterval(ledgerTimer);
    await book();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { process.stderr.write(`${e.stack ?? e}\n`); process.exit(1); });
