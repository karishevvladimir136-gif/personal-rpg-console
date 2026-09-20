import {
  canonical,
  hash,
  integer,
  jobById,
  must,
  object,
  safeId,
  text,
  type Dict,
  type Job,
} from "./protocol.ts";

// Build only from the durable submission/receipt and the matching completed operation.
// This is pure inspection: it performs no requests, downloads or ledger mutations.
export function worldFence(
  operation: unknown,
  job: Job,
  receiptId: string,
  submission: Dict,
) {
  const frozen = jobById(job.id);
  must(
    job.provider === "worldlabs" && canonical(job) === canonical(frozen),
    "world_job_fence",
  );
  must(
    submission.jobId === job.id &&
      submission.model === job.model &&
      submission.endpoint === job.endpoint &&
      submission.inputHash === hash(canonical(job.input)),
    "world_submission_fence",
  );
  const started = integer(submission.started, 1);
  const op = object(operation);
  must(op.operation_id === safeId(receiptId), "stale_request_id");
  must(
    op.done === true && !op.error && !op.error_type,
    "world_operation_incomplete",
  );
  for (const source of [op, object(op.response)]) {
    if (source.model !== undefined && source.model !== null)
      must(source.model === job.model, "model_pin");
    for (const field of ["model_attempts", "provider_attempts"])
      if (source[field] !== undefined)
        must(source[field] === 1, "unexpected_attempts");
    if (source.fallback !== undefined)
      must(source.fallback === false, "unexpected_fallback");
  }
  const response = object(op.response);
  const worldId = safeId(response.world_id ?? response.id);
  if (response.id !== undefined)
    must(response.id === worldId, "stale_world_id");
  if (op.metadata !== undefined && op.metadata !== null) {
    const metadata = object(op.metadata);
    if (metadata.world_id !== undefined && metadata.world_id !== null)
      must(metadata.world_id === worldId, "stale_world_id");
  }
  return Object.freeze({
    jobId: job.id,
    requestId: receiptId,
    worldId,
    started,
    inputHash: hash(canonical(job.input)),
    requestedModel: job.model,
  });
}
export type WorldFence = ReturnType<typeof worldFence>;

export function inspectWorldMetadata(
  value: unknown,
  job: Job,
  fence: WorldFence,
) {
  must(
    job.provider === "worldlabs" &&
      canonical(job) === canonical(jobById(job.id)) &&
      fence.jobId === job.id &&
      fence.requestedModel === job.model &&
      fence.inputHash === hash(canonical(job.input)),
    "world_submission_fence",
  );
  safeId(fence.requestId);
  safeId(fence.worldId);
  integer(fence.started, 1);
  const w = object(value);
  // Current Get World contract requires world_id. A conflicting legacy alias is rejected.
  must(
    w.world_id === fence.worldId &&
      (w.id === undefined || w.id === fence.worldId),
    "stale_world_id",
  );
  must(typeof w.display_name === "string", "world_display_name_shape");
  const actualModel = w.model == null ? null : text(w.model);
  must(actualModel === null || actualModel === job.model, "model_pin");
  let createdAt: string | null = null;
  if (w.created_at != null) {
    must(
      typeof w.created_at === "string" &&
        Number.isFinite(Date.parse(w.created_at)) &&
        Date.parse(w.created_at) >= fence.started - 5000,
      "stale_world_time",
    );
    createdAt = w.created_at;
  }
  must(
    w.world_marble_url === `https://marble.worldlabs.ai/world/${fence.worldId}`,
    "hosted_world_url",
  );
  let returnedPromptHash: string | null = null;
  let promptEchoMatches: boolean | null = null;
  if (w.world_prompt !== undefined) {
    const prompt = object(w.world_prompt);
    // These frozen jobs submit text prompts. Returned text may be recaptioned.
    must(
      prompt.type === "text" && typeof prompt.text_prompt === "string",
      "world_prompt_shape",
    );
    returnedPromptHash = hash(canonical(prompt));
    promptEchoMatches = canonical(prompt) === canonical(job.input.world_prompt);
  }
  let privacy: "private" | "public" | "unknown" = "unknown";
  if (w.permission != null) {
    const permission = object(w.permission);
    must(
      permission.public === undefined || typeof permission.public === "boolean",
      "world_permission_shape",
    );
    privacy =
      permission.public === false
        ? "private"
        : permission.public === true
          ? "public"
          : "unknown";
  }
  if (w.assets != null) object(w.assets);
  // No returned prompt/display name or signed URLs are included in this safe record.
  return {
    worldId: fence.worldId,
    requestId: fence.requestId,
    actualModel,
    createdAt,
    displayNameMatches: w.display_name === job.id,
    returnedPromptHash,
    promptEchoMatches,
    privacy,
    assetsPresent: w.assets != null,
  };
}
