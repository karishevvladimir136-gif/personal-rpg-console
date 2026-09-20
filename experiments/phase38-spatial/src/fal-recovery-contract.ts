import { readFileSync } from "node:fs";
import { join } from "node:path";
import { experimentRoot } from "./freeze.ts";
import {
  apiUrl,
  canonical,
  hash,
  must,
  object,
  protocol,
  text,
  type Dict,
} from "./protocol.ts";
export type ReadLimits = {
  statusReads: number;
  resultReads: number;
  assetDownloads: number;
};
type Contract = Dict & {
  originalExecutionSHA: string;
  continuationHash: string;
  originalProtocolHash: string;
  stopEvidenceCommit: string;
  stopEvidenceSHA256: string;
  sourceFiles: Record<string, string>;
  jobId: string;
  provider: string;
  model: string;
  requestId: string;
  queueRoot: string;
  accounting: {
    cumulativeReservedMicroUSD: number;
    knownReportedMicroUSD: number;
    falReservedMicroUSD: number;
    falReportedMicroUSD: null;
    ceilingMicroUSD: number;
    unreleasedChestMicroUSD: number;
    historicalGenerationSubmissions: number;
    historicalAPIRequests: number;
    historicalDownloads: number;
  };
  limits: ReadLimits & {
    requestTimeoutMs: number;
    operationDeadlineMs: number;
    maxJsonBytes: number;
    maxAssetBytes: number;
    maxTotalAssetBytes: number;
  };
};
export const falRecovery = JSON.parse(
  readFileSync(join(experimentRoot, "fal-recovery.json"), "utf8"),
) as Contract;
function freeze(x: unknown) {
  if (x && typeof x === "object") {
    Object.freeze(x);
    Object.values(x).forEach(freeze);
  }
}
freeze(falRecovery);
export const falRecoveryHash = hash(canonical(falRecovery));
export const falJob = protocol.jobs.find((x) => x.id === falRecovery.jobId)!;
must(
  falJob?.provider === "fal" && falJob.model === falRecovery.model,
  "recovery_model_pin",
);
export type Stage = "status" | "result" | "asset";
export function recoveryURL(
  stage: "status" | "result",
  id = falRecovery.requestId,
  model = falRecovery.model,
) {
  must(
    id === falRecovery.requestId && model === falRecovery.model,
    "recovery_identity_pin",
  );
  must(stage === "status" || stage === "result", "recovery_stage_pin");
  const url = `https://queue.fal.run/${falRecovery.queueRoot}/requests/${id}${stage === "status" ? "/status" : ""}`;
  return apiUrl(url, falJob, stage === "status" ? "poll" : "result", id);
}
function allowedAlias(value: string, stage: "status" | "result") {
  try {
    return (
      apiUrl(
        value,
        falJob,
        stage === "status" ? "poll" : "result",
        falRecovery.requestId,
      ) === value
    );
  } catch {
    return false;
  }
}
export function safeURL(
  value: unknown,
  stage: "status" | "result",
  base?: string,
) {
  if (typeof value !== "string" || value.length > 8192)
    return { present: value != null, valid: false };
  const digest = hash(value);
  try {
    const u = base ? new URL(value, base) : new URL(value);
    const knownHost = u.hostname === "queue.fal.run";
    const canonicalSource =
      value === u.href ||
      (!!base && value === u.pathname && u.origin === new URL(base).origin);
    const alias = canonicalSource && allowedAlias(u.href, stage);
    return {
      present: true,
      valid: true,
      urlHash: digest,
      scheme:
        u.protocol === "https:"
          ? "https"
          : u.protocol === "http:"
            ? "http"
            : "other",
      hostname: knownHost ? u.hostname : null,
      hostnameHash: hash(u.hostname),
      path: alias ? u.pathname : null,
      pathHash: hash(u.pathname),
      credentialsPresent: !!(u.username || u.password),
      queryPresent: !!u.search,
      fragmentPresent: !!u.hash,
      portPresent: !!u.port,
      allowedQueuePath: alias,
    };
  } catch {
    return { present: true, valid: false, urlHash: digest };
  }
}
export function safeHTTP(
  stage: "status" | "result",
  requested: string,
  status: number,
  responseURL: string,
  location: string | null,
) {
  const actual = safeURL(responseURL, stage),
    target = safeURL(location, stage, requested);
  const redirect = Number.isInteger(status) && status >= 300 && status < 400;
  const same = responseURL === requested;
  return {
    stage,
    requestId: falRecovery.requestId,
    httpStatus:
      Number.isInteger(status) && status >= 100 && status <= 599
        ? status
        : null,
    requestedURLHash: hash(requested),
    response: actual,
    location: target,
    redirect,
    classification: redirect
      ? target.allowedQueuePath
        ? "redirect_to_allowed_queue_path"
        : "redirect_to_unapproved_or_unknown_target"
      : same
        ? "exact_response_url"
        : actual.allowedQueuePath
          ? "allowed_same_origin_canonicalization"
          : "unexpected_origin_or_path",
    statusQualification:
      status === 200 ? "provisional_200_candidate" : "status_not_qualified",
    responseURLMatches: same,
  };
}
export function validateQueue(value: unknown) {
  const b = object(value);
  must(!b.error && !b.error_type, "recovery_provider_error");
  must(b.request_id === falRecovery.requestId, "recovery_status_identity");
  const state = text(b.status);
  must(
    ["IN_QUEUE", "IN_PROGRESS", "COMPLETED"].includes(state),
    "recovery_queue_state",
  );
  if (b.model != null) must(b.model === falRecovery.model, "model_pin");
  if (b.endpoint_id !== undefined)
    must(b.endpoint_id === falRecovery.model, "endpoint_pin");
  for (const key of ["model_attempts", "provider_attempts"])
    if (b[key] !== undefined) must(b[key] === 1, "unexpected_attempts");
  if (b.fallback !== undefined)
    must(b.fallback === false, "unexpected_fallback");
  return {
    requestId: falRecovery.requestId,
    state,
    validatedComplete: state === "COMPLETED",
    actualModel: b.model === falRecovery.model ? falRecovery.model : null,
  };
}
