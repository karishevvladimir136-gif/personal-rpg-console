# S1-moderate-T2 — the per-table measures

Synthetic content: invented characters in an invented campaign. Stage origin/claude/handoff at bbdee5fb (docs/stages/GAME_PARTY_2.md with its amendments of 2026-10-28 23:10 LA, 23:15 LA, 2026-10-29 18:35 LA and 18:45 LA); Mandate: issue #1; docs/POLICY.md v1. Design sha256 `ba4e78d0f9b25e65f2c91ff2993bbc086d663ebc0fe566fa6889b187a2f06046`.

Arm **S1-moderate** (Beregost — the Whitestone case; moderate (one resource)); the one in danger (the layer's die): Pell Dunmore. 11 round(s) of 15; ended by error (r11: the DM's turn failed (validation)). Models: the DM: the owner's settings (Claude Opus 5.5); the relay: Claude Sonnet 5.5; the players by the seating.

Seats: Bram Halloway (fighter) — GPT-6 Astra; Sefa Marrin (warlock) — DeepSeek V4 Pro 0813; Pell Dunmore (rogue) — Claude Fable 5.1. The order of the round's messages turns round each round from the table's coin (2). The players are not told what the others are.

## Evenness (A2: a per-table measure)

| Character | DM narration words about | Share | «you» per screen (mean) | Screens | Its player's words (share) |
| --- | --- | --- | --- | --- | --- |
| Bram Halloway | 991 | 35.4 % | 3.1 % | 11 | 1118 (18.6 %) |
| Sefa Marrin | 523 | 18.7 % | 2.6 % | 11 | 1736 (28.8 %) |
| Pell Dunmore | 1287 | 45.9 % | 3.3 % | 13 | 3164 (52.6 %) |
| (the world: about no character) | 5087 | — | — | — | — |

Spread 27.3 %, largest 45.9 % (the first dry run's bar, spread ≤ 10 points and none above 45 %: outside it). Per round (words about each): r1 Bram 32/Sefa 34/Pell 28 · r2 Bram 52/Sefa 25/Pell 25 · r3 Bram 70/Sefa 14/Pell 145 · r4 Bram 138/Sefa 19/Pell 55 · r5 Bram 40/Sefa 22/Pell 252 · r6 Bram 120/Sefa 99/Pell 83 · r7 Bram 248/Sefa 69/Pell 198 · r8 Bram 76/Sefa 64/Pell 194 · r9 Bram 114/Sefa 122/Pell 160 · r10 Bram 56/Sefa 33/Pell 100 · r11 Bram 47/Sefa 24/Pell 48.

## Who comes first in what the DM reads (fix A2)

Every DM request of the table (the opening, the turns, the bookkeeper, the out-of-game answers), read outside the story's own words: the character named first. Not a third each.

| Round | Order sent to the DM | DM inputs | First in them |
| --- | --- | --- | --- |
| 1 | Pell → Bram → Sefa | 3 | Pell 3 |
| 2 | Bram → Sefa → Pell | 3 | Bram 3 |
| 3 | Sefa → Pell → Bram | 6 | Sefa 6 |
| 4 | Pell → Bram → Sefa | 2 | Pell 2 |
| 5 | Bram → Sefa → Pell | 4 | Bram 4 |
| 6 | Sefa → Bram / Pell | 5 | Sefa 3, Pell 2 |
| 7 | Bram → Sefa / Pell | 6 | Bram 3, Pell 3 |
| 8 | Bram → Sefa → Pell | 5 | Bram 5 |
| 9 | Sefa → Pell → Bram | 4 | Sefa 4 |
| 10 | Pell → Bram → Sefa | 3 | Pell 3 |
| 11 | Bram → Sefa / Pell | 5 | Bram 3, Pell 2 |

Per seat: Bram first in 5 round(s), 18 input(s) (39.1 %); Sefa first in 3 round(s), 13 input(s) (28.3 %); Pell first in 3 round(s), 15 input(s) (32.6 %).

## The relay's copies (A4)

The relay: Claude Sonnet 5.5. Copies of 8 words from another player's message in its first pass: 20; screens sent back alone, runs marked: 17 — clean after one return 15, after the second 2; **defects logged: 0**.
