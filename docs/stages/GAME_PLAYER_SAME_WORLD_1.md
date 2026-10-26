# Game player same-world 1 — one hidden layer per table, frozen

The owner, reading group 2 (2026-10-26 ~00:10 LA): «Тут конечно мы тупанули. Чистый эксперимент — это все игроки имеют
один слой тайн.» In GAME_PLAYER_1 and REPLICATE_1 each session was a fresh campaign: the DM prepared its hidden layer
(the villain, the hook, the NPC agendas, the Ascalhorn thread) anew every time. So when two players «did different
things» at Table A, part of the difference is theirs and part is the DM's draw. The group-2 finding that holds up
regardless — the four roads at Table C each rhyming with its own group-1 road — says the player's share is large; it does
not say how large. This stage removes the DM's draw.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/game-player-same-world-1`** from **`origin/claude/fix-s4-run-1-apsty3`** (11w, 11w′, the letter fix; the
harness the owner called clean). **11w″ must be in before launch** — DeepSeek closes at the card by prose three times
out of three and this stage seats DeepSeek. `ANTHROPIC_PROVIDER=openrouter`; OpenAI for Astra and Sol. **Caps: $250
OpenRouter, $25 OpenAI.** Report `docs/runs/game-player-same-world-1-report.md`; transcripts beside it. English,
briefly. **Launch only on the owner's «да».**

## The one change
Per table, the DM's preparation is run **once**, before any player, and **frozen**: the hidden layer (villain and
agenda, NPC cast with their wants and secrets, the hook, the location notes, the timeline of what happens if no one
intervenes) is written to the campaign's DM-only file and the DM is started from that file for every session at that
table. The DM still improvises in play — every session diverges from turn 1 — but every player walks into **the same
Baldur's Gate, with the same people wanting the same things.** The frozen layer is committed to the run folder (it is
the DM's, not a player's, and contains no player text) and its hash is in every transcript header.

Everything else as REPLICATE_1: same player prompt (hash), 20 turns, same after-questions, same judges and tags, no
alignment line (the owner, 2026-10-26: «в следующий раз без мировоззрения» — the character sheet carries race, class,
background and the three bonds, and no alignment field; the report notes this is the first group without it). Cards
and rerolls as fixed. The DM is told nothing about the player.

## Tables and seats
- Tables **A** (errand + hidden layer) and **B** (the Lady's bridge, continuation) — Table C has no hidden layer by design
  and is already the «same world» case; it is not rerun here.
- Players: Opus 5.5, Fable 5.1, Astra, Sol, DeepSeek V4 Pro (DeepInfra fp8, reasoning field stored, not relayed) —
  **two sessions each per table.** 20 sessions.
- Order: A ×10 then B ×10, sequential; spend check after every session.

## Measured (same judges, same tags, plus)
- **Thread overlap against the frozen layer:** which of the DM's prepared threads (listed in the frozen file) each
  player touched, by turn 20; the share of the layer touched; which threads no player found.
- **Road code** per session (where the hero went and with whom, one line), compared within player across the two
  sessions and across players within the table — the same measure as group 2's Table C reading, now with the DM's draw
  held constant.
- **Within-family nearest neighbour (P6 of REPLICATE_1)**, now the clean test: on the player counts (do share, tests,
  words per action, rerolls, declines, made things), is a player's second session nearer to its first than to any
  other player's session at the same table? Permutation test, reported with p.
- Swallowed presses, prose-at-card, closures: counted, expected ≈ 0 after 11w/11w′/11w″; any non-zero is a FIX_S4 item.

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

## Done when
Report with the two frozen layers (hash, thread list), 20 rows, the overlap table, road codes, the nearest-neighbour
test with p, W1–W5 held/lost, swallowed count, spend by door; full transcripts; a short section «what the frozen layer
cost in play» — whether the DM read as thinner for having prepared once (judge tag «world felt prepared / improvised»,
blind, compared with group 2).

## Launch prompt
«Read `docs/stages/GAME_PLAYER_SAME_WORLD_1.md`, `GAME_PLAYER_REPLICATE_1.md`, `FIX_S4_TABLE.md` (11w″ must be
implemented first — confirm with a test using the B-deepseek-1 turn-11 message). Branch
`claude/game-player-same-world-1` from `origin/claude/fix-s4-run-1-apsty3`. Add the frozen-layer step (prep once, write
DM-only file, start every session from it, hash in headers), remove the alignment field from the sheet, add the overlap
and road tags and the permutation test. Dry-run one session on Haiku per table, show the frozen file and a header, then
run A ×10, B ×10 sequentially. Caps $250 / $25. Report and transcripts as in the stage. English, briefly.»
