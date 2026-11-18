// TOWN_2: TOWN_1's doors (scripts/town-1/providers.mjs), plus prompt caching on the Claude citizens' Messages calls —
// a harness decision about billing only: the bytes the model reads are the same text; two cache breakpoints
// (`cache_control: {type: "ephemeral"}`) on the system text and on the last message, so the frozen interface text and
// the turn's growing conversation are read from the cache instead of being billed in full on every call (Sol's OpenAI
// route caches by itself, as it did in TOWN_1). Usage is normalised to the OpenAI convention the meter reads:
// `input_tokens` is the whole prompt, of which `cache_read` and `cache_write` are parts.
import { BASE_URL as LLMAPI, modelMatches } from "../town-0/llmapi.mjs";
import { bodyOf as bodyOf1, callModel as callModel1, provenanceOf, readBalances, readPrices as readPrices1, priceKey, KEYS, TIMEOUT_MS } from "../town-1/providers.mjs";

export { provenanceOf, readBalances, priceKey, KEYS, modelMatches };

const blank = () => ({ text: "", reasoning: null, usage: { input_tokens: 0, output_tokens: 0, reasoning_tokens: 0, cache_read: 0, cache_write: 0 }, chargedUsd: null, servedModel: null, upstream: null,
  stopReason: null, refused: false, refusalCategory: null, refusalText: null, status: null, error: null, requestId: null });

const EPHEMERAL = Object.freeze({ type: "ephemeral" });
/** The cached Messages body: the same system text and messages, as content blocks, with two breakpoints. */
export function cachedBody(spec, { system, messages, maxTokens, effort }) {
  const msgs = messages.map((m, i) => (i === messages.length - 1 ? { role: m.role, content: [{ type: "text", text: m.content, cache_control: EPHEMERAL }] } : { role: m.role, content: m.content }));
  return { model: `${spec.provider}/${spec.model}`, max_tokens: maxTokens, ...(effort ? { output_config: { effort } } : {}), ...(system ? { system: [{ type: "text", text: system, cache_control: EPHEMERAL }] } : {}), messages: msgs };
}
export const bodyOf = (spec, args) => (spec.route === "messages" && spec.cache ? cachedBody(spec, args) : bodyOf1(spec, args));

async function cachedMessages(spec, args, { apiKey, fetcher }) {
  const out = blank();
  try {
    const r = await fetcher(`${LLMAPI}/messages`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, "X-No-Fallback": "true", "anthropic-version": "2023-06-01" },
      body: JSON.stringify(cachedBody(spec, args)), signal: AbortSignal.timeout(TIMEOUT_MS) });
    const raw = await r.text();
    let v = null; try { v = JSON.parse(raw); } catch { /* not JSON */ }
    out.status = r.status; out.requestId = r.headers.get("x-request-id") ?? r.headers.get("request-id") ?? null;
    if (r.ok && !v) return { ...out, error: `empty or unparseable response body (HTTP ${r.status})` };
    if (!r.ok || !v) { const e = v?.error ?? v; const msg = typeof e === "string" ? e : e?.message ?? raw.slice(0, 200); return { ...out, error: `HTTP ${r.status}${e?.type ? ` ${e.type}` : ""}: ${String(msg).slice(0, 300)}` }; }
    const u = v.usage ?? {};
    const read = u.cache_read_input_tokens ?? 0, write = u.cache_creation_input_tokens ?? 0;
    const refused = v.stop_reason === "refusal";
    const text = (v.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n").trim();
    return { ...out, text: refused ? "" : text, servedModel: v.model ?? null, responseId: v.id ?? null, stopReason: v.stop_reason ?? null,
      usage: { input_tokens: (u.input_tokens ?? 0) + read + write, output_tokens: u.output_tokens ?? 0, reasoning_tokens: 0, cache_read: read, cache_write: write, raw_input_tokens: u.input_tokens ?? 0 },
      chargedUsd: typeof u.cost_usd_total === "number" ? u.cost_usd_total : typeof u.cost === "number" ? u.cost : null,
      refused, refusalCategory: refused ? v.stop_details?.category ?? "refusal" : null, refusalText: refused ? v.stop_details?.explanation ?? null : null };
  } catch (error) { return { ...out, error: String(error?.message ?? error).slice(0, 200) }; }
}

/** One call: the cached route for a spec with `cache`, TOWN_1's otherwise. TOWN_1's Messages route reports Anthropic's
 * `input_tokens` (without cache parts); with no cache_control nothing is cached, so it needs no normalising. */
export async function callModel(spec, args, ctx) {
  if (spec.route === "messages" && spec.cache) return cachedMessages(spec, args, { apiKey: ctx.keys.llmapi, fetcher: ctx.fetcher ?? fetch });
  return callModel1(spec, args, ctx);
}

/** Listed prices; a cache write on the Messages route is priced at 1.25 × input (Anthropic's 5-minute write) when the
 * listing does not give one, never below the listing. */
export async function readPrices(specs, opts) {
  const p = await readPrices1(specs, opts);
  for (const spec of specs) {
    const x = p[priceKey(spec)];
    if (spec.route === "messages" && x && x.cacheWrite <= x.input) p[priceKey(spec)] = { ...x, cacheWrite: x.input * 1.25, cacheWriteNote: "1.25 × input (5-minute write), not listed" };
  }
  return p;
}
