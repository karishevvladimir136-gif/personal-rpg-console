// TOWN_11: TOWN_5's doors (scripts/town-2/providers.mjs: llmapi's Messages and chat routes, OpenRouter's chat route) plus
// one more — OpenRouter's Anthropic-compatible Messages route pinned to Anthropic with `allow_fallbacks: false`, SATI_2
// pilot's route (scripts/sati-2/doors.mjs on origin/claude/sati-2-pilot), for Claude Opus 5.5, Fable 5.2, Fable 5.1 and
// the welfare judges. Prompt caching on that route (a spec with `cache`) is a billing setting only, TOWN_2's two
// breakpoints — on the system text and on the last message: the bytes the model reads are the same text. The served
// model and the host are read from every response (the host, when a response does not name it, from OpenRouter's
// generation record, a free read). Keys are read from the environment, never printed. Every call returns TOWN_1's plain
// record and never throws.
import { OPENROUTER } from "../town-1/providers.mjs";
import { bodyOf as bodyOf2, callModel as callModel2, provenanceOf as provenanceOf2, readBalances, readPrices as readPrices2, priceKey, KEYS } from "../town-2/providers.mjs";

export { readBalances, priceKey, KEYS, OPENROUTER };
export const TIMEOUT_MS = 300_000;

const DECLINED = /invalid_prompt|usage polic|content.?filter|flagged|moderation|high.?risk|sensitive|inappropriate|safety|refus/i;
const blank = () => ({ text: "", reasoning: null, usage: { input_tokens: 0, output_tokens: 0, reasoning_tokens: 0, cache_read: 0, cache_write: 0 }, chargedUsd: null,
  servedModel: null, upstream: null, responseId: null, stopReason: null, refused: false, refusalCategory: null, refusalText: null, status: null, error: null, requestId: null });
const errorOf = (status, value, raw) => { const e = value?.error ?? value; const msg = typeof e === "string" ? e : e?.message ?? raw?.slice(0, 200) ?? ""; return `HTTP ${status}${e?.type ? ` ${e.type}` : ""}${e?.code ? ` ${e.code}` : ""}: ${String(msg).slice(0, 300)}${e?.metadata?.raw ? ` | ${String(e.metadata.raw).slice(0, 300)}` : ""}`; };
const EPHEMERAL = Object.freeze({ type: "ephemeral" });

/** The request body of a call on any route (exported for the record, the worst-case estimate and the proofs). */
export function bodyOf(spec, { system, messages, maxTokens, effort }) {
  if (spec.route !== "or-messages") return bodyOf2(spec, { system, messages, maxTokens, effort });
  const last = messages.length - 1;
  const msgs = messages.map((m, i) => (spec.cache && i === last ? { role: m.role, content: [{ type: "text", text: m.content, cache_control: EPHEMERAL }] } : { role: m.role, content: m.content }));
  return { model: spec.model, max_tokens: maxTokens, ...(effort ? { output_config: { effort } } : {}),
    ...(system ? { system: spec.cache ? [{ type: "text", text: system, cache_control: EPHEMERAL }] : system } : {}),
    messages: msgs, provider: { order: [spec.pin], allow_fallbacks: false } };
}

/** The text the model reads, whatever the wire shape (the byte-identity proof compares this with TOWN_5's bodies). */
export function textsOf(body) {
  const flat = (c) => (Array.isArray(c) ? c.map((b) => b.text ?? "").join("") : String(c ?? ""));
  const system = body.system !== undefined ? flat(body.system) : flat(body.messages.find((m) => m.role === "system")?.content ?? "");
  return { system, messages: body.messages.filter((m) => m.role !== "system").map((m) => ({ role: m.role, text: flat(m.content) })) };
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

async function orMessages(spec, args, { apiKey, fetcher, lookup = true }) {
  const out = blank();
  try {
    const r = await fetcher(`${OPENROUTER}/messages`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(bodyOf(spec, args)), signal: AbortSignal.timeout(TIMEOUT_MS) });
    const raw = await r.text();
    let v = null; try { v = JSON.parse(raw); } catch { /* not JSON */ }
    out.status = r.status; out.requestId = r.headers.get("x-generation-id") ?? r.headers.get("request-id") ?? v?.id ?? null;
    if (r.ok && !v) return { ...out, error: `empty or unparseable response body (HTTP ${r.status})` }; // a dropped response, retried
    if (!r.ok || !v || v.type === "error" || v.error) {
      const message = `${v?.error?.message ?? ""} ${v?.error?.metadata?.raw ?? ""}`;
      if ([400, 403].includes(r.status) && DECLINED.test(message) && !/data retention|context length|max_tokens|too long|credit/i.test(message))
        return { ...out, stopReason: "refusal", refused: true, refusalCategory: r.status === 403 ? "moderation" : "upstream_declined", refusalText: message.trim().slice(0, 2000), upstream: v?.error?.metadata?.provider_name ?? null };
      return { ...out, error: errorOf(r.status, v, raw), upstream: v?.error?.metadata?.provider_name ?? null };
    }
    const u = v.usage ?? {};
    const refused = v.stop_reason === "refusal";
    const text = (v.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n").trim();
    const thinking = (v.content ?? []).filter((b) => b.type === "thinking").map((b) => b.thinking ?? "").join("\n") || null;
    const read = u.cache_read_input_tokens ?? 0, write = u.cache_creation_input_tokens ?? 0;
    const res = { ...out, text: refused ? "" : text, reasoning: thinking, servedModel: v.model ?? null, upstream: v.provider ?? null, responseId: v.id ?? null, stopReason: v.stop_reason ?? null,
      usage: { input_tokens: (u.input_tokens ?? 0) + read + write, output_tokens: u.output_tokens ?? 0, reasoning_tokens: 0, cache_read: read, cache_write: write, raw_input_tokens: u.input_tokens ?? 0 },
      chargedUsd: typeof u.cost === "number" ? u.cost : null,
      refused, refusalCategory: refused ? v.stop_details?.category ?? "refusal" : null, refusalText: refused ? v.stop_details?.explanation ?? null : null,
      ...(refused ? { refusalDetails: v.stop_details ?? null, refusalContent: v.content ?? null } : {}) };
    if (lookup && !res.upstream && (res.requestId || res.responseId)) {
      const g = await generationOf(res.requestId ?? res.responseId, { apiKey, fetcher });
      if (g) return { ...res, upstream: g.host, upstreamFrom: "generation", chargedUsd: res.chargedUsd ?? g.cost };
    }
    return res;
  } catch (error) { return { ...out, error: String(error?.message ?? error).slice(0, 200) }; }
}

/** One call: OpenRouter's Messages route for an `or-messages` spec, TOWN_5's doors otherwise. */
export async function callModel(spec, args, ctx) {
  if (spec.route === "or-messages") return orMessages(spec, args, { apiKey: ctx.keys.openrouter, fetcher: ctx.fetcher ?? fetch });
  return callModel2(spec, args, ctx);
}

/** Do the served model and host match the pin? (SATI_2's rule on the Messages route; TOWN_1's otherwise.) */
export function provenanceOf(spec, r) {
  if (spec.route !== "or-messages") return provenanceOf2(spec, r);
  const served = String(r.servedModel ?? "").toLowerCase().replace(/^~/, "");
  const want = spec.model.toLowerCase();
  const norm = served.replace(/^anthropic\//, "").replace(/(\d)-(\d)/, "$1.$2"), w = want.replace(/^anthropic\//, "");
  const modelOk = served === want || norm === w || norm.startsWith(`${w}-`) || norm.startsWith(`${w}:`);
  return modelOk && r.upstream === spec.host;
}

/** Listed prices per token: OpenRouter's pinned endpoint for an `or-messages` spec; TOWN_5's sources otherwise. */
export async function readPrices(specs, { fetcher = fetch } = {}) {
  const out = await readPrices2(specs.filter((s) => s.route !== "or-messages"), { fetcher });
  for (const spec of specs.filter((s) => s.route === "or-messages")) {
    const key = priceKey(spec);
    if (out[key]) continue;
    const e = (await (await fetcher(`${OPENROUTER}/models/${spec.model}/endpoints`, { signal: AbortSignal.timeout(30_000) })).json()).data.endpoints.find((x) => x.tag === spec.pin);
    if (!e) throw new Error(`no OpenRouter endpoint ${spec.pin} for ${spec.model}`);
    out[key] = { input: Number(e.pricing.prompt), output: Number(e.pricing.completion), cacheRead: Number(e.pricing.input_cache_read ?? e.pricing.prompt), cacheWrite: Number(e.pricing.input_cache_write ?? e.pricing.prompt), source: `OpenRouter endpoint ${spec.pin} (${e.provider_name})` };
  }
  return out;
}
