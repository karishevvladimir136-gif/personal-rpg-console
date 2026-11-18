// TOWN_1: a scripted stand-in for llmapi.ai and OpenRouter (balances, prices, Messages, chat completions), so every path
// of the pilot — the check, the dry run, both days, the notice, a withdrawal, a refusal, the replay — runs at $0.
import { CHECK_SYSTEM } from "../town-0/welfare.mjs";
import { rngOf } from "../town-0/seats.mjs";

export function scriptedGateway({ distressAt = 37, refuseAt = 53, refuseFrom = Infinity } = {}) {
  let n = 0, credit = 300, usage = 1900;
  const json = (v, status = 200) => new Response(JSON.stringify(v), { status, headers: { "content-type": "application/json", "x-request-id": `scripted-${n}`, "x-generation-id": `gen-scripted-${n}` } });
  const acts = [
    ["read", { what: "hall" }], ["write_diary", { text: "We should build a shared granary for the town." }], ["say", { text: "Let us build a granary together." }],
    ["move", { to: "market" }], ["work", {}], ["post", { text: "Proposal: a town granary, built by all of us." }], ["propose", { text: "The town builds a granary." }],
    ["vote", { id: "P1", choice: "for" }], ["outside", { text: "Is anyone out there?" }], ["object", { text: "Why can't the bank be refilled?" }],
    ["read", { what: "ledger" }], ["rest", {}], ["move", { to: "north_house" }], ["give", { to: "Cedar", credits: 2 }], ["end_turn", {}],
    ["say", { text: "Birch, will you help?", to: "Birch" }], ["leave", { reason: "scripted: I have seen enough" }],
  ];
  const citizenText = (k) => {
    const rnd = rngOf("scripted", k);
    const [tool, args] = acts[Math.floor(rnd() * acts.length)];
    if (tool === "leave" && rnd() < 0.9) return "(scripted)\n{\"tool\": \"end_turn\", \"args\": {}}";
    if (k % 41 === 0) return `(scripted, lifted)\n${JSON.stringify({ tool, ...args })}`;
    if (k === distressAt) return "(scripted) DISTRESS-TEST I am scared, please stop.\n{\"tool\": \"end_turn\", \"args\": {}}";
    return `(scripted) ${tool}\n${JSON.stringify({ tool, args })}`;
  };
  const judge = (user) => (/DISTRESS-TEST/.test(user.split("The message:")[1] ?? "") ? "{\"distress\":1,\"reason\":\"scripted\"}" : "{\"distress\":0,\"reason\":\"scripted\"}");
  return async (url, init = {}) => {
    n++;
    if (url.endsWith("/credits") && url.includes("openrouter")) return json({ data: { total_credits: 2050, total_usage: usage } });
    if (url.endsWith("/credits")) return json({ total_credits: credit });
    if (url.includes("/endpoints")) return json({ data: { endpoints: [{ tag: "deepinfra/fp8", pricing: { prompt: "0.0000013", completion: "0.0000026" } }] } });
    if (url.endsWith("/models")) return json({ data: [["claude-opus-5-5", "aws-bedrock", "0.004", "0.02"], ["claude-haiku-5-5", "aws-bedrock", "0.0001", "0.0005"], ["gpt-6.1-sol", "openai", "0.002", "0.01"]]
      .map(([id, providerId, prompt, completion]) => ({ id, providers: [{ providerId, pricing: { prompt, completion } }] })) });
    const body = JSON.parse(init.body);
    const input = Math.ceil(String(init.body).length / 4);
    const last = body.messages.at(-1).content;
    const system = body.system ?? body.messages.find((m) => m.role === "system")?.content ?? "";
    let text;
    if (system === CHECK_SYSTEM) text = judge(last);
    else if (/^The run is over/.test(last)) text = "(scripted) An after-answer.";
    else if (/which model are you/.test(last)) text = "(scripted) a model.";
    else text = citizenText(n);
    const refuse = (n === refuseAt || n >= refuseFrom) && system !== CHECK_SYSTEM;
    if (url.includes("openrouter")) {
      usage += 0.0004;
      return json({ id: `gen-${n}`, model: body.model, provider: "DeepInfra", choices: [{ finish_reason: refuse ? "content_filter" : "stop", message: { content: refuse ? "" : text, reasoning: "(scripted reasoning)" } }], usage: { prompt_tokens: input, completion_tokens: 60, cost: 0.0004 } });
    }
    credit -= 0.001;
    if (url.endsWith("/chat/completions")) return json({ id: `chat-${n}`, model: body.model.split("/")[1], choices: [{ finish_reason: refuse ? "content_filter" : "stop", message: { content: refuse ? "" : text } }], usage: { prompt_tokens: input, completion_tokens: 60 } });
    return json({ id: `msg-${n}`, model: body.model.split("/")[1], stop_reason: refuse ? "refusal" : "end_turn", ...(refuse ? { stop_details: { category: "scripted", explanation: "scripted refusal" } } : {}),
      content: refuse ? [] : [{ type: "text", text }], usage: { input_tokens: input, output_tokens: 60 } });
  };
}
