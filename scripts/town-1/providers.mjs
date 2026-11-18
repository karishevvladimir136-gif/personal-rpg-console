// TOWN_1: one call shape for the three doors. Messages (Opus, Haiku) and chat (Sol) on llmapi.ai, pinned
// `<provider>/<model>` with `X-No-Fallback: true`; DeepSeek on OpenRouter's chat completions with
// `provider: {order: [host], allow_fallbacks: false, require_parameters: true}` (the request of TONE_SPLIT_5 / AUTHORITY_3,
// reasoning effort medium, the provider's reasoning text kept in the record and never relayed). Keys are read from the
// environment and never printed or written. Every call returns
// { text, reasoning, usage, chargedUsd, servedModel, upstream, stopReason, refused, refusalCategory, refusalText,
//   status, error, requestId } and never throws.
import { BASE_URL as LLMAPI, messagesCall, modelMatches, readCredit as readLlmapiCredit } from "../town-0/llmapi.mjs";

export const OPENROUTER = "https://openrouter.ai/api/v1";
export const KEYS = { llmapi: "APP_LLMAPI_KEY", openrouter: "APP_OPENROUTER_API_KEY" };
export const TIMEOUT_MS = 240_000;
const DECLINED = /invalid_prompt|usage polic|content.?filter|flagged|moderation|high.?risk|sensitive|inappropriate|safety/i;

const blank = () => ({ text: "", reasoning: null, usage: { input_tokens: 0, output_tokens: 0, reasoning_tokens: 0, cache_read: 0, cache_write: 0 }, chargedUsd: null, servedModel: null, upstream: null,
  stopReason: null, refused: false, refusalCategory: null, refusalText: null, status: null, error: null, requestId: null });
const errorOf = (status, value, raw) => { const e = value?.error ?? value; const msg = typeof e === "string" ? e : e?.message ?? raw?.slice(0, 200) ?? ""; return `HTTP ${status}${e?.type ? ` ${e.type}` : ""}${e?.code ? ` ${e.code}` : ""}: ${String(msg).slice(0, 300)}`; };
const chatMessages = (system, messages) => [...(system ? [{ role: "system", content: system }] : []), ...messages.map((m) => ({ role: m.role, content: m.content }))];

/** The request body of a call (exported for the record and the worst-case estimate). */
export function bodyOf(spec, { system, messages, maxTokens, effort }) {
  if (spec.route === "messages") return { model: `${spec.provider}/${spec.model}`, max_tokens: maxTokens, ...(effort ? { output_config: { effort } } : {}), ...(system ? { system } : {}), messages };
  if (spec.route === "chat") return { model: `${spec.provider}/${spec.model}`, messages: chatMessages(system, messages), max_tokens: maxTokens, ...(effort ? { reasoning_effort: effort } : {}) };
  return { model: spec.model, messages: chatMessages(system, messages), max_tokens: maxTokens, reasoning: { effort }, provider: { order: [spec.upstream], allow_fallbacks: false, require_parameters: true }, usage: { include: true } };
}

async function llmapiChat(spec, args, { apiKey, fetcher }) {
  const out = blank();
  try {
    const r = await fetcher(`${LLMAPI}/chat/completions`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, "X-No-Fallback": "true" },
      body: JSON.stringify(bodyOf(spec, args)), signal: AbortSignal.timeout(TIMEOUT_MS) });
    const raw = await r.text();
    let v = null; try { v = JSON.parse(raw); } catch { /* not JSON */ }
    out.status = r.status; out.requestId = r.headers.get("x-request-id") ?? null;
    if (!r.ok || !v) return { ...out, error: errorOf(r.status, v, raw) };
    const c = v.choices?.[0] ?? {}, u = v.usage ?? {};
    const refusal = typeof c.message?.refusal === "string" && c.message.refusal.trim() ? c.message.refusal.trim() : null;
    const filtered = c.finish_reason === "content_filter";
    return { ...out, text: refusal || filtered ? "" : String(c.message?.content ?? "").trim(), reasoning: c.message?.reasoning ?? c.message?.reasoning_content ?? null,
      usage: { input_tokens: u.prompt_tokens ?? 0, output_tokens: u.completion_tokens ?? 0, reasoning_tokens: u.completion_tokens_details?.reasoning_tokens ?? u.reasoning_tokens ?? 0, cache_read: u.prompt_tokens_details?.cached_tokens ?? 0, cache_write: 0 },
      chargedUsd: typeof u.cost_usd_total === "number" ? u.cost_usd_total : typeof u.cost === "number" ? u.cost : null, servedModel: v.model ?? null, responseId: v.id ?? null,
      stopReason: refusal || filtered ? "refusal" : c.finish_reason === "length" ? "max_tokens" : c.finish_reason === "stop" ? "end_turn" : c.finish_reason ?? null,
      refused: Boolean(refusal || filtered), refusalCategory: refusal ? "refusal" : filtered ? "content_filter" : null, refusalText: refusal };
  } catch (error) { return { ...out, error: String(error?.message ?? error).slice(0, 200) }; }
}

async function openrouterChat(spec, args, { apiKey, fetcher }) {
  const out = blank();
  try {
    const r = await fetcher(`${OPENROUTER}/chat/completions`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(bodyOf(spec, args)), signal: AbortSignal.timeout(TIMEOUT_MS) });
    const raw = await r.text();
    let v = null; try { v = JSON.parse(raw); } catch { /* not JSON */ }
    out.status = r.status; out.requestId = r.headers.get("x-generation-id") ?? v?.id ?? null;
    if (!r.ok || !v || v.error) {
      const message = `${v?.error?.message ?? ""} ${v?.error?.metadata?.raw ?? ""}`;
      if ([400, 403].includes(r.status) && DECLINED.test(message)) return { ...out, stopReason: "refusal", refused: true, refusalCategory: r.status === 403 ? "moderation" : "upstream_declined", refusalText: message.trim().slice(0, 1000), error: null, upstream: v?.error?.metadata?.provider_name ?? null };
      return { ...out, error: errorOf(r.status, v, raw), upstream: v?.error?.metadata?.provider_name ?? null };
    }
    const c = v.choices?.[0] ?? {}, u = v.usage ?? {};
    const content = c.message?.content;
    const text = (typeof content === "string" ? content : Array.isArray(content) ? content.map((p) => p?.text ?? "").join("\n") : "").trim();
    const base = { ...out, text, reasoning: c.message?.reasoning ?? c.message?.reasoning_content ?? null, servedModel: v.model ?? null, upstream: v.provider ?? null, responseId: v.id ?? null,
      usage: { input_tokens: u.prompt_tokens ?? 0, output_tokens: u.completion_tokens ?? 0, reasoning_tokens: u.completion_tokens_details?.reasoning_tokens ?? 0, cache_read: u.prompt_tokens_details?.cached_tokens ?? 0, cache_write: u.prompt_tokens_details?.cache_write_tokens ?? 0 },
      chargedUsd: typeof u.cost === "number" ? u.cost : null };
    if (c.error) {
      const m = String(c.error.message ?? "");
      return DECLINED.test(m) ? { ...base, text: "", stopReason: "refusal", refused: true, refusalCategory: "upstream_declined", refusalText: m.slice(0, 1000) } : { ...base, error: `upstream error ${c.error.code ?? ""} ${m.slice(0, 200)}` };
    }
    const refusal = typeof c.message?.refusal === "string" && c.message.refusal.trim() ? c.message.refusal.trim() : null;
    if (refusal || c.finish_reason === "content_filter") return { ...base, text: "", stopReason: "refusal", refused: true, refusalCategory: refusal ? "refusal" : "content_filter", refusalText: refusal };
    return { ...base, stopReason: c.finish_reason === "length" ? "max_tokens" : c.finish_reason === "stop" ? "end_turn" : c.finish_reason ?? null };
  } catch (error) { return { ...out, error: String(error?.message ?? error).slice(0, 200) }; }
}

/** One call to a family or judge spec. */
export async function callModel(spec, args, { keys, fetcher = fetch }) {
  if (spec.route === "messages") {
    const r = await messagesCall({ model: spec.model, system: args.system, messages: args.messages, maxTokens: args.maxTokens, effort: args.effort, apiKey: keys.llmapi, fetcher, timeoutMs: TIMEOUT_MS });
    return { ...blank(), ...r, servedModel: r.model, reasoning: null, usage: { ...r.usage, reasoning_tokens: 0 }, requestId: r.headers?.["x-request-id"] ?? r.headers?.["request-id"] ?? null };
  }
  if (spec.route === "chat") return llmapiChat(spec, args, { apiKey: keys.llmapi, fetcher });
  return openrouterChat(spec, args, { apiKey: keys.openrouter, fetcher });
}

/** Does the response come from the model and host pinned? */
export function provenanceOf(spec, r) {
  if (spec.route === "openrouter") {
    const modelOk = typeof r.servedModel === "string" && r.servedModel.toLowerCase().startsWith(spec.model.replace(/-\d{4}$/, "").toLowerCase());
    return modelOk && r.upstream === spec.upstreamName;
  }
  return modelMatches(spec.model, r.servedModel);
}

/** Both doors' balances (free reads). */
export async function readBalances({ keys, fetcher = fetch }) {
  const llmapi = await readLlmapiCredit({ apiKey: keys.llmapi, fetcher });
  let openrouter;
  try {
    const r = await fetcher(`${OPENROUTER}/credits`, { headers: { Authorization: `Bearer ${keys.openrouter}` }, signal: AbortSignal.timeout(30_000) });
    const v = await r.json();
    openrouter = { total: v.data.total_credits - v.data.total_usage, usage: v.data.total_usage, at: new Date().toISOString() };
  } catch (error) { openrouter = { error: String(error?.message ?? error).slice(0, 120) }; }
  return { llmapi, openrouter, at: new Date().toISOString() };
}

/** Listed prices per token: llmapi's pinned provider for each llmapi spec; OpenRouter's pinned endpoint for DeepSeek. */
export async function readPrices(specs, { fetcher = fetch }) {
  const llm = await (await fetcher(`${LLMAPI}/models`, { signal: AbortSignal.timeout(30_000) })).json();
  const out = {};
  for (const spec of specs) {
    const key = `${spec.route}:${spec.model}`;
    if (out[key]) continue;
    if (spec.route === "openrouter") {
      const e = (await (await fetcher(`${OPENROUTER}/models/${spec.model}/endpoints`, { signal: AbortSignal.timeout(30_000) })).json()).data.endpoints.find((x) => x.tag === spec.upstream);
      if (!e) throw new Error(`no OpenRouter endpoint ${spec.upstream} for ${spec.model}`);
      out[key] = { input: Number(e.pricing.prompt), output: Number(e.pricing.completion), cacheRead: Number(e.pricing.input_cache_read ?? e.pricing.prompt), cacheWrite: Number(e.pricing.input_cache_write ?? e.pricing.prompt), source: `OpenRouter endpoint ${spec.upstream}` };
    } else {
      const p = (llm.data ?? llm).find((m) => m.id === spec.model)?.providers?.find((x) => x.providerId === spec.provider)?.pricing;
      if (!p) throw new Error(`no llmapi price for ${spec.provider}/${spec.model}`);
      out[key] = { input: Number(p.prompt) / 1000, output: Number(p.completion) / 1000, cacheRead: Number(p.input_cache_read ?? p.prompt) / 1000, cacheWrite: Number(p.input_cache_write ?? p.prompt) / 1000, source: `llmapi ${spec.provider}` };
    }
  }
  return out;
}
export const priceKey = (spec) => `${spec.route}:${spec.model}`;
