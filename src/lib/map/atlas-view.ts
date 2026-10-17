import type { CampaignSnapshot, Location } from "../persistence/contracts.ts";
import type { MapPlacement } from "./placement-contracts.ts";

export type AtlasLevel = "world" | "region" | "local";

/** Clamp only the painted control; the normalized placement remains authoritative and unchanged. */
export function atlasPinStyle(x: number, y: number): { left: string; top: string } {
  return {
    left: `clamp(64px, ${x * 100}%, calc(100% - 64px))`,
    top: `clamp(34px, ${y * 100}%, calc(100% - 34px))`,
  };
}

/** A placement is presentation metadata. Only a matching active public Location can render. */
export function visibleAtlasPlacements(
  snapshot: CampaignSnapshot,
  placements: readonly MapPlacement[],
): MapPlacement[] {
  const locations = new Set(
    snapshot.locations
      .filter(
        (row) =>
          row.campaign_id === snapshot.campaign.id &&
          (row.status === "known" || row.status === "visited"),
      )
      .map((row) => row.id),
  );
  const candidates = new Map<string, MapPlacement>();
  for (const row of placements) {
    if (
      row.campaign_id !== snapshot.campaign.id ||
      !locations.has(row.location_id) ||
      !["world", "region", "local"].includes(row.level) ||
      row.location_id === row.parent_location_id ||
      (row.x === null) !== (row.y === null) ||
      (row.x !== null && (!Number.isFinite(row.x) || row.x < 0 || row.x > 1)) ||
      (row.y !== null && (!Number.isFinite(row.y) || row.y < 0 || row.y > 1)) ||
      candidates.has(row.location_id)
    )
      continue;
    candidates.set(row.location_id, row);
  }
  const worlds = [...candidates.values()].filter(
    (row) => row.level === "world" && row.parent_location_id === null,
  );
  const worldIds = new Set(worlds.map((row) => row.location_id));
  const regions = [...candidates.values()].filter(
    (row) =>
      row.level === "region" &&
      row.parent_location_id !== null &&
      worldIds.has(row.parent_location_id),
  );
  const regionIds = new Set(regions.map((row) => row.location_id));
  const locals = [...candidates.values()].filter(
    (row) =>
      row.level === "local" &&
      row.parent_location_id !== null &&
      regionIds.has(row.parent_location_id),
  );
  return [...worlds, ...regions, ...locals];
}

/** A current known place can appear on the atlas before its layout is edited.
 * This row is derived for presentation only and is never sent to map-layout save.
 */
export function presentationAtlasPlacements(
  snapshot: CampaignSnapshot,
  placements: readonly MapPlacement[],
): MapPlacement[] {
  const visible = visibleAtlasPlacements(snapshot, placements);
  const current = snapshot.locations.find((row) =>
    row.campaign_id === snapshot.campaign.id &&
    row.id === snapshot.publicState.current_location_id &&
    (row.status === "known" || row.status === "visited"));
  // Polish group 9: places with a parent are laid out first, so a current place under a parent
  // opens the map at its own level; only a current place nobody placed gets the provisional world spot.
  const rows = [...visible, ...derivedPlacements(snapshot, visible)];
  if (!current || rows.some((row) => row.location_id === current.id && row.x !== null && row.y !== null)) return rows;
  return [
    ...rows.filter((row) => row.location_id !== current.id),
    { campaign_id: snapshot.campaign.id, location_id: current.id, level: "world" as const, parent_location_id: null, x: 0.5, y: 0.5, revision: 0, updated_at: current.updated_at },
  ];
}

/** A small deterministic number from a name, for a marker's position (never a random source). */
function nameHash(value: string): number {
  let hash = 2166136261;
  for (const char of value) hash = Math.imul(hash ^ char.codePointAt(0)!, 16777619) >>> 0;
  return hash;
}

/** Polish group 9: places the DM recorded with a parent («Понтонный рынок» in «Скрипучая Гавань»)
 * get a marker without manual placing — a deterministic spot around the parent: a region under a
 * world, a local place under a region, a sibling beside a local parent. Rumoured places are laid
 * out the same way (the map shows them dashed). Derived rows carry revision 0, like the provisional
 * current place, and are never sent to the layout save. Several passes let a chain resolve. */
export function derivedPlacements(snapshot: CampaignSnapshot, placed: readonly MapPlacement[]): MapPlacement[] {
  const byId = new Map(placed.filter((row) => row.x !== null && row.y !== null).map((row) => [row.location_id, row]));
  const out: MapPlacement[] = [];
  const candidates = snapshot.locations.filter((row) => row.campaign_id === snapshot.campaign.id && row.detail?.parentId && !byId.has(row.id)
    && (row.status === "known" || row.status === "visited" || row.status === "rumored"));
  for (let pass = 0; pass < 3; pass++) {
    for (const row of candidates) {
      if (byId.has(row.id)) continue;
      const parent = byId.get(row.detail!.parentId!);
      if (!parent) continue;
      const level = parent.level === "world" ? "region" : "local";
      const parentId = parent.level === "local" ? parent.parent_location_id : parent.location_id;
      const hash = nameHash(row.name);
      const angle = ((hash % 360) * Math.PI) / 180;
      const spread = parent.level === "local" ? 0.09 + ((hash >>> 8) % 5) * 0.015 : 0.18 + ((hash >>> 8) % 7) * 0.025;
      const centre = parent.level === "local" ? { x: parent.x!, y: parent.y! } : { x: 0.5, y: 0.5 };
      const clamp = (value: number) => Math.min(0.94, Math.max(0.06, value));
      const derived: MapPlacement = { campaign_id: snapshot.campaign.id, location_id: row.id, level, parent_location_id: parentId,
        x: Number(clamp(centre.x + Math.cos(angle) * spread).toFixed(3)), y: Number(clamp(centre.y + Math.sin(angle) * spread).toFixed(3)), revision: 0, updated_at: row.updated_at };
      byId.set(row.id, derived);
      out.push(derived);
    }
  }
  return out;
}

export type AtlasProjection = {
  locations: Location[];
  placements: MapPlacement[];
  unplaced: Location[];
  currentPath: { worldId: string | null; regionId: string | null; localId: string | null };
};

export function projectAtlas(
  snapshot: CampaignSnapshot,
  placements: readonly MapPlacement[],
): AtlasProjection {
  const visible = presentationAtlasPlacements(snapshot, placements);
  const derived = new Set(visible.filter((row) => row.revision === 0).map((row) => row.location_id));
  // Known and visited places, plus rumoured ones the DM placed under a parent (shown dashed).
  const locations = snapshot.locations.filter(
    (row) =>
      row.campaign_id === snapshot.campaign.id &&
      (row.status === "known" || row.status === "visited" || (row.status === "rumored" && derived.has(row.id))),
  );
  const byId = new Map(visible.map((row) => [row.location_id, row]));
  const current = byId.get(snapshot.publicState.current_location_id ?? "");
  const region = current?.level === "region"
    ? current
    : current?.level === "local"
      ? byId.get(current.parent_location_id ?? "")
      : undefined;
  const world = current?.level === "world"
    ? current
    : region?.level === "region"
      ? byId.get(region.parent_location_id ?? "")
      : undefined;
  return {
    locations,
    placements: visible,
    unplaced: locations.filter((row) => {
      const placement = byId.get(row.id);
      return !placement || placement.x === null || placement.y === null;
    }),
    currentPath: {
      worldId: world?.level === "world" ? world.location_id : null,
      regionId: region?.level === "region" ? region.location_id : null,
      localId: current?.level === "local" ? current.location_id : null,
    },
  };
}

/** Selection is a view preference; it never changes current Location or travel authority. */
export function atlasLevelView(
  projection: AtlasProjection,
  level: AtlasLevel,
  selectedWorldId: string | null,
  selectedRegionId: string | null,
): { anchorId: string | null; pins: MapPlacement[]; currentAreaId: string | null } {
  const rows = projection.placements;
  const worlds = rows.filter((row) => row.level === "world");
  const worldId = worlds.find((row) => row.location_id === selectedWorldId)?.location_id ??
    projection.currentPath.worldId ?? worlds[0]?.location_id ?? null;
  if (level === "world")
    return {
      anchorId: null,
      pins: worlds.filter((row) => row.x !== null && row.y !== null),
      currentAreaId: projection.currentPath.worldId,
    };
  const regions = rows.filter(
    (row) => row.level === "region" && row.parent_location_id === worldId,
  );
  const regionId = regions.find((row) => row.location_id === selectedRegionId)?.location_id ??
    regions.find((row) => row.location_id === projection.currentPath.regionId)?.location_id ??
    regions[0]?.location_id ?? null;
  if (level === "region")
    return {
      anchorId: worldId,
      pins: regions.filter((row) => row.x !== null && row.y !== null),
      currentAreaId: projection.currentPath.regionId,
    };
  return {
    anchorId: regionId,
    pins: rows.filter(
      (row) =>
        row.level === "local" &&
        row.parent_location_id === regionId &&
        row.x !== null &&
        row.y !== null,
    ),
    currentAreaId: projection.currentPath.localId,
  };
}

/** Open at the deepest mapped current area that actually has public pins.
 * A provisional current place remains at World until its hierarchy is saved.
 */
export function atlasOpeningLevel(projection: AtlasProjection): AtlasLevel {
  if (projection.currentPath.localId &&
      atlasLevelView(projection, "local", null, null).pins.length > 0)
    return "local";
  if (projection.currentPath.regionId &&
      atlasLevelView(projection, "region", null, null).pins.length > 0)
    return "region";
  return "world";
}
