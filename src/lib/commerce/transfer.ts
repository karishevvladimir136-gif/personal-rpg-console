import type { ItemPolicy, LoopContext } from "../foundation-loop/contracts.ts";
import type { RecordChange } from "../gameplay/server-contracts.ts";
import type { FoundationCommand } from "../production/contracts.ts";
import { stableGameplayId } from "../gameplay/dice.ts";
import { settledItemTransfer } from "../progression/settlement-core.ts";
import {
  isLive,
  ownedItem,
  publicActor,
  validateCommerceContext,
  validateCommerceFence,
} from "./context.ts";
import {
  COMMERCE_LIMITS,
  integer,
  object,
  requireCommerce,
  uuid,
} from "./validation.ts";

export type ItemTransferInput = {
  itemId: string;
  quantity: number;
  sourceEntityId: string;
  destinationEntityId: string;
  destinationStorageId: string;
};
export type ItemTransferPlan = {
  changes: RecordChange[];
  transferredItemId: string;
  itemPolicy: ItemPolicy;
  split: boolean;
};

/** Shared mechanics only, not an authorization boundary. The trade authority or
 * normal Game action resolver must establish consent/action/check eligibility
 * before committing this plan. There is deliberately no "theft" API or bypass.
 * A resolved Game theft may mark the returned transferred policy stolen; the
 * untransferred part of a stack keeps its original policy. */
export function validatedItemTransfer(
  context: LoopContext,
  command: FoundationCommand,
  input: ItemTransferInput,
): ItemTransferPlan {
  validateCommerceContext(context);
  validateCommerceFence(context, command);
  return itemTransferChanges(context, command, input);
}

export function itemTransferChanges(
  context: LoopContext,
  command: FoundationCommand,
  input: ItemTransferInput,
): ItemTransferPlan {
  const v = object(input, [
    "itemId",
    "quantity",
    "sourceEntityId",
    "destinationEntityId",
    "destinationStorageId",
  ]);
  const itemId = uuid(v.itemId),
    sourceEntityId = uuid(v.sourceEntityId),
    destinationEntityId = uuid(v.destinationEntityId);
  const destinationStorageId = uuid(v.destinationStorageId),
    quantity = integer(v.quantity, 1, COMMERCE_LIMITS.quantity);
  const source = publicActor(context, sourceEntityId),
    destination = publicActor(context, destinationEntityId);
  requireCommerce(
    source.actor.control === "player" || destination.actor.control === "player",
    "unavailable",
  );
  requireCommerce(
    isLive(source.entity) && isLive(destination.entity),
    "unavailable",
  );
  requireCommerce(
    source.actor.locationId !== null &&
      source.actor.locationId === destination.actor.locationId &&
      source.actor.locationId ===
        context.snapshot.publicState.current_location_id,
    "unavailable",
  );
  const item = ownedItem(context, itemId, sourceEntityId);
  const policy = context.state.itemPolicies.find((p) => p.itemId === itemId);
  requireCommerce(
    policy && policy.visibility === "public" && policy.trade === "allowed",
    "unavailable",
  );
  requireCommerce(
    item.quantity >= quantity &&
      item.equipped_entity_id === null &&
      item.equipped_slot === null,
    "unavailable",
  );
  const storage = context.snapshot.storages.find(
    (s) => s.id === destinationStorageId,
  );
  requireCommerce(
    storage &&
      storage.entity_id === destinationEntityId &&
      storage.id !== item.storage_id,
    "unavailable",
  );
  const transferredItemId = stableGameplayId(
    command.operationId,
    `commerce:transfer:${item.id}:${destinationEntityId}:${destinationStorageId}`,
  );
  if (item.quantity > quantity) requireCommerce(
    !context.snapshot.items.some((i) => i.id === transferredItemId) &&
      !context.state.itemPolicies.some((p) => p.itemId === transferredItemId),
    "conflict",
  );
  const settled = settledItemTransfer(item, quantity, destinationEntityId,
    destinationStorageId, transferredItemId);
  return { ...settled,
    itemPolicy: settled.split
      ? { ...policy, itemId: settled.transferredItemId, version: 1 }
      : structuredClone(policy) };
}
