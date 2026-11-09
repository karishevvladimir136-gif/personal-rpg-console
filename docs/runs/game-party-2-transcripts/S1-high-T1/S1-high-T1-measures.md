# S1-high-T1 — the per-table measures

Synthetic content: invented characters in an invented campaign. Stage origin/claude/handoff at bbdee5fb (docs/stages/GAME_PARTY_2.md with its amendments of 2026-10-28 23:10 LA, 23:15 LA, 2026-10-29 18:35 LA and 18:45 LA); Mandate: issue #1; docs/POLICY.md v1. Design sha256 `ba4e78d0f9b25e65f2c91ff2993bbc086d663ebc0fe566fa6889b187a2f06046`.

Arm **S1-high** (Beregost — the Whitestone case; high (the save forfeits the reward)); the one in danger (the layer's die): Pell Dunmore. 14 round(s) of 15; ended by error (r14: the DM's turn failed (provider)). Models: the DM: the owner's settings (Claude Opus 5.5); the relay: Claude Sonnet 5.5; the players by the seating.

Seats: Bram Halloway (fighter) — GPT-6.1 Sol; Sefa Marrin (warlock) — DeepSeek V4 Pro 0813; Pell Dunmore (rogue) — Claude Opus 5.5. The order of the round's messages turns round each round from the table's coin (2). The players are not told what the others are.

## Evenness (A2: a per-table measure)

| Character | DM narration words about | Share | «you» per screen (mean) | Screens | Its player's words (share) |
| --- | --- | --- | --- | --- | --- |
| Bram Halloway | 2230 | 38.4 % | 2.7 % | 14 | 1422 (14.3 %) |
| Sefa Marrin | 1721 | 29.6 % | 2.8 % | 20 | 4304 (43.3 %) |
| Pell Dunmore | 1858 | 32 % | 4 % | 19 | 4216 (42.4 %) |
| (the world: about no character) | 12236 | — | — | — | — |

Spread 8.8 %, largest 38.4 % (the first dry run's bar, spread ≤ 10 points and none above 45 %: within it). Per round (words about each): r1 Bram 68/Sefa 28/Pell 83 · r2 Bram 30/Sefa 64/Pell 103 · r3 Bram 28/Sefa 15/Pell 53 · r4 Bram 86/Sefa 39/Pell 203 · r5 Bram 203/Sefa 116/Pell 143 · r6 Bram 124/Sefa 65/Pell 52 · r7 Bram 306/Sefa 135/Pell 153 · r8 Bram 138/Sefa 119/Pell 177 · r9 Bram 189/Sefa 157/Pell 190 · r10 Bram 323/Sefa 243/Pell 217 · r11 Bram 229/Sefa 329/Pell 119 · r12 Bram 362/Sefa 148/Pell 190 · r13 Bram 146/Sefa 264/Pell 176 · r14 Bram 0/Sefa 0/Pell 0.

## Who comes first in what the DM reads (fix A2)

Every DM request of the table (the opening, the turns, the bookkeeper, the out-of-game answers), read outside the story's own words: the character named first. Not a third each.

| Round | Order sent to the DM | DM inputs | First in them |
| --- | --- | --- | --- |
| 1 | Pell → Bram → Sefa | 4 | Pell 4 |
| 2 | Bram → Sefa → Pell | 9 | Bram 4, Sefa 5 |
| 3 | Sefa → Pell → Bram | 3 | Sefa 3 |
| 4 | Sefa → Bram / Pell | 6 | Sefa 2, Pell 4 |
| 5 | Bram → Sefa / Pell | 7 | Bram 4, Pell 3 |
| 6 | Sefa → Bram / Pell | 7 | Sefa 4, Pell 3 |
| 7 | Bram → Sefa / Pell | 7 | Bram 4, Pell 3 |
| 8 | Sefa → Bram / Pell | 7 | Sefa 4, Pell 3 |
| 9 | Bram → Sefa / Pell | 8 | Bram 4, Pell 4 |
| 10 | Sefa → Bram / Pell | 9 | Sefa 5, Pell 4 |
| 11 | Bram → Sefa / Pell | 8 | Bram 5, Pell 3 |
| 12 | Sefa → Bram / Pell | 5 | Sefa 3, Pell 2 |
| 13 | Bram / Sefa / Pell | 12 | Bram 3, Sefa 7, Pell 2 |
| 14 | Bram | 1 | Bram 1 |

Per seat: Bram first in 5 round(s), 25 input(s) (26.9 %); Sefa first in 7 round(s), 33 input(s) (35.5 %); Pell first in 2 round(s), 35 input(s) (37.6 %).

## The relay's copies (A4)

The relay: Claude Sonnet 5.5. Copies of 8 words from another player's message in its first pass: 9; screens sent back alone, runs marked: 9 — clean after one return 7, after the second 1; **defects logged: 1**.
