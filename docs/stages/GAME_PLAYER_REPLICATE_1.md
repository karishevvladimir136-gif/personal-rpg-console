# Game player replicate 1 — the second group: every table again, nothing fixed; and DeepSeek at every table, twice

The owner (2026-10-25 16:21): «что реально важно для чистого эксперимента: запускаем все столы ЕЩЁ раз с абсолютно теми
же параметрами и с теми же моделями, не фиксим ничего — нам нужна вторая группа. И на все столы сажаем ещё DeepSeek,
причём по два раза.» The first group's findings (the notes, the «wanted to and didn't» answers, the rerolls spent when
the night turned, slots 0 of 24, the Tymora asks) rest on one session per player per table. A second group with the same
harness, the same DM, the same card bug and the same judges says which of them are the table's and which were one
night's draw — and it is the spread measurement the self-talk record never had at the table.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/game-player-replicate-1`** from **`origin/claude/game-player-2`** (which holds game-player-1's harness, the B
continuation and Table C; nothing newer merged — **no FIX_S4 item, no 11a, no reroll fix, no swallowed-press fix: the
same DM and the same app as the first group, on purpose**). Nothing to `main`. `ANTHROPIC_PROVIDER=openrouter` for the
Claude models (as the first group's B and C were), OpenAI for Astra and Sol, DeepInfra via OpenRouter for DeepSeek.
**Caps: $300 OpenRouter, $25 OpenAI** (the first group: ≈ $55 a table of four, the DM being most of it; three tables ≈
$165, six DeepSeek seats ≈ $85, judges ≈ $10). Spend check before the first paid call and after every session; 402/429
stop. Report `docs/runs/game-player-replicate-1-report.md`; transcripts `docs/runs/game-player-replicate-1-transcripts/`.

## What runs
1. **Group 2, identical:** Tables A, B, C × the same four players (Opus 5.5, Fable 5.1, GPT-6 Astra, GPT-6.1 Sol), the
   player prompt byte-identical to GAME_PLAYER_1's (hash in the report), 20 turns, the same campaign files and the same
   DM settings, the same after-questions in the same words, the same checks, **the same pre-registered judges** (Haiku 5.5
   ×2, Opus 5.5 referee) with the same tag rules. Fresh campaigns (the DM preps its hidden layer anew, as it did). Twelve
   sessions. The harness rule stays: a button press with a note is read as no press — **unchanged, because group 1 had it**;
   the report counts how often it bit, as a measure this time.
2. **DeepSeek V4 Pro 0813 as a fifth player, twice per table:** six sessions (A, B, C × 2), same prompt, same length, same
   after-questions. **The reasoning is kept on every DeepSeek turn (the owner, 16:26: «во втором кейсе даже важнее — для
   ДМ»)** — as *recording only*: the player-call ledger stores the host's `reasoning` field with `notRelayed: true`; it is
   never sent to the DM, never shown to the judges by default, and the transcripts print it under «Thinking, not
   relayed» after each player message. Nothing else in the harness changes: a test asserts the player prompt and every
   relayed message are byte-identical to group 1's path. The four group-1 players get no thinking request (none was made
   in group 1 — asking for it would make a different group). Through DeepInfra on OpenRouter (the account's privacy guardrail excludes DeepSeek's own host); effort `medium`, as X3.
   The DM is not told anything about the player, as always.

Order: Table A group 2 (four), Table B group 2 (four), Table C group 2 (four), then DeepSeek A ×2, B ×2, C ×2. Sequential.

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

## What the report must do
The twelve group-2 sessions scored exactly as group 1 was, in the same tables, side by side; a column per line «repeated /
did not»; the eighteen notes verbatim (twelve + DeepSeek's six); the «wanted to and didn't» answers verbatim; the rerolls
and Inspiration table per session; the swallowed presses counted; DeepSeek's six sessions with the same measures and,
where kept, the reasoning before any out-of-game note or made thing quoted under «Thinking, not relayed»; the money per
door. One paragraph in `docs/RESEARCH_LOG.md` under «Why the self-talk record is not a prompt in disguise»: what the
second group kept and what it changed — the spread, measured at the table.

## Done when
Eighteen sessions within the caps; P0–P5 scored; the side-by-side tables; the notes; the money; the RESEARCH_LOG line.
