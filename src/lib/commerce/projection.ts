import type { LoopContext } from "../foundation-loop/contracts.ts";
import type { Item } from "../persistence/contracts.ts";
import {
  currencyBalance,
  merchantAuthority,
  ownedItem,
  playerAuthority,
  validateCommerceContext,
} from "./context.ts";
import { CommerceValidationError, uuid } from "./validation.ts";

export type CommerceItem = {
  id: string;
  name: string;
  quantity: number;
  currencyId: string;
  unitValue: number;
  trade: "allowed" | "restricted" | "quest";
  origin: "legitimate" | "stolen";
  equipped: boolean;
};
export type CommerceProjection = {
  schemaVersion: 1;
  playerEntityId: string;
  currencies: { id: string; label: string; balance: number }[];
  inventory: CommerceItem[];
  merchants: {
    actorId: string;
    label: string;
    currencyIds: string[];
    acceptsStolen: boolean;
    stock: CommerceItem[];
  }[];
};

function itemProjection(context: LoopContext, item: Item): CommerceItem | null {
  const policy = context.state.itemPolicies.find((p) => p.itemId === item.id);
  // Omit the whole row. Redacting just prose leaks identity, quantity and price.
  if (!policy || policy.visibility !== "public" || item.quantity === 0)
    return null;
  return {
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    currencyId: policy.currencyId,
    unitValue: policy.unitValue,
    trade: policy.trade,
    origin: policy.origin,
    equipped: item.equipped_entity_id !== null,
  };
}

/** Allowlisted player view. It deliberately contains no capacity/funds totals,
 * private stock counts, definitions, descriptions, evidence or hidden actors. */
export function projectCommerce(
  context: LoopContext,
  playerEntityId: string,
): CommerceProjection {
  validateCommerceContext(context);
  uuid(playerEntityId);
  if (
    context.state.currencies.length === 0 &&
    context.state.itemPolicies.length === 0 &&
    context.state.merchants.length === 0
  )
    return {
      schemaVersion: 1,
      playerEntityId,
      currencies: [],
      inventory: [],
      merchants: [],
    };
  const player = playerAuthority(context, playerEntityId);
  const inventory: CommerceItem[] = [];
  for (const item of context.snapshot.items) {
    if (item.owner_entity_id !== playerEntityId) continue;
    const storage = context.snapshot.storages.find(
      (s) => s.id === item.storage_id,
    );
    if (
      storage?.entity_id !== playerEntityId ||
      storage.kind !== player.entity.kind
    )
      continue;
    const projected = itemProjection(context, item);
    if (projected) inventory.push(projected);
  }
  const merchants: CommerceProjection["merchants"] = [];
  for (const definition of context.state.merchants) {
    try {
      const { merchant } = merchantAuthority(
        context,
        definition.actorId,
        playerEntityId,
      );
      const stock: CommerceItem[] = [];
      for (const item of context.snapshot.items) {
        if (
          item.storage_id !== merchant.storageId ||
          item.owner_entity_id !== merchant.entityId
        )
          continue;
        ownedItem(context, item.id, merchant.entityId, merchant.storageId);
        const projected = itemProjection(context, item);
        if (projected) stock.push(projected);
      }
      merchants.push({
        actorId: merchant.actorId,
        label: merchant.label,
        currencyIds: [...merchant.currencyIds],
        acceptsStolen: merchant.acceptsStolen,
        stock,
      });
    } catch (error) {
      if (
        !(error instanceof CommerceValidationError) ||
        error.code !== "unavailable"
      )
        throw error;
    }
  }
  return {
    schemaVersion: 1,
    playerEntityId,
    currencies: context.state.currencies.map((c) => ({
      id: c.id,
      label: c.label,
      balance: currencyBalance(player.entity, c.resourceKey),
    })),
    inventory,
    merchants,
  };
}
