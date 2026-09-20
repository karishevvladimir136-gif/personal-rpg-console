import type { WorldPolicy, WorldStep, WorldThread } from "./contracts.ts";
import { parseWorldPolicy } from "./validation.ts";

const pressureRank = { off: 0, critical_only: 1, normal: 2 } as const;
const autonomyRank = { low: 0, moderate: 1, high: 2 } as const;
const scopeRank = { local: 0, related: 1, broad: 2 } as const;

/** This depends only on visible policy, never on the presence of private work.
 * Autonomy changes alone do not switch deadline pressure or restart schedules. */
export function worldPolicyNeedsReconciliationReview(
  previous: WorldPolicy,
  next: WorldPolicy,
): boolean {
  const before = parseWorldPolicy(previous);
  const after = parseWorldPolicy(next);
  return (
    after.simulation &&
    (!before.simulation ||
      pressureRank[after.deadlinePressure] >
        pressureRank[before.deadlinePressure])
  );
}

function timedPolicyEnabled(
  policy: WorldPolicy,
  step: WorldStep,
  terminal: boolean,
): boolean {
  if (!policy.simulation || step.trigger.kind === "causal") return false;
  if (step.trigger.kind === "deadline") {
    return (
      policy.deadlinePressure === "normal" ||
      (policy.deadlinePressure === "critical_only" &&
        step.trigger.scenarioCritical &&
        step.trigger.established)
    );
  }
  if (scopeRank[step.trigger.scope] > autonomyRank[policy.autonomy])
    return false;
  return (
    policy.deadlinePressure === "normal" ||
    (!terminal &&
      step.hookChanges.length === 0 &&
      step.consequence === "background")
  );
}

/** For an already validated world. Match the stage's policy gates for each
 * unconsumed step, independent of current location/prerequisite relevance.
 * A previously active schedule keeps its timing when another gate expands. */
export function requiresWorldStepReconciliation(
  thread: WorldThread,
  stepIndex: number,
  previous: WorldPolicy,
  next: WorldPolicy,
  atWorldMinutes: number,
): boolean {
  const step = thread.steps[stepIndex];
  if (
    !step ||
    thread.status !== "active" ||
    stepIndex < thread.cursor ||
    step.trigger.kind === "causal" ||
    step.trigger.atWorldMinutes > atWorldMinutes ||
    !worldPolicyNeedsReconciliationReview(previous, next)
  )
    return false;
  const terminal = stepIndex === thread.steps.length - 1;
  return (
    !timedPolicyEnabled(previous, step, terminal) &&
    timedPolicyEnabled(next, step, terminal)
  );
}
