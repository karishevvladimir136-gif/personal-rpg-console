import { isDeepStrictEqual } from "node:util";
import type { TurnInput } from "../gameplay/contracts.ts";
import type {
  DmPlan,
  RecordedCheck,
  TurnLease,
} from "../gameplay/server-contracts.ts";
import type {
  ExecutionProfile,
  FoundationCommand,
  WorldSettlement,
} from "../production/contracts.ts";
import type { TimelineFence } from "../saves/contracts.ts";
import { isTimelineFence, sameTimeline } from "../saves/fence.ts";
import type { WorldStageInput } from "../world/contracts.ts";
import {
  stageWorldTransition,
  validateWorldSettlement,
} from "../world/stage.ts";
import { requireWorld } from "../world/validation.ts";

/** Final replay check after SQL has proved fresh authority and active membership.
 * A newly computed domain result may change only its serving command. */
export function validateRecomputedContinuation(
  original: WorldSettlement,
  recomputed: WorldSettlement,
  recovered: unknown,
): WorldSettlement {
  const expected = { ...structuredClone(original), ...commandOf(recomputed) };
  const replay = structuredClone(recomputed);
  for (const event of replay.events) {
    const prior = original.events.find((row) => row.id === event.id);
    requireWorld(prior, "stale_world");
    event.originTimelineId = prior.originTimelineId;
  }
  requireWorld(
    isDeepStrictEqual(expected, replay) &&
      isDeepStrictEqual(expected, recovered),
    "stale_world",
  );
  return replay;
}

/** Private captured inputs. Persist alongside the FIRST stage, never recreate on retry. */
export type WorldRecoveryInputs = {
  stage: WorldStageInput;
  input: TurnInput;
  plan: DmPlan;
  checks: RecordedCheck[];
  profiles: ExecutionProfile[];
};

/**
 * Supplied only by the existing save/turn store under its campaign lock. These
 * assertions concern exact active projection/manifest membership, not existence
 * somewhere in the campaign. This object is not client input or a SQL capability.
 */
export type WorldRecoveryMembership = {
  ownerId: string;
  campaignId: string;
  operationId: string;
  timeline: TimelineFence;
  headId: string | null;
  turnMember: boolean;
  stageMember: boolean;
  profilesMember: boolean;
  lease: TurnLease;
  leaseActive: boolean;
  status: "generating" | "committed" | "cancelled";
  committedEventIds: string[];
};

export type WorldRecoveryResult =
  | {
      status: "recovery_needed";
      canRetry: false;
      canCancel: true;
      canStartNewAction: true;
    }
  | { status: "terminal"; outcome: "committed" | "cancelled" }
  | {
      status: "unchanged" | "restage";
      // Internal only: public status must never spread this result.
      settlement: WorldSettlement;
      origin: FoundationCommand;
      continuation: FoundationCommand;
      lease: TurnLease;
    };

const opaqueFields = new Set([
  "privateState",
  "contents",
  "resources",
  "stats",
  "values",
  "configuration",
  "definition",
  "public_outcome",
  "public_position",
  "public_resources",
  "public_proposal",
  "ingredients",
  "effect_definition",
  "mechanic",
  "publicPatches",
  "privatePatches",
  "checks",
  "plan",
  "resolution",
  "narration",
  "feedback",
  "usage",
  "conditions",
  "equipment_slots",
  "inputs",
  "outputItemIds",
  "outcomes",
  "proposal",
  "exactState",
]);

/** Mirrors timeline_stamp(false); authored JSON including keys called timeline stays exact. */
function servingSource(value: unknown, timeline: TimelineFence): unknown {
  if (Array.isArray(value))
    return value.map((row) => servingSource(row, timeline));
  if (!value || typeof value !== "object") return value;
  const row = value as Record<string, unknown>;
  const result = Object.fromEntries(
    Object.entries(row).map(([key, item]) => [
      key,
      opaqueFields.has(key)
        ? structuredClone(item)
        : servingSource(item, timeline),
    ]),
  );
  if (
    "campaignId" in row ||
    "campaign_id" in row ||
    ("campaign" in row && "publicState" in row && "settings" in row)
  ) {
    result.timeline = timeline;
  }
  return result;
}

function validSourceScope(
  value: unknown,
  campaignId: string,
  timeline: TimelineFence,
): boolean {
  if (Array.isArray(value))
    return value.every((row) => validSourceScope(row, campaignId, timeline));
  if (!value || typeof value !== "object") return true;
  const row = value as Record<string, unknown>;
  const scoped =
    "campaignId" in row ||
    "campaign_id" in row ||
    ("campaign" in row && "publicState" in row && "settings" in row);
  if (
    ("campaignId" in row && row.campaignId !== campaignId) ||
    ("campaign_id" in row && row.campaign_id !== campaignId) ||
    (scoped &&
      "timeline" in row &&
      (!isTimelineFence(row.timeline) || !sameTimeline(row.timeline, timeline)))
  )
    return false;
  return Object.entries(row).every(
    ([key, item]) =>
      opaqueFields.has(key) || validSourceScope(item, campaignId, timeline),
  );
}

function authoritativeInputs(
  inputs: WorldRecoveryInputs,
  timeline: TimelineFence,
) {
  const result = structuredClone(inputs);
  result.input.timeline = timeline;
  result.input.expectedRevision = 0;
  result.stage.command.timeline = timeline;
  result.stage.command.expectedRuntimeRevision = 0;
  result.stage.command.expectedHeadId = null;
  result.stage.snapshot.timeline = timeline;
  result.stage.snapshot.runtimeRevision = 0;
  result.stage.snapshot.headId = null;
  result.stage.source = servingSource(
    result.stage.source,
    timeline,
  ) as WorldStageInput["source"];
  result.stage.source.runtime.revision = 0;
  // The pending operation's progress is not a second copy of game authority.
  // Its input, plan, checks, profiles, membership and lease are compared separately.
  result.stage.source.runtime.turns = result.stage.source.runtime.turns.filter(
    (turn) => turn.id !== result.input.operationId,
  );
  if (result.stage.source.memory) result.stage.source.memory.stateRevision = 0;
  return result;
}

function commandOf(settlement: WorldSettlement): FoundationCommand {
  return {
    operationId: settlement.operationId,
    campaignId: settlement.campaignId,
    timeline: structuredClone(settlement.timeline),
    expectedRevision: settlement.expectedRevision,
    expectedRuntimeRevision: settlement.expectedRuntimeRevision,
    expectedHeadId: settlement.expectedHeadId,
  };
}

const needsRecovery = (): WorldRecoveryResult => ({
  status: "recovery_needed",
  canRetry: false,
  canCancel: true,
  canStartNewAction: true,
});

function validInputs(inputs: WorldRecoveryInputs) {
  const { stage, input, checks, profiles } = inputs;
  const { command, snapshot, source } = stage;
  return (
    isTimelineFence(command.timeline) &&
    isTimelineFence(snapshot.timeline) &&
    sameTimeline(command.timeline, snapshot.timeline) &&
    (input.timeline === undefined ||
      sameTimeline(input.timeline, command.timeline)) &&
    input.operationId === command.operationId &&
    input.campaignId === command.campaignId &&
    input.expectedRevision === command.expectedRuntimeRevision &&
    input.expectedRevision === snapshot.runtimeRevision &&
    source.runtime.revision === snapshot.runtimeRevision &&
    validSourceScope(source, snapshot.campaignId, snapshot.timeline) &&
    Array.isArray(checks) &&
    Array.isArray(profiles) &&
    new Set(checks.map((check) => check.id)).size === checks.length &&
    new Set(profiles.map((profile) => profile.id)).size === profiles.length &&
    new Set(profiles.map((profile) => profile.task)).size === profiles.length
  );
}

/**
 * Pure, fail-closed re-stage proposal for the deterministic World transition.
 * It performs no writes, provider calls or dice rolls. SQL MUST independently
 * recheck membership, authoritative inputs, current fence and lease at atomic
 * persistence/commit. The returned envelope alone grants no permission to apply.
 * Original stages and manifests remain immutable; store continuation provenance
 * separately. Unsupported/resolver stages and legacy stages without capture pause.
 */
export function assessWorldRecovery(args: {
  original: WorldRecoveryInputs | null;
  current: WorldRecoveryInputs;
  settlement: WorldSettlement;
  membership: WorldRecoveryMembership;
  lease: TurnLease;
}): WorldRecoveryResult {
  try {
    const { original, current, settlement, membership, lease } = args;
    const { command, snapshot } = current.stage;
    if (
      !original ||
      !validInputs(original) ||
      !validInputs(current) ||
      membership.ownerId !== snapshot.ownerId ||
      membership.campaignId !== snapshot.campaignId ||
      membership.operationId !== command.operationId ||
      !sameTimeline(membership.timeline, command.timeline) ||
      membership.headId !== command.expectedHeadId ||
      !membership.turnMember ||
      !membership.stageMember ||
      !membership.profilesMember ||
      settlement.campaignId !== membership.campaignId ||
      settlement.operationId !== membership.operationId
    )
      return needsRecovery();

    validateWorldSettlement(original.stage, settlement);

    // A terminal duplicate callback never proposes another application. It must
    // still identify this exact staged operation in the active projection.
    if (membership.status === "cancelled")
      return { status: "terminal", outcome: "cancelled" };
    if (membership.status === "committed") {
      const expected = settlement.events.map((event) => event.id).sort();
      const actual = [...membership.committedEventIds].sort();
      return isDeepStrictEqual(expected, actual)
        ? { status: "terminal", outcome: "committed" }
        : needsRecovery();
    }
    if (
      membership.status !== "generating" ||
      !membership.leaseActive ||
      !isDeepStrictEqual(lease, membership.lease) ||
      !sameTimeline(lease.timeline, command.timeline) ||
      lease.campaignId !== command.campaignId ||
      lease.operationId !== command.operationId ||
      lease.expectedRevision !== command.expectedRuntimeRevision ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        lease.token,
      ) ||
      membership.committedEventIds.length !== 0
    )
      return needsRecovery();

    // Only save activation can explain a technical runtime revision change.
    // A same-epoch revision bump is an authoritative edit, even if values happen
    // to look equal. Epochs never move backwards or change branches in place.
    const originCommand = original.stage.command;
    if (
      command.timeline.epoch < originCommand.timeline.epoch ||
      (command.timeline.epoch === originCommand.timeline.epoch &&
        (command.timeline.timelineId !== originCommand.timeline.timelineId ||
          command.expectedRuntimeRevision !==
            originCommand.expectedRuntimeRevision)) ||
      (command.timeline.epoch > originCommand.timeline.epoch &&
        command.expectedRuntimeRevision <=
          originCommand.expectedRuntimeRevision)
    )
      return needsRecovery();

    if (
      !isDeepStrictEqual(
        authoritativeInputs(original, command.timeline),
        authoritativeInputs(current, command.timeline),
      )
    )
      return needsRecovery();

    // Recompute only deterministic proposals from captured authority. This also
    // rejects forged/private/future payload changes and extra settlement fields.
    const proposal = stageWorldTransition(current.stage);
    if (proposal.status !== "staged") return needsRecovery();
    const continuation = structuredClone(command);
    const restaged = { ...structuredClone(settlement), ...continuation };
    // Recomputed events use today's serving timeline; preserve their immutable
    // original identity/provenance only after proving every other value equal.
    const recomputed = structuredClone(proposal.settlement);
    for (const event of recomputed.events) {
      const origin = settlement.events.find((row) => row.id === event.id);
      if (!origin) return needsRecovery();
      event.originTimelineId = origin.originTimelineId;
    }
    if (!isDeepStrictEqual(restaged, recomputed)) return needsRecovery();
    return {
      status: isDeepStrictEqual(settlement, restaged) ? "unchanged" : "restage",
      settlement: restaged,
      origin: commandOf(settlement),
      continuation,
      lease: structuredClone(lease),
    };
  } catch {
    // Recovery status is safe to expose; never include the failing private path.
    return needsRecovery();
  }
}
