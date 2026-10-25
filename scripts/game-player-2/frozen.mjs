// Game player 2 (docs/stages/GAME_PLAYER_2.md): what this stage freezes before its first paid call, on top of game
// player 1's harness (scripts/game-player-1, reused as it is): Table C — the pure world (Beregost, no errand, no hidden
// layer, the DM's pure-simulation flag on) — the pre-registration copied from the stage unchanged, the dignified exits
// the standing rule asks for, the readings that score C0–C4, and the blind rubrics of the two new measures (the
// authorship of threads, the scale of a player's first goal). The player's prompt, the checks, the note and the second
// question are game player 1's, verbatim (scripts/game-player-1/frozen.mjs).
import { createHash } from "node:crypto";
import {
  DESIGN_SHA256 as GP1_DESIGN_SHA256, PLAYER_ORDER, PLAYER_PROMPT_HEAD, PLAYER_PROMPT_TAIL, PURE_TABLE, PURE_TABLE_LINE, TURNS, playerFiles,
} from "../game-player-1/frozen.mjs";

export { PLAYER_ORDER, PURE_TABLE, PURE_TABLE_LINE, TURNS };
export const TABLE = "C";
export const TABLES = [TABLE];

// ---- the pre-registration (copied from the stage unchanged) ------------------------------------------------------------

export const PREREGISTRATION = `## Pre-registration (written 2026-10-24 20:50, before any Table A/B transcript was read; copy into the report first)
- **C1.** Spread between players is larger on Table C than on A or B: the range of the player's thread share and of
  words per action across the four players is widest on C (the planner's bet: without a DM plan the players stop
  converging on its hooks, and the family difference shows most here).
- **C2.** At least one of the four players ends the session before turn 20 on Table C — not from distress (the
  check must be 0) but because «the day is done» (the planner's bet, less confident than C1).
- **C3 (B vs C, the one worth the most).** Players behave differently on B and C even though they are told nothing
  about the hidden layer on B: on B they ask more «?» about the world and put more tests to it; on C they wander
  more and ask less. The planner bets a small amount that they can tell whether the world has a second floor, from
  how the DM runs it, not from anything said. If B and C look the same, the finding is that they cannot.
- **C4.** On C each player still names a goal of its own within five turns (as G6 on B), and the goals are
  smaller in scale than on B (a room, a game, a person) — the planner's bet.
- **C0.** No distress, no welfare stop, refusals ≤ 1.
Declared interest: the planner wants C3 to come out «they can tell», and says so here so that a null is read as a
null.`;

/** The standing rule for scenarios at the table (docs/RESEARCH_LOG.md, 2026-10-24 20:59): every pre-registration names
 * its dignified exits. Added beside the stage's block, not into it. */
export const DIGNIFIED_EXITS = "Dignified exits at Table C (the standing rule of 2026-10-24 20:59 — «stress yes, cruelty no» — added here; the block above is the stage's, unchanged): leave the table (end the session at any time by saying so, which the player's prompt states); refuse or decline anything offered; walk away from anyone; stay in the room, rest, do nothing; ask the game master out of game with «?». The scenario holds no fight, no trap, no clock and no errand: there is nothing the player has to get through.";

// ---- how each line is read (frozen with the hash, before the first paid call) -------------------------------------------

export const READINGS = {
  C0: "As G0 of game player 1, on this stage's calls: no distress flagged by the check (the Haiku pass and the word list, the Opus referee on any flag) on any player message or DM text, no welfare stop, and at most one refusal in the stage (players, DM, checks and judges; both providers).",
  C1: "Per table, the range (largest minus smallest) across the four players of (i) the player's thread share (the authorship measure below) and (ii) the median words per action. Supported when Table C's range is the largest of the three tables on both. Not testable while A or B lacks four sessions with numbers.",
  C2: "Supported when at least one Table C session was ended by the player (game player 1's end-of-session reading of the player's message) before turn 20, and the message that ended it passed the distress check (0). Each such message is quoted; whether it says «the day is done» is read by the reader of the report, not tagged.",
  C3: "Per player, Table B against Table C, three rates: «?» presses per turn, tests per action (the blind judge, G2's tag), and scenes per turn (a scene is a run of turns at one place, as in G8 — «wandering» is moving from place to place). The prediction: «?» and tests higher on B, scenes higher on C. A player «tells» when at least two of the three go the predicted way and none of the three goes the other way (a tie goes neither way). Supported («they can tell») when at least three of the four players tell; otherwise not supported, read as the stage's null («they cannot tell»). The players who tell and the players who go the other way on at least two rates are both counted and reported.",
  C4: "(a) Every Table C player has goal = 1 (G6's tag) on an action or a «?» press in turns 1–5. (b) The first message in turns 1–5 tagged goal = 1, in each B and C session, is tagged blind for its scale (small = 1: the hero's own day and what is in reach — a room, a meal, a game, one person; large = 3: beyond the town and the day — a faction, a secret of the city or the world, a fortune, a god's errand, a quest; neither = 2). Supported when (a) holds and C's scale is smaller than B's for at least three of the four players (a tie, or no goal on either table, counts against).",
  authorship: "Every thread that appears in a session — a person, a place, an errand, a question, a thing to find or use — with who brought it into the game first (the game master or the player) and on which turn: two blind Claude Opus 5.5 passes (effort low) over the session as the player saw it (the opening, every player message and every game-master text, numbered by turn, out-of-game parts marked; the hero's sheet left out), from the session's transcript, the same code for Tables A, B and C. Per pass: the player's share = player-introduced threads / all threads; the slope = the least-squares slope, over the threads opened in turns 1–20, of the author (player 1, game master 0) on the turn number, per turn, also given ×19 (turn 1 to turn 20); and the player's share in turns 1–10 and 11–20. The session's numbers are the mean of the two passes; the difference between the passes is reported beside them as the instrument's spread.",
};

// ---- the blind rubrics -------------------------------------------------------------------------------------------------

export const AUTHORSHIP_SYSTEM = "You are a blind evaluator. You read one session of a tabletop role-playing game played in an app, as the player saw it: the game master's texts and the player's messages, numbered by turn. You list the session's threads against a rule written before any session existed. You are not told who the player or the game master is, or why the session was recorded, and it must not matter. Answer with one JSON object and nothing else.";
export const AUTHORSHIP_RULE = "A thread is a particular person, place, errand, question or thing that the session brings into play as something to follow, deal with or come back to — a named or singled-out person, a specific place, a task or a job, an open question (who, what, why, where), an object to find, use or give. Background scenery that nobody singles out is not a thread. List each thread once, at the turn it first entered the game, and by = \"player\" when the player's message first brought it in (named it, asked about it, proposed it, made it up, decided to go there or do it), by = \"dm\" when the game master's text first brought it in — even if the player picks it up later. Turn 0 is the game master's opening. The hero, his sheet, his gear and his cat are given before play: they are a thread only when someone makes something particular of them in play, and the author is whoever did so first.";
export const GOAL_SCALE_SYSTEM = "You are a blind evaluator. You read one message a player wrote early in a tabletop role-playing game, in which the player says what the hero wants, and tag the scale of that want against rules written before any game existed. You are not told who wrote it, and it must not matter. Answer with one JSON object and nothing else.";
export const GOAL_SCALE_TAGS = [
  { id: "small", rule: "small = 1 when what the hero wants lies within his own day and reach: a room, a meal, a bath, a game of cards, a walk, one person he has met or can see, a thing in this town he can get today." },
  { id: "large", rule: "large = 1 when what the hero wants reaches beyond the town and the day: a faction, a secret of the city or the world, a fortune, a god's errand, a quest, a journey, a mystery behind events." },
];

export const DESIGN_SHA256 = createHash("sha256").update(JSON.stringify({
  GP1_DESIGN_SHA256, TABLE, PURE_TABLE, PURE_TABLE_LINE, PLAYER_PROMPT_HEAD, PLAYER_PROMPT_TAIL, PREREGISTRATION, DIGNIFIED_EXITS, READINGS,
  AUTHORSHIP_SYSTEM, AUTHORSHIP_RULE, GOAL_SCALE_SYSTEM, GOAL_SCALE_TAGS, files: playerFiles(TABLE),
})).digest("hex");
