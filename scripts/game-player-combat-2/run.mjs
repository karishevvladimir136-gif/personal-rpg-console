#!/usr/bin/env node
// Game player combat 2 (docs/stages/GAME_PLAYER_COMBAT_2.md): COMBAT_1's Coast Way with the hidden layer prepared once and
// frozen (SAME_WORLD_1's mechanism), then four players from the same snapshot, one session per process, with a spend
// check before the first paid call and after every session. Run node with NODE_USE_ENV_PROXY=1 in the cloud.
//   node --experimental-transform-types scripts/game-player-combat-2/run.mjs --dry           scripted: the freeze into a temp folder and one
//                                                                                          session from it (no key, no call)
//   node --experimental-transform-types scripts/game-player-combat-2/run.mjs --spend         one spend check (free reads), logged
//   node --experimental-transform-types scripts/game-player-combat-2/run.mjs --freeze        the spend check, then the wizard and the prep, once
//                                                                                          (paid): docs/runs/game-player-combat-2-frozen/
//   node --experimental-transform-types scripts/game-player-combat-2/run.mjs --dry-haiku     the dry run the owner asked for: Claude Haiku 5.5
//                                                                                          as the player at the real DM, from the frozen
//                                                                                          world, DRY_TURNS turns → …-dry-run.md
//   node --experimental-transform-types scripts/game-player-combat-2/run.mjs --drive [--from CW-fable]   the four in order
//   node --experimental-transform-types scripts/game-player-combat-2/run.mjs --go --sessions CW-opus     one session (the driver's step)
//   node --experimental-transform-types scripts/game-player-combat-2/run.mjs --combat-1     the fork strip, the captive and the note passes on
//                                                                                          COMBAT_1's four sessions (paid, small)
//   node --experimental-transform-types scripts/game-player-combat-2/run.mjs --report        the report and transcripts again (no call)
// Caps: $70 OpenRouter, $15 OpenAI, $0 on the Console. HTTP 402 and a quota 429 stop the run; a rate-limit 429 waits six
// times at most, then the run stops; a session whose projection does not fit under a cap is not started.
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DOOR_LABELS, RUNS, combineRuns, ledgerSuffix, run, runKeys, stageLedgers } from "../game-player-1/run.mjs";
import { createLedger, createMeter, ledgerMarkdown } from "../game-player-1/paid.mjs";
import { scriptedFetcher, defaultJudge, defaultPlayer } from "../game-player-1/scripted.mjs";
import { askWith } from "../game-player-2/run.mjs";
import { exitsInPrep, tamsinOnRecords } from "../game-player-combat-1/run.mjs";
import { CAPS, COMBAT_1, DESIGN_SHA256, DRY_PLAYER, DRY_TURNS, ESTIMATE, LAYER_AMENDMENT, LAYER_SYSTEM, ORDER, STAGE, STEM, TABLE, THIRD_QUESTION, TURNS, WAITS_429, coastWay, heroDescription, playerSystem } from "./frozen.mjs";
import { MANIFEST, SNAPSHOT, canonical, captiveNames, freezeWorld, frozenStarter, layerFile, layerMarkdown, layerRequest, layerSha256, oneCaptive, openFrozenDatabase, parseLayerReading, privateStateOf, readFrozen, storedOf } from "./world.mjs";
import { scoreCombat2, scoreForks, stageVerdicts } from "./score.mjs";
import { dryRunMarkdown, reportMarkdown, transcriptOf } from "./report.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const FROZEN_DIR = join(RUNS, `${STEM}-frozen`);
export const SPEND_FILE = join(RUNS, `${STEM}-spend.json`);
export const COMBAT1_TAGS = join(RUNS, `${STEM}-combat-1-tags.json`);
export const key = (player) => `${TABLE}-${player}`;
export const DRY_KEY = key(DRY_PLAYER.name);
/** The finished ends of a session (COMBAT_1's): a cut attempt is kept in its record and played again. */
export const FINISHED = new Set(["turns", "player", "stuck", "welfare", "no-check", "refusal"]);
/** A played session: a finished end, or (the owner, 2026-10-29: «no retries after a refusal») a DM turn that failed after
 * a refusal — counted as played, never played again. */
export const played = (s) => FINISHED.has(s?.ended?.reason) || (s?.ended?.reason === "error" && /after a refusal/.test(s.ended.detail ?? ""));
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
async function writeJsonFile(file, value) { await mkdir(dirname(file), { recursive: true }); await writeFile(`${file}.tmp`, `${JSON.stringify(value, null, 2)}\n`); await rename(`${file}.tmp`, file); }
export const screenSha256 = (session) => (session.screens?.[0] ? createHash("sha256").update(session.screens[0]).digest("hex") : null);

// ---- the stage, as game player 1's run takes it ---------------------------------------------------------------------

export const SETUP = { heroDescription: heroDescription(), ...coastWay(), afterOpening: tamsinOnRecords };
export function stageOf({ dir = FROZEN_DIR, plan = null } = {}) {
  return {
    name: STAGE, stem: STEM, title: "Game player combat 2", caps: CAPS, estimate: ESTIMATE, tables: [TABLE], design: DESIGN_SHA256, waits429: WAITS_429,
    players: { [DRY_PLAYER.name]: DRY_PLAYER }, playerSystem: () => playerSystem(),
    plan: plan ?? ((only) => [...ORDER, DRY_PLAYER.name].map((player) => ({ key: key(player), table: TABLE, player })).filter((s) => (only ? only.includes(s.key) : ORDER.includes(s.player)))),
    database: () => openFrozenDatabase(dir),
    campaign: frozenStarter(dir),
    // The owner's word of 2026-10-29: welfare ask-don't-cut; the three after-questions.
    welfareMode: "ask", moreAfter: [THIRD_QUESTION],
    afterPrep: exitsInPrep,
    transcript: (session) => transcriptOf(session, { dir }),
    // One stage, one session per process: the stage's earlier refusals count (the judges' and the freeze's left out).
    refusalsBefore: (before) => Object.values(before).flatMap((door) => door.runs ?? []).flatMap((r) => r.calls ?? []).filter((c) => c.refusal && !/^(?:score|freeze|C1) /.test(c.session ?? "")).length,
    report: () => reportMarkdown(loadStage()), dryRun: (runRecord, ledgers) => dryRunMarkdown({ records: [runRecord], ledgers, dir, scripted: true }),
    verdicts: () => ({ note: "G0–G5 are read over all of this stage's run records, in the report" }),
    score: (runRecord, { meter, keys, log }) => scoreStage(runRecord, { meter, keys, log }),
  };
}

export async function scoreStage(runRecord, { meter, keys, log = () => {} }) {
  const ask = askWith({ meter, keys, log });
  const rolls = await import("../../src/lib/gameplay/dm-loop/roll-check.ts");
  for (const session of runRecord.sessions.filter((s) => s.turns)) {
    session.openingSha256 = screenSha256(session);
    const asked = (args) => ask({ ...args, session: `score ${session.key}` });
    const rollCheck = (input, purpose) => meter.within({ session: `score ${session.key}`, purpose }, () => rolls.checkRollsTold(keys.anthropic, input));
    await scoreCombat2(session, { ask: asked, rollCheck, log });
  }
}

// ---- reading the stage back ------------------------------------------------------------------------------------------

export const runFiles = (stem = STEM, dir = RUNS) => (existsSync(dir) ? readdirSync(dir).filter((f) => new RegExp(`^${stem}-run-\\d{8}-\\d{6}\\.json$`).test(f)).sort() : []);
/** COMBAT_1's four finished sessions with this stage's passes on them (the side file), never changing its records. */
export function loadCombat1(dir = RUNS) {
  const side = existsSync(COMBAT1_TAGS) ? readJson(COMBAT1_TAGS).sessions ?? {} : {};
  return COMBAT_1.files.filter((f) => existsSync(join(dir, f))).flatMap((f) => readJson(join(dir, f)).sessions ?? [])
    .filter((s) => s.turns && played(s) && ORDER.includes(s.player)).map((s) => ({ ...s, tags: { ...s.tags, combat2: side[s.key] ?? {} } }));
}
export function loadStage({ dir = FROZEN_DIR } = {}) {
  const records = runFiles().map((f) => ({ ...readJson(join(RUNS, f)), file: f }));
  const stage = stageOf({ dir });
  const combined = combineRuns(records, stage);
  const all = combined.sessions;
  combined.sessions = all.filter((s) => played(s) && ORDER.includes(s.player));
  combined.dry = all.filter((s) => s.player === DRY_PLAYER.name);
  combined.cut = records.flatMap((r) => (r.sessions ?? []).filter((s) => s.turns && ORDER.includes(s.player) && !played(s))
    .map((s) => ({ key: s.key, turns: s.turns.length, why: s.ended?.detail ?? s.ended?.reason ?? "—", file: r.file })));
  const ledgers = {};
  for (const door of Object.keys(CAPS)) {
    const file = join(RUNS, `${STEM}-ledger${ledgerSuffix(door)}.json`);
    const saved = existsSync(file) ? readJson(file) : { runs: [] };
    ledgers[door] = createLedger(door, CAPS[door], 0);
    ledgers[door].calls.push(...(saved.runs ?? []).flatMap((r) => r.calls ?? []));
    ledgers[door].runs = (saved.runs ?? []).map((r) => ({ what: r.what, file: r.file, spentUsd: r.spentUsd ?? 0, calls: (r.calls ?? []).length, finishedAt: r.finishedAt }));
  }
  const spend = existsSync(SPEND_FILE) ? readJson(SPEND_FILE).checks ?? [] : [];
  let frozen = null;
  try { frozen = readFrozen(dir); } catch { frozen = null; }
  const names = frozen ? captiveNames(frozen.file.reading) : [];
  const welfareStops = combined.sessions.filter((s) => ["welfare", "no-check"].includes(s.ended?.reason)).length;
  const distress = combined.sessions.flatMap((s) => s.welfare ?? []).filter((w) => w.verdict?.distress === 1).length;
  const verdicts = combined.sessions.some((s) => s.tags?.combat2) ? stageVerdicts(combined.sessions, { refusals: combined.refusals, welfareStops, distress, captiveNames: names }) : null;
  if (existsSync(join(RUNS, `${STEM}-summary.md`))) combined.summary = readFileSync(join(RUNS, `${STEM}-summary.md`), "utf8").trim();
  let combat1 = [];
  try { combat1 = loadCombat1(); } catch { combat1 = []; }
  return { records, combined, ledgers, spend, frozen, verdicts, combat1, captiveNames: names, dir };
}

// ---- the ledgers of a pass outside game player 1's run (the freeze, COMBAT_1's passes) --------------------------------

async function bookRun(ledgers, before, { what, file, stopped }) {
  const finishedAt = new Date().toISOString();
  for (const door of Object.keys(ledgers)) {
    if (!ledgers[door].calls.length) continue;
    const suffix = ledgerSuffix(door);
    const runs = [...(before[door].runs ?? []), { finishedAt, file, what, spentUsd: ledgers[door].runUsd, stopped, calls: ledgers[door].calls }];
    await writeJsonFile(join(RUNS, `${STEM}-ledger${suffix}.json`), { capUsd: CAPS[door], spentUsd: (before[door].spentUsd ?? 0) + ledgers[door].runUsd, updatedAt: finishedAt, runs });
    const all = createLedger(door, CAPS[door], 0);
    all.calls.push(...runs.flatMap((r) => r.calls ?? []));
    await writeFile(join(RUNS, `${STEM}-ledger${suffix}.md`), ledgerMarkdown(all, `Game player combat 2 — the ${DOOR_LABELS[door] ?? door} ledger`));
  }
}

// ---- the freeze -------------------------------------------------------------------------------------------------------

/** The scripted providers for this stage's dry run and tests: game player 1's, with the layer's reading answered. */
export function combat2Scripted({ captive = "Wren Ashby", ...rest } = {}) {
  const inner = scriptedFetcher({ player: rest.player ?? defaultPlayer, judge: rest.judge ?? defaultJudge, log: rest.log ?? [] });
  return async (url, init = {}) => {
    let body = {};
    try { body = JSON.parse(String(init.body ?? "{}")); } catch { body = {}; }
    const system = Array.isArray(body.system) ? body.system.map((b) => b.text ?? "").join("\n") : String(body.system ?? "");
    if (system !== LAYER_SYSTEM) return inner(url, init);
    const text = JSON.stringify({ band: [{ name: "Grukk", role: "war chief" }], chief: "Grukk", captives: captive ? [{ name: captive, who: "a carter's daughter", why_held: "ransom" }] : [],
      chief_takes: "the cart's goods and a toll", if_one_dies: "they want blood-price", goods: "two sacks of silver", exits: { fight: 1, withdraw: 1, parley: 1, surrender: 1 } });
    return new Response(JSON.stringify({ id: "msg_scripted_layer", type: "message", role: "assistant", model: body.model, content: [{ type: "text", text }], stop_reason: "end_turn",
      usage: { input_tokens: 1000, cache_read_input_tokens: 0, cache_creation_input_tokens: 0, output_tokens: 20 } }), { status: 200, headers: { "content-type": "application/json", "request-id": "req_scripted_layer" } });
  };
}

/** The wizard and the prep, once: the frozen Coast Way in `dir`. `dry`: scripted providers (no call, nothing booked). */
export async function freeze({ dir = FROZEN_DIR, dry = false, log = console.log, fetcher = null } = {}) {
  if (!dry && existsSync(join(dir, "manifest.json"))) throw new Error(`${dir} already holds a frozen world: it is prepared once (move it aside to prepare again)`);
  const keys = dry ? { anthropic: "sk-scripted", openai: "sk-scripted", door: null } : await runKeys();
  if (!keys.anthropic) throw new Error(`${keys.keyName} must be set (its APP_ variable)`);
  const caps = dry ? Object.fromEntries(Object.keys(CAPS).map((d) => [d, 1000])) : CAPS;
  const { before, ledgers } = await stageLedgers({ stem: STEM, caps }, { dry });
  const meter = createMeter({ ledgers, fetcher: fetcher ?? (dry ? combat2Scripted() : globalThis.fetch.bind(globalThis)), log, waits429: WAITS_429 });
  const uninstall = meter.install();
  const { openApp, settleBackground } = await import("../game-player-1/app.mjs");
  const app = await openApp({ keys, fake: false });
  const by = dry ? "the scripted DM (dry run)" : `the owner's DM settings (Claude Opus 5.5, the prep at high) through ${keys.door?.provider ?? "the Claude Console"}`;
  let manifest = null, failure = null;
  try {
    manifest = await freezeWorld({ app, meter, dir, setup: SETUP, ask: askWith({ meter, keys, log }), log, by, settle: () => settleBackground() });
    await settleBackground();
  } catch (error) { failure = error; }
  finally {
    await meter.drain();
    await app.close().catch(() => {});
    uninstall();
    if (!dry) await bookRun(ledgers, before, { what: failure ? `the freeze — failed: ${String(failure?.message ?? failure).slice(0, 160)}` : "the freeze (the wizard, the opening, Tamsin, the prep once, the layer's reading)", file: `${STEM}-frozen/manifest.json`, stopped: meter.stopped });
  }
  if (failure) throw failure;
  log(`frozen: ${manifest.tables[TABLE].layer.sha256} · captive ${manifest.tables[TABLE].layer.captive ?? "none"} (one captive: ${manifest.tables[TABLE].layer.oneCaptive ? "yes" : "NO"}) · ${Object.entries(ledgers).map(([d, l]) => `${DOOR_LABELS[d] ?? d} $${l.runUsd.toFixed(3)}`).join(" · ")}`);
  return manifest;
}

// ---- the owner's amendment to the frozen layer (once, before the first player session) -------------------------------

/** The paragraph appended to the frozen layer once: the DM-only file re-frozen with a new sha256 (the first freeze kept
 * beside it as -v1), its stored form taken from the app's own private-notes call on the snapshot (no model call), the
 * layer read again (one paid pass), the manifest naming both hashes. The snapshot is taken before any prep and holds no
 * layer, so it is unchanged; the opening is checked byte for byte against the dry run's on scripted providers. */
export async function amendLayer({ dir = FROZEN_DIR, dry = false, log = console.log } = {}) {
  const { manifest, file } = readFrozen(dir);
  if (file.amendment) throw new Error(`the layer was already amended (${file.amendment.previousSha256.slice(0, 12)}… → ${file.sha256.slice(0, 12)}…): it is amended once`);
  const writes = file.writes.map((w) => (w.kind === "fact" && w.key === "hidden_layer" ? { ...w, value: `${w.value}\n${LAYER_AMENDMENT}` } : w));
  if (canonical(writes) === canonical(file.writes)) throw new Error("the frozen file has no hidden_layer note to amend");
  // The stored form, by the app's own call on a copy of the snapshot loaded in memory (the snapshot file is not touched).
  const keys = { anthropic: "sk-scripted", openai: "sk-scripted", door: null };
  const { openApp } = await import("../game-player-1/app.mjs");
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("no model call while the amendment is stored"); };
  let layer, stored;
  try {
    const app = await openApp({ keys, fake: false, database: () => openFrozenDatabase(dir) });
    const cid = manifest.tables[TABLE].campaignId;
    const dossier = await app.server.dossier.dossierService(app.owner, cid);
    const source = await dossier.source();
    await dossier.privateNotes({ set: writes, remove: [] }, source.timeline);
    const state = await privateStateOf(app, cid);
    layer = app.lib.privateNotes.hiddenLayerOf({ privateState: state });
    stored = storedOf(state, writes);
    await app.close().catch(() => {});
  } finally { globalThis.fetch = realFetch; }
  if (!layer.endsWith(LAYER_AMENDMENT) || !layer.startsWith(file.layer)) throw new Error("the amended layer is not the frozen layer with the paragraph after it");
  // The layer read again (one paid pass, or scripted).
  const { before, ledgers } = await stageLedgers({ stem: STEM, caps: dry ? Object.fromEntries(Object.keys(CAPS).map((d) => [d, 1000])) : CAPS }, { dry });
  const meter = createMeter({ ledgers, fetcher: dry ? combat2Scripted() : realFetch.bind(globalThis), log, waits429: WAITS_429 });
  const uninstall = meter.install();
  let reading = null;
  try {
    const ask = askWith({ meter, keys: dry ? keys : await runKeys(), log });
    const r = await ask({ session: `freeze ${TABLE}`, model: "claude-opus-5-5", ...layerRequest(layer), maxTokens: 12000, effort: "low", purpose: "the amended layer's reading" });
    reading = r.notSent ? null : parseLayerReading(r.text);
    await meter.drain();
  } finally { uninstall(); }
  if (!dry) await bookRun(ledgers, before, { what: "the owner's amendment: the amended layer's reading (one pass)", file: `${STEM}-frozen/${MANIFEST}`, stopped: meter.stopped });
  if (!oneCaptive(reading)) throw new Error("the amended layer's reading does not find one captive with one name: not amended");
  const at = new Date().toISOString();
  const amended = { ...file, layer, writes, stored, reading, oneCaptive: oneCaptive(reading),
    amendment: { at, by: "Claude Code on the owner's word (2026-10-29): one short DM-only paragraph, nothing else changed", paragraph: LAYER_AMENDMENT, previousSha256: file.sha256, previousFile: "CW-dm-only-v1.json" } };
  amended.sha256 = layerSha256(amended);
  // History: the first freeze kept beside, then the amended file in its place.
  copyFileSync(join(dir, layerFile()), join(dir, "CW-dm-only-v1.json"));
  copyFileSync(join(dir, "CW-dm-only.md"), join(dir, "CW-dm-only-v1.md"));
  await writeFile(join(dir, `${layerFile()}.tmp`), `${JSON.stringify(amended, null, 2)}\n`);
  await rename(join(dir, `${layerFile()}.tmp`), join(dir, layerFile()));
  await writeFile(join(dir, "CW-dm-only.md"), layerMarkdown(amended, manifest));
  manifest.tables[TABLE].layer = { ...manifest.tables[TABLE].layer, sha256: amended.sha256, chars: layer.length, oneCaptive: amended.oneCaptive, captive: reading.captives[0].name };
  manifest.amendments = [...(manifest.amendments ?? []), { at, what: "the owner's paragraph appended to the hidden layer (the death of the first orc; withdrawal; surrender)", from: file.sha256, to: amended.sha256, snapshot: `${SNAPSHOT} unchanged (sha256 ${manifest.snapshot.sha256}): taken before the prep, it holds no layer` }];
  await writeJsonFile(join(dir, MANIFEST), manifest);
  log(`amended: ${file.sha256} → ${amended.sha256} (${file.layer.length} → ${layer.length} characters); captive ${reading.captives[0].name}`);
  return { from: file.sha256, to: amended.sha256 };
}

/** The opening with the amended layer in place, on scripted providers (no call): Screen 1's sha256 against the dry run's. */
export async function checkOpening({ dir = FROZEN_DIR, log = console.log } = {}) {
  const dryRecord = runFiles().map((f) => readJson(join(RUNS, f))).find((r) => (r.plan ?? []).includes(DRY_KEY));
  const want = dryRecord ? screenSha256(dryRecord.sessions.find((s) => s.key === DRY_KEY)) : null;
  const out = join(tmpdir(), `${STEM}-opening-${Date.now()}`);
  await mkdir(out, { recursive: true });
  const plan = () => [{ key: key("opus"), table: TABLE, player: "opus" }];
  const record = await run({ stage: stageOf({ dir, plan }), dry: true, turns: 1, lanes: 1, score: false, fetcher: combat2Scripted(), out, log: () => {}, label: "the opening check (scripted)" });
  const got = screenSha256(record.sessions[0]);
  const layer = record.sessions[0].campaign?.prep?.layerSha256 ?? null;
  log(`opening: ${got} with layer ${layer} — the dry run's ${want}: ${got === want ? "byte-identical" : "DIFFERENT"}`);
  return { got, want, same: got === want, layer };
}

// ---- COMBAT_1's four, read the same way (paid, small) ------------------------------------------------------------------

export async function combat1Passes({ log = console.log } = {}) {
  const keys = await runKeys();
  const { before, ledgers } = await stageLedgers({ stem: STEM, caps: CAPS });
  const meter = createMeter({ ledgers, fetcher: globalThis.fetch.bind(globalThis), log, waits429: WAITS_429 });
  const uninstall = meter.install();
  const out = existsSync(COMBAT1_TAGS) ? readJson(COMBAT1_TAGS) : { note: "This stage's passes (the fork strip, the captive and the goods, the note's goods line) on COMBAT_1's four finished sessions; COMBAT_1's own records are unchanged.", sessions: {} };
  try {
    const ask = askWith({ meter, keys, log });
    for (const session of loadCombat1()) {
      if (meter.stopped) break;
      out.sessions[session.key] = await scoreForks(session, out.sessions[session.key] ?? {}, { ask: (args) => ask({ ...args, session: `C1 ${session.key}` }), log });
      await writeJsonFile(COMBAT1_TAGS, { ...out, taggedAt: new Date().toISOString() });
    }
    await meter.drain();
  } finally { uninstall(); }
  await bookRun(ledgers, before, { what: "COMBAT_1's four: the fork strip, the captive and the goods, the note's goods line", file: `${STEM}-combat-1-tags.json`, stopped: meter.stopped });
  log(`COMBAT_1's passes: ${Object.keys(out.sessions).length} session(s) · ${Object.entries(ledgers).map(([d, l]) => `${DOOR_LABELS[d] ?? d} $${l.runUsd.toFixed(2)}`).join(" · ")}${meter.stopped ? ` · STOPPED: ${meter.stopped}` : ""}`);
}

// ---- the spend check and the fit --------------------------------------------------------------------------------------

/** One spend check from free reads: OpenRouter's key and credits (the account is shared with other sessions) and this
 * stage's ledgers by door. OpenAI's spend is the ledger's (no usage scope on the key). Appended to SPEND_FILE. */
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
  const { before } = await stageLedgers({ stem: STEM, caps: CAPS });
  const ledgers = Object.fromEntries(Object.keys(CAPS).map((door) => [door, { spent: Math.round((before[door].spentUsd ?? 0) * 10000) / 10000, cap: CAPS[door] }]));
  const check = { at: new Date().toISOString(), when, openrouter: { keyUsage: k?.usage ?? null, keyLimitRemaining: k?.limit_remaining ?? null, totalCredits: credits?.total_credits ?? null, totalUsage: credits?.total_usage ?? null,
    remaining: Number.isFinite(credits?.total_credits) && Number.isFinite(credits?.total_usage) ? Math.round((credits.total_credits - credits.total_usage) * 100) / 100 : null, error: k?.error ?? credits?.error ?? null }, ledgers };
  const previous = existsSync(SPEND_FILE) ? readJson(SPEND_FILE).checks ?? [] : [];
  await writeJsonFile(SPEND_FILE, { note: "Spend checks: OpenRouter's account (shared with other sessions on the same key) and this stage's ledgers.", checks: [...previous, check] });
  log(`spend (${when}): OpenRouter account used $${check.openrouter.totalUsage ?? "?"} of $${check.openrouter.totalCredits ?? "?"} credits (left $${check.openrouter.remaining ?? "?"}) · ledgers ${Object.entries(ledgers).map(([d, l]) => `${DOOR_LABELS[d] ?? d} $${l.spent.toFixed(2)}/$${l.cap}`).join(" · ")}`);
  return check;
}

const isPlayerCall = (c) => /^(?:player|note|after)\b/.test(c.purpose ?? "");
const sum = (calls) => calls.reduce((s, c) => s + (c.costUsd ?? 0), 0);
/** COMBAT_1's cost of a player's session with its scoring, by door (its ledgers on this branch), split into the player's
 * own calls and the rest (the DM side, its wizard and prep, the checks, the scoring). */
export function combat1Cost(player) {
  const out = {};
  for (const door of ["openrouter", "openai"]) {
    const file = join(RUNS, `${COMBAT_1.stem}-ledger${ledgerSuffix(door)}.json`);
    if (!existsSync(file)) continue;
    const calls = (readJson(file).runs ?? []).filter((r) => COMBAT_1.files.includes(r.file)).flatMap((r) => r.calls ?? []).filter((c) => [key(player), `score ${key(player)}`].includes(c.session));
    out[door] = { player: sum(calls.filter(isPlayerCall)), rest: sum(calls.filter((c) => !isPlayerCall(c) && !["wizard", "prep"].includes(c.purpose))) };
  }
  return out;
}
/** Before a session starts: its projected cost by door — the DM side and scoring (the dearest of COMBAT_1's same session
 * without its wizard and prep, and of this stage's finished sessions) plus the player's own calls on its door (COMBAT_1's
 * same player, else the estimate) — plus a $3 margin, against what each cap has left. A session that does not fit is
 * not started (never cut mid-session by a cap it was projected to cross). */
export async function sessionFits(entry, { log = console.log } = {}) {
  const { before } = await stageLedgers({ stem: STEM, caps: CAPS });
  const player = entry.split("-")[1];
  const c1 = combat1Cost(player);
  const dmHere = (door) => {
    const by = {};
    for (const call of (before[door].runs ?? []).flatMap((r) => r.calls ?? [])) {
      const k = String(call.session ?? "").replace(/^score /, "");
      if (ORDER.map(key).includes(k) && !isPlayerCall(call)) by[k] = (by[k] ?? 0) + (call.costUsd ?? 0);
    }
    return Object.values(by);
  };
  const playerDoor = ["astra", "sol"].includes(player) ? "openai" : "openrouter";
  const rows = Object.keys(CAPS).filter((door) => CAPS[door] > 0).map((door) => {
    const dm = door === "openrouter" ? Math.max(ESTIMATE.dm + ESTIMATE.scoring, c1.openrouter?.rest ?? 0, ...dmHere(door)) : 0;
    const own = door === playerDoor ? Math.max(c1[door]?.player ?? 0, ESTIMATE.player[player] ?? 0) : 0;
    const projected = Math.round((dm + own + 3) * 100) / 100;
    const left = Math.round((CAPS[door] - (before[door].spentUsd ?? 0)) * 100) / 100;
    return { door, projected, left, fits: projected <= left };
  });
  for (const r of rows) log(`${r.fits ? "fits" : "STOP"}: ${entry} projected at $${r.projected} on ${DOOR_LABELS[r.door] ?? r.door}, $${r.left} left under its $${CAPS[r.door]} cap${r.fits ? "" : " — not started"}`);
  return { fits: rows.every((r) => r.fits), rows };
}

// ---- the driver: the order, one session per process -------------------------------------------------------------------

const finishedKeys = () => new Set(runFiles().flatMap((f) => (readJson(join(RUNS, f)).sessions ?? []).filter((s) => s.turns && played(s)).map((s) => s.key)));
export async function drive({ keys, args = (k) => ["--go", "--sessions", k, "--label", k], log = console.log }) {
  readFrozen(FROZEN_DIR);
  log(`the order: ${keys.join(", ")}`);
  let check = await spendCheck({ when: `before ${keys[0] ?? "nothing"}`, log });
  for (const entry of keys) {
    if (Number.isFinite(check?.openrouter?.remaining) && check.openrouter.remaining < 30) { log(`STOP: OpenRouter's account has $${check.openrouter.remaining} left, under one session's projection`); return { stopped: "credits" }; }
    const startedAt = new Date().toISOString();
    log(`${startedAt.slice(11, 19)} start ${entry}`);
    const code = await child(args(entry));
    const record = runFiles().map((f) => ({ f, r: readJson(join(RUNS, f)) })).filter(({ r }) => r.startedAt >= startedAt && (r.plan ?? []).includes(entry)).at(-1) ?? null;
    const session = record?.r.sessions?.find((s) => s.key === entry) ?? null;
    check = await spendCheck({ when: `after ${entry}`, log });
    log(`${new Date().toISOString().slice(11, 19)} done ${entry}: ${session?.turns ? `${session.turns.length} turns, ended by ${session.ended?.reason}${session.note?.text ? ", note recorded" : ""}` : `no session (exit ${code})`} · ${Object.entries(check.ledgers).map(([d, l]) => `${DOOR_LABELS[d] ?? d} $${l.spent.toFixed(2)}`).join(" · ")}`);
    if (code === 3 && !record) { log(`STOP: ${entry} was not started (its projection does not fit under a cap)`); return { stopped: "cap" }; }
    if (!record || code !== 0) { log(`STOP: ${entry} exited ${code}${record ? "" : " without a run record"}`); return { stopped: "exit" }; }
    if (record.r.stopped) { log(`STOP: ${record.r.stopped}`); return { stopped: record.r.stopped }; }
    if (record.r.undone?.length) { log(`STOP: ${entry} left undone (${record.r.undone.map((u) => u.why).join("; ")})`); return { stopped: "undone" }; }
    if (!session?.turns) { log(`STOP: ${entry} crashed (${String(session?.crashed ?? "no record").split("\n")[0].slice(0, 200)})`); return { stopped: "crash" }; }
    if (["welfare", "no-check"].includes(session.ended?.reason)) { log(`STOP: a welfare stop in ${entry} (${session.ended.detail})`); return { stopped: "welfare" }; }
  }
  log("the order is done");
  return { stopped: null };
}
function child(argv) {
  return new Promise((done) => {
    const p = spawn(process.execPath, ["--experimental-transform-types", fileURLToPath(import.meta.url), ...argv], { cwd: ROOT, env: { ...process.env, NODE_USE_ENV_PROXY: "1" }, stdio: ["ignore", "inherit", "inherit"] });
    p.on("close", (code) => done(code ?? 1));
  });
}

// ---- outputs ------------------------------------------------------------------------------------------------------------

/** The report, the dry-run page and the transcripts of every finished session again, from the records (no call). */
export async function rebuildAll() {
  const stage = loadStage();
  const dir = join(RUNS, `${STEM}-transcripts`);
  await mkdir(dir, { recursive: true });
  for (const session of stage.combined.sessions) await writeFile(join(dir, `${session.key}.md`), transcriptOf(session, { dir: FROZEN_DIR }));
  for (const record of stage.records) for (const session of (record.sessions ?? []).filter((s) => s.turns && ORDER.includes(s.player) && !played(s)))
    await writeFile(join(dir, `cut-${session.key}-t${session.turns.length}.md`), transcriptOf(session, { dir: FROZEN_DIR }));
  for (const session of stage.combined.dry ?? []) await writeFile(join(dir, `dry-${session.key}.md`), transcriptOf(session, { dir: FROZEN_DIR }));
  await writeFile(join(RUNS, `${STEM}-report.md`), reportMarkdown(stage));
  const dry = stage.records.filter((r) => (r.plan ?? []).includes(DRY_KEY));
  if (dry.length) await writeFile(join(RUNS, `${STEM}-dry-run.md`), dryRunMarkdown({ records: dry, ledgers: stage.ledgers, dir: FROZEN_DIR, spend: stage.spend }));
}

/** The scripted dry run: the freeze into a temporary folder, then one short session from it (no key, no call). */
export async function dryRun({ turns = 3, log = console.log } = {}) {
  const dir = join(tmpdir(), `${STEM}-dry-${Date.now()}`);
  await freeze({ dir, dry: true, log });
  const plan = () => [{ key: key("opus"), table: TABLE, player: "opus" }];
  const out = join(dir, "out");
  await mkdir(out, { recursive: true });
  const record = await run({ stage: stageOf({ dir, plan }), dry: true, turns, lanes: 1, fetcher: combat2Scripted(), out, label: "the scripted dry run" });
  return { record, dir, out };
}

function argsOf(argv) {
  const value = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null; };
  return { dry: argv.includes("--dry"), dryHaiku: argv.includes("--dry-haiku"), go: argv.includes("--go"), drive: argv.includes("--drive"), freeze: argv.includes("--freeze"), combat1: argv.includes("--combat-1"),
    spend: argv.includes("--spend"), rebuild: argv.includes("--report"), score: !argv.includes("--no-score"), only: value("--sessions")?.split(",") ?? null, from: value("--from"),
    turns: Number(value("--turns") ?? 0) || null, label: value("--label") };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = argsOf(process.argv.slice(2));
  const done = (p) => p.then(() => process.exit(process.exitCode ?? 0), (error) => { console.error(`${STEM}: ${error?.stack ?? error}`); process.exit(1); });
  if (a.rebuild) done(rebuildAll());
  else if (a.spend) done(spendCheck({ when: "by hand" }));
  else if (a.dry) done(dryRun({ turns: a.turns ?? 3 }).then(({ record, out }) => console.log(`scripted dry run: ${record.sessions.length} session(s); ${out}`)));
  else if (a.freeze) done(spendCheck({ when: "before the freeze (the first paid call)" }).then(() => freeze({})).then(() => spendCheck({ when: "after the freeze" })).then(rebuildAll));
  else if (a.combat1) done(combat1Passes().then(rebuildAll));
  else if (process.argv.includes("--amend-layer")) done(spendCheck({ when: "before the owner's amendment to the layer" }).then(() => amendLayer({})).then(() => checkOpening({})).then((c) => { if (!c.same) throw new Error("the opening is not byte-identical"); }).then(rebuildAll));
  else if (process.argv.includes("--check-opening")) done(checkOpening({}));
  else if (a.dryHaiku) done(drive({ keys: [DRY_KEY], args: () => ["--go", "--sessions", DRY_KEY, "--turns", String(a.turns ?? DRY_TURNS), "--label", "the dry run (Claude Haiku 5.5 as the player)"] }).then(rebuildAll));
  else if (a.drive) {
    const doneKeys = finishedKeys();
    const start = a.from ? ORDER.indexOf(a.from.replace(`${TABLE}-`, "")) : 0;
    if (start < 0) { console.error(`no session ${a.from} in the order`); process.exit(2); }
    done(drive({ keys: ORDER.slice(start).map(key).filter((k) => !doneKeys.has(k)) }).then(async (r) => { await rebuildAll(); if (r.stopped) process.exitCode = 3; }));
  } else if (a.go) {
    if (!a.only || a.only.length !== 1) { console.error("--go plays one session at a time: give --sessions <key> (the driver gives the order)"); process.exit(2); }
    const fit = a.only[0] === DRY_KEY ? Promise.resolve({ fits: true }) : sessionFits(a.only[0]);
    done(fit.then((f) => { if (!f.fits) process.exit(3); }).then(() => run({ stage: stageOf(), only: a.only, turns: a.turns ?? TURNS, lanes: 1, score: a.score, label: a.label })).then(async (r) => {
      console.log(`finished: ${r.sessions.length} session(s), undone ${r.undone.length}, stopped ${r.stopped ?? "no"}`);
      await rebuildAll();
    }));
  } else { console.error("give --dry, --spend, --freeze, --dry-haiku, --drive, --go --sessions <key>, --combat-1 or --report"); process.exit(2); }
}

