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
  /** What the illustrator draws (plain English, one clause). */
  description: string;
  mustShow: boolean;
  /** An exit leading to a known child or neighbour place, when the records name one. */
  targetLocationId: string | null;
};
/** A person the story put in this place, and the feature they stand at (from the narration). */
export type SheetPerson = { name: string; entityId: string | null; at: string | null };
/** The scene sheet of a place: written once from the records and the narration before the place
 * is drawn, edited by the owner, read by the DM afterwards so later narration does not contradict it. */
export type SceneSheet = {
  /** One paragraph in plain English: the place as the records and the story describe it. */
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
 * places all sit at the world level. `signature` names the places drawn. */
export type RegionMap = { anchorId: string | null; pictureId: string | null; signature: string; status: "drawing" | "ready" | "failed"; updatedAt: string };

/** The public 2D board of a campaign: never a seed, never a prompt. */
export type Live2dBoard = {
  campaignId: string;
  settings: Live2dSettings;
  scenes: Live2dScene[];
  pois: Poi[];
  regionMaps: RegionMap[];
};
export const emptyLive2dBoard = (campaignId: string): Live2dBoard => ({ campaignId, settings: defaultLive2dSettings, scenes: [], pois: [], regionMaps: [] });

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
  return { key: String(raw.key), label, kind: raw.kind, description: str(raw.description, 240), mustShow: raw.mustShow === true,
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
export function parseRegionMap(raw: unknown): RegionMap | null {
  if (!isRecord(raw) || (raw.anchorId !== null && !isUuid(raw.anchorId)) || typeof raw.signature !== "string" || !oneOf(["drawing", "ready", "failed"] as const, raw.status) || typeof raw.updatedAt !== "string") return null;
  return { anchorId: raw.anchorId as string | null, pictureId: isUuid(raw.pictureId) ? raw.pictureId : null, signature: raw.signature, status: raw.status, updatedAt: raw.updatedAt };
}
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
