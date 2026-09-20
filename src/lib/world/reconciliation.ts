import { isDeepStrictEqual } from "node:util";
import type {
  FoundationCommand,
  FoundationSnapshot,
} from "../production/contracts.ts";
import type { WorldPolicy, WorldState } from "./contracts.ts";
import type {
  PublicWorldPolicyReconciliation,
  WorldPolicyReconciliationPlan,
  WorldReconciliationChoice,
} from "./reconciliation-contracts.ts";
import { WORLD_RECONCILIATION_GRACE } from "./reconciliation-contracts.ts";
import {
  requiresWorldStepReconciliation,
  worldPolicyNeedsReconciliationReview,
} from "./reconciliation-policy.ts";
import { reconcileWorldPolicy } from "./policy.ts";
import { validateFoundationSnapshot } from "./stage.ts";
import {
  minute,
  object,
  parseWorldPolicy,
  parseWorldState,
  requireWorld,
  uuid,
} from "./validation.ts";

export type {
  PublicWorldPolicyReconciliation,
  WorldPolicyReconciliationPlan,
  WorldReconciliationChoice,
} from "./reconciliation-contracts.ts";
export { WORLD_RECONCILIATION_GRACE } from "./reconciliation-contracts.ts";
export { worldPolicyNeedsReconciliationReview } from "./reconciliation-policy.ts";

export function parseWorldReconciliationChoice(
  value: unknown,
): WorldReconciliationChoice {
  const row = object(value, ["schemaVersion", "kind", "graceMinutes"]);
  requireWorld(row.schemaVersion === 1 && row.kind === "restart_overdue");
  minute(row.graceMinutes);
  requireWorld(
    row.graceMinutes >= WORLD_RECONCILIATION_GRACE.minimum &&
      row.graceMinutes <= WORLD_RECONCILIATION_GRACE.maximum,
  );
  return {
    schemaVersion: 1,
    kind: "restart_overdue",
    graceMinutes: row.graceMinutes,
  };
}

function currentWorld(
  snapshot: FoundationSnapshot,
  nextPolicy: WorldPolicy,
): WorldState {
  validateFoundationSnapshot(snapshot);
  const world =
    snapshot.world === null
      ? {
          schemaVersion: 1 as const,
          campaignId: snapshot.campaignId,
          policy: {
            simulation: false,
            autonomy: nextPolicy.autonomy,
            deadlinePressure: "off" as const,
          },
          policyChangedAtWorldMinutes: snapshot.worldMinutes,
          actors: [],
          threads: [],
          hooks: [],
          warnings: [],
        }
      : parseWorldState(snapshot.world, snapshot.campaignId);
  requireWorld(world.policyChangedAtWorldMinutes <= snapshot.worldMinutes);
  const boundVersions = new Set(
    snapshot.bindings.flatMap((binding) => binding.sourceVersionIds),
  );
  const evidence = [
    ...world.actors.flatMap((actor) => actor.knowledge),
    ...world.threads.flatMap((thread) =>
      thread.steps.flatMap((step) => [
        ...step.evidence,
        ...(step.publicOutcome?.evidence ?? []),
      ]),
    ),
    ...world.hooks.flatMap((hook) => hook.discovery?.evidence ?? []),
  ];
  requireWorld(
    evidence.every(
      (item) =>
        item.ownerId === snapshot.ownerId &&
        boundVersions.has(item.sourceVersionId),
    ),
  );
  return world;
}

function validateCommand(
  snapshot: FoundationSnapshot,
  command: FoundationCommand,
): FoundationCommand {
  object(command, [
    "operationId",
    "campaignId",
    "timeline",
    "expectedRevision",
    "expectedRuntimeRevision",
    "expectedHeadId",
  ]);
  uuid(command.operationId);
  uuid(command.campaignId);
  object(command.timeline, ["timelineId", "epoch"]);
  uuid(command.timeline.timelineId);
  minute(command.timeline.epoch);
  minute(command.expectedRevision);
  minute(command.expectedRuntimeRevision);
  if (command.expectedHeadId !== null) uuid(command.expectedHeadId);
  requireWorld(
    command.campaignId === snapshot.campaignId &&
      command.timeline.timelineId === snapshot.timeline.timelineId &&
      command.timeline.epoch === snapshot.timeline.epoch &&
      command.expectedRevision === snapshot.revision &&
      command.expectedRuntimeRevision === snapshot.runtimeRevision &&
      command.expectedHeadId === snapshot.headId,
    "stale_world",
  );
  return structuredClone(command);
}

/** Read-only review. A public thread title or future publicOutcome does not
 * establish player knowledge of a step's timing; current schema therefore emits
 * no individual schedule rows. Review availability never inspects private work. */
export function projectWorldPolicyReconciliation(
  snapshot: FoundationSnapshot,
  nextPolicy: WorldPolicy,
): PublicWorldPolicyReconciliation {
  const policy = parseWorldPolicy(nextPolicy);
  const world = currentWorld(snapshot, policy);
  return {
    schemaVersion: 1,
    campaignId: snapshot.campaignId,
    timeline: structuredClone(snapshot.timeline),
    revision: snapshot.revision,
    runtimeRevision: snapshot.runtimeRevision,
    headId: snapshot.headId,
    worldMinutes: snapshot.worldMinutes,
    previousPolicy: { ...world.policy },
    nextPolicy: policy,
    requiresReview: worldPolicyNeedsReconciliationReview(world.policy, policy),
    grace: { ...WORLD_RECONCILIATION_GRACE },
    knownSchedules: [],
  };
}

/** Pure, server-owned proposal at an authoritative idle boundary. No time, event,
 * thread cursor, warning receipt, hook state or source identity is advanced.
 * Persistence must atomically check idleness/fences and bind the entire request
 * to its existing operation receipt; it must never expose this private envelope. */
export function prepareWorldPolicyReconciliation(
  snapshot: FoundationSnapshot,
  command: FoundationCommand,
  nextPolicy: WorldPolicy,
  choice: unknown | null,
): WorldPolicyReconciliationPlan {
  const policy = parseWorldPolicy(nextPolicy);
  const world = currentWorld(snapshot, policy);
  const validatedCommand = validateCommand(snapshot, command);
  const needsReview = worldPolicyNeedsReconciliationReview(
    world.policy,
    policy,
  );
  const decision =
    choice === null ? null : parseWorldReconciliationChoice(choice);
  requireWorld(needsReview === (decision !== null));
  const reconciliations: WorldPolicyReconciliationPlan["reconciliations"] = [];
  if (decision !== null) {
    minute(snapshot.worldMinutes + decision.graceMinutes);
    const warningFloors = new Map(
      world.warnings.map((warning) => [
        warning.stepId,
        warning.opportunityUntilWorldMinutes + 1,
      ]),
    );
    for (const thread of world.threads) {
      const required = new Set(
        thread.steps.flatMap((step, index) =>
          requiresWorldStepReconciliation(
            thread,
            index,
            world.policy,
            policy,
            snapshot.worldMinutes,
          )
            ? [step.id]
            : [],
        ),
      );
      let lastRestart = snapshot.worldMinutes;
      for (const [index, step] of thread.steps.entries()) {
        if (step.trigger.kind === "causal") continue;
        let effectiveAt = step.trigger.atWorldMinutes;
        if (required.has(step.id)) {
          const atWorldMinutes = Math.max(
            lastRestart + decision.graceMinutes,
            warningFloors.get(step.id) ?? 0,
          );
          minute(atWorldMinutes);
          reconciliations.push({ stepId: step.id, atWorldMinutes });
          lastRestart = effectiveAt = atWorldMinutes;
        }
        if (
          index >= thread.cursor &&
          step.warning &&
          required.has(step.warning.forStepId)
        ) {
          // A pending warning cannot be recorded in the past. Existing receipts
          // are preserved; this only gives a newly restarted target enough time
          // for an earlier pending warning to be committed on a shorter turn.
          const until =
            Math.max(snapshot.worldMinutes, effectiveAt) +
            step.warning.opportunityMinutes +
            1;
          minute(until);
          warningFloors.set(
            step.warning.forStepId,
            Math.max(warningFloors.get(step.warning.forStepId) ?? 0, until),
          );
        }
      }
    }
  }
  return {
    schemaVersion: 1,
    command: validatedCommand,
    fromWorldMinutes: snapshot.worldMinutes,
    reconciliations,
    world: reconcileWorldPolicy(
      world,
      policy,
      snapshot.worldMinutes,
      reconciliations,
    ),
  };
}

/** Recompute from the pinned authoritative snapshot. A retry cannot smuggle new
 * work, altered provenance or a different sibling timeline into an old plan. */
export function validateWorldPolicyReconciliation(
  snapshot: FoundationSnapshot,
  command: FoundationCommand,
  nextPolicy: WorldPolicy,
  choice: unknown | null,
  proposed: unknown,
): WorldPolicyReconciliationPlan {
  const expected = prepareWorldPolicyReconciliation(
    snapshot,
    command,
    nextPolicy,
    choice,
  );
  requireWorld(isDeepStrictEqual(expected, proposed), "stale_world");
  return expected;
}
