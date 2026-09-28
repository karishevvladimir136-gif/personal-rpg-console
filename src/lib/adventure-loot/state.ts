import type { LoopContext } from "../foundation-loop/contracts.ts";
import type {
  SecuredObjectFact,
  TrustedLootPolicy,
  LootItemDefinition,
} from "./contracts.ts";
import {
  fields,
  integer,
  list,
  uuid,
  textValue,
} from "../progression/validation.ts";
import {
  parseLootPolicy,
  parseObjectFact,
  requireLoot,
  isDeepStrictEqual,
} from "./validation.ts";

export type PrivateLootItem = {
  itemId: string;
  fragile: boolean;
  hidden: LootItemDefinition["private"];
};
export type LootObjectVersion = {
  schemaVersion: 1;
  expectedObjectRevision: number | null;
  object: SecuredObjectFact;
  policy: TrustedLootPolicy;
  privateItems: PrivateLootItem[];
  authority: "owner" | "settlement";
};
export const OBJECT_EVENT_KINDS = [
  "loot.object.configured",
  "loot.object.changed",
  "loot.object.corrected",
] as const;
export function parseObjectVersion(value: unknown): LootObjectVersion {
  const row = fields(value, [
    "schemaVersion",
    "expectedObjectRevision",
    "object",
    "policy",
    "privateItems",
    "authority",
  ]);
  requireLoot(
    row.schemaVersion === 1 &&
      ["owner", "settlement"].includes(String(row.authority)),
  );
  if (row.expectedObjectRevision !== null)
    integer(row.expectedObjectRevision, 1);
  const object = parseObjectFact(row.object),
    policy = parseLootPolicy(row.policy);
  requireLoot(
    object.campaignId === policy.campaignId && object.id === policy.objectId,
  );
  const privateItems = list(row.privateItems, 64).map((value) => {
    const item = fields(value, ["itemId", "fragile", "hidden"]);
    uuid(item.itemId);
    requireLoot(typeof item.fragile === "boolean");
    const hidden = fields(item.hidden, [
      "trueIdentity",
      "properties",
      "provenance",
      "usableCapabilities",
    ]);
    for (const key of ["trueIdentity", "provenance"])
      if (hidden[key] !== null) textValue(hidden[key], 2000);
    for (const key of ["properties", "usableCapabilities"]) {
      const values = list(hidden[key], 16);
      values.forEach((value) => textValue(value, 200));
      requireLoot(new Set(values).size === values.length);
    }
    return structuredClone(item) as PrivateLootItem;
  });
  requireLoot(
    new Set(privateItems.map((item) => item.itemId)).size ===
      privateItems.length,
  );
  return {
    schemaVersion: 1,
    expectedObjectRevision: row.expectedObjectRevision as number | null,
    object,
    policy,
    privateItems,
    authority: row.authority as LootObjectVersion["authority"],
  };
}
// The service supplies exact inherited Event membership. Never query all
// sibling origins or reconstruct state from a narration or a public summary.
export function readLootObject(
  context: LoopContext,
  objectId: string,
): LootObjectVersion | null {
  uuid(objectId);
  const campaignId = context.foundation.campaignId;
  const events = context.events
    .filter(
      (event) =>
        event.campaignId === campaignId &&
        event.visibility === "private" &&
        (OBJECT_EVENT_KINDS as readonly string[]).includes(event.kind) &&
        event.worldMinutes <= context.foundation.worldMinutes &&
        event.evidence.every(
          (evidence) =>
            evidence.knowledge !== "future_source" &&
            evidence.knowledge !== "source",
        ) &&
        (event.payload.object as { id?: string } | undefined)?.id === objectId,
    )
    .sort((a, b) => a.sequence - b.sequence || a.id.localeCompare(b.id));
  let result: LootObjectVersion | null = null;
  for (const event of events) {
    const next = parseObjectVersion(event.payload);
    requireLoot(
      next.object.campaignId === campaignId && next.object.id === objectId,
    );
    requireLoot(
      next.expectedObjectRevision === (result?.object.revision ?? null) &&
        next.object.revision === (result?.object.revision ?? 0) + 1,
      "conflict",
    );
    requireLoot(result !== null || next.authority === "owner");
    if (result)
      requireLoot(
        next.object.storageId === result.object.storageId &&
          (!result.object.contentsEstablished ||
            next.object.materializationId ===
              result.object.materializationId) &&
          (!result.object.contentsEstablished ||
            next.object.contentsEstablished) &&
          next.policy.id === result.policy.id &&
          (isDeepStrictEqual(next.policy, result.policy) ||
            (next.authority === "owner" &&
              next.policy.version === result.policy.version + 1)),
        "conflict",
      );
    result = next;
  }
  return result;
}
