// Executes one dm-loop-v1 tool call against the shadow state. Every rule here
// guards data integrity (ownership, quantities, balances, bounds, exact-once
// rewards, fixed identities), never plausibility: the model is the DM.
// A rejected call returns a reason the model can act on; the turn continues.
import { randomInt } from "node:crypto";
import type { JsonObject, TurnInput } from "../contracts.ts";
import type { Entity, EquipmentSlot, Item, ItemDetail, PublicProfile, Quest, QuestDetail } from "../../persistence/contracts.ts";
import type { RecordChange, RecordedCheck, RuntimeSource } from "../server-contracts.ts";
import { recordServerRoll, stableGameplayId } from "../dice.ts";
import { basicProfile } from "../mechanics/profile.ts";
import { settledItemTransfer } from "../../progression/settlement-core.ts";
import { parseCharacterModel, type CharacterEvidence, type CharacterModel } from "../character-model.ts";
import { validateToolArguments } from "../../server/dm/model/schema-compiler.ts";
import { dmLoopLimits as L, type DmLoopTurnLimits } from "./limits.ts";
import { dmLoopTools, ITEM_CATEGORIES, ITEM_RARITIES, QUEST_KINDS, RELATION_GROUPS, TENSION_CLASSES } from "./tools.ts";
import { duePlans, parsePlan, planKey, serializePlan, type OffScreenPlan } from "./plans.ts";
import { ShadowState, ToolReject, reject } from "./shadow.ts";
import { chip, currencyAmount, type ChipLanguage } from "./receipt-text.ts";
import type { DmLoopMeta, DmLoopReceipt, DmLoopReceiptResult, DmLoopTension, DmLoopToolCall } from "./contracts.ts";

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

export function humanoidSlots(language: string): EquipmentSlot[] {
  const ru = language === "ru";
  return [
    { id: "head", label: ru ? "Голова" : "Head", accepts: ["armor", "clothing"] },
    { id: "neck", label: ru ? "Шея / амулет" : "Neck / Amulet", accepts: ["accessory", "jewelry", "gear"] },
    { id: "body", label: ru ? "Броня / плащ" : "Armor / Coat", accepts: ["armor", "clothing"] },
    { id: "hand", label: ru ? "Основная рука" : "Main Hand", accepts: ["weapon", "tool"] },
    { id: "offhand", label: ru ? "Вторая рука" : "Off Hand", accepts: ["weapon", "shield", "tool"] },
    { id: "belt", label: ru ? "Пояс" : "Belt", accepts: ["gear", "clothing", "consumable"] },
    { id: "legs", label: ru ? "Ноги" : "Legs", accepts: ["armor", "clothing"] },
    { id: "boots", label: ru ? "Сапоги" : "Boots", accepts: ["armor", "clothing"] },
  ];
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
    profile.attitude = { text: str(args.attitude), lastNoticed: String(shadow.worldMinutes) };
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
  return item.owner_entity_id ? shadow.entity(item.owner_entity_id)?.name ?? "someone" : "the camp";
}
const localKey = (value: unknown) => (value === undefined ? null : str(value));

// --- roll ------------------------------------------------------------------
export const DIFFICULTY_LADDER = { easy: 8, normal: 10, hard: 13, very_hard: 16, nearly_impossible: 19 } as const;
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
/** +2 for a skill the sheet names, +4 for one it calls good, +6 for mastery — in the sheet's own words. */
export function proficiencyValue(text: string): number {
  const lower = text.toLocaleLowerCase();
  if (/мастер|master|expert|виртуоз|легендарн|legendary/.test(lower)) return 6;
  if (/хорош|опытн|skilled|experienced|proficient|\bgood\b|\bwell\b|умел|искусн|отличн/.test(lower)) return 4;
  return 2;
}
/** The bonus a skill named on the sheet gives: a numeric stat of that name, a
 * sheet line with a number («Плавание +2»), or the sheet's words (умеет / хорошо /
 * мастер → +2 / +4 / +6); the trade in the background counts as named. */
export function sheetBonus(actor: Entity, skill: string): { value: number; source: string } | null {
  const wanted = normalizeSkill(skill);
  if (!wanted) return null;
  for (const [key, value] of Object.entries(actor.stats)) {
    if (!Number.isInteger(value) || key === "level") continue;
    if (normalizeSkill(key) === wanted || normalizeSkill(key).replaceAll("_", " ") === wanted) return { value, source: `${skill} ${value >= 0 ? "+" : ""}${value}` };
  }
  const sheet = actor.character_sheet;
  const lines = [...(sheet?.skills ?? []), ...(sheet?.abilities ?? [])];
  for (const line of lines) {
    if (!mentions(line, skill)) continue;
    const numbered = /^(.*?)\s*([+−-])\s*(\d+)\s*$/u.exec(line.trim());
    if (numbered) {
      const value = (numbered[2] === "+" ? 1 : -1) * Number(numbered[3]);
      return { value, source: `${numbered[1].trim() || skill} ${value >= 0 ? "+" : ""}${value}` };
    }
    const value = proficiencyValue(line);
    return { value, source: `${line.trim().slice(0, 60)} +${value}` };
  }
  const prose = [sheet?.role ?? "", sheet?.background ?? "", actor.details].join("\n");
  if (mentions(prose, skill)) {
    // The trade or trait is named in the background: at least a named skill.
    const value = proficiencyValue(prose.split("\n").find((line) => mentions(line, skill)) ?? "");
    return { value, source: `${skill.trim().slice(0, 60)} +${value}` };
  }
  return null;
}

function roll(shadow: ShadowState, args: Args, ctx: ToolContext): DmLoopReceiptResult {
  const formula = parseFormula(str(args.formula));
  const actorText = str(args.actorRef);
  const actor = actorText.toLowerCase() === "dm" ? null : entityOf(shadow, actorText, "actorRef");
  let modifier = formula.modifier;
  const sources: string[] = [];
  let modifierSource: string | null = null;
  if (args.modifierField !== undefined) {
    reject(actor, "A sheet modifier needs an actor (actorRef is \"dm\").");
    const field = str(args.modifierField);
    const value = actor.stats[field];
    reject(typeof value === "number" && Number.isInteger(value),
      `${actor.name} has no sheet stat "${field}".`,
      Object.keys(actor.stats).length ? `Known stats: ${Object.keys(actor.stats).join(", ")}.` : "The sheet has no numeric stats; pass skill (the skill or trade as the sheet names it) instead.");
    modifier += value;
    modifierSource = `${field} ${value >= 0 ? "+" : ""}${value}`;
    sources.push(modifierSource);
  }
  if (args.skill !== undefined) {
    reject(actor, "A sheet skill needs an actor (actorRef is \"dm\").");
    const skill = str(args.skill);
    const bonus = sheetBonus(actor, skill);
    const known = [...(actor.character_sheet?.skills ?? []), ...Object.keys(actor.stats).filter((key) => key !== "level")];
    reject(bonus, `${actor.name}'s sheet names no skill or trade like "${skill}".`,
      `${known.length ? `The sheet names: ${known.slice(0, 12).join("; ")}. ` : ""}Use the sheet's own words, or roll without skill and give the fiction's bonuses with their sources.`);
    modifier += bonus.value;
    modifierSource = modifierSource ? `${modifierSource}, ${bonus.source}` : bonus.source;
    sources.push(bonus.source);
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
    sources.push(...bonuses.map((b) => `${b.source} ${b.value >= 0 ? "+" : ""}${b.value}`));
  }
  reject(modifier >= -100 && modifier <= 100, "The total modifier must stay between -100 and +100.");
  const advantage = (str(args.advantage) || "normal") as RecordedCheck["advantage"];
  reject(advantage === "normal" || formula.count === 1, "Advantage and disadvantage apply to a single die only.");
  const advantageReason = args.advantageReason !== undefined ? str(args.advantageReason) || null : null;
  const controlled = new Set(shadow.runtime.configuration?.controlledEntityIds ?? [shadow.hero().id]);
  // A check of the hero or a companion is the player's; an NPC's or the world's roll stays private (polish group 2).
  const visibility: "player" | "private" = actor && controlled.has(actor.id) ? "player" : "private";
  const difficulty = args.difficulty !== undefined ? str(args.difficulty) as DifficultyWord : null;
  reject(difficulty === null || difficulty in DIFFICULTY_LADDER, `difficulty: ${Object.keys(DIFFICULTY_LADDER).join(", ")}.`);
  const dc = int(args.dc) ?? (difficulty ? DIFFICULTY_LADDER[difficulty] : null);
  const kindText = str(args.kind) || "skill";
  // A recorded check (the Check DTO, the roll card, the interactive pause) is the
  // player's; an NPC's d20 against a difficulty resolves as a plain private roll
  // (a person created in this very message is not in the database yet).
  const isCheck = formula.count === 1 && formula.sides === 20 && dc !== null && actor !== null && visibility === "player";
  const reason = str(args.reason);
  const sourceText = sources.join(", ") || null;
  const bonusLine = (die: number) => ({
    ...(die === 20 ? { hint: "A natural 20: the hero's moment. Narrate the success first and in full, plus a visible extra in their favour tied to what they tried; companions support, never take the beat." } : {}),
    ...(die === 1 ? { hint: "A natural 1: a cost tied to what they tried (a lost tool, a worse position, noise), never a lecture." } : {}),
    ...(clipped ? { note: `The fiction's bonuses are capped at ±${FICTION_BONUS_CAP} in total.` } : {}),
  });
  if (isCheck) {
    reject(ctx.checks.length < L.maxChecksPerTurn, `This turn already made ${L.maxChecksPerTurn} checks.`,
      "Narrate the remaining outcomes without a new check.");
    const kind: RecordedCheck["kind"] = kindText === "attack" ? "attack" : kindText === "save" ? "save" : "skill";
    const proposal = {
      index: ctx.checks.length, actorId: actor.id, targetId: null, kind, stat: kind,
      dc, dcPublic: true, visibility, important: true, uncertainty: "meaningful" as const, advantage,
      reason, bonuses, advantageReason, difficulty, natural: null as RecordedCheck["natural"],
    };
    const rolled = recordServerRoll(ctx.input.operationId, proposal, modifier, 1, ctx.random);
    const natural: RecordedCheck["natural"] = rolled.kept === 20 ? "crit" : rolled.kept === 1 ? "fumble" : null;
    const check: RecordedCheck = { ...rolled, natural };
    const value: JsonObject = { formula: str(args.formula), reason, actor: actor.name, visibility,
      dice: [...check.dice], kept: check.kept, modifier, modifierSource: sourceText, bonuses, advantage, advantageReason,
      difficulty, total: check.total, dc, success: check.success, natural, checkId: check.id, ...bonusLine(check.kept) };
    const player = visibility === "player"
      ? chip.roll(ctx.language, actor.name, actor.kind === "player", reason, check.total, dc, ctx.showDc, check.success, natural) : null;
    return ok(value, `${actor.name} rolls ${str(args.formula)}${sourceText ? ` (${sourceText})` : ""}: ${check.total} vs ${dc} — ${check.success ? "success" : "failure"}${natural === "crit" ? " (natural 20)" : natural === "fumble" ? " (natural 1)" : ""}`, check, player);
  }
  const count = advantage === "normal" ? formula.count : 2;
  const dice = Array.from({ length: count }, () => ctx.random(1, formula.sides + 1));
  reject(dice.every((die) => Number.isInteger(die) && die >= 1 && die <= formula.sides), "The dice source misbehaved.");
  const kept = advantage === "normal" ? dice.reduce((sum, die) => sum + die, 0)
    : advantage === "advantage" ? Math.max(...dice) : Math.min(...dice);
  const total = kept + modifier;
  const natural = formula.count === 1 && formula.sides === 20 ? (kept === 20 ? "crit" : kept === 1 ? "fumble" : null) : null;
  const value: JsonObject = { formula: str(args.formula), reason, actor: actor?.name ?? "DM", visibility,
    dice, kept, modifier, modifierSource: sourceText, bonuses, advantage, advantageReason, difficulty, total, dc, success: dc === null ? null : total >= dc, natural, ...bonusLine(natural ? kept : 0) };
  const player = visibility === "player" && actor
    ? chip.roll(ctx.language, actor.name, actor.kind === "player", reason, total, dc, ctx.showDc, dc === null ? null : total >= dc, natural) : null;
  return ok(value, `${actor?.name ?? "The DM"} rolls ${str(args.formula)}${sourceText ? ` (${sourceText})` : ""}: ${total}${dc !== null ? ` vs ${dc} — ${total >= dc ? "success" : "failure"}` : ""}`, null, player);
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
function upsertCharacter(shadow: ShadowState, args: Args, ctx: ToolContext): DmLoopReceiptResult {
  const language = shadow.snapshot.settings.values.language;
  const config = shadow.configuration();
  if (args.ref !== undefined) {
    const entity = entityOf(shadow, args.ref, "ref");
    reject(entity.kind !== "player", `${entity.name} is the player's hero; the hero's record is not rewritten by the DM.`,
      "Use resource for HP and counters, item for possessions.");
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
    if (Object.keys(values).length) shadow.apply(entityChange(shadow, entity, values));
    if (args.statblock !== undefined) shadow.setPrivate("npc", `statblock_${entity.id}`, str(args.statblock));
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
    return ok({ id: entity.id, name: (values.name as string) ?? entity.name, kind, present, party },
      `${(values.name as string) ?? entity.name} updated`, null, party && !wasInParty ? chip.companionJoins(ctx.language, (values.name as string) ?? entity.name) : null);
  }
  const name = str(args.name);
  reject(name.length > 0, "A new character needs a name.");
  reject(shadow.counters.charactersCreated < ctx.limits.charactersPerTurn,
    `This turn already introduced ${ctx.limits.charactersPerTurn} new characters, the campaign's limit per turn.`,
    "Refer to existing records with ref, or introduce the rest in a later turn.");
  const kind = str(args.kind) === "companion" ? "companion" : str(args.kind) === "faction" ? "faction" : "npc";
  const key = localKey(args.localKey) ?? name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").slice(0, 60);
  const similar = shadow.similarEntities(name).filter((row) => row.kind !== "player");
  const id = shadow.newId(`entity:${key}`);
  reject(!shadow.entity(id), `The local key "${key}" already names a character in this turn.`);
  shadow.counters.charactersCreated++;
  const maxHp = int(args.maxHp) ?? int(args.hp);
  const hp = int(args.hp) ?? maxHp;
  reject(maxHp === null || (hp !== null && hp >= 0 && hp <= maxHp), `HP ${hp} must stay within 0..${maxHp}.`);
  reject(kind !== "faction" || (maxHp === null && args.party === undefined), "A faction has no hit points and never joins the party.");
  const profile = profilePatch(shadow, args, null, kind, str(args.description));
  shadow.apply({ family: "entities", id, expectedRevision: null, values: {
    kind, name, details: str(args.description), hp: maxHp === null ? null : hp, max_hp: maxHp,
    stats: statsFrom(args, {}), resources: {}, conditions: [], equipment_slots: (kind === "faction" ? [] : humanoidSlots(language)) as unknown as JsonObject[],
    ...(profile ? { public_profile: profile as unknown as JsonObject } : {}),
  } });
  shadow.bindLocalKey(key, { family: "entities", id });
  if (args.statblock !== undefined) shadow.setPrivate("npc", `statblock_${id}`, str(args.statblock));
  const present = kind === "faction" ? false : args.present === undefined ? true : !!args.present;
  const party = kind === "companion" && (args.party === undefined ? true : !!args.party);
  if (present || party) config.presentEntityIds = [...new Set([...config.presentEntityIds, id])];
  if (party) config.controlledEntityIds = [...new Set([...config.controlledEntityIds, id])];
  shadow.setConfiguration(config);
  const value: JsonObject = { id, localKey: key, name, kind, present, party, created: true,
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
    if (Object.keys(values).length) shadow.apply({ family: "locations", id: place.id, expectedRevision: place.revision, values });
    if (Array.isArray(args.questRefs)) linkPlaceToQuests(shadow, place.id, args.questRefs);
    return ok({ id: place.id, name: (values.name as string) ?? place.name }, `${(values.name as string) ?? place.name} updated`);
  }
  const name = str(args.name);
  reject(name.length > 0, "A new place needs a name.");
  const key = localKey(args.localKey) ?? name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").slice(0, 60);
  const id = shadow.newId(`location:${key}`);
  reject(!shadow.location(id), `The local key "${key}" already names a place in this turn.`);
  shadow.apply({ family: "locations", id, expectedRevision: null, values: {
    name, description: str(args.description), status: str(args.status) || "known" } });
  shadow.bindLocalKey(key, { family: "locations", id });
  if (Array.isArray(args.questRefs)) linkPlaceToQuests(shadow, id, args.questRefs);
  return ok({ id, localKey: key, name, status: str(args.status) || "known" }, `Place recorded: ${name}${str(args.status) === "rumored" ? " (a rumour)" : ""}`,
    null, chip.place(ctx.language, name, str(args.status) === "rumored"));
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
function destinationOf(shadow: ShadowState, value: unknown, what: string): { entity: Entity | null; storageId: string; label: string } {
  if (str(value).toLowerCase() === "camp") return { entity: null, storageId: shadow.campStorage().id, label: "the camp" };
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
function itemTool(shadow: ShadowState, args: Args, ctx: ToolContext): DmLoopReceiptResult {
  const action = str(args.action);
  const l = ctx.language;
  if (action === "create") {
    const name = str(args.name);
    reject(name.length > 0, "item create needs a name.");
    const category = str(args.category);
    reject((ITEM_CATEGORIES as readonly string[]).includes(category), `item create needs a category: ${ITEM_CATEGORIES.join(", ")}.`);
    const quantity = int(args.quantity) ?? 1;
    reject(shadow.counters.itemsCreated < ctx.limits.itemsPerTurn,
      `This turn already created ${ctx.limits.itemsPerTurn} items, the campaign's limit per turn.`,
      "Describe the rest in the narration; record it in a later turn.");
    const destination = destinationOf(shadow, args.ownerRef ?? "camp", "ownerRef");
    const key = localKey(args.localKey) ?? `${name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-")}-${ctx.toolCalls}`.slice(0, 60);
    const id = shadow.newId(`item:${key}`);
    reject(!shadow.item(id), `The local key "${key}" already names an item in this turn.`);
    shadow.counters.itemsCreated++;
    const rarity = args.rarity !== undefined ? str(args.rarity) : null;
    reject(rarity === null || (ITEM_RARITIES as readonly string[]).includes(rarity), `rarity: ${ITEM_RARITIES.join(", ")}.`);
    shadow.apply({ family: "items", id, expectedRevision: null, values: {
      name, category, quantity, description: str(args.description), mechanics: str(args.properties),
      owner_entity_id: destination.entity?.id ?? null, storage_id: destination.storageId,
      equipped_entity_id: null, equipped_slot: null, ...(rarity ? { rarity } : {}),
      detail: withHistory({}, shadow.worldMinutes, "created", str(args.description)) as unknown as JsonObject } });
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
        detail: withHistory({ ...detail, status: undefined, holderId: undefined, condition: undefined }, shadow.worldMinutes, "returned", holderName(detail) ?? "") as unknown as JsonObject } });
      return ok({ itemId: item.id, name: item.name, returned: true, to: destination.label }, `${item.name} returns to ${destination.label}`,
        null, chip.itemReturned(l, item.name, destination.label, isHero(destination.entity)));
    }
    const splitId = shadow.newId(`split:${item.id}:${ctx.toolCalls}`);
    // The row object is updated in place by the applier: remember the giver first.
    const giver = item.owner_entity_id ? shadow.entity(item.owner_entity_id) ?? null : null;
    const settled = settledItemTransfer(item, quantity, destination.entity?.id ?? (null as unknown as string), destination.storageId, splitId);
    for (const change of settled.changes) {
      if (change.id === splitId) change.values.owner_entity_id = destination.entity?.id ?? null;
      else if (change.values.owner_entity_id === undefined && item.quantity === quantity) change.values.owner_entity_id = destination.entity?.id ?? null;
      // A moved thing is no longer pledged or lent by its former owner.
      if (detail.status && change.id === item.id) change.values.detail = withHistory({ ...detail, status: undefined, holderId: undefined, condition: undefined }, shadow.worldMinutes, "transferred", destination.label) as unknown as JsonObject;
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
    values.detail = withHistory(itemDetail(item), shadow.worldMinutes, "consumed", str(args.reason)) as unknown as JsonObject;
    shadow.apply({ family: "items", id: item.id, expectedRevision: item.revision, values });
    return ok({ itemId: item.id, name: item.name, consumed: quantity, remaining }, `${ownerName(shadow, item)} uses ${item.name}${quantity > 1 ? ` ×${quantity}` : ""} (${remaining} left)`,
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
      detail: withHistory({ ...detail, ...(remaining === 0 ? { status: "lost", note: reason, holderId: undefined, condition: undefined } : {}) }, shadow.worldMinutes, "lost", reason) as unknown as JsonObject };
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
    reject(Object.keys(values).length > 0, "modify needs a new name, description, properties, category or rarity.");
    const note = str(args.reason);
    // The applier updates the row in place: remember the old name first.
    const previousName = item.name;
    const name = (values.name as string | undefined) ?? previousName;
    values.detail = withHistory(itemDetail(item), shadow.worldMinutes, "modified", `${previousName}${name !== previousName ? ` → ${name}` : ""}${note ? ` — ${note}` : ""}`) as unknown as JsonObject;
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
      detail: withHistory(detail, shadow.worldMinutes, action === "pledge" ? "pledged" : "lent", `${holder.name}${condition ? ` — ${condition}` : ""}`) as unknown as JsonObject } });
    return ok({ itemId: item.id, name: item.name, owner: ownerName(shadow, item), holder: holder.name, status: detail.status ?? null, condition: condition || null },
      `${item.name} ${action === "pledge" ? "pledged" : "lent"} to ${holder.name}${condition ? ` (${condition})` : ""}; ${ownerName(shadow, item)} keeps the title`,
      null, chip.itemPledged(l, action === "pledge" ? "pledge" : "loan", item.name, holder.name, condition));
  }
  if (action === "equip") {
    reject(item.owner_entity_id, `${item.name} lies in ${ownerName(shadow, item)}; only an owned item can be equipped.`);
    reject(!itemDetail(item).status, `${item.name} is ${itemDetail(item).status} (with ${holderName(itemDetail(item)) ?? "someone"}); it must come back first.`);
    let owner = shadow.entity(item.owner_entity_id)!;
    reject(item.quantity > 0, `${item.name} is used up.`);
    if (!owner.equipment_slots.length && ["player", "companion", "npc"].includes(owner.kind)) {
      // A character recorded before equipment existed gets the standard slots on first use.
      shadow.apply(entityChange(shadow, owner, { equipment_slots: humanoidSlots(shadow.snapshot.settings.values.language) as unknown as JsonObject[] }));
      owner = shadow.entity(owner.id)!;
    }
    const slots = owner.equipment_slots.filter((slot) => slot.accepts.includes(item.category));
    reject(slots.length > 0, `${owner.name} has no slot that takes a ${item.category}.`,
      `Slots: ${owner.equipment_slots.map((slot) => `${slot.id} (${slot.accepts.join("/")})`).join(", ") || "none"}.`);
    const taken = new Set(shadow.snapshot.items.filter((row) => row.equipped_entity_id === owner.id && row.id !== item.id).map((row) => row.equipped_slot));
    const wanted = args.slot !== undefined ? str(args.slot) : null;
    const slot = wanted ? slots.find((s) => s.id === wanted) : slots.find((s) => !taken.has(s.id)) ?? slots[0];
    reject(slot, `${owner.name} has no slot "${wanted}" for a ${item.category}.`, `Fitting slots: ${slots.map((s) => s.id).join(", ")}.`);
    const occupant = shadow.snapshot.items.find((row) => row.equipped_entity_id === owner.id && row.equipped_slot === slot.id && row.id !== item.id);
    if (occupant) shadow.apply({ family: "items", id: occupant.id, expectedRevision: occupant.revision, values: { equipped_entity_id: null, equipped_slot: null } });
    shadow.apply({ family: "items", id: item.id, expectedRevision: item.revision,
      values: { equipped_entity_id: owner.id, equipped_slot: slot.id, storage_id: shadow.storageFor(owner).id } });
    return ok({ itemId: item.id, name: item.name, owner: owner.name, slot: slot.id, unequipped: occupant?.name ?? null },
      `${owner.name} equips ${item.name} (${slot.label})`, null, chip.itemEquipped(l, owner.name, isHero(owner), item.name, slot.label));
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
function moneyTool(shadow: ShadowState, args: Args, ctx: ToolContext): DmLoopReceiptResult {
  const action = str(args.action);
  const { label, key } = currencyKey(shadow, args.currency);
  const amount = int(args.amount);
  reject(amount !== null && amount >= 1 && amount <= L.maxMoneyPerCall, `amount must be between 1 and ${L.maxMoneyPerCall}.`);
  const fmt = (n: number) => `${n} ${label}`;
  const sum = currencyAmount(ctx.language, amount, label);
  if (action === "transfer") {
    const from = entityOf(shadow, args.fromRef, "fromRef");
    const to = entityOf(shadow, args.toRef, "toRef");
    reject(from.id !== to.id, "Payer and recipient are the same character.");
    const have = moneyOf(from, key);
    reject(have >= amount, `Not enough ${label}: ${from.name} has ${have}, this needs ${amount}.`,
      have > 0 ? `Offer up to ${fmt(have)}, barter, or let the deal fail.` : null);
    setResources(shadow, from, { ...from.resources, [key]: have - amount });
    const toNow = shadow.entity(to.id)!;
    setResources(shadow, toNow, { ...toNow.resources, [key]: moneyOf(toNow, key) + amount });
    // A payment from a quest's issuer to its recipient after completion settles
    // that reward: the server keeps the reward paid exactly once either way.
    const settled = shadow.snapshot.quests.find((quest) => quest.campaign_id === shadow.campaignId && quest.status === "complete" &&
      (() => { const terms = rewardTerms(shadow, quest); return !!terms && !terms.paidOperationId && terms.issuerId === from.id && terms.currency === label; })());
    if (settled) {
      const terms = rewardTerms(shadow, settled)!;
      shadow.setPrivate("fact", `quest_reward_${settled.id}`, JSON.stringify({ ...terms, paidOperationId: shadow.operationId }));
    }
    return ok({ currency: label, amount, from: from.name, to: to.name, fromBalance: have - amount, toBalance: moneyOf(toNow, key),
      ...(settled ? { settlesQuest: settled.title, note: `This payment counts as the reward of "${settled.title}"; it will not be paid again.` } : openJobHint(shadow, from, to)) },
      `${from.name} pays ${to.name} ${fmt(amount)}${settled ? ` (reward for "${settled.title}")` : ""}`,
      null, chip.moneyPaid(ctx.language, sum, from.name, isHero(from), to.name, isHero(to), settled ? settled.title : null));
  }
  if (action === "grant") {
    const to = entityOf(shadow, args.toRef, "toRef");
    const reason = str(args.reason);
    reject(reason.length > 0, "A grant needs a reason (a paid job, loot, a gift).");
    if (args.questRef !== undefined) {
      const quest = questOf(shadow, args.questRef, "questRef");
      const terms = rewardTerms(shadow, quest);
      reject(!terms || !terms.paidOperationId, `The reward of "${quest.title}" was already paid.`,
        "Do not pay it again; the character may remember it was settled.");
      reject(false, `Use quest claim_reward for the reward of "${quest.title}"; it pays the agreed terms exactly once.`);
    }
    mintMoney(shadow, amount, ctx, "money grant");
    setResources(shadow, to, { ...to.resources, [key]: moneyOf(to, key) + amount });
    return ok({ currency: label, amount, to: to.name, balance: moneyOf(shadow.entity(to.id)!, key), reason }, `${to.name} receives ${fmt(amount)} (${reason})`,
      null, chip.moneyReceived(ctx.language, sum, to.name, isHero(to), reason));
  }
  reject(action === "spend", `Unknown money action "${action}".`);
  const from = entityOf(shadow, args.fromRef, "fromRef");
  const have = moneyOf(from, key);
  reject(have >= amount, `Not enough ${label}: ${from.name} has ${have}, this costs ${amount}.`);
  setResources(shadow, from, { ...from.resources, [key]: have - amount });
  return ok({ currency: label, amount, from: from.name, balance: have - amount, reason: str(args.reason) }, `${from.name} spends ${fmt(amount)}${args.reason ? ` (${str(args.reason)})` : ""}`,
    null, chip.moneySpent(ctx.language, sum, from.name, isHero(from), str(args.reason)));
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
    const controlled = new Set(shadow.runtime.configuration?.controlledEntityIds ?? [shadow.hero().id]);
    // The hero's and the party's hit points are the player's business; an NPC's stay with the DM.
    const player = controlled.has(actor.id) && (current !== next || max !== null) ? chip.hp(ctx.language, actor.name, isHero(actor), current, next, maxHp, reason) : null;
    return ok({ actor: actor.name, resource: "hp", before: current, after: next, max: maxHp, reason },
      `${actor.name}: HP ${current} → ${next}/${maxHp} (${reason})`, null, player);
  }
  reject(/^[a-z][a-z0-9_ -]{0,59}$/.test(name), "Counter names are lowercase words or identifiers.");
  const key = name.replace(/[\s-]+/g, "_");
  const resources = { ...actor.resources };
  const current = Number(resources[key] ?? 0);
  const cap = max ?? (Number.isFinite(Number(resources[`${key}_max`])) && resources[`${key}_max`] !== undefined ? Number(resources[`${key}_max`]) : null);
  let next = set ?? current + (delta ?? 0);
  const floor = resourceFloor(resources, key);
  reject(next >= floor, `${actor.name}: ${name} is ${current}; it cannot drop below ${floor} (asked for ${next}).`,
    floor === 0 ? "A ruleset that keeps a signed counter stores its floor as <name>_min." : null);
  if (cap !== null) { next = Math.min(next, cap); resources[`${key}_max`] = cap; }
  resources[key] = next;
  setResources(shadow, actor, resources);
  const controlled = new Set(shadow.runtime.configuration?.controlledEntityIds ?? [shadow.hero().id]);
  const player = controlled.has(actor.id) && !name.startsWith("currency_") && !name.endsWith("_min") && !name.endsWith("_max")
    ? chip.counter(ctx.language, actor.name, isHero(actor), name, current, next, cap, reason) : null;
  return ok({ actor: actor.name, resource: name, before: current, after: next, max: cap, reason },
    `${actor.name}: ${name} ${current} → ${next}${cap !== null ? `/${cap}` : ""} (${reason})`, null, player);
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
    terms.currency = currencyKey(shadow, raw.currency).label;
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
      description: `${str(args.description)}${reward ? `\nReward: ${reward}.` : ""}`.trim() || title, status: "open",
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
  reject(shadow.counters.itemsCreated + terms.items.length <= ctx.limits.itemsPerTurn,
    `The reward of "${quest.title}" would exceed the campaign's ${ctx.limits.itemsPerTurn} new items per turn.`,
    "Pay it in a later turn.");
  if (terms.currency && terms.amount) {
    const { key } = currencyKey(shadow, terms.currency);
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
    public_outcome: { participants: participants.map((p) => p.name), recovered, consumed, minutes } } });
  const due = dueAfterTime(shadow, before);
  const heroId = shadow.hero().id;
  return ok({ kind, safe, minutes, recovered, consumed, ...due },
    `${kind === "long" ? "Long" : "Short"} rest (${minutes} min)${recovered.length ? `: ${recovered.map((r) => `${r.name} ${r.before}→${r.after}`).join(", ")}` : safe ? "" : ", no recovery"}${due.duePlans ? `; ${(due.duePlans as unknown[]).length} plan(s) due` : ""}`,
    null, chip.rest(ctx.language, kind, minutes, recovered.map((r) => ({ name: String(r.name), before: Number(r.before), after: Number(r.after), hero: participants.find((p) => p.name === r.name)?.id === heroId })), safe));
}

// --- combat ----------------------------------------------------------------
function combatTool(shadow: ShadowState, args: Args, ctx: ToolContext): DmLoopReceiptResult {
  const action = str(args.action);
  const active = shadow.runtime.encounters.find((row) => row.status === "active");
  if (action === "start") {
    reject(!active, "An encounter is already active.", "End it first (combat end) or add positions.");
    const refs = (args.participantRefs as unknown[] | undefined) ?? [];
    const participants = [...new Map([...shadow.partyIds().map((id) => shadow.entity(id)!),
      ...refs.map((ref) => entityOf(shadow, ref, "participantRefs"))].map((e) => [e.id, e])).values()];
    const id = stableGameplayId(ctx.input.operationId, `dm-loop:encounter:${ctx.toolCalls}`);
    shadow.apply({ family: "encounters", id, expectedRevision: null, values: { status: "active", round: 1, outcome: null,
      settings_revision: shadow.snapshot.settings.revision, public_summary: str(args.summary) } });
    participants.forEach((entity, index) => {
      shadow.apply({ family: "encounter_participants", id: stableGameplayId(ctx.input.operationId, `dm-loop:participant:${id}:${entity.id}`),
        expectedRevision: null, values: { encounter_id: id, entity_id: entity.id, public_name: entity.name, turn_order: index + 1,
          public_position: { position: "nearby" }, public_resources: { action: 1, move: 1, reaction: 1, active: index === 0, defending: false, withdrawn: false } } });
    });
    const config = shadow.configuration();
    config.presentEntityIds = [...new Set([...config.presentEntityIds, ...participants.map((p) => p.id)])];
    shadow.setConfiguration(config);
    return ok({ encounterId: id, participants: participants.map((p) => p.name) }, `Combat begins: ${participants.map((p) => p.name).join(", ")}`,
      null, chip.combatStart(ctx.language, participants.map((p) => p.name)));
  }
  reject(active, "No encounter is active.", "Start one with combat start.");
  if (action === "position") {
    const moved: string[] = [];
    for (const entry of (args.positions as { actorRef: unknown; position: string }[] | undefined) ?? []) {
      const entity = entityOf(shadow, entry.actorRef, "positions.actorRef");
      const participant = shadow.runtime.participants.find((row) => row.encounter_id === active.id && row.entity_id === entity.id);
      reject(participant, `${entity.name} is not in this encounter.`);
      shadow.apply({ family: "encounter_participants", id: participant.id, expectedRevision: null,
        values: { public_position: { position: entry.position } } });
      moved.push(`${entity.name}: ${entry.position}`);
    }
    return ok({ encounterId: active.id, moved }, `Positions: ${moved.join(", ") || "unchanged"}`);
  }
  reject(action === "end", `Unknown combat action "${action}".`);
  const outcome = str(args.outcome);
  reject(outcome.length > 0, "combat end needs an outcome.");
  shadow.apply({ family: "encounters", id: active.id, expectedRevision: null, values: { status: "ended", outcome,
    ...(args.summary !== undefined ? { public_summary: str(args.summary) } : {}) } });
  return ok({ encounterId: active.id, outcome }, `Combat ends: ${outcome}`, null, chip.combatEnd(ctx.language, outcome));
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
  shadow.apply(entityChange(shadow, entity, { conditions: [...new Set([...entity.conditions, "lost"])] }));
  return ok({ id: entity.id, removed: true }, `${entity.name} is lost to the party`, null, chip.holding(ctx.language, entity.kind, entity.name, true));
}

// --- notes -----------------------------------------------------------------
function noteWorld(shadow: ShadowState, args: Args): DmLoopReceiptResult {
  const kind = str(args.kind) as "fact" | "clock" | "faction" | "consequence";
  const key = str(args.key);
  reject(!key.startsWith("character_") && !key.startsWith("quest_reward_") && !key.startsWith("statblock_") && !key.startsWith("holding_"),
    "That key prefix is reserved by the server.");
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
    const due = args.dueInMinutes !== undefined ? shadow.worldMinutes + (int(args.dueInMinutes) ?? 0)
      : existing && (args.planStatus === undefined || status === "open") && existing.status === "open" ? existing.dueWorldMinutes : shadow.worldMinutes;
    reject(status !== "open" || args.dueInMinutes !== undefined || (existing !== null && existing.status === "open"),
      "An open plan needs dueInMinutes: when its next step lands.", "Give dueInMinutes (game minutes from now), or resolve the plan with planStatus.");
    const plan: OffScreenPlan = { key, actorId, goal, dueWorldMinutes: due, setAtWorldMinutes: shadow.worldMinutes,
      consequence: args.consequence !== undefined ? str(args.consequence) : existing?.consequence ?? "",
      warning: args.warning !== undefined ? str(args.warning) : existing?.warning ?? "", status };
    shadow.setPrivate("fact", key, serializePlan(plan));
    return ok({ kind, key, plan: { status, dueWorldMinutes: due, actor: actorId ? shadow.entity(actorId)?.name ?? null : null } },
      status === "open" ? "DM plan updated" : "DM plan resolved");
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
  reject(!["notebook", "notebook_session", "ledger", "variety", "metrics", "depth_state"].includes(key) && !key.startsWith("plan_"), "That key is kept by the server.");
  shadow.setPrivate(kind, key, value);
  return ok({ kind, key }, "DM note updated");
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
    playerLikes: likes.text, npcRefused: !!args.npcRefused };
  shadow.finished = true;
  const value: JsonObject = { recorded: true, playerMoment: moment,
    ...(likes.clipped ? { playerLikesClipped: `playerLikes was longer than ${PLAYER_LIKES_CAP} characters and was clipped; keep the note to what still holds.` } : {}),
    ...(gate && !gate.accepted ? { playerMomentRefused: `playerMoment was not accepted: ${gate.reason}. The turn is recorded without it; the player simply writes the next action.` } : {}) };
  return { result: ok(value, moment ? `Your moment: ${gate!.reason}` : gate ? `Turn recorded (player moment refused: ${gate.reason})` : "Turn recorded"), meta };
}

export type ExecutedTool = { result: DmLoopReceiptResult; meta?: DmLoopMeta };

/** Run one call. Shadow mutations of a rejected call are discarded. */
export function executeDmLoopTool(shadow: ShadowState, call: DmLoopToolCall, ctx: ToolContext): ExecutedTool {
  if (ctx.toolCalls >= ctx.limits.toolCallsPerTurn)
    return { result: { ok: false, reason: `This turn reached its ${ctx.limits.toolCallsPerTurn}-call limit.`,
      hint: "Finish the narration now with what was already accepted.", summary: `${call.name}: limit reached` } };
  const candidate = shadow.clone();
  try {
    const args = parseArgs(call.name, call.arguments);
    let executed: ExecutedTool;
    switch (call.name) {
      case "roll": executed = { result: roll(candidate, args, ctx) }; break;
      case "query_state": executed = { result: queryState(candidate, args) }; break;
      case "upsert_character": executed = { result: upsertCharacter(candidate, args, ctx) }; break;
      case "upsert_place": executed = { result: upsertPlace(candidate, args, ctx) }; break;
      case "move_party": executed = { result: moveParty(candidate, args, ctx) }; break;
      case "item": executed = { result: itemTool(candidate, args, ctx) }; break;
      case "money": executed = { result: moneyTool(candidate, args, ctx) }; break;
      case "resource": executed = { result: resourceTool(candidate, args, ctx) }; break;
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
