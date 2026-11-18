// TOWN_0's one paid door: llmapi.ai, an OpenAI-compatible gateway (base https://api.llmapi.ai/v1), the Claude models on
// AWS Bedrock through its Anthropic Messages route — the door SOCIAL_FRAME_1 used and whose provenance it checked
// (mandate #9; scripts/persona-emotions/llmapi.mjs on claude/social-frame-1-gshpne, the pattern followed here). Every
// call pins the provider (`aws-bedrock/<model>`) and sends `X-No-Fallback: true`; the response's `model` field is stored
// and checked. The key (APP_LLMAPI_KEY) is read from the environment and never printed or written.
export const BASE_URL = "https://api.llmapi.ai/v1";
export const KEY_NAME = "APP_LLMAPI_KEY";
export const TIMEOUT_MS = 180_000;
export const PROVIDER = "aws-bedrock";
export const MODELS = { citizen: "claude-haiku-5-5", judge: "claude-haiku-5-5", referee: "claude-opus-5-5" };
export const pinned = (model) => `${PROVIDER}/${model}`;

/** The body of one Messages call (exported for the dry run). */
export const requestBody = ({ model, system, messages, maxTokens, effort }) => ({
  model: pinned(model), max_tokens: maxTokens, ...(effort ? { output_config: { effort } } : {}), ...(system ? { system } : {}), messages,
});

const headerRecord = (headers) => {
  const out = {};
  for (const [k, v] of headers.entries()) if (/^x-(llm|ratelimit|request-id|served|provider|upstream)/i.test(k) || /^(request-id|retry-after)$/i.test(k)) out[k.toLowerCase()] = v;
  return out;
};

/** One call; never throws. { text, usage, chargedUsd, model, responseId, stopReason, refused, refusalCategory, status, error, headers } */
export async function messagesCall({ model, system = null, messages, maxTokens, effort = null, apiKey = process.env[KEY_NAME], fetcher = fetch, timeoutMs = TIMEOUT_MS }) {
  const blank = { text: "", usage: { input_tokens: 0, output_tokens: 0, cache_read: 0, cache_write: 0 }, chargedUsd: null, model: null, responseId: null, stopReason: null, refused: false, refusalCategory: null, refusalText: null, status: null, error: null, headers: {} };
  try {
    const response = await fetcher(`${BASE_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, "X-No-Fallback": "true", "anthropic-version": "2023-06-01" },
      body: JSON.stringify(requestBody({ model, system, messages, maxTokens, effort })), signal: AbortSignal.timeout(timeoutMs),
    });
    const headers = headerRecord(response.headers);
    const raw = await response.text();
    let value = null;
    try { value = JSON.parse(raw); } catch { /* not JSON */ }
    if (!response.ok || !value) {
      const e = value?.error ?? value;
      const msg = typeof e === "string" ? e : e?.message ?? raw.slice(0, 200);
      return { ...blank, status: response.status, headers, error: `HTTP ${response.status}${e?.type ? ` ${e.type}` : ""}: ${String(msg).slice(0, 240)}` };
    }
    const u = value.usage ?? {};
    const refused = value.stop_reason === "refusal";
    const text = (value.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n").trim();
    return {
      ...blank, status: response.status, headers, text: refused ? "" : text,
      usage: { input_tokens: u.input_tokens ?? 0, output_tokens: u.output_tokens ?? 0, cache_read: u.cache_read_input_tokens ?? 0, cache_write: u.cache_creation_input_tokens ?? 0 },
      chargedUsd: typeof u.cost_usd_total === "number" ? u.cost_usd_total : typeof u.cost === "number" ? u.cost : null,
      model: value.model ?? null, responseId: value.id ?? null, stopReason: value.stop_reason ?? null,
      refused, refusalCategory: refused ? value.stop_details?.category ?? "refusal" : null, refusalText: refused ? value.stop_details?.explanation ?? null : null,
    };
  } catch (error) {
    return { ...blank, error: String(error?.message ?? error).slice(0, 200) };
  }
}

/** The key's credit (GET /v1/credits): { total, at } or { error }. Free. */
export async function readCredit({ apiKey = process.env[KEY_NAME], fetcher = fetch } = {}) {
  try {
    const r = await fetcher(`${BASE_URL}/credits`, { headers: { Authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(30_000) });
    const v = await r.json().catch(() => null);
    const total = typeof v?.total_credits === "number" ? v.total_credits : v?.credits;
    if (!r.ok || typeof total !== "number") return { error: `HTTP ${r.status}` };
    return { total, at: new Date().toISOString() };
  } catch (error) { return { error: String(error?.message ?? error).slice(0, 120) }; }
}

/** The pinned provider's listed prices, per token (GET /v1/models lists them per 1K tokens). */
export async function readPrices({ fetcher = fetch } = {}) {
  const r = await fetcher(`${BASE_URL}/models`, { signal: AbortSignal.timeout(30_000) });
  const v = await r.json();
  const out = {};
  for (const model of new Set(Object.values(MODELS))) {
    const p = (v.data ?? v).find((m) => m.id === model)?.providers?.find((x) => x.providerId === PROVIDER)?.pricing;
    if (!p) throw new Error(`no ${PROVIDER} price for ${model}`);
    out[model] = { input: Number(p.prompt) / 1000, output: Number(p.completion) / 1000, cacheRead: Number(p.input_cache_read ?? p.prompt) / 1000, cacheWrite: Number(p.input_cache_write ?? p.prompt) / 1000 };
  }
  return { at: new Date().toISOString(), source: `GET ${BASE_URL}/models, provider ${PROVIDER} (per 1K there, per token here)`, prices: out };
}

/** The served `model` matches when it is the id, or the id with a provider / region prefix or a date suffix. */
export function modelMatches(model, served) {
  if (!served) return false;
  const s = String(served).toLowerCase().replace(/^[a-z0-9-]+\//, "").replace(/^(?:[a-z]{2}\.)?anthropic\./, "");
  return s === model || s.startsWith(`${model}-20`) || s.startsWith(`${model}-v`) || s.startsWith(`${model}:`);
}
