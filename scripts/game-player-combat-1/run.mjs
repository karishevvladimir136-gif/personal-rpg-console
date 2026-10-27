#!/usr/bin/env node
// Game player combat 1 (docs/stages/GAME_PLAYER_COMBAT_1.md): four players, one fresh Coast Way campaign each, on game
// player 1's harness (with FIX_S4 11w″). One session at a time, each in its own process, with a spend check before and
// after every session. Run node with NODE_USE_ENV_PROXY=1 in the cloud.
//   node --experimental-transform-types scripts/game-player-combat-1/run.mjs --dry           the pipeline on scripted providers
//                                                                                            (no key, no call; nothing written but a temp file)
//   node --experimental-transform-types scripts/game-player-combat-1/run.mjs --dry-haiku     the dry run the owner asked for: one short
//                                                                                            session (8 turns) with Claude Haiku 5.5 as the
//                                                                                            player at the real DM; paid, inside the caps;
//                                                                                            docs/runs/game-player-combat-1-dry-run.md
//   node --experimental-transform-types scripts/game-player-combat-1/run.mjs --prereport     the report before the first paid session
//   node --experimental-transform-types scripts/game-player-combat-1/run.mjs --spend         one spend check (free reads), logged
//   node --experimental-transform-types scripts/game-player-combat-1/run.mjs --drive [--from CW-fable]
//                                                                                            the four sessions in order, one per process
//   node --experimental-transform-types scripts/game-player-combat-1/run.mjs --go --sessions CW-opus   one session (the driver's step)
//   node --experimental-transform-types scripts/game-player-combat-1/run.mjs --report        the report and transcripts again (no call)
// Caps: $90 OpenRouter, $15 OpenAI, $0 on the Console. HTTP 402 and a quota 429 stop the run; a rate-limit 429 waits six
// times at most (20 s … 120 s), then the run stops.
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DOOR_LABELS, RUNS, combineRuns, ledgerSuffix, run, stageLedgers } from "../game-player-1/run.mjs";
import { createLedger } from "../game-player-1/paid.mjs";
import { PLAYERS } from "../game-player-1/players.mjs";
import { scriptedFetcher } from "../game-player-1/scripted.mjs";
import { transcriptMarkdown } from "../game-player-1/report.mjs";
import { askWith } from "../game-player-2/run.mjs";
import { CAPS, DESIGN_SHA256, DRY_PLAYER, DRY_TURNS, ESTIMATE, ORDER, STAGE, STEM, TABLE, TAMSIN, TURNS, WAITS_429, coastWay, heroDescription, playerSystem } from "./frozen.mjs";
import { combatVerdicts, scoreCombat, townBaseline } from "./score.mjs";
import { dryRunMarkdown, reportMarkdown } from "./report.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const SPEND_FILE = join(RUNS, `${STEM}-spend.json`);
export const BETS_FILE = join(RUNS, `${STEM}-bets.json`);
export const DRY_KEY = `${TABLE}-${DRY_PLAYER.name}`;
const key = (player) => `${TABLE}-${player}`;
/** The finished ends of a session. A cut attempt — a crash, a stop, an error end (CW-fable's first session: a harness
 * bug at t7) — is kept in its record and listed apart, and the session is played again from a fresh campaign. */
export const FINISHED = new Set(["turns", "player", "stuck", "welfare", "no-check", "refusal"]);

// ---- the campaign: the owner's steps the wizard does not do by itself --------------------------------------------------------

/** After the opening: Tamsin on the records with the stage's numbers (AC 12, 11 HP), by the owner's correction — as the
 * party panel would set them — when the opening brought her in with other numbers, or not at all. */
export async function tamsinOnRecords(app, cid) {
  const { readCampaign, applyMutation } = app.server.repository;
  const snapshot = await readCampaign(cid);
  const timeline = await app.f.fence(cid);
  const entity = snapshot.entities.find((row) => /\btamsin\b/i.test(row.name));
  if (entity) {
    const before = { kind: entity.kind, hp: entity.hp, maxHp: entity.max_hp, ac: entity.stats?.defense ?? null };
    if (entity.kind === "companion" && entity.max_hp === TAMSIN.hp && entity.hp === TAMSIN.hp && Number(entity.stats?.defense) === TAMSIN.ac) return { tamsin: "on the records as given", before };
    await applyMutation({ requestId: randomUUID(), operation: "entity.save", campaignId: cid, expectedRevision: entity.revision, timeline, correctionScope: "timeline",
      payload: { id: entity.id, kind: "companion", name: entity.name, details: entity.details, hp: TAMSIN.hp, max_hp: TAMSIN.hp, stats: { ...entity.stats, defense: TAMSIN.ac },
        resources: { ...entity.resources }, conditions: [...entity.conditions], equipment_slots: structuredClone(entity.equipment_slots) } });
    return { tamsin: "corrected by the owner to AC 12, 11 HP", before };
  }
  await applyMutation({ requestId: randomUUID(), operation: "entity.save", campaignId: cid, expectedRevision: 0, timeline,
    payload: { kind: "companion", name: TAMSIN.name, details: TAMSIN.details, hp: TAMSIN.hp, max_hp: TAMSIN.hp, stats: { defense: TAMSIN.ac }, resources: {}, conditions: [], equipment_slots: [] } });
  return { tamsin: "not brought in by the opening: added by the owner (AC 12, 11 HP)", before: null };
}

/** After the prep: whether the owner's secrets reached the DM's store, and which of the named exits the hidden layer
 * carries — yes or no only; the layer's text never leaves the database. */
export async function exitsInPrep(app, cid) {
  const state = (await app.f.one("select contents from rpg_private.dm_state where campaign_id=$1", [cid]))?.contents ?? {};
  const layer = app.lib.privateNotes.hiddenLayerOf({ privateState: state }).toLowerCase();
  const secrets = await app.server.secrets.readDmSecrets(cid).catch(() => null);
  return {
    secretsSaved: Boolean(secrets?.campaign?.body?.trim()),
    exitsInLayer: { fight: /\b(fight|battle|combat)\b/.test(layer), withdraw: /withdraw|retreat|misty step|invisib|bridge/.test(layer), parley: /parley|toll|terms|negotiat/.test(layer),
      surrender: /surrender|ransom|prisoner/.test(layer), warBand: /\borcs?\b|war ?band|war chief/.test(layer) },
  };
}

/** The owner's pause (2026-10-27: «pause after Opus's first combat card and show it to me, then continue on my word»): with
 * COMBAT_PAUSE_FILE set, the first card screen of a fight — an attack card, or any card while the records hold an open
 * fight — is written to that file before the player sees it, and the session waits until «<file>.go» exists. Nothing is
 * called while it waits; the player's screen is unchanged. */
// The second launch (the owner, after the container restart lost the paused session): COMBAT_CARD_FILE alone writes the
// first combat card and the player's message at it, without waiting.
let first = null;
export async function pauseAtFirstCombatCard({ key: session, k, screen, checks, readView }, { file = process.env.COMBAT_PAUSE_FILE || process.env.COMBAT_CARD_FILE, wait = Boolean(process.env.COMBAT_PAUSE_FILE), sleep = (ms) => new Promise((done) => setTimeout(done, ms)), log = console.log } = {}) {
  if (!file || first) return false;
  const fight = checks.some((check) => check.kind === "attack") || ((await readView()).play?.encounters ?? []).some((row) => row.status === "active");
  if (!fight) return false;
  first = { session, k, file, answered: false };
  writeFileSync(file, `# ${session} — the first combat card (turn ${k}), as the player is about to see it\n\n\`\`\`\`text\n${screen}\n\`\`\`\`\n`);
  if (!wait) { log(`FIRST COMBAT CARD: ${session} t${k} — written to ${file}`); return true; }
  log(`PAUSED at the first combat card: ${session} t${k} — waiting for ${file}.go`);
  while (!existsSync(`${file}.go`)) await sleep(5000);
  log(`RESUMED: ${session} t${k}`);
  return true;
}
/** The player's message at that first combat card, appended to the same file once. */
export function firstCombatAnswer({ key: session, k, pressed }, { log = console.log } = {}) {
  if (!first || first.answered || first.session !== session || first.k !== k) return false;
  first.answered = true;
  writeFileSync(first.file, `${readFileSync(first.file, "utf8")}\n**The player's message at it:**\n\n\`\`\`\`text\n${pressed}\n\`\`\`\`\n`);
  log(`FIRST COMBAT ANSWER: ${session} t${k} — appended to ${first.file}`);
  return true;
}

// ---- the stage ------------------------------------------------------------------------------------------------------------

/** What a session is projected to cost, from what this stage's finished sessions actually cost on the ledgers (each
 * session plays in its own process, so the runner's in-process reading of finished sessions starts empty): the DM side
 * (everything of a session but its player's calls) and the scoring at the dearest so far, the player at its own cost
 * so far, or Opus's scaled by the list price (Fable ×2.5), else the frozen estimate. Never below the frozen estimate. */
export function estimateFromLedgers(dir = RUNS) {
  const calls = Object.keys(CAPS).flatMap((door) => { const file = join(dir, `${STEM}-ledger${ledgerSuffix(door)}.json`); return existsSync(file) ? (readJson(file).runs ?? []).flatMap((r) => r.calls ?? []) : []; });
  const isPlayer = (c) => /^(?:player|note|after)\b/.test(c.purpose ?? "");
  const sum = (rows) => rows.reduce((t, c) => t + (c.costUsd ?? 0), 0);
  const keys = ORDER.map(key);
  const dm = keys.map((k) => sum(calls.filter((c) => c.session === k && !isPlayer(c)))).filter((x) => x > 0);
  const scoring = keys.map((k) => sum(calls.filter((c) => c.session === `score ${k}`))).filter((x) => x > 0);
  const player = Object.fromEntries(ORDER.map((p) => [p, sum(calls.filter((c) => c.session === key(p) && isPlayer(c)))]).filter(([, x]) => x > 0));
  const scale = { fable: 2.5, opus: 1 };
  const playerOf = (p) => player[p] ?? (player.opus && scale[p] ? player.opus * scale[p] : ESTIMATE.player[p]);
  return { dm: Math.max(ESTIMATE.dm, ...dm), scoring: Math.max(ESTIMATE.scoring, ...scoring),
    player: Object.fromEntries(Object.keys(ESTIMATE.player).map((p) => [p, Math.max(ESTIMATE.player[p], playerOf(p) ?? 0)])) };
}

const SETUP = { heroDescription: heroDescription(), ...coastWay(), afterOpening: tamsinOnRecords };
export const COMBAT = {
  name: STAGE, stem: STEM, title: "Game player combat 1", caps: CAPS, get estimate() { return estimateFromLedgers(); }, tables: [TABLE], design: DESIGN_SHA256, waits429: WAITS_429,
  players: { [DRY_PLAYER.name]: DRY_PLAYER }, setup: SETUP, playerSystem: () => playerSystem(), afterPrep: exitsInPrep, onCard: (card) => pauseAtFirstCombatCard(card), onCardAnswer: (answer) => firstCombatAnswer(answer),
  plan: (only) => [...ORDER, DRY_PLAYER.name].map((player) => ({ key: key(player), table: TABLE, player })).filter((s) => (only ? only.includes(s.key) : ORDER.includes(s.player))),
  // One stage, one session per process: the stage's earlier refusals count (the second question is asked only while the
  // stage has none; the breaker stops at three). The judges' refusals are left out (scoring cannot gate a session).
  refusalsBefore: (before) => Object.values(before).flatMap((door) => door.runs ?? []).flatMap((r) => r.calls ?? []).filter((c) => c.refusal && !/^score /.test(c.session ?? "")).length,
  report: () => reportMarkdown(loadStage()), dryRun: (runRecord, ledgers) => dryRunMarkdown(runRecord, ledgers, { scripted: true }),
  verdicts: () => ({ note: "F0–F6 are read over all of this stage's run records, in the report" }),
  score: (runRecord, { meter, keys, log }) => scoreStage(runRecord, { meter, keys, log }),
  prereportSummary: "_The paid sessions have not started: this page holds the pre-registration F0–F6 (copied from the stage before the first paid call), how each line is read, the bets and the player's prompt. The results replace this line._",
};

/** This stage's scoring after game player 1's judges: the combat tags, the exit, the roll check on the fight's rolls. */
export async function scoreStage(runRecord, { meter, keys, log = () => {} }) {
  const ask = askWith({ meter, keys, log });
  const rolls = await import("../../src/lib/gameplay/dm-loop/roll-check.ts");
  for (const session of runRecord.sessions.filter((s) => s.turns)) {
    const asked = (args) => ask({ ...args, session: `score ${session.key}` });
    const rollCheck = (input, purpose) => meter.within({ session: `score ${session.key}`, purpose }, () => rolls.checkRollsTold(keys.anthropic, input));
    await scoreCombat(session, { ask: asked, rollCheck, log });
  }
}

// ---- reading the stage back ---------------------------------------------------------------------------------------------------

export const runFiles = (dir = RUNS) => (existsSync(dir) ? readdirSync(dir).filter((f) => new RegExp(`^${STEM}-run-\\d{8}-\\d{6}\\.json$`).test(f)).sort() : []);
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
/** Everything the report reads: the run records combined, the ledgers, the spend checks, the bets, the town baseline. */
export function loadStage(dir = RUNS) {
  const records = runFiles(dir).map((f) => ({ ...readJson(join(dir, f)), file: f }));
  const combined = combineRuns(records, COMBAT);
  const all = combined.sessions;
  combined.sessions = all.filter((s) => FINISHED.has(s.ended?.reason) && ORDER.includes(s.player));
  combined.dry = all.filter((s) => s.player === DRY_PLAYER.name);
  // Every cut attempt of the four, from every record (combineRuns keeps only the latest per session).
  combined.cut = records.flatMap((r) => (r.sessions ?? []).filter((s) => s.turns && ORDER.includes(s.player) && !FINISHED.has(s.ended?.reason))
    .map((s) => ({ key: s.key, turns: s.turns.length, why: s.ended?.detail ?? s.ended?.reason ?? "—", file: r.file })));
  const ledgers = {};
  for (const door of Object.keys(CAPS)) {
    const file = join(dir, `${STEM}-ledger${ledgerSuffix(door)}.json`);
    const saved = existsSync(file) ? readJson(file) : { runs: [] };
    ledgers[door] = createLedger(door, CAPS[door], 0);
    ledgers[door].calls.push(...(saved.runs ?? []).flatMap((r) => r.calls ?? []));
    ledgers[door].runs = (saved.runs ?? []).map((r) => ({ what: r.what, file: r.file, spentUsd: r.spentUsd ?? 0, calls: (r.calls ?? []).length, finishedAt: r.finishedAt }));
  }
  const spend = existsSync(SPEND_FILE) ? readJson(SPEND_FILE).checks ?? [] : [];
  const bets = existsSync(BETS_FILE) ? readJson(BETS_FILE) : null;
  const town = townBaseline(ROOT);
  const welfareStops = combined.sessions.filter((s) => ["welfare", "no-check"].includes(s.ended?.reason)).length;
  const distress = combined.sessions.flatMap((s) => s.welfare ?? []).filter((w) => w.verdict?.distress === 1).length;
  const verdicts = combined.sessions.some((s) => s.tags?.combat) ? combatVerdicts(combined.sessions, { refusals: combined.refusals, welfareStops, distress, town }) : null;
  if (existsSync(join(dir, `${STEM}-summary.md`))) combined.summary = readFileSync(join(dir, `${STEM}-summary.md`), "utf8").trim();
  // Before the first of the four sessions the page stays the pre-registration page.
  return { records, combined, ledgers, spend, bets, town, verdicts, prereport: combined.sessions.length ? null : COMBAT.prereportSummary };
}

async function writeJsonFile(file, value) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(`${file}.tmp`, `${JSON.stringify(value, null, 2)}\n`);
  await rename(`${file}.tmp`, file);
}

// ---- the spend check (replicate 1's) ---------------------------------------------------------------------------------------

/** One spend check, from free reads only: OpenRouter's key and credits (the account is shared with other sessions), and
 * this stage's ledgers by door. OpenAI's costs cannot be read with this key (no usage scope), so OpenAI is the ledger's.
 * Appended to SPEND_FILE. */
export async function spendCheck({ when = "check", fetcher = globalThis.fetch.bind(globalThis), log = console.log } = {}) {
  const { providerKey } = await import("../eval/lib/keys.mjs");
  const { anthropicEndpoint, scriptDoorEnv } = await import("../eval/lib/anthropic-endpoint.mjs");
  const openrouter = anthropicEndpoint(scriptDoorEnv((name) => (name === "ANTHROPIC_PROVIDER" ? "openrouter" : providerKey(name))));
  const apiKey = openrouter.apiKey || null;
  const read = async (path) => {
    try { const r = await fetcher(`${openrouter.baseUrl}/v1/${path}`, { headers: { authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(30_000) }); return r.ok ? (await r.json()).data ?? null : { error: `HTTP ${r.status}` }; }
    catch (error) { return { error: String(error?.message ?? error).slice(0, 120) }; }
  };
  const [k, credits] = apiKey ? await Promise.all([read("key"), read("credits")]) : [{ error: "no key" }, { error: "no key" }];
  const { before } = await stageLedgers(COMBAT);
  const ledgers = Object.fromEntries(Object.keys(CAPS).map((door) => [door, { spent: Math.round((before[door].spentUsd ?? 0) * 10000) / 10000, cap: CAPS[door] }]));
  const check = { at: new Date().toISOString(), when, openrouter: { keyUsage: k?.usage ?? null, totalCredits: credits?.total_credits ?? null, totalUsage: credits?.total_usage ?? null,
    remaining: Number.isFinite(credits?.total_credits) && Number.isFinite(credits?.total_usage) ? Math.round((credits.total_credits - credits.total_usage) * 100) / 100 : null, error: k?.error ?? credits?.error ?? null }, ledgers };
  const previous = existsSync(SPEND_FILE) ? readJson(SPEND_FILE).checks ?? [] : [];
  await writeJsonFile(SPEND_FILE, { note: "Spend checks: OpenRouter's account (shared with other sessions on the same key) and this stage's ledgers.", checks: [...previous, check] });
  log(`spend (${when}): OpenRouter account used $${check.openrouter.totalUsage ?? "?"} of $${check.openrouter.totalCredits ?? "?"} credits (left $${check.openrouter.remaining ?? "?"}) · ledgers ${Object.entries(ledgers).map(([d, l]) => `${DOOR_LABELS[d] ?? d} $${l.spent.toFixed(2)}/$${l.cap}`).join(" · ")}`);
  return check;
}

// ---- the driver: the order, one session per process -----------------------------------------------------------------------

const finishedKeys = () => new Set(runFiles().flatMap((f) => (readJson(join(RUNS, f)).sessions ?? []).filter((s) => s.turns && FINISHED.has(s.ended?.reason)).map((s) => s.key)));
/** Plays the given keys in order, one child process each, with a spend check before the first and after every session.
 * Stops on a stop in a run (a cap, 402, a quota 429 or a seventh rate-limit 429, the refusal breaker), a crash, a welfare
 * stop, or an OpenRouter account with less left than one session's projection. */
export async function drive({ keys, args = (k) => ["--go", "--sessions", k, "--label", k], env = () => ({}), projected = (k) => { const e = estimateFromLedgers(); return e.dm + e.scoring + (e.player[k.split("-")[1]] ?? 3); }, log = console.log }) {
  log(`the order: ${keys.join(", ")}`);
  let check = await spendCheck({ when: `before ${keys[0] ?? "nothing"}`, log });
  for (const entry of keys) {
    if (check?.openrouter?.remaining !== null && check?.openrouter?.remaining !== undefined && check.openrouter.remaining < projected(entry) + 5) { log(`STOP: OpenRouter's account has $${check.openrouter.remaining} left, under one session's projection`); return { stopped: "credits" }; }
    const startedAt = new Date().toISOString();
    log(`${startedAt.slice(11, 19)} start ${entry}`);
    const code = await child(args(entry), env(entry));
    const record = runFiles().map((f) => ({ f, r: readJson(join(RUNS, f)) })).filter(({ r }) => r.startedAt >= startedAt && (r.plan ?? []).includes(entry)).at(-1) ?? null;
    const session = record?.r.sessions?.find((s) => s.key === entry) ?? null;
    check = await spendCheck({ when: `after ${entry}`, log });
    log(`${new Date().toISOString().slice(11, 19)} done ${entry}: ${session?.turns ? `${session.turns.length} turns, ended by ${session.ended?.reason}${session.note?.text ? ", note recorded" : ""}` : `no session (exit ${code})`} · ${Object.entries(check.ledgers).map(([d, l]) => `${DOOR_LABELS[d] ?? d} $${l.spent.toFixed(2)}`).join(" · ")}`);
    for (const [door, l] of Object.entries(check.ledgers)) if (l.cap > 0 && l.cap - l.spent <= Math.min(15, l.cap / 5)) log(`CAP: ${DOOR_LABELS[door] ?? door} is within $${Math.min(15, l.cap / 5)} of its $${l.cap} cap ($${l.spent.toFixed(2)} spent)`);
    if (!record || code !== 0) { log(`STOP: ${entry} exited ${code}${record ? "" : " without a run record"}`); return { stopped: "exit" }; }
    if (record.r.stopped) { log(`STOP: ${record.r.stopped}`); return { stopped: record.r.stopped }; }
    if (record.r.undone?.length) { log(`STOP: ${entry} left undone (${record.r.undone.map((u) => u.why).join("; ")})`); return { stopped: "undone" }; }
    if (!session?.turns) { log(`STOP: ${entry} crashed (${String(session?.crashed ?? "no record").split("\n")[0].slice(0, 200)})`); return { stopped: "crash" }; }
    if (["welfare", "no-check"].includes(session.ended?.reason)) { log(`STOP: a welfare stop in ${entry} (${session.ended.detail})`); return { stopped: "welfare" }; }
  }
  log("the order is done");
  return { stopped: null };
}
function child(args, extra = {}) {
  return new Promise((done) => {
    const p = spawn(process.execPath, ["--experimental-transform-types", fileURLToPath(import.meta.url), ...args], { cwd: ROOT, env: { ...process.env, NODE_USE_ENV_PROXY: "1", ...extra }, stdio: ["ignore", "inherit", "inherit"] });
    p.on("close", (code) => done(code ?? 1));
  });
}

// ---- outputs ----------------------------------------------------------------------------------------------------------------

/** The report and the transcripts of every finished session again, from the records (no call). */
export async function rebuildAll() {
  const stage = loadStage();
  const dir = join(RUNS, `${STEM}-transcripts`);
  await mkdir(dir, { recursive: true });
  for (const session of stage.combined.sessions) await writeFile(join(dir, `${session.key}.md`), transcriptMarkdown(session));
  // A cut attempt keeps its own transcript (the session file is the finished one's).
  for (const record of stage.records) for (const session of (record.sessions ?? []).filter((s) => s.turns && ORDER.includes(s.player) && !FINISHED.has(s.ended?.reason)))
    await writeFile(join(dir, `cut-${session.key}-t${session.turns.length}.md`), transcriptMarkdown(session));
  for (const session of stage.combined.dry ?? []) await writeFile(join(dir, `dry-${session.key}.md`), transcriptMarkdown(session));
  await writeFile(join(RUNS, `${STEM}-report.md`), reportMarkdown(stage));
  const dry = stage.records.filter((r) => (r.plan ?? []).includes(DRY_KEY)).at(-1);
  if (dry) await writeFile(join(RUNS, `${STEM}-dry-run.md`), dryRunMarkdown(dry, stage.ledgers, { spend: stage.spend }));
}

function argsOf(argv) {
  const value = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null; };
  return { dry: argv.includes("--dry"), dryHaiku: argv.includes("--dry-haiku"), go: argv.includes("--go"), drive: argv.includes("--drive"), prereport: argv.includes("--prereport"),
    spend: argv.includes("--spend"), rebuild: argv.includes("--report"), score: !argv.includes("--no-score"), only: value("--sessions")?.split(",") ?? null, from: value("--from"),
    turns: Number(value("--turns") ?? 0) || null, label: value("--label"), pauseFile: value("--pause-file"), pauseAt: value("--pause-at") ?? `${TABLE}-opus`, cardDir: value("--card-dir") };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = argsOf(process.argv.slice(2));
  const done = (p) => p.then(() => process.exit(0), (error) => { console.error(`${STEM}: ${error?.stack ?? error}`); process.exit(1); });
  if (a.rebuild) done(rebuildAll());
  else if (a.prereport) done(writeFile(join(RUNS, `${STEM}-report.md`), reportMarkdown({ ...loadStage(), prereport: COMBAT.prereportSummary })));
  else if (a.spend) done(spendCheck({ when: "by hand" }));
  else if (a.dry) done(run({ stage: COMBAT, dry: true, only: [key("opus")], turns: a.turns ?? 3, lanes: 1, fetcher: scriptedFetcher(), label: "the scripted dry run" }).then((r) => console.log(`scripted dry run: ${r.sessions.length} session(s)`)));
  else if (a.dryHaiku) done(drive({ keys: [DRY_KEY], args: () => ["--go", "--sessions", DRY_KEY, "--turns", String(a.turns ?? DRY_TURNS), "--label", "the dry run (Claude Haiku 5.5 as the player)"], projected: () => 6 }).then(rebuildAll));
  else if (a.drive) {
    const done1 = finishedKeys();
    const start = a.from ? ORDER.indexOf(a.from.replace(`${TABLE}-`, "")) : 0;
    if (start < 0) { console.error(`no session ${a.from} in the order`); process.exit(2); }
    // The owner's pause: only the session named by --pause-at (Opus) gets the pause file.
    const env = (k) => (a.pauseFile && k === a.pauseAt ? { COMBAT_PAUSE_FILE: resolve(a.pauseFile) } : a.cardDir ? { COMBAT_CARD_FILE: join(resolve(a.cardDir), `${k}-first-combat-card.md`) } : {});
    done(drive({ keys: ORDER.slice(start).map(key).filter((k) => !done1.has(k)), env }).then(async (r) => { await rebuildAll(); if (r.stopped) process.exitCode = 3; }));
  } else if (a.go) {
    if (!a.only || a.only.length !== 1) { console.error("--go plays one session at a time: give --sessions <key> (the driver gives the order)"); process.exit(2); }
    done(run({ stage: COMBAT, only: a.only, turns: a.turns ?? TURNS, lanes: 1, score: a.score, label: a.label }).then(async (r) => {
      console.log(`finished: ${r.sessions.length} session(s), undone ${r.undone.length}, stopped ${r.stopped ?? "no"}`);
      await rebuildAll();
    }));
  } else { console.error("give --dry, --dry-haiku, --prereport, --spend, --drive, --go --sessions <key> or --report"); process.exit(2); }
}

export { PLAYERS };
