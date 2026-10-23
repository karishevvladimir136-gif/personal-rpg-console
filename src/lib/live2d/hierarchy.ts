// The hierarchy the 2D layer walks: world → region → town → district → scene,
// read from the public Location records and the atlas placements (src/lib/map).
// Nothing here is generated: a level exists when the records give it content;
// detail is drawn lazily, only at the scale the party reaches.
import type { CampaignSnapshot, Location } from "../persistence/contracts.ts";
import type { MapPlacement } from "../map/placement-contracts.ts";
import { atlasLevelView, projectAtlas, type AtlasProjection } from "../map/atlas-view.ts";

export type Live2dLevel = "world" | "region" | "town" | "district" | "scene";
export const LIVE2D_LEVELS: Live2dLevel[] = ["world", "region", "town", "district", "scene"];

export type Live2dPin = {
  locationId: string;
  name: string;
  status: Location["status"];
  x: number;
  y: number;
  /** The place has child places (a town with districts, a district with houses). */
  hasChildren: boolean;
  /** Fix S3-accept Д3: the spot is not known for sure («положение примерное»): the atlas never placed it, or the
   * painted map could not show it. */
  approximate?: boolean;
};
export type Live2dCrumb = { level: Live2dLevel; anchorId: string | null; name: string };
export type Live2dView = {
  level: Live2dLevel;
  /** The place this level shows: the region-level place, the town, the district, the scene's place; null for the flat known region. */
  anchorId: string | null;
  anchorName: string;
  pins: Live2dPin[];
  /** The levels above and including this one, for the breadcrumb. */
  crumbs: Live2dCrumb[];
  /** The next level down from here and the place to open it at, when the records give one. */
  down: { level: Live2dLevel; anchorId: string | null } | null;
};

type Known = Location & { status: "known" | "visited" | "rumored" };
const knownOf = (snapshot: CampaignSnapshot) =>
  snapshot.locations.filter((row): row is Known => row.campaign_id === snapshot.campaign.id && ["known", "visited", "rumored"].includes(row.status));

/** Children by the DM's own words («на краю гавани» under a parent), as the atlas lays them out. */
export function childPlaces(snapshot: CampaignSnapshot, parentId: string): Known[] {
  return knownOf(snapshot).filter((row) => row.detail?.parentId === parentId);
}
/** The chain of parents from a place upwards (nearest first), by the records' parentId. */
export function parentChain(snapshot: CampaignSnapshot, locationId: string): Known[] {
  const byId = new Map(knownOf(snapshot).map((row) => [row.id, row]));
  const chain: Known[] = [];
  let cursor = byId.get(locationId)?.detail?.parentId ?? null;
  while (cursor && !chain.some((row) => row.id === cursor) && chain.length < 8) {
    const parent = byId.get(cursor);
    if (!parent) break;
    chain.push(parent);
    cursor = parent.detail?.parentId ?? null;
  }
  return chain;
}

/** Where a place sits in the atlas: its placement, its region (a region-level placement) and world. */
function placementPath(projection: AtlasProjection, locationId: string | null) {
  const byId = new Map(projection.placements.map((row) => [row.location_id, row]));
  const own = locationId ? byId.get(locationId) ?? null : null;
  const region = own?.level === "region" ? own : own?.level === "local" ? byId.get(own.parent_location_id ?? "") ?? null : null;
  const world = own?.level === "world" ? own : region ? byId.get(region.parent_location_id ?? "") ?? null : null;
  return { own, region: region?.level === "region" ? region : null, world: world?.level === "world" ? world : null };
}

/** Fix S3-accept Д1: a nested atlas has saved region-level placements; a derived one (a child of a world-level place)
 * never turns a flat campaign into a nested one. */
const isFlat = (projection: AtlasProjection) => !projection.placements.some((row) => row.level === "region" && row.revision > 0);
/** The atlas's own areas (the world and region levels of a nested atlas): a place's parent chain stops at them. */
const areasOf = (projection: AtlasProjection) => new Set(isFlat(projection) ? [] : projection.placements.filter((row) => row.level !== "local").map((row) => row.location_id));
/** Fix S3-accept Д1: the place's parents in the tree up to (not including) its region — the town, the district. */
function placeChain(snapshot: CampaignSnapshot, projection: AtlasProjection, locationId: string): Known[] {
  const areas = areasOf(projection);
  const chain = parentChain(snapshot, locationId);
  const cut = chain.findIndex((row) => areas.has(row.id));
  return cut >= 0 ? chain.slice(0, cut) : chain;
}

/** A child's derived spot (around its parent) re-projected into the parent's own picture. */
function childPin(snapshot: CampaignSnapshot, projection: AtlasProjection, parent: MapPlacement | null, child: Known, index: number, total: number): Live2dPin {
  const placement = projection.placements.find((row) => row.location_id === child.id);
  let x: number, y: number;
  if (placement && placement.x !== null && placement.y !== null && parent && parent.x !== null && parent.y !== null) {
    // The atlas spreads children up to about 0.15 around the parent: scale that spread to the picture.
    x = 0.5 + (placement.x - parent.x) / 0.32;
    y = 0.5 + (placement.y - parent.y) / 0.32;
  } else {
    const angle = (index / Math.max(1, total)) * Math.PI * 2 - Math.PI / 2;
    x = 0.5 + Math.cos(angle) * 0.3;
    y = 0.5 + Math.sin(angle) * 0.28;
  }
  const clamp = (value: number) => Number(Math.min(0.92, Math.max(0.08, value)).toFixed(3));
  return { locationId: child.id, name: child.name, status: child.status, x: clamp(x), y: clamp(y), hasChildren: childPlaces(snapshot, child.id).length > 0 };
}

/** The levels a focus place opens, top to bottom. The region is the region-level place that holds
 * it, or — for a campaign whose places all sit at the world level — the flat «known region» (anchor
 * null). Towns and districts are the records' parents (a place with child places). */
export function live2dCrumbs(snapshot: CampaignSnapshot, placements: readonly MapPlacement[], focusId: string | null): Live2dCrumb[] {
  const projection = projectAtlas(snapshot, placements);
  const chain = focusId ? placeChain(snapshot, projection, focusId).reverse() : [];
  const top = chain[0]?.id ?? focusId;
  const path = placementPath(projection, top ?? null);
  const name = (id: string | null) => (id ? snapshot.locations.find((row) => row.id === id)?.name ?? "" : "");
  const crumbs: Live2dCrumb[] = [];
  const worlds = atlasLevelView(projection, "world", null, null).pins;
  const flat = isFlat(projection);
  if (worlds.length && !flat) crumbs.push({ level: "world", anchorId: path.world?.location_id ?? null, name: name(path.world?.location_id ?? null) });
  crumbs.push({ level: "region", anchorId: flat ? null : path.region?.location_id ?? null, name: flat ? "" : name(path.region?.location_id ?? null) });
  // The focus is a region-level place itself: nothing below the region yet.
  if (path.own?.level === "region" && !chain.length) return crumbs;
  const areas = [...chain, ...(focusId && childPlaces(snapshot, focusId).length ? [snapshot.locations.find((row) => row.id === focusId)!] : [])];
  areas.forEach((area, index) => crumbs.push({ level: index === 0 ? "town" : "district", anchorId: area.id, name: area.name }));
  if (focusId && !(childPlaces(snapshot, focusId).length && areas.at(-1)?.id === focusId)) crumbs.push({ level: "scene", anchorId: focusId, name: name(focusId) });
  return crumbs;
}

/** One level of the hierarchy, with its pins laid out by the atlas placement code. */
export function live2dView(snapshot: CampaignSnapshot, placements: readonly MapPlacement[], level: Live2dLevel, anchorId: string | null, focusId: string | null): Live2dView {
  const projection = projectAtlas(snapshot, placements);
  const known = knownOf(snapshot);
  const byId = new Map(known.map((row) => [row.id, row]));
  const hasChildren = (id: string) => childPlaces(snapshot, id).length > 0;
  const toPin = (row: MapPlacement): Live2dPin | null => {
    const location = byId.get(row.location_id);
    if (!location || row.x === null || row.y === null) return null;
    return { locationId: location.id, name: location.name, status: location.status, x: row.x, y: row.y, hasChildren: hasChildren(location.id) };
  };
  const crumbs = live2dCrumbs(snapshot, placements, focusId);
  const flat = isFlat(projection);
  const anchorName = anchorId ? byId.get(anchorId)?.name ?? "" : "";
  if (level === "world") {
    const pins = atlasLevelView(projection, "world", null, null).pins.map(toPin).filter((row): row is Live2dPin => row !== null);
    const regionAnchor = crumbs.find((row) => row.level === "region")?.anchorId ?? null;
    return { level, anchorId: null, anchorName: "", pins, crumbs: crumbs.filter((row) => row.level === "world"), down: { level: "region", anchorId: regionAnchor } };
  }
  if (level === "region") {
    // Flat: every world-level place is a mark of the known region. Otherwise the places under the region.
    const placed = (flat ? atlasLevelView(projection, "world", null, null).pins
      : atlasLevelView(projection, "local", null, anchorId).pins.filter((row) => row.parent_location_id === anchorId))
      .map(toPin).filter((row): row is Live2dPin => row !== null)
      // Children of a town are shown inside the town, not on the region.
      .filter((pin) => !placeChain(snapshot, projection, pin.locationId).length)
      // Fix S3-accept Д3: a spot the atlas derived (nobody placed it) is approximate.
      .map((pin) => (projection.placements.find((row) => row.location_id === pin.locationId)?.revision ? pin : { ...pin, approximate: true }));
    // Fix S3-accept Д3: every known place of the region appears — the ones the atlas never placed join the region
    // the party is in, along the bottom edge, «положение примерное», until the region's prep or the picture places them.
    const areas = areasOf(projection);
    const here = flat || (anchorId !== null && anchorId === (crumbs.find((row) => row.level === "region")?.anchorId ?? null));
    const unplaced = here ? known.filter((row) => !areas.has(row.id) && !placed.some((pin) => pin.locationId === row.id)
      && !projection.placements.some((placement) => placement.location_id === row.id && placement.x !== null) && !placeChain(snapshot, projection, row.id).length) : [];
    const pins = [...placed, ...unplaced.map((row, index): Live2dPin => ({ locationId: row.id, name: row.name, status: row.status,
      x: Number(((index + 1) / (unplaced.length + 1)).toFixed(3)), y: 0.92, hasChildren: hasChildren(row.id), approximate: true }))];
    const town = crumbs.find((row) => row.level === "town");
    return { level, anchorId: flat ? null : anchorId, anchorName: flat ? "" : anchorName, pins, crumbs: crumbs.filter((row) => row.level === "world" || row.level === "region"),
      down: town ? { level: "town", anchorId: town.anchorId } : focusId && byId.has(focusId) ? { level: "scene", anchorId: focusId } : null };
  }
  if (level === "town" || level === "district") {
    const parent = anchorId ? projection.placements.find((row) => row.location_id === anchorId) ?? null : null;
    const children = anchorId ? childPlaces(snapshot, anchorId) : [];
    const pins = children.map((child, index) => childPin(snapshot, projection, parent, child, index, children.length));
    const at = crumbs.findIndex((row) => row.anchorId === anchorId && row.level === level);
    const next = at >= 0 ? crumbs[at + 1] ?? null : null;
    return { level, anchorId, anchorName, pins, crumbs: at >= 0 ? crumbs.slice(0, at + 1) : crumbs.filter((row) => row.level !== "scene"),
      down: next ? { level: next.level, anchorId: next.anchorId } : anchorId ? { level: "scene", anchorId } : null };
  }
  return { level: "scene", anchorId, anchorName, pins: [], crumbs, down: null };
}

/** The deepest level the records open for the current place (the scene, once the place was visited). */
export function live2dOpeningLevel(snapshot: CampaignSnapshot, placements: readonly MapPlacement[], locationId: string | null): { level: Live2dLevel; anchorId: string | null } {
  const crumbs = live2dCrumbs(snapshot, placements, locationId);
  const place = locationId ? snapshot.locations.find((row) => row.id === locationId) : null;
  if (place?.status === "visited") return { level: "scene", anchorId: place.id };
  const last = crumbs.filter((row) => row.level !== "scene").at(-1);
  return last ? { level: last.level, anchorId: last.anchorId } : { level: "region", anchorId: null };
}

/** Fix S3-accept Д1: where «Карта» opens — the deepest map level on the current place's path that has content
 * (the town the party stands in, else its region); the scene is the leaf, one marker further down. */
export function live2dMapOpening(snapshot: CampaignSnapshot, placements: readonly MapPlacement[], locationId: string | null): { level: Live2dLevel; anchorId: string | null } {
  const levels = live2dCrumbs(snapshot, placements, locationId).filter((row) => row.level !== "scene");
  for (const crumb of [...levels].reverse())
    if (live2dView(snapshot, placements, crumb.level, crumb.anchorId, locationId).pins.length) return { level: crumb.level, anchorId: crumb.anchorId };
  const last = levels.at(-1);
  return last ? { level: last.level, anchorId: last.anchorId } : { level: "region", anchorId: null };
}

/** The region a place belongs to, for the painted map: the region-level anchor, or null when flat. */
export function regionAnchorOf(snapshot: CampaignSnapshot, placements: readonly MapPlacement[], locationId: string | null): string | null {
  return live2dCrumbs(snapshot, placements, locationId).find((row) => row.level === "region")?.anchorId ?? null;
}
