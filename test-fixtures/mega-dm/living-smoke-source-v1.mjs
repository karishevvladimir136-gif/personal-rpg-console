// Synthetic fixture adapter only. Interpretation, evidence filtering and prompt
// assembly are performed by the production Character Model and DM context code.
import { runtimeFixture } from "../../tests/phase2-runtime-fixtures.mjs";
import { parseCharacterModel } from "../../src/lib/gameplay/character-model.ts";
import { livingCast, livingHistory } from "./living-characters-v1.mjs";

export const smokeUuid = (number) => `00000000-0000-4000-8000-${number.toString(16).padStart(12, "0")}`;
export const SMOKE_ACTOR_IDS = Object.freeze({ talin: smokeUuid(10), liora: smokeUuid(11),
  bram: smokeUuid(12), sava: smokeUuid(13), orin: smokeUuid(14) });
export const SMOKE_LOCATION_IDS = Object.freeze({ workshop: smokeUuid(60),
  "Lantern Room": smokeUuid(61), bridge: smokeUuid(62) });
export const LANTERN_ROOM_FOOD = "Bread and stew are already on the Lantern Room table, available to everyone present.";
const SMOKE_LOCATIONS = Object.freeze([
  { id: SMOKE_LOCATION_IDS.workshop, name: "Workshop",
    description: "The enclosed riverside repair workshop; the quay and dock are separate places." },
  { id: SMOKE_LOCATION_IDS["Lantern Room"], name: "Lantern Room",
    description: "The shared room where the river crew can talk and rest after flood work." },
  { id: SMOKE_LOCATION_IDS.bridge, name: "Damaged Bridge",
    description: "The damaged public crossing where a warning mark can be witnessed." },
]);
const CAMPAIGN = smokeUuid(1), OWNER = smokeUuid(2), SESSION = smokeUuid(3), GUIDE = smokeUuid(4);
const PRIVATE_SCENES = new Set(["lc18"]);
const sourceId = (sceneId) => smokeUuid(100 + Number(sceneId.slice(2)));
const evidence = (sceneId) => ({ kind: "scene", id: sourceId(sceneId), version: "1", part: 0,
  visibility: PRIVATE_SCENES.has(sceneId) ? "private" : "public" });

const persona = Object.freeze({
  liora: { values: ["keeps promises", "passenger safety"], wants: ["a reliable ferry"],
    loyalties: ["river crew"], signatures: ["becomes direct under fear", "asks before assuming motive"],
    goal: "keep the crossing dependable", stress: "strained",
    episodes: [["lc23", "Talin explained an absence; trust improved without erasing the need for notice."],
      ["lc30", "The lost ferry bell still changes familiar routines."]],
    relationship: ["orin", "guarded", "mixed", "lc15", "The inspection dispute remains open."],
    belief: ["Talin may have good reasons for silence, but Liora needs to ask.", "talin", "lc23"] },
  bram: { values: ["craft honesty", "shared humor"], wants: ["sound repairs"],
    loyalties: ["repair crew"], signatures: ["jokes when uncertain", "checks before declaring safe"],
    goal: "inspect the skiff", stress: "settled",
    episodes: [["lc08", "The Admiral wrench became a shared joke."],
      ["lc24", "Refusing an unsafe launch mattered more than pleasing Talin."]],
    relationship: ["sava", "earned", "high", "lc19", null],
    belief: ["Talin may ask for speed but can hear a reasoned refusal.", "talin", "lc24"] },
  sava: { values: ["evidence before status"], wants: ["accurate records"],
    loyalties: ["archive"], signatures: ["distinguishes rumor from proof", "unexpected literal joke"],
    goal: "verify flood records", stress: "settled",
    episodes: [["lc08", "The Admiral joke joined the archive's ordinary life."],
      ["lc33", "An uncertain flood story must remain uncertain."]],
    relationship: ["bram", "guarded", "high", "lc19", null],
    belief: ["Talin values the house records enough to help restore them.", "talin", "lc27"] },
  orin: { values: ["bounded public duty"], wants: ["a safer quay"],
    loyalties: ["watch"], signatures: ["speaks plainly", "offers lawful alternatives"],
    goal: "keep the crossing safe", stress: "settled",
    episodes: [["lc15", "A public apology corrected a report but not the larger patrol dispute."],
      ["lc36", "Talin's voluntary flood-watch idea deserved a trial, not a guarantee."]],
    relationship: ["liora", "guarded", "mixed", "lc15", "Inspection authority remains disputed."],
    belief: ["Talin may prefer voluntary cooperation to orders.", "talin", "lc36"] },
});

function characterModel(key, available) {
  const p = persona[key], actorId = SMOKE_ACTOR_IDS[key];
  const known = (sceneId) => available.some((scene) => scene.id === sceneId && scene.knownBy.includes(key));
  const episodes = p.episodes.filter(([sceneId]) => known(sceneId))
    .map(([sceneId, meaning]) => ({ evidence: evidence(sceneId), meaning, cue: null }));
  const [other, trust, respect, relationshipScene, hurt] = p.relationship;
  const relationships = known(relationshipScene) ? [{ actorId: SMOKE_ACTOR_IDS[other],
    affection: "open", trust, respect, unresolvedHurt: hurt, evidence: evidence(relationshipScene) }] : [];
  const [beliefText, about, beliefScene] = p.belief;
  const beliefs = known(beliefScene) ? [{ text: beliefText, confidence: "tentative",
    aboutActorId: SMOKE_ACTOR_IDS[about], evidence: evidence(beliefScene) }] : [];
  return parseCharacterModel({ schemaVersion: 1, actorId, basisOperationId: null,
    identity: { values: p.values, wants: p.wants, boundaries: [livingCast[key].boundary],
      loyalties: p.loyalties, signatures: p.signatures, observableVoice: livingCast[key].voice },
    current: { goal: p.goal, stress: p.stress, preoccupation: null, obligation: null },
    beliefs, relationships, episodes });
}

export function livingSmokeSource(probe, withModels) {
  const { source, input } = runtimeFixture();
  const last = Number(probe.historyThrough.slice(2));
  const history = livingHistory.filter((scene) => Number(scene.id.slice(2)) <= last);
  const template = source.snapshot.entities[0];
  source.ownerId = OWNER;
  source.snapshot.campaign = { ...source.snapshot.campaign, id: CAMPAIGN, campaign_id: CAMPAIGN,
    title: "Synthetic Lantern River", language: "en" };
  source.snapshot.settings = { ...source.snapshot.settings, campaign_id: CAMPAIGN,
    values: { ...source.snapshot.settings.values, campaign_id: CAMPAIGN, language: "en" } };
  source.snapshot.documents = [{ ...source.snapshot.documents[0], campaign_id: CAMPAIGN,
    id: GUIDE, current_version_id: smokeUuid(5), body: "Synthetic guide: preserve agency and validated outcomes." }];
  source.snapshot.dmGuideDocumentId = GUIDE;
  source.snapshot.entities = [
    { ...template, id: SMOKE_ACTOR_IDS.talin, campaign_id: CAMPAIGN, name: "Talin", kind: "player" },
    ...Object.entries(livingCast).filter(([key]) => key !== "talin").map(([key, actor]) =>
      ({ ...template, id: SMOKE_ACTOR_IDS[key], campaign_id: CAMPAIGN, name: actor.name, kind: "companion" })),
  ];
  source.snapshot.sessions = [{ ...source.snapshot.sessions[0], id: SESSION, campaign_id: CAMPAIGN }];
  source.snapshot.locations = SMOKE_LOCATIONS.map((location) => ({
    ...location, campaign_id: CAMPAIGN, revision: 1,
    updated_at: "2026-09-24T00:00:00.000Z", status: "visited",
  }));
  const lanternRoom = probe.id === "repair-history-joy";
  source.snapshot.scenes = lanternRoom ? [{ id: smokeUuid(50), campaign_id: CAMPAIGN,
    revision: 1, updated_at: "2026-09-24T00:00:00.000Z", sequence: 1,
    session_id: SESSION, title: "Lantern Room table", body: LANTERN_ROOM_FOOD,
    role: "note", settings_revision: source.snapshot.settings.revision,
    created_at: "2026-09-24T00:00:00.000Z" }] : [];
  source.snapshot.feedback = [];
  source.snapshot.publicState = { ...source.snapshot.publicState, campaign_id: CAMPAIGN,
    current_session_id: SESSION, current_scene_id: lanternRoom ? smokeUuid(50) : null,
    current_location_id: SMOKE_LOCATION_IDS[probe.place],
    summary: `Synthetic ${probe.place}: established river history through ${probe.historyThrough}.` };
  source.runtime.campaignId = CAMPAIGN;
  source.runtime.worldMinutes = last * 1440;
  source.runtime.configuration = { ...source.runtime.configuration,
    controlledEntityIds: [SMOKE_ACTOR_IDS.talin],
    presentEntityIds: [SMOKE_ACTOR_IDS.talin, ...probe.present.map((key) => SMOKE_ACTOR_IDS[key])] };
  source.privateState = { fact: { synthetic: "Private DM cognition is not NPC knowledge." }, npc: {} };
  if (withModels) for (const key of Object.keys(persona))
    source.privateState.npc[`character_${SMOKE_ACTOR_IDS[key]}`] = JSON.stringify(characterModel(key, history));
  const sources = history.map((scene, index) => ({
    id: sourceId(scene.id), campaignId: CAMPAIGN,
    ref: { ...evidence(scene.id), campaignId: CAMPAIGN }, sequence: index + 1, sessionId: SESSION,
    text: scene.text, entityIds: scene.cast.map((key) => SMOKE_ACTOR_IDS[key]),
    knownBy: scene.knownBy.map((key) => SMOKE_ACTOR_IDS[key]),
    authority: "history", statementKind: "record", attribution: null,
    validFrom: scene.day * 1440, validTo: null, significance: 1, unresolved: false,
    current: true, status: "valid", factKey: null, factValue: null, sourceRefs: [],
  }));
  source.memory = { campaignId: CAMPAIGN, generation: 1, stateRevision: 1,
    checkpoint: null, exactEvents: [], historical: sources.filter((row) => row.ref.visibility === "public"),
    privateHistorical: sources.filter((row) => row.ref.visibility === "private"),
    publicSummary: null, privateSummary: null, complete: true };
  input.operationId = smokeUuid(200 + probe.ordinal);
  input.campaignId = CAMPAIGN;
  input.input = probe.playerInput;
  return { source, input, history, sources };
}
