import { safeHTTP } from "./fal-recovery-contract.ts";
import { hash, object, parseJSON, type Dict } from "./protocol.ts";
import { falOutput, inspectAsset, validatedAssetURL } from "./outputs.ts";
import { assetDownloadTransport } from "./asset-download.ts";
import type { Transport } from "./transport.ts";
import { RetrievalLedger } from "./fal-retrieval-ledger.ts";
import {
  retrieval as c,
  retrievalHash,
  retrievalJob,
  requireRetrieval as check,
  retrievalReason,
  validateResultIdentity,
} from "./fal-retrieval-contract.ts";
export type ResultRequest = {
  method: "GET";
  url: string;
  credential: string;
  timeoutMs: number;
};
export async function getRetrievalResult(
  request: ResultRequest,
  record: (data: Dict) => void,
  fetcher: typeof fetch = fetch,
) {
  check(
    request.method === "GET" &&
      request.url === c.resultURL &&
      !Object.hasOwn(request, "body"),
    "retrieval_result_get_only",
  );
  check(
    request.credential.length > 0 && !/[\r\n]/.test(request.credential),
    "retrieval_credential_missing",
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
    check(false, "retrieval_transport_failure");
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
        ? "retrieval_redirect_stop"
        : response.status !== 200
          ? "retrieval_http_unqualified"
          : "retrieval_response_url_mismatch",
    );
  }
  const declared = response.headers.get("content-length");
  check(
    declared === null ||
      (Number.isSafeInteger(Number(declared)) &&
        Number(declared) >= 0 &&
        Number(declared) <= c.limits.maxJsonBytes),
    "retrieval_json_size",
  );
  check(response.body, "retrieval_missing_body");
  const reader = response.body.getReader(),
    parts: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const p = await reader.read();
      if (p.done) break;
      size += p.value.length;
      check(size <= c.limits.maxJsonBytes, "retrieval_json_size");
      parts.push(p.value);
    }
  } catch (error) {
    try {
      await reader.cancel();
    } catch {}
    throw error;
  }
  const bytes = Buffer.concat(parts),
    id = response.headers.get("x-fal-request-id");
  if (id !== null) check(id === c.requestId, "retrieval_header_identity");
  return { value: parseJSON(bytes.toString("utf8")), bodyHash: hash(bytes) };
}
// Signature detection is an observation, not validation, decoding or navigation acceptance.
export function detectArtifact(bytes: Buffer): string {
  if (bytes.toString("ascii", 0, 4) === "glTF") return "glb";
  if (bytes.toString("ascii", 0, 4) === "NGSP") return "spz";
  if (bytes[0] === 31 && bytes[1] === 139) return "gzip_container";
  if (bytes.toString("ascii", 0, 5) === "DRACO") return "draco_header";
  if (bytes.subarray(0, 4).equals(Buffer.from([80, 75, 3, 4])))
    return "zip_archive";
  if (bytes.length <= c.limits.maxJsonBytes) {
    const start = bytes.toString("utf8", 0, 32).trimStart();
    if (start.startsWith("{")) {
      try {
        const value = object(JSON.parse(bytes.toString("utf8")));
        return object(value.asset).version === "2.0" ? "gltf_json" : "json";
      } catch {
        return "json_or_unknown";
      }
    }
  }
  return "unknown";
}
export async function runFalRetrieval(
  ledger: RetrievalLedger,
  credential: string,
  deps: {
    fetcher?: typeof fetch;
    download?: Transport;
    now?: () => number;
  } = {},
) {
  check(ledger.entries.length === 0, "retrieval_already_attempted");
  const now = deps.now ?? Date.now,
    started = now();
  ledger.append("retrieval_begin", {
    requestId: c.requestId,
    retrievalHash,
    started,
  });
  let finding = "A_NO_VALIDATED_RESULT",
    stage = "result";
  const time = () => {
    const left = c.limits.operationDeadlineMs - (now() - started);
    check(left > 0, "retrieval_deadline");
    return Math.min(c.limits.requestTimeoutMs, left);
  };
  try {
    time();
    ledger.append("retrieval_request", {
      stage: "result",
      method: "GET",
      requestId: c.requestId,
      urlHash: hash(c.resultURL),
      at: now(),
    });
    const reply = await getRetrievalResult(
      { method: "GET", url: c.resultURL, credential, timeoutMs: time() },
      (d) => ledger.append("retrieval_http", d),
      deps.fetcher,
    );
    time();
    const value = validateResultIdentity(reply.value);
    ledger.append("retrieval_identity", {
      requestId: c.requestId,
      bodyHash: reply.bodyHash,
      actualModel: value.model ?? null,
      providerReportedRequestId: value.request_id ?? null,
    });
    finding = "B_INVALID_OUTPUT_OR_ASSET_URL";
    const assets = falOutput(value, retrievalJob);
    check(
      assets.length === 1 && assets[0].role === "world",
      "retrieval_world_file_required",
    );
    const asset = assets[0],
      url = validatedAssetURL(asset),
      urlHash = hash(url);
    ledger.append("retrieval_result", {
      role: "world",
      outputField: "world_file",
      urlHash,
      provenance: "validated_exact_request_result",
      drcRequested: true,
      drcReturned: "UNVERIFIED",
    });
    stage = "asset";
    finding = "ASSET_RETRIEVAL_FAILED";
    time();
    ledger.append("retrieval_request", {
      stage: "asset",
      method: "GET",
      requestId: c.requestId,
      urlHash,
      at: now(),
    });
    const downloaded = await (deps.download ?? assetDownloadTransport())({
      asset,
      url,
      method: "GET",
      headers: {},
      limit: c.limits.maxAssetBytes,
      timeoutMs: time(),
    });
    time();
    check(
      downloaded.status === 200 && downloaded.url === url,
      "retrieval_asset_http_or_url",
    );
    check(
      downloaded.bytes.length <= c.limits.maxAssetBytes,
      "retrieval_asset_size",
    );
    const detected = detectArtifact(downloaded.bytes);
    // Durable metadata and local bytes precede every structural validator, including unsupported formats.
    ledger.append("retrieval_asset_observation", {
      role: "world",
      bytes: downloaded.bytes.length,
      sha256: hash(downloaded.bytes),
      urlHash,
      provenance: "validated_exact_request_result",
      detectedFormat: detected,
      formatDetectionOnly: true,
    });
    ledger.evidence(downloaded.bytes, "bin");
    stage = "inspection";
    finding = "STRUCTURAL_INVALID_OR_UNVERIFIED";
    let metadata: Dict;
    try {
      metadata = inspectAsset(downloaded.bytes, asset, retrievalJob);
    } catch (error) {
      const reason = retrievalReason(error);
      const unsupported =
        reason === "unsupported_or_invalid_geometry" ||
        reason === "unsupported_spz" ||
        reason === "unsupported_glb_extension" ||
        (detected === "gzip_container" && reason === "invalid_spz");
      ledger.append("retrieval_inspection", {
        status: unsupported ? "UNSUPPORTED" : "INVALID_OR_UNVERIFIED",
        reason,
        structuralUsability: "UNVERIFIED",
        navigationUsability: "UNVERIFIED",
      });
      ledger.append("retrieval_end", {
        status: "STOPPED_AWAITING_OWNER_REVIEW",
        finding: unsupported
          ? "C_UNSUPPORTED_ARTIFACT"
          : "STRUCTURAL_INVALID_OR_UNVERIFIED",
        reason,
        providerGenerationFailure: false,
        billing: "UNKNOWN",
      });
      return ledger.summary();
    }
    ledger.append("retrieval_inspection", {
      status: "STRUCTURAL_PASS",
      metadata,
      navigationUsability: "UNVERIFIED",
    });
    ledger.append("retrieval_end", {
      status: "RETRIEVED_AWAITING_OWNER_REVIEW",
      finding: "D_STRUCTURAL_PASS",
      billing: "UNKNOWN",
    });
    return ledger.summary();
  } catch (error) {
    ledger.append("retrieval_end", {
      status: "STOPPED_AWAITING_OWNER_REVIEW",
      stage,
      finding,
      reason: retrievalReason(error),
      billing: "UNKNOWN",
    });
    return ledger.summary();
  }
}
