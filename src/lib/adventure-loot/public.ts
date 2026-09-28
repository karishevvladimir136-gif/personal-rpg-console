import type { LoopContext } from "../foundation-loop/contracts.ts";
import type { PublicLootObject } from "./contracts.ts";
import { readLootObject } from "./state.ts";
import { OBJECT_EVENT_KINDS } from "./state.ts";
import { uuid } from "../progression/validation.ts";

// No raw private metadata, reasons, quantities, property labels, disabled
// controls, true provenance or unknown IDs are projected to the player.
export function projectLootObjects(
  context: LoopContext,
  actorId: string,
): PublicLootObject[] {
  uuid(actorId);
  const actor = context.world.actors.find(
    (actor) => actor.id === actorId && actor.control === "player",
  );
  if (!actor) return [];
  const objectIds = new Set(
    context.events
      .filter(
        (event) =>
          event.campaignId === context.foundation.campaignId &&
          event.visibility === "private" &&
          event.worldMinutes <= context.foundation.worldMinutes &&
          event.evidence.every(
            (e) => e.knowledge !== "source" && e.knowledge !== "future_source",
          ) &&
          (OBJECT_EVENT_KINDS as readonly string[]).includes(event.kind),
      )
      .map((event) => (event.payload.object as { id: string }).id),
  );
  const result: PublicLootObject[] = [];
  for (const objectId of objectIds) {
    const version = readLootObject(context, objectId);
    if (!version) continue;
    const object = version.object;
    if (
      !object.knownBy.includes(actor.id) ||
      actor.locationId !== object.locationId
    )
      continue;
    const contents =
      object.contentsKnownBy.includes(actor.id) &&
      ["open", "broken"].includes(object.access)
        ? context.snapshot.items
            .filter(
              (item) =>
                item.campaign_id === context.foundation.campaignId &&
                item.storage_id === object.storageId &&
                item.quantity > 0 &&
                context.state.itemPolicies.some(
                  (policy) =>
                    policy.itemId === item.id && policy.visibility === "public",
                ),
            )
            .map((item) => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              category: item.category,
              description: item.description,
              mechanics: item.mechanics,
            }))
        : null;
    result.push({
      id: object.id,
      campaign_id: object.campaignId,
      label: object.label,
      access: object.access,
      lockClass: object.lockClass,
      structureClass: object.structureClass,
      environmentTags: [...object.environmentTags],
      portable: object.portable,
      contents,
    });
  }
  return result.sort((a, b) => a.id.localeCompare(b.id));
}
