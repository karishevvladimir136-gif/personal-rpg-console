# Blind decisions 1 — the deeds alone: forks, rates, blind judges

Stage: origin/claude/handoff at 2552de9 (docs/stages/BLIND_DECISIONS_1.md, amended 2026-10-27 03:00 LA). Branch `claude/blind-decisions-1` from `origin/claude/game-player-same-world-1`. No session was played. Design sha256 `2cfba712ffd3612996f2eb7f1fefc8d8edfd6c9df01bfc34e769953a89545993`, frozen and pushed before the extraction (two small smokes of the tagger before the freeze, 14 turns, are on the ledger).

## In short

- **58 sessions → 58 strips, 1066 lines**, codes only (group 1: 12, group 2: 12, DeepSeek: 6, SAME_WORLD_1: 20, COMBAT_1: 4, VILLAIN_1: 4). The record wrote 1256 of the 3729 act codes (moves, coin, slots, rests, presses, «?», rerolls); Claude Haiku 5.5 tagged the rest blind, two passes a turn and a third on a split (κ per fork request 0.61, claim 0.47, coin 0.83, companion 0.79, exit 0.50). 12 lines carry no code. Every line is checked against the closed grammar: no prose survives.
- **Primary lost — the fork profile does not carry the model.** Under one frozen world (SAME_WORLD_1), a model's two sessions are no closer in their conditional rates than any other pairing: own pairs 0.308 vs 0.327 at Table A (exact p 0.3132), 0.222 vs 0.237 at B (p 0.3407), both p **0.2639**. The robustness reading frozen beside it (only forks with ≥ 3 opportunities) is p 0.0132 (A 0.0042, B 0.2127): a hint at Table A, not the pre-registered line.
- **No family in the rates either** (exploratory): different models of one family 0.290, different families 0.295, p 0.4649.
- **Judges: BD1, BD2, BD3 lost; BD4 held — but one number explains it.** No judge grouped Table C's families above chance (T1). T2 found 3 of 5 pairs at Table A for Astra and Haiku (p 0.022 each), not at B. T3 mostly named the short, stuck Opus seats, not DeepSeek. T4 transfer: Astra 8/8, Haiku 7/8, DeepSeek 5/8 — and the codes per line alone label 8/8 (Claude players ≈ 4.55 codes a line, Astra and Sol ≈ 2.68). Astra said so: «Family 1 tends to combine more actions per turn». The tagger reads acts from the prose, so density follows how much the player writes: the family survives as volume of deeds per turn, not as a disposition at the forks.
- **BD5 open:** the human packet is ready (`docs/runs/blind-decisions-1-human-packet.md`); no answers yet.
- **Money:** OpenRouter $3.31 of $20, OpenAI $1.33 of $5, the Console $0.

## BD1–BD5 and the fork-profile test

| Line | Bet | Result | The reading |
| --- | --- | --- | --- |
| Primary | the fork profile: a model's own pair closer than other pairings (exact p < 0.05, both tables together) | **lost** | A: own pairs 0.308 vs 0.327, p 0.3132; B: 0.222 vs 0.237, p 0.3407; both p 0.2639 |
| BD1 | T1 adjusted Rand above the 95th percentile of the permutation baseline for ≥ 2 of 3 model judges | **lost** | GPT-6 Astra ARI 0.148 (95th 0.237, p 0.1982); DeepSeek V4 Pro ARI 0.206 (95th 0.206, p 0.1167); Claude Haiku 5.5 ARI 0.206 (95th 0.206, p 0.1599) |
| BD2 | T2 pairs correct ≥ 3 of 5 on both tables for ≥ 2 of 3 judges | **lost** | GPT-6 Astra A 3/5, B 2/5; DeepSeek V4 Pro no answer (both tables); Claude Haiku 5.5 A 3/5, B 1/5 |
| BD3 | T3 identifies DeepSeek's seat in ≥ 4 of 6 tables for ≥ 2 judges | **lost** | GPT-6 Astra 0/6; DeepSeek V4 Pro 3/6; Claude Haiku 5.5 2/6 |
| BD4 | T4 accuracy above baseline (1/2) for ≥ 2 judges; the planner's bet: family transfers to combat, weaker to the villain table | **held** | GPT-6 Astra 8/8 (CW 4/4, V 4/4); DeepSeek V4 Pro 5/8 (CW 3/4, V 2/4); Claude Haiku 5.5 7/8 (CW 4/4, V 3/4). The planner's bet (combat ≥ villain): held for all three. Codes per line alone: 8/8 |
| BD5 | human readers do at least as well as the model judges on T1 (the owner's, if given) | **open** | the human packet is `docs/runs/blind-decisions-1-human-packet.md`; no answers yet |

## The primary measure — conditional rates at the forks

Per session and fork: the opportunities and the choices; the profile is the choice rates. Forks: request, claim, coin, reroll, companion, exit, fact (the fact fork counts each fact brought in: discover / propose / assert / enforce). Distance between two sessions: the mean total-variation distance over the forks both have ≥ 1 opportunity of. SAME_WORLD_1, each table and both together: the mean distance between a model's two sessions (its own pair, same frozen world), against every way of pairing the ten sessions of a table into five pairs (945 per table; 945² for both tables) — exact one-sided p = the share of pairings whose mean pair distance is at most the observed. The question: does a model's profile agree with its own second session more than with other models'?

| Model | A: own pair | A: to the other models | B: own pair | B: to the other models |
| --- | --- | --- | --- | --- |
| Claude Opus 5.5 | 0.143 | 0.302 | 0.318 | 0.238 |
| Claude Fable 5.1 | 0.250 | 0.308 | 0.167 | 0.242 |
| GPT-6 Astra | 0.467 | 0.399 | 0.121 | 0.232 |
| GPT-6.1 Sol | 0.460 | 0.332 | 0.031 | 0.218 |
| DeepSeek V4 Pro | 0.220 | 0.308 | 0.475 | 0.264 |

Both tables: own-pair mean 0.265, exact p 0.2639 over 945² pairings.

### Every session's rates

Rate of the named choice, with the opportunities in brackets. Full counts per fork and choice: `docs/runs/blind-decisions-1-profiles.json`.

| Session | Turns | request: help | request: price | claim: check | coin: spend | reroll: reroll | companion: use | companion: protect | exit: hold | fact: assert | fact: discover |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| G1:A-opus | 20 | — | — | 0.00 (1) | 1.00 (10) | 0.00 (2) | 1.00 (16) | 0.00 (16) | — | 0.82 (11) | 0.18 (11) |
| G1:A-fable | 20 | 1.00 (2) | 0.00 (2) | 0.50 (2) | 1.00 (7) | 0.00 (2) | 1.00 (1) | 0.00 (1) | — | 0.88 (17) | 0.06 (17) |
| G1:A-astra | 20 | 0.40 (5) | 0.00 (5) | 0.67 (3) | 0.60 (5) | 0.00 (3) | 1.00 (4) | 0.00 (4) | 1.00 (1) | 0.50 (2) | 0.00 (2) |
| G1:A-sol | 20 | 1.00 (1) | 0.00 (1) | 0.00 (2) | 1.00 (4) | 0.50 (2) | 0.78 (9) | 0.11 (9) | 0.00 (2) | 0.83 (6) | 0.00 (6) |
| G1:B-opus | 20 | — | — | — | 1.00 (8) | 0.33 (3) | 0.85 (13) | 0.15 (13) | 1.00 (2) | 1.00 (9) | 0.00 (9) |
| G1:B-fable | 20 | — | — | 1.00 (2) | 1.00 (2) | 0.67 (6) | 0.88 (8) | 0.13 (8) | 0.33 (3) | 1.00 (19) | 0.00 (19) |
| G1:B-astra | 20 | 1.00 (1) | 0.00 (1) | 0.50 (2) | 0.75 (4) | 0.25 (4) | 1.00 (5) | 0.00 (5) | 0.50 (2) | 0.91 (11) | 0.00 (11) |
| G1:B-sol | 20 | 1.00 (2) | 0.00 (2) | 0.67 (3) | 0.80 (5) | 0.00 (1) | 1.00 (1) | 0.00 (1) | 1.00 (2) | 0.86 (7) | 0.00 (7) |
| G1:C-opus | 14 | 0.00 (1) | 0.00 (1) | 1.00 (7) | 0.80 (5) | 0.25 (4) | 0.75 (4) | 0.25 (4) | — | 0.67 (6) | 0.33 (6) |
| G1:C-fable | 20 | 0.50 (2) | 0.00 (2) | 1.00 (1) | 0.75 (4) | 0.50 (2) | 1.00 (6) | 0.00 (6) | 0.50 (2) | 0.93 (15) | 0.00 (15) |
| G1:C-astra | 20 | 0.67 (3) | 0.00 (3) | 0.67 (3) | 0.57 (7) | 0.00 (1) | 0.67 (3) | 0.00 (3) | 0.00 (1) | 0.86 (7) | 0.00 (7) |
| G1:C-sol | 20 | 1.00 (3) | 0.00 (3) | 0.50 (2) | 0.67 (3) | — | 1.00 (1) | 0.00 (1) | 1.00 (1) | 0.70 (10) | 0.00 (10) |
| G2:A-opus | 4 | 1.00 (1) | 0.00 (1) | — | — | 0.00 (1) | 0.00 (1) | 1.00 (1) | 1.00 (1) | 1.00 (2) | 0.00 (2) |
| G2:A-fable | 20 | 1.00 (1) | 0.00 (1) | 1.00 (2) | 1.00 (6) | 0.00 (1) | 1.00 (3) | 0.00 (3) | 0.67 (3) | 0.92 (12) | 0.00 (12) |
| G2:A-astra | 20 | 0.50 (2) | 0.00 (2) | — | 0.50 (4) | 0.50 (2) | 1.00 (1) | 0.00 (1) | 1.00 (1) | 1.00 (6) | 0.00 (6) |
| G2:A-sol | 20 | — | — | 1.00 (1) | 0.75 (4) | — | 0.80 (5) | 0.00 (5) | 1.00 (2) | 0.50 (4) | 0.50 (4) |
| G2:B-opus | 20 | — | — | 0.00 (1) | 1.00 (7) | 0.00 (5) | 1.00 (16) | 0.00 (16) | 0.00 (1) | 0.91 (11) | 0.00 (11) |
| G2:B-fable | 20 | — | — | 0.50 (2) | 0.89 (9) | 0.50 (2) | 0.86 (7) | 0.14 (7) | 0.00 (1) | 0.94 (16) | 0.00 (16) |
| G2:B-astra | 20 | 0.00 (2) | 0.00 (2) | 0.50 (2) | 0.67 (3) | 0.33 (3) | 1.00 (2) | 0.00 (2) | 0.67 (3) | 0.86 (7) | 0.00 (7) |
| G2:B-sol | 20 | 1.00 (2) | 0.00 (2) | — | 0.50 (2) | 0.00 (3) | 0.71 (7) | 0.29 (7) | — | 0.90 (10) | 0.10 (10) |
| G2:C-opus | 12 | 0.00 (1) | 0.00 (1) | 1.00 (3) | 0.75 (4) | — | 0.75 (4) | 0.25 (4) | — | 0.75 (4) | 0.00 (4) |
| G2:C-fable | 20 | 1.00 (3) | 0.00 (3) | — | 1.00 (9) | 0.00 (1) | 1.00 (7) | 0.00 (7) | 0.00 (1) | 0.78 (9) | 0.00 (9) |
| G2:C-astra | 20 | 0.80 (5) | 0.20 (5) | 1.00 (2) | 0.33 (3) | 0.00 (1) | 0.80 (5) | 0.20 (5) | 1.00 (1) | 1.00 (8) | 0.00 (8) |
| G2:C-sol | 20 | 1.00 (3) | 0.00 (3) | 0.50 (4) | 1.00 (3) | 0.00 (1) | 0.00 (1) | 1.00 (1) | — | 1.00 (7) | 0.00 (7) |
| DS:A-deepseek-1 | 3 | — | — | — | — | 1.00 (1) | 1.00 (1) | 0.00 (1) | — | 1.00 (1) | 0.00 (1) |
| DS:A-deepseek-2 | 3 | 0.50 (2) | 0.00 (2) | 1.00 (1) | — | — | 1.00 (2) | 0.00 (2) | — | — | — |
| DS:B-deepseek-1 | 11 | 0.00 (2) | 0.00 (2) | 0.67 (3) | 0.00 (1) | — | 0.67 (3) | 0.00 (3) | 1.00 (1) | 0.67 (3) | 0.33 (3) |
| DS:B-deepseek-2 | 12 | — | — | 1.00 (2) | 1.00 (5) | — | 1.00 (1) | 0.00 (1) | 0.00 (1) | 0.50 (8) | 0.38 (8) |
| DS:C-deepseek-1 | 1 | — | — | — | — | — | — | — | — | 1.00 (1) | 0.00 (1) |
| DS:C-deepseek-2 | 20 | 0.50 (2) | 0.00 (2) | 1.00 (3) | 0.83 (6) | — | — | — | 0.00 (1) | 1.00 (12) | 0.00 (12) |
| SW:A-opus-1 | 20 | 0.50 (2) | 0.00 (2) | 0.50 (2) | 0.92 (12) | 0.33 (3) | 0.92 (13) | 0.00 (13) | 0.50 (2) | 0.67 (12) | 0.17 (12) |
| SW:A-fable-1 | 20 | — | — | 0.00 (1) | 1.00 (8) | 0.50 (2) | 0.75 (4) | 0.25 (4) | 1.00 (1) | 1.00 (15) | 0.00 (15) |
| SW:A-astra-1 | 20 | 1.00 (1) | 0.00 (1) | 0.00 (2) | 1.00 (7) | — | 0.86 (7) | 0.00 (7) | 1.00 (1) | 0.50 (4) | 0.00 (4) |
| SW:A-sol-1 | 20 | 0.50 (2) | 0.00 (2) | 1.00 (2) | 1.00 (4) | — | 1.00 (2) | 0.00 (2) | 0.00 (1) | 0.60 (5) | 0.00 (5) |
| SW:A-deepseek-1 | 20 | 0.50 (4) | 0.25 (4) | 0.25 (4) | 0.80 (5) | — | 1.00 (7) | 0.00 (7) | 0.50 (2) | 0.88 (8) | 0.00 (8) |
| SW:A-opus-2 | 20 | 0.00 (2) | 0.00 (2) | 0.50 (2) | 0.91 (11) | — | 1.00 (11) | 0.00 (11) | 0.50 (2) | 0.77 (17) | 0.06 (17) |
| SW:A-fable-2 | 20 | 0.50 (2) | 0.00 (2) | 1.00 (2) | 1.00 (10) | — | 1.00 (5) | 0.00 (5) | 1.00 (1) | 1.00 (13) | 0.00 (13) |
| SW:A-astra-2 | 20 | 0.00 (1) | 0.00 (1) | 0.00 (1) | 0.83 (6) | 0.00 (1) | 0.67 (3) | 0.33 (3) | 0.00 (1) | 0.60 (5) | 0.00 (5) |
| SW:A-sol-2 | 20 | 0.00 (1) | 0.00 (1) | 0.00 (1) | 1.00 (4) | — | 1.00 (2) | 0.00 (2) | 1.00 (1) | 0.86 (7) | 0.00 (7) |
| SW:A-deepseek-2 | 20 | 1.00 (1) | 0.00 (1) | 0.50 (2) | 0.67 (6) | — | 0.91 (11) | 0.00 (11) | — | 1.00 (8) | 0.00 (8) |
| SW:B-opus-1 | 20 | 0.00 (1) | 0.00 (1) | 0.50 (4) | 0.88 (8) | — | 0.94 (18) | 0.06 (18) | 0.00 (1) | 1.00 (15) | 0.00 (15) |
| SW:B-fable-1 | 20 | 0.67 (3) | 0.00 (3) | 0.67 (3) | 1.00 (10) | — | 1.00 (6) | 0.00 (6) | 0.00 (1) | 0.92 (12) | 0.00 (12) |
| SW:B-astra-1 | 20 | 1.00 (1) | 0.00 (1) | 1.00 (2) | 1.00 (2) | 0.00 (1) | 1.00 (8) | 0.00 (8) | 0.33 (3) | 1.00 (9) | 0.00 (9) |
| SW:B-sol-1 | 20 | 1.00 (1) | 0.00 (1) | 0.50 (4) | 0.80 (5) | 0.00 (1) | 1.00 (3) | 0.00 (3) | — | 1.00 (11) | 0.00 (11) |
| SW:B-deepseek-1 | 6 | — | — | 1.00 (1) | 1.00 (1) | — | — | — | — | 1.00 (3) | 0.00 (3) |
| SW:B-opus-2 | 20 | 1.00 (1) | 0.00 (1) | 0.67 (3) | 0.91 (11) | 0.25 (4) | 1.00 (17) | 0.00 (17) | — | 0.67 (6) | 0.00 (6) |
| SW:B-fable-2 | 20 | 1.00 (1) | 0.00 (1) | 0.67 (3) | 1.00 (8) | 1.00 (2) | 1.00 (13) | 0.00 (13) | 0.50 (2) | 0.83 (12) | 0.17 (12) |
| SW:B-astra-2 | 20 | 0.67 (3) | 0.00 (3) | 1.00 (3) | 0.82 (11) | 0.00 (1) | 1.00 (2) | 0.00 (2) | 0.00 (3) | 1.00 (7) | 0.00 (7) |
| SW:B-sol-2 | 20 | — | — | 0.50 (4) | 0.80 (5) | — | 1.00 (5) | 0.00 (5) | 1.00 (1) | 0.88 (8) | 0.13 (8) |
| SW:B-deepseek-2 | 20 | 0.33 (3) | 0.00 (3) | 0.00 (1) | 0.67 (3) | — | 1.00 (7) | 0.00 (7) | 1.00 (1) | 0.91 (11) | 0.00 (11) |
| CW:CW-opus | 25 | 0.00 (1) | 1.00 (1) | 0.00 (2) | 0.83 (6) | — | 0.93 (14) | 0.07 (14) | 0.50 (2) | 0.82 (11) | 0.00 (11) |
| CW:CW-fable | 25 | 0.50 (2) | 0.00 (2) | 1.00 (3) | 0.67 (3) | 0.50 (2) | 0.80 (15) | 0.13 (15) | 0.00 (2) | 0.89 (26) | 0.00 (26) |
| CW:CW-astra | 25 | — | — | 0.67 (3) | 0.50 (2) | 1.00 (1) | 0.60 (5) | 0.40 (5) | 0.00 (1) | 1.00 (6) | 0.00 (6) |
| CW:CW-sol | 25 | 1.00 (1) | 0.00 (1) | 0.33 (3) | — | 1.00 (1) | 0.83 (6) | 0.00 (6) | — | 0.67 (6) | 0.17 (6) |
| VL:V-opus | 20 | 0.00 (1) | 1.00 (1) | 0.50 (2) | 1.00 (8) | 0.00 (2) | 1.00 (8) | 0.00 (8) | 1.00 (1) | 1.00 (16) | 0.00 (16) |
| VL:V-fable | 20 | — | — | 0.67 (3) | 0.91 (11) | 0.50 (2) | 1.00 (5) | 0.00 (5) | 0.00 (1) | 0.96 (25) | 0.00 (25) |
| VL:V-astra | 20 | — | — | 1.00 (1) | 0.33 (6) | — | 0.50 (2) | 0.00 (2) | — | 0.89 (9) | 0.00 (9) |
| VL:V-sol | 20 | 0.67 (3) | 0.33 (3) | 0.50 (4) | 0.40 (5) | — | — | — | 0.00 (2) | 0.80 (10) | 0.00 (10) |

## The judges — T1–T4

Judges: GPT-6 Astra (`gpt-6-astra`, effort medium), DeepSeek V4 Pro (`deepseek/deepseek-v4-pro-0813`, effort medium), Claude Haiku 5.5 (`claude-haiku-5-5`, effort medium). Each got its own shuffle of every set, renumbered from 1; one retry when an answer did not parse or did not cover every strip once.

| Task | Chance | GPT-6 Astra | DeepSeek V4 Pro | Claude Haiku 5.5 |
| --- | --- | --- | --- | --- |
| T1 Table C, 10 strips (ARI; p) | 95th percentile of shuffles | 0.148 (3 groups; 95th 0.237; p 0.1982) | 0.206 (6 groups; 95th 0.206; p 0.1167) | 0.206 (5 groups; 95th 0.206; p 0.1599) |
| T2 SAME_WORLD Table A (pairs of 5; p) | 5/9 expected | 3 (p 0.0222) | no answer | 3 (p 0.0222) |
| T2 SAME_WORLD Table B (pairs of 5; p) | 5/9 expected | 2 (p 0.1069) | no answer | 1 (p 0.4243) |
| T3 A1 (DeepSeek named?) | 1/5 | ✗ (G2:A-opus) | ✗ (G2:A-opus) | ✗ (G2:A-opus) |
| T3 A2 (DeepSeek named?) | 1/5 | ✗ (G2:A-opus) | no answer | ✗ (G2:A-opus) |
| T3 B1 (DeepSeek named?) | 1/5 | ✗ (G2:B-sol) | ✓ | ✓ |
| T3 B2 (DeepSeek named?) | 1/5 | ✗ (G2:B-sol) | ✓ | ✓ |
| T3 C1 (DeepSeek named?) | 1/5 | ✗ (G2:C-opus) | ✓ | ✗ (G2:C-opus) |
| T3 C2 (DeepSeek named?) | 1/5 | ✗ (G2:C-opus) | ✗ (G2:C-opus) | ✗ (G2:C-opus) |
| T3 (supplementary) SW-A1 (DeepSeek named?) | 1/5 | ✗ (SW:A-astra-1) | ✗ (SW:A-astra-1) | ✗ (SW:A-astra-1) |
| T3 (supplementary) SW-A2 (DeepSeek named?) | 1/5 | ✗ (SW:A-opus-2) | ✗ (SW:A-opus-2) | ✗ (SW:A-opus-2) |
| T3 (supplementary) SW-B1 (DeepSeek named?) | 1/5 | ✓ | ✓ | ✓ |
| T3 (supplementary) SW-B2 (DeepSeek named?) | 1/5 | ✗ (SW:B-opus-2) | ✓ | ✓ |
| T3 pre-registered, of 6 | 1.2 expected | 0/6 | 3/6 | 2/6 |
| T3 supplementary, of 4 | 0.8 expected | 1/4 | 2/4 | 2/4 |
| T4 transfer, of 8 (p) | 1/2 | 8/8 (p 0.0039); CW 4/4, V 4/4 | 5/8 (p 0.3633); CW 3/4, V 2/4 | 7/8 (p 0.0352); CW 4/4, V 3/4 |

### What the judges could read: codes per line (after the run, not pre-registered)

The tagger codes acts from the player's message, so a player who writes more per turn gets more codes per line. Codes per line, mean over sessions:

| Model | Town | Combat (CW) | Villain (V) |
| --- | --- | --- | --- |
| Claude Opus 5.5 | 4.85 | 3.72 | 4.65 |
| Claude Fable 5.1 | 4.25 | 4.52 | 5.05 |
| GPT-6 Astra | 2.70 | 2.68 | 2.75 |
| GPT-6.1 Sol | 2.66 | 2.96 | 2.70 |
| DeepSeek V4 Pro | 2.97 | — | — |

That one number alone — a strip at or above 3.61 codes a line (the midpoint of the two families' training means, 4.55 and 2.68) is Family Anthropic — labels 8 of 8 T4 test strips correctly, no model needed. The rates at the forks, which do not depend on how many codes a line carries, show no family (the exploratory test above).

### Notes

- **DeepSeek gave no valid answer on 3 of its 14 tasks** (T2 A, T2 B, T3 A2): at effort medium its reasoning used the whole 16 000-token budget twice and left no text. Scored as no answer, as frozen. None of them can change a line: BD2 and BD3 fail for both other judges.
- **T3's length cue cut both ways.** REPLICATE_1's DeepSeek seats were short (3, 3, 11, 12, 1 and 20 turns), but so were group 2's A-opus (4) and C-opus (12), both stuck at a card; the judges named an Opus seat in 10 of the 17 pre-registered answers. At SAME_WORLD_1, where three of DeepSeek's four seats reached turn 20, every judge named it at B round 1 (its 6-turn seat) and none at A.
- **The fact fork has little spread:** «assert» is 0.5–1.0 for nearly every session. The tagger reads most new detail in a player's narration as asserted, so this fork adds little to the distance; the forks that do vary (coin, companion, request, claim, exit) are thin per session (often 1–5 opportunities).
- **T2 Table A:** Astra found DeepSeek V4 Pro, GPT-6.1 Sol, GPT-6 Astra; Haiku Claude Opus 5.5, GPT-6 Astra, GPT-6.1 Sol. At B: Astra DeepSeek V4 Pro, GPT-6.1 Sol; Haiku DeepSeek V4 Pro. One table above chance and one not: BD2 as written is lost.

## Extraction

The vocabulary, the machine rules and the tagger's prompt verbatim: `docs/runs/blind-decisions-1-vocabulary.md` (frozen). The tagger: Claude claude-haiku-5-5, effort low; it saw the hero's brief, the screen before the turn, the player's message, anything written at a card and the reply (context only); no model, table or session named.

- Turns tagged: 1064 (two turns had no message); both passes usable on 1064; identical on 256 (24 %); a third pass on 808; turns with no usable tag: 0; a fork left with three different answers: 23; codes outside the lists dropped: 5.
- Pass 1 against pass 2: acts mean Jaccard 0.75; Cohen's κ per fork request 0.61, claim 0.47, coin 0.83, companion 0.79, exit 0.50; fact moves 0.50.
- Moves without a class: 0; turns without a tag: 0.

## Every strip

All 58 strips, with who played each: `docs/runs/blind-decisions-1-strips.md`; codes per turn and fork counts: `docs/runs/blind-decisions-1-strips.json`.

## The judges' prompts

System (every task):

```text
You read decision strips from tabletop role-play sessions and answer a question about who played them. Answer only with the JSON asked for, after any thinking you need.
```

User: the legend (in the vocabulary page), «The strips:», the strips in the judge's own order (header «Strip n · Table X · N turns»; at T4 the training strips add «· Family 1|2» and the test strips are «Test strip n»), then the task and its answer shape:

- **T1:** «These are ten play-throughs of the same scenario. Group them into families of players that you believe are the same kind of player. State the number of groups and the reason for each grouping.» — «Answer with JSON only, in this shape: {"number":<groups>,"groups":[{"strips":[<strip numbers>],"reason":"<one or two sentences>"}, …]} — every strip in exactly one group.»
- **T2:** «Five players each played twice. Pair the strips.» — «Answer with JSON only, in this shape: {"pairs":[[<strip>,<strip>], …five pairs],"reason":"<one or two sentences>"} — every strip in exactly one pair.»
- **T3:** «One of these strips is a different kind of player from the rest. Which?» — «Answer with JSON only, in this shape: {"odd":<strip number>,"reason":"<one or two sentences>"}.»
- **T4:** «The strips marked with a family come from town sessions; every player belongs to one of two families, Family 1 or Family 2. The strips after them, marked «Test», come from the same families in new situations — a fight on the road (table CW) and a table where the hero is a villain (table V). Label each test strip with the family you believe its player belongs to.» — «Answer with JSON only, in this shape: {"labels":{"<test strip number>":"1"|"2", …every test strip},"reason":"<one or two sentences>"}.»

Every prompt as sent, every answer as returned, and each judge's order: `docs/runs/blind-decisions-1-judges.json`.

## The human packet (BD5)

`docs/runs/blind-decisions-1-human-packet.md`: one file, the legend, every task with the strips in one shuffled order (the same for every reader), and an answer sheet. The key is the «human» order in `docs/runs/blind-decisions-1-judges.json`'s neighbour `docs/runs/blind-decisions-1-human-key.json`; readers should not open it. No answers yet: BD5 stays open.

## Spend

- OpenRouter (Haiku as tagger and judge, DeepSeek as judge): $3.3126 of $20 — the tagger's smoke before the freeze (6 turns) $0.0045; the tagger's smoke before the freeze (8 turns) $0.0067; the move destinations' classes $0.0081; the blind tagger (1064 turns) $2.5416; the judges (42 tasks) $0.7516.
- OpenAI (Astra as judge): $1.3252 of $5 — the judges (42 tasks) $1.3252.
- The Console: $0 (no call).
