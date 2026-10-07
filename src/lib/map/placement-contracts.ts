import type { TimelineFence } from "../saves/contracts.ts";
import { isTimelineFence } from "../saves/fence.ts";
import { isUuid } from "../persistence/validation.ts";

export type MapLevel = "world" | "region" | "local";

/** Presentation metadata only. The active public Location remains gameplay authority. */
export type MapPlacement = {
  campaign_id: string;
  location_id: string;
  level: MapLevel;
  parent_location_id: string | null;
  x: number | null;
  y: number | null;
  revision: number;
  updated_at: string;
};

export type MapLayout = {
  timeline: TimelineFence;
  placements: MapPlacement[];
};

export type MapPlacementCommand = {
  requestId: string;
  timeline: TimelineFence;
  locationId: string;
  expectedRevision: number | null;
  level: MapLevel;
  parentLocationId: string | null;
  x: number | null;
  y: number | null;
};

function object(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function coordinate(value: unknown): value is number | null {
  return (
    value === null ||
    (typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1)
  );
}

export function parseMapPlacementCommand(value: unknown): MapPlacementCommand | null {
  const row = object(value);
  if (!row) return null;
  const keys = [
    "requestId", "timeline", "locationId", "expectedRevision", "level",
    "parentLocationId", "x", "y",
  ];
  if (Object.keys(row).length !== keys.length ||
      keys.some((key) => !Object.hasOwn(row, key))) return null;
  if (!isUuid(row.requestId) || !isTimelineFence(row.timeline) ||
      !isUuid(row.locationId) ||
      (row.expectedRevision !== null &&
        (!Number.isSafeInteger(row.expectedRevision) ||
          (row.expectedRevision as number) < 1 ||
          (row.expectedRevision as number) > 2_147_483_646)) ||
      !["world", "region", "local"].includes(String(row.level)) ||
      (row.parentLocationId !== null && !isUuid(row.parentLocationId)) ||
      !coordinate(row.x) || !coordinate(row.y) ||
      (row.x === null) !== (row.y === null) ||
      (row.level === "world") !== (row.parentLocationId === null) ||
      row.parentLocationId === row.locationId) return null;
  return row as MapPlacementCommand;
}
