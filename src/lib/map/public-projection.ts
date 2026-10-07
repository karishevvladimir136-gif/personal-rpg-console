import type { CampaignSnapshot, DocumentRecord, DocumentVersion } from "../persistence/contracts.ts";
import type { MapPlacement } from "./placement-contracts.ts";
import {
  MAP_VISUAL_ASSET_PREFIX,
  mapVisualPendingIsCurrent,
  mapVisualPublicFactsStillVisible,
  parseMapVisualJob,
  safeMapVisualAsset,
} from "../visual-frame/map-job.ts";
import { VISUAL_FRAME_PREFIX } from "../visual-frame/model.ts";

/** Map jobs are campaign-wide media records, including when an older save is loaded. */
export function isMapVisualMetadata(row: Pick<DocumentRecord, "body" | "title">): boolean {
  if (!row.body.startsWith(VISUAL_FRAME_PREFIX)) return false;
  try {
    const value: unknown = JSON.parse(row.body.slice(VISUAL_FRAME_PREFIX.length));
    return Boolean(value && typeof value === "object" &&
      ("schema" in value && value.schema === 6 ||
        "kind" in value && value.kind === "map_visual"));
  } catch {
    // Generated map jobs have a reserved title. Fail closed if their body is damaged.
    return row.title.startsWith("MAP:");
  }
}

export function publicMapDocumentAllowed(
  snapshot: CampaignSnapshot,
  placements: MapPlacement[],
  row: Pick<DocumentRecord, "body" | "title">,
): boolean {
  if (!isMapVisualMetadata(row)) return true;
  const job = parseMapVisualJob(row);
  if (!job || job.campaign_id !== snapshot.campaign.id) return false;
  return ["queued", "generating", "uncertain", "draft"].includes(job.status)
    ? mapVisualPendingIsCurrent(snapshot, placements, job)
    : mapVisualPublicFactsStillVisible(snapshot, job.basis, placements);
}

/** Browser/SSR projection only. Internal media recovery continues to read the raw snapshot. */
export function projectPublicMapSnapshot(
  snapshot: CampaignSnapshot,
  placements: MapPlacement[],
): CampaignSnapshot {
  const documents = snapshot.documents.filter((row) =>
    publicMapDocumentAllowed(snapshot, placements, row));
  const assets = snapshot.assets.filter((row) =>
    !row.description.startsWith(MAP_VISUAL_ASSET_PREFIX) ||
    safeMapVisualAsset(snapshot, row, placements) !== null);
  return { ...snapshot, documents, assets };
}

/** Existing document history stays readable only when every map version is public now. */
export function publicMapVersionsAllowed(
  snapshot: CampaignSnapshot,
  placements: MapPlacement[],
  versions: DocumentVersion[],
): boolean {
  if (!versions.some(isMapVisualMetadata)) return true;
  const current = snapshot.documents.find((row) =>
    row.id === versions[0]?.document_id && isMapVisualMetadata(row) &&
    publicMapDocumentAllowed(snapshot, placements, row));
  const currentJob = current && parseMapVisualJob(current);
  if (!current || !currentJob) return false;
  return versions.every((row) => {
    if (row.document_id !== current.id || !isMapVisualMetadata(row)) return false;
    const historical = parseMapVisualJob(row);
    return Boolean(historical &&
      JSON.stringify(historical.basis) === JSON.stringify(currentJob.basis) &&
      // Historical queued/draft versions of an accepted map remain readable
      // after ordinary public revisions, provided their facts are still public.
      mapVisualPublicFactsStillVisible(snapshot, historical.basis, placements));
  });
}
