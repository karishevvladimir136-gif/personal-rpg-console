// Game party 1: the three arms' campaigns, built once and frozen (GAME_PLAYER_SAME_WORLD_1's mechanism). `buildWorld`
// makes the three campaigns on one local database through the app's own calls — the wizard (world from Table C's files,
// Bram through the wizard's commit with the frozen review), the canon and the DM guide with the table note, Sefa and Pell
// written as party companions with the same records (the owner's own saves: entity, storage, items), the arm's adventure
// and DM-only wishes, the owner's DM settings (companions' rolls are the players' cards; P-SAND the pure-simulation flag),
// the craft cards, pictures and soundtrack off, the opening proposed by the DM and confirmed (the review leaves out any
// actor the opening made of a player character), then the seating — and keeps the database as a snapshot. `prepareLayers`
// runs the app's own prep once for P-GOAL and once for P-DUNGEON on that snapshot and keeps each prep's writes to the DM's
// private notes as the arm's DM-only file, with its hash. P-SAND has no prep. `tableStarter` loads the snapshot for a
// table and writes its arm's layer into the DM's notes through the app's private-notes call, checked.
//
// Two writes have no owner screen in the app and are made here directly on the local database, before the snapshot
// (the seating, and nothing else): the runtime's party configuration — Sefa and Pell controlled and present beside Bram,
// so their checks are player cards — and the counters' labels on the companions' records (the wizard's commit writes the
// hero's the same way). Both are checked by reading the app back.
import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { OWNER_SETTINGS } from "../game-player-1/table.mjs";
import { campaignFiles } from "../game-player-1/frozen.mjs";
import { canonical, layerSha256, privateStateOf, storedOf, threadsOf, writesBetween } from "../game-player-same-world-1/world.mjs";
import { ARMS, ARM_CAMPAIGNS, DESIGN_SHA256, STAGE, TABLE_NOTE } from "./frozen.mjs";
import { CHARACTERS, REVIEWS } from "./sheets.mjs";

export const SNAPSHOT = "world-base.tar.gz";
export const MANIFEST = "manifest.json";
export const layerFile = (arm) => `${arm}-dm-only.json`;
export const LAYER_ARMS = ARMS.filter((arm) => !ARM_CAMPAIGNS[arm].pureSimulation);
const sha256 = (data) => createHash("sha256").update(data).digest("hex");
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
async function writeAtomic(path, data) { await writeFile(`${path}.tmp`, data); await rename(`${path}.tmp`, path); }
const ALIGNMENT = /\balignment\b|\b(?:lawful|neutral|chaotic)[ -](?:good|neutral|evil)\b|\btrue neutral\b/i;

/** The world's files: Table C's (game player 1's campaign files: world form, canon, DM guide) with the table note. */
export function partyFiles() {
  const f = campaignFiles();
  return { worldName: f.worldName, setting: f.setting, canon: f.canon, guide: `${f.guide}\n\n${TABLE_NOTE}` };
}

/** The companion's records from its review, as the wizard's commit writes the hero's (migration 202610200084): the
 * entity (kind companion), its storage, its things (category = kind; a thing with a slot is worn). */
export function companionRecords(review, mechanics, slots) {
  const resources = {
    ...Object.fromEntries(review.counters.map((c) => [c.key, c.value])),
    ...Object.fromEntries(review.counters.filter((c) => c.max !== null).map((c) => [`${c.key}_max`, c.max])),
    ...Object.fromEntries(review.wallet.map((c) => [`currency_${c.code.replace(/ /g, "_")}`, c.amount])),
  };
  const entity = { kind: "companion", name: review.name, details: review.description, hp: mechanics.hp, max_hp: mechanics.hp,
    stats: { skill: mechanics.skill, attack: mechanics.attack, defense: mechanics.defense }, resources, conditions: [], equipment_slots: slots, character_sheet: review.sheet };
  const items = review.possessions.map((x) => ({ name: x.name, category: x.kind, quantity: x.quantity, description: x.description, mechanics: x.mechanics ?? "", detail: x.detail ?? {}, slot: x.slot ?? null }));
  const counterLabels = Object.fromEntries(review.counters.map((c) => [c.key, c.label]));
  return { entity, items, counterLabels };
}

/** One arm's campaign, made as the owner makes one: returns { cid, heroId, companions: {sefa, pell}, worldId, adventureId, steps }. */
export async function createArmCampaign(app, arm, { log = () => {}, closed = () => false } = {}) {
  const { server, lib } = app;
  const files = partyFiles();
  const campaign = ARM_CAMPAIGNS[arm];
  const steps = [];
  const fence = (cid) => app.f.fence(cid);
  // World: Table C's Beregost (the Sword Coast form).
  const worlds = await server.adventures.adventureService(null);
  const world = (await worlds.performWorld(lib.client.createWorldAttempt(await worlds.worlds(), { title: files.worldName, premise: files.setting, packVersionIds: [] }))).world;
  steps.push({ step: "world", worldId: world.id, title: world.title });
  // Bram: the wizard's DM drafts from «Who are you?»; the owner's review is the frozen one, whole (the answers line up
  // with the draft's questions, unanswered).
  const bram = REVIEWS.bram;
  const input = { requestId: randomUUID(), worldId: world.id, worldVersion: world.version, title: `${campaign.title}`.slice(0, 200), language: "en", name: bram.name, description: bram.description };
  const draft = await server.bootstrap.performBootstrap({ action: "creation.propose", input });
  if (draft?.proposal?.schemaVersion !== 3) throw new Error(`${arm}: the hero draft is not schema 3 (${draft?.proposal?.schemaVersion})`);
  const review = lib.heroDraft.heroReviewForCommit({ ...structuredClone(bram), answers: draft.proposal.questions.map(() => null) });
  if (ALIGNMENT.test(JSON.stringify(review))) throw new Error("the frozen review names an alignment");
  const created = await server.bootstrap.performBootstrap({ action: "creation.commit", input: { requestId: randomUUID(), draftId: draft.draftId, review } });
  const cid = created.campaignId, heroId = created.heroId;
  steps.push({ step: "hero", heroId, name: bram.name, drafted: draft.proposal.notes?.length ? "with notes" : "clean", reviewReplaced: true, hp: review.mechanics.hp, ac: review.sheet.armorClass });
  log(`  ${arm}: Bram committed through the wizard`);
  // Documents: the DM guide (with the table note) and the canon.
  const mutate = async (operation, payload, expectedRevision, correctionScope = undefined) => server.repository.applyMutation({ requestId: randomUUID(), operation, campaignId: cid, expectedRevision, payload, timeline: await fence(cid), ...(correctionScope ? { correctionScope } : {}) });
  let snapshot = await server.publicCampaign.readPublicCampaign(cid);
  const guide = snapshot.documents.find((d) => d.id === snapshot.dmGuideDocumentId);
  if (!guide) throw new Error(`${arm}: the campaign has no DM guide document`);
  await mutate("document.save", { id: guide.id, title: guide.title, status: guide.status, body: files.guide }, guide.revision);
  await mutate("document.save", { title: "The Sword Coast — canon", status: "canon", body: files.canon }, 0);
  // Adventure: the wishes (DM-only) first, then the adventure (the premise names all three; no «who goes with the hero»).
  if (campaign.wishes.trim()) await server.secrets.saveDmSecrets(cid, { scope: "wishes", body: campaign.wishes.trim(), rebuild: false });
  const adventures = await server.adventures.adventureService(cid);
  const catalog = await adventures.read(cid, await fence(cid));
  const prepared = await adventures.perform(lib.client.prepareAdventureAttempt(catalog, { title: campaign.title, premise: lib.wizardText.wizardAdventurePremise(campaign.premise, "", "en"), pacing: { kind: "evening", custom: null } }));
  const adventure = prepared.snapshot.adventures.find((a) => a.status === "prepared");
  steps.push({ step: "adventure", title: campaign.title, wishesChars: campaign.wishes.length });
  // DM: the owner's settings; the companions' rolls are their players' cards; P-SAND plays pure simulation.
  const current = await server.dmSettings.readDmSettings(cid);
  await server.dmSettings.saveDmSettings(cid, { expectedRevision: current.revision, ...OWNER_SETTINGS,
    options: { ...current.options, ...OWNER_SETTINGS.options, companionRolls: "player", ...(campaign.pureSimulation ? { pureSimulation: true } : {}) } });
  const saved = await server.dmSettings.readDmSettings(cid);
  steps.push({ step: "dm", split: saved.split ? `${saved.split.writer.modelId} writes, ${saved.split.bookkeeper.modelId} records` : "single", depth: saved.depth, options: saved.options });
  steps.push({ step: "craft", ...(await activateCraft(server)) });
  steps.push({ step: "media", ...(await mediaOff(app, cid)) });
  // Opening: proposed by the campaign's DM; the owner confirms it, leaving out any actor that is one of the three.
  const start = lib.client.versionAdventureAttempt(prepared.snapshot, adventure.id, "start");
  let opening, proposals = 1;
  try { opening = await server.bootstrap.performBootstrap({ action: "opening.propose", input: start }); }
  catch (error) {
    if (closed()) throw error;
    log(`  ${arm}: the opening proposal failed (${String(error?.code ?? error?.message ?? error).slice(0, 60)}) — proposing once more`);
    proposals++;
    opening = await server.bootstrap.performBootstrap({ action: "opening.propose", input: lib.client.versionAdventureAttempt(prepared.snapshot, adventure.id, "start") });
  }
  const pcWords = CHARACTERS.flatMap((c) => [c.name.toLowerCase(), c.short.toLowerCase()]);
  const isPc = (actor) => pcWords.some((w) => String(actor.name ?? "").toLowerCase().includes(w));
  const dropped = opening.proposal.actors.filter(isPc).map((a) => a.name);
  const openingReview = lib.openingAnswers.applyOpeningAnswers({ ...lib.validation.initialOpeningReview(opening.proposal), actors: opening.proposal.actors.filter((a) => !isPc(a)), publicOpeningConfirmed: true }, opening.proposal.questions, "en");
  const startMinutes = lib.wizardText.startMinutesFromText(`${opening.proposal.narration ?? ""} ${opening.proposal.situation ?? ""}`, "en");
  await server.bootstrap.performBootstrap({ action: "opening.commit", input: { requestId: randomUUID(), campaignId: cid, draftId: opening.draftId, review: openingReview, startMinutes } });
  steps.push({ step: "opening", proposals, location: opening.proposal.location?.name ?? null, actors: opening.proposal.actors.length, droppedPcActors: dropped, questions: opening.proposal.questions.length, startMinutes });
  log(`  ${arm}: opening committed${dropped.length ? ` (the review left out ${dropped.join(", ")}: already at the table)` : ""}`);
  // Sefa and Pell: party companions with the same records (the owner's saves) — after the opening, which the app
  // starts only for a campaign whose one character is its hero.
  const hero = (await server.publicCampaign.readPublicCampaign(cid)).entities.find((e) => e.id === heroId);
  const companions = {};
  for (const id of ["sefa", "pell"]) {
    const r = lib.heroDraft.heroReviewForCommit(structuredClone(REVIEWS[id]));
    const rows = companionRecords(r, r.mechanics, structuredClone(hero.equipment_slots));
    const saved = await mutate("entity.save", rows.entity, 0, "timeline");
    const storage = await mutate("storage.save", { name: "Possessions", kind: "companion", entity_id: saved.id, detail: {} }, 0, "timeline");
    for (const x of rows.items) {
      await mutate("item.save", { name: x.name, category: x.category, quantity: x.quantity, description: x.description, mechanics: x.mechanics, detail: x.detail,
        owner_entity_id: saved.id, storage_id: storage.id, equipped_entity_id: x.slot ? saved.id : null, equipped_slot: x.slot, rarity: null }, 0, "timeline");
    }
    companions[id] = { id: saved.id, storageId: storage.id, counterLabels: rows.counterLabels, items: rows.items.length };
  }
  steps.push({ step: "companions", companions: Object.fromEntries(Object.entries(companions).map(([k, v]) => [k, { id: v.id, items: v.items }])) });
  // The seating (no owner screen for it): the party configuration and the companions' counter labels.
  steps.push({ step: "seating", ...(await seat(app, cid, heroId, companions)) });
  return { cid, heroId, companions: Object.fromEntries(Object.entries(companions).map(([k, v]) => [k, v.id])), worldId: world.id, adventureId: adventure.id, steps };
}

/** Sefa and Pell joined to the party (controlled, present) beside Bram; their counters' labels as the commit writes the
 * hero's. Read back through the app: the play state's configuration and the public records. */
export async function seat(app, cid, heroId, companions) {
  const ids = Object.values(companions).map((c) => c.id);
  const row = await app.f.one("select configuration from rpg_private.runtime_state where campaign_id=$1", [cid]);
  const config = row?.configuration ?? { profile: "console-basic-v1", controlledEntityIds: [heroId], presentEntityIds: [heroId], nearbyStorageIds: [], safeLocationIds: [], itemRules: [] };
  const next = { ...config, controlledEntityIds: [...new Set([heroId, ...(config.controlledEntityIds ?? []), ...ids])], presentEntityIds: [...new Set([...(config.presentEntityIds ?? []), heroId, ...ids])] };
  await app.f.one("update rpg_private.runtime_state set configuration=$2::jsonb, revision=revision+1, updated_at=now() where campaign_id=$1 returning revision", [cid, JSON.stringify(next)]);
  for (const c of Object.values(companions)) {
    await app.f.one("update public.rpg_entities set public_profile=coalesce(public_profile,'{}'::jsonb)||jsonb_build_object('counterLabels',$3::jsonb),revision=revision+1 where campaign_id=$1 and id=$2 and kind='companion' returning id", [cid, c.id, JSON.stringify(c.counterLabels)]);
  }
  const play = await app.server.gameplay.readPlay(cid, { prep: false });
  const controlled = play.configuration?.controlledEntityIds ?? [];
  if (![heroId, ...ids].every((id) => controlled.includes(id))) throw new Error("the party configuration did not read back");
  const snapshot = await app.server.publicCampaign.readPublicCampaign(cid);
  const party = app.lib.campaignView.partyOf(snapshot, play).map((p) => p.entity.name);
  return { controlled: controlled.length, present: play.configuration.presentEntityIds.length, party };
}

/** The DM craft cards, as the owner has them on the DM Craft screen: the latest version of every key active. */
async function activateCraft(server) {
  let view = await server.craft.readDmCraft();
  const keys = [...new Set(view.versions.map((row) => row.key))].sort();
  let activated = 0;
  for (const key of keys) {
    const versions = view.versions.filter((row) => row.key === key).sort((a, b) => b.version - a.version);
    const effective = view.effective.find((row) => row.key === key);
    if (!versions.length || effective?.activeVersionId === versions[0].id) continue;
    view = await server.craft.executeDmCraft({ action: "activate", requestId: randomUUID(), expectedActivationRevision: effective?.activationRevision ?? 0, key, versionId: versions[0].id });
    activated++;
  }
  return { keys: keys.length, activated };
}
/** Pictures, Live frames and the soundtrack off (the owner's switches; no player sees them). */
async function mediaOff(app, cid) {
  const out = {};
  try {
    const s = (await app.server.pictures.readPictureBoard(cid)).settings;
    const saved = await app.server.pictures.savePictureSettings(cid, { ...s, expectedRevision: s.revision, frames: "off", autopilot: { ...(s.autopilot ?? {}), enabled: false } });
    out.pictures = `frames ${saved.frames}, autopilot ${saved.autopilot?.enabled ? "on" : "off"}`;
  } catch (error) { out.pictures = `not saved: ${String(error?.message ?? error).slice(0, 120)}`; }
  try {
    const s = (await app.server.music.readMusicState(cid)).settings;
    const saved = await app.server.music.saveMusicSettings(cid, { ...s, expectedRevision: s.revision, enabled: false });
    out.music = saved.enabled ? "on" : "off";
  } catch (error) { out.music = `not saved: ${String(error?.message ?? error).slice(0, 120)}`; }
  return out;
}

// ---- the freeze ----------------------------------------------------------------------------------------------------------

/** The three arms' campaigns on one database, kept as the snapshot (no prep in it). Returns the manifest. */
export async function buildWorld({ app, meter, dir, log = () => {}, by = null, settle = async () => 0 }) {
  await mkdir(dir, { recursive: true });
  if (existsSync(join(dir, MANIFEST))) throw new Error(`${dir} already holds a frozen world: it is built once (move it aside to build again)`);
  const made = {};
  for (const arm of ARMS) made[arm] = await meter.within({ session: `freeze ${arm}`, purpose: "wizard" }, () => createArmCampaign(app, arm, { log, closed: () => Boolean(meter.stopped) }));
  if (await settle()) throw new Error("the wizard's background jobs did not finish: nothing frozen");
  for (const arm of ARMS) if (app.lib.privateNotes.hiddenLayerOf({ privateState: await privateStateOf(app, made[arm].cid) })) throw new Error(`${arm}: a layer exists before the prep`);
  const blob = await app.f.db.dumpDataDir("gzip");
  const bytes = Buffer.from(await blob.arrayBuffer());
  await writeAtomic(join(dir, SNAPSHOT), bytes);
  const manifest = { stage: STAGE, design: DESIGN_SHA256, builtAt: new Date().toISOString(), by, owner: app.owner,
    snapshot: { file: SNAPSHOT, bytes: bytes.length, sha256: sha256(bytes), note: "The local database after the wizard, the opening and the seating of the three arms' campaigns, before any prep (PGlite data directory, gzip)." },
    arms: Object.fromEntries(ARMS.map((arm) => [arm, { campaignId: made[arm].cid, heroId: made[arm].heroId, companions: made[arm].companions, worldId: made[arm].worldId, adventureId: made[arm].adventureId, steps: made[arm].steps }])),
    layers: {} };
  await writeAtomic(join(dir, MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

/** The prep, once per arm that has one (P-GOAL, P-DUNGEON), on the snapshot: each arm's DM-only file and its hash. */
export async function prepareLayers({ app, meter, dir, arms = LAYER_ARMS, log = () => {}, by = null }) {
  const manifest = readJson(join(dir, MANIFEST));
  const { parseNoteValue } = app.lib.privateNotes;
  for (const arm of arms) {
    if (manifest.layers[arm]) throw new Error(`${arm}: the layer is already frozen (it is prepared once)`);
    const { campaignId: cid, heroId } = manifest.arms[arm];
    const before = await privateStateOf(app, cid);
    let after = before, attempts = 0;
    while (!app.lib.privateNotes.hiddenLayerOf({ privateState: after }) && attempts < 2 && !meter.stopped) {
      attempts++;
      await meter.within({ session: `freeze ${arm}`, purpose: "prep" }, () => app.server.prep.prepHiddenLayer(cid, app.owner, "first"));
      after = await privateStateOf(app, cid);
    }
    const layer = app.lib.privateNotes.hiddenLayerOf({ privateState: after });
    if (!layer) throw new Error(`${arm}: the prep wrote no layer in ${attempts} attempt(s)${meter.stopped ? ` (stopped: ${meter.stopped})` : ""}`);
    const { set: writes, removed } = writesBetween(before, after, parseNoteValue);
    if (removed.length) throw new Error(`${arm}: the prep removed notes (${removed.map((r) => r.key).join(", ")})`);
    const companionIds = Object.values(manifest.arms[arm].companions);
    const file = { stage: STAGE, table: arm, note: "DM-only: the hidden layer the DM prepared once for this arm, written into the DM's private notes at the start of every table here. Never shown to a player.",
      campaignId: cid, heroId, preparedAt: new Date().toISOString(), preparedBy: by, prepAttempts: attempts, companionIds, companionNames: CHARACTERS.filter((c) => c.id !== "bram").map((c) => c.name),
      layer, writes, stored: storedOf(after, writes) };
    file.sha256 = layerSha256(file);
    file.threads = threadsOf(file);
    await writeAtomic(join(dir, layerFile(arm)), `${JSON.stringify(file, null, 2)}\n`);
    await writeAtomic(join(dir, `${arm}-dm-only.md`), layerMarkdown(file));
    manifest.layers[arm] = { file: layerFile(arm), sha256: file.sha256, chars: layer.length, writes: writes.length, threads: file.threads.length, preparedAt: file.preparedAt };
    await writeAtomic(join(dir, MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`);
    log(`  freeze ${arm}: the layer — ${layer.length} characters, ${writes.length} write(s), ${file.threads.length} thread(s), sha256 ${file.sha256.slice(0, 16)}…`);
  }
  return manifest;
}

export function layerMarkdown(file) {
  return [`# ${file.table} — the frozen hidden layer (DM-only)`, "", `sha256 \`${file.sha256}\` · campaign \`${file.campaignId}\` · prepared ${file.preparedAt}${file.preparedBy ? ` by ${file.preparedBy}` : ""}`, "",
    "The DM prepared this once, before any player sat at the table; every table of this arm starts with it in the DM's private notes. No player sees it.", "",
    "## The layer", "", "````text", file.layer, "````", "",
    "## The threads", "", ...file.threads.map((t) => `- **${t.id}** (${t.kind}): ${t.text}`), "",
    "## Every write into the DM's notes", "", ...file.writes.map((w) => `- \`${w.kind}\` \`${w.key}\`: ${w.key === "hidden_layer" ? "(the layer above)" : String(w.value).replace(/\s+/g, " ").slice(0, 400)}`), ""].join("\n");
}

// ---- a table from the frozen world -------------------------------------------------------------------------------------

export function readFrozen(dir) {
  if (!existsSync(join(dir, MANIFEST))) throw new Error(`no frozen world in ${dir} (build it first)`);
  const manifest = readJson(join(dir, MANIFEST));
  const files = Object.fromEntries(Object.keys(manifest.layers ?? {}).map((arm) => {
    const file = readJson(join(dir, layerFile(arm)));
    if (layerSha256(file) !== file.sha256 || file.sha256 !== manifest.layers[arm].sha256) throw new Error(`${arm}: the DM-only file does not match its hash`);
    return [arm, file];
  }));
  return { manifest, files };
}

/** The snapshot as this process's database (game player same-world 1's loader on this stage's manifest). */
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

/** Starts one table from the frozen world: its arm's campaign, with the arm's DM-only file (P-GOAL, P-DUNGEON) written into
 * the DM's private notes and checked. A process plays one table (the snapshot is loaded once per process). */
export function tableStarter(dir) {
  let used = false;
  return async (app, { key, arm }, { meter }) => {
    if (used) throw new Error("a table was already played in this process: a table starts from the snapshot, once per process");
    used = true;
    const { manifest, files } = readFrozen(dir);
    const a = manifest.arms[arm];
    const cid = a.campaignId;
    const dossier = await app.server.dossier.dossierService(app.owner, cid);
    const source = await dossier.source();
    if (app.lib.privateNotes.hiddenLayerOf(source)) throw new Error(`${arm}: the campaign already holds a layer before the frozen file is written`);
    const file = files[arm] ?? null;
    if (LAYER_ARMS.includes(arm) && !file) throw new Error(`${arm}: its layer is not frozen yet`);
    if (file) {
      await meter.within({ session: key, purpose: "frozen layer" }, () => dossier.privateNotes({ set: file.writes, remove: [] }, source.timeline));
      const state = await privateStateOf(app, cid);
      if (canonical(storedOf(state, file.writes)) !== canonical(file.stored)) throw new Error(`${arm}: the DM's notes do not hold the frozen file after writing it`);
    }
    const state = await privateStateOf(app, cid);
    const layer = app.lib.privateNotes.hiddenLayerOf({ privateState: state });
    return { cid, heroId: a.heroId, companions: a.companions, steps: a.steps,
      prep: { frozen: Boolean(file), pureSimulation: !file, hasLayer: layer.length > 0, chars: layer.length, layerSha256: file?.sha256 ?? null, layerFile: file ? layerFile(arm) : null,
        preparedAt: file?.preparedAt ?? null, preparedBy: file?.preparedBy ?? null, snapshotSha256: manifest.snapshot.sha256, threads: file?.threads?.length ?? 0, layerText: file?.layer ?? "" } };
  };
}
