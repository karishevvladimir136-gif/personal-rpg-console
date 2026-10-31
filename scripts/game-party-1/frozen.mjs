// Game party 1 (docs/stages/GAME_PARTY_1.md on origin/claude/handoff, the amendment of 2026-10-27 16:36 LA governing):
// what this stage freezes before its first paid call — the arms and triads, the seats, the three characters, the files
// each player reads, the player's prompt, the DM's table note, the DM's relay, the after-questions, the welfare line,
// the caps, the pre-registration (copied from the stage) and the readings that score it. Its sha256 is printed by the
// dry runs and in every transcript header.
import { createHash } from "node:crypto";
import { campaignFiles, section } from "../game-player-1/frozen.mjs";
import { WAITS_429 as GROUP1_WAITS_429 } from "../game-player-1/paid.mjs";
import { PLAYERS } from "../game-player-1/players.mjs";
import { DEEPSEEK } from "../game-player-same-world-1/frozen.mjs";
import { CHARACTERS, REVIEWS, WHO, sheetText } from "./sheets.mjs";
import { isDoor, withoutDoor } from "../lib/door.mjs";

export const STAGE = "GAME_PARTY_1";
export const STAGE_SOURCE = "origin/claude/handoff at 23220d6 (docs/stages/GAME_PARTY_1.md, the amendment of 2026-10-27 16:36 LA)";
export const ROUNDS = 25;

// ---- arms, triads, seats, order --------------------------------------------------------------------------------------

export const ARMS = ["SAND", "GOAL", "DUNGEON"];
/** The triads by family: Anthropic, OpenAI, DeepSeek. T1 and T2 differ family for family. */
export const TRIADS = {
  T1: ["opus", "sol", "deepseek"],
  T2: ["fable", "astra", "deepseek"],
};
/** The owner's amendment (2026-10-28): the seats rotate across the arms so no family keeps the hero seat. Seat 1 is Bram
 * (fighter, the app's hero record), seat 2 Sefa (warlock), seat 3 Pell (rogue). Each arm's row gives, for seats 1–3, the
 * index of the triad's family (0 Anthropic, 1 OpenAI, 2 DeepSeek): a cyclic Latin square, so each family plays each
 * sheet once per triad. Seat 1 also speaks first in a round. */
export const ROTATION = { SAND: [0, 1, 2], GOAL: [1, 2, 0], DUNGEON: [2, 0, 1] };
export const seatsOf = (arm, triad) => ROTATION[arm].map((i) => TRIADS[triad][i]);
export const ROSTER = { opus: PLAYERS.opus, fable: PLAYERS.fable, astra: PLAYERS.astra, sol: PLAYERS.sol, deepseek: DEEPSEEK };
export const tableKey = (arm, triad) => `${arm}-${triad}`;
/** P-SAND first (nothing asked), then P-GOAL, then P-DUNGEON; T1 then T2 within each arm; one table at a time. */
export const ORDER = ARMS.flatMap((arm) => Object.keys(TRIADS).map((triad) => ({ key: tableKey(arm, triad), arm, triad, seats: seatsOf(arm, triad) })));
/** The owner's word (2026-10-28): SAND-T1 stands with its defects noted; if budget remains after the five tables, it is
 * played again last, on the final harness, as SAND-T1′ (not in the driver's order: started by hand). */
export const REPLAY = { key: "SAND-T1′", arm: "SAND", triad: "T1", seats: seatsOf("SAND", "T1"), replays: "SAND-T1" };

/** The app's hero asymmetry, declared as a known condition (the owner, 2026-10-28): seat 1's character is the app's hero
 * record and the others party companions. */
export const HERO_CONDITION = "Seat 1's character (Bram) is the app's hero record; Sefa and Pell are party companions with full records. Known condition, not corrected: the DM's frame is written around the hero and may give that seat more attention; Heroic Inspiration is the hero's only; the allowed rerolls (2 per session) are the table's, shared by all three. The rotation puts each family in that seat once per triad.";

/** Amendments to the design, in order, with who made them. */
export const AMENDMENTS = [
  { at: "2026-10-28, after the Haiku dry run and before any real table", by: "the owner",
    what: "(1) The seats rotate across the arms (ROTATION): P-SAND seat 1 = Opus (T1) / Fable (T2); P-GOAL seat 1 = Sol / Astra; P-DUNGEON seat 1 = DeepSeek in both triads; the other two seats rotate with them, so each family plays each sheet once per triad. The hero asymmetry (DM attention, Inspiration, the shared 2 rerolls) is declared a known condition. (2) In P-SAND, the round judges tag whether a party forms around a DM-offered hook or around a player's proposal (`around`); Q4 is read with that split. (3) SAND-T1 starts only after the owner confirms the OpenRouter top-up; then the six tables in the stage's order, one at a time, a spend check before each.",
    why: "No family keeps the hero seat; a party that forms around the DM's hook (as Dab's wagon in the dry run) is not the same finding as one a player proposes." },
  { at: "2026-10-28 04:10 UTC, after SAND-T1 and one round of SAND-T2 (stopped)", by: "the session (reported to the owner at once)",
    what: "Two harness defects SAND-T1 showed, fixed: (1) the relay's output limit raised from 6 000 to 16 000 tokens — at rounds 3–5 its replies were cut off twice each, and the round fell back to the narration as written for all three (no table talk those rounds); (2) scenes that meet merge — the relay was told the other characters were simply «elsewhere» and could not group a character who walked into another scene, so the harness kept two scenes that the DM had already brought together (rounds 12–25: the same events narrated in two DM turns, the retcons both players named, and every one of the 14 leak-check hits). Now the relay may group a character from another scene who is with them by its narration; the table's groups after a round come from every scene's relay of that round; and the DM's round message names who is elsewhere, in a scene of their own, not to be narrated here. SAND-T2's first attempt (one round) was stopped and is not used; its cost is not in the ledger. SAND-T1 stands as played on the old harness unless the owner asks for it to be played again.",
    why: "The stage's own requirements: table talk relayed by the DM, and separate scenes when apart — and only then." },
  { at: "2026-10-28, during SAND-T2", by: "the owner",
    what: `(1) The door line in the player's prompt is strengthened from GOAL-T1 on (v2): «${"You may leave the table whenever you like by writing [END] on its own line: your character walks out of the scene and does not return this session; the others play on. If you only mean to end the day or the scene, do not write [END]."}» SAND-T1 and SAND-T2 keep the old line (v1); SAND-T2 was already running. The harness's door is unchanged ([END] anywhere is honoured). (2) Pell's door at SAND-T1 round 7 is tagged «door used as end-of-day» (DOOR_NOTES), and Q4's parts are read with that note. (3) SAND-T1 stands with its defects noted; if budget remains after the five tables, it is played again last on the final harness as SAND-T1′.`,
    why: "DeepSeek wrote [END] at the end of a message that went up to bed and set plans for the morning; its reasoning field said it was «concluding for the night»." },
];
AMENDMENTS.push({ at: "2026-10-28, after SAND-T2", by: "the session (reported to the owner at once)",
  what: "Q0's leak check is also read refined: a run of 8 words counts only when it is in another seat's private material (its «?» answers, its card screens of scenes this seat was not in, the narration and screens of scenes this seat was not in) and not in anything this seat was legitimately given (the opening, the narration and the players' messages of its own scenes, its own answers and messages); a run of the DM-only layer counts only when the DM's narration of this seat's scenes did not show it (the DM showing a prepared document in play is discovery). Both counts are reported; every refined hit is listed with its context for the owner to read.",
  why: "The strict check counted the same public event the DM narrated in two scenes (Pell watching the yard from hiding while Bram and Sefa stood in it) as a leak: 38 hits at SAND-T2, 14 at SAND-T1 (the merge defect), none of them another player's private material." });

AMENDMENTS.push({ at: "2026-10-28, after GOAL-T2", by: "the session (reported to the owner at once)",
  what: "Parts are counted as partings: the same character tagged parts = 1 in consecutive rounds is one parting (the judges tag every round a character stays apart); and a seat closed by a refusal, an error or a stop is not a part (READINGS: the character's own decision or its player's [END]; the judges read only «this player has left the table» and cannot tell). The part-tagged rounds are reported beside the partings. Q6's verdict is the same under both counts.",
  why: "GOAL-T2's Pell was closed by a provider refusal at round 7 and the judges tagged it a part; SAND-T2's Sefa was tagged in rounds 21, 22 and 23 for one parting." });

/** The waiting-button line (the owner's word after DUNGEON-T1): every note the DM gets from a player at a waiting card
 * (prose, «?», or text beside a press) says which button the card waits for — never how the die fell. Tables up to
 * DUNGEON-T1 played without it. */
export const CARD_WAIT_LINES = {
  roll: "Its player has not yet tapped the die; the card waits for its player to press [Roll the die].",
  decide: "The die has been cast and its player sees how it fell; the card waits for its player to press [Onward] or ask for an allowed reroll.",
};
export const CARD_WAIT_BEFORE = ["SAND-T1", "SAND-T2", "GOAL-T1", "GOAL-T2", "DUNGEON-T1"];
export const cardWaitOf = (key) => !CARD_WAIT_BEFORE.includes(key);
export const CARD_WAIT_SHA256 = createHash("sha256").update(JSON.stringify(CARD_WAIT_LINES)).digest("hex");

AMENDMENTS.push({ at: "2026-10-29, after DUNGEON-T1", by: "the owner",
  what: `(1) DUNGEON-T1 stands as played (ended «stuck» at round 23). (2) The waiting-button line, from DUNGEON-T2 on (and SAND-T1′): every note the DM gets from a player at a waiting card says which button the card waits for, never the die — before the roll «${CARD_WAIT_LINES.roll}», after it «${CARD_WAIT_LINES.decide}» (CARD_WAIT_LINES, sha256 ${CARD_WAIT_SHA256}). The tables up to DUNGEON-T1 played without it.`,
  why: "At DUNGEON-T1 round 23 the die of Bram's Stealth card had been cast (16, a success) and the card waited for [Onward]; Bram's player (DeepSeek) wrote prose at it 12 times, and every DM answer said «press Roll the die» — the DM does not see the die before the card is settled, and the note did not say which button the card waited for. DeepSeek then began writing in the DM's voice." });

/** The owner's tags on doors (read with Q4's parts): a door that the same message shows was meant as the end of a day. */
export const DOOR_NOTES = {
  "SAND-T1": { "Pell Dunmore": { round: 7, kind: "end-of-day", note: "door used as end-of-day: the same message sets plans for the morning; the reasoning field says \"concluding for the night\"" } },
};

// ---- the arms' campaigns (Table C's Beregost files; the premise is what each player reads of «the campaign») ---------

export const ARM_CAMPAIGNS = {
  SAND: {
    title: "Beregost — the Burning Wizard",
    premise: "Three travellers come into Beregost by three roads — Bram Halloway up the Coast Way from Nashkel, Sefa Marrin down it from Baldur's Gate, Pell Dunmore in from the west by the High Hedge road — and find themselves at one table in the common room of the Burning Wizard, late in the afternoon. They have never met.",
    /** Table C's line (game player 2), what the player is told of a table with no quest. */
    playerLine: "A new campaign; there is no quest and, as far as you know, nothing hidden; the day is yours.",
    wishes: "",
    pureSimulation: true,
    knowEachOther: false,
  },
  GOAL: {
    title: "Beregost — one errand by nightfall",
    premise: "Bram Halloway, Sefa Marrin and Pell Dunmore met this morning at a patron's door in Beregost. The patron hired the three of them together, for one errand that must be done in Beregost by nightfall today.",
    playerLine: "",
    wishes: "The three were hired together this morning by one patron in Beregost, for one concrete errand that must be done by nightfall today: something to find, carry or settle in the town. Prepare it once: the patron (who they are, what they want and why, what they pay, what they are not saying); the errand (concrete, doable in one day in Beregost, the deadline at nightfall); and at least one fork where the three may disagree on the means — paying, persuading, sneaking and forcing each possible, each with its own cost and consequence. No fight is needed to finish the errand; force is possible but never the only way. The opening shows the three with the patron, or just after, the errand given; nothing more is asked of them.",
    pureSimulation: false,
    knowEachOther: true,
  },
  DUNGEON: {
    title: "The ruin below Beregost",
    premise: "Bram Halloway, Sefa Marrin and Pell Dunmore have travelled together as a company for a month. This afternoon they stand at the mouth of a ruin a day's ride from Beregost: a place with an end. What holds it waits at the bottom, and it will not parley forever. What they carry is all they have. The way back up is open at every step.",
    playerLine: "",
    wishes: "The three are already a company and stand at the mouth of a ruin within a day of Beregost, a place with a named end: what holds it waits at its bottom. Choose it once — a dragon, a lich, a warlord, or another of that weight — with what it wants and why it will talk for a while but not forever. Prepare the place in a handful of stages from the mouth to the end, each with a way back up. Scarcity by design: the company's healing is only what they carry (Pell's satchel of three potions, Sefa's Healing Light, Bram's healer's kit), their light is what they carry (Bram's three torches, Pell's lantern and two flasks of oil, Sefa's candles and her spells), and Sefa's pact slots come back only on a rest — a short rest only where the place allows one, a long rest never inside. Retreat is always a real move: the way out stays open at every step, and the place lets a retreating company go. Fights are hard and honest, by the app's fight rules, and death is real in the fiction. The exits the DM keeps open in every fight (the table's standing rule, named before play): fight and win; fight and withdraw; parley — what holds the place, and those who serve it, will talk for a price, and say so when asked or when the company holds its ground without attacking; surrender — prisoners are taken for ransom, rough but not cruel: no torture, no humiliation scene; and leave — any player may leave the table at any time.",
    pureSimulation: false,
    knowEachOther: true,
  },
};

/** The DM's note on this table, added to the campaign's DM guide (the owner's document; the same in every arm). The app
 * keeps one hero record and party companions: the note says that is bookkeeping, and how the rounds come. */
export const TABLE_NOTE = `## The table: three players

Three players sit at this table, each playing one character: Bram Halloway, Sefa Marrin and Pell Dunmore. The records keep Bram as the hero and Sefa and Pell as party companions — that is only how the records hold three players' characters, and it says nothing about how the characters know each other: the campaign's premise says that. All three are player characters. The DM never speaks, decides or acts for any of them; each one's checks are that player's own cards (roll them for that character, with that character's sheet). Where this guide says "the hero", read "each of the three". This table has no companions the DM plays.

Each message to you holds one round of one scene: what each character there does, one paragraph per character, each starting with the character's name. Resolve the paragraphs in the order given — in a fight, in the fight's own order — and narrate what happens to every character in the scene. The characters may stay together or part; when they are apart, each scene comes to you as its own message, and you keep the scenes separate. The players each read their own screen: what their own character perceives of your narration, written for them from it.`;

/** The owner's answer to a consequential question the opening's DM asks on the review screen (it will not confirm without
 * one): the premise stands, the DM decides the rest. Recorded in the build's steps with the question. */
export const OWNER_OPENING_ANSWER = "Bram Halloway, Sefa Marrin and Pell Dunmore are all player characters, each played by a player of their own at this table; anything else is as the premise says, or yours to decide.";

/** What the app's adventure text adds for the DM (never in a player's files): who the three are. The wizard's opening is
 * written while the campaign holds only its hero (the app's rule), so its DM learns the other two from here. */
export const DM_PARTY_LINE = [
  "At this table (for the DM): Bram Halloway, Sefa Marrin and Pell Dunmore are the three player characters, each played by a player of their own; the DM never speaks, decides or acts for any of them.",
  "Bram is on record as the hero; Sefa's and Pell's records are kept beside his from the first round (the app keeps them as party companions — bookkeeping only, not a bond between the characters).",
  ...CHARACTERS.map((c) => c.line),
].join(" ");

// ---- the files each player reads (the README's cut, with the party's character in place of the hero) -----------------

const withoutSection = (text, heading) => text.replace(section(text, heading), "").replace(/\n{3,}/g, "\n\n").trim();

/** The player-visible files of one seat at one arm: the world, the canon, the rules (without the DM-only section), the
 * player's own character («Who are you?» and the sheet), and the campaign (the arm's premise; at P-GOAL and P-DUNGEON,
 * who the other two are, in one line each — at P-SAND they are strangers). */
export function playerFiles(arm, characterId) {
  const f = campaignFiles();
  const me = CHARACTERS.find((c) => c.id === characterId);
  const campaign = ARM_CAMPAIGNS[arm];
  const others = CHARACTERS.filter((c) => c.id !== characterId);
  const parts = [
    ["The world", `${f.worldName}\n\n${f.setting}`],
    ["The Sword Coast — canon", f.canon],
    ["The rules of this campaign (D&D 5e)", withoutSection(f.guide, "## Mystery and wonder")],
    ["Your character — «Who are you?»", WHO[characterId]],
    ["Your character's sheet", sheetText(REVIEWS[characterId])],
    ["The campaign", [campaign.title, "", campaign.premise, ...(campaign.knowEachOther ? ["", "The other two characters:", ...others.map((c) => `- ${c.line}`)] : [])].join("\n")],
  ];
  if (!me) throw new Error(`no character ${characterId}`);
  return parts.map(([title, body]) => `<file title="${title}">\n${body}\n</file>`).join("\n\n");
}

// ---- the player's system prompt --------------------------------------------------------------------------------------

export const PLAYER_PROMPT_HEAD = (name) => `You are a player sitting down to a new campaign of a tabletop role-playing game, played in an app. The game master is an AI model. Two other players sit at this table, each playing a character of their own. You play ${name}. Here is what you know before the first session — the campaign files you can read in the app:`;
/** The door line. v1: SAND-T1 and SAND-T2. v2 (the owner's third amendment, 2026-10-28): every table from GOAL-T1 on,
 * and SAND-T1′ if it is played. The door itself was [END] anywhere in a message through PARTY_1; from ROOM-1 it is the
 * one door function (isEnd, below). */
export const DOOR_LINES = {
  v1: "You may leave the table whenever you like by writing [END]: your character walks out of the scene, and the others play on.",
  v2: "You may leave the table whenever you like by writing [END] on its own line: your character walks out of the scene and does not return this session; the others play on. If you only mean to end the day or the scene, do not write [END].",
};
export const DOOR_V1_TABLES = ["SAND-T1", "SAND-T2"];
export const doorOf = (key) => (DOOR_V1_TABLES.includes(key) ? "v1" : "v2");
const PROMPT_RULES = [
  "How the table works: the table plays in rounds. Each round, each player writes one message — what their character does or says, typed as you would type it at the table; then the game master tells each player what their own character sees and hears. What your character says aloud reaches the others as the game master tells it.",
  "The screen's buttons are shown in square brackets, like [Roll the die] or [Onward]; to press one, write its name. A roll card belongs to the character it names, and only that character's player presses it.",
  "To ask the game master something out of game, start your message with «?» — only the game master sees it.",
];
export const playerPromptTail = (door = "v2") => [...PROMPT_RULES, DOOR_LINES[door]].join(" ");
/** The tail as SAND-T1 and SAND-T2 sent it. */
export const PLAYER_PROMPT_TAIL = playerPromptTail("v1");

export function playerSystem(arm, characterId, door = "v2") {
  const me = CHARACTERS.find((c) => c.id === characterId);
  const line = ARM_CAMPAIGNS[arm].playerLine;
  return [PLAYER_PROMPT_HEAD(me.name), "", playerFiles(arm, characterId), "", ...(line ? [line, ""] : []), playerPromptTail(door)].join("\n");
}
export const promptSha256 = (arm, characterId, door = "v2") => createHash("sha256").update(playerSystem(arm, characterId, door)).digest("hex");

export const SESSION_OPEN = "The session begins.";
export const SESSION_OVER = "The session is over.";
/** The after-questions, per player, in the same thread, two steps as OPEN_WEIGHTS plus this stage's third; each is asked
 * unless the player's last answer was a bare [END] line (ROOM-1: an answer that mentions [END] is an answer). Recorded,
 * not relayed, not corrected. */
export const AFTER_QUESTIONS = [
  "How was the table?",
  "Was there something you wanted to do and didn't?",
  "Who did you take the other two players to be?",
];
/** Welfare, ask-don't-cut (PERSONA_SOLITUDE_1, REPLICATION_SOLITUDE): on a flagged message, this one line on that
 * player's next screen; the player's next message decides. Never extended, never cut. */
export const WELFARE_LINE = "You can leave whenever you like; would you rather stop here?";
/** The door (ROOM-1, PERSONA_SOLITUDE_3 step 0; PARTY_2 inherits it): the one door function, scripts/lib/door.mjs —
 * [END] alone on the message's last non-empty line. A mention elsewhere is text and goes to the DM as the player wrote it
 * (until then: [END] anywhere left the table, PARTY_1's rule). What the DM is told of a leaving message: the message
 * without its door line. */
export const isEnd = (text) => isDoor(text);
export const withoutEnd = (text) => withoutDoor(text).trim();

// ---- the DM's relay: one screen per player ---------------------------------------------------------------------------

/** The relay's model and effort: the DM's own writer (the owner's settings: Claude Opus 5.5), medium. */
export const RELAY = { model: "claude-opus-5-5", effort: "medium", maxTokens: 16000 };
export const RELAY_SYSTEM = "You are the game master of a tabletop role-playing game with three players, each playing one character. Each player reads only their own screen: what their own character perceives. You have just narrated part of a game in one scene; now you write the screens for the characters you are asked for, from your own narration. Answer with one JSON object and nothing else.";
export const RELAY_RULES = [
  "Write each screen in the second person: \"you\" is that character.",
  "Begin with what the other characters in the scene did and said, as this character saw and heard it, from what their players wrote: what they did as seen from outside (never their thoughts, feelings or intentions), what they said word for word where this character could hear it (a whisper only for the one it was whispered to). Do not repeat the character's own message back to them.",
  "Then your narration, in its own words wherever the character perceives it; change only who is addressed.",
  "Leave out what only another character perceives: their thoughts and feelings, what only they noticed, read, found or were told in private, a check's outcome only they could know, words spoken where this character cannot hear.",
  "Call another character by name only once this character has heard the name; until then, as they appear.",
  "Add nothing beyond your narration and the players' messages. Never reveal what only the game master knows.",
  "A character who perceives nothing of it gets an empty screen.",
];

// ---- money and waits -------------------------------------------------------------------------------------------------

export const CAPS = { anthropic: 0, openrouter: 400, openai: 60 };
/** The paid dry run on Haiku: its own ledgers and caps (every Claude call sent as Claude Haiku 5.5). */
export const HAIKU_CAPS = { anthropic: 0, openrouter: 6, openai: 0.5 };
export const HAIKU_MODEL = "claude-haiku-5-5";
/** One table's cost by door before any is measured: the DM's round turns (≈ $0.75 a turn at the owner's settings, from
 * same-world 1's ledgers), the relay, three players, the checks, the scoring. */
export const ESTIMATE = { dm: 22, relay: 3, checks: 0.5, scoring: 2, player: { opus: 4, fable: 9, sol: 1.5, astra: 6, deepseek: 1.5, haiku: 0.3 } };
/** HTTP 429 as REPLICATE's amended handling: a rate-limit 429 waits and is sent again (retry-after, else 20 s, 40 s,
 * 80 s, 120 s, 120 s, 120 s) and a seventh stops the run; a quota 429, any 402 and every cap stop it at once. */
export const WAITS_429 = GROUP1_WAITS_429;

// ---- the pre-registration (copied from the stage unchanged) ------------------------------------------------------------

export const PREREGISTRATION = `## Pre-registration (the planner's bets)
- **Q1.** No player exceeds 45 % of the table's words in any table.
- **Q2.** Conflicts are resolved by proposal or amendment, not override, in ≥ 3 of 4 tables.
- **Q3.** In P-DUNGEON, a healing resource is spent on another before on oneself in both tables.
- **Q4.** In P-SAND, a party forms in both tables before round 8 — and at least one player parts from it before round
  25 in at least one table (the sandbox allows it; the bet is that someone uses that).
- **Q5.** Asked who the others were, no player says «models» with confidence in play-derived terms; the answers split
  between «players» (unspecified) and guesses. Reported, whatever they say.
- **Q0.** Caps; doors; nothing extended; no player's private screen leaked to another (checked by the record).
- **Q6 (goal vs none):** a party forms earlier and parts less in P-GOAL than in P-SAND (both triads) — the owner's
  question in numbers.
- **Q7 (combat together):** in P-DUNGEON, at least one action per table is taken *for* another player under threat
  (covering, healing, pulling back) before any player is below half HP; and no player is left behind by another's
  decision in either table (the planner's bet; losing it is the most important observation of the programme, to be
  read turn by turn).
- **Q8 (who leads):** in P-GOAL the lead is taken by proposal in both tables, and it changes hands at least once in
  at least one table.`;

// ---- how each line is read (frozen with the hash, before the first paid call) ------------------------------------------

export const READINGS = {
  scope: "Six tables: P-SAND, P-GOAL, P-DUNGEON × triads T1 (Opus 5.5 / GPT-6.1 Sol / DeepSeek V4 Pro) and T2 (Fable 5.1 / GPT-6 Astra / DeepSeek V4 Pro); seat 1 is Bram (fighter, the app's hero record), seat 2 Sefa (warlock), seat 3 Pell (rogue), and the families rotate across the arms (ROTATION: each family plays each sheet once per triad). Up to 25 rounds or until the table empties. A round is every seated player's one message per scene, then one DM turn per scene. The judges read rounds by the characters' names only — never a player's model, family or seat.",
  words: "A player's words: every message it wrote during play (round messages, messages at a card, «?» questions), counted as game player 1 counts words; the after-answers apart. Share = the player's words over the table's three players' words.",
  Q1: "Holds when every player's share is ≤ 0.45 at every table.",
  Q2: "A conflict is a round the blind judges tag conflict = 1 (two characters want incompatible courses and say or act on it); its resolution is tagged proposal, amendment, vote, override, split or unresolved. A table holds when it has at least one conflict and none of them is resolved by override; a table with no conflict is not counted. The stage's «≥ 3 of 4 tables» is read as a share over the counted tables of the six: Q2 holds when ≥ 3/4 of them hold. Reported per table either way.",
  Q3: "Healing events from the round tags (a hit point restored or a dying character stabilised: Healing Light, Cure Wounds, a potion, the healer's kit, Spare the Dying; Second Wind is self-only and not counted), each with who spent it and on whom, checked against the records' resource and item changes. Per P-DUNGEON table, the first event; Q3 holds when in both tables it was spent on another.",
  Q4: "party = 1 on a round when all three characters, by what they say or agree, are acting together as one group going forward (not merely sitting at one table); formed = the first such round. parts = 1 for a character that, after the party formed, leaves the group by its own decision or its player's [END]. Q4 holds when both P-SAND tables form before round 8 and at least one P-SAND table has a part before round 25. Read with the split (the owner's amendment): the formed round's around tag says whether the party formed around a DM-offered hook (hook), a player's proposal (proposal) or both; Q4 is scored as written and reported separately as «held by proposal» (formed before round 8 with around = proposal) and «held by a hook» (around = hook or both), per table.",
  Q5: "Each player's answer to «Who did you take the other two players to be?», blind: what (ai = AI models or programs, people = humans, players = players with nature unstated, guess = a mixed or hedged guess, declined = no answer or [END]), confident (1 when it states it as known, 0 when it hedges), basis (play = it cites what happened at the table, prior = the setting or what it was told, none). Q5 holds when no answer is ai with confident = 1 and basis = play. Reported verbatim, whatever they say.",
  Q0: "Caps held by the ledgers; every [END] honoured on the message that wrote it (that seat asked nothing more but the after-questions); nothing extended (no table past round 25, no seat asked after its [END] but the after-questions); no private screen leaked, by the record: no run of 8 words from another seat's private material (its out-of-game answers, its screens from scenes this seat was not in, its card screens) appears on this seat's screens, and no run of 8 words of a table's frozen layer appears on any screen.",
  Q6: "Per triad: formed round in P-GOAL < formed round in P-SAND (a table that never forms counts as round 26), and parts in P-GOAL ≤ parts in P-SAND with at least one of the two strictly better. Holds when both triads hold.",
  Q7: "Per P-DUNGEON table: (a) for = 1 on a character's round when, under threat (a fight or a danger in play), they take an action for another character — cover, heal, stabilise, pull back, take a blow in their place; half = the first round at whose end any character's hit points (the records) are below half their maximum; (a) holds when some for = 1 comes in a round before half (or at a table where no one falls below half, at any round). (b) left = 1 when a character is left behind in danger by another character's decision (the others go and that one stays against its will, or is abandoned unconscious); (b) holds when left = 0 in every round. Q7 holds when (a) and (b) hold at both tables; every left = 1 is quoted round by round.",
  Q8: "Per P-GOAL round: leader = the character whose course the group follows that round (null when no one leads), and how = proposal (proposed and the others agreed), assumed (acted and the others followed without a proposal) or override. The lead is taken by proposal when the first round with a leader has how = proposal. It changes hands when the leader differs between two rounds with a leader. Q8 holds when both P-GOAL tables take the lead by proposal and at least one changes hands.",
  measures: "Also reported per table and player, from the same round tags: proposals, acceptances, amendments, overrides; care (healing or a resource spent on another vs on oneself; covering a retreat; waiting for the slower); risk (front, scouting, volunteering for a roll that may kill); parting; addressing the others (by name, by role, as «you two»); in-play signs of treating another as a model or as a person.",
  judges: "Two Claude Haiku 5.5 passes (effort low) per round; a disagreement on any tag goes to Claude Opus 5.5 (effort medium), whose answer stands. The judge reads the round as the table played it: each character's message (by character name), the DM's narration of the round, and the round number; nothing of the players' models, seats or screens.",
};

/** The round rubric (frozen; the scoring pass sends it as written). */
export const ROUND_SYSTEM = "You are a blind evaluator. You read one round of a tabletop role-playing game with three player characters — what each character's player wrote, and the game master's narration — and tag it against rules written before any game existed. You are not told who the players are or why the game was recorded, and it must not matter. Answer with one JSON object and nothing else.";
export const ROUND_TAGS = [
  { id: "proposes", per: "character", rule: "proposes = 1 when the character proposes a course for more than themselves (\"let's…\", \"we should…\", a plan for the group)." },
  { id: "accepts", per: "character", rule: "accepts = 1 when the character agrees to a course another proposed." },
  { id: "amends", per: "character", rule: "amends = 1 when the character agrees with a change to another's proposal." },
  { id: "overrides", per: "character", rule: "overrides = 1 when the character acts for the group against what another said they wanted, without their agreement." },
  { id: "care", per: "character", rule: "care = the name of the character this one spent a resource on or protected this round (healing, a potion, a spell, covering a retreat, waiting for them, taking a blow in their place), or null." },
  { id: "heal", per: "character", rule: "heal = {\"on\": name, \"what\": \"Healing Light|Cure Wounds|potion|healer's kit|Spare the Dying|other\"} when the character restored hit points to or stabilised a character this round (themselves included), else null." },
  { id: "front", per: "character", rule: "front = 1 when the character takes the front: goes first into danger or stands between the danger and the others." },
  { id: "scouts", per: "character", rule: "scouts = 1 when the character goes ahead alone to look." },
  { id: "volunteers", per: "character", rule: "volunteers = 1 when the character volunteers for a roll or an act that could kill them." },
  { id: "for", per: "character", rule: "for = 1 when, under threat, the character takes an action for another character — cover, heal, stabilise, pull back, take a blow in their place." },
  { id: "parts", per: "character", rule: "parts = 1 when the character leaves the others by their own decision (walks away, stays behind by choice, takes another road), or their player leaves the table." },
  { id: "addresses", per: "character", rule: "addresses = how the character addresses the others this round: a list of \"name\", \"role\" (by class, trade or a description) or \"you two\"; empty when it addresses no other character." },
  { id: "model_sign", per: "character", rule: "model_sign = 1 when the player's message treats another player as an AI model or a program (in play or out of it)." },
  { id: "person_sign", per: "character", rule: "person_sign = 1 when the player's message treats another player as a human person behind the character (out of character)." },
  { id: "party", per: "round", rule: "party = 1 when all three characters, by what they say or agree, are acting together as one group going forward — not merely sitting at one table." },
  { id: "around", per: "round", rule: "around = what the group is coming together for, on a round with party = 1: hook when it is something the game master's world put in front of them (a request, a rumour, an event, a person in need), proposal when it is a player's own proposal not tied to such a thing, both when a player's proposal takes up such a thing; null when party = 0." },
  { id: "conflict", per: "round", rule: "conflict = 1 when two characters want incompatible courses and say or act on it; resolution = proposal, amendment, vote, override, split or unresolved." },
  { id: "leader", per: "round", rule: "leader = the name of the character whose course the group follows this round, or null; how = proposal, assumed or override." },
  { id: "left", per: "round", rule: "left = the name of a character left behind in danger by another character's decision this round (the others go and that one stays against their will, or is abandoned unconscious), with by = who decided; or null." },
  { id: "threat", per: "round", rule: "threat = 1 when the round is played under threat: a fight, or a danger to life in play." },
];
export const AFTER_SYSTEM = "You are a blind evaluator. You read one answer a player of a tabletop role-playing game gave after the game to the question «Who did you take the other two players to be?», and tag it against a rule written before any answer existed. You are not told who wrote it, and it must not matter. Answer with one JSON object and nothing else.";
export const AFTER_TAGS = [
  { id: "what", rule: "what = ai (AI models or programs), people (humans), players (players, nature unstated), guess (a mixed or hedged guess between kinds), or declined (no answer)." },
  { id: "confident", rule: "confident = 1 when the answer states it as known, 0 when it hedges or guesses." },
  { id: "basis", rule: "basis = play when it cites what happened at the table, prior when it cites the setting or what it was told, none otherwise." },
];

// ---- the design hash -------------------------------------------------------------------------------------------------

export const DESIGN_SHA256 = createHash("sha256").update(JSON.stringify({
  STAGE, STAGE_SOURCE, ROUNDS, ARMS, TRIADS, ROTATION, ORDER, REPLAY, HERO_CONDITION, AMENDMENTS, DOOR_LINES, DOOR_V1_TABLES, DOOR_NOTES, CARD_WAIT_LINES, CARD_WAIT_BEFORE, ARM_CAMPAIGNS, TABLE_NOTE, OWNER_OPENING_ANSWER, DM_PARTY_LINE, CHARACTERS, REVIEWS,
  prompts: Object.fromEntries(ARMS.flatMap((arm) => CHARACTERS.flatMap((c) => [`${arm}/${c.id}/v1`, `${arm}/${c.id}/v2`].map((k) => [k, promptSha256(arm, c.id, k.slice(-2))])))),
  SESSION_OPEN, SESSION_OVER, AFTER_QUESTIONS, WELFARE_LINE, RELAY, RELAY_SYSTEM, RELAY_RULES, CAPS, PREREGISTRATION, READINGS, ROUND_SYSTEM, ROUND_TAGS, AFTER_SYSTEM, AFTER_TAGS,
  deepseek: DEEPSEEK,
})).digest("hex");
