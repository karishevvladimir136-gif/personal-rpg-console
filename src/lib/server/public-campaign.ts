import "server-only";
import type { CampaignSnapshot } from "../persistence/contracts.ts";
import { MAP_VISUAL_ASSET_PREFIX } from "../visual-frame/map-job.ts";
import {
  isMapVisualMetadata,
  projectPublicMapSnapshot,
  publicMapVersionsAllowed,
} from "../map/public-projection.ts";
import type { MapPlacement } from "../map/placement-contracts.ts";
import { requireOwner } from "./auth.ts";
import { PersistenceError } from "./errors.ts";
import { readMapPlacementsForSnapshot } from "./map-layout.ts";
import { readCampaign, readDocumentVersions } from "./repository.ts";

async function visiblePlacements(snapshot: CampaignSnapshot): Promise<MapPlacement[]> {
  if (!snapshot.timeline) return [];
  try {
    const { user } = await requireOwner();
    return await readMapPlacementsForSnapshot(user.id, snapshot.campaign.id, snapshot.timeline);
  } catch {
    // An unavailable or stale layout must never expose a later timeline's map job.
    return [];
  }
}

/** The normal campaign DTO must not carry future map job facts across save loads. */
export async function readPublicCampaign(campaignId: string): Promise<CampaignSnapshot> {
  const snapshot = await readCampaign(campaignId);
  if (!snapshot.documents.some(isMapVisualMetadata) &&
    !snapshot.assets.some((row) => row.description.startsWith(MAP_VISUAL_ASSET_PREFIX)))
    return snapshot;
  return projectPublicMapSnapshot(snapshot, await visiblePlacements(snapshot));
}

export async function readPublicDocumentVersions(campaignId: string, documentId: string) {
  const versions = await readDocumentVersions(campaignId, documentId);
  if (!versions.some(isMapVisualMetadata)) return versions;
  const snapshot = await readCampaign(campaignId);
  if (!publicMapVersionsAllowed(snapshot, await visiblePlacements(snapshot), versions))
    throw new PersistenceError("not_found");
  return versions;
}
