// Marker visibility (MASTER_SPEC §46.4, the direction doc): Off / Tracked only /
// Standard / All known. All four read the same player-known state; only the
// presentation changes. Latent DM-private hooks are never an input here, so no
// mode can show them.
import type { CampaignSnapshot } from "../persistence/contracts.ts";
import type { MarkerVisibility } from "./contracts.ts";
import type { Live2dPin } from "./hierarchy.ts";

export type MarkerContext = {
  currentId: string | null;
  destinationId: string | null;
  /** Places an open quest, thread or the main arc points at (player-known goals). */
  trackedIds: Set<string>;
};

/** The places of open goals, from the public quest records. */
export function trackedPlaceIds(snapshot: CampaignSnapshot): Set<string> {
  const ids = new Set<string>();
  for (const quest of snapshot.quests) {
    if (quest.campaign_id !== snapshot.campaign.id || quest.status !== "open") continue;
    for (const id of quest.detail?.locationIds ?? []) ids.add(id);
  }
  for (const location of snapshot.locations) if (location.detail?.questIds?.length) ids.add(location.id);
  return ids;
}

export function visiblePins(visibility: MarkerVisibility, pins: readonly Live2dPin[], context: MarkerContext): Live2dPin[] {
  return pins.filter((pin) => {
    if (pin.locationId === context.currentId || pin.locationId === context.destinationId) return true;
    if (visibility === "off") return false;
    if (context.trackedIds.has(pin.locationId)) return true;
    if (visibility === "tracked") return false;
    if (pin.status === "rumored") return visibility === "all";
    return true;
  });
}

export const markerLabel = (visibility: MarkerVisibility, language: "ru" | "en") => ({
  off: language === "ru" ? "Выкл." : "Off",
  tracked: language === "ru" ? "Только цель" : "Tracked only",
  standard: language === "ru" ? "Обычно" : "Standard",
  all: language === "ru" ? "Всё известное" : "All known",
})[visibility];
