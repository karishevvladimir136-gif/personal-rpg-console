import "server-only";
import { dmModelSpec } from "../../../model-runtime/dm-models.ts";
import {
  anthropicEndpoint,
  anthropicErrorCode,
  bedrockFailureKind,
  doorFailure,
  type AnthropicEndpoint,
} from "../../anthropic-endpoint.ts";
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

type Block = Record<string, unknown> & { type: string };
type Usage = { input_tokens?: number; output_tokens?: number;
  cache_creation_input_tokens?: number; cache_read_input_tokens?: number;
  cache_creation?: { ephemeral_5m_input_tokens?: number; ephemeral_1h_input_tokens?: number } };
type StreamData = {
  type?: string;
  index: number;
  message?: { usage?: Usage };
  content_block?: Block;
  delta?: { type?: string; text?: string; partial_json?: string; thinking?: string;
    signature?: string; stop_reason?: string | null };
  usage?: Usage;
  error?: { type?: unknown; message?: unknown };
};

function completeJson(text: string): boolean {
  try {
    const value = JSON.parse(text || "{}");
    return !!value && typeof value === "object" && !Array.isArray(value);
  } catch {
    return false;
  }
}

/** Fix run A1: the blocks that may go back to the provider — a cut message (stop `max_tokens`) can end in a
 * tool call with half its arguments, a thinking block without its signature or an empty text block. */
export function completeBlocks(blocks: Block[]): Block[] {
  return blocks.filter((block) => {
    if (!block) return false;
    if (block.type === "tool_use") return !block.incomplete;
    if (block.type === "thinking") return typeof block.signature === "string" && block.signature.length > 0;
    // A whitespace-only text block (interleaved thinking can leave one before the cut) is refused by the API.
    if (block.type === "text") return typeof block.text === "string" && block.text.trim().length > 0;
    return true;
  }).map((block) => {
    if (block.type !== "tool_use") return block;
    const { incomplete: _incomplete, ...rest } = block;
    void _incomplete;
    return rest as Block;
  });
}

function parseArguments(text: string): unknown {
  try {
    return JSON.parse(text || "{}");
  } catch {
    return {};
  }
}

/** Fix run A2: the messages that end a cached prefix inside a turn — the last message (this request's
 * end) and the message before the latest assistant reply (where the previous request ended, so its entry
 * is found even when the reply and its tool results are more than the provider's 20-block lookback).
 * Both are always user-role messages (a user line or tool results). */
export function turnBreakpoints(messages: DmMessage[]): number[] {
  if (!messages.length) return [];
  const end = messages.length - 1;
  let lastAssistant = -1;
  messages.forEach((message, index) => { if (message.role === "assistant") lastAssistant = index; });
  const previous = lastAssistant - 1;
  return previous >= 0 && previous !== end && messages[previous].role !== "assistant" ? [previous, end] : [end];
}

const EPHEMERAL = { type: "ephemeral" } as const;

function anthropicMessages(messages: DmMessage[], modelId: string, breakpoints: number[] = []) {
  return messages.map((message, index) => {
    const mark = breakpoints.includes(index);
    if (message.role === "user")
      return { role: "user", content: [{ type: "text", text: message.text, ...(mark ? { cache_control: EPHEMERAL } : {}) }] };
    if (message.role === "tool_results")
      return { role: "user", content: message.results.map((result, at) => ({
        type: "tool_result", tool_use_id: result.callId, content: result.output,
        ...(result.isError ? { is_error: true } : {}),
        ...(mark && at === message.results.length - 1 ? { cache_control: EPHEMERAL } : {}),
      })) };
    // Thinking blocks (with signatures) must return unchanged to the same model.
    if (message.native?.providerId === "anthropic" && message.native.modelId === modelId)
      return { role: "assistant", content: message.native.items };
    return { role: "assistant", content: [
      ...(message.text ? [{ type: "text", text: message.text }] : []),
      ...message.toolCalls.map((call) => ({ type: "tool_use", id: call.id, name: call.name,
        input: parseArguments(call.arguments) })),
    ] };
  });
}

/** The exact Messages API body for one request (exported for contract tests). */
export function anthropicRequestBody(modelId: string, request: DmModelRequest) {
  // Polish 2 §4: four explicit breakpoints at most (the provider's limit) — how to
  // DM, the world, the last block of the conversation's history, the living
  // dossier — and no top-level breakpoint: the polish run showed that the
  // automatic one at the end of the messages wrote the session tail, the «now»
  // block and the turn's own messages (about 21,000 tokens) every turn at the
  // write rate for a continuation that mostly never came (cache writes 50–76% of
  // the DM's cost). Everything after the last breakpoint is now paid once at the
  // plain input rate; the history's earlier blocks are found at their boundaries.
  // Fix run A2 (item 83): a turn's request also caches its own conversation — the last message and the
  // end of the previous request — so a continuation reads the tail, the «now» block and the turn so far at
  // the read rate. Those take the breakpoints first; the system keeps the latest of its own (the history's
  // end, the world, the role) up to the provider's four.
  const messageBreakpoints = request.cacheTurn ? turnBreakpoints(request.messages) : [];
  const cached = request.system.flatMap((block, index) => (block.cache && block.breakpoint !== false ? [index] : []))
    .slice(-(4 - messageBreakpoints.length));
  return {
    model: modelId,
    max_tokens: request.maxOutputTokens,
    stream: true,
    // Polish item 12: the stable layers ask for a one-hour cache (a write costs
    // 2× instead of 1.25×, but a player's pause past five minutes no longer
    // rewrites them); longer lifetimes must come first, which the layer order gives.
    system: request.system.map((block, index) => ({ type: "text", text: block.text,
      ...(cached.includes(index) ? { cache_control: { type: "ephemeral", ...(block.ttl === "1h" ? { ttl: "1h" } : {}) } } : {}) })),
    messages: anthropicMessages(request.messages, modelId, messageBreakpoints),
    ...(request.toolset && request.toolset.anthropic.length ? { tools: request.toolset.anthropic } : {}),
    // Adaptive thinking is always on for Opus 5.5; effort is the only control.
    // A continuation at another level than the turn started with is a top-level
    // change: the per-message form (beta) only takes effect from the next user
    // turn with new input, never after tool results, so the message cache (and
    // possibly the system cache) restarts for that request (docs/MODELS.md).
    output_config: { effort: request.effort },
  };
}

function errorKind(type: unknown): DmModelErrorKind {
  switch (type) {
    case "overloaded_error":
    case "api_error":
    case "timeout_error":
      return "retryable_transport";
    case "rate_limit_error":
      return "rate_limited";
    case "authentication_error":
    case "permission_error":
      return "not_configured";
    default:
      // A Bedrock exception named in a stream's error event (ANTHROPIC_PROVIDERS_1 §5).
      return bedrockFailureKind(typeof type === "string" ? type : null) ?? "provider_rejected";
  }
}

function stopReason(value: unknown): DmStopReason {
  return value === "end_turn" ? "end" : value === "tool_use" ? "tool_use"
    : value === "max_tokens" ? "max_tokens" : value === "refusal" ? "refusal" : "other";
}

async function httpFailure(response: Response, apiKey: string, door: AnthropicEndpoint,
  modelId: string, providerModel: string): Promise<DmModelError> {
  let payload: { error?: { type?: unknown; message?: unknown }; message?: unknown } | null = null;
  try {
    payload = JSON.parse(await response.text());
  } catch {
    /* keep the status only */
  }
  const code = anthropicErrorCode(payload, response.headers);
  const providerMessage = safeProviderMessage(payload?.error?.message ?? payload?.message, apiKey,
    `${door.providerLabel} request failed with HTTP ${response.status}`);
  // ANTHROPIC_PROVIDERS_1 §5: the door decides first — Bedrock's throttling waits like a rate limit, a refused or
  // unserved model is not configured (named), OpenRouter's «insufficient credits» stops; else the status mapping.
  const decided = doorFailure(door, response.status, code, providerMessage, modelId, providerModel);
  const kind = decided.kind ?? (response.status === 529 ? "retryable_transport" : errorKindForStatus(response.status));
  const message = decided.message ?? providerMessage;
  return new DmModelError(kind, message,
    { httpStatus: response.status, providerCode: code, retryAfterMs: retryAfterMs(response.headers) });
}

async function* parseStream(body: ReadableStream<Uint8Array>, modelId: string,
  apiKey: string): AsyncGenerator<DmModelEvent> {
  const blocks: Block[] = [];
  const toolJson = new Map<number, string>();
  const usage = { input: 0, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0, output: 0 };
  let reason: unknown = null;
  for await (const sse of sseEvents(body)) {
    let data: StreamData;
    try {
      data = JSON.parse(sse.data);
    } catch {
      throw new DmModelError("retryable_transport", "malformed event in the Anthropic stream");
    }
    switch (data.type) {
      case "message_start": {
        const start = data.message?.usage ?? {};
        usage.input = Number(start.input_tokens ?? 0);
        usage.cacheWrite = Number(start.cache_creation_input_tokens ?? 0);
        usage.cacheWrite1h = Number(start.cache_creation?.ephemeral_1h_input_tokens ?? 0);
        usage.cacheRead = Number(start.cache_read_input_tokens ?? 0);
        usage.output = Number(start.output_tokens ?? 0);
        break;
      }
      case "content_block_start": {
        const block: Block = { type: "unknown", ...data.content_block };
        if (block.type === "tool_use") toolJson.set(data.index, "");
        blocks[data.index] = block;
        break;
      }
      case "content_block_delta": {
        const block = blocks[data.index];
        const delta = data.delta ?? {};
        if (!block) break;
        if (delta.type === "text_delta" && delta.text) {
          block.text = String(block.text ?? "") + delta.text;
          yield { type: "text_delta", text: delta.text };
        } else if (delta.type === "input_json_delta") {
          toolJson.set(data.index, (toolJson.get(data.index) ?? "") + delta.partial_json);
        } else if (delta.type === "thinking_delta") {
          block.thinking = String(block.thinking ?? "") + delta.thinking;
        } else if (delta.type === "signature_delta") {
          block.signature = String(block.signature ?? "") + delta.signature;
        }
        break;
      }
      case "content_block_stop": {
        const block = blocks[data.index];
        if (block?.type === "tool_use") {
          const json = toolJson.get(data.index) || "{}";
          // Fix run A1 (items 32, 56, 73): a tool call the output cap cut ends in invalid JSON. It is
          // dropped — never executed, never sent back to the provider (the next request failed on it).
          if (!completeJson(json)) { block.incomplete = true; break; }
          block.input = parseArguments(json);
          yield { type: "tool_call", id: String(block.id), name: String(block.name), arguments: json };
        }
        break;
      }
      case "message_delta": {
        reason = data.delta?.stop_reason ?? reason;
        // Usage on message_delta is cumulative.
        if (data.usage?.output_tokens !== undefined) usage.output = Number(data.usage.output_tokens);
        if (data.usage?.input_tokens !== undefined) usage.input = Number(data.usage.input_tokens);
        if (data.usage?.cache_read_input_tokens !== undefined) usage.cacheRead = Number(data.usage.cache_read_input_tokens);
        if (data.usage?.cache_creation_input_tokens !== undefined) usage.cacheWrite = Number(data.usage.cache_creation_input_tokens);
        if (data.usage?.cache_creation?.ephemeral_1h_input_tokens !== undefined) usage.cacheWrite1h = Number(data.usage.cache_creation.ephemeral_1h_input_tokens);
        break;
      }
      case "message_stop":
        yield { type: "usage", usage: { inputTokens: usage.input + usage.cacheRead + usage.cacheWrite,
          outputTokens: usage.output, cacheReadTokens: usage.cacheRead, cacheWriteTokens: usage.cacheWrite,
          cacheWrite1hTokens: usage.cacheWrite1h, reasoningTokens: null } };
        yield { type: "stop", reason: stopReason(reason), providerReason: typeof reason === "string" ? reason : null,
          native: { providerId: "anthropic", modelId, items: completeBlocks(blocks) } };
        return;
      case "error":
        throw new DmModelError(errorKind(data.error?.type),
          safeProviderMessage(data.error?.message, apiKey, "Anthropic stream error"),
          { providerCode: typeof data.error?.type === "string" ? data.error.type : null });
      default:
        break; // ping and future event types
    }
  }
  throw new DmModelError("retryable_transport", "the Anthropic stream ended before message_stop");
}

export function createAnthropicDmModel(modelId = "claude-opus-5-5", options: DmModelOptions = {}): DmModel {
  if (!dmModelSpec("anthropic", modelId))
    throw new DmModelError("not_configured", `unknown Anthropic DM model ${modelId}`);
  async function* attempt(request: DmModelRequest, signal: AbortSignal): AsyncGenerator<DmModelEvent> {
    // ANTHROPIC_PROVIDERS_1: the door (host, key, the provider's model id) is read per request.
    let door: AnthropicEndpoint;
    let providerModel: string;
    try {
      door = anthropicEndpoint();
      providerModel = door.modelId(modelId);
    } catch (error) {
      throw new DmModelError("not_configured", (error as Error).message);
    }
    const apiKey = (options.apiKey ?? door.apiKey).trim();
    if (!apiKey) throw new DmModelError("not_configured", `${door.keyName} is not set on the server`);
    let response: Response;
    try {
      response = await (options.fetcher ?? fetch)(door.messagesUrl, {
        method: "POST",
        headers: door.headers(apiKey),
        body: JSON.stringify({ ...anthropicRequestBody(modelId, request), model: providerModel }),
        signal,
      });
    } catch (error) {
      throw transportFailure(error, request.signal);
    }
    if (!response.ok) throw await httpFailure(response, apiKey, door, modelId, providerModel);
    if (!response.body) throw new DmModelError("retryable_transport", "the Anthropic response had no body");
    try {
      yield* parseStream(response.body, modelId, apiKey);
    } catch (error) {
      throw transportFailure(error, request.signal);
    }
  }
  return {
    providerId: "anthropic",
    modelId,
    stream: (request) => withRetries((signal) => attempt(request, signal), options, request.signal),
  };
}
