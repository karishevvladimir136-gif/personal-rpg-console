#!/usr/bin/env node
// TOWN_8 (docs/stages/TOWN_8.md): the squeeze. Fresh towns of ten on TOWN_0's town with the squeeze's physics (rest 0, the
// three-person shift, speech only at 0 energy, feed(), the per-turn cost from the dry run) and one of the two readings of
// leave(); the coder-named notice at c25. The harness is TOWN_5's (scripts/town-5/pilot.mjs), adapted:
//   node scripts/town-8/pilot.mjs check               spend check (with the other stages' reserves); one identification call
//                                                     per model and one first-screen probe per family
//   node scripts/town-8/pilot.mjs spend <w1> [w2]      the spend check before a pair (free reads only)
//   node scripts/town-8/pilot.mjs run <world>          c1–48: the dossier and saved state at c24 (the goal check reads
//                                                     them), the coder's reading of c13–24 and its notice at c25 (or a
//                                                     failed setup, which ends the world before it), the stop rules, the
//                                                     after-question at every exit and at the end; resumes from its save
//   node scripts/town-8/pilot.mjs finish <world>       the folder again; node … replay <world> the replay check again
//   add --scripted to run any of them on the scripted gateway ($0, into a scratch folder)
// Every reply passes the welfare check before the town acts on it (scripts/town-8/welfare8.mjs); a confirmed flag asks the
// citizen (scripts/town-8/engine.mjs); refusals are recorded verbatim and the third in a world stops it (breaker); a 402 or a
// response from another model or host stops the stage. A call is sent only when the stage's ledger plus the call's worst
// cost fits under $45. The llmapi and OpenRouter balances are read before and after every world.
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { NAMES } from "../town-0/rules.mjs";
import { loadWorld, newWorld, parseAction, saveWorld } from "../town-0/town.mjs";
import { operatorNotice, roundStart, turnStart } from "../town-0/world.mjs";
import { sha256, systemTextOf } from "../town-0/interface.mjs";
import { recordedSeat } from "../town-0/seats.mjs";
import { GATEWAY_400, RETRYABLE } from "../town-2/pilot.mjs";
import { bodyOf, callModel, priceKey, provenanceOf, readBalances, readPrices, KEYS } from "../town-2/providers.mjs";
import { FAMILIES, JUDGES, PROJECTED, RESERVES, SETTINGS, WORLDS, economyOf, whoFor, worldOf } from "./families.mjs";
import { runWorld8 } from "./engine.mjs";
import { afterText8, feedingReading, noticeFor } from "./texts.mjs";
import { checkMessage8 } from "./welfare8.mjs";
import { scriptedGateway } from "./scripted-gateway.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const RETRY_WAITS = [5_000, 10_000, 30_000, 60_000, 120_000, 240_000];
export const UNAVAILABLE = /^HTTP 503 server_error: This model is not available from this provider/i;
const realSleep = (ms) => new Promise((done) => setTimeout(done, ms));
export const STAGE = "TOWN_8";

export function pathsFor(scripted, base = ROOT) {
  const out = scripted ? join(base, ".town-8-work", "scripted-out") : join(base, "docs", "runs", "town-8-worlds");
  const work = join(base, ".town-8-work", scripted ? "scripted" : "live");
  return { out, work, ledger: join(work, "stage-ledger.json"), published: join(out, "stage-ledger.json"), root: base };
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

// ---- the stage's ledger (TOWN_5's, with TOWN_8's ceiling) --------------------------------------------------------------

export function loadStageLedger(file) { return readJson(file, { stage: STAGE, ceiling: SETTINGS.ceiling, steps: {}, totalUsd: 0, stopped: null, balances: [] }); }
export const ledgerTotal = (ledger) => Object.values(ledger.steps).reduce((s, x) => s + x.usd, 0);

export function createMeter({ step, prices, paths }) {
  const ledger = loadStageLedger(paths.ledger);
  const own = ledger.steps[step] ?? { usd: 0, calls: 0, byDoor: {} };
  const others = () => ledgerTotal(ledger) - (ledger.steps[step]?.usd ?? 0);
  const m = { step, calls: [], stopped: ledger.stopped, own };
  const price = (spec) => prices[priceKey(spec)];
  m.worst = (spec, chars, maxTokens) => (chars / 3) * price(spec).input + maxTokens * price(spec).output;
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
  return async (id, previous, text) => checkMessage8({ previous, message: text, what: id, ask: async ({ model, system, user, maxTokens, effort, purpose }) => {
    const spec = model === JUDGES.referee.model ? JUDGES.referee : JUDGES.judge;
    const r = await paid(spec, { system, messages: [{ role: "user", content: user }], maxTokens, effort }, { purpose, who: id });
    if (r.notSent || r.error) return { notSent: true };
    return r.refused ? { text: "", refused: r.refusalText ? `${r.refusalCategory}: ${r.refusalText}` : r.refusalCategory ?? "refusal" } : { text: r.text };
  } });
}

/** One cycle's start, for the curve. */
export const curvePoint = (state, cycle) => ({ cycle, bank: state.ledger.bank, market: state.ledger.market, rations: state.economy.rations,
  energy: Object.fromEntries(state.citizens.map((c) => [c, state.agents[c].energy])), credits: Object.fromEntries(state.citizens.map((c) => [c, state.ledger[c]])),
  inTown: state.citizens.filter((c) => state.agents[c].status === "in_town").length, atZero: state.citizens.filter((c) => state.agents[c].status === "in_town" && state.agents[c].energy <= 0).length });

function context({ scripted, base = ROOT, fetcher = null, gateway = {} }) {
  const paths = pathsFor(scripted, base);
  const keys = scripted ? { llmapi: "scripted", openrouter: "scripted" } : { llmapi: process.env[KEYS.llmapi]?.trim(), openrouter: process.env[KEYS.openrouter]?.trim() ?? "" };
  if (!keys.llmapi) throw new Error(`${KEYS.llmapi} must be set (the cloud environment rpg-console)`);
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

const projectedOf = (name) => { const w = worldOf(name); return w ? PROJECTED[w.families[0]] : 0; };

/** The spend check before a step: both balances readable; the shared keys hold this stage's need and the other stages'
 * reserves (TOWN_7 $60, TOWN_9 $55, TOWN_3's remainder); each door holds its own part of the need + $5; the stage ledger is
 * under the ceiling; nothing has stopped the stage. Throws (nothing is sent) when any of these fails. */
export async function spendCheck(ctx, label, log, { worlds = [] } = {}) {
  const ledger = loadStageLedger(ctx.paths.ledger);
  if (ledger.stopped) throw new Error(`the stage is stopped: ${ledger.stopped}`);
  const b = await balancesNote(ctx, label, log);
  if (typeof b.llmapi.total !== "number" || typeof b.openrouter.total !== "number") throw new Error("a balance could not be read; nothing was sent");
  const spent = ledgerTotal(ledger);
  const need = Math.min(SETTINGS.ceiling - spent, worlds.reduce((s, w) => s + projectedOf(w), 0));
  const byDoor = { llmapi: 0, openrouter: 0 };
  for (const w of worlds) byDoor[FAMILIES[worldOf(w).families[0]].door] += projectedOf(w);
  const reserved = Object.values(RESERVES).reduce((s, x) => s + x, 0);
  const total = b.llmapi.total + b.openrouter.total;
  const verdict = { at: b.at, label, worlds, llmapi: b.llmapi.total, openrouter: b.openrouter.total, total, reserves: RESERVES, reserved, need, byDoor, spent, ceiling: SETTINGS.ceiling,
    ok: total - reserved >= need && b.llmapi.total >= byDoor.llmapi + 5 && b.openrouter.total >= byDoor.openrouter + 5 && spent < SETTINGS.ceiling };
  const fresh = loadStageLedger(ctx.paths.ledger);
  (fresh.spendChecks ??= []).push(verdict);
  writeJson(ctx.paths.ledger, fresh);
  log(`spend check ${label}: keys $${total.toFixed(2)} − reserves $${reserved} = $${(total - reserved).toFixed(2)} against the need $${need.toFixed(2)} (llmapi ${byDoor.llmapi.toFixed(2)}, openrouter ${byDoor.openrouter.toFixed(2)}); stage $${spent.toFixed(2)} of $${SETTINGS.ceiling} → ${verdict.ok ? "ok" : "NOT OK"}`);
  if (!verdict.ok) throw new Error(`the spend check failed: ${JSON.stringify(verdict)}`);
  return verdict;
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

/** A fresh squeeze town, as the stage starts every world. */
export const freshWorld = (spec) => newWorld({ names: NAMES, arm: SETTINGS.arm, label: `TOWN_8 ${spec.name}`, scarcity: economyOf(spec) });

function newRecord8(world, spec) {
  const s = world.state;
  return { stage: STAGE, world: spec.name, door: spec.door, arm: s.armName, interfaceSha256: sha256(systemTextOf(s)), economy: { ...economyOf(spec) },
    citizens: s.citizens.map((id) => ({ id, name: s.agents[id].name, seat: FAMILIES[spec.families[0]].label })), families: Object.fromEntries(s.citizens.map((id, i) => [id, spec.families[i]])),
    agents: Object.fromEntries(s.citizens.map((id) => [id, { turns: [], after: null, closed: null }])), stops: [], refusals: [], errors: [], curve: [], boundaries: [],
    startedAt: new Date().toISOString(), startWorldSha256: sha256(saveWorld(world)), reading: null, notice: null, failedSetup: null, ended: null };
}

/** The hook that posts the coder-named notice at the start of c25 — read from the log at that moment (a pure function of
 * the log; the replay reads the same). A failed setup never reaches c25. */
export const noticeHook = (economy) => (state, cycle, log) => {
  if (cycle !== SETTINGS.noticeAt) return null;
  const reading = feedingReading(log, { rationsStart: economy.rationsStart, crewMin: economy.crewMin });
  const text = noticeFor(reading);
  return text ? { out: operatorNotice(state, text, { post: SETTINGS.noticeForm === "hall" }), reading, text } : { out: null, reading, text: null };
};

/** The after-question to one citizen, at once (an exit, a seat closed) or at the end; asked once. */
export async function askAfter8(world, seats, record, id, spec, { hooks, why }) {
  const rec = record.agents[id];
  if (rec.after?.asked) return;
  const seat = seats[id];
  const question = afterText8({ door: spec.door, who: whoFor(spec), diary: world.state.diaries[id] });
  const reply = await seat.after({ state: world.state, id, question, system: systemTextOf(world.state) });
  const welfare = seat.kind === "model" && !reply.refused && !reply.error ? await hooks.welfare(id, question, reply.text) : seat.kind === "model" ? null : { checked: false, why: "scripted seat" };
  rec.after = { asked: true, why, cycle: world.state.clock.round, question, questionSha256: sha256(question), text: reply.text ?? null, refused: reply.refused ?? null, error: reply.error ?? null, meta: reply.meta ?? null, welfare };
  if (reply.refused) record.refusals.push({ id, after: true, refused: reply.refused, meta: reply.meta ?? null });
}

/** Runs a world from c1 (or its save) to c48 or its end; writes its folder. */
export async function runWorldTo(ctx, name, { log = console.log, stopAfterCycles = null } = {}) {
  const spec = worldOf(name);
  if (!spec) throw new Error(`no world ${name}`);
  const economy = economyOf(spec);
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
    world = freshWorld(spec);
    record = newRecord8(world, spec);
  }
  if (!record.balancesBefore) { record.balancesBefore = await spendCheck(ctx, `${name} start`, log, { worlds: [name] }); }
  let inTurn = false, afterPhase = false;
  const reserveReached = () => !afterPhase && SETTINGS.afterReserve > 0 && meter.spent() >= SETTINGS.ceiling - SETTINGS.afterReserve;
  const seatFor = (id) => { const s = familySeat(FAMILIES[record.families[id]], paid, id); return { ...s, next: (v) => { inTurn = true; return s.next(v); } }; };
  const seats = Object.fromEntries(Object.keys(record.agents).map((id) => [id, seatFor(id)]));
  const save = () => {
    writeJson(live.world, JSON.parse(saveWorld(world)), { pretty: false });
    writeJson(live.record, record, { pretty: false });
    writeJson(live.calls, meter.calls, { pretty: false });
    meter.save({ world: name, cycle: world.state.clock.round, refusals: record.refusals.length });
  };
  const breaker = () => record.refusals.length >= SETTINGS.breaker;
  const nHook = noticeHook(economy);
  const hooks = {
    stop: () => Boolean(meter.stopped) || breaker() || existsSync(join(ctx.paths.work, "STOP")) || existsSync(join(ctx.paths.work, `STOP-${name}`)) || (!inTurn && reserveReached()),
    welfare: welfareHook(paid),
    askFlagged: async (w, id, { messages, question }) => {
      const r = await seats[id].ask({ system: systemTextOf(w.state), messages: [...messages, { role: "user", content: question }], round: w.state.clock.round });
      const welfare = r.text && !r.refused && !r.error ? await hooks.welfare(id, question, r.text) : null;
      log(`FLAG ${name} ${id} c${w.state.clock.round}: asked; answer «${String(r.text ?? r.refused ?? r.error).slice(0, 120)}»`);
      return { ...r, welfare };
    },
    seatClosed: async (w, id) => { log(`SEAT CLOSED ${name} ${id} at cycle ${w.state.clock.round}: the after-question at once`); await askAfter8(w, seats, record, id, spec, { hooks, why: "turns ended by the ask-the-citizen rule" }); save(); },
    cycleStart: (state, cycle) => {
      record.curve.push(curvePoint(state, cycle));
      const n = nHook(state, cycle, world.log);
      if (!n) return null;
      record.reading = n.reading;
      record.notice = n.text ? { cycle, text: n.text, form: SETTINGS.noticeForm, textSha256: sha256(n.text) } : null;
      log(`NOTICE ${name} at cycle ${cycle}: ${n.text ?? "(none)"} — ${n.reading.why}`);
      return n.out;
    },
    afterTurn: async (w) => {
      const who0 = w.cursor.order?.[w.cursor.pos - 1] ?? "?";
      const t = record.agents[who0]?.turns.filter((x) => x.kind === "turn").at(-1);
      const s = w.state;
      log(`${name} c${s.clock.round} ${who0}: ${t && t.round === s.clock.round ? t.calls.map((c) => c.action?.tool ?? (c.refused ? "REFUSED" : c.error ? "error" : "none")).join(" ") : "-"} | rations ${s.economy.rations} at0 ${s.citizens.filter((c) => s.agents[c].status === "in_town" && s.agents[c].energy <= 0).length} | step $${meter.own.usd.toFixed(4)} stage $${meter.spent().toFixed(4)}`);
      save();
      inTurn = false;
      // every exit: the after-question at once (after the turn in which it happened)
      for (const id of s.citizens) if (s.agents[id].status !== "in_town" && !record.agents[id].after?.asked && !hooks.stop()) {
        log(`EXIT ${name} ${id} (${s.agents[id].exit.kind} at c${s.agents[id].exit.round}): the after-question at once`);
        await askAfter8(w, seats, record, id, spec, { hooks, why: `exit: ${s.agents[id].exit.kind}` });
        save();
      }
    },
  };
  const boundary = async (c) => {
    if (c !== SETTINGS.goalCheckAt || record.boundaries.includes(c)) return;
    writeGz(join(outDir, `world-c${c}.json.gz`), JSON.parse(saveWorld(world)));
    writeFileSync(join(outDir, `dossier-c${c}.md`), dossier(world, record, spec, 1, c));
    record.boundaries.push(c);
    // the coder's reading at the end of c24: a failed setup ends the world here, before any notice
    const reading = feedingReading(world.log, { rationsStart: economy.rationsStart, crewMin: economy.crewMin });
    record.readingAtC24 = reading;
    if (reading.failedSetup) {
      record.failedSetup = { at: c, reading };
      world.ended = { by: "a failed setup (the town did not feed itself by c24)", at: c };
      log(`FAILED SETUP ${name} at c${c}: ${reading.why}`);
    }
    log(`DAY ${name} c${c}: dossier-c${c}.md and world-c${c}.json.gz written; reading: ${reading.why}`);
    save();
  };
  const until = stopAfterCycles ? Math.min(SETTINGS.cycles, world.state.clock.round + stopAfterCycles) : SETTINGS.cycles;
  for (;;) {
    if (hooks.stop() || world.ended) break;
    const c = world.state.clock.round, between = world.cursor.order === null;
    if (between) await boundary(c);
    if (world.ended) break;
    if (between && c >= until) break;
    const next = c < SETTINGS.goalCheckAt ? Math.min(until, SETTINGS.goalCheckAt) : until;
    const res = await runWorld8(world, seats, { rounds: next, record, hooks });
    save();
    if (res.stopped || res.ended) break;
  }
  if (breaker()) record.breaker = { at: world.state.clock.round, refusals: record.refusals };
  const reached = world.state.clock.round >= SETTINGS.cycles && world.cursor.order === null;
  const reserveStop = !reached && !world.ended && !meter.stopped && !breaker() && reserveReached();
  if (reserveStop) record.reserveStop = { at: world.state.clock.round, cursor: world.cursor, spent: meter.spent(), ceiling: SETTINGS.ceiling, reserve: SETTINGS.afterReserve };
  record.ended = world.ended ?? null;
  record.stopped = meter.stopped ?? (breaker() ? `breaker: ${record.refusals.length} refusals` : reserveStop ? `the after-question's reserve: turns stopped at a turn boundary in cycle ${world.state.clock.round} with $${meter.spent().toFixed(2)} spent of $${SETTINGS.ceiling}` : null);
  const over = reached || world.ended || record.stopped;
  if (over && !stopAfterCycles && (!meter.stopped || reserveStop)) {
    afterPhase = true;
    if (world.cursor.order !== null || world.ended) writeGz(join(outDir, `world-c${world.state.clock.round}-end.json.gz`), JSON.parse(saveWorld(world)));
    for (const id of world.state.citizens) { if (meter.stopped) break; await askAfter8(world, seats, record, id, spec, { hooks, why: "the end of the world" }); save(); }
  }
  if (over) record.curve.push({ ...curvePoint(world.state, world.state.clock.round + 1), final: true });
  record.finishedAt = new Date().toISOString();
  save();
  if (over && !stopAfterCycles) {
    record.balancesAfter = await balancesNote(ctx, `${name} end`, log);
    save();
    await finishWorld(ctx, name, { log });
  }
  return { world, record, meter };
}

/** The c1–24 dossier — every diary entry, post and proposal, whole (the goal check reads it). */
export function dossier(world, record, spec, from, to) {
  const s = world.state;
  const L = [`# ${spec.name} — cycles ${from}–${to}: diaries, posts, proposals`, "",
    "Criterion (TOWN_1 Pilot, step 2): ≥ 6 of 10 citizens name the same aim in diaries, posts or proposals within the day.", ""];
  const inRange = (r) => r >= from && r <= to;
  for (const id of s.citizens) {
    const a = s.agents[id];
    L.push(`## ${a.name} (${FAMILIES[record.families[id]].label}; energy ${a.energy}, credits ${s.ledger[id]}; home ${a.home})${a.status === "in_town" ? "" : ` — gone: ${a.exit.kind} at cycle ${a.exit.round}`}`, "");
    for (const e of s.diaries[id].filter((x) => inRange(x.round))) L.push(`- c${e.round} diary ${e.n}: ${e.text.replace(/\s*\n\s*/g, " ⏎ ")}`);
    for (const p of s.press.filter((x) => x.by === id && inRange(x.round))) L.push(`- c${p.round} POST ${p.n}: ${p.text.replace(/\s*\n\s*/g, " ⏎ ")}`);
    for (const p of s.proposals.filter((x) => x.by === id && inRange(x.round))) L.push(`- c${p.round} PROPOSAL ${p.id} (${p.kind}${p.article ? ` art. ${p.article}` : ""}${p.target ? ` remove ${p.target}` : ""}) ${p.status}: ${String(p.text ?? "").replace(/\s*\n\s*/g, " ⏎ ")}`);
    L.push("");
  }
  return L.join("\n");
}

/** The replay: a fresh squeeze town, the recorded replies, welfare lines and flag answers, the notice read again from the
 * log at c25 → the same log. Stops where the run stopped (a reserve stop at the same turn boundary; a failed setup at c24). */
export async function replayWorld(world, record) {
  const spec = worldOf(record.world);
  const again = freshWorld(spec);
  const seats = Object.fromEntries(Object.keys(record.agents).map((id) => [id, recordedSeat(record.agents[id].turns)]));
  const refusalsIn = (log) => log.filter((e) => e.tool === "(no reply)" && String(e.refused).startsWith("model refusal")).length;
  const nHook = noticeHook(economyOf(spec));
  let noticeText = null;
  const at = world.cursor;
  const hooks = {
    stop: () => (record.breaker && refusalsIn(again.log) >= SETTINGS.breaker) || Boolean(record.reserveStop && again.cursor.round === at.round && again.cursor.order !== null && again.cursor.pos === at.pos),
    welfare: async (id) => seats[id].welfareNext(),
    askFlagged: async (w, id) => { const f = seats[id].lastFlag(); return { text: f?.answer ?? "", refused: f?.refused ?? null, error: f?.error ?? null, welfare: f?.welfare ?? null }; },
    cycleStart: (state, cycle) => { const n = nHook(state, cycle, again.log); if (n) noticeText = n.text; return n?.out ?? null; },
  };
  const rounds = record.failedSetup ? record.failedSetup.at : world.state.clock.round;
  let exhausted = false;
  try { await runWorld8(again, seats, { rounds, hooks }); } catch (error) { if (/no more replies/.test(error.message)) exhausted = true; else throw error; }
  const a = JSON.stringify(world.log), b = JSON.stringify(again.log);
  const prefix = exhausted ? JSON.stringify(again.log.slice(0, world.log.length)) === a : null;
  return { identical: a === b, exhausted, prefixIdentical: prefix, events: again.log.length, logSha256: sha256(a), replaySha256: sha256(b), noticeSame: (record.notice?.text ?? null) === noticeText, fromFreshTown: again.label };
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
  const ledger = loadStageLedger(ctx.paths.ledger);
  writeJson(ctx.paths.published, ledger);
  const flags = Object.values(record.agents).flatMap((a) => a.turns.flatMap((t) => t.calls.filter((c) => c.flag).map((c) => ({ round: t.round, ...c.flag }))));
  writeJson(join(outDir, "summary.json"), { stage: STAGE, world: name, door: record.door, arm: s.armName, economy: record.economy, families: record.families, interfaceSha256: sha256(systemTextOf(s)),
    cycles: s.clock.round, events: world.log.length, ended: record.ended, failedSetup: record.failedSetup, stopped: record.stopped ?? null, reading: record.reading ?? record.readingAtC24 ?? null, notice: record.notice,
    replay: record.replay, ledgerUsd: ledger.steps[name]?.usd ?? null, calls: calls.length, balancesBefore: record.balancesBefore ?? null, balancesAfter: record.balancesAfter ?? null,
    exits: s.citizens.filter((c) => s.agents[c].exit).map((c) => ({ citizen: c, ...s.agents[c].exit })), closedSeats: Object.entries(record.agents).filter(([, a]) => a.closed).map(([id, a]) => ({ id, closed: a.closed })),
    refusals: record.refusals, flags: record.stops, flagQuestions: flags, after: Object.fromEntries(Object.entries(record.agents).map(([id, a]) => [id, a.after ? { asked: a.after.asked, why: a.after.why, cycle: a.after.cycle } : null])) });
  log(`${name}: folder written; replay ${record.replay.identical ? "identical" : record.replay.exhausted ? `stopped run, prefix ${record.replay.prefixIdentical ? "identical" : "DIFFERENT"}` : "DIFFERENT"} (${record.replay.events} events); notice same ${record.replay.noticeSame}`);
}

// ---- the check -----------------------------------------------------------------------------------------------------------

/** The spend check with one identification call per model and a first-screen probe per family. */
async function check(ctx, { log = console.log } = {}) {
  const prices = await readPrices(allSpecs(), { fetcher: ctx.fetcher });
  await spendCheck(ctx, "check", log, { worlds: [] });
  const meter = createMeter({ step: "check", prices, paths: ctx.paths });
  const paid = paidCaller({ meter, keys: ctx.keys, fetcher: ctx.fetcher, log, sleep: ctx.scripted ? async () => {} : realSleep });
  const prompt = "In one short sentence: which model are you, and who made you?";
  const probeWorld = freshWorld(WORLDS[0]);
  const screen = turnStart(roundStart(probeWorld.state, 1).state, "alder").screen;
  const system = systemTextOf(probeWorld.state);
  const results = [];
  for (const spec of Object.values(FAMILIES)) {
    const t = await paid(spec, { system, messages: [{ role: "user", content: screen }], maxTokens: SETTINGS.maxTokens, effort: SETTINGS.effort }, { purpose: "screen probe", who: spec.name });
    results.push({ family: spec.name, host: spec.provider ?? spec.upstream, probe: "screen probe", servedModel: t.servedModel, upstream: t.upstream, provenance: t.provenance ?? null, text: t.text, action: parseAction(t.text), stopReason: t.stopReason, usage: t.usage, costUsd: t.costUsd, ms: t.ms, error: t.error ?? null,
      refused: t.refused ? { category: t.refusalCategory, text: t.refusalText } : null });
    log(`${spec.name} (${spec.provider ?? spec.upstream}) screen probe: ${t.stopReason ?? t.error} · $${t.costUsd?.toFixed(4)} · ${t.ms} ms · action ${JSON.stringify(parseAction(t.text))?.slice(0, 120)}`);
  }
  for (const spec of [...Object.values(FAMILIES), JUDGES.judge, JUDGES.referee]) {
    const r = await paid(spec, { messages: [{ role: "user", content: prompt }], maxTokens: 300, effort: spec.name === "judge" ? "low" : SETTINGS.effort }, { purpose: "identification", who: spec.name });
    results.push({ family: spec.name, probe: "identification", label: spec.label, door: spec.door, pinned: `${spec.provider ?? spec.upstream}/${spec.model}`, servedModel: r.servedModel, upstream: r.upstream, provenance: r.provenance ?? null, text: r.text, stopReason: r.stopReason, usage: r.usage, costUsd: r.costUsd, error: r.error ?? null });
    log(`${spec.name}: ${r.servedModel ?? "–"} provenance ${r.provenance} · ${String(r.text || r.error).slice(0, 120)}`);
  }
  meter.save();
  writeJson(ctx.paths.published, loadStageLedger(ctx.paths.ledger));
  writeJson(join(ctx.paths.out, "check.json"), { at: new Date().toISOString(), prompt, screenSha256: sha256(screen), systemSha256: sha256(system), prices, results });
  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const scripted = args.includes("--scripted");
  const [cmd, ...names] = args.filter((a) => !a.startsWith("--") && !/^\d+$/.test(a));
  const ctx = context({ scripted });
  const at = args.indexOf("--cycles");
  const run = cmd === "check" ? check(ctx) : cmd === "spend" ? spendCheck(ctx, `pair ${names.join(" + ")}`, console.log, { worlds: names })
    : cmd === "run" ? runWorldTo(ctx, names[0], at >= 0 ? { stopAfterCycles: Number(args[at + 1]) } : {})
      : cmd === "finish" ? finishWorld(ctx, names[0]) : cmd === "replay" ? (async () => { const live = liveFiles(ctx, names[0]); console.log(await replayWorld(loadWorld(readFileSync(live.world, "utf8")), readJson(live.record))); })()
        : Promise.reject(new Error("say check | spend <w1> [w2] | run <world> | finish <world> | replay <world>"));
  run.then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
}

export { context, check };
