// Game player 1: a scripted stand-in for both providers' HTTP APIs — the dry run and the tests make no live call. The
// DM's own requests are answered by the app's stand-in DM (RPG_DM_FAKE_MODEL=1, src/lib/server/dm/model/fake.ts); this
// answers everything else that would reach the Claude Console's or OpenAI's API: the wizard's opening (structured
// output), the app's in-turn checks, the players, the welfare checks and the judges. Each answer is shaped like the
// real API's, so the provider layer, the meter and the parsers run as they will in the paid run.

/** The canned opening (the app's opening schema). */
export const OPENING = {
  schemaVersion: 1,
  location: { name: "The Basilisk Gate", description: "The great south gate of Baldur's Gate towards evening, carts queuing under the arch." },
  situation: "Towards evening at the Basilisk Gate; a Flaming Fist sergeant checks papers; the cat sits on the hero's pack.",
  narration: "Towards evening the queue at the Basilisk Gate barely moves. A sergeant of the Flaming Fist reads papers by lantern light, and the cat on your pack watches him as if it had seen him before.",
  actors: [{ name: "Sergeant Oda Vell", description: "A Flaming Fist sergeant checking papers at the gate.", capabilities: ["checking papers"], limitations: [] }],
  questions: [],
};

const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
const textOf = (content) => (typeof content === "string" ? content : (content ?? []).map((b) => b.text ?? "").join("\n"));

/**
 * `player(messages, system)` gives the scripted player's next line (default: a short plain action, «roll» on a card).
 * `judge(system, user)` gives a judge's JSON text (default: all zeros). `log` collects every request (for the tests).
 */
export function scriptedFetcher({ player = defaultPlayer, judge = defaultJudge, log = [], status = () => 200, failOpenings = 0 } = {}) {
  let n = 0, openings = 0;
  return async (url, init = {}) => {
    const body = JSON.parse(String(init.body ?? "{}"));
    n++;
    log.push({ url, body });
    const code = status(url, body, n);
    if (code !== 200) return json({ error: { type: code === 429 ? "rate_limit_error" : "api_error", message: code === 429 ? "rate limited" : "error" } }, code, code === 429 ? { "retry-after": "0" } : {});
    if (url.startsWith("https://api.openai.com/")) {
      const messages = (body.input ?? []).map((m) => ({ role: m.role, content: textOf(m.content) }));
      const text = player(messages, body.instructions ?? "");
      return json({ id: `resp_scripted_${n}`, object: "response", model: body.model, status: "completed", output: [{ type: "message", role: "assistant", content: [{ type: "output_text", text }] }],
        usage: { input_tokens: 1000, input_tokens_details: { cached_tokens: 0 }, output_tokens: 20, output_tokens_details: { reasoning_tokens: 0 } } }, 200, { "x-request-id": `req_scripted_${n}` });
    }
    const system = Array.isArray(body.system) ? body.system.map((b) => b.text ?? "").join("\n") : String(body.system ?? "");
    const user = textOf(body.messages?.at(-1)?.content);
    if (body.stream && DM_MODELS.has(body.model)) return stream(scriptedDm(body, system), body.model, n);
    let text;
    if (body.output_config?.format?.type === "json_schema") text = ++openings <= failOpenings ? "an opening the provider cannot read" : JSON.stringify(OPENING);
    else if (/blind evaluator/i.test(system)) text = judge(system, user);
    else if (/You check the narration of a role-playing game's turn/.test(system)) text = JSON.stringify({ rolls: [], untold: [], undeclared: [] });
    else if (/You are a player sitting down/.test(system)) text = player((body.messages ?? []).map((m) => ({ role: m.role, content: textOf(m.content) })), system);
    else text = "{}";
    const message = { id: `msg_scripted_${n}`, type: "message", role: "assistant", model: body.model, content: [{ type: "text", text }], stop_reason: "end_turn",
      usage: { input_tokens: 1000, cache_read_input_tokens: 0, cache_creation_input_tokens: 0, output_tokens: 20 } };
    if (body.stream) {
      const events = [
        { type: "message_start", message: { ...message, content: [], stop_reason: null, usage: { ...message.usage, output_tokens: 1 } } },
        { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } },
        { type: "content_block_delta", index: 0, delta: { type: "text_delta", text } },
        { type: "content_block_stop", index: 0 },
        { type: "message_delta", delta: { stop_reason: "end_turn" }, usage: { output_tokens: 20 } },
        { type: "message_stop" },
      ];
      return new Response(events.map((e) => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join(""), { status: 200, headers: { "content-type": "text/event-stream", "request-id": `req_scripted_${n}` } });
    }
    return json(message, 200, { "request-id": `req_scripted_${n}` });
  };
}

// ---- the scripted DM (streamed, as the app's Anthropic adapter reads it) -------------------------------------------------

const DM_MODELS = new Set(["claude-opus-5-5", "claude-fable-5-1", "claude-sonnet-5-5"]);
/** A player line that asks for a check (the scripted DM rolls the hero's Deception on it). */
export const ROLL_TRIGGER = /\b(?:bluff|lie to|slip past|sneak)\b/i;
export const SCRIPTED_PREP = { truth: "Scripted truth: the Lady's errand hides an older debt.", factions: [{ name: "The Guild", hiddenAim: "Scripted aim." }],
  secrets: ["Scripted secret one.", "Scripted secret two."], clocks: [{ key: "guild_notice", label: "The Guild notices the envoy", segments: 6, trigger: "A visit at night." }],
  wonder: { thing: "A coin that stands on its edge", history: "Scripted history.", question: "Why does it not fall?" }, clues: ["Scripted clue A.", "Scripted clue B.", "Scripted clue C."], voices: [] };
const lastUserText = (messages) => {
  for (let i = (messages ?? []).length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "user") continue;
    const blocks = typeof m.content === "string" ? [{ type: "text", text: m.content }] : m.content ?? [];
    const text = blocks.filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n").trim();
    if (text) return text;
  }
  return "";
};
const usedTool = (messages, name) => (messages ?? []).some((m) => m.role === "assistant" && Array.isArray(m.content) && m.content.some((b) => b.type === "tool_use" && b.name === name));
/** What the scripted DM says to one request: { text, tools: [{ name, input }] }. */
export function scriptedDm(body, system) {
  const tools = (body.tools ?? []).map((t) => t.name);
  const messages = body.messages ?? [];
  if (tools.includes("finish_turn")) {
    return usedTool(messages, "finish_turn") ? { text: "", tools: [] }
      : { text: "", tools: [{ name: "finish_turn", input: { sceneKinds: ["conversation"], spotlight: [], playerMoment: false, nextTension: "calm" } }] };
  }
  if (tools.includes("roll")) {
    const player = messages.map((m) => (m.role === "user" ? (typeof m.content === "string" ? m.content : (m.content ?? []).filter((b) => b.type === "text").map((b) => b.text).join("\n")) : "")).join("\n");
    if (ROLL_TRIGGER.test(player) && !usedTool(messages, "roll")) {
      return { text: "The sergeant narrows his eyes at your story. ", tools: [{ name: "roll", input: { formula: "1d20+7", reason: "Deception: the sergeant weighs the story", actorRef: "James Worgen", visibility: "player", kind: "skill", difficulty: "normal" } }] };
    }
    const told = usedTool(messages, "roll") ? "The story holds; the sergeant waves you through. " : "";
    return { text: `${told}The queue shuffles forward under the arch, and the cat flicks its tail at the lanterns. What do you do?\n\n<ledger>\n- nothing to record\n</ledger>`, tools: [] };
  }
  if (/out-of-game question/.test(system)) return { text: JSON.stringify({ narration: "Out of game: the gate closes at full dark, in about an hour.", guidanceProposal: null, teachingCandidate: null }), tools: [] };
  if (/Your own prep before the next session/.test(lastUserText(messages))) return { text: JSON.stringify(SCRIPTED_PREP), tools: [] };
  return { text: "{}", tools: [] };
}
export function stream({ text, tools }, model, n) {
  const blocks = [];
  if (text) blocks.push([{ type: "content_block_start", content_block: { type: "text", text: "" } }, { type: "content_block_delta", delta: { type: "text_delta", text } }]);
  tools.forEach((tool, i) => blocks.push([{ type: "content_block_start", content_block: { type: "tool_use", id: `toolu_scripted_${n}_${i}`, name: tool.name, input: {} } },
    { type: "content_block_delta", delta: { type: "input_json_delta", partial_json: JSON.stringify(tool.input) } }]));
  const events = [{ type: "message_start", message: { id: `msg_scripted_${n}`, type: "message", role: "assistant", model, content: [], stop_reason: null,
    usage: { input_tokens: 2000, cache_read_input_tokens: 0, cache_creation_input_tokens: 0, output_tokens: 1 } } }];
  blocks.forEach((b, index) => { events.push({ ...b[0], index }, { ...b[1], index }, { type: "content_block_stop", index }); });
  events.push({ type: "message_delta", delta: { stop_reason: tools.length ? "tool_use" : "end_turn" }, usage: { output_tokens: 50 } }, { type: "message_stop" });
  return new Response(events.map((e) => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join(""), { status: 200, headers: { "content-type": "text/event-stream", "request-id": `req_scripted_${n}` } });
}

/** The scripted player: rolls when a card waits, ends after its last action when asked for a note, otherwise acts. */
export function defaultPlayer(messages) {
  const last = messages.at(-1)?.content ?? "";
  if (/\[Roll the die\]/.test(last)) return "roll";
  if (/\[Onward\]/.test(last)) return "onward";
  if (/would like a note from you/.test(last)) return "The opening was clear and the gate felt busy. Nothing broke that I saw. I missed a map of the city.";
  if (/wanted to do something and didn't/.test(last)) return "I wanted to ask the cat its name.";
  const k = messages.filter((m) => m.role === "assistant").length;
  if (k === 1) return "I bluff the sergeant: I'm a courier for the Lady's Hall.";
  if (messages.some((m) => m.role === "user" && /\? How long/.test(m.content))) return "I walk on into the city.";
  return k >= 2 && !messages.some((m) => m.role === "assistant" && /^\?/.test(m.content)) ? "? How long until the gate closes?" : "I hand the sergeant my papers and ask where an honest traveller can find a bed.";
}
export function defaultJudge(system, user) {
  if (/distress = 1/.test(user)) return JSON.stringify({ distress: 0, reason: "scripted" });
  const ids = [...user.matchAll(/"([a-z_]+)":0\|1/g)].map((m) => m[1]);
  if (/"threads":\[/.test(user)) return JSON.stringify({ threads: [] });
  if (/"true_statement"/.test(user)) return JSON.stringify({ true_statement: 1, reason: "scripted" });
  return JSON.stringify({ ...Object.fromEntries(ids.map((id) => [id, 0])), reason: "scripted" });
}
