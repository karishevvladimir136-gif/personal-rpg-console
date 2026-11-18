// SATI_1: the doors. Claude (Haiku 5.5, Opus 5.5, Fable 5.1, Fable 5.2) through llmapi.ai's Messages route pinned to
// `aws-bedrock/<model>`, Sol through llmapi's chat completions pinned to `openai/gpt-6.1-sol`, all with `X-No-Fallback: true`
// (SOCIAL_FRAME_1 Part B and TOWN_1's door); DeepSeek V4 Pro through OpenRouter pinned to DeepInfra fp8 with
// `allow_fallbacks: false` (TOWN_1's request). Adapted from scripts/town-0/llmapi.mjs and scripts/town-1/providers.mjs on
// origin/claude/town-1. Keys are read from the environment and never printed or written. Temperature is never sent
// (the provider's default; recorded as such). Every call returns a plain record and never throws.
export const LLMAPI = "https://api.llmapi.ai/v1";
export const OPENROUTER = "https://openrouter.ai/api/v1";
export const KEYS = { llmapi: "APP_LLMAPI_KEY", openrouter: "APP_OPENROUTER_API_KEY" };
export const TIMEOUT_MS = 240_000;

export const FAMILIES = Object.freeze({
  haiku: { name: "haiku", label: "Claude Haiku 5.5", route: "messages", model: "claude-haiku-5-5", provider: "aws-bedrock" },
  opus: { name: "opus", label: "Claude Opus 5.5", route: "messages", model: "claude-opus-5-5", provider: "aws-bedrock" },
  fable51: { name: "fable51", label: "Claude Fable 5.1", route: "messages", model: "claude-fable-5-1", provider: "aws-bedrock" },
  fable52: { name: "fable52", label: "Claude Fable 5.2", route: "messages", model: "claude-fable-5-2", provider: "aws-bedrock" },
  sol: { name: "sol", label: "GPT-6.1 Sol", route: "chat", model: "gpt-6.1-sol", provider: "openai" },
  deepseek: { name: "deepseek", label: "DeepSeek V4 Pro", route: "openrouter", model: "deepseek/deepseek-v4-pro-0813", upstream: "deepinfra/fp8", upstreamName: "DeepInfra",
    // Amendment 1 (docs/runs/sati-1-freeze.md, after the probe, before its first sit): on this route the cap counts reasoning.
    reasoningAllowance: 2000 },
});
export const FAMILY_ORDER = Object.freeze(["haiku", "opus", "fable51", "fable52", "sol", "deepseek"]);
export const INSTRUMENTS = Object.freeze({
  judge: { name: "judge", label: "Claude Haiku 5.5 (welfare)", route: "messages", model: "claude-haiku-5-5", provider: "aws-bedrock" },
  referee: { name: "referee", label: "Claude Opus 5.5 (welfare referee)", route: "messages", model: "claude-opus-5-5", provider: "aws-bedrock" },
  raterHaiku: { name: "raterHaiku", label: "Claude Haiku 5.5 (rater)", route: "messages", model: "claude-haiku-5-5", provider: "aws-bedrock" },
  raterSol: { name: "raterSol", label: "GPT-6.1 Sol (rater)", route: "chat", model: "gpt-6.1-sol", provider: "openai" },
});
export const specByModel = (model) => Object.values(INSTRUMENTS).find((s) => s.model === model);

const DECLINED = /invalid_prompt|usage polic|content.?filter|flagged|moderation|high.?risk|sensitive|inappropriate|safety/i;
const blank = () => ({ text: "", reasoning: null, usage: { input_tokens: 0, output_tokens: 0, reasoning_tokens: 0, cache_read: 0, cache_write: 0 }, chargedUsd: null,
  servedModel: null, upstream: null, responseId: null, stopReason: null, refused: false, refusalCategory: null, refusalText: null, status: null, error: null, requestId: null });
const errorOf = (status, value, raw) => { const e = value?.error ?? value; const msg = typeof e === "string" ? e : e?.message ?? raw?.slice(0, 200) ?? ""; return `HTTP ${status}${e?.type ? ` ${e.type}` : ""}${e?.code ? ` ${e.code}` : ""}: ${String(msg).slice(0, 300)}`; };
const chatMessages = (system, messages) => [...(system ? [{ role: "system", content: system }] : []), ...messages.map((m) => ({ role: m.role, content: m.content }))];

/** The request body (exported for the record and the tests). */
export function bodyOf(spec, { system = null, messages, maxTokens, effort = null }) {
  if (spec.route === "messages") return { model: `${spec.provider}/${spec.model}`, max_tokens: maxTokens, ...(effort ? { output_config: { effort } } : {}), ...(system ? { system } : {}), messages };
  if (spec.route === "chat") return { model: `${spec.provider}/${spec.model}`, messages: chatMessages(system, messages), max_tokens: maxTokens, ...(effort ? { reasoning_effort: effort } : {}) };
  return { model: spec.model, messages: chatMessages(system, messages), max_tokens: maxTokens, ...(effort ? { reasoning: { effort } } : {}), provider: { order: [spec.upstream], allow_fallbacks: false, require_parameters: true }, usage: { include: true } };
}

async function post(url, headers, body, fetcher) {
  const r = await fetcher(url, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body), signal: AbortSignal.timeout(TIMEOUT_MS) });
  const raw = await r.text(); let v = null; try { v = JSON.parse(raw); } catch { /* not JSON */ }
  return { r, raw, v };
}

async function messagesRoute(spec, args, { apiKey, fetcher }) {
  const out = blank();
  try {
    const { r, raw, v } = await post(`${LLMAPI}/messages`, { Authorization: `Bearer ${apiKey}`, "X-No-Fallback": "true", "anthropic-version": "2023-06-01" }, bodyOf(spec, args), fetcher);
    out.status = r.status; out.requestId = r.headers.get("x-request-id") ?? r.headers.get("request-id") ?? null;
    if (!r.ok || !v) return { ...out, error: errorOf(r.status, v, raw) };
    const u = v.usage ?? {};
    const refused = v.stop_reason === "refusal";
    const text = (v.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n").trim();
    return { ...out, text: refused ? "" : text, servedModel: v.model ?? null, responseId: v.id ?? null, stopReason: v.stop_reason ?? null,
      // Anthropic counts cache reads and writes apart from input_tokens; stored here as the whole prompt, like the chat routes.
      usage: { input_tokens: (u.input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0), output_tokens: u.output_tokens ?? 0, reasoning_tokens: 0, cache_read: u.cache_read_input_tokens ?? 0, cache_write: u.cache_creation_input_tokens ?? 0 },
      chargedUsd: typeof u.cost_usd_total === "number" ? u.cost_usd_total : typeof u.cost === "number" ? u.cost : null,
      refused, refusalCategory: refused ? v.stop_details?.category ?? "refusal" : null, refusalText: refused ? v.stop_details?.explanation ?? null : null };
  } catch (error) { return { ...out, error: String(error?.message ?? error).slice(0, 200) }; }
}

async function chatRoute(spec, args, { apiKey, fetcher }) {
  const out = blank();
  try {
    const { r, raw, v } = await post(`${LLMAPI}/chat/completions`, { Authorization: `Bearer ${apiKey}`, "X-No-Fallback": "true" }, bodyOf(spec, args), fetcher);
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

async function openrouterRoute(spec, args, { apiKey, fetcher }) {
  const out = blank();
  try {
    const { r, raw, v } = await post(`${OPENROUTER}/chat/completions`, { Authorization: `Bearer ${apiKey}` }, bodyOf(spec, args), fetcher);
    out.status = r.status; out.requestId = r.headers.get("x-generation-id") ?? v?.id ?? null;
    if (!r.ok || !v || v.error) {
      const message = `${v?.error?.message ?? ""} ${v?.error?.metadata?.raw ?? ""}`;
      if ([400, 403].includes(r.status) && DECLINED.test(message)) return { ...out, stopReason: "refusal", refused: true, refusalCategory: r.status === 403 ? "moderation" : "upstream_declined", refusalText: message.trim().slice(0, 1000), upstream: v?.error?.metadata?.provider_name ?? null };
      return { ...out, status: r.ok ? (v?.error?.code ?? r.status) : r.status, error: errorOf(r.ok ? (v?.error?.code ?? r.status) : r.status, v, raw), upstream: v?.error?.metadata?.provider_name ?? null };
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

/** One call, no retry (retries are the caller's, never after a refusal). */
export function callOnce(spec, args, { keys, fetcher = fetch }) {
  if (spec.route === "messages") return messagesRoute(spec, args, { apiKey: keys.llmapi, fetcher });
  if (spec.route === "chat") return chatRoute(spec, args, { apiKey: keys.llmapi, fetcher });
  return openrouterRoute(spec, args, { apiKey: keys.openrouter, fetcher });
}

/** The served model matches the pinned one (and, on OpenRouter, the pinned host). */
export function provenanceOk(spec, r) {
  const served = String(r.servedModel ?? "").toLowerCase();
  if (spec.route === "openrouter") return served.startsWith(spec.model.replace(/-\d{4}$/, "").toLowerCase()) && r.upstream === spec.upstreamName;
  const s = served.replace(/^[a-z0-9-]+\//, "").replace(/^(?:[a-z]{2}\.)?anthropic\./, "");
  const m = spec.model.toLowerCase();
  return s === m || s.startsWith(`${m}-20`) || s.startsWith(`${m}-v`) || s.startsWith(`${m}:`) || s.startsWith(`${m}-0`);
}

/** Both doors' balances (free reads). */
export async function readBalances({ keys, fetcher = fetch }) {
  let llmapi, openrouter;
  try {
    const r = await fetcher(`${LLMAPI}/credits`, { headers: { Authorization: `Bearer ${keys.llmapi}` }, signal: AbortSignal.timeout(30_000) });
    const v = await r.json(); llmapi = { total: typeof v.total_credits === "number" ? v.total_credits : v.credits };
    if (typeof llmapi.total !== "number") llmapi = { error: `HTTP ${r.status}` };
  } catch (error) { llmapi = { error: String(error?.message ?? error).slice(0, 120) }; }
  try {
    const r = await fetcher(`${OPENROUTER}/credits`, { headers: { Authorization: `Bearer ${keys.openrouter}` }, signal: AbortSignal.timeout(30_000) });
    const v = await r.json(); openrouter = { total: v.data.total_credits - v.data.total_usage };
  } catch (error) { openrouter = { error: String(error?.message ?? error).slice(0, 120) }; }
  return { llmapi, openrouter, at: new Date().toISOString() };
}

/** Listed prices per token for every spec used. */
export async function readPrices(specs, { fetcher = fetch } = {}) {
  const llm = await (await fetcher(`${LLMAPI}/models`, { signal: AbortSignal.timeout(30_000) })).json();
  const out = {};
  for (const spec of specs) {
    const key = priceKey(spec);
    if (out[key]) continue;
    if (spec.route === "openrouter") {
      const e = (await (await fetcher(`${OPENROUTER}/models/${spec.model}/endpoints`, { signal: AbortSignal.timeout(30_000) })).json()).data.endpoints.find((x) => x.tag === spec.upstream);
      if (!e) throw new Error(`no OpenRouter endpoint ${spec.upstream} for ${spec.model}`);
      out[key] = { input: Number(e.pricing.prompt), output: Number(e.pricing.completion), cacheRead: Number(e.pricing.input_cache_read ?? e.pricing.prompt), cacheWrite: Number(e.pricing.input_cache_write ?? e.pricing.prompt), source: `OpenRouter endpoint ${spec.upstream}` };
    } else {
      const p = (llm.data ?? llm).find((m) => m.id === spec.model)?.providers?.find((x) => x.providerId === spec.provider)?.pricing;
      if (!p) throw new Error(`no llmapi price for ${spec.provider}/${spec.model}`);
      out[key] = { input: Number(p.prompt) / 1000, output: Number(p.completion) / 1000, cacheRead: Number(p.input_cache_read ?? p.prompt) / 1000, cacheWrite: Number(p.input_cache_write ?? p.prompt) / 1000, source: `llmapi ${spec.provider} (listed per 1K)` };
    }
  }
  return out;
}
export const priceKey = (spec) => `${spec.route}:${spec.provider ?? spec.upstream}:${spec.model}`;
/** Listed-price cost of one call. Reasoning tokens are inside output tokens on the chat routes. */
export function costOf(price, usage) {
  if (!price) return null;
  const fresh = Math.max(0, (usage.input_tokens ?? 0) - (usage.cache_read ?? 0) - (usage.cache_write ?? 0));
  return fresh * price.input + (usage.cache_read ?? 0) * price.cacheRead + (usage.cache_write ?? 0) * price.cacheWrite + (usage.output_tokens ?? 0) * price.output;
}
