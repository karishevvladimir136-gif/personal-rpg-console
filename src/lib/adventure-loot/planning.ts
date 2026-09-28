import type { LoopContext, LoopPlan } from "../foundation-loop/contracts.ts";
import type { FoundationCommand } from "../production/contracts.ts";
import type { RecordedCheck } from "../gameplay/server-contracts.ts";
import type { JsonObject } from "../gameplay/contracts.ts";
import { stableGameplayId } from "../gameplay/dice.ts";
import { itemTransferChanges } from "../commerce/transfer.ts";
import { validateCommerceContext } from "../commerce/context.ts";
import { validateProgressionCommand } from "../progression/validation.ts";
import {
  parseLootIntent,
  parseLootPolicy,
  requireLoot,
  isDeepStrictEqual,
} from "./validation.ts";
import {
  parseObjectVersion,
  readLootObject,
  type LootObjectVersion,
} from "./state.ts";
import type { LootPlanResult, LootResolution } from "./contracts.ts";

const json = (value: object): JsonObject =>
  JSON.parse(JSON.stringify(value)) as JsonObject;
function begin(context: LoopContext, command: FoundationCommand): LoopPlan {
  validateProgressionCommand(context, command);
  validateCommerceContext(context);
  return {
    state: {
      ...structuredClone(context.state),
      version: context.state.version + 1,
    },
    world: structuredClone(context.world),
    changes: [],
    events: [],
  };
}
function checkSuccess(
  command: FoundationCommand,
  actorId: string,
  objectId: string,
  requirement: { index: number; stat: string; dc: number } | null,
  checks: RecordedCheck[],
): boolean | null {
  if (!requirement) return true;
  const matches = checks.filter(
    (check) =>
      check.id ===
      stableGameplayId(command.operationId, `check:${requirement.index}`),
  );
  if (matches.length !== 1) return null;
  const check = matches[0];
  requireLoot(
    check.actorId === actorId &&
      check.targetId === objectId &&
      check.stat === requirement.stat &&
      check.kind === requirement.stat &&
      Number.isInteger(check.modifier) &&
      check.modifier >= -100 &&
      check.modifier <= 100 &&
      ["normal", "advantage", "disadvantage"].includes(check.advantage) &&
      check.dc === requirement.dc &&
      check.index === requirement.index &&
      check.total === check.kept + check.modifier &&
      check.success === check.total >= requirement.dc &&
      check.dice.length === (check.advantage === "normal" ? 1 : 2) &&
      check.dice.every(
        (value) => Number.isInteger(value) && value >= 1 && value <= 20,
      ) &&
      check.kept ===
        (check.advantage === "disadvantage"
          ? Math.min(...check.dice)
          : Math.max(...check.dice)),
    "conflict",
  );
  return check.success;
}
function final(context: LoopContext, plan: LoopPlan): LoopPlan {
  requireLoot(plan.changes.length <= 200 && plan.events.length <= 8);
  // Validate owning Item/Storage/Commerce domains against staged changes, before
  // the normal service atomically commits anything. This never mutates input.
  const snapshot = structuredClone(context.snapshot);
  for (const change of plan.changes) {
    requireLoot(change.family === "items" || change.family === "entities");
    const rows = snapshot[change.family];
    const row = rows.find((row) => row.id === change.id);
    requireLoot(
      row
        ? row.revision === change.expectedRevision
        : change.expectedRevision === null,
      "conflict",
    );
    if (row)
      Object.assign(row, structuredClone(change.values), {
        revision: row.revision + 1,
      });
    else
      (rows as unknown[]).push({
        id: change.id,
        campaign_id: context.foundation.campaignId,
        revision: 1,
        updated_at: "",
        ...structuredClone(change.values),
      });
  }
  validateCommerceContext({
    ...context,
    state: plan.state,
    world: plan.world,
    foundation: { ...context.foundation, world: plan.world },
    snapshot,
  });
  return plan;
}
function persist(
  plan: LoopPlan,
  previous: LootObjectVersion,
  next: LootObjectVersion,
  actorId: string,
  publicText: string,
) {
  next.expectedObjectRevision = previous.object.revision;
  next.object.revision = previous.object.revision + 1;
  next.authority = "settlement";
  parseObjectVersion(next);
  plan.events.push({
    kind: "loot.object.changed",
    visibility: "private",
    text: "A bounded object consequence was settled.",
    actorIds: [actorId],
    threadIds: [],
    payload: json(next),
  });
  plan.events.push({
    kind: "loot.object.observed",
    visibility: "public",
    text: publicText,
    actorIds: [actorId],
    threadIds: [],
    payload: {},
  });
}
function establish(
  context: LoopContext,
  plan: LoopPlan,
  state: LootObjectVersion,
) {
  const object = state.object;
  requireLoot(
    !context.snapshot.items.some(
      (item) => item.storage_id === object.storageId,
    ),
    "conflict",
  );
  object.contentsEstablished = true;
  object.materializationId = stableGameplayId(
    object.id,
    "loot:materialization-v1",
  );
  for (const definition of state.policy.contents) {
    const itemId = stableGameplayId(object.id, `loot:item:${definition.key}`);
    requireLoot(
      !context.snapshot.items.some((row) => row.id === itemId),
      "conflict",
    );
    const visible = JSON.stringify(definition.visible);
    for (const secret of [
      definition.private.trueIdentity,
      definition.private.provenance,
      ...definition.private.properties,
    ])
      if (secret) requireLoot(!visible.includes(secret));
    plan.changes.push({
      family: "items",
      id: itemId,
      expectedRevision: null,
      values: {
        ...definition.visible,
        owner_entity_id: object.ownerEntityId,
        storage_id: object.storageId,
        equipped_entity_id: null,
        equipped_slot: null,
      },
    });
    plan.state.itemPolicies.push({
      ...definition.commerce,
      itemId,
      version: 1,
    });
    state.privateItems.push({
      itemId,
      fragile: definition.fragile,
      hidden: structuredClone(definition.private),
    });
  }
}
export function planLootAction(
  context: LoopContext,
  command: FoundationCommand,
  rawIntent: unknown,
  resolution: LootResolution,
): LootPlanResult {
  const plan = begin(context, command),
    intent = parseLootIntent(rawIntent);
  const previous = readLootObject(context, intent.objectId);
  if (!previous) return { status: "paused", reason: "unsupported" };
  const next = structuredClone(previous),
    object = next.object;
  const policy = parseLootPolicy(resolution.policy);
  requireLoot(
    isDeepStrictEqual(policy, next.policy) &&
      isDeepStrictEqual(policy.profile, context.state.profile),
    "conflict",
  );
  const actor = context.world.actors.find(
    (actor) =>
      actor.id === intent.actorId &&
      actor.control === "player" &&
      actor.entityId !== null,
  );
  const entity = context.snapshot.entities.find(
    (entity) => entity.id === actor?.entityId,
  );
  requireLoot(
    actor &&
      entity &&
      (entity.hp === null || entity.hp > 0) &&
      actor.locationId === object.locationId &&
      context.snapshot.publicState.current_location_id === object.locationId,
    "unavailable",
  );
  const storage = context.snapshot.storages.find(
    (row) => row.id === object.storageId,
  );
  requireLoot(
    storage &&
      storage.entity_id === object.ownerEntityId &&
      context.snapshot.locations.some((row) => row.id === object.locationId),
  );
  requireLoot(
    object.knownBy.every((id) =>
      context.world.actors.some((actor) => actor.id === id),
    ),
  );
  if (intent.kind === "search") {
    const success = checkSuccess(
      command,
      entity.id,
      object.id,
      policy.discoveryCheck,
      resolution.checks,
    );
    if (success === null)
      return { status: "paused", reason: "review_required" };
    if (success) {
      object.knownBy = [...new Set([...object.knownBy, actor.id])];
      if (["open", "broken"].includes(object.access)) {
        if (!object.contentsEstablished) establish(context, plan, next);
        object.contentsKnownBy = [
          ...new Set([...object.contentsKnownBy, actor.id]),
        ];
      }
    }
    persist(
      plan,
      previous,
      next,
      actor.id,
      success
        ? "The available object was inspected."
        : "The search found no new information.",
    );
  } else if (intent.kind === "access") {
    requireLoot(object.knownBy.includes(actor.id), "unavailable");
    const route = policy.approaches.find(
      (route) => route.id === intent.approachId,
    );
    if (!route) return { status: "paused", reason: "unsupported" };
    requireLoot(
      actor.capabilities.includes(route.capability) &&
        route.from.includes(object.access) &&
        (route.lockClass === null || route.lockClass === object.lockClass) &&
        (route.structureClass === null ||
          route.structureClass === object.structureClass) &&
        route.environmentTags.every((tag) =>
          object.environmentTags.includes(tag),
        ) &&
        (!route.requiresPortable || object.portable === true),
      "unavailable",
    );
    requireLoot(
      route.requiredItemIds.every((id) =>
        context.snapshot.items.some(
          (item) =>
            item.id === id &&
            item.owner_entity_id === entity.id &&
            item.quantity > 0,
        ),
      ),
      "unavailable",
    );
    if (route.resourceCost) {
      const balance = entity.resources[route.resourceCost.resource];
      requireLoot(
        Number.isSafeInteger(balance) && balance >= route.resourceCost.amount,
        "unavailable",
      );
    }
    const success = checkSuccess(
      command,
      entity.id,
      object.id,
      route.check,
      resolution.checks,
    );
    if (success === null)
      return { status: "paused", reason: "review_required" };
    if (route.resourceCost)
      plan.changes.push({
        family: "entities",
        id: entity.id,
        expectedRevision: entity.revision,
        values: {
          resources: {
            ...entity.resources,
            [route.resourceCost.resource]:
              entity.resources[route.resourceCost.resource] -
              route.resourceCost.amount,
          },
        },
      });
    if (success) {
      object.access = route.to;
      if (route.fragileLoss > 0) {
        if (!object.contentsEstablished)
          return { status: "paused", reason: "review_required" };
        for (const entry of next.privateItems.filter((item) => item.fragile)) {
          const item = context.snapshot.items.find(
            (row) =>
              row.id === entry.itemId && row.storage_id === object.storageId,
          );
          if (item && item.quantity > 0)
            plan.changes.push({
              family: "items",
              id: item.id,
              expectedRevision: item.revision,
              values: {
                quantity: Math.max(0, item.quantity - route.fragileLoss),
              },
            });
        }
      }
      if (route.noise)
        plan.events.push({
          kind: "loot.noise",
          visibility: "public",
          text: "The action makes an audible crash nearby.",
          actorIds: [actor.id],
          threadIds: [],
          payload: {},
        });
    }
    persist(
      plan,
      previous,
      next,
      actor.id,
      success
        ? "The object access changed."
        : "The object access did not change.",
    );
  } else {
    requireLoot(
      object.contentsEstablished &&
        ["open", "broken"].includes(object.access) &&
        object.contentsKnownBy.includes(actor.id),
      "unavailable",
    );
    const item = context.snapshot.items.find(
      (row) => row.id === intent.itemId && row.storage_id === object.storageId,
    );
    requireLoot(
      item && item.owner_entity_id === object.ownerEntityId,
      "unavailable",
    );
    const transfer = itemTransferChanges(context, command, {
      itemId: intent.itemId,
      quantity: intent.quantity,
      sourceEntityId: object.ownerEntityId,
      destinationEntityId: entity.id,
      destinationStorageId: intent.destinationStorageId,
    });
    plan.changes.push(...transfer.changes);
    const transferred = {
      ...transfer.itemPolicy,
      origin:
        object.ownerEntityId === entity.id
          ? transfer.itemPolicy.origin
          : ("stolen" as const),
    };
    if (!transfer.split) transferred.version++;
    plan.state.itemPolicies = plan.state.itemPolicies.filter(
      (policy) => policy.itemId !== transferred.itemId,
    );
    plan.state.itemPolicies.push(transferred);
    const hidden = next.privateItems.find((row) => row.itemId === item.id);
    if (hidden && transfer.split)
      next.privateItems.push({
        ...structuredClone(hidden),
        itemId: transfer.transferredItemId,
      });
    persist(
      plan,
      previous,
      next,
      actor.id,
      "An available item was transferred.",
    );
    plan.events.push({
      kind: "loot.item.transferred",
      visibility: "private",
      text: "Item ownership and provenance were settled.",
      actorIds: [actor.id],
      threadIds: [],
      payload: {
        schemaVersion: 1,
        objectId: object.id,
        sourceItemId: item.id,
        transferredItemId: transfer.transferredItemId,
        quantity: intent.quantity,
        legalOwnerEntityId: object.ownerEntityId,
        origin: transferred.origin,
      },
    });
  }
  return { status: "planned", plan: final(context, plan) };
}
export function planLootObjectCorrection(
  context: LoopContext,
  command: FoundationCommand,
  rawVersion: unknown,
  authenticatedOwnerId: string,
): LoopPlan {
  const plan = begin(context, command);
  requireLoot(
    authenticatedOwnerId === context.foundation.ownerId,
    "unavailable",
  );
  const next = parseObjectVersion(rawVersion),
    before = readLootObject(context, next.object.id);
  requireLoot(
    next.authority === "owner" &&
      next.object.campaignId === context.foundation.campaignId &&
      next.expectedObjectRevision === (before?.object.revision ?? null) &&
      next.object.revision === (before?.object.revision ?? 0) + 1,
    "conflict",
  );
  requireLoot(isDeepStrictEqual(next.policy.profile, context.state.profile));
  requireLoot(
    context.snapshot.storages.some(
      (row) =>
        row.id === next.object.storageId &&
        row.entity_id === next.object.ownerEntityId,
    ) &&
      context.snapshot.locations.some(
        (row) => row.id === next.object.locationId,
      ),
  );
  if (before)
    requireLoot(
      next.object.storageId === before.object.storageId &&
        (!before.object.contentsEstablished ||
          next.object.contentsEstablished) &&
        next.object.materializationId === before.object.materializationId &&
        next.policy.id === before.policy.id &&
        (isDeepStrictEqual(next.policy, before.policy) ||
          next.policy.version === before.policy.version + 1),
      "conflict",
    );
  requireLoot(
    next.object.knownBy.every((id) =>
      context.world.actors.some((actor) => actor.id === id),
    ) &&
      next.privateItems.every((entry) =>
        context.snapshot.items.some((item) => item.id === entry.itemId),
      ),
  );
  plan.events.push({
    kind: before ? "loot.object.corrected" : "loot.object.configured",
    visibility: "private",
    text: "The owner approved bounded object facts.",
    actorIds: [],
    threadIds: [],
    payload: json(next),
  });
  return final(context, plan);
}
