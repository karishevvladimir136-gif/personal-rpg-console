import { isDeepStrictEqual } from "node:util";
import type { FoundationCommand } from "../production/contracts.ts";
import type { LoopContext, LoopPlan } from "./contracts.ts";
import { parseCommerceDefinitions } from "../commerce/index.ts";
import { assertLoopCommand, LoopError } from "./authority.ts";
import { hiddenFoundationItems } from "./visibility.ts";

function revisions<T extends { version: number }>(
  previous: T[],
  next: T[],
  key: keyof T,
) {
  for (const row of next) {
    const old = previous.find((v) => v[key] === row[key]);
    if (!old) {
      if (row.version !== 1) throw new LoopError();
      continue;
    }
    if (isDeepStrictEqual(row, old)) continue;
    if (row.version !== old.version + 1) throw new LoopError("conflict");
  }
}

/** Explicit owner correction; definitions cannot write inventory or balances. */
export function planCommerceConfiguration(
  context: LoopContext,
  command: FoundationCommand,
  raw: unknown,
): LoopPlan {
  assertLoopCommand(context, command);
  const values = parseCommerceDefinitions(raw);
  const state = structuredClone(context.state),
    world = structuredClone(context.world);
  // Public authoring DTOs never include hidden stock. Preserve those policies.
  const hiddenIds = hiddenFoundationItems(context);
  const hidden = state.itemPolicies.filter((p) => hiddenIds.has(p.itemId));
  const hiddenMerchants = state.merchants.filter((m) =>
    world.actors.some((a) => a.id === m.actorId && a.publicName === null),
  );
  if (
    values.merchants.some((m) =>
      hiddenMerchants.some((h) => h.actorId === m.actorId),
    )
  )
    throw new LoopError();
  values.merchants.push(...hiddenMerchants);
  if (
    values.itemPolicies.some(
      (p) =>
        p.visibility !== "public" || hidden.some((h) => h.itemId === p.itemId),
    )
  )
    throw new LoopError();
  values.itemPolicies.push(...hidden);
  revisions(state.currencies, values.currencies, "id");
  revisions(state.itemPolicies, values.itemPolicies, "itemId");
  revisions(state.merchants, values.merchants, "actorId");
  for (const policy of values.itemPolicies)
    if (
      !context.snapshot.items.some(
        (i) => i.id === policy.itemId && i.campaign_id === command.campaignId,
      )
    )
      throw new LoopError();
  for (const merchant of values.merchants) {
    const entity = context.snapshot.entities.find(
      (e) => e.id === merchant.entityId && e.kind === "npc",
    );
    if (
      !entity ||
      merchant.actorId !== entity.id ||
      !context.snapshot.storages.some(
        (s) => s.id === merchant.storageId && s.entity_id === entity.id,
      )
    )
      throw new LoopError();
  }
  // Ordinary known people gain a neutral Actor reference only on explicit setup.
  for (const entity of context.snapshot.entities.filter(
    (e) =>
      e.kind === "player" || values.merchants.some((m) => m.entityId === e.id),
  )) {
    if (world.actors.some((a) => a.id === entity.id)) continue;
    world.actors.push({
      id: entity.id,
      entityId: entity.id,
      campaignId: command.campaignId,
      revision: 1,
      kind: "entity",
      control: entity.kind === "player" ? "player" : "autonomous",
      publicName: entity.name,
      locationId: context.snapshot.publicState.current_location_id,
      capabilities: ["trade"],
      knowledge: [],
    });
  }
  state.version += 1;
  Object.assign(state, values);
  return {
    state,
    world,
    changes: [],
    events: [
      {
        kind: "commerce.configured",
        visibility: "private",
        text: "The owner corrected commerce definitions.",
        actorIds: [],
        threadIds: [],
        payload: {
          schemaVersion: 1,
          origin: "owner_authored",
          before: {
            currencies: context.state.currencies,
            itemPolicies: context.state.itemPolicies,
            merchants: context.state.merchants,
          },
          after: values,
        },
      },
    ],
  };
}
