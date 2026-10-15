import type { JsonObject } from "./contracts.ts";
import type { AstraToolReceipt, RecordChange } from "./server-contracts.ts";
import type { AstraEffectIntent, AstraOrderedEffectsPlan } from "./astra-settlement.ts";
import type { NaturalMaterializationReceipt, NaturalTurnState } from "./astra-natural-promotion.ts";

const identitySlots = new Set(["actorId", "targetId", "issuerId", "sourceEntityId", "recipientId",
  "sellerId", "buyerId", "playerId", "counterpartyId", "crafterId", "entityId", "itemId", "giveItemId",
  "receiveItemId", "questId", "locationId", "destinationEntityId", "destinationStorageId", "outputStorageId",
  "restId", "encounterId", "participantId", "recipeId", "effectId", "storageId"]);
const identityArrays = new Set(["participantIds", "recipientIds", "entityIds", "itemIds", "actorIds", "targetIds"]);

/** Examine typed identity slots, never serialized prose: a title/description
 * containing a UUID is not a record reference or an authorization trigger. */
function intentReferences(value: unknown, key = "", into = new Set<string>()): Set<string> {
  if (typeof value === "string" && identitySlots.has(key)) into.add(value);
  else if (Array.isArray(value)) {
    for (const entry of value) {
      if (typeof entry === "string" && identityArrays.has(key)) into.add(entry);
      else intentReferences(entry, "", into);
    }
  } else if (value && typeof value === "object") {
    for (const [name, entry] of Object.entries(value)) intentReferences(entry, name, into);
  }
  return into;
}

function foreignKeys(values: JsonObject): string[] {
  const ids: string[] = [];
  for (const [key, value] of Object.entries(values)) {
    if (key.endsWith("_id") && typeof value === "string") ids.push(value);
    else if (key.endsWith("_ids") && Array.isArray(value))
      ids.push(...value.filter((entry): entry is string => typeof entry === "string"));
  }
  return ids;
}

function dependencies(state: NaturalTurnState, initial: Set<string>) {
  const records = new Set(state.materializations.map((row) => row.recordId));
  const changes = new Map<string, RecordChange[]>();
  for (const receipt of state.materializations) for (const change of receipt.changes)
    changes.set(change.id, [...(changes.get(change.id) ?? []), change]);
  const active = new Set(initial), auxiliary = new Set<string>();
  const scannedRecords = new Set<string>(), scannedAuxiliary = new Set<string>();
  function reference(id: string) {
    if (records.has(id)) active.add(id);
    else if (changes.has(id) && !scannedAuxiliary.has(id)) {
      auxiliary.add(id); scannedAuxiliary.add(id);
      for (const change of changes.get(id)!) for (const dependency of foreignKeys(change.values)) reference(dependency);
    }
  }
  while ([...active].some((id) => !scannedRecords.has(id))) {
    for (const id of [...active]) {
      if (scannedRecords.has(id)) continue;
      scannedRecords.add(id);
      for (const receipt of state.materializations.filter((row) => row.recordId === id)) {
        if (receipt.request.ownerRef !== null) {
          const owner = state.materializations.find((row) => row.recordId === receipt.request.ownerRef ||
            row.request.subjectRef === receipt.request.ownerRef);
          if (owner) active.add(owner.recordId);
        }
        for (const change of receipt.changes) {
          if (!records.has(change.id)) reference(change.id);
          for (const dependency of foreignKeys(change.values)) reference(dependency);
        }
      }
    }
  }
  return { active, auxiliary };
}

function usedByAcceptedIntent(receipt: NaturalMaterializationReceipt, intent: AstraEffectIntent): boolean {
  const id = receipt.recordId;
  if (receipt.request.purpose === "job") return intent.kind === "job_offer" && intent.issuerId === id;
  if (receipt.request.purpose === "party") return intent.kind === "companion_join" && intent.entityId === id;
  if (receipt.request.purpose !== "trade") return false;
  if (intent.kind === "mundane_grant") return intent.issuerId === id;
  return ["mundane_purchase", "mundane_sale", "item_exchange", "currency_transfer", "item_transfer"]
    .includes(intent.kind) && intentReferences(intent).has(id);
}

/** This follows an ALREADY validated first plan over the full private virtual
 * projection. It selects the minimum effective primary records; optional
 * rejected trade/job/party setup does not become durable merely by being asked.
 * Auxiliary storage/encounter rows may be required independently of the receipt
 * that first created them: callers must carry those FK dependencies without
 * retaining that receipt's otherwise unused primary Item/NPC. */
export function effectiveNaturalRecordIds(state: NaturalTurnState,
  effects: AstraOrderedEffectsPlan | null, tools: AstraToolReceipt[]): string[] {
  const accepted = effects?.effects.map((row) => row.intent) ?? [];
  const initial = new Set<string>();
  for (const receipt of state.materializations) {
    const { kind, purpose } = receipt.request;
    if (["track", "recurring"].includes(purpose) || (kind === "item" && purpose === "inventory") ||
      (purpose === "combat" && ["npc", "creature"].includes(kind) && tools.some((tool) =>
        tool.call.kind === "attack" && [tool.call.actorId, tool.call.targetId].includes(receipt.recordId))) ||
      (["npc", "creature"].includes(kind) && ["job", "trade", "party"].includes(purpose) ||
        kind === "item" && purpose === "trade") && accepted.some((intent) => usedByAcceptedIntent(receipt, intent)))
      initial.add(receipt.recordId);
  }
  const { active } = dependencies(state, initial);
  return [...new Set(state.materializations.map((row) => row.recordId).filter((id) => active.has(id)))];
}

/** A shared auxiliary row can have been created by a rejected sibling receipt.
 * Select its required FK closure independently; never keep that sibling's
 * primary stock merely to retain a merchant/ground storage row. */
export function effectiveNaturalChanges(state: NaturalTurnState): RecordChange[] {
  const records = new Set(state.materializations.map((row) => row.recordId));
  const selected = state.effectiveRecordIds === undefined ? null : dependencies(state, new Set(state.effectiveRecordIds));
  const result = new Map<string, RecordChange>();
  for (const receipt of state.materializations) for (const change of receipt.changes) {
    if (selected && !(records.has(change.id) ? selected.active.has(change.id) : selected.auxiliary.has(change.id))) continue;
    const key = `${change.family}:${change.id}`;
    if (!result.has(key)) result.set(key, structuredClone(change));
  }
  return [...result.values()];
}

/** Normalize only optional effects the original complete projection ALREADY
 * validated and rejected. Removing their inactive provisional identity must
 * not turn a harmless optional refusal into a foreign-ID failure on the second
 * plan. Accepted positions and genuine foreign IDs are never masked. This is
 * not an alternative scope validator and must not run before the first plan. */
export function pruneRejectedPromotionIntents(plan: AstraOrderedEffectsPlan | null,
  intents: AstraEffectIntent[], activeIDs: string[], state: NaturalTurnState): AstraEffectIntent[] {
  if (!plan) return [...intents];
  const accepted = new Set(plan.indices), rejected = new Set(plan.rejected.map((row) => row.index));
  const effective = dependencies(state, new Set(activeIDs));
  const inactive = new Set<string>();
  for (const receipt of state.materializations) if (!effective.active.has(receipt.recordId)) {
    inactive.add(receipt.recordId);
    for (const change of receipt.changes)
      if (!effective.active.has(change.id) && !effective.auxiliary.has(change.id)) inactive.add(change.id);
  }
  return intents.map((intent, index) => rejected.has(index) && !accepted.has(index) &&
    [...intentReferences(intent)].some((id) => inactive.has(id))
    ? { kind: "unsupported_optional", description: "Uncommitted optional materialization" } : intent);
}
