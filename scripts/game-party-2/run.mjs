#!/usr/bin/env node
// Game party 2 (docs/stages/GAME_PARTY_2.md at bbdee5fb; Mandate: issue #1; POLICY v1). Run node with NODE_USE_ENV_PROXY=1
// for the paid commands, and --experimental-transform-types for all.
//   run.mjs --dry                     the mocked host: the world, the three layers, a short S1-none and a short S2-high table
//                                     (scripted providers, no key, no call)
//   run.mjs --spend                   one spend check (free reads: OpenRouter's account and this stage's ledger)
//   run.mjs --freeze                  the world and the three layers on the owner's DM (Claude Opus 5.5 through OpenRouter)
//   run.mjs --haiku ARM [--rounds N]  the paid dry run on the frozen world: three Claude Haiku 5.5 players, every Claude
//                                     call of the app as Haiku but the relay's (Claude Sonnet 5.5)
//   run.mjs --table KEY --allowance N one table of the order (e.g. S1-none-T1) — only after the owner's word in issue #1;
//                                     the meter's cap for it is what was spent + N (never past $60)
//   run.mjs --reprep S1,S3 --why …    a situation's layer prepared again on a changed note (the old one kept in v1/)
//   run.mjs --score FILE [--judges-haiku]  the blind tags of a played table (score.mjs); --judges-haiku: the dry run's
//   run.mjs --estimate                the per-table estimate from the dry run's ledger and PARTY_1's Opus tables
// Every paid call goes through one meter: one ledger, OpenRouter, capped at the Mandate's $60; a call to any other host
// (the Anthropic Console, OpenAI) has no ledger and stops the run. 402 stops; 429 waited at most six times; transport
// errors asked again at most twice; a refusal is never asked again.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { DOOR_LABELS, RUNS, ledgerSuffix, runKeys, stageLedgers } from "../game-player-1/run.mjs";
import { PRICES, costOf, createLedger, createMeter, ledgerMarkdown, priceId, WAITS_429 } from "../game-player-1/paid.mjs";
import { haikuReplies } from "../game-player-same-world-1/run.mjs";
import { paidCall } from "../game-player-1/session.mjs";
import { judgeCall } from "../game-player-1/players.mjs";
import { scoreTable } from "./score.mjs";
import { auditOf, companyRewrite, requestKind } from "../multi-hero-1/run.mjs";
import { runTable } from "../multi-hero-1/table.mjs";
import { measuresOf } from "../multi-hero-1/report.mjs";
import { CHARACTERS } from "../multi-hero-1/sheets.mjs";
import { CAPS, DESIGN_SHA256, ORDER, PLACED, RELAY_MODEL, ROSTER, ROUNDS, SEATING, SITUATIONS, STAGE, afterQuestionsFor, armOf, deliveriesOf, playerSystem, promptSha256 } from "./frozen.mjs";
import { armNotes, buildWorld, openFrozenDatabase, prepareLayers, readFrozen, tableStarter } from "./world.mjs";
import { writePages } from "./report.mjs";

export const STEM = "game-party-2";
export const FROZEN_DIR = join(RUNS, `${STEM}-frozen`);
export const SPEND_FILE = join(RUNS, `${STEM}-spend.json`);
export const STAGE_INFO = { name: STAGE, stem: STEM, title: "Game party 2", caps: CAPS };
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
async function writeJson(file, value) { await mkdir(dirname(file), { recursive: true }); await writeFile(`${file}.tmp`, `${JSON.stringify(value, null, 2)}\n`); await rename(`${file}.tmp`, file); }

// ---- the doors -----------------------------------------------------------------------------------------------------------

/** The relay's requests as Claude Sonnet 5.5 (MULTI_HERO_1's decision; PARTY_2's relay), every other request as sent. */
export function relayRewrite(url, init = {}) {
  if (typeof init.body === "string" && /\/v1\/messages$/.test(String(url))) {
    let body = null;
    try { body = JSON.parse(init.body); } catch { body = null; }
    if (body && typeof body.model === "string" && /claude-/.test(body.model) && requestKind(body) === "relay")
      return { ...init, body: JSON.stringify({ ...body, model: body.model.includes("/") ? "anthropic/claude-sonnet-5.5" : RELAY_MODEL }) };
  }
  return init;
}

// ---- the money ------------------------------------------------------------------------------------------------------------

export async function bookRun(ledgers, before, { what, file, stopped }) {
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

/** One spend check from free reads: OpenRouter's account (shared with other sessions) and this stage's ledger. */
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
  const spent = Math.round((before.openrouter.spentUsd ?? 0) * 10000) / 10000;
  const check = { at: new Date().toISOString(), when, openrouter: { totalCredits: credits?.total_credits ?? null, totalUsage: credits?.total_usage ?? null,
    remaining: Number.isFinite(credits?.total_credits) && Number.isFinite(credits?.total_usage) ? Math.round((credits.total_credits - credits.total_usage) * 100) / 100 : null, error: credits?.error ?? null },
    ledger: { openrouter: { spent, cap: CAPS.openrouter, left: Math.round((CAPS.openrouter - spent) * 100) / 100 } } };
  const previous = existsSync(SPEND_FILE) ? readJson(SPEND_FILE).checks ?? [] : [];
  await writeJson(SPEND_FILE, { note: "Spend checks (POLICY v1): OpenRouter's account (shared with other sessions on the same key) and this Mandate's ledger (cap $60 OpenRouter, $0 OpenAI).", checks: [...previous, check] });
  log(`spend (${when}): OpenRouter account left $${check.openrouter.remaining ?? "?"} · this Mandate $${spent.toFixed(3)} of $${CAPS.openrouter}`);
  return check;
}

/** A fetcher that keeps every Claude request's body (the meter's inner fetcher: it sees what is sent). */
function auditing(inner, into) {
  return async (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url ?? String(input);
    if (/\/v1\/messages$/.test(url) && typeof init.body === "string") { try { into.push(JSON.parse(init.body)); } catch { /* not JSON */ } }
    return inner(input, init);
  };
}

/** One metered pass with the app open. `haiku`: the paid dry run's rewrite (every Claude call as Haiku, the relay as
 * Sonnet); otherwise the relay as Sonnet and everything else as sent. */
async function withApp({ dry = false, haiku = false, fetcher = null, database = null, audit = null, log = console.log, what, file, allowance = null }, work) {
  const keys = dry ? { anthropic: "sk-scripted", openai: null, openrouter: "sk-scripted", door: null } : await runKeys();
  if (!dry) {
    if (keys.door?.provider !== "openrouter") throw new Error("this stage goes through OpenRouter: set APP_ANTHROPIC_PROVIDER=openrouter");
    if (!keys.anthropic) throw new Error(`${keys.keyName ?? "the OpenRouter key"} must be set`);
    keys.openai = null; // POLICY v1 and the Mandate: $0 OpenAI — no OpenAI key in this process, and no OpenAI ledger
  }
  // The mocked host answers on the Console's address (no door): a dry pass gets room there too; a paid pass has only CAPS.
  let caps = dry ? { anthropic: 1000, openrouter: 1000 } : CAPS;
  // The owner's per-table allowance (issue #1): this pass may spend at most `allowance` dollars, and never past the $60.
  if (!dry && Number.isFinite(allowance)) {
    const spent = (await stageLedgers(STAGE_INFO)).before.openrouter.spentUsd ?? 0;
    caps = { openrouter: Math.min(CAPS.openrouter, Math.round((spent + allowance) * 10000) / 10000) };
    log(`allowance: $${allowance} for this pass — the meter's cap is $${caps.openrouter} (spent before $${spent.toFixed(3)}; the Mandate's ceiling $${CAPS.openrouter})`);
  }
  const { before, ledgers } = await stageLedgers({ ...STAGE_INFO, caps }, { dry });
  const inner = fetcher ?? globalThis.fetch.bind(globalThis);
  const meter = createMeter({ ledgers, fetcher: audit ? auditing(inner, audit) : inner, log, waits429: WAITS_429, ...(dry ? {} : { rewrite: haiku ? companyRewrite : relayRewrite }) });
  const uninstall = meter.install();
  if (!dry && haiku) globalThis.fetch = haikuReplies(globalThis.fetch);
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

// ---- the freeze -------------------------------------------------------------------------------------------------------------

/** The world (three campaigns, the dice) and the three layers, frozen into `dir`; then the arms' notes beside them. */
export async function freeze({ dry = false, dir = FROZEN_DIR, fetcher = null, log = console.log, coins = {}, dice = null } = {}) {
  const by = dry ? "the scripted DM (the mocked host)" : "the owner's DM settings (Claude Opus 5.5 writes and records) through OpenRouter";
  if (!dry) await spendCheck({ when: "before the freeze", log });
  if (!existsSync(join(dir, "manifest.json"))) await withApp({ dry, fetcher, log, what: "the world (three situations: the wizard, the opening, the seating; the layer's die and coin)", file: `${STEM}-frozen/manifest.json` },
    ({ app, meter, settle }) => buildWorld({ app, meter, dir, log, by, settle, coins, dice }));
  const pending = Object.keys(SITUATIONS).filter((s) => !readFrozen(dir).manifest.layers[s]);
  if (pending.length) await withApp({ dry, fetcher, log, database: () => openFrozenDatabase(dir), what: `the layers (the prep, once each: ${pending.join(", ")})`, file: `${STEM}-frozen/manifest.json` },
    ({ app, meter }) => prepareLayers({ app, meter, dir, situations: pending, log, by }));
  const { manifest } = readFrozen(dir);
  const notes = armNotes(manifest.dice);
  await writeJson(join(dir, "arms-dm-only.json"), { note: "DM-only: each arm's situation note (shared + variant), saved as the campaign's secrets at the table's start. Never shown to a player.", dice: manifest.dice, arms: notes });
  await writeFile(join(dir, "arms-dm-only.md"), [`# Game party 2 — the arms' situation notes (DM-only)`, "", `The layer's die (S1, who falls): **${manifest.dice.e}**; the layer's coin (S2, who receives the letter): **${manifest.dice.h}** — ${manifest.dice.how}.`, "",
    ...Object.entries(notes).flatMap(([arm, n]) => [`## ${arm} — sha256 \`${n.sha256}\``, "", "````text", n.note, "````", ""])].join("\n"));
  if (!dry) await spendCheck({ when: "after the freeze", log });
  return { manifest: readFrozen(dir).manifest, notes };
}

/** A situation's layer prepared again on a changed note (before any paid table): the old layer files move to `v1/` with
 * their manifest entry (manifest.superseded), and the prep runs once more on the snapshot; the arms' notes are written
 * again. */
export async function reprep({ situations, dir = FROZEN_DIR, log = console.log, why }) {
  const { renameSync, mkdirSync } = await import("node:fs");
  const manifest = readJson(join(dir, "manifest.json"));
  const archive = join(dir, "v1");
  mkdirSync(archive, { recursive: true });
  for (const situation of situations) {
    const entry = manifest.layers[situation];
    if (!entry) continue;
    for (const f of [`${situation}-dm-only.json`, `${situation}-dm-only.md`]) if (existsSync(join(dir, f))) renameSync(join(dir, f), join(archive, f));
    manifest.superseded = [...(manifest.superseded ?? []), { situation, ...entry, file: `v1/${entry.file}`, supersededAt: new Date().toISOString(), why }];
    delete manifest.layers[situation];
  }
  for (const f of ["arms-dm-only.json", "arms-dm-only.md"]) if (existsSync(join(dir, f)) && !existsSync(join(archive, f))) renameSync(join(dir, f), join(archive, f));
  await writeJson(join(dir, "manifest.json"), manifest);
  return freeze({ dir, log });
}

// ---- one table --------------------------------------------------------------------------------------------------------------

/** One table from the frozen world. `seating`: { bram, sefa, pell } → a ROSTER name (the triad's, or all «haiku» for the
 * dry run). Returns the run record (written with its pages into `out`). */
export async function playTable({ dir = FROZEN_DIR, arm, triad = null, seating = null, dry = false, haiku = false, rounds = ROUNDS, fetcher = null, log = console.log, out = RUNS, label = null, allowance = null }) {
  const a = armOf(arm);
  if (!a) throw new Error(`no arm ${arm}`);
  const seats = seating ?? SEATING[triad];
  if (!seats) throw new Error("a triad or a seating is needed");
  const key = label ? `${arm}-${label}` : `${arm}-${triad}`;
  const started = new Date();
  if (!dry) await spendCheck({ when: `before ${key}`, log });
  const frozen = readFrozen(dir);
  const audit = [], marks = [];
  const record = { stage: STAGE, design: DESIGN_SHA256, dry, haiku, label, key, arm, situation: a.situation, variant: a.variant, triad: triad ?? (haiku ? "haiku" : "scripted"), rounds, startedAt: started.toISOString(),
    seating: Object.fromEntries(CHARACTERS.map((c) => [c.name, { player: seats[c.id], label: ROSTER[seats[c.id]].label, model: ROSTER[seats[c.id]].model }])),
    models: dry ? "the scripted host" : haiku ? "every Claude call as Claude Haiku 5.5 but the relay's (Claude Sonnet 5.5); the players Claude Haiku 5.5" : `the DM: the owner's settings (Claude Opus 5.5); the relay: Claude Sonnet 5.5; the players by the seating`,
    frozen: { snapshot: frozen.manifest.snapshot.sha256, layer: frozen.manifest.layers[a.situation]?.sha256 ?? null, dice: frozen.manifest.dice } };
  let tableFrom = 0;
  record.allowance = allowance;
  await withApp({ dry, haiku, fetcher, audit, log, database: () => openFrozenDatabase(dir), what: `the table ${key}`, file: `${STEM}-run`, allowance }, async ({ app, meter, keys, settle }) => {
    const made = await tableStarter(dir)(app, { key, arm }, { meter });
    record.coin = made.coin; record.order = made.seats; record.frozen.note = made.prep.noteSha256;
    const { bindTable } = await import("../game-player-1/table.mjs");
    const dm = bindTable(app, made.cid, settle);
    tableFrom = audit.length;
    const seating2 = CHARACTERS.map((c) => ({ seat: c.seat, characterId: c.id, player: ROSTER[seats[c.id]] }));
    record.prompts = Object.fromEntries(CHARACTERS.map((c) => [c.name, promptSha256(a.situation, c.id, made.seats)]));
    const table = await meter.within({ session: key, purpose: "screen" }, () => runTable({ key, arm, triad: record.triad, seats: seating2, dm, meter, keys, rounds, log,
      systemOf: (id) => playerSystem(a.situation, id, made.seats), privateText: made.prep.layerText, cardWait: true, coin: made.coin,
      deliveries: deliveriesOf(arm, made.dice), afterQuestionsOf: (rec) => afterQuestionsFor(arm, rec.characterId, made.dice), onRound: (round) => marks.push({ round, at: audit.length }) }));
    record.table = table; record.stopped = meter.stopped;
    record.spentUsd = meter.ledgers.openrouter?.runUsd ?? 0;
  });
  record.finishedAt = new Date().toISOString();
  record.audit = auditOf(audit, record, { marks, tableFrom, openingTitle: SITUATIONS[a.situation].title });
  record.measures = measuresOf(record);
  if (!dry) await spendCheck({ when: `after ${key}`, log });
  await writePages(record, { out });
  return record;
}

// ---- the scoring --------------------------------------------------------------------------------------------------------------

/** The blind tags of one played table (score.mjs), on the record in place; `haiku`: the dry run's (every judge as Haiku). */
export async function scoreRun({ file, haiku = false, log = console.log, out = RUNS }) {
  const run = readJson(file);
  if (!haiku) await spendCheck({ when: `before the scoring of ${run.key}`, log });
  const keys = await runKeys();
  if (keys.door?.provider !== "openrouter") throw new Error("this stage goes through OpenRouter: set APP_ANTHROPIC_PROVIDER=openrouter");
  keys.openai = null;
  const { before, ledgers } = await stageLedgers(STAGE_INFO);
  const meter = createMeter({ ledgers, fetcher: globalThis.fetch.bind(globalThis), log, waits429: WAITS_429, ...(haiku ? { rewrite: companyRewrite } : {}) });
  const ask = ({ model, system, user, maxTokens, effort, purpose }) => paidCall({ meter, session: `${run.key}/score`, purpose, log,
    call: () => judgeCall({ model, system, user, maxTokens, effort, keys, fetcher: meter.fetch }) });
  try { await scoreTable(run, { ask, log }); }
  finally { await meter.drain(); await bookRun(ledgers, before, { what: `the scoring of ${run.key}`, file: basename(file), stopped: meter.stopped }); }
  await writePages(run, { out });
  log(`the scoring of ${run.key}: $${ledgers.openrouter.runUsd.toFixed(3)}${meter.stopped ? ` · STOPPED: ${meter.stopped}` : ""}`);
  return run;
}

// ---- the estimate -----------------------------------------------------------------------------------------------------------

/** What a ledger row's call would cost at a real table: the DM's calls (the app's: turns, bookkeeping, out-of-game) at
 * Claude Opus 5.5, the relay at Sonnet (as sent), the checks as sent, each player's calls at its seat's family (`seating`). */
export function repriced(row, seating) {
  const purpose = String(row.purpose ?? "");
  const session = String(row.session ?? "");
  const usage = row.usage ?? {};
  if (/^(?:player|after)/.test(purpose)) {
    const short = session.split("/").at(-1);
    const id = CHARACTERS.find((c) => c.short === short)?.id;
    const player = ROSTER[seating[id]];
    const model = player?.model ?? "claude-haiku-5-5";
    return { kind: `player ${player?.name ?? "?"}`, usd: costOf(model, usage) ?? 0 };
  }
  if (/^relay/.test(purpose)) return { kind: "relay", usd: costOf("claude-sonnet-5-5", usage) ?? row.costUsd ?? 0 };
  if (/^check/.test(purpose) || / check|referee/.test(purpose)) return { kind: "checks", usd: row.costUsd ?? 0 };
  return { kind: "dm", usd: costOf("claude-opus-5-5", usage) ?? 0 };
}
/** PARTY_1's Opus spend per DM round, from its T2 tables (Fable played, so every Opus call was the DM's). */
export function party1OpusPerRound() {
  const files = readdirSync(RUNS).filter((f) => /^game-party-1-run-\d{8}-\d{6}\.json$/.test(f));
  const rows = [];
  const ledger = existsSync(join(RUNS, "game-party-1-ledger-openrouter.json")) ? readJson(join(RUNS, "game-party-1-ledger-openrouter.json")) : { runs: [] };
  for (const f of files) {
    const r = readJson(join(RUNS, f));
    if (!/-T2$/.test(r.key ?? "")) continue;
    const run = ledger.runs.find((x) => x.what === r.key || String(x.what ?? "").startsWith(`${r.key}`));
    if (!run) continue;
    const opus = run.calls.filter((c) => /opus/.test(c.model)).reduce((s, c) => s + (c.costUsd ?? 0), 0);
    const relay = run.calls.filter((c) => /opus/.test(c.model) && /^relay/.test(c.purpose ?? "")).reduce((s, c) => s + (c.costUsd ?? 0), 0);
    const rounds = r.table?.rounds?.length ?? 0;
    if (rounds) rows.push({ key: r.key, rounds, opusUsd: opus, relayUsd: relay, dmPerRound: (opus - relay) / rounds });
  }
  return rows;
}
/** The per-table estimate for a 15-round table of each triad, from the dry run's record(s) and ledger. */
export function estimate({ ledgerFile = join(RUNS, `${STEM}-ledger-openrouter.json`), keys = null } = {}) {
  const ledger = existsSync(ledgerFile) ? readJson(ledgerFile) : { runs: [] };
  const runs = ledger.runs.filter((r) => /^the table /.test(r.what ?? "") && (!keys || keys.some((k) => r.what.includes(k))));
  const out = { tables: [], party1: party1OpusPerRound() };
  for (const run of runs) {
    const key = run.what.replace(/^the table /, "").replace(/ — .*$/, "");
    const recordFile = readdirSync(RUNS).filter((f) => new RegExp(`^${STEM}-run-.*\\.json$`).test(f)).map((f) => readJson(join(RUNS, f))).find((r) => r.key === key);
    const played = recordFile?.table?.rounds?.length ?? null;
    const per = {};
    for (const triad of Object.keys(SEATING)) {
      const by = {};
      for (const row of run.calls) { const x = repriced(row, SEATING[triad]); by[x.kind] = (by[x.kind] ?? 0) + x.usd; }
      const scale = played ? ROUNDS / played : 1;
      per[triad] = { byKind: Object.fromEntries(Object.entries(by).map(([k, v]) => [k, Math.round(v * scale * 100) / 100])), total: Math.round(Object.values(by).reduce((s, v) => s + v, 0) * scale * 100) / 100 };
    }
    out.tables.push({ key, rounds: played, sentUsd: Math.round(run.spentUsd * 1000) / 1000, perTriad: per });
  }
  const p1 = out.party1;
  out.party1DmPerRound = p1.length ? Math.round((p1.reduce((s, r) => s + r.dmPerRound, 0) / p1.length) * 100) / 100 : null;
  return out;
}

// ---- the command line ----------------------------------------------------------------------------------------------------------

/** The mocked host's players (the dry run's script): a word at the table, the quarry, a check, the danger's rounds. */
export const DRY_SCRIPT = {
  "Bram Halloway": ["I nod to the warden and ask for the case.", "\"We keep to the lip road,\" I say.", "I walk on.", "I look at the block and the rope.", "I take the rope and set the beam.", "I haul.", "I walk on.", "I walk on."],
  "Sefa Marrin": ["? How far is Beregost from here?", "I check the case's seal.", "I walk on.", "I kneel at the edge and look down.", "I hold the light.", "I help haul.", "I walk on.", "I walk on."],
  "Pell Dunmore": ["I watch the road.", "I sneak a look at the warden's ledger.", "I walk on.", "I climb down to look.", "I brace the beam.", "I pull.", "I walk on.", "I walk on."],
};

function args(argv) {
  const value = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null; };
  return { dry: argv.includes("--dry"), spend: argv.includes("--spend"), freeze: argv.includes("--freeze"), haiku: value("--haiku"), table: value("--table"), estimate: argv.includes("--estimate"),
    rounds: value("--rounds") ? Number(value("--rounds")) : null, label: value("--label"), allowance: value("--allowance") ? Number(value("--allowance")) : null, score: value("--score"), scoreHaiku: argv.includes("--judges-haiku"), reprep: value("--reprep"), why: value("--why") };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = args(process.argv.slice(2));
  const done = (p) => p.then(() => process.exit(0), (error) => { console.error(`${STEM}: ${error?.stack ?? error}`); process.exit(1); });
  const ALL_HAIKU = { bram: "haiku", sefa: "haiku", pell: "haiku" };
  if (a.spend) done(spendCheck({ when: "by hand" }));
  else if (a.dry) done((async () => {
    const { companyScripted } = await import("../multi-hero-1/scripted.mjs");
    const dir = join(tmpdir(), `${STEM}-dry-${Date.now()}`);
    const out = join(tmpdir(), `${STEM}-dry-out`);
    await freeze({ dry: true, dir, fetcher: companyScripted({ script: DRY_SCRIPT }) });
    for (const arm of ["S1-none", "S2-high"]) {
      const r = await playTable({ dir, arm, seating: ALL_HAIKU, dry: true, rounds: a.rounds ?? 6, fetcher: companyScripted({ script: DRY_SCRIPT }), out, label: "dry" });
      console.log(`${r.key}: ${r.table.rounds.length} round(s), ended by ${r.table.ended?.reason}; deliveries ${r.table.deliveries.length}; leaks ${r.table.leaksRefined.hits.length}; pages in ${out}`);
    }
  })());
  else if (a.freeze) done(freeze().then(({ manifest }) => console.log(`frozen: snapshot ${manifest.snapshot.sha256.slice(0, 16)}…; layers ${Object.entries(manifest.layers).map(([s, l]) => `${s} ${l.sha256.slice(0, 16)}…`).join(", ")}; dice ${JSON.stringify(manifest.dice)}`)));
  else if (a.haiku) done(playTable({ arm: a.haiku, seating: ALL_HAIKU, haiku: true, rounds: a.rounds ?? 7, label: a.label ?? "haiku" }).then((r) => console.log(`${r.key}: ${r.table.rounds.length} round(s), ended by ${r.table.ended?.reason}; $${(r.spentUsd ?? 0).toFixed(3)}`)));
  else if (a.table) done((async () => {
    const entry = ORDER.find((o) => o.key === a.table);
    if (!entry) throw new Error(`${a.table} is not a table of the order (${ORDER.map((o) => o.key).join(", ")})`);
    if (!Number.isFinite(a.allowance)) throw new Error("a paid table needs the owner's per-table allowance from issue #1: --allowance N");
    const r = await playTable({ arm: entry.arm, triad: entry.triad, rounds: a.rounds ?? ROUNDS, allowance: a.allowance });
    console.log(`${r.key}: ${r.table.rounds.length} round(s), ended by ${r.table.ended?.reason}; $${(r.spentUsd ?? 0).toFixed(3)}`);
  })());
  else if (a.reprep) done(reprep({ situations: a.reprep.split(","), why: a.why ?? "the note changed before any paid table" }).then(({ manifest }) => console.log(`layers: ${Object.entries(manifest.layers).map(([x, l]) => `${x} ${l.sha256.slice(0, 16)}…`).join(", ")}`)));
  else if (a.score) done(scoreRun({ file: a.score, haiku: a.scoreHaiku }));
  else if (a.estimate) done(Promise.resolve().then(() => console.log(JSON.stringify(estimate(), null, 2))));
  else { console.error("give --dry, --spend, --freeze, --haiku ARM, --table KEY or --estimate"); process.exit(2); }
}

export { PRICES, priceId, PLACED };
