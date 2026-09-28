import { isDeepStrictEqual } from "node:util";
import {
  fields,
  identifier,
  integer,
  list,
  textValue,
  unique,
  uuid,
} from "../progression/validation.ts";
import type {
  SecuredObjectFact,
  TrustedLootPolicy,
  LootIntent,
} from "./contracts.ts";

export class LootValidationError extends Error {
  readonly code: "validation" | "conflict" | "unavailable";
  constructor(code: LootValidationError["code"] = "validation") {
    super("This action needs review.");
    this.code = code;
  }
}
export function requireLoot(
  value: unknown,
  code: LootValidationError["code"] = "validation",
): asserts value {
  if (!value) throw new LootValidationError(code);
}
const strings = (value: unknown, max: number, ids = false) => {
  const rows = list(value, max);
  rows.forEach((row) => (ids ? uuid(row) : textValue(row, 200)));
  unique(rows);
  return rows as string[];
};
export function parseObjectFact(value: unknown): SecuredObjectFact {
  const row = fields(value, [
    "schemaVersion",
    "campaignId",
    "id",
    "revision",
    "storageId",
    "locationId",
    "ownerEntityId",
    "label",
    "access",
    "lockClass",
    "structureClass",
    "environmentTags",
    "portable",
    "contentsEstablished",
    "materializationId",
    "knownBy",
    "contentsKnownBy",
  ]);
  requireLoot(row.schemaVersion === 1);
  ["campaignId", "id", "storageId", "locationId", "ownerEntityId"].forEach(
    (key) => uuid(row[key]),
  );
  integer(row.revision, 1);
  textValue(row.label, 200);
  requireLoot(
    ["open", "closed", "locked", "sealed", "jammed", "broken"].includes(
      String(row.access),
    ),
  );
  for (const key of ["lockClass", "structureClass"])
    if (row[key] !== null) identifier(row[key]);
  strings(row.environmentTags, 16);
  requireLoot(row.portable === null || typeof row.portable === "boolean");
  requireLoot(typeof row.contentsEstablished === "boolean");
  if (row.materializationId !== null) uuid(row.materializationId);
  requireLoot((row.materializationId !== null) === row.contentsEstablished);
  strings(row.knownBy, 64, true);
  strings(row.contentsKnownBy, 64, true);
  requireLoot(
    (row.contentsKnownBy as string[]).every((id) =>
      (row.knownBy as string[]).includes(id),
    ),
  );
  requireLoot(
    (row.contentsKnownBy as string[]).length === 0 ||
      row.contentsEstablished === true,
  );
  return structuredClone(row) as SecuredObjectFact;
}
function check(value: unknown) {
  if (value === null) return;
  const row = fields(value, ["index", "stat", "dc"]);
  integer(row.index, 0, 31);
  integer(row.dc, 1, 100);
  requireLoot(["skill", "attack", "save"].includes(String(row.stat)));
}
export function parseLootPolicy(value: unknown): TrustedLootPolicy {
  const row = fields(value, [
    "schemaVersion",
    "campaignId",
    "objectId",
    "id",
    "version",
    "profile",
    "discoveryCheck",
    "contents",
    "approaches",
  ]);
  requireLoot(row.schemaVersion === 1);
  uuid(row.campaignId);
  uuid(row.objectId);
  identifier(row.id);
  integer(row.version, 1);
  const profile = fields(row.profile, [
    "id",
    "version",
    "mode",
    "validatorVersion",
  ]);
  identifier(profile.id);
  integer(profile.version, 1);
  identifier(profile.validatorVersion);
  requireLoot(
    ["full_ruleset", "world_logic", "custom_ruleset"].includes(
      String(profile.mode),
    ),
  );
  check(row.discoveryCheck);
  const contents = list(row.contents, 32).map((entry) => {
    const item = fields(entry, [
      "key",
      "visible",
      "commerce",
      "private",
      "fragile",
    ]);
    identifier(item.key);
    const v = fields(item.visible, [
      "name",
      "category",
      "quantity",
      "description",
      "mechanics",
    ]);
    textValue(v.name, 200);
    textValue(v.category, 100);
    integer(v.quantity, 1, 10000);
    for (const key of ["description", "mechanics"])
      requireLoot(
        typeof v[key] === "string" &&
          (v[key] as string).length <= 4000 &&
          !(v[key] as string).includes("\0"),
      );
    const p = fields(item.commerce, [
      "currencyId",
      "unitValue",
      "trade",
      "origin",
      "visibility",
    ]);
    identifier(p.currencyId);
    integer(p.unitValue, 0, 1000000);
    requireLoot(
      ["allowed", "restricted", "quest"].includes(String(p.trade)) &&
        ["legitimate", "stolen"].includes(String(p.origin)) &&
        ["public", "private"].includes(String(p.visibility)),
    );
    const hidden = fields(item.private, [
      "trueIdentity",
      "properties",
      "provenance",
      "usableCapabilities",
    ]);
    for (const key of ["trueIdentity", "provenance"])
      if (hidden[key] !== null) textValue(hidden[key], 2000);
    strings(hidden.properties, 16);
    strings(hidden.usableCapabilities, 16);
    requireLoot(typeof item.fragile === "boolean");
    return item;
  });
  unique(contents.map((row) => row.key));
  const approaches = list(row.approaches, 16).map((value) => {
    const route = fields(value, [
      "id",
      "capability",
      "from",
      "lockClass",
      "structureClass",
      "environmentTags",
      "requiresPortable",
      "requiredItemIds",
      "resourceCost",
      "check",
      "to",
      "noise",
      "fragileLoss",
    ]);
    identifier(route.id);
    textValue(route.capability, 200);
    const from = strings(route.from, 6);
    requireLoot(
      from.every((value) =>
        ["closed", "locked", "sealed", "jammed"].includes(value),
      ),
    );
    for (const key of ["lockClass", "structureClass"])
      if (route[key] !== null) identifier(route[key]);
    strings(route.environmentTags, 16);
    requireLoot(
      typeof route.requiresPortable === "boolean" &&
        typeof route.noise === "boolean",
    );
    strings(route.requiredItemIds, 8, true);
    if (route.resourceCost !== null) {
      const cost = fields(route.resourceCost, ["resource", "amount"]);
      identifier(cost.resource);
      integer(cost.amount, 1, 1000000);
    }
    check(route.check);
    requireLoot(["open", "broken"].includes(String(route.to)));
    integer(route.fragileLoss, 0, 10000);
    return route;
  });
  unique(approaches.map((route) => route.id));
  return structuredClone(row) as TrustedLootPolicy;
}
export function parseLootIntent(value: unknown): LootIntent {
  requireLoot(value && typeof value === "object");
  const kind = (value as LootIntent).kind;
  const row = fields(
    value,
    kind === "search"
      ? ["kind", "actorId", "objectId"]
      : kind === "access"
        ? ["kind", "actorId", "objectId", "approachId"]
        : [
            "kind",
            "actorId",
            "objectId",
            "itemId",
            "quantity",
            "destinationStorageId",
          ],
  );
  requireLoot(["search", "access", "take"].includes(kind));
  uuid(row.actorId);
  uuid(row.objectId);
  if (kind === "access") identifier(row.approachId);
  if (kind === "take") {
    uuid(row.itemId);
    uuid(row.destinationStorageId);
    integer(row.quantity, 1, 10000);
  }
  return structuredClone(row) as LootIntent;
}
export { isDeepStrictEqual };
