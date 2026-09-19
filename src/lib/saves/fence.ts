import type { TimelineFence } from "./contracts.ts";

// Pure public envelope validation. No database/private ancestry is exposed here.
export function isTimelineFence(value: unknown): value is TimelineFence {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return (
    Object.keys(row).length === 2 &&
    typeof row.timelineId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      row.timelineId,
    ) &&
    Number.isSafeInteger(row.epoch) &&
    (row.epoch as number) >= 1
  );
}

export function sameTimeline(
  a: TimelineFence | undefined,
  b: TimelineFence | undefined,
): boolean {
  return !!a && !!b && a.timelineId === b.timelineId && a.epoch === b.epoch;
}
