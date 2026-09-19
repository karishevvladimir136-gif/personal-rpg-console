import type { TimelineFence } from "../saves/contracts.ts";
import type { MemorySource, MemorySourceRef } from "./server-contracts.ts";

// Serving scope is not source origin. SQL stamps inherited originals only after
// validating their membership in the active immutable save/head manifest.
export function validTimeline(value: unknown): value is TimelineFence {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const fence = value as Record<string, unknown>;
  return (
    Object.keys(fence).length === 2 &&
    typeof fence.timelineId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      fence.timelineId,
    ) &&
    Number.isSafeInteger(fence.epoch) &&
    (fence.epoch as number) >= 1
  );
}

export function sameTimeline(
  expected: TimelineFence | undefined,
  actual: TimelineFence | undefined,
): boolean {
  if (expected === undefined || actual === undefined)
    return expected === undefined && actual === undefined;
  return (
    validTimeline(expected) &&
    validTimeline(actual) &&
    expected.timelineId === actual.timelineId &&
    expected.epoch === actual.epoch
  );
}

export function refsOnTimeline(
  timeline: TimelineFence | undefined,
  refs: MemorySourceRef[],
): boolean {
  return refs.every((ref) => sameTimeline(timeline, ref.timeline));
}

export function sourceOnTimeline(
  timeline: TimelineFence | undefined,
  source: MemorySource,
): boolean {
  return (
    sameTimeline(timeline, source.timeline) &&
    sameTimeline(timeline, source.ref.timeline) &&
    refsOnTimeline(timeline, source.sourceRefs)
  );
}
