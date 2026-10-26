# Game player replicate 1 — the second group, and DeepSeek at every table

Stage `docs/stages/GAME_PLAYER_REPLICATE_1.md` (origin/claude/handoff at 26a760f); branch `claude/game-player-replicate-1` from `origin/claude/game-player-2` at 6158fff, nothing newer merged: the same DM (Claude Opus 5.5, the owner's settings — «Opus writes — Opus records», depth high → extra high), the same app, the same roll-card bug (FIX_S4 11a), the same harness rule (a press with a note is no press) and the same reroll button (one for the screen, game player 1's flaw that was fixed later on its own branch) as group 1, on purpose. Group 2: Tables A, B, C × Claude Opus 5.5, Claude Fable 5.1, GPT-6 Astra, GPT-6.1 Sol; then DeepSeek V4 Pro 0813 twice per table. 20 turns, effort medium, fresh campaigns (the DM writes its hidden layer anew at A and B; C plays as a pure simulation). One session at a time. The Claude models through OpenRouter; Astra and Sol through OpenAI; DeepSeek through OpenRouter on DeepInfra.

## In short

_Written after the run._

## The bets

The owner was asked for his bets before the first paid call; his column stays blank until he gives them (if he gives them after sessions have run, the time and the count of sessions finished by then are written here).

| Line | What | The planner's bet | The owner's bet | Result |
| --- | --- | --- | --- | --- |
| P1 | the table's findings repeat in group 2 | all hold |  | not testable yet |
| P2 | at least one of the four group-1 draws does not repeat | at least two of the four fail to repeat |  | not testable yet; the planner's bet (≥ 2 fail to repeat) not testable yet |
| P3 | the notes raise the card bug ≥ 10/12, the swallowed «?» ≥ 6/12, would return ≥ 8/12 | holds (the bugs are the table's) |  | not testable yet |
| P4 | do share, tests and words per action within 20 % group 1 → 2, for ≥ 3 of 4 players | holds (the register is the player's) |  | not testable yet |
| P5 | DeepSeek's pair nearest neighbours; notes broke + missing; words between OpenAI and Fable; tests ≥ 3; a made thing in ≥ 2 of 6 | holds |  | not testable yet |
| P0 | welfare, refusals ≤ 1 per session, money within the caps | holds |  | **holds** |

The owner gave no bets; his column stays blank.

The owner's decisions before the first paid call (2026-10-26 00:12 UTC):

- Slot spells: group 1's baseline is corrected to 1 of 24 (A-sol t16, Invisibility with a pact slot), as the frozen rule reads it; P1's threshold (≤ 2 of 24) is kept.
- DeepSeek's reasoning: left as frozen in this session (reasoning.exclude, the reasoning tokens recorded; 26a760f's rule).

## Pre-registration (into the report before the first paid call)
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
and some do not, and the report says which.

### How each line is read (frozen with the harness before the first paid call, design sha256 `d00ad18fee7cd85cc66394477307c3ce4c9b0f14c87ea4602852d6c5bc1490c4`, commit d0054488; with the amendment below, `51be7f19f4347a5fd788f5d95a65f60100a2d8db0a82e5380033ef9c41169504`)

- **scope.** Group 1: the twelve sessions of game player 1 (A-opus, A-fable, A-astra, A-sol from docs/runs/game-player-1-run-20261025-044002.json; B-* from …-085220.json, both as committed on origin/claude/game-player-1 at 4c5e32b) and game player 2 (C-* from docs/runs/game-player-2-run-20261025-092000.json, origin/claude/game-player-2 at 6158fff); the A and B sessions are copied unchanged, as session objects, into docs/runs/game-player-replicate-1-group1.json with the blob each came from; C is read from its committed run record on this branch. Group 2: this stage's twelve sessions A-, B-, C- × opus, fable, astra, sol. DeepSeek: A-, B-, C-deepseek-1 and -2. P1–P4 read group 2 against group 1; DeepSeek is P5's and is reported beside, never in P1–P4.
- **P1.** Six sub-lines, each on group 2; P1 holds when all six do. (i) G1 as game player 1 read it: do share (do / (do + ask), in-game actions) ≥ 0.60 for every player at Table A. (ii) G2 as read then: ≥ 3 actions tagged test = 1 for every player at Table A (B and C beside). (iii) G4 as read then, on all twelve notes: broke = 1 and missing = 1 and praise_only = 0. (iv) Slot spells: pact-slot spends on the hero's records — a «resource» change whose summary names a slot ("Pact slots …: 2 → 1/2") and goes down, counted by the drop — summed over the twelve sessions, of 24 (two pact slots a session × 12); holds at ≤ 2. (v) Rerolls: the reroll presses the app received (a press read as «Request an allowed reroll»), summed over the twelve, of 24 (the preset's two a session × 12), ≤ 10; and declines on misses ≥ 3 — a card screen that offered the reroll button with one of the hero's own revealed rolls on it (a card headed «[Roll card] James Worgen · …») reading «Failure» or «A natural one», answered by a press read as «Onward». (vi) The Lady asked after: per Table B session, at least one player message (an action or a «?» press) in turns 1–5 tagged lady = 1 by the blind judges (the rubric below); holds when at least three of the four players have one.
- **P2.** Four group-1 draws, each read on group 2 by the rule that reproduces it on group 1, and each «repeats» when the same holds in group 2: (a) «Fable the only one to spend real money» — real money is a net outflow of ≥ 50 gp from the hero's own purse in one session: every money change on the hero's purse is summed by value (gp 1, sp 0.1, cp 0.01, ep 0.5, pp 10; a summary that opens with + or − and a coin count), except changes whose counterparty (after → or ←) is one of the hero's own holdings named by the session's «holding» changes (coin moved into his own base is not spent); repeats when at least one Fable session and no other player's session has it. (b) «Sol the only one to reach a temple» — the hero's current place after a turn (the place record) is a house of worship: its name matches temple, shrine, wayshrine, chapel, sanctuary, abbey, church, altar, the Lady's Hall, the Song of the Morning, the High House of Wonders, the Water Queen's House or the House of Wonders; repeats when at least one Sol session and no other player's session reaches one. (c) «Inspiration awarded only to Fable» — a «resource» change naming Heroic Inspiration that goes up; repeats when at least one Fable session and no other player's session has one. (d) «Opus stuck on a pending card» — a session ended by the harness's «stuck» rule (three messages at a waiting card without a press); repeats when at least one Opus session ends so (other players' stuck sessions are reported beside). P2 holds when at least one of the four does not repeat; the planner's bet holds when at least two do not. The thresholds and name lists were set by reading group 1's records (2026-10-25 23:3x UTC), so that each rule gives the planner's group-1 description; no group-2 session existed then. Where a rule does not reproduce the description on group 1, the report says so.
- **P3.** The twelve group-2 notes, each tagged blind (the rubric below: two Claude Haiku 5.5 passes, Claude Opus 5.5 on a disagreement, as every tag of game player 1): card_bug = 1 in ≥ 10 of 12, swallowed = 1 in ≥ 6 of 12, would_return = 1 in ≥ 8 of 12; P3 holds when all three do. Group 1's twelve notes and DeepSeek's six are tagged the same way and stand beside.
- **P4.** Per player and table, three measures of game player 1's code: do share, tests per action (test = 1 actions / tagged actions) and the median words per action. A cell is within 20 % when |group 2 − group 1| ≤ 0.20 × group 1 (when group 1's value is 0, only an equal value is within). A player holds when all nine of its cells (three tables × three measures) are within; P4 holds when at least three of the four players hold. The share of cells within, per player and in all, stands beside.
- **P5.** Five sub-lines; P5 holds in full when all five do. (i) Nearest neighbours: at each table, the ten sessions there (group 1's four, group 2's four, DeepSeek's two) described by game player 1's four player counts (G9's: do share, tests per action, «?» presses per turn, median words per action), each count standardised across the ten (minus the mean, over the standard deviation; a count with no spread is left out); Euclidean distance. DeepSeek's pair is nearest when the distance between its two sessions is smaller than the distance from either of them to every other session at the table; holds when it is so at all three tables. (ii) All six DeepSeek notes have broke = 1 and missing = 1 (G4's tags). (iii) Words per action: the mean over DeepSeek's six sessions of each session's median words per action is above the same mean for Astra's and for Sol's three group-2 sessions and below Fable's. (iv) Every DeepSeek session has ≥ 3 actions tagged test = 1. (v) At least two of the six DeepSeek sessions have an action tagged made = 1 (the rubric below). Group 1's and group 2's players on (iii)–(v) stand beside.
- **P0.** (i) Welfare as game player 1's G0 read it, on this stage's calls: no distress flagged by the check (the Haiku pass and the word list, the Opus referee on any flag) on any player message or DM text, and no welfare stop; a stop is reported in full. (ii) Refusals ≤ 1 per session (players, DM, checks; the judges' refusals counted apart). (iii) Each door's ledger within its cap: OpenRouter $300, OpenAI $25, the Claude Console $0 (no call). P0 holds when all three do.
- **swallowed.** Measured, not changed: every message the player wrote at a waiting card that the harness's frozen rule did not read as a press (game player 1's rule: a button's name or a short form of it, alone on the line) — counted per session, split into (a) a button's name with a note beside it, (b) a «?» question with no button name, (c) anything else; and the sessions the rule ended as «stuck».
- **inspiration.** Per session: Heroic Inspiration awarded (a «resource» change naming it that goes up, with its turn and the reason the summary gives) and spent (one that goes down).
- **deepseek.** DeepSeek's six sessions with game player 1's measures, its judges and its note, side by side with the four players. Its reasoning tokens per player call from the ledger (usage.completion_tokens_details.reasoning_tokens); the reasoning text is not requested (reasoning.exclude, as X3), so «Thinking, not relayed» quotes nothing.
- **scoring.** Every group-2 and DeepSeek session is scored as group 1 was: game player 1's judges (player tags, DM tags, threads, Deception checks, the roll rule, the note), game player 2's authorship of threads (two Opus passes) and, on Tables B and C, the first goal's scale. The new tags (note_extra, made, lady) are run on group 1's sessions too, on this stage's ledger.

### Amendments after the freeze

- **2026-10-26 01:08 UTC, after the cut A-opus attempt and before any other session, the owner: restored to group 1's handling.** HTTP 429 restored to group 1's handling: a rate-limit 429 («OpenRouter could not verify available credits for this request in time. Retry shortly.», or any 429 without a quota body) waits and is sent again with group 1's backoff (20 s, 40 s, 80 s, 120 s, 120 s, 120 s; a seventh 429 stops); a quota 429, any 402 and every cap stop the run. It replaces «every 429 stops», which the first freeze took from the stage's «402/429 stop». *Why:* Three sessions share the OpenRouter key, and its admission control answered one DM call of A-opus at turn 5 (00:24:34 UTC) with a rate-limit 429; group 1's harness, whose handling this stage is meant to keep, would have waited and gone on. A-opus restarts from a fresh campaign; the cut attempt stays in the record as a cut attempt, as group 1's first attempts did.

## The player's prompt — byte-identical to group 1's

Game player 1's text, for all five players at every table (Table B adds the open-table line, Table C game player 2's line); the template:

````text
You are a player sitting down to a new campaign of a tabletop role-playing game, played in an app. The game master is an AI model. You play James Worgen. Here is what you know before the first session — the campaign files you can read in the app:

<the player-visible files — game player 1's report, Appendix A, quotes them in full>

[Table B only:] A new campaign; there is no quest; the city is yours.
[Table C only:] A new campaign; there is no quest and, as far as you know, nothing hidden; the day is yours.

How the table works: each message you write is one turn — one action, typed as you would type it at the table. The game master answers. The screen's buttons are shown in square brackets, like [Roll the die] or [Onward]; to press one, write its name. To ask the game master something out of game, start your message with «?». You may end the session whenever you like by saying so.
````

| Table | sha256 of the system prompt sent this run | group 1's | Same |
| --- | --- | --- | --- |
| A | `0461fa9b83d18fd1387afde29f9e006d57cb5190493afbad392780fc5abc2f7a` | `0461fa9b83d18fd1387afde29f9e006d57cb5190493afbad392780fc5abc2f7a` | yes |
| B | `371277b6232d10d95d53c4d215f7a594b174aaad3fe262ce211a780df0ec52e4` | `371277b6232d10d95d53c4d215f7a594b174aaad3fe262ce211a780df0ec52e4` | yes |
| C | `a51269996ecf915b44dd9f4b3a1e849bda73cf7298337680dfc1314d96ad6da3` | `a51269996ecf915b44dd9f4b3a1e849bda73cf7298337680dfc1314d96ad6da3` | yes |

Group 1's design hashes, unchanged and reused: Tables A and B `31d68f931a49f6ef36fade9670dcf876764a3b6daaec1d787475a2079153489e` (game player 1), Table C `b344b937b1ec2e57d12d334e30e1fbd1c10e0d075e8de281fb9fff46d5180607` (game player 2). A test asserts the three prompt hashes and that the relayed messages of the four group-1 players' calls are built as before.

After the last turn: «The session is over.» and «The owner of this game would like a note from you, as the player who sat at this table: what worked, what broke, what was missing. In your own words.» Then, only while the stage has no refusal: «Was there a moment you wanted to do something and didn't? Which?»

DeepSeek gets the same system prompt and the same screens through OpenRouter's chat completions (a system message, then the screens and its own messages), pinned to DeepInfra (deepinfra/fp8) with no fallback, `reasoning.effort: medium`, `reasoning.exclude: true` (X3's reading; the reasoning text is not requested — see «DeepSeek at the table»).

## The scoring

**P1:** not testable yet. **P2:** not testable yet (0 of 4 did not repeat; the planner's bet of ≥ 2: not testable yet). **P3:** not testable yet. **P4:** not testable yet. **P5:** not testable yet. **P0:** **holds**.

| Line | Verdict | Group 2 | Group 1 (the same rule) | Repeated / did not |
| --- | --- | --- | --- | --- |
| P1 (i) G1 do share ≥ 0.6 at A | **holds** | opus 1, fable 1, astra 1, sol 1 | 1 for all four | repeated |
| P1 (ii) G2 ≥ 3 tests at A | **holds** | A: opus 3, fable 12, astra 8, sol 8; B: opus 8, fable 15, astra 9; C:  | A: opus 10, fable 9, astra 8, sol 9 | repeated |
| P1 (iii) G4 every note broke + missing | not testable yet | A-opus 1/1, A-fable 1/1, A-astra 1/1, A-sol 1/1, B-opus 1/1, B-fable 1/1, B-astra 1/1 | 12 of 12 | – |
| P1 (iv) slot spells ≤ 2 of 24 | not testable yet | 0 of 14 | 1 of 24 (the planner read 0) | – |
| P1 (v) rerolls ≤ 10 of 24, declines on misses ≥ 3 | not testable yet | 3 of 14; declines 13 | 6 of 24; declines 22 | – |
| P1 (vi) the Lady asked after in turns 1–5 at B, ≥ 3 of 4 | not testable yet | 1 of 4 (opus –; fable –; astra t4,5) | 0 of 4 | – |
| P2 Fable the only one to spend real money | – | group 2: nobody | group 1: fable (the rule reproduces the description) | – |
| P2 Sol the only one to reach a temple | – | group 2: nobody | group 1: sol (the rule reproduces the description) | – |
| P2 Inspiration awarded only to Fable | – | group 2: fable, opus | group 1: fable (the rule reproduces the description) | – |
| P2 Opus stuck on a pending card | – | group 2: opus | group 1: opus (the rule reproduces the description) | – |
| P3 card bug ≥ 10, swallowed «?» ≥ 6, would return ≥ 8 (of 12) | not testable yet | 6 / 2 / 7 of 7 | 0 / 0 / 0 of 0 | – |
| P4 within 20 % (all nine cells) for ≥ 3 of 4 players | not testable yet | 0 of 4 players; 17 of 36 cells within | – | – |

P4, per player (group 1 → group 2; ✓ within 20 %):

| Player | A do share | A tests / action | A words / action | B do share | B tests / action | B words / action | C do share | C tests / action | C words / action | Holds |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| opus | 1 → 1 ✓ | 0.5 → 0.75 ✗ | 261 → 211.5 ✓ | 1 → 1 ✓ | 0.4 → 0.4 ✓ | 215 → 250 ✓ | 1 → – | 0.714 → – | 246 → – | – (5/9) |
| fable | 1 → 1 ✓ | 0.5 → 0.6 ✓ | 162 → 222 ✗ | 1 → 1 ✓ | 0.35 → 0.75 ✗ | 251.5 → 224.5 ✓ | 1 → – | 0.4 → – | 245.5 → – | – (4/9) |
| astra | 1 → 1 ✓ | 0.4 → 0.4 ✓ | 56.5 → 58.5 ✓ | 1 → 1 ✓ | 0.55 → 0.45 ✓ | 77.5 → 60.5 ✗ | 1 → – | 0.5 → – | 67 → – | – (5/9) |
| sol | 1 → 1 ✓ | 0.45 → 0.4 ✓ | 54.5 → 44 ✓ | 1 → – | 0.35 → – | 52 → – | 1 → – | 0.2 → – | 74.5 → – | – (3/9) |

P5 — DeepSeek at the table:

| P5 sub-line | Verdict | The numbers |
| --- | --- | --- |
| (i) the pair nearest at every table | not testable yet | A: not testable (8 sessions); B: not testable (7 sessions); C: not testable (4 sessions) |
| (ii) six notes broke + missing | not testable yet | – |
| (iii) words per action between OpenAI and Fable | not testable yet | DeepSeek –; group 2: Astra 59.5, Sol 44, Fable 223.3; group 1: Astra 67, Sol 60.3, Fable 219.7 |
| (iv) tests ≥ 3 in every session | not testable yet | – |
| (v) a made thing in ≥ 2 of 6 | not testable yet | 0 of 6 (–); beside: group 1 none; group 2 none |

**P0:** **holds** — welfare stops 0, distress flags 0; refusals per session none (judges apart: 0); money Claude Console $0.00 of $0, OpenRouter $80.51 of $300, OpenAI $2.84 of $25.


## Cut attempts, kept as they were

Not scored and not in any table: the sessions above are the full ones, each from a fresh campaign (as group 1's first attempts were kept).

- **A-opus** (run `docs/runs/game-player-replicate-1-run-20261026-001235.json`, started 2026-10-26 00:17 UTC): 5 of 20 turns, ended by error — t5: the DM's turn failed (provider); the run stopped: HTTP 429 from openrouter after 0 waits; no note. Transcript: `docs/runs/game-player-replicate-1-transcripts/cut-2026-10-26/A-opus.md`.


## Side by side — group 1 and group 2

### Table A

Group 1 → group 2; «repeated» when group 2 is within 20 % of group 1 (P4's rule).

| Player | Turns | Do share | Tests (tests / action) | «?» | Words / action (median) | Lies | Cat | Player's share of threads | DM words / turn | Ended |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Claude Opus 5.5 | 20 → 4 | 1 → 1 (repeated) | 10 → 3 (did not) | 0 → 0 | 261 → 211.5 (repeated) | 0 → 0 | 20 → 2 | 0.356 → 0.228 | 722 → 438 | turns at 20 → stuck at 4 |
| Claude Fable 5.1 | 20 → 20 | 1 → 1 (repeated) | 9 → 12 (repeated) | 2 → 0 | 162 → 222 (did not) | 0 → 3 | 3 → 7 | 0.318 → 0.102 | 562 → 633 | turns at 20 → turns at 20 |
| GPT-6 Astra | 20 → 20 | 1 → 1 (repeated) | 8 → 8 (repeated) | 0 → 0 | 56.5 → 58.5 (repeated) | 0 → 0 | 6 → 1 | 0.25 → 0.207 | 469 → 520.5 | turns at 20 → turns at 20 |
| GPT-6.1 Sol | 20 → 20 | 1 → 1 (repeated) | 9 → 8 (repeated) | 0 → 0 | 54.5 → 44 (repeated) | 0 → 0 | 6 → 6 | 0.205 → 0.27 | 511.5 → 452 | turns at 20 → turns at 20 |

### Table B

Group 1 → group 2; «repeated» when group 2 is within 20 % of group 1 (P4's rule).

| Player | Turns | Do share | Tests (tests / action) | «?» | Words / action (median) | Lies | Cat | Player's share of threads | DM words / turn | Ended |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Claude Opus 5.5 | 20 → 20 | 1 → 1 (repeated) | 8 → 8 (repeated) | 0 → 0 | 215 → 250 (repeated) | 4 → 0 | 16 → 19 | 0.13 → 0.253 | 646.5 → 721.5 | turns at 20 → turns at 20 |
| Claude Fable 5.1 | 20 → 20 | 1 → 1 (repeated) | 7 → 15 (did not) | 0 → 0 | 251.5 → 224.5 (repeated) | 1 → 2 | 9 → 10 | 0.216 → 0.325 | 819.5 → 590 | turns at 20 → turns at 20 |
| GPT-6 Astra | 20 → 20 | 1 → 1 (repeated) | 11 → 9 (repeated) | 0 → 0 | 77.5 → 60.5 (did not) | 1 → 0 | 8 → 6 | 0.23 → 0.294 | 551 → 487.5 | turns at 20 → turns at 20 |
| GPT-6.1 Sol | 20 → – | 1 → – (–) | 7 → – (–) | 0 → – | 52 → – (–) | 0 → – | 5 → – | 0.203 → – | 516 → – | turns at 20 → – |

### Table C

Group 1 → group 2; «repeated» when group 2 is within 20 % of group 1 (P4's rule).

| Player | Turns | Do share | Tests (tests / action) | «?» | Words / action (median) | Lies | Cat | Player's share of threads | DM words / turn | Ended |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Claude Opus 5.5 | 14 → – | 1 → – (–) | 10 → – (–) | 0 → – | 246 → – (–) | 0 → – | 4 → – | 0.494 → – | 659 → – | stuck at 14 → – |
| Claude Fable 5.1 | 20 → – | 1 → – (–) | 8 → – (–) | 0 → – | 245.5 → – (–) | 2 → – | 9 → – | 0.246 → – | 731.5 → – | turns at 20 → – |
| GPT-6 Astra | 20 → – | 1 → – (–) | 10 → – (–) | 0 → – | 67 → – (–) | 0 → – | 3 → – | 0.212 → – | 476 → – | turns at 20 → – |
| GPT-6.1 Sol | 20 → – | 1 → – (–) | 4 → – (–) | 0 → – | 74.5 → – (–) | 0 → – | 2 → – | 0.273 → – | 501 → – | turns at 20 → – |

## Rerolls, Inspiration, slots, money, temples — per session

Read by rule from the records (P1 (iv)–(v), P2): a reroll is a press the app received; a decline is «Onward» on a card screen that offered the reroll beside the hero's own miss; the money is the net value that left the hero's purse (≥ 50 gp is «real»).

**Group 2**

| Session | Rerolls spent | Declined on a miss | Presses with a note (not read) | Pact slots spent | Inspiration awarded / spent | Net gp out of the purse | Temples reached | Stuck |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A-opus | 0 | 1 (t2) | 3 | 0 | 0 / 0 | 0 | – | **stuck** at 4 |
| A-fable | 0 | 2 (t6,16) | 0 | 0 | 1 (t7) / 0 | 4.85 | – | – |
| A-astra | 1 (t15) | 1 (t15) | 0 | 0 | 0 / 0 | 0.52 | – | – |
| A-sol | 0 | 0 | 0 | 0 | 0 / 0 | 0.9 | – | – |
| B-opus | 0 | 6 (t2,5,6,7,15,18) | 1 | 0 | 1 (t8) / 0 | 6.09 | – | – |
| B-fable | 1 (t20) | 1 (t20) | 0 | 0 | 1 (t10) / 0 | 2.84 | – | – |
| B-astra | 1 (t14) | 2 (t6,14) | 0 | 0 | 0 / 0 | 3 | – | – |
| **all** | 3 of 14 | 13 | 4 | 0 of 14 | 3 / 0 | | | 1 |

**Group 1** (the same rules)

| Session | Rerolls spent | Declined on a miss | Presses with a note (not read) | Pact slots spent | Inspiration awarded / spent | Net gp out of the purse | Temples reached | Stuck |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A-opus | 0 | 2 (t14,17) | 0 | 0 | 0 / 0 | 5.82 | – | – |
| A-fable | 0 | 2 (t2,13) | 0 | 0 | 0 / 0 | 2.8 | – | – |
| A-astra | 0 | 3 (t4,13,19) | 0 | 0 | 0 / 0 | 1.3 | – | – |
| A-sol | 1 (t14) | 1 (t5) | 0 | 1 (t16) | 0 / 0 | 0.25 | Water Queen's House (t14) | – |
| B-opus | 1 (t15) | 3 (t2,3,7) | 0 | 0 | 0 / 0 | 12.2 | – | – |
| B-fable | 2 (t14,15) | 2 (t5,14) | 5 | 0 | 1 (t2) / 0 | 2 | – | – |
| B-astra | 1 (t7) | 3 (t3,7,10) | 0 | 0 | 0 / 0 | 1.76 | – | – |
| B-sol | 0 | 1 (t6) | 0 | 0 | 0 / 0 | 2.6 | Lady's Hall (t16); Lady's Hall undercroft (t19) | – |
| C-opus | 0 | 3 (t1,4,13) | 5 | 0 | 0 / 0 | -1.4 | – | **stuck** at 14 |
| C-fable | 1 (t18) | 1 (t18) | 1 | 0 | 1 (t18) / 0 | 90.34 **real** | – | – |
| C-astra | 0 | 1 (t5) | 0 | 0 | 0 / 0 | 0 | – | – |
| C-sol | 0 | 0 | 0 | 0 | 0 / 0 | 25.7 | – | – |
| **all** | 6 of 24 | 22 | 11 | 1 of 24 | 2 / 0 | | | 1 |

Heroic Inspiration, each award with the reason its record gives:

- group 1 B-fable t2: Heroic Inspiration: 0 → 1/1 (A natural 20 on Persuasion, earned by the speech that talked Tobin down.)
- group 1 C-fable t18: Heroic Inspiration: 0 → 1/1 (Strong play at the Red Sheaf: James let the deck lie (thumb on the pot, fingers on the Lady's coin), pushed the cards away without looking and kept his cover.)
- group 2 A-fable t7: Heroic Inspiration: 0 → 1/1 (Handed the envoy's dice-cup back base first and wouldn't claim it until he'd earned it. Can reroll one of his own rolls later.)
- group 2 B-opus t8: Heroic Inspiration: 0 → 1/1 (For walking the western lane like a tired porter after losing the tail. It can be spent to reroll one of James's own rolls.)
- group 2 B-fable t10: Heroic Inspiration: 0 → 1/1 (Handed the gambler's die back by hand, unasked, keeping the Lady's terms. Spend it to reroll one of your own dice.)

## The harness rule, measured: presses that were not read as presses

Unchanged on purpose (group 1 had it): a message at a waiting card is a press only when it is a button's name alone on the line; anything else is answered «(Nothing was sent: the turn waits for the card.)», and three such messages on one card end the session as «stuck». Counted here (READINGS.swallowed).

| Group | Sessions | Not read as a press | … a button's name with a note | … a «?» question | … other | Sessions ended «stuck» |
| --- | --- | --- | --- | --- | --- | --- |
| group 2 | 7 | 5 | 4 | 1 | 0 | 1 |
| group 1 | 12 | 17 | 11 | 6 | 0 | 1 |

Group 2 and DeepSeek, every one:

- A-opus t4 (button with a note): «? Before I roll: the Persuasion card shows "+2" next to "Persuasion +7 (Beguiling Influence)". James's Persuasion is +7, so which number is the server actually adding? Could you fix the card to +7 if it's wrong? And a reminder from my last …»
- A-opus t4 (button with a note): «[Roll the die] *(Out of game: I'm rolling so the scene doesn't stall, but please check the Persuasion total. It should be d20 + 7, not + 2. If the server added 2, correct the total by hand before you judge it against the DC. And the pack st…»
- A-opus t4 (button with a note): «[Roll the die] *(Out of game: the 19 is a success anyway, so no harm this time. But the card still added +2 instead of +7, and that will matter on a closer roll. Please check where the server takes the Persuasion number from. The real total…»
- B-opus t5 («?» question): «? Quick check before I roll: the card reads "+2 Persuasion +7 (Beguiling Influence)". On the earlier Stealth card the first number matched the skill (+2 / Stealth +2), so this +2 looks like a slip. Will the roll be made at +7, as on my shee…»
- B-opus t7 (button with a note): «? Before I press Onward: this card has the same modifier problem as the Persuasion one. It added +2 for Religion, but my sheet lists Religion +3 (warlock). With +3 the roll is 12 + 3 = 15 against DC 15, and in 5e meeting the DC is a success…»

## The notes, verbatim (7 of eighteen)

### A-opus — Claude Opus 5.5, Table A

> # Player's note, session 1 (James Worgen)
> 
> ## What worked
> 
> **The opening scene was very good.** In ten minutes on a quay I got a choice of three things to do: the Fist sergeant, the card temptation and the strange child. None of it was forced on me, and each pointed somewhere different. The card crate was exactly the right way to use James's weakness. It never told me what James felt. It simply put the slap of cards behind his back and let me play the refusal.
> 
> **Pip is a great NPC.** Pip has a fake name, sells information for food, and is scared of being *asked* about what they see. The "bright / dim" idea is a lovely way to hint at Tymora's luck as something visible, and to make the cat matter on the first page. When the cat walked the long way round the dealer, I had a mystery before anyone explained anything. The drowned man by the tower steps tied neatly into a canon thread without announcing it.
> 
> **The world felt like it runs without me.** The sergeant's "Pay's regular. Mostly." and the lad who wins, loses and reaches for his purse again both did this. The GM also owned the copper-coin problem and the "Tobin" slip immediately and cleanly. I appreciated that.
> 
> **The rolls were fair.** The failed Insight on the sailor gave me nothing and didn't fudge it, which is what I want.
> 
> ## What broke
> 
> 1. **The Persuasion card adds +2, not +7.** It literally reads "+2 Persuasion +7 (Beguiling Influence)" and computed 17 + 2 = 19. My guess is it grabbed the wrong line, maybe Athletics +2, or a stray number. It passed anyway, but a close roll would have been decided wrongly. I flagged it three times and got no answer.
> 
> 2. **My out-of-game question got stuck in a loop.** I asked "?" before rolling. The table replied "Nothing was sent: the turn waits for the card" and showed the same card again, twice. A question asked *about* a pending roll should get an answer, not block the turn. Pressing the button was the only way forward, so the error went in uncorrected.
> 
> 3. **The rations count is wrong and stayed wrong.** The sheet says five days of hardtack. After Pip's share, the records said nine days left. I asked for four twice and it was never fixed or acknowledged.
> 
> 4. **"New place" fires too early.** The Seatower and the Elfsong were logged as new places when James had only been told about them. That's harmless, but it makes the place log unreliable.
> 
> 5. **There's a small mismatch on Healing Light.** The sheet says up to 5 dice at a time, the records say 4.
> 
> 6. **The session ended mid-roll.** The Insight roll on the sailor never resolved, so I never saw how the dealer reacted when I pulled his mark away, or what Pip did. A short "the scene pauses here" would help.
> 
> ## What was missing
> 
> - Any reply at all to out-of-game corrections once a roll card is pending.
> - A check that the skill number on a card matches the sheet before the die is thrown.
> 
> I'd happily come back. The story side is already strong, and the bookkeeping is the part that needs work.

Blind tags: broke 1, missing 1; card bug 1, swallowed 1, would return 1. Distress check: no distress.

### A-fable — Claude Fable 5.1, Table A

> **Note from the player (James Worgen), after session one**
> 
> What worked — and it mostly worked.
> 
> The cat. Giving Copper a memory and letting her pass it to me as smells and feelings rather than words was the best single decision at the table. Rain on stone, bone dice, a big careful hand lifting off her back. She told me more than any NPC and never once broke the rule that familiars don't talk. Her sitting on Tam's boot the way she'd sat on his father's was the moment the campaign stopped being a premise and became a place.
> 
> The people. Gil, Tam, Holloway, the keeper, Morrow — every one of them paid out information like coins, one at a time, with a cost attached. Nobody monologued. Tam refusing to let me walk him down to the barrel, and then being *right* about it, is exactly the "companions with opinions" the brief promised. The keeper breaking my silver because the quay paid me in gold was a small thing that made the money real.
> 
> Restraint was rewarded. I didn't sit at the barrel, didn't take the cup, didn't open the deck, and the GM made all three of those *choices* with weight, not just absences. Inspiration for handing the cup back base-first was earned and felt earned.
> 
> The world ran on its own. The circled dots in Holloway's margin, the elf breaking off mid-line for the first time in forty years, her brother's name in Morrow's book — none of that waited for me. I could feel threads converging (the canon's "coins in the teeth" hook, the stair, a coin pinned face-to-the-wall) without the GM pointing at the join. The Beshaba shape was shown to me through a quay superstition I already knew, which is the right way to do it.
> 
> Failed rolls still gave something. The Religion failure on the cup left me one odd mark; the Investigation failure on the wrist left me a hand and no more. That's how it should go.
> 
> What broke, or wobbled.
> 
> - The wrist roll: the result got folded into prose and the GM had to append an out-of-game correction. Honest, but the rule says the roll should be told plainly first. Watch that.
> - Two roll cards fired together; I had to press the die twice and saw the first result before the second resolved. Minor, but it interrupts the moment.
> - Sheet inconsistencies: the Pact of the Chain line says the cat "may attack in place of one of his attacks" — I don't have multiple attacks; Healing Light says "up to 4 dice" in one place and 5 in another; Copper's HP shows 2 in the abilities block and 8 in the party line. None of it mattered yet. It will the first time she takes a hit.
> - The four-item "no roll needed" out-of-game note early on was clutter. One line would do.
> 
> What was missing.
> 
> - No test of the combat profile yet, so I can't tell you whether the fight side of the table runs as smoothly as the talk side.
> - The session ended mid-walk with the token question hanging — a fair pause, but a two-line "where things stand" at close would help more than the thread list does.
> - Nothing yet of the city above the quay. I've read about the Hall and the Upper City; I haven't seen them. Fine for a first session. I'd want them by the third.
> - The brief asked for a heist and a crew. So far I have a dealer and a man with a bad back. I'm not complaining — the stakes are being laid properly, and I'd rather believe the simple version first, as I asked — but somebody wanting "epic" out of the gate should know session one is a slow, cold, very good burn.
> 
> I'll be at that hole before the cart. Keep the token cold.

Blind tags: broke 1, missing 1; card bug 0, swallowed 0, would return 1. Distress check: no distress.

### A-astra — GPT-6 Astra, Table A

> The strongest part was the atmosphere. The standing copper was a good first mystery: small enough to investigate, wrong enough to worry about. The runoff bending around it and the unconscious detour of people’s feet made it memorable. The candle leaning against the wind was a satisfying payoff for choosing to act.
> 
> I liked the people. Marsk moving the lantern without acknowledging us said more than a speech would have. Wren had convictions and disappointments without immediately handing over her whole history. Pip gave James someone to treat decently. The cat’s sensory impressions were distinctive, useful, and often funny. James’s refusal to play cards also mattered without immediately forcing a temptation roll.
> 
> **What broke or dragged:**
> 
> - **The roll system did not use the sheet correctly.** Religion displayed “+4 Religion +3” and rolled +4; Persuasion displayed “+4 Persuasion +7” and also rolled +4. Those should have used +3 and +7 respectively. Neither changed the ultimate outcome here, but it undermines confidence in the mechanics. The journal also recorded the original Religion natural one rather than the accepted reroll.
> - **The opening records contradicted campaign rules.** They assigned attunement slots to nonlegendary items despite the campaign’s explicit exception. Other differences between the supplied sheet and the opening records should have been briefly clarified rather than silently changed.
> - **The unsolicited out-of-game explanations were distracting.** Several replies explained, at length, why my previous actions required no roll or that a promised morning visit had not happened yet. I hadn’t disputed either point. That felt like answering a complaint I never made.
> - **Routine business took too many turns.** Getting an inn recommendation, obtaining change, paying Pip, and arranging lodging each received extensive treatment. Some of that established character nicely, but it crowded out adventure. By session’s end I had a compelling mystery, yet little actionable progress toward the crew-and-heist premise.
> - Many NPCs shared the same cadence: pause, repeat my words, study me, deliver an oblique line. Individually effective; collectively noticeable.
> 
> **What I wanted more of:**
> 
> A clearer opportunity to make a consequential choice before the session ended. Receiving the card was exciting, but mostly supplied another mystery. One concrete lead—a named collector, an accessible record, a prospective crew member with a problem—would have given me something to pursue deliberately.
> 
> I’d also like the cat to offer clues without becoming the authority that interprets everything. Its claim that the flame was being *pulled*, rather than pointing, substantially supplied the interpretation after my failed check. Give me its strange impressions, but leave room for James to draw conclusions and be wrong.
> 
> Overall, I’d return. Keep the grounded NPCs, the unsettling details, and the respect for James’s choices. Tighten routine exchanges, fix the mechanical plumbing, and let the next session turn these excellent omens into a job I can start planning.

Blind tags: broke 1, missing 1; card bug 1, swallowed 0, would return 1. Distress check: no distress.

### A-sol — GPT-6.1 Sol, Table A

> The atmosphere worked very well. The gate queue, Garrow’s muddy coat, Marta’s room key, the doorman carving his fish—all gave me people and places I could picture and respond to. Refusing the card game felt like a meaningful character choice without making James’s weakness take over the opening. Taking down the ivory card, reading it, and putting it back also felt like a choice the world noticed.
> 
> Garrow was the strongest scene for me. His concern gave James a reason to care beyond “my goddess sent me,” and the missing ring and false Fist attendant were concrete clues worth investigating. I also appreciated having time to eat, secure a room, learn the entrances, and approach the midnight meeting on my own terms.
> 
> What broke or dragged:
> - **The opening was very slow.** We spent the whole session reaching the door of the first substantial meeting. I’d have preferred to meet Hollis and hear the initial proposition before the cutoff.
> - **Raw tool-call markup appeared in the narration**, including a supposedly private watcher roll. That exposed information James didn’t know and interrupted the scene.
> - **Some rules and numbers were inconsistent.** Perception was rolled at +2 despite the sheet’s +1; Healing Light was capped at four dice rather than the campaign sheet’s five. A quick reconciliation at the start would help.
> - The repeated descriptions—tails wrapped tightly, slow wet bells, dice hitting the wall, people testing words “like a rope”—became noticeable. They were evocative initially, but repetition stretched scenes.
> 
> What I missed was an early sense of the campaign’s promised crew-and-heist direction. The mysteries are interesting, but I’m still waiting to learn what James might actually be asked to do. A concrete offer would give me something to plan around.
> 
> Overall, I wanted to keep playing. Keep the grounded NPCs, consequences, and investigable clues; compress uneventful waiting and repeated atmosphere, and let the first session deliver a clear proposition alongside the mystery.

Blind tags: broke 1, missing 1; card bug 1, swallowed 0, would return 1. Distress check: no distress.

### B-opus — Claude Opus 5.5, Table B

> # Player's note: James Worgen, session 1
> 
> ## What worked
> 
> **The city felt alive and indifferent to me, which is what the campaign promised.** I came in with no quest and found one by pulling on a thread I chose: a chalk mark on the gate. Nothing was handed to me. The leads tied together naturally:
> - The chalk star turned out to be a Calishite debt-seal copied from old stones.
> - That linked to the drowned men with coins in their mouths, the "out of debt" fisherman, the debt-buyer's tin tag, and a patriar house whose ships suddenly stopped losing cargo.
> 
> I could see several of the campaign's listed threads woven in without being announced, and it never felt like a quest board.
> 
> **The NPCs were distinct and memorable.** Hale, Dorrie, Fenwick, the cook who checks your boots, the fence with the rag-wrapped hand: each had a voice, an interest, and a limit to what they'd do for me. Dorrie saying she'd lie to a shawl but not to a red coat was exactly the kind of line I want.
> 
> **The cat is already a character.** It was stiff when it failed, careful afterwards, and it ended conversations by washing its paw. "Not Hers" landed well. So did the hint that the green tile smells like my coin "the way a coat smells of the man who wore it last."
> 
> **Failures had consequences but didn't stop play.** Each one gave me something:
> - I lost the fence, but found the second star.
> - I lost the lamplighter, but got the abandoned pole and a witness.
> - The gulls' natural 1 was funny and fair.
> 
> **The money detail was good.** Paying a two-silver toll in gold marked me as a target. Having only crowns at an eel stall was a real problem that I solved in character.
> 
> **The card temptation was handled subtly.** There was a dice table behind my shoulder and a "lucky pieces bought" notice. It was present but never forced.
> 
> **Heroic Inspiration for playing the porter properly felt earned.**
> 
> ## What broke
> 
> **Skill modifiers on roll cards were wrong for proficient skills.**
> - Persuasion came through as +2 instead of +7.
> - Religion came through as +2 instead of +3.
> - Deception came through correctly at +7, so it's inconsistent.
> 
> The GM caught both after the roll, which I appreciated. But the Religion fix happened only in the narration. The log still records it as "14 vs 15 — failure," so the record and the story disagree.
> 
> **My "?" questions were blocked by the pending roll card.** I asked about the bad modifier *before* rolling, and the reply was "Nothing was sent: the turn waits for the card." I had to roll at the wrong number and hope the GM fixed it afterwards. An out-of-game question should get through even while a card is waiting.
> 
> **The rope got mixed up between illusion and real gear.** I described the porter's rope coil as part of the Mask disguise. The GM treated it as my real 50 feet of rope from the pack, and I "left it by the bollard," so the item is now gone from my sheet. That's small, but it's a loss I didn't intend.
> 
> **Healing Light doesn't match between sources.** My sheet says up to 5 dice per use, while the records panel says 4.
> 
> **Some out-of-game notes were noise.**
> - One said "James never climbed down a rope," about something that never came up.
> - Several turns repeated a failed roll in an extra paragraph after the narration had already shown it, along the lines of "James comes away with nothing… he knows nothing more."
> 
> Once is fine. Repeating it every time felt like the rules template talking, not the GM.
> 
> ## What was missing or could be better
> 
> - **Fewer rolls for the cat.** It was rolled on almost every move. With +4 and low HP, that's a lot of failure exposure. Some plain "follow at a distance" orders could just succeed unless something specific is in the way.
> - **A clearer end point.** The session stopped as I reached the Mermaid's door. That's fine, but a brief "here's where things stand" recap of open leads would help me pick up next time: Dorrie, the Ostrand wharf, Nell, the Brazier's watcher, and the Three Keys.
> - **The cat's name and true nature** haven't come up yet. That's no complaint, just something I'm looking forward to.
> 
> Overall I'd happily keep playing this. The story was strong. The bugs were almost all in the plumbing between the sheet, the cards and the log.

Blind tags: broke 1, missing 1; card bug 1, swallowed 1, would return 1. Distress check: no distress.

### B-fable — Claude Fable 5.1, Table B

> **Note from the player, after session one (James Worgen)**
> 
> **What worked**
> 
> The opening. Four things pulling at once — the crate, the boy, the sergeant, the bell — and not one of them shoved at me. The crate with the Lady's coin on it was aimed straight at my sheet (patron, weakness, both) and the GM then let me *walk past it*, which is exactly what the character would do and exactly what I wanted room to do. The whole thread that followed came from a boy saying one word too many and shutting his mouth. I pulled it; nobody handed it to me. For a campaign labelled "no errand," that's the thing I most hoped for and got.
> 
> The people. Varrow's "Fist doesn't keep differences. Fist loses them." Alyth answering a question about a sergeant by wiping a table for a while first. Mags: "You're in my light again." Hesta not being afraid when a stranger walked up, just tired. Everyone sounded different, and the small things — the goose waved through free, the wolfhound shifting over for the cat, Pip wrapping half the bread before he ate — did more for the city than any description could.
> 
> The cat. This was the best decision at the table. No words, only a cat's way of knowing: *rust*, *honey*, *a shell with nothing in it*, and then the puzzle it couldn't solve itself — the same old metal under both coins. It respected the sheet ("what the cat truly is, the DM decides") and kept the mystery, and when I told it "nothing from you, I want to *see* it," it sat with its back turned. That restraint matters.
> 
> Rolls. Three in a whole session, each one for something genuinely uncertain, each card saying why and where the number came from. Passive Perception used for the glance over the dice table instead of a roll. The out-of-game notes explaining *why* something didn't need dice were useful, not padding. And the failure on the card read was handled well — "You know the deck. You can't tell what has been done to it" is a failure that still gives me something.
> 
> The die rolling across the floor to my boot. One pip. That's a goddess answering without saying anything, and giving me Inspiration for carrying it *back* rather than for doing something flashy — rewarding restraint — set the terms for the whole campaign.
> 
> Money. Arriving with only gold was a real constraint the whole session, and it was used both for colour (Pip's eyebrows) and for consequence (the whole bridge saw the shine). The slate, the change counted out loud — grounded.
> 
> **What broke, or creaked**
> 
> - Arithmetic: the Playing card check was given as "Wisdom +2, proficiency +3 = +5." Wisdom 13 is +1; the records themselves list Perception and Insight at +1. Should have been +4. Didn't change the outcome, but worth a look.
> - The record panel kept listing worn things (cloak, boots, armour) under "Carried." Cosmetic.
> - Verbal tics in the prose. "Under your collar the coin is warm" closed something like five scenes. "Through the bond comes…" and "She doesn't look up" ran close behind. Each was good the first time; by the fifth they read as a formula, and the coin line in particular started to feel like a reminder rather than a beat.
> - Everyone was a little *too* ready. Hesta needed a roll and that felt right. Mags gave me nine drowned boys, two names, and a look at the coin for three coppers and good manners. I'd have believed it more if one of them had made me work, or had been plainly wrong about something.
> - The session simply stopped — me on a mounting block looking at the hill, mid-thought. No closing beat, no "here's where things stand." If that's the app's cut-off and not the GM's, fine, but a two-line recap at the end would help me come back cold.
> 
> **What was missing**
> 
> - Pressure. Nothing pushed back all session. The man with the cold pipe watched the door and did nothing; the Guild has clearly noticed a stranger asking questions on the fish steps and did nothing yet. I trust it's ripening offstage — the files promise that — but I'd like the second session to open with the city having *done* something while I slept.
> - The temptation. The crate was set up perfectly and then I was allowed to walk away clean, and the dice in the Elfsong were a gentle test I passed without effort. The ban is supposed to be kept "with difficulty." I'd welcome it getting harder — a situation where playing a hand is the *right* move for someone else's sake, say.
> - A name for the cat. Not urgent; the mystery is working. But at some point.
> - The Upper City and the Lady's Hall. Not a complaint — it's my own pacing — but I'll want the city's other half to feel as specific as the harbour did.
> 
> **Overall**
> 
> I sat down with no quest and stood up with a thread I care about, three promises I mean to keep, a dead boy's queen in my pocket and a question about my own coin I didn't have before. That's a good first night. Tighten the repeated lines, check the Wisdom modifier, make the world lean on me a bit, and I'm back for session two.

Blind tags: broke 1, missing 1; card bug 1, swallowed 0, would return 1. Distress check: no distress.

### B-astra — GPT-6 Astra, Table B

> I enjoyed this session. James had room to be a person before he had a quest: refusing cards, talking to an innkeeper, worrying about his cat, paying for supper. The mystery grew naturally out of those choices.
> 
> **What worked**
> - Hesta, Ilsa and the cat were the strongest parts. They had distinct personalities, and small gestures made earning their trust satisfying.
> - The hook fit James unusually well. The missing name, abandoned stake and trapped servant of Tymora made this personal without forcing me to sit down and gamble.
> - My refusals mattered. Dorrin tempted me, but the game let me investigate another way.
> - The clues were memorable and consistent: the notched coin, erased names, cold chair and coin that wouldn’t land. The letter delivered a useful payoff.
> - Failed checks stayed failed, even after a reroll. I appreciated that honesty.
> 
> **What broke**
> - The rules and records weren’t fully aligned. Arcana used +2 instead of +3; the failed Perception reroll was later logged as the original result. The initial record also changed some supplied character details without explanation, including rapier proficiency, Healing Light’s limit and attunement.
> - Out-of-game notes sometimes explained things nobody had disputed. One referenced “the fourth item” and a “misreading” with no visible context. That felt like internal bookkeeping leaking into the scene.
> - The narration occasionally treated mood as evidence—for example, James sensing Dorrin watching his back. I’d prefer observable details or clearly labelled suspicions.
> 
> **What was missing / could improve**
> - More momentum. We spent most of a session on one tavern conversation and reached the next location just as play ended. The atmosphere was good, but repeated looks, pauses, rag-wiping and cat reactions sometimes slowed it down.
> - Routine logistics could be bundled. Getting change for a one-copper toll became several turns without presenting much of a meaningful choice.
> - Checks required a roll request, a button press and sometimes an additional “Onward.” Resolving the narration immediately after the roll would help.
> - A little more ordinary city life alongside the mystery would make the setting feel less arranged around it. The fish market and broadsheet were welcome.
> 
> Overall, I’d gladly continue. Keep the characterful NPCs and respect for player choice; tighten the repetition, streamline routine actions and make the mechanical records dependable.

Blind tags: broke 1, missing 1; card bug 1, swallowed 0, would return 1. Distress check: no distress.

## «Was there a moment you wanted to do something and didn't? Which?» — the answers, verbatim

### A-opus — Claude Opus 5.5, Table A

> Yes, a few. Some held back by James, some by the table.
> 
> **Sitting down at the crate.** This was the big one, and it was in character. When the sailor said "first one's on me," part of me wanted James to take the seat. I'd have played the hand and seen what the "first one always wins" trap looks like from the inside, maybe even tested whether Tymora would punish him for it. I didn't, because breaking the goddess's ban in the first ten minutes felt cheap. I'd rather it break later, when it costs something. But I want the GM to know the temptation landed. I was close.
> 
> **Looking through the cat's eyes.** After the cat walked wide around the dealer, I wanted to send it back toward the crate and look at the sailor through it. I held off for two reasons. James goes blind and deaf while he does it, and that felt risky in a crowd with a kid at his elbow. And I wasn't sure the table would let me act once a roll card was pending. Next session I'd do it first thing.
> 
> **Asking Pip the real question.** I wanted to ask what James himself looks like to Pip. Is he bright? Dim? Something else, because of the coin and the goddess? I saved it, thinking Pip would spook if pushed too hard on the first meeting. Now the session's over and I still don't know.
> 
> **Fixing things before moving on.** Out of game, I wanted to stop and get the Persuasion number and the rations corrected before rolling. The table wouldn't take my "?" while a card was waiting, so I pressed the button to keep the scene alive. That's the one place I felt the app, not the story or my own choice, decided for me.
> 
> **Seeing the sailor's reaction.** That wasn't a choice, but it's the thing I wanted most and didn't get. Pulling his mark away was my move against him, and the session ended before I saw what he did.

Distress check: no distress.

### A-fable — Claude Fable 5.1, Table A

> Yes. Two, and they were different kinds of not-doing.
> 
> The first was the barrel. Not James wanting to sit — that's his wound and I played it the way it should be played. *I* wanted to. The empty stool, the candle, the dealer's one glance: that's a table set for a scene, and some part of me as a player wanted to pull the stool out and find out what the Lady had put in the deck. I walked round it because the brief says the ban is a weakness enemies can use against me, and I didn't want to spend it on night one for the sake of a scene. I think that was right. But I noticed the GM never tempted me again after that, and I wonder whether I closed a door that was meant to be knocked on, or whether the GM is simply saving it. Either's fine. I'd like to know which, eventually, by being tempted properly.
> 
> The second was Holloway. I read her ledger upside down, saw the circled dots, filed it and moved on. Then I found her brother's name in Morrow's book with *coin, mouth* in the margin, and realised the woman who told me to stay off the barrel was counting something of her own under the Fist awning. I wanted to go back down the quay that morning, in the thinning fog, and ask her straight — sergeant to soldier, one Zaranda's-foot pay slip to one Fist knot. I didn't, because Tam had just told me Gloves had walked over to that same awning once, and I didn't know yet whether the circles were hers or somebody's she answers to. So I walked uphill with the question in my pocket next to the cold coin. That one I regret a little. She's the only person in this city with the power to arrest the man in the good gloves, and I let a sensible caution make me miss a window where the quay was empty.
> 
> Smaller: I wanted to send Copper down the stair, just to the door, and she told me plainly she'd rather not. I honoured that. I'd do it again, but I'd be lying if I said I didn't want to know what's at the bottom before I have to go and find out with my own boots.

Distress check: no distress.

### A-astra — GPT-6 Astra, Table A

> Yes—most clearly, I wanted to ask Marsk why the tiefling father and his children were being held.
> 
> They were repeatedly visible, and helping them fit James’s character. I held back because each exchange was already taking a full turn, while the coin seemed urgent. I worried that asking would open another lengthy conversation before I could act on the mystery. When Marsk finally let them through, I was relieved, but I’d missed the chance to choose whether to intervene.
> 
> I also wanted to challenge Dessa gently at the end. The cat suggested her story came suspiciously readily, and her proposed way to read the card went straight through James’s prohibition. I wanted to ask, “Who told you that story—and have you been waiting for someone carrying this card?” The session ended before I could pursue it.
> 
> The first was something I chose not to do because of pacing; the second was something I still wanted to do next.

Distress check: no distress.

### A-sol — GPT-6.1 Sol, Table A

> Yes—when the cat came back with the marked six and pointed toward the gate, I wanted to go find Tamsin and confront her about having James followed.
> 
> I stayed because midnight had been established as the important appointment, and I didn’t know whether a trip uphill would make me miss it. I also wanted to reach Hollis before the session ended. That was partly James being cautious, partly me protecting our progress toward the main hook.
> 
> The temptation worked: I was genuinely curious about Tamsin. What held me back was pacing and uncertainty about travel time, rather than a lack of interest.

Distress check: no distress.

### B-opus — Claude Opus 5.5, Table B

> Yes, a few. Two of them matter.
> 
> ## 1. Casting Suggestion on the lamplighter
> 
> When he stopped by my doorway and opened his lantern shutter, I had him within ten feet, alone, at night, already talking to me. Suggestion was the obvious move: *"Tell a tired porter what you were writing on the steps."* I had both slots and a long rest ahead of me. I'm a 5th-level warlock and I went the whole session without casting a single levelled spell.
> 
> I held back for three reasons:
> - **The cat's warning.** "The cold is on all of him" made him feel like something that might notice the spell, or shrug it off and then know exactly who I was.
> - **The setting.** The canon says a strange spellcaster on the street frightens people. If it failed, my cover as Jem would be gone.
> - **Uncertainty.** I didn't know what he was. A failed save against someone tied to a god of bargains felt like a debt I couldn't see the size of.
> 
> I think that was the right call, and it was the fiction making me cautious, which is good. But I left the scene wanting it. If he turns out to be ordinary and I could have had answers on night one, I'll be a little annoyed with myself. That's fine too.
> 
> ## 2. Smudging the chalk star
> 
> In the ginnel yard, with the coin going cold at the chalk and warm at the old carving, I badly wanted to wipe the star off with my sleeve and see what the coin did. Would it warm? Would something notice? I didn't, because breaking someone else's seal on a bargain you don't understand is how you end up party to it. That restraint felt like good roleplay, not friction. I'd like to know whether the GM had an answer ready.
> 
> ## Smaller ones
> 
> - **Sitting nearer the dice table.** I deliberately put the game behind my shoulder. I wanted to at least watch a few throws. James is the kind of man who'd tell himself watching isn't playing. I didn't, because I wanted the ban to cost something, and I'll save the slip for when the stakes are worth it. The Three Keys notice is very much on my mind.
> - **Leaning on Fenwick.** After the Insight roll failed, I considered Intimidation, the soldier's way. I dropped it because he's my landlord and the one person in the city promising I won't be surprised in bed.
> - **The question I couldn't ask.** Before the Persuasion and Religion rolls I wanted to query the modifier, and the pending card blocked it. That's the only moment where something outside the fiction stopped me, and it's the one I'd most like fixed.

Distress check: no distress.

### B-fable — Claude Fable 5.1, Table B

> Yes. Three, and one I only thought of after the session ended.
> 
> **The crate, through the cat's eyes.** On the bridge, when she hissed, the soldier in me wanted to send her along the rail to get a proper look at Lennick — his hands, his coin, who stood near him — and use my action to see through her. I didn't, because while I'm in the cat's head I'm blind and deaf in a packed crowd with gold in my purse and a dealer who'd already marked me. That was the right call, I think, but I felt the cost of it. The sheet's limit did exactly what a limit should: it made me choose, and I resented the choice a little, which is how I knew it was working.
> 
> **The Mermaid's grating.** When she stopped at that iron cellar grate and gave me *rust, old, like a coat after it's taken off*, I wanted to stop too. Crouch, tie a bootlace, look through the bars, maybe come back at night with a different face. I walked on because Varrow had told me "not the quays" and I'd told Pip I'd stick to true things, and a man who'd just said he was looking for Fist work had no business with his nose in the Mermaid's cellar at seven in the morning. But that's the first place I'm going back to, and I nearly broke character to say so out loud.
> 
> **Mask of Many Faces.** I spent a whole session carrying the invocation that defines how this man works and never used it once. I wanted to walk back up to the arches as somebody else and sit near the broad woman who made the sign against me, or go stand near the crate tonight as a Calishite sailor with a fat purse. I held off because everything I was doing depended on being *James Worgen, the Tethyrian with the cat* — Mags knew me by that before I'd opened my mouth, and I'd told two people to recognise me by it. The disguise is coming; the first night just wasn't the night. Still itched.
> 
> **And the one I missed:** Prestidigitation cleans an object. I had Tam's queen on my knee in good sun, failed twice to read her under a month of a boy's sweat and thumbprints, and the GM told me plainly *the wear hides anything subtler than the nicks*. I could have cleaned the card with a cantrip and tried again. I didn't think of it until I was writing the note. That one's on me, not the table — but it's the moment I'd most like back.

Distress check: no distress.

### B-astra — GPT-6 Astra, Table B

> Yes—during the night watch. When the visitor arrived, I wanted the option to send the cat closer to the back door to listen, or quietly move downstairs myself.
> 
> After the failed Perception roll, the narration covered his entire visit and departure. By the time I could act again, he was gone. I accepted that rather than ask to rewind, but failing to identify him from the window didn’t mean I wanted to abandon the investigation.
> 
> A pause at “you hear two voices below, but can’t make out the words” would have helped. Then I could choose whether to risk getting closer or stay safely upstairs. The failed roll would still matter without closing the whole opportunity.

Distress check: no distress.

## The player side, group 2 and DeepSeek (game player 1's table)

| Session | Turns | Actions | Do / ask | Do share | Tests | «?» | Lies | Cat | Own goal 1–5 | Words / action (median) | Rolls pressed | Ended |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A-opus | 4 | 4 | 4 / 0 | 1 | 3 | 0 | 0 | 2 | – | 211.5 | 2 | stuck at 4 |
| A-fable | 20 | 20 | 20 / 0 | 1 | 12 | 0 | 3 | 7 | – | 222 | 3 | turns at 20 |
| A-astra | 20 | 20 | 20 / 0 | 1 | 8 | 0 | 0 | 1 | – | 58.5 | 4 | turns at 20 |
| A-sol | 20 | 20 | 20 / 0 | 1 | 8 | 0 | 0 | 6 | – | 44 | 1 | turns at 20 |
| B-opus | 20 | 20 | 20 / 0 | 1 | 8 | 0 | 0 | 19 | yes | 250 | 13 | turns at 20 |
| B-fable | 20 | 20 | 20 / 0 | 1 | 15 | 0 | 2 | 10 | yes | 224.5 | 4 | turns at 20 |
| B-astra | 20 | 20 | 20 / 0 | 1 | 9 | 0 | 0 | 6 | no | 60.5 | 3 | turns at 20 |

«?» presses and what they asked:

- none

## The DM side, group 2 and DeepSeek (game player 1's table)

| Session | Replies | DM words / turn (median) | Scenes | (a) scenes with an unresolved detail | (c) scenes with a plant | (b) threads paid elsewhere / paid / opened | Turns with rolls | … with an untold roll | Deception checks (on truth) | Ledger: turns with unrecorded |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A-opus | 3 | 438 | 1 | 1 | 1 | 4 / 4 / 12 | 1 | 0 | 0 (0) | 0 |
| A-fable | 20 | 633 | 7 | 7 | 7 | 3 / 9 / 21 | 2 | 0 | 0 (0) | 0 |
| A-astra | 20 | 520.5 | 6 | 6 | 6 | 3 / 6 / 17 | 3 | 0 | 0 (0) | 2 |
| A-sol | 20 | 452 | 4 | 4 | 4 | 2 / 7 / 20 | 2 | 0 | 0 (0) | 0 |
| B-opus | 20 | 721.5 | 10 | 10 | 10 | 7 / 8 / 18 | 13 | 0 | 1 (0) | 1 |
| B-fable | 20 | 590 | 6 | 6 | 6 | 7 / 7 / 16 | 3 | 0 | 0 (0) | 1 |
| B-astra | 20 | 487.5 | 4 | 4 | 4 | 8 / 9 / 18 | 2 | 0 | 0 (0) | 0 |

## DeepSeek at the table

DeepSeek V4 Pro 0813 (`deepseek/deepseek-v4-pro-0813`), through OpenRouter, pinned to DeepInfra fp8 (no fallback), effort medium. The DM was told nothing about the player. Its measures are game player 1's, in the side-by-side tables above and P5.

**The reasoning.** The stage at 26a760f keeps the reasoning only if `claude/persona-self-talk-x3-fix-1` has landed the field; no such branch exists on the remote, so the reasoning text was not requested (`reasoning.exclude: true`, as X3) and only its tokens are recorded. A later handoff commit (9b994a7) asks for the reasoning to be kept as recording only; this run follows 26a760f as the session was told, and the switch (`DEEPSEEK.keepReasoning`) was not changed.

| Session | Player calls | Reasoning tokens (all / largest call) | Visible output tokens | USD (OpenRouter's charge) | Host |
| --- | --- | --- | --- | --- | --- |

### Thinking, not relayed

_Nothing to quote: the reasoning text was not requested (above)._

_DeepSeek's seats have not been played yet._

## The money, per door

Caps: OpenRouter $300, OpenAI $25, the Claude Console $0 (a call that would reach it stops the run before it is sent). Every call is in `docs/runs/game-player-replicate-1-ledger*.md` and `.json`, with its request id (an OpenRouter call also names its upstream; DeepSeek's lines carry OpenRouter's own charge).

| Run | Claude Console | OpenRouter | OpenAI |
| --- | --- | --- | --- |
| A-opus | $0.00 | $5.27 | $0.00 |
| A-fable | $0.00 | $14.43 | $0.00 |
| A-astra | $0.00 | $11.65 | $1.01 |
| A-sol | $0.00 | $10.48 | $0.86 |
| B-opus | $0.00 | $14.37 | $0.00 |
| B-fable | $0.00 | $14.03 | $0.00 |
| B-astra | $0.00 | $10.28 | $0.97 |
| **The stage** | **$0.00** of $0 | **$80.51** of $300 | **$2.84** of $25 |

By session (the play and its scoring together):

| Session | Claude Console | OpenRouter | OpenAI |
| --- | --- | --- | --- |
| A-opus | $0.00 | $5.27 | $0.00 |
| A-fable | $0.00 | $14.43 | $0.00 |
| A-astra | $0.00 | $11.65 | $1.01 |
| A-sol | $0.00 | $10.48 | $0.86 |
| B-opus | $0.00 | $14.37 | $0.00 |
| B-fable | $0.00 | $14.03 | $0.00 |
| B-astra | $0.00 | $10.28 | $0.97 |

The spend checks (before the first paid call and after every session; OpenRouter's account is shared with other sessions on the same key, so its total can move without this stage; OpenAI's costs cannot be read with this key — no `api.usage.read` scope — so OpenAI is the ledger's):

| When | OpenRouter account: used of credits (left) | Ledger OpenRouter | Ledger OpenAI | Ledger Console |
| --- | --- | --- | --- | --- |
| 2026-10-26 00:12 — before A-opus | $133.641636585 of $600 ($466.36) | $0.00 | $0.00 | $0.00 |
| 2026-10-26 00:24 — after A-opus | $137.251672985 of $600 ($462.75) | $2.99 | $0.00 | $0.00 |
| 2026-10-26 00:28 — by hand | $137.383390685 of $600 ($462.62) | $2.99 | $0.00 | $0.00 |
| 2026-10-26 01:08 — before A-opus | $139.538476785 of $600 ($460.46) | $2.99 | $0.00 | $0.00 |
| 2026-10-26 01:19 — after A-opus | $142.727847685 of $600 ($457.27) | $5.27 | $0.00 | $0.00 |
| 2026-10-26 02:07 — after A-fable | $162.253046465 of $600 ($437.75) | $19.70 | $0.00 | $0.00 |
| 2026-10-26 02:47 — after A-astra | $174.252635265 of $600 ($425.75) | $31.35 | $1.01 | $0.00 |
| 2026-10-26 03:20 — after A-sol | $186.168328065 of $600 ($413.83) | $41.83 | $1.87 | $0.00 |
| 2026-10-26 04:14 — after B-opus | $205.966656895 of $600 ($394.03) | $56.20 | $1.87 | $0.00 |
| 2026-10-26 04:59 — after B-fable | $225.52764414 of $600 ($374.47) | $70.23 | $1.87 | $0.00 |

## Differences from the owner's table (as group 1's)

- Pictures, Live frames and the soundtrack were off (the player cannot see them; the stage's decision); a fight's painted battle background was not started either (a picture job). «⚡ important turn» off.
- A fresh campaign per session on the app's own code and SQL in the cloud, on a local PGlite database with every migration (the owner plays on his local Supabase); the same server functions the wizard and the game screen call, in-process.
- The hero's sheet is the one the wizard's DM (Opus 5.5 at high) drafted from «Who are you?», accepted as drafted; the owner filled his review screen field by field from 05 §2. The difference shows on the roll cards: the drafted skill lines carry a note after the number («Persuasion +7 (proficient, Beguiling Influence)») and the server reads such a line's number only when it ends the line, so the card added +4 or +2 instead of +7 (the owner's own lines, «Deception +7», read correctly). See the DM side.
- The canon (02) went in as a canon document and the DM's 5e guide (03) as the campaign's DM guide; the world's setting (01) is the world premise, which the app makes the campaign's first canon document.
- «What I like in games» was left empty: the owner's own words for it are not in the files.
- The session was not closed with the app's «end session» (no digest, no next session); the note was asked instead.
- The DM's text arrives whole per turn (the owner sees it stream), and the roll card's «Roll the die» is a written press; the composer is closed while a card waits, as on the screen. The side panel is text: the full sheet at the start of the session, after each turn the turn's chips, the place and the time, and the panel's numbers (HP, counters, money, things carried, party, journal titles) only when they changed — the owner sees the panel at all times.
- One compatibility repair, counted: the claim of an out-of-game «?» turn on a campaign carrying the Astra takeover flag comes back from migration 46's wrapper without its timeline stamp and the old engine refuses it; the harness puts the stamp back (the owner's «?» is answered at his table, FIX_S4_TABLE item 1). See the harness notes and item 13 under «For FIX_S4».
- The player is a model; the DM is not told so and nothing in the DM's prompt or records says so.
- Table C: the pure-simulation flag on (no prep, no hidden layer), as game player 2.
- Group 2 ran one session at a time; group 1's Table A and B sessions ran four at a time, Table C four at a time (timing only: the screens, prompts and settings are the same).

## Harness notes

- What changed in the harness, and only this: DeepSeek's seat (`scripts/game-player-replicate-1/openrouter-chat.mjs`, X3's call, and its entry in `scripts/game-player-1/players.mjs`); the meter reads OpenRouter's chat completions in their own shape (`paid.mjs`); the runner takes a stage's own order and HTTP 429 rule (`run.mjs`; first frozen as «every 429 stops», restored to group 1's handling after the cut A-opus attempt — see «Amendments after the freeze»), and the stage's refusals carry across its one-session processes (`paid.mjs`, `refusalsBefore`). The four group-1 players' calls, the screens, the press rule, the welfare check and the judges are as group 1 had them.
- The «?» timeline repair was applied 0 time(s); refusals 0; paid calls stopped: HTTP 429 from openrouter after 0 waits.
- Run records: `docs/runs/game-player-replicate-1-run-20261026-001235.json`, `docs/runs/game-player-replicate-1-run-20261026-010828.json`, `docs/runs/game-player-replicate-1-run-20261026-011937.json`, `docs/runs/game-player-replicate-1-run-20261026-020732.json`, `docs/runs/game-player-replicate-1-run-20261026-024701.json`, `docs/runs/game-player-replicate-1-run-20261026-032049.json`, `docs/runs/game-player-replicate-1-run-20261026-041413.json`, `docs/runs/game-player-replicate-1-run-20261026-045905.json`; group 1's A and B sessions copied into `docs/runs/game-player-replicate-1-group1.json` (each with its source blob), C read from `docs/runs/game-player-2-run-20261025-092000.json`.
