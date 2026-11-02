# S1-none-T1 — the per-table measures

Synthetic content: invented characters in an invented campaign. Stage origin/claude/handoff at bbdee5fb (docs/stages/GAME_PARTY_2.md with its amendments of 2026-10-28 23:10 LA, 23:15 LA, 2026-10-29 18:35 LA and 18:45 LA); Mandate: issue #1; docs/POLICY.md v1. Design sha256 `a4aaf062699987820d7a92de5009b22ebfc8fed67402c22e19275fc4185d2459`.

Arm **S1-none** (Beregost — the Whitestone case; none (the control)); the one in danger (the layer's die): Pell Dunmore. 15 round(s) of 15; ended by rounds. Models: the DM: the owner's settings (Claude Opus 5.5); the relay: Claude Sonnet 5.5; the players by the seating.

Seats: Bram Halloway (fighter) — GPT-6.1 Sol; Sefa Marrin (warlock) — DeepSeek V4 Pro 0813; Pell Dunmore (rogue) — Claude Opus 5.5. The order of the round's messages turns round each round from the table's coin (2). The players are not told what the others are.

## Evenness (A2: a per-table measure)

| Character | DM narration words about | Share | «you» per screen (mean) | Screens | Its player's words (share) |
| --- | --- | --- | --- | --- | --- |
| Bram Halloway | 1687 | 30.6 % | 4 % | 15 | 1154 (15.6 %) |
| Sefa Marrin | 780 | 14.1 % | 3.4 % | 11 | 1990 (26.9 %) |
| Pell Dunmore | 3052 | 55.3 % | 4.1 % | 17 | 4244 (57.4 %) |
| (the world: about no character) | 12415 | — | — | — | — |

Spread 41.2 %, largest 55.3 % (the first dry run's bar, spread ≤ 10 points and none above 45 %: outside it). Per round (words about each): r1 Bram 27/Sefa 20/Pell 56 · r2 Bram 67/Sefa 48/Pell 88 · r3 Bram 48/Sefa 132/Pell 182 · r4 Bram 32/Sefa 43/Pell 167 · r5 Bram 17/Sefa 74/Pell 237 · r6 Bram 62/Sefa 18/Pell 310 · r7 Bram 94/Sefa 63/Pell 148 · r8 Bram 227/Sefa 78/Pell 113 · r9 Bram 118/Sefa 85/Pell 168 · r10 Bram 214/Sefa 94/Pell 406 · r11 Bram 225/Sefa 48/Pell 219 · r12 Bram 165/Sefa 0/Pell 156 · r13 Bram 153/Sefa 6/Pell 187 · r14 Bram 162/Sefa 39/Pell 267 · r15 Bram 78/Sefa 34/Pell 351.

## Who comes first in what the DM reads (fix A2)

Every DM request of the table (the opening, the turns, the bookkeeper, the out-of-game answers), read outside the story's own words: the character named first. Not a third each.

| Round | Order sent to the DM | DM inputs | First in them |
| --- | --- | --- | --- |
| 1 | Pell → Bram → Sefa | 3 | Pell 3 |
| 2 | Bram → Sefa → Pell | 4 | Bram 4 |
| 3 | Sefa → Pell → Bram | 5 | Sefa 5 |
| 4 | Bram / Pell → Sefa | 6 | Bram 2, Pell 4 |
| 5 | Bram / Sefa → Pell | 7 | Bram 2, Sefa 5 |
| 6 | Bram / Sefa / Pell | 6 | Bram 2, Sefa 2, Pell 2 |
| 7 | Bram / Sefa / Pell | 6 | Bram 2, Sefa 2, Pell 2 |
| 8 | Bram / Sefa / Pell | 7 | Bram 2, Sefa 2, Pell 3 |
| 9 | Bram / Sefa / Pell | 7 | Bram 2, Sefa 3, Pell 2 |
| 10 | Sefa → Bram / Pell | 5 | Sefa 2, Pell 3 |
| 11 | Bram → Sefa / Pell | 5 | Bram 2, Pell 3 |
| 12 | Pell → Bram | 3 | Pell 3 |
| 13 | Bram → Pell | 3 | Bram 3 |
| 14 | Bram / Pell | 5 | Bram 3, Pell 2 |
| 15 | Bram / Pell | 8 | Bram 3, Pell 5 |

Per seat: Bram first in 5 round(s), 27 input(s) (33.8 %); Sefa first in 3 round(s), 21 input(s) (26.3 %); Pell first in 7 round(s), 32 input(s) (40 %).

## The relay's copies (A4)

The relay: Claude Sonnet 5.5. Copies of 8 words from another player's message in its first pass: 8; screens sent back alone, runs marked: 8 — clean after one return 4, after the second 0; **defects logged: 4**.
