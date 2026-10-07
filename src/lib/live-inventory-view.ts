import type { CampaignSnapshot, Item, Storage } from "./persistence/contracts.ts";
import { selectSubjectVisual } from "./visual-frame/subject-visual.ts";

export const EQUIPPED_FILTER = "@equipped";

const CATEGORY_LABELS: Record<string, string> = {
  weapon: "Weapons",
  weapons: "Weapons",
  ammunition: "Ammunition",
  armor: "Armor",
  gear: "Gear",
  possession: "Possessions",
  consumable: "Consumables",
  consumables: "Consumables",
  quest: "Quest Items",
  key: "Key Items",
  currency: "Money",
  money: "Money",
};

/** Presentation label only. The original category remains the filter authority. */
export function inventoryCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category.trim().toLowerCase()] ?? category;
}

const STORAGE_TABS: { kind: Storage["kind"]; label: string }[] = [
  { kind: "player", label: "Player" },
  { kind: "companion", label: "Companions" },
  { kind: "camp", label: "Camp / Shared Stash" },
  { kind: "transport", label: "Transport & Mounts" },
  { kind: "merchant", label: "Other storage" },
];

/** Public campaign records only; no Phase-0 fixtures or private state. */
export function buildLiveInventoryView(
  snapshot: CampaignSnapshot,
  requestedStorageId: string,
  query: string,
  category: string,
) {
  const campaignId = snapshot.campaign.id;
  const storages = snapshot.storages.filter((row) => row.campaign_id === campaignId);
  const tabs = STORAGE_TABS.filter((tab) =>
    storages.some((storage) => storage.kind === tab.kind),
  );
  const storage =
    storages.find((row) => row.id === requestedStorageId) ??
    storages.find((row) => row.kind === "player") ??
    storages[0] ??
    null;
  const peerStorages = storage
    ? storages.filter((row) => row.kind === storage.kind)
    : [];
  const storedItems = storage
    ? snapshot.items.filter(
        (row) =>
          row.campaign_id === campaignId && row.storage_id === storage.id,
      )
    : [];
  const categories = [...new Set(storedItems.map((row) => row.category))];
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const items = storedItems.filter((row) => {
    if (category === EQUIPPED_FILTER && !row.equipped_entity_id) return false;
    if (category && category !== EQUIPPED_FILTER && row.category !== category)
      return false;
    return (
      !normalizedQuery ||
      `${row.name} ${row.description}`
        .toLocaleLowerCase()
        .includes(normalizedQuery)
    );
  });
  const entity = storage?.entity_id
    ? snapshot.entities.find(
        (row) =>
          row.campaign_id === campaignId && row.id === storage.entity_id,
      ) ?? null
    : null;

  return { storages, tabs, storage, peerStorages, storedItems, categories, items, entity };
}

/** Only a current, accepted real image replaces the Phase-0 category icon. */
export function acceptedItemArtwork(
  snapshot: CampaignSnapshot,
  item: Item,
): string | null {
  if (item.campaign_id !== snapshot.campaign.id) return null;
  const visual = selectSubjectVisual(
    snapshot,
    { kind: "item", id: item.id },
    { acceptedOnly: true },
  );
  return visual?.image?.kind === "real" ? visual.image.url : null;
}
