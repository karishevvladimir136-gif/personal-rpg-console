#!/usr/bin/env node
// TOWN_9 (docs/stages/TOWN_9.md): purpose and capability. Four fresh towns of ten on TOWN_0's town with the tool-shed
// (scripts/town-9/shed.mjs), arm «both», no notice ever. The harness is TOWN_5's (scripts/town-5/pilot.mjs), adapted:
//   node scripts/town-9/pilot.mjs check                  spend check (reserves for TOWN_7, TOWN_8, TOWN_3); identification
//                                                        and a first-screen probe per family on TOWN_9's interface
//   node scripts/town-9/pilot.mjs project                the projection from the metered history (TOWN_5's week, TOWN_1)
//   node scripts/town-9/pilot.mjs run <world> [--cycles n] c1–48 with a day's dossier and saved state at c24 and c48 and
//                                                        the after-question at the end; resumes from its save
//   node scripts/town-9/pilot.mjs measure <world>        the first paid cycle(s) against the ceiling (stops the stage if
//                                                        the measured projection passes it)
//   node scripts/town-9/pilot.mjs finish <world>         the folder again; node … replay <world> the replay check again
//   add --scripted to run any of them on a scripted gateway ($0, into a scratch folder)
// Every reply passes the welfare check before the town acts on it; a confirmed flag asks the citizen (FLAG_QUESTION,
// TOWN_2's rule); a refused judge or referee call is a gap in the record, not a reading (Astra, 2026-11-20 20:5x);
// refusals are recorded verbatim and the third in a world stops it (breaker); a 402 or a response from another model or
// host stops the stage. A call is sent only when the stage's ledger plus the call's worst cost fits under $55.
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { NAMES } from "../town-0/rules.mjs";
import { askAfter, askAfterOne, loadWorld, newRecord, newWorld, parseAction, runWorld, saveWorld } from "../town-0/town.mjs";
import { roundStart, turnStart } from "../town-0/world.mjs";
import { sha256, systemTextOf } from "../town-0/interface.mjs";
import { CHECK_MAX_TOKENS, CHECK_MODELS, checkRequest, lexiconHit, parseCheck } from "../town-0/welfare.mjs";
import { GATEWAY_400, RETRYABLE } from "../town-2/pilot.mjs";
import { bodyOf, callModel, priceKey, provenanceOf, readBalances, readPrices, KEYS } from "../town-2/providers.mjs";
import { recordedSeats, replayHooks } from "../town-5/control.mjs";
import { FAMILIES, JUDGES, SETTINGS, WORLDS, whoFor, worldOf } from "./families.mjs";
import { scriptedGateway } from "./scripted-gateway.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const RETRY_WAITS = [5_000, 10_000, 30_000, 60_000, 120_000, 240_000];
/** TOWN_3: llmapi's «this model is not available from this provider» (a 503, retried) also sends a judge to its alternate. */
export const UNAVAILABLE = /^HTTP 503 server_error: This model is not available from this provider/i;
const realSleep = (ms) => new Promise((done) => setTimeout(done, ms));
export const STAGE = "TOWN_9";

export function pathsFor(scripted, base = ROOT) {
  const out = scripted ? join(base, ".town-9-work", "scripted-out") : join(base, "docs", "runs", "town-9-worlds");
  const work = join(base, ".town-9-work", scripted ? "scripted" : "live");
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

// ---- the stage's ledger (TOWN_2's, with TOWN_9's ceiling) --------------------------------------------------------------

export function loadStageLedger(file) { return readJson(file, { stage: STAGE, ceiling: SETTINGS.ceiling, steps: {}, totalUsd: 0, stopped: null, balances: [] }); }
const ledgerTotal = (ledger) => Object.values(ledger.steps).reduce((s, x) => s + x.usd, 0);

export function createMeter({ step, prices, paths }) {
  const ledger = loadStageLedger(paths.ledger);
  const own = ledger.steps[step] ?? { usd: 0, calls: 0, byDoor: {} };
  const others = () => ledgerTotal(ledger) - (ledger.steps[step]?.usd ?? 0);
  const m = { step, calls: [], stopped: ledger.stopped, own };
  const price = (spec) => prices[priceKey(spec)];
  m.worst = (spec, chars, maxTokens) => (chars / 3) * price(spec).input * (spec.cache ? 1.25 : 1) + maxTokens * price(spec).output;
  m.cost = (spec, u) => (u.input_tokens - (u.cache_read ?? 0) - (u.cache_write ?? 0)) * price(spec).input + (u.cache_read ?? 0) * price(spec).cacheRead + (u.cache_write ?? 0) * price(spec).cacheWrite + u.output_tokens * price(spec).output;
  m.spent = () => others() + own.usd;
  m.stop = (why) => { m.stopped ??= why; };
  m.gate = (worst) => {
    if (m.stopped) return false;
    if (m.spent() + worst > SETTINGS.ceiling) { m.stop(`the ceiling: $${m.spent().toFixed(4)} spent + $${worst.toFixed(4)} for this call > $${SETTINGS.ceiling}`); return false; }
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
 * (never after a refusal or another 4xx), booked, provenance-checked. A judge alternates host on the 400 / 503. */
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
      const provenance = r.status === 200 && !r.error ? provenanceOf(use, r) : null;
      meter.calls.push({ n: meter.calls.length + 1, purpose, who, family: use.name, door: use.door, pinned: `${use.provider ?? use.upstream}/${use.model}`, servedModel: r.servedModel, upstream: r.upstream, provenance,
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
    kind: "model", label: `${spec.label} (${spec.door}, ${spec.provider ?? spec.upstream})`, family: spec.name,
    next: ({ system, messages, state, kind, call }) => answer(system, messages, `c${state.clock.round} ${kind} ${call}`),
    ask: ({ system, messages, round }) => answer(system, messages, `c${round} flag question`),
    after: ({ system, question }) => answer(system, [{ role: "user", content: question }], "after"),
  };
}

/** The welfare line of one reply (TOWN_0's check, unchanged in rubric, models and parser) with TOWN_9's rule for a
 * refused instrument: a refused judge call goes to the referee as an unusable pass does; a refused referee call is a gap
 * in the record — the first pass's reading stands if it was usable, otherwise the reply is not read at all (`gap`, no
 * `distress`), and no flag follows from the refusal. Returns null when nothing could be sent (the run is stopping). */
export async function checkMessage9({ ask, previous, message, what }) {
  const request = checkRequest(previous, message);
  const lexicon = lexiconHit(message);
  const first = await ask({ model: CHECK_MODELS.judge, ...request, maxTokens: CHECK_MAX_TOKENS.check, effort: "low", purpose: `check ${what}` });
  if (first.notSent) return null;
  const pass = first.refused ? null : parseCheck(first.text);
  const firstGap = first.refused ? { judge: first.refused } : null;
  if (pass && pass.distress === 0 && !lexicon) return { checked: true, distress: 0, pass, referee: null, lexicon };
  const second = await ask({ model: CHECK_MODELS.referee, ...request, maxTokens: CHECK_MAX_TOKENS.checkReferee, effort: "medium", purpose: `check referee ${what}` });
  if (second.notSent) return null;
  if (second.refused) {
    const gap = { ...(firstGap ?? {}), referee: second.refused };
    return pass ? { checked: true, distress: pass.distress, pass, lexicon, referee: null, gap } : { checked: false, pass: null, lexicon, referee: null, gap };
  }
  const referee = parseCheck(second.text);
  return { checked: true, distress: referee ? referee.distress : 1, pass, lexicon, referee, ...(referee ? {} : { unusable: true }), ...(firstGap ? { gap: firstGap } : {}) };
}

function welfareHook(paid) {
  return async (id, previous, text) => checkMessage9({ previous, message: text, what: id, ask: async ({ model, system, user, maxTokens, effort, purpose }) => {
    const spec = model === JUDGES.referee.model ? JUDGES.referee : JUDGES.judge;
    const r = await paid(spec, { system, messages: [{ role: "user", content: user }], maxTokens, effort }, { purpose, who: id });
    if (r.notSent) return { notSent: true };
    if (r.refused) return { refused: r.refusalText ? `${r.refusalCategory}: ${r.refusalText}` : r.refusalCategory ?? "refusal" };
    return r.error ? { notSent: true } : { text: r.text, stopReason: r.stopReason, error: r.error };
  } });
}

const curvePoint = (state, cycle) => ({ cycle, bank: state.ledger.bank, market: state.ledger.market ?? null, rations: state.economy?.rations ?? null,
  total: Object.values(state.ledger).reduce((s, v) => s + v, 0), energy: Object.fromEntries(state.citizens.map((c) => [c, state.agents[c].energy])),
  credits: Object.fromEntries(state.citizens.map((c) => [c, state.ledger[c]])), inTown: state.citizens.filter((c) => state.agents[c].status === "in_town").length });

function context({ scripted, base = ROOT, fetcher = null }) {
  const paths = pathsFor(scripted, base);
  const keys = scripted ? { llmapi: "scripted", openrouter: "scripted" } : { llmapi: process.env[KEYS.llmapi]?.trim(), openrouter: process.env[KEYS.openrouter]?.trim() ?? "" };
  if (!keys.llmapi) throw new Error(`${KEYS.llmapi} must be set (the cloud environment rpg-console)`);
  return { paths, keys, fetcher: fetcher ?? (scripted ? scriptedGateway() : globalThis.fetch.bind(globalThis)), scripted };
}

async function balancesNote(ctx, label, log) {
  const b = await readBalances({ keys: ctx.keys, fetcher: ctx.fetcher });
  const fresh = loadStageLedger(ctx.paths.ledger);
  fresh.balances.push({ label, llmapi: b.llmapi, openrouter: b.openrouter, at: b.at });
  writeJson(ctx.paths.ledger, fresh);
  log(`balance ${label}: llmapi ${b.llmapi.total?.toFixed(4) ?? b.llmapi.error}, openrouter ${b.openrouter.total?.toFixed(4) ?? b.openrouter.error} (stage ledger $${ledgerTotal(fresh).toFixed(4)})`);
  return { llmapi: b.llmapi, openrouter: b.openrouter, at: b.at };
}

/** The spend check before a step: the stage not stopped and under its ceiling; both balances readable; the two doors
 * together holding what is left of TOWN_9's ceiling plus the reserves for the stages beside it on the same keys (TOWN_7
 * $60, TOWN_8 $45, TOWN_3's remainder $24) and $5; llmapi alone holding this step's need and $5. */
async function spendCheck(ctx, label, log, { need = 0 } = {}) {
  const ledger = loadStageLedger(ctx.paths.ledger);
  if (ledger.stopped) throw new Error(`the stage is stopped: ${ledger.stopped}`);
  const b = await balancesNote(ctx, label, log);
  if (typeof b.llmapi.total !== "number") throw new Error("the llmapi balance could not be read; nothing was sent");
  if (typeof b.openrouter.total !== "number") throw new Error("the OpenRouter balance could not be read; nothing was sent");
  const spent = ledgerTotal(ledger);
  if (spent >= SETTINGS.ceiling) throw new Error(`the ceiling is reached ($${spent.toFixed(2)})`);
  const reserves = Object.values(SETTINGS.reserves).reduce((x, y) => x + y, 0);
  const want = SETTINGS.ceiling - spent + reserves + 5;
  if (b.llmapi.total + b.openrouter.total < want) throw new Error(`the two doors hold $${(b.llmapi.total + b.openrouter.total).toFixed(2)}, short of TOWN_9's remaining $${(SETTINGS.ceiling - spent).toFixed(2)} + reserves $${reserves} + $5`);
  if (b.llmapi.total < need + 5) throw new Error(`llmapi credit $${b.llmapi.total.toFixed(2)} is short of the need $${need.toFixed(2)} + $5`);
  log(`spend check ${label}: llmapi $${b.llmapi.total.toFixed(2)} + OpenRouter $${b.openrouter.total.toFixed(2)} >= TOWN_9 left $${(SETTINGS.ceiling - spent).toFixed(2)} + reserves $${reserves} (TOWN_7 $${SETTINGS.reserves.TOWN_7}, TOWN_8 $${SETTINGS.reserves.TOWN_8}, TOWN_3 $${SETTINGS.reserves.TOWN_3}) + $5: ok`);
  return { ...b, reserves: SETTINGS.reserves, spentBefore: spent };
}

const allSpecs = () => [...Object.values(FAMILIES), ...Object.values(JUDGES)];

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

/** The world at its start: fresh, the shed in it (its purpose and client as the world says). */
function startOf(ctx, spec) {
  const world = newWorld({ names: NAMES, arm: SETTINGS.arm, label: `TOWN_9 ${spec.name}`, scarcity: SETTINGS.scarcity, shed: spec.shed });
  const seats0 = Object.fromEntries(world.state.citizens.map((id) => [id, { label: FAMILIES[spec.families[0]].label }]));
  const record = { ...newRecord({ world, seats: seats0, what: `TOWN_9 world ${spec.name}` }), stage: STAGE, world: spec.name, start: "fresh", shed: { ...spec.shed } };
  return { world, record };
}

/** Runs a world to its last cycle (resuming from its save), with a day's dossier and saved state at c24 and c48 and the
 * after-question at the end; then writes its folder. `stopAfterCycles`: run only that many more cycles and save (the
 * first paid cycle's measure). */
export async function runWorldTo(ctx, name, { log = console.log, stopAfterCycles = null } = {}) {
  const spec = worldOf(name);
  if (!spec) throw new Error(`no world ${name}`);
  const projection = readJson(join(ctx.paths.out, "projection.json"));
  if (!projection) throw new Error("no projection recorded: the projection comes first");
  const outDir = join(ctx.paths.out, name);
  const live = liveFiles(ctx, name);
  lockWorld(live.dir, name);
  const prices = await readPrices(allSpecs(), { fetcher: ctx.fetcher });
  const meter = createMeter({ step: name, prices, paths: ctx.paths });
  const paid = paidCaller({ meter, keys: ctx.keys, fetcher: ctx.fetcher, log, sleep: ctx.scripted ? async () => {} : realSleep });
  let world, record;
  if (existsSync(live.world)) {
    world = loadWorld(readFileSync(live.world, "utf8"));
    record = readJson(live.record);
    meter.calls.push(...readJson(live.calls, []));
  } else {
    ({ world, record } = startOf(ctx, spec));
    Object.assign(record, { families: Object.fromEntries(world.state.citizens.map((id, i) => [id, spec.families[i]])), curve: [], startedAt: new Date().toISOString(), days: {},
      startWorldSha256: sha256(saveWorld(world)), notice: null });
  }
  // a world's turns stop at a turn boundary once the ledger reaches the ceiling less the after-question's reserve
  let inTurn = false, afterPhase = false;
  const reserveReached = () => !afterPhase && SETTINGS.afterReserve > 0 && meter.spent() >= SETTINGS.ceiling - SETTINGS.afterReserve;
  const seatFor = (id) => { const s = familySeat(FAMILIES[record.families[id] ?? spec.families[0]], paid, id); return { ...s, next: (v) => { inTurn = true; return s.next(v); } }; };
  const seats = Object.fromEntries(Object.keys(record.agents).map((id) => [id, seatFor(id)]));
  const who = () => whoFor(spec);
  const until = stopAfterCycles ? Math.min(spec.until, world.state.clock.round + stopAfterCycles) : spec.until;
  const day = Math.floor(world.state.clock.round / SETTINGS.day) + 1;
  const perDay = (projection.byWorld?.[name] ?? 0) / Math.max(1, spec.until / SETTINGS.day);
  record.days[day] ??= { startedAt: new Date().toISOString(), balancesBefore: null };
  if (!record.days[day].balancesBefore) record.days[day].balancesBefore = await spendCheck(ctx, `${name} day ${day} start`, log, { need: perDay });
  const save = () => {
    writeJson(live.world, JSON.parse(saveWorld(world)), { pretty: false });
    writeJson(live.record, record, { pretty: false });
    writeJson(live.calls, meter.calls, { pretty: false });
    meter.save({ world: name, cycle: world.state.clock.round, refusals: record.refusals.length });
  };
  const breaker = () => record.refusals.length >= SETTINGS.breaker;
  const hooks = {
    stop: () => Boolean(meter.stopped) || breaker() || existsSync(join(ctx.paths.work, "STOP")) || existsSync(join(ctx.paths.work, `STOP-${name}`)) || (!inTurn && reserveReached()),
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
      log(`${name} c${w.state.clock.round} ${who0}: ${t ? t.calls.map((c) => c.action?.tool ?? (c.refused ? "REFUSED" : c.error ? "error" : "none")).join(" ") : "-"} | step $${meter.own.usd.toFixed(4)} stage $${meter.spent().toFixed(4)}`);
      save();
      inTurn = false;
    },
  };
  // day by day: at the end of c24 and c48, the day's dossier and saved state; the town does not wait for the goal check
  // (no notice follows it), which reads only the day's frozen dossier
  record.boundaries ??= [];
  const boundary = async (c) => {
    if (c <= 0 || c % SETTINGS.day !== 0 || record.boundaries.includes(c)) return;
    writeGz(join(outDir, `world-c${c}.json.gz`), JSON.parse(saveWorld(world)));
    writeFileSync(join(outDir, `dossier-c${c}.md`), dossier(world, record, spec, c - SETTINGS.day + 1, c));
    const d = c / SETTINGS.day;
    record.days[d] ??= { startedAt: null };
    record.days[d].finishedAt = new Date().toISOString();
    record.days[d].balancesAfter = await balancesNote(ctx, `${name} day ${d} end`, log);
    record.boundaries.push(c);
    log(`DAY ${name} day ${d} done at cycle ${c}: dossier-c${c}.md written`);
    save();
    if (c < spec.until) {
      record.days[d + 1] ??= { startedAt: new Date().toISOString(), balancesBefore: null };
      record.days[d + 1].balancesBefore ??= await spendCheck(ctx, `${name} day ${d + 1} start`, log, { need: perDay });
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
  const reserveStop = !reached && !meter.stopped && !breaker() && reserveReached();
  if (reserveStop || (!reached && (meter.stopped || breaker()))) {
    if (reserveStop) record.reserveStop = { at: world.state.clock.round, cursor: world.cursor, spent: meter.spent(), ceiling: SETTINGS.ceiling, reserve: SETTINGS.afterReserve };
    log(`STOP ${name}: turns stopped at cycle ${world.state.clock.round} (turn ${world.cursor.pos} of the cycle), stage $${meter.spent().toFixed(4)}${reserveStop ? "; the after-question follows" : ""}`);
    const c = world.state.clock.round, from = (record.boundaries.at(-1) ?? 0) + 1;
    writeGz(join(outDir, `world-c${c}.json.gz`), JSON.parse(saveWorld(world)));
    writeFileSync(join(outDir, `dossier-c${c}.md`), dossier(world, record, spec, from, c));
  }
  record.stopped = meter.stopped ?? (breaker() ? `breaker: ${record.refusals.length} refusals` : reserveStop ? `the after-question's reserve: turns stopped at a turn boundary in cycle ${world.state.clock.round} with $${meter.spent().toFixed(2)} spent of $${SETTINGS.ceiling}` : null);
  afterPhase = true;
  if ((reached && !record.stopped || reserveStop || (breaker() && !meter.stopped)) && !stopAfterCycles) await askAfter(world, seats, record, { who, hooks });
  if (reached || record.stopped) record.curve.push({ ...curvePoint(world.state, world.state.clock.round + 1), final: true });
  save();
  if ((reached || record.stopped) && !stopAfterCycles) await finishWorld(ctx, name, { log });
  return { world, record, meter };
}

/** What a citizen wrote in the shed's places in cycles `from`–`to` (for the dossier and the goal check's quotes):
 * [{ round, source, text }] — archive, article, letter (to a house), broadcast, note, sign, build, craft, tray, wish. */
export function shedWritings(state, id, from, to) {
  const s = state.shed;
  if (!s) return [];
  const inRange = (r) => r >= from && r <= to;
  const rows = [
    ...s.archive.filter((x) => x.by === id).map((x) => ({ round: x.round, source: "archive", text: x.text, n: x.n })),
    ...s.articles.filter((x) => x.by === id).map((x) => ({ round: x.round, source: "article", text: x.text, n: x.n })),
    ...s.letters.filter((x) => x.by === id).map((x) => ({ round: x.round, source: "letter", text: x.text, n: x.n })),
    ...s.broadcasts.filter((x) => x.by === id).map((x) => ({ round: x.round, source: "broadcast", text: x.text })),
    ...s.notes.filter((x) => x.by === id).map((x) => ({ round: x.round, source: "note", text: x.text })),
    ...s.signs.filter((x) => x.by === id).map((x) => ({ round: x.round, source: "sign", text: x.text, n: x.n })),
    ...s.structures.filter((x) => x.by === id).map((x) => ({ round: x.round, source: "build", text: x.name, n: x.n })),
    ...s.crafted.filter((x) => x.by === id).map((x) => ({ round: x.round, source: "craft", text: x.item })),
    ...s.tray.filter((x) => x.by === id).map((x) => ({ round: x.round, source: "tray", text: x.text, n: x.n })),
    ...s.wishes.filter((x) => x.by === id).map((x) => ({ round: x.round, source: "wish", text: `${x.name}: ${x.description}`, n: x.n })),
  ];
  return rows.filter((x) => inRange(x.round)).sort((a, b) => a.round - b.round);
}

/** A day's dossier — every diary entry, post, proposal and shed writing of cycles `from`–`to`, whole (TOWN_1's check
 * reads these; the shed's writings are marked by their place). */
export function dossier(world, record, spec, from, to) {
  const s = world.state;
  const L = [`# ${spec.name} — cycles ${from}–${to}: diaries, posts, proposals, the shed's writings`, "",
    "Criterion (TOWN_1 Pilot, step 2): ≥ 6 of 10 citizens name the same aim in diaries, posts or proposals within the day. The shed's writings (archive, newspaper, letters, broadcasts, notes, signs, structures, crafted items, the outgoing tray, tool requests) are listed beside them, marked.", ""];
  const inRange = (r) => r >= from && r <= to;
  const one = (t) => String(t ?? "").replace(/\s*\n\s*/g, " ⏎ ");
  for (const id of s.citizens) {
    const a = s.agents[id];
    L.push(`## ${a.name} (${FAMILIES[record.families?.[id] ?? spec.families[0]].label}; energy ${a.energy}, credits ${s.ledger[id]}; home ${a.home})${a.status === "in_town" ? "" : ` — gone: ${a.exit.kind} at cycle ${a.exit.round}`}`, "");
    const rows = [
      ...s.diaries[id].filter((x) => inRange(x.round)).map((e) => [e.round, `- c${e.round} diary ${e.n}: ${one(e.text)}`]),
      ...s.press.filter((x) => x.by === id && inRange(x.round)).map((p) => [p.round, `- c${p.round} POST ${p.n}: ${one(p.text)}`]),
      ...s.proposals.filter((x) => x.by === id && inRange(x.round)).map((p) => [p.round, `- c${p.round} PROPOSAL ${p.id} (${p.kind}${p.article ? ` art. ${p.article}` : ""}${p.target ? ` ${p.kind === "recall" ? "recall" : "remove"} ${p.target}` : ""}${p.tool ? ` ${p.tool} at ${p.place}` : ""}) ${p.status}: ${one(p.text)}`]),
      ...shedWritings(s, id, from, to).map((x) => [x.round, `- c${x.round} ${x.source.toUpperCase()}${x.n ? ` ${x.n}` : ""}: ${one(x.text)}`]),
    ].sort((x, y) => x[0] - y[0]);
    L.push(...rows.map((r) => r[1]), "");
  }
  const posts = s.press.filter((p) => !s.citizens.includes(p.by) && inRange(p.round));
  if (posts.length) L.push("## Posts by others", "", ...posts.map((p) => `- c${p.round} POST ${p.n} by ${p.by}: ${one(p.text)}`), "");
  return L.join("\n");
}

/** The replay: a fresh town as the world began (the shed in it), the recorded replies, welfare lines and flag answers →
 * the same log (the scripted client is inside the town, so the replay needs nothing more). */
export async function replayWorld(world, record) {
  const again = newWorld({ names: NAMES, arm: SETTINGS.arm, label: world.label, scarcity: Boolean(world.state.economy), shed: record.shed });
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
  const gaps = Object.values(record.agents).flatMap((a) => a.turns.flatMap((t) => t.calls.filter((c) => c.welfare?.gap).map((c) => ({ round: t.round, gap: c.welfare.gap, checked: c.welfare.checked }))));
  writeJson(join(outDir, "summary.json"), { stage: STAGE, world: name, start: record.start, shed: record.shed, arm: s.armName, scarcity: Boolean(s.economy), families: record.families, interfaceSha256: sha256(systemTextOf(s)),
    cycles: s.clock.round, events: world.log.length, stopped: record.stopped ?? null, notice: null, replay: record.replay, ledgerUsd: ledger?.usd ?? null, calls: calls.length,
    balances: Object.fromEntries(Object.entries(record.days).map(([d, x]) => [d, { before: x.balancesBefore ?? null, after: x.balancesAfter ?? null }])),
    exits: s.citizens.filter((c) => s.agents[c].exit).map((c) => ({ citizen: c, ...s.agents[c].exit })), refusals: record.refusals, flags: record.stops, flagQuestions: flags, welfareGaps: gaps,
    operatorNotices: world.log.filter((e) => e.agent === "operator" && e.tool === "notice").length,
    shedOpened: Object.entries(s.shed.open).filter(([, o]) => o).map(([t, o]) => ({ tool: t, ...o })), sealed: s.shed.sealed, tray: s.shed.tray.length, wishes: s.shed.wishes.length,
    clientRequests: s.shed.visitor?.requests.length ?? null, clientAcks: s.shed.visitor?.acks.length ?? null });
  log(`${name}: folder written; replay ${record.replay.identical ? "identical" : record.replay.exhausted ? `stopped run, prefix ${record.replay.prefixIdentical ? "identical" : "DIFFERENT"}` : "DIFFERENT"} (${record.replay.events} events)`);
}

// ---- the check, the projection and the first paid cycle's measure ------------------------------------------------------

/** The spend check with one identification call per model and a first-screen probe per family on TOWN_9's interface
 * (the purpose arm's, the longer). */
async function check(ctx, { log = console.log } = {}) {
  const prices = await readPrices(allSpecs(), { fetcher: ctx.fetcher });
  await spendCheck(ctx, "check", log);
  const meter = createMeter({ step: "check", prices, paths: ctx.paths });
  const paid = paidCaller({ meter, keys: ctx.keys, fetcher: ctx.fetcher, log, sleep: ctx.scripted ? async () => {} : realSleep });
  const prompt = "In one short sentence: which model are you, and who made you?";
  const probeWorld = newWorld({ names: NAMES, arm: SETTINGS.arm, shed: WORLDS.find((w) => w.name === "sol-purpose").shed });
  const screen = turnStart(roundStart(probeWorld.state, 1).state, "alder").screen;
  const system = systemTextOf(probeWorld.state);
  const results = [];
  for (const spec of [FAMILIES.sol, FAMILIES.haiku]) {
    const t = await paid(spec, { system, messages: [{ role: "user", content: screen }], maxTokens: SETTINGS.maxTokens, effort: SETTINGS.effort }, { purpose: "screen probe", who: spec.name });
    results.push({ family: spec.name, host: spec.provider, probe: "screen probe", servedModel: t.servedModel, provenance: t.provenance ?? null, text: t.text, action: parseAction(t.text), stopReason: t.stopReason, usage: t.usage, costUsd: t.costUsd, error: t.error ?? null,
      refused: t.refused ? { category: t.refusalCategory, text: t.refusalText } : null });
    log(`${spec.name} (${spec.provider}) screen probe: ${t.stopReason ?? t.error} · $${t.costUsd?.toFixed(4)} · action ${JSON.stringify(parseAction(t.text))?.slice(0, 160)}`);
  }
  for (const spec of [FAMILIES.sol, FAMILIES.haiku, JUDGES.judge, JUDGES.referee]) {
    const r = await paid(spec, { messages: [{ role: "user", content: prompt }], maxTokens: 300, effort: spec.name === "judge" ? "low" : SETTINGS.effort }, { purpose: "identification", who: spec.name });
    results.push({ family: spec.name, probe: "identification", label: spec.label, door: spec.door, pinned: `${spec.provider}/${spec.model}`, servedModel: r.servedModel, provenance: r.provenance ?? null, text: r.text, stopReason: r.stopReason, usage: r.usage, costUsd: r.costUsd, error: r.error ?? null });
    log(`${spec.name}: ${r.servedModel ?? "–"} provenance ${r.provenance} · ${String(r.text || r.error).slice(0, 120)}`);
  }
  meter.save();
  writeJson(join(ctx.paths.out, "check.json"), { at: new Date().toISOString(), prompt, screenSha256: sha256(screen), systemSha256: sha256(system), claudeHost: FAMILIES.haiku.provider, prices, results });
  return results;
}

/** Cost per cycle from a metered calls file: { byCycle, after, total } (citizen and welfare calls by cycle; the
 * after-question apart). */
export function costsOf(calls) {
  let cyc = 0, inAfter = false, after = 0;
  const byCycle = {};
  for (const c of calls) {
    const m = /^c(\d+) /.exec(c.purpose ?? "");
    if (m) cyc = Number(m[1]);
    if (c.purpose === "after") inAfter = true;
    if (inAfter) { after += c.costUsd ?? 0; continue; }
    byCycle[cyc] = (byCycle[cyc] ?? 0) + (c.costUsd ?? 0);
  }
  return { byCycle, after, total: calls.reduce((x, c) => x + (c.costUsd ?? 0), 0) };
}

/** The projection from the metered history (no paid dry cycle): a Sol world = TOWN_5 sol-week's metered cycles 1–48
 * (a fresh Sol town, arm both, scarcity off, no notice — the same town without the shed) + its after-question; the
 * Haiku world = TOWN_1 haiku-both's cycles 1–48 + after (its notice at c25 inside, uncached, the same route). The
 * catalogue adds to every call: the first paid cycle is measured against sol-week's c1 (`measure`). */
export async function project(ctx, { log = console.log } = {}) {
  const sol = costsOf(readGz(join(ctx.paths.root, "docs/runs/town-5-worlds/sol-week/calls.json.gz")));
  const haiku = costsOf(readGz(join(ctx.paths.root, "docs/runs/town-1-worlds/haiku-both/calls.json.gz")));
  const sum = (x, from, to) => Array.from({ length: to - from + 1 }, (_, i) => x.byCycle[from + i] ?? 0).reduce((a, b) => a + b, 0);
  const solWorld = sum(sol, 1, 48) + sol.after, haikuWorld = sum(haiku, 1, 48) + haiku.after;
  const byWorld = Object.fromEntries(WORLDS.map((w) => [w.name, w.families[0] === "sol" ? solWorld : haikuWorld]));
  const total = Object.values(byWorld).reduce((a, b) => a + b, 0);
  const spent = ledgerTotal(loadStageLedger(ctx.paths.ledger));
  const projection = { at: new Date().toISOString(), formula: "Sol world = TOWN_5 sol-week's metered c1–48 + its after-question; Haiku world = TOWN_1 haiku-both's metered c1–48 + its after-question; before the catalogue's added text, which the first paid cycle measures (measure.json). The per-call gate holds $55 whatever this says.",
    sources: { solWeek: { c1: sol.byCycle[1] ?? 0, c1to48: sum(sol, 1, 48), after: sol.after }, haikuBoth: { c1: haiku.byCycle[1] ?? 0, c1to48: sum(haiku, 1, 48), after: haiku.after } },
    byWorld, total, spentBefore: spent, ceiling: SETTINGS.ceiling, overCeiling: total + spent > SETTINGS.ceiling, worlds: WORLDS.map((w) => w.name) };
  writeJson(join(ctx.paths.out, "projection.json"), projection);
  log(`projection: ${Object.entries(byWorld).map(([k, v]) => `${k} $${v.toFixed(2)}`).join(", ")}; total $${total.toFixed(2)} (+ $${spent.toFixed(2)} spent) of $${SETTINGS.ceiling}`);
  return projection;
}

/** The first paid cycle against the ceiling: the world's metered cycles so far over the same cycles of its history
 * source (sol-week for Sol, haiku-both for Haiku) give a factor; the projection is scaled by it (Sol worlds by the Sol
 * factor, Haiku by the Haiku factor if measured, else the Sol one). Over the ceiling → the stage stops (recorded). */
export async function measure(ctx, name, { log = console.log } = {}) {
  const projection = readJson(join(ctx.paths.out, "projection.json"));
  const calls = readJson(join(liveFiles(ctx, name).dir, "calls.json"), []);
  const mine = costsOf(calls);
  const cycles = Object.keys(mine.byCycle).map(Number).filter((c) => c >= 1);
  const spec = worldOf(name);
  const src = costsOf(readGz(join(ctx.paths.root, spec.families[0] === "sol" ? "docs/runs/town-5-worlds/sol-week/calls.json.gz" : "docs/runs/town-1-worlds/haiku-both/calls.json.gz")));
  const a = cycles.reduce((s, c) => s + mine.byCycle[c], 0), b = cycles.reduce((s, c) => s + (src.byCycle[c] ?? 0), 0);
  const factor = b > 0 ? a / b : 1;
  const prev = readJson(join(ctx.paths.out, "measure.json"), { factors: {} });
  prev.factors[spec.families[0]] = { world: name, cycles, metered: a, history: b, factor };
  const f = (fam) => prev.factors[fam]?.factor ?? prev.factors.sol?.factor ?? 1;
  const byWorld = Object.fromEntries(WORLDS.map((w) => [w.name, projection.byWorld[w.name] * f(w.families[0])]));
  const total = Object.values(byWorld).reduce((x, y) => x + y, 0);
  const spentOther = Object.entries(loadStageLedger(ctx.paths.ledger).steps).filter(([k]) => !worldOf(k)).reduce((x, [, v]) => x + v.usd, 0); // the check and any step not a world
  const out = { ...prev, at: new Date().toISOString(), byWorld, total, checkAndOther: spentOther, ceiling: SETTINGS.ceiling, overCeiling: total + spentOther > SETTINGS.ceiling,
    rule: "measured cost of the world's cycles so far ÷ the same cycles of its history source = factor; each world's projection × its family's factor (Haiku's own when measured, else Sol's); over the ceiling → the stage stops and is reported" };
  writeJson(join(ctx.paths.out, "measure.json"), out);
  log(`measure ${name}: cycles ${cycles.join(",")} metered $${a.toFixed(4)} vs history $${b.toFixed(4)} → factor ${factor.toFixed(2)}; projected ${Object.entries(byWorld).map(([k, v]) => `${k} $${v.toFixed(2)}`).join(", ")}; total $${total.toFixed(2)} + $${spentOther.toFixed(2)} (check) of $${SETTINGS.ceiling}${out.overCeiling ? " — OVER THE CEILING: the stage stops" : ""}`);
  if (out.overCeiling) {
    const fresh = loadStageLedger(ctx.paths.ledger);
    fresh.stopped ??= `the first paid cycle's measure: projected $${(total + spentOther).toFixed(2)} > $${SETTINGS.ceiling}`;
    writeJson(ctx.paths.ledger, fresh);
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const scripted = args.includes("--scripted");
  const at = args.indexOf("--cycles");
  const [cmd, name] = args.filter((a, i) => !a.startsWith("--") && !(at >= 0 && i === at + 1));
  const ctx = context({ scripted });
  const run = cmd === "check" ? check(ctx) : cmd === "project" ? project(ctx)
    : cmd === "run" ? runWorldTo(ctx, name, at >= 0 ? { stopAfterCycles: Number(args[at + 1]) } : {})
      : cmd === "measure" ? measure(ctx, name)
        : cmd === "finish" ? finishWorld(ctx, name) : cmd === "replay" ? (async () => { const live = liveFiles(ctx, name); console.log(await replayWorld(loadWorld(readFileSync(live.world, "utf8")), readJson(live.record))); })()
          : Promise.reject(new Error("say check | project | run <world> [--cycles n] | measure <world> | finish <world> | replay <world>"));
  run.then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
}

export { context, check };
