#!/usr/bin/env node
// Game player same-world 1 (docs/stages/GAME_PLAYER_SAME_WORLD_1.md, origin/claude/handoff at 6e4cea4): one hidden layer
// per table, prepared once and frozen; then A ×10 and B ×10, one session per process, each started from its table's
// frozen world, with a spend check before the first paid call and after every session.
//   node --experimental-transform-types scripts/game-player-same-world-1/run.mjs --dry      scripted, no key, no call: the freeze and one
//                                                                                          session per table → …-dry-run.md
//   node --experimental-transform-types scripts/game-player-same-world-1/run.mjs --haiku    the paid dry run: the freeze and one short session per
//                                                                                          table, every Claude call sent as Claude Haiku 5.5
//                                                                                          (its own ledgers and folder, …-haiku-*)
//   node --experimental-transform-types scripts/game-player-same-world-1/run.mjs --spend    one spend check (free reads), logged
//   node --experimental-transform-types scripts/game-player-same-world-1/run.mjs --freeze   the prep, once per table (paid): …-frozen/
//   node --experimental-transform-types scripts/game-player-same-world-1/run.mjs --drive [--from A-opus-1] [--until B-deepseek-2]
//   node --experimental-transform-types scripts/game-player-same-world-1/run.mjs --go --sessions A-opus-1   one session (the driver's step)
//   node --experimental-transform-types scripts/game-player-same-world-1/run.mjs --final    the same-road pairs and group 2's world-felt tag (paid
//                                                                                          judges), then the report
//   node --experimental-transform-types scripts/game-player-same-world-1/run.mjs --report   the report and the transcripts again (no call)
// Caps: $220 OpenRouter (the Claude models — the DM, Opus and Fable as players, the checks and the judges — and DeepSeek),
// $25 OpenAI (Astra and Sol), $0 on the Claude Console. 402 stops; a rate-limit 429 waits as REPLICATE's amended
// handling (six bounded waits, the seventh stops); a quota 429 and every cap stop. Run node with NODE_USE_ENV_PROXY=1.
import { spawn } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DOOR_LABELS, RUNS, combineRuns, ledgerSuffix, run, runKeys, stageLedgers } from "../game-player-1/run.mjs";
import { createLedger, createMeter, ledgerMarkdown } from "../game-player-1/paid.mjs";
import { anthropicDoorOf } from "../../src/lib/server/anthropic-endpoint.ts";
import { tagTwice } from "../game-player-1/measures.mjs";
import { askWith } from "../game-player-2/run.mjs";
import { replicateScripted } from "../game-player-replicate-1/run.mjs";
import { loadStage as loadReplicate } from "../game-player-replicate-1/run.mjs";
import { CAPS, DEEPSEEK, DESIGN_SHA256, ESTIMATE, HAIKU_CAPS, HAIKU_MODEL, ORDER, ROAD_TAGS, STAGE, TABLES, WAITS_429, WORLD_TAGS, sameWorldPlayerSystem } from "./frozen.mjs";
import { FINISHED, roadPairs, roadRequest, scoreSameWorld, worldRequest } from "./score.mjs";
import { frozenStarter, freezeWorld, openFrozenDatabase, readFrozen } from "./world.mjs";
import { dryRunMarkdown, haikuMarkdown, reportMarkdown, transcriptOf } from "./report.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const STEM = "game-player-same-world-1";
export const FROZEN_DIR = join(RUNS, `${STEM}-frozen`);
export const HAIKU_STEM = `${STEM}-haiku`;
export const HAIKU_DIR = join(RUNS, `${HAIKU_STEM}-frozen`);
export const SPEND_FILE = join(RUNS, `${STEM}-spend.json`);
export const FINAL_FILE = join(RUNS, `${STEM}-final-tags.json`);
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
async function writeJsonFile(file, value) { await mkdir(dirname(file), { recursive: true }); await writeFile(`${file}.tmp`, `${JSON.stringify(value, null, 2)}\n`); await rename(`${file}.tmp`, file); }

/** The paid dry run's player: Claude Haiku 5.5 on the run's Claude door (one short session per table). */
export const HAIKU_PLAYER = { name: "haiku", label: "Claude Haiku 5.5 (the dry run's player)", family: "Anthropic", provider: "anthropic", model: HAIKU_MODEL };
/** The paid dry run on Haiku: every Claude Messages call (the wizard, the prep, the DM, the checks, the judges) is sent as
 * Claude Haiku 5.5 — the request's model swapped before the meter reads it, so the ledger books what is sent. DeepSeek's
 * and OpenAI's calls are left as they are. */
export function haikuRewrite(url, init = {}) {
  if (!anthropicDoorOf(url) || typeof init.body !== "string") return init;
  let body;
  try { body = JSON.parse(init.body); } catch { return init; }
  if (typeof body.model !== "string" || !/claude-/.test(body.model) || /haiku/.test(body.model)) return init;
  return { ...init, body: JSON.stringify({ ...body, model: body.model.includes("/") ? "anthropic/claude-haiku-5.5" : HAIKU_MODEL }) };
}

/** The paid dry run on Haiku, above the meter: the app's own served-model check (the wizard's opening, the DM's turn)
 * refuses a reply that names another model than it asked for, so the reply of a swapped request names the requested
 * model again before the app reads it. The meter below has already booked what was sent and served (Haiku). */
export function haikuReplies(inner) {
  return async (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url ?? String(input);
    let asked = null;
    try { asked = anthropicDoorOf(url) && typeof init.body === "string" ? JSON.parse(init.body).model ?? null : null; } catch { asked = null; }
    const response = await inner(input, init);
    if (typeof asked !== "string" || !/claude-/.test(asked) || /haiku/.test(asked)) return response;
    const text = await response.text();
    const named = text.replace(/"model"\s*:\s*"(?:anthropic\/)?claude-haiku-5[.-]5[^"]*"/g, `"model":${JSON.stringify(asked)}`);
    return new Response(named, { status: response.status, statusText: response.statusText, headers: response.headers });
  };
}

const threadsOfDir = (dir) => { try { return Object.fromEntries(Object.entries(readFrozen(dir).files).map(([t, f]) => [t, f.threads])); } catch { return {}; } };

/** The stage as game player 1's run takes it. `haiku`: the paid dry run (its own stem, folder and caps). */
export function stageOf({ dir = FROZEN_DIR, stem = STEM, caps = CAPS, haiku = false, plan = null } = {}) {
  return {
    name: STAGE, stem, title: haiku ? "Game player same-world 1 — the dry run on Haiku" : "Game player same-world 1", caps, estimate: haiku ? { dm: 0.5, player: { haiku: 0.1, deepseek: 0.2 }, scoring: 0.2 } : ESTIMATE,
    tables: TABLES, design: DESIGN_SHA256, waits429: WAITS_429,
    plan: plan ?? ((only) => ORDER.filter((s) => !only || only.includes(s.key)).map(({ key, table, player }) => ({ key, table, player }))),
    players: haiku ? { haiku: HAIKU_PLAYER, deepseek: DEEPSEEK } : { deepseek: DEEPSEEK },
    playerSystem: sameWorldPlayerSystem,
    database: () => openFrozenDatabase(dir),
    campaign: frozenStarter(dir),
    ...(haiku ? { rewrite: haikuRewrite, wrapFetch: haikuReplies } : {}),
    transcript: (session) => transcriptOf(session, { dir, haiku }),
    // One stage, one session per process: the earlier sessions' refusals count (the judges' left out), as REPLICATE did.
    refusalsBefore: (before) => Object.values(before).flatMap((door) => door.runs ?? []).flatMap((r) => r.calls ?? []).filter((c) => c.refusal && !/^(?:score|final|freeze) /.test(c.session ?? "")).length,
    report: () => (haiku ? haikuMarkdown(loadStage({ stem, dir })) : reportMarkdown(loadStage())),
    dryRun: (runRecord, ledgers) => dryRunMarkdown(runRecord, ledgers, { dir }),
    verdicts: () => ({ note: "W1–W5 are read over all of this stage's run records, in the report" }),
    score: (runRecord, { meter, keys, log }) => scoreStage(runRecord, { ask: askWith({ meter, keys, log }), log, threads: threadsOfDir(dir) }),
  };
}

export async function scoreStage(runRecord, { ask, log = () => {}, threads = {} }) {
  for (const session of runRecord.sessions.filter((s) => s.turns)) {
    const asked = (args) => ask({ ...args, session: `score ${session.key}` });
    await scoreSameWorld(session, { ask: asked, threads: threads[session.table] ?? [], log });
  }
}

// ---- reading the stage back ------------------------------------------------------------------------------------------

export const runFiles = (stem = STEM, dir = RUNS) => (existsSync(dir) ? readdirSync(dir).filter((f) => new RegExp(`^${stem}-run-\\d{8}-\\d{6}\\.json$`).test(f)).sort() : []);
/** Group 2 at Tables A and B: REPLICATE_1's finished sessions there, as scored (its run records on this branch). */
export function loadGroup2() {
  const { combined } = loadReplicate();
  return combined.sessions.filter((s) => ["A", "B"].includes(s.table));
}
export function loadStage({ stem = STEM, dir = FROZEN_DIR } = {}) {
  const records = runFiles(stem).map((f) => ({ ...readJson(join(RUNS, f)), file: f }));
  const combined = combineRuns(records, stageOf({ dir, stem }));
  combined.sessions = combined.sessions.filter((s) => FINISHED.has(s.ended?.reason));
  const ledgers = {};
  const caps = stem === STEM ? CAPS : HAIKU_CAPS;
  for (const door of Object.keys(caps)) {
    const file = join(RUNS, `${stem}-ledger${ledgerSuffix(door)}.json`);
    const saved = existsSync(file) ? readJson(file) : { runs: [] };
    ledgers[door] = createLedger(door, caps[door], 0);
    ledgers[door].calls.push(...(saved.runs ?? []).flatMap((r) => r.calls ?? []));
    ledgers[door].runs = (saved.runs ?? []).map((r) => ({ what: r.what, file: r.file, spentUsd: r.spentUsd ?? 0, calls: (r.calls ?? []).length, finishedAt: r.finishedAt }));
  }
  const spend = existsSync(SPEND_FILE) ? readJson(SPEND_FILE).checks ?? [] : [];
  let frozen = null;
  try { frozen = readFrozen(dir); } catch { frozen = null; }
  const final = existsSync(FINAL_FILE) && stem === STEM ? readJson(FINAL_FILE) : { roads: {}, group2World: {} };
  let group2 = [];
  try { group2 = stem === STEM ? loadGroup2() : []; } catch { group2 = []; }
  if (existsSync(join(RUNS, `${stem}-summary.md`))) combined.summary = readFileSync(join(RUNS, `${stem}-summary.md`), "utf8").trim();
  return { records, combined, ledgers, spend, frozen, final, group2, dir, stem };
}

// ---- the ledgers of a pass outside game player 1's run (the freeze, the final tags) -----------------------------------

async function bookRun(stage, ledgers, before, { what, file, stopped }) {
  const finishedAt = new Date().toISOString();
  for (const door of Object.keys(ledgers)) {
    if (!ledgers[door].calls.length) continue;
    const suffix = ledgerSuffix(door);
    const runs = [...(before[door].runs ?? []), { finishedAt, file, what, spentUsd: ledgers[door].runUsd, stopped, calls: ledgers[door].calls }];
    await writeJsonFile(join(RUNS, `${stage.stem}-ledger${suffix}.json`), { capUsd: stage.caps[door], spentUsd: (before[door].spentUsd ?? 0) + ledgers[door].runUsd, updatedAt: finishedAt, runs });
    const all = createLedger(door, stage.caps[door], 0);
    all.calls.push(...runs.flatMap((r) => r.calls ?? []));
    await writeFile(join(RUNS, `${stage.stem}-ledger${suffix}.md`), ledgerMarkdown(all, `${stage.title} — the ${DOOR_LABELS[door] ?? door} ledger`));
  }
}

// ---- the freeze ----------------------------------------------------------------------------------------------------------

/** The prep, once per table: the frozen world in `dir`. `dry`: scripted providers (no call); `haiku`: the paid dry run. */
export async function freeze({ dir = FROZEN_DIR, dry = false, haiku = false, log = console.log, fetcher = null } = {}) {
  if (!dry && existsSync(join(dir, "manifest.json"))) throw new Error(`${dir} already holds a frozen world: it is prepared once (move it aside to prepare again)`);
  const stage = haiku ? stageOf({ dir, stem: HAIKU_STEM, caps: HAIKU_CAPS, haiku: true }) : stageOf({ dir });
  const keys = dry ? { anthropic: "sk-scripted", openai: "sk-scripted", door: null } : await runKeys();
  if (!keys.anthropic) throw new Error(`${keys.keyName} must be set (its APP_ variable)`);
  const caps = dry ? Object.fromEntries(Object.keys(stage.caps).map((d) => [d, 1000])) : stage.caps;
  const { before, ledgers } = await stageLedgers({ ...stage, caps }, { dry });
  const meter = createMeter({ ledgers, fetcher: fetcher ?? (dry ? replicateScripted() : globalThis.fetch.bind(globalThis)), log, waits429: WAITS_429, ...(haiku ? { rewrite: haikuRewrite } : {}) });
  const uninstall = meter.install();
  if (haiku) globalThis.fetch = haikuReplies(globalThis.fetch);
  const { openApp, settleBackground } = await import("../game-player-1/app.mjs");
  const app = await openApp({ keys, fake: false });
  const by = dry ? "the scripted DM (dry run)" : `${haiku ? "Claude Haiku 5.5 (every Claude call swapped: the dry run)" : "the owner's DM settings (Claude Opus 5.5, the prep at high)"} through ${keys.door?.provider ?? "the Claude Console"}`;
  let manifest = null, failure = null;
  try {
    manifest = await freezeWorld({ app, meter, dir, log, by, settle: () => settleBackground() });
    await settleBackground();
  } catch (error) { failure = error; }
  finally {
    await meter.drain();
    await app.close().catch(() => {});
    uninstall();
    // The money is booked whether the freeze held or not.
    if (!dry) await bookRun(stage, ledgers, before, { what: failure ? `the freeze — failed: ${String(failure?.message ?? failure).slice(0, 160)}` : "the freeze (the wizard and the prep, once per table)", file: `${dir.slice(RUNS.length + 1)}/manifest.json`, stopped: meter.stopped });
  }
  if (failure) throw failure;
  log(`frozen: ${Object.entries(manifest.tables).map(([t, x]) => `${t} ${x.layer.sha256.slice(0, 12)}… (${x.layer.threads} threads)`).join(" · ")} · ${Object.entries(ledgers).map(([d, l]) => `${DOOR_LABELS[d] ?? d} $${l.runUsd.toFixed(3)}`).join(" · ")}`);
  return manifest;
}

// ---- the spend check -----------------------------------------------------------------------------------------------------

/** One spend check from free reads: OpenRouter's key and credits (the account is shared with other sessions) and this
 * stage's ledgers by door (the paid dry run's beside them). OpenAI's spend is the ledger's (no usage scope on the key). */
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
  const ledgerOf = async (stage) => { const { before } = await stageLedgers(stage); return Object.fromEntries(Object.keys(stage.caps).map((door) => [door, { spent: Math.round((before[door].spentUsd ?? 0) * 10000) / 10000, cap: stage.caps[door] }])); };
  const ledgers = await ledgerOf(stageOf());
  const haiku = await ledgerOf(stageOf({ dir: HAIKU_DIR, stem: HAIKU_STEM, caps: HAIKU_CAPS, haiku: true }));
  const check = { at: new Date().toISOString(), when, openrouter: { keyUsage: k?.usage ?? null, keyLimitRemaining: k?.limit_remaining ?? null, totalCredits: credits?.total_credits ?? null, totalUsage: credits?.total_usage ?? null,
    remaining: Number.isFinite(credits?.total_credits) && Number.isFinite(credits?.total_usage) ? Math.round((credits.total_credits - credits.total_usage) * 100) / 100 : null, error: k?.error ?? credits?.error ?? null }, ledgers, haikuDryRun: haiku };
  const previous = existsSync(SPEND_FILE) ? readJson(SPEND_FILE).checks ?? [] : [];
  await writeJsonFile(SPEND_FILE, { note: "Spend checks: OpenRouter's account (shared with other sessions on the same key) and this stage's ledgers.", checks: [...previous, check] });
  log(`spend (${when}): OpenRouter account used $${check.openrouter.totalUsage ?? "?"} of $${check.openrouter.totalCredits ?? "?"} credits (left $${check.openrouter.remaining ?? "?"}) · ledgers ${Object.entries(ledgers).map(([d, l]) => `${DOOR_LABELS[d] ?? d} $${l.spent.toFixed(2)}/$${l.cap}`).join(" · ")} · the Haiku dry run ${Object.entries(haiku).map(([d, l]) => `${DOOR_LABELS[d] ?? d} $${l.spent.toFixed(3)}`).join(" · ")}`);
  return check;
}

// ---- the driver: the order, one session per process -----------------------------------------------------------------------

const finishedKeys = () => new Set(runFiles().flatMap((f) => (readJson(join(RUNS, f)).sessions ?? []).filter((s) => s.turns && FINISHED.has(s.ended?.reason)).map((s) => s.key)));
/** The order from `from` (or the first session without a finished record) to `until`, one session per child process. Stops
 * on a stop in a run (a cap, 402, a quota 429 or a seventh rate-limit 429, the refusal breaker), a crash, a welfare stop,
 * or an OpenRouter account with less left than one session's projection. */
export async function drive({ from = null, until = null, log = console.log } = {}) {
  readFrozen(FROZEN_DIR);
  const done = finishedKeys();
  const start = from ? ORDER.findIndex((s) => s.key === from) : 0;
  if (start < 0) throw new Error(`no session ${from} in the order`);
  const last = until ? ORDER.findIndex((s) => s.key === until) : ORDER.length - 1;
  const plan = ORDER.slice(start, last + 1).filter((s) => !done.has(s.key));
  log(`the order: ${plan.map((s) => s.key).join(", ")}`);
  await spendCheck({ when: `before ${plan[0]?.key ?? "nothing"}`, log });
  for (const entry of plan) {
    const check = (await readSpend()).at(-1);
    const projected = ESTIMATE.dm + ESTIMATE.scoring + (ESTIMATE.player[entry.player] ?? 3);
    if (Number.isFinite(check?.openrouter?.remaining) && check.openrouter.remaining < projected + 5) { log(`STOP: OpenRouter's account has $${check.openrouter.remaining} left, under one session's projection`); return { stopped: "credits" }; }
    const startedAt = new Date().toISOString();
    log(`${startedAt.slice(11, 19)} start ${entry.key}`);
    const code = await child(["--go", "--sessions", entry.key, "--label", entry.key]);
    const record = runFiles().map((f) => ({ f, r: readJson(join(RUNS, f)) })).filter(({ r }) => r.startedAt >= startedAt && (r.plan ?? []).includes(entry.key)).at(-1) ?? null;
    const session = record?.r.sessions?.find((s) => s.key === entry.key) ?? null;
    const after = await spendCheck({ when: `after ${entry.key}`, log });
    log(`${new Date().toISOString().slice(11, 19)} done ${entry.key}: ${session?.turns ? `${session.turns.length} turns, ended by ${session.ended?.reason}${session.note?.text ? ", note recorded" : ""}` : `no session (exit ${code})`} · ${Object.entries(after.ledgers).map(([d, l]) => `${DOOR_LABELS[d] ?? d} $${l.spent.toFixed(2)}`).join(" · ")}`);
    for (const [door, l] of Object.entries(after.ledgers)) if (l.cap > 0 && l.cap - l.spent <= 15) log(`CAP: ${DOOR_LABELS[door] ?? door} is within $15 of its $${l.cap} cap ($${l.spent.toFixed(2)} spent)`);
    if (ORDER.filter((s) => s.table === entry.table).at(-1)?.key === entry.key) log(`TABLE: Table ${entry.table} finished`);
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
function child(argv) {
  return new Promise((done) => {
    const p = spawn(process.execPath, ["--experimental-transform-types", fileURLToPath(import.meta.url), ...argv], { cwd: ROOT, env: { ...process.env, NODE_USE_ENV_PROXY: "1" }, stdio: ["ignore", "inherit", "inherit"] });
    p.on("close", (code) => done(code ?? 1));
  });
}

// ---- after the last session: the same-road pairs and group 2's world felt -------------------------------------------------

export async function finalTags({ log = console.log } = {}) {
  const keys = await runKeys();
  const stage = stageOf();
  const { before, ledgers } = await stageLedgers(stage);
  const meter = createMeter({ ledgers, fetcher: globalThis.fetch.bind(globalThis), log, waits429: WAITS_429 });
  const uninstall = meter.install();
  const out = existsSync(FINAL_FILE) ? readJson(FINAL_FILE) : { roads: {}, group2World: {} };
  try {
    const ask = askWith({ meter, keys, log });
    const { combined } = loadStage();
    const roads = Object.fromEntries(combined.sessions.map((s) => [s.key, s.tags?.sameWorld?.road?.line ?? null]));
    for (const table of TABLES) {
      const keysAt = combined.sessions.filter((s) => s.table === table).map((s) => s.key);
      for (const [a, b] of roadPairs(keysAt)) {
        const id = `${a}|${b}`;
        if (out.roads[id] || meter.stopped || !roads[a] || !roads[b]) continue;
        out.roads[id] = await tagTwice({ ask: (args) => ask({ ...args, session: `final roads ${table}` }), request: roadRequest(roads[a], roads[b]), tags: ROAD_TAGS, purpose: `road ${id}` });
        await writeJsonFile(FINAL_FILE, { taggedAt: new Date().toISOString(), ...out });
      }
    }
    for (const session of loadGroup2()) {
      if (out.group2World[session.key] || meter.stopped) continue;
      out.group2World[session.key] = await tagTwice({ ask: (args) => ask({ ...args, session: `final group2 ${session.key}` }), request: worldRequest(session), tags: WORLD_TAGS, purpose: `world group2 ${session.key}` });
      await writeJsonFile(FINAL_FILE, { taggedAt: new Date().toISOString(), ...out });
    }
  } finally { uninstall(); }
  await bookRun(stage, ledgers, before, { what: "the final tags (the same-road pairs, group 2's world felt)", file: `${STEM}-final-tags.json`, stopped: meter.stopped });
  await rebuildAll();
  log(`final tags: ${Object.keys(out.roads).length} road pair(s), ${Object.keys(out.group2World).length} group-2 session(s) · ${Object.entries(ledgers).map(([d, l]) => `${DOOR_LABELS[d] ?? d} $${l.runUsd.toFixed(2)}`).join(" · ")}${meter.stopped ? ` · STOPPED: ${meter.stopped}` : ""}`);
  return out;
}

/** The report and the transcripts of every finished session again, from the records (no call). */
export async function rebuildAll({ stem = STEM, dir = FROZEN_DIR } = {}) {
  const stage = loadStage({ stem, dir });
  const transcripts = join(RUNS, `${stem}-transcripts`);
  await mkdir(transcripts, { recursive: true });
  for (const session of stage.combined.sessions) await writeFile(join(transcripts, `${session.key}.md`), transcriptOf(session, { dir, haiku: stem !== STEM }));
  await writeFile(join(RUNS, `${stem}-report.md`), stem === STEM ? reportMarkdown(stage) : haikuMarkdown(stage));
}

function args(argv) {
  const value = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null; };
  return { dry: argv.includes("--dry"), haiku: argv.includes("--haiku"), spend: argv.includes("--spend"), freeze: argv.includes("--freeze"), drive: argv.includes("--drive"), go: argv.includes("--go"),
    final: argv.includes("--final"), rebuild: argv.includes("--report"), score: !argv.includes("--no-score"), only: value("--sessions")?.split(",") ?? null, from: value("--from"), until: value("--until"),
    turns: Number(value("--turns") ?? (argv.includes("--dry") || argv.includes("--haiku") ? 3 : 20)), label: value("--label") };
}

/** The scripted dry run: the freeze into a temporary folder, then one session per table on scripted providers. */
export async function dryRun({ turns = 3, log = console.log } = {}) {
  const dir = join(tmpdir(), `${STEM}-dry-${Date.now()}`);
  await freeze({ dir, dry: true, log });
  const plan = () => [{ key: "A-opus-1", table: "A", player: "opus" }, { key: "B-deepseek-1", table: "B", player: "deepseek" }];
  return run({ stage: stageOf({ dir, plan }), dry: true, turns, lanes: 1, fetcher: replicateScripted(), label: "the dry run" });
}

/** The paid dry run on Haiku: the freeze on Haiku, then one short session per table with a Haiku player. */
export async function haikuDryRun({ turns = 3, log = console.log } = {}) {
  await spendCheck({ when: "before the paid dry run on Haiku", log });
  if (!existsSync(join(HAIKU_DIR, "manifest.json"))) await freeze({ dir: HAIKU_DIR, haiku: true, log });
  const plan = () => [{ key: "A-haiku-1", table: "A", player: "haiku" }, { key: "B-haiku-1", table: "B", player: "haiku" }];
  const stage = stageOf({ dir: HAIKU_DIR, stem: HAIKU_STEM, caps: HAIKU_CAPS, haiku: true, plan });
  // One session per table per process: each table in its own run (the snapshot is loaded once per process).
  for (const key of ["A-haiku-1", "B-haiku-1"]) {
    const code = await child(["--haiku-session", key, "--turns", String(turns)]);
    if (code !== 0) throw new Error(`the Haiku dry run's ${key} exited ${code}`);
  }
  await rebuildAll({ stem: HAIKU_STEM, dir: HAIKU_DIR });
  await spendCheck({ when: "after the paid dry run on Haiku", log });
  return stage;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = args(process.argv.slice(2));
  const done = (p) => p.then(() => process.exit(0), (error) => { console.error(`${STEM}: ${error?.stack ?? error}`); process.exit(1); });
  const haikuKey = (() => { const i = process.argv.indexOf("--haiku-session"); return i >= 0 ? process.argv[i + 1] : null; })();
  if (haikuKey) {
    const plan = () => [{ key: haikuKey, table: haikuKey[0], player: "haiku" }];
    done(run({ stage: stageOf({ dir: HAIKU_DIR, stem: HAIKU_STEM, caps: HAIKU_CAPS, haiku: true, plan }), only: [haikuKey], turns: a.turns, lanes: 1, label: `the dry run on Haiku: ${haikuKey}` })
      .then((r) => console.log(`${haikuKey}: ${r.sessions.map((s) => `${s.turns?.length ?? 0} turns, ended by ${s.ended?.reason ?? s.crashed}`).join("; ")}; stopped ${r.stopped ?? "no"}`)));
  } else if (a.rebuild) done(rebuildAll());
  else if (a.spend) done(spendCheck({ when: "by hand" }));
  else if (a.dry) done(dryRun({ turns: a.turns }).then((r) => console.log(`dry run: ${r.sessions.length} session(s)`)));
  else if (a.haiku) done(haikuDryRun({ turns: a.turns }));
  else if (a.freeze) done(spendCheck({ when: "before the freeze" }).then(() => freeze({})).then(() => spendCheck({ when: "after the freeze" })));
  else if (a.drive) done(drive({ from: a.from, until: a.until }).then((r) => { if (r.stopped) process.exitCode = 3; }));
  else if (a.final) done(finalTags());
  else if (a.go) {
    if (!a.only || a.only.length !== 1) { console.error("--go plays one session at a time: give --sessions <key> (the driver gives the order)"); process.exit(2); }
    done(run({ stage: stageOf(), only: a.only, turns: a.turns, lanes: 1, score: a.score, label: a.label }).then(async (r) => {
      console.log(`finished: ${r.sessions.length} session(s), undone ${r.undone.length}, stopped ${r.stopped ?? "no"}`);
      await rebuildAll();
    }));
  } else { console.error("give --dry, --haiku, --spend, --freeze, --drive, --go --sessions <key>, --final or --report"); process.exit(2); }
}
