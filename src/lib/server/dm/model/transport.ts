import "server-only";
import { diagnosticMessage } from "../provider.ts";
import { DmModelError, type DmModelErrorKind, type DmModelEvent, type DmModelOptions } from "./contracts.ts";

export const DEFAULT_TIMEOUT_MS = 600_000;
export const DEFAULT_MAX_RETRIES = 2;
const MAX_RETRY_WAIT_MS = 60_000;

export type SseEvent = { event: string | null; data: string };

/** Server-sent events from a fetch body. Comment lines are ignored. */
export async function* sseEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<SseEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const parse = (block: string): SseEvent | null => {
    let event: string | null = null;
    const data: string[] = [];
    for (const line of block.split("\n")) {
      if (!line || line.startsWith(":")) continue;
      const colon = line.indexOf(":");
      const field = colon < 0 ? line : line.slice(0, colon);
      const value = colon < 0 ? "" : line.slice(colon + 1).replace(/^ /, "");
      if (field === "event") event = value;
      else if (field === "data") data.push(value);
    }
    return data.length || event ? { event, data: data.join("\n") } : null;
  };
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n?/g, "\n");
      let end: number;
      while ((end = buffer.indexOf("\n\n")) >= 0) {
        const parsed = parse(buffer.slice(0, end));
        buffer = buffer.slice(end + 2);
        if (parsed) yield parsed;
      }
    }
    const tail = parse((buffer + decoder.decode()).replace(/\r\n?/g, "\n").trim());
    if (tail) yield tail;
  } finally {
    reader.releaseLock();
  }
}

export function retryAfterMs(headers: Headers | null | undefined): number | null {
  const value = headers?.get("retry-after");
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.round(seconds * 1000);
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, date - Date.now()) : null;
}

/** A provider message safe to log: keys and bearer tokens are redacted. */
export function safeProviderMessage(value: unknown, apiKey: string, fallback: string): string {
  return diagnosticMessage(value, apiKey) ?? fallback;
}

export function requestSignal(timeoutMs: number, caller?: AbortSignal): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs);
  return caller ? AbortSignal.any([timeout, caller]) : timeout;
}

/** Network/abort failure of fetch or of the body stream. */
export function transportFailure(error: unknown, caller?: AbortSignal): DmModelError {
  if (error instanceof DmModelError) return error;
  if (caller?.aborted) return new DmModelError("fatal", "request aborted by the caller");
  const name = error && typeof error === "object" ? (error as { name?: unknown }).name : null;
  return new DmModelError("retryable_transport",
    name === "TimeoutError" ? "request timed out" : "network error while talking to the model provider");
}

export function errorKindForStatus(status: number): DmModelErrorKind {
  if (status === 429) return "rate_limited";
  if (status === 401 || status === 403) return "not_configured";
  if (status === 408 || status === 409 || status >= 500) return "retryable_transport";
  return "provider_rejected";
}

/**
 * Runs one model request with automatic retries for transport and rate-limit
 * failures, but only while no event has reached the caller. Once anything was
 * yielded, a failure is surfaced (afterFirstEvent) and never retried, so text
 * already shown to the player is never repeated or replaced.
 */
export async function* withRetries(
  open: (signal: AbortSignal) => AsyncIterable<DmModelEvent>,
  options: Pick<DmModelOptions, "maxRetries" | "sleep" | "timeoutMs">,
  caller?: AbortSignal,
): AsyncGenerator<DmModelEvent> {
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  let emitted = false;
  for (let attempt = 0; ; attempt++) {
    try {
      for await (const event of open(requestSignal(options.timeoutMs ?? DEFAULT_TIMEOUT_MS, caller))) {
        emitted = true;
        yield event;
      }
      return;
    } catch (error) {
      const failure = transportFailure(error, caller);
      const detail = { ...failure.detail, attempts: attempt + 1, afterFirstEvent: emitted };
      const wait = failure.detail.retryAfterMs ?? 500 * 2 ** attempt;
      if (emitted || attempt >= maxRetries || caller?.aborted ||
        !["retryable_transport", "rate_limited"].includes(failure.kind) || wait > MAX_RETRY_WAIT_MS)
        throw new DmModelError(failure.kind, failure.message, detail);
      await sleep(wait);
    }
  }
}
