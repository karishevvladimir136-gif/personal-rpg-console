import type { LoopContext } from "./contracts.ts";

/** A hidden owning Actor/storage hides the entire stock row and its definitions. */
export function hiddenFoundationItems(context: LoopContext): Set<string> {
  const hidden = new Set(
    context.world.actors
      .filter((a) => a.publicName === null)
      .map((a) => a.entityId),
  );
  return new Set([
    ...context.state.itemPolicies
      .filter((p) => p.visibility === "private")
      .map((p) => p.itemId),
    ...context.snapshot.items
      .filter(
        (i) =>
          hidden.has(i.owner_entity_id ?? "") ||
          context.snapshot.storages.some(
            (s) => s.id === i.storage_id && hidden.has(s.entity_id ?? ""),
          ),
      )
      .map((i) => i.id),
  ]);
}
