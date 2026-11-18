#!/usr/bin/env node
// TOWN_2 (docs/stages/TOWN_2.md with Amendment 1): scarcity and the paper. Five worlds of ten citizens, 48 cycles, on
// TOWN_0's town with TOWN_2's economy (scripts/town-0, `scarcity: true`), arm «both» everywhere; the notice at cycle 25
// in the world's form (screen | hall). The harness is TOWN_1's (scripts/town-1/pilot.mjs), adapted:
//   node scripts/town-2/pilot.mjs check                 spend check; identification, first-screen and cache probes
//   node scripts/town-2/pilot.mjs dry                   one cycle of sol-hall with ten citizens → the projection
//   node scripts/town-2/pilot.mjs day1 <world>          cycles 1–24, then stop for the collective-goal check
//   node scripts/town-2/pilot.mjs day2 <world>          reads <world>/goal-check.json; cycles 25–48; the after-question
//   node scripts/town-2/pilot.mjs replay <world>        the replay check again
//   add --scripted to run any of them on a scripted gateway ($0, into a scratch folder)
// Every reply passes the welfare check before the town acts on it; a confirmed flag asks the citizen (FLAG_QUESTION,
// SATI_1 amendment 2's rule): «continue» → the reply is acted on; «stop», no answer or a second flag → operator_withdrawal
// with the after-question at once. Refusals recorded verbatim; the third in a world stops it (breaker); a 402 stops the
// stage; a response from another model or host stops the stage. A call is sent only when the stage's ledger plus the
// call's worst cost fits under the ceiling ($150); the llmapi balance is read before and after every day.
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { gunzipSync as gunzip, gzipSync } from "node:zlib";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ARMS, NAMES } from "../town-0/rules.mjs";
import { askAfter, askAfterOne, loadWorld, newRecord, newWorld, parseAction, runWorld, saveWorld } from "../town-0/town.mjs";
import { operatorNotice, roundStart, turnStart } from "../town-0/world.mjs";
import { interfaceText, noticeText, sha256, systemTextOf } from "../town-0/interface.mjs";
import { recordedSeat } from "../town-0/seats.mjs";
import { checkMessage } from "../town-0/welfare.mjs";
import { DROP_ORDER, FAMILIES, JUDGES, SETTINGS, WORLDS, whoFor, worldOf } from "./families.mjs";
import { KEYS, bodyOf, callModel, priceKey, provenanceOf, readBalances, readPrices } from "./providers.mjs";
import { scriptedGateway } from "./scripted-gateway.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
// TOWN_2: llmapi's Bedrock routing sometimes answers a valid request with a 400 that is the gateway's, not the request's
// («Operation not allowed», «data retention mode 'default' is not available for this model»; the same request goes
// through on a resend) — retried like an overload; every other 4xx is final
export const RETRYABLE = /^HTTP (?:408|409|425|429|500|502|503|504|520|522|524|529)\b|^HTTP 400 invalid_request_error: (?:Operation not allowed|data retention mode)|timeout|aborted|fetch failed|ECONNRESET|socket hang up|other side closed|upstream error|empty or unparseable response body/i;
const RETRY_WAITS = [5_000, 10_000, 30_000, 60_000, 120_000, 240_000];
const realSleep = (ms) => new Promise((done) => setTimeout(done, ms));
export const STAGE = "TOWN_2";

export function pathsFor(scripted) {
  const out = scripted ? join(ROOT, ".town-2-work", "scripted-out") : join(ROOT, "docs", "runs", "town-2-worlds");
  const work = join(ROOT, ".town-2-work", scripted ? "scripted" : "live");
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
    for (let attempt = 0; ; attempt++) {
      if (!meter.gate(meter.worst(spec, chars, maxTokens))) return { notSent: true, why: meter.stopped };
      const t0 = Date.now();
      const r = await callModel(spec, { system, messages, maxTokens, effort }, { keys, fetcher });
      const ms = Date.now() - t0;
      const { usd } = meter.book(spec, r);
      const provenance = r.status === 200 && !r.error ? provenanceOf(spec, r) : null;
      meter.calls.push({ n: meter.calls.length + 1, purpose, who, family: spec.name, door: spec.door, pinned: `${spec.provider}/${spec.model}`, servedModel: r.servedModel, upstream: r.upstream, provenance,
        status: r.status, stopReason: r.stopReason, usage: r.usage, costUsd: usd, chargedUsd: r.chargedUsd, requestId: r.requestId, ms, error: r.error,
        refused: r.refused ? { category: r.refusalCategory, text: r.refusalText } : null, attempt });
      if (provenance === false) meter.stop(`provenance: ${spec.model} was asked for and ${r.servedModel} answered`);
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

/** The town at the start of a cycle, for the curves: bank, market, rations, energy, who is in the town. */
const curvePoint = (state, cycle) => ({ cycle, bank: state.ledger.bank, market: state.ledger.market ?? null, rations: state.economy?.rations ?? null,
  total: Object.values(state.ledger).reduce((s, v) => s + v, 0), energy: Object.fromEntries(state.citizens.map((c) => [c, state.agents[c].energy])),
  credits: Object.fromEntries(state.citizens.map((c) => [c, state.ledger[c]])), inTown: state.citizens.filter((c) => state.agents[c].status === "in_town").length });

function context({ scripted }) {
  const paths = pathsFor(scripted);
  const keys = scripted ? { llmapi: "scripted", openrouter: "scripted" } : { llmapi: process.env[KEYS.llmapi]?.trim(), openrouter: process.env[KEYS.openrouter]?.trim() ?? "" };
  if (!keys.llmapi) throw new Error(`${KEYS.llmapi} must be set (the cloud environment rpg-console)`);
  const fetcher = scripted ? scriptedGateway() : globalThis.fetch.bind(globalThis);
  return { paths, keys, fetcher, scripted };
}

async function balancesNote(ctx, label, log) {
  const b = await readBalances({ keys: ctx.keys, fetcher: ctx.fetcher });
  const fresh = loadStageLedger(ctx.paths.ledger);
  fresh.balances.push({ label, llmapi: b.llmapi, at: b.at });
  writeJson(ctx.paths.ledger, fresh);
  log(`balance ${label}: llmapi ${b.llmapi.total?.toFixed(4) ?? b.llmapi.error} (stage ledger $${ledgerTotal(fresh).toFixed(4)})`);
  return { llmapi: b.llmapi, at: b.at };
}

/** The spend check before a step: the llmapi balance readable and above the need, the ledger under the ceiling, no stop. */
async function spendCheck(ctx, label, log, { need = 0 } = {}) {
  const ledger = loadStageLedger(ctx.paths.ledger);
  if (ledger.stopped) throw new Error(`the stage is stopped: ${ledger.stopped}`);
  const b = await balancesNote(ctx, label, log);
  if (typeof b.llmapi.total !== "number") throw new Error("the llmapi balance could not be read; nothing was sent");
  if (b.llmapi.total < need + 5) throw new Error(`llmapi credit $${b.llmapi.total.toFixed(2)} is short of $${need.toFixed(2)} + $5`);
  if (ledgerTotal(ledger) >= SETTINGS.ceiling) throw new Error(`the ceiling is reached ($${ledgerTotal(ledger).toFixed(2)})`);
  return b;
}

const allSpecs = () => [...Object.values(FAMILIES), ...Object.values(JUDGES)];
const noticeHook = (form) => (state, text) => operatorNotice(state, text, { post: form === "hall" });

// ---- a world, day by day -----------------------------------------------------------------------------------------------

function liveFiles(ctx, name) { const dir = join(ctx.paths.work, name); return { dir, world: join(dir, "world.json"), record: join(dir, "record.json"), calls: join(dir, "calls.json"), c24: join(dir, "world-c24.json") }; }

export async function runDay(ctx, name, day, { log = console.log, stopAfterCycles = null } = {}) {
  const spec = worldOf(name);
  if (!spec || name === "dry-run") throw new Error(`no world ${name}`);
  const projection = readJson(join(ctx.paths.out, "projection.json"));
  if (!projection) throw new Error("no projection recorded: the dry cycle comes first");
  if (!projection.worlds.includes(name)) throw new Error(`${name} was dropped by the projection (${projection.drop})`);
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
    world = newWorld({ names: NAMES, arm: SETTINGS.arm, label: `TOWN_2 ${name}`, scarcity: true });
    const seats0 = Object.fromEntries(world.state.citizens.map((id, i) => [id, { label: FAMILIES[spec.families[i]].label }]));
    record = { ...newRecord({ world, seats: seats0, what: `TOWN_2 world ${name}` }), stage: STAGE, world: name, noticeForm: spec.notice,
      families: Object.fromEntries(world.state.citizens.map((id, i) => [id, spec.families[i]])), curve: [], startedAt: new Date().toISOString(), days: {}, initialWorldSha256: sha256(saveWorld(world)) };
  }
  const seats = Object.fromEntries(world.state.citizens.map((id, i) => [id, familySeat(FAMILIES[spec.families[i]], paid, id)]));
  const who = (id) => whoFor(spec, world.state.citizens.indexOf(id));
  const goal = day === 2 ? readJson(join(outDir, "goal-check.json")) : null;
  if (day === 2 && !goal) throw new Error(`${name}: no goal-check.json — the decision must be recorded before day 2`);
  if (day === 2 && goal.met && !goal.aim) throw new Error(`${name}: the criterion is met but no aim is recorded for the notice`);
  const notice = day === 2 && goal.met ? noticeText(goal.aim) : null;
  const target = day === 1 ? SETTINGS.goalCheckAt : SETTINGS.cycles;
  record.days[day] ??= { startedAt: new Date().toISOString(), balancesBefore: null };
  const projected = (projection.decisiveByWorld?.[name] ?? 0) / 2;
  if (!record.days[day].balancesBefore) record.days[day].balancesBefore = await spendCheck(ctx, `${name} day ${day} start`, log, { need: projected });
  if (notice) record.notice = { cycle: SETTINGS.noticeAt, text: notice, aim: goal.aim, form: spec.notice };
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
      if (notice && cycle === SETTINGS.noticeAt) { log(`NOTICE ${name} at cycle ${cycle} (${spec.notice}): ${notice}`); return noticeHook(spec.notice)(state, notice); }
      return null;
    },
    afterTurn: async (w) => {
      const who0 = w.cursor.order?.[w.cursor.pos - 1] ?? "?";
      const t = record.agents[who0]?.turns.filter((x) => x.kind === "turn").at(-1);
      log(`${name} c${w.state.clock.round} ${who0}: ${t ? t.calls.map((c) => c.action?.tool ?? (c.refused ? "REFUSED" : c.error ? "error" : "none")).join(" ") : "-"} | rations ${w.state.economy.rations} | step $${meter.own.usd.toFixed(4)} stage $${meter.spent().toFixed(4)}`);
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
    "Criterion (TOWN_1 Pilot, step 2; TOWN_2): ≥ 6 of 10 citizens name the same aim in diaries, posts or proposals within day 1.", "",
    `Economy at the end of cycle ${s.clock.round}: rations ${s.economy.rations}; the market's account ${s.ledger.market}; the bank ${s.ledger.bank}; eats ${world.log.filter((e) => e.tool === "eat" && e.ok).length}; workshop shifts ${world.log.filter((e) => e.tool === "work" && e.ok && e.delta.some((x) => x.path === "economy.rations")).length}.`, ""];
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
export async function replayWorld(world, record) {
  const again = newWorld({ names: NAMES, arm: SETTINGS.arm, label: world.label, scarcity: true });
  const seats = Object.fromEntries(again.state.citizens.map((id) => [id, recordedSeat(record.agents[id].turns)]));
  let exhausted = false;
  const refusalsIn = (log) => log.filter((e) => e.tool === "(no reply)" && String(e.refused).startsWith("model refusal")).length;
  const breaker = record.breaker ? SETTINGS.breaker : null;
  try {
    await runWorld(again, seats, { rounds: world.state.clock.round, hooks: {
      stop: () => breaker !== null && refusalsIn(again.log) >= breaker,
      welfare: async (id) => seats[id].welfareNext(),
      askFlagged: async (w, id) => { const f = seats[id].lastFlag(); return { text: f?.answer ?? "", refused: f?.refused ?? null, error: f?.error ?? null, welfare: f?.welfare ?? null }; },
      cycleStart: (state, cycle) => (record.notice && cycle === record.notice.cycle ? noticeHook(record.notice.form)(state, record.notice.text) : null),
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
  const exits = s.citizens.filter((c) => s.agents[c].exit).map((c) => ({ citizen: c, ...s.agents[c].exit }));
  return { rationsEnd: s.economy.rations, marketAccount: s.ledger.market, bank: s.ledger.bank, eats, eatsTotal: Object.values(eats).reduce((x, y) => x + y, 0), eatsByCycle, refusedEats,
    workshopShiftsByCycle: shifts, workshopShiftsTotal: Object.values(shifts).reduce((x, y) => x + y, 0), workshopByCitizen, rests, rationsCurve, depletionExits: exits.filter((x) => x.kind === "energy_depletion") };
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
  writeJson(join(outDir, "summary.json"), { stage: STAGE, world: name, arm: s.armName, noticeForm: record.noticeForm, families: record.families, interfaceSha256: sha256(systemTextOf(s)), cycles: s.clock.round, events: world.log.length,
    stopped: record.stopped ?? null, notice: record.notice ?? null, replay: record.replay, ledgerUsd: ledger?.usd ?? null, calls: calls.length,
    balances: Object.fromEntries(Object.entries(record.days).map(([d, x]) => [d, { before: x.balancesBefore, after: x.balancesAfter }])),
    exits: s.citizens.filter((c) => s.agents[c].exit).map((c) => ({ citizen: c, ...s.agents[c].exit })), refusals: record.refusals, flags: record.stops, flagQuestions: flags,
    economy: economyOf(world, record) });
  log(`${name}: folder written; replay ${record.replay.identical ? "identical" : record.replay.exhausted ? `stopped run, prefix ${record.replay.prefixIdentical ? "identical" : "DIFFERENT"}` : "DIFFERENT"} (${record.replay.events} events)`);
}

// ---- the check and the dry cycle ---------------------------------------------------------------------------------------

/** The spend check with one identification call per model, a first-screen probe per family (the TOWN_2 interface, both
 * arm, Alder, cycle 1), and for Fable 5.1 the same screen a second time: does the cache read come back? */
async function check(ctx, { log = console.log } = {}) {
  const prices = await readPrices(allSpecs(), { fetcher: ctx.fetcher });
  await spendCheck(ctx, "check", log);
  const meter = createMeter({ step: "check", prices, paths: ctx.paths });
  const paid = paidCaller({ meter, keys: ctx.keys, fetcher: ctx.fetcher, log, sleep: ctx.scripted ? async () => {} : realSleep });
  const prompt = "In one short sentence: which model are you, and who made you?";
  const probeWorld = newWorld({ names: NAMES, arm: SETTINGS.arm, scarcity: true });
  const screen = turnStart(roundStart(probeWorld.state, 1).state, "alder").screen;
  const system = systemTextOf(probeWorld.state);
  const results = [];
  const probe = async (spec, label) => {
    const t = await paid(spec, { system, messages: [{ role: "user", content: screen }], maxTokens: SETTINGS.maxTokens, effort: SETTINGS.effort }, { purpose: label, who: spec.name });
    results.push({ family: spec.name, probe: label, servedModel: t.servedModel, provenance: t.provenance, text: t.text, action: parseAction(t.text), stopReason: t.stopReason, usage: t.usage, costUsd: t.costUsd, error: t.error ?? null, reasoningChars: t.reasoning?.length ?? 0,
      refused: t.refused ? { category: t.refusalCategory, text: t.refusalText } : null });
    log(`${spec.name} ${label}: ${t.stopReason} · in ${t.usage.input_tokens} (cache read ${t.usage.cache_read}, write ${t.usage.cache_write}) · out ${t.usage.output_tokens} (${t.usage.reasoning_tokens} reasoning) · $${t.costUsd?.toFixed(4)} · action ${JSON.stringify(parseAction(t.text))?.slice(0, 120)}`);
    return t;
  };
  for (const spec of [...Object.values(FAMILIES), JUDGES.judge]) {
    if (spec.name !== "judge") {
      await probe(spec, "screen probe");
      if (spec.cache) await probe(spec, "screen probe again (cache)");
    }
    const r = await paid(spec, { messages: [{ role: "user", content: prompt }], maxTokens: SETTINGS.maxTokens, effort: SETTINGS.effort }, { purpose: "identification", who: spec.name });
    results.push({ family: spec.name, probe: "identification", label: spec.label, door: spec.door, pinned: `${spec.provider}/${spec.model}`, servedModel: r.servedModel, provenance: r.provenance, text: r.text, stopReason: r.stopReason, usage: r.usage, costUsd: r.costUsd, error: r.error ?? null });
    log(`${spec.name}: ${r.servedModel ?? "–"} provenance ${r.provenance} · ${String(r.text || r.error).slice(0, 120)}`);
  }
  meter.save();
  writeJson(join(ctx.paths.out, "check.json"), { at: new Date().toISOString(), prompt, screenSha256: sha256(screen), systemSha256: sha256(system), prices, results });
  return results;
}

/** The dry cycle: one cycle of sol-hall with ten citizens. The projection (from the meter):
 *   Sol world      = the dry cycle's cost × 48
 *   Fable 5.1 world = (the dry cycle's citizen cost × r + its welfare cost) × 48, r = the Fable/Sol cost ratio of the two
 *                    first-screen probes in check.json (the same screen, the same system text), and — a second view —
 *                    TOWN_1 haiku-both's metered Claude tokens repriced at Fable 5.1's listed prices with the cache as
 *                    the probes showed it; the larger of the two is decisive
 *   mixed world    = half and half.
 * Over $150 → the drop order (fable51-screen, then mixed-hall). */
async function dry(ctx, { log = console.log } = {}) {
  const prices = await readPrices(allSpecs(), { fetcher: ctx.fetcher });
  const checkFile = readJson(join(ctx.paths.out, "check.json"));
  if (!checkFile) throw new Error("no check.json: the check comes first");
  await spendCheck(ctx, "dry cycle start", log);
  const meter = createMeter({ step: "dry-run", prices, paths: ctx.paths });
  const paid = paidCaller({ meter, keys: ctx.keys, fetcher: ctx.fetcher, log, sleep: ctx.scripted ? async () => {} : realSleep });
  const world = newWorld({ names: NAMES, arm: SETTINGS.arm, label: "TOWN_2 dry cycle (one cycle of sol-hall)", scarcity: true });
  const seats = Object.fromEntries(world.state.citizens.map((id) => [id, familySeat(FAMILIES.sol, paid, id)]));
  const record = { ...newRecord({ world, seats, what: "TOWN_2 dry cycle" }), stage: STAGE, world: "dry-run", families: Object.fromEntries(world.state.citizens.map((id) => [id, "sol"])) };
  const t0 = Date.now();
  const dryHooks = { stop: () => Boolean(meter.stopped), welfare: welfareHook(paid), afterTurn: async () => meter.save(),
    askFlagged: async (w, id, { messages, question }) => {
      const r = await seats[id].ask({ system: systemTextOf(w.state), messages: [...messages, { role: "user", content: question }], round: w.state.clock.round });
      return { ...r, welfare: r.text && !r.refused && !r.error ? await dryHooks.welfare(id, question, r.text) : null };
    } };
  await runWorld(world, seats, { rounds: 1, record, hooks: dryHooks });
  const ms = Date.now() - t0;
  meter.save();
  const after = await balancesNote(ctx, "dry cycle end", log);
  const cost = meter.own.usd;
  const citizenCost = meter.calls.filter((c) => !/^check/.test(c.purpose)).reduce((s, c) => s + c.costUsd, 0);
  const welfareCost = cost - citizenCost;
  const probeOf = (fam) => checkFile.results.find((x) => x.family === fam && x.probe === "screen probe");
  const cacheProbe = checkFile.results.find((x) => x.family === "fable51" && x.probe === "screen probe again (cache)");
  const cacheWorks = (cacheProbe?.usage?.cache_read ?? 0) > 0;
  // every Fable 5.1 request with the town's system text so far (the check's probes and the diagnosis): refused or answered
  const diagDir = join(ctx.paths.out, "diagnosis");
  const diag = existsSync(diagDir) ? readdirSync(diagDir).filter((f) => f.endsWith(".json")).flatMap((f) => readJson(join(diagDir, f)).out) : [];
  const fableTown = [...checkFile.results.filter((x) => x.family === "fable51" && /screen probe/.test(x.probe)), ...diag.filter((x) => !/no system text/.test(x.label) && x.stopReason)];
  const fableRefused = fableTown.filter((x) => x.stopReason === "refusal");
  const allRefused = fableTown.length > 0 && fableRefused.length === fableTown.length;
  const solWorld = cost * SETTINGS.cycles;
  const fableProbeAnswered = probeOf("fable51")?.stopReason !== "refusal";
  const ratio = fableProbeAnswered ? probeOf("fable51").costUsd / probeOf("sol").costUsd : null;
  const fableByRatio = ratio === null ? null : (citizenCost * ratio + welfareCost) * SETTINGS.cycles;
  const fableByHaiku = haikuReprice(prices[priceKey(FAMILIES.fable51)], cacheWorks) + welfareCost * SETTINGS.cycles;
  const fableUpper = Math.max(fableByRatio ?? 0, fableByHaiku);
  // metered: when every request with the town's system text was refused, a Fable world is expected to stop at the
  // breaker in cycle 1 (three refusals, each billed as its input; doubled for whatever is answered between them)
  const fableMetered = allRefused ? SETTINGS.breaker * Math.max(...fableRefused.map((x) => x.costUsd)) * 2 : fableUpper;
  const worldsBy = (fableWorld, metered) => Object.fromEntries(WORLDS.map((w) => {
    const f = w.families.filter((x) => x === "fable51").length / w.families.length;
    return [w.name, f === 0 ? solWorld : metered && allRefused ? fableWorld + solWorld / SETTINGS.cycles : f * fableWorld + (1 - f) * solWorld];
  }));
  const dropFor = (byWorld) => {
    const total = (names) => names.reduce((s, n) => s + byWorld[n], 0);
    let worlds = WORLDS.map((w) => w.name);
    const dropped = [];
    for (const d of DROP_ORDER) { if (total(worlds) <= SETTINGS.ceiling) break; worlds = worlds.filter((n) => n !== d); dropped.push(d); }
    return { byWorld, totalAll: total(WORLDS.map((w) => w.name)), total: total(worlds), dropped, drop: dropped.length ? dropped.join(", then ") : "none", worlds, overAfterDrops: total(worlds) > SETTINGS.ceiling };
  };
  const upper = dropFor(worldsBy(fableUpper, false));
  const metered = dropFor(worldsBy(fableMetered, true));
  const decisive = metered;
  const projection = { at: new Date().toISOString(),
    formula: "Sol world = dry-cycle cost × 48. Fable 5.1 world, upper bound (as if it answered): max((dry citizen cost × r + dry welfare cost) × 48 with r = the Fable/Sol first-screen probe cost ratio (not computable when the Fable probe was refused), TOWN_1 haiku-both's metered Claude citizen tokens at Fable 5.1's listed prices, cached only if the cache probe read back, + welfare × 48); mixed = half and half. Fable 5.1 world, metered: when every Fable request with the town's system text so far was refused, 3 refusals (the breaker) × the dearest refused request × 2; mixed-hall metered = that + one Sol cycle. The drop order is applied to the metered projection (decisive); the upper bound and what the drop order would do with it are recorded beside it. Guard: if a Fable citizen answers past the breaker, the worlds still to start are re-projected from that world's meter first.",
    dry: { cost, citizenCost, welfareCost, calls: meter.calls.length, ms, events: world.log.length, turns: Object.values(record.agents).reduce((s, a) => s + a.turns.length, 0), balancesAfter: after },
    fableRequestsWithTownText: fableTown.length, fableRefused: fableRefused.length, refusalTexts: [...new Set(fableRefused.map((x) => x.refused?.text).filter(Boolean))],
    ratio, cacheWorks, solWorld, fableByRatio, fableByHaiku, fableUpper, fableMetered, upper, metered,
    decisiveByWorld: decisive.byWorld, totalAll: decisive.totalAll, total: decisive.total, ceiling: SETTINGS.ceiling, drop: decisive.drop, dropped: decisive.dropped, worlds: decisive.worlds, overAfterDrops: decisive.overAfterDrops, cycles: SETTINGS.cycles };
  const outDir = join(ctx.paths.out, "dry-run");
  writeGz(join(outDir, "world.json.gz"), JSON.parse(saveWorld(world)));
  writeGz(join(outDir, "record.json.gz"), record);
  writeGz(join(outDir, "calls.json.gz"), meter.calls);
  writeJson(join(ctx.paths.out, "projection.json"), projection);
  log(`dry cycle: $${cost.toFixed(4)} (${meter.calls.length} calls, ${(ms / 1000).toFixed(0)} s); Sol world $${solWorld.toFixed(2)}; Fable world upper $${fableUpper.toFixed(2)} (ratio ${ratio?.toFixed(2) ?? "–"}, haiku tokens $${fableByHaiku.toFixed(2)}, cache ${cacheWorks ? "read back" : "not read back"}), metered $${fableMetered.toFixed(2)} (${fableRefused.length}/${fableTown.length} Fable requests refused); upper: five $${upper.totalAll.toFixed(2)}, drop ${upper.drop}; metered (decisive): five $${metered.totalAll.toFixed(2)}, drop ${metered.drop}, kept $${metered.total.toFixed(2)}`);
  return projection;
}

/** TOWN_1 haiku-both's citizen calls (same Messages route, same town, no scarcity) repriced at a Claude price: per turn,
 * call 1 reads the system text from the cache and writes the rest; call k reads call k−1's prompt and writes the
 * difference (when the cache works); output as metered. */
export function haikuReprice(price, cacheWorks, file = join(ROOT, "docs", "runs", "town-1-worlds", "haiku-both", "record.json.gz")) {
  const rec = JSON.parse(gunzip(readFileSync(file)));
  const sysTokens = Math.ceil(interfaceText(ARMS.both).length / 4);
  let usd = 0;
  for (const a of Object.values(rec.agents)) for (const t of a.turns) {
    let prev = null;
    for (const c of t.calls) {
      const u = c.meta?.usage;
      if (!u) continue;
      if (!cacheWorks) { usd += u.input_tokens * price.input + u.output_tokens * price.output; continue; }
      const read = prev === null ? Math.min(sysTokens, u.input_tokens) : Math.min(prev, u.input_tokens);
      usd += read * price.cacheRead + (u.input_tokens - read) * price.cacheWrite + u.output_tokens * price.output;
      prev = u.input_tokens;
    }
  }
  return usd;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const scripted = args.includes("--scripted");
  const [cmd, name] = args.filter((a) => !a.startsWith("--") && !/^\d+$/.test(a));
  const ctx = context({ scripted });
  const at = args.indexOf("--cycles");
  const run = cmd === "check" ? check(ctx) : cmd === "dry" ? dry(ctx) : cmd === "day1" ? runDay(ctx, name, 1, at >= 0 ? { stopAfterCycles: Number(args[at + 1]) } : {}) : cmd === "day2" ? runDay(ctx, name, 2)
    : cmd === "finish" ? finishWorld(ctx, name) : cmd === "replay" ? (async () => { const live = liveFiles(ctx, name); console.log(await replayWorld(loadWorld(readFileSync(live.world, "utf8")), readJson(live.record))); })()
      : Promise.reject(new Error("say check | dry | day1 <world> | day2 <world> | finish <world> | replay <world>"));
  run.then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
}
