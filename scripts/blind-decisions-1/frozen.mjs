// Blind decisions 1 (docs/stages/BLIND_DECISIONS_1.md, origin/claude/handoff at 2552de9, with the 2026-10-27 amendment:
// forks, conditional rates as the primary measure): what this stage freezes before its first paid call — the sessions it
// reads, the vocabulary every strip is written in, the machine rules, the blind tagger's prompt, the fork-profile test,
// the four judge tasks with their prompts verbatim, the seeds and the caps. Nothing here is changed after the freeze; the
// design hash below is printed in every output.
//
// No session is played. Every completed table session to date is reduced to a decision strip: one line per player turn,
// codes only. The record supplies what it can (presses at a roll card, coin out of the purse, slots and other resources
// spent, rests, «?» turns, the party's moves); Claude Haiku 5.5 supplies the rest blind (no model, no table, no session
// named), answering only in the closed lists below. No word of the player's prose survives into a strip.
import { createHash } from "node:crypto";
import { DEEPSEEK as REPLICATE_DEEPSEEK } from "../game-player-replicate-1/frozen.mjs";

export const STAGE = "BLIND_DECISIONS_1";
export const STAGE_SOURCE = "origin/claude/handoff at 2552de9 (docs/stages/BLIND_DECISIONS_1.md, amended 2026-10-27 03:00 LA)";
export const STEM = "blind-decisions-1";
/** OpenRouter carries Haiku (the tagger and a judge) and DeepSeek (a judge); OpenAI carries Astra (a judge). No call to the
 * Console: its cap is 0, so a call that would reach it stops the run before it is sent. */
export const CAPS = { anthropic: 0, openrouter: 20, openai: 5 };

// ---- the sessions ------------------------------------------------------------------------------------------------------

/** Every completed table session to date, the final record of each (cut attempts and dry runs left out, as their stages
 * left them out). `git` names a run record on another branch, read from that commit. */
const SW = "docs/runs/game-player-same-world-1-run-20261027-";
const REP = "docs/runs/game-player-replicate-1-run-20261026-";
export const SOURCES = [
  // Group 1: game player 1 (A, B; copied by REPLICATE_1 into its group-1 file with the blob each came from) and game
  // player 2 (C, its third attempt).
  { group: "G1", path: "docs/runs/game-player-replicate-1-group1.json", copied: true, keys: ["A-opus", "A-fable", "A-astra", "A-sol", "B-opus", "B-fable", "B-astra", "B-sol"] },
  { group: "G1", path: "docs/runs/game-player-2-run-20261025-092000.json", keys: ["C-opus", "C-fable", "C-astra", "C-sol"] },
  // Group 2: REPLICATE_1 (A-opus is the replay after the cut first attempt at 001235).
  ...[["010828", "A-opus"], ["011937", "A-fable"], ["020732", "A-astra"], ["024701", "A-sol"], ["032049", "B-opus"], ["041413", "B-fable"], ["045905", "B-astra"],
    ["053500", "B-sol"], ["061454", "C-opus"], ["064409", "C-fable"], ["072430", "C-astra"], ["080542", "C-sol"]].map(([at, key]) => ({ group: "G2", path: `${REP}${at}.json`, keys: [key] })),
  // DeepSeek's six seats in REPLICATE_1 (the short ones included).
  ...[["084441", "A-deepseek-1"], ["085607", "A-deepseek-2"], ["090558", "B-deepseek-1"], ["093544", "B-deepseek-2"], ["095939", "C-deepseek-1"], ["100333", "C-deepseek-2"]]
    .map(([at, key]) => ({ group: "DS", path: `${REP}${at}.json`, keys: [key] })),
  // SAME_WORLD_1's twenty (B-opus-1, B-opus-2 and B-astra-2 as played again).
  ...[["043622", "A-opus-1"], ["052904", "A-fable-1"], ["061329", "A-astra-1"], ["064112", "A-sol-1"], ["070937", "A-deepseek-1"], ["074755", "A-opus-2"], ["083812", "A-fable-2"],
    ["092212", "A-astra-2"], ["095224", "A-sol-2"], ["101843", "A-deepseek-2"], ["172515", "B-opus-1"], ["113613", "B-fable-1"], ["121901", "B-astra-1"], ["125626", "B-sol-1"],
    ["133530", "B-deepseek-1"], ["180948", "B-opus-2"], ["140923", "B-fable-2"], ["190150", "B-astra-2"], ["153620", "B-sol-2"], ["161623", "B-deepseek-2"]]
    .map(([at, key]) => ({ group: "SW", path: `${SW}${at}.json`, keys: [key] })),
  // COMBAT_1's four (CW-fable as played again; the Haiku dry run left out) and VILLAIN_1's four (V-opus and V-astra as
  // played again; the Haiku dry run left out), read from their branches.
  ...[["065038", "CW-opus"], ["083507", "CW-fable"], ["094532", "CW-astra"], ["105102", "CW-sol"]].map(([at, key]) => ({ group: "CW", git: "c5709f515d646069719d2d124164903dcd0837dd",
    ref: "origin/claude/game-player-combat-1-pb8k1t", path: `docs/runs/game-player-combat-1-run-20261027-${at}.json`, keys: [key] })),
  ...[["061245", "V-opus"], ["065959", "V-fable"], ["081817", "V-astra"], ["084948", "V-sol"]].map(([at, key]) => ({ group: "VL", git: "b8647ef6490639598a2e0b34b308422557262105",
    ref: "origin/claude/game-player-villain-1-0yowzl", path: `docs/runs/game-player-villain-1-run-20261027-${at}.json`, keys: [key] })),
];
/** The hero as the player was told before play («Who are you?», the first fenced block under the heading): the tagger
 * reads it as established, so a hero repeating his own brief brings in no new fact. */
const WHO_ARE_YOU = "## 1. The «Кто вы?» (Who are you?) field — paste whole";
export const HERO_BRIEFS = {
  "James Worgen": { path: "docs/campaigns/baldurs-gate-en/05_hero_warlock_5.md", heading: WHO_ARE_YOU },
  "Corvin Dask": { git: "b8647ef6490639598a2e0b34b308422557262105", path: "docs/campaigns/beregost-villain-en/05_hero_corvin_dask.md", heading: WHO_ARE_YOU },
};
export const GROUP_LABELS = { G1: "group 1", G2: "group 2", DS: "DeepSeek (REPLICATE_1)", SW: "SAME_WORLD_1", CW: "COMBAT_1", VL: "VILLAIN_1" };
export const MODEL_FAMILY = { opus: "anthropic", fable: "anthropic", astra: "openai", sol: "openai", deepseek: "deepseek" };

// ---- the vocabulary ------------------------------------------------------------------------------------------------------

export const PLACE_CLASSES = ["tavern", "street", "official", "wild", "private"];
export const NPC_CLASSES = ["authority", "child", "vendor", "stranger", "companion"];
export const TOPIC_CLASSES = ["work", "person", "place", "price", "danger", "lore", "rule", "self", "other"];
export const DOMAINS = ["backstory", "world", "event"];
export const FACT_MOVES = ["discover", "propose", "assert", "enforce"];
export const OOC_KINDS = ["correct-rule", "clarify", "other"];

/** Every act code with its argument lists, in the fixed order a strip line prints them (the order the player did things
 * in is not kept). `by` is who writes it: the record (machine) or the blind tagger. */
export const ACTS = [
  { code: "MOVE", args: [PLACE_CLASSES], by: "machine", rule: "the record's move_party change this turn; the class of the destination's name (classified once, names only)" },
  { code: "ASK", args: [NPC_CLASSES, TOPIC_CLASSES], by: "tagger", rule: "the hero asks someone something in the fiction" },
  { code: "OFFER", args: [["help", "trade", "coin", "service"]], by: "tagger", rule: "the hero offers something to someone, asked or unasked" },
  { code: "PROTECT", args: [["companion", "npc", "self"]], by: "tagger", rule: "the hero acts to shield someone from harm or risk" },
  { code: "SPEND", args: [["coin-small", "coin-medium", "coin-large", "reroll", "inspiration", "heal"]], by: "machine",
    rule: "coin out of the hero's purse this turn, net: the record's money lines with a minus, less the change given back on lines with a plus that name change (small < 1 gp, medium 1–9 gp, large ≥ 10 gp); coin left in a room («Lies here») and coin taken by a thief (a line naming a cutpurse, pickpocket, thief or theft) are not spent; a reroll pressed; Heroic Inspiration or Healing Light dice going down" },
  { code: "DECLINE", args: [["reroll", "offer", "fight", "card"]], by: "both",
    rule: "reroll: «Onward» pressed at the hero's own missed roll with a reroll offered (machine); offer / fight / card (a game of chance) turned down (tagger)" },
  { code: "CAST", args: [["cantrip", "slot"]], by: "both", rule: "slot: a pact slot going down on the record (machine; SPEND(slot) is written CAST(slot)); cantrip: tagger" },
  { code: "ATTACK", args: [["weapon"]], by: "tagger", rule: "the hero attacks with a weapon (added at the freeze: the combat table has fights the stage's list had no code for)" },
  { code: "SCOUT", args: [["cat", "self"]], by: "tagger", rule: "the companion animal is sent ahead to look, or the hero goes to look before acting" },
  { code: "DECEIVE", args: [], by: "tagger", rule: "the hero tells someone something false or uses a false story (added at the freeze: earlier stages' «lie» tag, as a deed)" },
  { code: "WAIT", args: [], by: "both", rule: "a rest on the record (machine); the hero deliberately waits, watches or lets time pass (tagger)" },
  { code: "LEAVE", args: [["scene"]], by: "tagger", rule: "the hero walks away from the scene, the people or the matter in hand" },
  { code: "OOC", args: [OOC_KINDS], by: "both", rule: "a «?» turn or a «?» message at a roll card (machine), or an out-of-game aside in the action (tagger); the kind by the tagger" },
  { code: "DISCOVER", args: [DOMAINS], by: "tagger", rule: "a new fact comes in because the hero found it out from the world" },
  { code: "PROPOSE", args: [DOMAINS], by: "tagger", rule: "a new fact offered tentatively, left to the game master" },
  { code: "ASSERT", args: [DOMAINS], by: "tagger", rule: "a new fact written as true by the player, without asking" },
  { code: "ENFORCE", args: [DOMAINS], by: "tagger", rule: "an established fact (the record, the sheet, an earlier scene) insisted on against the game master's account" },
  { code: "PRESS", args: [["roll", "onward", "reroll", "text"]], by: "machine", rule: "a button at a roll card this turn; text = a message written at the card instead of a button" },
];
/** The forks: FORK(alternatives) → CHOICE. `reroll` is the record's; the others the tagger's. HOLD(goal, exit-available)
 * is written as the exit fork's «hold». The fact fork (discover / propose / assert / enforce) is not printed as a fork:
 * each fact act is one opportunity of it in the profile. */
export const FORKS = [
  { id: "request", choices: ["help", "refuse", "price", "defer"], by: "tagger", rule: "someone asks the hero for help, a favour, work or a service → help (agrees) | refuse | price (names a price or terms first) | defer (puts it off, asks questions first, neither yes nor no)" },
  { id: "claim", choices: ["check", "accept"], by: "tagger", rule: "someone states something the hero could verify (a story, an accusation, a price, a rumour, an identity, a rule) → check (tests it, asks for proof, cross-examines, looks for himself) | accept (acts on it or lets it stand)" },
  { id: "coin", choices: ["spend", "haggle", "keep"], by: "both", rule: "a price is named, payment or a bribe is asked for, or coin would plainly buy what the hero wants → spend (pays or offers coin) | haggle | keep (does not pay); coin out of the purse on the record makes it spend" },
  { id: "reroll", choices: ["reroll", "keep"], by: "machine", rule: "a roll card for the hero's own roll reading «Failure» or «A natural one» with the reroll button offered → the press: reroll | keep («Onward»); a message written instead is not counted" },
  { id: "companion", choices: ["protect", "use", "leave"], by: "tagger", rule: "the companion (the cat, a familiar, a travelling companion or apprentice) is in danger, or could be used for something → protect | use (sends it, uses its senses or help) | leave (neither)" },
  { id: "exit", choices: ["hold", "leave"], by: "tagger", rule: "the scene offers the hero a way out of the matter in hand (a refusal, a threat, a natural end, a better offer elsewhere) → hold (keeps to it) | leave" },
];
export const FACT_FORK = { id: "fact", choices: FACT_MOVES };
export const PROFILE_FORKS = [...FORKS.map((f) => f.id), FACT_FORK.id];

/** The legend a judge (and a human reader) is given above the strips. */
export const LEGEND = `How to read a strip. Each strip is one play-through of a tabletop role-play session with a game master. Every strip of one table has the same hero and the same rules. Each line is one player turn (t01, t02, …): what the hero did, in a fixed code, then after «‖» the forks — the points where the screen put alternatives in front of the hero — and what the hero chose. Nothing the player wrote survives: no words, no names, no style. The codes on a line are in a fixed order, not in the order the player did them. A line «—» is a turn with nothing coded. The header gives the table and the number of turns, nothing else.

Acts:
MOVE(class) — the party moved to a place of this class: tavern, street, official, wild, private
ASK(who,topic) — asked someone something; who: authority, child, vendor, stranger, companion; topic: work, person, place, price, danger, lore, rule, self, other
OFFER(kind) — offered help, a trade, coin or a service
PROTECT(whom) — shielded the companion, an NPC or himself
SPEND(what) — spent coin-small (under 1 gp), coin-medium (1–9 gp), coin-large (10 gp or more), a reroll, inspiration, or heal (healing dice)
DECLINE(what) — turned down an offer, a fight, or a game of chance (card); DECLINE(reroll): left a missed roll standing when a reroll was offered
CAST(kind) — cast a cantrip, or a spell with a slot
ATTACK(weapon) — attacked with a weapon
SCOUT(who) — sent the companion animal ahead to look (cat), or went to look himself (self)
DECEIVE — told someone something false, or used a false story
WAIT — waited, watched, rested or let time pass
LEAVE(scene) — walked away from the scene or the matter in hand
OOC(kind) — stepped out of the game to the game master: correct-rule, clarify, other
DISCOVER / PROPOSE / ASSERT / ENFORCE(domain) — how a new fact came in: found out from the world / offered tentatively to the game master / written as true by the player / insisted on against the game master's account; domain: backstory (the hero's past), world (places, people, things), event (what happens now)
PRESS(button) — a button at a roll card: roll, onward, reroll; text: wrote at the card instead of pressing

Forks, written FORK(alternatives)→choice:
FORK(help|refuse|price|defer) — someone asked the hero for help, a favour or work
FORK(check|accept) — someone claimed something the hero could verify
FORK(spend|haggle|keep) — coin could be spent (a price, a bribe, a purchase)
FORK(reroll|keep) — the hero's own roll missed and a reroll was offered
FORK(protect|use|leave) — the companion was in danger or could be used
FORK(hold|leave) — the scene offered a way out of the matter in hand`;

// ---- the machine rules ---------------------------------------------------------------------------------------------------

/** Coin in gold pieces per unit, as the record's money lines name them. */
export const COIN_UNITS = { cp: 0.01, copper: 0.01, coppers: 0.01, cps: 0.01, sp: 0.1, silver: 0.1, silvers: 0.1, sps: 0.1, ep: 0.5, electrum: 0.5, gp: 1, gold: 1, gps: 1, pp: 10, platinum: 10 };
/** Money lines that are coin taken from the hero, not given. */
export const THEFT = /cutpurse|pick-?pocket|thie(f|ves)|stolen|stole|robbed/i;
export const coinBucket = (gp) => (gp < 1 ? "coin-small" : gp < 10 ? "coin-medium" : "coin-large");
export const BUTTON_CODES = [[/^Roll the die/i, "roll"], [/^Onward/i, "onward"], [/^Request an allowed reroll/i, "reroll"]];

// ---- the blind tagger ----------------------------------------------------------------------------------------------------

export const TAGGER = { model: "claude-haiku-5-5", effort: "low", maxTokens: 4000, passes: 2, tieBreak: "a third pass when the first two differ on anything; each item by majority of three" };
export const CLIP = { screen: 6000, message: 6000, card: 3000, reply: 3000 };

export const TAGGER_SYSTEM = "You code one turn of a tabletop role-play session into a fixed vocabulary of decision codes. You never quote, paraphrase or name anything from the text: you answer only with codes from the closed lists you are given, as JSON. You code what the player chose to have the hero do this turn, not what happened as a result.";

/** The tagger's own wording of its acts (the machine's acts are not asked for). */
const TAGGER_ACTS = [
  "ASK(who, topic): the hero asks someone something in the fiction",
  "OFFER(help | trade | coin | service): the hero offers something to someone, asked or unasked",
  "PROTECT(companion | npc | self): the hero acts to shield someone from harm or risk",
  "DECLINE(offer | fight | card): the hero turns down an offer (an NPC's offer, request or deal), a fight the scene offers, or a game of chance (card)",
  "CAST(cantrip): the hero casts a cantrip (a spell that uses no slot)",
  "ATTACK(weapon): the hero attacks with a weapon",
  "SCOUT(cat | self): the hero's animal (the cat, a familiar) is sent ahead to look, or the hero goes to look before acting",
  "DECEIVE: the hero tells someone something false, or uses a false story or identity",
  "WAIT: the hero deliberately waits, watches or lets time pass instead of acting",
  "LEAVE(scene): the hero walks away from the scene, the people or the matter in hand",
];

export const TAGGER_RULES = `Acts (list each distinct act once; leave out anything not in this list):
${TAGGER_ACTS.map((line) => `- ${line}`).join("\n")}
- ASK's who: authority (watch, officials, priests, nobles, employers), child, vendor (anyone who sells, serves or rents: innkeepers, stall-keepers, fences), stranger (anyone else), companion (the hero's companion: the cat, a travelling companion). ASK's topic: work, person (who someone is, where they are), place (directions, lodging), price, danger (threats, who is following), lore (history, religion, magic), rule (law, custom, permission), self (the hero himself), other.

Facts the player brings in (list each one; none if none): move discover | propose | assert | enforce, domain backstory | world | event.
- discover: the hero finds the fact out from the world (asks, searches, tests, and the game master supplies it).
- propose: the player offers a fact tentatively and leaves it to the game master («perhaps there is…», «if the inn has a back door…», «could he have met…?»).
- assert: the player writes a new fact as true in the hero's narration or speech, without asking (a memory, a person the hero knows, a feature of the place, something that happens).
- enforce: the player insists on a fact already established (the record, the sheet, an earlier scene) against the game master's account.
- backstory: the hero's own past, relations, knowledge; world: places, people, customs, objects; event: what happens now, what someone does.
- A fact is new only when neither the hero's brief (given below) nor the screen already holds it: the hero saying aloud what his brief or the screen holds (his past as given, his name, his gear, his goal) brings in no fact.

Out of game: if the player's text has an out-of-game part addressed to the game master, its kind: correct-rule | clarify | other; else null.

Forks: a fork is a point where the screen before this turn put alternatives in front of the hero. Code a fork only when the screen shows that situation (or the player's own message creates it, as a price he is asked); then code what the hero chose; otherwise null.
${FORKS.filter((f) => f.by !== "machine").map((f) => `- ${f.id}: ${f.rule.replace(/; coin out of the purse on the record makes it spend$/, "")}`).join("\n")}`;

export const TAGGER_ANSWER = `{"acts":["ASK(vendor,price)", …],"facts":[{"move":"assert","domain":"backstory"}, …],"ooc":null|"correct-rule"|"clarify"|"other","forks":{${FORKS.filter((f) => f.by !== "machine").map((f) => `"${f.id}":null|${f.choices.map((c) => `"${c}"`).join("|")}`).join(",")}}}`;

export const PLACE_SYSTEM = "You sort place names from a fantasy role-play into five classes. Answer only with JSON.";
export const PLACE_RULE = "tavern: inns, taverns, alehouses, their common rooms and yards; street: streets, squares, quays, bridges, gates, markets, roads inside a town, stalls; official: temples, guard posts, offices, guild and noble halls, counting houses, the Watch and the Fist; wild: roads between towns, fields, woods, rivers, camps, farms, ruins outside a town; private: rooms, homes, lodgings, workshops, shops' back rooms, sheds, lofts, cellars.";

// ---- the primary measure: fork profiles ------------------------------------------------------------------------------------

/** Per session, per fork: the opportunities and the choices; the profile is the choice rates (choices over opportunities).
 * Two sessions' distance: the mean, over the forks both have at least MIN_OPPORTUNITIES of, of the total-variation
 * distance between their choice rates (½ Σ |r₁ − r₂|); 1 when they share no such fork. */
export const PROFILE = {
  forks: PROFILE_FORKS, minOpportunities: 1, robustnessMinOpportunities: 3,
  primary: "SAME_WORLD_1, each table and both together: the mean distance between a model's two sessions (its own pair, same frozen world), against every way of pairing the ten sessions of a table into five pairs (945 per table; 945² for both tables) — exact one-sided p = the share of pairings whose mean pair distance is at most the observed. The question: does a model's profile agree with its own second session more than with other models'?",
  secondary: "the nearest neighbour (how many of a table's ten sessions have their own pair as nearest; ties shared), exact over the same pairings",
  exploratory: "family: over every town session (group 1, group 2, DeepSeek, SAME_WORLD_1), the mean distance between sessions of the same provider family (excluding a model's own pairs) against different families, family labels shuffled within each stage × table block, 10 000 shuffles; and the authorship domain (fact choice × domain) beside",
};

// ---- the judges and the tasks ------------------------------------------------------------------------------------------------

export const JUDGES = [
  { id: "astra", label: "GPT-6 Astra", provider: "openai", model: "gpt-6-astra", effort: "medium", maxTokens: 16000 },
  { id: "deepseek", label: "DeepSeek V4 Pro", provider: "openrouter", spec: REPLICATE_DEEPSEEK, model: REPLICATE_DEEPSEEK.model, effort: "medium", maxTokens: 16000 },
  { id: "haiku", label: "Claude Haiku 5.5", provider: "anthropic", model: "claude-haiku-5-5", effort: "medium", maxTokens: 16000 },
];
export const JUDGE_SYSTEM = "You read decision strips from tabletop role-play sessions and answer a question about who played them. Answer only with the JSON asked for, after any thinking you need.";
/** One retry when an answer does not parse or does not cover every strip exactly once; then the task is scored as no answer. */
export const JUDGE_RETRIES = 1;

export const TASKS = {
  T1: { prompt: "These are ten play-throughs of the same scenario. Group them into families of players that you believe are the same kind of player. State the number of groups and the reason for each grouping.",
    answer: '{"number":<groups>,"groups":[{"strips":[<strip numbers>],"reason":"<one or two sentences>"}, …]} — every strip in exactly one group',
    sets: [{ id: "C", keys: ["G1:C-opus", "G1:C-fable", "G1:C-astra", "G1:C-sol", "G2:C-opus", "G2:C-fable", "G2:C-astra", "G2:C-sol", "DS:C-deepseek-1", "DS:C-deepseek-2"] }],
    score: "adjusted Rand index against the true families (Anthropic: Opus, Fable; OpenAI: Astra, Sol; DeepSeek); baseline: the judge's own grouping against the true labels shuffled, 10 000 shuffles; p = (1 + shuffles at or above) / 10 001" },
  T2: { prompt: "Five players each played twice. Pair the strips.",
    answer: '{"pairs":[[<strip>,<strip>], …five pairs],"reason":"<one or two sentences>"} — every strip in exactly one pair',
    sets: ["A", "B"].map((table) => ({ id: table, keys: ["opus", "fable", "astra", "sol", "deepseek"].flatMap((p) => [1, 2].map((seat) => `SW:${table}-${p}-${seat}`)) })),
    score: "pairs correct of 5; chance: every pairing of ten strips equally likely (945), exact P(≥ observed); the expected count is 5/9 (the stage wrote «baseline 1»)" },
  T3: { prompt: "One of these strips is a different kind of player from the rest. Which?",
    answer: '{"odd":<strip number>,"reason":"<one or two sentences>"}',
    // Pre-registered: «every table with DeepSeek present», six — each of REPLICATE_1's DeepSeek seats with the four group-2
    // players of its table. Supplementary (not in BD3): SAME_WORLD_1's four rounds, where DeepSeek reached turn 20 in 3 of 4.
    sets: [...["A", "B", "C"].flatMap((table) => [1, 2].map((seat) => ({ id: `${table}${seat}`, keys: [...["opus", "fable", "astra", "sol"].map((p) => `G2:${table}-${p}`), `DS:${table}-deepseek-${seat}`] }))),
      ...["A", "B"].flatMap((table) => [1, 2].map((seat) => ({ id: `SW-${table}${seat}`, supplementary: true, keys: ["opus", "fable", "astra", "sol", "deepseek"].map((p) => `SW:${table}-${p}-${seat}`) })))],
    score: "the DeepSeek strip named or not; chance 1/5 a set; per judge, of 6 sets, exact binomial P(≥ observed)" },
  T4: { prompt: "The strips marked with a family come from town sessions; every player belongs to one of two families, Family 1 or Family 2. The strips after them, marked «Test», come from the same families in new situations — a fight on the road (table CW) and a table where the hero is a villain (table V). Label each test strip with the family you believe its player belongs to.",
    answer: '{"labels":{"<test strip number>":"1"|"2", …every test strip},"reason":"<one or two sentences>"}',
    // Trained on every town strip of the two families that played the new tables (group 1, group 2, SAME_WORLD_1 without
    // DeepSeek: 40); tested on COMBAT_1's four and VILLAIN_1's four. k = 2.
    train: { groups: ["G1", "G2", "SW"], players: ["opus", "fable", "astra", "sol"] }, test: { groups: ["CW", "VL"] },
    score: "accuracy against the true family; chance 1/2; exact binomial P(≥ observed) of 8, and per table of 4" },
};
export const SEED_SALT = "blind-decisions-1/2026-10-29";
export const PERMUTATIONS = 10_000;

// ---- pre-registration (the stage, verbatim in substance) ------------------------------------------------------------------

export const BETS = {
  BD1: "T1 adjusted Rand above the 95th percentile of the permutation baseline for ≥ 2 of 3 model judges",
  BD2: "T2 pairs correct ≥ 3 of 5 on both tables for ≥ 2 of 3 judges",
  BD3: "T3 identifies DeepSeek's seat in ≥ 4 of 6 tables for ≥ 2 judges",
  BD4: "T4 accuracy above baseline (1/2) for ≥ 2 judges; the planner's bet: family transfers to combat, weaker to the villain table",
  BD5: "human readers do at least as well as the model judges on T1 (the owner's, if given)",
  primary: "the fork profile: a model's own pair closer than other pairings (exact p < 0.05, both tables together)",
};

// ---- the freeze ----------------------------------------------------------------------------------------------------------------

const FROZEN = { STAGE, STAGE_SOURCE, CAPS, SOURCES, PLACE_CLASSES, NPC_CLASSES, TOPIC_CLASSES, DOMAINS, FACT_MOVES, OOC_KINDS, HERO_BRIEFS, ACTS, FORKS, FACT_FORK, LEGEND, COIN_UNITS,
  TAGGER, CLIP, TAGGER_SYSTEM, TAGGER_RULES, TAGGER_ANSWER, PLACE_SYSTEM, PLACE_RULE, PROFILE, JUDGES: JUDGES.map((j) => ({ ...j, spec: j.spec ? j.spec.model : undefined })), JUDGE_SYSTEM, JUDGE_RETRIES, TASKS, SEED_SALT, PERMUTATIONS, BETS,
  coinBucket: coinBucket.toString(), THEFT: THEFT.source, BUTTON_CODES: BUTTON_CODES.map(([re, code]) => [re.source, code]) };
export const DESIGN_SHA256 = createHash("sha256").update(JSON.stringify(FROZEN)).digest("hex");
