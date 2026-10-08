import { isDeepStrictEqual } from "node:util";
import { stableGameplayId } from "../gameplay/dice.ts";
import { settledCurrencyBalance } from "./settlement-core.ts";
import type { RecordChange } from "../gameplay/server-contracts.ts";
import type { Item } from "../persistence/contracts.ts";
import type { FoundationCommand } from "../production/contracts.ts";
import type {
  CharacterProgress,
  LoopContext,
  LoopPlan,
  ProgressionTrack,
  RewardSource,
} from "../foundation-loop/contracts.ts";
import {
  fields,
  identifier,
  integer,
  list,
  MAX_PENDING,
  MAX_RESOURCE,
  parseProgress,
  parseProgressionTrack,
  parseRewardDefinition,
  parseRewardSource,
  requireProgression,
  unique,
  uuid,
  validateProgressionCommand,
  validateProgressionContext,
} from "./validation.ts";

export type RewardClaim = { rewardId: string; expectedRewardVersion: number };
export type AdvancementChoice = {
  pendingId: string;
  optionId: string;
  expectedTrackVersion: number;
};
export type ProgressionCorrection = CharacterProgress & {
  expectedTrackVersion: number;
};
export type ProgressionDefinitions = {
  progression: "off" | "on";
  tracks: LoopContext["state"]["tracks"];
  rewards: LoopContext["state"]["rewards"];
};

/** A source is a single package entitlement. Renaming/versioning a definition or changing recipients cannot reset it. */
export function rewardEntitlementId(
  campaignId: string,
  source: RewardSource,
): string {
  uuid(campaignId);
  parseRewardSource(source);
  return stableGameplayId(
    campaignId,
    `reward-entitlement-v1:${source.kind}:${source.id}`,
  );
}

function begin(context: LoopContext, command: FoundationCommand): LoopPlan {
  validateProgressionCommand(context, command);
  const state = structuredClone(context.state);
  state.version += 1;
  integer(state.version, 1);
  return {
    state,
    world: structuredClone(context.world),
    changes: [],
    events: [],
  };
}

function finish(context: LoopContext, plan: LoopPlan): LoopPlan {
  requireProgression(plan.changes.length <= 200);
  validateProgressionContext({
    ...context,
    state: plan.state,
    world: plan.world,
  });
  assertPendingCapacity(plan);
  return plan;
}

function actorIds(
  context: LoopContext,
  entityIds: string[],
  publicOnly = false,
): string[] {
  return context.world.actors
    .filter(
      (actor) =>
        actor.entityId !== null &&
        entityIds.includes(actor.entityId) &&
        (!publicOnly || actor.publicName !== null),
    )
    .map((actor) => actor.id);
}

function assertUnclaimed(context: LoopContext, source: RewardSource) {
  const entitlementId = rewardEntitlementId(
    context.foundation.campaignId,
    source,
  );
  for (const event of context.events.filter(
    (event) => event.kind === "reward.granted",
  )) {
    // The service supplies inherited history plus same-timeline vaulted receipts, never sibling future Events.
    const receiptSource = parseRewardSource(event.payload.source);
    const expected = rewardEntitlementId(
      context.foundation.campaignId,
      receiptSource,
    );
    requireProgression(
      event.visibility === "private" &&
        event.payload.schemaVersion === 1 &&
        event.payload.entitlementId === expected,
    );
    requireProgression(expected !== entitlementId, "reward_claimed");
  }
  return entitlementId;
}

function assertEligible(context: LoopContext, source: RewardSource) {
  if (source.kind === "quest") {
    requireProgression(
      context.snapshot.quests.some(
        (quest) => quest.id === source.id && quest.status === "complete",
      ),
      "source_ineligible",
    );
  } else if (source.kind === "thread") {
    const thread = context.world.threads.find(
      (thread) => thread.id === source.id,
    );
    requireProgression(
      thread?.status === "resolved" && thread.cursor === thread.steps.length,
      "source_ineligible",
    );
    requireProgression(
      thread.steps.every((step) =>
        step.evidence.every(
          (evidence) =>
            evidence.knowledge !== "future_source" &&
            evidence.knowledge !== "source",
        ),
      ),
      "source_ineligible",
    );
  } else {
    const event = context.events.find((event) => event.id === source.id);
    requireProgression(
      event &&
        event.worldMinutes <= context.foundation.worldMinutes &&
        ["world.thread.advanced", "world.logic.resolved"].includes(
          event.kind,
        ) &&
        event.evidence.every(
          (evidence) =>
            evidence.knowledge !== "future_source" &&
            evidence.knowledge !== "source",
        ),
      "source_ineligible",
    );
  }
}

/** Integer totals are conserved; a stable recipient order owns the indivisible remainder. */
function shares(total: number, recipients: readonly string[]) {
  const each = Math.floor(total / recipients.length);
  const remainder = total % recipients.length;
  return recipients.map((entityId, index) => ({
    entityId,
    amount: each + (index < remainder ? 1 : 0),
  }));
}

function progressFor(plan: LoopPlan, entityId: string, trackId: string) {
  let progress = plan.state.progress.find(
    (row) => row.entityId === entityId && row.trackId === trackId,
  );
  if (!progress) {
    progress = { entityId, trackId, value: 0, rank: 0, unlocks: [] };
    plan.state.progress.push(progress);
  }
  return progress;
}

function availableCapabilities(plan: LoopPlan, entityId: string) {
  return new Set([
    ...plan.state.progress
      .filter((row) => row.entityId === entityId)
      .flatMap((row) => row.unlocks),
    ...plan.world.actors
      .filter((actor) => actor.entityId === entityId)
      .flatMap((actor) => actor.capabilities),
  ]);
}

function assertPendingCapacity(plan: LoopPlan) {
  for (const entityId of new Set(
    plan.state.pending.map((row) => row.entityId),
  )) {
    const owned = availableCapabilities(plan, entityId);
    const pending = plan.state.pending.filter(
      (row) =>
        row.entityId === entityId &&
        row.trackVersion ===
          plan.state.tracks.find((track) => track.id === row.trackId)?.version,
    );
    // Every pending rank must have a distinct supported future choice. A small
    // bipartite match also catches overlapping options across independent tracks.
    requireProgression(
      owned.size + pending.length <= 32,
      "advancement_unavailable",
    );
    const assignment = new Map<string, number>();
    const match = (index: number, visited: Set<string>): boolean => {
      for (const option of pending[index].options) {
        if (owned.has(option.capability) || visited.has(option.capability))
          continue;
        visited.add(option.capability);
        const previous = assignment.get(option.capability);
        if (previous === undefined || match(previous, visited)) {
          assignment.set(option.capability, index);
          return true;
        }
      }
      return false;
    };
    pending.forEach((_, index) =>
      requireProgression(match(index, new Set()), "advancement_unavailable"),
    );
  }
}

function openAdvancements(
  plan: LoopPlan,
  track: ProgressionTrack,
  progress: CharacterProgress,
  provenanceId: string,
  preserveCorrectedRank = false,
) {
  const earnedRank = track.thresholds.filter(
    (threshold) => progress.value >= threshold,
  ).length;
  if (!track.choices.length) {
    if (!preserveCorrectedRank)
      progress.rank = Math.max(progress.rank, earnedRank);
    return;
  }
  const prior = plan.state.pending.filter(
    (row) => row.entityId === progress.entityId && row.trackId === track.id,
  );
  requireProgression(
    prior.every((row) => row.trackVersion === track.version),
    "advancement_unavailable",
  );
  const owned = availableCapabilities(plan, progress.entityId);
  const options = track.choices.filter(
    (choice) => !owned.has(choice.capability),
  );
  requireProgression(
    options.length >= earnedRank - progress.rank,
    "advancement_unavailable",
  );
  for (let rank = progress.rank + 1; rank <= earnedRank; rank += 1) {
    if (prior.some((row) => row.rank === rank)) continue;
    plan.state.pending.push({
      id: stableGameplayId(
        provenanceId,
        `advancement-v1:${progress.entityId}:${track.id}:${rank}`,
      ),
      entityId: progress.entityId,
      trackId: track.id,
      trackVersion: track.version,
      rank,
      options: structuredClone(options),
    });
  }
  requireProgression(plan.state.pending.length <= MAX_PENDING);
}

function destination(context: LoopContext, entityId: string) {
  const storage = context.snapshot.storages
    .filter((row) => row.entity_id === entityId)
    .sort((a, b) => a.id.localeCompare(b.id))[0];
  requireProgression(storage);
  return storage.id;
}

function transferItem(
  context: LoopContext,
  plan: LoopPlan,
  item: Item,
  quantity: number,
  recipients: string[],
  entitlementId: string,
) {
  integer(item.quantity, 0, MAX_RESOURCE);
  requireProgression(
    item.quantity >= quantity &&
      !recipients.includes(item.owner_entity_id ?? ""),
  );
  requireProgression(
    context.snapshot.storages.some((storage) => storage.id === item.storage_id),
  );
  const portions = shares(quantity, recipients).filter(
    (share) => share.amount > 0,
  );
  const transfers: {
    sourceItemId: string;
    itemId: string;
    entityId: string;
    storageId: string;
    quantity: number;
  }[] = [];
  if (item.quantity > quantity) {
    plan.changes.push({
      family: "items",
      id: item.id,
      expectedRevision: item.revision,
      values: { quantity: item.quantity - quantity },
    });
  }
  for (const [index, share] of portions.entries()) {
    const storageId = destination(context, share.entityId);
    const keepsIdentity =
      item.quantity === quantity && index === portions.length - 1;
    const id = keepsIdentity
      ? item.id
      : stableGameplayId(
          entitlementId,
          `reward-item-v1:${item.id}:${share.entityId}`,
        );
    requireProgression(
      keepsIdentity ||
        (!context.snapshot.items.some((row) => row.id === id) &&
          !plan.changes.some((change) => change.id === id)),
    );
    const values = {
      quantity: share.amount,
      owner_entity_id: share.entityId,
      storage_id: storageId,
      equipped_entity_id: null,
      equipped_slot: null,
    };
    plan.changes.push({
      family: "items",
      id,
      expectedRevision: keepsIdentity ? item.revision : null,
      values: keepsIdentity
        ? values
        : {
            name: item.name,
            category: item.category,
            description: item.description,
            mechanics: item.mechanics,
            ...values,
          },
    });
    if (!keepsIdentity) {
      const policy = plan.state.itemPolicies.find(
        (row) => row.itemId === item.id,
      );
      if (policy)
        plan.state.itemPolicies.push({ ...policy, itemId: id, version: 1 });
    }
    transfers.push({
      sourceItemId: item.id,
      itemId: id,
      entityId: share.entityId,
      storageId,
      quantity: share.amount,
    });
  }
  return transfers;
}

export function planReward(
  context: LoopContext,
  command: FoundationCommand,
  input: RewardClaim,
): LoopPlan {
  const plan = begin(context, command);
  fields(input, ["rewardId", "expectedRewardVersion"]);
  identifier(input.rewardId);
  integer(input.expectedRewardVersion, 1);
  const reward = plan.state.rewards.find((row) => row.id === input.rewardId);
  requireProgression(
    reward && reward.version === input.expectedRewardVersion,
    "stale_progression",
  );
  const entitlementId = assertUnclaimed(context, reward.source);
  assertEligible(context, reward.source);
  const recipients = [...reward.recipientIds].sort();
  const pendingBefore = new Set(plan.state.pending.map((row) => row.id));
  const entries: Record<string, unknown>[] = [];
  const entities = new Map<string, RecordChange>();
  for (const entry of reward.entries) {
    if (entry.kind === "progression") {
      const distribution = shares(entry.amount, recipients);
      if (plan.state.progression === "on") {
        const track = plan.state.tracks.find(
          (track) => track.id === entry.trackId,
        )!;
        for (const share of distribution.filter((share) => share.amount > 0)) {
          const progress = progressFor(plan, share.entityId, entry.trackId);
          progress.value += share.amount;
          integer(progress.value);
          openAdvancements(plan, track, progress, entitlementId);
        }
      }
      entries.push({
        ...entry,
        status: plan.state.progression === "on" ? "applied" : "off",
        distribution,
      });
    } else if (entry.kind === "currency") {
      const currency = plan.state.currencies.find(
        (row) => row.id === entry.currencyId,
      )!;
      const distribution = shares(entry.amount, recipients);
      for (const share of distribution.filter((share) => share.amount > 0)) {
        const entity = context.snapshot.entities.find(
          (row) => row.id === share.entityId,
        )!;
        const prior = entities.get(entity.id);
        const resources = structuredClone(
          prior?.values.resources ?? entity.resources,
        ) as Record<string, number>;
        const balance = resources[currency.resourceKey] ?? 0;
        integer(balance, 0, MAX_RESOURCE);
        resources[currency.resourceKey] = settledCurrencyBalance(balance, share.amount);
        requireProgression(Object.keys(resources).length <= 50);
        entities.set(entity.id, {
          family: "entities",
          id: entity.id,
          expectedRevision: entity.revision,
          values: { resources },
        });
      }
      entries.push({ ...entry, distribution });
    } else {
      const item = context.snapshot.items.find(
        (row) => row.id === entry.itemId,
      )!;
      entries.push({
        ...entry,
        transfers: transferItem(
          context,
          plan,
          item,
          entry.quantity,
          recipients,
          entitlementId,
        ),
      });
    }
  }
  plan.changes.push(...entities.values());
  plan.events.push({
    kind: "reward.granted",
    visibility: "private",
    text: "An approved source reward was settled.",
    actorIds: actorIds(context, recipients),
    threadIds: reward.source.kind === "thread" ? [reward.source.id] : [],
    payload: {
      schemaVersion: 1,
      entitlementId,
      source: structuredClone(reward.source),
      rewardId: reward.id,
      rewardVersion: reward.version,
      profile: structuredClone(plan.state.profile),
      recipients,
      entries,
      pendingIds: plan.state.pending
        .filter((row) => !pendingBefore.has(row.id))
        .map((row) => row.id),
    },
  });
  // No package labels, source identities, future opportunities or private reasons enter player narration.
  const publicRecipients = recipients.filter((id) =>
    isPublicEntity(context, id),
  );
  if (publicRecipients.length)
    plan.events.push({
      kind: "progression.updated",
      visibility: "public",
      text: "Recorded rewards were applied.",
      actorIds: actorIds(context, publicRecipients, true),
      threadIds: [],
      payload: {},
    });
  return finish(context, plan);
}

function installCapabilities(
  context: LoopContext,
  plan: LoopPlan,
  entityId: string,
  before: string[],
  after: string[],
) {
  let actor = plan.world.actors.find((actor) => actor.entityId === entityId);
  if (!actor) {
    const entity = context.snapshot.entities.find(
      (entity) => entity.id === entityId,
    )!;
    requireProgression(plan.world.actors.length < 256 && entity);
    actor = {
      id: entity.id,
      campaignId: context.foundation.campaignId,
      revision: 0,
      kind: "entity",
      entityId,
      control:
        entity.kind === "player" || entity.kind === "companion"
          ? "player"
          : "autonomous",
      publicName:
        entity.kind === "player" || entity.kind === "companion"
          ? entity.name
          : null,
      locationId: null,
      capabilities: [],
      knowledge: [],
    };
    plan.world.actors.push(actor);
  }
  const retainedElsewhere = new Set(
    plan.state.progress
      .filter((row) => row.entityId === entityId)
      .flatMap((row) => row.unlocks),
  );
  actor.capabilities = [
    ...new Set([
      ...actor.capabilities.filter(
        (capability) =>
          !before.includes(capability) ||
          after.includes(capability) ||
          retainedElsewhere.has(capability),
      ),
      ...after,
    ]),
  ];
  requireProgression(actor.capabilities.length <= 32);
  actor.revision += 1;
  integer(actor.revision, 1);
}

export function planAdvancement(
  context: LoopContext,
  command: FoundationCommand,
  input: AdvancementChoice,
): LoopPlan {
  const plan = begin(context, command);
  fields(input, ["pendingId", "optionId", "expectedTrackVersion"]);
  uuid(input.pendingId);
  identifier(input.optionId);
  integer(input.expectedTrackVersion, 1);
  requireProgression(
    plan.state.progression === "on",
    "advancement_unavailable",
  );
  const pending = plan.state.pending.find((row) => row.id === input.pendingId);
  requireProgression(pending, "advancement_unavailable");
  const track = plan.state.tracks.find((row) => row.id === pending.trackId)!;
  requireProgression(
    input.expectedTrackVersion === pending.trackVersion &&
      pending.trackVersion === track.version,
    "stale_progression",
  );
  const progress = progressFor(plan, pending.entityId, pending.trackId);
  requireProgression(
    pending.rank === progress.rank + 1 &&
      progress.value >= track.thresholds[pending.rank - 1],
    "advancement_unavailable",
  );
  const option = pending.options.find((row) => row.id === input.optionId);
  requireProgression(
    option && track.choices.some((choice) => isDeepStrictEqual(choice, option)),
    "advancement_unavailable",
  );
  requireProgression(
    !availableCapabilities(plan, pending.entityId).has(option.capability),
    "advancement_unavailable",
  );
  const before = structuredClone(progress);
  progress.rank = pending.rank;
  progress.unlocks.push(option.capability);
  plan.state.pending = plan.state.pending.filter(
    (row) => row.id !== pending.id,
  );
  // Other pending choices remain earned, but never offer an already owned capability.
  for (const row of plan.state.pending.filter(
    (row) => row.entityId === pending.entityId,
  )) {
    row.options = row.options.filter(
      (choice) => choice.capability !== option.capability,
    );
    requireProgression(row.options.length > 0, "advancement_unavailable");
  }
  installCapabilities(
    context,
    plan,
    pending.entityId,
    before.unlocks,
    progress.unlocks,
  );
  plan.events.push({
    kind: "progression.advanced",
    visibility: "private",
    text: "An earned advancement choice was selected.",
    actorIds: [pending.entityId],
    threadIds: [],
    payload: {
      schemaVersion: 1,
      pendingId: pending.id,
      trackVersion: pending.trackVersion,
      option: structuredClone(option),
      before,
      after: structuredClone(progress),
    },
  });
  if (isPublicEntity(context, pending.entityId))
    plan.events.push({
      kind: "progression.updated",
      visibility: "public",
      text: "An earned advancement was recorded.",
      actorIds: [pending.entityId],
      threadIds: [],
      payload: {},
    });
  return finish(context, plan);
}

/** Explicit owner reconciliation preserves source receipts and distinguishes a corrected baseline from earned history. */
export function planProgressionCorrection(
  context: LoopContext,
  command: FoundationCommand,
  input: ProgressionCorrection,
): LoopPlan {
  const plan = begin(context, command);
  fields(input, [
    "entityId",
    "trackId",
    "expectedTrackVersion",
    "value",
    "rank",
    "unlocks",
  ]);
  integer(input.expectedTrackVersion, 1);
  const { expectedTrackVersion, ...values } = input;
  const corrected = parseProgress(values);
  const track = plan.state.tracks.find((row) => row.id === corrected.trackId);
  requireProgression(
    track && track.version === expectedTrackVersion,
    "stale_progression",
  );
  requireProgression(
    context.snapshot.entities.some(
      (row) =>
        row.id === corrected.entityId &&
        ["player", "companion", "npc"].includes(row.kind),
    ),
  );
  requireProgression(corrected.rank <= track.thresholds.length);
  const previous = plan.state.progress.find(
    (row) =>
      row.entityId === corrected.entityId && row.trackId === corrected.trackId,
  );
  const before = previous ? structuredClone(previous) : null;
  requireProgression(
    corrected.unlocks.every(
      (capability) =>
        track.choices.some((option) => option.capability === capability) ||
        before?.unlocks.includes(capability),
    ),
  );
  plan.state.progress = plan.state.progress.filter(
    (row) =>
      row.entityId !== corrected.entityId || row.trackId !== corrected.trackId,
  );
  plan.state.progress.push(corrected);
  const supersededPendingIds = plan.state.pending
    .filter(
      (row) =>
        row.entityId === corrected.entityId &&
        row.trackId === corrected.trackId,
    )
    .map((row) => row.id);
  plan.state.pending = plan.state.pending.filter(
    (row) => !supersededPendingIds.includes(row.id),
  );
  installCapabilities(
    context,
    plan,
    corrected.entityId,
    before?.unlocks ?? [],
    corrected.unlocks,
  );
  openAdvancements(plan, track, corrected, command.operationId, true);
  plan.events.push({
    kind: "progression.corrected",
    visibility: "private",
    text: "The owner corrected a progression baseline.",
    actorIds: [corrected.entityId],
    threadIds: [],
    payload: {
      schemaVersion: 1,
      authority: "owner",
      trackVersion: track.version,
      before,
      after: structuredClone(corrected),
      supersededPendingIds,
      pendingIds: plan.state.pending
        .filter(
          (row) =>
            row.entityId === corrected.entityId &&
            row.trackId === corrected.trackId,
        )
        .map((row) => row.id),
    },
  });
  return finish(context, plan);
}

/** Only an authenticated owner configuration route may invoke this API; a DM proposal cannot approve definitions. */
export function planProgressionDefinitions(
  context: LoopContext,
  command: FoundationCommand,
  input: ProgressionDefinitions,
): LoopPlan {
  const plan = begin(context, command);
  fields(input, ["progression", "tracks", "rewards"]);
  requireProgression(input.progression === "on" || input.progression === "off");
  const tracks = list(input.tracks, 32).map(parseProgressionTrack);
  const rewards = list(input.rewards, 128).map(parseRewardDefinition);
  unique(tracks.map((row) => row.id));
  unique(rewards.map((row) => row.id));
  for (const [previous, next] of [
    [context.state.tracks, tracks],
    [context.state.rewards, rewards],
  ] as const) {
    for (const row of next) {
      const before = previous.find((candidate) => candidate.id === row.id);
      requireProgression(
        before
          ? isDeepStrictEqual(before, row) || row.version === before.version + 1
          : row.version === 1,
        "stale_progression",
      );
    }
  }
  plan.state.progression = input.progression;
  plan.state.tracks = tracks;
  plan.state.rewards = rewards;
  plan.events.push({
    kind: "progression.definitions.corrected",
    visibility: "private",
    text: "The owner approved progression definitions.",
    actorIds: [],
    threadIds: [],
    payload: {
      schemaVersion: 1,
      authority: "owner",
      before: {
        progression: context.state.progression,
        tracks: structuredClone(context.state.tracks),
        rewards: structuredClone(context.state.rewards),
      },
      after: structuredClone(input),
    },
  });
  return finish(context, plan);
}

export function isPublicEntity(
  context: LoopContext,
  entityId: string,
): boolean {
  const entity = context.snapshot.entities.find((row) => row.id === entityId);
  return (
    !!entity &&
    (entity.kind === "player" ||
      entity.kind === "companion" ||
      context.world.actors.some(
        (actor) => actor.entityId === entityId && actor.publicName !== null,
      ))
  );
}
