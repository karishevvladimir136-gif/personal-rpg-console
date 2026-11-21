// TOWN_7: TOWN_2's doors (scripts/town-2/providers.mjs) plus one route — OpenRouter's chat completions for a spec with
// `cache` (Opus 5.5, pinned to one host, `allow_fallbacks: false`): the same request as TOWN_1's OpenRouter route with
// the system text and the last message as content parts carrying `cache_control: {type: "ephemeral"}` (billing only;
// the text the model reads is the same). Usage is read as TOWN_1 reads it (`prompt_tokens` is the whole prompt; cached
// and cache-written parts in `prompt_tokens_details`), the charge from OpenRouter's own `usage.cost`.
import { OPENROUTER, TIMEOUT_MS } from "../town-1/providers.mjs";
import { bodyOf as bodyOf2, callModel as callModel2, provenanceOf, readBalances, readPrices, priceKey, KEYS } from "../town-2/providers.mjs";

export { provenanceOf, readBalances, readPrices, priceKey, KEYS };

const EPHEMERAL = Object.freeze({ type: "ephemeral" });
const DECLINED = /invalid_prompt|usage polic|content.?filter|flagged|moderation|high.?risk|sensitive|inappropriate|safety/i;
const blank = () => ({ text: "", reasoning: null, usage: { input_tokens: 0, output_tokens: 0, reasoning_tokens: 0, cache_read: 0, cache_write: 0 }, chargedUsd: null, servedModel: null, upstream: null,
  stopReason: null, refused: false, refusalCategory: null, refusalText: null, status: null, error: null, requestId: null });
const errorOf = (status, value, raw) => { const e = value?.error ?? value; const msg = typeof e === "string" ? e : e?.message ?? raw?.slice(0, 200) ?? ""; return `HTTP ${status}${e?.type ? ` ${e.type}` : ""}${e?.code ? ` ${e.code}` : ""}: ${String(msg).slice(0, 300)}`; };

/** The cached OpenRouter body: TOWN_1's, with the system text and the last message as cached content parts. */
export function cachedOpenRouterBody(spec, { system, messages, maxTokens, effort }) {
  const msgs = messages.map((m, i) => (i === messages.length - 1 ? { role: m.role, content: [{ type: "text", text: m.content, cache_control: EPHEMERAL }] } : { role: m.role, content: m.content }));
  return { model: spec.model, messages: [...(system ? [{ role: "system", content: [{ type: "text", text: system, cache_control: EPHEMERAL }] }] : []), ...msgs], max_tokens: maxTokens,
    reasoning: { effort }, provider: { order: [spec.upstream], allow_fallbacks: false, require_parameters: true }, usage: { include: true } };
}
export const bodyOf = (spec, args) => (spec.route === "openrouter" && spec.cache ? cachedOpenRouterBody(spec, args) : bodyOf2(spec, args));

/** TOWN_1's openrouterChat, with the cached body. Never throws. */
async function cachedOpenRouter(spec, args, { apiKey, fetcher }) {
  const out = blank();
  try {
    const r = await fetcher(`${OPENROUTER}/chat/completions`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(cachedOpenRouterBody(spec, args)), signal: AbortSignal.timeout(TIMEOUT_MS) });
    const raw = await r.text();
    let v = null; try { v = JSON.parse(raw); } catch { /* not JSON */ }
    out.status = r.status; out.requestId = r.headers.get("x-generation-id") ?? v?.id ?? null;
    if (r.ok && !v) return { ...out, error: `empty or unparseable response body (HTTP ${r.status})` };
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
      chargedUsd: typeof u.cost === "number" ? u.cost : null, nativeFinishReason: c.native_finish_reason ?? null };
    if (c.error) {
      const m = String(c.error.message ?? "");
      return DECLINED.test(m) ? { ...base, text: "", stopReason: "refusal", refused: true, refusalCategory: "upstream_declined", refusalText: m.slice(0, 1000) } : { ...base, error: `upstream error ${c.error.code ?? ""} ${m.slice(0, 200)}` };
    }
    const refusal = typeof c.message?.refusal === "string" && c.message.refusal.trim() ? c.message.refusal.trim() : null;
    // Anthropic's own refusal stop reason arrives as native_finish_reason «refusal» (finish_reason may read «stop»)
    if (refusal || c.finish_reason === "content_filter" || c.native_finish_reason === "refusal") return { ...base, text: "", stopReason: "refusal", refused: true, refusalCategory: refusal ? "refusal" : c.native_finish_reason === "refusal" ? "refusal (native)" : "content_filter", refusalText: refusal ?? (text || null) };
    return { ...base, stopReason: c.finish_reason === "length" ? "max_tokens" : c.finish_reason === "stop" ? "end_turn" : c.finish_reason ?? null };
  } catch (error) { return { ...out, error: String(error?.message ?? error).slice(0, 200) }; }
}

/** One call: the cached OpenRouter route for a spec with `cache` on OpenRouter, TOWN_2's otherwise. */
export async function callModel(spec, args, ctx) {
  if (spec.route === "openrouter" && spec.cache) return cachedOpenRouter(spec, args, { apiKey: ctx.keys.openrouter, fetcher: ctx.fetcher ?? fetch });
  return callModel2(spec, args, ctx);
}
