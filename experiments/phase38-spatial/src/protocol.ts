import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
export type Dict = Record<string, unknown>;
const assertionCodes = new WeakMap<Error, string>();
export function must(ok: unknown, code: string): asserts ok {
  if (!ok) {
    const error = new Error(code);
    assertionCodes.set(error, code);
    throw error;
  }
}
const safeCodes = new Set([
  "invalid_object",
  "invalid_text",
  "invalid_integer",
  "invalid_json",
  "invalid_id",
  "world_job_fence",
  "world_submission_fence",
  "world_operation_incomplete",
  "stale_request_id",
  "stale_world_id",
  "world_display_name_shape",
  "model_pin",
  "stale_world_time",
  "hosted_world_url",
  "world_prompt_shape",
  "world_permission_shape",
  "world_privacy_unverified",
  "world_assets_unavailable",
  "invalid_scale",
  "world_changed_on_reopen",
  "unsafe_url",
  "asset_host_not_allowed",
  "invalid_asset_path",
  "unsafe_api_url",
  "endpoint_pin",
  "world_api_pin",
  "fal_receipt_pin",
  "http_or_redirect_failure",
  "job_deadline",
  "response_too_large",
  "secret_in_response",
  "poll_limit",
  "provider_status_failure",
  "invalid_status",
  "unexpected_attempts",
  "unexpected_fallback",
  "provider_output_error",
  "stale_result_id",
  "billing_exceeds_frozen_price",
  "billing_evidence_hash",
  "billing_request_mismatch",
  "billing_ceiling",
  "asset_total_limit",
  "unsupported_or_invalid_image",
  "invalid_png",
  "invalid_jpeg",
  "invalid_glb",
  "invalid_glb_json",
  "unsupported_or_invalid_geometry",
  "empty_glb",
  "unsupported_glb_extension",
  "external_glb_buffer",
  "invalid_glb_binary",
  "external_glb_material",
  "missing_glb_positions",
  "missing_pbr",
  "invalid_spz",
  "unsupported_spz",
  "invalid_spz_streams",
  "truncated_spz",
  "invalid_spz_size",
  "spz_expansion_limit",
  "invalid_spz_stream",
  "invalid_spz_trailer",
  "empty_asset",
  "incompatible_panorama",
]);
export function safeFailureReason(error: unknown): string {
  const code = error instanceof Error ? assertionCodes.get(error) : undefined;
  return code && safeCodes.has(code) ? code : "unexplained_or_invalid_response";
}
export function parseJSON(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    must(false, "invalid_json");
  }
}
export function object(v: unknown): Dict {
  must(
    v !== null && typeof v === "object" && !Array.isArray(v),
    "invalid_object",
  );
  return v as Dict;
}
export function text(v: unknown): string {
  must(
    typeof v === "string" && v.length > 0 && v.length <= 8192,
    "invalid_text",
  );
  return v;
}
export function integer(v: unknown, min = 0): number {
  must(
    typeof v === "number" && Number.isSafeInteger(v) && v >= min,
    "invalid_integer",
  );
  return v;
}
export function canonical(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  if (v && typeof v === "object")
    return `{${Object.entries(v)
      .sort(([a], [b]) => a.localeCompare(b, "en"))
      .map(([k, x]) => `${JSON.stringify(k)}:${canonical(x)}`)
      .join(",")}}`;
  const s = JSON.stringify(v);
  must(s !== undefined, "invalid_json");
  return s;
}
export function hash(v: string | Uint8Array): string {
  return createHash("sha256").update(v).digest("hex");
}
export type Job = {
  id: string;
  provider: "worldlabs" | "fal";
  model: string;
  endpoint: string;
  reserveMicroUSD: number;
  maxPriceMicroUSD: number;
  input: Dict;
};
export type Protocol = {
  version: string;
  architectureCommit: string;
  syntheticOnly: boolean;
  limits: Record<string, number>;
  assetHosts: Record<string, string[]>;
  falHeaders: Record<string, string>;
  jobs: Job[];
};
export const protocol = JSON.parse(
  readFileSync(new URL("../protocol.json", import.meta.url), "utf8"),
) as Protocol;
export const protocolHash = hash(canonical(protocol));
function freeze(v: unknown) {
  if (v && typeof v === "object") {
    Object.freeze(v);
    Object.values(v).forEach(freeze);
  }
}
freeze(protocol);
export function jobById(id: string): Job {
  const j = protocol.jobs.find((x) => x.id === id);
  must(j, "unknown_job");
  return j;
}
export function safeId(v: unknown): string {
  const s = text(v);
  must(/^[a-zA-Z0-9_-]{1,120}$/.test(s), "invalid_id");
  return s;
}
export function assetUrl(value: unknown, provider: string): string {
  const s = text(value);
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    must(false, "unsafe_url");
  }
  must(
    u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      !u.port &&
      !u.hash &&
      !s.includes("\\") &&
      !/%(?:2e|2f|5c)/i.test(s.split("?")[0]) &&
      !/\/\.\.?\//.test(s.split("?")[0]),
    "unsafe_url",
  );
  must(
    protocol.assetHosts[provider]?.includes(u.hostname),
    "asset_host_not_allowed",
  );
  must(u.pathname !== "/", "invalid_asset_path");
  return s;
}
export function apiUrl(
  value: unknown,
  job: Job,
  kind: "submit" | "poll" | "result" | "world",
  id?: string,
): string {
  const s = text(value),
    u = new URL(s);
  must(
    u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      !u.port &&
      !u.hash &&
      !u.search &&
      !s.includes("\\") &&
      !s.includes("%"),
    "unsafe_api_url",
  );
  if (kind === "submit") must(s === job.endpoint, "endpoint_pin");
  else if (job.provider === "worldlabs")
    must(
      s ===
        `https://api.worldlabs.ai/marble/v1/${kind === "poll" ? "operations" : "worlds"}/${safeId(id)}`,
      "world_api_pin",
    );
  else {
    const roots = [job.model, job.model.split("/").slice(0, 2).join("/")];
    const tails =
      kind === "poll"
        ? [`/requests/${safeId(id)}/status`]
        : [`/requests/${safeId(id)}`, `/requests/${safeId(id)}/response`];
    must(
      roots.some((root) =>
        tails.some((t) => s === `https://queue.fal.run/${root}${t}`),
      ),
      "fal_receipt_pin",
    );
  }
  return s;
}
