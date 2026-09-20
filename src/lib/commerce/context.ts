import { isDeepStrictEqual } from "node:util";
import type {
  LoopContext,
  MerchantDefinition,
} from "../foundation-loop/contracts.ts";
import type { Entity, Item, Storage } from "../persistence/contracts.ts";
import type { FoundationCommand } from "../production/contracts.ts";
import type { WorldActor } from "../world/contracts.ts";
import { parseWorldState } from "../world/validation.ts";
import { isTimelineFence, sameTimeline } from "../saves/fence.ts";
import {
  COMMERCE_LIMITS,
  CommerceValidationError,
  integer,
  parseCommerceCommand,
  parseCommerceDefinitions,
  profile,
  requireCommerce,
  unique,
  uuid,
} from "./validation.ts";

/** Internal authority checks. Callers must load this context from the server. */
export function validateCommerceContext(context: LoopContext): void {
  const { foundation, state, snapshot, world } = context;
  uuid(foundation.campaignId);
  uuid(foundation.ownerId);
  requireCommerce(
    foundation.schemaVersion === 1 && isTimelineFence(foundation.timeline),
  );
  integer(foundation.revision);
  integer(foundation.runtimeRevision);
  integer(foundation.worldMinutes);
  if (foundation.headId !== null) uuid(foundation.headId);
  requireCommerce(
    snapshot.campaign.id === foundation.campaignId &&
      snapshot.campaign.campaign_id === foundation.campaignId,
    "scope",
  );
  if (snapshot.timeline)
    requireCommerce(
      sameTimeline(snapshot.timeline, foundation.timeline),
      "conflict",
    );
  requireCommerce(state.schemaVersion === 1);
  integer(state.version);
  requireCommerce(
    isDeepStrictEqual(profile(state.profile), profile(foundation.ruleset)),
    "configuration",
  );
  requireCommerce(world.campaignId === foundation.campaignId, "scope");
  try {
    parseWorldState(world, foundation.campaignId);
  } catch {
    throw new CommerceValidationError("configuration");
  }
  requireCommerce(
    isDeepStrictEqual(foundation.world, world) ||
      (foundation.world === null &&
        world.actors.length === 0 &&
        world.threads.length === 0 &&
        world.hooks.length === 0 &&
        world.warnings.length === 0),
    "conflict",
  );
  const definitions = parseCommerceDefinitions({
    currencies: state.currencies,
    itemPolicies: state.itemPolicies,
    merchants: state.merchants,
  });
  for (const rows of [
    snapshot.entities,
    snapshot.storages,
    snapshot.items,
    snapshot.locations,
  ]) {
    requireCommerce(Array.isArray(rows));
    unique(
      rows.map((row) => row.id),
      (id) => id,
    );
    for (const row of rows) {
      uuid(row.id);
      integer(row.revision, 1);
      requireCommerce(row.campaign_id === foundation.campaignId, "scope");
    }
  }
  requireCommerce(
    snapshot.publicState.campaign_id === foundation.campaignId,
    "scope",
  );
  for (const item of snapshot.items) {
    integer(item.quantity, 0, COMMERCE_LIMITS.quantity);
    uuid(item.storage_id);
    if (item.owner_entity_id !== null) uuid(item.owner_entity_id);
    if (item.equipped_entity_id !== null) uuid(item.equipped_entity_id);
    requireCommerce(
      (item.equipped_entity_id === null) === (item.equipped_slot === null),
    );
    requireCommerce(
      snapshot.storages.some((s) => s.id === item.storage_id),
      "configuration",
    );
  }
  requireCommerce(
    definitions.itemPolicies.every((p) =>
      snapshot.items.some((i) => i.id === p.itemId),
    ),
    "configuration",
  );
  requireCommerce(Array.isArray(context.events));
  for (const event of context.events) {
    requireCommerce(event.campaignId === foundation.campaignId, "scope");
  }
}

export function validateCommerceFence(
  context: LoopContext,
  value: unknown,
): FoundationCommand {
  const command = parseCommerceCommand(value);
  const f = context.foundation;
  requireCommerce(command.campaignId === f.campaignId, "scope");
  requireCommerce(
    sameTimeline(command.timeline, f.timeline) &&
      command.expectedRevision === f.revision &&
      command.expectedRuntimeRevision === f.runtimeRevision &&
      command.expectedHeadId === f.headId,
    "conflict",
  );
  // The service returns the already committed result for an exact retry before
  // invoking a planner. A planner must never emit a second mutation for it.
  requireCommerce(
    !context.events.some((event) => event.operationId === command.operationId),
    "conflict",
  );
  return command;
}

export function isLive(entity: Entity): boolean {
  return (
    (entity.hp === null || (Number.isFinite(entity.hp) && entity.hp > 0)) &&
    !entity.conditions.some((condition) =>
      ["dead", "unconscious", "incapacitated"].includes(condition),
    )
  );
}

export function publicActor(
  context: LoopContext,
  entityId: string,
): { actor: WorldActor; entity: Entity } {
  const actor = context.world.actors.find(
    (a) => a.id === entityId && a.entityId === entityId && a.kind === "entity",
  );
  const entity = context.snapshot.entities.find((e) => e.id === entityId);
  requireCommerce(actor && entity && actor.publicName !== null, "unavailable");
  return { actor, entity };
}

export function playerAuthority(
  context: LoopContext,
  entityId: string,
): { actor: WorldActor; entity: Entity; storage: Storage } {
  uuid(entityId);
  const result = publicActor(context, entityId);
  requireCommerce(
    result.actor.control === "player" &&
      ["player", "companion"].includes(result.entity.kind),
    "unavailable",
  );
  requireCommerce(isLive(result.entity), "unavailable");
  const storages = context.snapshot.storages
    .filter((s) => s.entity_id === entityId && s.kind === result.entity.kind)
    .sort((a, b) => a.id.localeCompare(b.id));
  requireCommerce(storages.length > 0, "unavailable");
  return { ...result, storage: storages[0] };
}

export function merchantStorage(
  context: LoopContext,
  merchant: MerchantDefinition,
): Storage {
  const storage = context.snapshot.storages.find(
    (s) => s.id === merchant.storageId,
  );
  requireCommerce(
    storage && storage.entity_id === merchant.entityId,
    "configuration",
  );
  return storage;
}

export function merchantAuthority(
  context: LoopContext,
  merchantActorId: string,
  playerEntityId: string,
) {
  const merchant = context.state.merchants.find(
    (m) => m.actorId === merchantActorId,
  );
  requireCommerce(merchant, "unavailable");
  const player = playerAuthority(context, playerEntityId);
  const other = publicActor(context, merchant.entityId);
  requireCommerce(
    other.actor.id === merchant.actorId &&
      other.actor.control === "autonomous" &&
      other.entity.id !== player.entity.id,
    "unavailable",
  );
  requireCommerce(merchant.available && isLive(other.entity), "unavailable");
  requireCommerce(
    player.actor.locationId !== null &&
      other.actor.locationId === player.actor.locationId &&
      context.snapshot.locations.some(
        (l) => l.id === player.actor.locationId,
      ) &&
      context.snapshot.publicState.current_location_id ===
        player.actor.locationId,
    "unavailable",
  );
  return {
    merchant,
    player,
    actor: other.actor,
    entity: other.entity,
    storage: merchantStorage(context, merchant),
  };
}

export function ownedItem(
  context: LoopContext,
  itemId: string,
  entityId: string,
  storageId?: string,
): Item {
  const item = context.snapshot.items.find((i) => i.id === itemId);
  requireCommerce(item && item.owner_entity_id === entityId, "unavailable");
  const storage = context.snapshot.storages.find(
    (s) => s.id === item.storage_id,
  );
  requireCommerce(
    storage &&
      storage.entity_id === entityId &&
      (!storageId || item.storage_id === storageId),
    "unavailable",
  );
  return item;
}

export function currencyBalance(entity: Entity, resourceKey: string): number {
  const resources = entity.resources;
  requireCommerce(
    resources && typeof resources === "object" && !Array.isArray(resources),
    "configuration",
  );
  requireCommerce(
    Object.getPrototypeOf(resources) === Object.prototype ||
      Object.getPrototypeOf(resources) === null,
    "configuration",
  );
  // A defined currency with no resource entry has an explicit zero balance.
  // No other named resource is ever treated as currency implicitly.
  return Object.hasOwn(resources, resourceKey)
    ? integer(resources[resourceKey], 0, COMMERCE_LIMITS.balance)
    : 0;
}
