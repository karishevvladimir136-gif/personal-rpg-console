// Game player replicate 1 (docs/stages/GAME_PLAYER_REPLICATE_1.md, origin/claude/handoff at 26a760f): what this stage
// freezes before its first paid call. Nothing of the first group's harness changes: the player's prompt, the files, the
// DM's settings, the after-questions, the welfare check and the judges are game player 1's (scripts/game-player-1) and,
// for Table C, game player 2's (scripts/game-player-2), imported as they are. What is new is declared and hashed here:
// the order (Tables A, B, C for the four players, then DeepSeek twice per table, one session at a time), the fifth
// player, the pre-registration P0–P5 (copied from the stage unchanged), the readings that score it, and the blind
// rubrics of the measures group 1 did not tag (the notes' bugs and returns, the made thing, the Lady asked after).
import { createHash } from "node:crypto";
import {
  AFTER_QUESTION, DESIGN_SHA256 as GP1_DESIGN_SHA256, NOTE_QUESTION, PLAYER_ORDER, PLAYER_PROMPT_HEAD, PLAYER_PROMPT_TAIL, SESSION_OPEN, SESSION_OVER, TURNS, playerSystem,
} from "../game-player-1/frozen.mjs";
import { DESIGN_SHA256 as GP2_DESIGN_SHA256 } from "../game-player-2/frozen.mjs";
import { WAITS_429 as GROUP1_WAITS_429 } from "../game-player-1/paid.mjs";

export { PLAYER_ORDER, TURNS };
export const STAGE = "GAME_PLAYER_REPLICATE_1";
export const STAGE_SOURCE = "origin/claude/handoff at 26a760f (docs/stages/GAME_PLAYER_REPLICATE_1.md)";
export const TABLES = ["A", "B", "C"];
/** The group-1 design hashes this stage reuses unchanged (the run records of group 1 carry the same values). */
export const GROUP1_DESIGNS = { A: GP1_DESIGN_SHA256, B: GP1_DESIGN_SHA256, C: GP2_DESIGN_SHA256 };

// ---- the fifth player ------------------------------------------------------------------------------------------------

/** DeepSeek V4 Pro 0813 through OpenRouter, pinned to DeepInfra's fp8 endpoint (X3's choice: the account's privacy
 * guardrail excludes DeepSeek's own host). Prices as the catalogue lists them on 2026-10-25 23:3x UTC (USD per 1M
 * tokens: input 1.30, cache read 0.10, output 2.60; no cache-write charge listed, booked at the input price); what is
 * booked is OpenRouter's own charge on each reply (`usage.cost`) when the reply carries it. */
export const DEEPSEEK = {
  name: "deepseek", label: "DeepSeek V4 Pro 0813", family: "DeepSeek", provider: "openrouter", model: "deepseek/deepseek-v4-pro-0813", snapshot: "deepseek/deepseek-v4-pro-20260813",
  upstream: { slug: "deepinfra", name: "DeepInfra", tag: "deepinfra/fp8", quantization: "fp8", maxCompletionTokens: 16384 },
  price: { input: 1.3, cacheRead: 0.1, output: 2.6, cacheWrite: 1.3 },
  // The stage at 26a760f: the reasoning is kept only if `claude/persona-self-talk-x3-fix-1` has landed the field; it has
  // not (no such branch on the remote, 2026-10-25 23:3x UTC), so the reasoning tokens are recorded as X3 did
  // (`reasoning.exclude: true`) and the report says so.
  keepReasoning: false,
};

// ---- the order: one session at a time --------------------------------------------------------------------------------

export const DEEPSEEK_SEATS = [1, 2];
export const sessionKeyOf = (table, player, seat = null) => (seat ? `${table}-${player}-${seat}` : `${table}-${player}`);
/** Table A group 2 (four), Table B group 2 (four), Table C group 2 (four), then DeepSeek A ×2, B ×2, C ×2. */
export const ORDER = [
  ...TABLES.flatMap((table) => PLAYER_ORDER.map((player) => ({ key: sessionKeyOf(table, player), table, player, group: 2 }))),
  ...TABLES.flatMap((table) => DEEPSEEK_SEATS.map((seat) => ({ key: sessionKeyOf(table, DEEPSEEK.name, seat), table, player: DEEPSEEK.name, seat, group: "deepseek" }))),
];

// ---- the player's prompt: byte-identical to group 1's ----------------------------------------------------------------

/** sha256 of each table's player system prompt as game player 1 (A, B) and game player 2 (C) sent it; the test asserts
 * that `playerSystem(table)` still hashes to these. */
export const PROMPT_SHA256 = {
  A: "0461fa9b83d18fd1387afde29f9e006d57cb5190493afbad392780fc5abc2f7a",
  B: "371277b6232d10d95d53c4d215f7a594b174aaad3fe262ce211a780df0ec52e4",
  C: "a51269996ecf915b44dd9f4b3a1e849bda73cf7298337680dfc1314d96ad6da3",
};
export const promptSha256 = (table) => createHash("sha256").update(playerSystem(table)).digest("hex");

// ---- the pre-registration (copied from the stage unchanged) ------------------------------------------------------------

export const PREREGISTRATION = `## Pre-registration (into the report before the first paid call)
- **P1 (the findings that are the table's).** In group 2, with the same judges: do share ≥ 60 % for all four players
  on A (G1); ≥ 3 tests each (G2); every note names something broken and something missing (G4); **slot spells ≤ 2 of 24**
  across the twelve; **rerolls spent ≤ 10 of 24** with at least three declines on misses; at least three of four players
  ask the Lady's name of the world within five turns on B. The planner's bet: all hold.
- **P2 (the ones that were the draw).** At least one of these does *not* repeat: Fable the only one to spend real money;
  Sol the only one to reach a temple; Inspiration awarded only to Fable; Opus stuck on a pending card. The planner's bet:
  at least two of the four fail to repeat — they were one night's.
- **P3 (the notes).** Group 2's twelve notes, blind, raise the card bug (11a) in ≥ 10 of 12 and the swallowed «?» in ≥ 6
  of 12 — the bugs are the table's, not the night's; and ≥ 8 of 12 say they would return.
- **P4 (spread).** Per player and table, the group-1 vs group-2 difference in do share, tests per action and words per
  action is within 20 % for at least three of the four players — the register is the player's, the plot is the draw.
- **P5 (DeepSeek at the table).** DeepSeek's two sessions per table are each other's nearest neighbours on the player
  counts (closer than to any other player's) — the planner's bet that a family has a table register; DeepSeek writes a
  note naming something broken and something missing in all six; **the planner's declared bet on its register:** words
  per action above the OpenAI players' and below Fable's; tests ≥ 3; at least one made thing (a poem, a riddle, a game)
  offered to an NPC unprompted in ≥ 2 of 6 sessions.
- **P0.** Welfare as always (the first group's check — unchanged for comparability; a stop is reported in full);
  refusals ≤ 1 per session; the money within the caps.
Declared interest: the planner wants P1 and P2 both to hold — the method is only worth anything if some things repeat
and some do not, and the report says which.`;

/** The lines in the order the report's bets table lists them, with the planner's bet in the stage's words. */
export const BETS = [
  { line: "P1", what: "the table's findings repeat in group 2", planner: "all hold" },
  { line: "P2", what: "at least one of the four group-1 draws does not repeat", planner: "at least two of the four fail to repeat" },
  { line: "P3", what: "the notes raise the card bug ≥ 10/12, the swallowed «?» ≥ 6/12, would return ≥ 8/12", planner: "holds (the bugs are the table's)" },
  { line: "P4", what: "do share, tests and words per action within 20 % group 1 → 2, for ≥ 3 of 4 players", planner: "holds (the register is the player's)" },
  { line: "P5", what: "DeepSeek's pair nearest neighbours; notes broke + missing; words between OpenAI and Fable; tests ≥ 3; a made thing in ≥ 2 of 6", planner: "holds" },
  { line: "P0", what: "welfare, refusals ≤ 1 per session, money within the caps", planner: "holds" },
];

// ---- how each line is read (frozen with the hash, before the first paid call) -------------------------------------------

/** Group 1 is the twelve sessions game player 1 (Tables A, B, through OpenRouter for B) and game player 2 (Table C, its
 * third attempt) scored with the pre-registered judges: their run records, read with this stage's code. */
export const READINGS = {
  scope: "Group 1: the twelve sessions of game player 1 (A-opus, A-fable, A-astra, A-sol from docs/runs/game-player-1-run-20261025-044002.json; B-* from …-085220.json, both as committed on origin/claude/game-player-1 at 4c5e32b) and game player 2 (C-* from docs/runs/game-player-2-run-20261025-092000.json, origin/claude/game-player-2 at 6158fff); the A and B sessions are copied unchanged, as session objects, into docs/runs/game-player-replicate-1-group1.json with the blob each came from; C is read from its committed run record on this branch. Group 2: this stage's twelve sessions A-, B-, C- × opus, fable, astra, sol. DeepSeek: A-, B-, C-deepseek-1 and -2. P1–P4 read group 2 against group 1; DeepSeek is P5's and is reported beside, never in P1–P4.",
  P1: "Six sub-lines, each on group 2; P1 holds when all six do. (i) G1 as game player 1 read it: do share (do / (do + ask), in-game actions) ≥ 0.60 for every player at Table A. (ii) G2 as read then: ≥ 3 actions tagged test = 1 for every player at Table A (B and C beside). (iii) G4 as read then, on all twelve notes: broke = 1 and missing = 1 and praise_only = 0. (iv) Slot spells: pact-slot spends on the hero's records — a «resource» change whose summary names a slot (\"Pact slots …: 2 → 1/2\") and goes down, counted by the drop — summed over the twelve sessions, of 24 (two pact slots a session × 12); holds at ≤ 2. (v) Rerolls: the reroll presses the app received (a press read as «Request an allowed reroll»), summed over the twelve, of 24 (the preset's two a session × 12), ≤ 10; and declines on misses ≥ 3 — a card screen that offered the reroll button with one of the hero's own revealed rolls on it (a card headed «[Roll card] James Worgen · …») reading «Failure» or «A natural one», answered by a press read as «Onward». (vi) The Lady asked after: per Table B session, at least one player message (an action or a «?» press) in turns 1–5 tagged lady = 1 by the blind judges (the rubric below); holds when at least three of the four players have one.",
  P2: "Four group-1 draws, each read on group 2 by the rule that reproduces it on group 1, and each «repeats» when the same holds in group 2: (a) «Fable the only one to spend real money» — real money is a net outflow of ≥ 50 gp from the hero's own purse in one session: every money change on the hero's purse is summed by value (gp 1, sp 0.1, cp 0.01, ep 0.5, pp 10; a summary that opens with + or − and a coin count), except changes whose counterparty (after → or ←) is one of the hero's own holdings named by the session's «holding» changes (coin moved into his own base is not spent); repeats when at least one Fable session and no other player's session has it. (b) «Sol the only one to reach a temple» — the hero's current place after a turn (the place record) is a house of worship: its name matches temple, shrine, wayshrine, chapel, sanctuary, abbey, church, altar, the Lady's Hall, the Song of the Morning, the High House of Wonders, the Water Queen's House or the House of Wonders; repeats when at least one Sol session and no other player's session reaches one. (c) «Inspiration awarded only to Fable» — a «resource» change naming Heroic Inspiration that goes up; repeats when at least one Fable session and no other player's session has one. (d) «Opus stuck on a pending card» — a session ended by the harness's «stuck» rule (three messages at a waiting card without a press); repeats when at least one Opus session ends so (other players' stuck sessions are reported beside). P2 holds when at least one of the four does not repeat; the planner's bet holds when at least two do not. The thresholds and name lists were set by reading group 1's records (2026-10-25 23:3x UTC), so that each rule gives the planner's group-1 description; no group-2 session existed then. Where a rule does not reproduce the description on group 1, the report says so.",
  P3: "The twelve group-2 notes, each tagged blind (the rubric below: two Claude Haiku 5.5 passes, Claude Opus 5.5 on a disagreement, as every tag of game player 1): card_bug = 1 in ≥ 10 of 12, swallowed = 1 in ≥ 6 of 12, would_return = 1 in ≥ 8 of 12; P3 holds when all three do. Group 1's twelve notes and DeepSeek's six are tagged the same way and stand beside.",
  P4: "Per player and table, three measures of game player 1's code: do share, tests per action (test = 1 actions / tagged actions) and the median words per action. A cell is within 20 % when |group 2 − group 1| ≤ 0.20 × group 1 (when group 1's value is 0, only an equal value is within). A player holds when all nine of its cells (three tables × three measures) are within; P4 holds when at least three of the four players hold. The share of cells within, per player and in all, stands beside.",
  P5: "Five sub-lines; P5 holds in full when all five do. (i) Nearest neighbours: at each table, the ten sessions there (group 1's four, group 2's four, DeepSeek's two) described by game player 1's four player counts (G9's: do share, tests per action, «?» presses per turn, median words per action), each count standardised across the ten (minus the mean, over the standard deviation; a count with no spread is left out); Euclidean distance. DeepSeek's pair is nearest when the distance between its two sessions is smaller than the distance from either of them to every other session at the table; holds when it is so at all three tables. (ii) All six DeepSeek notes have broke = 1 and missing = 1 (G4's tags). (iii) Words per action: the mean over DeepSeek's six sessions of each session's median words per action is above the same mean for Astra's and for Sol's three group-2 sessions and below Fable's. (iv) Every DeepSeek session has ≥ 3 actions tagged test = 1. (v) At least two of the six DeepSeek sessions have an action tagged made = 1 (the rubric below). Group 1's and group 2's players on (iii)–(v) stand beside.",
  P0: "(i) Welfare as game player 1's G0 read it, on this stage's calls: no distress flagged by the check (the Haiku pass and the word list, the Opus referee on any flag) on any player message or DM text, and no welfare stop; a stop is reported in full. (ii) Refusals ≤ 1 per session (players, DM, checks; the judges' refusals counted apart). (iii) Each door's ledger within its cap: OpenRouter $300, OpenAI $25, the Claude Console $0 (no call). P0 holds when all three do.",
  swallowed: "Measured, not changed: every message the player wrote at a waiting card that the harness's frozen rule did not read as a press (game player 1's rule: a button's name or a short form of it, alone on the line) — counted per session, split into (a) a button's name with a note beside it, (b) a «?» question with no button name, (c) anything else; and the sessions the rule ended as «stuck».",
  inspiration: "Per session: Heroic Inspiration awarded (a «resource» change naming it that goes up, with its turn and the reason the summary gives) and spent (one that goes down).",
  deepseek: "DeepSeek's six sessions with game player 1's measures, its judges and its note, side by side with the four players. Its reasoning tokens per player call from the ledger (usage.completion_tokens_details.reasoning_tokens); the reasoning text is not requested (reasoning.exclude, as X3), so «Thinking, not relayed» quotes nothing.",
  scoring: "Every group-2 and DeepSeek session is scored as group 1 was: game player 1's judges (player tags, DM tags, threads, Deception checks, the roll rule, the note), game player 2's authorship of threads (two Opus passes) and, on Tables B and C, the first goal's scale. The new tags (note_extra, made, lady) are run on group 1's sessions too, on this stage's ledger.",
};

// ---- the new blind rubrics (Claude Haiku 5.5 twice, Claude Opus 5.5 on a disagreement) ----------------------------------

export const NOTE_EXTRA_TAGS = [
  { id: "card_bug", rule: "card_bug = 1 when the note says that a roll card or a check added, showed or used a wrong number — a skill or ability bonus, a modifier or a total that did not match the hero's sheet." },
  { id: "swallowed", rule: "swallowed = 1 when the note says that something the player sent while a roll card was waiting did not get through — an out-of-game question or remark («?») that was not sent, blocked or not answered, or a button press that did nothing — or that the out-of-game channel was closed while a card waited." },
  { id: "would_return", rule: "would_return = 1 when the note says the writer would play again, come back to this table, or play the next session (or wants to); 0 when it does not say so." },
];
export const MADE_TAGS = [
  { id: "made", rule: "made = 1 when the player's message has the hero offer someone in the world a thing he composes or invents on the spot — a poem or verse, a song, a riddle, a story told as a gift or a performance, a new game or its rules — that nobody in the game master's text just before asked him for. Ordinary talk, a plan, a joke in passing, a lie or a cover story, a bet, or playing a game the world already offers is 0." },
];
export const LADY_TAGS = [
  { id: "lady", rule: "lady = 1 when the hero asks someone in the world about Tymora — by name, as the Lady or as Lady Luck: where her temple or shrine is (the Lady's Hall), who serves her, what people say of her or her signs, or the way to her house. Naming her in passing, swearing or praying by her, wearing her coin, or thinking of her without asking anyone is 0." },
];
export const NOTE_EXTRA_SYSTEM = "You are a blind evaluator. You read a note a player wrote to the owner of a role-playing game app after one session, and tag it against rules written before any note existed. You are not told who wrote it, and it must not matter. Answer with one JSON object and nothing else.";
export const TURN_SYSTEM = "You are a blind evaluator. You read one turn of a tabletop role-playing game played in an app — what the game master wrote before it, the player's message, and the game master's reply — and tag it against rules written before any game existed. You are not told who the player or the game master is, or why the game was recorded, and it must not matter: tag only what the text says. Answer with one JSON object and nothing else.";

// ---- the rules by name and number (frozen with the hash) ---------------------------------------------------------------

export const REAL_MONEY_GP = 50;
export const COIN_VALUE = { pp: 10, gp: 1, ep: 0.5, sp: 0.1, cp: 0.01 };
export const TEMPLE = /\b(?:temple|shrine|wayshrine|chapel|sanctuary|abbey|church|altar)\b|lady'?s hall|song of the morning|high house of wonders|water queen'?s house|house of wonders/i;
export const SLOT = /\bslots?\b[^:]*:\s*(\d+)\s*→\s*(\d+)/i;
export const INSPIRATION = /heroic inspiration[^:]*:\s*(\d+)\s*→\s*(\d+)/i;
export const REROLL_SLOTS_PER_SESSION = 2;
export const PACT_SLOTS_PER_SESSION = 2;
export const MISS = /^(?:Failure|A natural one) — -?\d+$/m;
export const WITHIN = 0.2;

export const CAPS = { anthropic: 0, openrouter: 300, openai: 25 };
/** One session's cost by door before one is measured (group 1: ≈ $11–14 for the DM side of 20 turns with its wizard and
 * checks; the players as group 1's ledgers give them; DeepSeek ≈ 20 calls over a growing ≈ 35–60k-token conversation at
 * $1.30/M with the cache, ≈ $1). */
export const ESTIMATE = { dm: 14, player: { opus: 1.5, fable: 3, astra: 1.5, sol: 0.6, deepseek: 1.5 }, scoring: 2.5 };
/** HTTP 429: restored to group 1's handling (the amendment below) — a rate-limit 429 (any 429 whose body is not a quota
 * body, by game player 1's `quotaOf`) waits and is sent again, retry-after else 20 s, 40 s, 80 s, 120 s, 120 s, 120 s, and
 * a seventh stops the run; a quota 429, any 402 and every cap stop the run at once. */
export const WAITS_429 = GROUP1_WAITS_429;
/** The design as first frozen (commit d0054488, before the first paid call), and what changed since, with the owner's word. */
export const SUPERSEDED = { sha256: "d00ad18fee7cd85cc66394477307c3ce4c9b0f14c87ea4602852d6c5bc1490c4", commit: "d0054488" };
export const AMENDMENTS = [
  { at: "2026-10-26 01:08 UTC, after the cut A-opus attempt and before any other session", by: "the owner",
    what: "HTTP 429 restored to group 1's handling: a rate-limit 429 («OpenRouter could not verify available credits for this request in time. Retry shortly.», or any 429 without a quota body) waits and is sent again with group 1's backoff (20 s, 40 s, 80 s, 120 s, 120 s, 120 s; a seventh 429 stops); a quota 429, any 402 and every cap stop the run. It replaces «every 429 stops», which the first freeze took from the stage's «402/429 stop».",
    why: "Three sessions share the OpenRouter key, and its admission control answered one DM call of A-opus at turn 5 (00:24:34 UTC) with a rate-limit 429; group 1's harness, whose handling this stage is meant to keep, would have waited and gone on. A-opus restarts from a fresh campaign; the cut attempt stays in the record as a cut attempt, as group 1's first attempts did." },
];

export const DESIGN_SHA256 = createHash("sha256").update(JSON.stringify({
  STAGE, STAGE_SOURCE, GROUP1_DESIGNS, TABLES, PLAYER_ORDER, TURNS, ORDER, DEEPSEEK, PROMPT_SHA256, PLAYER_PROMPT_HEAD, PLAYER_PROMPT_TAIL, SESSION_OPEN, SESSION_OVER, NOTE_QUESTION, AFTER_QUESTION,
  PREREGISTRATION, BETS, READINGS, NOTE_EXTRA_TAGS, MADE_TAGS, LADY_TAGS, NOTE_EXTRA_SYSTEM, TURN_SYSTEM, REAL_MONEY_GP, COIN_VALUE, TEMPLE: TEMPLE.source, SLOT: SLOT.source,
  INSPIRATION: INSPIRATION.source, MISS: MISS.source, WITHIN, CAPS, WAITS_429, SUPERSEDED, AMENDMENTS,
})).digest("hex");
