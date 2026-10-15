import type { Storage } from "../persistence/contracts.ts";
import type { JsonObject, MechanicChoice, TurnInput } from "./contracts.ts";
import type { MechanicsResolution, RecordChange, RuntimeSource } from "./server-contracts.ts";
import type { AstraMechanicsIntent, AstraMechanicsPlan } from "./astra-mechanics.ts";
import { stableGameplayId } from "./dice.ts";
import { requireRule } from "./turn-errors.ts";
import { requireSourceTimeline } from "./timeline.ts";
import { settledItemTransfer } from "../progression/settlement-core.ts";
import { mechanicPlanForActions, resolveMechanics, validateMechanicChoice,
  validatePlan } from "./mechanics/resolve.ts";
import { naturalLocaleKey } from "./astra-natural-promotion.ts";

export type NaturalEffectIntent =
  | { kind: "item_relocate"; actorId: string; itemId: string; quantity: number;
      destinationEntityId: string | null }
  | { kind: "companion_join"; entityId: string };
export type NaturalEffectPlan = { schemaVersion: 1; kind: NaturalEffectIntent["kind"];
  intent: NaturalEffectIntent; resolution: MechanicsResolution; publicOutcome: JsonObject };

export function isNaturalEffectIntent(value: { kind: string }): value is NaturalEffectIntent {
  return value.kind === "item_relocate" || value.kind === "companion_join";
}
export function isNaturalEncounterIntent(value: { kind: string }): value is Extract<AstraMechanicsIntent, { kind: "mechanic_actions" }> {
  if (value.kind !== "mechanic_actions") return false;
  const actions = (value as { actions?: unknown }).actions;
  return Array.isArray(actions) && actions.length > 0 && actions.every((action) =>
    action && typeof action === "object" && ["encounter.start", "encounter.end"].includes(action.kind));
}

function authority(source: RuntimeSource, input: TurnInput) {
  requireRule(source.astraNaturalContract === "natural-v1" &&
    source.snapshot.campaign.id === input.campaignId && source.runtime.campaignId === input.campaignId &&
    source.runtime.revision === input.expectedRevision && input.mode === "game" && source.worldTakeover &&
    source.runtime.configuration?.controlledEntityIds.length === 1);
  requireRule(source.snapshot.entities.some((row) => row.campaign_id === input.campaignId &&
    row.id === source.runtime.configuration!.controlledEntityIds[0] && row.kind === "player"));
  requireSourceTimeline(source, input.timeline);
  return source.runtime.configuration!;
}
const exact = (value: object, keys: string[]) => Object.keys(value).length === keys.length &&
  Object.keys(value).every((key) => keys.includes(key));

/** Reference integrity is checked outside optional-effect recovery. A foreign
 * actor/item cannot be converted into harmless successful fiction. */
export function assertNaturalEffectScope(source: RuntimeSource, input: TurnInput,
  intent: NaturalEffectIntent) {
  const config = authority(source, input);
  requireRule(intent && typeof intent === "object" && isNaturalEffectIntent(intent));
  const present = (id: string) => source.snapshot.entities.find((row) => row.id === id &&
    row.campaign_id === input.campaignId && config.presentEntityIds.includes(id));
  if (intent.kind === "companion_join") {
    requireRule(exact(intent, ["kind", "entityId"]));
    const target = present(intent.entityId);
    requireRule(target && ["npc", "companion"].includes(target.kind) &&
      !config.controlledEntityIds.includes(target.id));
  } else {
    requireRule(exact(intent, ["kind", "actorId", "itemId", "quantity", "destinationEntityId"]) &&
      intent.actorId === config.controlledEntityIds[0] && present(intent.actorId) &&
      source.snapshot.items.some((row) => row.id === intent.itemId && row.campaign_id === input.campaignId) &&
      (intent.destinationEntityId === null || present(intent.destinationEntityId)));
    if (intent.destinationEntityId !== null) {
      const target = present(intent.destinationEntityId)!;
      requireRule(target.kind !== "player" || config.controlledEntityIds.includes(target.id));
    }
  }
}

function carriedStorage(source: RuntimeSource, entityId: string): Storage | null {
  const actor = source.snapshot.entities.find((row) => row.id === entityId)!;
  const kind = actor.kind === "player" ? "player" : actor.kind === "companion" ? "companion" : "merchant";
  return source.snapshot.storages.filter((row) => row.campaign_id === source.snapshot.campaign.id &&
    row.entity_id === entityId && row.kind === kind).sort((a, b) => a.id.localeCompare(b.id))[0] ?? null;
}

export function planNaturalEffect(source: RuntimeSource, input: TurnInput,
  intent: NaturalEffectIntent, effectIndex: number): NaturalEffectPlan {
  assertNaturalEffectScope(source, input, intent);
  requireRule(Number.isInteger(effectIndex) && effectIndex >= 0 && effectIndex < 6);
  // These ordinary possession/party adapters have no encounter action budget.
  // End combat through its existing authority before changing either here.
  requireRule(!source.runtime.encounters.some((row) => row.campaign_id === input.campaignId && row.status === "active"));
  const config = structuredClone(source.runtime.configuration!);
  const changes: RecordChange[] = [];
  let publicOutcome: JsonObject;
  if (intent.kind === "companion_join") {
    const actor = source.snapshot.entities.find((row) => row.id === intent.entityId)!;
    let storage = carriedStorage(source, actor.id);
    if (actor.kind === "npc") {
      changes.push({ family: "entities", id: actor.id, expectedRevision: actor.revision,
        values: { kind: "companion" } });
      if (storage) changes.push({ family: "storages", id: storage.id,
        expectedRevision: storage.revision, values: { kind: "companion" } });
    }
    if (!storage) {
      const id = stableGameplayId(input.operationId, `natural:actor-storage:${actor.id}`);
      requireRule(!source.snapshot.storages.some((row) => row.id === id));
      changes.push({ family: "storages", id, expectedRevision: null,
        values: { name: `Inventory of ${actor.name}`.slice(0, 160), kind: "companion", entity_id: actor.id } });
      storage = { id } as Storage;
    }
    publicOutcome = { kind: intent.kind, entityId: actor.id, storageId: storage.id, joined: true };
  } else {
    const item = source.snapshot.items.find((row) => row.id === intent.itemId)!;
    const currentLocation = source.snapshot.publicState.current_location_id;
    requireRule(currentLocation && source.snapshot.locations.some((row) => row.id === currentLocation &&
      row.campaign_id === input.campaignId && ["known", "visited"].includes(row.status)) &&
      Number.isSafeInteger(intent.quantity) && intent.quantity >= 1 && intent.quantity <= 20 &&
      intent.quantity <= item.quantity && item.equipped_entity_id === null && item.equipped_slot === null &&
      !source.astraSettlementItemPolicies?.some((policy) => policy.itemId === item.id && policy.visibility === "private"));
    const locale = naturalLocaleKey(source);
    const stored = source.snapshot.storages.find((row) => row.id === item.storage_id && row.campaign_id === input.campaignId);
    requireRule(stored);
    const ground = stored as Storage & { location_id?: string | null; locale_key?: string | null };
    const fromGround = String(stored.kind) === "ground" && stored.entity_id === null &&
      ground.location_id === currentLocation && (ground.locale_key ?? null) === locale && item.owner_entity_id === null;
    requireRule(fromGround || item.owner_entity_id === intent.actorId && stored.entity_id === intent.actorId &&
      ["player", "companion"].includes(stored.kind));
    let storageId: string;
    if (intent.destinationEntityId === null) {
      requireRule(!fromGround);
      storageId = stableGameplayId(input.campaignId, `natural:ground:${currentLocation}:${locale ?? ""}`);
      const destination = source.snapshot.storages.find((row) => row.id === storageId);
      if (destination) {
        const anchor = destination as Storage & { location_id?: string | null; locale_key?: string | null };
        requireRule(destination.campaign_id === input.campaignId && String(destination.kind) === "ground" &&
          destination.entity_id === null && anchor.location_id === currentLocation && (anchor.locale_key ?? null) === locale);
      } else changes.push({ family: "storages", id: storageId, expectedRevision: null,
        values: { name: "Ground", kind: "ground", entity_id: null, location_id: currentLocation, locale_key: locale } });
    } else {
      const destination = source.snapshot.entities.find((row) => row.id === intent.destinationEntityId)!;
      const existing = carriedStorage(source, destination.id);
      storageId = existing?.id ?? stableGameplayId(input.operationId, `natural:actor-storage:${destination.id}`);
      if (!existing) {
        requireRule(!source.snapshot.storages.some((row) => row.id === storageId));
        changes.push({ family: "storages", id: storageId, expectedRevision: null,
          values: { name: `Inventory of ${destination.name}`.slice(0, 160),
            kind: destination.kind === "player" ? "player" : destination.kind === "companion" ? "companion" : "merchant",
            entity_id: destination.id } });
      }
    }
    const splitId = stableGameplayId(input.operationId, `natural:item-relocate:${effectIndex}:${item.id}`);
    if (intent.quantity < item.quantity) requireRule(!source.snapshot.items.some((row) => row.id === splitId));
    const moved = settledItemTransfer(item, intent.quantity, intent.destinationEntityId, storageId, splitId);
    changes.push(...moved.changes);
    publicOutcome = { kind: intent.kind, itemId: moved.transferredItemId, quantity: intent.quantity,
      destinationEntityId: intent.destinationEntityId, storageId };
  }
  return { schemaVersion: 1, kind: intent.kind, intent: structuredClone(intent),
    resolution: { changes, worldMinutes: source.runtime.worldMinutes, configuration: config,
      outcomes: [{ kind: intent.kind, text: intent.kind === "companion_join"
        ? "The present NPC joined the party; no hidden relationship history was added."
        : "The recorded Item changed possession or ground placement without creating any new powers.",
      entityIds: intent.kind === "companion_join" ? [intent.entityId] : [intent.actorId, ...(intent.destinationEntityId ? [intent.destinationEntityId] : [])],
      itemIds: intent.kind === "item_relocate" ? [String(publicOutcome.itemId)] : [] }] }, publicOutcome };
}

/** Encounter setup/end reuse the accepted resolver. Participant order is
 * canonical server authority, never model initiative or an arbitrary turn list. */
export function planNaturalEncounter(source: RuntimeSource, input: TurnInput,
  intent: Extract<AstraMechanicsIntent, { kind: "mechanic_actions" }>): AstraMechanicsPlan {
  const config = authority(source, input);
  requireRule(isNaturalEncounterIntent(intent) && exact(intent, ["kind", "actions", "restSafety"]) &&
    intent.restSafety === null && intent.actions.length <= 6);
  const hero = config.controlledEntityIds[0];
  const actions: MechanicChoice[] = intent.actions.map((action) => {
    validateMechanicChoice(action);
    if (action.kind !== "encounter.start") return structuredClone(action);
    requireRule(new Set(action.participantIds).size === action.participantIds.length &&
      action.participantIds.length >= 2 && action.participantIds.length <= 8 && action.participantIds.includes(hero));
    for (const id of action.participantIds) requireRule(config.presentEntityIds.includes(id) &&
      source.snapshot.entities.some((row) => row.id === id && row.campaign_id === input.campaignId));
    return { kind: "encounter.start", participantIds: [hero, ...action.participantIds.filter((id) => id !== hero).sort()] };
  });
  const normalized = { ...intent, actions };
  // The shared ordered shadow gives new records a temporary revision even for
  // unversioned families. The existing encounter store has no such revision.
  const resolverSource = structuredClone(source);
  for (const row of [...resolverSource.runtime.encounters, ...resolverSource.runtime.participants])
    delete (row as unknown as { revision?: number }).revision;
  const plan = mechanicPlanForActions(resolverSource, input, actions, 6);
  requireRule(plan.checks.length === 0);
  validatePlan(resolverSource, input, plan);
  const resolution = resolveMechanics(resolverSource, input, plan, []);
  // Existing unversioned encounter rows still have server-generated identities.
  // A later ordered effect cannot reuse the same local start index to create a
  // second encounter or replace participants from this operation.
  for (const [index, action] of actions.entries()) if (action.kind === "encounter.start") {
    requireRule(!source.runtime.encounters.some((row) => row.id ===
      stableGameplayId(input.operationId, `encounter:${index}`)));
    for (const id of action.participantIds) requireRule(!source.runtime.participants.some((row) =>
      row.id === stableGameplayId(input.operationId, `participant:${index}:${id}`)));
  }
  return { schemaVersion: 1, kind: "mechanic_actions", intent: normalized, actions,
    resolution, safety: null, publicOutcome: { kind: "mechanic_actions", completedRest: false, restId: null } };
}
