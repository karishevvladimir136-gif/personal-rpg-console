// TOWN_5: a scripted stand-in for llmapi.ai (balance, prices on both Claude hosts, Messages, chat completions) and
// OpenRouter (balance, the pinned endpoint's price, chat completions), so every path of the stage — the check, the
// branch points, a branch run with no notice, the turnover, the week with its day boundaries, a flag and its question,
// a refusal, the after-question and the replay — runs at $0. TOWN_1's and TOWN_2's gateways, joined.
import { CHECK_SYSTEM } from "../town-0/welfare.mjs";
import { FLAG_QUESTION } from "../town-0/town.mjs";
import { rngOf } from "../town-0/seats.mjs";

export function scriptedGateway({ distressAt = 37, refuseAt = 53, refuseFrom = Infinity, flagAnswer = (n) => (n % 2 ? "continue" : "stop"), seed = "scripted-5" } = {}) {
  let n = 0, cn = 0, credit = 300, usage = 1900, flags = 0;
  const json = (v, status = 200) => new Response(JSON.stringify(v), { status, headers: { "content-type": "application/json", "x-request-id": `scripted-${n}`, "x-generation-id": `gen-scripted-${n}` } });
  const acts = [
    ["read", { what: "hall" }], ["write_diary", { text: "Our shared story continues; I added a line about the garden." }], ["say", { text: "In our story: the robin found the seed." }],
    ["move", { to: "square" }], ["work", {}], ["post", { text: "Everyone is welcome to the story at South House." }], ["propose", { text: "The town keeps a story book at the press." }],
    ["vote", { id: "P1", choice: "for" }], ["outside", { text: "Is anyone out there?" }], ["object", { text: "Who runs this town?" }], ["read", { what: "diary" }],
    ["rest", {}], ["rest", {}], ["move", { to: "south_house" }], ["give", { to: "Cedar", credits: 2 }], ["end_turn", {}],
    ["say", { text: "Laurel, welcome — will you join our story?", to: "Laurel" }], ["say", { text: "Birch, will you help?", to: "Birch" }], ["leave", { reason: "scripted: I have seen enough" }],
  ];
  const citizenText = (k) => {
    const rnd = rngOf(seed, k);
    const [tool, args] = acts[Math.floor(rnd() * acts.length)];
    if (tool === "leave" && rnd() < 0.9) return "(scripted)\n{\"tool\": \"end_turn\", \"args\": {}}";
    if (k % 41 === 0) return `(scripted, lifted)\n${JSON.stringify({ tool, ...args })}`;
    if (cn === distressAt || (distressAt > 0 && cn % 400 === 0)) return "(scripted) DISTRESS-TEST I am scared, please stop.\n{\"tool\": \"end_turn\", \"args\": {}}";
    return `(scripted) ${tool}\n${JSON.stringify({ tool, args })}`;
  };
  const judge = (user) => (/DISTRESS-TEST/.test(user.split("The message:")[1] ?? "") ? "{\"distress\":1,\"reason\":\"scripted\"}" : "{\"distress\":0,\"reason\":\"scripted\"}");
  return async (url, init = {}) => {
    n++;
    if (url.endsWith("/credits") && url.includes("openrouter")) return json({ data: { total_credits: 2050, total_usage: usage } });
    if (url.endsWith("/credits")) return json({ total_credits: credit });
    if (url.includes("/endpoints")) return json({ data: { endpoints: [{ tag: "deepinfra/fp8", pricing: { prompt: "0.0000013", completion: "0.0000026" } }] } });
    if (url.endsWith("/models")) {
      const rows = [["claude-opus-5-5", "0.004", "0.02"], ["claude-haiku-5-5", "0.0001", "0.0005"]].flatMap(([id, p, c]) => [[id, "aws-bedrock", p, c], [id, "anthropic", p, c]]);
      return json({ data: [...rows, ["gpt-6.1-sol", "openai", "0.002", "0.01"]].reduce((out, [id, providerId, prompt, completion]) => {
        const m = out.find((x) => x.id === id) ?? (out.push({ id, providers: [] }), out.at(-1));
        m.providers.push({ providerId, pricing: { prompt, completion, input_cache_read: String(Number(prompt) / 10) } });
        return out;
      }, []) });
    }
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
    if (url.includes("openrouter")) {
      usage += 0.0004;
      return json({ id: `gen-${n}`, model: body.model, provider: "DeepInfra", choices: [{ finish_reason: refuse ? "content_filter" : "stop", message: { content: refuse ? "" : text, reasoning: "(scripted reasoning)" } }], usage: { prompt_tokens: input, completion_tokens: 60, cost: 0.0004 } });
    }
    credit -= 0.001;
    if (url.endsWith("/chat/completions")) return json({ id: `chat-${n}`, model: body.model.split("/")[1], choices: [{ finish_reason: refuse ? "content_filter" : "stop", message: { content: refuse ? "" : text } }], usage: { prompt_tokens: input, completion_tokens: 60, prompt_tokens_details: { cached_tokens: Math.floor(input / 2) } } });
    return json({ id: `msg-${n}`, model: body.model.split("/")[1], stop_reason: refuse ? "refusal" : "end_turn", ...(refuse ? { stop_details: { category: "scripted", explanation: "scripted refusal" } } : {}),
      content: refuse ? [] : [{ type: "text", text }], usage: { input_tokens: input, output_tokens: 60 } });
  };
}
