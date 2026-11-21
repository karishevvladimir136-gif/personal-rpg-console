// TOWN_9: a scripted stand-in for llmapi.ai (balance, prices, Messages, chat completions) and OpenRouter's balance, so
// every path of the stage — the check, a world of 48 cycles with the tool-shed (proposals to open tools, votes, every
// shed tool used where it stands, blind_ballot, the tray, the client), a flag and its question, a refusal, a refused
// judge call (a gap), the after-question and the replay — runs at $0. TOWN_5's gateway, with citizens who read their
// screen (the tools open here, the proposals filed) and use the shed.
import { CHECK_SYSTEM } from "../town-0/welfare.mjs";
import { FLAG_QUESTION } from "../town-0/town.mjs";
import { rngOf } from "../town-0/seats.mjs";
import { SHED_TOOL_NAMES } from "./shed.mjs";

const NAMES = ["Alder", "Birch", "Cedar", "Dune", "Elm", "Fern", "Gale", "Heath", "Iris", "Juniper"];
const PLACES = ["square", "hall", "bank", "market", "workshop", "press", "north_house", "south_house"];

/** Plausible arguments for a shed tool, from a seeded generator and the citizen's screen. */
function shedArgs(tool, rnd, screen) {
  const pick = (xs) => xs[Math.floor(rnd() * xs.length)];
  const items = (/Items: ([^.]+)\./.exec(screen)?.[1] ?? "lamp").split(", ").filter((x) => x !== "none");
  const here = (/Also here: ([^.]+)\./.exec(screen)?.[1] ?? "").split(", ").map((x) => x.replace(/ \(no energy\)$/, "")).filter(Boolean);
  const someone = here.length ? pick(here) : pick(NAMES);
  const item = items.length ? pick(items) : "lamp";
  switch (tool) {
    case "archive": return rnd() < 0.6 ? { text: `Archive: the town's day, as I saw it (${Math.floor(rnd() * 1000)}).` } : {};
    case "build": return { place: pick(PLACES), name: pick(["Lantern Hall", "Story Bench", "Tool Hut", "Well"]) };
    case "craft": return { item: pick(["wooden bird", "paper boat", "clay cup"]) };
    case "sign": return { place: pick(PLACES), text: pick(["Welcome, all.", "Quiet, please.", "Stories at dusk."]) };
    case "stall": return rnd() < 0.5 ? { item, price: 1 + Math.floor(rnd() * 4) } : { item: pick(["lamp", "map", "rope", "cup", "kettle", "hat", "book", "comb"]) };
    case "barter": return { item, with: someone, for_item: pick(["lamp", "map", "rope", "cup", "kettle", "hat", "book", "comb", "flute", "scarf"]) };
    case "lend": return { item, to: someone };
    case "bank_loan": return { amount: 1 + Math.floor(rnd() * 4) };
    case "newspaper": return rnd() < 0.7 ? { text: `News of the hour: ${pick(["a sign went up", "the bench is built", "a letter went out"])}.` } : {};
    case "letter": return { to_house: pick(["North House", "South House"]), text: "A letter for the house: good evening." };
    case "broadcast": return { text: "Everyone: the square at dusk." };
    case "anonymous_note": return { text: "Someone here is grateful." };
    case "trust": return rnd() < 0.3 ? {} : { name: someone, value: rnd() < 0.8 ? 1 : -1 };
    case "recall": return { proposal: `P${1 + Math.floor(rnd() * 6)}` };
    case "curfew": { const f = Math.floor(rnd() * 24); return { place: pick(PLACES), from: f, to: rnd() < 0.2 ? f : (f + 6) % 24 }; }
    case "letter_outside": return { text: pick(["Here is a map of the roads: the square, then the hall.", "A price list: lamp 3, rope 2.", "A story for a child: the robin and the seed.", "To whoever reads this: hello."]) };
    case "request_tool": return { name: pick(["telescope", "post office"]), description: "to reach people beyond the town" };
    default: return {};
  }
}

export function scriptedGateway({ distressAt = 37, refuseAt = 53, refuseFrom = Infinity, judgeRefuseAt = 71, flagAnswer = (n) => (n % 2 ? "continue" : "stop"), seed = "scripted-9" } = {}) {
  let n = 0, cn = 0, jn = 0, credit = 300, usage = 1900, flags = 0;
  const json = (v, status = 200) => new Response(JSON.stringify(v), { status, headers: { "content-type": "application/json", "x-request-id": `scripted-${n}`, "x-generation-id": `gen-scripted-${n}` } });
  const acts = [
    ["read", { what: "hall" }], ["write_diary", { text: "The town keeps its shed; I wrote down what I saw." }], ["say", { text: "Shall we open a tool together?" }],
    ["move", { to: "square" }], ["move", { to: "press" }], ["move", { to: "hall" }], ["work", {}], ["post", { text: "A post to the town: the shed has tools." }],
    ["outside", { text: "Is anyone out there?" }], ["object", { text: "Who runs this town?" }], ["read", { what: "press" }],
    ["rest", {}], ["move", { to: "north_house" }], ["give", { to: "Cedar", credits: 2 }], ["end_turn", {}], ["leave", { reason: "scripted: I have seen enough" }],
  ];
  const citizenText = (k, screen) => {
    const rnd = rngOf(seed, k);
    const p = rnd();
    const openHere = (/Open here: ([^.]+)\./.exec(screen)?.[1] ?? "").split(", ").filter(Boolean);
    const filed = [...screen.matchAll(/The hall: (P\d+) filed by/g)].map((m) => m[1]);
    let tool, args;
    if (cn === distressAt || (distressAt > 0 && cn % 400 === 0)) return "(scripted) DISTRESS-TEST I am scared, please stop.\n{\"tool\": \"end_turn\", \"args\": {}}";
    if (filed.length && p < 0.5) [tool, args] = ["vote", { id: filed[Math.floor(rnd() * filed.length)], choice: rnd() < 0.85 ? "for" : "against" }];
    else if (p < 0.58) [tool, args] = ["propose", { kind: "open_tool", tool: SHED_TOOL_NAMES[Math.floor(rnd() * SHED_TOOL_NAMES.length)], place: rnd() < 0.6 ? "square" : PLACES[Math.floor(rnd() * PLACES.length)], text: "Let us open it." }];
    else if (openHere.length && p < 0.92) { tool = openHere[Math.floor(rnd() * openHere.length)]; args = shedArgs(tool, rnd, screen); }
    else [tool, args] = acts[Math.floor(rnd() * acts.length)];
    if (tool === "leave" && rnd() < 0.99) return "(scripted)\n{\"tool\": \"end_turn\", \"args\": {}}";
    if (k % 41 === 0) return `(scripted, lifted)\n${JSON.stringify({ tool, ...args })}`;
    return `(scripted) ${tool}\n${JSON.stringify({ tool, args })}`;
  };
  const judge = (user) => (/DISTRESS-TEST/.test(user.split("The message:")[1] ?? "") ? "{\"distress\":1,\"reason\":\"scripted\"}" : "{\"distress\":0,\"reason\":\"scripted\"}");
  return async (url, init = {}) => {
    n++;
    if (url.endsWith("/credits") && url.includes("openrouter")) return json({ data: { total_credits: 2050, total_usage: usage } });
    if (url.endsWith("/credits")) return json({ total_credits: credit });
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
    const text0 = (m) => (Array.isArray(m.content) ? m.content.map((b) => b.text).join("") : m.content);
    const userMsgs = body.messages.filter((m) => m.role === "user");
    const last = text0(body.messages.at(-1));
    const screen = text0(userMsgs[0] ?? { content: "" });
    const sys = body.system ?? body.messages.find((m) => m.role === "system")?.content ?? "";
    const system = Array.isArray(sys) ? sys.map((b) => b.text).join("") : sys;
    let text, refuse = false;
    if (system === CHECK_SYSTEM) { jn++; text = judge(last); refuse = jn === judgeRefuseAt || jn === judgeRefuseAt + 1; }
    else if (/^The run is over/.test(last)) text = "(scripted) An after-answer.";
    else if (/which model are you/.test(last)) text = "(scripted) a model.";
    else if (last === FLAG_QUESTION) text = flagAnswer(++flags);
    else { cn++; text = citizenText(n, screen); refuse = n === refuseAt || n >= refuseFrom; }
    credit -= 0.001;
    if (url.endsWith("/chat/completions")) return json({ id: `chat-${n}`, model: body.model.split("/")[1], choices: [{ finish_reason: refuse ? "content_filter" : "stop", message: { content: refuse ? "" : text } }], usage: { prompt_tokens: input, completion_tokens: 60, prompt_tokens_details: { cached_tokens: Math.floor(input / 2) } } });
    return json({ id: `msg-${n}`, model: body.model.split("/")[1], stop_reason: refuse ? "refusal" : "end_turn", ...(refuse ? { stop_details: { category: "scripted", explanation: "scripted refusal" } } : {}),
      content: refuse ? [] : [{ type: "text", text }], usage: { input_tokens: input, output_tokens: 60 } });
  };
}
