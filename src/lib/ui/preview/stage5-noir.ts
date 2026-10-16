// Second synthetic Stage 5 sample: a narrative noir with no classes, levels,
// ability scores, spells or gold. Proves the screens follow the data, not D&D.
import type { CampaignSnapshot, Entity, Item, Scene } from "../../persistence/contracts.ts";
import type { PlaySnapshot, PublicTurn } from "../../gameplay/contracts.ts";
import { createCampaignSettings } from "../../campaign-settings.ts";
import type { PreviewSample } from "./stage5-sample.ts";
import { previewPictureBoard } from "./stage-v-pictures.ts";

export const NOIR_CAMPAIGN_ID = "7a7a7a7a-0000-4000-8000-000000000001";
const id = (n: number) => `7a7a7a7a-0000-4000-8000-${String(n).padStart(12, "0")}`;
const at = (minute: number) => new Date(Date.UTC(2026, 9, 13, 21, minute)).toISOString();
const row = (n: number, minute = 0) => ({ id: id(n), campaign_id: NOIR_CAMPAIGN_ID, revision: 1, updated_at: at(minute) });
const N = {
  dana: id(10), rook: id(11), mara: id(12), kwan: id(20), velvet: id(21), car: id(30),
  danaStorage: id(40), safehouse: id(41), trunk: id(42),
  stack: id(50), harbor: id(51), spire: id(52), session1: id(60), session2: id(61),
  chip: id(70), pistol: id(71), splice: id(72), coat: id(73), stim: id(74), picks: id(75), cash: id(76), tape: id(77),
};
const entity = (n: number, value: Partial<Entity> & Pick<Entity, "kind" | "name">): Entity => ({
  ...row(n), details: "", hp: null, max_hp: null, stats: {}, resources: {}, conditions: [], equipment_slots: [], character_sheet: null, ...value,
});
const narrative = (role: string, skills: string[] = []) => ({
  schemaVersion: 1 as const, mode: "narrative" as const, role, background: "", level: null, tier: null, attributes: null,
  skills, abilities: [], limitations: [], spells: [],
});
const entities: Entity[] = [
  entity(10, {
    kind: "player", name: "Dana Okafor", hp: 7, max_hp: 10,
    details: "A tired woman in her late thirties, close-cropped hair, a small glowing implant behind one ear, rain on the collar of a dark trench coat. Private investigator in the Stacks. Ex-cop, owes the wrong people, still answers the phone at 3 a.m.",
    stats: { edge: 2, nerve: 3, heat: 1 },
    resources: { resource_stress: 2, resource_stress_max: 6, resource_favors: 3, currency_credits: 1240 },
    conditions: ["Shaken"],
    equipment_slots: [
      { id: "implant", label: "Implant", accepts: ["gear"] },
      { id: "coat", label: "Coat", accepts: ["gear"] },
      { id: "sidearm", label: "Sidearm", accepts: ["weapon"] },
    ],
    character_sheet: { ...narrative("Private investigator", ["Interrogation", "Lockpicking", "Street contacts", "Reading a room"]), abilities: ["Nobody lies to Dana twice"], limitations: ["Owes the Syndicate"] },
  }),
  entity(11, { kind: "companion", name: "Rook", hp: 4, max_hp: 4, details: "A battered courier drone with a dry sense of humour.", character_sheet: narrative("Drone") }),
  entity(12, { kind: "companion", name: "Mara Vey", hp: 6, max_hp: 8, details: "A young woman with a shaved temple full of ports and a yellow raincoat. Netrunner. Pays her debts in favours, never in cash.", character_sheet: narrative("Netrunner") }),
  entity(20, { kind: "npc", name: "Inspector Kwan", details: "Homicide. Wants the Lazarus case closed, one way or the other." }),
  entity(21, { kind: "npc", name: "Velvet", details: "The Syndicate's fixer. Smiles with her mouth only." }),
  entity(30, { kind: "transport", name: "Old Citroën DS", hp: 3, max_hp: 5, details: "Dented, retrofitted with a hover kit. Smells of wet upholstery.", stats: { speed: 3 } }),
];
const item = (n: number, value: Partial<Item> & Pick<Item, "name" | "category" | "storage_id">): Item => ({
  ...row(n, n), quantity: 1, description: "", mechanics: "", owner_entity_id: null, equipped_entity_id: null, equipped_slot: null, ...value,
});
const items: Item[] = [
  item(70, { name: "Data chip “Lazarus”", category: "misc", storage_id: N.danaStorage, owner_entity_id: N.dana, description: "Pulled from a dead man's palm. Encrypted." }),
  item(71, { name: "Snub pistol", category: "weapon", storage_id: N.danaStorage, owner_entity_id: N.dana, equipped_entity_id: N.dana, equipped_slot: "sidearm", mechanics: "Close range" }),
  item(72, { name: "Neural splice", category: "gear", storage_id: N.danaStorage, owner_entity_id: N.dana, equipped_entity_id: N.dana, equipped_slot: "implant", description: "Records what she sees. Usually." }),
  item(73, { name: "Trench coat", category: "gear", storage_id: N.danaStorage, owner_entity_id: N.dana, equipped_entity_id: N.dana, equipped_slot: "coat" }),
  item(74, { name: "Stim patch", category: "consumable", quantity: 4, storage_id: N.danaStorage, owner_entity_id: N.dana, mechanics: "Clears 1 stress" }),
  item(75, { name: "Lockpick set", category: "tool", storage_id: N.danaStorage, owner_entity_id: N.dana }),
  item(76, { name: "Cash envelope", category: "misc", storage_id: N.safehouse, description: "Velvet's advance. Untouched." }),
  item(77, { name: "Surveillance tapes", category: "misc", quantity: 6, storage_id: N.trunk }),
];
const scene = (n: number, sequence: number, session: string, role: Scene["role"], title: string, body: string): Scene => ({
  ...row(n, sequence), sequence, session_id: session, title, body, role, settings_revision: 1, created_at: at(sequence),
});

function snapshot(): CampaignSnapshot {
  const settings = createCampaignSettings(NOIR_CAMPAIGN_ID, { id: "noir-narrative", label: "Narrative noir · no dice system", enemyHpScaling: false, enemyDamageScaling: false });
  settings.language = "en";
  settings.visualStyle = "Rain-soaked neon noir, cinematic digital painting, teal and magenta reflections, film grain.";
  return structuredClone({
    timeline: { timelineId: id(900), epoch: 1 },
    campaign: { ...row(1), title: "Neon & Rain", subtitle: "The Lazarus case", language: "en" },
    settings: { campaign_id: NOIR_CAMPAIGN_ID, revision: 1, updated_at: at(0), values: settings },
    settingsHistory: [],
    documents: [{ ...row(110), title: "DM guide", status: "canon", current_version_id: id(111), body: "A noir city of stacked towers and constant rain." }],
    entities,
    storages: [
      { ...row(40), name: "Dana's pockets", kind: "player", entity_id: N.dana },
      { ...row(41), name: "Safehouse locker", kind: "camp", entity_id: null },
      { ...row(42), name: "Trunk", kind: "transport", entity_id: N.car },
    ],
    items,
    sessions: [
      { ...row(60, 1), title: "A body in the rain", status: "closed", recap: "Lazarus died holding a chip. Kwan wants it buried; Velvet wants it found. Mara cracked the first layer." },
      { ...row(61, 2), title: "Stack 9", status: "open", recap: "" },
    ],
    scenes: [
      scene(100, 1, N.session1, "narration", "The alley", "Rain, neon, a body."),
      scene(101, 2, N.session2, "narration", "Stack 9", "The lift to level 40 smells of wet concrete and frying oil. Rook hums on your shoulder, counting floors out loud, badly."),
    ],
    publicState: { campaign_id: NOIR_CAMPAIGN_ID, revision: 4, updated_at: at(5), summary: "Dana climbs Stack 9 looking for the man who sold Lazarus his chip.", current_session_id: N.session2, current_scene_id: id(101), current_location_id: N.stack },
    quests: [
      { ...row(90, 30), title: "Who killed Lazarus?", description: "Find who wanted the chip badly enough to kill for it.", status: "open" },
      { ...row(91, 20), title: "Pay Velvet back", description: "1,000 credits, or a favour she chooses.", status: "open" },
      { ...row(92, 10), title: "Find Mara's brother", description: "He was in a Syndicate clinic. Now he isn't.", status: "complete" },
    ],
    locations: [
      { ...row(50), name: "Kowloon Stack 9", description: "Forty levels of apartments, noodle stalls and illegal clinics.", status: "visited" },
      { ...row(51), name: "Harbor district", description: "Where Lazarus was found.", status: "visited" },
      { ...row(52), name: "Arcology Spire", description: "Corporate tower above the cloud line. Invitation only.", status: "known" },
    ],
    assets: [],
    feedback: [],
    dmGuideDocumentId: id(110),
  } satisfies CampaignSnapshot);
}

function play(options: { combat?: boolean } = {}): PlaySnapshot {
  const turn: PublicTurn = {
    narrationSceneId: id(101), id: id(200), campaign_id: NOIR_CAMPAIGN_ID, session_id: N.session2, mode: "game",
    input: "I flash my old badge at the door guard and ask who sold chips to a man called Lazarus.", companionId: null, listenerIds: [],
    status: "committed", expectedRevision: 3, committedRevision: 4, settingsRevision: 1, created_at: at(4), updated_at: at(4),
    narration: "The guard looks at the badge long enough to read the expiry date. \"Lazarus,\" he says, like the name tastes of rust. \"Level forty. Ask for Moth. Don't ask for long.\"",
    visualDescription: null, checks: [], proposal: null, failure: null, canRetry: false, canCancel: false, timeline: { timelineId: id(900), epoch: 1 },
  };
  return structuredClone({
    rulesetId: "world-logic-v1", startupPending: false, timeline: { timelineId: id(900), epoch: 1 }, campaignId: NOIR_CAMPAIGN_ID,
    revision: 4, configured: true, model: "gpt-6-astra",
    configuration: { profile: "console-basic-v1", controlledEntityIds: [N.dana], presentEntityIds: [N.dana, N.rook, N.mara], nearbyStorageIds: [N.trunk], safeLocationIds: [], itemRules: [] },
    worldMinutes: 1 * 1440 + 23 * 60 + 10, turns: [
      { ...turn, id: id(201), mode: "companion", companionId: N.mara, input: "Can you get into the chip tonight?", narration: "Mara turns the chip over in her fingers. \"Tonight, maybe. Quietly, no. Somebody built a tripwire into it — and they'll know who pulled it.\"" },
      turn,
    ], restRecords: [], recipes: [], effects: [],
    encounters: options.combat ? [{ id: id(400), campaign_id: NOIR_CAMPAIGN_ID, status: "active", round: 1, outcome: null, settings_revision: 1, public_summary: "Ambush in the lift" }] : [],
    participants: [], pendingActions: [], conversations: [], sessionGuidance: [], provenance: [],
  } satisfies PlaySnapshot);
}

export const noirPictures = previewPictureBoard({
  campaignId: NOIR_CAMPAIGN_ID, worldId: id(600), timeline: { timelineId: id(900), epoch: 1 }, at,
  style: { id: id(700), scope: "campaign", preset: "noir", label: "Noir graphic novel", hasReference: false },
  anchors: [
    { id: id(710), subjectKind: "entity", subjectId: N.dana, composition: "portrait", image: "/preview/stage-v/noir-noir-klein9b-dana-okafor-portrait.jpg" },
    { id: id(711), subjectKind: "entity", subjectId: N.car, composition: "holding", image: "/preview/stage-v/noir-noir-klein9b-old-citro-n-ds-holding.jpg" },
    { id: id(712), subjectKind: "location", subjectId: N.stack, composition: "location", image: "/preview/stage-v/noir-noir-klein9b-kowloon-stack-9-location.jpg" },
    { id: id(713), subjectKind: "item", subjectId: N.chip, composition: "item", image: "/preview/stage-v/noir-noir-klein9b-data-chip-lazarus-item.jpg" },
  ],
  frames: [
    { id: id(730), turnId: id(200), image: "/preview/stage-v/noir-noir-klein9b-refs-t01.jpg", trigger: "live" },
    { id: id(731), turnId: id(202), image: "", trigger: "live", status: "generating" },
  ],
});

export const noirSample: PreviewSample = {
  key: "noir",
  language: "en",
  snapshot,
  play,
  live: () => ({
    operationId: id(202),
    status: "generating",
    text: "Moth doesn't open the door. He talks through it, and his voice has the flat calm of a man with a shotgun.",
    changes: [
      { name: "advance_time", ok: true, summary: "Time +20 min" },
      { name: "resource", ok: true, summary: "Stress +1 · Dana" },
      { name: "money", ok: true, summary: "−50 credits · the lift attendant" },
    ],
  }),
  adventure: () => ({
    id: id(500), versionId: id(501), previousVersionId: null, version: 1, campaignId: NOIR_CAMPAIGN_ID, timelineId: id(900),
    worldId: id(600), worldVersion: 1, title: "The Lazarus case", premise: "One chip, two buyers, no witnesses.",
    pacing: { kind: "mini_arc", custom: null }, mode: "canon", status: "active",
    start: { worldMinutes: 1 * 1440, sceneId: null }, completion: null, summary: null, review: null, createdAt: at(0),
  }),
  dmSettings: { campaignId: NOIR_CAMPAIGN_ID, runtime: "dm-loop-v1", dmTurn: { providerId: "openai", modelId: "gpt-6-astra", reasoning: "high" }, revision: 1 },
  library: [{ ...row(1), title: "Neon & Rain", subtitle: "The Lazarus case", language: "en" }],
  images: {
    [N.dana]: "/preview/stage-5/noir-dana.jpg",
    [N.car]: "/preview/stage-5/noir-car.jpg",
    [N.stack]: "/preview/stage-5/noir-stack.jpg",
    [N.chip]: "/preview/stage-5/noir-chip.jpg",
  },
  drawing: new Set([N.mara, N.stim]),
  figure: null,
  atlas: null,
  talkTo: N.mara,
  pictures: noirPictures,
  course: N.spire,
  placements: [[N.stack, 0.38, 0.62], [N.harbor, 0.18, 0.78], [N.spire, 0.7, 0.24]].map(([location, x, y]) => ({
    campaign_id: NOIR_CAMPAIGN_ID, location_id: location as string, level: "world" as const, parent_location_id: null, x: x as number, y: y as number, revision: 1, updated_at: at(0),
  })),
  worlds: { worlds: [{ id: id(600), versionId: id(601), version: 1, title: "The Stacks", premise: "A rain-soaked city of stacked towers, syndicates and implants.", packVersionIds: [] }], packs: [] },
};
