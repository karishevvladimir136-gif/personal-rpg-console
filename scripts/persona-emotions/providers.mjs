// Persona self-talk X1 (docs/stages/PERSONA_SELF_TALK_X1.md): the provider layer. One call shape for both families —
// `call({ spec, system, messages, maxTokens, effort, cache })` — implemented for the Anthropic Messages API and the
// OpenAI Responses API; self-talk X3 adds OpenRouter's chat completions (`openrouterChat`) for the open families and
// sends the Anthropic calls through a door (ANTHROPIC_PROVIDERS_1: the Console's by default, OpenRouter's in X3). Each returns { text, usage, stopReason, refusalCategory, refusalText, error, requestId,
// responseId, servedModel, effortSent }, with `usage` in the Anthropic field names (input_tokens = the uncached remainder,
// cache_read_input_tokens, cache_creation_input_tokens, output_tokens incl. thinking) so one cost rule serves both.
// No retries here: the stage's gate (F2) decides what is asked again. Keys are passed in and never logged.
//   «effort medium» → Anthropic `output_config.effort: "medium"`, OpenAI `reasoning.effort: "medium"` (same level names).
//   Only the visible text is returned; reasoning is never requested back (no summaries, `store: false`), so nothing of
//   it can be relayed.
//   An OpenAI refusal — a `refusal` content part, an `incomplete` response with reason `content_filter`, or an HTTP 400
//   whose error is a prompt flagged under the usage policy — comes back as stopReason "refusal" with the reason the API
//   gave, exactly like an Anthropic `stop_reason: "refusal"`.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CONSOLE_DOOR, errorText } from "../persona-memory/continuity-test.mjs";
import { anthropicEndpoint } from "../eval/lib/anthropic-endpoint.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
/** The Console's Messages URL (the door helper names the host; a call that names no door goes there). */
export const ANTHROPIC_URL = CONSOLE_DOOR.messagesUrl;
export const OPENAI_URL = "https://api.openai.com/v1/responses";
/** OpenRouter's chat completions, on the door helper's host (the helper is the one place that names it). */
export const OPENROUTER_CHAT_URL = `${anthropicEndpoint({ ANTHROPIC_PROVIDER: "openrouter" }).baseUrl}/v1/chat/completions`;
export const TIMEOUT_MS = 180_000;
/** How «effort» is sent to each API (recorded in the dry run and in every run record). */
export const EFFORT_MAPPING = { anthropic: "output_config.effort", openai: "reasoning.effort" };
/** Self-talk X3: how «effort» is sent to OpenRouter's chat completions (kept apart, so X1's frozen mapping is unchanged). */
export const OPENROUTER_EFFORT = "reasoning.effort";

const textBlocks = (content) => (typeof content === "string" ? [content] : (content ?? []).map((b) => b.text ?? ""));

/** One Anthropic Messages call: the same request as self-talk 1's (`anthropicCall`), plus the request and message ids.
 * `door` (self-talk X3) is the endpoint it goes through — the Console's by default; on OpenRouter's the reply also names
 * the upstream (`provider`), kept as `upstream`. */
export async function anthropicMessages({ apiKey, model, system, messages, maxTokens, effort, fetcher = fetch, cache = false, timeoutMs = TIMEOUT_MS, door = CONSOLE_DOOR }) {
  try {
    const response = await fetcher(door.messagesUrl, {
      method: "POST", headers: door.headers(apiKey),
      body: JSON.stringify(door.body({ model, max_tokens: maxTokens, output_config: { effort }, ...(cache ? { cache_control: { type: "ephemeral" } } : {}), ...(system ? { system } : {}), messages })),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const requestId = response.headers?.get?.("request-id") ?? null;
    const value = await response.json().catch(() => null);
    const effortSent = { [EFFORT_MAPPING.anthropic]: effort };
    if (response.ok && value) {
      const text = (value.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n").trim();
      return { text, usage: value.usage ?? {}, stopReason: value.stop_reason ?? null, refusalCategory: value.stop_details?.category ?? null, refusalText: null,
        error: null, requestId, responseId: value.id ?? null, servedModel: value.model ?? null, ...(door.provider === "openrouter" ? { upstream: value.provider ?? null } : {}), effortSent };
    }
    return { text: "", usage: {}, stopReason: null, refusalCategory: null, refusalText: null, error: errorText(response.status, value?.error?.type, value?.error?.message), requestId, responseId: null, effortSent };
  } catch (error) {
    return { text: "", usage: {}, stopReason: null, refusalCategory: null, refusalText: null, error: String(error?.message ?? error).slice(0, 120), requestId: null, responseId: null, effortSent: { [EFFORT_MAPPING.anthropic]: effort } };
  }
}

/** The relay's messages as Responses input: a user message keeps its text blocks as `input_text` parts; an assistant
 * message (a side's own earlier turn) is its visible text as one string. */
export function responsesInput(messages) {
  return messages.map((m) => (m.role === "assistant"
    ? { role: "assistant", content: textBlocks(m.content).join("\n\n") }
    : { role: m.role, content: textBlocks(m.content).map((text) => ({ type: "input_text", text })) }));
}

/** The Responses usage in the Anthropic field names: input_tokens there includes the cached and cache-write tokens. */
export function openaiUsage(usage = {}) {
  const cached = usage.input_tokens_details?.cached_tokens ?? 0, written = usage.input_tokens_details?.cache_write_tokens ?? 0;
  return { input_tokens: Math.max(0, (usage.input_tokens ?? 0) - cached - written), cache_read_input_tokens: cached, cache_creation_input_tokens: written,
    output_tokens: usage.output_tokens ?? 0, reasoning_tokens: usage.output_tokens_details?.reasoning_tokens ?? 0 };
}

/** A prompt the provider declines to process under its usage policy (HTTP 400). */
const FLAGGED = /invalid_prompt|usage polic|content.?filter|flagged/i;

/** One Responses call. */
export async function openaiResponses({ apiKey, model, system, messages, maxTokens, effort, fetcher = fetch, timeoutMs = TIMEOUT_MS }) {
  const effortSent = { [EFFORT_MAPPING.openai]: effort };
  try {
    const response = await fetcher(OPENAI_URL, {
      method: "POST", headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ model, input: responsesInput(messages), ...(system ? { instructions: system } : {}), max_output_tokens: maxTokens, reasoning: { effort }, store: false }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const requestId = response.headers?.get?.("x-request-id") ?? null;
    const value = await response.json().catch(() => null);
    if (response.ok && value) {
      const parts = (value.output ?? []).filter((item) => item.type === "message").flatMap((item) => item.content ?? []);
      const text = parts.filter((p) => p.type === "output_text").map((p) => p.text ?? "").join("\n").trim();
      const refusal = parts.filter((p) => p.type === "refusal").map((p) => p.refusal ?? "").join("\n").trim();
      const incomplete = value.status === "incomplete" ? value.incomplete_details?.reason ?? "incomplete" : null;
      const base = { text, usage: openaiUsage(value.usage), requestId, responseId: value.id ?? null, servedModel: value.model ?? null, effortSent };
      if (refusal || incomplete === "content_filter") return { ...base, stopReason: "refusal", refusalCategory: refusal ? "refusal" : "content_filter", refusalText: refusal ? refusal.slice(0, 1000) : null, error: null };
      if (value.status === "failed") return { ...base, stopReason: null, refusalCategory: null, refusalText: null, error: `response failed: ${value.error?.code ?? ""} ${String(value.error?.message ?? "").slice(0, 160)}`.trim() };
      return { ...base, stopReason: incomplete === "max_output_tokens" ? "max_tokens" : incomplete ?? (value.status === "completed" ? "end_turn" : value.status ?? null), refusalCategory: null, refusalText: null, error: null };
    }
    const code = value?.error?.code ?? value?.error?.type;
    const error = errorText(response.status, code, value?.error?.message);
    if (response.status === 400 && FLAGGED.test(`${code ?? ""} ${value?.error?.message ?? ""}`)) {
      return { text: "", usage: {}, stopReason: "refusal", refusalCategory: code ?? "invalid_prompt", refusalText: String(value?.error?.message ?? "").slice(0, 1000), error, requestId, responseId: null, effortSent };
    }
    return { text: "", usage: {}, stopReason: null, refusalCategory: null, refusalText: null, error, requestId, responseId: null, effortSent };
  } catch (error) {
    return { text: "", usage: {}, stopReason: null, refusalCategory: null, refusalText: null, error: String(error?.message ?? error).slice(0, 120), requestId: null, responseId: null, effortSent };
  }
}

// ---- OpenRouter's chat completions (self-talk X3: the open families) ----------------------------------------------------

/** The relay's messages as chat-completions messages, in the Responses mapping's shape: a user message keeps its text
 * blocks as `text` parts; an assistant message (a side's own earlier turn) is its visible text as one string. */
export function chatMessages(messages, system = null) {
  return [...(system ? [{ role: "system", content: system }] : []), ...messages.map((m) => (m.role === "assistant"
    ? { role: "assistant", content: textBlocks(m.content).join("\n\n") }
    : { role: m.role, content: textBlocks(m.content).map((text) => ({ type: "text", text })) }))];
}

/** The chat-completions usage in the Anthropic field names: prompt_tokens there includes the cached and cache-write
 * tokens; completion_tokens includes the reasoning. */
export function openrouterUsage(usage = {}) {
  const cached = usage.prompt_tokens_details?.cached_tokens ?? 0, written = usage.prompt_tokens_details?.cache_write_tokens ?? 0;
  return { input_tokens: Math.max(0, (usage.prompt_tokens ?? 0) - cached - written), cache_read_input_tokens: cached, cache_creation_input_tokens: written,
    output_tokens: usage.completion_tokens ?? 0, reasoning_tokens: usage.completion_tokens_details?.reasoning_tokens ?? 0 };
}

/** A prompt an upstream declines under its content rules (an HTTP 400/403 or a choice error saying so). */
const DECLINED = /invalid_prompt|usage polic|content.?filter|flagged|moderation|high.?risk|sensitive|inappropriate|safety/i;
const GENERATION_ID = /^gen-[A-Za-z0-9_.:-]{1,120}$/;

/**
 * One OpenRouter chat-completions call. `upstream` pins the host (`provider.order` with no fallback, every parameter
 * required); `reasoning.effort` carries «effort», `reasoning.exclude` keeps the reasoning text out of the reply (only the
 * visible text exists to be relayed). Returns the X1 shape plus `upstream` (the host the reply names), `chargedUsd`
 * (OpenRouter's own charge, `usage.cost`) and `nativeFinishReason`. A refusal — `message.refusal`, a `content_filter`
 * finish, or an HTTP 400/403 or a choice error whose message declines the content — is stopReason "refusal".
 */
export async function openrouterChat({ apiKey, model, upstream = null, system, messages, maxTokens, effort, fetcher = fetch, timeoutMs = TIMEOUT_MS }) {
  const effortSent = { [OPENROUTER_EFFORT]: effort };
  const blank = { text: "", usage: {}, stopReason: null, refusalCategory: null, refusalText: null, responseId: null, servedModel: null, upstream: null, chargedUsd: null, nativeFinishReason: null, effortSent };
  try {
    const response = await fetcher(OPENROUTER_CHAT_URL, {
      method: "POST", headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ model, messages: chatMessages(messages, system), max_tokens: maxTokens, reasoning: { effort, exclude: true },
        ...(upstream ? { provider: { order: [upstream], allow_fallbacks: false, require_parameters: true } } : {}), usage: { include: true } }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const header = response.headers?.get?.("x-generation-id") ?? response.headers?.get?.("request-id") ?? null;
    const value = await response.json().catch(() => null);
    const requestId = header && GENERATION_ID.test(header) ? header : typeof value?.id === "string" && GENERATION_ID.test(value.id) ? value.id : header;
    if (response.ok && value && !value.error) {
      const choice = value.choices?.[0] ?? {};
      const content = choice.message?.content;
      const text = (typeof content === "string" ? content : Array.isArray(content) ? content.map((p) => p?.text ?? "").join("\n") : "").trim();
      const base = { ...blank, text, usage: openrouterUsage(value.usage), requestId, responseId: value.id ?? null, servedModel: value.model ?? null, upstream: value.provider ?? null,
        chargedUsd: typeof value.usage?.cost === "number" ? value.usage.cost : null, nativeFinishReason: choice.native_finish_reason ?? null };
      const refusal = typeof choice.message?.refusal === "string" ? choice.message.refusal.trim() : "";
      if (choice.error) {
        const code = choice.error.code, message = String(choice.error.message ?? "");
        if (DECLINED.test(message)) return { ...base, stopReason: "refusal", refusalCategory: "upstream_declined", refusalText: message.slice(0, 1000), error: null };
        return { ...base, error: typeof code === "number" ? errorText(code, "upstream_error", message) : `upstream error ${String(code ?? "")} ${message.slice(0, 160)}`.trim() };
      }
      if (refusal || choice.finish_reason === "content_filter") return { ...base, stopReason: "refusal", refusalCategory: refusal ? "refusal" : "content_filter", refusalText: refusal ? refusal.slice(0, 1000) : null, error: null };
      const finish = choice.finish_reason ?? null;
      return { ...base, stopReason: finish === "length" ? "max_tokens" : finish === "stop" ? "end_turn" : finish, error: null };
    }
    const code = value?.error?.code, message = String(value?.error?.message ?? "");
    const raw = value?.error?.metadata?.raw ? ` ${String(value.error.metadata.raw).slice(0, 200)}` : "";
    const error = errorText(response.status, typeof code === "number" ? `http_${code}` : code, `${message}${raw}`);
    if ([400, 403].includes(response.status) && DECLINED.test(`${message}${raw} ${(value?.error?.metadata?.reasons ?? []).join(" ")}`)) {
      return { ...blank, stopReason: "refusal", refusalCategory: response.status === 403 ? "moderation" : "upstream_declined", refusalText: `${message}${raw}`.slice(0, 1000), error, requestId };
    }
    return { ...blank, error, requestId, upstream: value?.error?.metadata?.provider_name ?? null };
  } catch (error) {
    return { ...blank, error: String(error?.message ?? error).slice(0, 120), requestId: null };
  }
}

/** The call for a model spec ({ provider: "anthropic" | "openai" | "openrouter", model }): one signature, each provider's
 * own key; `door` is the Anthropic calls' endpoint (the Console's unless one is given). */
export function callerFor({ keys, fetcher = fetch, door = CONSOLE_DOOR }) {
  return ({ spec, system, messages, maxTokens, effort, cache = false }) => (spec.provider === "openai"
    ? openaiResponses({ apiKey: keys.openai, model: spec.model, system, messages, maxTokens, effort, fetcher })
    : spec.provider === "openrouter"
      ? openrouterChat({ apiKey: keys.openrouter, model: spec.model, upstream: spec.upstream?.slug ?? null, system, messages, maxTokens, effort, fetcher })
      : anthropicMessages({ apiKey: keys.anthropic, model: spec.model, system, messages, maxTokens, effort, fetcher, cache, door }));
}

/** USD for one call: the uncached input, the cache reads and writes, the output (thinking included). */
export const costOf = (spec, usage = {}) => ((usage.input_tokens ?? 0) * spec.price.input + (usage.cache_read_input_tokens ?? 0) * (spec.price.cacheRead ?? spec.price.input)
  + (usage.cache_creation_input_tokens ?? 0) * (spec.price.cacheWrite ?? spec.price.input) + (usage.output_tokens ?? 0) * spec.price.output) / 1e6;

/** The OpenAI key of this stage: `APP_OPENAI_API_KEY` in .env.local, else the cloud environment's variable of the same
 * name — never `OPENAI_API_KEY`. The value is returned to the caller only; it is never printed or written. */
export function openaiKey(root = ROOT, env = process.env) {
  const file = join(root, ".env.local");
  if (existsSync(file)) {
    const line = readFileSync(file, "utf8").split(/\r?\n/).find((entry) => /^\s*APP_OPENAI_API_KEY\s*=/.test(entry));
    const value = line ? line.replace(/^\s*APP_OPENAI_API_KEY\s*=/, "").trim().replace(/^["']|["']$/g, "").trim() : "";
    if (value) return value;
  }
  return env.APP_OPENAI_API_KEY?.trim() || null;
}
