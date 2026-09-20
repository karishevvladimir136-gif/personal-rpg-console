import { isDeepStrictEqual } from "node:util";
import type {
  AdvancementOption,
  CharacterProgress,
  LoopContext,
  PendingAdvancement,
  ProgressionTrack,
  RewardDefinition,
  RewardSource,
} from "../foundation-loop/contracts.ts";
import type { FoundationCommand } from "../production/contracts.ts";
import { parseWorldState } from "../world/validation.ts";

export const MAX_PROGRESS = 1_000_000_000;
export const MAX_RESOURCE = 1_000_000;
export const MAX_PENDING = 128;

export type ProgressionErrorCode =
  | "invalid_progression"
  | "stale_progression"
  | "source_ineligible"
  | "reward_claimed"
  | "advancement_unavailable";

export class ProgressionValidationError extends Error {
  readonly code: ProgressionErrorCode;
  constructor(code: ProgressionErrorCode = "invalid_progression") {
    super(
      code === "reward_claimed"
        ? "This source has already been rewarded."
        : code === "stale_progression"
          ? "Progression changed. Review and retry."
          : code === "source_ineligible"
            ? "The recorded source is not eligible for this reward."
            : code === "advancement_unavailable"
              ? "This advancement needs review before a choice can be made."
              : "Progression settings require review.",
    );
    this.name = "ProgressionValidationError";
    this.code = code;
  }
}

export function requireProgression(
  value: unknown,
  code: ProgressionErrorCode = "invalid_progression",
): asserts value {
  if (!value) throw new ProgressionValidationError(code);
}

export function fields(value: unknown, keys: readonly string[]) {
  requireProgression(
    value !== null && typeof value === "object" && !Array.isArray(value),
  );
  const row = value as Record<string, unknown>;
  requireProgression(
    (Object.getPrototypeOf(row) === Object.prototype ||
      Object.getPrototypeOf(row) === null) &&
      Object.keys(row).length === keys.length &&
      keys.every((key) => Object.hasOwn(row, key)),
  );
  return row;
}

export function integer(
  value: unknown,
  min = 0,
  max = MAX_PROGRESS,
): asserts value is number {
  requireProgression(
    Number.isSafeInteger(value) &&
      (value as number) >= min &&
      (value as number) <= max,
  );
}

export function textValue(value: unknown, max = 120): asserts value is string {
  requireProgression(
    typeof value === "string" &&
      value.trim().length > 0 &&
      value.length <= max &&
      !/[\u0000-\u001f]/.test(value),
  );
}

export function identifier(value: unknown): asserts value is string {
  requireProgression(
    typeof value === "string" &&
      /^[a-z0-9][a-z0-9._:-]{0,79}$/.test(value) &&
      !["constructor", "prototype", "__proto__"].includes(value),
  );
}

export function uuid(value: unknown): asserts value is string {
  requireProgression(
    typeof value === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
        value,
      ),
  );
}

export function list(value: unknown, max: number): unknown[] {
  requireProgression(Array.isArray(value) && value.length <= max);
  return value;
}

export function unique(values: readonly unknown[]) {
  requireProgression(new Set(values).size === values.length);
}

export function parseOptions(value: unknown): AdvancementOption[] {
  const result = list(value, 32).map((entry) => {
    const row = fields(entry, ["id", "label", "capability"]);
    identifier(row.id);
    textValue(row.label);
    textValue(row.capability, 200);
    return structuredClone(row) as AdvancementOption;
  });
  unique(result.map((row) => row.id));
  unique(result.map((row) => row.capability));
  return result;
}

export function parseProgressionTrack(value: unknown): ProgressionTrack {
  const row = fields(value, [
    "id",
    "version",
    "label",
    "kind",
    "thresholds",
    "choices",
  ]);
  identifier(row.id);
  integer(row.version, 1);
  textValue(row.label);
  requireProgression(
    ["classic_xp", "milestone", "generic"].includes(row.kind as string),
  );
  const thresholds = list(row.thresholds, 100);
  let previous = 0;
  thresholds.forEach((threshold, index) => {
    integer(threshold, 1);
    requireProgression(threshold > previous);
    // Milestones count approved achievements, without inventing an XP table.
    requireProgression(row.kind !== "milestone" || threshold === index + 1);
    previous = threshold;
  });
  parseOptions(row.choices);
  return structuredClone(value) as ProgressionTrack;
}

export function parseRewardSource(value: unknown): RewardSource {
  const row = fields(value, ["kind", "id"]);
  requireProgression(["quest", "thread", "event"].includes(row.kind as string));
  uuid(row.id);
  return structuredClone(value) as RewardSource;
}

export function parseRewardDefinition(value: unknown): RewardDefinition {
  const row = fields(value, [
    "id",
    "version",
    "label",
    "source",
    "distribution",
    "recipientIds",
    "entries",
  ]);
  identifier(row.id);
  integer(row.version, 1);
  textValue(row.label);
  parseRewardSource(row.source);
  requireProgression(
    ["actor", "party_equal"].includes(row.distribution as string),
  );
  const recipients = list(row.recipientIds, 16);
  requireProgression(
    recipients.length > 0 &&
      (row.distribution !== "actor" || recipients.length === 1),
  );
  recipients.forEach(uuid);
  unique(recipients);
  const entries = list(row.entries, 32);
  requireProgression(entries.length > 0);
  const entryKeys: string[] = [];
  for (const entry of entries) {
    requireProgression(
      entry !== null && typeof entry === "object" && !Array.isArray(entry),
    );
    const kind = (entry as Record<string, unknown>).kind;
    if (kind === "progression") {
      const part = fields(entry, ["kind", "trackId", "amount"]);
      identifier(part.trackId);
      integer(part.amount, 1);
      entryKeys.push(`progression:${part.trackId}`);
    } else if (kind === "currency") {
      const part = fields(entry, ["kind", "currencyId", "amount"]);
      identifier(part.currencyId);
      integer(part.amount, 1, MAX_RESOURCE);
      entryKeys.push(`currency:${part.currencyId}`);
    } else if (kind === "item") {
      const part = fields(entry, ["kind", "itemId", "quantity"]);
      uuid(part.itemId);
      integer(part.quantity, 1, MAX_RESOURCE);
      entryKeys.push(`item:${part.itemId}`);
    } else requireProgression(false);
  }
  unique(entryKeys);
  return structuredClone(value) as RewardDefinition;
}

export function parseProgress(value: unknown): CharacterProgress {
  const row = fields(value, [
    "entityId",
    "trackId",
    "value",
    "rank",
    "unlocks",
  ]);
  uuid(row.entityId);
  identifier(row.trackId);
  integer(row.value);
  integer(row.rank, 0, 100);
  const unlocks = list(row.unlocks, 32);
  unlocks.forEach((entry) => textValue(entry, 100));
  unique(unlocks);
  return structuredClone(value) as CharacterProgress;
}

export function parsePending(value: unknown): PendingAdvancement {
  const row = fields(value, [
    "id",
    "entityId",
    "trackId",
    "trackVersion",
    "rank",
    "options",
  ]);
  uuid(row.id);
  uuid(row.entityId);
  identifier(row.trackId);
  integer(row.trackVersion, 1);
  integer(row.rank, 1, 100);
  requireProgression(parseOptions(row.options).length > 0);
  return structuredClone(value) as PendingAdvancement;
}

/** Validate this domain and cross-authority references; commerce/preparation retain their own validators. */
export function validateProgressionContext(context: LoopContext): void {
  const { foundation, snapshot, state, world } = context;
  requireProgression(
    foundation.schemaVersion === 1 && state.schemaVersion === 1,
  );
  uuid(foundation.ownerId);
  uuid(foundation.campaignId);
  uuid(foundation.timeline.timelineId);
  integer(foundation.timeline.epoch);
  integer(foundation.revision);
  integer(foundation.runtimeRevision);
  integer(foundation.worldMinutes);
  integer(state.version);
  requireProgression(
    snapshot.campaign.id === foundation.campaignId &&
      snapshot.campaign.campaign_id === foundation.campaignId,
  );
  requireProgression(
    !snapshot.timeline ||
      isDeepStrictEqual(snapshot.timeline, foundation.timeline),
    "stale_progression",
  );
  requireProgression(
    isDeepStrictEqual(state.profile, foundation.ruleset),
    "stale_progression",
  );
  requireProgression(state.progression === "off" || state.progression === "on");
  parseWorldState(world, foundation.campaignId);
  for (const rows of [
    snapshot.entities,
    snapshot.storages,
    snapshot.items,
    snapshot.quests,
  ]) {
    requireProgression(Array.isArray(rows));
    unique(rows.map((row) => row.id));
    for (const row of rows) {
      uuid(row.id);
      requireProgression(row.campaign_id === foundation.campaignId);
      integer(row.revision, 1);
    }
  }
  for (const actor of world.actors.filter((actor) => actor.kind === "entity")) {
    requireProgression(
      snapshot.entities.some((entity) => entity.id === actor.entityId),
    );
  }
  const currencies = list(state.currencies, 32).map((entry) => {
    const row = fields(entry, ["id", "label", "resourceKey", "version"]);
    identifier(row.id);
    identifier(row.resourceKey);
    textValue(row.label);
    integer(row.version, 1);
    return row;
  });
  unique(currencies.map((row) => row.id));
  unique(currencies.map((row) => row.resourceKey));
  const tracks = list(state.tracks, 32).map(parseProgressionTrack);
  unique(tracks.map((row) => row.id));
  const rewards = list(state.rewards, 128).map(parseRewardDefinition);
  unique(rewards.map((row) => row.id));
  const progress = list(state.progress, 512).map(parseProgress);
  unique(progress.map((row) => `${row.entityId}:${row.trackId}`));
  for (const row of progress) {
    const track = tracks.find((track) => track.id === row.trackId);
    requireProgression(track && row.rank <= track.thresholds.length);
    requireProgression(
      snapshot.entities.some((entity) => entity.id === row.entityId),
    );
  }
  const pending = list(state.pending, MAX_PENDING).map(parsePending);
  unique(pending.map((row) => row.id));
  unique(pending.map((row) => `${row.entityId}:${row.trackId}:${row.rank}`));
  for (const row of pending) {
    const current = progress.find(
      (p) => p.entityId === row.entityId && p.trackId === row.trackId,
    );
    const track = tracks.find((track) => track.id === row.trackId);
    requireProgression(
      current &&
        track &&
        row.rank > current.rank &&
        row.rank <= track.thresholds.length &&
        row.trackVersion <= track.version,
    );
    if (row.trackVersion === track.version) {
      requireProgression(current.value >= track.thresholds[row.rank - 1]);
      requireProgression(
        row.options.every((option) =>
          track.choices.some((definition) =>
            isDeepStrictEqual(option, definition),
          ),
        ),
      );
    }
  }
  for (const reward of rewards) {
    reward.recipientIds.forEach((id) => {
      const entity = snapshot.entities.find((entity) => entity.id === id);
      requireProgression(
        entity && ["player", "companion", "npc"].includes(entity.kind),
      );
      if (reward.distribution === "party_equal")
        requireProgression(
          entity.kind === "player" || entity.kind === "companion",
        );
    });
    for (const entry of reward.entries) {
      if (entry.kind === "progression")
        requireProgression(tracks.some((track) => track.id === entry.trackId));
      if (entry.kind === "currency")
        requireProgression(
          currencies.some((currency) => currency.id === entry.currencyId),
        );
      if (entry.kind === "item")
        requireProgression(
          snapshot.items.some((item) => item.id === entry.itemId),
        );
    }
    // Future definitions may name an ordinary source before it is eligible, but never another campaign's row.
    if (reward.source.kind === "quest")
      requireProgression(
        snapshot.quests.some((quest) => quest.id === reward.source.id),
      );
    if (reward.source.kind === "thread")
      requireProgression(
        world.threads.some((thread) => thread.id === reward.source.id),
      );
  }
  requireProgression(Array.isArray(context.events));
  unique(context.events.map((event) => event.id));
  for (const event of context.events) {
    uuid(event.id);
    uuid(event.operationId);
    uuid(event.originTimelineId);
    integer(event.sequence, 1);
    integer(event.worldMinutes);
    requireProgression(
      event.schemaVersion === 1 && event.campaignId === foundation.campaignId,
    );
  }
}

export function validateProgressionCommand(
  context: LoopContext,
  command: FoundationCommand,
): void {
  validateProgressionContext(context);
  if (context.foundation.world === null) {
    requireProgression(
      context.world.actors.length === 0 &&
        context.world.threads.length === 0 &&
        context.world.hooks.length === 0 &&
        context.world.warnings.length === 0,
    );
  }
  fields(command, [
    "operationId",
    "campaignId",
    "timeline",
    "expectedRevision",
    "expectedRuntimeRevision",
    "expectedHeadId",
  ]);
  uuid(command.operationId);
  uuid(command.campaignId);
  fields(command.timeline, ["timelineId", "epoch"]);
  uuid(command.timeline.timelineId);
  integer(command.timeline.epoch);
  integer(command.expectedRevision);
  integer(command.expectedRuntimeRevision);
  if (command.expectedHeadId !== null) uuid(command.expectedHeadId);
  requireProgression(
    command.campaignId === context.foundation.campaignId &&
      isDeepStrictEqual(command.timeline, context.foundation.timeline) &&
      command.expectedRevision === context.foundation.revision &&
      command.expectedRuntimeRevision === context.foundation.runtimeRevision &&
      command.expectedHeadId === context.foundation.headId,
    "stale_progression",
  );
}
