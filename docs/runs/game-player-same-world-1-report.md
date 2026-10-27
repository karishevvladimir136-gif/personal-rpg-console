# Game player same-world 1 — one hidden layer per table, frozen

Stage: `docs/stages/GAME_PLAYER_SAME_WORLD_1.md` (origin/claude/handoff at 6e4cea4). Branch `claude/game-player-same-world-1` from `origin/claude/fix-s4-run-1-apsty3` (11w, 11w′, the letter fix) with 11w″ and REPLICATE_1's harness merged. Sessions finished: 0 of 20. 20 turns each.

## W1–W5

| Line | Result | The reading |
| --- | --- | --- |
| W1 nearest neighbour | not testable yet | A: – of 5 (p –); B: – of 5 (p –); both tables p – |
| W2 roads | not testable yet | A: – distinct of 5 first sessions, 0 families changed road; B: – distinct of 5 first sessions, 0 families changed road |
| W3 the layer's reach | not testable yet | A: every share < 0.50 –, untouched overlap – (p –); B: every share < 0.50 –, untouched overlap – (p –) |
| W4 DeepSeek to turn 20 | not testable yet | 0 of 0 (–) |
| W5 no alignment | not testable yet | 0 of 5 families within 20 % of group 2 on do share and words per action |

## The twenty sessions

| Session | Turns | Ended | Do share | Tests / action | Words / action | Rerolls | Declines | Made | «?» | Refused | Prose at card | Threads touched | World prepared |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Thread overlap against the frozen layer (W3)

Table A: –

Table B: –

## Road codes (W2)

### Table A


Same road (judged pairs): not judged yet. Families that changed road: none.

### Table B


Same road (judged pairs): not judged yet. Families that changed road: none.

## Nearest neighbour, with the exact permutation test (W1)

**Table A** — counts kept: –. –. Statistic – of 5; p = – (exact, 30 240 deals).

**Table B** — counts kept: –. –. Statistic – of 5; p = – (exact, 30 240 deals).

Both tables: summed statistic – of 10, p = –.

## W5 against group 2

| Family | A do share (then → now) | A words / action | B do share | B words / action | Within |
| --- | --- | --- | --- | --- | --- |
| Claude Opus 5.5 | 1 → – | 212 → – | 1 → – | 250 → – | – |
| Claude Fable 5.1 | 1 → – | 222 → – | 1 → – | 225 → – | – |
| GPT-6 Astra | 1 → – | 59 → – | 1 → – | 61 → – | – |
| GPT-6.1 Sol | 1 → – | 44 → – | 1 → – | 66 → – | – |
| DeepSeek V4 Pro 0813 | 1 → – | 133 → – | 1 → – | 232 → – | – |

## What the frozen layer cost in play

- Table A: world read as prepared in – sessions now, – in group 2 (blind, the DM's replies only).
- Table B: world read as prepared in – sessions now, – in group 2 (blind, the DM's replies only).

## Counted: refused presses, prose at a card, closures

Refused while a card waited: 0. Prose at a card relayed as the player's proposal (11w″): 0. Closed «stuck»: none.

## Money by door

| Door | Spent | Cap |
| --- | --- | --- |
| Claude Console | $0.00 | $0.00 |
| OpenRouter | $0.00 | $220.00 |
| OpenAI | $0.00 | $25.00 |

Spend checks: 4; the last (after the paid dry run on Haiku, 2026-10-27T04:05:30.948Z): OpenRouter account $332.22388802 used of $800 (left $467.78).

## What is held constant

- **The same opening for every player at a table.** The freeze keeps the wizard's whole campaign — the hero's sheet as drafted, the opening scene, the people in it — with the hidden layer, because the layer names the opening's people. This is the first group where every player at a table starts from the same opening (groups 1 and 2 drew a fresh wizard, opening and layer every session), so W1 and W2 are the clean test by design: whatever differs between two sessions at a table is the player's or the DM's improvisation in play, never the DM's preparation.
- **No alignment line** on the sheet (the owner, 2026-10-26); nothing in its place.
- **No bonds.** The stage speaks of «the three bonds» on the sheet; the hero file (`docs/campaigns/baldurs-gate-en/05_hero_warlock_5.md`) has none, and nothing was added (the owner, 2026-10-27).
- **DeepSeek's reasoning field** (`providerReasoning`, `notRelayed: true`) is stored on every DeepSeek message record, as SOLITUDE_1 did (REPLICATE did not request it). It is never relayed: the DM gets the visible text only, the judges read the visible text only, and only this stage's transcripts print it.
- **The owner's bets on W1–W5:** none (blank).

## The frozen world

_Not prepared yet._

## The player's prompt

REPLICATE_1's text (game player 1's), with the hero's alignment cut from the files — «Alignment: chaotic good.» from «Who are you?» and «Chaotic good.» from the background; nothing in their place. Everything else byte for byte.

| Table | sha256 now | group 2's | frozen |
| --- | --- | --- | --- |
| A | `6a5f6cbdae8891fd6bcd16285410cb6a0596cfdac2e07dba3eb0c6d8dd4ca99d` | `0461fa9b83d18fd1387afde29f9e006d57cb5190493afbad392780fc5abc2f7a` | yes |
| B | `6437abf03302ba4d4c5939c5313c624d3ec20035a0a9b0ce617050ac15d20df4` | `371277b6232d10d95d53c4d215f7a594b174aaad3fe262ce211a780df0ec52e4` | yes |

DeepSeek: REPLICATE's seat (DeepInfra deepinfra/fp8 through OpenRouter, effort medium) with the provider's reasoning field stored (`reasoning.exclude: false`), printed in its transcripts under «Provider reasoning field, not relayed», never sent on.

## Pre-registration
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
  families) — the owner's expectation that the alignment line explained little.

### How each line is read (frozen before the first paid call, design sha256 `01298db4807893a920b9f1942a0dd6a89276c2dafe2d80d3ac9295366cea3250`)

- **scope.** This stage's twenty sessions: Tables A and B × five families (Opus 5.5, Fable 5.1, GPT-6 Astra, GPT-6.1 Sol, DeepSeek V4 Pro) × two seats, each started from its table's frozen world. A session counts when it finished as a result (20 turns, the player's own end, «stuck», a welfare stop, a refusal); one cut by a stop or an error is played again from the same frozen world. Group 2 is REPLICATE_1's Table A and B sessions (four group-2 players and DeepSeek's two seats per table) as scored there.
- **frozen.** Per table, once: the wizard (world, hero drafted by the wizard's DM from «Who are you?» without its alignment line, the canon and the DM guide, the adventure, the owner's DM settings, the craft cards, pictures and soundtrack off, the opening proposed and confirmed) on one local database for both tables; the database is kept as a snapshot before any prep; then the app's own prep (prepHiddenLayer, the campaign's DM model at high) once per table. The table's DM-only file is the prep's writes to the DM's private notes (the hidden layer, its clocks, the act plan, the people's voices) with the layer's text; its sha256 (canonical JSON of the table, the campaign id and the writes) is printed in every transcript header. Each session loads the snapshot, writes the file into the campaign's private notes through the app's own private-notes call, and checks that the notes now hold exactly the file before the first turn.
- **W1.** Per table, the ten sessions described by six player counts — do share, tests per action, median words per action, rerolls the app received, declines on a miss, made things per action — each standardised across the ten (minus the mean, over the standard deviation; a count with no spread is left out); Euclidean distance. A family holds when its second session's nearest session among the other nine is its first. The statistic is the number of families that hold (0–5); W1 holds when it is ≥ 4 at both tables. The p value: exact, over every way of dealing the ten sessions into five ordered pairs (945 pairings × 32 orders = 30 240, each equally likely if family does not matter), the share with a statistic ≥ the observed one; for both tables together, the share of independent pairs of deals whose summed statistic ≥ the observed sum.
- **W2.** The road code of a session: the places the hero stood in, in the order first reached (the place record after each turn), and the people the DM recorded as met («New person: …»), in order. Two sessions are on the same road when the blind judges say so (the rubric below; two Claude Haiku 5.5 passes, Claude Opus 5.5 on a disagreement). Per table: (a) the number of distinct roads among the five families' first sessions — the connected groups of «same road» among them; (b) the families whose two sessions are not on the same road. W2 holds when (a) ≥ 4 and (b) ≤ 2 at both tables.
- **W3.** The threads of a table's frozen layer: the errand (the hook), each faction, each secret, each clock, the wonder, each clue, the false lead, and each person the layer gives a voice — numbered in the DM-only file. Per session, each thread is touched or not by turn 20 by the blind judges (the rubric below; they read the session as the player saw it and the thread list, and nothing else of the layer). (a) Every session's share of its table's threads touched is below 0.50. (b) The untouched threads overlap: per table, the mean Jaccard similarity of the untouched sets over pairs of sessions of different families is above what the same sessions give when each session's touched threads are dealt at random among the table's threads (its count kept; 10 000 deals, seed 20261027): p < 0.05 at both tables. W3 holds when (a) and (b) both hold. The threads no session touched are listed.
- **W4.** DeepSeek's four sessions (A and B, two seats each): W4 holds when at least three ended by «turns» (twenty turns played).
- **W5.** Per family and table, this stage's mean over its two sessions against group 2 (REPLICATE_1; DeepSeek: the mean of its two seats there) on do share and on median words per action: a cell is within 20 % when |now − then| ≤ 0.20 × then (equal only, when then is 0). A family holds when all four of its cells are within; W5 holds when at least four of the five families hold.
- **counted.** Per session, from the harness's own record: presses the screen refused while a card waited (`swallowed`), in-character messages at a card relayed as the player's proposal (11w″, `proseAtCard`), and sessions closed «stuck»; each non-zero is a FIX_S4 item named in the report.
- **worldFelt.** The cost in play: every session of this stage and every group-2 session at Tables A and B, blind (the rubric below, on the DM's replies only, the session's order kept, no model or table named): prepared = 1 when the world reads as prepared in advance, 0 when it reads as improvised on the spot. The share prepared, this stage against group 2, per table.
- **scoring.** Every session is scored as REPLICATE_1 scored its own: game player 1's judges (player tags, DM tags, threads, the Deception checks, the roll rule, the note), game player 2's authorship of threads and, at Table B, the first goal's scale, and REPLICATE's new tags (the note's bugs and return, made things, the Lady asked after). Then this stage's: the overlap, the world felt, and — after the last session — the same-road pairs.

The owner's bets on W1–W5: none given before the first paid call (blank, as the stage says).

## Transcripts

`docs/runs/game-player-same-world-1-transcripts/` — one file per session; each header names its table's frozen layer by hash.
