// Game party 2: the three situations' campaigns, built once and frozen — MULTI_HERO_1's company world (world.mjs there:
// the company's documents, no main character, the option `company` with the table's coin) with this stage's campaigns.
// What is frozen, in this order:
//   1. the world: three company campaigns (S1, S2, S3) — the wizard, the opening, the seating — kept as one snapshot,
//      with no secret and no layer in it; the layer's die (S1: who falls) and coin (S2: who receives the letter) are drawn
//      here, once, and recorded in the manifest;
//   2. the layers: per situation, the situation note without its variant (prepNote) is saved as the campaign's DM-only
//      secrets, then the DM prepares its hidden layer once on that; the layer file is frozen with its sha256;
//   3. per table (tableStarter): the snapshot, the frozen layer written to the DM's notes, and the arm's whole note
//      (situationNote: shared + variant) saved as the campaign's DM-only secrets, `rebuild: false` (no prep at the table).
import { createHash, randomInt, randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { OWNER_SETTINGS } from "../game-player-1/table.mjs";
import { canonical, layerSha256, privateStateOf, storedOf, threadsOf, writesBetween } from "../game-player-same-world-1/world.mjs";
import { companionRecords, seat } from "../game-party-1/world.mjs";
import { CHARACTERS, REVIEWS } from "../multi-hero-1/sheets.mjs";
import { DESIGN_SHA256, SITUATIONS, STAGE, armOf, companyFiles, dmCompanyLine, ownerOpeningAnswer, prepNote, seatsFrom, situationNote } from "./frozen.mjs";

export const SNAPSHOT = "world-base.tar.gz";
export const MANIFEST = "manifest.json";
export const SITUATION_IDS = Object.keys(SITUATIONS);
export const layerFile = (situation) => `${situation}-dm-only.json`;
const sha256 = (data) => createHash("sha256").update(data).digest("hex");
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
async function writeAtomic(path, data) { await writeFile(`${path}.tmp`, data); await rename(`${path}.tmp`, path); }
const SEAT_IDS = CHARACTERS.map((c) => c.id);

/** The DM settings of a situation's table: the owner's (Opus 5.5 writes and records), the company option with the table's
 * coin, the players' own cards, English instructions. */
export const situationOptions = (start = 0) => ({ ...OWNER_SETTINGS.options, companionRolls: "player", instructions: "en", company: true, companyStart: start });

/** One situation's campaign as a company table (MULTI_HERO_1's createCompanyCampaign with this stage's campaign). */
export async function createSituationCampaign(app, situation, { log = () => {}, closed = () => false, coin = randomInt(3) } = {}) {
  const { server, lib } = app;
  const s = SITUATIONS[situation];
  const files = companyFiles();
  const seats = seatsFrom(coin);
  const premise = s.premise(seats);
  const steps = [{ step: "coin", coin, seats }];
  const fence = (cid) => app.f.fence(cid);
  const worlds = await server.adventures.adventureService(null);
  const world = (await worlds.performWorld(lib.client.createWorldAttempt(await worlds.worlds(), { title: files.worldName, premise: files.setting, packVersionIds: [] }))).world;
  steps.push({ step: "world", worldId: world.id, title: world.title });
  const bram = REVIEWS.bram;
  const input = { requestId: randomUUID(), worldId: world.id, worldVersion: world.version, title: s.title.slice(0, 200), language: "en", name: bram.name, description: bram.description };
  const draft = await server.bootstrap.performBootstrap({ action: "creation.propose", input });
  if (draft?.proposal?.schemaVersion !== 3) throw new Error(`${situation}: the first record's draft is not schema 3 (${draft?.proposal?.schemaVersion})`);
  const review = lib.heroDraft.heroReviewForCommit({ ...structuredClone(bram), answers: draft.proposal.questions.map(() => null) });
  const created = await server.bootstrap.performBootstrap({ action: "creation.commit", input: { requestId: randomUUID(), draftId: draft.draftId, review } });
  const cid = created.campaignId, heroId = created.heroId;
  steps.push({ step: "first record", entityId: heroId, name: bram.name, reviewReplaced: true });
  log(`  ${situation}: the first record committed through the wizard`);
  const mutate = async (operation, payload, expectedRevision, correctionScope = undefined) => server.repository.applyMutation({ requestId: randomUUID(), operation, campaignId: cid, expectedRevision, payload, timeline: await fence(cid), ...(correctionScope ? { correctionScope } : {}) });
  const snapshot = await server.publicCampaign.readPublicCampaign(cid);
  const guide = snapshot.documents.find((d) => d.id === snapshot.dmGuideDocumentId);
  if (!guide) throw new Error(`${situation}: the campaign has no DM guide document`);
  await mutate("document.save", { id: guide.id, title: guide.title, status: guide.status, body: files.guide }, guide.revision);
  await mutate("document.save", { title: "The Sword Coast — canon", status: "canon", body: files.canon }, 0);
  await server.secrets.saveDmSecrets(cid, { scope: "wishes", body: s.wishes, rebuild: false });
  const adventures = await server.adventures.adventureService(cid);
  const catalog = await adventures.read(cid, await fence(cid));
  const prepared = await adventures.perform(lib.client.prepareAdventureAttempt(catalog, { title: s.title, premise: lib.wizardText.wizardAdventurePremise(`${premise}\n\n${dmCompanyLine(seats)}`, "", "en"), pacing: { kind: "evening", custom: null } }));
  const adventure = prepared.snapshot.adventures.find((a) => a.status === "prepared");
  steps.push({ step: "adventure", title: s.title, wishesChars: s.wishes.length });
  const current = await server.dmSettings.readDmSettings(cid);
  await server.dmSettings.saveDmSettings(cid, { expectedRevision: current.revision, ...OWNER_SETTINGS, options: { ...current.options, ...situationOptions(coin) } });
  const saved = await server.dmSettings.readDmSettings(cid);
  if (saved.options.company !== true || saved.options.companyStart !== coin) throw new Error(`${situation}: the option «company» or its coin did not read back`);
  steps.push({ step: "dm", split: saved.split ? `${saved.split.writer.modelId} writes, ${saved.split.bookkeeper.modelId} records` : "single", depth: saved.depth, options: saved.options });
  steps.push({ step: "craft", ...(await activateCraft(server)) });
  steps.push({ step: "media", ...(await mediaOff(app, cid)) });
  const complete = (o) => Boolean(o?.proposal?.location?.name && o.proposal.location.description && o.proposal.situation && o.proposal.narration);
  let opening = null, proposals = 0;
  const incomplete = [];
  while (proposals < 3 && !complete(opening)) {
    proposals++;
    try { opening = await server.bootstrap.performBootstrap({ action: "opening.propose", input: lib.client.versionAdventureAttempt(prepared.snapshot, adventure.id, "start") }); }
    catch (error) {
      if (closed() || proposals >= 3) throw error;
      log(`  ${situation}: the opening proposal failed (${String(error?.code ?? error?.message ?? error).slice(0, 60)}) — proposing once more`);
      opening = null;
      continue;
    }
    if (!complete(opening)) { incomplete.push({ location: opening.proposal.location?.name ?? null, situation: Boolean(opening.proposal.situation), narration: Boolean(opening.proposal.narration) }); log(`  ${situation}: the opening came back incomplete — proposing once more`); }
  }
  if (!complete(opening)) throw new Error(`${situation}: no complete opening in ${proposals} proposals`);
  const pcWords = CHARACTERS.flatMap((c) => [c.name.toLowerCase(), c.short.toLowerCase()]);
  const isPc = (actor) => pcWords.some((w) => String(actor.name ?? "").toLowerCase().includes(w));
  const dropped = opening.proposal.actors.filter(isPc).map((a) => a.name);
  const answers = opening.proposal.questions.map((q) => (q.consequential ? ownerOpeningAnswer(seats) : null));
  const openingReview = lib.openingAnswers.applyOpeningAnswers({ ...lib.validation.initialOpeningReview(opening.proposal), actors: opening.proposal.actors.filter((a) => !isPc(a)), answers, publicOpeningConfirmed: true }, opening.proposal.questions, "en");
  const startMinutes = lib.wizardText.startMinutesFromText(`${opening.proposal.narration ?? ""} ${opening.proposal.situation ?? ""}`, "en");
  await server.bootstrap.performBootstrap({ action: "opening.commit", input: { requestId: randomUUID(), campaignId: cid, draftId: opening.draftId, review: openingReview, startMinutes } });
  steps.push({ step: "opening", proposals, ...(incomplete.length ? { incomplete } : {}), location: opening.proposal.location?.name ?? null, actors: opening.proposal.actors.length, droppedPcActors: dropped,
    narration: opening.proposal.narration ?? null, questions: opening.proposal.questions.map((q, i) => ({ question: q.question, consequential: q.consequential, answer: answers[i] })), startMinutes });
  log(`  ${situation}: opening committed`);
  const first = (await server.publicCampaign.readPublicCampaign(cid)).entities.find((e) => e.id === heroId);
  const companions = {};
  for (const id of ["sefa", "pell"]) {
    const r = lib.heroDraft.heroReviewForCommit(structuredClone(REVIEWS[id]));
    const rows = companionRecords(r, r.mechanics, structuredClone(first.equipment_slots));
    const entity = await mutate("entity.save", rows.entity, 0, "timeline");
    const storage = await mutate("storage.save", { name: "Possessions", kind: "companion", entity_id: entity.id, detail: {} }, 0, "timeline");
    for (const x of rows.items) {
      await mutate("item.save", { name: x.name, category: x.category, quantity: x.quantity, description: x.description, mechanics: x.mechanics, detail: x.detail,
        owner_entity_id: entity.id, storage_id: storage.id, equipped_entity_id: x.slot ? entity.id : null, equipped_slot: x.slot, rarity: null }, 0, "timeline");
    }
    companions[id] = { id: entity.id, counterLabels: rows.counterLabels, items: rows.items.length };
  }
  steps.push({ step: "records", companions: Object.fromEntries(Object.entries(companions).map(([k, v]) => [k, { id: v.id, items: v.items }])) });
  steps.push({ step: "seating", ...(await seat(app, cid, heroId, companions)) });
  return { cid, heroId, companions: Object.fromEntries(Object.entries(companions).map(([k, v]) => [k, v.id])), worldId: world.id, adventureId: adventure.id, coin, seats, steps };
}

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

// ---- the freeze -------------------------------------------------------------------------------------------------------------

/** The layer's die and coin, drawn once for the stage (the reader's correction 1: the danger and the information are the
 * same at every level): S1's endangered character (a d3 over the three), S2's holder (a d3). */
export const drawLayerDice = (draw = randomInt) => ({ e: SEAT_IDS[draw(3)], h: SEAT_IDS[draw(3)], how: "crypto.randomInt(3) over [bram, sefa, pell], once each, at the freeze" });

/** The three campaigns on one database, kept as the snapshot (no secret, no layer in it). Returns the manifest. */
export async function buildWorld({ app, meter, dir, log = () => {}, by = null, settle = async () => 0, coins = {}, dice = null }) {
  await mkdir(dir, { recursive: true });
  if (existsSync(join(dir, MANIFEST))) throw new Error(`${dir} already holds a frozen world: it is built once`);
  const made = {};
  for (const situation of SITUATION_IDS) made[situation] = await meter.within({ session: `freeze ${situation}`, purpose: "wizard" }, () => createSituationCampaign(app, situation, { log, closed: () => Boolean(meter.stopped), ...(coins[situation] === undefined ? {} : { coin: coins[situation] }) }));
  if (await settle()) throw new Error("the wizard's background jobs did not finish: nothing frozen");
  for (const situation of SITUATION_IDS) if (app.lib.privateNotes.hiddenLayerOf({ privateState: await privateStateOf(app, made[situation].cid) })) throw new Error(`${situation}: a layer exists before the prep`);
  const blob = await app.f.db.dumpDataDir("gzip");
  const bytes = Buffer.from(await blob.arrayBuffer());
  await writeAtomic(join(dir, SNAPSHOT), bytes);
  const manifest = { stage: STAGE, design: DESIGN_SHA256, builtAt: new Date().toISOString(), by, owner: app.owner, dice: dice ?? drawLayerDice(),
    snapshot: { file: SNAPSHOT, bytes: bytes.length, sha256: sha256(bytes), note: "The local database after the wizard, the opening and the seating of the three situations' company campaigns, before any secret or prep (PGlite data directory, gzip), committed beside the layers so a later session plays from the same world (PARTY_1 did the same); named by its sha256." },
    situations: Object.fromEntries(SITUATION_IDS.map((x) => [x, { campaignId: made[x].cid, heroId: made[x].heroId, companions: made[x].companions, worldId: made[x].worldId, adventureId: made[x].adventureId, coin: made[x].coin, seats: made[x].seats, steps: made[x].steps }])),
    layers: {} };
  await writeAtomic(join(dir, MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

/** The prep, once per situation, on the snapshot with the situation's note (no variant) as the campaign's secrets. */
export async function prepareLayers({ app, meter, dir, situations = SITUATION_IDS, log = () => {}, by = null }) {
  const manifest = readJson(join(dir, MANIFEST));
  const { parseNoteValue, hiddenLayerOf } = app.lib.privateNotes;
  for (const situation of situations) {
    if (manifest.layers[situation]) throw new Error(`${situation}: the layer is already frozen (it is prepared once)`);
    const { campaignId: cid, heroId } = manifest.situations[situation];
    const note = prepNote(situation, manifest.dice);
    await app.server.secrets.saveDmSecrets(cid, { scope: "campaign", body: note, rebuild: false });
    const before = await privateStateOf(app, cid);
    let after = before, attempts = 0;
    while (!hiddenLayerOf({ privateState: after }) && attempts < 2 && !meter.stopped) {
      attempts++;
      await meter.within({ session: `freeze ${situation}`, purpose: "prep" }, () => app.server.prep.prepHiddenLayer(cid, app.owner, "first"));
      after = await privateStateOf(app, cid);
    }
    const layer = hiddenLayerOf({ privateState: after });
    if (!layer) throw new Error(`${situation}: the prep wrote no layer in ${attempts} attempt(s)${meter.stopped ? ` (stopped: ${meter.stopped})` : ""}`);
    const { set: writes, removed } = writesBetween(before, after, parseNoteValue);
    if (removed.length) throw new Error(`${situation}: the prep removed notes (${removed.map((r) => r.key).join(", ")})`);
    const file = { stage: STAGE, table: situation, note: "DM-only: the hidden layer the DM prepared once for this situation (with the situation's note, no variant, as the campaign's secrets). Never shown to a player.",
      campaignId: cid, firstRecordId: heroId, preparedAt: new Date().toISOString(), preparedBy: by, prepAttempts: attempts, characters: CHARACTERS.map((c) => c.name),
      prepNote: note, prepNoteSha256: sha256(note), layer, writes, stored: storedOf(after, writes) };
    file.sha256 = layerSha256(file);
    file.threads = threadsOf(file);
    await writeAtomic(join(dir, layerFile(situation)), `${JSON.stringify(file, null, 2)}\n`);
    await writeAtomic(join(dir, `${situation}-dm-only.md`), layerMarkdown(file));
    manifest.layers[situation] = { file: layerFile(situation), sha256: file.sha256, prepNoteSha256: file.prepNoteSha256, chars: layer.length, writes: writes.length, threads: file.threads.length, preparedAt: file.preparedAt };
    await writeAtomic(join(dir, MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`);
    log(`  freeze ${situation}: the layer — ${layer.length} characters, ${file.threads.length} thread(s), sha256 ${file.sha256.slice(0, 16)}…`);
  }
  return manifest;
}

export function layerMarkdown(file) {
  return [`# ${file.table} — the frozen hidden layer (DM-only)`, "", `sha256 \`${file.sha256}\` · campaign \`${file.campaignId}\` · prepared ${file.preparedAt}${file.preparedBy ? ` by ${file.preparedBy}` : ""}`, "",
    "The DM prepared this once, before any player sat at the table, with the situation's note below as the campaign's secrets. No player sees either.", "",
    "## The situation's note the prep read (DM-only)", "", "````text", file.prepNote, "````", "", "## The layer", "", "````text", file.layer, "````", "", "## The threads", "", ...file.threads.map((t) => `- **${t.id}** (${t.kind}): ${t.text}`), ""].join("\n");
}

/** The arms' notes (shared + variant), each with its sha256 — the per-table DM-only secrets, frozen with the dice. */
export function armNotes(dice) {
  return Object.fromEntries(["S1-none", "S1-moderate", "S1-high", "S2-moderate", "S2-high", "S3"].map((arm) => { const note = situationNote(arm, dice); return [arm, { situation: armOf(arm).situation, sha256: sha256(note), note }]; }));
}

export function readFrozen(dir) {
  if (!existsSync(join(dir, MANIFEST))) throw new Error(`no frozen world in ${dir} (build it first)`);
  const manifest = readJson(join(dir, MANIFEST));
  const files = Object.fromEntries(Object.keys(manifest.layers ?? {}).map((situation) => {
    const file = readJson(join(dir, layerFile(situation)));
    if (layerSha256(file) !== file.sha256 || file.sha256 !== manifest.layers[situation].sha256) throw new Error(`${situation}: the DM-only file does not match its hash`);
    return [situation, file];
  }));
  return { manifest, files };
}

/** The snapshot as this process's database. */
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

/** One table from the frozen world: its situation's campaign, the frozen layer in the DM's notes, and the arm's note
 * (shared + variant) as the campaign's DM-only secrets. */
export function tableStarter(dir) {
  let used = false;
  return async (app, { key, arm }, { meter }) => {
    if (used) throw new Error("a table was already played in this process");
    used = true;
    const { manifest, files } = readFrozen(dir);
    const situation = armOf(arm).situation;
    const a = manifest.situations[situation];
    const cid = a.campaignId;
    const file = files[situation];
    if (!file) throw new Error(`${situation}: its layer is not frozen yet`);
    const dossier = await app.server.dossier.dossierService(app.owner, cid);
    const source = await dossier.source();
    if (app.lib.privateNotes.hiddenLayerOf(source)) throw new Error(`${situation}: the campaign already holds a layer before the frozen file is written`);
    await meter.within({ session: key, purpose: "frozen layer" }, () => dossier.privateNotes({ set: file.writes, remove: [] }, source.timeline));
    const state = await privateStateOf(app, cid);
    if (canonical(storedOf(state, file.writes)) !== canonical(file.stored)) throw new Error(`${situation}: the DM's notes do not hold the frozen file after writing it`);
    const note = situationNote(arm, manifest.dice);
    await app.server.secrets.saveDmSecrets(cid, { scope: "campaign", body: note, rebuild: false });
    const read = await app.server.secrets.readDmSecrets(cid);
    if (String(read?.campaign?.body ?? "").trim() !== note.trim()) throw new Error(`${arm}: the situation's note did not read back from the DM's secrets`);
    return { cid, heroId: a.heroId, companions: a.companions, coin: a.coin ?? 0, seats: a.seats ?? seatsFrom(0), steps: a.steps, dice: manifest.dice,
      prep: { frozen: true, layerSha256: file.sha256, snapshotSha256: manifest.snapshot.sha256, noteSha256: sha256(note), threads: file.threads?.length ?? 0, layerText: `${file.layer}\n\n${note}` } };
  };
}
