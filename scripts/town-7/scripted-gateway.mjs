// TOWN_7: TOWN_5's scripted gateway (llmapi and OpenRouter at $0) with Opus 5.5 on OpenRouter's Anthropic host: its
// endpoint listing, and its chat completions answered as the Anthropic host would (model and provider named, cache
// parts in the usage). `opusRefuses`: every Opus call ends with Anthropic's refusal (the first-screen check's other branch).
import { scriptedGateway as gateway5 } from "../town-5/scripted-gateway.mjs";

export function scriptedGateway({ opusRefuses = false, ...opts } = {}) {
  const inner = gateway5(opts);
  return async (url, init = {}) => {
    if (url.includes("openrouter") && url.includes("/models/anthropic/claude-opus-5.5/endpoints")) {
      return new Response(JSON.stringify({ data: { endpoints: [{ tag: "anthropic", provider_name: "Anthropic", pricing: { prompt: "0.000004", completion: "0.00002", input_cache_read: "0.0000002", input_cache_write: "0.000005" } }] } }), { status: 200, headers: { "content-type": "application/json" } });
    }
    const opus = url.includes("openrouter") && url.endsWith("/chat/completions") && JSON.parse(init.body).model === "anthropic/claude-opus-5.5";
    const r = await inner(url, init);
    if (!opus) return r;
    const v = await r.json();
    v.provider = "Anthropic";
    v.model = "anthropic/claude-opus-5.5";
    const p = v.usage.prompt_tokens;
    v.usage.prompt_tokens_details = { cached_tokens: Math.floor(p * 0.8), cache_write_tokens: Math.floor(p * 0.1) };
    if (opusRefuses) { v.choices[0].message.content = ""; v.choices[0].finish_reason = "stop"; v.choices[0].native_finish_reason = "refusal"; }
    return new Response(JSON.stringify(v), { status: 200, headers: { "content-type": "application/json", "x-generation-id": v.id } });
  };
}
