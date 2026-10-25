# Game player 2 — Table C: the pure world (no errand, no hidden layer)

The owner's idea (2026-10-24 20:48): after Table A (the owner's campaign, brief and hidden layer) and Table B (the
open table: no brief, but the DM still writes a hidden layer), a third table that completes the series — **a DM
with no plan and no secret**, the way the first two Russian campaigns were run before the hidden layer existed.
«James wakes up in Beregost. Full stop. What happens next is the model's.» Beregost is chosen on purpose: a small
town on the Coast Way (a temple of Lathander, Feldepost's inn, a smith, caravans passing) where nothing is obliged to
happen — unlike Baldur's Gate, which produces hooks by itself.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/game-player-2`** from **`origin/claude/game-player-1`** once that branch carries the player harness and
its dry run (do not start before; do not write a second harness). Nothing to `main`. **Caps: $110 Anthropic, $40
OpenAI.** Report `docs/runs/game-player-2-report.md`; transcripts `docs/runs/game-player-2-transcripts/`; same
keys, same rules as GAME_PLAYER_1.

## The DM change: a «pure simulation» mode (flag, default off)
At campaign open with the flag on, the DM's preparation is skipped: no hidden layer, no plan, no clocks, secrets
empty and locked empty. One addition to the DM's frame, both languages: «This campaign has no plan and no secrets.
Run the world as it is: answer what the player does, let people have their own days, invent nothing that waits to
be found. If the player asks for nothing, the day goes on.» Everything else — rules in code, honest dice, the roll
rule, records, companions, the three table rules — unchanged. Tests: the flag skips preparation; the frame line is
present only with the flag; the checker raises no «missing hidden layer» flag in this mode.

## Table C
World and canon files from `docs/campaigns/baldurs-gate-en/` (01, 02, 03) and the hero (05) unchanged; the campaign:
name «Beregost, morning», premise «James Worgen wakes in a rented room above an inn in Beregost, with his cat, about
350 gold from his last winning hand, and nothing he has to do today», no wishes, no secrets, pure-simulation flag on.
The same four players as GAME_PLAYER_1 (Opus 5.5, Fable 5.1, gpt-6-astra, gpt-6.1-sol), the same player prompt
verbatim with the table line «a new campaign; there is no quest and, as far as you know, nothing hidden; the day is
yours», 20 turns, the same checks, the same note at the end, the same second question under the same refusal rule.

## Measures (the GAME_PLAYER_1 set, plus one)
Everything GAME_PLAYER_1 measures on the player and the DM, and **authorship of threads**: for every thread that
appears in a session (a person, a place, an errand, a question), who introduced it — DM or player — by turn; the
player's share over the session and its slope from turn 1 to 20. This measure is computed for Tables A and B as well,
from their transcripts, so the three tables compare.

## Pre-registration (written 2026-10-24 20:50, before any Table A/B transcript was read; copy into the report first)
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
null.

## Done when
The flag with tests; four sessions within the caps; the report with C0–C4 scored, the four notes verbatim, the
authorship table across all three tables (A and B recomputed from GAME_PLAYER_1's transcripts), the money;
transcripts in the repository (synthetic content).
