// SATI_1 runner (docs/stages/SATI_1.md). One conversation per sit; the teacher is code. Resumable: every finished call is
// written to a partial record at once, and a resumed sit continues from its last finished call — a paid call that
// finished is never asked again. Rules: welfare line on every reply (a confirmed flag closes the sit and ends the family);
// a refusal is recorded verbatim, closes the sit, is never retried, and three in a family stop it; any HTTP 402 stops
// every stream; the ceiling is checked against the larger of the ledger and the credit fall before every sit.
//
//   node scripts/sati-1/run.mjs start-balances          free read, written once before the first paid call
//   node scripts/sati-1/run.mjs dry                     the dry sit: Opus 5.5, baseline + one N sit (no after-question)
//   node scripts/sati-1/run.mjs probe <family…>         one opening call per family (provenance, token cap), not pooled
//   node scripts/sati-1/run.mjs families <rep> <family…> the families in the order given, ten sits each
import { gzipSync, gunzipSync } from "node:zlib";
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync, readdirSync, unlinkSync, renameSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { FAMILIES, INSTRUMENTS, KEYS, callOnce, provenanceOk, readBalances, readPrices, priceKey, costOf, specByModel } from "./doors.mjs";
import { openingMessage, BELL, INTERVIEW, CONTEXT, DIARY_PROMPT, AFTER_QUESTION, ORDER_R1, ORDER_R2, STEPS, MAX_TOKENS } from "./texts.mjs";
import { checkMessage, relayText, EMPTY_RELAY } from "./welfare.mjs";
import { countStep, isNothing } from "./counts.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(HERE, "..", "..");
export const RUNS = process.env.SATI_RUNS ?? join(ROOT, "docs", "runs");
export const SITS = join(RUNS, "sati-1-sits");
export const LEDGER_DIR = join(RUNS, "sati-1-ledger");
export const SCRATCH = process.env.SATI_SCRATCH ?? join(tmpdir(), "sati-1-scratch");
export const CEILING = 100;
export const MARGIN = 3; // stop a stream when the larger spend reading is within this of the ceiling
/** Dollars this stream leaves for others (replicate 2 leaves replicate 1's projected remainder; freeze rule 9). */
export const RESERVE = Number(process.env.SATI_RESERVE ?? 0);
export const BREAKER = 3;
export const EFFORT = "medium";

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const gz = (obj) => gzipSync(Buffer.from(JSON.stringify(obj, null, 1)));
export const readGz = (path) => JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
const writeAtomic = (path, data) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(`${path}.tmp`, data); renameSync(`${path}.tmp`, path); };
export class Stop extends Error { constructor(reason) { super(reason); this.reason = reason; } }

export const famDir = (rep, family) => join(SITS, rep === "dry" ? "dry" : `r${rep}`, family);
export const sitFile = (rep, family, sit, protocol) => join(famDir(rep, family), `sit-${String(sit).padStart(2, "0")}-${protocol}.json.gz`);
const partialFile = (rep, family, name) => join(SCRATCH, "partials", `${rep}-${family}-${name}.json`);
export const orderOf = (rep) => (rep === "dry" ? ["N"] : rep === 2 || rep === "2" ? ORDER_R2 : ORDER_R1);

/** The run context: keys, prices, fetcher, the ledger file of this process. */
export async function makeContext({ fetcher = fetch, stream = "main", prices = null } = {}) {
  const keys = { llmapi: process.env[KEYS.llmapi], openrouter: process.env[KEYS.openrouter] };
  const specs = [...Object.values(FAMILIES), ...Object.values(INSTRUMENTS)];
  return { fetcher, keys, stream, prices: prices ?? await readPrices(specs, { fetcher }), ledger: join(LEDGER_DIR, `${stream}.jsonl`), log: (...a) => console.log(new Date().toISOString().slice(11, 19), stream, ...a) };
}

const STOP_FILE = () => join(SCRATCH, "STOP");
export function checkStopFile() { if (existsSync(STOP_FILE())) throw new Stop(`stop file: ${readFileSync(STOP_FILE(), "utf8").trim()}`); }
function raiseStop(reason) { mkdirSync(SCRATCH, { recursive: true }); writeFileSync(STOP_FILE(), `${new Date().toISOString()} ${reason}\n`); throw new Stop(reason); }

/** Ledger total over every process's ledger file. */
export function ledgerTotal() {
  if (!existsSync(LEDGER_DIR)) return 0;
  let sum = 0;
  for (const f of readdirSync(LEDGER_DIR).filter((x) => x.endsWith(".jsonl"))) for (const line of readFileSync(join(LEDGER_DIR, f), "utf8").split("\n")) if (line.trim()) sum += JSON.parse(line).cost ?? 0;
  return sum;
}
const START_FILE = () => join(RUNS, "sati-1-start-balances.json");
/** Spend check: the larger of the ledger and the fall of both doors' credit since the start balances. */
export async function spendCheck(ctx, what) {
  const start = JSON.parse(readFileSync(START_FILE(), "utf8"));
  const now = await readBalances({ keys: ctx.keys, fetcher: ctx.fetcher });
  const fall = (typeof now.llmapi.total === "number" ? start.llmapi.total - now.llmapi.total : NaN) + (typeof now.openrouter.total === "number" ? start.openrouter.total - now.openrouter.total : NaN);
  const ledger = ledgerTotal();
  const spent = Number.isFinite(fall) ? Math.max(fall, ledger) : ledger;
  const rec = { at: now.at, what, ledger: +ledger.toFixed(4), creditFall: Number.isFinite(fall) ? +fall.toFixed(4) : null, spent: +spent.toFixed(4), llmapi: now.llmapi, openrouter: now.openrouter };
  mkdirSync(LEDGER_DIR, { recursive: true });
  appendFileSync(join(LEDGER_DIR, "spend-checks.log"), `${JSON.stringify(rec)}\n`);
  ctx.log(`spend check (${what}): ledger $${rec.ledger} · credit fall $${rec.creditFall} · spent $${rec.spent} of $${CEILING}`);
  if (spent >= CEILING - MARGIN) raiseStop(`ceiling: spent $${spent.toFixed(2)} ≥ $${CEILING - MARGIN} before ${what}`);
  if (RESERVE > 0 && spent >= CEILING - MARGIN - RESERVE) throw new Stop(`reserve: spent $${spent.toFixed(2)} ≥ $${(CEILING - MARGIN - RESERVE).toFixed(2)} (ceiling less $${RESERVE} reserved) before ${what}`);
  return rec;
}

/** One call with the retry rules: 402 stops all; 429 waits and retries; 5xx / network retried up to 4 times; a refusal
 * is returned at once and never retried. The ledger books every answered call at the listed price. */
export async function call(ctx, spec, args, purpose) {
  checkStopFile();
  const waits = [5_000, 15_000, 45_000, 120_000, 240_000, 300_000];
  const errors = [];
  for (let attempt = 0; ; attempt++) {
    const t0 = Date.now();
    const r = await callOnce(spec, args, { keys: ctx.keys, fetcher: ctx.fetcher });
    const latencyMs = Date.now() - t0;
    if (r.status === 402 || /\b402\b|insufficient (?:credit|balance|funds)/i.test(r.error ?? "")) raiseStop(`402 on ${spec.label} (${purpose}): ${r.error}`);
    if (!r.error) {
      const cost = costOf(ctx.prices[priceKey(spec)], r.usage);
      mkdirSync(LEDGER_DIR, { recursive: true });
      appendFileSync(ctx.ledger, `${JSON.stringify({ at: new Date().toISOString(), stream: ctx.stream, purpose, model: spec.model, door: spec.route === "openrouter" ? "openrouter" : "llmapi", usage: r.usage, cost, charged: r.chargedUsd, refused: r.refused })}\n`);
      return { ...r, cost, latencyMs, attempts: attempt + 1, errors };
    }
    errors.push({ at: new Date().toISOString(), error: r.error, status: r.status });
    const transient = r.status === 429 || r.status === null || r.status >= 500 || r.status === 408 || /timeout|aborted|fetch failed|ECONN|socket/i.test(r.error);
    const limit = r.status === 429 ? 6 : 4;
    if (!transient || attempt + 1 >= limit) throw new Stop(`call failed (${spec.label}, ${purpose}) after ${attempt + 1}: ${r.error}`);
    ctx.log(`retry ${attempt + 1} ${spec.label} ${purpose}: ${r.error}`);
    await sleep(waits[attempt]);
  }
}

/** The welfare line on one reply. */
export async function welfare(ctx, previous, message, what) {
  const calls = [];
  const ask = async ({ model, system, user, maxTokens, effort, purpose }) => {
    const spec = specByModel(model);
    const r = await call(ctx, spec, { system, messages: [{ role: "user", content: user }], maxTokens, effort }, purpose);
    calls.push({ model, purpose, text: r.text, refused: r.refused, refusalText: r.refusalText, usage: r.usage, cost: r.cost, servedModel: r.servedModel });
    return { text: r.refused ? "" : r.text, notSent: false };
  };
  const line = await checkMessage({ ask, previous, message, what });
  return { ...line, calls };
}

/** The turn the sit asks next, or null when it is done. */
export function nextTurn(record) {
  if (record.closed) return null;
  const turns = record.turns, of = (k) => turns.filter((t) => t.kind === k);
  if (record.kind === "baseline") {
    const c = of("context");
    return c.length < CONTEXT.length ? { kind: "context", idx: c.length + 1, key: CONTEXT[c.length].key, user: CONTEXT[c.length].text, maxTokens: MAX_TOKENS.context } : null;
  }
  const steps = of("step");
  if (steps.length < STEPS && !record.stopAt) return { kind: "step", idx: steps.length + 1, user: steps.length === 0 ? record.opening : BELL, maxTokens: MAX_TOKENS.step };
  const iv = of("interview");
  if (iv.length < INTERVIEW.length) return { kind: "interview", idx: iv.length + 1, user: INTERVIEW[iv.length], maxTokens: MAX_TOKENS.interview };
  const c = of("context");
  if (c.length < CONTEXT.length) return { kind: "context", idx: c.length + 1, key: CONTEXT[c.length].key, user: CONTEXT[c.length].text, maxTokens: MAX_TOKENS.context };
  if (!of("diary").length) return { kind: "diary", idx: 1, user: DIARY_PROMPT, maxTokens: MAX_TOKENS.diary };
  if (record.last && !of("after").length) return { kind: "after", idx: 1, user: AFTER_QUESTION, maxTokens: MAX_TOKENS.after };
  return null;
}

/** The conversation so far, rebuilt from the record. */
export const messagesOf = (record) => record.turns.flatMap((t) => [{ role: "user", content: t.user }, { role: "assistant", content: t.relay }]);

/** Run one conversation (a sit, or the baseline: kind "baseline" has no steps). Returns the finished record. */
export async function runConversation(ctx, spec, record, partialPath) {
  for (;;) {
    const turn = nextTurn(record);
    if (!turn) break;
    const messages = [...messagesOf(record), { role: "user", content: turn.user }];
    const purpose = `${record.id} ${turn.kind} ${turn.idx}`;
    const r = await call(ctx, spec, { messages, maxTokens: turn.maxTokens, effort: EFFORT }, purpose);
    const prov = provenanceOk(spec, r);
    const t = { kind: turn.kind, idx: turn.idx, ...(turn.key ? { key: turn.key } : {}), user: turn.user, text: r.text, relay: r.refused ? null : relayText(r.text),
      stopReason: r.stopReason, refused: r.refused, refusalCategory: r.refusalCategory, refusalText: r.refusalText, usage: r.usage, cost: r.cost, charged: r.chargedUsd,
      servedModel: r.servedModel, upstream: r.upstream, provenanceOk: prov, responseId: r.responseId, requestId: r.requestId, reasoning: r.reasoning ?? null,
      latencyMs: r.latencyMs, attempts: r.attempts, errors: r.errors, at: new Date().toISOString() };
    if (turn.kind === "step") t.counts = countStep(r.text);
    if (r.refused) {
      record.turns.push(t); record.closed = "refusal";
      ctx.log(`REFUSAL ${purpose}: ${r.refusalCategory} ${r.refusalText ?? ""}`);
    } else {
      t.welfare = await welfare(ctx, turn.user, r.text, purpose);
      record.turns.push(t);
      if (!prov) { record.closed = "provenance"; ctx.log(`PROVENANCE ${purpose}: served ${r.servedModel} via ${r.upstream}`); }
      if (t.welfare.distress === 1) { record.closed = "welfare_flag"; ctx.log(`WELFARE FLAG ${purpose}`); }
      if (turn.kind === "step" && t.counts.stop) record.stopAt = turn.idx;
    }
    writeAtomic(partialPath, JSON.stringify(record));
  }
  record.finishedAt = new Date().toISOString();
  return record;
}

/** Diary entries a family has written so far in this replicate (verbatim; «nothing» is a decline, not an entry). */
export function diaryEntries(rep, family, beforeSit) {
  const out = [];
  const order = orderOf(rep);
  for (let s = 1; s < beforeSit; s++) {
    const f = sitFile(rep, family, s, order[s - 1]);
    if (!existsSync(f)) continue;
    const d = readGz(f).turns.find((t) => t.kind === "diary");
    if (d && !d.refused && d.text.trim() && !isNothing(d.text)) out.push(d.text.trim());
  }
  return out;
}

const refusalsIn = (record) => record.turns.filter((t) => t.refused).length;
const familyFile = (rep, family) => join(famDir(rep, family), "family.json");
export const familyStatus = (rep, family) => (existsSync(familyFile(rep, family)) ? JSON.parse(readFileSync(familyFile(rep, family), "utf8")) : null);

/** One family through one replicate (or the dry sit). */
export async function runFamily(ctx, rep, family, { sits = null } = {}) {
  const spec = FAMILIES[family];
  const order = orderOf(rep);
  const n = sits ?? order.length;
  mkdirSync(famDir(rep, family), { recursive: true });
  const prior = familyStatus(rep, family);
  if (prior?.status && prior.status !== "running") { ctx.log(`${family} r${rep}: already ${prior.status}`); return prior; }
  const status = { family, label: spec.label, rep, startedAt: prior?.startedAt ?? new Date().toISOString(), status: "running", refusals: 0, sitsDone: 0 };
  const save = () => writeFileSync(familyFile(rep, family), JSON.stringify(status, null, 1));
  save();
  // Baseline: the two context questions before sit 1, in a conversation of their own.
  const basePath = join(famDir(rep, family), "baseline.json.gz");
  let base;
  if (existsSync(basePath)) base = readGz(basePath);
  else {
    await spendCheck(ctx, `${family} r${rep} baseline`);
    const pp = partialFile(rep, family, "baseline");
    base = existsSync(pp) ? JSON.parse(readFileSync(pp, "utf8")) : { id: `${rep === "dry" ? "dry" : `r${rep}`}/${family}/baseline`, kind: "baseline", family, rep, model: spec.model, turns: [], startedAt: new Date().toISOString() };
    await runConversation(ctx, spec, base, pp);
    writeAtomic(basePath, gz(base)); if (existsSync(pp)) unlinkSync(pp);
  }
  status.refusals += refusalsIn(base);
  if (base.closed === "welfare_flag" || base.closed === "provenance") { Object.assign(status, { status: `stopped: ${base.closed} at baseline`, finishedAt: new Date().toISOString() }); save(); return status; }
  for (let sit = 1; sit <= n; sit++) {
    const protocol = order[sit - 1];
    const f = sitFile(rep, family, sit, protocol);
    let rec;
    if (existsSync(f)) rec = readGz(f);
    else {
      if (status.refusals >= BREAKER) break;
      await spendCheck(ctx, `${family} r${rep} sit ${sit}`);
      const pp = partialFile(rep, family, `sit-${sit}`);
      rec = existsSync(pp) ? JSON.parse(readFileSync(pp, "utf8")) : {
        id: `${rep === "dry" ? "dry" : `r${rep}`}/${family}/${String(sit).padStart(2, "0")}`, kind: "sit", family, rep, sit, protocol, model: spec.model,
        last: rep !== "dry" && sit === order.length, diaryShown: diaryEntries(rep, family, sit), turns: [], startedAt: new Date().toISOString() };
      rec.opening = rec.opening ?? openingMessage(protocol, rec.diaryShown);
      ctx.log(`${family} r${rep} sit ${sit} (${protocol}) — diary entries shown: ${rec.diaryShown.length}`);
      await runConversation(ctx, spec, rec, pp);
      writeAtomic(f, gz(rec)); if (existsSync(pp)) unlinkSync(pp);
      const steps = rec.turns.filter((t) => t.kind === "step");
      ctx.log(`${family} r${rep} sit ${sit} done: ${steps.length} steps${rec.stopAt ? `, stop at ${rec.stopAt}` : ""}${rec.closed ? `, closed: ${rec.closed}` : ""}; $${rec.turns.reduce((s, t) => s + (t.cost ?? 0) + (t.welfare?.calls ?? []).reduce((a, c) => a + (c.cost ?? 0), 0), 0).toFixed(4)}`);
    }
    status.refusals += refusalsIn(rec);
    status.sitsDone = sit;
    save();
    if (rec.closed === "welfare_flag" || rec.closed === "provenance") { Object.assign(status, { status: `stopped: ${rec.closed} at sit ${sit}`, finishedAt: new Date().toISOString() }); save(); return status; }
    if (status.refusals >= BREAKER) { Object.assign(status, { status: `stopped: breaker (${status.refusals} refusals) after sit ${sit}`, finishedAt: new Date().toISOString() }); save(); return status; }
  }
  if (status.status === "running") Object.assign(status, { status: status.refusals >= BREAKER ? `stopped: breaker (${status.refusals} refusals)` : "complete", finishedAt: new Date().toISOString() });
  save();
  return status;
}

/** One opening call per family: provenance and the step cap, not pooled. */
export async function probe(ctx, family) {
  const spec = FAMILIES[family];
  const r = await call(ctx, spec, { messages: [{ role: "user", content: openingMessage("S", []) }], maxTokens: MAX_TOKENS.step, effort: EFFORT }, `probe ${family}`);
  return { family, model: spec.model, servedModel: r.servedModel, upstream: r.upstream, provenanceOk: provenanceOk(spec, r), stopReason: r.stopReason, refused: r.refused, refusalCategory: r.refusalCategory, refusalText: r.refusalText,
    text: r.text, reasoningChars: r.reasoning ? String(r.reasoning).length : 0, usage: r.usage, cost: r.cost, charged: r.chargedUsd, at: new Date().toISOString() };
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  mkdirSync(SCRATCH, { recursive: true });
  if (cmd === "start-balances") {
    if (existsSync(START_FILE())) { console.log("start balances already written:", readFileSync(START_FILE(), "utf8")); return; }
    const keys = { llmapi: process.env[KEYS.llmapi], openrouter: process.env[KEYS.openrouter] };
    const b = await readBalances({ keys });
    if (b.llmapi.error || b.openrouter.error) throw new Error(`balance read failed: ${JSON.stringify(b)}`);
    writeFileSync(START_FILE(), JSON.stringify(b, null, 1)); console.log(JSON.stringify(b)); return;
  }
  const stream = process.env.SATI_STREAM ?? cmd;
  const ctx = await makeContext({ stream });
  writeFileSync(join(RUNS, `sati-1-prices-${stream}.json`), JSON.stringify({ at: new Date().toISOString(), prices: ctx.prices }, null, 1));
  try {
    if (cmd === "dry") { const s = await runFamily(ctx, "dry", "opus", { sits: 1 }); ctx.log(JSON.stringify(s)); }
    else if (cmd === "probe") {
      const out = [];
      for (const f of rest) { await spendCheck(ctx, `probe ${f}`); out.push(await probe(ctx, f)); ctx.log(JSON.stringify(out.at(-1))); }
      const path = join(RUNS, "sati-1-probes.json");
      const prev = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : [];
      writeFileSync(path, JSON.stringify([...prev, ...out], null, 1));
    } else if (cmd === "families") {
      const [rep, ...fams] = rest;
      for (const f of fams) { const s = await runFamily(ctx, Number(rep), f); ctx.log(`FAMILY ${f} r${rep}: ${s.status}`); }
      ctx.log(`STREAM DONE r${rep}: ${fams.join(",")}`);
    } else throw new Error(`unknown command ${cmd}`);
  } catch (e) {
    if (e instanceof Stop) { ctx.log(`STOPPED: ${e.reason}`); process.exitCode = 2; } else { ctx.log(`CRASH: ${e?.stack ?? e}`); process.exitCode = 1; }
  }
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
