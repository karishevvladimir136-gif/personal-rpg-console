import { requireProgression, MAX_RESOURCE } from "./validation.ts";
import type { Item } from "../persistence/contracts.ts";
import type { RecordChange } from "../gameplay/server-contracts.ts";

/** Shared arithmetic for authored Foundation rewards and bounded live rewards.
 * This is pure arithmetic; the caller still owns source and recipient authority. */
export function settledCurrencyBalance(before: number, delta: number): number {
  requireProgression(Number.isSafeInteger(before) && before >= 0 &&
    Number.isSafeInteger(delta));
  const after = before + delta;
  requireProgression(Number.isSafeInteger(after) && after >= 0 && after <= MAX_RESOURCE);
  return after;
}

/** Shared deterministic item movement for commerce and runtime settlement.
 * Callers establish consent, presence, item policy, and destination authority. */
export function settledItemTransfer(item: Item, quantity: number,
  destinationEntityId: string, destinationStorageId: string,
  splitItemId: string): { changes: RecordChange[]; transferredItemId: string; split: boolean } {
  requireProgression(Number.isSafeInteger(quantity) && quantity >= 1 &&
    quantity <= item.quantity && item.equipped_entity_id === null &&
    item.equipped_slot === null);
  const values = { quantity, owner_entity_id: destinationEntityId,
    storage_id: destinationStorageId, equipped_entity_id: null, equipped_slot: null };
  if (item.quantity === quantity) return { changes: [{ family: "items", id: item.id,
    expectedRevision: item.revision, values }], transferredItemId: item.id, split: false };
  requireProgression(splitItemId !== item.id);
  return { changes: [
    { family: "items", id: item.id, expectedRevision: item.revision,
      values: { quantity: item.quantity - quantity } },
    { family: "items", id: splitItemId, expectedRevision: null,
      values: { name: item.name, category: item.category,
        description: item.description, mechanics: item.mechanics, ...values } },
  ], transferredItemId: splitItemId, split: true };
}
