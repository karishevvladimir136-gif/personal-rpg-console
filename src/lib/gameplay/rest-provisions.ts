import type { Item } from "../persistence/contracts.ts";
import type { ItemRule, ItemTag } from "./contracts.ts";

/** One ordinary, explicitly authorized Item unit pays one rest supply unit. */
export function isRestProvision(
  item: Pick<Item, "id" | "category">,
  itemRules: readonly ItemRule[],
): boolean {
  const tagged = (tag: ItemTag) => itemRules.some((rule) =>
    rule.itemId === item.id && rule.tag === tag);
  const category = item.category.toLowerCase();
  return category !== "weapon" && category !== "weapons" &&
    !tagged("weapon") &&
    (category === "food" || category === "supply" || tagged("supply")) &&
    !tagged("meal-serving") && !tagged("coffee-serving");
}
