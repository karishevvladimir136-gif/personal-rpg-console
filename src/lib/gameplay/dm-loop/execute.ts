// Executes one dm-loop-v1 tool call against the shadow state. Every rule here
// guards data integrity (ownership, quantities, balances, bounds, exact-once
// rewards, fixed identities), never plausibility: the model is the DM.
// A rejected call returns a reason the model can act on; the turn continues.
import { randomInt } from "node:crypto";
import type { JsonObject, TurnInput } from "../contracts.ts";
import type { Entity, EquipmentSlot, Item, Quest } from "../../persistence/contracts.ts";
import type { RecordChange, RecordedCheck, RuntimeSource } from "../server-contracts.ts";
import { recordServerRoll, stableGameplayId } from "../dice.ts";
import { basicProfile } from "../mechanics/profile.ts";
import { settledItemTransfer } from "../../progression/settlement-core.ts";
import { parseCharacterModel, type CharacterEvidence, type CharacterModel } from "../character-model.ts";
import { validateToolArguments } from "../../server/dm/model/schema-compiler.ts";
import { dmLoopLimits as L } from "./limits.ts";
import { dmLoopTools, ITEM_CATEGORIES } from "./tools.ts";
import { ShadowState, ToolReject, reject } from "./shadow.ts";
import type { DmLoopMeta, DmLoopReceiptResult, DmLoopToolCall } from "./contracts.ts";

export type ToolContext = {
  input: TurnInput;
  /** Checks recorded so far in this turn (the Check DTO allows eight). */
  checks: RecordedCheck[];
  random: (min: number, max: number) => number;
  /** Narration scene of this turn, known before commit (deterministic ID). */
  narrationSceneId: string;
  /** Calls already made this turn; past the cap every call is refused. */
  toolCalls: number;
};

type Args = Record<string, unknown>;
const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const int = (value: unknown) => (typeof value === "number" && Number.isInteger(value) ? value : null);

function ok(value: JsonObject, summary: string, check: RecordedCheck | null = null): DmLoopReceiptResult {
  return { ok: true, value, summary, check };
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

const currencyName = /^[a-z]+(?: [a-z]+)*$/;
export function currencyKey(name: unknown): { label: string; key: string } {
  const label = str(name).toLowerCase().replace(/\s+/g, " ");
  reject(label.length >= 1 && label.length <= 32 && currencyName.test(label),
    `Currency "${str(name)}" must be lowercase words (coins, silver pieces, credits).`);
  return { label, key: `currency_${label.replaceAll(" ", "_")}` };
}
export function moneyOf(entity: Entity, key: string): number {
  return Number(entity.resources[key] ?? 0);
}

function entityChange(shadow: ShadowState, entity: Entity, values: JsonObject): RecordChange {
  return { family: "entities", id: entity.id, expectedRevision: entity.revision, values };
}

function setResources(shadow: ShadowState, entity: Entity, resources: Record<string, number>) {
  for (const [key, value] of Object.entries(resources))
    reject(Number.isInteger(value) && value >= 0 && value <= L.maxResourceValue,
      `${entity.name}: ${key} would become ${value}; counters stay between 0 and ${L.maxResourceValue}.`);
  shadow.apply(entityChange(shadow, entity, { resources }));
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

function parseArgs(name: string, raw: JsonObject): Args {
  const tool = dmLoopTools.find((entry) => entry.name === name);
  reject(tool, `Unknown tool "${name}".`, `Available tools: ${dmLoopTools.map((t) => t.name).join(", ")}.`);
  const problems = validateToolArguments(tool, raw);
  reject(problems.length === 0, `Arguments of ${name} are invalid: ${problems.slice(0, 6).join("; ")}.`);
  return raw;
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
function roll(shadow: ShadowState, args: Args, ctx: ToolContext): DmLoopReceiptResult {
  const formula = parseFormula(str(args.formula));
  const actorText = str(args.actorRef);
  const actor = actorText.toLowerCase() === "dm" ? null : entityOf(shadow, actorText, "actorRef");
  let modifier = formula.modifier;
  let modifierSource: string | null = null;
  if (args.modifierField !== undefined) {
    reject(actor, "A sheet modifier needs an actor (actorRef is \"dm\").");
    const field = str(args.modifierField);
    const value = actor.stats[field];
    reject(typeof value === "number" && Number.isInteger(value),
      `${actor.name} has no sheet stat "${field}".`,
      Object.keys(actor.stats).length ? `Known stats: ${Object.keys(actor.stats).join(", ")}.` : "The sheet has no numeric stats; roll without modifierField.");
    modifier += value;
    modifierSource = `${field} ${value >= 0 ? "+" : ""}${value}`;
  }
  reject(modifier >= -100 && modifier <= 100, "The total modifier must stay between -100 and +100.");
  const advantage = (str(args.advantage) || "normal") as RecordedCheck["advantage"];
  reject(advantage === "normal" || formula.count === 1, "Advantage and disadvantage apply to a single die only.");
  const controlled = new Set(shadow.runtime.configuration?.controlledEntityIds ?? [shadow.hero().id]);
  // A player-visible roll belongs to the player's own characters; NPC rolls stay private.
  const visibility: "player" | "private" = args.visibility === "player" && actor && controlled.has(actor.id) ? "player" : "private";
  const dc = int(args.dc);
  const kindText = str(args.kind) || "skill";
  const isCheck = formula.count === 1 && formula.sides === 20 && dc !== null && actor !== null;
  if (isCheck) {
    reject(ctx.checks.length < L.maxChecksPerTurn, `This turn already made ${L.maxChecksPerTurn} checks.`,
      "Narrate the remaining outcomes without a new check.");
    const kind: RecordedCheck["kind"] = kindText === "attack" ? "attack" : kindText === "save" ? "save" : "skill";
    const check = recordServerRoll(ctx.input.operationId, {
      index: ctx.checks.length, actorId: actor.id, targetId: null, kind, stat: kind,
      dc, dcPublic: false, visibility, important: true, uncertainty: "meaningful", advantage,
    }, modifier, 1, ctx.random);
    const value: JsonObject = { formula: str(args.formula), reason: str(args.reason), actor: actor.name, visibility,
      dice: [...check.dice], kept: check.kept, modifier, modifierSource, total: check.total, dc, success: check.success, checkId: check.id };
    return ok(value, `${actor.name} rolls ${str(args.formula)}${modifierSource ? ` (${modifierSource})` : ""}: ${check.total} vs ${dc} — ${check.success ? "success" : "failure"}`, check);
  }
  const count = advantage === "normal" ? formula.count : 2;
  const dice = Array.from({ length: count }, () => ctx.random(1, formula.sides + 1));
  reject(dice.every((die) => Number.isInteger(die) && die >= 1 && die <= formula.sides), "The dice source misbehaved.");
  const kept = advantage === "normal" ? dice.reduce((sum, die) => sum + die, 0)
    : advantage === "advantage" ? Math.max(...dice) : Math.min(...dice);
  const total = kept + modifier;
  const value: JsonObject = { formula: str(args.formula), reason: str(args.reason), actor: actor?.name ?? "DM", visibility,
    dice, kept, modifier, modifierSource, total, dc, success: dc === null ? null : total >= dc };
  return ok(value, `${actor?.name ?? "The DM"} rolls ${str(args.formula)}: ${total}${dc !== null ? ` vs ${dc} — ${total >= dc ? "success" : "failure"}` : ""}`);
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
    reject(entity.kind === "npc" || entity.kind === "companion", `${entity.name} is a ${entity.kind}, not a character.`);
    const values: JsonObject = {};
    if (args.name !== undefined) values.name = str(args.name);
    if (args.description !== undefined) values.details = str(args.description);
    if (args.kind !== undefined && args.kind !== entity.kind) {
      reject(entity.kind === "npc" && args.kind === "companion", `${entity.name} cannot change from ${entity.kind} to ${String(args.kind)}.`);
      values.kind = "companion";
    }
    if (args.stats !== undefined) values.stats = statsFrom(args, entity.stats);
    if (args.maxHp !== undefined || args.hp !== undefined) {
      const maxHp = int(args.maxHp) ?? entity.max_hp ?? int(args.hp);
      const hp = int(args.hp) ?? Math.min(entity.hp ?? maxHp ?? 0, maxHp ?? 0);
      reject(maxHp !== null && hp !== null && hp >= 0 && hp <= maxHp, `HP ${hp} must stay within 0..${maxHp}.`);
      values.hp = hp; values.max_hp = maxHp;
    }
    if (Object.keys(values).length) shadow.apply(entityChange(shadow, entity, values));
    if (args.statblock !== undefined) shadow.setPrivate("npc", `statblock_${entity.id}`, str(args.statblock));
    const present = args.present === undefined ? shadow.isPresent(entity.id) : !!args.present;
    const party = args.party === undefined ? config.controlledEntityIds.includes(entity.id) : !!args.party;
    const kind = (values.kind as string | undefined) ?? entity.kind;
    reject(!party || kind === "companion", "Only a companion can join the party.");
    config.presentEntityIds = present ? [...new Set([...config.presentEntityIds, entity.id])] : config.presentEntityIds.filter((id) => id !== entity.id);
    config.controlledEntityIds = party ? [...new Set([...config.controlledEntityIds, entity.id])] : config.controlledEntityIds.filter((id) => id !== entity.id);
    if (party) config.presentEntityIds = [...new Set([...config.presentEntityIds, entity.id])];
    shadow.setConfiguration(config);
    return ok({ id: entity.id, name: (values.name as string) ?? entity.name, kind, present, party },
      `${(values.name as string) ?? entity.name} updated`);
  }
  const name = str(args.name);
  reject(name.length > 0, "A new character needs a name.");
  const kind = str(args.kind) === "companion" ? "companion" : "npc";
  const key = localKey(args.localKey) ?? name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").slice(0, 60);
  const similar = shadow.similarEntities(name).filter((row) => row.kind !== "player");
  const id = shadow.newId(`entity:${key}`);
  reject(!shadow.entity(id), `The local key "${key}" already names a character in this turn.`);
  const maxHp = int(args.maxHp) ?? int(args.hp);
  const hp = int(args.hp) ?? maxHp;
  reject(maxHp === null || (hp !== null && hp >= 0 && hp <= maxHp), `HP ${hp} must stay within 0..${maxHp}.`);
  shadow.apply({ family: "entities", id, expectedRevision: null, values: {
    kind, name, details: str(args.description), hp: maxHp === null ? null : hp, max_hp: maxHp,
    stats: statsFrom(args, {}), resources: {}, conditions: [], equipment_slots: humanoidSlots(language) as unknown as JsonObject[],
  } });
  shadow.bindLocalKey(key, { family: "entities", id });
  if (args.statblock !== undefined) shadow.setPrivate("npc", `statblock_${id}`, str(args.statblock));
  const present = args.present === undefined ? true : !!args.present;
  const party = kind === "companion" && (args.party === undefined ? true : !!args.party);
  if (present || party) config.presentEntityIds = [...new Set([...config.presentEntityIds, id])];
  if (party) config.controlledEntityIds = [...new Set([...config.controlledEntityIds, id])];
  shadow.setConfiguration(config);
  void ctx;
  const value: JsonObject = { id, localKey: key, name, kind, present, party,
    ...(similar.length ? { hint: `Similar existing characters: ${similar.map((row) => `${row.name} (${row.id})`).join(", ")}. If this is the same person, update that record with ref instead.` } : {}) };
  return ok(value, `${name} recorded as ${kind === "companion" ? "a companion" : "a character"}`);
}

// --- upsert_place ----------------------------------------------------------
function upsertPlace(shadow: ShadowState, args: Args): DmLoopReceiptResult {
  if (args.ref !== undefined) {
    const ref = shadow.resolve(args.ref, ["locations"], "ref");
    const place = shadow.location(ref.id)!;
    const values: JsonObject = {};
    if (args.name !== undefined) values.name = str(args.name);
    if (args.description !== undefined) values.description = str(args.description);
    if (args.status !== undefined) values.status = str(args.status);
    if (Object.keys(values).length) shadow.apply({ family: "locations", id: place.id, expectedRevision: place.revision, values });
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
  return ok({ id, localKey: key, name }, `Place recorded: ${name}`);
}

// --- time and travel -------------------------------------------------------
function advanceMinutes(shadow: ShadowState, minutes: number, what: string) {
  reject(Number.isInteger(minutes) && minutes >= 0, `${what}: minutes must be a whole number.`);
  reject(shadow.minutesAdvanced + minutes <= L.maxMinutesPerTurn,
    `${what}: this turn would advance ${shadow.minutesAdvanced + minutes} minutes; one turn may advance at most ${L.maxMinutesPerTurn} (a week).`,
    "Narrate the long stretch and let the next turn continue it.");
  shadow.source.runtime.worldMinutes += minutes;
  shadow.minutesAdvanced += minutes;
}
function advanceTime(shadow: ShadowState, args: Args): DmLoopReceiptResult {
  const minutes = int(args.minutes) ?? 0;
  advanceMinutes(shadow, minutes, "advance_time");
  return ok({ minutes, worldMinutes: shadow.worldMinutes }, `${minutes} minutes pass (${str(args.reason)})`);
}
function moveParty(shadow: ShadowState, args: Args): DmLoopReceiptResult {
  const ref = shadow.resolve(args.placeRef, ["locations"], "placeRef");
  const place = shadow.location(ref.id)!;
  const minutes = int(args.minutes) ?? 0;
  reject(minutes > 0, "Travel takes time: minutes must be greater than 0.");
  const previous = shadow.snapshot.publicState.current_location_id;
  reject(previous !== place.id, `The party is already at ${place.name}.`, "Movement inside one place is narration, not a Location change.");
  advanceMinutes(shadow, minutes, "move_party");
  shadow.apply({ family: "public_state", id: shadow.campaignId, expectedRevision: shadow.snapshot.publicState.revision,
    values: { current_location_id: place.id } });
  if (place.status !== "visited") shadow.apply({ family: "locations", id: place.id, expectedRevision: place.revision, values: { status: "visited" } });
  // Companions in the party travel; local characters stay where they were.
  const config = shadow.configuration();
  const party = new Set(shadow.partyIds());
  config.presentEntityIds = config.presentEntityIds.filter((id) => party.has(id));
  config.nearbyStorageIds = [];
  shadow.setConfiguration(config);
  return ok({ placeId: place.id, name: place.name, minutes, worldMinutes: shadow.worldMinutes }, `The party travels to ${place.name} (${minutes} min)`);
}

// --- items -----------------------------------------------------------------
function destinationOf(shadow: ShadowState, value: unknown, what: string): { entity: Entity | null; storageId: string; label: string } {
  if (str(value).toLowerCase() === "camp") return { entity: null, storageId: shadow.campStorage().id, label: "the camp" };
  const entity = entityOf(shadow, value, what);
  return { entity, storageId: shadow.storageFor(entity).id, label: entity.name };
}
function itemTool(shadow: ShadowState, args: Args, ctx: ToolContext): DmLoopReceiptResult {
  const action = str(args.action);
  if (action === "create") {
    const name = str(args.name);
    reject(name.length > 0, "item create needs a name.");
    const category = str(args.category);
    reject((ITEM_CATEGORIES as readonly string[]).includes(category), `item create needs a category: ${ITEM_CATEGORIES.join(", ")}.`);
    const quantity = int(args.quantity) ?? 1;
    const destination = destinationOf(shadow, args.ownerRef ?? "camp", "ownerRef");
    const key = localKey(args.localKey) ?? `${name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-")}-${ctx.toolCalls}`.slice(0, 60);
    const id = shadow.newId(`item:${key}`);
    reject(!shadow.item(id), `The local key "${key}" already names an item in this turn.`);
    shadow.apply({ family: "items", id, expectedRevision: null, values: {
      name, category, quantity, description: str(args.description), mechanics: str(args.properties),
      owner_entity_id: destination.entity?.id ?? null, storage_id: destination.storageId,
      equipped_entity_id: null, equipped_slot: null } });
    shadow.bindLocalKey(key, { family: "items", id });
    return ok({ id, localKey: key, name, category, quantity, owner: destination.label }, `${destination.label} gets ${name}${quantity > 1 ? ` ×${quantity}` : ""}`);
  }
  const item = itemOf(shadow, args.itemRef, "itemRef");
  if (action === "transfer") {
    const destination = destinationOf(shadow, args.ownerRef, "ownerRef");
    const quantity = int(args.quantity) ?? item.quantity;
    reject(quantity >= 1 && quantity <= item.quantity, `${ownerName(shadow, item)} has ${item.quantity} × ${item.name}, not ${quantity}.`);
    reject(item.equipped_entity_id === null, `${item.name} is equipped by ${ownerName(shadow, item)}.`, "Unequip it first (item unequip).");
    reject((destination.entity?.id ?? null) !== item.owner_entity_id || destination.storageId !== item.storage_id,
      `${item.name} already belongs to ${destination.label}.`);
    const splitId = shadow.newId(`split:${item.id}:${ctx.toolCalls}`);
    const settled = settledItemTransfer(item, quantity, destination.entity?.id ?? (null as unknown as string), destination.storageId, splitId);
    for (const change of settled.changes) {
      if (change.id === splitId) change.values.owner_entity_id = destination.entity?.id ?? null;
      else if (change.values.owner_entity_id === undefined && item.quantity === quantity) change.values.owner_entity_id = destination.entity?.id ?? null;
      shadow.apply(change);
    }
    if (settled.split && args.localKey !== undefined) shadow.bindLocalKey(str(args.localKey), { family: "items", id: splitId });
    return ok({ itemId: settled.transferredItemId, name: item.name, quantity, to: destination.label },
      `${item.name}${quantity > 1 ? ` ×${quantity}` : ""} goes to ${destination.label}`);
  }
  if (action === "consume") {
    const quantity = int(args.quantity) ?? 1;
    reject(quantity >= 1 && quantity <= item.quantity, `Only ${item.quantity} × ${item.name} left; cannot consume ${quantity}.`);
    const remaining = item.quantity - quantity;
    const values: JsonObject = { quantity: remaining };
    if (remaining === 0 && item.equipped_entity_id) { values.equipped_entity_id = null; values.equipped_slot = null; }
    shadow.apply({ family: "items", id: item.id, expectedRevision: item.revision, values });
    return ok({ itemId: item.id, name: item.name, consumed: quantity, remaining }, `${ownerName(shadow, item)} uses ${item.name}${quantity > 1 ? ` ×${quantity}` : ""} (${remaining} left)`);
  }
  if (action === "equip") {
    reject(item.owner_entity_id, `${item.name} lies in ${ownerName(shadow, item)}; only an owned item can be equipped.`);
    const owner = shadow.entity(item.owner_entity_id)!;
    reject(item.quantity > 0, `${item.name} is used up.`);
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
      `${owner.name} equips ${item.name} (${slot.label})`);
  }
  if (action === "unequip") {
    reject(item.equipped_entity_id, `${item.name} is not equipped.`);
    shadow.apply({ family: "items", id: item.id, expectedRevision: item.revision, values: { equipped_entity_id: null, equipped_slot: null } });
    return ok({ itemId: item.id, name: item.name }, `${ownerName(shadow, item)} puts away ${item.name}`);
  }
  reject(action === "split", `Unknown item action "${action}".`);
  const quantity = int(args.quantity);
  reject(quantity !== null && quantity >= 1 && quantity < item.quantity, `Split needs a quantity between 1 and ${item.quantity - 1}.`);
  const key = localKey(args.localKey) ?? `split-${ctx.toolCalls}`;
  const id = shadow.newId(`item:${key}`);
  shadow.apply({ family: "items", id: item.id, expectedRevision: item.revision, values: { quantity: item.quantity - quantity } });
  shadow.apply({ family: "items", id, expectedRevision: null, values: { name: item.name, category: item.category, quantity,
    description: item.description, mechanics: item.mechanics, owner_entity_id: item.owner_entity_id, storage_id: item.storage_id,
    equipped_entity_id: null, equipped_slot: null } });
  shadow.bindLocalKey(key, { family: "items", id });
  return ok({ itemId: id, localKey: key, name: item.name, quantity }, `${item.name} split: ${quantity} set aside`);
}

// --- money -----------------------------------------------------------------
function moneyTool(shadow: ShadowState, args: Args): DmLoopReceiptResult {
  const action = str(args.action);
  const { label, key } = currencyKey(args.currency);
  const amount = int(args.amount);
  reject(amount !== null && amount >= 1 && amount <= L.maxMoneyPerCall, `amount must be between 1 and ${L.maxMoneyPerCall}.`);
  const fmt = (n: number) => `${n} ${label}`;
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
    return ok({ currency: label, amount, from: from.name, to: to.name, fromBalance: have - amount, toBalance: moneyOf(toNow, key) },
      `${from.name} pays ${to.name} ${fmt(amount)}`);
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
    setResources(shadow, to, { ...to.resources, [key]: moneyOf(to, key) + amount });
    return ok({ currency: label, amount, to: to.name, balance: moneyOf(shadow.entity(to.id)!, key), reason }, `${to.name} receives ${fmt(amount)} (${reason})`);
  }
  reject(action === "spend", `Unknown money action "${action}".`);
  const from = entityOf(shadow, args.fromRef, "fromRef");
  const have = moneyOf(from, key);
  reject(have >= amount, `Not enough ${label}: ${from.name} has ${have}, this costs ${amount}.`);
  setResources(shadow, from, { ...from.resources, [key]: have - amount });
  return ok({ currency: label, amount, from: from.name, balance: have - amount, reason: str(args.reason) }, `${from.name} spends ${fmt(amount)}${args.reason ? ` (${str(args.reason)})` : ""}`);
}

// --- resource --------------------------------------------------------------
function resourceTool(shadow: ShadowState, args: Args): DmLoopReceiptResult {
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
    return ok({ actor: actor.name, resource: "hp", before: current, after: next, max: maxHp, reason },
      `${actor.name}: HP ${current} → ${next}/${maxHp} (${reason})`);
  }
  reject(/^[a-z][a-z0-9_ -]{0,59}$/.test(name), "Counter names are lowercase words or identifiers.");
  const key = name.replace(/[\s-]+/g, "_");
  const resources = { ...actor.resources };
  const current = Number(resources[key] ?? 0);
  const cap = max ?? (Number.isFinite(Number(resources[`${key}_max`])) && resources[`${key}_max`] !== undefined ? Number(resources[`${key}_max`]) : null);
  let next = set ?? current + (delta ?? 0);
  reject(next >= 0, `${actor.name}: ${name} is ${current}; it cannot drop below 0 (asked for ${next}).`);
  if (cap !== null) { next = Math.min(next, cap); resources[`${key}_max`] = cap; }
  resources[key] = next;
  setResources(shadow, actor, resources);
  return ok({ actor: actor.name, resource: name, before: current, after: next, max: cap, reason },
    `${actor.name}: ${name} ${current} → ${next}${cap !== null ? `/${cap}` : ""} (${reason})`);
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
    terms.currency = currencyKey(raw.currency).label;
    terms.amount = int(raw.amount);
  }
  for (const item of (raw.items as { name: unknown; category: unknown; quantity: unknown; properties?: unknown }[] | undefined) ?? [])
    terms.items.push({ name: str(item.name), category: str(item.category), quantity: int(item.quantity) ?? 1, properties: str(item.properties ?? "") });
  if (terms.currency === null && !terms.items.length && !terms.note) return null;
  void shadow;
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
  if (action === "create") {
    const title = str(args.title);
    reject(title.length > 0, "quest create needs a title.");
    const issuer = args.issuerRef !== undefined ? entityOf(shadow, args.issuerRef, "issuerRef") : null;
    const terms = parseReward(shadow, args.reward, issuer?.id ?? null);
    const key = localKey(args.localKey) ?? title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").slice(0, 60);
    const id = shadow.newId(`quest:${key}`);
    reject(!shadow.quest(id), `The local key "${key}" already names a quest in this turn.`);
    const reward = rewardText(terms);
    shadow.apply({ family: "quests", id, expectedRevision: null, values: { title,
      description: `${str(args.description)}${reward ? `\nReward: ${reward}.` : ""}`.trim() || title, status: "open" } });
    shadow.bindLocalKey(key, { family: "quests", id });
    if (terms) shadow.setPrivate("fact", `quest_reward_${id}`, JSON.stringify(terms));
    return ok({ id, localKey: key, title, status: "open", reward: reward || null, issuer: issuer?.name ?? null },
      `Quest taken: ${title}${reward ? ` (reward: ${reward})` : ""}`);
  }
  const quest = questOf(shadow, args.questRef, "questRef");
  if (action === "update") {
    const values: JsonObject = {};
    if (args.title !== undefined) values.title = str(args.title);
    if (args.description !== undefined) values.description = str(args.description);
    if (args.reward !== undefined) {
      const existing = rewardTerms(shadow, quest);
      reject(!existing?.paidOperationId, `The reward of "${quest.title}" was already paid; its terms are closed.`);
      const terms = parseReward(shadow, args.reward, existing?.issuerId ?? null);
      if (terms) shadow.setPrivate("fact", `quest_reward_${quest.id}`, JSON.stringify(terms));
    }
    if (Object.keys(values).length) shadow.apply({ family: "quests", id: quest.id, expectedRevision: quest.revision, values });
    return ok({ id: quest.id, title: (values.title as string) ?? quest.title }, `Quest updated: ${(values.title as string) ?? quest.title}`);
  }
  if (action === "complete" || action === "fail") {
    reject(quest.status === "open", `"${quest.title}" is already ${quest.status}.`);
    const status = action === "complete" ? "complete" : "archived";
    shadow.apply({ family: "quests", id: quest.id, expectedRevision: quest.revision, values: { status,
      ...(action === "fail" ? { description: `${quest.description}\nFailed.` } : {}) } });
    return ok({ id: quest.id, title: quest.title, status }, `Quest ${action === "complete" ? "completed" : "failed"}: ${quest.title}`);
  }
  reject(action === "claim_reward", `Unknown quest action "${action}".`);
  reject(quest.status === "complete", `"${quest.title}" is ${quest.status}; complete it before paying the reward.`);
  const terms = rewardTerms(shadow, quest);
  reject(terms, `"${quest.title}" has no recorded reward terms.`, "If a reward was agreed in play, add it with quest update first.");
  reject(!terms.paidOperationId, `The reward of "${quest.title}" was already paid.`, "Refuse a second payment in character.");
  const recipient = args.recipientRef !== undefined ? entityOf(shadow, args.recipientRef, "recipientRef") : shadow.hero();
  const paid: JsonObject = { quest: quest.title, recipient: recipient.name };
  if (terms.currency && terms.amount) {
    const { key } = currencyKey(terms.currency);
    const issuer = terms.issuerId ? shadow.entity(terms.issuerId) : null;
    if (issuer && moneyOf(issuer, key) >= terms.amount) {
      setResources(shadow, issuer, { ...issuer.resources, [key]: moneyOf(issuer, key) - terms.amount });
      paid.paidBy = issuer.name;
    }
    const now = shadow.entity(recipient.id)!;
    setResources(shadow, now, { ...now.resources, [key]: moneyOf(now, key) + terms.amount });
    paid.money = `${terms.amount} ${terms.currency}`;
  }
  const storage = shadow.storageFor(recipient).id;
  paid.items = terms.items.map((item, index) => {
    const id = shadow.newId(`reward:${quest.id}:${index}`);
    shadow.apply({ family: "items", id, expectedRevision: null, values: { name: item.name,
      category: (ITEM_CATEGORIES as readonly string[]).includes(item.category) ? item.category : "misc",
      quantity: item.quantity, description: `Reward for: ${quest.title}.`, mechanics: item.properties,
      owner_entity_id: recipient.id, storage_id: storage, equipped_entity_id: null, equipped_slot: null } });
    return { id, name: item.name, quantity: item.quantity };
  });
  shadow.setPrivate("fact", `quest_reward_${quest.id}`, JSON.stringify({ ...terms, paidOperationId: ctx.input.operationId }));
  return ok(paid, `${recipient.name} receives the reward for "${quest.title}": ${rewardText(terms)}`);
}

// --- rest ------------------------------------------------------------------
function restTool(shadow: ShadowState, args: Args, ctx: ToolContext): DmLoopReceiptResult {
  const kind = str(args.kind) === "long" ? "long" : "short";
  const safe = !!args.safe;
  const minutes = int(args.minutes) ?? (kind === "long" ? basicProfile.longMinutes : basicProfile.shortMinutes);
  advanceMinutes(shadow, minutes, "rest");
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
  return ok({ kind, safe, minutes, recovered, consumed },
    `${kind === "long" ? "Long" : "Short"} rest (${minutes} min)${recovered.length ? `: ${recovered.map((r) => `${r.name} ${r.before}→${r.after}`).join(", ")}` : safe ? "" : ", no recovery"}`);
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
    return ok({ encounterId: id, participants: participants.map((p) => p.name) }, `Combat begins: ${participants.map((p) => p.name).join(", ")}`);
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
  return ok({ encounterId: active.id, outcome }, `Combat ends: ${outcome}`);
}

// --- holdings --------------------------------------------------------------
function holdingTool(shadow: ShadowState, args: Args): DmLoopReceiptResult {
  const action = str(args.action);
  if (action === "create") {
    const name = str(args.name);
    reject(name.length > 0, "holding create needs a name.");
    const kind = str(args.kind);
    reject(["transport", "base", "mount"].includes(kind), "holding kind: transport, base or mount.");
    const key = localKey(args.localKey) ?? name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").slice(0, 60);
    if (kind === "base") {
      const id = shadow.newId(`storage:${key}`);
      reject(!shadow.storage(id), `The local key "${key}" is taken.`);
      shadow.apply({ family: "storages", id, expectedRevision: null, values: { name, kind: "camp", entity_id: null } });
      shadow.bindLocalKey(key, { family: "storages", id });
      shadow.setPrivate("fact", `holding_${id}`, JSON.stringify({ kind, name, description: str(args.description) }));
      return ok({ id, localKey: key, kind, name }, `New base: ${name}`);
    }
    const id = shadow.newId(`entity:${key}`);
    reject(!shadow.entity(id), `The local key "${key}" is taken.`);
    shadow.apply({ family: "entities", id, expectedRevision: null, values: { kind, name, details: str(args.description),
      hp: null, max_hp: null, stats: {}, resources: {}, conditions: [], equipment_slots: [] } });
    shadow.bindLocalKey(key, { family: "entities", id });
    shadow.storageFor(shadow.entity(id)!);
    return ok({ id, localKey: key, kind, name }, `New ${kind}: ${name}`);
  }
  const ref = shadow.resolve(args.holdingRef, ["entities", "storages"], "holdingRef");
  if (ref.family === "storages") {
    const storage = shadow.storage(ref.id)!;
    reject(storage.kind === "camp", `${storage.name} is not a holding.`);
    if (action === "update") {
      if (args.name !== undefined) shadow.apply({ family: "storages", id: storage.id, expectedRevision: storage.revision, values: { name: str(args.name) } });
      return ok({ id: storage.id, name: str(args.name) || storage.name }, `${str(args.name) || storage.name} updated`);
    }
    shadow.setPrivate("fact", `holding_${storage.id}`, JSON.stringify({ removed: true }));
    return ok({ id: storage.id, removed: true }, `${storage.name} is no longer the party's`);
  }
  const entity = shadow.entity(ref.id)!;
  reject(entity.kind === "transport" || entity.kind === "mount", `${entity.name} is a ${entity.kind}, not a holding.`);
  if (action === "update") {
    const values: JsonObject = {};
    if (args.name !== undefined) values.name = str(args.name);
    if (args.description !== undefined) values.details = str(args.description);
    if (Object.keys(values).length) shadow.apply(entityChange(shadow, entity, values));
    return ok({ id: entity.id, name: (values.name as string) ?? entity.name }, `${(values.name as string) ?? entity.name} updated`);
  }
  reject(action === "remove", `Unknown holding action "${action}".`);
  shadow.apply(entityChange(shadow, entity, { conditions: [...new Set([...entity.conditions, "lost"])] }));
  return ok({ id: entity.id, removed: true }, `${entity.name} is lost to the party`);
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
  const value = str(args.value);
  reject(value.length > 0 && value.length <= 2000, "A set note needs a value of up to 2000 characters.");
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
  const episodes = args.episodes !== undefined
    ? ((args.episodes as { meaning: unknown; cue?: unknown }[]).map((e) => ({ evidence, meaning: str(e.meaning), cue: e.cue !== undefined ? str(e.cue) || null : null })))
      .slice(-L.characterModel.episodes)
    : existing?.episodes ?? [];
  const model: CharacterModel = { schemaVersion: 1, actorId: actor.id, basisOperationId: ctx.input.operationId,
    identity, current, beliefs, relationships, episodes };
  let parsed: CharacterModel;
  try { parsed = parseCharacterModel(JSON.parse(JSON.stringify(model))); }
  catch { throw new ToolReject(`${actor.name}'s Character Model does not fit the limits (3 values, 2 wants, 2 boundaries, 2 loyalties, 3 signatures, texts up to 120–180 characters, 3 beliefs, 2 relationships, 3 episodes).`); }
  reject(new Set(parsed.relationships.map((r) => r.actorId)).size === parsed.relationships.length, "One relationship per character.");
  shadow.setPrivate("npc", `character_${actor.id}`, JSON.stringify(parsed));
  return ok({ actor: actor.name, established: !existing, stress: parsed.current.stress }, `${actor.name}'s character notes ${existing ? "updated" : "started"}`);
}

// --- finish ----------------------------------------------------------------
function finishTurn(shadow: ShadowState, args: Args): { result: DmLoopReceiptResult; meta: DmLoopMeta } {
  const spotlight = ((args.spotlight as unknown[]) ?? []).flatMap((ref) => {
    try { return [shadow.resolve(ref, ["entities"], "spotlight").id]; } catch { return []; }
  });
  const meta: DmLoopMeta = { sceneKinds: [...new Set((args.sceneKinds as DmLoopMeta["sceneKinds"]) ?? [])], spotlight: [...new Set(spotlight)], playerMoment: !!args.playerMoment };
  shadow.finished = true;
  return { result: ok({ recorded: true, playerMoment: meta.playerMoment }, meta.playerMoment ? "Your moment: describe how you do it" : "Turn recorded"), meta };
}

export type ExecutedTool = { result: DmLoopReceiptResult; meta?: DmLoopMeta };

/** Run one call. Shadow mutations of a rejected call are discarded. */
export function executeDmLoopTool(shadow: ShadowState, call: DmLoopToolCall, ctx: ToolContext): ExecutedTool {
  if (ctx.toolCalls >= L.maxToolCalls)
    return { result: { ok: false, reason: `This turn reached its ${L.maxToolCalls}-call limit.`,
      hint: "Finish the narration now with what was already accepted.", summary: `${call.name}: limit reached` } };
  const candidate = shadow.clone();
  try {
    const args = parseArgs(call.name, call.arguments);
    let executed: ExecutedTool;
    switch (call.name) {
      case "roll": executed = { result: roll(candidate, args, ctx) }; break;
      case "query_state": executed = { result: queryState(candidate, args) }; break;
      case "upsert_character": executed = { result: upsertCharacter(candidate, args, ctx) }; break;
      case "upsert_place": executed = { result: upsertPlace(candidate, args) }; break;
      case "move_party": executed = { result: moveParty(candidate, args) }; break;
      case "item": executed = { result: itemTool(candidate, args, ctx) }; break;
      case "money": executed = { result: moneyTool(candidate, args) }; break;
      case "resource": executed = { result: resourceTool(candidate, args) }; break;
      case "quest": executed = { result: questTool(candidate, args, ctx) }; break;
      case "advance_time": executed = { result: advanceTime(candidate, args) }; break;
      case "rest": executed = { result: restTool(candidate, args, ctx) }; break;
      case "note_character": executed = { result: noteCharacter(candidate, args, ctx) }; break;
      case "note_world": executed = { result: noteWorld(candidate, args) }; break;
      case "combat": executed = { result: combatTool(candidate, args, ctx) }; break;
      case "holding": executed = { result: holdingTool(candidate, args) }; break;
      case "finish_turn": executed = finishTurn(candidate, args); break;
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
