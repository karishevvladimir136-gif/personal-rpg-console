import { DmError } from "../gameplay/dm-errors.ts";
import type {
  RuntimeSource,
  ContextStage,
} from "../gameplay/server-contracts.ts";
import type { TurnInput } from "../gameplay/contracts.ts";
import type { MemorySource } from "./server-contracts.ts";

// This boundary is independent of SQL retrieval. Public narration and companion
// calls receive only directly public, positively authorized sources.
export function projectMemory(
  source: RuntimeSource,
  input: TurnInput,
  stage: ContextStage,
) {
  const memory = source.memory;
  if (!memory || stage === "feedback") return null;
  if (
    !memory.complete ||
    memory.campaignId !== input.campaignId ||
    memory.stateRevision !== source.runtime.revision ||
    (memory.checkpoint &&
      (!memory.checkpoint.valid ||
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
    if (summary && (!summary.valid || summary.campaignId !== input.campaignId))
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
  return {
    checkpoint:
      point && !companion
        ? {
            stateRevision: point.stateRevision,
            settingsRevision: point.settingsRevision,
            guideVersionId: point.guideVersionId,
            publicWatermark: point.publicWatermark,
            resume: point.resume,
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
