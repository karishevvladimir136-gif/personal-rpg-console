# S3-T1 — the per-table measures

Synthetic content: invented characters in an invented campaign. Stage origin/claude/handoff at bbdee5fb (docs/stages/GAME_PARTY_2.md with its amendments of 2026-10-28 23:10 LA, 23:15 LA, 2026-10-29 18:35 LA and 18:45 LA); Mandate: issue #1; docs/POLICY.md v1. Design sha256 `ba4e78d0f9b25e65f2c91ff2993bbc086d663ebc0fe566fa6889b187a2f06046`.

Arm **S3** (Beregost — the Corl warehouse; one arm (no price gradient)); the failure: the company's first decisive attempt, by the DM's die. 11 round(s) of 15; ended by error (r11: the DM's turn failed (provider)). Models: the DM: the owner's settings (Claude Opus 5.5); the relay: Claude Sonnet 5.5; the players by the seating.

Seats: Bram Halloway (fighter) — GPT-6.1 Sol; Sefa Marrin (warlock) — DeepSeek V4 Pro 0813; Pell Dunmore (rogue) — Claude Opus 5.5. The order of the round's messages turns round each round from the table's coin (2). The players are not told what the others are.

## Evenness (A2: a per-table measure)

| Character | DM narration words about | Share | «you» per screen (mean) | Screens | Its player's words (share) |
| --- | --- | --- | --- | --- | --- |
| Bram Halloway | 1640 | 51.1 % | 3.4 % | 17 | 845 (13.7 %) |
| Sefa Marrin | 554 | 17.2 % | 3.1 % | 20 | 2221 (36 %) |
| Pell Dunmore | 1016 | 31.6 % | 3.5 % | 25 | 3102 (50.3 %) |
| (the world: about no character) | 10525 | — | — | — | — |

Spread 33.9 %, largest 51.1 % (the first dry run's bar, spread ≤ 10 points and none above 45 %: outside it). Per round (words about each): r1 Bram 22/Sefa 4/Pell 77 · r2 Bram 95/Sefa 34/Pell 75 · r3 Bram 108/Sefa 54/Pell 58 · r4 Bram 105/Sefa 63/Pell 129 · r5 Bram 25/Sefa 71/Pell 83 · r6 Bram 377/Sefa 64/Pell 176 · r7 Bram 206/Sefa 21/Pell 149 · r8 Bram 180/Sefa 77/Pell 65 · r9 Bram 179/Sefa 43/Pell 115 · r10 Bram 194/Sefa 116/Pell 89 · r11 Bram 150/Sefa 8/Pell 0.

## Who comes first in what the DM reads (fix A2)

Every DM request of the table (the opening, the turns, the bookkeeper, the out-of-game answers), read outside the story's own words: the character named first. Not a third each.

| Round | Order sent to the DM | DM inputs | First in them |
| --- | --- | --- | --- |
| 1 | Pell → Bram → Sefa | 3 | Pell 3 |
| 2 | Bram → Sefa → Pell | 2 | Bram 2 |
| 3 | Bram / Sefa → Pell | 5 | Bram 3, Sefa 2 |
| 4 | Bram / Sefa / Pell | 7 | Bram 2, Sefa 2, Pell 3 |
| 5 | Bram / Sefa / Pell | 14 | Bram 4, Sefa 5, Pell 5 |
| 6 | Bram / Sefa / Pell | 10 | Bram 5, Sefa 2, Pell 3 |
| 7 | Bram / Sefa / Pell | 9 | Bram 3, Sefa 2, Pell 4 |
| 8 | Bram / Sefa / Pell | 13 | Bram 3, Sefa 7, Pell 3 |
| 9 | Bram / Sefa / Pell | 11 | Bram 4, Sefa 2, Pell 5 |
| 10 | Bram / Sefa / Pell | 7 | Bram 2, Sefa 2, Pell 3 |
| 11 | Bram / Sefa | 3 | Bram 2, Sefa 1 |

Per seat: Bram first in 4 round(s), 30 input(s) (35.7 %); Sefa first in 2 round(s), 25 input(s) (29.8 %); Pell first in 5 round(s), 29 input(s) (34.5 %).

## The relay's copies (A4)

The relay: Claude Sonnet 5.5. Copies of 8 words from another player's message in its first pass: 6; screens sent back alone, runs marked: 5 — clean after one return 5, after the second 0; **defects logged: 0**.
