import {
  apiUrl,
  hash,
  object,
  parseJSON,
  safeId,
  type Dict,
} from "../src/protocol.ts";
import { falOutput, validatedAssetURL, type Asset } from "../src/outputs.ts";
import {
  httpTransport,
  authHeaders,
  type Transport,
} from "../src/transport.ts";
import { ChestLedger, reserveChest } from "./state.ts";
import { manifest as c, check, reason } from "./contract.ts";
import { inspectChestGLB } from "./glb.ts";
export type Clock = { now: () => number; sleep: (ms: number) => Promise<void> };
export function validateIdentity(
  value: unknown,
  requestId?: string,
  queue = false,
) {
  const b = object(value);
  check(!b.error && !b.error_type, "chest_provider_error");
  if (queue || b.request_id !== undefined)
    check(
      requestId === undefined || b.request_id === requestId,
      "chest_request_id",
    );
  if (b.model != null) check(b.model === c.job.model, "chest_model");
  if (b.endpoint_id != null)
    check(b.endpoint_id === c.job.model, "chest_endpoint");
  if (b.provider != null) check(b.provider === "fal", "chest_provider");
  if (b.fallback !== undefined) check(b.fallback === false, "chest_fallback");
  for (const k of ["model_attempts", "provider_attempts"])
    if (b[k] !== undefined) check(b[k] === 1, "chest_multiple_attempts");
  if (queue)
    check(
      ["IN_QUEUE", "IN_PROGRESS", "COMPLETED"].includes(String(b.status)),
      "chest_queue_state",
    );
  return b;
}
export function requiredAsset(value: unknown, requestId: string) {
  const body = validateIdentity(value, requestId),
    normalized = { ...body };
  if (normalized.model == null) delete normalized.model;
  const assets = falOutput(normalized, c.job);
  check(assets.length === 1, "chest_one_asset");
  const asset = assets[0],
    url = validatedAssetURL(asset),
    descriptor = object(body.model_glb);
  check(
    new URL(url).pathname.toLowerCase().endsWith(".glb"),
    "chest_asset_format",
  );
  if (descriptor.content_type != null)
    check(
      [
        "model/gltf-binary",
        "application/octet-stream",
        "application/glb",
      ].includes(String(descriptor.content_type)),
      "chest_asset_content_type",
    );
  if (descriptor.file_size != null)
    check(
      Number.isSafeInteger(descriptor.file_size) &&
        Number(descriptor.file_size) > 0 &&
        Number(descriptor.file_size) <= c.limits.maxAssetBytes,
      "chest_descriptor_size",
    );
  return {
    asset,
    declaredSize: descriptor.file_size ?? null,
    actualModel: body.model ?? null,
  };
}
export async function runChest(
  ledger: ChestLedger,
  key: string,
  transport: Transport = httpTransport(),
  clock: Clock = {
    now: Date.now,
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
  },
) {
  check(ledger.entries.length === 0, "chest_attempt_already_started");
  const headers = authHeaders("fal", { fal: key }, true),
    started = clock.now();
  let stage = "reserve";
  reserveChest(ledger, started);
  const record = (kind: string, data: Dict) =>
    ledger.append(kind, { jobId: c.job.id, ...data });
  const request = async (
    type: "submit" | "poll" | "result" | "download",
    url: string,
    requestId?: string,
    asset?: Asset,
  ) => {
    stage = type;
    check(clock.now() - started < c.limits.deadlineMs, "chest_deadline");
    if (type === "download")
      check(
        asset && validatedAssetURL(asset) === url,
        "chest_asset_provenance",
      );
    else apiUrl(url, c.job, type, requestId);
    record("request", {
      type,
      method: type === "submit" ? "POST" : "GET",
      urlHash: hash(url),
      at: clock.now(),
      ...(requestId ? { requestId } : {}),
    });
    const limit =
      type === "download" ? c.limits.maxAssetBytes : c.limits.maxJsonBytes;
    const response = await transport({
      url,
      method: type === "submit" ? "POST" : "GET",
      headers:
        type === "download"
          ? {}
          : type === "submit"
            ? headers
            : authHeaders("fal", { fal: key }, false),
      ...(type === "submit" ? { body: JSON.stringify(c.job.input) } : {}),
      ...(asset ? { asset } : {}),
      limit,
      timeoutMs: Math.max(
        1,
        Math.min(
          c.limits.requestTimeoutMs,
          c.limits.deadlineMs - (clock.now() - started),
        ),
      ),
    });
    const units =
      type === "download"
        ? undefined
        : response.headers["x-fal-billable-units"];
    record("response", {
      type,
      status: response.status,
      exactURL: response.url === url,
      bytes: response.bytes.length,
      bodyHash: hash(response.bytes),
      billableUnits:
        units !== undefined &&
        /^\d+(?:\.\d+)?$/.test(units) &&
        Number.isFinite(Number(units))
          ? Number(units)
          : null,
      reportedUSD: null,
    });
    if (units !== undefined)
      check(
        /^\d+(?:\.\d+)?$/.test(units) && Number.isFinite(Number(units)),
        "chest_billing_metadata",
      );
    check(
      response.status === 200 && response.url === url,
      "chest_http_or_redirect",
    );
    check(clock.now() - started < c.limits.deadlineMs, "chest_deadline");
    check(response.bytes.length <= limit, "chest_response_limit");
    check(
      !response.bytes.includes(Buffer.from(key)),
      "chest_secret_in_response",
    );
    if (
      type !== "download" &&
      response.headers["x-fal-request-id"] !== undefined &&
      requestId
    )
      check(
        response.headers["x-fal-request-id"] === requestId,
        "chest_header_request_id",
      );
    return response;
  };
  try {
    const submitted = await request("submit", c.job.endpoint);
    let body = object(parseJSON(submitted.bytes.toString("utf8")));
    const requestId = safeId(body.request_id);
    if (submitted.headers["x-fal-request-id"] !== undefined)
      check(
        submitted.headers["x-fal-request-id"] === requestId,
        "chest_header_request_id",
      );
    if (body.status === undefined) body = { ...body, status: "IN_QUEUE" };
    validateIdentity(body, requestId, true);
    const pollURL = apiUrl(body.status_url, c.job, "poll", requestId),
      resultURL = apiUrl(body.response_url, c.job, "result", requestId);
    record("receipt", {
      requestId,
      provider: "fal",
      requestedModel: c.job.model,
      actualModel: body.model ?? null,
      statusURLHash: hash(pollURL),
      resultURLHash: hash(resultURL),
    });
    record("queue", { requestId, state: body.status, at: clock.now() });
    let polls = 0;
    while (body.status !== "COMPLETED") {
      check(polls++ < c.limits.polls, "chest_poll_limit");
      await clock.sleep(c.limits.pollIntervalMs);
      const polled = await request("poll", pollURL, requestId);
      body = validateIdentity(
        parseJSON(polled.bytes.toString("utf8")),
        requestId,
        true,
      );
      if (body.response_url !== undefined)
        check(body.response_url === resultURL, "chest_changed_result_url");
      if (body.status_url !== undefined)
        check(body.status_url === pollURL, "chest_changed_status_url");
      record("queue", { requestId, state: body.status, at: clock.now() });
    }
    const result = await request("result", resultURL, requestId);
    const qualified = requiredAsset(
      parseJSON(result.bytes.toString("utf8")),
      requestId,
    );
    const url = validatedAssetURL(qualified.asset);
    record("asset", {
      requestId,
      urlHash: hash(url),
      hostname: new URL(url).hostname,
      format: "glb",
      declaredBytes: qualified.declaredSize,
      actualModel: qualified.actualModel,
      requiredAssets: 1,
      billing: "UNKNOWN",
    });
    const downloaded = await request(
      "download",
      url,
      requestId,
      qualified.asset,
    );
    check(
      qualified.declaredSize === null ||
        downloaded.bytes.length === qualified.declaredSize,
      "chest_final_size",
    );
    const contentType = downloaded.headers["content-type"];
    if (contentType)
      check(
        [
          "model/gltf-binary",
          "application/octet-stream",
          "application/glb",
        ].includes(contentType.split(";", 1)[0].trim().toLowerCase()),
        "chest_download_type",
      );
    ledger.retain(downloaded.bytes);
    stage = "inspection";
    const inspected = inspectChestGLB(downloaded.bytes);
    record("inspection", inspected);
    record("end", {
      status: "AWAITING_OWNER_REVIEW",
      billing: "UNKNOWN",
      chestReportedMicroUSD: null,
      approval: false,
      nextReleased: false,
      finished: clock.now(),
    });
  } catch (error) {
    record("end", {
      status: "STOPPED",
      stage,
      reason: reason(error),
      billing: "UNKNOWN",
      chestReportedMicroUSD: null,
      approval: false,
      nextReleased: false,
      finished: clock.now(),
    });
  }
  return ledger.summary();
}
