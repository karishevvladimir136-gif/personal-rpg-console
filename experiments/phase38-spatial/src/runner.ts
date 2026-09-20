import { Ledger } from "./ledger.ts";
import {
  apiUrl,
  assetUrl,
  canonical,
  hash,
  integer,
  jobById,
  must,
  object,
  parseJSON,
  protocol,
  protocolHash,
  safeId,
  safeFailureReason,
  text,
  type Dict,
} from "./protocol.ts";
import { falOutput, inspectAsset, worldOutput, type Asset } from "./outputs.ts";
import { authHeaders, type Transport } from "./transport.ts";
import { worldFence } from "./world-metadata.ts";
export type Clock = { now: () => number; sleep: (ms: number) => Promise<void> };
const realClock: Clock = {
  now: Date.now,
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};
export function nextJob(ledger: Ledger) {
  must(!ledger.rows("stop").length, "experiment_stopped");
  const attempts = ledger.rows("reserve");
  must(attempts.length < 4, "four_call_maximum");
  for (const prior of attempts)
    must(
      ledger.rows("approval", text(prior.jobId)).length === 1,
      "prior_job_not_approved_or_uncertain",
    );
  const job = protocol.jobs[attempts.length];
  must(
    ledger.summary().reservedMicroUSD + job.reserveMicroUSD <= 4750000,
    "reservation_ceiling",
  );
  return job;
}
function resultFor(ledger: Ledger, id: string): Dict {
  const row = ledger.rows("result", id)[0];
  must(row, "missing_result");
  const result = object(
    parseJSON(ledger.readEvidence(text(row.file)).toString()),
  );
  must(
    result.jobId === id && result.protocolHash === protocolHash,
    "result_identity",
  );
  return result;
}
export function bill(
  ledger: Ledger,
  id: string,
  requestId: string,
  microUSD: number,
  source: "provider" | "dashboard",
  evidenceSHA256: string,
) {
  const job = jobById(id);
  must(
    integer(microUSD) <= job.maxPriceMicroUSD &&
      microUSD <= job.reserveMicroUSD,
    "billing_exceeds_frozen_price",
  );
  must(/^[a-f0-9]{64}$/.test(evidenceSHA256), "billing_evidence_hash");
  safeId(requestId);
  const receipt = ledger.rows("receipt", id)[0];
  must(receipt && receipt.requestId === requestId, "billing_request_mismatch");
  must(
    ledger.summary().knownReportedMicroUSD + microUSD <= 4750000,
    "billing_ceiling",
  );
  ledger.append("billing", {
    jobId: id,
    requestId,
    microUSD,
    source,
    evidenceSHA256,
  });
}
export function approve(ledger: Ledger, id: string, review: Dict) {
  must(!ledger.rows("stop").length, "experiment_stopped");
  const r = resultFor(ledger, id);
  must(
    review.resultSHA256 === ledger.rows("result", id)[0].sha256 &&
      review.protocolHash === protocolHash,
    "stale_review",
  );
  must(
    ledger.rows("billing", id).length === 1,
    "billing_unknown_stop_before_next",
  );
  for (const field of [
    "syntheticOnly",
    "safeVisibleEnvelope",
    "requiredOutputsUsable",
    "assetFirst",
    "noUnexpectedRouting",
  ])
    must(review[field] === true, "output_review_not_passed");
  if (id === "spatial-room-1")
    for (const field of ["panoramaCompatible", "panoramaSharingPermitted"])
      must(review[field] === true, "panorama_not_approved");
  // Recheck immutable local bytes before acknowledging visual/manual acceptance.
  for (const a of r.assets as Dict[]) ledger.readEvidence(text(a.file));
  ledger.append("approval", {
    jobId: id,
    resultSHA256: review.resultSHA256,
    reviewed: true,
    panoramaSharingPermitted: id === "spatial-room-1",
  });
}
export function responseByteLimit(ledger: Ledger, type: string) {
  if (type !== "download") return protocol.limits.maxJsonBytes;
  const used = ledger
    .rows("response")
    .filter((x) => x.type === "download")
    .reduce((n, x) => n + integer(x.bytes), 0);
  const remaining = protocol.limits.maxTotalAssetBytes - used;
  must(remaining > 0, "asset_total_limit");
  return Math.min(protocol.limits.maxAssetBytes, remaining);
}
export async function runNext(
  ledger: Ledger,
  transport: Transport,
  credentials: Record<string, string>,
  clock: Clock = realClock,
) {
  const job = nextJob(ledger),
    started = clock.now();
  let stage = "prepare";
  const input = structuredClone(job.input);
  if (job.id === "spatial-fal-world-1") {
    const room = resultFor(ledger, "spatial-room-1"),
      approval = ledger.rows("approval", "spatial-room-1")[0];
    must(approval?.panoramaSharingPermitted === true, "panorama_not_approved");
    const pano = (room.assets as Dict[]).find((x) => x.role === "pano");
    must(pano, "missing_panorama");
    ledger.readEvidence(text(pano.file));
    input.image_url = assetUrl(pano.url, "worldlabs");
    ledger.append("dependency", {
      jobId: job.id,
      sourceJobId: "spatial-room-1",
      sha256: pano.sha256,
      urlHash: hash(text(pano.url)),
    });
  }
  // No environment access here; only the separately gated CLI may supply credentials.
  const submitHeaders = authHeaders(job.provider, credentials, true);
  apiUrl(job.endpoint, job, "submit");
  must(
    canonical(input) ===
      canonical(
        job.id === "spatial-fal-world-1"
          ? { ...job.input, image_url: input.image_url }
          : job.input,
      ),
    "frozen_input_mismatch",
  );
  ledger.append("reserve", {
    jobId: job.id,
    microUSD: job.reserveMicroUSD,
    started,
    inputHash: hash(canonical(input)),
    model: job.model,
    endpoint: job.endpoint,
  });
  const request = async (
    type: "submit" | "poll" | "world" | "result" | "download",
    url: string,
    id?: string,
  ) => {
    stage = type;
    must(
      clock.now() - started <= protocol.limits.jobDeadlineMs,
      "job_deadline",
    );
    if (type === "download") assetUrl(url, job.provider);
    else apiUrl(url, job, type, id);
    const byteLimit = responseByteLimit(ledger, type);
    ledger.append("request", {
      jobId: job.id,
      type,
      urlHash: hash(url),
      at: clock.now(),
    });
    const response = await transport({
      url,
      method: type === "submit" ? "POST" : "GET",
      headers:
        type === "download"
          ? {}
          : type === "submit"
            ? submitHeaders
            : authHeaders(job.provider, credentials, false),
      ...(type === "submit" ? { body: JSON.stringify(input) } : {}),
      limit: byteLimit,
      timeoutMs: Math.max(
        1,
        Math.min(
          60000,
          protocol.limits.jobDeadlineMs - (clock.now() - started),
        ),
      ),
    });
    must(
      response.status === 200 && response.url === url,
      "http_or_redirect_failure",
    );
    must(
      clock.now() - started <= protocol.limits.jobDeadlineMs,
      "job_deadline",
    );
    must(response.bytes.length <= byteLimit, "response_too_large");
    for (const value of Object.values(credentials).filter(Boolean))
      must(!response.bytes.includes(Buffer.from(value)), "secret_in_response");
    ledger.append("response", {
      jobId: job.id,
      type,
      status: response.status,
      bodyHash: hash(response.bytes),
      bytes: response.bytes.length,
    });
    return response;
  };
  try {
    const submitted = await request("submit", job.endpoint);
    let body = object(parseJSON(submitted.bytes.toString()));
    const requestId = safeId(
      job.provider === "worldlabs" ? body.operation_id : body.request_id,
    );
    ledger.append("receipt", {
      jobId: job.id,
      requestId,
      provider: job.provider,
      requestedModel: job.model,
      actualModel: null,
    });
    const pollURL =
      job.provider === "worldlabs"
        ? `https://api.worldlabs.ai/marble/v1/operations/${requestId}`
        : apiUrl(body.status_url, job, "poll", requestId);
    if (job.provider === "fal" && body.status === undefined)
      body = { ...body, status: "IN_QUEUE" };
    const resultURL =
      job.provider === "fal"
        ? apiUrl(body.response_url, job, "result", requestId)
        : null;
    const done = () =>
      job.provider === "worldlabs"
        ? body.done === true
        : body.status === "COMPLETED";
    const statusCheck = () => {
      must(!body.error && !body.error_type, "provider_status_failure");
      must(
        (job.provider === "worldlabs" ? body.operation_id : body.request_id) ===
          requestId,
        "stale_request_id",
      );
      if (job.provider === "worldlabs")
        must(typeof body.done === "boolean", "invalid_status");
      else
        must(
          ["IN_QUEUE", "IN_PROGRESS", "COMPLETED"].includes(text(body.status)),
          "invalid_status",
        );
      if (body.model !== undefined && body.model !== null)
        must(body.model === job.model, "model_pin");
      if (body.model_attempts !== undefined)
        must(body.model_attempts === 1, "unexpected_attempts");
      if (body.provider_attempts !== undefined)
        must(body.provider_attempts === 1, "unexpected_attempts");
      if (body.fallback !== undefined)
        must(body.fallback === false, "unexpected_fallback");
    };
    statusCheck();
    while (!done()) {
      must(
        ledger.rows("request", job.id).filter((x) => x.type === "poll").length <
          45,
        "poll_limit",
      );
      await clock.sleep(20000);
      body = object(
        parseJSON((await request("poll", pollURL, requestId)).bytes.toString()),
      );
      statusCheck();
    }
    const observedHash = hash(canonical(body));
    if (
      job.provider === "worldlabs" &&
      body.cost !== undefined &&
      body.cost !== null
    ) {
      const credits = integer(object(body.cost).total_credits);
      bill(ledger, job.id, requestId, credits * 800, "provider", observedHash);
    }
    let assets: Asset[],
      world: Dict | null = null;
    if (job.provider === "worldlabs") {
      const fence = worldFence(
        body,
        job,
        requestId,
        ledger.rows("reserve", job.id)[0],
      );
      const worldId = fence.worldId;
      // Retain only safe request/world identity before any world validation can fail.
      ledger.append("world_identity", { ...fence });
      const url = `https://api.worldlabs.ai/marble/v1/worlds/${worldId}`;
      const first = worldOutput(
        parseJSON((await request("world", url, worldId)).bytes.toString()),
        job,
        fence,
      );
      const second = worldOutput(
        parseJSON((await request("world", url, worldId)).bytes.toString()),
        job,
        fence,
      );
      must(
        first.identityHash === second.identityHash,
        "world_changed_on_reopen",
      );
      assets = first.assets;
      world = {
        worldId,
        scale: first.scale,
        identityHash: first.identityHash,
        metadata: first.metadata,
      };
    } else {
      const response = await request("result", resultURL!, requestId);
      if (response.headers["x-fal-request-id"] !== undefined)
        must(
          response.headers["x-fal-request-id"] === requestId,
          "stale_result_id",
        );
      assets = falOutput(parseJSON(response.bytes.toString()), job);
      // Per-request units do not prove total USD including PBR. Manual matched receipt is required.
    }
    const retained: Dict[] = [];
    for (const asset of assets) {
      const response = await request("download", asset.url);
      stage = "output";
      const total = ledger
        .rows("response")
        .filter((x) => x.type === "download")
        .reduce((n, x) => n + integer(x.bytes), 0);
      must(total <= protocol.limits.maxTotalAssetBytes, "asset_total_limit");
      const metadata = inspectAsset(response.bytes, asset, job);
      const evidence = ledger.evidence(response.bytes, "bin");
      retained.push({ ...asset, ...evidence, metadata });
    }
    stage = "output";
    const result = {
      jobId: job.id,
      protocolHash,
      requestId,
      provider: job.provider,
      requestedModel: job.model,
      actualModel: world ? object(world.metadata).actualModel : null,
      inputHash: hash(canonical(input)),
      world,
      assets: retained,
      finishedAt: clock.now(),
      requiresManualReview: true,
    };
    const evidence = ledger.evidence(Buffer.from(canonical(result)), "json");
    ledger.append("result", { jobId: job.id, ...evidence });
    return {
      jobId: job.id,
      status: ledger.rows("billing", job.id).length
        ? "awaiting_output_review"
        : "awaiting_billing_and_output_review",
      ...ledger.summary(),
    };
  } catch (error) {
    // Never persist provider messages, response bodies, headers or credential-bearing errors.
    ledger.append("stop", {
      jobId: job.id,
      stage,
      reason: safeFailureReason(error),
      billing: ledger.rows("billing", job.id).length ? "REPORTED" : "UNKNOWN",
    });
    return { jobId: job.id, status: "STOPPED", stage, ...ledger.summary() };
  }
}
