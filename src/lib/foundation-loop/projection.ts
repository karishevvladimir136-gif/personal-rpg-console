import { randomUUID } from "node:crypto";
import type { FoundationLoopView } from "./client-contracts.ts";
import type { LoopContext } from "./contracts.ts";
import { projectCommerce, CommerceValidationError } from "../commerce/index.ts";
import { planReward, projectPublicProgression } from "../progression/index.ts";
import { loopCommand } from "./authority.ts";
import { hiddenFoundationItems } from "./visibility.ts";

/** Public and owner-authoring fields only. There is no projection of a private receipt. */
export function foundationLoopProjection(
  context: LoopContext,
): FoundationLoopView {
  const { foundation, state, snapshot, world } = context;
  const privateIds = hiddenFoundationItems(context);
  const player = snapshot.entities.find((e) => e.kind === "player");
  let commerce: FoundationLoopView["commerce"] = null;
  if (player) {
    try {
      commerce = projectCommerce(context, player.id);
    } catch (error) {
      if (
        !(error instanceof CommerceValidationError) ||
        !["unavailable", "configuration"].includes(error.code)
      )
        throw error;
    }
  }
  const sources: FoundationLoopView["owner"]["sources"] = [
    ...snapshot.quests.map((q) => ({
      kind: "quest" as const,
      id: q.id,
      label: q.title,
    })),
    ...world.threads
      .filter((t) => t.publicTitle !== null)
      .map((t) => ({
        kind: "thread" as const,
        id: t.id,
        label: t.publicTitle!,
      })),
    ...context.events
      .filter(
        (e) =>
          e.visibility === "public" &&
          ["world.logic.resolved", "world.thread.advanced"].includes(e.kind),
      )
      .map((e) => ({ kind: "event" as const, id: e.id, label: e.text })),
  ];
  const rewards = state.rewards.filter(
    (r) =>
      sources.some((s) => s.kind === r.source.kind && s.id === r.source.id) &&
      r.entries.every((e) => e.kind !== "item" || !privateIds.has(e.itemId)) &&
      r.recipientIds.every(
        (id) =>
          !world.actors.some((a) => a.entityId === id && a.publicName === null),
      ),
  );
  const availableRewards = rewards.flatMap((r) => {
    try {
      planReward(context, loopCommand(context, randomUUID()), {
        rewardId: r.id,
        expectedRewardVersion: r.version,
      });
      return [{ id: r.id, version: r.version, label: r.label }];
    } catch {
      return [];
    }
  });
  const policies = state.itemPolicies.filter(
    (p) => p.visibility === "public" && !privateIds.has(p.itemId),
  );
  const command = loopCommand(context, randomUUID());
  const { operationId: _operation, ...fence } = command;
  void _operation;
  return {
    campaignId: foundation.campaignId,
    command: fence,
    profile: structuredClone(foundation.ruleset),
    stateVersion: state.version,
    commerce,
    progression: projectPublicProgression(context),
    availableRewards,
    owner: {
      currencies: structuredClone(state.currencies),
      itemPolicies: structuredClone(policies),
      merchants: structuredClone(
        state.merchants.filter((m) =>
          world.actors.some((a) => a.id === m.actorId && a.publicName !== null),
        ),
      ),
      progression: state.progression,
      tracks: structuredClone(state.tracks),
      rewards: structuredClone(rewards),
      entities: snapshot.entities
        .filter(
          (e) =>
            !world.actors.some(
              (a) => a.entityId === e.id && a.publicName === null,
            ),
        )
        .map((e) => ({ id: e.id, name: e.name, kind: e.kind })),
      storages: snapshot.storages
        .filter(
          (s) =>
            !world.actors.some(
              (a) => a.entityId === s.entity_id && a.publicName === null,
            ),
        )
        .map((s) => ({ id: s.id, name: s.name, entityId: s.entity_id })),
      items: snapshot.items
        .filter((i) => !privateIds.has(i.id))
        .map((i) => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          ownerEntityId: i.owner_entity_id,
          storageId: i.storage_id,
        })),
      sources,
    },
    history: context.events
      .filter((e) => e.visibility === "public")
      .slice(-20)
      .map((e) => ({ id: e.id, text: e.text, worldMinutes: e.worldMinutes })),
  };
}
