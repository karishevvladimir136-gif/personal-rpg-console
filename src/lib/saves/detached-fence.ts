import { DmError } from "../gameplay/dm-errors.ts";
import type { LabRun } from "../world-lab/server-contracts.ts";
import type { DetachedRunFence } from "./detached-contracts.ts";

const keys = [
  "kind",
  "ownerId",
  "campaignId",
  "timelineId",
  "runId",
  "leaseGeneration",
  "headRevision",
  "manifestId",
  "scenarioVersionId",
  "divergenceVersionId",
  "inputDigest",
  "canonGeneration",
] as const;
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const generation = (value: unknown, min: number) =>
  Number.isSafeInteger(value) &&
  (value as number) >= min &&
  (value as number) <= 2_147_483_646;

/** Detached authority has no relationship to the currently playable epoch. */
export function isDetachedRunFence(value: unknown): value is DetachedRunFence {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return (
    Object.keys(row).length === keys.length &&
    keys.every((key) => Object.hasOwn(row, key)) &&
    row.kind === "detached" &&
    [
      "ownerId",
      "campaignId",
      "timelineId",
      "runId",
      "manifestId",
      "scenarioVersionId",
      "divergenceVersionId",
    ].every((key) => typeof row[key] === "string" && uuid.test(row[key])) &&
    generation(row.leaseGeneration, 1) &&
    generation(row.headRevision, 0) &&
    generation(row.canonGeneration, 1) &&
    typeof row.inputDigest === "string" &&
    /^[0-9a-f]{64}$/.test(row.inputDigest)
  );
}

export function sameDetachedRunFence(a: unknown, b: unknown): boolean {
  return (
    isDetachedRunFence(a) &&
    isDetachedRunFence(b) &&
    keys.every((key) => a[key] === b[key])
  );
}

/** Reject a stale callback; never renew or rebind its authority. */
export function assertDetachedRunFence(
  expected: unknown,
  current: unknown,
): asserts expected is DetachedRunFence {
  if (!isDetachedRunFence(expected) || !isDetachedRunFence(current))
    throw new DmError("validation");
  if (!sameDetachedRunFence(expected, current)) throw new DmError("conflict");
}

/** Capture once when claiming work. This is not a callback-refresh operation. */
export function createDetachedRunFence(run: LabRun): DetachedRunFence {
  if (
    run.ownerId !== run.input.ownerId ||
    run.campaignId !== run.input.campaignId ||
    run.input.purpose !== "simulation" ||
    run.input.nonCanon !== true
  )
    throw new DmError("validation");
  const fence: DetachedRunFence = {
    kind: "detached",
    ownerId: run.ownerId,
    campaignId: run.campaignId,
    timelineId: run.timelineId,
    runId: run.id,
    leaseGeneration: run.leaseGeneration,
    headRevision: run.headRevision,
    manifestId: run.headManifestId,
    scenarioVersionId: run.input.scenarioVersionId,
    divergenceVersionId: run.input.divergenceVersionId,
    inputDigest: run.inputDigest,
    canonGeneration: run.input.canonGeneration,
  };
  if (!isDetachedRunFence(fence)) throw new DmError("validation");
  return fence;
}
