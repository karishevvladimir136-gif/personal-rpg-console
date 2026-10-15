// Which accepted picture a subject shows, presentation only.
// A subject visual belongs to a record revision; when the record changes
// (a quantity, an HP value) the previous accepted picture stays on screen until
// a new one is accepted. Items of the same type (normalized name + category)
// share one picture, so a new stack never waits for a new image.
import type { CampaignSnapshot } from "../persistence/contracts.ts";
import { safeSubjectVisualAsset, subjectVisualDocuments } from "../visual-frame/subject-job.ts";
import { sameTimeline } from "../saves/fence.ts";
import { itemTypeKey } from "./rarity.ts";

export type SubjectKind = "entity" | "item" | "location";
export type SubjectImage = {
  assetId: string | null;
  url: string | null;
  /** A job for this subject (or its item type) is queued or generating. */
  drawing: boolean;
  /** 1-based position of the shown picture among this subject's accepted versions. */
  version: { index: number; total: number } | null;
};

export const subjectImageUrl = (campaignId: string, assetId: string) =>
  `/api/visual-frame?campaignId=${encodeURIComponent(campaignId)}&assetId=${encodeURIComponent(assetId)}`;

function sameType(snapshot: CampaignSnapshot, itemId: string, otherId: string, otherName: string) {
  const item = snapshot.items.find((row) => row.id === itemId);
  if (!item) return false;
  const other = snapshot.items.find((row) => row.id === otherId);
  return other ? itemTypeKey(other) === itemTypeKey(item) : itemTypeKey({ name: otherName, category: item.category }) === itemTypeKey(item);
}

export function subjectImageFor(snapshot: CampaignSnapshot, subject: { kind: SubjectKind; id: string }): SubjectImage {
  const accepted = snapshot.assets
    .map((asset) => ({ asset, info: safeSubjectVisualAsset(snapshot, asset) }))
    .filter((row): row is { asset: typeof row.asset; info: NonNullable<typeof row.info> } =>
      row.info !== null && row.info.subject.kind === subject.kind && sameTimeline(row.info.timeline, snapshot.timeline))
    .sort((a, b) => a.asset.updated_at.localeCompare(b.asset.updated_at) || a.asset.id.localeCompare(b.asset.id));
  const own = accepted.filter((row) => row.info.subject.id === subject.id);
  const shared = subject.kind === "item" && !own.length
    ? accepted.filter((row) => sameType(snapshot, subject.id, row.info.subject.id, row.info.subject.name))
    : [];
  const chosen = (own.length ? own : shared).at(-1) ?? null;
  const jobs = subjectVisualDocuments(snapshot).filter(({ value }) =>
    (value.status === "queued" || value.status === "generating") &&
    value.basis.subject.kind === subject.kind &&
    (value.basis.subject.id === subject.id ||
      (subject.kind === "item" && sameType(snapshot, subject.id, value.basis.subject.id, value.basis.subject.name))));
  return {
    assetId: chosen?.asset.id ?? null,
    url: chosen ? subjectImageUrl(snapshot.campaign.id, chosen.asset.id) : null,
    drawing: jobs.length > 0,
    version: chosen && own.length ? { index: own.length, total: own.length } : null,
  };
}
