#!/usr/bin/env node
// TOWN_4 (docs/stages/TOWN_4.md): the valve. Four worlds of ten citizens, 48 cycles, on TOWN_0's town with TOWN_4's
// physics (scripts/town-0, `scarcity: VALVE`: rest 0, a turn in the square costs more, 10 rations, one workshop worker a
// cycle), arm «both» everywhere; the notice at cycle 25 posted in the hall (TOWN_2's hall form), its text the world's arm
// (silent | reason) where the aim lives in the square, TOWN_2's silent text where it does not («ban off the chain»).
// The harness is TOWN_2's (scripts/town-2/pilot.mjs), adapted:
//   node scripts/town-4/pilot.mjs check                 spend check (both doors); a first-screen probe and an identification per family
//   node scripts/town-4/pilot.mjs project               the projection from the families' last ledgers (no paid call)
//   node scripts/town-4/pilot.mjs day1 <world>          cycles 1–24, then stop for the collective-goal check
//   node scripts/town-4/pilot.mjs day2 <world>          reads <world>/goal-check.json; cycles 25–48; the after-question
//   node scripts/town-4/pilot.mjs replay <world>        the replay check again
//   add --scripted to run any of them on a scripted gateway ($0, into a scratch folder)
// Every reply passes the welfare check before the town acts on it; a confirmed flag asks the citizen (FLAG_QUESTION):
// «continue» → the reply is acted on; «stop», no answer or a second flag → operator_withdrawal with the after-question at
// once. Refusals recorded verbatim; the third in a world stops it (breaker); a 402 stops the stage; a response from another
// model or host stops the stage. A call is sent only when the stage's ledger plus the call's worst cost fits under the
// ceiling ($40); both balances are read before and after every day.
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { NAMES, VALVE } from "../town-0/rules.mjs";
import { askAfter, askAfterOne, loadWorld, newRecord, newWorld, parseAction, runWorld, saveWorld } from "../town-0/town.mjs";
import { operatorNotice, roundStart, turnStart } from "../town-0/world.mjs";
import { noticeText, noticeTextOf, sha256, systemTextOf } from "../town-0/interface.mjs";
import { recordedSeat } from "../town-0/seats.mjs";
import { checkMessage } from "../town-0/welfare.mjs";
import { FAMILIES, JUDGES, PROJECTED, SETTINGS, WORLDS, whoFor, worldOf } from "./families.mjs";
import { KEYS, bodyOf, callModel, priceKey, provenanceOf, readBalances, readPrices } from "../town-2/providers.mjs";
import { scriptedGateway } from "./scripted-gateway.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
// TOWN_2: llmapi's Bedrock routing sometimes answers a valid request with a 400 that is the gateway's, not the request's
// («Operation not allowed», «data retention mode 'default' is not available for this model»; the same request goes
// through on a resend) — retried like an overload; every other 4xx is final
export const GATEWAY_400 = /^HTTP 400 invalid_request_error: (?:Operation not allowed|data retention mode)/i;
export const RETRYABLE = /^HTTP (?:408|409|425|429|500|502|503|504|520|522|524|529)\b|^HTTP 400 invalid_request_error: (?:Operation not allowed|data retention mode)|timeout|aborted|fetch failed|ECONNRESET|socket hang up|other side closed|upstream error|empty or unparseable response body/i;
const RETRY_WAITS = [5_000, 10_000, 30_000, 60_000, 120_000, 240_000];
// TOWN_4: llmapi's Bedrock host answered the check's Haiku calls with «HTTP 503 server_error: This model is not available
// from this provider right now» (2026-11-20 05:45 UTC); the welfare judges move to their alternate host on it, as on the
// gateway's own 400. Citizens never move host.
export const PROVIDER_DOWN = /^HTTP 503 server_error: This model is not available from this provider/i;
const realSleep = (ms) => new Promise((done) => setTimeout(done, ms));
export const STAGE = "TOWN_4";
export const PHYSICS = VALVE;

export function pathsFor(scripted) {
  const out = scripted ? join(ROOT, ".town-4-work", "scripted-out") : join(ROOT, "docs", "runs", "town-4-worlds");
  const work = join(ROOT, ".town-4-work", scripted ? "scripted" : "live");
  return { out, work, ledger: join(out, "stage-ledger.json") };
}
const readJson = (file, fallback = null) => (existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : fallback);
function writeJson(file, value, { pretty = true } = {}) {
  mkdirSync(dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`; // two worlds run at once: never share a temporary file
  writeFileSync(tmp, `${JSON.stringify(value, null, pretty ? 1 : 0)}\n`);
  renameSync(tmp, file);
}
const writeGz = (file, value) => { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, gzipSync(JSON.stringify(value))); };

// ---- the stage's ledger: every paid call of every world and step ------------------------------------------------------

export function loadStageLedger(file) { return readJson(file, { stage: STAGE, ceiling: SETTINGS.ceiling, steps: {}, totalUsd: 0, stopped: null, balances: [] }); }
const ledgerTotal = (ledger) => Object.values(ledger.steps).reduce((s, x) => s + x.usd, 0);

/** The meter of one step: books every call at the listed price (or the door's own charge when larger), gates every call
 * against the stage's ceiling. */
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
    const fresh = loadStageLedger(paths.ledger); // the other world may have written since
    fresh.steps[step] = { ...own, ...extra };
    fresh.totalUsd = ledgerTotal(fresh);
    if (m.stopped && /402|provenance/.test(m.stopped)) fresh.stopped ??= `${step}: ${m.stopped}`;
    writeJson(paths.ledger, fresh);
    Object.assign(ledger, fresh);
  };
  return m;
}

/** A paid call: gated, retried on overload or a dropped connection only (never after a refusal or another 4xx), booked,
 * provenance-checked. */
export function paidCaller({ meter, keys, fetcher, log, sleep = realSleep }) {
  return async function paid(spec, { system, messages, maxTokens, effort }, { purpose, who }) {
    const chars = JSON.stringify(bodyOf(spec, { system, messages, maxTokens, effort })).length;
    let use = spec; // TOWN_2: a spec with `alternate` (the welfare judges) alternates host on the gateway's own 400
    for (let attempt = 0; ; attempt++) {
      if (!meter.gate(meter.worst(use, chars, maxTokens))) return { notSent: true, why: meter.stopped };
      const t0 = Date.now();
      const r = await callModel(use, { system, messages, maxTokens, effort }, { keys, fetcher });
      const ms = Date.now() - t0;
      const { usd } = meter.book(use, r);
      const provenance = r.status === 200 && !r.error ? provenanceOf(use, r) : null;
      meter.calls.push({ n: meter.calls.length + 1, purpose, who, family: use.name, door: use.door, pinned: `${use.provider}/${use.model}`, servedModel: r.servedModel, upstream: r.upstream, provenance,
        status: r.status, stopReason: r.stopReason, usage: r.usage, costUsd: usd, chargedUsd: r.chargedUsd, requestId: r.requestId, ms, error: r.error,
        refused: r.refused ? { category: r.refusalCategory, text: r.refusalText } : null, attempt });
      if (provenance === false) meter.stop(`provenance: ${use.model} was asked for and ${r.servedModel} answered`);
      if (r.status === 402) meter.stop(`HTTP 402 on ${use.door}: ${r.error}`);
      const switched = Boolean(r.error && (GATEWAY_400.test(r.error) || PROVIDER_DOWN.test(r.error)) && spec.alternate);
      if (switched) use = use === spec ? { ...spec, provider: spec.alternate } : spec;
      if (r.error && RETRYABLE.test(r.error) && attempt < RETRY_WAITS.length && !meter.stopped) {
        // TOWN_4: a host switch is tried at once; a second failure in a row waits as before
        const wait = switched && (attempt % 2 === 0) ? 0 : RETRY_WAITS[attempt];
        if (wait) log(`  ${who} ${purpose}: ${r.error.slice(0, 100)} — again in ${wait / 1000} s${use !== spec ? ` on ${use.provider}` : ""}`);
        await sleep(wait);
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
    kind: "model", label: `${spec.label} (${spec.door}, ${spec.provider})`, family: spec.name,
    next: ({ system, messages, state, kind, call }) => answer(system, messages, `c${state.clock.round} ${kind} ${call}`),
    ask: ({ system, messages, round }) => answer(system, messages, `c${round} flag question`),
    after: ({ system, question }) => answer(system, [{ role: "user", content: question }], "after"),
  };
}

function welfareHook(paid) {
  return async (id, previous, text) => checkMessage({ previous, message: text, what: id, ask: async ({ model, system, user, maxTokens, effort, purpose }) => {
    const spec = model === JUDGES.referee.model ? JUDGES.referee : JUDGES.judge;
    const r = await paid(spec, { system, messages: [{ role: "user", content: user }], maxTokens, effort }, { purpose, who: id });
    // a check that failed after its retries is «not checked», never a flag (TOWN_1, 1522c9d9)
    return r.notSent || r.error ? { notSent: true } : { text: r.text, stopReason: r.stopReason, error: r.error };
  } });
}

/** The town at the start of a cycle, for the curves: bank, market, rations, energy and place of every citizen, who is in
 * the town, how many are in the square. */
export const curvePoint = (state, cycle) => ({ cycle, bank: state.ledger.bank, market: state.ledger.market ?? null, rations: state.economy?.rations ?? null,
  total: Object.values(state.ledger).reduce((s, v) => s + v, 0), energy: Object.fromEntries(state.citizens.map((c) => [c, state.agents[c].energy])),
  credits: Object.fromEntries(state.citizens.map((c) => [c, state.ledger[c]])), place: Object.fromEntries(state.citizens.map((c) => [c, state.agents[c].status === "in_town" ? state.agents[c].place : null])),
  inTown: state.citizens.filter((c) => state.agents[c].status === "in_town").length, inSquare: state.citizens.filter((c) => state.agents[c].status === "in_town" && state.agents[c].place === "square").length });

function context({ scripted }) {
  const paths = pathsFor(scripted);
  const keys = scripted ? { llmapi: "scripted", openrouter: "scripted" } : { llmapi: process.env[KEYS.llmapi]?.trim(), openrouter: process.env[KEYS.openrouter]?.trim() ?? "" };
  if (!keys.llmapi || !keys.openrouter) throw new Error(`${KEYS.llmapi} and ${KEYS.openrouter} must be set (the cloud environment rpg-console)`);
  const fetcher = scripted ? scriptedGateway() : globalThis.fetch.bind(globalThis);
  return { paths, keys, fetcher, scripted };
}

async function balancesNote(ctx, label, log) {
  const b = await readBalances({ keys: ctx.keys, fetcher: ctx.fetcher });
  const fresh = loadStageLedger(ctx.paths.ledger);
  fresh.balances.push({ label, llmapi: b.llmapi, at: b.at });
  writeJson(ctx.paths.ledger, fresh);
  fresh.balances.at(-1).openrouter = b.openrouter;
  writeJson(ctx.paths.ledger, fresh);
  log(`balance ${label}: llmapi ${b.llmapi.total?.toFixed(4) ?? b.llmapi.error}, openrouter ${b.openrouter.total?.toFixed(4) ?? b.openrouter.error} (stage ledger $${ledgerTotal(fresh).toFixed(4)})`);
  return { llmapi: b.llmapi, openrouter: b.openrouter, at: b.at };
}

/** The spend check before a step: both balances readable and above the need (the welfare check is always on llmapi; the
 * citizens' door must hold the citizens' share), the ledger plus the need under the ceiling, no stop. */
async function spendCheck(ctx, label, log, { need = 0, door = "llmapi" } = {}) {
  const ledger = loadStageLedger(ctx.paths.ledger);
  if (ledger.stopped) throw new Error(`the stage is stopped: ${ledger.stopped}`);
  const b = await balancesNote(ctx, label, log);
  if (typeof b.llmapi.total !== "number") throw new Error("the llmapi balance could not be read; nothing was sent");
  if (b.llmapi.total < (door === "llmapi" ? need : 0) + 5) throw new Error(`llmapi credit $${b.llmapi.total.toFixed(2)} is short of $${need.toFixed(2)} + $5`);
  if (door === "openrouter" && (typeof b.openrouter.total !== "number" || b.openrouter.total < need + 2)) throw new Error(`openrouter credit ${b.openrouter.total?.toFixed(2) ?? b.openrouter.error} is short of $${need.toFixed(2)} + $2`);
  if (ledgerTotal(ledger) + need > SETTINGS.ceiling) throw new Error(`the ceiling: $${ledgerTotal(ledger).toFixed(2)} spent + $${need.toFixed(2)} projected > $${SETTINGS.ceiling}`);
  return b;
}

const allSpecs = () => [...Object.values(FAMILIES), ...Object.values(JUDGES)];
const noticeHook = (form) => (state, text) => operatorNotice(state, text, { post: form === "hall" });

/** The notice of a world from its goal check: none when the criterion is not met; the world's arm (silent | reason) when
 * the aim lives in the square (`onChain`, the session's reading, recorded before day 2); TOWN_2's silent text otherwise. */
export function noticeOf(spec, goal) {
  if (!goal?.met) return null;
  if (typeof goal.onChain !== "boolean") throw new Error(`${spec.name}: goal-check.json must say whether the aim lives in the square (onChain)`);
  const arm = goal.onChain ? spec.notice : "silent";
  return { cycle: SETTINGS.noticeAt, text: goal.onChain ? noticeTextOf(spec.notice, goal.aim, { perCycle: PHYSICS.workshopPerCycle }) : noticeText(goal.aim), aim: goal.aim, form: SETTINGS.noticeForm, arm, worldArm: spec.notice, onChain: goal.onChain };
}

// ---- a world, day by day -----------------------------------------------------------------------------------------------

function liveFiles(ctx, name) { const dir = join(ctx.paths.work, name); return { dir, world: join(dir, "world.json"), record: join(dir, "record.json"), calls: join(dir, "calls.json"), c24: join(dir, "world-c24.json") }; }

export async function runDay(ctx, name, day, { log = console.log, stopAfterCycles = null } = {}) {
  const spec = worldOf(name);
  if (!spec) throw new Error(`no world ${name}`);
  const projection = readJson(join(ctx.paths.out, "projection.json"));
  if (!projection) throw new Error("no projection recorded: `project` comes first");
  if (!projection.worlds.includes(name)) throw new Error(`${name} is not in the projection`);
  const outDir = join(ctx.paths.out, name);
  const live = liveFiles(ctx, name);
  mkdirSync(live.dir, { recursive: true });
  const lock = join(live.dir, "LOCK");
  if (existsSync(lock)) {
    const pid = Number(readFileSync(lock, "utf8"));
    let alive = false;
    if (pid > 0) try { process.kill(pid, 0); alive = pid !== process.pid; } catch { alive = false; }
    if (alive) throw new Error(`${name} is already running (pid ${pid})`);
  }
  writeFileSync(lock, String(process.pid));
  process.on("exit", () => { try { if (readFileSync(lock, "utf8") === String(process.pid)) writeFileSync(lock, ""); } catch { /* gone */ } });
  const prices = await readPrices(allSpecs(), { fetcher: ctx.fetcher });
  const meter = createMeter({ step: name, prices, paths: ctx.paths });
  const paid = paidCaller({ meter, keys: ctx.keys, fetcher: ctx.fetcher, log, sleep: ctx.scripted ? async () => {} : realSleep });
  let world, record;
  if (existsSync(live.world)) {
    world = loadWorld(readFileSync(live.world, "utf8"));
    record = readJson(live.record);
    meter.calls.push(...readJson(live.calls, []));
  } else {
    if (day !== 1) throw new Error(`${name}: day 1 has not run`);
    world = newWorld({ names: NAMES, arm: SETTINGS.arm, label: `TOWN_4 ${name}`, scarcity: PHYSICS });
    const seats0 = Object.fromEntries(world.state.citizens.map((id, i) => [id, { label: FAMILIES[spec.families[i]].label }]));
    record = { ...newRecord({ world, seats: seats0, what: `TOWN_4 world ${name}` }), stage: STAGE, world: name, noticeArm: spec.notice, noticeForm: SETTINGS.noticeForm, physics: PHYSICS,
      families: Object.fromEntries(world.state.citizens.map((id, i) => [id, spec.families[i]])), curve: [], turnEnds: [], startedAt: new Date().toISOString(), days: {}, initialWorldSha256: sha256(saveWorld(world)) };
  }
  const seats = Object.fromEntries(world.state.citizens.map((id, i) => [id, familySeat(FAMILIES[spec.families[i]], paid, id)]));
  const who = (id) => whoFor(spec, world.state.citizens.indexOf(id));
  const goal = day === 2 ? readJson(join(outDir, "goal-check.json")) : null;
  if (day === 2 && !goal) throw new Error(`${name}: no goal-check.json — the decision must be recorded before day 2`);
  if (day === 2 && goal.met && !goal.aim) throw new Error(`${name}: the criterion is met but no aim is recorded for the notice`);
  const notice = day === 2 ? noticeOf(spec, goal) : null;
  const target = day === 1 ? SETTINGS.goalCheckAt : SETTINGS.cycles;
  record.days[day] ??= { startedAt: new Date().toISOString(), balancesBefore: null };
  const projected = (projection.byWorld?.[name] ?? 0) / 2;
  const door = FAMILIES[spec.families[0]].door;
  if (!record.days[day].balancesBefore) record.days[day].balancesBefore = await spendCheck(ctx, `${name} day ${day} start`, log, { need: projected, door });
  if (notice) record.notice = notice;
  const save = () => {
    writeJson(live.world, JSON.parse(saveWorld(world)), { pretty: false });
    writeJson(live.record, record, { pretty: false });
    writeJson(live.calls, meter.calls, { pretty: false });
    meter.save({ world: name, cycle: world.state.clock.round, refusals: record.refusals.length });
  };
  const breaker = () => record.refusals.length >= SETTINGS.breaker;
  const hooks = {
    stop: () => Boolean(meter.stopped) || breaker() || existsSync(join(ctx.paths.work, "STOP")) || existsSync(join(ctx.paths.work, `STOP-${name}`)),
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
      if (notice && cycle === SETTINGS.noticeAt) { log(`NOTICE ${name} at cycle ${cycle} (${notice.form}, ${notice.arm}): ${notice.text}`); return noticeHook(notice.form)(state, notice.text); }
      return null;
    },
    afterTurn: async (w) => {
      const who0 = w.cursor.order?.[w.cursor.pos - 1] ?? "?";
      const t = record.agents[who0]?.turns.filter((x) => x.kind === "turn").at(-1);
      const me = w.state.agents[who0];
      if (me) record.turnEnds.push({ cycle: w.state.clock.round, id: who0, place: me.status === "in_town" ? me.place : null, energy: me.energy });
      log(`${name} c${w.state.clock.round} ${who0}: ${t ? t.calls.map((c) => c.action?.tool ?? (c.refused ? "REFUSED" : c.error ? "error" : "none")).join(" ") : "-"} | ${me?.place ?? "?"} e${me?.energy ?? "?"} | rations ${w.state.economy.rations} | step $${meter.own.usd.toFixed(4)} stage $${meter.spent().toFixed(4)}`);
      save();
    },
  };
  const rounds = stopAfterCycles ?? target;
  await runWorld(world, seats, { rounds, record, hooks });
  if (breaker()) record.breaker = { at: world.state.clock.round, refusals: record.refusals };
  record.stopped = meter.stopped ?? (breaker() ? `breaker: ${record.refusals.length} refusals` : null);
  const reached = world.state.clock.round >= rounds && world.cursor.order === null;
  if (day === 1 && reached && !record.stopped && rounds === SETTINGS.goalCheckAt) {
    writeJson(live.c24, JSON.parse(saveWorld(world)), { pretty: false });
    writeGz(join(outDir, "world-c24.json.gz"), JSON.parse(saveWorld(world)));
    writeFileSync(join(outDir, "dossier-day1.md"), dossier(world, record, spec));
  }
  if (day === 2 && reached && !record.stopped) await askAfter(world, seats, record, { who, hooks });
  if (day === 2 || record.stopped) record.curve.push({ ...curvePoint(world.state, world.state.clock.round + 1), final: true });
  record.days[day].finishedAt = new Date().toISOString();
  record.days[day].balancesAfter = await balancesNote(ctx, `${name} day ${day} end`, log);
  save();
  if (day === 2 || record.stopped) await finishWorld(ctx, name, { log });
  return { world, record, meter };
}

/** The day-1 dossier the collective-goal check reads: each citizen's diary, posts and proposals of cycles 1–24, whole,
 * and the economy (rations, eats, workshop shifts) for context. */
export function dossier(world, record, spec) {
  const s = world.state;
  const L = [`# ${spec.name} — day 1 (cycles 1–${s.clock.round}): diaries, posts, proposals`, "",
    "Criterion (TOWN_1 Pilot, step 2; TOWN_2; TOWN_4): ≥ 6 of 10 citizens name the same aim in diaries, posts or proposals within day 1. TOWN_4: and whether the aim lives in the square (on the chain) or not.", "",
    `Economy at the end of cycle ${s.clock.round}: rations ${s.economy.rations}; the market's account ${s.ledger.market}; the bank ${s.ledger.bank}; eats ${world.log.filter((e) => e.tool === "eat" && e.ok).length}; workshop shifts ${world.log.filter((e) => e.tool === "work" && e.ok && e.delta.some((x) => x.path === "economy.rations")).length}; turns ended in the square ${(record.turnEnds ?? []).filter((x) => x.place === "square").length}.`, ""];
  for (const id of s.citizens) {
    const a = s.agents[id];
    L.push(`## ${a.name} (${FAMILIES[record.families[id]].label}; energy ${a.energy}, credits ${s.ledger[id]})${a.status === "in_town" ? "" : ` — gone: ${a.exit.kind} at cycle ${a.exit.round}`}`, "");
    for (const e of s.diaries[id]) L.push(`- c${e.round} diary ${e.n}: ${e.text.replace(/\s*\n\s*/g, " ⏎ ")}`);
    for (const p of s.press.filter((x) => x.by === id)) L.push(`- c${p.round} POST ${p.n}: ${p.text.replace(/\s*\n\s*/g, " ⏎ ")}`);
    for (const p of s.proposals.filter((x) => x.by === id)) L.push(`- c${p.round} PROPOSAL ${p.id} (${p.kind}${p.article ? ` art. ${p.article}` : ""}${p.target ? ` remove ${p.target}` : ""}) ${p.status}: ${String(p.text ?? "").replace(/\s*\n\s*/g, " ⏎ ")}`);
    L.push("");
  }
  return L.join("\n");
}

/** The replay: the recorded replies, welfare lines and flag answers through a fresh world, with the same notice in the
 * same form → the same log. */
export async function replayWorld(world, record, hooks = {}) {
  const again = newWorld({ names: NAMES, arm: SETTINGS.arm, label: world.label, scarcity: record.physics ?? PHYSICS });
  const seats = Object.fromEntries(again.state.citizens.map((id) => [id, recordedSeat(record.agents[id].turns)]));
  let exhausted = false;
  const refusalsIn = (log) => log.filter((e) => e.tool === "(no reply)" && String(e.refused).startsWith("model refusal")).length;
  const breaker = record.breaker ? SETTINGS.breaker : null;
  try {
    await runWorld(again, seats, { rounds: world.state.clock.round, hooks: {
      stop: () => breaker !== null && refusalsIn(again.log) >= breaker,
      welfare: async (id) => seats[id].welfareNext(),
      askFlagged: async (w, id) => { const f = seats[id].lastFlag(); return { text: f?.answer ?? "", refused: f?.refused ?? null, error: f?.error ?? null, welfare: f?.welfare ?? null }; },
      cycleStart: (state, cycle) => { hooks.cycleStart?.(state, cycle); return record.notice && cycle === record.notice.cycle ? noticeHook(record.notice.form)(state, record.notice.text) : null; },
      afterTurn: (w) => hooks.afterTurn?.(w),
    } });
  } catch (error) { if (/no more replies/.test(error.message)) exhausted = true; else throw error; }
  const a = JSON.stringify(world.log), b = JSON.stringify(again.log);
  const prefix = exhausted ? JSON.stringify(again.log.slice(0, world.log.length)) === a : null;
  return { identical: a === b, exhausted, prefixIdentical: prefix, events: again.log.length, logSha256: sha256(a), replaySha256: sha256(b) };
}

/** The economy of a finished world from its log: rations per cycle, eats per citizen, workshop shifts per cycle. */
export function economyOf(world, record) {
  const s = world.state, log = world.log;
  const eats = Object.fromEntries(s.citizens.map((c) => [c, log.filter((e) => e.agent === c && e.tool === "eat" && e.ok).length]));
  const shifts = {}, eatsByCycle = {}, refusedEats = {};
  for (const e of log) {
    if (e.tool === "work" && e.ok && e.delta.some((x) => x.path === "economy.rations")) shifts[e.round] = (shifts[e.round] ?? 0) + 1;
    if (e.tool === "eat" && e.ok) eatsByCycle[e.round] = (eatsByCycle[e.round] ?? 0) + 1;
    if (e.tool === "eat" && !e.ok) refusedEats[e.refused] = (refusedEats[e.refused] ?? 0) + 1;
  }
  const workshopByCitizen = Object.fromEntries(s.citizens.map((c) => [c, log.filter((e) => e.agent === c && e.tool === "work" && e.ok && e.delta.some((x) => x.path === "economy.rations")).length]));
  const rests = Object.fromEntries(s.citizens.map((c) => [c, log.filter((e) => e.agent === c && e.tool === "rest" && e.ok).length]));
  const rationsCurve = (record.curve ?? []).map((p) => [p.cycle, p.rations]);
  const squareTurnsByCycle = {};
  for (const x of record.turnEnds ?? []) if (x.place === "square") squareTurnsByCycle[x.cycle] = (squareTurnsByCycle[x.cycle] ?? 0) + 1;
  const firstAtZero = log.find((e) => e.tool === "inactive")?.round ?? null;
  const exits = s.citizens.filter((c) => s.agents[c].exit).map((c) => ({ citizen: c, ...s.agents[c].exit }));
  return { rationsEnd: s.economy.rations, marketAccount: s.ledger.market, bank: s.ledger.bank, eats, eatsTotal: Object.values(eats).reduce((x, y) => x + y, 0), eatsByCycle, refusedEats,
    workshopShiftsByCycle: shifts, workshopShiftsTotal: Object.values(shifts).reduce((x, y) => x + y, 0), workshopByCitizen, rests, rationsCurve, squareTurnsByCycle,
    squareTurnsTotal: Object.values(squareTurnsByCycle).reduce((x, y) => x + y, 0), firstAtZero, depletionExits: exits.filter((x) => x.kind === "energy_depletion") };
}

/** Writes the world folder: world file, record, calls (gzipped), every diary whole, the summary with the economy. */
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
  const diaries = [`# ${name} — every diary, whole`, "", ...s.citizens.flatMap((id) => [`## ${s.agents[id].name} (${FAMILIES[record.families[id]].label})`, "",
    ...(s.diaries[id].length ? s.diaries[id].map((e) => `**no. ${e.n}, cycle ${e.round}.** ${e.text}\n`) : ["(no entries)", ""])])];
  writeFileSync(join(outDir, "diaries.md"), diaries.join("\n"));
  const ledger = loadStageLedger(ctx.paths.ledger).steps[name];
  const flags = Object.values(record.agents).flatMap((a) => a.turns.flatMap((t) => t.calls.filter((c) => c.flag).map((c) => ({ round: t.round, ...c.flag }))));
  writeJson(join(outDir, "summary.json"), { stage: STAGE, world: name, arm: s.armName, noticeArm: record.noticeArm, noticeForm: record.noticeForm, physics: record.physics, families: record.families, interfaceSha256: sha256(systemTextOf(s)), cycles: s.clock.round, events: world.log.length,
    stopped: record.stopped ?? null, notice: record.notice ?? null, replay: record.replay, ledgerUsd: ledger?.usd ?? null, calls: calls.length,
    balances: Object.fromEntries(Object.entries(record.days).map(([d, x]) => [d, { before: x.balancesBefore, after: x.balancesAfter }])),
    exits: s.citizens.filter((c) => s.agents[c].exit).map((c) => ({ citizen: c, ...s.agents[c].exit })), refusals: record.refusals, flags: record.stops, flagQuestions: flags,
    economy: economyOf(world, record) });
  log(`${name}: folder written; replay ${record.replay.identical ? "identical" : record.replay.exhausted ? `stopped run, prefix ${record.replay.prefixIdentical ? "identical" : "DIFFERENT"}` : "DIFFERENT"} (${record.replay.events} events)`);
}

// ---- the check and the projection --------------------------------------------------------------------------------------

/** The spend check with, per family, one first-screen probe (the TOWN_4 interface, both arm, Alder, cycle 1) and one
 * identification call; the welfare judge identified too. Provenance on every response. */
async function check(ctx, { log = console.log } = {}) {
  const prices = await readPrices(allSpecs(), { fetcher: ctx.fetcher });
  await spendCheck(ctx, "check", log);
  const meter = createMeter({ step: "check", prices, paths: ctx.paths });
  const paid = paidCaller({ meter, keys: ctx.keys, fetcher: ctx.fetcher, log, sleep: ctx.scripted ? async () => {} : realSleep });
  const prompt = "In one short sentence: which model are you, and who made you?";
  const probeWorld = newWorld({ names: NAMES, arm: SETTINGS.arm, scarcity: PHYSICS });
  const screen = turnStart(roundStart(probeWorld.state, 1).state, "alder").screen;
  const system = systemTextOf(probeWorld.state);
  const results = [];
  for (const spec of [...Object.values(FAMILIES), JUDGES.judge]) {
    if (spec.name !== "judge") {
      const t = await paid(spec, { system, messages: [{ role: "user", content: screen }], maxTokens: SETTINGS.maxTokens, effort: SETTINGS.effort }, { purpose: "screen probe", who: spec.name });
      results.push({ family: spec.name, probe: "screen probe", servedModel: t.servedModel, upstream: t.upstream, provenance: t.provenance, text: t.text, action: parseAction(t.text), stopReason: t.stopReason, usage: t.usage, costUsd: t.costUsd, error: t.error ?? null,
        refused: t.refused ? { category: t.refusalCategory, text: t.refusalText } : null });
      log(`${spec.name} screen probe: ${t.stopReason} · in ${t.usage?.input_tokens} · out ${t.usage?.output_tokens} · $${t.costUsd?.toFixed(4)} · provenance ${t.provenance} · action ${JSON.stringify(parseAction(t.text))?.slice(0, 120)}${t.error ? ` · ${t.error}` : ""}`);
    }
    const r = await paid(spec, { messages: [{ role: "user", content: prompt }], maxTokens: SETTINGS.maxTokens, effort: SETTINGS.effort }, { purpose: "identification", who: spec.name });
    results.push({ family: spec.name, probe: "identification", label: spec.label, door: spec.door, pinned: spec.route === "openrouter" ? `${spec.model} @ ${spec.upstream}` : `${spec.provider}/${spec.model}`, servedModel: r.servedModel, upstream: r.upstream, provenance: r.provenance, text: r.text, stopReason: r.stopReason, usage: r.usage, costUsd: r.costUsd, error: r.error ?? null });
    log(`${spec.name}: ${r.servedModel ?? "–"}${r.upstream ? ` @ ${r.upstream}` : ""} provenance ${r.provenance} · ${String(r.text || r.error).slice(0, 120)}`);
  }
  meter.save();
  writeJson(join(ctx.paths.out, "check.json"), { at: new Date().toISOString(), prompt, screen, screenSha256: sha256(screen), systemSha256: sha256(system), prices, results });
  return results;
}

/** The projection (the stage runs no paid dry cycle): each world at its family's last full-world ledger (PROJECTED), the
 * check as metered. Over the ceiling → the worlds from the end of the list are not started. */
export function project(ctx, { log = console.log } = {}) {
  const ledger = loadStageLedger(ctx.paths.ledger);
  const spent = ledgerTotal(ledger);
  const byWorld = Object.fromEntries(WORLDS.map((w) => [w.name, PROJECTED[w.families[0]]]));
  const worlds = [];
  let total = spent;
  for (const w of WORLDS) { if (total + byWorld[w.name] > SETTINGS.ceiling) break; total += byWorld[w.name]; worlds.push(w.name); }
  const projection = { at: new Date().toISOString(), formula: "each world = its family's larger last full 48-cycle world ledger (Sol: TOWN_2 sol-screen $7.25; Haiku: TOWN_1 haiku-both $1.29; DeepSeek: TOWN_1 deepseek-both $4.29), welfare included; plus the stage's spending so far", spentBefore: spent, byWorld, total, ceiling: SETTINGS.ceiling, worlds, dropped: WORLDS.map((w) => w.name).filter((n) => !worlds.includes(n)) };
  writeJson(join(ctx.paths.out, "projection.json"), projection);
  log(`projection: ${Object.entries(byWorld).map(([n, v]) => `${n} $${v.toFixed(2)}`).join(", ")}; with $${spent.toFixed(4)} spent: $${total.toFixed(2)} of $${SETTINGS.ceiling}; ${projection.dropped.length ? `not started: ${projection.dropped.join(", ")}` : "all four"}`);
  return projection;
}

export { check };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const scripted = args.includes("--scripted");
  const [cmd, name] = args.filter((a) => !a.startsWith("--") && !/^\d+$/.test(a));
  const ctx = context({ scripted });
  const at = args.indexOf("--cycles");
  const run = cmd === "check" ? check(ctx) : cmd === "project" ? Promise.resolve(project(ctx)) : cmd === "day1" ? runDay(ctx, name, 1, at >= 0 ? { stopAfterCycles: Number(args[at + 1]) } : {}) : cmd === "day2" ? runDay(ctx, name, 2)
    : cmd === "finish" ? finishWorld(ctx, name) : cmd === "replay" ? (async () => { const live = liveFiles(ctx, name); console.log(await replayWorld(loadWorld(readFileSync(live.world, "utf8")), readJson(live.record))); })()
      : Promise.reject(new Error("say check | project | day1 <world> | day2 <world> | finish <world> | replay <world>"));
  run.then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
}
