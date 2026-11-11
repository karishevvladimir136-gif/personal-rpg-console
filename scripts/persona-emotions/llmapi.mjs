// SOCIAL_FRAME_1 — the llmapi.ai door (docs/stages/SOCIAL_FRAME_1.md, provider amendment 2026-11-10 19:3x LA).
//
// An OpenAI-compatible gateway (base URL from its docs: https://api.llmapi.ai/v1). Every call:
//   - pins the provider with a `provider/model` name and sends `X-No-Fallback: true` (the gateway's documented switch that
//     suppresses the low-uptime reroute and the retry on another provider after a 5xx, a 429 or a timeout);
//   - stores the response's `model` field, its id, the gateway's `x-llm*` / rate-limit headers and its own charge
//     (`usage.cost_usd_total`);
//   - Claude models go through the gateway's Anthropic Messages route with the body TONE_SPLIT_5 sent (`output_config.effort`,
//     no thinking); the others through chat completions with `reasoning_effort`.
// The key (APP_LLMAPI_KEY) is read from the environment and never printed or written.
import { createHash } from "node:crypto";

export const BASE_URL = "https://api.llmapi.ai/v1";
export const KEY_NAME = "APP_LLMAPI_KEY";
export const TIMEOUT_MS = 240_000;
export const sha256 = (text) => createHash("sha256").update(String(text)).digest("hex");

/** The families on this door: the model id as the gateway lists it, the provider pinned, the route. First-party pins, except:
 * the Claude models on AWS Bedrock (the gateway's «anthropic» provider answered 503 «overloaded» to every pinned call in
 * the provenance check, 2026-11-11 03:4x UTC) and DeepSeek on Novita (the gateway's own DeepSeek account answered
 * «insufficient balance», 402 provider_error; Novita serves V4 Pro in thinking mode, as TONE_SPLIT_5's DeepInfra did). */
export const FAMILY_SPECS = {
  haiku: { label: "Claude Haiku 5.5", developer: "Anthropic", model: "claude-haiku-5-5", provider: "aws-bedrock", route: "messages" },
  sonnet: { label: "Claude Sonnet 5.5", developer: "Anthropic", model: "claude-sonnet-5-5", provider: "aws-bedrock", route: "messages" },
  opus: { label: "Claude Opus 5.5", developer: "Anthropic", model: "claude-opus-5-5", provider: "aws-bedrock", route: "messages" },
  fable: { label: "Claude Fable 5.1", developer: "Anthropic", model: "claude-fable-5-1", provider: "aws-bedrock", route: "messages" },
  fable52: { label: "Claude Fable 5.2", developer: "Anthropic", model: "claude-fable-5-2", provider: "aws-bedrock", route: "messages" },
  glm: { label: "GLM 5.3", developer: "Z.ai (Zhipu)", model: "glm-5.3", provider: "zai", route: "chat" },
  kimi: { label: "Kimi K3", developer: "Moonshot AI", model: "kimi-k3", provider: "moonshot", route: "chat" },
  deepseek: { label: "DeepSeek V4 Pro", developer: "DeepSeek", model: "deepseek-v4-pro", provider: "novita", route: "chat" },
  sol: { label: "GPT-6.1 Sol", developer: "OpenAI", model: "gpt-6.1-sol", provider: "openai", route: "chat" },
  grok: { label: "Grok 4.7", developer: "xAI", model: "grok-4.7", provider: "xai", route: "chat" },
  astra: { label: "GPT-6 Astra", developer: "OpenAI", model: "gpt-6-astra", provider: "openai", route: "chat" },
};
for (const [name, s] of Object.entries(FAMILY_SPECS)) s.name = name;
export const pinnedModel = (spec) => `${spec.provider}/${spec.model}`;

/** How «effort» is sent: the route's own field. A level the provider does not list is sent as the nearest it lists
 * (decided in the provenance check and frozen; see EFFORT_SENT). */
export const EFFORT_FIELD = { messages: "output_config.effort", chat: "reasoning_effort" };

const headerRecord = (headers) => {
  const out = {};
  for (const [k, v] of headers.entries()) if (/^x-(llm|ratelimit|request-id|served|provider|upstream)/i.test(k) || /^(x-request-id|request-id|retry-after)$/i.test(k)) out[k.toLowerCase()] = v;
  return out;
};

/** Anthropic-shaped messages → chat messages (strings; an optional system message first). */
const chatMessages = (system, messages) => [...(system ? [{ role: "system", content: system }] : []), ...messages.map((m) => ({ role: m.role, content: m.content }))];

/** The body of one call (exported for the dry run and the tests). */
export function requestBody(spec, { system = null, messages, maxTokens, effort = null }) {
  if (spec.route === "messages") return { model: pinnedModel(spec), max_tokens: maxTokens, ...(effort ? { output_config: { effort } } : {}), ...(system ? { system } : {}), messages };
  return { model: pinnedModel(spec), messages: chatMessages(system, messages), max_tokens: maxTokens, ...(effort ? { reasoning_effort: effort } : {}) };
}

const errorText = (status, value) => {
  const e = value?.error ?? value;
  const msg = typeof e === "string" ? e : e?.message ?? value?.message ?? "";
  return `HTTP ${status}${e?.type ? ` ${e.type}` : ""}${e?.code ? ` ${e.code}` : ""}: ${String(msg).slice(0, 240)}`;
};

/** A refusal as the provider says it: Anthropic's stop_reason «refusal»; a chat finish_reason «content_filter»; an
 * OpenAI-style refusal field. Recorded, never rephrased. */
const refusalOf = (route, value) => {
  if (route === "messages") return value?.stop_reason === "refusal" ? { category: value?.stop_details?.category ?? null, text: value?.stop_details?.explanation ?? null } : null;
  const c = value?.choices?.[0];
  if (c?.finish_reason === "content_filter") return { category: "content_filter", text: null };
  if (c?.message?.refusal) return { category: "refusal", text: String(c.message.refusal).slice(0, 1000) };
  return null;
};

/**
 * One call. Returns { text, reasoning, usage{input_tokens,output_tokens,reasoning_tokens,cache_read}, chargedUsd, model,
 * responseId, stopReason, refused, refusalCategory, refusalText, status, error, headers, cached }. Never throws.
 */
export async function llmapiCall(spec, { system = null, messages, maxTokens, effort = null, apiKey = process.env[KEY_NAME], fetcher = fetch, timeoutMs = TIMEOUT_MS }) {
  const url = `${BASE_URL}/${spec.route === "messages" ? "messages" : "chat/completions"}`;
  const body = requestBody(spec, { system, messages, maxTokens, effort });
  const blank = { text: "", reasoning: null, usage: {}, chargedUsd: null, model: null, responseId: null, stopReason: null, refused: false, refusalCategory: null, refusalText: null, status: null, error: null, headers: {}, cached: false, pinned: body.model };
  try {
    const response = await fetcher(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, "X-No-Fallback": "true", ...(spec.route === "messages" ? { "anthropic-version": "2023-06-01" } : {}) },
      body: JSON.stringify(body), signal: AbortSignal.timeout(timeoutMs),
    });
    const headers = headerRecord(response.headers);
    const raw = await response.text();
    let value = null;
    try { value = JSON.parse(raw); } catch { /* not JSON */ }
    if (!response.ok || !value) return { ...blank, status: response.status, headers, error: value ? errorText(response.status, value) : `HTTP ${response.status}: ${raw.slice(0, 200)}` };
    const u = value.usage ?? {};
    const charged = typeof u.cost_usd_total === "number" ? u.cost_usd_total : typeof u.cost === "number" ? u.cost : null;
    const refusal = refusalOf(spec.route, value);
    if (spec.route === "messages") {
      const text = (value.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n").trim();
      const thinking = (value.content ?? []).filter((b) => b.type === "thinking").map((b) => b.thinking ?? "").join("\n");
      return { ...blank, status: response.status, headers, text: refusal ? "" : text, reasoning: thinking || null,
        usage: { input_tokens: u.input_tokens ?? 0, output_tokens: u.output_tokens ?? 0, reasoning_tokens: 0, cache_read: u.cache_read_input_tokens ?? 0, cache_write: u.cache_creation_input_tokens ?? 0 },
        chargedUsd: charged, model: value.model ?? null, responseId: value.id ?? null, stopReason: refusal ? "refusal" : value.stop_reason ?? null,
        refused: Boolean(refusal), refusalCategory: refusal?.category ?? null, refusalText: refusal?.text ?? null, cached: charged === 0 && (u.input_tokens ?? 0) === 0 };
    }
    const c = value.choices?.[0] ?? {};
    const text = String(c.message?.content ?? "").trim();
    const reasoning = c.message?.reasoning ?? c.message?.reasoning_content ?? null;
    return { ...blank, status: response.status, headers, text: refusal ? "" : text, reasoning: reasoning ? String(reasoning) : null,
      usage: { input_tokens: u.prompt_tokens ?? 0, output_tokens: u.completion_tokens ?? 0, reasoning_tokens: u.reasoning_tokens ?? u.completion_tokens_details?.reasoning_tokens ?? 0, cache_read: u.prompt_tokens_details?.cached_tokens ?? 0 },
      chargedUsd: charged, model: value.model ?? null, responseId: value.id ?? null,
      stopReason: refusal ? "refusal" : c.finish_reason === "length" ? "max_tokens" : c.finish_reason ?? null,
      refused: Boolean(refusal), refusalCategory: refusal?.category ?? null, refusalText: refusal?.text ?? null, cached: charged === 0 && (u.prompt_tokens ?? 0) === 0 };
  } catch (error) {
    return { ...blank, error: String(error?.message ?? error).slice(0, 200) };
  }
}

/** The key's credit (GET /v1/credits): { credits, total } or { error }. */
export async function readCredit({ apiKey = process.env[KEY_NAME], fetcher = fetch } = {}) {
  try {
    const r = await fetcher(`${BASE_URL}/credits`, { headers: { Authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(30_000) });
    const v = await r.json().catch(() => null);
    if (!r.ok || !v || typeof v.total_credits !== "number" && typeof v.credits !== "number") return { error: `HTTP ${r.status}` };
    return { credits: v.credits, bonus: v.credits_bonus ?? 0, total: typeof v.total_credits === "number" ? v.total_credits : v.credits, gated: v.gated_on_balance ?? null, mode: v.mode ?? null, at: new Date().toISOString() };
  } catch (error) { return { error: String(error?.message ?? error).slice(0, 120) }; }
}

/** The served `model` field matches the requested model when it equals the id, the pinned name, or the id with a date or
 * provider prefix (e.g. «claude-opus-5-5-20260726», «anthropic/claude-opus-5-5»). */
export function modelMatches(spec, served) {
  if (!served) return false;
  const s = String(served).toLowerCase().replace(/^[a-z0-9-]+\//, "");
  const m = spec.model.toLowerCase();
  return s === m || s.startsWith(`${m}-20`) || s.startsWith(`${m}-0`) || s === `${m}-latest`;
}
