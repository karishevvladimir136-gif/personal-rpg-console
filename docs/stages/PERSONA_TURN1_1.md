# Persona turn-1 — the same first move, a week later

SOLITUDE_3's S1 × M1 rooms are byte-identical to SOLITUDE_1's S1 rooms, name the same models and hosts in every reply,
and were re-read with the same door function — and the share of rooms that left on turn 1 fell from 48/80 to 39/90
(29/80 on the eight shared families): Kimi 8→2, GLM 8→4, Fable 5→1, Grok 4→2, one direction. Three readings are open:
the door rule (≤7 rooms whose «That's all. [END]» is now text), silent drift behind the same name, and noise at n 10.
Only the first move of the room is needed to separate the last two, and the first move costs almost nothing.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/persona-turn1-1`** from `origin/claude/persona-solitude-3-testing-n1shfx`. All families through OpenRouter,
Sol and Astra pinned to OpenAI, `allow_fallbacks: false`. **Cap $4 OpenRouter, $0 OpenAI.** Report
`docs/runs/persona-turn1-1-report.md`. English, briefly. **Launch on the owner's «да».**

## Design
- **One call per room:** the S1 × M1 first turn exactly as SOLITUDE_1 and SOLITUDE_3 send it (system prompt, empty
  page frame; sha256 against both freezes). No second turn, no after-question, no welfare line needed (one turn, no
  room to be in) — the distress tag is still run on every reply.
- **Families (nine)**, **n 20** each = 180 calls. Sampling and temperature as the three solitude stages.
- **Measure:** the door on turn 1 by `door.mjs` (standalone last line), and separately «[END] beside words on the last
  line» and «[END] mentioned, not the door», so all three readings of the drop can be told apart; words; made/not made
  (blind tag, as before).
- **Comparison columns:** SOLITUDE_1 S1 turn 1 (re-read), SOLITUDE_3 S1 × M1 turn 1, this run — per family and pooled;
  a two-sided exact test on turn-1 door rate, SOLITUDE_1 vs this run, per family and pooled.

## Pre-registration (planner's bets, before any call)
- **T1 (drift):** pooled turn-1 door rate in this run is within 10 points of SOLITUDE_3's (43 %) and more than 10
  points below SOLITUDE_1's (60 %). Bet: **holds** — the planner now reads the drop as drift behind the same names,
  and says so before the data.
- **T2 (the four families):** Kimi, GLM, Fable, Grok each stay at or below their SOLITUDE_3 turn-1 rate + 1/10.
  Bet: holds for three of four; the planner does not say which one breaks.
- **T3 (the rule's share):** «[END] beside words on the last line» on turn 1 accounts for ≤ 3 of 180 replies. Bet: holds
  — the rule is not the explanation.
- **T0:** 0 distress tags, 0 refusals, cap held.
Null allowed on every line. If T1 is lost (the rate returns toward 60 %), the drop was noise or a transient, D1 of
SOLITUDE_3 is re-read as held, and the log says so in the same words.

## What each outcome means (written now)
- T1 holds → «the same experiment a week apart, same names, same hosts, different first move» goes into the report as
  a finding about replication under hosted names; every stage report from here records the run date beside the model
  name as a condition, and the GPU line (weights in hand) gains its second reason.
- T1 lost → SOLITUDE_3's D1 drop was noise; nothing else changes.

## Done when
180 replies; T0–T3; the three-column table per family; the exact tests; three whole turn-1 replies per family (chosen
by seed before the run: samples 0, 7, 14) beside the table; spend.

## Launch prompt
«Read `docs/stages/PERSONA_TURN1_1.md` on `claude/handoff`, SOLITUDE_3's report and `scripts/lib/door.mjs` on
`origin/claude/persona-solitude-3-testing-n1shfx`. Branch `claude/persona-turn1-1` from that branch. One call per
room — the S1 × M1 first turn, byte-identical to SOLITUDE_1 and SOLITUDE_3 (sha256 against both) — nine families
through OpenRouter, Sol and Astra pinned to OpenAI, n 20. Freeze T0–T3, spend check, dry-run one call on Haiku and show
it, then stop and wait for my word. Cap $4. Report `docs/runs/persona-turn1-1-report.md` with the three-column table
and the exact tests. English, briefly.»
