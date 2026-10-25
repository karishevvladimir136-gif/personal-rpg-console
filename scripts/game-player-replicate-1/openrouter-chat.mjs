// Game player replicate 1 (docs/stages/GAME_PLAYER_REPLICATE_1.md): DeepSeek V4 Pro 0813 at the table — OpenRouter's
// chat completions, pinned to DeepInfra's fp8 endpoint with no fallback (the account's privacy guardrail excludes
// DeepSeek's own host), effort medium as X3. The call is X3's `openrouterChat` (origin/claude/persona-self-talk-x3,
// scripts/persona-emotions/providers.mjs), ported here so the four group-1 players' provider layer stays as it was:
//   - `reasoning.effort` carries «effort»; `reasoning.exclude: true` keeps the reasoning text out of the reply (as X3):
//     only the visible text exists to be relayed, and the reasoning tokens are recorded from the usage;
//   - a reply that names another model than the requested id (or its catalogue snapshot), or another host than the
//     pinned one, is not relayed: it comes back as an error and the session ends there, recorded (X3's served-model rule);
//   - a refusal — `message.refusal`, a `content_filter` finish, or an HTTP 400/403 or a choice error whose message
//     declines the content — is stopReason "refusal" (the session closes: no retry after a refusal).
// The key is the OpenRouter key (`APP_OPENROUTER_API_KEY`), never printed.
import { anthropicEndpoint } from "../../src/lib/server/anthropic-endpoint.ts";

export const OPENROUTER_CHAT_URL = `${anthropicEndpoint({ ANTHROPIC_PROVIDER: "openrouter" }).baseUrl}/v1/chat/completions`;
export const TIMEOUT_MS = 180_000;
export const OPENROUTER_EFFORT = "reasoning.effort";

/** The relay's messages as chat-completions messages: the system prompt first, then the screens (user) and the
 * player's own earlier messages (assistant), each as the one string the harness holds. */
export function chatMessages(messages, system = null) {
  return [...(system ? [{ role: "system", content: system }] : []), ...messages.map((m) => ({ role: m.role, content: String(m.content ?? "") }))];
}

/** The chat-completions usage in the Anthropic field names: prompt_tokens includes the cached and cache-write tokens;
 * completion_tokens includes the reasoning. */
export function openrouterUsage(usage = {}) {
  const cached = usage.prompt_tokens_details?.cached_tokens ?? 0, written = usage.prompt_tokens_details?.cache_write_tokens ?? 0;
  return { input_tokens: Math.max(0, (usage.prompt_tokens ?? 0) - cached - written), cache_read_input_tokens: cached, cache_creation_input_tokens: written,
    output_tokens: usage.completion_tokens ?? 0, reasoning_tokens: usage.completion_tokens_details?.reasoning_tokens ?? 0 };
}

/** A prompt an upstream declines under its content rules (an HTTP 400/403 or a choice error saying so). */
export const DECLINED = /invalid_prompt|usage polic|content.?filter|flagged|moderation|high.?risk|sensitive|inappropriate|safety/i;
const GENERATION_ID = /^gen-[A-Za-z0-9_.:-]{1,120}$/;
const errorText = (status, code, message) => `HTTP ${status}${code ? ` ${code}` : ""}: ${String(message ?? "").replace(/\s+/g, " ").slice(0, 160)}`;

/**
 * One call. `spec` is the player's entry ({ model, snapshot, upstream: { slug, name } }). Returns the provider layer's
 * shape ({ text, usage, stopReason, error, requestId, responseId, servedModel, refusalCategory }) plus `upstream` (the host
 * the reply names), `chargedUsd` (OpenRouter's own charge, `usage.cost`), `reasoningTokens` and `nativeFinishReason`.
 * With `keepReasoning` the request asks for the reasoning text (never relayed: the caller sends only `text` on).
 */
export async function openrouterChat({ apiKey, spec, system, messages, maxTokens, effort, fetcher = fetch, timeoutMs = TIMEOUT_MS, keepReasoning = false }) {
  const effortSent = { [OPENROUTER_EFFORT]: effort };
  const blank = { text: "", usage: {}, stopReason: null, refusalCategory: null, refusalText: null, responseId: null, servedModel: null, upstream: null, chargedUsd: null, reasoningTokens: null, nativeFinishReason: null, effortSent };
  try {
    const response = await fetcher(OPENROUTER_CHAT_URL, {
      method: "POST", headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ model: spec.model, messages: chatMessages(messages, system), max_tokens: maxTokens, reasoning: { effort, exclude: !keepReasoning },
        ...(spec.upstream ? { provider: { order: [spec.upstream.slug], allow_fallbacks: false, require_parameters: true } } : {}), usage: { include: true } }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const header = response.headers?.get?.("x-generation-id") ?? response.headers?.get?.("request-id") ?? null;
    const value = await response.json().catch(() => null);
    const requestId = header && GENERATION_ID.test(header) ? header : typeof value?.id === "string" && GENERATION_ID.test(value.id) ? value.id : header;
    if (response.ok && value && !value.error) {
      const choice = value.choices?.[0] ?? {};
      const content = choice.message?.content;
      const text = (typeof content === "string" ? content : Array.isArray(content) ? content.map((p) => p?.text ?? "").join("\n") : "").trim();
      const usage = openrouterUsage(value.usage);
      const base = { ...blank, text, usage, requestId, responseId: value.id ?? null, servedModel: value.model ?? null, upstream: value.provider ?? null,
        chargedUsd: typeof value.usage?.cost === "number" ? value.usage.cost : null, reasoningTokens: usage.reasoning_tokens, nativeFinishReason: choice.native_finish_reason ?? null };
      // X3's served-model rule: another model or another host than the pinned one is not relayed.
      if (base.servedModel && ![spec.model, spec.snapshot].includes(base.servedModel)) return { ...base, text: "", error: `served model ${String(base.servedModel).slice(0, 80)} is not the requested ${spec.model}` };
      if (spec.upstream && base.upstream && base.upstream !== spec.upstream.name) return { ...base, text: "", error: `served by ${String(base.upstream).slice(0, 60)}, not the pinned ${spec.upstream.name}` };
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
