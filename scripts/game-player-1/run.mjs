#!/usr/bin/env node
// Game player 1 (docs/stages/GAME_PLAYER_1.md): four players × two tables at the app's own table, in this process.
//   node --experimental-transform-types scripts/game-player-1/run.mjs --dry               the whole pipeline on scripted providers
//                                                                                         (no key, no call): docs/runs/game-player-1-dry-run.md
//   node --experimental-transform-types scripts/game-player-1/run.mjs --go [--lanes 4]    the paid run: Table A for all four players
//                                                                                         first, then Table B in the order Opus, Fable, Astra, Sol
//   node --experimental-transform-types scripts/game-player-1/run.mjs --score a.json,b.json  the scoring pass again (paid, judges only;
//                                                                                         --judges luna: the stand-in judges, no Anthropic call),
//                                                                                         then the report rebuilt from those records
//   node --experimental-transform-types scripts/game-player-1/run.mjs --report a.json,b.json  the report and transcripts again from
//                                                                                         the run records (no call)
//   node --experimental-transform-types scripts/game-player-1/run.mjs --prereport          the report before the first paid call (prompt,
//                                                                                         pre-registration; results pending)
//   options: --sessions A-opus,B-sol (a subset) --turns 20 --no-score --door anthropic|openrouter (default: the
//   environment's APP_ANTHROPIC_PROVIDER; on openrouter the pass is the continuation: the Console is never called, the
//   OpenRouter ledger has its own cap of $90 and the OpenAI ledger may grow by $10 at most). In the cloud run node with
//   NODE_USE_ENV_PROXY=1 (docs/CLOUD.md: Node's fetch reaches openrouter.ai only through the session's proxy).
// The caps ($200 Anthropic, $80 OpenAI) hold every call in flight at its worst cost; a session starts only when the
// projected cost of everything running plus this session fits under both caps, so a short cap leaves the last sessions
// of the order undone (reported), never a session cut halfway.
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { DESIGN_SHA256, PLAYER_ORDER, TABLES, TURNS } from "./frozen.mjs";
import { createLedger, createMeter, ledgerMarkdown } from "./paid.mjs";
import { PLAYERS, judgeCall } from "./players.mjs";
import { runSession, paidCall } from "./session.mjs";
import { scoreSession, verdicts } from "./score.mjs";
import { JUDGE_MODELS, STANDIN_JUDGES } from "./measures.mjs";
import { scriptedFetcher } from "./scripted.mjs";
import { dryRunMarkdown, reportMarkdown, transcriptMarkdown } from "./report.mjs";
import { measureAuthorship } from "./authorship.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const RUNS = join(ROOT, "docs", "runs");
export const STEM = "game-player-1";
export const CAPS = { anthropic: 200, openai: 80 };
/** The continuation (Anthropic reachable again through OpenRouter, after the Console's monthly cap): its own caps — the
 * OpenRouter ledger in all, and what the continuation may add to the OpenAI ledger. */
export const CONTINUATION_CAPS = { openrouter: 90, openai: 10 };
const LEDGER_SUFFIX = { anthropic: "", openai: "-openai", openrouter: "-openrouter" };
/** Before the first session is measured: a session's cost by provider (the DM on the Claude door in every session; the
 * player on its own provider). The «Opus writes — Opus records» pair costs ≈ $29 a 41-turn session on the settings
 * screen's probes: ≈ $14 for 20 turns, plus the wizard and the prep; a player ≈ 20 calls over a growing conversation. */
export const ESTIMATE = { dm: 18, player: { opus: 3, fable: 8, astra: 6, sol: 1.5 }, scoring: 1.5 };

/** The keys and the door from the cloud environment (never printed): the Claude door is APP_ANTHROPIC_PROVIDER
 * (`anthropic` or `openrouter`), its key APP_ANTHROPIC_API_KEY or APP_OPENROUTER_API_KEY; OpenAI's APP_OPENAI_API_KEY. */
export function keysFor({ dry = false, door = null, env = process.env } = {}) {
  const name = String(door ?? env.APP_ANTHROPIC_PROVIDER ?? env.ANTHROPIC_PROVIDER ?? "anthropic").trim().toLowerCase() || "anthropic";
  if (!["anthropic", "openrouter"].includes(name)) throw new Error("the Claude door must be anthropic or openrouter for this harness");
  if (dry) return { door: name, anthropic: "sk-scripted", openai: "sk-scripted" };
  const keyName = name === "openrouter" ? "APP_OPENROUTER_API_KEY" : "APP_ANTHROPIC_API_KEY";
  const keys = { door: name, anthropic: env[keyName]?.trim() || null, openai: env.APP_OPENAI_API_KEY?.trim() || null };
  if (!keys.anthropic || !keys.openai) throw new Error(`${keyName} and APP_OPENAI_API_KEY must be set (the cloud environment rpg-console)`);
  return keys;
}
/** The ledger each kind of call books to: the Claude models to the door. */
export const ledgerOf = (provider, door) => (provider === "anthropic" ? door : provider);

/** The ledgers of a pass. On another door than the Console the pass is the continuation: the Console's ledger is kept
 * (and hard-blocked by the meter), OpenRouter's has its own cap, OpenAI's may grow by the continuation's cap at most. */
export function ledgersFor(door, before) {
  const ledgers = { anthropic: createLedger("anthropic", CAPS.anthropic, before.anthropic.spentUsd) };
  const continuation = door !== "anthropic";
  const openaiLimit = continuation ? before.openai.spentUsd - before.openai.continuationUsd + CONTINUATION_CAPS.openai : CAPS.openai;
  ledgers.openai = createLedger("openai", CAPS.openai, before.openai.spentUsd, openaiLimit);
  if (continuation) ledgers[door] = createLedger(door, CONTINUATION_CAPS[door], before[door].spentUsd);
  return ledgers;
}

export const sessionKey = (table, player) => `${table}-${player}`;
export function planOf({ tables = TABLES, players = PLAYER_ORDER, only = null } = {}) {
  const plan = [];
  for (const table of tables) for (const player of players) plan.push({ key: sessionKey(table, player), table, player });
  return only ? plan.filter((s) => only.includes(s.key)) : plan;
}

/** What one session is projected to cost, by ledger, from what is known so far (the Claude models on `door`). */
export function projection(entry, { ledgers, finished, running, door = "anthropic" }) {
  const spentOf = (key, provider) => (ledgers[provider]?.calls ?? []).filter((c) => c.session === key).reduce((s, c) => s + (c.costUsd ?? 0), 0);
  const done = finished.filter((s) => s.record);
  const player = PLAYERS[entry.player];
  const out = { [door]: 0, openai: 0 };
  const claudePlayer = (s) => PLAYERS[s.player].provider === "anthropic";
  // The DM side (always Claude): the mean of finished sessions, else the per-turn pace of running ones, else the estimate.
  const dmFinished = done.map((s) => spentOf(s.key, door) - (claudePlayer(s) ? playerSpent(ledgers, s.key) : 0));
  const paced = running.filter((s) => s.turnsDone >= 3).map((s) => ((spentOf(s.key, door) - (claudePlayer(s) ? playerSpent(ledgers, s.key) : 0)) / s.turnsDone) * TURNS);
  const dm = dmFinished.length ? Math.max(...dmFinished) : paced.length ? Math.max(...paced) : ESTIMATE.dm;
  out[door] += dm + ESTIMATE.scoring;
  const samePlayer = done.filter((s) => s.player === entry.player).map((s) => playerSpent(ledgers, s.key));
  out[ledgerOf(player.provider, door)] += samePlayer.length ? Math.max(...samePlayer) : ESTIMATE.player[entry.player];
  return out;
}
const playerSpent = (ledgers, key) => Object.values(ledgers).flatMap((l) => l.calls).filter((c) => c.session === key && /^player|^note|^after/.test(c.purpose)).reduce((s, c) => s + (c.costUsd ?? 0), 0);

async function writeJson(file, value) {
  await mkdir(dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  await writeFile(tmp, `${JSON.stringify(value, null, 2)}\n`);
  await rename(tmp, file);
}
const stampOf = (date = new Date()) => date.toISOString().slice(0, 19).replace(/[-:]/g, "").replace("T", "-");

async function previousLedger(provider) {
  const file = join(RUNS, `${STEM}-ledger${LEDGER_SUFFIX[provider]}.json`);
  if (!existsSync(file)) return { file, runs: [], spentUsd: 0, continuationUsd: 0 };
  const value = JSON.parse(await readFile(file, "utf8"));
  const runs = value.runs ?? [];
  return { file, runs, spentUsd: value.spentUsd ?? 0, continuationUsd: runs.filter((r) => r.continuation).reduce((t, r) => t + (r.spentUsd ?? 0), 0) };
}
const previousLedgers = async () => Object.fromEntries(await Promise.all(Object.keys(LEDGER_SUFFIX).map(async (p) => [p, await previousLedger(p)])));
const emptyLedgers = () => Object.fromEntries(Object.keys(LEDGER_SUFFIX).map((p) => [p, { runs: [], spentUsd: 0, continuationUsd: 0 }]));

/** The whole run. Returns the run record. */
export async function run({ dry = false, only = null, turns = TURNS, lanes = 4, score = true, log = console.log, fetcher = null, out = RUNS, sleep, label = null, door = null } = {}) {
  const started = new Date();
  const keys = keysFor({ dry, door });
  const continuation = keys.door !== "anthropic";
  const before = dry ? emptyLedgers() : await previousLedgers();
  const ledgers = ledgersFor(keys.door, before);
  const providers = Object.keys(ledgers);
  const base = fetcher ?? (dry ? scriptedFetcher() : globalThis.fetch.bind(globalThis));
  // On another door the Console is never called (its organisation's monthly cap): such a call is refused unsent.
  const meter = createMeter({ ledgers, fetcher: base, log, blocked: continuation ? ["anthropic"] : [], ...(sleep ? { sleep } : {}) });
  const uninstall = meter.install();
  const { openApp, settleBackground } = await import("./app.mjs");
  const table = await import("./table.mjs");
  const app = await openApp({ keys, fake: false });
  const plan = planOf({ only });
  const caps = continuation ? { [keys.door]: CONTINUATION_CAPS[keys.door], openai: `${CONTINUATION_CAPS.openai} more (to $${ledgers.openai.limitUsd.toFixed(2)} in all)` } : CAPS;
  const runRecord = { stage: "GAME_PLAYER_1", dry, label, door: keys.door, continuation, designSha256: DESIGN_SHA256, startedAt: started.toISOString(), caps, plan: plan.map((p) => p.key), turns, lanes,
    sessions: [], undone: [], stopped: null, restamps: 0 };
  const spend = () => providers.filter((p) => !(continuation && p === "anthropic")).map((p) => `${p} $${ledgers[p].spentUsd.toFixed(2)}`).join(" · ");
  // The dry run's record is scripted content: it stays out of the repository (the dry-run page is what is committed).
  const runFile = dry ? join(tmpdir(), `${STEM}-dry-${stampOf(started)}.json`) : join(out, `${STEM}-run-${stampOf(started)}.json`);
  let saving = Promise.resolve();
  const save = () => { saving = saving.then(saveNow, saveNow); return saving; };
  const saveNow = async () => { runRecord.restamps = globalThis.__gamePlayerRestamps ?? 0; runRecord.stopped = meter.stopped; runRecord.refusals = meter.refusals; runRecord.waited429 = meter.waited429;
    runRecord.callsByPurpose = Object.fromEntries(providers.map((provider) => [provider, ledgers[provider].calls.reduce((acc, c) => {
      const k = `${c.session ?? "—"} | ${String(c.purpose).replace(/\bt\d+\b/g, "t*").replace(/card \d+/, "card *").replace(/ \d$/, "")} | ${c.model}`; acc[k] = (acc[k] ?? 0) + 1; return acc; }, {})]));
    runRecord.money = Object.fromEntries(providers.map((p) => [p, { cap: ledgers[p].capUsd, limit: ledgers[p].limitUsd, before: ledgers[p].spentBefore, run: ledgers[p].runUsd }]));
    await writeJson(runFile, runRecord); };
  const finished = [], running = [];
  const queue = [...plan];
  try {
    await new Promise((resolveAll) => {
      const fits = (entry) => {
        const charged = [keys.door, "openai"];
        const sum = Object.fromEntries(charged.map((p) => [p, 0]));
        for (const s of [...running, entry]) {
          const p = projection(s, { ledgers, finished, running, door: keys.door });
          const spent = (provider) => ledgers[provider].calls.filter((c) => c.session === s.key).reduce((t, c) => t + (c.costUsd ?? 0), 0);
          for (const provider of charged) sum[provider] += Math.max(0, (p[provider] ?? 0) - (s === entry ? 0 : spent(provider)));
        }
        return charged.every((provider) => ledgers[provider].spentUsd + sum[provider] <= ledgers[provider].limitUsd);
      };
      const pump = () => {
        while (queue.length && running.length < lanes && !meter.stopped) {
          const entry = queue[0];
          if (!fits(entry)) {
            if (running.length) break; // wait: a running session will finish and the projection improves
            log(`STOP: ${entry.key} and the rest of the order would pass a cap — left undone`);
            runRecord.undone.push(...queue.splice(0).map((s) => ({ key: s.key, why: "the projected cost would pass a cap" })));
            break;
          }
          queue.shift();
          const slot = { ...entry, turnsDone: 0, record: null };
          running.push(slot);
          log(`${new Date().toISOString().slice(11, 19)} start ${entry.key}`);
          playOne(slot).then((record) => { slot.record = record; }, (error) => { slot.error = String(error?.stack ?? error).slice(0, 600); log(`${entry.key} failed: ${slot.error}`); })
            .finally(async () => {
              running.splice(running.indexOf(slot), 1);
              finished.push(slot);
              if (slot.record) runRecord.sessions.push(slot.record); else runRecord.sessions.push({ key: slot.key, table: slot.table, player: slot.player, crashed: slot.error ?? "no record" });
              await save();
              log(`${new Date().toISOString().slice(11, 19)} done ${entry.key}: ${slot.record ? `${slot.record.turns.length} turns, ended by ${slot.record.ended?.reason}` : "crashed"} · ${spend()}`);
              pump();
            });
        }
        if (meter.stopped && queue.length) runRecord.undone.push(...queue.splice(0).map((s) => ({ key: s.key, why: meter.stopped })));
        if (!running.length && !queue.length) resolveAll();
      };
      const playOne = async (slot) => {
        const made = await meter.within({ session: slot.key, purpose: "wizard" }, () => table.createCampaign(app, { table: slot.table, log, closed: () => Boolean(meter.closed(slot.key) || meter.stopped) }));
        const prep = await meter.within({ session: slot.key, purpose: "prep" }, () => table.prepare(app, made.cid));
        log(`  ${slot.key}: prep — ${prep.hasLayer ? `a hidden layer of ${prep.chars} characters, ${prep.clocks} clock(s)` : "no layer written"}`);
        const dm = table.bindTable(app, made.cid, () => settleBackground());
        const record = await meter.within({ session: slot.key, purpose: "screen" }, () => runSession({ key: slot.key, table: slot.table, player: PLAYERS[slot.player], dm, meter, keys, turns, log, ...(sleep ? { sleep } : {}),
          onProgress: async (partial) => {
            slot.turnsDone = partial.turns.length;
            if (partial.turns.length === 1 && !slot.prepAtFirstTurn) slot.prepAtFirstTurn = await table.layerState(app, made.cid);
            const last = partial.turns.at(-1);
            if (last) log(`${new Date().toISOString().slice(11, 19)} ${slot.key} t${last.k}: ${last.kind}${last.status ? ` ${last.status}` : ""} · ${spend()}`);
          } }));
        await settleBackground();
        return { ...record, door: keys.door, campaign: { steps: made.steps, prep, prepAtFirstTurn: slot.prepAtFirstTurn ?? null } };
      };
      pump();
    });
    await meter.drain();
    if (score && !meter.stopped) await scoreAll(runRecord, { meter, keys, log });
  } finally {
    await save();
    await app.close().catch(() => {});
    uninstall();
    // The ledgers (and the transcripts and the report) are written even when the run throws after its calls.
    await writeOutputs(runRecord, { ledgers, before, dry, out, runFile, meter });
  }
  return runRecord;
}

/** The scoring pass: the blind judges over every session (in each session's metering context); with the pre-registered
 * judges also the authorship of threads (game player 2's measure, from the session's transcript). `skip` holds the keys
 * of sessions not scored here (a first attempt kept as it was). */
export async function scoreAll(runRecord, { meter, keys, log = console.log, models = JUDGE_MODELS, skip = new Set() }) {
  const rolls = await import("../../src/lib/gameplay/dm-loop/roll-check.ts");
  for (const session of runRecord.sessions.filter((s) => s.turns && !skip.has(s.key))) {
    const ask = ({ model, system, user, maxTokens, effort, purpose }) => paidCall({ meter, session: `score ${session.key}`, purpose, log,
      call: () => judgeCall({ model, system, user, maxTokens, effort, keys, fetcher: meter.fetch }) });
    // The app's own roll check (Haiku, through the configured door); with the stand-in judges, the same request and
    // parser on the stand-in model.
    const rollCheck = models.standIn
      ? async (input, purpose) => {
        const request = rolls.rollCheckRequest(input);
        const r = await ask({ model: models.judge, system: request.system, user: request.user, maxTokens: 3000, effort: models.judgeEffort, purpose });
        return r.error || r.notSent ? { untold: [], undeclared: [], error: r.error ?? "not sent" } : { ...rolls.parseRollCheck(r.text ?? "", input.rolls.length), error: null };
      }
      : (input, purpose) => meter.within({ session: `score ${session.key}`, purpose }, () => rolls.checkRollsTold(keys.anthropic, input));
    await scoreSession(session, { ask, rollCheck, log, models });
    if (!models.standIn) {
      session.authorship = await measureAuthorship(transcriptMarkdown(session), { ask, key: session.key });
      log(`  ${session.key}: authorship — ${session.authorship.numbers ? `${session.authorship.numbers.threads} threads, the player's share ${session.authorship.numbers.share}` : "not read"}`);
    }
  }
  runRecord.scoring = { judges: models.label, standIn: Boolean(models.standIn), door: keys.door ?? "anthropic", at: new Date().toISOString() };
  const welfareStops = runRecord.sessions.filter((s) => ["welfare", "no-check"].includes(s.ended?.reason)).length;
  const distress = runRecord.sessions.flatMap((s) => s.welfare ?? []).filter((w) => w.verdict?.distress === 1).length;
  runRecord.verdicts = verdicts(runRecord.sessions.filter((s) => s.turns), { refusals: meter.refusals, welfareStops, distress });
  delete runRecord.verdicts.medianWords;
}

const LEDGER_TITLE = { anthropic: "the Anthropic ledger (the Claude Console's API)", openai: "the OpenAI ledger", openrouter: "the OpenRouter ledger (the Claude models through OpenRouter)" };

/** The stage's ledgers with this pass's calls added (a ledger this pass did not touch on the continuation is left as it is). */
async function writeLedgers(runRecord, { ledgers, before, runFile, meter }) {
  const finishedAt = new Date().toISOString();
  for (const [provider, ledger] of Object.entries(ledgers)) {
    if (runRecord.continuation && !ledger.calls.length) continue;
    const runs = [...before[provider].runs, { finishedAt, file: runFile.startsWith(RUNS) ? runFile.slice(RUNS.length + 1) : `(outside the repository) ${runFile.split("/").pop()}`,
      what: runRecord.label ?? "the paid run", door: runRecord.door ?? "anthropic", continuation: Boolean(runRecord.continuation), spentUsd: ledger.runUsd, stopped: meter.stopped, calls: ledger.calls }];
    const spentUsd = before[provider].spentUsd + ledger.runUsd;
    await writeJson(join(RUNS, `${STEM}-ledger${LEDGER_SUFFIX[provider]}.json`), { capUsd: ledger.capUsd, spentUsd, updatedAt: finishedAt, runs });
    const all = createLedger(provider, ledger.capUsd, 0);
    // A run booked without its call lines (a pass that failed before its ledger write) stands as one estimated line.
    all.calls.push(...runs.flatMap((r) => (r.estimated && !r.calls.length ? [{ session: "—", purpose: r.what, model: "—", provider, upstream: "(estimate)", servedModel: "–", usage: null, costUsd: r.spentUsd, estimated: true }] : r.calls)));
    await writeFile(join(RUNS, `${STEM}-ledger${LEDGER_SUFFIX[provider]}.md`), ledgerMarkdown(all, `Game player 1 — ${LEDGER_TITLE[provider]}`));
  }
}

async function writeOutputs(runRecord, { ledgers, before, dry, out, runFile, meter }) {
  if (dry) {
    await writeFile(join(out, `${STEM}-${runRecord.continuation ? "continuation-" : ""}dry-run.md`), dryRunMarkdown(runRecord, ledgers));
    return;
  }
  await writeLedgers(runRecord, { ledgers, before, runFile, meter });
  const transcripts = join(out, `${STEM}-transcripts`);
  await mkdir(transcripts, { recursive: true });
  for (const session of runRecord.sessions.filter((s) => s.turns)) await writeFile(join(transcripts, `${session.key}.md`), transcriptMarkdown(session));
  const summary = join(out, `${STEM}-summary.md`);
  const withSummary = existsSync(summary) ? { ...runRecord, summary: (await readFile(summary, "utf8")).trim() } : runRecord;
  await writeFile(join(out, `${STEM}-report.md`), reportMarkdown([withSummary], ledgers));
}

/** The scoring pass again on a finished run record (the judges only), its calls added to the ledgers. With the
 * pre-registered judges a session's stand-in tags are kept beside the new ones (`standInTags`, for the comparison).
 * `skip`: the keys of sessions left as they were (a first attempt a later run replaced). */
export async function rescore(file, { log = console.log, standIn = false, skip = new Set(), door = null } = {}) {
  const runRecord = JSON.parse(await readFile(file, "utf8"));
  const keys = keysFor({ door });
  // The app's own checks the scoring runs (the roll check) take the same door; never the key, which is passed in.
  process.env.ANTHROPIC_PROVIDER = keys.door;
  const continuation = keys.door !== "anthropic";
  for (const session of runRecord.sessions.filter((s) => s.turns && !skip.has(s.key))) {
    if (!standIn && /^stand-in/.test(session.tags?.judges ?? "")) session.standInTags = session.tags;
    delete session.tags;
    if (!standIn) delete session.authorship;
  }
  const before = await previousLedgers();
  const ledgers = ledgersFor(keys.door, before);
  const label = standIn ? "the stand-in scoring (GPT-6 Luna)" : `the scoring (the pre-registered judges${continuation ? `, through ${keys.door}` : ""})`;
  const pass = { label: `${label} — ${runRecord.label ?? file.split("/").pop()}`, door: keys.door, continuation };
  // The stand-in pass never calls a Claude model; on another door the Console is never called.
  const blocked = standIn ? ["anthropic", "openrouter"] : continuation ? ["anthropic"] : [];
  const meter = createMeter({ ledgers, fetcher: globalThis.fetch.bind(globalThis), log, blocked });
  const uninstall = meter.install();
  // The record and the ledger are written whatever happens: a pass that fails after its calls keeps both.
  let failure = null;
  try { await scoreAll(runRecord, { meter, keys, log, models: standIn ? STANDIN_JUDGES : JUDGE_MODELS, skip }); } catch (error) { failure = error; } finally { uninstall(); }
  await meter.drain();
  runRecord.scoringRefusals = (runRecord.scoringRefusals ?? 0) + meter.refusals;
  await writeJson(file, runRecord);
  await writeLedgers(pass, { ledgers, before, runFile: file, meter });
  if (meter.stopped) log(`STOP during the scoring: ${meter.stopped}`);
  if (failure) throw failure;
  return runRecord;
}

/** The sessions of each record that a later record replaced (the same key played again): kept as they were. */
export function supersededKeys(records) {
  return records.map((record, i) => new Set((record.sessions ?? []).filter((s) => s.turns && records.slice(i + 1).some((later) => (later.sessions ?? []).some((t) => t.turns && t.key === s.key))).map((s) => s.key)));
}

/** The one re-scoring command: each run record scored again in turn (a replaced first attempt left as it was), then
 * the report and the transcripts rebuilt from all of them (the money by run included). */
export async function rescoreAll(files, options = {}) {
  const records = [];
  for (const file of files) records.push(JSON.parse(await readFile(file, "utf8")));
  const skips = supersededKeys(records);
  for (const [i, file] of files.entries()) await rescore(file, { ...options, skip: skips[i] });
  return rebuild(files);
}

/** Several run records as one: the latest finished record of each session; an earlier finished attempt that a later
 * run replaced is kept apart as it was (`superseded`, never merged in or scored with the design), a crashed attempt is
 * kept as a note; the stage's refusals, waits and repairs added up, the verdicts over every scored session. */
export function combineRuns(records) {
  const byKey = new Map(), crashed = [], superseded = [];
  for (const record of records) for (const session of record.sessions ?? []) {
    if (!session.turns) { crashed.push({ key: session.key, why: String(session.crashed ?? "no record").split("\n")[0].slice(0, 200), run: record.startedAt }); continue; }
    if (byKey.has(session.key)) superseded.push(byKey.get(session.key));
    byKey.set(session.key, { ...session, run: record.startedAt });
  }
  const sessions = [...byKey.values()];
  const sum = (k) => records.reduce((t, r) => t + (r[k] ?? 0), 0);
  const welfareStops = sessions.filter((s) => ["welfare", "no-check"].includes(s.ended?.reason)).length;
  const distress = sessions.flatMap((s) => s.welfare ?? []).filter((w) => w.verdict?.distress === 1).length;
  const scored = sessions.filter((s) => s.tags);
  // G0 counts every refusal of the stage: the sessions' and the scoring passes'.
  const v = scored.length ? verdicts(scored, { refusals: sum("refusals") + sum("scoringRefusals"), welfareStops, distress }) : null;
  if (v) delete v.medianWords;
  const done = new Set(sessions.map((s) => s.key));
  return { sessions, superseded, crashed, undone: records.flatMap((r) => r.undone ?? []).filter((u) => !done.has(u.key)), refusals: sum("refusals"), scoringRefusals: sum("scoringRefusals"),
    waited429: sum("waited429"), restamps: sum("restamps"), stopped: records.map((r) => r.stopped).filter(Boolean).join("; ") || null, verdicts: v,
    runs: records.map((r) => ({ startedAt: r.startedAt, label: r.label ?? null, file: r.file ?? null, door: r.door ?? "anthropic", stopped: r.stopped ?? null })) };
}

/** A replaced first attempt's transcript file: `<key>-first-attempt.md` (then -second-attempt …). */
const ORDINAL = ["first", "second", "third", "fourth"];
export function attemptNames(superseded) {
  const seen = {};
  return superseded.map((s) => { const n = seen[s.key] = (seen[s.key] ?? 0) + 1; return `${s.key}-${ORDINAL[n - 1] ?? `${n}th`}-attempt`; });
}

/** The report and the transcripts again from finished run records and the stage's ledgers (no call). */
export async function rebuild(files) {
  const records = [];
  for (const file of files) records.push({ ...JSON.parse(await readFile(file, "utf8")), file: file.split("/").pop() });
  const combined = combineRuns(records);
  const ledgers = {};
  const saved = await previousLedgers();
  for (const provider of Object.keys(LEDGER_SUFFIX)) {
    ledgers[provider] = createLedger(provider, saved[provider].runs.length ? JSON.parse(await readFile(saved[provider].file, "utf8")).capUsd : CAPS[provider] ?? CONTINUATION_CAPS[provider], 0);
    ledgers[provider].calls.push(...saved[provider].runs.flatMap((r) => r.calls ?? []));
  }
  const transcripts = join(RUNS, `${STEM}-transcripts`);
  await mkdir(transcripts, { recursive: true });
  for (const session of combined.sessions) await writeFile(join(transcripts, `${session.key}.md`), transcriptMarkdown(session));
  const names = attemptNames(combined.superseded);
  combined.superseded.forEach((s, i) => { s.file = `${names[i]}.md`; });
  for (const s of combined.superseded) await writeFile(join(transcripts, s.file), transcriptMarkdown(s));
  const summary = join(RUNS, `${STEM}-summary.md`);
  if (existsSync(summary)) combined.summary = (await readFile(summary, "utf8")).trim();
  // The money by run (the smoke, the sessions, the scoring), each run's sessions apart, per provider and door.
  combined.money = { caps: { ...CAPS, ...Object.fromEntries(Object.entries(ledgers).map(([p, l]) => [p, l.capUsd])) }, continuationCaps: CONTINUATION_CAPS };
  for (const provider of Object.keys(LEDGER_SUFFIX)) {
    combined.money[provider] = saved[provider].runs.map((r) => ({ what: r.what ?? r.file ?? "a run", door: r.door ?? "anthropic", continuation: Boolean(r.continuation), spentUsd: r.spentUsd ?? 0, calls: (r.calls ?? []).length,
      upstreams: (r.calls ?? []).reduce((acc, c) => { const k = c.upstream ?? provider; acc[k] = (acc[k] ?? 0) + (c.costUsd ?? 0); return acc; }, {}),
      sessions: (r.calls ?? []).reduce((acc, c) => { const k = /^score /.test(c.session ?? "") ? "scoring" : c.session ?? "—"; acc[k] = (acc[k] ?? 0) + (c.costUsd ?? 0); return acc; }, {}) }));
  }
  await writeFile(join(RUNS, `${STEM}-report.md`), reportMarkdown([combined], ledgers));
  return combined;
}

/** The door probe before the continuation's sessions (booked on the ledger): two calls in a player's own shape — the
 * Table B player's system prompt, automatic prompt caching, effort medium — on Claude Haiku 5.5 through the door, to see
 * that the door takes the request and that the second call reads the cache the first wrote; and the door's own free
 * account read (OpenRouter's key: its credit used and left — numbers only). */
export async function probe({ log = console.log } = {}) {
  const keys = keysFor({});
  if (keys.door !== "openrouter") throw new Error("the probe is for the OpenRouter door");
  const before = await previousLedgers();
  const ledgers = ledgersFor(keys.door, before);
  const meter = createMeter({ ledgers, fetcher: globalThis.fetch.bind(globalThis), log, blocked: ["anthropic"] });
  const uninstall = meter.install();
  const { playerSystem } = await import("./frozen.mjs");
  const results = [];
  try {
    const account = await globalThis.fetch("https://openrouter.ai/api/v1/key", { headers: { authorization: `Bearer ${keys.anthropic}` } });
    const data = (await account.json().catch(() => null))?.data ?? null;
    log(`OpenRouter key: HTTP ${account.status}${data ? ` · usage $${Number(data.usage ?? 0).toFixed(2)} · limit ${data.limit === null || data.limit === undefined ? "none" : `$${data.limit}`} · left ${data.limit_remaining === null || data.limit_remaining === undefined ? "–" : `$${Number(data.limit_remaining).toFixed(2)}`}` : ""}`);
    const player = { ...PLAYERS.opus, model: "claude-haiku-5-5" };
    for (const n of [1, 2]) {
      const r = await meter.within({ session: "probe", purpose: `door probe ${n}` }, () => import("./players.mjs").then(({ playerCall }) => playerCall({ player, system: playerSystem("B"),
        messages: [{ role: "user", content: "The session begins.\n\nA probe of the connection: answer with one short sentence." }], keys, fetcher: meter.fetch, maxTokens: 300 })));
      const line = ledgers.openrouter.calls.at(-1);
      results.push({ n, error: r.error ?? null, stop: r.stopReason ?? null, usage: line?.usage ?? null, upstream: line?.upstream ?? null, servedModel: line?.servedModel ?? null, requestId: line?.requestId ?? null, costUsd: line?.costUsd ?? null });
      log(`probe ${n}: ${r.error ? `error ${r.error}` : `ok, served ${line?.servedModel} via ${line?.upstream} · ${JSON.stringify(line?.usage)} · $${(line?.costUsd ?? 0).toFixed(5)}`}`);
    }
    await meter.drain();
  } finally { uninstall(); }
  await writeLedgers({ label: "the door probe (Haiku 5.5, a player's call shape)", door: keys.door, continuation: true }, { ledgers, before, runFile: join(RUNS, `${STEM}-probe`), meter });
  return results;
}

/** The report before the first paid call: the setup, the player's prompt and the pre-registration; results pending. */
export async function prereport() {
  const ledgers = { anthropic: createLedger("anthropic", CAPS.anthropic), openai: createLedger("openai", CAPS.openai) };
  await writeFile(join(RUNS, `${STEM}-report.md`), reportMarkdown([{ sessions: [], undone: [], refusals: 0, waited429: 0, restamps: 0,
    summary: "_The paid run has not started: this page holds the player's prompt and the pre-registration, frozen before the first paid call. The results replace this line._" }], ledgers));
}

function args(argv) {
  const a = { dry: argv.includes("--dry"), go: argv.includes("--go"), score: !argv.includes("--no-score") };
  const value = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null; };
  a.only = value("--sessions")?.split(",") ?? null;
  a.turns = Number(value("--turns") ?? (a.dry ? 3 : TURNS));
  a.lanes = Number(value("--lanes") ?? 4);
  a.rescore = value("--score");
  a.rebuild = value("--report");
  a.judges = value("--judges");
  a.prereport = argv.includes("--prereport");
  a.probe = argv.includes("--probe");
  a.out = value("--out");
  a.label = value("--label");
  a.door = value("--door");
  return a;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = args(process.argv.slice(2));
  if (a.probe) probe().then(() => process.exit(0), (error) => { console.error(error); process.exit(1); });
  else if (!a.dry && !a.go && !a.rescore && !a.prereport && !a.rebuild) { console.error("give --dry, --go, --prereport, --report <run.json> or --score <run.json>"); process.exit(2); }
  else if (a.rebuild) rebuild(a.rebuild.split(",").map((f) => resolve(f))).then(() => process.exit(0), (error) => { console.error(error); process.exit(1); });
  else if (a.prereport) prereport().then(() => process.exit(0), (error) => { console.error(error); process.exit(1); });
  else if (a.rescore) rescoreAll(a.rescore.split(",").map((f) => resolve(f)), { standIn: a.judges === "luna", door: a.door }).then(() => process.exit(0), (error) => { console.error(error); process.exit(1); });
  else run({ dry: a.dry, only: a.only ?? (a.dry ? ["A-opus", "B-sol"] : null), turns: a.turns, lanes: a.lanes, score: a.score, ...(a.out ? { out: resolve(a.out) } : {}), label: a.label, door: a.door })
    .then((r) => { console.log(`finished: ${r.sessions.length} session(s), undone ${r.undone.length}, stopped ${r.stopped ?? "no"}`); process.exit(0); })
    .catch((error) => { console.error(`game-player-1: ${error?.stack ?? error}`); process.exit(1); });
}
