import { readJson } from "../persistence/client.ts";
import type { MapLayout, MapPlacement, MapPlacementCommand } from "./placement-contracts.ts";

function url(campaignId: string) {
  return `/api/campaigns/${encodeURIComponent(campaignId)}/map-layout`;
}

export function loadMapLayout(campaignId: string) {
  return readJson<MapLayout>(url(campaignId));
}

export function saveMapPlacement(campaignId: string, command: MapPlacementCommand) {
  return readJson<{ placement: MapPlacement }>(url(campaignId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
}
