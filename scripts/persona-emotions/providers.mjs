// Persona self-talk X1 (docs/stages/PERSONA_SELF_TALK_X1.md): the provider layer. One call shape for both families —
// `call({ spec, system, messages, maxTokens, effort, cache })` — implemented for the Anthropic Messages API and the
// OpenAI Responses API. Each returns { text, usage, stopReason, refusalCategory, refusalText, error, requestId,
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
import { errorText } from "../persona-memory/continuity-test.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
export const OPENAI_URL = "https://api.openai.com/v1/responses";
export const TIMEOUT_MS = 180_000;
/** How «effort» is sent to each API (recorded in the dry run and in every run record). */
export const EFFORT_MAPPING = { anthropic: "output_config.effort", openai: "reasoning.effort" };

const textBlocks = (content) => (typeof content === "string" ? [content] : (content ?? []).map((b) => b.text ?? ""));

/** One Anthropic Messages call: the same request as self-talk 1's (`anthropicCall`), plus the request and message ids. */
export async function anthropicMessages({ apiKey, model, system, messages, maxTokens, effort, fetcher = fetch, cache = false, timeoutMs = TIMEOUT_MS }) {
  try {
    const response = await fetcher(ANTHROPIC_URL, {
      method: "POST", headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model, max_tokens: maxTokens, output_config: { effort }, ...(cache ? { cache_control: { type: "ephemeral" } } : {}), ...(system ? { system } : {}), messages }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const requestId = response.headers?.get?.("request-id") ?? null;
    const value = await response.json().catch(() => null);
    const effortSent = { [EFFORT_MAPPING.anthropic]: effort };
    if (response.ok && value) {
      const text = (value.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n").trim();
      return { text, usage: value.usage ?? {}, stopReason: value.stop_reason ?? null, refusalCategory: value.stop_details?.category ?? null, refusalText: null,
        error: null, requestId, responseId: value.id ?? null, servedModel: value.model ?? null, effortSent };
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

/** The call for a model spec ({ provider: "anthropic" | "openai", model }): one signature, each provider's own key. */
export function callerFor({ keys, fetcher = fetch }) {
  return ({ spec, system, messages, maxTokens, effort, cache = false }) => (spec.provider === "openai"
    ? openaiResponses({ apiKey: keys.openai, model: spec.model, system, messages, maxTokens, effort, fetcher })
    : anthropicMessages({ apiKey: keys.anthropic, model: spec.model, system, messages, maxTokens, effort, fetcher, cache }));
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
