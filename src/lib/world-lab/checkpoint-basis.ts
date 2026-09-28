// Exact immutable parent association; never a browser authority envelope.
import type { DetachedState, LabContinuationBasis } from "./server-contracts.ts";
import { digest, ensure, integer, object, uuid } from "../foundation-loop/fields.ts";

export function parseLabContinuationBasis(value: unknown): LabContinuationBasis {
  const row = object(value, ["sourceRunId", "sourceCheckpointId", "sourceRunRevision", "sourceInputDigest"]);
  return {
    sourceRunId: uuid(row.sourceRunId), sourceCheckpointId: uuid(row.sourceCheckpointId),
    sourceRunRevision: integer(row.sourceRunRevision, 1, 2_147_483_646),
    sourceInputDigest: digest(row.sourceInputDigest),
  };
}
export function assertLabContinuationBasis(value: unknown, state: DetachedState): LabContinuationBasis {
  const basis = parseLabContinuationBasis(value);
  ensure(state.run !== null && state.manifest.schemaVersion === 3 &&
    state.run.id === basis.sourceRunId && state.manifest.runId === basis.sourceRunId &&
    state.manifest.id === basis.sourceCheckpointId && state.manifest.timelineId === state.run.timelineId &&
    state.run.ownerId === state.ownerId && state.run.campaignId === state.campaignId &&
    state.run.revision === basis.sourceRunRevision && state.run.inputDigest === basis.sourceInputDigest,
    "conflict");
  return basis;
}
