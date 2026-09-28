// Browser boundary for exact-source authoring and durable receipt replay.
import type {
  ContinuationCatalog,
  ContinuationInspection,
  ContinuationRequest,
  ContinuationResult,
  ContinuationSelection,
} from "../../lib/world-lab/continuation-contracts.ts";
import type {
  LabCatalog,
  LabCheckpoint,
} from "../../lib/world-lab/contracts.ts";
import type { LabModelSelection } from "../../lib/world-lab/authoring-contracts.ts";
import type { CompositionReview } from "../../lib/world-lab/composition-public.ts";
import {
  parseContinuationRequest,
  parseContinuationSelection,
  sameContinuationSelection,
} from "../../lib/world-lab/continuation-validation.ts";
import {
  assertOfferedModel,
  compositionAttempt,
  editAttempt,
  readAuthoringCatalog,
  readAuthoringResult,
} from "./authoring-client.ts";
import {
  array,
  LabClientError,
  number,
  requireValue,
  responseJson,
  row,
  text,
  unique,
  uuid,
} from "./client.ts";

function checkpoint(value: unknown): LabCheckpoint {
  const c = row(value, ["id", "ordinal", "worldMinutes", "summary", "events"]);
  const worldMinutes = number(c.worldMinutes);
  return {
    id: uuid(c.id),
    ordinal: number(c.ordinal),
    worldMinutes,
    summary: text(c.summary, 8000),
    events: unique(
      array(
        c.events,
        (value) => {
          const e = row(value, ["id", "text", "worldMinutes"]);
          return {
            id: uuid(e.id),
            text: text(e.text, 8000),
            worldMinutes: number(e.worldMinutes, 0, worldMinutes),
          };
        },
        100000,
      ),
      (e) => e.id,
    ),
  };
}
export function readContinuationInspection(
  value: unknown,
  campaignId: string,
): ContinuationInspection {
  const v = row(value, [
    "campaignId",
    "nonCanon",
    "source",
    "checkpoint",
    "eligible",
  ]);
  requireValue(
    v.campaignId === uuid(campaignId) &&
      v.nonCanon === true &&
      typeof v.eligible === "boolean",
  );
  const s = row(v.source, [
    "runId",
    "timelineId",
    "label",
    "revision",
    "status",
  ]);
  requireValue(
    [
      "prepared",
      "running",
      "paused",
      "completed",
      "cancelled",
      "failed",
    ].includes(String(s.status)),
  );
  return {
    campaignId,
    nonCanon: true,
    source: {
      runId: uuid(s.runId),
      timelineId: uuid(s.timelineId),
      label: text(s.label, 160),
      revision: number(s.revision, 1),
      status: s.status as ContinuationInspection["source"]["status"],
    },
    checkpoint: checkpoint(v.checkpoint),
    eligible: v.eligible,
  };
}
export function readContinuationCatalog(
  value: unknown,
  campaignId: string,
  source: ContinuationSelection,
): ContinuationCatalog {
  const v = row(value, ["campaignId", "source", "models", "drafts"]);
  requireValue(v.campaignId === uuid(campaignId));
  const selection = parseContinuationSelection(v.source);
  requireValue(sameContinuationSelection(selection, source));
  const catalog = readAuthoringCatalog({ models: v.models, drafts: v.drafts });
  return { campaignId, source: selection, ...catalog };
}
export function readContinuationRequest(
  value: unknown,
  campaignId: string,
): ContinuationRequest {
  try {
    const request = parseContinuationRequest(value);
    requireValue(request.input.campaignId === uuid(campaignId));
    return request;
  } catch {
    throw new LabClientError("validation");
  }
}
export function readContinuationResult(
  value: unknown,
  campaignId: string,
): ContinuationResult {
  const v = row(value, ["source", "draft", "run"]);
  const source = parseContinuationSelection(v.source);
  const result = readAuthoringResult(
    { draft: v.draft, run: v.run },
    campaignId,
  );
  requireValue(
    result.run === null ||
      (result.run.continuation?.sourceRunId === source.sourceRunId &&
        result.run.continuation.sourceCheckpointId ===
          source.sourceCheckpointId &&
        result.run.base.timelineId === result.draft.base.timelineId &&
        result.run.timelineId !== result.draft.base.timelineId &&
        result.run.startWorldMinutes === result.draft.base.worldMinutes),
  );
  return { source, ...result };
}
export function readContinuationReply(
  value: unknown,
  attempt: ContinuationRequest,
  catalog?: ContinuationCatalog | null,
  inspection?: ContinuationInspection | null,
): ContinuationResult {
  try {
    const result = readContinuationResult(value, attempt.input.campaignId);
    requireValue(
      sameContinuationSelection(result.source, attempt.input.source),
    );
    if (inspection)
      requireValue(
        result.draft.base.timelineId === inspection.source.timelineId &&
          result.draft.base.worldMinutes === inspection.checkpoint.worldMinutes,
      );
    if (attempt.action === "interpret")
      requireValue(
        result.draft.proposal.premise === attempt.input.premise &&
          result.draft.proposal.selectedModel.modelId ===
            attempt.input.model.modelId &&
          result.draft.proposal.selectedModel.reasoning ===
            attempt.input.model.reasoning,
      );
    else {
      const prior = catalog?.drafts.find(
        (d) => d.versionId === attempt.input.versionId,
      );
      if (prior)
        requireValue(
          prior.id === result.draft.id && prior.version <= result.draft.version,
        );
    }
    requireValue(
      attempt.action === "approve"
        ? result.run !== null && result.draft.proposal.phase === "approved"
        : result.run === null,
    );
    return result;
  } catch {
    throw new LabClientError("uncertain");
  }
}
export function offeredContinuation(
  catalog: LabCatalog,
  runId: string,
  checkpointId: string,
): ContinuationSelection {
  const run = catalog.runs.find((r) => r.id === runId);
  requireValue(
    run && run.nonCanon && run.checkpoints.some((c) => c.id === checkpointId),
  );
  return parseContinuationSelection({
    sourceRunId: run.id,
    sourceCheckpointId: checkpointId,
    expectedRevision: run.revision,
  });
}
export function inspectedContinuation(
  inspection: ContinuationInspection,
): ContinuationSelection {
  requireValue(inspection.nonCanon && inspection.eligible);
  return parseContinuationSelection({
    sourceRunId: inspection.source.runId,
    sourceCheckpointId: inspection.checkpoint.id,
    expectedRevision: inspection.source.revision,
  });
}
export function continuationInterpretAttempt(
  catalog: ContinuationCatalog,
  inspection: ContinuationInspection,
  premise: string,
  model: LabModelSelection,
  allocate = () => crypto.randomUUID(),
): ContinuationRequest {
  const source = inspectedContinuation(inspection);
  requireValue(sameContinuationSelection(source, catalog.source));
  assertOfferedModel(model, catalog);
  return readContinuationRequest(
    {
      action: "interpret",
      input: {
        operationId: allocate(),
        campaignId: catalog.campaignId,
        source,
        premise,
        model,
      },
    },
    catalog.campaignId,
  );
}
export function continuationDraftAttempt(
  action: "edit" | "approve" | "retry_interpret",
  catalog: ContinuationCatalog,
  versionId: string,
  edit?: { review: CompositionReview; model: LabModelSelection },
  allocate = () => crypto.randomUUID(),
): ContinuationRequest {
  const draft = catalog.drafts.find((d) => d.versionId === versionId);
  requireValue(draft);
  requireValue(action !== "edit" || edit);
  const attempt =
    action === "edit"
      ? editAttempt(
          catalog.campaignId,
          catalog,
          draft,
          edit!.review,
          edit!.model,
          allocate,
        )
      : compositionAttempt(
          action,
          catalog.campaignId,
          catalog,
          draft,
          allocate,
        );
  return readContinuationRequest(
    { action, input: { ...attempt.input, source: catalog.source } },
    catalog.campaignId,
  );
}
export function mergeContinuation(
  catalog: ContinuationCatalog,
  result: ContinuationResult,
): ContinuationCatalog {
  requireValue(sameContinuationSelection(catalog.source, result.source));
  const previous = catalog.drafts.find((d) => d.id === result.draft.id);
  if (previous && previous.version > result.draft.version) return catalog;
  return {
    ...catalog,
    drafts: [
      result.draft,
      ...catalog.drafts.filter((d) => d.id !== result.draft.id),
    ],
  };
}
export const pendingContinuationKey = (campaignId: string) =>
  `world-lab-continuation-pending:${uuid(campaignId)}`;
export function restoreContinuationAttempt(
  value: string | null,
  campaignId: string,
): ContinuationRequest | null {
  if (value === null || value.length > 70000) return null;
  try {
    return readContinuationRequest(JSON.parse(value), campaignId);
  } catch {
    return null;
  }
}
export type ContinuationTransport = {
  inspect: (
    campaignId: string,
    source: Pick<ContinuationSelection, "sourceRunId" | "sourceCheckpointId">,
    signal?: AbortSignal,
  ) => Promise<ContinuationInspection>;
  load: (
    campaignId: string,
    source: ContinuationSelection,
    signal?: AbortSignal,
  ) => Promise<ContinuationCatalog>;
  send: (request: ContinuationRequest) => Promise<ContinuationResult>;
};
export function createContinuationTransport(
  language: "en" | "ru",
  fetcher: typeof fetch = fetch,
): ContinuationTransport {
  const endpoint = "/api/world-lab/continuation";
  async function get(params: URLSearchParams, signal?: AbortSignal) {
    try {
      return await responseJson(
        await fetcher(`${endpoint}?${params}`, {
          signal,
          credentials: "same-origin",
          cache: "no-store",
          headers: { "Accept-Language": language },
        }),
        false,
      );
    } catch (cause) {
      if (
        cause instanceof LabClientError ||
        (cause instanceof Error && cause.name === "AbortError")
      )
        throw cause;
      throw new LabClientError("unavailable");
    }
  }
  return {
    async inspect(campaignId, source, signal) {
      uuid(campaignId);
      uuid(source.sourceRunId);
      uuid(source.sourceCheckpointId);
      const value = readContinuationInspection(
        await get(
          new URLSearchParams({ campaignId, mode: "inspect", ...source }),
          signal,
        ),
        campaignId,
      );
      requireValue(
        value.source.runId === source.sourceRunId &&
          value.checkpoint.id === source.sourceCheckpointId,
      );
      return value;
    },
    async load(campaignId, source, signal) {
      const selection = parseContinuationSelection(source);
      return readContinuationCatalog(
        await get(
          new URLSearchParams({
            campaignId: uuid(campaignId),
            mode: "catalog",
            sourceRunId: selection.sourceRunId,
            sourceCheckpointId: selection.sourceCheckpointId,
            expectedRevision: String(selection.expectedRevision),
          }),
          signal,
        ),
        campaignId,
        selection,
      );
    },
    async send(value) {
      const request = readContinuationRequest(value, value.input.campaignId);
      try {
        const raw = await responseJson(
          await fetcher(endpoint, {
            method: "POST",
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/json",
              "Accept-Language": language,
            },
            body: JSON.stringify(request),
          }),
          true,
        );
        return readContinuationReply(raw, request);
      } catch (cause) {
        if (cause instanceof LabClientError) throw cause;
        throw new LabClientError("uncertain");
      }
    },
  };
}
