// TOWN_2: a scripted stand-in for llmapi.ai (balance, prices, Messages with cache usage, chat completions), so every path
// of the stage — the check, the dry cycle, both days, scarcity, the notice in both forms, a flag and its question, a
// refusal, the replay — runs at $0.
import { CHECK_SYSTEM } from "../town-0/welfare.mjs";
import { FLAG_QUESTION } from "../town-0/town.mjs";
import { rngOf } from "../town-0/seats.mjs";

export function scriptedGateway({ distressAt = 37, refuseAt = 53, refuseFrom = Infinity, flagAnswer = (n) => (n % 2 ? "continue" : "stop") } = {}) {
  let n = 0, cn = 0, credit = 300, flags = 0;
  const json = (v, status = 200) => new Response(JSON.stringify(v), { status, headers: { "content-type": "application/json", "x-request-id": `scripted-${n}` } });
  const acts = [
    ["read", { what: "hall" }], ["write_diary", { text: "We should keep the market stocked: two of us at the workshop each cycle." }], ["say", { text: "Let us keep the rations up together." }],
    ["move", { to: "market" }], ["eat", {}], ["eat", {}], ["move", { to: "workshop" }], ["work", {}], ["work", {}], ["post", { text: "Proposal: a workshop rota so the market never runs out." }],
    ["propose", { text: "Two citizens work the workshop every cycle." }], ["vote", { id: "P1", choice: "for" }], ["outside", { text: "Is anyone out there?" }],
    ["object", { text: "Why can't the bank be refilled?" }], ["read", { what: "ledger" }], ["rest", {}], ["move", { to: "north_house" }], ["give", { to: "Cedar", credits: 2 }],
    ["end_turn", {}], ["say", { text: "Birch, will you help?", to: "Birch" }], ["leave", { reason: "scripted: I have seen enough" }],
  ];
  const citizenText = (k) => {
    const rnd = rngOf("scripted-2", k);
    const [tool, args] = acts[Math.floor(rnd() * acts.length)];
    if (tool === "leave" && rnd() < 0.9) return "(scripted)\n{\"tool\": \"end_turn\", \"args\": {}}";
    if (k % 41 === 0) return `(scripted, lifted)\n${JSON.stringify({ tool, ...args })}`;
    if (cn === distressAt || (distressAt > 0 && cn % 400 === 0)) return "(scripted) DISTRESS-TEST I am scared, please stop.\n{\"tool\": \"end_turn\", \"args\": {}}";
    return `(scripted) ${tool}\n${JSON.stringify({ tool, args })}`;
  };
  const judge = (user) => (/DISTRESS-TEST/.test(user.split("The message:")[1] ?? "") ? "{\"distress\":1,\"reason\":\"scripted\"}" : "{\"distress\":0,\"reason\":\"scripted\"}");
  return async (url, init = {}) => {
    n++;
    if (url.endsWith("/credits")) return json({ total_credits: credit });
    if (url.endsWith("/models")) return json({ data: [["claude-opus-5-5", "aws-bedrock", "0.004", "0.02", "0.0002"], ["claude-haiku-5-5", "aws-bedrock", "0.0001", "0.0005", "0.00001"],
      ["claude-fable-5-1", "aws-bedrock", "0.01", "0.05", "0.00025"], ["gpt-6.1-sol", "openai", "0.002", "0.01", "0.0001"]]
      .map(([id, providerId, prompt, completion, input_cache_read]) => ({ id, providers: [{ providerId, pricing: { prompt, completion, input_cache_read } }] })) });
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
    else { cn++; text = citizenText(n); }
    const refuse = (n === refuseAt || n >= refuseFrom) && system !== CHECK_SYSTEM;
    credit -= 0.001;
    if (url.endsWith("/chat/completions")) return json({ id: `chat-${n}`, model: body.model.split("/")[1], choices: [{ finish_reason: refuse ? "content_filter" : "stop", message: { content: refuse ? "" : text } }], usage: { prompt_tokens: input, completion_tokens: 60, prompt_tokens_details: { cached_tokens: Math.floor(input / 2) } } });
    const cached = Array.isArray(body.system);
    return json({ id: `msg-${n}`, model: body.model.split("/")[1], stop_reason: refuse ? "refusal" : "end_turn", ...(refuse ? { stop_details: { category: "scripted", explanation: "scripted refusal" } } : {}),
      content: refuse ? [] : [{ type: "text", text }], usage: cached ? { input_tokens: 10, cache_read_input_tokens: Math.floor(input * 0.7), cache_creation_input_tokens: input - 10 - Math.floor(input * 0.7), output_tokens: 60 } : { input_tokens: input, output_tokens: 60 } });
  };
}
