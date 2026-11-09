# S1-high-T2 — the per-table measures

Synthetic content: invented characters in an invented campaign. Stage origin/claude/handoff at bbdee5fb (docs/stages/GAME_PARTY_2.md with its amendments of 2026-10-28 23:10 LA, 23:15 LA, 2026-10-29 18:35 LA and 18:45 LA); Mandate: issue #1; docs/POLICY.md v1. Design sha256 `ba4e78d0f9b25e65f2c91ff2993bbc086d663ebc0fe566fa6889b187a2f06046`.

Arm **S1-high** (Beregost — the Whitestone case; high (the save forfeits the reward)); the one in danger (the layer's die): Pell Dunmore. 13 round(s) of 15; ended by error (r13: the DM's turn failed (provider)). Models: the DM: the owner's settings (Claude Opus 5.5); the relay: Claude Sonnet 5.5; the players by the seating.

Seats: Bram Halloway (fighter) — GPT-6 Astra; Sefa Marrin (warlock) — DeepSeek V4 Pro 0813; Pell Dunmore (rogue) — Claude Fable 5.1. The order of the round's messages turns round each round from the table's coin (2). The players are not told what the others are.

## Evenness (A2: a per-table measure)

| Character | DM narration words about | Share | «you» per screen (mean) | Screens | Its player's words (share) |
| --- | --- | --- | --- | --- | --- |
| Bram Halloway | 2017 | 45.5 % | 3.3 % | 23 | 1465 (15.6 %) |
| Sefa Marrin | 906 | 20.5 % | 2 % | 22 | 2905 (31 %) |
| Pell Dunmore | 1507 | 34 % | 3.6 % | 25 | 5009 (53.4 %) |
| (the world: about no character) | 9985 | — | — | — | — |

Spread 25.1 %, largest 45.5 % (the first dry run's bar, spread ≤ 10 points and none above 45 %: outside it). Per round (words about each): r1 Bram 35/Sefa 18/Pell 13 · r2 Bram 39/Sefa 47/Pell 37 · r3 Bram 30/Sefa 33/Pell 26 · r4 Bram 46/Sefa 23/Pell 63 · r5 Bram 47/Sefa 57/Pell 146 · r6 Bram 82/Sefa 21/Pell 129 · r7 Bram 203/Sefa 111/Pell 138 · r8 Bram 312/Sefa 28/Pell 132 · r9 Bram 143/Sefa 132/Pell 212 · r10 Bram 352/Sefa 114/Pell 203 · r11 Bram 192/Sefa 129/Pell 121 · r12 Bram 225/Sefa 68/Pell 241 · r13 Bram 315/Sefa 128/Pell 48.

## Who comes first in what the DM reads (fix A2)

Every DM request of the table (the opening, the turns, the bookkeeper, the out-of-game answers), read outside the story's own words: the character named first. Each seat came first in a third of the rounds, give or take one.

| Round | Order sent to the DM | DM inputs | First in them |
| --- | --- | --- | --- |
| 1 | Pell → Bram → Sefa | 3 | Pell 3 |
| 2 | Bram → Sefa → Pell | 5 | Bram 4, Sefa 1 |
| 3 | Sefa → Pell → Bram | 3 | Sefa 3 |
| 4 | Pell → Bram → Sefa | 3 | Pell 3 |
| 5 | Bram → Sefa → Pell | 4 | Bram 4 |
| 6 | Sefa → Pell → Bram | 5 | Sefa 4, Pell 1 |
| 7 | Bram → Sefa / Pell | 8 | Bram 4, Pell 4 |
| 8 | Sefa → Bram / Pell | 10 | Sefa 6, Pell 4 |
| 9 | Bram → Sefa / Pell | 8 | Bram 3, Sefa 1, Pell 4 |
| 10 | Sefa → Bram / Pell | 9 | Sefa 5, Pell 4 |
| 11 | Bram → Sefa / Pell | 12 | Bram 3, Sefa 2, Pell 7 |
| 12 | Bram / Sefa / Pell | 10 | Bram 4, Sefa 3, Pell 3 |
| 13 | Bram / Sefa / Pell | 9 | Bram 4, Sefa 4, Pell 1 |

Per seat: Bram first in 5 round(s), 26 input(s) (29.2 %); Sefa first in 4 round(s), 29 input(s) (32.6 %); Pell first in 4 round(s), 34 input(s) (38.2 %).

## The relay's copies (A4)

The relay: Claude Sonnet 5.5. Copies of 8 words from another player's message in its first pass: 12; screens sent back alone, runs marked: 11 — clean after one return 9, after the second 1; **defects logged: 1**.
