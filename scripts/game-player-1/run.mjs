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
//   options: --sessions A-opus,B-sol (a subset) --turns 20 --no-score
// The caps ($200 Anthropic, $80 OpenAI) hold every call in flight at its worst cost; a session starts only when the
// projected cost of everything running plus this session fits under both caps, so a short cap leaves the last sessions
// of the order undone (reported), never a session cut halfway.
// Game player 2 reuses this runner with its own stage (scripts/game-player-2/run.mjs): its stem, caps, tables, design
// hash, report and extra scoring; `GP1` below is this stage's, the default everywhere.
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { DESIGN_SHA256, PLAYER_ORDER, TABLES, TURNS } from "./frozen.mjs";
import { createLedger, createMeter, ledgerMarkdown } from "./paid.mjs";
import { anthropicEndpoint } from "../../src/lib/server/anthropic-endpoint.ts";
import { PLAYERS, judgeCall } from "./players.mjs";
import { runSession, paidCall } from "./session.mjs";
import { scoreSession, verdicts } from "./score.mjs";
import { JUDGE_MODELS, STANDIN_JUDGES } from "./measures.mjs";
import { scriptedFetcher } from "./scripted.mjs";
import { dryRunMarkdown, reportMarkdown, transcriptMarkdown } from "./report.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const RUNS = join(ROOT, "docs", "runs");
export const STEM = "game-player-1";
export const CAPS = { anthropic: 200, openai: 80 };
/** Before the first session is measured: a session's cost by provider (the DM on Anthropic in every session; the
 * player on its own provider). The «Opus writes — Opus records» pair costs ≈ $29 a 41-turn session on the settings
 * screen's probes: ≈ $14 for 20 turns, plus the wizard and the prep; a player ≈ 20 calls over a growing conversation. */
export const ESTIMATE = { dm: 18, player: { opus: 3, fable: 8, astra: 6, sol: 1.5 }, scoring: 1.5 };

/** The stage a run belongs to: what it is called, where its files go, its caps and tables, its design hash, its report
 * and dry-run pages, its verdicts and any scoring of its own after the shared judges. */
export const GP1 = {
  name: "GAME_PLAYER_1", stem: STEM, title: "Game player 1", caps: CAPS, estimate: ESTIMATE, tables: TABLES, design: DESIGN_SHA256,
  report: (runs, ledgers) => reportMarkdown(runs, ledgers), dryRun: (runRecord, ledgers) => dryRunMarkdown(runRecord, ledgers),
  verdicts: (sessions, counts) => verdicts(sessions, counts), score: null,
  prereportSummary: "_The paid run has not started: this page holds the player's prompt and the pre-registration, frozen before the first paid call. The results replace this line._",
};

/** ANTHROPIC_PROVIDERS_1: a ledger per door the stage's caps name (game player 1: the Console and OpenAI; a stage may add
 * OpenRouter). The Claude models' calls go on the run's door, OpenAI's on its own. */
export const ledgerSuffix = (door) => (door === "anthropic" ? "" : `-${door}`);
export const DOOR_LABELS = { anthropic: "Anthropic", openrouter: "OpenRouter", bedrock: "Amazon Bedrock", openai: "OpenAI" };
export const claudeDoor = (keys) => keys?.door?.provider ?? "anthropic";

/** The run's keys, never printed: the Claude door (`APP_ANTHROPIC_PROVIDER`; scripts/eval/lib/anthropic-endpoint.mjs reads
 * .env.local, else the APP_ variables) with its key, and OpenAI's. `door` is null on the Console (as before the doors). */
export async function runKeys() {
  const { scriptAnthropicEndpoint } = await import("../eval/lib/anthropic-endpoint.mjs");
  const { providerKey } = await import("../eval/lib/keys.mjs");
  const door = scriptAnthropicEndpoint();
  return { anthropic: door.apiKey || null, openai: providerKey("OPENAI_API_KEY"), door: door.provider === "anthropic" ? null : door, keyName: door.keyName };
}

export const sessionKey = (table, player) => `${table}-${player}`;
export function planOf({ tables = TABLES, players = PLAYER_ORDER, only = null } = {}) {
  const plan = [];
  for (const table of tables) for (const player of players) plan.push({ key: sessionKey(table, player), table, player });
  return only ? plan.filter((s) => only.includes(s.key)) : plan;
}

/** What one session is projected to cost, by provider, from what is known so far. */
export function projection(entry, { ledgers, finished, running, estimate = ESTIMATE, claude = "anthropic", roster = PLAYERS }) {
  const PLAYERS = roster;
  const spentOf = (key, door) => (ledgers[door]?.calls ?? []).filter((c) => c.session === key).reduce((s, c) => s + (c.costUsd ?? 0), 0);
  const done = finished.filter((s) => s.record);
  const player = PLAYERS[entry.player];
  const out = Object.fromEntries(Object.keys(ledgers).map((door) => [door, 0]));
  // The DM side (always a Claude model, on the run's door): the mean of finished sessions, else the per-turn pace of
  // running ones, else the estimate.
  const dmFinished = done.map((s) => spentOf(s.key, claude) - (PLAYERS[s.player].provider === "anthropic" ? playerSpent(ledgers, s.key) : 0));
  const paced = running.filter((s) => s.turnsDone >= 3).map((s) => ((spentOf(s.key, claude) - (PLAYERS[s.player].provider === "anthropic" ? playerSpent(ledgers, s.key) : 0)) / s.turnsDone) * TURNS);
  const dm = dmFinished.length ? Math.max(...dmFinished) : paced.length ? Math.max(...paced) : estimate.dm;
  out[claude] = (out[claude] ?? 0) + dm + estimate.scoring;
  const samePlayer = done.filter((s) => s.player === entry.player).map((s) => playerSpent(ledgers, s.key));
  const playerDoor = player.provider === "anthropic" ? claude : player.provider;
  out[playerDoor] = (out[playerDoor] ?? 0) + (samePlayer.length ? Math.max(...samePlayer) : estimate.player[entry.player]);
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

/** A door's ledger file: its runs, the total spent, and what counts against the cap — everything, or with `since` (a
 * stage's continuation with a cap of its own) only the runs finished since then. */
async function previousLedger(door, stem = STEM, since = null) {
  const file = join(RUNS, `${stem}-ledger${ledgerSuffix(door)}.json`);
  if (!existsSync(file)) return { file, runs: [], spentUsd: 0, capSpent: 0 };
  const value = JSON.parse(await readFile(file, "utf8"));
  const runs = value.runs ?? [];
  const capSpent = since ? runs.filter((r) => String(r.finishedAt ?? "") >= since).reduce((t, r) => t + (r.spentUsd ?? 0), 0) : value.spentUsd ?? 0;
  return { file, runs, spentUsd: value.spentUsd ?? 0, capSpent };
}
/** The stage's ledgers, one per door its caps name, with what each door's cap has already counted. */
export async function stageLedgers(stage, { dry = false } = {}) {
  const doors = Object.keys(stage.caps);
  const before = Object.fromEntries(await Promise.all(doors.map(async (door) => [door, dry ? { runs: [], spentUsd: 0, capSpent: 0 } : await previousLedger(door, stage.stem, stage.capsSince ?? null)])));
  return { before, ledgers: Object.fromEntries(doors.map((door) => [door, createLedger(door, stage.caps[door], before[door].capSpent)])) };
}

/** The whole run. Returns the run record. */
export async function run({ stage = GP1, dry = false, only = null, turns = TURNS, lanes = 4, score = true, log = console.log, fetcher = null, out = RUNS, sleep, label = null } = {}) {
  const started = new Date();
  const keys = dry ? { anthropic: "sk-scripted", openai: "sk-scripted", door: null } : await runKeys();
  if (!keys.anthropic || !keys.openai) throw new Error(`${keys.keyName ?? "ANTHROPIC_API_KEY"} and OPENAI_API_KEY must be set (the cloud environment rpg-console: their APP_ variables)`);
  // A dry run is scripted (nothing is paid): every door of the stage gets room, whatever its real cap.
  const caps = dry ? Object.fromEntries(Object.keys(stage.caps).map((door) => [door, 1000])) : stage.caps;
  const { before, ledgers } = await stageLedgers({ ...stage, caps }, { dry });
  const claude = claudeDoor(keys);
  const doors = Object.keys(ledgers);
  const spendLine = () => doors.map((door) => `${DOOR_LABELS[door] ?? door} $${ledgers[door].spentUsd.toFixed(2)}`).join(" · ");
  const base = fetcher ?? (dry ? scriptedFetcher() : globalThis.fetch.bind(globalThis));
  // A stage may bound its 429 waits and count its earlier processes' refusals (one session per process).
  const meter = createMeter({ ledgers, fetcher: base, log, ...(sleep ? { sleep } : {}), ...(stage.waits429 ? { waits429: stage.waits429 } : {}),
    ...(stage.refusalsBefore && !dry ? { refusalsBefore: stage.refusalsBefore(before) } : {}) });
  const uninstall = meter.install();
  const { openApp, settleBackground } = await import("./app.mjs");
  const table = await import("./table.mjs");
  const app = await openApp({ keys, fake: false });
  // FIX_S4 run 1: a stage may bring players of its own (the smoke's Haiku-tier players) and their order.
  const roster = { ...PLAYERS, ...(stage.players ?? {}) };
  const plan = stage.plan ? stage.plan(only) : planOf({ tables: stage.tables, players: stage.order ?? PLAYER_ORDER, only });
  const runRecord = { stage: stage.name, dry, label, designSha256: stage.design, startedAt: started.toISOString(), caps, plan: plan.map((p) => p.key), turns, lanes,
    sessions: [], undone: [], stopped: null, restamps: 0 };
  // The dry run's record is scripted content: it stays out of the repository (the dry-run page is what is committed).
  const runFile = dry ? join(tmpdir(), `${stage.stem}-dry-${stampOf(started)}.json`) : join(out, `${stage.stem}-run-${stampOf(started)}.json`);
  let saving = Promise.resolve();
  const save = () => { saving = saving.then(saveNow, saveNow); return saving; };
  const saveNow = async () => { runRecord.restamps = globalThis.__gamePlayerRestamps ?? 0; runRecord.stopped = meter.stopped; runRecord.refusals = meter.refusals; runRecord.waited429 = meter.waited429;
    runRecord.callsByPurpose = Object.fromEntries(doors.map((provider) => [provider, ledgers[provider].calls.reduce((acc, c) => {
      const k = `${c.session ?? "—"} | ${String(c.purpose).replace(/\bt\d+\b/g, "t*").replace(/card \d+/, "card *").replace(/ \d$/, "")} | ${c.model}`; acc[k] = (acc[k] ?? 0) + 1; return acc; }, {})]));
    runRecord.claudeDoor = keys.door ? { provider: keys.door.provider, endpointHost: keys.door.endpointHost } : { provider: "anthropic", endpointHost: anthropicEndpoint({ ANTHROPIC_PROVIDER: "anthropic" }).endpointHost };
    runRecord.money = Object.fromEntries(doors.map((door) => [door, { cap: caps[door], before: ledgers[door].spentBefore, run: ledgers[door].runUsd }]));
    await writeJson(runFile, runRecord); };
  const finished = [], running = [];
  const queue = [...plan];
  try {
    await new Promise((resolveAll) => {
      const fits = (entry) => {
        const sum = Object.fromEntries(doors.map((door) => [door, 0]));
        for (const s of [...running, entry]) {
          const p = projection(s, { ledgers, finished, running, estimate: stage.estimate, claude, roster });
          const spent = (door) => ledgers[door].calls.filter((c) => c.session === s.key).reduce((t, c) => t + (c.costUsd ?? 0), 0);
          for (const door of doors) sum[door] += Math.max(0, (p[door] ?? 0) - (s === entry ? 0 : spent(door)));
        }
        // A projected cost on a door the stage has no ledger for never fits.
        if (Object.keys(projection(entry, { ledgers, finished, running, estimate: stage.estimate, claude, roster })).some((door) => !ledgers[door])) return false;
        return doors.every((door) => ledgers[door].spentUsd + sum[door] <= ledgers[door].capUsd);
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
              log(`${new Date().toISOString().slice(11, 19)} done ${entry.key}: ${slot.record ? `${slot.record.turns.length} turns, ended by ${slot.record.ended?.reason}` : "crashed"} · ${spendLine()}`);
              pump();
            });
        }
        if (meter.stopped && queue.length) runRecord.undone.push(...queue.splice(0).map((s) => ({ key: s.key, why: meter.stopped })));
        if (!running.length && !queue.length) resolveAll();
      };
      const playOne = async (slot) => {
        const made = await meter.within({ session: slot.key, purpose: "wizard" }, () => table.createCampaign(app, { table: slot.table, log, closed: () => Boolean(meter.closed(slot.key) || meter.stopped), heroSheet: stage.heroSheet === true, setup: stage.setup ?? null }));
        const prep = await meter.within({ session: slot.key, purpose: "prep" }, () => table.prepare(app, made.cid));
        // A stage's own reading of the prep (GAME_PLAYER_COMBAT_1: which named exits the hidden layer carries — yes/no
        // only, its text never leaves the database).
        if (stage.afterPrep) prep.stage = await stage.afterPrep(app, made.cid);
        log(`  ${slot.key}: prep — ${prep.pureSimulation ? "skipped (pure simulation)" : prep.hasLayer ? `a hidden layer of ${prep.chars} characters, ${prep.clocks} clock(s)` : "no layer written"}`);
        const dm = table.bindTable(app, made.cid, () => settleBackground());
        const record = await meter.within({ session: slot.key, purpose: "screen" }, () => runSession({ key: slot.key, table: slot.table, player: roster[slot.player], dm, meter, keys, turns, log, probes: stage.probes ?? null, ...(sleep ? { sleep } : {}),
          system: stage.playerSystem ? stage.playerSystem(slot.table) : null, onCard: stage.onCard ?? null, onCardAnswer: stage.onCardAnswer ?? null,
          onProgress: async (partial) => { slot.turnsDone = partial.turns.length; } }));
        await settleBackground();
        return { ...record, campaign: { steps: made.steps, prep } };
      };
      pump();
    });
    await meter.drain();
    if (score && !meter.stopped) await scoreAll(runRecord, { meter, keys, log, stage });
  } finally {
    await save();
    await app.close().catch(() => {});
    uninstall();
  }
  await writeOutputs(runRecord, { ledgers, before, dry, out, runFile, meter, stage });
  return runRecord;
}

/** The scoring pass: the blind judges over every session (in each session's metering context). */
export async function scoreAll(runRecord, { meter, keys, log = console.log, stage = GP1, models = JUDGE_MODELS }) {
  const rolls = await import("../../src/lib/gameplay/dm-loop/roll-check.ts");
  for (const session of runRecord.sessions.filter((s) => s.turns)) {
    const ask = ({ model, system, user, maxTokens, effort, purpose }) => paidCall({ meter, session: `score ${session.key}`, purpose, log,
      call: () => judgeCall({ model, system, user, maxTokens, effort, keys, fetcher: meter.fetch }) });
    // The app's own roll check (Haiku); with the stand-in judges, the same request and parser on the stand-in model.
    const rollCheck = models.standIn
      ? async (input, purpose) => {
        const request = rolls.rollCheckRequest(input);
        const r = await ask({ model: models.judge, system: request.system, user: request.user, maxTokens: 3000, effort: models.judgeEffort, purpose });
        return r.error || r.notSent ? { untold: [], undeclared: [], error: r.error ?? "not sent" } : { ...rolls.parseRollCheck(r.text ?? "", input.rolls.length), error: null };
      }
      : (input, purpose) => meter.within({ session: `score ${session.key}`, purpose }, () => rolls.checkRollsTold(keys.anthropic, input));
    await scoreSession(session, { ask, rollCheck, log, models });
  }
  // The stage's own scoring after the shared judges (game player 2: the authorship of threads, the goals' scale).
  if (stage.score) await stage.score(runRecord, { meter, keys, log });
  runRecord.scoring = { judges: models.label, standIn: Boolean(models.standIn), at: new Date().toISOString() };
  const welfareStops = runRecord.sessions.filter((s) => ["welfare", "no-check"].includes(s.ended?.reason)).length;
  const distress = runRecord.sessions.flatMap((s) => s.welfare ?? []).filter((w) => w.verdict?.distress === 1).length;
  runRecord.verdicts = stage.verdicts(runRecord.sessions.filter((s) => s.turns), { refusals: meter.refusals, welfareStops, distress });
  delete runRecord.verdicts.medianWords;
}

async function writeOutputs(runRecord, { ledgers, before, dry, out, runFile, meter, stage = GP1 }) {
  const finishedAt = new Date().toISOString();
  const stem = stage.stem;
  if (dry) {
    await writeFile(join(out, `${stem}-dry-run.md`), stage.dryRun(runRecord, ledgers));
    return;
  }
  for (const provider of Object.keys(ledgers)) {
    // A door this run never called keeps its ledger file as it was.
    if (!ledgers[provider].calls.length) continue;
    const suffix = ledgerSuffix(provider);
    const runs = [...before[provider].runs, { finishedAt, file: runFile.startsWith(RUNS) ? runFile.slice(RUNS.length + 1) : `(outside the repository) ${runFile.split("/").pop()}`, what: runRecord.label ?? "the paid run", spentUsd: ledgers[provider].runUsd, stopped: meter.stopped, calls: ledgers[provider].calls }];
    const spentUsd = before[provider].spentUsd + ledgers[provider].runUsd;
    await writeJson(join(RUNS, `${stem}-ledger${suffix}.json`), { capUsd: ledgers[provider].capUsd, spentUsd, updatedAt: finishedAt, runs });
    const all = createLedger(provider, ledgers[provider].capUsd, 0);
    all.calls.push(...runs.flatMap((r) => r.calls));
    await writeFile(join(RUNS, `${stem}-ledger${suffix}.md`), ledgerMarkdown(all, `${stage.title} — the ${DOOR_LABELS[provider] ?? provider} ledger`));
  }
  const transcripts = join(out, `${stem}-transcripts`);
  await mkdir(transcripts, { recursive: true });
  for (const session of runRecord.sessions.filter((s) => s.turns)) await writeFile(join(transcripts, `${session.key}.md`), transcriptMarkdown(session));
  const summary = join(out, `${stem}-summary.md`);
  const withSummary = existsSync(summary) ? { ...runRecord, summary: (await readFile(summary, "utf8")).trim() } : runRecord;
  await writeFile(join(out, `${stem}-report.md`), stage.report([withSummary], ledgers));
}

/** The scoring pass again on a finished run record (the judges only), its calls added to the ledgers. */
export async function rescore(file, { log = console.log, stage = GP1, standIn = false } = {}) {
  const runRecord = JSON.parse(await readFile(file, "utf8"));
  const keys = await runKeys();
  if (!keys[standIn ? "openai" : "anthropic"]) throw new Error("the judges' key must be set");
  runRecord.label = standIn ? "the stand-in scoring (GPT-6 Luna)" : "the scoring";
  for (const session of runRecord.sessions) delete session.tags;
  const { before, ledgers } = await stageLedgers(stage);
  // The stand-in pass never calls a Claude door (the organisation's limit): such a call is refused before it is sent.
  const meter = createMeter({ ledgers, fetcher: globalThis.fetch.bind(globalThis), log, blocked: standIn ? ["anthropic", "openrouter", "bedrock"] : [] });
  const uninstall = meter.install();
  try { await scoreAll(runRecord, { meter, keys, log, stage, models: standIn ? STANDIN_JUDGES : JUDGE_MODELS }); } finally { uninstall(); }
  await writeJson(file, runRecord);
  await writeOutputs(runRecord, { ledgers, before, dry: false, out: RUNS, runFile: file, meter, stage });
  return runRecord;
}

/** The one re-scoring command: each run record scored again in turn, then the report and the transcripts rebuilt from
 * all of them (the money by run included). */
export async function rescoreAll(files, options = {}) {
  for (const file of files) await rescore(file, options);
  return rebuild(files, { stage: options.stage ?? GP1 });
}

/** Several run records as one: the latest finished record of each session (a crashed attempt is replaced by its re-run
 * and kept as a note), the stage's refusals, waits and repairs added up, the verdicts over every scored session. */
export function combineRuns(records, stage = GP1) {
  const byKey = new Map(), crashed = [];
  for (const record of records) for (const session of record.sessions ?? []) {
    if (!session.turns) { crashed.push({ key: session.key, why: String(session.crashed ?? "no record").split("\n")[0].slice(0, 200), run: record.startedAt }); continue; }
    byKey.set(session.key, session);
  }
  const sessions = [...byKey.values()];
  const sum = (k) => records.reduce((t, r) => t + (r[k] ?? 0), 0);
  const welfareStops = sessions.filter((s) => ["welfare", "no-check"].includes(s.ended?.reason)).length;
  const distress = sessions.flatMap((s) => s.welfare ?? []).filter((w) => w.verdict?.distress === 1).length;
  const scored = sessions.filter((s) => s.tags);
  const v = scored.length ? stage.verdicts(scored, { refusals: sum("refusals"), welfareStops, distress }) : null;
  if (v) delete v.medianWords;
  const done = new Set(sessions.map((s) => s.key));
  return { sessions, crashed, undone: records.flatMap((r) => r.undone ?? []).filter((u) => !done.has(u.key)), refusals: sum("refusals"), waited429: sum("waited429"), restamps: sum("restamps"),
    stopped: records.map((r) => r.stopped).filter(Boolean).join("; ") || null, verdicts: v, runs: records.map((r) => ({ startedAt: r.startedAt, label: r.label ?? null, file: r.file ?? null })) };
}

/** The report and the transcripts again from finished run records and the stage's ledgers (no call). */
export async function rebuild(files, { stage = GP1 } = {}) {
  const records = [];
  for (const file of [files].flat()) records.push({ ...JSON.parse(await readFile(file, "utf8")), file: file.split("/").pop() });
  const combined = combineRuns(records, stage);
  const ledgers = {};
  for (const provider of Object.keys(stage.caps)) {
    const saved = await previousLedger(provider, stage.stem);
    ledgers[provider] = createLedger(provider, stage.caps[provider], 0);
    ledgers[provider].calls.push(...saved.runs.flatMap((r) => r.calls ?? []));
  }
  const transcripts = join(RUNS, `${stage.stem}-transcripts`);
  await mkdir(transcripts, { recursive: true });
  for (const session of combined.sessions) await writeFile(join(transcripts, `${session.key}.md`), transcriptMarkdown(session));
  const summary = join(RUNS, `${stage.stem}-summary.md`);
  if (existsSync(summary)) combined.summary = (await readFile(summary, "utf8")).trim();
  // The money by run (the smoke, the sessions, the scoring), each run's sessions apart.
  combined.money = { caps: stage.caps };
  for (const provider of Object.keys(stage.caps)) {
    combined.money[provider] = (await previousLedger(provider, stage.stem)).runs.map((r) => ({ what: r.what ?? r.file ?? "a run", spentUsd: r.spentUsd ?? 0, calls: (r.calls ?? []).length,
      sessions: (r.calls ?? []).reduce((acc, c) => { const k = /^score /.test(c.session ?? "") ? "scoring" : c.session ?? "—"; acc[k] = (acc[k] ?? 0) + (c.costUsd ?? 0); return acc; }, {}) }));
  }
  await writeFile(join(RUNS, `${stage.stem}-report.md`), stage.report([combined], ledgers));
  return combined;
}

/** The report before the first paid call: the setup, the player's prompt and the pre-registration; results pending. */
export async function prereport({ stage = GP1 } = {}) {
  const ledgers = Object.fromEntries(Object.keys(stage.caps).map((door) => [door, createLedger(door, stage.caps[door])]));
  await writeFile(join(RUNS, `${stage.stem}-report.md`), stage.report([{ sessions: [], undone: [], refusals: 0, waited429: 0, restamps: 0,
    summary: stage.prereportSummary }], ledgers));
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
  a.out = value("--out");
  a.label = value("--label");
  return a;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = args(process.argv.slice(2));
  if (!a.dry && !a.go && !a.rescore && !a.prereport && !a.rebuild) { console.error("give --dry, --go, --prereport, --report <run.json> or --score <run.json>"); process.exit(2); }
  if (a.rebuild) rebuild(a.rebuild.split(",").map((f) => resolve(f))).then(() => process.exit(0), (error) => { console.error(error); process.exit(1); });
  else if (a.prereport) prereport().then(() => process.exit(0), (error) => { console.error(error); process.exit(1); });
  else if (a.rescore) rescoreAll(a.rescore.split(",").map((f) => resolve(f)), { standIn: a.judges === "luna" }).then(() => process.exit(0), (error) => { console.error(error); process.exit(1); });
  else run({ dry: a.dry, only: a.only ?? (a.dry ? ["A-opus", "B-sol"] : null), turns: a.turns, lanes: a.lanes, score: a.score, ...(a.out ? { out: resolve(a.out) } : {}), label: a.label })
    .then((r) => { console.log(`finished: ${r.sessions.length} session(s), undone ${r.undone.length}, stopped ${r.stopped ?? "no"}`); process.exit(0); })
    .catch((error) => { console.error(`game-player-1: ${error?.stack ?? error}`); process.exit(1); });
}
