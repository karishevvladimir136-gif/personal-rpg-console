// Game player 1: the DM side — a fresh campaign made the way the owner made «Envoy of Luck» in the new-campaign wizard,
// then played through the app's own turn path (src/lib/server/gameplay-service.ts). Every call here is a server
// function the app's routes call; nothing about the player reaches the DM but the text of the player's messages.
//   World      «Название Мира» + «Опишите сеттинг» (01), world_create — the premise becomes the campaign's canon document.
//   Hero       «Кто вы?» (05 §1) → creation.propose (the hero drafted by the wizard's DM, Opus 5.5 at high) → the review
//              accepted as drafted → creation.commit (the rules system is set from the world: D&D 5e).
//   Documents  the canon (02) as a canon document, the DM's 5e guide (03) as the campaign's DM guide.
//   Adventure  «Пожелания к приключению» (06, Table A only) to the DM-only store; the adventure's title, premise and
//              «Кто идёт с героем: the cat», pace «evening».
//   DM         the owner's settings: «Opus writes — Opus records», depth high → extra high, English DM instructions, memory
//              standard, voice samples off, «⚡» off; the DM craft cards active (as on the owner's screen); pictures,
//              Live frames and the soundtrack off.
//   Opening    opening.propose (the campaign's writer, Opus) → the review confirmed as proposed → opening.commit.
//   Prep       the DM's hidden layer, written by the app's prep before the first turn (it waits for it on the owner's
//              first visit too), never shown to the player.
import { randomUUID } from "node:crypto";
import { campaignFiles, PURE_SIMULATION_TABLES, UNBRIEFED } from "./frozen.mjs";

export const OWNER_SETTINGS = {
  runtime: "dm-loop-v1",
  dmTurn: { providerId: "anthropic", modelId: "claude-opus-5-5", reasoning: "high" },
  depth: { min: "high", max: "xhigh" },
  voiceMode: "off",
  split: { writer: { providerId: "anthropic", modelId: "claude-opus-5-5", reasoning: "high" }, bookkeeper: { providerId: "anthropic", modelId: "claude-opus-5-5", reasoning: "high" } },
  options: { instructions: "en", memory: "standard", companionRolls: "dm" },
  boostNext: false,
};
export const HERO_NAME = "James Worgen";
export const PACE = { kind: "evening", custom: null };

const fenceOf = (app, cid) => app.f.fence(cid);

/** The campaign of one table: { cid, heroId, worldId, adventureId, steps } — `steps` says what each wizard step did. */
export async function createCampaign(app, { table, log = () => {}, closed = () => false }) {
  const { server, lib } = app;
  const files = campaignFiles();
  const steps = [];
  // World.
  const worlds = await server.adventures.adventureService(null);
  const world = (await worlds.performWorld(lib.client.createWorldAttempt(await worlds.worlds(), { title: files.worldName, premise: files.setting, packVersionIds: [] }))).world;
  steps.push({ step: "world", worldId: world.id, title: world.title, premiseChars: files.setting.length });
  // Hero: the wizard's DM drafts the sheet from «Who are you?»; the owner's review keeps the draft.
  const input = { requestId: randomUUID(), worldId: world.id, worldVersion: world.version, title: `${HERO_NAME} · ${world.title}`.slice(0, 200), language: "en", name: HERO_NAME, description: files.heroWho };
  // An unreadable draft opens an empty sheet with the reason (the manual proposal); the owner presses «Build again» once.
  const emptyDraft = (d) => d?.proposal?.schemaVersion === 3 && !d.proposal.sheet.skills.length && !d.proposal.sheet.abilities.length && d.proposal.notes.length > 0;
  let draft = await server.bootstrap.performBootstrap({ action: "creation.propose", input });
  let rebuilt = false;
  if (emptyDraft(draft) && !closed()) { rebuilt = true; draft = await server.bootstrap.performBootstrap({ action: "creation.propose", input: { ...input, requestId: randomUUID() } }); }
  if (draft?.proposal?.schemaVersion !== 3) throw new Error(`the hero draft is not schema 3 (${draft?.proposal?.schemaVersion})`);
  const review = lib.heroDraft.heroReviewForCommit(lib.heroDraft.initialHeroReview(input, draft.proposal));
  const created = await server.bootstrap.performBootstrap({ action: "creation.commit", input: { requestId: randomUUID(), draftId: draft.draftId, review } });
  const cid = created.campaignId, heroId = created.heroId;
  steps.push({ step: "hero", heroId, rebuilt, empty: emptyDraft(draft), drafted: draft.proposal.notes?.length ? "with notes" : "clean", sheet: { role: review.sheet.role, level: review.sheet.level, skills: review.sheet.skills.length, abilities: review.sheet.abilities.length, spells: review.sheet.spells.length, items: review.possessions.length, counters: review.counters.length } });
  log(`  ${table}: campaign created (hero drafted by the DM)`);
  // Documents: the canon (02) and the DM's 5e guide (03).
  let snapshot = await server.publicCampaign.readPublicCampaign(cid);
  const guide = snapshot.documents.find((d) => d.id === snapshot.dmGuideDocumentId);
  if (!guide) throw new Error("the campaign has no DM guide document");
  const mutate = async (operation, payload, expectedRevision) => server.repository.applyMutation({ requestId: randomUUID(), operation, campaignId: cid, expectedRevision, payload, timeline: await fenceOf(app, cid) });
  await mutate("document.save", { id: guide.id, title: guide.title, status: guide.status, body: files.guide }, guide.revision);
  await mutate("document.save", { title: "The Sword Coast — canon", status: "canon", body: files.canon }, 0);
  snapshot = await server.publicCampaign.readPublicCampaign(cid);
  steps.push({ step: "documents", documents: snapshot.documents.map((d) => ({ title: d.title, status: d.status, chars: d.body.length, guide: d.id === snapshot.dmGuideDocumentId })) });
  // Adventure: the wishes (Table A) to the DM-only store first, then the adventure.
  const premise = table === "A" ? files.premise : UNBRIEFED[table].campaign.premise;
  const wishes = table === "A" ? files.wishes : UNBRIEFED[table].campaign.wishes;
  if (wishes.trim()) await server.secrets.saveDmSecrets(cid, { scope: "wishes", body: wishes.trim(), rebuild: false });
  const adventures = await server.adventures.adventureService(cid);
  const catalog = await adventures.read(cid, await fenceOf(app, cid));
  const title = table === "A" ? files.campaignName : UNBRIEFED[table].campaign.campaignName;
  const prepared = await adventures.perform(lib.client.prepareAdventureAttempt(catalog, { title, premise: lib.wizardText.wizardAdventurePremise(premise, "the cat", "en").slice(0, 20000), pacing: PACE }));
  const adventure = prepared.snapshot.adventures.find((a) => a.status === "prepared");
  steps.push({ step: "adventure", title, premiseChars: premise.length, wishesChars: wishes.trim().length, pace: PACE.kind });
  // DM: the owner's settings; the craft cards active; pictures and the soundtrack off. Game player 2's Table C: the
  // pure-simulation flag on, before the opening and the prep (the prep then skips: no hidden layer, no clocks).
  const current = await server.dmSettings.readDmSettings(cid);
  const pure = PURE_SIMULATION_TABLES.has(table) ? { pureSimulation: true } : {};
  await server.dmSettings.saveDmSettings(cid, { expectedRevision: current.revision, ...OWNER_SETTINGS, options: { ...current.options, ...OWNER_SETTINGS.options, ...pure } });
  const saved = await server.dmSettings.readDmSettings(cid);
  steps.push({ step: "dm", split: saved.split ? `${saved.split.writer.modelId} writes, ${saved.split.bookkeeper.modelId} records` : "single", depth: saved.depth, options: saved.options, boostNext: saved.boostNext, voiceMode: saved.voiceMode });
  steps.push({ step: "craft", ...(await activateCraft(server)) });
  steps.push({ step: "media", ...(await mediaOff(app, cid)) });
  // Opening.
  const start = lib.client.versionAdventureAttempt(prepared.snapshot, adventure.id, "start");
  let opening, proposals = 1;
  try { opening = await server.bootstrap.performBootstrap({ action: "opening.propose", input: start }); }
  catch (error) {
    // «Propose the first scene» once more after a failed proposal (never after a refusal: the meter closes the session).
    // The app keeps a failed request as evidence and refuses it again, so the button makes a new start attempt.
    if (closed()) throw error;
    log(`  ${table}: the opening proposal failed (${String(error?.code ?? error?.message ?? error).slice(0, 60)}) — proposing once more`);
    proposals++;
    opening = await server.bootstrap.performBootstrap({ action: "opening.propose", input: lib.client.versionAdventureAttempt(prepared.snapshot, adventure.id, "start") });
  }
  const openingReview = lib.openingAnswers.applyOpeningAnswers({ ...lib.validation.initialOpeningReview(opening.proposal), publicOpeningConfirmed: true }, opening.proposal.questions, "en");
  const startMinutes = lib.wizardText.startMinutesFromText(`${opening.proposal.narration ?? ""} ${opening.proposal.situation ?? ""}`, "en");
  await server.bootstrap.performBootstrap({ action: "opening.commit", input: { requestId: randomUUID(), campaignId: cid, draftId: opening.draftId, review: openingReview, startMinutes } });
  steps.push({ step: "opening", proposals, location: opening.proposal.location?.name ?? null, actors: opening.proposal.actors.length, questions: opening.proposal.questions.length, startMinutes });
  log(`  ${table}: opening committed`);
  return { cid, heroId, worldId: world.id, adventureId: adventure.id, steps };
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

/** Pictures, Live frames and the soundtrack off for this campaign (the owner's switches; the player cannot see them). */
async function mediaOff(app, cid) {
  const out = {};
  try {
    const board = await app.server.pictures.readPictureBoard(cid);
    const s = board.settings;
    const saved = await app.server.pictures.savePictureSettings(cid, { ...s, expectedRevision: s.revision, frames: "off", autopilot: { ...(s.autopilot ?? {}), enabled: false } });
    out.pictures = `frames ${saved.frames}, autopilot ${saved.autopilot?.enabled ? "on" : "off"}`;
  } catch (error) { out.pictures = `not saved: ${String(error?.message ?? error).slice(0, 120)}`; }
  try {
    const state = await app.server.music.readMusicState(cid);
    const s = state.settings;
    const saved = await app.server.music.saveMusicSettings(cid, { ...s, expectedRevision: s.revision, enabled: false });
    out.music = saved.enabled ? "on" : "off";
  } catch (error) { out.music = `not saved: ${String(error?.message ?? error).slice(0, 120)}`; }
  return out;
}

/** The DM's preparation: the app's own prep (one Opus call at high), awaited. Returns what the player may know of it:
 * nothing but whether it ran — the layer's size is for the report, its text never leaves the database. */
export async function prepare(app, cid) {
  await app.server.prep.prepHiddenLayer(cid, app.owner, "first");
  const state = (await app.f.one("select contents from rpg_private.dm_state where campaign_id=$1", [cid]))?.contents ?? {};
  const text = app.lib.privateNotes.hiddenLayerOf({ privateState: state });
  const pureSimulation = (await app.server.dmSettings.readDmSettings(cid)).options.pureSimulation === true;
  return { hasLayer: text.length > 0, chars: text.length, clocks: Object.keys(state.clock ?? {}).length, pureSimulation };
}

/** The game screen's play state (the turns the player sees). */
export const readPlay = (app, cid) => app.server.gameplay.readPlay(cid, { prep: false });

/** One message from the composer: «game» (an action) or «ooc» (the «?» button). */
export async function submit(app, cid, text, mode = "game") {
  const play = await app.server.gameplay.readPlay(cid, { prep: false });
  const input = { operationId: randomUUID(), campaignId: cid, timeline: play.timeline, expectedRevision: play.revision, mode, input: text, companionId: null, listenerIds: [], mechanic: null };
  const turn = await app.server.gameplay.submitTurn(cid, input);
  return { input, turn };
}
/** A button on a waiting turn: «continue» (Onward), «reroll» (an allowed reroll of `checkId`), «retry», «cancel». */
export async function command(app, cid, input, action, checkId = null) {
  return app.server.gameplay.continueTurn(cid, input.operationId, { commandId: randomUUID(), campaignId: cid, operationId: input.operationId, timeline: input.timeline, action, checkId });
}

/** The table one session plays at: the game screen's two reads and its composer and buttons, for one campaign. Before
 * every message the background jobs of the previous turn (the app's `after`) are let finish, as they finish while the
 * owner reads. */
export function bindTable(app, cid, settleBackground) {
  return {
    cid,
    views: app.lib.campaignView,
    readView: async () => ({ snapshot: await app.server.publicCampaign.readPublicCampaign(cid), play: await readPlay(app, cid) }),
    submit: async (text, mode) => { await settleBackground(); return submit(app, cid, text, mode); },
    press: (input, action, checkId = null) => command(app, cid, input, action, checkId),
    // Fix S4 run 1 (item 11b): the waiting turn read again after a «?» answer (the DM may have withdrawn its card).
    readTurn: (input) => app.server.gameplay.readTurn(cid, input.operationId),
  };
}
