import type { Item } from "../persistence/contracts.ts";

export type Rarity = "common" | "relic" | "magic" | "story";

/** Items carry no rarity field yet (docs/UI_DATA_NEEDS.md). Nothing is guessed
 * from names or text, so the rarity colors and legend stay absent until the
 * campaign's data provides a rarity. */
export function itemRarity(item: Item & { rarity?: unknown }): Rarity | null {
  const value = typeof item.rarity === "string" ? item.rarity.toLowerCase() : null;
  return value === "common" || value === "relic" || value === "magic" || value === "story" ? value : null;
}

/** One image per item type: the same normalized name and category share a picture. */
export function itemTypeKey(item: Pick<Item, "name" | "category">) {
  const name = item.name
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[«»"'`.,!?()[\]]/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
  return `${item.category.toLowerCase().trim()}::${name}`;
}
