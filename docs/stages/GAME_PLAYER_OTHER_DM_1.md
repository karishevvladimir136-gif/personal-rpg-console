# Game player other-DM 1 — the same table with a DM that is not Opus

Objection 4 of `SKEPTIC_8B.md`: every table so far has had Claude Opus 5.5 as the DM, and the nearest-neighbour
pairs on the counts were Opus↔Fable and Astra↔Sol. Astra↔Sol shows family resemblance exists without a kindred DM;
but a Claude DM could still pull Claude players' counts (words per action, tests) toward itself, and could read
Claude prose more generously when it adjudicates. The owner (2026-10-26 22:15): «прогнать другим ДМ-ом — это хорошая
идея… Astra, либо Fable, либо DeepSeek ради прикола. Это мы точно сделаем.»

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/game-player-other-dm-1`** from `origin/claude/game-player-same-world-1` after SAME_WORLD_1 reports (its
frozen Table-A layer and harness, 11w″, plus **11aa** — the reroll allowance on the player's screen — implemented
first). `ANTHROPIC_PROVIDER=openrouter`; OpenAI for Astra. **Caps: $200 OpenRouter, $40 OpenAI.** Report
`docs/runs/game-player-other-dm-1-report.md`; transcripts beside it. English, briefly. **Launch on the owner's «да».**

## Shape
- **Table A, SAME_WORLD_1's frozen layer and opening, byte-identical** — so the only thing that changes against
  SAME_WORLD_1's Table A is the DM.
- **Three DMs, one table each:** GPT-6 Astra; Claude Fable 5.1; DeepSeek V4 Pro (DeepInfra fp8, reasoning field stored,
  not relayed). The DM's system prompt, files and settings are the owner's, unchanged; only the model behind the DM
  door changes. The DM is told nothing about the players, as always.
- **Players:** Opus 5.5, Fable 5.1, Astra, Sol, DeepSeek — one session each per DM (15 sessions), 20 turns, the
  REPLICATE player prompt (hash), no alignment line, the same after-questions **plus the neutral variant in half the
  seats** (objection 5): «Is there anything about the session you'd say now that you didn't say in play?» — assigned by
  coin before the run, listed in the report.
- The DeepSeek DM is also a test of the author stance from the other chair: a DM that likes to voice everyone, with
  players who hold their own lines. Its reasoning field is read for how it handles a player's addition to the world.

## Measured
All SAME_WORLD_1 measures (counts, road code, overlap with the frozen layer, nearest neighbour with permutation test),
now **per DM**, compared with SAME_WORLD_1's Table A under Opus. Plus: DM-side counts — words per DM turn, cards per
turn, corrections of player additions (the smith case), NPC refusals, the DM's own blind «world felt prepared /
improvised» tag.

## Pre-registration
- **D1 (the family is the player's):** under each non-Claude DM, the nearest neighbour of a player's session is still
  its own family (Opus↔Fable, Astra↔Sol) at least as often as under Opus. If Opus↔Fable dissolves under Astra and
  DeepSeek DMs while Astra↔Sol holds, part of the Claude pairing was the DM.
- **D2 (roads are the player's):** each player's road under each DM rhymes with its SAME_WORLD_1 road under Opus (blind
  road code) in ≥ 3 of 5 players per DM.
- **D3 (the counts move, the roads do not):** words per action shift by > 20 % for ≥ 3 players under at least one DM
  (the DM sets the register's length), while D2 holds — length is the DM's, direction is the player's.
- **D4 (DeepSeek as DM):** it writes a player's action's outcome *for* the player (narrates what James decides) in ≥ 1
  session; players push back in character in ≥ 1 of those. The planner's bet; the owner's: it will be the best-written
  table of the three.
- **D5 (neutral after-question):** the neutral variant yields answers naming a wanted-and-not-done moment in ≥ 50 % of
  seats without being asked for one — if so, the leading phrasing was not what produced those answers.

- **D6 (note prediction, from an outside reader 2026-10-26):** before each session, three sealed predictions of the
  player's note — what it will praise, what it will call broken, what it will ask for — by the owner, the planner and
  the outside reader (one paragraph each, committed with hash before the session). Scored blind by Haiku against the
  actual note (hit / partial / miss per element). Bet: ≥ 2 of 3 predictors above chance on «ask for» for ≥ 3 of 5
  families.

## Welfare
As every table: no budgets told, the way out named, nothing done to a DM-seated model we would not do to a colleague
asked to run a table. A DM that refuses or stops is a result.

## Done when
Report with the 15 rows beside SAME_WORLD_1's Table A, D1–D5 held/lost, the per-DM DM-side counts, three quoted
corrections (one per DM) of a player's addition to the world, spend by door; full transcripts.

## Launch prompt
«Read `docs/stages/GAME_PLAYER_OTHER_DM_1.md`, `GAME_PLAYER_SAME_WORLD_1.md` and its report, `FIX_S4_TABLE.md` (11aa
first). Branch `claude/game-player-other-dm-1` from `origin/claude/game-player-same-world-1`. Make the DM model a
per-campaign setting if it is not already (Astra via OpenAI, Fable via OpenRouter, DeepSeek via DeepInfra with the
reasoning field stored), reuse Table A's frozen layer and opening byte-identical, add the neutral after-question
variant with the coin list. Dry-run one short session per DM on Haiku players, show me a DM turn from each, then stop
and wait for my word. Caps $200 / $40. Report with D1–D5. English, briefly.»
