import { isUuid } from "../persistence/validation.ts";
import type {
  ConfigurePlayInput,
  GuidanceApprovalInput,
  MechanicChoice,
  MechanicsConfiguration,
  ResumeInput,
  TurnInput,
} from "./contracts.ts";

export class GameplayRequestError extends Error {
  readonly code = "validation";
  constructor() {
    super("validation");
  }
}
function assert(value: unknown): asserts value {
  if (!value) throw new GameplayRequestError();
}
function object(value: unknown, keys: string[]): Record<string, unknown> {
  assert(value !== null && typeof value === "object" && !Array.isArray(value));
  const row = value as Record<string, unknown>;
  assert(
    Object.keys(row).length === keys.length &&
      keys.every((key) => Object.hasOwn(row, key)),
  );
  return row;
}
function text(value: unknown, max: number, empty = false) {
  assert(
    typeof value === "string" &&
      value.length <= max &&
      (empty || value.trim().length > 0) &&
      !value.includes("\u0000"),
  );
}
function integer(value: unknown, min: number, max: number) {
  assert(
    typeof value === "number" &&
      Number.isSafeInteger(value) &&
      value >= min &&
      value <= max,
  );
}
function ids(value: unknown, max = 50) {
  assert(
    Array.isArray(value) &&
      value.length <= max &&
      value.every(isUuid) &&
      new Set(value).size === value.length,
  );
}
function scope(row: Record<string, unknown>, campaignId: string) {
  assert(isUuid(campaignId) && row.campaignId === campaignId);
}
function choices(value: unknown, allowed: readonly string[]) {
  assert(typeof value === "string" && allowed.includes(value));
}
function nullableId(value: unknown) {
  assert(value === null || isUuid(value));
}
function quantities(value: unknown) {
  assert(Array.isArray(value) && value.length <= 50);
  for (const entry of value) {
    const item = object(entry, ["itemId", "quantity"]);
    assert(isUuid(item.itemId));
    integer(item.quantity, 1, 1000);
  }
  assert(new Set(value.map((entry) => entry.itemId)).size === value.length);
}
export function validateMechanicChoice(value: unknown): MechanicChoice {
  assert(value !== null && typeof value === "object" && "kind" in value);
  const fields: Record<string, string[]> = {
    "resource.spend": ["entityId", "resource", "amount"],
    "item.consume": ["actorId", "itemId", "quantity"],
    "item.transfer": ["actorId", "itemId", "quantity", "destinationStorageId"],
    "item.equip": ["actorId", "itemId", "slot"],
    "quest.transition": ["questId", "status"],
    "location.move": ["locationId"],
    "encounter.start": ["participantIds"],
    "encounter.action": ["actorId", "action", "targetId", "itemId", "position"],
    "encounter.end": ["outcome"],
    "rest.enter": ["restKind", "participantIds"],
    "rest.leave": ["restId"],
    "rest.complete": ["restId", "supplies"],
    "recipe.prepare": ["actorId", "recipe", "ingredients", "outputStorageId"],
    "recipe.serve": ["actorId", "itemId", "recipientIds"],
    "item.transform": [
      "actorId",
      "recipe",
      "inputs",
      "toolIds",
      "outputStorageId",
    ],
    forage: ["actorId", "outputStorageId"],
  };
  assert(typeof value.kind === "string" && Object.hasOwn(fields, value.kind));
  const kind = value.kind;
  const row = object(value, ["kind", ...fields[kind]]);
  for (const key of fields[kind]) {
    if (key.endsWith("Ids")) ids(row[key]);
    else if (key.endsWith("Id")) {
      if (kind === "encounter.action" && ["targetId", "itemId"].includes(key))
        nullableId(row[key]);
      else assert(isUuid(row[key]));
    }
  }
  if ("quantity" in row) integer(row.quantity, 1, 1000);
  if (kind === "resource.spend") {
    text(row.resource, 80);
    integer(row.amount, 1, 1000);
  }
  if (kind === "item.equip" && row.slot !== null) text(row.slot, 80);
  if (kind === "quest.transition")
    choices(row.status, ["open", "complete", "archived"]);
  if (kind === "encounter.action") {
    choices(row.action, [
      "attack",
      "defend",
      "move",
      "end-turn",
      "intercept",
      "item",
    ]);
    if (row.position !== null)
      choices(row.position, ["nearby", "far", "cover"]);
  }
  if (kind === "encounter.end")
    choices(row.outcome, [
      "victory",
      "escape",
      "surrender",
      "negotiation",
      "objective-completion",
    ]);
  if (kind === "rest.enter") choices(row.restKind, ["short", "long"]);
  if (kind === "rest.complete") quantities(row.supplies);
  if (kind === "recipe.prepare") {
    choices(row.recipe, ["meal", "coffee"]);
    quantities(row.ingredients);
  }
  if (kind === "item.transform") {
    choices(row.recipe, ["improvised-spear"]);
    quantities(row.inputs);
  }
  return structuredClone(row) as MechanicChoice;
}
export function validateTurnInput(
  value: unknown,
  campaignId: string,
): TurnInput {
  const row = object(value, [
    "operationId",
    "campaignId",
    "expectedRevision",
    "mode",
    "input",
    "companionId",
    "listenerIds",
    "mechanic",
  ]);
  scope(row, campaignId);
  assert(isUuid(row.operationId));
  integer(row.expectedRevision, 0, 2147483646);
  choices(row.mode, ["game", "companion", "feedback", "ooc", "mechanic"]);
  text(row.input, 20000);
  nullableId(row.companionId);
  ids(row.listenerIds);
  assert((row.mode === "companion") === (row.companionId !== null));
  if (row.mode !== "companion")
    assert((row.listenerIds as unknown[]).length === 0);
  assert((row.mode === "mechanic") === (row.mechanic !== null));
  if (row.mechanic !== null) validateMechanicChoice(row.mechanic);
  return structuredClone(row) as TurnInput;
}
export function validateResumeInput(
  value: unknown,
  campaignId: string,
  operationId: string,
): ResumeInput {
  const row = object(value, [
    "commandId",
    "campaignId",
    "operationId",
    "action",
    "checkId",
  ]);
  scope(row, campaignId);
  assert(
    isUuid(row.commandId) &&
      isUuid(operationId) &&
      row.operationId === operationId,
  );
  choices(row.action, ["retry", "continue", "reroll", "cancel"]);
  nullableId(row.checkId);
  assert((row.action === "reroll") === (row.checkId !== null));
  return structuredClone(row) as ResumeInput;
}
export function validateConfiguration(value: unknown): MechanicsConfiguration {
  const row = object(value, [
    "profile",
    "controlledEntityIds",
    "presentEntityIds",
    "nearbyStorageIds",
    "safeLocationIds",
    "itemRules",
  ]);
  assert(row.profile === "console-basic-v1");
  for (const key of [
    "controlledEntityIds",
    "presentEntityIds",
    "nearbyStorageIds",
    "safeLocationIds",
  ])
    ids(row[key]);
  assert(Array.isArray(row.itemRules) && row.itemRules.length <= 200);
  for (const value of row.itemRules) {
    const item = object(value, ["itemId", "tag", "damage"]);
    assert(isUuid(item.itemId));
    choices(item.tag, [
      "supply",
      "meat",
      "coffee",
      "water",
      "knife",
      "stick",
      "binding",
      "cutting-tool",
      "weapon",
      "healing",
      "meal-serving",
      "coffee-serving",
    ]);
    if (item.damage !== null) integer(item.damage, 1, 20);
  }
  assert(
    new Set(row.itemRules.map((item) => item.itemId)).size ===
      row.itemRules.length,
  );
  return structuredClone(row) as MechanicsConfiguration;
}
export function validateConfigurePlayInput(
  value: unknown,
  campaignId: string,
): ConfigurePlayInput {
  const row = object(value, [
    "requestId",
    "campaignId",
    "expectedRevision",
    "configuration",
  ]);
  scope(row, campaignId);
  assert(isUuid(row.requestId));
  integer(row.expectedRevision, 0, 2147483646);
  validateConfiguration(row.configuration);
  return structuredClone(row) as ConfigurePlayInput;
}
export function validateGuidanceApproval(
  value: unknown,
  campaignId: string,
): GuidanceApprovalInput {
  const row = object(value, [
    "requestId",
    "campaignId",
    "operationId",
    "proposalId",
    "scope",
    "sessionId",
    "expectedGuideRevision",
  ]);
  scope(row, campaignId);
  for (const key of ["requestId", "operationId", "proposalId"])
    assert(isUuid(row[key]));
  choices(row.scope, ["session", "campaign"]);
  nullableId(row.sessionId);
  assert((row.scope === "session") === (row.sessionId !== null));
  integer(row.expectedGuideRevision, 1, 2147483646);
  return structuredClone(row) as GuidanceApprovalInput;
}
