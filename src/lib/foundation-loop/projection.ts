import { randomUUID } from "node:crypto";
import type { FoundationLoopView } from "./client-contracts.ts";
import type { LoopContext } from "./contracts.ts";
import { projectCommerce, CommerceValidationError } from "../commerce/index.ts";
import { projectPublicProgression } from "../progression/index.ts";
import {
  planApplicableReward,
  publicRewardIntegrity,
} from "../progression/reward-integrity-authority.ts";
import { loopCommand } from "./authority.ts";
import { hiddenFoundationItems } from "./visibility.ts";

function approvedCreationFacts(context: LoopContext, playerId: string) {
  const events = context.events.filter((event) =>
    event.schemaVersion === 1 &&
    event.campaignId === context.foundation.campaignId &&
    event.kind === "campaign.bootstrap.created" &&
    event.visibility === "private" &&
    event.payload.schemaVersion === 1 &&
    event.payload.classification === "owner_authored_protagonist" &&
    event.payload.heroId === playerId,
  );
  if (events.length !== 1) return null;
  const review = events[0].payload.review;
  if (!review || typeof review !== "object" || Array.isArray(review))
    return null;
  const lines = (value: unknown): value is string[] =>
    Array.isArray(value) && value.length <= 24 &&
    value.every((line) => typeof line === "string" &&
      line.trim().length > 0 && line.length <= 200);
  if (!lines(review.capabilities) || !lines(review.limitations)) return null;
  return { capabilities: review.capabilities, limitations: review.limitations };
}

/** Public and owner-authoring fields only. There is no projection of a private receipt. */
export function foundationLoopProjection(
  context: LoopContext,
): FoundationLoopView {
  const { foundation, state, snapshot, world } = context;
  const privateIds = hiddenFoundationItems(context);
  const player = snapshot.entities.find((e) =>
    e.kind === "player" && e.campaign_id === foundation.campaignId);
  const playerActor = player && world.actors.find((actor) =>
    actor.campaignId === foundation.campaignId && actor.control === "player" &&
    actor.entityId === player.id && actor.publicName !== null);
  const creationFacts = player ? approvedCreationFacts(context, player.id) : null;
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
      planApplicableReward(context, loopCommand(context, randomUUID()), {
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
    playerCharacter: player && playerActor && creationFacts ? {
      entityId: player.id,
      capabilities: creationFacts.capabilities.filter((fact) =>
        playerActor.capabilities.includes(fact)),
      limitations: creationFacts.limitations.filter((fact) =>
        (playerActor.limitations ?? []).includes(fact)),
    } : null,
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
      rewardIntegrity: publicRewardIntegrity(
        context,
        new Set(rewards.map((r) => r.id)),
      ),
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
