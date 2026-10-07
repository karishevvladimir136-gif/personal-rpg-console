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
  const locations = snapshot.locations.filter(
    (row) =>
      row.campaign_id === snapshot.campaign.id &&
      (row.status === "known" || row.status === "visited"),
  );
  const visible = visibleAtlasPlacements(snapshot, placements);
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
