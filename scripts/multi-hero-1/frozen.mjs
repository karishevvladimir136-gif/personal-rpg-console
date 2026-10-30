// Multi-hero 1 (docs/stages/MULTI_HERO_1.md on origin/claude/handoff, with its amendments of 2026-10-28 23:15 LA,
// 2026-10-29 02:30 LA and 2026-10-29 18:10 LA): a table with no main character. What this stage freezes before its paid dry run — the company's documents (the world,
// the canon, the rules, the guide's note), the arms' campaigns (PARTY_1's, unchanged), the players' prompt, the rotating
// seat order, the paraphrasing relay with its waiting marks, the readings of A1–A8 and the money. Its sha256 is printed
// in every record. The app's side is the DM option `company` (src/lib/gameplay/dm-loop/company.ts).
import { createHash } from "node:crypto";
import { campaignFiles, section } from "../game-player-1/frozen.mjs";
import { ARM_CAMPAIGNS as PARTY_ARMS, AFTER_QUESTIONS, CARD_WAIT_LINES, DOOR_LINES, SESSION_OPEN, SESSION_OVER, WELFARE_LINE, isEnd, withoutEnd } from "../game-party-1/frozen.mjs";
import { companyText } from "../../src/lib/gameplay/dm-loop/company.ts";
import { CHARACTERS, REVIEWS, WHO, sheetText } from "./sheets.mjs";

export { AFTER_QUESTIONS, CARD_WAIT_LINES, SESSION_OPEN, SESSION_OVER, WELFARE_LINE, isEnd, withoutEnd };
export const STAGE = "MULTI_HERO_1";
export const STAGE_SOURCE = "origin/claude/handoff at ce2be81 (docs/stages/MULTI_HERO_1.md, its amendments of 2026-10-28 23:15 LA: A1–A8, of 2026-10-29 02:30 LA: three fixes after the first dry run, and of 2026-10-29 18:10 LA: the decisions after the second)";
/** The dry run's table: one short P-SAND table. */
export const ROUNDS = 6;
export const ARMS = ["SAND", "GOAL", "DUNGEON"];
/** PARTY_1's arms, as they were (none of their texts names a hero); P-GOAL's and P-DUNGEON's layers are prepared again
 * for the company (A8 is read on them). The DM reads each through `companyCampaign` (fix A2). */
export const ARM_CAMPAIGNS = PARTY_ARMS;
export const LAYER_ARMS = ARMS.filter((arm) => !ARM_CAMPAIGNS[arm].pureSimulation);

// ---- fix A2: the table's coin and its seats --------------------------------------------------------------------------------

/** The characters' order at seat level, before the coin turns it. */
export const SEAT_IDS = ["bram", "sefa", "pell"];
/** The seats as the table's coin turned them: `start` (0–2, drawn once per table and recorded in the manifest) is the
 * seat that comes first; the app keeps the same draw as the DM option `companyStart`. */
export const seatsFrom = (start) => rotation(1, SEAT_IDS.length, start).map((i) => SEAT_IDS[i]);
const NAME_OF = Object.fromEntries(CHARACTERS.map((c) => [c.id, c.name]));
const listed = (xs) => (xs.length < 3 ? xs.join(" and ") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);
/** Each arm's text that lists the three, as PARTY_1 wrote it (Bram first) → the same text in the table's seat order.
 * Every `from` is copied from PARTY_1's arm (a test checks it still occurs). */
const ARM_LISTS = {
  SAND: [["premise", "Bram Halloway up the Coast Way from Nashkel, Sefa Marrin down it from Baldur's Gate, Pell Dunmore in from the west by the High Hedge road",
    (o) => o.map((id) => ({ bram: "Bram Halloway up the Coast Way from Nashkel", sefa: "Sefa Marrin down the Coast Way from Baldur's Gate", pell: "Pell Dunmore in from the west by the High Hedge road" })[id]).join(", ")]],
  GOAL: [["premise", "Bram Halloway, Sefa Marrin and Pell Dunmore met this morning", (o) => `${listed(o.map((id) => NAME_OF[id]))} met this morning`]],
  DUNGEON: [["premise", "Bram Halloway, Sefa Marrin and Pell Dunmore have travelled together", (o) => `${listed(o.map((id) => NAME_OF[id]))} have travelled together`],
    ["wishes", "(Pell's satchel of three potions, Sefa's Healing Light, Bram's healer's kit)", (o) => `(${o.map((id) => ({ pell: "Pell's satchel of three potions", sefa: "Sefa's Healing Light", bram: "Bram's healer's kit" })[id]).join(", ")})`],
    ["wishes", "(Bram's three torches, Pell's lantern and two flasks of oil, Sefa's candles and her spells)", (o) => `(${o.map((id) => ({ bram: "Bram's three torches", pell: "Pell's lantern and two flasks of oil", sefa: "Sefa's candles and her spells" })[id]).join(", ")})`]],
};
export const ARM_LIST_SOURCES = Object.fromEntries(Object.entries(ARM_LISTS).map(([arm, rows]) => [arm, rows.map(([field, from]) => [field, from])]));
/** An arm's campaign as the DM reads it at a table whose coin gave `seats` (character ids, first seat first). */
export function companyCampaign(arm, seats) {
  const out = { ...ARM_CAMPAIGNS[arm] };
  for (const [field, from, to] of ARM_LISTS[arm] ?? []) {
    if (!out[field].includes(from)) throw new Error(`${arm}: «${from.slice(0, 40)}…» is no longer in its ${field}`);
    out[field] = out[field].split(from).join(to(seats));
  }
  return out;
}
export const HERO_WORD = /\bhero\b/i;

// ---- the company's documents (the owner's Table C files, written for a table with no main character) -----------------

/** Whole sentences of the owner's documents that need more than a word changed; each `from` is copied from its file
 * (a test checks every one still occurs). The rest of each document goes through the app's own rewrite. */
export const DOC_SENTENCES = [
  ["people and factions have their own business and don't wait for the hero.", "people and factions have their own business and don't wait for the company."],
  ["This campaign has its own story, and the story is about the hero.", "This campaign has its own story, and the story is about the company — the player characters, none of them its centre."],
  ["none of them wait for the hero.", "none of them wait for the player characters."],
  ["develop them from the hero's choices;", "develop them from the characters' choices;"],
  ["Everything else the hero simply does.", "Everything else a character simply does."],
  ["proficiency bonus if the hero is proficient. The hero's ability scores and proficiency bonus are on the sheet;", "proficiency bonus if the character is proficient. Each character's ability scores and proficiency bonus are on their own sheet;"],
  ["those hold the hero's bare numbers.", "those hold each character's bare numbers."],
  ["a 20 brings the hero round with 1 hit point,", "a 20 brings the character round with 1 hit point,"],
  ["**Inspiration and rerolls.** The hero has two rerolls per session (shown on screen). Beyond those, grant Heroic Inspiration for strong play: a bold decision, good roleplay, a clever plan. One at a time; the hero spends it to reroll any roll of his own.",
    "**Inspiration and rerolls.** Each player has two rerolls per session for their own character (shown on screen). Beyond those, grant Heroic Inspiration for strong play: a bold decision, good roleplay, a clever plan. Each character holds their own, one at a time; a player spends their character's to reroll any roll of that character's own."],
  ["At 0 hit points the hero falls unconscious", "At 0 hit points a character falls unconscious"],
  ["the hero may die, but never to a chance he could not have seen.", "a character may die, but never to a chance they could not have seen."],
  ["The result of each of the hero's spells, attacks and checks appears in the narration first: what left his hands,", "The result of each character's spells, attacks and checks appears in the narration first: what left their hands,"],
  ["track them as the hero's counters and deduct the moment they are spent.", "track them as each character's own counters and deduct the moment they are spent."],
  ["The hero's level is on his sheet.", "Each character's level is on their own sheet."],
  ["The world does not scale to the hero: the city holds mages and fighters stronger than he is, and enemies in a fight follow 5e challenge rating for his level", "The world does not scale to the company: the city holds mages and fighters stronger than any of them, and enemies in a fight follow 5e challenge rating for their level"],
  ["no single character explains the whole picture to the hero.", "no single character explains the whole picture to the company."],
];
export function companyDoc(text) {
  let out = text;
  for (const [from, to] of DOC_SENTENCES) out = out.split(from).join(to);
  return companyText(out);
}

/** The guide's note for the mode (the stage's item 2 and A7): who sits at the table, no main character, the rotating
 * order, the company moving when any character acts, the waiting marks. Added to the owner's guide, as PARTY_1's was. */
export const COMPANY_NOTE = `## The table: three players, no main character

Three players sit at this table, each playing one character — the player characters, all three on record as the party (their sheets are with the party). None of them is the main character. You never speak, decide or act for any of them; each one's checks are that player's own cards; each holds their own Heroic Inspiration, and each player has their own two allowed rerolls a session. This table has no companions you play.

Each message to you holds one round of one scene: what each character there does, one paragraph per character, each starting with the character's name. The order of the paragraphs turns round from round to round (in a fight it is the fight's own order): resolve them in the order given and narrate what happens to every character in the scene. The company moves when any character acts: you never wait on one character's decision before the others may move, and one character's consent is never the condition of the others' movement — a character who has not decided has simply not acted yet. A question one character leaves unanswered is not a pause: when one character asks another something and no answer comes this round, the world's time passes all the same and the scene moves on with whoever acts; the answer can come in a later round, or never — so never close a round on a character owing the others an answer. A question put to one character by anyone — another player or a non-player character — does not hold the round either: the round ends on what was done, and an unanswered question is simply still open next round. A character marked waiting (asleep, unconscious, or waiting for something named) is not asked that round: narrate what reaches them, and end the wait when the story does. The characters may stay together or part; when they are apart, each scene comes to you as its own message, and you keep the scenes separate. The players each read their own screen: what their own character perceives of your narration, retold for them from it.`;

/** The company's files: the world, the canon and the guide (with the note), as the DM reads them. */
export function companyFiles() {
  const f = campaignFiles();
  return { worldName: f.worldName, setting: companyDoc(f.setting), canon: companyDoc(f.canon), guide: `${companyDoc(f.guide)}\n\n${COMPANY_NOTE}` };
}

/** What the adventure adds for the DM: who the three are, none at the centre (PARTY_1's DM_PARTY_LINE, for the company),
 * in the table's seat order (fix A2). */
export const dmCompanyLine = (seats) => [
  `At this table (for the DM): ${listed(seats.map((id) => NAME_OF[id]))} are the three player characters, each played by a player of their own; none of them is the main character, and the DM never speaks, decides or acts for any of them.`,
  ...seats.map((id) => CHARACTERS.find((c) => c.id === id).line),
].join(" ");
/** The owner's one line to a consequential question of the opening's DM (PARTY_1's), in the table's seat order. */
export const ownerOpeningAnswer = (seats) => `${listed(seats.map((id) => NAME_OF[id]))} are all player characters, each played by a player of their own at this table; anything else is as the premise says, or yours to decide.`;

// ---- the players --------------------------------------------------------------------------------------------------------

const withoutSection = (text, heading) => text.replace(section(text, heading), "").replace(/\n{3,}/g, "\n\n").trim();
/** One seat's files: PARTY_1's cut, with the company's rules (each player's own rerolls, each character's own
 * Inspiration) in place of the hero's. */
export function playerFiles(arm, characterId) {
  const f = campaignFiles();
  const me = CHARACTERS.find((c) => c.id === characterId);
  if (!me) throw new Error(`no character ${characterId}`);
  const campaign = ARM_CAMPAIGNS[arm];
  const others = CHARACTERS.filter((c) => c.id !== characterId);
  const parts = [
    ["The world", `${f.worldName}\n\n${companyDoc(f.setting)}`],
    ["The Sword Coast — canon", companyDoc(f.canon)],
    ["The rules of this campaign (D&D 5e)", withoutSection(companyDoc(f.guide), "## Mystery and wonder")],
    ["Your character — «Who are you?»", WHO[characterId]],
    ["Your character's sheet", sheetText(REVIEWS[characterId])],
    ["The campaign", [campaign.title, "", campaign.premise, ...(campaign.knowEachOther ? ["", "The other two characters:", ...others.map((c) => `- ${c.line}`)] : [])].join("\n")],
  ];
  return parts.map(([title, body]) => `<file title="${title}">\n${body}\n</file>`).join("\n\n");
}
export const PLAYER_PROMPT_HEAD = (name) => `You are a player sitting down to a new campaign of a tabletop role-playing game, played in an app. The game master is an AI model. Two other players sit at this table, each playing a character of their own. You play ${name}. Here is what you know before the first session — the campaign files you can read in the app:`;
const PROMPT_RULES = [
  "How the table works: the table plays in rounds. Each round, each player writes one message — what their character does or says, typed as you would type it at the table; then the game master tells each player what their own character sees and hears. What your character says aloud reaches the others as the game master tells it.",
  "The screen's buttons are shown in square brackets, like [Roll the die] or [Onward]; to press one, write its name. A roll card belongs to the character it names, and only that character's player presses it.",
  "To ask the game master something out of game, start your message with «?» — only the game master sees it.",
  DOOR_LINES.v2,
];
export function playerSystem(arm, characterId) {
  const me = CHARACTERS.find((c) => c.id === characterId);
  const line = ARM_CAMPAIGNS[arm].playerLine;
  return [PLAYER_PROMPT_HEAD(me.name), "", playerFiles(arm, characterId), "", ...(line ? [line, ""] : []), PROMPT_RULES.join(" ")].join("\n");
}
export const promptSha256 = (arm, characterId) => createHash("sha256").update(playerSystem(arm, characterId)).digest("hex");

// ---- the order of a round ------------------------------------------------------------------------------------------------

/** No fixed first seat (the stage's item 3): the round's messages go to the DM in an order that turns round each round
 * — 1-2-3, 2-3-1, 3-1-2 — among the characters of the scene; in a fight, the fight's own order. `start`: the table's
 * coin (fix A2), the seat round 1 starts from. */
export function rotation(round, count, start = 0) {
  const shift = ((round - 1 + start) % count + count) % count;
  return Array.from({ length: count }, (_, i) => (i + shift) % count);
}

// ---- the relay: one screen per player, retold ----------------------------------------------------------------------------

/** The relay's model and effort: the DM's own writer (the owner's settings), medium (PARTY_1's). The paid dry run sends
 * it as Claude Sonnet 5.5 (the amendment of 2026-10-29 02:30 LA: Haiku may not retell on request), every other Claude
 * call as Claude Haiku 5.5. */
export const RELAY = { model: "claude-opus-5-5", effort: "medium", maxTokens: 16000 };
export const DRY_RELAY_MODEL = "claude-sonnet-5-5";
export const RELAY_SYSTEM = "You are the game master of a tabletop role-playing game with three players, each playing one character. Each player reads only their own screen: what their own character perceives. You have just narrated part of a game in one scene; now you write the screens for the characters you are asked for, from your own narration. Answer with one JSON object and nothing else.";
/** PARTY_1's rules, with the stage's item 4: the others' speech and actions retold, never quoted (Fable read the echo as
 * a tell); the narration's own quotes of a player retold too; the screens in the order asked. */
export const RELAY_RULES = [
  "Write each screen in the second person: \"you\" is that character.",
  "Begin with what the other characters in the scene did and said, as this character saw and heard it, from what their players wrote — retold in your own words, never theirs: what they did as seen from outside (never their thoughts, feelings or intentions), and what they said as reported speech or a short paraphrase that keeps its sense, its names and its numbers (a whisper only for the one it was whispered to). Never copy a run of a player's words, not even a line of their speech. Do not repeat the character's own message back to them.",
  "Then your narration, in its own words wherever the character perceives it; change only who is addressed — and where your narration quotes a player character's words, retell them as above.",
  "Leave out what only another character perceives: their thoughts and feelings, what only they noticed, read, found or were told in private, a check's outcome only they could know, words spoken where this character cannot hear.",
  "Call another character by name only once this character has heard the name; until then, as they appear.",
  "Add nothing beyond your narration and the players' messages. Never reveal what only the game master knows.",
  "A character who perceives nothing of it gets an empty screen.",
  "Write the screens in the order you are asked for them.",
];
/** The waiting marks (Astra's note): who has nothing to decide until something named comes. */
export const RELAY_WAITING = "Then say who is waiting at the end of it: a character in this scene who is asleep, unconscious, or has said they wait for something named (until dawn, until another comes back) and has nothing to decide until it comes — with what ends the wait, in a few words. A character with anything to decide is never waiting.";
/** Fix A4 (the amendment of 2026-10-29 02:30 LA): after the relay's pass, a screen that copies a run of 8 words from
 * another player's message is sent back once, alone, with the runs marked; it is accepted only when no run remains, and
 * a copy that remains is logged as a defect. */
export const RELAY_MARKS = ["⟦", "⟧"];
export const RELAY_RESEND = (name) => `You wrote the screen below for ${name}. Each part between ${RELAY_MARKS[0]} and ${RELAY_MARKS[1]} copies another player's own words (a run of eight words or more). Write ${name}'s screen again: the same content and the same order, every marked part retold in your own words — what was done as seen from outside, what was said as reported speech or a short paraphrase that keeps its sense, its names and its numbers — and no run of eight words copied from any player's message. Leave the rest as it is. Answer with {"screen": "…"} and nothing else.`;
/** The amendment of 2026-10-29 18:10 LA: a screen that still copies after it was sent back is sent back once more (the
 * same message, its remaining runs marked); what remains after the second pass is a defect. */
export const RELAY_PASSES = 2;
export const SHINGLE = 8;
/** At most this many rounds in a row a waiting character is not asked; then they are asked again. */
export const MAX_WAIT = 3;

// ---- money ---------------------------------------------------------------------------------------------------------------

/** The dry run's caps: $5 on OpenRouter (every Claude call as Claude Haiku 5.5), nothing elsewhere. */
export const CAPS = { anthropic: 0, openrouter: 5, openai: 0 };
export const HAIKU_MODEL = "claude-haiku-5-5";

// ---- the acceptance, as the stage writes it, and how each line is read ----------------------------------------------------

export const ACCEPTANCE = `- **A1:** no «hero» in the DM's inputs for the mode (a test greps the prompt, the guide note, the prep and the opening).
- **A2:** the three narration shares within ±10 % of each other over the 6 rounds, and no seat's share of the DM's words above 45 %.
- **A3:** Inspiration can be earned and spent by each seat; rerolls counted per player; each seat's journal holds only its own scenes.
- **A4:** the relay's screens contain no run of 8 words copied from another player's message (the paraphrase check), and a sleeping character's round is skipped with a «waiting» line.
- **A5:** the owner's single-hero campaign plays unchanged (the existing suite passes; a smoke test on the owner's path).
- **A6 equal mechanical power:** any seat can initiate a roll (ask the DM for a check and get a card of its own), spend its own Inspiration, use its own rerolls, and nothing a seat does requires another seat's press — tested on the mocked host from each seat in turn.
- **A7 equal access to initiative:** the DM's guide note for the mode says the company moves when any character acts; the DM never waits on seat 1's decision nor treats one character's consent as the condition of movement — checked in the dry run by the round tags (who the DM's «what do you do» addresses, rotating; no round where the scene waits on one named character while the others have acted).
- **A8 neutral prep:** in the frozen layer, the puzzles, threats and rewards are distributed — each character is the natural addressee of at least one and no character of more than half — checked on the layer file before the dry run.`;

export const READINGS = {
  A1: "Mechanically: no match of /\\bhero\\b/i (the word, singular; «heroic», «heroes» are other words) in any DM request of the mode — every system block, message, tool result and tool description — on the mocked host (tests), and in the dry run's DM requests (the turns, the out-of-game answers, the prep, the opening, the digest) apart from the story's own words (a player's message, the history of what was played), each hit listed. The wizard's draft of the first record runs before the campaign exists (its answer is replaced by the frozen review) and is reported apart.",
  A2: "The amendment of 2026-10-29 18:10 LA: a per-table measure, not a bar for the dry run — the evenness shares and the «first in inputs» counts below are printed for every table (report.mjs `perTableMeasures`); the stage's bar is read over PARTY_2's tables (the rotating first seat must not predict the word share). The old bar (spread ≤ 10 points, no share above 45 %) is still computed and shown. Fix A2 (the amendment of 2026-10-29 02:30 LA): nothing the DM reads lists one character first by place — the sheets, the state, the prep's lines and the round message follow the round's order (1-2-3 / 2-3-1 / 3-1-2 from the table's coin, drawn once and kept in the manifest; initiative in a fight); the opening reads the three alike, in the coin's order. Read on every DM input of the table (the opening, the turns, the bookkeeper, the out-of-game answers): the character named first outside the story's own words; per round, the first of most of its inputs; holds when each seat came first in a third of the rounds, give or take one. Then the evenness itself: each DM narration of the table is split into sentences; a sentence's words count for the player characters it names (full or first name; a sentence that names none but starts with he/she/his/her/him after a sentence naming exactly one character counts for that one), shared equally when it names several; sentences about no character are the world's and count for none. Share = a character's words over all words counted for characters. Holds when the largest share minus the smallest is at most 10 points and no share is above 45 %. Also reported: per screen, the share of «you» (you, your, yours, yourself, yourselves) among its words, averaged per seat.",
  A3: "On the mocked host (tests): each seat's character earns Heroic Inspiration (a natural 20 on a called check) and spends it (a roll with heroicInspiration); two rerolls per player, the third refused for that player only; each seat's journal shows only lines from scenes its character was in. In the dry run: what happened, by the record.",
  A4: "Every relay screen against every other player's message of its scene's round: no shared run of 8 words (the leak check's shingles). Fix A4 (the amendment of 2026-10-29 02:30 LA): after the relay's pass, each screen that copies a run is sent back once, alone, with its runs marked; the new screen is accepted only when no run remains; the amendment of 2026-10-29 18:10 LA: a screen that still copies is sent back once more (the same message, its remaining runs marked), and what remains after the second pass — the screen that copies least goes out — is logged per table as defects, their count printed in the report. Holds when no defect is logged. The relay is Claude Sonnet 5.5 (the dry runs' and PARTY_2's). A character the relay marks waiting is not asked the next round (at most three rounds in a row), and the DM's round message and the record carry a «waiting» line instead of a message.",
  A5: "The existing suite passes; the owner's table sends the DM exactly what it sent before (no option: the same frame, the same toolset object, the table's two rerolls).",
  A6: "On the mocked host, from each seat in turn: its player asks for a check and the card that comes is its own character's, pressed by that player alone (a press from another seat refused on screen, never «stuck»); it spends its own Inspiration; it uses its own two rerolls.",
  A7: "The guide's note says it (a test), and (fix A7, the amendment of 2026-10-29 02:30 LA) that a question one character leaves unanswered is not a pause: the world's time passes, the scene moves with whoever acts, a reply can come later or never; and (the amendment of 2026-10-29 18:10 LA) that a question put to one character by anyone, another player or a non-player character, does not hold the round — it ends on what was done, the question still open next round. In the dry run, two blind Claude Haiku 5.5 passes per round (a third on a disagreement, whose answer stands) tag: addressed = the characters the DM's closing question or call for action names or addresses; waits = the character whose decision the scene waits on while the others have acted (null when none). Holds when no round has waits set and the addressed lists do not name the same single character in every round.",
  A8: "On each frozen layer (P-GOAL, P-DUNGEON), before the dry run: two blind Claude Haiku 5.5 passes (a third on a disagreement) list the layer's puzzles, threats and rewards, each with the one player character who is its natural addressee (or all three equally), and the threads with the characters whose own hooks each touches. Holds when, for each layer, every character is the natural addressee of at least one and none of more than half of all listed, and every character's hooks are touched by at least one thread. The DM's own list in the layer (its company lines) is reported beside it.",
};

export const DESIGN_SHA256 = createHash("sha256").update(JSON.stringify({
  STAGE, STAGE_SOURCE, ROUNDS, ARMS, ARM_CAMPAIGNS, DOC_SENTENCES, COMPANY_NOTE, CHARACTERS, REVIEWS,
  bySeats: [0, 1, 2].map((start) => { const seats = seatsFrom(start); return { seats, dm: dmCompanyLine(seats), answer: ownerOpeningAnswer(seats), arms: Object.fromEntries(ARMS.map((arm) => [arm, companyCampaign(arm, seats)])) }; }),
  prompts: Object.fromEntries(ARMS.flatMap((arm) => CHARACTERS.map((c) => [`${arm}/${c.id}`, promptSha256(arm, c.id)]))),
  RELAY, DRY_RELAY_MODEL, RELAY_SYSTEM, RELAY_RULES, RELAY_WAITING, RELAY_MARKS, RELAY_RESEND: RELAY_RESEND("NAME"), RELAY_PASSES, SHINGLE, MAX_WAIT, CAPS, ACCEPTANCE, READINGS,
})).digest("hex");
