// Multi-hero 1: the three arms' campaigns as company tables, built once and frozen (PARTY_1's mechanism, world.mjs there).
// What differs from PARTY_1: the owner's documents are the company's (frozen.mjs `companyFiles`: no «hero» in the world,
// the canon or the guide, and the guide's note says the company moves when any character acts); the adventure tells the
// DM the three are player characters with none at the centre; the DM settings carry the option `company` before the
// opening, so the opening is asked in the company's words; every record carries Heroic Inspiration (sheets.mjs). The
// prep of P-GOAL and P-DUNGEON runs once each on the snapshot, as the company's prep (A8's addressees in the layer).
import { createHash, randomInt, randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { OWNER_SETTINGS } from "../game-player-1/table.mjs";
import { canonical, layerSha256, privateStateOf, storedOf, threadsOf, writesBetween } from "../game-player-same-world-1/world.mjs";
import { companionRecords, seat } from "../game-party-1/world.mjs";
import { ARMS, ARM_CAMPAIGNS, DESIGN_SHA256, LAYER_ARMS, STAGE, companyCampaign, companyFiles, dmCompanyLine, ownerOpeningAnswer, seatsFrom } from "./frozen.mjs";
import { CHARACTERS, REVIEWS } from "./sheets.mjs";

export const SNAPSHOT = "world-base.tar.gz";
export const MANIFEST = "manifest.json";
export const layerFile = (arm) => `${arm}-dm-only.json`;
const sha256 = (data) => createHash("sha256").update(data).digest("hex");
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
async function writeAtomic(path, data) { await writeFile(`${path}.tmp`, data); await rename(`${path}.tmp`, path); }

/** The DM settings of a company table: the owner's, with the companions' rolls as their players' cards, English
 * instructions, the option `company` with the table's coin (`companyStart`, fix A2), and (P-SAND) pure simulation. */
export const companyOptions = (arm, start = 0) => ({ ...OWNER_SETTINGS.options, companionRolls: "player", instructions: "en", company: true, companyStart: start,
  ...(ARM_CAMPAIGNS[arm].pureSimulation ? { pureSimulation: true } : {}) });

/** One arm's campaign as a company table: { cid, heroId, companions, worldId, adventureId, coin, seats, steps }. Fix A2:
 * the table's coin is drawn first (`coin`, 0–2: the seat that comes first); the adventure's texts list the three in that
 * order (the opening reads them there, alike), and the DM option `companyStart` keeps it for the app's lists. */
export async function createCompanyCampaign(app, arm, { log = () => {}, closed = () => false, coin = randomInt(3) } = {}) {
  const { server, lib } = app;
  const files = companyFiles();
  const seats = seatsFrom(coin);
  const campaign = companyCampaign(arm, seats);
  const steps = [{ step: "coin", coin, seats }];
  const fence = (cid) => app.f.fence(cid);
  const worlds = await server.adventures.adventureService(null);
  const world = (await worlds.performWorld(lib.client.createWorldAttempt(await worlds.worlds(), { title: files.worldName, premise: files.setting, packVersionIds: [] }))).world;
  steps.push({ step: "world", worldId: world.id, title: world.title });
  // The first record: the wizard makes one (the app's rule), with Bram's frozen review; nothing else marks it.
  const bram = REVIEWS.bram;
  const input = { requestId: randomUUID(), worldId: world.id, worldVersion: world.version, title: campaign.title.slice(0, 200), language: "en", name: bram.name, description: bram.description };
  const draft = await server.bootstrap.performBootstrap({ action: "creation.propose", input });
  if (draft?.proposal?.schemaVersion !== 3) throw new Error(`${arm}: the first record's draft is not schema 3 (${draft?.proposal?.schemaVersion})`);
  const review = lib.heroDraft.heroReviewForCommit({ ...structuredClone(bram), answers: draft.proposal.questions.map(() => null) });
  const created = await server.bootstrap.performBootstrap({ action: "creation.commit", input: { requestId: randomUUID(), draftId: draft.draftId, review } });
  const cid = created.campaignId, heroId = created.heroId;
  steps.push({ step: "first record", entityId: heroId, name: bram.name, reviewReplaced: true });
  log(`  ${arm}: Bram's record committed through the wizard`);
  const mutate = async (operation, payload, expectedRevision, correctionScope = undefined) => server.repository.applyMutation({ requestId: randomUUID(), operation, campaignId: cid, expectedRevision, payload, timeline: await fence(cid), ...(correctionScope ? { correctionScope } : {}) });
  const snapshot = await server.publicCampaign.readPublicCampaign(cid);
  const guide = snapshot.documents.find((d) => d.id === snapshot.dmGuideDocumentId);
  if (!guide) throw new Error(`${arm}: the campaign has no DM guide document`);
  await mutate("document.save", { id: guide.id, title: guide.title, status: guide.status, body: files.guide }, guide.revision);
  await mutate("document.save", { title: "The Sword Coast — canon", status: "canon", body: files.canon }, 0);
  if (campaign.wishes.trim()) await server.secrets.saveDmSecrets(cid, { scope: "wishes", body: campaign.wishes.trim(), rebuild: false });
  const adventures = await server.adventures.adventureService(cid);
  const catalog = await adventures.read(cid, await fence(cid));
  const prepared = await adventures.perform(lib.client.prepareAdventureAttempt(catalog, { title: campaign.title, premise: lib.wizardText.wizardAdventurePremise(`${campaign.premise}\n\n${dmCompanyLine(seats)}`, "", "en"), pacing: { kind: "evening", custom: null } }));
  const adventure = prepared.snapshot.adventures.find((a) => a.status === "prepared");
  steps.push({ step: "adventure", title: campaign.title, wishesChars: campaign.wishes.length });
  // The DM: the owner's settings with the option `company` — saved before the opening, so it is asked as a company's.
  const current = await server.dmSettings.readDmSettings(cid);
  await server.dmSettings.saveDmSettings(cid, { expectedRevision: current.revision, ...OWNER_SETTINGS, options: { ...current.options, ...companyOptions(arm, coin) } });
  const saved = await server.dmSettings.readDmSettings(cid);
  if (saved.options.company !== true || saved.options.companyStart !== coin) throw new Error(`${arm}: the option «company» or its coin did not read back`);
  steps.push({ step: "dm", split: saved.split ? `${saved.split.writer.modelId} writes, ${saved.split.bookkeeper.modelId} records` : "single", depth: saved.depth, options: saved.options });
  steps.push({ step: "craft", ...(await activateCraft(server)) });
  steps.push({ step: "media", ...(await mediaOff(app, cid)) });
  // The opening: proposed by the campaign's DM in the company's words; the owner confirms it, leaving out any actor that
  // is one of the three.
  // «Propose the first scene» again (as the owner would press it) when the proposal fails or comes back without a place,
  // a situation or a narration — the review cannot confirm such an opening (the paid dry run's Haiku left one empty);
  // three proposals at most.
  const complete = (o) => Boolean(o?.proposal?.location?.name && o.proposal.location.description && o.proposal.situation && o.proposal.narration);
  let opening = null, proposals = 0;
  const incomplete = [];
  while (proposals < 3 && !complete(opening)) {
    proposals++;
    try { opening = await server.bootstrap.performBootstrap({ action: "opening.propose", input: lib.client.versionAdventureAttempt(prepared.snapshot, adventure.id, "start") }); }
    catch (error) {
      if (closed() || proposals >= 3) throw error;
      log(`  ${arm}: the opening proposal failed (${String(error?.code ?? error?.message ?? error).slice(0, 60)}) — proposing once more`);
      opening = null;
      continue;
    }
    if (!complete(opening)) {
      incomplete.push({ location: opening.proposal.location?.name ?? null, situation: Boolean(opening.proposal.situation), narration: Boolean(opening.proposal.narration), questions: opening.proposal.questions.length });
      log(`  ${arm}: the opening came back incomplete (${JSON.stringify(incomplete.at(-1))}) — proposing once more`);
    }
  }
  if (!complete(opening)) throw new Error(`${arm}: no complete opening in ${proposals} proposals`);
  const pcWords = CHARACTERS.flatMap((c) => [c.name.toLowerCase(), c.short.toLowerCase()]);
  const isPc = (actor) => pcWords.some((w) => String(actor.name ?? "").toLowerCase().includes(w));
  const dropped = opening.proposal.actors.filter(isPc).map((a) => a.name);
  const answers = opening.proposal.questions.map((q) => (q.consequential ? ownerOpeningAnswer(seats) : null));
  const openingReview = lib.openingAnswers.applyOpeningAnswers({ ...lib.validation.initialOpeningReview(opening.proposal), actors: opening.proposal.actors.filter((a) => !isPc(a)), answers, publicOpeningConfirmed: true }, opening.proposal.questions, "en");
  const startMinutes = lib.wizardText.startMinutesFromText(`${opening.proposal.narration ?? ""} ${opening.proposal.situation ?? ""}`, "en");
  await server.bootstrap.performBootstrap({ action: "opening.commit", input: { requestId: randomUUID(), campaignId: cid, draftId: opening.draftId, review: openingReview, startMinutes } });
  steps.push({ step: "opening", proposals, ...(incomplete.length ? { incomplete } : {}), location: opening.proposal.location?.name ?? null, actors: opening.proposal.actors.length, droppedPcActors: dropped,
    narration: opening.proposal.narration ?? null, questions: opening.proposal.questions.map((q, i) => ({ question: q.question, consequential: q.consequential, answer: answers[i] })), startMinutes });
  log(`  ${arm}: opening committed${dropped.length ? ` (the review left out ${dropped.join(", ")}: already at the table)` : ""}`);
  // Sefa and Pell: records like Bram's (sheet, things, coin, counters with Heroic Inspiration), kept as party members,
  // after the opening (the app opens a campaign on its one record); seated as the coin turned them in the app's order.
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
    companions[id] = { id: entity.id, storageId: storage.id, counterLabels: rows.counterLabels, items: rows.items.length };
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

// ---- the freeze ----------------------------------------------------------------------------------------------------------

/** The three arms' company campaigns on one database, kept as the snapshot (no prep in it). Returns the manifest. */
export async function buildWorld({ app, meter, dir, log = () => {}, by = null, settle = async () => 0, coin = undefined }) {
  await mkdir(dir, { recursive: true });
  if (existsSync(join(dir, MANIFEST))) throw new Error(`${dir} already holds a frozen world: it is built once`);
  const made = {};
  for (const arm of ARMS) made[arm] = await meter.within({ session: `freeze ${arm}`, purpose: "wizard" }, () => createCompanyCampaign(app, arm, { log, closed: () => Boolean(meter.stopped), coin }));
  if (await settle()) throw new Error("the wizard's background jobs did not finish: nothing frozen");
  for (const arm of ARMS) if (app.lib.privateNotes.hiddenLayerOf({ privateState: await privateStateOf(app, made[arm].cid) })) throw new Error(`${arm}: a layer exists before the prep`);
  const blob = await app.f.db.dumpDataDir("gzip");
  const bytes = Buffer.from(await blob.arrayBuffer());
  await writeAtomic(join(dir, SNAPSHOT), bytes);
  const manifest = { stage: STAGE, design: DESIGN_SHA256, builtAt: new Date().toISOString(), by, owner: app.owner,
    snapshot: { file: SNAPSHOT, bytes: bytes.length, sha256: sha256(bytes), note: "The local database after the wizard, the opening and the seating of the three arms' company campaigns, before any prep (PGlite data directory, gzip)." },
    arms: Object.fromEntries(ARMS.map((arm) => [arm, { campaignId: made[arm].cid, heroId: made[arm].heroId, companions: made[arm].companions, worldId: made[arm].worldId, adventureId: made[arm].adventureId,
      coin: made[arm].coin, seats: made[arm].seats, steps: made[arm].steps }])),
    layers: {} };
  await writeAtomic(join(dir, MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

/** The company's prep, once per arm that has one (P-GOAL, P-DUNGEON), on the snapshot: each arm's DM-only file. */
export async function prepareLayers({ app, meter, dir, arms = LAYER_ARMS, log = () => {}, by = null }) {
  const manifest = readJson(join(dir, MANIFEST));
  const { parseNoteValue, hiddenLayerOf } = app.lib.privateNotes;
  for (const arm of arms) {
    if (manifest.layers[arm]) throw new Error(`${arm}: the layer is already frozen (it is prepared once)`);
    const { campaignId: cid, heroId } = manifest.arms[arm];
    const before = await privateStateOf(app, cid);
    let after = before, attempts = 0;
    while (!hiddenLayerOf({ privateState: after }) && attempts < 2 && !meter.stopped) {
      attempts++;
      await meter.within({ session: `freeze ${arm}`, purpose: "prep" }, () => app.server.prep.prepHiddenLayer(cid, app.owner, "first"));
      after = await privateStateOf(app, cid);
    }
    const layer = hiddenLayerOf({ privateState: after });
    if (!layer) throw new Error(`${arm}: the prep wrote no layer in ${attempts} attempt(s)${meter.stopped ? ` (stopped: ${meter.stopped})` : ""}`);
    const { set: writes, removed } = writesBetween(before, after, parseNoteValue);
    if (removed.length) throw new Error(`${arm}: the prep removed notes (${removed.map((r) => r.key).join(", ")})`);
    const file = { stage: STAGE, table: arm, note: "DM-only: the company's hidden layer the DM prepared once for this arm. Never shown to a player.",
      campaignId: cid, firstRecordId: heroId, preparedAt: new Date().toISOString(), preparedBy: by, prepAttempts: attempts, characters: CHARACTERS.map((c) => c.name),
      layer, writes, stored: storedOf(after, writes) };
    file.sha256 = layerSha256(file);
    file.threads = threadsOf(file);
    await writeAtomic(join(dir, layerFile(arm)), `${JSON.stringify(file, null, 2)}\n`);
    await writeAtomic(join(dir, `${arm}-dm-only.md`), layerMarkdown(file));
    manifest.layers[arm] = { file: layerFile(arm), sha256: file.sha256, chars: layer.length, writes: writes.length, threads: file.threads.length, preparedAt: file.preparedAt };
    await writeAtomic(join(dir, MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`);
    log(`  freeze ${arm}: the company's layer — ${layer.length} characters, ${file.threads.length} thread(s), sha256 ${file.sha256.slice(0, 16)}…`);
  }
  return manifest;
}

export function layerMarkdown(file) {
  return [`# ${file.table} — the company's frozen hidden layer (DM-only)`, "", `sha256 \`${file.sha256}\` · campaign \`${file.campaignId}\` · prepared ${file.preparedAt}${file.preparedBy ? ` by ${file.preparedBy}` : ""}`, "",
    "The DM prepared this once, for a table with no main character, before any player sat at it. No player sees it.", "",
    "## The layer", "", "````text", file.layer, "````", "", "## The threads", "", ...file.threads.map((t) => `- **${t.id}** (${t.kind}): ${t.text}`), ""].join("\n");
}

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

/** One table from the frozen world: its arm's campaign, with the arm's layer (P-GOAL, P-DUNGEON) in the DM's notes. */
export function tableStarter(dir) {
  let used = false;
  return async (app, { key, arm }, { meter }) => {
    if (used) throw new Error("a table was already played in this process");
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
    return { cid, heroId: a.heroId, companions: a.companions, coin: a.coin ?? 0, seats: a.seats ?? seatsFrom(0), steps: a.steps,
      prep: { frozen: Boolean(file), pureSimulation: !file, layerSha256: file?.sha256 ?? null, snapshotSha256: manifest.snapshot.sha256, threads: file?.threads?.length ?? 0, layerText: file?.layer ?? "" } };
  };
}
