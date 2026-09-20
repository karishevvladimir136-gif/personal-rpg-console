import {
  falRecovery as c,
  falRecoveryHash,
  falJob,
  recoveryURL,
  safeHTTP,
  validateQueue,
  type Stage,
} from "./fal-recovery-contract.ts";
import { FalRecoveryLedger } from "./fal-recovery-ledger.ts";
import {
  hash,
  must,
  object,
  parseJSON,
  safeFailureReason,
  type Dict,
} from "./protocol.ts";
import { falOutput, inspectAsset, validatedAssetURL } from "./outputs.ts";
import { assetDownloadTransport } from "./asset-download.ts";
import type { Transport } from "./transport.ts";
export type JSONGet = {
  stage: "status" | "result";
  method: "GET";
  url: string;
  credential: string;
  timeoutMs: number;
};
export async function getRecoveryJSON(
  request: JSONGet,
  record: (data: Dict) => void,
  fetcher: typeof fetch = fetch,
) {
  must(
    request.method === "GET" &&
      !Object.hasOwn(request, "body") &&
      request.url === recoveryURL(request.stage),
    "fal_recovery_get_only",
  );
  must(
    request.credential.length > 0 && !/[\r\n]/.test(request.credential),
    "credentials_missing",
  );
  let response: Response;
  try {
    response = await fetcher(request.url, {
      method: "GET",
      headers: { Authorization: `Key ${request.credential}` },
      redirect: "manual",
      signal: AbortSignal.timeout(
        Math.max(1, Math.min(c.limits.requestTimeoutMs, request.timeoutMs)),
      ),
    });
  } catch {
    record({
      stage: request.stage,
      requestId: c.requestId,
      requestedURLHash: hash(request.url),
      httpStatus: null,
      transportFailure: true,
    });
    must(false, "fal_recovery_transport_failure");
  }
  const diagnostic = safeHTTP(
    request.stage,
    request.url,
    response.status,
    response.url,
    response.headers.get("location"),
  );
  record(diagnostic); // Durably record safe metadata before rejecting status, URL or redirect.
  if (response.status !== 200 || response.url !== request.url) {
    try {
      await response.body?.cancel();
    } catch {}
    must(
      false,
      response.status >= 300 && response.status < 400
        ? "fal_recovery_redirect_stop"
        : response.status !== 200
          ? "fal_recovery_status_unqualified"
          : "fal_recovery_response_url_mismatch",
    );
  }
  const declared = response.headers.get("content-length");
  must(
    declared === null ||
      (Number.isSafeInteger(Number(declared)) &&
        Number(declared) >= 0 &&
        Number(declared) <= c.limits.maxJsonBytes),
    "response_too_large",
  );
  must(response.body, "missing_body");
  const reader = response.body.getReader(),
    parts: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.length;
      must(size <= c.limits.maxJsonBytes, "response_too_large");
      parts.push(part.value);
    }
  } catch (error) {
    try {
      await reader.cancel();
    } catch {}
    throw error;
  }
  const bytes = Buffer.concat(parts);
  // Never retain raw bodies or arbitrary headers. An ID header is validated, not copied.
  const responseId = response.headers.get("x-fal-request-id");
  if (responseId !== null)
    must(responseId === c.requestId, "fal_recovery_result_identity");
  return { value: parseJSON(bytes.toString("utf8")), bodyHash: hash(bytes) };
}
export async function runFalRecovery(
  ledger: FalRecoveryLedger,
  credential: string,
  deps: {
    fetcher?: typeof fetch;
    download?: Transport;
    now?: () => number;
  } = {},
) {
  const now = deps.now ?? Date.now,
    started = now();
  must(!ledger.rows("recovery_begin").length, "fal_recovery_already_attempted");
  ledger.append("recovery_begin", {
    requestId: c.requestId,
    falRecoveryHash,
    started,
    mode: ledger.limits.resultReads
      ? "future_retrieval_contract"
      : "single_status_observation",
  });
  let stage: Stage = "status";
  const time = () => {
    const left = c.limits.operationDeadlineMs - (now() - started);
    must(left > 0, "job_deadline");
    return Math.min(c.limits.requestTimeoutMs, left);
  };
  const get = async (which: "status" | "result") => {
    stage = which;
    const url = recoveryURL(which);
    time();
    ledger.append("recovery_request", {
      stage: which,
      method: "GET",
      requestId: c.requestId,
      urlHash: hash(url),
      at: now(),
    });
    const reply = await getRecoveryJSON(
      { stage: which, method: "GET", url, credential, timeoutMs: time() },
      (d) => ledger.append("recovery_http", d),
      deps.fetcher,
    );
    time();
    return reply;
  };
  try {
    const statusReply = await get("status"),
      state = validateQueue(statusReply.value);
    ledger.append("recovery_status", {
      ...state,
      bodyHash: statusReply.bodyHash,
    });
    // CLI always uses frozen resultReads=0. No operator flag can release retrieval.
    if (ledger.limits.resultReads === 0) {
      ledger.append("recovery_end", {
        status: "OBSERVED_AWAITING_OWNER_REVIEW",
        reason: "queue_compatibility_not_established",
        resultCandidate: state.validatedComplete,
      });
      return ledger.summary();
    }
    // This bounded branch is a future contract exercised with synthetic unit-test identities.
    // It requires a separately reviewed future identity; current CLI never grants these limits.
    if (!state.validatedComplete) {
      ledger.append("recovery_end", {
        status: "OBSERVED_AWAITING_OWNER_REVIEW",
        reason: "queue_not_completed",
      });
      return ledger.summary();
    }
    const result = await get("result"),
      value = object(result.value);
    if (value.request_id !== undefined)
      must(value.request_id === c.requestId, "fal_recovery_result_identity");
    const assets = falOutput(value, falJob);
    must(assets.length === 1, "fal_recovery_asset_count");
    ledger.append("recovery_result", {
      requestId: c.requestId,
      bodyHash: result.bodyHash,
      actualModel: value.model === c.model ? c.model : null,
    });
    const asset = assets[0],
      url = validatedAssetURL(asset);
    stage = "asset";
    time();
    ledger.append("recovery_request", {
      stage: "asset",
      method: "GET",
      requestId: c.requestId,
      urlHash: hash(url),
      at: now(),
    });
    const reply = await (deps.download ?? assetDownloadTransport())({
      asset,
      url,
      method: "GET",
      headers: {},
      limit: Math.min(c.limits.maxAssetBytes, c.limits.maxTotalAssetBytes),
      timeoutMs: time(),
    });
    time();
    must(reply.status === 200 && reply.url === url, "http_or_redirect_failure");
    must(
      reply.bytes.length <= c.limits.maxAssetBytes &&
        reply.bytes.length <= c.limits.maxTotalAssetBytes,
      "response_too_large",
    );
    const metadata = inspectAsset(reply.bytes, asset, falJob),
      evidence = ledger.evidence(reply.bytes, "bin");
    ledger.append("recovery_asset", {
      requestId: c.requestId,
      ...evidence,
      metadata,
    });
    ledger.append("recovery_end", {
      status: "RECOVERED_AWAITING_OWNER_REVIEW",
      billing: "UNKNOWN",
    });
    return ledger.summary();
  } catch (error) {
    ledger.append("recovery_end", {
      status: "STOPPED",
      stage,
      reason: safeFailureReason(error),
      billing: "UNKNOWN",
    });
    return ledger.summary();
  }
}
