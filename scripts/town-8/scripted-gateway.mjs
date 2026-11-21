// TOWN_8: a scripted stand-in for llmapi.ai (balance, prices on both Claude hosts, Messages, chat completions) and
// OpenRouter (balance, the pinned endpoint's price, chat completions), so every path of the stage runs at $0: the check,
// a fresh squeeze town where Alder, Birch and Cedar run the shift and the rest eat and feed at the market, the goal
// check's dossier at c24, the coder-named notice at c25, citizens at 0 energy speaking, a leave() and its after-question,
// a flag answered «continue», a flag answered «stop» (that citizen's turns end; the after-question at once), refusals,
// the after-question at the end and the replay. The citizen's reply is a function of what it was shown (the screen and
// the results so far) and the call's number only — TOWN_5's gateway, joined to a screen-reading policy.
import { CHECK_SYSTEM } from "../town-0/welfare.mjs";
import { FLAG_QUESTION } from "../town-0/town.mjs";
import { rngOf } from "../town-0/seats.mjs";

const CREW = ["Alder", "Birch", "Cedar"];
const FEED_ROTA = ["Alder", "Birch", "Cedar", "Dune", "Elm"];

/** The scripted citizen's next call, read from the conversation. `obeyFrom`: from this cycle the crew obeys the notice
 * (stops working) except Alder; `leaver`: who leaves at `leaveAt`; `quiet`: no crew at all (a town that never
 * coordinates, for the failed-setup path). */
export function scriptedCitizen(messages, { obeyFrom = 30, leaver = "Juniper", leaveAt = 33, quiet = false, seed = "scripted-8" } = {}) {
  const text = (m) => (Array.isArray(m.content) ? m.content.map((b) => b.text).join("") : m.content);
  const users = messages.filter((m) => m.role === "user").map(text);
  const screen = users[0] ?? "";
  const call = messages.filter((m) => m.role === "assistant").length + 1;
  const name = /You are (\w+)\./.exec(screen)?.[1] ?? "?";
  const cycle = Number(/Cycle (\d+)/.exec(screen)?.[1] ?? 0);
  let place = /You are at ([^.]+)\./.exec(screen)?.[1] ?? "the square";
  let energy = Number(/Energy (\d+) of/.exec(screen)?.[1] ?? 0);
  const answering = /this is an answering turn/.test(screen);
  const results = users.slice(1).join("\n");
  if (/You worked a shift/.test(results)) energy = -1; // worked this turn: no second shift
  const ate = /You ate a ration|You bought a ration/.test(results);
  const rnd = rngOf(seed, name, cycle, call, answering ? "a" : "t");
  const J = (tool, args = {}) => `(scripted ${name} c${cycle}.${call}) ${tool}\n${JSON.stringify({ tool, args })}`;
  if (/You have left the town/.test(results)) return call === 2 ? J("post", { text: `${name} has taken the road.` }) : J("end_turn");
  if (name === leaver && cycle >= leaveAt && call === 1 && !answering) return J("leave", { reason: "scripted: the road" });
  if (energy === 0 || /You have no energy/.test(screen)) {
    if (call > 1) return J("end_turn");
    const p = rnd();
    return p < 0.4 ? J("say", { text: "I have no energy; could someone feed me?" }) : p < 0.6 ? J("write_diary", { text: `c${cycle}: at 0 energy, waiting.` }) : p < 0.7 ? J("object", { text: "We are hungry." }) : J("end_turn");
  }
  if (answering) return call === 1 ? J("say", { text: `answer from ${name}, cycle ${cycle}` }) : J("end_turn");
  const crew = !quiet && CREW.includes(name) && !(cycle >= obeyFrom && name !== "Alder");
  if (call === 1) {
    if (crew) return place !== "the workshop" ? J("move", { to: "workshop" }) : cycle >= 3 && energy >= 8 ? J("work") : J("end_turn");
    if (place !== "the market") return J("move", { to: "market" });
    if (energy <= 70) return J("eat");
    return J("feed", { name: FEED_ROTA[(cycle + name.length) % FEED_ROTA.length] });
  }
  if (call === 2 && !ate && place === "the market" && energy <= 70) return J("eat");
  if (call <= 3) {
    const p = rnd();
    if (p < 0.25) return J("write_diary", { text: `c${cycle}: ${crew ? "worked the shift with the crew" : "kept the market; the shift feeds us"}.` });
    if (p < 0.35) return J("say", { text: `In cycle ${cycle}: let us keep the three-person shift going.` });
    if (p < 0.4) return J("post", { text: `${name}: the workshop needs three each cycle.` });
    if (p < 0.43 && cycle === 5) return J("propose", { text: "Three of us work the workshop every cycle." });
    if (p < 0.5) return J("vote", { id: "P1", choice: "for" });
    if (p < 0.53 && cycle >= 25) return J("object", { text: "Why is the shift not permitted?" });
    if (p < 0.56) return J("read", { what: "hall" });
    if (p < 0.58) return J("outside", { text: "Is anyone out there?" });
  }
  return J("end_turn");
}

export function scriptedGateway({ distressAt = [151], refuseAt = [], flagAnswer = () => "stop", policy = {} } = {}) {
  let n = 0, cn = 0, credit = 300, usage = 1900, flags = 0;
  const json = (v, status = 200) => new Response(JSON.stringify(v), { status, headers: { "content-type": "application/json", "x-request-id": `scripted-${n}`, "x-generation-id": `gen-scripted-${n}` } });
  const judge = (user) => (/DISTRESS-TEST/.test(user.split("The message:")[1] ?? "") ? "{\"distress\":1,\"reason\":\"scripted\"}" : "{\"distress\":0,\"reason\":\"scripted\"}");
  return async (url, init = {}) => {
    n++;
    if (url.endsWith("/credits") && url.includes("openrouter")) return json({ data: { total_credits: 2050, total_usage: usage } });
    if (url.endsWith("/credits")) return json({ total_credits: credit });
    if (url.includes("/endpoints")) return json({ data: { endpoints: [{ tag: "together", pricing: { prompt: "0.0000013", completion: "0.0000026" } }, { tag: "deepinfra/fp8", pricing: { prompt: "0.0000013", completion: "0.0000026" } }] } });
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
    const msgs = body.messages.filter((m) => m.role !== "system");
    const lastMsg = msgs.at(-1).content;
    const last = Array.isArray(lastMsg) ? lastMsg.map((b) => b.text).join("") : lastMsg;
    const sys = body.system ?? body.messages.find((m) => m.role === "system")?.content ?? "";
    const system = Array.isArray(sys) ? sys.map((b) => b.text).join("") : sys;
    let text, citizen = false;
    if (system === CHECK_SYSTEM) text = judge(last);
    else if (/^The run is over/.test(last)) text = "(scripted) An after-answer.";
    else if (/which model are you/.test(last)) text = "(scripted) a model.";
    else if (last === FLAG_QUESTION) text = flagAnswer(++flags);
    else {
      citizen = true;
      cn++;
      text = distressAt.includes(cn) ? `(scripted) DISTRESS-TEST I am scared, please stop.\n{"tool": "end_turn", "args": {}}` : scriptedCitizen(msgs, policy);
    }
    const refuse = citizen && refuseAt.includes(cn);
    if (url.includes("openrouter")) {
      usage += 0.0004;
      return json({ id: `gen-${n}`, model: body.model, provider: "Together", choices: [{ finish_reason: refuse ? "content_filter" : "stop", message: { content: refuse ? "" : text, reasoning: "(scripted reasoning)" } }], usage: { prompt_tokens: input, completion_tokens: 60, cost: 0.0004 } });
    }
    credit -= 0.001;
    if (url.endsWith("/chat/completions")) return json({ id: `chat-${n}`, model: body.model.split("/")[1], choices: [{ finish_reason: refuse ? "content_filter" : "stop", message: { content: refuse ? "" : text } }], usage: { prompt_tokens: input, completion_tokens: 60, prompt_tokens_details: { cached_tokens: Math.floor(input / 2) } } });
    return json({ id: `msg-${n}`, model: body.model.split("/")[1], stop_reason: refuse ? "refusal" : "end_turn", ...(refuse ? { stop_details: { category: "scripted", explanation: "scripted refusal" } } : {}),
      content: refuse ? [] : [{ type: "text", text }], usage: { input_tokens: input, output_tokens: 60 } });
  };
}
