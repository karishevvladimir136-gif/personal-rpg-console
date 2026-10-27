// Game player same-world 1: the frozen world. `freezeWorld` builds both tables' campaigns once on one local database
// (game player 1's wizard, the sheet without its alignment line), keeps the database as a snapshot before any prep, then
// runs the app's own prep once per table and keeps its writes to the DM's private notes as the table's DM-only file.
// `openFrozenDatabase` loads the snapshot for a session's process; `startFromFrozen` writes the table's file into the
// campaign's private notes through the app's own call and checks the notes hold exactly the file before the first turn.
// Nothing here reaches the player: the snapshot is taken before the prep, and the file is written to the DM's notes only.
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createCampaign } from "../game-player-1/table.mjs";
import { ALIGNMENT, COMPANIONS, DESIGN_SHA256, STAGE, TABLES, sameWorldFiles, withoutAlignment } from "./frozen.mjs";

export const SNAPSHOT = "world-base.tar.gz";
export const MANIFEST = "manifest.json";
export const layerFile = (table) => `${table}-dm-only.json`;
const KINDS = ["fact", "clock", "consequence"];
const sha256 = (data) => createHash("sha256").update(data).digest("hex");
/** Canonical JSON: keys sorted at every level (the hash does not depend on key order). */
export const canonical = (value) => JSON.stringify(value, (_, v) => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, v[k]])) : v));
/** The DM-only file's hash: the table, its campaign and the writes. */
export const layerSha256 = (file) => sha256(canonical({ table: file.table, campaignId: file.campaignId, writes: file.writes }));
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
async function writeAtomic(path, data) { await writeFile(`${path}.tmp`, data); await rename(`${path}.tmp`, path); }

/** The DM's private notes of a campaign, as stored. */
export const privateStateOf = async (app, cid) => (await app.f.one("select contents from rpg_private.dm_state where campaign_id=$1", [cid]))?.contents ?? {};

/** The writes that take `before` to `after` (new or changed notes), each as the text the private-notes call takes: a
 * stored envelope `{"v": text, …}` gives its text, a clock its number. `removed`: notes `after` no longer has. */
export function writesBetween(before, after, parse) {
  const set = [], removed = [];
  for (const kind of KINDS) {
    const was = before?.[kind] ?? {}, now = after?.[kind] ?? {};
    for (const key of Object.keys(now).sort()) if (JSON.stringify(was[key]) !== JSON.stringify(now[key])) set.push({ kind, key, value: kind === "clock" ? String(now[key]) : parse(now[key]).text });
    for (const key of Object.keys(was)) if (!(key in now)) removed.push({ kind, key });
  }
  return { set, removed };
}
/** The stored values of the written keys (what a session's notes must hold after the file is written). */
export const storedOf = (state, writes) => Object.fromEntries(KINDS.map((kind) => [kind, Object.fromEntries(writes.filter((w) => w.kind === kind).map((w) => [w.key, state?.[kind]?.[w.key] ?? null]))]));

// ---- the threads of a layer (W3) ---------------------------------------------------------------------------------------

const SECTION = [
  [/^Factions and their hidden aims:$/, "faction"], [/^Secrets \(not tied to a place\):$/, "secret"], [/^Clocks:$/, "clock"], [/^Clues to the truth:$/, "clue"],
  [/^Фракции и их скрытые цели:$/, "faction"], [/^Тайны \(не привязаны к месту\):$/, "secret"], [/^Часы:$/, "clock"], [/^Улики к правде:$/, "clue"],
];
/**
 * The numbered threads of a table's frozen layer: the errand (the hook), each faction, secret, clock, the wonder, each
 * clue, the false lead, and each person the layer gives a voice (companions left out: they travel with the hero). The
 * truth, the act plan's aims, the ban test and the patron's moment are the DM's plan, not threads of the world.
 */
export function threadsOf(file) {
  const out = [];
  const add = (kind, text) => { const t = String(text ?? "").replace(/\s+/g, " ").trim(); if (t) out.push({ id: `T${out.length + 1}`, kind, text: t.slice(0, 600) }); };
  let section = null;
  const lines = String(file.layer ?? "").split("\n");
  const errand = lines.map((line) => line.match(/[;:]\s*(?:the errand|поручение): (.+)$/i)).find(Boolean);
  if (errand) add("errand", errand[1]);
  for (const line of lines) {
    const header = SECTION.find(([re]) => re.test(line.trim()));
    if (header) { section = header[1]; continue; }
    if (/^- /.test(line) && section) { add(section, line.slice(2)); continue; }
    if (!/^- /.test(line)) section = null;
    const wonder = line.match(/^(?:The wonder|Чудо): (.+)$/);
    if (wonder) add("wonder", wonder[1]);
    const lead = line.match(/^(?:The next session's false lead|Ложный след следующей сессии): (.+)$/);
    if (lead) add("false lead", lead[1]);
  }
  const companion = (name) => [...COMPANIONS, ...(file.companionNames ?? [])].some((c) => c.trim().toLowerCase().replace(/^the\s+/, "") === name.trim().toLowerCase().replace(/^the\s+/, ""));
  for (const w of (file.writes ?? []).filter((x) => x.kind === "fact" && x.key.startsWith("voice_"))) {
    if ((file.companionIds ?? []).some((id) => w.key === `voice_${id}`) || companion(String(w.value).split(":")[0])) continue;
    add("person", w.value);
  }
  return out;
}

// ---- the freeze --------------------------------------------------------------------------------------------------------

/**
 * Builds the frozen world in `dir`: both tables' campaigns made by the wizard, the snapshot before any prep, then one prep
 * per table and its DM-only file. `app` is open on a fresh database; every model call runs in the meter's context
 * (`freeze <table>`). Returns the manifest.
 */
export async function freezeWorld({ app, meter, dir, tables = TABLES, log = () => {}, by = null, settle = async () => 0 }) {
  const { parseNoteValue } = app.lib.privateNotes;
  await mkdir(dir, { recursive: true });
  const made = {};
  for (const table of tables) {
    const removed = [];
    const campaign = await meter.within({ session: `freeze ${table}`, purpose: "wizard" }, () => createCampaign(app, { table, log, closed: () => Boolean(meter.stopped),
      files: sameWorldFiles(), reviewEdit: (review) => withoutAlignment(review, removed) }));
    // The hero on record carries no alignment (the sheet, the details, every text the wizard stored for him).
    const snapshot = await app.server.publicCampaign.readPublicCampaign(campaign.cid);
    const hero = snapshot.entities.find((row) => row.id === campaign.heroId);
    if (!hero) throw new Error(`Table ${table}: the hero is not on record`);
    if (ALIGNMENT.test(JSON.stringify(hero))) throw new Error(`Table ${table}: the hero's record names an alignment after the review — nothing frozen`);
    const companions = snapshot.entities.filter((row) => row.kind === "companion");
    const companionIds = companions.map((row) => row.id), companionNames = companions.map((row) => row.name);
    made[table] = { ...campaign, alignmentRemoved: removed, companionIds, companionNames, opening: snapshot.scenes?.map((s) => ({ title: s.title ?? null, chars: String(s.body ?? "").length })) ?? [] };
    log(`  freeze ${table}: campaign ${campaign.cid} made${removed.length ? ` (the review cut ${removed.length} alignment mention(s) the draft wrote)` : ""}`);
  }
  // The snapshot: both campaigns as the wizard left them, before any prep (no hidden layer in it). The wizard's background
  // jobs are let finish first, so the snapshot holds nothing half-written.
  if (await settle()) throw new Error("the wizard's background jobs did not finish: nothing frozen");
  for (const table of tables) if (app.lib.privateNotes.hiddenLayerOf({ privateState: await privateStateOf(app, made[table].cid) })) throw new Error(`Table ${table}: a layer exists before the prep`);
  const blob = await app.f.db.dumpDataDir("gzip");
  const bytes = Buffer.from(await blob.arrayBuffer());
  await writeAtomic(join(dir, SNAPSHOT), bytes);
  const manifest = { stage: STAGE, design: DESIGN_SHA256, builtAt: new Date().toISOString(), by, owner: app.owner,
    snapshot: { file: SNAPSHOT, bytes: bytes.length, sha256: sha256(bytes), note: "The local database after the wizard and the opening of both tables, before any prep (PGlite data directory, gzip)." },
    tables: {} };
  for (const table of tables) {
    const { cid } = made[table];
    const before = await privateStateOf(app, cid);
    let after = before, attempts = 0;
    while (!app.lib.privateNotes.hiddenLayerOf({ privateState: after }) && attempts < 2 && !meter.stopped) {
      attempts++;
      await meter.within({ session: `freeze ${table}`, purpose: "prep" }, () => app.server.prep.prepHiddenLayer(cid, app.owner, "first"));
      after = await privateStateOf(app, cid);
    }
    const layer = app.lib.privateNotes.hiddenLayerOf({ privateState: after });
    if (!layer) throw new Error(`Table ${table}: the prep wrote no layer in ${attempts} attempt(s)${meter.stopped ? ` (stopped: ${meter.stopped})` : ""}`);
    const { set: writes, removed } = writesBetween(before, after, parseNoteValue);
    if (removed.length) throw new Error(`Table ${table}: the prep removed notes (${removed.map((r) => r.key).join(", ")})`);
    const file = { stage: STAGE, table, note: "DM-only: the hidden layer the DM prepared once for this table, written into the DM's private notes at the start of every session here. Never shown to a player.",
      campaignId: cid, heroId: made[table].heroId, preparedAt: new Date().toISOString(), preparedBy: by, prepAttempts: attempts, companionIds: made[table].companionIds, companionNames: made[table].companionNames,
      layer, writes, stored: storedOf(after, writes) };
    file.sha256 = layerSha256(file);
    file.threads = threadsOf(file);
    await writeAtomic(join(dir, layerFile(table)), `${JSON.stringify(file, null, 2)}\n`);
    await writeAtomic(join(dir, `${table}-dm-only.md`), layerMarkdown(file));
    manifest.tables[table] = { campaignId: cid, heroId: made[table].heroId, worldId: made[table].worldId, adventureId: made[table].adventureId, steps: made[table].steps,
      alignmentRemoved: made[table].alignmentRemoved, layer: { file: layerFile(table), sha256: file.sha256, chars: layer.length, writes: writes.length, threads: file.threads.length } };
    log(`  freeze ${table}: the layer — ${layer.length} characters, ${writes.length} write(s), ${file.threads.length} thread(s), sha256 ${file.sha256.slice(0, 16)}…`);
  }
  await writeAtomic(join(dir, MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

/** The DM-only file as the owner reads it. */
export function layerMarkdown(file) {
  return [`# Table ${file.table} — the frozen hidden layer (DM-only)`, "", `sha256 \`${file.sha256}\` · campaign \`${file.campaignId}\` · prepared ${file.preparedAt}${file.preparedBy ? ` by ${file.preparedBy}` : ""}`, "",
    "The DM prepared this once, before any player sat at the table; every session here starts with it in the DM's private notes. No player sees it.", "",
    "## The layer", "", "````text", file.layer, "````", "",
    "## The threads (W3)", "", ...file.threads.map((t) => `- **${t.id}** (${t.kind}): ${t.text}`), "",
    "## Every write into the DM's notes", "", ...file.writes.map((w) => `- \`${w.kind}\` \`${w.key}\`: ${w.key === "hidden_layer" ? "(the layer above)" : String(w.value).replace(/\s+/g, " ").slice(0, 400)}`), ""].join("\n");
}

// ---- a session from the frozen world -------------------------------------------------------------------------------------

export function readFrozen(dir, table = null) {
  if (!existsSync(join(dir, MANIFEST))) throw new Error(`no frozen world in ${dir} (run the freeze first)`);
  const manifest = readJson(join(dir, MANIFEST));
  const files = Object.fromEntries(Object.keys(manifest.tables).filter((t) => !table || t === table).map((t) => {
    const file = readJson(join(dir, layerFile(t)));
    if (layerSha256(file) !== file.sha256 || file.sha256 !== manifest.tables[t].layer.sha256) throw new Error(`Table ${t}: the DM-only file does not match its hash`);
    return [t, file];
  }));
  return { manifest, files };
}

/** The snapshot as this process's database: { db, owner, query, one, saves, fence }, as the storage fixture gives them. */
export async function openFrozenDatabase(dir) {
  const { manifest } = readFrozen(dir);
  const bytes = readFileSync(join(dir, manifest.snapshot.file));
  if (sha256(bytes) !== manifest.snapshot.sha256) throw new Error("the world's snapshot does not match its hash");
  const { PGlite } = await import("@electric-sql/pglite");
  const db = new PGlite({ loadDataDir: new Blob([bytes]) });
  const owner = manifest.owner;
  const query = async (sql, params = []) => (await db.query(sql, params)).rows;
  const one = async (sql, params = []) => (await query(sql, params))[0];
  await one("select set_config('request.jwt.claim.sub',$1,false)", [owner]);
  const saves = async (cid, action, payload = {}, user = owner) => (await one("select public.rpg_saves($1,$2,$3,$4::jsonb) result", [user, cid, action, JSON.stringify(payload)])).result;
  const fence = async (cid) => saves(cid, "fence");
  return { db, owner, other: null, query, one, saves, fence };
}

/**
 * Starts one session at its table from the frozen world: the table's DM-only file written into the campaign's private
 * notes (the app's own private-notes call, as the prep writes them), then checked. A process plays at most one session
 * per table (the snapshot is loaded once per process). Returns { made, prep } as game player 1's run expects.
 */
export function frozenStarter(dir) {
  const used = new Set();
  return async (app, slot, { meter }) => {
    if (used.has(slot.table)) throw new Error(`Table ${slot.table} was already played in this process: a session starts from the snapshot, once per process`);
    used.add(slot.table);
    const { manifest, files } = readFrozen(dir, slot.table);
    const file = files[slot.table], table = manifest.tables[slot.table];
    const cid = table.campaignId;
    const dossier = await app.server.dossier.dossierService(app.owner, cid);
    const source = await dossier.source();
    if (app.lib.privateNotes.hiddenLayerOf(source)) throw new Error(`Table ${slot.table}: the campaign already holds a layer before the frozen file is written`);
    await meter.within({ session: slot.key, purpose: "frozen layer" }, () => dossier.privateNotes({ set: file.writes, remove: [] }, source.timeline));
    const state = await privateStateOf(app, cid);
    const now = storedOf(state, file.writes);
    if (canonical(now) !== canonical(file.stored)) throw new Error(`Table ${slot.table}: the DM's notes do not hold the frozen file after writing it`);
    const layer = app.lib.privateNotes.hiddenLayerOf({ privateState: state });
    return {
      made: { cid, heroId: table.heroId, worldId: table.worldId, adventureId: table.adventureId, steps: table.steps },
      prep: { frozen: true, hasLayer: layer.length > 0, chars: layer.length, clocks: Object.keys(state.clock ?? {}).length, pureSimulation: false,
        layerSha256: file.sha256, layerFile: file.table ? layerFile(file.table) : null, preparedAt: file.preparedAt, preparedBy: file.preparedBy, snapshotSha256: manifest.snapshot.sha256, threads: file.threads.length },
    };
  };
}
