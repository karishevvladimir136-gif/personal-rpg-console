import type { Item } from "./contracts.ts";

/** Display-only wording from public Item fields. It never becomes Item state. */
export function itemDisplayDescription(item: Pick<Item, "name" | "category" | "description" | "mechanics">,
  language: "en" | "ru" = "en"): string {
  if (item.description.trim()) return item.description;
  const name = item.name.trim() || (language === "ru" ? "предмет" : "item");
  const mundane = !item.mechanics.trim();
  if (language === "ru") {
    if (mundane && item.category === "weapon")
      return `${name}. Простое оружие для практических задач, когда разговор уже не помогает.`;
    if (mundane && item.category === "food") return `${name}. Обычная еда для дороги или привала.`;
    if (mundane && item.category === "supply") return `${name}. Полезный дорожный припас.`;
    return `${name}. Известные свойства указаны ниже.`;
  }
  if (mundane && item.category === "weapon")
    return `${name}. A practical weapon for when conversation has run its course.`;
  if (mundane && item.category === "food") return `${name}. Ordinary food for the road or a quiet meal.`;
  if (mundane && item.category === "supply") return `${name}. A useful everyday supply.`;
  return `${name}. Its known properties are listed below.`;
}
