// Exact-checkpoint adapter to the existing D2A authoring authority.
import { isDeepStrictEqual } from "node:util";
import type {
  ContinuationCatalog,
  ContinuationInspection,
  ContinuationRequest,
  ContinuationSelection,
} from "./continuation-contracts.ts";
import type { LabAuthoringRequest } from "./authoring-contracts.ts";
import type { LabPrepareInput, PublicLabRun } from "./contracts.ts";
import { buildCompositionBasis } from "./composition.ts";
import type { CompositionBaseInput } from "./composition.ts";
import type {
  CompositionBasis,
  CompositionMetadata,
} from "./composition-contracts.ts";
import { createLabAuthoringService } from "./authoring.ts";
import {
  parseContinuationRequest,
  parseContinuationSelection,
} from "./continuation-validation.ts";
import { parseLabContinuationBasis } from "./checkpoint-basis.ts";
import { validateLabDetachedState } from "./runtime.ts";
import { libraryId } from "../world-library/local-compiler.ts";
import { createRpcLabStore } from "./store.ts";
import { readDetachedState } from "../saves/detached-reader.ts";
import {
  detachedReadEnvelope,
  projectLabCheckpoint,
  projectLabRun,
} from "./projection.ts";
import { parseLabRun } from "./lifecycle.ts";
import {
  parseLabDocumentPins,
  parseLabSourceHeads,
  prepareLabInput,
} from "./inputs.ts";
import {
  ensure,
  FoundationValidationError,
  integer,
  object,
  text,
  uuid,
} from "../foundation-loop/fields.ts";

type Options = Parameters<typeof createLabAuthoringService>[0];
export function createLabContinuationService(options: Options) {
  const { ownerId, library, lab, language } = options;
  uuid(ownerId);
  const store = createRpcLabStore(ownerId, options.execute, readDetachedState);
  async function rpc(campaignId: string, action: string, payload: unknown) {
    uuid(campaignId);
    let response: Awaited<ReturnType<Options["execute"]>>;
    try {
      response = await options.execute({
        p_owner_id: ownerId,
        p_campaign_id: campaignId,
        p_action: action,
        p_payload: payload,
      });
    } catch {
      throw new FoundationValidationError("unavailable");
    }
    if (response.error) {
      const message = response.error.message ?? "";
      throw new FoundationValidationError(
        message.includes("rpg_conflict")
          ? "conflict"
          : message.includes("rpg_forbidden")
            ? "scope"
            : message.includes("rpg_validation")
              ? "validation"
              : "unavailable",
      );
    }
    return response.data;
  }
  async function base(
    campaignId: string,
    source: ContinuationSelection,
  ): Promise<CompositionBaseInput> {
    const envelope = object(
      await rpc(campaignId, "continuation_base", source),
      [
        "state",
        "sourceHeads",
        "documents",
        "base",
        "basisDigest",
        "continuation",
      ],
    );
    const state = readDetachedState(envelope.state, {
      ownerId,
      campaignId,
      runId: source.sourceRunId,
      manifestId: source.sourceCheckpointId,
    });
    const continuation = parseLabContinuationBasis(envelope.continuation);
    ensure(
      continuation.sourceRunId === source.sourceRunId &&
        continuation.sourceCheckpointId === source.sourceCheckpointId &&
        continuation.sourceRunRevision === source.expectedRevision,
      "conflict",
    );
    const offered = object(envelope.base, [
      "saveId",
      "timelineId",
      "label",
      "worldMinutes",
    ]);
    return {
      state,
      continuation,
      sourceHeads: parseLabSourceHeads(envelope.sourceHeads),
      documents: parseLabDocumentPins(envelope.documents),
      base: {
        saveId: uuid(offered.saveId),
        timelineId: uuid(offered.timelineId),
        label: text(offered.label, 200),
        worldMinutes: integer(offered.worldMinutes, 0, 2147483646),
      },
      basisDigest: text(envelope.basisDigest, 64),
    };
  }
  async function assertReprojectable(
    campaignId: string,
    metadata: CompositionMetadata,
  ) {
    const pinned = parseLabContinuationBasis(metadata.basis.continuation);
    const state = await store.readDetached(
      campaignId,
      pinned.sourceRunId,
      pinned.sourceCheckpointId,
    );
    ensure(state.run, "scope");
    const fresh = buildCompositionBasis(
      await base(campaignId, {
        sourceRunId: pinned.sourceRunId,
        sourceCheckpointId: pinned.sourceCheckpointId,
        expectedRevision: state.run.revision,
      }),
    );
    // A completed receipt may outlive parent advancement. Every other authority
    // and public choice pin must remain exact before its review is reprojected.
    const comparable = (basis: CompositionBasis) => ({
      ...basis,
      basisDigest: null,
      continuation: { ...basis.continuation, sourceRunRevision: null },
    });
    ensure(
      isDeepStrictEqual(comparable(fresh.basis), comparable(metadata.basis)) &&
        isDeepStrictEqual(fresh.choices, metadata.choices),
      "conflict",
    );
  }
  async function result(
    campaignId: string,
    request: unknown,
  ): Promise<PublicLabRun> {
    const raw = object(
      await rpc(campaignId, "read_result", { action: "prepare", request }),
      ["run", "base", "scenario", "checkpoints", "applicable"],
    );
    ensure(
      Array.isArray(raw.checkpoints) && typeof raw.applicable === "boolean",
    );
    const run = parseLabRun(raw.run, { ownerId, campaignId });
    const projected = projectLabRun(raw.run, raw.checkpoints, {
      ownerId,
      campaignId,
      language,
      base: raw.base as PublicLabRun["base"],
      scenario: raw.scenario as PublicLabRun["scenario"],
      applicable: raw.applicable,
    });
    if (!run.input.executionProfile) return projected;
    const usage = object(
      await rpc(campaignId, "model_usage", {
        runId: run.id,
        throughRevision: run.revision,
      }),
      ["recordedResponses", "inputTokens", "outputTokens"],
    );
    return {
      ...projected,
      execution: {
        modelId: run.input.executionProfile.modelId,
        reasoning: run.input.executionProfile.reasoning,
        recordedResponses: integer(usage.recordedResponses, 0, 10000),
        inputTokens:
          usage.inputTokens === null ? null : integer(usage.inputTokens),
        outputTokens:
          usage.outputTokens === null ? null : integer(usage.outputTokens),
      },
    };
  }
  function authoring(campaignId: string, source: ContinuationSelection) {
    return createLabAuthoringService({
      ...options,
      base: async (cid, saveId) => {
        ensure(cid === campaignId, "scope");
        const current = await base(cid, source);
        ensure(current.base.saveId === saveId, "scope");
        return current;
      },
      prepare: async (input: LabPrepareInput) => {
        ensure(input.campaignId === campaignId, "scope");
        const request = {
          operationId: input.operationId,
          campaignId,
          ...source,
          scenarioVersionId: input.scenarioVersionId,
          divergenceVersionId: input.divergenceVersionId,
          label: input.label,
          horizonMinutes: input.horizonMinutes,
        };
        // Exact receipts win before a fresh source revision, correction or basis read.
        const previous = await rpc(campaignId, "read", {
          operationId: request.operationId,
          request,
        });
        if (previous !== null) return result(campaignId, request);
        const current = await base(campaignId, source);
        ensure(current.base.saveId === input.saveId, "scope");
        const scenario = await library.get("scenario", input.scenarioVersionId);
        const divergence = await library.get(
          "divergence",
          input.divergenceVersionId,
        );
        ensure(
          isDeepStrictEqual(
            scenario.body.composition?.basis.continuation,
            current.continuation,
          ),
          "conflict",
        );
        const prepared = prepareLabInput(input, {
          ownerId,
          campaignId,
          saveId: current.base.saveId,
          state: current.state,
          sourceHeads: current.sourceHeads,
          documents: current.documents,
          continuation: current.continuation,
          scenarioRecords: [scenario, divergence],
        });
        await rpc(campaignId, "continuation_prepare", { request, ...prepared });
        return result(campaignId, request);
      },
    });
  }
  async function inspect(
    campaignId: string,
    runId: string,
    checkpointId: string,
  ): Promise<ContinuationInspection> {
    uuid(runId);
    uuid(checkpointId);
    const run = await lab.readRun(campaignId, runId);
    const offered = run.checkpoints.find((c) => c.id === checkpointId);
    ensure(offered, "scope");
    const state = await store.readDetached(campaignId, runId, checkpointId);
    ensure(
      state.run &&
        state.run.id === run.id &&
        state.run.revision === run.revision,
      "conflict",
    );
    const checkpoint = projectLabCheckpoint(
      detachedReadEnvelope(validateLabDetachedState(state)),
      { ownerId, campaignId, language, ordinal: offered.ordinal },
    );
    ensure(checkpoint.worldMinutes === offered.worldMinutes, "conflict");
    let eligible = false;
    try {
      await base(campaignId, {
        sourceRunId: runId,
        sourceCheckpointId: checkpointId,
        expectedRevision: run.revision,
      });
      eligible = true;
    } catch (cause) {
      if (
        !(cause instanceof FoundationValidationError) ||
        !["conflict", "validation"].includes(cause.code)
      )
        throw cause;
    }
    return {
      campaignId,
      nonCanon: true,
      source: {
        runId,
        timelineId: run.timelineId,
        label: run.label,
        revision: run.revision,
        status: run.status,
      },
      checkpoint,
      eligible,
    };
  }
  async function catalog(
    campaignId: string,
    value: ContinuationSelection,
  ): Promise<ContinuationCatalog> {
    const source = parseContinuationSelection(value);
    await base(campaignId, source);
    const catalog = await authoring(campaignId, source).catalog(campaignId);
    return {
      campaignId,
      source,
      models: catalog.models,
      drafts: catalog.drafts,
    };
  }
  async function perform(value: ContinuationRequest) {
    const request = parseContinuationRequest(value);
    const { campaignId, source } = request.input;
    let forwarded: LabAuthoringRequest;
    if (request.action === "interpret") {
      const prior = (
        await library.read({
          kind: "scenario",
          versionId: libraryId(
            `${ownerId}:d2a:${request.input.operationId}:requested`,
          ),
        })
      )[0];
      let saveId: string;
      if (prior && prior.kind === "scenario") {
        const basis = prior.body.composition?.basis;
        ensure(
          basis?.ownerId === ownerId &&
            basis.campaignId === campaignId &&
            basis.continuation,
          "scope",
        );
        const pinned = parseLabContinuationBasis(basis.continuation);
        ensure(
          pinned.sourceRunId === source.sourceRunId &&
            pinned.sourceCheckpointId === source.sourceCheckpointId &&
            pinned.sourceRunRevision === source.expectedRevision,
          "conflict",
        );
        await assertReprojectable(campaignId, prior.body.composition!);
        saveId = basis.saveId;
      } else {
        const state = await store.readDetached(
          campaignId,
          source.sourceRunId,
          source.sourceCheckpointId,
        );
        ensure(state.run, "scope");
        saveId = state.run.input.base.saveId;
      }
      forwarded = {
        action: "interpret",
        input: {
          operationId: request.input.operationId,
          campaignId,
          saveId,
          premise: request.input.premise,
          model: request.input.model,
        },
      };
    } else {
      const record = await library.get("scenario", request.input.versionId);
      const basis = record.body.composition?.basis;
      ensure(
        basis?.ownerId === ownerId &&
          basis.campaignId === campaignId &&
          basis.continuation,
        "scope",
      );
      const pinned = parseLabContinuationBasis(basis.continuation);
      ensure(
        pinned.sourceRunId === source.sourceRunId &&
          pinned.sourceCheckpointId === source.sourceCheckpointId &&
          pinned.sourceRunRevision === source.expectedRevision,
        "conflict",
      );
      await assertReprojectable(campaignId, record.body.composition!);
      forwarded =
        request.action === "edit"
          ? {
              action: "edit",
              input: {
                operationId: request.input.operationId,
                campaignId,
                versionId: request.input.versionId,
                review: request.input.review,
                model: request.input.model,
              },
            }
          : {
              action: request.action,
              input: {
                operationId: request.input.operationId,
                campaignId,
                versionId: request.input.versionId,
              },
            };
    }
    const output = await authoring(campaignId, source).perform(forwarded);
    const projectedRecord = await library.get(
      "scenario",
      output.draft.versionId,
    );
    ensure(projectedRecord.body.composition, "scope");
    await assertReprojectable(campaignId, projectedRecord.body.composition);
    return { source, ...output };
  }
  return { inspect, catalog, perform };
}
