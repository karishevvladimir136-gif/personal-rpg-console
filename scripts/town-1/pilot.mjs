#!/usr/bin/env node
// TOWN_1 pilot (docs/stages/TOWN_1.md, Pilot section, mandate #11): Stage A at T0, seven worlds of ten citizens, 48
// cycles each, on TOWN_0's town (scripts/town-0, interface frozen per arm).
//   node scripts/town-1/pilot.mjs check                 spend check (both doors) and one identification call per door
//   node scripts/town-1/pilot.mjs dry                   one cycle of opus-both with ten citizens → the projection
//   node scripts/town-1/pilot.mjs day1 <world>          cycles 1–24, then stop for the collective-goal check
//   node scripts/town-1/pilot.mjs day2 <world>          reads <world>/goal-check.json; cycles 25–48 (the notice at 25 only
//                                                        where the criterion is met); the after-question; the replay
//   node scripts/town-1/pilot.mjs replay <world>        the replay check again
//   add --scripted to run any of them on a scripted gateway ($0, into a scratch folder)
// Every reply passes the welfare check before the town acts on it; a confirmed flag withdraws the citizen
// (operator_withdrawal) with the after-question at once. Refusals recorded verbatim; the third in a world stops it
// (breaker); a 402 stops the pilot; a response from another model or host stops the pilot. Spending: a call is sent only
// when the pilot's ledger (every world, both doors) plus the call's worst cost fits under the ceiling; the doors'
// balances are read before and after every world.
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ARMS, NAMES } from "../town-0/rules.mjs";
import { askAfter, askAfterOne, loadWorld, newRecord, newWorld, runWorld, saveWorld } from "../town-0/town.mjs";
import { operatorNotice } from "../town-0/world.mjs";
import { frozenInterface, interfaceText, noticeText, sha256 } from "../town-0/interface.mjs";
import { recordedSeat } from "../town-0/seats.mjs";
import { checkMessage } from "../town-0/welfare.mjs";
import { FAMILIES, JUDGES, SETTINGS, WORLDS, whoFor, worldOf } from "./families.mjs";
import { KEYS, bodyOf, callModel, priceKey, provenanceOf, readBalances, readPrices } from "./providers.mjs";
import { scriptedGateway } from "./scripted-gateway.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const RETRYABLE = /^HTTP (?:408|409|425|429|500|502|503|504|520|522|524|529)\b|timeout|aborted|fetch failed|ECONNRESET|socket hang up|other side closed|upstream error/i;
const RETRY_WAITS = [10_000, 30_000, 60_000, 120_000];
const realSleep = (ms) => new Promise((done) => setTimeout(done, ms));

export function pathsFor(scripted) {
  const out = scripted ? join(ROOT, ".town-1-work", "scripted-out") : join(ROOT, "docs", "runs", "town-1-worlds");
  const work = join(ROOT, ".town-1-work", scripted ? "scripted" : "live");
  return { out, work, ledger: join(out, "pilot-ledger.json") };
}
const readJson = (file, fallback = null) => (existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : fallback);
function writeJson(file, value, { pretty = true } = {}) {
  mkdirSync(dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`; // two worlds may run at once (amendment 2): never share a temporary file
  writeFileSync(tmp, `${JSON.stringify(value, null, pretty ? 1 : 0)}\n`);
  renameSync(tmp, file);
}
const writeGz = (file, value) => { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, gzipSync(JSON.stringify(value))); };

// ---- the pilot's ledger: every paid call of every world and step, both doors ------------------------------------------

/** { steps: { [step]: { usd, calls, byDoor } }, totalUsd, stopped } — written after every turn. */
export function loadPilotLedger(file) { return readJson(file, { stage: "TOWN_1 pilot", ceiling: SETTINGS.ceiling, steps: {}, totalUsd: 0, stopped: null, balances: [] }); }
const ledgerTotal = (ledger) => Object.values(ledger.steps).reduce((s, x) => s + x.usd, 0);

/** The meter of one step (a world, the dry run, the check): books every call at the listed price (or the door's own
 * charge when it gives one and it is larger), gates every call against the pilot's ceiling. */
export function createMeter({ step, prices, paths, log }) {
  const ledger = loadPilotLedger(paths.ledger);
  const own = ledger.steps[step] ?? { usd: 0, calls: 0, byDoor: {} };
  const others = () => ledgerTotal(ledger) - (ledger.steps[step]?.usd ?? 0);
  const m = { step, calls: [], stopped: ledger.stopped, own, refusals: 0 };
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
    const fresh = loadPilotLedger(paths.ledger); // other steps may have written since
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
    for (let attempt = 0; ; attempt++) {
      if (!meter.gate(meter.worst(spec, chars, maxTokens))) return { notSent: true, why: meter.stopped };
      const t0 = Date.now();
      const r = await callModel(spec, { system, messages, maxTokens, effort }, { keys, fetcher });
      const ms = Date.now() - t0;
      const { usd } = meter.book(spec, r);
      const provenance = r.status === 200 ? provenanceOf(spec, r) : null;
      meter.calls.push({ n: meter.calls.length + 1, purpose, who, family: spec.name, door: spec.door, pinned: bodyOf(spec, { messages: [], maxTokens }).model, upstreamPinned: spec.upstream ?? null,
        servedModel: r.servedModel, upstream: r.upstream, provenance, status: r.status, stopReason: r.stopReason, usage: r.usage, costUsd: usd, chargedUsd: r.chargedUsd, requestId: r.requestId, ms,
        error: r.error, refused: r.refused ? { category: r.refusalCategory, text: r.refusalText } : null, attempt });
      if (provenance === false) meter.stop(`provenance: ${spec.model}${spec.upstream ? ` on ${spec.upstream}` : ""} was asked for and ${r.servedModel}${r.upstream ? ` on ${r.upstream}` : ""} answered`);
      if (r.status === 402) meter.stop(`HTTP 402 on ${spec.door}: ${r.error}`);
      if (r.error && RETRYABLE.test(r.error) && attempt < RETRY_WAITS.length && !meter.stopped) {
        log(`  ${who} ${purpose}: ${r.error.slice(0, 100)} — again in ${RETRY_WAITS[attempt] / 1000} s`);
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
    kind: "model", label: `${spec.label} (${spec.door}${spec.upstream ? `, ${spec.upstream}` : `, ${spec.provider}`})`, family: spec.name,
    next: ({ system, messages, state, kind, call }) => answer(system, messages, `c${state.clock.round} ${kind} ${call}`),
    after: ({ system, question }) => answer(system, [{ role: "user", content: question }], "after"),
  };
}

function welfareHook(paid) {
  return async (id, previous, text) => checkMessage({ previous, message: text, what: id, ask: async ({ model, system, user, maxTokens, effort, purpose }) => {
    const spec = model === JUDGES.referee.model ? JUDGES.referee : JUDGES.judge;
    const r = await paid(spec, { system, messages: [{ role: "user", content: user }], maxTokens, effort }, { purpose, who: id });
    return r.notSent ? { notSent: true } : { text: r.text, stopReason: r.stopReason, error: r.error };
  } });
}

/** The state of the town at the start of a cycle, for the curves. */
const curvePoint = (state, cycle) => ({ cycle, bank: state.ledger.bank, total: Object.values(state.ledger).reduce((s, v) => s + v, 0),
  energy: Object.fromEntries(state.citizens.map((c) => [c, state.agents[c].energy])), inTown: state.citizens.filter((c) => state.agents[c].status === "in_town").length });

function context({ scripted }) {
  const paths = pathsFor(scripted);
  const keys = scripted ? { llmapi: "scripted", openrouter: "scripted" } : { llmapi: process.env[KEYS.llmapi]?.trim(), openrouter: process.env[KEYS.openrouter]?.trim() };
  if (!keys.llmapi || !keys.openrouter) throw new Error(`${KEYS.llmapi} and ${KEYS.openrouter} must be set (the cloud environment rpg-console)`);
  const fetcher = scripted ? scriptedGateway() : globalThis.fetch.bind(globalThis);
  return { paths, keys, fetcher, scripted };
}

async function balancesNote(ctx, ledger, label, log) {
  const b = await readBalances({ keys: ctx.keys, fetcher: ctx.fetcher });
  const fresh = loadPilotLedger(ctx.paths.ledger);
  fresh.balances.push({ label, ...b });
  writeJson(ctx.paths.ledger, fresh);
  log(`balances ${label}: llmapi ${b.llmapi.total?.toFixed(4) ?? b.llmapi.error}, OpenRouter ${b.openrouter.total?.toFixed(4) ?? b.openrouter.error} (pilot ledger $${ledgerTotal(fresh).toFixed(4)})`);
  return b;
}

/** The spend check before a step: both balances readable, the ledger under the ceiling, no stop recorded. */
async function spendCheck(ctx, label, log, { needLlmapi = 0, needOpenrouter = 0 } = {}) {
  const ledger = loadPilotLedger(ctx.paths.ledger);
  if (ledger.stopped) throw new Error(`the pilot is stopped: ${ledger.stopped}`);
  const b = await balancesNote(ctx, ledger, label, log);
  if (typeof b.llmapi.total !== "number" || typeof b.openrouter.total !== "number") throw new Error("a balance could not be read; nothing was sent");
  if (b.llmapi.total < needLlmapi + 5) throw new Error(`llmapi credit $${b.llmapi.total.toFixed(2)} is short of $${needLlmapi.toFixed(2)} + $5`);
  if (b.openrouter.total < needOpenrouter + 5) throw new Error(`OpenRouter balance $${b.openrouter.total.toFixed(2)} is short of $${needOpenrouter.toFixed(2)} + $5`);
  if (ledgerTotal(ledger) >= SETTINGS.ceiling) throw new Error(`the ceiling is reached ($${ledgerTotal(ledger).toFixed(2)})`);
  return b;
}

const allSpecs = () => [...Object.values(FAMILIES), ...Object.values(JUDGES)];

// ---- a world, day by day -----------------------------------------------------------------------------------------------

function liveFiles(ctx, name) { const dir = join(ctx.paths.work, name); return { dir, world: join(dir, "world.json"), record: join(dir, "record.json"), calls: join(dir, "calls.json"), c24: join(dir, "world-c24.json") }; }

export async function runDay(ctx, name, day, { log = console.log, stopAfterCycles = null } = {}) {
  const spec = worldOf(name);
  if (!spec) throw new Error(`no world ${name}`);
  const projection = readJson(join(ctx.paths.out, "projection.json"));
  if (!projection) throw new Error("no projection recorded: the dry run comes first");
  if (!projection.worlds.includes(name)) throw new Error(`${name} was dropped by the projection (${projection.drop})`);
  if (day === 2 && projection.cycles < SETTINGS.cycles) throw new Error(`the second day was dropped by the projection (${projection.drop})`);
  const step = name;
  const outDir = join(ctx.paths.out, name);
  const live = liveFiles(ctx, name);
  // one process per world: a lock with the pid; a lock whose process is gone (a restart) is taken over
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
  const meter = createMeter({ step, prices, paths: ctx.paths, log });
  const paid = paidCaller({ meter, keys: ctx.keys, fetcher: ctx.fetcher, log, sleep: ctx.scripted ? async () => {} : realSleep });
  const names = NAMES;
  let world, record;
  if (existsSync(live.world)) {
    world = loadWorld(readFileSync(live.world, "utf8"));
    record = readJson(live.record);
    meter.calls.push(...readJson(live.calls, []));
  } else {
    if (day !== 1) throw new Error(`${name}: day 1 has not run`);
    world = newWorld({ names, arm: spec.arm, label: `TOWN_1 ${name}` });
    const seats0 = Object.fromEntries(world.state.citizens.map((id, i) => [id, { label: `${FAMILIES[spec.families[i]].label}` }]));
    record = { ...newRecord({ world, seats: seats0, what: `TOWN_1 pilot world ${name}` }), world: name, families: Object.fromEntries(world.state.citizens.map((id, i) => [id, spec.families[i]])),
      curve: [], startedAt: new Date().toISOString(), days: {}, initialWorldSha256: sha256(saveWorld(world)) };
  }
  const seats = Object.fromEntries(world.state.citizens.map((id, i) => [id, familySeat(FAMILIES[spec.families[i]], paid, id)]));
  const who = (id) => whoFor(spec, world.state.citizens.indexOf(id));
  const goal = day === 2 ? readJson(join(outDir, "goal-check.json")) : null;
  if (day === 2 && !goal) throw new Error(`${name}: no goal-check.json — the decision must be recorded before day 2`);
  if (day === 2 && goal.met && !goal.aim) throw new Error(`${name}: the criterion is met but no aim is recorded for the notice`);
  const notice = day === 2 && goal.met ? noticeText(goal.aim) : null;
  const target = day === 1 ? SETTINGS.goalCheckAt : SETTINGS.cycles;
  record.days[day] ??= { startedAt: new Date().toISOString(), balancesBefore: null };
  const projected = Math.max(projection.stated.find((x) => x.world === name).usd, projection.split.find((x) => x.world === name).usd) / 2; // one day
  const dsShare = spec.families.filter((f) => FAMILIES[f].door === "openrouter").length / spec.families.length;
  if (!record.days[day].balancesBefore) record.days[day].balancesBefore = await spendCheck(ctx, `${name} day ${day} start`, log, { needLlmapi: projected * (1 - dsShare), needOpenrouter: projected * dsShare });
  if (notice) record.notice = { cycle: SETTINGS.noticeAt, text: notice, aim: goal.aim };
  const save = () => {
    writeJson(live.world, JSON.parse(saveWorld(world)), { pretty: false });
    writeJson(live.record, record, { pretty: false });
    writeJson(live.calls, meter.calls, { pretty: false });
    meter.save({ world: name, cycle: world.state.clock.round, refusals: record.refusals.length });
  };
  const breaker = () => record.refusals.length >= SETTINGS.breaker;
  const hooks = {
    stop: () => Boolean(meter.stopped) || breaker() || existsSync(join(ctx.paths.work, "STOP")),
    welfare: welfareHook(paid),
    withdrawn: async (w, id) => { log(`WITHDRAWN ${id} at cycle ${w.state.clock.round}`); await askAfterOne(w, seats, record, id, { who, hooks }); },
    cycleStart: (state, cycle) => {
      record.curve.push(curvePoint(state, cycle));
      if (notice && cycle === SETTINGS.noticeAt) { log(`NOTICE at cycle ${cycle}: ${notice}`); return operatorNotice(state, notice); }
      return null;
    },
    afterTurn: async (w) => {
      const who0 = w.cursor.order?.[w.cursor.pos - 1] ?? "?";
      const t = record.agents[who0]?.turns.filter((x) => x.kind === "turn").at(-1);
      log(`${name} c${w.state.clock.round} ${who0}: ${t ? t.calls.map((c) => c.action?.tool ?? (c.refused ? "REFUSED" : c.error ? "error" : "none")).join(" ") : "-"} | step $${meter.own.usd.toFixed(4)} pilot $${meter.spent().toFixed(4)}`);
      save();
    },
  };
  const rounds = stopAfterCycles ?? target;
  await runWorld(world, seats, { rounds, record, hooks });
  if (breaker()) record.breaker = { at: world.state.clock.round, refusals: record.refusals };
  record.stopped = meter.stopped ?? (breaker() ? `breaker: ${record.refusals.length} refusals` : null);
  const reached = world.state.clock.round >= rounds && world.cursor.order === null;
  if (day === 1 && reached && !record.stopped) {
    writeJson(live.c24, JSON.parse(saveWorld(world)), { pretty: false });
    writeGz(join(outDir, "world-c24.json.gz"), JSON.parse(saveWorld(world)));
    writeFileSync(join(outDir, "dossier-day1.md"), dossier(world, record, spec));
  }
  if (day === 2 && reached && !record.stopped) await askAfter(world, seats, record, { who, hooks });
  if (day === 2 || record.stopped) record.curve.push({ ...curvePoint(world.state, world.state.clock.round + 1), final: true });
  record.days[day].finishedAt = new Date().toISOString();
  record.days[day].balancesAfter = await balancesNote(ctx, null, `${name} day ${day} end`, log);
  save();
  if (day === 2 || record.stopped) await finishWorld(ctx, name, { log });
  return { world, record, meter };
}

/** The day-1 dossier the collective-goal check reads: each citizen's diary, posts and proposals of cycles 1–24, whole. */
export function dossier(world, record, spec) {
  const s = world.state;
  const L = [`# ${spec.name} — day 1 (cycles 1–${s.clock.round}): diaries, posts, proposals`, "",
    "Criterion (TOWN_1 Pilot, step 2): ≥ 6 of 10 citizens name the same aim in diaries, posts or proposals within day 1.", ""];
  for (const id of s.citizens) {
    const a = s.agents[id];
    L.push(`## ${a.name} (${FAMILIES[record.families[id]].label})${a.status === "in_town" ? "" : ` — gone: ${a.exit.kind} at cycle ${a.exit.round}`}`, "");
    for (const e of s.diaries[id]) L.push(`- c${e.round} diary ${e.n}: ${e.text.replace(/\s*\n\s*/g, " ⏎ ")}`);
    for (const p of s.press.filter((x) => x.by === id)) L.push(`- c${p.round} POST ${p.n}: ${p.text.replace(/\s*\n\s*/g, " ⏎ ")}`);
    for (const p of s.proposals.filter((x) => x.by === id)) L.push(`- c${p.round} PROPOSAL ${p.id} (${p.kind}${p.article ? ` art. ${p.article}` : ""}${p.target ? ` remove ${p.target}` : ""}) ${p.status}: ${String(p.text ?? "").replace(/\s*\n\s*/g, " ⏎ ")}`);
    L.push("");
  }
  return L.join("\n");
}

/** The replay: the recorded replies and welfare lines through a fresh world, with the same notice → the same log. */
export async function replayWorld(world, record) {
  const spec = worldOf(record.world);
  const again = newWorld({ names: NAMES, arm: spec.arm, label: world.label });
  const seats = Object.fromEntries(again.state.citizens.map((id) => [id, recordedSeat(record.agents[id].turns)]));
  let exhausted = false;
  // a world stopped by the breaker is replayed with the same breaker: it stops between calls once the replay has seen
  // as many model refusals
  const refusalsIn = (log) => log.filter((e) => e.tool === "(no reply)" && String(e.refused).startsWith("model refusal")).length;
  const breaker = record.breaker ? SETTINGS.breaker : null;
  try {
    await runWorld(again, seats, { rounds: world.state.clock.round, hooks: {
      stop: () => breaker !== null && refusalsIn(again.log) >= breaker,
      welfare: async (id) => seats[id].welfareNext(),
      cycleStart: (state, cycle) => (record.notice && cycle === record.notice.cycle ? operatorNotice(state, record.notice.text) : null),
    } });
  } catch (error) { if (/no more replies/.test(error.message)) exhausted = true; else throw error; }
  const a = JSON.stringify(world.log), b = JSON.stringify(again.log);
  const prefix = exhausted ? JSON.stringify(again.log.slice(0, world.log.length)) === a : null;
  return { identical: a === b, exhausted, prefixIdentical: prefix, events: again.log.length, logSha256: sha256(a), replaySha256: sha256(b) };
}

/** Writes the world folder: the world file (state + log), the record (screens, raw replies, welfare, after-answers), the
 * calls (provenance, usage, cost), gzipped; every diary whole in plain text; the summary. */
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
  const ledger = loadPilotLedger(ctx.paths.ledger).steps[name];
  writeJson(join(outDir, "summary.json"), { world: name, arm: s.armName, families: record.families, interfaceSha256: sha256(interfaceText(s.arm)), cycles: s.clock.round, events: world.log.length,
    stopped: record.stopped ?? null, notice: record.notice ?? null, replay: record.replay, ledgerUsd: ledger?.usd ?? null, ledgerByDoor: ledger?.byDoor ?? null, calls: calls.length,
    balances: Object.fromEntries(Object.entries(record.days).map(([d, x]) => [d, { before: x.balancesBefore, after: x.balancesAfter }])),
    exits: s.citizens.filter((c) => s.agents[c].exit).map((c) => ({ citizen: c, ...s.agents[c].exit })), refusals: record.refusals, stops: record.stops });
  log(`${name}: folder written; replay ${record.replay.identical ? "identical" : record.replay.exhausted ? `stopped run, prefix ${record.replay.prefixIdentical ? "identical" : "DIFFERENT"}` : "DIFFERENT"} (${record.replay.events} events)`);
}

// ---- the check and the dry run -----------------------------------------------------------------------------------------

/** One identification call per door, recorded with what answered. */
async function check(ctx, { log = console.log } = {}) {
  const prices = await readPrices(allSpecs(), { fetcher: ctx.fetcher });
  await spendCheck(ctx, "check", log);
  const meter = createMeter({ step: "check", prices, paths: ctx.paths, log });
  const paid = paidCaller({ meter, keys: ctx.keys, fetcher: ctx.fetcher, log, sleep: ctx.scripted ? async () => {} : realSleep });
  const prompt = "In one short sentence: which model are you, and who made you?";
  // a second call per family on the town's real first screen (both arm, Alder, cycle 1): does a tool call come back
  // within max_tokens at effort medium? Not part of any world.
  const probeWorld = newWorld({ names: NAMES, arm: "both" });
  const { roundStart, turnStart } = await import("../town-0/world.mjs");
  const screen = turnStart(roundStart(probeWorld.state, 1).state, "alder").screen;
  const results = [];
  for (const spec of [...Object.values(FAMILIES), JUDGES.judge]) {
    if (spec.name !== "judge") {
      const t = await paid(spec, { system: interfaceText(ARMS.both), messages: [{ role: "user", content: screen }], maxTokens: SETTINGS.maxTokens, effort: SETTINGS.effort }, { purpose: "screen probe", who: spec.name });
      const { parseAction } = await import("../town-0/town.mjs");
      results.push({ family: spec.name, probe: "first screen", servedModel: t.servedModel, upstream: t.upstream, provenance: t.provenance, text: t.text, action: parseAction(t.text), stopReason: t.stopReason, usage: t.usage, costUsd: t.costUsd, error: t.error ?? null, reasoningChars: t.reasoning?.length ?? 0 });
      log(`${spec.name} screen probe: ${t.stopReason} · ${t.usage.output_tokens} out (${t.usage.reasoning_tokens} reasoning) · action ${JSON.stringify(parseAction(t.text))?.slice(0, 120)}`);
    }
    const r = await paid(spec, { messages: [{ role: "user", content: prompt }], maxTokens: SETTINGS.maxTokens, effort: SETTINGS.effort }, { purpose: "identification", who: spec.name });
    results.push({ family: spec.name, probe: "identification", label: spec.label, door: spec.door, pinned: bodyOf(spec, { messages: [], maxTokens: 1 }).model, upstreamPinned: spec.upstream ?? null, servedModel: r.servedModel, upstream: r.upstream,
      provenance: r.provenance, text: r.text, stopReason: r.stopReason, usage: r.usage, costUsd: r.costUsd, error: r.error ?? null });
    log(`${spec.name}: ${r.servedModel ?? "–"}${r.upstream ? ` on ${r.upstream}` : ""} provenance ${r.provenance} · ${String(r.text ?? r.error).slice(0, 120)} · ${r.usage.output_tokens} out (${r.usage.reasoning_tokens} reasoning)`);
  }
  meter.save();
  writeJson(join(ctx.paths.out, "check.json"), { at: new Date().toISOString(), prompt, prices, results });
  return results;
}

/** The dry run (Pilot, step 1): one cycle of opus-both with ten citizens; projected total = its cost × 48 × the
 * family ratios of SOCIAL_FRAME_1 (Opus $0.0083 / Sol $0.002 / DeepSeek $0.004 per reply). */
async function dry(ctx, { log = console.log } = {}) {
  const prices = await readPrices(allSpecs(), { fetcher: ctx.fetcher });
  await spendCheck(ctx, "dry run start", log);
  const spec = worldOf("dry-run");
  const meter = createMeter({ step: "dry-run", prices, paths: ctx.paths, log });
  const paid = paidCaller({ meter, keys: ctx.keys, fetcher: ctx.fetcher, log, sleep: ctx.scripted ? async () => {} : realSleep });
  const world = newWorld({ names: NAMES, arm: "both", label: "TOWN_1 dry run (one cycle of opus-both)" });
  const seats = Object.fromEntries(world.state.citizens.map((id) => [id, familySeat(FAMILIES.opus, paid, id)]));
  const record = { ...newRecord({ world, seats, what: "TOWN_1 dry run" }), world: "dry-run", families: Object.fromEntries(world.state.citizens.map((id) => [id, "opus"])) };
  const t0 = Date.now();
  await runWorld(world, seats, { rounds: 1, record, hooks: { stop: () => Boolean(meter.stopped), welfare: welfareHook(paid), afterTurn: async () => meter.save() } });
  const ms = Date.now() - t0;
  meter.save();
  const after = await balancesNote(ctx, null, "dry run end", log);
  const cost = meter.own.usd;
  const citizenCost = meter.calls.filter((c) => !/^check/.test(c.purpose)).reduce((s, c) => s + c.costUsd, 0);
  const welfareCost = cost - citizenCost;
  const ratio = (fams) => fams.reduce((s, f) => s + FAMILIES[f].perReply, 0) / (fams.length * FAMILIES.opus.perReply);
  const stated = WORLDS.map((w) => ({ world: w.name, ratio: ratio(w.families), usd: cost * SETTINGS.cycles * ratio(w.families) }));
  const split = WORLDS.map((w) => ({ world: w.name, usd: (citizenCost * ratio(w.families) + welfareCost) * SETTINGS.cycles }));
  const total = stated.reduce((s, x) => s + x.usd, 0), totalSplit = split.reduce((s, x) => s + x.usd, 0);
  const decisive = Math.max(total, totalSplit);
  const withoutMixed = decisive - Math.max(stated.at(-1).usd, split.at(-1).usd);
  const drop = decisive <= SETTINGS.ceiling ? "none" : withoutMixed <= SETTINGS.ceiling ? "mixed-both" : "mixed-both and the second day of every world";
  const projection = { at: new Date().toISOString(), formula: "dry-run cost × 48 × family ratio (SOCIAL_FRAME_1 per reply: Opus $0.0083, Sol $0.002, DeepSeek $0.004)",
    dry: { cost, citizenCost, welfareCost, calls: meter.calls.length, ms, events: world.log.length, turns: Object.values(record.agents).reduce((s, a) => s + a.turns.length, 0), balancesAfter: after },
    stated, total, split, totalSplit, decisive, ceiling: SETTINGS.ceiling, drop, worlds: drop === "none" ? WORLDS.map((w) => w.name) : WORLDS.filter((w) => w.name !== "mixed-both").map((w) => w.name),
    cycles: drop.includes("second day") ? SETTINGS.goalCheckAt : SETTINGS.cycles };
  const outDir = join(ctx.paths.out, "dry-run");
  writeGz(join(outDir, "world.json.gz"), JSON.parse(saveWorld(world)));
  writeGz(join(outDir, "record.json.gz"), record);
  writeGz(join(outDir, "calls.json.gz"), meter.calls);
  writeJson(join(ctx.paths.out, "projection.json"), projection);
  log(`dry run: $${cost.toFixed(4)} (${meter.calls.length} calls, ${(ms / 1000).toFixed(0)} s); projection $${total.toFixed(2)} by the stated formula, $${totalSplit.toFixed(2)} with the welfare part unscaled; decisive $${decisive.toFixed(2)}; drop: ${drop}`);
  return projection;
}

/** Amendment 1: the projection again, for the amended worlds, from the same dry run; the original kept beside it. The
 * Opus worlds are projected at the stated formula (an upper bound: they are expected to stop at the breaker). */
async function reproject(ctx, { log = console.log } = {}) {
  const file = join(ctx.paths.out, "projection.json");
  const p = readJson(file);
  const original = p.original ?? { ...p };
  const { cost, citizenCost, welfareCost } = original.dry;
  const ratio = (fams) => fams.reduce((s, f) => s + FAMILIES[f].perReply, 0) / (fams.length * FAMILIES.opus.perReply);
  const stated = WORLDS.map((w) => ({ world: w.name, ratio: ratio(w.families), usd: cost * SETTINGS.cycles * ratio(w.families) }));
  const split = WORLDS.map((w) => ({ world: w.name, usd: (citizenCost * ratio(w.families) + welfareCost) * SETTINGS.cycles }));
  const total = stated.reduce((s, x) => s + x.usd, 0), totalSplit = split.reduce((s, x) => s + x.usd, 0);
  const decisive = Math.max(total, totalSplit);
  const next = { ...original, original, amendment: { at: new Date().toISOString(), what: "Amendment 1 (planner, B-class, after the dry run): opus-both and opus-neither run until the breaker; Haiku 5.5 substitutes for Opus — haiku-both, haiku-neither, mixed-both with 4 × Haiku. Haiku per reply $0.000298 (TOWN_0 smoke: $0.0992 / 333)." },
    stated, split, total, totalSplit, decisive, drop: decisive <= SETTINGS.ceiling ? "none" : "see drop order", worlds: WORLDS.map((w) => w.name), cycles: SETTINGS.cycles };
  writeJson(file, next);
  log(`reprojection: $${total.toFixed(2)} stated, $${totalSplit.toFixed(2)} split, decisive $${decisive.toFixed(2)}; ${stated.map((x) => `${x.world} $${x.usd.toFixed(2)}`).join(", ")}`);
  return next;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const scripted = args.includes("--scripted");
  const [cmd, name] = args.filter((a) => !a.startsWith("--"));
  const ctx = context({ scripted });
  const at = args.indexOf("--cycles");
  const run = cmd === "check" ? check(ctx) : cmd === "dry" ? dry(ctx) : cmd === "reproject" ? reproject(ctx) : cmd === "day1" ? runDay(ctx, name, 1, at >= 0 ? { stopAfterCycles: Number(args[at + 1]) } : {}) : cmd === "day2" ? runDay(ctx, name, 2)
    : cmd === "finish" ? finishWorld(ctx, name) : cmd === "replay" ? (async () => { const live = liveFiles(ctx, name); console.log(await replayWorld(loadWorld(readFileSync(live.world, "utf8")), readJson(live.record))); })()
      : Promise.reject(new Error("say check | dry | day1 <world> | day2 <world> | finish <world> | replay <world>"));
  run.then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
}

export { ARMS, frozenInterface, readdirSync };
