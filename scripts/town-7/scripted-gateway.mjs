// TOWN_7: TOWN_5's scripted gateway (llmapi and OpenRouter at $0) with the OpenRouter routes TOWN_7 adds — Opus 5.5 on
// the Anthropic host (cached), and, for a world run --via-openrouter, GPT-6.1 Sol on the OpenAI host and the welfare
// judges (Haiku 5.5, Opus 5.5) on the Anthropic host: their endpoint listings, and their chat completions answered as
// those hosts would (model and provider named). `opusRefuses`: every Opus citizen call ends with Anthropic's refusal.
import { scriptedGateway as gateway5 } from "../town-5/scripted-gateway.mjs";

const HOSTS = Object.freeze({
  "anthropic/claude-opus-5.5": { tag: "anthropic", provider: "Anthropic", prompt: "0.000004", completion: "0.00002", read: "0.0000002", write: "0.000005" },
  "anthropic/claude-haiku-5.5": { tag: "anthropic", provider: "Anthropic", prompt: "0.0000001", completion: "0.0000005", read: "0.00000001", write: "0.000000125" },
  "openai/gpt-6.1-sol": { tag: "openai", provider: "OpenAI", prompt: "0.000002", completion: "0.00001", read: "0.0000001", write: "0.000002" },
});

export function scriptedGateway({ opusRefuses = false, ...opts } = {}) {
  const inner = gateway5(opts);
  return async (url, init = {}) => {
    const ep = /openrouter\.ai\/api\/v1\/models\/(.+)\/endpoints$/.exec(url);
    if (ep && HOSTS[ep[1]]) {
      const h = HOSTS[ep[1]];
      return new Response(JSON.stringify({ data: { endpoints: [{ tag: h.tag, provider_name: h.provider, pricing: { prompt: h.prompt, completion: h.completion, input_cache_read: h.read, input_cache_write: h.write } }] } }), { status: 200, headers: { "content-type": "application/json" } });
    }
    const model = url.includes("openrouter") && url.endsWith("/chat/completions") ? JSON.parse(init.body).model : null;
    const r = await inner(url, init);
    if (!HOSTS[model]) return r;
    const v = await r.json();
    v.provider = HOSTS[model].provider;
    v.model = model;
    const cached = Array.isArray(JSON.parse(init.body).messages.at(-1).content);
    if (cached) { const p = v.usage.prompt_tokens; v.usage.prompt_tokens_details = { cached_tokens: Math.floor(p * 0.8), cache_write_tokens: Math.floor(p * 0.1) }; }
    const judge = JSON.parse(init.body).messages.some((m) => m.role === "system" && /blind evaluator/.test(typeof m.content === "string" ? m.content : ""));
    if (opusRefuses && model === "anthropic/claude-opus-5.5" && !judge) { v.choices[0].message.content = ""; v.choices[0].finish_reason = "stop"; v.choices[0].native_finish_reason = "refusal"; }
    return new Response(JSON.stringify(v), { status: 200, headers: { "content-type": "application/json", "x-generation-id": v.id } });
  };
}
