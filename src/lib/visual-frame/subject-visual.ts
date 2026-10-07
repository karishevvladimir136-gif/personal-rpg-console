import type { Asset, CampaignSnapshot } from "../persistence/contracts.ts";
import {
  mockArtForAsset,
  referenceIsCurrent,
  visualDocuments,
  visualSubjects,
} from "./model.ts";
import type { MockArt, VisualSubject } from "./model.ts";
import { safeFrameAsset } from "./real-frame.ts";
import { safeSubjectVisualAsset } from "./subject-job.ts";
import { sameTimeline } from "../saves/fence.ts";

export type PublicVisualSubject = VisualSubject & {
  kind: "entity" | "item" | "location";
};

type SubjectImage =
  | { kind: "real"; assetId: string; url: string }
  | { kind: "mock"; assetId: string; art: MockArt };

export type SubjectVisualSelection = {
  label: string;
  placeholderArt: MockArt;
  approval: "approved" | "draft" | null;
  referenceDocumentId: string | null;
  image: SubjectImage | null;
};

function imageFor(
  snapshot: CampaignSnapshot,
  asset: Asset | undefined,
): SubjectImage | null {
  if (!asset || asset.campaign_id !== snapshot.campaign.id || asset.kind !== "image")
    return null;
  if (asset.storage_path && (safeFrameAsset(snapshot, asset) || safeSubjectVisualAsset(snapshot, asset)))
    return {
      kind: "real",
      assetId: asset.id,
      // The existing authenticated endpoint verifies the asset and issues a short-lived URL.
      url: `/api/visual-frame?campaignId=${encodeURIComponent(snapshot.campaign.id)}&assetId=${encodeURIComponent(asset.id)}`,
    };
  const art = mockArtForAsset(asset);
  return art ? { kind: "mock", assetId: asset.id, art } : null;
}

/** Public snapshot data only. Unapproved art never replaces an available approved image. */
export function selectSubjectVisual(
  snapshot: CampaignSnapshot,
  subject: PublicVisualSubject,
): SubjectVisualSelection | null {
  const source = visualSubjects(snapshot).find(
    (row) =>
      row.subject.kind === subject.kind && row.subject.id === subject.id,
  );
  if (!source) return null;

  const placeholderArt: MockArt =
    subject.kind === "entity"
      ? "portrait"
      : subject.kind === "item"
        ? "object"
        : "landscape";
  const references = visualDocuments(snapshot)
    .filter(
      ({ value }) =>
        value.kind === "reference" &&
        value.subject.kind === subject.kind &&
        value.subject.id === subject.id &&
        value.approval !== "invalidated" &&
        referenceIsCurrent(snapshot, value),
    )
    .map(({ record, value }) => {
      if (value.kind !== "reference") throw new Error("unreachable");
      const asset = snapshot.assets.find(
        (row) =>
          row.id === value.imageAssetId &&
          row.campaign_id === snapshot.campaign.id &&
          row.revision === value.imageAssetRevision,
      );
      return {
        record,
        approval: value.approval as "approved" | "draft",
        image: imageFor(snapshot, asset),
      };
    })
    .sort((a, b) =>
      b.record.updated_at.localeCompare(a.record.updated_at) ||
      b.record.id.localeCompare(a.record.id),
    );
  const selected =
    references.find((row) => row.approval === "approved" && row.image) ??
    references.find((row) => row.approval === "approved") ??
    references.find((row) => row.image) ??
    references[0];
  const standalone = !selected?.image
    ? snapshot.assets
        .filter((asset) => {
          const value = safeSubjectVisualAsset(snapshot, asset);
          return value &&
            value.subject.kind === subject.kind &&
            value.subject.id === subject.id &&
            value.subject.revision === source.revision &&
            sameTimeline(value.timeline, snapshot.timeline);
        })
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at) || b.id.localeCompare(a.id))[0]
    : null;
  return {
    label: source.label,
    placeholderArt,
    approval: selected?.approval ?? null,
    referenceDocumentId: selected?.record.id ?? null,
    image: selected?.image ?? imageFor(snapshot, standalone ?? undefined),
  };
}
