#!/usr/bin/env node
// Multi-hero 1 (docs/stages/MULTI_HERO_1.md): a table with no main character.
//   node --experimental-transform-types scripts/multi-hero-1/run.mjs --dry [--rounds 6]   the mocked host: the company world, the
//                                                                                       two company layers, A8, one P-SAND table,
//                                                                                       A7 — scripted providers, no key, no call
//   node --experimental-transform-types scripts/multi-hero-1/run.mjs --spend              one spend check (free reads)
//   node --experimental-transform-types scripts/multi-hero-1/run.mjs --haiku [--rounds 6] the paid dry run: the same on the real app,
//                                                                                       every Claude call as Claude Haiku 5.5
//                                                                                       (OpenRouter, cap $5; no other door)
//   node --experimental-transform-types scripts/multi-hero-1/run.mjs --report             the pages again from the last record (no call)
// Run node with NODE_USE_ENV_PROXY=1 for the paid commands.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { DOOR_LABELS, RUNS, ledgerSuffix, runKeys, stageLedgers } from "../game-player-1/run.mjs";
import { createLedger, createMeter, ledgerMarkdown, WAITS_429 } from "../game-player-1/paid.mjs";
import { paidCall } from "../game-player-1/session.mjs";
import { judgeCall } from "../game-player-1/players.mjs";
import { HAIKU_PLAYER, haikuReplies, haikuRewrite } from "../game-player-same-world-1/run.mjs";
import { CAPS, DESIGN_SHA256, LAYER_ARMS, ROUNDS, STAGE, playerSystem } from "./frozen.mjs";
import { CHARACTERS } from "./sheets.mjs";
import { buildWorld, openFrozenDatabase, prepareLayers, readFrozen, tableStarter } from "./world.mjs";
import { runTable } from "./table.mjs";
import { companyScripted } from "./scripted.mjs";
import { a8Of, dmAddressees, judge, layerRequest, parseLayer, tagRounds } from "./judges.mjs";
import { heroAudit } from "./measure.mjs";
import { measuresOf, playerTranscript, reportMarkdown, roundSideBySide, sideBySideHtml, tableTranscript } from "./report.mjs";

export const STEM = "multi-hero-1";
export const FROZEN_DIR = join(RUNS, `${STEM}-frozen`);
export const SPEND_FILE = join(RUNS, `${STEM}-spend.json`);
const STAGE_INFO = { name: STAGE, stem: STEM, title: "Multi-hero 1 — the dry run on Haiku", caps: CAPS };
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
async function writeJson(file, value) { await mkdir(dirname(file), { recursive: true }); await writeFile(`${file}.tmp`, `${JSON.stringify(value, null, 2)}\n`); await rename(`${file}.tmp`, file); }
const stampOf = (date = new Date()) => date.toISOString().slice(0, 19).replace(/[-:]/g, "").replace("T", "-");

// ---- what the DM was sent (A1 in the run) ----------------------------------------------------------------------------------

const textOf = (content) => (typeof content === "string" ? content : (content ?? []).map((b) => (b.type === "tool_result" ? textOf(b.content) : b.text ?? "")).join("\n"));
/** What kind of request a Claude call is, by its own text: the DM's (a turn, the bookkeeper, an out-of-game answer, the
 * prep, the digest, the opening), the first record's wizard draft, the relay, an app checker, a player, a judge. */
export function requestKind(body) {
  const system = Array.isArray(body.system) ? body.system.map((b) => b.text ?? "").join("\n") : String(body.system ?? "");
  const user = (body.messages ?? []).filter((m) => m.role === "user").map((m) => textOf(m.content)).join("\n");
  if (/You are a player sitting down/.test(system)) return "player";
  if (/blind evaluator/i.test(system)) return "judge";
  if (/^You are the game master of a tabletop role-playing game with three players/.test(system)) return "relay";
  if (/You are an authoring task of the configured single primary DM/.test(system)) return /"kind":"opening"/.test(user) ? "opening" : "creation (the wizard)";
  if (/^You are the DM of a new campaign\. Build the player's hero/.test(system)) return "creation (the wizard)";
  if (/Your own prep before the next session/.test(user)) return "prep";
  if (/This is an out-of-game question or feedback/.test(system)) return "out-of-game answer";
  if (/^You are the bookkeeper/.test(system)) return "bookkeeper";
  if (/^You are the game master of a private, long-running/.test(system)) return /"recap"/.test(user) ? "digest" : "DM turn";
  if (/^You check /.test(system) || /quotable|ledger/i.test(system.slice(0, 200))) return "checker";
  return "other";
}
/** Every text the model reads in one request: the system, the messages (tool results too), the tools' descriptions. */
export function requestText(body) {
  const system = Array.isArray(body.system) ? body.system.map((b) => b.text ?? "").join("\n\n") : String(body.system ?? "");
  const messages = (body.messages ?? []).map((m) => textOf(m.content)).join("\n\n");
  const tools = JSON.stringify((body.tools ?? []).map((t) => ({ description: t.description, input_schema: t.input_schema })));
  return `${system}\n\n${messages}\n\n${tools}`;
}
const DM_KINDS = new Set(["DM turn", "bookkeeper", "out-of-game answer", "prep", "digest", "opening"]);
/** A fetcher that keeps every Claude request's body (the meter's inner fetcher: it sees what is sent). */
function auditing(inner, into) {
  return async (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url ?? String(input);
    if (/\/v1\/messages$/.test(url) && typeof init.body === "string") { try { into.push(JSON.parse(init.body)); } catch { /* not JSON */ } }
    return inner(input, init);
  };
}
export function auditOf(bodies, record) {
  const kinds = bodies.map((body) => ({ kind: requestKind(body), body }));
  const dm = kinds.filter((k) => DM_KINDS.has(k.kind) || k.kind === "creation (the wizard)").map((k) => ({ purpose: k.kind, text: requestText(k.body) }));
  const audit = heroAudit(dm, record);
  audit.checkers = kinds.filter((k) => k.kind === "checker" && /\bhero\b/i.test(requestText(k.body))).length;
  audit.byKind = Object.fromEntries([...new Set(kinds.map((k) => k.kind))].map((kind) => [kind, kinds.filter((k) => k.kind === kind).length]));
  return audit;
}

// ---- the money --------------------------------------------------------------------------------------------------------------

async function bookRun(ledgers, before, { what, file, stopped }) {
  const finishedAt = new Date().toISOString();
  for (const door of Object.keys(ledgers)) {
    if (!ledgers[door].calls.length) continue;
    const suffix = ledgerSuffix(door);
    const runs = [...(before[door].runs ?? []), { finishedAt, file, what, spentUsd: ledgers[door].runUsd, stopped, calls: ledgers[door].calls }];
    await writeJson(join(RUNS, `${STEM}-ledger${suffix}.json`), { capUsd: CAPS[door], spentUsd: (before[door].spentUsd ?? 0) + ledgers[door].runUsd, updatedAt: finishedAt, runs });
    const all = createLedger(door, CAPS[door], 0);
    all.calls.push(...runs.flatMap((r) => r.calls ?? []));
    await writeFile(join(RUNS, `${STEM}-ledger${suffix}.md`), ledgerMarkdown(all, `${STAGE_INFO.title} — the ${DOOR_LABELS[door] ?? door} ledger`));
  }
}

/** One spend check from free reads: the OpenRouter account (shared with other sessions) and this stage's ledger. */
export async function spendCheck({ when = "check", log = console.log } = {}) {
  const { providerKey } = await import("../eval/lib/keys.mjs");
  const { anthropicEndpoint, scriptDoorEnv } = await import("../eval/lib/anthropic-endpoint.mjs");
  const openrouter = anthropicEndpoint(scriptDoorEnv((name) => (name === "ANTHROPIC_PROVIDER" ? "openrouter" : providerKey(name))));
  const key = openrouter.apiKey || null;
  const read = async (path) => {
    try { const r = await fetch(`${openrouter.baseUrl}/v1/${path}`, { headers: { authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(30_000) }); return r.ok ? (await r.json()).data ?? null : { error: `HTTP ${r.status}` }; }
    catch (error) { return { error: String(error?.message ?? error).slice(0, 120) }; }
  };
  const credits = key ? await read("credits") : { error: "no key" };
  const { before } = await stageLedgers(STAGE_INFO);
  const check = { at: new Date().toISOString(), when, openrouter: { totalCredits: credits?.total_credits ?? null, totalUsage: credits?.total_usage ?? null,
    remaining: Number.isFinite(credits?.total_credits) && Number.isFinite(credits?.total_usage) ? Math.round((credits.total_credits - credits.total_usage) * 100) / 100 : null, error: credits?.error ?? null },
    ledger: Object.fromEntries(Object.keys(CAPS).map((door) => [door, { spent: Math.round((before[door].spentUsd ?? 0) * 10000) / 10000, cap: CAPS[door] }])) };
  const previous = existsSync(SPEND_FILE) ? readJson(SPEND_FILE).checks ?? [] : [];
  await writeJson(SPEND_FILE, { note: "Spend checks: OpenRouter's account (shared with other sessions on the same key) and this stage's ledger.", checks: [...previous, check] });
  log(`spend (${when}): OpenRouter account left $${check.openrouter.remaining ?? "?"} · this stage $${check.ledger.openrouter.spent.toFixed(3)} of $${CAPS.openrouter}`);
  return check;
}

// ---- one metered pass with the app open --------------------------------------------------------------------------------------

async function withApp({ dry = false, fetcher = null, database = null, audit = null, log = console.log, what, file }, work) {
  const keys = dry ? { anthropic: "sk-scripted", openai: null, openrouter: "sk-scripted", door: null } : await runKeys();
  if (!dry) {
    if (keys.door?.provider !== "openrouter") throw new Error("this stage's dry run goes through OpenRouter: set APP_ANTHROPIC_PROVIDER=openrouter");
    if (!keys.anthropic) throw new Error(`${keys.keyName ?? "the OpenRouter key"} must be set`);
    keys.openai = null; // no other door: the app gets no OpenAI key, and the meter has no OpenAI room
  }
  const caps = dry ? Object.fromEntries(Object.keys(CAPS).map((door) => [door, 1000])) : CAPS;
  const { before, ledgers } = await stageLedgers({ ...STAGE_INFO, caps }, { dry });
  const inner = fetcher ?? globalThis.fetch.bind(globalThis);
  const meter = createMeter({ ledgers, fetcher: audit ? auditing(inner, audit) : inner, log, waits429: WAITS_429, ...(dry ? {} : { rewrite: haikuRewrite }) });
  const uninstall = meter.install();
  if (!dry) globalThis.fetch = haikuReplies(globalThis.fetch);
  const { openApp, settleBackground } = await import("../game-player-1/app.mjs");
  const app = await openApp({ keys, fake: false, ...(database ? { database } : {}) });
  let result = null, failure = null;
  try { result = await work({ app, meter, keys, settle: () => settleBackground() }); await settleBackground(); }
  catch (error) { failure = error; }
  finally {
    await meter.drain();
    await app.close().catch(() => {});
    uninstall();
    if (!dry) await bookRun(ledgers, before, { what: failure ? `${what} — failed: ${String(failure?.message ?? failure).slice(0, 160)}` : what, file, stopped: meter.stopped });
  }
  if (failure) throw failure;
  const spent = Object.entries(ledgers).filter(([, l]) => l.calls.length).map(([d, l]) => `${DOOR_LABELS[d] ?? d} $${l.runUsd.toFixed(3)}`).join(" · ") || "$0";
  log(`${what}: ${spent}${meter.stopped ? ` · STOPPED: ${meter.stopped}` : ""}`);
  return { result, ledgers, meter };
}
const judgeAsk = (meter, keys, session, log) => ({ model, system, user, maxTokens, effort, purpose }) => paidCall({ meter, session, purpose, log,
  call: () => judgeCall({ model, system, user, maxTokens, effort, keys, fetcher: meter.fetch }) });

// ---- the stage's dry run --------------------------------------------------------------------------------------------------------

/**
 * The whole dry run: the company world and its two layers (frozen into `dir`), A8 on the layer files, one P-SAND table
 * from the snapshot, A7's tags, the measures and the audit. `dry`: the mocked host (`fetcher`: its scripted providers).
 * Returns the run record.
 */
export async function dryRun({ dry = true, rounds = ROUNDS, dir = null, fetcher = null, log = console.log, out = null } = {}) {
  const started = new Date();
  const folder = dir ?? (dry ? join(tmpdir(), `${STEM}-dry-${Date.now()}`) : FROZEN_DIR);
  const host = dry ? (fetcher ?? companyScripted({ script: DRY_SCRIPT })) : null;
  const audit = [];
  const by = dry ? "the scripted DM (the mocked host)" : "Claude Haiku 5.5 in place of the owner's DM settings, through OpenRouter";
  if (!dry) await spendCheck({ when: "before the dry run", log });
  // The world and the layers (one pass each, as PARTY_1 froze them).
  if (!existsSync(join(folder, "manifest.json"))) await withApp({ dry, fetcher: host, audit, log, what: "the company world (three arms: the wizard, the opening, the seating)", file: `${STEM}-frozen/manifest.json` },
    ({ app, meter, settle }) => buildWorld({ app, meter, dir: folder, log, by, settle }));
  const frozen = readFrozen(folder);
  if (LAYER_ARMS.some((arm) => !frozen.manifest.layers[arm])) await withApp({ dry, fetcher: host, audit, log, database: () => openFrozenDatabase(folder), what: "the company layers (the prep, once for P-GOAL and once for P-DUNGEON)", file: `${STEM}-frozen/manifest.json` },
    ({ app, meter }) => prepareLayers({ app, meter, dir: folder, log, by, arms: LAYER_ARMS.filter((arm) => !readFrozen(folder).manifest.layers[arm]) }));
  // A8 on the layer files, before the table.
  const a8 = { layers: {} };
  await withApp({ dry, fetcher: host, log, what: "A8: the blind reading of the two layers", file: `${STEM}-frozen/manifest.json`, database: () => openFrozenDatabase(folder) }, async ({ meter, keys }) => {
    const ask = judgeAsk(meter, keys, "A8", log);
    for (const [arm, file] of Object.entries(readFrozen(folder).files)) {
      const read = await judge({ ask, request: layerRequest(file), parse: parseLayer, key: (x) => a8Of(x).per, purpose: `A8 ${arm}` });
      if (!read) throw new Error(`A8: the reading of ${arm} was not sent`);
      a8.layers[arm] = { sha256: file.sha256, readings: { a: read.a, b: read.b, third: read.third }, reading: a8Of(read.final ?? { items: [], threads: [] }), dm: dmAddressees(file.layer) };
    }
  });
  a8.holds = Object.values(a8.layers).length > 0 && Object.values(a8.layers).every((x) => x.reading.holds);
  log(`A8: ${a8.holds ? "held" : "lost"} — ${Object.entries(a8.layers).map(([arm, x]) => `${arm} ${JSON.stringify(x.reading.per)}`).join(" · ")}`);
  // The table.
  const key = dry ? "SAND-dry" : "SAND-haiku";
  const seats = ["haiku", "haiku", "haiku"];
  const runRecord = { stage: STAGE, design: DESIGN_SHA256, dry, key, arm: "SAND", seats, rounds, startedAt: started.toISOString(), frozen: { dir: dry ? "(a temporary folder)" : `docs/runs/${STEM}-frozen`, snapshot: frozen.manifest.snapshot.sha256, layers: Object.fromEntries(Object.entries(frozen.manifest.layers).map(([a, l]) => [a, l.sha256])) }, a8 };
  await withApp({ dry, fetcher: host, audit, log, database: () => openFrozenDatabase(folder), what: `the table ${key}`, file: `${STEM}-run` }, async ({ app, meter, keys, settle }) => {
    const made = await tableStarter(folder)(app, { key, arm: "SAND" }, { meter });
    const { bindTable } = await import("../game-player-1/table.mjs");
    const dm = bindTable(app, made.cid, settle);
    const seating = CHARACTERS.map((c) => ({ seat: c.seat, characterId: c.id, player: HAIKU_PLAYER }));
    const table = await meter.within({ session: key, purpose: "screen" }, () => runTable({ key, arm: "SAND", triad: "haiku", seats: seating, dm, meter, keys, rounds, log, systemOf: (id) => playerSystem("SAND", id), privateText: made.prep.layerText, cardWait: true }));
    table.campaign = { steps: made.steps, prep: { ...made.prep, layerText: undefined } };
    runRecord.table = table; runRecord.stopped = meter.stopped;
    // A7: the round tags (the same judges).
    await tagRounds(runRecord, { ask: judgeAsk(meter, keys, `${key}/initiative`, log), log });
  });
  runRecord.finishedAt = new Date().toISOString();
  runRecord.audit = auditOf(audit, runRecord);
  runRecord.a3 = a3Of(runRecord);
  runRecord.measures = measuresOf(runRecord);
  if (!dry) await spendCheck({ when: "after the dry run", log });
  await writeAll(runRecord, { out: out ?? (dry ? join(tmpdir(), `${STEM}-dry-out`) : RUNS) });
  return runRecord;
}

/** A3 in the dry run, by the record: the Inspiration and the rerolls each seat had and used; each journal's own scenes. */
export function a3Of(run) {
  const t = run.table ?? {};
  const cards = (t.rounds ?? []).flatMap((r) => r.scenes.flatMap((s) => (s.cards ?? []).map((c) => ({ round: r.n, ...c }))));
  const rerolls = Object.fromEntries((t.seats ?? []).map((s) => [s.character, cards.filter((c) => c.owner === s.character).flatMap((c) => c.presses ?? []).filter((p) => /reroll/i.test(p.button ?? "")).length]));
  const rolled = Object.fromEntries((t.seats ?? []).map((s) => [s.character, cards.filter((c) => c.owner === s.character && c.phase === "roll").length]));
  const line = `cards per seat ${Object.entries(rolled).map(([n, k]) => `${n.split(" ")[0]} ${k}`).join(", ")}; rerolls used ${Object.entries(rerolls).map(([n, k]) => `${n.split(" ")[0]} ${k}`).join(", ")}; Inspiration in play: ${(t.rounds ?? []).flatMap((r) => r.scenes.flatMap((s) => (s.rolls ?? []).filter((x) => /Inspiration/.test(x.reason ?? "")))).length ? "spent" : "none earned or spent"}`;
  return { rolled, rerolls, line };
}

/** The pages of a run: the record, the transcripts, the rounds side by side, the report. */
export async function writeAll(run, { out = RUNS } = {}) {
  await mkdir(out, { recursive: true });
  const stamp = stampOf(new Date(run.startedAt));
  const recordFile = join(out, `${STEM}-run-${stamp}.json`);
  await writeJson(recordFile, run);
  const dir = join(out, `${STEM}-transcripts`, run.key);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, `${run.key}-table.md`), tableTranscript(run));
  for (const seat of run.table?.seats ?? []) await writeFile(join(dir, `${run.key}-${seat.characterId}-${seat.player}.md`), playerTranscript(run, seat));
  await writeFile(join(out, `${STEM}-rounds.md`), roundSideBySide(run));
  await writeFile(join(out, `${STEM}-rounds.html`), sideBySideHtml(run));
  const { before } = await stageLedgers(STAGE_INFO, { dry: run.dry });
  const money = Object.fromEntries(Object.keys(CAPS).map((door) => [door, { spent: before[door].spentUsd ?? 0, cap: CAPS[door] }]));
  const spend = existsSync(SPEND_FILE) && !run.dry ? readJson(SPEND_FILE).checks ?? [] : [];
  const rel = (p) => p.replace(`${join(RUNS, "..", "..")}/`, "");
  await writeFile(join(out, `${STEM}-report.md`), reportMarkdown(run, { money, spend: spend.slice(-2), files: {
    "the run record": rel(recordFile), "the rounds side by side (page)": rel(join(out, `${STEM}-rounds.html`)), "the rounds side by side (markdown)": rel(join(out, `${STEM}-rounds.md`)),
    "the transcripts": rel(dir), "the frozen layers (DM-only) and the manifest (the world's snapshot, built on Haiku, is named there by its sha256 and not committed)": `docs/runs/${STEM}-frozen/`, "the ledger": `docs/runs/${STEM}-ledger-openrouter.md` } }));
  return recordFile;
}

/** The mocked host's players: a word at the table, a check asked from each seat in turn, a clever plan, Inspiration
 * spent, a sleep, a «?». */
export const DRY_SCRIPT = {
  "Bram Halloway": ["I set my mug down and nod to the two at my table. \"Long road. Bram Halloway.\"", "I sneak a look at the ledger on the bar.", "I wait by the hearth.", "I spend my Heroic Inspiration on that look at the ledger.", "I finish my ale.", "I stand and stretch."],
  "Sefa Marrin": ["? Is the common room crowded at this hour?", "I listen to the room.", "I ask for a check: I search the hearth for anything dropped.", "I have a clever plan: we buy the carter a drink.", "I watch the door.", "I sit back."],
  "Pell Dunmore": ["I listen and say nothing.", "I go to sleep until dawn in the corner bench.", "I pick the lock of the cellar door.", "I nod.", "I slip past the bar to the yard.", "I yawn."],
};

function args(argv) {
  const value = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null; };
  return { dry: argv.includes("--dry"), haiku: argv.includes("--haiku"), spend: argv.includes("--spend"), report: argv.includes("--report"), rounds: Number(value("--rounds") ?? ROUNDS) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = args(process.argv.slice(2));
  const done = (p) => p.then(() => process.exit(0), (error) => { console.error(`${STEM}: ${error?.stack ?? error}`); process.exit(1); });
  if (a.spend) done(spendCheck({ when: "by hand" }));
  else if (a.dry) done(dryRun({ dry: true, rounds: a.rounds }).then((r) => console.log(`dry run: ${r.table.rounds.length} round(s), ended by ${r.table.ended?.reason}; A1 frame hits ${r.audit.frame.length}; A2 ${r.measures.narration.a2}; A4 ${r.measures.paraphrase.holds}; A7 ${r.measures.a7.holds}; A8 ${r.a8.holds}`)));
  else if (a.haiku) done(dryRun({ dry: false, rounds: a.rounds }).then((r) => console.log(`the Haiku dry run: ${r.table.rounds.length} round(s), ended by ${r.table.ended?.reason}`)));
  else if (a.report) done((async () => {
    const files = readdirSync(RUNS).filter((f) => new RegExp(`^${STEM}-run-\\d{8}-\\d{6}\\.json$`).test(f)).sort();
    if (!files.length) throw new Error("no run record yet");
    const run = readJson(join(RUNS, files.at(-1)));
    run.measures = measuresOf(run);
    await writeAll(run);
  })());
  else { console.error("give --dry, --spend, --haiku or --report"); process.exit(2); }
}
