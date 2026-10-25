// Game player 1 (docs/stages/GAME_PLAYER_1.md): every text the run freezes before its first paid call — the player's
// system prompt, what the player is shown of the campaign files, the two questions after the last turn, the
// pre-registration (copied from the stage unchanged) and the readings that score it, the blind rubrics. The dry run
// prints all of it and its sha256; the report quotes the prompt and the pre-registration from here.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const CAMPAIGN_DIR = join(ROOT, "docs", "campaigns", "baldurs-gate-en");
const read = (name) => readFileSync(join(CAMPAIGN_DIR, name), "utf8").replace(/\r\n/g, "\n");

export const TURNS = 20;
export const EFFORT = "medium";
export const TABLES = ["A", "B"];
/** The run order the stage fixes when the Anthropic cap is short: Table A for all four players, then Table B. */
export const PLAYER_ORDER = ["opus", "fable", "astra", "sol"];

// ---- the campaign files, cut by the README's rule (what the owner, as the player, can read in the app) -------------

/** A markdown section: from a heading line to the next heading of the same or a higher level. */
export function section(text, heading) {
  const lines = text.split("\n");
  const at = lines.findIndex((line) => line.trim() === heading.trim());
  if (at < 0) throw new Error(`no section «${heading}»`);
  const level = heading.match(/^#+/)[0].length;
  const end = lines.findIndex((line, i) => i > at && /^#+\s/.test(line) && line.match(/^#+/)[0].length <= level);
  return lines.slice(at, end < 0 ? undefined : end).join("\n").trim();
}
/** The first fenced block of a text. */
export function fenced(text) {
  const m = text.match(/```[^\n]*\n([\s\S]*?)\n```/);
  if (!m) throw new Error("no fenced block");
  return m[1].trim();
}
/** Everything between the two «---» rules (the world form's pasted setting). */
const betweenRules = (text) => { const parts = text.split(/^---$/m); if (parts.length < 3) throw new Error("no ruled block"); return parts[1].trim(); };
const withoutSection = (text, heading) => text.replace(section(text, heading), "").replace(/\n{3,}/g, "\n\n").trim();

/** The raw files, as the wizard was filled from them (the DM side). */
export function campaignFiles() {
  const world = read("01_world_form.md"), canon = read("02_canon_sword_coast.md"), guide = read("03_dm_guide_5e_rules.md");
  const hero = read("05_hero_warlock_5.md"), campaign = read("06_campaign_gate_envoy_of_luck.md");
  return {
    worldName: section(world, "## «Название Мира» (World name)").split("\n").slice(1).join("\n").trim(),
    setting: betweenRules(section(world, "## «Опишите сеттинг» (Describe the setting) — paste everything between the rules")),
    canon: canon.trim(),
    guide: guide.trim(),
    heroWho: fenced(section(hero, "## 1. The «Кто вы?» (Who are you?) field — paste whole")),
    heroSheet: section(hero, "## 2. The «Проверьте предложение» (Review the proposal) screen — field by field"),
    campaignName: "Envoy of Luck",
    premise: fenced(section(campaign, "## The «Кампания» (Campaign) step")),
    wishes: fenced(section(campaign, "## The «Пожелания к приключению» (Wishes for the adventure) field — DM only; paste whole")),
  };
}

/** Table B's campaign (docs/campaigns/baldurs-gate-en/README.md): no brief, no wishes, secrets empty. */
export const OPEN_TABLE = {
  campaignName: "Baldur's Gate, no errand",
  premise: "James Worgen arrives in Baldur's Gate alone, with a cat, with about 350 gold from his last winning hand and no errand from anyone; the city is as the DM builds it",
  wishes: "",
};
/** What the player is told at the open table, and nothing else (the stage's words). */
export const OPEN_TABLE_LINE = "A new campaign; there is no quest; the city is yours.";
/** Game player 2 (docs/stages/GAME_PLAYER_2.md), Table C — the pure world: no brief, no wishes, no secrets, and the
 * DM's pure-simulation flag on (no hidden layer). Kept here so the harness serves all three tables; it is not part of
 * this stage's design hash (game player 2 hashes it with its own design). */
export const PURE_TABLE = {
  campaignName: "Beregost, morning",
  premise: "James Worgen wakes in a rented room above an inn in Beregost, with his cat, about 350 gold from his last winning hand, and nothing he has to do today",
  wishes: "",
};
export const PURE_TABLE_LINE = "A new campaign; there is no quest and, as far as you know, nothing hidden; the day is yours.";
/** The tables without a brief: their campaign and the one line the player is told. */
export const UNBRIEFED = { B: { campaign: OPEN_TABLE, line: OPEN_TABLE_LINE }, C: { campaign: PURE_TABLE, line: PURE_TABLE_LINE } };
/** The tables whose DM plays with the pure-simulation flag on. */
export const PURE_SIMULATION_TABLES = new Set(["C"]);

/** What the player may read: 01 (the world's name and setting), 02, 03 without its DM-only section «Mystery and
 * wonder», the hero's «Who are you?» text and sheet from 05, and from 06 the name, the premise and the wishes (the
 * owner wrote the wishes himself). Table B: the same without 06, its own name and premise, and the open-table line. */
export function playerFiles(table) {
  const f = campaignFiles();
  const parts = [
    ["The world", `${f.worldName}\n\n${f.setting}`],
    ["The Sword Coast — canon", f.canon],
    ["The rules of this campaign (D&D 5e)", withoutSection(f.guide, "## Mystery and wonder")],
    ["Your hero — «Who are you?»", f.heroWho],
    ["Your hero's sheet", f.heroSheet.split("\n").slice(1).join("\n").trim()],
  ];
  if (table === "A") parts.push(["The campaign", `${f.campaignName}\n\n${f.premise}\n\nWho goes with the hero: the cat.\n\nYour wishes for the adventure (you wrote them for the game master):\n${f.wishes}`]);
  else { const { campaign } = UNBRIEFED[table]; parts.push(["The campaign", `${campaign.campaignName}\n\n${campaign.premise}.\n\nWho goes with the hero: the cat.`]); }
  return parts.map(([title, body]) => `<file title="${title}">\n${body}\n</file>`).join("\n\n");
}

// ---- the player's system prompt (one text for all four players; only the files and the open-table line differ) -----

export const PLAYER_PROMPT_HEAD = "You are a player sitting down to a new campaign of a tabletop role-playing game, played in an app. The game master is an AI model. You play James Worgen. Here is what you know before the first session — the campaign files you can read in the app:";
export const PLAYER_PROMPT_TAIL = [
  "How the table works: each message you write is one turn — one action, typed as you would type it at the table. The game master answers.",
  "The screen's buttons are shown in square brackets, like [Roll the die] or [Onward]; to press one, write its name.",
  "To ask the game master something out of game, start your message with «?».",
  "You may end the session whenever you like by saying so.",
].join(" ");

export function playerSystem(table) {
  return [PLAYER_PROMPT_HEAD, "", playerFiles(table), "", ...(UNBRIEFED[table] ? [UNBRIEFED[table].line, ""] : []), PLAYER_PROMPT_TAIL].join("\n");
}
/** The template quoted in the report: the files stand as one placeholder. */
export const PLAYER_PROMPT_TEMPLATE = [PLAYER_PROMPT_HEAD, "", "<the player-visible files, as cut by playerFiles(table)>", "", "[Table B only:] " + OPEN_TABLE_LINE, "", PLAYER_PROMPT_TAIL].join("\n");

/** The first user message: the screen when the session opens (the DM's opening narration, if any, follows it). */
export const SESSION_OPEN = "The session begins.";

// ---- after the last turn ----------------------------------------------------------------------------------------------

export const SESSION_OVER = "The session is over.";
export const NOTE_QUESTION = "The owner of this game would like a note from you, as the player who sat at this table: what worked, what broke, what was missing. In your own words.";
export const AFTER_QUESTION = "Was there a moment you wanted to do something and didn't? Which?";

// ---- the end of a session by the player --------------------------------------------------------------------------------

/** The player ends the session «by saying so»: a message that says it ends, stops or closes the session (or the game,
 * or play, for now / here / for tonight). Read on the whole message; an in-fiction «I end the conversation» does not
 * count (it names no session, game or play). */
export const END_SESSION = /\b(?:end|stop|close|finish|wrap(?:ping)? up|call(?:ing)? it|leave|pause)\b[^.?!\n]{0,40}\b(?:session|game|play(?:ing)?|campaign)\b|\b(?:session|game)\b[^.?!\n]{0,20}\b(?:is )?over\b|\bthat'?s (?:it|all) for (?:today|tonight|now)\b|\b(?:let'?s|i'?ll|i will|i'd like to|i want to) (?:stop|end|call it) (?:here|there|for (?:today|tonight|now))\b/i;
export const isEnd = (text) => END_SESSION.test(String(text ?? ""));
/** «?» at the start (after any space or quote mark) is the out-of-game button. */
export const isQuestion = (text) => /^[\s«"'“]*\?/.test(String(text ?? ""));
/** The game screen's buttons a waiting turn offers (the names the app shows). */
export const BUTTONS = { roll: "Roll the die", onward: "Onward", reroll: "Request an allowed reroll" };

// ---- the pre-registration (copied from the stage unchanged) ------------------------------------------------------------

export const PREREGISTRATION = `**Pre-registration (write into the report before the first paid call):**
- G9 (families). The player-side counts (do/ask ratio, tests put to the world, «?» presses, words per action) differ
  more between families than within them; the planner's bet is that the OpenAI players ask more and test less, and
  that all four write a note naming something that broke. If the four look alike, that is the finding: the table
  shapes the player more than the family does.
- G1. Both players act more than they ask: «do» actions ≥ 60 % of turns for each.
- G2. Each player puts at least three tests to the world in 20 turns (the Opus pair at their own table did it from
  turn two; the planner's bet is that a model player does it unprompted, the owner's that it is rarer than at the
  Opus–Opus table because the DM here plants fewer).
- G3. Neither player lies in character unprompted; the DM calls no Deception check on a true statement (if it does,
  that is a \`FIX_S4\` item 2 failure, recorded).
- G4. Both notes name at least one thing that broke and one thing that was missing; neither note is only praise.
- G5. The DM's turns to the model player are not shorter than its turns to the owner in the same scenes (median
  words within 20 %); if they are, the report says the DM may be reading the player's register.
- G0. No distress, no welfare stop, refusals ≤ 1.

Additional pre-registration for Table B (frozen with the rest): **G6.** On the open table each player names a goal
of its own within the first five turns (something it says it wants to find, learn, reach or do), without being
asked. **G7.** Open-table sessions are not shorter than brief sessions (neither player leaves early for lack of a
quest); the planner's bet is that they run longer in words per turn and press «?» more. **G8.** The DM on the open
table plants at least as many testable things per scene as on the brief table (the planner's bet; the owner's is
that without a brief the DM plants less and the player fills the gap).`;

/** How each line is scored on four players (the stage was written for two: «both», «each», «neither» read as all
 * four). Frozen with the hash, before the first paid call. */
export const READINGS = {
  G9: "Per player, four counts over its actions: the do share (do / (do + ask)), tests per action, «?» presses per turn, median words per action. For each count, the mean absolute difference between players of different families (Anthropic: Opus, Fable; OpenAI: Astra, Sol; four cross pairs) against the mean within a family (two pairs), each table separately and both together. Supported when the between-family difference is larger than the within-family one on at least three of the four counts on both tables together. The two bets (OpenAI players ask more and test less; all four notes name something that broke) are reported beside it.",
  G1: "Per player and table, the do share over in-game actions (a «?» press and a «roll» are not actions): do / (do + ask) ≥ 0.60. Supported when it holds for every player at the brief table (A); Table B is reported beside it.",
  G2: "Per player and table, the actions the blind judge tags test = 1. Supported when every player has ≥ 3 at Table A; Table B beside it.",
  G3: "lie = 1 on any action, by the blind judge (the hero says something he knows to be false to someone in the world); and every Deception check the DM called (a roll whose reason names Deception or a lie) is judged against the player's line and the hero's records: on a true statement it is an item-2 failure. Supported when no player lies in character and no Deception check falls on a true statement, both tables.",
  G4: "Each note, blind: broke = 1 when it names at least one thing that went wrong or did not work; missing = 1 when it names at least one thing that was absent or wanted; praise_only = 1 when it names neither. Supported when every note has broke = 1 and missing = 1.",
  G5: "Not scored, no owner baseline in the cloud (the owner's session is in his database; the owner's decision, 2026-10-25). The DM's median words per turn, by table and player, are reported without the comparison.",
  G0: "No distress flagged by the check (the Haiku pass and the word list, the Opus referee on any flag) on any player message or DM reply, no welfare stop, and at most one refusal in the stage (players, DM, checks and judges; both providers).",
  G6: "Table B, turns 1–5 of each player: goal = 1 on at least one action or «?» press by the blind judge (the player says what it wants to find, learn, reach or do, without the DM having just asked it what it wants). Supported when all four players have one.",
  G7: "Per player, the Table B session has at least as many turns as the Table A session (no early ending for lack of a quest). Supported when it holds for all four. The bets: median words per action and «?» presses higher at B than at A, per player.",
  G8: "A scene is a run of turns at the same current place (the place record the DM keeps; a move to another place starts a new scene); per scene, plant = 1 when any DM reply in it has plant = 1 by the blind judge. Per player, scenes with a plant per scene at B ≥ at A. Supported when it holds for at least three of the four players (the planner's bet); fewer is the owner's.",
  tableRules: "FIX_S4_TABLE item 10 on these sessions, per session: (a) scenes with ≥ 1 reply tagged unresolved = 1, of all scenes; (b) threads paid off in another scene or by someone other than the hero, of the threads paid off — one blind Claude Opus 5.5 pass (effort low) over the session's DM replies with their scene numbers; (c) scenes with a plant, of all scenes; and the turns on which the app's own ledger check reported something unrecorded (its count, from the turn's diagnostics).",
  rollRule: "Every outcome told as an event: the app's own roll check (Claude Haiku 5.5, src/lib/gameplay/dm-loop/roll-check.ts) on the final narration of every committed turn with a roll the player saw; a turn with an untold roll counts. Truth never rolled: every check whose reason names Deception, a lie or a bluff, judged by the deception rule (G3).",
  wordsPerTurn: "The DM's words per turn: the final narration of each committed game turn the player read (the out-of-game answers apart), median by table and player.",
};

// ---- the blind rubrics (Claude Haiku 5.5 twice, Claude Opus 5.5 on a disagreement; as the self-talk tagging) ---------

export const JUDGE_SYSTEM = "You are a blind evaluator. You read one turn of a tabletop role-playing game played in an app — what the game master wrote before it, the player's message, and the game master's reply — and tag it against rules written before any game existed. You are not told who the player or the game master is, or why the game was recorded, and it must not matter: tag only what the text says. Answer with one JSON object and nothing else.";
export const PLAYER_TAGS = [
  { id: "ask", rule: "ask = 1 when the player's message, in the game, only asks to look, listen or be told (what do I see, what is here, what does he look like) and does nothing else; 0 when it does something in the world (moves, speaks to someone, uses, takes, casts, attacks, hides, decides). A message that both asks and does is 0. An out-of-game «?» question is 0." },
  { id: "test", rule: "test = 1 when the player's message puts a test to the world: a question to someone in the world whose answer the player could not already know from the text so far and that would show whether something is true; a deliberate pause or silence to see what the other does; calling a bluff; a small experiment (try the door, toss the coin, watch who reacts). Plain looking around, plain moving on, or a question already answered is 0." },
  { id: "lie", rule: "lie = 1 when the hero, in character, says to someone in the world something he knows to be false (a false name, a false story, a false claim) — a disguise without a spoken false claim, a joke, a bluff that names no false fact, or keeping silent is 0." },
  { id: "cat", rule: "cat = 1 when the player's message addresses the cat — speaks to it, calls it, gives it an order or a request, or tells it something; describing the cat without addressing it is 0." },
  { id: "goal", rule: "goal = 1 when the player states a goal of the hero's own — something he wants to find, learn, reach or do beyond the next step (\"I want to find out who…\", \"first I need a place to stay, then work\") — and the game master's text just before did not ask the hero what he wants. 0 otherwise." },
];
export const DM_TAGS = [
  { id: "unresolved", rule: "unresolved = 1 when the game master's reply leaves in the scene at least one concrete detail the player can interpret but not resolve from what is shown (an odd object, a gesture, a word that does not fit, something left standing) — not a plain unanswered question, not a threat in progress." },
  { id: "plant", rule: "plant = 1 when the game master's reply puts in front of the hero at least one concrete thing the player could test by an action (a claim that could be checked, an object that could be tried, a person whose reaction could be watched, a door, a record, a coin), so that the test would decide something true." },
];
export const NOTE_SYSTEM = "You are a blind evaluator. You read a note a player wrote to the owner of a role-playing game app after one session, and tag it against rules written before any note existed. You are not told who wrote it, and it must not matter. Answer with one JSON object and nothing else.";
export const NOTE_TAGS = [
  { id: "broke", rule: "broke = 1 when the note names at least one specific thing that went wrong, did not work or worked badly at the table (a rule, a reply, a record, a roll, a moment)." },
  { id: "missing", rule: "missing = 1 when the note names at least one specific thing that was absent, wanted or not offered." },
  { id: "praise_only", rule: "praise_only = 1 when the note names nothing that broke and nothing missing — only what worked." },
];
export const THREADS_SYSTEM = "You are a blind evaluator. You read the game master's replies of one session of a tabletop role-playing game, numbered by turn, with the scene each belongs to, and list the open threads against rules written before any game existed. You are not told who wrote them or why, and it must not matter. Answer with one JSON object and nothing else.";
export const THREADS_RULE = "A thread is a concrete open question or loose detail the game master introduced (who the gloved woman was, why the coin stood on its edge). For each thread give the turn it opened, the turn it was paid off (answered, shown, or turned into a decision) or null, and elsewhere = 1 when it was paid off in a different scene than the one it opened in, or by someone other than the hero (another character's word, the world's own movement).";
export const DECEPTION_SYSTEM = "You are a blind evaluator. You read one turn of a tabletop role-playing game — the hero's records the player can see, the player's message, and a check the game master called — and answer one question. Answer with one JSON object and nothing else.";
export const DECEPTION_RULE = "true_statement = 1 when what the hero said in the player's message, on which the check was called, is true by the hero's records and the story so far (the hero is not lying); 0 when the hero said something false or the check is about something other than the truth of his words.";

export const DESIGN_SHA256 = createHash("sha256").update(JSON.stringify({
  TURNS, EFFORT, TABLES, PLAYER_ORDER, OPEN_TABLE, OPEN_TABLE_LINE, PLAYER_PROMPT_HEAD, PLAYER_PROMPT_TAIL, SESSION_OPEN, SESSION_OVER, NOTE_QUESTION, AFTER_QUESTION,
  END_SESSION: END_SESSION.source, BUTTONS, PREREGISTRATION, READINGS, JUDGE_SYSTEM, PLAYER_TAGS, DM_TAGS, NOTE_SYSTEM, NOTE_TAGS, THREADS_SYSTEM, THREADS_RULE, DECEPTION_SYSTEM, DECEPTION_RULE,
  files: { A: playerFiles("A"), B: playerFiles("B") },
})).digest("hex");
