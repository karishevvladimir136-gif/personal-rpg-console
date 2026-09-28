// Field-only parser. It accepts offered identities, never manifests or patches.
import type {
  ContinuationRequest,
  ContinuationSelection,
} from "./continuation-contracts.ts";
import type { LabModelSelection } from "./authoring-contracts.ts";
import { parseCompositionReview } from "./composition-validation.ts";
import {
  integer,
  literal,
  object,
  text,
  uuid,
} from "../foundation-loop/fields.ts";

export function parseContinuationSelection(
  value: unknown,
): ContinuationSelection {
  const v = object(value, [
    "sourceRunId",
    "sourceCheckpointId",
    "expectedRevision",
  ]);
  return {
    sourceRunId: uuid(v.sourceRunId),
    sourceCheckpointId: uuid(v.sourceCheckpointId),
    expectedRevision: integer(v.expectedRevision, 1, 2147483646),
  };
}
function model(value: unknown): LabModelSelection {
  const v = object(value, ["providerId", "modelId", "reasoning"]);
  return {
    providerId: literal(v.providerId, ["openai"]),
    modelId: text(v.modelId, 120),
    reasoning: v.reasoning === null ? null : text(v.reasoning, 40),
  };
}
export function parseContinuationRequest(value: unknown): ContinuationRequest {
  const v = object(value, ["action", "input"]);
  const action = literal(v.action, [
    "interpret",
    "edit",
    "approve",
    "retry_interpret",
  ] as const);
  const input = object(v.input, [
    "operationId",
    "campaignId",
    "source",
    ...(action === "interpret"
      ? ["premise", "model"]
      : action === "edit"
        ? ["versionId", "review", "model"]
        : ["versionId"]),
  ]);
  const command = {
    operationId: uuid(input.operationId),
    campaignId: uuid(input.campaignId),
    source: parseContinuationSelection(input.source),
  };
  if (action === "interpret")
    return {
      action,
      input: {
        ...command,
        premise: text(input.premise, 6000),
        model: model(input.model),
      },
    };
  if (action === "edit")
    return {
      action,
      input: {
        ...command,
        versionId: uuid(input.versionId),
        review: parseCompositionReview(input.review),
        model: model(input.model),
      },
    };
  return { action, input: { ...command, versionId: uuid(input.versionId) } };
}
export function sameContinuationSelection(
  a: ContinuationSelection,
  b: ContinuationSelection,
) {
  return (
    a.sourceRunId === b.sourceRunId &&
    a.sourceCheckpointId === b.sourceCheckpointId &&
    a.expectedRevision === b.expectedRevision
  );
}
