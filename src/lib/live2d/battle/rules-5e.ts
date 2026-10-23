// Fix S3-accept Г1, Г3 (docs/stages/FIX_S3_ACCEPT.md): the 5e rules module's sheet arithmetic — armour class, saves,
// the attack bonus and the proficiency bonus derived from the sheet, the worn things and the active effects instead of
// a number written once. AC = the base (10, or the body armour's) + Dex as the armour allows + a worn shield + the worn
// things' bonuses (a condition such as «no armour and no shield» honoured) + the effects (Mage Armor: 13 + Dex without
// armour; Shield: +5 until its caster's next turn, a fight condition only). The owner's manual AC (`stats.ac_manual`,
// «КД вручную») outranks the rules; a sheet without DEX keeps its stored number. Only for D&D 5e campaigns: any other
// system keeps what its sheet says (the generic code never does this arithmetic). Pure, client-safe; the server
// attaches the result to the public campaign read (`withDerivedSheets`) and `combat attack` reads the same function.
import type { CampaignSnapshot, Entity, Item } from "../../persistence/contracts.ts";
import type { CharacterSheetV1 } from "../../adventures/bootstrap-contracts.ts";
import type { CharacterSheetV2 } from "../../inventory/sheet.ts";
import { itemMechanics } from "../../inventory/model.ts";

type Lang = "ru" | "en";
const lang = (value: unknown): Lang => (value === "ru" ? "ru" : "en");

/** D&D 5e by the campaign's rules-system name (label or id); Pathfinder and the rest keep their own sheet numbers. */
export function isFifthEdition(system: { id?: string | null; label?: string | null } | string | null | undefined): boolean {
  const name = typeof system === "string" ? system : `${system?.label ?? ""} ${system?.id ?? ""}`;
  return /\b5e\b|d&d|dnd|dungeons|5-?я\s*ред|пят(ая|ой)\s*ред|днд/iu.test(name);
}

export const ABILITIES = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"] as const;
export type Ability = (typeof ABILITIES)[number];
const ABILITY: Record<Ability, { ru: string; en: string; short: [string, string]; stem: RegExp }> = {
  strength: { ru: "Сила", en: "Strength", short: ["Сил", "Str"], stem: /(?:^|[^\p{L}])(?:сил|str)/iu },
  dexterity: { ru: "Ловкость", en: "Dexterity", short: ["Лов", "Dex"], stem: /(?:^|[^\p{L}])(?:ловк|dex)/iu },
  constitution: { ru: "Телосложение", en: "Constitution", short: ["Тел", "Con"], stem: /(?:^|[^\p{L}])(?:телосл|con)/iu },
  intelligence: { ru: "Интеллект", en: "Intelligence", short: ["Инт", "Int"], stem: /(?:^|[^\p{L}])(?:интел|int)/iu },
  wisdom: { ru: "Мудрость", en: "Wisdom", short: ["Мдр", "Wis"], stem: /(?:^|[^\p{L}])(?:мудр|wis)/iu },
  charisma: { ru: "Харизма", en: "Charisma", short: ["Хар", "Cha"], stem: /(?:^|[^\p{L}])(?:харизм|cha)/iu },
};
export const abilityMod = (score: number) => Math.floor((score - 10) / 2);
/** «2», «−1»: a part of a sum («10 + Ловкость 2»). */
const num = (value: number) => (value < 0 ? `−${-value}` : String(value));
/** «+4», «−1»: a bonus. */
export const signed = (value: number) => (value < 0 ? `−${-value}` : `+${value}`);

/** The plates' labels in a 5e campaign (Г1): «КД», «Атака», «Навык». */
export function sheetLabels5e(language: unknown): { ac: string; attack: string; skill: string; saves: string } {
  return lang(language) === "ru" ? { ac: "КД", attack: "Атака", skill: "Навык", saves: "Спасброски" } : { ac: "AC", attack: "Attack", skill: "Skill", saves: "Saving throws" };
}

// --- armour, shields, worn bonuses, effects --------------------------------------------------------------------
/** The SRD armour by name (base, the most of Dex it lets count); the more specific names first. */
const ARMOUR: { words: RegExp; base: number; dex: number }[] = [
  { words: /стёган|стеган|padded/iu, base: 11, dex: 99 },
  { words: /проклёп|проклеп|клёпан|клепан|studded/iu, base: 12, dex: 99 },
  { words: /кожан|leather/iu, base: 11, dex: 99 },
  { words: /шкур|hide/iu, base: 12, dex: 2 },
  { words: /кольчужн\p{L}*\s+рубах|chain\s*shirt/iu, base: 13, dex: 2 },
  { words: /чешу|scale/iu, base: 14, dex: 2 },
  { words: /кирас|breastplate/iu, base: 14, dex: 2 },
  { words: /полулат|half[\s-]*plate/iu, base: 15, dex: 2 },
  { words: /колечн|ring\s*mail/iu, base: 14, dex: 0 },
  { words: /кольчуг|chain\s*mail/iu, base: 16, dex: 0 },
  { words: /наборн|splint/iu, base: 17, dex: 0 },
  { words: /(?:^|[^\p{L}])лат(?:ы|ный|ные|ного)|plate/iu, base: 18, dex: 0 },
];
const AC_WORDS = /(?:^|[^\p{L}])(?:кд|ac|класс\p{L}*\s+доспех\p{L}*|armou?r\s+class|защит\p{L}*)(?![\p{L}])/iu;
const SAVE_WORDS = /спасброс|saving\s+throw|(?:^|[^\p{L}])saves?(?![\p{L}])/iu;
const ATTACK_WORDS = /атак|attack|попадан|to\s+hit/iu;
const NO_ARMOUR = /(?:без|нет|не\s+нос\p{L}*|не\s+надет\p{L}*|no|without|not\s+wearing|unarmou?red)\s+(?:[\p{L}]+\s+){0,3}?(?:доспех|брон|armou?r)/iu;
const NO_SHIELD = /(?:(?:без|нет|no|without|not\s+using)\s+(?:[\p{L}]+\s+){0,3}?(?:щит|shield))|(?:(?:доспех|брон|armou?r)\p{L}*\s+(?:и|или|ни|and|or|nor)\s+(?:[\p{L}]+\s+){0,2}?(?:щит|shield))/iu;

/** The body armour's base and how much Dex it lets count: its own words («КД 13 + Лов (макс. 2)») first, then its name. */
export function armourBase(item: Pick<Item, "name" | "mechanics">): { base: number; dex: number } | null {
  const text = item.mechanics ?? "";
  const named = ARMOUR.find((row) => row.words.test(item.name)) ?? null;
  const written = /(?:кд|ac|класс\p{L}*\s+доспех\p{L}*|armou?r\s+class)\s*[:=]?\s*(\d{1,2})(?!\d)/iu.exec(text);
  if (!written) return named ? { base: named.base, dex: named.dex } : null;
  const base = Number(written[1]);
  const after = text.slice(written.index + written[0].length);
  const cap = /(?:макс\p{L}*|max\p{L}*)\.?\s*(?:\+\s*)?(\d)/iu.exec(after);
  const dex = /ловк|(?:^|[^\p{L}])лов(?![\p{L}])|dex/iu.test(after) ? (cap ? Number(cap[1]) : 99) : named ? named.dex : 0;
  return { base, dex };
}
type Bonus = { ac: number | null; saves: { value: number; ability: Ability | null }[]; attack: number | null };
/** «+1 к КД и спасброскам», «КД +1», «+2 к спасброскам Мудрости»: the bonuses an item's own words name. */
export function textBonuses(text: string): Bonus {
  const out: Bonus = { ac: null, saves: [], attack: null };
  for (const match of text.replace(/[−–]/g, "-").matchAll(/([+-])\s?(\d{1,2})(?!\d)\s*((?:к|ко|to|on|на)?\s*[^\d+\-.;,(\n]{0,60})/giu)) {
    const value = (match[1] === "-" ? -1 : 1) * Number(match[2]), phrase = match[3];
    if (out.ac === null && AC_WORDS.test(phrase)) out.ac = value;
    if (SAVE_WORDS.test(phrase)) out.saves.push({ value, ability: abilityIn(phrase.replace(SAVE_WORDS, " ")) });
    if (out.attack === null && ATTACK_WORDS.test(phrase) && !AC_WORDS.test(phrase)) out.attack = value;
  }
  const reversed = /(?:^|[^\p{L}])(?:кд|ac)\s*([+-])\s?(\d{1,2})(?!\d)/iu.exec(text.replace(/[−–]/g, "-"));
  if (out.ac === null && reversed) out.ac = (reversed[1] === "-" ? -1 : 1) * Number(reversed[2]);
  return out;
}
const abilityIn = (text: string): Ability | null => ABILITIES.find((ability) => ABILITY[ability].stem.test(text)) ?? null;
/** What a worn thing adds: its recorded bonuses (`detail.bonuses`) first, else its own words; and when it counts. */
function wornBonuses(item: Item): Bonus & { noArmour: boolean; noShield: boolean } {
  const recorded = itemMechanics(item).bonuses;
  const words = textBonuses(item.mechanics ?? "");
  const ac = recorded.find((row) => AC_WORDS.test(` ${row.to}`))?.value ?? null;
  const saves = recorded.filter((row) => SAVE_WORDS.test(` ${row.to}`)).map((row) => ({ value: row.value, ability: abilityIn(row.to.replace(SAVE_WORDS, " ")) }));
  const attack = recorded.find((row) => ATTACK_WORDS.test(row.to))?.value ?? null;
  // The condition is read from the mechanics, the bonuses and the description's sentences about AC (not its story).
  const told = (item.description ?? "").split(/[.;!\n]+/u).filter((sentence) => AC_WORDS.test(` ${sentence}`)).join(". ");
  const condition = `${item.mechanics ?? ""} ${told} ${recorded.map((row) => row.to).join(" ")}`;
  const noArmour = NO_ARMOUR.test(condition);
  // A weapon's own «+5 к попаданию» is its whole to-hit, not a bonus: only its recorded bonuses count.
  return { ac: ac ?? words.ac, saves: saves.length ? saves : words.saves, attack: attack ?? (item.category === "weapon" ? null : words.attack), noArmour,
    noShield: NO_SHIELD.test(condition) };
}

type Effect = { key: string; match: RegExp; with: [string, string]; fightOnly: boolean; base?: number; bonus?: number };
/** The spell effects that change AC: Mage Armor (lasting, recorded as a condition) and Shield (a fight condition that
 * ends at its caster's next turn). «Щит веры» / Shield of Faith is another spell and is not Shield. */
const EFFECTS: Effect[] = [
  { key: "mage_armor", match: /доспех\p{L}*\s+маг\p{L}*|mage[\s_-]*armou?r/iu, with: ["с Доспехами мага", "with Mage Armor"], fightOnly: false, base: 13 },
  { key: "shield", match: /^(?:заклинани\p{L}*\s+|spell\s*:?\s*)?[«"“]?(?:щит|shield)[»"”]?(?:\s*\(?(?:заклинани\p{L}*|spell|реакци\p{L}*|reaction)\)?)?$/iu,
    with: ["со Щитом", "with Shield"], fightOnly: true, bonus: 5 },
];
const effectOf = (word: string) => EFFECTS.find((effect) => effect.match.test(word.trim())) ?? null;
/** A fight condition that ends when its bearer's turn starts (Shield: «until the start of your next turn»). */
export function endsAtOwnTurn(condition: string): boolean {
  return effectOf(condition)?.key === "shield";
}

// --- the derivation -------------------------------------------------------------------------------------------
export type Explained = { value: number; text: string };
export type DerivedArmourClass = Explained & { source: "rules" | "manual" | "sheet" };
export type DerivedSave = Explained & { ability: Ability; label: string };
/** The 5e numbers of a sheet, each with its breakdown in the campaign language. `savesNeedLevel`: the class's
 * proficient saves are known but the level is not (no saves are given; the sheet asks for the level). */
export type DerivedSheet = { ac: DerivedArmourClass | null; saves: DerivedSave[]; attack: Explained | null; proficiency: Explained | null; savesNeedLevel: boolean };
type Person = Pick<Entity, "id" | "kind" | "stats" | "conditions"> & { character_sheet?: Entity["character_sheet"] };
export type DeriveInput = {
  entity: Person;
  /** The campaign's items; the person's worn ones count. */
  items: readonly Item[];
  /** Conditions of the open fight (Shield lives here; the record's lasting ones are the entity's). */
  fight?: readonly string[];
  /** The armour class the open fight holds for a sheet the rules cannot read (no DEX). */
  fightAc?: number | null;
  language: unknown;
};

const sheetOf = (entity: Person): (CharacterSheetV1 | CharacterSheetV2) | null => entity.character_sheet ?? null;
const integer = (value: unknown, lo: number, hi: number) => (typeof value === "number" && Number.isInteger(value) && value >= lo && value <= hi ? value : null);
/** The AC the record states without the rules: the sheet's number, else the system's stat (ac, КД, armour, defense). */
export function storedArmourClass(entity: Person): number | null {
  const sheet = sheetOf(entity);
  const fromSheet = sheet && "armorClass" in sheet ? integer(sheet.armorClass, 1, 40) : null;
  const stat = Object.entries(entity.stats ?? {}).find(([key, value]) => /^(ac|кд|armou?r|armou?r_class|defen[cs]e|защита)$/i.test(key) && Number.isFinite(value))?.[1];
  return fromSheet ?? (typeof stat === "number" ? stat : null);
}
/** The owner's own AC («КД вручную»): it outranks the rules (the owner's correction is the highest authority). */
export const manualArmourClass = (entity: Pick<Entity, "stats">) => integer(entity.stats?.ac_manual, 1, 40);

function proficiencyOf(entity: Person, ru: boolean): Explained | null {
  const sheet = sheetOf(entity);
  const line = (sheet?.abilities ?? []).map((row) => /(?:бонус мастерства|proficiency bonus)\s*:?\s*\+?(\d{1,2})/iu.exec(row)).find(Boolean);
  if (line) return { value: Number(line[1]), text: ru ? `${signed(Number(line[1]))} мастерство (по листу)` : `${signed(Number(line[1]))} proficiency (from the sheet)` };
  const level = integer(sheet?.level, 1, 30) ?? integer(entity.stats?.level, 1, 30);
  if (level === null) return null;
  const value = 2 + Math.floor((level - 1) / 4);
  return { value, text: ru ? `${signed(value)} мастерство · уровень ${level}` : `${signed(value)} proficiency · level ${level}` };
}
// --- the class ------------------------------------------------------------------------------------------------
export type FifthClass = "wizard" | "artificer" | "cleric" | "druid" | "bard" | "paladin" | "ranger" | "rogue" | "fighter" | "barbarian" | "monk"
  | "sorcerer" | "warlock";
/** The SRD classes: the word that names each (one whole word, Russian or English, lower case), its two proficient saves
 * and its spellcasting ability. */
const CLASSES: { key: FifthClass; word: RegExp; saves: [Ability, Ability]; casting: Ability | null }[] = [
  { key: "wizard", word: /^(?:маг|магесса|магичка|волшебни\p{L}*|wizards?)$/u, saves: ["intelligence", "wisdom"], casting: "intelligence" },
  { key: "artificer", word: /^(?:изобретател\p{L}*|artificers?)$/u, saves: ["constitution", "intelligence"], casting: "intelligence" },
  { key: "cleric", word: /^(?:жрец\p{L}*|жриц\p{L}*|clerics?)$/u, saves: ["wisdom", "charisma"], casting: "wisdom" },
  { key: "druid", word: /^(?:друид\p{L}*|druids?)$/u, saves: ["intelligence", "wisdom"], casting: "wisdom" },
  { key: "ranger", word: /^(?:следопыт\p{L}*|rangers?)$/u, saves: ["strength", "dexterity"], casting: "wisdom" },
  { key: "bard", word: /^(?:бард|бардесса|bards?)$/u, saves: ["dexterity", "charisma"], casting: "charisma" },
  { key: "paladin", word: /^(?:паладин\p{L}*|paladins?)$/u, saves: ["wisdom", "charisma"], casting: "charisma" },
  { key: "sorcerer", word: /^(?:чародей\p{L}*|sorcer\p{L}*)$/u, saves: ["constitution", "charisma"], casting: "charisma" },
  { key: "warlock", word: /^(?:колдун\p{L}*|warlocks?)$/u, saves: ["wisdom", "charisma"], casting: "charisma" },
  { key: "rogue", word: /^(?:плут\p{L}*|вор|воровка|rogues?)$/u, saves: ["dexterity", "intelligence"], casting: null },
  { key: "fighter", word: /^(?:воин|воительниц\p{L}*|боец|fighters?)$/u, saves: ["strength", "constitution"], casting: null },
  { key: "barbarian", word: /^(?:варвар\p{L}*|barbarians?)$/u, saves: ["strength", "constitution"], casting: null },
  { key: "monk", word: /^(?:монах|монахиня|монашка|monks?)$/u, saves: ["strength", "dexterity"], casting: null },
];
const classRow = (role: string | null | undefined) => {
  for (const word of (role ?? "").toLocaleLowerCase().split(/[^\p{L}]+/u)) {
    const row = word && CLASSES.find((entry) => entry.word.test(word));
    if (row) return row;
  }
  return null;
};
/** Findings S3, item 4: the class a role names — its first word that is a class, so a qualifier after it never decides
 * («Маг школы Воплощения…», «Wizard of the Evocation school», «Колдун Великого Древнего», «Паладин ордена Друидов»). */
export const classOf = (role: string | null | undefined): FifthClass | null => classRow(role)?.key ?? null;
/** The class's spellcasting ability (wizard, artificer: INT; cleric, druid, ranger: WIS; bard, sorcerer, warlock, paladin: CHA). */
const castingAbility = (role: string | null | undefined): Ability | null => classRow(role)?.casting ?? null;
/** The class's proficient saves, for a sheet that lists none (the SRD classes). */
const classSaves = (role: string | null | undefined): Ability[] | null => classRow(role)?.saves ?? null;

/** Armour class, saves, attack and proficiency of one person by the 5e rules, every number with its breakdown. */
export function deriveSheet5e(input: DeriveInput): DerivedSheet {
  const ru = lang(input.language) === "ru";
  const { entity } = input;
  const sheet = sheetOf(entity);
  const scores = sheet?.attributes ?? null;
  const mod = (ability: Ability) => (scores && Number.isFinite(scores[ability]) ? abilityMod(scores[ability]) : null);
  const worn = input.items.filter((item) => item.equipped_entity_id === entity.id && item.quantity > 0);
  const body = worn.find((item) => item.category === "armor" && item.equipped_slot === "body") ?? null;
  // «Armor» on the body that names no base and no known armour but a bonus to AC (a robe recorded as armour) is a worn
  // thing with a bonus, not armour.
  const armour = body && !armourBase(body) && wornBonuses(body).ac ? null : body;
  const shield = worn.find((item) => item.category === "shield") ?? null;
  const lasting = (entity.conditions ?? []).map(effectOf).filter((effect): effect is Effect => !!effect && !effect.fightOnly);
  const fightEffects = (input.fight ?? []).map(effectOf).filter((effect): effect is Effect => !!effect);
  const effects = [...new Map([...lasting, ...fightEffects].map((effect) => [effect.key, effect])).values()];
  const bonusOf = new Map(worn.map((item) => [item.id, wornBonuses(item)]));
  const applies = (item: Item) => { const b = bonusOf.get(item.id)!; return !(b.noArmour && armour) && !(b.noShield && shield); };

  // Armour class.
  const shieldBonus = effects.filter((effect) => effect.bonus).reduce((sum, effect) => sum + effect.bonus!, 0);
  const effectTail = (start: number, withBase: boolean) => {
    let value = start, tail = "";
    for (const effect of effects) {
      if (effect.base !== undefined && !withBase) continue;
      if (effect.base !== undefined) { if (armour) continue; value += effect.base - 10; }
      else value += effect.bonus ?? 0;
      tail += ` · ${effect.with[ru ? 0 : 1]} ${value}`;
    }
    return { value, tail };
  };
  let ac: DerivedArmourClass | null = null;
  const dex = mod("dexterity");
  const base = armour ? armourBase(armour) : { base: 10, dex: 99 };
  const manual = manualArmourClass(entity);
  if (dex !== null && base) {
    const parts: string[] = [armour ? `${armour.name} ${base.base}` : "10"];
    let value = base.base;
    const dexCounts = Math.min(dex, base.dex);
    if (base.dex > 0) { parts.push(`${ru ? "Ловкость" : "Dex"} ${num(dexCounts)}`); value += dexCounts; }
    if (shield) {
      const own = textBonuses(shield.mechanics ?? "").ac ?? 2;
      const magic = itemMechanics(shield).bonuses.find((row) => AC_WORDS.test(` ${row.to}`))?.value ?? 0;
      parts.push(`${shield.name} ${num(own + magic)}`); value += own + magic;
    }
    if (armour) { const magic = itemMechanics(armour).bonuses.find((row) => AC_WORDS.test(` ${row.to}`))?.value ?? 0; if (magic) { parts.push(`${ru ? "чары доспеха" : "armour's magic"} ${num(magic)}`); value += magic; } }
    for (const item of worn) {
      if (item === armour || item === shield || !applies(item)) continue;
      const bonus = bonusOf.get(item.id)!.ac;
      if (bonus) { parts.push(`${item.name} ${num(bonus)}`); value += bonus; }
    }
    const tail = effectTail(value, true);
    ac = manual !== null
      ? { value: manual + shieldBonus, source: "manual", text: `${ru ? "вручную" : "by hand"} ${manual} · ${ru ? "по правилам" : "by the rules"} ${tail.value - shieldBonus}${shieldBonus ? effectTail(manual, false).tail : ""}` }
      : { value: tail.value, source: "rules", text: `${parts.join(" + ")} = ${value}${tail.tail}` };
  } else {
    const stored = manual ?? input.fightAc ?? storedArmourClass(entity);
    if (stored !== null) {
      const tail = effectTail(stored, false);
      ac = { value: tail.value, source: manual !== null ? "manual" : "sheet", text: `${manual !== null ? (ru ? "вручную" : "by hand") : ru ? "по листу" : "from the sheet"} ${stored}${tail.tail}` };
    }
  }

  // Proficiency, attack.
  const proficiency = proficiencyOf(entity, ru);
  const cast = castingAbility(sheet?.role);
  let attack: Explained | null = null;
  const attackItems = worn.filter((item) => applies(item) && (!cast || item.category !== "weapon")).map((item) => [item, bonusOf.get(item.id)!.attack] as const).filter(([, value]) => !!value);
  const strDex = (["strength", "dexterity"] as const).map((ability) => [ability, mod(ability)] as const).filter(([, value]) => value !== null).sort((a, b) => b[1]! - a[1]!)[0];
  const attackAbility: [Ability, number] | null = cast && mod(cast) !== null ? [cast, mod(cast)!] : strDex ? [strDex[0], strDex[1]!] : null;
  if (attackAbility && proficiency) {
    const value = attackAbility[1] + proficiency.value + attackItems.reduce((sum, [, v]) => sum + v!, 0);
    attack = { value, text: [`${signed(attackAbility[1])} ${ABILITY[attackAbility[0]].short[ru ? 0 : 1]}`, `${signed(proficiency.value)} ${ru ? "мастерство" : "proficiency"}`,
      ...attackItems.map(([item, v]) => `${signed(v!)} ${item.name}`)].join(" ") };
  } else {
    const stored = integer(entity.stats?.attack, -20, 30);
    if (stored !== null) attack = { value: stored, text: ru ? `${signed(stored)} по листу` : `${signed(stored)} from the sheet` };
  }

  // Saves: the six when the scores are known — a save the sheet names keeps its number, the others are the modifier;
  // a sheet with no save lines takes its class's proficient saves (a class the words do not name: no saves shown).
  // Findings S3, item 4: those need the proficiency bonus — without a level the sheet asks for it (`savesNeedLevel`)
  // instead of showing the bare modifiers as the saves.
  const saveBonuses = (ability: Ability) => worn.filter(applies).flatMap((item) => bonusOf.get(item.id)!.saves.filter((row) => row.ability === null || row.ability === ability)
    .map((row) => ({ name: item.name, value: row.value })));
  const lines = (sheet && "saves" in sheet ? sheet.saves : undefined) ?? [];
  const byClass = lines.length ? null : classSaves(sheet?.role);
  const savesNeedLevel = !!byClass && !!scores && !proficiency;
  const saves: DerivedSave[] = [];
  const profText = (m: number, short: string) => `${short} ${signed(m)} ${signed(proficiency!.value)} ${ru ? "мастерство" : "proficiency"}`;
  for (const ability of lines.length || (byClass && !savesNeedLevel) ? ABILITIES : []) {
    const line = lines.find((row) => abilityIn(row.replace(/спасбросок|спасброски|saving throw|save/giu, " ")) === ability) ?? null;
    const written = line ? /([+−-])\s*(\d{1,2})\s*$/u.exec(line.trim()) : null;
    const stated = written ? (written[1] === "+" ? 1 : -1) * Number(written[2]) : null;
    const m = mod(ability);
    if (stated === null && m === null) continue;
    const short = ABILITY[ability].short[ru ? 0 : 1];
    const trained = stated === null && !!byClass?.includes(ability) && !!proficiency;
    const base = stated ?? m! + (trained ? proficiency!.value : 0);
    const head = trained ? profText(m!, short) : stated === null ? `${short} ${signed(m!)}`
      : m !== null && proficiency && stated === m + proficiency.value ? profText(m, short)
        : m !== null && stated === m ? `${short} ${signed(m)}` : `${ru ? "по листу" : "from the sheet"} ${signed(stated)}`;
    const extra = saveBonuses(ability);
    const label = line ? line.trim().replace(/\s*[+−-]\s*\d{1,2}\s*$/u, "") : ABILITY[ability][ru ? "ru" : "en"];
    saves.push({ ability, label, value: base + extra.reduce((sum, row) => sum + row.value, 0), text: [head, ...extra.map((row) => `${signed(row.value)} ${row.name}`)].join(" ") });
  }
  return { ac, saves, attack, proficiency, savesNeedLevel };
}

const PEOPLE = new Set(["player", "companion", "npc"]);
/** One person's 5e numbers in this campaign (null: not a 5e campaign, or not a person); the fight's conditions add
 * Shield and the like. Without them the server's own result (attached to the public read) is read as it is. */
export function derivedSheetOf(data: Pick<CampaignSnapshot, "items" | "settings" | "campaign">, entity: Entity, fight?: { conditions: readonly string[]; ac?: number | null }): DerivedSheet | null {
  if (!PEOPLE.has(entity.kind) || !isFifthEdition(data.settings?.values?.rulesSystem)) return null;
  if (!fight && entity.derived) return entity.derived;
  return deriveSheet5e({ entity, items: data.items.filter((item) => item.campaign_id === data.campaign.id), fight: fight?.conditions, fightAc: fight?.ac ?? null, language: data.campaign.language });
}
/** The public campaign read with each person's 5e numbers attached (the server's; the screens read these). */
export function withDerivedSheets<T extends Pick<CampaignSnapshot, "items" | "settings" | "campaign" | "entities">>(snapshot: T): T {
  if (!isFifthEdition(snapshot.settings?.values?.rulesSystem)) return snapshot;
  return { ...snapshot, entities: snapshot.entities.map((entity) => {
    if (!PEOPLE.has(entity.kind)) return entity;
    const { derived: _old, ...plain } = entity;
    void _old;
    return { ...plain, derived: derivedSheetOf(snapshot, plain as Entity, { conditions: [] })! };
  }) };
}
