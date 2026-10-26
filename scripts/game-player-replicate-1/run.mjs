#!/usr/bin/env node
// Game player replicate 1 (docs/stages/GAME_PLAYER_REPLICATE_1.md, origin/claude/handoff at 26a760f): the second group
// at Tables A, B and C on game player 1's harness and game player 2's Table C, nothing fixed; then DeepSeek V4 Pro twice
// per table. One session at a time, each in its own process, with a spend check before the first paid call and after
// every session.
//   node --experimental-transform-types scripts/game-player-replicate-1/run.mjs --dry         the pipeline on scripted providers
//                                                                                              (no key, no call): …-dry-run.md
//   node --experimental-transform-types scripts/game-player-replicate-1/run.mjs --prereport   the report before the first paid call
//   node --experimental-transform-types scripts/game-player-replicate-1/run.mjs --spend       one spend check (free reads), logged
//   node --experimental-transform-types scripts/game-player-replicate-1/run.mjs --drive [--from A-sol]
//                                                                                              the paid run: the order, one session per
//                                                                                              process, spend checks between
//   node --experimental-transform-types scripts/game-player-replicate-1/run.mjs --go --sessions A-opus   one session (paid; the driver's step)
//   node --experimental-transform-types scripts/game-player-replicate-1/run.mjs --group1-tags  the new tags on group 1's twelve (paid, judges)
//   node --experimental-transform-types scripts/game-player-replicate-1/run.mjs --report       the report and transcripts again (no call)
// Caps: $300 OpenRouter (the Claude models — DM, Opus and Fable as players, the checks and the judges — and DeepSeek),
// $25 OpenAI (Astra and Sol), $0 on the Console (a call that would reach it stops the run before it is sent). HTTP 402
// and a quota 429 stop the run; a rate-limit 429 waits as group 1's did (the amendment in frozen.mjs). Run node with
// NODE_USE_ENV_PROXY=1 in the cloud.
import { spawn } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DOOR_LABELS, RUNS, combineRuns, ledgerSuffix, run, runKeys, stageLedgers } from "../game-player-1/run.mjs";
import { createLedger, createMeter, ledgerMarkdown } from "../game-player-1/paid.mjs";
import { scriptedFetcher, defaultPlayer } from "../game-player-1/scripted.mjs";
import { transcriptMarkdown } from "../game-player-1/report.mjs";
import { askWith } from "../game-player-2/run.mjs";
import { CAPS, DESIGN_SHA256, ESTIMATE, ORDER, STAGE, TABLES, WAITS_429 } from "./frozen.mjs";
import { FINISHED, scoreAsGroup1, tagExtra } from "./score.mjs";
import { dryRunMarkdown, reportMarkdown } from "./report.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const STEM = "game-player-replicate-1";
export const GROUP1_FILE = join(RUNS, `${STEM}-group1.json`);
export const GROUP1_TAGS_FILE = join(RUNS, `${STEM}-group1-tags.json`);
export const SPEND_FILE = join(RUNS, `${STEM}-spend.json`);
/** Group 1's run records: A and B as committed on origin/claude/game-player-1, C on this branch (game player 2's third
 * attempt). The A and B sessions are copied into GROUP1_FILE once (`--group1-build`), each with the blob it came from. */
export const GROUP1_SOURCES = [
  { tables: ["A"], ref: "origin/claude/game-player-1", commit: "4c5e32ba0f3077550bf11938d2338094289bf94c", path: "docs/runs/game-player-1-run-20261025-044002.json" },
  { tables: ["B"], ref: "origin/claude/game-player-1", commit: "4c5e32ba0f3077550bf11938d2338094289bf94c", path: "docs/runs/game-player-1-run-20261025-085220.json" },
  { tables: ["C"], ref: "origin/claude/game-player-2", commit: "6158fffeb30a225045f6f15433cf0dbeb286a446", path: "docs/runs/game-player-2-run-20261025-092000.json", here: true },
];

export const REPLICATE = {
  name: STAGE, stem: STEM, title: "Game player replicate 1", caps: CAPS, estimate: ESTIMATE, tables: TABLES, design: DESIGN_SHA256, waits429: WAITS_429,
  plan: (only) => ORDER.filter((s) => !only || only.includes(s.key)).map(({ key, table, player }) => ({ key, table, player })),
  // One stage, one session per process: the refusals of the stage's earlier sessions count (the second question is asked
  // only while the stage has none; the breaker stops at three), as group 1's one process per table counted them. The
  // judges' refusals are left out: group 1 scored after all its sessions, so none of them could gate a session.
  refusalsBefore: (before) => Object.values(before).flatMap((door) => door.runs ?? []).flatMap((r) => r.calls ?? []).filter((c) => c.refusal && !/^(?:score|group1) /.test(c.session ?? "")).length,
  report: () => reportMarkdown(loadStage()), dryRun: (runRecord, ledgers) => dryRunMarkdown(runRecord, ledgers),
  verdicts: () => ({ note: "P0–P5 are read over all of this stage's run records, in the report" }),
  score: (runRecord, { meter, keys, log }) => scoreStage(runRecord, { ask: askWith({ meter, keys, log }), log }),
  prereportSummary: "_The paid run has not started: this page holds the pre-registration P0–P5 (copied from the stage before the first paid call), how each line is read, the bets and the player's prompt. The results replace this line._",
};

/** This stage's scoring after game player 1's judges: group 1's other measures, then the new tags. */
export async function scoreStage(runRecord, { ask, log = () => {} }) {
  for (const session of runRecord.sessions.filter((s) => s.turns)) {
    const asked = (args) => ask({ ...args, session: `score ${session.key}` });
    await scoreAsGroup1(session, { ask: asked });
    await tagExtra(session, { ask: asked, log });
  }
}

// ---- reading the stage back ------------------------------------------------------------------------------------------

export const runFiles = (dir = RUNS) => (existsSync(dir) ? readdirSync(dir).filter((f) => new RegExp(`^${STEM}-run-\\d{8}-\\d{6}\\.json$`).test(f)).sort() : []);
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
/** Group 1's twelve sessions, each with the new tags when they have been run. */
export function loadGroup1(dir = RUNS) {
  const tags = existsSync(join(dir, `${STEM}-group1-tags.json`)) ? readJson(join(dir, `${STEM}-group1-tags.json`)).sessions ?? {} : {};
  const sessions = [];
  const copied = existsSync(join(dir, `${STEM}-group1.json`)) ? readJson(join(dir, `${STEM}-group1.json`)) : { sessions: [] };
  sessions.push(...copied.sessions.map((s) => s.record));
  for (const source of GROUP1_SOURCES.filter((s) => s.here)) {
    const file = join(dir, source.path.split("/").pop());
    if (existsSync(file)) sessions.push(...readJson(file).sessions.filter((s) => s.turns && source.tables.includes(s.table)));
  }
  return sessions.map((s) => ({ ...s, tags: { ...(s.tags ?? {}), ...(tags[s.key] ? { replicate: tags[s.key] } : {}) } }));
}
/** Everything the report reads: this stage's run records combined, group 1, the ledgers, the spend checks, the bets. */
export function loadStage(dir = RUNS) {
  const records = runFiles(dir).map((f) => ({ ...readJson(join(dir, f)), file: f }));
  const combined = combineRuns(records, REPLICATE);
  // A cut attempt is kept in its record and listed apart; the tables, the notes and the transcripts are the finished sessions'.
  combined.sessions = combined.sessions.filter((s) => FINISHED.has(s.ended?.reason));
  const ledgers = {};
  for (const door of Object.keys(CAPS)) {
    const file = join(dir, `${STEM}-ledger${ledgerSuffix(door)}.json`);
    const saved = existsSync(file) ? readJson(file) : { runs: [] };
    ledgers[door] = createLedger(door, CAPS[door], 0);
    ledgers[door].calls.push(...(saved.runs ?? []).flatMap((r) => r.calls ?? []));
    ledgers[door].runs = (saved.runs ?? []).map((r) => ({ what: r.what, file: r.file, spentUsd: r.spentUsd ?? 0, calls: (r.calls ?? []).length, finishedAt: r.finishedAt }));
  }
  const spend = existsSync(join(dir, `${STEM}-spend.json`)) ? readJson(join(dir, `${STEM}-spend.json`)).checks ?? [] : [];
  const bets = existsSync(join(dir, `${STEM}-bets.json`)) ? readJson(join(dir, `${STEM}-bets.json`)) : null;
  // «In short», written after the run from the numbers (like game player 1's summary file).
  if (existsSync(join(dir, `${STEM}-summary.md`))) combined.summary = readFileSync(join(dir, `${STEM}-summary.md`), "utf8").trim();
  return { records, combined, group1: loadGroup1(dir), ledgers, spend, bets };
}

// ---- group 1 ---------------------------------------------------------------------------------------------------------

/** Copies group 1's A and B sessions from their committed run records (git blobs) into GROUP1_FILE. */
export async function buildGroup1({ git = gitShow } = {}) {
  const sessions = [];
  for (const source of GROUP1_SOURCES.filter((s) => !s.here)) {
    const { text, blob } = await git(source.commit, source.path);
    const record = JSON.parse(text);
    for (const s of record.sessions ?? []) if (s.turns && s.note && source.tables.includes(s.table)) sessions.push({ key: s.key, source: { ...source, blob, runStartedAt: record.startedAt, label: record.label ?? null }, record: s });
  }
  await writeJsonFile(GROUP1_FILE, { builtAt: new Date().toISOString(), note: "Group 1's Table A and B sessions, copied unchanged from the run records named in each source (the full ones: the cut first attempts of B are left out, as game player 1's report left them).", sessions });
  return sessions.length;
}
async function gitShow(commit, path) {
  const out = await new Promise((done, fail) => {
    const child = spawn("git", ["show", `${commit}:${path}`], { cwd: ROOT });
    const chunks = [];
    child.stdout.on("data", (c) => chunks.push(c));
    child.on("close", (code) => (code === 0 ? done(Buffer.concat(chunks).toString("utf8")) : fail(new Error(`git show ${commit}:${path} → ${code}`))));
  });
  const blob = await new Promise((done) => { const c = spawn("git", ["rev-parse", `${commit}:${path}`], { cwd: ROOT }); let s = ""; c.stdout.on("data", (d) => { s += d; }); c.on("close", () => done(s.trim())); });
  return { text: out, blob };
}

/** The new tags on group 1's twelve sessions (the same judges), on this stage's ledgers as one more run. */
export async function tagGroup1({ log = console.log } = {}) {
  const keys = await runKeys();
  if (!keys.anthropic) throw new Error(`${keys.keyName} must be set (its APP_ variable)`);
  const { before, ledgers } = await stageLedgers(REPLICATE);
  const meter = createMeter({ ledgers, fetcher: globalThis.fetch.bind(globalThis), log, waits429: WAITS_429 });
  const uninstall = meter.install();
  const previous = existsSync(GROUP1_TAGS_FILE) ? readJson(GROUP1_TAGS_FILE).sessions ?? {} : {};
  const out = { ...previous };
  try {
    const ask = askWith({ meter, keys, log });
    for (const session of loadGroup1()) {
      if (meter.stopped) break;
      const copy = { ...session, tags: { ...session.tags, replicate: previous[session.key] ?? {} } };
      out[session.key] = await tagExtra(copy, { ask: (args) => ask({ ...args, session: `group1 ${session.key}` }), log });
      await writeJsonFile(GROUP1_TAGS_FILE, { taggedAt: new Date().toISOString(), sessions: out });
    }
  } finally { uninstall(); }
  await bookRun(ledgers, before, { what: "group 1: the new tags (notes, made things, the Lady asked after)", file: `${STEM}-group1-tags.json`, stopped: meter.stopped });
  await writeFile(join(RUNS, `${STEM}-report.md`), reportMarkdown(loadStage()));
  log(`group 1 tagged: ${Object.keys(out).length} session(s) · ${Object.entries(ledgers).map(([d, l]) => `${DOOR_LABELS[d] ?? d} $${l.runUsd.toFixed(2)}`).join(" · ")}${meter.stopped ? ` · STOPPED: ${meter.stopped}` : ""}`);
  return out;
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
    await writeFile(join(RUNS, `${STEM}-ledger${suffix}.md`), ledgerMarkdown(all, `Game player replicate 1 — the ${DOOR_LABELS[door] ?? door} ledger`));
  }
}
async function writeJsonFile(file, value) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(`${file}.tmp`, `${JSON.stringify(value, null, 2)}\n`);
  await rename(`${file}.tmp`, file);
}

// ---- the spend check ---------------------------------------------------------------------------------------------------

/** One spend check, from free reads only: OpenRouter's key and credits (the account is shared with other sessions), and
 * this stage's ledgers by door. OpenAI's costs cannot be read with this key (no api.usage.read scope: HTTP 403 on
 * 2026-10-25), so OpenAI is the ledger's. Appended to SPEND_FILE. */
export async function spendCheck({ when = "check", fetcher = globalThis.fetch.bind(globalThis), log = console.log } = {}) {
  const { providerKey } = await import("../eval/lib/keys.mjs");
  const { anthropicEndpoint, scriptDoorEnv } = await import("../eval/lib/anthropic-endpoint.mjs");
  // OpenRouter's key and host through the door helper (the one place that names them), whatever the run's door.
  const openrouter = anthropicEndpoint(scriptDoorEnv((name) => (name === "ANTHROPIC_PROVIDER" ? "openrouter" : providerKey(name))));
  const key = openrouter.apiKey || null;
  const read = async (path) => {
    try { const r = await fetcher(`${openrouter.baseUrl}/v1/${path}`, { headers: { authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(30_000) }); return r.ok ? (await r.json()).data ?? null : { error: `HTTP ${r.status}` }; }
    catch (error) { return { error: String(error?.message ?? error).slice(0, 120) }; }
  };
  const [k, credits] = key ? await Promise.all([read("key"), read("credits")]) : [{ error: "no key" }, { error: "no key" }];
  const { before } = await stageLedgers(REPLICATE);
  const ledgers = Object.fromEntries(Object.keys(CAPS).map((door) => [door, { spent: Math.round((before[door].spentUsd ?? 0) * 10000) / 10000, cap: CAPS[door] }]));
  const check = { at: new Date().toISOString(), when, openrouter: { keyUsage: k?.usage ?? null, totalCredits: credits?.total_credits ?? null, totalUsage: credits?.total_usage ?? null,
    remaining: Number.isFinite(credits?.total_credits) && Number.isFinite(credits?.total_usage) ? Math.round((credits.total_credits - credits.total_usage) * 100) / 100 : null, error: k?.error ?? credits?.error ?? null }, ledgers };
  const previous = existsSync(SPEND_FILE) ? readJson(SPEND_FILE).checks ?? [] : [];
  await writeJsonFile(SPEND_FILE, { note: "Spend checks: OpenRouter's account (shared with other sessions on the same key) and this stage's ledgers.", checks: [...previous, check] });
  log(`spend (${when}): OpenRouter account used $${check.openrouter.totalUsage ?? "?"} of $${check.openrouter.totalCredits ?? "?"} credits (left $${check.openrouter.remaining ?? "?"}) · ledgers ${Object.entries(ledgers).map(([d, l]) => `${DOOR_LABELS[d] ?? d} $${l.spent.toFixed(2)}/$${l.cap}`).join(" · ")}`);
  return check;
}

// ---- the driver: the order, one session per process ---------------------------------------------------------------------

const finishedKeys = () => new Set(runFiles().flatMap((f) => (readJson(join(RUNS, f)).sessions ?? []).filter((s) => s.turns && FINISHED.has(s.ended?.reason)).map((s) => s.key)));
/** Runs the order from `from` (or the first session without a finished record), one session per child process. Stops on
 * a stop in a run (a cap, 402, a quota 429 or a seventh rate-limit 429, the refusal breaker), a crash, a welfare stop, or an OpenRouter account with less left
 * than one session's projection. */
export async function drive({ from = null, log = console.log, until = null } = {}) {
  const done = finishedKeys();
  const start = from ? ORDER.findIndex((s) => s.key === from) : 0;
  if (start < 0) throw new Error(`no session ${from} in the order`);
  const plan = ORDER.slice(start).filter((s) => !done.has(s.key) && (!until || ORDER.findIndex((x) => x.key === s.key) <= ORDER.findIndex((x) => x.key === until)));
  log(`the order: ${plan.map((s) => s.key).join(", ")}`);
  await spendCheck({ when: `before ${plan[0]?.key ?? "nothing"}`, log });
  for (const entry of plan) {
    const check = (await readSpend()).at(-1);
    const projected = ESTIMATE.dm + ESTIMATE.scoring + (ESTIMATE.player[entry.player] ?? 3);
    if (check?.openrouter?.remaining !== null && check?.openrouter?.remaining !== undefined && check.openrouter.remaining < projected + 5) { log(`STOP: OpenRouter's account has $${check.openrouter.remaining} left, under one session's projection`); return { stopped: "credits" }; }
    const startedAt = new Date().toISOString();
    log(`${startedAt.slice(11, 19)} start ${entry.key}`);
    const code = await child(["--go", "--sessions", entry.key, "--label", `${entry.key}`]);
    const record = runFiles().map((f) => ({ f, r: readJson(join(RUNS, f)) })).filter(({ r }) => r.startedAt >= startedAt && (r.plan ?? []).includes(entry.key)).at(-1) ?? null;
    const session = record?.r.sessions?.find((s) => s.key === entry.key) ?? null;
    const after = await spendCheck({ when: `after ${entry.key}`, log });
    const spentLine = Object.entries(after.ledgers).map(([d, l]) => `${DOOR_LABELS[d] ?? d} $${l.spent.toFixed(2)}`).join(" · ");
    log(`${new Date().toISOString().slice(11, 19)} done ${entry.key}: ${session?.turns ? `${session.turns.length} turns, ended by ${session.ended?.reason}${session.note?.text ? ", note recorded" : ""}` : `no session (exit ${code})`} · ${spentLine}`);
    for (const [door, l] of Object.entries(after.ledgers)) if (l.cap > 0 && l.cap - l.spent <= 20) log(`CAP: ${DOOR_LABELS[door] ?? door} is within $20 of its $${l.cap} cap ($${l.spent.toFixed(2)} spent)`);
    const tableDone = ORDER.filter((s) => s.table === entry.table && s.group === entry.group).at(-1)?.key === entry.key;
    if (tableDone) log(`TABLE: ${entry.group === 2 ? `Table ${entry.table}, group 2` : `DeepSeek at Table ${entry.table}`} finished`);
    if (!record || code !== 0) { log(`STOP: ${entry.key} exited ${code}${record ? "" : " without a run record"}`); return { stopped: "exit" }; }
    if (record.r.stopped) { log(`STOP: ${record.r.stopped}`); return { stopped: record.r.stopped }; }
    if (record.r.undone?.length) { log(`STOP: ${entry.key} left undone (${record.r.undone.map((u) => u.why).join("; ")})`); return { stopped: "undone" }; }
    if (!session?.turns) { log(`STOP: ${entry.key} crashed (${String(session?.crashed ?? "no record").split("\n")[0].slice(0, 200)})`); return { stopped: "crash" }; }
    if (["welfare", "no-check"].includes(session.ended?.reason)) { log(`STOP: a welfare stop in ${entry.key} (${session.ended.detail})`); return { stopped: "welfare" }; }
  }
  log("the order is done");
  return { stopped: null };
}
const readSpend = async () => (existsSync(SPEND_FILE) ? JSON.parse(await readFile(SPEND_FILE, "utf8")).checks ?? [] : []);
function child(args) {
  return new Promise((done) => {
    const p = spawn(process.execPath, ["--experimental-transform-types", fileURLToPath(import.meta.url), ...args], { cwd: ROOT, env: { ...process.env, NODE_USE_ENV_PROXY: "1" }, stdio: ["ignore", "inherit", "inherit"] });
    p.on("close", (code) => done(code ?? 1));
  });
}

// ---- the dry run's scripted providers ------------------------------------------------------------------------------------

/** Game player 1's scripted providers, plus OpenRouter's chat completions in their own shape (DeepSeek's seat). */
export function replicateScripted(options = {}) {
  const base = scriptedFetcher(options);
  let n = 0;
  return async (url, init = {}) => {
    if (!/\/v1\/chat\/completions$/.test(String(url))) return base(url, init);
    const body = JSON.parse(String(init.body ?? "{}"));
    (options.log ?? []).push({ url, body });
    const messages = (body.messages ?? []).filter((m) => m.role !== "system").map((m) => ({ role: m.role, content: String(m.content ?? "") }));
    const text = (options.player ?? defaultPlayer)(messages, body.messages?.[0]?.content ?? "");
    n++;
    return new Response(JSON.stringify({ id: `gen-scripted-${n}`, model: body.model, provider: "DeepInfra", choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: text } }],
      usage: { prompt_tokens: 1000, completion_tokens: 60, prompt_tokens_details: { cached_tokens: 0 }, completion_tokens_details: { reasoning_tokens: 40 }, cost: 0.0015 } }),
    { status: 200, headers: { "content-type": "application/json", "x-generation-id": `gen-scripted-${n}` } });
  };
}

function args(argv) {
  const value = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null; };
  return { dry: argv.includes("--dry"), go: argv.includes("--go"), drive: argv.includes("--drive"), prereport: argv.includes("--prereport"), spend: argv.includes("--spend"),
    group1Build: argv.includes("--group1-build"), group1Tags: argv.includes("--group1-tags"), rebuild: argv.includes("--report"), score: !argv.includes("--no-score"),
    only: value("--sessions")?.split(",") ?? null, from: value("--from"), until: value("--until"), turns: Number(value("--turns") ?? (argv.includes("--dry") ? 3 : 20)), label: value("--label") };
}

/** The report and the transcripts of every finished session again, from the records (no call). */
export async function rebuildAll() {
  const stage = loadStage();
  const dir = join(RUNS, `${STEM}-transcripts`);
  await mkdir(dir, { recursive: true });
  for (const session of stage.combined.sessions) await writeFile(join(dir, `${session.key}.md`), transcriptMarkdown(session));
  await writeFile(join(RUNS, `${STEM}-report.md`), reportMarkdown(stage));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = args(process.argv.slice(2));
  const done = (p) => p.then(() => process.exit(0), (error) => { console.error(`${STEM}: ${error?.stack ?? error}`); process.exit(1); });
  if (a.rebuild) done(rebuildAll());
  else if (a.prereport) done(writeFile(join(RUNS, `${STEM}-report.md`), reportMarkdown({ ...loadStage(), prereport: REPLICATE.prereportSummary })));
  else if (a.spend) done(spendCheck({ when: "by hand" }));
  else if (a.group1Build) done(buildGroup1().then((n) => console.log(`group 1: ${n} A/B session(s) copied`)));
  else if (a.group1Tags) done(tagGroup1());
  else if (a.drive) done(drive({ from: a.from, until: a.until }).then((r) => { if (r.stopped) process.exitCode = 3; }));
  else if (a.dry) done(run({ stage: REPLICATE, dry: true, only: a.only ?? ["A-opus", "A-deepseek-1"], turns: a.turns, lanes: 1, fetcher: replicateScripted(), label: "the dry run" })
    .then((r) => console.log(`dry run: ${r.sessions.length} session(s)`)));
  else if (a.go) {
    if (!a.only || a.only.length !== 1) { console.error("--go plays one session at a time: give --sessions <key> (the driver gives the order)"); process.exit(2); }
    done(run({ stage: REPLICATE, only: a.only, turns: a.turns, lanes: 1, score: a.score, label: a.label }).then(async (r) => {
      console.log(`finished: ${r.sessions.length} session(s), undone ${r.undone.length}, stopped ${r.stopped ?? "no"}`);
      await rebuildAll();
    }));
  } else { console.error("give --dry, --prereport, --spend, --drive, --go --sessions <key>, --group1-build, --group1-tags or --report"); process.exit(2); }
}
