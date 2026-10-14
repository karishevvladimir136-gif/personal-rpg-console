import type { Item } from "../persistence/contracts.ts";
import type { TimelineFence } from "../saves/contracts.ts";
import type { ItemQuantity, JsonObject, MechanicChoice, TurnInput } from "./contracts.ts";
import type { MechanicsResolution, RuntimeSource } from "./server-contracts.ts";
import { isRestProvision } from "./rest-provisions.ts";
import { stableGameplayId } from "./dice.ts";
import { mechanicPlanForActions, resolveMechanics, validateMechanicChoice,
  validatePlan } from "./mechanics/resolve.ts";
import { requireSourceTimeline } from "./timeline.ts";
import { requireRule, TurnError } from "./turn-errors.ts";

/** These actions use the existing resolver without introducing a second dice
 * lifecycle. Check-bearing actions continue through Astra's recorded tools. */
export const astraMechanicActionKinds = [
  "resource.spend", "item.consume", "item.transfer", "item.equip",
  "quest.transition", "location.move", "rest.enter", "rest.leave",
  "rest.complete", "recipe.prepare", "recipe.serve",
] as const;

export type AstraRestSafety = { locationId: string; suitable: boolean };
export type AstraMechanicsIntent =
  | { kind: "mechanic_actions"; actions: MechanicChoice[];
      restSafety: AstraRestSafety | null }
  | { kind: "formal_rest"; restKind: "short" | "long";
      restSafety: AstraRestSafety | null };
export type AstraRestSafetyPin = {
  campaignId: string;
  operationId: string;
  timeline: TimelineFence | null;
  locationId: string;
  suitable: boolean;
};
export type AstraMechanicsPlan = {
  schemaVersion: 1;
  kind: AstraMechanicsIntent["kind"];
  intent: AstraMechanicsIntent;
  actions: MechanicChoice[];
  resolution: MechanicsResolution;
  safety: AstraRestSafetyPin | null;
  publicOutcome: { kind: AstraMechanicsIntent["kind"];
    completedRest: boolean; restId: string | null };
};
export type AstraMechanicsObstructionReason = "insufficient_supplies" |
  "unsafe_rest" | "active_encounter" | "rest_kind_mismatch" |
  "interrupted_rest" | "check_required" | "mechanics_unavailable";

/** A safe, public obstruction; it contains no private state or provider text. */
export class AstraMechanicsObstruction extends TurnError {
  reason: AstraMechanicsObstructionReason;
  constructor(reason: AstraMechanicsObstructionReason) {
    super("validation");
    this.name = "AstraMechanicsObstruction";
    this.reason = reason;
  }
}

const ownFields = (value: object, keys: string[]) =>
  Object.keys(value).length === keys.length &&
  Object.keys(value).every((key) => keys.includes(key));

/** Call outside the optional-effect catch: a foreign or non-present reference
 * is an integrity failure, rather than an omitted fictional consequence. */
export function assertAstraMechanicsScope(source: RuntimeSource, input: TurnInput,
  intent: AstraMechanicsIntent): void {
  requireRule(source.snapshot.campaign.id === input.campaignId &&
    source.runtime.campaignId === input.campaignId &&
    source.runtime.revision === input.expectedRevision && input.mode === "game");
  requireSourceTimeline(source, input.timeline);
  requireRule(intent && typeof intent === "object" &&
    ["mechanic_actions", "formal_rest"].includes(intent.kind));
  const cid = input.campaignId;
  const config = source.runtime.configuration;
  const present = new Set(source.worldTakeover?.presentEntityIds ??
    config?.presentEntityIds ?? []);
  const controlled = new Set(config?.controlledEntityIds ?? []);
  const actor = (id: string, control = true) => requireRule(
    present.has(id) && (!control || controlled.has(id)) &&
    source.snapshot.entities.some((row) => row.id === id &&
      row.campaign_id === cid && (!control ||
        row.kind === "player" || row.kind === "companion")));
  const generatedItems = new Set<string>();
  const generatedRests = new Set<string>();
  const item = (id: string) => requireRule(generatedItems.has(id) ||
    source.snapshot.items.some((row) => row.id === id &&
      row.campaign_id === cid && (row.owner_entity_id === null ||
        controlled.has(row.owner_entity_id)) &&
      !source.astraSettlementItemPolicies?.some((policy) =>
        policy.itemId === row.id && policy.visibility === "private")));
  const storage = (id: string) => requireRule(source.snapshot.storages.some(
    (row) => row.id === id && row.campaign_id === cid &&
      (row.entity_id === null || controlled.has(row.entity_id))));
  const location = (id: string) => requireRule(source.snapshot.locations.some(
    (row) => row.id === id && row.campaign_id === cid &&
      ["known", "visited"].includes(row.status)));
  const rest = (id: string) => requireRule(generatedRests.has(id) ||
    source.runtime.restRecords.some((row) => row.id === id && row.campaign_id === cid));
  if (intent.restSafety !== null) {
    requireRule(intent.restSafety && typeof intent.restSafety === "object" &&
      ownFields(intent.restSafety, ["locationId", "suitable"]) &&
      typeof intent.restSafety.suitable === "boolean" &&
      intent.restSafety.locationId === source.snapshot.publicState.current_location_id);
    location(intent.restSafety.locationId);
  }
  if (intent.kind === "formal_rest") {
    requireRule(ownFields(intent, ["kind", "restKind", "restSafety"]) &&
      ["short", "long"].includes(intent.restKind));
    return;
  }
  requireRule(ownFields(intent, ["kind", "actions", "restSafety"]) &&
    Array.isArray(intent.actions) && intent.actions.length > 0 &&
    intent.actions.length <= 6);
  requireRule(intent.restSafety === null || intent.actions.some((action) =>
    ["rest.enter", "rest.leave", "rest.complete"].includes(action.kind)));
  for (const [index, action] of intent.actions.entries()) {
    validateMechanicChoice(action);
    switch (action.kind) {
      case "resource.spend": actor(action.entityId); break;
      case "item.consume": case "item.equip":
        actor(action.actorId); item(action.itemId); break;
      case "item.transfer":
        actor(action.actorId); item(action.itemId); storage(action.destinationStorageId);
        generatedItems.add(stableGameplayId(input.operationId, `split:${index}`)); break;
      case "quest.transition":
        requireRule(source.snapshot.quests.some((row) => row.id === action.questId &&
          row.campaign_id === cid)); break;
      case "location.move":
        location(action.locationId);
        requireRule(!source.worldTakeover ||
          source.worldTakeover.routeLocationIds.includes(action.locationId)); break;
      case "rest.enter":
        requireRule(Array.isArray(action.participantIds));
        action.participantIds.forEach((id) => actor(id));
        generatedRests.add(stableGameplayId(input.operationId, `rest:${index}`)); break;
      case "rest.leave": rest(action.restId); break;
      case "rest.complete":
        rest(action.restId); requireRule(Array.isArray(action.supplies));
        action.supplies.forEach((part) => item(part.itemId)); break;
      case "recipe.prepare":
        actor(action.actorId); storage(action.outputStorageId);
        requireRule(Array.isArray(action.ingredients));
        action.ingredients.forEach((part) => item(part.itemId));
        generatedItems.add(stableGameplayId(input.operationId, `prepared:${index}`)); break;
      case "recipe.serve":
        actor(action.actorId); item(action.itemId);
        requireRule(Array.isArray(action.recipientIds));
        action.recipientIds.forEach((id) => actor(id)); break;
      // Unsupported check-bearing actions still undergo reference checks.
      case "item.transform":
        actor(action.actorId); storage(action.outputStorageId);
        requireRule(Array.isArray(action.inputs) && Array.isArray(action.toolIds));
        action.inputs.forEach((part) => item(part.itemId));
        action.toolIds.forEach(item); break;
      case "forage": actor(action.actorId); storage(action.outputStorageId); break;
      case "encounter.start":
        requireRule(Array.isArray(action.participantIds));
        action.participantIds.forEach((id) => actor(id, false)); break;
      case "encounter.action":
        actor(action.actorId, false);
        if (action.targetId !== null) actor(action.targetId, false);
        if (action.itemId !== null) item(action.itemId); break;
      case "encounter.end": break;
    }
  }
}

function restParticipants(source: RuntimeSource): string[] {
  const config = source.runtime.configuration;
  const present = new Set(source.worldTakeover?.presentEntityIds ??
    config?.presentEntityIds ?? []);
  return (config?.controlledEntityIds ?? []).filter((id) => present.has(id) &&
    config?.presentEntityIds.includes(id) && source.snapshot.entities.some((row) =>
      row.id === id && row.campaign_id === source.snapshot.campaign.id &&
      ["player", "companion"].includes(row.kind) &&
      !row.conditions.includes("dead") && !row.conditions.includes("withdrawn")));
}

/** Public affordances only; the intent still undergoes authoritative validation. */
export function mechanicsAuthoringCapabilities(source: RuntimeSource): JsonObject | null {
  const config = source.runtime.configuration;
  if (!config) return null;
  const cid = source.snapshot.campaign.id;
  const actors = restParticipants(source);
  const storages = source.snapshot.storages.filter((row) => row.campaign_id === cid &&
    (row.entity_id === null || config.controlledEntityIds.includes(row.entity_id)));
  const items = source.snapshot.items.filter((row) => row.campaign_id === cid &&
    row.quantity > 0 && (row.owner_entity_id === null ||
      config.controlledEntityIds.includes(row.owner_entity_id)) &&
    !source.astraSettlementItemPolicies?.some((policy) =>
      policy.itemId === row.id && policy.visibility === "private"));
  const locations = source.snapshot.locations.filter((row) => row.campaign_id === cid &&
    ["known", "visited"].includes(row.status));
  return { supportedActions: [...astraMechanicActionKinds], actorIds: actors,
    itemIds: items.map((row) => row.id), storageIds: storages.map((row) => row.id),
    questIds: source.snapshot.quests.filter((row) => row.campaign_id === cid)
      .map((row) => row.id),
    locationIds: locations.filter((row) => !source.worldTakeover ||
      source.worldTakeover.routeLocationIds.includes(row.id)).map((row) => row.id),
    restIds: source.runtime.restRecords.filter((row) => row.campaign_id === cid &&
      row.status === "planned").map((row) => row.id),
    currentRest: source.runtime.restRecords.filter((row) => row.campaign_id === cid &&
      row.status === "planned").map((row) => ({ id: row.id, kind: row.kind })),
    currentRestLocationId: locations.find((row) =>
      row.id === source.snapshot.publicState.current_location_id)?.id ?? null,
    limits: { actions: 6, fullRestKinds: ["short", "long"] } };
}

function restSupplies(source: RuntimeSource, restKind: "short" | "long",
  participantCount: number, settingsRevision: number): ItemQuantity[] {
  const config = source.runtime.configuration;
  requireRule(config);
  const settings = source.snapshot.settings.revision === settingsRevision
    ? source.snapshot.settings.values
    : source.snapshot.settingsHistory.find((row) =>
        row.campaign_id === source.snapshot.campaign.id &&
        row.revision === settingsRevision)?.values;
  requireRule(settings);
  let needed = settings.difficulty[restKind === "long"
    ? "longRestSupplyCost" : "shortRestSupplyCost"] * participantCount;
  requireRule(Number.isSafeInteger(needed) && needed >= 0);
  const eligible = (row: Item) => row.campaign_id === source.snapshot.campaign.id &&
    row.quantity > 0 && (row.owner_entity_id === null ||
      config.controlledEntityIds.includes(row.owner_entity_id)) &&
    !source.astraSettlementItemPolicies?.some((policy) =>
      policy.itemId === row.id && policy.visibility === "private") &&
    isRestProvision(row, config.itemRules) &&
    source.snapshot.storages.some((storage) => storage.id === row.storage_id &&
      storage.campaign_id === source.snapshot.campaign.id &&
      (storage.kind === "camp" ? restKind === "long" :
        storage.kind === "transport" ? config.nearbyStorageIds.includes(storage.id) :
          storage.entity_id !== null &&
          config.controlledEntityIds.includes(storage.entity_id) &&
          config.presentEntityIds.includes(storage.entity_id)));
  const supplies: ItemQuantity[] = [];
  for (const row of source.snapshot.items.filter(eligible).sort((a, b) =>
    a.id.localeCompare(b.id))) {
    if (needed === 0) break;
    const quantity = Math.min(needed, row.quantity);
    supplies.push({ itemId: row.id, quantity });
    needed -= quantity;
  }
  if (needed > 0) throw new AstraMechanicsObstruction("insufficient_supplies");
  return supplies;
}

/** Adjudication is limited to the current known Location and this operation.
 * The temporary permission exists only on the resolver clone. */
export function planAstraMechanics(source: RuntimeSource, input: TurnInput,
  intent: AstraMechanicsIntent): AstraMechanicsPlan {
  assertAstraMechanicsScope(source, input, intent);
  if (!source.runtime.configuration)
    throw new AstraMechanicsObstruction("mechanics_unavailable");
  const originalSafety = [...source.runtime.configuration.safeLocationIds];
  const resolverSource = structuredClone(source);
  const config = resolverSource.runtime.configuration!;
  const safety: AstraRestSafetyPin | null = intent.restSafety === null ? null : {
    campaignId: input.campaignId, operationId: input.operationId,
    timeline: input.timeline ? structuredClone(input.timeline) : null,
    ...intent.restSafety,
  };
  if (safety) {
    config.safeLocationIds = config.safeLocationIds.filter((id) => id !== safety.locationId);
    if (safety.suitable) config.safeLocationIds.push(safety.locationId);
  }
  let actions: MechanicChoice[];
  if (intent.kind === "formal_rest") {
    if (source.runtime.encounters.some((row) =>
      row.campaign_id === input.campaignId && row.status === "active"))
      throw new AstraMechanicsObstruction("active_encounter");
    if (!config.safeLocationIds.includes(source.snapshot.publicState.current_location_id ?? ""))
      throw new AstraMechanicsObstruction("unsafe_rest");
    const current = source.runtime.restRecords.find((row) =>
      row.campaign_id === input.campaignId && row.status === "planned");
    if (current && current.kind !== intent.restKind)
      throw new AstraMechanicsObstruction("rest_kind_mismatch");
    const participants = current?.public_outcome.participantIds ?? restParticipants(source);
    requireRule(Array.isArray(participants) && participants.length > 0 &&
      participants.every((id) => typeof id === "string"));
    const supplies = restSupplies(source, intent.restKind, participants.length,
      current?.settings_revision ?? source.snapshot.settings.revision);
    actions = current ? [] : [{ kind: "rest.enter", restKind: intent.restKind,
      participantIds: participants as string[] }];
    actions.push({ kind: "rest.complete", restId: current?.id ??
      stableGameplayId(input.operationId, "rest:0"), supplies });
  } else {
    actions = structuredClone(intent.actions);
  }
  if (actions.some((action) => !astraMechanicActionKinds.some((kind) => kind === action.kind)))
    throw new AstraMechanicsObstruction("check_required");
  for (const action of actions) {
    if (action.kind === "rest.complete" && source.runtime.restRecords.some((row) =>
      row.id === action.restId && row.status === "interrupted"))
      throw new AstraMechanicsObstruction("interrupted_rest");
    if (["rest.enter", "rest.complete"].includes(action.kind)) {
      if (source.runtime.encounters.some((row) =>
        row.campaign_id === input.campaignId && row.status === "active"))
        throw new AstraMechanicsObstruction("active_encounter");
      if (!config.safeLocationIds.includes(source.snapshot.publicState.current_location_id ?? ""))
        throw new AstraMechanicsObstruction("unsafe_rest");
    }
  }
  const plan = mechanicPlanForActions(resolverSource, input, actions, 6);
  requireRule(plan.checks.length === 0);
  validatePlan(resolverSource, input, plan);
  const resolution = resolveMechanics(resolverSource, input, plan, []);
  // Local action indexes are the existing resolver's ID contract. A second
  // effect in this operation may update a prior output, but cannot create it
  // again. Existing unversioned effect/rest updates remain legitimate.
  const creations = new Set<string>();
  for (const [index, action] of actions.entries()) {
    const key = (family: string, suffix: string) =>
      creations.add(`${family}:${stableGameplayId(input.operationId, suffix)}`);
    if (action.kind === "rest.enter") key("rest_records", `rest:${index}`);
    if (action.kind === "item.transfer") {
      key("items", `split:${index}`); key("provenance", `provenance:${index}`);
    }
    if (action.kind === "recipe.prepare") {
      key("items", `prepared:${index}`); key("provenance", `provenance:${index}`);
    }
    if (action.kind === "recipe.serve")
      for (const id of action.recipientIds) key("effects", `effect:${index}:${id}`);
  }
  const originalRows: Record<string, { id: string }[]> = {
    items: source.snapshot.items, rest_records: source.runtime.restRecords,
    effects: source.runtime.effects, provenance: source.runtime.provenance,
  };
  for (const change of resolution.changes)
    if (change.expectedRevision === null && creations.has(`${change.family}:${change.id}`))
      requireRule(!originalRows[change.family]?.some((row) => row.id === change.id));
  // Preserve deterministic recipe/split rules while discarding the temporary
  // safety permission. The owner configuration is never rewritten by the DM.
  requireRule(resolution.configuration);
  resolution.configuration.safeLocationIds = originalSafety;
  if (source.worldTakeover && resolution.changes.some((change) =>
    change.family === "public_state" && change.values.current_location_id !==
      source.snapshot.publicState.current_location_id)) {
    resolution.configuration.presentEntityIds = resolution.configuration.presentEntityIds.filter((id) =>
      resolution.configuration!.controlledEntityIds.includes(id) ||
      source.snapshot.entities.some((row) => row.id === id &&
        row.campaign_id === input.campaignId && row.kind === "companion"));
    resolution.configuration.nearbyStorageIds = [];
  }
  const completed = actions.findLast((action) => action.kind === "rest.complete");
  const entered = actions.findIndex((action) => action.kind === "rest.enter");
  const left = actions.findLast((action) => action.kind === "rest.leave");
  return { schemaVersion: 1, kind: intent.kind, intent: structuredClone(intent),
    actions, resolution, safety, publicOutcome: { kind: intent.kind,
      completedRest: completed !== undefined,
      restId: completed?.restId ?? left?.restId ?? (entered < 0 ? null :
        stableGameplayId(input.operationId, `rest:${entered}`)) } };
}
