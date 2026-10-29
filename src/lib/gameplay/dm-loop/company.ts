// Multi-hero 1 (docs/stages/MULTI_HERO_1.md): «a table with no main character» — the DM option `company`. The app keeps
// one player record (the wizard's) and party companions; at a company table every controlled party member is a player
// character with the same standing: the DM's inputs speak of the company and never of «the hero» (this module's frame
// and rewrite, applied to every DM request of the mode), each player character earns and spends their own Heroic
// Inspiration (execute.ts), and each player has their own allowed rerolls (reroll-allowance.ts, migration
// 202610290801). Off by default; with it off nothing here runs and every DM input is byte for byte as before.
//
// The rewrite is for the English instructions (a company table plays with «Инструкции ведущего: английские»). It never
// touches the story's own words: the conversation's history (system blocks marked `story`) and a player's message
// («Player: …») go to the DM as they are.
import type { DmMessage, DmModelRequest, DmSystemBlock } from "../../server/dm/model/contracts.ts";
import type { CompiledToolset } from "../../server/dm/model/schema-compiler.ts";
import type { Entity } from "../../persistence/contracts.ts";
import { parseDmOptions } from "./options.ts";

/** The option, read from the campaign's stored DM options. */
export const companyOn = (dmOptions: unknown): boolean => parseDmOptions(dmOptions).company === true;

/** A player character at a company table: the player record or a controlled party member; at any other table, the
 * player record alone (the hero). */
export function isPlayerCharacter(entity: Pick<Entity, "id" | "kind"> | null | undefined, controlled: ReadonlySet<string> | readonly string[], company: boolean): boolean {
  if (!entity) return false;
  if (entity.kind === "player") return true;
  const ids = controlled instanceof Set ? controlled : new Set(controlled as readonly string[]);
  return company && entity.kind === "companion" && ids.has(entity.id);
}

/** The player characters of a company table, in the records' order (the player record first, as it is stored). */
export function playerCharacterIds(entities: readonly Pick<Entity, "id" | "kind">[], controlled: readonly string[]): string[] {
  return entities.filter((row) => isPlayerCharacter(row, controlled, true)).map((row) => row.id);
}

// ---- the order (fix A2, the amendment of 2026-10-29 02:30 LA): nothing the DM reads lists one character first by place --

/** The seats of a company table: the player record, then the party's companions as the table seated them (the
 * configuration's order; before the seating, the companions on record as listed), turned by the table's coin — the DM
 * option `companyStart` (0–2), drawn once per table. */
export function companySeats(entities: readonly Pick<Entity, "id" | "kind">[], controlled: readonly string[], start = 0): string[] {
  const player = entities.filter((row) => row.kind === "player").map((row) => row.id);
  const seated = controlled.filter((id) => entities.some((row) => row.id === id && row.kind === "companion"));
  const companions = seated.length ? seated : entities.filter((row) => row.kind === "companion").map((row) => row.id);
  const base = [...player, ...companions];
  const shift = base.length ? ((start % base.length) + base.length) % base.length : 0;
  return [...base.slice(shift), ...base.slice(0, shift)];
}

const escapeName = (name: string) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** The order of a round's own message: the player characters whose names open its paragraphs («Sefa Marrin: …»), as
 * they come (the table turns it round each round, and follows initiative in a fight). Empty for any other text. */
export function roundOrder(text: string, members: readonly Pick<Entity, "id" | "name">[]): string[] {
  const found = members.map((row) => ({ id: row.id, at: text.search(new RegExp(`(?:^|\\n)${escapeName(row.name)}:`)) })).filter((row) => row.at >= 0);
  return found.sort((a, b) => a.at - b.at).map((row) => row.id);
}

/** The order of the player characters in everything the DM reads at a company table: the round's own message (the
 * turn's input, else the last round on record), the characters it leaves out after it in the seats' order; before the
 * first round, the seats. */
export function companyOrder(entities: readonly Pick<Entity, "id" | "kind" | "name">[], controlled: readonly string[], start: number,
  rounds: readonly string[]): string[] {
  const seats = companySeats(entities, controlled, start);
  const members = seats.map((id) => entities.find((row) => row.id === id)!).filter(Boolean);
  for (const text of rounds) {
    const order = roundOrder(text, members);
    if (order.length) return [...order, ...seats.filter((id) => !order.includes(id))];
  }
  return seats;
}

/** The header of a company layer's own list (hidden-layer.ts writes it; the A8 check reads it back). */
export const COMPANY_LINES_HEADER = "The company's puzzles, threats and rewards (each with the player character it is first addressed to):";
/** A layer's text with its company lines in the given order of names (each line kept as written; a line for no one of
 * them after, as it stood). */
export function orderCompanyLines(layer: string, names: readonly string[]): string {
  const at = layer.indexOf(COMPANY_LINES_HEADER);
  if (at < 0) return layer;
  const start = at + COMPANY_LINES_HEADER.length + 1;
  const tail = layer.slice(start);
  const end = tail.search(/\n(?!- )/);
  const block = end < 0 ? tail : tail.slice(0, end);
  const rank = (line: string) => { const who = /^- (?:puzzle|threat|reward), for ([^:]+):/.exec(line)?.[1]?.trim() ?? ""; const i = names.indexOf(who); return i < 0 ? names.length : i; };
  const lines = block.split("\n").map((line, index) => ({ line, index })).sort((a, b) => rank(a.line) - rank(b.line) || a.index - b.index).map((x) => x.line);
  return `${layer.slice(0, start)}${lines.join("\n")}${end < 0 ? "" : tail.slice(end)}`;
}

/** Rows sorted with the player characters first, in `order`, the rest after them as they were. */
export function inCompanyOrder<T>(rows: readonly T[], idOf: (row: T) => string, order: readonly string[]): T[] {
  const rank = (row: T) => { const at = order.indexOf(idOf(row)); return at < 0 ? order.length : at; };
  return rows.map((row, index) => ({ row, index })).sort((a, b) => rank(a.row) - rank(b.row) || a.index - b.index).map((x) => x.row);
}

/** The frame's company paragraph: who sits at the table, that no one is the main character, and that the company moves
 * when any of them acts (the stage's A7). It closes the frame of every DM role of the mode. */
export const COMPANY_TABLE = "At this table several players sit together, each playing one character of their own: the player characters, on record as the party. None of them is the main character and you play none of them. Each round brings what every character in a scene does, one paragraph each; resolve them all and narrate what happens to every character there. The company moves when any of them acts: you never wait on one character's decision before the others may move, and one character's consent is never the condition of the others' movement. When you end on a question, put it to the characters it concerns — over the rounds to each of them in turn, never to the same one by habit. Each player character earns and spends their own Heroic Inspiration, and each player has their own allowed rerolls.";

/** Whole sentences of the roles and the tools that need more than a word changed (the subject's pronouns, a rule that
 * meant one person). Each `from` is copied from its source; a test checks that every one still occurs there. */
export const COMPANY_SENTENCES: readonly (readonly [string, string])[] = [
  // Fix A2: the turn shapes' combat example names its archer «Bram» (roles.ts) — at a company table a real character may
  // bear the name, so the example's archer is someone no table seats.
  ["Text: \"Bram levels his crossbow at the brute; Toby draws on the sentry.\"", "Text: \"Ulf levels his crossbow at the brute; Toby draws on the sentry.\""],
  ["reason \"Bram: crossbow at the brute\")", "reason \"Ulf: crossbow at the brute\")"],
  // The frame (roles.ts FRAME).
  ["played at home by one person — the owner of this table.", "played at home by a company of players around one table — the owner's table."],
  ["the dice, the hidden layer, the records, the hero's will —", "the dice, the hidden layer, the records, each player's will over their own character —"],
  // The players' rules (roles.ts PLAYERS_RULES).
  ["A check on what the hero says is called only when the hero chooses to lie; a true statement is the hero's words, and the person across the table reacts to them. If you believe the hero is mistaken about his own story, ask the player out of game instead of rolling. A person may believe things about the hero that no record holds — that is their belief, played as theirs — but you never treat it as a fact about the hero and never ask the hero to account for a fact that is in no record.",
    "A check on what a player character says is called only when that character chooses to lie; a true statement is the character's own words, and the person across the table reacts to them. If you believe a character is mistaken about their own story, ask that character's player out of game instead of rolling. A person may believe things about a character that no record holds — that is their belief, played as theirs — but you never treat it as a fact about the character and never ask the character to account for a fact that is in no record."],
  ["You never compress the player's day on your own, and you never warn the hero off a road twice.", "You never compress a player's day on your own, and you never warn a character off a road twice."],
  ["- The hero's weakness is a price, not a fragility. The world leans on it for a reason — a stake, a favour, a bluff that needs a hand played — never as a trap for its own sake, and it may use what the hero knows about it (a crooked deal only he can read, a cheat only he can spot).",
    "- A character's weakness is a price, not a fragility. The world leans on it for a reason — a stake, a favour, a bluff that needs a hand played — never as a trap for its own sake, and it may use what that character knows about it (a crooked deal only they can read, a cheat only they can spot)."],
  ["- The hero's hand is the player's. Money, spell slots, spells, actions and memories are the player's: you may offer («You pay?», «the card is there») and never execute — no payment, meal, cast, spend or move is taken for the hero, and no inner state or memory of the hero is narrated that the player did not write. A companion's or familiar's senses are borrowed only when the player says so.",
    "- Each character's hand is their player's. A character's money, spell slots, spells, actions and memories are their player's: you may offer («You pay?», «the card is there») and never execute — no payment, meal, cast, spend or move is taken for a player character, and no inner state or memory of a player character is narrated that their player did not write. A familiar's senses are borrowed only when its player says so."],
  ["- The patron is present. Every reroll, and every turn where luck visibly turned, carries one small sign of the hero's patron — a sensation, a line, never a speech; the patron speaks at the moment of temptation, not of comfort.",
    "- A patron is present. Every reroll of a character who has a patron, and every turn where that character's luck visibly turned, carries one small sign of the patron — a sensation, a line, never a speech; the patron speaks at the moment of temptation, not of comfort."],
  ["ask whether the hero's background or trade plainly covers it", "ask whether the character's background or trade plainly covers it"],
  ["The die is for what is uncertain to him.", "The die is for what is uncertain to them."],
  ["What a person knows about the hero came from somewhere", "What a person knows about a player character came from somewhere"],
  ["(an ale barely touched stays on the table when the hero leaves); money handed to the hero to hold or pass on is kept apart from his own purse (an item «held for» its owner), never added to his coin.",
    "(an ale barely touched stays on the table when the character leaves); money handed to a character to hold or pass on is kept apart from their own purse (an item «held for» its owner), never added to their coin."],
  ["the failure can be the very thing that gets the hero what he wanted;", "the failure can be the very thing that gets a character what they wanted;"],
  ["consequences arrive on the world's own schedule, not the hero's;", "consequences arrive on the world's own schedule, not the characters';"],
  // The table's rules (roles.ts TABLE_RULES).
  ["- The hero's will is the player's. The narration never accepts, changes or replaces the hero's declared action or the manner of it, never writes the hero's lines, words, thoughts or decisions, and never spends the hero's time beyond the moment, money or resources without the player. A companion who objects to an order says his reason aloud, and the turn ends there for the player to answer; a question put to the hero ends the turn. That stop stands even when a check or your own second thought says the hero's declared action was left undone: say so in one line out of game and never play it for the player.",
    "- Each player character's will is their player's. The narration never accepts, changes or replaces a character's declared action or the manner of it, never writes a player character's lines, words, thoughts or decisions, and never spends a character's time beyond the moment, money or resources without their player. A person who objects to a character says their reason aloud, and that character's player answers in the next round; a question put to one character waits for that character's player — the others act meanwhile, and the scene does not stop for it. That stop stands even when a check or your own second thought says a character's declared action was left undone: say so in one line out of game and never play it for the player."],
  ["- Every roll is told: the hero's own action first, then each roll in order,", "- Every roll is told: the characters' own actions first, then each roll in order,"],
  ["the hero's roll by what the hero does and what comes of it — never left to a companion who does it instead,", "a player character's roll by what that character does and what comes of it — never left to someone else who does it instead,"],
  ["an open question in the hero's way", "an open question in the company's way"],
  ["- What the hero cannot know stays unsaid: a private plan's specifics (an hour, a place) never appear before the hero could learn them,", "- What the characters cannot know stays unsaid: a private plan's specifics (an hour, a place) never appear before a character could learn them,"],
  ["(who they are, where the hero met them)", "(who they are, where the characters met them)"],
  ["the server grants Heroic Inspiration on a natural 20 of a check you call for the hero (one at a time; the roll's record says granted, or why withheld); any other grant needs a named trigger, quoted in the records (resource heroic_inspiration set 1 with the trigger as its reason; the server refuses a second); when the player spends it, roll that die of the hero's again with roll heroicInspiration: true (a new server roll; the server spends it).",
    "the server grants Heroic Inspiration on a natural 20 of a check you call for a player character — each player character holds their own, one at a time (the roll's record says granted, or why withheld); any other grant needs a named trigger, quoted in the records (resource heroic_inspiration set 1 on that character with the trigger as its reason; the server refuses a second); when a player spends their character's Inspiration, roll that character's die again with roll heroicInspiration: true and actorRef that character (a new server roll; the server spends it)."],
  ["A companion does not restate what the scene has just shown.", "Nobody restates what the scene has just shown."],
  ["the hero's sheet changes through upsert_character sheet with a reason;", "a player character's sheet changes through upsert_character sheet with a reason;"],
  // The game master's and the writer's roles (roles.ts DM_ROLE, WRITER_ROLE).
  ["(the player answers for the hero)", "(each player answers for their own character)"],
  ["A hero's check is always the player's (card, reason, bonus, difficulty in words);", "A player character's check is always their player's (their own card, reason, bonus, difficulty in words);"],
  ["(companions support, never take the beat)", "(the others support, never take the beat)"],
  ["(the hero's own check shows its difficulty when the campaign shows it)", "(a player character's own check shows its difficulty when the campaign shows it)"],
  ["there are threats stronger than the hero and they are not scaled down.", "there are threats stronger than the company and they are not scaled down."],
  ["and let the hero notice only what reaches them.", "and let the characters notice only what reaches them."],
  ["play what reaches the hero, consistently with each person's model,", "play what reaches the characters, consistently with each person's model,"],
  ["- Companions and party: a companion is a character with party membership; a talk addressed to a companion is an ordinary turn where that companion answers in their own voice from what they know. Game time passes in such talks too. Companions and the people of the world are participants, not instruments, and they get the same room you do: their judgement is wanted, they may disagree with the hero and say so, want what the hero does not, or decline; they are not there to serve the plot.",
    "- The company: the player characters travel together as a party (party membership in the records), and you play none of them. The people of the world are participants, not instruments, and they get the same room you do: their judgement is wanted, they may disagree with any of the characters and say so, want what the characters do not, or decline; they are not there to serve the plot."],
  ["If someone refused, bargained down or walked away from the hero this turn (npcRefused)", "If someone refused, bargained down or walked away from a player character this turn (npcRefused)"],
  ["never let the hero pay, give or use what the state says they do not have,", "never let a character pay, give or use what the state says they do not have,"],
  ["In a fight every attack — the hero's, a companion's, an enemy's — is one roll", "In a fight every attack — a player character's, an enemy's — is one roll"],
  ["their attitude to the hero (this becomes their model)", "their attitude to each player character they know (this becomes their model)"],
  ["whether someone refused the hero,", "whether someone refused a player character,"],
  // The turn shapes (roles.ts).
  ["decide in your thinking what they want from the hero right now", "decide in your thinking what they want from the characters in front of them right now"],
  ["money spend(2 coins, fromRef the hero)", "money spend(2 coins, fromRef Rowan)"],
  ["item create(loaf, ownerRef hero)", "item create(loaf, ownerRef Rowan)"],
  ["time — 10 minutes, the hero is in the storeroom", "time — 10 minutes, Rowan is in the storeroom"],
  ["money — the hero paid 2 coins to the baker", "money — Rowan paid 2 coins to the baker"],
  ["items — the hero got a loaf of bread;", "items — Rowan got a loaf of bread;"],
  ["time — 5 minutes, the hero at the bakery", "time — 5 minutes, Rowan at the bakery"],
  ["someone refused the hero: yes/no", "someone refused a player character: yes/no"],
  // The bookkeeper (roles.ts BOOKKEEPER_ROLE).
  ["role-playing campaign for one player.", "role-playing campaign for a company of players, each with a character of their own."],
  ["(a drink barely touched stays where it was when the hero leaves; nothing «carried out» that the story did not carry); money handed to the hero to hold or pass on is recorded apart from his purse (an item named «held for <owner>», owned by the hero), never as his own coin.",
    "(a drink barely touched stays where it was when the character leaves; nothing «carried out» that the story did not carry); money handed to a character to hold or pass on is recorded apart from their purse (an item named «held for <owner>», owned by that character), never as their own coin."],
  ["upsert_character sheet with a reason for the hero;", "upsert_character sheet with a reason for that player character;"],
  // The tools (tools.ts).
  ["The player spends the hero's Heroic Inspiration: this roll rerolls that die of the hero's; the server spends it.", "A player spends their own character's Heroic Inspiration: this roll rerolls that character's die (actorRef that character); the server spends it."],
  ["A companion's attitude toward the hero as the hero could observe it now (not private thoughts).", "This person's attitude toward the player characters as they could observe it now (not private thoughts)."],
  ["Who receives the reward (claim_reward; default the hero).", "Who receives the reward (claim_reward; name the player character)."],
  ["when a character refused, bargained down or walked away from the hero this turn.", "when a character refused, bargained down or walked away from a player character this turn."],
  // Out-of-game answers (feedback.ts).
  ["what the hero may try, companions.", "what a player character may try."],
  ["anything the hero does not know.", "anything the characters do not know."],
  ["when this exchange settles a fact of the hero's story (the owner says what his hero said, did or is; you state a fact about the hero and the owner agrees)", "when this exchange settles a fact of a player character's story (the player says what their character said, did or is; you state a fact about the character and the player agrees)"],
  // The roll checker's note to the DM (roll-check.ts).
  ["The player declared these actions of the hero,", "The players declared these actions of their characters,"],
];

/** Word-level rewrites after the sentences, in order (the generic remainder: receipts, notes, the digest, the prep). */
const COMPANY_WORDS: readonly (readonly [RegExp, string])[] = [
  [/\bas the hero knows\b/g, "as the characters know"],
  [/\bas the hero sees it\b/g, "as the characters see it"],
  [/\bthe hero knows\b/g, "the characters know"],
  [/\bthe hero has met\b/g, "the characters have met"],
  [/\bthe hero does not know\b/g, "the characters do not know"],
  [/\bthe hero (only heard of it|may notice|met)\b/g, "the characters $1"],
  [/\bthe hero gets a fair warning\b/g, "the characters get a fair warning"],
  [/\bPublic knowledge of the hero\b/g, "Public knowledge of the player characters"],
  [/\bdefault the hero\b/g, "name the recipient"],
  [/\bthe player's hero\b/g, "a player character"],
  [/\bthe hero and (?:the )?companions\b/g, "the player characters"],
  [/\bthe hero or a companion\b/g, "a player character"],
  [/\bthe hero and the companions\b/g, "the player characters"],
  [/\bThe hero's\b/g, "A player character's"],
  [/\bthe hero's\b/g, "a player character's"],
  [/\bThe hero\b/g, "A player character"],
  [/\bthe hero\b/g, "a player character"],
  [/\b[Aa] hero's\b/g, "a player character's"],
  [/\b[Aa] hero\b/g, "a player character"],
  [/\bhero's\b/g, "player character's"],
  [/\bHero's\b/g, "Player character's"],
  [/\bhero\b/g, "player character"],
  [/\bHero\b/g, "Player character"],
  [/\bHERO\b/g, "PLAYER CHARACTER"],
];

const FRAME_END = "whatever they leave open is yours.";

/** The DM's text as a company table reads it: the sentences, then the words; the frame closes with the company's
 * paragraph (once). English only. */
export function companyText(text: string): string {
  let out = text;
  for (const [from, to] of COMPANY_SENTENCES) if (out.includes(from)) out = out.split(from).join(to);
  for (const [pattern, to] of COMPANY_WORDS) out = out.replace(pattern, to);
  if (out.includes(FRAME_END) && !out.includes(COMPANY_TABLE)) out = out.replace(FRAME_END, `${FRAME_END} ${COMPANY_TABLE}`);
  return out;
}

/** A player's own message (the story's words, never rewritten): the turn's input and an out-of-game question. */
const PLAYER_MESSAGE = /^(?:[^\n]*\n\n)?Player(?: \(out of game\))?: /;

const toolsets = new WeakMap<CompiledToolset, CompiledToolset>();
/** The toolset with every description rewritten (kept once per toolset, so the cached prefix stays byte-stable). */
export function companyToolset(toolset: CompiledToolset): CompiledToolset {
  const known = toolsets.get(toolset);
  if (known) return known;
  const rewrite = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(rewrite);
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, child]) =>
      [key, key === "description" && typeof child === "string" ? companyText(child) : rewrite(child)]));
  };
  const out = { tools: rewrite(toolset.tools), anthropic: rewrite(toolset.anthropic), openai: rewrite(toolset.openai) } as CompiledToolset;
  toolsets.set(toolset, out);
  return out;
}

function companyMessage(message: DmMessage): DmMessage {
  if (message.role === "user") return PLAYER_MESSAGE.test(message.text) ? message : { ...message, text: companyText(message.text) };
  if (message.role === "tool_results") return { ...message, results: message.results.map((row) => ({ ...row, output: companyText(row.output) })) };
  return message;
}

/** One DM request as a company table sends it: every system block but the story's own, the app's notes in the
 * conversation, the tool results and the tools' descriptions rewritten; the players' messages and the DM's own turns
 * as they are. */
export function companyRequest<T extends Pick<DmModelRequest, "system" | "messages" | "toolset">>(request: T): T {
  return { ...request,
    system: request.system.map((block: DmSystemBlock) => (block.story ? block : { ...block, text: companyText(block.text) })),
    messages: request.messages.map(companyMessage),
    toolset: request.toolset ? companyToolset(request.toolset) : request.toolset };
}

/** The opening's own paragraph at a company table (adventure-bootstrap-provider.ts `bootstrapInstructions`, its
 * «For opening» paragraph): the campaign's first scene addresses the company, no protagonist at its centre. */
export const COMPANY_OPENING = "For opening, use only the supplied setting, the player characters and the advisory Adventure guidance to propose the minimum present PUBLIC location, observable situation and necessary visible people/creatures. The player characters are the ones the Adventure's set-up names as player characters, alike — each played by their own player, none of them the main character; they already exist and are automatically present at the approved starting location. The actors array contains ONLY additional NEW visible non-player people/creatures. Never list a player character or recreate any established Entity/Actor. Consequential opening questions are only for facts genuinely required to establish this minimum playable public opening, never optional future story choices. Paid work, rumors, motives and causes may remain unknown and be discovered through play; do not force setup clarification when they can safely remain unknown. All proposed facts are campaign-authored setup, never external/source fact. NPC capabilities/limitations are ordinary descriptive public facts, not powers or evidence of hidden motives. Establish presence without relocating from an existing continuity; no elapsed time, knowledge grants, new quests, rewards or completed investigation. Do not choose any player character's speech, actions, beliefs, emotions or commitments. Narration presents the situation and open choices, never a predetermined route. Every person in the opening has a proper name (the owner reviews and may change it): never ask the owner what someone is called or how strong they are — decide it. People and places the Adventure's text states (who gave the job, who is where) appear as they are written there, with their names. The narration and every proposed text are written in the campaign language given in the context (Russian when it says ru); the narration gives every player character the same footing — each by name, none at the centre — and ends on the situation the company faces now — an open moment, a question in the air, something that asks for their next move — never on a summary or a farewell. A space station is not a medieval settlement. Missing consequential basis pauses for clarification, never a generic fantasy fallback.";

/** The opening's instructions and input at a company table: the «For opening» paragraph replaced, and the one record
 * the app keeps before the opening (the wizard's) left out of the input — fix A2: the opening reads the player
 * characters alike, as the Adventure's set-up names them, in the table's seat order (the app holds a single record until
 * the opening is committed). The server's own check reads its ticket as it was. */
export function companyOpening(instructions: string, context: Record<string, unknown>): { instructions: string; context: Record<string, unknown> } {
  const at = instructions.indexOf("For opening, use only");
  const rest = Object.fromEntries(Object.entries(context).filter(([key]) => key !== "protagonist"));
  return { instructions: at >= 0 ? `${instructions.slice(0, at)}${COMPANY_OPENING}` : companyText(instructions), context: rest };
}
