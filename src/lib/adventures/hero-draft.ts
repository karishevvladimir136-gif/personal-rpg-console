// Fix run after session 2, stage F (items 16, 19, 20 — the owner's top priority from the wizard): the hero created in
// one pass. The campaign's DM builds the whole hero from the owner's words in one call — scores, level, saves, skills,
// spells, features, HP, AC, every thing with its kind, slot, damage and bonuses, the counters with their names in the
// campaign language and the money as a wallet. This module is the pure part shared by the server and the review
// screen: the draft's shape (schema 3), the tolerant reading of the model's answer (an entry that does not fit is
// repaired or dropped and said in plain words — the draft never fails as a whole), the numbers the owner wrote kept
// exactly, the strict check of the proposal and of the owner's review (the database checks the same), and the review
// before the commit. No verbatim-quote grounding: the owner's approval is the authority.
import type {
  BootstrapQuestion,
  CreationEquipmentProfile,
  CreationInput,
  CreationMechanics,
} from "./bootstrap-contracts.ts";
import type { CharacterSheetV2 } from "../inventory/sheet.ts";
import {
  coinOf,
  coins5e,
  guessKind,
  ITEM_KINDS,
  SLOT_IDS,
  universalSlots,
  type ItemKind,
  type SlotId,
  type SpellRecord,
} from "../inventory/model.ts";
import { ensure, integer, text } from "../foundation-loop/fields.ts";
import { isSheetDifference, mixedCoin, reconcileWithSupplied, sheetDifference, unfoldGroupedPapers } from "./sheet-records.ts";

type Lang = "en" | "ru";

/** The ceilings at creation: far above what play needs (the database checks the same numbers). */
export const heroLimits = {
  items: 80,
  counters: 40,
  coins: 8,
  spells: 160,
  lines: 40,
  facts: 24,
  questions: 8,
  notes: 24,
  description: 20000,
  itemDescription: 4000,
  itemMechanics: 400,
  bonuses: 8,
  quantity: 1000000,
  amount: 1000000,
} as const;

export type HeroItemDetail = {
  bonuses?: { to: string; value: number }[];
  hands?: 2;
  charges?: { value: number; max: number };
  attunement?: true;
};
/** One starting thing: its kind (the eleven kinds), the slot it is worn in (or none), its damage and properties as one
 * line, and the bonuses, hands, charges and attunement the inventory model reads from `detail`. */
export type HeroItem = {
  name: string;
  description: string;
  quantity: number;
  kind: ItemKind;
  slot: SlotId | null;
  mechanics: string;
  detail: HeroItemDetail;
};
/** A pool with its name in the campaign language (spell slots, hit dice, a class's charges). */
export type HeroCounter = { key: string; label: string; value: number; max: number | null };
/** Coins by the campaign's coin code (5e: пм, зм, эм, см, мм). */
export type HeroCoin = { code: string; amount: number };

export type HeroProposal = {
  schemaVersion: 3;
  sheet: CharacterSheetV2;
  /** Present for a structured sheet: HP, defence (AC), the attack and skill numbers, the main-hand weapon. */
  mechanics: CreationMechanics | null;
  equipmentProfile: CreationEquipmentProfile;
  capabilities: string[];
  limitations: string[];
  possessions: HeroItem[];
  counters: HeroCounter[];
  wallet: HeroCoin[];
  /** Never blocking: the DM asks only what the owner did not write; an answer is optional. */
  questions: BootstrapQuestion[];
  /** What the DM's answer had that did not fit and what was done about it, in plain words. */
  notes: string[];
};
export type HeroReview = {
  name: string;
  description: string;
  capabilities: string[];
  limitations: string[];
  possessions: HeroItem[];
  counters: HeroCounter[];
  wallet: HeroCoin[];
  answers: (string | null)[];
  sheet: CharacterSheetV2;
  mechanics?: CreationMechanics;
  equipmentProfile: CreationEquipmentProfile;
};

const ABILITIES = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"] as const;
type Ability = (typeof ABILITIES)[number];
export const abilityLabel = (ability: Ability, language: Lang) => (language === "ru"
  ? { strength: "Сила", dexterity: "Ловкость", constitution: "Телосложение", intelligence: "Интеллект", wisdom: "Мудрость", charisma: "Харизма" }
  : { strength: "Strength", dexterity: "Dexterity", constitution: "Constitution", intelligence: "Intelligence", wisdom: "Wisdom", charisma: "Charisma" })[ability];
export const abilityModifier = (score: number) => Math.floor((score - 10) / 2);
export const signed = (value: number) => `${value >= 0 ? "+" : "−"}${Math.abs(value)}`;
export const heroAbilities = ABILITIES;

// --- slots -------------------------------------------------------------------------------------------------------
const SLOT_ACCEPTS = new Map(universalSlots("en").map((slot) => [slot.id, slot.accepts]));
/** The slots that take a thing of this kind (the doll's eleven, the same as play's). */
export function slotsForKind(kind: string): SlotId[] {
  return SLOT_IDS.filter((id) => SLOT_ACCEPTS.get(id)?.includes(kind));
}
export const slotAccepts = (slot: string, kind: string) => (SLOT_ACCEPTS.get(slot) ?? []).includes(kind);

// --- small readers -------------------------------------------------------------------------------------------------
const FORBIDDEN_LINE = /^(?:world[.:]|loot[.:]|trade[.:]|can:)/i;
const UUID_LIKE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f-]{20,}/i;
const clean = (value: unknown, max: number): string => {
  if (typeof value !== "string") return "";
  const one = value.replace(/\u0000/g, "").replace(/[ \t]+/g, " ").trim();
  return one.length > max ? `${one.slice(0, max - 1).trimEnd()}…` : one;
};
const cleanBlock = (value: unknown, max: number): string => {
  if (typeof value !== "string") return "";
  const body = value.replace(/\u0000/g, "").replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").trim();
  return body.length > max ? `${body.slice(0, max - 1).trimEnd()}…` : body;
};
const int = (value: unknown): number | null => {
  const n = typeof value === "string" && /^[+−-]?\d+$/.test(value.trim()) ? Number(value.trim().replace("−", "-")) : value;
  return typeof n === "number" && Number.isFinite(n) ? Math.round(n) : null;
};
const within = (value: unknown, lo: number, hi: number): number | null => {
  const n = int(value);
  return n !== null && n >= lo && n <= hi ? n : null;
};
const arr = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const rec = (value: unknown): Record<string, unknown> => (value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {});
/** A sheet line the database takes: 1–200 characters, no internal tokens, once. */
function lineList(value: unknown, max: number, label: string, notes: string[], language: Lang): string[] {
  const out: string[] = [];
  let dropped = 0;
  for (const raw of arr(value)) {
    const line = typeof raw === "string" ? clean(raw, 200) : rec(raw).name ? clean(`${rec(raw).name}${rec(raw).text ? `: ${rec(raw).text}` : ""}`, 200) : "";
    if (!line || FORBIDDEN_LINE.test(line) || UUID_LIKE.test(line) || out.includes(line)) continue;
    if (out.length >= max) { dropped++; continue; }
    out.push(line);
  }
  if (dropped) notes.push(language === "ru" ? `В «${label}» было больше ${max} строк: ${dropped} не вошли.` : `${label} had more than ${max} lines: ${dropped} left out.`);
  return out;
}

// --- counter keys --------------------------------------------------------------------------------------------------
const TRANSLIT: Record<string, string> = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "i", к: "k", л: "l", м: "m", н: "n",
  о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya" };
const KNOWN_COUNTERS: [RegExp, string][] = [
  [/кост\p{L}*\s+хит|hit\s*dice/iu, "hit_dice"], [/магическ\p{L}*\s+восстанов|arcane\s+recovery/iu, "arcane_recovery"],
  [/(?:^|\s)ки(?:\s|$)|(?:^|\s)ki(?:\s|$)/iu, "ki"], [/очк\p{L}*\s+чародейств|sorcery\s+points/iu, "sorcery_points"],
  [/вдохновени\p{L}*\s+барда|bardic\s+inspiration/iu, "bardic_inspiration"], [/героическ\p{L}*\s+вдохновени|heroic\s+inspiration/iu, "heroic_inspiration"],
  [/божественн\p{L}*\s+канал|channel\s+divinity/iu, "channel_divinity"], [/ярост|(?:^|\s)rage/iu, "rage"],
  [/второе\s+дыхани|second\s+wind/iu, "second_wind"], [/всплеск\s+действ|action\s+surge/iu, "action_surge"],
  [/дик\p{L}*\s+облик|wild\s+shape/iu, "wild_shape"], [/наложени\p{L}*\s+рук|lay\s+on\s+hands/iu, "lay_on_hands"],
];
/** A counter's id from what the DM gave: a Latin id as it is; else a known pool or the spell-slot level from the label;
 * else the label written in Latin letters. */
export function counterKeyFrom(key: unknown, label: string): string {
  const given = typeof key === "string" ? key.trim().toLowerCase().replace(/[\s-]+/g, "_") : "";
  if (/^[a-z][a-z0-9_]{0,47}$/.test(given) && !/_(?:max|min)$/.test(given)) return given;
  const slot = /(\d)\s*(?:-?(?:го|й|ого))?\s*(?:круг|уровн)|level\s*(\d)|(\d)(?:st|nd|rd|th)?[\s-]*level/iu.exec(label);
  if (slot && /ячейк|слот|slot/iu.test(label)) return `spell_slots_${slot[1] ?? slot[2] ?? slot[3]}`;
  for (const [pattern, id] of KNOWN_COUNTERS) if (pattern.test(label)) return id;
  const latin = label.toLowerCase().split("").map((ch) => TRANSLIT[ch] ?? ch).join("").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const id = /^[a-z]/.test(latin) ? latin.slice(0, 40) : `counter_${latin}`.slice(0, 40);
  return id.replace(/_+$/g, "") || "counter";
}
const RESERVED_KEYS = new Set(["hp", "max_hp", "constructor", "prototype", "__proto__"]);
const isPotion = (text: string) => /(^|[_\s])(healing_)?potions?($|[_\s])|elixir|зель|эликсир/i.test(text);
const isAmmo = (text: string) => /^(arrows?|bolts?|ammo|ammunition)$|стрел|болт/i.test(text);

// --- the owner's own numbers ---------------------------------------------------------------------------------------
const ABILITY_WORDS: [Ability, string][] = [
  ["strength", "сила|сил|str|strength"], ["dexterity", "ловкость|лов|dex|dexterity"], ["constitution", "телосложение|тел|con|constitution"],
  ["intelligence", "интеллект|инт|int|intelligence"], ["wisdom", "мудрость|мдр|муд|wis|wisdom"], ["charisma", "харизма|хар|cha|charisma"],
];
export type OwnerNumbers = {
  attributes: Partial<Record<Ability, number>>;
  level: number | null;
  hp: number | null;
  armorClass: number | null;
  coins: HeroCoin[];
};
/** The numbers the owner wrote in «Кто вы?»: ability scores («Интеллект 20», «INT 20 (+5)» — a signed number is a
 * modifier, not a score), the level, HP («Хиты 52», «ХП 40/52»), AC («КД 15») and coins («60 зм»). */
export function ownerNumbers(description: string, language: Lang): OwnerNumbers {
  const textValue = description.replace(/−/g, "-");
  const found: OwnerNumbers = { attributes: {}, level: null, hp: null, armorClass: null, coins: [] };
  for (const [ability, words] of ABILITY_WORDS) {
    const match = new RegExp(`(?<![\\p{L}])(?:${words})(?![\\p{L}])\\s*[:=—–-]?\\s*(?<![+\\-])(\\d{1,2})(?!\\d)`, "iu").exec(textValue);
    if (match) { const n = Number(match[1]); if (n >= 1 && n <= 30) found.attributes[ability] = n; }
  }
  const level = /(?<!\d)(\d{1,2})\s*(?:-?(?:го|й|ый|ого|м))?\s*уровн/iu.exec(textValue) ?? /уровень\s*[:=]?\s*(\d{1,2})(?!\d)/iu.exec(textValue)
    ?? /(?<![\p{L}])level\s*[:=]?\s*(\d{1,2})(?!\d)/iu.exec(textValue) ?? /(?<!\d)(\d{1,2})(?:st|nd|rd|th)[\s-]+level/iu.exec(textValue);
  if (level) { const n = Number(level[1]); if (n >= 1 && n <= 30) found.level = n; }
  const hp = /(?<![\p{L}])(?:хиты|хитов|хп|hp|hit points|очки здоровья|здоровье)\s*[:=—–-]?\s*(\d{1,4})(?:\s*\/\s*(\d{1,4}))?/iu.exec(textValue);
  if (hp) { const n = Number(hp[2] ?? hp[1]); if (n >= 1 && n <= 10000) found.hp = n; }
  const ac = /(?<![\p{L}])(?:кд|класс доспеха|класс брони|ac|armou?r class)\s*[:=—–-]?\s*(\d{1,2})(?!\d)/iu.exec(textValue);
  if (ac) { const n = Number(ac[1]); if (n >= 1 && n <= 40) found.armorClass = n; }
  const coinPattern = /(?<![\d.,])(\d{1,7})\s*(зм|см|мм|пм|эм|gp|sp|cp|pp|ep|золот\p{L}*|серебр\p{L}*|медн\p{L}*|медяк\p{L}*|платин\p{L}*|электр\p{L}*)/giu;
  for (const match of textValue.matchAll(coinPattern)) {
    const coin = coinOf(match[2], language);
    const amount = Number(match[1]);
    if (!coin || amount > heroLimits.amount || found.coins.some((row) => row.code === coin.code)) continue;
    found.coins.push({ code: coin.code, amount });
  }
  // Fix S4 11s: a resources line names the coin first («Resources: gold 350; …», «Золото 350»).
  const wordFirst = /(?<![\p{L}])(gold|silver|copper|platinum|electrum|золото|серебро|медь|платина)\s*[:=]?\s*(\d{1,7})(?![\d.,\p{L}])/giu;
  for (const match of textValue.matchAll(wordFirst)) {
    const coin = coinOf(match[1], language);
    const amount = Number(match[2]);
    if (!coin || amount > heroLimits.amount || found.coins.some((row) => row.code === coin.code)) continue;
    found.coins.push({ code: coin.code, amount });
  }
  return found;
}

// --- the DM's answer, read tolerantly ------------------------------------------------------------------------------
function readSpell(raw: unknown): SpellRecord | null {
  const r = rec(raw);
  const name = clean(r.name, 120);
  const level = within(r.level, 0, 9);
  if (!name || level === null) return null;
  const out: SpellRecord = { name, level };
  for (const key of ["castingTime", "range", "components", "duration", "saveOrAttack", "damage"] as const) { const v = clean(r[key], 160); if (v) out[key] = v; }
  const higher = cleanBlock(r.higherLevels, 800); if (higher) out.higherLevels = higher;
  const body = cleanBlock(r.text, 2400); if (body) out.text = body;
  for (const key of ["ritual", "concentration", "known", "prepared"] as const) if (typeof r[key] === "boolean") out[key] = r[key] as boolean;
  return out;
}
function readDetail(r: Record<string, unknown>): HeroItemDetail {
  const detail: HeroItemDetail = {};
  const bonuses = arr(r.bonuses).map((row) => ({ to: clean(rec(row).to, 60), value: within(rec(row).value, -20, 20) }))
    .filter((row): row is { to: string; value: number } => !!row.to && row.value !== null && row.value !== 0).slice(0, heroLimits.bonuses);
  if (bonuses.length) detail.bonuses = bonuses;
  if (int(r.hands) === 2 || r.twoHanded === true) detail.hands = 2;
  const charges = rec(r.charges);
  const max = within(charges.max, 1, 1000), value = within(charges.value ?? charges.max, 0, 1000);
  if (max !== null && value !== null) detail.charges = { value: Math.min(value, max), max };
  if (r.attunement === true) detail.attunement = true;
  return detail;
}
const mechanicsLine = (r: Record<string, unknown>) =>
  clean([clean(r.damage, 200), clean(r.properties, 200), clean(r.mechanics, 400)].filter(Boolean).join("; "), heroLimits.itemMechanics);

/** Equipping at creation follows play's rules: a slot that takes the kind, one thing per slot, a single thing (a stack
 * stays in the pack), a two-handed thing in the main hand with the off hand free, at most three attuned things. */
function fitSlots(items: HeroItem[], humanoid: boolean, notes: string[], language: Lang): HeroItem[] {
  const ru = language === "ru";
  const taken = new Set<string>();
  let attuned = 0;
  const twoHanded = items.some((item) => item.slot === "hand" && item.detail.hands === 2);
  return items.map((item) => {
    if (!item.slot) return item;
    const off = (why: string) => { notes.push(ru ? `«${item.name}» не надето: ${why}.` : `“${item.name}” is not worn: ${why}.`); return { ...item, slot: null }; };
    if (!humanoid) return off(ru ? "у героя нет обычных слотов" : "the hero has no ordinary slots");
    if (!slotAccepts(item.slot, item.kind)) return off(ru ? "этот слот не для такой вещи" : "that slot does not take this kind");
    if (item.quantity !== 1) return off(ru ? "надевается одна вещь, стопка лежит в сумке" : "a single thing is worn; a stack stays in the pack");
    if (taken.has(item.slot)) return off(ru ? "слот уже занят" : "the slot is taken");
    if (item.detail.hands === 2 && item.slot !== "hand") return off(ru ? "двуручную вещь держат в основной руке" : "a two-handed thing goes in the main hand");
    if (item.slot === "offhand" && twoHanded) return off(ru ? "вторая рука занята двуручной вещью" : "the off hand holds a two-handed thing");
    if (item.detail.attunement) { if (attuned >= 3) return off(ru ? "настроиться можно не больше чем на три вещи" : "at most three attuned things"); attuned++; }
    taken.add(item.slot);
    return item;
  });
}

/** The DM's answer (one JSON object) as a schema-3 draft. Every entry that does not fit is repaired or dropped and
 * named in `notes`; the numbers the owner wrote win over the DM's. Null only when no JSON object can be read. */
export function readHeroDraft(raw: string, input: Pick<CreationInput, "name" | "description" | "language">): HeroProposal | null {
  const start = raw.indexOf("{"), end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  let value: unknown;
  try { value = JSON.parse(raw.slice(start, end + 1)); } catch { return null; }
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return normalizeHeroDraft(value as Record<string, unknown>, input);
}

export function normalizeHeroDraft(v: Record<string, unknown>, input: Pick<CreationInput, "name" | "description" | "language">): HeroProposal {
  const language: Lang = input.language === "ru" ? "ru" : "en";
  const ru = language === "ru";
  const notes: string[] = [];
  const attributesRaw = rec(v.abilities ?? v.attributes ?? v.scores);
  let attributes: CharacterSheetV2["attributes"] = null;
  const scores = ABILITIES.map((ability) => within(attributesRaw[ability] ?? attributesRaw[ability.slice(0, 3)], 1, 30));
  if (scores.some((score) => score !== null)) {
    attributes = Object.fromEntries(ABILITIES.map((ability, index) => [ability, scores[index] ?? 10])) as NonNullable<CharacterSheetV2["attributes"]>;
    if (scores.some((score) => score === null)) notes.push(ru ? "Не все характеристики пришли от ведущего: недостающие стоят на 10 — проверь их." : "Not every score came from the DM: the missing ones are 10 — check them.");
  }
  const owner = ownerNumbers(input.description, language);
  if (Object.keys(owner.attributes).length) {
    attributes = attributes ?? { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 };
    for (const ability of ABILITIES) {
      const mine = owner.attributes[ability];
      if (mine === undefined || attributes[ability] === mine) continue;
      notes.push(sheetDifference(ru ? `${abilityLabel(ability, language)} ${mine} — как в твоём тексте (у ведущего было ${attributes[ability]}).`
        : `${abilityLabel(ability, language)} ${mine}, as you wrote (the DM had ${attributes[ability]}).`));
      attributes = { ...attributes, [ability]: mine };
    }
  }
  let level = within(v.level, 0, 30);
  if (owner.level !== null && level !== owner.level) {
    if (level !== null) notes.push(sheetDifference(ru ? `Уровень ${owner.level} — как в твоём тексте (у ведущего был ${level}).` : `Level ${owner.level}, as you wrote (the DM had ${level}).`));
    level = owner.level;
  }
  let hp = within(v.hp ?? v.maxHp ?? rec(v.hitPoints).max, 1, 10000);
  if (owner.hp !== null && hp !== owner.hp) {
    if (hp !== null) notes.push(sheetDifference(ru ? `Хиты ${owner.hp} — как в твоём тексте (у ведущего было ${hp}).` : `HP ${owner.hp}, as you wrote (the DM had ${hp}).`));
    hp = owner.hp;
  }
  let armorClass = within(v.armorClass ?? v.ac, 1, 40);
  if (owner.armorClass !== null && armorClass !== owner.armorClass) {
    if (armorClass !== null) notes.push(sheetDifference(ru ? `КД ${owner.armorClass} — как в твоём тексте (у ведущего был ${armorClass}).` : `AC ${owner.armorClass}, as you wrote (the DM had ${armorClass}).`));
    armorClass = owner.armorClass;
  }
  const mode: CharacterSheetV2["mode"] = v.mode === "narrative" && !attributes && hp === null ? "narrative" : "structured_rpg";
  const proficiency = within(v.proficiencyBonus ?? v.proficiency, 1, 10);
  const abilitiesLines = lineList(v.features ?? v.abilitiesList ?? v.traits, heroLimits.lines - (proficiency ? 1 : 0), ru ? "Умения" : "Features", notes, language);
  const spells: SpellRecord[] = [];
  let badSpells = 0;
  for (const raw of arr(v.spells)) {
    const spell = typeof raw === "string" ? (clean(raw, 120) ? { name: clean(raw, 120), level: 0 } as SpellRecord : null) : readSpell(raw);
    if (!spell) { badSpells++; continue; }
    if (spells.some((row) => row.name.toLocaleLowerCase() === spell.name.toLocaleLowerCase()) || spells.length >= heroLimits.spells) { badSpells++; continue; }
    spells.push(spell);
  }
  if (badSpells) notes.push(ru ? `Заклинаний не вошло: ${badSpells} (без названия или круга, повтор или больше ${heroLimits.spells}).` : `${badSpells} spell(s) left out (no name or level, a repeat, or over ${heroLimits.spells}).`);
  const sheet: CharacterSheetV2 = {
    schemaVersion: 2,
    mode,
    role: clean(v.role ?? v.className ?? v.class, 120) || null,
    background: cleanBlock(v.background, 2000) || cleanBlock(input.description, 2000),
    level,
    tier: null,
    attributes: mode === "narrative" ? null : attributes,
    skills: lineList(v.skills, heroLimits.lines, ru ? "Навыки" : "Skills", notes, language),
    abilities: [...(proficiency ? [ru ? `Бонус мастерства +${proficiency}` : `Proficiency bonus +${proficiency}`] : []), ...abilitiesLines]
      .filter((line, index, all) => all.indexOf(line) === index),
    limitations: lineList(v.limitations, heroLimits.lines, ru ? "Ограничения" : "Limitations", notes, language),
    saves: lineList(v.saves ?? v.savingThrows, 12, ru ? "Спасброски" : "Saves", notes, language),
    attacks: lineList(v.attacks, 12, ru ? "Атаки" : "Attacks", notes, language),
    speed: clean(v.speed, 80) || null,
    armorClass,
    spells,
    preparedMax: within(v.preparedMax, 0, 60),
  };
  const humanoid = v.humanoid !== false && v.equipmentProfile !== "none";
  // Things: every one with a name; a repeat of a name merges into one stack.
  const items: HeroItem[] = [];
  let unnamed = 0, extra = 0;
  for (const raw of arr(v.items ?? v.possessions ?? v.equipment)) {
    const r = typeof raw === "string" ? { name: raw } : rec(raw);
    const name = clean(r.name, 200);
    if (!name) { unnamed++; continue; }
    const quantity = within(r.quantity ?? r.count ?? 1, 1, heroLimits.quantity) ?? 1;
    const kind: ItemKind = (ITEM_KINDS as readonly string[]).includes(String(r.kind)) ? r.kind as ItemKind : guessKind(name);
    const same = items.find((row) => row.name.toLocaleLowerCase() === name.toLocaleLowerCase());
    if (same) { same.quantity = Math.min(heroLimits.quantity, same.quantity + quantity); same.slot = null; continue; }
    if (items.length >= heroLimits.items) { extra++; continue; }
    const slot = typeof r.slot === "string" && (SLOT_IDS as readonly string[]).includes(r.slot) ? r.slot as SlotId : null;
    if (typeof r.slot === "string" && r.slot && !slot && r.slot !== "none") notes.push(ru ? `«${name}»: слота «${r.slot}» нет — вещь в сумке.` : `“${name}”: there is no slot “${r.slot}” — it is in the pack.`);
    items.push({ name, description: cleanBlock(r.description, heroLimits.itemDescription), quantity, kind, slot, mechanics: mechanicsLine(r), detail: readDetail(r) });
  }
  if (unnamed) notes.push(ru ? `Вещей без названия: ${unnamed} — не вошли.` : `${unnamed} thing(s) without a name left out.`);
  if (extra) notes.push(ru ? `Вещей больше ${heroLimits.items}: ${extra} не вошли.` : `More than ${heroLimits.items} things: ${extra} left out.`);
  // Counters: pools only — money and things are never counters (a potion counter becomes a thing).
  const counters: HeroCounter[] = [];
  for (const raw of arr(v.counters ?? v.resources)) {
    const r = rec(raw);
    const label = clean(r.label ?? r.name ?? r.key, 100);
    if (!label) continue;
    const key = counterKeyFrom(r.key, label);
    const value = within(r.value ?? r.amount ?? r.current ?? r.max, 0, heroLimits.amount);
    if (value === null) { notes.push(ru ? `Счётчик «${label}» без числа — не вошёл.` : `Counter “${label}” had no number — left out.`); continue; }
    if (key.startsWith("currency_") || coinOf(label, language)) {
      const coin = coinOf(label, language);
      if (coin && !owner.coins.some((row) => row.code === coin.code)) owner.coins.push({ code: coin.code, amount: value });
      continue;
    }
    if (isPotion(`${key} ${label}`) || isAmmo(key)) {
      if (!items.some((row) => row.name.toLocaleLowerCase() === label.toLocaleLowerCase()) && items.length < heroLimits.items)
        items.push({ name: label, description: "", quantity: Math.max(1, value), kind: isAmmo(key) ? "ammunition" : "consumable", slot: null, mechanics: "", detail: {} });
      notes.push(ru ? `«${label}» — это вещи, не счётчик: записано в вещи.` : `“${label}” are things, not a counter: recorded as things.`);
      continue;
    }
    if (RESERVED_KEYS.has(key) || counters.some((row) => row.key === key)) continue;
    if (counters.length >= heroLimits.counters) { notes.push(ru ? `Счётчиков больше ${heroLimits.counters}: «${label}» не вошёл.` : `More than ${heroLimits.counters} counters: “${label}” left out.`); continue; }
    const max = within(r.max, 0, heroLimits.amount);
    counters.push({ key, label, value, max: max === null ? null : Math.max(max, value) });
  }
  // Money: the owner's coins first, then the DM's.
  const wallet: HeroCoin[] = [...owner.coins];
  for (const raw of arr(v.money ?? v.wallet ?? v.coins)) {
    const r = rec(raw);
    const word = clean(r.coin ?? r.code ?? r.currency ?? r.name, 32);
    const amount = within(r.amount ?? r.value, 0, heroLimits.amount);
    if (!word || amount === null) continue;
    const coin = coinOf(word, language);
    const code = coin ? coin.code : word.toLocaleLowerCase();
    if (!/^[\p{L}][\p{L} ]{0,31}$/u.test(code)) continue;
    const mine = owner.coins.find((row) => row.code === code);
    if (mine) { if (mine.amount !== amount) notes.push(sheetDifference(ru ? `${mine.amount} ${code} — как в твоём тексте (у ведущего было ${amount}).` : `${mine.amount} ${code}, as you wrote (the DM had ${amount}).`)); continue; }
    if (!wallet.some((row) => row.code === code) && wallet.length < heroLimits.coins) wallet.push({ code, amount });
  }
  // Fix S4 run 1 — the wizard's record pass (sheet-records.ts): the supplied sheet's grouped papers as their things (11e),
  // its numbers kept over the draft's with each difference listed (11l), a purse of gold only as mixed coin (11s).
  const unfolded = unfoldGroupedPapers(items, input.description, language);
  notes.push(...unfolded.notes);
  const reconciled = reconcileWithSupplied(sheet, counters, input.description, language);
  notes.push(...reconciled.notes);
  Object.assign(sheet, reconciled.sheet);
  counters.splice(0, counters.length, ...reconciled.counters);
  const coin = mixedCoin(wallet, owner.coins.length > 1, language);
  if (coin.note) notes.push(coin.note);
  wallet.splice(0, wallet.length, ...coin.wallet);
  const fitted = fitSlots(unfolded.items, humanoid, notes, language);
  const questions = arr(v.questions).map((row) => clean(typeof row === "string" ? row : rec(row).question, 500)).filter(Boolean)
    .slice(0, heroLimits.questions).map((question) => ({ question, consequential: false }));
  const proposal: HeroProposal = {
    schemaVersion: 3, sheet, mechanics: null, equipmentProfile: humanoid ? "standard_humanoid" : "none",
    capabilities: sheet.abilities!.slice(0, heroLimits.facts), limitations: sheet.limitations!.slice(0, heroLimits.facts),
    possessions: fitted, counters, wallet, questions, notes: [],
  };
  proposal.mechanics = mode === "structured_rpg" ? deriveMechanics(proposal.sheet, proposal.possessions, hp) : null;
  if (mode === "structured_rpg" && hp === null) notes.push(ru ? `Хиты не пришли от ведущего: стоит ${proposal.mechanics!.hp} — проверь.` : `No HP came from the DM: it is ${proposal.mechanics!.hp} — check it.`);
  proposal.notes = draftNotes(notes, language);
  return proposal;
}

/** The draft's notes as the review shows them: the differences from the owner's sheet first, every one kept — past the
 * limit the last line says how many more there are, so nothing is dropped silently. */
function draftNotes(notes: string[], language: Lang): string[] {
  const all = [...new Set(notes.map((note) => clean(note, 500)).filter(Boolean))];
  const ordered = [...all.filter(isSheetDifference), ...all.filter((note) => !isSheetDifference(note))];
  if (ordered.length <= heroLimits.notes) return ordered;
  const shown = ordered.slice(0, heroLimits.notes - 1);
  const more = ordered.length - shown.length;
  return [...shown, sheetDifference(language === "ru" ? `И ещё ${more} — сверь лист со своим текстом.` : `And ${more} more — compare the sheet with your text.`)];
}

/** The draft when the DM could not be asked or its answer could not be read: an empty sheet the owner fills in by hand,
 * with the owner's own numbers already in it and the reason in plain words. */
export function manualHeroProposal(input: Pick<CreationInput, "name" | "description" | "language">, reason: string | null): HeroProposal {
  const language: Lang = input.language === "ru" ? "ru" : "en";
  const owner = ownerNumbers(input.description, language);
  const attributes = { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10, ...owner.attributes };
  const sheet: CharacterSheetV2 = { schemaVersion: 2, mode: "structured_rpg", role: null, background: cleanBlock(input.description, 2000), level: owner.level,
    tier: null, attributes, skills: [], abilities: [], limitations: [], saves: [], attacks: [], speed: null, armorClass: owner.armorClass, spells: [], preparedMax: null };
  const coin = mixedCoin(owner.coins, owner.coins.length > 1, language);
  return { schemaVersion: 3, sheet, mechanics: deriveMechanics(sheet, [], owner.hp), equipmentProfile: "standard_humanoid", capabilities: [], limitations: [],
    possessions: [], counters: [], wallet: coin.wallet, questions: [], notes: [...(reason ? [clean(reason, 500)] : []), ...(coin.note ? [coin.note] : [])] };
}

// --- mechanics: the numbers the runtime keeps, derived from the sheet ----------------------------------------------
const diceAverage = (line: string): number | null => {
  const m = /(\d{1,2})\s*[dкд]\s*(\d{1,3})\s*([+−-]\s*\d{1,2})?/iu.exec(line);
  if (!m) return null;
  const avg = Math.ceil(Number(m[1]) * (Number(m[2]) + 1) / 2 + (m[3] ? Number(m[3].replace(/\s/g, "").replace("−", "-")) : 0));
  return Math.max(1, Math.min(20, avg));
};
/** HP, defence (AC), attack, skill and the main-hand weapon: what the runtime's combat profile keeps. HP and AC are the
 * sheet's; attack is the best «+N» of the attack lines (else proficiency and the better of STR/DEX); skill is the
 * proficiency bonus; the weapon is the thing worn in the main hand. */
export function deriveMechanics(sheet: CharacterSheetV2, items: readonly HeroItem[], hp: number | null): CreationMechanics {
  const proficiencyLine = (sheet.abilities ?? []).map((line) => /(?:бонус мастерства|proficiency bonus)\s*\+?(\d{1,2})/iu.exec(line)).find(Boolean);
  const proficiency = proficiencyLine ? Number(proficiencyLine[1]) : sheet.level ? 2 + Math.floor((Math.max(1, sheet.level) - 1) / 4) : 0;
  const attackBonuses = (sheet.attacks ?? []).map((line) => /(?<![\dкдd])[+]\s*(\d{1,2})(?!\s*[)]?\s*\d*\s*[dкд])/iu.exec(line)).filter(Boolean).map((m) => Number(m![1]));
  const a = sheet.attributes;
  const attack = attackBonuses.length ? Math.max(...attackBonuses) : a ? proficiency + Math.max(abilityModifier(a.strength), abilityModifier(a.dexterity)) : 0;
  const weapon = items.find((item) => item.slot === "hand" && item.kind === "weapon" && item.quantity >= 1) ?? null;
  const conMod = a ? abilityModifier(a.constitution) : 0;
  const fallbackHp = Math.max(1, (sheet.level ?? 1) * (5 + conMod) + 3);
  return {
    hp: Math.max(1, Math.min(10000, hp ?? fallbackHp)),
    attack: Math.max(-20, Math.min(20, attack)),
    defense: Math.max(1, Math.min(40, sheet.armorClass ?? 10)),
    skill: Math.max(-20, Math.min(20, proficiency)),
    weaponName: weapon?.name ?? null,
    weaponDamage: weapon ? diceAverage(weapon.mechanics) ?? 4 : null,
  };
}

// --- the strict checks (the database checks the same) --------------------------------------------------------------
const linesStrict = (value: unknown, max: number): string[] => {
  ensure(Array.isArray(value) && value.length <= max);
  const out = value.map((raw) => {
    const line = text(raw, 200).trim();
    ensure(line.length >= 1 && !FORBIDDEN_LINE.test(line) && !UUID_LIKE.test(line));
    return line;
  });
  ensure(new Set(out).size === out.length);
  return out;
};
const keysOnly = (value: unknown, required: readonly string[], optional: readonly string[] = []) => {
  ensure(value !== null && typeof value === "object" && !Array.isArray(value));
  const keys = Object.keys(value as object);
  ensure(required.every((key) => keys.includes(key)) && keys.every((key) => required.includes(key) || optional.includes(key)));
  return value as Record<string, unknown>;
};
function strictSpell(raw: unknown): SpellRecord {
  const r = keysOnly(raw, ["name", "level"], ["castingTime", "range", "components", "duration", "saveOrAttack", "damage", "higherLevels", "text", "ritual", "concentration", "known", "prepared"]);
  const out: SpellRecord = { name: text(r.name, 120), level: integer(r.level, 0, 9) };
  for (const key of ["castingTime", "range", "components", "duration", "saveOrAttack", "damage"] as const)
    if (r[key] !== undefined) { ensure(typeof r[key] === "string" && (r[key] as string).length <= 160); out[key] = r[key] as string; }
  if (r.higherLevels !== undefined) { ensure(typeof r.higherLevels === "string" && r.higherLevels.length <= 800); out.higherLevels = r.higherLevels; }
  if (r.text !== undefined) { ensure(typeof r.text === "string" && r.text.length <= 2400); out.text = r.text; }
  for (const key of ["ritual", "concentration", "known", "prepared"] as const)
    if (r[key] !== undefined) { ensure(typeof r[key] === "boolean"); out[key] = r[key] as boolean; }
  return out;
}
/** A schema-2 sheet as the database's rpg_private.sheet_valid takes it. */
export function parseSheetV2(value: unknown): CharacterSheetV2 {
  const v = keysOnly(value, ["schemaVersion", "mode", "role"], ["background", "level", "tier", "attributes", "skills", "abilities", "limitations", "saves", "attacks", "speed", "armorClass", "spells", "preparedMax"]);
  ensure(v.schemaVersion === 2 && (v.mode === "structured_rpg" || v.mode === "narrative"));
  const nullableInt = (x: unknown, lo: number, hi: number) => (x === undefined || x === null ? null : integer(x, lo, hi));
  const nullableText = (x: unknown, max: number) => (x === undefined || x === null ? null : text(x, max).trim());
  let attributes: CharacterSheetV2["attributes"] = null;
  if (v.attributes !== undefined && v.attributes !== null && v.mode === "structured_rpg") {
    const a = keysOnly(v.attributes, ABILITIES);
    attributes = Object.fromEntries(ABILITIES.map((ability) => [ability, integer(a[ability], 1, 30)])) as NonNullable<CharacterSheetV2["attributes"]>;
  }
  if (v.background !== undefined) ensure(typeof v.background === "string" && v.background.length <= 2000);
  ensure(v.spells === undefined || (Array.isArray(v.spells) && v.spells.length <= heroLimits.spells));
  const spells = ((v.spells as unknown[] | undefined) ?? []).map(strictSpell);
  ensure(new Set(spells.map((row) => row.name.toLocaleLowerCase())).size === spells.length);
  const sheet: CharacterSheetV2 = {
    schemaVersion: 2, mode: v.mode, role: nullableText(v.role, 120), background: (v.background as string | undefined) ?? "",
    level: nullableInt(v.level, 0, 30), tier: nullableText(v.tier, 60), attributes,
    skills: v.skills === undefined ? [] : linesStrict(v.skills, heroLimits.lines), abilities: v.abilities === undefined ? [] : linesStrict(v.abilities, heroLimits.lines),
    limitations: v.limitations === undefined ? [] : linesStrict(v.limitations, heroLimits.lines), saves: v.saves === undefined ? [] : linesStrict(v.saves, heroLimits.lines),
    attacks: v.attacks === undefined ? [] : linesStrict(v.attacks, heroLimits.lines), speed: nullableText(v.speed, 80),
    armorClass: nullableInt(v.armorClass, 1, 40), spells, preparedMax: nullableInt(v.preparedMax, 0, 60),
  };
  ensure(new TextEncoder().encode(JSON.stringify(sheet)).length <= 120000);
  return sheet;
}
function strictDetail(value: unknown): HeroItemDetail {
  const r = keysOnly(value, [], ["bonuses", "hands", "charges", "attunement"]);
  const out: HeroItemDetail = {};
  if (r.bonuses !== undefined) {
    ensure(Array.isArray(r.bonuses) && r.bonuses.length <= heroLimits.bonuses);
    out.bonuses = r.bonuses.map((raw) => { const b = keysOnly(raw, ["to", "value"]); return { to: text(b.to, 60), value: integer(b.value, -20, 20) }; });
  }
  if (r.hands !== undefined) { ensure(r.hands === 2); out.hands = 2; }
  if (r.charges !== undefined) {
    const c = keysOnly(r.charges, ["value", "max"]);
    const max = integer(c.max, 1, 1000), valueNow = integer(c.value, 0, max);
    out.charges = { value: valueNow, max };
  }
  if (r.attunement !== undefined) { ensure(r.attunement === true); out.attunement = true; }
  return out;
}
function strictItems(value: unknown, humanoid: boolean): HeroItem[] {
  ensure(Array.isArray(value) && value.length <= heroLimits.items);
  const items = value.map((raw) => {
    const r = keysOnly(raw, ["name", "description", "quantity", "kind", "slot", "mechanics", "detail"]);
    ensure(typeof r.description === "string" && r.description.length <= heroLimits.itemDescription);
    ensure(typeof r.mechanics === "string" && r.mechanics.length <= heroLimits.itemMechanics);
    const kind = r.kind as ItemKind;
    ensure((ITEM_KINDS as readonly string[]).includes(kind));
    ensure(r.slot === null || ((SLOT_IDS as readonly string[]).includes(r.slot as string) && slotAccepts(r.slot as string, kind)));
    const item: HeroItem = { name: text(r.name, 200).trim(), description: r.description, quantity: integer(r.quantity, 1, heroLimits.quantity), kind,
      slot: r.slot as SlotId | null, mechanics: r.mechanics, detail: strictDetail(r.detail) };
    ensure(item.slot === null || (humanoid && item.quantity === 1));
    return item;
  });
  ensure(new Set(items.map((item) => item.name)).size === items.length);
  const slots = items.filter((item) => item.slot).map((item) => item.slot);
  ensure(new Set(slots).size === slots.length);
  return items;
}
function strictCounters(value: unknown): HeroCounter[] {
  ensure(Array.isArray(value) && value.length <= heroLimits.counters);
  const counters = value.map((raw) => {
    const r = keysOnly(raw, ["key", "label", "value", "max"]);
    const key = text(r.key, 48);
    ensure(/^[a-z][a-z0-9_]*$/.test(key) && !RESERVED_KEYS.has(key) && !key.startsWith("currency_") && !/_(?:max|min)$/.test(key));
    const valueNow = integer(r.value, 0, heroLimits.amount);
    return { key, label: text(r.label, 100).trim(), value: valueNow, max: r.max === null ? null : integer(r.max, valueNow, heroLimits.amount) };
  });
  ensure(new Set(counters.map((row) => row.key)).size === counters.length);
  return counters;
}
function strictWallet(value: unknown): HeroCoin[] {
  ensure(Array.isArray(value) && value.length <= heroLimits.coins);
  const wallet = value.map((raw) => {
    const r = keysOnly(raw, ["code", "amount"]);
    const code = text(r.code, 32);
    ensure(/^[\p{L}][\p{L} ]{0,31}$/u.test(code));
    return { code, amount: integer(r.amount, 0, heroLimits.amount) };
  });
  ensure(new Set(wallet.map((row) => row.code)).size === wallet.length);
  return wallet;
}
function strictMechanics(value: unknown): CreationMechanics {
  const m = keysOnly(value, ["hp", "attack", "defense", "skill", "weaponName", "weaponDamage"]);
  const weaponName = m.weaponName === null ? null : text(m.weaponName, 200);
  const weaponDamage = m.weaponDamage === null ? null : integer(m.weaponDamage, 1, 20);
  ensure((weaponName === null) === (weaponDamage === null));
  return { hp: integer(m.hp, 1, 10000), attack: integer(m.attack, -20, 20), defense: integer(m.defense, 1, 40), skill: integer(m.skill, -20, 20), weaponName, weaponDamage };
}
const facts = (value: unknown) => linesStrict(value, heroLimits.facts);
const questionsStrict = (value: unknown): BootstrapQuestion[] => {
  ensure(Array.isArray(value) && value.length <= heroLimits.questions);
  return value.map((raw) => { const q = keysOnly(raw, ["question", "consequential"]); ensure(q.consequential === false); return { question: text(q.question, 500), consequential: false }; });
};
const profile = (value: unknown): CreationEquipmentProfile => { ensure(value === "standard_humanoid" || value === "none"); return value; };

export const isHeroProposal = (value: unknown): boolean => !!value && typeof value === "object" && (value as { schemaVersion?: unknown }).schemaVersion === 3;
/** The stored draft as the database's validator takes it (no grounding in quotes). */
export function parseHeroProposal(value: unknown): HeroProposal {
  const v = keysOnly(value, ["schemaVersion", "sheet", "mechanics", "equipmentProfile", "capabilities", "limitations", "possessions", "counters", "wallet", "questions", "notes"]);
  ensure(v.schemaVersion === 3);
  const sheet = parseSheetV2(v.sheet);
  const equipmentProfile = profile(v.equipmentProfile);
  const proposal: HeroProposal = {
    schemaVersion: 3, sheet, mechanics: v.mechanics === null ? null : strictMechanics(v.mechanics), equipmentProfile,
    capabilities: facts(v.capabilities), limitations: facts(v.limitations), possessions: strictItems(v.possessions, equipmentProfile === "standard_humanoid"),
    counters: strictCounters(v.counters), wallet: strictWallet(v.wallet), questions: questionsStrict(v.questions),
    notes: (() => { ensure(Array.isArray(v.notes) && v.notes.length <= heroLimits.notes); return (v.notes as unknown[]).map((row) => text(row, 500)); })(),
  };
  ensure((sheet.mode === "structured_rpg") === (proposal.mechanics !== null));
  return proposal;
}
export const isHeroReview = (value: unknown): boolean => !!value && typeof value === "object" && Object.hasOwn(value, "counters") && Object.hasOwn(value, "wallet");
/** The owner's review as the database takes it. With the proposal: the answers line up with its questions. */
export function parseHeroReview(value: unknown, proposal?: HeroProposal): HeroReview {
  const v = keysOnly(value, ["name", "description", "capabilities", "limitations", "possessions", "counters", "wallet", "answers", "sheet", "equipmentProfile"], ["mechanics"]);
  const sheet = parseSheetV2(v.sheet);
  const equipmentProfile = profile(v.equipmentProfile);
  ensure(Array.isArray(v.answers) && v.answers.length <= heroLimits.questions);
  const review: HeroReview = {
    name: text(v.name, 200).trim(), description: text(v.description, heroLimits.description), capabilities: facts(v.capabilities), limitations: facts(v.limitations),
    possessions: strictItems(v.possessions, equipmentProfile === "standard_humanoid"), counters: strictCounters(v.counters), wallet: strictWallet(v.wallet),
    answers: (v.answers as unknown[]).map((row) => (row === null ? null : text(row, 2000))), sheet, equipmentProfile,
    ...(v.mechanics !== undefined ? { mechanics: strictMechanics(v.mechanics) } : {}),
  };
  ensure((sheet.mode === "structured_rpg") === (review.mechanics !== undefined));
  if (review.mechanics?.weaponName) ensure(review.possessions.some((item) => item.name === review.mechanics!.weaponName));
  if (proposal) ensure(review.answers.length === proposal.questions.length);
  return review;
}

/** The first review: the draft as it is, under the owner's name and words. */
export function initialHeroReview(input: Pick<CreationInput, "name" | "description">, proposal: HeroProposal): HeroReview {
  return {
    name: input.name, description: input.description, capabilities: [...proposal.capabilities], limitations: [...proposal.limitations],
    possessions: structuredClone(proposal.possessions), counters: structuredClone(proposal.counters), wallet: structuredClone(proposal.wallet),
    answers: proposal.questions.map(() => null), sheet: structuredClone(proposal.sheet), equipmentProfile: proposal.equipmentProfile,
    ...(proposal.mechanics ? { mechanics: { ...proposal.mechanics } } : {}),
  };
}

/** What the screen's edits become before «Утвердить героя»: blank lines and blank things gone, the counters' maxima
 * at least their values, the world facts from the sheet, the runtime numbers derived from the sheet (HP as the owner
 * set it). Never throws; the strict check follows. */
export function heroReviewForCommit(review: HeroReview): HeroReview {
  const trimLines = (lines: string[] | undefined) => [...new Set((lines ?? []).map((line) => line.trim().slice(0, 200)).filter((line) => line && !FORBIDDEN_LINE.test(line)))];
  const sheet: CharacterSheetV2 = {
    ...review.sheet, role: review.sheet.role?.trim() || null, background: (review.sheet.background ?? "").slice(0, 2000),
    skills: trimLines(review.sheet.skills).slice(0, heroLimits.lines), abilities: trimLines(review.sheet.abilities).slice(0, heroLimits.lines),
    limitations: trimLines(review.sheet.limitations).slice(0, heroLimits.lines), saves: trimLines(review.sheet.saves).slice(0, heroLimits.lines),
    attacks: trimLines(review.sheet.attacks).slice(0, heroLimits.lines), speed: review.sheet.speed?.trim() || null,
    spells: (review.sheet.spells ?? []).filter((spell) => spell.name.trim()).map((spell) => ({ ...spell, name: spell.name.trim() })),
  };
  const humanoid = review.equipmentProfile === "standard_humanoid";
  // Fix S4 11e: a grouped papers thing the owner typed on the review («James's Papers» with its parts in the description)
  // is recorded as its parts; only its own description counts here — the owner's review stands.
  const possessions = unfoldGroupedPapers(review.possessions.filter((item) => item.name.trim()).map((item) => {
    const name = item.name.trim();
    const slot = humanoid && item.slot && slotAccepts(item.slot, item.kind) && item.quantity === 1 ? item.slot : null;
    return { ...item, name, slot };
  }), "", /[а-яё]/iu.test(`${review.name} ${review.description}`) ? "ru" : "en").items;
  const counters = review.counters.filter((row) => row.label.trim()).map((row) => ({ ...row, label: row.label.trim(),
    key: counterKeyFrom(row.key, row.label), max: row.max === null ? null : Math.max(row.max, row.value) }));
  const wallet = review.wallet.filter((row) => row.code.trim() && row.amount >= 0).map((row) => ({ ...row, code: row.code.trim() }));
  const mechanics = sheet.mode === "structured_rpg" ? deriveMechanics(sheet, possessions, review.mechanics?.hp ?? null) : undefined;
  const { mechanics: _previous, ...rest } = review;
  void _previous;
  return { ...rest, sheet, possessions, counters, wallet, capabilities: sheet.abilities!.slice(0, heroLimits.facts), limitations: sheet.limitations!.slice(0, heroLimits.facts),
    answers: review.answers.map((row) => (row && row.trim() ? row : null)), ...(mechanics ? { mechanics } : {}) };
}

/** Why «Утвердить героя» is grey, in one plain line (never without a reason); null when it can be pressed. */
export function heroBlockedReason(review: HeroReview, language: Lang): string | null {
  const ru = language === "ru";
  if (!review.name.trim()) return ru ? "Назови героя." : "Name the hero.";
  const items = review.possessions.filter((item) => item.name.trim());
  const names = items.map((item) => item.name.trim());
  const repeat = names.find((name, index) => names.indexOf(name) !== index);
  if (repeat) return ru ? `Две вещи называются «${repeat}» — переименуй одну или сложи их в одну стопку.` : `Two things are called “${repeat}” — rename one or stack them.`;
  const slots = items.filter((item) => item.slot && review.equipmentProfile === "standard_humanoid" && slotAccepts(item.slot, item.kind) && item.quantity === 1).map((item) => item.slot);
  const twice = slots.find((slot, index) => slots.indexOf(slot) !== index);
  if (twice) {
    const label = universalSlots(language).find((slot) => slot.id === twice)?.label ?? twice;
    return ru ? `В слоте «${label}» две вещи — сними одну.` : `Two things in “${label}” — take one off.`;
  }
  const keys = review.counters.filter((row) => row.label.trim()).map((row) => counterKeyFrom(row.key, row.label));
  if (new Set(keys).size !== keys.length) return ru ? "Два счётчика с одним названием — переименуй один." : "Two counters have the same name — rename one.";
  try { parseHeroReview(heroReviewForCommit(review)); } catch {
    return ru ? "В листе что-то не сходится: проверь числа (характеристики 1–30, КД 1–40, уровень 0–30) и строки (до 200 знаков)."
      : "Something in the sheet does not add up: check the numbers (scores 1–30, AC 1–40, level 0–30) and the lines (up to 200 characters).";
  }
  return null;
}

/** The coins the review offers: the campaign's 5e coins in order of value. */
export const walletCodes = (language: Lang) => coins5e(language).map((coin) => ({ code: coin.code, name: coin.name }));
