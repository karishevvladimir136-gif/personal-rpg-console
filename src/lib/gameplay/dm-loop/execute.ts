// Executes one dm-loop-v1 tool call against the shadow state. Every rule here
// guards data integrity (ownership, quantities, balances, bounds, exact-once
// rewards, fixed identities), never plausibility: the model is the DM.
// A rejected call returns a reason the model can act on; the turn continues.
import { HIDDEN_LAYER_KEY, ARCHIVE_INFIX, archiveKey, parseNoteValue, privateNotes, recallNotes, serializeNote } from "./private-notes.ts";
import { ERRAND_OFFERED_KEY } from "./clock.ts";
import { randomInt } from "node:crypto";
import type { JsonObject, TurnInput } from "../contracts.ts";
import type { Entity, EquipmentSlot, Item, ItemDetail, PublicProfile, Quest, QuestDetail, Storage } from "../../persistence/contracts.ts";
import { ITEM_KINDS, SLOT_REMAP, coinOf, counterLabel, counterLabelled, equipPlan, equippedBonuses, needsUniversalSlots, potionCounter, sameStack,
  universalSlots, walletOfStorage, counterKeyOf } from "../../inventory/model.ts";
import type { CheckAddend, RecordChange, RecordedCheck, RuntimeSource } from "../server-contracts.ts";
import { recordServerRoll, stableGameplayId, withNatural } from "../dice.ts";
import { basicProfile } from "../mechanics/profile.ts";
import { settledItemTransfer } from "../../progression/settlement-core.ts";
import { parseCharacterModel, type CharacterEvidence, type CharacterModel } from "../character-model.ts";
import { validateToolArguments } from "../../server/dm/model/schema-compiler.ts";
import { dmLoopLimits as L, PRIVATE_PATCHES_FOR_CALLS, turnCallCap, turnItemCap, type DmLoopTurnLimits } from "./limits.ts";
import { dmLoopTools, ITEM_CATEGORIES, ITEM_RARITIES, QUEST_KINDS, RELATION_GROUPS, TENSION_CLASSES } from "./tools.ts";
import { allPlans, duePlans, parsePlan, planKey, serializePlan, type OffScreenPlan } from "./plans.ts";
import { worldDay } from "./context.ts";
import { ShadowState, ToolReject, reject } from "./shadow.ts";
import { chip, currencyAmount, type ChipLanguage } from "./receipt-text.ts";
import { naturalHint } from "./standing-roll.ts";
import { patchSheet, sheetChanges, type AnySheet, type CharacterSheetV2, type SheetPatch } from "../../inventory/sheet.ts";
import { convertSpellProse, withCard } from "../../inventory/spell-records.ts";
import type { DmLoopMeta, DmLoopReceipt, DmLoopReceiptResult, DmLoopTension, DmLoopToolCall } from "./contracts.ts";
import type { EncounterParticipant } from "../contracts.ts";
import { combatantJson, DEFAULT_GRID, defaultEconomy, fieldJson, MAX_LOG, parseCombatant, parseFeature, parseField, parsePlacement, placementJson, type Combatant, type Field, type LogLine, type Side } from "../../live2d/battle/contracts.ts";
import { adjacentIds, cellDistance, distanceFeet, insideGrid, moveCost, sight, zoneFrom } from "../../live2d/battle/geometry.ts";
import { fightCard, type Fighter as BattleFighter } from "../../live2d/battle/battlefield.ts";
import { attackRuling, damageRuling, rulesOnByDefault, rulesText, type AppliedRule } from "../../live2d/battle/rules.ts";
import { conditionsText } from "../../live2d/battle/words.ts";
import { deriveSheet5e, endsAtOwnTurn, isFifthEdition } from "../../live2d/battle/rules-5e.ts";

export type ToolContext = {
  input: TurnInput;
  /** Checks recorded so far in this turn (the Check DTO allows eight). */
  checks: RecordedCheck[];
  random: (min: number, max: number) => number;
  /** Narration scene of this turn, known before commit (deterministic ID). */
  narrationSceneId: string;
  /** Calls already made this turn; past the cap every call is refused. */
  toolCalls: number;
  /** The campaign's per-turn limits as pinned when the turn started (stage 3). */
  limits: DmLoopTurnLimits;
  /** Polish: the campaign language for the player's chip lines. */
  language: ChipLanguage;
  /** Polish: the server's reading of this turn's tension (the player moment needs tense or climax). */
  tension: DmLoopTension;
  /** Receipts of this turn so far (finish_turn finds the roll a moment rests on). */
  receipts: DmLoopReceipt[];
  /** Whether DCs may be shown to the player (campaign setting). */
  showDc: boolean;
};


type Args = Record<string, unknown>;
const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const int = (value: unknown) => (typeof value === "number" && Number.isInteger(value) ? value : null);

function ok(value: JsonObject, summary: string, check: RecordedCheck | null = null, player: string | null = null): DmLoopReceiptResult {
  return { ok: true, value, summary, check, player };
}

/** The doll of every person record (fix run D: the eleven slots of the inventory model). */
export function humanoidSlots(language: string): EquipmentSlot[] {
  return universalSlots(language);
}
/** A person record whose doll is older (or empty) gets the eleven slots; what it wears stays on where a slot of the
 * new set takes it (neck → Амулет, ring1/ring2 → the rings), else it comes off and stays in the inventory. */
function ensureUniversalSlots(shadow: ShadowState, entity: Entity): Entity {
  if (!needsUniversalSlots(entity)) return entity;
  const slots = universalSlots(shadow.snapshot.settings.values.language);
  shadow.apply(entityChange(shadow, entity, { equipment_slots: slots as unknown as JsonObject[] }));
  const used = new Set<string>();
  for (const item of shadow.snapshot.items.filter((row) => row.campaign_id === shadow.campaignId && row.equipped_entity_id === entity.id)) {
    const remapped = item.equipped_slot ? (item.equipped_slot in SLOT_REMAP ? SLOT_REMAP[item.equipped_slot] : item.equipped_slot) : null;
    const slot = remapped ? slots.find((row) => row.id === remapped) : undefined;
    if (!slot || used.has(slot.id)) {
      shadow.apply({ family: "items", id: item.id, expectedRevision: item.revision, values: { equipped_entity_id: null, equipped_slot: null } });
      continue;
    }
    used.add(slot.id);
    const values: JsonObject = {};
    if (slot.id !== item.equipped_slot) values.equipped_slot = slot.id;
    if (!slot.accepts.includes(item.category)) values.category = slot.accepts[0];
    if (Object.keys(values).length) shadow.apply({ family: "items", id: item.id, expectedRevision: item.revision, values });
  }
  return shadow.entity(entity.id)!;
}

// Polish item 10: the currency is the world's own word in the campaign language,
// any script, trimmed, case-insensitive; inflected forms of one word (монета /
// монеты / монет, coin / coins) are one currency; the campaign keeps one
// canonical name — the first one recorded — and never rejects over language.
const currencyName = /^[\p{L}\p{M}]+(?:[ -][\p{L}\p{M}]+)*$/u;
export function normalizeCurrency(name: unknown): string {
  return str(name).toLocaleLowerCase().replace(/[«»"'“”]/g, "").replace(/\s+/g, " ").trim();
}
function sameWord(a: string, b: string): boolean {
  if (a === b) return true;
  let common = 0;
  while (common < a.length && common < b.length && a[common] === b[common]) common++;
  const restA = a.length - common, restB = b.length - common;
  // монета / монеты / монетами; coin / coins; silver piece / silver pieces — but not соль / солид.
  if (common >= 4) return restA <= 3 && restB <= 3;
  return common >= 3 && Math.min(restA, restB) === 0 && Math.max(restA, restB) <= 2;
}
/** Two currency names that are forms of the same word (word by word). */
export function sameCurrency(a: string, b: string): boolean {
  const left = normalizeCurrency(a).split(" "), right = normalizeCurrency(b).split(" ");
  return left.length === right.length && left.every((word, index) => sameWord(word, right[index]));
}
export function currencyKeyFor(label: string): string {
  return `currency_${label.replaceAll(" ", "_")}`;
}
/** The campaign's currencies already on any record (canonical labels). */
export function knownCurrencies(shadow: ShadowState): string[] {
  const labels = new Set<string>();
  for (const entity of shadow.snapshot.entities) {
    if (entity.campaign_id !== shadow.campaignId) continue;
    for (const key of Object.keys(entity.resources)) if (key.startsWith("currency_")) labels.add(key.slice("currency_".length).replaceAll("_", " "));
  }
  return [...labels];
}
export function currencyKey(shadow: ShadowState, name: unknown): { label: string; key: string } {
  const given = normalizeCurrency(name);
  reject(given.length >= 1 && given.length <= 32 && currencyName.test(given),
    `Currency "${str(name)}" must be a word or two in the campaign language (монеты, талеры, coins, silver pieces).`);
  const label = knownCurrencies(shadow).find((known) => sameCurrency(known, given)) ?? given;
  return { label, key: currencyKeyFor(label) };
}
export function moneyOf(entity: Entity, key: string): number {
  return Number(entity.resources[key] ?? 0);
}

function entityChange(shadow: ShadowState, entity: Entity, values: JsonObject): RecordChange {
  return { family: "entities", id: entity.id, expectedRevision: entity.revision, values };
}

/** The lower bound of a counter: a stored "<name>_min" (a ruleset's signed
 * counter such as reputation or momentum), otherwise 0 (stage task §2). */
export function resourceFloor(resources: Record<string, number>, key: string): number {
  const min = resources[`${key}_min`];
  return typeof min === "number" && Number.isInteger(min) ? min : 0;
}
function setResources(shadow: ShadowState, entity: Entity, resources: Record<string, number>) {
  for (const [key, value] of Object.entries(resources)) {
    const floor = resourceFloor(resources, key);
    reject(Number.isInteger(value) && value >= floor && value <= L.maxResourceValue,
      `${entity.name}: ${key} would become ${value}; it stays between ${floor} and ${L.maxResourceValue}.`);
  }
  shadow.apply(entityChange(shadow, entity, { resources }));
}
function publicProfileOf(entity: Entity): PublicProfile {
  return entity.public_profile && typeof entity.public_profile === "object" ? structuredClone(entity.public_profile) : {};
}
/** The public-profile fields of upsert_character (hero knowledge only). */
function profilePatch(shadow: ShadowState, args: Args, entity: Entity | null, kind: string, description: string | undefined): PublicProfile | null {
  const profile = entity ? publicProfileOf(entity) : {};
  let touched = false;
  if (args.relation !== undefined) {
    const relation = args.relation as { group: string; note: string };
    reject((RELATION_GROUPS as readonly string[]).includes(relation.group), `relation.group: ${RELATION_GROUPS.join(", ")}.`);
    profile.relation = { group: relation.group as NonNullable<PublicProfile["relation"]>["group"], note: str(relation.note) };
    touched = true;
  }
  if (args.important !== undefined) { profile.important = !!args.important; touched = true; }
  if (args.attitude !== undefined) {
    reject(kind === "companion", "attitude belongs to a companion (what the hero observes of them).");
    profile.attitude = { text: str(args.attitude), lastNoticed: String(shadow.now) };
    touched = true;
  }
  if (args.factionRef !== undefined) {
    const faction = entityOf(shadow, args.factionRef, "factionRef");
    reject(faction.kind === "faction", `${faction.name} is not a faction record.`, "Create the faction with upsert_character kind faction first.");
    profile.factionId = faction.id;
    touched = true;
  }
  if (args.homeRef !== undefined) {
    profile.homePlaceId = shadow.resolve(args.homeRef, ["locations"], "homeRef").id;
    touched = true;
  }
  if (kind === "faction") {
    const relation = profile.relation?.group;
    profile.faction = { publicNote: description ?? entity?.details ?? "",
      relation: relation === "ally" ? "ally" : relation === "foe" ? "foe" : relation === "neutral" || relation === "family" ? "neutral" : relation === "murky" ? "unknown" : profile.faction?.relation ?? "unknown" };
    touched = true;
  }
  return touched ? profile : null;
}

/** Dice formula: NdS with an optional +/- modifier. */
export function parseFormula(text: string): { count: number; sides: number; modifier: number } {
  const match = /^\s*(\d{1,2})\s*[dD]\s*(\d{1,4})\s*(?:([+-])\s*(\d{1,3}))?\s*$/.exec(text);
  reject(match, `"${text}" is not a dice formula like 1d20+3, 2d6 or 1d100.`);
  const count = Number(match[1]), sides = Number(match[2]);
  const modifier = match[3] ? (match[3] === "-" ? -1 : 1) * Number(match[4]) : 0;
  reject(count >= 1 && count <= 20 && sides >= 2 && sides <= 1000, "Roll 1–20 dice of 2–1000 sides.");
  return { count, sides, modifier };
}

/** OpenAI strict schemas make every field required, so an omitted optional
 * field arrives as null; it means the same as absent. */
function withoutNulls(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutNulls);
  if (value && typeof value === "object")
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .filter(([, child]) => child !== null).map(([key, child]) => [key, withoutNulls(child)]));
  return value;
}

function parseArgs(name: string, raw: JsonObject): Args {
  const tool = dmLoopTools.find((entry) => entry.name === name);
  reject(tool, `Unknown tool "${name}".`, `Available tools: ${dmLoopTools.map((t) => t.name).join(", ")}.`);
  const args = withoutNulls(raw) as JsonObject;
  const problems = validateToolArguments(tool, args);
  reject(problems.length === 0, `Arguments of ${name} are invalid: ${problems.slice(0, 6).join("; ")}.`);
  return args;
}

function entityOf(shadow: ShadowState, value: unknown, what: string): Entity {
  const ref = shadow.resolve(value, ["entities"], what);
  const entity = shadow.entity(ref.id);
  reject(entity, `${what}: character ${ref.id} not found.`);
  return entity;
}
function itemOf(shadow: ShadowState, value: unknown, what: string): Item {
  const ref = shadow.resolve(value, ["items"], what);
  const item = shadow.item(ref.id);
  reject(item, `${what}: item ${ref.id} not found.`);
  return item;
}
function questOf(shadow: ShadowState, value: unknown, what: string): Quest {
  const ref = shadow.resolve(value, ["quests"], what);
  const quest = shadow.quest(ref.id);
  reject(quest, `${what}: quest ${ref.id} not found.`);
  return quest;
}
function ownerName(shadow: ShadowState, item: Item): string {
  // Fix S3-pre 2.4: the player's chips and the item's history read these words — in the campaign language.
  const ru = shadow.snapshot.settings.values.language === "ru";
  return item.owner_entity_id ? shadow.entity(item.owner_entity_id)?.name ?? (ru ? "кто-то" : "someone") : ru ? "лагерь" : "the camp";
}
const localKey = (value: unknown) => (value === undefined ? null : str(value));

// --- roll ------------------------------------------------------------------
export const DIFFICULTY_LADDER = { easy: 8, normal: 10, hard: 13, very_hard: 16, nearly_impossible: 19 } as const;
/** Fix S3-pre B-4: the hero's Heroic Inspiration counter (one at a time, spent by a reroll). */
export const HEROIC_INSPIRATION = "heroic_inspiration";
export type DifficultyWord = keyof typeof DIFFICULTY_LADDER;
/** The sum of the fiction's bonuses never exceeds this (polish group 2 (e)). */
export const FICTION_BONUS_CAP = 6;

const normalizeSkill = (text: string) => text.toLocaleLowerCase().replace(/[«»"'“”]/g, "").replace(/\s+/g, " ").trim();
/** A word stem for matching a skill against a sheet line (Russian endings vary). */
function skillStems(text: string): string[] {
  return normalizeSkill(text).split(/[^\p{L}\p{N}]+/u).filter((word) => word.length >= 3)
    .map((word) => (word.length >= 7 ? word.slice(0, -3) : word.length >= 5 ? word.slice(0, -2) : word.length === 4 ? word.slice(0, -1) : word));
}
function mentions(line: string, skill: string): boolean {
  const lower = normalizeSkill(line);
  const stems = skillStems(skill);
  if (!stems.length) return false;
  // Every stem of the skill appears at a word start in the line, or the line's own words appear in the skill.
  const lineHas = (stem: string) => new RegExp(`(^|[^\\p{L}])${stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "u").test(lower);
  if (stems.every(lineHas)) return true;
  const lineStems = skillStems(line);
  return lineStems.length > 0 && lineStems.every((stem) => new RegExp(`(^|[^\\p{L}])${stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "u").test(normalizeSkill(skill)));
}
/** +2 for a skill the sheet names, +4 for one it calls good, +6 for mastery — in the sheet's own words — and the word
 * that decided it (null: named, no word). */
function proficiencyRead(text: string): { value: number; word: string | null } {
  const lower = text.toLocaleLowerCase();
  const master = /мастер|master|expert|виртуоз|легендарн|legendary/.exec(lower);
  if (master) return { value: 6, word: master[0] };
  const good = /хорош|опытн|skilled|experienced|proficient|\bgood\b|\bwell\b|умел|искусн|отличн/.exec(lower);
  return good ? { value: 4, word: good[0] } : { value: 2, word: null };
}
export function proficiencyValue(text: string): number {
  return proficiencyRead(text).value;
}
/** Fix S4 11a: a signed number on a sheet line — «+7», «-1», «−2» (the minus sign) — never a die's bonus inside a
 * formula («1d20+3»), a die count («+1d6») or a part of a longer number. */
const SIGNED_NUMBER = /(?<!\p{N})([+−-])\s?(\d+)(?!\d|\s?[dкдDКД]\d)/gu;
const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** Where the skill's name ends on its line: after the word of the skill that comes first there («Persuasion» of
 * «Persuasion (Beguiling Influence)» — the notes after the number may repeat the skill's other words); 0 when none of
 * the skill's words is on the line (the line's own words name the skill). */
function skillNameEnd(line: string, skill: string): number {
  let first: { index: number; end: number } | null = null;
  for (const stem of skillStems(skill)) {
    const found = new RegExp(`(^|[^\\p{L}])${escapeRegex(stem)}\\p{L}*`, "iu").exec(line);
    if (found && (!first || found.index < first.index)) first = { index: found.index, end: found.index + found[0].length };
  }
  return first?.end ?? 0;
}
/** Fix S4 11a: the first signed number after the skill's name on its line — «Persuasion +7 (proficient, Beguiling
 * Influence)» is +7. The drafted sheet writes the number before its notes; the old reader took a number only at the end
 * of the line and fell back to the sheet's words, so every card of a table got that table's constant (+2 or +4). */
function lineNumber(line: string, skill: string): { value: number; name: string } | null {
  SIGNED_NUMBER.lastIndex = skillNameEnd(line, skill);
  const found = SIGNED_NUMBER.exec(line);
  SIGNED_NUMBER.lastIndex = 0;
  if (!found) return null;
  const value = (found[1] === "+" ? 1 : -1) * Number(found[2]);
  return { value, name: line.slice(0, found.index).replace(/[\s,;:([]+$/u, "").trim() };
}
/** Fix S4 11a: a sheet bonus with where it came from — `basis` is the record's own words for its source: «sheet:
 * Persuasion +7 (Beguiling Influence)» (the number on the line), «sheet words: proficient +4 — …» (no number: the
 * sheet's words), «stat: stealth +3» (a numeric stat), «background words: …» (the trade named in the background). */
export type SheetBonusRead = { value: number; source: string; basis: string };
export function readSheetBonus(actor: Entity, skill: string, kind: string | null = null): SheetBonusRead | null {
  const wanted = normalizeSkill(skill);
  if (!wanted) return null;
  const signed = (value: number) => `${value >= 0 ? "+" : ""}${value}`;
  for (const [key, value] of Object.entries(actor.stats)) {
    if (!Number.isInteger(value) || key === "level") continue;
    if (normalizeSkill(key) === wanted || normalizeSkill(key).replaceAll("_", " ") === wanted)
      return { value, source: `${skill} ${signed(value)}`, basis: `stat: ${key} ${signed(value)}` };
  }
  const sheet = actor.character_sheet;
  // Fix S3-pre A-9: a saving throw reads the sheet's own saves first («Ловкость +4»), then the skills and abilities.
  const save = kind === "save" || /спасброс|saving throw|(^|[^\p{L}])save($|[^\p{L}])/iu.test(skill);
  const saves = save && sheet && "saves" in sheet ? sheet.saves ?? [] : [];
  const lines = [...saves, ...(sheet?.skills ?? []), ...(sheet?.abilities ?? [])];
  for (const line of lines) {
    if (!mentions(line, skill)) continue;
    const numbered = lineNumber(line.trim(), skill);
    if (numbered) return { value: numbered.value, source: `${numbered.name || skill} ${signed(numbered.value)}`, basis: `sheet: ${line.trim().slice(0, 80)}` };
    const words = proficiencyRead(line);
    return { value: words.value, source: `${line.trim().slice(0, 60)} +${words.value}`,
      basis: `sheet words: ${words.word ?? "named"} +${words.value} — ${line.trim().slice(0, 60)}` };
  }
  const prose = [sheet?.role ?? "", sheet?.background ?? "", actor.details].join("\n");
  if (mentions(prose, skill)) {
    // The trade or trait is named in the background: at least a named skill.
    const words = proficiencyRead(prose.split("\n").find((line) => mentions(line, skill)) ?? "");
    return { value: words.value, source: `${skill.trim().slice(0, 60)} +${words.value}`, basis: `background words: ${words.word ?? "named"} +${words.value} — ${skill.trim().slice(0, 60)}` };
  }
  return null;
}
/** The bonus a skill named on the sheet gives: a numeric stat of that name, the first signed number after the skill's
 * name on its sheet line («Плавание +2», «Persuasion +7 (proficient, Beguiling Influence)»), or the sheet's words
 * (умеет / хорошо / мастер → +2 / +4 / +6) on a line without a number; the trade in the background counts as named. */
export function sheetBonus(actor: Entity, skill: string, kind: string | null = null): { value: number; source: string } | null {
  const read = readSheetBonus(actor, skill, kind);
  return read ? { value: read.value, source: read.source } : null;
}

/** Fix S3-pre B-17 (the owner's rule): the wound follows the hit points left — the band word the receipts carry so the
 * story tells a man at 1 HP as badly hurt, never as untouched. */
export function hpBand(after: number, max: number): "unhurt" | "lightly wounded" | "bloodied" | "badly hurt" | "down" {
  if (after <= 0) return "down";
  if (after >= max) return "unhurt";
  if (after * 4 <= max) return "badly hurt";
  if (after * 2 <= max) return "bloodied";
  return "lightly wounded";
}

/** Fix run A3: the damage of a bundled pair — an attack with its damage (rolled only on a hit; a natural
 * 20 doubles the dice, a natural 1 always misses) or a save with its effect (full on a failure, half on a
 * success with halfOnSave) — and its application to the target's hit points. One call instead of two
 * requests: the mine fight of session 2 made one request per die. */
function bundledDamage(shadow: ShadowState, args: Args, ctx: ToolContext, roll: { actor: Entity | null; kind: string; dc: number | null;
  success: boolean | null; natural: "crit" | "fumble" | null }): { value: JsonObject; summary: string; player: string | null } | null {
  if (args.damage === undefined) return null;
  reject(roll.dc !== null && roll.success !== null, "damage needs an attack against a defence (dc) or a save against a difficulty.",
    "Pass dc (the target's defence for an attack, the difficulty for a save) or roll the damage on its own.");
  const formula = parseFormula(str(args.damage));
  const save = roll.kind === "save";
  const hit = save ? true : roll.natural === "crit" ? true : roll.natural === "fumble" ? false : roll.success === true;
  const critical = !save && roll.natural === "crit";
  const target = args.targetRef !== undefined ? entityOf(shadow, args.targetRef, "targetRef") : save ? roll.actor : null;
  if (!hit) return { value: { formula: str(args.damage), hit: false, total: 0, target: target?.name ?? null }, summary: "miss, no damage", player: null };
  const count = critical ? formula.count * 2 : formula.count;
  const dice = Array.from({ length: count }, () => ctx.random(1, formula.sides + 1));
  reject(dice.every((die) => Number.isInteger(die) && die >= 1 && die <= formula.sides), "The dice source misbehaved.");
  const rolled = Math.max(0, dice.reduce((sum, die) => sum + die, 0) + formula.modifier);
  const total = save ? (roll.success ? (args.halfOnSave === true ? Math.floor(rolled / 2) : 0) : rolled) : rolled;
  const value: JsonObject = { formula: str(args.damage), hit: true, critical, dice, rolled, total, ...(save ? { saved: roll.success, halfOnSave: args.halfOnSave === true } : {}),
    target: target?.name ?? null };
  let applied = "";
  let player: string | null = null;
  if (target && total > 0) {
    if (target.max_hp === null && target.hp === null) {
      value.applied = null;
      value.note = `${target.name} has no hit points on record; give them with resource hp max (from the stat block), then subtract this damage.`;
    } else {
      const max = target.max_hp ?? target.hp ?? 0;
      const before = target.hp ?? max;
      const after = Math.max(0, before - total);
      shadow.apply(entityChange(shadow, target, { hp: after, max_hp: max }));
      mirrorFightHp(shadow, target, after, max, before - after, str(args.reason), roll.actor, ctx.language);
      value.applied = { target: target.name, before, after, max, band: hpBand(after, max) };
      applied = `; ${target.name} ${before} → ${after}/${max} (${hpBand(after, max)})`;
      const controlled = new Set(shadow.runtime.configuration?.controlledEntityIds ?? [shadow.hero().id]);
      if (controlled.has(target.id)) player = chip.hp(ctx.language, target.name, isHero(target), before, after, max, str(args.reason));
      // Fix run B3 («Твой момент» never fired in session 2): the party's blow that drops a foe is the player's moment —
      // the result says so, so the DM hands the finishing description over instead of writing it.
      if (after === 0 && before > 0 && roll.actor && controlled.has(roll.actor.id) && !controlled.has(target.id))
        value.playerMoment = `${target.name} drops: the player's moment. Narrate up to the blow, stop before the finishing description, ask the player how they do it («Как ты это делаешь?»), and set playerMoment in finish_turn.`;
    }
  }
  return { value, summary: `damage ${str(args.damage)}${critical ? " doubled" : ""}: ${total}${applied}`, player };
}

function roll(shadow: ShadowState, args: Args, ctx: ToolContext): DmLoopReceiptResult {
  const formula = parseFormula(str(args.formula));
  const actorText = str(args.actorRef);
  const kindText = str(args.kind) || "skill";
  // Fix S3-pre (opening attacks): the first attack between two people opens the fight on the server, so the opening
  // blows are the fight's too; a person it names before any record is recorded bare (the bookkeeper completes them).
  // Only where the campaign's system has the rules module (the owner's 5e): elsewhere a fight would add nothing to the
  // roll (and the plain roll's natural 20 still doubles the dice), so the fight opens with combat start as before.
  let opened = false;
  const rulesSystem = `${shadow.snapshot.settings.values.rulesSystem?.label ?? ""} ${shadow.snapshot.settings.values.rulesSystem?.id ?? ""}`;
  if (kindText === "attack" && args.targetRef !== undefined && actorText.toLowerCase() !== "dm" && !fightRows(shadow).active && rulesOnByDefault(rulesSystem)) {
    const a = fightPersonOf(shadow, actorText, "actorRef"), t = fightPersonOf(shadow, args.targetRef, "targetRef");
    if (a && t) {
      const attacker = recordFightPerson(shadow, ctx, a), target = recordFightPerson(shadow, ctx, t);
      reject(attacker.id !== target.id, "attack: the target is the attacker.");
      openFightOnAttack(shadow, ctx, attacker, target);
      opened = true;
    }
  }
  // A fight its first attack opened takes in the people the next blows of the opening name (no one set it up yet).
  const openedFight = kindText === "attack" && !!fightRows(shadow).active && fightRows(shadow).fieldOf().openedByAttack === true;
  const actorPerson = openedFight && actorText.toLowerCase() !== "dm" ? fightPersonOf(shadow, actorText, "actorRef") : null;
  const actor = actorText.toLowerCase() === "dm" ? null : actorPerson ? recordFightPerson(shadow, ctx, actorPerson) : entityOf(shadow, actorText, "actorRef");
  // Fix S3-pre 1: in the open fight an attack is the fight's — resolved on the server against the battlefield and the
  // rules module, whoever rolls it (the writer of «пишет — записывает» has only this dice tool), never a bare d20.
  let inFight: { fight: FightRows; field: Field; fighters: BattleFighter[]; a: FightSide; t: FightSide } | null = null;
  let joined: string[] = [];
  if (kindText === "attack") {
    const fight = fightRows(shadow);
    if (fight.active) {
      reject(args.targetRef !== undefined, "In the open fight an attack names its target (targetRef) and carries its damage (damage); the server resolves it on the battlefield.",
        "Roll each attack with kind attack, actorRef, targetRef, damage and the weapon or spell (weapon) — never a bare d20.");
      const lookup = openedFight ? fightPersonOf(shadow, args.targetRef, "targetRef") : null;
      const target = lookup ? recordFightPerson(shadow, ctx, lookup) : entityOf(shadow, args.targetRef, "targetRef");
      let fighters = fight.rows().map(fight.fighterOf);
      const join = (entity: Entity) => {
        joinFight(shadow, ctx, fight.active!.id, entity, Math.max(0, ...fighters.map((row) => row.turnOrder)) + 1, false);
        joined.push(entity.name);
        fighters = fight.rows().map(fight.fighterOf);
      };
      if (openedFight && !fighters.some((row) => row.entityId === target.id)) join(target);
      const tf = fighters.find((row) => row.entityId === target.id) ?? null;
      if (tf) {
        reject(actor, "In the open fight an attack names its attacker (actorRef), never \"dm\".");
        if (openedFight && !fighters.some((row) => row.entityId === actor.id)) join(actor);
        const af = fighters.find((row) => row.entityId === actor.id) ?? null;
        reject(af, `${actor.name} is not in this fight.`, "The bookkeeper adds a late arrival with combat place; narrate the attack after that.");
        inFight = { fight, field: fight.fieldOf(), fighters, a: { entity: actor, fighter: af }, t: { entity: target, fighter: tf } };
      } else joined = [];
    }
  }
  // Fix S3-pre 1: an attack named by its weapon or spell takes the bonus and the damage from the sheet, the gear, or this fight.
  const weaponText = kindText === "attack" ? str(args.weapon) : "";
  const named = actor && weaponText ? namedAttack(shadow, actor, weaponText, inFight?.a.fighter.combatant ?? null) : null;
  const weaponBonus = named?.bonus ?? null;
  // Fix run B3 (item 66): the sheet's skill or stat already carries the bonus — a formula modifier on top of it was
  // session 2's doubled modifier. It is dropped and the receipt says so.
  const fromSheet = weaponBonus !== null || args.modifierField !== undefined || args.skill !== undefined;
  const droppedModifier = fromSheet && formula.modifier !== 0 ? formula.modifier : 0;
  let modifier = fromSheet ? 0 : formula.modifier;
  /** The attack's own bonus (the formula's, the sheet's or the weapon's), without the fiction and the worn items: what a fight remembers. */
  let baseBonus = modifier;
  const sources: string[] = [];
  let modifierSource: string | null = null;
  let sheetBasis: string | null = null;
  // Fix run C (item 66): each part of the modifier with its own source, for the roll card.
  const addends: CheckAddend[] = !fromSheet && formula.modifier ? [{ source: str(args.formula), value: formula.modifier, kind: "formula" }] : [];
  if (weaponBonus !== null) {
    modifier += weaponBonus;
    baseBonus += weaponBonus;
    modifierSource = `${named!.source} ${weaponBonus >= 0 ? "+" : ""}${weaponBonus}`;
    sources.push(modifierSource);
    addends.push({ source: named!.source, value: weaponBonus, kind: "sheet" });
  }
  if (weaponBonus === null && args.modifierField !== undefined) {
    reject(actor, "A sheet modifier needs an actor (actorRef is \"dm\").");
    const field = str(args.modifierField);
    const value = actor.stats[field];
    reject(typeof value === "number" && Number.isInteger(value),
      `${actor.name} has no sheet stat "${field}".`,
      Object.keys(actor.stats).length ? `Known stats: ${Object.keys(actor.stats).join(", ")}.` : "The sheet has no numeric stats; pass skill (the skill or trade as the sheet names it) instead.");
    modifier += value;
    baseBonus += value;
    modifierSource = `${field} ${value >= 0 ? "+" : ""}${value}`;
    sources.push(modifierSource);
    addends.push({ source: field, value, kind: "sheet" });
  }
  if (weaponBonus === null && args.skill !== undefined) {
    reject(actor, "A sheet skill needs an actor (actorRef is \"dm\").");
    const skill = str(args.skill);
    const bonus = readSheetBonus(actor, skill, kindText);
    const sheetSaves = kindText === "save" && actor.character_sheet && "saves" in actor.character_sheet ? actor.character_sheet.saves ?? [] : [];
    const known = [...sheetSaves, ...(actor.character_sheet?.skills ?? []), ...Object.keys(actor.stats).filter((key) => key !== "level")];
    reject(bonus, `${actor.name}'s sheet names no skill or trade like "${skill}".`,
      `${known.length ? `The sheet names: ${known.slice(0, 12).join("; ")}. ` : ""}Use the sheet's own words, or roll without skill and give the fiction's bonuses with their sources.`);
    modifier += bonus.value;
    baseBonus += bonus.value;
    modifierSource = modifierSource ? `${modifierSource}, ${bonus.source}` : bonus.source;
    sources.push(bonus.source);
    // Fix S4 11a: the sheet's part of the modifier keeps where it came from (the line's number or the sheet's words).
    sheetBasis = bonus.basis;
    addends.push({ source: bonus.source.replace(/\s[+−-]\d+$/u, "") || skill, value: bonus.value, kind: "sheet", basis: bonus.basis });
  }
  // The fiction's bonuses (tools, help, prepared gear, position), capped as a sum.
  const bonuses: { source: string; value: number }[] = [];
  let clipped = false;
  if (Array.isArray(args.bonuses) && args.bonuses.length) {
    let sum = 0;
    for (const entry of args.bonuses as { source: unknown; value: unknown }[]) {
      const value = int(entry.value) ?? 0;
      const source = str(entry.source);
      reject(source.length > 0 && value >= -FICTION_BONUS_CAP && value <= FICTION_BONUS_CAP, `Each bonus needs a source and a value between -${FICTION_BONUS_CAP} and +${FICTION_BONUS_CAP}.`);
      bonuses.push({ source, value });
      sum += value;
    }
    const capped = Math.max(-FICTION_BONUS_CAP, Math.min(FICTION_BONUS_CAP, sum));
    clipped = capped !== sum;
    modifier += capped;
    addends.push(...bonuses.map((bonus) => ({ source: bonus.source, value: bonus.value, kind: "fiction" as const })));
    if (clipped) addends.push({ source: `cap ±${FICTION_BONUS_CAP}`, value: capped - sum, kind: "cap" });
    sources.push(...bonuses.map((b) => `${b.source} ${b.value >= 0 ? "+" : ""}${b.value}`));
  }
  // Fix run D (§3): what the actor wears or holds adds its own bonuses, outside the fiction's cap, with the item as
  // source; a fiction bonus naming the same item is dropped (session 2's ring counted twice).
  if (actor) {
    const worn = equippedBonuses(shadow.snapshot.items.filter((row) => row.campaign_id === shadow.campaignId), actor.id, `${str(args.reason)} ${str(args.skill)}`);
    for (const bonus of worn) {
      const itemName = bonus.source.replace(/\s[+-]\d+$/, "").toLocaleLowerCase();
      const dup = bonuses.findIndex((row) => row.source.toLocaleLowerCase().includes(itemName));
      if (dup >= 0) {
        const [removed] = bonuses.splice(dup, 1);
        const at = sources.indexOf(`${removed.source} ${removed.value >= 0 ? "+" : ""}${removed.value}`);
        if (at >= 0) sources.splice(at, 1);
        modifier -= removed.value;
        const gone = addends.findIndex((row) => row.kind === "fiction" && row.source === removed.source && row.value === removed.value);
        if (gone >= 0) addends.splice(gone, 1);
      }
      modifier += bonus.value;
      sources.push(bonus.source);
      addends.push({ source: bonus.source.replace(/\s[+−-]\d+$/u, ""), value: bonus.value, kind: "gear" });
    }
  }
  reject(modifier >= -100 && modifier <= 100, "The total modifier must stay between -100 and +100.");
  // Fix S3-pre B-4: the player spends Heroic Inspiration — this roll is the reroll of the hero's die; the server spends it.
  let inspired = false;
  if (args.heroicInspiration === true) {
    // Multi-hero 1: at a company table every player character holds and spends their own.
    reject(actor && shadow.isPlayerCharacter(actor), shadow.company ? "Heroic Inspiration rerolls a player character's own die: actorRef is that character."
      : "Heroic Inspiration rerolls the hero's own die: actorRef is the hero.");
    const left = Number(actor.resources[HEROIC_INSPIRATION] ?? 0);
    reject(left >= 1, `${actor.name} has no Heroic Inspiration to spend.`, "Without it the die stands; narrate its result.");
    setResources(shadow, actor, { ...actor.resources, [HEROIC_INSPIRATION]: 0, [`${HEROIC_INSPIRATION}_max`]: 1 });
    inspired = true;
  }
  // Fix run D (§6): a ranged attack spends one arrow or bolt per roll, hit or miss; none left — no shot.
  let ammunition: { name: string; before: number } | null = null;
  if (args.ammunitionRef !== undefined) {
    reject(actor, "Ammunition needs an actor (actorRef is \"dm\").");
    const ammo = itemOf(shadow, args.ammunitionRef, "ammunitionRef");
    reject(ammo.owner_entity_id === actor.id || itemDetail(ammo).holderId === actor.id, `${ammo.name} is not ${actor.name}'s.`);
    reject(ammo.quantity >= 1, shadow.snapshot.settings.values.language === "ru" ? `${ammo.name}: не осталось ни одного.` : `${ammo.name}: none left.`,
      "The shot cannot be made; narrate the empty quiver or another action.");
    // The applier updates the row in place: the count before the shot is taken first.
    ammunition = { name: ammo.name, before: ammo.quantity };
    shadow.apply({ family: "items", id: ammo.id, expectedRevision: ammo.revision, values: { quantity: ammo.quantity - 1,
      detail: withHistory(itemDetail(ammo), shadow.now, "consumed", str(args.reason)) as unknown as JsonObject } });
  }
  const advantage = (str(args.advantage) || "normal") as RecordedCheck["advantage"];
  reject(advantage === "normal" || formula.count === 1, "Advantage and disadvantage apply to a single die only.");
  const advantageReason = args.advantageReason !== undefined ? str(args.advantageReason) || null : null;
  const controlled = new Set(shadow.runtime.configuration?.controlledEntityIds ?? [shadow.hero().id]);
  // A check of the hero or a companion is the player's; an NPC's or the world's roll stays private (polish group 2).
  const visibility: "player" | "private" = actor && controlled.has(actor.id) ? "player" : "private";
  const difficulty = args.difficulty !== undefined ? str(args.difficulty) as DifficultyWord : null;
  reject(difficulty === null || difficulty in DIFFICULTY_LADDER, `difficulty: ${Object.keys(DIFFICULTY_LADDER).join(", ")}.`);
  const dc = int(args.dc) ?? (difficulty ? DIFFICULTY_LADDER[difficulty] : null);
  if (inFight) {
    const fought = fightRoll(shadow, args, ctx, inFight, { actor: actor!, formula, modifier, baseBonus, addends, bonuses, sourceText: sources.join(", ") || null,
      dc, advantage, advantageReason, visibility, weapon: weaponText, named, droppedModifier, ammunition });
    const note = [opened ? OPENED_FIGHT : "", joined.length ? `${joined.join(", ")} joined the fight its first attack opened.` : ""].filter(Boolean).join(" ");
    return withInspiration(note && fought.ok ? { ...fought, value: { ...fought.value, ...(opened ? { openedFight: true } : {}), ...(joined.length ? { joinedFight: joined } : {}) },
      summary: `${fought.summary} ${note}` } : fought, inspired, ctx.language);
  }
  // Outside a fight, a weapon's damage from the sheet stands in for a damage the call does not give.
  if (named?.damage && args.damage === undefined) args = { ...args, damage: named.damage };
  // A recorded check (the Check DTO, the roll card, the interactive pause) is the
  // player's; an NPC's d20 against a difficulty resolves as a plain private roll
  // (a person created in this very message is not in the database yet).
  const isCheck = formula.count === 1 && formula.sides === 20 && dc !== null && actor !== null && visibility === "player";
  const reason = str(args.reason);
  const sourceText = sources.join(", ") || null;
  const bonusLine = (die: number) => ({
    ...(naturalHint(die) ? { hint: naturalHint(die)! } : {}),
    ...(clipped ? { note: `The fiction's bonuses are capped at ±${FICTION_BONUS_CAP} in total.` } : {}),
    ...(droppedModifier && droppedModifier !== weaponBonus ? { modifierDropped: `The formula's ${droppedModifier > 0 ? "+" : ""}${droppedModifier} was dropped: ${named && weaponBonus !== null ? `${named.source} gives the bonus` : "the sheet's skill or stat already gives the bonus"} (never both).` } : {}),
  });
  if (isCheck) {
    reject(ctx.checks.length < L.maxChecksPerTurn, `This turn already made ${L.maxChecksPerTurn} checks.`,
      "Narrate the remaining outcomes without a new check.");
    const kind: RecordedCheck["kind"] = kindText === "attack" ? "attack" : kindText === "save" ? "save" : "skill";
    const proposal = {
      index: ctx.checks.length, actorId: actor.id, targetId: null, kind, stat: kind,
      dc, dcPublic: true, visibility, important: true, uncertainty: "meaningful" as const, advantage,
      reason, bonuses, advantageReason, difficulty, natural: null as RecordedCheck["natural"],
      // The parts sum to the modifier (a fiction bonus over the cap shows its «cap» part); none when there is no modifier.
      ...(addends.length && addends.reduce((sum, row) => sum + row.value, 0) === modifier ? { addends: addends.slice(0, 10) } : {}),
    };
    // Fix run B3 (the owner's rule, BG3): on a check or a save a natural 20 succeeds and a natural 1 fails (one helper with the reroll, fix S3-pre B-1).
    const check = withNatural(recordServerRoll(ctx.input.operationId, proposal, modifier, 1, ctx.random));
    const natural = check.natural ?? null;
    const damage = bundledDamage(shadow, args, ctx, { actor, kind, dc, success: check.success, natural });
    // Fix S4 11v: the table's one Inspiration rule, in code (a roll that spends Heroic Inspiration is a reroll: no award).
    const award = natural === "crit" && !inspired ? inspirationAward(shadow, actor, kind, str(args.skill) || reason, ctx.language) : null;
    const value: JsonObject = { formula: str(args.formula), reason, actor: actor.name, visibility,
      dice: [...check.dice], kept: check.kept, modifier, modifierSource: sourceText, ...(sheetBasis ? { modifierBasis: sheetBasis } : {}), bonuses, advantage, advantageReason,
      difficulty, total: check.total, dc, success: check.success, natural, checkId: check.id, ...bonusLine(check.kept), ...(damage ? { damage: damage.value } : {}),
      ...ammunitionValue(ammunition), ...(award ? { inspirationAward: award.value } : {}) };
    const rolledChip = visibility === "player"
      ? chip.roll(ctx.language, actor.name, actor.kind === "player" && !shadow.company, reason, check.total, dc, ctx.showDc, check.success, natural) : null;
    const shown = rolledChip ? withAmmunition(withDamageChip(ctx.language, rolledChip, damage), ammunition) : null;
    const player = shown && award ? `${shown} · ${award.player}` : shown;
    return withInspiration(ok(value, `${actor.name} rolls ${str(args.formula)}${sourceText ? ` (${sourceText})` : ""}: ${check.total} vs ${dc} — ${check.success ? "success" : "failure"}${natural === "crit" ? " (natural 20)" : natural === "fumble" ? " (natural 1)" : ""}${damage ? `; ${damage.summary}` : ""}${award ? `; ${award.summary}` : ""}`, check, player), inspired, ctx.language);
  }
  const count = advantage === "normal" ? formula.count : 2;
  const dice = Array.from({ length: count }, () => ctx.random(1, formula.sides + 1));
  reject(dice.every((die) => Number.isInteger(die) && die >= 1 && die <= formula.sides), "The dice source misbehaved.");
  const kept = advantage === "normal" ? dice.reduce((sum, die) => sum + die, 0)
    : advantage === "advantage" ? Math.max(...dice) : Math.min(...dice);
  const total = kept + modifier;
  const natural = formula.count === 1 && formula.sides === 20 ? (kept === 20 ? "crit" : kept === 1 ? "fumble" : null) : null;
  // Fix run B3: a natural 20 succeeds and a natural 1 fails against any difficulty (attacks already hit and miss so).
  const success = dc === null ? null : natural === "crit" ? true : natural === "fumble" ? false : total >= dc;
  const damage = bundledDamage(shadow, args, ctx, { actor, kind: kindText, dc, success, natural });
  const value: JsonObject = { formula: str(args.formula), reason, actor: actor?.name ?? "DM", visibility,
    dice, kept, modifier, modifierSource: sourceText, ...(sheetBasis ? { modifierBasis: sheetBasis } : {}), bonuses, advantage, advantageReason, difficulty, total, dc, success, natural, ...bonusLine(natural ? kept : 0),
    ...(damage ? { damage: damage.value } : {}), ...ammunitionValue(ammunition), ...rangedHint(shadow, actor, kindText, reason, ammunition) };
  const rolledChip = visibility === "player" && actor
    ? chip.roll(ctx.language, actor.name, actor.kind === "player" && !shadow.company, reason, total, dc, ctx.showDc, success, natural) : null;
  // A hit on the hero or a companion is theirs to see even when the attacker's roll is private.
  const player = rolledChip ? withAmmunition(withDamageChip(ctx.language, rolledChip, damage), ammunition) : damage?.player ?? null;
  return withInspiration(ok(value, `${actor?.name ?? "The DM"} rolls ${str(args.formula)}${sourceText ? ` (${sourceText})` : ""}: ${total}${dc !== null ? ` vs ${dc} — ${success ? "success" : "failure"}` : ""}${damage ? `; ${damage.summary}` : ""}`, null, player), inspired, ctx.language);
}

/** Fix S4 11v (one Inspiration rule — the DM had granted it by mood: twice in eight sessions, withheld on two natural
 * 20s): a natural 20 on a check the DM called for the hero — a skill check or a saving throw the player sees — grants
 * Heroic Inspiration when the hero has none (one at a time, max 1); when the hero already holds it, the record says it
 * was withheld and why. The roll's receipt and the player's chip name the reason either way. An attack roll is not a
 * called check (its natural 20 doubles the damage dice). A reroll's natural 20 does not count — neither the player's
 * allowed reroll nor a roll that spends Heroic Inspiration: the award is decided once, on the die the DM called; a
 * reroll is the player's second chance, often bought with the Inspiration itself, and a grant there would hand back
 * what was just spent (the reroll's record says so: standing-roll.ts). Any other grant is the DM's, through the
 * resource tool with its named trigger in the reason (TABLE_RULES). */
function inspirationAward(shadow: ShadowState, actor: Entity, kind: RecordedCheck["kind"], named: string, language: ChipLanguage):
  { value: JsonObject; summary: string; player: string } | null {
  if (!shadow.isPlayerCharacter(actor) || kind === "attack" || shadow.snapshot.settings.values.dicePresentation === "hidden") return null;
  const hero = shadow.entity(actor.id) ?? actor;
  const what = named.split(":")[0].trim().slice(0, 60) || (language === "ru" ? (kind === "save" ? "спасбросок" : "проверка") : (kind === "save" ? "a saving throw" : "a check"));
  const why = `natural 20 on ${what}`;
  const label = counterLabel(hero, HEROIC_INSPIRATION, language);
  if (Number(hero.resources[HEROIC_INSPIRATION] ?? 0) >= 1)
    return { value: { granted: false, reason: "already held", why, note: `${shadow.company ? hero.name : "The hero"} already holds Heroic Inspiration (one at a time): this natural 20 grants none, and the record says so.` },
      summary: `Heroic Inspiration withheld: already held (${why})`, player: chip.inspirationWithheld(language, label, what) };
  setResources(shadow, hero, { ...hero.resources, [HEROIC_INSPIRATION]: 1, [`${HEROIC_INSPIRATION}_max`]: 1 });
  return { value: { granted: true, before: 0, after: 1, max: 1, why, note: `The server granted ${shadow.company ? hero.name : "the hero"} Heroic Inspiration for this natural 20 (the table's rule): never grant it again with resource.` },
    summary: `Heroic Inspiration granted by the server (${why}): 0 → 1`, player: chip.inspirationGranted(language, label, what) };
}

/** Fix S3-pre B-4: a roll that spent Heroic Inspiration says so on the receipt and on the player's line. */
function withInspiration(result: DmLoopReceiptResult, inspired: boolean, language: ChipLanguage): DmLoopReceiptResult {
  if (!inspired || !result.ok) return result;
  const word = language === "ru" ? "Героическое вдохновение потрачено" : "Heroic Inspiration spent";
  return { ...result, value: { ...result.value, heroicInspiration: { before: 1, after: 0 } }, summary: `${result.summary}; Heroic Inspiration spent (1 → 0)`,
    player: result.player ? `${result.player} · ${word}` : word };
}

/** Fix S3-pre 1: the roll of an attack in the open fight — its bonus as the roll computed it, its armour class, cover,
 * rules and hit points from the battlefield (the same resolution as combat attack); the receipt keeps the roll's shape
 * (actor, reason, damage with what was applied) so the bookkeeper's brief and the checks read it as any roll. */
function fightRoll(shadow: ShadowState, args: Args, ctx: ToolContext, at: { fight: FightRows; field: Field; fighters: BattleFighter[]; a: FightSide; t: FightSide },
  roll: { actor: Entity; formula: { count: number; sides: number; modifier: number }; modifier: number; baseBonus: number; addends: CheckAddend[]; bonuses: { source: string; value: number }[];
    sourceText: string | null; dc: number | null; advantage: RecordedCheck["advantage"]; advantageReason: string | null; visibility: "player" | "private";
    weapon: string; named: ReturnType<typeof namedAttack>; droppedModifier: number; ammunition: { name: string; before: number } | null }): DmLoopReceiptResult {
  reject(roll.formula.count === 1 && roll.formula.sides === 20, "An attack is one d20 (1d20 with the bonus); its damage goes in damage, rolled by the server on a hit.");
  const damage = str(args.damage) || roll.named?.damage || "";
  reject(damage.length > 0, "In the open fight an attack carries its damage formula (damage: 1d8+3); the server rolls it only on a hit — never as a second roll.",
    roll.weapon ? undefined : "Name the weapon or spell (weapon) to take its numbers from the sheet, or give damage.");
  const reason = str(args.reason);
  const ranged = args.ranged === true || args.ammunitionRef !== undefined;
  const memory = roll.named?.from === "fight" ? roll.named : null;
  const attack = fightAttack(shadow, ctx, at.fight, at.field, at.fighters, at.a, at.t, {
    bonus: roll.modifier, ac: roll.dc, preferGiven: false, damage, damageType: str(args.damageType) || roll.named?.damageType || null, ranged, count: 1, reason,
    addends: roll.addends, bonuses: roll.bonuses, fiction: { advantage: roll.advantage, reason: roll.advantageReason } });
  // The fight remembers a weapon the sheet and the gear do not describe: the next attack with it keeps these numbers.
  if (roll.weapon && !roll.named) {
    const combatant = at.a.fighter.combatant;
    combatant.attacks = [...(combatant.attacks ?? []).filter((row) => row.name.toLocaleLowerCase() !== roll.weapon.toLocaleLowerCase()),
      { name: roll.weapon.slice(0, 80), bonus: roll.baseBonus, damage, damageType: str(args.damageType) || null }].slice(-8);
    at.fight.saveFighter(at.a.fighter);
  }
  const controlled = new Set(shadow.runtime.configuration?.controlledEntityIds ?? [shadow.hero().id]);
  const target = at.t.entity;
  const value: JsonObject = { formula: str(args.formula), reason, actor: roll.actor.name, visibility: roll.visibility, resolvedBy: "fight", ...attack.value,
    weapon: roll.weapon || null, modifier: roll.modifier, modifierSource: roll.sourceText, bonuses: roll.bonuses,
    damage: { formula: damage, hit: attack.hits > 0, total: attack.totalDamage, target: target.name, ...(attack.applied ? { applied: attack.applied } : {}),
      ...(!attack.applied && attack.totalDamage > 0 && at.t.fighter.combatant.pendingDamage ? { pending: true } : {}) },
    ...(memory && roll.droppedModifier !== memory.bonus ? { bonusKept: `${roll.weapon}: the bonus ${memory.bonus! >= 0 ? "+" : ""}${memory.bonus} this fight already used is kept (the formula's ${roll.droppedModifier >= 0 ? "+" : ""}${roll.droppedModifier} was dropped).` }
      : !memory && roll.droppedModifier && roll.droppedModifier !== roll.named?.bonus ? { modifierDropped: `The formula's ${roll.droppedModifier > 0 ? "+" : ""}${roll.droppedModifier} was dropped: ${roll.named ? `${roll.named.source} gives the bonus` : "the sheet's skill or stat already gives the bonus"} (never both).` } : {}),
    ...(!roll.weapon ? { weaponHint: "Name the weapon or spell (weapon) with each attack: the server keeps its bonus for the rest of the fight." } : {}),
    ...ammunitionValue(roll.ammunition) };
  // Fix run B3: the party's blow that drops a foe is the player's moment.
  if (attack.applied && attack.applied.after === 0 && attack.applied.before > 0 && controlled.has(roll.actor.id) && !controlled.has(target.id))
    value.playerMoment = `${target.name} drops: the player's moment. Narrate up to the blow, stop before the finishing description, ask the player how they do it («Как ты это делаешь?»), and set playerMoment in finish_turn.`;
  return ok(value, `${attack.summary}${roll.ammunition ? ` (${roll.ammunition.name} ${roll.ammunition.before} → ${roll.ammunition.before - 1})` : ""}`, attack.check, withAmmunition(attack.player, roll.ammunition));
}

/** Fix run D: the arrows or bolts a shot spent, on the receipt and on the player's line («Болты: 20 → 19»). */
function ammunitionValue(ammunition: { name: string; before: number } | null): JsonObject {
  return ammunition ? { ammunition: { name: ammunition.name, before: ammunition.before, after: ammunition.before - 1 } } : {};
}
function withAmmunition(line: string, ammunition: { name: string; before: number } | null): string {
  return ammunition ? `${line} · ${ammunition.name}: ${ammunition.before} → ${ammunition.before - 1}` : line;
}
/** A ranged attack without its ammunition while the actor carries some: the receipt reminds the DM. */
function rangedHint(shadow: ShadowState, actor: Entity | null, kind: string, reason: string, ammunition: unknown): JsonObject {
  if (!actor || ammunition || kind !== "attack" || !/(лук|арбалет|выстрел|стрел|болт|\bbow|crossbow|shot|arrow|bolt)/i.test(reason)) return {};
  const quiver = shadow.snapshot.items.find((row) => row.campaign_id === shadow.campaignId && row.owner_entity_id === actor.id && row.category === "ammunition" && row.quantity > 0);
  return quiver ? { ammunitionHint: `A shot spends ammunition: pass ammunitionRef ${quiver.id} (${quiver.name}, ${quiver.quantity} left) with the next ranged attack.` } : {};
}

/** The roll's chip with its damage («Атака посохом: 17 — получилось · урон 9»). */
function withDamageChip(language: ChipLanguage, rolled: string, damage: ReturnType<typeof bundledDamage>): string {
  if (!damage || damage.value.hit !== true) return rolled;
  const total = Number(damage.value.total ?? 0);
  const crit = damage.value.critical === true;
  return `${rolled} · ${language === "ru" ? `урон ${total}${crit ? " (крит, кости вдвойне)" : ""}` : `damage ${total}${crit ? " (critical, dice doubled)" : ""}`}${damage.player ? ` · ${damage.player}` : ""}`;
}

// --- recall (fix run B2) ------------------------------------------------------
function recall(shadow: ShadowState, args: Args): DmLoopReceiptResult {
  const query = str(args.query);
  reject(query.length >= 2, "recall needs a query of two characters or more.");
  const at = args.atWorldMinutes !== undefined ? int(args.atWorldMinutes) : null;
  const state = shadow.source.privateState as Record<string, unknown>;
  const notes = privateNotes(state, (_kind, key) => key.startsWith("quest_reward_") || key.startsWith("paid_grant_") || key.startsWith("holding_") ||
    ["notebook", "notebook_session", "ledger", "variety", "metrics", "depth_state"].includes(key) || key.startsWith("plan_"));
  const plans = allPlans(shadow.source.privateState).map((plan) => ({ kind: "fact" as const, key: plan.key, archived: false,
    text: `plan (${plan.status}): ${plan.goal}${plan.consequence ? ` → ${plan.consequence}` : ""}`, since: plan.setAtWorldMinutes, until: plan.status === "open" ? null : plan.setAtWorldMinutes }));
  const found = recallNotes([...notes, ...plans], query, at);
  return ok({ query, at, notes: found.map((note) => ({ kind: note.kind, key: note.key, text: note.text.slice(0, 1200),
    since: note.since === null ? null : worldDay(note.since), until: note.until === null ? null : worldDay(note.until), open: note.until === null })) },
    found.length ? `Recalled ${found.length} private note${found.length === 1 ? "" : "s"}` : "Nothing recalled");
}

// --- query_state -----------------------------------------------------------
function describeEntity(shadow: ShadowState, entity: Entity) {
  return { id: entity.id, name: entity.name, kind: entity.kind, hp: entity.hp, maxHp: entity.max_hp,
    resources: entity.resources, conditions: entity.conditions, stats: entity.stats, present: shadow.isPresent(entity.id) };
}
function describeItems(shadow: ShadowState, owner: Entity | null) {
  return shadow.snapshot.items.filter((item) => item.campaign_id === shadow.campaignId && item.quantity > 0 &&
    (owner ? item.owner_entity_id === owner.id : item.owner_entity_id === null))
    .map((item) => ({ id: item.id, name: item.name, category: item.category, quantity: item.quantity,
      properties: item.mechanics, equipped: item.equipped_slot }));
}
function queryState(shadow: ShadowState, args: Args): DmLoopReceiptResult {
  const topic = str(args.topic);
  // Fix run D (§4): what lies at a place (or «here») and nobody carries.
  const pile = args.ref !== undefined ? (() => { const storage = storageRefOf(shadow, args.ref, "ref"); return storage && storage.kind === "place" ? storage : null; })() : null;
  if (pile) {
    const items = shadow.snapshot.items.filter((row) => row.campaign_id === shadow.campaignId && row.storage_id === pile.id && row.quantity > 0)
      .map((row) => ({ id: row.id, name: row.name, category: row.category, quantity: row.quantity, properties: row.mechanics }));
    return ok({ place: pile.name, storageId: pile.id, items, money: walletOfStorage(pile) }, `Looked up what lies at ${pile.name}`);
  }
  const who = args.ref !== undefined ? entityOf(shadow, args.ref, "ref") : null;
  const party = shadow.partyIds().map((id) => shadow.entity(id)!).filter(Boolean);
  const place = shadow.snapshot.publicState.current_location_id ? shadow.location(shadow.snapshot.publicState.current_location_id) : null;
  const money = (entity: Entity) => Object.fromEntries(Object.entries(entity.resources)
    .filter(([key]) => key.startsWith("currency_")).map(([key, value]) => [key.slice("currency_".length).replaceAll("_", " "), value]));
  const value: JsonObject = {};
  if (topic === "party" || topic === "all") value.party = party.map((entity) => describeEntity(shadow, entity));
  if (topic === "character") value.character = describeEntity(shadow, who ?? shadow.hero());
  if (topic === "inventory" || topic === "all") {
    const owners = who ? [who] : party;
    value.inventory = owners.map((entity) => ({ owner: entity.name, items: describeItems(shadow, entity) }));
    value.camp = describeItems(shadow, null);
  }
  if (topic === "money" || topic === "all") value.money = (who ? [who] : party).map((entity) => ({ owner: entity.name, ...money(entity) }));
  if (topic === "place" || topic === "all") value.place = place ? { id: place.id, name: place.name, status: place.status } : null;
  if (topic === "quests" || topic === "all") value.quests = shadow.snapshot.quests.filter((q) => q.campaign_id === shadow.campaignId)
    .map((quest) => ({ id: quest.id, title: quest.title, status: quest.status }));
  if (topic === "time" || topic === "all") value.time = { worldMinutes: shadow.worldMinutes, advancedThisTurn: shadow.minutesAdvanced };
  return ok(value, `Looked up ${topic}`);
}

// --- upsert_character ------------------------------------------------------
function statsFrom(args: Args, base: Record<string, number>): Record<string, number> {
  const next = { ...base };
  for (const entry of (args.stats as { name: string; value: number }[] | undefined) ?? [])
    next[str(entry.name).toLowerCase()] = entry.value;
  return next;
}
/** Fix run D (§4, item 36): a person made from a stat block gets what it carries as items at creation — weapons,
 * armour, ammunition, things that matter — worn or held where `equipped`, so a search of the body lists them. */
function giveGear(shadow: ShadowState, entity: Entity, gear: unknown): { created: string[]; notEquipped: string[] } {
  const created: string[] = [], notEquipped: string[] = [];
  if (!Array.isArray(gear) || !gear.length) return { created, notEquipped };
  let owner = ensureUniversalSlots(shadow, entity);
  const storageId = shadow.storageFor(owner).id;
  for (const [index, raw] of (gear as Record<string, unknown>[]).slice(0, 12).entries()) {
    const name = str(raw.name), kind = str(raw.kind);
    if (!name || !(ITEM_KINDS as readonly string[]).includes(kind)) continue;
    const quantity = Math.max(1, Math.min(L.maxItemQuantity, int(raw.quantity) ?? 1));
    const id = shadow.newId(`gear:${owner.id}:${index}:${name}`);
    if (shadow.item(id)) continue;
    shadow.apply({ family: "items", id, expectedRevision: null, values: { name, category: kind, quantity, description: "", mechanics: str(raw.properties),
      owner_entity_id: owner.id, storage_id: storageId, equipped_entity_id: null, equipped_slot: null,
      detail: withHistory({}, shadow.now, "created", shadow.snapshot.settings.values.language === "ru" ? "снаряжение" : "gear") as unknown as JsonObject } });
    created.push(name);
    if (raw.equipped === true) {
      owner = shadow.entity(owner.id)!;
      const plan = equipPlan(owner, shadow.snapshot.items.filter((row) => row.campaign_id === shadow.campaignId), shadow.item(id)!, null, shadow.snapshot.settings.values.language);
      if (!plan.ok) { notEquipped.push(name); continue; }
      for (const occupant of plan.unequip) { const now = shadow.item(occupant.id)!; shadow.apply({ family: "items", id: now.id, expectedRevision: now.revision, values: { equipped_entity_id: null, equipped_slot: null } }); }
      const now = shadow.item(id)!;
      shadow.apply({ family: "items", id, expectedRevision: now.revision, values: { equipped_entity_id: owner.id, equipped_slot: plan.slot.id } });
    }
  }
  return { created, notEquipped };
}
/** The sheet fields of a call (fix run D §7, §9), or null when the call has none. */
function sheetPatchOf(args: Args): SheetPatch | null {
  if (!args.sheet || typeof args.sheet !== "object" || Array.isArray(args.sheet)) return null;
  return args.sheet as SheetPatch;
}
/** Fix S3-accept Г3: the record's public conditions after a call's add / remove (lasting effects such as «Доспехи
 * мага», which the 5e rules module counts in the AC); null when the call names none or nothing changes. */
function conditionsAfter(entity: Entity, raw: unknown): string[] | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const words = (value: unknown) => (Array.isArray(value) ? value.map((row) => str(row).slice(0, 60)).filter(Boolean).slice(0, 6) : []);
  const { add, remove } = raw as { add?: unknown; remove?: unknown };
  const gone = new Set(words(remove).map((word) => word.toLocaleLowerCase()));
  const kept = entity.conditions.filter((word) => !gone.has(word.toLocaleLowerCase()));
  const next = [...kept, ...words(add).filter((word) => !kept.some((row) => row.toLocaleLowerCase() === word.toLocaleLowerCase()))].slice(0, 12);
  return next.length === entity.conditions.length && next.every((word, index) => word === entity.conditions[index]) ? null : next;
}
/** Fix S3-accept В1: the sheet a call writes — from a stored sheet whose «Умения» still list spells read as converted
 * (src/lib/inventory/spell-records.ts), with the call's fields, and every spell the app has a card for filled from it
 * where its record leaves a field out (its own words win). */
function sheetAfter(before: AnySheet | null | undefined, patch: SheetPatch, language: unknown): CharacterSheetV2 {
  const next = patchSheet(convertSpellProse(before, language)?.sheet ?? before, patch);
  return next.spells?.length ? { ...next, spells: next.spells.map((row) => withCard(row, language)) } : next;
}
/** A stat block that names attacks while the person carries no weapon: the receipt asks for the gear (item 36). */
function gearHint(shadow: ShadowState, entity: Entity, statblock: string): JsonObject {
  if (!/(атак|attack|мультиатак|multiattack|\+\d+\s*\()/i.test(statblock)) return {};
  const armed = shadow.snapshot.items.some((row) => row.campaign_id === shadow.campaignId && row.owner_entity_id === entity.id && row.category === "weapon" && row.quantity > 0);
  return armed ? {} : { gearHint: `${entity.name}'s stat block names attacks but the record carries no weapon: give gear (weapons, armour, ammunition) so a search finds them.` };
}
function upsertCharacter(shadow: ShadowState, args: Args, ctx: ToolContext): DmLoopReceiptResult {
  const language = shadow.snapshot.settings.values.language;
  const config = shadow.configuration();
  if (args.ref !== undefined) {
    const entity = entityOf(shadow, args.ref, "ref");
    if (entity.kind === "player") {
      // Fix run D (§9, item 18): the hero's sheet changes in play only through sheet with a reason; the rest of the
      // hero's record is the owner's (HP and counters: resource; possessions: item).
      const patch = sheetPatchOf(args);
      // Fix S3-accept Г3: and the hero's lasting effects (conditions), with the same reason.
      const conditions = args.conditions !== undefined ? conditionsAfter(entity, args.conditions) : null;
      const others = Object.keys(args).filter((key) => !["ref", "sheet", "reason", "conditions"].includes(key) && args[key] !== undefined);
      reject((patch || args.conditions !== undefined) && others.length === 0, `${entity.name} is the player's hero; only the sheet and the conditions change here (with a reason).`,
        "Use resource for HP and counters, item for possessions.");
      const reason = str(args.reason);
      reject(reason.length > 0, "A change of the hero's sheet or conditions needs a reason (shown to the player).");
      const before = entity.character_sheet as AnySheet | null | undefined;
      const sheet = patch ? sheetAfter(before, patch, ctx.language) : null;
      if (sheet || conditions) shadow.apply(entityChange(shadow, entity, { ...(sheet ? { character_sheet: sheet as unknown as JsonObject } : {}), ...(conditions ? { conditions } : {}) }));
      const ru = ctx.language === "ru";
      // The chip names the call's change, not the one-time conversion of the prose it started from.
      const changed = [sheet ? sheetChanges(convertSpellProse(before, ctx.language)?.sheet ?? before, sheet, ctx.language) : null,
        conditions ? `${ru ? "состояния" : "conditions"}: ${conditions.join(", ") || (ru ? "нет" : "none")}` : null].filter(Boolean).join("; ") || (ru ? "без изменений" : "unchanged");
      return ok({ id: entity.id, name: entity.name, sheet: changed, ...(conditions ? { conditions } : {}) }, `${entity.name}'s sheet: ${changed} (${reason})`, null,
        `${ru ? "Лист героя" : "Hero's sheet"}: ${changed} (${reason})`);
    }
    reject(entity.kind === "npc" || entity.kind === "companion" || entity.kind === "faction", `${entity.name} is a ${entity.kind}, not a character.`);
    const values: JsonObject = {};
    if (args.name !== undefined) values.name = str(args.name);
    if (args.description !== undefined) values.details = str(args.description);
    if (args.kind !== undefined && args.kind !== entity.kind) {
      reject(entity.kind === "npc" && args.kind === "companion", `${entity.name} cannot change from ${entity.kind} to ${String(args.kind)}.`);
      values.kind = "companion";
    }
    const profile = profilePatch(shadow, args, entity, (values.kind as string | undefined) ?? entity.kind, args.description !== undefined ? str(args.description) : undefined);
    if (profile) values.public_profile = profile as unknown as JsonObject;
    if (args.stats !== undefined) values.stats = statsFrom(args, entity.stats);
    if (args.maxHp !== undefined || args.hp !== undefined) {
      const maxHp = int(args.maxHp) ?? entity.max_hp ?? int(args.hp);
      const hp = int(args.hp) ?? Math.min(entity.hp ?? maxHp ?? 0, maxHp ?? 0);
      reject(maxHp !== null && hp !== null && hp >= 0 && hp <= maxHp, `HP ${hp} must stay within 0..${maxHp}.`);
      values.hp = hp; values.max_hp = maxHp;
    }
    const patch = sheetPatchOf(args);
    if (patch && entity.kind !== "faction") values.character_sheet = sheetAfter(entity.character_sheet as AnySheet | null | undefined, patch, ctx.language) as unknown as JsonObject;
    const conditions = entity.kind !== "faction" && args.conditions !== undefined ? conditionsAfter(entity, args.conditions) : null;
    if (conditions) values.conditions = conditions;
    if (Object.keys(values).length) shadow.apply(entityChange(shadow, entity, values));
    // Fix S3-pre (opening attacks): hit points given for the first time take the damage an opening attack already dealt.
    const settled = entity.max_hp === null && values.max_hp !== undefined ? settlePendingDamage(shadow, shadow.entity(entity.id)!) : 0;
    if (args.statblock !== undefined) shadow.setPrivate("npc", `statblock_${entity.id}`, str(args.statblock));
    const gear = entity.kind !== "faction" ? giveGear(shadow, shadow.entity(entity.id)!, args.gear) : { created: [], notEquipped: [] };
    const wasInParty = config.controlledEntityIds.includes(entity.id);
    const present = args.present === undefined ? shadow.isPresent(entity.id) : !!args.present;
    const party = args.party === undefined ? wasInParty : !!args.party;
    const kind = (values.kind as string | undefined) ?? entity.kind;
    reject(!party || kind === "companion", "Only a companion can join the party.");
    reject(!present || kind !== "faction", "A faction is never present in a scene; its people are.");
    config.presentEntityIds = present ? [...new Set([...config.presentEntityIds, entity.id])] : config.presentEntityIds.filter((id) => id !== entity.id);
    config.controlledEntityIds = party ? [...new Set([...config.controlledEntityIds, entity.id])] : config.controlledEntityIds.filter((id) => id !== entity.id);
    if (party) config.presentEntityIds = [...new Set([...config.presentEntityIds, entity.id])];
    shadow.setConfiguration(config);
    return ok({ id: entity.id, name: (values.name as string) ?? entity.name, kind, present, party,
      ...(settled ? { pendingDamage: `the ${settled} damage an opening attack dealt is subtracted: HP ${shadow.entity(entity.id)!.hp}/${shadow.entity(entity.id)!.max_hp}` } : {}),
      ...(gear.created.length ? { gear: gear.created, ...(gear.notEquipped.length ? { notEquipped: gear.notEquipped } : {}) } : {}),
      ...(args.statblock !== undefined && !gear.created.length ? gearHint(shadow, shadow.entity(entity.id)!, str(args.statblock)) : {}) },
      `${(values.name as string) ?? entity.name} updated`, null, party && !wasInParty ? chip.companionJoins(ctx.language, (values.name as string) ?? entity.name) : null);
  }
  const name = str(args.name);
  reject(name.length > 0, "A new character needs a name.");
  // Fix S3-pre (opening attacks): the person this turn's first attack recorded bare is this one — completed, never doubled.
  const bare = str(args.kind) !== "faction" ? fightPersonNamed(shadow, name) : null;
  reject(bare || shadow.counters.charactersCreated < ctx.limits.charactersPerTurn,
    `This turn already introduced ${ctx.limits.charactersPerTurn} new characters, the campaign's limit per turn.`,
    "Refer to existing records with ref, or introduce the rest in a later turn.");
  const kind = str(args.kind) === "companion" ? "companion" : str(args.kind) === "faction" ? "faction" : "npc";
  const key = localKey(args.localKey) ?? name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").slice(0, 60);
  const similar = shadow.similarEntities(name).filter((row) => row.kind !== "player" && row.id !== bare?.id);
  const id = bare?.id ?? shadow.newId(`entity:${key}`);
  reject(bare || !shadow.entity(id), `The local key "${key}" already names a character in this turn.`);
  if (!bare) shadow.counters.charactersCreated++;
  const maxHp = int(args.maxHp) ?? int(args.hp);
  const hp = int(args.hp) ?? maxHp;
  reject(maxHp === null || (hp !== null && hp >= 0 && hp <= maxHp), `HP ${hp} must stay within 0..${maxHp}.`);
  reject(kind !== "faction" || (maxHp === null && args.party === undefined), "A faction has no hit points and never joins the party.");
  const profile = profilePatch(shadow, args, null, kind, str(args.description));
  const patch = kind !== "faction" ? sheetPatchOf(args) : null;
  shadow.apply({ family: "entities", id, expectedRevision: null, values: {
    kind, name, details: str(args.description), hp: maxHp === null ? null : hp, max_hp: maxHp,
    stats: statsFrom(args, {}), resources: {}, conditions: [], equipment_slots: (kind === "faction" ? [] : humanoidSlots(language)) as unknown as JsonObject[],
    ...(profile ? { public_profile: profile as unknown as JsonObject } : {}),
    ...(patch ? { character_sheet: sheetAfter(null, patch, ctx.language) as unknown as JsonObject } : {}),
  } });
  if (!bare || !shadow.localKeys.has(key)) shadow.bindLocalKey(key, { family: "entities", id });
  if (args.statblock !== undefined) shadow.setPrivate("npc", `statblock_${id}`, str(args.statblock));
  const settled = bare ? settlePendingDamage(shadow, shadow.entity(id)!) : 0;
  const gear = kind !== "faction" ? giveGear(shadow, shadow.entity(id)!, args.gear) : { created: [], notEquipped: [] };
  const present = kind === "faction" ? false : args.present === undefined ? true : !!args.present;
  const party = kind === "companion" && (args.party === undefined ? true : !!args.party);
  if (present || party) config.presentEntityIds = [...new Set([...config.presentEntityIds, id])];
  if (party) config.controlledEntityIds = [...new Set([...config.controlledEntityIds, id])];
  shadow.setConfiguration(config);
  const value: JsonObject = { id, localKey: key, name, kind, present, party, created: true,
    ...(bare ? { completed: `${name} was recorded bare by this turn's first attack; this record completes them${settled ? ` (the ${settled} damage they took is subtracted: HP ${shadow.entity(id)!.hp}/${shadow.entity(id)!.max_hp})` : ""}.` } : {}),
    ...(gear.created.length ? { gear: gear.created, ...(gear.notEquipped.length ? { notEquipped: gear.notEquipped } : {}) } : {}),
    ...(args.statblock !== undefined && !gear.created.length ? gearHint(shadow, shadow.entity(id)!, str(args.statblock)) : {}),
    ...(similar.length ? { hint: `Similar existing characters: ${similar.map((row) => `${row.name} (${row.id})`).join(", ")}. If this is the same person, update that record with ref instead.` } : {}) };
  // A faction the hero learned of shows at once; a person shows in the chips
  // only once the narration names them or they are present (the loop decides at commit).
  const player = kind === "faction" ? chip.person(ctx.language, "faction", name) : null;
  return ok(value, `${name} recorded as ${kind === "companion" ? "a companion" : kind === "faction" ? "a faction" : "a character"}`, null, player);
}

// --- upsert_place ----------------------------------------------------------
/** Ties a place to quests both ways (location.detail.questIds, quest.detail.locationIds). */
function linkPlaceToQuests(shadow: ShadowState, placeId: string, questRefs: unknown[]) {
  const quests = questRefs.map((ref) => questOf(shadow, ref, "questRefs"));
  const place = shadow.location(placeId)!;
  const detail = { ...(place.detail ?? {}), questIds: [...new Set(quests.map((q) => q.id))] };
  shadow.apply({ family: "locations", id: place.id, expectedRevision: place.revision, values: { detail: detail as unknown as JsonObject } });
  for (const quest of quests) {
    const current = shadow.quest(quest.id)!;
    const questDetail: QuestDetail = { ...(current.detail ?? {}), locationIds: [...new Set([...(current.detail?.locationIds ?? []), placeId])] };
    shadow.apply({ family: "quests", id: current.id, expectedRevision: current.revision, values: { detail: questDetail as unknown as JsonObject } });
  }
}
function upsertPlace(shadow: ShadowState, args: Args, ctx: ToolContext): DmLoopReceiptResult {
  // Fix run B3 (item 72): a person's name is never a place («у Тарра» became a location in session 2).
  if (args.name !== undefined) {
    const name = str(args.name).trim().toLocaleLowerCase();
    const person = shadow.snapshot.entities.find((row) => row.kind !== "faction" && row.name.trim().toLocaleLowerCase() === name);
    reject(!person, `«${str(args.name)}» is a person's name (${person?.name ?? ""}), not a place.`,
      "Name the place itself (the house, the workshop, the camp of that person), or record the person with upsert_character.");
  }
  if (args.ref !== undefined) {
    const ref = shadow.resolve(args.ref, ["locations"], "ref");
    const place = shadow.location(ref.id)!;
    const values: JsonObject = {};
    if (args.name !== undefined) values.name = str(args.name);
    if (args.description !== undefined) values.description = str(args.description);
    if (args.status !== undefined) {
      reject(place.status !== "visited" || args.status === "visited", `${place.name} was visited; it cannot become merely ${String(args.status)}.`);
      values.status = str(args.status);
    }
    const where = placeWhereabouts(shadow, args, place.id);
    if (where) values.detail = { ...(place.detail ?? {}), ...where } as unknown as JsonObject;
    if (Object.keys(values).length) shadow.apply({ family: "locations", id: place.id, expectedRevision: place.revision, values });
    if (Array.isArray(args.questRefs)) linkPlaceToQuests(shadow, place.id, args.questRefs);
    return ok({ id: place.id, name: (values.name as string) ?? place.name }, `${(values.name as string) ?? place.name} updated`);
  }
  const name = str(args.name);
  reject(name.length > 0, "A new place needs a name.");
  const key = localKey(args.localKey) ?? name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").slice(0, 60);
  const id = shadow.newId(`location:${key}`);
  reject(!shadow.location(id), `The local key "${key}" already names a place in this turn.`);
  const where = placeWhereabouts(shadow, args, id);
  shadow.apply({ family: "locations", id, expectedRevision: null, values: {
    name, description: str(args.description), status: str(args.status) || "known", ...(where ? { detail: where as unknown as JsonObject } : {}) } });
  shadow.bindLocalKey(key, { family: "locations", id });
  if (Array.isArray(args.questRefs)) linkPlaceToQuests(shadow, id, args.questRefs);
  return ok({ id, localKey: key, name, status: str(args.status) || "known" }, `Place recorded: ${name}${str(args.status) === "rumored" ? " (a rumour)" : ""}`,
    null, chip.place(ctx.language, name, str(args.status) === "rumored"));
}

/** Polish group 9: the parent place and the whereabouts in words, for the map's own layout. */
function placeWhereabouts(shadow: ShadowState, args: Args, selfId: string): { parentId?: string; whereabouts?: string } | null {
  const out: { parentId?: string; whereabouts?: string } = {};
  if (args.parentRef !== undefined) {
    const parent = shadow.resolve(args.parentRef, ["locations"], "parentRef");
    reject(parent.id !== selfId, "A place cannot lie in itself.");
    out.parentId = parent.id;
  }
  if (args.whereabouts !== undefined && str(args.whereabouts)) out.whereabouts = str(args.whereabouts);
  return Object.keys(out).length ? out : null;
}

// --- time and travel -------------------------------------------------------
function advanceMinutes(shadow: ShadowState, minutes: number, what: string, ctx: ToolContext) {
  reject(Number.isInteger(minutes) && minutes >= 0, `${what}: minutes must be a whole number.`);
  const limit = ctx.limits.minutesPerTurn;
  reject(shadow.minutesAdvanced + minutes <= limit,
    `${what}: this turn would advance ${shadow.minutesAdvanced + minutes} minutes; this campaign lets one turn advance at most ${limit}${limit === 7 * 24 * 60 ? " (a week)" : ""}.`,
    "Narrate the long stretch and let the next turn continue it.");
  shadow.source.runtime.worldMinutes += minutes;
  shadow.minutesAdvanced += minutes;
}
/** Off-screen plans that came due by the new time (stage task §2b, §3): the
 * receipt lists them so the DM advances them in the same turn. */
function dueAfterTime(shadow: ShadowState, before: number): JsonObject {
  const due = duePlans(shadow.source.privateState, shadow.worldMinutes).map((plan) => ({
    key: plan.key, actor: plan.actorId ? shadow.entity(plan.actorId)?.name ?? "someone" : "the world", goal: plan.goal,
    consequence: plan.consequence, warning: plan.warning || null, overdueMinutes: shadow.worldMinutes - plan.dueWorldMinutes }));
  if (!due.length) return {};
  return { duePlans: due, hint: `${due.length} off-screen plan${due.length > 1 ? "s" : ""} came due while time passed (${shadow.worldMinutes - before} min). Advance them now in this turn: note_world (set the plan's next step or planStatus done/dropped), note_character for the people involved, and let the hero notice only what reaches them.` };
}
function advanceTime(shadow: ShadowState, args: Args, ctx: ToolContext): DmLoopReceiptResult {
  const minutes = int(args.minutes) ?? 0;
  const before = shadow.worldMinutes;
  advanceMinutes(shadow, minutes, "advance_time", ctx);
  const due = dueAfterTime(shadow, before);
  return ok({ minutes, worldMinutes: shadow.worldMinutes, ...due }, `${minutes} minutes pass (${str(args.reason)})${due.duePlans ? `; ${(due.duePlans as unknown[]).length} plan(s) due` : ""}`,
    null, chip.time(ctx.language, minutes));
}
function moveParty(shadow: ShadowState, args: Args, ctx: ToolContext): DmLoopReceiptResult {
  const ref = shadow.resolve(args.placeRef, ["locations"], "placeRef");
  const place = shadow.location(ref.id)!;
  const minutes = int(args.minutes) ?? 0;
  reject(minutes > 0, "Travel takes time: minutes must be greater than 0.");
  const previous = shadow.snapshot.publicState.current_location_id;
  reject(previous !== place.id, `The party is already at ${place.name}.`, "Movement inside one place is narration, not a Location change.");
  const before = shadow.worldMinutes;
  advanceMinutes(shadow, minutes, "move_party", ctx);
  shadow.apply({ family: "public_state", id: shadow.campaignId, expectedRevision: shadow.snapshot.publicState.revision,
    values: { current_location_id: place.id } });
  if (place.status !== "visited") shadow.apply({ family: "locations", id: place.id, expectedRevision: place.revision, values: { status: "visited" } });
  // Companions in the party travel; local characters stay where they were.
  const config = shadow.configuration();
  const party = new Set(shadow.partyIds());
  config.presentEntityIds = config.presentEntityIds.filter((id) => party.has(id));
  config.nearbyStorageIds = [];
  shadow.setConfiguration(config);
  const due = dueAfterTime(shadow, before);
  return ok({ placeId: place.id, name: place.name, minutes, worldMinutes: shadow.worldMinutes, ...due }, `The party travels to ${place.name} (${minutes} min)${due.duePlans ? `; ${(due.duePlans as unknown[]).length} plan(s) due` : ""}`,
    null, chip.travel(ctx.language, place.name, minutes));
}

// --- items -----------------------------------------------------------------
/** Fix run D (§4): what lies at a place and nobody carries yet — a storage of kind 'place' tied to the location,
 * created on demand («Здесь лежит: логово»). */
function placeStorage(shadow: ShadowState, locationId: string): Storage {
  const existing = shadow.snapshot.storages.filter((row) => row.campaign_id === shadow.campaignId && row.kind === "place" &&
    (row.detail as { locationId?: string } | undefined)?.locationId === locationId).sort((a, b) => a.id.localeCompare(b.id))[0];
  if (existing) return existing;
  const place = shadow.location(locationId);
  const ru = shadow.snapshot.settings.values.language === "ru";
  const id = shadow.newId(`storage:place:${locationId}`);
  shadow.apply({ family: "storages", id, expectedRevision: null, values: { name: `${ru ? "Здесь лежит" : "Lies here"}: ${place?.name ?? "?"}`.slice(0, 160), kind: "place",
    entity_id: null, detail: { locationId } as unknown as JsonObject } });
  return shadow.storage(id)!;
}
function hereStorage(shadow: ShadowState): Storage {
  const current = shadow.snapshot.publicState.current_location_id;
  reject(current, "The party is at no recorded place; record it first (upsert_place, move_party).");
  return placeStorage(shadow, current);
}
const isHere = (value: unknown) => ["here", "здесь"].includes(str(value).toLowerCase());
/** A place or a storage named by reference (a location → its pile; a storage → itself), or null for a person. */
function storageRefOf(shadow: ShadowState, value: unknown, what: string): Storage | null {
  if (isHere(value)) return hereStorage(shadow);
  if (str(value).toLowerCase() === "camp") return shadow.campStorage();
  const ref = shadow.resolve(value, ["entities", "storages", "locations"], what);
  if (ref.family === "locations") return placeStorage(shadow, ref.id);
  if (ref.family === "storages") return shadow.storage(ref.id)!;
  return null;
}
function destinationOf(shadow: ShadowState, value: unknown, what: string): { entity: Entity | null; storageId: string; label: string } {
  const storage = storageRefOf(shadow, value, what);
  if (storage) return { entity: null, storageId: storage.id, label: storage.kind === "camp" ? (shadow.snapshot.settings.values.language === "ru" ? "лагерь" : "the camp") : storage.name };
  const entity = entityOf(shadow, value, what);
  reject(entity.kind !== "faction", `${entity.name} is a faction; items belong to its people or a holding.`);
  return { entity, storageId: shadow.storageFor(entity).id, label: entity.name };
}
/** An accepted transfer or payment that matches an open job's issuer: the
 * receipt tells the DM the job may be complete (the one miss of every live
 * bench; stage task §2). */
function openJobHint(shadow: ShadowState, from: Entity | null, to: Entity | null): JsonObject {
  const party = new Set(shadow.partyIds());
  const open = shadow.snapshot.quests.filter((quest) => quest.campaign_id === shadow.campaignId && quest.status === "open" && (quest.kind ?? "quest") === "quest");
  const matches = open.filter((quest) => {
    const issuer = rewardTerms(shadow, quest)?.issuerId ?? null;
    if (!issuer) return false;
    // The party delivers to the issuer, or the issuer pays the party.
    return (to && to.id === issuer && from && party.has(from.id)) || (from && from.id === issuer && to && party.has(to.id));
  });
  if (!matches.length) return {};
  return { openQuests: matches.map((quest) => ({ id: quest.id, title: quest.title })),
    hint: `This may complete the open job "${matches[0].title}" (${matches[0].id}). If it does, close it in this turn: quest complete, then quest claim_reward for the agreed reward (a plain payment from the issuer after completion settles it too).` };
}
function itemDetail(item: Item): ItemDetail {
  const detail = item.detail;
  return detail && typeof detail === "object" && !Array.isArray(detail) ? structuredClone(detail) : {};
}
function withHistory(detail: ItemDetail, at: number, event: string, note: string): ItemDetail {
  const history = [...(detail.history ?? []), { at, event, note: note.slice(0, 200) }].slice(-20);
  return { ...detail, history };
}
const isHero = (entity: Entity | null | undefined) => !!entity && entity.kind === "player";
/** Fix run D: the item's mechanics from the call (bonuses, hands, charges, attunement) into its detail. */
function mechanicsDetail(args: Args, detail: ItemDetail): ItemDetail {
  const next = { ...detail } as ItemDetail & Record<string, unknown>;
  if (Array.isArray(args.bonuses)) next.bonuses = (args.bonuses as { to: unknown; value: unknown }[])
    .map((row) => ({ to: str(row.to), value: int(row.value) ?? 0 })).filter((row) => row.to && row.value !== 0).slice(0, 4);
  if (args.hands !== undefined) next.hands = int(args.hands) === 2 ? 2 : 1;
  if (args.charges !== undefined && args.charges && typeof args.charges === "object") {
    const charges = args.charges as { value: unknown; max: unknown };
    const max = int(charges.max) ?? 0, value = int(charges.value) ?? 0;
    reject(max >= 1 && value >= 0 && value <= max, "charges: value between 0 and max (max at least 1).");
    next.charges = { value, max };
  }
  if (args.attunement !== undefined) next.attunement = args.attunement === true;
  return next;
}
const MECHANIC_FIELDS = ["bonuses", "hands", "charges", "attunement"] as const;
/** An identical stack of the same holder (fix run D, §6): the conservative rule of the model. */
function stackFor(shadow: ShadowState, probe: Item): Item | null {
  return shadow.snapshot.items.find((row) => row.campaign_id === shadow.campaignId && row.id !== probe.id && sameStack(probe, row)) ?? null;
}
function itemTool(shadow: ShadowState, args: Args, ctx: ToolContext): DmLoopReceiptResult {
  const action = str(args.action);
  const l = ctx.language;
  if (action === "create") {
    const name = str(args.name);
    reject(name.length > 0, "item create needs a name.");
    const category = str(args.category);
    reject((ITEM_CATEGORIES as readonly string[]).includes(category), `item create needs a category: ${ITEM_CATEGORIES.join(", ")}.`);
    const quantity = int(args.quantity) ?? 1;
    reject(shadow.counters.itemsCreated < turnItemCap(ctx.limits),
      `This turn already created ${turnItemCap(ctx.limits)} items, the campaign's limit per turn (two batches of ${ctx.limits.itemsPerTurn}).`,
      "Describe the rest in the narration; record it in a later turn.");
    const destination = destinationOf(shadow, args.ownerRef ?? "camp", "ownerRef");
    const key = localKey(args.localKey) ?? `${name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-")}-${ctx.toolCalls}`.slice(0, 60);
    const id = shadow.newId(`item:${key}`);
    reject(!shadow.item(id), `The local key "${key}" already names an item in this turn.`);
    shadow.counters.itemsCreated++;
    const rarity = args.rarity !== undefined ? str(args.rarity) : null;
    reject(rarity === null || (ITEM_RARITIES as readonly string[]).includes(rarity), `rarity: ${ITEM_RARITIES.join(", ")}.`);
    const detail = mechanicsDetail(args, {});
    // Fix run D (§6): an identical stack of the same holder grows instead of a second stack.
    const probe = { id, campaign_id: shadow.campaignId, revision: 0, updated_at: "", name, category, quantity, description: str(args.description), mechanics: str(args.properties),
      owner_entity_id: destination.entity?.id ?? null, storage_id: destination.storageId, equipped_entity_id: null, equipped_slot: null, rarity: rarity as Item["rarity"], detail } as Item;
    const stack = MECHANIC_FIELDS.some((field) => args[field] !== undefined) ? null : stackFor(shadow, probe);
    if (stack) {
      shadow.apply({ family: "items", id: stack.id, expectedRevision: stack.revision, values: { quantity: stack.quantity + quantity,
        detail: withHistory(itemDetail(stack), shadow.now, "merged", `+${quantity} ${name}`) as unknown as JsonObject } });
      shadow.bindLocalKey(key, { family: "items", id: stack.id });
      return ok({ id: stack.id, localKey: key, name: stack.name, category, quantity: stack.quantity, added: quantity, mergedInto: stack.name, owner: destination.label },
        `${destination.label} gets ${name}${quantity > 1 ? ` ×${quantity}` : ""} (now ${stack.quantity} × ${stack.name})`,
        null, chip.itemGained(l, destination.label, isHero(destination.entity), stack.name, quantity, destination.entity === null));
    }
    shadow.apply({ family: "items", id, expectedRevision: null, values: {
      name, category, quantity, description: str(args.description), mechanics: str(args.properties),
      owner_entity_id: destination.entity?.id ?? null, storage_id: destination.storageId,
      equipped_entity_id: null, equipped_slot: null, ...(rarity ? { rarity } : {}),
      detail: withHistory(detail, shadow.now, "created", str(args.description)) as unknown as JsonObject } });
    shadow.bindLocalKey(key, { family: "items", id });
    return ok({ id, localKey: key, name, category, quantity, owner: destination.label, ...(rarity ? { rarity } : {}) }, `${destination.label} gets ${name}${quantity > 1 ? ` ×${quantity}` : ""}`,
      null, chip.itemGained(l, destination.label, isHero(destination.entity), name, quantity, destination.entity === null));
  }
  let item = itemOf(shadow, args.itemRef, "itemRef");
  if (args.rarity !== undefined && action !== "modify") {
    const rarity = str(args.rarity);
    reject((ITEM_RARITIES as readonly string[]).includes(rarity), `rarity: ${ITEM_RARITIES.join(", ")}.`);
    shadow.apply({ family: "items", id: item.id, expectedRevision: item.revision, values: { rarity } });
    item = shadow.item(item.id)!;
  }
  const owner = item.owner_entity_id ? shadow.entity(item.owner_entity_id) ?? null : null;
  const holderName = (detail: ItemDetail) => (detail.holderId ? shadow.entity(detail.holderId)?.name ?? "someone" : null);
  if (action === "transfer") {
    const destination = destinationOf(shadow, args.ownerRef, "ownerRef");
    const quantity = int(args.quantity) ?? item.quantity;
    reject(quantity >= 1 && quantity <= item.quantity, `${ownerName(shadow, item)} has ${item.quantity} × ${item.name}, not ${quantity}.`);
    reject(item.equipped_entity_id === null, `${item.name} is equipped by ${ownerName(shadow, item)}.`, "Unequip it first (item unequip).");
    const detail = itemDetail(item);
    const returned = (detail.status === "pledged" || detail.status === "lent") && destination.entity?.id === item.owner_entity_id;
    reject(returned || (destination.entity?.id ?? null) !== item.owner_entity_id || destination.storageId !== item.storage_id,
      `${item.name} already belongs to ${destination.label}.`);
    if (returned) {
      // The pledged or lent thing comes back to its owner: title never moved.
      shadow.apply({ family: "items", id: item.id, expectedRevision: item.revision, values: { storage_id: destination.storageId,
        detail: withHistory({ ...detail, status: undefined, holderId: undefined, condition: undefined }, shadow.now, "returned", holderName(detail) ?? "") as unknown as JsonObject } });
      return ok({ itemId: item.id, name: item.name, returned: true, to: destination.label }, `${item.name} returns to ${destination.label}`,
        null, chip.itemReturned(l, item.name, destination.label, isHero(destination.entity)));
    }
    // The row object is updated in place by the applier: remember the giver first.
    const giver = item.owner_entity_id ? shadow.entity(item.owner_entity_id) ?? null : null;
    // Fix run D (§6): the destination already holds the same thing — that stack grows; nothing is split off.
    const arriving = { ...item, owner_entity_id: destination.entity?.id ?? null, storage_id: destination.storageId, equipped_entity_id: null, equipped_slot: null,
      detail: detail.status ? {} : item.detail } as Item;
    const stack = !detail.status ? stackFor(shadow, arriving) : null;
    if (stack && stack.id !== item.id) {
      shadow.apply({ family: "items", id: item.id, expectedRevision: item.revision, values: { quantity: item.quantity - quantity,
        detail: withHistory(detail, shadow.now, "transferred", `${quantity} → ${destination.label}`) as unknown as JsonObject } });
      const grown = shadow.item(stack.id)!;
      const total = grown.quantity + quantity;
      shadow.apply({ family: "items", id: grown.id, expectedRevision: grown.revision, values: { quantity: total,
        detail: withHistory(itemDetail(grown), shadow.now, "merged", l === "ru" ? `+${quantity} от ${giver?.name ?? "?"}` : `+${quantity} from ${giver?.name ?? "?"}`) as unknown as JsonObject } });
      const hint = openJobHint(shadow, giver, destination.entity);
      return ok({ itemId: grown.id, name: item.name, quantity, to: destination.label, mergedInto: grown.name, ...hint },
        `${item.name}${quantity > 1 ? ` ×${quantity}` : ""} goes to ${destination.label} (now ${total})`,
        null, chip.itemGiven(l, item.name, quantity, giver?.name ?? (l === "ru" ? "лагерь" : "the camp"), isHero(giver), destination.label, isHero(destination.entity), !!hint.openQuests));
    }
    const splitId = shadow.newId(`split:${item.id}:${ctx.toolCalls}`);
    const settled = settledItemTransfer(item, quantity, destination.entity?.id ?? (null as unknown as string), destination.storageId, splitId);
    for (const change of settled.changes) {
      if (change.id === splitId) change.values.owner_entity_id = destination.entity?.id ?? null;
      else if (change.values.owner_entity_id === undefined && item.quantity === quantity) change.values.owner_entity_id = destination.entity?.id ?? null;
      // A moved thing is no longer pledged or lent by its former owner.
      if (detail.status && change.id === item.id) change.values.detail = withHistory({ ...detail, status: undefined, holderId: undefined, condition: undefined }, shadow.now, "transferred", destination.label) as unknown as JsonObject;
      shadow.apply(change);
    }
    if (settled.split && args.localKey !== undefined) shadow.bindLocalKey(str(args.localKey), { family: "items", id: splitId });
    const hint = openJobHint(shadow, giver, destination.entity);
    return ok({ itemId: settled.transferredItemId, name: item.name, quantity, to: destination.label, ...hint },
      `${item.name}${quantity > 1 ? ` ×${quantity}` : ""} goes to ${destination.label}`,
      null, chip.itemGiven(l, item.name, quantity, giver?.name ?? (l === "ru" ? "лагерь" : "the camp"), isHero(giver), destination.label, isHero(destination.entity), !!hint.openQuests));
  }
  if (action === "consume") {
    const quantity = int(args.quantity) ?? 1;
    reject(quantity >= 1 && quantity <= item.quantity, `Only ${item.quantity} × ${item.name} left; cannot consume ${quantity}.`);
    // Taking off, putting away, giving or dropping a thing is not consumption.
    reject(item.category === "consumable" || str(args.reason).length > 0,
      `${item.name} is a ${item.category}, not a consumable: consume means used up (eaten, burnt, spent).`,
      "To take it off use unequip; to give it use transfer; if it is gone use lose with a reason; if it changed use modify. If it really is used up, say why in reason.");
    const remaining = item.quantity - quantity;
    const values: JsonObject = { quantity: remaining };
    if (remaining === 0 && item.equipped_entity_id) { values.equipped_entity_id = null; values.equipped_slot = null; }
    values.detail = withHistory(itemDetail(item), shadow.now, "consumed", str(args.reason)) as unknown as JsonObject;
    shadow.apply({ family: "items", id: item.id, expectedRevision: item.revision, values });
    const bonus = potionBonusAction(shadow, item, owner);
    return ok({ itemId: item.id, name: item.name, consumed: quantity, remaining, ...(bonus ? { bonusAction: bonus } : {}) }, `${ownerName(shadow, item)} uses ${item.name}${quantity > 1 ? ` ×${quantity}` : ""} (${remaining} left)${bonus ? `; ${bonus}` : ""}`,
      null, chip.itemUsed(l, ownerName(shadow, item), isHero(owner), item.name, quantity, remaining));
  }
  if (action === "lose") {
    const reason = str(args.reason);
    reject(reason.length > 0, "lose needs a reason: what happened to the thing (dropped in the silt, broken, stolen).");
    reject(item.quantity > 0, `${item.name} is already gone.`);
    const quantity = int(args.quantity) ?? item.quantity;
    reject(quantity >= 1 && quantity <= item.quantity, `${ownerName(shadow, item)} has ${item.quantity} × ${item.name}, not ${quantity}.`);
    const remaining = item.quantity - quantity;
    const detail = itemDetail(item);
    const values: JsonObject = { quantity: remaining,
      detail: withHistory({ ...detail, ...(remaining === 0 ? { status: "lost", note: reason, holderId: undefined, condition: undefined } : {}) }, shadow.now, "lost", reason) as unknown as JsonObject };
    if (remaining === 0 && item.equipped_entity_id) { values.equipped_entity_id = null; values.equipped_slot = null; }
    shadow.apply({ family: "items", id: item.id, expectedRevision: item.revision, values });
    return ok({ itemId: item.id, name: item.name, lost: quantity, remaining, reason }, `${ownerName(shadow, item)} loses ${item.name}${quantity > 1 ? ` ×${quantity}` : ""} (${reason})`,
      null, chip.itemLost(l, ownerName(shadow, item), isHero(owner), item.name, reason));
  }
  if (action === "modify") {
    reject(item.quantity > 0, `${item.name} is gone; a lost thing cannot change.`);
    const values: JsonObject = {};
    if (args.name !== undefined) values.name = str(args.name);
    if (args.description !== undefined) values.description = str(args.description);
    if (args.properties !== undefined) values.mechanics = str(args.properties);
    if (args.rarity !== undefined) {
      const rarity = str(args.rarity);
      reject((ITEM_RARITIES as readonly string[]).includes(rarity), `rarity: ${ITEM_RARITIES.join(", ")}.`);
      values.rarity = rarity;
    }
    if (args.category !== undefined) {
      const category = str(args.category);
      reject((ITEM_CATEGORIES as readonly string[]).includes(category), `category: ${ITEM_CATEGORIES.join(", ")}.`);
      values.category = category;
      if (item.equipped_entity_id) {
        const wearer = shadow.entity(item.equipped_entity_id);
        const fits = wearer?.equipment_slots.some((slot) => slot.id === item.equipped_slot && slot.accepts.includes(category));
        if (!fits) { values.equipped_entity_id = null; values.equipped_slot = null; }
      }
    }
    const mechanics = MECHANIC_FIELDS.some((field) => args[field] !== undefined);
    reject(Object.keys(values).length > 0 || mechanics, "modify needs a new name, description, properties, category, rarity, bonuses, hands, charges or attunement.");
    const note = str(args.reason);
    // The applier updates the row in place: remember the old name first.
    const previousName = item.name;
    const name = (values.name as string | undefined) ?? previousName;
    values.detail = withHistory(mechanicsDetail(args, itemDetail(item)), shadow.now, "modified", `${previousName}${name !== previousName ? ` → ${name}` : ""}${note ? ` — ${note}` : ""}`) as unknown as JsonObject;
    shadow.apply({ family: "items", id: item.id, expectedRevision: item.revision, values });
    return ok({ itemId: item.id, name, previousName, changed: Object.keys(values).filter((k) => k !== "detail") }, `${previousName} changed${name !== previousName ? ` → ${name}` : ""}${note ? ` (${note})` : ""}`,
      null, chip.itemModified(l, previousName, name, note));
  }
  if (action === "pledge" || action === "lend") {
    reject(item.owner_entity_id, `${item.name} belongs to nobody; only an owned thing can be pledged or lent.`);
    const holder = entityOf(shadow, args.ownerRef, "ownerRef");
    reject(holder.id !== item.owner_entity_id, `${item.name} already belongs to ${holder.name}.`);
    reject(item.equipped_entity_id === null, `${item.name} is equipped by ${ownerName(shadow, item)}.`, "Unequip it first (item unequip).");
    reject(item.quantity > 0, `${item.name} is gone.`);
    const condition = str(args.condition);
    const detail: ItemDetail = { ...itemDetail(item), status: action === "pledge" ? "pledged" : "lent", holderId: holder.id, condition };
    shadow.apply({ family: "items", id: item.id, expectedRevision: item.revision, values: { storage_id: shadow.storageFor(holder).id,
      detail: withHistory(detail, shadow.now, action === "pledge" ? "pledged" : "lent", `${holder.name}${condition ? ` — ${condition}` : ""}`) as unknown as JsonObject } });
    return ok({ itemId: item.id, name: item.name, owner: ownerName(shadow, item), holder: holder.name, status: detail.status ?? null, condition: condition || null },
      `${item.name} ${action === "pledge" ? "pledged" : "lent"} to ${holder.name}${condition ? ` (${condition})` : ""}; ${ownerName(shadow, item)} keeps the title`,
      null, chip.itemPledged(l, action === "pledge" ? "pledge" : "loan", item.name, holder.name, condition));
  }
  if (action === "equip") {
    reject(item.owner_entity_id, `${item.name} lies in ${ownerName(shadow, item)}; only an owned item can be equipped.`);
    reject(!itemDetail(item).status, `${item.name} is ${itemDetail(item).status} (with ${holderName(itemDetail(item)) ?? "someone"}); it must come back first.`);
    let owner = shadow.entity(item.owner_entity_id)!;
    reject(item.quantity > 0, `${item.name} is used up.`);
    // Fix run D (§3): a person's doll is the eleven slots; an older one converts on first use.
    if (["player", "companion", "npc"].includes(owner.kind)) owner = ensureUniversalSlots(shadow, owner);
    item = shadow.item(item.id)!;
    reject((ITEM_KINDS as readonly string[]).includes(item.category), `${item.name} has the kind "${item.category}", which no slot takes.`,
      `Set its kind first: item modify category (${ITEM_KINDS.join(", ")}).`);
    const plan = equipPlan(owner, shadow.snapshot.items.filter((row) => row.campaign_id === shadow.campaignId), item, args.slot !== undefined ? str(args.slot) : null, shadow.snapshot.settings.values.language);
    if (!plan.ok) throw new ToolReject(plan.reason, plan.hint ?? null);
    for (const occupant of plan.unequip) {
      const now = shadow.item(occupant.id)!;
      shadow.apply({ family: "items", id: now.id, expectedRevision: now.revision, values: { equipped_entity_id: null, equipped_slot: null } });
    }
    const wearing = shadow.item(item.id)!;
    shadow.apply({ family: "items", id: wearing.id, expectedRevision: wearing.revision,
      values: { equipped_entity_id: owner.id, equipped_slot: plan.slot.id, storage_id: shadow.storageFor(owner).id } });
    return ok({ itemId: item.id, name: item.name, owner: owner.name, slot: plan.slot.id, unequipped: plan.unequip.map((row) => row.name).join(", ") || null },
      `${owner.name} equips ${item.name} (${plan.slot.label})`, null, chip.itemEquipped(l, owner.name, isHero(owner), item.name, plan.slot.label));
  }
  if (action === "unequip") {
    reject(item.equipped_entity_id, `${item.name} is not equipped.`);
    shadow.apply({ family: "items", id: item.id, expectedRevision: item.revision, values: { equipped_entity_id: null, equipped_slot: null } });
    return ok({ itemId: item.id, name: item.name }, `${ownerName(shadow, item)} takes off ${item.name} (it stays in the inventory)`,
      null, chip.itemUnequipped(l, ownerName(shadow, item), isHero(owner), item.name));
  }
  reject(action === "split", `Unknown item action "${action}".`);
  const quantity = int(args.quantity);
  reject(quantity !== null && quantity >= 1 && quantity < item.quantity, `Split needs a quantity between 1 and ${item.quantity - 1}.`);
  const key = localKey(args.localKey) ?? `split-${ctx.toolCalls}`;
  const id = shadow.newId(`item:${key}`);
  shadow.apply({ family: "items", id: item.id, expectedRevision: item.revision, values: { quantity: item.quantity - quantity } });
  shadow.apply({ family: "items", id, expectedRevision: null, values: { name: item.name, category: item.category, quantity,
    description: item.description, mechanics: item.mechanics, owner_entity_id: item.owner_entity_id, storage_id: item.storage_id,
    equipped_entity_id: null, equipped_slot: null, detail: {} } });
  shadow.bindLocalKey(key, { family: "items", id });
  return ok({ itemId: id, localKey: key, name: item.name, quantity }, `${item.name} split: ${quantity} set aside`, null, chip.itemSplit(l, item.name, quantity));
}

// --- money -----------------------------------------------------------------
/** Money that enters the world (a grant, a reward nobody pays) counts against the pinned per-turn limit. */
function mintMoney(shadow: ShadowState, amount: number, ctx: ToolContext, what: string) {
  const limit = ctx.limits.moneyPerTurn;
  reject(shadow.counters.moneyGranted + amount <= limit,
    `${what}: this turn has already created ${shadow.counters.moneyGranted} in money; the campaign allows ${limit} per turn.`,
    "Let an existing character pay (transfer), reduce the sum, or spread it over several turns.");
  shadow.counters.moneyGranted += amount;
}
/** Fix run D (§2): who holds money — a character (its wallet entries) or a storage (a place's pile, a base, a
 * mount's saddlebags: detail.wallet). */
type Holder = { entity: Entity; storage: null; name: string } | { entity: null; storage: Storage; name: string };
function holderOf(shadow: ShadowState, value: unknown, what: string): Holder {
  const storage = storageRefOf(shadow, value, what);
  if (storage) return { entity: null, storage, name: storage.name };
  const entity = entityOf(shadow, value, what);
  reject(entity.kind !== "faction", `${entity.name} is a faction; money belongs to its people or a holding.`);
  return { entity, storage: null, name: entity.name };
}
function balanceOf(shadow: ShadowState, holder: Holder, label: string): number {
  if (holder.entity) return moneyOf(shadow.entity(holder.entity.id)!, currencyKeyFor(label));
  return walletOfStorage(shadow.storage(holder.storage.id)!)[label] ?? 0;
}
function setBalance(shadow: ShadowState, holder: Holder, label: string, amount: number) {
  if (holder.entity) {
    const now = shadow.entity(holder.entity.id)!;
    setResources(shadow, now, { ...now.resources, [currencyKeyFor(label)]: amount });
    return;
  }
  const now = shadow.storage(holder.storage.id)!;
  const wallet = { ...walletOfStorage(now), [label]: amount };
  shadow.apply({ family: "storages", id: now.id, expectedRevision: now.revision, values: { detail: { ...(now.detail ?? {}), wallet } as unknown as JsonObject } });
}
/** The coin's label: a 5e coin word → its code (зм, см…); any other currency → the campaign's canonical word. */
function moneyLabel(shadow: ShadowState, word: unknown): string {
  const coin = coinOf(str(word), shadow.snapshot.settings.values.language);
  return coin ? coin.code : currencyKey(shadow, word).label;
}
const PAID_GRANT = "paid_grant_";
/** Fix run D (§2, the mine's loot paid twice): the grants already paid, kept as private server facts. */
function paidGrants(shadow: ShadowState): { source: string; reason: string; currency: string; amount: number; to: string }[] {
  const bucket = shadow.source.privateState.fact;
  if (!bucket || typeof bucket !== "object" || Array.isArray(bucket)) return [];
  return Object.entries(bucket).filter(([key]) => key.startsWith(PAID_GRANT)).flatMap(([, value]) => {
    try { return [JSON.parse(String(value))]; } catch { return []; }
  });
}
const plainText = (value: string) => value.toLocaleLowerCase().replace(/[«»"'“”.,!?]/g, "").replace(/\s+/g, " ").trim();
function moneyTool(shadow: ShadowState, args: Args, ctx: ToolContext): DmLoopReceiptResult {
  const action = str(args.action);
  const label = moneyLabel(shadow, args.currency);
  const amount = int(args.amount);
  reject(amount !== null && amount >= 1 && amount <= L.maxMoneyPerCall, `amount must be between 1 and ${L.maxMoneyPerCall}.`);
  const fmt = (n: number) => `${n} ${label}`;
  const sum = currencyAmount(ctx.language, amount, label);
  if (action === "transfer") {
    const from = holderOf(shadow, args.fromRef, "fromRef");
    const to = holderOf(shadow, args.toRef, "toRef");
    reject((from.entity?.id ?? from.storage?.id) !== (to.entity?.id ?? to.storage?.id), "Payer and recipient are the same.");
    const have = balanceOf(shadow, from, label);
    reject(have >= amount, `Not enough ${label}: ${from.name} has ${have}, this needs ${amount}.`,
      have > 0 ? `Offer up to ${fmt(have)}, barter, or let the deal fail.` : null);
    setBalance(shadow, from, label, have - amount);
    const toBalance = balanceOf(shadow, to, label) + amount;
    setBalance(shadow, to, label, toBalance);
    // A payment from a quest's issuer to its recipient after completion settles
    // that reward: the server keeps the reward paid exactly once either way.
    const settled = from.entity ? shadow.snapshot.quests.find((quest) => quest.campaign_id === shadow.campaignId && quest.status === "complete" &&
      (() => { const terms = rewardTerms(shadow, quest); return !!terms && !terms.paidOperationId && terms.issuerId === from.entity!.id && terms.currency === label; })()) : undefined;
    if (settled) {
      const terms = rewardTerms(shadow, settled)!;
      shadow.setPrivate("fact", `quest_reward_${settled.id}`, JSON.stringify({ ...terms, paidOperationId: shadow.operationId }));
    }
    return ok({ currency: label, amount, from: from.name, to: to.name, fromBalance: have - amount, toBalance,
      ...(settled ? { settlesQuest: settled.title, note: `This payment counts as the reward of "${settled.title}"; it will not be paid again.` } : openJobHint(shadow, from.entity, to.entity)) },
      `${from.name} pays ${to.name} ${fmt(amount)}${settled ? ` (reward for "${settled.title}")` : ""}`,
      null, chip.moneyPaid(ctx.language, sum, from.name, isHero(from.entity), to.name, isHero(to.entity), settled ? settled.title : null));
  }
  if (action === "grant") {
    const to = holderOf(shadow, args.toRef, "toRef");
    const reason = str(args.reason);
    reject(reason.length > 0, "A grant needs a reason (a paid job, loot, a gift).");
    if (args.questRef !== undefined) {
      const quest = questOf(shadow, args.questRef, "questRef");
      const terms = rewardTerms(shadow, quest);
      reject(!terms || !terms.paidOperationId, `The reward of "${quest.title}" was already paid.`,
        "Do not pay it again; the character may remember it was settled.");
      reject(false, `Use quest claim_reward for the reward of "${quest.title}"; it pays the agreed terms exactly once.`);
    }
    // One source pays once (the chest, the body, the employer); the same reason, coin, amount and recipient too.
    const source = args.sourceRef !== undefined ? plainText(str(args.sourceRef)) : "";
    const before = paidGrants(shadow).find((row) => (source && row.source === source) ||
      (row.reason === plainText(reason) && row.currency === label && row.amount === amount && row.to === to.name));
    reject(!before || args.repeat === true,
      ctx.language === "ru" ? `Уже выплачено: ${before?.amount} ${before?.currency} (${before?.reason}).` : `Already paid: ${before?.amount} ${before?.currency} (${before?.reason}).`,
      "If this is new money from the same source, grant again with repeat: true and say why in reason; to move money that already exists, use transfer.");
    mintMoney(shadow, amount, ctx, "money grant");
    const balance = balanceOf(shadow, to, label) + amount;
    setBalance(shadow, to, label, balance);
    shadow.setPrivate("fact", `${PAID_GRANT}${shadow.operationId.slice(0, 8)}_${ctx.toolCalls}`,
      JSON.stringify({ source, reason: plainText(reason), currency: label, amount, to: to.name }));
    return ok({ currency: label, amount, to: to.name, balance, reason }, `${to.name} receives ${fmt(amount)} (${reason})`,
      null, to.entity ? chip.moneyReceived(ctx.language, sum, to.name, isHero(to.entity), reason) : chip.moneyReceived(ctx.language, sum, to.name, false, reason));
  }
  reject(action === "spend", `Unknown money action "${action}".`);
  const from = holderOf(shadow, args.fromRef, "fromRef");
  const have = balanceOf(shadow, from, label);
  reject(have >= amount, `Not enough ${label}: ${from.name} has ${have}, this costs ${amount}.`);
  setBalance(shadow, from, label, have - amount);
  return ok({ currency: label, amount, from: from.name, balance: have - amount, reason: str(args.reason) }, `${from.name} spends ${fmt(amount)}${args.reason ? ` (${str(args.reason)})` : ""}`,
    null, chip.moneySpent(ctx.language, sum, from.name, isHero(from.entity), str(args.reason)));
}

// --- resource --------------------------------------------------------------
function resourceTool(shadow: ShadowState, args: Args, ctx: ToolContext): DmLoopReceiptResult {
  const actor = entityOf(shadow, args.actorRef, "actorRef");
  const name = str(args.resource).toLowerCase();
  const delta = int(args.delta), set = int(args.set), max = int(args.max);
  reject(delta !== null || set !== null || max !== null, "Give delta, set or max.");
  const reason = str(args.reason);
  if (name === "hp") {
    const maxHp = max ?? actor.max_hp;
    reject(maxHp !== null, `${actor.name} has no hit points yet.`, "Pass max to give the character hit points.");
    const current = actor.hp ?? maxHp;
    let next = set ?? current + (delta ?? 0);
    next = Math.max(0, Math.min(maxHp, next));
    shadow.apply(entityChange(shadow, actor, { hp: next, max_hp: maxHp }));
    mirrorFightHp(shadow, actor, next, maxHp, current - next, reason, null, ctx.language);
    // Fix S3-pre (opening attacks): hit points given for the first time take the damage an opening attack already dealt.
    if (actor.max_hp === null && settlePendingDamage(shadow, shadow.entity(actor.id)!)) next = shadow.entity(actor.id)!.hp ?? next;
    const controlled = new Set(shadow.runtime.configuration?.controlledEntityIds ?? [shadow.hero().id]);
    // The hero's and the party's hit points are the player's business; an NPC's stay with the DM.
    const player = controlled.has(actor.id) && (current !== next || max !== null) ? chip.hp(ctx.language, actor.name, isHero(actor), current, next, maxHp, reason) : null;
    return ok({ actor: actor.name, resource: "hp", before: current, after: next, max: maxHp, reason },
      `${actor.name}: HP ${current} → ${next}/${maxHp} (${reason})`, null, player);
  }
  // Fix run F (item 32 b): a counter named in the campaign language gets a Latin key; the name stays as its label.
  const parsed = counterKeyOf(str(args.resource));
  reject(parsed, "Counter names are words (any language) or identifiers.", "For example «Ячейки 1 круга», «Кости хитов» or hit_dice.");
  const key = parsed.key;
  const label = str(args.label) || parsed.label || "";
  // Fix run D (§1): a counter is a pool; money and things are never counters.
  reject(!key.startsWith("currency_"), "Money is not a counter.", "Use money (grant, transfer, spend) with the coin's name.");
  reject(!potionCounter(key, label) && !/^(arrows?|bolts?|ammo|ammunition)$/.test(key),
    `${name} is a thing, not a counter: potions and ammunition are items.`, "Use item create (kind consumable or ammunition) and item consume.");
  const cast = args.spell !== undefined ? castSpell(actor, key, str(args.spell), delta, set, ctx.language) : null;
  const resources = { ...actor.resources };
  // A party member's new counter reaches the player's screens: it comes with its name in the campaign language.
  const party = new Set(shadow.runtime.configuration?.controlledEntityIds ?? [shadow.hero().id]);
  reject(!party.has(actor.id) || key in resources || label.length > 0 || counterLabelled(actor, key) || /_(min|max)$/.test(key),
    `A new counter of the party needs its name in the campaign language (label), shown to the player.`, `For example label «Кости хитов» for hit_dice.`);
  if (label && actor.public_profile?.counterLabels?.[key] !== label) {
    const profile = publicProfileOf(actor);
    shadow.apply(entityChange(shadow, actor, { public_profile: { ...profile, counterLabels: { ...(profile.counterLabels ?? {}), [key]: label } } as unknown as JsonObject }));
  }
  const current = Number(resources[key] ?? 0);
  // Fix S3-pre B-4 (the owner's rule): Heroic Inspiration is one at a time — the counter's maximum is 1 and a second grant is refused.
  const inspiration = key === HEROIC_INSPIRATION;
  const cap = inspiration ? 1 : max ?? (Number.isFinite(Number(resources[`${key}_max`])) && resources[`${key}_max`] !== undefined ? Number(resources[`${key}_max`]) : null);
  let next = set ?? current + (delta ?? 0);
  if (inspiration) reject(!(current >= 1 && next >= 1), `${actor.name} already has Heroic Inspiration: one at a time.`, "Grant it again only after the player spends it (roll with heroicInspiration: true).");
  const floor = resourceFloor(resources, key);
  reject(next >= floor, `${actor.name}: ${name} is ${current}; it cannot drop below ${floor} (asked for ${next}).`,
    floor === 0 ? "A ruleset that keeps a signed counter stores its floor as <name>_min." : null);
  if (cap !== null) { next = Math.min(next, cap); resources[`${key}_max`] = cap; }
  resources[key] = next;
  setResources(shadow, actor, resources);
  const controlled = new Set(shadow.runtime.configuration?.controlledEntityIds ?? [shadow.hero().id]);
  const shown = `${cast ? `${cast.name} · ` : ""}${counterLabel(shadow.entity(actor.id)!, key, ctx.language)}`;
  const player = controlled.has(actor.id) && !name.endsWith("_min") && !name.endsWith("_max")
    ? chip.counter(ctx.language, actor.name, isHero(actor), shown, current, next, cap, reason) : null;
  return ok({ actor: actor.name, resource: name, before: current, after: next, max: cap, reason, ...(cast ? { spell: cast.name } : {}) },
    `${actor.name}: ${cast ? `${cast.name} with ` : ""}${name} ${current} → ${next}${cap !== null ? `/${cap}` : ""} (${reason})`, null, player);
}
/** Fix S3-accept В1: a cast recorded with its slot — the spell is on the caster's sheet (prose «Умения» read as
 * converted), levelled, of a level the slot allows, prepared when the caster prepares; the slot is spent, not set. */
function castSpell(actor: Entity, key: string, spellName: string, delta: number | null, set: number | null, language: unknown): { name: string; level: number } {
  const slot = /^spell_slots_([1-9])$/.exec(key);
  reject(slot, `spell goes with a spell slot (spell_slots_N), not "${key}".`);
  const sheet = (convertSpellProse(actor.character_sheet as AnySheet | null | undefined, language)?.sheet ?? actor.character_sheet) as AnySheet | null | undefined;
  const spells = sheet?.schemaVersion === 2 ? sheet.spells ?? [] : [];
  const key2 = (text: string) => text.toLocaleLowerCase().replace(/ё/g, "е").replace(/[«»"]/g, "").trim();
  const spell = spells.find((row) => key2(row.name) === key2(spellName));
  reject(spell, `${actor.name}'s sheet has no spell "${spellName}".`,
    spells.length ? `The sheet's spells: ${spells.slice(0, 24).map((row) => row.name).join(", ")}.` : "Add it with upsert_character sheet (spells) and a reason first.");
  reject(spell.level > 0, `${spell.name} is a cantrip: it spends no slot.`, "Narrate it without a resource call.");
  reject(Number(slot[1]) >= spell.level, `${spell.name} is a level ${spell.level} spell; a level ${slot[1]} slot cannot cast it.`);
  reject(set === null && (delta ?? 0) < 0, "A cast spends its slot: delta -1.");
  const prepares = (sheet?.schemaVersion === 2 && sheet.preparedMax != null) || spells.some((row) => row.level > 0 && row.prepared !== undefined);
  reject(!prepares || spell.prepared === true, `${spell.name} is in ${actor.name}'s book but not prepared today.`,
    spell.ritual ? "As a ritual it is cast without a slot (no resource call); or prepare it on a long rest (upsert_character sheet with a reason)."
      : "Prepare it on a long rest (upsert_character sheet with a reason), or cast a prepared spell.");
  return { name: spell.name, level: spell.level };
}
/** Fix S3-accept В1: a party member's counter after an accepted `resource` call — the turn's live stream carries it, so
 * the open screens dim a spent slot at once (the commit's records replace it). Null for HP and anyone else's counters. */
export function liveCounterOf(shadow: ShadowState, args: Args): { entityId: string; key: string; value: number; max: number | null } | null {
  try {
    if (str(args.resource).toLowerCase() === "hp") return null;
    const actor = entityOf(shadow, args.actorRef, "actorRef");
    const controlled = new Set(shadow.runtime.configuration?.controlledEntityIds ?? []);
    if (actor.kind !== "player" && !controlled.has(actor.id)) return null;
    const key = counterKeyOf(str(args.resource))?.key;
    const value = key ? Number(actor.resources[key]) : NaN;
    if (!key || !Number.isFinite(value)) return null;
    const max = Number(actor.resources[`${key}_max`]);
    return { entityId: actor.id, key, value, max: Number.isFinite(max) ? max : null };
  } catch { return null; }
}

// --- quests ----------------------------------------------------------------
type RewardTerms = { currency: string | null; amount: number | null;
  items: { name: string; category: string; quantity: number; properties: string }[]; note: string | null;
  issuerId: string | null; paidOperationId: string | null };
function rewardTerms(shadow: ShadowState, quest: Quest): RewardTerms | null {
  const raw = shadow.privateValue("fact", `quest_reward_${quest.id}`);
  if (typeof raw !== "string") return null;
  try { return JSON.parse(raw) as RewardTerms; } catch { return null; }
}
function parseReward(shadow: ShadowState, value: unknown, issuerId: string | null): RewardTerms | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as { currency?: unknown; amount?: unknown; items?: unknown; note?: unknown };
  const terms: RewardTerms = { currency: null, amount: null, items: [], note: raw.note === undefined ? null : str(raw.note), issuerId, paidOperationId: null };
  if (raw.currency !== undefined || raw.amount !== undefined) {
    reject(raw.currency !== undefined && raw.amount !== undefined, "A money reward needs both currency and amount.");
    terms.currency = moneyLabel(shadow, raw.currency);
    terms.amount = int(raw.amount);
  }
  for (const item of (raw.items as { name: unknown; category: unknown; quantity: unknown; properties?: unknown }[] | undefined) ?? [])
    terms.items.push({ name: str(item.name), category: str(item.category), quantity: int(item.quantity) ?? 1, properties: str(item.properties ?? "") });
  if (terms.currency === null && !terms.items.length && !terms.note) return null;
  return terms;
}
function rewardText(terms: RewardTerms | null): string {
  if (!terms) return "";
  return [terms.currency ? `${terms.amount} ${terms.currency}` : null,
    ...terms.items.map((item) => `${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ""}`), terms.note]
    .filter(Boolean).join(", ");
}
function questTool(shadow: ShadowState, args: Args, ctx: ToolContext): DmLoopReceiptResult {
  const action = str(args.action);
  const kindArg = args.kind !== undefined ? str(args.kind) : null;
  reject(kindArg === null || (QUEST_KINDS as readonly string[]).includes(kindArg), `kind: ${QUEST_KINDS.join(", ")}.`);
  /** The journal detail of a quest, thread, debt, promise or arc (public, hero knowledge). */
  const detailPatch = (current: QuestDetail | undefined, kind: string): QuestDetail | null => {
    const detail: QuestDetail = { ...(current ?? {}) };
    let touched = false;
    if (args.steps !== undefined) {
      reject(kind === "arc", "steps belong to the main arc (kind arc).");
      detail.steps = (args.steps as { text: unknown; done: unknown }[]).map((step) => ({ text: str(step.text), done: !!step.done }));
      touched = true;
    }
    if (args.locationRefs !== undefined) {
      detail.locationIds = [...new Set((args.locationRefs as unknown[]).map((ref) => shadow.resolve(ref, ["locations"], "locationRefs").id))];
      touched = true;
    }
    if (args.counterpartRef !== undefined) {
      detail.counterpartId = entityOf(shadow, args.counterpartRef, "counterpartRef").id;
      touched = true;
    }
    return touched ? detail : null;
  };
  if (action === "create") {
    const title = str(args.title);
    reject(title.length > 0, "quest create needs a title.");
    const kind = kindArg ?? "quest";
    reject(kind !== "arc" || !shadow.snapshot.quests.some((row) => row.campaign_id === shadow.campaignId && row.kind === "arc" && row.status === "open"),
      "The campaign already has an open main arc.", "Update it with quest update (steps, description) or complete it first.");
    const issuer = args.issuerRef !== undefined ? entityOf(shadow, args.issuerRef, "issuerRef") : null;
    const terms = kind === "quest" ? parseReward(shadow, args.reward, issuer?.id ?? null) : null;
    reject(kind === "quest" || args.reward === undefined, "Only a quest (kind quest) carries reward terms.");
    const key = localKey(args.localKey) ?? title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").slice(0, 60);
    const id = shadow.newId(`quest:${key}`);
    reject(!shadow.quest(id), `The local key "${key}" already names a quest in this turn.`);
    const reward = rewardText(terms);
    const session = shadow.snapshot.publicState.current_session_id ?? null;
    const detail = { ...(detailPatch(undefined, kind) ?? {}), sinceSessionId: session };
    shadow.apply({ family: "quests", id, expectedRevision: null, values: { title, kind,
      // Polish group 9: the reward line in the campaign language, one full stop.
      description: `${str(args.description)}${reward ? `\n${ctx.language === "ru" ? "Награда" : "Reward"}: ${reward.replace(/\.+$/, "")}.` : ""}`.trim() || title, status: "open",
      detail: detail as unknown as JsonObject } });
    shadow.bindLocalKey(key, { family: "quests", id });
    for (const placeId of detail.locationIds ?? []) {
      const place = shadow.location(placeId)!;
      const placeDetail = { ...(place.detail ?? {}), questIds: [...new Set([...(place.detail?.questIds ?? []), id])] };
      shadow.apply({ family: "locations", id: place.id, expectedRevision: place.revision, values: { detail: placeDetail as unknown as JsonObject } });
    }
    if (terms) shadow.setPrivate("fact", `quest_reward_${id}`, JSON.stringify(terms));
    const noun = kind === "quest" ? "Quest taken" : kind === "thread" ? "Thread opened" : kind === "debt" ? "Debt recorded" : kind === "promise" ? "Promise recorded" : "Main arc set";
    return ok({ id, localKey: key, title, kind, status: "open", reward: reward || null, issuer: issuer?.name ?? null },
      `${noun}: ${title}${reward ? ` (reward: ${reward})` : ""}`, null, chip.questCreated(ctx.language, kind, title, reward || null));
  }
  const quest = questOf(shadow, args.questRef, "questRef");
  if (action === "update") {
    const values: JsonObject = {};
    if (args.title !== undefined) values.title = str(args.title);
    if (args.description !== undefined) values.description = str(args.description);
    if (kindArg !== null && kindArg !== (quest.kind ?? "quest")) {
      reject((quest.kind ?? "quest") !== "quest" && kindArg !== "quest", `"${quest.title}" is a quest with its own record; threads, debts and promises are other records.`);
      values.kind = kindArg;
    }
    const detail = detailPatch(quest.detail, (values.kind as string | undefined) ?? quest.kind ?? "quest");
    if (detail) {
      values.detail = detail as unknown as JsonObject;
      for (const placeId of detail.locationIds ?? []) {
        const place = shadow.location(placeId)!;
        if (place.detail?.questIds?.includes(quest.id)) continue;
        const placeDetail = { ...(place.detail ?? {}), questIds: [...new Set([...(place.detail?.questIds ?? []), quest.id])] };
        shadow.apply({ family: "locations", id: place.id, expectedRevision: place.revision, values: { detail: placeDetail as unknown as JsonObject } });
      }
    }
    if (args.reward !== undefined) {
      reject((quest.kind ?? "quest") === "quest", "Only a quest carries reward terms.");
      const existing = rewardTerms(shadow, quest);
      reject(!existing?.paidOperationId, `The reward of "${quest.title}" was already paid; its terms are closed.`);
      const terms = parseReward(shadow, args.reward, existing?.issuerId ?? null);
      if (terms) shadow.setPrivate("fact", `quest_reward_${quest.id}`, JSON.stringify(terms));
    }
    if (Object.keys(values).length) shadow.apply({ family: "quests", id: quest.id, expectedRevision: quest.revision, values });
    return ok({ id: quest.id, title: (values.title as string) ?? quest.title }, `${(quest.kind ?? "quest") === "quest" ? "Quest" : "Journal"} updated: ${(values.title as string) ?? quest.title}`,
      null, Object.keys(values).length ? chip.questUpdated(ctx.language, quest.kind ?? "quest", (values.title as string) ?? quest.title) : null);
  }
  if (action === "complete" || action === "fail") {
    // complete after claim_reward in the same message: the claim already closed it (item 10).
    const closedThisTurn = quest.status === "complete" && action === "complete" && shadow.changesInOrder().some((change) => change.family === "quests" && change.id === quest.id && change.values.status === "complete");
    if (closedThisTurn) return ok({ id: quest.id, title: quest.title, status: "complete", alreadyClosed: true }, `Quest already completed this turn: ${quest.title}`);
    reject(quest.status === "open", `"${quest.title}" is already ${quest.status}.`);
    const status = action === "complete" ? "complete" : "archived";
    shadow.apply({ family: "quests", id: quest.id, expectedRevision: quest.revision, values: { status,
      ...(action === "fail" ? { description: `${quest.description}\nFailed.` } : {}) } });
    const noun = (quest.kind ?? "quest") === "quest" ? "Quest" : quest.kind === "arc" ? "Main arc" : quest.kind === "thread" ? "Thread" : quest.kind === "debt" ? "Debt" : "Promise";
    return ok({ id: quest.id, title: quest.title, status }, `${noun} ${action === "complete" ? (quest.kind === "debt" || quest.kind === "promise" ? "settled" : quest.kind === "thread" ? "closed" : "completed") : "failed"}: ${quest.title}`,
      null, chip.questClosed(ctx.language, quest.kind ?? "quest", quest.title, action === "fail"));
  }
  reject(action === "claim_reward", `Unknown quest action "${action}".`);
  reject((quest.kind ?? "quest") === "quest", `"${quest.title}" is a ${quest.kind}; only a quest pays a reward.`);
  reject(quest.status === "open" || quest.status === "complete", `"${quest.title}" is ${quest.status}; it pays no reward.`);
  const terms = rewardTerms(shadow, quest);
  reject(terms, `"${quest.title}" has no recorded reward terms.`, "If a reward was agreed in play, add it with quest update first.");
  reject(!terms.paidOperationId, `The reward of "${quest.title}" was already paid.`, "Refuse a second payment in character.");
  const recipient = args.recipientRef !== undefined ? entityOf(shadow, args.recipientRef, "recipientRef") : shadow.hero();
  const paid: JsonObject = { quest: quest.title, recipient: recipient.name };
  // Paying the reward of an open quest completes it (complete and claim_reward in one message, either order).
  if (quest.status === "open") {
    shadow.apply({ family: "quests", id: quest.id, expectedRevision: quest.revision, values: { status: "complete" } });
    paid.completed = true;
  }
  reject(shadow.counters.itemsCreated + terms.items.length <= turnItemCap(ctx.limits),
    `The reward of "${quest.title}" would exceed the campaign's ${turnItemCap(ctx.limits)} new items per turn.`,
    "Pay it in a later turn.");
  if (terms.currency && terms.amount) {
    const key = currencyKeyFor(moneyLabel(shadow, terms.currency));
    const issuer = terms.issuerId ? shadow.entity(terms.issuerId) : null;
    if (issuer && moneyOf(issuer, key) >= terms.amount) {
      setResources(shadow, issuer, { ...issuer.resources, [key]: moneyOf(issuer, key) - terms.amount });
      paid.paidBy = issuer.name;
    } else {
      mintMoney(shadow, terms.amount, ctx, `the reward of "${quest.title}"`);
    }
    const now = shadow.entity(recipient.id)!;
    setResources(shadow, now, { ...now.resources, [key]: moneyOf(now, key) + terms.amount });
    paid.money = `${terms.amount} ${terms.currency}`;
  }
  const storage = shadow.storageFor(recipient).id;
  shadow.counters.itemsCreated += terms.items.length;
  paid.items = terms.items.map((item, index) => {
    const id = shadow.newId(`reward:${quest.id}:${index}`);
    shadow.apply({ family: "items", id, expectedRevision: null, values: { name: item.name,
      category: (ITEM_CATEGORIES as readonly string[]).includes(item.category) ? item.category : "misc",
      quantity: item.quantity, description: `Reward for: ${quest.title}.`, mechanics: item.properties,
      owner_entity_id: recipient.id, storage_id: storage, equipped_entity_id: null, equipped_slot: null, detail: {} } });
    return { id, name: item.name, quantity: item.quantity };
  });
  shadow.setPrivate("fact", `quest_reward_${quest.id}`, JSON.stringify({ ...terms, paidOperationId: ctx.input.operationId }));
  const rewardForPlayer = [terms.currency && terms.amount ? currencyAmount(ctx.language, terms.amount, terms.currency) : null,
    ...terms.items.map((item) => `${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ""}`), terms.note].filter(Boolean).join(", ");
  return ok(paid, `${recipient.name} receives the reward for "${quest.title}": ${rewardText(terms)}${paid.completed ? " (quest completed)" : ""}`,
    null, chip.rewardPaid(ctx.language, recipient.name, isHero(recipient), quest.title, rewardForPlayer));
}

// --- rest ------------------------------------------------------------------
function restTool(shadow: ShadowState, args: Args, ctx: ToolContext): DmLoopReceiptResult {
  const kind = str(args.kind) === "long" ? "long" : "short";
  const safe = !!args.safe;
  const minutes = int(args.minutes) ?? (kind === "long" ? basicProfile.longMinutes : basicProfile.shortMinutes);
  const before = shadow.worldMinutes;
  advanceMinutes(shadow, minutes, "rest", ctx);
  const participants = (args.participantRefs as unknown[] | undefined)?.map((ref) => entityOf(shadow, ref, "participantRefs"))
    ?? shadow.partyIds().map((id) => shadow.entity(id)!);
  const recoverySetting = shadow.snapshot.settings.values.difficulty.recovery;
  const fraction = basicProfile.recovery[kind][recoverySetting];
  const recovered: JsonObject[] = [];
  for (const entity of participants) {
    if (!safe || entity.max_hp === null || entity.hp === null || fraction === 0) continue;
    const healed = Math.min(entity.max_hp, entity.hp + Math.ceil(entity.max_hp * fraction));
    if (healed !== entity.hp) {
      shadow.apply(entityChange(shadow, entity, { hp: healed }));
      recovered.push({ name: entity.name, before: entity.hp, after: healed, max: entity.max_hp });
    }
  }
  // Fix run B3 (item 73, report §20): the rest refills the rest-based counters in the same call — those the DM names,
  // and every spell slot on a safe long rest — up to each counter's own maximum (<name>_max).
  const restoredCounters: JsonObject[] = [];
  if (safe) {
    const named = new Set(((args.restore as unknown[] | undefined) ?? []).map((name) => str(name).toLowerCase().replace(/[\s-]+/g, "_")));
    for (const entity of participants) {
      const resources = { ...(shadow.entity(entity.id)?.resources ?? entity.resources) };
      let changed = false;
      for (const key of Object.keys(resources)) {
        if (key.endsWith("_max") || key.endsWith("_min") || key.startsWith("currency_")) continue;
        const max = resources[`${key}_max`];
        if (max === undefined || !Number.isFinite(Number(max))) continue;
        if (!named.has(key) && !(kind === "long" && key.startsWith("spell_slots"))) continue;
        if (Number(resources[key]) >= Number(max)) continue;
        restoredCounters.push({ name: entity.name, counter: key, before: Number(resources[key]), after: Number(max) });
        resources[key] = Number(max);
        changed = true;
      }
      if (changed) setResources(shadow, shadow.entity(entity.id) ?? entity, resources);
    }
  }
  const consumed: JsonObject[] = [];
  for (const entry of (args.consume as { itemRef: unknown; quantity: number }[] | undefined) ?? []) {
    const item = itemOf(shadow, entry.itemRef, "consume.itemRef");
    reject(entry.quantity <= item.quantity, `Only ${item.quantity} × ${item.name} available for the rest.`);
    shadow.apply({ family: "items", id: item.id, expectedRevision: item.revision, values: { quantity: item.quantity - entry.quantity } });
    consumed.push({ name: item.name, quantity: entry.quantity });
  }
  const id = stableGameplayId(ctx.input.operationId, `dm-loop:rest:${ctx.toolCalls}`);
  shadow.apply({ family: "rest_records", id, expectedRevision: null, values: { kind, status: safe ? "complete" : "interrupted",
    settings_revision: shadow.snapshot.settings.revision,
    // Fix S4 11u′: the world minute the rest ended — a long rest in the night turns the day (world-day.ts).
    public_outcome: { participants: participants.map((p) => p.name), recovered, consumed, minutes, endedAtMinutes: shadow.worldMinutes } } });
  const due = dueAfterTime(shadow, before);
  const heroId = shadow.hero().id;
  return ok({ kind, safe, minutes, recovered, restored: restoredCounters, consumed, ...due },
    `${kind === "long" ? "Long" : "Short"} rest (${minutes} min)${recovered.length ? `: ${recovered.map((r) => `${r.name} ${r.before}→${r.after}`).join(", ")}` : safe ? "" : ", no recovery"}${restoredCounters.length ? `; restored ${restoredCounters.map((r) => `${r.name} ${r.counter} ${r.before}→${r.after}`).join(", ")}` : ""}${due.duePlans ? `; ${(due.duePlans as unknown[]).length} plan(s) due` : ""}`,
    null, chip.rest(ctx.language, kind, minutes, recovered.map((r) => ({ name: String(r.name), before: Number(r.before), after: Number(r.after), hero: participants.find((p) => p.name === r.name)?.id === heroId })), safe));
}

// --- combat ----------------------------------------------------------------
/** Fix S3-pre B-6: a wound recorded outside combat attack (a roll's bundled damage, resource hp) moves the open fight's
 * mirror too — the bars, the battlefield block and the fight's card read it — with a log line for the card. */
function mirrorFightHp(shadow: ShadowState, target: Entity, after: number, max: number, damage: number, what: string, by: Entity | null, language: ChipLanguage) {
  const fight = fightRows(shadow);
  if (!fight.active) return;
  const fighter = fight.rows().map(fight.fighterOf).find((row) => row.entityId === target.id);
  if (!fighter) return;
  if (!fight.partyIds.has(target.id)) {
    fighter.combatant.hp = { current: after, max };
    if (after === 0 && !fighter.combatant.conditions.some((c) => c === "dead" || c === "unconscious")) fighter.combatant.conditions = [...fighter.combatant.conditions, "unconscious"].slice(0, 12);
    fight.saveFighter(fighter);
  }
  if (damage > 0) {
    const field = fight.fieldOf();
    field.log = [...field.log, { round: fight.active.round, actor: by?.name ?? "?", what: what || (language === "ru" ? "удар" : "hit"),
      result: language === "ru" ? `${damage} урона → ${target.name}` : `${damage} damage → ${target.name}`, ref: null }].slice(-MAX_LOG);
    fight.saveField(field);
  }
}

/** Fix S3-pre (opening attacks): the damage an opening attack dealt before the person's hit points were on record is
 * subtracted once they are (the record and the fight's mirror); returns what was subtracted. */
function settlePendingDamage(shadow: ShadowState, entity: Entity): number {
  const fight = fightRows(shadow);
  if (!fight.active || fight.partyIds.has(entity.id)) return 0;
  const fighter = fight.rows().map(fight.fighterOf).find((row) => row.entityId === entity.id);
  const pending = fighter?.combatant.pendingDamage ?? 0;
  const now = shadow.entity(entity.id);
  if (!fighter || pending <= 0 || !now || now.max_hp === null) return 0;
  const before = now.hp ?? now.max_hp;
  const after = Math.max(0, before - pending);
  shadow.apply(entityChange(shadow, now, { hp: after, max_hp: now.max_hp }));
  fighter.combatant.pendingDamage = undefined;
  fighter.combatant.hp = { current: after, max: now.max_hp };
  if (after === 0 && !fighter.combatant.conditions.some((c) => c === "dead" || c === "unconscious")) fighter.combatant.conditions = [...fighter.combatant.conditions, "unconscious"].slice(0, 12);
  fight.saveFighter(fighter);
  return before - after;
}

/** Fix S3-pre B-3 (the owner's rule): drinking a potion in a fight is a bonus action — the drinker's «Бонусное» is spent
 * when it is their turn; already spent, the drink is recorded anyway and the receipt says so (never a rejection). */
function potionBonusAction(shadow: ShadowState, item: Item, drinker: Entity | null): string | null {
  if (!drinker || !/(зель|potion|эликсир|elixir|снадоб)/iu.test(item.name)) return null;
  const fight = fightRows(shadow);
  if (!fight.active) return null;
  const field = fight.fieldOf();
  const fighter = fight.rows().map(fight.fighterOf).find((row) => row.entityId === drinker.id && row.participantId === field.activeParticipantId);
  if (!fighter) return null;
  if (!fighter.combatant.economy.bonus) return `${drinker.name}'s bonus action was already spent this turn (the drink is recorded)`;
  fighter.combatant.economy.bonus = false;
  fight.saveFighter(fighter);
  return `${drinker.name}'s bonus action is spent (a potion is a bonus action)`;
}

// --- the fight's attack (2D Live part 2; fix S3-pre 1: the writer's attacks too) ----------------------
/** The open fight's rows, as the combat tool and the writer's attacks read and save them. */
function fightRows(shadow: ShadowState) {
  const active = shadow.runtime.encounters.find((row) => row.status === "active") ?? null;
  const partyIds = new Set(shadow.partyIds());
  const rows = () => (active ? shadow.runtime.participants.filter((row) => row.encounter_id === active.id).sort((a, b) => a.turn_order - b.turn_order) : []);
  const fighterOf = (row: EncounterParticipant): BattleFighter => ({ participantId: row.id, entityId: row.entity_id, name: row.public_name, turnOrder: row.turn_order,
    combatant: parseCombatant(row.public_resources, { side: row.entity_id && partyIds.has(row.entity_id) ? "party" : "foe" }), placement: parsePlacement(row.public_position) });
  const fieldOf = () => parseField((active as { public_field?: unknown } | null)?.public_field);
  const saveField = (field: Field) => shadow.apply({ family: "encounters", id: active!.id, expectedRevision: null, values: { public_field: fieldJson(field) } });
  const saveFighter = (fighter: BattleFighter) => shadow.apply({ family: "encounter_participants", id: fighter.participantId, expectedRevision: null,
    values: { public_resources: combatantJson(fighter.combatant), public_position: placementJson(fighter.placement) } });
  return { active, partyIds, rows, fighterOf, fieldOf, saveField, saveFighter };
}
type FightRows = ReturnType<typeof fightRows>;
type FightSide = { entity: Entity; fighter: BattleFighter };

// --- the fight's opening attacks (fix S3-pre, the owner's ask after the probes) ---------------------------------
// In «пишет — записывает» the writer rolls the opening blows before the bookkeeper's combat start: no battlefield
// existed yet, so they skipped the rules (7 attacks over the two probes). In a system with the rules module the first
// attack between two people now opens the fight on the server — the party and the two, no positions, the attacker acting — and
// is resolved by it like every later blow; the bookkeeper's combat start completes that fight (placements, initiative,
// stat blocks) instead of opening a second one; a person the attack names before anyone recorded them becomes a bare
// record that the bookkeeper's upsert_character completes.

/** Two names are one person when a word of each starts the same way (Russian declension: «Кривого Яна» is «Кривой Ян»). */
function nearNames(a: string, b: string): boolean {
  const stems = (name: string) => name.toLocaleLowerCase().split(/[^\p{L}\p{N}]+/u).filter((word) => word.length >= 3).map((word) => word.slice(0, Math.min(4, word.length - 1)));
  const left = new Set(stems(a));
  return stems(b).some((stem) => left.has(stem));
}
/** The id of a person an opening attack named before any record (upsert_character merges into it). */
const fightPersonId = (shadow: ShadowState, name: string) => shadow.newId(`entity:fight:${name.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").slice(0, 60)}`);
/** A person created this turn by an opening attack, by name (the bookkeeper's upsert_character of the same person). */
function fightPersonNamed(shadow: ShadowState, name: string): Entity | null {
  const entity = shadow.entity(fightPersonId(shadow, name));
  return entity && shadow.createdIds.has(entity.id) ? entity : null;
}
type FightPerson = { entity: Entity } | { name: string };
/** Who an opening attack names: a record (by id, local key or name), or a person's name nobody holds yet (capitalised,
 * near no one on record) to be recorded bare; null when it is neither (an object, «dm», a generic word): the plain roll stands. */
function fightPersonOf(shadow: ShadowState, ref: unknown, what: string): FightPerson | null {
  try { return { entity: entityOf(shadow, ref, what) }; } catch (error) {
    const name = typeof ref === "string" ? ref.trim() : "";
    if (!(error instanceof ToolReject) || !name || name.length > 60 || name.toLowerCase() === "dm" || /^[0-9a-f-]{8,}$/i.test(name) || !/^\p{Lu}/u.test(name)) return null;
    const existing = fightPersonNamed(shadow, name);
    if (existing) return { entity: existing };
    const near = shadow.snapshot.entities.filter((row) => row.campaign_id === shadow.campaignId && row.kind !== "faction" && nearNames(row.name, name));
    reject(!near.length, `${what}: nothing named "${name}" is on record; similar: ${near.map((row) => row.name).join(", ")}.`, "Name the person exactly as the records do.");
    return { name };
  }
}
function recordFightPerson(shadow: ShadowState, ctx: ToolContext, person: FightPerson): Entity {
  if ("entity" in person) return person.entity;
  reject(shadow.counters.charactersCreated < ctx.limits.charactersPerTurn, `This turn already introduced ${ctx.limits.charactersPerTurn} new characters, the campaign's limit per turn.`);
  shadow.counters.charactersCreated++;
  const id = fightPersonId(shadow, person.name);
  shadow.apply({ family: "entities", id, expectedRevision: null, values: { kind: "npc", name: person.name, details: "", hp: null, max_hp: null, stats: {}, resources: {}, conditions: [],
    equipment_slots: humanoidSlots(shadow.snapshot.settings.values.language) as unknown as JsonObject[] } });
  const config = shadow.configuration();
  config.presentEntityIds = [...new Set([...config.presentEntityIds, id])];
  shadow.setConfiguration(config);
  return shadow.entity(id)!;
}
/** One person joins the open fight at the end of the order (no position, the default economy). */
function joinFight(shadow: ShadowState, ctx: ToolContext, encounterId: string, entity: Entity, turnOrder: number, active: boolean): BattleFighter {
  const partyIds = new Set(shadow.partyIds());
  const participantId = stableGameplayId(ctx.input.operationId, `dm-loop:participant:${encounterId}:${entity.id}`);
  const combatant: Combatant = { initiative: null, active, side: partyIds.has(entity.id) ? "party" : "foe", economy: defaultEconomy(), conditions: [], deathSaves: null,
    hp: !partyIds.has(entity.id) && entity.max_hp ? { current: entity.hp ?? entity.max_hp, max: entity.max_hp } : null, known: [], intent: null,
    ac: null, resist: [], immune: [], vulnerable: [], defending: false, withdrawn: false };
  const fighter: BattleFighter = { participantId, entityId: entity.id, name: entity.name, turnOrder, combatant, placement: { position: "nearby", x: null, y: null, z: 0 } };
  shadow.apply({ family: "encounter_participants", id: participantId, expectedRevision: null, values: { encounter_id: encounterId, entity_id: entity.id, public_name: entity.name,
    turn_order: turnOrder, public_position: placementJson(fighter.placement), public_resources: combatantJson(combatant) } });
  const config = shadow.configuration();
  config.presentEntityIds = [...new Set([...config.presentEntityIds, entity.id])];
  shadow.setConfiguration(config);
  return fighter;
}
/** The fight opened by its first attack (a system with the rules module): the attacker first, then the party, then the target. */
function openFightOnAttack(shadow: ShadowState, ctx: ToolContext, actor: Entity, target: Entity): void {
  const id = stableGameplayId(ctx.input.operationId, `dm-loop:encounter:${ctx.toolCalls}`);
  const field: Field = { ...parseField({}), locationId: shadow.snapshot.publicState.current_location_id, openedByAttack: true, rules: true };
  shadow.apply({ family: "encounters", id, expectedRevision: null, values: { status: "active", round: 1, outcome: null, settings_revision: shadow.snapshot.settings.revision,
    public_summary: "", public_field: fieldJson(field) } });
  const people = [...new Map([actor, ...shadow.partyIds().map((pid) => shadow.entity(pid)!).filter(Boolean), target].map((row) => [row.id, row])).values()];
  const fighters = people.map((entity, index) => joinFight(shadow, ctx, id, entity, index + 1, index === 0));
  field.activeParticipantId = fighters[0].participantId;
  shadow.apply({ family: "encounters", id, expectedRevision: null, values: { public_field: fieldJson(field) } });
}
const OPENED_FIGHT = "This attack opened the fight on the server (no positions yet; the opening blows go by the fight's rules); combat start completes it (placements, initiative, stat blocks) with the rolls and the damage standing, and combat end closes it when it is over.";

/** Fix S3-pre 1: an attack line as the sheets and the gear write it («Меч +4, 1d8+2 рубящий», «+5 к попаданию,
 * 1к12+3 рубящий»): the attack bonus, the damage formula and the damage type, whichever the line names. */
export function parseAttackLine(text: string): { bonus: number | null; damage: string | null; damageType: string | null } {
  const line = text.replace(/[−–]/g, "-");
  const dice = /(\d{1,2})\s*[dкд]\s*(\d{1,4})(?:\s*([+-])\s*(\d{1,3}))?/iu.exec(line);
  const damage = dice ? `${dice[1]}d${dice[2]}${dice[3] ? `${dice[3]}${dice[4]}` : ""}` : null;
  const rest = dice ? `${line.slice(0, dice.index)} ${line.slice(dice.index + dice[0].length)}` : line;
  const bonus = /(?:^|[\s,(:])([+-])\s?(\d{1,2})(?!\d)/u.exec(rest);
  const words = dice ? line.slice(dice.index + dice[0].length).split(/[^\p{L}-]+/u).filter(Boolean).slice(0, 4) : [];
  const damageType = words.find((word) => !/^(урон\p{L}*|damage|of|points?|к|to|на|и|and)$/iu.test(word))?.toLowerCase() ?? null;
  return { bonus: bonus ? (bonus[1] === "-" ? -1 : 1) * Number(bonus[2]) : null, damage, damageType };
}

/** Fix S3-pre 1: the attack a weapon or spell name stands for — the attacker's sheet line, the properties of a weapon they
 * carry, or the same attack earlier in this fight — so its numbers never drift between turns. */
function namedAttack(shadow: ShadowState, actor: Entity, weapon: string, memory: Combatant | null): { bonus: number | null; damage: string | null; damageType: string | null; source: string; from: "sheet" | "gear" | "fight" } | null {
  if (!weapon) return null;
  const nameOf = (line: string) => line.split(/[+−–\-\d(,:]/u)[0]?.trim() ?? "";
  const sheet = actor.character_sheet;
  const lines = [...((sheet && "attacks" in sheet ? sheet.attacks : undefined) ?? [])];
  for (const line of lines) {
    if (!mentions(nameOf(line) || line, weapon) && !mentions(weapon, nameOf(line) || line)) continue;
    const parsed = parseAttackLine(line);
    if (parsed.bonus !== null || parsed.damage) return { ...parsed, source: line.trim().slice(0, 60), from: "sheet" };
  }
  const carried = shadow.snapshot.items.filter((row) => row.campaign_id === shadow.campaignId && row.quantity > 0 && row.owner_entity_id === actor.id && row.mechanics);
  for (const item of carried) {
    if (!mentions(item.name, weapon) && !mentions(weapon, item.name)) continue;
    const parsed = parseAttackLine(item.mechanics ?? "");
    if (parsed.bonus !== null || parsed.damage) return { ...parsed, source: item.name, from: "gear" };
  }
  const known = memory?.attacks?.find((row) => mentions(row.name, weapon) || mentions(weapon, row.name)) ?? null;
  return known ? { bonus: known.bonus, damage: known.damage, damageType: known.damageType, source: known.name, from: "fight" } : null;
}

/** A party member's armour class: the sheet's own number (schema 2) or the system's stat name (ac, КД, armour, defense). */
export function sheetArmourClass(entity: Entity): number | null {
  const sheet = entity.character_sheet;
  const fromSheet = sheet && "armorClass" in sheet && typeof sheet.armorClass === "number" ? sheet.armorClass : null;
  const stat = Object.entries(entity.stats).find(([key, value]) => /^(ac|кд|armou?r|armou?r_class|defen[cs]e|защита)$/i.test(key) && typeof value === "number")?.[1] ?? null;
  // Fix S3-pre 1 (the ford probe): a hero whose armour class is written only in words («кожаный доспех (КД 15)»).
  const words = [entity.details, ...(sheet?.abilities ?? []), ...(sheet?.skills ?? []), sheet?.background ?? ""].join("\n");
  const written = /(?:^|[^\p{L}])(?:КД|AC|armou?r class|класс доспеха)\s*[:=]?\s*(\d{1,2})(?!\d)/iu.exec(words);
  return fromSheet ?? (typeof stat === "number" ? stat : written ? Number(written[1]) : null);
}

type FightAttackInput = {
  bonus: number;
  /** The armour class the call names; `preferGiven` (the combat tool) takes it over the profile, the writer's roll the other way round. */
  ac: number | null; preferGiven: boolean;
  damage: string; damageType: string | null; ranged: boolean; count: number; reason: string;
  /** The writer's roll: the parts of the bonus for the card and the fiction's advantage. */
  addends?: CheckAddend[]; bonuses?: { source: string; value: number }[];
  fiction?: { advantage: "normal" | "advantage" | "disadvantage"; reason: string | null } | null;
};
type FightAttackResult = { value: JsonObject; summary: string; check: RecordedCheck | null; player: string; applied: { target: string; before: number; after: number; max: number; band: string } | null; totalDamage: number; hits: number };

/** One attack in the open fight, resolved on the server: distance and cover measured, the rules module applied and named, the
 * hit points taken (a foe's mirror and record, a party member's record), the log line written, the attacker's action spent. */
function fightAttack(shadow: ShadowState, ctx: ToolContext, fight: FightRows, field: Field, fighters: BattleFighter[], a: FightSide, t: FightSide, input: FightAttackInput): FightAttackResult {
  const l = ctx.language;
  const active = fight.active!;
  const { entity: attacker, fighter: af } = a;
  const { entity: target, fighter: tf } = t;
  reject(attacker.id !== target.id, "attack: the target is the attacker.");
  const partyIds = fight.partyIds;
  // Fix S3-accept Г3: in a 5e campaign a party member's AC is derived — worn things, the record's effects (Mage Armor)
  // and this fight's (Shield) — the number the sheet, the doll and the battle block show; another system keeps the sheet's.
  const derived = partyIds.has(target.id) && isFifthEdition(shadow.snapshot.settings.values.rulesSystem)
    ? deriveSheet5e({ entity: target, items: shadow.snapshot.items.filter((row) => row.campaign_id === shadow.campaignId), fight: tf.combatant.conditions, fightAc: tf.combatant.ac, language: l }).ac : null;
  const sheetAc = partyIds.has(target.id) ? derived?.value ?? sheetArmourClass(target) : null;
  const known = derived ? derived.value : tf.combatant.ac ?? sheetAc;
  const ac = input.preferGiven ? input.ac ?? known : known ?? input.ac;
  reject(ac !== null, `attack needs ${target.name}'s armour class: ac here, or combat profile once.`, partyIds.has(target.id) ? "The sheet names no armour class stat; pass ac from the sheet's text." : undefined);
  reject(input.damage.length > 0, "attack needs the damage formula (1d8+3).");
  const formula = parseFormula(input.damage);
  const count = Math.min(8, Math.max(1, input.count));
  const ranged = input.ranged;
  const damageType = input.damageType?.toLowerCase() || null;
  const feet = distanceFeet(af.placement, tf.placement, field.grid.feetPerCell);
  const look = af.placement.x !== null && af.placement.y !== null && tf.placement.x !== null && tf.placement.y !== null
    ? sight(field, { x: af.placement.x, y: af.placement.y }, { x: tf.placement.x, y: tf.placement.y }) : null;
  // 5e: a hostile able to act within 5 ft of the shooter puts a ranged attack at disadvantage (the server measures it).
  const hostileAdjacent = ranged && af.placement.x !== null && af.placement.y !== null && adjacentIds(field, { x: af.placement.x, y: af.placement.y },
    fighters.filter((f) => f.participantId !== af.participantId && f.combatant.side !== af.combatant.side && !f.combatant.conditions.some((c) => /dead|unconscious|paralysed|fled|мертв|без сознания|парализ/iu.test(c))).map((f) => ({ id: f.participantId, placement: f.placement }))).length > 0;
  const fiction = input.fiction && input.fiction.advantage !== "normal" ? input.fiction : null;
  const ruling = field.rules ? attackRuling({ attacker: af.combatant, target: tf.combatant, feet, cover: look?.cover ?? null, ranged, hostileAdjacent, fiction })
    : { advantage: fiction?.advantage ?? "normal" as const, autoCrit: false, acBonus: 0, rules: [] as AppliedRule[], impossible: null as string | null };
  reject(ruling.impossible === null, `${attacker.name} cannot attack ${target.name}: ${ruling.impossible}.`);
  reject(!look || look.visible, `${attacker.name} has no line of sight to ${target.name} (${look?.blockedBy?.label ?? "a wall"}).`);
  if (!ranged && feet !== null) reject(feet <= 10, `${target.name} is ${feet} ft away: out of melee reach (move first, or ranged: true).`);
  const controlled = new Set(shadow.runtime.configuration?.controlledEntityIds ?? [shadow.hero().id]);
  const visibleCard = controlled.has(attacker.id) && count === 1 && ctx.checks.length < L.maxChecksPerTurn;
  const results: JsonObject[] = [];
  const playerLines: string[] = [];
  let recorded: RecordedCheck | null = null;
  let totalDamage = 0, hits = 0, coupDeGrace = false;
  const bonus = input.bonus;
  for (let i = 0; i < count; i++) {
    let kept: number, dice: number[];
    if (visibleCard) {
      // targetId stays null: the receipt store checks a target against the database, and a foe created this turn is not there yet (the name is in the reason).
      const cover = ruling.acBonus ? [{ source: l === "ru" ? "укрытие цели" : "the target's cover", value: 0 }] : [];
      const proposal = { index: ctx.checks.length, actorId: attacker.id, targetId: null, kind: "attack" as const, stat: "attack" as const, dc: ac! + ruling.acBonus, dcPublic: true, visibility: "player" as const,
        important: true, uncertainty: "meaningful" as const, advantage: ruling.advantage, reason: input.reason || (l === "ru" ? `Атака: ${target.name}` : `Attack: ${target.name}`),
        bonuses: [...(input.bonuses ?? []), ...cover], advantageReason: ruling.rules.length ? rulesText(ruling.rules, l === "ru" ? "ru" : "en") : null, difficulty: null, natural: null as RecordedCheck["natural"],
        ...(input.addends?.length && input.addends.reduce((sum, row) => sum + row.value, 0) === bonus ? { addends: input.addends.slice(0, 10) } : {}) };
      const rolled = recordServerRoll(ctx.input.operationId, proposal, bonus, 1, ctx.random);
      recorded = { ...rolled, natural: rolled.kept === 20 ? "crit" : rolled.kept === 1 ? "fumble" : null };
      kept = rolled.kept; dice = [...rolled.dice];
    } else {
      dice = Array.from({ length: ruling.advantage === "normal" ? 1 : 2 }, () => ctx.random(1, 21));
      kept = ruling.advantage === "advantage" ? Math.max(...dice) : ruling.advantage === "disadvantage" ? Math.min(...dice) : dice[0];
    }
    const total = kept + bonus;
    const hit = kept === 20 || (kept !== 1 && total >= ac! + ruling.acBonus);
    const crit = kept === 20 || (hit && ruling.autoCrit);
    // The card's verdict is the attack's: a natural 20 hits and a natural 1 misses whatever the total.
    if (recorded && i === 0) recorded = { ...recorded, success: hit };
    let damage = 0;
    let damageRules: AppliedRule[] = [];
    // Fix S3-pre B-7 (the owner's rule, 2026-10-20 18:15): with the rules module on, a melee hit on an adjacent
    // paralysed or unconscious foe is a coup de grâce — the blade at the throat kills outright, whatever the dice.
    // A party member who is down keeps the 5e death saves (the rule is the party's blade on a helpless enemy).
    const helpless = field.rules && hit && !ranged && feet !== null && feet <= 5 && !partyIds.has(target.id) && !coupDeGrace &&
      !tf.combatant.conditions.includes("dead") && tf.combatant.conditions.some((c) => /paraly|парализ|unconscious|без сознания/iu.test(c));
    if (helpless) {
      coupDeGrace = true;
      const left = tf.combatant.hp?.current ?? target.hp ?? target.max_hp ?? 0;
      damage = Math.max(0, left);
      damageRules = [{ rule: "helpless target within 5 ft", effect: "coup de grâce: dead" }];
      totalDamage += damage;
      hits++;
    } else if (hit) {
      hits++;
      const roll = () => Array.from({ length: formula.count }, () => ctx.random(1, formula.sides + 1));
      const base = roll();
      if (field.rules) {
        const ruled = damageRuling({ dice: base, modifier: formula.modifier, crit, critDice: crit ? roll() : undefined, damageType, target: tf.combatant });
        damage = ruled.total; damageRules = ruled.rules;
      } else damage = Math.max(0, base.reduce((sum, die) => sum + die, 0) + formula.modifier);
      totalDamage += damage;
    }
    const applied = [...ruling.rules, ...damageRules];
    const rulesLine = applied.length ? ` (${rulesText(applied, l === "ru" ? "ru" : "en")})` : "";
    const outcome = helpless ? (l === "ru" ? "добит" : "finished off") : hit ? (l === "ru" ? `попал${crit ? ", крит!" : ""}, ${damage} урона` : `hit${crit ? ", crit!" : ""}, ${damage} damage`) : (l === "ru" ? `промах${kept === 1 ? " (единица)" : ""}` : `miss${kept === 1 ? " (natural 1)" : ""}`);
    playerLines.push(`${attacker.name} → ${target.name}: ${total} ${l === "ru" ? "против КД" : "vs AC"} ${ac! + ruling.acBonus} · ${outcome}${rulesLine}`);
    results.push({ dice, kept, bonus, total, ac: ac! + ruling.acBonus, hit, crit, damage, damageType, rules: applied.map((row) => `${row.rule}: ${row.effect}`), ...(helpless ? { coupDeGrace: true } : {}) });
    const logLine: LogLine = { round: active.round, actor: attacker.name, what: input.reason || (ranged ? (l === "ru" ? "выстрел" : "shot") : (l === "ru" ? "удар" : "strike")), result: helpless ? (l === "ru" ? `добит → ${target.name}` : `finished off → ${target.name}`) : hit ? (l === "ru" ? `${total} против КД ${ac! + ruling.acBonus} · попал${crit ? ", крит!" : ""}, ${damage} урона → ${target.name}` : `${total} vs AC ${ac! + ruling.acBonus} · hit${crit ? ", crit!" : ""}, ${damage} damage → ${target.name}`) : (l === "ru" ? `${total} против КД ${ac! + ruling.acBonus} · промах` : `${total} vs AC ${ac! + ruling.acBonus} · miss`), ref: recorded?.id ?? null };
    field.log = [...field.log, logLine].slice(-MAX_LOG);
  }
  // The hit points: a foe's mirror and record, a party member's record (as resource hp would).
  let hpLine = "";
  let appliedHp: FightAttackResult["applied"] = null;
  // Fix S3-pre (opening attacks): a person with no hit points anywhere yet (recorded bare by an opening attack, or a
  // record without its stat block) is never put down by arithmetic on nothing: the damage waits for their hit points.
  const noHp = !tf.combatant.hp && target.hp === null && target.max_hp === null && !partyIds.has(target.id);
  if (noHp && (totalDamage > 0 || coupDeGrace)) {
    if (coupDeGrace) { tf.combatant.conditions = [...new Set([...tf.combatant.conditions, "dead"])].slice(0, 12); tf.combatant.active = false; }
    else tf.combatant.pendingDamage = (tf.combatant.pendingDamage ?? 0) + totalDamage;
    hpLine = coupDeGrace ? " dead: coup de grâce" : ` takes ${totalDamage} damage — no hit points on record yet: give their full hit points from the stat block (upsert_character, combat start hp or combat hp) and the server subtracts this damage`;
  } else if (totalDamage > 0 || coupDeGrace) {
    const current = tf.combatant.hp?.current ?? target.hp ?? target.max_hp ?? 0;
    const max = tf.combatant.hp?.max ?? target.max_hp ?? Math.max(1, current);
    const next = coupDeGrace ? 0 : Math.max(0, current - totalDamage);
    if (!partyIds.has(target.id)) tf.combatant.hp = { current: next, max };
    shadow.apply(entityChange(shadow, target, { hp: next, max_hp: max }));
    if (coupDeGrace) { tf.combatant.conditions = [...new Set([...tf.combatant.conditions.filter((c) => !/unconscious|без сознания|dying|при смерти/iu.test(c)), "dead"])].slice(0, 12); tf.combatant.active = false; }
    else if (next === 0 && !tf.combatant.conditions.includes("dead") && !tf.combatant.conditions.includes("unconscious")) tf.combatant.conditions = [...tf.combatant.conditions, partyIds.has(target.id) ? "dying" : "unconscious"];
    // Fix S3-pre B-17: the band word, so the story tells the wound the hit points left.
    hpLine = ` HP ${current} → ${next}/${max} (${coupDeGrace ? "dead: coup de grâce" : next === 0 && partyIds.has(target.id) ? "down, dying: death saves follow" : hpBand(next, max)})`;
    appliedHp = { target: target.name, before: current, after: next, max, band: coupDeGrace ? "dead" : hpBand(next, max) };
  }
  if (af.participantId === field.activeParticipantId) af.combatant.economy.action = false;
  fight.saveFighter(af);
  fight.saveFighter(tf);
  fight.saveField(field);
  const summary = `${results.map((row, index) => `${count > 1 ? `#${index + 1}: ` : ""}${row.total} vs AC ${row.ac} — ${row.hit ? `hit${row.crit ? " (crit)" : ""}, ${row.damage} ${row.damageType ?? ""} damage` : "miss"}${(row.rules as string[]).length ? ` [${(row.rules as string[]).join("; ")}]` : ""}`).join("; ")}; ${target.name}${hpLine || " unhurt"}. Narrate it.`;
  return { value: { attacker: attacker.name, target: target.name, feet, cover: look?.cover ?? null, rulesModule: field.rules, attacks: results, totalDamage, ...(recorded ? { checkId: recorded.id } : {}) },
    summary: `${attacker.name} attacks ${target.name}: ${summary}`, check: recorded, player: playerLines.join("\n"), applied: appliedHp, totalDamage, hits };
}

function combatTool(shadow: ShadowState, args: Args, ctx: ToolContext): DmLoopReceiptResult {
  // 2D Live part 2: the fight's state lives in the encounter rows (the field on the encounter,
  // the combatant in each participant); the server measures, the DM and the system decide.
  const action = str(args.action);
  const l = ctx.language;
  const fight = fightRows(shadow);
  const { active, partyIds, rows, fighterOf, fieldOf, saveField, saveFighter } = fight;
  const participantOf = (ref: unknown, what: string) => {
    const entity = entityOf(shadow, ref, what);
    const row = rows().find((p) => p.entity_id === entity.id);
    reject(row, `${entity.name} is not in this encounter.`, "Add them with combat place.");
    return { entity, fighter: fighterOf(row) };
  };
  const heroId = shadow.snapshot.entities.find((row) => row.kind === "player")?.id ?? null;
  /** Both views agree: every zone word is derived from the coordinates, seen from the hero. */
  const deriveZones = (field: Field, fighters: BattleFighter[]) => {
    const hero = fighters.find((row) => row.entityId === heroId) ?? fighters.find((row) => row.combatant.side === "party") ?? null;
    for (const fighter of fighters) {
      if (!hero || fighter.placement.x === null || hero.placement.x === null) continue;
      const before = fighter.placement.position;
      fighter.placement.position = fighter.participantId === hero.participantId ? "nearby" : zoneFrom(field, hero.placement, fighter.placement).zone;
      if (before !== fighter.placement.position) saveFighter(fighter);
    }
  };
  const placementArgs = (what: string) => ((args.placements as { actorRef: unknown; x: unknown; y: unknown; z?: unknown; initiative?: unknown; side?: unknown }[] | undefined) ?? []).map((entry) => {
    const x = int(entry.x), y = int(entry.y);
    reject(x !== null && y !== null, `${what}: x and y are grid cells (integers).`);
    const side: Side | null = entry.side === "party" || entry.side === "foe" || entry.side === "other" ? entry.side : null;
    return { entity: entityOf(shadow, entry.actorRef, `${what}.actorRef`), x: x!, y: y!, z: int(entry.z) ?? 0, initiative: int(entry.initiative), side };
  });
  const logLine = (field: Field, line: LogLine) => { field.log = [...field.log, line].slice(-MAX_LOG); };
  const wordList = (v: unknown) => (Array.isArray(v) ? v.map((row) => str(row).toLowerCase()).filter(Boolean).slice(0, 12) : []);

  if (action === "start") {
    // Fix S3-pre (opening attacks): a fight this turn's first attack opened is completed here, never opened twice —
    // its people, their wounds, conditions and spent actions and its log stand; the start adds what it sets up.
    const opened = active && fieldOf().openedByAttack === true ? { encounter: active, field: fieldOf(), fighters: rows().map(fighterOf) } : null;
    reject(!active || opened, "An encounter is already active.", "End it first (combat end) or add positions.");
    const refs = (args.participantRefs as unknown[] | undefined) ?? [];
    const placed = placementArgs("placements");
    const participants = [...new Map([...shadow.partyIds().map((id) => shadow.entity(id)!), ...(opened?.fighters ?? []).flatMap((row) => (row.entityId && shadow.entity(row.entityId) ? [shadow.entity(row.entityId)!] : [])),
      ...refs.map((ref) => entityOf(shadow, ref, "participantRefs")), ...placed.map((row) => row.entity)].map((e) => [e.id, e])).values()];
    const id = opened?.encounter.id ?? stableGameplayId(ctx.input.operationId, `dm-loop:encounter:${ctx.toolCalls}`);
    const grid = args.grid && typeof args.grid === "object" ? args.grid as { cols?: unknown; rows?: unknown } : {};
    const field: Field = { ...parseField({ grid: { cols: int(grid.cols) ?? DEFAULT_GRID.cols, rows: int(grid.rows) ?? DEFAULT_GRID.rows }, ambient: args.ambient }),
      locationId: opened?.field.locationId ?? shadow.snapshot.publicState.current_location_id, opening: args.opening === "party" ? "party" : null, activeParticipantId: null, turnInRound: 0,
      log: opened?.field.log ?? [], features: [], pendingReaction: null,
      rules: typeof args.rules === "boolean" ? args.rules : opened?.field.rules ?? rulesOnByDefault(`${shadow.snapshot.settings.values.rulesSystem?.label ?? ""} ${shadow.snapshot.settings.values.rulesSystem?.id ?? ""}`) };
    const surprised = new Set(((args.surprisedRefs as unknown[] | undefined) ?? []).map((ref) => entityOf(shadow, ref, "surprisedRefs").id));
    const hpRows = new Map(((args.hp as { actorRef: unknown; current: unknown; max: unknown; ac?: unknown; resist?: unknown; immune?: unknown; vulnerable?: unknown; moveMaxFeet?: unknown }[] | undefined) ?? [])
      .map((row) => [entityOf(shadow, row.actorRef, "hp.actorRef").id, { current: int(row.current) ?? 0, max: int(row.max) ?? 1, ac: int(row.ac), resist: wordList(row.resist), immune: wordList(row.immune), vulnerable: wordList(row.vulnerable), moveMaxFeet: int(row.moveMaxFeet) }]));
    const initiativeOf = new Map(placed.map((row) => [row.entity.id, row.initiative]));
    // Order: initiative totals when given (party first on ties), else the party first as before.
    const ordered = [...participants].sort((a, b) => ((initiativeOf.get(b.id) ?? -99) - (initiativeOf.get(a.id) ?? -99)) || (Number(partyIds.has(b.id)) - Number(partyIds.has(a.id))));
    shadow.apply({ family: "encounters", id, expectedRevision: null, values: { status: "active", round: opened?.encounter.round ?? 1, outcome: null, settings_revision: shadow.snapshot.settings.revision, public_summary: str(args.summary), public_field: fieldJson(field) } });
    const fighters: BattleFighter[] = [];
    ordered.forEach((entity, index) => {
      const place = placed.find((row) => row.entity.id === entity.id);
      const prior = opened?.fighters.find((row) => row.entityId === entity.id) ?? null;
      const side: Side = place?.side ?? prior?.combatant.side ?? (partyIds.has(entity.id) ? "party" : "foe");
      const given = hpRows.get(entity.id) ?? null;
      // The opening blows' damage stands: a stat block's full hit points never heal a wound this turn already dealt.
      const wound = prior?.combatant.hp ?? null;
      const pending = given ? prior?.combatant.pendingDamage ?? 0 : 0;
      const current = given ? Math.max(0, Math.min(given.current, wound && wound.max === given.max ? wound.current : given.current) - pending) : null;
      const hp = given ? { current: current!, max: given.max } : wound ?? (side !== "party" && entity.max_hp ? { current: entity.hp ?? entity.max_hp, max: entity.max_hp } : null);
      if (given) {
        reject(!partyIds.has(entity.id), `${entity.name} is in the party: their hit points go through resource.`);
        shadow.apply(entityChange(shadow, entity, { hp: current, max_hp: given.max }));
      }
      const moveMax = given?.moveMaxFeet ?? 30;
      const economy = surprised.has(entity.id) ? { ...defaultEconomy(moveMax), action: false, bonus: false, reaction: false, moveFeet: 0 } : prior ? { ...prior.combatant.economy, moveMaxFeet: moveMax } : defaultEconomy(moveMax);
      const conditions = [...new Set([...(prior?.combatant.conditions ?? []), ...(surprised.has(entity.id) ? ["surprised"] : []), ...(current === 0 && side !== "party" ? ["unconscious"] : [])])];
      const combatant: Combatant = { initiative: initiativeOf.get(entity.id) ?? null, active: index === 0, side, economy, conditions, deathSaves: prior?.combatant.deathSaves ?? null, hp,
        known: prior?.combatant.known ?? [], intent: prior?.combatant.intent ?? null, ...(prior?.combatant.attacks ? { attacks: prior.combatant.attacks } : {}),
        ...(!given && prior?.combatant.pendingDamage ? { pendingDamage: prior.combatant.pendingDamage } : {}),
        ac: given?.ac ?? prior?.combatant.ac ?? null, resist: given?.resist ?? prior?.combatant.resist ?? [], immune: given?.immune ?? prior?.combatant.immune ?? [],
        vulnerable: given?.vulnerable ?? prior?.combatant.vulnerable ?? [], defending: false, withdrawn: false };
      const participantId = prior?.participantId ?? stableGameplayId(ctx.input.operationId, `dm-loop:participant:${id}:${entity.id}`);
      const fighter: BattleFighter = { participantId, entityId: entity.id, name: entity.name, turnOrder: index + 1, combatant,
        placement: place ? { position: "nearby", x: place.x, y: place.y, z: place.z } : prior?.placement ?? { position: "nearby", x: null, y: null, z: 0 } };
      shadow.apply({ family: "encounter_participants", id: participantId, expectedRevision: null, values: { encounter_id: id, entity_id: entity.id, public_name: entity.name, turn_order: index + 1,
        public_position: placementJson(fighter.placement), public_resources: combatantJson(combatant) } });
      fighters.push(fighter);
    });
    // Fix S3-pre B-2 (the owner's rule): a planned ambush — the party's signal or first strike resolves before
    // initiative: the ambusher (the hero) acts first, at turn 0, and the first next_turn goes to the top of the order,
    // so the opening never spends the ambusher's round-1 action.
    const ambusher = field.opening === "party" ? fighters.find((row) => row.entityId === heroId) ?? fighters.find((row) => row.combatant.side === "party") ?? null : null;
    if (ambusher) for (const fighter of fighters) {
      const now = fighter === ambusher;
      // The planned opening never spends the round-1 action — also when this turn's first attack was that opening.
      const refresh = now && !!opened && !fighter.combatant.economy.action;
      if (refresh) fighter.combatant.economy = { ...fighter.combatant.economy, action: true };
      if (fighter.combatant.active === now && !refresh) continue;
      fighter.combatant.active = now;
      shadow.apply({ family: "encounter_participants", id: fighter.participantId, expectedRevision: null, values: { public_resources: combatantJson(fighter.combatant) } });
    }
    field.activeParticipantId = (ambusher ?? fighters[0])?.participantId ?? null;
    shadow.apply({ family: "encounters", id, expectedRevision: null, values: { public_field: fieldJson(field) } });
    const config = shadow.configuration();
    config.presentEntityIds = [...new Set([...config.presentEntityIds, ...participants.map((p) => p.id)])];
    shadow.setConfiguration(config);
    // The zones from the coordinates, seen from the hero.
    const started = shadow.runtime.encounters.find((row) => row.id === id)!;
    const hero = fighters.find((row) => row.entityId === heroId) ?? null;
    if (hero && hero.placement.x !== null) for (const fighter of fighters) {
      fighter.placement.position = fighter === hero ? "nearby" : zoneFrom(field, hero.placement, fighter.placement).zone;
      shadow.apply({ family: "encounter_participants", id: fighter.participantId, expectedRevision: null, values: { public_position: placementJson(fighter.placement) } });
    }
    void started;
    const order = fighters.map((row) => `${row.name}${row.combatant.initiative !== null ? ` (${row.combatant.initiative})` : ""}`);
    return ok({ encounterId: id, order, active: (ambusher ?? fighters[0])?.name ?? null, grid: field.grid, mapped: fighters.some((row) => row.placement.x !== null), ...(ambusher ? { opening: ambusher.name } : {}),
      ...(opened ? { completedOpenedFight: true } : {}) },
      `Combat begins: ${order.join(", ")}${ambusher ? `; the party's planned opening resolves before initiative: ${ambusher.name} acts first (it does not spend the round-1 action), then next_turn goes to the top of the order` : ""}${opened ? "; the fight this turn's first attack opened is completed — its rolls, damage and log stand (never roll them again)" : ""}`,
      null, chip.combatStart(l, participants.map((p) => p.name)));
  }
  reject(active, "No encounter is active.", "Start one with combat start.");
  const field = fieldOf();
  const fighters = rows().map(fighterOf);

  if (action === "position") {
    const moved: string[] = [];
    for (const entry of (args.positions as { actorRef: unknown; position: string }[] | undefined) ?? []) {
      const { entity, fighter } = participantOf(entry.actorRef, "positions.actorRef");
      reject(fighter.placement.x === null, `${entity.name} stands on the grid: use combat move with cells.`);
      fighter.placement.position = entry.position === "far" || entry.position === "cover" ? entry.position : "nearby";
      saveFighter(fighter);
      moved.push(`${entity.name}: ${fighter.placement.position}`);
    }
    return ok({ encounterId: active.id, moved }, `Positions: ${moved.join(", ") || "unchanged"}`);
  }
  if (action === "place") {
    const placed = placementArgs("placements");
    reject(placed.length > 0, "combat place needs placements.");
    const names: string[] = [];
    for (const row of placed) {
      reject(insideGrid(field, { x: row.x, y: row.y }), `${row.entity.name}: (${row.x}, ${row.y}) is outside the ${field.grid.cols}×${field.grid.rows} grid.`);
      const existing = fighters.find((f) => f.entityId === row.entity.id) ?? null;
      if (!existing) {
        // A late arrival joins at the end of the order.
        const participantId = stableGameplayId(ctx.input.operationId, `dm-loop:participant:${active.id}:${row.entity.id}:${ctx.toolCalls}`);
        const turnOrder = Math.max(0, ...fighters.map((f) => f.turnOrder)) + 1;
        const fighter: BattleFighter = { participantId, entityId: row.entity.id, name: row.entity.name, turnOrder, placement: { position: "nearby", x: row.x, y: row.y, z: row.z },
          combatant: { initiative: row.initiative, active: false, side: row.side ?? (partyIds.has(row.entity.id) ? "party" : "foe"), economy: defaultEconomy(), conditions: [], deathSaves: null,
            hp: !partyIds.has(row.entity.id) && row.entity.max_hp ? { current: row.entity.hp ?? row.entity.max_hp, max: row.entity.max_hp } : null, known: [], intent: null,
            ac: null, resist: [], immune: [], vulnerable: [], defending: false, withdrawn: false } };
        shadow.apply({ family: "encounter_participants", id: participantId, expectedRevision: null, values: { encounter_id: active.id, entity_id: row.entity.id, public_name: row.entity.name, turn_order: turnOrder,
          public_position: placementJson(fighter.placement), public_resources: combatantJson(fighter.combatant) } });
        fighters.push(fighter);
        const config = shadow.configuration();
        config.presentEntityIds = [...new Set([...config.presentEntityIds, row.entity.id])];
        shadow.setConfiguration(config);
      } else {
        existing.placement = { ...existing.placement, x: row.x, y: row.y, z: row.z };
        if (row.initiative !== null) existing.combatant.initiative = row.initiative;
        if (row.side) existing.combatant.side = row.side;
        saveFighter(existing);
      }
      names.push(`${row.entity.name} → (${row.x}, ${row.y}${row.z ? `, +${row.z} ft` : ""})`);
    }
    deriveZones(field, fighters);
    return ok({ encounterId: active.id, placed: names }, `Placed: ${names.join("; ")}`);
  }
  if (action === "move") {
    const { entity, fighter } = participantOf(args.actorRef, "actorRef");
    const x = int(args.x), y = int(args.y);
    reject(x !== null && y !== null, `move needs x and y (cells of the ${field.grid.cols}×${field.grid.rows} grid).`);
    // A move past the edge of the grid is leaving the field (a fleeing foe, in the live probes): the fighter is withdrawn and
    // out of the turn order, the token stays at the cell it left from.
    if (!insideGrid(field, { x: x!, y: y! })) {
      fighter.combatant.withdrawn = true;
      fighter.combatant.conditions = [...new Set([...fighter.combatant.conditions, "fled"])].slice(0, 12);
      saveFighter(fighter);
      deriveZones(field, fighters);
      return ok({ actor: entity.name, withdrawn: true, to: { x, y } }, `${entity.name} leaves the field (past the edge of the ${field.grid.cols}×${field.grid.rows} grid): fled, out of the fight.`,
        null, partyIds.has(entity.id) ? (l === "ru" ? `${entity.name} уходит с поля боя` : `${entity.name} leaves the field`) : null);
    }
    reject(fighter.placement.x !== null && fighter.placement.y !== null, `${entity.name} has no position yet: place them first (combat place).`);
    const from = { x: fighter.placement.x!, y: fighter.placement.y! };
    const cost = moveCost(field, from, { x: x!, y: y! });
    reject(!cost.blocked, `${entity.name} cannot pass ${cost.blocked?.label ?? "a wall"} on that line.`, "Move around it in two steps.");
    const free = args.free === true;
    reject(free || cost.feet <= fighter.combatant.economy.moveFeet, `${entity.name} has ${fighter.combatant.economy.moveFeet} ft of movement left; that move is ${cost.feet} ft.`, "Move a shorter way, or free: true when the movement is forced.");
    const opportunity = adjacentIds(field, from, fighters.filter((f) => f.participantId !== fighter.participantId && f.combatant.side !== fighter.combatant.side && f.combatant.economy.reaction && !f.combatant.conditions.some((c) => /dead|unconscious|paralysed|fled/.test(c))).map((f) => ({ id: f.participantId, placement: f.placement })))
      .filter((pid) => cellDistance({ x: x!, y: y! }, { x: fighters.find((f) => f.participantId === pid)!.placement.x!, y: fighters.find((f) => f.participantId === pid)!.placement.y! }) > 1)
      .map((pid) => fighters.find((f) => f.participantId === pid)!.name);
    fighter.placement = { ...fighter.placement, x: x!, y: y! };
    if (!free) fighter.combatant.economy.moveFeet = Math.max(0, fighter.combatant.economy.moveFeet - cost.feet);
    saveFighter(fighter);
    deriveZones(field, fighters);
    const crossed = cost.crossed.filter((row) => row.kind === "burning" || row.kind === "difficult").map((row) => row.label);
    const player = l === "ru" ? `${entity.name} → (${x}, ${y}), ${cost.feet} фт` : `${entity.name} → (${x}, ${y}), ${cost.feet} ft`;
    return ok({ actor: entity.name, from, to: { x, y }, feet: cost.feet, movementLeft: fighter.combatant.economy.moveFeet, crossed, opportunityAttacks: opportunity },
      `${entity.name} moves to (${x}, ${y}): ${cost.feet} ft${free ? " (forced)" : `, ${fighter.combatant.economy.moveFeet} ft left`}${crossed.length ? `; crosses ${crossed.join(", ")}` : ""}${opportunity.length ? `; leaves the reach of ${opportunity.join(", ")} — they may take an opportunity attack (roll it if they do)` : ""}`,
      null, partyIds.has(entity.id) ? player : null);
  }
  if (action === "next_turn") {
    const alive = fighters.filter((row) => !row.combatant.withdrawn && !row.combatant.conditions.some((c) => c === "dead" || c === "fled"));
    reject(alive.length > 0, "Nobody is left to act.");
    const current = fighters.find((row) => row.participantId === field.activeParticipantId) ?? fighters.find((row) => row.combatant.active) ?? null;
    // Fix S3-pre B-2: after an ambush's opening (turn 0 of round 1) the order starts at its top, in the same round.
    const opening = field.opening === "party" && field.turnInRound === 0 && active.round === 1;
    const after = opening ? alive : alive.filter((row) => !current || row.turnOrder > current.turnOrder);
    const next = after[0] ?? alive[0];
    let round = active.round;
    const wrapped = !after.length;
    if (wrapped) {
      round += 1;
      // Surprise ends with the first round.
      for (const row of fighters) if (row.combatant.conditions.includes("surprised")) { row.combatant.conditions = row.combatant.conditions.filter((c) => c !== "surprised"); saveFighter(row); }
    }
    for (const row of fighters) if (row.combatant.active && row.participantId !== next.participantId) { row.combatant.active = false; saveFighter(row); }
    next.combatant.active = true;
    const paralysed = next.combatant.conditions.some((c) => /paralysed|unconscious|stunned|без сознания|парализ/i.test(c));
    next.combatant.economy = paralysed ? { ...defaultEconomy(next.combatant.economy.moveMaxFeet), action: false, bonus: false, reaction: false, moveFeet: 0 } : defaultEconomy(next.combatant.economy.moveMaxFeet);
    // Fix S3-accept Г3: Shield lasts until the start of its caster's next turn — the server ends it here (5e).
    if (isFifthEdition(shadow.snapshot.settings.values.rulesSystem)) next.combatant.conditions = next.combatant.conditions.filter((word) => !endsAtOwnTurn(word));
    saveFighter(next);
    field.activeParticipantId = next.participantId;
    field.turnInRound = wrapped ? 1 : field.turnInRound + 1;
    saveField(field);
    if (wrapped) shadow.apply({ family: "encounters", id: active.id, expectedRevision: null, values: { round } });
    const player = l === "ru" ? `Раунд ${round} · ходит ${next.name}` : `Round ${round} · ${next.name} to act`;
    return ok({ round, active: next.name, activeId: next.entityId, newRound: wrapped, economy: next.combatant.economy }, `Round ${round}: ${next.name} acts${paralysed ? " (cannot act: " + next.combatant.conditions.join(", ") + ")" : ""}`, null, player);
  }
  if (action === "profile") {
    const { entity, fighter } = participantOf(args.actorRef, "actorRef");
    if (args.ac !== undefined) fighter.combatant.ac = int(args.ac);
    if (args.resist !== undefined) fighter.combatant.resist = wordList(args.resist);
    if (args.immune !== undefined) fighter.combatant.immune = wordList(args.immune);
    if (args.vulnerable !== undefined) fighter.combatant.vulnerable = wordList(args.vulnerable);
    if (args.moveMaxFeet !== undefined) { const speed = int(args.moveMaxFeet) ?? 30; fighter.combatant.economy.moveMaxFeet = speed; fighter.combatant.economy.moveFeet = Math.min(fighter.combatant.economy.moveFeet, speed); }
    saveFighter(fighter);
    return ok({ actor: entity.name, ac: fighter.combatant.ac, resist: fighter.combatant.resist, immune: fighter.combatant.immune, vulnerable: fighter.combatant.vulnerable, moveMaxFeet: fighter.combatant.economy.moveMaxFeet },
      `${entity.name}: AC ${fighter.combatant.ac ?? "?"}${fighter.combatant.resist.length ? `, resists ${fighter.combatant.resist.join(", ")}` : ""}${fighter.combatant.immune.length ? `, immune ${fighter.combatant.immune.join(", ")}` : ""}${fighter.combatant.vulnerable.length ? `, vulnerable ${fighter.combatant.vulnerable.join(", ")}` : ""}, speed ${fighter.combatant.economy.moveMaxFeet} ft`);
  }
  if (action === "attack") {
    // The optional rules module (Part 2): the server measures and does the sums; the DM narrates.
    const attacker = participantOf(args.actorRef, "actorRef");
    const target = participantOf(args.targetRef, "targetRef");
    const attack = fightAttack(shadow, ctx, fight, field, fighters, attacker, target, { bonus: int(args.attackBonus) ?? 0, ac: int(args.ac), preferGiven: true,
      damage: str(args.damage), damageType: str(args.damageType) || null, ranged: args.ranged === true, count: int(args.count) ?? 1, reason: str(args.reason) });
    return ok(attack.value, attack.summary, attack.check, attack.player);
  }
  if (action === "condition") {
    const { entity, fighter } = participantOf(args.actorRef, "actorRef");
    const add = ((args.add as unknown[] | undefined) ?? []).map((row) => str(row).toLowerCase()).filter(Boolean);
    const remove = new Set(((args.remove as unknown[] | undefined) ?? []).map((row) => str(row).toLowerCase()));
    fighter.combatant.conditions = [...new Set([...fighter.combatant.conditions.filter((c) => !remove.has(c)), ...add])].slice(0, 12);
    const save = str(args.deathSave);
    if (save) {
      reject(partyIds.has(entity.id), "deathSave is for the hero and companions; an enemy at 0 is down or dead by the system's word.");
      const pips = save === "reset" ? null : { ...(fighter.combatant.deathSaves ?? { success: 0, fail: 0 }) };
      if (pips) { if (save === "success") pips.success = Math.min(3, pips.success + 1); else pips.fail = Math.min(3, pips.fail + 1); }
      fighter.combatant.deathSaves = pips;
      if (pips && !fighter.combatant.conditions.includes("dying") && pips.success < 3 && pips.fail < 3) fighter.combatant.conditions.push("dying");
    }
    if (add.includes("dead") || add.includes("unconscious")) { fighter.combatant.active = false; }
    saveFighter(fighter);
    const words = fighter.combatant.conditions.join(", ") || "no conditions";
    // Fix S3-pre 2.4: the player's chip in the campaign's words («при смерти»); the stored words stay English.
    const shown = conditionsText(fighter.combatant.conditions, l) || (l === "ru" ? "без состояний" : "no conditions");
    const pipsText = fighter.combatant.deathSaves ? ` · ${fighter.combatant.deathSaves.success}✓/${fighter.combatant.deathSaves.fail}✗` : "";
    return ok({ actor: entity.name, conditions: fighter.combatant.conditions, deathSaves: fighter.combatant.deathSaves }, `${entity.name}: ${words}${pipsText}`, null, `${entity.name}: ${shown}${pipsText}`);
  }
  if (action === "hp") {
    const { entity, fighter } = participantOf(args.actorRef, "actorRef");
    reject(!partyIds.has(entity.id), `${entity.name} is in the party: use resource hp.`);
    // Fix S3-pre B-6: the record first (a wound the writer's roll already applied is there), the mirror after it.
    const current = entity.hp ?? fighter.combatant.hp?.current ?? entity.max_hp ?? 0;
    const max = int(args.max) ?? entity.max_hp ?? fighter.combatant.hp?.max ?? Math.max(1, current);
    const pending = entity.max_hp === null && !fighter.combatant.hp ? fighter.combatant.pendingDamage ?? 0 : 0;
    const next = Math.max(0, Math.min(max, args.set !== undefined ? int(args.set) ?? current : current + (int(args.delta) ?? 0)) - pending);
    fighter.combatant.hp = { current: next, max };
    if (pending) fighter.combatant.pendingDamage = undefined;
    const by = args.byRef !== undefined ? entityOf(shadow, args.byRef, "byRef") : null;
    const damage = current - next;
    if (damage > 0) logLine(field, { round: active.round, actor: by?.name ?? "?", what: str(args.reason) || (l === "ru" ? "удар" : "hit"), result: l === "ru" ? `${damage} урона → ${entity.name}` : `${damage} damage → ${entity.name}`, ref: null });
    if (next === 0 && !fighter.combatant.conditions.includes("dead")) { fighter.combatant.conditions = [...new Set([...fighter.combatant.conditions, "unconscious"])]; }
    saveFighter(fighter);
    saveField(field);
    shadow.apply(entityChange(shadow, entity, { hp: next, max_hp: max }));
    const player = damage > 0 ? (l === "ru" ? `${entity.name}: −${damage} (${next}/${max})` : `${entity.name}: −${damage} (${next}/${max})`) : next > current ? (l === "ru" ? `${entity.name}: +${next - current} (${next}/${max})` : `${entity.name}: +${next - current} (${next}/${max})`) : null;
    return ok({ actor: entity.name, before: current, after: next, max, by: by?.name ?? null }, `${entity.name} HP ${current} → ${next}/${max}${next === 0 ? " (down)" : ""}`, null, player);
  }
  if (action === "feature") {
    const op = str(args.op) || "add";
    const key = str(args.key);
    reject(/^[a-z0-9][a-z0-9_-]{0,59}$/.test(key), "feature needs a key (lowercase letters, digits, dashes).");
    if (op === "remove") {
      reject(field.features.some((row) => row.key === key), `No feature "${key}" on the field.`);
      field.features = field.features.filter((row) => row.key !== key);
      saveField(field);
      return ok({ removed: key }, `Feature removed: ${key}`);
    }
    const existing = field.features.find((row) => row.key === key) ?? null;
    const parsed = parseFeature({ key, kind: args.kind ?? existing?.kind, label: args.label ?? existing?.label ?? key, cells: args.cells ?? existing?.cells,
      cover: args.cover ?? existing?.cover, radiusFeet: args.radiusFeet ?? existing?.radiusFeet, dimRadiusFeet: args.dimRadiusFeet ?? existing?.dimRadiusFeet, heightFeet: args.heightFeet ?? existing?.heightFeet });
    reject(parsed, "feature needs kind and at least one cell [x, y].");
    reject(parsed!.cells.every((cell) => insideGrid(field, { x: cell[0], y: cell[1] })), `feature "${key}": a cell is outside the ${field.grid.cols}×${field.grid.rows} grid.`);
    field.features = [...field.features.filter((row) => row.key !== key), parsed!].slice(0, 40);
    saveField(field);
    deriveZones(field, fighters);
    return ok({ feature: parsed }, `Feature ${existing ? "updated" : "added"}: ${parsed!.label} (${parsed!.kind}, ${parsed!.cells.length} cells)`);
  }
  if (action === "known") {
    const { entity, fighter } = participantOf(args.actorRef, "actorRef");
    const text = str(args.text);
    reject(text.length > 0, "known needs text.");
    const revealed = args.revealed !== false;
    fighter.combatant.known = [...fighter.combatant.known.filter((row) => row.text !== text), { text, revealed }].slice(-12);
    saveFighter(fighter);
    return ok({ actor: entity.name, known: fighter.combatant.known }, `${entity.name}: ${revealed ? "known" : "hidden"} — ${text}`, null, revealed ? (l === "ru" ? `О ${entity.name}: ${text}` : `About ${entity.name}: ${text}`) : null);
  }
  if (action === "intent") {
    const { entity, fighter } = participantOf(args.actorRef, "actorRef");
    const text = str(args.text);
    const noticed = args.noticedByRef !== undefined && args.noticedByRef !== null ? entityOf(shadow, args.noticedByRef, "noticedByRef") : null;
    fighter.combatant.intent = text ? { text, noticedBy: noticed?.id ?? null } : null;
    saveFighter(fighter);
    return ok({ actor: entity.name, intent: fighter.combatant.intent }, text ? `${entity.name} intends: ${text}${noticed ? ` (noticed by ${noticed.name})` : " (unnoticed)"}` : `${entity.name}: no intent`, null,
      text && noticed ? (l === "ru" ? `${noticed.name} замечает: ${entity.name} — ${text}` : `${noticed.name} notices: ${entity.name} — ${text}`) : null);
  }
  if (action === "reaction") {
    if (args.resolved === true) {
      field.pendingReaction = null;
      saveField(field);
      return ok({ resolved: true }, "Reaction resolved");
    }
    const { entity, fighter } = participantOf(args.targetRef, "targetRef");
    reject(partyIds.has(entity.id), "A reaction choice is the player's: targetRef must be the hero or a companion.");
    reject(fighter.combatant.economy.reaction, `${entity.name} has no reaction left this round.`);
    const options = ((args.options as unknown[] | undefined) ?? []).map((row) => str(row)).filter(Boolean).slice(0, 4);
    reject(options.length > 0 && str(args.trigger).length > 0, "reaction needs the trigger and at least one option.");
    field.pendingReaction = { targetId: fighter.participantId, trigger: str(args.trigger), options };
    saveField(field);
    return ok({ target: entity.name, trigger: str(args.trigger), options }, `Reaction pending for ${entity.name}: ${str(args.trigger)} — ${options.join(" / ")}. End the turn now and let the player choose.`,
      null, l === "ru" ? `Реакция ${entity.name}: ${options.join(" / ")}` : `${entity.name}'s reaction: ${options.join(" / ")}`);
  }
  if (action === "log") {
    const actor = args.actorRef !== undefined ? entityOf(shadow, args.actorRef, "actorRef") : null;
    const what = str(args.what), result = str(args.result);
    reject(result.length > 0, "log needs a result.");
    logLine(field, { round: active.round, actor: actor?.name ?? "—", what, result, ref: null });
    saveField(field);
    return ok({ logged: true }, `Log: ${actor?.name ?? "—"} · ${what} → ${result}`);
  }
  reject(action === "end", `Unknown combat action "${action}".`);
  const outcome = str(args.outcome);
  reject(outcome.length > 0, "combat end needs an outcome.");
  const card = fightCard({ round: active.round, log: field.log, fighters });
  field.pendingReaction = null;
  field.activeParticipantId = null;
  shadow.apply({ family: "encounters", id: active.id, expectedRevision: null, values: { status: "ended", outcome, public_field: fieldJson(field),
    ...(args.summary !== undefined ? { public_summary: str(args.summary) } : {}) } });
  const cardLine = l === "ru" ? `Итог: ${card.rounds} р., нанесено ${card.dealt}, получено ${card.taken}${card.closeCalls.length ? `, на грани: ${card.closeCalls.join(", ")}` : ""}` : `Card: ${card.rounds} rounds, dealt ${card.dealt}, taken ${card.taken}${card.closeCalls.length ? `, close calls: ${card.closeCalls.join(", ")}` : ""}`;
  return ok({ encounterId: active.id, outcome, card }, `Combat ends: ${outcome}. ${cardLine}`, null, `${chip.combatEnd(l, outcome)} · ${cardLine}`);
}

// --- holdings --------------------------------------------------------------
type HoldingDetails = NonNullable<PublicProfile["holding"]>;
/** features, armament and passengers of a holding (public: the hero's own property). */
function holdingDetails(shadow: ShadowState, args: Args, current: HoldingDetails): HoldingDetails {
  if (args.features === undefined && args.armament === undefined && args.passengerRefs === undefined) return current;
  return {
    features: args.features !== undefined ? (args.features as { name: unknown; description: unknown }[]).map((f) => ({ name: str(f.name), description: str(f.description) })) : current.features,
    armament: args.armament !== undefined ? str(args.armament) : current.armament,
    passengers: args.passengerRefs !== undefined ? [...new Set((args.passengerRefs as unknown[]).map((ref) => entityOf(shadow, ref, "passengerRefs").id))] : current.passengers,
  };
}
function holdingTool(shadow: ShadowState, args: Args, ctx: ToolContext): DmLoopReceiptResult {
  const action = str(args.action);
  if (action === "create") {
    const name = str(args.name);
    reject(name.length > 0, "holding create needs a name.");
    const kind = str(args.kind);
    reject(["transport", "base", "mount"].includes(kind), "holding kind: transport, base or mount.");
    const key = localKey(args.localKey) ?? name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").slice(0, 60);
    reject(kind !== "mount" || args.passengerRefs === undefined, "A mount carries saddlebags, not riders; leave passengerRefs out.");
    const holding = holdingDetails(shadow, args, { features: [], armament: "", passengers: [] });
    if (kind === "base") {
      const id = shadow.newId(`storage:${key}`);
      reject(!shadow.storage(id), `The local key "${key}" is taken.`);
      shadow.apply({ family: "storages", id, expectedRevision: null, values: { name, kind: "camp", entity_id: null,
        detail: { holding: { kind: "base", description: str(args.description), ...holding } } as unknown as JsonObject } });
      shadow.bindLocalKey(key, { family: "storages", id });
      shadow.setPrivate("fact", `holding_${id}`, JSON.stringify({ kind, name, description: str(args.description) }));
      return ok({ id, localKey: key, kind, name }, `New base: ${name}`, null, chip.holding(ctx.language, kind, name, false));
    }
    const id = shadow.newId(`entity:${key}`);
    reject(!shadow.entity(id), `The local key "${key}" is taken.`);
    shadow.apply({ family: "entities", id, expectedRevision: null, values: { kind, name, details: str(args.description),
      hp: null, max_hp: null, stats: {}, resources: {}, conditions: [], equipment_slots: [], public_profile: { holding } as unknown as JsonObject } });
    shadow.bindLocalKey(key, { family: "entities", id });
    shadow.storageFor(shadow.entity(id)!);
    return ok({ id, localKey: key, kind, name }, `New ${kind}: ${name}`, null, chip.holding(ctx.language, kind, name, false));
  }
  const ref = shadow.resolve(args.holdingRef, ["entities", "storages"], "holdingRef");
  if (ref.family === "storages") {
    const storage = shadow.storage(ref.id)!;
    reject(storage.kind === "camp", `${storage.name} is not a holding.`);
    if (action === "update") {
      const values: JsonObject = {};
      if (args.name !== undefined) values.name = str(args.name);
      const current = storage.detail?.holding ?? { kind: "base" as const, description: "", features: [], armament: "", passengers: [] };
      const holding = holdingDetails(shadow, args, current);
      if (args.description !== undefined || holding !== current)
        values.detail = { holding: { kind: "base", description: args.description !== undefined ? str(args.description) : current.description, ...holding } } as unknown as JsonObject;
      if (Object.keys(values).length) shadow.apply({ family: "storages", id: storage.id, expectedRevision: storage.revision, values });
      return ok({ id: storage.id, name: str(args.name) || storage.name }, `${str(args.name) || storage.name} updated`);
    }
    shadow.setPrivate("fact", `holding_${storage.id}`, JSON.stringify({ removed: true }));
    return ok({ id: storage.id, removed: true }, `${storage.name} is no longer the party's`, null, chip.holding(ctx.language, "base", storage.name, true));
  }
  const entity = shadow.entity(ref.id)!;
  reject(entity.kind === "transport" || entity.kind === "mount", `${entity.name} is a ${entity.kind}, not a holding.`);
  reject(entity.kind !== "mount" || args.passengerRefs === undefined, `${entity.name} is a mount: it carries saddlebags, not riders.`,
    "Riders are the party; put things in its saddlebags with item transfer (ownerRef: the mount).");
  if (action === "update") {
    const values: JsonObject = {};
    if (args.name !== undefined) values.name = str(args.name);
    if (args.description !== undefined) values.details = str(args.description);
    const profile = publicProfileOf(entity);
    const current = profile.holding ?? { features: [], armament: "", passengers: [] };
    const holding = holdingDetails(shadow, args, current);
    if (holding !== current) values.public_profile = { ...profile, holding } as unknown as JsonObject;
    if (Object.keys(values).length) shadow.apply(entityChange(shadow, entity, values));
    return ok({ id: entity.id, name: (values.name as string) ?? entity.name }, `${(values.name as string) ?? entity.name} updated`);
  }
  reject(action === "remove", `Unknown holding action "${action}".`);
  // Fix S3-pre 2.4: the holding's chip reads the condition — in the campaign's word (nothing matches on it).
  shadow.apply(entityChange(shadow, entity, { conditions: [...new Set([...entity.conditions, ctx.language === "ru" ? "утрачено" : "lost"])] }));
  return ok({ id: entity.id, removed: true }, `${entity.name} is lost to the party`, null, chip.holding(ctx.language, entity.kind, entity.name, true));
}

// --- notes -----------------------------------------------------------------
function noteWorld(shadow: ShadowState, args: Args): DmLoopReceiptResult {
  const kind = str(args.kind) as "fact" | "clock" | "faction" | "consequence";
  const key = str(args.key);
  reject(!key.startsWith("character_") && !key.startsWith("quest_reward_") && !key.startsWith("statblock_") && !key.startsWith("holding_"),
    "That key prefix is reserved by the server.");
  // Fix run B2 (5): a note is closed, never silently overwritten — «true until» now; recall still finds it.
  if (str(args.operation) === "close") {
    reject(kind !== "faction" && !planKey(key), "close is for a fact, a clock or a consequence (a plan is resolved with planStatus).",
      "Resolve a plan with planStatus done or dropped.");
    const own = kind === "clock" ? "fact" : kind;
    const exists = shadow.privateValue(kind, key) !== null;
    reject(exists, `There is no ${kind} note "${key}" to close.`);
    const current = parseNoteValue(shadow.privateValue(own, key));
    reject(current.until === null, `The ${kind} note "${key}" is already closed.`);
    shadow.setPrivate(own, key, serializeNote(current.text || (kind === "clock" ? "(clock)" : ""), current.since, shadow.now));
    return ok({ kind, key, until: shadow.now }, "DM note closed");
  }
  if (str(args.operation) === "advance") {
    reject(kind === "clock", "Only a clock can be advanced.");
    const amount = int(args.amount);
    reject(amount !== null && amount >= 0 && amount <= 100, "amount must be between 0 and 100.");
    shadow.advanceClock(key, amount);
    return ok({ kind, key, value: shadow.privateValue("clock", key) }, "DM note updated");
  }
  if (planKey(key)) {
    // An off-screen plan: a structured private fact (plans.ts).
    reject(kind === "fact", "A plan_ key is a fact note.");
    const existing = parsePlan(key, shadow.privateValue("fact", key));
    const status = args.planStatus !== undefined ? str(args.planStatus) as OffScreenPlan["status"] : existing?.status ?? "open";
    reject(["open", "done", "dropped"].includes(status), "planStatus: open, done or dropped.");
    const goal = args.value !== undefined ? str(args.value) : existing?.goal ?? "";
    reject(goal.length > 0 && goal.length <= 2000, "A plan needs its goal and steps as value (up to 2000 characters).");
    // Item 21: a plan that belongs to nobody (weather, the tide, the law) names "world".
    const worldActor = args.actorRef !== undefined && /^(the )?(world|мир|никто|nobody)$/i.test(str(args.actorRef));
    const actorId = worldActor ? null : args.actorRef !== undefined ? entityOf(shadow, args.actorRef, "actorRef").id : existing?.actorId ?? null;
    const due = args.dueInMinutes !== undefined ? shadow.now + (int(args.dueInMinutes) ?? 0)
      : existing && (args.planStatus === undefined || status === "open") && existing.status === "open" ? existing.dueWorldMinutes : shadow.now;
    reject(status !== "open" || args.dueInMinutes !== undefined || (existing !== null && existing.status === "open"),
      "An open plan needs dueInMinutes: when its next step lands.", "Give dueInMinutes (game minutes from now), or resolve the plan with planStatus.");
    const plan: OffScreenPlan = { key, actorId, goal, dueWorldMinutes: due, setAtWorldMinutes: shadow.now,
      consequence: args.consequence !== undefined ? str(args.consequence) : existing?.consequence ?? "",
      warning: args.warning !== undefined ? str(args.warning) : existing?.warning ?? "", status };
    shadow.setPrivate("fact", key, serializePlan(plan));
    // Findings S3: a plan set before the message's time passing (written first, recordOrder) that comes due in it is told
    // here, as the time receipt would have listed it; the loop keeps the turn open for it (foldsFinish).
    const cameDue = status === "open" && shadow.recordAt !== null && due <= shadow.worldMinutes;
    return ok({ kind, key, plan: { status, dueWorldMinutes: due, actor: actorId ? shadow.entity(actorId)?.name ?? null : null },
      ...(cameDue ? { cameDue: { overdueMinutes: shadow.worldMinutes - due },
        hint: `This plan came due while this message's time passed (${shadow.worldMinutes - due} min ago). Advance it now in this turn: note_world planStatus, and play what reaches the hero.` } : {}) },
      status === "open" ? (cameDue ? "DM plan updated; it came due as time passed" : "DM plan updated") : "DM plan resolved");
  }
  reject(args.actorRef === undefined && args.dueInMinutes === undefined && args.planStatus === undefined && args.consequence === undefined && args.warning === undefined,
    "actorRef, dueInMinutes, consequence, warning and planStatus belong to a plan: use a fact key that starts with plan_.");
  const value = str(args.value);
  reject(value.length > 0 && value.length <= 2000, "A set note needs a value of up to 2000 characters.");
  // A clock is a counter: SQL advances it as an integer, so a text value would
  // fail the whole commit (seen live in Stage 2b). Reject the call instead.
  if (kind === "clock")
    reject(/^\d{1,6}$/.test(value), `A clock's value is a whole number (its current position, for example "2"), not text: "${value.slice(0, 60)}".`,
      "Set the clock to a number, or advance it with operation \"advance\" and amount; keep its description in a fact note with the same key.");
  reject(!["notebook", "notebook_session", "ledger", "variety", "metrics", "depth_state", HIDDEN_LAYER_KEY].includes(key) && !key.startsWith("plan_") && !key.startsWith("act_") &&
    !key.includes(ARCHIVE_INFIX), "That key is kept by the server.");
  if (kind === "clock") { shadow.setPrivate(kind, key, value); return ok({ kind, key }, "DM note updated"); }
  // Fix run B2 (5): «true since» now; a different text over an open note keeps the old one, closed, under an archive key.
  const previous = parseNoteValue(shadow.privateValue(kind, key));
  if (previous.text.trim() && previous.text !== value)
    shadow.setPrivate(kind, archiveKey(key, shadow.now), serializeNote(previous.text, previous.since, previous.until ?? shadow.now));
  shadow.setPrivate(kind, key, serializeNote(value, previous.text === value && previous.until === null ? previous.since ?? shadow.now : shadow.now));
  return ok({ kind, key, since: shadow.now }, "DM note updated");
}

function storedModel(shadow: ShadowState, actorId: string): CharacterModel | null {
  const raw = shadow.privateValue("npc", `character_${actorId}`);
  if (typeof raw !== "string") return null;
  try { return parseCharacterModel(JSON.parse(raw)); } catch { return null; }
}
function noteCharacter(shadow: ShadowState, args: Args, ctx: ToolContext): DmLoopReceiptResult {
  const actor = entityOf(shadow, args.actorRef, "actorRef");
  reject(actor.kind === "npc" || actor.kind === "companion", `${actor.name} is a ${actor.kind}; Character Models belong to characters and companions.`);
  const existing = storedModel(shadow, actor.id);
  const evidence: CharacterEvidence = { kind: "scene", id: ctx.narrationSceneId, version: "1", part: 0, visibility: "public" };
  const identityArgs = (args.identity ?? {}) as Record<string, unknown>;
  const list = (value: unknown, fallback: string[]) => (Array.isArray(value) ? value.map((v) => str(v)).filter(Boolean) : fallback);
  const identity = existing ? existing.identity : {
    values: list(identityArgs.values, []), wants: list(identityArgs.wants, []), boundaries: list(identityArgs.boundaries, []),
    loyalties: list(identityArgs.loyalties, []), signatures: list(identityArgs.signatures, []),
    observableVoice: str(identityArgs.observableVoice) || `Speaks and acts as ${actor.name}.`,
  };
  if (existing && args.identity !== undefined) {
    const changed = Object.entries(identityArgs).some(([field, value]) => value !== undefined &&
      JSON.stringify(value) !== JSON.stringify(existing.identity[field as keyof CharacterModel["identity"]]));
    reject(!changed, `${actor.name}'s identity is established and does not change in play.`,
      "Record what changed as current state, beliefs, relationships or episodes; identity changes are the owner's correction.");
  }
  const currentArgs = (args.current ?? {}) as Record<string, unknown>;
  const current: CharacterModel["current"] = {
    goal: currentArgs.goal !== undefined ? str(currentArgs.goal) || null : existing?.current.goal ?? null,
    stress: (currentArgs.stress !== undefined ? str(currentArgs.stress) : existing?.current.stress ?? "settled") as CharacterModel["current"]["stress"],
    preoccupation: currentArgs.preoccupation !== undefined ? str(currentArgs.preoccupation) || null : existing?.current.preoccupation ?? null,
    obligation: currentArgs.obligation !== undefined ? str(currentArgs.obligation) || null : existing?.current.obligation ?? null,
  };
  const beliefs = args.beliefs !== undefined
    ? ((args.beliefs as { text: unknown; confidence: unknown; aboutRef?: unknown }[]).map((b) => ({
        text: str(b.text), confidence: str(b.confidence) as "tentative" | "supported",
        aboutActorId: b.aboutRef !== undefined ? entityOf(shadow, b.aboutRef, "beliefs.aboutRef").id : null, evidence })))
      .slice(-L.characterModel.beliefs)
    : existing?.beliefs ?? [];
  const relationships = args.relationships !== undefined
    ? ((args.relationships as { actorRef: unknown; affection: unknown; trust: unknown; respect: unknown; unresolvedHurt?: unknown }[]).map((r) => {
        const other = entityOf(shadow, r.actorRef, "relationships.actorRef");
        reject(other.id !== actor.id, `${actor.name} cannot have a relationship with themselves.`);
        return { actorId: other.id, affection: str(r.affection) as "distant" | "open" | "close", trust: str(r.trust) as "low" | "guarded" | "earned",
          respect: str(r.respect) as "low" | "mixed" | "high", unresolvedHurt: r.unresolvedHurt !== undefined ? str(r.unresolvedHurt) || null : null, evidence };
      })).slice(-L.characterModel.relationships)
    : existing?.relationships ?? [];
  // Stage 4: when the list is full the DM folds the oldest episodes into one
  // summary episode instead of getting a rejection; the new ones are appended.
  let kept = existing?.episodes ?? [];
  if (args.foldEpisodes !== undefined) {
    const fold = args.foldEpisodes as { keep: number; summary: unknown };
    reject(existing !== null, `${actor.name} has no episodes to fold yet.`);
    const keep = Math.max(0, Math.min(kept.length, int(fold.keep) ?? 0));
    const folded = kept.slice(0, kept.length - keep);
    kept = [...(folded.length ? [{ evidence: folded[0].evidence, meaning: str(fold.summary), cue: null }] : []), ...kept.slice(kept.length - keep)];
  }
  const episodes = args.episodes !== undefined
    ? [...(args.foldEpisodes !== undefined ? kept : []), ...((args.episodes as { meaning: unknown; cue?: unknown }[]).map((e) => ({ evidence, meaning: str(e.meaning), cue: e.cue !== undefined ? str(e.cue) || null : null })))]
      .slice(-L.characterModel.episodes)
    : kept;
  reject(episodes.length <= L.characterModel.episodes, `${actor.name} has ${episodes.length} episodes; the list holds ${L.characterModel.episodes}.`,
    "Fold the oldest into one summary with foldEpisodes { keep, summary } and append the new ones.");
  // Polish group 7: the speech profile replaces the stored one when given, else stays.
  const speech = args.speech !== undefined
    ? (() => { const s = args.speech as { register: unknown; sentenceLength: unknown; tics: { phrase: unknown; frequency: unknown }[]; neverSays: unknown[]; address: { actorRef: unknown; form: unknown }[] };
        return { register: str(s.register), sentenceLength: str(s.sentenceLength) as "short" | "mixed" | "long",
          tics: (s.tics ?? []).map((t) => ({ phrase: str(t.phrase), frequency: str(t.frequency) as "rare" | "sometimes" | "often" })),
          neverSays: (s.neverSays ?? []).map((line) => str(line)).filter(Boolean),
          address: (s.address ?? []).map((a) => { const other = entityOf(shadow, a.actorRef, "speech.address.actorRef");
            reject(other.id !== actor.id, `${actor.name} does not address themselves.`); return { actorId: other.id, form: str(a.form) as "ты" | "вы" }; }) }; })()
    : existing?.speech ?? null;
  const model: CharacterModel = { schemaVersion: 1, actorId: actor.id, basisOperationId: ctx.input.operationId,
    identity, current, beliefs, relationships, episodes, speech };
  let parsed: CharacterModel;
  try { parsed = parseCharacterModel(JSON.parse(JSON.stringify(model))); }
  catch {
    const B = L.characterModel;
    const tooLong = [
      ...Object.entries(identity).flatMap(([field, value]) => Array.isArray(value)
        ? value.filter((text) => text.length > B.listText).map((text) => `identity.${field} entry (${text.length} chars, max ${B.listText})`)
        : value.length > B.voice ? [`identity.observableVoice (${value.length} chars, max ${B.voice})`] : []),
      ...Object.entries(current).filter(([, value]) => typeof value === "string" && value.length > B.listText).map(([field, value]) => `current.${field} (${(value as string).length} chars, max ${B.listText})`),
      ...beliefs.filter((b) => b.text.length > B.longText).map((b) => `a belief (${b.text.length} chars, max ${B.longText})`),
      ...episodes.filter((e) => e.meaning.length > B.longText || (e.cue ?? "").length > B.cue).map((e) => `an episode (${e.meaning.length} chars, max ${B.longText}; cue max ${B.cue})`),
    ];
    const size = JSON.stringify(model).length;
    throw new ToolReject(`${actor.name}'s Character Model was not saved: ${tooLong.length ? tooLong.join("; ") : size > B.chars ? `${size} characters in total, max ${B.chars}` : "a field is empty or malformed"}.`,
      `Shorten the listed fields and call note_character again with the same content; the limits are generous (${B.listText}–${B.longText} characters per text, ${B.listItems} entries per list, ${B.episodes} episodes — fold the oldest with foldEpisodes when the list is full).`);
  }
  reject(new Set(parsed.relationships.map((r) => r.actorId)).size === parsed.relationships.length, "One relationship per character.");
  shadow.setPrivate("npc", `character_${actor.id}`, JSON.stringify(parsed));
  return ok({ actor: actor.name, established: !existing, stress: parsed.current.stress, ...(parsed.speech ? {} : { hint: `${actor.name} has no speech profile yet: add speech (register, sentence length, tics with frequency, never says, ты/вы) so every line is theirs.` }) },
    `${actor.name}'s character notes ${existing ? "updated" : "started"}`);
}

// --- finish ----------------------------------------------------------------
/** «Твой момент» (polish): accepted only when this turn holds a resolved,
 * successful player-visible check of a controlled character and the scene is
 * tense or a climax (the server's tension, the DM's own hint for the next turn
 * or an active encounter). Returns the moment's reason or why it was refused. */
export function playerMomentGate(shadow: ShadowState, ctx: ToolContext, nextTension: DmLoopTension | null): { accepted: boolean; reason: string } {
  const controlled = new Set(shadow.runtime.configuration?.controlledEntityIds ?? [shadow.hero().id]);
  const checks = ctx.checks.filter((check) => check.visibility === "player" && controlled.has(check.actorId));
  if (!checks.length) return { accepted: false, reason: "no player-visible roll was resolved this turn" };
  const won = [...checks].reverse().find((check) => check.success);
  if (!won) return { accepted: false, reason: "the hero's roll failed; a failure is never handed over as a moment" };
  const tense = ctx.tension !== "calm" || (nextTension !== null && nextTension !== "calm") || shadow.runtime.encounters.some((row) => row.status === "active");
  if (!tense) return { accepted: false, reason: "the scene is calm; a moment belongs to a tense or climactic scene" };
  const receipt = ctx.receipts.find((row) => row.result.ok && row.call.name === "roll" && row.result.value.checkId === won.id);
  const reason = receipt && receipt.result.ok ? str(receipt.result.value.reason) : "";
  return { accepted: true, reason: reason || (ctx.language === "ru" ? "решающий бросок" : "the decisive roll") };
}

/** The DM's likes note (polish item 15): about 1,200 characters, clipped with a notice instead of refusing the turn. */
export const PLAYER_LIKES_CAP = 1200;

function finishTurn(shadow: ShadowState, args: Args, ctx: ToolContext): { result: DmLoopReceiptResult; meta: DmLoopMeta } {
  const spotlight = ((args.spotlight as unknown[]) ?? []).flatMap((ref) => {
    try { return [shadow.resolve(ref, ["entities"], "spotlight").id]; } catch { return []; }
  });
  const threads = ((args.threadRefs as unknown[]) ?? []).flatMap((ref) => {
    try { return [shadow.resolve(ref, ["quests"], "threadRefs").id]; } catch { return []; }
  });
  const tension = args.nextTension !== undefined && (TENSION_CLASSES as readonly string[]).includes(str(args.nextTension)) ? str(args.nextTension) as DmLoopTension : null;
  const gate = args.playerMoment ? playerMomentGate(shadow, ctx, tension) : null;
  const moment = !!gate?.accepted;
  const likesRaw = args.playerLikes !== undefined ? str(args.playerLikes).trim() : "";
  const likes = { text: likesRaw ? likesRaw.slice(0, PLAYER_LIKES_CAP).trimEnd() : null, clipped: likesRaw.length > PLAYER_LIKES_CAP };
  const meta: DmLoopMeta = { sceneKinds: [...new Set((args.sceneKinds as DmLoopMeta["sceneKinds"]) ?? [])], spotlight: [...new Set(spotlight)],
    playerMoment: moment, playerMomentReason: moment ? gate!.reason : null, nextTension: tension, threads: [...new Set(threads)],
    playerLikes: likes.text, npcRefused: !!args.npcRefused,
    ownerRule: args.ownerRule !== undefined && str(args.ownerRule).trim() ? str(args.ownerRule).trim().slice(0, 300) : null };
  shadow.finished = true;
  // FIX_S4 11c: the first turn that offered the errand, once (the clock line counts the lag from it).
  if (args.errandOffered === true && shadow.privateValue("fact", ERRAND_OFFERED_KEY) === null)
    shadow.setPrivate("fact", ERRAND_OFFERED_KEY, JSON.stringify({ operationId: ctx.input.operationId, worldMinutes: shadow.now }));
  const value: JsonObject = { recorded: true, playerMoment: moment,
    ...(likes.clipped ? { playerLikesClipped: `playerLikes was longer than ${PLAYER_LIKES_CAP} characters and was clipped; one or two short new lines are enough (they are appended).` } : {}),
    ...(gate && !gate.accepted ? { playerMomentRefused: `playerMoment was not accepted: ${gate.reason}. The turn is recorded without it; the player simply writes the next action.` } : {}) };
  return { result: ok(value, moment ? `Your moment: ${gate!.reason}` : gate ? `Turn recorded (player moment refused: ${gate.reason})` : "Turn recorded"), meta };
}

export type ExecutedTool = { result: DmLoopReceiptResult; meta?: DmLoopMeta;
  /** Fix S3-accept В1: an accepted `resource` call's counter of a party member, for the live stream. */
  counter?: { entityId: string; key: string; value: number; max: number | null } };

/** The owner, after the findings-S3 hoard probe: the calls of one message are written with time passing first — an
 * `advance_time` can no longer be the tail a limit cuts — and the rest in the model's order (they may name records made
 * earlier in the message by local key, so only the time passing, which names none, moves). `move_party` and `rest` keep
 * their place: moving first would put the things found «here» at the next place, resting first would heal wounds the
 * message records after it. A plan set before the time passing that comes due in it says so itself (noteWorld). Stable;
 * the results go back to the model by call ID, in its own order. */
export function recordOrder<T extends { name: string }>(calls: readonly T[]): T[] {
  return [...calls.filter((call) => call.name === "advance_time"), ...calls.filter((call) => call.name !== "advance_time")];
}

/** The minute a call of the message is stamped at while its time passing is written first: the clock as it now stands,
 * less the minutes of every accepted `advance_time` the model put after this call — so a note, a plan or an item's
 * history keeps the minute it had in the model's own order. Null for the time passing itself (stamped by the clock). */
export function storyMinuteOf(call: { id: string; name: string }, calls: readonly { id: string; name: string }[], receipts: readonly DmLoopReceipt[], clock: number): number | null {
  if (call.name === "advance_time") return null;
  const at = calls.findIndex((row) => row.id === call.id);
  const later = calls.slice(at + 1).filter((row) => row.name === "advance_time").reduce((sum, row) => {
    const receipt = receipts.find((entry) => entry.call.id === row.id);
    const minutes = receipt?.result.ok ? Number((receipt.result.value as { minutes?: unknown }).minutes) : 0;
    return sum + (Number.isFinite(minutes) ? minutes : 0);
  }, 0);
  return later > 0 ? clock - later : null;
}

/** Run one call. Shadow mutations of a rejected call are discarded. */
export function executeDmLoopTool(shadow: ShadowState, call: DmLoopToolCall, ctx: ToolContext): ExecutedTool {
  if (ctx.toolCalls >= turnCallCap(ctx.limits))
    return { result: { ok: false, reason: `This turn reached its ${turnCallCap(ctx.limits)}-call limit (two batches of ${ctx.limits.toolCallsPerTurn}).`,
      hint: "Finish the narration now with what was already accepted.", summary: `${call.name}: limit reached` } };
  const candidate = shadow.clone();
  try {
    const args = parseArgs(call.name, call.arguments);
    let executed: ExecutedTool;
    switch (call.name) {
      case "roll": executed = { result: roll(candidate, args, ctx) }; break;
      case "query_state": executed = { result: queryState(candidate, args) }; break;
      case "recall": executed = { result: recall(candidate, args) }; break;
      case "upsert_character": executed = { result: upsertCharacter(candidate, args, ctx) }; break;
      case "upsert_place": executed = { result: upsertPlace(candidate, args, ctx) }; break;
      case "move_party": executed = { result: moveParty(candidate, args, ctx) }; break;
      case "item": executed = { result: itemTool(candidate, args, ctx) }; break;
      case "money": executed = { result: moneyTool(candidate, args, ctx) }; break;
      case "resource": { const result = resourceTool(candidate, args, ctx); const counter = liveCounterOf(candidate, args); executed = { result, ...(counter ? { counter } : {}) }; break; }
      case "quest": executed = { result: questTool(candidate, args, ctx) }; break;
      case "advance_time": executed = { result: advanceTime(candidate, args, ctx) }; break;
      case "rest": executed = { result: restTool(candidate, args, ctx) }; break;
      case "note_character": executed = { result: noteCharacter(candidate, args, ctx) }; break;
      case "note_world": executed = { result: noteWorld(candidate, args) }; break;
      case "combat": executed = { result: combatTool(candidate, args, ctx) }; break;
      case "holding": executed = { result: holdingTool(candidate, args, ctx) }; break;
      case "finish_turn": executed = finishTurn(candidate, args, ctx); break;
      default: throw new ToolReject(`Unknown tool "${call.name}".`);
    }
    // The commit saves at most 40 private patches, four of them the server's: the call that would pass the rest is refused alone.
    if (executed.result.ok && candidate.privatePatches.length > PRIVATE_PATCHES_FOR_CALLS)
      throw new ToolReject(`This turn's private notes are full (${PRIVATE_PATCHES_FOR_CALLS}, the most one turn saves).`, "Write the rest in a later turn.");
    shadow.adopt(candidate);
    return executed;
  } catch (error) {
    if (error instanceof ToolReject)
      return { result: { ok: false, reason: error.message, hint: error.hint, summary: `${call.name}: ${error.message}` } };
    // Any other failure is a server bug; still reject the single call, not the turn.
    return { result: { ok: false, reason: `${call.name} could not be applied: the server rejected the change.`, hint: null,
      summary: `${call.name}: rejected` } };
  }
}

export const defaultRandom = randomInt;
export type { RuntimeSource };
