import type { SaveCommand, SavesSnapshot, TimelineFence } from "./contracts.ts";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export const timelineChangedMessage =
  "The active timeline changed. Your draft is preserved. Review the current timeline before continuing.";
export function sameTimeline(a?: TimelineFence, b?: TimelineFence) {
  return a?.timelineId === b?.timelineId && a?.epoch === b?.epoch;
}
export function timelineKey(timeline?: TimelineFence) {
  return timeline ? `${timeline.timelineId}:${timeline.epoch}` : "legacy";
}
export function validTimeline(value: unknown): value is TimelineFence {
  if (!value || typeof value !== "object") return false;
  const row = value as TimelineFence;
  return (
    typeof row.timelineId === "string" &&
    !!row.timelineId &&
    Number.isSafeInteger(row.epoch) &&
    row.epoch > 0
  );
}
export function acceptTimelineRead(
  current: { timeline?: TimelineFence } | null,
  next: { timeline?: TimelineFence },
) {
  if (!current?.timeline) return true;
  return (
    !!next.timeline &&
    (next.timeline.epoch > current.timeline.epoch ||
      sameTimeline(current.timeline, next.timeline))
  );
}
export const saveAttemptKey = (campaignId: string) =>
  `rpg-save-request-v1:${campaignId}`;
export const saveDraftKey = (campaignId: string, timelineId: string) =>
  `rpg-save-title-v1:${campaignId}:${timelineId}`;
export function readLocal<T>(
  storage: StorageLike | null,
  key: string,
): T | null {
  try {
    return JSON.parse(storage?.getItem(key) || "null") as T | null;
  } catch {
    return null;
  }
}
export function writeLocal(
  storage: StorageLike | null,
  key: string,
  value: unknown,
): boolean {
  try {
    if (!storage) return false;
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export function loadSaveAttempt(
  storage: StorageLike | null,
  campaignId: string,
): SaveCommand | null {
  const value = readLocal<SaveCommand>(storage, saveAttemptKey(campaignId));
  if (
    !value ||
    !["create", "load", "switch", "policy"].includes(value.action) ||
    value.input?.campaignId !== campaignId ||
    !validTimeline(value.input.timeline) ||
    typeof value.input.requestId !== "string" ||
    !Number.isSafeInteger(value.input.expectedRevision) ||
    !Number.isSafeInteger(value.input.expectedSavesRevision)
  )
    return null;
  if (
    value.action === "create" &&
    (!["manual", "quick"].includes(value.input.kind) ||
      typeof value.input.name !== "string")
  )
    return null;
  if (
    value.action === "load" &&
    (typeof value.input.saveId !== "string" ||
      typeof value.input.label !== "string" ||
      typeof value.input.recovery !== "boolean")
  )
    return null;
  if (
    value.action === "switch" &&
    (typeof value.input.timelineId !== "string" ||
      typeof value.input.recovery !== "boolean")
  )
    return null;
  if (
    value.action === "policy" &&
    (!value.input.policy ||
      !["off", "session", "turn"].includes(value.input.policy.autosave) ||
      !["unrestricted", "checkpoints", "restricted"].includes(
        value.input.policy.loadMode,
      ) ||
      !Number.isInteger(value.input.policy.retention))
  )
    return null;
  return value;
}
export function prepareSaveAttempt(
  previous: SaveCommand | null,
  next: SaveCommand,
): SaveCommand {
  // A lost response cannot be replaced by a fresh identity or edited payload.
  return previous ?? next;
}
export function saveBase(
  snapshot: SavesSnapshot,
  requestId = crypto.randomUUID(),
) {
  return {
    requestId,
    campaignId: snapshot.campaignId,
    timeline: snapshot.timeline,
    expectedRevision: snapshot.runtimeRevision,
    expectedSavesRevision: snapshot.revision,
  };
}
export function ordinaryLoadAllowed(snapshot: SavesSnapshot, kind?: string) {
  return (
    snapshot.policy.loadMode === "unrestricted" ||
    (snapshot.policy.loadMode === "checkpoints" &&
      (kind === "autosave" || kind === "safety"))
  );
}
export const saveKindLabels = {
  manual: "Manual save",
  quick: "Quick Save",
  autosave: "Autosave",
  safety: "Before load · Safety save",
} as const;

// Contains only a campaign ID and a public activation fence; never draft or save contents.
export const timelineEvent = "rpg-timeline-changed";
export function notifyTimelineChanged(
  campaignId: string,
  timeline: TimelineFence,
) {
  window.dispatchEvent(
    new CustomEvent(timelineEvent, { detail: { campaignId, timeline } }),
  );
  try {
    window.localStorage.setItem(
      timelineEvent,
      JSON.stringify({ campaignId, timeline }),
    );
  } catch {
    /* Focus refresh remains available. */
  }
}
