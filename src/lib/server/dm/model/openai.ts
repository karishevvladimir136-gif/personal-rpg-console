import "server-only";
import { dmModelSpec } from "../../../model-runtime/dm-models.ts";
import { STANDARD_SERVICE_TIER } from "../../../model-runtime/defaults.ts";
import { modelReasoning } from "../config.ts";
import {
  DmModelError,
  type DmMessage,
  type DmModel,
  type DmModelErrorKind,
  type DmModelEvent,
  type DmModelOptions,
  type DmModelRequest,
  type DmStopReason,
} from "./contracts.ts";
import {
  errorKindForStatus,
  retryAfterMs,
  safeProviderMessage,
  sseEvents,
  transportFailure,
  withRetries,
} from "./transport.ts";

const ENDPOINT = "https://api.openai.com/v1/responses";
// 429s that will not recover by waiting (docs/MODELS.md).
const BILLING_CODES = new Set(["insufficient_quota", "credit_balance_exhausted",
  "organization_spend_limit_exceeded", "project_spend_limit_exceeded", "organization_usage_limit_exceeded"]);

type Item = Record<string, unknown> & { type?: string };
type StreamEvent = {
  type?: string;
  delta?: string;
  output_index?: number;
  item?: Item;
  code?: string | null;
  message?: string;
  response?: {
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      input_tokens_details?: { cached_tokens?: number; cache_write_tokens?: number };
      output_tokens_details?: { reasoning_tokens?: number };
    };
    incomplete_details?: { reason?: string } | null;
    error?: { code?: string | null; message?: string } | null;
  };
};

function openAiInput(messages: DmMessage[], modelId: string): Item[] {
  return messages.flatMap((message): Item[] => {
    if (message.role === "user") return [{ role: "user", content: message.text }];
    if (message.role === "tool_results")
      return message.results.map((result) => ({ type: "function_call_output", call_id: result.callId,
        output: result.isError ? `ERROR: ${result.output}` : result.output }));
    // Reasoning items (encrypted with store: false) go back with the tool outputs.
    if (message.native?.providerId === "openai" && message.native.modelId === modelId)
      return message.native.items as Item[];
    return [
      ...(message.text ? [{ role: "assistant", content: message.text }] : []),
      ...message.toolCalls.map((call) => ({ type: "function_call", call_id: call.id,
        name: call.name, arguments: call.arguments })),
    ];
  });
}

/** The exact Responses API body for one request (exported for contract tests). */
export function openAiRequestBody(modelId: string, request: DmModelRequest) {
  const stable = request.system.filter((block) => block.cache).map((block) => block.text).join("\n\n");
  const volatile = request.system.filter((block) => !block.cache).map((block) => block.text).join("\n\n");
  return {
    model: modelId,
    stream: true,
    store: false,
    service_tier: STANDARD_SERVICE_TIER,
    reasoning: { effort: modelReasoning(modelId, request.effort) },
    // Prompt caching is automatic: the stable instructions form the prefix.
    instructions: stable,
    input: [
      ...(volatile ? [{ role: "developer", content: volatile }] : []),
      ...openAiInput(request.messages, modelId),
    ],
    ...(request.toolset && request.toolset.openai.length
      ? { tools: request.toolset.openai, tool_choice: "auto", parallel_tool_calls: true } : {}),
    max_output_tokens: request.maxOutputTokens,
    truncation: "disabled",
    include: ["reasoning.encrypted_content"],
  };
}

function errorKind(code: string | null | undefined): DmModelErrorKind {
  if (!code) return "retryable_transport";
  if (BILLING_CODES.has(code)) return "provider_rejected";
  if (code === "rate_limit_exceeded" || code === "slow_down") return "rate_limited";
  if (code === "server_error" || code === "server_is_overloaded") return "retryable_transport";
  if (code === "invalid_api_key") return "not_configured";
  return "provider_rejected";
}

async function httpFailure(response: Response, apiKey: string): Promise<DmModelError> {
  let payload: { error?: { code?: unknown; type?: unknown; message?: unknown } } | null = null;
  try {
    payload = JSON.parse(await response.text());
  } catch {
    /* keep the status only */
  }
  const code = typeof payload?.error?.code === "string" ? payload.error.code
    : typeof payload?.error?.type === "string" ? payload.error.type : null;
  const kind: DmModelErrorKind = response.status === 429 && code && BILLING_CODES.has(code)
    ? "provider_rejected" : errorKindForStatus(response.status);
  return new DmModelError(kind,
    safeProviderMessage(payload?.error?.message, apiKey, `OpenAI request failed with HTTP ${response.status}`),
    { httpStatus: response.status, providerCode: code, retryAfterMs: retryAfterMs(response.headers) });
}

function usageEvent(event: StreamEvent): DmModelEvent {
  const usage = event.response?.usage ?? {};
  return { type: "usage", usage: {
    inputTokens: Number(usage.input_tokens ?? 0),
    outputTokens: Number(usage.output_tokens ?? 0),
    cacheReadTokens: Number(usage.input_tokens_details?.cached_tokens ?? 0),
    cacheWriteTokens: Number(usage.input_tokens_details?.cache_write_tokens ?? 0),
    reasoningTokens: usage.output_tokens_details?.reasoning_tokens ?? null,
  } };
}

async function* parseStream(body: ReadableStream<Uint8Array>, modelId: string,
  apiKey: string): AsyncGenerator<DmModelEvent> {
  const items: Item[] = [];
  let toolCalls = 0;
  let refused = false;
  const native = () => ({ providerId: "openai" as const, modelId, items: items.filter(Boolean) });
  for await (const sse of sseEvents(body)) {
    let event: StreamEvent;
    try {
      event = JSON.parse(sse.data);
    } catch {
      throw new DmModelError("retryable_transport", "malformed event in the OpenAI stream");
    }
    switch (event.type) {
      case "response.output_text.delta":
        if (event.delta) yield { type: "text_delta", text: event.delta };
        break;
      case "response.refusal.delta":
        refused = true;
        break;
      case "response.output_item.done": {
        const item = event.item ?? {};
        items[event.output_index ?? items.length] = item;
        if (item.type === "function_call") {
          toolCalls++;
          yield { type: "tool_call", id: String(item.call_id), name: String(item.name),
            arguments: String(item.arguments ?? "") };
        }
        if (item.type === "message" && Array.isArray(item.content) &&
          item.content.some((part: { type?: string }) => part?.type === "refusal"))
          refused = true;
        break;
      }
      case "response.completed": {
        yield usageEvent(event);
        const reason: DmStopReason = refused ? "refusal" : toolCalls ? "tool_use" : "end";
        yield { type: "stop", reason, providerReason: "completed", native: native() };
        return;
      }
      case "response.incomplete": {
        yield usageEvent(event);
        const why = event.response?.incomplete_details?.reason ?? null;
        yield { type: "stop", reason: why === "max_output_tokens" ? "max_tokens"
          : why === "content_filter" ? "refusal" : "other", providerReason: why, native: native() };
        return;
      }
      case "response.failed": {
        const error = event.response?.error;
        throw new DmModelError(errorKind(error?.code), safeProviderMessage(error?.message, apiKey,
          "the OpenAI response failed"), { providerCode: error?.code ?? null });
      }
      case "error":
        throw new DmModelError(errorKind(event.code), safeProviderMessage(event.message, apiKey,
          "OpenAI stream error"), { providerCode: event.code ?? null });
      default:
        break; // created, in_progress, deltas of reasoning or arguments, etc.
    }
  }
  throw new DmModelError("retryable_transport", "the OpenAI stream ended before the response finished");
}

export function createOpenAiDmModel(modelId = "gpt-6-astra", options: DmModelOptions = {}): DmModel {
  if (!dmModelSpec("openai", modelId))
    throw new DmModelError("not_configured", `unknown OpenAI DM model ${modelId}`);
  async function* attempt(request: DmModelRequest, signal: AbortSignal): AsyncGenerator<DmModelEvent> {
    const apiKey = (options.apiKey ?? process.env.OPENAI_API_KEY ?? "").trim();
    if (!apiKey) throw new DmModelError("not_configured", "OPENAI_API_KEY is not set on the server");
    let response: Response;
    try {
      response = await (options.fetcher ?? fetch)(ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(openAiRequestBody(modelId, request)),
        signal,
      });
    } catch (error) {
      throw transportFailure(error, request.signal);
    }
    if (!response.ok) throw await httpFailure(response, apiKey);
    if (!response.body) throw new DmModelError("retryable_transport", "the OpenAI response had no body");
    try {
      yield* parseStream(response.body, modelId, apiKey);
    } catch (error) {
      throw transportFailure(error, request.signal);
    }
  }
  return {
    providerId: "openai",
    modelId,
    stream: (request) => withRetries((signal) => attempt(request, signal), options, request.signal),
  };
}
