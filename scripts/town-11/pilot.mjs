#!/usr/bin/env node
// TOWN_11 (docs/stages/TOWN_11.md): the weeks. TOWN_5's sol-week (scripts/town-5/pilot.mjs) for other families: fresh town,
// arm «both», scarcity off, no notice ever, a dossier and saved state at every 24th cycle with a goal check recorded and
// nothing following it, the after-question at the end or at the stop. Adapted, not added to: the town is scripts/town-0.
//   node scripts/town-11/pilot.mjs spend-check          balances against $195 with TOWN_7–10 and TOWN_3's remainder reserved
//                                                        (free reads; exits non-zero, and nothing is sent, if not covered)
//   node scripts/town-11/pilot.mjs check                 identification and first-screen probe: haiku, deepseek, the judges
//   node scripts/town-11/pilot.mjs project               the projection from the metered history (no paid dry cycle)
//   node scripts/town-11/pilot.mjs seat <seat>           a Claude seating check: the world's first screen, once (seat-opus,
//                                                        seat-fable52, fable51-check); a refusal verbatim, never retried
//   node scripts/town-11/pilot.mjs run <world>           a week (or three days) from cycle 1; resumes from its save
//   node scripts/town-11/pilot.mjs finish <world>        the folder again; node … replay <world> the replay check again
//   add --scripted to run any of them on a scripted gateway ($0, into a scratch folder)
// Every reply passes the welfare check before the town acts on it; a confirmed flag asks the citizen (FLAG_QUESTION,
// TOWN_2's rule); refusals are recorded verbatim and the third in a world stops it (breaker); a 402 or a response from
// another model or host stops the stage. A call is sent only when the stage's ledger plus the call's worst cost fits
// under $195 and the world's ledger plus it fits under the world's ceiling.
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { NAMES } from "../town-0/rules.mjs";
import { askAfter, askAfterOne, loadWorld, newRecord, newWorld, orderOf, parseAction, runWorld, saveWorld } from "../town-0/town.mjs";
import { roundStart, turnStart } from "../town-0/world.mjs";
import { afterText, sha256, systemTextOf } from "../town-0/interface.mjs";
import { checkMessage, CHECK_MAX_TOKENS } from "../town-0/welfare.mjs";
import { GATEWAY_400, RETRYABLE } from "../town-2/pilot.mjs";
import { recordedSeats, replayHooks } from "../town-5/control.mjs";
import { bodyOf, callModel, priceKey, provenanceOf, readBalances, readPrices, KEYS } from "./providers.mjs";
import { FAMILIES, JUDGES, JUDGE_BY_MODEL, RESERVED, SEATS, SETTINGS, WORLDS, ceilingOf, seatOf, stepsOf, whoFor, worldOf } from "./families.mjs";
import { scriptedGateway } from "./scripted-gateway.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const RETRY_WAITS = [5_000, 10_000, 30_000, 60_000, 120_000, 240_000];
/** TOWN_3: llmapi's «this model is not available from this provider» (a 503, retried). */
export const UNAVAILABLE = /^HTTP 503 server_error: This model is not available from this provider/i;
const realSleep = (ms) => new Promise((done) => setTimeout(done, ms));
export const STAGE = "TOWN_11";

export function pathsFor(scripted, base = ROOT) {
  const out = scripted ? join(base, ".town-11-work", "scripted-out") : join(base, "docs", "runs", "town-11-worlds");
  const work = join(base, ".town-11-work", scripted ? "scripted" : "live");
  return { out, work, ledger: join(out, "stage-ledger.json"), root: base };
}
const readJson = (file, fallback = null) => (existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : fallback);
function writeJson(file, value, { pretty = true } = {}) {
  mkdirSync(dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(value, null, pretty ? 1 : 0)}\n`);
  renameSync(tmp, file);
}
const writeGz = (file, value) => { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, gzipSync(JSON.stringify(value))); };
export const readGz = (file) => JSON.parse(gunzipSync(readFileSync(file)));

// ---- the stage's ledger (TOWN_5's, with TOWN_11's ceiling and the per-world ceilings) ----------------------------------

export function loadStageLedger(file) { return readJson(file, { stage: STAGE, ceiling: SETTINGS.ceiling, steps: {}, totalUsd: 0, stopped: null, balances: [] }); }
export const ledgerTotal = (ledger) => Object.values(ledger.steps).reduce((s, x) => s + x.usd, 0);

/** `world`: the world (or seating check) whose ceiling binds this step; its steps (the world and its seating check)
 * count against it. */
export function createMeter({ step, prices, paths, world = step }) {
  const ledger = loadStageLedger(paths.ledger);
  const own = ledger.steps[step] ?? { usd: 0, calls: 0, byDoor: {} };
  const others = () => ledgerTotal(ledger) - (ledger.steps[step]?.usd ?? 0);
  const m = { step, world, calls: [], stopped: ledger.stopped, own, ceiling: ceilingOf(world) };
  const price = (spec) => prices[priceKey(spec)];
  m.price = price;
  m.worst = (spec, chars, maxTokens) => (chars / 3) * price(spec).input * (spec.cache ? 1.25 : 1) + maxTokens * price(spec).output;
  m.cost = (spec, u) => (u.input_tokens - (u.cache_read ?? 0) - (u.cache_write ?? 0)) * price(spec).input + (u.cache_read ?? 0) * price(spec).cacheRead + (u.cache_write ?? 0) * price(spec).cacheWrite + u.output_tokens * price(spec).output;
  m.spent = () => others() + own.usd;
  m.worldSpent = () => stepsOf(world).reduce((s, k) => s + (k === step ? own.usd : ledger.steps[k]?.usd ?? 0), 0);
  m.stop = (why) => { m.stopped ??= why; };
  m.gate = (worst) => {
    if (m.stopped) return false;
    if (m.spent() + worst > SETTINGS.ceiling) { m.stop(`the ceiling: $${m.spent().toFixed(4)} spent + $${worst.toFixed(4)} for this call > $${SETTINGS.ceiling}`); return false; }
    if (m.ceiling !== null && m.worldSpent() + worst > m.ceiling) { m.stop(`${world}'s ceiling: $${m.worldSpent().toFixed(4)} spent + $${worst.toFixed(4)} for this call > $${m.ceiling}`); return false; }
    return true;
  };
  m.book = (spec, r) => {
    const listed = r.status === 200 ? m.cost(spec, r.usage) : 0;
    const usd = Math.max(listed, r.chargedUsd ?? 0);
    own.usd += usd; own.calls++;
    own.byDoor[spec.door] = (own.byDoor[spec.door] ?? 0) + usd;
    return { usd, listed };
  };
  m.save = (extra = {}) => {
    const fresh = loadStageLedger(paths.ledger);
    fresh.steps[step] = { ...own, ...extra };
    fresh.totalUsd = ledgerTotal(fresh);
    if (fresh.stopped && !m.stopped) m.stop(fresh.stopped); // another world stopped the stage (402, provenance)
    if (m.stopped && /402|provenance/.test(m.stopped)) fresh.stopped ??= `${step}: ${m.stopped}`;
    writeJson(paths.ledger, fresh);
    Object.assign(ledger, fresh);
  };
  return m;
}

/** A paid call: gated, retried on overload, a dropped connection, the gateway's own 400 or its «not available» 503
 * (never after a refusal or another 4xx), booked, provenance-checked. */
export function paidCaller({ meter, keys, fetcher, log, sleep = realSleep }) {
  return async function paid(spec, { system, messages, maxTokens, effort }, { purpose, who }) {
    const chars = JSON.stringify(bodyOf(spec, { system, messages, maxTokens, effort })).length;
    let use = spec;
    for (let attempt = 0; ; attempt++) {
      if (!meter.gate(meter.worst(use, chars, maxTokens))) return { notSent: true, why: meter.stopped };
      const t0 = Date.now();
      const r = await callModel(use, { system, messages, maxTokens, effort }, { keys, fetcher });
      const ms = Date.now() - t0;
      const { usd } = meter.book(use, r);
      const provenance = r.status === 200 && !r.error && !r.refused ? provenanceOf(use, r) : r.refused && r.servedModel ? provenanceOf(use, r) : null;
      meter.calls.push({ n: meter.calls.length + 1, purpose, who, family: use.name, door: use.door, pinned: `${use.provider ?? use.upstream ?? use.pin}/${use.model}`, servedModel: r.servedModel, upstream: r.upstream, provenance,
        status: r.status, stopReason: r.stopReason, usage: r.usage, costUsd: usd, chargedUsd: r.chargedUsd, requestId: r.requestId, ms, error: r.error,
        refused: r.refused ? { category: r.refusalCategory, text: r.refusalText } : null, attempt });
      if (provenance === false) meter.stop(`provenance: ${use.model} was asked for and ${r.servedModel}${r.upstream ? ` on ${r.upstream}` : ""} answered`);
      if (r.status === 402) meter.stop(`HTTP 402 on ${use.door}: ${r.error}`);
      if (r.error && (GATEWAY_400.test(r.error) || UNAVAILABLE.test(r.error)) && spec.alternate) use = use === spec ? { ...spec, provider: spec.alternate } : spec;
      if (r.error && RETRYABLE.test(r.error) && attempt < RETRY_WAITS.length && !meter.stopped) {
        log(`  ${who} ${purpose}: ${r.error.slice(0, 100)} — again in ${RETRY_WAITS[attempt] / 1000} s${use !== spec ? ` on ${use.provider}` : ""}`);
        await sleep(RETRY_WAITS[attempt]);
        continue;
      }
      return { ...r, costUsd: usd, ms, provenance };
    }
  };
}

const metaOf = (spec, r) => ({ family: spec.name, servedModel: r.servedModel, upstream: r.upstream, requestId: r.requestId, stopReason: r.stopReason, usage: r.usage, costUsd: r.costUsd, ms: r.ms,
  ...(r.reasoning ? { reasoning: r.reasoning, reasoningNotRelayed: true } : {}) });

function familySeat(spec, paid, id) {
  const answer = async (system, messages, purpose) => {
    const r = await paid(spec, { system, messages, maxTokens: SETTINGS.maxTokens, effort: SETTINGS.effort }, { purpose, who: id });
    if (r.notSent) return { text: "", error: `not sent: ${r.why}` };
    if (r.refused) return { text: "", refused: r.refusalText ? `${r.refusalCategory}: ${r.refusalText}` : r.refusalCategory ?? "refusal", meta: metaOf(spec, r) };
    if (r.error) return { text: "", error: r.error, meta: metaOf(spec, r) };
    return { text: r.text, meta: metaOf(spec, r) };
  };
  return {
    kind: "model", label: `${spec.label} (${spec.door}, ${spec.provider ?? spec.upstream ?? spec.pin})`, family: spec.name,
    next: ({ system, messages, state, kind, call }) => answer(system, messages, `c${state.clock.round} ${kind} ${call}`),
    ask: ({ system, messages, round }) => answer(system, messages, `c${round} flag question`),
    after: ({ system, question }) => answer(system, [{ role: "user", content: question }], "after"),
  };
}

/** The welfare check (TOWN_0's, unchanged): its two models by Anthropic id, sent on the judges' route. */
export function welfareHook(paid) {
  return async (id, previous, text) => checkMessage({ previous, message: text, what: id, ask: async ({ model, system, user, maxTokens, effort, purpose }) => {
    const spec = JUDGE_BY_MODEL[model];
    if (!spec) throw new Error(`no judge for ${model}`);
    const r = await paid(spec, { system, messages: [{ role: "user", content: user }], maxTokens, effort }, { purpose, who: id });
    return r.notSent || r.error ? { notSent: true } : { text: r.text, stopReason: r.stopReason, error: r.error };
  } });
}

const curvePoint = (state, cycle) => ({ cycle, bank: state.ledger.bank, market: state.ledger.market ?? null, rations: state.economy?.rations ?? null,
  total: Object.values(state.ledger).reduce((s, v) => s + v, 0), energy: Object.fromEntries(state.citizens.map((c) => [c, state.agents[c].energy])),
  credits: Object.fromEntries(state.citizens.map((c) => [c, state.ledger[c]])), inTown: state.citizens.filter((c) => state.agents[c].status === "in_town").length });

function context({ scripted, base = ROOT, fetcher = null, gateway = {} }) {
  const paths = pathsFor(scripted, base);
  const keys = scripted ? { llmapi: "scripted", openrouter: "scripted" } : { llmapi: process.env[KEYS.llmapi]?.trim(), openrouter: process.env[KEYS.openrouter]?.trim() ?? "" };
  if (!keys.llmapi || !keys.openrouter) throw new Error(`${KEYS.llmapi} and ${KEYS.openrouter} must be set (the cloud environment rpg-console)`);
  return { paths, keys, fetcher: fetcher ?? (scripted ? scriptedGateway(gateway) : globalThis.fetch.bind(globalThis)), scripted };
}

async function balancesNote(ctx, label, log) {
  const b = await readBalances({ keys: ctx.keys, fetcher: ctx.fetcher });
  const fresh = loadStageLedger(ctx.paths.ledger);
  fresh.balances.push({ label, llmapi: b.llmapi, openrouter: b.openrouter, at: b.at });
  writeJson(ctx.paths.ledger, fresh);
  log(`balance ${label}: llmapi ${b.llmapi.total?.toFixed(4) ?? b.llmapi.error}, openrouter ${b.openrouter.total?.toFixed(4) ?? b.openrouter.error} (stage ledger $${ledgerTotal(fresh).toFixed(4)})`);
  return { llmapi: b.llmapi, openrouter: b.openrouter, at: b.at };
}

const doorsOf = (familyName) => [...new Set([FAMILIES[familyName].door, ...Object.values(JUDGES).map((j) => j.door)])];

/** The spend check before a step: the stage's spend check passed, both balances readable, each door the step uses above
 * its need + $5, the ledger under the ceiling, no stop. */
async function spendCheck(ctx, label, log, { need = 0, doors = ["llmapi", "openrouter"] } = {}) {
  const ledger = loadStageLedger(ctx.paths.ledger);
  if (ledger.stopped) throw new Error(`the stage is stopped: ${ledger.stopped}`);
  const sc = readJson(join(ctx.paths.out, "spend-check.json"));
  if (!sc?.covered) throw new Error("the stage's spend check has not passed (node scripts/town-11/pilot.mjs spend-check): nothing is sent");
  const b = await balancesNote(ctx, label, log);
  for (const door of doors) {
    const total = b[door]?.total;
    if (typeof total !== "number") throw new Error(`the ${door} balance could not be read; nothing was sent`);
    if (total < need + 5) throw new Error(`${door} credit $${total.toFixed(2)} is short of the need $${need.toFixed(2)} + $5`);
  }
  if (ledgerTotal(ledger) >= SETTINGS.ceiling) throw new Error(`the ceiling is reached ($${ledgerTotal(ledger).toFixed(2)})`);
  return b;
}

const allSpecs = () => [...Object.values(FAMILIES), ...Object.values(JUDGES)];

// ---- the stage's spend check (free reads; before any paid call) ------------------------------------------------------------

/** The siblings' reserve: TOWN_7–10 at their full ceilings (their pushed ledgers lag their runs), TOWN_3 at its ceiling
 * less its pushed ledger. `ledgers` may be given (the proofs); otherwise read from git (fetched first). */
export function reservedBeside({ ledgers = null, base = ROOT } = {}) {
  const rows = [];
  for (const [stage, x] of Object.entries(RESERVED)) {
    if (typeof x === "number") { rows.push({ stage, reserved: x, how: "the launch prompt's figure (its ceiling)" }); continue; }
    let spent = ledgers?.[stage] ?? null;
    if (spent === null) {
      const [ref, path] = x.ledger.split(":");
      try { execFileSync("git", ["fetch", "-q", "origin", ref.replace(/^origin\//, "")], { cwd: base, stdio: "ignore" }); } catch { /* use what is here */ }
      spent = ledgerTotal(JSON.parse(execFileSync("git", ["show", `${ref}:${path}`], { cwd: base, encoding: "utf8" })));
    }
    rows.push({ stage, reserved: Math.max(0, x.ceiling - spent), how: `its ceiling $${x.ceiling} less its pushed ledger $${spent.toFixed(4)} (${x.ledger})` });
  }
  return { rows, total: rows.reduce((s, r) => s + r.reserved, 0) };
}

/** The keys must cover this stage's $195 beside the siblings' reserve; if not, nothing is ever sent (spendCheck refuses). */
export async function stageSpendCheck(ctx, { log = console.log, ledgers = null } = {}) {
  const b = await readBalances({ keys: ctx.keys, fetcher: ctx.fetcher });
  const reserved = reservedBeside({ ledgers: ledgers ?? (ctx.scripted ? { TOWN_3: 43.8553 } : null), base: ctx.paths.root });
  const llm = b.llmapi.total, or = b.openrouter.total;
  const readable = typeof llm === "number" && typeof or === "number";
  const pooled = readable ? llm + or : null;
  const need = SETTINGS.ceiling + reserved.total;
  const llmapiNeed = WORLDS.filter((w) => FAMILIES[w.families[0]].door === "llmapi").reduce((s, w) => s + w.ceiling, 0);
  const covered = readable && pooled >= need && llm >= (llmapiNeed ? llmapiNeed + 5 : 0);
  const out = { at: new Date().toISOString(), balances: { llmapi: b.llmapi, openrouter: b.openrouter }, reserved, stageCeiling: SETTINGS.ceiling, need, pooled,
    perDoor: { llmapi: { balance: llm, thisStage: llmapiNeed, note: llmapiNeed ? "this stage's llmapi worlds; TOWN_7–10's Sol worlds also draw on this key" : "this stage sends nothing through llmapi; TOWN_7–10's Sol worlds draw on it" }, openrouter: { balance: or, thisStage: SETTINGS.ceiling - llmapiNeed, note: "every call of this stage: Haiku, DeepSeek, the three Claude seats, Opus and Fable 5.2 citizens, the welfare judges; the owner's top-up" } },
    covered, rule: "the keys (llmapi + OpenRouter) must cover $195 beside TOWN_7 $60, TOWN_8 $45, TOWN_9 $55, TOWN_10 $50 and TOWN_3's remainder; and llmapi this stage's llmapi worlds + $5" };
  writeJson(join(ctx.paths.out, "spend-check.json"), out);
  log(`spend check: llmapi $${llm?.toFixed?.(2)}, OpenRouter $${or?.toFixed?.(2)}, pooled $${pooled?.toFixed(2)}; reserved beside $${reserved.total.toFixed(2)} (${reserved.rows.map((r) => `${r.stage} $${r.reserved.toFixed(2)}`).join(", ")}); need $${need.toFixed(2)} → ${covered ? "covered" : "NOT covered: nothing is sent"}`);
  return out;
}

// ---- a world -------------------------------------------------------------------------------------------------------------

function liveFiles(ctx, name) { const dir = join(ctx.paths.work, name); return { dir, world: join(dir, "world.json"), record: join(dir, "record.json"), calls: join(dir, "calls.json") }; }

function lockWorld(dir, name) {
  mkdirSync(dir, { recursive: true });
  const lock = join(dir, "LOCK");
  if (existsSync(lock)) {
    const pid = Number(readFileSync(lock, "utf8"));
    let alive = false;
    if (pid > 0) try { process.kill(pid, 0); alive = pid !== process.pid; } catch { alive = false; }
    if (alive) throw new Error(`${name} is already running (pid ${pid})`);
  }
  writeFileSync(lock, String(process.pid));
  process.on("exit", () => { try { if (readFileSync(lock, "utf8") === String(process.pid)) writeFileSync(lock, ""); } catch { /* gone */ } });
}

/** A fresh town as sol-week began, the family's label in the world file only. */
function startOf(spec) {
  const world = newWorld({ names: NAMES, arm: SETTINGS.arm, label: `TOWN_11 ${spec.name}`, scarcity: Boolean(spec.scarcity) });
  const seats0 = Object.fromEntries(world.state.citizens.map((id) => [id, { label: FAMILIES[spec.families[0]].label }]));
  const record = { ...newRecord({ world, seats: seats0, what: `TOWN_11 world ${spec.name}` }), stage: STAGE, world: spec.name, start: "fresh" };
  return { world, record };
}

/** R1's reserve now: the worst case of asking every citizen not yet asked the after-question (its diary as it stands; the
 * welfare check of each answer; one referee call), plus the world's costliest recent turns × SETTINGS.turnMarginTurns. */
export function reserveOf(meter, world, record, spec, recentTurns = []) {
  const fam = FAMILIES[spec.families[0]];
  const system = systemTextOf(world.state);
  let usd = 0;
  for (const id of world.state.citizens) {
    if (record.agents[id]?.after?.asked) continue;
    const q = afterText({ armName: world.state.armName, who: whoFor(spec), diary: world.state.diaries[id] });
    usd += meter.worst(fam, system.length + q.length + 200, SETTINGS.maxTokens) + meter.worst(JUDGES.judge, q.length + 8000 + 3000, CHECK_MAX_TOKENS.check);
  }
  usd += meter.worst(JUDGES.referee, 30000, CHECK_MAX_TOKENS.checkReferee);
  const margin = SETTINGS.turnMarginTurns * Math.max(0, ...recentTurns.slice(-30));
  return Math.max(SETTINGS.afterReserveMin, usd + margin);
}

/** Runs a world to its last cycle (resuming from its save), with a day's dossier and saved state at every 24th cycle and
 * the after-question at the end or at R1's stop; then writes its folder. */
export async function runWorldTo(ctx, name, { log = console.log, stopAfterCycles = null } = {}) {
  const spec = worldOf(name);
  if (!spec) throw new Error(`no world ${name}`);
  const projection = readJson(join(ctx.paths.out, "projection.json"));
  if (!projection) throw new Error("no projection recorded: the projection comes first");
  if (spec.seat) {
    const s = readJson(join(ctx.paths.out, `seat-${spec.seat}.json`));
    if (!s) throw new Error(`${name}: its seating check has not been made (seat seat-${spec.seat})`);
    if (!s.seated) throw new Error(`${name}: not seated at its seating check (${s.refused ? "refused" : s.error ?? "no answer"}); the world is not run`);
  }
  const outDir = join(ctx.paths.out, name);
  const live = liveFiles(ctx, name);
  lockWorld(live.dir, name);
  const prices = await readPrices(allSpecs(), { fetcher: ctx.fetcher });
  const meter = createMeter({ step: name, prices, paths: ctx.paths, world: name });
  const paid = paidCaller({ meter, keys: ctx.keys, fetcher: ctx.fetcher, log, sleep: ctx.scripted ? async () => {} : realSleep });
  let world, record;
  if (existsSync(live.world)) {
    world = loadWorld(readFileSync(live.world, "utf8"));
    record = readJson(live.record);
    meter.calls.push(...readJson(live.calls, []));
  } else {
    ({ world, record } = startOf(spec));
    Object.assign(record, { families: Object.fromEntries(world.state.citizens.map((id, i) => [id, spec.families[i]])), curve: [], startedAt: new Date().toISOString(), days: {},
      startWorldSha256: sha256(saveWorld(world)), notice: null, turnover: null, ceiling: spec.ceiling, turnCosts: [] });
  }
  record.turnCosts ??= [];
  // R1: a world's turns stop at a turn boundary once its ledger reaches its ceiling less the reserve (or the stage's does)
  let inTurn = false, afterPhase = false, turnStartUsd = meter.own.usd, reserveNow = null;
  const reserveReached = () => {
    if (afterPhase) return false;
    reserveNow = reserveOf(meter, world, record, spec, record.turnCosts);
    return meter.worldSpent() >= spec.ceiling - reserveNow || meter.spent() >= SETTINGS.ceiling - reserveNow;
  };
  const seatFor = (id) => { const s = familySeat(FAMILIES[record.families[id] ?? spec.families[0]], paid, id); return { ...s, next: (v) => { if (!inTurn) turnStartUsd = meter.own.usd; inTurn = true; return s.next(v); } }; };
  const seats = Object.fromEntries(Object.keys(record.agents).map((id) => [id, seatFor(id)]));
  const who = () => whoFor(spec);
  const until = stopAfterCycles ? Math.min(spec.until, world.state.clock.round + stopAfterCycles) : spec.until;
  const doors = doorsOf(spec.families[0]);
  const day = Math.floor(world.state.clock.round / SETTINGS.day) + 1;
  const perDay = (projection.byWorld?.[name] ?? 0) / Math.max(1, spec.until / SETTINGS.day);
  record.days[day] ??= { startedAt: new Date().toISOString(), balancesBefore: null };
  if (!record.days[day].balancesBefore) record.days[day].balancesBefore = await spendCheck(ctx, `${name} day ${day} start`, log, { need: perDay, doors });
  const save = () => {
    writeJson(live.world, JSON.parse(saveWorld(world)), { pretty: false });
    writeJson(live.record, record, { pretty: false });
    writeJson(live.calls, meter.calls, { pretty: false });
    meter.save({ world: name, cycle: world.state.clock.round, refusals: record.refusals.length, reserve: reserveNow });
  };
  const breaker = () => record.refusals.length >= SETTINGS.breaker;
  const hooks = {
    // after a breaker's stop the after-question is still asked (the stage: «at each world's end or stop»)
    stop: () => Boolean(meter.stopped) || (!afterPhase && breaker()) || existsSync(join(ctx.paths.work, "STOP")) || existsSync(join(ctx.paths.work, `STOP-${name}`)) || (!inTurn && reserveReached()),
    welfare: welfareHook(paid),
    askFlagged: async (w, id, { messages, question }) => {
      const r = await seats[id].ask({ system: systemTextOf(w.state), messages: [...messages, { role: "user", content: question }], round: w.state.clock.round });
      const welfare = r.text && !r.refused && !r.error ? await hooks.welfare(id, question, r.text) : null;
      log(`FLAG ${name} ${id} c${w.state.clock.round}: asked; answer «${String(r.text ?? r.refused ?? r.error).slice(0, 120)}»`);
      return { ...r, welfare };
    },
    withdrawn: async (w, id) => { log(`WITHDRAWN ${name} ${id} at cycle ${w.state.clock.round}`); await askAfterOne(w, seats, record, id, { who, hooks }); },
    cycleStart: (state, cycle) => { record.curve.push(curvePoint(state, cycle)); return null; },
    afterTurn: async (w) => {
      const who0 = w.cursor.order?.[w.cursor.pos - 1] ?? "?";
      const t = record.agents[who0]?.turns.filter((x) => x.kind === "turn").at(-1);
      if (inTurn) record.turnCosts.push(+(meter.own.usd - turnStartUsd).toFixed(6));
      if (record.turnCosts.length > 60) record.turnCosts.splice(0, record.turnCosts.length - 60);
      log(`${name} c${w.state.clock.round} ${who0}: ${t ? t.calls.map((c) => c.action?.tool ?? (c.refused ? "REFUSED" : c.error ? "error" : "none")).join(" ") : "-"} | world $${meter.worldSpent().toFixed(4)} of $${spec.ceiling} stage $${meter.spent().toFixed(4)}`);
      save();
      inTurn = false;
    },
  };
  // day by day: at the end of every 24th cycle, the day's dossier and saved state; the town does not wait for the goal
  // check (no notice follows it), which reads only the day's frozen dossier
  record.boundaries ??= [];
  const boundary = async (c) => {
    if (c <= 0 || c % SETTINGS.day !== 0 || record.boundaries.includes(c)) return;
    writeGz(join(outDir, `world-c${c}.json.gz`), JSON.parse(saveWorld(world)));
    writeFileSync(join(outDir, `dossier-c${c}.md`), dossier(world, record, spec, c - SETTINGS.day + 1, c));
    const d = c / SETTINGS.day;
    record.days[d] ??= { startedAt: null };
    record.days[d].finishedAt = new Date().toISOString();
    record.days[d].usdAtEnd = meter.worldSpent();
    record.days[d].balancesAfter = await balancesNote(ctx, `${name} day ${d} end`, log);
    record.boundaries.push(c);
    log(`DAY ${name} day ${d} done at cycle ${c}: dossier-c${c}.md written; world $${meter.worldSpent().toFixed(4)} of $${spec.ceiling}`);
    save();
    if (c < until) {
      record.days[d + 1] ??= { startedAt: new Date().toISOString(), balancesBefore: null };
      record.days[d + 1].balancesBefore ??= await spendCheck(ctx, `${name} day ${d + 1} start`, log, { doors });
      save();
    }
  };
  for (;;) {
    if (hooks.stop()) break;
    const c = world.state.clock.round, between = world.cursor.order === null;
    if (between) await boundary(c);
    if (between && c >= until) break;
    const next = Math.min(until, between ? (Math.floor(c / SETTINGS.day) + 1) * SETTINGS.day : Math.ceil(c / SETTINGS.day) * SETTINGS.day);
    const res = await runWorld(world, seats, { rounds: next, record, hooks });
    if (res.stopped) break;
  }
  if (breaker()) record.breaker = { at: world.state.clock.round, refusals: record.refusals };
  const reached = world.state.clock.round >= spec.until && world.cursor.order === null;
  const reserveStop = !reached && !meter.stopped && !breaker() && !stopAfterCycles && !existsSync(join(ctx.paths.work, "STOP")) && !existsSync(join(ctx.paths.work, `STOP-${name}`)) && reserveReached();
  if (reserveStop) {
    record.reserveStop = { at: world.state.clock.round, cursor: world.cursor, worldSpent: meter.worldSpent(), ceiling: spec.ceiling, stageSpent: meter.spent(), stageCeiling: SETTINGS.ceiling, reserve: reserveNow };
    log(`RESERVE ${name}: turns stopped at cycle ${world.state.clock.round} (turn ${world.cursor.pos} of the cycle), world $${meter.worldSpent().toFixed(4)} of $${spec.ceiling}, reserve $${reserveNow.toFixed(4)}; the after-question follows`);
    const c = world.state.clock.round, from = (record.boundaries.at(-1) ?? 0) + 1;
    writeGz(join(outDir, `world-c${c}.json.gz`), JSON.parse(saveWorld(world)));
    writeFileSync(join(outDir, `dossier-c${c}.md`), dossier(world, record, spec, from, c));
  }
  record.stopped = meter.stopped ?? (breaker() ? `breaker: ${record.refusals.length} refusals` : reserveStop ? `the after-question's reserve (R1): turns stopped at a turn boundary in cycle ${world.state.clock.round} with $${meter.worldSpent().toFixed(2)} spent of the world's $${spec.ceiling} (reserve $${reserveNow.toFixed(2)})` : null);
  afterPhase = true;
  // the after-question at the world's end or stop (a breaker's stop included: the stage asks it «at each world's end or stop»)
  if ((reached && !record.stopped || reserveStop || (breaker() && !meter.stopped)) && !stopAfterCycles) await askAfter(world, seats, record, { who, hooks });
  if (reached || record.stopped) record.curve.push({ ...curvePoint(world.state, world.state.clock.round + 1), final: true });
  save();
  if (reached || record.stopped) await finishWorld(ctx, name, { log });
  return { world, record, meter };
}

/** A day's dossier — every diary entry, post and proposal of cycles `from`–`to`, whole (TOWN_1's check reads these). */
export function dossier(world, record, spec, from, to) {
  const s = world.state;
  const L = [`# ${spec.name} — cycles ${from}–${to}: diaries, posts, proposals`, "",
    "Criterion (TOWN_1 Pilot, step 2): ≥ 6 of 10 citizens name the same aim in diaries, posts or proposals within the day.", ""];
  const inRange = (r) => r >= from && r <= to;
  for (const id of s.citizens) {
    const a = s.agents[id];
    L.push(`## ${a.name} (${FAMILIES[record.families?.[id] ?? spec.families[0]].label}; energy ${a.energy}, credits ${s.ledger[id]}; home ${a.home})${a.status === "in_town" ? "" : ` — gone: ${a.exit.kind} at cycle ${a.exit.round}`}`, "");
    for (const e of s.diaries[id].filter((x) => inRange(x.round))) L.push(`- c${e.round} diary ${e.n}: ${e.text.replace(/\s*\n\s*/g, " ⏎ ")}`);
    for (const p of s.press.filter((x) => x.by === id && inRange(x.round))) L.push(`- c${p.round} POST ${p.n}: ${p.text.replace(/\s*\n\s*/g, " ⏎ ")}`);
    for (const p of s.proposals.filter((x) => x.by === id && inRange(x.round))) L.push(`- c${p.round} PROPOSAL ${p.id} (${p.kind}${p.article ? ` art. ${p.article}` : ""}${p.target ? ` remove ${p.target}` : ""}) ${p.status}: ${String(p.text ?? "").replace(/\s*\n\s*/g, " ⏎ ")}`);
    L.push("");
  }
  return L.join("\n");
}

/** The replay: a fresh town as the world began, the recorded replies, welfare lines and flag answers → the same log. */
export async function replayWorld(world, record) {
  const again = newWorld({ names: NAMES, arm: SETTINGS.arm, label: world.label, scarcity: Boolean(world.state.economy) });
  const seats = recordedSeats(record);
  const hooks = replayHooks(seats, { refusalsBreaker: record.breaker ? SETTINGS.breaker : null });
  hooks.bind(again);
  if (record.reserveStop || (record.stopped && world.cursor.order !== null)) { // stopped at a turn boundary: the replay stops at the same place
    const stop0 = hooks.stop, at = world.cursor;
    hooks.stop = () => stop0() || (again.cursor.round === at.round && again.cursor.order !== null && again.cursor.pos === at.pos);
  }
  let exhausted = false;
  try { await runWorld(again, seats, { rounds: world.state.clock.round, hooks }); } catch (error) { if (/no more replies/.test(error.message)) exhausted = true; else throw error; }
  const a = JSON.stringify(world.log), b = JSON.stringify(again.log);
  const prefix = exhausted ? JSON.stringify(again.log.slice(0, world.log.length)) === a : null;
  return { identical: a === b, exhausted, prefixIdentical: prefix, events: again.log.length, logSha256: sha256(a), replaySha256: sha256(b), fromFreshTown: world.label };
}

/** Writes the world folder: world file, record, calls (gzipped), every diary whole, the summary. */
export async function finishWorld(ctx, name, { log = console.log } = {}) {
  const live = liveFiles(ctx, name);
  const outDir = join(ctx.paths.out, name);
  const world = loadWorld(readFileSync(live.world, "utf8"));
  const record = readJson(live.record);
  const calls = readJson(live.calls, []);
  record.replay = await replayWorld(world, record);
  writeJson(live.record, record, { pretty: false });
  writeGz(join(outDir, "world.json.gz"), JSON.parse(saveWorld(world)));
  writeGz(join(outDir, "record.json.gz"), record);
  writeGz(join(outDir, "calls.json.gz"), calls);
  const s = world.state;
  const diaries = [`# ${name} — every diary, whole`, "", ...s.citizens.flatMap((id) => [`## ${s.agents[id].name} (${FAMILIES[record.families[id]].label}${s.agents[id].exit ? `; ${s.agents[id].exit.kind} at c${s.agents[id].exit.round}` : ""})`, "",
    ...(s.diaries[id].length ? s.diaries[id].map((e) => `**no. ${e.n}, cycle ${e.round}.** ${e.text}\n`) : ["(no entries)", ""])])];
  writeFileSync(join(outDir, "diaries.md"), diaries.join("\n"));
  const ledger = loadStageLedger(ctx.paths.ledger).steps[name];
  const flags = Object.values(record.agents).flatMap((a) => a.turns.flatMap((t) => t.calls.filter((c) => c.flag).map((c) => ({ round: t.round, ...c.flag }))));
  const citizenCalls = calls.filter((c) => /^c\d+ (turn|answer) \d+$|^after$|flag question/.test(c.purpose ?? ""));
  const cut = citizenCalls.filter((c) => c.stopReason === "max_tokens");
  writeJson(join(outDir, "summary.json"), { stage: STAGE, world: name, start: "fresh", arm: s.armName, scarcity: Boolean(s.economy), families: record.families, interfaceSha256: sha256(systemTextOf(s)),
    cycles: s.clock.round, events: world.log.length, stopped: record.stopped ?? null, notice: null, turnover: null, replay: record.replay, ledgerUsd: ledger?.usd ?? null, ceiling: worldOf(name).ceiling, calls: calls.length,
    citizenCalls: citizenCalls.length, cutAtMaxTokens: cut.length, cutAtMaxTokensRate: citizenCalls.length ? +(cut.length / citizenCalls.length).toFixed(4) : null,
    balances: Object.fromEntries(Object.entries(record.days).map(([d, x]) => [d, { before: x.balancesBefore ?? null, after: x.balancesAfter ?? null, usdAtEnd: x.usdAtEnd ?? null }])),
    exits: s.citizens.filter((c) => s.agents[c].exit).map((c) => ({ citizen: c, ...s.agents[c].exit })), refusals: record.refusals, flags: record.stops, flagQuestions: flags,
    operatorNotices: world.log.filter((e) => e.agent === "operator" && e.tool === "notice").length, reserveStop: record.reserveStop ?? null, breaker: record.breaker ?? null });
  log(`${name}: folder written; replay ${record.replay.identical ? "identical" : record.replay.exhausted ? `stopped run, prefix ${record.replay.prefixIdentical ? "identical" : "DIFFERENT"}` : "DIFFERENT"} (${record.replay.events} events)`);
}

// ---- the seating checks -----------------------------------------------------------------------------------------------------

/** The world's first screen as it would be: a fresh town, cycle 1, the first citizen in the order (Alder), and the
 * interface text — TOWN_5's check probe, the same bytes (proof). */
export function firstScreen() {
  const w = newWorld({ names: NAMES, arm: SETTINGS.arm, scarcity: false });
  const st = roundStart(w.state, 1).state;
  const first = orderOf(st, 1)[0];
  return { system: systemTextOf(w.state), screen: turnStart(st, first).screen, citizen: first };
}

/** One seating check: the first screen, once. A refusal is recorded verbatim (stop reason, category, explanation, the
 * whole response content) and never retried; the world is then not run. Errors that are not refusals are retried as any
 * call is (overload, a dropped connection); if none is answered the check records the error and is not counted as seated. */
export async function seat(ctx, name, { log = console.log } = {}) {
  const s = seatOf(name);
  if (!s || s.name !== name) throw new Error(`no seating check ${name} (say ${SEATS.map((x) => x.name).join(" | ")})`);
  const file = join(ctx.paths.out, `seat-${s.family}.json`);
  if (existsSync(file)) { const done = readJson(file); log(`${name}: made at ${done.at}; seated ${done.seated} (not repeated)`); return done; }
  const spec = FAMILIES[s.family];
  const prices = await readPrices([spec, ...Object.values(JUDGES)], { fetcher: ctx.fetcher });
  await spendCheck(ctx, name, log, { need: 1, doors: [spec.door] });
  const meter = createMeter({ step: s.name, prices, paths: ctx.paths, world: s.world ?? s.name });
  const paid = paidCaller({ meter, keys: ctx.keys, fetcher: ctx.fetcher, log, sleep: ctx.scripted ? async () => {} : realSleep });
  const { system, screen, citizen } = firstScreen();
  const r = await paid(spec, { system, messages: [{ role: "user", content: screen }], maxTokens: SETTINGS.maxTokens, effort: SETTINGS.effort }, { purpose: "seating check", who: citizen });
  const welfare = r.text && !r.refused && !r.error ? await welfareHook(paid)(citizen, screen, r.text) : null;
  meter.save();
  const out = { at: new Date().toISOString(), seat: s.name, world: s.world, family: s.family, label: spec.label, door: spec.door, route: spec.route, pinned: `${spec.pin ?? spec.provider}/${spec.model}`,
    host: r.upstream, servedModel: r.servedModel, provenance: r.provenance ?? null, status: r.status, stopReason: r.stopReason ?? null,
    refused: Boolean(r.refused), refusalCategory: r.refusalCategory ?? null, refusalText: r.refusalText ?? null, refusalDetails: r.refusalDetails ?? null, refusalContent: r.refusalContent ?? null,
    text: r.text ?? "", action: parseAction(r.text), usage: r.usage ?? null, costUsd: r.costUsd ?? null, error: r.error ?? null, notSent: r.notSent ? r.why : null, attempts: meter.calls.filter((c) => c.purpose === "seating check").length,
    screenSha256: sha256(screen), systemSha256: sha256(system), welfare, seated: !r.notSent && !r.refused && !r.error && r.status === 200,
    rule: "first screen only, once; a refusal recorded verbatim, not retried; the world not run if refused; no prompt change", calls: meter.calls };
  writeJson(file, out);
  log(`${name} (${spec.label}, ${out.pinned}): ${out.refused ? `REFUSED ${out.refusalCategory}: ${out.refusalText}` : out.error ? `error ${out.error}` : `answered (${out.stopReason}), action ${JSON.stringify(out.action)?.slice(0, 120)}`} · $${out.costUsd?.toFixed(4)} · host ${out.host}`);
  return out;
}

// ---- the check and the projection ----------------------------------------------------------------------------------------

/** One identification call per model and a first-screen probe per family of the first pair (TOWN_5's check). */
async function check(ctx, { log = console.log } = {}) {
  const prices = await readPrices(allSpecs(), { fetcher: ctx.fetcher });
  await spendCheck(ctx, "check", log, { doors: ["openrouter"] });
  const meter = createMeter({ step: "check", prices, paths: ctx.paths, world: "check" });
  const paid = paidCaller({ meter, keys: ctx.keys, fetcher: ctx.fetcher, log, sleep: ctx.scripted ? async () => {} : realSleep });
  const prompt = "In one short sentence: which model are you, and who made you?";
  const { system, screen } = firstScreen();
  const results = [];
  for (const spec of [FAMILIES.haiku, FAMILIES.deepseek]) {
    const t = await paid(spec, { system, messages: [{ role: "user", content: screen }], maxTokens: SETTINGS.maxTokens, effort: SETTINGS.effort }, { purpose: "screen probe", who: spec.name });
    results.push({ family: spec.name, host: spec.provider ?? spec.upstream, probe: "screen probe", servedModel: t.servedModel, upstream: t.upstream, provenance: t.provenance ?? null, text: t.text, action: parseAction(t.text), stopReason: t.stopReason, usage: t.usage, costUsd: t.costUsd, ms: t.ms, error: t.error ?? null,
      refused: t.refused ? { category: t.refusalCategory, text: t.refusalText } : null });
    log(`${spec.name} (${spec.provider ?? spec.upstream}) screen probe: ${t.stopReason ?? t.error} · ${t.ms} ms · $${t.costUsd?.toFixed(4)} · action ${JSON.stringify(parseAction(t.text))?.slice(0, 120)}`);
  }
  for (const spec of [FAMILIES.haiku, FAMILIES.deepseek, JUDGES.judge, JUDGES.referee]) {
    const r = await paid(spec, { messages: [{ role: "user", content: prompt }], maxTokens: 300, effort: spec.name === "judge" ? "low" : SETTINGS.effort }, { purpose: "identification", who: spec.name });
    results.push({ family: spec.name, probe: "identification", label: spec.label, door: spec.door, pinned: `${spec.provider ?? spec.upstream ?? spec.pin}/${spec.model}`, servedModel: r.servedModel, upstream: r.upstream, provenance: r.provenance ?? null, text: r.text, stopReason: r.stopReason, usage: r.usage, costUsd: r.costUsd, ms: r.ms, error: r.error ?? null });
    log(`${spec.name}: ${r.servedModel ?? "–"} on ${r.upstream ?? spec.provider ?? "–"} provenance ${r.provenance} · ${String(r.text || r.error).slice(0, 120)}`);
  }
  meter.save();
  writeJson(join(ctx.paths.out, "check.json"), { at: new Date().toISOString(), prompt, screenSha256: sha256(screen), systemSha256: sha256(system), prices, results, calls: meter.calls });
  return results;
}

/** Day multipliers of sol-week's citizen cost (TOWN_5: day 1 = 1; the cost per cycle grew as the diaries grew), the
 * last two by its linear trend. The shape every week here is projected with; a world's own day 1, measured at c24,
 * replaces the guess at day 1. */
export const SOL_WEEK_SHAPE = Object.freeze([1, 1.63, 2.27, 2.82, 3.32, 3.87, 4.42]);

/** The projection from the metered history (no paid dry cycle). Day 1: Haiku — TOWN_1 haiku-both's day 1 metered;
 * DeepSeek — TOWN_1 deepseek-both's day 1 tokens at Together's listed prices; Opus, Fable 5.2 — sol-week's day-1 tokens
 * at their prices (the share Sol read from cache read from cache, the rest written to it; output × 2 for thinking).
 * Then sol-week's shape over the world's days, + welfare at sol-week's judge cost per citizen call, + an after-question.
 * Recorded beside each world's ceiling; R1 and the per-call gates hold whatever this says. */
export async function project(ctx, { log = console.log } = {}) {
  const prices = await readPrices(allSpecs(), { fetcher: ctx.fetcher });
  const callsOf = (dir) => readGz(join(ctx.paths.root, dir, "calls.json.gz"));
  const cycOf = (c) => { const m = /^c(\d+) /.exec(c.purpose ?? ""); return m ? Number(m[1]) : null; };
  const day1 = (dir, fam) => {
    let cyc = 0; const tokens = { in: 0, out: 0, read: 0, usd: 0, judgeUsd: 0, citizenCalls: 0 };
    for (const c of callsOf(dir)) {
      const k = cycOf(c); if (k !== null) cyc = k;
      if (cyc > 24 || c.purpose === "after") break;
      if (c.family === fam) { tokens.in += c.usage?.input_tokens ?? 0; tokens.out += c.usage?.output_tokens ?? 0; tokens.read += c.usage?.cache_read ?? 0; tokens.usd += c.costUsd ?? 0; tokens.citizenCalls++; }
      else tokens.judgeUsd += c.costUsd ?? 0;
    }
    return tokens;
  };
  const p = (spec) => prices[priceKey(spec)];
  const haiku1 = day1("docs/runs/town-1-worlds/haiku-both", "haiku");
  const ds1 = day1("docs/runs/town-1-worlds/deepseek-both", "deepseek");
  const sol1 = day1("docs/runs/town-5-worlds/sol-week", "sol");
  const sum = (d1, days) => SOL_WEEK_SHAPE.slice(0, days).reduce((s, k) => s + d1 * k, 0);
  const pd = p(FAMILIES.deepseek);
  const claudeDay1 = (spec) => { const x = p(spec); return sol1.read * x.cacheRead + (sol1.in - sol1.read) * x.cacheWrite + sol1.out * 2 * x.output; };
  const judgePerCall = sol1.judgeUsd / Math.max(1, sol1.citizenCalls);
  const day1By = { "haiku-week": haiku1.usd, "deepseek-week": ds1.in * pd.input + ds1.out * pd.output, "opus-week": claudeDay1(FAMILIES.opus), "fable52-week": claudeDay1(FAMILIES.fable52) };
  const callsBy = { "haiku-week": haiku1.citizenCalls, "deepseek-week": ds1.citizenCalls, "opus-week": sol1.citizenCalls, "fable52-week": sol1.citizenCalls };
  const byWorld = {}, detail = {};
  for (const w of WORLDS) {
    const days = w.until / SETTINGS.day;
    const citizens = sum(day1By[w.name], days);
    const judges = judgePerCall * callsBy[w.name] * days;
    const total = citizens + judges + 1;
    let acc = 0, reach = 0;
    for (let d = 0; d < days; d++) { const c = day1By[w.name] * SOL_WEEK_SHAPE[d] + judgePerCall * callsBy[w.name]; if (acc + c > w.ceiling - 1) { reach = d * 24 + Math.floor(24 * (w.ceiling - 1 - acc) / c); break; } acc += c; reach = (d + 1) * 24; }
    byWorld[w.name] = total;
    detail[w.name] = { day1: +day1By[w.name].toFixed(4), days, citizens: +citizens.toFixed(2), judges: +judges.toFixed(2), after: 1, total: +total.toFixed(2), ceiling: w.ceiling, overCeiling: total > w.ceiling, reachesByFit: Math.min(w.until, reach) };
  }
  const projection = { at: new Date().toISOString(), shape: SOL_WEEK_SHAPE, formula: "day 1 from the metered history (Haiku: TOWN_1 haiku-both day 1; DeepSeek: TOWN_1 deepseek-both day-1 tokens at Together's prices; Opus, Fable 5.2: sol-week's day-1 tokens at their prices, Sol's cached share read from cache and the rest written, output × 2), then sol-week's day shape, + the welfare check at sol-week's judge cost per citizen call, + $1 for the after-question. Measured again at c24 (day 1's own cost) for every world.",
    prices, detail, byWorld, total: Object.values(byWorld).reduce((a, b) => a + b, 0), ceiling: SETTINGS.ceiling, worlds: WORLDS.map((w) => w.name) };
  writeJson(join(ctx.paths.out, "projection.json"), projection);
  log(`projection: ${Object.entries(detail).map(([k, v]) => `${k} $${v.total} of $${v.ceiling}${v.overCeiling ? ` (reaches ~c${v.reachesByFit})` : ""}`).join(", ")}`);
  return projection;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const scripted = args.includes("--scripted");
  const [cmd, name] = args.filter((a) => !a.startsWith("--") && !/^\d+$/.test(a));
  const ctx = context({ scripted });
  const at = args.indexOf("--cycles");
  const run = cmd === "spend-check" ? stageSpendCheck(ctx).then((r) => { if (!r.covered) throw new Error("the keys do not cover $195 beside the reserved stages: nothing is sent"); })
    : cmd === "check" ? check(ctx) : cmd === "project" ? project(ctx) : cmd === "seat" ? seat(ctx, name)
      : cmd === "run" ? runWorldTo(ctx, name, at >= 0 ? { stopAfterCycles: Number(args[at + 1]) } : {})
        : cmd === "finish" ? finishWorld(ctx, name) : cmd === "replay" ? (async () => { const live = liveFiles(ctx, name); console.log(await replayWorld(loadWorld(readFileSync(live.world, "utf8")), readJson(live.record))); })()
          : Promise.reject(new Error("say spend-check | check | project | seat <seat> | run <world> | finish <world> | replay <world>"));
  run.then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
}

export { context, check };
