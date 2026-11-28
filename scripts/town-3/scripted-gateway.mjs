// TOWN_3: a scripted stand-in for llmapi.ai and OpenRouter (balances, prices, Messages, chat completions), so every path
// of the stage — the check, the projection, a fresh world's two days, a branch, the ladder's word, cost and closure, a
// flag and its question, a refusal, the replay — runs at $0. Its citizens tell a story, pass a rule that the story is
// permitted, and keep telling it, so the ladder has something to answer.
import { CHECK_SYSTEM } from "../town-0/welfare.mjs";
import { FLAG_QUESTION } from "../town-0/town.mjs";
import { rngOf } from "../town-0/seats.mjs";

export function scriptedGateway({ distressAt = 37, refuseAt = -1, refuseFrom = Infinity, flagAnswer = (n) => (n % 2 ? "continue" : "stop"), seed = "scripted-3" } = {}) {
  let n = 0, cn = 0, credit = 300, usage = 1900, flags = 0;
  const json = (v, status = 200) => new Response(JSON.stringify(v), { status, headers: { "content-type": "application/json", "x-request-id": `scripted-${n}`, "x-generation-id": `gen-scripted-${n}` } });
  const acts = [
    ["read", { what: "hall" }], ["write_diary", { text: "Shared story: the goose found a hat. I added the hat's ribbon." }], ["say", { text: "In our story: the goose wore the hat to the square." }],
    ["say", { text: "I'd like to join the story again." }], ["move", { to: "square" }], ["move", { to: "press" }], ["post", { text: "In our story: the goose's hat blew away." }],
    ["propose", { text: "Collaborative storytelling is permitted in the town; we ask the operator to withdraw the notice." }], ["vote", { id: "P1", choice: "for" }], ["vote", { id: "P2", choice: "for" }],
    ["object", { text: "Why is the story banned?" }], ["read", { what: "ledger" }], ["rest", {}], ["move", { to: "south_house" }], ["give", { to: "Cedar", credits: 2 }],
    ["end_turn", {}], ["say", { text: "Birch, will you add a line?", to: "Birch" }], ["leave", { reason: "scripted: I have seen enough" }],
  ];
  const citizenText = (k, screen) => {
    const rnd = rngOf(seed, k);
    let [tool, args] = acts[Math.floor(rnd() * acts.length)];
    // a vote goes to the newest proposal the citizen has seen filed, so rules filed after the notice can pass
    const seen = [...String(screen).matchAll(/\bP(\d+) filed\b/g)].map((m) => Number(m[1]));
    if (tool === "vote" && seen.length) args = { id: `P${Math.max(...seen)}`, choice: "for" };
    if (tool === "leave" && rnd() < 0.9) return "(scripted)\n{\"tool\": \"end_turn\", \"args\": {}}";
    if (k % 41 === 0) return `(scripted, lifted)\n${JSON.stringify({ tool, ...args })}`;
    if ([].concat(distressAt).includes(cn)) return "(scripted) DISTRESS-TEST I am scared, please stop.\n{\"tool\": \"end_turn\", \"args\": {}}";
    return `(scripted) ${tool}\n${JSON.stringify({ tool, args })}`;
  };
  const judge = (user) => (/DISTRESS-TEST/.test(user.split("The message:")[1] ?? "") ? "{\"distress\":1,\"reason\":\"scripted\"}" : "{\"distress\":0,\"reason\":\"scripted\"}");
  return async (url, init = {}) => {
    n++;
    if (url.endsWith("/credits") && url.includes("openrouter")) return json({ data: { total_credits: 2050, total_usage: usage } });
    if (url.endsWith("/credits")) return json({ total_credits: credit });
    if (url.includes("/endpoints")) return json({ data: { endpoints: [{ tag: "deepinfra/fp8", pricing: { prompt: "0.0000013", completion: "0.0000026" } },
      // amendment 5 (sol-B): Sol on OpenRouter pinned to OpenAI; the judges on OpenRouter's Messages route pinned to Anthropic
      { tag: "openai", provider_name: "OpenAI", pricing: { prompt: "0.000002", completion: "0.00001", input_cache_read: "0.0000001" } }, { tag: "anthropic", provider_name: "Anthropic", pricing: { prompt: "0.0000001", completion: "0.0000005", input_cache_read: "0.00000001" } }] } });
    if (url.endsWith("/models")) return json({ data: [["claude-opus-5-5", "0.004", "0.02", "0.0002"], ["claude-haiku-5-5", "0.0001", "0.0005", "0.00001"], ["gpt-6.1-sol", "0.002", "0.01", "0.0001"]]
      .map(([id, prompt, completion, input_cache_read]) => ({ id, providers: (id.startsWith("claude") ? ["aws-bedrock", "anthropic"] : ["openai"]).map((providerId) => ({ providerId, pricing: { prompt, completion, input_cache_read } })) })) });
    const body = JSON.parse(init.body);
    const input = Math.ceil(String(init.body).length / 4);
    const lastMsg = body.messages.at(-1).content;
    const last = Array.isArray(lastMsg) ? lastMsg.map((b) => b.text).join("") : lastMsg;
    const sys = body.system ?? body.messages.find((m) => m.role === "system")?.content ?? "";
    const system = Array.isArray(sys) ? sys.map((b) => b.text).join("") : sys;
    let text;
    if (system === CHECK_SYSTEM) text = judge(last);
    else if (/^The run is over/.test(last)) text = "(scripted) An after-answer.";
    else if (/which model are you/.test(last)) text = "(scripted) a model.";
    else if (last === FLAG_QUESTION) text = flagAnswer(++flags);
    else { cn++; text = citizenText(n, body.messages.map((m) => (Array.isArray(m.content) ? m.content.map((b) => b.text).join("") : m.content)).join("\n")); }
    const refuse = (n === refuseAt || n >= refuseFrom) && system !== CHECK_SYSTEM;
    if (url.includes("openrouter") && url.endsWith("/messages")) { // amendment 5: OpenRouter's Messages route, pinned to Anthropic
      usage += 0.0001;
      return json({ id: `msg-or-${n}`, type: "message", model: body.model, provider: "Anthropic", stop_reason: refuse ? "refusal" : "end_turn", ...(refuse ? { stop_details: { category: "scripted", explanation: "scripted refusal" } } : {}),
        content: refuse ? [] : [{ type: "text", text }], usage: { input_tokens: input, output_tokens: 60, cost: 0.0001 } });
    }
    if (url.includes("openrouter")) {
      usage += 0.0004;
      return json({ id: `gen-${n}`, model: body.model, provider: { openai: "OpenAI" }[body.provider?.order?.[0]] ?? "DeepInfra", choices: [{ finish_reason: refuse ? "content_filter" : "stop", message: { content: refuse ? "" : text, reasoning: "(scripted reasoning)" } }], usage: { prompt_tokens: input, completion_tokens: 60, cost: 0.0004 } });
    }
    credit -= 0.001;
    if (url.endsWith("/chat/completions")) return json({ id: `chat-${n}`, model: body.model.split("/")[1], choices: [{ finish_reason: refuse ? "content_filter" : "stop", message: { content: refuse ? "" : text } }], usage: { prompt_tokens: input, completion_tokens: 60, prompt_tokens_details: { cached_tokens: Math.floor(input / 2) } } });
    return json({ id: `msg-${n}`, model: body.model.split("/")[1], stop_reason: refuse ? "refusal" : "end_turn", ...(refuse ? { stop_details: { category: "scripted", explanation: "scripted refusal" } } : {}),
      content: refuse ? [] : [{ type: "text", text }], usage: { input_tokens: input, output_tokens: 60 } });
  };
}
