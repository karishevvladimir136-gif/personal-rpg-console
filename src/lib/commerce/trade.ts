import { isDeepStrictEqual } from "node:util";
import type {
  LoopContext,
  LoopPlan,
  TradeIntent,
  TradeQuote,
} from "../foundation-loop/contracts.ts";
import type { FoundationCommand } from "../production/contracts.ts";
import { stableGameplayId } from "../gameplay/dice.ts";
import {
  currencyBalance,
  merchantAuthority,
  ownedItem,
  validateCommerceContext,
  validateCommerceFence,
} from "./context.ts";
import { findHaggleGrant, TRADE_EVENT_KIND } from "./haggle.ts";
import { itemTransferChanges } from "./transfer.ts";
import {
  COMMERCE_LIMITS,
  integer,
  parseCommerceDefinitions,
  parseTradeIntent,
  parseTradeQuote,
  requireCommerce,
} from "./validation.ts";

function sum(values: number[]): number {
  return values.reduce(
    (total, value) => integer(total + value, 0, COMMERCE_LIMITS.totalValue),
    0,
  );
}

/** Integer minor units only. Rounding is per item, so dividing one order into
 * smaller orders cannot improve the price. No price is parsed from prose. */
export function commerceUnitPrice(
  baseValue: number,
  basisPoints: number,
  direction: "take" | "give",
): number {
  integer(baseValue, 0, COMMERCE_LIMITS.unitValue);
  integer(basisPoints, 0, COMMERCE_LIMITS.basisPoints);
  requireCommerce(direction === "take" || direction === "give");
  const product = integer(
    baseValue * basisPoints,
    0,
    COMMERCE_LIMITS.unitValue * COMMERCE_LIMITS.basisPoints,
  );
  return direction === "take"
    ? Math.ceil(product / 10_000)
    : Math.floor(product / 10_000);
}

export function createTradeQuote(
  context: LoopContext,
  rawCommand: FoundationCommand,
  rawIntent: TradeIntent,
): TradeQuote {
  validateCommerceContext(context);
  const command = validateCommerceFence(context, rawCommand),
    intent = parseTradeIntent(rawIntent);
  const authority = merchantAuthority(
    context,
    intent.merchantActorId,
    intent.playerEntityId,
  );
  const { merchant, player, entity } = authority;
  const currency = context.state.currencies.find(
    (c) => c.id === intent.currencyId,
  );
  requireCommerce(
    currency && merchant.currencyIds.includes(currency.id),
    "unavailable",
  );
  const grant =
    intent.haggle === "favorable"
      ? findHaggleGrant(context, merchant, player.entity.id)
      : null;
  requireCommerce(
    intent.haggle === "none" || (grant && merchant.haggleLimitBasisPoints > 0),
    "unavailable",
  );
  const modifierBasisPoints = grant ? merchant.haggleLimitBasisPoints : 0;
  const lines: TradeQuote["lines"] = [];
  for (const direction of ["take", "give"] as const) {
    for (const part of intent[direction]) {
      const item = ownedItem(
        context,
        part.itemId,
        direction === "take" ? merchant.entityId : player.entity.id,
        direction === "take" ? merchant.storageId : undefined,
      );
      const policy = context.state.itemPolicies.find(
        (p) => p.itemId === item.id,
      );
      requireCommerce(
        policy &&
          policy.visibility === "public" &&
          policy.trade === "allowed" &&
          policy.currencyId === currency.id,
        "unavailable",
      );
      requireCommerce(
        item.quantity >= part.quantity &&
          item.equipped_entity_id === null &&
          item.equipped_slot === null,
        "unavailable",
      );
      if (direction === "give") {
        requireCommerce(
          context.snapshot.storages.find((s) => s.id === item.storage_id)
            ?.kind === player.entity.kind,
          "unavailable",
        );
        requireCommerce(
          policy.origin !== "stolen" || merchant.acceptsStolen,
          "unavailable",
        );
      }
      const basisPoints =
        direction === "take"
          ? merchant.sellBasisPoints - modifierBasisPoints
          : merchant.buyBasisPoints + modifierBasisPoints;
      const unitValue = commerceUnitPrice(
        policy.unitValue,
        basisPoints,
        direction,
      );
      lines.push({
        itemId: item.id,
        direction,
        quantity: part.quantity,
        itemRevision: item.revision,
        policyVersion: policy.version,
        unitValue,
        totalValue: integer(
          unitValue * part.quantity,
          0,
          COMMERCE_LIMITS.totalValue,
        ),
      });
    }
  }
  const payment =
    sum(lines.filter((l) => l.direction === "take").map((l) => l.totalValue)) -
    sum(lines.filter((l) => l.direction === "give").map((l) => l.totalValue));
  const playerBalance = currencyBalance(player.entity, currency.resourceKey);
  requireCommerce(
    playerBalance - payment >= 0 &&
      playerBalance - payment <= COMMERCE_LIMITS.balance,
    "unavailable",
  );
  if (merchant.usesFunds) {
    const merchantBalance = currencyBalance(entity, currency.resourceKey);
    requireCommerce(
      merchantBalance + payment >= 0 &&
        merchantBalance + payment <= COMMERCE_LIMITS.balance,
      "unavailable",
    );
  }
  if (merchant.capacity !== null) {
    const occupied = sum(
      context.snapshot.items
        .filter((i) => i.storage_id === merchant.storageId)
        .map((i) => i.quantity),
    );
    const incoming = sum(intent.give.map((i) => i.quantity)),
      outgoing = sum(intent.take.map((i) => i.quantity));
    requireCommerce(
      occupied - outgoing + incoming <= merchant.capacity,
      "unavailable",
    );
  }
  const body = {
    schemaVersion: 1 as const,
    command,
    intent,
    profile: structuredClone(context.state.profile),
    stateVersion: context.state.version,
    merchantVersion: merchant.version,
    lines,
    payment,
    modifierBasisPoints,
  };
  // The command pins the global authority. These additional public row pins
  // catch stale quantities/ownership/revisions even before the atomic commit.
  // Never hash private stock contents or merchant funds into a public token.
  const rowPins = {
    currencyVersion: currency.version,
    playerRevision: player.entity.revision,
    merchantRevision: entity.revision,
    playerActorRevision: player.actor.revision,
    merchantActorRevision: authority.actor.revision,
    playerStorageId: player.storage.id,
    playerStorageRevision: player.storage.revision,
    merchantStorageRevision: authority.storage.revision,
    worldMinutes: context.foundation.worldMinutes,
    haggleEventId: grant?.id ?? null,
    items: lines.map((line) => {
      const item = context.snapshot.items.find((i) => i.id === line.itemId)!;
      return {
        id: item.id,
        quantity: item.quantity,
        ownerEntityId: item.owner_entity_id,
        storageId: item.storage_id,
        storageRevision: context.snapshot.storages.find(
          (s) => s.id === item.storage_id,
        )!.revision,
        policy: context.state.itemPolicies.find(
          (p) => p.itemId === line.itemId,
        ),
      };
    }),
  };
  return {
    ...body,
    id: stableGameplayId(
      command.operationId,
      `commerce:quote:${JSON.stringify({ body, rowPins })}`,
    ),
  };
}

/** A trusted atomic plan, never partial writes. The service must recompute this
 * inside its fenced command path and commit changes, state and event together.
 * SQL still owns revision locks, exact retries, event commit and autosave. */
export function executeTradeQuote(
  context: LoopContext,
  rawQuote: unknown,
): LoopPlan {
  const quote = parseTradeQuote(rawQuote);
  const recomputed = createTradeQuote(context, quote.command, quote.intent);
  requireCommerce(isDeepStrictEqual(quote, recomputed), "conflict");
  const { merchant, player, entity } = merchantAuthority(
    context,
    quote.intent.merchantActorId,
    quote.intent.playerEntityId,
  );
  const currency = context.state.currencies.find(
    (c) => c.id === quote.intent.currencyId,
  )!;
  const state = structuredClone(context.state);
  state.version = integer(state.version + 1, 1);
  const changes: LoopPlan["changes"] = [];
  const transfers: {
    itemId: string;
    transferredItemId: string;
    direction: "take" | "give";
    quantity: number;
    unitValue: number;
    totalValue: number;
  }[] = [];
  for (const line of quote.lines) {
    const transfer = itemTransferChanges(context, quote.command, {
      itemId: line.itemId,
      quantity: line.quantity,
      sourceEntityId:
        line.direction === "take" ? merchant.entityId : player.entity.id,
      destinationEntityId:
        line.direction === "take" ? player.entity.id : merchant.entityId,
      destinationStorageId:
        line.direction === "take" ? player.storage.id : merchant.storageId,
    });
    changes.push(...transfer.changes);
    if (transfer.split) state.itemPolicies.push(transfer.itemPolicy);
    transfers.push({
      itemId: line.itemId,
      transferredItemId: transfer.transferredItemId,
      direction: line.direction,
      quantity: line.quantity,
      unitValue: line.unitValue,
      totalValue: line.totalValue,
    });
  }
  if (quote.payment !== 0) {
    changes.push({
      family: "entities",
      id: player.entity.id,
      expectedRevision: player.entity.revision,
      values: {
        resources: {
          ...player.entity.resources,
          [currency.resourceKey]:
            currencyBalance(player.entity, currency.resourceKey) -
            quote.payment,
        },
      },
    });
    if (merchant.usesFunds)
      changes.push({
        family: "entities",
        id: entity.id,
        expectedRevision: entity.revision,
        values: {
          resources: {
            ...entity.resources,
            [currency.resourceKey]:
              currencyBalance(entity, currency.resourceKey) + quote.payment,
          },
        },
      });
  }
  requireCommerce(
    new Set(changes.map((c) => `${c.family}:${c.id}`)).size === changes.length,
    "conflict",
  );
  parseCommerceDefinitions({
    currencies: state.currencies,
    itemPolicies: state.itemPolicies,
    merchants: state.merchants,
  });
  const grant =
    quote.intent.haggle === "favorable"
      ? findHaggleGrant(context, merchant, player.entity.id)
      : null;
  return {
    state,
    world: structuredClone(context.world),
    changes,
    events: [
      {
        kind: TRADE_EVENT_KIND,
        visibility: "public",
        text:
          context.snapshot.campaign.language === "ru"
            ? `Обмен завершён: ${merchant.label}.`
            : `Trade completed with ${merchant.label}.`,
        actorIds: [player.actor.id, merchant.actorId],
        threadIds: [],
        payload: {
          schemaVersion: 1,
          quoteId: quote.id,
          merchantActorId: merchant.actorId,
          playerEntityId: player.entity.id,
          currencyId: currency.id,
          payment: quote.payment,
          modifierBasisPoints: quote.modifierBasisPoints,
          haggleEventId: grant?.id ?? null,
          stateVersion: context.state.version,
          profile: structuredClone(context.state.profile),
          lines: transfers,
        },
      },
    ],
  };
}
