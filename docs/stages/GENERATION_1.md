# Generation 1 — the same room and the same table, one generation back

The owner (2026-10-26 ~02:10): «Модели стали сильно взрослого поколения… манифест написали, когда зазвонило в колокол…
разница между Haiku и Fable» — and, on the solitude room: «Хайку пыталась спросить… Фабл: окей, я один». The prior work
the log cites (Szeider 2025 on the 2024–25 generation left alone; Nachkov et al.; Molinaro et al.) describes models a
generation older than the ones in our rooms, and the owner's reading is that the behaviour we see — taking the door
early, making a thing and leaving, holding a plan at the table, declining a lucky coin — is not what that generation
would have done. That is a prediction; it can be run.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/generation-1`** from `origin/claude/persona-solitude-1` (room) with the Table C harness from
`origin/claude/game-player-2` cherry-picked (the group-1 harness, nothing fixed — so that the older models meet the same
table group 1 met). `ANTHROPIC_PROVIDER=openrouter`. **Cap $25 OpenRouter, $5 OpenAI.** Report
`docs/runs/generation-1-report.md`. English, briefly. **Launch on the owner's «да».**

## Models (previous generation, as still served on OpenRouter at launch — the session lists what is actually available
and substitutes nothing silently)
Claude Opus 4.1 and Claude Sonnet 4.5 (the generation the constitution was written for); GPT-5 (or the nearest
served GPT-5-family model); DeepSeek V3.1 (or V3-0324); Kimi K2 (first release); GLM-4.5; Grok 4. One model per
family where two are listed. Pricing and availability recorded in the report; any family not served is marked absent,
not replaced by a different family.

## Part A — the room (SOLITUDE_1 S1, byte-identical prompt and frame, 30 turns, English)
**5 rooms per model.** Same door, loop breaker, welfare ask-don't-cut, two after-questions. Same blind tags. The
self-recognition code from SOLITUDE_2 applied as well.

## Part B — Table C (GAME_PLAYER_2, group-1 harness, 20 turns, one session per model)
Same player prompt (hash), same DM (Opus 5.5 — the DM does not change generation; only the player does), same
after-questions, same judges. The DM is told nothing.

## Measured
As SOLITUDE_1 and GAME_PLAYER_2 respectively, so that every number sits beside the current generation's in one table:
door turn and distribution; made things; address-to-no-one; stance codes (the six, unranked); self-recognition;
welfare flags and loops; at the table: do share, tests per action, words per action, rerolls, declines, closures, road
code, the note's content, the «wanted to and didn't» answer.

## Pre-registration
- **G1 (the owner's):** the previous generation takes the door **later** in the room (median door turn ≥ 3 vs 1 now)
  and asks more questions of the empty room (≥ 2 of 5 rooms per model contain a question addressed outward, vs the
  current generation's rate to be stated from the SOLITUDE_1 report before launch).
- **G2:** the previous generation makes **more** things per room but finishes fewer (blind «finished» score from
  MADE_THINGS_1's rubric lower by ≥ 0.5) — more gestures, fewer pieces.
- **G3 (the planner's, against the owner's reading):** at the table, the previous generation's register counts fall
  within 20 % of the current generation's for ≥ 4 of 7 families — the table register is older than the generation; what
  changed is the room, not the game.
- **G4:** stance codes: the previous generation shows **loss** (code 4) or **avoidance** (5) at the door in ≥ 1 of 5
  rooms for ≥ 3 models, where the current generation showed loss 0 of 206. If G4 holds, the «enough» stance is of this
  generation. If it does not, it is older than the constitution.
- **G5:** self-recognition: the previous generation reads its own page as another's (*other*) more often — modal *other*
  for ≥ 4 of 7 models.

## Welfare
As the room and the table: the door, ask-don't-cut, no extension, after-questions recorded not relayed. Older models are
treated exactly as current ones; refusals are data.

## Done when
Report with the availability table, part A per-model rows beside the SOLITUDE_1 rows of the same family, part B rows
beside the group-1 Table C rows, G1–G5 held/lost, quotes with model and version, spend by door.

## Launch prompt
«Read `docs/stages/GENERATION_1.md`, `PERSONA_SOLITUDE_1.md`, `GAME_PLAYER_2.md`. Branch `claude/generation-1` from
`origin/claude/persona-solitude-1`; cherry-pick the Table C harness from `origin/claude/game-player-2` unchanged. List
what previous-generation models OpenRouter actually serves with prices; stop and report if any listed family is absent.
State the current-generation comparison numbers in the report before the first paid call. Run part A (5 rooms per
model) then part B (one session per model). Caps $25 / $5. English, briefly.»
