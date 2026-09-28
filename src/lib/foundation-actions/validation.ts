import {
  COMMERCE_LIMITS,
  definitionId,
  integer,
  list,
  object,
  parseTradeIntent,
  requireCommerce,
  text,
  unique,
  uuid,
} from "../commerce/validation.ts";
import type { FoundationActionProposal } from "./contracts.ts";

import { parseLootIntent } from "../adventure-loot/validation.ts";

export class FoundationActionError extends Error {
  readonly code: "unsupported" | "conflict" | "uncertainty";
  constructor(code: FoundationActionError["code"] = "unsupported") {
    super("This action needs clarification or current public context.");
    this.name = "FoundationActionError";
    this.code = code;
  }
}

export function requireAction(
  value: unknown,
  code: FoundationActionError["code"] = "unsupported",
): asserts value {
  if (!value) throw new FoundationActionError(code);
}

export function parseFoundationActionProposal(
  value: unknown,
): FoundationActionProposal {
  requireAction(
    value !== null && typeof value === "object" && !Array.isArray(value),
  );
  const action = (value as Record<string, unknown>).action;
  if (action === "loot") {
    const row = object(value, ["schemaVersion", "action", "input", "intent"]);
    requireAction(row.schemaVersion === 1);
    return {
      schemaVersion: 1,
      action: "loot",
      input: text(row.input, 20000),
      intent: parseLootIntent(row.intent),
    };
  }
  requireAction(
    ["quote", "trade", "haggle", "theft", "robbery"].includes(String(action)),
  );
  const v = object(value, [
    "schemaVersion",
    "action",
    "input",
    ...(action === "quote" || action === "trade"
      ? ["intent", "expectedPayment"]
      : [
          "merchantActorId",
          "playerEntityId",
          "checkIndex",
          ...(action === "haggle"
            ? []
            : ["take", "currency", "merchantUnavailable"]),
        ]),
  ]);
  requireAction(v.schemaVersion === 1);
  const input = text(v.input, 20000);
  if (action === "quote" || action === "trade") {
    return {
      schemaVersion: 1,
      action,
      input,
      intent: parseTradeIntent(v.intent),
      expectedPayment:
        v.expectedPayment === null
          ? null
          : integer(
              v.expectedPayment,
              -COMMERCE_LIMITS.totalValue,
              COMMERCE_LIMITS.totalValue,
            ),
    };
  }
  const common = {
    schemaVersion: 1 as const,
    input,
    merchantActorId: uuid(v.merchantActorId),
    playerEntityId: uuid(v.playerEntityId),
    checkIndex: v.checkIndex === null ? null : integer(v.checkIndex, 0, 7),
  };
  if (action === "haggle") return { ...common, action };
  requireAction(action === "theft" || action === "robbery");
  const take = unique(
    list(
      v.take,
      (raw) => {
        const part = object(raw, ["itemId", "quantity"]);
        return {
          itemId: uuid(part.itemId),
          quantity: integer(part.quantity, 1, COMMERCE_LIMITS.quantity),
        };
      },
      COMMERCE_LIMITS.lines,
    ),
    (part) => part.itemId,
  );
  let currency: { currencyId: string; amount: number } | null = null;
  if (v.currency !== null) {
    const part = object(v.currency, ["currencyId", "amount"]);
    currency = {
      currencyId: definitionId(part.currencyId),
      amount: integer(part.amount, 1, COMMERCE_LIMITS.balance),
    };
  }
  requireCommerce(take.length > 0 || currency !== null);
  requireAction(typeof v.merchantUnavailable === "boolean");
  requireAction(action === "robbery" || v.merchantUnavailable === false);
  return {
    ...common,
    action,
    take,
    currency,
    merchantUnavailable: v.merchantUnavailable,
  };
}
