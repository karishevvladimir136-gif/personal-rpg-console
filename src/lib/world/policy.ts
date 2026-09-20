import { requiresWorldStepReconciliation } from "./reconciliation-policy.ts";
import type { WorldPolicy, WorldState } from "./contracts.ts";
import {
  ids,
  minute,
  object,
  parseWorldPolicy,
  parseWorldState,
  requireWorld,
  uuid,
} from "./validation.ts";

/** An explicit owner decision. Every newly enabled overdue timed step must be placed
 * strictly in the future; omission and retroactive automatic catch-up both fail. */
export function reconcileWorldPolicy(
  current: WorldState,
  nextPolicy: WorldPolicy,
  atWorldMinutes: number,
  reconciliations: { stepId: string; atWorldMinutes: number }[],
): WorldState {
  const world = parseWorldState(current, current.campaignId);
  const policy = parseWorldPolicy(nextPolicy);
  minute(atWorldMinutes);
  requireWorld(atWorldMinutes >= world.policyChangedAtWorldMinutes);
  requireWorld(
    Array.isArray(reconciliations) && reconciliations.length <= 1024,
  );
  ids(
    reconciliations.map((entry) => entry.stepId),
    1024,
  );
  for (const raw of reconciliations) {
    object(raw, ["stepId", "atWorldMinutes"]);
    uuid(raw.stepId);
    minute(raw.atWorldMinutes);
    requireWorld(raw.atWorldMinutes > atWorldMinutes);
  }
  const required = world.threads.flatMap((thread) =>
    thread.steps.filter((_, index) =>
      requiresWorldStepReconciliation(thread, index, world.policy, policy, atWorldMinutes),
    ),
  );
  requireWorld(
    reconciliations.length === required.length &&
      required.every((step) =>
        reconciliations.some((entry) => entry.stepId === step.id),
      ),
  );
  for (const step of required) {
    if (step.trigger.kind !== "causal")
      step.trigger.atWorldMinutes = reconciliations.find(
        (entry) => entry.stepId === step.id,
      )!.atWorldMinutes;
  }
  world.policy = policy;
  world.policyChangedAtWorldMinutes = atWorldMinutes;
  return parseWorldState(world, world.campaignId);
}
