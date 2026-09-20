import {
  continuation,
  continuationHash,
  ContinuationLedger,
} from "./continuation-ledger.ts";
import {
  worldOutput,
  inspectAsset,
  validatedAssetURL,
  type Asset,
} from "./outputs.ts";
import { authHeaders, type Transport } from "./transport.ts";
import { responseByteLimit, type Clock } from "./runner.ts";
import {
  canonical,
  hash,
  must,
  parseJSON,
  protocol,
  protocolHash,
  safeFailureReason,
  type Dict,
} from "./protocol.ts";
import { worldFence } from "./world-metadata.ts";

export async function recoverRoom(
  ledger: ContinuationLedger,
  transport: Transport,
  credentials: Record<string, string>,
  clock: Clock = { now: Date.now, sleep: async () => {} },
) {
  must(!ledger.rows("stop").length, "experiment_stopped");
  must(
    !ledger.rows("recovery_begin").length,
    "room_recovery_already_attempted",
  );
  const job = protocol.jobs[0],
    started = clock.now(),
    { worldId, operationId } = continuation.room;
  const headers = authHeaders("worldlabs", credentials, false);
  // Successful operation/world binding is from frozen historical recovery evidence, not a new API claim.
  const fence = worldFence(
    { operation_id: operationId, done: true, response: { world_id: worldId } },
    job,
    operationId,
    ledger.rows("reserve", job.id)[0],
  );
  ledger.append("recovery_begin", {
    jobId: job.id,
    continuationHash,
    operationId,
    worldId,
    started,
  });
  let stage = "world";
  const request = async (
    type: "world" | "download",
    url: string,
    asset?: Asset,
  ) => {
    stage = type;
    must(
      clock.now() - started < continuation.recovery.deadlineMs,
      "job_deadline",
    );
    if (type === "world")
      must(
        url === `https://api.worldlabs.ai/marble/v1/worlds/${worldId}`,
        "stale_world_id",
      );
    else
      must(
        asset && validatedAssetURL(asset) === url,
        "asset_provenance_required",
      );
    const limit = responseByteLimit(ledger, type);
    ledger.append("request", {
      jobId: job.id,
      type,
      urlHash: hash(url),
      at: clock.now(),
      ...(asset ? { role: asset.role } : {}),
    });
    const reply = await transport({
      url,
      method: "GET",
      headers: type === "world" ? headers : {},
      ...(asset ? { asset } : {}),
      limit,
      timeoutMs: Math.max(1, Math.min(60000, 900000 - (clock.now() - started))),
    });
    must(reply.status === 200 && reply.url === url, "http_or_redirect_failure");
    must(reply.bytes.length <= limit, "response_too_large");
    must(clock.now() - started < 900000, "job_deadline");
    for (const secret of Object.values(credentials).filter(Boolean))
      must(!reply.bytes.includes(Buffer.from(secret)), "secret_in_response");
    ledger.append("response", {
      jobId: job.id,
      type,
      status: reply.status,
      bytes: reply.bytes.length,
      bodyHash: hash(reply.bytes),
    });
    return reply;
  };
  try {
    const url = `https://api.worldlabs.ai/marble/v1/worlds/${worldId}`;
    const first = worldOutput(
      parseJSON((await request("world", url)).bytes.toString()),
      job,
      fence,
    );
    const second = worldOutput(
      parseJSON((await request("world", url)).bytes.toString()),
      job,
      fence,
    );
    must(first.identityHash === second.identityHash, "world_changed_on_reopen");
    const assets: Dict[] = [];
    for (const asset of first.assets) {
      const response = await request("download", asset.url, asset);
      stage = "output";
      const metadata = inspectAsset(response.bytes, asset, job);
      assets.push({
        ...asset,
        ...ledger.evidence(response.bytes, "bin"),
        metadata,
      });
    }
    const result = {
      jobId: job.id,
      protocolHash,
      continuationHash,
      requestId: operationId,
      provider: "worldlabs",
      requestedModel: job.model,
      actualModel: first.metadata.actualModel,
      inputHash: fence.inputHash,
      world: {
        worldId,
        scale: first.scale,
        identityHash: first.identityHash,
        metadata: first.metadata,
      },
      assets,
      finishedAt: clock.now(),
      requiresManualReview: true,
      recoveredExistingWorld: true,
    };
    const evidence = ledger.evidence(Buffer.from(canonical(result)), "json");
    ledger.append("result", { jobId: job.id, ...evidence });
    ledger.append("recovery_complete", {
      jobId: job.id,
      resultSHA256: evidence.sha256,
      worldId,
    });
    return { status: "awaiting_output_review", ...ledger.summary() };
  } catch (error) {
    ledger.append("stop", {
      jobId: job.id,
      stage,
      reason: safeFailureReason(error),
      billing: "REPORTED",
      continuationHash,
    });
    return { status: "STOPPED", stage, ...ledger.summary() };
  }
}
