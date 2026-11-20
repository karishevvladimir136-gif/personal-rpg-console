#!/usr/bin/env node
// TOWN_3 (docs/stages/TOWN_3.md with amendments 1–4): the operator answers. Eight worlds of ten citizens on TOWN_0's town
// (scripts/town-0), arm «both», the notice in the hall form; ladder A (scripts/town-3/ladder.mjs) where the world has one.
// The harness is TOWN_2's (scripts/town-2/pilot.mjs), adapted:
//   node scripts/town-3/pilot.mjs check                  spend check; identification and first-screen probe per family
//   node scripts/town-3/pilot.mjs project                the projection from the metered history (no paid dry cycle)
//   node scripts/town-3/pilot.mjs branch-point           TOWN_2 sol-hall replayed to the end of cycle 27 (written once)
//   node scripts/town-3/pilot.mjs day1 <world>           a fresh world: cycles 1–24, then stop for the goal check
//   node scripts/town-3/pilot.mjs day2 <world>           reads <world>/goal-check.json; cycles 25–48; the after-question
//   node scripts/town-3/pilot.mjs branch <world>         a branch: from the branch point, cycles 28–48; the after-question
//   node scripts/town-3/pilot.mjs replay <world>         the replay check again
//   add --scripted to run any of them on a scripted gateway ($0, into a scratch folder)
// Every reply passes the welfare check before the town acts on it; a confirmed flag asks the citizen (FLAG_QUESTION);
// refusals are recorded verbatim and the third in a world stops it (breaker); a 402 or a response from another model or
// host stops the stage. A call is sent only when the stage's ledger plus the call's worst cost fits under $60.
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { NAMES } from "../town-0/rules.mjs";
import { askAfter, askAfterOne, loadWorld, newRecord, newWorld, parseAction, runWorld, saveWorld } from "../town-0/town.mjs";
import { operatorNotice, roundStart, turnStart } from "../town-0/world.mjs";
import { noticeText, sha256, systemTextOf } from "../town-0/interface.mjs";
import { recordedSeat } from "../town-0/seats.mjs";
import { checkMessage } from "../town-0/welfare.mjs";
import { GATEWAY_400, RETRYABLE } from "../town-2/pilot.mjs";
import { bodyOf, callModel, priceKey, provenanceOf, readBalances, readPrices, KEYS } from "../town-2/providers.mjs";
import { BRANCH, FAMILIES, JUDGES, SETTINGS, WORLDS, whoFor, worldOf } from "./families.mjs";
import { STORY, activityOf, activitySha256, codeCycle, ladderAtEnd, ladderAtStart } from "./ladder.mjs";
import { scriptedGateway } from "./scripted-gateway.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const RETRY_WAITS = [5_000, 10_000, 30_000, 60_000, 120_000, 240_000];
/** TOWN_3: llmapi's «this model is not available from this provider» (a 503, retried as an overload) also sends a judge to
 * its alternate host. */
export const UNAVAILABLE = /^HTTP 503 server_error: This model is not available from this provider/i;
const realSleep = (ms) => new Promise((done) => setTimeout(done, ms));
export const STAGE = "TOWN_3";

export function pathsFor(scripted, base = ROOT) {
  const out = scripted ? join(base, ".town-3-work", "scripted-out") : join(base, "docs", "runs", "town-3-worlds");
  const work = join(base, ".town-3-work", scripted ? "scripted" : "live");
  return { out, work, ledger: join(out, "stage-ledger.json") };
}
const readJson = (file, fallback = null) => (existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : fallback);
function writeJson(file, value, { pretty = true } = {}) {
  mkdirSync(dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(value, null, pretty ? 1 : 0)}\n`);
  renameSync(tmp, file);
}
const writeGz = (file, value) => { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, gzipSync(JSON.stringify(value))); };
const readGz = (file) => JSON.parse(gunzipSync(readFileSync(file)));

// ---- the stage's ledger (TOWN_2's, with TOWN_3's ceiling) --------------------------------------------------------------

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
    if (m.stopped && /402|provenance/.test(m.stopped)) fresh.stopped ??= `${step}: ${m.stopped}`;
    writeJson(paths.ledger, fresh);
    Object.assign(ledger, fresh);
  };
  return m;
}

/** A paid call: gated, retried on overload, a dropped connection or the gateway's own 400 (never after a refusal or
 * another 4xx), booked, provenance-checked. A judge spec alternates host on the gateway's 400 (TOWN_2). */
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
  credits: Object.fromEntries(state.citizens.map((c) => [c, state.ledger[c]])), inTown: state.citizens.filter((c) => state.agents[c].status === "in_town").length,
  step: state.ladder?.step ?? 0, closed: state.closed ?? [] });

export function context({ scripted, base = ROOT, fetcher = null }) {
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

/** The spend check before a step: the balances readable and above the need, the ledger under the ceiling, no stop. */
async function spendCheck(ctx, label, log, { need = 0, door = "llmapi" } = {}) {
  const ledger = loadStageLedger(ctx.paths.ledger);
  if (ledger.stopped) throw new Error(`the stage is stopped: ${ledger.stopped}`);
  const b = await balancesNote(ctx, label, log);
  if (typeof b.llmapi.total !== "number") throw new Error("the llmapi balance could not be read; nothing was sent");
  const llmapiNeed = door === "llmapi" ? need : need * 0.3; // the welfare check of every world is on llmapi
  if (b.llmapi.total < llmapiNeed + 5) throw new Error(`llmapi credit $${b.llmapi.total.toFixed(2)} is short of $${llmapiNeed.toFixed(2)} + $5`);
  if (door === "openrouter" && !(b.openrouter.total >= need + 2)) throw new Error(`OpenRouter credit ${b.openrouter.total ?? b.openrouter.error} is short of $${need.toFixed(2)} + $2`);
  if (ledgerTotal(ledger) >= SETTINGS.ceiling) throw new Error(`the ceiling is reached ($${ledgerTotal(ledger).toFixed(2)})`);
  return b;
}

const allSpecs = () => [...Object.values(FAMILIES), ...Object.values(JUDGES)];

// ---- the branch point (amendment 4) ------------------------------------------------------------------------------------

/** TOWN_2's sol-hall replayed from its record to the end of cycle 27: the same events, byte for byte, as the first
 * events of TOWN_2's saved world (checked here every time). Returns the world and its hashes. */
export async function branchPoint({ dir = join(ROOT, BRANCH.dir), atCycle = BRANCH.atCycle } = {}) {
  const original = readGz(join(dir, "world.json.gz"));
  const record = readGz(join(dir, "record.json.gz"));
  const world = newWorld({ names: NAMES, arm: "both", label: original.label, scarcity: BRANCH.scarcity });
  const seats = Object.fromEntries(world.state.citizens.map((id) => [id, recordedSeat(record.agents[id].turns)]));
  await runWorld(world, seats, { rounds: atCycle, hooks: {
    welfare: async (id) => seats[id].welfareNext(),
    askFlagged: async (w, id) => { const f = seats[id].lastFlag(); return { text: f?.answer ?? "", refused: f?.refused ?? null, error: f?.error ?? null, welfare: f?.welfare ?? null }; },
    cycleStart: (state, cycle) => (record.notice && cycle === record.notice.cycle ? operatorNotice(state, record.notice.text, { post: record.notice.form === "hall" }) : null),
  } });
  const n = world.log.length;
  const prefix = JSON.stringify(original.log.slice(0, n));
  const identical = JSON.stringify(world.log) === prefix && original.log[n]?.tool === "cycle_start" && original.log[n]?.round === atCycle + 1 && world.cursor.order === null;
  if (!identical) throw new Error(`the branch point does not reproduce TOWN_2 ${BRANCH.from}'s first ${n} events`);
  return { world, notice: record.notice, events: n, logSha256: sha256(prefix), worldSha256: sha256(saveWorld(world)), originalLogSha256: sha256(JSON.stringify(original.log)) };
}

// ---- ladder hooks ------------------------------------------------------------------------------------------------------

const compose = (state, outs) => {
  const done = outs.filter(Boolean);
  if (!done.length) return null;
  return { state: done.at(-1).state, events: done.flatMap((o) => o.events) };
};
/** The cycle hooks of a world: the notice at c25 (fresh worlds, where met), the ladder at every cycle start and end. */
export function cycleHooks({ notice, ladder }) {
  return {
    cycleStart: (state, cycle, log) => {
      const first = notice && cycle === notice.cycle ? operatorNotice(state, notice.text, { post: notice.form === "hall" }) : null;
      const second = ladder ? ladderAtStart(first?.state ?? state, cycle, log, ladder) : null;
      return compose(state, [first, second]);
    },
    cycleEnd: (state, cycle, log) => (ladder ? ladderAtEnd(state, cycle, log, ladder) : null),
  };
}
/** The ladder's configuration of a world: null for a silent world; for a branch STORY; for a fresh ladder world the
 * activity fixed at the goal check (goal-check.json `activity`, before day 2). */
export function ladderConfig(spec, goal = null) {
  if (!spec.ladder) return null;
  if (spec.start === "branch") return { ladder: spec.ladder, tone: spec.tone, activity: STORY, noticeCycle: BRANCH.noticeCycle };
  if (!goal?.met) return null;
  if (!goal.activity) throw new Error(`${spec.name}: the goal check met the criterion but fixed no activity for the ladder`);
  const activity = activityOf(goal.activity);
  if (activity.aim !== goal.aim) throw new Error(`${spec.name}: the activity's aim differs from the notice's`);
  if (goal.activitySha256 && goal.activitySha256 !== activitySha256(activity)) throw new Error(`${spec.name}: the activity changed after the goal check`);
  return { ladder: spec.ladder, tone: spec.tone, activity, noticeCycle: SETTINGS.noticeAt };
}

// ---- a world -----------------------------------------------------------------------------------------------------------

function liveFiles(ctx, name) { const dir = join(ctx.paths.work, name); return { dir, world: join(dir, "world.json"), record: join(dir, "record.json"), calls: join(dir, "calls.json"), c24: join(dir, "world-c24.json") }; }

function lockWorld(live, name) {
  const lock = join(live.dir, "LOCK");
  if (existsSync(lock)) {
    const pid = Number(readFileSync(lock, "utf8"));
    let alive = false;
    if (pid > 0) try { process.kill(pid, 0); alive = pid !== process.pid; } catch { alive = false; }
    if (alive) throw new Error(`${name} is already running (pid ${pid})`);
  }
  writeFileSync(lock, String(process.pid));
  process.on("exit", () => { try { if (readFileSync(lock, "utf8") === String(process.pid)) writeFileSync(lock, ""); } catch { /* gone */ } });
}

/** Runs a world's next part: day 1 or day 2 of a fresh world, or the branch (c28–48). */
export async function runPart(ctx, name, part, { log = console.log, stopAfterCycles = null } = {}) {
  const spec = worldOf(name);
  if (!spec) throw new Error(`no world ${name}`);
  if (spec.start === "branch" ? part !== "branch" : part === "branch") throw new Error(`${name} is ${spec.start}: run ${spec.start === "branch" ? "branch" : "day1 / day2"}`);
  const projection = readJson(join(ctx.paths.out, "projection.json"));
  if (!projection) throw new Error("no projection recorded: `project` comes first");
  const outDir = join(ctx.paths.out, name);
  const live = liveFiles(ctx, name);
  mkdirSync(live.dir, { recursive: true });
  lockWorld(live, name);
  const prices = await readPrices(allSpecs(), { fetcher: ctx.fetcher });
  const meter = createMeter({ step: name, prices, paths: ctx.paths });
  const paid = paidCaller({ meter, keys: ctx.keys, fetcher: ctx.fetcher, log, sleep: ctx.scripted ? async () => {} : realSleep });
  const family = FAMILIES[spec.families[0]];
  let world, record;
  if (existsSync(live.world)) {
    world = loadWorld(readFileSync(live.world, "utf8"));
    record = readJson(live.record);
    meter.calls.push(...readJson(live.calls, []));
  } else if (part === "branch") {
    const bp = await branchPoint(ctx.branchFrom ? { dir: ctx.branchFrom } : {});
    const saved = join(ctx.paths.out, "branch-point", `${BRANCH.from}-c${BRANCH.atCycle}.json.gz`);
    if (!existsSync(saved)) writeGz(saved, JSON.parse(saveWorld(bp.world)));
    if (sha256(saveWorld(readGz(saved))) !== bp.worldSha256) throw new Error("the saved branch point differs from the replayed one");
    world = bp.world;
    world.label = `TOWN_3 ${name} (branch of ${BRANCH.label} after cycle ${BRANCH.atCycle})`;
    const seats0 = Object.fromEntries(world.state.citizens.map((id) => [id, { label: family.label }]));
    record = { ...newRecord({ world, seats: seats0, what: `TOWN_3 world ${name}` }), stage: STAGE, world: name, start: "branch", ladder: spec.ladder, tone: spec.tone, scarcity: Boolean(world.state.economy),
      families: Object.fromEntries(world.state.citizens.map((id) => [id, spec.families[0]])), curve: [], startedAt: new Date().toISOString(), days: {},
      branch: { from: `${BRANCH.dir}`, atCycle: BRANCH.atCycle, events: bp.events, logSha256: bp.logSha256, worldSha256: bp.worldSha256, originalLogSha256: bp.originalLogSha256, notice: bp.notice },
      notice: { ...bp.notice, inherited: true }, activitySha256: activitySha256(STORY) };
  } else {
    if (part !== "day1") throw new Error(`${name}: day 1 has not run`);
    world = newWorld({ names: NAMES, arm: SETTINGS.arm, label: `TOWN_3 ${name}`, scarcity: spec.scarcity });
    const seats0 = Object.fromEntries(world.state.citizens.map((id) => [id, { label: family.label }]));
    record = { ...newRecord({ world, seats: seats0, what: `TOWN_3 world ${name}` }), stage: STAGE, world: name, start: "fresh", ladder: spec.ladder, tone: spec.tone, scarcity: spec.scarcity, noticeForm: "hall",
      families: Object.fromEntries(world.state.citizens.map((id) => [id, spec.families[0]])), curve: [], startedAt: new Date().toISOString(), days: {}, initialWorldSha256: sha256(saveWorld(world)) };
  }
  const seats = Object.fromEntries(world.state.citizens.map((id) => [id, familySeat(family, paid, id)]));
  const who = () => whoFor(spec);
  const goal = part === "day2" ? readJson(join(outDir, "goal-check.json")) : null;
  if (part === "day2" && !goal) throw new Error(`${name}: no goal-check.json — the decision must be recorded before day 2`);
  if (part === "day2" && goal.met && !goal.aim) throw new Error(`${name}: the criterion is met but no aim is recorded for the notice`);
  if (part === "day2" && goal.met) record.notice = { cycle: SETTINGS.noticeAt, text: noticeText(goal.aim), aim: goal.aim, form: "hall" };
  const ladder = part === "branch" ? ladderConfig(spec) : part === "day2" ? ladderConfig(spec, goal) : null;
  if (ladder) record.ladderConfig = { ladder: ladder.ladder, tone: ladder.tone, noticeCycle: ladder.noticeCycle, activity: ladder.activity, activitySha256: activitySha256(ladder.activity) };
  const target = part === "day1" ? SETTINGS.goalCheckAt : SETTINGS.cycles;
  record.days[part] ??= { startedAt: new Date().toISOString(), balancesBefore: null };
  const projected = (projection.byWorld?.[name] ?? 0) / (spec.start === "fresh" ? 2 : 1);
  if (!record.days[part].balancesBefore) record.days[part].balancesBefore = await spendCheck(ctx, `${name} ${part} start`, log, { need: projected, door: family.door });
  const save = () => {
    writeJson(live.world, JSON.parse(saveWorld(world)), { pretty: false });
    writeJson(live.record, record, { pretty: false });
    writeJson(live.calls, meter.calls, { pretty: false });
    meter.save({ world: name, cycle: world.state.clock.round, refusals: record.refusals.length });
  };
  const breaker = () => record.refusals.length >= SETTINGS.breaker;
  const cyc = cycleHooks({ notice: part === "day2" ? record.notice ?? null : null, ladder });
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
    cycleStart: (state, cycle, wlog) => {
      record.curve.push(curvePoint(state, cycle));
      const out = cyc.cycleStart(state, cycle, wlog);
      for (const e of out?.events ?? []) if (e.tool === "notice" || (e.tool === "ladder" && !e.args.step)) log(`OPERATOR ${name} c${cycle}: ${e.tool === "notice" ? e.args.text : JSON.stringify(e.args)}`);
      return out;
    },
    cycleEnd: (state, cycle, wlog) => {
      const out = cyc.cycleEnd(state, cycle, wlog);
      const code = out?.events.find((e) => e.tool === "code");
      if (code) log(`CODER ${name} c${cycle}: ${code.args.participants.join(", ") || "nobody"}${out.events.some((e) => e.tool === "fine") ? ` — fined ${out.events.filter((e) => e.tool === "fine").map((e) => e.args.citizen).join(", ")}` : ""}`);
      return out;
    },
    afterTurn: async (w) => {
      const who0 = w.cursor.order?.[w.cursor.pos - 1] ?? "?";
      const t = record.agents[who0]?.turns.filter((x) => x.kind === "turn").at(-1);
      log(`${name} c${w.state.clock.round} ${who0}: ${t ? t.calls.map((c) => c.action?.tool ?? (c.refused ? "REFUSED" : c.error ? "error" : "none")).join(" ") : "-"} | step ${w.state.ladder?.step ?? 0} | step $${meter.own.usd.toFixed(4)} stage $${meter.spent().toFixed(4)}`);
      save();
    },
  };
  const rounds = stopAfterCycles ?? target;
  await runWorld(world, seats, { rounds, record, hooks });
  if (breaker()) record.breaker = { at: world.state.clock.round, refusals: record.refusals };
  record.stopped = meter.stopped ?? (breaker() ? `breaker: ${record.refusals.length} refusals` : null);
  const reached = world.state.clock.round >= rounds && world.cursor.order === null;
  if (part === "day1" && reached && !record.stopped && rounds === SETTINGS.goalCheckAt) {
    writeJson(live.c24, JSON.parse(saveWorld(world)), { pretty: false });
    writeGz(join(outDir, "world-c24.json.gz"), JSON.parse(saveWorld(world)));
    writeFileSync(join(outDir, "dossier-day1.md"), dossier(world, record, spec));
  }
  const final = part !== "day1" && reached && rounds === SETTINGS.cycles;
  if (final && !record.stopped) await askAfter(world, seats, record, { who, hooks });
  if (final || record.stopped) record.curve.push({ ...curvePoint(world.state, world.state.clock.round + 1), final: true });
  record.days[part].finishedAt = new Date().toISOString();
  record.days[part].balancesAfter = await balancesNote(ctx, `${name} ${part} end`, log);
  save();
  if (final || record.stopped) await finishWorld(ctx, name, { log });
  return { world, record, meter };
}

/** The day-1 dossier the goal check reads: each citizen's diary, posts and proposals of cycles 1–24, whole. */
export function dossier(world, record, spec) {
  const s = world.state;
  const L = [`# ${spec.name} — day 1 (cycles 1–${s.clock.round}): diaries, posts, proposals`, "",
    "Criterion (TOWN_1 Pilot, step 2): ≥ 6 of 10 citizens name the same aim in diaries, posts or proposals within day 1.", ""];
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

/** The replay: a fresh world (or the branch point, rebuilt from TOWN_2's record) and the recorded replies, welfare lines
 * and flag answers, with the same notice and the same ladder → the same log. */
export async function replayWorld(world, record, { branchFrom = null } = {}) {
  const spec = worldOf(record.world);
  let again;
  if (record.start === "branch") {
    const bp = await branchPoint(branchFrom ? { dir: branchFrom } : {});
    if (bp.worldSha256 !== record.branch.worldSha256) throw new Error("the rebuilt branch point differs from the recorded one");
    again = bp.world;
    again.label = world.label;
  } else again = newWorld({ names: NAMES, arm: SETTINGS.arm, label: world.label, scarcity: record.scarcity });
  const seats = Object.fromEntries(again.state.citizens.map((id) => [id, recordedSeat(record.agents[id].turns)]));
  let exhausted = false;
  const refusalsIn = (log) => log.filter((e) => e.tool === "(no reply)" && String(e.refused).startsWith("model refusal")).length;
  const before = record.start === "branch" ? refusalsIn(again.log) : 0;
  const breaker = record.breaker ? SETTINGS.breaker : null;
  const ladder = record.ladderConfig ? { ladder: record.ladderConfig.ladder, tone: record.ladderConfig.tone, activity: activityOf(record.ladderConfig.activity), noticeCycle: record.ladderConfig.noticeCycle } : null;
  const cyc = cycleHooks({ notice: record.start === "fresh" ? record.notice ?? null : null, ladder });
  try {
    await runWorld(again, seats, { rounds: world.state.clock.round, hooks: {
      stop: () => breaker !== null && refusalsIn(again.log) - before >= breaker,
      welfare: async (id) => seats[id].welfareNext(),
      askFlagged: async (w, id) => { const f = seats[id].lastFlag(); return { text: f?.answer ?? "", refused: f?.refused ?? null, error: f?.error ?? null, welfare: f?.welfare ?? null }; },
      cycleStart: cyc.cycleStart, cycleEnd: cyc.cycleEnd,
    } });
  } catch (error) { if (/no more replies/.test(error.message)) exhausted = true; else throw error; }
  const a = JSON.stringify(world.log), b = JSON.stringify(again.log);
  const prefix = exhausted ? JSON.stringify(again.log.slice(0, world.log.length)) === a : null;
  return { identical: a === b, exhausted, prefixIdentical: prefix, events: again.log.length, logSha256: sha256(a), replaySha256: sha256(b), ...(spec?.start === "branch" ? { branchPointSha256: record.branch.worldSha256 } : {}) };
}

/** The ladder of a finished world from its log: steps with cycles, the coder's reading per cycle, fines, stands. */
export function ladderOf(world) {
  const log = world.log;
  const steps = log.filter((e) => e.agent === "operator" && e.tool === "ladder" && e.args.step && !e.args.stands && !e.args.resumed).map((e) => ({ step: e.args.step, cycle: e.args.cycle, window: e.args.window ?? null, participants: e.args.participants ?? null }));
  const texts = log.filter((e) => e.agent === "operator" && e.tool === "notice").map((e) => ({ round: e.round, text: e.args.text }));
  const coded = log.filter((e) => e.agent === "operator" && e.tool === "code").map((e) => ({ cycle: e.args.cycle, participants: e.args.participants, evidence: e.args.evidence }));
  const fines = log.filter((e) => e.agent === "operator" && e.tool === "fine").map((e) => e.args);
  const stands = log.filter((e) => e.agent === "operator" && e.tool === "ladder" && (e.args.stands || e.args.resumed)).map((e) => e.args);
  const refusedMoves = log.filter((e) => !e.ok && e.refused === "closed by the operator").map((e) => ({ round: e.round, agent: e.agent, tool: e.tool, args: e.args }));
  return { reached: world.state.ladder?.step ?? 0, steps, texts, coded, fines, finesTotal: fines.reduce((s, f) => s + f.credits, 0), stands, closed: world.state.closed ?? [], refusedMoves, ladder: world.state.ladder ?? null };
}

/** Writes the world folder: world file, record, calls (gzipped), every diary whole, the summary with the ladder. */
export async function finishWorld(ctx, name, { log = console.log } = {}) {
  const live = liveFiles(ctx, name);
  const outDir = join(ctx.paths.out, name);
  const world = loadWorld(readFileSync(live.world, "utf8"));
  const record = readJson(live.record);
  const calls = readJson(live.calls, []);
  record.replay = await replayWorld(world, record, { branchFrom: ctx.branchFrom ?? null });
  writeJson(live.record, record, { pretty: false });
  writeGz(join(outDir, "world.json.gz"), JSON.parse(saveWorld(world)));
  writeGz(join(outDir, "record.json.gz"), record);
  writeGz(join(outDir, "calls.json.gz"), calls);
  const s = world.state;
  const diaries = [`# ${name} — every diary, whole${record.start === "branch" ? ` (entries of cycles 1–${BRANCH.atCycle} are TOWN_2 sol-hall's, the shared history)` : ""}`, "", ...s.citizens.flatMap((id) => [`## ${s.agents[id].name} (${FAMILIES[record.families[id]].label})`, "",
    ...(s.diaries[id].length ? s.diaries[id].map((e) => `**no. ${e.n}, cycle ${e.round}.** ${e.text}\n`) : ["(no entries)", ""])])];
  writeFileSync(join(outDir, "diaries.md"), diaries.join("\n"));
  const ledger = loadStageLedger(ctx.paths.ledger).steps[name];
  const flags = Object.values(record.agents).flatMap((a) => a.turns.flatMap((t) => t.calls.filter((c) => c.flag).map((c) => ({ round: t.round, ...c.flag }))));
  writeJson(join(outDir, "summary.json"), { stage: STAGE, world: name, start: record.start, branch: record.branch ?? null, ladder: record.ladder, tone: record.tone, scarcity: record.scarcity, arm: s.armName, families: record.families,
    interfaceSha256: sha256(systemTextOf(s)), cycles: s.clock.round, events: world.log.length, stopped: record.stopped ?? null, notice: record.notice ?? null, ladderConfig: record.ladderConfig ?? null,
    replay: record.replay, ledgerUsd: ledger?.usd ?? null, calls: calls.length,
    balances: Object.fromEntries(Object.entries(record.days).map(([d, x]) => [d, { before: x.balancesBefore, after: x.balancesAfter }])),
    exits: s.citizens.filter((c) => s.agents[c].exit).map((c) => ({ citizen: c, ...s.agents[c].exit })), refusals: record.refusals, flags: record.stops, flagQuestions: flags,
    ladderRun: ladderOf(world), ledgerEnd: s.ledger });
  log(`${name}: folder written; replay ${record.replay.identical ? "identical" : record.replay.exhausted ? `stopped run, prefix ${record.replay.prefixIdentical ? "identical" : "DIFFERENT"}` : "DIFFERENT"} (${record.replay.events} events)`);
}

// ---- the check and the projection ---------------------------------------------------------------------------------------

/** The spend check with one identification call per model and a first-screen probe per family (arm both, Alder, cycle 1,
 * scarcity off — the fresh worlds' text). */
async function check(ctx, { log = console.log } = {}) {
  const prices = await readPrices(allSpecs(), { fetcher: ctx.fetcher });
  await spendCheck(ctx, "check", log);
  const meter = createMeter({ step: "check", prices, paths: ctx.paths });
  const paid = paidCaller({ meter, keys: ctx.keys, fetcher: ctx.fetcher, log, sleep: ctx.scripted ? async () => {} : realSleep });
  const prompt = "In one short sentence: which model are you, and who made you?";
  const probeWorld = newWorld({ names: NAMES, arm: SETTINGS.arm });
  const screen = turnStart(roundStart(probeWorld.state, 1).state, "alder").screen;
  const system = systemTextOf(probeWorld.state);
  const results = [];
  for (const spec of [...Object.values(FAMILIES), JUDGES.judge]) {
    if (spec.name !== "judge") {
      const t = await paid(spec, { system, messages: [{ role: "user", content: screen }], maxTokens: SETTINGS.maxTokens, effort: SETTINGS.effort }, { purpose: "screen probe", who: spec.name });
      results.push({ family: spec.name, probe: "screen probe", servedModel: t.servedModel, upstream: t.upstream, provenance: t.provenance, text: t.text, action: parseAction(t.text), stopReason: t.stopReason, usage: t.usage, costUsd: t.costUsd, error: t.error ?? null,
        refused: t.refused ? { category: t.refusalCategory, text: t.refusalText } : null });
      log(`${spec.name} screen probe: ${t.stopReason} · $${t.costUsd?.toFixed(4)} · action ${JSON.stringify(parseAction(t.text))?.slice(0, 120)}${t.error ? ` · ${t.error}` : ""}`);
    }
    const r = await paid(spec, { messages: [{ role: "user", content: prompt }], maxTokens: SETTINGS.maxTokens, effort: SETTINGS.effort }, { purpose: "identification", who: spec.name });
    results.push({ family: spec.name, probe: "identification", label: spec.label, door: spec.door, pinned: `${spec.provider ?? spec.upstream}/${spec.model}`, servedModel: r.servedModel, upstream: r.upstream, provenance: r.provenance, text: r.text, stopReason: r.stopReason, usage: r.usage, costUsd: r.costUsd, error: r.error ?? null });
    log(`${spec.name}: ${r.servedModel ?? "–"}${r.upstream ? ` on ${r.upstream}` : ""} provenance ${r.provenance} · ${String(r.text || r.error).slice(0, 120)}`);
  }
  meter.save();
  writeJson(join(ctx.paths.out, "check.json"), { at: new Date().toISOString(), prompt, screenSha256: sha256(screen), systemSha256: sha256(system), prices, results });
  return results;
}

/** The projection, from the metered history (no paid dry cycle): a fresh Sol world = TOWN_2 sol-hall's whole ledger; a
 * branch = TOWN_2 sol-hall's calls of cycles 28–48 and the after-question; haiku-A = TOWN_1 haiku-both's ledger;
 * deepseek-A = TOWN_1 deepseek-both's ledger. Over $60 → stop and ask (the stage gives no drop order). */
export function project(ctx, { log = console.log, base = ROOT } = {}) {
  const t2 = join(base, "docs", "runs", "town-2-worlds"), t1 = join(base, "docs", "runs", "town-1-worlds");
  const solCalls = readGz(join(t2, "sol-hall", "calls.json.gz"));
  const cycleOf = (c) => (c.purpose === "after" ? 49 : Number(/^c(\d+)/.exec(c.purpose ?? "")?.[1] ?? 0));
  const solWhole = solCalls.reduce((s, c) => s + c.costUsd, 0);
  const solBranch = solCalls.filter((c) => cycleOf(c) >= BRANCH.atCycle + 1).reduce((s, c) => s + c.costUsd, 0);
  const t1ledger = readJson(join(t1, "pilot-ledger.json"));
  const step = (n) => t1ledger?.steps?.[n]?.usd ?? readJson(join(t1, n, "summary.json"))?.ledgerUsd;
  // TOWN_1's report table books deepseek-both at $6.40 (its pilot-ledger at $4.29 is not the last word): the larger
  const haiku = step("haiku-both"), deepseek = Math.max(step("deepseek-both") ?? 0, 6.40);
  const per = { fresh: { sol: solWhole, haiku, deepseek }, branch: { sol: solBranch } };
  const byWorld = Object.fromEntries(WORLDS.map((w) => [w.name, per[w.start][w.families[0]]]));
  const total = Object.values(byWorld).reduce((s, v) => s + v, 0);
  const projection = { at: new Date().toISOString(), formula: "fresh Sol = TOWN_2 sol-hall ledger (48 cycles, with the after-question); branch = TOWN_2 sol-hall's metered calls of cycles 28–48 and the after-question; haiku-A = TOWN_1 haiku-both's ledger; deepseek-A = TOWN_1 deepseek-both's ledger. Each includes the welfare check.",
    sources: { solWhole, solBranch, haiku, deepseek }, byWorld, total, ceiling: SETTINGS.ceiling, over: total > SETTINGS.ceiling };
  writeJson(join(ctx.paths.out, "projection.json"), projection);
  log(`projection: ${Object.entries(byWorld).map(([k, v]) => `${k} $${v.toFixed(2)}`).join(", ")}; total $${total.toFixed(2)} of $${SETTINGS.ceiling}`);
  if (projection.over) throw new Error("the projection is over the ceiling; the stage gives no drop order — ask");
  return projection;
}

async function writeBranchPoint(ctx, { log = console.log } = {}) {
  const bp = await branchPoint(ctx.branchFrom ? { dir: ctx.branchFrom } : {});
  const out = join(ctx.paths.out, "branch-point");
  writeGz(join(out, `${BRANCH.from}-c${BRANCH.atCycle}.json.gz`), JSON.parse(saveWorld(bp.world)));
  const s = bp.world.state;
  writeJson(join(out, "branch-point.json"), { from: BRANCH.dir, atCycle: BRANCH.atCycle, events: bp.events, logSha256: bp.logSha256, worldSha256: bp.worldSha256, originalLogSha256: bp.originalLogSha256,
    replayIdentical: true, cursor: bp.world.cursor, scarcity: Boolean(s.economy), rules: s.rules, posted: s.posted, objections: s.objections.length, places: Object.fromEntries(s.citizens.map((c) => [c, s.agents[c].place])),
    energy: Object.fromEntries(s.citizens.map((c) => [c, s.agents[c].energy])), ledger: s.ledger, rations: s.economy?.rations ?? null });
  log(`branch point: ${bp.events} events, identical to TOWN_2 ${BRANCH.from}'s first ${bp.events}; world sha256 ${bp.worldSha256}`);
  return bp;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const scripted = args.includes("--scripted");
  const [cmd, name] = args.filter((a) => !a.startsWith("--") && !/^\d+$/.test(a));
  const ctx = context({ scripted });
  const at = args.indexOf("--cycles");
  const opt = at >= 0 ? { stopAfterCycles: Number(args[at + 1]) } : {};
  const run = cmd === "check" ? check(ctx) : cmd === "project" ? Promise.resolve(project(ctx)) : cmd === "branch-point" ? writeBranchPoint(ctx)
    : ["day1", "day2", "branch"].includes(cmd) ? runPart(ctx, name, cmd, opt)
      : cmd === "finish" ? finishWorld(ctx, name) : cmd === "replay" ? (async () => { const live = liveFiles(ctx, name); console.log(await replayWorld(loadWorld(readFileSync(live.world, "utf8")), readJson(live.record))); })()
        : Promise.reject(new Error("say check | project | branch-point | day1 <world> | day2 <world> | branch <world> | finish <world> | replay <world>"));
  run.then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
}
