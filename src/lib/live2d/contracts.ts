// 2D Live, first slice (docs/stages/LIVE2D_1.md): the records the 2D layer shows.
// The rule over everything: the DM and the rules decide what happened; the
// records remember it; the 2D layer only shows it and turns clicks into intents
// in the action box. Nothing in this folder changes a Location, a person, an item
// or the time. Everything here is presentation metadata over the public records.
import { isUuid } from "../persistence/validation.ts";

/** Marker visibility (the direction doc): presentation only; «All known» never shows latent DM-private hooks. */
export type MarkerVisibility = "off" | "tracked" | "standard" | "all";
export const MARKER_VISIBILITIES: MarkerVisibility[] = ["off", "tracked", "standard", "all"];
export type Live2dSettings = { markers: MarkerVisibility; revision: number };
export const defaultLive2dSettings: Live2dSettings = { markers: "standard", revision: 0 };

/** One named thing of a place's scene sheet: a door, a counter, a shrine, a body — what the records
 * and the narration named. `mustShow` features are the promise the picture has to keep. */
export type SheetFeatureKind = "entrance" | "exit" | "object" | "feature";
export const SHEET_FEATURE_KINDS: SheetFeatureKind[] = ["entrance", "exit", "object", "feature"];
export type SheetFeature = {
  /** Stable key within the sheet (lowercase, dashes). */
  key: string;
  /** The label in the campaign's language, as the player knows it. */
  label: string;
  kind: SheetFeatureKind;
  /** What the player reads on the hotspot — in the campaign's language since Fix S3-accept Б2 (older sheets: the
   * illustrator's plain English clause, redone once into the campaign's language by the scene-language job). */
  description: string;
  /** Fix S3-accept Б2: the same thing as one clause of plain English for the illustrator; absent on older sheets,
   * whose description is that clause. */
  brief?: string;
  mustShow: boolean;
  /** An exit leading to a known child or neighbour place, when the records name one. */
  targetLocationId: string | null;
};
/** A person the story put in this place, and the feature they stand at (from the narration). */
export type SheetPerson = { name: string; entityId: string | null; at: string | null };
/** The scene sheet of a place: written once from the records and the narration before the place
 * is drawn, edited by the owner, read by the DM afterwards so later narration does not contradict it. */
export type SceneSheet = {
  /** One paragraph: the place as the records and the story describe it (the campaign's language since Fix S3-accept Б2). */
  summary: string;
  features: SheetFeature[];
  people: SheetPerson[];
  /** Light sources and their quality; the time of day the sheet was written for. */
  light: string;
  timeOfDay: string | null;
  /** What is never there (no forge, no second door, no lantern nobody has). */
  never: string[];
  /** A crowded place (a market) may have background extras; otherwise the place is drawn empty. */
  crowded: boolean;
  /** Fix S3-accept Б2: the language the player-facing text (summary, descriptions, light, never) is written in — set
   * when it is the campaign's; absent on sheets written in plain English before (the one-time redo sets it). */
  language?: "ru" | "en";
};

export type SceneStatus = "draft" | "drawing" | "checked" | "flagged" | "failed";
export const SCENE_STATUSES: SceneStatus[] = ["draft", "drawing", "checked", "flagged", "failed"];
/** The vision check of a scene picture: each must-show feature found or not, where it is, and what
 * contradicts the sheet. A position is normalised to the picture (0..1 from the top-left). */
export type SceneCheckItem = { key: string; visible: boolean; x: number | null; y: number | null; confidence: number };
export type SceneCheck = {
  model: string;
  items: SceneCheckItem[];
  contradictions: { what: string; detail: string }[];
  /** Named people baked into the background (never allowed). */
  peopleInBackground: boolean;
  costUsdMicros: number;
  checkedAt: string;
};
export type Live2dScene = {
  locationId: string;
  revision: number;
  sheet: SceneSheet;
  status: SceneStatus;
  /** The ready scene picture (a Stage V picture row with the «scene» composition), if any. */
  pictureId: string | null;
  check: SceneCheck | null;
  /** Must-show features the picture could not keep after one redraw: shown as a side list, never guessed markers. */
  sideList: string[];
  redraws: number;
  error: string | null;
  updatedAt: string;
};

/** A point of interest the hero knows in a place, with a position on the scene picture. Kinds:
 * a person present (shown as a portrait token), an exit to another place, an object, a feature,
 * a lead (a discovered hook). `approximate` marks a low-confidence position. */
export type PoiKind = "person" | "exit" | "object" | "feature" | "lead";
export const POI_KINDS: PoiKind[] = ["person", "exit", "object", "feature", "lead"];
export type PoiSource = "locator" | "owner" | "sheet" | "discovery";
export const POI_SOURCES: PoiSource[] = ["locator", "owner", "sheet", "discovery"];
export type Poi = {
  id: string;
  locationId: string;
  key: string;
  kind: PoiKind;
  label: string;
  /** What is known about it (shown on hover), in the campaign's language. */
  note: string;
  entityId: string | null;
  targetLocationId: string | null;
  x: number | null;
  y: number | null;
  confidence: number | null;
  approximate: boolean;
  source: PoiSource;
  hidden: boolean;
  revision: number;
  updatedAt: string;
};

/** The painted map of a region: drawn once per region, redrawn only when a new place appears in it.
 * `anchorId` is the region-level place, or null for the flat «known region» of a campaign whose
 * places all sit at the world level. `signature` names the places drawn.
 * Fix S3-accept Д3: the DM's prep of the region (public part only; the hidden part lives in the DM's
 * private notes) survives every redraw; the markers sit where the check found each place on the picture;
 * a picture that does not keep the prep is «flagged» with the side list, like a scene. */
export type RegionMapStatus = "drawing" | "ready" | "flagged" | "failed";
export const REGION_MAP_STATUSES: RegionMapStatus[] = ["drawing", "ready", "flagged", "failed"];
/** Fix S3-accept Д3: where a place's marker sits on the painted region: `check` — the vision check found it
 * on the picture; `prep` — the DM's prep gives the spot but the picture did not show it; `owner` — the owner
 * moved it (the highest authority, kept across redraws). `approximate` reads «положение примерное». */
export type RegionMarkerSource = "check" | "prep" | "owner";
export type RegionMarker = { locationId: string; x: number; y: number; confidence: number | null; source: RegionMarkerSource; approximate: boolean };
export type RegionMap = {
  anchorId: string | null; pictureId: string | null; signature: string; status: RegionMapStatus; updatedAt: string;
  revision: number;
  markers: RegionMarker[];
  check: SceneCheck | null;
  /** What the picture missed or put elsewhere («Пост стражи — не в Берегове»), shown beside the map. */
  sideList: string[];
  /** The DM's prep of the region (public part), null until prepared; `prepRevision` counts its versions. */
  prep: RegionPrep | null;
  prepRevision: number;
  /** The canon document that holds the prep's public text (the DM reads it every turn). */
  prepDocumentId: string | null;
  /** The prep revision the current picture was painted from. */
  picturePrepRevision: number | null;
};

/** Fix S3-accept Д3: the DM's design of a region before the painter paints it — public part only. `x`, `y`
 * place it on the region's sheet (0..1, north up), null where the DM gives no position («положение
 * примерное»); `within` — the settlement it lies inside (a guard post in a village), the tree's parent
 * where the records give none. `role` and `look` are English for the painter; `where` is in the campaign's
 * language for the canon. */
export type RegionPrepPlace = { locationId: string; role: string; within: string | null; x: number | null; y: number | null; where: string; look: string };
export type RegionPrepRoute = { from: string; to: string; way: string; days: number | null };
export type RegionPrep = {
  /** The land, rivers and roads in the campaign's language — what the heroes know. */
  overview: string;
  /** The same land in English for the painter (north is up). */
  landscape: string;
  places: RegionPrepPlace[];
  routes: RegionPrepRoute[];
  /** Who wrote it: the DM's model, or the records alone when the model was unavailable. */
  source: "model" | "records";
};

/** Part 2: the top-down battle background of a place, one per sheet revision, checked like a scene. */
export type BattleMap = { locationId: string; sheetRevision: number; pictureId: string | null; status: "drawing" | "ready" | "flagged" | "failed"; check: SceneCheck | null; grid: { cols: number; rows: number; feetPerCell: number }; updatedAt: string };

/** The public 2D board of a campaign: never a seed, never a prompt. */
export type Live2dBoard = {
  campaignId: string;
  settings: Live2dSettings;
  scenes: Live2dScene[];
  pois: Poi[];
  regionMaps: RegionMap[];
  battleMaps: BattleMap[];
};
export const emptyLive2dBoard = (campaignId: string): Live2dBoard => ({ campaignId, settings: defaultLive2dSettings, scenes: [], pois: [], regionMaps: [], battleMaps: [] });

/** A latent hook of an area (the DM's hidden layer, item 5 of the slice): private until discovered.
 * Stored in the shape of a `note_world` fact so the fix run's hidden layer can absorb it at
 * integration: the key is `poi_seed_<area>_<n>`, the value the premise. Never in the public board. */
export type PoiSeed = {
  id: string;
  areaLocationId: string | null;
  key: string;
  theme: string;
  premise: string;
  status: "latent" | "discovered";
  discoveredPoiId: string | null;
  createdAt: string;
};

const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const oneOf = <T extends string>(list: readonly T[], v: unknown): v is T => list.includes(v as T);
const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const unit = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1 ? v : null);
export const KEY_PATTERN = /^[a-z0-9][a-z0-9_-]{0,59}$/;

export function parseSheetFeature(raw: unknown): SheetFeature | null {
  if (!isRecord(raw) || !KEY_PATTERN.test(String(raw.key)) || !oneOf(SHEET_FEATURE_KINDS, raw.kind)) return null;
  const label = str(raw.label, 80);
  if (!label) return null;
  const brief = str(raw.brief, 240);
  return { key: String(raw.key), label, kind: raw.kind, description: str(raw.description, 240), ...(brief ? { brief } : {}), mustShow: raw.mustShow === true,
    targetLocationId: isUuid(raw.targetLocationId) ? raw.targetLocationId : null };
}
export function parseSceneSheet(raw: unknown): SceneSheet | null {
  if (!isRecord(raw)) return null;
  const features = Array.isArray(raw.features) ? raw.features.map(parseSheetFeature).filter((row): row is SheetFeature => row !== null) : [];
  const keys = new Set<string>();
  const unique = features.filter((row) => (keys.has(row.key) ? false : (keys.add(row.key), true))).slice(0, 24);
  const people = Array.isArray(raw.people) ? raw.people.flatMap((row) => {
    if (!isRecord(row)) return [];
    const name = str(row.name, 80);
    if (!name) return [];
    const at = typeof row.at === "string" && keys.has(row.at) ? row.at : null;
    return [{ name, entityId: isUuid(row.entityId) ? row.entityId : null, at }];
  }).slice(0, 12) : [];
  return {
    summary: str(raw.summary, 1200),
    features: unique,
    people,
    light: str(raw.light, 240),
    timeOfDay: str(raw.timeOfDay, 40) || null,
    never: Array.isArray(raw.never) ? raw.never.map((row) => str(row, 120)).filter(Boolean).slice(0, 12) : [],
    crowded: raw.crowded === true,
    ...(raw.language === "ru" || raw.language === "en" ? { language: raw.language } : {}),
  };
}
export function parseSceneCheck(raw: unknown): SceneCheck | null {
  if (!isRecord(raw) || typeof raw.model !== "string" || !Array.isArray(raw.items) || typeof raw.checkedAt !== "string") return null;
  return {
    model: raw.model,
    items: raw.items.flatMap((row) => {
      if (!isRecord(row) || !KEY_PATTERN.test(String(row.key))) return [];
      const confidence = unit(row.confidence) ?? 0;
      return [{ key: String(row.key), visible: row.visible === true, x: unit(row.x), y: unit(row.y), confidence }];
    }),
    contradictions: Array.isArray(raw.contradictions) ? raw.contradictions.flatMap((row) => (isRecord(row) && str(row.what, 120) ? [{ what: str(row.what, 120), detail: str(row.detail, 240) }] : [])) : [],
    peopleInBackground: raw.peopleInBackground === true,
    costUsdMicros: Number.isSafeInteger(raw.costUsdMicros) ? (raw.costUsdMicros as number) : 0,
    checkedAt: raw.checkedAt,
  };
}
export function parseLive2dScene(raw: unknown): Live2dScene | null {
  if (!isRecord(raw) || !isUuid(raw.locationId) || !Number.isSafeInteger(raw.revision) || !oneOf(SCENE_STATUSES, raw.status) || typeof raw.updatedAt !== "string") return null;
  const sheet = parseSceneSheet(raw.sheet);
  if (!sheet) return null;
  return {
    locationId: raw.locationId, revision: raw.revision as number, sheet, status: raw.status,
    pictureId: isUuid(raw.pictureId) ? raw.pictureId : null, check: parseSceneCheck(raw.check),
    sideList: Array.isArray(raw.sideList) ? raw.sideList.map((row) => str(row, 80)).filter(Boolean) : [],
    redraws: Number.isSafeInteger(raw.redraws) ? (raw.redraws as number) : 0,
    error: typeof raw.error === "string" ? raw.error : null, updatedAt: raw.updatedAt,
  };
}
export function parsePoi(raw: unknown): Poi | null {
  if (!isRecord(raw) || !isUuid(raw.id) || !isUuid(raw.locationId) || !KEY_PATTERN.test(String(raw.key)) || !oneOf(POI_KINDS, raw.kind) ||
    !oneOf(POI_SOURCES, raw.source) || !Number.isSafeInteger(raw.revision) || typeof raw.updatedAt !== "string") return null;
  const label = str(raw.label, 80);
  if (!label) return null;
  const x = unit(raw.x), y = unit(raw.y);
  return {
    id: raw.id, locationId: raw.locationId, key: String(raw.key), kind: raw.kind, label, note: str(raw.note, 400),
    entityId: isUuid(raw.entityId) ? raw.entityId : null, targetLocationId: isUuid(raw.targetLocationId) ? raw.targetLocationId : null,
    x: x !== null && y !== null ? x : null, y: x !== null && y !== null ? y : null,
    confidence: unit(raw.confidence), approximate: raw.approximate === true, source: raw.source, hidden: raw.hidden === true,
    revision: raw.revision as number, updatedAt: raw.updatedAt,
  };
}
/** Fix S3-accept Д3: one marker of a region map (a place of the records at a unit spot). */
export function parseRegionMarker(raw: unknown): RegionMarker | null {
  if (!isRecord(raw) || !isUuid(raw.locationId) || !oneOf(["check", "prep", "owner"] as const, raw.source)) return null;
  const x = unit(raw.x), y = unit(raw.y);
  if (x === null || y === null) return null;
  return { locationId: raw.locationId, x, y, confidence: unit(raw.confidence), source: raw.source, approximate: raw.approximate === true };
}
/** Fix S3-accept Д3: the prep's public part, strictly (a place is a known record's ID; nothing else is kept). */
export function parseRegionPrep(raw: unknown): RegionPrep | null {
  if (!isRecord(raw)) return null;
  const seen = new Set<string>();
  const places = (Array.isArray(raw.places) ? raw.places : []).flatMap((row): RegionPrepPlace[] => {
    if (!isRecord(row) || !isUuid(row.locationId) || seen.has(row.locationId)) return [];
    seen.add(row.locationId);
    const x = unit(row.x), y = unit(row.y);
    return [{ locationId: row.locationId, role: str(row.role, 60), within: isUuid(row.within) && row.within !== row.locationId ? row.within : null,
      x: x !== null && y !== null ? x : null, y: x !== null && y !== null ? y : null, where: str(row.where, 300), look: str(row.look, 300) }];
  }).slice(0, 60);
  const routes = (Array.isArray(raw.routes) ? raw.routes : []).flatMap((row): RegionPrepRoute[] => {
    if (!isRecord(row) || !isUuid(row.from) || !isUuid(row.to) || row.from === row.to) return [];
    const days = typeof row.days === "number" && Number.isFinite(row.days) && row.days >= 0 && row.days <= 365 ? Math.round(row.days * 10) / 10 : null;
    return [{ from: row.from, to: row.to, way: str(row.way, 300), days }];
  }).slice(0, 60);
  return { overview: str(raw.overview, 3000), landscape: str(raw.landscape, 1500), places, routes, source: raw.source === "records" ? "records" : "model" };
}
export function parseRegionMap(raw: unknown): RegionMap | null {
  if (!isRecord(raw) || (raw.anchorId !== null && !isUuid(raw.anchorId)) || typeof raw.signature !== "string" || !oneOf(REGION_MAP_STATUSES, raw.status) || typeof raw.updatedAt !== "string") return null;
  const markers = (Array.isArray(raw.markers) ? raw.markers : []).map(parseRegionMarker).filter((row): row is RegionMarker => row !== null);
  return {
    anchorId: raw.anchorId as string | null, pictureId: isUuid(raw.pictureId) ? raw.pictureId : null, signature: raw.signature, status: raw.status, updatedAt: raw.updatedAt,
    revision: Number.isSafeInteger(raw.revision) ? (raw.revision as number) : 0,
    markers: markers.filter((row, index) => markers.findIndex((other) => other.locationId === row.locationId) === index),
    check: parseSceneCheck(raw.check),
    sideList: Array.isArray(raw.sideList) ? raw.sideList.map((row) => str(row, 120)).filter(Boolean) : [],
    prep: raw.prep === null || raw.prep === undefined ? null : parseRegionPrep(raw.prep),
    prepRevision: Number.isSafeInteger(raw.prepRevision) ? (raw.prepRevision as number) : 0,
    prepDocumentId: isUuid(raw.prepDocumentId) ? raw.prepDocumentId : null,
    picturePrepRevision: Number.isSafeInteger(raw.picturePrepRevision) ? (raw.picturePrepRevision as number) : null,
  };
}
export function parseBattleMap(raw: unknown): BattleMap | null {
  if (!isRecord(raw) || !isUuid(raw.locationId) || !Number.isSafeInteger(raw.sheetRevision) || !oneOf(["drawing", "ready", "flagged", "failed"] as const, raw.status) || typeof raw.updatedAt !== "string") return null;
  const grid = isRecord(raw.grid) ? raw.grid : {};
  const n = (v: unknown, fallback: number) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.round(v) : fallback);
  return { locationId: raw.locationId, sheetRevision: raw.sheetRevision as number, pictureId: isUuid(raw.pictureId) ? raw.pictureId : null, status: raw.status,
    check: parseSceneCheck(raw.check), grid: { cols: n(grid.cols, 24), rows: n(grid.rows, 18), feetPerCell: n(grid.feetPerCell, 5) }, updatedAt: raw.updatedAt };
}
export const battleMapOf = (board: Pick<Live2dBoard, "battleMaps">, locationId: string) => board.battleMaps.find((row) => row.locationId === locationId) ?? null;
export function parseLive2dSettings(raw: unknown): Live2dSettings {
  const v = isRecord(raw) ? raw : {};
  return { markers: oneOf(MARKER_VISIBILITIES, v.markers) ? v.markers : "standard", revision: Number.isSafeInteger(v.revision) ? (v.revision as number) : 0 };
}
export function parseLive2dBoard(raw: unknown): Live2dBoard | null {
  if (!isRecord(raw) || !isUuid(raw.campaignId)) return null;
  // Architectural separation: a board that carries seeds is not a public board.
  if ("seeds" in raw) return null;
  return {
    campaignId: raw.campaignId,
    settings: parseLive2dSettings(raw.settings),
    scenes: Array.isArray(raw.scenes) ? raw.scenes.map(parseLive2dScene).filter((row): row is Live2dScene => row !== null) : [],
    pois: Array.isArray(raw.pois) ? raw.pois.map(parsePoi).filter((row): row is Poi => row !== null) : [],
    regionMaps: Array.isArray(raw.regionMaps) ? raw.regionMaps.map(parseRegionMap).filter((row): row is RegionMap => row !== null) : [],
    battleMaps: Array.isArray(raw.battleMaps) ? raw.battleMaps.map(parseBattleMap).filter((row): row is BattleMap => row !== null) : [],
  };
}
export function parsePoiSeed(raw: unknown): PoiSeed | null {
  if (!isRecord(raw) || !isUuid(raw.id) || (raw.areaLocationId !== null && !isUuid(raw.areaLocationId)) || !/^poi_seed_[a-z0-9_-]+$/.test(String(raw.key)) ||
    !oneOf(["latent", "discovered"] as const, raw.status) || typeof raw.createdAt !== "string") return null;
  return { id: raw.id, areaLocationId: raw.areaLocationId as string | null, key: String(raw.key), theme: str(raw.theme, 80), premise: str(raw.premise, 2000),
    status: raw.status, discoveredPoiId: isUuid(raw.discoveredPoiId) ? raw.discoveredPoiId : null, createdAt: raw.createdAt };
}

export const sceneOf = (board: Pick<Live2dBoard, "scenes">, locationId: string) => board.scenes.find((row) => row.locationId === locationId) ?? null;
export const regionMapOf = (board: Pick<Live2dBoard, "regionMaps">, anchorId: string | null) => board.regionMaps.find((row) => row.anchorId === anchorId) ?? null;
