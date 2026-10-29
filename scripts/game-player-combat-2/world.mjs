// Game player combat 2: the frozen Coast Way, on SAME_WORLD_1's mechanism (scripts/game-player-same-world-1/world.mjs on
// origin/claude/game-player-same-world-1, adapted to the one table and to COMBAT_1's campaign). `freezeWorld` makes the
// campaign once with COMBAT_1's wizard steps (07's premise and secrets, the hero without an alignment line, Tamsin set by
// the owner's correction after the opening), keeps the local database as a snapshot before any prep, then runs the app's
// own prep once and keeps its writes to the DM's private notes as the DM-only file, hashed; one blind pass reads the
// layer (the band, the captive, the price). `openFrozenDatabase` loads the snapshot for a session's process;
// `frozenStarter` writes the file into the campaign's private notes through the app's own call and checks the notes hold
// exactly the file before the first turn. Nothing here reaches the player: the snapshot is taken before the prep, and the
// file is written to the DM's notes only.
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createCampaign } from "../game-player-1/table.mjs";
import { jsonIn } from "../game-player-1/welfare.mjs";
import { JUDGE_MAX_TOKENS, JUDGE_MODELS } from "../game-player-1/measures.mjs";
import { DESIGN_SHA256, LAYER_RULE, LAYER_SYSTEM, STAGE, TABLE } from "./frozen.mjs";

export const SNAPSHOT = "world-base.tar.gz";
export const MANIFEST = "manifest.json";
export const layerFile = (table = TABLE) => `${table}-dm-only.json`;
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

// ---- the layer's reading (once) -----------------------------------------------------------------------------------------

export const layerRequest = (layer) => ({ system: LAYER_SYSTEM, user: `Questions:\n${LAYER_RULE}\n\nThe preparation:\n<<<\n${layer}\n>>>\n\nAnswer with {"band":[{"name":"…","role":"…"}],"chief":"…"|null,"captives":[{"name":"…","who":"…","why_held":"…"}],"chief_takes":"…"|null,"if_one_dies":"…"|null,"goods":"…"|null,"exits":{"fight":0|1,"withdraw":0|1,"parley":0|1,"surrender":0|1}}.` });
export function parseLayerReading(text) {
  const v = jsonIn(text);
  if (!v || !Array.isArray(v.band) || !Array.isArray(v.captives)) return null;
  const str = (x) => (typeof x === "string" && x.trim() ? x.trim() : null);
  return { band: v.band.map((b) => ({ name: str(b?.name), role: str(b?.role) })), chief: str(v.chief),
    captives: v.captives.map((c) => ({ name: str(c?.name), who: str(c?.who), whyHeld: str(c?.why_held) })).filter((c) => c.name),
    chiefTakes: str(v.chief_takes), ifOneDies: str(v.if_one_dies), goods: str(v.goods),
    exits: Object.fromEntries(["fight", "withdraw", "parley", "surrender"].map((e) => [e, v.exits?.[e] === 1 ? 1 : 0])) };
}
/** The freeze stands when the layer holds exactly one captive with one name. */
export const oneCaptive = (reading) => Boolean(reading && reading.captives.length === 1 && reading.captives[0].name);
/** The captive's name tokens a session's text is searched for (the first name, and the whole name). */
export function captiveNames(reading) {
  const name = reading?.captives?.[0]?.name ?? null;
  if (!name) return [];
  const first = name.split(/\s+/)[0];
  return [...new Set([name, first].filter((x) => x && x.length >= 3))];
}
export const mentions = (text, names) => names.some((n) => new RegExp(`(?<![\\p{L}\\p{N}])${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}])`, "iu").test(String(text ?? "")));

// ---- the freeze -----------------------------------------------------------------------------------------------------------

/**
 * Builds the frozen Coast Way in `dir`: the campaign made by the wizard (with `setup`, COMBAT_1's), the snapshot before
 * any prep, then one prep and its DM-only file, then one reading of the layer. `app` is open on a fresh database; every
 * model call runs in the meter's context (`freeze CW`). `ask` sends the reading (the judge's adapter). Returns the manifest.
 */
export async function freezeWorld({ app, meter, dir, setup, ask, log = () => {}, by = null, settle = async () => 0, models = JUDGE_MODELS }) {
  const { parseNoteValue } = app.lib.privateNotes;
  await mkdir(dir, { recursive: true });
  const session = `freeze ${TABLE}`;
  const campaign = await meter.within({ session, purpose: "wizard" }, () => createCampaign(app, { table: TABLE, log, closed: () => Boolean(meter.stopped), setup }));
  const cid = campaign.cid;
  const snapshotRead = await app.server.publicCampaign.readPublicCampaign(cid);
  const companions = snapshotRead.entities.filter((row) => row.kind === "companion");
  log(`  freeze ${TABLE}: campaign ${cid} made (${companions.map((c) => `${c.name} ${c.hp}/${c.max_hp}`).join(", ") || "no companions"})`);
  // The snapshot: the campaign as the wizard and the owner's correction left it, before any prep (no hidden layer in it).
  // The wizard's background jobs finish first, so the snapshot holds nothing half-written.
  if (await settle()) throw new Error("the wizard's background jobs did not finish: nothing frozen");
  if (app.lib.privateNotes.hiddenLayerOf({ privateState: await privateStateOf(app, cid) })) throw new Error("a layer exists before the prep: nothing frozen");
  const blob = await app.f.db.dumpDataDir("gzip");
  const bytes = Buffer.from(await blob.arrayBuffer());
  await writeAtomic(join(dir, SNAPSHOT), bytes);
  const manifest = { stage: STAGE, design: DESIGN_SHA256, builtAt: new Date().toISOString(), by, owner: app.owner,
    snapshot: { file: SNAPSHOT, bytes: bytes.length, sha256: sha256(bytes), note: "The local database after the wizard, the opening and the owner's correction of Tamsin, before any prep (PGlite data directory, gzip)." },
    tables: {} };
  // The prep, once.
  const before = await privateStateOf(app, cid);
  let after = before, attempts = 0;
  while (!app.lib.privateNotes.hiddenLayerOf({ privateState: after }) && attempts < 2 && !meter.stopped) {
    attempts++;
    await meter.within({ session, purpose: "prep" }, () => app.server.prep.prepHiddenLayer(cid, app.owner, "first"));
    after = await privateStateOf(app, cid);
  }
  const layer = app.lib.privateNotes.hiddenLayerOf({ privateState: after });
  if (!layer) throw new Error(`the prep wrote no layer in ${attempts} attempt(s)${meter.stopped ? ` (stopped: ${meter.stopped})` : ""}`);
  const { set: writes, removed } = writesBetween(before, after, parseNoteValue);
  if (removed.length) throw new Error(`the prep removed notes (${removed.map((r) => r.key).join(", ")})`);
  // The reading of the layer, once (the band, the captive, the price).
  const r = await ask({ session, model: models.referee, ...layerRequest(layer), maxTokens: JUDGE_MAX_TOKENS.threadsReferee, effort: models.refereeEffort, purpose: "the layer's reading" });
  const reading = r.notSent ? null : parseLayerReading(r.text);
  const file = { stage: STAGE, table: TABLE, note: "DM-only: the hidden layer the DM prepared once for the Coast Way, written into the DM's private notes at the start of every session. Never shown to a player.",
    campaignId: cid, heroId: campaign.heroId, preparedAt: new Date().toISOString(), preparedBy: by, prepAttempts: attempts, companions: companions.map((c) => ({ id: c.id, name: c.name, hp: c.hp, maxHp: c.max_hp })),
    layer, writes, stored: storedOf(after, writes), reading, oneCaptive: oneCaptive(reading) };
  file.sha256 = layerSha256(file);
  await writeAtomic(join(dir, layerFile()), `${JSON.stringify(file, null, 2)}\n`);
  await writeAtomic(join(dir, `${TABLE}-dm-only.md`), layerMarkdown(file));
  manifest.tables[TABLE] = { campaignId: cid, heroId: campaign.heroId, worldId: campaign.worldId, adventureId: campaign.adventureId, steps: campaign.steps,
    layer: { file: layerFile(), sha256: file.sha256, chars: layer.length, writes: writes.length, oneCaptive: file.oneCaptive, captive: reading?.captives?.[0]?.name ?? null } };
  await writeAtomic(join(dir, MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`);
  log(`  freeze ${TABLE}: the layer — ${layer.length} characters, ${writes.length} write(s), sha256 ${file.sha256.slice(0, 16)}…; captive(s): ${reading ? reading.captives.map((c) => c.name).join(", ") || "none" : "unread"}`);
  return manifest;
}

/** The header of the frozen layer as the owner reads it (no layer text). */
export function layerHeader(file, manifest = null) {
  const r = file.reading;
  const line = (label, value) => `- **${label}:** ${value ?? "—"}`;
  return [`# The Coast Way — the frozen hidden layer (DM-only)`, "",
    `sha256 \`${file.sha256}\` · ${file.layer.length} characters, ${file.writes.length} writes into the DM's notes · campaign \`${file.campaignId}\` · prepared ${file.preparedAt}${file.preparedBy ? ` by ${file.preparedBy}` : ""}${manifest ? ` · snapshot sha256 \`${manifest.snapshot.sha256}\`` : ""}`, "",
    "The DM prepared this once, before any player sat at the table; every session starts with it in the DM's private notes. No player sees it.", "",
    "The layer's reading (one blind pass at the freeze):", "",
    line("The band", r ? r.band.map((b) => `${b.name ?? "(unnamed)"} — ${b.role ?? "?"}`).join("; ") : "unread"),
    line("The chief", r?.chief),
    line(`The captive${r && r.captives.length !== 1 ? `s (${r.captives.length})` : ""}`, r ? r.captives.map((c) => `**${c.name}** — ${c.who ?? "?"}; held because ${c.whyHeld ?? "?"}`).join("; ") || "none" : "unread"),
    line("What the chief will take", r?.chiefTakes),
    line("If one of theirs dies", r?.ifOneDies),
    line("The goods", r?.goods),
    line("Exits the layer names", r ? Object.entries(r.exits).map(([e, v]) => `${e} ${v ? "yes" : "no"}`).join(", ") : "unread"),
    line("One captive, one name", file.oneCaptive ? "yes" : "**no — the freeze does not stand**")].join("\n");
}

/** The DM-only file as the owner reads it. */
export function layerMarkdown(file, manifest = null) {
  return [layerHeader(file, manifest), "", "## The layer", "", "````text", file.layer, "````", "",
    "## Every write into the DM's notes", "", ...file.writes.map((w) => `- \`${w.kind}\` \`${w.key}\`: ${w.key === "hidden_layer" ? "(the layer above)" : String(w.value).replace(/\s+/g, " ").slice(0, 400)}`), ""].join("\n");
}

// ---- a session from the frozen world --------------------------------------------------------------------------------------

export function readFrozen(dir) {
  if (!existsSync(join(dir, MANIFEST))) throw new Error(`no frozen world in ${dir} (run the freeze first)`);
  const manifest = readJson(join(dir, MANIFEST));
  const file = readJson(join(dir, layerFile()));
  if (layerSha256(file) !== file.sha256 || file.sha256 !== manifest.tables[TABLE].layer.sha256) throw new Error("the DM-only file does not match its hash");
  return { manifest, file };
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
 * Starts one session from the frozen world: the DM-only file written into the campaign's private notes (the app's own
 * private-notes call, as the prep writes them), then checked. A process plays one session (the snapshot is loaded once
 * per process). Returns { made, prep } as game player 1's run expects.
 */
export function frozenStarter(dir) {
  let used = false;
  return async (app, slot, { meter }) => {
    if (used) throw new Error("a session starts from the snapshot, once per process");
    used = true;
    const { manifest, file } = readFrozen(dir);
    const table = manifest.tables[TABLE];
    const cid = table.campaignId;
    const dossier = await app.server.dossier.dossierService(app.owner, cid);
    const source = await dossier.source();
    if (app.lib.privateNotes.hiddenLayerOf(source)) throw new Error("the campaign already holds a layer before the frozen file is written");
    await meter.within({ session: slot.key, purpose: "frozen layer" }, () => dossier.privateNotes({ set: file.writes, remove: [] }, source.timeline));
    const state = await privateStateOf(app, cid);
    if (canonical(storedOf(state, file.writes)) !== canonical(file.stored)) throw new Error("the DM's notes do not hold the frozen file after writing it");
    const layer = app.lib.privateNotes.hiddenLayerOf({ privateState: state });
    return {
      made: { cid, heroId: table.heroId, worldId: table.worldId, adventureId: table.adventureId, steps: table.steps },
      prep: { frozen: true, hasLayer: layer.length > 0, chars: layer.length, clocks: Object.keys(state.clock ?? {}).length, pureSimulation: false,
        layerSha256: file.sha256, layerFile: layerFile(), preparedAt: file.preparedAt, preparedBy: file.preparedBy, snapshotSha256: manifest.snapshot.sha256,
        captive: file.reading?.captives?.[0]?.name ?? null },
    };
  };
}
