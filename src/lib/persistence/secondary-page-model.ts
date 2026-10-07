import type { CampaignSnapshot, Asset } from "./contracts.ts";
import { sceneOrder } from "./record-model.ts";
import { visualDocuments, referenceIsCurrent } from "../visual-frame/model.ts";

/** A presentation projection of the existing public DTO; never a new authority. */
export function secondaryPageRecords(data: CampaignSnapshot) {
  const own = <T extends { campaign_id: string }>(rows: T[]) =>
    rows.filter((row) => row.campaign_id === data.campaign.id);
  const sessions = own(data.sessions)
    .slice()
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  const scenes = sceneOrder(own(data.scenes)).filter((scene) =>
    sessions.some((session) => session.id === scene.session_id),
  );
  const locations = own(data.locations);
  return {
    quests: own(data.quests),
    people: own(data.entities).filter(
      (row) => row.kind === "npc" || row.kind === "companion",
    ),
    locations,
    currentLocation:
      locations.find(
        (row) => row.id === data.publicState.current_location_id,
      ) ?? null,
    sessions,
    scenes,
    notes: scenes.filter((scene) => scene.role === "note"),
    evidenceItems: own(data.items).filter((item) =>
      ["clue", "evidence", "улика", "доказательство"].includes(
        item.category.trim().toLocaleLowerCase(),
      ),
    ),
    assets: own(data.assets),
  };
}

/** Subject grouping requires a saved visual association, never a title guess. */
export function gallerySubjectAssets(
  data: CampaignSnapshot,
  kind: "entity" | "location" | "item",
): Asset[] {
  const records = secondaryPageRecords(data);
  const subjects =
    kind === "entity"
      ? records.people.concat(
          data.entities.filter(
            (row) =>
              row.campaign_id === data.campaign.id && row.kind === "player",
          ),
        )
      : kind === "location"
        ? records.locations
        : data.items.filter((row) => row.campaign_id === data.campaign.id);
  const ids = new Set(
    visualDocuments(data).flatMap(({ value }) =>
      value.kind === "reference" &&
      value.approval === "approved" &&
      referenceIsCurrent(data, value) &&
      value.subject.kind === kind &&
      subjects.some((row) => row.id === value.subject.id) &&
      value.imageAssetId !== null
        ? [value.imageAssetId]
        : [],
    ),
  );
  return records.assets.filter((asset) => ids.has(asset.id));
}
