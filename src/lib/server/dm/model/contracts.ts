// The provider-neutral DM model interface. One stream() call is exactly one
// request to the model; the turn loop that alternates model and tools is
// Stage 2. Facts behind the adapters: docs/MODELS.md.
import type { DmEffort, DmProviderId, DmUsage } from "../../../model-runtime/dm-models.ts";
import type { CompiledToolset } from "./schema-compiler.ts";

export type { DmEffort, DmProviderId, DmUsage } from "../../../model-runtime/dm-models.ts";

/** System prompt blocks in order. `cache: true` marks the stable prefix that
 * providers may cache; volatile blocks follow it. */
/** A system layer; `cache` marks a breakpoint, `ttl` the cache lifetime of that
 * block (polish item 12: the stable layers keep a one-hour cache so a player's
 * pause does not rewrite them; the provider decides what it can honour). */
export type DmSystemBlock = { text: string; cache: boolean; ttl?: "5m" | "1h" };

export type DmToolCall = { id: string; name: string; arguments: string };

/** The provider's own record of an assistant turn (Anthropic content blocks
 * including signed thinking; OpenAI output items including encrypted
 * reasoning). Sent back unchanged on the next request to the same model. */
export type DmNativeTurn = { providerId: DmProviderId; modelId: string; items: unknown[] };

export type DmMessage =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string; toolCalls: DmToolCall[]; native: DmNativeTurn | null }
  | { role: "tool_results"; results: { callId: string; output: string; isError: boolean }[] };

export type DmModelRequest = {
  system: DmSystemBlock[];
  messages: DmMessage[];
  toolset: CompiledToolset | null;
  /** Effort of this request. */
  effort: DmEffort;
  /** Effort the conversation started with, when `effort` differs from it
   * (a continuation after tool results at a lower level). Anthropic changes the
   * top-level value (which restarts the message cache); OpenAI keeps the
   * request-level value and inserts a configuration_update item. */
  turnEffort?: DmEffort;
  maxOutputTokens: number;
  signal?: AbortSignal;
  /** Opaque request label for diagnostics (an operation ID); never sent. */
  operationId?: string;
  /** Stable key for the provider's prompt-cache routing/accounting (a campaign ID). */
  cacheKey?: string;
};

export type DmStopReason = "end" | "tool_use" | "max_tokens" | "refusal" | "other";

export type DmModelEvent =
  | { type: "text_delta"; text: string }
  | { type: "tool_call"; id: string; name: string; arguments: string }
  | { type: "usage"; usage: DmUsage }
  | { type: "stop"; reason: DmStopReason; native: DmNativeTurn; providerReason: string | null };

export type DmModelErrorKind =
  | "retryable_transport"
  | "rate_limited"
  | "provider_rejected"
  | "not_configured"
  | "fatal";

export type DmModelErrorDetail = {
  httpStatus?: number | null;
  providerCode?: string | null;
  retryAfterMs?: number | null;
  /** True once any event reached the caller: such a failure is never retried. */
  afterFirstEvent?: boolean;
  attempts?: number;
};

export class DmModelError extends Error {
  readonly kind: DmModelErrorKind;
  readonly detail: DmModelErrorDetail;
  constructor(kind: DmModelErrorKind, message: string, detail: DmModelErrorDetail = {}) {
    super(message);
    this.name = "DmModelError";
    this.kind = kind;
    this.detail = detail;
  }
}

export interface DmModel {
  readonly providerId: DmProviderId;
  readonly modelId: string;
  stream(request: DmModelRequest): AsyncIterable<DmModelEvent>;
}

export type DmModelOptions = {
  /** Defaults to the provider key in the server environment, read per request. */
  apiKey?: string;
  fetcher?: typeof fetch;
  /** Overall request deadline in ms (default 10 minutes). */
  timeoutMs?: number;
  /** Automatic retries before the first event (default 2). */
  maxRetries?: number;
  /** Injectable for tests. */
  sleep?: (ms: number) => Promise<void>;
};
