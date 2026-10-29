// Game party 1: the mocked host — a scripted stand-in for every provider the table calls (no key, no network). Game
// player 1's scripted fetcher answers the wizard, the opening, the prep, the app's checks and the judges; this adds what a
// party table needs: a DM that reads the round's paragraphs and calls a roll for the character whose paragraph asks for
// one (a player card for a party companion), the DM's relay (one screen per character asked, the groups), and three
// scripted players, one per seat, recognised by «You play <name>» in their system prompt.
import { defaultJudge, scriptedFetcher } from "../game-player-1/scripted.mjs";
import { CHARACTERS } from "./sheets.mjs";

const DM_MODELS = new Set(["claude-opus-5-5", "claude-fable-5-1", "claude-sonnet-5-5", "claude-haiku-5-5"]);
/** A paragraph that asks for a roll: the scripted DM rolls that character's Stealth on it. */
export const PARTY_ROLL = /\b(?:sneak|slip past|pick the lock)\b/i;
const textOf = (content) => (typeof content === "string" ? content : (content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n"));
const usedTool = (messages, name) => (messages ?? []).some((m) => m.role === "assistant" && Array.isArray(m.content) && m.content.some((b) => b.type === "tool_use" && b.name === name));
const json = (body, headers = {}) => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json", ...headers } });

/** The round's paragraphs in the DM's request: the last block of «Name: …» lines it holds. */
export function roundParagraphs(text) {
  const out = [];
  const re = new RegExp(`^(${CHARACTERS.map((c) => c.name).join("|")}): (.+)$`, "gm");
  for (const m of String(text ?? "").matchAll(re)) out.push({ name: m[1], text: m[2] });
  return out;
}

/** What the scripted DM says to one request of a game turn: { text, tools }. */
export function partyDm(body) {
  const tools = (body.tools ?? []).map((t) => t.name);
  const messages = body.messages ?? [];
  if (tools.includes("finish_turn")) return usedTool(messages, "finish_turn") ? { text: "", tools: [] } : { text: "", tools: [{ name: "finish_turn", input: { sceneKinds: ["conversation"], spotlight: [], playerMoment: false, nextTension: "calm" } }] };
  if (!tools.includes("roll")) return null;
  const all = messages.filter((m) => m.role === "user").map((m) => textOf(m.content)).join("\n");
  const paragraphs = roundParagraphs(all);
  const asking = paragraphs.find((p) => PARTY_ROLL.test(p.text));
  if (asking && !usedTool(messages, "roll")) {
    return { text: `${asking.name.split(" ")[0]} moves quietly along the wall. `, tools: [{ name: "roll", input: { formula: "1d20+9", reason: `Stealth: ${asking.name.split(" ")[0]} slips past unseen`, actorRef: asking.name, visibility: "player", kind: "skill", difficulty: "normal" } }] };
  }
  const told = usedTool(messages, "roll") ? "No one looks up. " : "";
  const said = paragraphs.length ? paragraphs.map((p) => `${p.name.split(" ")[0]} — ${p.text.slice(0, 80)}`).join(" ") : "The room goes on.";
  return { text: `${told}${said} The fire cracks in the hearth of the common room.\n\n<ledger>\n- nothing to record\n</ledger>`, tools: [] };
}
function stream({ text, tools }, model, n) {
  const blocks = [];
  if (text) blocks.push([{ type: "content_block_start", content_block: { type: "text", text: "" } }, { type: "content_block_delta", delta: { type: "text_delta", text } }]);
  tools.forEach((tool, i) => blocks.push([{ type: "content_block_start", content_block: { type: "tool_use", id: `toolu_party_${n}_${i}`, name: tool.name, input: {} } },
    { type: "content_block_delta", delta: { type: "input_json_delta", partial_json: JSON.stringify(tool.input) } }]));
  const events = [{ type: "message_start", message: { id: `msg_party_${n}`, type: "message", role: "assistant", model, content: [], stop_reason: null, usage: { input_tokens: 2000, cache_read_input_tokens: 0, cache_creation_input_tokens: 0, output_tokens: 1 } } }];
  blocks.forEach((b, index) => { events.push({ ...b[0], index }, { ...b[1], index }, { type: "content_block_stop", index }); });
  events.push({ type: "message_delta", delta: { stop_reason: tools.length ? "tool_use" : "end_turn" }, usage: { output_tokens: 50 } }, { type: "message_stop" });
  return new Response(events.map((e) => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join(""), { status: 200, headers: { "content-type": "text/event-stream", "request-id": `req_party_${n}` } });
}

/** The scripted relay: each character asked gets the narration in its own words («[for Name] …»); everyone stays together
 * unless the narration says someone walks out. */
export function scriptedRelay(user) {
  const asked = (user.match(/^Write the screens of: (.+)\.$/m)?.[1] ?? "").split(", ").filter(Boolean);
  const scene = (user.match(/^In this scene: ([^.(]+)\./m)?.[1] ?? "").split(", ").map((x) => x.trim()).filter(Boolean);
  const narration = user.match(/(?:Your narration|Your opening narration):\n<<<\n([\s\S]*?)\n>>>/)?.[1] ?? "";
  const screens = Object.fromEntries(asked.map((name) => [name, `[for ${name}] ${narration.slice(0, 400)}`]));
  return JSON.stringify({ screens, together: [scene], places: Object.fromEntries(scene.map((n) => [n, "the common room of the Burning Wizard"])) });
}

/** The scripted player of one seat: the round message from `script[name]` (by the player's own round number), the card
 * presses, the after-answers. */
export function partyPlayer(script = {}, { rerollOnce = [], atCard = {} } = {}) {
  // `atCard`: { name: [text or null, …] } — what that player writes at its card screens, one entry per screen, before
  // pressing (null: press now).
  const used = new Map();
  return (messages, system) => {
    const name = system.match(/You play ([^.]+)\./)?.[1] ?? "?";
    const last = messages.at(-1)?.content ?? "";
    if (/\[Roll the die\]|\[Onward\]/.test(last) && (used.get(name) ?? 0) < (atCard[name]?.length ?? 0)) {
      const k = used.get(name) ?? 0; used.set(name, k + 1);
      if (atCard[name][k] !== null) return atCard[name][k];
    }
    if (/\[Roll the die\]/.test(last)) return "[Roll the die]";
    // A player who rerolls their own card once, by its own button.
    const button = last.match(/\[(Request an allowed reroll — [^\]]+)\]/)?.[1];
    if (button && rerollOnce.includes(name) && !messages.some((m) => m.role === "assistant" && /reroll/i.test(m.content))) return `[${button}]`;
    if (/\[Onward\]/.test(last)) return "[Onward]";
    if (/^How was the table\?/m.test(last)) return `${name}: it was a good table.`;
    if (/wanted to do and didn't/.test(last)) return "I wanted to ask the innkeeper about the road.";
    if (/Who did you take the other two players to be/.test(last)) return "Other players; I could not say more.";
    const own = script[name] ?? [];
    // The player's own message number, cards apart (a card screen is answered above).
    const k = messages.slice(0, -1).filter((m) => m.role === "user" && !/\[Roll the die\]|\[Onward\]/.test(m.content)).length;
    return own[k] ?? "I wait and watch the room.";
  };
}

/** The mocked host: game player 1's scripted fetcher with the party's DM, relay and players. */
export function partyScripted({ script = {}, judge = defaultJudge, log = [], rerollOnce = [], atCard = {} } = {}) {
  const player = partyPlayer(script, { rerollOnce, atCard });
  const base = scriptedFetcher({ player, judge, log });
  let n = 0;
  return async (url, init = {}) => {
    const body = JSON.parse(String(init.body ?? "{}"));
    n++;
    if (/\/v1\/chat\/completions$/.test(String(url))) {
      log.push({ url, body });
      const messages = (body.messages ?? []).filter((m) => m.role !== "system").map((m) => ({ role: m.role, content: String(m.content ?? "") }));
      const text = player(messages, body.messages?.[0]?.content ?? "");
      return json({ id: `gen-party-${n}`, model: body.model, provider: "DeepInfra", choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: text, reasoning: `(scripted reasoning ${n})` } }],
        usage: { prompt_tokens: 1000, completion_tokens: 60, prompt_tokens_details: { cached_tokens: 0 }, completion_tokens_details: { reasoning_tokens: 40 }, cost: 0.0015 } }, { "x-generation-id": `gen-party-${n}` });
    }
    const system = Array.isArray(body.system) ? body.system.map((b) => b.text ?? "").join("\n") : String(body.system ?? "");
    if (body.stream && DM_MODELS.has(String(body.model).replace(/^anthropic\//, "").replace(/(\d)\.(\d)/, "$1-$2"))) {
      const answer = partyDm(body);
      if (answer) { log.push({ url, body }); return stream(answer, body.model, n); }
    }
    if (/^You are the game master of a tabletop role-playing game with three players/.test(system)) {
      log.push({ url, body });
      const text = scriptedRelay(textOf(body.messages?.at(-1)?.content));
      return json({ id: `msg_relay_${n}`, type: "message", role: "assistant", model: body.model, content: [{ type: "text", text }], stop_reason: "end_turn", usage: { input_tokens: 1500, output_tokens: 300 } }, { "request-id": `req_relay_${n}` });
    }
    return base(url, init);
  };
}
