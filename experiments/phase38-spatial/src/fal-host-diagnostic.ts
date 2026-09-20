import { safeHTTP } from "./fal-recovery-contract.ts";
import { hash, object, parseJSON, type Dict } from "./protocol.ts";
import {
  requireRetrieval as check,
  retrievalReason,
  validateResultIdentity,
} from "./fal-retrieval-contract.ts";
import {
  diagnostic as c,
  diagnosticHash,
  DiagnosticLedger,
} from "./fal-host-diagnostic-state.ts";
import {
  sanitizeWorldFile,
  classifyWorldFile,
} from "./fal-host-diagnostic-metadata.ts";
export type DiagnosticRequest = {
  method: "GET";
  url: string;
  credential: string;
  timeoutMs: number;
};
export async function readDiagnosticBody(
  request: DiagnosticRequest,
  record: (d: Dict) => void,
  fetcher: typeof fetch = fetch,
) {
  check(
    request.method === "GET" &&
      request.url === c.resultURL &&
      !Object.hasOwn(request, "body"),
    "diagnostic_exact_get_only",
  );
  check(
    request.credential.length > 0 && !/[\r\n]/.test(request.credential),
    "diagnostic_credentials_missing",
  );
  let response: Response;
  try {
    response = await fetcher(c.resultURL, {
      method: "GET",
      headers: { Authorization: `Key ${request.credential}` },
      redirect: "manual",
      signal: AbortSignal.timeout(
        Math.max(1, Math.min(c.limits.requestTimeoutMs, request.timeoutMs)),
      ),
    });
  } catch {
    record({
      stage: "result",
      requestId: c.requestId,
      requestedURLHash: hash(c.resultURL),
      httpStatus: null,
      transportFailure: true,
    });
    check(false, "diagnostic_transport_failure");
  }
  record(
    safeHTTP(
      "result",
      c.resultURL,
      response.status,
      response.url,
      response.headers.get("location"),
    ),
  );
  if (response.status !== 200 || response.url !== c.resultURL) {
    try {
      await response.body?.cancel();
    } catch {}
    check(
      false,
      response.status >= 300 && response.status < 400
        ? "diagnostic_redirect_stop"
        : response.status !== 200
          ? "diagnostic_http_unqualified"
          : "diagnostic_response_url_changed",
    );
  }
  const declared = response.headers.get("content-length");
  check(
    declared === null ||
      (Number.isSafeInteger(Number(declared)) &&
        Number(declared) >= 0 &&
        Number(declared) <= c.limits.maxJsonBytes),
    "diagnostic_json_size",
  );
  check(response.body, "diagnostic_missing_body");
  const reader = response.body.getReader(),
    parts: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const p = await reader.read();
      if (p.done) break;
      size += p.value.length;
      check(size <= c.limits.maxJsonBytes, "diagnostic_json_size");
      parts.push(p.value);
    }
  } catch (error) {
    try {
      await reader.cancel();
    } catch {}
    throw error;
  }
  const id = response.headers.get("x-fal-request-id");
  if (id !== null) check(id === c.requestId, "diagnostic_header_identity");
  const bytes = Buffer.concat(parts);
  return { bytes, bodyHash: hash(bytes) };
}
type Read = (
  request: DiagnosticRequest,
  record: (d: Dict) => void,
) => ReturnType<typeof readDiagnosticBody>;
export async function runHostDiagnostic(
  ledger: DiagnosticLedger,
  credential: string,
  deps: { read?: Read; now?: () => number } = {},
) {
  check(ledger.entries.length === 0, "diagnostic_already_attempted");
  const now = deps.now ?? Date.now,
    started = now();
  ledger.append("diagnostic_begin", {
    requestId: c.requestId,
    diagnosticHash,
    started,
  });
  const time = () => {
    const remaining = c.limits.operationDeadlineMs - (now() - started);
    check(remaining > 0, "diagnostic_deadline");
    return Math.min(c.limits.requestTimeoutMs, remaining);
  };
  try {
    time();
    ledger.append("diagnostic_request", {
      stage: "result",
      method: "GET",
      requestId: c.requestId,
      urlHash: hash(c.resultURL),
      at: now(),
    });
    const reply = await (deps.read ?? readDiagnosticBody)(
      { method: "GET", url: c.resultURL, credential, timeoutMs: time() },
      (d) => ledger.append("diagnostic_http", d),
    );
    time();
    const same = reply.bodyHash === c.bindings.previousResultBodySHA256;
    ledger.append("diagnostic_body", {
      bodyHash: reply.bodyHash,
      matchesPrevious: same,
    });
    // Compare exact bytes BEFORE JSON parsing, identity or descriptor interpretation, including changed malformed bodies.
    check(same, "changed_provider_result");
    const value = validateResultIdentity(
      parseJSON(reply.bytes.toString("utf8")),
    );
    ledger.append("diagnostic_identity", {
      requestId: c.requestId,
      actualModel: value.model ?? null,
      providerReportedRequestId: value.request_id ?? null,
    });
    const descriptor = object(value.world_file),
      metadata = sanitizeWorldFile(descriptor);
    ledger.append("diagnostic_descriptor", metadata);
    const classification = classifyWorldFile(descriptor.url, metadata);
    ledger.append("diagnostic_end", {
      status:
        classification.classification === "clearly_unapproved_or_unsafe_host"
          ? "STOPPED_AWAITING_OWNER_REVIEW"
          : "OBSERVED_AWAITING_OWNER_REVIEW",
      ...classification,
      downloadAuthorized: false,
      billing: "UNKNOWN",
    });
    return ledger.summary();
  } catch (error) {
    ledger.append("diagnostic_end", {
      status: "STOPPED_AWAITING_OWNER_REVIEW",
      reason: retrievalReason(error),
      downloadAuthorized: false,
      billing: "UNKNOWN",
    });
    return ledger.summary();
  }
}
