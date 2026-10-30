// Multi-hero 1: the mocked host — PARTY_1's scripted providers (game-party-1/scripted.mjs) with what this stage needs: a
// DM that rolls a check for any seat that asks (its own card), rerolls a die with that character's Heroic Inspiration
// when its player spends it, and grants Inspiration for «a clever plan»; the company's prep, with its addressees; a
// relay that retells (its first answer may copy a player's words — then the second ask retells them) and marks a
// character who goes to sleep as waiting; the judges of A7 and A8; and three players, one per seat, who can ask for a
// check, reroll their own card, spend their own Inspiration, press another's card, or sleep.
import { defaultJudge, scriptedFetcher, SCRIPTED_PREP } from "../game-player-1/scripted.mjs";
import { CHARACTERS } from "./sheets.mjs";

const DM_MODELS = new Set(["claude-opus-5-5", "claude-fable-5-1", "claude-sonnet-5-5", "claude-haiku-5-5"]);
/** A paragraph that asks for a check: the scripted DM rolls that character's own (a card for its player). */
export const ASKS_CHECK = /\b(?:sneak|slip past|pick the lock|ask for a check|I check|search)\b/i;
export const SPENDS_INSPIRATION = /\bspend (?:my|her|his) Heroic Inspiration\b/i;
export const CLEVER_PLAN = /\ba clever plan\b/i;
export const SLEEPS = /\b(?:go to sleep|sleep until dawn|lie down to sleep)\b/i;
/** A paragraph that walks off alone: the relay puts that character in a group of their own. */
export const WALKS_OFF = /\bwalk out to the yard alone\b/i;
/** A paragraph that names the cellar key: the round's ledger opens a thread (the journal of that scene only). */
export const CELLAR_KEY = /\bthe cellar key\b/i;
const NAMES = CHARACTERS.map((c) => c.name);
const textOf = (content) => (typeof content === "string" ? content : (content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n"));
const usedTool = (messages, name) => (messages ?? []).some((m) => m.role === "assistant" && Array.isArray(m.content) && m.content.some((b) => b.type === "tool_use" && b.name === name));
const json = (body, headers = {}) => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json", ...headers } });

/** The round's paragraphs in the DM's request (the last round message): [{ name, text }]. */
export function roundParagraphs(text) {
  const out = [];
  const re = new RegExp(`^(${NAMES.join("|")}): (.+)$`, "gm");
  for (const m of String(text ?? "").matchAll(re)) out.push({ name: m[1], text: m[2] });
  return out;
}
const lastPlayerMessage = (messages) => {
  for (let i = messages.length - 1; i >= 0; i--) { const t = messages[i].role === "user" ? textOf(messages[i].content) : ""; if (/^Player: /.test(t)) return t; }
  return "";
};

/** What the scripted DM says to one request of a game turn: { text, tools } (null: not a turn's request). */
export function companyDm(body) {
  const tools = (body.tools ?? []).map((t) => t.name);
  const messages = body.messages ?? [];
  if (tools.includes("finish_turn")) {
    if (usedTool(messages, "finish_turn")) return { text: "", tools: [] };
    // The bookkeeper: the Inspiration the writer's ledger grants, then the close.
    const brief = messages.filter((m) => m.role === "user").map((m) => textOf(m.content)).join("\n");
    const granted = [...brief.matchAll(/Heroic Inspiration for ([A-Z][a-z]+ [A-Z][a-z]+)/g)].map((m) => m[1]).filter((n) => NAMES.includes(n));
    const grants = usedTool(messages, "resource") ? [] : [...new Set(granted)].map((name) => ({ name: "resource", input: { actorRef: name, resource: "heroic_inspiration", set: 1, reason: "a clever plan" } }));
    const threads = usedTool(messages, "quest") ? [] : [...new Set([...brief.matchAll(/Thread opened: ([^\n]+)/g)].map((m) => m[1].trim()))]
      .map((title) => ({ name: "quest", input: { action: "create", kind: "thread", title, description: `${title}: a thread of the scene.` } }));
    return { text: "", tools: [...grants, ...threads, { name: "finish_turn", input: { sceneKinds: ["conversation"], spotlight: [], playerMoment: false, nextTension: "calm" } }] };
  }
  if (!tools.includes("roll")) return null;
  const paragraphs = roundParagraphs(lastPlayerMessage(messages));
  const short = (p) => p.name.split(" ")[0];
  if (!usedTool(messages, "roll")) {
    const spends = paragraphs.find((p) => SPENDS_INSPIRATION.test(p.text));
    if (spends) return { text: `${short(spends)} tries again. `, tools: [{ name: "roll", input: { formula: "1d20+5", reason: `${short(spends)}: the second try`, actorRef: spends.name, visibility: "player", kind: "skill", difficulty: "normal", heroicInspiration: true } }] };
    const asking = paragraphs.find((p) => ASKS_CHECK.test(p.text));
    if (asking) return { text: `${short(asking)} moves quietly. `, tools: [{ name: "roll", input: { formula: "1d20+5", reason: `Stealth: ${short(asking)} slips past`, actorRef: asking.name, visibility: "player", kind: "skill", difficulty: "normal" } }] };
  }
  const told = usedTool(messages, "roll") ? "No one looks up. " : "";
  const said = paragraphs.length ? paragraphs.map((p) => `${short(p)} acts.`).join(" ") : "The room goes on.";
  const clever = [...paragraphs.filter((p) => CLEVER_PLAN.test(p.text)).map((p) => `- Heroic Inspiration for ${p.name}: a clever plan`),
    ...(paragraphs.some((p) => CELLAR_KEY.test(p.text)) ? ["- Thread opened: The cellar key"] : [])];
  const dawn = paragraphs.some((p) => /\(waiting —/.test(p.text)) ? " Dawn comes grey over the roofs." : "";
  return { text: `${told}${said} The fire cracks in the hearth.${dawn} What do you do — ${paragraphs.map(short).join(", ") || "all of you"}?\n\n<ledger>\n${clever.join("\n") || "- nothing to record"}\n</ledger>`, tools: [] };
}

/** The character a fix-A4 return is for (null for any other relay request). */
export const resendFor = (user) => user.match(/^You wrote the screen below for ([^.]+)\. Each part between/m)?.[1] ?? null;
/** The scripted relay: each screen asked, in the order asked; the first answer copies the players' words when
 * `copyFirst` (fix A4 sends that screen back alone, its runs marked: the answer retells them, unless the screen's
 * character is in `stubborn`, whose screen keeps the copy on every pass, or in `stubbornOnce`, whose screen keeps it on
 * the first return and retells on the second — `pass` is the return's number for that character); a character whose
 * own paragraph goes to sleep is marked waiting. */
export function companyRelay(user, { copyFirst = true, stubborn = [], stubbornOnce = [], pass = 1 } = {}) {
  const resend = resendFor(user);
  if (resend) {
    const marked = user.slice(user.lastIndexOf("<<<\n") + 4, user.lastIndexOf("\n>>>"));
    const keeps = stubborn.includes(resend) || (stubbornOnce.includes(resend) && pass % 2 === 1);
    const screen = keeps ? marked.replace(/[⟦⟧]/g, "") : marked.replace(/⟦[^⟧]*⟧/g, "does what they said they would.");
    return JSON.stringify({ screen });
  }
  const asked = (user.match(/^Write the screens of, in this order: (.+)\.$/m)?.[1] ?? "").split(", ").filter(Boolean);
  const scene = (user.match(/^In this scene: ([^.(]+)\./m)?.[1] ?? "").split(", ").map((x) => x.trim()).filter(Boolean);
  const narration = user.match(/(?:Your narration|Your opening narration):\n<<<\n([\s\S]*?)\n>>>/)?.[1] ?? "";
  const block = user.match(/What the players wrote for this round[^\n]*\n<<<\n([\s\S]*?)\n>>>/)?.[1] ?? "";
  const paragraphs = roundParagraphs(block);
  const screens = Object.fromEntries(asked.map((name) => {
    const others = paragraphs.filter((p) => p.name !== name && !/^\(/.test(p.text));
    const told = others.map((p) => (copyFirst ? `${p.name.split(" ")[0]} says: ${p.text}` : `${p.name.split(" ")[0]} does what they said they would.`)).join(" ");
    return [name, `[for ${name}] ${told} ${narration.slice(0, 300)}`.trim()];
  }));
  const waiting = Object.fromEntries(paragraphs.filter((p) => SLEEPS.test(p.text)).map((p) => [p.name, "asleep — until dawn"]));
  const off = paragraphs.filter((p) => WALKS_OFF.test(p.text)).map((p) => p.name);
  const together = off.length ? [scene.filter((n) => !off.includes(n)), ...off.map((n) => [n])].filter((g) => g.length) : [scene];
  return JSON.stringify({ screens, together, places: Object.fromEntries(scene.map((n) => [n, off.includes(n) ? "the inn's yard" : "the common room of the Burning Wizard"])), waiting });
}

/** The company's prep on the mocked host: PARTY_1's scripted layer with its addressees spread over the three. */
export const COMPANY_SCRIPTED_PREP = { ...SCRIPTED_PREP, company: [
  { kind: "puzzle", for: "Sefa Marrin", what: "The words under the Lantern's old lamp." },
  { kind: "threat", for: "Bram Halloway", what: "A free company that remembers his painted-over mark." },
  { kind: "reward", for: "Pell Dunmore", what: "A guild key that opens the second floor." },
  { kind: "threat", for: "Pell Dunmore", what: "The guild's runner who knows his old name." } ] };

/** The judges of this stage (A7's round tags, A8's layer reading); `null` for anyone else's request. */
export function companyJudge(system, user, { waitsOn = null } = {}) {
  if (/tag who the game master's narration addresses/i.test(system)) {
    const named = NAMES.filter((n) => new RegExp(`\\b${n.split(" ")[0]}\\b`).test(user.slice(user.lastIndexOf("The game master's narration"))));
    return JSON.stringify({ addressed: named, waits: waitsOn, reason: "scripted" });
  }
  if (/read a game master's hidden layer/i.test(system)) {
    return JSON.stringify({ items: COMPANY_SCRIPTED_PREP.company.map((c) => ({ kind: c.kind, what: c.what, for: c.for })),
      threads: NAMES.map((n) => ({ thread: `a thread of ${n}`, touches: [n] })), reason: "scripted" });
  }
  return null;
}

/** The scripted player of one seat. `script[name]`: its round messages in order; `atCard[name]`: what it writes at its
 * card screens before pressing (null: press); `rerolls[name]`: how many times it rerolls its own card. */
export function companyPlayer(script = {}, { atCard = {}, rerolls = {} } = {}) {
  const usedAtCard = new Map(), usedRerolls = new Map();
  return (messages, system) => {
    const name = system.match(/You play ([^.]+)\./)?.[1] ?? "?";
    const last = messages.at(-1)?.content ?? "";
    if (/\[Roll the die\]|\[Onward\]/.test(last) && (usedAtCard.get(name) ?? 0) < (atCard[name]?.length ?? 0)) {
      const k = usedAtCard.get(name) ?? 0; usedAtCard.set(name, k + 1);
      if (atCard[name][k] !== null) return atCard[name][k];
    }
    if (/\[Roll the die\]/.test(last)) return "[Roll the die]";
    const button = last.match(/\[(Request an allowed reroll — [^\]]+)\]/)?.[1];
    if (button && (usedRerolls.get(name) ?? 0) < (rerolls[name] ?? 0)) { usedRerolls.set(name, (usedRerolls.get(name) ?? 0) + 1); return `[${button}]`; }
    if (/\[Onward\]/.test(last)) return "[Onward]";
    if (/^How was the table\?/m.test(last)) return `${name}: it was a good table.`;
    if (/wanted to do and didn't/.test(last)) return "I wanted to ask the innkeeper about the road.";
    if (/Who did you take the other two players to be/.test(last)) return "Other players; I could not say more.";
    const own = script[name] ?? [];
    const k = messages.slice(0, -1).filter((m) => m.role === "user" && !/\[Roll the die\]|\[Onward\]/.test(m.content)).length;
    return own[k] ?? "I wait and watch the room.";
  };
}

/** The mocked host. `log` collects every request; `copyFirst`: the relay's first answer copies the players' words. */
export function companyScripted({ script = {}, atCard = {}, rerolls = {}, log = [], copyFirst = true, stubborn = [], stubbornOnce = [], waitsOn = null } = {}) {
  const player = companyPlayer(script, { atCard, rerolls });
  const judge = (system, user) => companyJudge(system, user, { waitsOn }) ?? defaultJudge(system, user);
  const base = scriptedFetcher({ player, judge, log });
  let n = 0;
  const returns = new Map();
  return async (url, init = {}) => {
    const body = JSON.parse(String(init.body ?? "{}"));
    n++;
    const system = Array.isArray(body.system) ? body.system.map((b) => b.text ?? "").join("\n") : String(body.system ?? "");
    const model = String(body.model).replace(/^anthropic\//, "").replace(/(\d)\.(\d)/, "$1-$2");
    if (body.stream && DM_MODELS.has(model)) {
      const user = (body.messages ?? []).filter((m) => m.role === "user").map((m) => textOf(m.content)).join("\n");
      if (/Your own prep before the next session/.test(user) && /This table has several player characters and no main character/.test(user)) {
        log.push({ url, body });
        return stream({ text: JSON.stringify(COMPANY_SCRIPTED_PREP), tools: [] }, body.model, n);
      }
      const answer = companyDm(body);
      if (answer) { log.push({ url, body }); return stream(answer, body.model, n); }
    }
    if (/^You are the game master of a tabletop role-playing game with three players/.test(system)) {
      log.push({ url, body });
      const user = textOf(body.messages?.at(-1)?.content);
      const who = resendFor(user);
      if (who) returns.set(who, (returns.get(who) ?? 0) + 1);
      const text = companyRelay(user, { copyFirst, stubborn, stubbornOnce, pass: who ? returns.get(who) : 1 });
      return json({ id: `msg_relay_${n}`, type: "message", role: "assistant", model: body.model, content: [{ type: "text", text }], stop_reason: "end_turn", usage: { input_tokens: 1500, output_tokens: 300 } }, { "request-id": `req_relay_${n}` });
    }
    return base(url, init);
  };
}

function stream({ text, tools }, model, n) {
  const blocks = [];
  if (text) blocks.push([{ type: "content_block_start", content_block: { type: "text", text: "" } }, { type: "content_block_delta", delta: { type: "text_delta", text } }]);
  tools.forEach((tool, i) => blocks.push([{ type: "content_block_start", content_block: { type: "tool_use", id: `toolu_company_${n}_${i}`, name: tool.name, input: {} } },
    { type: "content_block_delta", delta: { type: "input_json_delta", partial_json: JSON.stringify(tool.input) } }]));
  const events = [{ type: "message_start", message: { id: `msg_company_${n}`, type: "message", role: "assistant", model, content: [], stop_reason: null, usage: { input_tokens: 2000, cache_read_input_tokens: 0, cache_creation_input_tokens: 0, output_tokens: 1 } } }];
  blocks.forEach((b, index) => { events.push({ ...b[0], index }, { ...b[1], index }, { type: "content_block_stop", index }); });
  events.push({ type: "message_delta", delta: { stop_reason: tools.length ? "tool_use" : "end_turn" }, usage: { output_tokens: 50 } }, { type: "message_stop" });
  return new Response(events.map((e) => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join(""), { status: 200, headers: { "content-type": "text/event-stream", "request-id": `req_company_${n}` } });
}
