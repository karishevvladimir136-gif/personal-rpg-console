import { readFileSync } from "node:fs";
import { join } from "node:path";
import { experimentRoot } from "./freeze.ts";
import {
  canonical,
  hash,
  jobById,
  object,
  safeFailureReason,
  type Dict,
} from "./protocol.ts";

type Contract = {
  version: string;
  originalExecutionSHA: string;
  originalProtocolHash: string;
  continuationHash: string;
  originalStopEvidenceCommit: string;
  originalStopEvidenceSHA256: string;
  recoveryPreparationSHA: string;
  recoveryIdentity: string;
  recoveryHash: string;
  completedStatusEvidenceCommit: string;
  completedStatusEvidenceFile: string;
  completedStatusEvidenceSHA256: string;
  completedBodySHA256: string;
  recoveryTerminalDigest: string;
  recoveryFiles: Record<string, string>;
  originalSourceFiles: Record<string, string>;
  requestId: string;
  provider: string;
  model: string;
  jobId: string;
  resultURL: string;
  limits: {
    resultReads: number;
    artifactDownloads: number;
    statusReads: number;
    submissions: number;
    retries: number;
    fallbacks: number;
    requestTimeoutMs: number;
    operationDeadlineMs: number;
    maxJsonBytes: number;
    maxAssetBytes: number;
  };
  accounting: Record<string, number | null>;
};
export const retrieval = JSON.parse(
  readFileSync(join(experimentRoot, "fal-retrieval.json"), "utf8"),
) as Contract;
function freeze(x: unknown) {
  if (x && typeof x === "object") {
    Object.freeze(x);
    Object.values(x).forEach(freeze);
  }
}
freeze(retrieval);
export const retrievalHash = hash(canonical(retrieval));
export const retrievalJob = jobById(retrieval.jobId);
const errors = new WeakMap<Error, string>();
export function requireRetrieval(ok: unknown, code: string): asserts ok {
  if (!ok) {
    const error = new Error(code);
    errors.set(error, code);
    throw error;
  }
}
export function retrievalReason(error: unknown) {
  return (
    (error instanceof Error ? errors.get(error) : undefined) ??
    safeFailureReason(error)
  );
}
requireRetrieval(
  retrieval.provider === "fal" &&
    retrievalJob.id === "spatial-fal-world-1" &&
    retrievalJob.model === retrieval.model,
  "retrieval_model_pin",
);
requireRetrieval(
  retrieval.resultURL ===
    `https://queue.fal.run/fal-ai/hunyuan_world/requests/${retrieval.requestId}`,
  "retrieval_result_pin",
);
export function validateResultIdentity(value: unknown): Dict {
  const b = object(value);
  requireRetrieval(!b.error && !b.error_type, "retrieval_provider_error");
  if (b.request_id !== undefined)
    requireRetrieval(
      b.request_id === retrieval.requestId,
      "retrieval_request_identity",
    );
  if (b.model != null)
    requireRetrieval(b.model === retrieval.model, "retrieval_model_identity");
  if (b.endpoint_id !== undefined)
    requireRetrieval(
      b.endpoint_id === retrieval.model,
      "retrieval_endpoint_identity",
    );
  if (b.provider !== undefined)
    requireRetrieval(
      b.provider === retrieval.provider,
      "retrieval_provider_identity",
    );
  if (b.fallback !== undefined)
    requireRetrieval(b.fallback === false, "retrieval_fallback");
  for (const k of ["model_attempts", "provider_attempts"])
    if (b[k] !== undefined)
      requireRetrieval(b[k] === 1, "retrieval_extra_attempt");
  // Missing/nullable model naming stays UNKNOWN. The old output parser expects omission, not null.
  const normalized = { ...b };
  if (b.model == null) delete normalized.model;
  return normalized;
}
