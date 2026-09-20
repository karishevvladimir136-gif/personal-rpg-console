import type { CommittedWorldEvent } from "../production/contracts.ts";
import type { TimelineFence } from "../saves/contracts.ts";
import type { MemorySource } from "../memory/server-contracts.ts";
import { validTimeline } from "../memory/timeline.ts";
import { DmError } from "../gameplay/dm-errors.ts";

// All scope sets come from authorized committed membership, never from a
// client/request or from the event's actor involvement. Origin is provenance;
// inherited events are served on the already-authorized current timeline fence.
export function worldEventMemorySource(
  event: CommittedWorldEvent,
  scope: {
    ownerId: string;
    campaignId: string;
    timeline: TimelineFence;
    worldMinutes: number;
    memberEventIds: ReadonlySet<string>;
    sourceVersionIds: ReadonlySet<string>;
    visibility: "public" | "private";
    actorIds: readonly string[];
    knownBy: readonly string[];
    sessionId?: string | null;
  },
): MemorySource | null {
  if (
    !validTimeline(scope.timeline) ||
    !Number.isSafeInteger(scope.worldMinutes) ||
    scope.worldMinutes < 0
  )
    throw new DmError("context");
  if (
    event.schemaVersion !== 1 ||
    !Number.isSafeInteger(event.sequence) ||
    event.sequence < 1 ||
    event.campaignId !== scope.campaignId ||
    !scope.memberEventIds.has(event.id) ||
    event.visibility !== scope.visibility ||
    !Number.isSafeInteger(event.worldMinutes) ||
    event.worldMinutes < 0 ||
    event.worldMinutes > scope.worldMinutes ||
    !event.text.trim() ||
    scope.actorIds.some((id) => !scope.knownBy.includes(id)) ||
    event.evidence.some(
      (evidence) =>
        evidence.ownerId !== scope.ownerId ||
        !scope.sourceVersionIds.has(evidence.sourceVersionId) ||
        (evidence.knowledge !== "canon_at_entry" &&
          evidence.knowledge !== "character") ||
        (scope.visibility === "public" && evidence.visibility !== "public"),
    )
  )
    return null;
  const timeline = { ...scope.timeline };
  return {
    timeline,
    id: event.id,
    campaignId: scope.campaignId,
    ref: {
      timeline: { ...timeline },
      campaignId: scope.campaignId,
      kind: event.visibility === "private" ? "private_event" : "event",
      id: event.id,
      version: `world-event-v1:${event.operationId}:${event.sequence}`,
      part: 0,
      visibility: event.visibility,
    },
    sequence: event.sequence,
    sessionId: scope.sessionId ?? null,
    text: event.text,
    entityIds: [...event.actorIds],
    knownBy: [...new Set(scope.knownBy)],
    authority: "history",
    // Recording an occurrence does not promote a rumor/claim inside it to fact.
    statementKind: "record",
    attribution: null,
    validFrom: event.worldMinutes,
    validTo: null,
    significance: 1,
    unresolved: false,
    current: true,
    status: "valid",
    factKey: null,
    factValue: null,
    sourceRefs: [],
  };
}
