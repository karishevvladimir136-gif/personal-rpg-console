// Fix run after session 2, stage D (docs/runs/fix-s2-inventory-design.md): the one records-and-inventory model,
// shared by the DM's tools (dm-loop/execute.ts), the owner's moves and the screens. Pure: no server imports.
//   - An item is a row of rpg_items; its kind is `category`; bonuses, hands, charges and attunement live in its
//     `detail` (never as an entity counter named after the thing).
//   - A counter is an entity resource with `_max`, only for pools (spell slots, hit dice, class charges); its label
//     in the campaign language lives in the entity's public profile (`counterLabels`), so no screen shows a raw key.
//   - Money is a wallet: on a character, its `currency_<word>` entries (stored with the record's resources since
//     polish group 8, never shown or edited as counters); on a place, a base or a body's pile, `detail.wallet` of the
//     storage. A coin system is recognised from the coin words already recorded (5e: пм, зм, эм, см, мм), which gives
//     the order of value and the full names.
//   - The doll is one eleven-slot set for every humanoid record.
import type { Entity, EquipmentSlot, Item, ItemDetail, Storage } from "../persistence/contracts.ts";

type Lang = "ru" | "en";
const lang = (value: unknown): Lang => (value === "ru" ? "ru" : "en");

// --- kinds and slots -----------------------------------------------------------------------------------------
export const ITEM_KINDS = ["weapon", "shield", "armor", "clothing", "jewelry", "accessory", "ammunition", "consumable", "tool", "gear", "misc"] as const;
export type ItemKind = (typeof ITEM_KINDS)[number];
const KIND_WORDS: Record<ItemKind, [string, string]> = {
  weapon: ["оружие", "weapon"], shield: ["щит", "shield"], armor: ["доспех", "armor"], clothing: ["одежда", "clothing"],
  jewelry: ["украшение", "jewelry"], accessory: ["аксессуар", "accessory"], ammunition: ["боеприпасы", "ammunition"],
  consumable: ["расходуемое", "consumable"], tool: ["инструмент", "tool"], gear: ["снаряжение", "gear"], misc: ["разное", "misc"],
};
export function kindLabel(kind: string, language: unknown): string {
  const words = KIND_WORDS[kind as ItemKind];
  return words ? words[lang(language) === "ru" ? 0 : 1] : kind;
}

export const SLOT_IDS = ["head", "amulet", "cloak", "body", "gloves", "belt", "boots", "ring_left", "ring_right", "hand", "offhand"] as const;
export type SlotId = (typeof SLOT_IDS)[number];
/** The doll (items 14, 27, 33): Baldur's Gate-like, no «Ноги»; each slot names the kinds it takes. */
export function universalSlots(language: unknown): EquipmentSlot[] {
  const ru = lang(language) === "ru";
  return [
    { id: "head", label: ru ? "Голова" : "Head", accepts: ["armor", "clothing"] },
    { id: "amulet", label: ru ? "Амулет" : "Amulet", accepts: ["jewelry", "accessory"] },
    { id: "cloak", label: ru ? "Плащ" : "Cloak", accepts: ["clothing", "armor"] },
    { id: "body", label: ru ? "Броня / одежда" : "Armor / clothing", accepts: ["armor", "clothing"] },
    { id: "gloves", label: ru ? "Перчатки / наручи" : "Gloves / bracers", accepts: ["armor", "clothing", "accessory"] },
    { id: "belt", label: ru ? "Пояс" : "Belt", accepts: ["gear", "accessory", "tool", "clothing"] },
    { id: "boots", label: ru ? "Сапоги" : "Boots", accepts: ["armor", "clothing"] },
    { id: "ring_left", label: ru ? "Кольцо (левая)" : "Ring (left)", accepts: ["jewelry"] },
    { id: "ring_right", label: ru ? "Кольцо (правая)" : "Ring (right)", accepts: ["jewelry"] },
    { id: "hand", label: ru ? "Основная рука" : "Main hand", accepts: ["weapon", "tool"] },
    { id: "offhand", label: ru ? "Вторая рука" : "Off hand", accepts: ["weapon", "shield", "tool", "gear"] },
  ];
}
/** Older slot ids → the new set; null: the slot is gone and its item comes off (kept in the inventory). */
export const SLOT_REMAP: Readonly<Record<string, SlotId | null>> = Object.freeze({
  neck: "amulet", talisman: "amulet", ring1: "ring_left", ring2: "ring_right", legs: null,
});
/** A record whose slots are not the eleven (older records, or none yet) gets them; an object or a faction never. */
export function needsUniversalSlots(entity: Pick<Entity, "kind" | "equipment_slots">): boolean {
  if (!["player", "companion", "npc"].includes(entity.kind)) return false;
  const ids = entity.equipment_slots.map((slot) => slot.id);
  return ids.length !== SLOT_IDS.length || SLOT_IDS.some((id) => !ids.includes(id));
}

/** The kind a thing most likely is, by its head noun only (the owner confirms on the review; an existing
 * `possession` converts by the same rule, else gear). */
export function guessKind(name: string): ItemKind {
  const n = name.toLocaleLowerCase();
  const has = (...stems: string[]) => stems.some((stem) => n.includes(stem));
  if (has("зель", "эликсир", "potion", "elixir", "свиток", "scroll")) return "consumable";
  if (has("стрел", "болт", "пул", "дротик", "arrow", "bolt", "bullet")) return "ammunition";
  if (has("кольц", "перстен", "амулет", "медальон", "ожерел", "ring", "amulet", "necklace", "pendant")) return "jewelry";
  if (/(^|[^а-яё])щит|shield/.test(n)) return "shield";
  if (has("кольчу", "доспех", "латы", "кирас", "бригантин", "armor", "armour", "mail", "breastplate")) return "armor";
  if (has("плащ", "мантия", "роба", "шляп", "капюшон", "сапог", "ботин", "перчат", "рубах", "куртк", "cloak", "robe", "hat", "boots", "gloves", "shirt", "coat"))
    return "clothing";
  if (has("меч", "кинжал", "нож", "топор", "секир", "булав", "молот", "копь", "посох", "лук", "арбалет", "сабл", "скимитар", "рапир", "пистол", "гарпун",
    "sword", "dagger", "knife", "axe", "mace", "hammer", "spear", "staff", "bow", "crossbow", "scimitar", "rapier", "pistol")) return "weapon";
  if (has("набор", "инструмент", "отмычк", "kit", "tools", "picks")) return "tool";
  return "gear";
}

// --- item mechanics (detail) ---------------------------------------------------------------------------------
export type ItemBonus = { to: string; value: number };
export type ItemMechanics = { bonuses: ItemBonus[]; hands: 1 | 2; charges: { value: number; max: number } | null; attunement: boolean };
type MechanicsDetail = ItemDetail & { bonuses?: ItemBonus[]; hands?: number; charges?: { value: number; max: number }; attunement?: boolean };
export function itemMechanics(item: Pick<Item, "detail">): ItemMechanics {
  const detail = (item.detail ?? {}) as MechanicsDetail;
  const bonuses = Array.isArray(detail.bonuses) ? detail.bonuses.filter((row) => row && typeof row.to === "string" && Number.isInteger(row.value)) : [];
  const charges = detail.charges && Number.isInteger(detail.charges.value) && Number.isInteger(detail.charges.max) ? detail.charges : null;
  return { bonuses, hands: detail.hands === 2 ? 2 : 1, charges, attunement: detail.attunement === true };
}
/** 5e: an attuned creature holds at most three attuned items. */
export const ATTUNEMENT_LIMIT = 3;

/** The slot a thing's name points at among the slots that take its kind («кольцо» → a ring slot, «плащ» → the cloak). */
const SLOT_WORDS: [string[], string[]][] = [
  [["ring_left", "ring_right"], ["кольц", "перстен", "ring"]],
  [["amulet"], ["амулет", "медальон", "ожерел", "подвеск", "талисман", "клык", "amulet", "necklace", "pendant", "talisman"]],
  [["cloak"], ["плащ", "накидк", "cloak", "cape", "mantle"]],
  [["gloves"], ["перчат", "наруч", "рукавиц", "gloves", "gauntlet", "bracer"]],
  [["boots"], ["сапог", "ботин", "башмак", "boots", "shoes"]],
  [["head"], ["шлем", "шляп", "капюшон", "корон", "диадем", "очки", "helm", "hat", "hood", "crown", "goggles"]],
  [["belt"], ["пояс", "ремен", "belt"]],
  [["body"], ["кольчу", "доспех", "латы", "кирас", "бригантин", "панцир", "рубах", "куртк", "мантия", "роба", "камзол", "armor", "armour", "mail", "breastplate", "robe", "shirt", "coat", "jerkin"]],
];
function slotsByName(name: string, category: string, fitting: EquipmentSlot[]): EquipmentSlot[] {
  const n = name.toLocaleLowerCase();
  for (const [ids, words] of SLOT_WORDS)
    if (words.some((word) => n.includes(word))) { const named = fitting.filter((slot) => ids.includes(slot.id)); if (named.length) return named; }
  // Armour or clothing the name says nothing about is worn on the body first.
  if (category === "armor" || category === "clothing") return [...fitting].sort((a, b) => Number(b.id === "body") - Number(a.id === "body"));
  return fitting;
}

export type EquipPlan = { ok: true; slot: EquipmentSlot; unequip: Item[] } | { ok: false; reason: string; hint?: string };
/** Where an item goes on its owner's doll (the DM's `item equip` and the owner's «Надеть» use this one rule): a slot
 * that takes its kind — the one asked for, else the first free one its name points at (rings: left, then right); a two-handed thing
 * fills the main hand and keeps the off hand empty; what was in the slot comes off and stays in the inventory. */
export function equipPlan(owner: Pick<Entity, "id" | "name" | "equipment_slots">, items: readonly Item[], item: Item, wanted: string | null, language: unknown): EquipPlan {
  const ru = lang(language) === "ru";
  const fitting = owner.equipment_slots.filter((slot) => slot.accepts.includes(item.category));
  if (!fitting.length) return { ok: false, reason: ru ? `У ${owner.name} нет места для вещи вида «${kindLabel(item.category, language)}».` : `${owner.name} has no slot that takes a ${item.category}.`,
    hint: `Slots: ${owner.equipment_slots.map((slot) => `${slot.id} (${slot.accepts.join("/")})`).join(", ") || "none"}.` };
  const worn = items.filter((row) => row.equipped_entity_id === owner.id && row.id !== item.id && row.quantity > 0);
  const at = (slotId: string) => worn.find((row) => row.equipped_slot === slotId) ?? null;
  const twoHanded = itemMechanics(item).hands === 2;
  if (twoHanded && !fitting.some((slot) => slot.id === "hand"))
    return { ok: false, reason: ru ? `${item.name} — двуручная вещь, она берётся в основную руку.` : `${item.name} is two-handed; it goes in the main hand.` };
  const named = slotsByName(item.name, item.category, fitting);
  const slot = twoHanded ? fitting.find((s) => s.id === "hand")!
    : wanted ? fitting.find((s) => s.id === wanted) : named.find((s) => !at(s.id)) ?? named[0];
  if (!slot) return { ok: false, reason: ru ? `Нет слота «${wanted}» для этой вещи.` : `No slot "${wanted}" for a ${item.category}.`, hint: `Fitting slots: ${fitting.map((s) => s.id).join(", ")}.` };
  const mainHand = at("hand");
  if (slot.id === "offhand" && mainHand && itemMechanics(mainHand).hands === 2)
    return { ok: false, reason: ru ? `Вторая рука занята: ${mainHand.name} держат двумя руками.` : `The off hand is taken: ${mainHand.name} is held in both hands.` };
  if (itemMechanics(item).attunement && worn.filter((row) => itemMechanics(row).attunement).length >= ATTUNEMENT_LIMIT)
    return { ok: false, reason: ru ? `Настроиться можно не больше чем на ${ATTUNEMENT_LIMIT} вещи; сначала снимите одну.` : `At most ${ATTUNEMENT_LIMIT} attuned items; take one off first.` };
  const unequip = [at(slot.id), twoHanded ? at("offhand") : null].filter((row): row is Item => !!row);
  return { ok: true, slot, unequip };
}

/** The bonuses of an actor's equipped items that match a roll's reason or skill (item 14: they reach the roll with
 * their source; a sheet line no longer folds them in). «все проверки» / «all checks» match every check. */
export function equippedBonuses(items: readonly Item[], actorId: string, text: string): { source: string; value: number }[] {
  const wanted = text.toLocaleLowerCase();
  const out: { source: string; value: number }[] = [];
  for (const item of items) {
    if (item.equipped_entity_id !== actorId || item.quantity <= 0) continue;
    for (const bonus of itemMechanics(item).bonuses) {
      const to = bonus.to.toLocaleLowerCase().trim();
      const everything = ["все проверки", "all checks", "все броски", "all rolls"].includes(to);
      const stems = to.split(/[\s,]+/).filter((word) => word.length >= 3).map((word) => word.slice(0, Math.max(3, word.length - 2)));
      if (everything || (stems.length && stems.every((stem) => wanted.includes(stem)))) out.push({ source: `${item.name} ${bonus.value >= 0 ? "+" : ""}${bonus.value}`, value: bonus.value });
    }
  }
  return out;
}

// --- counters and their labels -------------------------------------------------------------------------------
const POOL_LABELS: Record<string, [string, string]> = {
  hit_dice: ["Кости хитов", "Hit dice"], ki: ["Ки", "Ki"], sorcery_points: ["Очки чародейства", "Sorcery points"],
  arcane_recovery: ["Магическое восстановление", "Arcane recovery"], heroic_inspiration: ["Героическое вдохновение", "Heroic inspiration"],
  channel_divinity: ["Божественный канал", "Channel divinity"], bardic_inspiration: ["Вдохновение барда", "Bardic inspiration"],
  rage: ["Ярость", "Rage"], superiority_dice: ["Кости превосходства", "Superiority dice"], lay_on_hands: ["Наложение рук", "Lay on hands"],
  wild_shape: ["Дикий облик", "Wild shape"], action_surge: ["Всплеск действий", "Action surge"], second_wind: ["Второе дыхание", "Second wind"],
  stress: ["Стресс", "Stress"], sanity: ["Рассудок", "Sanity"], exhaustion: ["Истощение", "Exhaustion"],
};
type Profiled = Pick<Entity, "public_profile">;
function storedLabels(entity: Profiled): Record<string, string> {
  const labels = (entity.public_profile as { counterLabels?: unknown } | undefined)?.counterLabels;
  return labels && typeof labels === "object" && !Array.isArray(labels) ? labels as Record<string, string> : {};
}
/** A counter's label in the campaign language: the label the DM gave (or the migration filled), a known pool, the
 * spell-slot level; otherwise the key made readable (and the screens mark it for renaming). Never a raw key. */
export function counterLabel(entity: Profiled, key: string, language: unknown): string {
  const ru = lang(language) === "ru";
  const stored = storedLabels(entity)[key];
  if (typeof stored === "string" && stored.trim()) return stored.trim();
  const slot = /^spell_slots_(\d)$/.exec(key);
  if (slot) return ru ? `Ячейки ${slot[1]} круга` : `Level ${slot[1]} slots`;
  const pool = POOL_LABELS[key] ?? POOL_LABELS[key.replace(/^resource_/, "")];
  if (pool) return pool[ru ? 0 : 1];
  const text = key.replace(/^resource_/, "").replaceAll(/[_-]+/g, " ").trim();
  return text ? text.charAt(0).toLocaleUpperCase() + text.slice(1) : key;
}
/** Whether a counter has a real label (stored, a known pool or a slot level) — the rest are marked for renaming. */
export function counterLabelled(entity: Profiled, key: string): boolean {
  // A record's «resource_stress» is the known pool «stress» (the noir sample's «?» on Stress).
  return !!storedLabels(entity)[key] || /^spell_slots_\d$/.test(key) || key in POOL_LABELS || key.replace(/^resource_/, "") in POOL_LABELS;
}
/** A counter that is really a thing (potions) — the `resource` tool refuses it and the migration turns it into items. */
export function potionCounter(key: string, label = ""): boolean {
  const text = `${key} ${label}`.toLocaleLowerCase();
  return /(^|[_\s])(healing_)?potions?($|[_\s])|elixir|зель|эликсир/.test(text);
}

// --- money ---------------------------------------------------------------------------------------------------
export type Coin = { code: string; name: string; value: number; words: string[] };
/** The 5e coins in order of value (the smallest is 1): the code shown, the full name on hover, the words (stems) the
 * DM may use for it. A campaign whose recorded money uses any of these words keeps this order and these names. */
export function coins5e(language: unknown): Coin[] {
  const ru = lang(language) === "ru";
  return [
    { code: ru ? "пм" : "pp", name: ru ? "платиновые монеты" : "platinum pieces", value: 1000, words: ["пм", "платин", "pp", "platinum"] },
    { code: ru ? "зм" : "gp", name: ru ? "золотые монеты" : "gold pieces", value: 100, words: ["зм", "золот", "gp", "gold"] },
    { code: ru ? "эм" : "ep", name: ru ? "электрумовые монеты" : "electrum pieces", value: 50, words: ["эм", "электр", "ep", "electrum"] },
    { code: ru ? "см" : "sp", name: ru ? "серебряные монеты" : "silver pieces", value: 10, words: ["см", "серебр", "sp", "silver"] },
    { code: ru ? "мм" : "cp", name: ru ? "медные монеты" : "copper pieces", value: 1, words: ["мм", "медн", "медяк", "cp", "copper"] },
  ];
}
const coinWord = (word: string) => word.toLocaleLowerCase().replace(/[«»"'“”.]/g, "").replace(/\s+/g, " ").trim();
/** The 5e coin a word names («золотые», «зм», «золотых монет», «gold pieces»), else null. */
export function coinOf(word: string, language: unknown): Coin | null {
  const w = coinWord(word);
  if (!w) return null;
  for (const coin of coins5e(language)) {
    if (coin.words.some((stem) => (stem.length <= 2 ? w === stem || w.startsWith(`${stem} `) : w.startsWith(stem) || w.split(" ").some((part) => part.startsWith(stem)))))
      return coin;
  }
  return null;
}

export type Wallet = Record<string, number>;
/** A character's wallet: its currency entries (label → amount; zero kept). */
export function walletOfEntity(entity: Pick<Entity, "resources">): Wallet {
  const wallet: Wallet = {};
  for (const [key, value] of Object.entries(entity.resources ?? {}))
    if (key.startsWith("currency_") && !key.endsWith("_max") && !key.endsWith("_min") && Number.isFinite(value)) wallet[key.slice("currency_".length).replaceAll("_", " ")] = Number(value);
  return wallet;
}
/** A storage's wallet (a place's chest, a base, a body's pile): `detail.wallet`. */
export function walletOfStorage(storage: Pick<Storage, "detail">): Wallet {
  const wallet = (storage.detail as { wallet?: unknown } | undefined)?.wallet;
  if (!wallet || typeof wallet !== "object" || Array.isArray(wallet)) return {};
  return Object.fromEntries(Object.entries(wallet as Record<string, unknown>).filter(([, value]) => Number.isInteger(value) && (value as number) >= 0)) as Wallet;
}
export type WalletPart = { label: string; amount: number; title: string; value: number | null };
/** The wallet in the system's order of value (5e coins first, by value; other currencies after, as recorded), zero
 * coins hidden; the code shown, the full name on hover (items 33, 52). */
export function walletParts(wallet: Wallet, language: unknown): WalletPart[] {
  const parts = Object.entries(wallet).filter(([, amount]) => amount > 0).map(([label, amount], index) => {
    const coin = coinOf(label, language);
    return { label: coin ? coin.code : label, amount, title: coin ? coin.name : label, value: coin ? coin.value : null, index };
  });
  // Two records of one coin (an older «золотые» and «зм») show as one.
  const merged = new Map<string, (typeof parts)[number]>();
  for (const part of parts) {
    const seen = merged.get(part.label);
    if (seen) seen.amount += part.amount; else merged.set(part.label, { ...part });
  }
  return [...merged.values()].sort((a, b) => (b.value ?? -1) - (a.value ?? -1) || a.index - b.index)
    .map(({ label, amount, title, value }) => ({ label, amount, title, value }));
}
/** «Кошелёк: 10 зм · 11 см · 26 мм» (or «Кошелёк: пусто»). */
export function walletLine(wallet: Wallet, language: unknown): string {
  const ru = lang(language) === "ru";
  const parts = walletParts(wallet, language);
  return `${ru ? "Кошелёк" : "Purse"}: ${parts.length ? parts.map((part) => `${part.amount} ${part.label}`).join(" · ") : ru ? "пусто" : "empty"}`;
}

// --- stacks --------------------------------------------------------------------------------------------------
const STOP_WORDS = new Set(["для", "из", "с", "со", "и", "в", "на", "of", "for", "the", "a", "an", "with"]);
const stem = (word: string) => (word.length <= 4 ? word : word.slice(0, Math.max(4, word.length - 3)));
const ADJECTIVE = /(ые|ие|ий|ый|ой|ая|яя|ое|ее|ого|его|ых|их|ую|юю|ей|ым|им|ыми|ими)$/;
function nameWords(name: string): string[] {
  return name.toLocaleLowerCase().replace(/ё/g, "е").replace(/[«»"'“”()[\].,:;!?—–-]+/g, " ").split(/\s+/).filter(Boolean);
}
/** A name's words for stacking: lower case, no quotes or punctuation, no stop words, stems. */
export function nameStems(name: string): string[] {
  return nameWords(name).filter((word) => !STOP_WORDS.has(word)).map(stem);
}
/** The head noun's stem: Russian — the first word that is not an adjective («лёгкие болты для арбалета» → «болт»);
 * Latin — the last word before «for / of / with» («light bolts for a crossbow» → «bolts»). */
function headStem(name: string): string {
  const words = nameWords(name);
  if (/[a-z]/.test(words.join(""))) {
    const cut = words.findIndex((word) => ["for", "of", "with"].includes(word));
    const before = (cut > 0 ? words.slice(0, cut) : words).filter((word) => !STOP_WORDS.has(word));
    return stem(before[before.length - 1] ?? "");
  }
  const content = words.filter((word) => !STOP_WORDS.has(word));
  return stem(content.find((word) => !ADJECTIVE.test(word)) ?? content[content.length - 1] ?? "");
}
/** The stems after «для / for» — what a thing is for, not what it is («болты для лёгкого арбалета» → лёгкого арбалета). */
function purposeStems(name: string): Set<string> {
  const words = nameWords(name);
  const cut = words.findIndex((word) => word === "для" || word === "for");
  return new Set(cut < 0 ? [] : words.slice(cut + 1).filter((word) => !STOP_WORDS.has(word)).map(stem));
}
/** Whether two stacks are one thing (conservative: any doubt keeps two). Same owner, storage, kind and plain rarity,
 * neither equipped, lent or pledged, compatible properties, and the names' stems equal — or one name's stems inside
 * the other's with the same head noun, the longer adding only what the thing is for («лёгкие болты» ⊂ «болты для
 * лёгкого арбалета»; «зелье лечения» and «зелье великого лечения» stay two). */
export function sameStack(a: Item, b: Item): boolean {
  if (a.id === b.id || a.quantity <= 0 || b.quantity <= 0) return false;
  if (a.owner_entity_id !== b.owner_entity_id || a.storage_id !== b.storage_id || a.category !== b.category) return false;
  if ((a.rarity ?? "common") !== "common" || (b.rarity ?? "common") !== "common") return false;
  if (a.equipped_entity_id || b.equipped_entity_id || a.detail?.status || b.detail?.status) return false;
  if (a.mechanics.trim() && b.mechanics.trim() && a.mechanics.trim() !== b.mechanics.trim()) return false;
  const setX = new Set(nameStems(a.name)), setY = new Set(nameStems(b.name));
  if (!setX.size || !setY.size) return false;
  if (setX.size === setY.size && [...setX].every((word) => setY.has(word))) return true;
  const [small, large] = setX.size < setY.size ? [setX, setY] : [setY, setX];
  const longer = setX.size < setY.size ? b.name : a.name;
  const purpose = purposeStems(longer);
  return [...small].every((word) => large.has(word)) && headStem(a.name) === headStem(b.name)
    && [...large].every((word) => small.has(word) || purpose.has(word));
}

// --- spells (sheet v2) ---------------------------------------------------------------------------------------
export type SpellRecord = {
  name: string;
  /** 0 = a cantrip. */
  level: number;
  castingTime?: string; range?: string; components?: string; duration?: string; saveOrAttack?: string; damage?: string;
  higherLevels?: string; text?: string;
  ritual?: boolean; concentration?: boolean;
  /** In the spellbook / known. */
  known?: boolean;
  prepared?: boolean;
};
export type SpellView = { level: number; label: string; spells: SpellRecord[]; slots: { value: number; max: number } | null; prepared: number };
/** The spells tab's groups: cantrips, then each level with its slot pips and «подготовлено N из M». */
export function spellBook(spells: readonly SpellRecord[], resources: Record<string, number>, language: unknown): SpellView[] {
  const ru = lang(language) === "ru";
  const levels = new Set<number>(spells.map((spell) => spell.level));
  for (const key of Object.keys(resources)) { const m = /^spell_slots_(\d)$/.exec(key); if (m) levels.add(Number(m[1])); }
  return [...levels].sort((a, b) => a - b).map((level) => {
    const max = resources[`spell_slots_${level}_max`];
    const value = resources[`spell_slots_${level}`];
    const rows = spells.filter((spell) => spell.level === level).sort((a, b) => Number(!!b.prepared) - Number(!!a.prepared) || a.name.localeCompare(b.name));
    return { level, label: level === 0 ? (ru ? "Заговоры" : "Cantrips") : ru ? `${level} круг` : `Level ${level}`, spells: rows,
      slots: level > 0 && Number.isFinite(value) ? { value, max: Number.isFinite(max) ? max : value } : null,
      prepared: rows.filter((spell) => spell.prepared).length };
  });
}
/** The line «Колдовать» puts into the action box. */
export function castLine(spell: SpellRecord, slotLevel: number | null, language: unknown): string {
  const ru = lang(language) === "ru";
  if (spell.level === 0 || slotLevel === null) return ru ? `Колдую «${spell.name}» на ` : `I cast ${spell.name} at `;
  return ru ? `Колдую «${spell.name}» ячейкой ${slotLevel} круга на ` : `I cast ${spell.name} with a level ${slotLevel} slot at `;
}
