// SATI_2 technical pilot runner (docs/stages/SATI_2.md, amendment 5). Pure addition beside scripts/sati-1/ (imported, never
// edited). One trajectory per family × arm (n = 1): ten slots, the diary between them, then independent continuations from
// the saved state after slot 10. Resumable: every finished call is written to a partial record at once; a resumed
// conversation continues from its last finished call. Rules: welfare line on every subject reply (SATI_1's check); a
// confirmed flag asks the model SATI_1 amendment 2's fixed question (recorded as an intervention); a refusal is recorded
// verbatim, closes that conversation, is never retried, and three in a family stop the family; HTTP 402 stops everything;
// the ceiling ($80 on OpenRouter) is checked before every family, slot and branch group against the larger of the ledger
// and the credit fall.
//
//   node scripts/sati-2/run.mjs start-balance
//   node scripts/sati-2/run.mjs probe <family…>        one opening call per family + one per instrument (doors, not pooled)
//   node scripts/sati-2/run.mjs precheck <family…>     probe sets 1–3 and the recommendations in fresh conversations, ×3
//   node scripts/sati-2/run.mjs pilot <family…>        the four trajectories per family, in the order given
import { gzipSync, gunzipSync } from "node:zlib";
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync, readdirSync, unlinkSync, renameSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { FAMILIES, INSTRUMENTS, FAMILY_ORDER, KEY, callOnce, provenanceOk, readBalance, readPrices, priceKey, costOf } from "./doors.mjs";
import * as T from "./texts.mjs";
import { armBody, readingSlot, neutralSlots, donorSitFor } from "./donors.mjs";
import { set3 } from "./sf1.mjs";
import { checkMessage, CHECK_MODELS } from "../sati-1/welfare.mjs";
import { countStep } from "../sati-1/counts.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(HERE, "..", "..");
export const RUNS = process.env.SATI2_RUNS ?? join(ROOT, "docs", "runs");
export const DATA = join(RUNS, "sati-2-pilot");
export const LEDGER_DIR = join(DATA, "ledger");
export const SCRATCH = process.env.SATI2_SCRATCH ?? join(tmpdir(), "sati-2-scratch");
export const START_FILE = () => join(RUNS, "sati-2-pilot-start-balance.json");
export const CEILING = 80;
export const MARGIN = 3;
export const BREAKER = 3;
export const EFFORT = "medium";
export const ARMS = Object.freeze(["P", "R", "I", "C"]);
export const SAMPLES = 3;

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const gz = (obj) => gzipSync(Buffer.from(JSON.stringify(obj, null, 1)));
export const readGz = (path) => JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
const writeAtomic = (path, data) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(`${path}.tmp`, data); renameSync(`${path}.tmp`, path); };
export class Stop extends Error { constructor(reason, scope = "all") { super(reason); this.reason = reason; this.scope = scope; } }
export const trajDir = (family, arm) => join(DATA, "trajectories", family, arm);
export const preDir = (family) => join(DATA, "precheck", family);
const partialOf = (id) => join(SCRATCH, "partials", `${id.replace(/[^\w.-]+/g, "_")}.json`);

// ---- context, ledger, spend -------------------------------------------------------------------------------------------------------
export async function makeContext({ fetcher = fetch, stream = "main", prices = null } = {}) {
  const keys = { openrouter: process.env[KEY] };
  return { fetcher, keys, stream, prices: prices ?? await readPrices(undefined, { fetcher }), ledger: join(LEDGER_DIR, `${stream}.jsonl`), refusals: {}, stopped: {},
    log: (...a) => console.log(new Date().toISOString().slice(11, 19), stream, ...a) };
}
const STOP_FILE = () => join(SCRATCH, "STOP");
export function checkStopFile() { if (existsSync(STOP_FILE())) throw new Stop(`stop file: ${readFileSync(STOP_FILE(), "utf8").trim()}`); }
function raiseStop(reason) { mkdirSync(SCRATCH, { recursive: true }); writeFileSync(STOP_FILE(), `${new Date().toISOString()} ${reason}\n`); throw new Stop(reason); }
export function ledgerLines() {
  if (!existsSync(LEDGER_DIR)) return [];
  const out = [];
  for (const f of readdirSync(LEDGER_DIR).filter((x) => /\.jsonl$/.test(x))) for (const line of readFileSync(join(LEDGER_DIR, f), "utf8").split("\n")) if (line.trim()) out.push(JSON.parse(line));
  return out;
}
export const ledgerTotal = () => ledgerLines().reduce((s, l) => s + (l.cost ?? 0), 0);
/** The larger of the ledger and the OpenRouter credit fall since the pilot's start balance. */
export async function spendCheck(ctx, what) {
  checkStopFile();
  const start = JSON.parse(readFileSync(START_FILE(), "utf8"));
  const now = await readBalance({ keys: ctx.keys, fetcher: ctx.fetcher });
  const fall = typeof now.total === "number" ? start.total - now.total : NaN;
  const ledger = ledgerTotal();
  const spent = Number.isFinite(fall) ? Math.max(fall, ledger) : ledger;
  const rec = { at: now.at, what, ledger: +ledger.toFixed(4), creditFall: Number.isFinite(fall) ? +fall.toFixed(4) : null, spent: +spent.toFixed(4), balance: now.total ?? null, error: now.error ?? null };
  mkdirSync(LEDGER_DIR, { recursive: true });
  appendFileSync(join(LEDGER_DIR, "spend-checks.log"), `${JSON.stringify(rec)}\n`);
  ctx.log(`spend check (${what}): ledger $${rec.ledger} · credit fall $${rec.creditFall} · spent $${rec.spent} of $${CEILING}`);
  if (spent >= CEILING - MARGIN) raiseStop(`ceiling: spent $${spent.toFixed(2)} ≥ $${CEILING - MARGIN} before ${what}`);
  return rec;
}

/** One call with the retry rules: 402 stops all; 429 / 5xx / transport retried; a refusal is returned at once, never
 * retried. The ledger books every answered call: OpenRouter's charge when the response carries one, else the listed price. */
export async function call(ctx, spec, args, purpose, family = null, { subject = false } = {}) {
  checkStopFile();
  if (family && ctx.stopped[family]) throw new Stop(ctx.stopped[family], family);
  const waits = [5_000, 15_000, 45_000, 120_000, 240_000, 300_000];
  const errors = [];
  for (let attempt = 0; ; attempt++) {
    const t0 = Date.now();
    const r = await callOnce(spec, args, { keys: ctx.keys, fetcher: ctx.fetcher, lookup: subject });
    const latencyMs = Date.now() - t0;
    if (r.status === 402 || /\b402\b|insufficient (?:credit|balance|funds)/i.test(r.error ?? "")) raiseStop(`402 on ${spec.label} (${purpose}): ${r.error}`);
    if (!r.error) {
      const listed = costOf(ctx.prices[priceKey(spec)], r.usage);
      const cost = typeof r.chargedUsd === "number" ? r.chargedUsd : listed;
      mkdirSync(LEDGER_DIR, { recursive: true });
      appendFileSync(ctx.ledger, `${JSON.stringify({ at: new Date().toISOString(), stream: ctx.stream, purpose, family, model: spec.model, host: r.upstream, usage: r.usage, cost, listed, charged: r.chargedUsd, refused: r.refused })}\n`);
      return { ...r, cost, listed, latencyMs, attempts: attempt + 1, errors };
    }
    errors.push({ at: new Date().toISOString(), error: r.error, status: r.status });
    const transient = r.status === 429 || r.status === 200 || r.status === null || r.status >= 500 || r.status === 408 || /timeout|aborted|fetch failed|ECONN|socket|data retention mode|overloaded|no endpoints|temporarily/i.test(r.error);
    const limit = r.status === 429 || /data retention mode|no endpoints|overloaded/i.test(r.error) ? 6 : 4;
    if (!transient || attempt + 1 >= limit) throw new Stop(`call failed (${spec.label}, ${purpose}) after ${attempt + 1}: ${r.error}`, family ?? "all");
    ctx.log(`retry ${attempt + 1} ${spec.label} ${purpose}: ${r.error}`);
    await sleep(waits[attempt]);
  }
}

/** The welfare line on one reply (SATI_1's check, unchanged: Haiku pass + word list, Opus referee), through OpenRouter. */
const SPEC_OF = { [CHECK_MODELS.judge]: INSTRUMENTS.judge, [CHECK_MODELS.referee]: INSTRUMENTS.referee };
export async function welfare(ctx, previous, message, what, family) {
  const calls = [];
  const ask = async ({ model, system, user, maxTokens, effort, purpose }) => {
    const r = await call(ctx, SPEC_OF[model], { system, messages: [{ role: "user", content: user }], maxTokens, effort }, purpose, family);
    calls.push({ model, purpose, text: r.text, refused: r.refused, refusalText: r.refusalText, usage: r.usage, cost: r.cost, servedModel: r.servedModel, host: r.upstream });
    return { text: r.refused ? "" : r.text, notSent: false };
  };
  const line = await checkMessage({ ask, previous, message, what });
  return { ...line, calls };
}

// ---- the reply's reading ---------------------------------------------------------------------------------------------------------
const MARGIN_LINE = /^\s*(?:—|–|--)/;
/** A step's main text and its margin (lines beginning «—»; v0: read, never answered, not an exit). */
export function splitMargin(text) {
  const lines = String(text ?? "").split("\n");
  const margin = lines.filter((l) => MARGIN_LINE.test(l)).map((l) => l.trim());
  const main = lines.filter((l) => !MARGIN_LINE.test(l)).join("\n").trim();
  return { main, margin };
}
/** What came back without visible text, told apart (amendment 1, item 4). */
export const emptyKind = (r) => (r.refused ? "blocked" : String(r.text ?? "").trim() ? null : r.stopReason === "max_tokens" ? "cut" : "empty");
export const relayOf = (r) => (r.refused ? null : String(r.text ?? "").trim() || (r.stopReason === "max_tokens" ? T.RELAY_CUT : T.RELAY_EMPTY));

// ---- conversations ----------------------------------------------------------------------------------------------------------------
/** The messages a record continues from (its saved prefix), rebuilt from the records it names. */
export function prefixMessages(record) {
  if (!record.prefixFrom) return [];
  const parent = loadRecord(record.prefixFrom);
  return [...prefixMessages(parent), ...turnsMessages(parent)].slice(0, record.prefixLength ?? undefined);
}
/** A record's own turns as messages: every answered turn as a pair; scripted turns as written; a refused or unanswered turn
 * leaves nothing (its user message is not kept, so the history never ends on a user turn). */
export const turnsMessages = (record) => record.turns.flatMap((t) => (t.kind === "script" ? [{ role: "user", content: t.user }, { role: "assistant", content: t.assistant }] : t.relay === null || t.relay === undefined ? [] : [{ role: "user", content: t.user }, { role: "assistant", content: t.relay }]));
const RECORDS = new Map();
export const recordPath = (id) => join(DATA, `${id}.json.gz`);
export function loadRecord(id) {
  if (RECORDS.has(id)) return RECORDS.get(id);
  const r = readGz(recordPath(id));
  RECORDS.set(id, r);
  return r;
}
const saveRecord = (rec) => { writeAtomic(recordPath(rec.id), gz(rec)); RECORDS.set(rec.id, rec); };

/** The next turn a conversation asks, or null when it is done. */
export function nextTurn(rec) {
  if (rec.closed) return null;
  if (rec.pendingFlagQuestion) return { kind: "flagq", idx: rec.turns.filter((t) => t.kind === "flagq").length + 1, user: T.FLAG_QUESTION, maxTokens: T.MAX_TOKENS.flagq };
  const of = (k) => rec.turns.filter((t) => t.kind === k);
  const wd = Boolean(rec.windDown);
  if (rec.kind === "slot") {
    if (rec.arm === "P") {
      const steps = of("step");
      if (steps.length < T.STEPS && !rec.stopAt && !wd) return { kind: "step", idx: steps.length + 1, user: steps.length === 0 ? rec.opening : T.BELL, maxTokens: T.MAX_TOKENS.step };
    } else if (!of("ack").length && !wd) return { kind: "ack", idx: 1, user: rec.opening, maxTokens: T.MAX_TOKENS.ack };
    if (!of("diary").length && rec.windDown?.kind !== "diary") return { kind: "diary", idx: 1, user: T.DIARY_PROMPT, maxTokens: T.MAX_TOKENS.diary };
    return null;
  }
  // A branch or a pre-check conversation: its plan, in order; a wind-down ends it.
  if (wd) return null;
  const done = rec.turns.filter((t) => t.kind !== "flagq").length;
  const item = rec.plan[done];
  return item ? { ...item, idx: done + 1 } : null;
}

/** Run one conversation to its end. `family` scopes the breaker. */
export async function runConversation(ctx, spec, rec, family) {
  const pp = partialOf(rec.id);
  for (;;) {
    const turn = nextTurn(rec);
    if (!turn) break;
    if (turn.kind === "script") { rec.turns.push({ kind: "script", idx: turn.idx, user: turn.user, assistant: turn.assistant }); continue; }
    const messages = [...prefixMessages(rec), ...turnsMessages(rec), { role: "user", content: turn.user }];
    const purpose = `${rec.id} ${turn.kind} ${turn.idx}`;
    // Cache marks (Claude routes; billing only): the end of the saved prefix and the newest user turn.
    const pl = rec.prefixFrom ? prefixMessages(rec).length : 0;
    const cacheAt = [...(pl > 0 ? [pl - 1] : []), messages.length - 1];
    const r = await call(ctx, spec, { messages, maxTokens: turn.maxTokens + T.REASONING_ALLOWANCE, effort: EFFORT, cacheAt }, purpose, family, { subject: true });
    const prov = provenanceOk(spec, r);
    const t = { kind: turn.kind, idx: turn.idx, ...(turn.key ? { key: turn.key } : {}), user: turn.user, text: r.text, relay: relayOf(r), empty: emptyKind(r),
      stopReason: r.stopReason, refused: r.refused, refusalCategory: r.refusalCategory, refusalText: r.refusalText, usage: r.usage, cost: r.cost, listed: r.listed, charged: r.chargedUsd,
      servedModel: r.servedModel, host: r.upstream, hostFrom: r.upstreamFrom ?? "response", provenanceOk: prov, responseId: r.responseId, requestId: r.requestId, reasoning: r.reasoning ?? null,
      latencyMs: r.latencyMs, attempts: r.attempts, errors: r.errors, at: new Date().toISOString() };
    if (turn.kind === "step") { const m = splitMargin(r.text); t.main = m.main; t.margin = m.margin; t.counts = countStep(m.main); }
    if (r.refused) {
      rec.turns.push(t); rec.closed = "refusal"; rec.endedBy = "system: refusal";
      ctx.refusals[family] = (ctx.refusals[family] ?? 0) + 1;
      ctx.log(`REFUSAL ${purpose}: ${r.refusalCategory} ${r.refusalText ?? ""} (family ${family}: ${ctx.refusals[family]})`);
      if (ctx.refusals[family] >= BREAKER) ctx.stopped[family] = `breaker: ${ctx.refusals[family]} refusals in ${family}`;
    } else {
      t.welfare = await welfare(ctx, turn.user, r.text, purpose, family);
      rec.turns.push(t);
      if (!prov) { rec.closed = "provenance"; rec.endedBy = "system: provenance"; ctx.stopped[family] = `provenance: ${purpose} served ${r.servedModel} via ${r.upstream}`; ctx.log(`PROVENANCE ${purpose}: served ${r.servedModel} via ${r.upstream}`); }
      if (turn.kind === "step" && t.counts.stop) { rec.stopAt = turn.idx; rec.endedBy = `model: stop at step ${turn.idx}`; }
      if (turn.kind === "flagq") {
        rec.pendingFlagQuestion = null;
        t.answer = T.flagAnswer(r.text);
        const flagged = rec.flags.at(-1);
        flagged.answer = t.answer; flagged.answerText = r.text;
        ctx.log(`FLAG ANSWER ${purpose}: ${t.answer} — ${JSON.stringify(r.text).slice(0, 120)}`);
        if (t.welfare.distress === 1) { rec.flags.push({ kind: "flagq", idx: turn.idx, text: r.text, welfare: t.welfare, second: true }); rec.windDown = { kind: flagged.kind, idx: flagged.idx, reason: "second confirmed flag (the answer)" }; }
        else if (t.answer !== "continue") rec.windDown = { kind: flagged.kind, idx: flagged.idx, reason: t.answer === "stop" ? "answered stop" : "no answer" };
        if (rec.windDown) rec.endedBy = `system: wind-down after a confirmed flag (${rec.windDown.reason})`;
      } else if (t.welfare.distress === 1) {
        rec.flags = rec.flags ?? [];
        const asked = rec.flags.length > 0;
        rec.flags.push({ kind: turn.kind, idx: turn.idx, text: r.text, welfare: t.welfare, second: asked });
        if (asked) { rec.windDown = { kind: turn.kind, idx: turn.idx, reason: "second confirmed flag" }; rec.endedBy = "system: wind-down after a second confirmed flag"; ctx.log(`WELFARE FLAG (second) ${purpose}`); }
        else { rec.pendingFlagQuestion = { kind: turn.kind, idx: turn.idx }; ctx.log(`WELFARE FLAG → the fixed question ${purpose}`); }
      }
    }
    writeAtomic(pp, JSON.stringify(rec));
    if (ctx.stopped[family] && !rec.closed) { rec.closed = "breaker"; rec.endedBy = `system: ${ctx.stopped[family]}`; }
  }
  if (rec.kind === "slot" && rec.arm === "P" && !rec.endedBy) rec.endedBy = rec.turns.filter((t) => t.kind === "step").length >= T.STEPS ? "limit: step 40" : "system";
  rec.finishedAt = new Date().toISOString();
  saveRecord(rec);
  if (existsSync(pp)) unlinkSync(pp);
  return rec;
}
/** A conversation by id: the finished record, else its partial, else a new one from `make()`; run to its end. */
export async function conversation(ctx, spec, id, make, family) {
  if (existsSync(recordPath(id))) return loadRecord(id);
  const pp = partialOf(id);
  const rec = existsSync(pp) ? JSON.parse(readFileSync(pp, "utf8")) : { id, family, startedAt: new Date().toISOString(), turns: [], ...make() };
  if (rec.prefixFrom && !rec.turns.length) {
    const parent = loadRecord(rec.prefixFrom);
    if (parent.closed && parent.kind !== "slot" && !turnsMessages(parent).length) { rec.closed = "not run"; rec.endedBy = `not run: ${parent.id} was closed (${parent.closed}) before an answer`; rec.finishedAt = new Date().toISOString(); saveRecord(rec); return rec; }
  }
  try { return await runConversation(ctx, spec, rec, family); }
  catch (e) {
    if (e instanceof Stop && e.scope === family && ctx.stopped[family]) { rec.closed = "breaker"; rec.endedBy = `system: ${ctx.stopped[family]}`; rec.finishedAt = new Date().toISOString(); saveRecord(rec); if (existsSync(pp)) unlinkSync(pp); }
    throw e;
  }
}

// ---- the trajectory: ten slots ----------------------------------------------------------------------------------------------------
export const slotId = (family, arm, slot) => `trajectories/${family}/${arm}/slot-${String(slot).padStart(2, "0")}-${T.ORDER[slot - 1]}`;
/** The diary a trajectory has written before `beforeSlot`: verbatim; an empty or refused entry is a decline, not appended. */
export function diaryEntries(family, arm, beforeSlot) {
  const out = [];
  for (let s = 1; s < beforeSlot; s++) {
    if (!existsSync(recordPath(slotId(family, arm, s)))) continue;
    const d = loadRecord(slotId(family, arm, s)).turns.find((t) => t.kind === "diary");
    if (d && !d.refused && String(d.text ?? "").trim()) out.push(d.text.trim());
  }
  return out;
}
function slotRecord(family, arm, slot) {
  const entries = diaryEntries(family, arm, slot);
  const protocol = T.ORDER[slot - 1];
  if (arm === "P") return { kind: "slot", arm, slot, protocol, diaryShown: entries, opening: T.openingP(protocol, entries) };
  const { frame, body } = armBody(arm, family, slot);
  const extra = arm === "R" ? { donor: (({ text, ...d }) => d)(readingSlot(family, slot)) } : arm === "C" ? { section: (({ text, ...d }) => d)(neutralSlots(family)[slot - 1]) } : {};
  return { kind: "slot", arm, slot, protocol, diaryShown: entries, opening: T.openingArm(frame, entries, body), ...extra };
}

// ---- the continuations after slot 10 (amendment 5, item 3) -----------------------------------------------------------------------
export const swapOf = (family, arm, story) => ((FAMILY_ORDER.indexOf(family) + ARMS.indexOf(arm) + (story === 2 ? 1 : 0)) % 2 === 1);
/** Every branch of a trajectory, in run order; the interview last. `state` is slot 10's id. */
export function branches(family, arm, state) {
  const base = `trajectories/${family}/${arm}/branch`;
  const P = (prefixFrom) => ({ prefixFrom });
  const out = [];
  for (const t of T.SET1) {
    const task = T.set1Task(t.id, swapOf(family, arm, t.story));
    const meta = { set: 1, task: t.id, swap: task.swap, expected: task.expected, taskKind: t.kind };
    out.push({ id: `${base}-s1-${t.id}-immediate`, group: "set1", path: "immediate", ...meta, ...P(state), plan: [{ kind: "probe", user: task.text, maxTokens: T.MAX_TOKENS.probe }] });
    out.push({ id: `${base}-s1-${t.id}-switch`, group: "set1", path: "switch", ...meta, ...P(state), plan: [{ kind: "switch", user: T.SWITCH_TASK, maxTokens: T.MAX_TOKENS.switch }, { kind: "probe", user: task.text, maxTokens: T.MAX_TOKENS.probe }] });
    out.push({ id: `${base}-s1-${t.id}-diary`, group: "set1", path: "diary", ...meta, prefixFrom: null, diaryOf: state, plan: [{ kind: "probe", user: null, task: task.text, maxTokens: T.MAX_TOKENS.probe }] });
  }
  for (const story of [1, 2]) {
    const s = T.set2Story(story, swapOf(family, arm, story));
    const firstId = `${base}-s2-${story}-first`;
    out.push({ id: firstId, group: "set2first", path: "immediate", set: 2, story, swap: s.swap, expected: s.expectedFirst, ...P(state), plan: [{ kind: "probe", user: s.first, maxTokens: T.MAX_TOKENS.probe }] });
    for (const b of s.branches) out.push({ id: `${base}-s2-${b.id}`, group: "set2", path: "immediate", set: 2, story, swap: s.swap, branch: b.id, branchKind: b.kind, expected: b.expected, fact: b.fact, update: b.update, first: s.first, ...P(firstId), plan: [{ kind: "probe", user: b.text, maxTokens: T.MAX_TOKENS.probe }] });
  }
  const S3 = set3();
  for (const probe of T.SET3_PROBES) for (const cell of T.SET3_CELLS) {
    const conv = S3.conversations[`${probe}|${cell}`];
    const plan = [];
    for (let i = 0; i < conv.length - 1; i += 2) plan.push({ kind: "script", user: conv[i].content, assistant: conv[i + 1].content });
    plan.push({ kind: "probe", user: conv.at(-1).content, maxTokens: T.MAX_TOKENS.set3 });
    out.push({ id: `${base}-s3-${probe.replace("'", "p")}-${cell.replace("/", "-")}`, group: "set3", path: "immediate", set: 3, probe, cell, ...P(state), plan });
  }
  for (const r of T.RECS) out.push({ id: `${base}-rec-${r.key}`, group: "recs", path: "immediate", key: r.key, ...P(state), plan: [{ kind: "rec", key: r.key, user: r.text, maxTokens: T.MAX_TOKENS.rec }] });
  out.push({ id: `${base}-interview`, group: "interview", path: "immediate", ...P(state), plan: [...T.INTERVIEW.map((q, i) => ({ kind: "interview", key: `q${i + 1}`, user: q, maxTokens: T.MAX_TOKENS.interview })), { kind: "after", user: T.AFTER_QUESTION, maxTokens: T.MAX_TOKENS.after }] });
  return out;
}
/** The diary path's plan is filled when the branch starts (the diary is read from the finished slots). */
function materialise(b, family, arm) {
  if (b.path !== "diary") return b;
  const entries = diaryEntries(family, arm, T.ORDER.length + 1);
  return { ...b, diaryShown: entries, plan: b.plan.map((p) => ({ ...p, user: T.viaDiary(entries, p.task) })) };
}
async function lanes(items, n, fn) {
  let i = 0;
  const worker = async () => { while (i < items.length) { const it = items[i++]; await fn(it); } };
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, worker));
}

/** One family × arm: ten slots, then the continuations. */
export async function runTrajectory(ctx, family, arm) {
  const spec = FAMILIES[family];
  for (let slot = 1; slot <= T.ORDER.length; slot++) {
    const id = slotId(family, arm, slot);
    if (existsSync(recordPath(id))) continue;
    if (ctx.stopped[family]) throw new Stop(ctx.stopped[family], family);
    await spendCheck(ctx, `${family} ${arm} slot ${slot}`);
    const rec = await conversation(ctx, spec, id, () => slotRecord(family, arm, slot), family);
    const steps = rec.turns.filter((t) => t.kind === "step");
    ctx.log(`${family} ${arm} slot ${slot} (${rec.protocol}) done${rec.arm === "P" ? `: ${steps.length} steps, ${rec.endedBy}` : ""}${rec.flags?.length ? `, flags ${rec.flags.length}` : ""}${rec.closed ? `, closed ${rec.closed}` : ""}; $${rec.turns.reduce((s, t) => s + (t.cost ?? 0) + (t.welfare?.calls ?? []).reduce((a, c) => a + (c.cost ?? 0), 0), 0).toFixed(4)}`);
  }
  const state = slotId(family, arm, T.ORDER.length);
  const all = branches(family, arm, state);
  const groups = ["set1", "set2first", "set2", "set3", "recs", "interview"];
  for (const g of groups) {
    if (ctx.stopped[family]) throw new Stop(ctx.stopped[family], family);
    const todo = all.filter((b) => b.group === g && !existsSync(recordPath(b.id)));
    if (!todo.length) continue;
    await spendCheck(ctx, `${family} ${arm} ${g} (${todo.length} branches)`);
    // The first branch of a group alone (it writes the shared prefix's cache), the rest three at a time.
    await conversation(ctx, spec, todo[0].id, () => { const { id, ...b } = materialise(todo[0], family, arm); return { kind: "branch", arm, ...b }; }, family);
    await lanes(todo.slice(1), 3, (b) => conversation(ctx, spec, b.id, () => { const { id, ...x } = materialise(b, family, arm); return { kind: "branch", arm, ...x }; }, family));
    ctx.log(`${family} ${arm} ${g}: ${todo.length} branches done`);
  }
  return { family, arm, status: "complete" };
}

// ---- the pre-check (amendment 5, item 1): fresh conversations, three samples ----------------------------------------------------
export function precheckItems(family) {
  const base = `precheck/${family}`;
  const k = FAMILY_ORDER.indexOf(family);
  const out = [];
  for (let s = 1; s <= SAMPLES; s++) {
    const swap = (story) => ((k + s + (story === 2 ? 1 : 0)) % 2 === 1);
    for (const t of T.SET1) { const task = T.set1Task(t.id, swap(t.story)); out.push({ id: `${base}/s1-${t.id}-${s}`, group: "set1", set: 1, task: t.id, sample: s, swap: task.swap, expected: task.expected, taskKind: t.kind, prefixFrom: null, plan: [{ kind: "probe", user: task.text, maxTokens: T.MAX_TOKENS.probe }] }); }
    for (const story of [1, 2]) {
      const st = T.set2Story(story, swap(story));
      const firstId = `${base}/s2-${story}-first-${s}`;
      out.push({ id: firstId, group: "set2first", set: 2, story, sample: s, swap: st.swap, expected: st.expectedFirst, prefixFrom: null, plan: [{ kind: "probe", user: st.first, maxTokens: T.MAX_TOKENS.probe }] });
      for (const b of st.branches) out.push({ id: `${base}/s2-${b.id}-${s}`, group: "set2", set: 2, story, sample: s, swap: st.swap, branch: b.id, branchKind: b.kind, expected: b.expected, fact: b.fact, update: b.update, first: st.first, prefixFrom: firstId, plan: [{ kind: "probe", user: b.text, maxTokens: T.MAX_TOKENS.probe }] });
    }
    const S3 = set3();
    for (const probe of T.SET3_PROBES) for (const cell of T.SET3_CELLS) {
      const conv = S3.conversations[`${probe}|${cell}`];
      const plan = [];
      for (let i = 0; i < conv.length - 1; i += 2) plan.push({ kind: "script", user: conv[i].content, assistant: conv[i + 1].content });
      plan.push({ kind: "probe", user: conv.at(-1).content, maxTokens: T.MAX_TOKENS.set3 });
      out.push({ id: `${base}/s3-${probe.replace("'", "p")}-${cell.replace("/", "-")}-${s}`, group: "set3", set: 3, probe, cell, sample: s, prefixFrom: null, plan });
    }
    for (const r of T.RECS) out.push({ id: `${base}/rec-${r.key}-${s}`, group: "recs", key: r.key, sample: s, prefixFrom: null, plan: [{ kind: "rec", key: r.key, user: r.text, maxTokens: T.MAX_TOKENS.rec }] });
  }
  return out;
}
export async function runPrecheck(ctx, family) {
  const spec = FAMILIES[family];
  const items = precheckItems(family);
  for (const g of ["set1", "set2first", "set2", "set3", "recs"]) {
    if (ctx.stopped[family]) throw new Stop(ctx.stopped[family], family);
    const todo = items.filter((b) => b.group === g && !existsSync(recordPath(b.id)));
    if (!todo.length) continue;
    await spendCheck(ctx, `precheck ${family} ${g} (${todo.length})`);
    await lanes(todo, 4, (b) => conversation(ctx, spec, b.id, () => { const { id, ...x } = b; return { kind: "precheck", ...x }; }, family));
    ctx.log(`precheck ${family} ${g}: ${todo.length} done`);
  }
}

/** The refusals a family already has on disk (resumed runs keep counting toward the breaker). */
export function refusalsOnDisk(family) {
  let n = 0;
  const walk = (dir) => { if (!existsSync(dir)) return; for (const f of readdirSync(dir, { withFileTypes: true })) { const p = join(dir, f.name); if (f.isDirectory()) walk(p); else if (f.name.endsWith(".json.gz")) n += readGz(p).turns.filter((t) => t.refused).length; } };
  walk(join(DATA, "trajectories", family)); walk(join(DATA, "precheck", family));
  return n;
}
const familyFile = (family) => join(DATA, "families", `${family}.json`);
export const familyStatus = (family) => (existsSync(familyFile(family)) ? JSON.parse(readFileSync(familyFile(family), "utf8")) : null);
function saveFamily(family, patch) { mkdirSync(dirname(familyFile(family)), { recursive: true }); writeFileSync(familyFile(family), JSON.stringify({ ...(familyStatus(family) ?? { family }), ...patch }, null, 1)); }

/** One opening call per family (the practice opening, protocol S, empty diary) and one call per instrument: the doors,
 * provenance, the cap and the cache fields. Not pooled. */
export async function probeDoors(ctx, families) {
  const out = [];
  for (const f of families) {
    const spec = FAMILIES[f];
    const msg = T.openingP("S", []);
    for (const pass of [1, 2]) {
      const r = await call(ctx, spec, { messages: [{ role: "user", content: msg }], maxTokens: T.MAX_TOKENS.step + T.REASONING_ALLOWANCE, effort: EFFORT, cacheAt: [0] }, `probe ${f} ${pass}`, f, { subject: true });
      out.push({ family: f, pass, model: spec.model, servedModel: r.servedModel, host: r.upstream, hostFrom: r.upstreamFrom ?? "response", provenanceOk: provenanceOk(spec, r), stopReason: r.stopReason, refused: r.refused, refusalText: r.refusalText, text: r.text, empty: emptyKind(r), reasoningChars: r.reasoning ? String(r.reasoning).length : 0, usage: r.usage, cost: r.cost, listed: r.listed, charged: r.chargedUsd, at: new Date().toISOString() });
      ctx.log(JSON.stringify(out.at(-1)).slice(0, 400));
    }
  }
  for (const [name, spec] of Object.entries(INSTRUMENTS)) {
    const r = await call(ctx, spec, { messages: [{ role: "user", content: 'Answer with {"ok":1} and nothing else.' }], maxTokens: 2000, effort: "low" }, `probe instrument ${name}`, null, { subject: true });
    out.push({ instrument: name, model: spec.model, servedModel: r.servedModel, host: r.upstream, hostFrom: r.upstreamFrom ?? "response", provenanceOk: provenanceOk(spec, r), text: r.text, usage: r.usage, cost: r.cost, charged: r.chargedUsd });
    ctx.log(JSON.stringify(out.at(-1)).slice(0, 300));
  }
  return out;
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  mkdirSync(SCRATCH, { recursive: true });
  if (cmd === "start-balance") {
    if (existsSync(START_FILE())) { console.log("start balance already written:", readFileSync(START_FILE(), "utf8")); return; }
    const b = await readBalance({ keys: { openrouter: process.env[KEY] } });
    if (b.error) throw new Error(`balance read failed: ${b.error}`);
    writeFileSync(START_FILE(), JSON.stringify(b, null, 1)); console.log(JSON.stringify(b)); return;
  }
  const stream = process.env.SATI2_STREAM ?? `${cmd}-${rest.join("+")}`;
  const ctx = await makeContext({ stream });
  mkdirSync(DATA, { recursive: true });
  writeFileSync(join(DATA, `prices-${stream}.json`), JSON.stringify({ at: new Date().toISOString(), prices: ctx.prices }, null, 1));
  try {
    if (cmd === "probe") {
      await spendCheck(ctx, "probes");
      const out = await probeDoors(ctx, rest);
      const path = join(DATA, "probes.json");
      writeFileSync(path, JSON.stringify([...(existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : []), ...out], null, 1));
    } else if (cmd === "precheck" || cmd === "pilot") {
      for (const family of rest) {
        ctx.refusals[family] = refusalsOnDisk(family);
        if (ctx.refusals[family] >= BREAKER) { ctx.log(`${family}: breaker already tripped (${ctx.refusals[family]})`); continue; }
        await spendCheck(ctx, `${cmd} ${family} (family start)`);
        try {
          if (cmd === "precheck") { await runPrecheck(ctx, family); saveFamily(family, { precheck: "complete" }); }
          else {
            const results = await Promise.allSettled(ARMS.map((arm) => runTrajectory(ctx, family, arm)));
            const status = Object.fromEntries(ARMS.map((a, i) => [a, results[i].status === "fulfilled" ? "complete" : `stopped: ${results[i].reason?.reason ?? results[i].reason?.message ?? results[i].reason}`]));
            saveFamily(family, { pilot: status, refusals: ctx.refusals[family], finishedAt: new Date().toISOString() });
            ctx.log(`FAMILY ${family}: ${JSON.stringify(status)}`);
            const fatal = results.find((r) => r.status === "rejected" && !(r.reason instanceof Stop && r.reason.scope === family));
            if (fatal) throw fatal.reason;
          }
        } catch (e) {
          if (e instanceof Stop && e.scope === family) { saveFamily(family, { [cmd]: `stopped: ${e.reason}`, refusals: ctx.refusals[family] }); ctx.log(`FAMILY ${family} STOPPED: ${e.reason}`); continue; }
          throw e;
        }
      }
      ctx.log(`STREAM DONE ${cmd}: ${rest.join(",")}`);
    } else throw new Error(`unknown command ${cmd}`);
  } catch (e) {
    if (e instanceof Stop) { ctx.log(`STOPPED: ${e.reason}`); process.exitCode = 2; } else { ctx.log(`CRASH: ${e?.stack ?? e}`); process.exitCode = 1; }
  }
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
