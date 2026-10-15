import { DmError } from "../gameplay/dm-errors.ts";
import type {
  RuntimeSource,
  ContextStage,
} from "../gameplay/server-contracts.ts";
import type { TurnInput } from "../gameplay/contracts.ts";
import type { MemorySource } from "./server-contracts.ts";
import { sameTimeline, refsOnTimeline, sourceOnTimeline } from "./timeline.ts";

// This boundary is independent of SQL retrieval. Public narration and companion
// calls receive only directly public, positively authorized sources.
export function projectMemory(
  source: RuntimeSource,
  input: TurnInput,
  stage: ContextStage,
) {
  const memory = source.memory;
  if (!memory || stage === "feedback") return null;
  const timeline = source.runtime.timeline;
  if (
    !memory.complete ||
    !sameTimeline(timeline, input.timeline) ||
    !sameTimeline(timeline, memory.timeline) ||
    memory.campaignId !== input.campaignId ||
    memory.stateRevision !== source.runtime.revision ||
    (memory.checkpoint &&
      (!memory.checkpoint.valid ||
        !sameTimeline(timeline, memory.checkpoint.timeline) ||
        !refsOnTimeline(timeline, memory.checkpoint.sourceRefs) ||
        memory.checkpoint.campaignId !== input.campaignId))
  )
    throw new DmError("context");
  const companion = input.mode === "companion";
  const actors = companion ? [input.companionId!, ...input.listenerIds] : [];
  const mayKnow = (row: MemorySource) =>
    actors.every((id) => row.knownBy.includes(id));
  function project(rows: MemorySource[], visibility: "public" | "private") {
    const seen = new Set<string>();
    return rows.flatMap((row) => {
      if (
        row.campaignId !== input.campaignId ||
        !sourceOnTimeline(timeline, row) ||
        row.ref.campaignId !== input.campaignId ||
        row.ref.visibility !== visibility ||
        !row.current ||
        row.status !== "valid" ||
        row.sourceRefs.some(
          (ref) =>
            ref.campaignId !== input.campaignId ||
            ref.visibility !== visibility,
        )
      )
        throw new DmError("context");
      if (!mayKnow(row) || seen.has(row.id)) return [];
      seen.add(row.id);
      return [
        {
          id: row.id,
          ref: row.ref,
          text: row.text,
          authority: row.authority,
          statementKind: row.statementKind,
          attribution: row.attribution,
          validFrom: row.validFrom,
          validTo: row.validTo,
          unresolved: row.unresolved,
        },
      ];
    });
  }
  const point = memory.checkpoint;
  const publicSummary = memory.publicSummary;
  const privateSummary = memory.privateSummary;
  for (const summary of [publicSummary, privateSummary]) {
    if (
      summary &&
      (!summary.valid ||
        summary.generation !== memory.generation ||
        summary.campaignId !== input.campaignId ||
        !sameTimeline(timeline, summary.timeline) ||
        !refsOnTimeline(timeline, summary.sourceRefs))
    )
      throw new DmError("context");
  }
  if (
    publicSummary?.visibility !== undefined &&
    publicSummary.visibility !== "public"
  )
    throw new DmError("context");
  if (
    privateSummary?.visibility !== undefined &&
    privateSummary.visibility !== "private"
  )
    throw new DmError("context");
  const publicHistory = project(memory.historical, "public");
  // Modern public checkpoints expose only the established public resume
  // contract. Extra private snapshot/legacy extension fields never serialize.
  const publicResume = point && source.astraResponseContract === "unified-v1"
    ? Object.fromEntries(["sceneId", "locationId", "worldMinutes", "participantIds", "lastAction",
        "lastOutcome", "situation", "expectedInput", "pendingOperationId", "pendingStatus"]
      .filter((key) => Object.hasOwn(point.resume, key))
      .map((key) => [key, point.resume[key as keyof typeof point.resume]]))
    : point?.resume;
  const privateCheckpoint = point && source.astraResponseContract === "unified-v1" &&
    ((point as unknown as Record<string, unknown>).visibility === "private" ||
      (point.resume as unknown as Record<string, unknown>).visibility === "private" ||
      point.sourceRefs.some((ref) => ref.visibility === "private"));
  return {
    checkpoint:
      point && !companion && !privateCheckpoint
        ? {
            stateRevision: point.stateRevision,
            settingsRevision: point.settingsRevision,
            guideVersionId: point.guideVersionId,
            publicWatermark: point.publicWatermark,
            resume: publicResume,
            sourceRefs: point.sourceRefs.filter(
              (ref) =>
                ref.visibility === "public" &&
                ref.campaignId === input.campaignId,
            ),
          }
        : null,
    canon: publicHistory.filter((row) => row.authority === "canon"),
    // Exact deltas are mandatory; none may be dropped because a recap omitted it.
    exactEvents: project(
      memory.exactEvents.filter((row) => row.ref.visibility === "public"),
      "public",
    ),
    history: publicHistory.filter((row) => row.authority !== "canon"),
    digest: publicSummary ? project(publicSummary.entries, "public") : [],
    ...(stage === "plan" && !companion
      ? {
          privateContinuity: {
            exactEvents: project(
              memory.exactEvents.filter(
                (row) => row.ref.visibility === "private",
              ),
              "private",
            ),
            history: project(memory.privateHistorical, "private"),
            digest: privateSummary
              ? project(privateSummary.entries, "private")
              : [],
          },
        }
      : {}),
  };
}
