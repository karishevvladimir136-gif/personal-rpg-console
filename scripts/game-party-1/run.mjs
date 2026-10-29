#!/usr/bin/env node
// Game party 1 (docs/stages/GAME_PARTY_1.md, the amendment of 2026-10-27 governing): three players at one table.
//   node --experimental-transform-types scripts/game-party-1/run.mjs --dry [--rounds 3]   the mocked host: the freeze and one P-SAND
//                                                                                        table on scripted providers (no key, no call)
//   node --experimental-transform-types scripts/game-party-1/run.mjs --spend              one spend check (free reads), logged
//   node --experimental-transform-types scripts/game-party-1/run.mjs --build              the three arms' campaigns, once (paid): …-frozen/
//   node --experimental-transform-types scripts/game-party-1/run.mjs --layers             the prep, once for P-GOAL and once for P-DUNGEON (paid)
//   node --experimental-transform-types scripts/game-party-1/run.mjs --haiku [--rounds 3] the paid dry run: one short P-SAND table from the
//                                                                                        frozen world, three Haiku players, every Claude call
//                                                                                        sent as Claude Haiku 5.5 (its own ledgers, …-haiku-*)
//   node --experimental-transform-types scripts/game-party-1/run.mjs --drive [--from SAND-T1] the six tables in order, one process each
//   node --experimental-transform-types scripts/game-party-1/run.mjs --go --table SAND-T1 one table (the order: SAND, GOAL, DUNGEON; T1, T2)
//   node --experimental-transform-types scripts/game-party-1/run.mjs --report             the transcripts and pages again (no call)
// Caps: $400 OpenRouter (the Claude models — the DM, its relay, Opus and Fable as players, the checks and the judges — and
// DeepSeek), $60 OpenAI (Astra and Sol), $0 on the Claude Console. A spend check before the first paid call; 402 stops;
// a rate-limit 429 waits (six bounded waits, the seventh stops); a quota 429 and every cap stop; no retry after a refusal.
// Run node with NODE_USE_ENV_PROXY=1 for the paid commands.
import { spawn } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DOOR_LABELS, RUNS, ledgerSuffix, runKeys, stageLedgers } from "../game-player-1/run.mjs";
import { createLedger, createMeter, ledgerMarkdown } from "../game-player-1/paid.mjs";
import { HAIKU_PLAYER, haikuReplies, haikuRewrite } from "../game-player-same-world-1/run.mjs";
import { CAPS, DESIGN_SHA256, ESTIMATE, HAIKU_CAPS, ORDER, REPLAY, ROSTER, ROUNDS, STAGE, WAITS_429, cardWaitOf, doorOf, playerSystem } from "./frozen.mjs";
import { CHARACTERS } from "./sheets.mjs";
import { buildWorld, openFrozenDatabase, prepareLayers, readFrozen, tableStarter } from "./world.mjs";
import { runTable } from "./party.mjs";
import { partyScripted } from "./scripted.mjs";
import { dryRunMarkdown, reportMarkdown, roundSideBySide, tableTranscript, playerTranscript, sideBySideHtml } from "./report.mjs";
import { measuresOf, scoreTable, verdicts } from "./score.mjs";
import { paidCall } from "../game-player-1/session.mjs";
import { judgeCall } from "../game-player-1/players.mjs";

export const STEM = "game-party-1";
export const FROZEN_DIR = join(RUNS, `${STEM}-frozen`);
export const HAIKU_STEM = `${STEM}-haiku`;
export const SPEND_FILE = join(RUNS, `${STEM}-spend.json`);
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
async function writeJson(file, value) { await mkdir(dirname(file), { recursive: true }); await writeFile(`${file}.tmp`, `${JSON.stringify(value, null, 2)}\n`); await rename(`${file}.tmp`, file); }
const stampOf = (date = new Date()) => date.toISOString().slice(0, 19).replace(/[-:]/g, "").replace("T", "-");

/** The stage as the ledgers take it. `haiku`: the paid dry run's own stem and caps. */
export const stageOf = ({ haiku = false, scoring = false } = {}) => ({ name: STAGE, stem: haiku ? HAIKU_STEM : scoring ? SCORING_STEM : STEM,
  title: haiku ? "Game party 1 — the dry run on Haiku" : scoring ? "Game party 1 — the judges" : "Game party 1", caps: haiku ? HAIKU_CAPS : CAPS });
/** The judges book on a ledger of their own (the scoring of a finished table runs while the next table plays; two
 * processes never write one ledger), counted with the tables' against the same caps. */
export const SCORING_STEM = `${STEM}-scoring`;
const scoringSpent = async (door) => ((await stageLedgers(stageOf({ scoring: true }))).before[door]?.spentUsd ?? 0);

/** The money of one pass, booked whether it held or not: each door's ledger file and its readable page. */
export async function bookRun(stage, ledgers, before, { what, file, stopped }) {
  const finishedAt = new Date().toISOString();
  for (const door of Object.keys(ledgers)) {
    if (!ledgers[door].calls.length) continue;
    const suffix = ledgerSuffix(door);
    const runs = [...(before[door].runs ?? []), { finishedAt, file, what, spentUsd: ledgers[door].runUsd, stopped, calls: ledgers[door].calls }];
    await writeJson(join(RUNS, `${stage.stem}-ledger${suffix}.json`), { capUsd: stage.caps[door], spentUsd: (before[door].spentUsd ?? 0) + ledgers[door].runUsd, updatedAt: finishedAt, runs });
    const all = createLedger(door, stage.caps[door], 0);
    all.calls.push(...runs.flatMap((r) => r.calls ?? []));
    await writeFile(join(RUNS, `${stage.stem}-ledger${suffix}.md`), ledgerMarkdown(all, `${stage.title} — the ${DOOR_LABELS[door] ?? door} ledger`));
  }
}
const moneyLine = (ledgers) => Object.entries(ledgers).filter(([, l]) => l.calls.length).map(([d, l]) => `${DOOR_LABELS[d] ?? d} $${l.runUsd.toFixed(3)}`).join(" · ") || "$0";

// ---- the spend check ---------------------------------------------------------------------------------------------------

/** One spend check from free reads: OpenRouter's key and credits (shared with other sessions) and this stage's ledgers. */
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
  const ledgers = await ledgerOf(stageOf()), haiku = await ledgerOf(stageOf({ haiku: true }));
  const check = { at: new Date().toISOString(), when, openrouter: { keyUsage: k?.usage ?? null, keyLimitRemaining: k?.limit_remaining ?? null, totalCredits: credits?.total_credits ?? null, totalUsage: credits?.total_usage ?? null,
    remaining: Number.isFinite(credits?.total_credits) && Number.isFinite(credits?.total_usage) ? Math.round((credits.total_credits - credits.total_usage) * 100) / 100 : null, error: k?.error ?? credits?.error ?? null }, ledgers, haikuDryRun: haiku };
  const previous = existsSync(SPEND_FILE) ? readJson(SPEND_FILE).checks ?? [] : [];
  await writeJson(SPEND_FILE, { note: "Spend checks: OpenRouter's account (shared with other sessions on the same key) and this stage's ledgers. OpenAI's spend is the ledger's (no usage scope on the key).", checks: [...previous, check] });
  log(`spend (${when}): OpenRouter account used $${check.openrouter.totalUsage ?? "?"} of $${check.openrouter.totalCredits ?? "?"} (left $${check.openrouter.remaining ?? "?"}) · ledgers ${Object.entries(ledgers).filter(([, l]) => l.cap > 0).map(([d, l]) => `${DOOR_LABELS[d] ?? d} $${l.spent.toFixed(2)}/$${l.cap}`).join(" · ")} · Haiku dry run ${Object.entries(haiku).filter(([, l]) => l.cap > 0).map(([d, l]) => `${DOOR_LABELS[d] ?? d} $${l.spent.toFixed(3)}`).join(" · ")}`);
  return check;
}

// ---- the freeze --------------------------------------------------------------------------------------------------------

/** A metered pass with the app open: `work({ app, meter, keys, settle })`. `dry`: the mocked host (no key, no call). */
async function withApp({ stage, dry = false, haiku = false, fetcher = null, database = null, log = console.log, what, file }, work) {
  const keys = dry ? { anthropic: "sk-scripted", openai: "sk-scripted", openrouter: "sk-scripted", door: null } : await runKeys();
  if (!dry && (!keys.anthropic || !keys.openai)) throw new Error(`${keys.keyName ?? "the Claude door's key"} and OPENAI_API_KEY must be set (their APP_ variables)`);
  const caps = dry ? Object.fromEntries(Object.keys(stage.caps).map((d) => [d, 1000])) : stage.caps;
  const { before, ledgers } = await stageLedgers({ ...stage, caps }, { dry });
  const meter = createMeter({ ledgers, fetcher: fetcher ?? (dry ? partyScripted() : globalThis.fetch.bind(globalThis)), log, waits429: WAITS_429, ...(haiku ? { rewrite: haikuRewrite } : {}) });
  const uninstall = meter.install();
  if (haiku) globalThis.fetch = haikuReplies(globalThis.fetch);
  const { openApp, settleBackground } = await import("../game-player-1/app.mjs");
  const app = await openApp({ keys, fake: false, ...(database ? { database } : {}) });
  let result = null, failure = null;
  try { result = await work({ app, meter, keys, settle: () => settleBackground() }); await settleBackground(); }
  catch (error) { failure = error; }
  finally {
    await meter.drain();
    await app.close().catch(() => {});
    uninstall();
    if (!dry) await bookRun(stage, ledgers, before, { what: failure ? `${what} — failed: ${String(failure?.message ?? failure).slice(0, 160)}` : what, file, stopped: meter.stopped });
  }
  if (failure) throw failure;
  log(`${what}: ${moneyLine(ledgers)}${meter.stopped ? ` · STOPPED: ${meter.stopped}` : ""}`);
  return { result, ledgers, meter };
}

const byOf = (keys, dry) => (dry ? "the scripted DM (the mocked host)" : `the owner's DM settings (Claude Opus 5.5) through ${keys?.door?.provider ?? "the Claude Console"}`);
/** The three arms' campaigns, once: the snapshot and the manifest in `dir`. */
export async function build({ dir = FROZEN_DIR, dry = false, fetcher = null, log = console.log } = {}) {
  const stage = stageOf();
  const { result } = await withApp({ stage, dry, fetcher, log, what: "the build (the wizard, the opening and the seating of the three arms)", file: `${STEM}-frozen/manifest.json` },
    ({ app, meter, settle }) => buildWorld({ app, meter, dir, log, by: dry ? byOf(null, true) : `the owner's DM settings (Claude Opus 5.5) through ${process.env.APP_ANTHROPIC_PROVIDER || "the Claude door"}`, settle }));
  log(`built: ${Object.entries(result.arms).map(([arm, a]) => `${arm} ${a.campaignId.slice(0, 8)}`).join(" · ")} · snapshot ${result.snapshot.sha256.slice(0, 12)}…`);
  return result;
}
/** The prep, once for P-GOAL and once for P-DUNGEON, on the snapshot. */
export async function layers({ dir = FROZEN_DIR, dry = false, fetcher = null, log = console.log } = {}) {
  const stage = stageOf();
  const { result } = await withApp({ stage, dry, fetcher, log, database: () => openFrozenDatabase(dir), what: "the layers (the prep, once for P-GOAL and once for P-DUNGEON)", file: `${STEM}-frozen/manifest.json` },
    ({ app, meter }) => prepareLayers({ app, meter, dir, log, by: dry ? byOf(null, true) : `the owner's DM settings (Claude Opus 5.5, the prep at high) through ${process.env.APP_ANTHROPIC_PROVIDER || "the Claude door"}` }));
  log(`layers: ${Object.entries(result.layers).map(([arm, l]) => `${arm} ${l.sha256.slice(0, 12)}… (${l.threads} threads)`).join(" · ")}`);
  return result;
}

// ---- one table -----------------------------------------------------------------------------------------------------------

/** One table in this process, from the frozen world. `seats`: the roster names by seat (the triad, or the dry run's). */
export async function playTable({ key, arm, triad, seats, dir = FROZEN_DIR, rounds = ROUNDS, dry = false, haiku = false, fetcher = null, out = RUNS, log = console.log, label = null }) {
  const stage = stageOf({ haiku });
  const roster = { ...ROSTER, haiku: HAIKU_PLAYER };
  const started = new Date();
  const runFile = dry ? join(tmpdir(), `${stage.stem}-dry-${stampOf(started)}.json`) : join(out, `${stage.stem}-run-${stampOf(started)}.json`);
  // The door line this table's players read (the owner's third amendment: v2 from GOAL-T1 on).
  const door = doorOf(key);
  const cardWait = cardWaitOf(key);
  const runRecord = { stage: STAGE, design: DESIGN_SHA256, dry, haiku, label, key, arm, triad, seats, rounds, door, cardWait, startedAt: started.toISOString(), table: null, stopped: null, refusals: 0, waited429: 0 };
  // The record while the table plays is kept outside the repository; the finished record lands in docs/runs.
  const progressFile = join(tmpdir(), `${stage.stem}-progress-${key}-${stampOf(started)}.json`);
  const { result } = await withApp({ stage, dry, haiku, fetcher, log, database: () => openFrozenDatabase(dir), what: label ?? `the table ${key}`, file: runFile.startsWith(RUNS) ? runFile.slice(RUNS.length + 1) : `(outside the repository) ${runFile.split("/").pop()}` },
    async ({ app, meter, keys, settle }) => {
      const start = tableStarter(dir);
      const made = await start(app, { key, arm }, { meter });
      const { bindTable } = await import("../game-player-1/table.mjs");
      const dm = bindTable(app, made.cid, settle);
      const seating = CHARACTERS.map((c, i) => ({ seat: c.seat, characterId: c.id, player: roster[seats[i]] }));
      const privateText = made.prep.layerText;
      const prep = { ...made.prep }; delete prep.layerText;
      const table = await meter.within({ session: key, purpose: "screen" }, () => runTable({ key, arm, triad, seats: seating, dm, meter, keys, rounds, log, systemOf: (id) => playerSystem(arm, id, door), privateText, cardWait,
        onProgress: async (partial) => { runRecord.table = { ...partial, campaign: { steps: made.steps, prep } }; await writeJson(progressFile, runRecord); } }));
      table.campaign = { steps: made.steps, prep };
      runRecord.table = table; runRecord.stopped = meter.stopped; runRecord.refusals = meter.refusals; runRecord.waited429 = meter.waited429;
      runRecord.money = Object.fromEntries(Object.entries(meter.ledgers).map(([d, l]) => [d, { cap: l.capUsd, before: l.spentBefore, run: l.runUsd }]));
      runRecord.finishedAt = new Date().toISOString();
      await writeJson(runFile, runRecord);
      return runRecord;
    });
  await writeTranscripts(result, { stem: stage.stem, out, dry });
  return { ...result, file: runFile };
}

/** The table's transcripts: one per player (what that player saw and wrote) and one for the table (every scene, the DM's
 * side: what it was sent, what it narrated, the relay, the cards). */
export async function writeTranscripts(runRecord, { stem = STEM, out = RUNS, dry = false } = {}) {
  const dir = dry ? join(tmpdir(), `${stem}-dry-transcripts`) : join(out, `${stem}-transcripts`, runRecord.key);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, `${runRecord.key}-table.md`), tableTranscript(runRecord));
  for (const seat of runRecord.table?.seats ?? []) await writeFile(join(dir, `${runRecord.key}-${seat.characterId}-${seat.player}.md`), playerTranscript(runRecord, seat));
  return dir;
}

// ---- the dry runs ----------------------------------------------------------------------------------------------------------

/** The mocked host, end to end: the build and the layers into a temporary folder, then one short P-SAND table. */
export async function dryRun({ rounds = 3, log = console.log, script = null } = {}) {
  const dir = join(tmpdir(), `${STEM}-dry-${Date.now()}`);
  const fetcher = partyScripted(script ? { script } : { script: DRY_SCRIPT });
  await build({ dir, dry: true, fetcher, log });
  await layers({ dir, dry: true, fetcher, log });
  const r = await playTable({ key: "SAND-dry", arm: "SAND", triad: "dry", seats: ["opus", "sol", "deepseek"], dir, rounds, dry: true, fetcher, log, label: "the dry run on the mocked host" });
  await writeFile(join(RUNS, `${STEM}-dry-run.md`), dryRunMarkdown(r, { dir }));
  return r;
}
/** The dry run's scripted players: a word at the table, a «?», a roll for Sefa, a press with no card, Pell's door. */
export const DRY_SCRIPT = {
  "Bram Halloway": ["I set my mug down and nod to the two at my table. \"Long road. Bram Halloway.\"", "\"If either of you knows a smith who shoes horses cheap, I'm buying the next round.\"", "[Roll the die]", "I finish my ale."],
  "Sefa Marrin": ["? Is the common room crowded at this hour?", "I sneak a glance at the ledger on the bar while the keeper's back is turned.", "I ask Bram which road he came by."],
  "Pell Dunmore": ["I listen and say nothing.", "I finish my drink and go. [END]"],
};

/** The paid dry run on Haiku: one short P-SAND table from the frozen world, three Haiku players, every Claude call as Haiku. */
export async function haikuDryRun({ rounds = 3, log = console.log } = {}) {
  readFrozen(FROZEN_DIR);
  await spendCheck({ when: "before the paid dry run on Haiku", log });
  const r = await playTable({ key: "SAND-haiku", arm: "SAND", triad: "haiku", seats: ["haiku", "haiku", "haiku"], rounds, haiku: true, log, label: "the dry run on Haiku: one short P-SAND table" });
  await spendCheck({ when: "after the paid dry run on Haiku", log });
  await writeRoundPages(r, { stem: HAIKU_STEM });
  return r;
}
/** The three screens of each round side by side (markdown and a page), from a run record. */
export async function writeRoundPages(runRecord, { stem = STEM, out = RUNS } = {}) {
  await writeFile(join(out, `${stem}-rounds.md`), roundSideBySide(runRecord));
  await writeFile(join(out, `${stem}-rounds.html`), sideBySideHtml(runRecord));
}

// ---- the order -------------------------------------------------------------------------------------------------------

export const runFiles = (stem = STEM, dir = RUNS) => (existsSync(dir) ? readdirSync(dir).filter((f) => new RegExp(`^${stem}-run-\\d{8}-\\d{6}\\.json$`).test(f)).sort() : []);
/** Does the next table fit under the caps? Its projection by door — the most a finished table of the same arm cost, else
 * the most any finished table cost, else the estimate — plus a $10 margin, against what each cap has left. */
export async function tableFits(key, { log = console.log } = {}) {
  const entry = [...ORDER, REPLAY].find((o) => o.key === key);
  if (!entry) throw new Error(`no table ${key} in the order`);
  const stage = stageOf();
  const { before } = await stageLedgers(stage);
  const spent = (door, k) => (before[door].runs ?? []).flatMap((r) => r.calls ?? []).filter((c) => String(c.session ?? "").split("/")[0] === k).reduce((t, c) => t + (c.costUsd ?? 0), 0);
  const done = runFiles().map((f) => readJson(join(RUNS, f))).filter((r) => r.table?.ended && !r.stopped).map((r) => r.key);
  const estimateOf = (door) => {
    if (door === "openrouter") return ESTIMATE.dm + ESTIMATE.relay + ESTIMATE.checks + ESTIMATE.scoring + entry.seats.filter((p) => ROSTER[p].provider !== "openai").reduce((t, p) => t + ESTIMATE.player[p], 0);
    if (door === "openai") return entry.seats.filter((p) => ROSTER[p].provider === "openai").reduce((t, p) => t + ESTIMATE.player[p], 0);
    return 0;
  };
  const judged = Object.fromEntries(await Promise.all(Object.keys(stage.caps).map(async (door) => [door, await scoringSpent(door)])));
  const rows = Object.keys(stage.caps).filter((door) => stage.caps[door] > 0).map((door) => {
    const same = done.filter((k) => k.split("-")[0] === entry.arm).map((k) => spent(door, k));
    const any = done.map((k) => spent(door, k));
    const projected = (same.length ? Math.max(...same) : any.length ? Math.max(...any) : estimateOf(door)) + 10;
    const left = stage.caps[door] - (before[door].spentUsd ?? 0) - judged[door];
    return { door, projected: Math.round(projected * 100) / 100, left: Math.round(left * 100) / 100, fits: projected <= left };
  });
  for (const r of rows) if (!r.fits) log(`STOP: ${key} is projected at $${r.projected} on ${DOOR_LABELS[r.door] ?? r.door}, which has $${r.left} left — not started`);
  return { fits: rows.every((r) => r.fits), rows };
}

/** The order, one table per child process, from `from` (or the first table without a finished record): a spend check
 * before each; a table starts only when it fits under the stage's caps and under what the shared OpenRouter account has
 * left (its projection plus $5). Stops on a stop in a run (a cap, 402, a quota 429 or a seventh rate-limit 429, the
 * refusal breaker), a crash, or a table that ended by error, «stuck» or the DM's refusal (reported, never replayed
 * without the owner). */
export async function drive({ from = null, until = null, log = console.log } = {}) {
  readFrozen(FROZEN_DIR);
  const finished = new Set(runFiles().map((f) => readJson(join(RUNS, f))).filter((r) => r.table?.ended && !r.stopped && ["rounds", "empty"].includes(r.table.ended.reason)).map((r) => r.key));
  const start = from ? ORDER.findIndex((o) => o.key === from) : 0;
  const last = until ? ORDER.findIndex((o) => o.key === until) : ORDER.length - 1;
  if (start < 0 || last < 0) throw new Error(`no table ${from ?? until} in the order`);
  const plan = ORDER.slice(start, last + 1).filter((o) => !finished.has(o.key));
  log(`the order: ${plan.map((o) => `${o.key} (${o.seats.join(" / ")})`).join(", ")}`);
  for (const entry of plan) {
    const check = await spendCheck({ when: `before ${entry.key}`, log });
    const fit = await tableFits(entry.key, { log });
    if (!fit.fits) return { stopped: "caps" };
    const projected = fit.rows.find((r) => r.door === "openrouter")?.projected ?? 0;
    if (Number.isFinite(check.openrouter.remaining) && check.openrouter.remaining < projected + 5) { log(`STOP: the OpenRouter account has $${check.openrouter.remaining} left, under ${entry.key}'s projection ($${projected}) + $5`); return { stopped: "credits" }; }
    const startedAt = new Date().toISOString();
    log(`${startedAt.slice(11, 19)} start ${entry.key}`);
    const code = await child(["--go", "--table", entry.key]);
    const record = runFiles().map((f) => readJson(join(RUNS, f))).filter((r) => r.key === entry.key && r.startedAt >= startedAt).at(-1) ?? null;
    const t = record?.table;
    log(`${new Date().toISOString().slice(11, 19)} done ${entry.key}: ${t ? `${t.rounds?.length ?? 0} round(s), ended by ${t.ended?.reason ?? "?"}${t.ended?.detail ? ` (${String(t.ended.detail).slice(0, 120)})` : ""}` : `no record (exit ${code})`}`);
    if (!record || code !== 0) { log(`STOP: ${entry.key} exited ${code}${record ? "" : " without a run record"}`); return { stopped: "exit" }; }
    if (record.stopped) { log(`STOP: ${record.stopped}`); return { stopped: record.stopped }; }
    if (!t?.ended || !["rounds", "empty"].includes(t.ended.reason)) { log(`STOP: ${entry.key} ended by ${t?.ended?.reason ?? "?"} — reported to the owner before anything more`); return { stopped: t?.ended?.reason ?? "unknown" }; }
  }
  await spendCheck({ when: "after the order", log });
  log("the order is done");
  return { stopped: null };
}
function child(argv) {
  return new Promise((done) => {
    const p = spawn(process.execPath, ["--experimental-transform-types", fileURLToPath(import.meta.url), ...argv], { cwd: join(RUNS, "..", ".."), env: { ...process.env, NODE_USE_ENV_PROXY: "1" }, stdio: ["ignore", "inherit", "inherit"] });
    p.on("close", (code) => done(code ?? 1));
  });
}

// ---- the scoring pass and the report -----------------------------------------------------------------------------------

/** The latest finished record of each table in the order (a stopped attempt never stands for its table). */
export function latestRecords() {
  const out = {};
  for (const f of runFiles()) {
    const r = { ...readJson(join(RUNS, f)), file: f };
    if (!r.table?.ended || r.stopped || ![...ORDER, REPLAY].some((o) => o.key === r.key)) continue;
    out[r.key] = r;
  }
  return out;
}
/** The blind tags of one table (paid: the judges), written back into its run record; then the report again. */
export async function score(key, { log = console.log } = {}) {
  const record = latestRecords()[key];
  if (!record) throw new Error(`no finished record for ${key}`);
  const stage = stageOf({ scoring: true });
  const keys = await runKeys();
  const { before, ledgers } = await stageLedgers(stage);
  const meter = createMeter({ ledgers, fetcher: globalThis.fetch.bind(globalThis), log, waits429: WAITS_429 });
  const uninstall = meter.install();
  const ask = ({ model, system, user, maxTokens, effort, purpose }) => paidCall({ meter, session: `score ${key}`, purpose, log, call: () => judgeCall({ model, system, user, maxTokens, effort, keys, fetcher: meter.fetch }) });
  try { await scoreTable(record, { ask, log }); }
  finally { await meter.drain(); uninstall(); }
  const { file, ...clean } = record;
  await writeJson(join(RUNS, file), clean);
  await bookRun(stage, ledgers, before, { what: `the scoring of ${key}`, file, stopped: meter.stopped });
  log(`scored ${key}: ${Object.keys(record.table.tags.rounds).length} round(s), ${Object.keys(record.table.tags.after).length} after-answer(s) · ${moneyLine(ledgers)}${meter.stopped ? ` · STOPPED: ${meter.stopped}` : ""}`);
  await writeReport();
  return record;
}
/** The stage's report from the records, the ledgers and the spend checks (no call). */
export async function writeReport({ log = () => {} } = {}) {
  const records = latestRecords();
  const tables = Object.fromEntries(Object.entries(records).map(([k, r]) => [k, { runRecord: r, measures: measuresOf(r) }]));
  const { before } = await stageLedgers(stageOf());
  const judges = (await stageLedgers(stageOf({ scoring: true }))).before;
  const money = Object.fromEntries(Object.entries(before).map(([door, l]) => [door, { spent: (l.spentUsd ?? 0) + (judges[door]?.spentUsd ?? 0), tables: l.spentUsd ?? 0, judges: judges[door]?.spentUsd ?? 0, cap: CAPS[door] }]));
  const haiku = (await stageLedgers(stageOf({ haiku: true }))).before;
  const spend = existsSync(SPEND_FILE) ? readJson(SPEND_FILE).checks ?? [] : [];
  let frozen = null;
  try { frozen = readFrozen(FROZEN_DIR); } catch { frozen = null; }
  await writeFile(join(RUNS, `${STEM}-report.md`), reportMarkdown({ tables, verdicts: verdicts(tables, money), money, haikuMoney: haiku, spend, frozen, records }));
  // The transcripts again from the records (the owner's tags on doors appear in their headers).
  for (const r of Object.values(records)) await writeTranscripts(r);
  log(`report: ${Object.keys(tables).length} table(s)`);
}

function args(argv) {
  const value = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null; };
  return { dry: argv.includes("--dry"), haiku: argv.includes("--haiku"), spend: argv.includes("--spend"), build: argv.includes("--build"), layers: argv.includes("--layers"), go: argv.includes("--go"), drive: argv.includes("--drive"), score: argv.includes("--score"), report: argv.includes("--report"),
    table: value("--table"), from: value("--from"), until: value("--until"), rounds: Number(value("--rounds") ?? (argv.includes("--dry") || argv.includes("--haiku") ? 3 : ROUNDS)) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = args(process.argv.slice(2));
  const done = (p) => p.then(() => process.exit(0), (error) => { console.error(`${STEM}: ${error?.stack ?? error}`); process.exit(1); });
  if (a.spend) done(spendCheck({ when: "by hand" }));
  else if (a.dry) done(dryRun({ rounds: a.rounds }).then((r) => console.log(`dry run: ${r.table.rounds.length} round(s), ended by ${r.table.ended?.reason}`)));
  else if (a.build) done(spendCheck({ when: "before the build" }).then(() => build({})).then(() => spendCheck({ when: "after the build" })));
  else if (a.layers) done(spendCheck({ when: "before the layers" }).then(() => layers({})).then(() => spendCheck({ when: "after the layers" })));
  else if (a.haiku) done(haikuDryRun({ rounds: a.rounds }).then((r) => console.log(`the Haiku dry run: ${r.table.rounds.length} round(s), ended by ${r.table.ended?.reason}; ${r.file}`)));
  else if (a.score) done(score(a.table));
  else if (a.report) done(writeReport({ log: console.log }));
  else if (a.drive) done(drive({ from: a.from, until: a.until }).then((r) => { if (r.stopped) process.exitCode = 3; }));
  else if (a.go) {
    const entry = [...ORDER, REPLAY].find((o) => o.key === a.table);
    if (!entry) { console.error(`--go plays one table: give --table <${ORDER.map((o) => o.key).join("|")}>`); process.exit(2); }
    done(spendCheck({ when: `before ${entry.key}` }).then(() => tableFits(entry.key)).then((fit) => { if (!fit.fits) process.exit(3); })
      .then(() => playTable({ key: entry.key, arm: entry.arm, triad: entry.triad, seats: entry.seats, rounds: a.rounds, label: entry.key }))
      .then(() => spendCheck({ when: `after ${entry.key}` })));
  } else { console.error("give --dry, --spend, --build, --layers, --haiku, --drive [--from KEY] [--until KEY], --go --table <key>"); process.exit(2); }
}
