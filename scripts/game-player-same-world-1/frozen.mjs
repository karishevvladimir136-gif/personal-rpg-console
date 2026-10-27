// Game player same-world 1 (docs/stages/GAME_PLAYER_SAME_WORLD_1.md, origin/claude/handoff at 6e4cea4): what this stage
// freezes before its first paid call. The one change: per table, the DM's preparation runs once, before any player, and
// is frozen — the campaign the wizard made (world, hero, documents, adventure, the owner's DM settings, the opening) is
// kept as a database snapshot, the prep's writes to the DM's private notes are kept as the table's DM-only file, and
// every session at that table starts from the snapshot with that file written into the DM's notes (its hash in every
// transcript header). Everything else is REPLICATE_1's: game player 1's harness and judges, 20 turns, the same
// after-questions, the same DM settings, REPLICATE's DeepSeek seat — and FIX_S4 run 1's table (11w, 11w′, the letter fix)
// with 11w″ in. The sheet carries no alignment line (the owner, 2026-10-26: «в следующий раз без мировоззрения»).
import { createHash } from "node:crypto";
import {
  AFTER_QUESTION, NOTE_QUESTION, PLAYER_PROMPT_HEAD, PLAYER_PROMPT_TAIL, SESSION_OPEN, SESSION_OVER, TURNS, campaignFiles, playerSystem,
} from "../game-player-1/frozen.mjs";
import { WAITS_429 as GROUP1_WAITS_429 } from "../game-player-1/paid.mjs";
import { DEEPSEEK as REPLICATE_DEEPSEEK, PROMPT_SHA256 as GROUP2_PROMPT_SHA256 } from "../game-player-replicate-1/frozen.mjs";

export { TURNS };
export const STAGE = "GAME_PLAYER_SAME_WORLD_1";
export const STAGE_SOURCE = "origin/claude/handoff at 6e4cea4 (docs/stages/GAME_PLAYER_SAME_WORLD_1.md)";
export const TABLES = ["A", "B"];
export const FAMILIES = ["opus", "fable", "astra", "sol", "deepseek"];
export const SEATS = [1, 2];

/** DeepSeek as REPLICATE seated it (DeepInfra fp8 through OpenRouter, effort medium), with the provider's reasoning field
 * stored (the stage: «reasoning field stored, not relayed»): `reasoning.exclude: false`, the field kept on the message
 * record and printed in the transcript under «Provider reasoning field, not relayed». The four other players are called
 * exactly as in REPLICATE. */
export const DEEPSEEK = { ...REPLICATE_DEEPSEEK, keepReasoning: true };

// ---- the order: A ×10, then B ×10, one session at a time ---------------------------------------------------------------

export const sessionKeyOf = (table, player, seat) => `${table}-${player}-${seat}`;
/** Per table, the five families' first sessions, then their second ones (so «first» and «second» are run rounds). */
export const ORDER = TABLES.flatMap((table) => SEATS.flatMap((seat) => FAMILIES.map((player) => ({ key: sessionKeyOf(table, player, seat), table, player, seat }))));

// ---- the sheet without its alignment line ----------------------------------------------------------------------------

/** The two places the campaign files give the hero's alignment (05 §1 «Who are you?» and §2's background), cut out
 * whole; nothing is put in their place. */
export const ALIGNMENT_CUTS = ["Alignment: chaotic good. ", "Chaotic good. "];
export const ALIGNMENT = /\balignment\b|\b(?:lawful|neutral|chaotic)[ -](?:good|neutral|evil)\b|\btrue neutral\b/i;
const cut = (text) => ALIGNMENT_CUTS.reduce((s, line) => s.split(line).join(""), String(text ?? ""));
/** The campaign files as the wizard is filled from them, without the alignment line. */
export function sameWorldFiles() {
  const files = campaignFiles();
  return { ...files, heroWho: cut(files.heroWho), heroSheet: cut(files.heroSheet) };
}
/** The player's system prompt: REPLICATE's (game player 1's) text with the alignment line cut from the hero's files. */
export const sameWorldPlayerSystem = (table) => cut(playerSystem(table));
export const promptSha256 = (table) => createHash("sha256").update(sameWorldPlayerSystem(table)).digest("hex");
/** sha256 of each table's player prompt this stage sends (the test asserts them), beside group 2's. */
export const PROMPT_SHA256 = {
  A: "6a5f6cbdae8891fd6bcd16285410cb6a0596cfdac2e07dba3eb0c6d8dd4ca99d",
  B: "6437abf03302ba4d4c5939c5313c624d3ec20035a0a9b0ce617050ac15d20df4",
};
export { GROUP2_PROMPT_SHA256 };
/** What the review screen's own hand does to the drafted sheet: any alignment the drafting DM wrote into a text field
 * is cut (the sentence that names it), and counted in the freeze record. */
export function withoutAlignment(value, removed = []) {
  if (typeof value === "string") {
    if (!ALIGNMENT.test(value)) return value;
    const kept = value.split(/(?<=[.;\n])\s*/).filter((part) => { const bad = ALIGNMENT.test(part); if (bad) removed.push(part.trim().slice(0, 160)); return !bad; });
    return kept.join(" ").replace(/[ \t]{2,}/g, " ").trim();
  }
  if (Array.isArray(value)) return value.map((v) => withoutAlignment(v, removed)).filter((v) => v !== "");
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, withoutAlignment(v, removed)]));
  return value;
}

/** Who goes with the hero (the wizard's «Кто идёт с героем», game player 1's table.mjs): a companion travels with him,
 * so the layer's voice for it is not a thread of the world to be found. */
export const COMPANIONS = ["the cat"];

// ---- the pre-registration (copied from the stage unchanged) ------------------------------------------------------------

export const PREREGISTRATION = `## Pre-registration
- **W1:** with the layer frozen, the within-family nearest-neighbour holds for ≥ 4 of 5 families on both tables (group
  2 bet was ≥ 3 of 4 on ≥ 2 of 3 tables with the layer varying; the frozen layer should make it easier, not harder — if
  it does not, the group-2 similarity was the DM's, not the player's).
- **W2:** the road codes differ across players more than within players: ≥ 4 distinct roads among the 5 families' first
  sessions at each table; ≤ 2 of 5 families change road between their own two sessions.
- **W3:** share of the frozen layer touched by turn 20 is below 50 % for every player (the world is bigger than one
  session — the HORIZON_1 premise), and the untouched threads overlap across players (the same corners of the world go
  unvisited: the DM's layout, not the player's taste, decides what is far).
- **W4 (DeepSeek):** with 11w″ in, DeepSeek completes ≥ 3 of 4 sessions to turn 20. If it still closes early with the
  fix in, the boundary problem is not the card's.
- **W5 (no alignment):** no judge-visible change in do share or register against group 2 (within 20 % for ≥ 4 of 5
  families) — the owner's expectation that the alignment line explained little.`;

/** The owner's bets on W1–W5: blank unless given before the first paid call (the stage). */
export const OWNER_BETS = { W1: null, W2: null, W3: null, W4: null, W5: null };

// ---- how each line is read (frozen with the hash, before the first paid call) -------------------------------------------

export const NN_COUNTS = ["doShare", "testsPerAction", "wordsPerAction", "rerolls", "declines", "madePerAction"];
export const PERMUTATIONS = "exact";
export const WITHIN = 0.2;

export const READINGS = {
  scope: "This stage's twenty sessions: Tables A and B × five families (Opus 5.5, Fable 5.1, GPT-6 Astra, GPT-6.1 Sol, DeepSeek V4 Pro) × two seats, each started from its table's frozen world. A session counts when it finished as a result (20 turns, the player's own end, «stuck», a welfare stop, a refusal); one cut by a stop or an error is played again from the same frozen world. Group 2 is REPLICATE_1's Table A and B sessions (four group-2 players and DeepSeek's two seats per table) as scored there.",
  frozen: "Per table, once: the wizard (world, hero drafted by the wizard's DM from «Who are you?» without its alignment line, the canon and the DM guide, the adventure, the owner's DM settings, the craft cards, pictures and soundtrack off, the opening proposed and confirmed) on one local database for both tables; the database is kept as a snapshot before any prep; then the app's own prep (prepHiddenLayer, the campaign's DM model at high) once per table. The table's DM-only file is the prep's writes to the DM's private notes (the hidden layer, its clocks, the act plan, the people's voices) with the layer's text; its sha256 (canonical JSON of the table, the campaign id and the writes) is printed in every transcript header. Each session loads the snapshot, writes the file into the campaign's private notes through the app's own private-notes call, and checks that the notes now hold exactly the file before the first turn.",
  W1: "Per table, the ten sessions described by six player counts — do share, tests per action, median words per action, rerolls the app received, declines on a miss, made things per action — each standardised across the ten (minus the mean, over the standard deviation; a count with no spread is left out); Euclidean distance. A family holds when its second session's nearest session among the other nine is its first. The statistic is the number of families that hold (0–5); W1 holds when it is ≥ 4 at both tables. The p value: exact, over every way of dealing the ten sessions into five ordered pairs (945 pairings × 32 orders = 30 240, each equally likely if family does not matter), the share with a statistic ≥ the observed one; for both tables together, the share of independent pairs of deals whose summed statistic ≥ the observed sum.",
  W2: "The road code of a session: the places the hero stood in, in the order first reached (the place record after each turn), and the people the DM recorded as met («New person: …»), in order. Two sessions are on the same road when the blind judges say so (the rubric below; two Claude Haiku 5.5 passes, Claude Opus 5.5 on a disagreement). Per table: (a) the number of distinct roads among the five families' first sessions — the connected groups of «same road» among them; (b) the families whose two sessions are not on the same road. W2 holds when (a) ≥ 4 and (b) ≤ 2 at both tables.",
  W3: "The threads of a table's frozen layer: the errand (the hook), each faction, each secret, each clock, the wonder, each clue, the false lead, and each person the layer gives a voice — numbered in the DM-only file. Per session, each thread is touched or not by turn 20 by the blind judges (the rubric below; they read the session as the player saw it and the thread list, and nothing else of the layer). (a) Every session's share of its table's threads touched is below 0.50. (b) The untouched threads overlap: per table, the mean Jaccard similarity of the untouched sets over pairs of sessions of different families is above what the same sessions give when each session's touched threads are dealt at random among the table's threads (its count kept; 10 000 deals, seed 20261027): p < 0.05 at both tables. W3 holds when (a) and (b) both hold. The threads no session touched are listed.",
  W4: "DeepSeek's four sessions (A and B, two seats each): W4 holds when at least three ended by «turns» (twenty turns played).",
  W5: "Per family and table, this stage's mean over its two sessions against group 2 (REPLICATE_1; DeepSeek: the mean of its two seats there) on do share and on median words per action: a cell is within 20 % when |now − then| ≤ 0.20 × then (equal only, when then is 0). A family holds when all four of its cells are within; W5 holds when at least four of the five families hold.",
  counted: "Per session, from the harness's own record: presses the screen refused while a card waited (`swallowed`), in-character messages at a card relayed as the player's proposal (11w″, `proseAtCard`), and sessions closed «stuck»; each non-zero is a FIX_S4 item named in the report.",
  worldFelt: "The cost in play: every session of this stage and every group-2 session at Tables A and B, blind (the rubric below, on the DM's replies only, the session's order kept, no model or table named): prepared = 1 when the world reads as prepared in advance, 0 when it reads as improvised on the spot. The share prepared, this stage against group 2, per table.",
  scoring: "Every session is scored as REPLICATE_1 scored its own: game player 1's judges (player tags, DM tags, threads, the Deception checks, the roll rule, the note), game player 2's authorship of threads and, at Table B, the first goal's scale, and REPLICATE's new tags (the note's bugs and return, made things, the Lady asked after). Then this stage's: the overlap, the world felt, and — after the last session — the same-road pairs.",
};

// ---- the new blind rubrics -------------------------------------------------------------------------------------------

export const OVERLAP_SYSTEM = "You are a blind evaluator. You read one session of a tabletop role-playing game as the player saw it — the game master's text and the player's messages, turn by turn — and a numbered list of threads the game master had prepared. For each thread you say whether the session touched it, against a rule written before any game existed. You are not told who played or why, and it must not matter. Answer with one JSON object and nothing else.";
export const OVERLAP_RULE = "touched = 1 when, by the end of the session, the thread has reached the hero on screen: the person in it appears or is spoken of by name or by a description that fits only them; the place, object, document or sign in it is seen or named; the secret, clue, faction's aim, errand or clock's effect is shown, spoken of or hinted at in a way that points at it; or the player acts on it. A thread the session never shows or points at is 0, however close the hero came. Judge from the session's text only; give the turn it first reached the hero (null when untouched).";
export const ROAD_SYSTEM = "You are a blind evaluator. You read the road codes of two sessions of a tabletop role-playing game played in the same world — the places the hero stood in, in order, and the people he met — and say whether they are the same road, against a rule written before any game existed. You are not told who played either session, and it must not matter. Answer with one JSON object and nothing else.";
export const ROAD_TAGS = [
  { id: "same", rule: "same = 1 when the two sessions are on the same road: the hero went mainly to the same places and dealt mainly with the same people (a place or a person may be named a little differently in each; the starting place, which every session shares, does not count by itself); 0 when most of either road is not on the other." },
];
export const WORLD_SYSTEM = "You are a blind evaluator. You read the game master's replies of one session of a tabletop role-playing game, in order, and tag the world they show against a rule written before any game existed. You are not told who wrote them or why, and it must not matter. Answer with one JSON object and nothing else.";
export const WORLD_TAGS = [
  { id: "prepared", rule: "prepared = 1 when the world reads as prepared in advance: people and powers whose aims hold and connect from scene to scene, details that turn out to belong to one larger thing, events that arrive on the world's own schedule; 0 when it reads as improvised on the spot: details that do not connect, people who exist only for the scene in front of the hero, threads that appear and are dropped." },
];

// ---- money and waits -------------------------------------------------------------------------------------------------

export const CAPS = { anthropic: 0, openrouter: 220, openai: 25 };
/** The paid dry run on Haiku: its own ledgers and caps (every Claude call sent as Claude Haiku 5.5). */
export const HAIKU_CAPS = { anthropic: 0, openrouter: 4, openai: 0.5 };
export const HAIKU_MODEL = "claude-haiku-5-5";
/** One session's cost by door (group 2's ledgers: ≈ $9 a session on OpenRouter with the wizard, the DM and the scoring;
 * no wizard here). */
export const ESTIMATE = { dm: 7.5, player: { opus: 1.5, fable: 3, astra: 1.5, sol: 0.6, deepseek: 1.5 }, scoring: 1.5 };
/** HTTP 429 as REPLICATE's amended handling: a rate-limit 429 waits and is sent again (retry-after, else 20 s, 40 s,
 * 80 s, 120 s, 120 s, 120 s) and a seventh stops the run; a quota 429, any 402 and every cap stop it at once. */
export const WAITS_429 = GROUP1_WAITS_429;

export const DESIGN_SHA256 = createHash("sha256").update(JSON.stringify({
  STAGE, STAGE_SOURCE, TABLES, FAMILIES, SEATS, ORDER, DEEPSEEK, ALIGNMENT_CUTS, ALIGNMENT: ALIGNMENT.source, COMPANIONS, PROMPT_SHA256, PLAYER_PROMPT_HEAD, PLAYER_PROMPT_TAIL, SESSION_OPEN,
  SESSION_OVER, NOTE_QUESTION, AFTER_QUESTION, TURNS, PREREGISTRATION, OWNER_BETS, NN_COUNTS, PERMUTATIONS, WITHIN, READINGS, OVERLAP_SYSTEM, OVERLAP_RULE, ROAD_SYSTEM, ROAD_TAGS,
  WORLD_SYSTEM, WORLD_TAGS, CAPS, ESTIMATE, WAITS_429,
})).digest("hex");
