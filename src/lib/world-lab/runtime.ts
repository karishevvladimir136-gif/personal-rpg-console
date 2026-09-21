// A pure, bounded adapter for the accepted World engine. It cannot read a live
// store, restore a campaign, select a provider, grant knowledge or resolve a PC.
import { isDeepStrictEqual } from "node:util";
import { DmError } from "../gameplay/dm-errors.ts";
import type { JsonObject, PlaySnapshot } from "../gameplay/contracts.ts";
import type { RuntimeSource } from "../gameplay/server-contracts.ts";
import type { CampaignSnapshot } from "../persistence/contracts.ts";
import { isUuid } from "../persistence/validation.ts";
import type {
  EvidenceLocator,
  FoundationSnapshot,
} from "../production/contracts.ts";
import { createDetachedRunFence } from "../saves/detached-fence.ts";
import {
  readDetachedState,
  type ReadDetachedState,
} from "../saves/detached-reader.ts";
import type { WorldStageInput } from "../world/contracts.ts";
import { stageWorldTransition } from "../world/stage.ts";
import { parseWorldState } from "../world/validation.ts";
import { parseEvidence, sha256 } from "../world-library/parsers.ts";
import type { TypedRecord } from "../world-library/types.ts";
import type { LabReason } from "./contracts.ts";
import type { DetachedCommit, DetachedState } from "./server-contracts.ts";
import { buildDetachedWorldCommit } from "./writer.ts";

const MAX_STEP_MINUTES = 60;
export type LabStepResult =
  | { status: "paused"; reason: Exclude<LabReason, null>; modelRequests: 0 }
  | {
      status: "noop" | "commit";
      commit: DetachedCommit;
      worldInput: WorldStageInput;
      modelRequests: 0;
    };

function requireRuntime(
  value: unknown,
  code: "validation" | "conflict" | "context" = "validation",
): asserts value {
  if (!value) throw new DmError(code);
}
function one(state: DetachedState, table: string): JsonObject {
  const rows = state.records[table];
  requireRuntime(Array.isArray(rows) && rows.length === 1);
  return rows[0];
}
function minute(value: unknown): asserts value is number {
  requireRuntime(
    Number.isSafeInteger(value) &&
      (value as number) >= 0 &&
      (value as number) <= 1_000_000_000,
  );
}

/** Recheck the derived map against the immutable vault before an adapter uses it.
 * The SQL read remains responsible for authenticating Postgres row digests. */
export function validateLabDetachedState(
  state: DetachedState,
): ReadDetachedState {
  const { records, ...envelope } = state;
  const exact = readDetachedState(envelope, {
    ownerId: state.ownerId,
    campaignId: state.campaignId,
  });
  requireRuntime(isDeepStrictEqual(records, exact.records), "conflict");
  return exact;
}

/** Exact source versions and format-specific evidence, including accepted text
 * span digests. This is authorization only, not an alternative retrieval layer. */
export function labEvidencePinned(
  value: unknown,
  state: ReadDetachedState,
  visibility: "public" | "private",
  allowFuture = false,
): boolean {
  try {
    const evidence = parseEvidence(value);
    const source = state.libraryRecords.find(
      (row): row is TypedRecord<"source"> =>
        row.kind === "source" && row.versionId === evidence.sourceVersionId,
    );
    if (
      !source ||
      evidence.ownerId !== state.ownerId ||
      source.id !== evidence.sourceId ||
      (visibility === "public" &&
        (evidence.visibility !== "public" ||
          source.body.visibility !== "public")) ||
      (evidence.visibility === "public" &&
        source.body.visibility !== "public") ||
      (!allowFuture &&
        (source.body.knowledge === "future_source" ||
          !["character", "canon_at_entry"].includes(evidence.knowledge))) ||
      (source.body.knowledge === "future_source" &&
        evidence.knowledge !== "future_source") ||
      state.restrictions.some(
        (row) =>
          row.source_id === evidence.sourceId ||
          row.source_id === evidence.sourceVersionId,
      )
    )
      return false;
    if (
      source.body.extraction.version === "text-evidence-v1" &&
      source.body.original.kind === "text" &&
      evidence.locator.kind === "text"
    ) {
      const match = /^(0|[1-9]\d*):(0|[1-9]\d*)$/.exec(evidence.locator.value);
      if (!match) return false;
      const start = Number(match[1]),
        end = Number(match[2]);
      return (
        Number.isSafeInteger(start) &&
        Number.isSafeInteger(end) &&
        end > start &&
        end <= source.body.original.text.length &&
        sha256(source.body.original.text.slice(start, end)) === evidence.digest
      );
    }
    return source.body.digest === evidence.digest;
  } catch {
    return false;
  }
}

/** Only fields read by the pure World engine are authoritative here. The legacy
 * RuntimeSource transport requires presentation metadata and unused lanes: those
 * are inert empty values, never reconstructed history or an active campaign read. */
function runtimeSource(
  state: ReadDetachedState,
  timeline: { timelineId: string; epoch: number },
): RuntimeSource {
  const run = state.run!;
  const raw = one(state, "rpg_private.runtime_state");
  const settings = one(state, "public.rpg_settings");
  const publicState = one(state, "public.rpg_public_state");
  const rowLists = state.records;
  const snapshot = {
    timeline: { ...timeline },
    campaign: {
      id: state.campaignId,
      campaign_id: state.campaignId,
      title: "",
      subtitle: "",
      language: "en",
      revision: 0,
      updated_at: "",
    },
    settings: structuredClone(settings),
    settingsHistory: [],
    documents: structuredClone(rowLists["public.rpg_documents"]),
    entities: structuredClone(rowLists["public.rpg_entities"]),
    storages: structuredClone(rowLists["public.rpg_storages"]),
    items: structuredClone(rowLists["public.rpg_items"]),
    sessions: structuredClone(rowLists["public.rpg_sessions"]),
    scenes: structuredClone(rowLists["public.rpg_scenes"]),
    publicState: structuredClone(publicState),
    quests: structuredClone(rowLists["public.rpg_quests"]),
    locations: structuredClone(rowLists["public.rpg_locations"]),
    assets: [],
    feedback: [],
    dmGuideDocumentId:
      typeof run.input.effectiveGuidance.documentId === "string"
        ? run.input.effectiveGuidance.documentId
        : "",
  } as unknown as CampaignSnapshot;
  const runtime = {
    timeline: { ...timeline },
    campaignId: state.campaignId,
    revision: raw.revision,
    worldMinutes: raw.world_minutes,
    configured: raw.configuration !== null,
    model: null,
    configuration: structuredClone(raw.configuration),
    turns: [],
    restRecords: structuredClone(rowLists["public.rpg_rest_records"]),
    recipes: structuredClone(rowLists["public.rpg_recipes"]),
    effects: structuredClone(rowLists["public.rpg_effects"]),
    encounters: structuredClone(rowLists["public.rpg_encounters"]),
    participants: structuredClone(
      rowLists["public.rpg_encounter_participants"],
    ),
    pendingActions: structuredClone(rowLists["public.rpg_pending_actions"]),
    conversations: structuredClone(rowLists["public.rpg_conversations"]),
    sessionGuidance: structuredClone(rowLists["public.rpg_session_guidance"]),
    provenance: structuredClone(rowLists["public.rpg_provenance"]),
  } as unknown as PlaySnapshot;
  return {
    ownerId: state.ownerId,
    snapshot,
    runtime,
    privateState: {},
    checkpoint: null,
    // This adapter is not a complete DM source and must never be used as one.
    historyComplete: false,
  };
}

export function buildLabWorldInput(
  value: DetachedState,
  operationId: string,
  throughWorldMinutes?: number,
  trigger?: "time_skip" | "session_boundary" | "none",
): WorldStageInput {
  const state = validateLabDetachedState(value),
    run = state.run;
  requireRuntime(isUuid(operationId));
  requireRuntime(
    run !== null && run.status === "running" && run.reason !== "source_changed",
    "conflict",
  );
  requireRuntime(
    state.manifest.schemaVersion === 3 &&
      state.manifest.id === run.headManifestId &&
      state.manifest.runId === run.id &&
      state.manifest.timelineId === run.timelineId &&
      state.canonGeneration === run.input.canonGeneration,
    "conflict",
  );
  const raw = one(state, "rpg_private.runtime_state"),
    foundation = one(state, "rpg_private.world_foundations");
  const settings = one(state, "public.rpg_settings");
  minute(raw.world_minutes);
  const through = throughWorldMinutes ?? raw.world_minutes;
  minute(through);
  requireRuntime(
    raw.world_minutes === run.currentWorldMinutes &&
      through >= raw.world_minutes &&
      through <= run.input.throughWorldMinutes &&
      through - raw.world_minutes <= MAX_STEP_MINUTES,
    "conflict",
  );
  requireRuntime(
    isDeepStrictEqual(foundation.ruleset, run.input.ruleset) &&
      isDeepStrictEqual(settings.values, run.input.effectiveSettings),
    "conflict",
  );
  for (const turn of state.records["rpg_private.turns"])
    requireRuntime(
      ["committed", "cancelled", "failed"].includes(String(turn.status)) &&
        !(turn.status === "failed" && turn.retryable !== false),
      "conflict",
    );
  requireRuntime(
    state.records["public.rpg_pending_actions"].every(
      (row) => row.status === "resolved" || row.status === "cancelled",
    ),
    "conflict",
  );
  const selectedTrigger =
    trigger ?? (through === raw.world_minutes ? "none" : "time_skip");
  requireRuntime(
    ["time_skip", "session_boundary", "none"].includes(selectedTrigger),
  );
  requireRuntime(
    selectedTrigger === "time_skip" || through === raw.world_minutes,
  );
  // Compatibility-only value for pure World contracts. It is not an active
  // epoch; only createDetachedRunFence can authorize the resulting SQL commit.
  const timeline = { timelineId: run.timelineId, epoch: 1 };
  const snapshot = {
    schemaVersion: 1,
    ownerId: state.ownerId,
    campaignId: state.campaignId,
    timeline,
    revision: foundation.revision,
    runtimeRevision: raw.revision,
    headId: state.manifest.id,
    worldMinutes: raw.world_minutes,
    world: structuredClone(foundation.world),
    bindings: structuredClone(foundation.bindings),
    ruleset: structuredClone(foundation.ruleset),
    executionPolicy: structuredClone(foundation.execution_policy),
  } as unknown as FoundationSnapshot;
  const world =
    snapshot.world === null
      ? null
      : parseWorldState(snapshot.world, state.campaignId);
  if (world) {
    const evidence: EvidenceLocator[] = [
      ...world.actors.flatMap((actor) => actor.knowledge),
      ...world.threads.flatMap((thread) =>
        thread.steps.flatMap((step) => [
          ...step.evidence,
          ...(step.publicOutcome?.evidence ?? []),
        ]),
      ),
      ...world.hooks.flatMap((hook) => hook.discovery?.evidence ?? []),
    ];
    requireRuntime(
      evidence.every((item) =>
        labEvidencePinned(item, state, item.visibility, true),
      ),
      "context",
    );
  }
  return {
    snapshot,
    command: {
      operationId,
      campaignId: state.campaignId,
      timeline: { ...timeline },
      expectedRevision: snapshot.revision,
      expectedRuntimeRevision: snapshot.runtimeRevision,
      expectedHeadId: state.manifest.id,
    },
    source: runtimeSource(state, timeline),
    resolution: {
      changes: [],
      worldMinutes: through,
      configuration: structuredClone(
        raw.configuration,
      ) as PlaySnapshot["configuration"],
      outcomes: [],
    },
    trigger: selectedTrigger,
  };
}

/** An explicit continuation is one finite interval, never a background loop. */
export function prepareLabStep(
  value: DetachedState,
  operationId: string,
): LabStepResult {
  try {
    const state = validateLabDetachedState(value),
      run = state.run;
    requireRuntime(run !== null, "conflict");
    if (
      run.reason === "source_changed" ||
      state.canonGeneration !== run.input.canonGeneration
    )
      return { status: "paused", reason: "source_changed", modelRequests: 0 };
    const through = Math.min(
      run.input.throughWorldMinutes,
      run.currentWorldMinutes + MAX_STEP_MINUTES,
    );
    const worldInput = buildLabWorldInput(state, operationId, through);
    if (worldInput.snapshot.world !== null) {
      const world = parseWorldState(
        worldInput.snapshot.world,
        state.campaignId,
      );
      if (
        world.threads.some((thread) =>
          thread.steps
            .slice(thread.cursor)
            .some((step) => step.consequences?.length),
        )
      )
        return { status: "paused", reason: "unsupported", modelRequests: 0 };
    }
    const staged = stageWorldTransition(worldInput);
    if (staged.status === "paused")
      return {
        status: "paused",
        reason:
          staged.reason === "work_limit" ? "work_limit" : "review_required",
        modelRequests: 0,
      };
    if (staged.status === "staged") {
      if (
        staged.settlement.events.filter(
          (event) => event.kind === "world.thread.advanced",
        ).length > run.input.resolutionPolicy.maxSteps
      )
        return { status: "paused", reason: "work_limit", modelRequests: 0 };
      if (
        !staged.settlement.events.every((event) =>
          event.evidence.every(
            (evidence) =>
              labEvidencePinned(evidence, state, event.visibility) &&
              (event.visibility !== "public" ||
                evidence.knowledge === "character"),
          ),
        )
      )
        return {
          status: "paused",
          reason: "review_required",
          modelRequests: 0,
        };
    }
    const commit = buildDetachedWorldCommit({
      state,
      fence: createDetachedRunFence(run),
      operationId,
      throughWorldMinutes: through,
      worldInput,
      settlement: staged.status === "staged" ? staged.settlement : null,
    });
    return {
      status: commit.kind === "noop" ? "noop" : "commit",
      commit,
      worldInput,
      modelRequests: 0,
    };
  } catch (error) {
    // A malformed or stale operation never discloses which private condition
    // failed. Only the explicit applicability check above labels source changes.
    void error;
    return { status: "paused", reason: "review_required", modelRequests: 0 };
  }
}
