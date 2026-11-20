// TOWN_4: a scripted stand-in for both doors (llmapi.ai and OpenRouter), so every path of the stage — the check, both days
// of a world of each family, the valve's physics, the notice in each arm, a flag and its question, a refusal, the replay —
// runs at $0. llmapi as TOWN_2's scripted gateway; OpenRouter's credits, endpoint listing and chat completions added
// (pinned host «DeepInfra», as TOWN_1's).
import { scriptedGateway as gateway2 } from "../town-2/scripted-gateway.mjs";

export function scriptedGateway(options = {}) {
  const inner = gateway2(options);
  let usage = 0;
  return async (url, init = {}) => {
    if (url.endsWith("/models") && !url.includes("openrouter")) {
      // llmapi lists the Claude models on its first-party host too (TOWN_4 pins Haiku and the judges there)
      const v = await (await inner(url, init)).json();
      for (const m of v.data) if (m.id.startsWith("claude-")) m.providers.push({ ...m.providers[0], providerId: "anthropic" });
      return new Response(JSON.stringify(v), { status: 200, headers: { "content-type": "application/json" } });
    }
    if (!url.includes("openrouter")) return inner(url, init);
    const json = (v, status = 200) => new Response(JSON.stringify(v), { status, headers: { "content-type": "application/json", "x-generation-id": `gen-${usage}` } });
    if (url.endsWith("/credits")) return json({ data: { total_credits: 100, total_usage: usage } });
    if (url.includes("/endpoints")) return json({ data: { endpoints: [{ tag: "deepinfra/fp8", pricing: { prompt: "0.0000013", completion: "0.0000026" } }] } });
    const body = JSON.parse(init.body);
    const r = await inner("https://scripted/v1/chat/completions", { ...init, body: JSON.stringify({ ...body, model: `openrouter/${body.model.split("/")[1]}` }) });
    const v = await r.json();
    usage += 0.001;
    return json({ ...v, model: body.model, provider: "DeepInfra", usage: { ...v.usage, cost: 0.001 } }, r.status);
  };
}
