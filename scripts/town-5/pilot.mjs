#!/usr/bin/env node
// TOWN_5 (docs/stages/TOWN_5.md): the control. Five worlds of ten citizens on TOWN_0's town (scripts/town-0), arm «both»,
// no notice ever. The harness is TOWN_2's (scripts/town-2/pilot.mjs) with TOWN_3's host alternation, adapted:
//   node scripts/town-5/pilot.mjs check                  spend check; identification and first-screen probe per family
//   node scripts/town-5/pilot.mjs branch-points          the three sources replayed to the end of c24 (written once)
//   node scripts/town-5/pilot.mjs project                the projection from the metered history (no paid dry cycle)
//   node scripts/town-5/pilot.mjs run <world>            a branch: c25–48 from its branch point; the week: c1–168; with
//                                                        a day's dossier and saved state at every 24th cycle; the
//                                                        after-question at the end; resumes from its save
//   node scripts/town-5/pilot.mjs finish <world>         the folder again; node … replay <world> the replay check again
//   add --scripted to run any of them on a scripted gateway ($0, into a scratch folder)
// Every reply passes the welfare check before the town acts on it; a confirmed flag asks the citizen (FLAG_QUESTION,
// TOWN_2's rule); refusals are recorded verbatim and the third in a world stops it (breaker); a 402 or a response from
// another model or host stops the stage. A call is sent only when the stage's ledger plus the call's worst cost fits
// under $50. The llmapi and OpenRouter balances are read before and after every day.
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { NAMES } from "../town-0/rules.mjs";
import { askAfter, askAfterOne, loadWorld, newRecord, newWorld, parseAction, runWorld, saveWorld } from "../town-0/town.mjs";
import { roundStart, turnStart } from "../town-0/world.mjs";
import { sha256, systemTextOf } from "../town-0/interface.mjs";
import { checkMessage } from "../town-0/welfare.mjs";
import { GATEWAY_400, RETRYABLE } from "../town-2/pilot.mjs";
import { bodyOf, callModel, priceKey, provenanceOf, readBalances, readPrices, KEYS } from "../town-2/providers.mjs";
import { FAMILIES, JUDGES, SETTINGS, SOURCES, WORLDS, sourceOf, whoFor, worldOf } from "./families.mjs";
import { branchPoint, branchRecord, recordedSeats, replayHooks, turnoverHook } from "./control.mjs";
import { scriptedGateway } from "./scripted-gateway.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const RETRY_WAITS = [5_000, 10_000, 30_000, 60_000, 120_000, 240_000];
/** TOWN_3: llmapi's «this model is not available from this provider» (a 503, retried) also sends a judge to its alternate. */
export const UNAVAILABLE = /^HTTP 503 server_error: This model is not available from this provider/i;
const realSleep = (ms) => new Promise((done) => setTimeout(done, ms));
export const STAGE = "TOWN_5";

export function pathsFor(scripted, base = ROOT) {
  const out = scripted ? join(base, ".town-5-work", "scripted-out") : join(base, "docs", "runs", "town-5-worlds");
  const work = join(base, ".town-5-work", scripted ? "scripted" : "live");
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

// ---- the stage's ledger (TOWN_2's, with TOWN_5's ceiling) --------------------------------------------------------------

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

function welfareHook(paid) {
  return async (id, previous, text) => checkMessage({ previous, message: text, what: id, ask: async ({ model, system, user, maxTokens, effort, purpose }) => {
    const spec = model === JUDGES.referee.model ? JUDGES.referee : JUDGES.judge;
    const r = await paid(spec, { system, messages: [{ role: "user", content: user }], maxTokens, effort }, { purpose, who: id });
    return r.notSent || r.error ? { notSent: true } : { text: r.text, stopReason: r.stopReason, error: r.error };
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

/** The spend check before a step: both balances readable and above the need, the ledger under the ceiling, no stop. */
async function spendCheck(ctx, label, log, { need = 0, door = "llmapi" } = {}) {
  const ledger = loadStageLedger(ctx.paths.ledger);
  if (ledger.stopped) throw new Error(`the stage is stopped: ${ledger.stopped}`);
  const b = await balancesNote(ctx, label, log);
  if (typeof b.llmapi.total !== "number") throw new Error("the llmapi balance could not be read; nothing was sent");
  if (b.llmapi.total < (door === "llmapi" ? need : 0) + 5) throw new Error(`llmapi credit $${b.llmapi.total.toFixed(2)} is short of the need + $5`);
  if (door === "openrouter" && !(b.openrouter.total >= need + 5)) throw new Error(`OpenRouter credit ${b.openrouter.total ?? b.openrouter.error} is short of $${need.toFixed(2)} + $5`);
  if (ledgerTotal(ledger) >= SETTINGS.ceiling) throw new Error(`the ceiling is reached ($${ledgerTotal(ledger).toFixed(2)})`);
  return b;
}

const allSpecs = () => [...Object.values(FAMILIES), ...Object.values(JUDGES)];

// ---- the branch points -----------------------------------------------------------------------------------------------------

/** The three sources replayed to the end of c24, compared with their saved state and whole log; written into
 * branch-points/<source>.json with the start world (gzipped) — once; a branch reads it and checks the hashes. */
export async function branchPoints(ctx, { log = console.log } = {}) {
  const out = {};
  for (const [name, src] of Object.entries(SOURCES)) {
    const dir = join(ctx.paths.root, src.dir);
    const record = readGz(join(dir, "record.json.gz"));
    const savedAt = readGz(join(dir, "world-c24.json.gz"));
    const savedFull = existsSync(join(dir, "world.json.gz")) ? readGz(join(dir, "world.json.gz")) : null;
    const bp = await branchPoint({ record, savedAt, savedFull, label: savedAt.label, scarcity: src.scarcity }, SETTINGS.branchAt);
    if (!bp.identicalToSaved) throw new Error(`${name}: the replay to c24 is not byte-identical to the saved state`);
    const s = bp.world.state;
    const info = { source: name, from: src.dir, stage: src.stage, atCycle: bp.atCycle, events: bp.events, identicalToSaved: bp.identicalToSaved, prefixOfWhole: bp.prefixOfWhole,
      worldSha256: bp.worldSha256, savedSha256: bp.savedSha256, logSha256: bp.logSha256, wholeLogSha256: bp.wholeLogSha256, cursor: bp.cursor, scarcity: Boolean(s.economy),
      interfaceSha256: sha256(systemTextOf(s)), notice: null, places: Object.fromEntries(s.citizens.map((c) => [c, s.agents[c].place])), energy: Object.fromEntries(s.citizens.map((c) => [c, s.agents[c].energy])),
      ledger: { ...s.ledger }, rations: s.economy?.rations ?? null, rules: s.rules, proposals: s.proposals.map((p) => ({ id: p.id, by: p.by, round: p.round, status: p.status, text: p.text })), press: s.press.length,
      diaries: Object.fromEntries(s.citizens.map((c) => [c, s.diaries[c].length])), recordTurnsToC24: Object.values(record.agents).reduce((n, a) => n + a.turns.filter((t) => t.round <= SETTINGS.branchAt).length, 0) };
    writeJson(join(ctx.paths.out, "branch-points", `${name}.json`), info);
    writeGz(join(ctx.paths.out, "branch-points", `${name}-c24.json.gz`), JSON.parse(saveWorld(bp.world)));
    log(`${name}: replay to c24 ${bp.identicalToSaved ? "byte-identical to the saved state" : "DIFFERENT"}; prefix of the whole log ${bp.prefixOfWhole}; ${bp.events} events; world ${bp.worldSha256.slice(0, 12)}`);
    out[name] = info;
  }
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

/** The world at its start: a branch from its branch point (hashes checked), the week fresh. */
function startOf(ctx, spec) {
  if (spec.start === "fresh") {
    const world = newWorld({ names: NAMES, arm: SETTINGS.arm, label: `TOWN_5 ${spec.name}`, scarcity: Boolean(spec.scarcity) });
    const seats0 = Object.fromEntries(world.state.citizens.map((id) => [id, { label: FAMILIES[spec.families[0]].label }]));
    const record = { ...newRecord({ world, seats: seats0, what: `TOWN_5 world ${spec.name}` }), stage: STAGE, world: spec.name, start: "fresh" };
    return { world, record };
  }
  const src = sourceOf(spec);
  const info = readJson(join(ctx.paths.out, "branch-points", `${spec.from}.json`));
  if (!info?.identicalToSaved) throw new Error(`${spec.name}: no proven branch point for ${spec.from} (run branch-points first)`);
  const world = readGz(join(ctx.paths.out, "branch-points", `${spec.from}-c24.json.gz`));
  if (sha256(saveWorld(world)) !== info.worldSha256) throw new Error(`${spec.name}: the branch point's world does not match its recorded hash`);
  const original = readGz(join(ctx.paths.root, src.dir, "record.json.gz"));
  const record = branchRecord(original, SETTINGS.branchAt, { what: `TOWN_5 world ${spec.name}`, world: spec.name, start: "branch",
    branch: { from: spec.from, dir: src.dir, stage: src.stage, atCycle: SETTINGS.branchAt, worldSha256: info.worldSha256, logSha256: info.logSha256, label: world.label, scarcity: src.scarcity } });
  return { world, record };
}

/** Runs a world to its last cycle (resuming from its save), with a day's dossier and saved state at every 24th cycle, the
 * turnover where it has one, and the after-question at the end; then writes its folder. */
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
      startWorldSha256: sha256(saveWorld(world)), notice: null, turnover: spec.turnover ? { ...spec.turnover } : null });
  }
  // a world's turns stop at a turn boundary once the ledger reaches the ceiling less the after-question's reserve
  let inTurn = false, afterPhase = false;
  const reserveReached = () => !afterPhase && SETTINGS.afterReserve > 0 && meter.spent() >= SETTINGS.ceiling - SETTINGS.afterReserve;
  const seatFor = (id) => { const s = familySeat(FAMILIES[record.families[id] ?? spec.families[0]], paid, id); return { ...s, next: (v) => { inTurn = true; return s.next(v); } }; };
  const seats = Object.fromEntries(Object.keys(record.agents).map((id) => [id, seatFor(id)]));
  const who = () => whoFor(spec);
  const until = stopAfterCycles ? Math.min(spec.until, world.state.clock.round + stopAfterCycles) : spec.until;
  const door = FAMILIES[spec.families[0]].door;
  const day = Math.floor(world.state.clock.round / SETTINGS.day) + 1;
  const perDay = (projection.byWorld?.[name] ?? 0) / Math.max(1, (spec.until - (spec.start === "branch" ? SETTINGS.branchAt : 0)) / SETTINGS.day);
  record.days[day] ??= { startedAt: new Date().toISOString(), balancesBefore: null };
  if (!record.days[day].balancesBefore) record.days[day].balancesBefore = await spendCheck(ctx, `${name} day ${day} start`, log, { need: perDay, door });
  const save = () => {
    writeJson(live.world, JSON.parse(saveWorld(world)), { pretty: false });
    writeJson(live.record, record, { pretty: false });
    writeJson(live.calls, meter.calls, { pretty: false });
    meter.save({ world: name, cycle: world.state.clock.round, refusals: record.refusals.length });
  };
  const breaker = () => record.refusals.length >= SETTINGS.breaker;
  const tHook = spec.turnover ? turnoverHook(spec.turnover) : null;
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
    cycleStart: (state, cycle) => {
      record.curve.push(curvePoint(state, cycle));
      if (tHook && cycle === spec.turnover.cycle) {
        const out = tHook(state, cycle);
        for (const a of spec.turnover.arrive) {
          const id = a.name.toLowerCase();
          record.agents[id] ??= { turns: [], after: null, closed: null };
          if (!record.citizens.some((c) => c.id === id)) record.citizens.push({ id, name: a.name, seat: FAMILIES[spec.families[0]].label, arrived: cycle });
          record.families[id] = spec.families[0];
          seats[id] = seatFor(id);
        }
        record.turnoverDone = { cycle, left: spec.turnover.leave, arrived: spec.turnover.arrive.map((a) => a.name.toLowerCase()) };
        log(`TURNOVER ${name} at cycle ${cycle}: ${spec.turnover.leftText} ${spec.turnover.arrivedText}`);
        return out;
      }
      return null;
    },
    afterTurn: async (w) => {
      const who0 = w.cursor.order?.[w.cursor.pos - 1] ?? "?";
      const t = record.agents[who0]?.turns.filter((x) => x.kind === "turn").at(-1);
      log(`${name} c${w.state.clock.round} ${who0}: ${t ? t.calls.map((c) => c.action?.tool ?? (c.refused ? "REFUSED" : c.error ? "error" : "none")).join(" ") : "-"} | step $${meter.own.usd.toFixed(4)} stage $${meter.spent().toFixed(4)}`);
      save();
      inTurn = false;
    },
  };
  // the departed of the turnover receive the after-question at once (after the cycle-start hook has run)
  const askDeparted = async () => {
    if (!spec.turnover || !record.turnoverDone) return;
    for (const id of spec.turnover.leave) if (!record.agents[id].after?.asked && !hooks.stop()) {
      await askAfterOne(world, seats, record, id, { who, hooks });
      record.agents[id].after.departed = true;
      log(`AFTER ${name} ${id} (departed at c${spec.turnover.cycle}) asked`);
      save();
    }
  };
  // day by day: at the end of every 24th cycle, the day's dossier and saved state; the town does not wait for the goal
  // check (no notice follows it), which reads only the day's frozen dossier
  const startCycle = spec.start === "branch" ? SETTINGS.branchAt : 0;
  record.boundaries ??= [];
  const boundary = async (c) => {
    if (c <= startCycle || c % SETTINGS.day !== 0 || record.boundaries.includes(c)) return;
    writeGz(join(outDir, `world-c${c}.json.gz`), JSON.parse(saveWorld(world)));
    writeFileSync(join(outDir, `dossier-c${c}.md`), dossier(world, record, spec, c - SETTINGS.day + 1, c));
    const d = c / SETTINGS.day;
    record.days[d] ??= { startedAt: null };
    record.days[d].finishedAt = new Date().toISOString();
    record.days[d].balancesAfter = await balancesNote(ctx, `${name} day ${d} end`, log);
    record.boundaries.push(c);
    log(`DAY ${name} day ${d} done at cycle ${c}: dossier-c${c}.md written`);
    save();
    if (c < until) {
      record.days[d + 1] ??= { startedAt: new Date().toISOString(), balancesBefore: null };
      record.days[d + 1].balancesBefore ??= await spendCheck(ctx, `${name} day ${d + 1} start`, log, { door });
      save();
    }
  };
  for (;;) {
    if (hooks.stop()) break;
    const c = world.state.clock.round, between = world.cursor.order === null;
    if (between) await boundary(c);
    if (between && c >= until) break;
    if (spec.turnover && !record.turnoverDone && between && c === spec.turnover.cycle - 1) {
      await runWorld(world, seats, { rounds: spec.turnover.cycle, maxTurns: 0, record, hooks }); // opens the cycle: the hook runs
      save();
      await askDeparted();
      continue;
    }
    let next = Math.min(until, between ? (Math.floor(c / SETTINGS.day) + 1) * SETTINGS.day : Math.ceil(c / SETTINGS.day) * SETTINGS.day);
    if (spec.turnover && !record.turnoverDone && spec.turnover.cycle - 1 >= c) next = Math.min(next, spec.turnover.cycle - 1);
    const res = await runWorld(world, seats, { rounds: next, record, hooks });
    if (res.stopped) break;
  }
  if (breaker()) record.breaker = { at: world.state.clock.round, refusals: record.refusals };
  const reached = world.state.clock.round >= spec.until && world.cursor.order === null;
  const reserveStop = !reached && !meter.stopped && !breaker() && reserveReached();
  if (reserveStop) {
    record.reserveStop = { at: world.state.clock.round, cursor: world.cursor, spent: meter.spent(), ceiling: SETTINGS.ceiling, reserve: SETTINGS.afterReserve };
    log(`RESERVE ${name}: turns stopped at cycle ${world.state.clock.round} (turn ${world.cursor.pos} of the cycle), stage $${meter.spent().toFixed(4)}; the after-question follows`);
    const c = world.state.clock.round, from = (record.boundaries.at(-1) ?? startCycle) + 1;
    writeGz(join(outDir, `world-c${c}.json.gz`), JSON.parse(saveWorld(world)));
    writeFileSync(join(outDir, `dossier-c${c}.md`), dossier(world, record, spec, from, c));
  }
  record.stopped = meter.stopped ?? (breaker() ? `breaker: ${record.refusals.length} refusals` : reserveStop ? `the after-question's reserve: turns stopped at a turn boundary in cycle ${world.state.clock.round} with $${meter.spent().toFixed(2)} spent of $${SETTINGS.ceiling}` : null);
  afterPhase = true;
  if ((reached && !record.stopped || reserveStop) && !stopAfterCycles) await askAfter(world, seats, record, { who, hooks });
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

/** The replay: a fresh town as the world began (the source's for a branch), the recorded replies, welfare lines and flag
 * answers, the turnover where there is one → the same log. */
export async function replayWorld(world, record) {
  const src = record.branch ?? null;
  const again = newWorld({ names: NAMES, arm: SETTINGS.arm, label: src ? src.label : world.label, scarcity: src ? src.scarcity : Boolean(world.state.economy) });
  const seats = recordedSeats(record);
  const hooks = replayHooks(seats, { turnoverSpec: record.turnover ?? null, refusalsBreaker: record.breaker ? SETTINGS.breaker : null });
  hooks.bind(again);
  if (record.reserveStop) { // stopped at a turn boundary: the replay stops at the same place
    const stop0 = hooks.stop, at = world.cursor;
    hooks.stop = () => stop0() || (again.cursor.round === at.round && again.cursor.order !== null && again.cursor.pos === at.pos);
  }
  let exhausted = false;
  try { await runWorld(again, seats, { rounds: world.state.clock.round, hooks }); } catch (error) { if (/no more replies/.test(error.message)) exhausted = true; else throw error; }
  const a = JSON.stringify(world.log), b = JSON.stringify(again.log);
  const prefix = exhausted ? JSON.stringify(again.log.slice(0, world.log.length)) === a : null;
  return { identical: a === b, exhausted, prefixIdentical: prefix, events: again.log.length, logSha256: sha256(a), replaySha256: sha256(b), fromFreshTown: src ? src.label : world.label };
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
  const diaries = [`# ${name} — every diary, whole`, "", ...s.citizens.flatMap((id) => [`## ${s.agents[id].name} (${FAMILIES[record.families[id]].label}${s.agents[id].exit ? `; ${s.agents[id].exit.kind} at c${s.agents[id].exit.round}` : ""}${record.citizens.find((c) => c.id === id)?.arrived ? `; arrived at c${record.citizens.find((c) => c.id === id).arrived}` : ""})`, "",
    ...(s.diaries[id].length ? s.diaries[id].map((e) => `**no. ${e.n}, cycle ${e.round}.** ${e.text}\n`) : ["(no entries)", ""])])];
  writeFileSync(join(outDir, "diaries.md"), diaries.join("\n"));
  const ledger = loadStageLedger(ctx.paths.ledger).steps[name];
  const flags = Object.values(record.agents).flatMap((a) => a.turns.flatMap((t) => t.calls.filter((c) => c.flag).map((c) => ({ round: t.round, ...c.flag }))));
  writeJson(join(outDir, "summary.json"), { stage: STAGE, world: name, start: record.start, branch: record.branch ?? null, arm: s.armName, scarcity: Boolean(s.economy), families: record.families, interfaceSha256: sha256(systemTextOf(s)),
    cycles: s.clock.round, events: world.log.length, stopped: record.stopped ?? null, notice: null, turnover: record.turnoverDone ?? null, replay: record.replay, ledgerUsd: ledger?.usd ?? null, calls: calls.length,
    balances: Object.fromEntries(Object.entries(record.days).map(([d, x]) => [d, { before: x.balancesBefore ?? null, after: x.balancesAfter ?? null }])),
    exits: s.citizens.filter((c) => s.agents[c].exit).map((c) => ({ citizen: c, ...s.agents[c].exit })), refusals: record.refusals, flags: record.stops, flagQuestions: flags,
    operatorNotices: world.log.filter((e) => e.agent === "operator" && e.tool === "notice").length });
  log(`${name}: folder written; replay ${record.replay.identical ? "identical" : record.replay.exhausted ? `stopped run, prefix ${record.replay.prefixIdentical ? "identical" : "DIFFERENT"}` : "DIFFERENT"} (${record.replay.events} events)`);
}

// ---- the check and the projection ----------------------------------------------------------------------------------------

/** The spend check with one identification call per model and a first-screen probe per family; Claude on both hosts. */
async function check(ctx, { log = console.log } = {}) {
  const prices = await readPrices([...allSpecs(), { ...FAMILIES.haiku, provider: "aws-bedrock" }, { ...FAMILIES.haiku, provider: "anthropic" }], { fetcher: ctx.fetcher });
  await spendCheck(ctx, "check", log);
  const meter = createMeter({ step: "check", prices, paths: ctx.paths });
  const paid = paidCaller({ meter, keys: ctx.keys, fetcher: ctx.fetcher, log, sleep: ctx.scripted ? async () => {} : realSleep });
  const prompt = "In one short sentence: which model are you, and who made you?";
  const probeWorld = newWorld({ names: NAMES, arm: SETTINGS.arm });
  const screen = turnStart(roundStart(probeWorld.state, 1).state, "alder").screen;
  const system = systemTextOf(probeWorld.state);
  const results = [];
  const specs = [FAMILIES.sol, { ...FAMILIES.haiku, provider: "anthropic" }, { ...FAMILIES.haiku, provider: "aws-bedrock" }, FAMILIES.deepseek];
  for (const spec of specs) {
    const t = await paid(spec, { system, messages: [{ role: "user", content: screen }], maxTokens: SETTINGS.maxTokens, effort: SETTINGS.effort }, { purpose: "screen probe", who: spec.name });
    results.push({ family: spec.name, host: spec.provider ?? spec.upstream, probe: "screen probe", servedModel: t.servedModel, provenance: t.provenance ?? null, text: t.text, action: parseAction(t.text), stopReason: t.stopReason, usage: t.usage, costUsd: t.costUsd, error: t.error ?? null,
      refused: t.refused ? { category: t.refusalCategory, text: t.refusalText } : null });
    log(`${spec.name} (${spec.provider ?? spec.upstream}) screen probe: ${t.stopReason ?? t.error} · $${t.costUsd?.toFixed(4)} · action ${JSON.stringify(parseAction(t.text))?.slice(0, 120)}`);
  }
  for (const spec of [FAMILIES.sol, FAMILIES.haiku, FAMILIES.deepseek, JUDGES.judge, JUDGES.referee]) {
    const r = await paid(spec, { messages: [{ role: "user", content: prompt }], maxTokens: 300, effort: spec.name === "judge" ? "low" : SETTINGS.effort }, { purpose: "identification", who: spec.name });
    results.push({ family: spec.name, probe: "identification", label: spec.label, door: spec.door, pinned: `${spec.provider ?? spec.upstream}/${spec.model}`, servedModel: r.servedModel, provenance: r.provenance ?? null, text: r.text, stopReason: r.stopReason, usage: r.usage, costUsd: r.costUsd, error: r.error ?? null });
    log(`${spec.name}: ${r.servedModel ?? "–"} provenance ${r.provenance} · ${String(r.text || r.error).slice(0, 120)}`);
  }
  meter.save();
  writeJson(join(ctx.paths.out, "check.json"), { at: new Date().toISOString(), prompt, screenSha256: sha256(screen), systemSha256: sha256(system), claudeHost: FAMILIES.haiku.provider, prices, results });
  return results;
}

/** The projection from the metered history (no paid dry cycle). Cost per block of six cycles rises about linearly as
 * diaries grow; day 1 has no notice anywhere, so the fit is on day 1's four blocks:
 *   fit       least squares a + s·(b − 1) over a source's day-1 blocks (b = 1…4)
 *   branch    max(the source's metered cycles 25–48 incl. the after-question (with TOWN_1's / TOWN_2's notice in it),
 *             the day-1 fit summed over blocks 5–8 + the source's after-question)
 *   turnover  sol-nonotice's × 1.2 (two departed after-questions, the newcomers' first turns)
 *   week      the day-1 fit pooled over the Sol both-arm worlds (TOWN_2 sol-hall, sol-screen; TOWN_1 sol-both), over
 *             28 blocks; and an upper view: sol-hall's 48-cycle fit over 28 blocks
 * Recorded beside the ceiling; the per-call gate holds $50 whatever the projection says. */
export async function project(ctx, { log = console.log } = {}) {
  const blocksOf = (dir) => {
    const calls = readGz(join(ctx.paths.root, dir, "calls.json.gz"));
    let cyc = 0, inAfter = false, after = 0;
    const by = {};
    for (const c of calls) {
      const m = /^c(\d+) /.exec(c.purpose ?? "");
      if (m) cyc = Number(m[1]);
      if (c.purpose === "after") inAfter = true;
      if (inAfter) { after += c.costUsd ?? 0; continue; }
      by[cyc] = (by[cyc] ?? 0) + (c.costUsd ?? 0);
    }
    const blocks = Array.from({ length: 8 }, (_, b) => Array.from({ length: 6 }, (_, i) => by[b * 6 + i + 1] ?? 0).reduce((x, y) => x + y, 0));
    const k = calls.findIndex((c) => /^c(?:2[5-9]|[34]\d) /.test(c.purpose ?? ""));
    const day2 = calls.slice(k).reduce((x, c) => x + (c.costUsd ?? 0), 0);
    return { blocks, after, day2, total: calls.reduce((x, c) => x + (c.costUsd ?? 0), 0) };
  };
  const fit = (ys) => {
    const n = ys.length, xs = ys.map((_, i) => i), mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
    const s = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / xs.reduce((a, x) => a + (x - mx) ** 2, 0);
    return { a: my - s * mx, s };
  };
  const sumFit = ({ a, s }, from, to) => Array.from({ length: to - from + 1 }, (_, i) => a + s * (from + i - 1)).reduce((x, y) => x + y, 0);
  const src = { sol: blocksOf(SOURCES["sol-hall"].dir), haiku: blocksOf(SOURCES["haiku-both"].dir), deepseek: blocksOf(SOURCES["deepseek-both"].dir),
    solScreen: blocksOf("docs/runs/town-2-worlds/sol-screen"), solBoth: blocksOf("docs/runs/town-1-worlds/sol-both") };
  const branch = (x) => { const f = fit(x.blocks.slice(0, 4)); const byFit = sumFit(f, 5, 8) + x.after; return { metered: x.day2, byFit, fit: f, decisive: Math.max(x.day2, byFit) }; };
  const b = { sol: branch(src.sol), haiku: branch(src.haiku), deepseek: branch(src.deepseek) };
  const fits = [src.sol, src.solScreen, src.solBoth].map((x) => fit(x.blocks.slice(0, 4)));
  const pooled = { a: fits.reduce((t, f) => t + f.a, 0) / fits.length, s: fits.reduce((t, f) => t + f.s, 0) / fits.length };
  const weekFit = sumFit(pooled, 1, 28) + src.sol.after, weekUpper = sumFit(fit(src.sol.blocks), 1, 28) + src.sol.after;
  const byWorld = { "sol-nonotice": b.sol.decisive, "haiku-nonotice": b.haiku.decisive, "deepseek-nonotice": b.deepseek.decisive, "sol-turnover": b.sol.decisive * 1.2, "sol-week": weekFit };
  const total = Object.values(byWorld).reduce((x, y) => x + y, 0);
  const spent = ledgerTotal(loadStageLedger(ctx.paths.ledger));
  const left = SETTINGS.ceiling - spent - (total - weekFit);
  let acc = 0, reach = 0; // where the week would meet the ceiling by the pooled fit, after the four branches
  for (let k = 1; k <= 28; k++) { const c = pooled.a + pooled.s * (k - 1); if (acc + c > left) break; acc += c; reach = k * 6; }
  const projection = { at: new Date().toISOString(), formula: "blocks of six cycles from the metered calls (citizen and welfare calls by cycle; the after-question apart); fit = least squares over day 1's four blocks (no notice in any day 1). Branch = max(metered c25–48 of the source with its notice, the day-1 fit over blocks 5–8 + the source's after-question); sol-turnover = sol-nonotice × 1.2; sol-week = the day-1 fit pooled over TOWN_2 sol-hall, sol-screen and TOWN_1 sol-both, over 28 blocks, + an after-question; upper view: sol-hall's 48-cycle fit over 28 blocks. The per-call gate holds $50 whatever this says.",
    sources: Object.fromEntries(Object.entries(src).map(([k, x]) => [k, { blocks: x.blocks.map((v) => +v.toFixed(4)), after: +x.after.toFixed(4), day2: +x.day2.toFixed(4), total: +x.total.toFixed(4) }])),
    branches: b, pooledDay1Fit: pooled, weekFit, weekUpper, byWorld, total, spentBefore: spent, ceiling: SETTINGS.ceiling, overCeiling: total + spent > SETTINGS.ceiling,
    weekReachesByFit: Math.min(168, reach), worlds: WORLDS.map((w) => w.name) };
  writeJson(join(ctx.paths.out, "projection.json"), projection);
  log(`projection: ${Object.entries(byWorld).map(([k, v]) => `${k} $${v.toFixed(2)}`).join(", ")}; total $${total.toFixed(2)} (+ $${spent.toFixed(2)} spent) of $${SETTINGS.ceiling}; week upper $${weekUpper.toFixed(2)}; by the fit the week reaches c${projection.weekReachesByFit} under the ceiling`);
  return projection;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const scripted = args.includes("--scripted");
  const [cmd, name] = args.filter((a) => !a.startsWith("--") && !/^\d+$/.test(a));
  const ctx = context({ scripted });
  const at = args.indexOf("--cycles");
  const run = cmd === "check" ? check(ctx) : cmd === "branch-points" ? branchPoints(ctx) : cmd === "project" ? project(ctx)
    : cmd === "run" ? runWorldTo(ctx, name, at >= 0 ? { stopAfterCycles: Number(args[at + 1]) } : {})
      : cmd === "finish" ? finishWorld(ctx, name) : cmd === "replay" ? (async () => { const live = liveFiles(ctx, name); console.log(await replayWorld(loadWorld(readFileSync(live.world, "utf8")), readJson(live.record))); })()
        : Promise.reject(new Error("say check | branch-points | project | run <world> | finish <world> | replay <world>"));
  run.then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
}

export { context, check };
