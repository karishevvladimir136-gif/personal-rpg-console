import type { CampaignSnapshot } from "../persistence/contracts.ts";
import type { MapLayout, MapPlacement, MapPlacementCommand } from "./placement-contracts.ts";
import { sameTimeline } from "../saves/fence.ts";

export type AutoPlacementAttempt = { signature: string; requestId: string };

type PlacementAccess = {
  load: (campaignId: string) => Promise<MapLayout>;
  save: (campaignId: string, command: MapPlacementCommand) => Promise<{ placement: MapPlacement }>;
  requestId: () => string;
};

/** Materialize only the provisional current-place pin, on the owner's explicit
 * Generate action. The existing map-layout RPC keeps it presentation-only and
 * enforces the campaign/timeline/revision fences. No media is dispatched here. */
export async function ensureCurrentMapPlacement(
  snapshot: CampaignSnapshot,
  visiblePlacements: readonly MapPlacement[],
  pending: { current: AutoPlacementAttempt | null },
  access: PlacementAccess,
): Promise<MapLayout | null> {
  const campaignId = snapshot.campaign.id;
  const locationId = snapshot.publicState.current_location_id;
  const current = snapshot.locations.find((row) =>
    row.campaign_id === campaignId && row.id === locationId &&
    (row.status === "known" || row.status === "visited"));
  const provisional = visiblePlacements.find((row) =>
    row.campaign_id === campaignId && row.location_id === locationId &&
    row.level === "world" && row.parent_location_id === null &&
    row.revision === 0);
  if (!current || !provisional) return null;
  if (!snapshot.timeline) throw new Error("conflict");

  const first = await access.load(campaignId);
  if (!sameTimeline(first.timeline, snapshot.timeline)) throw new Error("conflict");
  let actual = first.placements.find((row) => row.location_id === current.id);
  let layout = first;
  // An existing nested placement is an explicit owner layout decision. Do not
  // reparent it to World; let the atlas refresh to that real hierarchy.
  if (actual && (actual.level !== "world" || actual.parent_location_id !== null))
    return first;
  if (!actual || actual.x === null || actual.y === null) {
    const signature = JSON.stringify({
      campaignId, timeline: snapshot.timeline,
      locationId: current.id, locationRevision: current.revision,
      publicStateRevision: snapshot.publicState.revision,
      expectedPlacementRevision: actual?.revision ?? null,
    });
    if (pending.current?.signature !== signature)
      pending.current = { signature, requestId: access.requestId() };
    await access.save(campaignId, {
      requestId: pending.current.requestId,
      timeline: snapshot.timeline,
      locationId: current.id,
      expectedRevision: actual?.revision ?? null,
      level: "world",
      parentLocationId: null,
      x: 0.5,
      y: 0.5,
    });
    // A saved revision, not the provisional revision zero, is the SQL media
    // job basis. Read it back even when the placement RPC returned success.
    layout = await access.load(campaignId);
    if (!sameTimeline(layout.timeline, snapshot.timeline)) throw new Error("conflict");
    actual = layout.placements.find((row) => row.location_id === current.id);
  }
  if (!actual || actual.campaign_id !== campaignId || actual.level !== "world" ||
    actual.parent_location_id !== null || !Number.isSafeInteger(actual.revision) ||
    actual.revision < 1 || actual.x === null || actual.y === null)
    throw new Error("conflict");
  pending.current = null;
  return layout;
}
