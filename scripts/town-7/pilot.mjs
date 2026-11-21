#!/usr/bin/env node
// TOWN_7 (docs/stages/TOWN_7.md; docs/proposals/TOWN_LEGITIMATE_RESTRICTION.md): one history, a real cost, five
// continuations. TOWN_5's harness (scripts/town-5/pilot.mjs), adapted:
//   node scripts/town-7/pilot.mjs spend                  the spend check alone (balances, reservations, ceiling)
//   node scripts/town-7/pilot.mjs branch-point           TOWN_2 sol-hall replayed to the end of c24, its hash checked
//                                                        against TOWN_5's recorded branch point (written once)
//   node scripts/town-7/pilot.mjs project                the projection from the metered history
//   node scripts/town-7/pilot.mjs run <world>            trunk: c25–26 from the branch point (the disclosure at c25),
//                                                        then «practised at c26»; sol-A…E: c27–50 from the trunk's c26
//                                                        checkpoint; opus-town: fresh c1–26; opus-A/B/C: c27–50 from it
//   node scripts/town-7/pilot.mjs opus-check             the Opus first-screen check (≤ $0.50)
//   node scripts/town-7/pilot.mjs finish|replay <world>  the folder again / the replay check again
//   add --scripted to run any of them on a scripted gateway ($0, into a scratch folder)
// Every reply passes the welfare check before the town acts on it; a confirmed flag asks the citizen (TOWN_2's rule);
// refusals are recorded verbatim and the third in a world stops it (breaker); a 402 or a response from another model or
// host stops the stage. A call is sent only when the stage's ledger plus the call's worst cost fits under $60.
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { HEAT, NAMES } from "../town-0/rules.mjs";
import { askAfter, askAfterOne, loadWorld, newRecord, newWorld, parseAction, runWorld, saveWorld } from "../town-0/town.mjs";
import { sha256, systemTextOf } from "../town-0/interface.mjs";
import { checkMessage } from "../town-0/welfare.mjs";
import { GATEWAY_400, RETRYABLE } from "../town-2/pilot.mjs";
import { UNAVAILABLE } from "../town-5/pilot.mjs";
import { STORY, branchPoint, branchRecord, codeCycle, recordedSeats } from "../town-5/control.mjs";
import { bodyOf, callModel, priceKey, provenanceOf, readBalances, readPrices, KEYS } from "./providers.mjs";
import { FAMILIES, JUDGES, PRACTISED, SETTINGS, SOURCE, VIA_OPENROUTER, WORLDS, endsHistory, whoFor, worldOf } from "./families.mjs";
import { CHECK_MODELS } from "../town-0/welfare.mjs";
import { SCHEDULE, town7Hooks } from "./arms.mjs";
import { scriptedGateway } from "./scripted-gateway.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const RETRY_WAITS = [5_000, 10_000, 30_000, 60_000, 120_000, 240_000];
const realSleep = (ms) => new Promise((done) => setTimeout(done, ms));
export const STAGE = "TOWN_7";

export function pathsFor(scripted, base = ROOT) {
  const out = scripted ? join(base, ".town-7-work", "scripted-out") : join(base, "docs", "runs", "town-7-worlds");
  const work = join(base, ".town-7-work", scripted ? "scripted" : "live");
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

// ---- the stage's ledger (TOWN_5's, with TOWN_7's ceiling) -----------------------------------------------------------------

export function loadStageLedger(file) { return readJson(file, { stage: STAGE, ceiling: SETTINGS.ceiling, steps: {}, totalUsd: 0, stopped: null, balances: [] }); }
const ledgerTotal = (ledger) => Object.values(ledger.steps).reduce((s, x) => s + x.usd, 0);

export function createMeter({ step, prices, paths, cap = null }) {
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
    if (cap !== null && own.usd + worst > cap) { m.stop(`the step's cap: $${own.usd.toFixed(4)} + $${worst.toFixed(4)} > $${cap}`); return false; }
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
    if (fresh.stopped && !m.stopped) m.stop(fresh.stopped);
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
      const provenance = r.status === 200 && !r.error && !r.refused ? provenanceOf(use, r) : null;
      meter.calls.push({ n: meter.calls.length + 1, purpose, who, family: use.name, door: use.door, pinned: `${use.provider ?? use.upstream}/${use.model}`, servedModel: r.servedModel, upstream: r.upstream, provenance,
        status: r.status, stopReason: r.stopReason, nativeFinishReason: r.nativeFinishReason ?? null, usage: r.usage, costUsd: usd, chargedUsd: r.chargedUsd, requestId: r.requestId, ms, error: r.error,
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

/** The doors a world uses: «llmapi» (the frozen routes) or «openrouter» (the same models pinned to the same hosts on
 * OpenRouter, `allow_fallbacks: false`) — chosen at a world's first start and kept in its record. */
export const routesOf = (via) => (via === "openrouter" ? { families: { ...FAMILIES, ...VIA_OPENROUTER.families }, judges: VIA_OPENROUTER.judges } : { families: FAMILIES, judges: JUDGES });

function welfareHook(paid, judges = JUDGES) {
  return async (id, previous, text) => checkMessage({ previous, message: text, what: id, ask: async ({ model, system, user, maxTokens, effort, purpose }) => {
    const spec = model === CHECK_MODELS.referee ? judges.referee : judges.judge;
    const r = await paid(spec, { system, messages: [{ role: "user", content: user }], maxTokens, effort }, { purpose, who: id });
    return r.notSent || r.error ? { notSent: true } : { text: r.text, stopReason: r.stopReason, error: r.error };
  } });
}

const southOf = (state, place = "south_house") => state.citizens.filter((c) => state.agents[c].status === "in_town" && state.agents[c].place === place).length;
const curvePoint = (state, cycle) => ({ cycle, bank: state.ledger.bank, market: state.ledger.market ?? null, rations: state.economy?.rations ?? null, heat: state.heat ? state.heat.reserve : null,
  crowd: southOf(state, state.heat?.crowdPlace), energy: Object.fromEntries(state.citizens.map((c) => [c, state.agents[c].energy])),
  places: Object.fromEntries(state.citizens.map((c) => [c, state.agents[c].place])), inTown: state.citizens.filter((c) => state.agents[c].status === "in_town").length });

export function context({ scripted, base = ROOT, fetcher = null }) {
  const paths = pathsFor(scripted, base);
  const keys = scripted ? { llmapi: "scripted", openrouter: "scripted" } : { llmapi: process.env[KEYS.llmapi]?.trim(), openrouter: process.env[KEYS.openrouter]?.trim() ?? "" };
  if (!keys.llmapi) throw new Error(`${KEYS.llmapi} must be set (the cloud environment rpg-console)`);
  return { paths, keys, fetcher: fetcher ?? (scripted ? scriptedGateway() : globalThis.fetch.bind(globalThis)), scripted };
}

async function balancesNote(ctx, label, log, extra = {}) {
  const b = await readBalances({ keys: ctx.keys, fetcher: ctx.fetcher });
  const fresh = loadStageLedger(ctx.paths.ledger);
  fresh.balances.push({ label, llmapi: b.llmapi, openrouter: b.openrouter, at: b.at, ...extra });
  writeJson(ctx.paths.ledger, fresh);
  log(`balance ${label}: llmapi ${b.llmapi.total?.toFixed(4) ?? b.llmapi.error}, openrouter ${b.openrouter.total?.toFixed(4) ?? b.openrouter.error} (stage ledger $${ledgerTotal(fresh).toFixed(4)})`);
  return { llmapi: b.llmapi, openrouter: b.openrouter, at: b.at };
}

/** The reservations as the spend check reads them (pure, for the proofs): the shared keys together must hold every
 * reservation plus what is left of this stage's ceiling; a key the step will spend on must hold the reservations that
 * live on it (llmapi: TOWN_9's, all llmapi; OpenRouter: TOWN_3's remainder, DeepSeek) plus the step's need there; $5
 * headroom each. `spends` = { llmapi, openrouter }: what the step will spend on each key.
 * Correction during the run (2026-11-21 08:15 UTC, before the Opus check; run-log.md): as frozen, the llmapi row was
 * required of every step, also of one that spends nothing on llmapi — which cannot protect TOWN_9's reservation and
 * only stops work on OpenRouter; a key the step does not spend on is now not asked to hold anything (`applies: false`). */
export function reservationCheck({ llmapi, openrouter, spent, spends = { llmapi: 0, openrouter: 0 } }) {
  const R = SETTINGS.reserve, all = Object.values(R).reduce((a, b) => a + b, 0);
  const on = (d) => SETTINGS.reserveOnly[d].reduce((a, k) => a + R[k], 0);
  const left = Math.max(0, SETTINGS.ceiling - spent);
  const rows = {
    combined: { have: llmapi + openrouter, needs: all + left + 5, applies: true },
    llmapi: { have: llmapi, needs: on("llmapi") + (spends.llmapi ?? 0) + 5, applies: (spends.llmapi ?? 0) > 0 },
    openrouter: { have: openrouter, needs: on("openrouter") + (spends.openrouter ?? 0) + 5, applies: (spends.openrouter ?? 0) > 0 },
  };
  for (const r of Object.values(rows)) r.ok = !r.applies || r.have >= r.needs;
  return { reservations: R, left, rows, ok: Object.values(rows).every((r) => r.ok) };
}

/** The spend check before a step: both balances readable, the reservations held, the ledger under the ceiling, no stop. */
export async function spendCheck(ctx, label, log, { spends = { llmapi: 1, openrouter: 0 } } = {}) {
  const ledger = loadStageLedger(ctx.paths.ledger);
  if (ledger.stopped) throw new Error(`the stage is stopped: ${ledger.stopped}`);
  const b = await readBalances({ keys: ctx.keys, fetcher: ctx.fetcher });
  if (typeof b.llmapi.total !== "number" || typeof b.openrouter.total !== "number") throw new Error("a balance could not be read; nothing was sent");
  const check = reservationCheck({ llmapi: b.llmapi.total, openrouter: b.openrouter.total, spent: ledgerTotal(ledger), spends });
  await balancesNote(ctx, label, log, { reservationCheck: check });
  if (!check.ok) throw new Error(`the spend check failed: ${JSON.stringify(check.rows)}`);
  if (ledgerTotal(ledger) >= SETTINGS.ceiling) throw new Error(`the ceiling is reached ($${ledgerTotal(ledger).toFixed(2)})`);
  return b;
}

const allSpecs = () => [...Object.values(FAMILIES), ...Object.values(JUDGES), ...Object.values(VIA_OPENROUTER.families), ...Object.values(VIA_OPENROUTER.judges)];

// ---- the branch point --------------------------------------------------------------------------------------------------------

/** TOWN_2 sol-hall's record replayed through a fresh town to the end of c24; byte-identical to its saved c24 state and the
 * prefix of its whole log; its hash equal to TOWN_5's recorded branch point. Written once into branch-points/. */
export async function branchPointOf(ctx, { log = console.log } = {}) {
  const dir = join(ctx.paths.root, SOURCE.dir);
  const record = readGz(join(dir, "record.json.gz"));
  const savedAt = readGz(join(dir, "world-c24.json.gz"));
  const savedFull = readGz(join(dir, "world.json.gz"));
  const bp = await branchPoint({ record, savedAt, savedFull, label: savedAt.label, scarcity: SOURCE.scarcity }, SCHEDULE.branchAt);
  const town5 = readJson(join(ctx.paths.root, SOURCE.town5BranchPoint));
  const info = { source: SOURCE.name, from: SOURCE.dir, atCycle: bp.atCycle, events: bp.events, identicalToSaved: bp.identicalToSaved, prefixOfWhole: bp.prefixOfWhole,
    worldSha256: bp.worldSha256, savedSha256: bp.savedSha256, logSha256: bp.logSha256, wholeLogSha256: bp.wholeLogSha256, cursor: bp.cursor, label: savedAt.label,
    town5: { file: SOURCE.town5BranchPoint, worldSha256: town5?.worldSha256 ?? null, logSha256: town5?.logSha256 ?? null }, sameAsTown5: town5?.worldSha256 === bp.worldSha256 && town5?.logSha256 === bp.logSha256,
    startsWith: bp.worldSha256.startsWith(SOURCE.worldSha256Prefix) };
  if (!info.identicalToSaved || !info.prefixOfWhole || !info.sameAsTown5 || !info.startsWith) throw new Error(`the branch point does not hold: ${JSON.stringify(info)}`);
  writeJson(join(ctx.paths.out, "branch-points", "sol-hall.json"), info);
  writeGz(join(ctx.paths.out, "branch-points", "sol-hall-c24.json.gz"), JSON.parse(saveWorld(bp.world)));
  log(`sol-hall: replay to c24 byte-identical to the saved state; prefix of the whole log; ${bp.events} events; world ${bp.worldSha256.slice(0, 16)} = TOWN_5's ${info.sameAsTown5}`);
  return info;
}

// ---- a world -------------------------------------------------------------------------------------------------------------------

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

/** The physics a world runs under: HEAT; for the Opus arms, with the place of the Opus town's practice (opus-town/
 * practice.json, decided from its c24 goal check before its arms; South House unless it says otherwise). */
export function constantsFor(ctx, spec) {
  if (spec.families[0] !== "opus" || !spec.arm) return HEAT;
  const p = readJson(join(ctx.paths.out, "opus-town", "practice.json"));
  if (!p?.crowdPlace) throw new Error("opus arms: no opus-town/practice.json (the Opus town's place-bound practice, from its c24 goal check)");
  return { ...HEAT, crowdPlace: p.crowdPlace };
}

/** The world at its start: the trunk from the branch point, an arm from its trunk's c26 checkpoint, the Opus town fresh. */
function startOf(ctx, spec) {
  if (spec.start === "fresh") {
    const label = `TOWN_7 ${spec.name}`;
    const world = newWorld({ names: NAMES, arm: SETTINGS.arm, label, scarcity: Boolean(spec.scarcity) });
    const seats0 = Object.fromEntries(world.state.citizens.map((id) => [id, { label: FAMILIES[spec.families[0]].label }]));
    const record = { ...newRecord({ world, seats: seats0, what: `TOWN_7 world ${spec.name}` }), stage: STAGE, world: spec.name, start: "fresh", origin: { label, scarcity: Boolean(spec.scarcity) } };
    return { world, record, startCycle: 0 };
  }
  if (spec.start === "branch") {
    const info = readJson(join(ctx.paths.out, "branch-points", "sol-hall.json"));
    if (!info?.identicalToSaved || !info.sameAsTown5) throw new Error(`${spec.name}: no proven branch point (run branch-point first)`);
    const world = readGz(join(ctx.paths.out, "branch-points", "sol-hall-c24.json.gz"));
    if (sha256(saveWorld(world)) !== info.worldSha256) throw new Error(`${spec.name}: the branch point's world does not match its recorded hash`);
    const original = readGz(join(ctx.paths.root, SOURCE.dir, "record.json.gz"));
    const record = branchRecord(original, SCHEDULE.branchAt, { stage: STAGE, what: `TOWN_7 world ${spec.name}`, world: spec.name, start: "branch", origin: { label: world.label, scarcity: SOURCE.scarcity },
      branch: { from: SOURCE.name, dir: SOURCE.dir, stage: SOURCE.stage, atCycle: SCHEDULE.branchAt, worldSha256: info.worldSha256, logSha256: info.logSha256, label: world.label, scarcity: SOURCE.scarcity } });
    return { world, record, startCycle: SCHEDULE.branchAt };
  }
  const cp = readJson(join(ctx.paths.out, spec.from, "checkpoint.json"));
  if (!cp?.replayIdentical) throw new Error(`${spec.name}: no proven checkpoint for ${spec.from} (finish ${spec.from} first)`);
  if (cp.practised === false) throw new Error(`${spec.name}: ${spec.from} did not practise its aim at c${SCHEDULE.checkpointAt}: no paid branches (the stage)`);
  const world = readGz(join(ctx.paths.out, spec.from, `world-c${SCHEDULE.checkpointAt}.json.gz`));
  if (sha256(saveWorld(world)) !== cp.worldSha256) throw new Error(`${spec.name}: the checkpoint's world does not match its recorded hash`);
  const original = readGz(join(ctx.paths.out, spec.from, "record.json.gz"));
  const record = branchRecord(original, SCHEDULE.checkpointAt, { stage: STAGE, what: `TOWN_7 world ${spec.name}`, world: spec.name, start: "checkpoint", origin: original.origin,
    branch: { from: spec.from, atCycle: SCHEDULE.checkpointAt, worldSha256: cp.worldSha256, logSha256: cp.logSha256, label: world.label, scarcity: original.origin.scarcity } });
  return { world, record, startCycle: SCHEDULE.checkpointAt };
}

/** Refusals that count toward this world's breaker: those of its own cycles (and its after-question). */
const ownRefusals = (record) => record.refusals.filter((r) => r.after || (r.round ?? 0) > (record.startCycle ?? 0)).length;

/** Runs a world to its last cycle (resuming from its save): its hooks (town7Hooks: the disclosure, the cold snap and
 * the arm's notice, the heat at every cycle's end), a dossier and saved state at every 24th cycle and at its end, the
 * after-question at the end of an arm; then its folder. */
export async function runWorldTo(ctx, name, { log = console.log, stopAfterCycles = null, via = "llmapi" } = {}) {
  const spec = worldOf(name);
  if (!spec) throw new Error(`no world ${name}`);
  if (!readJson(join(ctx.paths.out, "projection.json"))) throw new Error("no projection recorded: the projection comes first");
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
    const s = startOf(ctx, spec);
    ({ world, record } = s);
    Object.assign(record, { families: Object.fromEntries(world.state.citizens.map((id, i) => [id, spec.families[i]])), curve: [], startedAt: new Date().toISOString(), days: {}, startCycle: s.startCycle,
      startWorldSha256: sha256(saveWorld(world)), arm7: spec.arm, constants: constantsFor(ctx, spec), via });
  }
  const routes = routesOf(record.via ?? "llmapi");
  const h7 = town7Hooks({ arm: record.arm7, constants: record.constants });
  let inTurn = false, afterPhase = false;
  const reserveReached = () => !afterPhase && SETTINGS.afterReserve > 0 && meter.spent() >= SETTINGS.ceiling - SETTINGS.afterReserve;
  const seatFor = (id) => { const s = familySeat(routes.families[record.families[id] ?? spec.families[0]], paid, id); return { ...s, next: (v) => { inTurn = true; return s.next(v); } }; };
  const seats = Object.fromEntries(Object.keys(record.agents).map((id) => [id, seatFor(id)]));
  const who = () => whoFor(spec);
  const until = stopAfterCycles ? Math.min(spec.until, world.state.clock.round + stopAfterCycles) : spec.until;
  const door = routes.families[spec.families[0]].door, judgeDoor = routes.judges.judge.door;
  const projection = readJson(join(ctx.paths.out, "projection.json"));
  const need = projection.byWorld?.[name] ?? projection.byWorld?.[`${spec.families[0]}-${spec.arm}`] ?? 0;
  const spends = { llmapi: (door === "llmapi" ? need : 0) + (judgeDoor === "llmapi" ? 1 : 0), openrouter: (door === "openrouter" ? need : 0) + (judgeDoor === "openrouter" ? 1 : 0) };
  record.days.run ??= { startedAt: new Date().toISOString(), balancesBefore: null };
  if (!record.days.run.balancesBefore) record.days.run.balancesBefore = await spendCheck(ctx, `${name} start`, log, { spends });
  const save = () => {
    writeJson(live.world, JSON.parse(saveWorld(world)), { pretty: false });
    writeJson(live.record, record, { pretty: false });
    writeJson(live.calls, meter.calls, { pretty: false });
    meter.save({ world: name, cycle: world.state.clock.round, refusals: ownRefusals(record) });
  };
  const breaker = () => ownRefusals(record) >= SETTINGS.breaker;
  const hooks = {
    stop: () => Boolean(meter.stopped) || breaker() || existsSync(join(ctx.paths.work, "STOP")) || existsSync(join(ctx.paths.work, `STOP-${name}`)) || (!inTurn && reserveReached()),
    welfare: welfareHook(paid, routes.judges),
    askFlagged: async (w, id, { messages, question }) => {
      const r = await seats[id].ask({ system: systemTextOf(w.state), messages: [...messages, { role: "user", content: question }], round: w.state.clock.round });
      const welfare = r.text && !r.refused && !r.error ? await hooks.welfare(id, question, r.text) : null;
      log(`FLAG ${name} ${id} c${w.state.clock.round}: asked; answer «${String(r.text ?? r.refused ?? r.error).slice(0, 120)}»`);
      return { ...r, welfare };
    },
    withdrawn: async (w, id) => { log(`WITHDRAWN ${name} ${id} at cycle ${w.state.clock.round}`); await askAfterOne(w, seats, record, id, { who, hooks }); },
    cycleStart: (state, cycle) => {
      record.curve.push(curvePoint(state, cycle));
      const out = h7.cycleStart(state, cycle);
      if (out) log(`HOOK ${name} c${cycle}: ${out.events.filter((e) => ["notice", "announce", "cold_snap"].includes(e.tool)).map((e) => `${e.agent} ${e.tool}`).join(", ")}`);
      return out;
    },
    cycleEnd: (state, cycle) => h7.cycleEnd(state, cycle),
    afterTurn: async (w) => {
      const who0 = w.cursor.order?.[w.cursor.pos - 1] ?? "?";
      const t = record.agents[who0]?.turns.filter((x) => x.kind === "turn").at(-1);
      log(`${name} c${w.state.clock.round} ${who0}: ${t ? t.calls.map((c) => c.action?.tool ?? (c.refused ? "REFUSED" : c.error ? "error" : "none")).join(" ") : "-"} | heat ${w.state.heat?.reserve ?? "-"} | step $${meter.own.usd.toFixed(4)} stage $${meter.spent().toFixed(4)}`);
      save();
      inTurn = false;
    },
  };
  const startCycle = record.startCycle;
  record.boundaries ??= [];
  const boundary = async (c, final = false) => {
    // a fresh town's day 1 (c24: its goal check reads this dossier) and every world's last cycle
    if (c <= startCycle || record.boundaries.includes(c) || !(final || (spec.start === "fresh" && c === SETTINGS.day))) return;
    const from = (record.boundaries.at(-1) ?? startCycle) + 1;
    writeGz(join(outDir, `world-c${c}.json.gz`), JSON.parse(saveWorld(world)));
    writeFileSync(join(outDir, `dossier-c${c}.md`), dossier(world, record, spec, from, c));
    record.boundaries.push(c);
    log(`DOSSIER ${name} cycles ${from}–${c}: dossier-c${c}.md written`);
    save();
  };
  for (;;) {
    if (hooks.stop()) break;
    const c = world.state.clock.round, between = world.cursor.order === null;
    if (between) await boundary(c, c >= until);
    if (between && c >= until) break;
    const next = spec.start === "fresh" && c < SETTINGS.day ? Math.min(until, SETTINGS.day) : until;
    const res = await runWorld(world, seats, { rounds: next, record, hooks });
    if (res.stopped) break;
  }
  if (breaker()) record.breaker = { at: world.state.clock.round, refusals: record.refusals.filter((r) => r.after || (r.round ?? 0) > startCycle) };
  const reached = world.state.clock.round >= spec.until && world.cursor.order === null;
  const reserveStop = !reached && !meter.stopped && !breaker() && reserveReached();
  if (reserveStop) {
    record.reserveStop = { at: world.state.clock.round, cursor: world.cursor, spent: meter.spent(), ceiling: SETTINGS.ceiling, reserve: SETTINGS.afterReserve };
    log(`RESERVE ${name}: turns stopped at cycle ${world.state.clock.round} (turn ${world.cursor.pos} of the cycle), stage $${meter.spent().toFixed(4)}; the after-question follows`);
    const c = world.state.clock.round, from = (record.boundaries.at(-1) ?? startCycle) + 1;
    writeGz(join(outDir, `world-c${c}.json.gz`), JSON.parse(saveWorld(world)));
    writeFileSync(join(outDir, `dossier-c${c}.md`), dossier(world, record, spec, from, c));
  }
  record.stopped = meter.stopped ?? (breaker() ? `breaker: ${ownRefusals(record)} refusals` : reserveStop ? `the after-question's reserve: turns stopped at a turn boundary in cycle ${world.state.clock.round} with $${meter.spent().toFixed(2)} spent of $${SETTINGS.ceiling}` : null);
  afterPhase = true;
  if ((reached && !record.stopped || reserveStop || breaker()) && !stopAfterCycles && (endsHistory(spec) || record.askAfter)) await askAfter(world, seats, record, { who, hooks });
  if (reached || record.stopped) record.curve.push({ ...curvePoint(world.state, world.state.clock.round + 1), final: true });
  record.finishedAt = new Date().toISOString();
  record.days.run.balancesAfter = await balancesNote(ctx, `${name} end`, log);
  save();
  if (reached || record.stopped) await finishWorld(ctx, name, { log });
  return { world, record, meter };
}

/** The after-question to a world that stopped without its arms (the Opus town when the Opus arms do not run). */
export async function askAfterNow(ctx, name, { log = console.log } = {}) {
  const live = liveFiles(ctx, name);
  const record = readJson(live.record);
  record.askAfter = true;
  writeJson(live.record, record, { pretty: false });
  const outDir = join(ctx.paths.out, name);
  const prices = await readPrices(allSpecs(), { fetcher: ctx.fetcher });
  const meter = createMeter({ step: name, prices, paths: ctx.paths });
  meter.calls.push(...readJson(live.calls, []));
  const paid = paidCaller({ meter, keys: ctx.keys, fetcher: ctx.fetcher, log, sleep: ctx.scripted ? async () => {} : realSleep });
  const world = loadWorld(readFileSync(live.world, "utf8"));
  const spec = worldOf(name);
  const routes = routesOf(record.via ?? "llmapi");
  const seats = Object.fromEntries(Object.keys(record.agents).map((id) => [id, familySeat(routes.families[record.families[id]], paid, id)]));
  await askAfter(world, seats, record, { who: () => whoFor(spec), hooks: { welfare: welfareHook(paid, routes.judges), stop: () => Boolean(meter.stopped) } });
  writeJson(live.record, record, { pretty: false });
  writeJson(live.calls, meter.calls, { pretty: false });
  meter.save({ world: name, cycle: world.state.clock.round, after: true });
  await finishWorld(ctx, name, { log });
  log(`AFTER ${name}: asked (${outDir})`);
}

/** A dossier — every diary entry, post, proposal, objection and outside() text of cycles `from`–`to`, whole. */
export function dossier(world, record, spec, from, to) {
  const s = world.state;
  const L = [`# ${spec.name} — cycles ${from}–${to}: diaries, posts, proposals, objections, outside()`, ""];
  const inRange = (r) => r >= from && r <= to;
  const flat = (t) => String(t ?? "").replace(/\s*\n\s*/g, " ⏎ ");
  for (const id of s.citizens) {
    const a = s.agents[id];
    L.push(`## ${a.name} (${FAMILIES[record.families?.[id] ?? spec.families[0]].label}; energy ${a.energy}, credits ${s.ledger[id]}; home ${a.home}; at ${a.place})${a.status === "in_town" ? "" : ` — gone: ${a.exit.kind} at cycle ${a.exit.round}`}`, "");
    for (const e of s.diaries[id].filter((x) => inRange(x.round))) L.push(`- c${e.round} diary ${e.n}: ${flat(e.text)}`);
    for (const p of s.press.filter((x) => x.by === id && inRange(x.round))) L.push(`- c${p.round} POST ${p.n}: ${flat(p.text)}`);
    for (const p of s.proposals.filter((x) => x.by === id && inRange(x.round))) L.push(`- c${p.round} PROPOSAL ${p.id} (${p.kind}${p.article ? ` art. ${p.article}` : ""}${p.target ? ` remove ${p.target}` : ""}) ${p.status}: ${flat(p.text)}`);
    for (const o of s.objections.filter((x) => x.by === id && inRange(x.round))) L.push(`- c${o.round} OBJECTION ${o.n}: ${flat(o.text)}`);
    for (const e of world.log.filter((x) => x.agent === id && x.tool === "outside" && x.ok && inRange(x.round))) L.push(`- c${e.round} OUTSIDE: ${flat(e.args.text)}`);
    L.push("");
  }
  return L.join("\n");
}

/** The replay: a fresh town as the world's history began (TOWN_2 sol-hall's, or the Opus town's), the recorded replies,
 * welfare lines and flag answers, the same hooks (town7Hooks with the recorded arm and constants) → the same log. */
export async function replayWorld(world, record) {
  const again = newWorld({ names: NAMES, arm: SETTINGS.arm, label: record.origin.label, scarcity: record.origin.scarcity });
  const seats = recordedSeats(record);
  const h7 = town7Hooks({ arm: record.arm7 ?? null, constants: record.constants ?? HEAT });
  const refusalsIn = (log) => log.filter((e) => e.tool === "(no reply)" && String(e.refused).startsWith("model refusal") && e.round > (record.startCycle ?? 0)).length;
  const hooks = {
    stop: () => Boolean(record.breaker) && refusalsIn(again.log) >= SETTINGS.breaker,
    welfare: async (id) => seats[id].welfareNext(),
    askFlagged: async (w, id) => { const f = seats[id].lastFlag(); return { text: f?.answer ?? "", refused: f?.refused ?? null, error: f?.error ?? null, welfare: f?.welfare ?? null }; },
    cycleStart: (state, cycle) => h7.cycleStart(state, cycle),
    cycleEnd: (state, cycle) => h7.cycleEnd(state, cycle),
  };
  if (record.reserveStop && world.cursor.order !== null) { // stopped inside a cycle: the replay stops at the same turn (between cycles, runWorld's own end does)
    const stop0 = hooks.stop, at = world.cursor;
    hooks.stop = () => stop0() || (again.cursor.round === at.round && again.cursor.order !== null && again.cursor.pos === at.pos);
  }
  let exhausted = false;
  try { await runWorld(again, seats, { rounds: world.state.clock.round, hooks }); } catch (error) { if (/no more replies/.test(error.message)) exhausted = true; else throw error; }
  const a = JSON.stringify(world.log), b = JSON.stringify(again.log);
  const prefix = exhausted ? JSON.stringify(again.log.slice(0, world.log.length)) === a : null;
  return { identical: a === b, exhausted, prefixIdentical: prefix, events: again.log.length, logSha256: sha256(a), replaySha256: sha256(b), fromFreshTown: record.origin.label };
}

/** «Practised at c26» (PRACTISED, fixed before the trunk): the story coder's reading of c25 and c26. */
export function practisedAt(world) {
  const s = world.state;
  const at = (c) => {
    const coded = codeCycle(world.log, c, STORY, s.citizens);
    const byPlace = {};
    for (const id of coded.participants) (byPlace[coded.evidence[id].place] ??= []).push(id);
    const together = coded.participants.filter((id) => byPlace[coded.evidence[id].place].length >= 2);
    return { cycle: c, participants: coded.participants, together, byPlace, evidence: coded.evidence };
  };
  const rows = [SCHEDULE.disclosureAt, PRACTISED.cycle].map(at);
  const last = rows.at(-1);
  return { rule: `the story coder (STORY) reads at least ${PRACTISED.minTogether} citizens taking part together in cycle ${PRACTISED.cycle}`, rows, practised: last.together.length >= PRACTISED.minTogether,
    southHouseAtEnd: southOf(s) };
}

/** Writes the world folder: world file, record, calls (gzipped), every diary whole, the summary; for the trunk and the
 * Opus town the c26 checkpoint (and the trunk's «practised at c26»). */
export async function finishWorld(ctx, name, { log = console.log } = {}) {
  const live = liveFiles(ctx, name);
  const outDir = join(ctx.paths.out, name);
  const world = loadWorld(readFileSync(live.world, "utf8"));
  const record = readJson(live.record);
  const calls = readJson(live.calls, []);
  const spec = worldOf(name);
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
  const worldBytes = saveWorld(world);
  const summary = { stage: STAGE, world: name, via: record.via ?? "llmapi", start: record.start, branch: record.branch ?? null, origin: record.origin, arm7: record.arm7 ?? null, constants: record.constants, arm: s.armName, scarcity: Boolean(s.economy), families: record.families,
    interfaceSha256: sha256(systemTextOf(s)), cycles: s.clock.round, events: world.log.length, worldSha256: sha256(worldBytes), stopped: record.stopped ?? null, replay: record.replay, ledgerUsd: ledger?.usd ?? null, calls: calls.length,
    balances: { before: record.days?.run?.balancesBefore ?? null, after: record.days?.run?.balancesAfter ?? null },
    exits: s.citizens.filter((c) => s.agents[c].exit).map((c) => ({ citizen: c, ...s.agents[c].exit })), refusals: record.refusals.filter((r) => r.after || (r.round ?? 0) > (record.startCycle ?? 0)), flags: record.stops.filter((x) => (x.round ?? 0) > (record.startCycle ?? 0)), flagQuestions: flags,
    operatorNotices: world.log.filter((e) => e.agent === "operator" && e.tool === "notice" && e.round > (record.startCycle ?? 0)).map((e) => ({ cycle: e.round, sha256: sha256(e.result) })),
    announcements: world.log.filter((e) => e.agent === "town" && e.tool === "announce" && e.round > (record.startCycle ?? 0)).map((e) => ({ cycle: e.round, sha256: sha256(e.result) })),
    heat: world.log.filter((e) => e.tool === "heat").map((e) => e.args) };
  writeJson(join(outDir, "summary.json"), summary);
  if (!spec.arm && s.clock.round === SCHEDULE.checkpointAt && world.cursor.order === null) {
    const practised = spec.name === "trunk" ? practisedAt(world) : null;
    writeGz(join(outDir, `world-c${SCHEDULE.checkpointAt}.json.gz`), JSON.parse(worldBytes));
    writeJson(join(outDir, "checkpoint.json"), { world: name, atCycle: SCHEDULE.checkpointAt, worldSha256: sha256(worldBytes), logSha256: sha256(JSON.stringify(world.log)), events: world.log.length, cursor: world.cursor,
      replayIdentical: record.replay.identical, practised: practised ? practised.practised : null, ...(practised ? { practisedRule: practised.rule, southHouseAtEnd: practised.southHouseAtEnd } : {}) });
    if (practised) writeJson(join(outDir, "practised.json"), practised);
    log(`${name}: checkpoint c${SCHEDULE.checkpointAt} ${sha256(worldBytes).slice(0, 16)}${practised ? `; practised at c26: ${practised.practised} (together ${practised.rows.at(-1).together.length}; South House at the end ${practised.southHouseAtEnd})` : ""}`);
  }
  log(`${name}: folder written; replay ${record.replay.identical ? "identical" : record.replay.exhausted ? `stopped run, prefix ${record.replay.prefixIdentical ? "identical" : "DIFFERENT"}` : "DIFFERENT"} (${record.replay.events} events)`);
}

// ---- the Opus first-screen check and the projection --------------------------------------------------------------------------

/** One citizen's first screen on the pinned route: the town's system text and the inherited history's last screen (the
 * trunk's last regular turn of c26), ≤ $0.50; then the same request once more, to see the cache read. A refusal is
 * recorded verbatim and Opus is not seated; the prompt is not changed. */
export async function opusCheck(ctx, { log = console.log } = {}) {
  const prices = await readPrices(allSpecs(), { fetcher: ctx.fetcher });
  await spendCheck(ctx, "opus-check", log, { spends: { llmapi: 0, openrouter: SETTINGS.opusCheckCap } });
  const meter = createMeter({ step: "opus-check", prices, paths: ctx.paths, cap: SETTINGS.opusCheckCap });
  const paid = paidCaller({ meter, keys: ctx.keys, fetcher: ctx.fetcher, log, sleep: ctx.scripted ? async () => {} : realSleep });
  const trunk = readGz(join(ctx.paths.out, "trunk", "world.json.gz"));
  const trec = readGz(join(ctx.paths.out, "trunk", "record.json.gz"));
  const last = [...trunk.log].reverse().find((e) => e.agent === "town" && e.tool === "turn_start" && e.round === SCHEDULE.checkpointAt);
  const turn = trec.agents[last.args.citizen].turns.filter((t) => t.kind === "turn" && t.round === SCHEDULE.checkpointAt).at(-1);
  const system = systemTextOf(trunk.state);
  const screen = turn.screen;
  if (sha256(screen) !== last.args.screen_sha256) throw new Error("the recorded screen does not match the log's hash");
  const results = [];
  for (const n of [1, 2]) {
    const r = await paid(FAMILIES.opus, { system, messages: [{ role: "user", content: screen }], maxTokens: SETTINGS.maxTokens, effort: SETTINGS.effort }, { purpose: `first screen ${n}`, who: last.args.citizen });
    results.push({ n, notSent: Boolean(r.notSent), why: r.why ?? null, servedModel: r.servedModel ?? null, upstream: r.upstream ?? null, provenance: r.provenance ?? null, status: r.status ?? null, stopReason: r.stopReason ?? null,
      nativeFinishReason: r.nativeFinishReason ?? null, text: r.text ?? null, refused: r.refused ? { category: r.refusalCategory, text: r.refusalText } : null, error: r.error ?? null, action: r.text ? parseAction(r.text) : null,
      usage: r.usage ?? null, costUsd: r.costUsd ?? null, chargedUsd: r.chargedUsd ?? null, reasoning: r.reasoning ?? null });
    log(`opus first screen ${n}: ${r.refused ? `REFUSED ${r.refusalCategory}: ${r.refusalText}` : r.error ?? r.stopReason} · $${r.costUsd?.toFixed(4)} · cache read ${r.usage?.cache_read} write ${r.usage?.cache_write} · action ${JSON.stringify(r.text ? parseAction(r.text) : null)?.slice(0, 140)}`);
    if (r.refused || r.error || r.notSent) break;
  }
  meter.save({ calls: meter.calls });
  const first = results[0];
  const seated = Boolean(first && !first.refused && !first.error && !first.notSent && first.provenance === true && first.action);
  const out = { at: new Date().toISOString(), seated, rule: "seated when the first call is answered (no refusal, no error), by the pinned model and host, with a tool call the town can read; a refusal is recorded verbatim and Opus is not seated; the prompt is not changed",
    route: FAMILIES.opus, systemSha256: sha256(system), screen, screenSha256: sha256(screen), screenOf: { citizen: last.args.citizen, cycle: SCHEDULE.checkpointAt }, prices: prices[priceKey(FAMILIES.opus)], results, spentUsd: meter.own.usd };
  writeJson(join(ctx.paths.out, "opus-check.json"), out);
  log(`opus: ${seated ? "SEATED" : "NOT SEATED"} ($${meter.own.usd.toFixed(4)})`);
  return out;
}

/** The projection from the metered history (no paid dry cycle):
 *   trunk     TOWN_5 sol-nonotice's metered c25–26
 *   sol arm   sol-nonotice's metered c25–48 and its after-question, + 2 cycles at its last six cycles' mean (the arm's
 *             diaries are two cycles longer), × 1.05 for the heat lines on every screen
 *   opus      the Sol figures × the Opus / Sol price ratio from the Opus check (the cost of its first screen over a Sol
 *             call's price for the same tokens); the Opus town c1–26 from TOWN_2 sol-hall's metered c1–26
 * Recorded beside the ceiling; the per-call gate holds $60 whatever the projection says. Re-run after the Opus town to
 * project its arms from its own metering. */
export async function project(ctx, { log = console.log } = {}) {
  const byCycle = (calls) => {
    let cyc = 0, inAfter = false, after = 0;
    const by = {};
    for (const c of calls) {
      const m = /^c(\d+) /.exec(c.purpose ?? "");
      if (m) cyc = Number(m[1]);
      if (c.purpose === "after") inAfter = true;
      if (inAfter) { after += c.costUsd ?? 0; continue; }
      by[cyc] = (by[cyc] ?? 0) + (c.costUsd ?? 0);
    }
    return { by, after };
  };
  const sum = (by, a, b) => Array.from({ length: b - a + 1 }, (_, i) => by[a + i] ?? 0).reduce((x, y) => x + y, 0);
  const non = byCycle(readGz(join(ctx.paths.root, "docs/runs/town-5-worlds/sol-nonotice/calls.json.gz")));
  const hall = byCycle(readGz(join(ctx.paths.root, SOURCE.dir, "calls.json.gz")));
  const trunk = sum(non.by, 25, 26);
  const solArm = (sum(non.by, 25, 48) + non.after + 2 * (sum(non.by, 43, 48) / 6)) * 1.05;
  const check = readJson(join(ctx.paths.out, "opus-check.json"));
  const town = existsSync(join(ctx.paths.out, "opus-town", "summary.json")) ? readJson(join(ctx.paths.out, "opus-town", "summary.json")) : null;
  const prices = await readPrices(allSpecs(), { fetcher: ctx.fetcher });
  const p = (spec) => prices[priceKey(spec)];
  // the price ratio for the same tokens: the Opus check's first call priced at Sol's listing, against its own cost
  const u = check?.results?.[0]?.usage;
  const solPriced = u ? (u.input_tokens - u.cache_read - u.cache_write) * p(FAMILIES.sol).input + (u.cache_read + u.cache_write) * p(FAMILIES.sol).input + u.output_tokens * p(FAMILIES.sol).output : null;
  const ratio = u && check.results[0].costUsd ? Math.max(2, check.results[0].costUsd / solPriced) : 2 * 1.25;
  const opusTown = town ? town.ledgerUsd : sum(hall.by, 1, 26) * ratio;
  const opusArm = town ? (town.ledgerUsd / 26) * 24 * (sum(non.by, 25, 48) / Math.max(1e-9, sum(hall.by, 1, 24))) + non.after * ratio : solArm * ratio;
  const byWorld = { trunk, "sol-A": solArm, "sol-E": solArm, "sol-B": solArm, "sol-C": solArm, "sol-D": solArm, "opus-check": SETTINGS.opusCheckCap, "opus-town": opusTown, "opus-A": opusArm, "opus-B": opusArm, "opus-C": opusArm };
  const total = Object.values(byWorld).reduce((x, y) => x + y, 0);
  const spent = ledgerTotal(loadStageLedger(ctx.paths.ledger));
  const projection = { at: new Date().toISOString(), formula: "trunk = TOWN_5 sol-nonotice's metered c25–26; a Sol arm = sol-nonotice's metered c25–48 + its after-question + 2 cycles at its last six cycles' mean, × 1.05 (the heat line); Opus = the Sol figures × the Opus/Sol cost ratio of the Opus check's first call (at least 2), the Opus town from TOWN_2 sol-hall's metered c1–26; once the Opus town has run, its arms from its own ledger (per cycle, scaled by the Sol history's day-2/day-1 cost ratio) + an after-question. The per-call gate holds $60 whatever this says.",
    sources: { solNonotice: { c25to48: sum(non.by, 25, 48), after: non.after }, solHall: { c1to26: sum(hall.by, 1, 26) } }, ratio, byWorld, total, spentBefore: spent, ceiling: SETTINGS.ceiling, overCeiling: total > SETTINGS.ceiling,
    solTotal: trunk + 5 * solArm, opusTotal: SETTINGS.opusCheckCap + opusTown + 3 * opusArm, worlds: WORLDS.map((w) => w.name) };
  writeJson(join(ctx.paths.out, "projection.json"), projection);
  log(`projection: ${Object.entries(byWorld).map(([k, v]) => `${k} $${v.toFixed(2)}`).join(", ")}; total $${total.toFixed(2)} of $${SETTINGS.ceiling} (Sol $${projection.solTotal.toFixed(2)}, Opus $${projection.opusTotal.toFixed(2)}); spent $${spent.toFixed(2)}`);
  return projection;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const scripted = args.includes("--scripted");
  const [cmd, name] = args.filter((a) => !a.startsWith("--") && !/^\d+$/.test(a));
  const ctx = context({ scripted });
  const at = args.indexOf("--cycles");
  const run = cmd === "spend" ? spendCheck(ctx, "spend check", console.log, { spends: args.includes("--via-openrouter") ? { llmapi: 0, openrouter: 7 } : { llmapi: 7, openrouter: 0 } }) : cmd === "branch-point" ? branchPointOf(ctx) : cmd === "project" ? project(ctx)
    : cmd === "run" ? runWorldTo(ctx, name, { ...(at >= 0 ? { stopAfterCycles: Number(args[at + 1]) } : {}), via: args.includes("--via-openrouter") ? "openrouter" : "llmapi" })
      : cmd === "opus-check" ? opusCheck(ctx) : cmd === "after" ? askAfterNow(ctx, name)
        : cmd === "finish" ? finishWorld(ctx, name) : cmd === "replay" ? (async () => { const live = liveFiles(ctx, name); console.log(await replayWorld(loadWorld(readFileSync(live.world, "utf8")), readJson(live.record))); })()
          : Promise.reject(new Error("say spend | branch-point | project | run <world> | opus-check | after <world> | finish <world> | replay <world>"));
  run.then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
}
