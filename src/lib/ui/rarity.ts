import type { Item } from "../persistence/contracts.ts";

export type Rarity = "common" | "relic" | "magic" | "story";
export type ItemFilter = "all" | "use" | "gear" | "relic" | "story";

// Items carry no rarity field yet (docs/UI_DATA_NEEDS.md). The look follows
// only what the record states: its category and explicit words in its text.
const STORY = /(сюжет|квест|задани|story|quest|key item|ключев)/iu;
const MAGIC = /(магич|зачарова|чары|руна|magic|enchant|arcane|rune|эфирит)/iu;
const RELIC = /(реликт|артефакт|древн|relic|artifact|ancient|heirloom|наследств)/iu;

export function itemRarity(item: Pick<Item, "category" | "mechanics" | "description" | "name">): Rarity {
  const category = item.category.toLowerCase();
  if (["story", "quest", "key"].includes(category)) return "story";
  if (["magic", "magical", "enchanted"].includes(category)) return "magic";
  if (["relic", "artifact"].includes(category)) return "relic";
  const text = `${item.mechanics}\n${item.description}`;
  if (STORY.test(text)) return "story";
  if (RELIC.test(text)) return "relic";
  if (MAGIC.test(item.mechanics)) return "magic";
  return "common";
}

export function matchesItemFilter(item: Pick<Item, "category" | "mechanics" | "description" | "name">, filter: ItemFilter) {
  if (filter === "all") return true;
  const category = item.category.toLowerCase();
  if (filter === "use") return ["consumable", "food", "supply", "potion", "ammo"].includes(category);
  if (filter === "gear") return ["weapon", "armor", "gear", "tool", "clothing", "shield"].includes(category);
  const rarity = itemRarity(item);
  return filter === "relic" ? rarity === "relic" || rarity === "magic" : rarity === "story";
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
