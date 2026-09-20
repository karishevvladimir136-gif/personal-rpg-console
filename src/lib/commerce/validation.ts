import type {
  CurrencyDefinition,
  ItemPolicy,
  MerchantDefinition,
  TradeIntent,
  TradeQuote,
} from "../foundation-loop/contracts.ts";
import type {
  FoundationCommand,
  RulesetProfileRef,
} from "../production/contracts.ts";
import { parseRulesetRef } from "../rulesets/profiles.ts";
import { isTimelineFence } from "../saves/fence.ts";

export const COMMERCE_LIMITS = Object.freeze({
  definitions: 512,
  currencies: 32,
  merchants: 128,
  lines: 50,
  quantity: 1_000_000,
  balance: 1_000_000,
  unitValue: 1_000_000,
  totalValue: 1_000_000_000,
  basisPoints: 50_000,
  haggleBasisPoints: 2_500,
  revision: 1_000_000_000,
});

export class CommerceValidationError extends Error {
  readonly code:
    "validation" | "configuration" | "scope" | "conflict" | "unavailable";
  constructor(code: CommerceValidationError["code"] = "validation") {
    super(
      code === "conflict"
        ? "Trade state changed. Review a new quote."
        : code === "unavailable"
          ? "This trade is not available."
          : "Commerce configuration or request requires review.",
    );
    this.name = "CommerceValidationError";
    this.code = code;
  }
}

export function requireCommerce(
  condition: unknown,
  code: CommerceValidationError["code"] = "validation",
): asserts condition {
  if (!condition) throw new CommerceValidationError(code);
}

export function object(
  value: unknown,
  keys: readonly string[],
): Record<string, unknown> {
  requireCommerce(
    value !== null && typeof value === "object" && !Array.isArray(value),
  );
  const result = value as Record<string, unknown>;
  requireCommerce(
    Object.getPrototypeOf(result) === Object.prototype ||
      Object.getPrototypeOf(result) === null,
  );
  requireCommerce(
    Object.keys(result).length === keys.length &&
      keys.every((key) => Object.hasOwn(result, key)),
  );
  return result;
}

export function integer(
  value: unknown,
  min = 0,
  max: number = COMMERCE_LIMITS.revision,
): number {
  requireCommerce(
    Number.isSafeInteger(value) &&
      (value as number) >= min &&
      (value as number) <= max,
  );
  return value as number;
}

export function text(value: unknown, max = 120): string {
  requireCommerce(
    typeof value === "string" &&
      value.trim().length > 0 &&
      value.length <= max &&
      !value.includes("\u0000"),
  );
  return value;
}

export function uuid(value: unknown): string {
  const result = text(value, 36);
  requireCommerce(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
      result,
    ),
  );
  return result;
}

export function definitionId(value: unknown): string {
  const result = text(value, 80);
  requireCommerce(
    /^[a-z0-9][a-z0-9_-]{0,79}$/.test(result) &&
      !["constructor", "prototype", "__proto__"].includes(result),
  );
  return result;
}

export function list<T>(
  value: unknown,
  parse: (value: unknown) => T,
  max: number,
): T[] {
  requireCommerce(Array.isArray(value) && value.length <= max);
  return value.map(parse);
}

export function unique<T>(values: T[], key: (value: T) => unknown): T[] {
  requireCommerce(new Set(values.map(key)).size === values.length);
  return values;
}

export function profile(value: unknown): RulesetProfileRef {
  try {
    return parseRulesetRef(value);
  } catch {
    throw new CommerceValidationError("configuration");
  }
}

export function parseCurrencyDefinition(value: unknown): CurrencyDefinition {
  const v = object(value, ["id", "label", "resourceKey", "version"]);
  const resourceKey = text(v.resourceKey, 80);
  requireCommerce(
    /^[a-z][a-z0-9_-]{0,79}$/.test(resourceKey) &&
      !["constructor", "prototype", "__proto__"].includes(resourceKey),
  );
  return {
    id: definitionId(v.id),
    label: text(v.label),
    resourceKey,
    version: integer(v.version, 1),
  };
}

export function parseItemPolicy(value: unknown): ItemPolicy {
  const v = object(value, [
    "itemId",
    "version",
    "currencyId",
    "unitValue",
    "trade",
    "origin",
    "visibility",
  ]);
  requireCommerce(
    v.trade === "allowed" || v.trade === "restricted" || v.trade === "quest",
  );
  requireCommerce(v.origin === "legitimate" || v.origin === "stolen");
  requireCommerce(v.visibility === "public" || v.visibility === "private");
  return {
    itemId: uuid(v.itemId),
    version: integer(v.version, 1),
    currencyId: definitionId(v.currencyId),
    unitValue: integer(v.unitValue, 0, COMMERCE_LIMITS.unitValue),
    trade: v.trade,
    origin: v.origin,
    visibility: v.visibility,
  };
}

export function parseMerchantDefinition(value: unknown): MerchantDefinition {
  const v = object(value, [
    "actorId",
    "entityId",
    "version",
    "label",
    "storageId",
    "currencyIds",
    "available",
    "acceptsStolen",
    "usesFunds",
    "capacity",
    "buyBasisPoints",
    "sellBasisPoints",
    "haggleLimitBasisPoints",
  ]);
  requireCommerce(
    typeof v.available === "boolean" &&
      typeof v.acceptsStolen === "boolean" &&
      typeof v.usesFunds === "boolean",
  );
  const buyBasisPoints = integer(
    v.buyBasisPoints,
    0,
    COMMERCE_LIMITS.basisPoints,
  );
  const sellBasisPoints = integer(
    v.sellBasisPoints,
    0,
    COMMERCE_LIMITS.basisPoints,
  );
  const haggleLimitBasisPoints = integer(
    v.haggleLimitBasisPoints,
    0,
    COMMERCE_LIMITS.haggleBasisPoints,
  );
  // "Buy" means the merchant buys from the player. Even the best negotiated
  // price cannot create profit by immediately selling an unchanged item back.
  requireCommerce(
    buyBasisPoints + haggleLimitBasisPoints <=
      sellBasisPoints - haggleLimitBasisPoints,
  );
  const actorId = uuid(v.actorId),
    entityId = uuid(v.entityId);
  requireCommerce(actorId === entityId);
  const currencyIds = unique(
    list(v.currencyIds, definitionId, COMMERCE_LIMITS.currencies),
    (id) => id,
  );
  requireCommerce(currencyIds.length > 0);
  return {
    actorId,
    entityId,
    version: integer(v.version, 1),
    label: text(v.label),
    storageId: uuid(v.storageId),
    currencyIds,
    available: v.available,
    acceptsStolen: v.acceptsStolen,
    usesFunds: v.usesFunds,
    capacity:
      v.capacity === null
        ? null
        : integer(v.capacity, 0, COMMERCE_LIMITS.quantity),
    buyBasisPoints,
    sellBasisPoints,
    haggleLimitBasisPoints,
  };
}

export type CommerceDefinitions = {
  currencies: CurrencyDefinition[];
  itemPolicies: ItemPolicy[];
  merchants: MerchantDefinition[];
};

export function parseCommerceDefinitions(value: unknown): CommerceDefinitions {
  const v = object(value, ["currencies", "itemPolicies", "merchants"]);
  const currencies = unique(
    list(v.currencies, parseCurrencyDefinition, COMMERCE_LIMITS.currencies),
    (c) => c.id,
  );
  unique(currencies, (c) => c.resourceKey);
  const itemPolicies = unique(
    list(v.itemPolicies, parseItemPolicy, COMMERCE_LIMITS.definitions),
    (p) => p.itemId,
  );
  const merchants = unique(
    list(v.merchants, parseMerchantDefinition, COMMERCE_LIMITS.merchants),
    (m) => m.actorId,
  );
  unique(merchants, (m) => m.entityId);
  unique(merchants, (m) => m.storageId);
  const currencyIds = new Set(currencies.map((c) => c.id));
  requireCommerce(
    itemPolicies.every((p) => currencyIds.has(p.currencyId)) &&
      merchants.every((m) => m.currencyIds.every((id) => currencyIds.has(id))),
  );
  return { currencies, itemPolicies, merchants };
}

export function parseTradeIntent(value: unknown): TradeIntent {
  const v = object(value, [
    "merchantActorId",
    "playerEntityId",
    "take",
    "give",
    "currencyId",
    "haggle",
  ]);
  const quantities = (value: unknown) =>
    unique(
      list(
        value,
        (raw) => {
          const q = object(raw, ["itemId", "quantity"]);
          return {
            itemId: uuid(q.itemId),
            quantity: integer(q.quantity, 1, COMMERCE_LIMITS.quantity),
          };
        },
        COMMERCE_LIMITS.lines,
      ),
      (q) => q.itemId,
    );
  const take = quantities(v.take),
    give = quantities(v.give);
  requireCommerce(
    take.length + give.length > 0 &&
      take.length + give.length <= COMMERCE_LIMITS.lines,
  );
  unique([...take, ...give], (q) => q.itemId);
  requireCommerce(v.haggle === "none" || v.haggle === "favorable");
  return {
    merchantActorId: uuid(v.merchantActorId),
    playerEntityId: uuid(v.playerEntityId),
    take,
    give,
    currencyId: definitionId(v.currencyId),
    haggle: v.haggle,
  };
}

export function parseCommerceCommand(value: unknown): FoundationCommand {
  const v = object(value, [
    "operationId",
    "campaignId",
    "timeline",
    "expectedRevision",
    "expectedRuntimeRevision",
    "expectedHeadId",
  ]);
  requireCommerce(isTimelineFence(v.timeline));
  return {
    operationId: uuid(v.operationId),
    campaignId: uuid(v.campaignId),
    timeline: structuredClone(v.timeline),
    expectedRevision: integer(v.expectedRevision),
    expectedRuntimeRevision: integer(v.expectedRuntimeRevision),
    expectedHeadId: v.expectedHeadId === null ? null : uuid(v.expectedHeadId),
  };
}

export function parseTradeQuote(value: unknown): TradeQuote {
  const v = object(value, [
    "schemaVersion",
    "id",
    "command",
    "intent",
    "profile",
    "stateVersion",
    "merchantVersion",
    "lines",
    "payment",
    "modifierBasisPoints",
  ]);
  requireCommerce(v.schemaVersion === 1);
  const lines = unique(
    list(
      v.lines,
      (raw): TradeQuote["lines"][number] => {
        const line = object(raw, [
          "itemId",
          "direction",
          "quantity",
          "itemRevision",
          "policyVersion",
          "unitValue",
          "totalValue",
        ]);
        requireCommerce(line.direction === "take" || line.direction === "give");
        return {
          itemId: uuid(line.itemId),
          direction: line.direction,
          quantity: integer(line.quantity, 1, COMMERCE_LIMITS.quantity),
          itemRevision: integer(line.itemRevision, 1),
          policyVersion: integer(line.policyVersion, 1),
          unitValue: integer(line.unitValue, 0, COMMERCE_LIMITS.totalValue),
          totalValue: integer(line.totalValue, 0, COMMERCE_LIMITS.totalValue),
        };
      },
      COMMERCE_LIMITS.lines,
    ),
    (line) => line.itemId,
  );
  requireCommerce(lines.length > 0);
  return {
    schemaVersion: 1,
    id: uuid(v.id),
    command: parseCommerceCommand(v.command),
    intent: parseTradeIntent(v.intent),
    profile: profile(v.profile),
    stateVersion: integer(v.stateVersion),
    merchantVersion: integer(v.merchantVersion, 1),
    lines,
    payment: integer(
      v.payment,
      -COMMERCE_LIMITS.totalValue,
      COMMERCE_LIMITS.totalValue,
    ),
    modifierBasisPoints: integer(
      v.modifierBasisPoints,
      0,
      COMMERCE_LIMITS.haggleBasisPoints,
    ),
  };
}
