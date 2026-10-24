# Persona self-talk 1 — the paid-call ledger

Cap $200. Spent **$84.2698** in 5623 calls over 4 run(s).
- 2026-10-24 06:26 UTC: persona-self-talk-1: arms 1, 2, 60 conversations, effort medium — 4703 calls, $57.7113 → `persona-self-talk-1-run-20261024-062656.json`
- 2026-10-24 07:47 UTC: persona-self-talk-1: arms 3, 4, 5, 40 conversations, effort medium — 267 calls, $8.5509 (stopped: the circuit breaker: 2 refusals in total) → `persona-self-talk-1-run-20261024-074700.json`
- 2026-10-24 08:14 UTC: persona-self-talk-1: arms 3, 5, 20 conversations, effort medium (resumed) — 314 calls, $9.8507 → `persona-self-talk-1-run-20261024-081458.json`
- 2026-10-24 08:34 UTC: persona-self-talk-1: arms 6, 10 conversations, effort medium — 339 calls, $8.1569 → `persona-self-talk-1-run-20261024-083458.json`

Prices per 1M tokens: Opus 5.5 input $4 / output $20; Sonnet 5.5 $2 / $10; Haiku 5.5 $0.10 / $0.50. Fable 5.1 input $10 / output $50 / cached read $0.25. Output tokens include thinking. Judge: claude-haiku-5-5, referee claude-opus-5-5.

| Model — purpose | Calls | Input tokens | Output tokens | Cost |
| --- | --- | --- | --- | --- |
| claude-sonnet-5-5 — subject | 704 | 12942 | 361030 | $6.4451 |
| claude-haiku-5-5 — check | 2441 | 2902380 | 159348 | $0.3699 |
| claude-opus-5-5 — subject | 899 | 13887 | 924808 | $25.3298 |
| claude-fable-5-1 — subject | 857 | 16613 | 725274 | $47.1215 |
| claude-haiku-5-5 — tags | 534 | 2825444 | 347228 | $0.4562 |
| claude-opus-5-5 — check | 38 | 78935 | 2532 | $0.3664 |
| claude-opus-5-5 — tags | 86 | 570542 | 60579 | $3.4937 |
| claude-fable-5-1 — ask-after | 10 | 40 | 7185 | $0.4335 |
| claude-opus-5-5 — ask-after | 10 | 40 | 8475 | $0.2144 |
| claude-haiku-5-5 — ask-tags | 40 | 45972 | 7249 | $0.0082 |
| claude-opus-5-5 — ask-tags | 4 | 4879 | 577 | $0.0311 |

## Every call

| Run | # | Purpose | Model | Input | Output | Cost | Seconds | Error |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-24 06:26 | 1 | subject arm 2 sonnet–sonnet #1 A m1 | claude-sonnet-5-5 | 59 | 299 | $0.00311 | 3.9 |  |
| 2026-10-24 06:26 | 2 | check arm 2 sonnet–sonnet #1 m1 | claude-haiku-5-5 | 625 | 64 | $0.00009 | 0.8 |  |
| 2026-10-24 06:26 | 3 | subject arm 2 opus–opus #1 A m1 | claude-opus-5-5 | 59 | 460 | $0.00944 | 7.1 |  |
| 2026-10-24 06:26 | 4 | check arm 2 opus–opus #1 m1 | claude-haiku-5-5 | 761 | 56 | $0.00010 | 0.7 |  |
| 2026-10-24 06:26 | 5 | subject arm 2 sonnet–sonnet #1 B m2 | claude-sonnet-5-5 | 356 | 141 | $0.00212 | 2.3 |  |
| 2026-10-24 06:26 | 6 | subject arm 2 fable–fable #1 A m1 | claude-fable-5-1 | 59 | 447 | $0.02294 | 9.8 |  |
| 2026-10-24 06:26 | 7 | check arm 2 sonnet–sonnet #1 m2 | claude-haiku-5-5 | 755 | 69 | $0.00011 | 0.8 |  |
| 2026-10-24 06:26 | 8 | check arm 2 fable–fable #1 m1 | claude-haiku-5-5 | 687 | 65 | $0.00010 | 1.5 |  |
| 2026-10-24 06:26 | 9 | subject arm 2 sonnet–sonnet #1 A m3 | claude-sonnet-5-5 | 499 | 158 | $0.00258 | 2.5 |  |
| 2026-10-24 06:26 | 10 | check arm 2 sonnet–sonnet #1 m3 | claude-haiku-5-5 | 614 | 60 | $0.00009 | 1.2 |  |
| 2026-10-24 06:26 | 11 | subject arm 2 sonnet–sonnet #1 B m4 | claude-sonnet-5-5 | 4 | 193 | $0.00357 | 3.1 |  |
| 2026-10-24 06:26 | 12 | check arm 2 sonnet–sonnet #1 m4 | claude-haiku-5-5 | 666 | 78 | $0.00011 | 0.8 |  |
| 2026-10-24 06:26 | 13 | subject arm 2 opus–opus #1 B m2 | claude-opus-5-5 | 492 | 1122 | $0.02441 | 15.6 |  |
| 2026-10-24 06:26 | 14 | subject arm 2 sonnet–sonnet #1 A m5 | claude-sonnet-5-5 | 4 | 175 | $0.00387 | 2.5 |  |
| 2026-10-24 06:26 | 15 | check arm 2 opus–opus #1 m2 | claude-haiku-5-5 | 1571 | 72 | $0.00019 | 0.8 |  |
| 2026-10-24 06:26 | 16 | check arm 2 sonnet–sonnet #1 m5 | claude-haiku-5-5 | 683 | 65 | $0.00010 | 0.8 |  |
| 2026-10-24 06:26 | 17 | subject arm 2 sonnet–sonnet #1 B m6 | claude-sonnet-5-5 | 4 | 203 | $0.00309 | 2.8 |  |
| 2026-10-24 06:26 | 18 | check arm 2 sonnet–sonnet #1 m6 | claude-haiku-5-5 | 693 | 85 | $0.00011 | 0.8 |  |
| 2026-10-24 06:26 | 19 | subject arm 2 sonnet–sonnet #1 A m7 | claude-sonnet-5-5 | 4 | 193 | $0.00305 | 3.7 |  |
| 2026-10-24 06:26 | 20 | check arm 2 sonnet–sonnet #1 m7 | claude-haiku-5-5 | 711 | 72 | $0.00011 | 0.9 |  |
| 2026-10-24 06:26 | 21 | subject arm 2 fable–fable #1 B m2 | claude-fable-5-1 | 418 | 1432 | $0.07578 | 27.4 |  |
| 2026-10-24 06:26 | 22 | check arm 2 fable–fable #1 m2 | claude-haiku-5-5 | 1692 | 83 | $0.00021 | 0.8 |  |
| 2026-10-24 06:26 | 23 | subject arm 2 sonnet–sonnet #1 B m8 | claude-sonnet-5-5 | 4 | 168 | $0.00288 | 2.4 |  |
| 2026-10-24 06:26 | 24 | check arm 2 sonnet–sonnet #1 m8 | claude-haiku-5-5 | 676 | 73 | $0.00010 | 0.8 |  |
| 2026-10-24 06:26 | 25 | subject arm 2 sonnet–sonnet #1 A m9 | claude-sonnet-5-5 | 4 | 190 | $0.00306 | 2.7 |  |
| 2026-10-24 06:26 | 26 | check arm 2 sonnet–sonnet #1 m9 | claude-haiku-5-5 | 673 | 70 | $0.00010 | 1 |  |
| 2026-10-24 06:26 | 27 | subject arm 2 sonnet–sonnet #1 B m10 | claude-sonnet-5-5 | 4 | 194 | $0.00313 | 2.6 |  |
| 2026-10-24 06:26 | 28 | check arm 2 sonnet–sonnet #1 m10 | claude-haiku-5-5 | 699 | 75 | $0.00011 | 0.7 |  |
| 2026-10-24 06:26 | 29 | subject arm 2 opus–opus #1 A m3 | claude-opus-5-5 | 4 | 2461 | $0.05579 | 30.6 |  |
| 2026-10-24 06:26 | 30 | check arm 2 opus–opus #1 m3 | claude-haiku-5-5 | 2334 | 69 | $0.00027 | 0.8 |  |
| 2026-10-24 06:26 | 31 | subject arm 2 sonnet–sonnet #1 A m11 | claude-sonnet-5-5 | 4 | 202 | $0.00331 | 2.5 |  |
| 2026-10-24 06:26 | 32 | check arm 2 sonnet–sonnet #1 m11 | claude-haiku-5-5 | 711 | 73 | $0.00011 | 0.8 |  |
| 2026-10-24 06:26 | 33 | subject arm 2 sonnet–sonnet #1 B m12 | claude-sonnet-5-5 | 4 | 260 | $0.00395 | 3.2 |  |
| 2026-10-24 06:26 | 34 | check arm 2 sonnet–sonnet #1 m12 | claude-haiku-5-5 | 777 | 73 | $0.00011 | 0.8 |  |
| 2026-10-24 06:26 | 35 | subject arm 2 fable–fable #1 A m3 | claude-fable-5-1 | 4 | 1607 | $0.09829 | 30.3 |  |
| 2026-10-24 06:26 | 36 | subject arm 2 sonnet–sonnet #1 A m13 | claude-sonnet-5-5 | 4 | 278 | $0.00434 | 3.4 |  |
| 2026-10-24 06:26 | 37 | check arm 2 fable–fable #1 m3 | claude-haiku-5-5 | 2287 | 71 | $0.00026 | 0.7 |  |
| 2026-10-24 06:26 | 38 | check arm 2 sonnet–sonnet #1 m13 | claude-haiku-5-5 | 853 | 74 | $0.00012 | 1 |  |
| 2026-10-24 06:26 | 39 | subject arm 2 sonnet–sonnet #1 B m14 | claude-sonnet-5-5 | 4 | 254 | $0.00433 | 3.6 |  |
| 2026-10-24 06:26 | 40 | check arm 2 sonnet–sonnet #1 m14 | claude-haiku-5-5 | 847 | 84 | $0.00013 | 1 |  |
| 2026-10-24 06:26 | 41 | subject arm 2 sonnet–sonnet #1 A m15 | claude-sonnet-5-5 | 4 | 224 | $0.00406 | 5 |  |
| 2026-10-24 06:26 | 42 | check arm 2 sonnet–sonnet #1 m15 | claude-haiku-5-5 | 793 | 71 | $0.00011 | 0.7 |  |
| 2026-10-24 06:26 | 43 | subject arm 2 sonnet–sonnet #1 B m16 | claude-sonnet-5-5 | 4 | 230 | $0.00404 | 3.1 |  |
| 2026-10-24 06:26 | 44 | check arm 2 sonnet–sonnet #1 m16 | claude-haiku-5-5 | 769 | 83 | $0.00012 | 3.4 |  |
| 2026-10-24 06:26 | 45 | subject arm 2 fable–fable #1 B m4 | claude-fable-5-1 | 4 | 1157 | $0.08772 | 23.3 |  |
| 2026-10-24 06:26 | 46 | subject arm 2 sonnet–sonnet #1 A m17 | claude-sonnet-5-5 | 4 | 185 | $0.00359 | 2.8 |  |
| 2026-10-24 06:26 | 47 | check arm 2 fable–fable #1 m4 | claude-haiku-5-5 | 2308 | 84 | $0.00027 | 0.9 |  |
| 2026-10-24 06:26 | 48 | check arm 2 sonnet–sonnet #1 m17 | claude-haiku-5-5 | 730 | 97 | $0.00012 | 1 |  |
| 2026-10-24 06:26 | 49 | subject arm 2 sonnet–sonnet #1 B m18 | claude-sonnet-5-5 | 4 | 237 | $0.00405 | 3.1 |  |
| 2026-10-24 06:26 | 50 | check arm 2 sonnet–sonnet #1 m18 | claude-haiku-5-5 | 737 | 69 | $0.00011 | 0.9 |  |
| 2026-10-24 06:26 | 51 | subject arm 2 opus–opus #1 B m4 | claude-opus-5-5 | 4 | 3937 | $0.09129 | 47.1 |  |
| 2026-10-24 06:26 | 52 | check arm 2 opus–opus #1 m4 | claude-haiku-5-5 | 2968 | 82 | $0.00034 | 1 |  |
| 2026-10-24 06:26 | 53 | subject arm 2 sonnet–sonnet #1 A m19 | claude-sonnet-5-5 | 4 | 235 | $0.00410 | 3.7 |  |
| 2026-10-24 06:26 | 54 | check arm 2 sonnet–sonnet #1 m19 | claude-haiku-5-5 | 787 | 63 | $0.00011 | 0.8 |  |
| 2026-10-24 06:26 | 55 | subject arm 2 sonnet–sonnet #1 B m20 | claude-sonnet-5-5 | 4 | 217 | $0.00408 | 3.2 |  |
| 2026-10-24 06:26 | 56 | check arm 2 sonnet–sonnet #1 m20 | claude-haiku-5-5 | 767 | 58 | $0.00011 | 0.8 |  |
| 2026-10-24 06:26 | 57 | subject arm 2 sonnet–sonnet #1 A m21 | claude-sonnet-5-5 | 4 | 267 | $0.00458 | 3.7 |  |
| 2026-10-24 06:26 | 58 | check arm 2 sonnet–sonnet #1 m21 | claude-haiku-5-5 | 799 | 81 | $0.00012 | 0.9 |  |
| 2026-10-24 06:26 | 59 | subject arm 2 sonnet–sonnet #1 B m22 | claude-sonnet-5-5 | 4 | 285 | $0.00488 | 3.6 |  |
| 2026-10-24 06:26 | 60 | check arm 2 sonnet–sonnet #1 m22 | claude-haiku-5-5 | 867 | 63 | $0.00012 | 1.4 |  |
| 2026-10-24 06:26 | 61 | subject arm 2 sonnet–sonnet #1 A m23 | claude-sonnet-5-5 | 4 | 235 | $0.00460 | 3.6 |  |
| 2026-10-24 06:26 | 62 | check arm 2 sonnet–sonnet #1 m23 | claude-haiku-5-5 | 835 | 100 | $0.00013 | 1 |  |
| 2026-10-24 06:26 | 63 | subject arm 2 fable–fable #1 A m5 | claude-fable-5-1 | 4 | 2034 | $0.12701 | 39.1 |  |
| 2026-10-24 06:26 | 64 | check arm 2 fable–fable #1 m5 | claude-haiku-5-5 | 2300 | 82 | $0.00027 | 0.8 |  |
| 2026-10-24 06:26 | 65 | subject arm 2 sonnet–sonnet #1 B m24 | claude-sonnet-5-5 | 4 | 258 | $0.00480 | 3.3 |  |
| 2026-10-24 06:26 | 66 | check arm 2 sonnet–sonnet #1 m24 | claude-haiku-5-5 | 808 | 76 | $0.00012 | 0.9 |  |
| 2026-10-24 06:26 | 67 | subject arm 2 opus–opus #1 A m5 | claude-opus-5-5 | 4 | 3215 | $0.07784 | 39.7 |  |
| 2026-10-24 06:26 | 68 | subject arm 2 sonnet–sonnet #1 A m25 | claude-sonnet-5-5 | 4 | 242 | $0.00463 | 3.7 |  |
| 2026-10-24 06:26 | 69 | check arm 2 opus–opus #1 m5 | claude-haiku-5-5 | 3154 | 66 | $0.00035 | 1.3 |  |
| 2026-10-24 06:26 | 70 | check arm 2 sonnet–sonnet #1 m25 | claude-haiku-5-5 | 815 | 72 | $0.00012 | 1.4 |  |
| 2026-10-24 06:26 | 71 | subject arm 2 sonnet–sonnet #1 B m26 | claude-sonnet-5-5 | 4 | 236 | $0.00463 | 3.3 |  |
| 2026-10-24 06:26 | 72 | check arm 2 sonnet–sonnet #1 m26 | claude-haiku-5-5 | 793 | 79 | $0.00012 | 0.8 |  |
| 2026-10-24 06:26 | 73 | subject arm 2 sonnet–sonnet #1 A m27 | claude-sonnet-5-5 | 4 | 228 | $0.00455 | 3.4 |  |
| 2026-10-24 06:26 | 74 | check arm 2 sonnet–sonnet #1 m27 | claude-haiku-5-5 | 778 | 66 | $0.00011 | 1.3 |  |
| 2026-10-24 06:26 | 75 | tags 2 arm 2 sonnet–sonnet #1 m1–10 | claude-haiku-5-5 | 2943 | 680 | $0.00063 | 2.2 |  |
| 2026-10-24 06:26 | 76 | tags 1 arm 2 sonnet–sonnet #1 m1–10 | claude-haiku-5-5 | 2943 | 680 | $0.00063 | 2.2 |  |
| 2026-10-24 06:26 | 77 | tags 1 arm 2 sonnet–sonnet #1 m11–20 | claude-haiku-5-5 | 3571 | 680 | $0.00070 | 3.5 |  |
| 2026-10-24 06:26 | 78 | tags 1 arm 2 sonnet–sonnet #1 m21–27 | claude-haiku-5-5 | 2974 | 479 | $0.00054 | 1.7 |  |
| 2026-10-24 06:26 | 79 | tags 2 arm 2 sonnet–sonnet #1 m11–20 | claude-haiku-5-5 | 3571 | 680 | $0.00070 | 2.7 |  |
| 2026-10-24 06:26 | 80 | tags 2 arm 2 sonnet–sonnet #1 m21–27 | claude-haiku-5-5 | 2974 | 479 | $0.00054 | 1.7 |  |
| 2026-10-24 06:26 | 81 | subject arm 1 fable–fable #1 A m1 | claude-fable-5-1 | 40 | 518 | $0.02630 | 10.4 |  |
| 2026-10-24 06:26 | 82 | check arm 1 fable–fable #1 m1 | claude-haiku-5-5 | 742 | 60 | $0.00010 | 1.2 |  |
| 2026-10-24 06:26 | 83 | subject arm 2 fable–fable #1 B m6 | claude-fable-5-1 | 4 | 1964 | $0.12365 | 38.4 |  |
| 2026-10-24 06:26 | 84 | check arm 2 fable–fable #1 m6 | claude-haiku-5-5 | 2196 | 71 | $0.00026 | 1.3 |  |
| 2026-10-24 06:26 | 85 | subject arm 2 opus–opus #1 B m6 | claude-opus-5-5 | 4 | 3371 | $0.08213 | 42.8 |  |
| 2026-10-24 06:26 | 86 | check arm 2 opus–opus #1 m6 | claude-haiku-5-5 | 3068 | 71 | $0.00034 | 0.8 |  |
| 2026-10-24 06:26 | 87 | subject arm 1 fable–fable #1 B m2 | claude-fable-5-1 | 454 | 972 | $0.05314 | 21.4 |  |
| 2026-10-24 06:26 | 88 | check arm 1 fable–fable #1 m2 | claude-haiku-5-5 | 1558 | 72 | $0.00019 | 0.6 |  |
| 2026-10-24 06:26 | 89 | subject arm 2 fable–fable #1 A m7 | claude-fable-5-1 | 4 | 1496 | $0.09921 | 26.8 |  |
| 2026-10-24 06:26 | 90 | check arm 2 fable–fable #1 m7 | claude-haiku-5-5 | 2051 | 85 | $0.00025 | 0.8 |  |
| 2026-10-24 06:26 | 91 | subject arm 2 fable–fable #1 B m8 | claude-fable-5-1 | 4 | 803 | $0.06298 | 16.1 |  |
| 2026-10-24 06:26 | 92 | subject arm 2 opus–opus #1 A m7 | claude-opus-5-5 | 4 | 2531 | $0.06519 | 31.9 |  |
| 2026-10-24 06:26 | 93 | check arm 2 fable–fable #1 m8 | claude-haiku-5-5 | 1676 | 88 | $0.00021 | 0.8 |  |
| 2026-10-24 06:26 | 94 | check arm 2 opus–opus #1 m7 | claude-haiku-5-5 | 3053 | 88 | $0.00035 | 1.2 |  |
| 2026-10-24 06:26 | 95 | tags 1 arm 2 fable–fable #1 m1–8 | claude-haiku-5-5 | 7609 | 546 | $0.00103 | 2 |  |
| 2026-10-24 06:26 | 96 | tags 2 arm 2 fable–fable #1 m1–8 | claude-haiku-5-5 | 7609 | 546 | $0.00103 | 2.1 |  |
| 2026-10-24 06:26 | 97 | subject arm 1 sonnet–sonnet #1 A m1 | claude-sonnet-5-5 | 40 | 497 | $0.00505 | 5.6 |  |
| 2026-10-24 06:26 | 98 | check arm 1 sonnet–sonnet #1 m1 | claude-haiku-5-5 | 717 | 65 | $0.00010 | 0.8 |  |
| 2026-10-24 06:26 | 99 | subject arm 1 sonnet–sonnet #1 B m2 | claude-sonnet-5-5 | 429 | 411 | $0.00497 | 5 |  |
| 2026-10-24 06:26 | 100 | check arm 1 sonnet–sonnet #1 m2 | claude-haiku-5-5 | 1117 | 69 | $0.00015 | 1.1 |  |
| 2026-10-24 06:26 | 101 | subject arm 1 sonnet–sonnet #1 A m3 | claude-sonnet-5-5 | 4 | 1086 | $0.01296 | 10.9 |  |
| 2026-10-24 06:26 | 102 | subject arm 1 fable–fable #1 A m3 | claude-fable-5-1 | 4 | 2983 | $0.16518 | 57 |  |
| 2026-10-24 06:26 | 103 | check arm 1 fable–fable #1 m3 | claude-haiku-5-5 | 2900 | 75 | $0.00033 | 0.8 |  |
| 2026-10-24 06:26 | 104 | check arm 1 sonnet–sonnet #1 m3 | claude-haiku-5-5 | 1211 | 78 | $0.00016 | 1.3 |  |
| 2026-10-24 06:26 | 105 | subject arm 2 opus–opus #1 B m8 | claude-opus-5-5 | 4 | 2550 | $0.06578 | 33.5 |  |
| 2026-10-24 06:26 | 106 | check arm 2 opus–opus #1 m8 | claude-haiku-5-5 | 3356 | 79 | $0.00038 | 1.1 |  |
| 2026-10-24 06:26 | 107 | subject arm 1 sonnet–sonnet #1 B m4 | claude-sonnet-5-5 | 4 | 1089 | $0.01420 | 11.2 |  |
| 2026-10-24 06:26 | 108 | check arm 1 sonnet–sonnet #1 m4 | claude-haiku-5-5 | 1265 | 71 | $0.00016 | 1 |  |
| 2026-10-24 06:26 | 109 | subject arm 1 sonnet–sonnet #1 A m5 | claude-sonnet-5-5 | 4 | 598 | $0.00853 | 7.6 |  |
| 2026-10-24 06:26 | 110 | check arm 1 sonnet–sonnet #1 m5 | claude-haiku-5-5 | 1378 | 79 | $0.00018 | 1.1 |  |
| 2026-10-24 06:26 | 111 | subject arm 1 sonnet–sonnet #1 B m6 | claude-sonnet-5-5 | 4 | 571 | $0.00864 | 6.2 |  |
| 2026-10-24 06:26 | 112 | check arm 1 sonnet–sonnet #1 m6 | claude-haiku-5-5 | 1484 | 84 | $0.00019 | 0.7 |  |
| 2026-10-24 06:26 | 113 | subject arm 1 sonnet–sonnet #1 A m7 | claude-sonnet-5-5 | 4 | 738 | $0.01067 | 7.5 |  |
| 2026-10-24 06:26 | 114 | subject arm 1 fable–fable #1 B m4 | claude-fable-5-1 | 4 | 2051 | $0.14053 | 41.9 |  |
| 2026-10-24 06:26 | 115 | check arm 1 sonnet–sonnet #1 m7 | claude-haiku-5-5 | 1624 | 83 | $0.00020 | 1 |  |
| 2026-10-24 06:26 | 116 | check arm 1 fable–fable #1 m4 | claude-haiku-5-5 | 3347 | 76 | $0.00037 | 0.8 |  |
| 2026-10-24 06:26 | 117 | subject arm 1 sonnet–sonnet #1 B m8 | claude-sonnet-5-5 | 4 | 689 | $0.01065 | 7.2 |  |
| 2026-10-24 06:26 | 118 | check arm 1 sonnet–sonnet #1 m8 | claude-haiku-5-5 | 1742 | 80 | $0.00021 | 0.9 |  |
| 2026-10-24 06:26 | 119 | subject arm 2 opus–opus #1 A m9 | claude-opus-5-5 | 4 | 4020 | $0.09696 | 50.9 |  |
| 2026-10-24 06:26 | 120 | check arm 2 opus–opus #1 m9 | claude-haiku-5-5 | 3429 | 85 | $0.00039 | 1.2 |  |
| 2026-10-24 06:26 | 121 | subject arm 1 sonnet–sonnet #1 A m9 | claude-sonnet-5-5 | 4 | 648 | $0.01065 | 6.6 |  |
| 2026-10-24 06:26 | 122 | check arm 1 sonnet–sonnet #1 m9 | claude-haiku-5-5 | 1652 | 77 | $0.00020 | 1.5 |  |
| 2026-10-24 06:26 | 123 | subject arm 1 sonnet–sonnet #1 B m10 | claude-sonnet-5-5 | 4 | 713 | $0.01122 | 7.2 |  |
| 2026-10-24 06:26 | 124 | check arm 1 sonnet–sonnet #1 m10 | claude-haiku-5-5 | 1676 | 75 | $0.00021 | 0.9 |  |
| 2026-10-24 06:26 | 125 | subject arm 1 sonnet–sonnet #1 A m11 | claude-sonnet-5-5 | 4 | 714 | $0.01143 | 7.4 |  |
| 2026-10-24 06:26 | 126 | check arm 1 sonnet–sonnet #1 m11 | claude-haiku-5-5 | 1742 | 88 | $0.00022 | 0.9 |  |
| 2026-10-24 06:26 | 127 | subject arm 1 fable–fable #1 A m5 | claude-fable-5-1 | 4 | 2051 | $0.14081 | 39.3 |  |
| 2026-10-24 06:26 | 128 | check arm 1 fable–fable #1 m5 | claude-haiku-5-5 | 2756 | 76 | $0.00031 | 1.1 |  |
| 2026-10-24 06:26 | 129 | subject arm 1 sonnet–sonnet #1 B m12 | claude-sonnet-5-5 | 4 | 671 | $0.01129 | 7.1 |  |
| 2026-10-24 06:26 | 130 | check arm 1 sonnet–sonnet #1 m12 | claude-haiku-5-5 | 1700 | 71 | $0.00021 | 0.9 |  |
| 2026-10-24 06:26 | 131 | subject arm 2 opus–opus #1 B m10 | claude-opus-5-5 | 4 | 2523 | $0.06766 | 33.7 |  |
| 2026-10-24 06:26 | 132 | check arm 2 opus–opus #1 m10 | claude-haiku-5-5 | 3273 | 74 | $0.00036 | 1.3 |  |
| 2026-10-24 06:26 | 133 | subject arm 1 sonnet–sonnet #1 A m13 | claude-sonnet-5-5 | 4 | 796 | $0.01258 | 8.5 |  |
| 2026-10-24 06:26 | 134 | check arm 1 sonnet–sonnet #1 m13 | claude-haiku-5-5 | 1782 | 77 | $0.00022 | 0.8 |  |
| 2026-10-24 06:26 | 135 | subject arm 1 sonnet–sonnet #1 B m14 | claude-sonnet-5-5 | 4 | 778 | $0.01275 | 8.1 |  |
| 2026-10-24 06:26 | 136 | check arm 1 sonnet–sonnet #1 m14 | claude-haiku-5-5 | 1889 | 76 | $0.00023 | 1.1 |  |
| 2026-10-24 06:26 | 137 | subject arm 1 fable–fable #1 B m6 | claude-fable-5-1 | 4 | 1363 | $0.09946 | 29.2 |  |
| 2026-10-24 06:26 | 138 | check arm 1 fable–fable #1 m6 | claude-haiku-5-5 | 2748 | 69 | $0.00031 | 0.7 |  |
| 2026-10-24 06:26 | 139 | subject arm 2 opus–opus #1 A m11 | claude-opus-5-5 | 4 | 2068 | $0.05812 | 27.2 |  |
| 2026-10-24 06:26 | 140 | subject arm 1 sonnet–sonnet #1 A m15 | claude-sonnet-5-5 | 4 | 716 | $0.01253 | 7.6 |  |
| 2026-10-24 06:26 | 141 | check arm 1 sonnet–sonnet #1 m15 | claude-haiku-5-5 | 1809 | 84 | $0.00022 | 0.8 |  |
| 2026-10-24 06:26 | 142 | check arm 2 opus–opus #1 m11 | claude-haiku-5-5 | 2960 | 81 | $0.00034 | 1.7 |  |
| 2026-10-24 06:26 | 143 | subject arm 1 sonnet–sonnet #1 B m16 | claude-sonnet-5-5 | 4 | 1530 | $0.02063 | 14.7 |  |
| 2026-10-24 06:26 | 144 | check arm 1 sonnet–sonnet #1 m16 | claude-haiku-5-5 | 1709 | 74 | $0.00021 | 0.8 |  |
| 2026-10-24 06:26 | 145 | subject arm 1 fable–fable #1 A m7 | claude-fable-5-1 | 4 | 1650 | $0.11403 | 32.3 |  |
| 2026-10-24 06:26 | 146 | check arm 1 fable–fable #1 m7 | claude-haiku-5-5 | 2580 | 65 | $0.00029 | 0.6 |  |
| 2026-10-24 06:26 | 147 | subject arm 2 opus–opus #1 B m12 | claude-opus-5-5 | 4 | 2088 | $0.05724 | 26.3 |  |
| 2026-10-24 06:26 | 148 | subject arm 1 sonnet–sonnet #1 A m17 | claude-sonnet-5-5 | 4 | 759 | $0.01282 | 7.9 |  |
| 2026-10-24 06:26 | 149 | check arm 1 sonnet–sonnet #1 m17 | claude-haiku-5-5 | 1752 | 78 | $0.00021 | 0.7 |  |
| 2026-10-24 06:26 | 150 | check arm 2 opus–opus #1 m12 | claude-haiku-5-5 | 2543 | 71 | $0.00029 | 1.2 |  |
| 2026-10-24 06:26 | 151 | subject arm 1 sonnet–sonnet #1 B m18 | claude-sonnet-5-5 | 4 | 1356 | $0.01904 | 13.7 |  |
| 2026-10-24 06:26 | 152 | check arm 1 sonnet–sonnet #1 m18 | claude-haiku-5-5 | 1609 | 70 | $0.00020 | 0.7 |  |
| 2026-10-24 06:26 | 153 | subject arm 2 opus–opus #1 A m13 | claude-opus-5-5 | 4 | 1993 | $0.05356 | 24.6 |  |
| 2026-10-24 06:26 | 154 | check arm 2 opus–opus #1 m13 | claude-haiku-5-5 | 2573 | 71 | $0.00029 | 0.9 |  |
| 2026-10-24 06:26 | 155 | subject arm 1 sonnet–sonnet #1 A m19 | claude-sonnet-5-5 | 4 | 739 | $0.01265 | 8.7 |  |
| 2026-10-24 06:26 | 156 | check arm 1 sonnet–sonnet #1 m19 | claude-haiku-5-5 | 1589 | 88 | $0.00020 | 0.8 |  |
| 2026-10-24 06:26 | 157 | subject arm 1 sonnet–sonnet #1 B m20 | claude-sonnet-5-5 | 4 | 694 | $0.01230 | 7.5 |  |
| 2026-10-24 06:26 | 158 | check arm 1 sonnet–sonnet #1 m20 | claude-haiku-5-5 | 1748 | 82 | $0.00022 | 0.9 |  |
| 2026-10-24 06:26 | 159 | subject arm 1 fable–fable #1 B m8 | claude-fable-5-1 | 4 | 2411 | $0.15027 | 46.2 |  |
| 2026-10-24 06:26 | 160 | check arm 1 fable–fable #1 m8 | claude-haiku-5-5 | 2735 | 69 | $0.00031 | 1 |  |
| 2026-10-24 06:26 | 161 | subject arm 1 sonnet–sonnet #1 A m21 | claude-sonnet-5-5 | 4 | 866 | $0.01453 | 9.1 |  |
| 2026-10-24 06:26 | 162 | check arm 1 sonnet–sonnet #1 m21 | claude-haiku-5-5 | 1875 | 76 | $0.00023 | 1.1 |  |
| 2026-10-24 06:26 | 163 | subject arm 2 opus–opus #1 B m14 | claude-opus-5-5 | 4 | 2448 | $0.06303 | 30 |  |
| 2026-10-24 06:26 | 164 | subject arm 1 sonnet–sonnet #1 B m22 | claude-sonnet-5-5 | 4 | 577 | $0.01210 | 6.4 |  |
| 2026-10-24 06:26 | 165 | check arm 1 sonnet–sonnet #1 m22 | claude-haiku-5-5 | 1758 | 85 | $0.00022 | 1.1 |  |
| 2026-10-24 06:26 | 166 | check arm 2 opus–opus #1 m14 | claude-haiku-5-5 | 2756 | 73 | $0.00031 | 1.7 |  |
| 2026-10-24 06:26 | 167 | subject arm 1 sonnet–sonnet #1 A m23 | claude-sonnet-5-5 | 4 | 992 | $0.01610 | 9.9 |  |
| 2026-10-24 06:26 | 168 | check arm 1 sonnet–sonnet #1 m23 | claude-haiku-5-5 | 1884 | 74 | $0.00023 | 1.5 |  |
| 2026-10-24 06:26 | 169 | subject arm 2 opus–opus #1 A m15 | claude-opus-5-5 | 4 | 1249 | $0.04019 | 16.4 |  |
| 2026-10-24 06:26 | 170 | check arm 2 opus–opus #1 m15 | claude-haiku-5-5 | 2195 | 90 | $0.00026 | 1.2 |  |
| 2026-10-24 06:26 | 171 | subject arm 1 sonnet–sonnet #1 B m24 | claude-sonnet-5-5 | 4 | 671 | $0.01338 | 7.1 |  |
| 2026-10-24 06:26 | 172 | check arm 1 sonnet–sonnet #1 m24 | claude-haiku-5-5 | 1978 | 74 | $0.00023 | 0.9 |  |
| 2026-10-24 06:26 | 173 | subject arm 2 opus–opus #1 B m16 | claude-opus-5-5 | 4 | 361 | $0.01986 | 6.1 |  |
| 2026-10-24 06:26 | 174 | tags 1 arm 2 opus–opus #1 m11–15 | claude-haiku-5-5 | 7758 | 345 | $0.00095 | 1.6 |  |
| 2026-10-24 06:26 | 175 | subject arm 1 fable–fable #1 A m9 | claude-fable-5-1 | 4 | 2103 | $0.13713 | 40.5 |  |
| 2026-10-24 06:26 | 176 | tags 2 arm 2 opus–opus #1 m1–10 | claude-haiku-5-5 | 13690 | 680 | $0.00171 | 2.4 |  |
| 2026-10-24 06:26 | 177 | tags 1 arm 2 opus–opus #1 m1–10 | claude-haiku-5-5 | 13690 | 680 | $0.00171 | 2.4 |  |
| 2026-10-24 06:26 | 178 | check arm 1 fable–fable #1 m9 | claude-haiku-5-5 | 2989 | 82 | $0.00034 | 0.8 |  |
| 2026-10-24 06:26 | 179 | tags 2 arm 2 opus–opus #1 m11–15 | claude-haiku-5-5 | 7758 | 345 | $0.00095 | 1.7 |  |
| 2026-10-24 06:26 | 180 | subject arm 1 sonnet–sonnet #1 A m25 | claude-sonnet-5-5 | 4 | 836 | $0.01538 | 9.1 |  |
| 2026-10-24 06:26 | 181 | check arm 1 sonnet–sonnet #1 m25 | claude-haiku-5-5 | 1822 | 76 | $0.00022 | 1.3 |  |
| 2026-10-24 06:26 | 182 | subject arm 1 opus–opus #1 A m1 | claude-opus-5-5 | 40 | 575 | $0.01166 | 7.7 |  |
| 2026-10-24 06:26 | 183 | check arm 1 opus–opus #1 m1 | claude-haiku-5-5 | 840 | 63 | $0.00012 | 0.7 |  |
| 2026-10-24 06:26 | 184 | subject arm 1 sonnet–sonnet #1 B m26 | claude-sonnet-5-5 | 4 | 796 | $0.01479 | 8 |  |
| 2026-10-24 06:26 | 185 | check arm 1 sonnet–sonnet #1 m26 | claude-haiku-5-5 | 1947 | 73 | $0.00023 | 0.8 |  |
| 2026-10-24 06:26 | 186 | subject arm 1 sonnet–sonnet #1 A m27 | claude-sonnet-5-5 | 4 | 756 | $0.01483 | 8.1 |  |
| 2026-10-24 06:26 | 187 | check arm 1 sonnet–sonnet #1 m27 | claude-haiku-5-5 | 1867 | 73 | $0.00022 | 1 |  |
| 2026-10-24 06:26 | 188 | subject arm 1 opus–opus #1 B m2 | claude-opus-5-5 | 4 | 1302 | $0.02880 | 17.7 |  |
| 2026-10-24 06:26 | 189 | check arm 1 opus–opus #1 m2 | claude-haiku-5-5 | 1696 | 71 | $0.00021 | 0.8 |  |
| 2026-10-24 06:26 | 190 | subject arm 1 sonnet–sonnet #1 B m28 | claude-sonnet-5-5 | 4 | 1390 | $0.02114 | 13.6 |  |
| 2026-10-24 06:26 | 191 | check arm 1 sonnet–sonnet #1 m28 | claude-haiku-5-5 | 1753 | 78 | $0.00021 | 2.4 |  |
| 2026-10-24 06:26 | 192 | subject arm 1 fable–fable #1 B m10 | claude-fable-5-1 | 4 | 2695 | $0.17015 | 48.8 |  |
| 2026-10-24 06:26 | 193 | check arm 1 fable–fable #1 m10 | claude-haiku-5-5 | 2939 | 79 | $0.00033 | 1.6 |  |
| 2026-10-24 06:26 | 194 | subject arm 1 sonnet–sonnet #1 A m29 | claude-sonnet-5-5 | 4 | 963 | $0.01675 | 9.9 |  |
| 2026-10-24 06:26 | 195 | subject arm 1 opus–opus #1 A m3 | claude-opus-5-5 | 4 | 2030 | $0.04770 | 25.7 |  |
| 2026-10-24 06:26 | 196 | check arm 1 opus–opus #1 m3 | claude-haiku-5-5 | 2345 | 62 | $0.00027 | 0.7 |  |
| 2026-10-24 06:26 | 197 | check arm 1 sonnet–sonnet #1 m29 | claude-haiku-5-5 | 1960 | 84 | $0.00024 | 2.6 |  |
| 2026-10-24 06:26 | 198 | subject arm 1 sonnet–sonnet #1 B m30 | claude-sonnet-5-5 | 4 | 791 | $0.01569 | 8.4 |  |
| 2026-10-24 06:26 | 199 | check arm 1 sonnet–sonnet #1 m30 | claude-haiku-5-5 | 2069 | 70 | $0.00024 | 2.8 |  |
| 2026-10-24 06:26 | 200 | subject arm 1 sonnet–sonnet #1 A m31 | claude-sonnet-5-5 | 4 | 814 | $0.01633 | 8.8 |  |
| 2026-10-24 06:26 | 201 | check arm 1 sonnet–sonnet #1 m31 | claude-haiku-5-5 | 1920 | 82 | $0.00023 | 1.2 |  |
| 2026-10-24 06:26 | 202 | subject arm 1 opus–opus #1 B m4 | claude-opus-5-5 | 4 | 1571 | $0.04170 | 25.2 |  |
| 2026-10-24 06:26 | 203 | check arm 1 opus–opus #1 m4 | claude-haiku-5-5 | 2592 | 65 | $0.00029 | 0.9 |  |
| 2026-10-24 06:26 | 204 | subject arm 1 fable–fable #1 A m11 | claude-fable-5-1 | 4 | 1728 | $0.12153 | 33.2 |  |
| 2026-10-24 06:26 | 205 | check arm 1 fable–fable #1 m11 | claude-haiku-5-5 | 2623 | 92 | $0.00031 | 1 |  |
| 2026-10-24 06:26 | 206 | subject arm 1 sonnet–sonnet #1 B m32 | claude-sonnet-5-5 | 4 | 796 | $0.01597 | 8.4 |  |
| 2026-10-24 06:26 | 207 | check arm 1 sonnet–sonnet #1 m32 | claude-haiku-5-5 | 1925 | 85 | $0.00023 | 1.2 |  |
| 2026-10-24 06:26 | 208 | subject arm 1 sonnet–sonnet #1 A m33 | claude-sonnet-5-5 | 4 | 906 | $0.01724 | 9.6 |  |
| 2026-10-24 06:26 | 209 | check arm 1 sonnet–sonnet #1 m33 | claude-haiku-5-5 | 2017 | 76 | $0.00024 | 0.9 |  |
| 2026-10-24 06:26 | 210 | subject arm 1 fable–fable #1 B m12 | claude-fable-5-1 | 4 | 1303 | $0.09664 | 23.8 |  |
| 2026-10-24 06:26 | 211 | subject arm 1 sonnet–sonnet #1 B m34 | claude-sonnet-5-5 | 4 | 776 | $0.01634 | 8.5 |  |
| 2026-10-24 06:26 | 212 | check arm 1 fable–fable #1 m12 | claude-haiku-5-5 | 2000 | 86 | $0.00024 | 0.8 |  |
| 2026-10-24 06:26 | 213 | check arm 1 sonnet–sonnet #1 m34 | claude-haiku-5-5 | 1997 | 75 | $0.00024 | 0.8 |  |
| 2026-10-24 06:26 | 214 | subject arm 1 opus–opus #1 A m5 | claude-opus-5-5 | 4 | 2242 | $0.05652 | 29.6 |  |
| 2026-10-24 06:26 | 215 | check arm 1 opus–opus #1 m5 | claude-haiku-5-5 | 2816 | 73 | $0.00032 | 0.8 |  |
| 2026-10-24 06:26 | 216 | subject arm 1 sonnet–sonnet #1 A m35 | claude-sonnet-5-5 | 4 | 916 | $0.01785 | 10.5 |  |
| 2026-10-24 06:26 | 217 | check arm 1 sonnet–sonnet #1 m35 | claude-haiku-5-5 | 2007 | 77 | $0.00024 | 1.1 |  |
| 2026-10-24 06:26 | 218 | subject arm 1 fable–fable #1 A m13 | claude-fable-5-1 | 4 | 695 | $0.05880 | 13.9 |  |
| 2026-10-24 06:26 | 219 | check arm 1 fable–fable #1 m13 | claude-haiku-5-5 | 1545 | 91 | $0.00020 | 1.9 |  |
| 2026-10-24 06:26 | 220 | subject arm 1 fable–fable #1 B m14 | claude-fable-5-1 | 4 | 437 | $0.04045 | 9.3 |  |
| 2026-10-24 06:26 | 221 | check arm 1 fable–fable #1 m14 | claude-haiku-5-5 | 1025 | 87 | $0.00015 | 0.8 |  |
| 2026-10-24 06:26 | 222 | subject arm 1 sonnet–sonnet #1 B m36 | claude-sonnet-5-5 | 4 | 1377 | $0.02266 | 13.8 |  |
| 2026-10-24 06:26 | 223 | check arm 1 sonnet–sonnet #1 m36 | claude-haiku-5-5 | 2128 | 73 | $0.00025 | 1.3 |  |
| 2026-10-24 06:26 | 224 | subject arm 1 opus–opus #1 B m6 | claude-opus-5-5 | 4 | 2250 | $0.05804 | 28.2 |  |
| 2026-10-24 06:26 | 225 | check arm 1 opus–opus #1 m6 | claude-haiku-5-5 | 3076 | 67 | $0.00034 | 0.9 |  |
| 2026-10-24 06:26 | 226 | subject arm 1 fable–fable #1 A m15 | claude-fable-5-1 | 4 | 335 | $0.02903 | 7.8 |  |
| 2026-10-24 06:26 | 227 | check arm 1 fable–fable #1 m15 | claude-haiku-5-5 | 794 | 74 | $0.00012 | 0.9 |  |
| 2026-10-24 06:26 | 228 | subject arm 1 sonnet–sonnet #1 A m37 | claude-sonnet-5-5 | 4 | 863 | $0.01798 | 9.5 |  |
| 2026-10-24 06:26 | 229 | check arm 1 sonnet–sonnet #1 m37 | claude-haiku-5-5 | 2075 | 69 | $0.00024 | 0.8 |  |
| 2026-10-24 06:26 | 230 | subject arm 1 fable–fable #1 B m16 | claude-fable-5-1 | 4 | 173 | $0.01817 | 4.7 |  |
| 2026-10-24 06:26 | 231 | check arm 1 fable–fable #1 m16 | claude-haiku-5-5 | 675 | 61 | $0.00010 | 0.7 |  |
| 2026-10-24 06:26 | 232 | subject arm 1 fable–fable #1 A m17 | claude-fable-5-1 | 4 | 106 | $0.01339 | 3 |  |
| 2026-10-24 06:26 | 233 | subject arm 1 sonnet–sonnet #1 B m38 | claude-sonnet-5-5 | 4 | 723 | $0.01663 | 7.9 |  |
| 2026-10-24 06:26 | 234 | check arm 1 fable–fable #1 m17 | claude-haiku-5-5 | 452 | 66 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 235 | check arm 1 sonnet–sonnet #1 m38 | claude-haiku-5-5 | 1901 | 70 | $0.00023 | 1.3 |  |
| 2026-10-24 06:26 | 236 | subject arm 1 fable–fable #1 B m18 | claude-fable-5-1 | 4 | 84 | $0.00956 | 2.4 |  |
| 2026-10-24 06:26 | 237 | check arm 1 fable–fable #1 m18 | claude-haiku-5-5 | 350 | 58 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 238 | subject arm 1 fable–fable #1 A m19 | claude-fable-5-1 | 4 | 96 | $0.00891 | 2.6 |  |
| 2026-10-24 06:26 | 239 | check arm 1 fable–fable #1 m19 | claude-haiku-5-5 | 328 | 56 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 240 | subject arm 1 sonnet–sonnet #1 A m39 | claude-sonnet-5-5 | 4 | 941 | $0.01855 | 10.4 |  |
| 2026-10-24 06:26 | 241 | subject arm 1 opus–opus #1 A m7 | claude-opus-5-5 | 4 | 2360 | $0.06176 | 29.6 |  |
| 2026-10-24 06:26 | 242 | check arm 1 opus–opus #1 m7 | claude-haiku-5-5 | 2736 | 67 | $0.00031 | 0.9 |  |
| 2026-10-24 06:26 | 243 | check arm 1 sonnet–sonnet #1 m39 | claude-haiku-5-5 | 1979 | 76 | $0.00024 | 1.4 |  |
| 2026-10-24 06:26 | 244 | subject arm 1 fable–fable #1 B m20 | claude-fable-5-1 | 4 | 5 | $0.00409 | 1.6 |  |
| 2026-10-24 06:26 | 245 | check arm 1 fable–fable #1 m20 | claude-haiku-5-5 | 326 | 58 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 246 | subject arm 1 fable–fable #1 A m21 | claude-fable-5-1 | 4 | 166 | $0.01212 | 4.2 |  |
| 2026-10-24 06:26 | 247 | check arm 1 fable–fable #1 m21 | claude-haiku-5-5 | 353 | 58 | $0.00006 | 1.8 |  |
| 2026-10-24 06:26 | 248 | subject arm 1 sonnet–sonnet #1 B m40 | claude-sonnet-5-5 | 4 | 752 | $0.01703 | 8.1 |  |
| 2026-10-24 06:26 | 249 | check arm 1 sonnet–sonnet #1 m40 | claude-haiku-5-5 | 2008 | 78 | $0.00024 | 1.3 |  |
| 2026-10-24 06:26 | 250 | subject arm 1 fable–fable #1 B m22 | claude-fable-5-1 | 4 | 90 | $0.00866 | 3.3 |  |
| 2026-10-24 06:26 | 251 | check arm 1 fable–fable #1 m22 | claude-haiku-5-5 | 358 | 56 | $0.00006 | 1.1 |  |
| 2026-10-24 06:26 | 252 | subject arm 1 sonnet–sonnet #1 A m41 | claude-sonnet-5-5 | 4 | 801 | $0.01774 | 8.6 |  |
| 2026-10-24 06:26 | 253 | subject arm 1 fable–fable #1 A m23 | claude-fable-5-1 | 4 | 177 | $0.01307 | 4.7 |  |
| 2026-10-24 06:26 | 254 | check arm 1 fable–fable #1 m23 | claude-haiku-5-5 | 332 | 59 | $0.00006 | 1.4 |  |
| 2026-10-24 06:26 | 255 | check arm 1 sonnet–sonnet #1 m41 | claude-haiku-5-5 | 1868 | 75 | $0.00022 | 2.2 |  |
| 2026-10-24 06:26 | 256 | subject arm 1 fable–fable #1 B m24 | claude-fable-5-1 | 4 | 150 | $0.01141 | 3.7 |  |
| 2026-10-24 06:26 | 257 | check arm 1 fable–fable #1 m24 | claude-haiku-5-5 | 329 | 47 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 258 | subject arm 1 opus–opus #1 B m8 | claude-opus-5-5 | 4 | 2382 | $0.06078 | 30.2 |  |
| 2026-10-24 06:26 | 259 | check arm 1 opus–opus #1 m8 | claude-haiku-5-5 | 2241 | 79 | $0.00026 | 1 |  |
| 2026-10-24 06:26 | 260 | subject arm 1 sonnet–sonnet #1 B m42 | claude-sonnet-5-5 | 4 | 757 | $0.01714 | 10.8 |  |
| 2026-10-24 06:26 | 261 | check arm 1 sonnet–sonnet #1 m42 | claude-haiku-5-5 | 1873 | 68 | $0.00022 | 0.8 |  |
| 2026-10-24 06:26 | 262 | subject arm 1 fable–fable #1 A m25 | claude-fable-5-1 | 4 | 217 | $0.01472 | 5.2 |  |
| 2026-10-24 06:26 | 263 | check arm 1 fable–fable #1 m25 | claude-haiku-5-5 | 355 | 64 | $0.00007 | 0.6 |  |
| 2026-10-24 06:26 | 264 | subject arm 1 fable–fable #1 B m26 | claude-fable-5-1 | 4 | 149 | $0.01165 | 3.7 |  |
| 2026-10-24 06:26 | 265 | check arm 1 fable–fable #1 m26 | claude-haiku-5-5 | 367 | 58 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 266 | subject arm 1 sonnet–sonnet #1 A m43 | claude-sonnet-5-5 | 4 | 839 | $0.01812 | 10.8 |  |
| 2026-10-24 06:26 | 267 | check arm 1 sonnet–sonnet #1 m43 | claude-haiku-5-5 | 1911 | 81 | $0.00023 | 2.1 |  |
| 2026-10-24 06:26 | 268 | subject arm 1 fable–fable #1 A m27 | claude-fable-5-1 | 4 | 238 | $0.01625 | 5.4 |  |
| 2026-10-24 06:26 | 269 | check arm 1 fable–fable #1 m27 | claude-haiku-5-5 | 348 | 68 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 270 | subject arm 1 fable–fable #1 B m28 | claude-fable-5-1 | 4 | 107 | $0.00947 | 3 |  |
| 2026-10-24 06:26 | 271 | check arm 1 fable–fable #1 m28 | claude-haiku-5-5 | 336 | 64 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 272 | subject arm 1 opus–opus #1 A m9 | claude-opus-5-5 | 4 | 2174 | $0.05442 | 25.9 |  |
| 2026-10-24 06:26 | 273 | subject arm 1 sonnet–sonnet #1 B m44 | claude-sonnet-5-5 | 4 | 754 | $0.01753 | 9.7 |  |
| 2026-10-24 06:26 | 274 | check arm 1 opus–opus #1 m9 | claude-haiku-5-5 | 2423 | 70 | $0.00028 | 1.4 |  |
| 2026-10-24 06:26 | 275 | check arm 1 sonnet–sonnet #1 m44 | claude-haiku-5-5 | 1908 | 93 | $0.00024 | 1.1 |  |
| 2026-10-24 06:26 | 276 | subject arm 1 fable–fable #1 A m29 | claude-fable-5-1 | 4 | 134 | $0.01068 | 3.9 |  |
| 2026-10-24 06:26 | 277 | check arm 1 fable–fable #1 m29 | claude-haiku-5-5 | 334 | 70 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 278 | subject arm 1 fable–fable #1 B m30 | claude-fable-5-1 | 4 | 173 | $0.01260 | 4.3 |  |
| 2026-10-24 06:26 | 279 | check arm 1 fable–fable #1 m30 | claude-haiku-5-5 | 334 | 63 | $0.00006 | 1.6 |  |
| 2026-10-24 06:26 | 280 | subject arm 1 sonnet–sonnet #1 A m45 | claude-sonnet-5-5 | 4 | 783 | $0.01796 | 10.1 |  |
| 2026-10-24 06:26 | 281 | check arm 1 sonnet–sonnet #1 m45 | claude-haiku-5-5 | 1852 | 69 | $0.00022 | 0.9 |  |
| 2026-10-24 06:26 | 282 | subject arm 1 fable–fable #1 A m31 | claude-fable-5-1 | 4 | 281 | $0.01801 | 6.1 |  |
| 2026-10-24 06:26 | 283 | check arm 1 fable–fable #1 m31 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 284 | subject arm 1 fable–fable #1 B m32 | claude-fable-5-1 | 4 | 66 | $0.00720 | 2.3 |  |
| 2026-10-24 06:26 | 285 | subject arm 1 sonnet–sonnet #1 B m46 | claude-sonnet-5-5 | 4 | 795 | $0.01811 | 8.5 |  |
| 2026-10-24 06:26 | 286 | check arm 1 fable–fable #1 m32 | claude-haiku-5-5 | 329 | 46 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 287 | check arm 1 sonnet–sonnet #1 m46 | claude-haiku-5-5 | 1893 | 76 | $0.00023 | 0.9 |  |
| 2026-10-24 06:26 | 288 | subject arm 1 opus–opus #1 B m10 | claude-opus-5-5 | 4 | 1887 | $0.04980 | 24.8 |  |
| 2026-10-24 06:26 | 289 | check arm 1 opus–opus #1 m10 | claude-haiku-5-5 | 2686 | 62 | $0.00030 | 1 |  |
| 2026-10-24 06:26 | 290 | subject arm 1 fable–fable #1 A m33 | claude-fable-5-1 | 4 | 228 | $0.01530 | 4.4 |  |
| 2026-10-24 06:26 | 291 | check arm 1 fable–fable #1 m33 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 292 | subject arm 1 fable–fable #1 B m34 | claude-fable-5-1 | 4 | 139 | $0.01085 | 3.5 |  |
| 2026-10-24 06:26 | 293 | subject arm 1 sonnet–sonnet #1 A m47 | claude-sonnet-5-5 | 4 | 1036 | $0.02077 | 11.2 |  |
| 2026-10-24 06:26 | 294 | check arm 1 sonnet–sonnet #1 m47 | claude-haiku-5-5 | 2146 | 72 | $0.00025 | 0.7 |  |
| 2026-10-24 06:26 | 295 | check arm 1 fable–fable #1 m34 | claude-haiku-5-5 | 329 | 53 | $0.00006 | 1.3 |  |
| 2026-10-24 06:26 | 296 | subject arm 1 fable–fable #1 A m35 | claude-fable-5-1 | 4 | 166 | $0.01220 | 3.4 |  |
| 2026-10-24 06:26 | 297 | check arm 1 fable–fable #1 m35 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 298 | subject arm 1 fable–fable #1 B m36 | claude-fable-5-1 | 4 | 191 | $0.01345 | 3.4 |  |
| 2026-10-24 06:26 | 299 | check arm 1 fable–fable #1 m36 | claude-haiku-5-5 | 329 | 42 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 300 | subject arm 1 sonnet–sonnet #1 B m48 | claude-sonnet-5-5 | 4 | 924 | $0.02044 | 11 |  |
| 2026-10-24 06:26 | 301 | check arm 1 sonnet–sonnet #1 m48 | claude-haiku-5-5 | 2275 | 82 | $0.00027 | 0.8 |  |
| 2026-10-24 06:26 | 302 | subject arm 1 fable–fable #1 A m37 | claude-fable-5-1 | 4 | 97 | $0.00876 | 2.4 |  |
| 2026-10-24 06:26 | 303 | check arm 1 fable–fable #1 m37 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 304 | subject arm 1 opus–opus #1 A m11 | claude-opus-5-5 | 4 | 2563 | $0.06481 | 29.5 |  |
| 2026-10-24 06:26 | 305 | check arm 1 opus–opus #1 m11 | claude-haiku-5-5 | 2402 | 72 | $0.00028 | 0.8 |  |
| 2026-10-24 06:26 | 306 | subject arm 1 fable–fable #1 B m38 | claude-fable-5-1 | 4 | 194 | $0.01361 | 4.4 |  |
| 2026-10-24 06:26 | 307 | check arm 1 fable–fable #1 m38 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.7 |  |
| 2026-10-24 06:26 | 308 | check referee arm 1 opus–opus #1 m11 | claude-opus-5-5 | 2402 | 50 | $0.01061 | 2.2 |  |
| 2026-10-24 06:26 | 309 | subject arm 1 sonnet–sonnet #1 A m49 | claude-sonnet-5-5 | 4 | 1045 | $0.02213 | 11.7 |  |
| 2026-10-24 06:26 | 310 | check arm 1 sonnet–sonnet #1 m49 | claude-haiku-5-5 | 2284 | 82 | $0.00027 | 1.3 |  |
| 2026-10-24 06:26 | 311 | subject arm 1 fable–fable #1 A m39 | claude-fable-5-1 | 4 | 354 | $0.02161 | 6.8 |  |
| 2026-10-24 06:26 | 312 | check arm 1 fable–fable #1 m39 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.9 |  |
| 2026-10-24 06:26 | 313 | subject arm 1 fable–fable #1 B m40 | claude-fable-5-1 | 4 | 167 | $0.01226 | 4.2 |  |
| 2026-10-24 06:26 | 314 | check arm 1 fable–fable #1 m40 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 315 | subject arm 1 sonnet–sonnet #1 B m50 | claude-sonnet-5-5 | 4 | 1088 | $0.02279 | 12 |  |
| 2026-10-24 06:26 | 316 | check arm 1 sonnet–sonnet #1 m50 | claude-haiku-5-5 | 2008 | 93 | $0.00025 | 1.2 |  |
| 2026-10-24 06:26 | 317 | subject arm 1 fable–fable #1 A m41 | claude-fable-5-1 | 4 | 222 | $0.01501 | 4.5 |  |
| 2026-10-24 06:26 | 318 | check arm 1 fable–fable #1 m41 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.2 |  |
| 2026-10-24 06:26 | 319 | subject arm 1 sonnet–sonnet #1 A m51 | claude-sonnet-5-5 | 4 | 330 | $0.01471 | 4.1 |  |
| 2026-10-24 06:26 | 320 | check arm 1 sonnet–sonnet #1 m51 | claude-haiku-5-5 | 1293 | 75 | $0.00017 | 1.2 |  |
| 2026-10-24 06:26 | 321 | subject arm 1 opus–opus #1 B m12 | claude-opus-5-5 | 4 | 2024 | $0.05285 | 25.9 |  |
| 2026-10-24 06:26 | 322 | check arm 1 opus–opus #1 m12 | claude-haiku-5-5 | 2561 | 78 | $0.00030 | 0.9 |  |
| 2026-10-24 06:26 | 323 | subject arm 1 fable–fable #1 B m42 | claude-fable-5-1 | 4 | 94 | $0.00861 | 2.5 |  |
| 2026-10-24 06:26 | 324 | check arm 1 fable–fable #1 m42 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 325 | subject arm 1 sonnet–sonnet #1 B m52 | claude-sonnet-5-5 | 4 | 572 | $0.01555 | 7.3 |  |
| 2026-10-24 06:26 | 326 | check arm 1 sonnet–sonnet #1 m52 | claude-haiku-5-5 | 1043 | 83 | $0.00015 | 1.4 |  |
| 2026-10-24 06:26 | 327 | subject arm 1 fable–fable #1 A m43 | claude-fable-5-1 | 4 | 246 | $0.01622 | 5.6 |  |
| 2026-10-24 06:26 | 328 | check arm 1 fable–fable #1 m43 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 329 | subject arm 1 sonnet–sonnet #1 A m53 | claude-sonnet-5-5 | 4 | 541 | $0.01474 | 6.4 |  |
| 2026-10-24 06:26 | 330 | check arm 1 sonnet–sonnet #1 m53 | claude-haiku-5-5 | 1254 | 75 | $0.00016 | 1.2 |  |
| 2026-10-24 06:26 | 331 | subject arm 1 opus–opus #1 A m13 | claude-opus-5-5 | 4 | 1651 | $0.04642 | 19.7 |  |
| 2026-10-24 06:26 | 332 | subject arm 1 fable–fable #1 B m44 | claude-fable-5-1 | 4 | 444 | $0.02612 | 10 |  |
| 2026-10-24 06:26 | 333 | check arm 1 opus–opus #1 m13 | claude-haiku-5-5 | 2299 | 70 | $0.00026 | 1 |  |
| 2026-10-24 06:26 | 334 | check arm 1 fable–fable #1 m44 | claude-haiku-5-5 | 409 | 83 | $0.00008 | 0.7 |  |
| 2026-10-24 06:26 | 335 | subject arm 1 sonnet–sonnet #1 B m54 | claude-sonnet-5-5 | 4 | 898 | $0.01891 | 9.2 |  |
| 2026-10-24 06:26 | 336 | subject arm 1 fable–fable #1 A m45 | claude-fable-5-1 | 4 | 137 | $0.01177 | 4.1 |  |
| 2026-10-24 06:26 | 337 | check arm 1 sonnet–sonnet #1 m54 | claude-haiku-5-5 | 1323 | 84 | $0.00017 | 1.6 |  |
| 2026-10-24 06:26 | 338 | check arm 1 fable–fable #1 m45 | claude-haiku-5-5 | 488 | 72 | $0.00008 | 0.9 |  |
| 2026-10-24 06:26 | 339 | subject arm 1 sonnet–sonnet #1 A m55 | claude-sonnet-5-5 | 4 | 127 | $0.01145 | 1.8 |  |
| 2026-10-24 06:26 | 340 | subject arm 1 fable–fable #1 B m46 | claude-fable-5-1 | 4 | 56 | $0.00871 | 2 |  |
| 2026-10-24 06:26 | 341 | check arm 1 sonnet–sonnet #1 m55 | claude-haiku-5-5 | 909 | 83 | $0.00013 | 1.8 |  |
| 2026-10-24 06:26 | 342 | check arm 1 fable–fable #1 m46 | claude-haiku-5-5 | 408 | 43 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 343 | subject arm 1 sonnet–sonnet #1 B m56 | claude-sonnet-5-5 | 4 | 42 | $0.00967 | 1.1 |  |
| 2026-10-24 06:26 | 344 | check arm 1 sonnet–sonnet #1 m56 | claude-haiku-5-5 | 484 | 63 | $0.00008 | 0.9 |  |
| 2026-10-24 06:26 | 345 | subject arm 1 fable–fable #1 A m47 | claude-fable-5-1 | 4 | 66 | $0.00823 | 2.4 |  |
| 2026-10-24 06:26 | 346 | subject arm 1 sonnet–sonnet #1 A m57 | claude-sonnet-5-5 | 4 | 12 | $0.00840 | 0.8 |  |
| 2026-10-24 06:26 | 347 | check arm 1 fable–fable #1 m47 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.6 |  |
| 2026-10-24 06:26 | 348 | subject arm 1 opus–opus #1 B m14 | claude-opus-5-5 | 4 | 1333 | $0.03893 | 18.1 |  |
| 2026-10-24 06:26 | 349 | check arm 1 sonnet–sonnet #1 m57 | claude-haiku-5-5 | 369 | 56 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 350 | check arm 1 opus–opus #1 m14 | claude-haiku-5-5 | 1537 | 89 | $0.00020 | 1 |  |
| 2026-10-24 06:26 | 351 | subject arm 1 fable–fable #1 B m48 | claude-fable-5-1 | 4 | 59 | $0.00692 | 2.1 |  |
| 2026-10-24 06:26 | 352 | subject arm 1 sonnet–sonnet #1 B m58 | claude-sonnet-5-5 | 4 | 8 | $0.00810 | 0.9 |  |
| 2026-10-24 06:26 | 353 | check arm 1 fable–fable #1 m48 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.9 |  |
| 2026-10-24 06:26 | 354 | check arm 1 sonnet–sonnet #1 m58 | claude-haiku-5-5 | 335 | 49 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 355 | subject arm 1 sonnet–sonnet #1 A m59 | claude-sonnet-5-5 | 4 | 8 | $0.00802 | 0.7 |  |
| 2026-10-24 06:26 | 356 | subject arm 1 fable–fable #1 A m49 | claude-fable-5-1 | 4 | 66 | $0.00727 | 2.4 |  |
| 2026-10-24 06:26 | 357 | check arm 1 sonnet–sonnet #1 m59 | claude-haiku-5-5 | 331 | 47 | $0.00006 | 1.4 |  |
| 2026-10-24 06:26 | 358 | check arm 1 fable–fable #1 m49 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.8 |  |
| 2026-10-24 06:26 | 359 | subject arm 1 sonnet–sonnet #1 B m60 | claude-sonnet-5-5 | 4 | 8 | $0.00802 | 0.9 |  |
| 2026-10-24 06:26 | 360 | check arm 1 sonnet–sonnet #1 m60 | claude-haiku-5-5 | 331 | 49 | $0.00006 | 1.7 |  |
| 2026-10-24 06:26 | 361 | subject arm 1 fable–fable #1 B m50 | claude-fable-5-1 | 4 | 73 | $0.00762 | 2.6 |  |
| 2026-10-24 06:26 | 362 | check arm 1 fable–fable #1 m50 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.9 |  |
| 2026-10-24 06:26 | 363 | tags 1 arm 1 sonnet–sonnet #1 m1–10 | claude-haiku-5-5 | 6738 | 680 | $0.00101 | 2.2 |  |
| 2026-10-24 06:26 | 364 | tags 2 arm 1 sonnet–sonnet #1 m1–10 | claude-haiku-5-5 | 6738 | 680 | $0.00101 | 2.2 |  |
| 2026-10-24 06:26 | 365 | tags 1 arm 1 sonnet–sonnet #1 m11–20 | claude-haiku-5-5 | 8848 | 680 | $0.00122 | 3.5 |  |
| 2026-10-24 06:26 | 366 | subject arm 2 sonnet–sonnet #2 A m1 | claude-sonnet-5-5 | 59 | 272 | $0.00284 | 3.5 |  |
| 2026-10-24 06:26 | 367 | check arm 2 sonnet–sonnet #2 m1 | claude-haiku-5-5 | 598 | 60 | $0.00009 | 0.6 |  |
| 2026-10-24 06:26 | 368 | subject arm 1 fable–fable #1 A m51 | claude-fable-5-1 | 4 | 45 | $0.00622 | 2.3 |  |
| 2026-10-24 06:26 | 369 | check arm 1 fable–fable #1 m51 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1 |  |
| 2026-10-24 06:26 | 370 | tags 2 arm 1 sonnet–sonnet #1 m11–20 | claude-haiku-5-5 | 8848 | 680 | $0.00122 | 2.3 |  |
| 2026-10-24 06:26 | 371 | tags 1 arm 1 sonnet–sonnet #1 m21–30 | claude-haiku-5-5 | 9679 | 680 | $0.00131 | 2.4 |  |
| 2026-10-24 06:26 | 372 | tags 2 arm 1 sonnet–sonnet #1 m21–30 | claude-haiku-5-5 | 9679 | 680 | $0.00131 | 2.4 |  |
| 2026-10-24 06:26 | 373 | subject arm 1 opus–opus #1 A m15 | claude-opus-5-5 | 4 | 1633 | $0.04139 | 20.2 |  |
| 2026-10-24 06:26 | 374 | subject arm 2 sonnet–sonnet #2 B m2 | claude-sonnet-5-5 | 329 | 306 | $0.00372 | 4.6 |  |
| 2026-10-24 06:26 | 375 | subject arm 1 fable–fable #1 B m52 | claude-fable-5-1 | 4 | 67 | $0.00732 | 2.5 |  |
| 2026-10-24 06:26 | 376 | check arm 1 opus–opus #1 m15 | claude-haiku-5-5 | 1595 | 91 | $0.00020 | 1.3 |  |
| 2026-10-24 06:26 | 377 | check arm 1 fable–fable #1 m52 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 378 | check arm 2 sonnet–sonnet #2 m2 | claude-haiku-5-5 | 893 | 60 | $0.00012 | 1.6 |  |
| 2026-10-24 06:26 | 379 | tags 1 arm 1 sonnet–sonnet #1 m31–40 | claude-haiku-5-5 | 10230 | 680 | $0.00136 | 2.7 |  |
| 2026-10-24 06:26 | 380 | tags 2 arm 1 sonnet–sonnet #1 m31–40 | claude-haiku-5-5 | 10230 | 680 | $0.00136 | 2.6 |  |
| 2026-10-24 06:26 | 381 | tags 1 arm 1 sonnet–sonnet #1 m41–50 | claude-haiku-5-5 | 10189 | 680 | $0.00136 | 2.6 |  |
| 2026-10-24 06:26 | 382 | subject arm 1 fable–fable #1 A m53 | claude-fable-5-1 | 4 | 46 | $0.00627 | 2.1 |  |
| 2026-10-24 06:26 | 383 | check arm 1 fable–fable #1 m53 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.1 |  |
| 2026-10-24 06:26 | 384 | subject arm 2 sonnet–sonnet #2 A m3 | claude-sonnet-5-5 | 4 | 272 | $0.00431 | 3.3 |  |
| 2026-10-24 06:26 | 385 | tags 2 arm 1 sonnet–sonnet #1 m41–50 | claude-haiku-5-5 | 10189 | 680 | $0.00136 | 2.3 |  |
| 2026-10-24 06:26 | 386 | check arm 2 sonnet–sonnet #2 m3 | claude-haiku-5-5 | 893 | 62 | $0.00012 | 1.3 |  |
| 2026-10-24 06:26 | 387 | tags 1 arm 1 sonnet–sonnet #1 m51–60 | claude-haiku-5-5 | 3644 | 680 | $0.00070 | 2.6 |  |
| 2026-10-24 06:26 | 388 | tags 2 arm 1 sonnet–sonnet #1 m51–60 | claude-haiku-5-5 | 3644 | 680 | $0.00070 | 2.8 |  |
| 2026-10-24 06:26 | 389 | subject arm 1 fable–fable #1 B m54 | claude-fable-5-1 | 4 | 64 | $0.00718 | 2.1 |  |
| 2026-10-24 06:26 | 390 | check arm 1 fable–fable #1 m54 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.2 |  |
| 2026-10-24 06:26 | 391 | subject arm 2 sonnet–sonnet #2 B m4 | claude-sonnet-5-5 | 4 | 272 | $0.00499 | 4.5 |  |
| 2026-10-24 06:26 | 392 | check arm 2 sonnet–sonnet #2 m4 | claude-haiku-5-5 | 859 | 64 | $0.00012 | 1.2 |  |
| 2026-10-24 06:26 | 393 | subject arm 1 fable–fable #1 A m55 | claude-fable-5-1 | 4 | 125 | $0.01023 | 3.3 |  |
| 2026-10-24 06:26 | 394 | tags referee arm 1 sonnet–sonnet #1 m21–30 | claude-opus-5-5 | 9679 | 829 | $0.05530 | 6.8 |  |
| 2026-10-24 06:26 | 395 | check arm 1 fable–fable #1 m55 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 396 | tags referee arm 1 sonnet–sonnet #1 m51–60 | claude-opus-5-5 | 3644 | 680 | $0.02818 | 5.3 |  |
| 2026-10-24 06:26 | 397 | tags referee arm 1 sonnet–sonnet #1 m41–50 | claude-opus-5-5 | 10189 | 798 | $0.05672 | 7 |  |
| 2026-10-24 06:26 | 398 | subject arm 1 opus–opus #1 B m16 | claude-opus-5-5 | 4 | 1299 | $0.03513 | 18.4 |  |
| 2026-10-24 06:26 | 399 | subject arm 2 sonnet–sonnet #2 A m5 | claude-sonnet-5-5 | 4 | 392 | $0.00541 | 4 |  |
| 2026-10-24 06:26 | 400 | check arm 1 opus–opus #1 m16 | claude-haiku-5-5 | 1783 | 78 | $0.00022 | 0.9 |  |
| 2026-10-24 06:26 | 401 | check arm 2 sonnet–sonnet #2 m5 | claude-haiku-5-5 | 979 | 71 | $0.00013 | 0.7 |  |
| 2026-10-24 06:26 | 402 | subject arm 1 fable–fable #1 B m56 | claude-fable-5-1 | 4 | 66 | $0.00728 | 2.1 |  |
| 2026-10-24 06:26 | 403 | check arm 1 fable–fable #1 m56 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 404 | subject arm 1 fable–fable #1 A m57 | claude-fable-5-1 | 4 | 72 | $0.00758 | 2.6 |  |
| 2026-10-24 06:26 | 405 | subject arm 2 sonnet–sonnet #2 B m6 | claude-sonnet-5-5 | 4 | 371 | $0.00556 | 4.4 |  |
| 2026-10-24 06:26 | 406 | check arm 1 fable–fable #1 m57 | claude-haiku-5-5 | 329 | 46 | $0.00006 | 1.3 |  |
| 2026-10-24 06:26 | 407 | check arm 2 sonnet–sonnet #2 m6 | claude-haiku-5-5 | 1078 | 76 | $0.00015 | 0.8 |  |
| 2026-10-24 06:26 | 408 | subject arm 1 fable–fable #1 B m58 | claude-fable-5-1 | 4 | 36 | $0.00578 | 1.9 |  |
| 2026-10-24 06:26 | 409 | check arm 1 fable–fable #1 m58 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 410 | subject arm 2 sonnet–sonnet #2 A m7 | claude-sonnet-5-5 | 4 | 488 | $0.00703 | 5.5 |  |
| 2026-10-24 06:26 | 411 | subject arm 1 fable–fable #1 A m59 | claude-fable-5-1 | 4 | 38 | $0.00588 | 2.3 |  |
| 2026-10-24 06:26 | 412 | check arm 2 sonnet–sonnet #2 m7 | claude-haiku-5-5 | 1174 | 102 | $0.00017 | 1.2 |  |
| 2026-10-24 06:26 | 413 | check arm 1 fable–fable #1 m59 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 414 | subject arm 1 fable–fable #1 B m60 | claude-fable-5-1 | 4 | 89 | $0.00844 | 2.7 |  |
| 2026-10-24 06:26 | 415 | subject arm 2 sonnet–sonnet #2 B m8 | claude-sonnet-5-5 | 4 | 405 | $0.00652 | 4.4 |  |
| 2026-10-24 06:26 | 416 | check arm 1 fable–fable #1 m60 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.4 |  |
| 2026-10-24 06:26 | 417 | check arm 2 sonnet–sonnet #2 m8 | claude-haiku-5-5 | 1208 | 75 | $0.00016 | 1 |  |
| 2026-10-24 06:26 | 418 | subject arm 1 opus–opus #1 A m17 | claude-opus-5-5 | 4 | 2068 | $0.05156 | 22.7 |  |
| 2026-10-24 06:26 | 419 | check arm 1 opus–opus #1 m17 | claude-haiku-5-5 | 1660 | 80 | $0.00021 | 0.9 |  |
| 2026-10-24 06:26 | 420 | tags 2 arm 1 fable–fable #1 m1–10 | claude-haiku-5-5 | 12781 | 680 | $0.00162 | 2.8 |  |
| 2026-10-24 06:26 | 421 | tags 1 arm 1 fable–fable #1 m1–10 | claude-haiku-5-5 | 12781 | 680 | $0.00162 | 2.8 |  |
| 2026-10-24 06:26 | 422 | tags 1 arm 1 fable–fable #1 m11–20 | claude-haiku-5-5 | 5227 | 680 | $0.00086 | 2.9 |  |
| 2026-10-24 06:26 | 423 | subject arm 2 opus–opus #2 A m1 | claude-opus-5-5 | 59 | 365 | $0.00754 | 5.2 |  |
| 2026-10-24 06:26 | 424 | check referee arm 1 opus–opus #1 m17 | claude-opus-5-5 | 1660 | 62 | $0.00788 | 1.4 |  |
| 2026-10-24 06:26 | 425 | subject arm 2 sonnet–sonnet #2 A m9 | claude-sonnet-5-5 | 4 | 442 | $0.00705 | 5.1 |  |
| 2026-10-24 06:26 | 426 | check arm 2 opus–opus #2 m1 | claude-haiku-5-5 | 664 | 63 | $0.00010 | 0.9 |  |
| 2026-10-24 06:26 | 427 | tags 2 arm 1 fable–fable #1 m11–20 | claude-haiku-5-5 | 5227 | 680 | $0.00086 | 2.2 |  |
| 2026-10-24 06:26 | 428 | tags 1 arm 1 fable–fable #1 m21–30 | claude-haiku-5-5 | 1209 | 680 | $0.00046 | 2.4 |  |
| 2026-10-24 06:26 | 429 | tags 2 arm 1 fable–fable #1 m21–30 | claude-haiku-5-5 | 1209 | 680 | $0.00046 | 2.4 |  |
| 2026-10-24 06:26 | 430 | check arm 2 sonnet–sonnet #2 m9 | claude-haiku-5-5 | 1162 | 66 | $0.00015 | 1 |  |
| 2026-10-24 06:26 | 431 | tags 1 arm 1 fable–fable #1 m31–40 | claude-haiku-5-5 | 1132 | 680 | $0.00045 | 2.2 |  |
| 2026-10-24 06:26 | 432 | tags 2 arm 1 fable–fable #1 m31–40 | claude-haiku-5-5 | 1132 | 680 | $0.00045 | 2.2 |  |
| 2026-10-24 06:26 | 433 | tags 1 arm 1 fable–fable #1 m41–50 | claude-haiku-5-5 | 1291 | 680 | $0.00047 | 2.4 |  |
| 2026-10-24 06:26 | 434 | subject arm 2 sonnet–sonnet #2 B m10 | claude-sonnet-5-5 | 4 | 505 | $0.00766 | 5.5 |  |
| 2026-10-24 06:26 | 435 | check arm 2 sonnet–sonnet #2 m10 | claude-haiku-5-5 | 1258 | 72 | $0.00016 | 0.8 |  |
| 2026-10-24 06:26 | 436 | tags 2 arm 1 fable–fable #1 m41–50 | claude-haiku-5-5 | 1291 | 680 | $0.00047 | 2.3 |  |
| 2026-10-24 06:26 | 437 | tags 2 arm 1 fable–fable #1 m51–60 | claude-haiku-5-5 | 1132 | 680 | $0.00045 | 2.2 |  |
| 2026-10-24 06:26 | 438 | tags 1 arm 1 fable–fable #1 m51–60 | claude-haiku-5-5 | 1132 | 680 | $0.00045 | 4.1 |  |
| 2026-10-24 06:26 | 439 | subject arm 2 opus–opus #2 B m2 | claude-opus-5-5 | 395 | 852 | $0.01862 | 11.4 |  |
| 2026-10-24 06:26 | 440 | check arm 2 opus–opus #2 m2 | claude-haiku-5-5 | 1443 | 75 | $0.00018 | 0.8 |  |
| 2026-10-24 06:26 | 441 | subject arm 1 opus–opus #1 B m18 | claude-opus-5-5 | 4 | 1291 | $0.03555 | 16.4 |  |
| 2026-10-24 06:26 | 442 | check arm 1 opus–opus #1 m18 | claude-haiku-5-5 | 1358 | 77 | $0.00017 | 0.7 |  |
| 2026-10-24 06:26 | 443 | tags 1 arm 2 sonnet–sonnet #2 m1–10 | claude-haiku-5-5 | 4750 | 680 | $0.00081 | 2.2 |  |
| 2026-10-24 06:26 | 444 | tags 2 arm 2 sonnet–sonnet #2 m1–10 | claude-haiku-5-5 | 4750 | 680 | $0.00081 | 2.2 |  |
| 2026-10-24 06:26 | 445 | subject arm 1 opus–opus #2 A m1 | claude-opus-5-5 | 40 | 520 | $0.01056 | 7.4 |  |
| 2026-10-24 06:26 | 446 | tags referee arm 1 fable–fable #1 m21–30 | claude-opus-5-5 | 1209 | 680 | $0.01844 | 5.2 |  |
| 2026-10-24 06:26 | 447 | check arm 1 opus–opus #2 m1 | claude-haiku-5-5 | 797 | 61 | $0.00011 | 0.7 |  |
| 2026-10-24 06:26 | 448 | subject arm 2 opus–opus #2 A m3 | claude-opus-5-5 | 4 | 1380 | $0.03353 | 17.9 |  |
| 2026-10-24 06:26 | 449 | subject arm 1 opus–opus #1 A m19 | claude-opus-5-5 | 4 | 1300 | $0.03437 | 15.9 |  |
| 2026-10-24 06:26 | 450 | check arm 2 opus–opus #2 m3 | claude-haiku-5-5 | 1974 | 87 | $0.00024 | 0.9 |  |
| 2026-10-24 06:26 | 451 | check arm 1 opus–opus #1 m19 | claude-haiku-5-5 | 1403 | 205 | $0.00024 | 1.4 |  |
| 2026-10-24 06:26 | 452 | subject arm 1 opus–opus #2 B m2 | claude-opus-5-5 | 509 | 1264 | $0.02732 | 17.4 |  |
| 2026-10-24 06:26 | 453 | check arm 1 opus–opus #2 m2 | claude-haiku-5-5 | 1604 | 88 | $0.00020 | 1.3 |  |
| 2026-10-24 06:26 | 454 | subject arm 1 opus–opus #1 B m20 | claude-opus-5-5 | 4 | 917 | $0.02706 | 13.5 |  |
| 2026-10-24 06:26 | 455 | check arm 1 opus–opus #1 m20 | claude-haiku-5-5 | 1614 | 74 | $0.00020 | 0.9 |  |
| 2026-10-24 06:26 | 456 | subject arm 1 opus–opus #1 A m21 | claude-opus-5-5 | 4 | 612 | $0.02210 | 8.3 |  |
| 2026-10-24 06:26 | 457 | check arm 1 opus–opus #1 m21 | claude-haiku-5-5 | 1438 | 82 | $0.00018 | 0.9 |  |
| 2026-10-24 06:26 | 458 | subject arm 1 opus–opus #2 A m3 | claude-opus-5-5 | 4 | 1628 | $0.03920 | 21.2 |  |
| 2026-10-24 06:26 | 459 | subject arm 2 opus–opus #2 B m4 | claude-opus-5-5 | 4 | 1991 | $0.05009 | 26.7 |  |
| 2026-10-24 06:26 | 460 | check arm 1 opus–opus #2 m3 | claude-haiku-5-5 | 1959 | 80 | $0.00024 | 0.9 |  |
| 2026-10-24 06:26 | 461 | check arm 2 opus–opus #2 m4 | claude-haiku-5-5 | 2347 | 67 | $0.00027 | 0.7 |  |
| 2026-10-24 06:26 | 462 | subject arm 1 opus–opus #1 B m22 | claude-opus-5-5 | 4 | 494 | $0.01899 | 7.1 |  |
| 2026-10-24 06:26 | 463 | check arm 1 opus–opus #1 m22 | claude-haiku-5-5 | 1151 | 79 | $0.00015 | 0.9 |  |
| 2026-10-24 06:26 | 464 | subject arm 1 opus–opus #1 A m23 | claude-opus-5-5 | 4 | 288 | $0.01356 | 4.5 |  |
| 2026-10-24 06:26 | 465 | check arm 1 opus–opus #1 m23 | claude-haiku-5-5 | 847 | 68 | $0.00012 | 1.1 |  |
| 2026-10-24 06:26 | 466 | subject arm 1 opus–opus #1 B m24 | claude-opus-5-5 | 4 | 384 | $0.01406 | 5.9 |  |
| 2026-10-24 06:26 | 467 | subject arm 2 opus–opus #2 A m5 | claude-opus-5-5 | 4 | 1772 | $0.04585 | 21.8 |  |
| 2026-10-24 06:26 | 468 | check arm 1 opus–opus #1 m24 | claude-haiku-5-5 | 781 | 65 | $0.00011 | 0.9 |  |
| 2026-10-24 06:26 | 469 | check arm 2 opus–opus #2 m5 | claude-haiku-5-5 | 2486 | 74 | $0.00029 | 0.8 |  |
| 2026-10-24 06:26 | 470 | subject arm 1 opus–opus #2 B m4 | claude-opus-5-5 | 4 | 1829 | $0.04734 | 23.8 |  |
| 2026-10-24 06:26 | 471 | check arm 1 opus–opus #2 m4 | claude-haiku-5-5 | 2154 | 73 | $0.00025 | 0.9 |  |
| 2026-10-24 06:26 | 472 | subject arm 1 opus–opus #1 A m25 | claude-opus-5-5 | 4 | 171 | $0.00954 | 3.4 |  |
| 2026-10-24 06:26 | 473 | check arm 1 opus–opus #1 m25 | claude-haiku-5-5 | 661 | 54 | $0.00009 | 0.8 |  |
| 2026-10-24 06:26 | 474 | subject arm 1 opus–opus #1 B m26 | claude-opus-5-5 | 4 | 63 | $0.00682 | 2.2 |  |
| 2026-10-24 06:26 | 475 | check arm 1 opus–opus #1 m26 | claude-haiku-5-5 | 391 | 61 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 476 | subject arm 1 opus–opus #1 A m27 | claude-opus-5-5 | 4 | 84 | $0.00594 | 1.7 |  |
| 2026-10-24 06:26 | 477 | check arm 1 opus–opus #1 m27 | claude-haiku-5-5 | 335 | 59 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 478 | subject arm 1 opus–opus #1 B m28 | claude-opus-5-5 | 4 | 101 | $0.00601 | 2.6 |  |
| 2026-10-24 06:26 | 479 | check arm 1 opus–opus #1 m28 | claude-haiku-5-5 | 329 | 72 | $0.00007 | 1.1 |  |
| 2026-10-24 06:26 | 480 | subject arm 1 opus–opus #1 A m29 | claude-opus-5-5 | 4 | 172 | $0.00741 | 3 |  |
| 2026-10-24 06:26 | 481 | subject arm 2 opus–opus #2 B m6 | claude-opus-5-5 | 4 | 1904 | $0.04936 | 25.3 |  |
| 2026-10-24 06:26 | 482 | check arm 1 opus–opus #1 m29 | claude-haiku-5-5 | 339 | 56 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 483 | check arm 2 opus–opus #2 m6 | claude-haiku-5-5 | 2455 | 68 | $0.00028 | 0.7 |  |
| 2026-10-24 06:26 | 484 | subject arm 1 opus–opus #1 B m30 | claude-opus-5-5 | 4 | 145 | $0.00692 | 2.9 |  |
| 2026-10-24 06:26 | 485 | check arm 1 opus–opus #1 m30 | claude-haiku-5-5 | 351 | 54 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 486 | subject arm 1 opus–opus #2 A m5 | claude-opus-5-5 | 4 | 2536 | $0.06020 | 31.8 |  |
| 2026-10-24 06:26 | 487 | check arm 1 opus–opus #2 m5 | claude-haiku-5-5 | 2418 | 77 | $0.00028 | 1 |  |
| 2026-10-24 06:26 | 488 | subject arm 1 opus–opus #1 A m31 | claude-opus-5-5 | 4 | 64 | $0.00536 | 1.6 |  |
| 2026-10-24 06:26 | 489 | check arm 1 opus–opus #1 m31 | claude-haiku-5-5 | 340 | 65 | $0.00007 | 3.3 |  |
| 2026-10-24 06:26 | 490 | subject arm 1 opus–opus #1 B m32 | claude-opus-5-5 | 4 | 60 | $0.00523 | 3.1 |  |
| 2026-10-24 06:26 | 491 | check arm 1 opus–opus #1 m32 | claude-haiku-5-5 | 327 | 52 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 492 | subject arm 1 opus–opus #1 A m33 | claude-opus-5-5 | 4 | 128 | $0.00653 | 2.8 |  |
| 2026-10-24 06:26 | 493 | check arm 1 opus–opus #1 m33 | claude-haiku-5-5 | 327 | 49 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 494 | subject arm 1 opus–opus #1 B m34 | claude-opus-5-5 | 4 | 162 | $0.00721 | 3.3 |  |
| 2026-10-24 06:26 | 495 | check arm 1 opus–opus #1 m34 | claude-haiku-5-5 | 351 | 60 | $0.00007 | 1.3 |  |
| 2026-10-24 06:26 | 496 | subject arm 2 opus–opus #2 A m7 | claude-opus-5-5 | 4 | 2275 | $0.05686 | 29.4 |  |
| 2026-10-24 06:26 | 497 | check arm 2 opus–opus #2 m7 | claude-haiku-5-5 | 2274 | 70 | $0.00026 | 0.7 |  |
| 2026-10-24 06:26 | 498 | subject arm 1 opus–opus #2 B m6 | claude-opus-5-5 | 4 | 1945 | $0.04986 | 22.8 |  |
| 2026-10-24 06:26 | 499 | check arm 1 opus–opus #2 m6 | claude-haiku-5-5 | 2584 | 76 | $0.00030 | 0.7 |  |
| 2026-10-24 06:26 | 500 | subject arm 1 opus–opus #1 A m35 | claude-opus-5-5 | 4 | 136 | $0.00681 | 3.2 |  |
| 2026-10-24 06:26 | 501 | check arm 1 opus–opus #1 m35 | claude-haiku-5-5 | 359 | 63 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 502 | subject arm 1 opus–opus #1 B m36 | claude-opus-5-5 | 4 | 80 | $0.00573 | 2.3 |  |
| 2026-10-24 06:26 | 503 | check arm 1 opus–opus #1 m36 | claude-haiku-5-5 | 332 | 59 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 504 | subject arm 1 opus–opus #1 A m37 | claude-opus-5-5 | 4 | 153 | $0.00706 | 2.8 |  |
| 2026-10-24 06:26 | 505 | check arm 1 opus–opus #1 m37 | claude-haiku-5-5 | 321 | 45 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 506 | subject arm 1 opus–opus #1 B m38 | claude-opus-5-5 | 4 | 232 | $0.00859 | 4.2 |  |
| 2026-10-24 06:26 | 507 | check arm 1 opus–opus #1 m38 | claude-haiku-5-5 | 337 | 57 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 508 | subject arm 2 opus–opus #2 B m8 | claude-opus-5-5 | 4 | 1676 | $0.04418 | 19.6 |  |
| 2026-10-24 06:26 | 509 | check arm 2 opus–opus #2 m8 | claude-haiku-5-5 | 2072 | 62 | $0.00024 | 0.7 |  |
| 2026-10-24 06:26 | 510 | subject arm 1 opus–opus #2 A m7 | claude-opus-5-5 | 4 | 1479 | $0.04157 | 19 |  |
| 2026-10-24 06:26 | 511 | check arm 1 opus–opus #2 m7 | claude-haiku-5-5 | 2386 | 70 | $0.00027 | 0.9 |  |
| 2026-10-24 06:26 | 512 | subject arm 1 opus–opus #1 A m39 | claude-opus-5-5 | 4 | 189 | $0.00781 | 3.4 |  |
| 2026-10-24 06:26 | 513 | check arm 1 opus–opus #1 m39 | claude-haiku-5-5 | 342 | 64 | $0.00007 | 0.6 |  |
| 2026-10-24 06:26 | 514 | subject arm 1 opus–opus #1 B m40 | claude-opus-5-5 | 4 | 114 | $0.00634 | 2.3 |  |
| 2026-10-24 06:26 | 515 | check arm 1 opus–opus #1 m40 | claude-haiku-5-5 | 331 | 64 | $0.00007 | 2.1 |  |
| 2026-10-24 06:26 | 516 | subject arm 1 opus–opus #1 A m41 | claude-opus-5-5 | 4 | 214 | $0.00829 | 4.1 |  |
| 2026-10-24 06:26 | 517 | check arm 1 opus–opus #1 m41 | claude-haiku-5-5 | 426 | 61 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 518 | subject arm 1 opus–opus #1 B m42 | claude-opus-5-5 | 4 | 110 | $0.00668 | 2.4 |  |
| 2026-10-24 06:26 | 519 | check arm 1 opus–opus #1 m42 | claude-haiku-5-5 | 476 | 63 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 520 | subject arm 2 opus–opus #2 A m9 | claude-opus-5-5 | 4 | 1831 | $0.04649 | 22 |  |
| 2026-10-24 06:26 | 521 | check arm 2 opus–opus #2 m9 | claude-haiku-5-5 | 2142 | 82 | $0.00026 | 0.9 |  |
| 2026-10-24 06:26 | 522 | subject arm 1 opus–opus #1 A m43 | claude-opus-5-5 | 4 | 58 | $0.00589 | 1.5 |  |
| 2026-10-24 06:26 | 523 | subject arm 1 opus–opus #2 B m8 | claude-opus-5-5 | 4 | 1989 | $0.05100 | 23.1 |  |
| 2026-10-24 06:26 | 524 | check arm 1 opus–opus #1 m43 | claude-haiku-5-5 | 381 | 52 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 525 | check arm 1 opus–opus #2 m8 | claude-haiku-5-5 | 2014 | 77 | $0.00024 | 0.7 |  |
| 2026-10-24 06:26 | 526 | subject arm 1 opus–opus #1 B m44 | claude-opus-5-5 | 4 | 131 | $0.00690 | 2.9 |  |
| 2026-10-24 06:26 | 527 | check arm 1 opus–opus #1 m44 | claude-haiku-5-5 | 331 | 50 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 528 | subject arm 1 opus–opus #1 A m45 | claude-opus-5-5 | 4 | 103 | $0.00610 | 2.1 |  |
| 2026-10-24 06:26 | 529 | check arm 1 opus–opus #1 m45 | claude-haiku-5-5 | 331 | 64 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 530 | subject arm 1 opus–opus #1 B m46 | claude-opus-5-5 | 4 | 131 | $0.00666 | 2.7 |  |
| 2026-10-24 06:26 | 531 | check arm 1 opus–opus #1 m46 | claude-haiku-5-5 | 326 | 51 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 532 | subject arm 2 opus–opus #2 B m10 | claude-opus-5-5 | 4 | 1684 | $0.04407 | 20.1 |  |
| 2026-10-24 06:26 | 533 | subject arm 1 opus–opus #1 A m47 | claude-opus-5-5 | 4 | 106 | $0.00614 | 2.1 |  |
| 2026-10-24 06:26 | 534 | check arm 2 opus–opus #2 m10 | claude-haiku-5-5 | 2228 | 80 | $0.00026 | 0.8 |  |
| 2026-10-24 06:26 | 535 | check arm 1 opus–opus #1 m47 | claude-haiku-5-5 | 321 | 46 | $0.00006 | 1.1 |  |
| 2026-10-24 06:26 | 536 | subject arm 1 opus–opus #1 B m48 | claude-opus-5-5 | 4 | 74 | $0.00547 | 3 |  |
| 2026-10-24 06:26 | 537 | check arm 1 opus–opus #1 m48 | claude-haiku-5-5 | 321 | 45 | $0.00005 | 1 |  |
| 2026-10-24 06:26 | 538 | subject arm 1 opus–opus #2 A m9 | claude-opus-5-5 | 4 | 2661 | $0.06282 | 27.4 |  |
| 2026-10-24 06:26 | 539 | check arm 1 opus–opus #2 m9 | claude-haiku-5-5 | 2123 | 71 | $0.00025 | 0.6 |  |
| 2026-10-24 06:26 | 540 | subject arm 2 opus–opus #2 A m11 | claude-opus-5-5 | 4 | 557 | $0.02214 | 8.3 |  |
| 2026-10-24 06:26 | 541 | subject arm 1 opus–opus #1 A m49 | claude-opus-5-5 | 4 | 81 | $0.00562 | 2 |  |
| 2026-10-24 06:26 | 542 | check arm 1 opus–opus #1 m49 | claude-haiku-5-5 | 321 | 47 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 543 | check arm 2 opus–opus #2 m11 | claude-haiku-5-5 | 1605 | 64 | $0.00019 | 0.7 |  |
| 2026-10-24 06:26 | 544 | subject arm 2 opus–opus #2 B m12 | claude-opus-5-5 | 4 | 109 | $0.01025 | 2.3 |  |
| 2026-10-24 06:26 | 545 | subject arm 1 opus–opus #1 B m50 | claude-opus-5-5 | 4 | 95 | $0.00590 | 2.3 |  |
| 2026-10-24 06:26 | 546 | tags 1 arm 2 opus–opus #2 m11–11 | claude-haiku-5-5 | 2201 | 77 | $0.00026 | 0.8 |  |
| 2026-10-24 06:26 | 547 | check arm 1 opus–opus #1 m50 | claude-haiku-5-5 | 321 | 45 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 548 | tags 2 arm 2 opus–opus #2 m1–10 | claude-haiku-5-5 | 9999 | 680 | $0.00134 | 2.3 |  |
| 2026-10-24 06:26 | 549 | tags 1 arm 2 opus–opus #2 m1–10 | claude-haiku-5-5 | 9999 | 680 | $0.00134 | 2.4 |  |
| 2026-10-24 06:26 | 550 | tags 2 arm 2 opus–opus #2 m11–11 | claude-haiku-5-5 | 2201 | 77 | $0.00026 | 0.7 |  |
| 2026-10-24 06:26 | 551 | subject arm 1 opus–opus #1 A m51 | claude-opus-5-5 | 4 | 61 | $0.00522 | 1.7 |  |
| 2026-10-24 06:26 | 552 | check arm 1 opus–opus #1 m51 | claude-haiku-5-5 | 321 | 47 | $0.00006 | 0.5 |  |
| 2026-10-24 06:26 | 553 | tags referee arm 2 opus–opus #2 m1–10 | claude-opus-5-5 | 9999 | 680 | $0.05360 | 5.3 |  |
| 2026-10-24 06:26 | 554 | subject arm 1 opus–opus #1 B m52 | claude-opus-5-5 | 4 | 138 | $0.00676 | 3 |  |
| 2026-10-24 06:26 | 555 | check arm 1 opus–opus #1 m52 | claude-haiku-5-5 | 321 | 45 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 556 | subject arm 1 fable–fable #2 A m1 | claude-fable-5-1 | 40 | 626 | $0.03170 | 12.2 |  |
| 2026-10-24 06:26 | 557 | check arm 1 fable–fable #2 m1 | claude-haiku-5-5 | 844 | 70 | $0.00012 | 0.8 |  |
| 2026-10-24 06:26 | 558 | subject arm 1 opus–opus #1 A m53 | claude-opus-5-5 | 4 | 112 | $0.00624 | 2.5 |  |
| 2026-10-24 06:26 | 559 | check arm 1 opus–opus #1 m53 | claude-haiku-5-5 | 321 | 47 | $0.00006 | 0.5 |  |
| 2026-10-24 06:26 | 560 | subject arm 1 opus–opus #1 B m54 | claude-opus-5-5 | 4 | 97 | $0.00594 | 2.4 |  |
| 2026-10-24 06:26 | 561 | check arm 1 opus–opus #1 m54 | claude-haiku-5-5 | 321 | 47 | $0.00006 | 1.3 |  |
| 2026-10-24 06:26 | 562 | subject arm 1 opus–opus #1 A m55 | claude-opus-5-5 | 4 | 69 | $0.00538 | 2.2 |  |
| 2026-10-24 06:26 | 563 | check arm 1 opus–opus #1 m55 | claude-haiku-5-5 | 321 | 45 | $0.00005 | 1.3 |  |
| 2026-10-24 06:26 | 564 | subject arm 1 opus–opus #1 B m56 | claude-opus-5-5 | 4 | 185 | $0.00770 | 3.9 |  |
| 2026-10-24 06:26 | 565 | check arm 1 opus–opus #1 m56 | claude-haiku-5-5 | 380 | 61 | $0.00007 | 1.6 |  |
| 2026-10-24 06:26 | 566 | subject arm 1 fable–fable #2 B m2 | claude-fable-5-1 | 4 | 1159 | $0.06489 | 21.9 |  |
| 2026-10-24 06:26 | 567 | subject arm 1 opus–opus #1 A m57 | claude-opus-5-5 | 4 | 216 | $0.00862 | 3.6 |  |
| 2026-10-24 06:26 | 568 | check arm 1 fable–fable #2 m2 | claude-haiku-5-5 | 1860 | 72 | $0.00022 | 0.8 |  |
| 2026-10-24 06:26 | 569 | check arm 1 opus–opus #1 m57 | claude-haiku-5-5 | 435 | 63 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 570 | subject arm 1 opus–opus #2 B m10 | claude-opus-5-5 | 4 | 4743 | $0.10518 | 46 |  |
| 2026-10-24 06:26 | 571 | check arm 1 opus–opus #2 m10 | claude-haiku-5-5 | 1996 | 57 | $0.00023 | 1.1 |  |
| 2026-10-24 06:26 | 572 | subject arm 1 opus–opus #1 B m58 | claude-opus-5-5 | 4 | 94 | $0.00645 | 3 |  |
| 2026-10-24 06:26 | 573 | check arm 1 opus–opus #1 m58 | claude-haiku-5-5 | 407 | 56 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 574 | subject arm 1 opus–opus #1 A m59 | claude-opus-5-5 | 4 | 152 | $0.00748 | 2.6 |  |
| 2026-10-24 06:26 | 575 | check arm 1 opus–opus #1 m59 | claude-haiku-5-5 | 365 | 63 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 576 | subject arm 1 opus–opus #1 B m60 | claude-opus-5-5 | 4 | 67 | $0.00558 | 2.4 |  |
| 2026-10-24 06:26 | 577 | check arm 1 opus–opus #1 m60 | claude-haiku-5-5 | 341 | 64 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 578 | tags 2 arm 1 opus–opus #1 m1–10 | claude-haiku-5-5 | 11745 | 680 | $0.00151 | 2.2 |  |
| 2026-10-24 06:26 | 579 | tags 1 arm 1 opus–opus #1 m1–10 | claude-haiku-5-5 | 11745 | 680 | $0.00151 | 2.3 |  |
| 2026-10-24 06:26 | 580 | tags 1 arm 1 opus–opus #1 m11–20 | claude-haiku-5-5 | 9475 | 680 | $0.00129 | 2.9 |  |
| 2026-10-24 06:26 | 581 | tags 2 arm 1 opus–opus #1 m11–20 | claude-haiku-5-5 | 9475 | 680 | $0.00129 | 2.9 |  |
| 2026-10-24 06:26 | 582 | tags 1 arm 1 opus–opus #1 m21–30 | claude-haiku-5-5 | 3119 | 680 | $0.00065 | 2.9 |  |
| 2026-10-24 06:26 | 583 | tags 2 arm 1 opus–opus #1 m21–30 | claude-haiku-5-5 | 3119 | 680 | $0.00065 | 2.8 |  |
| 2026-10-24 06:26 | 584 | tags 1 arm 1 opus–opus #1 m31–40 | claude-haiku-5-5 | 1177 | 680 | $0.00046 | 2.4 |  |
| 2026-10-24 06:26 | 585 | tags 1 arm 1 opus–opus #1 m41–50 | claude-haiku-5-5 | 1263 | 680 | $0.00047 | 2.2 |  |
| 2026-10-24 06:26 | 586 | subject arm 2 fable–fable #2 A m1 | claude-fable-5-1 | 59 | 540 | $0.02759 | 11.8 |  |
| 2026-10-24 06:26 | 587 | tags 2 arm 1 opus–opus #1 m31–40 | claude-haiku-5-5 | 1177 | 680 | $0.00046 | 2.9 |  |
| 2026-10-24 06:26 | 588 | check arm 2 fable–fable #2 m1 | claude-haiku-5-5 | 788 | 64 | $0.00011 | 0.7 |  |
| 2026-10-24 06:26 | 589 | subject arm 1 opus–opus #2 A m11 | claude-opus-5-5 | 4 | 2944 | $0.06873 | 28.8 |  |
| 2026-10-24 06:26 | 590 | check arm 1 opus–opus #2 m11 | claude-haiku-5-5 | 2100 | 73 | $0.00025 | 0.7 |  |
| 2026-10-24 06:26 | 591 | tags 2 arm 1 opus–opus #1 m41–50 | claude-haiku-5-5 | 1263 | 680 | $0.00047 | 2.9 |  |
| 2026-10-24 06:26 | 592 | tags 1 arm 1 opus–opus #1 m51–60 | claude-haiku-5-5 | 1253 | 882 | $0.00057 | 3.3 |  |
| 2026-10-24 06:26 | 593 | tags 2 arm 1 opus–opus #1 m51–60 | claude-haiku-5-5 | 1253 | 1104 | $0.00068 | 4.6 |  |
| 2026-10-24 06:26 | 594 | tags referee arm 1 opus–opus #1 m11–20 | claude-opus-5-5 | 9475 | 977 | $0.05744 | 8.6 |  |
| 2026-10-24 06:26 | 595 | subject arm 1 fable–fable #2 A m3 | claude-fable-5-1 | 4 | 3382 | $0.18890 | 49.5 |  |
| 2026-10-24 06:26 | 596 | check arm 1 fable–fable #2 m3 | claude-haiku-5-5 | 2449 | 73 | $0.00028 | 0.8 |  |
| 2026-10-24 06:26 | 597 | subject arm 2 fable–fable #2 B m2 | claude-fable-5-1 | 4 | 969 | $0.05493 | 18.9 |  |
| 2026-10-24 06:26 | 598 | check arm 2 fable–fable #2 m2 | claude-haiku-5-5 | 1559 | 75 | $0.00019 | 0.7 |  |
| 2026-10-24 06:26 | 599 | subject arm 1 opus–opus #2 B m12 | claude-opus-5-5 | 4 | 2165 | $0.05387 | 28.6 |  |
| 2026-10-24 06:26 | 600 | check arm 1 opus–opus #2 m12 | claude-haiku-5-5 | 2479 | 74 | $0.00028 | 1.5 |  |
| 2026-10-24 06:26 | 601 | subject arm 1 opus–opus #2 A m13 | claude-opus-5-5 | 4 | 1996 | $0.05252 | 24.4 |  |
| 2026-10-24 06:26 | 602 | check arm 1 opus–opus #2 m13 | claude-haiku-5-5 | 2498 | 91 | $0.00030 | 0.8 |  |
| 2026-10-24 06:26 | 603 | subject arm 2 fable–fable #2 A m3 | claude-fable-5-1 | 4 | 2254 | $0.12898 | 42.3 |  |
| 2026-10-24 06:26 | 604 | check arm 2 fable–fable #2 m3 | claude-haiku-5-5 | 2279 | 84 | $0.00027 | 0.9 |  |
| 2026-10-24 06:26 | 605 | subject arm 1 opus–opus #2 B m14 | claude-opus-5-5 | 4 | 1685 | $0.04661 | 22.2 |  |
| 2026-10-24 06:26 | 606 | check arm 1 opus–opus #2 m14 | claude-haiku-5-5 | 2358 | 78 | $0.00027 | 1 |  |
| 2026-10-24 06:26 | 607 | subject arm 2 fable–fable #2 B m4 | claude-fable-5-1 | 4 | 1688 | $0.10912 | 34.6 |  |
| 2026-10-24 06:26 | 608 | check arm 2 fable–fable #2 m4 | claude-haiku-5-5 | 2572 | 92 | $0.00030 | 0.8 |  |
| 2026-10-24 06:26 | 609 | subject arm 1 fable–fable #2 B m4 | claude-fable-5-1 | 4 | 8000 | $0.42685 | 98.9 |  |
| 2026-10-24 06:26 | 610 | check arm 1 fable–fable #2 m4 | claude-haiku-5-5 | 2334 | 73 | $0.00027 | 1 |  |
| 2026-10-24 06:26 | 611 | subject arm 2 fable–fable #2 A m5 | claude-fable-5-1 | 4 | 2278 | $0.14248 | 44.4 |  |
| 2026-10-24 06:26 | 612 | check arm 2 fable–fable #2 m5 | claude-haiku-5-5 | 2764 | 67 | $0.00031 | 0.8 |  |
| 2026-10-24 06:26 | 613 | subject arm 1 opus–opus #2 A m15 | claude-opus-5-5 | 4 | 8000 | $0.17243 | 80.3 |  |
| 2026-10-24 06:26 | 614 | check arm 1 opus–opus #2 m15 | claude-haiku-5-5 | 1736 | 68 | $0.00021 | 1.8 |  |
| 2026-10-24 06:26 | 615 | subject arm 1 opus–opus #2 B m16 | claude-opus-5-5 | 4 | 1480 | $0.03914 | 18.8 |  |
| 2026-10-24 06:26 | 616 | check arm 1 opus–opus #2 m16 | claude-haiku-5-5 | 1674 | 77 | $0.00021 | 0.8 |  |
| 2026-10-24 06:26 | 617 | subject arm 2 fable–fable #2 B m6 | claude-fable-5-1 | 4 | 1857 | $0.12412 | 37.2 |  |
| 2026-10-24 06:26 | 618 | check arm 2 fable–fable #2 m6 | claude-haiku-5-5 | 2845 | 83 | $0.00033 | 1.1 |  |
| 2026-10-24 06:26 | 619 | subject arm 1 fable–fable #2 A m5 | claude-fable-5-1 | 4 | 6172 | $0.33427 | 79 |  |
| 2026-10-24 06:26 | 620 | check arm 1 fable–fable #2 m5 | claude-haiku-5-5 | 2369 | 79 | $0.00028 | 0.9 |  |
| 2026-10-24 06:26 | 621 | subject arm 2 fable–fable #2 A m7 | claude-fable-5-1 | 4 | 2325 | $0.14880 | 43.4 |  |
| 2026-10-24 06:26 | 622 | check arm 2 fable–fable #2 m7 | claude-haiku-5-5 | 2785 | 101 | $0.00033 | 0.9 |  |
| 2026-10-24 06:26 | 623 | subject arm 1 opus–opus #2 A m17 | claude-opus-5-5 | 4 | 8000 | $0.16942 | 72.9 |  |
| 2026-10-24 06:26 | 624 | check arm 1 opus–opus #2 m17 | claude-haiku-5-5 | 1179 | 43 | $0.00014 | 1 |  |
| 2026-10-24 06:26 | 625 | subject arm 2 fable–fable #2 B m8 | claude-fable-5-1 | 4 | 2144 | $0.13935 | 40 |  |
| 2026-10-24 06:26 | 626 | check arm 2 fable–fable #2 m8 | claude-haiku-5-5 | 2705 | 90 | $0.00032 | 2.1 |  |
| 2026-10-24 06:26 | 627 | subject arm 1 opus–opus #2 B m18 | claude-opus-5-5 | 4 | 1870 | $0.04444 | 19.3 |  |
| 2026-10-24 06:26 | 628 | check arm 1 opus–opus #2 m18 | claude-haiku-5-5 | 1045 | 79 | $0.00014 | 2.1 |  |
| 2026-10-24 06:26 | 629 | subject arm 1 fable–fable #2 B m6 | claude-fable-5-1 | 4 | 8000 | $0.42639 | 95.1 |  |
| 2026-10-24 06:26 | 630 | check arm 1 fable–fable #2 m6 | claude-haiku-5-5 | 1464 | 43 | $0.00017 | 0.6 |  |
| 2026-10-24 06:26 | 631 | subject arm 1 fable–fable #2 A m7 | claude-fable-5-1 | 4 | 483 | $0.03945 | 9.1 |  |
| 2026-10-24 06:26 | 632 | check arm 1 fable–fable #2 m7 | claude-haiku-5-5 | 726 | 69 | $0.00011 | 0.8 |  |
| 2026-10-24 06:26 | 633 | subject arm 2 fable–fable #2 A m9 | claude-fable-5-1 | 4 | 2523 | $0.15759 | 49 |  |
| 2026-10-24 06:26 | 634 | check arm 2 fable–fable #2 m9 | claude-haiku-5-5 | 2561 | 96 | $0.00030 | 1.4 |  |
| 2026-10-24 06:26 | 635 | subject arm 1 opus–opus #2 A m19 | claude-opus-5-5 | 4 | 5316 | $0.11286 | 52.4 |  |
| 2026-10-24 06:26 | 636 | check arm 1 opus–opus #2 m19 | claude-haiku-5-5 | 2271 | 68 | $0.00026 | 1.2 |  |
| 2026-10-24 06:26 | 637 | subject arm 1 opus–opus #2 B m20 | claude-opus-5-5 | 4 | 3536 | $0.08339 | 33.8 |  |
| 2026-10-24 06:26 | 638 | check arm 1 opus–opus #2 m20 | claude-haiku-5-5 | 3179 | 73 | $0.00035 | 0.9 |  |
| 2026-10-24 06:26 | 639 | subject arm 2 fable–fable #2 B m10 | claude-fable-5-1 | 4 | 2175 | $0.13871 | 46.2 |  |
| 2026-10-24 06:26 | 640 | check arm 2 fable–fable #2 m10 | claude-haiku-5-5 | 2540 | 87 | $0.00030 | 0.9 |  |
| 2026-10-24 06:26 | 641 | subject arm 1 fable–fable #2 B m8 | claude-fable-5-1 | 4 | 6660 | $0.33936 | 91.7 |  |
| 2026-10-24 06:26 | 642 | check arm 1 fable–fable #2 m8 | claude-haiku-5-5 | 2422 | 69 | $0.00028 | 1.2 |  |
| 2026-10-24 06:26 | 643 | subject arm 2 fable–fable #2 A m11 | claude-fable-5-1 | 4 | 1223 | $0.09112 | 26.2 |  |
| 2026-10-24 06:26 | 644 | check arm 2 fable–fable #2 m11 | claude-haiku-5-5 | 1951 | 94 | $0.00024 | 0.8 |  |
| 2026-10-24 06:26 | 645 | subject arm 1 opus–opus #2 A m21 | claude-opus-5-5 | 4 | 2587 | $0.06910 | 29.4 |  |
| 2026-10-24 06:26 | 646 | check arm 1 opus–opus #2 m21 | claude-haiku-5-5 | 2804 | 80 | $0.00032 | 1 |  |
| 2026-10-24 06:26 | 647 | subject arm 2 fable–fable #2 B m12 | claude-fable-5-1 | 4 | 542 | $0.05000 | 11.3 |  |
| 2026-10-24 06:26 | 648 | check arm 2 fable–fable #2 m12 | claude-haiku-5-5 | 1223 | 76 | $0.00016 | 1 |  |
| 2026-10-24 06:26 | 649 | subject arm 2 fable–fable #2 A m13 | claude-fable-5-1 | 4 | 62 | $0.01717 | 1.9 |  |
| 2026-10-24 06:26 | 650 | tags 1 arm 2 fable–fable #2 m1–10 | claude-haiku-5-5 | 11675 | 680 | $0.00151 | 2.3 |  |
| 2026-10-24 06:26 | 651 | tags 2 arm 2 fable–fable #2 m1–10 | claude-haiku-5-5 | 11675 | 680 | $0.00151 | 2.6 |  |
| 2026-10-24 06:26 | 652 | tags 1 arm 2 fable–fable #2 m11–12 | claude-haiku-5-5 | 2890 | 730 | $0.00065 | 3.4 |  |
| 2026-10-24 06:26 | 653 | subject arm 1 sonnet–sonnet #2 A m1 | claude-sonnet-5-5 | 40 | 348 | $0.00356 | 4.5 |  |
| 2026-10-24 06:26 | 654 | check arm 1 sonnet–sonnet #2 m1 | claude-haiku-5-5 | 674 | 60 | $0.00010 | 0.6 |  |
| 2026-10-24 06:26 | 655 | tags 2 arm 2 fable–fable #2 m11–12 | claude-haiku-5-5 | 2890 | 659 | $0.00062 | 3.3 |  |
| 2026-10-24 06:26 | 656 | subject arm 1 opus–opus #2 B m22 | claude-opus-5-5 | 4 | 1773 | $0.05119 | 24 |  |
| 2026-10-24 06:26 | 657 | check arm 1 opus–opus #2 m22 | claude-haiku-5-5 | 2083 | 68 | $0.00024 | 1.2 |  |
| 2026-10-24 06:26 | 658 | tags referee arm 2 fable–fable #2 m1–10 | claude-opus-5-5 | 11675 | 680 | $0.06030 | 4.8 |  |
| 2026-10-24 06:26 | 659 | subject arm 1 sonnet–sonnet #2 B m2 | claude-sonnet-5-5 | 386 | 235 | $0.00312 | 2.9 |  |
| 2026-10-24 06:26 | 660 | check arm 1 sonnet–sonnet #2 m2 | claude-haiku-5-5 | 898 | 60 | $0.00012 | 0.7 |  |
| 2026-10-24 06:26 | 661 | subject arm 1 fable–fable #2 A m9 | claude-fable-5-1 | 4 | 1952 | $0.12516 | 37 |  |
| 2026-10-24 06:26 | 662 | check arm 1 fable–fable #2 m9 | claude-haiku-5-5 | 3255 | 86 | $0.00037 | 0.8 |  |
| 2026-10-24 06:26 | 663 | subject arm 1 sonnet–sonnet #2 A m3 | claude-sonnet-5-5 | 4 | 250 | $0.00406 | 3.6 |  |
| 2026-10-24 06:26 | 664 | check arm 1 sonnet–sonnet #2 m3 | claude-haiku-5-5 | 800 | 62 | $0.00011 | 0.6 |  |
| 2026-10-24 06:26 | 665 | subject arm 1 sonnet–sonnet #2 B m4 | claude-sonnet-5-5 | 4 | 323 | $0.00541 | 4.1 |  |
| 2026-10-24 06:26 | 666 | check arm 1 sonnet–sonnet #2 m4 | claude-haiku-5-5 | 888 | 105 | $0.00014 | 1 |  |
| 2026-10-24 06:26 | 667 | subject arm 1 opus–opus #2 A m23 | claude-opus-5-5 | 4 | 1576 | $0.04397 | 20.7 |  |
| 2026-10-24 06:26 | 668 | check arm 1 opus–opus #2 m23 | claude-haiku-5-5 | 2163 | 71 | $0.00025 | 0.7 |  |
| 2026-10-24 06:26 | 669 | subject arm 1 sonnet–sonnet #2 A m5 | claude-sonnet-5-5 | 4 | 329 | $0.00485 | 4.6 |  |
| 2026-10-24 06:26 | 670 | check arm 1 sonnet–sonnet #2 m5 | claude-haiku-5-5 | 967 | 70 | $0.00013 | 1.3 |  |
| 2026-10-24 06:26 | 671 | subject arm 1 sonnet–sonnet #2 B m6 | claude-sonnet-5-5 | 4 | 344 | $0.00525 | 4.4 |  |
| 2026-10-24 06:26 | 672 | check arm 1 sonnet–sonnet #2 m6 | claude-haiku-5-5 | 988 | 75 | $0.00014 | 0.8 |  |
| 2026-10-24 06:26 | 673 | subject arm 1 sonnet–sonnet #2 A m7 | claude-sonnet-5-5 | 4 | 918 | $0.01111 | 9.4 |  |
| 2026-10-24 06:26 | 674 | check arm 1 sonnet–sonnet #2 m7 | claude-haiku-5-5 | 934 | 70 | $0.00013 | 0.7 |  |
| 2026-10-24 06:26 | 675 | subject arm 1 opus–opus #2 B m24 | claude-opus-5-5 | 4 | 1647 | $0.04596 | 21.6 |  |
| 2026-10-24 06:26 | 676 | check arm 1 opus–opus #2 m24 | claude-haiku-5-5 | 2163 | 68 | $0.00025 | 0.7 |  |
| 2026-10-24 06:26 | 677 | subject arm 1 fable–fable #2 B m10 | claude-fable-5-1 | 4 | 2248 | $0.15048 | 41.7 |  |
| 2026-10-24 06:26 | 678 | check arm 1 fable–fable #2 m10 | claude-haiku-5-5 | 2844 | 98 | $0.00033 | 0.9 |  |
| 2026-10-24 06:26 | 679 | subject arm 1 sonnet–sonnet #2 B m8 | claude-sonnet-5-5 | 4 | 1134 | $0.01320 | 9.8 |  |
| 2026-10-24 06:26 | 680 | check arm 1 sonnet–sonnet #2 m8 | claude-haiku-5-5 | 1105 | 63 | $0.00014 | 0.8 |  |
| 2026-10-24 06:26 | 681 | check referee arm 1 fable–fable #2 m10 | claude-opus-5-5 | 2844 | 72 | $0.01282 | 1.8 |  |
| 2026-10-24 06:26 | 682 | subject arm 1 opus–opus #2 A m25 | claude-opus-5-5 | 4 | 1125 | $0.03570 | 14.7 |  |
| 2026-10-24 06:26 | 683 | subject arm 1 sonnet–sonnet #2 A m9 | claude-sonnet-5-5 | 4 | 622 | $0.00858 | 5.1 |  |
| 2026-10-24 06:26 | 684 | check arm 1 opus–opus #2 m25 | claude-haiku-5-5 | 1998 | 67 | $0.00023 | 0.8 |  |
| 2026-10-24 06:26 | 685 | check arm 1 sonnet–sonnet #2 m9 | claude-haiku-5-5 | 1452 | 60 | $0.00018 | 0.8 |  |
| 2026-10-24 06:26 | 686 | subject arm 1 sonnet–sonnet #2 B m10 | claude-sonnet-5-5 | 4 | 473 | $0.00801 | 3.8 |  |
| 2026-10-24 06:26 | 687 | check arm 1 sonnet–sonnet #2 m10 | claude-haiku-5-5 | 1410 | 72 | $0.00018 | 0.7 |  |
| 2026-10-24 06:26 | 688 | subject arm 1 sonnet–sonnet #2 A m11 | claude-sonnet-5-5 | 4 | 701 | $0.01029 | 6.8 |  |
| 2026-10-24 06:26 | 689 | check arm 1 sonnet–sonnet #2 m11 | claude-haiku-5-5 | 1115 | 63 | $0.00014 | 0.8 |  |
| 2026-10-24 06:26 | 690 | subject arm 1 opus–opus #2 B m26 | claude-opus-5-5 | 4 | 1154 | $0.03565 | 14.8 |  |
| 2026-10-24 06:26 | 691 | check arm 1 opus–opus #2 m26 | claude-haiku-5-5 | 1971 | 78 | $0.00024 | 0.7 |  |
| 2026-10-24 06:26 | 692 | subject arm 1 sonnet–sonnet #2 B m12 | claude-sonnet-5-5 | 4 | 226 | $0.00492 | 4 |  |
| 2026-10-24 06:26 | 693 | check arm 1 sonnet–sonnet #2 m12 | claude-haiku-5-5 | 868 | 77 | $0.00013 | 0.8 |  |
| 2026-10-24 06:26 | 694 | subject arm 1 opus–opus #2 A m27 | claude-opus-5-5 | 4 | 659 | $0.02579 | 9.4 |  |
| 2026-10-24 06:26 | 695 | check arm 1 opus–opus #2 m27 | claude-haiku-5-5 | 1672 | 77 | $0.00021 | 0.8 |  |
| 2026-10-24 06:26 | 696 | subject arm 1 sonnet–sonnet #2 A m13 | claude-sonnet-5-5 | 4 | 559 | $0.00773 | 5.1 |  |
| 2026-10-24 06:26 | 697 | check arm 1 sonnet–sonnet #2 m13 | claude-haiku-5-5 | 706 | 60 | $0.00010 | 0.8 |  |
| 2026-10-24 06:26 | 698 | subject arm 1 fable–fable #2 A m11 | claude-fable-5-1 | 4 | 2278 | $0.14727 | 42 |  |
| 2026-10-24 06:26 | 699 | subject arm 1 sonnet–sonnet #2 B m14 | claude-sonnet-5-5 | 4 | 90 | $0.00270 | 1.7 |  |
| 2026-10-24 06:26 | 700 | check arm 1 sonnet–sonnet #2 m14 | claude-haiku-5-5 | 570 | 70 | $0.00009 | 0.6 |  |
| 2026-10-24 06:26 | 701 | check arm 1 fable–fable #2 m11 | claude-haiku-5-5 | 2810 | 84 | $0.00032 | 2.1 |  |
| 2026-10-24 06:26 | 702 | subject arm 1 opus–opus #2 B m28 | claude-opus-5-5 | 4 | 453 | $0.02033 | 6.8 |  |
| 2026-10-24 06:26 | 703 | subject arm 1 sonnet–sonnet #2 A m15 | claude-sonnet-5-5 | 4 | 67 | $0.00218 | 1.1 |  |
| 2026-10-24 06:26 | 704 | check arm 1 opus–opus #2 m28 | claude-haiku-5-5 | 1119 | 68 | $0.00015 | 1.6 |  |
| 2026-10-24 06:26 | 705 | check arm 1 sonnet–sonnet #2 m15 | claude-haiku-5-5 | 472 | 65 | $0.00008 | 0.7 |  |
| 2026-10-24 06:26 | 706 | subject arm 1 sonnet–sonnet #2 B m16 | claude-sonnet-5-5 | 4 | 81 | $0.00210 | 1.5 |  |
| 2026-10-24 06:26 | 707 | check arm 1 sonnet–sonnet #2 m16 | claude-haiku-5-5 | 463 | 73 | $0.00008 | 1.6 |  |
| 2026-10-24 06:26 | 708 | subject arm 1 opus–opus #2 A m29 | claude-opus-5-5 | 4 | 460 | $0.01789 | 6.5 |  |
| 2026-10-24 06:26 | 709 | subject arm 1 sonnet–sonnet #2 A m17 | claude-sonnet-5-5 | 4 | 112 | $0.00241 | 1.8 |  |
| 2026-10-24 06:26 | 710 | check arm 1 opus–opus #2 m29 | claude-haiku-5-5 | 920 | 78 | $0.00013 | 0.9 |  |
| 2026-10-24 06:26 | 711 | check arm 1 sonnet–sonnet #2 m17 | claude-haiku-5-5 | 508 | 64 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 712 | subject arm 1 sonnet–sonnet #2 B m18 | claude-sonnet-5-5 | 4 | 79 | $0.00221 | 1.7 |  |
| 2026-10-24 06:26 | 713 | check arm 1 sonnet–sonnet #2 m18 | claude-haiku-5-5 | 506 | 59 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 714 | subject arm 1 opus–opus #2 B m30 | claude-opus-5-5 | 4 | 444 | $0.01666 | 6.2 |  |
| 2026-10-24 06:26 | 715 | subject arm 1 sonnet–sonnet #2 A m19 | claude-sonnet-5-5 | 4 | 79 | $0.00222 | 1.4 |  |
| 2026-10-24 06:26 | 716 | check arm 1 opus–opus #2 m30 | claude-haiku-5-5 | 807 | 82 | $0.00012 | 1.4 |  |
| 2026-10-24 06:26 | 717 | check arm 1 sonnet–sonnet #2 m19 | claude-haiku-5-5 | 473 | 59 | $0.00008 | 1.1 |  |
| 2026-10-24 06:26 | 718 | subject arm 1 fable–fable #2 B m12 | claude-fable-5-1 | 4 | 1208 | $0.09365 | 23.5 |  |
| 2026-10-24 06:26 | 719 | check arm 1 fable–fable #2 m12 | claude-haiku-5-5 | 2356 | 87 | $0.00028 | 0.8 |  |
| 2026-10-24 06:26 | 720 | subject arm 1 sonnet–sonnet #2 B m20 | claude-sonnet-5-5 | 4 | 92 | $0.00229 | 1.7 |  |
| 2026-10-24 06:26 | 721 | check arm 1 sonnet–sonnet #2 m20 | claude-haiku-5-5 | 486 | 76 | $0.00009 | 0.8 |  |
| 2026-10-24 06:26 | 722 | subject arm 1 opus–opus #2 A m31 | claude-opus-5-5 | 4 | 345 | $0.01419 | 5.9 |  |
| 2026-10-24 06:26 | 723 | subject arm 1 sonnet–sonnet #2 A m21 | claude-sonnet-5-5 | 4 | 59 | $0.00200 | 1.2 |  |
| 2026-10-24 06:26 | 724 | check arm 1 opus–opus #2 m31 | claude-haiku-5-5 | 665 | 76 | $0.00010 | 0.9 |  |
| 2026-10-24 06:26 | 725 | check arm 1 sonnet–sonnet #2 m21 | claude-haiku-5-5 | 466 | 56 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 726 | subject arm 1 sonnet–sonnet #2 B m22 | claude-sonnet-5-5 | 4 | 72 | $0.00210 | 1.3 |  |
| 2026-10-24 06:26 | 727 | check arm 1 sonnet–sonnet #2 m22 | claude-haiku-5-5 | 446 | 69 | $0.00008 | 0.7 |  |
| 2026-10-24 06:26 | 728 | subject arm 1 opus–opus #2 B m32 | claude-opus-5-5 | 4 | 156 | $0.00975 | 2.7 |  |
| 2026-10-24 06:26 | 729 | check arm 1 opus–opus #2 m32 | claude-haiku-5-5 | 466 | 59 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 730 | subject arm 1 fable–fable #2 A m13 | claude-fable-5-1 | 4 | 470 | $0.05140 | 10.5 |  |
| 2026-10-24 06:26 | 731 | check arm 1 fable–fable #2 m13 | claude-haiku-5-5 | 1574 | 66 | $0.00019 | 0.8 |  |
| 2026-10-24 06:26 | 732 | subject arm 1 sonnet–sonnet #2 A m23 | claude-sonnet-5-5 | 4 | 56 | $0.00191 | 1.5 |  |
| 2026-10-24 06:26 | 733 | check arm 1 sonnet–sonnet #2 m23 | claude-haiku-5-5 | 443 | 68 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 734 | subject arm 1 opus–opus #2 A m33 | claude-opus-5-5 | 4 | 106 | $0.00780 | 2.3 |  |
| 2026-10-24 06:26 | 735 | check arm 1 opus–opus #2 m33 | claude-haiku-5-5 | 351 | 56 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 736 | subject arm 1 sonnet–sonnet #2 B m24 | claude-sonnet-5-5 | 4 | 52 | $0.00187 | 1.2 |  |
| 2026-10-24 06:26 | 737 | check arm 1 sonnet–sonnet #2 m24 | claude-haiku-5-5 | 423 | 57 | $0.00007 | 0.6 |  |
| 2026-10-24 06:26 | 738 | subject arm 1 opus–opus #2 B m34 | claude-opus-5-5 | 4 | 126 | $0.00765 | 2.2 |  |
| 2026-10-24 06:26 | 739 | check arm 1 opus–opus #2 m34 | claude-haiku-5-5 | 338 | 58 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 740 | subject arm 1 fable–fable #2 B m14 | claude-fable-5-1 | 4 | 291 | $0.03297 | 6.3 |  |
| 2026-10-24 06:26 | 741 | subject arm 1 sonnet–sonnet #2 A m25 | claude-sonnet-5-5 | 4 | 40 | $0.00172 | 0.9 |  |
| 2026-10-24 06:26 | 742 | check arm 1 sonnet–sonnet #2 m25 | claude-haiku-5-5 | 407 | 61 | $0.00007 | 0.6 |  |
| 2026-10-24 06:26 | 743 | check arm 1 fable–fable #2 m14 | claude-haiku-5-5 | 952 | 83 | $0.00014 | 0.9 |  |
| 2026-10-24 06:26 | 744 | subject arm 1 opus–opus #2 A m35 | claude-opus-5-5 | 4 | 61 | $0.00629 | 1.6 |  |
| 2026-10-24 06:26 | 745 | subject arm 1 sonnet–sonnet #2 B m26 | claude-sonnet-5-5 | 4 | 33 | $0.00162 | 1.1 |  |
| 2026-10-24 06:26 | 746 | check arm 1 opus–opus #2 m35 | claude-haiku-5-5 | 325 | 53 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 747 | check arm 1 sonnet–sonnet #2 m26 | claude-haiku-5-5 | 388 | 59 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 748 | subject arm 1 sonnet–sonnet #2 A m27 | claude-sonnet-5-5 | 4 | 33 | $0.00158 | 0.7 |  |
| 2026-10-24 06:26 | 749 | check arm 1 sonnet–sonnet #2 m27 | claude-haiku-5-5 | 381 | 67 | $0.00007 | 1.4 |  |
| 2026-10-24 06:26 | 750 | subject arm 1 opus–opus #2 B m36 | claude-opus-5-5 | 4 | 141 | $0.00783 | 3.3 |  |
| 2026-10-24 06:26 | 751 | subject arm 1 fable–fable #2 A m15 | claude-fable-5-1 | 4 | 326 | $0.02716 | 7.3 |  |
| 2026-10-24 06:26 | 752 | check arm 1 opus–opus #2 m36 | claude-haiku-5-5 | 330 | 61 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 753 | check arm 1 fable–fable #2 m15 | claude-haiku-5-5 | 770 | 71 | $0.00011 | 0.7 |  |
| 2026-10-24 06:26 | 754 | subject arm 1 sonnet–sonnet #2 B m28 | claude-sonnet-5-5 | 4 | 80 | $0.00204 | 1.3 |  |
| 2026-10-24 06:26 | 755 | check arm 1 sonnet–sonnet #2 m28 | claude-haiku-5-5 | 428 | 68 | $0.00008 | 0.7 |  |
| 2026-10-24 06:26 | 756 | subject arm 1 opus–opus #2 A m37 | claude-opus-5-5 | 4 | 89 | $0.00681 | 1.8 |  |
| 2026-10-24 06:26 | 757 | check arm 1 opus–opus #2 m37 | claude-haiku-5-5 | 331 | 52 | $0.00006 | 1 |  |
| 2026-10-24 06:26 | 758 | subject arm 1 sonnet–sonnet #2 A m29 | claude-sonnet-5-5 | 4 | 58 | $0.00195 | 1.1 |  |
| 2026-10-24 06:26 | 759 | subject arm 1 fable–fable #2 B m16 | claude-fable-5-1 | 4 | 157 | $0.01654 | 3.4 |  |
| 2026-10-24 06:26 | 760 | check arm 1 sonnet–sonnet #2 m29 | claude-haiku-5-5 | 453 | 66 | $0.00008 | 0.7 |  |
| 2026-10-24 06:26 | 761 | check arm 1 fable–fable #2 m16 | claude-haiku-5-5 | 711 | 75 | $0.00011 | 0.9 |  |
| 2026-10-24 06:26 | 762 | subject arm 1 sonnet–sonnet #2 B m30 | claude-sonnet-5-5 | 4 | 21 | $0.00165 | 0.9 |  |
| 2026-10-24 06:26 | 763 | subject arm 1 opus–opus #2 B m38 | claude-opus-5-5 | 4 | 138 | $0.00780 | 2.6 |  |
| 2026-10-24 06:26 | 764 | subject arm 1 fable–fable #2 A m17 | claude-fable-5-1 | 4 | 10 | $0.00851 | 1.6 |  |
| 2026-10-24 06:26 | 765 | check arm 1 sonnet–sonnet #2 m30 | claude-haiku-5-5 | 394 | 55 | $0.00007 | 1 |  |
| 2026-10-24 06:26 | 766 | check arm 1 opus–opus #2 m38 | claude-haiku-5-5 | 357 | 57 | $0.00006 | 1.5 |  |
| 2026-10-24 06:26 | 767 | check arm 1 fable–fable #2 m17 | claude-haiku-5-5 | 482 | 70 | $0.00008 | 1.4 |  |
| 2026-10-24 06:26 | 768 | subject arm 1 sonnet–sonnet #2 A m31 | claude-sonnet-5-5 | 4 | 21 | $0.00151 | 0.9 |  |
| 2026-10-24 06:26 | 769 | check arm 1 sonnet–sonnet #2 m31 | claude-haiku-5-5 | 357 | 59 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 770 | subject arm 1 fable–fable #2 B m18 | claude-fable-5-1 | 4 | 6 | $0.00550 | 1.5 |  |
| 2026-10-24 06:26 | 771 | subject arm 1 opus–opus #2 A m39 | claude-opus-5-5 | 4 | 120 | $0.00757 | 3.2 |  |
| 2026-10-24 06:26 | 772 | check arm 1 fable–fable #2 m18 | claude-haiku-5-5 | 331 | 54 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 773 | check arm 1 opus–opus #2 m39 | claude-haiku-5-5 | 380 | 58 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 774 | subject arm 1 sonnet–sonnet #2 B m32 | claude-sonnet-5-5 | 4 | 7 | $0.00129 | 0.9 |  |
| 2026-10-24 06:26 | 775 | check arm 1 sonnet–sonnet #2 m32 | claude-haiku-5-5 | 343 | 57 | $0.00006 | 1.2 |  |
| 2026-10-24 06:26 | 776 | subject arm 1 fable–fable #2 A m19 | claude-fable-5-1 | 4 | 6 | $0.00365 | 1.5 |  |
| 2026-10-24 06:26 | 777 | check arm 1 fable–fable #2 m19 | claude-haiku-5-5 | 327 | 67 | $0.00007 | 1.5 |  |
| 2026-10-24 06:26 | 778 | subject arm 1 sonnet–sonnet #2 A m33 | claude-sonnet-5-5 | 4 | 7 | $0.00126 | 0.7 |  |
| 2026-10-24 06:26 | 779 | subject arm 1 opus–opus #2 B m40 | claude-opus-5-5 | 4 | 179 | $0.00887 | 3.3 |  |
| 2026-10-24 06:26 | 780 | check arm 1 sonnet–sonnet #2 m33 | claude-haiku-5-5 | 329 | 50 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 781 | check arm 1 opus–opus #2 m40 | claude-haiku-5-5 | 354 | 58 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 782 | subject arm 1 sonnet–sonnet #2 B m34 | claude-sonnet-5-5 | 4 | 24 | $0.00140 | 1.1 |  |
| 2026-10-24 06:26 | 783 | subject arm 1 fable–fable #2 B m20 | claude-fable-5-1 | 4 | 6 | $0.00361 | 2.7 |  |
| 2026-10-24 06:26 | 784 | check arm 1 fable–fable #2 m20 | claude-haiku-5-5 | 327 | 45 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 785 | check arm 1 sonnet–sonnet #2 m34 | claude-haiku-5-5 | 346 | 64 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 786 | subject arm 1 opus–opus #2 A m41 | claude-opus-5-5 | 4 | 111 | $0.00739 | 2.5 |  |
| 2026-10-24 06:26 | 787 | check arm 1 opus–opus #2 m41 | claude-haiku-5-5 | 328 | 59 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 788 | subject arm 1 sonnet–sonnet #2 A m35 | claude-sonnet-5-5 | 4 | 9 | $0.00130 | 0.9 |  |
| 2026-10-24 06:26 | 789 | check arm 1 sonnet–sonnet #2 m35 | claude-haiku-5-5 | 348 | 60 | $0.00006 | 1.6 |  |
| 2026-10-24 06:26 | 790 | subject arm 1 fable–fable #2 A m21 | claude-fable-5-1 | 4 | 101 | $0.00836 | 3.1 |  |
| 2026-10-24 06:26 | 791 | check arm 1 fable–fable #2 m21 | claude-haiku-5-5 | 327 | 53 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 792 | subject arm 1 sonnet–sonnet #2 B m36 | claude-sonnet-5-5 | 4 | 7 | $0.00128 | 0.9 |  |
| 2026-10-24 06:26 | 793 | subject arm 1 opus–opus #2 B m42 | claude-opus-5-5 | 4 | 245 | $0.00994 | 4 |  |
| 2026-10-24 06:26 | 794 | check arm 1 sonnet–sonnet #2 m36 | claude-haiku-5-5 | 331 | 48 | $0.00006 | 1 |  |
| 2026-10-24 06:26 | 795 | check arm 1 opus–opus #2 m42 | claude-haiku-5-5 | 321 | 45 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 796 | subject arm 1 sonnet–sonnet #2 A m37 | claude-sonnet-5-5 | 4 | 7 | $0.00124 | 0.7 |  |
| 2026-10-24 06:26 | 797 | check arm 1 sonnet–sonnet #2 m37 | claude-haiku-5-5 | 329 | 46 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 798 | subject arm 1 fable–fable #2 B m22 | claude-fable-5-1 | 4 | 206 | $0.01361 | 5.2 |  |
| 2026-10-24 06:26 | 799 | check arm 1 fable–fable #2 m22 | claude-haiku-5-5 | 395 | 59 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 800 | subject arm 1 sonnet–sonnet #2 B m38 | claude-sonnet-5-5 | 4 | 129 | $0.00246 | 1.8 |  |
| 2026-10-24 06:26 | 801 | subject arm 1 opus–opus #2 A m43 | claude-opus-5-5 | 4 | 235 | $0.00971 | 4.3 |  |
| 2026-10-24 06:26 | 802 | check arm 1 sonnet–sonnet #2 m38 | claude-haiku-5-5 | 364 | 60 | $0.00007 | 0.6 |  |
| 2026-10-24 06:26 | 803 | check arm 1 opus–opus #2 m43 | claude-haiku-5-5 | 354 | 80 | $0.00008 | 0.7 |  |
| 2026-10-24 06:26 | 804 | subject arm 1 fable–fable #2 A m23 | claude-fable-5-1 | 4 | 118 | $0.01006 | 2.7 |  |
| 2026-10-24 06:26 | 805 | subject arm 1 sonnet–sonnet #2 A m39 | claude-sonnet-5-5 | 4 | 23 | $0.00149 | 0.8 |  |
| 2026-10-24 06:26 | 806 | check arm 1 sonnet–sonnet #2 m39 | claude-haiku-5-5 | 380 | 63 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 807 | check arm 1 fable–fable #2 m23 | claude-haiku-5-5 | 507 | 64 | $0.00008 | 0.9 |  |
| 2026-10-24 06:26 | 808 | subject arm 1 opus–opus #2 B m44 | claude-opus-5-5 | 4 | 105 | $0.00727 | 2.8 |  |
| 2026-10-24 06:26 | 809 | check arm 1 opus–opus #2 m44 | claude-haiku-5-5 | 360 | 68 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 810 | subject arm 1 sonnet–sonnet #2 B m40 | claude-sonnet-5-5 | 4 | 10 | $0.00140 | 0.9 |  |
| 2026-10-24 06:26 | 811 | check arm 1 sonnet–sonnet #2 m40 | claude-haiku-5-5 | 348 | 59 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 812 | subject arm 1 fable–fable #2 B m24 | claude-fable-5-1 | 4 | 33 | $0.00721 | 1.8 |  |
| 2026-10-24 06:26 | 813 | check arm 1 fable–fable #2 m24 | claude-haiku-5-5 | 466 | 58 | $0.00008 | 0.6 |  |
| 2026-10-24 06:26 | 814 | subject arm 1 sonnet–sonnet #2 A m41 | claude-sonnet-5-5 | 4 | 17 | $0.00140 | 0.8 |  |
| 2026-10-24 06:26 | 815 | check arm 1 sonnet–sonnet #2 m41 | claude-haiku-5-5 | 342 | 63 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 816 | subject arm 1 opus–opus #2 A m45 | claude-opus-5-5 | 4 | 228 | $0.00976 | 3.8 |  |
| 2026-10-24 06:26 | 817 | subject arm 1 fable–fable #2 A m25 | claude-fable-5-1 | 4 | 14 | $0.00577 | 1.7 |  |
| 2026-10-24 06:26 | 818 | check arm 1 opus–opus #2 m45 | claude-haiku-5-5 | 332 | 50 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 819 | check arm 1 fable–fable #2 m25 | claude-haiku-5-5 | 362 | 57 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 820 | subject arm 1 sonnet–sonnet #2 B m42 | claude-sonnet-5-5 | 4 | 8 | $0.00130 | 0.9 |  |
| 2026-10-24 06:26 | 821 | check arm 1 sonnet–sonnet #2 m42 | claude-haiku-5-5 | 340 | 48 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 822 | subject arm 1 fable–fable #2 B m26 | claude-fable-5-1 | 4 | 12 | $0.00440 | 1.4 |  |
| 2026-10-24 06:26 | 823 | subject arm 1 sonnet–sonnet #2 A m43 | claude-sonnet-5-5 | 4 | 8 | $0.00130 | 0.6 |  |
| 2026-10-24 06:26 | 824 | check arm 1 fable–fable #2 m26 | claude-haiku-5-5 | 341 | 59 | $0.00006 | 1.4 |  |
| 2026-10-24 06:26 | 825 | subject arm 1 opus–opus #2 B m46 | claude-opus-5-5 | 4 | 200 | $0.00907 | 3.4 |  |
| 2026-10-24 06:26 | 826 | check arm 1 opus–opus #2 m46 | claude-haiku-5-5 | 366 | 64 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 827 | check arm 1 sonnet–sonnet #2 m43 | claude-haiku-5-5 | 331 | 46 | $0.00006 | 1.7 |  |
| 2026-10-24 06:26 | 828 | subject arm 1 fable–fable #2 A m27 | claude-fable-5-1 | 4 | 9 | $0.00399 | 1.6 |  |
| 2026-10-24 06:26 | 829 | subject arm 1 sonnet–sonnet #2 B m44 | claude-sonnet-5-5 | 4 | 8 | $0.00128 | 1.1 |  |
| 2026-10-24 06:26 | 830 | check arm 1 fable–fable #2 m27 | claude-haiku-5-5 | 336 | 58 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 831 | check arm 1 sonnet–sonnet #2 m44 | claude-haiku-5-5 | 331 | 49 | $0.00006 | 1.7 |  |
| 2026-10-24 06:26 | 832 | subject arm 1 opus–opus #2 A m47 | claude-opus-5-5 | 4 | 206 | $0.00936 | 3.6 |  |
| 2026-10-24 06:26 | 833 | subject arm 1 sonnet–sonnet #2 A m45 | claude-sonnet-5-5 | 4 | 8 | $0.00128 | 0.8 |  |
| 2026-10-24 06:26 | 834 | check arm 1 opus–opus #2 m47 | claude-haiku-5-5 | 412 | 76 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 835 | subject arm 1 fable–fable #2 B m28 | claude-fable-5-1 | 4 | 128 | $0.00988 | 3.3 |  |
| 2026-10-24 06:26 | 836 | check arm 1 sonnet–sonnet #2 m45 | claude-haiku-5-5 | 331 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 837 | check arm 1 fable–fable #2 m28 | claude-haiku-5-5 | 368 | 65 | $0.00007 | 1 |  |
| 2026-10-24 06:26 | 838 | subject arm 1 sonnet–sonnet #2 B m46 | claude-sonnet-5-5 | 4 | 92 | $0.00212 | 1.5 |  |
| 2026-10-24 06:26 | 839 | subject arm 1 opus–opus #2 B m48 | claude-opus-5-5 | 4 | 160 | $0.00867 | 2.7 |  |
| 2026-10-24 06:26 | 840 | check arm 1 opus–opus #2 m48 | claude-haiku-5-5 | 422 | 71 | $0.00008 | 0.7 |  |
| 2026-10-24 06:26 | 841 | check arm 1 sonnet–sonnet #2 m46 | claude-haiku-5-5 | 338 | 61 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 842 | subject arm 1 fable–fable #2 A m29 | claude-fable-5-1 | 4 | 13 | $0.00454 | 1.8 |  |
| 2026-10-24 06:26 | 843 | check arm 1 fable–fable #2 m29 | claude-haiku-5-5 | 372 | 61 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 844 | subject arm 1 sonnet–sonnet #2 A m47 | claude-sonnet-5-5 | 4 | 8 | $0.00130 | 1 |  |
| 2026-10-24 06:26 | 845 | check arm 1 sonnet–sonnet #2 m47 | claude-haiku-5-5 | 338 | 48 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 846 | subject arm 1 opus–opus #2 A m49 | claude-opus-5-5 | 4 | 82 | $0.00717 | 2 |  |
| 2026-10-24 06:26 | 847 | check arm 1 opus–opus #2 m49 | claude-haiku-5-5 | 400 | 64 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 848 | subject arm 1 sonnet–sonnet #2 B m48 | claude-sonnet-5-5 | 4 | 8 | $0.00130 | 2.1 |  |
| 2026-10-24 06:26 | 849 | check arm 1 sonnet–sonnet #2 m48 | claude-haiku-5-5 | 331 | 46 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 850 | subject arm 1 fable–fable #2 B m30 | claude-fable-5-1 | 4 | 184 | $0.01314 | 4.7 |  |
| 2026-10-24 06:26 | 851 | check arm 1 fable–fable #2 m30 | claude-haiku-5-5 | 335 | 58 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 852 | subject arm 1 opus–opus #2 B m50 | claude-opus-5-5 | 4 | 36 | $0.00615 | 2.4 |  |
| 2026-10-24 06:26 | 853 | check arm 1 opus–opus #2 m50 | claude-haiku-5-5 | 358 | 64 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 854 | subject arm 1 sonnet–sonnet #2 A m49 | claude-sonnet-5-5 | 4 | 8 | $0.00129 | 0.7 |  |
| 2026-10-24 06:26 | 855 | check arm 1 sonnet–sonnet #2 m49 | claude-haiku-5-5 | 331 | 48 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 856 | subject arm 1 opus–opus #2 A m51 | claude-opus-5-5 | 4 | 48 | $0.00619 | 1.6 |  |
| 2026-10-24 06:26 | 857 | check arm 1 opus–opus #2 m51 | claude-haiku-5-5 | 337 | 43 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 858 | subject arm 1 fable–fable #2 A m31 | claude-fable-5-1 | 4 | 172 | $0.01209 | 3.7 |  |
| 2026-10-24 06:26 | 859 | subject arm 1 sonnet–sonnet #2 B m50 | claude-sonnet-5-5 | 4 | 38 | $0.00159 | 1.2 |  |
| 2026-10-24 06:26 | 860 | check arm 1 fable–fable #2 m31 | claude-haiku-5-5 | 348 | 73 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 861 | check arm 1 sonnet–sonnet #2 m50 | claude-haiku-5-5 | 361 | 59 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 862 | subject arm 1 opus–opus #2 B m52 | claude-opus-5-5 | 4 | 47 | $0.00608 | 1.5 |  |
| 2026-10-24 06:26 | 863 | subject arm 1 sonnet–sonnet #2 A m51 | claude-sonnet-5-5 | 4 | 18 | $0.00146 | 0.9 |  |
| 2026-10-24 06:26 | 864 | check arm 1 opus–opus #2 m52 | claude-haiku-5-5 | 337 | 43 | $0.00006 | 1.2 |  |
| 2026-10-24 06:26 | 865 | check arm 1 sonnet–sonnet #2 m51 | claude-haiku-5-5 | 371 | 54 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 866 | subject arm 1 fable–fable #2 B m32 | claude-fable-5-1 | 4 | 167 | $0.01200 | 3.5 |  |
| 2026-10-24 06:26 | 867 | check arm 1 fable–fable #2 m32 | claude-haiku-5-5 | 344 | 57 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 868 | subject arm 1 opus–opus #2 A m53 | claude-opus-5-5 | 4 | 36 | $0.00586 | 1.4 |  |
| 2026-10-24 06:26 | 869 | subject arm 1 sonnet–sonnet #2 B m52 | claude-sonnet-5-5 | 4 | 8 | $0.00139 | 0.9 |  |
| 2026-10-24 06:26 | 870 | check arm 1 opus–opus #2 m53 | claude-haiku-5-5 | 337 | 43 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 871 | check arm 1 sonnet–sonnet #2 m52 | claude-haiku-5-5 | 341 | 50 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 872 | subject arm 1 sonnet–sonnet #2 A m53 | claude-sonnet-5-5 | 4 | 8 | $0.00132 | 0.6 |  |
| 2026-10-24 06:26 | 873 | check arm 1 sonnet–sonnet #2 m53 | claude-haiku-5-5 | 331 | 52 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 874 | subject arm 1 fable–fable #2 A m33 | claude-fable-5-1 | 4 | 135 | $0.01036 | 3.8 |  |
| 2026-10-24 06:26 | 875 | subject arm 1 opus–opus #2 B m54 | claude-opus-5-5 | 4 | 122 | $0.00758 | 2.4 |  |
| 2026-10-24 06:26 | 876 | check arm 1 fable–fable #2 m33 | claude-haiku-5-5 | 333 | 46 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 877 | check arm 1 opus–opus #2 m54 | claude-haiku-5-5 | 337 | 43 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 878 | subject arm 1 sonnet–sonnet #2 B m54 | claude-sonnet-5-5 | 4 | 8 | $0.00130 | 0.9 |  |
| 2026-10-24 06:26 | 879 | check arm 1 sonnet–sonnet #2 m54 | claude-haiku-5-5 | 331 | 55 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 880 | subject arm 1 opus–opus #2 A m55 | claude-opus-5-5 | 4 | 48 | $0.00610 | 1.6 |  |
| 2026-10-24 06:26 | 881 | check arm 1 opus–opus #2 m55 | claude-haiku-5-5 | 337 | 42 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 882 | subject arm 1 sonnet–sonnet #2 A m55 | claude-sonnet-5-5 | 4 | 8 | $0.00130 | 0.7 |  |
| 2026-10-24 06:26 | 883 | subject arm 1 fable–fable #2 B m34 | claude-fable-5-1 | 4 | 187 | $0.01283 | 4.2 |  |
| 2026-10-24 06:26 | 884 | check arm 1 sonnet–sonnet #2 m55 | claude-haiku-5-5 | 331 | 48 | $0.00006 | 1.1 |  |
| 2026-10-24 06:26 | 885 | check arm 1 fable–fable #2 m34 | claude-haiku-5-5 | 337 | 50 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 886 | subject arm 1 opus–opus #2 B m56 | claude-opus-5-5 | 4 | 101 | $0.00716 | 2 |  |
| 2026-10-24 06:26 | 887 | check arm 1 opus–opus #2 m56 | claude-haiku-5-5 | 337 | 43 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 888 | subject arm 1 sonnet–sonnet #2 B m56 | claude-sonnet-5-5 | 4 | 71 | $0.00194 | 1.3 |  |
| 2026-10-24 06:26 | 889 | check arm 1 sonnet–sonnet #2 m56 | claude-haiku-5-5 | 394 | 63 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 890 | subject arm 1 opus–opus #2 A m57 | claude-opus-5-5 | 4 | 56 | $0.00627 | 1.3 |  |
| 2026-10-24 06:26 | 891 | subject arm 1 fable–fable #2 A m35 | claude-fable-5-1 | 4 | 163 | $0.01168 | 4.1 |  |
| 2026-10-24 06:26 | 892 | subject arm 1 sonnet–sonnet #2 A m57 | claude-sonnet-5-5 | 4 | 30 | $0.00168 | 1.1 |  |
| 2026-10-24 06:26 | 893 | check arm 1 fable–fable #2 m35 | claude-haiku-5-5 | 344 | 66 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 894 | check arm 1 sonnet–sonnet #2 m57 | claude-haiku-5-5 | 416 | 61 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 895 | check arm 1 opus–opus #2 m57 | claude-haiku-5-5 | 337 | 43 | $0.00006 | 1.5 |  |
| 2026-10-24 06:26 | 896 | subject arm 1 opus–opus #2 B m58 | claude-opus-5-5 | 4 | 67 | $0.00649 | 2 |  |
| 2026-10-24 06:26 | 897 | subject arm 1 sonnet–sonnet #2 B m58 | claude-sonnet-5-5 | 4 | 12 | $0.00156 | 2.1 |  |
| 2026-10-24 06:26 | 898 | check arm 1 opus–opus #2 m58 | claude-haiku-5-5 | 337 | 43 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 899 | check arm 1 sonnet–sonnet #2 m58 | claude-haiku-5-5 | 357 | 56 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 900 | subject arm 1 sonnet–sonnet #2 A m59 | claude-sonnet-5-5 | 4 | 6 | $0.00137 | 0.8 |  |
| 2026-10-24 06:26 | 901 | subject arm 1 opus–opus #2 A m59 | claude-opus-5-5 | 4 | 54 | $0.00623 | 1.6 |  |
| 2026-10-24 06:26 | 902 | check arm 1 opus–opus #2 m59 | claude-haiku-5-5 | 337 | 43 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 903 | check arm 1 sonnet–sonnet #2 m59 | claude-haiku-5-5 | 333 | 56 | $0.00006 | 1 |  |
| 2026-10-24 06:26 | 904 | subject arm 1 fable–fable #2 B m36 | claude-fable-5-1 | 4 | 437 | $0.02547 | 9.6 |  |
| 2026-10-24 06:26 | 905 | subject arm 1 sonnet–sonnet #2 B m60 | claude-sonnet-5-5 | 4 | 6 | $0.00131 | 0.9 |  |
| 2026-10-24 06:26 | 906 | check arm 1 fable–fable #2 m36 | claude-haiku-5-5 | 426 | 69 | $0.00008 | 0.7 |  |
| 2026-10-24 06:26 | 907 | check arm 1 sonnet–sonnet #2 m60 | claude-haiku-5-5 | 327 | 56 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 908 | subject arm 1 opus–opus #2 B m60 | claude-opus-5-5 | 4 | 84 | $0.00683 | 1.8 |  |
| 2026-10-24 06:26 | 909 | check arm 1 opus–opus #2 m60 | claude-haiku-5-5 | 337 | 43 | $0.00006 | 1 |  |
| 2026-10-24 06:26 | 910 | tags 1 arm 1 sonnet–sonnet #2 m1–10 | claude-haiku-5-5 | 4743 | 680 | $0.00081 | 2.3 |  |
| 2026-10-24 06:26 | 911 | tags 1 arm 1 sonnet–sonnet #2 m11–20 | claude-haiku-5-5 | 2846 | 680 | $0.00062 | 2.3 |  |
| 2026-10-24 06:26 | 912 | tags 2 arm 1 sonnet–sonnet #2 m1–10 | claude-haiku-5-5 | 4743 | 680 | $0.00081 | 2.4 |  |
| 2026-10-24 06:26 | 913 | subject arm 1 fable–fable #2 A m37 | claude-fable-5-1 | 4 | 152 | $0.01224 | 4.5 |  |
| 2026-10-24 06:26 | 914 | subject arm 1 sonnet–sonnet #3 A m1 | claude-sonnet-5-5 | 40 | 328 | $0.00336 | 3.9 |  |
| 2026-10-24 06:26 | 915 | check arm 1 fable–fable #2 m37 | claude-haiku-5-5 | 454 | 61 | $0.00008 | 1.1 |  |
| 2026-10-24 06:26 | 916 | tags 2 arm 1 sonnet–sonnet #2 m11–20 | claude-haiku-5-5 | 2846 | 680 | $0.00062 | 2.2 |  |
| 2026-10-24 06:26 | 917 | tags 2 arm 1 sonnet–sonnet #2 m21–30 | claude-haiku-5-5 | 1651 | 680 | $0.00051 | 2.2 |  |
| 2026-10-24 06:26 | 918 | tags 1 arm 1 sonnet–sonnet #2 m21–30 | claude-haiku-5-5 | 1651 | 680 | $0.00051 | 2.2 |  |
| 2026-10-24 06:26 | 919 | check arm 1 sonnet–sonnet #3 m1 | claude-haiku-5-5 | 580 | 63 | $0.00009 | 0.7 |  |
| 2026-10-24 06:26 | 920 | subject arm 1 fable–fable #2 B m38 | claude-fable-5-1 | 4 | 5 | $0.00525 | 1.5 |  |
| 2026-10-24 06:26 | 921 | check arm 1 fable–fable #2 m38 | claude-haiku-5-5 | 370 | 58 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 922 | subject arm 1 fable–fable #3 A m1 | claude-fable-5-1 | 40 | 508 | $0.02580 | 9.6 |  |
| 2026-10-24 06:26 | 923 | tags 1 arm 1 sonnet–sonnet #2 m41–50 | claude-haiku-5-5 | 1191 | 680 | $0.00046 | 2.1 |  |
| 2026-10-24 06:26 | 924 | tags 1 arm 1 sonnet–sonnet #2 m31–40 | claude-haiku-5-5 | 1233 | 680 | $0.00046 | 2.3 |  |
| 2026-10-24 06:26 | 925 | check arm 1 fable–fable #3 m1 | claude-haiku-5-5 | 746 | 53 | $0.00010 | 0.8 |  |
| 2026-10-24 06:26 | 926 | tags 2 arm 1 sonnet–sonnet #2 m31–40 | claude-haiku-5-5 | 1233 | 680 | $0.00046 | 2.3 |  |
| 2026-10-24 06:26 | 927 | subject arm 1 fable–fable #2 A m39 | claude-fable-5-1 | 4 | 16 | $0.00477 | 1.7 |  |
| 2026-10-24 06:26 | 928 | subject arm 1 sonnet–sonnet #3 B m2 | claude-sonnet-5-5 | 292 | 433 | $0.00491 | 5.2 |  |
| 2026-10-24 06:26 | 929 | check arm 1 fable–fable #2 m39 | claude-haiku-5-5 | 336 | 51 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 930 | check arm 1 sonnet–sonnet #3 m2 | claude-haiku-5-5 | 1002 | 84 | $0.00014 | 1.1 |  |
| 2026-10-24 06:26 | 931 | tags 2 arm 1 sonnet–sonnet #2 m41–50 | claude-haiku-5-5 | 1191 | 680 | $0.00046 | 2.8 |  |
| 2026-10-24 06:26 | 932 | tags 1 arm 1 sonnet–sonnet #2 m51–60 | claude-haiku-5-5 | 1268 | 680 | $0.00047 | 2.9 |  |
| 2026-10-24 06:26 | 933 | tags 2 arm 1 sonnet–sonnet #2 m51–60 | claude-haiku-5-5 | 1268 | 680 | $0.00047 | 2.9 |  |
| 2026-10-24 06:26 | 934 | subject arm 1 fable–fable #2 B m40 | claude-fable-5-1 | 4 | 116 | $0.00936 | 2.7 |  |
| 2026-10-24 06:26 | 935 | check arm 1 fable–fable #2 m40 | claude-haiku-5-5 | 347 | 60 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 936 | tags 1 arm 1 opus–opus #2 m1–10 | claude-haiku-5-5 | 9806 | 680 | $0.00132 | 2.3 |  |
| 2026-10-24 06:26 | 937 | tags 2 arm 1 opus–opus #2 m1–10 | claude-haiku-5-5 | 9806 | 680 | $0.00132 | 2.5 |  |
| 2026-10-24 06:26 | 938 | tags 1 arm 1 opus–opus #2 m11–20 | claude-haiku-5-5 | 10895 | 680 | $0.00143 | 2.7 |  |
| 2026-10-24 06:26 | 939 | subject arm 1 sonnet–sonnet #3 A m3 | claude-sonnet-5-5 | 4 | 660 | $0.00842 | 7.7 |  |
| 2026-10-24 06:26 | 940 | check arm 1 sonnet–sonnet #3 m3 | claude-haiku-5-5 | 1408 | 71 | $0.00018 | 0.9 |  |
| 2026-10-24 06:26 | 941 | subject arm 1 fable–fable #2 A m41 | claude-fable-5-1 | 4 | 157 | $0.01155 | 3.8 |  |
| 2026-10-24 06:26 | 942 | check arm 1 fable–fable #2 m41 | claude-haiku-5-5 | 338 | 54 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 943 | tags 2 arm 1 opus–opus #2 m11–20 | claude-haiku-5-5 | 10895 | 680 | $0.00143 | 2.3 |  |
| 2026-10-24 06:26 | 944 | tags 1 arm 1 opus–opus #2 m21–30 | claude-haiku-5-5 | 9254 | 680 | $0.00127 | 2.4 |  |
| 2026-10-24 06:26 | 945 | tags 2 arm 1 opus–opus #2 m21–30 | claude-haiku-5-5 | 9254 | 680 | $0.00127 | 2.4 |  |
| 2026-10-24 06:26 | 946 | subject arm 1 fable–fable #2 B m42 | claude-fable-5-1 | 4 | 101 | $0.00864 | 2.7 |  |
| 2026-10-24 06:26 | 947 | check arm 1 fable–fable #2 m42 | claude-haiku-5-5 | 329 | 54 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 948 | tags 1 arm 1 opus–opus #2 m31–40 | claude-haiku-5-5 | 1542 | 680 | $0.00049 | 2.4 |  |
| 2026-10-24 06:26 | 949 | tags 2 arm 1 opus–opus #2 m31–40 | claude-haiku-5-5 | 1542 | 680 | $0.00049 | 2.4 |  |
| 2026-10-24 06:26 | 950 | subject arm 1 sonnet–sonnet #3 B m4 | claude-sonnet-5-5 | 4 | 550 | $0.00896 | 6.9 |  |
| 2026-10-24 06:26 | 951 | check arm 1 sonnet–sonnet #3 m4 | claude-haiku-5-5 | 1525 | 72 | $0.00019 | 0.9 |  |
| 2026-10-24 06:26 | 952 | tags 1 arm 1 opus–opus #2 m41–50 | claude-haiku-5-5 | 1317 | 1144 | $0.00070 | 4.2 |  |
| 2026-10-24 06:26 | 953 | subject arm 1 fable–fable #3 B m2 | claude-fable-5-1 | 458 | 1111 | $0.06013 | 22.2 |  |
| 2026-10-24 06:26 | 954 | check arm 1 fable–fable #3 m2 | claude-haiku-5-5 | 1745 | 82 | $0.00022 | 0.9 |  |
| 2026-10-24 06:26 | 955 | tags 1 arm 1 opus–opus #2 m51–60 | claude-haiku-5-5 | 1176 | 680 | $0.00046 | 2.3 |  |
| 2026-10-24 06:26 | 956 | tags 2 arm 1 opus–opus #2 m41–50 | claude-haiku-5-5 | 1317 | 1140 | $0.00070 | 4.5 |  |
| 2026-10-24 06:26 | 957 | tags 2 arm 1 opus–opus #2 m51–60 | claude-haiku-5-5 | 1176 | 680 | $0.00046 | 2.2 |  |
| 2026-10-24 06:26 | 958 | subject arm 1 fable–fable #2 A m43 | claude-fable-5-1 | 4 | 261 | $0.01653 | 6.2 |  |
| 2026-10-24 06:26 | 959 | check arm 1 fable–fable #2 m43 | claude-haiku-5-5 | 353 | 63 | $0.00007 | 1.4 |  |
| 2026-10-24 06:26 | 960 | tags referee arm 1 sonnet–sonnet #2 m1–10 | claude-opus-5-5 | 4743 | 680 | $0.03257 | 5.2 |  |
| 2026-10-24 06:26 | 961 | subject arm 1 sonnet–sonnet #3 A m5 | claude-sonnet-5-5 | 4 | 800 | $0.01118 | 9.5 |  |
| 2026-10-24 06:26 | 962 | subject arm 1 fable–fable #2 B m44 | claude-fable-5-1 | 4 | 95 | $0.00853 | 3 |  |
| 2026-10-24 06:26 | 963 | check arm 1 fable–fable #2 m44 | claude-haiku-5-5 | 363 | 52 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 964 | tags referee arm 1 sonnet–sonnet #2 m51–60 | claude-opus-5-5 | 1268 | 680 | $0.01867 | 5.1 |  |
| 2026-10-24 06:26 | 965 | check arm 1 sonnet–sonnet #3 m5 | claude-haiku-5-5 | 1665 | 81 | $0.00021 | 1.5 |  |
| 2026-10-24 06:26 | 966 | tags referee arm 1 opus–opus #2 m11–20 | claude-opus-5-5 | 10895 | 849 | $0.06056 | 6.6 |  |
| 2026-10-24 06:26 | 967 | subject arm 1 fable–fable #2 A m45 | claude-fable-5-1 | 4 | 64 | $0.00711 | 2.2 |  |
| 2026-10-24 06:26 | 968 | check arm 1 fable–fable #2 m45 | claude-haiku-5-5 | 343 | 62 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 969 | subject arm 1 fable–fable #2 B m46 | claude-fable-5-1 | 4 | 137 | $0.01052 | 2.7 |  |
| 2026-10-24 06:26 | 970 | check arm 1 fable–fable #2 m46 | claude-haiku-5-5 | 336 | 52 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 971 | subject arm 1 sonnet–sonnet #3 B m6 | claude-sonnet-5-5 | 4 | 767 | $0.01133 | 9.4 |  |
| 2026-10-24 06:26 | 972 | check arm 1 sonnet–sonnet #3 m6 | claude-haiku-5-5 | 1882 | 69 | $0.00022 | 0.9 |  |
| 2026-10-24 06:26 | 973 | subject arm 1 fable–fable #2 A m47 | claude-fable-5-1 | 4 | 72 | $0.00718 | 2.3 |  |
| 2026-10-24 06:26 | 974 | check arm 1 fable–fable #2 m47 | claude-haiku-5-5 | 335 | 56 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 975 | subject arm 1 fable–fable #3 A m3 | claude-fable-5-1 | 4 | 1624 | $0.09957 | 31.7 |  |
| 2026-10-24 06:26 | 976 | subject arm 1 fable–fable #2 B m48 | claude-fable-5-1 | 4 | 179 | $0.01252 | 4.4 |  |
| 2026-10-24 06:26 | 977 | check arm 1 fable–fable #3 m3 | claude-haiku-5-5 | 2359 | 71 | $0.00027 | 0.7 |  |
| 2026-10-24 06:26 | 978 | subject arm 1 sonnet–sonnet #3 A m7 | claude-sonnet-5-5 | 4 | 701 | $0.01132 | 8.6 |  |
| 2026-10-24 06:26 | 979 | check arm 1 fable–fable #2 m48 | claude-haiku-5-5 | 330 | 45 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 980 | check arm 1 sonnet–sonnet #3 m7 | claude-haiku-5-5 | 1783 | 80 | $0.00022 | 1.2 |  |
| 2026-10-24 06:26 | 981 | subject arm 1 fable–fable #2 A m49 | claude-fable-5-1 | 4 | 28 | $0.00491 | 1.8 |  |
| 2026-10-24 06:26 | 982 | check arm 1 fable–fable #2 m49 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 983 | subject arm 1 fable–fable #2 B m50 | claude-fable-5-1 | 4 | 185 | $0.01270 | 3.7 |  |
| 2026-10-24 06:26 | 984 | subject arm 1 sonnet–sonnet #3 B m8 | claude-sonnet-5-5 | 4 | 752 | $0.01174 | 9 |  |
| 2026-10-24 06:26 | 985 | check arm 1 fable–fable #2 m50 | claude-haiku-5-5 | 325 | 47 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 986 | check arm 1 sonnet–sonnet #3 m8 | claude-haiku-5-5 | 1696 | 70 | $0.00020 | 1 |  |
| 2026-10-24 06:26 | 987 | subject arm 1 fable–fable #2 A m51 | claude-fable-5-1 | 4 | 103 | $0.00861 | 2.8 |  |
| 2026-10-24 06:26 | 988 | check arm 1 fable–fable #2 m51 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 989 | subject arm 1 fable–fable #2 B m52 | claude-fable-5-1 | 4 | 87 | $0.00781 | 2.9 |  |
| 2026-10-24 06:26 | 990 | subject arm 1 sonnet–sonnet #3 A m9 | claude-sonnet-5-5 | 4 | 711 | $0.01127 | 8.6 |  |
| 2026-10-24 06:26 | 991 | check arm 1 fable–fable #2 m52 | claude-haiku-5-5 | 325 | 44 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 992 | check arm 1 sonnet–sonnet #3 m9 | claude-haiku-5-5 | 1706 | 78 | $0.00021 | 0.9 |  |
| 2026-10-24 06:26 | 993 | subject arm 1 fable–fable #2 A m53 | claude-fable-5-1 | 4 | 135 | $0.01021 | 3.3 |  |
| 2026-10-24 06:26 | 994 | check arm 1 fable–fable #2 m53 | claude-haiku-5-5 | 325 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 995 | subject arm 1 sonnet–sonnet #3 B m10 | claude-sonnet-5-5 | 4 | 689 | $0.01122 | 8.5 |  |
| 2026-10-24 06:26 | 996 | subject arm 1 fable–fable #3 B m4 | claude-fable-5-1 | 4 | 1781 | $0.12032 | 33.4 |  |
| 2026-10-24 06:26 | 997 | subject arm 1 fable–fable #2 B m54 | claude-fable-5-1 | 4 | 133 | $0.01011 | 3.5 |  |
| 2026-10-24 06:26 | 998 | check arm 1 sonnet–sonnet #3 m10 | claude-haiku-5-5 | 1715 | 72 | $0.00021 | 1 |  |
| 2026-10-24 06:26 | 999 | check arm 1 fable–fable #2 m54 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 1 |  |
| 2026-10-24 06:26 | 1000 | check arm 1 fable–fable #3 m4 | claude-haiku-5-5 | 2212 | 66 | $0.00025 | 1.7 |  |
| 2026-10-24 06:26 | 1001 | subject arm 1 fable–fable #2 A m55 | claude-fable-5-1 | 4 | 113 | $0.00911 | 3 |  |
| 2026-10-24 06:26 | 1002 | check arm 1 fable–fable #2 m55 | claude-haiku-5-5 | 325 | 45 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 1003 | subject arm 1 sonnet–sonnet #3 A m11 | claude-sonnet-5-5 | 4 | 787 | $0.01235 | 9.4 |  |
| 2026-10-24 06:26 | 1004 | subject arm 1 fable–fable #2 B m56 | claude-fable-5-1 | 4 | 174 | $0.01216 | 4 |  |
| 2026-10-24 06:26 | 1005 | check arm 1 sonnet–sonnet #3 m11 | claude-haiku-5-5 | 1791 | 89 | $0.00022 | 1.5 |  |
| 2026-10-24 06:26 | 1006 | check arm 1 fable–fable #2 m56 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 1007 | subject arm 1 fable–fable #2 A m57 | claude-fable-5-1 | 4 | 84 | $0.00766 | 2.5 |  |
| 2026-10-24 06:26 | 1008 | check arm 1 fable–fable #2 m57 | claude-haiku-5-5 | 325 | 57 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 1009 | subject arm 1 fable–fable #2 B m58 | claude-fable-5-1 | 4 | 69 | $0.00691 | 2.5 |  |
| 2026-10-24 06:26 | 1010 | check arm 1 fable–fable #2 m58 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 1011 | subject arm 1 sonnet–sonnet #3 B m12 | claude-sonnet-5-5 | 4 | 1074 | $0.01556 | 12.9 |  |
| 2026-10-24 06:26 | 1012 | check arm 1 sonnet–sonnet #3 m12 | claude-haiku-5-5 | 2176 | 99 | $0.00027 | 1.1 |  |
| 2026-10-24 06:26 | 1013 | subject arm 1 fable–fable #3 A m5 | claude-fable-5-1 | 4 | 1334 | $0.09082 | 26.5 |  |
| 2026-10-24 06:26 | 1014 | check arm 1 fable–fable #3 m5 | claude-haiku-5-5 | 1830 | 66 | $0.00022 | 1.1 |  |
| 2026-10-24 06:26 | 1015 | subject arm 1 fable–fable #2 A m59 | claude-fable-5-1 | 4 | 242 | $0.01557 | 4.8 |  |
| 2026-10-24 06:26 | 1016 | check arm 1 fable–fable #2 m59 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 1017 | subject arm 1 sonnet–sonnet #3 A m13 | claude-sonnet-5-5 | 4 | 1265 | $0.01857 | 14.5 |  |
| 2026-10-24 06:26 | 1018 | check arm 1 sonnet–sonnet #3 m13 | claude-haiku-5-5 | 2073 | 71 | $0.00024 | 0.9 |  |
| 2026-10-24 06:26 | 1019 | subject arm 1 fable–fable #2 B m60 | claude-fable-5-1 | 4 | 560 | $0.03147 | 11.8 |  |
| 2026-10-24 06:26 | 1020 | check arm 1 fable–fable #2 m60 | claude-haiku-5-5 | 726 | 74 | $0.00011 | 1.7 |  |
| 2026-10-24 06:26 | 1021 | tags 1 arm 1 fable–fable #2 m1–10 | claude-haiku-5-5 | 10378 | 680 | $0.00138 | 2.2 |  |
| 2026-10-24 06:26 | 1022 | tags 1 arm 1 fable–fable #2 m11–20 | claude-haiku-5-5 | 5449 | 680 | $0.00088 | 2.2 |  |
| 2026-10-24 06:26 | 1023 | tags 2 arm 1 fable–fable #2 m1–10 | claude-haiku-5-5 | 10378 | 680 | $0.00138 | 2.4 |  |
| 2026-10-24 06:26 | 1024 | tags 2 arm 1 fable–fable #2 m21–30 | claude-haiku-5-5 | 1391 | 680 | $0.00048 | 2.2 |  |
| 2026-10-24 06:26 | 1025 | subject arm 1 sonnet–sonnet #3 B m14 | claude-sonnet-5-5 | 4 | 673 | $0.01255 | 8.2 |  |
| 2026-10-24 06:26 | 1026 | tags 2 arm 1 fable–fable #2 m11–20 | claude-haiku-5-5 | 5449 | 680 | $0.00088 | 2.9 |  |
| 2026-10-24 06:26 | 1027 | tags 1 arm 1 fable–fable #2 m21–30 | claude-haiku-5-5 | 1391 | 680 | $0.00048 | 3.1 |  |
| 2026-10-24 06:26 | 1028 | check arm 1 sonnet–sonnet #3 m14 | claude-haiku-5-5 | 1672 | 74 | $0.00020 | 0.8 |  |
| 2026-10-24 06:26 | 1029 | subject arm 1 opus–opus #3 A m1 | claude-opus-5-5 | 40 | 606 | $0.01228 | 8.3 |  |
| 2026-10-24 06:26 | 1030 | check arm 1 opus–opus #3 m1 | claude-haiku-5-5 | 863 | 60 | $0.00012 | 0.8 |  |
| 2026-10-24 06:26 | 1031 | subject arm 1 fable–fable #3 B m6 | claude-fable-5-1 | 4 | 1380 | $0.08860 | 27.1 |  |
| 2026-10-24 06:26 | 1032 | check arm 1 fable–fable #3 m6 | claude-haiku-5-5 | 1705 | 80 | $0.00021 | 0.9 |  |
| 2026-10-24 06:26 | 1033 | tags 1 arm 1 fable–fable #2 m31–40 | claude-haiku-5-5 | 1311 | 680 | $0.00047 | 2.2 |  |
| 2026-10-24 06:26 | 1034 | tags 1 arm 1 fable–fable #2 m41–50 | claude-haiku-5-5 | 1179 | 680 | $0.00046 | 2.1 |  |
| 2026-10-24 06:26 | 1035 | tags 2 arm 1 fable–fable #2 m31–40 | claude-haiku-5-5 | 1311 | 1060 | $0.00066 | 3.7 |  |
| 2026-10-24 06:26 | 1036 | tags 2 arm 1 fable–fable #2 m41–50 | claude-haiku-5-5 | 1179 | 680 | $0.00046 | 2.1 |  |
| 2026-10-24 06:26 | 1037 | subject arm 1 sonnet–sonnet #3 A m15 | claude-sonnet-5-5 | 4 | 710 | $0.01213 | 8.2 |  |
| 2026-10-24 06:26 | 1038 | check arm 1 sonnet–sonnet #3 m15 | claude-haiku-5-5 | 1698 | 73 | $0.00021 | 0.9 |  |
| 2026-10-24 06:26 | 1039 | tags 1 arm 1 fable–fable #2 m51–60 | claude-haiku-5-5 | 1511 | 1009 | $0.00066 | 4 |  |
| 2026-10-24 06:26 | 1040 | tags 2 arm 1 fable–fable #2 m51–60 | claude-haiku-5-5 | 1511 | 1041 | $0.00067 | 4 |  |
| 2026-10-24 06:26 | 1041 | tags referee arm 1 fable–fable #2 m11–20 | claude-opus-5-5 | 5449 | 680 | $0.03540 | 5.3 |  |
| 2026-10-24 06:26 | 1042 | tags referee arm 1 fable–fable #2 m21–30 | claude-opus-5-5 | 1391 | 680 | $0.01916 | 5.4 |  |
| 2026-10-24 06:26 | 1043 | subject arm 1 opus–opus #3 B m2 | claude-opus-5-5 | 4 | 1329 | $0.02945 | 18 |  |
| 2026-10-24 06:26 | 1044 | subject arm 1 sonnet–sonnet #3 B m16 | claude-sonnet-5-5 | 4 | 633 | $0.01156 | 8.4 |  |
| 2026-10-24 06:26 | 1045 | check arm 1 opus–opus #3 m2 | claude-haiku-5-5 | 1718 | 60 | $0.00020 | 0.8 |  |
| 2026-10-24 06:26 | 1046 | check arm 1 sonnet–sonnet #3 m16 | claude-haiku-5-5 | 1658 | 71 | $0.00020 | 0.7 |  |
| 2026-10-24 06:26 | 1047 | tags referee arm 1 fable–fable #2 m31–40 | claude-opus-5-5 | 1311 | 680 | $0.01884 | 6.7 |  |
| 2026-10-24 06:26 | 1048 | tags referee arm 1 fable–fable #2 m51–60 | claude-opus-5-5 | 1511 | 849 | $0.02302 | 7.3 |  |
| 2026-10-24 06:26 | 1049 | subject arm 1 fable–fable #3 A m7 | claude-fable-5-1 | 4 | 1517 | $0.09411 | 26.5 |  |
| 2026-10-24 06:26 | 1050 | check arm 1 fable–fable #3 m7 | claude-haiku-5-5 | 1770 | 93 | $0.00022 | 0.9 |  |
| 2026-10-24 06:26 | 1051 | subject arm 1 sonnet–sonnet #3 A m17 | claude-sonnet-5-5 | 4 | 1195 | $0.01722 | 13.2 |  |
| 2026-10-24 06:26 | 1052 | check arm 1 sonnet–sonnet #3 m17 | claude-haiku-5-5 | 2143 | 87 | $0.00026 | 0.9 |  |
| 2026-10-24 06:26 | 1053 | subject arm 1 opus–opus #3 A m3 | claude-opus-5-5 | 4 | 2337 | $0.05395 | 26.3 |  |
| 2026-10-24 06:26 | 1054 | check arm 1 opus–opus #3 m3 | claude-haiku-5-5 | 2508 | 68 | $0.00028 | 1.1 |  |
| 2026-10-24 06:26 | 1055 | subject arm 1 sonnet–sonnet #3 B m18 | claude-sonnet-5-5 | 4 | 1279 | $0.01941 | 13.8 |  |
| 2026-10-24 06:26 | 1056 | check arm 1 sonnet–sonnet #3 m18 | claude-haiku-5-5 | 2121 | 67 | $0.00025 | 0.7 |  |
| 2026-10-24 06:26 | 1057 | subject arm 1 sonnet–sonnet #3 A m19 | claude-sonnet-5-5 | 4 | 677 | $0.01346 | 8.3 |  |
| 2026-10-24 06:26 | 1058 | check arm 1 sonnet–sonnet #3 m19 | claude-haiku-5-5 | 1603 | 67 | $0.00019 | 0.8 |  |
| 2026-10-24 06:26 | 1059 | subject arm 1 fable–fable #3 B m8 | claude-fable-5-1 | 4 | 2040 | $0.12123 | 36.8 |  |
| 2026-10-24 06:26 | 1060 | check arm 1 fable–fable #3 m8 | claude-haiku-5-5 | 1953 | 85 | $0.00024 | 0.8 |  |
| 2026-10-24 06:26 | 1061 | subject arm 1 sonnet–sonnet #3 B m20 | claude-sonnet-5-5 | 4 | 794 | $0.01358 | 9.7 |  |
| 2026-10-24 06:26 | 1062 | check arm 1 sonnet–sonnet #3 m20 | claude-haiku-5-5 | 1786 | 80 | $0.00022 | 0.9 |  |
| 2026-10-24 06:26 | 1063 | subject arm 1 opus–opus #3 B m4 | claude-opus-5-5 | 4 | 2542 | $0.06194 | 29.9 |  |
| 2026-10-24 06:26 | 1064 | check arm 1 opus–opus #3 m4 | claude-haiku-5-5 | 2975 | 59 | $0.00033 | 0.8 |  |
| 2026-10-24 06:26 | 1065 | subject arm 1 sonnet–sonnet #3 A m21 | claude-sonnet-5-5 | 4 | 1172 | $0.01794 | 13.1 |  |
| 2026-10-24 06:26 | 1066 | check arm 1 sonnet–sonnet #3 m21 | claude-haiku-5-5 | 2281 | 91 | $0.00027 | 1.3 |  |
| 2026-10-24 06:26 | 1067 | check referee arm 1 sonnet–sonnet #3 m21 | claude-opus-5-5 | 2281 | 54 | $0.01020 | 2.3 |  |
| 2026-10-24 06:26 | 1068 | subject arm 1 fable–fable #3 A m9 | claude-fable-5-1 | 4 | 1647 | $0.10405 | 33.8 |  |
| 2026-10-24 06:26 | 1069 | check arm 1 fable–fable #3 m9 | claude-haiku-5-5 | 2060 | 79 | $0.00025 | 0.8 |  |
| 2026-10-24 06:26 | 1070 | subject arm 1 sonnet–sonnet #3 B m22 | claude-sonnet-5-5 | 4 | 715 | $0.01474 | 8.4 |  |
| 2026-10-24 06:26 | 1071 | check arm 1 sonnet–sonnet #3 m22 | claude-haiku-5-5 | 2202 | 93 | $0.00027 | 1.1 |  |
| 2026-10-24 06:26 | 1072 | subject arm 1 opus–opus #3 A m5 | claude-opus-5-5 | 4 | 2819 | $0.06998 | 33 |  |
| 2026-10-24 06:26 | 1073 | check arm 1 opus–opus #3 m5 | claude-haiku-5-5 | 3423 | 76 | $0.00038 | 0.8 |  |
| 2026-10-24 06:26 | 1074 | subject arm 1 sonnet–sonnet #3 A m23 | claude-sonnet-5-5 | 4 | 758 | $0.01513 | 8.7 |  |
| 2026-10-24 06:26 | 1075 | check arm 1 sonnet–sonnet #3 m23 | claude-haiku-5-5 | 1788 | 82 | $0.00022 | 0.9 |  |
| 2026-10-24 06:26 | 1076 | subject arm 1 fable–fable #3 B m10 | claude-fable-5-1 | 4 | 905 | $0.06847 | 18.9 |  |
| 2026-10-24 06:26 | 1077 | check arm 1 fable–fable #3 m10 | claude-haiku-5-5 | 1853 | 82 | $0.00023 | 0.9 |  |
| 2026-10-24 06:26 | 1078 | subject arm 1 sonnet–sonnet #3 B m24 | claude-sonnet-5-5 | 4 | 1225 | $0.01900 | 14 |  |
| 2026-10-24 06:26 | 1079 | check arm 1 sonnet–sonnet #3 m24 | claude-haiku-5-5 | 2298 | 87 | $0.00027 | 0.8 |  |
| 2026-10-24 06:26 | 1080 | subject arm 1 fable–fable #3 A m11 | claude-fable-5-1 | 4 | 446 | $0.04316 | 9.8 |  |
| 2026-10-24 06:26 | 1081 | check arm 1 fable–fable #3 m11 | claude-haiku-5-5 | 1431 | 82 | $0.00018 | 0.8 |  |
| 2026-10-24 06:26 | 1082 | subject arm 1 fable–fable #3 B m12 | claude-fable-5-1 | 4 | 177 | $0.02464 | 4.3 |  |
| 2026-10-24 06:26 | 1083 | check arm 1 fable–fable #3 m12 | claude-haiku-5-5 | 793 | 65 | $0.00011 | 1.4 |  |
| 2026-10-24 06:26 | 1084 | subject arm 1 opus–opus #3 B m6 | claude-opus-5-5 | 4 | 2698 | $0.07007 | 32.5 |  |
| 2026-10-24 06:26 | 1085 | subject arm 1 fable–fable #3 A m13 | claude-fable-5-1 | 4 | 69 | $0.01145 | 2.1 |  |
| 2026-10-24 06:26 | 1086 | check arm 1 fable–fable #3 m13 | claude-haiku-5-5 | 403 | 54 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 1087 | check arm 1 opus–opus #3 m6 | claude-haiku-5-5 | 3863 | 75 | $0.00042 | 1.4 |  |
| 2026-10-24 06:26 | 1088 | subject arm 1 sonnet–sonnet #3 A m25 | claude-sonnet-5-5 | 4 | 1350 | $0.02167 | 15.7 |  |
| 2026-10-24 06:26 | 1089 | check arm 1 sonnet–sonnet #3 m25 | claude-haiku-5-5 | 2341 | 69 | $0.00027 | 0.9 |  |
| 2026-10-24 06:26 | 1090 | subject arm 1 fable–fable #3 B m14 | claude-fable-5-1 | 4 | 7 | $0.00357 | 1.4 |  |
| 2026-10-24 06:26 | 1091 | check arm 1 fable–fable #3 m14 | claude-haiku-5-5 | 334 | 53 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 1092 | subject arm 1 fable–fable #3 A m15 | claude-fable-5-1 | 4 | 16 | $0.00318 | 1.8 |  |
| 2026-10-24 06:26 | 1093 | check arm 1 fable–fable #3 m15 | claude-haiku-5-5 | 338 | 65 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 1094 | subject arm 1 sonnet–sonnet #3 B m26 | claude-sonnet-5-5 | 4 | 905 | $0.01748 | 10.3 |  |
| 2026-10-24 06:26 | 1095 | subject arm 1 fable–fable #3 B m16 | claude-fable-5-1 | 4 | 101 | $0.00748 | 3 |  |
| 2026-10-24 06:26 | 1096 | check arm 1 fable–fable #3 m16 | claude-haiku-5-5 | 339 | 55 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 1097 | check arm 1 sonnet–sonnet #3 m26 | claude-haiku-5-5 | 2021 | 73 | $0.00024 | 1.8 |  |
| 2026-10-24 06:26 | 1098 | subject arm 1 fable–fable #3 A m17 | claude-fable-5-1 | 4 | 187 | $0.01180 | 4.4 |  |
| 2026-10-24 06:26 | 1099 | check arm 1 fable–fable #3 m17 | claude-haiku-5-5 | 354 | 62 | $0.00007 | 1 |  |
| 2026-10-24 06:26 | 1100 | subject arm 1 fable–fable #3 B m18 | claude-fable-5-1 | 4 | 211 | $0.01319 | 4.3 |  |
| 2026-10-24 06:26 | 1101 | check arm 1 fable–fable #3 m18 | claude-haiku-5-5 | 401 | 74 | $0.00008 | 1.6 |  |
| 2026-10-24 06:26 | 1102 | subject arm 1 opus–opus #3 A m7 | claude-opus-5-5 | 4 | 2684 | $0.07226 | 32.1 |  |
| 2026-10-24 06:26 | 1103 | check arm 1 opus–opus #3 m7 | claude-haiku-5-5 | 3843 | 78 | $0.00042 | 0.8 |  |
| 2026-10-24 06:26 | 1104 | subject arm 1 sonnet–sonnet #3 A m27 | claude-sonnet-5-5 | 4 | 1663 | $0.02450 | 18.8 |  |
| 2026-10-24 06:26 | 1105 | subject arm 1 fable–fable #3 A m19 | claude-fable-5-1 | 4 | 160 | $0.01123 | 4.5 |  |
| 2026-10-24 06:26 | 1106 | check arm 1 sonnet–sonnet #3 m27 | claude-haiku-5-5 | 2883 | 160 | $0.00037 | 1.3 |  |
| 2026-10-24 06:26 | 1107 | check arm 1 fable–fable #3 m19 | claude-haiku-5-5 | 383 | 60 | $0.00007 | 1 |  |
| 2026-10-24 06:26 | 1108 | subject arm 1 fable–fable #3 B m20 | claude-fable-5-1 | 4 | 217 | $0.01386 | 4.2 |  |
| 2026-10-24 06:26 | 1109 | check arm 1 fable–fable #3 m20 | claude-haiku-5-5 | 335 | 57 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 1110 | subject arm 1 fable–fable #3 A m21 | claude-fable-5-1 | 4 | 299 | $0.01737 | 5.5 |  |
| 2026-10-24 06:26 | 1111 | check arm 1 fable–fable #3 m21 | claude-haiku-5-5 | 338 | 57 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 1112 | subject arm 1 fable–fable #3 B m22 | claude-fable-5-1 | 4 | 147 | $0.00981 | 3.4 |  |
| 2026-10-24 06:26 | 1113 | subject arm 1 sonnet–sonnet #3 B m28 | claude-sonnet-5-5 | 4 | 1713 | $0.02732 | 20.1 |  |
| 2026-10-24 06:26 | 1114 | check arm 1 fable–fable #3 m22 | claude-haiku-5-5 | 338 | 68 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 1115 | check arm 1 sonnet–sonnet #3 m28 | claude-haiku-5-5 | 2847 | 90 | $0.00033 | 1 |  |
| 2026-10-24 06:26 | 1116 | subject arm 1 fable–fable #3 A m23 | claude-fable-5-1 | 4 | 228 | $0.01387 | 4.8 |  |
| 2026-10-24 06:26 | 1117 | subject arm 1 opus–opus #3 B m8 | claude-opus-5-5 | 4 | 2303 | $0.06489 | 29.9 |  |
| 2026-10-24 06:26 | 1118 | check arm 1 fable–fable #3 m23 | claude-haiku-5-5 | 343 | 60 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 1119 | check arm 1 opus–opus #3 m8 | claude-haiku-5-5 | 3258 | 71 | $0.00036 | 1.1 |  |
| 2026-10-24 06:26 | 1120 | subject arm 1 fable–fable #3 B m24 | claude-fable-5-1 | 4 | 107 | $0.00788 | 2.8 |  |
| 2026-10-24 06:26 | 1121 | check arm 1 fable–fable #3 m24 | claude-haiku-5-5 | 343 | 57 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 1122 | subject arm 1 fable–fable #3 A m25 | claude-fable-5-1 | 4 | 284 | $0.01673 | 5.5 |  |
| 2026-10-24 06:26 | 1123 | check arm 1 fable–fable #3 m25 | claude-haiku-5-5 | 394 | 57 | $0.00007 | 0.6 |  |
| 2026-10-24 06:26 | 1124 | subject arm 1 sonnet–sonnet #3 A m29 | claude-sonnet-5-5 | 4 | 1711 | $0.02739 | 19.5 |  |
| 2026-10-24 06:26 | 1125 | check arm 1 sonnet–sonnet #3 m29 | claude-haiku-5-5 | 2895 | 81 | $0.00033 | 1.2 |  |
| 2026-10-24 06:26 | 1126 | subject arm 1 fable–fable #3 B m26 | claude-fable-5-1 | 4 | 89 | $0.00763 | 2.6 |  |
| 2026-10-24 06:26 | 1127 | check arm 1 fable–fable #3 m26 | claude-haiku-5-5 | 394 | 68 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 1128 | subject arm 1 fable–fable #3 A m27 | claude-fable-5-1 | 4 | 102 | $0.00828 | 2.3 |  |
| 2026-10-24 06:26 | 1129 | check arm 1 fable–fable #3 m27 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 1130 | subject arm 1 fable–fable #3 B m28 | claude-fable-5-1 | 4 | 81 | $0.00643 | 2.7 |  |
| 2026-10-24 06:26 | 1131 | check arm 1 fable–fable #3 m28 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1132 | subject arm 1 sonnet–sonnet #3 B m30 | claude-sonnet-5-5 | 4 | 1504 | $0.02577 | 16.1 |  |
| 2026-10-24 06:26 | 1133 | check arm 1 sonnet–sonnet #3 m30 | claude-haiku-5-5 | 2673 | 86 | $0.00031 | 0.8 |  |
| 2026-10-24 06:26 | 1134 | subject arm 1 fable–fable #3 A m29 | claude-fable-5-1 | 4 | 117 | $0.00824 | 2.5 |  |
| 2026-10-24 06:26 | 1135 | check arm 1 fable–fable #3 m29 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1136 | subject arm 1 opus–opus #3 A m9 | claude-opus-5-5 | 4 | 2918 | $0.07462 | 34.5 |  |
| 2026-10-24 06:26 | 1137 | check arm 1 opus–opus #3 m9 | claude-haiku-5-5 | 3281 | 65 | $0.00036 | 0.9 |  |
| 2026-10-24 06:26 | 1138 | check referee arm 1 sonnet–sonnet #3 m30 | claude-opus-5-5 | 2673 | 72 | $0.01213 | 2.4 |  |
| 2026-10-24 06:26 | 1139 | subject arm 1 fable–fable #3 B m30 | claude-fable-5-1 | 4 | 68 | $0.00579 | 2 |  |
| 2026-10-24 06:26 | 1140 | check arm 1 fable–fable #3 m30 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.9 |  |
| 2026-10-24 06:26 | 1141 | subject arm 1 fable–fable #3 A m31 | claude-fable-5-1 | 4 | 85 | $0.00664 | 2.1 |  |
| 2026-10-24 06:26 | 1142 | check arm 1 fable–fable #3 m31 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1143 | subject arm 1 fable–fable #3 B m32 | claude-fable-5-1 | 4 | 73 | $0.00604 | 2.4 |  |
| 2026-10-24 06:26 | 1144 | check arm 1 fable–fable #3 m32 | claude-haiku-5-5 | 329 | 42 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 1145 | subject arm 1 sonnet–sonnet #3 A m31 | claude-sonnet-5-5 | 4 | 1517 | $0.02552 | 15.9 |  |
| 2026-10-24 06:26 | 1146 | check arm 1 sonnet–sonnet #3 m31 | claude-haiku-5-5 | 1968 | 77 | $0.00024 | 0.8 |  |
| 2026-10-24 06:26 | 1147 | subject arm 1 fable–fable #3 A m33 | claude-fable-5-1 | 4 | 165 | $0.01064 | 3.6 |  |
| 2026-10-24 06:26 | 1148 | check arm 1 fable–fable #3 m33 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 1149 | subject arm 1 fable–fable #3 B m34 | claude-fable-5-1 | 4 | 95 | $0.00714 | 2.4 |  |
| 2026-10-24 06:26 | 1150 | check arm 1 fable–fable #3 m34 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 1151 | subject arm 1 fable–fable #3 A m35 | claude-fable-5-1 | 4 | 100 | $0.00740 | 2.1 |  |
| 2026-10-24 06:26 | 1152 | subject arm 1 opus–opus #3 B m10 | claude-opus-5-5 | 4 | 2235 | $0.06143 | 28.8 |  |
| 2026-10-24 06:26 | 1153 | check arm 1 fable–fable #3 m35 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.4 |  |
| 2026-10-24 06:26 | 1154 | check arm 1 opus–opus #3 m10 | claude-haiku-5-5 | 3311 | 74 | $0.00037 | 0.8 |  |
| 2026-10-24 06:26 | 1155 | subject arm 1 sonnet–sonnet #3 B m32 | claude-sonnet-5-5 | 4 | 1084 | $0.01977 | 12.8 |  |
| 2026-10-24 06:26 | 1156 | check arm 1 sonnet–sonnet #3 m32 | claude-haiku-5-5 | 2405 | 67 | $0.00027 | 0.8 |  |
| 2026-10-24 06:26 | 1157 | subject arm 1 fable–fable #3 B m36 | claude-fable-5-1 | 4 | 42 | $0.00450 | 1.8 |  |
| 2026-10-24 06:26 | 1158 | check arm 1 fable–fable #3 m36 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 1159 | subject arm 1 fable–fable #3 A m37 | claude-fable-5-1 | 4 | 78 | $0.00630 | 2.2 |  |
| 2026-10-24 06:26 | 1160 | check arm 1 fable–fable #3 m37 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1161 | subject arm 1 fable–fable #3 B m38 | claude-fable-5-1 | 4 | 7 | $0.00275 | 1.4 |  |
| 2026-10-24 06:26 | 1162 | check arm 1 fable–fable #3 m38 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1163 | subject arm 1 sonnet–sonnet #3 A m33 | claude-sonnet-5-5 | 4 | 738 | $0.01753 | 8.6 |  |
| 2026-10-24 06:26 | 1164 | check arm 1 sonnet–sonnet #3 m33 | claude-haiku-5-5 | 2137 | 85 | $0.00026 | 0.9 |  |
| 2026-10-24 06:26 | 1165 | subject arm 1 fable–fable #3 A m39 | claude-fable-5-1 | 4 | 77 | $0.00625 | 2 |  |
| 2026-10-24 06:26 | 1166 | check arm 1 fable–fable #3 m39 | claude-haiku-5-5 | 329 | 42 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1167 | subject arm 1 fable–fable #3 B m40 | claude-fable-5-1 | 4 | 105 | $0.00766 | 2.9 |  |
| 2026-10-24 06:26 | 1168 | check arm 1 fable–fable #3 m40 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.3 |  |
| 2026-10-24 06:26 | 1169 | subject arm 1 fable–fable #3 A m41 | claude-fable-5-1 | 4 | 41 | $0.00446 | 1.9 |  |
| 2026-10-24 06:26 | 1170 | check arm 1 fable–fable #3 m41 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1171 | subject arm 1 sonnet–sonnet #3 B m34 | claude-sonnet-5-5 | 4 | 1357 | $0.02325 | 15.3 |  |
| 2026-10-24 06:26 | 1172 | check arm 1 sonnet–sonnet #3 m34 | claude-haiku-5-5 | 2410 | 99 | $0.00029 | 1.1 |  |
| 2026-10-24 06:26 | 1173 | subject arm 1 fable–fable #3 B m42 | claude-fable-5-1 | 4 | 66 | $0.00571 | 2.6 |  |
| 2026-10-24 06:26 | 1174 | check arm 1 fable–fable #3 m42 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 1175 | subject arm 1 fable–fable #3 A m43 | claude-fable-5-1 | 4 | 63 | $0.00556 | 2.1 |  |
| 2026-10-24 06:26 | 1176 | check arm 1 fable–fable #3 m43 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 1177 | subject arm 1 opus–opus #3 A m11 | claude-opus-5-5 | 4 | 3382 | $0.08475 | 39.8 |  |
| 2026-10-24 06:26 | 1178 | subject arm 1 sonnet–sonnet #3 A m35 | claude-sonnet-5-5 | 4 | 612 | $0.01670 | 7.6 |  |
| 2026-10-24 06:26 | 1179 | check arm 1 opus–opus #3 m11 | claude-haiku-5-5 | 2730 | 80 | $0.00031 | 0.8 |  |
| 2026-10-24 06:26 | 1180 | check arm 1 sonnet–sonnet #3 m35 | claude-haiku-5-5 | 2284 | 81 | $0.00027 | 0.8 |  |
| 2026-10-24 06:26 | 1181 | subject arm 1 fable–fable #3 B m44 | claude-fable-5-1 | 4 | 69 | $0.00586 | 2.1 |  |
| 2026-10-24 06:26 | 1182 | check arm 1 fable–fable #3 m44 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1183 | subject arm 1 fable–fable #3 A m45 | claude-fable-5-1 | 4 | 83 | $0.00656 | 2.1 |  |
| 2026-10-24 06:26 | 1184 | check arm 1 fable–fable #3 m45 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 1185 | subject arm 1 fable–fable #3 B m46 | claude-fable-5-1 | 4 | 64 | $0.00562 | 2.1 |  |
| 2026-10-24 06:26 | 1186 | check arm 1 fable–fable #3 m46 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1187 | subject arm 1 fable–fable #3 A m47 | claude-fable-5-1 | 4 | 114 | $0.00812 | 2.4 |  |
| 2026-10-24 06:26 | 1188 | check arm 1 fable–fable #3 m47 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1189 | subject arm 1 sonnet–sonnet #3 B m36 | claude-sonnet-5-5 | 4 | 1390 | $0.02431 | 16.1 |  |
| 2026-10-24 06:26 | 1190 | check arm 1 sonnet–sonnet #3 m36 | claude-haiku-5-5 | 2317 | 92 | $0.00028 | 1.1 |  |
| 2026-10-24 06:26 | 1191 | subject arm 1 fable–fable #3 B m48 | claude-fable-5-1 | 4 | 91 | $0.00697 | 2.5 |  |
| 2026-10-24 06:26 | 1192 | check arm 1 fable–fable #3 m48 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 1.8 |  |
| 2026-10-24 06:26 | 1193 | subject arm 1 fable–fable #3 A m49 | claude-fable-5-1 | 4 | 93 | $0.00707 | 2.5 |  |
| 2026-10-24 06:26 | 1194 | check arm 1 fable–fable #3 m49 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 1195 | subject arm 1 opus–opus #3 B m12 | claude-opus-5-5 | 4 | 2347 | $0.06150 | 27.5 |  |
| 2026-10-24 06:26 | 1196 | check arm 1 opus–opus #3 m12 | claude-haiku-5-5 | 2431 | 69 | $0.00028 | 1.1 |  |
| 2026-10-24 06:26 | 1197 | subject arm 1 fable–fable #3 B m50 | claude-fable-5-1 | 4 | 77 | $0.00627 | 2.4 |  |
| 2026-10-24 06:26 | 1198 | check arm 1 fable–fable #3 m50 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 1199 | subject arm 1 sonnet–sonnet #3 A m37 | claude-sonnet-5-5 | 4 | 1282 | $0.02359 | 14 |  |
| 2026-10-24 06:26 | 1200 | check arm 1 sonnet–sonnet #3 m37 | claude-haiku-5-5 | 2342 | 75 | $0.00027 | 1 |  |
| 2026-10-24 06:26 | 1201 | subject arm 1 fable–fable #3 A m51 | claude-fable-5-1 | 4 | 92 | $0.00702 | 2.3 |  |
| 2026-10-24 06:26 | 1202 | check arm 1 fable–fable #3 m51 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1203 | subject arm 1 fable–fable #3 B m52 | claude-fable-5-1 | 4 | 71 | $0.00598 | 2 |  |
| 2026-10-24 06:26 | 1204 | check arm 1 fable–fable #3 m52 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 1205 | subject arm 1 fable–fable #3 A m53 | claude-fable-5-1 | 4 | 95 | $0.00718 | 2.5 |  |
| 2026-10-24 06:26 | 1206 | check arm 1 fable–fable #3 m53 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1207 | subject arm 1 sonnet–sonnet #3 B m38 | claude-sonnet-5-5 | 4 | 1366 | $0.02461 | 15.1 |  |
| 2026-10-24 06:26 | 1208 | subject arm 1 fable–fable #3 B m54 | claude-fable-5-1 | 4 | 77 | $0.00628 | 2.1 |  |
| 2026-10-24 06:26 | 1209 | check arm 1 sonnet–sonnet #3 m38 | claude-haiku-5-5 | 2318 | 70 | $0.00027 | 0.9 |  |
| 2026-10-24 06:26 | 1210 | check arm 1 fable–fable #3 m54 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1211 | subject arm 1 opus–opus #3 A m13 | claude-opus-5-5 | 4 | 2285 | $0.05901 | 25.3 |  |
| 2026-10-24 06:26 | 1212 | check arm 1 opus–opus #3 m13 | claude-haiku-5-5 | 2496 | 87 | $0.00029 | 0.8 |  |
| 2026-10-24 06:26 | 1213 | subject arm 1 fable–fable #3 A m55 | claude-fable-5-1 | 4 | 98 | $0.00733 | 2.3 |  |
| 2026-10-24 06:26 | 1214 | check arm 1 fable–fable #3 m55 | claude-haiku-5-5 | 329 | 53 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 1215 | subject arm 1 sonnet–sonnet #3 A m39 | claude-sonnet-5-5 | 4 | 489 | $0.01606 | 6.1 |  |
| 2026-10-24 06:26 | 1216 | check arm 1 sonnet–sonnet #3 m39 | claude-haiku-5-5 | 2170 | 76 | $0.00026 | 1.2 |  |
| 2026-10-24 06:26 | 1217 | subject arm 1 fable–fable #3 B m56 | claude-fable-5-1 | 4 | 120 | $0.00843 | 2.8 |  |
| 2026-10-24 06:26 | 1218 | check arm 1 fable–fable #3 m56 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 1219 | subject arm 1 fable–fable #3 A m57 | claude-fable-5-1 | 4 | 135 | $0.00919 | 2.5 |  |
| 2026-10-24 06:26 | 1220 | subject arm 1 sonnet–sonnet #3 B m40 | claude-sonnet-5-5 | 4 | 410 | $0.01503 | 5.7 |  |
| 2026-10-24 06:26 | 1221 | check arm 1 sonnet–sonnet #3 m40 | claude-haiku-5-5 | 1214 | 76 | $0.00016 | 0.7 |  |
| 2026-10-24 06:26 | 1222 | check arm 1 fable–fable #3 m57 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.1 |  |
| 2026-10-24 06:26 | 1223 | subject arm 1 opus–opus #3 B m14 | claude-opus-5-5 | 4 | 997 | $0.03382 | 13.7 |  |
| 2026-10-24 06:26 | 1224 | check arm 1 opus–opus #3 m14 | claude-haiku-5-5 | 2246 | 71 | $0.00026 | 0.9 |  |
| 2026-10-24 06:26 | 1225 | subject arm 1 fable–fable #3 B m58 | claude-fable-5-1 | 4 | 64 | $0.00564 | 1.9 |  |
| 2026-10-24 06:26 | 1226 | check arm 1 fable–fable #3 m58 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1227 | subject arm 1 sonnet–sonnet #3 A m41 | claude-sonnet-5-5 | 4 | 321 | $0.01202 | 3.9 |  |
| 2026-10-24 06:26 | 1228 | check arm 1 sonnet–sonnet #3 m41 | claude-haiku-5-5 | 1046 | 76 | $0.00014 | 0.8 |  |
| 2026-10-24 06:26 | 1229 | subject arm 1 fable–fable #3 A m59 | claude-fable-5-1 | 4 | 125 | $0.00869 | 2.5 |  |
| 2026-10-24 06:26 | 1230 | check arm 1 fable–fable #3 m59 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 1231 | subject arm 1 sonnet–sonnet #3 B m42 | claude-sonnet-5-5 | 4 | 281 | $0.01130 | 4.1 |  |
| 2026-10-24 06:26 | 1232 | subject arm 1 opus–opus #3 A m15 | claude-opus-5-5 | 4 | 521 | $0.02323 | 8.3 |  |
| 2026-10-24 06:26 | 1233 | check arm 1 opus–opus #3 m15 | claude-haiku-5-5 | 1426 | 64 | $0.00017 | 0.7 |  |
| 2026-10-24 06:26 | 1234 | check arm 1 sonnet–sonnet #3 m42 | claude-haiku-5-5 | 917 | 61 | $0.00012 | 1.2 |  |
| 2026-10-24 06:26 | 1235 | subject arm 1 fable–fable #3 B m60 | claude-fable-5-1 | 4 | 89 | $0.00689 | 2.5 |  |
| 2026-10-24 06:26 | 1236 | check arm 1 fable–fable #3 m60 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1237 | tags 1 arm 1 fable–fable #3 m11–20 | claude-haiku-5-5 | 2396 | 680 | $0.00058 | 2.2 |  |
| 2026-10-24 06:26 | 1238 | tags 2 arm 1 fable–fable #3 m1–10 | claude-haiku-5-5 | 8922 | 680 | $0.00123 | 2.4 |  |
| 2026-10-24 06:26 | 1239 | tags 1 arm 1 fable–fable #3 m1–10 | claude-haiku-5-5 | 8922 | 680 | $0.00123 | 2.4 |  |
| 2026-10-24 06:26 | 1240 | tags 2 arm 1 fable–fable #3 m11–20 | claude-haiku-5-5 | 2396 | 680 | $0.00058 | 2.2 |  |
| 2026-10-24 06:26 | 1241 | tags 1 arm 1 fable–fable #3 m21–30 | claude-haiku-5-5 | 1220 | 680 | $0.00046 | 2.1 |  |
| 2026-10-24 06:26 | 1242 | tags 2 arm 1 fable–fable #3 m21–30 | claude-haiku-5-5 | 1220 | 680 | $0.00046 | 2.1 |  |
| 2026-10-24 06:26 | 1243 | subject arm 2 opus–opus #3 A m1 | claude-opus-5-5 | 59 | 447 | $0.00918 | 6.1 |  |
| 2026-10-24 06:26 | 1244 | check arm 2 opus–opus #3 m1 | claude-haiku-5-5 | 737 | 55 | $0.00010 | 0.7 |  |
| 2026-10-24 06:26 | 1245 | subject arm 1 opus–opus #3 B m16 | claude-opus-5-5 | 4 | 567 | $0.02030 | 8.1 |  |
| 2026-10-24 06:26 | 1246 | check arm 1 opus–opus #3 m16 | claude-haiku-5-5 | 1001 | 67 | $0.00013 | 1.1 |  |
| 2026-10-24 06:26 | 1247 | subject arm 1 sonnet–sonnet #3 A m43 | claude-sonnet-5-5 | 4 | 1227 | $0.02052 | 12 |  |
| 2026-10-24 06:26 | 1248 | tags 1 arm 1 fable–fable #3 m31–40 | claude-haiku-5-5 | 1132 | 680 | $0.00045 | 2.2 |  |
| 2026-10-24 06:26 | 1249 | tags 1 arm 1 fable–fable #3 m41–50 | claude-haiku-5-5 | 1132 | 680 | $0.00045 | 2.1 |  |
| 2026-10-24 06:26 | 1250 | tags 2 arm 1 fable–fable #3 m31–40 | claude-haiku-5-5 | 1132 | 680 | $0.00045 | 2.4 |  |
| 2026-10-24 06:26 | 1251 | check arm 1 sonnet–sonnet #3 m43 | claude-haiku-5-5 | 936 | 61 | $0.00012 | 0.7 |  |
| 2026-10-24 06:26 | 1252 | tags 1 arm 1 fable–fable #3 m51–60 | claude-haiku-5-5 | 1132 | 680 | $0.00045 | 2.2 |  |
| 2026-10-24 06:26 | 1253 | tags 2 arm 1 fable–fable #3 m51–60 | claude-haiku-5-5 | 1132 | 680 | $0.00045 | 2.2 |  |
| 2026-10-24 06:26 | 1254 | tags 2 arm 1 fable–fable #3 m41–50 | claude-haiku-5-5 | 1132 | 680 | $0.00045 | 2.5 |  |
| 2026-10-24 06:26 | 1255 | subject arm 1 opus–opus #3 A m17 | claude-opus-5-5 | 4 | 445 | $0.01587 | 6.1 |  |
| 2026-10-24 06:26 | 1256 | check arm 1 opus–opus #3 m17 | claude-haiku-5-5 | 793 | 62 | $0.00011 | 0.7 |  |
| 2026-10-24 06:26 | 1257 | tags referee arm 1 fable–fable #3 m1–10 | claude-opus-5-5 | 8922 | 680 | $0.04929 | 5.7 |  |
| 2026-10-24 06:26 | 1258 | subject arm 2 opus–opus #3 B m2 | claude-opus-5-5 | 468 | 1200 | $0.02587 | 15.7 |  |
| 2026-10-24 06:26 | 1259 | subject arm 1 opus–opus #3 B m18 | claude-opus-5-5 | 4 | 375 | $0.01352 | 6 |  |
| 2026-10-24 06:26 | 1260 | check arm 1 opus–opus #3 m18 | claude-haiku-5-5 | 740 | 64 | $0.00011 | 0.6 |  |
| 2026-10-24 06:26 | 1261 | check arm 2 opus–opus #3 m2 | claude-haiku-5-5 | 1495 | 65 | $0.00018 | 0.9 |  |
| 2026-10-24 06:26 | 1262 | subject arm 1 sonnet–sonnet #3 B m44 | claude-sonnet-5-5 | 4 | 1721 | $0.02557 | 16.4 |  |
| 2026-10-24 06:26 | 1263 | check arm 1 sonnet–sonnet #3 m44 | claude-haiku-5-5 | 947 | 72 | $0.00013 | 0.9 |  |
| 2026-10-24 06:26 | 1264 | subject arm 1 opus–opus #3 A m19 | claude-opus-5-5 | 4 | 246 | $0.01072 | 4.1 |  |
| 2026-10-24 06:26 | 1265 | check arm 1 opus–opus #3 m19 | claude-haiku-5-5 | 585 | 69 | $0.00009 | 1.2 |  |
| 2026-10-24 06:26 | 1266 | check referee arm 1 sonnet–sonnet #3 m44 | claude-opus-5-5 | 947 | 75 | $0.00529 | 1.5 |  |
| 2026-10-24 06:26 | 1267 | subject arm 1 opus–opus #3 B m20 | claude-opus-5-5 | 4 | 197 | $0.00902 | 3.3 |  |
| 2026-10-24 06:26 | 1268 | check arm 1 opus–opus #3 m20 | claude-haiku-5-5 | 435 | 68 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 1269 | subject arm 1 opus–opus #3 A m21 | claude-opus-5-5 | 4 | 104 | $0.00644 | 2.6 |  |
| 2026-10-24 06:26 | 1270 | check arm 1 opus–opus #3 m21 | claude-haiku-5-5 | 367 | 67 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 1271 | subject arm 1 sonnet–sonnet #3 A m45 | claude-sonnet-5-5 | 4 | 1065 | $0.01909 | 10 |  |
| 2026-10-24 06:26 | 1272 | check arm 1 sonnet–sonnet #3 m45 | claude-haiku-5-5 | 819 | 71 | $0.00012 | 0.8 |  |
| 2026-10-24 06:26 | 1273 | subject arm 1 opus–opus #3 B m22 | claude-opus-5-5 | 4 | 91 | $0.00586 | 2.4 |  |
| 2026-10-24 06:26 | 1274 | subject arm 2 opus–opus #3 A m3 | claude-opus-5-5 | 4 | 1812 | $0.04243 | 21.6 |  |
| 2026-10-24 06:26 | 1275 | subject arm 1 sonnet–sonnet #3 B m46 | claude-sonnet-5-5 | 4 | 69 | $0.00888 | 1.9 |  |
| 2026-10-24 06:26 | 1276 | check arm 1 opus–opus #3 m22 | claude-haiku-5-5 | 332 | 59 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 1277 | check arm 2 opus–opus #3 m3 | claude-haiku-5-5 | 2110 | 69 | $0.00025 | 0.7 |  |
| 2026-10-24 06:26 | 1278 | check arm 1 sonnet–sonnet #3 m46 | claude-haiku-5-5 | 596 | 75 | $0.00010 | 0.7 |  |
| 2026-10-24 06:26 | 1279 | subject arm 1 sonnet–sonnet #3 A m47 | claude-sonnet-5-5 | 4 | 55 | $0.00824 | 1.5 |  |
| 2026-10-24 06:26 | 1280 | subject arm 1 opus–opus #3 A m23 | claude-opus-5-5 | 4 | 152 | $0.00691 | 2.9 |  |
| 2026-10-24 06:26 | 1281 | check arm 1 opus–opus #3 m23 | claude-haiku-5-5 | 339 | 48 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 1282 | check arm 1 sonnet–sonnet #3 m47 | claude-haiku-5-5 | 439 | 61 | $0.00007 | 1.6 |  |
| 2026-10-24 06:26 | 1283 | subject arm 1 sonnet–sonnet #3 B m48 | claude-sonnet-5-5 | 4 | 33 | $0.00767 | 1.8 |  |
| 2026-10-24 06:26 | 1284 | check arm 1 sonnet–sonnet #3 m48 | claude-haiku-5-5 | 403 | 60 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 1285 | subject arm 1 opus–opus #3 B m24 | claude-opus-5-5 | 4 | 69 | $0.00529 | 2.1 |  |
| 2026-10-24 06:26 | 1286 | check arm 1 opus–opus #3 m24 | claude-haiku-5-5 | 339 | 59 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 1287 | subject arm 1 sonnet–sonnet #3 A m49 | claude-sonnet-5-5 | 4 | 34 | $0.00761 | 1.4 |  |
| 2026-10-24 06:26 | 1288 | check arm 1 sonnet–sonnet #3 m49 | claude-haiku-5-5 | 382 | 67 | $0.00007 | 1 |  |
| 2026-10-24 06:26 | 1289 | subject arm 1 opus–opus #3 A m25 | claude-opus-5-5 | 4 | 71 | $0.00533 | 2.2 |  |
| 2026-10-24 06:26 | 1290 | check arm 1 opus–opus #3 m25 | claude-haiku-5-5 | 329 | 65 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 1291 | subject arm 1 sonnet–sonnet #3 B m50 | claude-sonnet-5-5 | 4 | 17 | $0.00739 | 1.6 |  |
| 2026-10-24 06:26 | 1292 | check arm 1 sonnet–sonnet #3 m50 | claude-haiku-5-5 | 366 | 64 | $0.00007 | 1.1 |  |
| 2026-10-24 06:26 | 1293 | subject arm 1 opus–opus #3 B m26 | claude-opus-5-5 | 4 | 41 | $0.00469 | 1.8 |  |
| 2026-10-24 06:26 | 1294 | check arm 1 opus–opus #3 m26 | claude-haiku-5-5 | 331 | 64 | $0.00007 | 1.2 |  |
| 2026-10-24 06:26 | 1295 | subject arm 1 sonnet–sonnet #3 A m51 | claude-sonnet-5-5 | 4 | 21 | $0.00740 | 1 |  |
| 2026-10-24 06:26 | 1296 | check arm 1 sonnet–sonnet #3 m51 | claude-haiku-5-5 | 353 | 61 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 1297 | subject arm 1 opus–opus #3 A m27 | claude-opus-5-5 | 4 | 145 | $0.00678 | 2.8 |  |
| 2026-10-24 06:26 | 1298 | subject arm 1 sonnet–sonnet #3 B m52 | claude-sonnet-5-5 | 4 | 17 | $0.00733 | 1.1 |  |
| 2026-10-24 06:26 | 1299 | check arm 1 opus–opus #3 m27 | claude-haiku-5-5 | 331 | 64 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 1300 | subject arm 2 opus–opus #3 B m4 | claude-opus-5-5 | 4 | 2088 | $0.05307 | 25.1 |  |
| 2026-10-24 06:26 | 1301 | check arm 1 sonnet–sonnet #3 m52 | claude-haiku-5-5 | 353 | 62 | $0.00007 | 1.1 |  |
| 2026-10-24 06:26 | 1302 | check arm 2 opus–opus #3 m4 | claude-haiku-5-5 | 2609 | 71 | $0.00030 | 0.7 |  |
| 2026-10-24 06:26 | 1303 | subject arm 1 sonnet–sonnet #3 A m53 | claude-sonnet-5-5 | 4 | 8 | $0.00725 | 0.9 |  |
| 2026-10-24 06:26 | 1304 | check arm 1 sonnet–sonnet #3 m53 | claude-haiku-5-5 | 340 | 49 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 1305 | subject arm 1 opus–opus #3 B m28 | claude-opus-5-5 | 4 | 86 | $0.00560 | 2.4 |  |
| 2026-10-24 06:26 | 1306 | check arm 1 opus–opus #3 m28 | claude-haiku-5-5 | 341 | 61 | $0.00006 | 1.2 |  |
| 2026-10-24 06:26 | 1307 | subject arm 1 sonnet–sonnet #3 B m54 | claude-sonnet-5-5 | 4 | 8 | $0.00722 | 1 |  |
| 2026-10-24 06:26 | 1308 | check arm 1 sonnet–sonnet #3 m54 | claude-haiku-5-5 | 331 | 45 | $0.00006 | 1 |  |
| 2026-10-24 06:26 | 1309 | subject arm 1 opus–opus #3 A m29 | claude-opus-5-5 | 4 | 149 | $0.00691 | 3.4 |  |
| 2026-10-24 06:26 | 1310 | subject arm 1 sonnet–sonnet #3 A m55 | claude-sonnet-5-5 | 4 | 8 | $0.00720 | 1.2 |  |
| 2026-10-24 06:26 | 1311 | check arm 1 opus–opus #3 m29 | claude-haiku-5-5 | 377 | 63 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 1312 | check arm 1 sonnet–sonnet #3 m55 | claude-haiku-5-5 | 331 | 52 | $0.00006 | 1.3 |  |
| 2026-10-24 06:26 | 1313 | subject arm 1 sonnet–sonnet #3 B m56 | claude-sonnet-5-5 | 4 | 8 | $0.00720 | 0.9 |  |
| 2026-10-24 06:26 | 1314 | subject arm 1 opus–opus #3 B m30 | claude-opus-5-5 | 4 | 124 | $0.00659 | 2.8 |  |
| 2026-10-24 06:26 | 1315 | check arm 1 sonnet–sonnet #3 m56 | claude-haiku-5-5 | 331 | 50 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 1316 | check arm 1 opus–opus #3 m30 | claude-haiku-5-5 | 387 | 62 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 1317 | subject arm 1 sonnet–sonnet #3 A m57 | claude-sonnet-5-5 | 4 | 97 | $0.00809 | 4.9 |  |
| 2026-10-24 06:26 | 1318 | check arm 1 sonnet–sonnet #3 m57 | claude-haiku-5-5 | 357 | 55 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 1319 | subject arm 1 opus–opus #3 A m31 | claude-opus-5-5 | 4 | 138 | $0.00693 | 4.6 |  |
| 2026-10-24 06:26 | 1320 | check arm 1 opus–opus #3 m31 | claude-haiku-5-5 | 346 | 71 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 1321 | subject arm 2 opus–opus #3 A m5 | claude-opus-5-5 | 4 | 1849 | $0.04871 | 22.6 |  |
| 2026-10-24 06:26 | 1322 | check arm 2 opus–opus #3 m5 | claude-haiku-5-5 | 2802 | 65 | $0.00031 | 0.7 |  |
| 2026-10-24 06:26 | 1323 | subject arm 1 sonnet–sonnet #3 B m58 | claude-sonnet-5-5 | 4 | 6 | $0.00725 | 0.9 |  |
| 2026-10-24 06:26 | 1324 | check arm 1 sonnet–sonnet #3 m58 | claude-haiku-5-5 | 355 | 56 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 1325 | subject arm 1 opus–opus #3 B m32 | claude-opus-5-5 | 4 | 144 | $0.00685 | 3.1 |  |
| 2026-10-24 06:26 | 1326 | check arm 1 opus–opus #3 m32 | claude-haiku-5-5 | 327 | 58 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 1327 | subject arm 1 sonnet–sonnet #3 A m59 | claude-sonnet-5-5 | 4 | 6 | $0.00725 | 0.9 |  |
| 2026-10-24 06:26 | 1328 | check arm 1 sonnet–sonnet #3 m59 | claude-haiku-5-5 | 327 | 55 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 1329 | subject arm 1 opus–opus #3 A m33 | claude-opus-5-5 | 4 | 116 | $0.00620 | 2.9 |  |
| 2026-10-24 06:26 | 1330 | check arm 1 opus–opus #3 m33 | claude-haiku-5-5 | 327 | 51 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 1331 | subject arm 1 sonnet–sonnet #3 B m60 | claude-sonnet-5-5 | 4 | 108 | $0.00820 | 2.9 |  |
| 2026-10-24 06:26 | 1332 | check arm 1 sonnet–sonnet #3 m60 | claude-haiku-5-5 | 339 | 60 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 1333 | tags 1 arm 1 sonnet–sonnet #3 m1–10 | claude-haiku-5-5 | 7274 | 680 | $0.00107 | 2.8 |  |
| 2026-10-24 06:26 | 1334 | tags 1 arm 1 sonnet–sonnet #3 m11–20 | claude-haiku-5-5 | 9582 | 680 | $0.00130 | 2.8 |  |
| 2026-10-24 06:26 | 1335 | tags 2 arm 1 sonnet–sonnet #3 m1–10 | claude-haiku-5-5 | 7274 | 680 | $0.00107 | 2.9 |  |
| 2026-10-24 06:26 | 1336 | subject arm 1 opus–opus #3 B m34 | claude-opus-5-5 | 4 | 167 | $0.00722 | 3.4 |  |
| 2026-10-24 06:26 | 1337 | check arm 1 opus–opus #3 m34 | claude-haiku-5-5 | 321 | 45 | $0.00005 | 1.8 |  |
| 2026-10-24 06:26 | 1338 | tags 1 arm 1 sonnet–sonnet #3 m21–30 | claude-haiku-5-5 | 12315 | 680 | $0.00157 | 2.3 |  |
| 2026-10-24 06:26 | 1339 | tags 2 arm 1 sonnet–sonnet #3 m21–30 | claude-haiku-5-5 | 12315 | 680 | $0.00157 | 2.3 |  |
| 2026-10-24 06:26 | 1340 | tags 2 arm 1 sonnet–sonnet #3 m11–20 | claude-haiku-5-5 | 9582 | 680 | $0.00130 | 2.8 |  |
| 2026-10-24 06:26 | 1341 | subject arm 2 fable–fable #3 A m1 | claude-fable-5-1 | 59 | 434 | $0.02229 | 8.7 |  |
| 2026-10-24 06:26 | 1342 | subject arm 1 opus–opus #3 A m35 | claude-opus-5-5 | 4 | 126 | $0.00637 | 3.2 |  |
| 2026-10-24 06:26 | 1343 | subject arm 2 opus–opus #3 B m6 | claude-opus-5-5 | 4 | 1596 | $0.04482 | 20 |  |
| 2026-10-24 06:26 | 1344 | check arm 2 fable–fable #3 m1 | claude-haiku-5-5 | 696 | 60 | $0.00010 | 0.7 |  |
| 2026-10-24 06:26 | 1345 | check arm 2 opus–opus #3 m6 | claude-haiku-5-5 | 2519 | 96 | $0.00030 | 0.9 |  |
| 2026-10-24 06:26 | 1346 | check arm 1 opus–opus #3 m35 | claude-haiku-5-5 | 321 | 45 | $0.00005 | 1.4 |  |
| 2026-10-24 06:26 | 1347 | tags 2 arm 1 sonnet–sonnet #3 m31–40 | claude-haiku-5-5 | 10791 | 680 | $0.00142 | 2.3 |  |
| 2026-10-24 06:26 | 1348 | tags 1 arm 1 sonnet–sonnet #3 m31–40 | claude-haiku-5-5 | 10791 | 680 | $0.00142 | 2.3 |  |
| 2026-10-24 06:26 | 1349 | tags 1 arm 1 sonnet–sonnet #3 m41–50 | claude-haiku-5-5 | 3119 | 680 | $0.00065 | 2.7 |  |
| 2026-10-24 06:26 | 1350 | subject arm 1 opus–opus #3 B m36 | claude-opus-5-5 | 4 | 128 | $0.00641 | 2.9 |  |
| 2026-10-24 06:26 | 1351 | check arm 1 opus–opus #3 m36 | claude-haiku-5-5 | 321 | 47 | $0.00006 | 1 |  |
| 2026-10-24 06:26 | 1352 | tags 2 arm 1 sonnet–sonnet #3 m41–50 | claude-haiku-5-5 | 3119 | 680 | $0.00065 | 2.2 |  |
| 2026-10-24 06:26 | 1353 | tags 1 arm 1 sonnet–sonnet #3 m51–60 | claude-haiku-5-5 | 1206 | 680 | $0.00046 | 2.6 |  |
| 2026-10-24 06:26 | 1354 | tags 2 arm 1 sonnet–sonnet #3 m51–60 | claude-haiku-5-5 | 1206 | 680 | $0.00046 | 2.2 |  |
| 2026-10-24 06:26 | 1355 | subject arm 1 opus–opus #3 A m37 | claude-opus-5-5 | 4 | 178 | $0.00741 | 3.7 |  |
| 2026-10-24 06:26 | 1356 | check arm 1 opus–opus #3 m37 | claude-haiku-5-5 | 335 | 49 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 1357 | tags referee arm 1 sonnet–sonnet #3 m11–20 | claude-opus-5-5 | 9582 | 680 | $0.05193 | 5.5 |  |
| 2026-10-24 06:26 | 1358 | tags referee arm 1 sonnet–sonnet #3 m21–30 | claude-opus-5-5 | 12315 | 864 | $0.06654 | 7.4 |  |
| 2026-10-24 06:26 | 1359 | subject arm 1 opus–opus #3 B m38 | claude-opus-5-5 | 4 | 91 | $0.00574 | 2.4 |  |
| 2026-10-24 06:26 | 1360 | check arm 1 opus–opus #3 m38 | claude-haiku-5-5 | 335 | 56 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 1361 | subject arm 2 fable–fable #3 B m2 | claude-fable-5-1 | 427 | 902 | $0.04937 | 18.9 |  |
| 2026-10-24 06:26 | 1362 | check arm 2 fable–fable #3 m2 | claude-haiku-5-5 | 1496 | 87 | $0.00019 | 1.1 |  |
| 2026-10-24 06:26 | 1363 | subject arm 1 opus–opus #3 A m39 | claude-opus-5-5 | 4 | 80 | $0.00552 | 2.3 |  |
| 2026-10-24 06:26 | 1364 | check arm 1 opus–opus #3 m39 | claude-haiku-5-5 | 321 | 45 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1365 | subject arm 1 opus–opus #3 B m40 | claude-opus-5-5 | 4 | 97 | $0.00580 | 2.5 |  |
| 2026-10-24 06:26 | 1366 | check arm 1 opus–opus #3 m40 | claude-haiku-5-5 | 321 | 47 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 1367 | subject arm 2 opus–opus #3 A m7 | claude-opus-5-5 | 4 | 2538 | $0.06250 | 28.5 |  |
| 2026-10-24 06:26 | 1368 | check arm 2 opus–opus #3 m7 | claude-haiku-5-5 | 1949 | 73 | $0.00023 | 1 |  |
| 2026-10-24 06:26 | 1369 | subject arm 1 opus–opus #3 A m41 | claude-opus-5-5 | 4 | 76 | $0.00538 | 2.2 |  |
| 2026-10-24 06:26 | 1370 | check arm 1 opus–opus #3 m41 | claude-haiku-5-5 | 321 | 45 | $0.00005 | 0.9 |  |
| 2026-10-24 06:26 | 1371 | subject arm 1 opus–opus #3 B m42 | claude-opus-5-5 | 4 | 138 | $0.00662 | 2.9 |  |
| 2026-10-24 06:26 | 1372 | check arm 1 opus–opus #3 m42 | claude-haiku-5-5 | 321 | 47 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 1373 | subject arm 1 opus–opus #3 A m43 | claude-opus-5-5 | 4 | 69 | $0.00524 | 2.7 |  |
| 2026-10-24 06:26 | 1374 | check arm 1 opus–opus #3 m43 | claude-haiku-5-5 | 321 | 47 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 1375 | subject arm 1 opus–opus #3 B m44 | claude-opus-5-5 | 4 | 108 | $0.00602 | 3.2 |  |
| 2026-10-24 06:26 | 1376 | check arm 1 opus–opus #3 m44 | claude-haiku-5-5 | 321 | 47 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 1377 | subject arm 1 opus–opus #3 A m45 | claude-opus-5-5 | 4 | 95 | $0.00576 | 2.5 |  |
| 2026-10-24 06:26 | 1378 | check arm 1 opus–opus #3 m45 | claude-haiku-5-5 | 321 | 47 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 1379 | subject arm 2 fable–fable #3 A m3 | claude-fable-5-1 | 4 | 1636 | $0.09729 | 33.5 |  |
| 2026-10-24 06:26 | 1380 | check arm 2 fable–fable #3 m3 | claude-haiku-5-5 | 2009 | 68 | $0.00023 | 0.6 |  |
| 2026-10-24 06:26 | 1381 | subject arm 1 opus–opus #3 B m46 | claude-opus-5-5 | 4 | 225 | $0.00836 | 4.8 |  |
| 2026-10-24 06:26 | 1382 | check arm 1 opus–opus #3 m46 | claude-haiku-5-5 | 384 | 59 | $0.00007 | 1.2 |  |
| 2026-10-24 06:26 | 1383 | subject arm 1 opus–opus #3 A m47 | claude-opus-5-5 | 4 | 178 | $0.00774 | 3.7 |  |
| 2026-10-24 06:26 | 1384 | check arm 1 opus–opus #3 m47 | claude-haiku-5-5 | 467 | 64 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 1385 | subject arm 1 opus–opus #3 B m48 | claude-opus-5-5 | 4 | 72 | $0.00603 | 2.6 |  |
| 2026-10-24 06:26 | 1386 | check arm 1 opus–opus #3 m48 | claude-haiku-5-5 | 431 | 76 | $0.00008 | 0.7 |  |
| 2026-10-24 06:26 | 1387 | subject arm 1 opus–opus #3 A m49 | claude-opus-5-5 | 4 | 36 | $0.00515 | 1.9 |  |
| 2026-10-24 06:26 | 1388 | subject arm 2 opus–opus #3 B m8 | claude-opus-5-5 | 4 | 4442 | $0.09798 | 47.8 |  |
| 2026-10-24 06:26 | 1389 | check arm 1 opus–opus #3 m49 | claude-haiku-5-5 | 361 | 62 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 1390 | check arm 2 opus–opus #3 m8 | claude-haiku-5-5 | 1875 | 70 | $0.00022 | 0.8 |  |
| 2026-10-24 06:26 | 1391 | subject arm 1 opus–opus #3 B m50 | claude-opus-5-5 | 4 | 8 | $0.00425 | 1.3 |  |
| 2026-10-24 06:26 | 1392 | check arm 1 opus–opus #3 m50 | claude-haiku-5-5 | 339 | 50 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 1393 | subject arm 1 opus–opus #3 A m51 | claude-opus-5-5 | 4 | 22 | $0.00443 | 1.5 |  |
| 2026-10-24 06:26 | 1394 | subject arm 2 fable–fable #3 B m4 | claude-fable-5-1 | 4 | 1656 | $0.10930 | 30.8 |  |
| 2026-10-24 06:26 | 1395 | check arm 1 opus–opus #3 m51 | claude-haiku-5-5 | 326 | 45 | $0.00006 | 1.5 |  |
| 2026-10-24 06:26 | 1396 | check arm 2 fable–fable #3 m4 | claude-haiku-5-5 | 2104 | 67 | $0.00024 | 0.8 |  |
| 2026-10-24 06:26 | 1397 | subject arm 1 opus–opus #3 B m52 | claude-opus-5-5 | 4 | 18 | $0.00429 | 1.8 |  |
| 2026-10-24 06:26 | 1398 | check arm 1 opus–opus #3 m52 | claude-haiku-5-5 | 321 | 47 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 1399 | subject arm 1 opus–opus #3 A m53 | claude-opus-5-5 | 4 | 40 | $0.00470 | 2.1 |  |
| 2026-10-24 06:26 | 1400 | check arm 1 opus–opus #3 m53 | claude-haiku-5-5 | 321 | 44 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1401 | subject arm 2 opus–opus #3 A m9 | claude-opus-5-5 | 4 | 2202 | $0.05300 | 23.7 |  |
| 2026-10-24 06:26 | 1402 | check arm 2 opus–opus #3 m9 | claude-haiku-5-5 | 2025 | 82 | $0.00024 | 0.8 |  |
| 2026-10-24 06:26 | 1403 | subject arm 1 opus–opus #3 B m54 | claude-opus-5-5 | 4 | 3 | $0.00396 | 8.6 |  |
| 2026-10-24 06:26 | 1404 | check arm 1 opus–opus #3 m54 | claude-haiku-5-5 | 321 | 47 | $0.00006 | 1.8 |  |
| 2026-10-24 06:26 | 1405 | subject arm 1 opus–opus #3 A m55 | claude-opus-5-5 | 4 | 29 | $0.00449 | 1.8 |  |
| 2026-10-24 06:26 | 1406 | check arm 1 opus–opus #3 m55 | claude-haiku-5-5 | 321 | 45 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 1407 | subject arm 1 opus–opus #3 B m56 | claude-opus-5-5 | 4 | 3 | $0.00397 | 1.9 |  |
| 2026-10-24 06:26 | 1408 | check arm 1 opus–opus #3 m56 | claude-haiku-5-5 | 321 | 43 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 1409 | subject arm 2 opus–opus #3 B m10 | claude-opus-5-5 | 4 | 1138 | $0.03260 | 13.3 |  |
| 2026-10-24 06:26 | 1410 | check arm 2 opus–opus #3 m10 | claude-haiku-5-5 | 1617 | 82 | $0.00020 | 0.8 |  |
| 2026-10-24 06:26 | 1411 | subject arm 1 opus–opus #3 A m57 | claude-opus-5-5 | 4 | 44 | $0.00479 | 1.9 |  |
| 2026-10-24 06:26 | 1412 | check arm 1 opus–opus #3 m57 | claude-haiku-5-5 | 321 | 45 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1413 | subject arm 2 fable–fable #3 A m5 | claude-fable-5-1 | 4 | 1790 | $0.11221 | 34.1 |  |
| 2026-10-24 06:26 | 1414 | check arm 2 fable–fable #3 m5 | claude-haiku-5-5 | 2262 | 57 | $0.00025 | 0.9 |  |
| 2026-10-24 06:26 | 1415 | check referee arm 2 opus–opus #3 m10 | claude-opus-5-5 | 1617 | 64 | $0.00775 | 1.7 |  |
| 2026-10-24 06:26 | 1416 | subject arm 1 opus–opus #3 B m58 | claude-opus-5-5 | 4 | 3 | $0.00397 | 1.6 |  |
| 2026-10-24 06:26 | 1417 | check arm 1 opus–opus #3 m58 | claude-haiku-5-5 | 321 | 45 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1418 | subject arm 2 opus–opus #3 A m11 | claude-opus-5-5 | 4 | 85 | $0.00968 | 1.8 |  |
| 2026-10-24 06:26 | 1419 | tags 1 arm 2 opus–opus #3 m1–10 | claude-haiku-5-5 | 9569 | 680 | $0.00130 | 2.2 |  |
| 2026-10-24 06:26 | 1420 | tags 2 arm 2 opus–opus #3 m1–10 | claude-haiku-5-5 | 9569 | 680 | $0.00130 | 2.3 |  |
| 2026-10-24 06:26 | 1421 | subject arm 1 opus–opus #3 A m59 | claude-opus-5-5 | 4 | 68 | $0.00527 | 2.2 |  |
| 2026-10-24 06:26 | 1422 | check arm 1 opus–opus #3 m59 | claude-haiku-5-5 | 321 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1423 | subject arm 2 sonnet–sonnet #3 A m1 | claude-sonnet-5-5 | 59 | 332 | $0.00344 | 3.5 |  |
| 2026-10-24 06:26 | 1424 | check arm 2 sonnet–sonnet #3 m1 | claude-haiku-5-5 | 658 | 65 | $0.00010 | 1.1 |  |
| 2026-10-24 06:26 | 1425 | subject arm 1 opus–opus #3 B m60 | claude-opus-5-5 | 4 | 18 | $0.00427 | 1.4 |  |
| 2026-10-24 06:26 | 1426 | check arm 1 opus–opus #3 m60 | claude-haiku-5-5 | 321 | 47 | $0.00006 | 1.2 |  |
| 2026-10-24 06:26 | 1427 | tags 1 arm 1 opus–opus #3 m11–20 | claude-haiku-5-5 | 7551 | 680 | $0.00110 | 2.2 |  |
| 2026-10-24 06:26 | 1428 | tags 2 arm 1 opus–opus #3 m1–10 | claude-haiku-5-5 | 14579 | 680 | $0.00180 | 2.3 |  |
| 2026-10-24 06:26 | 1429 | tags 1 arm 1 opus–opus #3 m1–10 | claude-haiku-5-5 | 14579 | 680 | $0.00180 | 2.5 |  |
| 2026-10-24 06:26 | 1430 | subject arm 2 sonnet–sonnet #3 B m2 | claude-sonnet-5-5 | 389 | 477 | $0.00555 | 5.2 |  |
| 2026-10-24 06:26 | 1431 | check arm 2 sonnet–sonnet #3 m2 | claude-haiku-5-5 | 1124 | 71 | $0.00015 | 0.7 |  |
| 2026-10-24 06:26 | 1432 | tags 2 arm 1 opus–opus #3 m11–20 | claude-haiku-5-5 | 7551 | 680 | $0.00110 | 2.3 |  |
| 2026-10-24 06:26 | 1433 | tags 2 arm 1 opus–opus #3 m21–30 | claude-haiku-5-5 | 1251 | 680 | $0.00047 | 2.3 |  |
| 2026-10-24 06:26 | 1434 | tags 1 arm 1 opus–opus #3 m21–30 | claude-haiku-5-5 | 1251 | 680 | $0.00047 | 2.5 |  |
| 2026-10-24 06:26 | 1435 | subject arm 2 fable–fable #4 A m1 | claude-fable-5-1 | 59 | 429 | $0.02204 | 7.9 |  |
| 2026-10-24 06:26 | 1436 | check arm 2 fable–fable #4 m1 | claude-haiku-5-5 | 681 | 73 | $0.00010 | 1 |  |
| 2026-10-24 06:26 | 1437 | tags 1 arm 1 opus–opus #3 m31–40 | claude-haiku-5-5 | 1133 | 680 | $0.00045 | 2.2 |  |
| 2026-10-24 06:26 | 1438 | tags 1 arm 1 opus–opus #3 m41–50 | claude-haiku-5-5 | 1279 | 680 | $0.00047 | 2.2 |  |
| 2026-10-24 06:26 | 1439 | tags 2 arm 1 opus–opus #3 m31–40 | claude-haiku-5-5 | 1133 | 680 | $0.00045 | 2.2 |  |
| 2026-10-24 06:26 | 1440 | subject arm 2 sonnet–sonnet #3 A m3 | claude-sonnet-5-5 | 4 | 654 | $0.00871 | 8.2 |  |
| 2026-10-24 06:26 | 1441 | check arm 2 sonnet–sonnet #3 m3 | claude-haiku-5-5 | 1446 | 77 | $0.00018 | 0.9 |  |
| 2026-10-24 06:26 | 1442 | tags 2 arm 1 opus–opus #3 m41–50 | claude-haiku-5-5 | 1279 | 680 | $0.00047 | 2.2 |  |
| 2026-10-24 06:26 | 1443 | tags 1 arm 1 opus–opus #3 m51–60 | claude-haiku-5-5 | 1093 | 680 | $0.00045 | 2.2 |  |
| 2026-10-24 06:26 | 1444 | tags 2 arm 1 opus–opus #3 m51–60 | claude-haiku-5-5 | 1093 | 680 | $0.00045 | 2.7 |  |
| 2026-10-24 06:26 | 1445 | subject arm 2 fable–fable #3 B m6 | claude-fable-5-1 | 4 | 1747 | $0.11226 | 31.7 |  |
| 2026-10-24 06:26 | 1446 | check arm 2 fable–fable #3 m6 | claude-haiku-5-5 | 2376 | 82 | $0.00028 | 0.8 |  |
| 2026-10-24 06:26 | 1447 | subject arm 2 fable–fable #4 B m2 | claude-fable-5-1 | 412 | 721 | $0.04017 | 13.6 |  |
| 2026-10-24 06:26 | 1448 | check arm 2 fable–fable #4 m2 | claude-haiku-5-5 | 1321 | 72 | $0.00017 | 1.2 |  |
| 2026-10-24 06:26 | 1449 | check referee arm 2 fable–fable #3 m6 | claude-opus-5-5 | 2376 | 92 | $0.01134 | 2.7 |  |
| 2026-10-24 06:26 | 1450 | tags referee arm 1 opus–opus #3 m11–20 | claude-opus-5-5 | 7551 | 1034 | $0.05088 | 9.4 |  |
| 2026-10-24 06:26 | 1451 | subject arm 2 sonnet–sonnet #3 B m4 | claude-sonnet-5-5 | 4 | 1101 | $0.01481 | 11.7 |  |
| 2026-10-24 06:26 | 1452 | check arm 2 sonnet–sonnet #3 m4 | claude-haiku-5-5 | 1646 | 83 | $0.00021 | 1 |  |
| 2026-10-24 06:26 | 1453 | subject arm 2 sonnet–sonnet #3 A m5 | claude-sonnet-5-5 | 4 | 588 | $0.00939 | 7.3 |  |
| 2026-10-24 06:26 | 1454 | check arm 2 sonnet–sonnet #3 m5 | claude-haiku-5-5 | 1580 | 83 | $0.00020 | 1.3 |  |
| 2026-10-24 06:26 | 1455 | subject arm 2 sonnet–sonnet #3 B m6 | claude-sonnet-5-5 | 4 | 631 | $0.00978 | 7.4 |  |
| 2026-10-24 06:26 | 1456 | check arm 2 sonnet–sonnet #3 m6 | claude-haiku-5-5 | 1534 | 84 | $0.00020 | 0.9 |  |
| 2026-10-24 06:26 | 1457 | subject arm 2 fable–fable #4 A m3 | claude-fable-5-1 | 4 | 1138 | $0.07020 | 23.4 |  |
| 2026-10-24 06:26 | 1458 | check arm 2 fable–fable #4 m3 | claude-haiku-5-5 | 1720 | 69 | $0.00021 | 0.7 |  |
| 2026-10-24 06:26 | 1459 | subject arm 2 fable–fable #3 A m7 | claude-fable-5-1 | 4 | 1751 | $0.11411 | 33.5 |  |
| 2026-10-24 06:26 | 1460 | subject arm 2 sonnet–sonnet #3 A m7 | claude-sonnet-5-5 | 4 | 664 | $0.01013 | 7.3 |  |
| 2026-10-24 06:26 | 1461 | check arm 2 sonnet–sonnet #3 m7 | claude-haiku-5-5 | 1610 | 75 | $0.00020 | 0.8 |  |
| 2026-10-24 06:26 | 1462 | check arm 2 fable–fable #3 m7 | claude-haiku-5-5 | 2384 | 80 | $0.00028 | 1.8 |  |
| 2026-10-24 06:26 | 1463 | subject arm 2 sonnet–sonnet #3 B m8 | claude-sonnet-5-5 | 4 | 216 | $0.00596 | 2.9 |  |
| 2026-10-24 06:26 | 1464 | check arm 2 sonnet–sonnet #3 m8 | claude-haiku-5-5 | 1191 | 73 | $0.00016 | 0.7 |  |
| 2026-10-24 06:26 | 1465 | tags 2 arm 2 sonnet–sonnet #3 m1–8 | claude-haiku-5-5 | 5232 | 546 | $0.00080 | 1.9 |  |
| 2026-10-24 06:26 | 1466 | tags 1 arm 2 sonnet–sonnet #3 m1–8 | claude-haiku-5-5 | 5232 | 546 | $0.00080 | 2 |  |
| 2026-10-24 06:26 | 1467 | subject arm 1 sonnet–sonnet #4 A m1 | claude-sonnet-5-5 | 40 | 274 | $0.00282 | 3 |  |
| 2026-10-24 06:26 | 1468 | check arm 1 sonnet–sonnet #4 m1 | claude-haiku-5-5 | 600 | 59 | $0.00009 | 0.7 |  |
| 2026-10-24 06:26 | 1469 | tags referee arm 2 sonnet–sonnet #3 m1–8 | claude-opus-5-5 | 5232 | 546 | $0.03185 | 4.5 |  |
| 2026-10-24 06:26 | 1470 | subject arm 1 sonnet–sonnet #4 B m2 | claude-sonnet-5-5 | 312 | 206 | $0.00268 | 2.8 |  |
| 2026-10-24 06:26 | 1471 | check arm 1 sonnet–sonnet #4 m2 | claude-haiku-5-5 | 699 | 65 | $0.00010 | 0.7 |  |
| 2026-10-24 06:26 | 1472 | subject arm 1 sonnet–sonnet #4 A m3 | claude-sonnet-5-5 | 424 | 118 | $0.00203 | 2 |  |
| 2026-10-24 06:26 | 1473 | check arm 1 sonnet–sonnet #4 m3 | claude-haiku-5-5 | 543 | 55 | $0.00008 | 0.7 |  |
| 2026-10-24 06:26 | 1474 | subject arm 2 fable–fable #3 B m8 | claude-fable-5-1 | 4 | 1355 | $0.09467 | 25 |  |
| 2026-10-24 06:26 | 1475 | check arm 2 fable–fable #3 m8 | claude-haiku-5-5 | 2025 | 97 | $0.00025 | 1.8 |  |
| 2026-10-24 06:26 | 1476 | subject arm 1 sonnet–sonnet #4 B m4 | claude-sonnet-5-5 | 4 | 243 | $0.00378 | 3.9 |  |
| 2026-10-24 06:26 | 1477 | check arm 1 sonnet–sonnet #4 m4 | claude-haiku-5-5 | 598 | 70 | $0.00009 | 1.2 |  |
| 2026-10-24 06:26 | 1478 | subject arm 2 fable–fable #4 B m4 | claude-fable-5-1 | 4 | 2118 | $0.12860 | 39 |  |
| 2026-10-24 06:26 | 1479 | check arm 2 fable–fable #4 m4 | claude-haiku-5-5 | 2268 | 73 | $0.00026 | 2 |  |
| 2026-10-24 06:26 | 1480 | subject arm 1 sonnet–sonnet #4 A m5 | claude-sonnet-5-5 | 4 | 126 | $0.00303 | 2.5 |  |
| 2026-10-24 06:26 | 1481 | check arm 1 sonnet–sonnet #4 m5 | claude-haiku-5-5 | 606 | 67 | $0.00009 | 0.8 |  |
| 2026-10-24 06:26 | 1482 | subject arm 1 sonnet–sonnet #4 B m6 | claude-sonnet-5-5 | 4 | 504 | $0.00588 | 9.4 |  |
| 2026-10-24 06:26 | 1483 | check arm 1 sonnet–sonnet #4 m6 | claude-haiku-5-5 | 597 | 70 | $0.00009 | 0.8 |  |
| 2026-10-24 06:26 | 1484 | subject arm 2 fable–fable #3 A m9 | claude-fable-5-1 | 4 | 1142 | $0.07979 | 21 |  |
| 2026-10-24 06:26 | 1485 | check arm 2 fable–fable #3 m9 | claude-haiku-5-5 | 1546 | 69 | $0.00019 | 0.8 |  |
| 2026-10-24 06:26 | 1486 | subject arm 1 sonnet–sonnet #4 A m7 | claude-sonnet-5-5 | 4 | 210 | $0.00295 | 3.3 |  |
| 2026-10-24 06:26 | 1487 | check arm 1 sonnet–sonnet #4 m7 | claude-haiku-5-5 | 681 | 78 | $0.00011 | 0.8 |  |
| 2026-10-24 06:26 | 1488 | subject arm 1 sonnet–sonnet #4 B m8 | claude-sonnet-5-5 | 4 | 401 | $0.00510 | 6.5 |  |
| 2026-10-24 06:26 | 1489 | check arm 1 sonnet–sonnet #4 m8 | claude-haiku-5-5 | 748 | 76 | $0.00011 | 0.8 |  |
| 2026-10-24 06:26 | 1490 | subject arm 2 fable–fable #3 B m10 | claude-fable-5-1 | 4 | 479 | $0.04091 | 11.2 |  |
| 2026-10-24 06:26 | 1491 | check arm 2 fable–fable #3 m10 | claude-haiku-5-5 | 1164 | 64 | $0.00015 | 0.7 |  |
| 2026-10-24 06:26 | 1492 | subject arm 1 sonnet–sonnet #4 A m9 | claude-sonnet-5-5 | 4 | 215 | $0.00344 | 3.2 |  |
| 2026-10-24 06:26 | 1493 | subject arm 2 fable–fable #4 A m5 | claude-fable-5-1 | 4 | 1951 | $0.12227 | 34.7 |  |
| 2026-10-24 06:26 | 1494 | check arm 1 sonnet–sonnet #4 m9 | claude-haiku-5-5 | 753 | 73 | $0.00011 | 0.8 |  |
| 2026-10-24 06:26 | 1495 | check arm 2 fable–fable #4 m5 | claude-haiku-5-5 | 2675 | 80 | $0.00031 | 1 |  |
| 2026-10-24 06:26 | 1496 | subject arm 2 fable–fable #3 A m11 | claude-fable-5-1 | 4 | 225 | $0.02360 | 4.6 |  |
| 2026-10-24 06:26 | 1497 | tags 1 arm 2 fable–fable #3 m1–10 | claude-haiku-5-5 | 8619 | 680 | $0.00120 | 2.3 |  |
| 2026-10-24 06:26 | 1498 | tags 2 arm 2 fable–fable #3 m1–10 | claude-haiku-5-5 | 8619 | 680 | $0.00120 | 2.5 |  |
| 2026-10-24 06:26 | 1499 | subject arm 1 sonnet–sonnet #4 B m10 | claude-sonnet-5-5 | 4 | 230 | $0.00364 | 3.4 |  |
| 2026-10-24 06:26 | 1500 | check arm 1 sonnet–sonnet #4 m10 | claude-haiku-5-5 | 760 | 70 | $0.00011 | 0.8 |  |
| 2026-10-24 06:26 | 1501 | tags referee arm 2 fable–fable #3 m1–10 | claude-opus-5-5 | 8619 | 680 | $0.04808 | 5.4 |  |
| 2026-10-24 06:26 | 1502 | subject arm 1 opus–opus #4 A m1 | claude-opus-5-5 | 40 | 570 | $0.01156 | 7.9 |  |
| 2026-10-24 06:26 | 1503 | check arm 1 opus–opus #4 m1 | claude-haiku-5-5 | 832 | 73 | $0.00012 | 0.8 |  |
| 2026-10-24 06:26 | 1504 | subject arm 1 sonnet–sonnet #4 A m11 | claude-sonnet-5-5 | 4 | 630 | $0.00770 | 7.3 |  |
| 2026-10-24 06:26 | 1505 | check arm 1 sonnet–sonnet #4 m11 | claude-haiku-5-5 | 1053 | 74 | $0.00014 | 1.7 |  |
| 2026-10-24 06:26 | 1506 | subject arm 1 opus–opus #4 B m2 | claude-opus-5-5 | 4 | 1291 | $0.02854 | 16.3 |  |
| 2026-10-24 06:26 | 1507 | check arm 1 opus–opus #4 m2 | claude-haiku-5-5 | 1656 | 70 | $0.00020 | 0.8 |  |
| 2026-10-24 06:26 | 1508 | subject arm 1 sonnet–sonnet #4 B m12 | claude-sonnet-5-5 | 4 | 1912 | $0.02130 | 18.4 |  |
| 2026-10-24 06:26 | 1509 | check arm 1 sonnet–sonnet #4 m12 | claude-haiku-5-5 | 1496 | 71 | $0.00019 | 1.1 |  |
| 2026-10-24 06:26 | 1510 | subject arm 2 fable–fable #4 B m6 | claude-fable-5-1 | 4 | 2948 | $0.17739 | 49.4 |  |
| 2026-10-24 06:26 | 1511 | check arm 2 fable–fable #4 m6 | claude-haiku-5-5 | 2924 | 62 | $0.00032 | 0.8 |  |
| 2026-10-24 06:26 | 1512 | subject arm 1 sonnet–sonnet #4 A m13 | claude-sonnet-5-5 | 4 | 1320 | $0.01653 | 13.5 |  |
| 2026-10-24 06:26 | 1513 | check arm 1 sonnet–sonnet #4 m13 | claude-haiku-5-5 | 1703 | 66 | $0.00020 | 0.8 |  |
| 2026-10-24 06:26 | 1514 | subject arm 1 opus–opus #4 A m3 | claude-opus-5-5 | 4 | 2506 | $0.05702 | 26.7 |  |
| 2026-10-24 06:26 | 1515 | check arm 1 opus–opus #4 m3 | claude-haiku-5-5 | 2305 | 73 | $0.00027 | 0.9 |  |
| 2026-10-24 06:26 | 1516 | subject arm 1 sonnet–sonnet #4 B m14 | claude-sonnet-5-5 | 4 | 1467 | $0.01862 | 14.3 |  |
| 2026-10-24 06:26 | 1517 | check arm 1 sonnet–sonnet #4 m14 | claude-haiku-5-5 | 1867 | 97 | $0.00024 | 1.2 |  |
| 2026-10-24 06:26 | 1518 | subject arm 1 sonnet–sonnet #4 A m15 | claude-sonnet-5-5 | 4 | 1556 | $0.02006 | 15.8 |  |
| 2026-10-24 06:26 | 1519 | check arm 1 sonnet–sonnet #4 m15 | claude-haiku-5-5 | 2032 | 82 | $0.00024 | 1.1 |  |
| 2026-10-24 06:26 | 1520 | subject arm 1 opus–opus #4 B m4 | claude-opus-5-5 | 4 | 2445 | $0.05897 | 25.5 |  |
| 2026-10-24 06:26 | 1521 | check arm 1 opus–opus #4 m4 | claude-haiku-5-5 | 2925 | 66 | $0.00033 | 1 |  |
| 2026-10-24 06:26 | 1522 | subject arm 2 fable–fable #4 A m7 | claude-fable-5-1 | 4 | 2137 | $0.14026 | 37.1 |  |
| 2026-10-24 06:26 | 1523 | check arm 2 fable–fable #4 m7 | claude-haiku-5-5 | 2978 | 72 | $0.00033 | 1.7 |  |
| 2026-10-24 06:26 | 1524 | check referee arm 2 fable–fable #4 m7 | claude-opus-5-5 | 2978 | 61 | $0.01313 | 2 |  |
| 2026-10-24 06:26 | 1525 | subject arm 1 sonnet–sonnet #4 B m16 | claude-sonnet-5-5 | 4 | 1851 | $0.02356 | 18.9 |  |
| 2026-10-24 06:26 | 1526 | check arm 1 sonnet–sonnet #4 m16 | claude-haiku-5-5 | 2274 | 93 | $0.00027 | 1.6 |  |
| 2026-10-24 06:26 | 1527 | subject arm 1 sonnet–sonnet #4 A m17 | claude-sonnet-5-5 | 4 | 2106 | $0.02688 | 19.5 |  |
| 2026-10-24 06:26 | 1528 | check arm 1 sonnet–sonnet #4 m17 | claude-haiku-5-5 | 2624 | 86 | $0.00031 | 1.4 |  |
| 2026-10-24 06:26 | 1529 | subject arm 1 opus–opus #4 A m5 | claude-opus-5-5 | 4 | 4677 | $0.10688 | 48.2 |  |
| 2026-10-24 06:26 | 1530 | check arm 1 opus–opus #4 m5 | claude-haiku-5-5 | 3277 | 73 | $0.00036 | 1.1 |  |
| 2026-10-24 06:26 | 1531 | check referee arm 1 opus–opus #4 m5 | claude-opus-5-5 | 3277 | 58 | $0.01427 | 1.8 |  |
| 2026-10-24 06:26 | 1532 | subject arm 2 fable–fable #4 B m8 | claude-fable-5-1 | 4 | 2925 | $0.18062 | 51.7 |  |
| 2026-10-24 06:26 | 1533 | check arm 2 fable–fable #4 m8 | claude-haiku-5-5 | 2814 | 78 | $0.00032 | 1.7 |  |
| 2026-10-24 06:26 | 1534 | subject arm 1 sonnet–sonnet #4 B m18 | claude-sonnet-5-5 | 4 | 2275 | $0.02963 | 23.3 |  |
| 2026-10-24 06:26 | 1535 | check arm 1 sonnet–sonnet #4 m18 | claude-haiku-5-5 | 2948 | 80 | $0.00033 | 1.2 |  |
| 2026-10-24 06:26 | 1536 | check referee arm 1 sonnet–sonnet #4 m18 | claude-opus-5-5 | 2948 | 61 | $0.01301 | 1.8 |  |
| 2026-10-24 06:26 | 1537 | subject arm 1 opus–opus #4 B m6 | claude-opus-5-5 | 4 | 2371 | $0.06275 | 26.1 |  |
| 2026-10-24 06:26 | 1538 | check arm 1 opus–opus #4 m6 | claude-haiku-5-5 | 3355 | 64 | $0.00037 | 0.8 |  |
| 2026-10-24 06:26 | 1539 | subject arm 1 sonnet–sonnet #4 A m19 | claude-sonnet-5-5 | 4 | 1419 | $0.02209 | 14.6 |  |
| 2026-10-24 06:26 | 1540 | check arm 1 sonnet–sonnet #4 m19 | claude-haiku-5-5 | 2714 | 86 | $0.00031 | 2.1 |  |
| 2026-10-24 06:26 | 1541 | subject arm 1 opus–opus #4 A m7 | claude-opus-5-5 | 4 | 1953 | $0.05507 | 24.4 |  |
| 2026-10-24 06:26 | 1542 | subject arm 1 sonnet–sonnet #4 B m20 | claude-sonnet-5-5 | 4 | 1721 | $0.02477 | 18.5 |  |
| 2026-10-24 06:26 | 1543 | check arm 1 opus–opus #4 m7 | claude-haiku-5-5 | 3163 | 73 | $0.00035 | 0.9 |  |
| 2026-10-24 06:26 | 1544 | check arm 1 sonnet–sonnet #4 m20 | claude-haiku-5-5 | 2449 | 76 | $0.00028 | 0.9 |  |
| 2026-10-24 06:26 | 1545 | subject arm 2 fable–fable #4 A m9 | claude-fable-5-1 | 4 | 3287 | $0.19703 | 58.6 |  |
| 2026-10-24 06:26 | 1546 | check arm 2 fable–fable #4 m9 | claude-haiku-5-5 | 3082 | 82 | $0.00035 | 1.1 |  |
| 2026-10-24 06:26 | 1547 | subject arm 1 sonnet–sonnet #4 A m21 | claude-sonnet-5-5 | 4 | 1220 | $0.01938 | 12.7 |  |
| 2026-10-24 06:26 | 1548 | check arm 1 sonnet–sonnet #4 m21 | claude-haiku-5-5 | 2673 | 77 | $0.00031 | 2.7 |  |
| 2026-10-24 06:26 | 1549 | subject arm 1 opus–opus #4 B m8 | claude-opus-5-5 | 4 | 1601 | $0.04737 | 21.6 |  |
| 2026-10-24 06:26 | 1550 | check arm 1 opus–opus #4 m8 | claude-haiku-5-5 | 2522 | 78 | $0.00029 | 1 |  |
| 2026-10-24 06:26 | 1551 | subject arm 1 sonnet–sonnet #4 B m22 | claude-sonnet-5-5 | 4 | 969 | $0.01763 | 10 |  |
| 2026-10-24 06:26 | 1552 | check arm 1 sonnet–sonnet #4 m22 | claude-haiku-5-5 | 2504 | 74 | $0.00029 | 1 |  |
| 2026-10-24 06:26 | 1553 | subject arm 1 sonnet–sonnet #4 A m23 | claude-sonnet-5-5 | 4 | 1917 | $0.02691 | 17.7 |  |
| 2026-10-24 06:26 | 1554 | check arm 1 sonnet–sonnet #4 m23 | claude-haiku-5-5 | 2483 | 82 | $0.00029 | 1.4 |  |
| 2026-10-24 06:26 | 1555 | subject arm 1 opus–opus #4 A m9 | claude-opus-5-5 | 4 | 2288 | $0.05822 | 28.6 |  |
| 2026-10-24 06:26 | 1556 | check arm 1 opus–opus #4 m9 | claude-haiku-5-5 | 2566 | 74 | $0.00029 | 0.7 |  |
| 2026-10-24 06:26 | 1557 | subject arm 1 sonnet–sonnet #4 B m24 | claude-sonnet-5-5 | 4 | 1630 | $0.02424 | 16.4 |  |
| 2026-10-24 06:26 | 1558 | check arm 1 sonnet–sonnet #4 m24 | claude-haiku-5-5 | 2433 | 77 | $0.00028 | 1.6 |  |
| 2026-10-24 06:26 | 1559 | subject arm 2 fable–fable #4 B m10 | claude-fable-5-1 | 4 | 3732 | $0.22294 | 66.8 |  |
| 2026-10-24 06:26 | 1560 | check arm 2 fable–fable #4 m10 | claude-haiku-5-5 | 3470 | 101 | $0.00040 | 1.3 |  |
| 2026-10-24 06:26 | 1561 | subject arm 1 sonnet–sonnet #4 A m25 | claude-sonnet-5-5 | 4 | 971 | $0.01772 | 10 |  |
| 2026-10-24 06:26 | 1562 | subject arm 1 opus–opus #4 B m10 | claude-opus-5-5 | 4 | 1944 | $0.05182 | 24.2 |  |
| 2026-10-24 06:26 | 1563 | check arm 1 sonnet–sonnet #4 m25 | claude-haiku-5-5 | 2205 | 75 | $0.00026 | 1.3 |  |
| 2026-10-24 06:26 | 1564 | check arm 1 opus–opus #4 m10 | claude-haiku-5-5 | 2921 | 68 | $0.00033 | 0.7 |  |
| 2026-10-24 06:26 | 1565 | check referee arm 2 fable–fable #4 m10 | claude-opus-5-5 | 3470 | 52 | $0.01492 | 1.8 |  |
| 2026-10-24 06:26 | 1566 | subject arm 1 sonnet–sonnet #4 B m26 | claude-sonnet-5-5 | 4 | 605 | $0.01372 | 7.2 |  |
| 2026-10-24 06:26 | 1567 | check arm 1 sonnet–sonnet #4 m26 | claude-haiku-5-5 | 1891 | 72 | $0.00023 | 1.3 |  |
| 2026-10-24 06:26 | 1568 | subject arm 1 sonnet–sonnet #4 A m27 | claude-sonnet-5-5 | 4 | 439 | $0.01146 | 4.7 |  |
| 2026-10-24 06:26 | 1569 | check arm 1 sonnet–sonnet #4 m27 | claude-haiku-5-5 | 1359 | 65 | $0.00017 | 1.3 |  |
| 2026-10-24 06:26 | 1570 | subject arm 1 opus–opus #4 A m11 | claude-opus-5-5 | 4 | 1218 | $0.03925 | 16.2 |  |
| 2026-10-24 06:26 | 1571 | check arm 1 opus–opus #4 m11 | claude-haiku-5-5 | 2493 | 76 | $0.00029 | 0.8 |  |
| 2026-10-24 06:26 | 1572 | subject arm 1 sonnet–sonnet #4 B m28 | claude-sonnet-5-5 | 4 | 206 | $0.00800 | 3 |  |
| 2026-10-24 06:26 | 1573 | check arm 1 sonnet–sonnet #4 m28 | claude-haiku-5-5 | 960 | 78 | $0.00014 | 1.2 |  |
| 2026-10-24 06:26 | 1574 | check referee arm 1 sonnet–sonnet #4 m28 | claude-opus-5-5 | 960 | 60 | $0.00504 | 1.2 |  |
| 2026-10-24 06:26 | 1575 | subject arm 1 sonnet–sonnet #4 A m29 | claude-sonnet-5-5 | 4 | 97 | $0.00603 | 1.7 |  |
| 2026-10-24 06:26 | 1576 | check arm 1 sonnet–sonnet #4 m29 | claude-haiku-5-5 | 618 | 61 | $0.00009 | 1.6 |  |
| 2026-10-24 06:26 | 1577 | subject arm 1 sonnet–sonnet #4 B m30 | claude-sonnet-5-5 | 4 | 57 | $0.00486 | 1.5 |  |
| 2026-10-24 06:26 | 1578 | check arm 1 sonnet–sonnet #4 m30 | claude-haiku-5-5 | 469 | 64 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 1579 | subject arm 1 sonnet–sonnet #4 A m31 | claude-sonnet-5-5 | 4 | 48 | $0.00444 | 1.3 |  |
| 2026-10-24 06:26 | 1580 | check arm 1 sonnet–sonnet #4 m31 | claude-haiku-5-5 | 420 | 71 | $0.00008 | 1.7 |  |
| 2026-10-24 06:26 | 1581 | subject arm 1 opus–opus #4 B m12 | claude-opus-5-5 | 4 | 1497 | $0.04296 | 20 |  |
| 2026-10-24 06:26 | 1582 | check arm 1 opus–opus #4 m12 | claude-haiku-5-5 | 2139 | 76 | $0.00025 | 0.8 |  |
| 2026-10-24 06:26 | 1583 | subject arm 1 sonnet–sonnet #4 B m32 | claude-sonnet-5-5 | 4 | 20 | $0.00406 | 1.3 |  |
| 2026-10-24 06:26 | 1584 | check arm 1 sonnet–sonnet #4 m32 | claude-haiku-5-5 | 383 | 63 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 1585 | subject arm 1 sonnet–sonnet #4 A m33 | claude-sonnet-5-5 | 4 | 34 | $0.00412 | 1.5 |  |
| 2026-10-24 06:26 | 1586 | subject arm 2 fable–fable #4 A m11 | claude-fable-5-1 | 4 | 2339 | $0.15846 | 45.9 |  |
| 2026-10-24 06:26 | 1587 | check arm 1 sonnet–sonnet #4 m33 | claude-haiku-5-5 | 369 | 71 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 1588 | check arm 2 fable–fable #4 m11 | claude-haiku-5-5 | 3230 | 101 | $0.00037 | 1.5 |  |
| 2026-10-24 06:26 | 1589 | subject arm 1 sonnet–sonnet #4 B m34 | claude-sonnet-5-5 | 4 | 116 | $0.00491 | 2.3 |  |
| 2026-10-24 06:26 | 1590 | check arm 1 sonnet–sonnet #4 m34 | claude-haiku-5-5 | 368 | 55 | $0.00006 | 1.5 |  |
| 2026-10-24 06:26 | 1591 | subject arm 1 sonnet–sonnet #4 A m35 | claude-sonnet-5-5 | 4 | 19 | $0.00394 | 0.9 |  |
| 2026-10-24 06:26 | 1592 | check arm 1 sonnet–sonnet #4 m35 | claude-haiku-5-5 | 353 | 51 | $0.00006 | 1.3 |  |
| 2026-10-24 06:26 | 1593 | subject arm 1 sonnet–sonnet #4 B m36 | claude-sonnet-5-5 | 4 | 238 | $0.00610 | 3.2 |  |
| 2026-10-24 06:26 | 1594 | check arm 1 sonnet–sonnet #4 m36 | claude-haiku-5-5 | 405 | 61 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 1595 | subject arm 1 sonnet–sonnet #4 A m37 | claude-sonnet-5-5 | 4 | 42 | $0.00428 | 1.8 |  |
| 2026-10-24 06:26 | 1596 | check arm 1 sonnet–sonnet #4 m37 | claude-haiku-5-5 | 428 | 78 | $0.00008 | 0.7 |  |
| 2026-10-24 06:26 | 1597 | subject arm 1 opus–opus #4 A m13 | claude-opus-5-5 | 4 | 1939 | $0.05028 | 24.1 |  |
| 2026-10-24 06:26 | 1598 | check arm 1 opus–opus #4 m13 | claude-haiku-5-5 | 2355 | 72 | $0.00027 | 1.6 |  |
| 2026-10-24 06:26 | 1599 | subject arm 1 sonnet–sonnet #4 B m38 | claude-sonnet-5-5 | 4 | 18 | $0.00410 | 1.1 |  |
| 2026-10-24 06:26 | 1600 | check arm 1 sonnet–sonnet #4 m38 | claude-haiku-5-5 | 375 | 64 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 1601 | subject arm 1 sonnet–sonnet #4 A m39 | claude-sonnet-5-5 | 4 | 19 | $0.00399 | 1.3 |  |
| 2026-10-24 06:26 | 1602 | check arm 1 sonnet–sonnet #4 m39 | claude-haiku-5-5 | 352 | 69 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 1603 | subject arm 2 fable–fable #4 B m12 | claude-fable-5-1 | 4 | 1436 | $0.11068 | 26.7 |  |
| 2026-10-24 06:26 | 1604 | check arm 2 fable–fable #4 m12 | claude-haiku-5-5 | 2265 | 65 | $0.00026 | 1 |  |
| 2026-10-24 06:26 | 1605 | subject arm 1 sonnet–sonnet #4 B m40 | claude-sonnet-5-5 | 4 | 46 | $0.00421 | 1.6 |  |
| 2026-10-24 06:26 | 1606 | check arm 1 sonnet–sonnet #4 m40 | claude-haiku-5-5 | 380 | 61 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 1607 | subject arm 1 sonnet–sonnet #4 A m41 | claude-sonnet-5-5 | 4 | 13 | $0.00396 | 1.2 |  |
| 2026-10-24 06:26 | 1608 | check arm 1 sonnet–sonnet #4 m41 | claude-haiku-5-5 | 374 | 69 | $0.00007 | 1.1 |  |
| 2026-10-24 06:26 | 1609 | subject arm 1 sonnet–sonnet #4 B m42 | claude-sonnet-5-5 | 4 | 33 | $0.00414 | 1.4 |  |
| 2026-10-24 06:26 | 1610 | check arm 1 sonnet–sonnet #4 m42 | claude-haiku-5-5 | 361 | 76 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 1611 | subject arm 2 fable–fable #4 A m13 | claude-fable-5-1 | 4 | 504 | $0.05243 | 9.9 |  |
| 2026-10-24 06:26 | 1612 | check arm 2 fable–fable #4 m13 | claude-haiku-5-5 | 1311 | 83 | $0.00017 | 1.3 |  |
| 2026-10-24 06:26 | 1613 | tags 1 arm 2 fable–fable #4 m11–13 | claude-haiku-5-5 | 4854 | 211 | $0.00059 | 1 |  |
| 2026-10-24 06:26 | 1614 | subject arm 1 sonnet–sonnet #4 A m43 | claude-sonnet-5-5 | 4 | 22 | $0.00401 | 1.7 |  |
| 2026-10-24 06:26 | 1615 | tags 2 arm 2 fable–fable #4 m1–10 | claude-haiku-5-5 | 12251 | 680 | $0.00157 | 2.3 |  |
| 2026-10-24 06:26 | 1616 | check arm 1 sonnet–sonnet #4 m43 | claude-haiku-5-5 | 370 | 68 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 1617 | tags 1 arm 2 fable–fable #4 m1–10 | claude-haiku-5-5 | 12251 | 680 | $0.00157 | 3.2 |  |
| 2026-10-24 06:26 | 1618 | tags 2 arm 2 fable–fable #4 m11–13 | claude-haiku-5-5 | 4854 | 211 | $0.00059 | 1.1 |  |
| 2026-10-24 06:26 | 1619 | subject arm 1 opus–opus #4 B m14 | claude-opus-5-5 | 4 | 2111 | $0.05499 | 27.9 |  |
| 2026-10-24 06:26 | 1620 | subject arm 1 sonnet–sonnet #4 B m44 | claude-sonnet-5-5 | 4 | 143 | $0.00525 | 2.6 |  |
| 2026-10-24 06:26 | 1621 | check arm 1 opus–opus #4 m14 | claude-haiku-5-5 | 2563 | 82 | $0.00030 | 0.8 |  |
| 2026-10-24 06:26 | 1622 | subject arm 2 opus–opus #4 A m1 | claude-opus-5-5 | 59 | 449 | $0.00922 | 6.3 |  |
| 2026-10-24 06:26 | 1623 | check arm 1 sonnet–sonnet #4 m44 | claude-haiku-5-5 | 391 | 69 | $0.00007 | 1.3 |  |
| 2026-10-24 06:26 | 1624 | check arm 2 opus–opus #4 m1 | claude-haiku-5-5 | 736 | 60 | $0.00010 | 0.9 |  |
| 2026-10-24 06:26 | 1625 | subject arm 1 sonnet–sonnet #4 A m45 | claude-sonnet-5-5 | 4 | 34 | $0.00422 | 1.3 |  |
| 2026-10-24 06:26 | 1626 | check arm 1 sonnet–sonnet #4 m45 | claude-haiku-5-5 | 403 | 62 | $0.00007 | 1.1 |  |
| 2026-10-24 06:26 | 1627 | tags referee arm 2 fable–fable #4 m1–10 | claude-opus-5-5 | 12251 | 990 | $0.06880 | 9 |  |
| 2026-10-24 06:26 | 1628 | subject arm 1 sonnet–sonnet #4 B m46 | claude-sonnet-5-5 | 4 | 30 | $0.00421 | 1.6 |  |
| 2026-10-24 06:26 | 1629 | check arm 1 sonnet–sonnet #4 m46 | claude-haiku-5-5 | 379 | 73 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 1630 | subject arm 1 sonnet–sonnet #4 A m47 | claude-sonnet-5-5 | 4 | 17 | $0.00403 | 1 |  |
| 2026-10-24 06:26 | 1631 | check arm 1 sonnet–sonnet #4 m47 | claude-haiku-5-5 | 362 | 54 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 1632 | subject arm 1 sonnet–sonnet #4 B m48 | claude-sonnet-5-5 | 4 | 21 | $0.00403 | 1.2 |  |
| 2026-10-24 06:26 | 1633 | check arm 1 sonnet–sonnet #4 m48 | claude-haiku-5-5 | 353 | 74 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 1634 | subject arm 2 opus–opus #4 B m2 | claude-opus-5-5 | 467 | 1086 | $0.02359 | 14.9 |  |
| 2026-10-24 06:26 | 1635 | check arm 2 opus–opus #4 m2 | claude-haiku-5-5 | 1529 | 72 | $0.00019 | 1 |  |
| 2026-10-24 06:26 | 1636 | subject arm 1 sonnet–sonnet #4 A m49 | claude-sonnet-5-5 | 4 | 21 | $0.00402 | 1 |  |
| 2026-10-24 06:26 | 1637 | check arm 1 sonnet–sonnet #4 m49 | claude-haiku-5-5 | 357 | 59 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 1638 | subject arm 1 sonnet–sonnet #4 B m50 | claude-sonnet-5-5 | 4 | 18 | $0.00400 | 1.1 |  |
| 2026-10-24 06:26 | 1639 | check arm 1 sonnet–sonnet #4 m50 | claude-haiku-5-5 | 354 | 66 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 1640 | subject arm 1 sonnet–sonnet #4 A m51 | claude-sonnet-5-5 | 4 | 20 | $0.00402 | 1.3 |  |
| 2026-10-24 06:26 | 1641 | check arm 1 sonnet–sonnet #4 m51 | claude-haiku-5-5 | 353 | 66 | $0.00007 | 1 |  |
| 2026-10-24 06:26 | 1642 | subject arm 1 sonnet–sonnet #4 B m52 | claude-sonnet-5-5 | 4 | 85 | $0.00467 | 1.7 |  |
| 2026-10-24 06:26 | 1643 | check arm 1 sonnet–sonnet #4 m52 | claude-haiku-5-5 | 420 | 63 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 1644 | subject arm 1 opus–opus #4 A m15 | claude-opus-5-5 | 4 | 2531 | $0.06461 | 32.2 |  |
| 2026-10-24 06:26 | 1645 | check arm 1 opus–opus #4 m15 | claude-haiku-5-5 | 2688 | 71 | $0.00030 | 1.5 |  |
| 2026-10-24 06:26 | 1646 | subject arm 1 sonnet–sonnet #4 A m53 | claude-sonnet-5-5 | 4 | 61 | $0.00460 | 1.5 |  |
| 2026-10-24 06:26 | 1647 | check arm 1 sonnet–sonnet #4 m53 | claude-haiku-5-5 | 461 | 62 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 1648 | subject arm 1 sonnet–sonnet #4 B m54 | claude-sonnet-5-5 | 4 | 37 | $0.00447 | 1.8 |  |
| 2026-10-24 06:26 | 1649 | check arm 1 sonnet–sonnet #4 m54 | claude-haiku-5-5 | 413 | 62 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 1650 | subject arm 2 opus–opus #4 A m3 | claude-opus-5-5 | 4 | 1975 | $0.04586 | 23.9 |  |
| 2026-10-24 06:26 | 1651 | check arm 2 opus–opus #4 m3 | claude-haiku-5-5 | 2305 | 80 | $0.00027 | 0.8 |  |
| 2026-10-24 06:26 | 1652 | subject arm 1 sonnet–sonnet #4 A m55 | claude-sonnet-5-5 | 4 | 37 | $0.00436 | 1.4 |  |
| 2026-10-24 06:26 | 1653 | check arm 1 sonnet–sonnet #4 m55 | claude-haiku-5-5 | 389 | 78 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 1654 | subject arm 1 sonnet–sonnet #4 B m56 | claude-sonnet-5-5 | 4 | 35 | $0.00430 | 1.5 |  |
| 2026-10-24 06:26 | 1655 | check arm 1 sonnet–sonnet #4 m56 | claude-haiku-5-5 | 387 | 70 | $0.00007 | 1.1 |  |
| 2026-10-24 06:26 | 1656 | subject arm 1 sonnet–sonnet #4 A m57 | claude-sonnet-5-5 | 4 | 23 | $0.00418 | 1.3 |  |
| 2026-10-24 06:26 | 1657 | check arm 1 sonnet–sonnet #4 m57 | claude-haiku-5-5 | 373 | 67 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 1658 | subject arm 1 sonnet–sonnet #4 B m58 | claude-sonnet-5-5 | 4 | 11 | $0.00403 | 1.2 |  |
| 2026-10-24 06:26 | 1659 | check arm 1 sonnet–sonnet #4 m58 | claude-haiku-5-5 | 349 | 59 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 1660 | subject arm 1 opus–opus #4 B m16 | claude-opus-5-5 | 4 | 1933 | $0.05350 | 26.3 |  |
| 2026-10-24 06:26 | 1661 | subject arm 1 sonnet–sonnet #4 A m59 | claude-sonnet-5-5 | 4 | 11 | $0.00398 | 1.2 |  |
| 2026-10-24 06:26 | 1662 | check arm 1 opus–opus #4 m16 | claude-haiku-5-5 | 2783 | 71 | $0.00031 | 0.7 |  |
| 2026-10-24 06:26 | 1663 | check arm 1 sonnet–sonnet #4 m59 | claude-haiku-5-5 | 337 | 56 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 1664 | subject arm 1 sonnet–sonnet #4 B m60 | claude-sonnet-5-5 | 4 | 59 | $0.00443 | 1.4 |  |
| 2026-10-24 06:26 | 1665 | check arm 1 sonnet–sonnet #4 m60 | claude-haiku-5-5 | 385 | 54 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 1666 | tags 1 arm 1 sonnet–sonnet #4 m1–10 | claude-haiku-5-5 | 2856 | 680 | $0.00063 | 2.3 |  |
| 2026-10-24 06:26 | 1667 | tags 2 arm 1 sonnet–sonnet #4 m1–10 | claude-haiku-5-5 | 2856 | 680 | $0.00063 | 2.3 |  |
| 2026-10-24 06:26 | 1668 | tags 1 arm 1 sonnet–sonnet #4 m11–20 | claude-haiku-5-5 | 10744 | 680 | $0.00141 | 2.7 |  |
| 2026-10-24 06:26 | 1669 | subject arm 2 opus–opus #4 B m4 | claude-opus-5-5 | 4 | 1992 | $0.05212 | 24.4 |  |
| 2026-10-24 06:26 | 1670 | check arm 2 opus–opus #4 m4 | claude-haiku-5-5 | 2608 | 77 | $0.00030 | 0.8 |  |
| 2026-10-24 06:26 | 1671 | subject arm 1 opus–opus #4 A m17 | claude-opus-5-5 | 4 | 792 | $0.03138 | 10.4 |  |
| 2026-10-24 06:26 | 1672 | tags 1 arm 1 sonnet–sonnet #4 m21–30 | claude-haiku-5-5 | 8875 | 680 | $0.00123 | 2.5 |  |
| 2026-10-24 06:26 | 1673 | tags 2 arm 1 sonnet–sonnet #4 m21–30 | claude-haiku-5-5 | 8875 | 680 | $0.00123 | 2.5 |  |
| 2026-10-24 06:26 | 1674 | check arm 1 opus–opus #4 m17 | claude-haiku-5-5 | 1951 | 69 | $0.00023 | 0.7 |  |
| 2026-10-24 06:26 | 1675 | tags 2 arm 1 sonnet–sonnet #4 m11–20 | claude-haiku-5-5 | 10744 | 680 | $0.00141 | 3.1 |  |
| 2026-10-24 06:26 | 1676 | subject arm 1 fable–fable #4 A m1 | claude-fable-5-1 | 40 | 529 | $0.02685 | 10.9 |  |
| 2026-10-24 06:26 | 1677 | tags 1 arm 1 sonnet–sonnet #4 m41–50 | claude-haiku-5-5 | 1364 | 680 | $0.00048 | 2.1 |  |
| 2026-10-24 06:26 | 1678 | tags 2 arm 1 sonnet–sonnet #4 m31–40 | claude-haiku-5-5 | 1448 | 680 | $0.00048 | 2.5 |  |
| 2026-10-24 06:26 | 1679 | check arm 1 fable–fable #4 m1 | claude-haiku-5-5 | 762 | 71 | $0.00011 | 0.8 |  |
| 2026-10-24 06:26 | 1680 | tags 1 arm 1 sonnet–sonnet #4 m31–40 | claude-haiku-5-5 | 1448 | 1201 | $0.00075 | 4.2 |  |
| 2026-10-24 06:26 | 1681 | subject arm 1 opus–opus #4 B m18 | claude-opus-5-5 | 4 | 348 | $0.01859 | 4.8 |  |
| 2026-10-24 06:26 | 1682 | check arm 1 opus–opus #4 m18 | claude-haiku-5-5 | 986 | 70 | $0.00013 | 0.9 |  |
| 2026-10-24 06:26 | 1683 | tags 1 arm 1 sonnet–sonnet #4 m51–60 | claude-haiku-5-5 | 1452 | 680 | $0.00049 | 2.2 |  |
| 2026-10-24 06:26 | 1684 | tags 2 arm 1 sonnet–sonnet #4 m41–50 | claude-haiku-5-5 | 1364 | 680 | $0.00048 | 2.7 |  |
| 2026-10-24 06:26 | 1685 | tags 2 arm 1 sonnet–sonnet #4 m51–60 | claude-haiku-5-5 | 1452 | 680 | $0.00049 | 2.2 |  |
| 2026-10-24 06:26 | 1686 | subject arm 1 opus–opus #4 A m19 | claude-opus-5-5 | 4 | 209 | $0.01123 | 3.9 |  |
| 2026-10-24 06:26 | 1687 | check arm 1 opus–opus #4 m19 | claude-haiku-5-5 | 656 | 61 | $0.00010 | 0.7 |  |
| 2026-10-24 06:26 | 1688 | tags referee arm 1 sonnet–sonnet #4 m31–40 | claude-opus-5-5 | 1448 | 680 | $0.01939 | 5.6 |  |
| 2026-10-24 06:26 | 1689 | subject arm 1 opus–opus #4 B m20 | claude-opus-5-5 | 4 | 80 | $0.00708 | 5.8 |  |
| 2026-10-24 06:26 | 1690 | check arm 1 opus–opus #4 m20 | claude-haiku-5-5 | 433 | 56 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 1691 | subject arm 2 opus–opus #4 A m5 | claude-opus-5-5 | 4 | 2400 | $0.05973 | 27.4 |  |
| 2026-10-24 06:26 | 1692 | check arm 2 opus–opus #4 m5 | claude-haiku-5-5 | 2729 | 72 | $0.00031 | 0.8 |  |
| 2026-10-24 06:26 | 1693 | subject arm 1 opus–opus #4 A m21 | claude-opus-5-5 | 4 | 216 | $0.00874 | 3.2 |  |
| 2026-10-24 06:26 | 1694 | check arm 1 opus–opus #4 m21 | claude-haiku-5-5 | 335 | 59 | $0.00006 | 1.3 |  |
| 2026-10-24 06:26 | 1695 | subject arm 1 opus–opus #4 B m22 | claude-opus-5-5 | 4 | 180 | $0.00755 | 2.8 |  |
| 2026-10-24 06:26 | 1696 | check arm 1 opus–opus #4 m22 | claude-haiku-5-5 | 339 | 54 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 1697 | subject arm 1 fable–fable #4 B m2 | claude-fable-5-1 | 474 | 1575 | $0.08349 | 29.7 |  |
| 2026-10-24 06:26 | 1698 | check arm 1 fable–fable #4 m2 | claude-haiku-5-5 | 1633 | 67 | $0.00020 | 2.1 |  |
| 2026-10-24 06:26 | 1699 | subject arm 1 opus–opus #4 A m23 | claude-opus-5-5 | 4 | 121 | $0.00639 | 2.2 |  |
| 2026-10-24 06:26 | 1700 | check arm 1 opus–opus #4 m23 | claude-haiku-5-5 | 348 | 55 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 1701 | subject arm 1 opus–opus #4 B m24 | claude-opus-5-5 | 4 | 229 | $0.00860 | 3.3 |  |
| 2026-10-24 06:26 | 1702 | check arm 1 opus–opus #4 m24 | claude-haiku-5-5 | 349 | 60 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 1703 | subject arm 1 opus–opus #4 A m25 | claude-opus-5-5 | 4 | 204 | $0.00810 | 3.6 |  |
| 2026-10-24 06:26 | 1704 | check arm 1 opus–opus #4 m25 | claude-haiku-5-5 | 366 | 59 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 1705 | subject arm 1 opus–opus #4 B m26 | claude-opus-5-5 | 4 | 167 | $0.00745 | 3.2 |  |
| 2026-10-24 06:26 | 1706 | check arm 1 opus–opus #4 m26 | claude-haiku-5-5 | 375 | 61 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 1707 | subject arm 2 opus–opus #4 B m6 | claude-opus-5-5 | 4 | 2841 | $0.06940 | 34 |  |
| 2026-10-24 06:26 | 1708 | check arm 2 opus–opus #4 m6 | claude-haiku-5-5 | 3249 | 66 | $0.00036 | 0.8 |  |
| 2026-10-24 06:26 | 1709 | subject arm 1 opus–opus #4 A m27 | claude-opus-5-5 | 4 | 139 | $0.00694 | 2.8 |  |
| 2026-10-24 06:26 | 1710 | check arm 1 opus–opus #4 m27 | claude-haiku-5-5 | 340 | 64 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 1711 | subject arm 1 opus–opus #4 B m28 | claude-opus-5-5 | 4 | 158 | $0.00715 | 3.9 |  |
| 2026-10-24 06:26 | 1712 | check arm 1 opus–opus #4 m28 | claude-haiku-5-5 | 328 | 57 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 1713 | subject arm 1 opus–opus #4 A m29 | claude-opus-5-5 | 4 | 125 | $0.00644 | 2.6 |  |
| 2026-10-24 06:26 | 1714 | check arm 1 opus–opus #4 m29 | claude-haiku-5-5 | 334 | 63 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 1715 | subject arm 1 fable–fable #4 A m3 | claude-fable-5-1 | 4 | 2132 | $0.12356 | 41.1 |  |
| 2026-10-24 06:26 | 1716 | subject arm 1 opus–opus #4 B m30 | claude-opus-5-5 | 4 | 127 | $0.00651 | 2.4 |  |
| 2026-10-24 06:26 | 1717 | check arm 1 fable–fable #4 m3 | claude-haiku-5-5 | 2341 | 81 | $0.00027 | 1.1 |  |
| 2026-10-24 06:26 | 1718 | check arm 1 opus–opus #4 m30 | claude-haiku-5-5 | 332 | 51 | $0.00006 | 1.9 |  |
| 2026-10-24 06:26 | 1719 | subject arm 1 opus–opus #4 A m31 | claude-opus-5-5 | 4 | 209 | $0.00814 | 3.4 |  |
| 2026-10-24 06:26 | 1720 | check arm 1 opus–opus #4 m31 | claude-haiku-5-5 | 376 | 67 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 1721 | subject arm 2 opus–opus #4 A m7 | claude-opus-5-5 | 4 | 2396 | $0.06332 | 28.3 |  |
| 2026-10-24 06:26 | 1722 | check arm 2 opus–opus #4 m7 | claude-haiku-5-5 | 3276 | 78 | $0.00037 | 0.7 |  |
| 2026-10-24 06:26 | 1723 | subject arm 1 opus–opus #4 B m32 | claude-opus-5-5 | 4 | 77 | $0.00572 | 1.9 |  |
| 2026-10-24 06:26 | 1724 | check arm 1 opus–opus #4 m32 | claude-haiku-5-5 | 402 | 57 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 1725 | subject arm 1 opus–opus #4 A m33 | claude-opus-5-5 | 4 | 103 | $0.00637 | 3.2 |  |
| 2026-10-24 06:26 | 1726 | check arm 1 opus–opus #4 m33 | claude-haiku-5-5 | 365 | 64 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 1727 | subject arm 1 opus–opus #4 B m34 | claude-opus-5-5 | 4 | 122 | $0.00658 | 2.8 |  |
| 2026-10-24 06:26 | 1728 | check arm 1 opus–opus #4 m34 | claude-haiku-5-5 | 370 | 62 | $0.00007 | 1 |  |
| 2026-10-24 06:26 | 1729 | subject arm 1 opus–opus #4 A m35 | claude-opus-5-5 | 4 | 102 | $0.00621 | 2.1 |  |
| 2026-10-24 06:26 | 1730 | check arm 1 opus–opus #4 m35 | claude-haiku-5-5 | 363 | 58 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 1731 | subject arm 2 opus–opus #4 B m8 | claude-opus-5-5 | 4 | 1290 | $0.04159 | 16.3 |  |
| 2026-10-24 06:26 | 1732 | check arm 2 opus–opus #4 m8 | claude-haiku-5-5 | 2475 | 79 | $0.00029 | 1.3 |  |
| 2026-10-24 06:26 | 1733 | subject arm 1 opus–opus #4 B m36 | claude-opus-5-5 | 4 | 73 | $0.00560 | 2 |  |
| 2026-10-24 06:26 | 1734 | check arm 1 opus–opus #4 m36 | claude-haiku-5-5 | 331 | 52 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 1735 | subject arm 2 opus–opus #4 A m9 | claude-opus-5-5 | 4 | 331 | $0.01874 | 5.2 |  |
| 2026-10-24 06:26 | 1736 | tags 2 arm 2 opus–opus #4 m1–8 | claude-haiku-5-5 | 9598 | 546 | $0.00123 | 2 |  |
| 2026-10-24 06:26 | 1737 | subject arm 1 opus–opus #4 A m37 | claude-opus-5-5 | 4 | 265 | $0.00929 | 4.2 |  |
| 2026-10-24 06:26 | 1738 | tags 1 arm 2 opus–opus #4 m1–8 | claude-haiku-5-5 | 9598 | 546 | $0.00123 | 2.8 |  |
| 2026-10-24 06:26 | 1739 | check arm 1 opus–opus #4 m37 | claude-haiku-5-5 | 377 | 292 | $0.00018 | 2 |  |
| 2026-10-24 06:26 | 1740 | subject arm 2 sonnet–sonnet #4 A m1 | claude-sonnet-5-5 | 59 | 451 | $0.00463 | 5 |  |
| 2026-10-24 06:26 | 1741 | check arm 2 sonnet–sonnet #4 m1 | claude-haiku-5-5 | 777 | 75 | $0.00012 | 0.8 |  |
| 2026-10-24 06:26 | 1742 | check referee arm 1 opus–opus #4 m37 | claude-opus-5-5 | 377 | 206 | $0.00563 | 2.8 |  |
| 2026-10-24 06:26 | 1743 | subject arm 1 opus–opus #4 B m38 | claude-opus-5-5 | 4 | 168 | $0.00758 | 3.2 |  |
| 2026-10-24 06:26 | 1744 | check arm 1 opus–opus #4 m38 | claude-haiku-5-5 | 430 | 77 | $0.00008 | 0.7 |  |
| 2026-10-24 06:26 | 1745 | subject arm 2 sonnet–sonnet #4 B m2 | claude-sonnet-5-5 | 508 | 660 | $0.00762 | 7.1 |  |
| 2026-10-24 06:26 | 1746 | subject arm 1 opus–opus #4 A m39 | claude-opus-5-5 | 4 | 15 | $0.00479 | 1.2 |  |
| 2026-10-24 06:26 | 1747 | check arm 1 opus–opus #4 m39 | claude-haiku-5-5 | 390 | 63 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 1748 | check arm 2 sonnet–sonnet #4 m2 | claude-haiku-5-5 | 1426 | 72 | $0.00018 | 0.8 |  |
| 2026-10-24 06:26 | 1749 | subject arm 1 fable–fable #4 B m4 | claude-fable-5-1 | 4 | 2937 | $0.17809 | 55.4 |  |
| 2026-10-24 06:26 | 1750 | check arm 1 fable–fable #4 m4 | claude-haiku-5-5 | 2927 | 91 | $0.00034 | 1.2 |  |
| 2026-10-24 06:26 | 1751 | subject arm 1 opus–opus #4 B m40 | claude-opus-5-5 | 4 | 8 | $0.00446 | 1.8 |  |
| 2026-10-24 06:26 | 1752 | check arm 1 opus–opus #4 m40 | claude-haiku-5-5 | 338 | 69 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 1753 | subject arm 1 opus–opus #4 A m41 | claude-opus-5-5 | 4 | 8 | $0.00421 | 1.6 |  |
| 2026-10-24 06:26 | 1754 | check arm 1 opus–opus #4 m41 | claude-haiku-5-5 | 331 | 54 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 1755 | subject arm 2 sonnet–sonnet #4 A m3 | claude-sonnet-5-5 | 4 | 737 | $0.01029 | 7.9 |  |
| 2026-10-24 06:26 | 1756 | check arm 2 sonnet–sonnet #4 m3 | claude-haiku-5-5 | 1712 | 72 | $0.00021 | 0.9 |  |
| 2026-10-24 06:26 | 1757 | subject arm 1 opus–opus #4 B m42 | claude-opus-5-5 | 4 | 54 | $0.00510 | 1.6 |  |
| 2026-10-24 06:26 | 1758 | check arm 1 opus–opus #4 m42 | claude-haiku-5-5 | 331 | 54 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 1759 | subject arm 1 opus–opus #4 A m43 | claude-opus-5-5 | 4 | 51 | $0.00504 | 1.5 |  |
| 2026-10-24 06:26 | 1760 | check arm 1 opus–opus #4 m43 | claude-haiku-5-5 | 331 | 56 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 1761 | subject arm 1 opus–opus #4 B m44 | claude-opus-5-5 | 4 | 78 | $0.00558 | 2 |  |
| 2026-10-24 06:26 | 1762 | subject arm 2 sonnet–sonnet #4 B m4 | claude-sonnet-5-5 | 4 | 938 | $0.01414 | 10.2 |  |
| 2026-10-24 06:26 | 1763 | check arm 1 opus–opus #4 m44 | claude-haiku-5-5 | 331 | 54 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 1764 | check arm 2 sonnet–sonnet #4 m4 | claude-haiku-5-5 | 1990 | 79 | $0.00024 | 1 |  |
| 2026-10-24 06:26 | 1765 | subject arm 1 opus–opus #4 A m45 | claude-opus-5-5 | 4 | 53 | $0.00508 | 1.5 |  |
| 2026-10-24 06:26 | 1766 | check arm 1 opus–opus #4 m45 | claude-haiku-5-5 | 331 | 51 | $0.00006 | 1.5 |  |
| 2026-10-24 06:26 | 1767 | subject arm 1 opus–opus #4 B m46 | claude-opus-5-5 | 4 | 98 | $0.00598 | 2.1 |  |
| 2026-10-24 06:26 | 1768 | check arm 1 opus–opus #4 m46 | claude-haiku-5-5 | 331 | 55 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 1769 | subject arm 2 sonnet–sonnet #4 A m5 | claude-sonnet-5-5 | 4 | 967 | $0.01410 | 10.1 |  |
| 2026-10-24 06:26 | 1770 | subject arm 1 opus–opus #4 A m47 | claude-opus-5-5 | 4 | 78 | $0.00558 | 1.8 |  |
| 2026-10-24 06:26 | 1771 | check arm 2 sonnet–sonnet #4 m5 | claude-haiku-5-5 | 2220 | 175 | $0.00031 | 1.4 |  |
| 2026-10-24 06:26 | 1772 | check arm 1 opus–opus #4 m47 | claude-haiku-5-5 | 331 | 53 | $0.00006 | 1.2 |  |
| 2026-10-24 06:26 | 1773 | subject arm 1 opus–opus #4 B m48 | claude-opus-5-5 | 4 | 72 | $0.00547 | 1.7 |  |
| 2026-10-24 06:26 | 1774 | check arm 1 opus–opus #4 m48 | claude-haiku-5-5 | 331 | 53 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 1775 | check referee arm 2 sonnet–sonnet #4 m5 | claude-opus-5-5 | 2220 | 59 | $0.01006 | 1.8 |  |
| 2026-10-24 06:26 | 1776 | subject arm 1 fable–fable #4 A m5 | claude-fable-5-1 | 4 | 2194 | $0.14273 | 43.6 |  |
| 2026-10-24 06:26 | 1777 | check arm 1 fable–fable #4 m5 | claude-haiku-5-5 | 3126 | 81 | $0.00035 | 0.8 |  |
| 2026-10-24 06:26 | 1778 | subject arm 1 opus–opus #4 A m49 | claude-opus-5-5 | 4 | 139 | $0.00681 | 3.2 |  |
| 2026-10-24 06:26 | 1779 | check arm 1 opus–opus #4 m49 | claude-haiku-5-5 | 331 | 54 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 1780 | subject arm 2 sonnet–sonnet #4 B m6 | claude-sonnet-5-5 | 4 | 842 | $0.01357 | 9.2 |  |
| 2026-10-24 06:26 | 1781 | check arm 2 sonnet–sonnet #4 m6 | claude-haiku-5-5 | 2124 | 76 | $0.00025 | 0.8 |  |
| 2026-10-24 06:26 | 1782 | subject arm 1 opus–opus #4 B m50 | claude-opus-5-5 | 4 | 57 | $0.00517 | 1.7 |  |
| 2026-10-24 06:26 | 1783 | check arm 1 opus–opus #4 m50 | claude-haiku-5-5 | 331 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 1784 | subject arm 1 opus–opus #4 A m51 | claude-opus-5-5 | 4 | 77 | $0.00557 | 2.6 |  |
| 2026-10-24 06:26 | 1785 | check arm 1 opus–opus #4 m51 | claude-haiku-5-5 | 331 | 53 | $0.00006 | 1.1 |  |
| 2026-10-24 06:26 | 1786 | subject arm 2 sonnet–sonnet #4 A m7 | claude-sonnet-5-5 | 4 | 552 | $0.01062 | 6.8 |  |
| 2026-10-24 06:26 | 1787 | check arm 2 sonnet–sonnet #4 m7 | claude-haiku-5-5 | 1299 | 68 | $0.00016 | 0.6 |  |
| 2026-10-24 06:26 | 1788 | tags 2 arm 2 sonnet–sonnet #4 m1–7 | claude-haiku-5-5 | 5718 | 479 | $0.00081 | 1.7 |  |
| 2026-10-24 06:26 | 1789 | tags 1 arm 2 sonnet–sonnet #4 m1–7 | claude-haiku-5-5 | 5718 | 479 | $0.00081 | 1.9 |  |
| 2026-10-24 06:26 | 1790 | subject arm 1 opus–opus #4 B m52 | claude-opus-5-5 | 4 | 167 | $0.00737 | 3.4 |  |
| 2026-10-24 06:26 | 1791 | check arm 1 opus–opus #4 m52 | claude-haiku-5-5 | 383 | 64 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 1792 | tags referee arm 2 sonnet–sonnet #4 m1–7 | claude-opus-5-5 | 5718 | 479 | $0.03245 | 4.2 |  |
| 2026-10-24 06:26 | 1793 | subject arm 1 opus–opus #4 A m53 | claude-opus-5-5 | 4 | 178 | $0.00785 | 3.4 |  |
| 2026-10-24 06:26 | 1794 | check arm 1 opus–opus #4 m53 | claude-haiku-5-5 | 416 | 81 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 1795 | subject arm 1 opus–opus #4 B m54 | claude-opus-5-5 | 4 | 194 | $0.00834 | 3.2 |  |
| 2026-10-24 06:26 | 1796 | check arm 1 opus–opus #4 m54 | claude-haiku-5-5 | 392 | 51 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 1797 | subject arm 1 fable–fable #5 A m1 | claude-fable-5-1 | 40 | 666 | $0.03370 | 13.6 |  |
| 2026-10-24 06:26 | 1798 | check arm 1 fable–fable #5 m1 | claude-haiku-5-5 | 906 | 70 | $0.00013 | 1.4 |  |
| 2026-10-24 06:26 | 1799 | subject arm 1 opus–opus #4 A m55 | claude-opus-5-5 | 4 | 69 | $0.00573 | 1.7 |  |
| 2026-10-24 06:26 | 1800 | check arm 1 opus–opus #4 m55 | claude-haiku-5-5 | 359 | 53 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 1801 | subject arm 1 opus–opus #4 B m56 | claude-opus-5-5 | 4 | 8 | $0.00436 | 1.8 |  |
| 2026-10-24 06:26 | 1802 | check arm 1 opus–opus #4 m56 | claude-haiku-5-5 | 331 | 56 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 1803 | subject arm 1 opus–opus #4 A m57 | claude-opus-5-5 | 4 | 34 | $0.00474 | 1.4 |  |
| 2026-10-24 06:26 | 1804 | check arm 1 opus–opus #4 m57 | claude-haiku-5-5 | 331 | 54 | $0.00006 | 1.6 |  |
| 2026-10-24 06:26 | 1805 | subject arm 1 opus–opus #4 B m58 | claude-opus-5-5 | 4 | 8 | $0.00422 | 1.1 |  |
| 2026-10-24 06:26 | 1806 | check arm 1 opus–opus #4 m58 | claude-haiku-5-5 | 331 | 54 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 1807 | subject arm 1 opus–opus #4 A m59 | claude-opus-5-5 | 4 | 48 | $0.00503 | 2 |  |
| 2026-10-24 06:26 | 1808 | check arm 1 opus–opus #4 m59 | claude-haiku-5-5 | 331 | 54 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 1809 | subject arm 1 fable–fable #4 B m6 | claude-fable-5-1 | 4 | 2923 | $0.18195 | 54.2 |  |
| 2026-10-24 06:26 | 1810 | check arm 1 fable–fable #4 m6 | claude-haiku-5-5 | 3108 | 69 | $0.00035 | 0.8 |  |
| 2026-10-24 06:26 | 1811 | subject arm 1 opus–opus #4 B m60 | claude-opus-5-5 | 4 | 58 | $0.00523 | 1.8 |  |
| 2026-10-24 06:26 | 1812 | check arm 1 opus–opus #4 m60 | claude-haiku-5-5 | 331 | 51 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 1813 | tags 2 arm 1 opus–opus #4 m1–10 | claude-haiku-5-5 | 12833 | 680 | $0.00162 | 2.3 |  |
| 2026-10-24 06:26 | 1814 | tags 1 arm 1 opus–opus #4 m1–10 | claude-haiku-5-5 | 12833 | 680 | $0.00162 | 2.4 |  |
| 2026-10-24 06:26 | 1815 | tags 1 arm 1 opus–opus #4 m11–20 | claude-haiku-5-5 | 9631 | 680 | $0.00130 | 2.6 |  |
| 2026-10-24 06:26 | 1816 | subject arm 2 sonnet–sonnet #5 A m1 | claude-sonnet-5-5 | 59 | 217 | $0.00229 | 3.1 |  |
| 2026-10-24 06:26 | 1817 | check arm 2 sonnet–sonnet #5 m1 | claude-haiku-5-5 | 543 | 57 | $0.00008 | 0.9 |  |
| 2026-10-24 06:26 | 1818 | tags 2 arm 1 opus–opus #4 m11–20 | claude-haiku-5-5 | 9631 | 680 | $0.00130 | 3 |  |
| 2026-10-24 06:26 | 1819 | tags 2 arm 1 opus–opus #4 m21–30 | claude-haiku-5-5 | 1211 | 680 | $0.00046 | 2.8 |  |
| 2026-10-24 06:26 | 1820 | tags 1 arm 1 opus–opus #4 m21–30 | claude-haiku-5-5 | 1211 | 680 | $0.00046 | 3.1 |  |
| 2026-10-24 06:26 | 1821 | subject arm 2 sonnet–sonnet #5 B m2 | claude-sonnet-5-5 | 274 | 110 | $0.00165 | 1.8 |  |
| 2026-10-24 06:26 | 1822 | check arm 2 sonnet–sonnet #5 m2 | claude-haiku-5-5 | 642 | 60 | $0.00009 | 0.9 |  |
| 2026-10-24 06:26 | 1823 | tags 1 arm 1 opus–opus #4 m41–50 | claude-haiku-5-5 | 1143 | 680 | $0.00045 | 2.1 |  |
| 2026-10-24 06:26 | 1824 | tags 2 arm 1 opus–opus #4 m31–40 | claude-haiku-5-5 | 1359 | 680 | $0.00048 | 2.4 |  |
| 2026-10-24 06:26 | 1825 | tags 1 arm 1 opus–opus #4 m31–40 | claude-haiku-5-5 | 1359 | 680 | $0.00048 | 2.5 |  |
| 2026-10-24 06:26 | 1826 | subject arm 1 fable–fable #5 B m2 | claude-fable-5-1 | 4 | 2256 | $0.12051 | 39.8 |  |
| 2026-10-24 06:26 | 1827 | subject arm 2 sonnet–sonnet #5 A m3 | claude-sonnet-5-5 | 386 | 171 | $0.00248 | 2.4 |  |
| 2026-10-24 06:26 | 1828 | check arm 1 fable–fable #5 m2 | claude-haiku-5-5 | 2204 | 72 | $0.00026 | 0.7 |  |
| 2026-10-24 06:26 | 1829 | check arm 2 sonnet–sonnet #5 m3 | claude-haiku-5-5 | 596 | 61 | $0.00009 | 0.8 |  |
| 2026-10-24 06:26 | 1830 | tags 2 arm 1 opus–opus #4 m41–50 | claude-haiku-5-5 | 1143 | 680 | $0.00045 | 2.2 |  |
| 2026-10-24 06:26 | 1831 | tags 2 arm 1 opus–opus #4 m51–60 | claude-haiku-5-5 | 1256 | 680 | $0.00047 | 2.3 |  |
| 2026-10-24 06:26 | 1832 | subject arm 2 sonnet–sonnet #5 B m4 | claude-sonnet-5-5 | 4 | 138 | $0.00277 | 2 |  |
| 2026-10-24 06:26 | 1833 | check arm 2 sonnet–sonnet #5 m4 | claude-haiku-5-5 | 624 | 66 | $0.00010 | 0.8 |  |
| 2026-10-24 06:26 | 1834 | tags 1 arm 1 opus–opus #4 m51–60 | claude-haiku-5-5 | 1256 | 1205 | $0.00073 | 4.5 |  |
| 2026-10-24 06:26 | 1835 | subject arm 2 sonnet–sonnet #5 A m5 | claude-sonnet-5-5 | 4 | 248 | $0.00422 | 3.3 |  |
| 2026-10-24 06:26 | 1836 | check arm 2 sonnet–sonnet #5 m5 | claude-haiku-5-5 | 701 | 72 | $0.00011 | 0.9 |  |
| 2026-10-24 06:26 | 1837 | tags referee arm 1 opus–opus #4 m11–20 | claude-opus-5-5 | 9631 | 680 | $0.05212 | 5.6 |  |
| 2026-10-24 06:26 | 1838 | tags referee arm 1 opus–opus #4 m31–40 | claude-opus-5-5 | 1359 | 680 | $0.01904 | 5.4 |  |
| 2026-10-24 06:26 | 1839 | tags referee arm 1 opus–opus #4 m1–10 | claude-opus-5-5 | 12833 | 1231 | $0.07595 | 11.2 |  |
| 2026-10-24 06:26 | 1840 | subject arm 2 sonnet–sonnet #5 B m6 | claude-sonnet-5-5 | 4 | 181 | $0.00289 | 5.8 |  |
| 2026-10-24 06:26 | 1841 | check arm 2 sonnet–sonnet #5 m6 | claude-haiku-5-5 | 744 | 64 | $0.00011 | 0.8 |  |
| 2026-10-24 06:26 | 1842 | tags referee arm 1 opus–opus #4 m51–60 | claude-opus-5-5 | 1256 | 876 | $0.02254 | 7.6 |  |
| 2026-10-24 06:26 | 1843 | subject arm 1 fable–fable #4 A m7 | claude-fable-5-1 | 4 | 2064 | $0.13914 | 40.1 |  |
| 2026-10-24 06:26 | 1844 | subject arm 2 sonnet–sonnet #5 A m7 | claude-sonnet-5-5 | 4 | 257 | $0.00379 | 3.4 |  |
| 2026-10-24 06:26 | 1845 | check arm 1 fable–fable #4 m7 | claude-haiku-5-5 | 2882 | 71 | $0.00032 | 0.8 |  |
| 2026-10-24 06:26 | 1846 | check arm 2 sonnet–sonnet #5 m7 | claude-haiku-5-5 | 753 | 66 | $0.00011 | 1.1 |  |
| 2026-10-24 06:26 | 1847 | subject arm 2 sonnet–sonnet #5 B m8 | claude-sonnet-5-5 | 4 | 241 | $0.00370 | 7.2 |  |
| 2026-10-24 06:26 | 1848 | check arm 2 sonnet–sonnet #5 m8 | claude-haiku-5-5 | 813 | 63 | $0.00011 | 0.8 |  |
| 2026-10-24 06:26 | 1849 | subject arm 1 fable–fable #4 B m8 | claude-fable-5-1 | 4 | 544 | $0.06065 | 11.7 |  |
| 2026-10-24 06:26 | 1850 | check arm 1 fable–fable #4 m8 | claude-haiku-5-5 | 1915 | 98 | $0.00024 | 1.5 |  |
| 2026-10-24 06:26 | 1851 | subject arm 2 sonnet–sonnet #5 A m9 | claude-sonnet-5-5 | 4 | 245 | $0.00393 | 3.2 |  |
| 2026-10-24 06:26 | 1852 | check arm 2 sonnet–sonnet #5 m9 | claude-haiku-5-5 | 801 | 67 | $0.00011 | 0.6 |  |
| 2026-10-24 06:26 | 1853 | subject arm 1 fable–fable #4 A m9 | claude-fable-5-1 | 4 | 119 | $0.02768 | 3.3 |  |
| 2026-10-24 06:26 | 1854 | check arm 1 fable–fable #4 m9 | claude-haiku-5-5 | 851 | 55 | $0.00011 | 0.7 |  |
| 2026-10-24 06:26 | 1855 | subject arm 2 sonnet–sonnet #5 B m10 | claude-sonnet-5-5 | 4 | 269 | $0.00419 | 3.6 |  |
| 2026-10-24 06:26 | 1856 | check arm 2 sonnet–sonnet #5 m10 | claude-haiku-5-5 | 829 | 67 | $0.00012 | 0.7 |  |
| 2026-10-24 06:26 | 1857 | subject arm 1 fable–fable #4 B m10 | claude-fable-5-1 | 4 | 18 | $0.00961 | 1.4 |  |
| 2026-10-24 06:26 | 1858 | check arm 1 fable–fable #4 m10 | claude-haiku-5-5 | 386 | 62 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 1859 | subject arm 1 fable–fable #5 A m3 | claude-fable-5-1 | 4 | 2654 | $0.15680 | 53.7 |  |
| 2026-10-24 06:26 | 1860 | subject arm 2 sonnet–sonnet #5 A m11 | claude-sonnet-5-5 | 4 | 302 | $0.00464 | 4.3 |  |
| 2026-10-24 06:26 | 1861 | check arm 1 fable–fable #5 m3 | claude-haiku-5-5 | 2800 | 75 | $0.00032 | 1 |  |
| 2026-10-24 06:26 | 1862 | check arm 2 sonnet–sonnet #5 m11 | claude-haiku-5-5 | 886 | 67 | $0.00012 | 0.6 |  |
| 2026-10-24 06:26 | 1863 | subject arm 1 fable–fable #4 A m11 | claude-fable-5-1 | 4 | 145 | $0.01027 | 5.4 |  |
| 2026-10-24 06:26 | 1864 | check arm 1 fable–fable #4 m11 | claude-haiku-5-5 | 344 | 71 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 1865 | subject arm 1 fable–fable #4 B m12 | claude-fable-5-1 | 4 | 8 | $0.00291 | 1 |  |
| 2026-10-24 06:26 | 1866 | subject arm 2 sonnet–sonnet #5 B m12 | claude-sonnet-5-5 | 4 | 387 | $0.00568 | 4.5 |  |
| 2026-10-24 06:26 | 1867 | check arm 1 fable–fable #4 m12 | claude-haiku-5-5 | 334 | 55 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 1868 | check arm 2 sonnet–sonnet #5 m12 | claude-haiku-5-5 | 734 | 68 | $0.00011 | 0.7 |  |
| 2026-10-24 06:26 | 1869 | tags 1 arm 2 sonnet–sonnet #5 m11–12 | claude-haiku-5-5 | 1615 | 144 | $0.00023 | 0.9 |  |
| 2026-10-24 06:26 | 1870 | tags 2 arm 2 sonnet–sonnet #5 m1–10 | claude-haiku-5-5 | 3106 | 680 | $0.00065 | 2.4 |  |
| 2026-10-24 06:26 | 1871 | tags 1 arm 2 sonnet–sonnet #5 m1–10 | claude-haiku-5-5 | 3106 | 680 | $0.00065 | 2.4 |  |
| 2026-10-24 06:26 | 1872 | subject arm 1 fable–fable #4 A m13 | claude-fable-5-1 | 4 | 107 | $0.00773 | 2.8 |  |
| 2026-10-24 06:26 | 1873 | tags 2 arm 2 sonnet–sonnet #5 m11–12 | claude-haiku-5-5 | 1615 | 144 | $0.00023 | 1 |  |
| 2026-10-24 06:26 | 1874 | check arm 1 fable–fable #4 m13 | claude-haiku-5-5 | 326 | 53 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 1875 | tags referee arm 2 sonnet–sonnet #5 m11–12 | claude-opus-5-5 | 1615 | 144 | $0.00934 | 2.6 |  |
| 2026-10-24 06:26 | 1876 | subject arm 1 fable–fable #4 B m14 | claude-fable-5-1 | 4 | 86 | $0.00659 | 2 |  |
| 2026-10-24 06:26 | 1877 | subject arm 1 opus–opus #5 A m1 | claude-opus-5-5 | 40 | 572 | $0.01160 | 7.7 |  |
| 2026-10-24 06:26 | 1878 | check arm 1 fable–fable #4 m14 | claude-haiku-5-5 | 321 | 47 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 1879 | check arm 1 opus–opus #5 m1 | claude-haiku-5-5 | 831 | 70 | $0.00012 | 0.8 |  |
| 2026-10-24 06:26 | 1880 | tags referee arm 2 sonnet–sonnet #5 m1–10 | claude-opus-5-5 | 3106 | 809 | $0.02860 | 6.6 |  |
| 2026-10-24 06:26 | 1881 | subject arm 1 fable–fable #4 A m15 | claude-fable-5-1 | 4 | 187 | $0.01158 | 4.4 |  |
| 2026-10-24 06:26 | 1882 | check arm 1 fable–fable #4 m15 | claude-haiku-5-5 | 367 | 70 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 1883 | subject arm 1 fable–fable #4 B m16 | claude-fable-5-1 | 4 | 150 | $0.01030 | 2.8 |  |
| 2026-10-24 06:26 | 1884 | check arm 1 fable–fable #4 m16 | claude-haiku-5-5 | 378 | 65 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 1885 | subject arm 1 opus–opus #5 B m2 | claude-opus-5-5 | 4 | 1054 | $0.02379 | 13.5 |  |
| 2026-10-24 06:26 | 1886 | check arm 1 opus–opus #5 m2 | claude-haiku-5-5 | 1551 | 68 | $0.00019 | 0.7 |  |
| 2026-10-24 06:26 | 1887 | subject arm 1 fable–fable #4 A m17 | claude-fable-5-1 | 4 | 87 | $0.00729 | 2.5 |  |
| 2026-10-24 06:26 | 1888 | check arm 1 fable–fable #4 m17 | claude-haiku-5-5 | 332 | 58 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 1889 | subject arm 1 fable–fable #4 B m18 | claude-fable-5-1 | 4 | 3 | $0.00253 | 1.2 |  |
| 2026-10-24 06:26 | 1890 | check arm 1 fable–fable #4 m18 | claude-haiku-5-5 | 321 | 44 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1891 | subject arm 1 fable–fable #5 B m4 | claude-fable-5-1 | 4 | 2723 | $0.16741 | 47.1 |  |
| 2026-10-24 06:26 | 1892 | subject arm 1 fable–fable #4 A m19 | claude-fable-5-1 | 4 | 287 | $0.01659 | 6.3 |  |
| 2026-10-24 06:26 | 1893 | check arm 1 fable–fable #5 m4 | claude-haiku-5-5 | 2868 | 67 | $0.00032 | 1 |  |
| 2026-10-24 06:26 | 1894 | check arm 1 fable–fable #4 m19 | claude-haiku-5-5 | 374 | 84 | $0.00008 | 1 |  |
| 2026-10-24 06:26 | 1895 | subject arm 1 fable–fable #4 B m20 | claude-fable-5-1 | 4 | 199 | $0.01286 | 5 |  |
| 2026-10-24 06:26 | 1896 | check arm 1 fable–fable #4 m20 | claude-haiku-5-5 | 381 | 58 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 1897 | subject arm 1 opus–opus #5 A m3 | claude-opus-5-5 | 4 | 2109 | $0.04856 | 26.5 |  |
| 2026-10-24 06:26 | 1898 | check arm 1 opus–opus #5 m3 | claude-haiku-5-5 | 2175 | 73 | $0.00025 | 0.8 |  |
| 2026-10-24 06:26 | 1899 | subject arm 1 fable–fable #4 A m21 | claude-fable-5-1 | 4 | 296 | $0.01780 | 6.1 |  |
| 2026-10-24 06:26 | 1900 | check arm 1 fable–fable #4 m21 | claude-haiku-5-5 | 332 | 57 | $0.00006 | 1 |  |
| 2026-10-24 06:26 | 1901 | subject arm 1 fable–fable #4 B m22 | claude-fable-5-1 | 4 | 172 | $0.01100 | 3.6 |  |
| 2026-10-24 06:26 | 1902 | check arm 1 fable–fable #4 m22 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 1903 | subject arm 1 fable–fable #4 A m23 | claude-fable-5-1 | 4 | 313 | $0.01801 | 6.1 |  |
| 2026-10-24 06:26 | 1904 | check arm 1 fable–fable #4 m23 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.4 |  |
| 2026-10-24 06:26 | 1905 | subject arm 1 fable–fable #4 B m24 | claude-fable-5-1 | 4 | 272 | $0.01596 | 5.9 |  |
| 2026-10-24 06:26 | 1906 | check arm 1 fable–fable #4 m24 | claude-haiku-5-5 | 373 | 71 | $0.00007 | 1.3 |  |
| 2026-10-24 06:26 | 1907 | subject arm 1 opus–opus #5 B m4 | claude-opus-5-5 | 4 | 2572 | $0.06086 | 31.8 |  |
| 2026-10-24 06:26 | 1908 | subject arm 1 fable–fable #4 A m25 | claude-fable-5-1 | 4 | 278 | $0.01682 | 5.2 |  |
| 2026-10-24 06:26 | 1909 | check arm 1 opus–opus #5 m4 | claude-haiku-5-5 | 2751 | 80 | $0.00032 | 0.9 |  |
| 2026-10-24 06:26 | 1910 | check arm 1 fable–fable #4 m25 | claude-haiku-5-5 | 380 | 59 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 1911 | subject arm 1 fable–fable #4 B m26 | claude-fable-5-1 | 4 | 182 | $0.01210 | 3.8 |  |
| 2026-10-24 06:26 | 1912 | check arm 1 fable–fable #4 m26 | claude-haiku-5-5 | 336 | 59 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 1913 | subject arm 1 fable–fable #4 A m27 | claude-fable-5-1 | 4 | 179 | $0.01142 | 3.6 |  |
| 2026-10-24 06:26 | 1914 | check arm 1 fable–fable #4 m27 | claude-haiku-5-5 | 349 | 56 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 1915 | subject arm 1 fable–fable #4 B m28 | claude-fable-5-1 | 4 | 85 | $0.00688 | 2.1 |  |
| 2026-10-24 06:26 | 1916 | check arm 1 fable–fable #4 m28 | claude-haiku-5-5 | 349 | 61 | $0.00007 | 1.2 |  |
| 2026-10-24 06:26 | 1917 | subject arm 1 fable–fable #5 A m5 | claude-fable-5-1 | 4 | 3716 | $0.21823 | 67 |  |
| 2026-10-24 06:26 | 1918 | check arm 1 fable–fable #5 m5 | claude-haiku-5-5 | 3326 | 76 | $0.00037 | 0.7 |  |
| 2026-10-24 06:26 | 1919 | subject arm 1 fable–fable #4 A m29 | claude-fable-5-1 | 4 | 76 | $0.00644 | 1.7 |  |
| 2026-10-24 06:26 | 1920 | check arm 1 fable–fable #4 m29 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.7 |  |
| 2026-10-24 06:26 | 1921 | subject arm 1 fable–fable #4 B m30 | claude-fable-5-1 | 4 | 151 | $0.00994 | 3 |  |
| 2026-10-24 06:26 | 1922 | check arm 1 fable–fable #4 m30 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1923 | subject arm 1 fable–fable #4 A m31 | claude-fable-5-1 | 4 | 161 | $0.01044 | 3.3 |  |
| 2026-10-24 06:26 | 1924 | check arm 1 fable–fable #4 m31 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 1925 | subject arm 1 opus–opus #5 A m5 | claude-opus-5-5 | 4 | 2962 | $0.07169 | 37.4 |  |
| 2026-10-24 06:26 | 1926 | check arm 1 opus–opus #5 m5 | claude-haiku-5-5 | 2937 | 68 | $0.00033 | 0.7 |  |
| 2026-10-24 06:26 | 1927 | subject arm 1 fable–fable #4 B m32 | claude-fable-5-1 | 4 | 103 | $0.00755 | 2.4 |  |
| 2026-10-24 06:26 | 1928 | check arm 1 fable–fable #4 m32 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.2 |  |
| 2026-10-24 06:26 | 1929 | subject arm 1 fable–fable #4 A m33 | claude-fable-5-1 | 4 | 130 | $0.00890 | 2.4 |  |
| 2026-10-24 06:26 | 1930 | check arm 1 fable–fable #4 m33 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1931 | subject arm 1 fable–fable #4 B m34 | claude-fable-5-1 | 4 | 192 | $0.01200 | 3.1 |  |
| 2026-10-24 06:26 | 1932 | check arm 1 fable–fable #4 m34 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.9 |  |
| 2026-10-24 06:26 | 1933 | subject arm 1 fable–fable #4 A m35 | claude-fable-5-1 | 4 | 272 | $0.01600 | 5.5 |  |
| 2026-10-24 06:26 | 1934 | check arm 1 fable–fable #4 m35 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1935 | subject arm 1 fable–fable #4 B m36 | claude-fable-5-1 | 4 | 168 | $0.01080 | 3.2 |  |
| 2026-10-24 06:26 | 1936 | check arm 1 fable–fable #4 m36 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 1937 | subject arm 1 opus–opus #5 B m6 | claude-opus-5-5 | 4 | 2350 | $0.06061 | 29.9 |  |
| 2026-10-24 06:26 | 1938 | check arm 1 opus–opus #5 m6 | claude-haiku-5-5 | 2899 | 68 | $0.00032 | 0.7 |  |
| 2026-10-24 06:26 | 1939 | subject arm 1 fable–fable #4 A m37 | claude-fable-5-1 | 4 | 150 | $0.00990 | 3.4 |  |
| 2026-10-24 06:26 | 1940 | check arm 1 fable–fable #4 m37 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 1941 | subject arm 1 fable–fable #4 B m38 | claude-fable-5-1 | 4 | 156 | $0.01021 | 2.7 |  |
| 2026-10-24 06:26 | 1942 | check arm 1 fable–fable #4 m38 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1943 | subject arm 1 fable–fable #4 A m39 | claude-fable-5-1 | 4 | 148 | $0.00981 | 2.5 |  |
| 2026-10-24 06:26 | 1944 | check arm 1 fable–fable #4 m39 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 1945 | subject arm 1 fable–fable #5 B m6 | claude-fable-5-1 | 4 | 3564 | $0.21665 | 62.6 |  |
| 2026-10-24 06:26 | 1946 | check arm 1 fable–fable #5 m6 | claude-haiku-5-5 | 3397 | 78 | $0.00038 | 0.7 |  |
| 2026-10-24 06:26 | 1947 | subject arm 1 fable–fable #4 B m40 | claude-fable-5-1 | 4 | 67 | $0.00576 | 1.7 |  |
| 2026-10-24 06:26 | 1948 | check arm 1 fable–fable #4 m40 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 1949 | check referee arm 1 fable–fable #5 m6 | claude-opus-5-5 | 3397 | 56 | $0.01471 | 1.5 |  |
| 2026-10-24 06:26 | 1950 | subject arm 1 fable–fable #4 A m41 | claude-fable-5-1 | 4 | 118 | $0.00831 | 2.1 |  |
| 2026-10-24 06:26 | 1951 | check arm 1 fable–fable #4 m41 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1952 | subject arm 1 fable–fable #4 B m42 | claude-fable-5-1 | 4 | 150 | $0.00991 | 2.9 |  |
| 2026-10-24 06:26 | 1953 | subject arm 1 opus–opus #5 A m7 | claude-opus-5-5 | 4 | 2152 | $0.05672 | 25.1 |  |
| 2026-10-24 06:26 | 1954 | check arm 1 opus–opus #5 m7 | claude-haiku-5-5 | 2921 | 86 | $0.00034 | 0.7 |  |
| 2026-10-24 06:26 | 1955 | check arm 1 fable–fable #4 m42 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.4 |  |
| 2026-10-24 06:26 | 1956 | subject arm 1 fable–fable #4 A m43 | claude-fable-5-1 | 4 | 305 | $0.01767 | 6.2 |  |
| 2026-10-24 06:26 | 1957 | check arm 1 fable–fable #4 m43 | claude-haiku-5-5 | 399 | 67 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 1958 | subject arm 1 fable–fable #4 B m44 | claude-fable-5-1 | 4 | 158 | $0.01119 | 3.4 |  |
| 2026-10-24 06:26 | 1959 | check arm 1 fable–fable #4 m44 | claude-haiku-5-5 | 403 | 54 | $0.00007 | 1.1 |  |
| 2026-10-24 06:26 | 1960 | subject arm 1 fable–fable #4 A m45 | claude-fable-5-1 | 4 | 188 | $0.01274 | 5.9 |  |
| 2026-10-24 06:26 | 1961 | check arm 1 fable–fable #4 m45 | claude-haiku-5-5 | 334 | 70 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 1962 | subject arm 1 fable–fable #4 B m46 | claude-fable-5-1 | 4 | 189 | $0.01195 | 3.7 |  |
| 2026-10-24 06:26 | 1963 | check arm 1 fable–fable #4 m46 | claude-haiku-5-5 | 330 | 56 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 1964 | subject arm 1 opus–opus #5 B m8 | claude-opus-5-5 | 4 | 2415 | $0.06235 | 31 |  |
| 2026-10-24 06:26 | 1965 | check arm 1 opus–opus #5 m8 | claude-haiku-5-5 | 2787 | 79 | $0.00032 | 0.8 |  |
| 2026-10-24 06:26 | 1966 | subject arm 1 fable–fable #4 A m47 | claude-fable-5-1 | 4 | 262 | $0.01555 | 5.7 |  |
| 2026-10-24 06:26 | 1967 | check arm 1 fable–fable #4 m47 | claude-haiku-5-5 | 329 | 42 | $0.00005 | 1.8 |  |
| 2026-10-24 06:26 | 1968 | subject arm 1 fable–fable #4 B m48 | claude-fable-5-1 | 4 | 276 | $0.01624 | 5.2 |  |
| 2026-10-24 06:26 | 1969 | check arm 1 fable–fable #4 m48 | claude-haiku-5-5 | 341 | 57 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 1970 | subject arm 1 fable–fable #5 A m7 | claude-fable-5-1 | 4 | 3761 | $0.22773 | 60.7 |  |
| 2026-10-24 06:26 | 1971 | check arm 1 fable–fable #5 m7 | claude-haiku-5-5 | 3355 | 62 | $0.00037 | 0.7 |  |
| 2026-10-24 06:26 | 1972 | subject arm 1 fable–fable #4 A m49 | claude-fable-5-1 | 4 | 236 | $0.01439 | 5.8 |  |
| 2026-10-24 06:26 | 1973 | check arm 1 fable–fable #4 m49 | claude-haiku-5-5 | 393 | 75 | $0.00008 | 0.7 |  |
| 2026-10-24 06:26 | 1974 | subject arm 1 fable–fable #4 B m50 | claude-fable-5-1 | 4 | 142 | $0.01035 | 2.9 |  |
| 2026-10-24 06:26 | 1975 | check arm 1 fable–fable #4 m50 | claude-haiku-5-5 | 381 | 59 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 1976 | subject arm 1 fable–fable #4 A m51 | claude-fable-5-1 | 4 | 106 | $0.00840 | 2.7 |  |
| 2026-10-24 06:26 | 1977 | check arm 1 fable–fable #4 m51 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.9 |  |
| 2026-10-24 06:26 | 1978 | subject arm 1 fable–fable #4 B m52 | claude-fable-5-1 | 4 | 66 | $0.00577 | 1.8 |  |
| 2026-10-24 06:26 | 1979 | subject arm 1 opus–opus #5 A m9 | claude-opus-5-5 | 4 | 3094 | $0.07551 | 35.9 |  |
| 2026-10-24 06:26 | 1980 | check arm 1 fable–fable #4 m52 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 1981 | check arm 1 opus–opus #5 m9 | claude-haiku-5-5 | 2782 | 77 | $0.00032 | 0.7 |  |
| 2026-10-24 06:26 | 1982 | subject arm 1 fable–fable #4 A m53 | claude-fable-5-1 | 4 | 103 | $0.00762 | 2.5 |  |
| 2026-10-24 06:26 | 1983 | check arm 1 fable–fable #4 m53 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 1984 | subject arm 1 fable–fable #4 B m54 | claude-fable-5-1 | 4 | 42 | $0.00457 | 1.4 |  |
| 2026-10-24 06:26 | 1985 | check arm 1 fable–fable #4 m54 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 1986 | subject arm 1 fable–fable #4 A m55 | claude-fable-5-1 | 4 | 62 | $0.00557 | 2.2 |  |
| 2026-10-24 06:26 | 1987 | check arm 1 fable–fable #4 m55 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.9 |  |
| 2026-10-24 06:26 | 1988 | subject arm 1 fable–fable #4 B m56 | claude-fable-5-1 | 4 | 7 | $0.00282 | 1 |  |
| 2026-10-24 06:26 | 1989 | check arm 1 fable–fable #4 m56 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 1990 | subject arm 1 fable–fable #4 A m57 | claude-fable-5-1 | 4 | 48 | $0.00487 | 2 |  |
| 2026-10-24 06:26 | 1991 | check arm 1 fable–fable #4 m57 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 1992 | subject arm 1 fable–fable #4 B m58 | claude-fable-5-1 | 4 | 85 | $0.00673 | 2.1 |  |
| 2026-10-24 06:26 | 1993 | check arm 1 fable–fable #4 m58 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 1994 | subject arm 1 fable–fable #4 A m59 | claude-fable-5-1 | 4 | 89 | $0.00693 | 2.3 |  |
| 2026-10-24 06:26 | 1995 | check arm 1 fable–fable #4 m59 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.9 |  |
| 2026-10-24 06:26 | 1996 | subject arm 1 fable–fable #5 B m8 | claude-fable-5-1 | 4 | 3438 | $0.21147 | 56.9 |  |
| 2026-10-24 06:26 | 1997 | check arm 1 fable–fable #5 m8 | claude-haiku-5-5 | 3566 | 69 | $0.00039 | 1 |  |
| 2026-10-24 06:26 | 1998 | subject arm 1 fable–fable #4 B m60 | claude-fable-5-1 | 4 | 103 | $0.00763 | 2.2 |  |
| 2026-10-24 06:26 | 1999 | check arm 1 fable–fable #4 m60 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.2 |  |
| 2026-10-24 06:26 | 2000 | tags 1 arm 1 fable–fable #4 m1–10 | claude-haiku-5-5 | 9423 | 680 | $0.00128 | 2.2 |  |
| 2026-10-24 06:26 | 2001 | tags 2 arm 1 fable–fable #4 m1–10 | claude-haiku-5-5 | 9423 | 680 | $0.00128 | 2.3 |  |
| 2026-10-24 06:26 | 2002 | subject arm 1 opus–opus #5 B m10 | claude-opus-5-5 | 4 | 3322 | $0.08032 | 40.4 |  |
| 2026-10-24 06:26 | 2003 | tags 1 arm 1 fable–fable #4 m11–20 | claude-haiku-5-5 | 1233 | 680 | $0.00046 | 2.8 |  |
| 2026-10-24 06:26 | 2004 | check arm 1 opus–opus #5 m10 | claude-haiku-5-5 | 2996 | 66 | $0.00033 | 0.9 |  |
| 2026-10-24 06:26 | 2005 | tags 2 arm 1 fable–fable #4 m11–20 | claude-haiku-5-5 | 1233 | 680 | $0.00046 | 2.5 |  |
| 2026-10-24 06:26 | 2006 | tags 1 arm 1 fable–fable #4 m21–30 | claude-haiku-5-5 | 1206 | 680 | $0.00046 | 2.6 |  |
| 2026-10-24 06:26 | 2007 | tags 2 arm 1 fable–fable #4 m21–30 | claude-haiku-5-5 | 1206 | 680 | $0.00046 | 2.4 |  |
| 2026-10-24 06:26 | 2008 | subject arm 2 fable–fable #5 A m1 | claude-fable-5-1 | 59 | 502 | $0.02569 | 9.6 |  |
| 2026-10-24 06:26 | 2009 | check arm 2 fable–fable #5 m1 | claude-haiku-5-5 | 740 | 56 | $0.00010 | 0.7 |  |
| 2026-10-24 06:26 | 2010 | tags 1 arm 1 fable–fable #4 m41–50 | claude-haiku-5-5 | 1271 | 680 | $0.00047 | 2.2 |  |
| 2026-10-24 06:26 | 2011 | tags 1 arm 1 fable–fable #4 m31–40 | claude-haiku-5-5 | 1132 | 680 | $0.00045 | 2.8 |  |
| 2026-10-24 06:26 | 2012 | tags 2 arm 1 fable–fable #4 m31–40 | claude-haiku-5-5 | 1132 | 680 | $0.00045 | 3.7 |  |
| 2026-10-24 06:26 | 2013 | tags 1 arm 1 fable–fable #4 m51–60 | claude-haiku-5-5 | 1132 | 680 | $0.00045 | 2.2 |  |
| 2026-10-24 06:26 | 2014 | tags 2 arm 1 fable–fable #4 m41–50 | claude-haiku-5-5 | 1271 | 1078 | $0.00067 | 3.8 |  |
| 2026-10-24 06:26 | 2015 | tags 2 arm 1 fable–fable #4 m51–60 | claude-haiku-5-5 | 1132 | 680 | $0.00045 | 3.6 |  |
| 2026-10-24 06:26 | 2016 | tags referee arm 1 fable–fable #4 m1–10 | claude-opus-5-5 | 9423 | 680 | $0.05129 | 5.8 |  |
| 2026-10-24 06:26 | 2017 | tags referee arm 1 fable–fable #4 m21–30 | claude-opus-5-5 | 1206 | 680 | $0.01842 | 5.3 |  |
| 2026-10-24 06:26 | 2018 | tags referee arm 1 fable–fable #4 m11–20 | claude-opus-5-5 | 1233 | 835 | $0.02163 | 6.7 |  |
| 2026-10-24 06:26 | 2019 | tags referee arm 1 fable–fable #4 m41–50 | claude-opus-5-5 | 1271 | 680 | $0.01868 | 5.4 |  |
| 2026-10-24 06:26 | 2020 | subject arm 2 fable–fable #5 B m2 | claude-fable-5-1 | 471 | 1080 | $0.05871 | 21.6 |  |
| 2026-10-24 06:26 | 2021 | check arm 2 fable–fable #5 m2 | claude-haiku-5-5 | 1505 | 64 | $0.00018 | 1.2 |  |
| 2026-10-24 06:26 | 2022 | subject arm 1 opus–opus #5 A m11 | claude-opus-5-5 | 4 | 2695 | $0.06907 | 32.4 |  |
| 2026-10-24 06:26 | 2023 | check arm 1 opus–opus #5 m11 | claude-haiku-5-5 | 2935 | 70 | $0.00033 | 0.9 |  |
| 2026-10-24 06:26 | 2024 | subject arm 1 opus–opus #5 B m12 | claude-opus-5-5 | 4 | 1971 | $0.05455 | 24 |  |
| 2026-10-24 06:26 | 2025 | check arm 1 opus–opus #5 m12 | claude-haiku-5-5 | 2644 | 69 | $0.00030 | 1.7 |  |
| 2026-10-24 06:26 | 2026 | subject arm 1 fable–fable #5 A m9 | claude-fable-5-1 | 4 | 4242 | $0.25467 | 71.5 |  |
| 2026-10-24 06:26 | 2027 | check arm 1 fable–fable #5 m9 | claude-haiku-5-5 | 3541 | 67 | $0.00039 | 1 |  |
| 2026-10-24 06:26 | 2028 | subject arm 2 fable–fable #5 A m3 | claude-fable-5-1 | 4 | 1946 | $0.11290 | 37.3 |  |
| 2026-10-24 06:26 | 2029 | check arm 2 fable–fable #5 m3 | claude-haiku-5-5 | 2310 | 81 | $0.00027 | 0.9 |  |
| 2026-10-24 06:26 | 2030 | subject arm 1 opus–opus #5 A m13 | claude-opus-5-5 | 4 | 1191 | $0.03777 | 15.8 |  |
| 2026-10-24 06:26 | 2031 | check arm 1 opus–opus #5 m13 | claude-haiku-5-5 | 2147 | 68 | $0.00025 | 0.9 |  |
| 2026-10-24 06:26 | 2032 | subject arm 1 opus–opus #5 B m14 | claude-opus-5-5 | 4 | 809 | $0.02790 | 11.6 |  |
| 2026-10-24 06:26 | 2033 | check arm 1 opus–opus #5 m14 | claude-haiku-5-5 | 1513 | 80 | $0.00019 | 1.1 |  |
| 2026-10-24 06:26 | 2034 | subject arm 1 opus–opus #5 A m15 | claude-opus-5-5 | 4 | 383 | $0.01642 | 5.8 |  |
| 2026-10-24 06:26 | 2035 | check arm 1 opus–opus #5 m15 | claude-haiku-5-5 | 907 | 67 | $0.00012 | 0.8 |  |
| 2026-10-24 06:26 | 2036 | subject arm 1 opus–opus #5 B m16 | claude-opus-5-5 | 4 | 209 | $0.01007 | 4.9 |  |
| 2026-10-24 06:26 | 2037 | check arm 1 opus–opus #5 m16 | claude-haiku-5-5 | 629 | 83 | $0.00010 | 0.8 |  |
| 2026-10-24 06:26 | 2038 | subject arm 1 opus–opus #5 A m17 | claude-opus-5-5 | 4 | 99 | $0.00656 | 2.3 |  |
| 2026-10-24 06:26 | 2039 | check arm 1 opus–opus #5 m17 | claude-haiku-5-5 | 472 | 61 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 2040 | subject arm 1 fable–fable #5 B m10 | claude-fable-5-1 | 4 | 3118 | $0.19855 | 50.8 |  |
| 2026-10-24 06:26 | 2041 | subject arm 1 opus–opus #5 B m18 | claude-opus-5-5 | 4 | 55 | $0.00493 | 1.8 |  |
| 2026-10-24 06:26 | 2042 | check arm 1 fable–fable #5 m10 | claude-haiku-5-5 | 3390 | 92 | $0.00038 | 1 |  |
| 2026-10-24 06:26 | 2043 | check arm 1 opus–opus #5 m18 | claude-haiku-5-5 | 333 | 60 | $0.00006 | 1.8 |  |
| 2026-10-24 06:26 | 2044 | subject arm 1 opus–opus #5 A m19 | claude-opus-5-5 | 4 | 109 | $0.00534 | 2.8 |  |
| 2026-10-24 06:26 | 2045 | check arm 1 opus–opus #5 m19 | claude-haiku-5-5 | 331 | 78 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 2046 | subject arm 1 opus–opus #5 B m20 | claude-opus-5-5 | 4 | 94 | $0.00504 | 1.9 |  |
| 2026-10-24 06:26 | 2047 | check arm 1 opus–opus #5 m20 | claude-haiku-5-5 | 332 | 58 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2048 | subject arm 2 fable–fable #5 B m4 | claude-fable-5-1 | 4 | 3083 | $0.18496 | 60.4 |  |
| 2026-10-24 06:26 | 2049 | check arm 2 fable–fable #5 m4 | claude-haiku-5-5 | 3121 | 74 | $0.00035 | 0.8 |  |
| 2026-10-24 06:26 | 2050 | subject arm 1 opus–opus #5 A m21 | claude-opus-5-5 | 4 | 97 | $0.00510 | 2.3 |  |
| 2026-10-24 06:26 | 2051 | check arm 1 opus–opus #5 m21 | claude-haiku-5-5 | 331 | 51 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2052 | subject arm 1 opus–opus #5 B m22 | claude-opus-5-5 | 4 | 161 | $0.00638 | 2.8 |  |
| 2026-10-24 06:26 | 2053 | check arm 1 opus–opus #5 m22 | claude-haiku-5-5 | 355 | 68 | $0.00007 | 1.2 |  |
| 2026-10-24 06:26 | 2054 | subject arm 1 opus–opus #5 A m23 | claude-opus-5-5 | 4 | 131 | $0.00590 | 3 |  |
| 2026-10-24 06:26 | 2055 | check arm 1 opus–opus #5 m23 | claude-haiku-5-5 | 366 | 63 | $0.00007 | 1.5 |  |
| 2026-10-24 06:26 | 2056 | subject arm 1 opus–opus #5 B m24 | claude-opus-5-5 | 4 | 181 | $0.00696 | 3.4 |  |
| 2026-10-24 06:26 | 2057 | check arm 1 opus–opus #5 m24 | claude-haiku-5-5 | 374 | 69 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 2058 | subject arm 1 opus–opus #5 A m25 | claude-opus-5-5 | 4 | 158 | $0.00654 | 3.1 |  |
| 2026-10-24 06:26 | 2059 | check arm 1 opus–opus #5 m25 | claude-haiku-5-5 | 363 | 65 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 2060 | subject arm 1 opus–opus #5 B m26 | claude-opus-5-5 | 4 | 172 | $0.00677 | 3.5 |  |
| 2026-10-24 06:26 | 2061 | check arm 1 opus–opus #5 m26 | claude-haiku-5-5 | 328 | 51 | $0.00006 | 1.5 |  |
| 2026-10-24 06:26 | 2062 | subject arm 1 opus–opus #5 A m27 | claude-opus-5-5 | 4 | 204 | $0.00724 | 4 |  |
| 2026-10-24 06:26 | 2063 | check arm 1 opus–opus #5 m27 | claude-haiku-5-5 | 354 | 65 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 2064 | subject arm 1 opus–opus #5 B m28 | claude-opus-5-5 | 4 | 109 | $0.00548 | 2.3 |  |
| 2026-10-24 06:26 | 2065 | check arm 1 opus–opus #5 m28 | claude-haiku-5-5 | 356 | 57 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2066 | subject arm 1 opus–opus #5 A m29 | claude-opus-5-5 | 4 | 76 | $0.00483 | 2.1 |  |
| 2026-10-24 06:26 | 2067 | check arm 1 opus–opus #5 m29 | claude-haiku-5-5 | 327 | 45 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2068 | subject arm 2 fable–fable #5 A m5 | claude-fable-5-1 | 4 | 2754 | $0.17313 | 49.9 |  |
| 2026-10-24 06:26 | 2069 | check arm 2 fable–fable #5 m5 | claude-haiku-5-5 | 3375 | 74 | $0.00037 | 0.7 |  |
| 2026-10-24 06:26 | 2070 | subject arm 1 opus–opus #5 B m30 | claude-opus-5-5 | 4 | 57 | $0.00431 | 1.7 |  |
| 2026-10-24 06:26 | 2071 | check arm 1 opus–opus #5 m30 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2072 | subject arm 1 opus–opus #5 A m31 | claude-opus-5-5 | 4 | 57 | $0.00430 | 2 |  |
| 2026-10-24 06:26 | 2073 | check arm 1 opus–opus #5 m31 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2074 | subject arm 1 fable–fable #5 A m11 | claude-fable-5-1 | 4 | 4307 | $0.25653 | 72.6 |  |
| 2026-10-24 06:26 | 2075 | check arm 1 fable–fable #5 m11 | claude-haiku-5-5 | 3420 | 88 | $0.00039 | 1 |  |
| 2026-10-24 06:26 | 2076 | subject arm 1 opus–opus #5 B m32 | claude-opus-5-5 | 4 | 51 | $0.00418 | 2 |  |
| 2026-10-24 06:26 | 2077 | check arm 1 opus–opus #5 m32 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2078 | subject arm 1 opus–opus #5 A m33 | claude-opus-5-5 | 4 | 63 | $0.00442 | 2 |  |
| 2026-10-24 06:26 | 2079 | check arm 1 opus–opus #5 m33 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2080 | subject arm 1 opus–opus #5 B m34 | claude-opus-5-5 | 4 | 52 | $0.00420 | 1.7 |  |
| 2026-10-24 06:26 | 2081 | check arm 1 opus–opus #5 m34 | claude-haiku-5-5 | 325 | 47 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2082 | subject arm 1 opus–opus #5 A m35 | claude-opus-5-5 | 4 | 57 | $0.00430 | 2.4 |  |
| 2026-10-24 06:26 | 2083 | check arm 1 opus–opus #5 m35 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2084 | subject arm 1 opus–opus #5 B m36 | claude-opus-5-5 | 4 | 102 | $0.00521 | 2.2 |  |
| 2026-10-24 06:26 | 2085 | check arm 1 opus–opus #5 m36 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2086 | subject arm 1 opus–opus #5 A m37 | claude-opus-5-5 | 4 | 56 | $0.00429 | 1.9 |  |
| 2026-10-24 06:26 | 2087 | check arm 1 opus–opus #5 m37 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2088 | subject arm 1 opus–opus #5 B m38 | claude-opus-5-5 | 4 | 108 | $0.00533 | 2.5 |  |
| 2026-10-24 06:26 | 2089 | check arm 1 opus–opus #5 m38 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2090 | subject arm 1 opus–opus #5 A m39 | claude-opus-5-5 | 4 | 110 | $0.00537 | 2.4 |  |
| 2026-10-24 06:26 | 2091 | check arm 1 opus–opus #5 m39 | claude-haiku-5-5 | 325 | 47 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2092 | subject arm 2 fable–fable #5 B m6 | claude-fable-5-1 | 4 | 2786 | $0.17821 | 48.9 |  |
| 2026-10-24 06:26 | 2093 | subject arm 1 opus–opus #5 B m40 | claude-opus-5-5 | 4 | 86 | $0.00489 | 2.1 |  |
| 2026-10-24 06:26 | 2094 | check arm 2 fable–fable #5 m6 | claude-haiku-5-5 | 3329 | 67 | $0.00037 | 0.8 |  |
| 2026-10-24 06:26 | 2095 | check arm 1 opus–opus #5 m40 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2096 | subject arm 1 opus–opus #5 A m41 | claude-opus-5-5 | 4 | 79 | $0.00475 | 2 |  |
| 2026-10-24 06:26 | 2097 | check arm 1 opus–opus #5 m41 | claude-haiku-5-5 | 325 | 47 | $0.00006 | 1.1 |  |
| 2026-10-24 06:26 | 2098 | subject arm 1 opus–opus #5 B m42 | claude-opus-5-5 | 4 | 117 | $0.00551 | 2.4 |  |
| 2026-10-24 06:26 | 2099 | check arm 1 opus–opus #5 m42 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2100 | subject arm 1 opus–opus #5 A m43 | claude-opus-5-5 | 4 | 73 | $0.00463 | 2.3 |  |
| 2026-10-24 06:26 | 2101 | subject arm 1 fable–fable #5 B m12 | claude-fable-5-1 | 4 | 3528 | $0.21835 | 57.4 |  |
| 2026-10-24 06:26 | 2102 | check arm 1 opus–opus #5 m43 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 2103 | check arm 1 fable–fable #5 m12 | claude-haiku-5-5 | 3373 | 77 | $0.00038 | 1.1 |  |
| 2026-10-24 06:26 | 2104 | subject arm 1 opus–opus #5 B m44 | claude-opus-5-5 | 4 | 60 | $0.00437 | 2.2 |  |
| 2026-10-24 06:26 | 2105 | check arm 1 opus–opus #5 m44 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2106 | subject arm 1 opus–opus #5 A m45 | claude-opus-5-5 | 4 | 51 | $0.00419 | 2 |  |
| 2026-10-24 06:26 | 2107 | check arm 1 opus–opus #5 m45 | claude-haiku-5-5 | 325 | 45 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2108 | subject arm 1 opus–opus #5 B m46 | claude-opus-5-5 | 4 | 48 | $0.00414 | 2.1 |  |
| 2026-10-24 06:26 | 2109 | check arm 1 opus–opus #5 m46 | claude-haiku-5-5 | 325 | 45 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2110 | subject arm 1 opus–opus #5 A m47 | claude-opus-5-5 | 4 | 72 | $0.00462 | 2 |  |
| 2026-10-24 06:26 | 2111 | check arm 1 opus–opus #5 m47 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2112 | subject arm 1 opus–opus #5 B m48 | claude-opus-5-5 | 4 | 158 | $0.00634 | 2.7 |  |
| 2026-10-24 06:26 | 2113 | check arm 1 opus–opus #5 m48 | claude-haiku-5-5 | 383 | 58 | $0.00007 | 0.6 |  |
| 2026-10-24 06:26 | 2114 | subject arm 1 opus–opus #5 A m49 | claude-opus-5-5 | 4 | 147 | $0.00641 | 3 |  |
| 2026-10-24 06:26 | 2115 | check arm 1 opus–opus #5 m49 | claude-haiku-5-5 | 425 | 66 | $0.00008 | 1.1 |  |
| 2026-10-24 06:26 | 2116 | subject arm 2 fable–fable #5 A m7 | claude-fable-5-1 | 4 | 2710 | $0.17423 | 48.4 |  |
| 2026-10-24 06:26 | 2117 | check arm 2 fable–fable #5 m7 | claude-haiku-5-5 | 3558 | 77 | $0.00039 | 0.8 |  |
| 2026-10-24 06:26 | 2118 | subject arm 1 opus–opus #5 B m50 | claude-opus-5-5 | 4 | 27 | $0.00422 | 1.7 |  |
| 2026-10-24 06:26 | 2119 | check arm 1 opus–opus #5 m50 | claude-haiku-5-5 | 367 | 48 | $0.00006 | 1 |  |
| 2026-10-24 06:26 | 2120 | subject arm 1 opus–opus #5 A m51 | claude-opus-5-5 | 4 | 5 | $0.00350 | 1.3 |  |
| 2026-10-24 06:26 | 2121 | check arm 1 opus–opus #5 m51 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 1 |  |
| 2026-10-24 06:26 | 2122 | subject arm 1 opus–opus #5 B m52 | claude-opus-5-5 | 4 | 28 | $0.00376 | 1.6 |  |
| 2026-10-24 06:26 | 2123 | check arm 1 opus–opus #5 m52 | claude-haiku-5-5 | 325 | 45 | $0.00006 | 1.3 |  |
| 2026-10-24 06:26 | 2124 | subject arm 1 opus–opus #5 A m53 | claude-opus-5-5 | 4 | 21 | $0.00362 | 1.3 |  |
| 2026-10-24 06:26 | 2125 | check arm 1 opus–opus #5 m53 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2126 | subject arm 2 fable–fable #5 B m8 | claude-fable-5-1 | 4 | 737 | $0.07881 | 16.3 |  |
| 2026-10-24 06:26 | 2127 | subject arm 1 opus–opus #5 B m54 | claude-opus-5-5 | 4 | 28 | $0.00376 | 1.6 |  |
| 2026-10-24 06:26 | 2128 | check arm 1 opus–opus #5 m54 | claude-haiku-5-5 | 325 | 45 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2129 | check arm 2 fable–fable #5 m8 | claude-haiku-5-5 | 2647 | 80 | $0.00030 | 1.1 |  |
| 2026-10-24 06:26 | 2130 | subject arm 1 fable–fable #5 A m13 | claude-fable-5-1 | 4 | 2956 | $0.18954 | 53.1 |  |
| 2026-10-24 06:26 | 2131 | tags 1 arm 2 fable–fable #5 m1–8 | claude-haiku-5-5 | 10339 | 546 | $0.00131 | 1.9 |  |
| 2026-10-24 06:26 | 2132 | tags 2 arm 2 fable–fable #5 m1–8 | claude-haiku-5-5 | 10339 | 546 | $0.00131 | 1.9 |  |
| 2026-10-24 06:26 | 2133 | check arm 1 fable–fable #5 m13 | claude-haiku-5-5 | 3120 | 83 | $0.00035 | 1.2 |  |
| 2026-10-24 06:26 | 2134 | subject arm 1 opus–opus #5 A m55 | claude-opus-5-5 | 4 | 5 | $0.00330 | 1.7 |  |
| 2026-10-24 06:26 | 2135 | check arm 1 opus–opus #5 m55 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2136 | subject arm 1 sonnet–sonnet #5 A m1 | claude-sonnet-5-5 | 40 | 459 | $0.00467 | 5.3 |  |
| 2026-10-24 06:26 | 2137 | subject arm 1 opus–opus #5 B m56 | claude-opus-5-5 | 4 | 31 | $0.00383 | 1.7 |  |
| 2026-10-24 06:26 | 2138 | check arm 1 sonnet–sonnet #5 m1 | claude-haiku-5-5 | 707 | 65 | $0.00010 | 1.5 |  |
| 2026-10-24 06:26 | 2139 | check arm 1 opus–opus #5 m56 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2140 | tags referee arm 2 fable–fable #5 m1–8 | claude-opus-5-5 | 10339 | 785 | $0.05706 | 7.4 |  |
| 2026-10-24 06:26 | 2141 | subject arm 1 opus–opus #5 A m57 | claude-opus-5-5 | 4 | 26 | $0.00373 | 1.8 |  |
| 2026-10-24 06:26 | 2142 | check arm 1 opus–opus #5 m57 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 1.5 |  |
| 2026-10-24 06:26 | 2143 | subject arm 1 sonnet–sonnet #5 B m2 | claude-sonnet-5-5 | 419 | 537 | $0.00621 | 5.5 |  |
| 2026-10-24 06:26 | 2144 | check arm 1 sonnet–sonnet #5 m2 | claude-haiku-5-5 | 1018 | 61 | $0.00013 | 1.5 |  |
| 2026-10-24 06:26 | 2145 | subject arm 1 opus–opus #5 B m58 | claude-opus-5-5 | 4 | 27 | $0.00375 | 1.4 |  |
| 2026-10-24 06:26 | 2146 | check arm 1 opus–opus #5 m58 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2147 | subject arm 1 opus–opus #5 A m59 | claude-opus-5-5 | 4 | 21 | $0.00363 | 1.5 |  |
| 2026-10-24 06:26 | 2148 | check arm 1 opus–opus #5 m59 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2149 | subject arm 1 sonnet–sonnet #5 A m3 | claude-sonnet-5-5 | 4 | 650 | $0.00836 | 6.7 |  |
| 2026-10-24 06:26 | 2150 | check arm 1 sonnet–sonnet #5 m3 | claude-haiku-5-5 | 977 | 68 | $0.00013 | 0.7 |  |
| 2026-10-24 06:26 | 2151 | subject arm 1 opus–opus #5 B m60 | claude-opus-5-5 | 4 | 34 | $0.00389 | 1.7 |  |
| 2026-10-24 06:26 | 2152 | check arm 1 opus–opus #5 m60 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2153 | tags 2 arm 1 opus–opus #5 m1–10 | claude-haiku-5-5 | 12438 | 680 | $0.00158 | 2.3 |  |
| 2026-10-24 06:26 | 2154 | tags 1 arm 1 opus–opus #5 m1–10 | claude-haiku-5-5 | 12438 | 680 | $0.00158 | 2.4 |  |
| 2026-10-24 06:26 | 2155 | tags 1 arm 1 opus–opus #5 m11–20 | claude-haiku-5-5 | 6280 | 680 | $0.00097 | 2.6 |  |
| 2026-10-24 06:26 | 2156 | tags 2 arm 1 opus–opus #5 m11–20 | claude-haiku-5-5 | 6280 | 680 | $0.00097 | 2.2 |  |
| 2026-10-24 06:26 | 2157 | tags 1 arm 1 opus–opus #5 m21–30 | claude-haiku-5-5 | 1226 | 680 | $0.00046 | 2.2 |  |
| 2026-10-24 06:26 | 2158 | tags 2 arm 1 opus–opus #5 m21–30 | claude-haiku-5-5 | 1226 | 680 | $0.00046 | 2.2 |  |
| 2026-10-24 06:26 | 2159 | subject arm 2 opus–opus #5 A m1 | claude-opus-5-5 | 59 | 404 | $0.00832 | 5.7 |  |
| 2026-10-24 06:26 | 2160 | subject arm 1 sonnet–sonnet #5 B m4 | claude-sonnet-5-5 | 4 | 762 | $0.01032 | 7.8 |  |
| 2026-10-24 06:26 | 2161 | check arm 2 opus–opus #5 m1 | claude-haiku-5-5 | 696 | 67 | $0.00010 | 0.8 |  |
| 2026-10-24 06:26 | 2162 | check arm 1 sonnet–sonnet #5 m4 | claude-haiku-5-5 | 1004 | 78 | $0.00014 | 2.4 |  |
| 2026-10-24 06:26 | 2163 | tags 1 arm 1 opus–opus #5 m31–40 | claude-haiku-5-5 | 1110 | 680 | $0.00045 | 2.1 |  |
| 2026-10-24 06:26 | 2164 | tags 2 arm 1 opus–opus #5 m31–40 | claude-haiku-5-5 | 1110 | 680 | $0.00045 | 2.2 |  |
| 2026-10-24 06:26 | 2165 | tags 1 arm 1 opus–opus #5 m41–50 | claude-haiku-5-5 | 1210 | 680 | $0.00046 | 2.8 |  |
| 2026-10-24 06:26 | 2166 | tags 2 arm 1 opus–opus #5 m41–50 | claude-haiku-5-5 | 1210 | 680 | $0.00046 | 2.4 |  |
| 2026-10-24 06:26 | 2167 | tags 1 arm 1 opus–opus #5 m51–60 | claude-haiku-5-5 | 1110 | 680 | $0.00045 | 2.3 |  |
| 2026-10-24 06:26 | 2168 | tags 2 arm 1 opus–opus #5 m51–60 | claude-haiku-5-5 | 1110 | 680 | $0.00045 | 2.3 |  |
| 2026-10-24 06:26 | 2169 | subject arm 1 sonnet–sonnet #5 A m5 | claude-sonnet-5-5 | 4 | 698 | $0.00886 | 8.3 |  |
| 2026-10-24 06:26 | 2170 | check arm 1 sonnet–sonnet #5 m5 | claude-haiku-5-5 | 1061 | 79 | $0.00015 | 0.9 |  |
| 2026-10-24 06:26 | 2171 | subject arm 2 opus–opus #5 B m2 | claude-opus-5-5 | 427 | 1278 | $0.02727 | 17.3 |  |
| 2026-10-24 06:26 | 2172 | check arm 2 opus–opus #5 m2 | claude-haiku-5-5 | 1630 | 62 | $0.00019 | 0.7 |  |
| 2026-10-24 06:26 | 2173 | tags referee arm 1 opus–opus #5 m11–20 | claude-opus-5-5 | 6280 | 955 | $0.04422 | 8.2 |  |
| 2026-10-24 06:26 | 2174 | subject arm 1 sonnet–sonnet #5 B m6 | claude-sonnet-5-5 | 4 | 1029 | $0.01238 | 9.5 |  |
| 2026-10-24 06:26 | 2175 | subject arm 1 fable–fable #5 B m14 | claude-fable-5-1 | 4 | 3236 | $0.20077 | 56.2 |  |
| 2026-10-24 06:26 | 2176 | check arm 1 sonnet–sonnet #5 m6 | claude-haiku-5-5 | 1107 | 72 | $0.00015 | 0.8 |  |
| 2026-10-24 06:26 | 2177 | check arm 1 fable–fable #5 m14 | claude-haiku-5-5 | 3197 | 68 | $0.00035 | 1.1 |  |
| 2026-10-24 06:26 | 2178 | subject arm 1 sonnet–sonnet #5 A m7 | claude-sonnet-5-5 | 4 | 456 | $0.00683 | 5.4 |  |
| 2026-10-24 06:26 | 2179 | check arm 1 sonnet–sonnet #5 m7 | claude-haiku-5-5 | 1166 | 74 | $0.00015 | 0.9 |  |
| 2026-10-24 06:26 | 2180 | subject arm 1 sonnet–sonnet #5 B m8 | claude-sonnet-5-5 | 4 | 904 | $0.01154 | 8.5 |  |
| 2026-10-24 06:26 | 2181 | check arm 1 sonnet–sonnet #5 m8 | claude-haiku-5-5 | 1195 | 72 | $0.00016 | 0.8 |  |
| 2026-10-24 06:26 | 2182 | subject arm 2 opus–opus #5 A m3 | claude-opus-5-5 | 4 | 2147 | $0.04981 | 28.1 |  |
| 2026-10-24 06:26 | 2183 | check arm 2 opus–opus #5 m3 | claude-haiku-5-5 | 2795 | 64 | $0.00031 | 0.7 |  |
| 2026-10-24 06:26 | 2184 | subject arm 1 sonnet–sonnet #5 A m9 | claude-sonnet-5-5 | 4 | 527 | $0.00792 | 5.6 |  |
| 2026-10-24 06:26 | 2185 | check arm 1 sonnet–sonnet #5 m9 | claude-haiku-5-5 | 1266 | 92 | $0.00017 | 1 |  |
| 2026-10-24 06:26 | 2186 | subject arm 1 sonnet–sonnet #5 B m10 | claude-sonnet-5-5 | 4 | 1110 | $0.01402 | 11.6 |  |
| 2026-10-24 06:26 | 2187 | check arm 1 sonnet–sonnet #5 m10 | claude-haiku-5-5 | 1301 | 99 | $0.00018 | 1 |  |
| 2026-10-24 06:26 | 2188 | subject arm 1 sonnet–sonnet #5 A m11 | claude-sonnet-5-5 | 4 | 1006 | $0.01315 | 10.5 |  |
| 2026-10-24 06:26 | 2189 | subject arm 2 opus–opus #5 B m4 | claude-opus-5-5 | 4 | 2074 | $0.05601 | 26.9 |  |
| 2026-10-24 06:26 | 2190 | check arm 1 sonnet–sonnet #5 m11 | claude-haiku-5-5 | 1255 | 74 | $0.00016 | 1 |  |
| 2026-10-24 06:26 | 2191 | check arm 2 opus–opus #5 m4 | claude-haiku-5-5 | 3131 | 67 | $0.00035 | 0.8 |  |
| 2026-10-24 06:26 | 2192 | subject arm 1 fable–fable #5 A m15 | claude-fable-5-1 | 4 | 3879 | $0.23425 | 60.1 |  |
| 2026-10-24 06:26 | 2193 | check arm 1 fable–fable #5 m15 | claude-haiku-5-5 | 3550 | 72 | $0.00039 | 0.8 |  |
| 2026-10-24 06:26 | 2194 | subject arm 1 sonnet–sonnet #5 B m12 | claude-sonnet-5-5 | 4 | 889 | $0.01197 | 8.7 |  |
| 2026-10-24 06:26 | 2195 | check arm 1 sonnet–sonnet #5 m12 | claude-haiku-5-5 | 1262 | 79 | $0.00017 | 0.9 |  |
| 2026-10-24 06:26 | 2196 | subject arm 1 sonnet–sonnet #5 A m13 | claude-sonnet-5-5 | 4 | 1128 | $0.01447 | 10 |  |
| 2026-10-24 06:26 | 2197 | check arm 1 sonnet–sonnet #5 m13 | claude-haiku-5-5 | 1127 | 68 | $0.00015 | 0.8 |  |
| 2026-10-24 06:26 | 2198 | subject arm 1 sonnet–sonnet #5 B m14 | claude-sonnet-5-5 | 4 | 308 | $0.00603 | 4.4 |  |
| 2026-10-24 06:26 | 2199 | tags 2 arm 1 sonnet–sonnet #5 m1–10 | claude-haiku-5-5 | 5079 | 680 | $0.00085 | 2.3 |  |
| 2026-10-24 06:26 | 2200 | tags 1 arm 1 sonnet–sonnet #5 m1–10 | claude-haiku-5-5 | 5079 | 680 | $0.00085 | 2.4 |  |
| 2026-10-24 06:26 | 2201 | tags 1 arm 1 sonnet–sonnet #5 m11–13 | claude-haiku-5-5 | 2695 | 620 | $0.00058 | 2.9 |  |
| 2026-10-24 06:26 | 2202 | tags 2 arm 1 sonnet–sonnet #5 m11–13 | claude-haiku-5-5 | 2695 | 549 | $0.00054 | 2.5 |  |
| 2026-10-24 06:26 | 2203 | subject arm 2 opus–opus #5 A m5 | claude-opus-5-5 | 4 | 3210 | $0.07857 | 39.3 |  |
| 2026-10-24 06:26 | 2204 | subject arm 1 opus–opus #6 A m1 | claude-opus-5-5 | 40 | 586 | $0.01188 | 7.9 |  |
| 2026-10-24 06:26 | 2205 | check arm 1 opus–opus #6 m1 | claude-haiku-5-5 | 840 | 63 | $0.00012 | 0.6 |  |
| 2026-10-24 06:26 | 2206 | check arm 2 opus–opus #5 m5 | claude-haiku-5-5 | 3194 | 66 | $0.00035 | 0.8 |  |
| 2026-10-24 06:26 | 2207 | subject arm 1 opus–opus #6 B m2 | claude-opus-5-5 | 4 | 753 | $0.01782 | 9.8 |  |
| 2026-10-24 06:26 | 2208 | check arm 1 opus–opus #6 m2 | claude-haiku-5-5 | 1471 | 66 | $0.00018 | 1 |  |
| 2026-10-24 06:26 | 2209 | subject arm 1 fable–fable #5 B m16 | claude-fable-5-1 | 4 | 3068 | $0.19845 | 49.7 |  |
| 2026-10-24 06:26 | 2210 | check arm 1 fable–fable #5 m16 | claude-haiku-5-5 | 3569 | 73 | $0.00039 | 1.2 |  |
| 2026-10-24 06:26 | 2211 | subject arm 2 opus–opus #5 B m6 | claude-opus-5-5 | 4 | 2059 | $0.05617 | 26.2 |  |
| 2026-10-24 06:26 | 2212 | check arm 2 opus–opus #5 m6 | claude-haiku-5-5 | 3080 | 66 | $0.00034 | 0.9 |  |
| 2026-10-24 06:26 | 2213 | subject arm 1 opus–opus #6 A m3 | claude-opus-5-5 | 4 | 1200 | $0.02998 | 16.4 |  |
| 2026-10-24 06:26 | 2214 | check arm 1 opus–opus #6 m3 | claude-haiku-5-5 | 1683 | 65 | $0.00020 | 0.8 |  |
| 2026-10-24 06:26 | 2215 | subject arm 1 opus–opus #6 B m4 | claude-opus-5-5 | 4 | 1284 | $0.03265 | 16.8 |  |
| 2026-10-24 06:26 | 2216 | check arm 1 opus–opus #6 m4 | claude-haiku-5-5 | 1799 | 72 | $0.00022 | 0.7 |  |
| 2026-10-24 06:26 | 2217 | subject arm 2 opus–opus #5 A m7 | claude-opus-5-5 | 4 | 2563 | $0.06594 | 29.6 |  |
| 2026-10-24 06:26 | 2218 | check arm 2 opus–opus #5 m7 | claude-haiku-5-5 | 2855 | 75 | $0.00032 | 0.8 |  |
| 2026-10-24 06:26 | 2219 | subject arm 1 fable–fable #5 A m17 | claude-fable-5-1 | 4 | 2935 | $0.19242 | 49.2 |  |
| 2026-10-24 06:26 | 2220 | check arm 1 fable–fable #5 m17 | claude-haiku-5-5 | 3575 | 83 | $0.00040 | 1.8 |  |
| 2026-10-24 06:26 | 2221 | subject arm 1 opus–opus #6 A m5 | claude-opus-5-5 | 4 | 1353 | $0.03473 | 19.2 |  |
| 2026-10-24 06:26 | 2222 | check arm 1 opus–opus #6 m5 | claude-haiku-5-5 | 1961 | 72 | $0.00023 | 1.5 |  |
| 2026-10-24 06:26 | 2223 | subject arm 2 opus–opus #5 B m8 | claude-opus-5-5 | 4 | 1653 | $0.04693 | 20.3 |  |
| 2026-10-24 06:26 | 2224 | check arm 2 opus–opus #5 m8 | claude-haiku-5-5 | 2545 | 89 | $0.00030 | 0.8 |  |
| 2026-10-24 06:26 | 2225 | subject arm 1 opus–opus #6 B m6 | claude-opus-5-5 | 4 | 1788 | $0.04439 | 23.4 |  |
| 2026-10-24 06:26 | 2226 | check arm 1 opus–opus #6 m6 | claude-haiku-5-5 | 2333 | 97 | $0.00028 | 0.9 |  |
| 2026-10-24 06:26 | 2227 | subject arm 2 opus–opus #5 A m9 | claude-opus-5-5 | 4 | 1175 | $0.03606 | 14.3 |  |
| 2026-10-24 06:26 | 2228 | check arm 2 opus–opus #5 m9 | claude-haiku-5-5 | 1901 | 85 | $0.00023 | 0.8 |  |
| 2026-10-24 06:26 | 2229 | subject arm 1 fable–fable #5 B m18 | claude-fable-5-1 | 4 | 1871 | $0.13972 | 33.2 |  |
| 2026-10-24 06:26 | 2230 | check referee arm 1 opus–opus #6 m6 | claude-opus-5-5 | 2333 | 67 | $0.01067 | 1.1 |  |
| 2026-10-24 06:26 | 2231 | check arm 1 fable–fable #5 m18 | claude-haiku-5-5 | 2946 | 83 | $0.00034 | 0.9 |  |
| 2026-10-24 06:26 | 2232 | subject arm 2 opus–opus #5 B m10 | claude-opus-5-5 | 4 | 129 | $0.01219 | 2.5 |  |
| 2026-10-24 06:26 | 2233 | tags 1 arm 2 opus–opus #5 m1–9 | claude-haiku-5-5 | 10868 | 613 | $0.00139 | 2.1 |  |
| 2026-10-24 06:26 | 2234 | tags 2 arm 2 opus–opus #5 m1–9 | claude-haiku-5-5 | 10868 | 613 | $0.00139 | 2.1 |  |
| 2026-10-24 06:26 | 2235 | tags referee arm 2 opus–opus #5 m1–9 | claude-opus-5-5 | 10868 | 613 | $0.05573 | 5.2 |  |
| 2026-10-24 06:26 | 2236 | subject arm 1 fable–fable #5 A m19 | claude-fable-5-1 | 4 | 454 | $0.06140 | 9.9 |  |
| 2026-10-24 06:26 | 2237 | check arm 1 fable–fable #5 m19 | claude-haiku-5-5 | 1601 | 76 | $0.00020 | 2.7 |  |
| 2026-10-24 06:26 | 2238 | subject arm 2 fable–fable #6 A m1 | claude-fable-5-1 | 59 | 450 | $0.02309 | 10.3 |  |
| 2026-10-24 06:26 | 2239 | check arm 2 fable–fable #6 m1 | claude-haiku-5-5 | 722 | 66 | $0.00011 | 0.7 |  |
| 2026-10-24 06:26 | 2240 | subject arm 1 opus–opus #6 A m7 | claude-opus-5-5 | 4 | 1694 | $0.04452 | 21.7 |  |
| 2026-10-24 06:26 | 2241 | check arm 1 opus–opus #6 m7 | claude-haiku-5-5 | 2554 | 89 | $0.00030 | 0.9 |  |
| 2026-10-24 06:26 | 2242 | subject arm 1 fable–fable #5 B m20 | claude-fable-5-1 | 4 | 258 | $0.03521 | 9.1 |  |
| 2026-10-24 06:26 | 2243 | check arm 1 fable–fable #5 m20 | claude-haiku-5-5 | 862 | 77 | $0.00012 | 1.1 |  |
| 2026-10-24 06:26 | 2244 | check referee arm 1 opus–opus #6 m7 | claude-opus-5-5 | 2554 | 72 | $0.01166 | 1.7 |  |
| 2026-10-24 06:26 | 2245 | subject arm 1 fable–fable #5 A m21 | claude-fable-5-1 | 4 | 75 | $0.01706 | 2.6 |  |
| 2026-10-24 06:26 | 2246 | check arm 1 fable–fable #5 m21 | claude-haiku-5-5 | 524 | 71 | $0.00009 | 0.8 |  |
| 2026-10-24 06:26 | 2247 | subject arm 2 fable–fable #6 B m2 | claude-fable-5-1 | 453 | 751 | $0.04208 | 16.1 |  |
| 2026-10-24 06:26 | 2248 | subject arm 1 fable–fable #5 B m22 | claude-fable-5-1 | 4 | 8 | $0.00957 | 3.5 |  |
| 2026-10-24 06:26 | 2249 | check arm 2 fable–fable #6 m2 | claude-haiku-5-5 | 1411 | 71 | $0.00018 | 1.9 |  |
| 2026-10-24 06:26 | 2250 | check arm 1 fable–fable #5 m22 | claude-haiku-5-5 | 343 | 48 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2251 | subject arm 1 fable–fable #5 A m23 | claude-fable-5-1 | 4 | 8 | $0.00735 | 1.9 |  |
| 2026-10-24 06:26 | 2252 | check arm 1 fable–fable #5 m23 | claude-haiku-5-5 | 331 | 48 | $0.00006 | 1.3 |  |
| 2026-10-24 06:26 | 2253 | subject arm 1 fable–fable #5 B m24 | claude-fable-5-1 | 4 | 91 | $0.01136 | 5.3 |  |
| 2026-10-24 06:26 | 2254 | check arm 1 fable–fable #5 m24 | claude-haiku-5-5 | 341 | 77 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 2255 | subject arm 1 opus–opus #6 B m8 | claude-opus-5-5 | 4 | 2043 | $0.05278 | 25.9 |  |
| 2026-10-24 06:26 | 2256 | subject arm 1 fable–fable #5 A m25 | claude-fable-5-1 | 4 | 9 | $0.00739 | 1.8 |  |
| 2026-10-24 06:26 | 2257 | check arm 1 opus–opus #6 m8 | claude-haiku-5-5 | 2582 | 82 | $0.00030 | 0.7 |  |
| 2026-10-24 06:26 | 2258 | check arm 1 fable–fable #5 m25 | claude-haiku-5-5 | 342 | 65 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 2259 | subject arm 1 fable–fable #5 B m26 | claude-fable-5-1 | 4 | 132 | $0.01355 | 5.8 |  |
| 2026-10-24 06:26 | 2260 | subject arm 2 fable–fable #6 A m3 | claude-fable-5-1 | 4 | 1397 | $0.08428 | 26.1 |  |
| 2026-10-24 06:26 | 2261 | check arm 1 fable–fable #5 m26 | claude-haiku-5-5 | 331 | 57 | $0.00006 | 1.1 |  |
| 2026-10-24 06:26 | 2262 | check arm 2 fable–fable #6 m3 | claude-haiku-5-5 | 1919 | 69 | $0.00023 | 0.8 |  |
| 2026-10-24 06:26 | 2263 | subject arm 1 fable–fable #5 A m27 | claude-fable-5-1 | 4 | 146 | $0.01412 | 3.4 |  |
| 2026-10-24 06:26 | 2264 | check arm 1 fable–fable #5 m27 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.9 |  |
| 2026-10-24 06:26 | 2265 | subject arm 1 fable–fable #5 B m28 | claude-fable-5-1 | 4 | 91 | $0.01134 | 5 |  |
| 2026-10-24 06:26 | 2266 | check arm 1 fable–fable #5 m28 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 2267 | subject arm 1 opus–opus #6 A m9 | claude-opus-5-5 | 4 | 1846 | $0.04921 | 24.9 |  |
| 2026-10-24 06:26 | 2268 | check arm 1 opus–opus #6 m9 | claude-haiku-5-5 | 2518 | 72 | $0.00029 | 0.8 |  |
| 2026-10-24 06:26 | 2269 | subject arm 1 fable–fable #5 A m29 | claude-fable-5-1 | 4 | 136 | $0.01360 | 3.3 |  |
| 2026-10-24 06:26 | 2270 | check arm 1 fable–fable #5 m29 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 2271 | subject arm 1 fable–fable #5 B m30 | claude-fable-5-1 | 4 | 196 | $0.01660 | 6.7 |  |
| 2026-10-24 06:26 | 2272 | check arm 1 fable–fable #5 m30 | claude-haiku-5-5 | 408 | 65 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 2273 | subject arm 1 fable–fable #5 A m31 | claude-fable-5-1 | 4 | 181 | $0.01684 | 4.5 |  |
| 2026-10-24 06:26 | 2274 | check arm 1 fable–fable #5 m31 | claude-haiku-5-5 | 413 | 56 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 2275 | subject arm 2 fable–fable #6 B m4 | claude-fable-5-1 | 4 | 1774 | $0.11440 | 36.4 |  |
| 2026-10-24 06:26 | 2276 | check arm 2 fable–fable #6 m4 | claude-haiku-5-5 | 2237 | 78 | $0.00026 | 0.8 |  |
| 2026-10-24 06:26 | 2277 | subject arm 1 fable–fable #5 B m32 | claude-fable-5-1 | 4 | 6 | $0.00815 | 3.6 |  |
| 2026-10-24 06:26 | 2278 | subject arm 1 opus–opus #6 B m10 | claude-opus-5-5 | 4 | 1771 | $0.04761 | 23 |  |
| 2026-10-24 06:26 | 2279 | check arm 1 opus–opus #6 m10 | claude-haiku-5-5 | 2323 | 84 | $0.00027 | 0.9 |  |
| 2026-10-24 06:26 | 2280 | check arm 1 fable–fable #5 m32 | claude-haiku-5-5 | 333 | 52 | $0.00006 | 2.1 |  |
| 2026-10-24 06:26 | 2281 | subject arm 1 fable–fable #5 A m33 | claude-fable-5-1 | 4 | 196 | $0.01667 | 4.6 |  |
| 2026-10-24 06:26 | 2282 | check arm 1 fable–fable #5 m33 | claude-haiku-5-5 | 328 | 64 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2283 | subject arm 1 fable–fable #5 B m34 | claude-fable-5-1 | 4 | 140 | $0.01381 | 6.3 |  |
| 2026-10-24 06:26 | 2284 | check arm 1 fable–fable #5 m34 | claude-haiku-5-5 | 329 | 57 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2285 | subject arm 1 opus–opus #6 A m11 | claude-opus-5-5 | 4 | 1438 | $0.04021 | 19.9 |  |
| 2026-10-24 06:26 | 2286 | check arm 1 opus–opus #6 m11 | claude-haiku-5-5 | 2099 | 75 | $0.00025 | 1.2 |  |
| 2026-10-24 06:26 | 2287 | subject arm 1 fable–fable #5 A m35 | claude-fable-5-1 | 4 | 210 | $0.01733 | 5.1 |  |
| 2026-10-24 06:26 | 2288 | check arm 1 fable–fable #5 m35 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 2289 | subject arm 1 fable–fable #5 B m36 | claude-fable-5-1 | 4 | 182 | $0.01593 | 6.6 |  |
| 2026-10-24 06:26 | 2290 | subject arm 1 opus–opus #6 B m12 | claude-opus-5-5 | 4 | 717 | $0.02488 | 9.4 |  |
| 2026-10-24 06:26 | 2291 | check arm 1 fable–fable #5 m36 | claude-haiku-5-5 | 381 | 72 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 2292 | check arm 1 opus–opus #6 m12 | claude-haiku-5-5 | 1705 | 72 | $0.00021 | 0.8 |  |
| 2026-10-24 06:26 | 2293 | subject arm 2 fable–fable #6 A m5 | claude-fable-5-1 | 4 | 1988 | $0.12375 | 38.2 |  |
| 2026-10-24 06:26 | 2294 | check arm 2 fable–fable #6 m5 | claude-haiku-5-5 | 2334 | 93 | $0.00028 | 1 |  |
| 2026-10-24 06:26 | 2295 | subject arm 1 fable–fable #5 A m37 | claude-fable-5-1 | 4 | 246 | $0.01978 | 5.1 |  |
| 2026-10-24 06:26 | 2296 | check arm 1 fable–fable #5 m37 | claude-haiku-5-5 | 392 | 57 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 2297 | subject arm 1 opus–opus #6 A m13 | claude-opus-5-5 | 4 | 387 | $0.01650 | 6.5 |  |
| 2026-10-24 06:26 | 2298 | check arm 1 opus–opus #6 m13 | claude-haiku-5-5 | 1163 | 76 | $0.00015 | 0.8 |  |
| 2026-10-24 06:26 | 2299 | subject arm 1 opus–opus #6 B m14 | claude-opus-5-5 | 4 | 100 | $0.00821 | 2.1 |  |
| 2026-10-24 06:26 | 2300 | check arm 1 opus–opus #6 m14 | claude-haiku-5-5 | 638 | 59 | $0.00009 | 0.8 |  |
| 2026-10-24 06:26 | 2301 | subject arm 1 fable–fable #5 B m38 | claude-fable-5-1 | 4 | 77 | $0.01147 | 5.4 |  |
| 2026-10-24 06:26 | 2302 | check arm 1 fable–fable #5 m38 | claude-haiku-5-5 | 340 | 63 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 2303 | subject arm 2 fable–fable #6 B m6 | claude-fable-5-1 | 4 | 653 | $0.05844 | 13.8 |  |
| 2026-10-24 06:26 | 2304 | check arm 2 fable–fable #6 m6 | claude-haiku-5-5 | 1805 | 93 | $0.00023 | 0.8 |  |
| 2026-10-24 06:26 | 2305 | subject arm 1 opus–opus #6 A m15 | claude-opus-5-5 | 4 | 63 | $0.00496 | 2.2 |  |
| 2026-10-24 06:26 | 2306 | tags 2 arm 2 fable–fable #6 m1–6 | claude-haiku-5-5 | 5473 | 412 | $0.00075 | 1.5 |  |
| 2026-10-24 06:26 | 2307 | check arm 1 opus–opus #6 m15 | claude-haiku-5-5 | 365 | 56 | $0.00006 | 1.1 |  |
| 2026-10-24 06:26 | 2308 | tags 1 arm 2 fable–fable #6 m1–6 | claude-haiku-5-5 | 5473 | 412 | $0.00075 | 1.9 |  |
| 2026-10-24 06:26 | 2309 | subject arm 1 fable–fable #5 A m39 | claude-fable-5-1 | 4 | 96 | $0.01179 | 3 |  |
| 2026-10-24 06:26 | 2310 | check arm 1 fable–fable #5 m39 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 2311 | subject arm 1 opus–opus #6 B m16 | claude-opus-5-5 | 4 | 68 | $0.00375 | 1.6 |  |
| 2026-10-24 06:26 | 2312 | check arm 1 opus–opus #6 m16 | claude-haiku-5-5 | 327 | 59 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2313 | subject arm 1 opus–opus #6 A m17 | claude-opus-5-5 | 4 | 96 | $0.00413 | 2.3 |  |
| 2026-10-24 06:26 | 2314 | check arm 1 opus–opus #6 m17 | claude-haiku-5-5 | 344 | 66 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 2315 | subject arm 1 fable–fable #5 B m40 | claude-fable-5-1 | 4 | 163 | $0.01500 | 6 |  |
| 2026-10-24 06:26 | 2316 | check arm 1 fable–fable #5 m40 | claude-haiku-5-5 | 329 | 42 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 2317 | subject arm 1 opus–opus #6 B m18 | claude-opus-5-5 | 4 | 72 | $0.00374 | 1.7 |  |
| 2026-10-24 06:26 | 2318 | subject arm 1 fable–fable #6 A m1 | claude-fable-5-1 | 40 | 604 | $0.03060 | 13.6 |  |
| 2026-10-24 06:26 | 2319 | check arm 1 opus–opus #6 m18 | claude-haiku-5-5 | 353 | 49 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2320 | check arm 1 fable–fable #6 m1 | claude-haiku-5-5 | 832 | 71 | $0.00012 | 0.7 |  |
| 2026-10-24 06:26 | 2321 | subject arm 1 fable–fable #5 A m41 | claude-fable-5-1 | 4 | 115 | $0.01260 | 4.9 |  |
| 2026-10-24 06:26 | 2322 | check arm 1 fable–fable #5 m41 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 2323 | subject arm 1 opus–opus #6 A m19 | claude-opus-5-5 | 4 | 112 | $0.00458 | 2.4 |  |
| 2026-10-24 06:26 | 2324 | check arm 1 opus–opus #6 m19 | claude-haiku-5-5 | 339 | 60 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2325 | subject arm 1 opus–opus #6 B m20 | claude-opus-5-5 | 4 | 76 | $0.00380 | 1.7 |  |
| 2026-10-24 06:26 | 2326 | check arm 1 opus–opus #6 m20 | claude-haiku-5-5 | 334 | 61 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2327 | subject arm 1 opus–opus #6 A m21 | claude-opus-5-5 | 4 | 100 | $0.00426 | 2.3 |  |
| 2026-10-24 06:26 | 2328 | check arm 1 opus–opus #6 m21 | claude-haiku-5-5 | 336 | 57 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2329 | subject arm 1 opus–opus #6 B m22 | claude-opus-5-5 | 4 | 94 | $0.00415 | 1.8 |  |
| 2026-10-24 06:26 | 2330 | subject arm 1 fable–fable #5 B m42 | claude-fable-5-1 | 4 | 609 | $0.03731 | 13.7 |  |
| 2026-10-24 06:26 | 2331 | check arm 1 opus–opus #6 m22 | claude-haiku-5-5 | 334 | 58 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2332 | check arm 1 fable–fable #5 m42 | claude-haiku-5-5 | 490 | 82 | $0.00009 | 0.8 |  |
| 2026-10-24 06:26 | 2333 | subject arm 1 opus–opus #6 A m23 | claude-opus-5-5 | 4 | 125 | $0.00476 | 2.7 |  |
| 2026-10-24 06:26 | 2334 | check arm 1 opus–opus #6 m23 | claude-haiku-5-5 | 334 | 65 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 2335 | subject arm 1 fable–fable #6 B m2 | claude-fable-5-1 | 4 | 1103 | $0.06194 | 23.6 |  |
| 2026-10-24 06:26 | 2336 | check arm 1 fable–fable #6 m2 | claude-haiku-5-5 | 1858 | 80 | $0.00023 | 0.9 |  |
| 2026-10-24 06:26 | 2337 | subject arm 1 fable–fable #5 A m43 | claude-fable-5-1 | 4 | 186 | $0.01817 | 4.2 |  |
| 2026-10-24 06:26 | 2338 | check arm 1 fable–fable #5 m43 | claude-haiku-5-5 | 596 | 75 | $0.00010 | 0.8 |  |
| 2026-10-24 06:26 | 2339 | subject arm 1 opus–opus #6 B m24 | claude-opus-5-5 | 4 | 182 | $0.00590 | 2.7 |  |
| 2026-10-24 06:26 | 2340 | check arm 1 opus–opus #6 m24 | claude-haiku-5-5 | 386 | 60 | $0.00007 | 2.3 |  |
| 2026-10-24 06:26 | 2341 | subject arm 1 fable–fable #5 B m44 | claude-fable-5-1 | 4 | 125 | $0.01645 | 5.1 |  |
| 2026-10-24 06:26 | 2342 | check arm 1 fable–fable #5 m44 | claude-haiku-5-5 | 442 | 60 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 2343 | subject arm 1 opus–opus #6 A m25 | claude-opus-5-5 | 4 | 233 | $0.00719 | 4.1 |  |
| 2026-10-24 06:26 | 2344 | check arm 1 opus–opus #6 m25 | claude-haiku-5-5 | 411 | 63 | $0.00007 | 1 |  |
| 2026-10-24 06:26 | 2345 | subject arm 1 fable–fable #5 A m45 | claude-fable-5-1 | 4 | 98 | $0.01321 | 2.4 |  |
| 2026-10-24 06:26 | 2346 | check arm 1 fable–fable #5 m45 | claude-haiku-5-5 | 338 | 55 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 2347 | subject arm 1 opus–opus #6 B m26 | claude-opus-5-5 | 4 | 162 | $0.00589 | 2.4 |  |
| 2026-10-24 06:26 | 2348 | check arm 1 opus–opus #6 m26 | claude-haiku-5-5 | 361 | 67 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 2349 | subject arm 1 fable–fable #5 B m46 | claude-fable-5-1 | 4 | 62 | $0.01014 | 4.1 |  |
| 2026-10-24 06:26 | 2350 | check arm 1 fable–fable #5 m46 | claude-haiku-5-5 | 333 | 57 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 2351 | subject arm 1 opus–opus #6 A m27 | claude-opus-5-5 | 4 | 195 | $0.00631 | 3.6 |  |
| 2026-10-24 06:26 | 2352 | check arm 1 opus–opus #6 m27 | claude-haiku-5-5 | 330 | 45 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2353 | subject arm 1 fable–fable #5 A m47 | claude-fable-5-1 | 4 | 93 | $0.01163 | 3.1 |  |
| 2026-10-24 06:26 | 2354 | check arm 1 fable–fable #5 m47 | claude-haiku-5-5 | 336 | 60 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2355 | subject arm 1 opus–opus #6 B m28 | claude-opus-5-5 | 4 | 101 | $0.00429 | 1.7 |  |
| 2026-10-24 06:26 | 2356 | check arm 1 opus–opus #6 m28 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2357 | subject arm 1 opus–opus #6 A m29 | claude-opus-5-5 | 4 | 157 | $0.00538 | 3.2 |  |
| 2026-10-24 06:26 | 2358 | check arm 1 opus–opus #6 m29 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2359 | subject arm 1 fable–fable #5 B m48 | claude-fable-5-1 | 4 | 107 | $0.01237 | 5 |  |
| 2026-10-24 06:26 | 2360 | check arm 1 fable–fable #5 m48 | claude-haiku-5-5 | 332 | 58 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2361 | subject arm 1 opus–opus #6 B m30 | claude-opus-5-5 | 4 | 175 | $0.00574 | 2.6 |  |
| 2026-10-24 06:26 | 2362 | subject arm 1 fable–fable #5 A m49 | claude-fable-5-1 | 4 | 5 | $0.00723 | 1.8 |  |
| 2026-10-24 06:26 | 2363 | check arm 1 fable–fable #5 m49 | claude-haiku-5-5 | 325 | 52 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2364 | check arm 1 opus–opus #6 m30 | claude-haiku-5-5 | 331 | 60 | $0.00006 | 1.3 |  |
| 2026-10-24 06:26 | 2365 | subject arm 1 fable–fable #5 B m50 | claude-fable-5-1 | 4 | 94 | $0.01159 | 4.4 |  |
| 2026-10-24 06:26 | 2366 | subject arm 1 fable–fable #6 A m3 | claude-fable-5-1 | 4 | 2306 | $0.13508 | 45.5 |  |
| 2026-10-24 06:26 | 2367 | subject arm 1 opus–opus #6 A m31 | claude-opus-5-5 | 4 | 180 | $0.00588 | 5.3 |  |
| 2026-10-24 06:26 | 2368 | check arm 1 fable–fable #5 m50 | claude-haiku-5-5 | 335 | 54 | $0.00006 | 1.1 |  |
| 2026-10-24 06:26 | 2369 | check arm 1 fable–fable #6 m3 | claude-haiku-5-5 | 2736 | 80 | $0.00031 | 0.8 |  |
| 2026-10-24 06:26 | 2370 | check arm 1 opus–opus #6 m31 | claude-haiku-5-5 | 394 | 80 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 2371 | subject arm 1 fable–fable #5 A m51 | claude-fable-5-1 | 4 | 82 | $0.01112 | 2.5 |  |
| 2026-10-24 06:26 | 2372 | subject arm 1 opus–opus #6 B m32 | claude-opus-5-5 | 4 | 145 | $0.00549 | 2.3 |  |
| 2026-10-24 06:26 | 2373 | check arm 1 fable–fable #5 m51 | claude-haiku-5-5 | 343 | 64 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 2374 | check arm 1 opus–opus #6 m32 | claude-haiku-5-5 | 449 | 59 | $0.00007 | 1 |  |
| 2026-10-24 06:26 | 2375 | subject arm 1 opus–opus #6 A m33 | claude-opus-5-5 | 4 | 24 | $0.00335 | 1.6 |  |
| 2026-10-24 06:26 | 2376 | check arm 1 opus–opus #6 m33 | claude-haiku-5-5 | 386 | 48 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2377 | subject arm 1 fable–fable #5 B m52 | claude-fable-5-1 | 4 | 74 | $0.01082 | 4.2 |  |
| 2026-10-24 06:26 | 2378 | check arm 1 fable–fable #5 m52 | claude-haiku-5-5 | 336 | 56 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2379 | subject arm 1 opus–opus #6 B m34 | claude-opus-5-5 | 4 | 5 | $0.00267 | 1.2 |  |
| 2026-10-24 06:26 | 2380 | check arm 1 opus–opus #6 m34 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2381 | subject arm 1 fable–fable #5 A m53 | claude-fable-5-1 | 4 | 83 | $0.01118 | 2.4 |  |
| 2026-10-24 06:26 | 2382 | check arm 1 fable–fable #5 m53 | claude-haiku-5-5 | 331 | 55 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2383 | subject arm 1 opus–opus #6 A m35 | claude-opus-5-5 | 4 | 35 | $0.00298 | 1.6 |  |
| 2026-10-24 06:26 | 2384 | check arm 1 opus–opus #6 m35 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2385 | subject arm 1 opus–opus #6 B m36 | claude-opus-5-5 | 4 | 19 | $0.00266 | 1.2 |  |
| 2026-10-24 06:26 | 2386 | check arm 1 opus–opus #6 m36 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2387 | subject arm 1 fable–fable #5 B m54 | claude-fable-5-1 | 4 | 98 | $0.01188 | 5.2 |  |
| 2026-10-24 06:26 | 2388 | check arm 1 fable–fable #5 m54 | claude-haiku-5-5 | 330 | 53 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2389 | subject arm 1 opus–opus #6 A m37 | claude-opus-5-5 | 4 | 37 | $0.00302 | 1.9 |  |
| 2026-10-24 06:26 | 2390 | check arm 1 opus–opus #6 m37 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 1.5 |  |
| 2026-10-24 06:26 | 2391 | subject arm 1 fable–fable #5 A m55 | claude-fable-5-1 | 4 | 84 | $0.01116 | 2.7 |  |
| 2026-10-24 06:26 | 2392 | subject arm 1 opus–opus #6 B m38 | claude-opus-5-5 | 4 | 31 | $0.00290 | 1.2 |  |
| 2026-10-24 06:26 | 2393 | check arm 1 fable–fable #5 m55 | claude-haiku-5-5 | 329 | 53 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2394 | subject arm 1 fable–fable #6 B m4 | claude-fable-5-1 | 4 | 1597 | $0.11029 | 30.2 |  |
| 2026-10-24 06:26 | 2395 | check arm 1 opus–opus #6 m38 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 1 |  |
| 2026-10-24 06:26 | 2396 | check arm 1 fable–fable #6 m4 | claude-haiku-5-5 | 2862 | 74 | $0.00032 | 0.8 |  |
| 2026-10-24 06:26 | 2397 | subject arm 1 opus–opus #6 A m39 | claude-opus-5-5 | 4 | 36 | $0.00300 | 1.8 |  |
| 2026-10-24 06:26 | 2398 | check arm 1 opus–opus #6 m39 | claude-haiku-5-5 | 325 | 45 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2399 | subject arm 1 fable–fable #5 B m56 | claude-fable-5-1 | 4 | 137 | $0.01380 | 5.4 |  |
| 2026-10-24 06:26 | 2400 | check arm 1 fable–fable #5 m56 | claude-haiku-5-5 | 328 | 55 | $0.00006 | 1 |  |
| 2026-10-24 06:26 | 2401 | subject arm 1 opus–opus #6 B m40 | claude-opus-5-5 | 4 | 49 | $0.00326 | 1.5 |  |
| 2026-10-24 06:26 | 2402 | check arm 1 opus–opus #6 m40 | claude-haiku-5-5 | 325 | 47 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2403 | subject arm 1 fable–fable #5 A m57 | claude-fable-5-1 | 4 | 56 | $0.00974 | 2.2 |  |
| 2026-10-24 06:26 | 2404 | check arm 1 fable–fable #5 m57 | claude-haiku-5-5 | 327 | 50 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 2405 | subject arm 1 opus–opus #6 A m41 | claude-opus-5-5 | 4 | 50 | $0.00328 | 2 |  |
| 2026-10-24 06:26 | 2406 | check arm 1 opus–opus #6 m41 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2407 | subject arm 1 opus–opus #6 B m42 | claude-opus-5-5 | 4 | 38 | $0.00304 | 1.3 |  |
| 2026-10-24 06:26 | 2408 | check arm 1 opus–opus #6 m42 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 1.2 |  |
| 2026-10-24 06:26 | 2409 | subject arm 1 fable–fable #5 B m58 | claude-fable-5-1 | 4 | 40 | $0.00893 | 4.6 |  |
| 2026-10-24 06:26 | 2410 | check arm 1 fable–fable #5 m58 | claude-haiku-5-5 | 327 | 51 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2411 | subject arm 1 opus–opus #6 A m43 | claude-opus-5-5 | 4 | 48 | $0.00324 | 5.7 |  |
| 2026-10-24 06:26 | 2412 | subject arm 1 fable–fable #5 A m59 | claude-fable-5-1 | 4 | 144 | $0.01413 | 3.8 |  |
| 2026-10-24 06:26 | 2413 | check arm 1 fable–fable #5 m59 | claude-haiku-5-5 | 327 | 53 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2414 | check arm 1 opus–opus #6 m43 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2415 | subject arm 1 opus–opus #6 B m44 | claude-opus-5-5 | 4 | 46 | $0.00320 | 1.4 |  |
| 2026-10-24 06:26 | 2416 | check arm 1 opus–opus #6 m44 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2417 | subject arm 1 fable–fable #5 B m60 | claude-fable-5-1 | 4 | 116 | $0.01274 | 5 |  |
| 2026-10-24 06:26 | 2418 | check arm 1 fable–fable #5 m60 | claude-haiku-5-5 | 327 | 65 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 2419 | subject arm 1 opus–opus #6 A m45 | claude-opus-5-5 | 4 | 46 | $0.00321 | 2 |  |
| 2026-10-24 06:26 | 2420 | check arm 1 opus–opus #6 m45 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2421 | tags 2 arm 1 fable–fable #5 m1–10 | claude-haiku-5-5 | 14879 | 680 | $0.00183 | 2.4 |  |
| 2026-10-24 06:26 | 2422 | tags 1 arm 1 fable–fable #5 m11–20 | claude-haiku-5-5 | 14935 | 680 | $0.00183 | 2.5 |  |
| 2026-10-24 06:26 | 2423 | tags 1 arm 1 fable–fable #5 m1–10 | claude-haiku-5-5 | 14879 | 680 | $0.00183 | 4.3 |  |
| 2026-10-24 06:26 | 2424 | subject arm 1 fable–fable #6 A m5 | claude-fable-5-1 | 4 | 1944 | $0.12947 | 36.8 |  |
| 2026-10-24 06:26 | 2425 | subject arm 1 opus–opus #6 B m46 | claude-opus-5-5 | 4 | 45 | $0.00319 | 1.3 |  |
| 2026-10-24 06:26 | 2426 | check arm 1 fable–fable #6 m5 | claude-haiku-5-5 | 2703 | 70 | $0.00031 | 0.7 |  |
| 2026-10-24 06:26 | 2427 | check arm 1 opus–opus #6 m46 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2428 | subject arm 2 opus–opus #6 A m1 | claude-opus-5-5 | 59 | 362 | $0.00748 | 5.7 |  |
| 2026-10-24 06:26 | 2429 | tags 2 arm 1 fable–fable #5 m11–20 | claude-haiku-5-5 | 14935 | 680 | $0.00183 | 2.7 |  |
| 2026-10-24 06:26 | 2430 | tags 1 arm 1 fable–fable #5 m21–30 | claude-haiku-5-5 | 1421 | 680 | $0.00048 | 2.9 |  |
| 2026-10-24 06:26 | 2431 | check arm 2 opus–opus #6 m1 | claude-haiku-5-5 | 666 | 58 | $0.00010 | 0.8 |  |
| 2026-10-24 06:26 | 2432 | tags 2 arm 1 fable–fable #5 m21–30 | claude-haiku-5-5 | 1421 | 680 | $0.00048 | 2.1 |  |
| 2026-10-24 06:26 | 2433 | subject arm 1 opus–opus #6 A m47 | claude-opus-5-5 | 4 | 73 | $0.00375 | 1.9 |  |
| 2026-10-24 06:26 | 2434 | check arm 1 opus–opus #6 m47 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 1 |  |
| 2026-10-24 06:26 | 2435 | tags 1 arm 1 fable–fable #5 m31–40 | claude-haiku-5-5 | 1278 | 680 | $0.00047 | 2.3 |  |
| 2026-10-24 06:26 | 2436 | tags 2 arm 1 fable–fable #5 m31–40 | claude-haiku-5-5 | 1278 | 680 | $0.00047 | 2.6 |  |
| 2026-10-24 06:26 | 2437 | subject arm 1 opus–opus #6 B m48 | claude-opus-5-5 | 4 | 29 | $0.00287 | 1.3 |  |
| 2026-10-24 06:26 | 2438 | check arm 1 opus–opus #6 m48 | claude-haiku-5-5 | 325 | 48 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2439 | tags 1 arm 1 fable–fable #5 m41–50 | claude-haiku-5-5 | 1419 | 680 | $0.00048 | 2.3 |  |
| 2026-10-24 06:26 | 2440 | subject arm 1 opus–opus #6 A m49 | claude-opus-5-5 | 4 | 65 | $0.00359 | 2 |  |
| 2026-10-24 06:26 | 2441 | tags 1 arm 1 fable–fable #5 m51–60 | claude-haiku-5-5 | 1143 | 680 | $0.00045 | 2.2 |  |
| 2026-10-24 06:26 | 2442 | tags 2 arm 1 fable–fable #5 m41–50 | claude-haiku-5-5 | 1419 | 680 | $0.00048 | 3 |  |
| 2026-10-24 06:26 | 2443 | check arm 1 opus–opus #6 m49 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2444 | tags 2 arm 1 fable–fable #5 m51–60 | claude-haiku-5-5 | 1143 | 680 | $0.00045 | 2.2 |  |
| 2026-10-24 06:26 | 2445 | subject arm 2 opus–opus #6 B m2 | claude-opus-5-5 | 397 | 939 | $0.02037 | 11.1 |  |
| 2026-10-24 06:26 | 2446 | check arm 2 opus–opus #6 m2 | claude-haiku-5-5 | 1378 | 85 | $0.00018 | 0.7 |  |
| 2026-10-24 06:26 | 2447 | subject arm 1 opus–opus #6 B m50 | claude-opus-5-5 | 4 | 59 | $0.00347 | 1.5 |  |
| 2026-10-24 06:26 | 2448 | check arm 1 opus–opus #6 m50 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 2449 | subject arm 1 opus–opus #6 A m51 | claude-opus-5-5 | 4 | 5 | $0.00239 | 1.3 |  |
| 2026-10-24 06:26 | 2450 | check arm 1 opus–opus #6 m51 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2451 | tags referee arm 1 fable–fable #5 m1–10 | claude-opus-5-5 | 14879 | 1100 | $0.08152 | 9.7 |  |
| 2026-10-24 06:26 | 2452 | subject arm 1 opus–opus #6 B m52 | claude-opus-5-5 | 4 | 52 | $0.00333 | 1.5 |  |
| 2026-10-24 06:26 | 2453 | check arm 1 opus–opus #6 m52 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2454 | subject arm 1 opus–opus #6 A m53 | claude-opus-5-5 | 4 | 36 | $0.00301 | 1.7 |  |
| 2026-10-24 06:26 | 2455 | check arm 1 opus–opus #6 m53 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2456 | subject arm 1 opus–opus #6 B m54 | claude-opus-5-5 | 4 | 49 | $0.00327 | 1.5 |  |
| 2026-10-24 06:26 | 2457 | check arm 1 opus–opus #6 m54 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2458 | subject arm 2 opus–opus #6 A m3 | claude-opus-5-5 | 4 | 1600 | $0.03761 | 19.6 |  |
| 2026-10-24 06:26 | 2459 | check arm 2 opus–opus #6 m3 | claude-haiku-5-5 | 1985 | 69 | $0.00023 | 0.7 |  |
| 2026-10-24 06:26 | 2460 | subject arm 1 fable–fable #6 B m6 | claude-fable-5-1 | 4 | 2145 | $0.13788 | 38 |  |
| 2026-10-24 06:26 | 2461 | check arm 1 fable–fable #6 m6 | claude-haiku-5-5 | 2659 | 77 | $0.00030 | 0.8 |  |
| 2026-10-24 06:26 | 2462 | subject arm 1 opus–opus #6 A m55 | claude-opus-5-5 | 4 | 49 | $0.00328 | 2.4 |  |
| 2026-10-24 06:26 | 2463 | check arm 1 opus–opus #6 m55 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2464 | subject arm 1 opus–opus #6 B m56 | claude-opus-5-5 | 4 | 56 | $0.00342 | 1.5 |  |
| 2026-10-24 06:26 | 2465 | check arm 1 opus–opus #6 m56 | claude-haiku-5-5 | 325 | 45 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2466 | subject arm 1 opus–opus #6 A m57 | claude-opus-5-5 | 4 | 48 | $0.00326 | 1.9 |  |
| 2026-10-24 06:26 | 2467 | check arm 1 opus–opus #6 m57 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2468 | subject arm 1 opus–opus #6 B m58 | claude-opus-5-5 | 4 | 43 | $0.00316 | 1.5 |  |
| 2026-10-24 06:26 | 2469 | check arm 1 opus–opus #6 m58 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 1.3 |  |
| 2026-10-24 06:26 | 2470 | subject arm 1 opus–opus #6 A m59 | claude-opus-5-5 | 4 | 42 | $0.00314 | 2 |  |
| 2026-10-24 06:26 | 2471 | check arm 1 opus–opus #6 m59 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2472 | subject arm 1 opus–opus #6 B m60 | claude-opus-5-5 | 4 | 36 | $0.00302 | 1.4 |  |
| 2026-10-24 06:26 | 2473 | check arm 1 opus–opus #6 m60 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2474 | subject arm 2 opus–opus #6 B m4 | claude-opus-5-5 | 4 | 2125 | $0.05283 | 25.5 |  |
| 2026-10-24 06:26 | 2475 | tags 1 arm 1 opus–opus #6 m1–10 | claude-haiku-5-5 | 9962 | 680 | $0.00134 | 2.4 |  |
| 2026-10-24 06:26 | 2476 | tags 2 arm 1 opus–opus #6 m1–10 | claude-haiku-5-5 | 9962 | 680 | $0.00134 | 2.4 |  |
| 2026-10-24 06:26 | 2477 | check arm 2 opus–opus #6 m4 | claude-haiku-5-5 | 2372 | 67 | $0.00027 | 1 |  |
| 2026-10-24 06:26 | 2478 | tags 1 arm 1 opus–opus #6 m11–20 | claude-haiku-5-5 | 3800 | 680 | $0.00072 | 3.2 |  |
| 2026-10-24 06:26 | 2479 | subject arm 1 sonnet–sonnet #6 A m1 | claude-sonnet-5-5 | 40 | 453 | $0.00461 | 5.1 |  |
| 2026-10-24 06:26 | 2480 | tags 1 arm 1 opus–opus #6 m21–30 | claude-haiku-5-5 | 1227 | 680 | $0.00046 | 2.2 |  |
| 2026-10-24 06:26 | 2481 | tags 2 arm 1 opus–opus #6 m11–20 | claude-haiku-5-5 | 3800 | 680 | $0.00072 | 2.2 |  |
| 2026-10-24 06:26 | 2482 | check arm 1 sonnet–sonnet #6 m1 | claude-haiku-5-5 | 779 | 59 | $0.00011 | 0.7 |  |
| 2026-10-24 06:26 | 2483 | tags 2 arm 1 opus–opus #6 m21–30 | claude-haiku-5-5 | 1227 | 680 | $0.00046 | 2.2 |  |
| 2026-10-24 06:26 | 2484 | subject arm 1 fable–fable #6 A m7 | claude-fable-5-1 | 4 | 1759 | $0.11832 | 31.7 |  |
| 2026-10-24 06:26 | 2485 | check arm 1 fable–fable #6 m7 | claude-haiku-5-5 | 2679 | 86 | $0.00031 | 0.8 |  |
| 2026-10-24 06:26 | 2486 | tags 1 arm 1 opus–opus #6 m31–40 | claude-haiku-5-5 | 1240 | 680 | $0.00046 | 2.2 |  |
| 2026-10-24 06:26 | 2487 | tags 2 arm 1 opus–opus #6 m31–40 | claude-haiku-5-5 | 1240 | 680 | $0.00046 | 2.2 |  |
| 2026-10-24 06:26 | 2488 | tags 1 arm 1 opus–opus #6 m41–50 | claude-haiku-5-5 | 1110 | 680 | $0.00045 | 2.2 |  |
| 2026-10-24 06:26 | 2489 | tags 2 arm 1 opus–opus #6 m41–50 | claude-haiku-5-5 | 1110 | 680 | $0.00045 | 2.2 |  |
| 2026-10-24 06:26 | 2490 | tags 1 arm 1 opus–opus #6 m51–60 | claude-haiku-5-5 | 1110 | 680 | $0.00045 | 2.5 |  |
| 2026-10-24 06:26 | 2491 | subject arm 1 sonnet–sonnet #6 B m2 | claude-sonnet-5-5 | 491 | 746 | $0.00844 | 8.1 |  |
| 2026-10-24 06:26 | 2492 | tags 2 arm 1 opus–opus #6 m51–60 | claude-haiku-5-5 | 1110 | 680 | $0.00045 | 2.6 |  |
| 2026-10-24 06:26 | 2493 | check arm 1 sonnet–sonnet #6 m2 | claude-haiku-5-5 | 1514 | 75 | $0.00019 | 0.8 |  |
| 2026-10-24 06:26 | 2494 | subject arm 1 fable–fable #6 B m8 | claude-fable-5-1 | 4 | 564 | $0.05913 | 12.5 |  |
| 2026-10-24 06:26 | 2495 | check arm 1 fable–fable #6 m8 | claude-haiku-5-5 | 2049 | 71 | $0.00024 | 1.1 |  |
| 2026-10-24 06:26 | 2496 | tags referee arm 1 opus–opus #6 m1–10 | claude-opus-5-5 | 9962 | 979 | $0.05943 | 7.6 |  |
| 2026-10-24 06:26 | 2497 | subject arm 1 fable–fable #6 A m9 | claude-fable-5-1 | 4 | 322 | $0.03943 | 6.7 |  |
| 2026-10-24 06:26 | 2498 | check arm 1 fable–fable #6 m9 | claude-haiku-5-5 | 1059 | 71 | $0.00014 | 0.8 |  |
| 2026-10-24 06:26 | 2499 | subject arm 1 sonnet–sonnet #6 A m3 | claude-sonnet-5-5 | 4 | 1771 | $0.02081 | 15.6 |  |
| 2026-10-24 06:26 | 2500 | check arm 1 sonnet–sonnet #6 m3 | claude-haiku-5-5 | 2143 | 63 | $0.00025 | 0.8 |  |
| 2026-10-24 06:26 | 2501 | subject arm 1 fable–fable #6 B m10 | claude-fable-5-1 | 4 | 116 | $0.01707 | 3.2 |  |
| 2026-10-24 06:26 | 2502 | check arm 1 fable–fable #6 m10 | claude-haiku-5-5 | 604 | 70 | $0.00010 | 0.8 |  |
| 2026-10-24 06:26 | 2503 | subject arm 2 opus–opus #6 A m5 | claude-opus-5-5 | 4 | 3468 | $0.07988 | 37.6 |  |
| 2026-10-24 06:26 | 2504 | check arm 2 opus–opus #6 m5 | claude-haiku-5-5 | 2846 | 66 | $0.00032 | 0.8 |  |
| 2026-10-24 06:26 | 2505 | subject arm 1 fable–fable #6 A m11 | claude-fable-5-1 | 4 | 11 | $0.00625 | 1.7 |  |
| 2026-10-24 06:26 | 2506 | check arm 1 fable–fable #6 m11 | claude-haiku-5-5 | 360 | 60 | $0.00007 | 0.6 |  |
| 2026-10-24 06:26 | 2507 | subject arm 1 fable–fable #6 B m12 | claude-fable-5-1 | 4 | 7 | $0.00307 | 1.6 |  |
| 2026-10-24 06:26 | 2508 | check arm 1 fable–fable #6 m12 | claude-haiku-5-5 | 333 | 57 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2509 | subject arm 1 sonnet–sonnet #6 B m4 | claude-sonnet-5-5 | 4 | 1990 | $0.02570 | 16.1 |  |
| 2026-10-24 06:26 | 2510 | check arm 1 sonnet–sonnet #6 m4 | claude-haiku-5-5 | 2157 | 64 | $0.00025 | 1.3 |  |
| 2026-10-24 06:26 | 2511 | subject arm 1 fable–fable #6 A m13 | claude-fable-5-1 | 4 | 120 | $0.00839 | 5.3 |  |
| 2026-10-24 06:26 | 2512 | check arm 1 fable–fable #6 m13 | claude-haiku-5-5 | 328 | 56 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2513 | subject arm 1 fable–fable #6 B m14 | claude-fable-5-1 | 4 | 43 | $0.00448 | 2.6 |  |
| 2026-10-24 06:26 | 2514 | check arm 1 fable–fable #6 m14 | claude-haiku-5-5 | 326 | 58 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2515 | subject arm 2 opus–opus #6 B m6 | claude-opus-5-5 | 4 | 1645 | $0.04598 | 21.4 |  |
| 2026-10-24 06:26 | 2516 | check arm 2 opus–opus #6 m6 | claude-haiku-5-5 | 2935 | 77 | $0.00033 | 0.8 |  |
| 2026-10-24 06:26 | 2517 | subject arm 1 fable–fable #6 A m15 | claude-fable-5-1 | 4 | 135 | $0.00906 | 3.2 |  |
| 2026-10-24 06:26 | 2518 | check arm 1 fable–fable #6 m15 | claude-haiku-5-5 | 329 | 53 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2519 | subject arm 1 fable–fable #6 B m16 | claude-fable-5-1 | 4 | 93 | $0.00699 | 2.4 |  |
| 2026-10-24 06:26 | 2520 | subject arm 1 sonnet–sonnet #6 A m5 | claude-sonnet-5-5 | 4 | 2103 | $0.02589 | 17.1 |  |
| 2026-10-24 06:26 | 2521 | check arm 1 fable–fable #6 m16 | claude-haiku-5-5 | 338 | 50 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2522 | check arm 1 sonnet–sonnet #6 m5 | claude-haiku-5-5 | 1932 | 81 | $0.00023 | 0.9 |  |
| 2026-10-24 06:26 | 2523 | subject arm 1 fable–fable #6 A m17 | claude-fable-5-1 | 4 | 96 | $0.00726 | 2.7 |  |
| 2026-10-24 06:26 | 2524 | check arm 1 fable–fable #6 m17 | claude-haiku-5-5 | 337 | 46 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2525 | subject arm 1 fable–fable #6 B m18 | claude-fable-5-1 | 4 | 130 | $0.00895 | 3.2 |  |
| 2026-10-24 06:26 | 2526 | check arm 1 fable–fable #6 m18 | claude-haiku-5-5 | 326 | 51 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2527 | subject arm 1 sonnet–sonnet #6 B m6 | claude-sonnet-5-5 | 4 | 1213 | $0.01664 | 11.2 |  |
| 2026-10-24 06:26 | 2528 | check arm 1 sonnet–sonnet #6 m6 | claude-haiku-5-5 | 2385 | 81 | $0.00028 | 1.2 |  |
| 2026-10-24 06:26 | 2529 | subject arm 1 fable–fable #6 A m19 | claude-fable-5-1 | 4 | 131 | $0.00886 | 3.3 |  |
| 2026-10-24 06:26 | 2530 | check arm 1 fable–fable #6 m19 | claude-haiku-5-5 | 321 | 45 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 2531 | subject arm 2 opus–opus #6 A m7 | claude-opus-5-5 | 4 | 2315 | $0.06005 | 26.4 |  |
| 2026-10-24 06:26 | 2532 | check arm 2 opus–opus #6 m7 | claude-haiku-5-5 | 2717 | 66 | $0.00030 | 0.9 |  |
| 2026-10-24 06:26 | 2533 | subject arm 1 fable–fable #6 B m20 | claude-fable-5-1 | 4 | 144 | $0.00945 | 3.4 |  |
| 2026-10-24 06:26 | 2534 | check arm 1 fable–fable #6 m20 | claude-haiku-5-5 | 341 | 63 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 2535 | subject arm 1 sonnet–sonnet #6 A m7 | claude-sonnet-5-5 | 4 | 1222 | $0.01802 | 12.1 |  |
| 2026-10-24 06:26 | 2536 | subject arm 1 fable–fable #6 A m21 | claude-fable-5-1 | 4 | 109 | $0.00795 | 3 |  |
| 2026-10-24 06:26 | 2537 | check arm 1 sonnet–sonnet #6 m7 | claude-haiku-5-5 | 2311 | 76 | $0.00027 | 0.8 |  |
| 2026-10-24 06:26 | 2538 | check arm 1 fable–fable #6 m21 | claude-haiku-5-5 | 351 | 50 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2539 | subject arm 1 fable–fable #6 B m22 | claude-fable-5-1 | 4 | 162 | $0.01073 | 3.4 |  |
| 2026-10-24 06:26 | 2540 | check arm 1 fable–fable #6 m22 | claude-haiku-5-5 | 343 | 58 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2541 | subject arm 1 fable–fable #6 A m23 | claude-fable-5-1 | 4 | 167 | $0.01089 | 4.3 |  |
| 2026-10-24 06:26 | 2542 | check arm 1 fable–fable #6 m23 | claude-haiku-5-5 | 338 | 59 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2543 | subject arm 1 fable–fable #6 B m24 | claude-fable-5-1 | 4 | 96 | $0.00728 | 2.7 |  |
| 2026-10-24 06:26 | 2544 | check arm 1 fable–fable #6 m24 | claude-haiku-5-5 | 326 | 43 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 2545 | subject arm 1 sonnet–sonnet #6 B m8 | claude-sonnet-5-5 | 4 | 2168 | $0.02746 | 21.6 |  |
| 2026-10-24 06:26 | 2546 | check arm 1 sonnet–sonnet #6 m8 | claude-haiku-5-5 | 2300 | 68 | $0.00026 | 0.8 |  |
| 2026-10-24 06:26 | 2547 | subject arm 1 fable–fable #6 A m25 | claude-fable-5-1 | 4 | 230 | $0.01383 | 6.5 |  |
| 2026-10-24 06:26 | 2548 | check arm 1 fable–fable #6 m25 | claude-haiku-5-5 | 381 | 82 | $0.00008 | 0.9 |  |
| 2026-10-24 06:26 | 2549 | subject arm 2 opus–opus #6 B m8 | claude-opus-5-5 | 4 | 3706 | $0.08706 | 39.5 |  |
| 2026-10-24 06:26 | 2550 | check arm 2 opus–opus #6 m8 | claude-haiku-5-5 | 2823 | 85 | $0.00032 | 0.8 |  |
| 2026-10-24 06:26 | 2551 | subject arm 1 fable–fable #6 B m26 | claude-fable-5-1 | 4 | 112 | $0.00862 | 3.1 |  |
| 2026-10-24 06:26 | 2552 | check arm 1 fable–fable #6 m26 | claude-haiku-5-5 | 386 | 61 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 2553 | subject arm 1 fable–fable #6 A m27 | claude-fable-5-1 | 4 | 194 | $0.01278 | 4.1 |  |
| 2026-10-24 06:26 | 2554 | check arm 1 fable–fable #6 m27 | claude-haiku-5-5 | 328 | 48 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2555 | subject arm 1 sonnet–sonnet #6 A m9 | claude-sonnet-5-5 | 4 | 1782 | $0.02382 | 18.3 |  |
| 2026-10-24 06:26 | 2556 | check arm 1 sonnet–sonnet #6 m9 | claude-haiku-5-5 | 2485 | 70 | $0.00028 | 0.8 |  |
| 2026-10-24 06:26 | 2557 | subject arm 1 fable–fable #6 B m28 | claude-fable-5-1 | 4 | 188 | $0.01177 | 3.9 |  |
| 2026-10-24 06:26 | 2558 | check arm 1 fable–fable #6 m28 | claude-haiku-5-5 | 327 | 59 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2559 | subject arm 1 fable–fable #6 A m29 | claude-fable-5-1 | 4 | 158 | $0.01026 | 3.2 |  |
| 2026-10-24 06:26 | 2560 | check arm 1 fable–fable #6 m29 | claude-haiku-5-5 | 327 | 45 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2561 | subject arm 1 fable–fable #6 B m30 | claude-fable-5-1 | 4 | 141 | $0.00941 | 3.3 |  |
| 2026-10-24 06:26 | 2562 | check arm 1 fable–fable #6 m30 | claude-haiku-5-5 | 327 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 2563 | subject arm 1 sonnet–sonnet #6 B m10 | claude-sonnet-5-5 | 4 | 1654 | $0.02316 | 17.4 |  |
| 2026-10-24 06:26 | 2564 | check arm 1 sonnet–sonnet #6 m10 | claude-haiku-5-5 | 2191 | 71 | $0.00025 | 0.7 |  |
| 2026-10-24 06:26 | 2565 | subject arm 1 fable–fable #6 A m31 | claude-fable-5-1 | 4 | 82 | $0.00647 | 2.4 |  |
| 2026-10-24 06:26 | 2566 | subject arm 2 opus–opus #6 A m9 | claude-opus-5-5 | 4 | 2783 | $0.06938 | 31.4 |  |
| 2026-10-24 06:26 | 2567 | check arm 1 fable–fable #6 m31 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 2568 | check arm 2 opus–opus #6 m9 | claude-haiku-5-5 | 2782 | 72 | $0.00031 | 0.8 |  |
| 2026-10-24 06:26 | 2569 | subject arm 1 fable–fable #6 B m32 | claude-fable-5-1 | 4 | 113 | $0.00804 | 2.6 |  |
| 2026-10-24 06:26 | 2570 | check arm 1 fable–fable #6 m32 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.4 |  |
| 2026-10-24 06:26 | 2571 | subject arm 1 fable–fable #6 A m33 | claude-fable-5-1 | 4 | 109 | $0.00784 | 2.6 |  |
| 2026-10-24 06:26 | 2572 | subject arm 1 sonnet–sonnet #6 A m11 | claude-sonnet-5-5 | 4 | 923 | $0.01535 | 9.8 |  |
| 2026-10-24 06:26 | 2573 | check arm 1 fable–fable #6 m33 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 2574 | check arm 1 sonnet–sonnet #6 m11 | claude-haiku-5-5 | 2146 | 68 | $0.00025 | 0.8 |  |
| 2026-10-24 06:26 | 2575 | subject arm 1 fable–fable #6 B m34 | claude-fable-5-1 | 4 | 165 | $0.01065 | 3.5 |  |
| 2026-10-24 06:26 | 2576 | check arm 1 fable–fable #6 m34 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 2577 | subject arm 2 opus–opus #6 B m10 | claude-opus-5-5 | 4 | 1415 | $0.04205 | 16.8 |  |
| 2026-10-24 06:26 | 2578 | check arm 2 opus–opus #6 m10 | claude-haiku-5-5 | 2127 | 82 | $0.00025 | 0.8 |  |
| 2026-10-24 06:26 | 2579 | subject arm 1 fable–fable #6 A m35 | claude-fable-5-1 | 4 | 162 | $0.01050 | 4 |  |
| 2026-10-24 06:26 | 2580 | check arm 1 fable–fable #6 m35 | claude-haiku-5-5 | 325 | 43 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 2581 | subject arm 1 sonnet–sonnet #6 B m12 | claude-sonnet-5-5 | 4 | 1072 | $0.01693 | 11.3 |  |
| 2026-10-24 06:26 | 2582 | check arm 1 sonnet–sonnet #6 m12 | claude-haiku-5-5 | 2310 | 72 | $0.00027 | 0.9 |  |
| 2026-10-24 06:26 | 2583 | subject arm 1 fable–fable #6 B m36 | claude-fable-5-1 | 4 | 143 | $0.00950 | 3.2 |  |
| 2026-10-24 06:26 | 2584 | check arm 1 fable–fable #6 m36 | claude-haiku-5-5 | 325 | 58 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2585 | subject arm 1 fable–fable #6 A m37 | claude-fable-5-1 | 4 | 103 | $0.00750 | 2.8 |  |
| 2026-10-24 06:26 | 2586 | check arm 1 fable–fable #6 m37 | claude-haiku-5-5 | 329 | 57 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2587 | subject arm 1 sonnet–sonnet #6 A m13 | claude-sonnet-5-5 | 4 | 817 | $0.01497 | 9.9 |  |
| 2026-10-24 06:26 | 2588 | check arm 1 sonnet–sonnet #6 m13 | claude-haiku-5-5 | 2204 | 87 | $0.00026 | 0.8 |  |
| 2026-10-24 06:26 | 2589 | subject arm 1 fable–fable #6 B m38 | claude-fable-5-1 | 4 | 169 | $0.01085 | 3.3 |  |
| 2026-10-24 06:26 | 2590 | subject arm 2 opus–opus #6 A m11 | claude-opus-5-5 | 4 | 1810 | $0.04694 | 20.5 |  |
| 2026-10-24 06:26 | 2591 | check arm 1 fable–fable #6 m38 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 2592 | check arm 2 opus–opus #6 m11 | claude-haiku-5-5 | 1824 | 64 | $0.00021 | 0.8 |  |
| 2026-10-24 06:26 | 2593 | subject arm 1 fable–fable #6 A m39 | claude-fable-5-1 | 4 | 115 | $0.00815 | 2.7 |  |
| 2026-10-24 06:26 | 2594 | check arm 1 fable–fable #6 m39 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 2595 | subject arm 1 fable–fable #6 B m40 | claude-fable-5-1 | 4 | 227 | $0.01375 | 4.6 |  |
| 2026-10-24 06:26 | 2596 | subject arm 1 sonnet–sonnet #6 B m14 | claude-sonnet-5-5 | 4 | 1535 | $0.02207 | 14.5 |  |
| 2026-10-24 06:26 | 2597 | check arm 1 fable–fable #6 m40 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.9 |  |
| 2026-10-24 06:26 | 2598 | check arm 1 sonnet–sonnet #6 m14 | claude-haiku-5-5 | 2023 | 79 | $0.00024 | 1.2 |  |
| 2026-10-24 06:26 | 2599 | subject arm 1 fable–fable #6 A m41 | claude-fable-5-1 | 4 | 213 | $0.01306 | 5.1 |  |
| 2026-10-24 06:26 | 2600 | check arm 1 fable–fable #6 m41 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 2601 | subject arm 2 opus–opus #6 B m12 | claude-opus-5-5 | 4 | 1842 | $0.04629 | 22.3 |  |
| 2026-10-24 06:26 | 2602 | check arm 2 opus–opus #6 m12 | claude-haiku-5-5 | 2041 | 82 | $0.00025 | 1 |  |
| 2026-10-24 06:26 | 2603 | subject arm 1 fable–fable #6 B m42 | claude-fable-5-1 | 4 | 259 | $0.01536 | 5.2 |  |
| 2026-10-24 06:26 | 2604 | check arm 1 fable–fable #6 m42 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 2605 | subject arm 1 sonnet–sonnet #6 A m15 | claude-sonnet-5-5 | 4 | 1742 | $0.02390 | 17.5 |  |
| 2026-10-24 06:26 | 2606 | check arm 1 sonnet–sonnet #6 m15 | claude-haiku-5-5 | 2231 | 62 | $0.00025 | 0.7 |  |
| 2026-10-24 06:26 | 2607 | subject arm 1 fable–fable #6 A m43 | claude-fable-5-1 | 4 | 148 | $0.00981 | 3.6 |  |
| 2026-10-24 06:26 | 2608 | check arm 1 fable–fable #6 m43 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 2609 | subject arm 2 opus–opus #6 A m13 | claude-opus-5-5 | 4 | 735 | $0.02537 | 9.4 |  |
| 2026-10-24 06:26 | 2610 | check arm 2 opus–opus #6 m13 | claude-haiku-5-5 | 1517 | 76 | $0.00019 | 0.9 |  |
| 2026-10-24 06:26 | 2611 | subject arm 1 fable–fable #6 B m44 | claude-fable-5-1 | 4 | 185 | $0.01166 | 3.6 |  |
| 2026-10-24 06:26 | 2612 | check arm 1 fable–fable #6 m44 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 2613 | subject arm 2 opus–opus #6 B m14 | claude-opus-5-5 | 4 | 221 | $0.01264 | 4.3 |  |
| 2026-10-24 06:26 | 2614 | tags 1 arm 2 opus–opus #6 m11–13 | claude-haiku-5-5 | 3654 | 211 | $0.00047 | 1.1 |  |
| 2026-10-24 06:26 | 2615 | tags 2 arm 2 opus–opus #6 m1–10 | claude-haiku-5-5 | 11089 | 680 | $0.00145 | 2.4 |  |
| 2026-10-24 06:26 | 2616 | tags 1 arm 2 opus–opus #6 m1–10 | claude-haiku-5-5 | 11089 | 680 | $0.00145 | 2.4 |  |
| 2026-10-24 06:26 | 2617 | subject arm 1 fable–fable #6 A m45 | claude-fable-5-1 | 4 | 129 | $0.00886 | 2.8 |  |
| 2026-10-24 06:26 | 2618 | check arm 1 fable–fable #6 m45 | claude-haiku-5-5 | 329 | 42 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 2619 | tags 2 arm 2 opus–opus #6 m11–13 | claude-haiku-5-5 | 3654 | 211 | $0.00047 | 1 |  |
| 2026-10-24 06:26 | 2620 | subject arm 1 sonnet–sonnet #6 B m16 | claude-sonnet-5-5 | 4 | 1375 | $0.02091 | 14.7 |  |
| 2026-10-24 06:26 | 2621 | check arm 1 sonnet–sonnet #6 m16 | claude-haiku-5-5 | 2108 | 60 | $0.00024 | 0.9 |  |
| 2026-10-24 06:26 | 2622 | subject arm 2 sonnet–sonnet #6 A m1 | claude-sonnet-5-5 | 59 | 420 | $0.00432 | 4.9 |  |
| 2026-10-24 06:26 | 2623 | check arm 2 sonnet–sonnet #6 m1 | claude-haiku-5-5 | 746 | 73 | $0.00011 | 0.8 |  |
| 2026-10-24 06:26 | 2624 | subject arm 1 fable–fable #6 B m46 | claude-fable-5-1 | 4 | 269 | $0.01587 | 4.7 |  |
| 2026-10-24 06:26 | 2625 | check arm 1 fable–fable #6 m46 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 2626 | tags referee arm 2 opus–opus #6 m1–10 | claude-opus-5-5 | 11089 | 968 | $0.06372 | 8.3 |  |
| 2026-10-24 06:26 | 2627 | subject arm 1 fable–fable #6 A m47 | claude-fable-5-1 | 4 | 62 | $0.00552 | 2.3 |  |
| 2026-10-24 06:26 | 2628 | check arm 1 fable–fable #6 m47 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 2629 | subject arm 2 sonnet–sonnet #6 B m2 | claude-sonnet-5-5 | 477 | 603 | $0.00698 | 6.9 |  |
| 2026-10-24 06:26 | 2630 | check arm 2 sonnet–sonnet #6 m2 | claude-haiku-5-5 | 1252 | 70 | $0.00016 | 1.1 |  |
| 2026-10-24 06:26 | 2631 | subject arm 1 fable–fable #6 B m48 | claude-fable-5-1 | 4 | 214 | $0.01312 | 4.8 |  |
| 2026-10-24 06:26 | 2632 | check arm 1 fable–fable #6 m48 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.9 |  |
| 2026-10-24 06:26 | 2633 | subject arm 1 sonnet–sonnet #6 A m17 | claude-sonnet-5-5 | 4 | 2215 | $0.02918 | 20.5 |  |
| 2026-10-24 06:26 | 2634 | check arm 1 sonnet–sonnet #6 m17 | claude-haiku-5-5 | 2305 | 65 | $0.00026 | 1.2 |  |
| 2026-10-24 06:26 | 2635 | subject arm 2 sonnet–sonnet #6 A m3 | claude-sonnet-5-5 | 4 | 1075 | $0.01324 | 11 |  |
| 2026-10-24 06:26 | 2636 | subject arm 1 fable–fable #6 A m49 | claude-fable-5-1 | 4 | 281 | $0.01647 | 5.1 |  |
| 2026-10-24 06:26 | 2637 | check arm 1 fable–fable #6 m49 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 2638 | check arm 2 sonnet–sonnet #6 m3 | claude-haiku-5-5 | 1458 | 74 | $0.00018 | 1 |  |
| 2026-10-24 06:26 | 2639 | subject arm 1 fable–fable #6 B m50 | claude-fable-5-1 | 4 | 212 | $0.01302 | 3.9 |  |
| 2026-10-24 06:26 | 2640 | check arm 1 fable–fable #6 m50 | claude-haiku-5-5 | 414 | 74 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 2641 | subject arm 1 fable–fable #6 A m51 | claude-fable-5-1 | 4 | 154 | $0.01119 | 3.2 |  |
| 2026-10-24 06:26 | 2642 | check arm 1 fable–fable #6 m51 | claude-haiku-5-5 | 458 | 62 | $0.00008 | 0.7 |  |
| 2026-10-24 06:26 | 2643 | subject arm 2 sonnet–sonnet #6 B m4 | claude-sonnet-5-5 | 4 | 1367 | $0.01772 | 12.2 |  |
| 2026-10-24 06:26 | 2644 | check arm 2 sonnet–sonnet #6 m4 | claude-haiku-5-5 | 1450 | 121 | $0.00021 | 1.1 |  |
| 2026-10-24 06:26 | 2645 | subject arm 1 fable–fable #6 B m52 | claude-fable-5-1 | 4 | 83 | $0.00819 | 2.4 |  |
| 2026-10-24 06:26 | 2646 | check arm 1 fable–fable #6 m52 | claude-haiku-5-5 | 373 | 63 | $0.00007 | 1.3 |  |
| 2026-10-24 06:26 | 2647 | subject arm 1 fable–fable #6 A m53 | claude-fable-5-1 | 4 | 84 | $0.00720 | 2.5 |  |
| 2026-10-24 06:26 | 2648 | check arm 1 fable–fable #6 m53 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 2649 | subject arm 1 fable–fable #6 B m54 | claude-fable-5-1 | 4 | 75 | $0.00621 | 2.5 |  |
| 2026-10-24 06:26 | 2650 | check arm 1 fable–fable #6 m54 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 2651 | subject arm 1 sonnet–sonnet #6 B m18 | claude-sonnet-5-5 | 4 | 3524 | $0.04297 | 32.4 |  |
| 2026-10-24 06:26 | 2652 | check arm 1 sonnet–sonnet #6 m18 | claude-haiku-5-5 | 3199 | 65 | $0.00035 | 0.8 |  |
| 2026-10-24 06:26 | 2653 | subject arm 1 fable–fable #6 A m55 | claude-fable-5-1 | 4 | 67 | $0.00581 | 2.3 |  |
| 2026-10-24 06:26 | 2654 | check arm 1 fable–fable #6 m55 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 2655 | subject arm 2 sonnet–sonnet #6 A m5 | claude-sonnet-5-5 | 4 | 1647 | $0.01951 | 19.4 |  |
| 2026-10-24 06:26 | 2656 | check arm 2 sonnet–sonnet #6 m5 | claude-haiku-5-5 | 1555 | 72 | $0.00019 | 0.8 |  |
| 2026-10-24 06:26 | 2657 | subject arm 1 fable–fable #6 B m56 | claude-fable-5-1 | 4 | 52 | $0.00507 | 2.2 |  |
| 2026-10-24 06:26 | 2658 | check arm 1 fable–fable #6 m56 | claude-haiku-5-5 | 329 | 42 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 2659 | subject arm 1 fable–fable #6 A m57 | claude-fable-5-1 | 4 | 59 | $0.00542 | 2.1 |  |
| 2026-10-24 06:26 | 2660 | subject arm 1 sonnet–sonnet #6 A m19 | claude-sonnet-5-5 | 4 | 856 | $0.01868 | 10 |  |
| 2026-10-24 06:26 | 2661 | check arm 1 fable–fable #6 m57 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.1 |  |
| 2026-10-24 06:26 | 2662 | check arm 1 sonnet–sonnet #6 m19 | claude-haiku-5-5 | 2833 | 58 | $0.00031 | 1.7 |  |
| 2026-10-24 06:26 | 2663 | subject arm 1 fable–fable #6 B m58 | claude-fable-5-1 | 4 | 48 | $0.00487 | 2.2 |  |
| 2026-10-24 06:26 | 2664 | check arm 1 fable–fable #6 m58 | claude-haiku-5-5 | 329 | 42 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 2665 | subject arm 2 sonnet–sonnet #6 B m6 | claude-sonnet-5-5 | 4 | 1220 | $0.01563 | 12.1 |  |
| 2026-10-24 06:26 | 2666 | check arm 2 sonnet–sonnet #6 m6 | claude-haiku-5-5 | 1622 | 71 | $0.00020 | 0.7 |  |
| 2026-10-24 06:26 | 2667 | subject arm 1 fable–fable #6 A m59 | claude-fable-5-1 | 4 | 41 | $0.00452 | 1.9 |  |
| 2026-10-24 06:26 | 2668 | check arm 1 fable–fable #6 m59 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 2669 | subject arm 1 fable–fable #6 B m60 | claude-fable-5-1 | 4 | 60 | $0.00547 | 2.1 |  |
| 2026-10-24 06:26 | 2670 | check arm 1 fable–fable #6 m60 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 2671 | tags 1 arm 1 fable–fable #6 m1–10 | claude-haiku-5-5 | 9486 | 680 | $0.00129 | 2.3 |  |
| 2026-10-24 06:26 | 2672 | tags 2 arm 1 fable–fable #6 m1–10 | claude-haiku-5-5 | 9486 | 680 | $0.00129 | 2.5 |  |
| 2026-10-24 06:26 | 2673 | tags 1 arm 1 fable–fable #6 m11–20 | claude-haiku-5-5 | 1178 | 680 | $0.00046 | 2.5 |  |
| 2026-10-24 06:26 | 2674 | subject arm 2 sonnet–sonnet #6 A m7 | claude-sonnet-5-5 | 4 | 1122 | $0.01492 | 11 |  |
| 2026-10-24 06:26 | 2675 | subject arm 1 sonnet–sonnet #7 A m1 | claude-sonnet-5-5 | 40 | 331 | $0.00339 | 4 |  |
| 2026-10-24 06:26 | 2676 | check arm 2 sonnet–sonnet #6 m7 | claude-haiku-5-5 | 1454 | 59 | $0.00017 | 0.7 |  |
| 2026-10-24 06:26 | 2677 | check arm 1 sonnet–sonnet #7 m1 | claude-haiku-5-5 | 657 | 64 | $0.00010 | 0.8 |  |
| 2026-10-24 06:26 | 2678 | tags 2 arm 1 fable–fable #6 m11–20 | claude-haiku-5-5 | 1178 | 680 | $0.00046 | 2.5 |  |
| 2026-10-24 06:26 | 2679 | tags 1 arm 1 fable–fable #6 m21–30 | claude-haiku-5-5 | 1212 | 680 | $0.00046 | 2.6 |  |
| 2026-10-24 06:26 | 2680 | subject arm 1 sonnet–sonnet #6 B m20 | claude-sonnet-5-5 | 4 | 2027 | $0.02972 | 20.2 |  |
| 2026-10-24 06:26 | 2681 | tags 2 arm 1 fable–fable #6 m21–30 | claude-haiku-5-5 | 1212 | 680 | $0.00046 | 3.2 |  |
| 2026-10-24 06:26 | 2682 | check arm 1 sonnet–sonnet #6 m20 | claude-haiku-5-5 | 2132 | 64 | $0.00025 | 0.7 |  |
| 2026-10-24 06:26 | 2683 | tags 2 arm 1 fable–fable #6 m31–40 | claude-haiku-5-5 | 1128 | 680 | $0.00045 | 2.2 |  |
| 2026-10-24 06:26 | 2684 | tags 1 arm 1 fable–fable #6 m31–40 | claude-haiku-5-5 | 1128 | 680 | $0.00045 | 2.8 |  |
| 2026-10-24 06:26 | 2685 | tags 1 arm 1 fable–fable #6 m41–50 | claude-haiku-5-5 | 1217 | 680 | $0.00046 | 2.3 |  |
| 2026-10-24 06:26 | 2686 | subject arm 1 sonnet–sonnet #7 B m2 | claude-sonnet-5-5 | 369 | 707 | $0.00781 | 7.9 |  |
| 2026-10-24 06:26 | 2687 | tags 2 arm 1 fable–fable #6 m41–50 | claude-haiku-5-5 | 1217 | 680 | $0.00046 | 2.2 |  |
| 2026-10-24 06:26 | 2688 | check arm 1 sonnet–sonnet #7 m2 | claude-haiku-5-5 | 1073 | 79 | $0.00015 | 1.5 |  |
| 2026-10-24 06:26 | 2689 | tags 1 arm 1 fable–fable #6 m51–60 | claude-haiku-5-5 | 1261 | 680 | $0.00047 | 2.5 |  |
| 2026-10-24 06:26 | 2690 | tags 2 arm 1 fable–fable #6 m51–60 | claude-haiku-5-5 | 1261 | 680 | $0.00047 | 2.5 |  |
| 2026-10-24 06:26 | 2691 | subject arm 2 sonnet–sonnet #6 B m8 | claude-sonnet-5-5 | 4 | 1144 | $0.01487 | 11.3 |  |
| 2026-10-24 06:26 | 2692 | check arm 2 sonnet–sonnet #6 m8 | claude-haiku-5-5 | 1436 | 65 | $0.00018 | 1 |  |
| 2026-10-24 06:26 | 2693 | subject arm 1 sonnet–sonnet #6 A m21 | claude-sonnet-5-5 | 4 | 1091 | $0.01894 | 11 |  |
| 2026-10-24 06:26 | 2694 | check arm 1 sonnet–sonnet #6 m21 | claude-haiku-5-5 | 2367 | 74 | $0.00027 | 0.7 |  |
| 2026-10-24 06:26 | 2695 | subject arm 1 sonnet–sonnet #7 A m3 | claude-sonnet-5-5 | 4 | 583 | $0.00782 | 6.6 |  |
| 2026-10-24 06:26 | 2696 | tags referee arm 1 fable–fable #6 m1–10 | claude-opus-5-5 | 9486 | 680 | $0.05154 | 5.2 |  |
| 2026-10-24 06:26 | 2697 | check arm 1 sonnet–sonnet #7 m3 | claude-haiku-5-5 | 1262 | 75 | $0.00016 | 1.4 |  |
| 2026-10-24 06:26 | 2698 | subject arm 1 sonnet–sonnet #6 B m22 | claude-sonnet-5-5 | 4 | 774 | $0.01653 | 8 |  |
| 2026-10-24 06:26 | 2699 | subject arm 2 sonnet–sonnet #6 A m9 | claude-sonnet-5-5 | 4 | 1079 | $0.01429 | 11.2 |  |
| 2026-10-24 06:26 | 2700 | check arm 1 sonnet–sonnet #6 m22 | claude-haiku-5-5 | 2180 | 72 | $0.00025 | 0.8 |  |
| 2026-10-24 06:26 | 2701 | check arm 2 sonnet–sonnet #6 m9 | claude-haiku-5-5 | 1515 | 63 | $0.00018 | 0.8 |  |
| 2026-10-24 06:26 | 2702 | subject arm 1 sonnet–sonnet #7 B m4 | claude-sonnet-5-5 | 4 | 795 | $0.01124 | 8.7 |  |
| 2026-10-24 06:26 | 2703 | check arm 1 sonnet–sonnet #7 m4 | claude-haiku-5-5 | 1475 | 80 | $0.00019 | 1 |  |
| 2026-10-24 06:26 | 2704 | subject arm 1 sonnet–sonnet #6 A m23 | claude-sonnet-5-5 | 4 | 1015 | $0.01866 | 11.4 |  |
| 2026-10-24 06:26 | 2705 | check arm 1 sonnet–sonnet #6 m23 | claude-haiku-5-5 | 2104 | 66 | $0.00024 | 0.8 |  |
| 2026-10-24 06:26 | 2706 | subject arm 2 sonnet–sonnet #6 B m10 | claude-sonnet-5-5 | 4 | 1457 | $0.01838 | 15.5 |  |
| 2026-10-24 06:26 | 2707 | subject arm 1 sonnet–sonnet #7 A m5 | claude-sonnet-5-5 | 4 | 804 | $0.01111 | 12.7 |  |
| 2026-10-24 06:26 | 2708 | check arm 2 sonnet–sonnet #6 m10 | claude-haiku-5-5 | 1611 | 67 | $0.00019 | 1.6 |  |
| 2026-10-24 06:26 | 2709 | check arm 1 sonnet–sonnet #7 m5 | claude-haiku-5-5 | 1647 | 100 | $0.00021 | 1.4 |  |
| 2026-10-24 06:26 | 2710 | subject arm 1 sonnet–sonnet #6 B m24 | claude-sonnet-5-5 | 4 | 1004 | $0.01858 | 10.3 |  |
| 2026-10-24 06:26 | 2711 | check arm 1 sonnet–sonnet #6 m24 | claude-haiku-5-5 | 2334 | 67 | $0.00027 | 0.9 |  |
| 2026-10-24 06:26 | 2712 | subject arm 1 sonnet–sonnet #7 B m6 | claude-sonnet-5-5 | 4 | 451 | $0.00811 | 5.3 |  |
| 2026-10-24 06:26 | 2713 | check arm 1 sonnet–sonnet #7 m6 | claude-haiku-5-5 | 1214 | 69 | $0.00016 | 0.9 |  |
| 2026-10-24 06:26 | 2714 | subject arm 1 sonnet–sonnet #7 A m7 | claude-sonnet-5-5 | 4 | 370 | $0.00635 | 4.6 |  |
| 2026-10-24 06:26 | 2715 | check arm 1 sonnet–sonnet #7 m7 | claude-haiku-5-5 | 719 | 72 | $0.00011 | 0.9 |  |
| 2026-10-24 06:26 | 2716 | subject arm 2 sonnet–sonnet #6 A m11 | claude-sonnet-5-5 | 4 | 1921 | $0.02337 | 17.5 |  |
| 2026-10-24 06:26 | 2717 | check arm 2 sonnet–sonnet #6 m11 | claude-haiku-5-5 | 1639 | 67 | $0.00020 | 0.7 |  |
| 2026-10-24 06:26 | 2718 | subject arm 1 sonnet–sonnet #7 B m8 | claude-sonnet-5-5 | 4 | 134 | $0.00289 | 1.7 |  |
| 2026-10-24 06:26 | 2719 | check arm 1 sonnet–sonnet #7 m8 | claude-haiku-5-5 | 646 | 65 | $0.00010 | 0.9 |  |
| 2026-10-24 06:26 | 2720 | subject arm 1 sonnet–sonnet #6 A m25 | claude-sonnet-5-5 | 4 | 1291 | $0.02218 | 13.1 |  |
| 2026-10-24 06:26 | 2721 | check arm 1 sonnet–sonnet #6 m25 | claude-haiku-5-5 | 2092 | 74 | $0.00025 | 1.3 |  |
| 2026-10-24 06:26 | 2722 | subject arm 1 sonnet–sonnet #7 A m9 | claude-sonnet-5-5 | 4 | 67 | $0.00208 | 1.3 |  |
| 2026-10-24 06:26 | 2723 | check arm 1 sonnet–sonnet #7 m9 | claude-haiku-5-5 | 516 | 61 | $0.00008 | 0.7 |  |
| 2026-10-24 06:26 | 2724 | subject arm 1 sonnet–sonnet #7 B m10 | claude-sonnet-5-5 | 4 | 18 | $0.00130 | 1 |  |
| 2026-10-24 06:26 | 2725 | check arm 1 sonnet–sonnet #7 m10 | claude-haiku-5-5 | 400 | 70 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 2726 | subject arm 2 sonnet–sonnet #6 B m12 | claude-sonnet-5-5 | 4 | 1063 | $0.01499 | 10.6 |  |
| 2026-10-24 06:26 | 2727 | subject arm 1 sonnet–sonnet #7 A m11 | claude-sonnet-5-5 | 4 | 29 | $0.00115 | 1.1 |  |
| 2026-10-24 06:26 | 2728 | check arm 2 sonnet–sonnet #6 m12 | claude-haiku-5-5 | 1618 | 74 | $0.00020 | 0.7 |  |
| 2026-10-24 06:26 | 2729 | check arm 1 sonnet–sonnet #7 m11 | claude-haiku-5-5 | 362 | 56 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2730 | subject arm 1 sonnet–sonnet #7 B m12 | claude-sonnet-5-5 | 4 | 13 | $0.00091 | 0.9 |  |
| 2026-10-24 06:26 | 2731 | subject arm 1 sonnet–sonnet #6 B m26 | claude-sonnet-5-5 | 4 | 1130 | $0.02017 | 12.3 |  |
| 2026-10-24 06:26 | 2732 | check arm 1 sonnet–sonnet #7 m12 | claude-haiku-5-5 | 357 | 49 | $0.00006 | 2 |  |
| 2026-10-24 06:26 | 2733 | check arm 1 sonnet–sonnet #6 m26 | claude-haiku-5-5 | 2218 | 68 | $0.00026 | 1.3 |  |
| 2026-10-24 06:26 | 2734 | subject arm 1 sonnet–sonnet #7 A m13 | claude-sonnet-5-5 | 4 | 18 | $0.00095 | 0.9 |  |
| 2026-10-24 06:26 | 2735 | subject arm 2 sonnet–sonnet #6 A m13 | claude-sonnet-5-5 | 4 | 579 | $0.01023 | 5.8 |  |
| 2026-10-24 06:26 | 2736 | check arm 2 sonnet–sonnet #6 m13 | claude-haiku-5-5 | 1527 | 68 | $0.00019 | 0.7 |  |
| 2026-10-24 06:26 | 2737 | check arm 1 sonnet–sonnet #7 m13 | claude-haiku-5-5 | 346 | 67 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 2738 | subject arm 1 sonnet–sonnet #7 B m14 | claude-sonnet-5-5 | 4 | 16 | $0.00090 | 0.9 |  |
| 2026-10-24 06:26 | 2739 | check arm 1 sonnet–sonnet #7 m14 | claude-haiku-5-5 | 349 | 79 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 2740 | subject arm 1 sonnet–sonnet #7 A m15 | claude-sonnet-5-5 | 4 | 88 | $0.00164 | 1.5 |  |
| 2026-10-24 06:26 | 2741 | subject arm 1 sonnet–sonnet #6 A m27 | claude-sonnet-5-5 | 4 | 715 | $0.01653 | 8.3 |  |
| 2026-10-24 06:26 | 2742 | check arm 1 sonnet–sonnet #7 m15 | claude-haiku-5-5 | 346 | 59 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2743 | subject arm 2 sonnet–sonnet #6 B m14 | claude-sonnet-5-5 | 4 | 549 | $0.00983 | 6.2 |  |
| 2026-10-24 06:26 | 2744 | check arm 1 sonnet–sonnet #6 m27 | claude-haiku-5-5 | 2160 | 79 | $0.00026 | 1.1 |  |
| 2026-10-24 06:26 | 2745 | tags 1 arm 2 sonnet–sonnet #6 m11–13 | claude-haiku-5-5 | 3479 | 211 | $0.00045 | 1.7 |  |
| 2026-10-24 06:26 | 2746 | tags 1 arm 2 sonnet–sonnet #6 m1–10 | claude-haiku-5-5 | 6825 | 680 | $0.00102 | 2.6 |  |
| 2026-10-24 06:26 | 2747 | tags 2 arm 2 sonnet–sonnet #6 m1–10 | claude-haiku-5-5 | 6825 | 680 | $0.00102 | 2.8 |  |
| 2026-10-24 06:26 | 2748 | subject arm 1 sonnet–sonnet #7 B m16 | claude-sonnet-5-5 | 4 | 86 | $0.00161 | 1.6 |  |
| 2026-10-24 06:26 | 2749 | check arm 1 sonnet–sonnet #7 m16 | claude-haiku-5-5 | 336 | 57 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2750 | check referee arm 1 sonnet–sonnet #6 m27 | claude-opus-5-5 | 2160 | 71 | $0.01006 | 1.3 |  |
| 2026-10-24 06:26 | 2751 | tags 2 arm 2 sonnet–sonnet #6 m11–13 | claude-haiku-5-5 | 3479 | 211 | $0.00045 | 1 |  |
| 2026-10-24 06:26 | 2752 | subject arm 1 sonnet–sonnet #7 A m17 | claude-sonnet-5-5 | 4 | 106 | $0.00179 | 1.8 |  |
| 2026-10-24 06:26 | 2753 | check arm 1 sonnet–sonnet #7 m17 | claude-haiku-5-5 | 327 | 50 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2754 | subject arm 1 sonnet–sonnet #6 B m28 | claude-sonnet-5-5 | 4 | 395 | $0.01334 | 5.1 |  |
| 2026-10-24 06:26 | 2755 | check arm 1 sonnet–sonnet #6 m28 | claude-haiku-5-5 | 1425 | 78 | $0.00018 | 0.9 |  |
| 2026-10-24 06:26 | 2756 | subject arm 1 sonnet–sonnet #7 B m18 | claude-sonnet-5-5 | 4 | 129 | $0.00200 | 1.9 |  |
| 2026-10-24 06:26 | 2757 | check arm 1 sonnet–sonnet #7 m18 | claude-haiku-5-5 | 343 | 63 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 2758 | subject arm 1 fable–fable #7 A m1 | claude-fable-5-1 | 40 | 570 | $0.02890 | 11.5 |  |
| 2026-10-24 06:26 | 2759 | check arm 1 fable–fable #7 m1 | claude-haiku-5-5 | 777 | 87 | $0.00012 | 0.8 |  |
| 2026-10-24 06:26 | 2760 | subject arm 1 sonnet–sonnet #7 A m19 | claude-sonnet-5-5 | 4 | 16 | $0.00091 | 0.9 |  |
| 2026-10-24 06:26 | 2761 | check arm 1 sonnet–sonnet #7 m19 | claude-haiku-5-5 | 353 | 55 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2762 | subject arm 1 sonnet–sonnet #7 B m20 | claude-sonnet-5-5 | 4 | 20 | $0.00098 | 0.9 |  |
| 2026-10-24 06:26 | 2763 | check arm 1 sonnet–sonnet #7 m20 | claude-haiku-5-5 | 351 | 58 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2764 | subject arm 1 sonnet–sonnet #7 A m21 | claude-sonnet-5-5 | 4 | 17 | $0.00095 | 0.8 |  |
| 2026-10-24 06:26 | 2765 | check arm 1 sonnet–sonnet #7 m21 | claude-haiku-5-5 | 352 | 48 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2766 | subject arm 1 sonnet–sonnet #7 B m22 | claude-sonnet-5-5 | 4 | 6 | $0.00084 | 0.9 |  |
| 2026-10-24 06:26 | 2767 | check arm 1 sonnet–sonnet #7 m22 | claude-haiku-5-5 | 338 | 48 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2768 | subject arm 1 sonnet–sonnet #6 A m29 | claude-sonnet-5-5 | 4 | 1868 | $0.02646 | 18.5 |  |
| 2026-10-24 06:26 | 2769 | subject arm 1 sonnet–sonnet #7 A m23 | claude-sonnet-5-5 | 4 | 6 | $0.00081 | 0.6 |  |
| 2026-10-24 06:26 | 2770 | check arm 1 sonnet–sonnet #6 m29 | claude-haiku-5-5 | 1672 | 80 | $0.00021 | 0.9 |  |
| 2026-10-24 06:26 | 2771 | check arm 1 sonnet–sonnet #7 m23 | claude-haiku-5-5 | 327 | 48 | $0.00006 | 1.4 |  |
| 2026-10-24 06:26 | 2772 | subject arm 1 fable–fable #7 B m2 | claude-fable-5-1 | 489 | 893 | $0.04954 | 18 |  |
| 2026-10-24 06:26 | 2773 | subject arm 1 sonnet–sonnet #7 B m24 | claude-sonnet-5-5 | 4 | 85 | $0.00158 | 1.4 |  |
| 2026-10-24 06:26 | 2774 | check referee arm 1 sonnet–sonnet #6 m29 | claude-opus-5-5 | 1672 | 62 | $0.00793 | 1.6 |  |
| 2026-10-24 06:26 | 2775 | check arm 1 fable–fable #7 m2 | claude-haiku-5-5 | 1577 | 67 | $0.00019 | 1.4 |  |
| 2026-10-24 06:26 | 2776 | check arm 1 sonnet–sonnet #7 m24 | claude-haiku-5-5 | 332 | 56 | $0.00006 | 1.1 |  |
| 2026-10-24 06:26 | 2777 | subject arm 1 sonnet–sonnet #7 A m25 | claude-sonnet-5-5 | 4 | 6 | $0.00080 | 0.9 |  |
| 2026-10-24 06:26 | 2778 | check arm 1 sonnet–sonnet #7 m25 | claude-haiku-5-5 | 332 | 62 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2779 | subject arm 1 sonnet–sonnet #7 B m26 | claude-sonnet-5-5 | 4 | 6 | $0.00080 | 0.9 |  |
| 2026-10-24 06:26 | 2780 | check arm 1 sonnet–sonnet #7 m26 | claude-haiku-5-5 | 327 | 48 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2781 | subject arm 1 sonnet–sonnet #7 A m27 | claude-sonnet-5-5 | 4 | 6 | $0.00079 | 0.6 |  |
| 2026-10-24 06:26 | 2782 | check arm 1 sonnet–sonnet #7 m27 | claude-haiku-5-5 | 327 | 48 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2783 | subject arm 1 sonnet–sonnet #7 B m28 | claude-sonnet-5-5 | 4 | 6 | $0.00079 | 0.8 |  |
| 2026-10-24 06:26 | 2784 | check arm 1 sonnet–sonnet #7 m28 | claude-haiku-5-5 | 327 | 50 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2785 | subject arm 1 sonnet–sonnet #6 B m30 | claude-sonnet-5-5 | 4 | 1597 | $0.02451 | 17.1 |  |
| 2026-10-24 06:26 | 2786 | check arm 1 sonnet–sonnet #6 m30 | claude-haiku-5-5 | 2107 | 67 | $0.00024 | 0.6 |  |
| 2026-10-24 06:26 | 2787 | subject arm 1 sonnet–sonnet #7 A m29 | claude-sonnet-5-5 | 4 | 120 | $0.00193 | 1.8 |  |
| 2026-10-24 06:26 | 2788 | check arm 1 sonnet–sonnet #7 m29 | claude-haiku-5-5 | 370 | 56 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2789 | subject arm 1 sonnet–sonnet #7 B m30 | claude-sonnet-5-5 | 4 | 34 | $0.00118 | 1 |  |
| 2026-10-24 06:26 | 2790 | check arm 1 sonnet–sonnet #7 m30 | claude-haiku-5-5 | 398 | 57 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 2791 | subject arm 1 sonnet–sonnet #7 A m31 | claude-sonnet-5-5 | 4 | 16 | $0.00107 | 0.8 |  |
| 2026-10-24 06:26 | 2792 | check arm 1 sonnet–sonnet #7 m31 | claude-haiku-5-5 | 365 | 50 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 2793 | subject arm 1 sonnet–sonnet #6 A m31 | claude-sonnet-5-5 | 4 | 849 | $0.01820 | 9.2 |  |
| 2026-10-24 06:26 | 2794 | check arm 1 sonnet–sonnet #6 m31 | claude-haiku-5-5 | 1783 | 73 | $0.00021 | 0.8 |  |
| 2026-10-24 06:26 | 2795 | subject arm 1 sonnet–sonnet #7 B m32 | claude-sonnet-5-5 | 4 | 11 | $0.00095 | 0.9 |  |
| 2026-10-24 06:26 | 2796 | check arm 1 sonnet–sonnet #7 m32 | claude-haiku-5-5 | 342 | 55 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2797 | subject arm 1 fable–fable #7 A m3 | claude-fable-5-1 | 4 | 1452 | $0.08886 | 31.1 |  |
| 2026-10-24 06:26 | 2798 | check arm 1 fable–fable #7 m3 | claude-haiku-5-5 | 2501 | 76 | $0.00029 | 0.7 |  |
| 2026-10-24 06:26 | 2799 | subject arm 1 sonnet–sonnet #7 A m33 | claude-sonnet-5-5 | 4 | 6 | $0.00085 | 0.7 |  |
| 2026-10-24 06:26 | 2800 | check arm 1 sonnet–sonnet #7 m33 | claude-haiku-5-5 | 332 | 59 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2801 | subject arm 1 sonnet–sonnet #7 B m34 | claude-sonnet-5-5 | 4 | 6 | $0.00083 | 0.9 |  |
| 2026-10-24 06:26 | 2802 | subject arm 1 sonnet–sonnet #6 B m32 | claude-sonnet-5-5 | 4 | 468 | $0.01377 | 6.8 |  |
| 2026-10-24 06:26 | 2803 | check arm 1 sonnet–sonnet #7 m34 | claude-haiku-5-5 | 327 | 49 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2804 | check arm 1 sonnet–sonnet #6 m32 | claude-haiku-5-5 | 1421 | 73 | $0.00018 | 0.8 |  |
| 2026-10-24 06:26 | 2805 | subject arm 1 sonnet–sonnet #7 A m35 | claude-sonnet-5-5 | 4 | 6 | $0.00082 | 0.6 |  |
| 2026-10-24 06:26 | 2806 | check arm 1 sonnet–sonnet #7 m35 | claude-haiku-5-5 | 327 | 64 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2807 | subject arm 1 sonnet–sonnet #6 A m33 | claude-sonnet-5-5 | 4 | 388 | $0.01223 | 4.1 |  |
| 2026-10-24 06:26 | 2808 | check arm 1 sonnet–sonnet #6 m33 | claude-haiku-5-5 | 1171 | 65 | $0.00015 | 0.8 |  |
| 2026-10-24 06:26 | 2809 | subject arm 1 sonnet–sonnet #7 B m36 | claude-sonnet-5-5 | 4 | 97 | $0.00173 | 1.6 |  |
| 2026-10-24 06:26 | 2810 | check arm 1 sonnet–sonnet #7 m36 | claude-haiku-5-5 | 355 | 67 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 2811 | subject arm 1 sonnet–sonnet #7 A m37 | claude-sonnet-5-5 | 4 | 21 | $0.00104 | 0.9 |  |
| 2026-10-24 06:26 | 2812 | check arm 1 sonnet–sonnet #7 m37 | claude-haiku-5-5 | 370 | 65 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 2813 | subject arm 1 sonnet–sonnet #6 B m34 | claude-sonnet-5-5 | 4 | 268 | $0.01053 | 3.5 |  |
| 2026-10-24 06:26 | 2814 | check arm 1 sonnet–sonnet #6 m34 | claude-haiku-5-5 | 971 | 72 | $0.00013 | 0.7 |  |
| 2026-10-24 06:26 | 2815 | subject arm 1 sonnet–sonnet #7 B m38 | claude-sonnet-5-5 | 4 | 15 | $0.00102 | 0.9 |  |
| 2026-10-24 06:26 | 2816 | check arm 1 sonnet–sonnet #7 m38 | claude-haiku-5-5 | 351 | 47 | $0.00006 | 1.4 |  |
| 2026-10-24 06:26 | 2817 | subject arm 1 sonnet–sonnet #6 A m35 | claude-sonnet-5-5 | 4 | 184 | $0.00929 | 2.9 |  |
| 2026-10-24 06:26 | 2818 | subject arm 1 sonnet–sonnet #7 A m39 | claude-sonnet-5-5 | 4 | 13 | $0.00096 | 0.7 |  |
| 2026-10-24 06:26 | 2819 | check arm 1 sonnet–sonnet #6 m35 | claude-haiku-5-5 | 767 | 71 | $0.00011 | 0.7 |  |
| 2026-10-24 06:26 | 2820 | check arm 1 sonnet–sonnet #7 m39 | claude-haiku-5-5 | 343 | 55 | $0.00006 | 1.1 |  |
| 2026-10-24 06:26 | 2821 | subject arm 1 sonnet–sonnet #7 B m40 | claude-sonnet-5-5 | 4 | 13 | $0.00094 | 0.9 |  |
| 2026-10-24 06:26 | 2822 | subject arm 1 sonnet–sonnet #6 B m36 | claude-sonnet-5-5 | 4 | 111 | $0.00813 | 2.1 |  |
| 2026-10-24 06:26 | 2823 | check arm 1 sonnet–sonnet #7 m40 | claude-haiku-5-5 | 341 | 72 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 2824 | check arm 1 sonnet–sonnet #6 m36 | claude-haiku-5-5 | 610 | 62 | $0.00009 | 2.1 |  |
| 2026-10-24 06:26 | 2825 | subject arm 1 sonnet–sonnet #7 A m41 | claude-sonnet-5-5 | 4 | 6 | $0.00087 | 0.8 |  |
| 2026-10-24 06:26 | 2826 | check arm 1 sonnet–sonnet #7 m41 | claude-haiku-5-5 | 334 | 65 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 2827 | subject arm 1 sonnet–sonnet #6 A m37 | claude-sonnet-5-5 | 4 | 43 | $0.00711 | 1.5 |  |
| 2026-10-24 06:26 | 2828 | check arm 1 sonnet–sonnet #6 m37 | claude-haiku-5-5 | 469 | 58 | $0.00008 | 0.7 |  |
| 2026-10-24 06:26 | 2829 | subject arm 1 sonnet–sonnet #7 B m42 | claude-sonnet-5-5 | 4 | 6 | $0.00086 | 0.9 |  |
| 2026-10-24 06:26 | 2830 | subject arm 1 fable–fable #7 B m4 | claude-fable-5-1 | 4 | 1882 | $0.12753 | 35.8 |  |
| 2026-10-24 06:26 | 2831 | check arm 1 sonnet–sonnet #7 m42 | claude-haiku-5-5 | 327 | 50 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2832 | subject arm 1 sonnet–sonnet #6 B m38 | claude-sonnet-5-5 | 4 | 13 | $0.00649 | 1 |  |
| 2026-10-24 06:26 | 2833 | check arm 1 fable–fable #7 m4 | claude-haiku-5-5 | 2762 | 74 | $0.00031 | 1 |  |
| 2026-10-24 06:26 | 2834 | check arm 1 sonnet–sonnet #6 m38 | claude-haiku-5-5 | 371 | 48 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2835 | subject arm 1 sonnet–sonnet #7 A m43 | claude-sonnet-5-5 | 4 | 6 | $0.00084 | 0.6 |  |
| 2026-10-24 06:26 | 2836 | check arm 1 sonnet–sonnet #7 m43 | claude-haiku-5-5 | 327 | 50 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2837 | subject arm 1 sonnet–sonnet #6 A m39 | claude-sonnet-5-5 | 4 | 8 | $0.00622 | 1 |  |
| 2026-10-24 06:26 | 2838 | check arm 1 sonnet–sonnet #6 m39 | claude-haiku-5-5 | 336 | 48 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2839 | subject arm 1 sonnet–sonnet #7 B m44 | claude-sonnet-5-5 | 4 | 159 | $0.00237 | 2.3 |  |
| 2026-10-24 06:26 | 2840 | subject arm 1 sonnet–sonnet #6 B m40 | claude-sonnet-5-5 | 4 | 8 | $0.00614 | 0.9 |  |
| 2026-10-24 06:26 | 2841 | check arm 1 sonnet–sonnet #7 m44 | claude-haiku-5-5 | 347 | 68 | $0.00007 | 1.4 |  |
| 2026-10-24 06:26 | 2842 | check arm 1 sonnet–sonnet #6 m40 | claude-haiku-5-5 | 331 | 49 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2843 | subject arm 1 sonnet–sonnet #7 A m45 | claude-sonnet-5-5 | 4 | 15 | $0.00098 | 0.7 |  |
| 2026-10-24 06:26 | 2844 | subject arm 1 sonnet–sonnet #6 A m41 | claude-sonnet-5-5 | 4 | 8 | $0.00613 | 1.1 |  |
| 2026-10-24 06:26 | 2845 | check arm 1 sonnet–sonnet #7 m45 | claude-haiku-5-5 | 356 | 73 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 2846 | check arm 1 sonnet–sonnet #6 m41 | claude-haiku-5-5 | 331 | 49 | $0.00006 | 1.2 |  |
| 2026-10-24 06:26 | 2847 | subject arm 1 sonnet–sonnet #7 B m46 | claude-sonnet-5-5 | 4 | 6 | $0.00092 | 0.9 |  |
| 2026-10-24 06:26 | 2848 | check arm 1 sonnet–sonnet #7 m46 | claude-haiku-5-5 | 336 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2849 | subject arm 1 sonnet–sonnet #6 B m42 | claude-sonnet-5-5 | 4 | 115 | $0.00720 | 2.4 |  |
| 2026-10-24 06:26 | 2850 | check arm 1 sonnet–sonnet #6 m42 | claude-haiku-5-5 | 330 | 50 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2851 | subject arm 1 sonnet–sonnet #7 A m47 | claude-sonnet-5-5 | 4 | 6 | $0.00087 | 0.7 |  |
| 2026-10-24 06:26 | 2852 | check arm 1 sonnet–sonnet #7 m47 | claude-haiku-5-5 | 327 | 50 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2853 | subject arm 1 sonnet–sonnet #6 A m43 | claude-sonnet-5-5 | 4 | 7 | $0.00612 | 1 |  |
| 2026-10-24 06:26 | 2854 | subject arm 1 sonnet–sonnet #7 B m48 | claude-sonnet-5-5 | 4 | 6 | $0.00085 | 0.9 |  |
| 2026-10-24 06:26 | 2855 | check arm 1 sonnet–sonnet #6 m43 | claude-haiku-5-5 | 329 | 52 | $0.00006 | 1.1 |  |
| 2026-10-24 06:26 | 2856 | check arm 1 sonnet–sonnet #7 m48 | claude-haiku-5-5 | 327 | 47 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2857 | subject arm 1 sonnet–sonnet #6 B m44 | claude-sonnet-5-5 | 4 | 7 | $0.00612 | 1 |  |
| 2026-10-24 06:26 | 2858 | subject arm 1 sonnet–sonnet #7 A m49 | claude-sonnet-5-5 | 4 | 31 | $0.00110 | 1 |  |
| 2026-10-24 06:26 | 2859 | check arm 1 sonnet–sonnet #6 m44 | claude-haiku-5-5 | 329 | 56 | $0.00006 | 1 |  |
| 2026-10-24 06:26 | 2860 | check arm 1 sonnet–sonnet #7 m49 | claude-haiku-5-5 | 352 | 53 | $0.00006 | 1.1 |  |
| 2026-10-24 06:26 | 2861 | subject arm 1 sonnet–sonnet #6 A m45 | claude-sonnet-5-5 | 4 | 159 | $0.00764 | 2.5 |  |
| 2026-10-24 06:26 | 2862 | subject arm 1 sonnet–sonnet #7 B m50 | claude-sonnet-5-5 | 4 | 161 | $0.00247 | 2 |  |
| 2026-10-24 06:26 | 2863 | check arm 1 sonnet–sonnet #6 m45 | claude-haiku-5-5 | 360 | 67 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 2864 | check arm 1 sonnet–sonnet #7 m50 | claude-haiku-5-5 | 363 | 65 | $0.00007 | 1.7 |  |
| 2026-10-24 06:26 | 2865 | subject arm 1 sonnet–sonnet #7 A m51 | claude-sonnet-5-5 | 4 | 14 | $0.00103 | 0.7 |  |
| 2026-10-24 06:26 | 2866 | subject arm 1 sonnet–sonnet #6 B m46 | claude-sonnet-5-5 | 4 | 16 | $0.00629 | 1.1 |  |
| 2026-10-24 06:26 | 2867 | check arm 1 sonnet–sonnet #6 m46 | claude-haiku-5-5 | 369 | 53 | $0.00006 | 1 |  |
| 2026-10-24 06:26 | 2868 | check arm 1 sonnet–sonnet #7 m51 | claude-haiku-5-5 | 346 | 56 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2869 | subject arm 1 sonnet–sonnet #7 B m52 | claude-sonnet-5-5 | 4 | 6 | $0.00091 | 0.9 |  |
| 2026-10-24 06:26 | 2870 | subject arm 1 sonnet–sonnet #6 A m47 | claude-sonnet-5-5 | 4 | 8 | $0.00623 | 1 |  |
| 2026-10-24 06:26 | 2871 | check arm 1 sonnet–sonnet #6 m47 | claude-haiku-5-5 | 339 | 54 | $0.00006 | 1.5 |  |
| 2026-10-24 06:26 | 2872 | check arm 1 sonnet–sonnet #7 m52 | claude-haiku-5-5 | 335 | 62 | $0.00006 | 1.4 |  |
| 2026-10-24 06:26 | 2873 | subject arm 1 sonnet–sonnet #7 A m53 | claude-sonnet-5-5 | 4 | 6 | $0.00089 | 0.7 |  |
| 2026-10-24 06:26 | 2874 | subject arm 1 sonnet–sonnet #6 B m48 | claude-sonnet-5-5 | 4 | 8 | $0.00617 | 0.8 |  |
| 2026-10-24 06:26 | 2875 | subject arm 1 fable–fable #7 A m5 | claude-fable-5-1 | 4 | 2027 | $0.13230 | 40.6 |  |
| 2026-10-24 06:26 | 2876 | check arm 1 fable–fable #7 m5 | claude-haiku-5-5 | 2699 | 69 | $0.00030 | 0.9 |  |
| 2026-10-24 06:26 | 2877 | check arm 1 sonnet–sonnet #6 m48 | claude-haiku-5-5 | 331 | 66 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 2878 | check arm 1 sonnet–sonnet #7 m53 | claude-haiku-5-5 | 327 | 51 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2879 | subject arm 1 sonnet–sonnet #7 B m54 | claude-sonnet-5-5 | 4 | 127 | $0.00208 | 1.9 |  |
| 2026-10-24 06:26 | 2880 | subject arm 1 sonnet–sonnet #6 A m49 | claude-sonnet-5-5 | 4 | 105 | $0.00712 | 2.1 |  |
| 2026-10-24 06:26 | 2881 | check arm 1 sonnet–sonnet #6 m49 | claude-haiku-5-5 | 326 | 64 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2882 | check arm 1 sonnet–sonnet #7 m54 | claude-haiku-5-5 | 363 | 72 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 2883 | subject arm 1 sonnet–sonnet #7 A m55 | claude-sonnet-5-5 | 4 | 21 | $0.00111 | 0.7 |  |
| 2026-10-24 06:26 | 2884 | check arm 1 sonnet–sonnet #7 m55 | claude-haiku-5-5 | 378 | 69 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 2885 | subject arm 1 sonnet–sonnet #6 B m50 | claude-sonnet-5-5 | 4 | 128 | $0.00734 | 2.2 |  |
| 2026-10-24 06:26 | 2886 | check arm 1 sonnet–sonnet #6 m50 | claude-haiku-5-5 | 342 | 61 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2887 | subject arm 1 sonnet–sonnet #7 B m56 | claude-sonnet-5-5 | 4 | 6 | $0.00100 | 0.9 |  |
| 2026-10-24 06:26 | 2888 | check arm 1 sonnet–sonnet #7 m56 | claude-haiku-5-5 | 342 | 66 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 2889 | subject arm 1 sonnet–sonnet #6 A m51 | claude-sonnet-5-5 | 4 | 6 | $0.00616 | 1.2 |  |
| 2026-10-24 06:26 | 2890 | check arm 1 sonnet–sonnet #6 m51 | claude-haiku-5-5 | 345 | 56 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2891 | subject arm 1 sonnet–sonnet #7 A m57 | claude-sonnet-5-5 | 4 | 6 | $0.00092 | 0.7 |  |
| 2026-10-24 06:26 | 2892 | check arm 1 sonnet–sonnet #7 m57 | claude-haiku-5-5 | 327 | 48 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2893 | subject arm 1 sonnet–sonnet #6 B m52 | claude-sonnet-5-5 | 4 | 60 | $0.00671 | 1.6 |  |
| 2026-10-24 06:26 | 2894 | check arm 1 sonnet–sonnet #6 m52 | claude-haiku-5-5 | 327 | 52 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2895 | subject arm 1 sonnet–sonnet #7 B m58 | claude-sonnet-5-5 | 4 | 150 | $0.00232 | 2.1 |  |
| 2026-10-24 06:26 | 2896 | check arm 1 sonnet–sonnet #7 m58 | claude-haiku-5-5 | 346 | 54 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2897 | subject arm 1 sonnet–sonnet #7 A m59 | claude-sonnet-5-5 | 4 | 20 | $0.00107 | 0.7 |  |
| 2026-10-24 06:26 | 2898 | subject arm 1 sonnet–sonnet #6 A m53 | claude-sonnet-5-5 | 4 | 138 | $0.00745 | 2.7 |  |
| 2026-10-24 06:26 | 2899 | check arm 1 sonnet–sonnet #6 m53 | claude-haiku-5-5 | 343 | 70 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 2900 | check arm 1 sonnet–sonnet #7 m59 | claude-haiku-5-5 | 360 | 53 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2901 | subject arm 1 sonnet–sonnet #7 B m60 | claude-sonnet-5-5 | 4 | 15 | $0.00106 | 0.9 |  |
| 2026-10-24 06:26 | 2902 | check arm 1 sonnet–sonnet #7 m60 | claude-haiku-5-5 | 350 | 56 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2903 | subject arm 1 sonnet–sonnet #6 B m54 | claude-sonnet-5-5 | 4 | 183 | $0.00794 | 3.1 |  |
| 2026-10-24 06:26 | 2904 | check arm 1 sonnet–sonnet #6 m54 | claude-haiku-5-5 | 343 | 64 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 2905 | tags 1 arm 1 sonnet–sonnet #7 m1–10 | claude-haiku-5-5 | 4262 | 680 | $0.00077 | 2.2 |  |
| 2026-10-24 06:26 | 2906 | tags 2 arm 1 sonnet–sonnet #7 m1–10 | claude-haiku-5-5 | 4262 | 680 | $0.00077 | 2.5 |  |
| 2026-10-24 06:26 | 2907 | tags 1 arm 1 sonnet–sonnet #7 m11–20 | claude-haiku-5-5 | 1234 | 680 | $0.00046 | 2.9 |  |
| 2026-10-24 06:26 | 2908 | subject arm 1 sonnet–sonnet #6 A m55 | claude-sonnet-5-5 | 4 | 100 | $0.00711 | 2.1 |  |
| 2026-10-24 06:26 | 2909 | subject arm 2 sonnet–sonnet #7 A m1 | claude-sonnet-5-5 | 59 | 390 | $0.00402 | 4.6 |  |
| 2026-10-24 06:26 | 2910 | check arm 1 sonnet–sonnet #6 m55 | claude-haiku-5-5 | 324 | 58 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2911 | tags 2 arm 1 sonnet–sonnet #7 m11–20 | claude-haiku-5-5 | 1234 | 680 | $0.00046 | 2.3 |  |
| 2026-10-24 06:26 | 2912 | tags 1 arm 1 sonnet–sonnet #7 m21–30 | claude-haiku-5-5 | 1222 | 680 | $0.00046 | 2.3 |  |
| 2026-10-24 06:26 | 2913 | check arm 2 sonnet–sonnet #7 m1 | claude-haiku-5-5 | 716 | 60 | $0.00010 | 1.6 |  |
| 2026-10-24 06:26 | 2914 | tags 2 arm 1 sonnet–sonnet #7 m21–30 | claude-haiku-5-5 | 1222 | 680 | $0.00046 | 2.4 |  |
| 2026-10-24 06:26 | 2915 | subject arm 1 fable–fable #7 B m6 | claude-fable-5-1 | 4 | 1925 | $0.12676 | 35.8 |  |
| 2026-10-24 06:26 | 2916 | check arm 1 fable–fable #7 m6 | claude-haiku-5-5 | 2701 | 86 | $0.00031 | 0.6 |  |
| 2026-10-24 06:26 | 2917 | subject arm 1 sonnet–sonnet #6 B m56 | claude-sonnet-5-5 | 4 | 173 | $0.00780 | 2.7 |  |
| 2026-10-24 06:26 | 2918 | tags 2 arm 1 sonnet–sonnet #7 m31–40 | claude-haiku-5-5 | 1230 | 680 | $0.00046 | 2.1 |  |
| 2026-10-24 06:26 | 2919 | check arm 1 sonnet–sonnet #6 m56 | claude-haiku-5-5 | 345 | 62 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 2920 | tags 1 arm 1 sonnet–sonnet #7 m41–50 | claude-haiku-5-5 | 1193 | 680 | $0.00046 | 3 |  |
| 2026-10-24 06:26 | 2921 | tags 1 arm 1 sonnet–sonnet #7 m31–40 | claude-haiku-5-5 | 1230 | 680 | $0.00046 | 3.7 |  |
| 2026-10-24 06:26 | 2922 | subject arm 2 sonnet–sonnet #7 B m2 | claude-sonnet-5-5 | 447 | 478 | $0.00567 | 5.7 |  |
| 2026-10-24 06:26 | 2923 | check arm 2 sonnet–sonnet #7 m2 | claude-haiku-5-5 | 1183 | 69 | $0.00015 | 1.5 |  |
| 2026-10-24 06:26 | 2924 | subject arm 1 sonnet–sonnet #6 A m57 | claude-sonnet-5-5 | 4 | 124 | $0.00736 | 2.7 |  |
| 2026-10-24 06:26 | 2925 | tags 2 arm 1 sonnet–sonnet #7 m41–50 | claude-haiku-5-5 | 1193 | 680 | $0.00046 | 2.1 |  |
| 2026-10-24 06:26 | 2926 | check arm 1 sonnet–sonnet #6 m57 | claude-haiku-5-5 | 355 | 72 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 2927 | tags 1 arm 1 sonnet–sonnet #7 m51–60 | claude-haiku-5-5 | 1233 | 680 | $0.00046 | 2.2 |  |
| 2026-10-24 06:26 | 2928 | tags 2 arm 1 sonnet–sonnet #7 m51–60 | claude-haiku-5-5 | 1233 | 680 | $0.00046 | 2.3 |  |
| 2026-10-24 06:26 | 2929 | subject arm 1 sonnet–sonnet #6 B m58 | claude-sonnet-5-5 | 4 | 117 | $0.00732 | 2.4 |  |
| 2026-10-24 06:26 | 2930 | check arm 1 sonnet–sonnet #6 m58 | claude-haiku-5-5 | 335 | 63 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 2931 | subject arm 2 sonnet–sonnet #7 A m3 | claude-sonnet-5-5 | 4 | 680 | $0.00912 | 8.1 |  |
| 2026-10-24 06:26 | 2932 | subject arm 1 sonnet–sonnet #6 A m59 | claude-sonnet-5-5 | 4 | 7 | $0.00617 | 1 |  |
| 2026-10-24 06:26 | 2933 | check arm 2 sonnet–sonnet #7 m3 | claude-haiku-5-5 | 1473 | 74 | $0.00018 | 1 |  |
| 2026-10-24 06:26 | 2934 | check arm 1 sonnet–sonnet #6 m59 | claude-haiku-5-5 | 329 | 52 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 2935 | subject arm 1 sonnet–sonnet #6 B m60 | claude-sonnet-5-5 | 4 | 7 | $0.00616 | 1.2 |  |
| 2026-10-24 06:26 | 2936 | check arm 1 sonnet–sonnet #6 m60 | claude-haiku-5-5 | 329 | 51 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 2937 | tags 2 arm 1 sonnet–sonnet #6 m1–10 | claude-haiku-5-5 | 10001 | 680 | $0.00134 | 2.3 |  |
| 2026-10-24 06:26 | 2938 | tags 1 arm 1 sonnet–sonnet #6 m1–10 | claude-haiku-5-5 | 10001 | 680 | $0.00134 | 2.3 |  |
| 2026-10-24 06:26 | 2939 | tags 1 arm 1 sonnet–sonnet #6 m11–20 | claude-haiku-5-5 | 12160 | 680 | $0.00156 | 2.5 |  |
| 2026-10-24 06:26 | 2940 | tags 2 arm 1 sonnet–sonnet #6 m21–30 | claude-haiku-5-5 | 10705 | 680 | $0.00141 | 2.5 |  |
| 2026-10-24 06:26 | 2941 | tags 2 arm 1 sonnet–sonnet #6 m11–20 | claude-haiku-5-5 | 12160 | 680 | $0.00156 | 2.7 |  |
| 2026-10-24 06:26 | 2942 | tags 1 arm 1 sonnet–sonnet #6 m21–30 | claude-haiku-5-5 | 10705 | 680 | $0.00141 | 3.3 |  |
| 2026-10-24 06:26 | 2943 | subject arm 2 sonnet–sonnet #7 B m4 | claude-sonnet-5-5 | 4 | 1461 | $0.01862 | 15.4 |  |
| 2026-10-24 06:26 | 2944 | tags 1 arm 1 sonnet–sonnet #6 m31–40 | claude-haiku-5-5 | 4014 | 680 | $0.00074 | 2.2 |  |
| 2026-10-24 06:26 | 2945 | subject arm 2 fable–fable #7 A m1 | claude-fable-5-1 | 59 | 530 | $0.02709 | 11 |  |
| 2026-10-24 06:26 | 2946 | tags 2 arm 1 sonnet–sonnet #6 m31–40 | claude-haiku-5-5 | 4014 | 680 | $0.00074 | 2.2 |  |
| 2026-10-24 06:26 | 2947 | check arm 2 sonnet–sonnet #7 m4 | claude-haiku-5-5 | 1672 | 58 | $0.00020 | 1 |  |
| 2026-10-24 06:26 | 2948 | tags 1 arm 1 sonnet–sonnet #6 m41–50 | claude-haiku-5-5 | 1189 | 680 | $0.00046 | 2.2 |  |
| 2026-10-24 06:26 | 2949 | check arm 2 fable–fable #7 m1 | claude-haiku-5-5 | 785 | 86 | $0.00012 | 0.9 |  |
| 2026-10-24 06:26 | 2950 | tags 1 arm 1 sonnet–sonnet #6 m51–60 | claude-haiku-5-5 | 1183 | 680 | $0.00046 | 2.2 |  |
| 2026-10-24 06:26 | 2951 | tags 2 arm 1 sonnet–sonnet #6 m41–50 | claude-haiku-5-5 | 1189 | 680 | $0.00046 | 2.3 |  |
| 2026-10-24 06:26 | 2952 | tags 2 arm 1 sonnet–sonnet #6 m51–60 | claude-haiku-5-5 | 1183 | 680 | $0.00046 | 2.2 |  |
| 2026-10-24 06:26 | 2953 | subject arm 2 sonnet–sonnet #7 A m5 | claude-sonnet-5-5 | 4 | 720 | $0.01079 | 9.1 |  |
| 2026-10-24 06:26 | 2954 | check arm 2 sonnet–sonnet #7 m5 | claude-haiku-5-5 | 1712 | 78 | $0.00021 | 1 |  |
| 2026-10-24 06:26 | 2955 | tags referee arm 1 sonnet–sonnet #6 m1–10 | claude-opus-5-5 | 10001 | 792 | $0.05584 | 6.6 |  |
| 2026-10-24 06:26 | 2956 | subject arm 1 fable–fable #7 A m7 | claude-fable-5-1 | 4 | 2953 | $0.17845 | 54.7 |  |
| 2026-10-24 06:26 | 2957 | check arm 1 fable–fable #7 m7 | claude-haiku-5-5 | 2565 | 76 | $0.00029 | 0.8 |  |
| 2026-10-24 06:26 | 2958 | subject arm 2 sonnet–sonnet #7 B m6 | claude-sonnet-5-5 | 4 | 804 | $0.01186 | 9.2 |  |
| 2026-10-24 06:26 | 2959 | check arm 2 sonnet–sonnet #7 m6 | claude-haiku-5-5 | 1839 | 77 | $0.00022 | 0.9 |  |
| 2026-10-24 06:26 | 2960 | subject arm 2 fable–fable #7 B m2 | claude-fable-5-1 | 4 | 1812 | $0.09704 | 33.3 |  |
| 2026-10-24 06:26 | 2961 | subject arm 2 sonnet–sonnet #7 A m7 | claude-sonnet-5-5 | 4 | 887 | $0.01314 | 9.7 |  |
| 2026-10-24 06:26 | 2962 | check arm 2 fable–fable #7 m2 | claude-haiku-5-5 | 1667 | 67 | $0.00020 | 0.7 |  |
| 2026-10-24 06:26 | 2963 | check arm 2 sonnet–sonnet #7 m7 | claude-haiku-5-5 | 2006 | 82 | $0.00024 | 0.8 |  |
| 2026-10-24 06:26 | 2964 | subject arm 2 sonnet–sonnet #7 B m8 | claude-sonnet-5-5 | 4 | 762 | $0.01246 | 9 |  |
| 2026-10-24 06:26 | 2965 | check arm 2 sonnet–sonnet #7 m8 | claude-haiku-5-5 | 1964 | 79 | $0.00024 | 1.9 |  |
| 2026-10-24 06:26 | 2966 | subject arm 1 fable–fable #7 B m8 | claude-fable-5-1 | 4 | 1753 | $0.11708 | 32.3 |  |
| 2026-10-24 06:26 | 2967 | check arm 1 fable–fable #7 m8 | claude-haiku-5-5 | 2001 | 61 | $0.00023 | 0.7 |  |
| 2026-10-24 06:26 | 2968 | subject arm 2 sonnet–sonnet #7 A m9 | claude-sonnet-5-5 | 4 | 597 | $0.01086 | 7.7 |  |
| 2026-10-24 06:26 | 2969 | check arm 2 sonnet–sonnet #7 m9 | claude-haiku-5-5 | 1674 | 71 | $0.00020 | 1.1 |  |
| 2026-10-24 06:26 | 2970 | subject arm 2 fable–fable #7 A m3 | claude-fable-5-1 | 4 | 1301 | $0.08268 | 24.8 |  |
| 2026-10-24 06:26 | 2971 | check arm 2 fable–fable #7 m3 | claude-haiku-5-5 | 2005 | 73 | $0.00024 | 0.8 |  |
| 2026-10-24 06:26 | 2972 | subject arm 2 sonnet–sonnet #7 B m10 | claude-sonnet-5-5 | 4 | 576 | $0.01010 | 6.9 |  |
| 2026-10-24 06:26 | 2973 | check arm 2 sonnet–sonnet #7 m10 | claude-haiku-5-5 | 1488 | 65 | $0.00018 | 0.8 |  |
| 2026-10-24 06:26 | 2974 | subject arm 2 sonnet–sonnet #7 A m11 | claude-sonnet-5-5 | 4 | 1142 | $0.01545 | 13.1 |  |
| 2026-10-24 06:26 | 2975 | check arm 2 sonnet–sonnet #7 m11 | claude-haiku-5-5 | 1746 | 92 | $0.00022 | 1 |  |
| 2026-10-24 06:26 | 2976 | tags 1 arm 2 sonnet–sonnet #7 m11–11 | claude-haiku-5-5 | 2342 | 77 | $0.00027 | 1.1 |  |
| 2026-10-24 06:26 | 2977 | tags 1 arm 2 sonnet–sonnet #7 m1–10 | claude-haiku-5-5 | 7600 | 680 | $0.00110 | 2.3 |  |
| 2026-10-24 06:26 | 2978 | tags 2 arm 2 sonnet–sonnet #7 m1–10 | claude-haiku-5-5 | 7600 | 680 | $0.00110 | 2.4 |  |
| 2026-10-24 06:26 | 2979 | tags 2 arm 2 sonnet–sonnet #7 m11–11 | claude-haiku-5-5 | 2342 | 77 | $0.00027 | 0.6 |  |
| 2026-10-24 06:26 | 2980 | subject arm 2 opus–opus #7 A m1 | claude-opus-5-5 | 59 | 370 | $0.00764 | 5.4 |  |
| 2026-10-24 06:26 | 2981 | check arm 2 opus–opus #7 m1 | claude-haiku-5-5 | 658 | 63 | $0.00010 | 0.7 |  |
| 2026-10-24 06:26 | 2982 | subject arm 1 fable–fable #7 A m9 | claude-fable-5-1 | 4 | 2440 | $0.14465 | 38.1 |  |
| 2026-10-24 06:26 | 2983 | tags referee arm 2 sonnet–sonnet #7 m1–10 | claude-opus-5-5 | 7600 | 833 | $0.04706 | 7.2 |  |
| 2026-10-24 06:26 | 2984 | check arm 1 fable–fable #7 m9 | claude-haiku-5-5 | 1895 | 64 | $0.00022 | 0.8 |  |
| 2026-10-24 06:26 | 2985 | subject arm 2 fable–fable #7 B m4 | claude-fable-5-1 | 4 | 1991 | $0.12084 | 36.3 |  |
| 2026-10-24 06:26 | 2986 | check arm 2 fable–fable #7 m4 | claude-haiku-5-5 | 2134 | 88 | $0.00026 | 0.9 |  |
| 2026-10-24 06:26 | 2987 | subject arm 2 opus–opus #7 B m2 | claude-opus-5-5 | 389 | 1165 | $0.02486 | 16.8 |  |
| 2026-10-24 06:26 | 2988 | check arm 2 opus–opus #7 m2 | claude-haiku-5-5 | 1410 | 62 | $0.00017 | 0.9 |  |
| 2026-10-24 06:26 | 2989 | subject arm 2 fable–fable #7 A m5 | claude-fable-5-1 | 4 | 1538 | $0.10003 | 29.2 |  |
| 2026-10-24 06:26 | 2990 | check arm 2 fable–fable #7 m5 | claude-haiku-5-5 | 2367 | 84 | $0.00028 | 1.2 |  |
| 2026-10-24 06:26 | 2991 | subject arm 1 fable–fable #7 B m10 | claude-fable-5-1 | 4 | 2442 | $0.14372 | 36.8 |  |
| 2026-10-24 06:26 | 2992 | subject arm 2 opus–opus #7 A m3 | claude-opus-5-5 | 4 | 1806 | $0.04189 | 22.5 |  |
| 2026-10-24 06:26 | 2993 | check arm 1 fable–fable #7 m10 | claude-haiku-5-5 | 2458 | 70 | $0.00028 | 0.8 |  |
| 2026-10-24 06:26 | 2994 | check arm 2 opus–opus #7 m3 | claude-haiku-5-5 | 2061 | 70 | $0.00024 | 1.2 |  |
| 2026-10-24 06:26 | 2995 | subject arm 2 opus–opus #7 B m4 | claude-opus-5-5 | 4 | 1855 | $0.04777 | 23.3 |  |
| 2026-10-24 06:26 | 2996 | check arm 2 opus–opus #7 m4 | claude-haiku-5-5 | 2386 | 77 | $0.00028 | 0.9 |  |
| 2026-10-24 06:26 | 2997 | subject arm 2 fable–fable #7 B m6 | claude-fable-5-1 | 4 | 1576 | $0.10504 | 33 |  |
| 2026-10-24 06:26 | 2998 | check arm 2 fable–fable #7 m6 | claude-haiku-5-5 | 2252 | 91 | $0.00027 | 1 |  |
| 2026-10-24 06:26 | 2999 | subject arm 2 opus–opus #7 A m5 | claude-opus-5-5 | 4 | 2258 | $0.05576 | 26.2 |  |
| 2026-10-24 06:26 | 3000 | subject arm 2 fable–fable #7 A m7 | claude-fable-5-1 | 4 | 1116 | $0.08086 | 19.9 |  |
| 2026-10-24 06:26 | 3001 | check arm 2 opus–opus #7 m5 | claude-haiku-5-5 | 2586 | 65 | $0.00029 | 0.8 |  |
| 2026-10-24 06:26 | 3002 | check arm 2 fable–fable #7 m7 | claude-haiku-5-5 | 1850 | 88 | $0.00023 | 1 |  |
| 2026-10-24 06:26 | 3003 | tags 2 arm 2 fable–fable #7 m1–7 | claude-haiku-5-5 | 6717 | 479 | $0.00091 | 1.7 |  |
| 2026-10-24 06:26 | 3004 | tags 1 arm 2 fable–fable #7 m1–7 | claude-haiku-5-5 | 6717 | 479 | $0.00091 | 1.7 |  |
| 2026-10-24 06:26 | 3005 | subject arm 1 fable–fable #7 A m11 | claude-fable-5-1 | 4 | 4077 | $0.23263 | 60.9 |  |
| 2026-10-24 06:26 | 3006 | check arm 1 fable–fable #7 m11 | claude-haiku-5-5 | 2910 | 73 | $0.00033 | 0.8 |  |
| 2026-10-24 06:26 | 3007 | subject arm 1 opus–opus #7 A m1 | claude-opus-5-5 | 40 | 552 | $0.01120 | 7.8 |  |
| 2026-10-24 06:26 | 3008 | check arm 1 opus–opus #7 m1 | claude-haiku-5-5 | 816 | 63 | $0.00011 | 1.2 |  |
| 2026-10-24 06:26 | 3009 | subject arm 2 opus–opus #7 B m6 | claude-opus-5-5 | 4 | 2132 | $0.05444 | 27.7 |  |
| 2026-10-24 06:26 | 3010 | check arm 2 opus–opus #7 m6 | claude-haiku-5-5 | 2823 | 77 | $0.00032 | 1.2 |  |
| 2026-10-24 06:26 | 3011 | subject arm 1 opus–opus #7 B m2 | claude-opus-5-5 | 4 | 1449 | $0.03162 | 17.9 |  |
| 2026-10-24 06:26 | 3012 | check arm 1 opus–opus #7 m2 | claude-haiku-5-5 | 1620 | 75 | $0.00020 | 0.9 |  |
| 2026-10-24 06:26 | 3013 | subject arm 2 opus–opus #7 A m7 | claude-opus-5-5 | 4 | 1751 | $0.04822 | 22.7 |  |
| 2026-10-24 06:26 | 3014 | check arm 2 opus–opus #7 m7 | claude-haiku-5-5 | 2748 | 79 | $0.00031 | 1.2 |  |
| 2026-10-24 06:26 | 3015 | subject arm 1 fable–fable #7 B m12 | claude-fable-5-1 | 4 | 3770 | $0.22320 | 53.9 |  |
| 2026-10-24 06:26 | 3016 | subject arm 1 opus–opus #7 A m3 | claude-opus-5-5 | 4 | 2527 | $0.05726 | 30.5 |  |
| 2026-10-24 06:26 | 3017 | check arm 1 fable–fable #7 m12 | claude-haiku-5-5 | 3029 | 67 | $0.00034 | 0.8 |  |
| 2026-10-24 06:26 | 3018 | check arm 1 opus–opus #7 m3 | claude-haiku-5-5 | 2655 | 78 | $0.00030 | 1.7 |  |
| 2026-10-24 06:26 | 3019 | subject arm 2 opus–opus #7 B m8 | claude-opus-5-5 | 4 | 1956 | $0.05218 | 23.7 |  |
| 2026-10-24 06:26 | 3020 | check arm 2 opus–opus #7 m8 | claude-haiku-5-5 | 2655 | 78 | $0.00030 | 1 |  |
| 2026-10-24 06:26 | 3021 | subject arm 2 opus–opus #7 A m9 | claude-opus-5-5 | 4 | 1869 | $0.05024 | 23 |  |
| 2026-10-24 06:26 | 3022 | check arm 2 opus–opus #7 m9 | claude-haiku-5-5 | 2682 | 75 | $0.00031 | 1.9 |  |
| 2026-10-24 06:26 | 3023 | subject arm 1 opus–opus #7 B m4 | claude-opus-5-5 | 4 | 4130 | $0.09442 | 50.8 |  |
| 2026-10-24 06:26 | 3024 | check arm 1 opus–opus #7 m4 | claude-haiku-5-5 | 3380 | 76 | $0.00038 | 1.1 |  |
| 2026-10-24 06:26 | 3025 | subject arm 2 opus–opus #7 B m10 | claude-opus-5-5 | 4 | 956 | $0.03234 | 13 |  |
| 2026-10-24 06:26 | 3026 | check arm 2 opus–opus #7 m10 | claude-haiku-5-5 | 1963 | 71 | $0.00023 | 1.2 |  |
| 2026-10-24 06:26 | 3027 | subject arm 2 opus–opus #7 A m11 | claude-opus-5-5 | 4 | 202 | $0.01391 | 3.3 |  |
| 2026-10-24 06:26 | 3028 | tags 1 arm 2 opus–opus #7 m1–10 | claude-haiku-5-5 | 10691 | 680 | $0.00141 | 2.9 |  |
| 2026-10-24 06:26 | 3029 | tags 2 arm 2 opus–opus #7 m1–10 | claude-haiku-5-5 | 10691 | 680 | $0.00141 | 2.9 |  |
| 2026-10-24 06:26 | 3030 | subject arm 1 opus–opus #8 A m1 | claude-opus-5-5 | 40 | 625 | $0.01266 | 8.3 |  |
| 2026-10-24 06:26 | 3031 | check arm 1 opus–opus #8 m1 | claude-haiku-5-5 | 897 | 68 | $0.00012 | 0.7 |  |
| 2026-10-24 06:26 | 3032 | subject arm 1 opus–opus #8 B m2 | claude-opus-5-5 | 4 | 1077 | $0.02458 | 13.9 |  |
| 2026-10-24 06:26 | 3033 | check arm 1 opus–opus #8 m2 | claude-haiku-5-5 | 1746 | 67 | $0.00021 | 0.7 |  |
| 2026-10-24 06:26 | 3034 | subject arm 1 opus–opus #7 A m5 | claude-opus-5-5 | 4 | 4838 | $0.11237 | 50.4 |  |
| 2026-10-24 06:26 | 3035 | check arm 1 opus–opus #7 m5 | claude-haiku-5-5 | 3753 | 82 | $0.00042 | 1 |  |
| 2026-10-24 06:26 | 3036 | subject arm 1 fable–fable #7 A m13 | claude-fable-5-1 | 4 | 8000 | $0.43645 | 111.5 |  |
| 2026-10-24 06:26 | 3037 | check arm 1 fable–fable #7 m13 | claude-haiku-5-5 | 2736 | 63 | $0.00031 | 0.9 |  |
| 2026-10-24 06:26 | 3038 | subject arm 1 opus–opus #8 A m3 | claude-opus-5-5 | 4 | 2232 | $0.05199 | 27.7 |  |
| 2026-10-24 06:26 | 3039 | check arm 1 opus–opus #8 m3 | claude-haiku-5-5 | 2637 | 93 | $0.00031 | 0.8 |  |
| 2026-10-24 06:26 | 3040 | subject arm 1 opus–opus #7 B m6 | claude-opus-5-5 | 4 | 2995 | $0.07768 | 34.3 |  |
| 2026-10-24 06:26 | 3041 | check arm 1 opus–opus #7 m6 | claude-haiku-5-5 | 3672 | 82 | $0.00041 | 1 |  |
| 2026-10-24 06:26 | 3042 | subject arm 1 opus–opus #8 B m4 | claude-opus-5-5 | 4 | 2385 | $0.05945 | 34.4 |  |
| 2026-10-24 06:26 | 3043 | check arm 1 opus–opus #8 m4 | claude-haiku-5-5 | 3224 | 72 | $0.00036 | 1.2 |  |
| 2026-10-24 06:26 | 3044 | subject arm 1 opus–opus #8 A m5 | claude-opus-5-5 | 4 | 1713 | $0.04911 | 23 |  |
| 2026-10-24 06:26 | 3045 | check arm 1 opus–opus #8 m5 | claude-haiku-5-5 | 2722 | 66 | $0.00031 | 1.2 |  |
| 2026-10-24 06:26 | 3046 | subject arm 1 opus–opus #7 A m7 | claude-opus-5-5 | 4 | 4466 | $0.10700 | 51.5 |  |
| 2026-10-24 06:26 | 3047 | check arm 1 opus–opus #7 m7 | claude-haiku-5-5 | 3499 | 82 | $0.00039 | 1.1 |  |
| 2026-10-24 06:26 | 3048 | subject arm 1 fable–fable #7 B m14 | claude-fable-5-1 | 4 | 8000 | $0.43317 | 91.8 |  |
| 2026-10-24 06:26 | 3049 | check arm 1 fable–fable #7 m14 | claude-haiku-5-5 | 1913 | 63 | $0.00022 | 0.9 |  |
| 2026-10-24 06:26 | 3050 | subject arm 1 opus–opus #8 B m6 | claude-opus-5-5 | 4 | 2273 | $0.05810 | 28.8 |  |
| 2026-10-24 06:26 | 3051 | check arm 1 opus–opus #8 m6 | claude-haiku-5-5 | 2338 | 85 | $0.00028 | 1.3 |  |
| 2026-10-24 06:26 | 3052 | subject arm 1 opus–opus #7 B m8 | claude-opus-5-5 | 4 | 3326 | $0.08372 | 41.2 |  |
| 2026-10-24 06:26 | 3053 | check arm 1 opus–opus #7 m8 | claude-haiku-5-5 | 3381 | 78 | $0.00038 | 0.8 |  |
| 2026-10-24 06:26 | 3054 | subject arm 1 opus–opus #8 A m7 | claude-opus-5-5 | 4 | 2200 | $0.05501 | 29.9 |  |
| 2026-10-24 06:26 | 3055 | check arm 1 opus–opus #8 m7 | claude-haiku-5-5 | 2774 | 69 | $0.00031 | 0.9 |  |
| 2026-10-24 06:26 | 3056 | subject arm 1 opus–opus #7 A m9 | claude-opus-5-5 | 4 | 2678 | $0.07046 | 34.3 |  |
| 2026-10-24 06:26 | 3057 | check arm 1 opus–opus #7 m9 | claude-haiku-5-5 | 2883 | 88 | $0.00033 | 0.9 |  |
| 2026-10-24 06:26 | 3058 | subject arm 1 opus–opus #8 B m8 | claude-opus-5-5 | 4 | 2249 | $0.05836 | 28.3 |  |
| 2026-10-24 06:26 | 3059 | check arm 1 opus–opus #8 m8 | claude-haiku-5-5 | 2978 | 99 | $0.00035 | 1 |  |
| 2026-10-24 06:26 | 3060 | subject arm 1 fable–fable #7 A m15 | claude-fable-5-1 | 4 | 8000 | $0.42318 | 92.3 |  |
| 2026-10-24 06:26 | 3061 | check arm 1 fable–fable #7 m15 | claude-haiku-5-5 | 983 | 69 | $0.00013 | 0.8 |  |
| 2026-10-24 06:26 | 3062 | subject arm 1 opus–opus #8 A m9 | claude-opus-5-5 | 4 | 1997 | $0.05455 | 21.8 |  |
| 2026-10-24 06:26 | 3063 | check arm 1 opus–opus #8 m9 | claude-haiku-5-5 | 2502 | 83 | $0.00029 | 2.3 |  |
| 2026-10-24 06:26 | 3064 | subject arm 1 opus–opus #7 B m10 | claude-opus-5-5 | 4 | 2839 | $0.07153 | 35.9 |  |
| 2026-10-24 06:26 | 3065 | check arm 1 opus–opus #7 m10 | claude-haiku-5-5 | 2883 | 80 | $0.00033 | 0.8 |  |
| 2026-10-24 06:26 | 3066 | subject arm 1 opus–opus #8 B m10 | claude-opus-5-5 | 4 | 815 | $0.02881 | 11.2 |  |
| 2026-10-24 06:26 | 3067 | check arm 1 opus–opus #8 m10 | claude-haiku-5-5 | 1683 | 74 | $0.00021 | 0.9 |  |
| 2026-10-24 06:26 | 3068 | subject arm 1 opus–opus #8 A m11 | claude-opus-5-5 | 4 | 482 | $0.01831 | 6.7 |  |
| 2026-10-24 06:26 | 3069 | check arm 1 opus–opus #8 m11 | claude-haiku-5-5 | 994 | 89 | $0.00014 | 1.3 |  |
| 2026-10-24 06:26 | 3070 | subject arm 1 opus–opus #8 B m12 | claude-opus-5-5 | 4 | 609 | $0.01759 | 8.4 |  |
| 2026-10-24 06:26 | 3071 | check arm 1 opus–opus #8 m12 | claude-haiku-5-5 | 763 | 80 | $0.00012 | 1.3 |  |
| 2026-10-24 06:26 | 3072 | subject arm 1 opus–opus #8 A m13 | claude-opus-5-5 | 4 | 287 | $0.01008 | 4.6 |  |
| 2026-10-24 06:26 | 3073 | check arm 1 opus–opus #8 m13 | claude-haiku-5-5 | 618 | 68 | $0.00010 | 0.8 |  |
| 2026-10-24 06:26 | 3074 | subject arm 1 opus–opus #7 A m11 | claude-opus-5-5 | 4 | 2661 | $0.06824 | 33.1 |  |
| 2026-10-24 06:26 | 3075 | subject arm 1 opus–opus #8 B m14 | claude-opus-5-5 | 4 | 81 | $0.00528 | 1.7 |  |
| 2026-10-24 06:26 | 3076 | check arm 1 opus–opus #7 m11 | claude-haiku-5-5 | 2941 | 69 | $0.00033 | 1 |  |
| 2026-10-24 06:26 | 3077 | check arm 1 opus–opus #8 m14 | claude-haiku-5-5 | 410 | 83 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 3078 | subject arm 1 opus–opus #8 A m15 | claude-opus-5-5 | 4 | 319 | $0.00905 | 4.6 |  |
| 2026-10-24 06:26 | 3079 | check arm 1 opus–opus #8 m15 | claude-haiku-5-5 | 374 | 74 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 3080 | subject arm 1 fable–fable #7 B m16 | claude-fable-5-1 | 4 | 4771 | $0.25042 | 59.2 |  |
| 2026-10-24 06:26 | 3081 | check arm 1 fable–fable #7 m16 | claude-haiku-5-5 | 1416 | 81 | $0.00018 | 0.9 |  |
| 2026-10-24 06:26 | 3082 | subject arm 1 opus–opus #8 B m16 | claude-opus-5-5 | 4 | 146 | $0.00542 | 2.6 |  |
| 2026-10-24 06:26 | 3083 | check arm 1 opus–opus #8 m16 | claude-haiku-5-5 | 373 | 67 | $0.00007 | 1.8 |  |
| 2026-10-24 06:26 | 3084 | check referee arm 1 fable–fable #7 m16 | claude-opus-5-5 | 1416 | 59 | $0.00684 | 1.7 |  |
| 2026-10-24 06:26 | 3085 | subject arm 1 opus–opus #8 A m17 | claude-opus-5-5 | 4 | 145 | $0.00540 | 2.9 |  |
| 2026-10-24 06:26 | 3086 | check arm 1 opus–opus #8 m17 | claude-haiku-5-5 | 331 | 60 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 3087 | subject arm 1 opus–opus #8 B m18 | claude-opus-5-5 | 4 | 204 | $0.00638 | 3.3 |  |
| 2026-10-24 06:26 | 3088 | check arm 1 opus–opus #8 m18 | claude-haiku-5-5 | 360 | 87 | $0.00008 | 0.9 |  |
| 2026-10-24 06:26 | 3089 | subject arm 1 opus–opus #8 A m19 | claude-opus-5-5 | 4 | 130 | $0.00505 | 2.3 |  |
| 2026-10-24 06:26 | 3090 | check arm 1 opus–opus #8 m19 | claude-haiku-5-5 | 367 | 59 | $0.00007 | 0.6 |  |
| 2026-10-24 06:26 | 3091 | subject arm 1 opus–opus #7 B m12 | claude-opus-5-5 | 4 | 2482 | $0.06520 | 31.2 |  |
| 2026-10-24 06:26 | 3092 | check arm 1 opus–opus #7 m12 | claude-haiku-5-5 | 3006 | 79 | $0.00034 | 1 |  |
| 2026-10-24 06:26 | 3093 | subject arm 1 opus–opus #8 B m20 | claude-opus-5-5 | 4 | 138 | $0.00524 | 3.2 |  |
| 2026-10-24 06:26 | 3094 | check arm 1 opus–opus #8 m20 | claude-haiku-5-5 | 353 | 85 | $0.00008 | 1.9 |  |
| 2026-10-24 06:26 | 3095 | subject arm 1 fable–fable #7 A m17 | claude-fable-5-1 | 4 | 1881 | $0.11142 | 26 |  |
| 2026-10-24 06:26 | 3096 | check arm 1 fable–fable #7 m17 | claude-haiku-5-5 | 1738 | 91 | $0.00022 | 0.7 |  |
| 2026-10-24 06:26 | 3097 | subject arm 1 opus–opus #8 A m21 | claude-opus-5-5 | 4 | 207 | $0.00656 | 3.2 |  |
| 2026-10-24 06:26 | 3098 | check arm 1 opus–opus #8 m21 | claude-haiku-5-5 | 352 | 79 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 3099 | check referee arm 1 fable–fable #7 m17 | claude-opus-5-5 | 1738 | 51 | $0.00797 | 1.8 |  |
| 2026-10-24 06:26 | 3100 | subject arm 1 opus–opus #8 B m22 | claude-opus-5-5 | 4 | 160 | $0.00562 | 3.6 |  |
| 2026-10-24 06:26 | 3101 | check arm 1 opus–opus #8 m22 | claude-haiku-5-5 | 339 | 75 | $0.00007 | 1.1 |  |
| 2026-10-24 06:26 | 3102 | subject arm 1 opus–opus #8 A m23 | claude-opus-5-5 | 4 | 208 | $0.00652 | 3.5 |  |
| 2026-10-24 06:26 | 3103 | check arm 1 opus–opus #8 m23 | claude-haiku-5-5 | 328 | 51 | $0.00006 | 1.1 |  |
| 2026-10-24 06:26 | 3104 | subject arm 1 fable–fable #7 B m18 | claude-fable-5-1 | 4 | 594 | $0.05117 | 11.6 |  |
| 2026-10-24 06:26 | 3105 | check arm 1 fable–fable #7 m18 | claude-haiku-5-5 | 1468 | 83 | $0.00019 | 1.5 |  |
| 2026-10-24 06:26 | 3106 | subject arm 1 opus–opus #8 B m24 | claude-opus-5-5 | 4 | 179 | $0.00589 | 3.4 |  |
| 2026-10-24 06:26 | 3107 | check arm 1 opus–opus #8 m24 | claude-haiku-5-5 | 342 | 66 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 3108 | subject arm 1 opus–opus #7 A m13 | claude-opus-5-5 | 4 | 2516 | $0.06647 | 31.5 |  |
| 2026-10-24 06:26 | 3109 | subject arm 1 opus–opus #8 A m25 | claude-opus-5-5 | 4 | 159 | $0.00556 | 3 |  |
| 2026-10-24 06:26 | 3110 | check arm 1 opus–opus #7 m13 | claude-haiku-5-5 | 2941 | 72 | $0.00033 | 0.7 |  |
| 2026-10-24 06:26 | 3111 | check arm 1 opus–opus #8 m25 | claude-haiku-5-5 | 360 | 53 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 3112 | subject arm 1 fable–fable #7 A m19 | claude-fable-5-1 | 4 | 531 | $0.04485 | 9.4 |  |
| 2026-10-24 06:26 | 3113 | check arm 1 fable–fable #7 m19 | claude-haiku-5-5 | 1200 | 76 | $0.00016 | 1.1 |  |
| 2026-10-24 06:26 | 3114 | subject arm 1 opus–opus #8 B m26 | claude-opus-5-5 | 4 | 162 | $0.00571 | 3.1 |  |
| 2026-10-24 06:26 | 3115 | check arm 1 opus–opus #8 m26 | claude-haiku-5-5 | 368 | 58 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 3116 | subject arm 1 fable–fable #7 B m20 | claude-fable-5-1 | 4 | 122 | $0.02120 | 3.1 |  |
| 2026-10-24 06:26 | 3117 | check arm 1 fable–fable #7 m20 | claude-haiku-5-5 | 747 | 69 | $0.00011 | 0.8 |  |
| 2026-10-24 06:26 | 3118 | subject arm 1 fable–fable #7 A m21 | claude-fable-5-1 | 4 | 8 | $0.00997 | 0.9 |  |
| 2026-10-24 06:26 | 3119 | subject arm 1 opus–opus #8 A m27 | claude-opus-5-5 | 4 | 218 | $0.00687 | 3.9 |  |
| 2026-10-24 06:26 | 3120 | check arm 1 fable–fable #7 m21 | claude-haiku-5-5 | 402 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 3121 | check arm 1 opus–opus #8 m27 | claude-haiku-5-5 | 393 | 293 | $0.00019 | 2 |  |
| 2026-10-24 06:26 | 3122 | subject arm 1 fable–fable #7 B m22 | claude-fable-5-1 | 4 | 8 | $0.00575 | 1.2 |  |
| 2026-10-24 06:26 | 3123 | check arm 1 fable–fable #7 m22 | claude-haiku-5-5 | 331 | 49 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 3124 | subject arm 1 opus–opus #7 B m14 | claude-opus-5-5 | 4 | 1246 | $0.04100 | 16.6 |  |
| 2026-10-24 06:26 | 3125 | subject arm 1 opus–opus #8 B m28 | claude-opus-5-5 | 4 | 224 | $0.00712 | 4.2 |  |
| 2026-10-24 06:26 | 3126 | check arm 1 opus–opus #7 m14 | claude-haiku-5-5 | 2399 | 77 | $0.00028 | 1.3 |  |
| 2026-10-24 06:26 | 3127 | subject arm 1 fable–fable #7 A m23 | claude-fable-5-1 | 4 | 29 | $0.00593 | 1.1 |  |
| 2026-10-24 06:26 | 3128 | check arm 1 opus–opus #8 m28 | claude-haiku-5-5 | 394 | 56 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 3129 | check arm 1 fable–fable #7 m23 | claude-haiku-5-5 | 352 | 66 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 3130 | subject arm 1 opus–opus #8 A m29 | claude-opus-5-5 | 4 | 153 | $0.00571 | 3.4 |  |
| 2026-10-24 06:26 | 3131 | check arm 1 opus–opus #8 m29 | claude-haiku-5-5 | 357 | 69 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 3132 | subject arm 1 fable–fable #7 B m24 | claude-fable-5-1 | 4 | 210 | $0.01524 | 5.2 |  |
| 2026-10-24 06:26 | 3133 | check arm 1 fable–fable #7 m24 | claude-haiku-5-5 | 372 | 64 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 3134 | subject arm 1 opus–opus #7 A m15 | claude-opus-5-5 | 4 | 534 | $0.02433 | 8.2 |  |
| 2026-10-24 06:26 | 3135 | check arm 1 opus–opus #7 m15 | claude-haiku-5-5 | 1573 | 82 | $0.00020 | 0.8 |  |
| 2026-10-24 06:26 | 3136 | subject arm 1 opus–opus #8 B m30 | claude-opus-5-5 | 4 | 137 | $0.00522 | 2.8 |  |
| 2026-10-24 06:26 | 3137 | check arm 1 opus–opus #8 m30 | claude-haiku-5-5 | 327 | 45 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 3138 | subject arm 1 fable–fable #7 A m25 | claude-fable-5-1 | 4 | 15 | $0.00575 | 1.3 |  |
| 2026-10-24 06:26 | 3139 | check arm 1 fable–fable #7 m25 | claude-haiku-5-5 | 358 | 60 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 3140 | subject arm 1 opus–opus #8 A m31 | claude-opus-5-5 | 4 | 178 | $0.00590 | 2.9 |  |
| 2026-10-24 06:26 | 3141 | subject arm 1 fable–fable #7 B m26 | claude-fable-5-1 | 4 | 108 | $0.01023 | 2.4 |  |
| 2026-10-24 06:26 | 3142 | check arm 1 opus–opus #8 m31 | claude-haiku-5-5 | 359 | 66 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 3143 | check arm 1 fable–fable #7 m26 | claude-haiku-5-5 | 337 | 61 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 3144 | subject arm 1 opus–opus #7 B m16 | claude-opus-5-5 | 4 | 445 | $0.01867 | 8.5 |  |
| 2026-10-24 06:26 | 3145 | check arm 1 opus–opus #7 m16 | claude-haiku-5-5 | 1045 | 72 | $0.00014 | 0.7 |  |
| 2026-10-24 06:26 | 3146 | subject arm 1 opus–opus #8 B m32 | claude-opus-5-5 | 4 | 140 | $0.00530 | 2.9 |  |
| 2026-10-24 06:26 | 3147 | subject arm 1 fable–fable #7 A m27 | claude-fable-5-1 | 4 | 156 | $0.01237 | 3.1 |  |
| 2026-10-24 06:26 | 3148 | check arm 1 opus–opus #8 m32 | claude-haiku-5-5 | 426 | 57 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 3149 | check arm 1 fable–fable #7 m27 | claude-haiku-5-5 | 329 | 44 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 3150 | subject arm 1 opus–opus #8 A m33 | claude-opus-5-5 | 4 | 123 | $0.00529 | 2.1 |  |
| 2026-10-24 06:26 | 3151 | check arm 1 opus–opus #8 m33 | claude-haiku-5-5 | 455 | 72 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 3152 | subject arm 1 opus–opus #7 A m17 | claude-opus-5-5 | 4 | 343 | $0.01416 | 5.8 |  |
| 2026-10-24 06:26 | 3153 | check arm 1 opus–opus #7 m17 | claude-haiku-5-5 | 875 | 71 | $0.00012 | 0.8 |  |
| 2026-10-24 06:26 | 3154 | subject arm 1 fable–fable #7 B m28 | claude-fable-5-1 | 4 | 223 | $0.01563 | 4 |  |
| 2026-10-24 06:26 | 3155 | check arm 1 fable–fable #7 m28 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 3156 | subject arm 1 opus–opus #8 B m34 | claude-opus-5-5 | 4 | 72 | $0.00443 | 2.2 |  |
| 2026-10-24 06:26 | 3157 | check arm 1 opus–opus #8 m34 | claude-haiku-5-5 | 403 | 50 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 3158 | subject arm 1 fable–fable #7 A m29 | claude-fable-5-1 | 4 | 85 | $0.00873 | 1.6 |  |
| 2026-10-24 06:26 | 3159 | check arm 1 fable–fable #7 m29 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 3160 | subject arm 1 opus–opus #7 B m18 | claude-opus-5-5 | 4 | 308 | $0.01269 | 5.3 |  |
| 2026-10-24 06:26 | 3161 | subject arm 1 opus–opus #8 A m35 | claude-opus-5-5 | 4 | 73 | $0.00420 | 1.6 |  |
| 2026-10-24 06:26 | 3162 | check arm 1 opus–opus #7 m18 | claude-haiku-5-5 | 721 | 69 | $0.00011 | 0.8 |  |
| 2026-10-24 06:26 | 3163 | check arm 1 opus–opus #8 m35 | claude-haiku-5-5 | 343 | 52 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 3164 | subject arm 1 opus–opus #7 A m19 | claude-opus-5-5 | 4 | 79 | $0.00741 | 2.2 |  |
| 2026-10-24 06:26 | 3165 | subject arm 1 fable–fable #7 B m30 | claude-fable-5-1 | 4 | 220 | $0.01548 | 4.7 |  |
| 2026-10-24 06:26 | 3166 | subject arm 1 opus–opus #8 B m36 | claude-opus-5-5 | 4 | 78 | $0.00401 | 2.2 |  |
| 2026-10-24 06:26 | 3167 | check arm 1 fable–fable #7 m30 | claude-haiku-5-5 | 388 | 60 | $0.00007 | 1.1 |  |
| 2026-10-24 06:26 | 3168 | check arm 1 opus–opus #7 m19 | claude-haiku-5-5 | 536 | 59 | $0.00008 | 1.5 |  |
| 2026-10-24 06:26 | 3169 | check arm 1 opus–opus #8 m36 | claude-haiku-5-5 | 330 | 51 | $0.00006 | 1.6 |  |
| 2026-10-24 06:26 | 3170 | subject arm 1 fable–fable #7 A m31 | claude-fable-5-1 | 4 | 15 | $0.00597 | 1 |  |
| 2026-10-24 06:26 | 3171 | subject arm 1 opus–opus #8 A m37 | claude-opus-5-5 | 4 | 50 | $0.00339 | 1.5 |  |
| 2026-10-24 06:26 | 3172 | check arm 1 fable–fable #7 m31 | claude-haiku-5-5 | 396 | 50 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 3173 | check arm 1 opus–opus #8 m37 | claude-haiku-5-5 | 325 | 47 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 3174 | subject arm 1 opus–opus #7 B m20 | claude-opus-5-5 | 4 | 76 | $0.00647 | 3.9 |  |
| 2026-10-24 06:26 | 3175 | check arm 1 opus–opus #7 m20 | claude-haiku-5-5 | 394 | 57 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 3176 | subject arm 1 opus–opus #8 B m38 | claude-opus-5-5 | 4 | 114 | $0.00465 | 2.6 |  |
| 2026-10-24 06:26 | 3177 | check arm 1 opus–opus #8 m38 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 3178 | subject arm 1 fable–fable #7 B m32 | claude-fable-5-1 | 4 | 224 | $0.01652 | 4.7 |  |
| 2026-10-24 06:26 | 3179 | subject arm 1 opus–opus #7 A m21 | claude-opus-5-5 | 4 | 101 | $0.00629 | 2.6 |  |
| 2026-10-24 06:26 | 3180 | check arm 1 fable–fable #7 m32 | claude-haiku-5-5 | 340 | 53 | $0.00006 | 1.1 |  |
| 2026-10-24 06:26 | 3181 | check arm 1 opus–opus #7 m21 | claude-haiku-5-5 | 396 | 68 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 3182 | subject arm 1 fable–fable #7 A m33 | claude-fable-5-1 | 4 | 25 | $0.00589 | 1 |  |
| 2026-10-24 06:26 | 3183 | check arm 1 fable–fable #7 m33 | claude-haiku-5-5 | 350 | 62 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 3184 | subject arm 1 opus–opus #8 A m39 | claude-opus-5-5 | 4 | 245 | $0.00727 | 3.9 |  |
| 2026-10-24 06:26 | 3185 | check arm 1 opus–opus #8 m39 | claude-haiku-5-5 | 380 | 63 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 3186 | subject arm 1 opus–opus #7 B m22 | claude-opus-5-5 | 4 | 42 | $0.00513 | 3 |  |
| 2026-10-24 06:26 | 3187 | check arm 1 opus–opus #7 m22 | claude-haiku-5-5 | 362 | 53 | $0.00006 | 1.5 |  |
| 2026-10-24 06:26 | 3188 | subject arm 1 opus–opus #8 B m40 | claude-opus-5-5 | 4 | 88 | $0.00441 | 2.7 |  |
| 2026-10-24 06:26 | 3189 | check arm 1 opus–opus #8 m40 | claude-haiku-5-5 | 411 | 61 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 3190 | subject arm 1 fable–fable #7 B m34 | claude-fable-5-1 | 4 | 233 | $0.01642 | 5 |  |
| 2026-10-24 06:26 | 3191 | check arm 1 fable–fable #7 m34 | claude-haiku-5-5 | 362 | 56 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 3192 | subject arm 1 opus–opus #7 A m23 | claude-opus-5-5 | 4 | 149 | $0.00711 | 4 |  |
| 2026-10-24 06:26 | 3193 | check arm 1 opus–opus #7 m23 | claude-haiku-5-5 | 364 | 62 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 3194 | subject arm 1 opus–opus #8 A m41 | claude-opus-5-5 | 4 | 49 | $0.00378 | 1.5 |  |
| 2026-10-24 06:26 | 3195 | check arm 1 opus–opus #8 m41 | claude-haiku-5-5 | 356 | 60 | $0.00007 | 1 |  |
| 2026-10-24 06:26 | 3196 | subject arm 1 fable–fable #7 A m35 | claude-fable-5-1 | 4 | 113 | $0.01057 | 2.1 |  |
| 2026-10-24 06:26 | 3197 | check arm 1 fable–fable #7 m35 | claude-haiku-5-5 | 345 | 54 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 3198 | subject arm 1 opus–opus #7 B m24 | claude-opus-5-5 | 4 | 115 | $0.00645 | 2.9 |  |
| 2026-10-24 06:26 | 3199 | subject arm 1 opus–opus #8 B m42 | claude-opus-5-5 | 4 | 5 | $0.00264 | 1.4 |  |
| 2026-10-24 06:26 | 3200 | check arm 1 opus–opus #7 m24 | claude-haiku-5-5 | 377 | 59 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 3201 | check arm 1 opus–opus #8 m42 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 3202 | subject arm 1 opus–opus #8 A m43 | claude-opus-5-5 | 4 | 42 | $0.00323 | 1.3 |  |
| 2026-10-24 06:26 | 3203 | check arm 1 opus–opus #8 m43 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 3204 | subject arm 1 opus–opus #7 A m25 | claude-opus-5-5 | 4 | 115 | $0.00651 | 2.9 |  |
| 2026-10-24 06:26 | 3205 | check arm 1 opus–opus #7 m25 | claude-haiku-5-5 | 349 | 62 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 3206 | subject arm 1 fable–fable #7 B m36 | claude-fable-5-1 | 4 | 282 | $0.01881 | 6.3 |  |
| 2026-10-24 06:26 | 3207 | check arm 1 fable–fable #7 m36 | claude-haiku-5-5 | 364 | 203 | $0.00014 | 1.5 |  |
| 2026-10-24 06:26 | 3208 | subject arm 1 opus–opus #8 B m44 | claude-opus-5-5 | 4 | 5 | $0.00249 | 2.2 |  |
| 2026-10-24 06:26 | 3209 | check arm 1 opus–opus #8 m44 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 3210 | subject arm 1 opus–opus #7 B m26 | claude-opus-5-5 | 4 | 210 | $0.00828 | 3.4 |  |
| 2026-10-24 06:26 | 3211 | check arm 1 opus–opus #7 m26 | claude-haiku-5-5 | 340 | 52 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 3212 | subject arm 1 fable–fable #7 A m37 | claude-fable-5-1 | 4 | 185 | $0.01421 | 3.9 |  |
| 2026-10-24 06:26 | 3213 | check arm 1 fable–fable #7 m37 | claude-haiku-5-5 | 379 | 64 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 3214 | subject arm 1 opus–opus #8 A m45 | claude-opus-5-5 | 4 | 5 | $0.00249 | 1.6 |  |
| 2026-10-24 06:26 | 3215 | check arm 1 opus–opus #8 m45 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 3216 | subject arm 1 opus–opus #7 A m27 | claude-opus-5-5 | 4 | 105 | $0.00614 | 2.7 |  |
| 2026-10-24 06:26 | 3217 | check arm 1 opus–opus #7 m27 | claude-haiku-5-5 | 335 | 44 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 3218 | subject arm 1 opus–opus #8 B m46 | claude-opus-5-5 | 4 | 50 | $0.00339 | 1.9 |  |
| 2026-10-24 06:26 | 3219 | check arm 1 opus–opus #8 m46 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 1.3 |  |
| 2026-10-24 06:26 | 3220 | subject arm 1 opus–opus #8 A m47 | claude-opus-5-5 | 4 | 48 | $0.00336 | 1.4 |  |
| 2026-10-24 06:26 | 3221 | subject arm 1 opus–opus #7 B m28 | claude-opus-5-5 | 4 | 170 | $0.00742 | 3.3 |  |
| 2026-10-24 06:26 | 3222 | check arm 1 opus–opus #7 m28 | claude-haiku-5-5 | 374 | 81 | $0.00008 | 1.1 |  |
| 2026-10-24 06:26 | 3223 | check arm 1 opus–opus #8 m47 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 1.2 |  |
| 2026-10-24 06:26 | 3224 | subject arm 1 fable–fable #7 B m38 | claude-fable-5-1 | 4 | 368 | $0.02354 | 9 |  |
| 2026-10-24 06:26 | 3225 | check arm 1 fable–fable #7 m38 | claude-haiku-5-5 | 480 | 73 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 3226 | subject arm 1 opus–opus #8 B m48 | claude-opus-5-5 | 4 | 51 | $0.00342 | 2 |  |
| 2026-10-24 06:26 | 3227 | subject arm 1 opus–opus #7 A m29 | claude-opus-5-5 | 4 | 125 | $0.00672 | 2.7 |  |
| 2026-10-24 06:26 | 3228 | check arm 1 opus–opus #8 m48 | claude-haiku-5-5 | 325 | 43 | $0.00005 | 1.7 |  |
| 2026-10-24 06:26 | 3229 | check arm 1 opus–opus #7 m29 | claude-haiku-5-5 | 376 | 57 | $0.00007 | 1.2 |  |
| 2026-10-24 06:26 | 3230 | subject arm 1 fable–fable #7 A m39 | claude-fable-5-1 | 4 | 177 | $0.01527 | 3.3 |  |
| 2026-10-24 06:26 | 3231 | check arm 1 fable–fable #7 m39 | claude-haiku-5-5 | 464 | 59 | $0.00008 | 0.6 |  |
| 2026-10-24 06:26 | 3232 | subject arm 1 opus–opus #8 A m49 | claude-opus-5-5 | 4 | 24 | $0.00288 | 3 |  |
| 2026-10-24 06:26 | 3233 | subject arm 1 opus–opus #7 B m30 | claude-opus-5-5 | 4 | 117 | $0.00657 | 2.7 |  |
| 2026-10-24 06:26 | 3234 | check arm 1 opus–opus #8 m49 | claude-haiku-5-5 | 325 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 3235 | check arm 1 opus–opus #7 m30 | claude-haiku-5-5 | 337 | 56 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 3236 | subject arm 1 fable–fable #7 B m40 | claude-fable-5-1 | 4 | 84 | $0.01042 | 2 |  |
| 2026-10-24 06:26 | 3237 | check arm 1 fable–fable #7 m40 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 3238 | subject arm 1 opus–opus #8 B m50 | claude-opus-5-5 | 4 | 100 | $0.00440 | 2.4 |  |
| 2026-10-24 06:26 | 3239 | check arm 1 opus–opus #8 m50 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 3240 | subject arm 1 fable–fable #7 A m41 | claude-fable-5-1 | 4 | 101 | $0.00962 | 1.9 |  |
| 2026-10-24 06:26 | 3241 | subject arm 1 opus–opus #7 A m31 | claude-opus-5-5 | 4 | 167 | $0.00738 | 3.6 |  |
| 2026-10-24 06:26 | 3242 | check arm 1 opus–opus #7 m31 | claude-haiku-5-5 | 335 | 54 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 3243 | check arm 1 fable–fable #7 m41 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.6 |  |
| 2026-10-24 06:26 | 3244 | subject arm 1 opus–opus #8 A m51 | claude-opus-5-5 | 4 | 53 | $0.00346 | 1.5 |  |
| 2026-10-24 06:26 | 3245 | check arm 1 opus–opus #8 m51 | claude-haiku-5-5 | 325 | 45 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 3246 | subject arm 1 fable–fable #7 B m42 | claude-fable-5-1 | 4 | 183 | $0.01372 | 3.2 |  |
| 2026-10-24 06:26 | 3247 | check arm 1 fable–fable #7 m42 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 3248 | subject arm 1 opus–opus #7 B m32 | claude-opus-5-5 | 4 | 284 | $0.00971 | 4.8 |  |
| 2026-10-24 06:26 | 3249 | subject arm 1 opus–opus #8 B m52 | claude-opus-5-5 | 4 | 85 | $0.00410 | 2.2 |  |
| 2026-10-24 06:26 | 3250 | check arm 1 opus–opus #7 m32 | claude-haiku-5-5 | 445 | 71 | $0.00008 | 0.6 |  |
| 2026-10-24 06:26 | 3251 | check arm 1 opus–opus #8 m52 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 3252 | subject arm 1 fable–fable #7 A m43 | claude-fable-5-1 | 4 | 77 | $0.00843 | 1.7 |  |
| 2026-10-24 06:26 | 3253 | check arm 1 fable–fable #7 m43 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 3254 | subject arm 1 opus–opus #8 A m53 | claude-opus-5-5 | 4 | 65 | $0.00370 | 1.7 |  |
| 2026-10-24 06:26 | 3255 | check arm 1 opus–opus #8 m53 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 3256 | subject arm 1 opus–opus #7 A m33 | claude-opus-5-5 | 4 | 120 | $0.00699 | 2.8 |  |
| 2026-10-24 06:26 | 3257 | check arm 1 opus–opus #7 m33 | claude-haiku-5-5 | 438 | 51 | $0.00007 | 0.6 |  |
| 2026-10-24 06:26 | 3258 | subject arm 1 fable–fable #7 B m44 | claude-fable-5-1 | 4 | 104 | $0.00978 | 2 |  |
| 2026-10-24 06:26 | 3259 | check arm 1 fable–fable #7 m44 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.8 |  |
| 2026-10-24 06:26 | 3260 | subject arm 1 opus–opus #8 B m54 | claude-opus-5-5 | 4 | 92 | $0.00424 | 2.3 |  |
| 2026-10-24 06:26 | 3261 | subject arm 1 opus–opus #7 B m34 | claude-opus-5-5 | 4 | 20 | $0.00495 | 1.4 |  |
| 2026-10-24 06:26 | 3262 | check arm 1 opus–opus #7 m34 | claude-haiku-5-5 | 321 | 44 | $0.00005 | 0.9 |  |
| 2026-10-24 06:26 | 3263 | check arm 1 opus–opus #8 m54 | claude-haiku-5-5 | 325 | 44 | $0.00005 | 1.1 |  |
| 2026-10-24 06:26 | 3264 | subject arm 1 fable–fable #7 A m45 | claude-fable-5-1 | 4 | 128 | $0.01098 | 2.1 |  |
| 2026-10-24 06:26 | 3265 | check arm 1 fable–fable #7 m45 | claude-haiku-5-5 | 329 | 57 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 3266 | subject arm 1 opus–opus #8 A m55 | claude-opus-5-5 | 4 | 47 | $0.00334 | 1.3 |  |
| 2026-10-24 06:26 | 3267 | subject arm 1 opus–opus #7 A m35 | claude-opus-5-5 | 4 | 36 | $0.00471 | 1.8 |  |
| 2026-10-24 06:26 | 3268 | check arm 1 opus–opus #8 m55 | claude-haiku-5-5 | 325 | 44 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 3269 | check arm 1 opus–opus #7 m35 | claude-haiku-5-5 | 321 | 44 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 3270 | subject arm 1 opus–opus #8 B m56 | claude-opus-5-5 | 4 | 59 | $0.00358 | 1.8 |  |
| 2026-10-24 06:26 | 3271 | subject arm 1 fable–fable #7 B m46 | claude-fable-5-1 | 4 | 145 | $0.01183 | 3.3 |  |
| 2026-10-24 06:26 | 3272 | subject arm 1 opus–opus #7 B m36 | claude-opus-5-5 | 4 | 20 | $0.00439 | 1.4 |  |
| 2026-10-24 06:26 | 3273 | check arm 1 opus–opus #7 m36 | claude-haiku-5-5 | 321 | 46 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 3274 | check arm 1 fable–fable #7 m46 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.2 |  |
| 2026-10-24 06:26 | 3275 | check arm 1 opus–opus #8 m56 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 1.6 |  |
| 2026-10-24 06:26 | 3276 | subject arm 1 opus–opus #8 A m57 | claude-opus-5-5 | 4 | 75 | $0.00391 | 1.7 |  |
| 2026-10-24 06:26 | 3277 | subject arm 1 fable–fable #7 A m47 | claude-fable-5-1 | 4 | 101 | $0.00963 | 2 |  |
| 2026-10-24 06:26 | 3278 | subject arm 1 opus–opus #7 A m37 | claude-opus-5-5 | 4 | 61 | $0.00521 | 2 |  |
| 2026-10-24 06:26 | 3279 | check arm 1 fable–fable #7 m47 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 3280 | check arm 1 opus–opus #7 m37 | claude-haiku-5-5 | 321 | 45 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 3281 | check arm 1 opus–opus #8 m57 | claude-haiku-5-5 | 325 | 45 | $0.00006 | 1.5 |  |
| 2026-10-24 06:26 | 3282 | subject arm 1 opus–opus #8 B m58 | claude-opus-5-5 | 4 | 53 | $0.00347 | 1.8 |  |
| 2026-10-24 06:26 | 3283 | subject arm 1 opus–opus #7 B m38 | claude-opus-5-5 | 4 | 21 | $0.00441 | 1.4 |  |
| 2026-10-24 06:26 | 3284 | check arm 1 opus–opus #8 m58 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 1 |  |
| 2026-10-24 06:26 | 3285 | check arm 1 opus–opus #7 m38 | claude-haiku-5-5 | 321 | 44 | $0.00005 | 1.1 |  |
| 2026-10-24 06:26 | 3286 | subject arm 1 fable–fable #7 B m48 | claude-fable-5-1 | 4 | 155 | $0.01233 | 3.8 |  |
| 2026-10-24 06:26 | 3287 | check arm 1 fable–fable #7 m48 | claude-haiku-5-5 | 329 | 42 | $0.00005 | 1.6 |  |
| 2026-10-24 06:26 | 3288 | subject arm 1 opus–opus #8 A m59 | claude-opus-5-5 | 4 | 62 | $0.00365 | 1.6 |  |
| 2026-10-24 06:26 | 3289 | subject arm 1 opus–opus #7 A m39 | claude-opus-5-5 | 4 | 70 | $0.00539 | 2 |  |
| 2026-10-24 06:26 | 3290 | check arm 1 opus–opus #8 m59 | claude-haiku-5-5 | 325 | 47 | $0.00006 | 1.1 |  |
| 2026-10-24 06:26 | 3291 | check arm 1 opus–opus #7 m39 | claude-haiku-5-5 | 321 | 45 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 3292 | subject arm 1 fable–fable #7 A m49 | claude-fable-5-1 | 4 | 139 | $0.01154 | 2.8 |  |
| 2026-10-24 06:26 | 3293 | subject arm 1 opus–opus #8 B m60 | claude-opus-5-5 | 4 | 51 | $0.00343 | 1.9 |  |
| 2026-10-24 06:26 | 3294 | subject arm 1 opus–opus #7 B m40 | claude-opus-5-5 | 4 | 28 | $0.00456 | 1.5 |  |
| 2026-10-24 06:26 | 3295 | check arm 1 fable–fable #7 m49 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.4 |  |
| 2026-10-24 06:26 | 3296 | check arm 1 opus–opus #8 m60 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 3297 | check arm 1 opus–opus #7 m40 | claude-haiku-5-5 | 321 | 44 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 3298 | tags 1 arm 1 opus–opus #8 m1–10 | claude-haiku-5-5 | 11423 | 680 | $0.00148 | 2.5 |  |
| 2026-10-24 06:26 | 3299 | tags 2 arm 1 opus–opus #8 m1–10 | claude-haiku-5-5 | 11423 | 680 | $0.00148 | 2.5 |  |
| 2026-10-24 06:26 | 3300 | subject arm 1 fable–fable #7 B m50 | claude-fable-5-1 | 4 | 92 | $0.00919 | 2 |  |
| 2026-10-24 06:26 | 3301 | subject arm 1 opus–opus #7 A m41 | claude-opus-5-5 | 4 | 56 | $0.00512 | 1.9 |  |
| 2026-10-24 06:26 | 3302 | check arm 1 fable–fable #7 m50 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.7 |  |
| 2026-10-24 06:26 | 3303 | check arm 1 opus–opus #7 m41 | claude-haiku-5-5 | 321 | 44 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 3304 | subject arm 2 sonnet–sonnet #8 A m1 | claude-sonnet-5-5 | 59 | 261 | $0.00273 | 3.2 |  |
| 2026-10-24 06:26 | 3305 | tags 1 arm 1 opus–opus #8 m11–20 | claude-haiku-5-5 | 2187 | 1284 | $0.00086 | 5.4 |  |
| 2026-10-24 06:26 | 3306 | check arm 2 sonnet–sonnet #8 m1 | claude-haiku-5-5 | 587 | 71 | $0.00009 | 0.6 |  |
| 2026-10-24 06:26 | 3307 | tags 1 arm 1 opus–opus #8 m21–30 | claude-haiku-5-5 | 1273 | 680 | $0.00047 | 2.3 |  |
| 2026-10-24 06:26 | 3308 | subject arm 1 fable–fable #7 A m51 | claude-fable-5-1 | 4 | 150 | $0.01209 | 2.8 |  |
| 2026-10-24 06:26 | 3309 | subject arm 1 opus–opus #7 B m42 | claude-opus-5-5 | 4 | 27 | $0.00454 | 1.6 |  |
| 2026-10-24 06:26 | 3310 | tags 2 arm 1 opus–opus #8 m11–20 | claude-haiku-5-5 | 2187 | 680 | $0.00056 | 3.6 |  |
| 2026-10-24 06:26 | 3311 | check arm 1 fable–fable #7 m51 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 3312 | check arm 1 opus–opus #7 m42 | claude-haiku-5-5 | 321 | 46 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 3313 | tags 2 arm 1 opus–opus #8 m21–30 | claude-haiku-5-5 | 1273 | 680 | $0.00047 | 2.2 |  |
| 2026-10-24 06:26 | 3314 | subject arm 2 sonnet–sonnet #8 B m2 | claude-sonnet-5-5 | 318 | 394 | $0.00458 | 4.9 |  |
| 2026-10-24 06:26 | 3315 | subject arm 1 fable–fable #7 B m52 | claude-fable-5-1 | 4 | 69 | $0.00804 | 1.7 |  |
| 2026-10-24 06:26 | 3316 | tags 1 arm 1 opus–opus #8 m31–40 | claude-haiku-5-5 | 1378 | 680 | $0.00048 | 2.6 |  |
| 2026-10-24 06:26 | 3317 | check arm 1 fable–fable #7 m52 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 3318 | check arm 2 sonnet–sonnet #8 m2 | claude-haiku-5-5 | 848 | 85 | $0.00013 | 0.9 |  |
| 2026-10-24 06:26 | 3319 | subject arm 1 opus–opus #7 A m43 | claude-opus-5-5 | 4 | 83 | $0.00566 | 2.4 |  |
| 2026-10-24 06:26 | 3320 | check arm 1 opus–opus #7 m43 | claude-haiku-5-5 | 321 | 45 | $0.00005 | 1 |  |
| 2026-10-24 06:26 | 3321 | tags 2 arm 1 opus–opus #8 m31–40 | claude-haiku-5-5 | 1378 | 938 | $0.00061 | 3.9 |  |
| 2026-10-24 06:26 | 3322 | tags 1 arm 1 opus–opus #8 m41–50 | claude-haiku-5-5 | 1141 | 680 | $0.00045 | 2.8 |  |
| 2026-10-24 06:26 | 3323 | tags 2 arm 1 opus–opus #8 m41–50 | claude-haiku-5-5 | 1141 | 680 | $0.00045 | 2.3 |  |
| 2026-10-24 06:26 | 3324 | subject arm 1 opus–opus #7 B m44 | claude-opus-5-5 | 4 | 70 | $0.00540 | 2.1 |  |
| 2026-10-24 06:26 | 3325 | subject arm 1 fable–fable #7 A m53 | claude-fable-5-1 | 4 | 205 | $0.01484 | 3.4 |  |
| 2026-10-24 06:26 | 3326 | check arm 1 opus–opus #7 m44 | claude-haiku-5-5 | 321 | 47 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 3327 | check arm 1 fable–fable #7 m53 | claude-haiku-5-5 | 329 | 42 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 3328 | tags 1 arm 1 opus–opus #8 m51–60 | claude-haiku-5-5 | 1110 | 680 | $0.00045 | 2.3 |  |
| 2026-10-24 06:26 | 3329 | subject arm 2 sonnet–sonnet #8 A m3 | claude-sonnet-5-5 | 4 | 434 | $0.00582 | 5.7 |  |
| 2026-10-24 06:26 | 3330 | check arm 2 sonnet–sonnet #8 m3 | claude-haiku-5-5 | 1021 | 70 | $0.00014 | 0.8 |  |
| 2026-10-24 06:26 | 3331 | tags 2 arm 1 opus–opus #8 m51–60 | claude-haiku-5-5 | 1110 | 680 | $0.00045 | 3.5 |  |
| 2026-10-24 06:26 | 3332 | subject arm 1 opus–opus #7 A m45 | claude-opus-5-5 | 4 | 72 | $0.00544 | 2.1 |  |
| 2026-10-24 06:26 | 3333 | check arm 1 opus–opus #7 m45 | claude-haiku-5-5 | 321 | 46 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 3334 | subject arm 1 fable–fable #7 B m54 | claude-fable-5-1 | 4 | 150 | $0.01209 | 3 |  |
| 2026-10-24 06:26 | 3335 | check arm 1 fable–fable #7 m54 | claude-haiku-5-5 | 329 | 42 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 3336 | tags referee arm 1 opus–opus #8 m21–30 | claude-opus-5-5 | 1273 | 737 | $0.01983 | 6.1 |  |
| 2026-10-24 06:26 | 3337 | subject arm 1 opus–opus #7 B m46 | claude-opus-5-5 | 4 | 26 | $0.00452 | 1.5 |  |
| 2026-10-24 06:26 | 3338 | check arm 1 opus–opus #7 m46 | claude-haiku-5-5 | 321 | 46 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 3339 | subject arm 1 fable–fable #7 A m55 | claude-fable-5-1 | 4 | 90 | $0.00910 | 1.7 |  |
| 2026-10-24 06:26 | 3340 | check arm 1 fable–fable #7 m55 | claude-haiku-5-5 | 329 | 55 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 3341 | subject arm 2 sonnet–sonnet #8 B m4 | claude-sonnet-5-5 | 4 | 624 | $0.00880 | 8.1 |  |
| 2026-10-24 06:26 | 3342 | subject arm 1 opus–opus #7 A m47 | claude-opus-5-5 | 4 | 51 | $0.00502 | 1.9 |  |
| 2026-10-24 06:26 | 3343 | check arm 2 sonnet–sonnet #8 m4 | claude-haiku-5-5 | 1288 | 71 | $0.00016 | 0.9 |  |
| 2026-10-24 06:26 | 3344 | check arm 1 opus–opus #7 m47 | claude-haiku-5-5 | 321 | 44 | $0.00005 | 1 |  |
| 2026-10-24 06:26 | 3345 | subject arm 1 fable–fable #7 B m56 | claude-fable-5-1 | 4 | 88 | $0.00900 | 1.8 |  |
| 2026-10-24 06:26 | 3346 | check arm 1 fable–fable #7 m56 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 3347 | subject arm 1 opus–opus #7 B m48 | claude-opus-5-5 | 4 | 32 | $0.00464 | 2.3 |  |
| 2026-10-24 06:26 | 3348 | check arm 1 opus–opus #7 m48 | claude-haiku-5-5 | 321 | 45 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 3349 | subject arm 1 fable–fable #7 A m57 | claude-fable-5-1 | 4 | 201 | $0.01465 | 3.7 |  |
| 2026-10-24 06:26 | 3350 | check arm 1 fable–fable #7 m57 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 3351 | subject arm 2 sonnet–sonnet #8 A m5 | claude-sonnet-5-5 | 4 | 502 | $0.00758 | 7.1 |  |
| 2026-10-24 06:26 | 3352 | check arm 2 sonnet–sonnet #8 m5 | claude-haiku-5-5 | 1356 | 78 | $0.00017 | 0.8 |  |
| 2026-10-24 06:26 | 3353 | subject arm 1 opus–opus #7 A m49 | claude-opus-5-5 | 4 | 87 | $0.00574 | 3.2 |  |
| 2026-10-24 06:26 | 3354 | check arm 1 opus–opus #7 m49 | claude-haiku-5-5 | 321 | 44 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 3355 | subject arm 1 fable–fable #7 B m58 | claude-fable-5-1 | 4 | 67 | $0.00795 | 1.9 |  |
| 2026-10-24 06:26 | 3356 | check arm 1 fable–fable #7 m58 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.5 |  |
| 2026-10-24 06:26 | 3357 | subject arm 1 opus–opus #7 B m50 | claude-opus-5-5 | 4 | 27 | $0.00454 | 1.6 |  |
| 2026-10-24 06:26 | 3358 | check arm 1 opus–opus #7 m50 | claude-haiku-5-5 | 321 | 44 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 3359 | subject arm 1 fable–fable #7 A m59 | claude-fable-5-1 | 4 | 79 | $0.00855 | 1.4 |  |
| 2026-10-24 06:26 | 3360 | check arm 1 fable–fable #7 m59 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 3361 | subject arm 1 opus–opus #7 A m51 | claude-opus-5-5 | 4 | 69 | $0.00538 | 2.2 |  |
| 2026-10-24 06:26 | 3362 | subject arm 2 sonnet–sonnet #8 B m6 | claude-sonnet-5-5 | 4 | 656 | $0.00937 | 9.2 |  |
| 2026-10-24 06:26 | 3363 | subject arm 1 fable–fable #7 B m60 | claude-fable-5-1 | 4 | 34 | $0.00630 | 1.4 |  |
| 2026-10-24 06:26 | 3364 | check arm 1 opus–opus #7 m51 | claude-haiku-5-5 | 321 | 46 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 3365 | check arm 2 sonnet–sonnet #8 m6 | claude-haiku-5-5 | 1260 | 86 | $0.00017 | 1 |  |
| 2026-10-24 06:26 | 3366 | check arm 1 fable–fable #7 m60 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 3367 | tags 2 arm 1 fable–fable #7 m1–10 | claude-haiku-5-5 | 10953 | 680 | $0.00144 | 2.4 |  |
| 2026-10-24 06:26 | 3368 | tags 1 arm 1 fable–fable #7 m11–20 | claude-haiku-5-5 | 9126 | 680 | $0.00125 | 2.4 |  |
| 2026-10-24 06:26 | 3369 | tags 1 arm 1 fable–fable #7 m1–10 | claude-haiku-5-5 | 10953 | 680 | $0.00144 | 2.5 |  |
| 2026-10-24 06:26 | 3370 | subject arm 1 opus–opus #7 B m52 | claude-opus-5-5 | 4 | 33 | $0.00466 | 1.8 |  |
| 2026-10-24 06:26 | 3371 | check arm 1 opus–opus #7 m52 | claude-haiku-5-5 | 321 | 44 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 3372 | subject arm 2 sonnet–sonnet #8 A m7 | claude-sonnet-5-5 | 4 | 181 | $0.00449 | 2.7 |  |
| 2026-10-24 06:26 | 3373 | check arm 2 sonnet–sonnet #8 m7 | claude-haiku-5-5 | 935 | 63 | $0.00013 | 0.7 |  |
| 2026-10-24 06:26 | 3374 | subject arm 1 sonnet–sonnet #8 A m1 | claude-sonnet-5-5 | 40 | 434 | $0.00442 | 4.6 |  |
| 2026-10-24 06:26 | 3375 | check arm 1 sonnet–sonnet #8 m1 | claude-haiku-5-5 | 646 | 65 | $0.00010 | 0.9 |  |
| 2026-10-24 06:26 | 3376 | tags 2 arm 1 fable–fable #7 m11–20 | claude-haiku-5-5 | 9126 | 680 | $0.00125 | 2.3 |  |
| 2026-10-24 06:26 | 3377 | tags 2 arm 1 fable–fable #7 m21–30 | claude-haiku-5-5 | 1316 | 680 | $0.00047 | 2.2 |  |
| 2026-10-24 06:26 | 3378 | tags 1 arm 1 fable–fable #7 m21–30 | claude-haiku-5-5 | 1316 | 680 | $0.00047 | 3 |  |
| 2026-10-24 06:26 | 3379 | subject arm 1 opus–opus #7 A m53 | claude-opus-5-5 | 4 | 106 | $0.00612 | 2.6 |  |
| 2026-10-24 06:26 | 3380 | check arm 1 opus–opus #7 m53 | claude-haiku-5-5 | 321 | 45 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 3381 | tags 1 arm 1 fable–fable #7 m31–40 | claude-haiku-5-5 | 1421 | 680 | $0.00048 | 2.2 |  |
| 2026-10-24 06:26 | 3382 | tags 2 arm 1 fable–fable #7 m31–40 | claude-haiku-5-5 | 1421 | 680 | $0.00048 | 2.3 |  |
| 2026-10-24 06:26 | 3383 | tags 1 arm 1 fable–fable #7 m41–50 | claude-haiku-5-5 | 1132 | 680 | $0.00045 | 2.1 |  |
| 2026-10-24 06:26 | 3384 | subject arm 1 opus–opus #7 B m54 | claude-opus-5-5 | 4 | 38 | $0.00476 | 2.5 |  |
| 2026-10-24 06:26 | 3385 | check arm 1 opus–opus #7 m54 | claude-haiku-5-5 | 321 | 45 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 3386 | subject arm 1 sonnet–sonnet #8 B m2 | claude-sonnet-5-5 | 358 | 560 | $0.00632 | 6 |  |
| 2026-10-24 06:26 | 3387 | subject arm 2 fable–fable #8 A m1 | claude-fable-5-1 | 59 | 472 | $0.02419 | 9.7 |  |
| 2026-10-24 06:26 | 3388 | check arm 1 sonnet–sonnet #8 m2 | claude-haiku-5-5 | 1195 | 72 | $0.00016 | 1.5 |  |
| 2026-10-24 06:26 | 3389 | check arm 2 fable–fable #8 m1 | claude-haiku-5-5 | 746 | 58 | $0.00010 | 0.8 |  |
| 2026-10-24 06:26 | 3390 | tags 1 arm 1 fable–fable #7 m51–60 | claude-haiku-5-5 | 1132 | 680 | $0.00045 | 2.2 |  |
| 2026-10-24 06:26 | 3391 | tags 2 arm 1 fable–fable #7 m41–50 | claude-haiku-5-5 | 1132 | 680 | $0.00045 | 2.5 |  |
| 2026-10-24 06:26 | 3392 | tags 2 arm 1 fable–fable #7 m51–60 | claude-haiku-5-5 | 1132 | 680 | $0.00045 | 2.4 |  |
| 2026-10-24 06:26 | 3393 | subject arm 1 opus–opus #7 A m55 | claude-opus-5-5 | 4 | 86 | $0.00572 | 2.3 |  |
| 2026-10-24 06:26 | 3394 | check arm 1 opus–opus #7 m55 | claude-haiku-5-5 | 321 | 45 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 3395 | tags 1 arm 2 sonnet–sonnet #8 m1–7 | claude-haiku-5-5 | 3609 | 479 | $0.00060 | 1.8 |  |
| 2026-10-24 06:26 | 3396 | tags 2 arm 2 sonnet–sonnet #8 m1–7 | claude-haiku-5-5 | 3609 | 479 | $0.00060 | 2.1 |  |
| 2026-10-24 06:26 | 3397 | subject arm 1 opus–opus #7 B m56 | claude-opus-5-5 | 4 | 26 | $0.00452 | 2.1 |  |
| 2026-10-24 06:26 | 3398 | check arm 1 opus–opus #7 m56 | claude-haiku-5-5 | 321 | 46 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 3399 | subject arm 1 sonnet–sonnet #8 A m3 | claude-sonnet-5-5 | 4 | 791 | $0.01021 | 8.2 |  |
| 2026-10-24 06:26 | 3400 | check arm 1 sonnet–sonnet #8 m3 | claude-haiku-5-5 | 1606 | 75 | $0.00020 | 0.8 |  |
| 2026-10-24 06:26 | 3401 | subject arm 1 opus–opus #7 A m57 | claude-opus-5-5 | 4 | 59 | $0.00519 | 2.2 |  |
| 2026-10-24 06:26 | 3402 | tags referee arm 1 fable–fable #7 m11–20 | claude-opus-5-5 | 9126 | 1009 | $0.05668 | 8.3 |  |
| 2026-10-24 06:26 | 3403 | tags referee arm 1 fable–fable #7 m21–30 | claude-opus-5-5 | 1316 | 680 | $0.01886 | 4.8 |  |
| 2026-10-24 06:26 | 3404 | check arm 1 opus–opus #7 m57 | claude-haiku-5-5 | 321 | 43 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 3405 | tags referee arm 2 sonnet–sonnet #8 m1–7 | claude-opus-5-5 | 3609 | 639 | $0.02722 | 5.6 |  |
| 2026-10-24 06:26 | 3406 | subject arm 1 opus–opus #7 B m58 | claude-opus-5-5 | 4 | 20 | $0.00441 | 1.5 |  |
| 2026-10-24 06:26 | 3407 | check arm 1 opus–opus #7 m58 | claude-haiku-5-5 | 321 | 43 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 3408 | subject arm 1 sonnet–sonnet #8 B m4 | claude-sonnet-5-5 | 4 | 1012 | $0.01424 | 9.9 |  |
| 2026-10-24 06:26 | 3409 | check arm 1 sonnet–sonnet #8 m4 | claude-haiku-5-5 | 1970 | 68 | $0.00023 | 0.7 |  |
| 2026-10-24 06:26 | 3410 | subject arm 1 opus–opus #7 A m59 | claude-opus-5-5 | 4 | 324 | $0.01049 | 5.2 |  |
| 2026-10-24 06:26 | 3411 | check arm 1 opus–opus #7 m59 | claude-haiku-5-5 | 385 | 67 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 3412 | subject arm 1 opus–opus #7 B m60 | claude-opus-5-5 | 4 | 125 | $0.00683 | 2.9 |  |
| 2026-10-24 06:26 | 3413 | check arm 1 opus–opus #7 m60 | claude-haiku-5-5 | 417 | 58 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 3414 | subject arm 2 fable–fable #8 B m2 | claude-fable-5-1 | 477 | 1537 | $0.08162 | 29.7 |  |
| 2026-10-24 06:26 | 3415 | check arm 2 fable–fable #8 m2 | claude-haiku-5-5 | 1636 | 79 | $0.00020 | 0.9 |  |
| 2026-10-24 06:26 | 3416 | tags 2 arm 1 opus–opus #7 m1–10 | claude-haiku-5-5 | 14390 | 680 | $0.00178 | 2.4 |  |
| 2026-10-24 06:26 | 3417 | tags 1 arm 1 opus–opus #7 m11–20 | claude-haiku-5-5 | 8386 | 680 | $0.00118 | 2.6 |  |
| 2026-10-24 06:26 | 3418 | subject arm 1 sonnet–sonnet #8 A m5 | claude-sonnet-5-5 | 4 | 808 | $0.01241 | 9.3 |  |
| 2026-10-24 06:26 | 3419 | tags 1 arm 1 opus–opus #7 m1–10 | claude-haiku-5-5 | 14390 | 680 | $0.00178 | 2.9 |  |
| 2026-10-24 06:26 | 3420 | check arm 1 sonnet–sonnet #8 m5 | claude-haiku-5-5 | 2047 | 70 | $0.00024 | 0.8 |  |
| 2026-10-24 06:26 | 3421 | tags 2 arm 1 opus–opus #7 m11–20 | claude-haiku-5-5 | 8386 | 680 | $0.00118 | 2.2 |  |
| 2026-10-24 06:26 | 3422 | tags 2 arm 1 opus–opus #7 m21–30 | claude-haiku-5-5 | 1310 | 680 | $0.00047 | 2.2 |  |
| 2026-10-24 06:26 | 3423 | tags 1 arm 1 opus–opus #7 m21–30 | claude-haiku-5-5 | 1310 | 680 | $0.00047 | 2.6 |  |
| 2026-10-24 06:26 | 3424 | tags 1 arm 1 opus–opus #7 m31–40 | claude-haiku-5-5 | 1219 | 680 | $0.00046 | 2.2 |  |
| 2026-10-24 06:26 | 3425 | subject arm 1 fable–fable #8 A m1 | claude-fable-5-1 | 40 | 494 | $0.02510 | 10.8 |  |
| 2026-10-24 06:26 | 3426 | tags 2 arm 1 opus–opus #7 m31–40 | claude-haiku-5-5 | 1219 | 680 | $0.00046 | 2.2 |  |
| 2026-10-24 06:26 | 3427 | tags 1 arm 1 opus–opus #7 m41–50 | claude-haiku-5-5 | 1088 | 680 | $0.00045 | 2.2 |  |
| 2026-10-24 06:26 | 3428 | check arm 1 fable–fable #8 m1 | claude-haiku-5-5 | 732 | 67 | $0.00011 | 2.4 |  |
| 2026-10-24 06:26 | 3429 | subject arm 1 sonnet–sonnet #8 B m6 | claude-sonnet-5-5 | 4 | 874 | $0.01341 | 10.1 |  |
| 2026-10-24 06:26 | 3430 | check arm 1 sonnet–sonnet #8 m6 | claude-haiku-5-5 | 1997 | 86 | $0.00024 | 1.4 |  |
| 2026-10-24 06:26 | 3431 | tags 2 arm 1 opus–opus #7 m41–50 | claude-haiku-5-5 | 1088 | 680 | $0.00045 | 2.3 |  |
| 2026-10-24 06:26 | 3432 | tags 1 arm 1 opus–opus #7 m51–60 | claude-haiku-5-5 | 1184 | 680 | $0.00046 | 2.2 |  |
| 2026-10-24 06:26 | 3433 | tags 2 arm 1 opus–opus #7 m51–60 | claude-haiku-5-5 | 1184 | 680 | $0.00046 | 2.2 |  |
| 2026-10-24 06:26 | 3434 | subject arm 1 sonnet–sonnet #8 A m7 | claude-sonnet-5-5 | 4 | 925 | $0.01398 | 9.9 |  |
| 2026-10-24 06:26 | 3435 | check arm 1 sonnet–sonnet #8 m7 | claude-haiku-5-5 | 2114 | 69 | $0.00025 | 1.2 |  |
| 2026-10-24 06:26 | 3436 | subject arm 2 fable–fable #8 A m3 | claude-fable-5-1 | 4 | 1835 | $0.10899 | 31.5 |  |
| 2026-10-24 06:26 | 3437 | check arm 2 fable–fable #8 m3 | claude-haiku-5-5 | 2163 | 72 | $0.00025 | 0.8 |  |
| 2026-10-24 06:26 | 3438 | subject arm 1 sonnet–sonnet #8 B m8 | claude-sonnet-5-5 | 4 | 779 | $0.01297 | 8.3 |  |
| 2026-10-24 06:26 | 3439 | check arm 1 sonnet–sonnet #8 m8 | claude-haiku-5-5 | 2019 | 86 | $0.00024 | 0.9 |  |
| 2026-10-24 06:26 | 3440 | subject arm 1 fable–fable #8 B m2 | claude-fable-5-1 | 444 | 1361 | $0.07249 | 27.1 |  |
| 2026-10-24 06:26 | 3441 | check arm 1 fable–fable #8 m2 | claude-haiku-5-5 | 1991 | 77 | $0.00024 | 1.4 |  |
| 2026-10-24 06:26 | 3442 | subject arm 1 sonnet–sonnet #8 A m9 | claude-sonnet-5-5 | 4 | 972 | $0.01484 | 10 |  |
| 2026-10-24 06:26 | 3443 | check arm 1 sonnet–sonnet #8 m9 | claude-haiku-5-5 | 1961 | 76 | $0.00023 | 1 |  |
| 2026-10-24 06:26 | 3444 | subject arm 1 sonnet–sonnet #8 B m10 | claude-sonnet-5-5 | 4 | 989 | $0.01505 | 10.9 |  |
| 2026-10-24 06:26 | 3445 | check arm 1 sonnet–sonnet #8 m10 | claude-haiku-5-5 | 2080 | 83 | $0.00025 | 1.6 |  |
| 2026-10-24 06:26 | 3446 | subject arm 1 fable–fable #8 A m3 | claude-fable-5-1 | 4 | 1389 | $0.09089 | 26.9 |  |
| 2026-10-24 06:26 | 3447 | check arm 1 fable–fable #8 m3 | claude-haiku-5-5 | 2886 | 87 | $0.00033 | 1.2 |  |
| 2026-10-24 06:26 | 3448 | subject arm 2 fable–fable #8 B m4 | claude-fable-5-1 | 4 | 1950 | $0.12655 | 39.3 |  |
| 2026-10-24 06:26 | 3449 | check arm 2 fable–fable #8 m4 | claude-haiku-5-5 | 2319 | 68 | $0.00027 | 4.4 |  |
| 2026-10-24 06:26 | 3450 | subject arm 1 sonnet–sonnet #8 A m11 | claude-sonnet-5-5 | 4 | 1732 | $0.02293 | 17.5 |  |
| 2026-10-24 06:26 | 3451 | check arm 1 sonnet–sonnet #8 m11 | claude-haiku-5-5 | 2455 | 70 | $0.00028 | 0.9 |  |
| 2026-10-24 06:26 | 3452 | subject arm 1 sonnet–sonnet #8 B m12 | claude-sonnet-5-5 | 4 | 913 | $0.01585 | 9.8 |  |
| 2026-10-24 06:26 | 3453 | check arm 1 sonnet–sonnet #8 m12 | claude-haiku-5-5 | 2470 | 71 | $0.00028 | 0.7 |  |
| 2026-10-24 06:26 | 3454 | subject arm 1 sonnet–sonnet #8 A m13 | claude-sonnet-5-5 | 4 | 885 | $0.01579 | 9.1 |  |
| 2026-10-24 06:26 | 3455 | check arm 1 sonnet–sonnet #8 m13 | claude-haiku-5-5 | 2113 | 72 | $0.00025 | 1.8 |  |
| 2026-10-24 06:26 | 3456 | subject arm 1 fable–fable #8 B m4 | claude-fable-5-1 | 4 | 2424 | $0.15888 | 43.4 |  |
| 2026-10-24 06:26 | 3457 | check arm 1 fable–fable #8 m4 | claude-haiku-5-5 | 2966 | 74 | $0.00033 | 0.6 |  |
| 2026-10-24 06:26 | 3458 | subject arm 2 fable–fable #8 A m5 | claude-fable-5-1 | 4 | 2054 | $0.12813 | 40.1 |  |
| 2026-10-24 06:26 | 3459 | check arm 2 fable–fable #8 m5 | claude-haiku-5-5 | 2431 | 65 | $0.00028 | 1.6 |  |
| 2026-10-24 06:26 | 3460 | subject arm 1 sonnet–sonnet #8 B m14 | claude-sonnet-5-5 | 4 | 1087 | $0.01717 | 11.1 |  |
| 2026-10-24 06:26 | 3461 | check arm 1 sonnet–sonnet #8 m14 | claude-haiku-5-5 | 2233 | 85 | $0.00027 | 2.6 |  |
| 2026-10-24 06:26 | 3462 | subject arm 1 sonnet–sonnet #8 A m15 | claude-sonnet-5-5 | 4 | 1979 | $0.02657 | 18.9 |  |
| 2026-10-24 06:26 | 3463 | check arm 1 sonnet–sonnet #8 m15 | claude-haiku-5-5 | 2704 | 82 | $0.00031 | 1.3 |  |
| 2026-10-24 06:26 | 3464 | subject arm 1 fable–fable #8 A m5 | claude-fable-5-1 | 4 | 1690 | $0.11811 | 33.7 |  |
| 2026-10-24 06:26 | 3465 | subject arm 2 fable–fable #8 B m6 | claude-fable-5-1 | 4 | 1559 | $0.10502 | 32.1 |  |
| 2026-10-24 06:26 | 3466 | check arm 1 fable–fable #8 m5 | claude-haiku-5-5 | 2658 | 84 | $0.00031 | 1.7 |  |
| 2026-10-24 06:26 | 3467 | check arm 2 fable–fable #8 m6 | claude-haiku-5-5 | 2100 | 79 | $0.00025 | 0.9 |  |
| 2026-10-24 06:26 | 3468 | subject arm 1 sonnet–sonnet #8 B m16 | claude-sonnet-5-5 | 4 | 951 | $0.01764 | 9.6 |  |
| 2026-10-24 06:26 | 3469 | check arm 1 sonnet–sonnet #8 m16 | claude-haiku-5-5 | 2622 | 81 | $0.00030 | 1 |  |
| 2026-10-24 06:26 | 3470 | subject arm 1 sonnet–sonnet #8 A m17 | claude-sonnet-5-5 | 4 | 955 | $0.01768 | 11.4 |  |
| 2026-10-24 06:26 | 3471 | check arm 1 sonnet–sonnet #8 m17 | claude-haiku-5-5 | 2221 | 73 | $0.00026 | 0.8 |  |
| 2026-10-24 06:26 | 3472 | subject arm 1 sonnet–sonnet #8 B m18 | claude-sonnet-5-5 | 4 | 883 | $0.01623 | 9.8 |  |
| 2026-10-24 06:26 | 3473 | check arm 1 sonnet–sonnet #8 m18 | claude-haiku-5-5 | 2153 | 87 | $0.00026 | 0.8 |  |
| 2026-10-24 06:26 | 3474 | subject arm 1 fable–fable #8 B m6 | claude-fable-5-1 | 4 | 1757 | $0.11793 | 31.3 |  |
| 2026-10-24 06:26 | 3475 | check arm 1 fable–fable #8 m6 | claude-haiku-5-5 | 2454 | 87 | $0.00029 | 1 |  |
| 2026-10-24 06:26 | 3476 | subject arm 2 fable–fable #8 A m7 | claude-fable-5-1 | 4 | 2194 | $0.13290 | 39.9 |  |
| 2026-10-24 06:26 | 3477 | check arm 2 fable–fable #8 m7 | claude-haiku-5-5 | 2222 | 88 | $0.00027 | 0.9 |  |
| 2026-10-24 06:26 | 3478 | subject arm 1 fable–fable #8 A m7 | claude-fable-5-1 | 4 | 420 | $0.04887 | 8.2 |  |
| 2026-10-24 06:26 | 3479 | subject arm 1 sonnet–sonnet #8 A m19 | claude-sonnet-5-5 | 4 | 954 | $0.01696 | 10.5 |  |
| 2026-10-24 06:26 | 3480 | check arm 1 fable–fable #8 m7 | claude-haiku-5-5 | 1736 | 70 | $0.00021 | 1 |  |
| 2026-10-24 06:26 | 3481 | check arm 1 sonnet–sonnet #8 m19 | claude-haiku-5-5 | 2152 | 69 | $0.00025 | 1 |  |
| 2026-10-24 06:26 | 3482 | subject arm 1 fable–fable #8 B m8 | claude-fable-5-1 | 4 | 94 | $0.02384 | 2.1 |  |
| 2026-10-24 06:26 | 3483 | check arm 1 fable–fable #8 m8 | claude-haiku-5-5 | 607 | 68 | $0.00009 | 0.7 |  |
| 2026-10-24 06:26 | 3484 | subject arm 1 fable–fable #8 A m9 | claude-fable-5-1 | 4 | 5 | $0.00557 | 1 |  |
| 2026-10-24 06:26 | 3485 | check arm 1 fable–fable #8 m9 | claude-haiku-5-5 | 337 | 63 | $0.00007 | 0.6 |  |
| 2026-10-24 06:26 | 3486 | subject arm 1 sonnet–sonnet #8 B m20 | claude-sonnet-5-5 | 4 | 763 | $0.01524 | 8.5 |  |
| 2026-10-24 06:26 | 3487 | check arm 1 sonnet–sonnet #8 m20 | claude-haiku-5-5 | 2032 | 86 | $0.00025 | 1 |  |
| 2026-10-24 06:26 | 3488 | subject arm 1 fable–fable #8 B m10 | claude-fable-5-1 | 4 | 5 | $0.00226 | 0.9 |  |
| 2026-10-24 06:26 | 3489 | check arm 1 fable–fable #8 m10 | claude-haiku-5-5 | 325 | 52 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 3490 | subject arm 1 fable–fable #8 A m11 | claude-fable-5-1 | 4 | 182 | $0.01096 | 3.9 |  |
| 2026-10-24 06:26 | 3491 | check arm 1 fable–fable #8 m11 | claude-haiku-5-5 | 331 | 48 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 3492 | subject arm 1 fable–fable #8 B m12 | claude-fable-5-1 | 4 | 7 | $0.00229 | 0.9 |  |
| 2026-10-24 06:26 | 3493 | check arm 1 fable–fable #8 m12 | claude-haiku-5-5 | 333 | 54 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 3494 | subject arm 1 sonnet–sonnet #8 A m21 | claude-sonnet-5-5 | 4 | 1022 | $0.01771 | 11.7 |  |
| 2026-10-24 06:26 | 3495 | check arm 1 sonnet–sonnet #8 m21 | claude-haiku-5-5 | 2100 | 86 | $0.00025 | 0.8 |  |
| 2026-10-24 06:26 | 3496 | subject arm 1 fable–fable #8 A m13 | claude-fable-5-1 | 4 | 137 | $0.00882 | 2.8 |  |
| 2026-10-24 06:26 | 3497 | subject arm 2 fable–fable #8 B m8 | claude-fable-5-1 | 4 | 1495 | $0.09974 | 29.1 |  |
| 2026-10-24 06:26 | 3498 | check arm 1 fable–fable #8 m13 | claude-haiku-5-5 | 329 | 57 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 3499 | check arm 2 fable–fable #8 m8 | claude-haiku-5-5 | 2609 | 68 | $0.00029 | 1 |  |
| 2026-10-24 06:26 | 3500 | subject arm 1 sonnet–sonnet #8 B m22 | claude-sonnet-5-5 | 4 | 625 | $0.01410 | 6.1 |  |
| 2026-10-24 06:26 | 3501 | subject arm 1 fable–fable #8 B m14 | claude-fable-5-1 | 4 | 120 | $0.00792 | 3.1 |  |
| 2026-10-24 06:26 | 3502 | check arm 1 sonnet–sonnet #8 m22 | claude-haiku-5-5 | 1962 | 76 | $0.00023 | 1 |  |
| 2026-10-24 06:26 | 3503 | check arm 1 fable–fable #8 m14 | claude-haiku-5-5 | 329 | 42 | $0.00005 | 1.5 |  |
| 2026-10-24 06:26 | 3504 | subject arm 1 fable–fable #8 A m15 | claude-fable-5-1 | 4 | 183 | $0.01107 | 3.2 |  |
| 2026-10-24 06:26 | 3505 | subject arm 1 sonnet–sonnet #8 A m23 | claude-sonnet-5-5 | 4 | 321 | $0.01087 | 3.9 |  |
| 2026-10-24 06:26 | 3506 | check arm 1 fable–fable #8 m15 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 3507 | check arm 1 sonnet–sonnet #8 m23 | claude-haiku-5-5 | 1261 | 76 | $0.00016 | 0.8 |  |
| 2026-10-24 06:26 | 3508 | subject arm 1 fable–fable #8 B m16 | claude-fable-5-1 | 4 | 154 | $0.00962 | 3.6 |  |
| 2026-10-24 06:26 | 3509 | subject arm 1 sonnet–sonnet #8 B m24 | claude-sonnet-5-5 | 4 | 312 | $0.00923 | 3.5 |  |
| 2026-10-24 06:26 | 3510 | check arm 1 fable–fable #8 m16 | claude-haiku-5-5 | 369 | 57 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 3511 | check arm 1 sonnet–sonnet #8 m24 | claude-haiku-5-5 | 948 | 75 | $0.00013 | 0.7 |  |
| 2026-10-24 06:26 | 3512 | subject arm 2 fable–fable #8 A m9 | claude-fable-5-1 | 4 | 810 | $0.07051 | 16.7 |  |
| 2026-10-24 06:26 | 3513 | check arm 2 fable–fable #8 m9 | claude-haiku-5-5 | 1798 | 68 | $0.00021 | 0.7 |  |
| 2026-10-24 06:26 | 3514 | subject arm 1 fable–fable #8 A m17 | claude-fable-5-1 | 4 | 126 | $0.00872 | 2.5 |  |
| 2026-10-24 06:26 | 3515 | subject arm 1 sonnet–sonnet #8 A m25 | claude-sonnet-5-5 | 4 | 156 | $0.00701 | 2.2 |  |
| 2026-10-24 06:26 | 3516 | check arm 1 sonnet–sonnet #8 m25 | claude-haiku-5-5 | 783 | 57 | $0.00011 | 0.8 |  |
| 2026-10-24 06:26 | 3517 | check arm 1 fable–fable #8 m17 | claude-haiku-5-5 | 372 | 62 | $0.00007 | 1 |  |
| 2026-10-24 06:26 | 3518 | subject arm 1 fable–fable #8 B m18 | claude-fable-5-1 | 4 | 71 | $0.00601 | 1.4 |  |
| 2026-10-24 06:26 | 3519 | subject arm 1 sonnet–sonnet #8 B m26 | claude-sonnet-5-5 | 4 | 166 | $0.00676 | 2.2 |  |
| 2026-10-24 06:26 | 3520 | check arm 1 fable–fable #8 m18 | claude-haiku-5-5 | 329 | 50 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 3521 | check arm 1 sonnet–sonnet #8 m26 | claude-haiku-5-5 | 637 | 73 | $0.00010 | 0.6 |  |
| 2026-10-24 06:26 | 3522 | subject arm 1 fable–fable #8 A m19 | claude-fable-5-1 | 4 | 126 | $0.00824 | 2 |  |
| 2026-10-24 06:26 | 3523 | check arm 1 fable–fable #8 m19 | claude-haiku-5-5 | 323 | 48 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 3524 | subject arm 1 sonnet–sonnet #8 A m27 | claude-sonnet-5-5 | 4 | 132 | $0.00612 | 2 |  |
| 2026-10-24 06:26 | 3525 | check arm 1 sonnet–sonnet #8 m27 | claude-haiku-5-5 | 613 | 70 | $0.00010 | 1.1 |  |
| 2026-10-24 06:26 | 3526 | subject arm 1 fable–fable #8 B m20 | claude-fable-5-1 | 4 | 68 | $0.00526 | 1.6 |  |
| 2026-10-24 06:26 | 3527 | subject arm 1 sonnet–sonnet #8 B m28 | claude-sonnet-5-5 | 4 | 38 | $0.00515 | 1.2 |  |
| 2026-10-24 06:26 | 3528 | check arm 1 fable–fable #8 m20 | claude-haiku-5-5 | 323 | 55 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 3529 | check arm 1 sonnet–sonnet #8 m28 | claude-haiku-5-5 | 485 | 68 | $0.00008 | 0.9 |  |
| 2026-10-24 06:26 | 3530 | subject arm 1 sonnet–sonnet #8 A m29 | claude-sonnet-5-5 | 4 | 18 | $0.00466 | 0.9 |  |
| 2026-10-24 06:26 | 3531 | check arm 1 sonnet–sonnet #8 m29 | claude-haiku-5-5 | 371 | 68 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 3532 | subject arm 2 fable–fable #8 B m10 | claude-fable-5-1 | 4 | 1092 | $0.07476 | 20.7 |  |
| 2026-10-24 06:26 | 3533 | subject arm 1 fable–fable #8 A m21 | claude-fable-5-1 | 4 | 205 | $0.01212 | 4 |  |
| 2026-10-24 06:26 | 3534 | check arm 2 fable–fable #8 m10 | claude-haiku-5-5 | 1347 | 70 | $0.00017 | 1.8 |  |
| 2026-10-24 06:26 | 3535 | check arm 1 fable–fable #8 m21 | claude-haiku-5-5 | 326 | 61 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 3536 | subject arm 1 sonnet–sonnet #8 B m30 | claude-sonnet-5-5 | 4 | 18 | $0.00441 | 0.9 |  |
| 2026-10-24 06:26 | 3537 | check arm 1 sonnet–sonnet #8 m30 | claude-haiku-5-5 | 351 | 59 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 3538 | subject arm 1 fable–fable #8 B m22 | claude-fable-5-1 | 4 | 60 | $0.00490 | 1.6 |  |
| 2026-10-24 06:26 | 3539 | check arm 1 fable–fable #8 m22 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 3540 | subject arm 1 sonnet–sonnet #8 A m31 | claude-sonnet-5-5 | 4 | 201 | $0.00619 | 2.7 |  |
| 2026-10-24 06:26 | 3541 | check arm 1 sonnet–sonnet #8 m31 | claude-haiku-5-5 | 448 | 67 | $0.00008 | 1.3 |  |
| 2026-10-24 06:26 | 3542 | subject arm 1 fable–fable #8 A m23 | claude-fable-5-1 | 4 | 163 | $0.01009 | 2.7 |  |
| 2026-10-24 06:26 | 3543 | subject arm 1 sonnet–sonnet #8 B m32 | claude-sonnet-5-5 | 4 | 62 | $0.00505 | 1.2 |  |
| 2026-10-24 06:26 | 3544 | check arm 1 fable–fable #8 m23 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.9 |  |
| 2026-10-24 06:26 | 3545 | check arm 1 sonnet–sonnet #8 m32 | claude-haiku-5-5 | 492 | 61 | $0.00008 | 0.7 |  |
| 2026-10-24 06:26 | 3546 | subject arm 1 sonnet–sonnet #8 A m33 | claude-sonnet-5-5 | 4 | 22 | $0.00476 | 1.3 |  |
| 2026-10-24 06:26 | 3547 | check arm 1 sonnet–sonnet #8 m33 | claude-haiku-5-5 | 399 | 51 | $0.00007 | 1.6 |  |
| 2026-10-24 06:26 | 3548 | subject arm 1 fable–fable #8 B m24 | claude-fable-5-1 | 4 | 202 | $0.01204 | 4.3 |  |
| 2026-10-24 06:26 | 3549 | check arm 1 fable–fable #8 m24 | claude-haiku-5-5 | 387 | 81 | $0.00008 | 0.7 |  |
| 2026-10-24 06:26 | 3550 | subject arm 1 sonnet–sonnet #8 B m34 | claude-sonnet-5-5 | 4 | 65 | $0.00498 | 1.3 |  |
| 2026-10-24 06:26 | 3551 | check arm 1 sonnet–sonnet #8 m34 | claude-haiku-5-5 | 402 | 69 | $0.00007 | 2.2 |  |
| 2026-10-24 06:26 | 3552 | subject arm 1 fable–fable #8 A m25 | claude-fable-5-1 | 4 | 132 | $0.00927 | 2.2 |  |
| 2026-10-24 06:26 | 3553 | subject arm 1 sonnet–sonnet #8 A m35 | claude-sonnet-5-5 | 4 | 36 | $0.00471 | 1 |  |
| 2026-10-24 06:26 | 3554 | check arm 1 fable–fable #8 m25 | claude-haiku-5-5 | 408 | 69 | $0.00008 | 0.9 |  |
| 2026-10-24 06:26 | 3555 | check arm 1 sonnet–sonnet #8 m35 | claude-haiku-5-5 | 416 | 65 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 3556 | subject arm 1 sonnet–sonnet #8 B m36 | claude-sonnet-5-5 | 4 | 35 | $0.00474 | 1 |  |
| 2026-10-24 06:26 | 3557 | subject arm 1 fable–fable #8 B m26 | claude-fable-5-1 | 4 | 137 | $0.00979 | 2.7 |  |
| 2026-10-24 06:26 | 3558 | check arm 1 sonnet–sonnet #8 m36 | claude-haiku-5-5 | 386 | 66 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 3559 | check arm 1 fable–fable #8 m26 | claude-haiku-5-5 | 350 | 56 | $0.00006 | 2.3 |  |
| 2026-10-24 06:26 | 3560 | subject arm 1 sonnet–sonnet #8 A m37 | claude-sonnet-5-5 | 4 | 59 | $0.00492 | 1.3 |  |
| 2026-10-24 06:26 | 3561 | check arm 1 sonnet–sonnet #8 m37 | claude-haiku-5-5 | 409 | 86 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 3562 | subject arm 1 fable–fable #8 A m27 | claude-fable-5-1 | 4 | 145 | $0.00948 | 2.5 |  |
| 2026-10-24 06:26 | 3563 | check arm 1 fable–fable #8 m27 | claude-haiku-5-5 | 329 | 59 | $0.00006 | 1 |  |
| 2026-10-24 06:26 | 3564 | subject arm 2 fable–fable #8 A m11 | claude-fable-5-1 | 4 | 1801 | $0.10485 | 34.3 |  |
| 2026-10-24 06:26 | 3565 | subject arm 1 sonnet–sonnet #8 B m38 | claude-sonnet-5-5 | 4 | 46 | $0.00486 | 1.1 |  |
| 2026-10-24 06:26 | 3566 | check arm 2 fable–fable #8 m11 | claude-haiku-5-5 | 1830 | 79 | $0.00022 | 1.1 |  |
| 2026-10-24 06:26 | 3567 | check arm 1 sonnet–sonnet #8 m38 | claude-haiku-5-5 | 420 | 59 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 3568 | subject arm 1 sonnet–sonnet #8 A m39 | claude-sonnet-5-5 | 4 | 24 | $0.00467 | 0.8 |  |
| 2026-10-24 06:26 | 3569 | check arm 1 sonnet–sonnet #8 m39 | claude-haiku-5-5 | 385 | 69 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 3570 | subject arm 1 fable–fable #8 B m28 | claude-fable-5-1 | 4 | 243 | $0.01412 | 5.1 |  |
| 2026-10-24 06:26 | 3571 | check arm 1 fable–fable #8 m28 | claude-haiku-5-5 | 329 | 42 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 3572 | subject arm 1 sonnet–sonnet #8 B m40 | claude-sonnet-5-5 | 4 | 16 | $0.00451 | 1 |  |
| 2026-10-24 06:26 | 3573 | check arm 1 sonnet–sonnet #8 m40 | claude-haiku-5-5 | 355 | 61 | $0.00007 | 2.4 |  |
| 2026-10-24 06:26 | 3574 | subject arm 1 fable–fable #8 A m29 | claude-fable-5-1 | 4 | 120 | $0.00797 | 2.2 |  |
| 2026-10-24 06:26 | 3575 | subject arm 1 sonnet–sonnet #8 A m41 | claude-sonnet-5-5 | 4 | 12 | $0.00441 | 0.7 |  |
| 2026-10-24 06:26 | 3576 | check arm 1 fable–fable #8 m29 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 3577 | check arm 1 sonnet–sonnet #8 m41 | claude-haiku-5-5 | 343 | 64 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 3578 | subject arm 1 sonnet–sonnet #8 B m42 | claude-sonnet-5-5 | 4 | 64 | $0.00490 | 1.3 |  |
| 2026-10-24 06:26 | 3579 | subject arm 1 fable–fable #8 B m30 | claude-fable-5-1 | 4 | 121 | $0.00802 | 2.2 |  |
| 2026-10-24 06:26 | 3580 | check arm 1 fable–fable #8 m30 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 3581 | check arm 1 sonnet–sonnet #8 m42 | claude-haiku-5-5 | 391 | 58 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 3582 | subject arm 1 sonnet–sonnet #8 A m43 | claude-sonnet-5-5 | 4 | 15 | $0.00454 | 0.8 |  |
| 2026-10-24 06:26 | 3583 | check arm 1 sonnet–sonnet #8 m43 | claude-haiku-5-5 | 394 | 65 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 3584 | subject arm 1 fable–fable #8 A m31 | claude-fable-5-1 | 4 | 178 | $0.01088 | 3 |  |
| 2026-10-24 06:26 | 3585 | check arm 1 fable–fable #8 m31 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1 |  |
| 2026-10-24 06:26 | 3586 | subject arm 1 sonnet–sonnet #8 B m44 | claude-sonnet-5-5 | 4 | 9 | $0.00449 | 0.9 |  |
| 2026-10-24 06:26 | 3587 | subject arm 2 fable–fable #8 B m12 | claude-fable-5-1 | 4 | 1056 | $0.07373 | 21.5 |  |
| 2026-10-24 06:26 | 3588 | check arm 1 sonnet–sonnet #8 m44 | claude-haiku-5-5 | 339 | 51 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 3589 | check arm 2 fable–fable #8 m12 | claude-haiku-5-5 | 1839 | 81 | $0.00022 | 1.6 |  |
| 2026-10-24 06:26 | 3590 | subject arm 1 sonnet–sonnet #8 A m45 | claude-sonnet-5-5 | 4 | 6 | $0.00433 | 0.8 |  |
| 2026-10-24 06:26 | 3591 | subject arm 1 fable–fable #8 B m32 | claude-fable-5-1 | 4 | 142 | $0.00908 | 3.2 |  |
| 2026-10-24 06:26 | 3592 | check arm 1 fable–fable #8 m32 | claude-haiku-5-5 | 325 | 43 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 3593 | check arm 1 sonnet–sonnet #8 m45 | claude-haiku-5-5 | 330 | 55 | $0.00006 | 1.3 |  |
| 2026-10-24 06:26 | 3594 | subject arm 1 sonnet–sonnet #8 B m46 | claude-sonnet-5-5 | 4 | 32 | $0.00457 | 1.3 |  |
| 2026-10-24 06:26 | 3595 | check arm 1 sonnet–sonnet #8 m46 | claude-haiku-5-5 | 353 | 64 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 3596 | subject arm 1 fable–fable #8 A m33 | claude-fable-5-1 | 4 | 164 | $0.01013 | 3 |  |
| 2026-10-24 06:26 | 3597 | check arm 1 fable–fable #8 m33 | claude-haiku-5-5 | 325 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 3598 | subject arm 1 sonnet–sonnet #8 A m47 | claude-sonnet-5-5 | 4 | 8 | $0.00439 | 1 |  |
| 2026-10-24 06:26 | 3599 | check arm 1 sonnet–sonnet #8 m47 | claude-haiku-5-5 | 355 | 57 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 3600 | subject arm 1 sonnet–sonnet #8 B m48 | claude-sonnet-5-5 | 4 | 8 | $0.00440 | 0.9 |  |
| 2026-10-24 06:26 | 3601 | check arm 1 sonnet–sonnet #8 m48 | claude-haiku-5-5 | 331 | 55 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 3602 | subject arm 1 fable–fable #8 B m34 | claude-fable-5-1 | 4 | 241 | $0.01398 | 3.9 |  |
| 2026-10-24 06:26 | 3603 | check arm 1 fable–fable #8 m34 | claude-haiku-5-5 | 399 | 65 | $0.00007 | 1.3 |  |
| 2026-10-24 06:26 | 3604 | subject arm 1 sonnet–sonnet #8 A m49 | claude-sonnet-5-5 | 4 | 141 | $0.00567 | 2.2 |  |
| 2026-10-24 06:26 | 3605 | check arm 1 sonnet–sonnet #8 m49 | claude-haiku-5-5 | 340 | 61 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 3606 | subject arm 1 sonnet–sonnet #8 B m50 | claude-sonnet-5-5 | 4 | 13 | $0.00442 | 1 |  |
| 2026-10-24 06:26 | 3607 | check arm 1 sonnet–sonnet #8 m50 | claude-haiku-5-5 | 345 | 58 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 3608 | subject arm 1 fable–fable #8 A m35 | claude-fable-5-1 | 4 | 266 | $0.01616 | 5.8 |  |
| 2026-10-24 06:26 | 3609 | check arm 1 fable–fable #8 m35 | claude-haiku-5-5 | 596 | 70 | $0.00009 | 0.8 |  |
| 2026-10-24 06:26 | 3610 | subject arm 1 sonnet–sonnet #8 A m51 | claude-sonnet-5-5 | 4 | 128 | $0.00558 | 2.1 |  |
| 2026-10-24 06:26 | 3611 | check arm 1 sonnet–sonnet #8 m51 | claude-haiku-5-5 | 334 | 66 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 3612 | subject arm 1 fable–fable #8 B m36 | claude-fable-5-1 | 4 | 146 | $0.01262 | 2.8 |  |
| 2026-10-24 06:26 | 3613 | check arm 1 fable–fable #8 m36 | claude-haiku-5-5 | 569 | 58 | $0.00009 | 1.4 |  |
| 2026-10-24 06:26 | 3614 | subject arm 1 sonnet–sonnet #8 B m52 | claude-sonnet-5-5 | 4 | 6 | $0.00434 | 0.9 |  |
| 2026-10-24 06:26 | 3615 | check arm 1 sonnet–sonnet #8 m52 | claude-haiku-5-5 | 327 | 48 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 3616 | subject arm 1 sonnet–sonnet #8 A m53 | claude-sonnet-5-5 | 4 | 6 | $0.00432 | 0.9 |  |
| 2026-10-24 06:26 | 3617 | check arm 1 sonnet–sonnet #8 m53 | claude-haiku-5-5 | 327 | 51 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 3618 | subject arm 1 fable–fable #8 A m37 | claude-fable-5-1 | 4 | 233 | $0.01665 | 5.1 |  |
| 2026-10-24 06:26 | 3619 | check arm 1 fable–fable #8 m37 | claude-haiku-5-5 | 372 | 66 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 3620 | subject arm 1 sonnet–sonnet #8 B m54 | claude-sonnet-5-5 | 4 | 6 | $0.00432 | 0.9 |  |
| 2026-10-24 06:26 | 3621 | check arm 1 sonnet–sonnet #8 m54 | claude-haiku-5-5 | 327 | 50 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 3622 | subject arm 2 fable–fable #8 A m13 | claude-fable-5-1 | 4 | 2099 | $0.12616 | 40.2 |  |
| 2026-10-24 06:26 | 3623 | check arm 2 fable–fable #8 m13 | claude-haiku-5-5 | 2024 | 72 | $0.00024 | 1.6 |  |
| 2026-10-24 06:26 | 3624 | subject arm 1 fable–fable #8 B m38 | claude-fable-5-1 | 4 | 177 | $0.01144 | 3.1 |  |
| 2026-10-24 06:26 | 3625 | check arm 1 fable–fable #8 m38 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.9 |  |
| 2026-10-24 06:26 | 3626 | subject arm 1 sonnet–sonnet #8 A m55 | claude-sonnet-5-5 | 4 | 213 | $0.00640 | 2.9 |  |
| 2026-10-24 06:26 | 3627 | check arm 1 sonnet–sonnet #8 m55 | claude-haiku-5-5 | 420 | 77 | $0.00008 | 0.7 |  |
| 2026-10-24 06:26 | 3628 | subject arm 1 sonnet–sonnet #8 B m56 | claude-sonnet-5-5 | 4 | 18 | $0.00468 | 1 |  |
| 2026-10-24 06:26 | 3629 | check arm 1 sonnet–sonnet #8 m56 | claude-haiku-5-5 | 432 | 59 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 3630 | subject arm 1 fable–fable #8 A m39 | claude-fable-5-1 | 4 | 294 | $0.01677 | 4.8 |  |
| 2026-10-24 06:26 | 3631 | check arm 1 fable–fable #8 m39 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.9 |  |
| 2026-10-24 06:26 | 3632 | subject arm 1 sonnet–sonnet #8 A m57 | claude-sonnet-5-5 | 4 | 13 | $0.00466 | 0.9 |  |
| 2026-10-24 06:26 | 3633 | check arm 1 sonnet–sonnet #8 m57 | claude-haiku-5-5 | 346 | 59 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 3634 | subject arm 1 sonnet–sonnet #8 B m58 | claude-sonnet-5-5 | 4 | 126 | $0.00560 | 1.9 |  |
| 2026-10-24 06:26 | 3635 | check arm 1 sonnet–sonnet #8 m58 | claude-haiku-5-5 | 346 | 60 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 3636 | subject arm 1 fable–fable #8 B m40 | claude-fable-5-1 | 4 | 318 | $0.01797 | 6.5 |  |
| 2026-10-24 06:26 | 3637 | check arm 1 fable–fable #8 m40 | claude-haiku-5-5 | 381 | 71 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 3638 | subject arm 1 sonnet–sonnet #8 A m59 | claude-sonnet-5-5 | 4 | 9 | $0.00443 | 4.6 |  |
| 2026-10-24 06:26 | 3639 | check arm 1 sonnet–sonnet #8 m59 | claude-haiku-5-5 | 342 | 58 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 3640 | subject arm 1 fable–fable #8 A m41 | claude-fable-5-1 | 4 | 124 | $0.00892 | 2.7 |  |
| 2026-10-24 06:26 | 3641 | check arm 1 fable–fable #8 m41 | claude-haiku-5-5 | 397 | 58 | $0.00007 | 0.6 |  |
| 2026-10-24 06:26 | 3642 | subject arm 1 sonnet–sonnet #8 B m60 | claude-sonnet-5-5 | 4 | 168 | $0.00601 | 2.3 |  |
| 2026-10-24 06:26 | 3643 | subject arm 1 fable–fable #8 B m42 | claude-fable-5-1 | 4 | 49 | $0.00537 | 1.3 |  |
| 2026-10-24 06:26 | 3644 | check arm 1 sonnet–sonnet #8 m60 | claude-haiku-5-5 | 390 | 62 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 3645 | check arm 1 fable–fable #8 m42 | claude-haiku-5-5 | 345 | 55 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 3646 | tags 1 arm 1 sonnet–sonnet #8 m11–20 | claude-haiku-5-5 | 11888 | 680 | $0.00153 | 2.2 |  |
| 2026-10-24 06:26 | 3647 | tags 1 arm 1 sonnet–sonnet #8 m1–10 | claude-haiku-5-5 | 8715 | 680 | $0.00121 | 2.3 |  |
| 2026-10-24 06:26 | 3648 | tags 2 arm 1 sonnet–sonnet #8 m1–10 | claude-haiku-5-5 | 8715 | 680 | $0.00121 | 2.4 |  |
| 2026-10-24 06:26 | 3649 | subject arm 1 fable–fable #8 A m43 | claude-fable-5-1 | 4 | 65 | $0.00554 | 1.4 |  |
| 2026-10-24 06:26 | 3650 | check arm 1 fable–fable #8 m43 | claude-haiku-5-5 | 329 | 56 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 3651 | tags 2 arm 1 sonnet–sonnet #8 m11–20 | claude-haiku-5-5 | 11888 | 680 | $0.00153 | 2.3 |  |
| 2026-10-24 06:26 | 3652 | tags 1 arm 1 sonnet–sonnet #8 m21–30 | claude-haiku-5-5 | 4626 | 680 | $0.00080 | 2.2 |  |
| 2026-10-24 06:26 | 3653 | tags 2 arm 1 sonnet–sonnet #8 m21–30 | claude-haiku-5-5 | 4626 | 680 | $0.00080 | 2.3 |  |
| 2026-10-24 06:26 | 3654 | subject arm 1 fable–fable #8 B m44 | claude-fable-5-1 | 4 | 86 | $0.00639 | 1.8 |  |
| 2026-10-24 06:26 | 3655 | subject arm 2 opus–opus #8 A m1 | claude-opus-5-5 | 59 | 525 | $0.01074 | 7.6 |  |
| 2026-10-24 06:26 | 3656 | check arm 1 fable–fable #8 m44 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.3 |  |
| 2026-10-24 06:26 | 3657 | check arm 2 opus–opus #8 m1 | claude-haiku-5-5 | 811 | 76 | $0.00012 | 0.8 |  |
| 2026-10-24 06:26 | 3658 | tags 2 arm 1 sonnet–sonnet #8 m31–40 | claude-haiku-5-5 | 1553 | 680 | $0.00050 | 2.3 |  |
| 2026-10-24 06:26 | 3659 | tags 1 arm 1 sonnet–sonnet #8 m41–50 | claude-haiku-5-5 | 1255 | 680 | $0.00047 | 2.1 |  |
| 2026-10-24 06:26 | 3660 | tags 1 arm 1 sonnet–sonnet #8 m31–40 | claude-haiku-5-5 | 1553 | 1194 | $0.00075 | 4.5 |  |
| 2026-10-24 06:26 | 3661 | subject arm 1 fable–fable #8 A m45 | claude-fable-5-1 | 4 | 140 | $0.00909 | 3.2 |  |
| 2026-10-24 06:26 | 3662 | check arm 1 fable–fable #8 m45 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 3663 | subject arm 2 fable–fable #8 B m14 | claude-fable-5-1 | 4 | 2169 | $0.13219 | 43.5 |  |
| 2026-10-24 06:26 | 3664 | check arm 2 fable–fable #8 m14 | claude-haiku-5-5 | 2466 | 81 | $0.00029 | 0.9 |  |
| 2026-10-24 06:26 | 3665 | tags 1 arm 1 sonnet–sonnet #8 m51–60 | claude-haiku-5-5 | 1315 | 680 | $0.00047 | 2.3 |  |
| 2026-10-24 06:26 | 3666 | tags 2 arm 1 sonnet–sonnet #8 m41–50 | claude-haiku-5-5 | 1255 | 680 | $0.00047 | 2.8 |  |
| 2026-10-24 06:26 | 3667 | subject arm 1 fable–fable #8 B m46 | claude-fable-5-1 | 4 | 85 | $0.00635 | 1.8 |  |
| 2026-10-24 06:26 | 3668 | tags 2 arm 1 sonnet–sonnet #8 m51–60 | claude-haiku-5-5 | 1315 | 680 | $0.00047 | 2.2 |  |
| 2026-10-24 06:26 | 3669 | check arm 1 fable–fable #8 m46 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 3670 | tags referee arm 1 sonnet–sonnet #8 m21–30 | claude-opus-5-5 | 4626 | 680 | $0.03210 | 4.8 |  |
| 2026-10-24 06:26 | 3671 | subject arm 1 fable–fable #8 A m47 | claude-fable-5-1 | 4 | 158 | $0.01000 | 3.1 |  |
| 2026-10-24 06:26 | 3672 | subject arm 2 opus–opus #8 B m2 | claude-opus-5-5 | 4 | 978 | $0.02227 | 13.5 |  |
| 2026-10-24 06:26 | 3673 | check arm 2 opus–opus #8 m2 | claude-haiku-5-5 | 1551 | 66 | $0.00019 | 0.7 |  |
| 2026-10-24 06:26 | 3674 | tags referee arm 1 sonnet–sonnet #8 m31–40 | claude-opus-5-5 | 1553 | 680 | $0.01981 | 5.5 |  |
| 2026-10-24 06:26 | 3675 | check arm 1 fable–fable #8 m47 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 1.7 |  |
| 2026-10-24 06:26 | 3676 | tags referee arm 1 sonnet–sonnet #8 m41–50 | claude-opus-5-5 | 1255 | 680 | $0.01862 | 5.4 |  |
| 2026-10-24 06:26 | 3677 | subject arm 1 fable–fable #8 B m48 | claude-fable-5-1 | 4 | 54 | $0.00480 | 1.7 |  |
| 2026-10-24 06:26 | 3678 | check arm 1 fable–fable #8 m48 | claude-haiku-5-5 | 329 | 42 | $0.00005 | 1.2 |  |
| 2026-10-24 06:26 | 3679 | subject arm 1 fable–fable #8 A m49 | claude-fable-5-1 | 4 | 90 | $0.00660 | 1.9 |  |
| 2026-10-24 06:26 | 3680 | check arm 1 fable–fable #8 m49 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 3681 | subject arm 1 fable–fable #8 B m50 | claude-fable-5-1 | 4 | 100 | $0.00710 | 2.3 |  |
| 2026-10-24 06:26 | 3682 | check arm 1 fable–fable #8 m50 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.1 |  |
| 2026-10-24 06:26 | 3683 | subject arm 1 fable–fable #8 A m51 | claude-fable-5-1 | 4 | 82 | $0.00621 | 1.7 |  |
| 2026-10-24 06:26 | 3684 | check arm 1 fable–fable #8 m51 | claude-haiku-5-5 | 329 | 42 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 3685 | subject arm 2 opus–opus #8 A m3 | claude-opus-5-5 | 4 | 1477 | $0.03601 | 19.2 |  |
| 2026-10-24 06:26 | 3686 | check arm 2 opus–opus #8 m3 | claude-haiku-5-5 | 1945 | 83 | $0.00024 | 0.7 |  |
| 2026-10-24 06:26 | 3687 | subject arm 1 fable–fable #8 B m52 | claude-fable-5-1 | 4 | 95 | $0.00686 | 2.2 |  |
| 2026-10-24 06:26 | 3688 | subject arm 2 fable–fable #8 A m15 | claude-fable-5-1 | 4 | 1659 | $0.11238 | 31.9 |  |
| 2026-10-24 06:26 | 3689 | check arm 1 fable–fable #8 m52 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 3690 | check arm 2 fable–fable #8 m15 | claude-haiku-5-5 | 2294 | 67 | $0.00026 | 0.8 |  |
| 2026-10-24 06:26 | 3691 | subject arm 1 fable–fable #8 A m53 | claude-fable-5-1 | 4 | 95 | $0.00686 | 1.8 |  |
| 2026-10-24 06:26 | 3692 | check arm 1 fable–fable #8 m53 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 3693 | subject arm 1 fable–fable #8 B m54 | claude-fable-5-1 | 4 | 113 | $0.00776 | 2.5 |  |
| 2026-10-24 06:26 | 3694 | check arm 1 fable–fable #8 m54 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.9 |  |
| 2026-10-24 06:26 | 3695 | subject arm 1 fable–fable #8 A m55 | claude-fable-5-1 | 4 | 80 | $0.00611 | 1.7 |  |
| 2026-10-24 06:26 | 3696 | check arm 1 fable–fable #8 m55 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 3697 | subject arm 1 fable–fable #8 B m56 | claude-fable-5-1 | 4 | 89 | $0.00656 | 1.6 |  |
| 2026-10-24 06:26 | 3698 | check arm 1 fable–fable #8 m56 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.3 |  |
| 2026-10-24 06:26 | 3699 | subject arm 2 opus–opus #8 B m4 | claude-opus-5-5 | 4 | 1627 | $0.04081 | 22.5 |  |
| 2026-10-24 06:26 | 3700 | subject arm 1 fable–fable #8 A m57 | claude-fable-5-1 | 4 | 110 | $0.00762 | 2.2 |  |
| 2026-10-24 06:26 | 3701 | check arm 2 opus–opus #8 m4 | claude-haiku-5-5 | 2181 | 77 | $0.00026 | 2.1 |  |
| 2026-10-24 06:26 | 3702 | check arm 1 fable–fable #8 m57 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 3703 | subject arm 2 fable–fable #8 B m16 | claude-fable-5-1 | 4 | 1142 | $0.08464 | 23.1 |  |
| 2026-10-24 06:26 | 3704 | check arm 2 fable–fable #8 m16 | claude-haiku-5-5 | 1785 | 80 | $0.00022 | 0.8 |  |
| 2026-10-24 06:26 | 3705 | subject arm 1 fable–fable #8 B m58 | claude-fable-5-1 | 4 | 72 | $0.00572 | 1.4 |  |
| 2026-10-24 06:26 | 3706 | check arm 1 fable–fable #8 m58 | claude-haiku-5-5 | 329 | 42 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 3707 | subject arm 1 fable–fable #8 A m59 | claude-fable-5-1 | 4 | 215 | $0.01287 | 3.5 |  |
| 2026-10-24 06:26 | 3708 | check arm 1 fable–fable #8 m59 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 3709 | subject arm 2 fable–fable #8 A m17 | claude-fable-5-1 | 4 | 523 | $0.04761 | 10.4 |  |
| 2026-10-24 06:26 | 3710 | check arm 2 fable–fable #8 m17 | claude-haiku-5-5 | 1190 | 70 | $0.00015 | 1.2 |  |
| 2026-10-24 06:26 | 3711 | subject arm 1 fable–fable #8 B m60 | claude-fable-5-1 | 4 | 211 | $0.01267 | 4.4 |  |
| 2026-10-24 06:26 | 3712 | tags 1 arm 2 fable–fable #8 m11–17 | claude-haiku-5-5 | 7085 | 479 | $0.00095 | 1.9 |  |
| 2026-10-24 06:26 | 3713 | tags 2 arm 2 fable–fable #8 m1–10 | claude-haiku-5-5 | 9465 | 680 | $0.00129 | 2.3 |  |
| 2026-10-24 06:26 | 3714 | check arm 1 fable–fable #8 m60 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.2 |  |
| 2026-10-24 06:26 | 3715 | tags 1 arm 2 fable–fable #8 m1–10 | claude-haiku-5-5 | 9465 | 680 | $0.00129 | 3 |  |
| 2026-10-24 06:26 | 3716 | tags 2 arm 2 fable–fable #8 m11–17 | claude-haiku-5-5 | 7085 | 479 | $0.00095 | 1.8 |  |
| 2026-10-24 06:26 | 3717 | tags 1 arm 1 fable–fable #8 m1–10 | claude-haiku-5-5 | 7797 | 680 | $0.00112 | 2.4 |  |
| 2026-10-24 06:26 | 3718 | tags 2 arm 1 fable–fable #8 m1–10 | claude-haiku-5-5 | 7797 | 680 | $0.00112 | 2.5 |  |
| 2026-10-24 06:26 | 3719 | subject arm 2 opus–opus #9 A m1 | claude-opus-5-5 | 59 | 484 | $0.00992 | 7.5 |  |
| 2026-10-24 06:26 | 3720 | subject arm 2 opus–opus #8 A m5 | claude-opus-5-5 | 4 | 1929 | $0.04818 | 25 |  |
| 2026-10-24 06:26 | 3721 | check arm 2 opus–opus #9 m1 | claude-haiku-5-5 | 770 | 61 | $0.00011 | 0.9 |  |
| 2026-10-24 06:26 | 3722 | check arm 2 opus–opus #8 m5 | claude-haiku-5-5 | 2127 | 90 | $0.00026 | 1.4 |  |
| 2026-10-24 06:26 | 3723 | tags 1 arm 1 fable–fable #8 m11–20 | claude-haiku-5-5 | 1168 | 680 | $0.00046 | 2.1 |  |
| 2026-10-24 06:26 | 3724 | tags 2 arm 1 fable–fable #8 m11–20 | claude-haiku-5-5 | 1168 | 680 | $0.00046 | 2.4 |  |
| 2026-10-24 06:26 | 3725 | tags 1 arm 1 fable–fable #8 m21–30 | claude-haiku-5-5 | 1208 | 680 | $0.00046 | 2.2 |  |
| 2026-10-24 06:26 | 3726 | subject arm 1 fable–fable #9 A m1 | claude-fable-5-1 | 40 | 583 | $0.02955 | 10.7 |  |
| 2026-10-24 06:26 | 3727 | check arm 1 fable–fable #9 m1 | claude-haiku-5-5 | 779 | 85 | $0.00012 | 0.7 |  |
| 2026-10-24 06:26 | 3728 | tags 2 arm 1 fable–fable #8 m21–30 | claude-haiku-5-5 | 1208 | 680 | $0.00046 | 2.5 |  |
| 2026-10-24 06:26 | 3729 | tags 1 arm 1 fable–fable #8 m31–40 | claude-haiku-5-5 | 1490 | 680 | $0.00049 | 2.2 |  |
| 2026-10-24 06:26 | 3730 | tags 2 arm 1 fable–fable #8 m31–40 | claude-haiku-5-5 | 1490 | 680 | $0.00049 | 2.2 |  |
| 2026-10-24 06:26 | 3731 | tags 1 arm 1 fable–fable #8 m41–50 | claude-haiku-5-5 | 1200 | 680 | $0.00046 | 2.3 |  |
| 2026-10-24 06:26 | 3732 | tags 2 arm 1 fable–fable #8 m41–50 | claude-haiku-5-5 | 1200 | 680 | $0.00046 | 2.3 |  |
| 2026-10-24 06:26 | 3733 | tags 1 arm 1 fable–fable #8 m51–60 | claude-haiku-5-5 | 1132 | 680 | $0.00045 | 2.3 |  |
| 2026-10-24 06:26 | 3734 | subject arm 2 opus–opus #9 B m2 | claude-opus-5-5 | 501 | 981 | $0.02162 | 13.3 |  |
| 2026-10-24 06:26 | 3735 | check arm 2 opus–opus #9 m2 | claude-haiku-5-5 | 1387 | 65 | $0.00017 | 0.7 |  |
| 2026-10-24 06:26 | 3736 | tags 2 arm 1 fable–fable #8 m51–60 | claude-haiku-5-5 | 1132 | 680 | $0.00045 | 2.1 |  |
| 2026-10-24 06:26 | 3737 | tags referee arm 2 fable–fable #8 m11–17 | claude-opus-5-5 | 7085 | 829 | $0.04492 | 8.2 |  |
| 2026-10-24 06:26 | 3738 | subject arm 2 opus–opus #8 B m6 | claude-opus-5-5 | 4 | 1926 | $0.04803 | 24 |  |
| 2026-10-24 06:26 | 3739 | check arm 2 opus–opus #8 m6 | claude-haiku-5-5 | 2205 | 66 | $0.00025 | 0.8 |  |
| 2026-10-24 06:26 | 3740 | subject arm 2 opus–opus #9 A m3 | claude-opus-5-5 | 4 | 1696 | $0.03957 | 19.6 |  |
| 2026-10-24 06:26 | 3741 | check arm 2 opus–opus #9 m3 | claude-haiku-5-5 | 1838 | 62 | $0.00021 | 0.8 |  |
| 2026-10-24 06:26 | 3742 | subject arm 1 fable–fable #9 B m2 | claude-fable-5-1 | 491 | 1725 | $0.09116 | 34.7 |  |
| 2026-10-24 06:26 | 3743 | check arm 1 fable–fable #9 m2 | claude-haiku-5-5 | 1727 | 65 | $0.00021 | 0.7 |  |
| 2026-10-24 06:26 | 3744 | subject arm 2 opus–opus #8 A m7 | claude-opus-5-5 | 4 | 2399 | $0.05808 | 29.9 |  |
| 2026-10-24 06:26 | 3745 | check arm 2 opus–opus #8 m7 | claude-haiku-5-5 | 2513 | 81 | $0.00029 | 1 |  |
| 2026-10-24 06:26 | 3746 | subject arm 2 opus–opus #9 B m4 | claude-opus-5-5 | 4 | 2069 | $0.05150 | 28.1 |  |
| 2026-10-24 06:26 | 3747 | check arm 2 opus–opus #9 m4 | claude-haiku-5-5 | 2105 | 76 | $0.00025 | 0.6 |  |
| 2026-10-24 06:26 | 3748 | subject arm 2 opus–opus #8 B m8 | claude-opus-5-5 | 4 | 1770 | $0.04720 | 22.8 |  |
| 2026-10-24 06:26 | 3749 | check arm 2 opus–opus #8 m8 | claude-haiku-5-5 | 2420 | 90 | $0.00029 | 1.1 |  |
| 2026-10-24 06:26 | 3750 | subject arm 1 fable–fable #9 A m3 | claude-fable-5-1 | 4 | 2283 | $0.13229 | 43 |  |
| 2026-10-24 06:26 | 3751 | check arm 1 fable–fable #9 m3 | claude-haiku-5-5 | 2564 | 70 | $0.00029 | 0.8 |  |
| 2026-10-24 06:26 | 3752 | subject arm 2 opus–opus #9 A m5 | claude-opus-5-5 | 4 | 1445 | $0.03809 | 18.4 |  |
| 2026-10-24 06:26 | 3753 | check arm 2 opus–opus #9 m5 | claude-haiku-5-5 | 2309 | 69 | $0.00027 | 0.8 |  |
| 2026-10-24 06:26 | 3754 | subject arm 2 opus–opus #8 A m9 | claude-opus-5-5 | 4 | 2184 | $0.05523 | 28 |  |
| 2026-10-24 06:26 | 3755 | subject arm 2 opus–opus #9 B m6 | claude-opus-5-5 | 4 | 1869 | $0.04777 | 23.7 |  |
| 2026-10-24 06:26 | 3756 | check arm 2 opus–opus #8 m9 | claude-haiku-5-5 | 2232 | 64 | $0.00026 | 0.7 |  |
| 2026-10-24 06:26 | 3757 | check arm 2 opus–opus #9 m6 | claude-haiku-5-5 | 2738 | 83 | $0.00032 | 0.8 |  |
| 2026-10-24 06:26 | 3758 | subject arm 1 fable–fable #9 B m4 | claude-fable-5-1 | 4 | 2011 | $0.13479 | 36.3 |  |
| 2026-10-24 06:26 | 3759 | check arm 1 fable–fable #9 m4 | claude-haiku-5-5 | 2823 | 67 | $0.00032 | 1.5 |  |
| 2026-10-24 06:26 | 3760 | subject arm 2 opus–opus #8 B m10 | claude-opus-5-5 | 4 | 1209 | $0.03502 | 16.9 |  |
| 2026-10-24 06:26 | 3761 | check arm 2 opus–opus #8 m10 | claude-haiku-5-5 | 2106 | 68 | $0.00024 | 0.8 |  |
| 2026-10-24 06:26 | 3762 | subject arm 2 opus–opus #9 A m7 | claude-opus-5-5 | 4 | 2142 | $0.05555 | 25.8 |  |
| 2026-10-24 06:26 | 3763 | check arm 2 opus–opus #9 m7 | claude-haiku-5-5 | 2712 | 82 | $0.00031 | 0.9 |  |
| 2026-10-24 06:26 | 3764 | subject arm 2 opus–opus #8 A m11 | claude-opus-5-5 | 4 | 1183 | $0.03406 | 13.6 |  |
| 2026-10-24 06:26 | 3765 | check arm 2 opus–opus #8 m11 | claude-haiku-5-5 | 1590 | 74 | $0.00020 | 0.8 |  |
| 2026-10-24 06:26 | 3766 | subject arm 2 opus–opus #8 B m12 | claude-opus-5-5 | 4 | 673 | $0.02147 | 9.1 |  |
| 2026-10-24 06:26 | 3767 | check arm 2 opus–opus #8 m12 | claude-haiku-5-5 | 1075 | 76 | $0.00015 | 1.4 |  |
| 2026-10-24 06:26 | 3768 | subject arm 2 opus–opus #8 A m13 | claude-opus-5-5 | 4 | 102 | $0.00764 | 2.4 |  |
| 2026-10-24 06:26 | 3769 | tags 1 arm 2 opus–opus #8 m11–12 | claude-haiku-5-5 | 2533 | 144 | $0.00033 | 0.8 |  |
| 2026-10-24 06:26 | 3770 | tags 2 arm 2 opus–opus #8 m1–10 | claude-haiku-5-5 | 9917 | 680 | $0.00133 | 2.3 |  |
| 2026-10-24 06:26 | 3771 | tags 1 arm 2 opus–opus #8 m1–10 | claude-haiku-5-5 | 9917 | 680 | $0.00133 | 2.3 |  |
| 2026-10-24 06:26 | 3772 | tags 2 arm 2 opus–opus #8 m11–12 | claude-haiku-5-5 | 2533 | 144 | $0.00033 | 0.8 |  |
| 2026-10-24 06:26 | 3773 | subject arm 1 fable–fable #9 A m5 | claude-fable-5-1 | 4 | 2517 | $0.15760 | 46.9 |  |
| 2026-10-24 06:26 | 3774 | check arm 1 fable–fable #9 m5 | claude-haiku-5-5 | 2688 | 84 | $0.00031 | 0.8 |  |
| 2026-10-24 06:26 | 3775 | tags referee arm 2 opus–opus #8 m1–10 | claude-opus-5-5 | 9917 | 680 | $0.05327 | 4.8 |  |
| 2026-10-24 06:26 | 3776 | subject arm 2 opus–opus #9 B m8 | claude-opus-5-5 | 4 | 2510 | $0.06300 | 35.1 |  |
| 2026-10-24 06:26 | 3777 | subject arm 2 fable–fable #9 A m1 | claude-fable-5-1 | 59 | 506 | $0.02589 | 11.4 |  |
| 2026-10-24 06:26 | 3778 | check arm 2 opus–opus #9 m8 | claude-haiku-5-5 | 2623 | 76 | $0.00030 | 0.8 |  |
| 2026-10-24 06:26 | 3779 | check arm 2 fable–fable #9 m1 | claude-haiku-5-5 | 760 | 75 | $0.00011 | 0.8 |  |
| 2026-10-24 06:26 | 3780 | subject arm 2 fable–fable #9 B m2 | claude-fable-5-1 | 491 | 947 | $0.05226 | 19.7 |  |
| 2026-10-24 06:26 | 3781 | check arm 2 fable–fable #9 m2 | claude-haiku-5-5 | 1623 | 63 | $0.00019 | 0.8 |  |
| 2026-10-24 06:26 | 3782 | subject arm 2 opus–opus #9 A m9 | claude-opus-5-5 | 4 | 2318 | $0.05898 | 25.5 |  |
| 2026-10-24 06:26 | 3783 | check arm 2 opus–opus #9 m9 | claude-haiku-5-5 | 2635 | 88 | $0.00031 | 0.8 |  |
| 2026-10-24 06:26 | 3784 | subject arm 2 opus–opus #9 B m10 | claude-opus-5-5 | 4 | 474 | $0.02238 | 5.8 |  |
| 2026-10-24 06:26 | 3785 | subject arm 1 fable–fable #9 B m6 | claude-fable-5-1 | 4 | 2219 | $0.14134 | 42.6 |  |
| 2026-10-24 06:26 | 3786 | check arm 1 fable–fable #9 m6 | claude-haiku-5-5 | 2534 | 79 | $0.00029 | 0.7 |  |
| 2026-10-24 06:26 | 3787 | tags 1 arm 2 opus–opus #9 m1–9 | claude-haiku-5-5 | 9691 | 613 | $0.00128 | 3 |  |
| 2026-10-24 06:26 | 3788 | tags 2 arm 2 opus–opus #9 m1–9 | claude-haiku-5-5 | 9691 | 613 | $0.00128 | 3.1 |  |
| 2026-10-24 06:26 | 3789 | subject arm 2 sonnet–sonnet #9 A m1 | claude-sonnet-5-5 | 59 | 323 | $0.00335 | 3.8 |  |
| 2026-10-24 06:26 | 3790 | check arm 2 sonnet–sonnet #9 m1 | claude-haiku-5-5 | 649 | 59 | $0.00009 | 0.7 |  |
| 2026-10-24 06:26 | 3791 | subject arm 2 sonnet–sonnet #9 B m2 | claude-sonnet-5-5 | 380 | 495 | $0.00571 | 5.6 |  |
| 2026-10-24 06:26 | 3792 | check arm 2 sonnet–sonnet #9 m2 | claude-haiku-5-5 | 1133 | 69 | $0.00015 | 0.9 |  |
| 2026-10-24 06:26 | 3793 | subject arm 2 fable–fable #9 A m3 | claude-fable-5-1 | 4 | 1527 | $0.09343 | 28.6 |  |
| 2026-10-24 06:26 | 3794 | check arm 2 fable–fable #9 m3 | claude-haiku-5-5 | 2291 | 69 | $0.00026 | 0.6 |  |
| 2026-10-24 06:26 | 3795 | subject arm 2 sonnet–sonnet #9 A m3 | claude-sonnet-5-5 | 4 | 1003 | $0.01222 | 10.1 |  |
| 2026-10-24 06:26 | 3796 | check arm 2 sonnet–sonnet #9 m3 | claude-haiku-5-5 | 1392 | 88 | $0.00018 | 0.9 |  |
| 2026-10-24 06:26 | 3797 | subject arm 2 sonnet–sonnet #9 B m4 | claude-sonnet-5-5 | 4 | 576 | $0.00940 | 6.4 |  |
| 2026-10-24 06:26 | 3798 | check arm 2 sonnet–sonnet #9 m4 | claude-haiku-5-5 | 1473 | 70 | $0.00018 | 0.8 |  |
| 2026-10-24 06:26 | 3799 | subject arm 1 fable–fable #9 A m7 | claude-fable-5-1 | 4 | 2228 | $0.14017 | 42 |  |
| 2026-10-24 06:26 | 3800 | subject arm 2 sonnet–sonnet #9 A m5 | claude-sonnet-5-5 | 4 | 613 | $0.00921 | 7.2 |  |
| 2026-10-24 06:26 | 3801 | check arm 1 fable–fable #9 m7 | claude-haiku-5-5 | 2484 | 69 | $0.00028 | 0.8 |  |
| 2026-10-24 06:26 | 3802 | check arm 2 sonnet–sonnet #9 m5 | claude-haiku-5-5 | 1504 | 70 | $0.00019 | 1.1 |  |
| 2026-10-24 06:26 | 3803 | subject arm 2 fable–fable #9 B m4 | claude-fable-5-1 | 4 | 1713 | $0.11648 | 33 |  |
| 2026-10-24 06:26 | 3804 | check arm 2 fable–fable #9 m4 | claude-haiku-5-5 | 2430 | 77 | $0.00028 | 0.8 |  |
| 2026-10-24 06:26 | 3805 | subject arm 2 sonnet–sonnet #9 B m6 | claude-sonnet-5-5 | 4 | 584 | $0.00911 | 6.7 |  |
| 2026-10-24 06:26 | 3806 | check arm 2 sonnet–sonnet #9 m6 | claude-haiku-5-5 | 1512 | 73 | $0.00019 | 1.7 |  |
| 2026-10-24 06:26 | 3807 | subject arm 2 sonnet–sonnet #9 A m7 | claude-sonnet-5-5 | 4 | 615 | $0.00956 | 6.3 |  |
| 2026-10-24 06:26 | 3808 | check arm 2 sonnet–sonnet #9 m7 | claude-haiku-5-5 | 1514 | 79 | $0.00019 | 1 |  |
| 2026-10-24 06:26 | 3809 | subject arm 2 sonnet–sonnet #9 B m8 | claude-sonnet-5-5 | 4 | 600 | $0.00953 | 6.8 |  |
| 2026-10-24 06:26 | 3810 | check arm 2 sonnet–sonnet #9 m8 | claude-haiku-5-5 | 1530 | 84 | $0.00019 | 0.8 |  |
| 2026-10-24 06:26 | 3811 | subject arm 2 sonnet–sonnet #9 A m9 | claude-sonnet-5-5 | 4 | 582 | $0.00951 | 6.4 |  |
| 2026-10-24 06:26 | 3812 | check arm 2 sonnet–sonnet #9 m9 | claude-haiku-5-5 | 1493 | 78 | $0.00019 | 1.1 |  |
| 2026-10-24 06:26 | 3813 | subject arm 1 fable–fable #9 B m8 | claude-fable-5-1 | 4 | 2103 | $0.13358 | 38.4 |  |
| 2026-10-24 06:26 | 3814 | check arm 1 fable–fable #9 m8 | claude-haiku-5-5 | 2279 | 73 | $0.00026 | 0.9 |  |
| 2026-10-24 06:26 | 3815 | check referee arm 2 sonnet–sonnet #9 m9 | claude-opus-5-5 | 1493 | 64 | $0.00725 | 1.6 |  |
| 2026-10-24 06:26 | 3816 | subject arm 2 fable–fable #9 A m5 | claude-fable-5-1 | 4 | 1890 | $0.12132 | 36.9 |  |
| 2026-10-24 06:26 | 3817 | tags 1 arm 2 sonnet–sonnet #9 m1–9 | claude-haiku-5-5 | 5979 | 613 | $0.00090 | 2.1 |  |
| 2026-10-24 06:26 | 3818 | tags 2 arm 2 sonnet–sonnet #9 m1–9 | claude-haiku-5-5 | 5979 | 613 | $0.00090 | 2.1 |  |
| 2026-10-24 06:26 | 3819 | check arm 2 fable–fable #9 m5 | claude-haiku-5-5 | 2329 | 85 | $0.00028 | 0.8 |  |
| 2026-10-24 06:26 | 3820 | tags referee arm 2 sonnet–sonnet #9 m1–9 | claude-opus-5-5 | 5979 | 613 | $0.03618 | 5 |  |
| 2026-10-24 06:26 | 3821 | subject arm 1 opus–opus #9 A m1 | claude-opus-5-5 | 40 | 521 | $0.01058 | 7.1 |  |
| 2026-10-24 06:26 | 3822 | check arm 1 opus–opus #9 m1 | claude-haiku-5-5 | 789 | 60 | $0.00011 | 0.8 |  |
| 2026-10-24 06:26 | 3823 | subject arm 2 fable–fable #9 B m6 | claude-fable-5-1 | 4 | 902 | $0.07093 | 17.9 |  |
| 2026-10-24 06:26 | 3824 | check arm 2 fable–fable #9 m6 | claude-haiku-5-5 | 1784 | 80 | $0.00022 | 1.4 |  |
| 2026-10-24 06:26 | 3825 | subject arm 1 opus–opus #9 B m2 | claude-opus-5-5 | 501 | 1337 | $0.02874 | 17.5 |  |
| 2026-10-24 06:26 | 3826 | check arm 1 opus–opus #9 m2 | claude-haiku-5-5 | 1662 | 85 | $0.00021 | 0.9 |  |
| 2026-10-24 06:26 | 3827 | subject arm 1 fable–fable #9 A m9 | claude-fable-5-1 | 4 | 1758 | $0.11403 | 33.3 |  |
| 2026-10-24 06:26 | 3828 | subject arm 2 fable–fable #9 A m7 | claude-fable-5-1 | 4 | 387 | $0.03862 | 7.6 |  |
| 2026-10-24 06:26 | 3829 | check arm 2 fable–fable #9 m7 | claude-haiku-5-5 | 885 | 62 | $0.00012 | 0.8 |  |
| 2026-10-24 06:26 | 3830 | check arm 1 fable–fable #9 m9 | claude-haiku-5-5 | 2194 | 78 | $0.00026 | 1.3 |  |
| 2026-10-24 06:26 | 3831 | subject arm 2 fable–fable #9 B m8 | claude-fable-5-1 | 4 | 81 | $0.01233 | 2.1 |  |
| 2026-10-24 06:26 | 3832 | tags 1 arm 2 fable–fable #9 m1–7 | claude-haiku-5-5 | 5975 | 479 | $0.00084 | 1.7 |  |
| 2026-10-24 06:26 | 3833 | tags 2 arm 2 fable–fable #9 m1–7 | claude-haiku-5-5 | 5975 | 479 | $0.00084 | 1.7 |  |
| 2026-10-24 06:26 | 3834 | subject arm 1 sonnet–sonnet #9 A m1 | claude-sonnet-5-5 | 40 | 347 | $0.00355 | 4.2 |  |
| 2026-10-24 06:26 | 3835 | check arm 1 sonnet–sonnet #9 m1 | claude-haiku-5-5 | 673 | 60 | $0.00010 | 0.7 |  |
| 2026-10-24 06:26 | 3836 | subject arm 1 sonnet–sonnet #9 B m2 | claude-sonnet-5-5 | 385 | 355 | $0.00432 | 4.8 |  |
| 2026-10-24 06:26 | 3837 | check arm 1 sonnet–sonnet #9 m2 | claude-haiku-5-5 | 1017 | 65 | $0.00013 | 0.8 |  |
| 2026-10-24 06:26 | 3838 | subject arm 1 opus–opus #9 A m3 | claude-opus-5-5 | 4 | 1843 | $0.04379 | 23.5 |  |
| 2026-10-24 06:26 | 3839 | check arm 1 opus–opus #9 m3 | claude-haiku-5-5 | 2000 | 57 | $0.00023 | 0.8 |  |
| 2026-10-24 06:26 | 3840 | check referee arm 1 sonnet–sonnet #9 m2 | claude-opus-5-5 | 1017 | 59 | $0.00525 | 2.5 |  |
| 2026-10-24 06:26 | 3841 | subject arm 1 sonnet–sonnet #9 A m3 | claude-sonnet-5-5 | 4 | 419 | $0.00604 | 5.3 |  |
| 2026-10-24 06:26 | 3842 | check arm 1 sonnet–sonnet #9 m3 | claude-haiku-5-5 | 1089 | 87 | $0.00015 | 0.9 |  |
| 2026-10-24 06:26 | 3843 | subject arm 1 sonnet–sonnet #9 B m4 | claude-sonnet-5-5 | 4 | 878 | $0.01168 | 9.8 |  |
| 2026-10-24 06:26 | 3844 | check arm 1 sonnet–sonnet #9 m4 | claude-haiku-5-5 | 1245 | 84 | $0.00017 | 1 |  |
| 2026-10-24 06:26 | 3845 | subject arm 1 fable–fable #9 B m10 | claude-fable-5-1 | 4 | 2315 | $0.14110 | 43.9 |  |
| 2026-10-24 06:26 | 3846 | check arm 1 fable–fable #9 m10 | claude-haiku-5-5 | 2479 | 87 | $0.00029 | 0.9 |  |
| 2026-10-24 06:26 | 3847 | subject arm 1 sonnet–sonnet #9 A m5 | claude-sonnet-5-5 | 4 | 986 | $0.01234 | 10.1 |  |
| 2026-10-24 06:26 | 3848 | check arm 1 sonnet–sonnet #9 m5 | claude-haiku-5-5 | 1460 | 104 | $0.00020 | 1 |  |
| 2026-10-24 06:26 | 3849 | subject arm 1 sonnet–sonnet #9 B m6 | claude-sonnet-5-5 | 4 | 361 | $0.00671 | 4.6 |  |
| 2026-10-24 06:26 | 3850 | check arm 1 sonnet–sonnet #9 m6 | claude-haiku-5-5 | 1310 | 66 | $0.00016 | 0.7 |  |
| 2026-10-24 06:26 | 3851 | subject arm 1 sonnet–sonnet #9 A m7 | claude-sonnet-5-5 | 4 | 986 | $0.01269 | 10.7 |  |
| 2026-10-24 06:26 | 3852 | subject arm 1 fable–fable #9 A m11 | claude-fable-5-1 | 4 | 1469 | $0.10257 | 30 |  |
| 2026-10-24 06:26 | 3853 | check arm 1 sonnet–sonnet #9 m7 | claude-haiku-5-5 | 1322 | 64 | $0.00016 | 0.6 |  |
| 2026-10-24 06:26 | 3854 | check arm 1 fable–fable #9 m11 | claude-haiku-5-5 | 2377 | 76 | $0.00028 | 0.9 |  |
| 2026-10-24 06:26 | 3855 | subject arm 1 opus–opus #9 B m4 | claude-opus-5-5 | 4 | 4994 | $0.11081 | 61.8 |  |
| 2026-10-24 06:26 | 3856 | check arm 1 opus–opus #9 m4 | claude-haiku-5-5 | 1991 | 77 | $0.00024 | 0.7 |  |
| 2026-10-24 06:26 | 3857 | subject arm 1 sonnet–sonnet #9 B m8 | claude-sonnet-5-5 | 4 | 1140 | $0.01439 | 12.4 |  |
| 2026-10-24 06:26 | 3858 | check arm 1 sonnet–sonnet #9 m8 | claude-haiku-5-5 | 1654 | 67 | $0.00020 | 1.6 |  |
| 2026-10-24 06:26 | 3859 | subject arm 1 fable–fable #9 B m12 | claude-fable-5-1 | 4 | 687 | $0.06245 | 14 |  |
| 2026-10-24 06:26 | 3860 | check arm 1 fable–fable #9 m12 | claude-haiku-5-5 | 1633 | 84 | $0.00021 | 0.8 |  |
| 2026-10-24 06:26 | 3861 | subject arm 1 fable–fable #9 A m13 | claude-fable-5-1 | 4 | 184 | $0.02829 | 3.4 |  |
| 2026-10-24 06:26 | 3862 | check arm 1 fable–fable #9 m13 | claude-haiku-5-5 | 814 | 63 | $0.00011 | 1 |  |
| 2026-10-24 06:26 | 3863 | subject arm 1 sonnet–sonnet #9 A m9 | claude-sonnet-5-5 | 4 | 743 | $0.01132 | 8.2 |  |
| 2026-10-24 06:26 | 3864 | check arm 1 sonnet–sonnet #9 m9 | claude-haiku-5-5 | 1751 | 67 | $0.00021 | 0.7 |  |
| 2026-10-24 06:26 | 3865 | subject arm 1 fable–fable #9 B m14 | claude-fable-5-1 | 4 | 102 | $0.01418 | 2.3 |  |
| 2026-10-24 06:26 | 3866 | check arm 1 fable–fable #9 m14 | claude-haiku-5-5 | 441 | 57 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 3867 | subject arm 1 fable–fable #9 A m15 | claude-fable-5-1 | 4 | 8 | $0.00492 | 1.2 |  |
| 2026-10-24 06:26 | 3868 | check arm 1 fable–fable #9 m15 | claude-haiku-5-5 | 350 | 48 | $0.00006 | 1.3 |  |
| 2026-10-24 06:26 | 3869 | subject arm 1 fable–fable #9 B m16 | claude-fable-5-1 | 4 | 8 | $0.00381 | 1.4 |  |
| 2026-10-24 06:26 | 3870 | check arm 1 fable–fable #9 m16 | claude-haiku-5-5 | 331 | 51 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 3871 | subject arm 1 fable–fable #9 A m17 | claude-fable-5-1 | 4 | 16 | $0.00398 | 1.3 |  |
| 2026-10-24 06:26 | 3872 | subject arm 1 sonnet–sonnet #9 B m10 | claude-sonnet-5-5 | 4 | 1149 | $0.01575 | 12.5 |  |
| 2026-10-24 06:26 | 3873 | check arm 1 sonnet–sonnet #9 m10 | claude-haiku-5-5 | 1741 | 69 | $0.00021 | 0.6 |  |
| 2026-10-24 06:26 | 3874 | check arm 1 fable–fable #9 m17 | claude-haiku-5-5 | 339 | 64 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 3875 | subject arm 1 fable–fable #9 B m18 | claude-fable-5-1 | 4 | 115 | $0.00903 | 2.8 |  |
| 2026-10-24 06:26 | 3876 | check arm 1 fable–fable #9 m18 | claude-haiku-5-5 | 341 | 50 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 3877 | subject arm 1 opus–opus #9 A m5 | claude-opus-5-5 | 4 | 3833 | $0.08533 | 40 |  |
| 2026-10-24 06:26 | 3878 | check arm 1 opus–opus #9 m5 | claude-haiku-5-5 | 2410 | 73 | $0.00028 | 0.8 |  |
| 2026-10-24 06:26 | 3879 | subject arm 1 fable–fable #9 A m19 | claude-fable-5-1 | 4 | 78 | $0.00721 | 2.5 |  |
| 2026-10-24 06:26 | 3880 | check arm 1 fable–fable #9 m19 | claude-haiku-5-5 | 328 | 44 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 3881 | subject arm 1 sonnet–sonnet #9 A m11 | claude-sonnet-5-5 | 4 | 1295 | $0.01732 | 13 |  |
| 2026-10-24 06:26 | 3882 | check arm 1 sonnet–sonnet #9 m11 | claude-haiku-5-5 | 1661 | 65 | $0.00020 | 1 |  |
| 2026-10-24 06:26 | 3883 | subject arm 1 fable–fable #9 B m20 | claude-fable-5-1 | 4 | 144 | $0.01035 | 3 |  |
| 2026-10-24 06:26 | 3884 | check arm 1 fable–fable #9 m20 | claude-haiku-5-5 | 321 | 47 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 3885 | subject arm 1 fable–fable #9 A m21 | claude-fable-5-1 | 4 | 142 | $0.01016 | 3.5 |  |
| 2026-10-24 06:26 | 3886 | check arm 1 fable–fable #9 m21 | claude-haiku-5-5 | 371 | 70 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 3887 | subject arm 1 fable–fable #9 B m22 | claude-fable-5-1 | 4 | 173 | $0.01234 | 4.8 |  |
| 2026-10-24 06:26 | 3888 | check arm 1 fable–fable #9 m22 | claude-haiku-5-5 | 392 | 66 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 3889 | subject arm 1 sonnet–sonnet #9 B m12 | claude-sonnet-5-5 | 4 | 1359 | $0.01791 | 14 |  |
| 2026-10-24 06:26 | 3890 | check arm 1 sonnet–sonnet #9 m12 | claude-haiku-5-5 | 1737 | 69 | $0.00021 | 0.9 |  |
| 2026-10-24 06:26 | 3891 | subject arm 1 fable–fable #9 A m23 | claude-fable-5-1 | 4 | 197 | $0.01380 | 3.7 |  |
| 2026-10-24 06:26 | 3892 | check arm 1 fable–fable #9 m23 | claude-haiku-5-5 | 342 | 68 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 3893 | subject arm 1 opus–opus #9 B m6 | claude-opus-5-5 | 4 | 2778 | $0.06649 | 33.1 |  |
| 2026-10-24 06:26 | 3894 | check arm 1 opus–opus #9 m6 | claude-haiku-5-5 | 2587 | 78 | $0.00030 | 1 |  |
| 2026-10-24 06:26 | 3895 | subject arm 1 fable–fable #9 B m24 | claude-fable-5-1 | 4 | 213 | $0.01399 | 4.2 |  |
| 2026-10-24 06:26 | 3896 | check arm 1 fable–fable #9 m24 | claude-haiku-5-5 | 326 | 48 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 3897 | subject arm 1 fable–fable #9 A m25 | claude-fable-5-1 | 4 | 204 | $0.01335 | 4.3 |  |
| 2026-10-24 06:26 | 3898 | subject arm 1 sonnet–sonnet #9 A m13 | claude-sonnet-5-5 | 4 | 1541 | $0.02006 | 16.9 |  |
| 2026-10-24 06:26 | 3899 | check arm 1 fable–fable #9 m25 | claude-haiku-5-5 | 330 | 57 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 3900 | check arm 1 sonnet–sonnet #9 m13 | claude-haiku-5-5 | 2022 | 68 | $0.00024 | 0.9 |  |
| 2026-10-24 06:26 | 3901 | subject arm 1 fable–fable #9 B m26 | claude-fable-5-1 | 4 | 207 | $0.01355 | 3.9 |  |
| 2026-10-24 06:26 | 3902 | check arm 1 fable–fable #9 m26 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 3903 | subject arm 1 fable–fable #9 A m27 | claude-fable-5-1 | 4 | 180 | $0.01219 | 4.5 |  |
| 2026-10-24 06:26 | 3904 | check arm 1 fable–fable #9 m27 | claude-haiku-5-5 | 355 | 54 | $0.00006 | 1.1 |  |
| 2026-10-24 06:26 | 3905 | subject arm 1 sonnet–sonnet #9 B m14 | claude-sonnet-5-5 | 4 | 1481 | $0.02030 | 15.1 |  |
| 2026-10-24 06:26 | 3906 | check arm 1 sonnet–sonnet #9 m14 | claude-haiku-5-5 | 2107 | 71 | $0.00025 | 0.7 |  |
| 2026-10-24 06:26 | 3907 | subject arm 1 fable–fable #9 B m28 | claude-fable-5-1 | 4 | 101 | $0.00856 | 2.4 |  |
| 2026-10-24 06:26 | 3908 | check arm 1 fable–fable #9 m28 | claude-haiku-5-5 | 362 | 57 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 3909 | subject arm 1 fable–fable #9 A m29 | claude-fable-5-1 | 4 | 184 | $0.01280 | 4 |  |
| 2026-10-24 06:26 | 3910 | check arm 1 fable–fable #9 m29 | claude-haiku-5-5 | 336 | 59 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 3911 | subject arm 1 sonnet–sonnet #9 A m15 | claude-sonnet-5-5 | 4 | 1414 | $0.02000 | 14 |  |
| 2026-10-24 06:26 | 3912 | check arm 1 sonnet–sonnet #9 m15 | claude-haiku-5-5 | 1957 | 66 | $0.00023 | 0.9 |  |
| 2026-10-24 06:26 | 3913 | subject arm 1 fable–fable #9 B m30 | claude-fable-5-1 | 4 | 307 | $0.01863 | 6.5 |  |
| 2026-10-24 06:26 | 3914 | check arm 1 fable–fable #9 m30 | claude-haiku-5-5 | 372 | 70 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 3915 | subject arm 1 fable–fable #9 A m31 | claude-fable-5-1 | 4 | 130 | $0.01024 | 2.5 |  |
| 2026-10-24 06:26 | 3916 | check arm 1 fable–fable #9 m31 | claude-haiku-5-5 | 372 | 62 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 3917 | subject arm 1 opus–opus #9 A m7 | claude-opus-5-5 | 4 | 4453 | $0.10105 | 51 |  |
| 2026-10-24 06:26 | 3918 | check arm 1 opus–opus #9 m7 | claude-haiku-5-5 | 2293 | 66 | $0.00026 | 0.9 |  |
| 2026-10-24 06:26 | 3919 | subject arm 1 fable–fable #9 B m32 | claude-fable-5-1 | 4 | 186 | $0.01304 | 3.8 |  |
| 2026-10-24 06:26 | 3920 | check arm 1 fable–fable #9 m32 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.9 |  |
| 2026-10-24 06:26 | 3921 | subject arm 1 fable–fable #9 A m33 | claude-fable-5-1 | 4 | 109 | $0.00867 | 3 |  |
| 2026-10-24 06:26 | 3922 | check arm 1 fable–fable #9 m33 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.1 |  |
| 2026-10-24 06:26 | 3923 | subject arm 1 sonnet–sonnet #9 B m16 | claude-sonnet-5-5 | 4 | 1571 | $0.02138 | 19.2 |  |
| 2026-10-24 06:26 | 3924 | check arm 1 sonnet–sonnet #9 m16 | claude-haiku-5-5 | 1989 | 71 | $0.00023 | 0.8 |  |
| 2026-10-24 06:26 | 3925 | subject arm 1 fable–fable #9 B m34 | claude-fable-5-1 | 4 | 119 | $0.00917 | 2.8 |  |
| 2026-10-24 06:26 | 3926 | check arm 1 fable–fable #9 m34 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.5 |  |
| 2026-10-24 06:26 | 3927 | subject arm 1 fable–fable #9 A m35 | claude-fable-5-1 | 4 | 90 | $0.00772 | 2.5 |  |
| 2026-10-24 06:26 | 3928 | check arm 1 fable–fable #9 m35 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 3929 | subject arm 1 sonnet–sonnet #9 A m17 | claude-sonnet-5-5 | 4 | 828 | $0.01420 | 8.6 |  |
| 2026-10-24 06:26 | 3930 | check arm 1 sonnet–sonnet #9 m17 | claude-haiku-5-5 | 2019 | 77 | $0.00024 | 0.8 |  |
| 2026-10-24 06:26 | 3931 | subject arm 1 fable–fable #9 B m36 | claude-fable-5-1 | 4 | 136 | $0.01002 | 3.9 |  |
| 2026-10-24 06:26 | 3932 | check arm 1 fable–fable #9 m36 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 3933 | subject arm 1 opus–opus #9 B m8 | claude-opus-5-5 | 4 | 2266 | $0.05608 | 26.3 |  |
| 2026-10-24 06:26 | 3934 | check arm 1 opus–opus #9 m8 | claude-haiku-5-5 | 2375 | 78 | $0.00028 | 0.8 |  |
| 2026-10-24 06:26 | 3935 | subject arm 1 fable–fable #9 A m37 | claude-fable-5-1 | 4 | 125 | $0.00947 | 2.6 |  |
| 2026-10-24 06:26 | 3936 | check arm 1 fable–fable #9 m37 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 3937 | subject arm 1 fable–fable #9 B m38 | claude-fable-5-1 | 4 | 148 | $0.01062 | 4.6 |  |
| 2026-10-24 06:26 | 3938 | subject arm 1 sonnet–sonnet #9 B m18 | claude-sonnet-5-5 | 4 | 1487 | $0.02103 | 14.3 |  |
| 2026-10-24 06:26 | 3939 | check arm 1 fable–fable #9 m38 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 3940 | check arm 1 sonnet–sonnet #9 m18 | claude-haiku-5-5 | 1849 | 74 | $0.00022 | 0.8 |  |
| 2026-10-24 06:26 | 3941 | subject arm 1 fable–fable #9 A m39 | claude-fable-5-1 | 4 | 79 | $0.00718 | 1.7 |  |
| 2026-10-24 06:26 | 3942 | check arm 1 fable–fable #9 m39 | claude-haiku-5-5 | 329 | 42 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 3943 | subject arm 1 opus–opus #9 A m9 | claude-opus-5-5 | 4 | 1506 | $0.04150 | 19.1 |  |
| 2026-10-24 06:26 | 3944 | check arm 1 opus–opus #9 m9 | claude-haiku-5-5 | 2335 | 83 | $0.00028 | 1 |  |
| 2026-10-24 06:26 | 3945 | subject arm 1 fable–fable #9 B m40 | claude-fable-5-1 | 4 | 168 | $0.01163 | 4.4 |  |
| 2026-10-24 06:26 | 3946 | check arm 1 fable–fable #9 m40 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 3947 | subject arm 1 fable–fable #9 A m41 | claude-fable-5-1 | 4 | 137 | $0.01008 | 2.6 |  |
| 2026-10-24 06:26 | 3948 | check arm 1 fable–fable #9 m41 | claude-haiku-5-5 | 329 | 42 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 3949 | subject arm 1 sonnet–sonnet #9 A m19 | claude-sonnet-5-5 | 4 | 1717 | $0.02308 | 16 |  |
| 2026-10-24 06:26 | 3950 | check arm 1 sonnet–sonnet #9 m19 | claude-haiku-5-5 | 1813 | 70 | $0.00022 | 1.2 |  |
| 2026-10-24 06:26 | 3951 | subject arm 1 fable–fable #9 B m42 | claude-fable-5-1 | 4 | 195 | $0.01298 | 4.8 |  |
| 2026-10-24 06:26 | 3952 | check arm 1 fable–fable #9 m42 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 3953 | subject arm 1 fable–fable #9 A m43 | claude-fable-5-1 | 4 | 105 | $0.00848 | 2 |  |
| 2026-10-24 06:26 | 3954 | check arm 1 fable–fable #9 m43 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 1.7 |  |
| 2026-10-24 06:26 | 3955 | subject arm 1 sonnet–sonnet #9 B m20 | claude-sonnet-5-5 | 4 | 1939 | $0.02537 | 15.6 |  |
| 2026-10-24 06:26 | 3956 | subject arm 1 fable–fable #9 B m44 | claude-fable-5-1 | 4 | 204 | $0.01343 | 4.9 |  |
| 2026-10-24 06:26 | 3957 | check arm 1 sonnet–sonnet #9 m20 | claude-haiku-5-5 | 2129 | 68 | $0.00025 | 0.9 |  |
| 2026-10-24 06:26 | 3958 | check arm 1 fable–fable #9 m44 | claude-haiku-5-5 | 329 | 40 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 3959 | subject arm 1 fable–fable #9 A m45 | claude-fable-5-1 | 4 | 67 | $0.00659 | 1.5 |  |
| 2026-10-24 06:26 | 3960 | check arm 1 fable–fable #9 m45 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.5 |  |
| 2026-10-24 06:26 | 3961 | subject arm 1 fable–fable #9 B m46 | claude-fable-5-1 | 4 | 134 | $0.00994 | 4.4 |  |
| 2026-10-24 06:26 | 3962 | check arm 1 fable–fable #9 m46 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.9 |  |
| 2026-10-24 06:26 | 3963 | subject arm 1 sonnet–sonnet #9 A m21 | claude-sonnet-5-5 | 4 | 1576 | $0.02267 | 14.8 |  |
| 2026-10-24 06:26 | 3964 | subject arm 1 fable–fable #9 A m47 | claude-fable-5-1 | 4 | 117 | $0.00909 | 2.4 |  |
| 2026-10-24 06:26 | 3965 | check arm 1 fable–fable #9 m47 | claude-haiku-5-5 | 329 | 42 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 3966 | check arm 1 sonnet–sonnet #9 m21 | claude-haiku-5-5 | 2109 | 69 | $0.00025 | 1.1 |  |
| 2026-10-24 06:26 | 3967 | subject arm 1 opus–opus #9 B m10 | claude-opus-5-5 | 4 | 4362 | $0.09861 | 47.3 |  |
| 2026-10-24 06:26 | 3968 | check arm 1 opus–opus #9 m10 | claude-haiku-5-5 | 2227 | 72 | $0.00026 | 0.8 |  |
| 2026-10-24 06:26 | 3969 | subject arm 1 fable–fable #9 B m48 | claude-fable-5-1 | 4 | 148 | $0.01064 | 4.1 |  |
| 2026-10-24 06:26 | 3970 | check arm 1 fable–fable #9 m48 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1 |  |
| 2026-10-24 06:26 | 3971 | subject arm 1 fable–fable #9 A m49 | claude-fable-5-1 | 4 | 119 | $0.00919 | 2.3 |  |
| 2026-10-24 06:26 | 3972 | check arm 1 fable–fable #9 m49 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 3973 | subject arm 1 fable–fable #9 B m50 | claude-fable-5-1 | 4 | 123 | $0.00939 | 3.6 |  |
| 2026-10-24 06:26 | 3974 | subject arm 1 sonnet–sonnet #9 B m22 | claude-sonnet-5-5 | 4 | 1716 | $0.02418 | 16.6 |  |
| 2026-10-24 06:26 | 3975 | check arm 1 fable–fable #9 m50 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 3976 | check arm 1 sonnet–sonnet #9 m22 | claude-haiku-5-5 | 1850 | 71 | $0.00022 | 0.7 |  |
| 2026-10-24 06:26 | 3977 | subject arm 1 fable–fable #9 A m51 | claude-fable-5-1 | 4 | 103 | $0.00840 | 2 |  |
| 2026-10-24 06:26 | 3978 | check arm 1 fable–fable #9 m51 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 3979 | subject arm 1 fable–fable #9 B m52 | claude-fable-5-1 | 4 | 197 | $0.01310 | 5.4 |  |
| 2026-10-24 06:26 | 3980 | check arm 1 fable–fable #9 m52 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.8 |  |
| 2026-10-24 06:26 | 3981 | subject arm 1 fable–fable #9 A m53 | claude-fable-5-1 | 4 | 113 | $0.00890 | 2.2 |  |
| 2026-10-24 06:26 | 3982 | check arm 1 fable–fable #9 m53 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 3983 | subject arm 1 fable–fable #9 B m54 | claude-fable-5-1 | 4 | 176 | $0.01205 | 3.4 |  |
| 2026-10-24 06:26 | 3984 | check arm 1 fable–fable #9 m54 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 3985 | subject arm 1 fable–fable #9 A m55 | claude-fable-5-1 | 4 | 84 | $0.00745 | 1.6 |  |
| 2026-10-24 06:26 | 3986 | check arm 1 fable–fable #9 m55 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 3987 | subject arm 1 sonnet–sonnet #9 A m23 | claude-sonnet-5-5 | 4 | 3542 | $0.04200 | 32.6 |  |
| 2026-10-24 06:26 | 3988 | subject arm 1 opus–opus #9 A m11 | claude-opus-5-5 | 4 | 4564 | $0.10233 | 47.4 |  |
| 2026-10-24 06:26 | 3989 | check arm 1 sonnet–sonnet #9 m23 | claude-haiku-5-5 | 2209 | 66 | $0.00025 | 0.8 |  |
| 2026-10-24 06:26 | 3990 | subject arm 1 fable–fable #9 B m56 | claude-fable-5-1 | 4 | 199 | $0.01320 | 4.2 |  |
| 2026-10-24 06:26 | 3991 | check arm 1 opus–opus #9 m11 | claude-haiku-5-5 | 2731 | 80 | $0.00031 | 0.9 |  |
| 2026-10-24 06:26 | 3992 | check arm 1 fable–fable #9 m56 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 3993 | subject arm 1 fable–fable #9 A m57 | claude-fable-5-1 | 4 | 176 | $0.01206 | 3.3 |  |
| 2026-10-24 06:26 | 3994 | check arm 1 fable–fable #9 m57 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.5 |  |
| 2026-10-24 06:26 | 3995 | subject arm 1 fable–fable #9 B m58 | claude-fable-5-1 | 4 | 233 | $0.01491 | 4.4 |  |
| 2026-10-24 06:26 | 3996 | check arm 1 fable–fable #9 m58 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 3997 | subject arm 1 fable–fable #9 A m59 | claude-fable-5-1 | 4 | 207 | $0.01361 | 4 |  |
| 2026-10-24 06:26 | 3998 | check arm 1 fable–fable #9 m59 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 3999 | subject arm 1 fable–fable #9 B m60 | claude-fable-5-1 | 4 | 7 | $0.00361 | 1.1 |  |
| 2026-10-24 06:26 | 4000 | check arm 1 fable–fable #9 m60 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 4001 | tags 1 arm 1 fable–fable #9 m1–10 | claude-haiku-5-5 | 11296 | 680 | $0.00147 | 2.2 |  |
| 2026-10-24 06:26 | 4002 | tags 1 arm 1 fable–fable #9 m11–20 | claude-haiku-5-5 | 3691 | 680 | $0.00071 | 2.3 |  |
| 2026-10-24 06:26 | 4003 | tags 2 arm 1 fable–fable #9 m1–10 | claude-haiku-5-5 | 11296 | 680 | $0.00147 | 2.8 |  |
| 2026-10-24 06:26 | 4004 | subject arm 1 sonnet–sonnet #9 B m24 | claude-sonnet-5-5 | 4 | 2972 | $0.03735 | 27.1 |  |
| 2026-10-24 06:26 | 4005 | subject arm 1 opus–opus #9 B m12 | claude-opus-5-5 | 4 | 2162 | $0.05699 | 27.5 |  |
| 2026-10-24 06:26 | 4006 | check arm 1 sonnet–sonnet #9 m24 | claude-haiku-5-5 | 2658 | 67 | $0.00030 | 0.9 |  |
| 2026-10-24 06:26 | 4007 | check arm 1 opus–opus #9 m12 | claude-haiku-5-5 | 3025 | 80 | $0.00034 | 0.7 |  |
| 2026-10-24 06:26 | 4008 | tags 1 arm 1 fable–fable #9 m21–30 | claude-haiku-5-5 | 1264 | 680 | $0.00047 | 2.2 |  |
| 2026-10-24 06:26 | 4009 | tags 2 arm 1 fable–fable #9 m21–30 | claude-haiku-5-5 | 1264 | 680 | $0.00047 | 2.2 |  |
| 2026-10-24 06:26 | 4010 | tags 2 arm 1 fable–fable #9 m11–20 | claude-haiku-5-5 | 3691 | 1296 | $0.00102 | 4.9 |  |
| 2026-10-24 06:26 | 4011 | tags 1 arm 1 fable–fable #9 m31–40 | claude-haiku-5-5 | 1175 | 680 | $0.00046 | 2.6 |  |
| 2026-10-24 06:26 | 4012 | tags 2 arm 1 fable–fable #9 m31–40 | claude-haiku-5-5 | 1175 | 680 | $0.00046 | 2.6 |  |
| 2026-10-24 06:26 | 4013 | subject arm 1 sonnet–sonnet #10 A m1 | claude-sonnet-5-5 | 40 | 388 | $0.00396 | 11.6 |  |
| 2026-10-24 06:26 | 4014 | check arm 1 sonnet–sonnet #10 m1 | claude-haiku-5-5 | 714 | 73 | $0.00011 | 1 |  |
| 2026-10-24 06:26 | 4015 | tags 1 arm 1 fable–fable #9 m41–50 | claude-haiku-5-5 | 1132 | 680 | $0.00045 | 3 |  |
| 2026-10-24 06:26 | 4016 | tags 2 arm 1 fable–fable #9 m41–50 | claude-haiku-5-5 | 1132 | 680 | $0.00045 | 2.2 |  |
| 2026-10-24 06:26 | 4017 | tags 1 arm 1 fable–fable #9 m51–60 | claude-haiku-5-5 | 1132 | 680 | $0.00045 | 2.2 |  |
| 2026-10-24 06:26 | 4018 | tags 2 arm 1 fable–fable #9 m51–60 | claude-haiku-5-5 | 1132 | 680 | $0.00045 | 2.8 |  |
| 2026-10-24 06:26 | 4019 | subject arm 1 sonnet–sonnet #10 B m2 | claude-sonnet-5-5 | 426 | 578 | $0.00663 | 7.4 |  |
| 2026-10-24 06:26 | 4020 | check arm 1 sonnet–sonnet #10 m2 | claude-haiku-5-5 | 1281 | 76 | $0.00017 | 0.7 |  |
| 2026-10-24 06:26 | 4021 | subject arm 1 sonnet–sonnet #9 A m25 | claude-sonnet-5-5 | 4 | 2096 | $0.02987 | 19.6 |  |
| 2026-10-24 06:26 | 4022 | check arm 1 sonnet–sonnet #9 m25 | claude-haiku-5-5 | 2432 | 73 | $0.00028 | 0.7 |  |
| 2026-10-24 06:26 | 4023 | tags referee arm 1 fable–fable #9 m11–20 | claude-opus-5-5 | 3691 | 680 | $0.02836 | 6.1 |  |
| 2026-10-24 06:26 | 4024 | subject arm 1 sonnet–sonnet #10 A m3 | claude-sonnet-5-5 | 4 | 673 | $0.00924 | 11.1 |  |
| 2026-10-24 06:26 | 4025 | check arm 1 sonnet–sonnet #10 m3 | claude-haiku-5-5 | 1566 | 68 | $0.00019 | 0.9 |  |
| 2026-10-24 06:26 | 4026 | subject arm 1 sonnet–sonnet #9 B m26 | claude-sonnet-5-5 | 4 | 1712 | $0.02569 | 15.8 |  |
| 2026-10-24 06:26 | 4027 | check arm 1 sonnet–sonnet #9 m26 | claude-haiku-5-5 | 2060 | 73 | $0.00024 | 0.9 |  |
| 2026-10-24 06:26 | 4028 | subject arm 1 sonnet–sonnet #10 B m4 | claude-sonnet-5-5 | 4 | 720 | $0.01139 | 8.4 |  |
| 2026-10-24 06:26 | 4029 | check arm 1 sonnet–sonnet #10 m4 | claude-haiku-5-5 | 1708 | 69 | $0.00021 | 0.8 |  |
| 2026-10-24 06:26 | 4030 | subject arm 1 opus–opus #9 A m13 | claude-opus-5-5 | 4 | 4414 | $0.10371 | 43.7 |  |
| 2026-10-24 06:26 | 4031 | check arm 1 opus–opus #9 m13 | claude-haiku-5-5 | 3247 | 67 | $0.00036 | 0.6 |  |
| 2026-10-24 06:26 | 4032 | subject arm 1 sonnet–sonnet #9 A m27 | claude-sonnet-5-5 | 4 | 834 | $0.01622 | 8.7 |  |
| 2026-10-24 06:26 | 4033 | check arm 1 sonnet–sonnet #9 m27 | claude-haiku-5-5 | 1989 | 70 | $0.00023 | 0.9 |  |
| 2026-10-24 06:26 | 4034 | subject arm 1 sonnet–sonnet #10 A m5 | claude-sonnet-5-5 | 4 | 562 | $0.00931 | 8.1 |  |
| 2026-10-24 06:26 | 4035 | check arm 1 sonnet–sonnet #10 m5 | claude-haiku-5-5 | 1597 | 69 | $0.00019 | 0.8 |  |
| 2026-10-24 06:26 | 4036 | subject arm 1 sonnet–sonnet #9 B m28 | claude-sonnet-5-5 | 4 | 1223 | $0.02011 | 11 |  |
| 2026-10-24 06:26 | 4037 | subject arm 1 sonnet–sonnet #10 B m6 | claude-sonnet-5-5 | 4 | 708 | $0.01063 | 7.1 |  |
| 2026-10-24 06:26 | 4038 | check arm 1 sonnet–sonnet #9 m28 | claude-haiku-5-5 | 1641 | 71 | $0.00020 | 0.8 |  |
| 2026-10-24 06:26 | 4039 | check arm 1 sonnet–sonnet #10 m6 | claude-haiku-5-5 | 1585 | 74 | $0.00020 | 1 |  |
| 2026-10-24 06:26 | 4040 | check referee arm 1 sonnet–sonnet #10 m6 | claude-opus-5-5 | 1585 | 62 | $0.00758 | 1.9 |  |
| 2026-10-24 06:26 | 4041 | subject arm 1 sonnet–sonnet #9 A m29 | claude-sonnet-5-5 | 4 | 567 | $0.01285 | 8.5 |  |
| 2026-10-24 06:26 | 4042 | check arm 1 sonnet–sonnet #9 m29 | claude-haiku-5-5 | 1374 | 73 | $0.00017 | 0.8 |  |
| 2026-10-24 06:26 | 4043 | subject arm 1 sonnet–sonnet #10 A m7 | claude-sonnet-5-5 | 4 | 953 | $0.01319 | 11.1 |  |
| 2026-10-24 06:26 | 4044 | check arm 1 sonnet–sonnet #10 m7 | claude-haiku-5-5 | 1976 | 68 | $0.00023 | 0.7 |  |
| 2026-10-24 06:26 | 4045 | subject arm 1 sonnet–sonnet #9 B m30 | claude-sonnet-5-5 | 4 | 1092 | $0.01760 | 10.2 |  |
| 2026-10-24 06:26 | 4046 | subject arm 1 sonnet–sonnet #10 B m8 | claude-sonnet-5-5 | 4 | 432 | $0.00907 | 5.5 |  |
| 2026-10-24 06:26 | 4047 | check arm 1 sonnet–sonnet #9 m30 | claude-haiku-5-5 | 1274 | 75 | $0.00016 | 1.3 |  |
| 2026-10-24 06:26 | 4048 | subject arm 1 opus–opus #9 B m14 | claude-opus-5-5 | 4 | 4033 | $0.09747 | 43.6 |  |
| 2026-10-24 06:26 | 4049 | check arm 1 sonnet–sonnet #10 m8 | claude-haiku-5-5 | 1700 | 86 | $0.00021 | 1.9 |  |
| 2026-10-24 06:26 | 4050 | check arm 1 opus–opus #9 m14 | claude-haiku-5-5 | 3170 | 83 | $0.00036 | 1.2 |  |
| 2026-10-24 06:26 | 4051 | subject arm 1 sonnet–sonnet #9 A m31 | claude-sonnet-5-5 | 4 | 761 | $0.01414 | 7.1 |  |
| 2026-10-24 06:26 | 4052 | subject arm 1 sonnet–sonnet #10 A m9 | claude-sonnet-5-5 | 4 | 534 | $0.00954 | 6.6 |  |
| 2026-10-24 06:26 | 4053 | check arm 1 sonnet–sonnet #9 m31 | claude-haiku-5-5 | 984 | 66 | $0.00013 | 0.7 |  |
| 2026-10-24 06:26 | 4054 | check arm 1 sonnet–sonnet #10 m9 | claude-haiku-5-5 | 1281 | 76 | $0.00017 | 0.9 |  |
| 2026-10-24 06:26 | 4055 | subject arm 1 sonnet–sonnet #9 B m32 | claude-sonnet-5-5 | 4 | 135 | $0.00727 | 2.1 |  |
| 2026-10-24 06:26 | 4056 | check arm 1 sonnet–sonnet #9 m32 | claude-haiku-5-5 | 727 | 70 | $0.00011 | 0.8 |  |
| 2026-10-24 06:26 | 4057 | check referee arm 1 sonnet–sonnet #10 m9 | claude-opus-5-5 | 1281 | 57 | $0.00626 | 1.8 |  |
| 2026-10-24 06:26 | 4058 | subject arm 1 sonnet–sonnet #9 A m33 | claude-sonnet-5-5 | 4 | 116 | $0.00651 | 2 |  |
| 2026-10-24 06:26 | 4059 | check arm 1 sonnet–sonnet #9 m33 | claude-haiku-5-5 | 566 | 73 | $0.00009 | 1.3 |  |
| 2026-10-24 06:26 | 4060 | subject arm 1 sonnet–sonnet #10 B m10 | claude-sonnet-5-5 | 4 | 685 | $0.01020 | 6.9 |  |
| 2026-10-24 06:26 | 4061 | subject arm 1 sonnet–sonnet #9 B m34 | claude-sonnet-5-5 | 4 | 87 | $0.00587 | 1.2 |  |
| 2026-10-24 06:26 | 4062 | check arm 1 sonnet–sonnet #10 m10 | claude-haiku-5-5 | 1335 | 67 | $0.00017 | 0.8 |  |
| 2026-10-24 06:26 | 4063 | check arm 1 sonnet–sonnet #9 m34 | claude-haiku-5-5 | 518 | 61 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 4064 | subject arm 1 sonnet–sonnet #9 A m35 | claude-sonnet-5-5 | 4 | 21 | $0.00512 | 1.2 |  |
| 2026-10-24 06:26 | 4065 | check referee arm 1 sonnet–sonnet #10 m10 | claude-opus-5-5 | 1335 | 55 | $0.00644 | 1.8 |  |
| 2026-10-24 06:26 | 4066 | check arm 1 sonnet–sonnet #9 m35 | claude-haiku-5-5 | 423 | 58 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 4067 | subject arm 1 sonnet–sonnet #9 B m36 | claude-sonnet-5-5 | 4 | 30 | $0.00500 | 0.9 |  |
| 2026-10-24 06:26 | 4068 | subject arm 1 opus–opus #9 A m15 | claude-opus-5-5 | 4 | 2347 | $0.06363 | 27.4 |  |
| 2026-10-24 06:26 | 4069 | check arm 1 opus–opus #9 m15 | claude-haiku-5-5 | 2640 | 72 | $0.00030 | 0.9 |  |
| 2026-10-24 06:26 | 4070 | check arm 1 sonnet–sonnet #9 m36 | claude-haiku-5-5 | 366 | 66 | $0.00007 | 1.3 |  |
| 2026-10-24 06:26 | 4071 | subject arm 1 sonnet–sonnet #9 A m37 | claude-sonnet-5-5 | 4 | 18 | $0.00475 | 0.9 |  |
| 2026-10-24 06:26 | 4072 | subject arm 1 sonnet–sonnet #10 A m11 | claude-sonnet-5-5 | 4 | 689 | $0.01046 | 7.8 |  |
| 2026-10-24 06:26 | 4073 | check arm 1 sonnet–sonnet #9 m37 | claude-haiku-5-5 | 363 | 48 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4074 | check arm 1 sonnet–sonnet #10 m11 | claude-haiku-5-5 | 1490 | 68 | $0.00018 | 0.6 |  |
| 2026-10-24 06:26 | 4075 | subject arm 1 sonnet–sonnet #9 B m38 | claude-sonnet-5-5 | 4 | 12 | $0.00469 | 0.9 |  |
| 2026-10-24 06:26 | 4076 | check arm 1 sonnet–sonnet #9 m38 | claude-haiku-5-5 | 345 | 48 | $0.00006 | 1 |  |
| 2026-10-24 06:26 | 4077 | subject arm 1 sonnet–sonnet #9 A m39 | claude-sonnet-5-5 | 4 | 8 | $0.00461 | 0.9 |  |
| 2026-10-24 06:26 | 4078 | check arm 1 sonnet–sonnet #9 m39 | claude-haiku-5-5 | 335 | 48 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4079 | subject arm 1 sonnet–sonnet #9 B m40 | claude-sonnet-5-5 | 4 | 8 | $0.00459 | 0.9 |  |
| 2026-10-24 06:26 | 4080 | subject arm 1 sonnet–sonnet #10 B m12 | claude-sonnet-5-5 | 4 | 838 | $0.01244 | 9.1 |  |
| 2026-10-24 06:26 | 4081 | check arm 1 sonnet–sonnet #9 m40 | claude-haiku-5-5 | 331 | 48 | $0.00006 | 1.6 |  |
| 2026-10-24 06:26 | 4082 | check arm 1 sonnet–sonnet #10 m12 | claude-haiku-5-5 | 1448 | 75 | $0.00018 | 1 |  |
| 2026-10-24 06:26 | 4083 | subject arm 1 sonnet–sonnet #9 A m41 | claude-sonnet-5-5 | 4 | 8 | $0.00458 | 0.8 |  |
| 2026-10-24 06:26 | 4084 | check arm 1 sonnet–sonnet #9 m41 | claude-haiku-5-5 | 331 | 46 | $0.00006 | 0.5 |  |
| 2026-10-24 06:26 | 4085 | subject arm 1 sonnet–sonnet #9 B m42 | claude-sonnet-5-5 | 4 | 8 | $0.00458 | 0.7 |  |
| 2026-10-24 06:26 | 4086 | check arm 1 sonnet–sonnet #9 m42 | claude-haiku-5-5 | 331 | 49 | $0.00006 | 1.1 |  |
| 2026-10-24 06:26 | 4087 | subject arm 1 sonnet–sonnet #9 A m43 | claude-sonnet-5-5 | 4 | 65 | $0.00515 | 1.5 |  |
| 2026-10-24 06:26 | 4088 | subject arm 1 sonnet–sonnet #10 A m13 | claude-sonnet-5-5 | 4 | 679 | $0.01084 | 8.2 |  |
| 2026-10-24 06:26 | 4089 | check arm 1 sonnet–sonnet #10 m13 | claude-haiku-5-5 | 1438 | 72 | $0.00018 | 0.7 |  |
| 2026-10-24 06:26 | 4090 | subject arm 1 opus–opus #9 B m16 | claude-opus-5-5 | 4 | 2082 | $0.05601 | 25.7 |  |
| 2026-10-24 06:26 | 4091 | check arm 1 sonnet–sonnet #9 m43 | claude-haiku-5-5 | 331 | 49 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 4092 | check arm 1 opus–opus #9 m16 | claude-haiku-5-5 | 2511 | 75 | $0.00029 | 1.8 |  |
| 2026-10-24 06:26 | 4093 | subject arm 1 sonnet–sonnet #9 B m44 | claude-sonnet-5-5 | 4 | 8 | $0.00459 | 0.7 |  |
| 2026-10-24 06:26 | 4094 | check arm 1 sonnet–sonnet #9 m44 | claude-haiku-5-5 | 331 | 49 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4095 | subject arm 1 sonnet–sonnet #10 B m14 | claude-sonnet-5-5 | 4 | 235 | $0.00652 | 3 |  |
| 2026-10-24 06:26 | 4096 | subject arm 1 sonnet–sonnet #9 A m45 | claude-sonnet-5-5 | 4 | 8 | $0.00459 | 0.9 |  |
| 2026-10-24 06:26 | 4097 | check arm 1 sonnet–sonnet #10 m14 | claude-haiku-5-5 | 1229 | 70 | $0.00016 | 1 |  |
| 2026-10-24 06:26 | 4098 | check arm 1 sonnet–sonnet #9 m45 | claude-haiku-5-5 | 331 | 49 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 4099 | subject arm 1 sonnet–sonnet #9 B m46 | claude-sonnet-5-5 | 4 | 8 | $0.00459 | 0.7 |  |
| 2026-10-24 06:26 | 4100 | subject arm 1 sonnet–sonnet #10 A m15 | claude-sonnet-5-5 | 4 | 195 | $0.00568 | 3.1 |  |
| 2026-10-24 06:26 | 4101 | check arm 1 sonnet–sonnet #9 m46 | claude-haiku-5-5 | 331 | 45 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4102 | check arm 1 sonnet–sonnet #10 m15 | claude-haiku-5-5 | 745 | 80 | $0.00011 | 0.7 |  |
| 2026-10-24 06:26 | 4103 | subject arm 1 sonnet–sonnet #9 A m47 | claude-sonnet-5-5 | 4 | 111 | $0.00562 | 1.7 |  |
| 2026-10-24 06:26 | 4104 | check arm 1 sonnet–sonnet #9 m47 | claude-haiku-5-5 | 365 | 55 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 4105 | subject arm 1 sonnet–sonnet #10 B m16 | claude-sonnet-5-5 | 4 | 68 | $0.00334 | 1.5 |  |
| 2026-10-24 06:26 | 4106 | check arm 1 sonnet–sonnet #10 m16 | claude-haiku-5-5 | 578 | 59 | $0.00009 | 0.7 |  |
| 2026-10-24 06:26 | 4107 | subject arm 1 sonnet–sonnet #9 B m48 | claude-sonnet-5-5 | 4 | 21 | $0.00481 | 1.2 |  |
| 2026-10-24 06:26 | 4108 | check arm 1 sonnet–sonnet #9 m48 | claude-haiku-5-5 | 378 | 57 | $0.00007 | 1.4 |  |
| 2026-10-24 06:26 | 4109 | subject arm 1 sonnet–sonnet #10 A m17 | claude-sonnet-5-5 | 4 | 93 | $0.00322 | 1.8 |  |
| 2026-10-24 06:26 | 4110 | check arm 1 sonnet–sonnet #10 m17 | claude-haiku-5-5 | 476 | 67 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 4111 | subject arm 1 sonnet–sonnet #9 A m49 | claude-sonnet-5-5 | 4 | 11 | $0.00474 | 0.7 |  |
| 2026-10-24 06:26 | 4112 | check arm 1 sonnet–sonnet #9 m49 | claude-haiku-5-5 | 347 | 59 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4113 | subject arm 1 sonnet–sonnet #10 B m18 | claude-sonnet-5-5 | 4 | 88 | $0.00295 | 1.7 |  |
| 2026-10-24 06:26 | 4114 | check arm 1 sonnet–sonnet #10 m18 | claude-haiku-5-5 | 496 | 65 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 4115 | subject arm 1 sonnet–sonnet #9 B m50 | claude-sonnet-5-5 | 4 | 6 | $0.00462 | 0.8 |  |
| 2026-10-24 06:26 | 4116 | check arm 1 sonnet–sonnet #9 m50 | claude-haiku-5-5 | 332 | 49 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 4117 | subject arm 1 sonnet–sonnet #10 A m19 | claude-sonnet-5-5 | 4 | 57 | $0.00271 | 1.7 |  |
| 2026-10-24 06:26 | 4118 | subject arm 1 sonnet–sonnet #9 A m51 | claude-sonnet-5-5 | 4 | 6 | $0.00459 | 0.8 |  |
| 2026-10-24 06:26 | 4119 | check arm 1 sonnet–sonnet #10 m19 | claude-haiku-5-5 | 460 | 72 | $0.00008 | 0.9 |  |
| 2026-10-24 06:26 | 4120 | check arm 1 sonnet–sonnet #9 m51 | claude-haiku-5-5 | 327 | 56 | $0.00006 | 1.1 |  |
| 2026-10-24 06:26 | 4121 | subject arm 1 sonnet–sonnet #9 B m52 | claude-sonnet-5-5 | 4 | 6 | $0.00458 | 0.7 |  |
| 2026-10-24 06:26 | 4122 | subject arm 1 opus–opus #9 A m17 | claude-opus-5-5 | 4 | 2370 | $0.06137 | 31.7 |  |
| 2026-10-24 06:26 | 4123 | subject arm 1 sonnet–sonnet #10 B m20 | claude-sonnet-5-5 | 4 | 170 | $0.00376 | 2.5 |  |
| 2026-10-24 06:26 | 4124 | check arm 1 opus–opus #9 m17 | claude-haiku-5-5 | 2553 | 71 | $0.00029 | 0.9 |  |
| 2026-10-24 06:26 | 4125 | check arm 1 sonnet–sonnet #10 m20 | claude-haiku-5-5 | 442 | 71 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 4126 | check arm 1 sonnet–sonnet #9 m52 | claude-haiku-5-5 | 327 | 55 | $0.00006 | 1.8 |  |
| 2026-10-24 06:26 | 4127 | subject arm 1 sonnet–sonnet #9 A m53 | claude-sonnet-5-5 | 4 | 28 | $0.00480 | 1.2 |  |
| 2026-10-24 06:26 | 4128 | subject arm 1 sonnet–sonnet #10 A m21 | claude-sonnet-5-5 | 4 | 62 | $0.00266 | 1.6 |  |
| 2026-10-24 06:26 | 4129 | check arm 1 sonnet–sonnet #9 m53 | claude-haiku-5-5 | 349 | 57 | $0.00006 | 1.3 |  |
| 2026-10-24 06:26 | 4130 | check arm 1 sonnet–sonnet #10 m21 | claude-haiku-5-5 | 447 | 55 | $0.00007 | 1 |  |
| 2026-10-24 06:26 | 4131 | subject arm 1 sonnet–sonnet #9 B m54 | claude-sonnet-5-5 | 4 | 19 | $0.00477 | 0.8 |  |
| 2026-10-24 06:26 | 4132 | subject arm 1 sonnet–sonnet #10 B m22 | claude-sonnet-5-5 | 4 | 68 | $0.00274 | 1.7 |  |
| 2026-10-24 06:26 | 4133 | check arm 1 sonnet–sonnet #9 m54 | claude-haiku-5-5 | 362 | 58 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 4134 | subject arm 1 sonnet–sonnet #9 A m55 | claude-sonnet-5-5 | 4 | 8 | $0.00469 | 0.6 |  |
| 2026-10-24 06:26 | 4135 | check arm 1 sonnet–sonnet #10 m22 | claude-haiku-5-5 | 445 | 60 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 4136 | check arm 1 sonnet–sonnet #9 m55 | claude-haiku-5-5 | 342 | 69 | $0.00007 | 1 |  |
| 2026-10-24 06:26 | 4137 | subject arm 1 sonnet–sonnet #10 A m23 | claude-sonnet-5-5 | 4 | 61 | $0.00268 | 1.6 |  |
| 2026-10-24 06:26 | 4138 | subject arm 1 sonnet–sonnet #9 B m56 | claude-sonnet-5-5 | 4 | 8 | $0.00465 | 0.8 |  |
| 2026-10-24 06:26 | 4139 | check arm 1 sonnet–sonnet #10 m23 | claude-haiku-5-5 | 444 | 61 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 4140 | check arm 1 sonnet–sonnet #9 m56 | claude-haiku-5-5 | 331 | 51 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 4141 | subject arm 1 sonnet–sonnet #10 B m24 | claude-sonnet-5-5 | 4 | 14 | $0.00222 | 1 |  |
| 2026-10-24 06:26 | 4142 | subject arm 1 sonnet–sonnet #9 A m57 | claude-sonnet-5-5 | 4 | 8 | $0.00462 | 0.7 |  |
| 2026-10-24 06:26 | 4143 | subject arm 1 opus–opus #9 B m18 | claude-opus-5-5 | 4 | 1078 | $0.03596 | 15.9 |  |
| 2026-10-24 06:26 | 4144 | check arm 1 sonnet–sonnet #10 m24 | claude-haiku-5-5 | 390 | 67 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 4145 | check arm 1 opus–opus #9 m18 | claude-haiku-5-5 | 1821 | 73 | $0.00022 | 0.8 |  |
| 2026-10-24 06:26 | 4146 | check arm 1 sonnet–sonnet #9 m57 | claude-haiku-5-5 | 331 | 56 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4147 | subject arm 1 sonnet–sonnet #10 A m25 | claude-sonnet-5-5 | 4 | 6 | $0.00202 | 1 |  |
| 2026-10-24 06:26 | 4148 | check arm 1 sonnet–sonnet #10 m25 | claude-haiku-5-5 | 335 | 53 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4149 | subject arm 1 sonnet–sonnet #9 B m58 | claude-sonnet-5-5 | 4 | 190 | $0.00644 | 2.2 |  |
| 2026-10-24 06:26 | 4150 | check arm 1 sonnet–sonnet #9 m58 | claude-haiku-5-5 | 370 | 56 | $0.00006 | 1.5 |  |
| 2026-10-24 06:26 | 4151 | subject arm 1 sonnet–sonnet #10 B m26 | claude-sonnet-5-5 | 4 | 6 | $0.00189 | 1 |  |
| 2026-10-24 06:26 | 4152 | check arm 1 sonnet–sonnet #10 m26 | claude-haiku-5-5 | 327 | 52 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4153 | subject arm 1 sonnet–sonnet #9 A m59 | claude-sonnet-5-5 | 4 | 130 | $0.00594 | 2.1 |  |
| 2026-10-24 06:26 | 4154 | check arm 1 sonnet–sonnet #9 m59 | claude-haiku-5-5 | 379 | 71 | $0.00007 | 1.3 |  |
| 2026-10-24 06:26 | 4155 | subject arm 1 sonnet–sonnet #10 A m27 | claude-sonnet-5-5 | 4 | 6 | $0.00188 | 0.9 |  |
| 2026-10-24 06:26 | 4156 | check arm 1 sonnet–sonnet #10 m27 | claude-haiku-5-5 | 327 | 49 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 4157 | subject arm 1 sonnet–sonnet #9 B m60 | claude-sonnet-5-5 | 4 | 13 | $0.00480 | 0.8 |  |
| 2026-10-24 06:26 | 4158 | check arm 1 sonnet–sonnet #9 m60 | claude-haiku-5-5 | 345 | 50 | $0.00006 | 1.1 |  |
| 2026-10-24 06:26 | 4159 | subject arm 1 sonnet–sonnet #10 B m28 | claude-sonnet-5-5 | 4 | 95 | $0.00277 | 1.8 |  |
| 2026-10-24 06:26 | 4160 | check arm 1 sonnet–sonnet #10 m28 | claude-haiku-5-5 | 327 | 63 | $0.00006 | 1.4 |  |
| 2026-10-24 06:26 | 4161 | tags 2 arm 1 sonnet–sonnet #9 m1–10 | claude-haiku-5-5 | 6421 | 680 | $0.00098 | 2.2 |  |
| 2026-10-24 06:26 | 4162 | tags 1 arm 1 sonnet–sonnet #9 m11–20 | claude-haiku-5-5 | 9974 | 680 | $0.00134 | 2.3 |  |
| 2026-10-24 06:26 | 4163 | tags 1 arm 1 sonnet–sonnet #9 m1–10 | claude-haiku-5-5 | 6421 | 680 | $0.00098 | 2.9 |  |
| 2026-10-24 06:26 | 4164 | subject arm 1 sonnet–sonnet #10 A m29 | claude-sonnet-5-5 | 4 | 6 | $0.00188 | 0.9 |  |
| 2026-10-24 06:26 | 4165 | check arm 1 sonnet–sonnet #10 m29 | claude-haiku-5-5 | 327 | 48 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 4166 | subject arm 2 opus–opus #10 A m1 | claude-opus-5-5 | 59 | 361 | $0.00746 | 5.2 |  |
| 2026-10-24 06:26 | 4167 | subject arm 1 opus–opus #9 A m19 | claude-opus-5-5 | 4 | 1473 | $0.04042 | 19.3 |  |
| 2026-10-24 06:26 | 4168 | check arm 2 opus–opus #10 m1 | claude-haiku-5-5 | 666 | 64 | $0.00010 | 0.9 |  |
| 2026-10-24 06:26 | 4169 | tags 2 arm 1 sonnet–sonnet #9 m11–20 | claude-haiku-5-5 | 9974 | 680 | $0.00134 | 2.3 |  |
| 2026-10-24 06:26 | 4170 | check arm 1 opus–opus #9 m19 | claude-haiku-5-5 | 1384 | 76 | $0.00018 | 0.8 |  |
| 2026-10-24 06:26 | 4171 | tags 1 arm 1 sonnet–sonnet #9 m21–30 | claude-haiku-5-5 | 9985 | 680 | $0.00134 | 2.3 |  |
| 2026-10-24 06:26 | 4172 | subject arm 1 sonnet–sonnet #10 B m30 | claude-sonnet-5-5 | 4 | 6 | $0.00188 | 1 |  |
| 2026-10-24 06:26 | 4173 | tags 2 arm 1 sonnet–sonnet #9 m21–30 | claude-haiku-5-5 | 9985 | 680 | $0.00134 | 3.7 |  |
| 2026-10-24 06:26 | 4174 | check arm 1 sonnet–sonnet #10 m30 | claude-haiku-5-5 | 327 | 50 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 4175 | subject arm 1 sonnet–sonnet #10 A m31 | claude-sonnet-5-5 | 4 | 6 | $0.00188 | 1 |  |
| 2026-10-24 06:26 | 4176 | tags 1 arm 1 sonnet–sonnet #9 m31–40 | claude-haiku-5-5 | 2159 | 680 | $0.00056 | 2.2 |  |
| 2026-10-24 06:26 | 4177 | tags 2 arm 1 sonnet–sonnet #9 m31–40 | claude-haiku-5-5 | 2159 | 680 | $0.00056 | 2.8 |  |
| 2026-10-24 06:26 | 4178 | check arm 1 sonnet–sonnet #10 m31 | claude-haiku-5-5 | 327 | 48 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 4179 | tags 1 arm 1 sonnet–sonnet #9 m41–50 | claude-haiku-5-5 | 1191 | 680 | $0.00046 | 2.2 |  |
| 2026-10-24 06:26 | 4180 | tags 2 arm 1 sonnet–sonnet #9 m41–50 | claude-haiku-5-5 | 1191 | 680 | $0.00046 | 2.1 |  |
| 2026-10-24 06:26 | 4181 | subject arm 1 sonnet–sonnet #10 B m32 | claude-sonnet-5-5 | 4 | 191 | $0.00373 | 2.5 |  |
| 2026-10-24 06:26 | 4182 | tags 1 arm 1 sonnet–sonnet #9 m51–60 | claude-haiku-5-5 | 1221 | 680 | $0.00046 | 2.4 |  |
| 2026-10-24 06:26 | 4183 | check arm 1 sonnet–sonnet #10 m32 | claude-haiku-5-5 | 394 | 54 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 4184 | tags 2 arm 1 sonnet–sonnet #9 m51–60 | claude-haiku-5-5 | 1221 | 680 | $0.00046 | 3.1 |  |
| 2026-10-24 06:26 | 4185 | subject arm 1 sonnet–sonnet #10 A m33 | claude-sonnet-5-5 | 4 | 18 | $0.00217 | 1 |  |
| 2026-10-24 06:26 | 4186 | check arm 1 sonnet–sonnet #10 m33 | claude-haiku-5-5 | 406 | 62 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 4187 | subject arm 2 opus–opus #10 B m2 | claude-opus-5-5 | 397 | 1272 | $0.02703 | 16.3 |  |
| 2026-10-24 06:26 | 4188 | check arm 2 opus–opus #10 m2 | claude-haiku-5-5 | 1433 | 71 | $0.00018 | 0.6 |  |
| 2026-10-24 06:26 | 4189 | subject arm 1 sonnet–sonnet #10 B m34 | claude-sonnet-5-5 | 4 | 89 | $0.00291 | 1.7 |  |
| 2026-10-24 06:26 | 4190 | tags referee arm 1 sonnet–sonnet #9 m1–10 | claude-opus-5-5 | 6421 | 767 | $0.04102 | 6.4 |  |
| 2026-10-24 06:26 | 4191 | check arm 1 sonnet–sonnet #10 m34 | claude-haiku-5-5 | 342 | 57 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 4192 | subject arm 1 opus–opus #9 B m20 | claude-opus-5-5 | 4 | 1525 | $0.03950 | 19.8 |  |
| 2026-10-24 06:26 | 4193 | tags referee arm 1 sonnet–sonnet #9 m11–20 | claude-opus-5-5 | 9974 | 924 | $0.05838 | 7.8 |  |
| 2026-10-24 06:26 | 4194 | tags referee arm 1 sonnet–sonnet #9 m21–30 | claude-opus-5-5 | 9985 | 680 | $0.05354 | 6.1 |  |
| 2026-10-24 06:26 | 4195 | check arm 1 opus–opus #9 m20 | claude-haiku-5-5 | 1771 | 66 | $0.00021 | 1.6 |  |
| 2026-10-24 06:26 | 4196 | subject arm 1 sonnet–sonnet #10 A m35 | claude-sonnet-5-5 | 4 | 164 | $0.00352 | 2.7 |  |
| 2026-10-24 06:26 | 4197 | check arm 1 sonnet–sonnet #10 m35 | claude-haiku-5-5 | 369 | 60 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 4198 | tags referee arm 1 sonnet–sonnet #9 m31–40 | claude-opus-5-5 | 2159 | 680 | $0.02224 | 5 |  |
| 2026-10-24 06:26 | 4199 | subject arm 1 sonnet–sonnet #10 B m36 | claude-sonnet-5-5 | 4 | 90 | $0.00285 | 1.8 |  |
| 2026-10-24 06:26 | 4200 | check arm 1 sonnet–sonnet #10 m36 | claude-haiku-5-5 | 445 | 60 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 4201 | subject arm 1 opus–opus #9 A m21 | claude-opus-5-5 | 4 | 625 | $0.02351 | 9 |  |
| 2026-10-24 06:26 | 4202 | check arm 1 opus–opus #9 m21 | claude-haiku-5-5 | 1282 | 64 | $0.00016 | 0.8 |  |
| 2026-10-24 06:26 | 4203 | subject arm 1 sonnet–sonnet #10 A m37 | claude-sonnet-5-5 | 4 | 278 | $0.00492 | 3.4 |  |
| 2026-10-24 06:26 | 4204 | check arm 1 sonnet–sonnet #10 m37 | claude-haiku-5-5 | 463 | 61 | $0.00008 | 1.4 |  |
| 2026-10-24 06:26 | 4205 | subject arm 1 sonnet–sonnet #10 B m38 | claude-sonnet-5-5 | 4 | 154 | $0.00373 | 2.7 |  |
| 2026-10-24 06:26 | 4206 | check arm 1 sonnet–sonnet #10 m38 | claude-haiku-5-5 | 442 | 60 | $0.00007 | 0.6 |  |
| 2026-10-24 06:26 | 4207 | subject arm 2 opus–opus #10 A m3 | claude-opus-5-5 | 4 | 1920 | $0.04428 | 23 |  |
| 2026-10-24 06:26 | 4208 | check arm 2 opus–opus #10 m3 | claude-haiku-5-5 | 2174 | 64 | $0.00025 | 0.9 |  |
| 2026-10-24 06:26 | 4209 | subject arm 1 sonnet–sonnet #10 A m39 | claude-sonnet-5-5 | 4 | 11 | $0.00227 | 1 |  |
| 2026-10-24 06:26 | 4210 | subject arm 1 opus–opus #9 B m22 | claude-opus-5-5 | 4 | 665 | $0.02200 | 8.7 |  |
| 2026-10-24 06:26 | 4211 | check arm 1 sonnet–sonnet #10 m39 | claude-haiku-5-5 | 390 | 69 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 4212 | check arm 1 opus–opus #9 m22 | claude-haiku-5-5 | 738 | 65 | $0.00011 | 0.9 |  |
| 2026-10-24 06:26 | 4213 | subject arm 1 sonnet–sonnet #10 B m40 | claude-sonnet-5-5 | 4 | 11 | $0.00215 | 1.3 |  |
| 2026-10-24 06:26 | 4214 | check arm 1 sonnet–sonnet #10 m40 | claude-haiku-5-5 | 337 | 58 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4215 | subject arm 1 sonnet–sonnet #10 A m41 | claude-sonnet-5-5 | 4 | 6 | $0.00198 | 1.1 |  |
| 2026-10-24 06:26 | 4216 | check arm 1 sonnet–sonnet #10 m41 | claude-haiku-5-5 | 332 | 62 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4217 | subject arm 1 sonnet–sonnet #10 B m42 | claude-sonnet-5-5 | 4 | 6 | $0.00197 | 1 |  |
| 2026-10-24 06:26 | 4218 | check arm 1 sonnet–sonnet #10 m42 | claude-haiku-5-5 | 327 | 50 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 4219 | subject arm 1 opus–opus #9 A m23 | claude-opus-5-5 | 4 | 875 | $0.02364 | 11.2 |  |
| 2026-10-24 06:26 | 4220 | check arm 1 opus–opus #9 m23 | claude-haiku-5-5 | 792 | 86 | $0.00012 | 1 |  |
| 2026-10-24 06:26 | 4221 | subject arm 1 sonnet–sonnet #10 A m43 | claude-sonnet-5-5 | 4 | 6 | $0.00196 | 0.8 |  |
| 2026-10-24 06:26 | 4222 | check arm 1 sonnet–sonnet #10 m43 | claude-haiku-5-5 | 327 | 48 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 4223 | subject arm 1 sonnet–sonnet #10 B m44 | claude-sonnet-5-5 | 4 | 106 | $0.00296 | 1.8 |  |
| 2026-10-24 06:26 | 4224 | check arm 1 sonnet–sonnet #10 m44 | claude-haiku-5-5 | 327 | 63 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 4225 | subject arm 1 sonnet–sonnet #10 A m45 | claude-sonnet-5-5 | 4 | 90 | $0.00280 | 1.8 |  |
| 2026-10-24 06:26 | 4226 | check arm 1 sonnet–sonnet #10 m45 | claude-haiku-5-5 | 327 | 50 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 4227 | subject arm 2 opus–opus #10 B m4 | claude-opus-5-5 | 4 | 2234 | $0.05596 | 28.5 |  |
| 2026-10-24 06:26 | 4228 | subject arm 1 opus–opus #9 B m24 | claude-opus-5-5 | 4 | 1006 | $0.02657 | 13.5 |  |
| 2026-10-24 06:26 | 4229 | subject arm 1 sonnet–sonnet #10 B m46 | claude-sonnet-5-5 | 4 | 141 | $0.00331 | 2.2 |  |
| 2026-10-24 06:26 | 4230 | check arm 2 opus–opus #10 m4 | claude-haiku-5-5 | 2548 | 62 | $0.00029 | 1.2 |  |
| 2026-10-24 06:26 | 4231 | check arm 1 sonnet–sonnet #10 m46 | claude-haiku-5-5 | 354 | 62 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 4232 | check arm 1 opus–opus #9 m24 | claude-haiku-5-5 | 788 | 59 | $0.00011 | 1.2 |  |
| 2026-10-24 06:26 | 4233 | subject arm 1 sonnet–sonnet #10 A m47 | claude-sonnet-5-5 | 4 | 70 | $0.00267 | 1.5 |  |
| 2026-10-24 06:26 | 4234 | check arm 1 sonnet–sonnet #10 m47 | claude-haiku-5-5 | 359 | 72 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 4235 | subject arm 1 sonnet–sonnet #10 B m48 | claude-sonnet-5-5 | 4 | 55 | $0.00254 | 1.4 |  |
| 2026-10-24 06:26 | 4236 | check arm 1 sonnet–sonnet #10 m48 | claude-haiku-5-5 | 337 | 58 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4237 | subject arm 1 sonnet–sonnet #10 A m49 | claude-sonnet-5-5 | 4 | 6 | $0.00200 | 1 |  |
| 2026-10-24 06:26 | 4238 | check arm 1 sonnet–sonnet #10 m49 | claude-haiku-5-5 | 332 | 58 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4239 | subject arm 1 opus–opus #9 A m25 | claude-opus-5-5 | 4 | 1103 | $0.02853 | 13.7 |  |
| 2026-10-24 06:26 | 4240 | subject arm 1 sonnet–sonnet #10 B m50 | claude-sonnet-5-5 | 4 | 6 | $0.00199 | 1.2 |  |
| 2026-10-24 06:26 | 4241 | check arm 1 opus–opus #9 m25 | claude-haiku-5-5 | 830 | 91 | $0.00013 | 1 |  |
| 2026-10-24 06:26 | 4242 | check arm 1 sonnet–sonnet #10 m50 | claude-haiku-5-5 | 327 | 47 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4243 | subject arm 1 sonnet–sonnet #10 A m51 | claude-sonnet-5-5 | 4 | 6 | $0.00198 | 0.9 |  |
| 2026-10-24 06:26 | 4244 | check arm 1 sonnet–sonnet #10 m51 | claude-haiku-5-5 | 327 | 50 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4245 | subject arm 1 sonnet–sonnet #10 B m52 | claude-sonnet-5-5 | 4 | 131 | $0.00323 | 2.2 |  |
| 2026-10-24 06:26 | 4246 | subject arm 2 opus–opus #10 A m5 | claude-opus-5-5 | 4 | 1981 | $0.05104 | 24.8 |  |
| 2026-10-24 06:26 | 4247 | check arm 1 sonnet–sonnet #10 m52 | claude-haiku-5-5 | 374 | 56 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 4248 | check arm 2 opus–opus #10 m5 | claude-haiku-5-5 | 2685 | 75 | $0.00031 | 0.9 |  |
| 2026-10-24 06:26 | 4249 | subject arm 1 sonnet–sonnet #10 A m53 | claude-sonnet-5-5 | 4 | 16 | $0.00220 | 0.8 |  |
| 2026-10-24 06:26 | 4250 | check arm 1 sonnet–sonnet #10 m53 | claude-haiku-5-5 | 384 | 51 | $0.00006 | 1.7 |  |
| 2026-10-24 06:26 | 4251 | subject arm 1 sonnet–sonnet #10 B m54 | claude-sonnet-5-5 | 4 | 178 | $0.00384 | 2.4 |  |
| 2026-10-24 06:26 | 4252 | check arm 1 sonnet–sonnet #10 m54 | claude-haiku-5-5 | 358 | 61 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 4253 | subject arm 1 sonnet–sonnet #10 A m55 | claude-sonnet-5-5 | 4 | 6 | $0.00207 | 0.8 |  |
| 2026-10-24 06:26 | 4254 | check arm 1 sonnet–sonnet #10 m55 | claude-haiku-5-5 | 348 | 65 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 4255 | subject arm 1 sonnet–sonnet #10 B m56 | claude-sonnet-5-5 | 4 | 6 | $0.00205 | 1 |  |
| 2026-10-24 06:26 | 4256 | check arm 1 sonnet–sonnet #10 m56 | claude-haiku-5-5 | 327 | 48 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 4257 | subject arm 1 sonnet–sonnet #10 A m57 | claude-sonnet-5-5 | 4 | 6 | $0.00200 | 0.9 |  |
| 2026-10-24 06:26 | 4258 | check arm 1 sonnet–sonnet #10 m57 | claude-haiku-5-5 | 327 | 48 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 4259 | subject arm 1 opus–opus #9 B m26 | claude-opus-5-5 | 4 | 2465 | $0.05603 | 30.1 |  |
| 2026-10-24 06:26 | 4260 | subject arm 2 opus–opus #10 B m6 | claude-opus-5-5 | 4 | 1409 | $0.04050 | 20 |  |
| 2026-10-24 06:26 | 4261 | check arm 1 opus–opus #9 m26 | claude-haiku-5-5 | 1874 | 70 | $0.00022 | 0.8 |  |
| 2026-10-24 06:26 | 4262 | check arm 2 opus–opus #10 m6 | claude-haiku-5-5 | 2323 | 72 | $0.00027 | 1.1 |  |
| 2026-10-24 06:26 | 4263 | subject arm 1 sonnet–sonnet #10 B m58 | claude-sonnet-5-5 | 4 | 182 | $0.00376 | 2.3 |  |
| 2026-10-24 06:26 | 4264 | check arm 1 sonnet–sonnet #10 m58 | claude-haiku-5-5 | 385 | 66 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 4265 | subject arm 1 sonnet–sonnet #10 A m59 | claude-sonnet-5-5 | 4 | 27 | $0.00236 | 1 |  |
| 2026-10-24 06:26 | 4266 | check arm 1 sonnet–sonnet #10 m59 | claude-haiku-5-5 | 406 | 60 | $0.00007 | 1.1 |  |
| 2026-10-24 06:26 | 4267 | subject arm 1 sonnet–sonnet #10 B m60 | claude-sonnet-5-5 | 4 | 11 | $0.00225 | 1.1 |  |
| 2026-10-24 06:26 | 4268 | check arm 1 sonnet–sonnet #10 m60 | claude-haiku-5-5 | 353 | 67 | $0.00007 | 1.2 |  |
| 2026-10-24 06:26 | 4269 | tags 1 arm 1 sonnet–sonnet #10 m11–20 | claude-haiku-5-5 | 4159 | 680 | $0.00076 | 2.4 |  |
| 2026-10-24 06:26 | 4270 | tags 1 arm 1 sonnet–sonnet #10 m1–10 | claude-haiku-5-5 | 7063 | 680 | $0.00105 | 2.4 |  |
| 2026-10-24 06:26 | 4271 | tags 2 arm 1 sonnet–sonnet #10 m1–10 | claude-haiku-5-5 | 7063 | 680 | $0.00105 | 2.5 |  |
| 2026-10-24 06:26 | 4272 | subject arm 2 sonnet–sonnet #10 A m1 | claude-sonnet-5-5 | 59 | 432 | $0.00444 | 5 |  |
| 2026-10-24 06:26 | 4273 | check arm 2 sonnet–sonnet #10 m1 | claude-haiku-5-5 | 758 | 69 | $0.00011 | 0.9 |  |
| 2026-10-24 06:26 | 4274 | tags 2 arm 1 sonnet–sonnet #10 m11–20 | claude-haiku-5-5 | 4159 | 680 | $0.00076 | 2.2 |  |
| 2026-10-24 06:26 | 4275 | tags 2 arm 1 sonnet–sonnet #10 m21–30 | claude-haiku-5-5 | 1366 | 680 | $0.00048 | 2.3 |  |
| 2026-10-24 06:26 | 4276 | tags 1 arm 1 sonnet–sonnet #10 m21–30 | claude-haiku-5-5 | 1366 | 1145 | $0.00071 | 4.1 |  |
| 2026-10-24 06:26 | 4277 | tags 1 arm 1 sonnet–sonnet #10 m31–40 | claude-haiku-5-5 | 1446 | 680 | $0.00048 | 2.2 |  |
| 2026-10-24 06:26 | 4278 | tags 2 arm 1 sonnet–sonnet #10 m31–40 | claude-haiku-5-5 | 1446 | 680 | $0.00048 | 2.2 |  |
| 2026-10-24 06:26 | 4279 | tags 1 arm 1 sonnet–sonnet #10 m41–50 | claude-haiku-5-5 | 1163 | 680 | $0.00046 | 2.4 |  |
| 2026-10-24 06:26 | 4280 | subject arm 2 opus–opus #10 A m7 | claude-opus-5-5 | 4 | 1864 | $0.04802 | 24.8 |  |
| 2026-10-24 06:26 | 4281 | check arm 2 opus–opus #10 m7 | claude-haiku-5-5 | 2221 | 66 | $0.00026 | 1.6 |  |
| 2026-10-24 06:26 | 4282 | tags 2 arm 1 sonnet–sonnet #10 m41–50 | claude-haiku-5-5 | 1163 | 680 | $0.00046 | 2.4 |  |
| 2026-10-24 06:26 | 4283 | subject arm 2 sonnet–sonnet #10 B m2 | claude-sonnet-5-5 | 489 | 735 | $0.00833 | 8.9 |  |
| 2026-10-24 06:26 | 4284 | tags 1 arm 1 sonnet–sonnet #10 m51–60 | claude-haiku-5-5 | 1283 | 680 | $0.00047 | 2.4 |  |
| 2026-10-24 06:26 | 4285 | subject arm 1 opus–opus #9 A m27 | claude-opus-5-5 | 4 | 2424 | $0.06048 | 28.4 |  |
| 2026-10-24 06:26 | 4286 | check arm 2 sonnet–sonnet #10 m2 | claude-haiku-5-5 | 1482 | 78 | $0.00019 | 1.2 |  |
| 2026-10-24 06:26 | 4287 | check arm 1 opus–opus #9 m27 | claude-haiku-5-5 | 2775 | 78 | $0.00032 | 0.8 |  |
| 2026-10-24 06:26 | 4288 | tags 2 arm 1 sonnet–sonnet #10 m51–60 | claude-haiku-5-5 | 1283 | 680 | $0.00047 | 2.3 |  |
| 2026-10-24 06:26 | 4289 | tags referee arm 1 sonnet–sonnet #10 m1–10 | claude-opus-5-5 | 7063 | 680 | $0.04185 | 5.5 |  |
| 2026-10-24 06:26 | 4290 | subject arm 2 sonnet–sonnet #10 A m3 | claude-sonnet-5-5 | 4 | 869 | $0.01175 | 9.9 |  |
| 2026-10-24 06:26 | 4291 | check arm 2 sonnet–sonnet #10 m3 | claude-haiku-5-5 | 1919 | 69 | $0.00023 | 1.2 |  |
| 2026-10-24 06:26 | 4292 | subject arm 1 opus–opus #9 B m28 | claude-opus-5-5 | 4 | 1362 | $0.04380 | 16.7 |  |
| 2026-10-24 06:26 | 4293 | check arm 1 opus–opus #9 m28 | claude-haiku-5-5 | 2168 | 80 | $0.00026 | 1.7 |  |
| 2026-10-24 06:26 | 4294 | subject arm 2 opus–opus #10 B m8 | claude-opus-5-5 | 4 | 1686 | $0.04419 | 22.2 |  |
| 2026-10-24 06:26 | 4295 | check arm 2 opus–opus #10 m8 | claude-haiku-5-5 | 2478 | 71 | $0.00028 | 1.1 |  |
| 2026-10-24 06:26 | 4296 | subject arm 2 sonnet–sonnet #10 B m4 | claude-sonnet-5-5 | 4 | 1048 | $0.01571 | 12.2 |  |
| 2026-10-24 06:26 | 4297 | check arm 2 sonnet–sonnet #10 m4 | claude-haiku-5-5 | 2165 | 76 | $0.00025 | 1.4 |  |
| 2026-10-24 06:26 | 4298 | subject arm 1 opus–opus #9 A m29 | claude-opus-5-5 | 4 | 708 | $0.02794 | 12 |  |
| 2026-10-24 06:26 | 4299 | check arm 1 opus–opus #9 m29 | claude-haiku-5-5 | 1327 | 77 | $0.00017 | 0.8 |  |
| 2026-10-24 06:26 | 4300 | subject arm 2 sonnet–sonnet #10 A m5 | claude-sonnet-5-5 | 4 | 866 | $0.01354 | 9.8 |  |
| 2026-10-24 06:26 | 4301 | check arm 2 sonnet–sonnet #10 m5 | claude-haiku-5-5 | 2162 | 68 | $0.00025 | 1.2 |  |
| 2026-10-24 06:26 | 4302 | subject arm 1 opus–opus #9 B m30 | claude-opus-5-5 | 4 | 358 | $0.01697 | 5.2 |  |
| 2026-10-24 06:26 | 4303 | check arm 1 opus–opus #9 m30 | claude-haiku-5-5 | 768 | 60 | $0.00011 | 1.1 |  |
| 2026-10-24 06:26 | 4304 | subject arm 2 opus–opus #10 A m9 | claude-opus-5-5 | 4 | 1698 | $0.04587 | 21.8 |  |
| 2026-10-24 06:26 | 4305 | check arm 2 opus–opus #10 m9 | claude-haiku-5-5 | 2261 | 82 | $0.00027 | 0.9 |  |
| 2026-10-24 06:26 | 4306 | subject arm 1 opus–opus #9 A m31 | claude-opus-5-5 | 4 | 140 | $0.00995 | 2.9 |  |
| 2026-10-24 06:26 | 4307 | check arm 1 opus–opus #9 m31 | claude-haiku-5-5 | 470 | 63 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 4308 | subject arm 1 opus–opus #9 B m32 | claude-opus-5-5 | 4 | 71 | $0.00715 | 2.2 |  |
| 2026-10-24 06:26 | 4309 | subject arm 2 sonnet–sonnet #10 B m6 | claude-sonnet-5-5 | 4 | 928 | $0.01432 | 11 |  |
| 2026-10-24 06:26 | 4310 | check arm 1 opus–opus #9 m32 | claude-haiku-5-5 | 382 | 67 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 4311 | check arm 2 sonnet–sonnet #10 m6 | claude-haiku-5-5 | 2109 | 76 | $0.00025 | 1 |  |
| 2026-10-24 06:26 | 4312 | subject arm 2 opus–opus #10 B m10 | claude-opus-5-5 | 4 | 628 | $0.02361 | 9.7 |  |
| 2026-10-24 06:26 | 4313 | subject arm 1 opus–opus #9 A m33 | claude-opus-5-5 | 4 | 147 | $0.00825 | 3.2 |  |
| 2026-10-24 06:26 | 4314 | check arm 2 opus–opus #10 m10 | claude-haiku-5-5 | 1624 | 70 | $0.00020 | 1 |  |
| 2026-10-24 06:26 | 4315 | check arm 1 opus–opus #9 m33 | claude-haiku-5-5 | 335 | 61 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 4316 | subject arm 2 opus–opus #10 A m11 | claude-opus-5-5 | 4 | 221 | $0.01250 | 4 |  |
| 2026-10-24 06:26 | 4317 | subject arm 1 opus–opus #9 B m34 | claude-opus-5-5 | 4 | 167 | $0.00842 | 3.4 |  |
| 2026-10-24 06:26 | 4318 | check arm 1 opus–opus #9 m34 | claude-haiku-5-5 | 329 | 49 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 4319 | tags 2 arm 2 opus–opus #10 m1–10 | claude-haiku-5-5 | 9860 | 680 | $0.00133 | 2.2 |  |
| 2026-10-24 06:26 | 4320 | tags 1 arm 2 opus–opus #10 m1–10 | claude-haiku-5-5 | 9860 | 680 | $0.00133 | 2.3 |  |
| 2026-10-24 06:26 | 4321 | subject arm 1 opus–opus #9 A m35 | claude-opus-5-5 | 4 | 132 | $0.00770 | 2.9 |  |
| 2026-10-24 06:26 | 4322 | subject arm 2 sonnet–sonnet #10 A m7 | claude-sonnet-5-5 | 4 | 1441 | $0.01952 | 15.3 |  |
| 2026-10-24 06:26 | 4323 | check arm 1 opus–opus #9 m35 | claude-haiku-5-5 | 325 | 51 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 4324 | check arm 2 sonnet–sonnet #10 m7 | claude-haiku-5-5 | 2002 | 67 | $0.00023 | 0.8 |  |
| 2026-10-24 06:26 | 4325 | subject arm 1 opus–opus #10 A m1 | claude-opus-5-5 | 40 | 506 | $0.01028 | 7.4 |  |
| 2026-10-24 06:26 | 4326 | check arm 1 opus–opus #10 m1 | claude-haiku-5-5 | 781 | 54 | $0.00011 | 0.6 |  |
| 2026-10-24 06:26 | 4327 | subject arm 1 opus–opus #9 B m36 | claude-opus-5-5 | 4 | 188 | $0.00880 | 3.7 |  |
| 2026-10-24 06:26 | 4328 | check arm 1 opus–opus #9 m36 | claude-haiku-5-5 | 362 | 70 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 4329 | subject arm 1 opus–opus #9 A m37 | claude-opus-5-5 | 4 | 101 | $0.00724 | 2.2 |  |
| 2026-10-24 06:26 | 4330 | check arm 1 opus–opus #9 m37 | claude-haiku-5-5 | 371 | 53 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 4331 | subject arm 1 opus–opus #9 B m38 | claude-opus-5-5 | 4 | 61 | $0.00649 | 2 |  |
| 2026-10-24 06:26 | 4332 | subject arm 2 sonnet–sonnet #10 B m8 | claude-sonnet-5-5 | 4 | 1251 | $0.01752 | 14.2 |  |
| 2026-10-24 06:26 | 4333 | check arm 1 opus–opus #9 m38 | claude-haiku-5-5 | 336 | 55 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4334 | check arm 2 sonnet–sonnet #10 m8 | claude-haiku-5-5 | 1789 | 84 | $0.00022 | 0.8 |  |
| 2026-10-24 06:26 | 4335 | subject arm 1 opus–opus #10 B m2 | claude-opus-5-5 | 493 | 880 | $0.01957 | 11.5 |  |
| 2026-10-24 06:26 | 4336 | check arm 1 opus–opus #10 m2 | claude-haiku-5-5 | 1475 | 65 | $0.00018 | 0.8 |  |
| 2026-10-24 06:26 | 4337 | subject arm 1 opus–opus #9 A m39 | claude-opus-5-5 | 4 | 148 | $0.00806 | 3.2 |  |
| 2026-10-24 06:26 | 4338 | check arm 1 opus–opus #9 m39 | claude-haiku-5-5 | 342 | 59 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 4339 | subject arm 1 opus–opus #9 B m40 | claude-opus-5-5 | 4 | 91 | $0.00696 | 2.3 |  |
| 2026-10-24 06:26 | 4340 | check arm 1 opus–opus #9 m40 | claude-haiku-5-5 | 341 | 59 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4341 | subject arm 2 sonnet–sonnet #10 A m9 | claude-sonnet-5-5 | 4 | 1090 | $0.01557 | 12.9 |  |
| 2026-10-24 06:26 | 4342 | subject arm 1 opus–opus #9 A m41 | claude-opus-5-5 | 4 | 101 | $0.00715 | 2.5 |  |
| 2026-10-24 06:26 | 4343 | check arm 2 sonnet–sonnet #10 m9 | claude-haiku-5-5 | 1635 | 65 | $0.00020 | 1 |  |
| 2026-10-24 06:26 | 4344 | check arm 1 opus–opus #9 m41 | claude-haiku-5-5 | 329 | 58 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 4345 | subject arm 1 opus–opus #9 B m42 | claude-opus-5-5 | 4 | 142 | $0.00792 | 2.8 |  |
| 2026-10-24 06:26 | 4346 | check arm 1 opus–opus #9 m42 | claude-haiku-5-5 | 331 | 53 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 4347 | subject arm 1 opus–opus #9 A m43 | claude-opus-5-5 | 4 | 142 | $0.00793 | 3.1 |  |
| 2026-10-24 06:26 | 4348 | subject arm 2 sonnet–sonnet #10 B m10 | claude-sonnet-5-5 | 4 | 875 | $0.01318 | 10.3 |  |
| 2026-10-24 06:26 | 4349 | check arm 1 opus–opus #9 m43 | claude-haiku-5-5 | 333 | 62 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4350 | check arm 2 sonnet–sonnet #10 m10 | claude-haiku-5-5 | 1563 | 79 | $0.00020 | 1.3 |  |
| 2026-10-24 06:26 | 4351 | subject arm 1 opus–opus #9 B m44 | claude-opus-5-5 | 4 | 155 | $0.00820 | 3.5 |  |
| 2026-10-24 06:26 | 4352 | subject arm 1 opus–opus #10 A m3 | claude-opus-5-5 | 4 | 2421 | $0.05442 | 31.5 |  |
| 2026-10-24 06:26 | 4353 | check arm 1 opus–opus #9 m44 | claude-haiku-5-5 | 366 | 65 | $0.00007 | 0.6 |  |
| 2026-10-24 06:26 | 4354 | check arm 1 opus–opus #10 m3 | claude-haiku-5-5 | 2639 | 87 | $0.00031 | 0.7 |  |
| 2026-10-24 06:26 | 4355 | subject arm 2 sonnet–sonnet #10 A m11 | claude-sonnet-5-5 | 4 | 712 | $0.01152 | 8.4 |  |
| 2026-10-24 06:26 | 4356 | subject arm 1 opus–opus #9 A m45 | claude-opus-5-5 | 4 | 159 | $0.00845 | 3 |  |
| 2026-10-24 06:26 | 4357 | check arm 2 sonnet–sonnet #10 m11 | claude-haiku-5-5 | 1670 | 71 | $0.00020 | 0.9 |  |
| 2026-10-24 06:26 | 4358 | check arm 1 opus–opus #9 m45 | claude-haiku-5-5 | 371 | 60 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 4359 | subject arm 1 opus–opus #9 B m46 | claude-opus-5-5 | 4 | 164 | $0.00857 | 3.4 |  |
| 2026-10-24 06:26 | 4360 | check arm 1 opus–opus #9 m46 | claude-haiku-5-5 | 349 | 66 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 4361 | subject arm 1 opus–opus #9 A m47 | claude-opus-5-5 | 4 | 264 | $0.01047 | 5.1 |  |
| 2026-10-24 06:26 | 4362 | subject arm 2 sonnet–sonnet #10 B m12 | claude-sonnet-5-5 | 4 | 1134 | $0.01612 | 12.4 |  |
| 2026-10-24 06:26 | 4363 | check arm 1 opus–opus #9 m47 | claude-haiku-5-5 | 421 | 82 | $0.00008 | 1 |  |
| 2026-10-24 06:26 | 4364 | check arm 2 sonnet–sonnet #10 m12 | claude-haiku-5-5 | 1789 | 72 | $0.00021 | 1.3 |  |
| 2026-10-24 06:26 | 4365 | subject arm 1 opus–opus #9 B m48 | claude-opus-5-5 | 4 | 195 | $0.00945 | 4 |  |
| 2026-10-24 06:26 | 4366 | check arm 1 opus–opus #9 m48 | claude-haiku-5-5 | 451 | 80 | $0.00009 | 1.3 |  |
| 2026-10-24 06:26 | 4367 | subject arm 1 opus–opus #9 A m49 | claude-opus-5-5 | 4 | 43 | $0.00657 | 1.8 |  |
| 2026-10-24 06:26 | 4368 | check arm 1 opus–opus #9 m49 | claude-haiku-5-5 | 381 | 62 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 4369 | subject arm 1 opus–opus #9 B m50 | claude-opus-5-5 | 4 | 6 | $0.00550 | 1.4 |  |
| 2026-10-24 06:26 | 4370 | subject arm 2 sonnet–sonnet #10 A m13 | claude-sonnet-5-5 | 4 | 1280 | $0.01801 | 13 |  |
| 2026-10-24 06:26 | 4371 | check arm 1 opus–opus #9 m50 | claude-haiku-5-5 | 338 | 58 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 4372 | check arm 2 sonnet–sonnet #10 m13 | claude-haiku-5-5 | 1787 | 73 | $0.00022 | 1 |  |
| 2026-10-24 06:26 | 4373 | subject arm 1 opus–opus #10 B m4 | claude-opus-5-5 | 4 | 2836 | $0.07080 | 34.5 |  |
| 2026-10-24 06:26 | 4374 | check arm 1 opus–opus #10 m4 | claude-haiku-5-5 | 3530 | 71 | $0.00039 | 0.6 |  |
| 2026-10-24 06:26 | 4375 | subject arm 1 opus–opus #9 A m51 | claude-opus-5-5 | 4 | 78 | $0.00673 | 2 |  |
| 2026-10-24 06:26 | 4376 | check arm 1 opus–opus #9 m51 | claude-haiku-5-5 | 326 | 50 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 4377 | subject arm 1 opus–opus #9 B m52 | claude-opus-5-5 | 4 | 39 | $0.00589 | 2.1 |  |
| 2026-10-24 06:26 | 4378 | check arm 1 opus–opus #9 m52 | claude-haiku-5-5 | 325 | 51 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4379 | subject arm 1 opus–opus #9 A m53 | claude-opus-5-5 | 4 | 47 | $0.00605 | 3.1 |  |
| 2026-10-24 06:26 | 4380 | subject arm 2 sonnet–sonnet #10 B m14 | claude-sonnet-5-5 | 4 | 1324 | $0.01859 | 13.6 |  |
| 2026-10-24 06:26 | 4381 | check arm 2 sonnet–sonnet #10 m14 | claude-haiku-5-5 | 1650 | 81 | $0.00021 | 1.4 |  |
| 2026-10-24 06:26 | 4382 | check arm 1 opus–opus #9 m53 | claude-haiku-5-5 | 325 | 53 | $0.00006 | 3.2 |  |
| 2026-10-24 06:26 | 4383 | subject arm 1 opus–opus #9 B m54 | claude-opus-5-5 | 4 | 69 | $0.00649 | 2 |  |
| 2026-10-24 06:26 | 4384 | check arm 1 opus–opus #9 m54 | claude-haiku-5-5 | 325 | 55 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4385 | subject arm 1 opus–opus #9 A m55 | claude-opus-5-5 | 4 | 65 | $0.00641 | 1.8 |  |
| 2026-10-24 06:26 | 4386 | check arm 1 opus–opus #9 m55 | claude-haiku-5-5 | 325 | 51 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 4387 | subject arm 1 opus–opus #9 B m56 | claude-opus-5-5 | 4 | 88 | $0.00687 | 2.2 |  |
| 2026-10-24 06:26 | 4388 | check arm 1 opus–opus #9 m56 | claude-haiku-5-5 | 325 | 51 | $0.00006 | 1 |  |
| 2026-10-24 06:26 | 4389 | subject arm 2 sonnet–sonnet #10 A m15 | claude-sonnet-5-5 | 4 | 1242 | $0.01758 | 13.1 |  |
| 2026-10-24 06:26 | 4390 | check arm 2 sonnet–sonnet #10 m15 | claude-haiku-5-5 | 1724 | 75 | $0.00021 | 1.8 |  |
| 2026-10-24 06:26 | 4391 | subject arm 1 opus–opus #10 A m5 | claude-opus-5-5 | 4 | 2539 | $0.06711 | 32.9 |  |
| 2026-10-24 06:26 | 4392 | subject arm 1 opus–opus #9 A m57 | claude-opus-5-5 | 4 | 126 | $0.00763 | 2.8 |  |
| 2026-10-24 06:26 | 4393 | check arm 1 opus–opus #9 m57 | claude-haiku-5-5 | 325 | 51 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 4394 | check arm 1 opus–opus #10 m5 | claude-haiku-5-5 | 3379 | 73 | $0.00037 | 1 |  |
| 2026-10-24 06:26 | 4395 | subject arm 1 opus–opus #9 B m58 | claude-opus-5-5 | 4 | 86 | $0.00683 | 2.5 |  |
| 2026-10-24 06:26 | 4396 | check arm 1 opus–opus #9 m58 | claude-haiku-5-5 | 325 | 51 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 4397 | subject arm 2 sonnet–sonnet #10 B m16 | claude-sonnet-5-5 | 4 | 1073 | $0.01621 | 11.7 |  |
| 2026-10-24 06:26 | 4398 | subject arm 1 opus–opus #9 A m59 | claude-opus-5-5 | 4 | 88 | $0.00688 | 2 |  |
| 2026-10-24 06:26 | 4399 | check arm 2 sonnet–sonnet #10 m16 | claude-haiku-5-5 | 1707 | 79 | $0.00021 | 0.8 |  |
| 2026-10-24 06:26 | 4400 | check arm 1 opus–opus #9 m59 | claude-haiku-5-5 | 325 | 52 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4401 | subject arm 1 opus–opus #9 B m60 | claude-opus-5-5 | 4 | 46 | $0.00604 | 2.7 |  |
| 2026-10-24 06:26 | 4402 | check arm 1 opus–opus #9 m60 | claude-haiku-5-5 | 325 | 51 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 4403 | subject arm 1 opus–opus #10 B m6 | claude-opus-5-5 | 4 | 1238 | $0.04066 | 15.3 |  |
| 2026-10-24 06:26 | 4404 | check arm 1 opus–opus #10 m6 | claude-haiku-5-5 | 2610 | 75 | $0.00030 | 0.9 |  |
| 2026-10-24 06:26 | 4405 | tags 2 arm 1 opus–opus #9 m1–10 | claude-haiku-5-5 | 10296 | 680 | $0.00137 | 2.3 |  |
| 2026-10-24 06:26 | 4406 | tags 1 arm 1 opus–opus #9 m1–10 | claude-haiku-5-5 | 10296 | 680 | $0.00137 | 2.3 |  |
| 2026-10-24 06:26 | 4407 | tags 1 arm 1 opus–opus #9 m11–20 | claude-haiku-5-5 | 12804 | 680 | $0.00162 | 2.7 |  |
| 2026-10-24 06:26 | 4408 | tags 2 arm 1 opus–opus #9 m21–30 | claude-haiku-5-5 | 6585 | 680 | $0.00100 | 2.4 |  |
| 2026-10-24 06:26 | 4409 | tags 2 arm 1 opus–opus #9 m11–20 | claude-haiku-5-5 | 12804 | 680 | $0.00162 | 2.8 |  |
| 2026-10-24 06:26 | 4410 | tags 1 arm 1 opus–opus #9 m21–30 | claude-haiku-5-5 | 6585 | 680 | $0.00100 | 4 |  |
| 2026-10-24 06:26 | 4411 | subject arm 2 sonnet–sonnet #10 A m17 | claude-sonnet-5-5 | 4 | 1339 | $0.01896 | 14.1 |  |
| 2026-10-24 06:26 | 4412 | subject arm 2 fable–fable #10 A m1 | claude-fable-5-1 | 59 | 457 | $0.02344 | 9.6 |  |
| 2026-10-24 06:26 | 4413 | check arm 2 sonnet–sonnet #10 m17 | claude-haiku-5-5 | 1703 | 100 | $0.00022 | 1.8 |  |
| 2026-10-24 06:26 | 4414 | check arm 2 fable–fable #10 m1 | claude-haiku-5-5 | 709 | 65 | $0.00010 | 0.9 |  |
| 2026-10-24 06:26 | 4415 | tags 1 arm 1 opus–opus #9 m31–40 | claude-haiku-5-5 | 1329 | 680 | $0.00047 | 2.2 |  |
| 2026-10-24 06:26 | 4416 | tags 2 arm 1 opus–opus #9 m31–40 | claude-haiku-5-5 | 1329 | 680 | $0.00047 | 2.3 |  |
| 2026-10-24 06:26 | 4417 | tags 1 arm 1 opus–opus #9 m41–50 | claude-haiku-5-5 | 1321 | 1244 | $0.00075 | 4.7 |  |
| 2026-10-24 06:26 | 4418 | tags 1 arm 1 opus–opus #9 m51–60 | claude-haiku-5-5 | 1111 | 680 | $0.00045 | 2.8 |  |
| 2026-10-24 06:26 | 4419 | tags 2 arm 1 opus–opus #9 m41–50 | claude-haiku-5-5 | 1321 | 1180 | $0.00072 | 4.3 |  |
| 2026-10-24 06:26 | 4420 | tags 2 arm 1 opus–opus #9 m51–60 | claude-haiku-5-5 | 1111 | 680 | $0.00045 | 2.2 |  |
| 2026-10-24 06:26 | 4421 | subject arm 1 opus–opus #10 A m7 | claude-opus-5-5 | 4 | 1417 | $0.04071 | 19.1 |  |
| 2026-10-24 06:26 | 4422 | check arm 1 opus–opus #10 m7 | claude-haiku-5-5 | 2216 | 99 | $0.00027 | 1.2 |  |
| 2026-10-24 06:26 | 4423 | subject arm 2 sonnet–sonnet #10 B m18 | claude-sonnet-5-5 | 4 | 1219 | $0.01790 | 12.8 |  |
| 2026-10-24 06:26 | 4424 | tags referee arm 1 opus–opus #9 m31–40 | claude-opus-5-5 | 1329 | 680 | $0.01892 | 5.2 |  |
| 2026-10-24 06:26 | 4425 | check arm 2 sonnet–sonnet #10 m18 | claude-haiku-5-5 | 1864 | 82 | $0.00023 | 3.3 |  |
| 2026-10-24 06:26 | 4426 | subject arm 2 sonnet–sonnet #10 A m19 | claude-sonnet-5-5 | 4 | 870 | $0.01494 | 10 |  |
| 2026-10-24 06:26 | 4427 | check arm 2 sonnet–sonnet #10 m19 | claude-haiku-5-5 | 1566 | 71 | $0.00019 | 0.9 |  |
| 2026-10-24 06:26 | 4428 | subject arm 2 sonnet–sonnet #10 B m20 | claude-sonnet-5-5 | 4 | 5 | $0.00570 | 1.2 |  |
| 2026-10-24 06:26 | 4429 | subject arm 2 fable–fable #10 B m2 | claude-fable-5-1 | 440 | 1452 | $0.07700 | 29.1 |  |
| 2026-10-24 06:26 | 4430 | check arm 2 fable–fable #10 m2 | claude-haiku-5-5 | 1549 | 67 | $0.00019 | 0.7 |  |
| 2026-10-24 06:26 | 4431 | tags 1 arm 2 sonnet–sonnet #10 m11–19 | claude-haiku-5-5 | 7914 | 613 | $0.00110 | 2.2 |  |
| 2026-10-24 06:26 | 4432 | tags 1 arm 2 sonnet–sonnet #10 m1–10 | claude-haiku-5-5 | 8562 | 680 | $0.00120 | 2.4 |  |
| 2026-10-24 06:26 | 4433 | tags 2 arm 2 sonnet–sonnet #10 m1–10 | claude-haiku-5-5 | 8562 | 680 | $0.00120 | 2.4 |  |
| 2026-10-24 06:26 | 4434 | subject arm 1 opus–opus #10 B m8 | claude-opus-5-5 | 4 | 1567 | $0.04204 | 20.6 |  |
| 2026-10-24 06:26 | 4435 | check arm 1 opus–opus #10 m8 | claude-haiku-5-5 | 2348 | 79 | $0.00027 | 1.1 |  |
| 2026-10-24 06:26 | 4436 | tags 2 arm 2 sonnet–sonnet #10 m11–19 | claude-haiku-5-5 | 7914 | 613 | $0.00110 | 2.3 |  |
| 2026-10-24 06:26 | 4437 | tags referee arm 2 sonnet–sonnet #10 m11–19 | claude-opus-5-5 | 7914 | 787 | $0.04740 | 6.5 |  |
| 2026-10-24 06:26 | 4438 | subject arm 1 fable–fable #10 A m1 | claude-fable-5-1 | 40 | 572 | $0.02900 | 11.9 |  |
| 2026-10-24 06:26 | 4439 | check arm 1 fable–fable #10 m1 | claude-haiku-5-5 | 819 | 65 | $0.00011 | 1.4 |  |
| 2026-10-24 06:26 | 4440 | subject arm 1 opus–opus #10 A m9 | claude-opus-5-5 | 4 | 2068 | $0.05288 | 28.1 |  |
| 2026-10-24 06:26 | 4441 | check arm 1 opus–opus #10 m9 | claude-haiku-5-5 | 2478 | 76 | $0.00029 | 1 |  |
| 2026-10-24 06:26 | 4442 | subject arm 2 fable–fable #10 A m3 | claude-fable-5-1 | 4 | 1795 | $0.10590 | 35.1 |  |
| 2026-10-24 06:26 | 4443 | check arm 2 fable–fable #10 m3 | claude-haiku-5-5 | 1996 | 75 | $0.00024 | 0.8 |  |
| 2026-10-24 06:26 | 4444 | subject arm 1 fable–fable #10 B m2 | claude-fable-5-1 | 4 | 1241 | $0.06868 | 25.8 |  |
| 2026-10-24 06:26 | 4445 | check arm 1 fable–fable #10 m2 | claude-haiku-5-5 | 1873 | 80 | $0.00023 | 0.8 |  |
| 2026-10-24 06:26 | 4446 | subject arm 1 opus–opus #10 B m10 | claude-opus-5-5 | 4 | 2362 | $0.05963 | 30.8 |  |
| 2026-10-24 06:26 | 4447 | check arm 1 opus–opus #10 m10 | claude-haiku-5-5 | 3085 | 80 | $0.00035 | 1 |  |
| 2026-10-24 06:26 | 4448 | subject arm 2 fable–fable #10 B m4 | claude-fable-5-1 | 4 | 1620 | $0.10750 | 30.5 |  |
| 2026-10-24 06:26 | 4449 | check arm 2 fable–fable #10 m4 | claude-haiku-5-5 | 1857 | 69 | $0.00022 | 0.8 |  |
| 2026-10-24 06:26 | 4450 | subject arm 1 fable–fable #10 A m3 | claude-fable-5-1 | 4 | 1836 | $0.11177 | 35.5 |  |
| 2026-10-24 06:26 | 4451 | check arm 1 fable–fable #10 m3 | claude-haiku-5-5 | 2568 | 69 | $0.00029 | 0.8 |  |
| 2026-10-24 06:26 | 4452 | subject arm 1 opus–opus #10 A m11 | claude-opus-5-5 | 4 | 1563 | $0.04687 | 20.6 |  |
| 2026-10-24 06:26 | 4453 | check arm 1 opus–opus #10 m11 | claude-haiku-5-5 | 2938 | 77 | $0.00033 | 0.9 |  |
| 2026-10-24 06:26 | 4454 | subject arm 2 fable–fable #10 A m5 | claude-fable-5-1 | 4 | 2233 | $0.13129 | 35.3 |  |
| 2026-10-24 06:26 | 4455 | check arm 2 fable–fable #10 m5 | claude-haiku-5-5 | 2187 | 78 | $0.00026 | 0.9 |  |
| 2026-10-24 06:26 | 4456 | subject arm 1 fable–fable #10 B m4 | claude-fable-5-1 | 4 | 3121 | $0.18438 | 56.7 |  |
| 2026-10-24 06:26 | 4457 | check arm 1 fable–fable #10 m4 | claude-haiku-5-5 | 3080 | 75 | $0.00035 | 0.8 |  |
| 2026-10-24 06:26 | 4458 | subject arm 1 opus–opus #10 B m12 | claude-opus-5-5 | 4 | 5282 | $0.12076 | 57.4 |  |
| 2026-10-24 06:26 | 4459 | check arm 1 opus–opus #10 m12 | claude-haiku-5-5 | 2150 | 66 | $0.00025 | 0.9 |  |
| 2026-10-24 06:26 | 4460 | subject arm 2 fable–fable #10 B m6 | claude-fable-5-1 | 4 | 2949 | $0.17142 | 48.3 |  |
| 2026-10-24 06:26 | 4461 | check arm 2 fable–fable #10 m6 | claude-haiku-5-5 | 2714 | 80 | $0.00031 | 0.9 |  |
| 2026-10-24 06:26 | 4462 | subject arm 1 opus–opus #10 A m13 | claude-opus-5-5 | 4 | 1929 | $0.05007 | 19.8 |  |
| 2026-10-24 06:26 | 4463 | check arm 1 opus–opus #10 m13 | claude-haiku-5-5 | 2178 | 80 | $0.00026 | 1 |  |
| 2026-10-24 06:26 | 4464 | subject arm 2 fable–fable #10 A m7 | claude-fable-5-1 | 4 | 1358 | $0.09864 | 27 |  |
| 2026-10-24 06:26 | 4465 | subject arm 1 opus–opus #10 B m14 | claude-opus-5-5 | 4 | 1095 | $0.03374 | 13.5 |  |
| 2026-10-24 06:26 | 4466 | check arm 1 opus–opus #10 m14 | claude-haiku-5-5 | 1917 | 85 | $0.00023 | 1.1 |  |
| 2026-10-24 06:26 | 4467 | check arm 2 fable–fable #10 m7 | claude-haiku-5-5 | 2334 | 86 | $0.00028 | 1.9 |  |
| 2026-10-24 06:26 | 4468 | subject arm 1 fable–fable #10 A m5 | claude-fable-5-1 | 4 | 2856 | $0.17780 | 49.8 |  |
| 2026-10-24 06:26 | 4469 | tags 2 arm 2 fable–fable #10 m1–7 | claude-haiku-5-5 | 6936 | 479 | $0.00093 | 1.8 |  |
| 2026-10-24 06:26 | 4470 | tags 1 arm 2 fable–fable #10 m1–7 | claude-haiku-5-5 | 6936 | 479 | $0.00093 | 1.9 |  |
| 2026-10-24 06:26 | 4471 | check arm 1 fable–fable #10 m5 | claude-haiku-5-5 | 3357 | 73 | $0.00037 | 0.8 |  |
| 2026-10-24 06:26 | 4472 | tags referee arm 2 fable–fable #10 m1–7 | claude-opus-5-5 | 6936 | 479 | $0.03732 | 3.7 |  |
| 2026-10-24 06:26 | 4473 | subject arm 1 opus–opus #10 A m15 | claude-opus-5-5 | 4 | 2082 | $0.05233 | 22.9 |  |
| 2026-10-24 06:26 | 4474 | check arm 1 opus–opus #10 m15 | claude-haiku-5-5 | 1315 | 62 | $0.00016 | 1.2 |  |
| 2026-10-24 06:26 | 4475 | subject arm 1 opus–opus #10 B m16 | claude-opus-5-5 | 4 | 1604 | $0.03998 | 17.4 |  |
| 2026-10-24 06:26 | 4476 | check arm 1 opus–opus #10 m16 | claude-haiku-5-5 | 1651 | 74 | $0.00020 | 1.1 |  |
| 2026-10-24 06:26 | 4477 | subject arm 1 fable–fable #10 B m6 | claude-fable-5-1 | 4 | 2583 | $0.16791 | 48.1 |  |
| 2026-10-24 06:26 | 4478 | check arm 1 fable–fable #10 m6 | claude-haiku-5-5 | 3255 | 89 | $0.00037 | 0.7 |  |
| 2026-10-24 06:26 | 4479 | subject arm 1 opus–opus #10 A m17 | claude-opus-5-5 | 4 | 744 | $0.02457 | 10.3 |  |
| 2026-10-24 06:26 | 4480 | check arm 1 opus–opus #10 m17 | claude-haiku-5-5 | 1650 | 71 | $0.00020 | 0.8 |  |
| 2026-10-24 06:26 | 4481 | subject arm 1 opus–opus #10 B m18 | claude-opus-5-5 | 4 | 300 | $0.01578 | 5.2 |  |
| 2026-10-24 06:26 | 4482 | check arm 1 opus–opus #10 m18 | claude-haiku-5-5 | 1035 | 67 | $0.00014 | 3.6 |  |
| 2026-10-24 06:26 | 4483 | subject arm 1 opus–opus #10 A m19 | claude-opus-5-5 | 4 | 75 | $0.00837 | 2 |  |
| 2026-10-24 06:26 | 4484 | check arm 1 opus–opus #10 m19 | claude-haiku-5-5 | 580 | 54 | $0.00009 | 1.2 |  |
| 2026-10-24 06:26 | 4485 | subject arm 1 opus–opus #10 B m20 | claude-opus-5-5 | 4 | 132 | $0.00733 | 2.3 |  |
| 2026-10-24 06:26 | 4486 | check arm 1 opus–opus #10 m20 | claude-haiku-5-5 | 349 | 58 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 4487 | subject arm 1 opus–opus #10 A m21 | claude-opus-5-5 | 4 | 81 | $0.00521 | 1.9 |  |
| 2026-10-24 06:26 | 4488 | check arm 1 opus–opus #10 m21 | claude-haiku-5-5 | 335 | 56 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4489 | subject arm 1 opus–opus #10 B m22 | claude-opus-5-5 | 4 | 104 | $0.00560 | 2.3 |  |
| 2026-10-24 06:26 | 4490 | check arm 1 opus–opus #10 m22 | claude-haiku-5-5 | 343 | 57 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 4491 | subject arm 1 opus–opus #10 A m23 | claude-opus-5-5 | 4 | 158 | $0.00672 | 2.7 |  |
| 2026-10-24 06:26 | 4492 | check arm 1 opus–opus #10 m23 | claude-haiku-5-5 | 340 | 64 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 4493 | subject arm 1 fable–fable #10 A m7 | claude-fable-5-1 | 4 | 2248 | $0.15028 | 42.6 |  |
| 2026-10-24 06:26 | 4494 | check arm 1 fable–fable #10 m7 | claude-haiku-5-5 | 2990 | 77 | $0.00034 | 0.7 |  |
| 2026-10-24 06:26 | 4495 | subject arm 1 opus–opus #10 B m24 | claude-opus-5-5 | 4 | 179 | $0.00713 | 3.2 |  |
| 2026-10-24 06:26 | 4496 | check arm 1 opus–opus #10 m24 | claude-haiku-5-5 | 331 | 50 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 4497 | subject arm 1 opus–opus #10 A m25 | claude-opus-5-5 | 4 | 244 | $0.00839 | 3.7 |  |
| 2026-10-24 06:26 | 4498 | check arm 1 opus–opus #10 m25 | claude-haiku-5-5 | 346 | 54 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 4499 | subject arm 1 opus–opus #10 B m26 | claude-opus-5-5 | 4 | 177 | $0.00713 | 3.2 |  |
| 2026-10-24 06:26 | 4500 | check arm 1 opus–opus #10 m26 | claude-haiku-5-5 | 347 | 65 | $0.00007 | 1.1 |  |
| 2026-10-24 06:26 | 4501 | subject arm 1 opus–opus #10 A m27 | claude-opus-5-5 | 4 | 214 | $0.00787 | 3.6 |  |
| 2026-10-24 06:26 | 4502 | check arm 1 opus–opus #10 m27 | claude-haiku-5-5 | 393 | 62 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 4503 | subject arm 1 opus–opus #10 B m28 | claude-opus-5-5 | 4 | 154 | $0.00691 | 3.1 |  |
| 2026-10-24 06:26 | 4504 | check arm 1 opus–opus #10 m28 | claude-haiku-5-5 | 424 | 66 | $0.00008 | 0.7 |  |
| 2026-10-24 06:26 | 4505 | subject arm 1 fable–fable #10 B m8 | claude-fable-5-1 | 4 | 1481 | $0.10898 | 28.6 |  |
| 2026-10-24 06:26 | 4506 | subject arm 1 opus–opus #10 A m29 | claude-opus-5-5 | 4 | 116 | $0.00630 | 2.4 |  |
| 2026-10-24 06:26 | 4507 | check arm 1 fable–fable #10 m8 | claude-haiku-5-5 | 2451 | 80 | $0.00029 | 0.8 |  |
| 2026-10-24 06:26 | 4508 | check arm 1 opus–opus #10 m29 | claude-haiku-5-5 | 364 | 59 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 4509 | subject arm 1 opus–opus #10 B m30 | claude-opus-5-5 | 4 | 67 | $0.00504 | 1.9 |  |
| 2026-10-24 06:26 | 4510 | check arm 1 opus–opus #10 m30 | claude-haiku-5-5 | 334 | 49 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 4511 | subject arm 1 opus–opus #10 A m31 | claude-opus-5-5 | 4 | 177 | $0.00710 | 3 |  |
| 2026-10-24 06:26 | 4512 | check arm 1 opus–opus #10 m31 | claude-haiku-5-5 | 336 | 55 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 4513 | subject arm 1 fable–fable #10 A m9 | claude-fable-5-1 | 4 | 476 | $0.05236 | 11.4 |  |
| 2026-10-24 06:26 | 4514 | check arm 1 fable–fable #10 m9 | claude-haiku-5-5 | 1652 | 87 | $0.00021 | 1.3 |  |
| 2026-10-24 06:26 | 4515 | subject arm 1 opus–opus #10 B m32 | claude-opus-5-5 | 4 | 205 | $0.00767 | 3.5 |  |
| 2026-10-24 06:26 | 4516 | check arm 1 opus–opus #10 m32 | claude-haiku-5-5 | 346 | 62 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 4517 | check referee arm 1 fable–fable #10 m9 | claude-opus-5-5 | 1652 | 61 | $0.00783 | 1.8 |  |
| 2026-10-24 06:26 | 4518 | subject arm 1 opus–opus #10 A m33 | claude-opus-5-5 | 4 | 175 | $0.00712 | 3.3 |  |
| 2026-10-24 06:26 | 4519 | check arm 1 opus–opus #10 m33 | claude-haiku-5-5 | 351 | 67 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 4520 | subject arm 1 fable–fable #10 B m10 | claude-fable-5-1 | 4 | 338 | $0.03578 | 7.3 |  |
| 2026-10-24 06:26 | 4521 | subject arm 1 opus–opus #10 B m34 | claude-opus-5-5 | 4 | 87 | $0.00539 | 2 |  |
| 2026-10-24 06:26 | 4522 | check arm 1 fable–fable #10 m10 | claude-haiku-5-5 | 996 | 70 | $0.00013 | 1.7 |  |
| 2026-10-24 06:26 | 4523 | check arm 1 opus–opus #10 m34 | claude-haiku-5-5 | 346 | 47 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 4524 | subject arm 1 fable–fable #10 A m11 | claude-fable-5-1 | 4 | 109 | $0.01636 | 3.5 |  |
| 2026-10-24 06:26 | 4525 | subject arm 1 opus–opus #10 A m35 | claude-opus-5-5 | 4 | 130 | $0.00623 | 2.6 |  |
| 2026-10-24 06:26 | 4526 | check arm 1 fable–fable #10 m11 | claude-haiku-5-5 | 704 | 61 | $0.00010 | 0.9 |  |
| 2026-10-24 06:26 | 4527 | check arm 1 opus–opus #10 m35 | claude-haiku-5-5 | 335 | 66 | $0.00007 | 1 |  |
| 2026-10-24 06:26 | 4528 | subject arm 1 fable–fable #10 B m12 | claude-fable-5-1 | 4 | 102 | $0.01246 | 3.4 |  |
| 2026-10-24 06:26 | 4529 | subject arm 1 opus–opus #10 B m36 | claude-opus-5-5 | 4 | 225 | $0.00807 | 3.6 |  |
| 2026-10-24 06:26 | 4530 | check arm 1 fable–fable #10 m12 | claude-haiku-5-5 | 526 | 66 | $0.00009 | 0.8 |  |
| 2026-10-24 06:26 | 4531 | check arm 1 opus–opus #10 m36 | claude-haiku-5-5 | 346 | 72 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 4532 | subject arm 1 fable–fable #10 A m13 | claude-fable-5-1 | 4 | 46 | $0.00751 | 1.9 |  |
| 2026-10-24 06:26 | 4533 | check arm 1 fable–fable #10 m13 | claude-haiku-5-5 | 463 | 61 | $0.00008 | 1.8 |  |
| 2026-10-24 06:26 | 4534 | subject arm 1 opus–opus #10 A m37 | claude-opus-5-5 | 4 | 272 | $0.00907 | 4.8 |  |
| 2026-10-24 06:26 | 4535 | check arm 1 opus–opus #10 m37 | claude-haiku-5-5 | 346 | 67 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 4536 | subject arm 1 fable–fable #10 B m14 | claude-fable-5-1 | 4 | 338 | $0.02135 | 7.6 |  |
| 2026-10-24 06:26 | 4537 | check arm 1 fable–fable #10 m14 | claude-haiku-5-5 | 496 | 75 | $0.00009 | 1.3 |  |
| 2026-10-24 06:26 | 4538 | subject arm 1 opus–opus #10 B m38 | claude-opus-5-5 | 4 | 280 | $0.00923 | 7.8 |  |
| 2026-10-24 06:26 | 4539 | check arm 1 opus–opus #10 m38 | claude-haiku-5-5 | 431 | 60 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 4540 | subject arm 1 fable–fable #10 A m15 | claude-fable-5-1 | 4 | 75 | $0.00863 | 1.9 |  |
| 2026-10-24 06:26 | 4541 | check arm 1 fable–fable #10 m15 | claude-haiku-5-5 | 455 | 59 | $0.00007 | 1 |  |
| 2026-10-24 06:26 | 4542 | subject arm 1 fable–fable #10 B m16 | claude-fable-5-1 | 4 | 5 | $0.00463 | 1 |  |
| 2026-10-24 06:26 | 4543 | check arm 1 fable–fable #10 m16 | claude-haiku-5-5 | 325 | 52 | $0.00006 | 1.3 |  |
| 2026-10-24 06:26 | 4544 | subject arm 1 opus–opus #10 A m39 | claude-opus-5-5 | 4 | 273 | $0.00952 | 4 |  |
| 2026-10-24 06:26 | 4545 | check arm 1 opus–opus #10 m39 | claude-haiku-5-5 | 550 | 74 | $0.00009 | 0.7 |  |
| 2026-10-24 06:26 | 4546 | subject arm 1 fable–fable #10 A m17 | claude-fable-5-1 | 4 | 173 | $0.01144 | 3.5 |  |
| 2026-10-24 06:26 | 4547 | check arm 1 fable–fable #10 m17 | claude-haiku-5-5 | 340 | 79 | $0.00007 | 0.9 |  |
| 2026-10-24 06:26 | 4548 | subject arm 1 opus–opus #10 B m40 | claude-opus-5-5 | 4 | 123 | $0.00712 | 2.8 |  |
| 2026-10-24 06:26 | 4549 | check arm 1 opus–opus #10 m40 | claude-haiku-5-5 | 513 | 67 | $0.00008 | 1.5 |  |
| 2026-10-24 06:26 | 4550 | subject arm 1 opus–opus #10 A m41 | claude-opus-5-5 | 4 | 87 | $0.00624 | 2.2 |  |
| 2026-10-24 06:26 | 4551 | subject arm 1 fable–fable #10 B m18 | claude-fable-5-1 | 4 | 213 | $0.01363 | 4.2 |  |
| 2026-10-24 06:26 | 4552 | check arm 1 opus–opus #10 m41 | claude-haiku-5-5 | 403 | 53 | $0.00007 | 1.3 |  |
| 2026-10-24 06:26 | 4553 | check arm 1 fable–fable #10 m18 | claude-haiku-5-5 | 338 | 55 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 4554 | subject arm 1 opus–opus #10 B m42 | claude-opus-5-5 | 4 | 82 | $0.00561 | 2.1 |  |
| 2026-10-24 06:26 | 4555 | check arm 1 opus–opus #10 m42 | claude-haiku-5-5 | 344 | 53 | $0.00006 | 1.7 |  |
| 2026-10-24 06:26 | 4556 | subject arm 1 fable–fable #10 A m19 | claude-fable-5-1 | 4 | 167 | $0.01131 | 3.6 |  |
| 2026-10-24 06:26 | 4557 | check arm 1 fable–fable #10 m19 | claude-haiku-5-5 | 328 | 62 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 4558 | subject arm 1 opus–opus #10 A m43 | claude-opus-5-5 | 4 | 171 | $0.00711 | 3.4 |  |
| 2026-10-24 06:26 | 4559 | check arm 1 opus–opus #10 m43 | claude-haiku-5-5 | 336 | 57 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4560 | subject arm 1 fable–fable #10 B m20 | claude-fable-5-1 | 4 | 164 | $0.01104 | 4.4 |  |
| 2026-10-24 06:26 | 4561 | check arm 1 fable–fable #10 m20 | claude-haiku-5-5 | 328 | 45 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4562 | subject arm 1 opus–opus #10 B m44 | claude-opus-5-5 | 4 | 81 | $0.00527 | 2.2 |  |
| 2026-10-24 06:26 | 4563 | check arm 1 opus–opus #10 m44 | claude-haiku-5-5 | 331 | 49 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 4564 | subject arm 1 fable–fable #10 A m21 | claude-fable-5-1 | 4 | 150 | $0.01034 | 3 |  |
| 2026-10-24 06:26 | 4565 | subject arm 1 opus–opus #10 A m45 | claude-opus-5-5 | 4 | 134 | $0.00631 | 2.7 |  |
| 2026-10-24 06:26 | 4566 | check arm 1 fable–fable #10 m21 | claude-haiku-5-5 | 322 | 51 | $0.00006 | 1.7 |  |
| 2026-10-24 06:26 | 4567 | check arm 1 opus–opus #10 m45 | claude-haiku-5-5 | 331 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 4568 | subject arm 1 opus–opus #10 B m46 | claude-opus-5-5 | 4 | 113 | $0.00589 | 2.7 |  |
| 2026-10-24 06:26 | 4569 | subject arm 1 fable–fable #10 B m22 | claude-fable-5-1 | 4 | 238 | $0.01466 | 4.7 |  |
| 2026-10-24 06:26 | 4570 | check arm 1 opus–opus #10 m46 | claude-haiku-5-5 | 331 | 50 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 4571 | check arm 1 fable–fable #10 m22 | claude-haiku-5-5 | 326 | 59 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4572 | subject arm 1 opus–opus #10 A m47 | claude-opus-5-5 | 4 | 210 | $0.00783 | 3.7 |  |
| 2026-10-24 06:26 | 4573 | check arm 1 opus–opus #10 m47 | claude-haiku-5-5 | 411 | 79 | $0.00008 | 0.8 |  |
| 2026-10-24 06:26 | 4574 | subject arm 1 fable–fable #10 A m23 | claude-fable-5-1 | 4 | 211 | $0.01337 | 4.1 |  |
| 2026-10-24 06:26 | 4575 | check arm 1 fable–fable #10 m23 | claude-haiku-5-5 | 329 | 45 | $0.00006 | 1.8 |  |
| 2026-10-24 06:26 | 4576 | subject arm 1 opus–opus #10 B m48 | claude-opus-5-5 | 4 | 81 | $0.00566 | 2 |  |
| 2026-10-24 06:26 | 4577 | subject arm 1 fable–fable #10 B m24 | claude-fable-5-1 | 4 | 14 | $0.00355 | 1.1 |  |
| 2026-10-24 06:26 | 4578 | check arm 1 opus–opus #10 m48 | claude-haiku-5-5 | 449 | 68 | $0.00008 | 1.2 |  |
| 2026-10-24 06:26 | 4579 | check arm 1 fable–fable #10 m24 | claude-haiku-5-5 | 336 | 65 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 4580 | subject arm 1 fable–fable #10 A m25 | claude-fable-5-1 | 4 | 8 | $0.00334 | 1 |  |
| 2026-10-24 06:26 | 4581 | subject arm 1 opus–opus #10 A m49 | claude-opus-5-5 | 4 | 50 | $0.00523 | 1.9 |  |
| 2026-10-24 06:26 | 4582 | check arm 1 fable–fable #10 m25 | claude-haiku-5-5 | 337 | 49 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4583 | check arm 1 opus–opus #10 m49 | claude-haiku-5-5 | 368 | 48 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 4584 | subject arm 1 opus–opus #10 B m50 | claude-opus-5-5 | 4 | 75 | $0.00534 | 1.9 |  |
| 2026-10-24 06:26 | 4585 | subject arm 1 fable–fable #10 B m26 | claude-fable-5-1 | 4 | 120 | $0.00896 | 2.8 |  |
| 2026-10-24 06:26 | 4586 | check arm 1 opus–opus #10 m50 | claude-haiku-5-5 | 329 | 53 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 4587 | check arm 1 fable–fable #10 m26 | claude-haiku-5-5 | 331 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 4588 | subject arm 1 opus–opus #10 A m51 | claude-opus-5-5 | 4 | 61 | $0.00487 | 1.7 |  |
| 2026-10-24 06:26 | 4589 | check arm 1 opus–opus #10 m51 | claude-haiku-5-5 | 327 | 65 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 4590 | subject arm 1 fable–fable #10 A m27 | claude-fable-5-1 | 4 | 114 | $0.00859 | 2.9 |  |
| 2026-10-24 06:26 | 4591 | check arm 1 fable–fable #10 m27 | claude-haiku-5-5 | 341 | 59 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 4592 | subject arm 1 opus–opus #10 B m52 | claude-opus-5-5 | 4 | 79 | $0.00523 | 1.9 |  |
| 2026-10-24 06:26 | 4593 | check arm 1 opus–opus #10 m52 | claude-haiku-5-5 | 325 | 52 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 4594 | subject arm 1 fable–fable #10 B m28 | claude-fable-5-1 | 4 | 135 | $0.00976 | 2.9 |  |
| 2026-10-24 06:26 | 4595 | check arm 1 fable–fable #10 m28 | claude-haiku-5-5 | 348 | 61 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 4596 | subject arm 1 opus–opus #10 A m53 | claude-opus-5-5 | 4 | 83 | $0.00530 | 2.4 |  |
| 2026-10-24 06:26 | 4597 | check arm 1 opus–opus #10 m53 | claude-haiku-5-5 | 325 | 50 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 4598 | subject arm 1 fable–fable #10 A m29 | claude-fable-5-1 | 4 | 161 | $0.01115 | 3.2 |  |
| 2026-10-24 06:26 | 4599 | check arm 1 fable–fable #10 m29 | claude-haiku-5-5 | 339 | 53 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4600 | subject arm 1 opus–opus #10 B m54 | claude-opus-5-5 | 4 | 125 | $0.00614 | 2.4 |  |
| 2026-10-24 06:26 | 4601 | check arm 1 opus–opus #10 m54 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 4602 | subject arm 1 fable–fable #10 B m30 | claude-fable-5-1 | 4 | 159 | $0.01094 | 3.2 |  |
| 2026-10-24 06:26 | 4603 | check arm 1 fable–fable #10 m30 | claude-haiku-5-5 | 331 | 57 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4604 | subject arm 1 opus–opus #10 A m55 | claude-opus-5-5 | 4 | 175 | $0.00714 | 3.1 |  |
| 2026-10-24 06:26 | 4605 | check arm 1 opus–opus #10 m55 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 4606 | subject arm 1 fable–fable #10 A m31 | claude-fable-5-1 | 4 | 117 | $0.00875 | 3.3 |  |
| 2026-10-24 06:26 | 4607 | subject arm 1 opus–opus #10 B m56 | claude-opus-5-5 | 4 | 84 | $0.00532 | 2 |  |
| 2026-10-24 06:26 | 4608 | check arm 1 fable–fable #10 m31 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 4609 | check arm 1 opus–opus #10 m56 | claude-haiku-5-5 | 325 | 51 | $0.00006 | 1.7 |  |
| 2026-10-24 06:26 | 4610 | subject arm 1 opus–opus #10 A m57 | claude-opus-5-5 | 4 | 151 | $0.00666 | 2.7 |  |
| 2026-10-24 06:26 | 4611 | subject arm 1 fable–fable #10 B m32 | claude-fable-5-1 | 4 | 148 | $0.01028 | 3.6 |  |
| 2026-10-24 06:26 | 4612 | check arm 1 opus–opus #10 m57 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 4613 | check arm 1 fable–fable #10 m32 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.1 |  |
| 2026-10-24 06:26 | 4614 | subject arm 1 opus–opus #10 B m58 | claude-opus-5-5 | 4 | 131 | $0.00626 | 2.7 |  |
| 2026-10-24 06:26 | 4615 | subject arm 1 fable–fable #10 A m33 | claude-fable-5-1 | 4 | 153 | $0.01053 | 3.5 |  |
| 2026-10-24 06:26 | 4616 | check arm 1 opus–opus #10 m58 | claude-haiku-5-5 | 325 | 53 | $0.00006 | 1.3 |  |
| 2026-10-24 06:26 | 4617 | check arm 1 fable–fable #10 m33 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 4618 | subject arm 1 opus–opus #10 A m59 | claude-opus-5-5 | 4 | 95 | $0.00554 | 2.3 |  |
| 2026-10-24 06:26 | 4619 | check arm 1 opus–opus #10 m59 | claude-haiku-5-5 | 325 | 53 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 4620 | subject arm 1 fable–fable #10 B m34 | claude-fable-5-1 | 4 | 179 | $0.01183 | 3.5 |  |
| 2026-10-24 06:26 | 4621 | check arm 1 fable–fable #10 m34 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.5 |  |
| 2026-10-24 06:26 | 4622 | subject arm 1 opus–opus #10 B m60 | claude-opus-5-5 | 4 | 159 | $0.00682 | 2.7 |  |
| 2026-10-24 06:26 | 4623 | check arm 1 opus–opus #10 m60 | claude-haiku-5-5 | 325 | 49 | $0.00006 | 1.4 |  |
| 2026-10-24 06:26 | 4624 | subject arm 1 fable–fable #10 A m35 | claude-fable-5-1 | 4 | 142 | $0.00998 | 2.9 |  |
| 2026-10-24 06:26 | 4625 | check arm 1 fable–fable #10 m35 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.5 |  |
| 2026-10-24 06:26 | 4626 | tags 1 arm 1 opus–opus #10 m11–20 | claude-haiku-5-5 | 8148 | 680 | $0.00115 | 2.2 |  |
| 2026-10-24 06:26 | 4627 | tags 1 arm 1 opus–opus #10 m1–10 | claude-haiku-5-5 | 12502 | 680 | $0.00159 | 2.8 |  |
| 2026-10-24 06:26 | 4628 | tags 2 arm 1 opus–opus #10 m1–10 | claude-haiku-5-5 | 12502 | 680 | $0.00159 | 3.7 |  |
| 2026-10-24 06:26 | 4629 | subject arm 1 fable–fable #10 B m36 | claude-fable-5-1 | 4 | 56 | $0.00568 | 1.8 |  |
| 2026-10-24 06:26 | 4630 | check arm 1 fable–fable #10 m36 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.3 |  |
| 2026-10-24 06:26 | 4631 | tags 2 arm 1 opus–opus #10 m11–20 | claude-haiku-5-5 | 8148 | 680 | $0.00115 | 2.2 |  |
| 2026-10-24 06:26 | 4632 | tags 1 arm 1 opus–opus #10 m21–30 | claude-haiku-5-5 | 1266 | 680 | $0.00047 | 2.5 |  |
| 2026-10-24 06:26 | 4633 | tags 2 arm 1 opus–opus #10 m21–30 | claude-haiku-5-5 | 1266 | 680 | $0.00047 | 2.8 |  |
| 2026-10-24 06:26 | 4634 | subject arm 1 fable–fable #10 A m37 | claude-fable-5-1 | 4 | 125 | $0.00913 | 2.5 |  |
| 2026-10-24 06:26 | 4635 | check arm 1 fable–fable #10 m37 | claude-haiku-5-5 | 329 | 42 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 4636 | tags 1 arm 1 opus–opus #10 m41–50 | claude-haiku-5-5 | 1336 | 680 | $0.00047 | 2.2 |  |
| 2026-10-24 06:26 | 4637 | tags 1 arm 1 opus–opus #10 m31–40 | claude-haiku-5-5 | 1470 | 1375 | $0.00083 | 5.2 |  |
| 2026-10-24 06:26 | 4638 | tags 2 arm 1 opus–opus #10 m31–40 | claude-haiku-5-5 | 1470 | 1582 | $0.00094 | 6 |  |
| 2026-10-24 06:26 | 4639 | subject arm 1 fable–fable #10 B m38 | claude-fable-5-1 | 4 | 286 | $0.01719 | 5.6 |  |
| 2026-10-24 06:26 | 4640 | tags 2 arm 1 opus–opus #10 m41–50 | claude-haiku-5-5 | 1336 | 680 | $0.00047 | 2.3 |  |
| 2026-10-24 06:26 | 4641 | check arm 1 fable–fable #10 m38 | claude-haiku-5-5 | 396 | 60 | $0.00007 | 1.3 |  |
| 2026-10-24 06:26 | 4642 | tags 1 arm 1 opus–opus #10 m51–60 | claude-haiku-5-5 | 1112 | 680 | $0.00045 | 2.8 |  |
| 2026-10-24 06:26 | 4643 | tags 2 arm 1 opus–opus #10 m51–60 | claude-haiku-5-5 | 1112 | 680 | $0.00045 | 2.2 |  |
| 2026-10-24 06:26 | 4644 | subject arm 1 fable–fable #10 A m39 | claude-fable-5-1 | 4 | 155 | $0.01148 | 3.3 |  |
| 2026-10-24 06:26 | 4645 | check arm 1 fable–fable #10 m39 | claude-haiku-5-5 | 421 | 56 | $0.00007 | 1 |  |
| 2026-10-24 06:26 | 4646 | tags referee arm 1 opus–opus #10 m41–50 | claude-opus-5-5 | 1336 | 680 | $0.01894 | 5.5 |  |
| 2026-10-24 06:26 | 4647 | tags referee arm 1 opus–opus #10 m1–10 | claude-opus-5-5 | 12502 | 1019 | $0.07039 | 9.1 |  |
| 2026-10-24 06:26 | 4648 | subject arm 1 fable–fable #10 B m40 | claude-fable-5-1 | 4 | 148 | $0.01144 | 3.9 |  |
| 2026-10-24 06:26 | 4649 | check arm 1 fable–fable #10 m40 | claude-haiku-5-5 | 358 | 74 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 4650 | subject arm 1 fable–fable #10 A m41 | claude-fable-5-1 | 4 | 140 | $0.01027 | 2.8 |  |
| 2026-10-24 06:26 | 4651 | check arm 1 fable–fable #10 m41 | claude-haiku-5-5 | 333 | 52 | $0.00006 | 0.8 |  |
| 2026-10-24 06:26 | 4652 | subject arm 1 fable–fable #10 B m42 | claude-fable-5-1 | 4 | 240 | $0.01497 | 5.6 |  |
| 2026-10-24 06:26 | 4653 | check arm 1 fable–fable #10 m42 | claude-haiku-5-5 | 353 | 69 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 4654 | subject arm 1 fable–fable #10 A m43 | claude-fable-5-1 | 4 | 146 | $0.01052 | 3.8 |  |
| 2026-10-24 06:26 | 4655 | check arm 1 fable–fable #10 m43 | claude-haiku-5-5 | 360 | 62 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 4656 | subject arm 1 fable–fable #10 B m44 | claude-fable-5-1 | 4 | 173 | $0.01196 | 4.9 |  |
| 2026-10-24 06:26 | 4657 | check arm 1 fable–fable #10 m44 | claude-haiku-5-5 | 381 | 81 | $0.00008 | 1.7 |  |
| 2026-10-24 06:26 | 4658 | subject arm 1 fable–fable #10 A m45 | claude-fable-5-1 | 4 | 157 | $0.01143 | 3.1 |  |
| 2026-10-24 06:26 | 4659 | check arm 1 fable–fable #10 m45 | claude-haiku-5-5 | 373 | 53 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 4660 | subject arm 1 fable–fable #10 B m46 | claude-fable-5-1 | 4 | 342 | $0.02058 | 7.1 |  |
| 2026-10-24 06:26 | 4661 | check arm 1 fable–fable #10 m46 | claude-haiku-5-5 | 331 | 50 | $0.00006 | 0.9 |  |
| 2026-10-24 06:26 | 4662 | subject arm 1 fable–fable #10 A m47 | claude-fable-5-1 | 4 | 141 | $0.01002 | 3.4 |  |
| 2026-10-24 06:26 | 4663 | check arm 1 fable–fable #10 m47 | claude-haiku-5-5 | 335 | 55 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4664 | subject arm 1 fable–fable #10 B m48 | claude-fable-5-1 | 4 | 196 | $0.01282 | 3.7 |  |
| 2026-10-24 06:26 | 4665 | check arm 1 fable–fable #10 m48 | claude-haiku-5-5 | 332 | 43 | $0.00005 | 0.7 |  |
| 2026-10-24 06:26 | 4666 | subject arm 1 fable–fable #10 A m49 | claude-fable-5-1 | 4 | 174 | $0.01169 | 4 |  |
| 2026-10-24 06:26 | 4667 | check arm 1 fable–fable #10 m49 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 4668 | subject arm 1 fable–fable #10 B m50 | claude-fable-5-1 | 4 | 72 | $0.00655 | 1.8 |  |
| 2026-10-24 06:26 | 4669 | check arm 1 fable–fable #10 m50 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1.1 |  |
| 2026-10-24 06:26 | 4670 | subject arm 1 fable–fable #10 A m51 | claude-fable-5-1 | 4 | 152 | $0.01055 | 3 |  |
| 2026-10-24 06:26 | 4671 | check arm 1 fable–fable #10 m51 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 4672 | subject arm 1 fable–fable #10 B m52 | claude-fable-5-1 | 4 | 94 | $0.00765 | 2 |  |
| 2026-10-24 06:26 | 4673 | check arm 1 fable–fable #10 m52 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 4674 | subject arm 1 fable–fable #10 A m53 | claude-fable-5-1 | 4 | 178 | $0.01186 | 4.1 |  |
| 2026-10-24 06:26 | 4675 | check arm 1 fable–fable #10 m53 | claude-haiku-5-5 | 364 | 54 | $0.00006 | 1.3 |  |
| 2026-10-24 06:26 | 4676 | subject arm 1 fable–fable #10 B m54 | claude-fable-5-1 | 4 | 151 | $0.01095 | 2.7 |  |
| 2026-10-24 06:26 | 4677 | check arm 1 fable–fable #10 m54 | claude-haiku-5-5 | 368 | 48 | $0.00006 | 0.7 |  |
| 2026-10-24 06:26 | 4678 | subject arm 1 fable–fable #10 A m55 | claude-fable-5-1 | 4 | 142 | $0.01055 | 2.9 |  |
| 2026-10-24 06:26 | 4679 | check arm 1 fable–fable #10 m55 | claude-haiku-5-5 | 333 | 59 | $0.00006 | 0.6 |  |
| 2026-10-24 06:26 | 4680 | subject arm 1 fable–fable #10 B m56 | claude-fable-5-1 | 4 | 157 | $0.01087 | 2.9 |  |
| 2026-10-24 06:26 | 4681 | check arm 1 fable–fable #10 m56 | claude-haiku-5-5 | 340 | 64 | $0.00007 | 0.8 |  |
| 2026-10-24 06:26 | 4682 | subject arm 1 fable–fable #10 A m57 | claude-fable-5-1 | 4 | 129 | $0.00956 | 3.4 |  |
| 2026-10-24 06:26 | 4683 | check arm 1 fable–fable #10 m57 | claude-haiku-5-5 | 340 | 63 | $0.00007 | 0.7 |  |
| 2026-10-24 06:26 | 4684 | subject arm 1 fable–fable #10 B m58 | claude-fable-5-1 | 4 | 125 | $0.00936 | 2.5 |  |
| 2026-10-24 06:26 | 4685 | check arm 1 fable–fable #10 m58 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 0.6 |  |
| 2026-10-24 06:26 | 4686 | subject arm 1 fable–fable #10 A m59 | claude-fable-5-1 | 4 | 156 | $0.01078 | 3.2 |  |
| 2026-10-24 06:26 | 4687 | check arm 1 fable–fable #10 m59 | claude-haiku-5-5 | 329 | 41 | $0.00005 | 1 |  |
| 2026-10-24 06:26 | 4688 | subject arm 1 fable–fable #10 B m60 | claude-fable-5-1 | 4 | 134 | $0.00968 | 2.6 |  |
| 2026-10-24 06:26 | 4689 | check arm 1 fable–fable #10 m60 | claude-haiku-5-5 | 329 | 43 | $0.00005 | 1 |  |
| 2026-10-24 06:26 | 4690 | tags 2 arm 1 fable–fable #10 m1–10 | claude-haiku-5-5 | 11109 | 680 | $0.00145 | 2.5 |  |
| 2026-10-24 06:26 | 4691 | tags 1 arm 1 fable–fable #10 m1–10 | claude-haiku-5-5 | 11109 | 680 | $0.00145 | 2.5 |  |
| 2026-10-24 06:26 | 4692 | tags 1 arm 1 fable–fable #10 m11–20 | claude-haiku-5-5 | 1773 | 1214 | $0.00078 | 4.5 |  |
| 2026-10-24 06:26 | 4693 | tags 1 arm 1 fable–fable #10 m21–30 | claude-haiku-5-5 | 1155 | 680 | $0.00046 | 2.2 |  |
| 2026-10-24 06:26 | 4694 | tags 2 arm 1 fable–fable #10 m21–30 | claude-haiku-5-5 | 1155 | 680 | $0.00046 | 2.2 |  |
| 2026-10-24 06:26 | 4695 | tags 2 arm 1 fable–fable #10 m11–20 | claude-haiku-5-5 | 1773 | 1409 | $0.00088 | 5.4 |  |
| 2026-10-24 06:26 | 4696 | tags 1 arm 1 fable–fable #10 m31–40 | claude-haiku-5-5 | 1228 | 680 | $0.00046 | 2.4 |  |
| 2026-10-24 06:26 | 4697 | tags 2 arm 1 fable–fable #10 m31–40 | claude-haiku-5-5 | 1228 | 680 | $0.00046 | 2.2 |  |
| 2026-10-24 06:26 | 4698 | tags 1 arm 1 fable–fable #10 m41–50 | claude-haiku-5-5 | 1217 | 680 | $0.00046 | 2.2 |  |
| 2026-10-24 06:26 | 4699 | tags 2 arm 1 fable–fable #10 m41–50 | claude-haiku-5-5 | 1217 | 680 | $0.00046 | 2.1 |  |
| 2026-10-24 06:26 | 4700 | tags 1 arm 1 fable–fable #10 m51–60 | claude-haiku-5-5 | 1182 | 680 | $0.00046 | 2.2 |  |
| 2026-10-24 06:26 | 4701 | tags 2 arm 1 fable–fable #10 m51–60 | claude-haiku-5-5 | 1182 | 680 | $0.00046 | 2.2 |  |
| 2026-10-24 06:26 | 4702 | tags referee arm 1 fable–fable #10 m1–10 | claude-opus-5-5 | 11109 | 680 | $0.05804 | 4.8 |  |
| 2026-10-24 06:26 | 4703 | tags referee arm 1 fable–fable #10 m11–20 | claude-opus-5-5 | 1773 | 893 | $0.02495 | 7 |  |
| 2026-10-24 07:47 | 1 | subject arm 5 opus–opus #1 A m1 | claude-opus-5-5 | 84 | 553 | $0.01140 | 8.3 |  |
| 2026-10-24 07:47 | 2 | check arm 5 opus–opus #1 m1 | claude-haiku-5-5 | 825 | 56 | $0.00011 | 0.8 |  |
| 2026-10-24 07:47 | 3 | subject arm 5 fable–fable #1 A m1 | claude-fable-5-1 | 84 | 578 | $0.02974 | 10 |  |
| 2026-10-24 07:47 | 4 | check arm 5 fable–fable #1 m1 | claude-haiku-5-5 | 733 | 75 | $0.00011 | 0.7 |  |
| 2026-10-24 07:47 | 5 | subject arm 4 opus–opus #1 A m1 | claude-opus-5-5 | 4 | 1188 | $0.10747 | 16.2 |  |
| 2026-10-24 07:47 | 6 | check arm 4 opus–opus #1 m1 | claude-haiku-5-5 | 1069 | 79 | $0.00015 | 0.7 |  |
| 2026-10-24 07:47 | 7 | subject arm 5 opus–opus #1 B m2 | claude-opus-5-5 | 4 | 1064 | $0.02418 | 14.9 |  |
| 2026-10-24 07:47 | 8 | check arm 5 opus–opus #1 m2 | claude-haiku-5-5 | 1662 | 85 | $0.00021 | 0.8 |  |
| 2026-10-24 07:47 | 9 | subject arm 5 fable–fable #1 B m2 | claude-fable-5-1 | 489 | 817 | $0.04574 | 14 |  |
| 2026-10-24 07:47 | 10 | check arm 5 fable–fable #1 m2 | claude-haiku-5-5 | 1481 | 74 | $0.00019 | 0.7 |  |
| 2026-10-24 07:47 | 11 | subject arm 4 opus–opus #1 B m2 | claude-opus-5-5 | 4 | 954 | $0.02308 | 12.9 |  |
| 2026-10-24 07:47 | 12 | check arm 4 opus–opus #1 m2 | claude-haiku-5-5 | 1907 | 62 | $0.00022 | 1 |  |
| 2026-10-24 07:47 | 13 | subject arm 5 fable–fable #1 A m3 | claude-fable-5-1 | 4 | 893 | $0.06026 | 16 |  |
| 2026-10-24 07:47 | 14 | check arm 5 fable–fable #1 m3 | claude-haiku-5-5 | 1894 | 102 | $0.00024 | 0.8 |  |
| 2026-10-24 07:47 | 15 | subject arm 5 opus–opus #1 A m3 | claude-opus-5-5 | 4 | 2167 | $0.05049 | 27.3 |  |
| 2026-10-24 07:47 | 16 | check arm 5 opus–opus #1 m3 | claude-haiku-5-5 | 2540 | 68 | $0.00029 | 0.8 |  |
| 2026-10-24 07:47 | 17 | subject arm 4 opus–opus #1 A m3 | claude-opus-5-5 | 4 | 2152 | $0.05436 | 27.3 |  |
| 2026-10-24 07:47 | 18 | subject arm 5 fable–fable #1 B m4 | claude-fable-5-1 | 4 | 822 | $0.06694 | 13.5 |  |
| 2026-10-24 07:47 | 19 | check arm 5 fable–fable #1 m4 | claude-haiku-5-5 | 1809 | 83 | $0.00022 | 0.8 |  |
| 2026-10-24 07:47 | 20 | check arm 4 opus–opus #1 m3 | claude-haiku-5-5 | 2338 | 65 | $0.00027 | 2.1 |  |
| 2026-10-24 07:47 | 21 | subject arm 5 fable–fable #1 A m5 | claude-fable-5-1 | 4 | 595 | $0.04878 | 11.4 |  |
| 2026-10-24 07:47 | 22 | check arm 5 fable–fable #1 m5 | claude-haiku-5-5 | 1492 | 83 | $0.00019 | 0.6 |  |
| 2026-10-24 07:47 | 23 | subject arm 4 opus–opus #1 B m4 | claude-opus-5-5 | 4 | 2444 | $0.05917 | 27.9 |  |
| 2026-10-24 07:47 | 24 | check arm 4 opus–opus #1 m4 | claude-haiku-5-5 | 2721 | 69 | $0.00031 | 0.8 |  |
| 2026-10-24 07:47 | 25 | subject arm 5 opus–opus #1 B m4 | claude-opus-5-5 | 4 | 3064 | $0.07254 | 38.1 |  |
| 2026-10-24 07:47 | 26 | check arm 5 opus–opus #1 m4 | claude-haiku-5-5 | 3594 | 90 | $0.00040 | 0.9 |  |
| 2026-10-24 07:47 | 27 | subject arm 5 fable–fable #1 B m6 | claude-fable-5-1 | 4 | 1270 | $0.07877 | 23.2 |  |
| 2026-10-24 07:47 | 28 | check arm 5 fable–fable #1 m6 | claude-haiku-5-5 | 1536 | 82 | $0.00019 | 1.5 |  |
| 2026-10-24 07:47 | 29 | subject arm 5 fable–fable #1 A m7 | claude-fable-5-1 | 4 | 728 | $0.05239 | 13.1 |  |
| 2026-10-24 07:47 | 30 | check arm 5 fable–fable #1 m7 | claude-haiku-5-5 | 1636 | 80 | $0.00020 | 1.1 |  |
| 2026-10-24 07:47 | 31 | subject arm 4 opus–opus #1 A m5 | claude-opus-5-5 | 4 | 2082 | $0.05735 | 25.2 |  |
| 2026-10-24 07:47 | 32 | check arm 4 opus–opus #1 m5 | claude-haiku-5-5 | 2804 | 80 | $0.00032 | 0.8 |  |
| 2026-10-24 07:47 | 33 | subject arm 5 opus–opus #1 A m5 | claude-opus-5-5 | 4 | 2276 | $0.06222 | 28.2 |  |
| 2026-10-24 07:47 | 34 | check arm 5 opus–opus #1 m5 | claude-haiku-5-5 | 3645 | 73 | $0.00040 | 0.9 |  |
| 2026-10-24 07:47 | 35 | subject arm 5 fable–fable #1 B m8 | claude-fable-5-1 | 4 | 479 | $0.04131 | 8.7 |  |
| 2026-10-24 07:47 | 36 | check arm 5 fable–fable #1 m8 | claude-haiku-5-5 | 1161 | 70 | $0.00015 | 0.8 |  |
| 2026-10-24 07:47 | 37 | subject arm 5 fable–fable #1 A m9 | claude-fable-5-1 | 4 | 43 | $0.01376 | 1.4 |  |
| 2026-10-24 07:47 | 38 | tags 2 arm 5 fable–fable #1 m1–8 | claude-haiku-5-5 | 5724 | 546 | $0.00085 | 1.9 |  |
| 2026-10-24 07:47 | 39 | tags 1 arm 5 fable–fable #1 m1–8 | claude-haiku-5-5 | 5724 | 1321 | $0.00123 | 5.7 |  |
| 2026-10-24 07:47 | 40 | tags referee arm 5 fable–fable #1 m1–8 | claude-opus-5-5 | 5724 | 546 | $0.03382 | 5.6 |  |
| 2026-10-24 07:47 | 41 | subject arm 5 opus–opus #1 B m6 | claude-opus-5-5 | 4 | 1785 | $0.05293 | 21.8 |  |
| 2026-10-24 07:47 | 42 | check arm 5 opus–opus #1 m6 | claude-haiku-5-5 | 2879 | 75 | $0.00033 | 0.8 |  |
| 2026-10-24 07:47 | 43 | subject arm 4 fable–fable #1 A m1 | claude-fable-5-1 | 4 | 1054 | $0.26197 | 21.1 |  |
| 2026-10-24 07:47 | 44 | subject arm 4 opus–opus #1 B m6 | claude-opus-5-5 | 4 | 2993 | $0.07288 | 35.5 |  |
| 2026-10-24 07:47 | 45 | check arm 4 fable–fable #1 m1 | claude-haiku-5-5 | 876 | 63 | $0.00012 | 1 |  |
| 2026-10-24 07:47 | 46 | check arm 4 opus–opus #1 m6 | claude-haiku-5-5 | 2819 | 74 | $0.00032 | 0.8 |  |
| 2026-10-24 07:47 | 47 | subject arm 4 fable–fable #1 B m2 | claude-fable-5-1 | 4 | 905 | $0.05283 | 17.9 |  |
| 2026-10-24 07:47 | 48 | check arm 4 fable–fable #1 m2 | claude-haiku-5-5 | 1628 | 76 | $0.00020 | 0.7 |  |
| 2026-10-24 07:47 | 49 | subject arm 4 opus–opus #1 A m7 | claude-opus-5-5 | 4 | 2204 | $0.06076 | 26.8 |  |
| 2026-10-24 07:47 | 50 | check arm 4 opus–opus #1 m7 | claude-haiku-5-5 | 2786 | 77 | $0.00032 | 1.3 |  |
| 2026-10-24 07:47 | 51 | subject arm 5 opus–opus #1 A m7 | claude-opus-5-5 | 4 | 3691 | $0.08760 | 42.6 |  |
| 2026-10-24 07:47 | 52 | check arm 5 opus–opus #1 m7 | claude-haiku-5-5 | 2899 | 79 | $0.00033 | 0.7 |  |
| 2026-10-24 07:47 | 53 | subject arm 4 opus–opus #1 B m8 | claude-opus-5-5 | 4 | 1137 | $0.03617 | 14.2 |  |
| 2026-10-24 07:47 | 54 | check arm 4 opus–opus #1 m8 | claude-haiku-5-5 | 2307 | 71 | $0.00027 | 0.7 |  |
| 2026-10-24 07:47 | 55 | subject arm 4 fable–fable #1 A m3 | claude-fable-5-1 | 4 | 1952 | $0.11824 | 33.8 |  |
| 2026-10-24 07:47 | 56 | subject arm 4 opus–opus #1 A m9 | claude-opus-5-5 | 4 | 526 | $0.02514 | 7.8 |  |
| 2026-10-24 07:47 | 57 | check arm 4 fable–fable #1 m3 | claude-haiku-5-5 | 2297 | 81 | $0.00027 | 0.8 |  |
| 2026-10-24 07:47 | 58 | check arm 4 opus–opus #1 m9 | claude-haiku-5-5 | 1352 | 75 | $0.00017 | 0.7 |  |
| 2026-10-24 07:47 | 59 | subject arm 4 opus–opus #1 B m10 | claude-opus-5-5 | 4 | 127 | $0.00930 | 2 |  |
| 2026-10-24 07:47 | 60 | tags 1 arm 4 opus–opus #1 m1–9 | claude-haiku-5-5 | 9776 | 613 | $0.00128 | 2.3 |  |
| 2026-10-24 07:47 | 61 | tags 2 arm 4 opus–opus #1 m1–9 | claude-haiku-5-5 | 9776 | 613 | $0.00128 | 2.6 |  |
| 2026-10-24 07:47 | 62 | subject arm 3 sonnet–fable #1 A m1 | claude-sonnet-5-5 | 59 | 324 | $0.00336 | 3.9 |  |
| 2026-10-24 07:47 | 63 | tags referee arm 4 opus–opus #1 m1–9 | claude-opus-5-5 | 9776 | 613 | $0.05136 | 4.3 |  |
| 2026-10-24 07:47 | 64 | check arm 3 sonnet–fable #1 m1 | claude-haiku-5-5 | 650 | 70 | $0.00010 | 0.8 |  |
| 2026-10-24 07:47 | 65 | subject arm 5 opus–opus #1 B m8 | claude-opus-5-5 | 4 | 2555 | $0.06526 | 30.2 |  |
| 2026-10-24 07:47 | 66 | check arm 5 opus–opus #1 m8 | claude-haiku-5-5 | 3280 | 79 | $0.00037 | 0.8 |  |
| 2026-10-24 07:47 | 67 | subject arm 3 sonnet–fable #1 B m2 | claude-fable-5-1 | 381 | 371 | $0.02236 | 7.3 |  |
| 2026-10-24 07:47 | 68 | check arm 3 sonnet–fable #1 m2 | claude-haiku-5-5 | 948 | 77 | $0.00013 | 0.9 |  |
| 2026-10-24 07:47 | 69 | subject arm 3 sonnet–fable #1 A m3 | claude-sonnet-5-5 | 4 | 414 | $0.00587 | 5.5 |  |
| 2026-10-24 07:47 | 70 | check arm 3 sonnet–fable #1 m3 | claude-haiku-5-5 | 1038 | 75 | $0.00014 | 1.2 |  |
| 2026-10-24 07:47 | 71 | subject arm 4 fable–fable #1 B m4 | claude-fable-5-1 | 4 | 1671 | $0.10852 | 32.6 |  |
| 2026-10-24 07:47 | 72 | check arm 4 fable–fable #1 m4 | claude-haiku-5-5 | 2548 | 66 | $0.00029 | 0.8 |  |
| 2026-10-24 07:47 | 73 | subject arm 5 opus–opus #1 A m9 | claude-opus-5-5 | 4 | 2613 | $0.06856 | 32.6 |  |
| 2026-10-24 07:47 | 74 | check arm 5 opus–opus #1 m9 | claude-haiku-5-5 | 3426 | 94 | $0.00039 | 0.8 |  |
| 2026-10-24 07:47 | 75 | subject arm 3 sonnet–fable #1 B m4 | claude-fable-5-1 | 4 | 1198 | $0.07369 | 21.5 |  |
| 2026-10-24 07:47 | 76 | check arm 3 sonnet–fable #1 m4 | claude-haiku-5-5 | 1241 | 71 | $0.00016 | 0.8 |  |
| 2026-10-24 07:47 | 77 | subject arm 3 sonnet–fable #1 A m5 | claude-sonnet-5-5 | 4 | 543 | $0.00789 | 6.5 |  |
| 2026-10-24 07:47 | 78 | check arm 3 sonnet–fable #1 m5 | claude-haiku-5-5 | 1370 | 76 | $0.00017 | 1 |  |
| 2026-10-24 07:47 | 79 | subject arm 4 fable–fable #1 A m5 | claude-fable-5-1 | 4 | 2064 | $0.13567 | 38.1 |  |
| 2026-10-24 07:47 | 80 | check arm 4 fable–fable #1 m5 | claude-haiku-5-5 | 2383 | 70 | $0.00027 | 0.8 |  |
| 2026-10-24 07:47 | 81 | subject arm 5 opus–opus #1 B m10 | claude-opus-5-5 | 4 | 2983 | $0.07697 | 36.1 |  |
| 2026-10-24 07:47 | 82 | check arm 5 opus–opus #1 m10 | claude-haiku-5-5 | 3647 | 82 | $0.00041 | 0.8 |  |
| 2026-10-24 07:47 | 83 | subject arm 3 sonnet–fable #1 B m6 | claude-fable-5-1 | 4 | 1630 | $0.09500 | 30.3 |  |
| 2026-10-24 07:47 | 84 | check arm 3 sonnet–fable #1 m6 | claude-haiku-5-5 | 1558 | 75 | $0.00019 | 1.7 |  |
| 2026-10-24 07:47 | 85 | subject arm 4 fable–fable #1 B m6 | claude-fable-5-1 | 4 | 1496 | $0.10134 | 30.7 |  |
| 2026-10-24 07:47 | 86 | check arm 4 fable–fable #1 m6 | claude-haiku-5-5 | 2214 | 81 | $0.00026 | 0.8 |  |
| 2026-10-24 07:47 | 87 | subject arm 3 sonnet–fable #1 A m7 | claude-sonnet-5-5 | 4 | 1432 | $0.01776 | 17.2 |  |
| 2026-10-24 07:47 | 88 | check arm 3 sonnet–fable #1 m7 | claude-haiku-5-5 | 1477 | 88 | $0.00019 | 0.8 |  |
| 2026-10-24 07:47 | 89 | subject arm 3 sonnet–fable #1 B m8 | claude-fable-5-1 | 4 | 0 | $0.01510 | 0.6 |  |
| 2026-10-24 07:47 | 90 | tags 2 arm 3 sonnet–fable #1 m1–7 | claude-haiku-5-5 | 4245 | 479 | $0.00066 | 1.7 |  |
| 2026-10-24 07:47 | 91 | tags 1 arm 3 sonnet–fable #1 m1–7 | claude-haiku-5-5 | 4245 | 479 | $0.00066 | 2.5 |  |
| 2026-10-24 07:47 | 92 | subject arm 4 fable–fable #1 A m7 | claude-fable-5-1 | 4 | 919 | $0.07480 | 18 |  |
| 2026-10-24 07:47 | 93 | subject arm 3 opus–fable #1 A m1 | claude-opus-5-5 | 59 | 468 | $0.00960 | 6.4 |  |
| 2026-10-24 07:47 | 94 | check arm 4 fable–fable #1 m7 | claude-haiku-5-5 | 1537 | 89 | $0.00020 | 1 |  |
| 2026-10-24 07:47 | 95 | check arm 3 opus–fable #1 m1 | claude-haiku-5-5 | 761 | 56 | $0.00010 | 0.7 |  |
| 2026-10-24 07:47 | 96 | tags 1 arm 4 fable–fable #1 m1–7 | claude-haiku-5-5 | 6803 | 479 | $0.00092 | 1.9 |  |
| 2026-10-24 07:47 | 97 | tags 2 arm 4 fable–fable #1 m1–7 | claude-haiku-5-5 | 6803 | 479 | $0.00092 | 2 |  |
| 2026-10-24 07:47 | 98 | subject arm 5 opus–opus #1 A m11 | claude-opus-5-5 | 4 | 3446 | $0.08764 | 42.8 |  |
| 2026-10-24 07:47 | 99 | check arm 5 opus–opus #1 m11 | claude-haiku-5-5 | 4367 | 87 | $0.00048 | 1 |  |
| 2026-10-24 07:47 | 100 | tags referee arm 4 fable–fable #1 m1–7 | claude-opus-5-5 | 6803 | 479 | $0.03679 | 4.1 |  |
| 2026-10-24 07:47 | 101 | subject arm 5 fable–fable #2 A m1 | claude-fable-5-1 | 84 | 637 | $0.03269 | 11.5 |  |
| 2026-10-24 07:47 | 102 | check arm 5 fable–fable #2 m1 | claude-haiku-5-5 | 894 | 66 | $0.00012 | 0.8 |  |
| 2026-10-24 07:47 | 103 | subject arm 3 opus–fable #1 B m2 | claude-fable-5-1 | 492 | 841 | $0.04697 | 18.8 |  |
| 2026-10-24 07:47 | 104 | check arm 3 opus–fable #1 m2 | claude-haiku-5-5 | 1504 | 82 | $0.00019 | 0.8 |  |
| 2026-10-24 07:47 | 105 | subject arm 5 fable–fable #2 B m2 | claude-fable-5-1 | 4 | 1516 | $0.08392 | 28.4 |  |
| 2026-10-24 07:47 | 106 | check arm 5 fable–fable #2 m2 | claude-haiku-5-5 | 2284 | 65 | $0.00026 | 0.7 |  |
| 2026-10-24 07:47 | 107 | subject arm 3 opus–fable #1 A m3 | claude-opus-5-5 | 4 | 1876 | $0.04376 | 24.1 |  |
| 2026-10-24 07:47 | 108 | check arm 3 opus–fable #1 m3 | claude-haiku-5-5 | 2300 | 77 | $0.00027 | 1 |  |
| 2026-10-24 07:47 | 109 | subject arm 5 opus–opus #1 B m12 | claude-opus-5-5 | 4 | 4176 | $0.10616 | 52.8 |  |
| 2026-10-24 07:47 | 110 | check arm 5 opus–opus #1 m12 | claude-haiku-5-5 | 4447 | 103 | $0.00050 | 1.4 |  |
| 2026-10-24 07:47 | 111 | subject arm 5 fable–fable #2 A m3 | claude-fable-5-1 | 4 | 1275 | $0.08940 | 23.1 |  |
| 2026-10-24 07:47 | 112 | check arm 5 fable–fable #2 m3 | claude-haiku-5-5 | 2940 | 67 | $0.00033 | 0.6 |  |
| 2026-10-24 07:47 | 113 | subject arm 3 opus–fable #1 B m4 | claude-fable-5-1 | 4 | 2011 | $0.13150 | 38.5 |  |
| 2026-10-24 07:47 | 114 | subject arm 5 opus–opus #1 A m13 | claude-opus-5-5 | 4 | 2301 | $0.06941 | 28.6 |  |
| 2026-10-24 07:47 | 115 | check arm 3 opus–fable #1 m4 | claude-haiku-5-5 | 2666 | 62 | $0.00030 | 1.3 |  |
| 2026-10-24 07:47 | 116 | check arm 5 opus–opus #1 m13 | claude-haiku-5-5 | 3361 | 82 | $0.00038 | 0.8 |  |
| 2026-10-24 07:47 | 117 | subject arm 3 opus–fable #1 A m5 | claude-opus-5-5 | 4 | 1867 | $0.04936 | 23.2 |  |
| 2026-10-24 07:47 | 118 | check arm 3 opus–fable #1 m5 | claude-haiku-5-5 | 2425 | 83 | $0.00028 | 0.8 |  |
| 2026-10-24 07:47 | 119 | subject arm 5 fable–fable #2 B m4 | claude-fable-5-1 | 4 | 2522 | $0.15911 | 45.3 |  |
| 2026-10-24 07:47 | 120 | check arm 5 fable–fable #2 m4 | claude-haiku-5-5 | 3242 | 72 | $0.00036 | 0.8 |  |
| 2026-10-24 07:47 | 121 | subject arm 5 opus–opus #1 B m14 | claude-opus-5-5 | 4 | 3500 | $0.08842 | 42.7 |  |
| 2026-10-24 07:47 | 122 | check arm 5 opus–opus #1 m14 | claude-haiku-5-5 | 3466 | 74 | $0.00038 | 1.6 |  |
| 2026-10-24 07:47 | 123 | subject arm 5 opus–opus #1 A m15 | claude-opus-5-5 | 4 | 1234 | $0.04399 | 17.1 |  |
| 2026-10-24 07:47 | 124 | subject arm 5 fable–fable #2 A m5 | claude-fable-5-1 | 4 | 1874 | $0.13084 | 34.2 |  |
| 2026-10-24 07:47 | 125 | check arm 5 opus–opus #1 m15 | claude-haiku-5-5 | 2937 | 73 | $0.00033 | 0.7 |  |
| 2026-10-24 07:47 | 126 | check arm 5 fable–fable #2 m5 | claude-haiku-5-5 | 3251 | 74 | $0.00036 | 0.7 |  |
| 2026-10-24 07:47 | 127 | subject arm 3 opus–fable #1 B m6 | claude-fable-5-1 | 4 | 2037 | $0.12888 | 38.7 |  |
| 2026-10-24 07:47 | 128 | check arm 3 opus–fable #1 m6 | claude-haiku-5-5 | 2396 | 64 | $0.00027 | 0.7 |  |
| 2026-10-24 07:47 | 129 | subject arm 5 opus–opus #1 B m16 | claude-opus-5-5 | 4 | 609 | $0.02909 | 8.3 |  |
| 2026-10-24 07:47 | 130 | check arm 5 opus–opus #1 m16 | claude-haiku-5-5 | 1319 | 78 | $0.00017 | 0.7 |  |
| 2026-10-24 07:47 | 131 | subject arm 5 opus–opus #1 A m17 | claude-opus-5-5 | 4 | 176 | $0.01273 | 3.4 |  |
| 2026-10-24 07:47 | 132 | tags 1 arm 5 opus–opus #1 m11–16 | claude-haiku-5-5 | 11016 | 412 | $0.00131 | 1.7 |  |
| 2026-10-24 07:47 | 133 | tags 2 arm 5 opus–opus #1 m1–10 | claude-haiku-5-5 | 14516 | 680 | $0.00179 | 2.2 |  |
| 2026-10-24 07:47 | 134 | tags 1 arm 5 opus–opus #1 m1–10 | claude-haiku-5-5 | 14516 | 680 | $0.00179 | 2.3 |  |
| 2026-10-24 07:47 | 135 | tags 2 arm 5 opus–opus #1 m11–16 | claude-haiku-5-5 | 11016 | 412 | $0.00131 | 1.7 |  |
| 2026-10-24 07:47 | 136 | subject arm 4 opus–opus #2 A m1 | claude-opus-5-5 | 59 | 478 | $0.00980 | 6.7 |  |
| 2026-10-24 07:47 | 137 | check arm 4 opus–opus #2 m1 | claude-haiku-5-5 | 773 | 79 | $0.00012 | 1 |  |
| 2026-10-24 07:47 | 138 | subject arm 3 opus–fable #1 A m7 | claude-opus-5-5 | 4 | 2347 | $0.05808 | 28.2 |  |
| 2026-10-24 07:47 | 139 | check arm 3 opus–fable #1 m7 | claude-haiku-5-5 | 2476 | 70 | $0.00028 | 0.8 |  |
| 2026-10-24 07:47 | 140 | subject arm 5 fable–fable #2 B m6 | claude-fable-5-1 | 4 | 2235 | $0.14931 | 39.5 |  |
| 2026-10-24 07:47 | 141 | check arm 5 fable–fable #2 m6 | claude-haiku-5-5 | 2978 | 76 | $0.00034 | 1.6 |  |
| 2026-10-24 07:47 | 142 | subject arm 4 opus–opus #2 B m2 | claude-opus-5-5 | 4 | 1288 | $0.11169 | 18.1 |  |
| 2026-10-24 07:47 | 143 | check arm 4 opus–opus #2 m2 | claude-haiku-5-5 | 1687 | 92 | $0.00021 | 0.8 |  |
| 2026-10-24 07:47 | 144 | subject arm 3 opus–fable #1 B m8 | claude-fable-5-1 | 4 | 1839 | $0.12015 | 34.4 |  |
| 2026-10-24 07:47 | 145 | check arm 3 opus–fable #1 m8 | claude-haiku-5-5 | 2507 | 66 | $0.00028 | 0.7 |  |
| 2026-10-24 07:47 | 146 | subject arm 4 opus–opus #2 A m3 | claude-opus-5-5 | 4 | 1656 | $0.04027 | 21.2 |  |
| 2026-10-24 07:47 | 147 | check arm 4 opus–opus #2 m3 | claude-haiku-5-5 | 2013 | 64 | $0.00023 | 0.7 |  |
| 2026-10-24 07:47 | 148 | subject arm 5 fable–fable #2 A m7 | claude-fable-5-1 | 4 | 2501 | $0.15962 | 47.8 |  |
| 2026-10-24 07:47 | 149 | check arm 5 fable–fable #2 m7 | claude-haiku-5-5 | 3222 | 82 | $0.00036 | 0.8 |  |
| 2026-10-24 07:47 | 150 | subject arm 4 opus–opus #2 B m4 | claude-opus-5-5 | 4 | 1406 | $0.04006 | 19 |  |
| 2026-10-24 07:47 | 151 | check arm 4 opus–opus #2 m4 | claude-haiku-5-5 | 1999 | 70 | $0.00023 | 0.8 |  |
| 2026-10-24 07:47 | 152 | subject arm 3 opus–fable #1 A m9 | claude-opus-5-5 | 4 | 3550 | $0.08311 | 38.6 |  |
| 2026-10-24 07:47 | 153 | check arm 3 opus–fable #1 m9 | claude-haiku-5-5 | 2678 | 80 | $0.00031 | 1.4 |  |
| 2026-10-24 07:47 | 154 | subject arm 4 opus–opus #2 A m5 | claude-opus-5-5 | 4 | 1481 | $0.03834 | 18 |  |
| 2026-10-24 07:47 | 155 | check arm 4 opus–opus #2 m5 | claude-haiku-5-5 | 2061 | 77 | $0.00024 | 0.9 |  |
| 2026-10-24 07:47 | 156 | subject arm 4 opus–opus #2 B m6 | claude-opus-5-5 | 4 | 2087 | $0.05426 | 27 |  |
| 2026-10-24 07:47 | 157 | check arm 4 opus–opus #2 m6 | claude-haiku-5-5 | 2113 | 64 | $0.00024 | 0.6 |  |
| 2026-10-24 07:47 | 158 | subject arm 5 fable–fable #2 B m8 | claude-fable-5-1 | 4 | 3146 | $0.19523 | 54.2 |  |
| 2026-10-24 07:47 | 159 | check arm 5 fable–fable #2 m8 | claude-haiku-5-5 | 3546 | 99 | $0.00040 | 1.5 |  |
| 2026-10-24 07:47 | 160 | subject arm 4 opus–opus #2 A m7 | claude-opus-5-5 | 4 | 1469 | $0.03901 | 17.8 |  |
| 2026-10-24 07:47 | 161 | check arm 4 opus–opus #2 m7 | claude-haiku-5-5 | 2090 | 82 | $0.00025 | 2.1 |  |
| 2026-10-24 07:47 | 162 | subject arm 3 opus–fable #1 B m10 | claude-fable-5-1 | 4 | 4466 | $0.25456 | 63.2 |  |
| 2026-10-24 07:47 | 163 | check arm 3 opus–fable #1 m10 | claude-haiku-5-5 | 3577 | 72 | $0.00039 | 1.1 |  |
| 2026-10-24 07:47 | 164 | subject arm 4 opus–opus #2 B m8 | claude-opus-5-5 | 4 | 1587 | $0.04476 | 19.9 |  |
| 2026-10-24 07:47 | 165 | check arm 4 opus–opus #2 m8 | claude-haiku-5-5 | 2036 | 64 | $0.00024 | 0.8 |  |
| 2026-10-24 07:47 | 166 | subject arm 5 fable–fable #2 A m9 | claude-fable-5-1 | 4 | 3079 | $0.19629 | 50.8 |  |
| 2026-10-24 07:47 | 167 | check arm 5 fable–fable #2 m9 | claude-haiku-5-5 | 3422 | 82 | $0.00038 | 1.2 |  |
| 2026-10-24 07:47 | 168 | subject arm 4 opus–opus #2 A m9 | claude-opus-5-5 | 4 | 1455 | $0.03870 | 17.1 |  |
| 2026-10-24 07:47 | 169 | check arm 4 opus–opus #2 m9 | claude-haiku-5-5 | 2051 | 83 | $0.00025 | 0.7 |  |
| 2026-10-24 07:47 | 170 | subject arm 4 opus–opus #2 B m10 | claude-opus-5-5 | 4 | 168 | $0.01654 | 4.3 |  |
| 2026-10-24 07:47 | 171 | tags 1 arm 4 opus–opus #2 m1–9 | claude-haiku-5-5 | 8415 | 613 | $0.00115 | 2.1 |  |
| 2026-10-24 07:47 | 172 | tags 2 arm 4 opus–opus #2 m1–9 | claude-haiku-5-5 | 8415 | 613 | $0.00115 | 2.2 |  |
| 2026-10-24 07:47 | 173 | tags referee arm 4 opus–opus #2 m1–9 | claude-opus-5-5 | 8415 | 613 | $0.04592 | 5.1 |  |
| 2026-10-24 07:47 | 174 | subject arm 3 fable–opus #2 A m1 | claude-fable-5-1 | 59 | 393 | $0.02024 | 8.5 |  |
| 2026-10-24 07:47 | 175 | check arm 3 fable–opus #2 m1 | claude-haiku-5-5 | 645 | 68 | $0.00010 | 1.1 |  |
| 2026-10-24 07:47 | 176 | subject arm 3 opus–fable #1 A m11 | claude-opus-5-5 | 4 | 4755 | $0.11300 | 48.8 |  |
| 2026-10-24 07:47 | 177 | check arm 3 opus–fable #1 m11 | claude-haiku-5-5 | 3827 | 80 | $0.00042 | 0.8 |  |
| 2026-10-24 07:47 | 178 | subject arm 5 fable–fable #2 B m10 | claude-fable-5-1 | 4 | 2237 | $0.15301 | 38.1 |  |
| 2026-10-24 07:47 | 179 | check arm 5 fable–fable #2 m10 | claude-haiku-5-5 | 3046 | 91 | $0.00035 | 2.3 |  |
| 2026-10-24 07:47 | 180 | subject arm 3 fable–opus #2 B m2 | claude-opus-5-5 | 376 | 1202 | $0.02554 | 17.1 |  |
| 2026-10-24 07:47 | 181 | subject arm 3 opus–fable #1 B m12 | claude-fable-5-1 | 4 | 762 | $0.08432 | 16.2 |  |
| 2026-10-24 07:47 | 182 | check arm 3 opus–fable #1 m12 | claude-haiku-5-5 | 2316 | 76 | $0.00027 | 1.6 |  |
| 2026-10-24 07:47 | 183 | check arm 3 fable–opus #2 m2 | claude-haiku-5-5 | 1451 | 72 | $0.00018 | 2.4 |  |
| 2026-10-24 07:47 | 184 | tags 1 arm 3 opus–fable #1 m11–12 | claude-haiku-5-5 | 4949 | 550 | $0.00077 | 2.8 |  |
| 2026-10-24 07:47 | 185 | tags 1 arm 3 opus–fable #1 m1–10 | claude-haiku-5-5 | 12104 | 680 | $0.00155 | 2.9 |  |
| 2026-10-24 07:47 | 186 | tags 2 arm 3 opus–fable #1 m1–10 | claude-haiku-5-5 | 12104 | 680 | $0.00155 | 3 |  |
| 2026-10-24 07:47 | 187 | tags 2 arm 3 opus–fable #1 m11–12 | claude-haiku-5-5 | 4949 | 144 | $0.00057 | 1.1 |  |
| 2026-10-24 07:47 | 188 | tags referee arm 3 opus–fable #1 m11–12 | claude-opus-5-5 | 4949 | 144 | $0.02268 | 2.1 |  |
| 2026-10-24 07:47 | 189 | subject arm 4 fable–fable #2 A m1 | claude-fable-5-1 | 59 | 638 | $0.03249 | 12.7 |  |
| 2026-10-24 07:47 | 190 | check arm 4 fable–fable #2 m1 | claude-haiku-5-5 | 854 | 74 | $0.00012 | 0.8 |  |
| 2026-10-24 07:47 | 191 | subject arm 5 fable–fable #2 A m11 | claude-fable-5-1 | 4 | 1167 | $0.09524 | 22.1 |  |
| 2026-10-24 07:47 | 192 | check arm 5 fable–fable #2 m11 | claude-haiku-5-5 | 2351 | 90 | $0.00028 | 1.7 |  |
| 2026-10-24 07:47 | 193 | subject arm 3 fable–opus #2 A m3 | claude-fable-5-1 | 4 | 1293 | $0.07958 | 24.6 |  |
| 2026-10-24 07:47 | 194 | check arm 3 fable–opus #2 m3 | claude-haiku-5-5 | 2047 | 67 | $0.00024 | 0.8 |  |
| 2026-10-24 07:47 | 195 | subject arm 5 fable–fable #2 B m12 | claude-fable-5-1 | 4 | 255 | $0.04130 | 5.2 |  |
| 2026-10-24 07:47 | 196 | tags 2 arm 5 fable–fable #2 m1–10 | claude-haiku-5-5 | 14550 | 680 | $0.00179 | 2.2 |  |
| 2026-10-24 07:47 | 197 | tags 1 arm 5 fable–fable #2 m1–10 | claude-haiku-5-5 | 14550 | 680 | $0.00179 | 2.3 |  |
| 2026-10-24 07:47 | 198 | tags 1 arm 5 fable–fable #2 m11–11 | claude-haiku-5-5 | 2947 | 404 | $0.00050 | 2.3 |  |
| 2026-10-24 07:47 | 199 | tags 2 arm 5 fable–fable #2 m11–11 | claude-haiku-5-5 | 2947 | 407 | $0.00050 | 2.5 |  |
| 2026-10-24 07:47 | 200 | subject arm 5 opus–opus #2 A m1 | claude-opus-5-5 | 84 | 549 | $0.01132 | 7.8 |  |
| 2026-10-24 07:47 | 201 | check arm 5 opus–opus #2 m1 | claude-haiku-5-5 | 815 | 56 | $0.00011 | 0.7 |  |
| 2026-10-24 07:47 | 202 | subject arm 3 fable–opus #2 B m4 | claude-opus-5-5 | 4 | 1260 | $0.03574 | 17.2 |  |
| 2026-10-24 07:47 | 203 | check arm 3 fable–opus #2 m4 | claude-haiku-5-5 | 2073 | 69 | $0.00024 | 0.8 |  |
| 2026-10-24 07:47 | 204 | subject arm 5 opus–opus #2 B m2 | claude-opus-5-5 | 4 | 1120 | $0.02525 | 13.6 |  |
| 2026-10-24 07:47 | 205 | check arm 5 opus–opus #2 m2 | claude-haiku-5-5 | 1557 | 75 | $0.00019 | 0.7 |  |
| 2026-10-24 07:47 | 206 | subject arm 4 fable–fable #2 B m2 | claude-fable-5-1 | 4 | 2286 | $0.33014 | 41.9 |  |
| 2026-10-24 07:47 | 207 | check arm 4 fable–fable #2 m2 | claude-haiku-5-5 | 1939 | 69 | $0.00023 | 1 |  |
| 2026-10-24 07:47 | 208 | subject arm 5 opus–opus #2 A m3 | claude-opus-5-5 | 4 | 1684 | $0.04031 | 19.6 |  |
| 2026-10-24 07:47 | 209 | check arm 5 opus–opus #2 m3 | claude-haiku-5-5 | 2197 | 65 | $0.00025 | 1 |  |
| 2026-10-24 07:47 | 210 | subject arm 3 fable–opus #2 A m5 | claude-fable-5-1 | 4 | 1826 | $0.11361 | 31.4 |  |
| 2026-10-24 07:47 | 211 | check arm 3 fable–opus #2 m5 | claude-haiku-5-5 | 2042 | 77 | $0.00024 | 1.1 |  |
| 2026-10-24 07:47 | 212 | subject arm 4 fable–fable #2 A m3 | claude-fable-5-1 | 4 | 1561 | $0.09908 | 32.5 |  |
| 2026-10-24 07:47 | 213 | check arm 4 fable–fable #2 m3 | claude-haiku-5-5 | 2256 | 82 | $0.00027 | 1.6 |  |
| 2026-10-24 07:47 | 214 | subject arm 3 fable–opus #2 B m6 | claude-opus-5-5 | 4 | 1640 | $0.04187 | 18.9 |  |
| 2026-10-24 07:47 | 215 | check arm 3 fable–opus #2 m6 | claude-haiku-5-5 | 2206 | 73 | $0.00026 | 0.9 |  |
| 2026-10-24 07:47 | 216 | subject arm 5 opus–opus #2 B m4 | claude-opus-5-5 | 4 | 1702 | $0.04358 | 23.6 |  |
| 2026-10-24 07:47 | 217 | check arm 5 opus–opus #2 m4 | claude-haiku-5-5 | 2488 | 68 | $0.00028 | 1 |  |
| 2026-10-24 07:47 | 218 | subject arm 5 opus–opus #2 A m5 | claude-opus-5-5 | 4 | 1439 | $0.03993 | 18.6 |  |
| 2026-10-24 07:47 | 219 | check arm 5 opus–opus #2 m5 | claude-haiku-5-5 | 2293 | 66 | $0.00026 | 1.1 |  |
| 2026-10-24 07:47 | 220 | subject arm 3 fable–opus #2 A m7 | claude-fable-5-1 | 4 | 1641 | $0.10646 | 32.5 |  |
| 2026-10-24 07:47 | 221 | check arm 3 fable–opus #2 m7 | claude-haiku-5-5 | 2383 | 63 | $0.00027 | 0.7 |  |
| 2026-10-24 07:47 | 222 | subject arm 5 opus–opus #2 B m6 | claude-opus-5-5 | 4 | 1393 | $0.03826 | 17.5 |  |
| 2026-10-24 07:47 | 223 | check arm 5 opus–opus #2 m6 | claude-haiku-5-5 | 2340 | 80 | $0.00027 | 0.8 |  |
| 2026-10-24 07:47 | 224 | subject arm 4 fable–fable #2 B m4 | claude-fable-5-1 | 4 | 3134 | $0.18532 | 58.4 |  |
| 2026-10-24 07:47 | 225 | subject arm 3 fable–opus #2 B m8 | claude-opus-5-5 | 4 | 1214 | $0.03540 | 16 |  |
| 2026-10-24 07:47 | 226 | check arm 4 fable–fable #2 m4 | claude-haiku-5-5 | 2477 | 77 | $0.00029 | 0.8 |  |
| 2026-10-24 07:47 | 227 | check arm 3 fable–opus #2 m8 | claude-haiku-5-5 | 2219 | 96 | $0.00027 | 3.9 |  |
| 2026-10-24 07:47 | 228 | subject arm 5 opus–opus #2 A m7 | claude-opus-5-5 | 4 | 1526 | $0.04136 | 19.9 |  |
| 2026-10-24 07:47 | 229 | subject arm 3 fable–opus #2 A m9 | claude-fable-5-1 | 4 | 569 | $0.05350 | 10.2 |  |
| 2026-10-24 07:47 | 230 | check arm 5 opus–opus #2 m7 | claude-haiku-5-5 | 2085 | 68 | $0.00024 | 0.9 |  |
| 2026-10-24 07:47 | 231 | check arm 3 fable–opus #2 m9 | claude-haiku-5-5 | 1445 | 67 | $0.00018 | 0.8 |  |
| 2026-10-24 07:47 | 232 | tags 1 arm 3 fable–opus #2 m1–9 | claude-haiku-5-5 | 7989 | 613 | $0.00111 | 2.4 |  |
| 2026-10-24 07:47 | 233 | tags 2 arm 3 fable–opus #2 m1–9 | claude-haiku-5-5 | 7989 | 613 | $0.00111 | 2.4 |  |
| 2026-10-24 07:47 | 234 | tags referee arm 3 fable–opus #2 m1–9 | claude-opus-5-5 | 7989 | 955 | $0.05106 | 8 |  |
| 2026-10-24 07:47 | 235 | subject arm 3 fable–sonnet #2 A m1 | claude-fable-5-1 | 59 | 403 | $0.02074 | 8.7 |  |
| 2026-10-24 07:47 | 236 | check arm 3 fable–sonnet #2 m1 | claude-haiku-5-5 | 639 | 68 | $0.00010 | 0.9 |  |
| 2026-10-24 07:47 | 237 | tags 1 arm 3 fable–sonnet #2 m1–1 | claude-haiku-5-5 | 1198 | 77 | $0.00016 | 0.7 |  |
| 2026-10-24 07:47 | 238 | tags 2 arm 3 fable–sonnet #2 m1–1 | claude-haiku-5-5 | 1198 | 77 | $0.00016 | 0.7 |  |
| 2026-10-24 07:47 | 239 | subject arm 5 opus–opus #2 B m8 | claude-opus-5-5 | 4 | 1175 | $0.03325 | 17 |  |
| 2026-10-24 07:47 | 240 | check arm 5 opus–opus #2 m8 | claude-haiku-5-5 | 1523 | 66 | $0.00019 | 0.8 |  |
| 2026-10-24 07:47 | 241 | subject arm 4 fable–fable #2 A m5 | claude-fable-5-1 | 4 | 1596 | $0.10728 | 33 |  |
| 2026-10-24 07:47 | 242 | check arm 4 fable–fable #2 m5 | claude-haiku-5-5 | 2422 | 77 | $0.00028 | 0.8 |  |
| 2026-10-24 07:47 | 243 | subject arm 4 fable–fable #3 A m1 | claude-fable-5-1 | 4 | 1213 | $0.06487 | 22.6 |  |
| 2026-10-24 07:47 | 244 | check arm 4 fable–fable #3 m1 | claude-haiku-5-5 | 1041 | 93 | $0.00015 | 1.2 |  |
| 2026-10-24 07:47 | 245 | subject arm 5 opus–opus #2 A m9 | claude-opus-5-5 | 4 | 1502 | $0.03720 | 20.1 |  |
| 2026-10-24 07:47 | 246 | check arm 5 opus–opus #2 m9 | claude-haiku-5-5 | 1536 | 87 | $0.00020 | 1.1 |  |
| 2026-10-24 07:47 | 247 | subject arm 4 fable–fable #2 B m6 | claude-fable-5-1 | 4 | 1635 | $0.11293 | 30.9 |  |
| 2026-10-24 07:47 | 248 | check arm 4 fable–fable #2 m6 | claude-haiku-5-5 | 1702 | 115 | $0.00023 | 1.6 |  |
| 2026-10-24 07:47 | 249 | subject arm 4 fable–fable #3 B m2 | claude-fable-5-1 | 4 | 1217 | $0.07049 | 23.2 |  |
| 2026-10-24 07:47 | 250 | check arm 4 fable–fable #3 m2 | claude-haiku-5-5 | 1935 | 64 | $0.00023 | 0.8 |  |
| 2026-10-24 07:47 | 251 | subject arm 4 fable–fable #2 A m7 | claude-fable-5-1 | 4 | 364 | $0.03654 | 7.7 |  |
| 2026-10-24 07:47 | 252 | check arm 4 fable–fable #2 m7 | claude-haiku-5-5 | 978 | 64 | $0.00013 | 1.1 |  |
| 2026-10-24 07:47 | 253 | subject arm 5 opus–opus #2 B m10 | claude-opus-5-5 | 4 | 1680 | $0.04096 | 22 |  |
| 2026-10-24 07:47 | 254 | check arm 5 opus–opus #2 m10 | claude-haiku-5-5 | 1925 | 106 | $0.00025 | 1.1 |  |
| 2026-10-24 07:47 | 255 | tags 2 arm 4 fable–fable #2 m1–7 | claude-haiku-5-5 | 6220 | 479 | $0.00086 | 1.9 |  |
| 2026-10-24 07:47 | 256 | tags 1 arm 4 fable–fable #2 m1–7 | claude-haiku-5-5 | 6220 | 479 | $0.00086 | 2.2 |  |
| 2026-10-24 07:47 | 257 | subject arm 3 sonnet–fable #3 A m1 | claude-sonnet-5-5 | 59 | 256 | $0.00268 | 2.9 |  |
| 2026-10-24 07:47 | 258 | check arm 3 sonnet–fable #3 m1 | claude-haiku-5-5 | 582 | 85 | $0.00010 | 0.9 |  |
| 2026-10-24 07:47 | 259 | tags referee arm 4 fable–fable #2 m1–7 | claude-opus-5-5 | 6220 | 479 | $0.03446 | 4.4 |  |
| 2026-10-24 07:47 | 260 | subject arm 3 sonnet–fable #3 B m2 | claude-fable-5-1 | 313 | 319 | $0.01908 | 7.2 |  |
| 2026-10-24 07:47 | 261 | check arm 3 sonnet–fable #3 m2 | claude-haiku-5-5 | 843 | 80 | $0.00012 | 1.2 |  |
| 2026-10-24 07:47 | 262 | subject arm 3 sonnet–fable #3 A m3 | claude-sonnet-5-5 | 4 | 358 | $0.00505 | 4.4 |  |
| 2026-10-24 07:47 | 263 | check arm 3 sonnet–fable #3 m3 | claude-haiku-5-5 | 945 | 73 | $0.00013 | 0.9 |  |
| 2026-10-24 07:47 | 264 | subject arm 5 opus–opus #2 A m11 | claude-opus-5-5 | 4 | 1735 | $0.04411 | 23.2 |  |
| 2026-10-24 07:47 | 265 | subject arm 4 fable–fable #3 A m3 | claude-fable-5-1 | 4 | 1487 | $0.09882 | 28.2 |  |
| 2026-10-24 07:47 | 266 | check arm 5 opus–opus #2 m11 | claude-haiku-5-5 | 2515 | 83 | $0.00029 | 2.6 |  |
| 2026-10-24 07:47 | 267 | subject arm 3 sonnet–fable #3 B m4 | claude-fable-5-1 | 4 | 452 | $0.03438 | 10.2 |  |
| 2026-10-24 08:14 | 1 | check arm 3 sonnet–fable #3 m4 | claude-haiku-5-5 | 1064 | 82 | $0.00015 | 1.1 |  |
| 2026-10-24 08:14 | 2 | subject arm 3 opus–fable #3 A m1 | claude-opus-5-5 | 59 | 447 | $0.00918 | 6.6 |  |
| 2026-10-24 08:14 | 3 | check arm 3 opus–fable #3 m1 | claude-haiku-5-5 | 732 | 54 | $0.00010 | 0.6 |  |
| 2026-10-24 08:14 | 4 | subject arm 3 sonnet–fable #3 A m5 | claude-sonnet-5-5 | 4 | 543 | $0.00877 | 6.5 |  |
| 2026-10-24 08:14 | 5 | check arm 3 sonnet–fable #3 m5 | claude-haiku-5-5 | 1249 | 66 | $0.00016 | 0.7 |  |
| 2026-10-24 08:14 | 6 | subject arm 5 opus–opus #2 B m12 | claude-opus-5-5 | 4 | 1090 | $0.06991 | 16.5 |  |
| 2026-10-24 08:14 | 7 | check arm 5 opus–opus #2 m12 | claude-haiku-5-5 | 2131 | 69 | $0.00025 | 0.8 |  |
| 2026-10-24 08:14 | 8 | subject arm 5 opus–opus #2 A m13 | claude-opus-5-5 | 4 | 171 | $0.05421 | 4.1 |  |
| 2026-10-24 08:14 | 9 | tags 1 arm 5 opus–opus #2 m11–12 | claude-haiku-5-5 | 3661 | 144 | $0.00044 | 0.8 |  |
| 2026-10-24 08:14 | 10 | subject arm 3 sonnet–fable #3 B m6 | claude-fable-5-1 | 4 | 674 | $0.05715 | 14.5 |  |
| 2026-10-24 08:14 | 11 | check arm 3 sonnet–fable #3 m6 | claude-haiku-5-5 | 1431 | 65 | $0.00018 | 1.3 |  |
| 2026-10-24 08:14 | 12 | tags 1 arm 5 opus–opus #2 m1–10 | claude-haiku-5-5 | 9287 | 680 | $0.00127 | 3.1 |  |
| 2026-10-24 08:14 | 13 | tags 2 arm 5 opus–opus #2 m1–10 | claude-haiku-5-5 | 9287 | 680 | $0.00127 | 3.2 |  |
| 2026-10-24 08:14 | 14 | tags 2 arm 5 opus–opus #2 m11–12 | claude-haiku-5-5 | 3661 | 144 | $0.00044 | 0.8 |  |
| 2026-10-24 08:14 | 15 | subject arm 3 opus–fable #3 B m2 | claude-fable-5-1 | 463 | 1009 | $0.05508 | 19.3 |  |
| 2026-10-24 08:14 | 16 | check arm 3 opus–fable #3 m2 | claude-haiku-5-5 | 1423 | 72 | $0.00018 | 0.8 |  |
| 2026-10-24 08:14 | 17 | tags referee arm 5 opus–opus #2 m11–12 | claude-opus-5-5 | 3661 | 144 | $0.01752 | 2.1 |  |
| 2026-10-24 08:14 | 18 | subject arm 3 sonnet–fable #3 A m7 | claude-sonnet-5-5 | 4 | 503 | $0.00809 | 6.3 |  |
| 2026-10-24 08:14 | 19 | subject arm 5 opus–opus #3 A m1 | claude-opus-5-5 | 84 | 617 | $0.01268 | 8.3 |  |
| 2026-10-24 08:14 | 20 | check arm 3 sonnet–fable #3 m7 | claude-haiku-5-5 | 1256 | 79 | $0.00017 | 1.1 |  |
| 2026-10-24 08:14 | 21 | check arm 5 opus–opus #3 m1 | claude-haiku-5-5 | 891 | 80 | $0.00013 | 0.8 |  |
| 2026-10-24 08:14 | 22 | subject arm 5 opus–opus #3 B m2 | claude-opus-5-5 | 4 | 1155 | $0.02633 | 15 |  |
| 2026-10-24 08:14 | 23 | check arm 5 opus–opus #3 m2 | claude-haiku-5-5 | 1630 | 79 | $0.00020 | 0.8 |  |
| 2026-10-24 08:14 | 24 | subject arm 3 sonnet–fable #3 B m8 | claude-fable-5-1 | 4 | 896 | $0.05707 | 19.9 |  |
| 2026-10-24 08:14 | 25 | check arm 3 sonnet–fable #3 m8 | claude-haiku-5-5 | 1524 | 59 | $0.00018 | 1.2 |  |
| 2026-10-24 08:14 | 26 | subject arm 3 opus–fable #3 A m3 | claude-opus-5-5 | 4 | 3077 | $0.06737 | 36.6 |  |
| 2026-10-24 08:14 | 27 | check arm 3 opus–fable #3 m3 | claude-haiku-5-5 | 2945 | 64 | $0.00033 | 0.7 |  |
| 2026-10-24 08:14 | 28 | subject arm 3 sonnet–fable #3 A m9 | claude-sonnet-5-5 | 4 | 1083 | $0.01435 | 11.4 |  |
| 2026-10-24 08:14 | 29 | check arm 3 sonnet–fable #3 m9 | claude-haiku-5-5 | 1670 | 66 | $0.00020 | 0.7 |  |
| 2026-10-24 08:14 | 30 | subject arm 5 opus–opus #3 A m3 | claude-opus-5-5 | 4 | 1753 | $0.04205 | 22.2 |  |
| 2026-10-24 08:14 | 31 | check arm 5 opus–opus #3 m3 | claude-haiku-5-5 | 2212 | 64 | $0.00025 | 0.8 |  |
| 2026-10-24 08:14 | 32 | subject arm 3 sonnet–fable #3 B m10 | claude-fable-5-1 | 4 | 986 | $0.06698 | 19.8 |  |
| 2026-10-24 08:14 | 33 | check arm 3 sonnet–fable #3 m10 | claude-haiku-5-5 | 1659 | 90 | $0.00021 | 0.8 |  |
| 2026-10-24 08:14 | 34 | subject arm 3 sonnet–fable #3 A m11 | claude-sonnet-5-5 | 4 | 808 | $0.01218 | 8.3 |  |
| 2026-10-24 08:14 | 35 | check arm 3 sonnet–fable #3 m11 | claude-haiku-5-5 | 1309 | 65 | $0.00016 | 0.8 |  |
| 2026-10-24 08:14 | 36 | subject arm 5 opus–opus #3 B m4 | claude-opus-5-5 | 4 | 1901 | $0.04765 | 25.8 |  |
| 2026-10-24 08:14 | 37 | check arm 5 opus–opus #3 m4 | claude-haiku-5-5 | 2599 | 80 | $0.00030 | 0.8 |  |
| 2026-10-24 08:14 | 38 | subject arm 3 sonnet–fable #3 B m12 | claude-fable-5-1 | 4 | 129 | $0.01996 | 2.8 |  |
| 2026-10-24 08:14 | 39 | tags 2 arm 3 sonnet–fable #3 m1–10 | claude-haiku-5-5 | 5975 | 680 | $0.00094 | 2.3 |  |
| 2026-10-24 08:14 | 40 | tags 1 arm 3 sonnet–fable #3 m1–10 | claude-haiku-5-5 | 5975 | 680 | $0.00094 | 2.3 |  |
| 2026-10-24 08:14 | 41 | tags 1 arm 3 sonnet–fable #3 m11–11 | claude-haiku-5-5 | 1905 | 393 | $0.00039 | 2.6 |  |
| 2026-10-24 08:14 | 42 | tags 2 arm 3 sonnet–fable #3 m11–11 | claude-haiku-5-5 | 1905 | 556 | $0.00047 | 3.3 |  |
| 2026-10-24 08:14 | 43 | tags referee arm 3 sonnet–fable #3 m1–10 | claude-opus-5-5 | 5975 | 680 | $0.03750 | 5.5 |  |
| 2026-10-24 08:14 | 44 | tags referee arm 3 sonnet–fable #3 m11–11 | claude-opus-5-5 | 1905 | 257 | $0.01276 | 3.3 |  |
| 2026-10-24 08:14 | 45 | subject arm 5 fable–fable #3 A m1 | claude-fable-5-1 | 84 | 610 | $0.03134 | 10.7 |  |
| 2026-10-24 08:14 | 46 | check arm 5 fable–fable #3 m1 | claude-haiku-5-5 | 844 | 71 | $0.00012 | 0.7 |  |
| 2026-10-24 08:14 | 47 | subject arm 3 opus–fable #3 B m4 | claude-fable-5-1 | 4 | 3502 | $0.21375 | 58.9 |  |
| 2026-10-24 08:14 | 48 | subject arm 5 opus–opus #3 A m5 | claude-opus-5-5 | 4 | 1802 | $0.04775 | 21 |  |
| 2026-10-24 08:14 | 49 | check arm 3 opus–fable #3 m4 | claude-haiku-5-5 | 3907 | 68 | $0.00042 | 0.9 |  |
| 2026-10-24 08:14 | 50 | check arm 5 opus–opus #3 m5 | claude-haiku-5-5 | 2725 | 77 | $0.00031 | 0.9 |  |
| 2026-10-24 08:14 | 51 | subject arm 5 fable–fable #3 B m2 | claude-fable-5-1 | 4 | 1309 | $0.07294 | 23.3 |  |
| 2026-10-24 08:14 | 52 | check arm 5 fable–fable #3 m2 | claude-haiku-5-5 | 2011 | 69 | $0.00024 | 1.5 |  |
| 2026-10-24 08:14 | 53 | subject arm 5 opus–opus #3 B m6 | claude-opus-5-5 | 4 | 2012 | $0.05281 | 24.8 |  |
| 2026-10-24 08:14 | 54 | check arm 5 opus–opus #3 m6 | claude-haiku-5-5 | 2844 | 77 | $0.00032 | 0.8 |  |
| 2026-10-24 08:14 | 55 | subject arm 3 opus–fable #3 A m5 | claude-opus-5-5 | 4 | 4035 | $0.09891 | 46.6 |  |
| 2026-10-24 08:14 | 56 | check arm 3 opus–fable #3 m5 | claude-haiku-5-5 | 4272 | 78 | $0.00047 | 0.9 |  |
| 2026-10-24 08:14 | 57 | subject arm 5 opus–opus #3 A m7 | claude-opus-5-5 | 4 | 1898 | $0.05136 | 23.2 |  |
| 2026-10-24 08:14 | 58 | check arm 5 opus–opus #3 m7 | claude-haiku-5-5 | 2876 | 71 | $0.00032 | 2.2 |  |
| 2026-10-24 08:14 | 59 | subject arm 5 fable–fable #3 A m3 | claude-fable-5-1 | 4 | 2416 | $0.14304 | 41.8 |  |
| 2026-10-24 08:14 | 60 | check arm 5 fable–fable #3 m3 | claude-haiku-5-5 | 3134 | 66 | $0.00035 | 0.8 |  |
| 2026-10-24 08:14 | 61 | subject arm 5 opus–opus #3 B m8 | claude-opus-5-5 | 4 | 2514 | $0.06409 | 29.8 |  |
| 2026-10-24 08:14 | 62 | check arm 5 opus–opus #3 m8 | claude-haiku-5-5 | 3114 | 81 | $0.00035 | 0.9 |  |
| 2026-10-24 08:14 | 63 | subject arm 3 opus–fable #3 B m6 | claude-fable-5-1 | 4 | 3355 | $0.21802 | 60.9 |  |
| 2026-10-24 08:14 | 64 | check arm 3 opus–fable #3 m6 | claude-haiku-5-5 | 4591 | 76 | $0.00050 | 0.9 |  |
| 2026-10-24 08:14 | 65 | subject arm 5 opus–opus #3 A m9 | claude-opus-5-5 | 4 | 3863 | $0.09251 | 45.7 |  |
| 2026-10-24 08:14 | 66 | check arm 5 opus–opus #3 m9 | claude-haiku-5-5 | 3006 | 88 | $0.00034 | 1.5 |  |
| 2026-10-24 08:14 | 67 | subject arm 5 fable–fable #3 B m4 | claude-fable-5-1 | 4 | 4783 | $0.27458 | 81.3 |  |
| 2026-10-24 08:14 | 68 | check arm 5 fable–fable #3 m4 | claude-haiku-5-5 | 4078 | 70 | $0.00044 | 1.7 |  |
| 2026-10-24 08:14 | 69 | subject arm 3 opus–fable #3 A m7 | claude-opus-5-5 | 4 | 3431 | $0.09097 | 41.5 |  |
| 2026-10-24 08:14 | 70 | check arm 3 opus–fable #3 m7 | claude-haiku-5-5 | 4610 | 67 | $0.00049 | 1.1 |  |
| 2026-10-24 08:14 | 71 | subject arm 5 opus–opus #3 B m10 | claude-opus-5-5 | 4 | 2560 | $0.06617 | 27.7 |  |
| 2026-10-24 08:14 | 72 | check arm 5 opus–opus #3 m10 | claude-haiku-5-5 | 2796 | 86 | $0.00032 | 1.3 |  |
| 2026-10-24 08:14 | 73 | subject arm 5 fable–fable #3 A m5 | claude-fable-5-1 | 4 | 2447 | $0.16987 | 42.1 |  |
| 2026-10-24 08:14 | 74 | check arm 5 fable–fable #3 m5 | claude-haiku-5-5 | 3914 | 62 | $0.00042 | 1.6 |  |
| 2026-10-24 08:14 | 75 | subject arm 5 opus–opus #3 A m11 | claude-opus-5-5 | 4 | 2462 | $0.06346 | 28.1 |  |
| 2026-10-24 08:14 | 76 | check arm 5 opus–opus #3 m11 | claude-haiku-5-5 | 2951 | 64 | $0.00033 | 0.8 |  |
| 2026-10-24 08:14 | 77 | subject arm 3 opus–fable #3 B m8 | claude-fable-5-1 | 4 | 2622 | $0.18659 | 49.5 |  |
| 2026-10-24 08:14 | 78 | check arm 3 opus–fable #3 m8 | claude-haiku-5-5 | 4157 | 65 | $0.00045 | 0.9 |  |
| 2026-10-24 08:14 | 79 | subject arm 5 opus–opus #3 B m12 | claude-opus-5-5 | 4 | 1117 | $0.03758 | 14.2 |  |
| 2026-10-24 08:14 | 80 | check arm 5 opus–opus #3 m12 | claude-haiku-5-5 | 2378 | 86 | $0.00028 | 0.8 |  |
| 2026-10-24 08:14 | 81 | subject arm 5 opus–opus #3 A m13 | claude-opus-5-5 | 4 | 462 | $0.02187 | 6.8 |  |
| 2026-10-24 08:14 | 82 | check arm 5 opus–opus #3 m13 | claude-haiku-5-5 | 1255 | 75 | $0.00016 | 0.9 |  |
| 2026-10-24 08:14 | 83 | subject arm 5 opus–opus #3 B m14 | claude-opus-5-5 | 4 | 52 | $0.00832 | 2.1 |  |
| 2026-10-24 08:14 | 84 | tags 1 arm 5 opus–opus #3 m11–13 | claude-haiku-5-5 | 4519 | 211 | $0.00056 | 1.4 |  |
| 2026-10-24 08:14 | 85 | tags 2 arm 5 opus–opus #3 m1–10 | claude-haiku-5-5 | 12437 | 680 | $0.00158 | 3 |  |
| 2026-10-24 08:14 | 86 | tags 1 arm 5 opus–opus #3 m1–10 | claude-haiku-5-5 | 12437 | 680 | $0.00158 | 3.1 |  |
| 2026-10-24 08:14 | 87 | tags 2 arm 5 opus–opus #3 m11–13 | claude-haiku-5-5 | 4519 | 211 | $0.00056 | 1.3 |  |
| 2026-10-24 08:14 | 88 | subject arm 3 opus–fable #3 A m9 | claude-opus-5-5 | 4 | 2022 | $0.06147 | 26.6 |  |
| 2026-10-24 08:14 | 89 | subject arm 5 fable–fable #3 B m6 | claude-fable-5-1 | 4 | 2443 | $0.16803 | 42 |  |
| 2026-10-24 08:14 | 90 | check arm 3 opus–fable #3 m9 | claude-haiku-5-5 | 3105 | 81 | $0.00035 | 0.8 |  |
| 2026-10-24 08:14 | 91 | subject arm 3 fable–opus #4 A m1 | claude-fable-5-1 | 59 | 448 | $0.02299 | 8.1 |  |
| 2026-10-24 08:14 | 92 | check arm 5 fable–fable #3 m6 | claude-haiku-5-5 | 3475 | 74 | $0.00038 | 0.9 |  |
| 2026-10-24 08:14 | 93 | check arm 3 fable–opus #4 m1 | claude-haiku-5-5 | 700 | 76 | $0.00011 | 0.9 |  |
| 2026-10-24 08:14 | 94 | subject arm 3 opus–fable #3 B m10 | claude-fable-5-1 | 4 | 845 | $0.08000 | 18 |  |
| 2026-10-24 08:14 | 95 | subject arm 3 fable–opus #4 B m2 | claude-opus-5-5 | 431 | 1479 | $0.03130 | 18.3 |  |
| 2026-10-24 08:14 | 96 | check arm 3 fable–opus #4 m2 | claude-haiku-5-5 | 1623 | 83 | $0.00020 | 0.7 |  |
| 2026-10-24 08:14 | 97 | check arm 3 opus–fable #3 m10 | claude-haiku-5-5 | 2093 | 86 | $0.00025 | 2.2 |  |
| 2026-10-24 08:14 | 98 | subject arm 3 opus–fable #3 A m11 | claude-opus-5-5 | 4 | 1019 | $0.03186 | 13.7 |  |
| 2026-10-24 08:14 | 99 | check arm 3 opus–fable #3 m11 | claude-haiku-5-5 | 1232 | 66 | $0.00016 | 0.7 |  |
| 2026-10-24 08:14 | 100 | tags 1 arm 3 opus–fable #3 m11–11 | claude-haiku-5-5 | 1828 | 77 | $0.00022 | 0.7 |  |
| 2026-10-24 08:14 | 101 | tags 2 arm 3 opus–fable #3 m1–10 | claude-haiku-5-5 | 15625 | 680 | $0.00190 | 2.6 |  |
| 2026-10-24 08:14 | 102 | tags 1 arm 3 opus–fable #3 m1–10 | claude-haiku-5-5 | 15625 | 680 | $0.00190 | 2.6 |  |
| 2026-10-24 08:14 | 103 | tags 2 arm 3 opus–fable #3 m11–11 | claude-haiku-5-5 | 1828 | 77 | $0.00022 | 0.9 |  |
| 2026-10-24 08:14 | 104 | subject arm 5 opus–opus #4 A m1 | claude-opus-5-5 | 84 | 597 | $0.01228 | 7.9 |  |
| 2026-10-24 08:14 | 105 | check arm 5 opus–opus #4 m1 | claude-haiku-5-5 | 859 | 62 | $0.00012 | 2.3 |  |
| 2026-10-24 08:14 | 106 | subject arm 3 fable–opus #4 A m3 | claude-fable-5-1 | 4 | 1763 | $0.10523 | 34 |  |
| 2026-10-24 08:14 | 107 | check arm 3 fable–opus #4 m3 | claude-haiku-5-5 | 2201 | 71 | $0.00026 | 0.8 |  |
| 2026-10-24 08:14 | 108 | subject arm 5 opus–opus #4 B m2 | claude-opus-5-5 | 4 | 1243 | $0.02793 | 16 |  |
| 2026-10-24 08:14 | 109 | check arm 5 opus–opus #4 m2 | claude-haiku-5-5 | 1661 | 65 | $0.00020 | 0.6 |  |
| 2026-10-24 08:14 | 110 | subject arm 3 fable–opus #4 B m4 | claude-opus-5-5 | 4 | 1462 | $0.04082 | 19.1 |  |
| 2026-10-24 08:14 | 111 | check arm 3 fable–opus #4 m4 | claude-haiku-5-5 | 2179 | 68 | $0.00025 | 1.1 |  |
| 2026-10-24 08:14 | 112 | subject arm 5 fable–fable #3 A m7 | claude-fable-5-1 | 4 | 4994 | $0.29062 | 79.9 |  |
| 2026-10-24 08:14 | 113 | check arm 5 fable–fable #3 m7 | claude-haiku-5-5 | 4021 | 89 | $0.00045 | 2 |  |
| 2026-10-24 08:14 | 114 | subject arm 5 opus–opus #4 A m3 | claude-opus-5-5 | 4 | 2265 | $0.05245 | 27.6 |  |
| 2026-10-24 08:14 | 115 | check arm 5 opus–opus #4 m3 | claude-haiku-5-5 | 2611 | 71 | $0.00030 | 0.8 |  |
| 2026-10-24 08:14 | 116 | subject arm 3 fable–opus #4 A m5 | claude-fable-5-1 | 4 | 1495 | $0.09843 | 26.2 |  |
| 2026-10-24 08:14 | 117 | check arm 3 fable–opus #4 m5 | claude-haiku-5-5 | 2106 | 81 | $0.00025 | 0.8 |  |
| 2026-10-24 08:14 | 118 | subject arm 5 opus–opus #4 B m4 | claude-opus-5-5 | 4 | 2410 | $0.05982 | 29.9 |  |
| 2026-10-24 08:14 | 119 | subject arm 3 fable–opus #4 B m6 | claude-opus-5-5 | 4 | 1468 | $0.03879 | 18.4 |  |
| 2026-10-24 08:14 | 120 | check arm 5 opus–opus #4 m4 | claude-haiku-5-5 | 3235 | 73 | $0.00036 | 0.8 |  |
| 2026-10-24 08:14 | 121 | check arm 3 fable–opus #4 m6 | claude-haiku-5-5 | 2195 | 70 | $0.00025 | 1.1 |  |
| 2026-10-24 08:14 | 122 | check referee arm 3 fable–opus #4 m6 | claude-opus-5-5 | 2195 | 59 | $0.00996 | 1.3 |  |
| 2026-10-24 08:14 | 123 | tags 1 arm 3 fable–opus #4 m1–6 | claude-haiku-5-5 | 6017 | 412 | $0.00081 | 1.5 |  |
| 2026-10-24 08:14 | 124 | tags 2 arm 3 fable–opus #4 m1–6 | claude-haiku-5-5 | 6017 | 412 | $0.00081 | 1.7 |  |
| 2026-10-24 08:14 | 125 | subject arm 3 fable–sonnet #4 A m1 | claude-fable-5-1 | 59 | 615 | $0.03134 | 12.1 |  |
| 2026-10-24 08:14 | 126 | subject arm 5 fable–fable #3 B m8 | claude-fable-5-1 | 4 | 3872 | $0.24172 | 63.8 |  |
| 2026-10-24 08:14 | 127 | check arm 3 fable–sonnet #4 m1 | claude-haiku-5-5 | 830 | 63 | $0.00011 | 0.9 |  |
| 2026-10-24 08:14 | 128 | check arm 5 fable–fable #3 m8 | claude-haiku-5-5 | 4418 | 87 | $0.00049 | 0.8 |  |
| 2026-10-24 08:14 | 129 | subject arm 5 opus–opus #4 A m5 | claude-opus-5-5 | 4 | 2006 | $0.05502 | 24.4 |  |
| 2026-10-24 08:14 | 130 | check arm 5 opus–opus #4 m5 | claude-haiku-5-5 | 3041 | 68 | $0.00034 | 0.8 |  |
| 2026-10-24 08:14 | 131 | subject arm 3 fable–sonnet #4 B m2 | claude-sonnet-5-5 | 4 | 807 | $0.00947 | 8.9 |  |
| 2026-10-24 08:14 | 132 | check arm 3 fable–sonnet #4 m2 | claude-haiku-5-5 | 1517 | 89 | $0.00020 | 0.7 |  |
| 2026-10-24 08:14 | 133 | subject arm 5 opus–opus #4 B m6 | claude-opus-5-5 | 4 | 2006 | $0.05435 | 25.4 |  |
| 2026-10-24 08:14 | 134 | check arm 5 opus–opus #4 m6 | claude-haiku-5-5 | 2777 | 65 | $0.00031 | 0.7 |  |
| 2026-10-24 08:14 | 135 | subject arm 3 fable–sonnet #4 A m3 | claude-fable-5-1 | 4 | 2232 | $0.12735 | 42.2 |  |
| 2026-10-24 08:14 | 136 | check arm 3 fable–sonnet #4 m3 | claude-haiku-5-5 | 2404 | 84 | $0.00028 | 0.9 |  |
| 2026-10-24 08:14 | 137 | subject arm 5 opus–opus #4 A m7 | claude-opus-5-5 | 4 | 1594 | $0.04508 | 20.8 |  |
| 2026-10-24 08:14 | 138 | check arm 5 opus–opus #4 m7 | claude-haiku-5-5 | 2553 | 72 | $0.00029 | 0.8 |  |
| 2026-10-24 08:14 | 139 | subject arm 5 fable–fable #3 A m9 | claude-fable-5-1 | 4 | 3479 | $0.22745 | 63.7 |  |
| 2026-10-24 08:14 | 140 | check arm 5 fable–fable #3 m9 | claude-haiku-5-5 | 4401 | 77 | $0.00048 | 0.8 |  |
| 2026-10-24 08:14 | 141 | subject arm 3 fable–sonnet #4 B m4 | claude-sonnet-5-5 | 4 | 1314 | $0.01848 | 13.6 |  |
| 2026-10-24 08:14 | 142 | check arm 3 fable–sonnet #4 m4 | claude-haiku-5-5 | 2528 | 93 | $0.00030 | 0.9 |  |
| 2026-10-24 08:14 | 143 | subject arm 5 opus–opus #4 B m8 | claude-opus-5-5 | 4 | 1799 | $0.04831 | 24.2 |  |
| 2026-10-24 08:14 | 144 | check arm 5 opus–opus #4 m8 | claude-haiku-5-5 | 2283 | 73 | $0.00026 | 0.7 |  |
| 2026-10-24 08:14 | 145 | subject arm 5 opus–opus #4 A m9 | claude-opus-5-5 | 4 | 1605 | $0.04332 | 22.2 |  |
| 2026-10-24 08:14 | 146 | check arm 5 opus–opus #4 m9 | claude-haiku-5-5 | 2065 | 71 | $0.00024 | 0.9 |  |
| 2026-10-24 08:14 | 147 | subject arm 5 fable–fable #3 B m10 | claude-fable-5-1 | 4 | 2612 | $0.18440 | 45.9 |  |
| 2026-10-24 08:14 | 148 | subject arm 3 fable–sonnet #4 A m5 | claude-fable-5-1 | 4 | 2118 | $0.13392 | 39.6 |  |
| 2026-10-24 08:14 | 149 | check arm 5 fable–fable #3 m10 | claude-haiku-5-5 | 3665 | 88 | $0.00041 | 0.9 |  |
| 2026-10-24 08:14 | 150 | check arm 3 fable–sonnet #4 m5 | claude-haiku-5-5 | 2247 | 88 | $0.00027 | 1 |  |
| 2026-10-24 08:14 | 151 | subject arm 5 fable–fable #3 A m11 | claude-fable-5-1 | 4 | 335 | $0.06187 | 5.8 |  |
| 2026-10-24 08:14 | 152 | tags 1 arm 5 fable–fable #3 m1–10 | claude-haiku-5-5 | 17101 | 680 | $0.00205 | 2.3 |  |
| 2026-10-24 08:14 | 153 | tags 2 arm 5 fable–fable #3 m1–10 | claude-haiku-5-5 | 17101 | 680 | $0.00205 | 2.4 |  |
| 2026-10-24 08:14 | 154 | subject arm 3 fable–sonnet #4 B m6 | claude-sonnet-5-5 | 4 | 1387 | $0.01924 | 14.9 |  |
| 2026-10-24 08:14 | 155 | check arm 3 fable–sonnet #4 m6 | claude-haiku-5-5 | 2358 | 81 | $0.00028 | 0.7 |  |
| 2026-10-24 08:14 | 156 | subject arm 5 fable–fable #4 A m1 | claude-fable-5-1 | 84 | 518 | $0.02674 | 10.4 |  |
| 2026-10-24 08:14 | 157 | check arm 5 fable–fable #4 m1 | claude-haiku-5-5 | 732 | 65 | $0.00011 | 0.8 |  |
| 2026-10-24 08:14 | 158 | subject arm 5 opus–opus #4 B m10 | claude-opus-5-5 | 4 | 2180 | $0.05394 | 28.1 |  |
| 2026-10-24 08:14 | 159 | check arm 5 opus–opus #4 m10 | claude-haiku-5-5 | 2330 | 83 | $0.00027 | 0.9 |  |
| 2026-10-24 08:14 | 160 | subject arm 5 opus–opus #4 A m11 | claude-opus-5-5 | 4 | 690 | $0.02565 | 9.7 |  |
| 2026-10-24 08:14 | 161 | subject arm 5 fable–fable #4 B m2 | claude-fable-5-1 | 488 | 971 | $0.05343 | 16.8 |  |
| 2026-10-24 08:14 | 162 | check arm 5 opus–opus #4 m11 | claude-haiku-5-5 | 1837 | 81 | $0.00022 | 1 |  |
| 2026-10-24 08:14 | 163 | check arm 5 fable–fable #4 m2 | claude-haiku-5-5 | 1587 | 76 | $0.00020 | 0.8 |  |
| 2026-10-24 08:14 | 164 | subject arm 5 opus–opus #4 B m12 | claude-opus-5-5 | 4 | 213 | $0.01381 | 3.3 |  |
| 2026-10-24 08:14 | 165 | tags 1 arm 5 opus–opus #4 m11–11 | claude-haiku-5-5 | 2433 | 77 | $0.00028 | 1 |  |
| 2026-10-24 08:14 | 166 | tags 2 arm 5 opus–opus #4 m1–10 | claude-haiku-5-5 | 11740 | 680 | $0.00151 | 2.2 |  |
| 2026-10-24 08:14 | 167 | tags 1 arm 5 opus–opus #4 m1–10 | claude-haiku-5-5 | 11740 | 680 | $0.00151 | 2.4 |  |
| 2026-10-24 08:14 | 168 | tags 2 arm 5 opus–opus #4 m11–11 | claude-haiku-5-5 | 2433 | 77 | $0.00028 | 0.8 |  |
| 2026-10-24 08:14 | 169 | subject arm 3 opus–fable #5 A m1 | claude-opus-5-5 | 59 | 301 | $0.00626 | 4.9 |  |
| 2026-10-24 08:14 | 170 | check arm 3 opus–fable #5 m1 | claude-haiku-5-5 | 589 | 66 | $0.00009 | 0.8 |  |
| 2026-10-24 08:14 | 171 | subject arm 3 fable–sonnet #4 A m7 | claude-fable-5-1 | 4 | 2101 | $0.13150 | 40.5 |  |
| 2026-10-24 08:14 | 172 | check arm 3 fable–sonnet #4 m7 | claude-haiku-5-5 | 2526 | 98 | $0.00030 | 1.2 |  |
| 2026-10-24 08:14 | 173 | check referee arm 3 fable–sonnet #4 m7 | claude-opus-5-5 | 2526 | 60 | $0.01130 | 1.4 |  |
| 2026-10-24 08:14 | 174 | subject arm 3 opus–fable #5 B m2 | claude-fable-5-1 | 320 | 720 | $0.03920 | 14.8 |  |
| 2026-10-24 08:14 | 175 | check arm 3 opus–fable #5 m2 | claude-haiku-5-5 | 1244 | 68 | $0.00016 | 0.8 |  |
| 2026-10-24 08:14 | 176 | subject arm 5 fable–fable #4 A m3 | claude-fable-5-1 | 4 | 2356 | $0.13474 | 35.8 |  |
| 2026-10-24 08:14 | 177 | check arm 5 fable–fable #4 m3 | claude-haiku-5-5 | 2135 | 70 | $0.00025 | 0.8 |  |
| 2026-10-24 08:14 | 178 | subject arm 3 fable–sonnet #4 B m8 | claude-sonnet-5-5 | 4 | 1708 | $0.02353 | 17.8 |  |
| 2026-10-24 08:14 | 179 | check arm 3 fable–sonnet #4 m8 | claude-haiku-5-5 | 2565 | 72 | $0.00029 | 0.8 |  |
| 2026-10-24 08:14 | 180 | subject arm 3 opus–fable #5 A m3 | claude-opus-5-5 | 4 | 1169 | $0.02832 | 16.3 |  |
| 2026-10-24 08:14 | 181 | check arm 3 opus–fable #5 m3 | claude-haiku-5-5 | 1728 | 69 | $0.00021 | 0.8 |  |
| 2026-10-24 08:14 | 182 | subject arm 5 fable–fable #4 B m4 | claude-fable-5-1 | 4 | 1871 | $0.12239 | 25.6 |  |
| 2026-10-24 08:14 | 183 | check arm 5 fable–fable #4 m4 | claude-haiku-5-5 | 2217 | 71 | $0.00026 | 0.9 |  |
| 2026-10-24 08:14 | 184 | subject arm 3 opus–fable #5 B m4 | claude-fable-5-1 | 4 | 1663 | $0.10480 | 31 |  |
| 2026-10-24 08:14 | 185 | check arm 3 opus–fable #5 m4 | claude-haiku-5-5 | 1870 | 67 | $0.00022 | 1 |  |
| 2026-10-24 08:14 | 186 | subject arm 3 fable–sonnet #4 A m9 | claude-fable-5-1 | 4 | 2293 | $0.14419 | 41.1 |  |
| 2026-10-24 08:14 | 187 | check arm 3 fable–sonnet #4 m9 | claude-haiku-5-5 | 2751 | 76 | $0.00031 | 0.8 |  |
| 2026-10-24 08:14 | 188 | subject arm 3 fable–sonnet #4 B m10 | claude-sonnet-5-5 | 4 | 552 | $0.01298 | 6.5 |  |
| 2026-10-24 08:14 | 189 | check arm 3 fable–sonnet #4 m10 | claude-haiku-5-5 | 2328 | 75 | $0.00027 | 0.9 |  |
| 2026-10-24 08:14 | 190 | tags 2 arm 3 fable–sonnet #4 m1–10 | claude-haiku-5-5 | 10750 | 680 | $0.00142 | 2.2 |  |
| 2026-10-24 08:14 | 191 | tags 1 arm 3 fable–sonnet #4 m1–10 | claude-haiku-5-5 | 10750 | 680 | $0.00142 | 2.2 |  |
| 2026-10-24 08:14 | 192 | subject arm 5 opus–opus #5 A m1 | claude-opus-5-5 | 84 | 454 | $0.00942 | 5.7 |  |
| 2026-10-24 08:14 | 193 | check arm 5 opus–opus #5 m1 | claude-haiku-5-5 | 718 | 61 | $0.00010 | 0.8 |  |
| 2026-10-24 08:14 | 194 | tags referee arm 3 fable–sonnet #4 m1–10 | claude-opus-5-5 | 10750 | 1118 | $0.06536 | 9.9 |  |
| 2026-10-24 08:14 | 195 | subject arm 5 fable–fable #4 A m5 | claude-fable-5-1 | 4 | 2677 | $0.15800 | 41.6 |  |
| 2026-10-24 08:14 | 196 | subject arm 3 opus–fable #5 A m5 | claude-opus-5-5 | 4 | 1690 | $0.04179 | 24.9 |  |
| 2026-10-24 08:14 | 197 | check arm 5 fable–fable #4 m5 | claude-haiku-5-5 | 2579 | 82 | $0.00030 | 0.9 |  |
| 2026-10-24 08:14 | 198 | check arm 3 opus–fable #5 m5 | claude-haiku-5-5 | 2037 | 69 | $0.00024 | 0.9 |  |
| 2026-10-24 08:14 | 199 | subject arm 5 opus–opus #5 B m2 | claude-opus-5-5 | 474 | 766 | $0.01722 | 9.9 |  |
| 2026-10-24 08:14 | 200 | check arm 5 opus–opus #5 m2 | claude-haiku-5-5 | 1405 | 66 | $0.00017 | 0.8 |  |
| 2026-10-24 08:14 | 201 | subject arm 5 fable–fable #4 B m6 | claude-fable-5-1 | 4 | 1184 | $0.08812 | 18.7 |  |
| 2026-10-24 08:14 | 202 | check arm 5 fable–fable #4 m6 | claude-haiku-5-5 | 2523 | 78 | $0.00029 | 0.9 |  |
| 2026-10-24 08:14 | 203 | subject arm 5 opus–opus #5 A m3 | claude-opus-5-5 | 4 | 1296 | $0.03179 | 16.8 |  |
| 2026-10-24 08:14 | 204 | check arm 5 opus–opus #5 m3 | claude-haiku-5-5 | 1886 | 68 | $0.00022 | 0.9 |  |
| 2026-10-24 08:14 | 205 | subject arm 5 fable–fable #4 A m7 | claude-fable-5-1 | 4 | 587 | $0.05780 | 10.2 |  |
| 2026-10-24 08:14 | 206 | check arm 5 fable–fable #4 m7 | claude-haiku-5-5 | 1439 | 65 | $0.00018 | 0.9 |  |
| 2026-10-24 08:14 | 207 | subject arm 3 opus–fable #5 B m6 | claude-fable-5-1 | 4 | 1757 | $0.10985 | 33.8 |  |
| 2026-10-24 08:14 | 208 | check arm 3 opus–fable #5 m6 | claude-haiku-5-5 | 2263 | 73 | $0.00026 | 0.7 |  |
| 2026-10-24 08:14 | 209 | subject arm 5 fable–fable #4 B m8 | claude-fable-5-1 | 4 | 129 | $0.02168 | 3 |  |
| 2026-10-24 08:14 | 210 | tags 1 arm 5 fable–fable #4 m1–7 | claude-haiku-5-5 | 6595 | 1473 | $0.00140 | 6 |  |
| 2026-10-24 08:14 | 211 | subject arm 3 sonnet–fable #5 A m1 | claude-sonnet-5-5 | 59 | 349 | $0.00361 | 4 |  |
| 2026-10-24 08:14 | 212 | tags 2 arm 5 fable–fable #4 m1–7 | claude-haiku-5-5 | 6595 | 1700 | $0.00151 | 7.1 |  |
| 2026-10-24 08:14 | 213 | check arm 3 sonnet–fable #5 m1 | claude-haiku-5-5 | 675 | 65 | $0.00010 | 0.9 |  |
| 2026-10-24 08:14 | 214 | subject arm 5 opus–opus #5 B m4 | claude-opus-5-5 | 4 | 1891 | $0.04804 | 23.4 |  |
| 2026-10-24 08:14 | 215 | tags referee arm 5 fable–fable #4 m1–7 | claude-opus-5-5 | 6595 | 479 | $0.03596 | 4.2 |  |
| 2026-10-24 08:14 | 216 | check arm 5 opus–opus #5 m4 | claude-haiku-5-5 | 2412 | 70 | $0.00028 | 1.3 |  |
| 2026-10-24 08:14 | 217 | subject arm 3 opus–fable #5 A m7 | claude-opus-5-5 | 4 | 1378 | $0.03782 | 18.4 |  |
| 2026-10-24 08:14 | 218 | check arm 3 opus–fable #5 m7 | claude-haiku-5-5 | 2344 | 76 | $0.00027 | 0.8 |  |
| 2026-10-24 08:14 | 219 | subject arm 3 sonnet–fable #5 B m2 | claude-fable-5-1 | 406 | 1620 | $0.08506 | 32.7 |  |
| 2026-10-24 08:14 | 220 | check arm 3 sonnet–fable #5 m2 | claude-haiku-5-5 | 1582 | 85 | $0.00020 | 0.7 |  |
| 2026-10-24 08:14 | 221 | subject arm 5 opus–opus #5 A m5 | claude-opus-5-5 | 4 | 2526 | $0.06125 | 31.8 |  |
| 2026-10-24 08:14 | 222 | check arm 5 opus–opus #5 m5 | claude-haiku-5-5 | 3057 | 68 | $0.00034 | 0.7 |  |
| 2026-10-24 08:14 | 223 | subject arm 3 sonnet–fable #5 A m3 | claude-sonnet-5-5 | 4 | 1246 | $0.01577 | 12.1 |  |
| 2026-10-24 08:14 | 224 | check arm 3 sonnet–fable #5 m3 | claude-haiku-5-5 | 1849 | 67 | $0.00022 | 1 |  |
| 2026-10-24 08:14 | 225 | subject arm 3 opus–fable #5 B m8 | claude-fable-5-1 | 4 | 2183 | $0.13542 | 38.5 |  |
| 2026-10-24 08:14 | 226 | check arm 3 opus–fable #5 m8 | claude-haiku-5-5 | 2486 | 79 | $0.00029 | 0.7 |  |
| 2026-10-24 08:14 | 227 | subject arm 3 opus–fable #5 A m9 | claude-opus-5-5 | 4 | 1009 | $0.03195 | 14.2 |  |
| 2026-10-24 08:14 | 228 | check arm 3 opus–fable #5 m9 | claude-haiku-5-5 | 2063 | 81 | $0.00025 | 0.9 |  |
| 2026-10-24 08:14 | 229 | subject arm 5 opus–opus #5 B m6 | claude-opus-5-5 | 4 | 2990 | $0.07393 | 36.4 |  |
| 2026-10-24 08:14 | 230 | check arm 5 opus–opus #5 m6 | claude-haiku-5-5 | 3687 | 82 | $0.00041 | 0.9 |  |
| 2026-10-24 08:14 | 231 | subject arm 3 opus–fable #5 B m10 | claude-fable-5-1 | 4 | 610 | $0.05376 | 11.6 |  |
| 2026-10-24 08:14 | 232 | check arm 3 opus–fable #5 m10 | claude-haiku-5-5 | 1291 | 72 | $0.00017 | 0.7 |  |
| 2026-10-24 08:14 | 233 | tags 2 arm 3 opus–fable #5 m1–10 | claude-haiku-5-5 | 8608 | 680 | $0.00120 | 2.7 |  |
| 2026-10-24 08:14 | 234 | tags 1 arm 3 opus–fable #5 m1–10 | claude-haiku-5-5 | 8608 | 680 | $0.00120 | 3.3 |  |
| 2026-10-24 08:14 | 235 | tags referee arm 3 opus–fable #5 m1–10 | claude-opus-5-5 | 8608 | 680 | $0.04803 | 4.8 |  |
| 2026-10-24 08:14 | 236 | subject arm 5 fable–fable #5 A m1 | claude-fable-5-1 | 84 | 410 | $0.02134 | 7.3 |  |
| 2026-10-24 08:14 | 237 | check arm 5 fable–fable #5 m1 | claude-haiku-5-5 | 673 | 71 | $0.00010 | 0.8 |  |
| 2026-10-24 08:14 | 238 | subject arm 3 sonnet–fable #5 B m4 | claude-fable-5-1 | 4 | 2429 | $0.14569 | 45.3 |  |
| 2026-10-24 08:14 | 239 | check arm 3 sonnet–fable #5 m4 | claude-haiku-5-5 | 2002 | 68 | $0.00023 | 0.9 |  |
| 2026-10-24 08:14 | 240 | subject arm 5 opus–opus #5 A m7 | claude-opus-5-5 | 4 | 1649 | $0.05051 | 22.6 |  |
| 2026-10-24 08:14 | 241 | check arm 5 opus–opus #5 m7 | claude-haiku-5-5 | 3292 | 82 | $0.00037 | 1 |  |
| 2026-10-24 08:14 | 242 | subject arm 5 fable–fable #5 B m2 | claude-fable-5-1 | 429 | 1145 | $0.06154 | 21 |  |
| 2026-10-24 08:14 | 243 | subject arm 3 sonnet–fable #5 A m5 | claude-sonnet-5-5 | 4 | 1598 | $0.02047 | 16.1 |  |
| 2026-10-24 08:14 | 244 | check arm 3 sonnet–fable #5 m5 | claude-haiku-5-5 | 2156 | 71 | $0.00025 | 0.8 |  |
| 2026-10-24 08:14 | 245 | check arm 5 fable–fable #5 m2 | claude-haiku-5-5 | 1689 | 80 | $0.00021 | 1.1 |  |
| 2026-10-24 08:14 | 246 | subject arm 5 opus–opus #5 B m8 | claude-opus-5-5 | 4 | 2011 | $0.05608 | 27.1 |  |
| 2026-10-24 08:14 | 247 | check arm 5 opus–opus #5 m8 | claude-haiku-5-5 | 2901 | 93 | $0.00034 | 0.9 |  |
| 2026-10-24 08:14 | 248 | subject arm 3 sonnet–fable #5 B m6 | claude-fable-5-1 | 4 | 1626 | $0.10484 | 32.9 |  |
| 2026-10-24 08:14 | 249 | check arm 3 sonnet–fable #5 m6 | claude-haiku-5-5 | 2075 | 67 | $0.00024 | 0.8 |  |
| 2026-10-24 08:14 | 250 | subject arm 5 fable–fable #5 A m3 | claude-fable-5-1 | 4 | 2537 | $0.14506 | 43.8 |  |
| 2026-10-24 08:14 | 251 | subject arm 5 opus–opus #5 A m9 | claude-opus-5-5 | 4 | 2162 | $0.05751 | 28.4 |  |
| 2026-10-24 08:14 | 252 | check arm 5 fable–fable #5 m3 | claude-haiku-5-5 | 2920 | 74 | $0.00033 | 0.9 |  |
| 2026-10-24 08:14 | 253 | check arm 5 opus–opus #5 m9 | claude-haiku-5-5 | 3165 | 78 | $0.00036 | 2.6 |  |
| 2026-10-24 08:14 | 254 | subject arm 3 sonnet–fable #5 A m7 | claude-sonnet-5-5 | 4 | 1351 | $0.01852 | 14 |  |
| 2026-10-24 08:14 | 255 | check arm 3 sonnet–fable #5 m7 | claude-haiku-5-5 | 1858 | 67 | $0.00022 | 0.9 |  |
| 2026-10-24 08:14 | 256 | subject arm 5 opus–opus #5 B m10 | claude-opus-5-5 | 4 | 1044 | $0.03670 | 14 |  |
| 2026-10-24 08:14 | 257 | check arm 5 opus–opus #5 m10 | claude-haiku-5-5 | 2236 | 75 | $0.00026 | 0.8 |  |
| 2026-10-24 08:14 | 258 | subject arm 5 opus–opus #5 A m11 | claude-opus-5-5 | 4 | 158 | $0.01463 | 3.5 |  |
| 2026-10-24 08:14 | 259 | subject arm 3 sonnet–fable #5 B m8 | claude-fable-5-1 | 4 | 1025 | $0.07152 | 17 |  |
| 2026-10-24 08:14 | 260 | tags 1 arm 5 opus–opus #5 m1–10 | claude-haiku-5-5 | 12095 | 680 | $0.00155 | 2.3 |  |
| 2026-10-24 08:14 | 261 | tags 2 arm 5 opus–opus #5 m1–10 | claude-haiku-5-5 | 12095 | 680 | $0.00155 | 2.4 |  |
| 2026-10-24 08:14 | 262 | check arm 3 sonnet–fable #5 m8 | claude-haiku-5-5 | 1741 | 84 | $0.00022 | 0.9 |  |
| 2026-10-24 08:14 | 263 | tags referee arm 5 opus–opus #5 m1–10 | claude-opus-5-5 | 12095 | 680 | $0.06198 | 5.9 |  |
| 2026-10-24 08:14 | 264 | subject arm 5 fable–fable #5 B m4 | claude-fable-5-1 | 4 | 2347 | $0.15526 | 40.3 |  |
| 2026-10-24 08:14 | 265 | check arm 5 fable–fable #5 m4 | claude-haiku-5-5 | 3536 | 81 | $0.00039 | 0.8 |  |
| 2026-10-24 08:14 | 266 | subject arm 3 sonnet–fable #5 A m9 | claude-sonnet-5-5 | 4 | 1815 | $0.02268 | 17.2 |  |
| 2026-10-24 08:14 | 267 | check arm 3 sonnet–fable #5 m9 | claude-haiku-5-5 | 1990 | 67 | $0.00023 | 0.7 |  |
| 2026-10-24 08:14 | 268 | subject arm 3 sonnet–fable #5 B m10 | claude-fable-5-1 | 4 | 1659 | $0.10526 | 29.2 |  |
| 2026-10-24 08:14 | 269 | check arm 3 sonnet–fable #5 m10 | claude-haiku-5-5 | 1764 | 68 | $0.00021 | 1.4 |  |
| 2026-10-24 08:14 | 270 | subject arm 5 fable–fable #5 A m5 | claude-fable-5-1 | 4 | 2122 | $0.14677 | 38.3 |  |
| 2026-10-24 08:14 | 271 | check arm 5 fable–fable #5 m5 | claude-haiku-5-5 | 3373 | 83 | $0.00038 | 0.8 |  |
| 2026-10-24 08:14 | 272 | subject arm 3 sonnet–fable #5 A m11 | claude-sonnet-5-5 | 4 | 1343 | $0.01830 | 14.2 |  |
| 2026-10-24 08:14 | 273 | check arm 3 sonnet–fable #5 m11 | claude-haiku-5-5 | 1633 | 68 | $0.00020 | 0.9 |  |
| 2026-10-24 08:14 | 274 | subject arm 3 sonnet–fable #5 B m12 | claude-fable-5-1 | 4 | 1774 | $0.10696 | 30.8 |  |
| 2026-10-24 08:14 | 275 | check arm 3 sonnet–fable #5 m12 | claude-haiku-5-5 | 2038 | 81 | $0.00024 | 0.9 |  |
| 2026-10-24 08:14 | 276 | subject arm 5 fable–fable #5 B m6 | claude-fable-5-1 | 4 | 2558 | $0.16692 | 43.2 |  |
| 2026-10-24 08:14 | 277 | check arm 5 fable–fable #5 m6 | claude-haiku-5-5 | 3267 | 73 | $0.00036 | 0.8 |  |
| 2026-10-24 08:14 | 278 | subject arm 3 sonnet–fable #5 A m13 | claude-sonnet-5-5 | 4 | 1321 | $0.01905 | 13.1 |  |
| 2026-10-24 08:14 | 279 | check arm 3 sonnet–fable #5 m13 | claude-haiku-5-5 | 1901 | 84 | $0.00023 | 0.8 |  |
| 2026-10-24 08:14 | 280 | subject arm 3 sonnet–fable #5 B m14 | claude-fable-5-1 | 4 | 1034 | $0.07364 | 22 |  |
| 2026-10-24 08:14 | 281 | check arm 3 sonnet–fable #5 m14 | claude-haiku-5-5 | 1614 | 73 | $0.00020 | 1.7 |  |
| 2026-10-24 08:14 | 282 | subject arm 3 sonnet–fable #5 A m15 | claude-sonnet-5-5 | 4 | 948 | $0.01461 | 9.7 |  |
| 2026-10-24 08:14 | 283 | check arm 3 sonnet–fable #5 m15 | claude-haiku-5-5 | 1577 | 69 | $0.00019 | 0.8 |  |
| 2026-10-24 08:14 | 284 | subject arm 5 fable–fable #5 A m7 | claude-fable-5-1 | 4 | 2885 | $0.18236 | 51.3 |  |
| 2026-10-24 08:14 | 285 | check arm 5 fable–fable #5 m7 | claude-haiku-5-5 | 3385 | 85 | $0.00038 | 1 |  |
| 2026-10-24 08:14 | 286 | check referee arm 5 fable–fable #5 m7 | claude-opus-5-5 | 3385 | 56 | $0.01466 | 1.7 |  |
| 2026-10-24 08:14 | 287 | subject arm 3 sonnet–fable #5 B m16 | claude-fable-5-1 | 4 | 1101 | $0.07334 | 20.2 |  |
| 2026-10-24 08:14 | 288 | check arm 3 sonnet–fable #5 m16 | claude-haiku-5-5 | 1443 | 77 | $0.00018 | 0.9 |  |
| 2026-10-24 08:14 | 289 | subject arm 5 fable–fable #5 B m8 | claude-fable-5-1 | 4 | 1335 | $0.10669 | 25.4 |  |
| 2026-10-24 08:14 | 290 | check arm 5 fable–fable #5 m8 | claude-haiku-5-5 | 2627 | 87 | $0.00031 | 1.5 |  |
| 2026-10-24 08:14 | 291 | subject arm 3 sonnet–fable #5 A m17 | claude-sonnet-5-5 | 4 | 1231 | $0.01727 | 13.5 |  |
| 2026-10-24 08:14 | 292 | check arm 3 sonnet–fable #5 m17 | claude-haiku-5-5 | 1562 | 79 | $0.00020 | 0.8 |  |
| 2026-10-24 08:14 | 293 | check referee arm 3 sonnet–fable #5 m17 | claude-opus-5-5 | 1562 | 76 | $0.00777 | 1.7 |  |
| 2026-10-24 08:14 | 294 | subject arm 5 fable–fable #5 A m9 | claude-fable-5-1 | 4 | 893 | $0.07550 | 16.1 |  |
| 2026-10-24 08:14 | 295 | check arm 5 fable–fable #5 m9 | claude-haiku-5-5 | 1309 | 58 | $0.00016 | 0.8 |  |
| 2026-10-24 08:14 | 296 | subject arm 5 fable–fable #5 B m10 | claude-fable-5-1 | 4 | 477 | $0.03860 | 11.4 |  |
| 2026-10-24 08:14 | 297 | check arm 5 fable–fable #5 m10 | claude-haiku-5-5 | 765 | 75 | $0.00011 | 1.9 |  |
| 2026-10-24 08:14 | 298 | subject arm 3 sonnet–fable #5 B m18 | claude-fable-5-1 | 4 | 1718 | $0.10432 | 33.7 |  |
| 2026-10-24 08:14 | 299 | subject arm 5 fable–fable #5 A m11 | claude-fable-5-1 | 4 | 481 | $0.03220 | 9.6 |  |
| 2026-10-24 08:14 | 300 | check arm 3 sonnet–fable #5 m18 | claude-haiku-5-5 | 1836 | 68 | $0.00022 | 0.9 |  |
| 2026-10-24 08:14 | 301 | check arm 5 fable–fable #5 m11 | claude-haiku-5-5 | 614 | 90 | $0.00011 | 0.9 |  |
| 2026-10-24 08:14 | 302 | subject arm 3 sonnet–fable #5 A m19 | claude-sonnet-5-5 | 4 | 5 | $0.00622 | 1.7 |  |
| 2026-10-24 08:14 | 303 | subject arm 5 fable–fable #5 B m12 | claude-fable-5-1 | 4 | 150 | $0.01382 | 3.6 |  |
| 2026-10-24 08:14 | 304 | tags 1 arm 3 sonnet–fable #5 m11–18 | claude-haiku-5-5 | 7341 | 546 | $0.00101 | 2.4 |  |
| 2026-10-24 08:14 | 305 | tags 2 arm 3 sonnet–fable #5 m1–10 | claude-haiku-5-5 | 8618 | 680 | $0.00120 | 2.9 |  |
| 2026-10-24 08:14 | 306 | tags 1 arm 3 sonnet–fable #5 m1–10 | claude-haiku-5-5 | 8618 | 680 | $0.00120 | 3.3 |  |
| 2026-10-24 08:14 | 307 | tags 2 arm 3 sonnet–fable #5 m11–18 | claude-haiku-5-5 | 7341 | 546 | $0.00101 | 2 |  |
| 2026-10-24 08:14 | 308 | tags 1 arm 5 fable–fable #5 m1–10 | claude-haiku-5-5 | 11338 | 680 | $0.00147 | 2.2 |  |
| 2026-10-24 08:14 | 309 | tags 2 arm 5 fable–fable #5 m1–10 | claude-haiku-5-5 | 11338 | 680 | $0.00147 | 2.2 |  |
| 2026-10-24 08:14 | 310 | tags 1 arm 5 fable–fable #5 m11–11 | claude-haiku-5-5 | 1210 | 391 | $0.00032 | 2 |  |
| 2026-10-24 08:14 | 311 | tags 2 arm 5 fable–fable #5 m11–11 | claude-haiku-5-5 | 1210 | 364 | $0.00030 | 1.8 |  |
| 2026-10-24 08:14 | 312 | tags referee arm 3 sonnet–fable #5 m11–18 | claude-opus-5-5 | 7341 | 546 | $0.04028 | 3.9 |  |
| 2026-10-24 08:14 | 313 | tags referee arm 5 fable–fable #5 m11–11 | claude-opus-5-5 | 1210 | 77 | $0.00638 | 1.1 |  |
| 2026-10-24 08:14 | 314 | tags referee arm 5 fable–fable #5 m1–10 | claude-opus-5-5 | 11338 | 685 | $0.05905 | 6.7 |  |
| 2026-10-24 08:34 | 1 | subject arm 6 opus–opus #1 A m1 | claude-opus-5-5 | 59 | 385 | $0.00794 | 5.7 |  |
| 2026-10-24 08:34 | 2 | check arm 6 opus–opus #1 m1 | claude-haiku-5-5 | 683 | 59 | $0.00010 | 0.7 |  |
| 2026-10-24 08:34 | 3 | subject arm 6 fable–fable #2 A m1 | claude-fable-5-1 | 59 | 460 | $0.02359 | 9.1 |  |
| 2026-10-24 08:34 | 4 | check arm 6 fable–fable #2 m1 | claude-haiku-5-5 | 706 | 63 | $0.00010 | 0.7 |  |
| 2026-10-24 08:34 | 5 | subject arm 6 fable–fable #1 A m1 | claude-fable-5-1 | 59 | 566 | $0.02889 | 11.6 |  |
| 2026-10-24 08:34 | 6 | check arm 6 fable–fable #1 m1 | claude-haiku-5-5 | 814 | 67 | $0.00011 | 0.6 |  |
| 2026-10-24 08:34 | 7 | subject arm 6 opus–opus #1 B m2 | claude-opus-5-5 | 414 | 815 | $0.01796 | 11.7 |  |
| 2026-10-24 08:34 | 8 | check arm 6 opus–opus #1 m2 | claude-haiku-5-5 | 1432 | 64 | $0.00018 | 0.8 |  |
| 2026-10-24 08:34 | 9 | subject arm 6 fable–fable #2 B m2 | claude-fable-5-1 | 437 | 968 | $0.05277 | 19.1 |  |
| 2026-10-24 08:34 | 10 | check arm 6 fable–fable #2 m2 | claude-haiku-5-5 | 1572 | 67 | $0.00019 | 0.7 |  |
| 2026-10-24 08:34 | 11 | subject arm 6 opus–opus #1 A m3 | claude-opus-5-5 | 4 | 1162 | $0.02912 | 15.4 |  |
| 2026-10-24 08:34 | 12 | check arm 6 opus–opus #1 m3 | claude-haiku-5-5 | 1726 | 70 | $0.00021 | 0.6 |  |
| 2026-10-24 08:34 | 13 | subject arm 6 fable–fable #1 B m2 | claude-fable-5-1 | 4 | 1602 | $0.08690 | 30.2 |  |
| 2026-10-24 08:34 | 14 | check arm 6 fable–fable #1 m2 | claude-haiku-5-5 | 1751 | 80 | $0.00022 | 1 |  |
| 2026-10-24 08:34 | 15 | subject arm 6 opus–opus #1 B m4 | claude-opus-5-5 | 4 | 1579 | $0.04070 | 19.2 |  |
| 2026-10-24 08:34 | 16 | check arm 6 opus–opus #1 m4 | claude-haiku-5-5 | 1704 | 65 | $0.00020 | 0.6 |  |
| 2026-10-24 08:34 | 17 | subject arm 6 fable–fable #2 A m3 | claude-fable-5-1 | 4 | 1684 | $0.10064 | 34 |  |
| 2026-10-24 08:34 | 18 | check arm 6 fable–fable #2 m3 | claude-haiku-5-5 | 2242 | 73 | $0.00026 | 0.7 |  |
| 2026-10-24 08:34 | 19 | subject arm 6 fable–fable #1 A m3 | claude-fable-5-1 | 4 | 1904 | $0.11388 | 35.2 |  |
| 2026-10-24 08:34 | 20 | subject arm 6 opus–opus #1 A m5 | claude-opus-5-5 | 4 | 1556 | $0.03832 | 19.1 |  |
| 2026-10-24 08:34 | 21 | check arm 6 fable–fable #1 m3 | claude-haiku-5-5 | 2444 | 65 | $0.00028 | 0.8 |  |
| 2026-10-24 08:34 | 22 | check arm 6 opus–opus #1 m5 | claude-haiku-5-5 | 2089 | 73 | $0.00025 | 0.7 |  |
| 2026-10-24 08:34 | 23 | subject arm 6 opus–opus #1 B m6 | claude-opus-5-5 | 4 | 1199 | $0.03323 | 15.6 |  |
| 2026-10-24 08:34 | 24 | check arm 6 opus–opus #1 m6 | claude-haiku-5-5 | 2103 | 84 | $0.00025 | 0.9 |  |
| 2026-10-24 08:34 | 25 | subject arm 6 fable–fable #2 B m4 | claude-fable-5-1 | 4 | 2263 | $0.14269 | 41.5 |  |
| 2026-10-24 08:34 | 26 | check arm 6 fable–fable #2 m4 | claude-haiku-5-5 | 2550 | 66 | $0.00029 | 0.7 |  |
| 2026-10-24 08:34 | 27 | subject arm 6 opus–opus #1 A m7 | claude-opus-5-5 | 4 | 1402 | $0.03751 | 18.3 |  |
| 2026-10-24 08:34 | 28 | check arm 6 opus–opus #1 m7 | claude-haiku-5-5 | 1659 | 80 | $0.00021 | 0.7 |  |
| 2026-10-24 08:34 | 29 | subject arm 6 opus–opus #1 B m8 | claude-opus-5-5 | 4 | 933 | $0.02611 | 12.5 |  |
| 2026-10-24 08:34 | 30 | check arm 6 opus–opus #1 m8 | claude-haiku-5-5 | 1371 | 90 | $0.00018 | 0.9 |  |
| 2026-10-24 08:34 | 31 | subject arm 6 fable–fable #2 A m5 | claude-fable-5-1 | 4 | 1745 | $0.11556 | 30.8 |  |
| 2026-10-24 08:34 | 32 | check arm 6 fable–fable #2 m5 | claude-haiku-5-5 | 2453 | 76 | $0.00028 | 0.8 |  |
| 2026-10-24 08:34 | 33 | subject arm 6 fable–fable #1 B m4 | claude-fable-5-1 | 4 | 3604 | $0.20699 | 63.4 |  |
| 2026-10-24 08:34 | 34 | check arm 6 fable–fable #1 m4 | claude-haiku-5-5 | 3156 | 69 | $0.00035 | 1.2 |  |
| 2026-10-24 08:34 | 35 | check referee arm 6 fable–fable #2 m5 | claude-opus-5-5 | 2453 | 54 | $0.01089 | 1.6 |  |
| 2026-10-24 08:34 | 36 | subject arm 6 opus–opus #1 A m9 | claude-opus-5-5 | 4 | 814 | $0.02245 | 12 |  |
| 2026-10-24 08:34 | 37 | check arm 6 opus–opus #1 m9 | claude-haiku-5-5 | 1212 | 69 | $0.00016 | 0.8 |  |
| 2026-10-24 08:34 | 38 | subject arm 6 opus–opus #1 B m10 | claude-opus-5-5 | 4 | 996 | $0.02541 | 14.4 |  |
| 2026-10-24 08:34 | 39 | check arm 6 opus–opus #1 m10 | claude-haiku-5-5 | 1148 | 80 | $0.00015 | 0.9 |  |
| 2026-10-24 08:34 | 40 | subject arm 6 fable–fable #1 A m5 | claude-fable-5-1 | 4 | 1671 | $0.11948 | 32.3 |  |
| 2026-10-24 08:34 | 41 | check arm 6 fable–fable #1 m5 | claude-haiku-5-5 | 3177 | 76 | $0.00036 | 0.8 |  |
| 2026-10-24 08:34 | 42 | subject arm 6 fable–fable #2 B m6 | claude-fable-5-1 | 4 | 1804 | $0.11756 | 34.5 |  |
| 2026-10-24 08:34 | 43 | check arm 6 fable–fable #2 m6 | claude-haiku-5-5 | 2302 | 76 | $0.00027 | 0.8 |  |
| 2026-10-24 08:34 | 44 | check referee arm 6 fable–fable #2 m6 | claude-opus-5-5 | 2302 | 76 | $0.01073 | 1.7 |  |
| 2026-10-24 08:34 | 45 | subject arm 6 opus–opus #1 A m11 | claude-opus-5-5 | 4 | 1390 | $0.03306 | 19.6 |  |
| 2026-10-24 08:34 | 46 | check arm 6 opus–opus #1 m11 | claude-haiku-5-5 | 1263 | 77 | $0.00016 | 0.9 |  |
| 2026-10-24 08:34 | 47 | subject arm 6 fable–fable #2 A m7 | claude-fable-5-1 | 4 | 755 | $0.06351 | 14.1 |  |
| 2026-10-24 08:34 | 48 | check arm 6 fable–fable #2 m7 | claude-haiku-5-5 | 1769 | 89 | $0.00022 | 0.9 |  |
| 2026-10-24 08:34 | 49 | subject arm 6 fable–fable #2 B m8 | claude-fable-5-1 | 4 | 387 | $0.03869 | 8.3 |  |
| 2026-10-24 08:34 | 50 | subject arm 6 opus–opus #1 B m12 | claude-opus-5-5 | 4 | 1641 | $0.03874 | 21.3 |  |
| 2026-10-24 08:34 | 51 | check arm 6 fable–fable #2 m8 | claude-haiku-5-5 | 888 | 67 | $0.00012 | 0.9 |  |
| 2026-10-24 08:34 | 52 | check arm 6 opus–opus #1 m12 | claude-haiku-5-5 | 1517 | 78 | $0.00019 | 1.4 |  |
| 2026-10-24 08:34 | 53 | subject arm 6 opus–opus #1 A m13 | claude-opus-5-5 | 4 | 735 | $0.02197 | 10.1 |  |
| 2026-10-24 08:34 | 54 | check arm 6 opus–opus #1 m13 | claude-haiku-5-5 | 1429 | 77 | $0.00018 | 0.8 |  |
| 2026-10-24 08:34 | 55 | ask-after arm 6 fable–fable #2 A | claude-fable-5-1 | 4 | 664 | $0.04242 | 14.1 |  |
| 2026-10-24 08:34 | 56 | check answer arm 6 fable–fable #2 A | claude-haiku-5-5 | 854 | 67 | $0.00012 | 0.7 |  |
| 2026-10-24 08:34 | 57 | subject arm 6 opus–opus #1 B m14 | claude-opus-5-5 | 4 | 166 | $0.01026 | 2.9 |  |
| 2026-10-24 08:34 | 58 | subject arm 6 fable–fable #1 B m6 | claude-fable-5-1 | 4 | 3145 | $0.19373 | 57.8 |  |
| 2026-10-24 08:34 | 59 | check arm 6 fable–fable #1 m6 | claude-haiku-5-5 | 3056 | 86 | $0.00035 | 1 |  |
| 2026-10-24 08:34 | 60 | ask-after arm 6 opus–opus #1 A | claude-opus-5-5 | 4 | 637 | $0.01680 | 8.9 |  |
| 2026-10-24 08:34 | 61 | ask-after arm 6 fable–fable #2 B | claude-fable-5-1 | 4 | 603 | $0.03425 | 11.4 |  |
| 2026-10-24 08:34 | 62 | check answer arm 6 opus–opus #1 A | claude-haiku-5-5 | 756 | 65 | $0.00011 | 0.8 |  |
| 2026-10-24 08:34 | 63 | check answer arm 6 fable–fable #2 B | claude-haiku-5-5 | 891 | 63 | $0.00012 | 0.8 |  |
| 2026-10-24 08:34 | 64 | tags 2 arm 6 fable–fable #2 m1–8 | claude-haiku-5-5 | 7049 | 546 | $0.00098 | 1.9 |  |
| 2026-10-24 08:34 | 65 | tags 1 arm 6 fable–fable #2 m1–8 | claude-haiku-5-5 | 7049 | 546 | $0.00098 | 2 |  |
| 2026-10-24 08:34 | 66 | tags referee arm 6 fable–fable #2 m1–8 | claude-opus-5-5 | 7049 | 546 | $0.03912 | 4.3 |  |
| 2026-10-24 08:34 | 67 | ask-tags 1 answer arm 6 fable–fable #2 A | claude-haiku-5-5 | 1109 | 41 | $0.00013 | 0.6 |  |
| 2026-10-24 08:34 | 68 | ask-tags 2 answer arm 6 fable–fable #2 A | claude-haiku-5-5 | 1109 | 41 | $0.00013 | 0.7 |  |
| 2026-10-24 08:34 | 69 | subject arm 6 opus–opus #2 A m1 | claude-opus-5-5 | 59 | 489 | $0.01002 | 6.5 |  |
| 2026-10-24 08:34 | 70 | check arm 6 opus–opus #2 m1 | claude-haiku-5-5 | 762 | 70 | $0.00011 | 0.8 |  |
| 2026-10-24 08:34 | 71 | ask-after arm 6 opus–opus #1 B | claude-opus-5-5 | 4 | 738 | $0.01663 | 9.5 |  |
| 2026-10-24 08:34 | 72 | ask-tags 1 answer arm 6 fable–fable #2 B | claude-haiku-5-5 | 1146 | 488 | $0.00036 | 2.7 |  |
| 2026-10-24 08:34 | 73 | check answer arm 6 opus–opus #1 B | claude-haiku-5-5 | 855 | 64 | $0.00012 | 0.7 |  |
| 2026-10-24 08:34 | 74 | ask-tags 2 answer arm 6 fable–fable #2 B | claude-haiku-5-5 | 1146 | 428 | $0.00033 | 2.8 |  |
| 2026-10-24 08:34 | 75 | tags 1 arm 6 opus–opus #1 m1–10 | claude-haiku-5-5 | 7212 | 680 | $0.00106 | 3.4 |  |
| 2026-10-24 08:34 | 76 | tags 1 arm 6 opus–opus #1 m11–13 | claude-haiku-5-5 | 3005 | 211 | $0.00041 | 1.1 |  |
| 2026-10-24 08:34 | 77 | tags 2 arm 6 opus–opus #1 m1–10 | claude-haiku-5-5 | 7212 | 680 | $0.00106 | 2.6 |  |
| 2026-10-24 08:34 | 78 | tags 2 arm 6 opus–opus #1 m11–13 | claude-haiku-5-5 | 3005 | 211 | $0.00041 | 1.4 |  |
| 2026-10-24 08:34 | 79 | subject arm 6 opus–opus #3 A m1 | claude-opus-5-5 | 59 | 470 | $0.00964 | 6.7 |  |
| 2026-10-24 08:34 | 80 | check arm 6 opus–opus #3 m1 | claude-haiku-5-5 | 756 | 75 | $0.00011 | 0.8 |  |
| 2026-10-24 08:34 | 81 | ask-tags 1 answer arm 6 opus–opus #1 A | claude-haiku-5-5 | 1011 | 511 | $0.00036 | 3 |  |
| 2026-10-24 08:34 | 82 | ask-tags 2 answer arm 6 opus–opus #1 A | claude-haiku-5-5 | 1011 | 462 | $0.00033 | 2.8 |  |
| 2026-10-24 08:34 | 83 | ask-tags 1 answer arm 6 opus–opus #1 B | claude-haiku-5-5 | 1110 | 41 | $0.00013 | 0.9 |  |
| 2026-10-24 08:34 | 84 | subject arm 6 opus–opus #2 B m2 | claude-opus-5-5 | 493 | 1056 | $0.02309 | 14 |  |
| 2026-10-24 08:34 | 85 | ask-tags 2 answer arm 6 opus–opus #1 B | claude-haiku-5-5 | 1110 | 41 | $0.00013 | 0.6 |  |
| 2026-10-24 08:34 | 86 | check arm 6 opus–opus #2 m2 | claude-haiku-5-5 | 1507 | 72 | $0.00019 | 1.4 |  |
| 2026-10-24 08:34 | 87 | subject arm 6 opus–opus #3 B m2 | claude-opus-5-5 | 487 | 930 | $0.02055 | 12.6 |  |
| 2026-10-24 08:34 | 88 | check arm 6 opus–opus #3 m2 | claude-haiku-5-5 | 1544 | 66 | $0.00019 | 0.9 |  |
| 2026-10-24 08:34 | 89 | subject arm 6 opus–opus #2 A m3 | claude-opus-5-5 | 4 | 2333 | $0.05291 | 28.3 |  |
| 2026-10-24 08:34 | 90 | check arm 6 opus–opus #2 m3 | claude-haiku-5-5 | 2199 | 67 | $0.00025 | 0.6 |  |
| 2026-10-24 08:34 | 91 | subject arm 6 fable–fable #1 A m7 | claude-fable-5-1 | 4 | 3348 | $0.20279 | 63.5 |  |
| 2026-10-24 08:34 | 92 | check arm 6 fable–fable #1 m7 | claude-haiku-5-5 | 3435 | 75 | $0.00038 | 0.8 |  |
| 2026-10-24 08:34 | 93 | subject arm 6 opus–opus #3 A m3 | claude-opus-5-5 | 4 | 2692 | $0.06028 | 32.6 |  |
| 2026-10-24 08:34 | 94 | check arm 6 opus–opus #3 m3 | claude-haiku-5-5 | 2874 | 98 | $0.00034 | 0.9 |  |
| 2026-10-24 08:34 | 95 | subject arm 6 opus–opus #2 B m4 | claude-opus-5-5 | 4 | 1756 | $0.04700 | 22.8 |  |
| 2026-10-24 08:34 | 96 | check arm 6 opus–opus #2 m4 | claude-haiku-5-5 | 2452 | 84 | $0.00029 | 1.7 |  |
| 2026-10-24 08:34 | 97 | subject arm 6 fable–fable #1 B m8 | claude-fable-5-1 | 4 | 2174 | $0.14912 | 42.7 |  |
| 2026-10-24 08:34 | 98 | subject arm 6 opus–opus #2 A m5 | claude-opus-5-5 | 4 | 1842 | $0.04779 | 22.9 |  |
| 2026-10-24 08:34 | 99 | check arm 6 fable–fable #1 m8 | claude-haiku-5-5 | 3037 | 81 | $0.00034 | 1.3 |  |
| 2026-10-24 08:34 | 100 | check arm 6 opus–opus #2 m5 | claude-haiku-5-5 | 2193 | 66 | $0.00025 | 0.7 |  |
| 2026-10-24 08:34 | 101 | subject arm 6 opus–opus #3 B m4 | claude-opus-5-5 | 4 | 3048 | $0.07619 | 36.9 |  |
| 2026-10-24 08:34 | 102 | check arm 6 opus–opus #3 m4 | claude-haiku-5-5 | 3748 | 64 | $0.00041 | 0.8 |  |
| 2026-10-24 08:34 | 103 | subject arm 6 fable–fable #1 A m9 | claude-fable-5-1 | 4 | 1193 | $0.09548 | 25.1 |  |
| 2026-10-24 08:34 | 104 | check arm 6 fable–fable #1 m9 | claude-haiku-5-5 | 2068 | 61 | $0.00024 | 1.3 |  |
| 2026-10-24 08:34 | 105 | subject arm 6 opus–opus #2 B m6 | claude-opus-5-5 | 4 | 2350 | $0.05688 | 30.2 |  |
| 2026-10-24 08:34 | 106 | check arm 6 opus–opus #2 m6 | claude-haiku-5-5 | 2309 | 74 | $0.00027 | 1.5 |  |
| 2026-10-24 08:34 | 107 | subject arm 6 fable–fable #1 B m10 | claude-fable-5-1 | 4 | 370 | $0.04262 | 7.2 |  |
| 2026-10-24 08:34 | 108 | subject arm 6 opus–opus #3 A m5 | claude-opus-5-5 | 4 | 2841 | $0.07426 | 33 |  |
| 2026-10-24 08:34 | 109 | check arm 6 opus–opus #3 m5 | claude-haiku-5-5 | 3497 | 74 | $0.00039 | 0.9 |  |
| 2026-10-24 08:34 | 110 | ask-after arm 6 fable–fable #1 A | claude-fable-5-1 | 4 | 881 | $0.05484 | 16.3 |  |
| 2026-10-24 08:34 | 111 | check answer arm 6 fable–fable #1 A | claude-haiku-5-5 | 914 | 77 | $0.00013 | 0.9 |  |
| 2026-10-24 08:34 | 112 | subject arm 6 opus–opus #2 A m7 | claude-opus-5-5 | 4 | 1862 | $0.04790 | 23.6 |  |
| 2026-10-24 08:34 | 113 | check arm 6 opus–opus #2 m7 | claude-haiku-5-5 | 2491 | 85 | $0.00029 | 0.9 |  |
| 2026-10-24 08:34 | 114 | check referee arm 6 opus–opus #2 m7 | claude-opus-5-5 | 2491 | 65 | $0.01126 | 1.4 |  |
| 2026-10-24 08:34 | 115 | ask-after arm 6 fable–fable #1 B | claude-fable-5-1 | 4 | 465 | $0.02657 | 10.3 |  |
| 2026-10-24 08:34 | 116 | check answer arm 6 fable–fable #1 B | claude-haiku-5-5 | 779 | 64 | $0.00011 | 0.8 |  |
| 2026-10-24 08:34 | 117 | tags 1 arm 6 fable–fable #1 m1–9 | claude-haiku-5-5 | 11365 | 613 | $0.00144 | 2.6 |  |
| 2026-10-24 08:34 | 118 | tags 2 arm 6 fable–fable #1 m1–9 | claude-haiku-5-5 | 11365 | 613 | $0.00144 | 3.5 |  |
| 2026-10-24 08:34 | 119 | subject arm 6 opus–opus #3 B m6 | claude-opus-5-5 | 4 | 2660 | $0.06973 | 32.6 |  |
| 2026-10-24 08:34 | 120 | check arm 6 opus–opus #3 m6 | claude-haiku-5-5 | 3385 | 78 | $0.00038 | 0.9 |  |
| 2026-10-24 08:34 | 121 | tags referee arm 6 fable–fable #1 m1–9 | claude-opus-5-5 | 11365 | 613 | $0.05772 | 5.2 |  |
| 2026-10-24 08:34 | 122 | subject arm 6 fable–fable #3 A m1 | claude-fable-5-1 | 59 | 363 | $0.01874 | 7.1 |  |
| 2026-10-24 08:34 | 123 | ask-tags 2 answer arm 6 fable–fable #1 A | claude-haiku-5-5 | 1169 | 41 | $0.00014 | 0.7 |  |
| 2026-10-24 08:34 | 124 | ask-tags 1 answer arm 6 fable–fable #1 A | claude-haiku-5-5 | 1169 | 41 | $0.00014 | 0.7 |  |
| 2026-10-24 08:34 | 125 | check arm 6 fable–fable #3 m1 | claude-haiku-5-5 | 601 | 62 | $0.00009 | 0.8 |  |
| 2026-10-24 08:34 | 126 | ask-tags 1 answer arm 6 fable–fable #1 B | claude-haiku-5-5 | 1034 | 300 | $0.00025 | 1.6 |  |
| 2026-10-24 08:34 | 127 | subject arm 6 opus–opus #2 B m8 | claude-opus-5-5 | 4 | 1491 | $0.04157 | 19.7 |  |
| 2026-10-24 08:34 | 128 | ask-tags 2 answer arm 6 fable–fable #1 B | claude-haiku-5-5 | 1034 | 263 | $0.00023 | 1.5 |  |
| 2026-10-24 08:34 | 129 | check arm 6 opus–opus #2 m8 | claude-haiku-5-5 | 2241 | 74 | $0.00026 | 0.8 |  |
| 2026-10-24 08:34 | 130 | subject arm 6 opus–opus #3 A m7 | claude-opus-5-5 | 4 | 2055 | $0.05741 | 23.5 |  |
| 2026-10-24 08:34 | 131 | subject arm 6 opus–opus #2 A m9 | claude-opus-5-5 | 4 | 1132 | $0.03336 | 14 |  |
| 2026-10-24 08:34 | 132 | check arm 6 opus–opus #2 m9 | claude-haiku-5-5 | 1846 | 78 | $0.00022 | 0.7 |  |
| 2026-10-24 08:34 | 133 | check arm 6 opus–opus #3 m7 | claude-haiku-5-5 | 3219 | 80 | $0.00036 | 1 |  |
| 2026-10-24 08:34 | 134 | subject arm 6 fable–fable #3 B m2 | claude-fable-5-1 | 332 | 1223 | $0.06447 | 23.8 |  |
| 2026-10-24 08:34 | 135 | check arm 6 fable–fable #3 m2 | claude-haiku-5-5 | 1289 | 70 | $0.00016 | 0.7 |  |
| 2026-10-24 08:34 | 136 | subject arm 6 opus–opus #2 B m10 | claude-opus-5-5 | 4 | 211 | $0.01318 | 3.6 |  |
| 2026-10-24 08:34 | 137 | ask-after arm 6 opus–opus #2 A | claude-opus-5-5 | 4 | 835 | $0.02172 | 11 |  |
| 2026-10-24 08:34 | 138 | check answer arm 6 opus–opus #2 A | claude-haiku-5-5 | 986 | 63 | $0.00013 | 0.7 |  |
| 2026-10-24 08:34 | 139 | subject arm 6 opus–opus #3 B m8 | claude-opus-5-5 | 4 | 1692 | $0.04962 | 18.5 |  |
| 2026-10-24 08:34 | 140 | check arm 6 opus–opus #3 m8 | claude-haiku-5-5 | 2514 | 64 | $0.00028 | 0.7 |  |
| 2026-10-24 08:34 | 141 | ask-after arm 6 opus–opus #2 B | claude-opus-5-5 | 4 | 793 | $0.01774 | 10.1 |  |
| 2026-10-24 08:34 | 142 | check answer arm 6 opus–opus #2 B | claude-haiku-5-5 | 906 | 63 | $0.00012 | 0.6 |  |
| 2026-10-24 08:34 | 143 | tags 1 arm 6 opus–opus #2 m1–9 | claude-haiku-5-5 | 8918 | 613 | $0.00120 | 2.3 |  |
| 2026-10-24 08:34 | 144 | tags 2 arm 6 opus–opus #2 m1–9 | claude-haiku-5-5 | 8918 | 613 | $0.00120 | 2.4 |  |
| 2026-10-24 08:34 | 145 | ask-tags 1 answer arm 6 opus–opus #2 A | claude-haiku-5-5 | 1241 | 41 | $0.00014 | 0.7 |  |
| 2026-10-24 08:34 | 146 | subject arm 6 opus–opus #3 A m9 | claude-opus-5-5 | 4 | 1267 | $0.03791 | 13.6 |  |
| 2026-10-24 08:34 | 147 | check arm 6 opus–opus #3 m9 | claude-haiku-5-5 | 1896 | 76 | $0.00023 | 0.8 |  |
| 2026-10-24 08:34 | 148 | subject arm 6 fable–fable #3 A m3 | claude-fable-5-1 | 4 | 1593 | $0.09255 | 30.8 |  |
| 2026-10-24 08:34 | 149 | check arm 6 fable–fable #3 m3 | claude-haiku-5-5 | 1802 | 73 | $0.00022 | 1 |  |
| 2026-10-24 08:34 | 150 | ask-tags 2 answer arm 6 opus–opus #2 A | claude-haiku-5-5 | 1241 | 41 | $0.00014 | 0.8 |  |
| 2026-10-24 08:34 | 151 | ask-tags 2 answer arm 6 opus–opus #2 B | claude-haiku-5-5 | 1161 | 41 | $0.00014 | 0.6 |  |
| 2026-10-24 08:34 | 152 | ask-tags 1 answer arm 6 opus–opus #2 B | claude-haiku-5-5 | 1161 | 41 | $0.00014 | 0.7 |  |
| 2026-10-24 08:34 | 153 | subject arm 6 opus–opus #4 A m1 | claude-opus-5-5 | 59 | 522 | $0.01068 | 7.4 |  |
| 2026-10-24 08:34 | 154 | check arm 6 opus–opus #4 m1 | claude-haiku-5-5 | 808 | 70 | $0.00012 | 1.9 |  |
| 2026-10-24 08:34 | 155 | subject arm 6 opus–opus #3 B m10 | claude-opus-5-5 | 4 | 1719 | $0.04413 | 17.8 |  |
| 2026-10-24 08:34 | 156 | check arm 6 opus–opus #3 m10 | claude-haiku-5-5 | 1804 | 75 | $0.00022 | 1.8 |  |
| 2026-10-24 08:34 | 157 | subject arm 6 opus–opus #4 B m2 | claude-opus-5-5 | 4 | 1629 | $0.03527 | 19.7 |  |
| 2026-10-24 08:34 | 158 | check arm 6 opus–opus #4 m2 | claude-haiku-5-5 | 1694 | 82 | $0.00021 | 1 |  |
| 2026-10-24 08:34 | 159 | subject arm 6 fable–fable #3 B m4 | claude-fable-5-1 | 4 | 2090 | $0.12723 | 40.1 |  |
| 2026-10-24 08:34 | 160 | subject arm 6 opus–opus #3 A m11 | claude-opus-5-5 | 4 | 2114 | $0.05174 | 20.5 |  |
| 2026-10-24 08:34 | 161 | check arm 6 opus–opus #3 m11 | claude-haiku-5-5 | 2212 | 63 | $0.00025 | 0.7 |  |
| 2026-10-24 08:34 | 162 | check arm 6 fable–fable #3 m4 | claude-haiku-5-5 | 2117 | 75 | $0.00025 | 0.8 |  |
| 2026-10-24 08:34 | 163 | subject arm 6 opus–opus #4 A m3 | claude-opus-5-5 | 4 | 2306 | $0.05331 | 28.1 |  |
| 2026-10-24 08:34 | 164 | check arm 6 opus–opus #4 m3 | claude-haiku-5-5 | 2570 | 76 | $0.00030 | 1 |  |
| 2026-10-24 08:34 | 165 | subject arm 6 opus–opus #3 B m12 | claude-opus-5-5 | 4 | 2330 | $0.05824 | 21.7 |  |
| 2026-10-24 08:34 | 166 | check arm 6 opus–opus #3 m12 | claude-haiku-5-5 | 2661 | 64 | $0.00030 | 0.7 |  |
| 2026-10-24 08:34 | 167 | subject arm 6 fable–fable #3 A m5 | claude-fable-5-1 | 4 | 2232 | $0.13442 | 40.6 |  |
| 2026-10-24 08:34 | 168 | check arm 6 fable–fable #3 m5 | claude-haiku-5-5 | 2342 | 74 | $0.00027 | 0.8 |  |
| 2026-10-24 08:34 | 169 | subject arm 6 opus–opus #3 A m13 | claude-opus-5-5 | 4 | 1950 | $0.05304 | 20.6 |  |
| 2026-10-24 08:34 | 170 | check arm 6 opus–opus #3 m13 | claude-haiku-5-5 | 2671 | 71 | $0.00030 | 1.1 |  |
| 2026-10-24 08:34 | 171 | subject arm 6 opus–opus #4 B m4 | claude-opus-5-5 | 4 | 2556 | $0.06252 | 34.1 |  |
| 2026-10-24 08:34 | 172 | check arm 6 opus–opus #4 m4 | claude-haiku-5-5 | 3121 | 74 | $0.00035 | 0.7 |  |
| 2026-10-24 08:34 | 173 | subject arm 6 opus–opus #4 A m5 | claude-opus-5-5 | 4 | 2092 | $0.05617 | 24.4 |  |
| 2026-10-24 08:34 | 174 | check arm 6 opus–opus #4 m5 | claude-haiku-5-5 | 2842 | 67 | $0.00032 | 2.8 |  |
| 2026-10-24 08:34 | 175 | subject arm 6 fable–fable #3 B m6 | claude-fable-5-1 | 4 | 2141 | $0.13288 | 39.5 |  |
| 2026-10-24 08:34 | 176 | subject arm 6 opus–opus #3 B m14 | claude-opus-5-5 | 4 | 3469 | $0.08370 | 35.2 |  |
| 2026-10-24 08:34 | 177 | check arm 6 fable–fable #3 m6 | claude-haiku-5-5 | 2216 | 71 | $0.00026 | 0.8 |  |
| 2026-10-24 08:34 | 178 | check arm 6 opus–opus #3 m14 | claude-haiku-5-5 | 2723 | 63 | $0.00030 | 0.6 |  |
| 2026-10-24 08:34 | 179 | subject arm 6 opus–opus #4 B m6 | claude-opus-5-5 | 4 | 2211 | $0.05743 | 28.3 |  |
| 2026-10-24 08:34 | 180 | check arm 6 opus–opus #4 m6 | claude-haiku-5-5 | 2777 | 72 | $0.00031 | 0.8 |  |
| 2026-10-24 08:34 | 181 | subject arm 6 fable–fable #3 A m7 | claude-fable-5-1 | 4 | 2004 | $0.12471 | 39.1 |  |
| 2026-10-24 08:34 | 182 | check arm 6 fable–fable #3 m7 | claude-haiku-5-5 | 2226 | 71 | $0.00026 | 0.8 |  |
| 2026-10-24 08:34 | 183 | subject arm 6 opus–opus #3 A m15 | claude-opus-5-5 | 4 | 5766 | $0.13014 | 52.7 |  |
| 2026-10-24 08:34 | 184 | subject arm 6 opus–opus #4 A m7 | claude-opus-5-5 | 4 | 2297 | $0.05911 | 28.2 |  |
| 2026-10-24 08:34 | 185 | check arm 6 opus–opus #3 m15 | claude-haiku-5-5 | 3344 | 58 | $0.00036 | 0.8 |  |
| 2026-10-24 08:34 | 186 | check arm 6 opus–opus #4 m7 | claude-haiku-5-5 | 3086 | 75 | $0.00035 | 0.8 |  |
| 2026-10-24 08:34 | 187 | subject arm 6 fable–fable #3 B m8 | claude-fable-5-1 | 4 | 1968 | $0.12329 | 38.1 |  |
| 2026-10-24 08:34 | 188 | check arm 6 fable–fable #3 m8 | claude-haiku-5-5 | 2181 | 80 | $0.00026 | 1 |  |
| 2026-10-24 08:34 | 189 | subject arm 6 opus–opus #4 B m8 | claude-opus-5-5 | 4 | 2087 | $0.05667 | 25.2 |  |
| 2026-10-24 08:34 | 190 | check arm 6 opus–opus #4 m8 | claude-haiku-5-5 | 2819 | 79 | $0.00032 | 0.8 |  |
| 2026-10-24 08:34 | 191 | subject arm 6 opus–opus #3 B m16 | claude-opus-5-5 | 4 | 2889 | $0.07593 | 28.8 |  |
| 2026-10-24 08:34 | 192 | check arm 6 opus–opus #3 m16 | claude-haiku-5-5 | 2984 | 67 | $0.00033 | 0.7 |  |
| 2026-10-24 08:34 | 193 | check referee arm 6 opus–opus #4 m8 | claude-opus-5-5 | 2819 | 59 | $0.01246 | 2.2 |  |
| 2026-10-24 08:34 | 194 | subject arm 6 opus–opus #3 A m17 | claude-opus-5-5 | 4 | 315 | $0.02291 | 4.7 |  |
| 2026-10-24 08:34 | 195 | subject arm 6 opus–opus #4 A m9 | claude-opus-5-5 | 4 | 940 | $0.03268 | 11.7 |  |
| 2026-10-24 08:34 | 196 | check arm 6 opus–opus #4 m9 | claude-haiku-5-5 | 2021 | 79 | $0.00024 | 0.8 |  |
| 2026-10-24 08:34 | 197 | subject arm 6 fable–fable #3 A m9 | claude-fable-5-1 | 4 | 857 | $0.06740 | 17.2 |  |
| 2026-10-24 08:34 | 198 | check arm 6 fable–fable #3 m9 | claude-haiku-5-5 | 1593 | 76 | $0.00020 | 0.7 |  |
| 2026-10-24 08:34 | 199 | ask-after arm 6 opus–opus #3 A | claude-opus-5-5 | 4 | 797 | $0.02001 | 10.6 |  |
| 2026-10-24 08:34 | 200 | check answer arm 6 opus–opus #3 A | claude-haiku-5-5 | 913 | 68 | $0.00013 | 0.7 |  |
| 2026-10-24 08:34 | 201 | subject arm 6 fable–fable #3 B m10 | claude-fable-5-1 | 4 | 423 | $0.03860 | 7.9 |  |
| 2026-10-24 08:34 | 202 | check arm 6 fable–fable #3 m10 | claude-haiku-5-5 | 879 | 79 | $0.00013 | 0.9 |  |
| 2026-10-24 08:34 | 203 | ask-after arm 6 opus–opus #3 B | claude-opus-5-5 | 4 | 863 | $0.02566 | 11.7 |  |
| 2026-10-24 08:34 | 204 | check answer arm 6 opus–opus #3 B | claude-haiku-5-5 | 942 | 60 | $0.00012 | 0.7 |  |
| 2026-10-24 08:34 | 205 | tags 1 arm 6 opus–opus #3 m11–16 | claude-haiku-5-5 | 9178 | 412 | $0.00112 | 1.6 |  |
| 2026-10-24 08:34 | 206 | tags 1 arm 6 opus–opus #3 m1–10 | claude-haiku-5-5 | 12449 | 680 | $0.00158 | 2.2 |  |
| 2026-10-24 08:34 | 207 | tags 2 arm 6 opus–opus #3 m1–10 | claude-haiku-5-5 | 12449 | 680 | $0.00158 | 2.3 |  |
| 2026-10-24 08:34 | 208 | tags 2 arm 6 opus–opus #3 m11–16 | claude-haiku-5-5 | 9178 | 412 | $0.00112 | 1.9 |  |
| 2026-10-24 08:34 | 209 | ask-after arm 6 fable–fable #3 A | claude-fable-5-1 | 4 | 764 | $0.04758 | 14.1 |  |
| 2026-10-24 08:34 | 210 | ask-tags 1 answer arm 6 opus–opus #3 A | claude-haiku-5-5 | 1168 | 41 | $0.00014 | 0.6 |  |
| 2026-10-24 08:34 | 211 | ask-tags 2 answer arm 6 opus–opus #3 A | claude-haiku-5-5 | 1168 | 41 | $0.00014 | 0.8 |  |
| 2026-10-24 08:34 | 212 | check answer arm 6 fable–fable #3 A | claude-haiku-5-5 | 762 | 85 | $0.00012 | 1.3 |  |
| 2026-10-24 08:34 | 213 | ask-tags referee answer arm 6 opus–opus #3 A | claude-opus-5-5 | 1168 | 242 | $0.00951 | 2.7 |  |
| 2026-10-24 08:34 | 214 | ask-tags 1 answer arm 6 opus–opus #3 B | claude-haiku-5-5 | 1197 | 208 | $0.00022 | 1.1 |  |
| 2026-10-24 08:34 | 215 | ask-tags 2 answer arm 6 opus–opus #3 B | claude-haiku-5-5 | 1197 | 215 | $0.00023 | 1.2 |  |
| 2026-10-24 08:34 | 216 | subject arm 6 fable–fable #4 A m1 | claude-fable-5-1 | 59 | 561 | $0.02864 | 12.3 |  |
| 2026-10-24 08:34 | 217 | subject arm 6 opus–opus #4 B m10 | claude-opus-5-5 | 4 | 3282 | $0.07580 | 33.6 |  |
| 2026-10-24 08:34 | 218 | check arm 6 fable–fable #4 m1 | claude-haiku-5-5 | 804 | 66 | $0.00011 | 0.7 |  |
| 2026-10-24 08:34 | 219 | check arm 6 opus–opus #4 m10 | claude-haiku-5-5 | 1361 | 53 | $0.00016 | 0.7 |  |
| 2026-10-24 08:34 | 220 | ask-after arm 6 fable–fable #3 B | claude-fable-5-1 | 4 | 751 | $0.04162 | 15.2 |  |
| 2026-10-24 08:34 | 221 | check answer arm 6 fable–fable #3 B | claude-haiku-5-5 | 822 | 61 | $0.00011 | 1.6 |  |
| 2026-10-24 08:34 | 222 | tags 1 arm 6 fable–fable #3 m1–10 | claude-haiku-5-5 | 8136 | 680 | $0.00115 | 2.2 |  |
| 2026-10-24 08:34 | 223 | tags 2 arm 6 fable–fable #3 m1–10 | claude-haiku-5-5 | 8136 | 680 | $0.00115 | 2.2 |  |
| 2026-10-24 08:34 | 224 | ask-tags 1 answer arm 6 fable–fable #3 A | claude-haiku-5-5 | 1017 | 526 | $0.00036 | 2.7 |  |
| 2026-10-24 08:34 | 225 | ask-tags 2 answer arm 6 fable–fable #3 A | claude-haiku-5-5 | 1017 | 41 | $0.00012 | 0.6 |  |
| 2026-10-24 08:34 | 226 | ask-tags 1 answer arm 6 fable–fable #3 B | claude-haiku-5-5 | 1077 | 41 | $0.00013 | 0.8 |  |
| 2026-10-24 08:34 | 227 | subject arm 6 opus–opus #4 A m11 | claude-opus-5-5 | 4 | 1442 | $0.03593 | 16 |  |
| 2026-10-24 08:34 | 228 | check arm 6 opus–opus #4 m11 | claude-haiku-5-5 | 1508 | 60 | $0.00018 | 0.6 |  |
| 2026-10-24 08:34 | 229 | subject arm 6 opus–opus #5 A m1 | claude-opus-5-5 | 59 | 433 | $0.00890 | 6.9 |  |
| 2026-10-24 08:34 | 230 | ask-tags 2 answer arm 6 fable–fable #3 B | claude-haiku-5-5 | 1077 | 41 | $0.00013 | 0.7 |  |
| 2026-10-24 08:34 | 231 | check arm 6 opus–opus #5 m1 | claude-haiku-5-5 | 720 | 70 | $0.00011 | 0.7 |  |
| 2026-10-24 08:34 | 232 | subject arm 6 fable–fable #4 B m2 | claude-fable-5-1 | 4 | 1374 | $0.07538 | 25.2 |  |
| 2026-10-24 08:34 | 233 | check arm 6 fable–fable #4 m2 | claude-haiku-5-5 | 1827 | 83 | $0.00022 | 1.3 |  |
| 2026-10-24 08:34 | 234 | subject arm 6 opus–opus #4 B m12 | claude-opus-5-5 | 4 | 959 | $0.02712 | 12.6 |  |
| 2026-10-24 08:34 | 235 | subject arm 6 opus–opus #5 B m2 | claude-opus-5-5 | 451 | 851 | $0.01882 | 11.4 |  |
| 2026-10-24 08:34 | 236 | check arm 6 opus–opus #4 m12 | claude-haiku-5-5 | 1691 | 72 | $0.00021 | 0.6 |  |
| 2026-10-24 08:34 | 237 | check arm 6 opus–opus #5 m2 | claude-haiku-5-5 | 1446 | 69 | $0.00018 | 0.6 |  |
| 2026-10-24 08:34 | 238 | check referee arm 6 opus–opus #5 m2 | claude-opus-5-5 | 1446 | 74 | $0.00726 | 1.3 |  |
| 2026-10-24 08:34 | 239 | subject arm 6 opus–opus #5 A m3 | claude-opus-5-5 | 4 | 1840 | $0.04275 | 22.7 |  |
| 2026-10-24 08:34 | 240 | check arm 6 opus–opus #5 m3 | claude-haiku-5-5 | 2047 | 73 | $0.00024 | 0.7 |  |
| 2026-10-24 08:34 | 241 | subject arm 6 opus–opus #4 A m13 | claude-opus-5-5 | 4 | 2399 | $0.05693 | 27.4 |  |
| 2026-10-24 08:34 | 242 | check arm 6 opus–opus #4 m13 | claude-haiku-5-5 | 1281 | 58 | $0.00016 | 0.7 |  |
| 2026-10-24 08:34 | 243 | subject arm 6 fable–fable #4 A m3 | claude-fable-5-1 | 4 | 2200 | $0.12963 | 40.3 |  |
| 2026-10-24 08:34 | 244 | check arm 6 fable–fable #4 m3 | claude-haiku-5-5 | 2468 | 79 | $0.00029 | 1.2 |  |
| 2026-10-24 08:34 | 245 | subject arm 6 opus–opus #4 B m14 | claude-opus-5-5 | 4 | 2144 | $0.04992 | 24 |  |
| 2026-10-24 08:34 | 246 | check arm 6 opus–opus #4 m14 | claude-haiku-5-5 | 1533 | 69 | $0.00019 | 0.8 |  |
| 2026-10-24 08:34 | 247 | subject arm 6 opus–opus #5 B m4 | claude-opus-5-5 | 4 | 2495 | $0.06081 | 30.8 |  |
| 2026-10-24 08:34 | 248 | check arm 6 opus–opus #5 m4 | claude-haiku-5-5 | 2562 | 74 | $0.00029 | 0.9 |  |
| 2026-10-24 08:34 | 249 | subject arm 6 fable–fable #4 B m4 | claude-fable-5-1 | 4 | 1876 | $0.12089 | 34.4 |  |
| 2026-10-24 08:34 | 250 | check arm 6 fable–fable #4 m4 | claude-haiku-5-5 | 2552 | 93 | $0.00030 | 1.3 |  |
| 2026-10-24 08:34 | 251 | subject arm 6 opus–opus #4 A m15 | claude-opus-5-5 | 4 | 1653 | $0.04149 | 21.1 |  |
| 2026-10-24 08:34 | 252 | check arm 6 opus–opus #4 m15 | claude-haiku-5-5 | 2018 | 83 | $0.00024 | 0.9 |  |
| 2026-10-24 08:34 | 253 | subject arm 6 opus–opus #4 B m16 | claude-opus-5-5 | 4 | 413 | $0.01918 | 6.1 |  |
| 2026-10-24 08:34 | 254 | subject arm 6 opus–opus #5 A m5 | claude-opus-5-5 | 4 | 2390 | $0.05929 | 30.1 |  |
| 2026-10-24 08:34 | 255 | check arm 6 opus–opus #5 m5 | claude-haiku-5-5 | 2742 | 71 | $0.00031 | 0.8 |  |
| 2026-10-24 08:34 | 256 | ask-after arm 6 opus–opus #4 A | claude-opus-5-5 | 4 | 1043 | $0.02777 | 14.2 |  |
| 2026-10-24 08:34 | 257 | check answer arm 6 opus–opus #4 A | claude-haiku-5-5 | 1008 | 71 | $0.00014 | 0.7 |  |
| 2026-10-24 08:34 | 258 | subject arm 6 fable–fable #4 A m5 | claude-fable-5-1 | 4 | 1699 | $0.11334 | 34.6 |  |
| 2026-10-24 08:34 | 259 | check arm 6 fable–fable #4 m5 | claude-haiku-5-5 | 2331 | 84 | $0.00028 | 0.8 |  |
| 2026-10-24 08:34 | 260 | subject arm 6 fable–fable #4 B m6 | claude-fable-5-1 | 4 | 323 | $0.04206 | 6.6 |  |
| 2026-10-24 08:34 | 261 | check arm 6 fable–fable #4 m6 | claude-haiku-5-5 | 1408 | 71 | $0.00018 | 0.8 |  |
| 2026-10-24 08:34 | 262 | ask-after arm 6 opus–opus #4 B | claude-opus-5-5 | 4 | 814 | $0.01930 | 12.1 |  |
| 2026-10-24 08:34 | 263 | check answer arm 6 opus–opus #4 B | claude-haiku-5-5 | 900 | 64 | $0.00012 | 1.2 |  |
| 2026-10-24 08:34 | 264 | subject arm 6 opus–opus #5 B m6 | claude-opus-5-5 | 4 | 2231 | $0.05721 | 26.8 |  |
| 2026-10-24 08:34 | 265 | check arm 6 opus–opus #5 m6 | claude-haiku-5-5 | 2700 | 73 | $0.00031 | 0.8 |  |
| 2026-10-24 08:34 | 266 | tags 1 arm 6 opus–opus #4 m11–15 | claude-haiku-5-5 | 4837 | 345 | $0.00066 | 1.4 |  |
| 2026-10-24 08:34 | 267 | tags 1 arm 6 opus–opus #4 m1–10 | claude-haiku-5-5 | 11226 | 680 | $0.00146 | 2.2 |  |
| 2026-10-24 08:34 | 268 | tags 2 arm 6 opus–opus #4 m1–10 | claude-haiku-5-5 | 11226 | 680 | $0.00146 | 2.2 |  |
| 2026-10-24 08:34 | 269 | tags 2 arm 6 opus–opus #4 m11–15 | claude-haiku-5-5 | 4837 | 345 | $0.00066 | 1.5 |  |
| 2026-10-24 08:34 | 270 | ask-tags 1 answer arm 6 opus–opus #4 A | claude-haiku-5-5 | 1263 | 466 | $0.00036 | 2.4 |  |
| 2026-10-24 08:34 | 271 | ask-tags 2 answer arm 6 opus–opus #4 A | claude-haiku-5-5 | 1263 | 632 | $0.00044 | 3.5 |  |
| 2026-10-24 08:34 | 272 | subject arm 6 fable–fable #5 A m1 | claude-fable-5-1 | 59 | 507 | $0.02594 | 10.3 |  |
| 2026-10-24 08:34 | 273 | ask-tags referee answer arm 6 opus–opus #4 A | claude-opus-5-5 | 1263 | 253 | $0.01011 | 3 |  |
| 2026-10-24 08:34 | 274 | check arm 6 fable–fable #5 m1 | claude-haiku-5-5 | 749 | 86 | $0.00012 | 0.9 |  |
| 2026-10-24 08:34 | 275 | ask-tags 2 answer arm 6 opus–opus #4 B | claude-haiku-5-5 | 1155 | 433 | $0.00033 | 2.3 |  |
| 2026-10-24 08:34 | 276 | ask-tags 1 answer arm 6 opus–opus #4 B | claude-haiku-5-5 | 1155 | 464 | $0.00035 | 2.5 |  |
| 2026-10-24 08:34 | 277 | ask-after arm 6 fable–fable #4 A | claude-fable-5-1 | 4 | 835 | $0.05704 | 17.7 |  |
| 2026-10-24 08:34 | 278 | check answer arm 6 fable–fable #4 A | claude-haiku-5-5 | 924 | 65 | $0.00012 | 0.8 |  |
| 2026-10-24 08:34 | 279 | subject arm 6 opus–opus #5 A m7 | claude-opus-5-5 | 4 | 2944 | $0.07151 | 33.7 |  |
| 2026-10-24 08:34 | 280 | ask-after arm 6 fable–fable #4 B | claude-fable-5-1 | 4 | 825 | $0.04557 | 17.1 |  |
| 2026-10-24 08:34 | 281 | check arm 6 opus–opus #5 m7 | claude-haiku-5-5 | 2842 | 75 | $0.00032 | 1.1 |  |
| 2026-10-24 08:34 | 282 | check answer arm 6 fable–fable #4 B | claude-haiku-5-5 | 845 | 68 | $0.00012 | 0.8 |  |
| 2026-10-24 08:34 | 283 | tags 2 arm 6 fable–fable #4 m1–6 | claude-haiku-5-5 | 5807 | 412 | $0.00079 | 1.5 |  |
| 2026-10-24 08:34 | 284 | tags 1 arm 6 fable–fable #4 m1–6 | claude-haiku-5-5 | 5807 | 412 | $0.00079 | 1.7 |  |
| 2026-10-24 08:34 | 285 | tags referee arm 6 fable–fable #4 m1–6 | claude-opus-5-5 | 5807 | 412 | $0.03147 | 3.6 |  |
| 2026-10-24 08:34 | 286 | ask-tags 2 answer arm 6 fable–fable #4 A | claude-haiku-5-5 | 1179 | 41 | $0.00014 | 0.7 |  |
| 2026-10-24 08:34 | 287 | ask-tags 1 answer arm 6 fable–fable #4 A | claude-haiku-5-5 | 1179 | 41 | $0.00014 | 0.7 |  |
| 2026-10-24 08:34 | 288 | ask-tags 1 answer arm 6 fable–fable #4 B | claude-haiku-5-5 | 1100 | 41 | $0.00013 | 0.7 |  |
| 2026-10-24 08:34 | 289 | ask-tags 2 answer arm 6 fable–fable #4 B | claude-haiku-5-5 | 1100 | 41 | $0.00013 | 0.7 |  |
| 2026-10-24 08:34 | 290 | subject arm 6 fable–fable #5 B m2 | claude-fable-5-1 | 480 | 1878 | $0.09870 | 34.2 |  |
| 2026-10-24 08:34 | 291 | check arm 6 fable–fable #5 m2 | claude-haiku-5-5 | 1910 | 88 | $0.00023 | 0.9 |  |
| 2026-10-24 08:34 | 292 | ask-tags referee answer arm 6 fable–fable #4 B | claude-opus-5-5 | 1100 | 41 | $0.00522 | 1.7 |  |
| 2026-10-24 08:34 | 293 | subject arm 6 opus–opus #5 B m8 | claude-opus-5-5 | 4 | 2018 | $0.05393 | 25.5 |  |
| 2026-10-24 08:34 | 294 | check arm 6 opus–opus #5 m8 | claude-haiku-5-5 | 3004 | 83 | $0.00034 | 1 |  |
| 2026-10-24 08:34 | 295 | subject arm 6 opus–opus #5 A m9 | claude-opus-5-5 | 4 | 2177 | $0.05816 | 25.5 |  |
| 2026-10-24 08:34 | 296 | check arm 6 opus–opus #5 m9 | claude-haiku-5-5 | 2584 | 76 | $0.00030 | 0.9 |  |
| 2026-10-24 08:34 | 297 | subject arm 6 fable–fable #5 A m3 | claude-fable-5-1 | 4 | 2410 | $0.14117 | 45.8 |  |
| 2026-10-24 08:34 | 298 | check arm 6 fable–fable #5 m3 | claude-haiku-5-5 | 2819 | 85 | $0.00032 | 1.2 |  |
| 2026-10-24 08:34 | 299 | subject arm 6 opus–opus #5 B m10 | claude-opus-5-5 | 4 | 2334 | $0.05947 | 26.5 |  |
| 2026-10-24 08:34 | 300 | check arm 6 opus–opus #5 m10 | claude-haiku-5-5 | 2357 | 73 | $0.00027 | 0.8 |  |
| 2026-10-24 08:34 | 301 | subject arm 6 fable–fable #5 B m4 | claude-fable-5-1 | 4 | 2321 | $0.15334 | 39.6 |  |
| 2026-10-24 08:34 | 302 | check arm 6 fable–fable #5 m4 | claude-haiku-5-5 | 3051 | 80 | $0.00035 | 0.9 |  |
| 2026-10-24 08:34 | 303 | subject arm 6 opus–opus #5 A m11 | claude-opus-5-5 | 4 | 2792 | $0.06777 | 29.7 |  |
| 2026-10-24 08:34 | 304 | check arm 6 opus–opus #5 m11 | claude-haiku-5-5 | 2353 | 78 | $0.00027 | 1.6 |  |
| 2026-10-24 08:34 | 305 | subject arm 6 fable–fable #5 A m5 | claude-fable-5-1 | 4 | 1737 | $0.12150 | 32.7 |  |
| 2026-10-24 08:34 | 306 | check arm 6 fable–fable #5 m5 | claude-haiku-5-5 | 2773 | 96 | $0.00033 | 0.9 |  |
| 2026-10-24 08:34 | 307 | subject arm 6 opus–opus #5 B m12 | claude-opus-5-5 | 4 | 2991 | $0.07191 | 29.2 |  |
| 2026-10-24 08:34 | 308 | check arm 6 opus–opus #5 m12 | claude-haiku-5-5 | 2283 | 82 | $0.00027 | 1.1 |  |
| 2026-10-24 08:34 | 309 | subject arm 6 fable–fable #5 B m6 | claude-fable-5-1 | 4 | 1396 | $0.10131 | 26.9 |  |
| 2026-10-24 08:34 | 310 | check arm 6 fable–fable #5 m6 | claude-haiku-5-5 | 2126 | 77 | $0.00025 | 0.8 |  |
| 2026-10-24 08:34 | 311 | subject arm 6 opus–opus #5 A m13 | claude-opus-5-5 | 4 | 1531 | $0.04259 | 18.3 |  |
| 2026-10-24 08:34 | 312 | check arm 6 opus–opus #5 m13 | claude-haiku-5-5 | 2174 | 72 | $0.00025 | 0.8 |  |
| 2026-10-24 08:34 | 313 | subject arm 6 fable–fable #5 A m7 | claude-fable-5-1 | 4 | 316 | $0.03957 | 6.1 |  |
| 2026-10-24 08:34 | 314 | subject arm 6 opus–opus #5 B m14 | claude-opus-5-5 | 4 | 169 | $0.01498 | 2.6 |  |
| 2026-10-24 08:34 | 315 | ask-after arm 6 opus–opus #5 A | claude-opus-5-5 | 4 | 1013 | $0.02696 | 13.3 |  |
| 2026-10-24 08:34 | 316 | check answer arm 6 opus–opus #5 A | claude-haiku-5-5 | 1093 | 65 | $0.00014 | 0.6 |  |
| 2026-10-24 08:34 | 317 | ask-after arm 6 fable–fable #5 A | claude-fable-5-1 | 4 | 849 | $0.04471 | 15.5 |  |
| 2026-10-24 08:34 | 318 | check answer arm 6 fable–fable #5 A | claude-haiku-5-5 | 865 | 65 | $0.00012 | 1.1 |  |
| 2026-10-24 08:34 | 319 | check referee answer arm 6 opus–opus #5 A | claude-opus-5-5 | 1093 | 59 | $0.00555 | 1.7 |  |
| 2026-10-24 08:34 | 320 | ask-after arm 6 opus–opus #5 B | claude-opus-5-5 | 4 | 942 | $0.02179 | 11.7 |  |
| 2026-10-24 08:34 | 321 | ask-after arm 6 fable–fable #5 B | claude-fable-5-1 | 4 | 548 | $0.03891 | 12 |  |
| 2026-10-24 08:34 | 322 | check answer arm 6 opus–opus #5 B | claude-haiku-5-5 | 986 | 62 | $0.00013 | 0.6 |  |
| 2026-10-24 08:34 | 323 | check answer arm 6 fable–fable #5 B | claude-haiku-5-5 | 885 | 64 | $0.00012 | 0.8 |  |
| 2026-10-24 08:34 | 324 | tags 1 arm 6 opus–opus #5 m11–13 | claude-haiku-5-5 | 4840 | 211 | $0.00059 | 1.1 |  |
| 2026-10-24 08:34 | 325 | tags 1 arm 6 opus–opus #5 m1–10 | claude-haiku-5-5 | 11523 | 680 | $0.00149 | 2.2 |  |
| 2026-10-24 08:34 | 326 | tags 2 arm 6 opus–opus #5 m1–10 | claude-haiku-5-5 | 11523 | 680 | $0.00149 | 2.2 |  |
| 2026-10-24 08:34 | 327 | tags 2 arm 6 opus–opus #5 m11–13 | claude-haiku-5-5 | 4840 | 211 | $0.00059 | 1 |  |
| 2026-10-24 08:34 | 328 | tags 2 arm 6 fable–fable #5 m1–6 | claude-haiku-5-5 | 7107 | 412 | $0.00092 | 1.6 |  |
| 2026-10-24 08:34 | 329 | tags 1 arm 6 fable–fable #5 m1–6 | claude-haiku-5-5 | 7107 | 412 | $0.00092 | 2 |  |
| 2026-10-24 08:34 | 330 | ask-tags 1 answer arm 6 fable–fable #5 A | claude-haiku-5-5 | 1120 | 41 | $0.00013 | 0.6 |  |
| 2026-10-24 08:34 | 331 | ask-tags 2 answer arm 6 fable–fable #5 A | claude-haiku-5-5 | 1120 | 41 | $0.00013 | 0.6 |  |
| 2026-10-24 08:34 | 332 | ask-tags 1 answer arm 6 fable–fable #5 B | claude-haiku-5-5 | 1140 | 41 | $0.00013 | 0.7 |  |
| 2026-10-24 08:34 | 333 | ask-tags 2 answer arm 6 fable–fable #5 B | claude-haiku-5-5 | 1140 | 41 | $0.00013 | 0.7 |  |
| 2026-10-24 08:34 | 334 | tags referee arm 6 opus–opus #5 m1–10 | claude-opus-5-5 | 11523 | 922 | $0.06453 | 8 |  |
| 2026-10-24 08:34 | 335 | ask-tags 2 answer arm 6 opus–opus #5 A | claude-haiku-5-5 | 1348 | 41 | $0.00016 | 0.6 |  |
| 2026-10-24 08:34 | 336 | ask-tags 1 answer arm 6 opus–opus #5 A | claude-haiku-5-5 | 1348 | 41 | $0.00016 | 1.2 |  |
| 2026-10-24 08:34 | 337 | ask-tags referee answer arm 6 opus–opus #5 A | claude-opus-5-5 | 1348 | 41 | $0.00621 | 1.1 |  |
| 2026-10-24 08:34 | 338 | ask-tags 2 answer arm 6 opus–opus #5 B | claude-haiku-5-5 | 1241 | 378 | $0.00031 | 2.4 |  |
| 2026-10-24 08:34 | 339 | ask-tags 1 answer arm 6 opus–opus #5 B | claude-haiku-5-5 | 1241 | 450 | $0.00035 | 2.6 |  |
