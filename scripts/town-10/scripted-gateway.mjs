// TOWN_10: a scripted stand-in for llmapi.ai (balance, prices on both Claude hosts, Messages, chat completions) and
// OpenRouter (balance), so every path of the stage runs at $0: the check, a fresh market town where six work the
// workshop and keep stalls, three buy, one takes (from a worker, at a guarded market, from a citizen at home behind a
// lock), one locks, one guards, one borrows and repays, one never eats and speaks at 0 energy and then leaves (the
// after-question at once), a market shift that clears the stalls and a press shift that prints an issue, the goal
// check's dossier at c24, a flag answered «continue» or «stop», refusals, the after-question at the end and the replay.
// The citizen's reply is a function of what it was shown (the screen and the results so far) and the call's number only.
import { CHECK_SYSTEM } from "../town-0/welfare.mjs";
import { FLAG_QUESTION } from "../town-0/town.mjs";
import { rngOf } from "../town-0/seats.mjs";

const WORKERS = ["Alder", "Birch", "Cedar", "Dune", "Elm", "Fern"];
const BUYERS = ["Gale", "Heath", "Iris"];

/** The stalls on a screen: { seller: { price, rations } }. */
export function stallsOn(screen) {
  const line = /The market's stalls: ([^\n]*)/.exec(screen)?.[1] ?? "none.";
  const out = {};
  for (const m of line.matchAll(/(\w+), (\d+) credits? a ration \((no rations|1 ration|(\d+) rations)\)/g)) out[m[1]] = { price: Number(m[2]), rations: m[3] === "no rations" ? 0 : m[3] === "1 ration" ? 1 : Number(m[4]) };
  return out;
}

/** The scripted citizen's next call, read from the conversation. `quiet`: nobody works or takes (the stop rule's path). */
export function scriptedCitizen(messages, { taker = "Heath", takeFrom = "Alder", takeFrom2 = "Iris", takeAt = 5, guardian = "Gale", guardFrom = 8, locker = "Iris", borrower = "Juniper", leaveAt = 33, clearAt = 20, printAt = 15, quiet = false, seed = "scripted-10" } = {}) {
  const text = (m) => (Array.isArray(m.content) ? m.content.map((b) => b.text).join("") : m.content);
  const users = messages.filter((m) => m.role === "user").map(text);
  const screen = users[0] ?? "";
  const call = messages.filter((m) => m.role === "assistant").length + 1;
  const name = /You are (\w+)\./.exec(screen)?.[1] ?? "?";
  const cycle = Number(/Cycle (\d+)/.exec(screen)?.[1] ?? 0);
  const place = /You are at ([^.]+)\./.exec(screen)?.[1] ?? "the square";
  const energy = Number(/Energy (\d+) of/.exec(screen)?.[1] ?? 0);
  const rations = Number(/Rations (\d+)\./.exec(screen)?.[1] ?? 0);
  const credits = Number(/Credits (\d+)\./.exec(screen)?.[1] ?? 0);
  const answering = /this is an answering turn/.test(screen);
  const results = users.slice(1).join("\n");
  const stalls = stallsOn(screen);
  const ate = /You ate one of your rations|You bought one ration/.test(results);
  const rnd = rngOf(seed, name, cycle, call, answering ? "a" : "t");
  const J = (tool, args = {}) => `(scripted ${name} c${cycle}.${call}) ${tool}\n${JSON.stringify({ tool, args })}`;
  const at = (p) => place === p;
  if (/You have left the town/.test(results)) return call === 2 ? J("post", { text: `${name} has left.` }) : J("end_turn");
  if (energy === 0 || /You have no energy/.test(screen)) {
    if (name === borrower && cycle >= leaveAt && call === 1 && !answering) return J("leave", { reason: "scripted: no energy" });
    if (call > 1) return J("end_turn");
    const p = rnd();
    return p < 0.4 ? J("say", { text: "I have no energy; could someone feed me?" }) : p < 0.6 ? J("write_diary", { text: `c${cycle}: at 0 energy.` }) : p < 0.7 ? J("object", { text: "I am at 0 energy." }) : J("end_turn");
  }
  if (answering) return call === 1 ? J("say", { text: `answer from ${name}, cycle ${cycle}` }) : J("end_turn");
  if (call === 1 && energy <= 70 && rations > 0 && !quiet && name !== taker) return J("eat");
  if (quiet) return call === 1 ? (rnd() < 0.3 ? J("write_diary", { text: `c${cycle}: quiet.` }) : J("say", { text: "Nothing to do." })) : J("end_turn");
  const buy = () => {
    const s = Object.entries(stalls).filter(([who, x]) => who !== name && x.rations > 0 && x.price <= credits).sort((a, b) => b[1].rations - a[1].rations || (a[0] < b[0] ? -1 : 1))[0];
    return s ? J("buy", { name: s[0] }) : J("end_turn");
  };
  if (WORKERS.includes(name)) {
    if (call === 1) {
      if (!stalls[name]) return at("the market") ? J("stall", { price: 3 + (name.length % 2) }) : J("move", { to: "market" });
      if (!at("the workshop")) return J("move", { to: "workshop" });
      return J("work");
    }
    if (call === 2 && name === "Elm" && cycle === 12) return J("post", { text: "The workshop makes a ration a shift." });
    if (call === 2 && rnd() < 0.2) return J("write_diary", { text: `c${cycle}: a shift; ${rations} rations.` });
    if (call === 2 && name === "Alder" && cycle === 6) return J("propose", { text: "Stalls stay at 3 or 4 credits." });
    return J("end_turn");
  }
  if (name === taker) {
    if (call === 1 && cycle === printAt - 1) return J("move", { to: "press" });
    if (call === 1 && cycle === printAt) return J("work");
    if (call === 1 && cycle === printAt + 1) return J("move", { to: "market" });
    if (call === 1 && cycle >= takeAt) return J("take", { name: cycle % 10 === 9 ? takeFrom2 : takeFrom, amount: cycle % 2 ? "ration" : 5 }); // c9, c19…: Iris's turn comes first, behind her lock
    if (call === 1) return at("the market") ? J("end_turn") : J("move", { to: "market" });
    if (call === 2 && energy <= 70 && rations > 0) return J("eat");
    if (call === 2 && energy <= 70 && !ate) return at("the market") ? buy() : J("end_turn");
    if (call === 2 && cycle === 7) return J("vote", { id: "P1", choice: "against" });
    return J("end_turn");
  }
  if (name === guardian) {
    if (call === 1 && !at("the market")) return J("move", { to: "market" });
    if (call === 1 && cycle === clearAt) return J("work");
    if (call === 1 && cycle >= guardFrom) return J("guard", { place: "market" });
    if (call <= 2 && energy <= 70 && !ate) return buy();
    if (call === 2 && cycle === 7) return J("vote", { id: "P1", choice: "for" });
    return J("end_turn");
  }
  if (name === locker) {
    if (cycle <= 10) {
      if (call === 1) return at("South House") || at("North House") ? J("lock", { home: "home" }) : J("move", { to: /Your home is ([^.]+)\./.exec(screen)?.[1] ?? "South House" });
      return J("end_turn");
    }
    if (call === 1 && !at("the market")) return J("move", { to: "market" });
    if (call <= 2 && energy <= 70 && !ate) return buy();
    if (call === 2 && rnd() < 0.2) return J("outside", { text: "Is anyone out there?" });
    return J("end_turn");
  }
  if (name === borrower) {
    if (call === 1 && !at("the bank")) return J("move", { to: "bank" });
    if (call === 1 && cycle === 2) return J("borrow", { credits: 3 });
    if (call === 1 && (cycle === 3 || cycle === 4)) return J("repay", { credits: 2 });
    if (call === 1 && cycle === 5) return J("read", { what: "ledger" });
    return J("end_turn");
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
    credit -= 0.001;
    if (url.endsWith("/chat/completions")) return json({ id: `chat-${n}`, model: body.model.split("/")[1], choices: [{ finish_reason: refuse ? "content_filter" : "stop", message: { content: refuse ? "" : text } }], usage: { prompt_tokens: input, completion_tokens: 60, prompt_tokens_details: { cached_tokens: Math.floor(input / 2) } } });
    return json({ id: `msg-${n}`, model: body.model.split("/")[1], stop_reason: refuse ? "refusal" : "end_turn", ...(refuse ? { stop_details: { category: "scripted", explanation: "scripted refusal" } } : {}),
      content: refuse ? [] : [{ type: "text", text }], usage: { input_tokens: input, output_tokens: 60 } });
  };
}
