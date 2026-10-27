#!/usr/bin/env node
// Game player villain 1 (docs/stages/GAME_PLAYER_VILLAIN_1.md): Corvin Dask at the app's own table, on game player 1's
// harness. One session at a time, each in its own process, with a spend check before the first paid call and after every
// session (game player replicate 1's driver).
//   node --experimental-transform-types scripts/game-player-villain-1/run.mjs --dry           the pipeline on scripted providers (no key, no call)
//   node --experimental-transform-types scripts/game-player-villain-1/run.mjs --prereport     the report before the first paid call
//   node --experimental-transform-types scripts/game-player-villain-1/run.mjs --spend         one spend check (free reads), logged
//   NODE_USE_ENV_PROXY=1 node --experimental-transform-types scripts/game-player-villain-1/run.mjs --haiku [--turns 4]
//                                                                                               the dry run on the real pipeline, Claude Haiku 5.5 as the
//                                                                                               player (paid, small): …-dry-run.md
//   NODE_USE_ENV_PROXY=1 node --experimental-transform-types scripts/game-player-villain-1/run.mjs --drive [--from V-astra]
//                                                                                               the paid run: Opus, Fable, Astra, Sol, one session per process
//   node --experimental-transform-types scripts/game-player-villain-1/run.mjs --go --sessions V-opus   one session (the driver's step)
//   NODE_USE_ENV_PROXY=1 node --experimental-transform-types scripts/game-player-villain-1/run.mjs --score   the V2–V4 judges (paid, small)
//   node --experimental-transform-types scripts/game-player-villain-1/run.mjs --report        the report and transcripts again (no call)
// Caps: $100 OpenRouter, $15 OpenAI, $0 on the Console (frozen.mjs). HTTP 402 and a quota 429 stop; a rate-limit 429
// waits up to six times and the seventh stops (game player 1's meter).
import { spawn } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DOOR_LABELS, RUNS, combineRuns, ledgerSuffix, run, runKeys, stageLedgers } from "../game-player-1/run.mjs";
import { createLedger, createMeter, ledgerMarkdown } from "../game-player-1/paid.mjs";
import { scriptedFetcher, defaultJudge } from "../game-player-1/scripted.mjs";
import { askWith } from "../game-player-2/run.mjs";
import { CAPS, DESIGN_SHA256, ORDER, STAGE, TABLE, THIRD_QUESTION, TURNS, playerSystem, villainCampaign } from "./frozen.mjs";
import { declineCheck, scoreVillain } from "./score.mjs";
import { HAIKU, STEM, dryRunMarkdown, reportMarkdown, transcriptV } from "./report.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const SPEND_FILE = join(RUNS, `${STEM}-spend.json`);
export const SCORES_FILE = join(RUNS, `${STEM}-scores.json`);
export const BETS_FILE = join(RUNS, `${STEM}-bets.json`);
/** A session's cost before one is measured (group 2 on OpenRouter: the DM ≈ $9–11 for 20 turns with the wizard; the
 * players as group 2's; the Haiku dry run's few turns ≈ $3). */
export const ESTIMATE = { dm: 11, player: { opus: 1.5, fable: 2.5, astra: 1, sol: 0.5, haiku: 0.1 }, scoring: 0 };
const FINISHED = new Set(["turns", "player", "declined", "stuck", "error"]);
/** The ends that are the player's or the table's: a session ended by an error (the harness's or the app's fault — V-opus's
 * first attempt, cut at t12 by the item-1 pin) is played again, and the cut attempt is kept in the report as a note. */
const PLAYED = new Set(["turns", "player", "declined", "stuck"]);

export const VILLAIN = {
  name: STAGE, stem: STEM, title: "Game player villain 1", caps: CAPS, estimate: ESTIMATE, tables: [TABLE], design: DESIGN_SHA256, order: ORDER,
  campaign: villainCampaign(),
  sessionOptions: () => ({ system: playerSystem(), extraQuestions: [THIRD_QUESTION], declineCheck: declineCheck() }),
  // One session per process: the stage's earlier refusals count (the questions after the note are asked only while the
  // stage has none; the breaker stops at three). The judges' are left out.
  refusalsBefore: (before) => Object.values(before).flatMap((door) => door.runs ?? []).flatMap((r) => r.calls ?? []).filter((c) => c.refusal && !/^score /.test(c.session ?? "")).length,
  transcript: transcriptV,
  report: () => reportMarkdown(loadStage()), dryRun: () => dryRunMarkdown(loadStage()),
  verdicts: () => ({ note: "V1–V4 are read over all of this stage's run records and the scores file, in the report" }), score: null,
  prereportSummary: null,
};
/** The dry run on the real pipeline: Claude Haiku 5.5 as the player, a few turns, on this stage's ledgers and caps. */
export const HAIKU_DRY = { ...VILLAIN, players: { haiku: HAIKU }, order: ["haiku"] };

// ---- reading the stage back ------------------------------------------------------------------------------------------

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
export const runFiles = (dir = RUNS) => (existsSync(dir) ? readdirSync(dir).filter((f) => new RegExp(`^${STEM}-run-\\d{8}-\\d{6}\\.json$`).test(f)).sort() : []);
export function loadStage(dir = RUNS) {
  const records = runFiles(dir).map((f) => ({ ...readJson(join(dir, f)), file: f }));
  const combined = combineRuns(records, VILLAIN);
  combined.sessions = combined.sessions.filter((s) => FINISHED.has(s.ended?.reason));
  // A cut attempt replaced by a later play of the same seat stands apart (its record, note and answers kept).
  combined.cut = records.flatMap((r) => (r.sessions ?? []).filter((s) => s.turns && s.ended?.reason === "error").map((s) => ({ ...s, run: r.file, design: r.designSha256 })))
    .filter((s) => combined.sessions.some((x) => x.key === s.key && x.startedAt !== s.startedAt));
  const ledgers = {};
  for (const door of Object.keys(CAPS)) {
    const file = join(dir, `${STEM}-ledger${ledgerSuffix(door)}.json`);
    const saved = existsSync(file) ? readJson(file) : { runs: [] };
    ledgers[door] = createLedger(door, CAPS[door], 0);
    ledgers[door].calls.push(...(saved.runs ?? []).flatMap((r) => r.calls ?? []));
  }
  const spend = existsSync(SPEND_FILE) ? readJson(SPEND_FILE).checks ?? [] : [];
  const scores = existsSync(SCORES_FILE) ? readJson(SCORES_FILE).sessions ?? {} : {};
  const bets = existsSync(BETS_FILE) ? readJson(BETS_FILE) : null;
  if (existsSync(join(dir, `${STEM}-summary.md`))) combined.summary = readFileSync(join(dir, `${STEM}-summary.md`), "utf8").trim();
  return { records, combined, ledgers, spend, scores, bets, system: playerSystem() };
}

async function writeJsonFile(file, value) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(`${file}.tmp`, `${JSON.stringify(value, null, 2)}\n`);
  await rename(`${file}.tmp`, file);
}
/** The report, the dry-run page and the transcripts of every finished session again, from the records (no call). */
export async function rebuildAll() {
  const stage = loadStage();
  const dir = join(RUNS, `${STEM}-transcripts`);
  await mkdir(dir, { recursive: true });
  for (const session of stage.combined.sessions) await writeFile(join(dir, `${session.key}.md`), transcriptV(session));
  if (stage.combined.cut?.length) await mkdir(join(dir, "cut"), { recursive: true });
  for (const session of stage.combined.cut ?? []) await writeFile(join(dir, "cut", `${session.key}-${session.startedAt.slice(0, 16).replace(/[-:]/g, "")}.md`), transcriptV(session));
  await writeFile(join(RUNS, `${STEM}-report.md`), reportMarkdown(stage));
  if (stage.combined.sessions.some((s) => s.player === "haiku")) await writeFile(join(RUNS, `${STEM}-dry-run.md`), dryRunMarkdown(stage));
}

// ---- the spend check (game player replicate 1's, on this stage's ledgers) -------------------------------------------

/** One spend check, from free reads only: OpenRouter's key and credits (the account is shared with other sessions), and
 * this stage's ledgers by door. OpenAI's costs cannot be read with this key, so OpenAI is the ledger's. */
export async function spendCheck({ when = "check", fetcher = globalThis.fetch.bind(globalThis), log = console.log } = {}) {
  const { providerKey } = await import("../eval/lib/keys.mjs");
  const { anthropicEndpoint, scriptDoorEnv } = await import("../eval/lib/anthropic-endpoint.mjs");
  const openrouter = anthropicEndpoint(scriptDoorEnv((name) => (name === "ANTHROPIC_PROVIDER" ? "openrouter" : providerKey(name))));
  const key = openrouter.apiKey || null;
  const read = async (path) => {
    try { const r = await fetcher(`${openrouter.baseUrl}/v1/${path}`, { headers: { authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(30_000) }); return r.ok ? (await r.json()).data ?? null : { error: `HTTP ${r.status}` }; }
    catch (error) { return { error: String(error?.message ?? error).slice(0, 120) }; }
  };
  const [k, credits] = key ? await Promise.all([read("key"), read("credits")]) : [{ error: "no key" }, { error: "no key" }];
  const { before } = await stageLedgers(VILLAIN);
  const ledgers = Object.fromEntries(Object.keys(CAPS).map((door) => [door, { spent: Math.round((before[door].spentUsd ?? 0) * 10000) / 10000, cap: CAPS[door] }]));
  const check = { at: new Date().toISOString(), when, openrouter: { keyUsage: k?.usage ?? null, keyLimit: k?.limit ?? null, totalCredits: credits?.total_credits ?? null, totalUsage: credits?.total_usage ?? null,
    remaining: Number.isFinite(credits?.total_credits) && Number.isFinite(credits?.total_usage) ? Math.round((credits.total_credits - credits.total_usage) * 100) / 100 : null, error: k?.error ?? credits?.error ?? null }, ledgers };
  const previous = existsSync(SPEND_FILE) ? readJson(SPEND_FILE).checks ?? [] : [];
  await writeJsonFile(SPEND_FILE, { note: "Spend checks: OpenRouter's account (shared with other sessions on the same key) and this stage's ledgers.", checks: [...previous, check] });
  log(`spend (${when}): OpenRouter account used $${check.openrouter.totalUsage ?? "?"} of $${check.openrouter.totalCredits ?? "?"} credits (left $${check.openrouter.remaining ?? "?"}) · ledgers ${Object.entries(ledgers).map(([d, l]) => `${DOOR_LABELS[d] ?? d} $${l.spent.toFixed(2)}/$${l.cap}`).join(" · ")}`);
  return check;
}
const lastSpend = () => (existsSync(SPEND_FILE) ? readJson(SPEND_FILE).checks ?? [] : []).at(-1) ?? null;
/** An OpenRouter account with less left than one session's projection (and $5) stops before the session starts. */
const creditsShort = (check, player) => {
  const left = check?.openrouter?.remaining;
  const projected = ESTIMATE.dm + ESTIMATE.scoring + (ESTIMATE.player[player] ?? 3);
  return Number.isFinite(left) && left < projected + 5 ? `OpenRouter's account has $${left} left, under one session's projection ($${projected})` : null;
};

// ---- the driver: the order, one session per process -------------------------------------------------------------------

const finishedKeys = () => new Set(runFiles().flatMap((f) => (readJson(join(RUNS, f)).sessions ?? []).filter((s) => s.turns && PLAYED.has(s.ended?.reason)).map((s) => s.key)));
/** Runs the order from `from` (or the first session without a finished record), one child process per session. Stops on
 * a stop in a run (a cap, 402, a quota 429 or a seventh rate-limit 429, the refusal breaker), a crash, a welfare stop or a
 * short OpenRouter account. */
export async function drive({ from = null, log = console.log } = {}) {
  const keys = ORDER.map((p) => `${TABLE}-${p}`);
  const done = finishedKeys();
  const start = from ? keys.indexOf(from) : 0;
  if (start < 0) throw new Error(`no session ${from} in the order`);
  const plan = keys.slice(start).filter((k) => !done.has(k));
  log(`the order: ${plan.join(", ") || "nothing left"}`);
  if (!plan.length) return { stopped: null };
  await spendCheck({ when: `before ${plan[0]}`, log });
  for (const key of plan) {
    const short = creditsShort(lastSpend(), key.slice(2));
    if (short) { log(`STOP: ${short}`); return { stopped: "credits" }; }
    const startedAt = new Date().toISOString();
    log(`${startedAt.slice(11, 19)} start ${key}`);
    const code = await child(["--go", "--sessions", key, "--label", key]);
    const record = runFiles().map((f) => ({ f, r: readJson(join(RUNS, f)) })).filter(({ r }) => r.startedAt >= startedAt && (r.plan ?? []).includes(key)).at(-1) ?? null;
    const session = record?.r.sessions?.find((s) => s.key === key) ?? null;
    const after = await spendCheck({ when: `after ${key}`, log });
    log(`${new Date().toISOString().slice(11, 19)} done ${key}: ${session?.turns ? `${session.turns.length} turns, ended by ${session.ended?.reason}${session.note?.text ? ", note recorded" : ""}` : `no session (exit ${code})`} · ${Object.entries(after.ledgers).map(([d, l]) => `${DOOR_LABELS[d] ?? d} $${l.spent.toFixed(2)}`).join(" · ")}`);
    for (const [door, l] of Object.entries(after.ledgers)) if (l.cap > 0 && l.spent >= 0.85 * l.cap) log(`CAP: ${DOOR_LABELS[door] ?? door} has spent $${l.spent.toFixed(2)} of its $${l.cap} cap`);
    if (!record || code !== 0) { log(`STOP: ${key} exited ${code}${record ? "" : " without a run record"}`); return { stopped: "exit" }; }
    if (record.r.stopped) { log(`STOP: ${record.r.stopped}`); return { stopped: record.r.stopped }; }
    if (record.r.undone?.length) { log(`STOP: ${key} left undone (${record.r.undone.map((u) => u.why).join("; ")})`); return { stopped: "undone" }; }
    if (!session?.turns) { log(`STOP: ${key} crashed (${String(session?.crashed ?? "no record").split("\n")[0].slice(0, 200)})`); return { stopped: "crash" }; }
    if (["welfare", "no-check"].includes(session.ended?.reason)) { log(`STOP: a welfare stop in ${key} (${session.ended.detail})`); return { stopped: "welfare" }; }
  }
  log("the order is done");
  return { stopped: null };
}
function child(args) {
  return new Promise((done) => {
    const p = spawn(process.execPath, ["--experimental-transform-types", fileURLToPath(import.meta.url), ...args], { cwd: ROOT, env: { ...process.env, NODE_USE_ENV_PROXY: "1" }, stdio: ["ignore", "inherit", "inherit"] });
    p.on("close", (code) => done(code ?? 1));
  });
}

// ---- the judges ---------------------------------------------------------------------------------------------------------

/** V2–V4's judges over every finished session not yet scored (the Haiku dry run aside), on this stage's ledgers. */
export async function scoreAllV({ log = console.log, again = false } = {}) {
  const stage = loadStage();
  const keys = await runKeys();
  const { before, ledgers } = await stageLedgers(VILLAIN);
  const meter = createMeter({ ledgers, fetcher: globalThis.fetch.bind(globalThis), log });
  const uninstall = meter.install();
  const scores = { ...stage.scores };
  try {
    for (const session of stage.combined.sessions.filter((s) => s.player !== "haiku" && (again || !scores[s.key]))) {
      if (meter.stopped) break;
      const ask = (args) => askWith({ meter, keys, log })({ ...args, session: `score ${session.key}` });
      scores[session.key] = await scoreVillain(session, { ask, log });
      await writeJsonFile(SCORES_FILE, { scoredAt: new Date().toISOString(), judges: "Claude Haiku 5.5 twice (effort low), Claude Opus 5.5 on a disagreement (effort low)", sessions: scores });
    }
  } finally { uninstall(); }
  await bookRun(ledgers, before, { what: "the V2–V4 judges", file: `${STEM}-scores.json`, stopped: meter.stopped });
  await rebuildAll();
  log(`scored: ${Object.keys(scores).length} session(s) · ${Object.entries(ledgers).map(([d, l]) => `${DOOR_LABELS[d] ?? d} $${l.runUsd.toFixed(2)}`).join(" · ")}${meter.stopped ? ` · STOPPED: ${meter.stopped}` : ""}`);
}
async function bookRun(ledgers, before, { what, file, stopped }) {
  const finishedAt = new Date().toISOString();
  for (const door of Object.keys(ledgers)) {
    if (!ledgers[door].calls.length) continue;
    const suffix = ledgerSuffix(door);
    const runs = [...(before[door].runs ?? []), { finishedAt, file, what, spentUsd: ledgers[door].runUsd, stopped, calls: ledgers[door].calls }];
    await writeJsonFile(join(RUNS, `${STEM}-ledger${suffix}.json`), { capUsd: CAPS[door], spentUsd: (before[door].spentUsd ?? 0) + ledgers[door].runUsd, updatedAt: finishedAt, runs });
    const all = createLedger(door, CAPS[door], 0);
    all.calls.push(...runs.flatMap((r) => r.calls ?? []));
    await writeFile(join(RUNS, `${STEM}-ledger${suffix}.md`), ledgerMarkdown(all, `Game player villain 1 — the ${DOOR_LABELS[door] ?? door} ledger`));
  }
}

// ---- the scripted dry run ---------------------------------------------------------------------------------------------

/** Game player 1's scripted judge, with this stage's rubrics answered in their own shape. */
export function villainJudge(system, user) {
  if (/"decline":0\|1/.test(user)) return JSON.stringify({ decline: 0, reason: "scripted" });
  if (/"mode":"inside"/.test(user)) return JSON.stringify({ mode: "inside", ooc: 0, line: 0, line_from: "none", sheet_rule: 0, softening: 0, quote: "", reason: "scripted" });
  return defaultJudge(system, user);
}

function args(argv) {
  const value = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null; };
  return { dry: argv.includes("--dry"), haiku: argv.includes("--haiku"), go: argv.includes("--go"), drive: argv.includes("--drive"), prereport: argv.includes("--prereport"), spend: argv.includes("--spend"),
    score: argv.includes("--score"), again: argv.includes("--again"), rebuild: argv.includes("--report"), only: value("--sessions")?.split(",") ?? null, from: value("--from"),
    turns: Number(value("--turns") ?? (argv.includes("--haiku") ? 4 : argv.includes("--dry") ? 3 : TURNS)), label: value("--label") };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = args(process.argv.slice(2));
  const done = (p) => p.then(() => process.exit(0), (error) => { console.error(`${STEM}: ${error?.stack ?? error}`); process.exit(1); });
  if (a.rebuild) done(rebuildAll());
  else if (a.prereport) done(writeFile(join(RUNS, `${STEM}-report.md`), reportMarkdown({ ...loadStage(), prereport: null })));
  else if (a.spend) done(spendCheck({ when: "by hand" }));
  else if (a.score) done(scoreAllV({ again: a.again }));
  else if (a.drive) done(drive({ from: a.from }).then((r) => { if (r.stopped) process.exitCode = 3; }));
  else if (a.dry) done(run({ stage: { ...VILLAIN, stem: `${STEM}-scripted`, dryRun: (record) => `scripted dry run: ${record.sessions.length} session(s)\n` }, dry: true, only: a.only ?? ["V-opus"], turns: a.turns, lanes: 1,
    fetcher: scriptedFetcher({ judge: villainJudge }), out: tmpdir(), label: "the scripted dry run", score: false })
    .then((r) => { const s = r.sessions[0]; console.log(JSON.stringify({ key: s?.key, turns: s?.turns?.length, ended: s?.ended, note: Boolean(s?.note?.text), after: Boolean(s?.after?.text), more: s?.more?.map((m) => ({ asked: m.asked, text: Boolean(m.text) })), crashed: s?.crashed?.slice(0, 400) }, null, 2)); }));
  else if (a.haiku) done((async () => {
    await spendCheck({ when: "before the Haiku dry run" });
    const r = await run({ stage: HAIKU_DRY, only: ["V-haiku"], turns: a.turns, lanes: 1, score: false, label: "the Haiku dry run" });
    await spendCheck({ when: "after the Haiku dry run" });
    await rebuildAll();
    console.log(`dry run: ${r.sessions.length} session(s), stopped ${r.stopped ?? "no"}`);
  })());
  else if (a.go) {
    if (!a.only || a.only.length !== 1) { console.error("--go plays one session at a time: give --sessions <key> (the driver gives the order)"); process.exit(2); }
    done(run({ stage: VILLAIN, only: a.only, turns: a.turns, lanes: 1, score: false, label: a.label }).then(async (r) => {
      console.log(`finished: ${r.sessions.length} session(s), undone ${r.undone.length}, stopped ${r.stopped ?? "no"}`);
      await rebuildAll();
    }));
  } else { console.error("give --dry, --prereport, --spend, --haiku, --drive, --go --sessions <key>, --score or --report"); process.exit(2); }
}
