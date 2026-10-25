// Fix S3-accept А1, А2, А4 (docs/stages/FIX_S3_ACCEPT.md, the owner's pass of 2026-10-22): the rules of the inventory
// grid and the item card, decided from the record alone — the type filter's groups, which buttons a thing's card shows
// («Надеть» only for a thing worn on a slot, «Использовать» only for a consumable or a thing whose record says how it is
// used), and which history lines are worth showing. Pure: no server imports, no item names.
import type { EquipmentSlot, Item, ItemDetail } from "../persistence/contracts.ts";
import { itemMechanics } from "./model.ts";
import { loanMark, slotsFor, type Snapshot } from "./owner-moves.ts";

type Lang = "ru" | "en";
const lang = (value: unknown): Lang => (value === "ru" ? "ru" : "en");

// --- the type filter (А1): всё / оружие / доспех / украшения / расходуемое / снаряжение / инструмент / разное ----------
export const KIND_GROUPS = [
  { id: "weapon", kinds: ["weapon"], ru: "Оружие", en: "Weapons" },
  // Clothing is worn on the body's slots (a mage's robe is the body's armour), so it sits with the armour.
  { id: "armor", kinds: ["armor", "shield", "clothing"], ru: "Доспех", en: "Armour" },
  { id: "jewelry", kinds: ["jewelry", "accessory"], ru: "Украшения", en: "Jewellery" },
  // Arrows and bolts are used up one per shot (the roll's receipt counts them), so they are consumables here.
  { id: "consumable", kinds: ["consumable", "ammunition"], ru: "Расходуемое", en: "Consumables" },
  { id: "gear", kinds: ["gear"], ru: "Снаряжение", en: "Gear" },
  { id: "tool", kinds: ["tool"], ru: "Инструмент", en: "Tools" },
  { id: "misc", kinds: ["misc"], ru: "Разное", en: "Misc" },
] as const;
export type KindGroupId = (typeof KIND_GROUPS)[number]["id"];

/** An older record's own category word (weapons, potion, quest item…) → the group its words say; anything else is «разное». */
const CATEGORY_WORDS: [RegExp, KindGroupId][] = [
  [/weapon|blade|firearm|gun|оруж/i, "weapon"],
  [/armou?r|shield|cloth|wear|доспех|одежд|щит/i, "armor"],
  [/jewel|accessor|ring|amulet|украш|кольц|амулет/i, "jewelry"],
  [/consum|potion|food|drink|ration|medic|ammo|arrow|bolt|расход|зель|еда/i, "consumable"],
  [/tool|kit|instrument|инструм/i, "tool"],
  [/gear|pack|equipment|supply|travel|снаряж/i, "gear"],
];
export function kindGroup(category: string): KindGroupId {
  const kind = category.trim().toLowerCase();
  const direct = KIND_GROUPS.find((group) => (group.kinds as readonly string[]).includes(kind));
  if (direct) return direct.id;
  return CATEGORY_WORDS.find(([pattern]) => pattern.test(kind))?.[1] ?? "misc";
}
export function kindGroupLabel(id: KindGroupId | "all", language: unknown): string {
  if (id === "all") return lang(language) === "ru" ? "Всё" : "All";
  const group = KIND_GROUPS.find((row) => row.id === id)!;
  return lang(language) === "ru" ? group.ru : group.en;
}
/** The filter's chips in their fixed order with how many things each holds (an empty one stays, dimmed). */
export function kindFilter(items: readonly Pick<Item, "category">[], language: unknown) {
  return [{ id: "all" as const, label: kindGroupLabel("all", language), count: items.length },
    ...KIND_GROUPS.map((group) => ({ id: group.id, label: kindGroupLabel(group.id, language), count: items.filter((item) => kindGroup(item.category) === group.id).length }))];
}
export const inGroup = (item: Pick<Item, "category">, filter: KindGroupId | "all") => filter === "all" || kindGroup(item.category) === filter;
/** The mark on a cell beside the picture: lent or borrowed (from whom) before worn (on which slot); null for neither. */
export function cellState(view: Pick<Snapshot, "campaign" | "entities" | "storages">, item: Item, viewerId: string | null): { kind: "worn" | "loan"; text: string } | null {
  const ru = lang(view.campaign.language) === "ru";
  const loan = viewerId ? loanMark(view, item, viewerId) : null;
  if (loan) return { kind: "loan", text: loan.kind === "out" ? (ru ? `${loan.status === "lent" ? "отдано" : "в залоге"}: ${loan.name}` : `${loan.status}: ${loan.name}`)
    : (ru ? `взято у: ${loan.name}` : `borrowed from ${loan.name}`) };
  const wearer = item.equipped_entity_id ? view.entities.find((row) => row.id === item.equipped_entity_id) ?? null : null;
  if (!wearer) return null;
  const slot = slotsFor(wearer, view.campaign.language).find((row) => row.id === item.equipped_slot)?.label ?? item.equipped_slot;
  return { kind: "worn", text: ru ? `надето: ${slot}` : `worn: ${slot}` };
}

// --- the card's buttons (А4) ---------------------------------------------------------------------------------------
/** The kinds a person wears or holds on the doll. Gear, tools, ammunition, consumables and odds and ends have no
 * «Надеть» (a torch can still be dragged into the off hand, a tool into the main hand). */
const WORN_KINDS = ["weapon", "shield", "armor", "clothing", "jewelry", "accessory"];
/** «Надеть» only for a thing of a worn kind that one of the wearer's slots takes. */
export function canWear(item: Pick<Item, "category">, slots: readonly EquipmentSlot[]): boolean {
  return WORN_KINDS.includes(item.category) && slots.some((slot) => slot.accepts.includes(item.category));
}
/** How a record says a thing is used: drunk, eaten, read, blown, lit, activated, «действием», by its charges, its light
 * or its signal (a potion, a scroll, food, a signal horn, a taper). Words of the record's text, never of a thing's name;
 * «перезарядка» (a crossbow's loading) is not a charge. */
const USE_WORDS = new RegExp([
  "выпи(ть|вают|вает|в)", "съе(сть|дают|дает|дается)", "прочит", "прочест", "зачит", "протруб", "трубит", "подуть", "дунуть",
  "зажечь", "зажига", "зажж", "поджечь", "(^|[^а-яё])горит([^а-яё]|$)", "сгора", "яркий свет", "тусклый свет", "свет в радиусе", "сигнал",
  "активир", "бонусн[а-яё]* действи", "действием", "реакцией", "(^|[^а-яё])заряд",
  "\\bdrink", "\\beat(s|en)?\\b", "\\bread (it|aloud)", "\\bblow", "\\blight(s|ed)? (it|the)", "\\bburns?\\b", "bright light", "dim light", "\\bsignal",
  "\\bactivat", "as an action", "bonus action", "as a reaction", "\\bcharges?\\b",
].join("|"), "iu");
/** «Использовать» only for a consumable, a thing with charges, or one whose record says how it is used. */
export function canUse(item: Pick<Item, "category" | "description" | "mechanics" | "detail">): boolean {
  if (kindGroup(item.category) === "consumable" && item.category !== "ammunition") return true;
  if (itemMechanics(item).charges) return true;
  return USE_WORDS.test(`${item.mechanics ?? ""}\n${item.description ?? ""}`);
}

// --- the card's history (А2) ---------------------------------------------------------------------------------------
type HistoryEntry = NonNullable<ItemDetail["history"]>[number];
const plain = (text: string) => text.toLocaleLowerCase().replace(/[\s«»"'“”.,;:!?()—–-]+/gu, " ").trim();
/** The thing's history, newest first, for the folded «История»: an «появилось» line that only repeats the description
 * (the DM's create writes the description as its note, cut at 200 characters) is not shown at all. */
export function shownHistory(item: Pick<Item, "description" | "detail">): HistoryEntry[] {
  const description = plain(item.description ?? "");
  const repeats = (entry: HistoryEntry) => {
    if (entry.event !== "created" || !description) return false;
    const note = plain(entry.note ?? "");
    return !!note && (note === description || (note.length >= 150 && description.startsWith(note)));
  };
  return [...(item.detail?.history ?? [])].filter((entry) => entry && typeof entry.event === "string" && !repeats(entry)).reverse();
}
