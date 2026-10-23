// Synthetic 2D Live preview campaign («Серый тракт»): invented records only — a
// world, a region, a town with two districts, a ford, a winter lodge, a rumoured
// lighthouse — with one checked scene, its POIs, a painted region map and the
// sample picture rows the previews read. No request ever leaves the browser.
import { DM_LOOP_DEFAULT_LIMITS } from "../../gameplay/dm-loop/limits.ts";
import { DM_OPTION_DEFAULTS } from "../../gameplay/dm-loop/options.ts";
import type { CampaignSnapshot, Entity, Location, Quest, Scene, Session } from "../../persistence/contracts.ts";
import type { PlaySnapshot, PublicTurn } from "../../gameplay/contracts.ts";
import type { DmSettings } from "../../gameplay/dm-loop/settings.ts";
import type { MapPlacement } from "../../map/placement-contracts.ts";
import { createCampaignSettings } from "../../campaign-settings.ts";
import type { Live2dBoard, Poi, SceneSheet } from "../../live2d/contracts.ts";
import { previewPictureBoard } from "./stage-v-pictures.ts";

export const LIVE2D_CAMPAIGN_ID = "1d1d1d1d-0000-4000-8000-000000000001";
const id = (n: number) => `1d1d1d1d-0000-4000-8000-${String(n).padStart(12, "0")}`;
const at = (minute: number) => new Date(Date.UTC(2026, 9, 20, 9, minute)).toISOString();
const row = (n: number, minute = 0) => ({ id: id(n), campaign_id: LIVE2D_CAMPAIGN_ID, revision: 1, updated_at: at(minute) });
const timeline = { timelineId: id(900), epoch: 1 };

export const LIVE2D_IDS = {
  hero: id(10), tobin: id(11), orm: id(12), malva: id(13),
  world: id(50), region: id(51), veresk: id(52), market: id(53), wharf: id(54), ford: id(55), lodge: id(56), lighthouse: id(57),
  session: id(60), questLodge: id(70),
  picRegion: id(80), picMarket: id(81), picVeresk: id(82), picFord: id(83), picHero: id(84), picTobin: id(85), picOrm: id(86),
  poiWell: id(90), poiSmithy: id(91), poiStall: id(92), poiGate: id(93), poiTobin: id(94), poiOrm: id(95), poiMalva: id(96),
  turnTravel: id(100), turnTalk: id(101),
};
const I = LIVE2D_IDS;

const entity = (n: number, value: Partial<Entity> & Pick<Entity, "kind" | "name">): Entity => ({
  ...row(n), details: "", hp: null, max_hp: null, stats: {}, resources: {}, conditions: [], equipment_slots: [], character_sheet: null, ...value,
});
const entities: Entity[] = [
  entity(10, { kind: "player", name: "Ярвен", details: "Следопыт с Серого тракта.", hp: 14, max_hp: 18 }),
  entity(11, { kind: "companion", name: "Тобин", details: "Молодой возчик, знает каждую колею.", hp: 9, max_hp: 11 }),
  entity(12, { kind: "npc", name: "Кузнец Орм", details: "Хозяин кузни на площади; немногословен." }),
  entity(13, { kind: "npc", name: "Старуха Мальва", details: "Торгует травами у прилавка; ушла на ярмарку." }),
];

const location = (n: number, name: string, description: string, status: Location["status"], detail?: Location["detail"]): Location =>
  ({ ...row(n), name, description, status, ...(detail ? { detail } : {}) });
const locations: Location[] = [
  location(50, "Ардан", "Известный мир: тракты, перевалы и холодное море на западе.", "known"),
  location(51, "Серый тракт", "Старая дорога между Вереском и северными зимовьями; броды, вересковые пустоши, редкие сторожки.", "visited"),
  location(52, "Вереск", "Торговый городок на холме: рыночная площадь, кузня, старая верфь у реки.", "visited"),
  location(53, "Рыночная площадь", "Площадь с колодцем посередине, кузня Орма, прилавки и часовня у северного края.", "visited", { parentId: I.veresk, whereabouts: "в сердце города" }),
  location(54, "Старая верфь", "Полусгнившие стапели у реки; ворота с площади ведут сюда.", "known", { parentId: I.veresk, whereabouts: "у реки, ниже площади" }),
  location(55, "Каменный брод", "Брод через Серую реку: плоские камни, старая сторожка, вода по колено.", "visited"),
  location(56, "Зимовье Гарта", "Охотничья изба на севере тракта; туда ушли люди Гарта.", "known"),
  location(57, "Пустой маяк", "Говорят, на мысу стоит маяк, где никто не живёт.", "rumored", { parentId: I.region, whereabouts: "на западном мысу" }),
];

const quests: Quest[] = [
  { ...row(70), title: "Люди Гарта", description: "Найти охотников, ушедших к зимовью.", status: "open", kind: "quest", detail: { locationIds: [I.lodge] } },
];
const sessions: Session[] = [{ ...row(60), title: "Дорога в Вереск", status: "open", recap: "" }];
const scene = (n: number, sequence: number, role: Scene["role"], title: string, body: string): Scene =>
  ({ ...row(n, sequence), sequence, session_id: I.session, title, body, role, settings_revision: 1, created_at: at(sequence) });
const scenes: Scene[] = [
  scene(110, 1, "narration", "Брод", "Каменный брод шумит под ногами; сторожка пуста, дверь приоткрыта."),
  scene(111, 2, "player", "Ход", "Идём в Вереск, к площади."),
  scene(112, 3, "narration", "Площадь", "На Рыночной площади колодец, у кузни Орма звенит молот; Тобин пьёт у колодца. Ворота на старую верфь закрыты."),
];

export const live2dCampaign = { ...row(1), id: LIVE2D_CAMPAIGN_ID, title: "Серый тракт", subtitle: "Синтетическая кампания · 2D", language: "ru" as const };

export function live2dSnapshot(): CampaignSnapshot {
  const settings = createCampaignSettings(LIVE2D_CAMPAIGN_ID);
  settings.language = "ru";
  settings.visualStyle = "Тёплая гуашь и тушь, холодный северный свет; без текста на картинке.";
  return structuredClone({
    timeline,
    campaign: live2dCampaign,
    settings: { campaign_id: LIVE2D_CAMPAIGN_ID, revision: 1, updated_at: at(0), values: settings },
    settingsHistory: [],
    documents: [{ ...row(120), title: "Путеводитель ведущего", status: "canon", current_version_id: id(121), body: "Серый тракт: дорога, броды, зимовья." }],
    entities, storages: [], items: [], sessions, scenes,
    publicState: { campaign_id: LIVE2D_CAMPAIGN_ID, revision: 9, updated_at: at(9), summary: "Партия на Рыночной площади Вереска.", current_session_id: I.session, current_scene_id: id(112), current_location_id: I.market },
    quests, locations, assets: [], feedback: [], dmGuideDocumentId: id(120),
  } satisfies CampaignSnapshot);
}

const turn = (n: number, input: string, narration: string, minute: number, changes: PublicTurn["changes"]): PublicTurn => ({
  id: id(n), campaign_id: LIVE2D_CAMPAIGN_ID, session_id: I.session, mode: "game", input, companionId: null, listenerIds: [], status: "committed",
  expectedRevision: 8, committedRevision: 9, settingsRevision: 1, created_at: at(minute), updated_at: at(minute), narration, visualDescription: null,
  checks: [], proposal: null, failure: null, canRetry: false, canCancel: false, timeline, changes,
});
export function live2dPlay(): PlaySnapshot {
  return structuredClone({
    rulesetId: "world-logic-v1", startupPending: false, timeline, campaignId: LIVE2D_CAMPAIGN_ID, revision: 9, configured: true, model: "claude-opus-5-5",
    configuration: { profile: "console-basic-v1", controlledEntityIds: [I.hero], presentEntityIds: [I.hero, I.tobin, I.orm], nearbyStorageIds: [], safeLocationIds: [I.veresk], itemRules: [] },
    worldMinutes: 2 * 1440 + 660,
    turns: [
      turn(100, "Идём в Вереск, к площади.", "Дорога поднимается на холм; к полудню вы на площади.", 5, [{ tool: "move_party", ok: true, summary: "Переход: Вереск (2 часа 30 минут)" }]),
      turn(101, "Осматриваюсь на площади.", "Колодец, кузня, прилавки. Тобин уже у воды.", 8, []),
    ],
    restRecords: [], recipes: [], effects: [], encounters: [], participants: [], pendingActions: [], conversations: [], sessionGuidance: [], provenance: [],
  } satisfies PlaySnapshot);
}

export const live2dDmSettings: DmSettings = {
  campaignId: LIVE2D_CAMPAIGN_ID, runtime: "dm-loop-v1", dmTurn: { providerId: "anthropic", modelId: "claude-opus-5-5", reasoning: "medium" },
  limits: { ...DM_LOOP_DEFAULT_LIMITS }, customLimits: false, depth: { min: "medium", max: "xhigh" }, notebookVisible: false, boostNext: false,
  voiceExamples: false, voiceMode: "off", voiceTokenCap: 30_000, split: null, snapshotsKeep: null, options: { ...DM_OPTION_DEFAULTS }, revision: 1,
};

const place = (locationId: string, level: MapPlacement["level"], parent: string | null, x: number, y: number): MapPlacement =>
  ({ campaign_id: LIVE2D_CAMPAIGN_ID, location_id: locationId, level, parent_location_id: parent, x, y, revision: 1, updated_at: at(0) });
export const live2dPlacements: MapPlacement[] = [
  place(I.world, "world", null, 0.45, 0.5),
  place(I.region, "region", I.world, 0.5, 0.5),
  place(I.veresk, "local", I.region, 0.42, 0.36),
  place(I.ford, "local", I.region, 0.56, 0.6),
  place(I.lodge, "local", I.region, 0.7, 0.28),
];

export const live2dSheet: SceneSheet = {
  summary: "A hillside market square of a small trade town: cobbles sloping south, a stone well with a wooden roof in the middle, a smithy with an open front on the east side, two timber stalls along the west side, a small chapel with a bell at the north edge, a heavy gate in the south wall leading down to the old wharf.",
  features: [
    { key: "well", label: "Колодец", kind: "feature", description: "a stone well with a wooden roof in the middle of the square", mustShow: true, targetLocationId: null },
    { key: "smithy", label: "Кузня Орма", kind: "object", description: "a smithy with an open front and a glowing forge on the east side", mustShow: true, targetLocationId: null },
    { key: "chapel", label: "Часовня", kind: "feature", description: "a small chapel with a bell at the north edge", mustShow: true, targetLocationId: null },
    { key: "stall", label: "Прилавок трав", kind: "object", description: "a timber stall with bundles of herbs on the west side", mustShow: false, targetLocationId: null },
    { key: "wharf-gate", label: "Ворота на верфь", kind: "exit", description: "a heavy gate in the south wall", mustShow: false, targetLocationId: I.wharf },
  ],
  people: [{ name: "Тобин", entityId: I.tobin, at: "well" }, { name: "Кузнец Орм", entityId: I.orm, at: "smithy" }, { name: "Старуха Мальва", entityId: I.malva, at: "stall" }],
  light: "noon sun from the south, long shadows under the stalls",
  timeOfDay: "noon",
  never: ["a second gate", "a tavern sign", "a statue"],
  crowded: false,
};
const poi = (n: string, key: string, kind: Poi["kind"], label: string, note: string, x: number | null, y: number | null, over: Partial<Poi> = {}): Poi => ({
  id: n, locationId: I.market, key, kind, label, note, entityId: null, targetLocationId: null, x, y, confidence: x === null ? null : 0.9, approximate: false,
  source: "locator", hidden: false, revision: 1, updatedAt: at(3), ...over,
});
export const live2dPois: Poi[] = [
  poi(I.poiWell, "well", "feature", "Колодец", "Каменный колодец под крышей; вода холодная.", 0.5, 0.62),
  poi(I.poiSmithy, "smithy", "object", "Кузня Орма", "Открытая кузня, горн горит.", 0.8, 0.5),
  poi(I.poiStall, "stall", "object", "Прилавок трав", "Пучки трав, пусто — хозяйки нет.", 0.2, 0.56, { confidence: 0.45, approximate: true }),
  poi(I.poiGate, "wharf-gate", "exit", "Ворота на верфь", "Тяжёлые ворота в южной стене.", 0.5, 0.9, { targetLocationId: I.wharf }),
  poi(I.poiTobin, "person-tobin", "person", "Тобин", "Пьёт у колодца.", 0.56, 0.7, { entityId: I.tobin, source: "sheet" }),
  poi(I.poiOrm, "person-orm", "person", "Кузнец Орм", "У горна, с молотом.", 0.84, 0.58, { entityId: I.orm, source: "sheet" }),
  poi(I.poiMalva, "person-malva", "person", "Старуха Мальва", "У прилавка.", 0.24, 0.64, { entityId: I.malva, source: "sheet" }),
];

export const live2dBoard: Live2dBoard = {
  campaignId: LIVE2D_CAMPAIGN_ID,
  settings: { markers: "standard", revision: 1 },
  scenes: [{
    locationId: I.market, revision: 2, sheet: live2dSheet, status: "checked", pictureId: I.picMarket,
    check: { model: "claude-sonnet-5-5", items: [
      { key: "well", visible: true, x: 0.5, y: 0.62, confidence: 0.95 }, { key: "smithy", visible: true, x: 0.8, y: 0.5, confidence: 0.9 }, { key: "chapel", visible: false, x: null, y: null, confidence: 0.1 },
    ], contradictions: [], peopleInBackground: false, costUsdMicros: 9_000, checkedAt: at(3) },
    sideList: ["Часовня"], redraws: 1, error: null, updatedAt: at(3),
  }],
  pois: live2dPois,
  // Fix S3-accept Д3: the DM's prep of the region (public part), the markers the check placed on the picture.
  regionMaps: [{ anchorId: I.region, pictureId: I.picRegion, signature: [I.ford, I.lodge, I.veresk].sort().join(","), status: "ready", updatedAt: at(2),
    revision: 3, check: null, sideList: [], prepRevision: 1, prepDocumentId: id(122), picturePrepRevision: 1,
    prep: {
      overview: "Серый тракт идёт с юга на север вдоль Серой реки: Вереск на холме у реки, ниже по течению — Каменный брод, на севере, за вересковыми пустошами, — Зимовье Гарта.",
      landscape: "A river runs from the north-east down to the south-west; heath and low hills on both banks; a road follows the east bank north to pine woods.",
      places: [
        { locationId: I.veresk, role: "hill town", within: null, x: 0.42, y: 0.36, where: "на холме у Серой реки", look: "a small walled town on a hill by the river" },
        { locationId: I.market, role: "market square", within: I.veresk, x: 0.42, y: 0.36, where: "в сердце города", look: "an open square with a well" },
        { locationId: I.wharf, role: "old wharf", within: I.veresk, x: 0.42, y: 0.36, where: "у реки, ниже площади", look: "rotten slipways at the riverside" },
        { locationId: I.ford, role: "ford", within: null, x: 0.56, y: 0.6, where: "ниже по течению, полдня пути от Вереска", look: "flat stones across the river with an old watch hut" },
        { locationId: I.lodge, role: "hunting lodge", within: null, x: 0.7, y: 0.28, where: "на севере тракта, за пустошами", look: "a log lodge at the edge of pine woods" },
      ],
      routes: [{ from: I.veresk, to: I.ford, way: "тракт вниз по реке", days: 0.5 }, { from: I.veresk, to: I.lodge, way: "тракт на север через пустоши", days: 2 }],
      source: "model",
    },
    markers: [
      { locationId: I.veresk, x: 0.43, y: 0.37, confidence: 0.92, source: "check", approximate: false },
      { locationId: I.market, x: 0.44, y: 0.35, confidence: 0.7, source: "check", approximate: false },
      { locationId: I.wharf, x: 0.4, y: 0.4, confidence: null, source: "prep", approximate: true },
      { locationId: I.ford, x: 0.55, y: 0.61, confidence: 0.88, source: "check", approximate: false },
      { locationId: I.lodge, x: 0.71, y: 0.27, confidence: 0.8, source: "check", approximate: false },
    ],
  }],
  battleMaps: [],
};

/** Sample pictures: the probe drops real files under public/preview/live2d/; a missing file falls back to the placeholder. */
export const live2dPictures = previewPictureBoard({
  campaignId: LIVE2D_CAMPAIGN_ID, worldId: id(600), timeline, at,
  style: { id: id(700), scope: "campaign", preset: "watercolor", label: "Гуашь и тушь" },
  anchors: [
    { id: I.picRegion, subjectKind: "location", subjectId: I.region, composition: "region", image: "/preview/live2d/region.jpg" },
    { id: I.picMarket, subjectKind: "location", subjectId: I.market, composition: "scene", image: "/preview/live2d/market.jpg" },
    { id: I.picVeresk, subjectKind: "location", subjectId: I.veresk, composition: "location", image: "/preview/live2d/veresk.jpg" },
    { id: I.picFord, subjectKind: "location", subjectId: I.ford, composition: "location", image: "/preview/live2d/ford.jpg" },
    { id: I.picHero, subjectKind: "entity", subjectId: I.hero, composition: "portrait", image: "/preview/live2d/hero.jpg" },
    { id: I.picTobin, subjectKind: "entity", subjectId: I.tobin, composition: "portrait", image: "/preview/live2d/tobin.jpg" },
    { id: I.picOrm, subjectKind: "entity", subjectId: I.orm, composition: "portrait", image: "/preview/live2d/orm.jpg" },
  ],
  frames: [],
});
/** Subject art by subject ID for the shared image resolver. */
export const live2dImages: Record<string, string> = {
  [I.hero]: "/preview/live2d/hero.jpg", [I.tobin]: "/preview/live2d/tobin.jpg", [I.orm]: "/preview/live2d/orm.jpg",
  [I.veresk]: "/preview/live2d/veresk.jpg", [I.ford]: "/preview/live2d/ford.jpg",
};
