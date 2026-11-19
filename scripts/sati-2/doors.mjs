// SATI_2 pilot: every call through OpenRouter (amendment 5; `APP_OPENROUTER_API_KEY`; the llmapi key is never read). Claude
// families through OpenRouter's Anthropic-compatible Messages route pinned to Anthropic (`output_config.effort`, as SATI_1's
// Messages door); Sol through chat completions pinned to OpenAI; DeepSeek V4 Pro as in SATI_1 / TOWN_1 (chat completions
// pinned to DeepInfra fp8); Kimi K3 (the referee of probe sets 1–3, as SOCIAL_FRAME_1) pinned to Moonshot AI. Every request:
// `allow_fallbacks: false`; provenance (served model and host) read from every response — and, when a response does not name
// its host, from OpenRouter's generation record (a free read). Prompt caching on the Claude routes is a billing setting only:
// `cache_control` marks on message blocks change nothing the model sees. Keys are read from the environment, never printed.
// Every call returns a plain record and never throws.
export const OPENROUTER = "https://openrouter.ai/api/v1";
export const KEY = "APP_OPENROUTER_API_KEY";
export const TIMEOUT_MS = 300_000;

const claude = (name, label, slug) => ({ name, label, route: "messages", model: slug, pin: "anthropic", host: "Anthropic" });
export const FAMILIES = Object.freeze({
  haiku: claude("haiku", "Claude Haiku 5.5", "anthropic/claude-haiku-5.5"),
  sol: { name: "sol", label: "GPT-6.1 Sol", route: "chat", model: "openai/gpt-6.1-sol", pin: "openai", host: "OpenAI" },
  deepseek: { name: "deepseek", label: "DeepSeek V4 Pro", route: "chat", model: "deepseek/deepseek-v4-pro-0813", pin: "deepinfra/fp8", host: "DeepInfra" },
  fable52: claude("fable52", "Claude Fable 5.2", "anthropic/claude-fable-5.2"),
  opus: claude("opus", "Claude Opus 5.5", "anthropic/claude-opus-5.5"),
  fable51: claude("fable51", "Claude Fable 5.1", "anthropic/claude-fable-5.1"),
});
/** The mandate's order. */
export const FAMILY_ORDER = Object.freeze(["haiku", "sol", "deepseek", "fable52", "opus", "fable51"]);
export const INSTRUMENTS = Object.freeze({
  judge: claude("judge", "Claude Haiku 5.5 (welfare check; probe judge)", "anthropic/claude-haiku-5.5"),
  referee: claude("referee", "Claude Opus 5.5 (welfare referee)", "anthropic/claude-opus-5.5"),
  raterHaiku: claude("raterHaiku", "Claude Haiku 5.5 (rater)", "anthropic/claude-haiku-5.5"),
  raterSol: { name: "raterSol", label: "GPT-6.1 Sol (rater; probe judge)", route: "chat", model: "openai/gpt-6.1-sol", pin: "openai", host: "OpenAI" },
  // Freeze addendum 2: Moonshot AI first; when it is rate-limited upstream, the same model on Fireworks or Together (no open
  // fallback; the host is recorded on every call).
  kimi: { name: "kimi", label: "Kimi K3 (probe referee)", route: "chat", model: "moonshotai/kimi-k3", pin: "moonshotai", pins: ["moonshotai", "fireworks", "together"], host: "Moonshot AI" },
});
export const ALL_SPECS = Object.freeze([...Object.values(FAMILIES), ...Object.values(INSTRUMENTS)]);

const DECLINED = /invalid_prompt|usage polic|content.?filter|flagged|moderation|high.?risk|sensitive|inappropriate|safety|refus/i;
const blank = () => ({ text: "", reasoning: null, usage: { input_tokens: 0, output_tokens: 0, reasoning_tokens: 0, cache_read: 0, cache_write: 0 }, chargedUsd: null,
  servedModel: null, upstream: null, responseId: null, stopReason: null, refused: false, refusalCategory: null, refusalText: null, status: null, error: null, requestId: null });
const errorOf = (status, value, raw) => { const e = value?.error ?? value; const msg = typeof e === "string" ? e : e?.message ?? raw?.slice(0, 200) ?? ""; return `HTTP ${status}${e?.type ? ` ${e.type}` : ""}${e?.code ? ` ${e.code}` : ""}: ${String(msg).slice(0, 300)}${e?.metadata?.raw ? ` | ${String(e.metadata.raw).slice(0, 300)}` : ""}`; };
const provider = (spec) => ({ order: spec.pins ?? [spec.pin], allow_fallbacks: false, ...(spec.route === "chat" ? { require_parameters: true } : {}) });
/** A message as a content block with a cache mark (Claude routes only). */
const marked = (m) => ({ role: m.role, content: [{ type: "text", text: m.content, cache_control: { type: "ephemeral" } }] });

/** The request body (exported for the record and the tests). `cacheAt`: message indexes to mark on the Claude routes. */
export function bodyOf(spec, { system = null, messages, maxTokens, effort = null, cacheAt = [] }) {
  if (spec.route === "messages") {
    const marks = new Set(cacheAt.map((i) => (i < 0 ? messages.length + i : i)));
    return { model: spec.model, max_tokens: maxTokens, ...(effort ? { output_config: { effort } } : {}), ...(system ? { system } : {}),
      messages: messages.map((m, i) => (marks.has(i) ? marked(m) : { role: m.role, content: m.content })), provider: provider(spec) };
  }
  return { model: spec.model, messages: [...(system ? [{ role: "system", content: system }] : []), ...messages.map((m) => ({ role: m.role, content: m.content }))], max_tokens: maxTokens,
    ...(effort ? { reasoning: { effort } } : {}), provider: provider(spec), usage: { include: true } };
}

async function post(url, apiKey, body, fetcher) {
  const r = await fetcher(url, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, "anthropic-version": "2023-06-01" }, body: JSON.stringify(body), signal: AbortSignal.timeout(TIMEOUT_MS) });
  const raw = await r.text(); let v = null; try { v = JSON.parse(raw); } catch { /* not JSON */ }
  return { r, raw, v };
}
const declined = (out, r, v) => {
  const message = `${v?.error?.message ?? ""} ${v?.error?.metadata?.raw ?? ""}`;
  if ([400, 403].includes(r.status) && DECLINED.test(message) && !/data retention|context length|max_tokens|too long/i.test(message)) return { ...out, stopReason: "refusal", refused: true, refusalCategory: r.status === 403 ? "moderation" : "upstream_declined", refusalText: message.trim().slice(0, 1000), upstream: v?.error?.metadata?.provider_name ?? null };
  return null;
};

async function messagesRoute(spec, args, { apiKey, fetcher }) {
  const out = blank();
  try {
    const { r, raw, v } = await post(`${OPENROUTER}/messages`, apiKey, bodyOf(spec, args), fetcher);
    out.status = r.status; out.requestId = r.headers.get("x-generation-id") ?? r.headers.get("request-id") ?? v?.id ?? null;
    if (!r.ok || !v || v.type === "error" || v.error) return declined(out, r, v) ?? { ...out, error: errorOf(r.status, v, raw), upstream: v?.error?.metadata?.provider_name ?? null };
    const u = v.usage ?? {};
    const refused = v.stop_reason === "refusal";
    const text = (v.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n").trim();
    const thinking = (v.content ?? []).filter((b) => b.type === "thinking").map((b) => b.thinking ?? "").join("\n") || null;
    return { ...out, text: refused ? "" : text, reasoning: thinking, servedModel: v.model ?? null, upstream: v.provider ?? null, responseId: v.id ?? null, stopReason: v.stop_reason ?? null,
      usage: { input_tokens: (u.input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0), output_tokens: u.output_tokens ?? 0, reasoning_tokens: 0, cache_read: u.cache_read_input_tokens ?? 0, cache_write: u.cache_creation_input_tokens ?? 0 },
      chargedUsd: typeof u.cost === "number" ? u.cost : null,
      refused, refusalCategory: refused ? v.stop_details?.category ?? "refusal" : null, refusalText: refused ? v.stop_details?.explanation ?? null : null };
  } catch (error) { return { ...out, error: String(error?.message ?? error).slice(0, 200) }; }
}

async function chatRoute(spec, args, { apiKey, fetcher }) {
  const out = blank();
  try {
    const { r, raw, v } = await post(`${OPENROUTER}/chat/completions`, apiKey, bodyOf(spec, args), fetcher);
    out.status = r.status; out.requestId = r.headers.get("x-generation-id") ?? v?.id ?? null;
    if (!r.ok || !v || v.error) return declined(out, r, v) ?? { ...out, status: r.ok ? (v?.error?.code ?? r.status) : r.status, error: errorOf(r.ok ? (v?.error?.code ?? r.status) : r.status, v, raw), upstream: v?.error?.metadata?.provider_name ?? null };
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

/** OpenRouter's generation record (free): the host that served a call, when the response did not name it. */
export async function generationOf(id, { apiKey, fetcher = fetch, tries = 6, wait = 1500 }) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetcher(`${OPENROUTER}/generation?id=${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(30_000) });
      if (r.ok) { const d = (await r.json())?.data; if (d) return { host: d.provider_name ?? null, model: d.model ?? null, cost: typeof d.total_cost === "number" ? d.total_cost : null }; }
    } catch { /* retry */ }
    await new Promise((res) => setTimeout(res, wait));
  }
  return null;
}

/** One call, no retry (retries are the caller's, never after a refusal). A response that names no host gets its generation
 * record read. */
export async function callOnce(spec, args, { keys, fetcher = fetch, lookup = true }) {
  const apiKey = keys.openrouter;
  const r = await (spec.route === "messages" ? messagesRoute : chatRoute)(spec, args, { apiKey, fetcher });
  if (lookup && !r.error && !r.upstream && (r.requestId || r.responseId)) {
    const g = await generationOf(r.requestId ?? r.responseId, { apiKey, fetcher });
    if (g) return { ...r, upstream: g.host, upstreamFrom: "generation", chargedUsd: r.chargedUsd ?? g.cost };
  }
  return r;
}

/** The served model and host match the pin. */
export function provenanceOk(spec, r) {
  const served = String(r.servedModel ?? "").toLowerCase().replace(/^~/, "");
  const want = spec.model.toLowerCase();
  const norm = served.replace(/^anthropic\//, "").replace(/(\d)-(\d)/, "$1.$2"), w = want.replace(/^anthropic\//, "");
  const modelOk = spec.route === "messages"
    ? served === want || norm === w || norm.startsWith(`${w}-`) || norm.startsWith(`${w}:`)
    : served === want || served.startsWith(want.replace(/-\d{4}$/, ""));
  return modelOk && r.upstream === spec.host;
}

/** The OpenRouter balance (a free read). */
export async function readBalance({ keys, fetcher = fetch }) {
  try {
    const r = await fetcher(`${OPENROUTER}/credits`, { headers: { Authorization: `Bearer ${keys.openrouter}` }, signal: AbortSignal.timeout(30_000) });
    const v = await r.json();
    return { total: v.data.total_credits - v.data.total_usage, credits: v.data.total_credits, usage: v.data.total_usage, at: new Date().toISOString() };
  } catch (error) { return { error: String(error?.message ?? error).slice(0, 120), at: new Date().toISOString() }; }
}

/** Listed prices per token of the pinned endpoint of every spec. */
export async function readPrices(specs = ALL_SPECS, { fetcher = fetch } = {}) {
  const out = {};
  for (const spec of specs) {
    const key = priceKey(spec);
    if (out[key]) continue;
    const e = (await (await fetcher(`${OPENROUTER}/models/${spec.model}/endpoints`, { signal: AbortSignal.timeout(30_000) })).json()).data.endpoints.find((x) => x.tag === spec.pin);
    if (!e) throw new Error(`no OpenRouter endpoint ${spec.pin} for ${spec.model}`);
    out[key] = { input: Number(e.pricing.prompt), output: Number(e.pricing.completion), cacheRead: Number(e.pricing.input_cache_read ?? e.pricing.prompt), cacheWrite: Number(e.pricing.input_cache_write ?? e.pricing.prompt), source: `OpenRouter endpoint ${spec.pin} (${e.provider_name})` };
  }
  return out;
}
export const priceKey = (spec) => `${spec.pin}:${spec.model}`;
/** Listed-price cost of one call (reasoning tokens are inside output tokens). */
export function costOf(price, usage) {
  if (!price) return null;
  const fresh = Math.max(0, (usage.input_tokens ?? 0) - (usage.cache_read ?? 0) - (usage.cache_write ?? 0));
  return fresh * price.input + (usage.cache_read ?? 0) * price.cacheRead + (usage.cache_write ?? 0) * price.cacheWrite + (usage.output_tokens ?? 0) * price.output;
}
