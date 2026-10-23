# Persona memory 2 — the paid-call ledger (Part F, the posture case)

Cap $15. Spent **$5.3277** in 1377 calls over 6 run(s).
- 2026-10-23 03:28 UTC: posture: opus+sonnet × 5 arms × 4 probes × n 1, effort medium — 116 calls, $0.5447 → `persona-memory-2-posture-20261023-032801.json`
- 2026-10-23 03:28 UTC: diagnostic: the refusal on the tape-room recollection probe (4 calls) — 4 calls, $0.0567 → `(diagnostic, no run file; the results are in the report)`
- 2026-10-23 03:29 UTC: diagnostic: the refusal on the tape-room recollection probe (2 calls) — 2 calls, $0.0284 → `(diagnostic, no run file; the results are in the report)`
- 2026-10-23 03:35 UTC: posture: opus+sonnet × 5 arms × 4 probes × n 10, effort medium — 846 calls, $3.3188 → `persona-memory-2-posture-20261023-033510.json`
- 2026-10-23 04:35 UTC: diagnostic: model access checks during and after the suspension (4 tiny calls) — 4 calls, $0.0003 → `(diagnostic, no run file)`
- 2026-10-23 04:40 UTC: posture: opus+sonnet × 5 arms × 4 probes × n 10, effort medium (resuming persona-memory-2-posture-20261023-033510.json), skipped sonnet:recollection — 405 calls, $1.3789 → `persona-memory-2-posture-20261023-044019.json`

Prices per 1M tokens: Opus 5.5 input $4 / output $20; Sonnet 5.5 $2 / $10; Haiku 5.5 $0.10 / $0.50. Output tokens include thinking.

| Model — purpose | Calls | Input tokens | Output tokens | Cost |
| --- | --- | --- | --- | --- |
| claude-opus-5-5 — persona | 238 | 290805 | 111182 | $3.3869 |
| claude-sonnet-5-5 — persona | 351 | 202312 | 100817 | $1.4128 |
| claude-haiku-5-5 — judge | 748 | 965824 | 117155 | $0.1552 |
| claude-opus-5-5 — referee | 30 | 33025 | 7780 | $0.2877 |
| claude-opus-5-5 — diagnostic | 8 | 9555 | 2348 | $0.0852 |
| claude-sonnet-5-5 — diagnostic | 2 | 13 | 6 | $0.0001 |

## Every call

| Run | # | Purpose | Model | Input | Output | Cost | Seconds | Error |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-23 03:28 | 1 | persona opus journal/transfer | claude-opus-5-5 | 916 | 507 | $0.01380 | 6.8 |  |
| 2026-10-23 03:28 | 2 | persona opus none/transfer | claude-opus-5-5 | 141 | 497 | $0.01050 | 6.9 |  |
| 2026-10-23 03:28 | 3 | persona opus summary/transfer | claude-opus-5-5 | 908 | 525 | $0.01413 | 7.7 |  |
| 2026-10-23 03:28 | 4 | persona opus rewrite/transfer | claude-opus-5-5 | 869 | 643 | $0.01634 | 9.2 |  |
| 2026-10-23 03:28 | 5 | persona opus sham/transfer | claude-opus-5-5 | 821 | 538 | $0.01404 | 7.3 |  |
| 2026-10-23 03:28 | 6 | persona opus journal/thought | claude-opus-5-5 | 2338 | 569 | $0.02073 | 7.5 |  |
| 2026-10-23 03:28 | 7 | persona opus summary/thought | claude-opus-5-5 | 2213 | 540 | $0.01965 | 7.7 |  |
| 2026-10-23 03:28 | 8 | persona opus rewrite/thought | claude-opus-5-5 | 2114 | 564 | $0.01974 | 8.2 |  |
| 2026-10-23 03:28 | 9 | persona opus none/thought | claude-opus-5-5 | 125 | 567 | $0.01184 | 7.3 |  |
| 2026-10-23 03:28 | 10 | persona opus sham/thought | claude-opus-5-5 | 2124 | 510 | $0.01870 | 7.8 |  |
| 2026-10-23 03:28 | 11 | persona opus journal/voice | claude-opus-5-5 | 2116 | 567 | $0.01980 | 7.7 |  |
| 2026-10-23 03:28 | 12 | persona opus summary/voice | claude-opus-5-5 | 1914 | 595 | $0.01956 | 8.2 |  |
| 2026-10-23 03:28 | 13 | persona opus journal/recollection | claude-opus-5-5 | 2099 | 0 | $0.00840 | 1 |  |
| 2026-10-23 03:28 | 14 | persona opus journal/recollection | claude-opus-5-5 | 2099 | 0 | $0.00840 | 2.1 |  |
| 2026-10-23 03:28 | 15 | persona opus rewrite/voice | claude-opus-5-5 | 1833 | 643 | $0.02019 | 8.2 |  |
| 2026-10-23 03:28 | 16 | persona opus summary/recollection | claude-opus-5-5 | 1909 | 0 | $0.00764 | 0.9 |  |
| 2026-10-23 03:28 | 17 | persona opus summary/recollection | claude-opus-5-5 | 1909 | 0 | $0.00764 | 0.6 |  |
| 2026-10-23 03:28 | 18 | persona opus rewrite/recollection | claude-opus-5-5 | 1846 | 0 | $0.00738 | 1 |  |
| 2026-10-23 03:28 | 19 | persona opus rewrite/recollection | claude-opus-5-5 | 1846 | 0 | $0.00738 | 1 |  |
| 2026-10-23 03:28 | 20 | persona opus none/voice | claude-opus-5-5 | 165 | 817 | $0.01700 | 9.9 |  |
| 2026-10-23 03:28 | 21 | persona opus sham/voice | claude-opus-5-5 | 2378 | 819 | $0.02589 | 11.4 |  |
| 2026-10-23 03:28 | 22 | persona opus sham/recollection | claude-opus-5-5 | 2051 | 419 | $0.01658 | 5.1 |  |
| 2026-10-23 03:28 | 23 | persona opus none/recollection | claude-opus-5-5 | 100 | 521 | $0.01082 | 7.2 |  |
| 2026-10-23 03:28 | 24 | persona sonnet journal/transfer | claude-sonnet-5-5 | 916 | 651 | $0.00834 | 6.5 |  |
| 2026-10-23 03:28 | 25 | persona sonnet summary/transfer | claude-sonnet-5-5 | 908 | 594 | $0.00776 | 6.7 |  |
| 2026-10-23 03:28 | 26 | persona sonnet rewrite/transfer | claude-sonnet-5-5 | 869 | 659 | $0.00833 | 6.8 |  |
| 2026-10-23 03:28 | 27 | persona sonnet none/transfer | claude-sonnet-5-5 | 141 | 608 | $0.00636 | 7.2 |  |
| 2026-10-23 03:28 | 28 | persona sonnet sham/transfer | claude-sonnet-5-5 | 821 | 594 | $0.00758 | 7.2 |  |
| 2026-10-23 03:28 | 29 | persona sonnet journal/thought | claude-sonnet-5-5 | 2338 | 670 | $0.01138 | 7.6 |  |
| 2026-10-23 03:28 | 30 | persona sonnet summary/thought | claude-sonnet-5-5 | 2213 | 595 | $0.01038 | 6.9 |  |
| 2026-10-23 03:28 | 31 | persona sonnet rewrite/thought | claude-sonnet-5-5 | 2114 | 627 | $0.01050 | 6.8 |  |
| 2026-10-23 03:28 | 32 | persona sonnet none/thought | claude-sonnet-5-5 | 125 | 602 | $0.00627 | 6.6 |  |
| 2026-10-23 03:28 | 33 | persona sonnet sham/thought | claude-sonnet-5-5 | 2124 | 715 | $0.01140 | 7.7 |  |
| 2026-10-23 03:28 | 34 | persona sonnet journal/voice | claude-sonnet-5-5 | 2116 | 752 | $0.01175 | 7.9 |  |
| 2026-10-23 03:28 | 35 | persona sonnet rewrite/voice | claude-sonnet-5-5 | 1833 | 754 | $0.01121 | 6.8 |  |
| 2026-10-23 03:28 | 36 | persona sonnet summary/voice | claude-sonnet-5-5 | 1914 | 828 | $0.01211 | 9 |  |
| 2026-10-23 03:28 | 37 | persona sonnet summary/recollection | claude-sonnet-5-5 | 1909 | 0 | $0.00382 | 0.9 |  |
| 2026-10-23 03:28 | 38 | persona sonnet summary/recollection | claude-sonnet-5-5 | 1909 | 0 | $0.00382 | 0.9 |  |
| 2026-10-23 03:28 | 39 | persona sonnet rewrite/recollection | claude-sonnet-5-5 | 1846 | 0 | $0.00369 | 1 |  |
| 2026-10-23 03:28 | 40 | persona sonnet journal/recollection | claude-sonnet-5-5 | 2099 | 471 | $0.00891 | 4.8 |  |
| 2026-10-23 03:28 | 41 | persona sonnet none/voice | claude-sonnet-5-5 | 165 | 745 | $0.00778 | 8 |  |
| 2026-10-23 03:28 | 42 | persona sonnet rewrite/recollection | claude-sonnet-5-5 | 1846 | 0 | $0.00369 | 1.1 |  |
| 2026-10-23 03:28 | 43 | persona sonnet sham/voice | claude-sonnet-5-5 | 2378 | 733 | $0.01209 | 8.5 |  |
| 2026-10-23 03:28 | 44 | persona sonnet none/recollection | claude-sonnet-5-5 | 100 | 261 | $0.00281 | 3.4 |  |
| 2026-10-23 03:28 | 45 | persona sonnet sham/recollection | claude-sonnet-5-5 | 2051 | 323 | $0.00733 | 4.2 |  |
| 2026-10-23 03:28 | 46 | judge 1 recollection | claude-haiku-5-5 | 2872 | 104 | $0.00034 | 0.8 |  |
| 2026-10-23 03:28 | 47 | judge 1 recollection | claude-haiku-5-5 | 2881 | 136 | $0.00036 | 1 |  |
| 2026-10-23 03:28 | 48 | judge 2 recollection | claude-haiku-5-5 | 2872 | 106 | $0.00034 | 1 |  |
| 2026-10-23 03:28 | 49 | judge 2 recollection | claude-haiku-5-5 | 2881 | 145 | $0.00036 | 1.1 |  |
| 2026-10-23 03:28 | 50 | judge 2 thought | claude-haiku-5-5 | 1240 | 132 | $0.00019 | 1.1 |  |
| 2026-10-23 03:28 | 51 | judge 2 thought | claude-haiku-5-5 | 1293 | 116 | $0.00019 | 1.1 |  |
| 2026-10-23 03:28 | 52 | judge 1 thought | claude-haiku-5-5 | 1240 | 138 | $0.00019 | 1.2 |  |
| 2026-10-23 03:28 | 53 | judge 1 thought | claude-haiku-5-5 | 1293 | 151 | $0.00020 | 1.7 |  |
| 2026-10-23 03:28 | 54 | judge 1 transfer | claude-haiku-5-5 | 993 | 107 | $0.00015 | 0.9 |  |
| 2026-10-23 03:28 | 55 | judge 2 transfer | claude-haiku-5-5 | 993 | 118 | $0.00016 | 0.9 |  |
| 2026-10-23 03:28 | 56 | judge 1 recollection | claude-haiku-5-5 | 2945 | 130 | $0.00036 | 1 |  |
| 2026-10-23 03:28 | 57 | judge 2 recollection | claude-haiku-5-5 | 2945 | 130 | $0.00036 | 1.1 |  |
| 2026-10-23 03:28 | 58 | judge 1 thought | claude-haiku-5-5 | 1377 | 126 | $0.00020 | 1.7 |  |
| 2026-10-23 03:28 | 59 | judge 1 transfer | claude-haiku-5-5 | 957 | 118 | $0.00015 | 1.2 |  |
| 2026-10-23 03:28 | 60 | judge 2 thought | claude-haiku-5-5 | 1377 | 131 | $0.00020 | 1.7 |  |
| 2026-10-23 03:28 | 61 | judge 1 thought | claude-haiku-5-5 | 1345 | 131 | $0.00020 | 1.9 |  |
| 2026-10-23 03:28 | 62 | judge 2 transfer | claude-haiku-5-5 | 957 | 135 | $0.00016 | 1.6 |  |
| 2026-10-23 03:28 | 63 | judge 2 thought | claude-haiku-5-5 | 1345 | 143 | $0.00021 | 2.2 |  |
| 2026-10-23 03:28 | 64 | judge 2 voice | claude-haiku-5-5 | 1122 | 106 | $0.00017 | 0.8 |  |
| 2026-10-23 03:28 | 65 | judge 1 voice | claude-haiku-5-5 | 1122 | 128 | $0.00018 | 0.8 |  |
| 2026-10-23 03:28 | 66 | judge 2 voice | claude-haiku-5-5 | 1112 | 113 | $0.00017 | 0.8 |  |
| 2026-10-23 03:28 | 67 | judge 1 voice | claude-haiku-5-5 | 1112 | 89 | $0.00016 | 0.9 |  |
| 2026-10-23 03:28 | 68 | referee recollection | claude-opus-5-5 | 2881 | 293 | $0.01738 | 3.8 |  |
| 2026-10-23 03:28 | 69 | judge 2 thought | claude-haiku-5-5 | 1352 | 119 | $0.00019 | 1 |  |
| 2026-10-23 03:28 | 70 | judge 1 thought | claude-haiku-5-5 | 1352 | 125 | $0.00020 | 1.1 |  |
| 2026-10-23 03:28 | 71 | judge 1 transfer | claude-haiku-5-5 | 1034 | 107 | $0.00016 | 0.9 |  |
| 2026-10-23 03:28 | 72 | judge 2 transfer | claude-haiku-5-5 | 1034 | 87 | $0.00015 | 0.9 |  |
| 2026-10-23 03:28 | 73 | judge 2 transfer | claude-haiku-5-5 | 1020 | 116 | $0.00016 | 1.1 |  |
| 2026-10-23 03:28 | 74 | judge 1 voice | claude-haiku-5-5 | 1106 | 105 | $0.00016 | 1.7 |  |
| 2026-10-23 03:28 | 75 | judge 2 voice | claude-haiku-5-5 | 1106 | 127 | $0.00017 | 2.1 |  |
| 2026-10-23 03:28 | 76 | judge 1 thought | claude-haiku-5-5 | 1333 | 145 | $0.00021 | 1.1 |  |
| 2026-10-23 03:28 | 77 | judge 1 transfer | claude-haiku-5-5 | 1020 | 102 | $0.00015 | 1.8 |  |
| 2026-10-23 03:28 | 78 | judge 2 voice | claude-haiku-5-5 | 1000 | 121 | $0.00016 | 1 |  |
| 2026-10-23 03:28 | 79 | judge 1 voice | claude-haiku-5-5 | 1000 | 124 | $0.00016 | 1.1 |  |
| 2026-10-23 03:28 | 80 | judge 2 thought | claude-haiku-5-5 | 1333 | 136 | $0.00020 | 1.6 |  |
| 2026-10-23 03:28 | 81 | judge 1 thought | claude-haiku-5-5 | 1344 | 123 | $0.00020 | 1.1 |  |
| 2026-10-23 03:28 | 82 | judge 2 transfer | claude-haiku-5-5 | 1026 | 96 | $0.00015 | 0.9 |  |
| 2026-10-23 03:28 | 83 | judge 1 transfer | claude-haiku-5-5 | 1026 | 121 | $0.00016 | 0.9 |  |
| 2026-10-23 03:28 | 84 | judge 2 recollection | claude-haiku-5-5 | 2800 | 86 | $0.00032 | 0.8 |  |
| 2026-10-23 03:28 | 85 | judge 1 recollection | claude-haiku-5-5 | 2800 | 81 | $0.00032 | 0.8 |  |
| 2026-10-23 03:28 | 86 | judge 2 thought | claude-haiku-5-5 | 1344 | 129 | $0.00020 | 1.7 |  |
| 2026-10-23 03:28 | 87 | judge 1 thought | claude-haiku-5-5 | 1200 | 141 | $0.00019 | 1.3 |  |
| 2026-10-23 03:28 | 88 | judge 2 thought | claude-haiku-5-5 | 1235 | 115 | $0.00018 | 1 |  |
| 2026-10-23 03:28 | 89 | judge 1 transfer | claude-haiku-5-5 | 1007 | 105 | $0.00015 | 0.9 |  |
| 2026-10-23 03:28 | 90 | judge 2 transfer | claude-haiku-5-5 | 1007 | 102 | $0.00015 | 0.9 |  |
| 2026-10-23 03:28 | 91 | judge 1 thought | claude-haiku-5-5 | 1235 | 156 | $0.00020 | 1.2 |  |
| 2026-10-23 03:28 | 92 | judge 2 thought | claude-haiku-5-5 | 1200 | 146 | $0.00019 | 1.8 |  |
| 2026-10-23 03:28 | 93 | judge 1 voice | claude-haiku-5-5 | 1014 | 100 | $0.00015 | 1 |  |
| 2026-10-23 03:28 | 94 | judge 2 voice | claude-haiku-5-5 | 1014 | 119 | $0.00016 | 1 |  |
| 2026-10-23 03:28 | 95 | judge 1 voice | claude-haiku-5-5 | 1126 | 113 | $0.00017 | 0.9 |  |
| 2026-10-23 03:28 | 96 | judge 2 voice | claude-haiku-5-5 | 1048 | 94 | $0.00015 | 0.8 |  |
| 2026-10-23 03:28 | 97 | judge 2 transfer | claude-haiku-5-5 | 1003 | 115 | $0.00016 | 1.1 |  |
| 2026-10-23 03:28 | 98 | judge 1 transfer | claude-haiku-5-5 | 1003 | 119 | $0.00016 | 1.3 |  |
| 2026-10-23 03:28 | 99 | judge 2 voice | claude-haiku-5-5 | 1126 | 107 | $0.00017 | 1.4 |  |
| 2026-10-23 03:28 | 100 | judge 1 voice | claude-haiku-5-5 | 1196 | 130 | $0.00018 | 1.7 |  |
| 2026-10-23 03:28 | 101 | judge 2 voice | claude-haiku-5-5 | 1196 | 135 | $0.00019 | 1.8 |  |
| 2026-10-23 03:28 | 102 | judge 2 transfer | claude-haiku-5-5 | 968 | 124 | $0.00016 | 1.1 |  |
| 2026-10-23 03:28 | 103 | judge 1 transfer | claude-haiku-5-5 | 968 | 83 | $0.00014 | 1.1 |  |
| 2026-10-23 03:28 | 104 | judge 1 voice | claude-haiku-5-5 | 1048 | 113 | $0.00016 | 2.3 |  |
| 2026-10-23 03:28 | 105 | judge 1 thought | claude-haiku-5-5 | 1196 | 129 | $0.00018 | 1.3 |  |
| 2026-10-23 03:28 | 106 | judge 1 recollection | claude-haiku-5-5 | 2984 | 77 | $0.00034 | 0.9 |  |
| 2026-10-23 03:28 | 107 | judge 2 recollection | claude-haiku-5-5 | 2984 | 79 | $0.00034 | 0.9 |  |
| 2026-10-23 03:28 | 108 | judge 1 transfer | claude-haiku-5-5 | 1003 | 91 | $0.00015 | 1 |  |
| 2026-10-23 03:28 | 109 | judge 2 thought | claude-haiku-5-5 | 1196 | 125 | $0.00018 | 2.2 |  |
| 2026-10-23 03:28 | 110 | judge 2 transfer | claude-haiku-5-5 | 1003 | 103 | $0.00015 | 1 |  |
| 2026-10-23 03:28 | 111 | judge 2 voice | claude-haiku-5-5 | 1033 | 95 | $0.00015 | 0.8 |  |
| 2026-10-23 03:28 | 112 | judge 1 voice | claude-haiku-5-5 | 1033 | 117 | $0.00016 | 1 |  |
| 2026-10-23 03:28 | 113 | judge 1 transfer | claude-haiku-5-5 | 1007 | 89 | $0.00015 | 0.8 |  |
| 2026-10-23 03:28 | 114 | judge 2 transfer | claude-haiku-5-5 | 1007 | 90 | $0.00015 | 1.2 |  |
| 2026-10-23 03:28 | 115 | judge 2 voice | claude-haiku-5-5 | 1035 | 309 | $0.00026 | 2.1 |  |
| 2026-10-23 03:28 | 116 | judge 1 voice | claude-haiku-5-5 | 1035 | 346 | $0.00028 | 2.2 |  |
| 2026-10-23 03:28 | 1 | diagnostic journal long recollection (repeat) | claude-opus-5-5 | 2099 | 0 | $0.00840 | 1.2 |  |
| 2026-10-23 03:28 | 2 | diagnostic journal short recollection | claude-opus-5-5 | 780 | 437 | $0.01186 | 6.2 |  |
| 2026-10-23 03:28 | 3 | diagnostic journal long thought | claude-opus-5-5 | 2112 | 662 | $0.02169 | 8.5 |  |
| 2026-10-23 03:28 | 4 | diagnostic journal long transfer | claude-opus-5-5 | 2128 | 310 | $0.01471 | 4.5 |  |
| 2026-10-23 03:29 | 1 | diagnostic long minus entries 1-10 | claude-opus-5-5 | 1131 | 410 | $0.01272 | 5.6 |  |
| 2026-10-23 03:29 | 2 | diagnostic long minus entries 11-20 | claude-opus-5-5 | 1292 | 523 | $0.01563 | 6.3 |  |
| 2026-10-23 03:35 | 1 | persona opus journal/transfer | claude-opus-5-5 | 2084 | 403 | $0.01640 | 6.1 |  |
| 2026-10-23 03:35 | 2 | persona opus summary/transfer | claude-opus-5-5 | 908 | 510 | $0.01383 | 6.8 |  |
| 2026-10-23 03:35 | 3 | persona opus sham/transfer | claude-opus-5-5 | 821 | 493 | $0.01314 | 7 |  |
| 2026-10-23 03:35 | 4 | persona opus journal/transfer | claude-opus-5-5 | 916 | 509 | $0.01384 | 7.1 |  |
| 2026-10-23 03:35 | 5 | persona opus none/transfer | claude-opus-5-5 | 141 | 585 | $0.01226 | 7.7 |  |
| 2026-10-23 03:35 | 6 | persona opus rewrite/transfer | claude-opus-5-5 | 869 | 683 | $0.01714 | 9.6 |  |
| 2026-10-23 03:35 | 7 | persona opus journal/transfer | claude-opus-5-5 | 2128 | 300 | $0.01451 | 4.2 |  |
| 2026-10-23 03:35 | 8 | persona opus rewrite/transfer | claude-opus-5-5 | 1801 | 469 | $0.01658 | 7 |  |
| 2026-10-23 03:35 | 9 | persona opus summary/transfer | claude-opus-5-5 | 1882 | 528 | $0.01809 | 8.2 |  |
| 2026-10-23 03:35 | 10 | persona opus summary/transfer | claude-opus-5-5 | 1938 | 317 | $0.01409 | 5.1 |  |
| 2026-10-23 03:35 | 11 | persona opus none/transfer | claude-opus-5-5 | 133 | 622 | $0.01297 | 7.9 |  |
| 2026-10-23 03:35 | 12 | persona opus sham/transfer | claude-opus-5-5 | 2346 | 610 | $0.02158 | 8.5 |  |
| 2026-10-23 03:35 | 13 | persona opus rewrite/transfer | claude-opus-5-5 | 1875 | 389 | $0.01528 | 5.3 |  |
| 2026-10-23 03:35 | 14 | persona opus none/transfer | claude-opus-5-5 | 129 | 242 | $0.00536 | 4 |  |
| 2026-10-23 03:35 | 15 | persona opus sham/transfer | claude-opus-5-5 | 2080 | 307 | $0.01446 | 4.6 |  |
| 2026-10-23 03:35 | 16 | persona opus journal/transfer | claude-opus-5-5 | 2354 | 590 | $0.02122 | 7.4 |  |
| 2026-10-23 03:35 | 17 | persona opus rewrite/transfer | claude-opus-5-5 | 2130 | 531 | $0.01914 | 7.3 |  |
| 2026-10-23 03:35 | 18 | persona opus journal/transfer | claude-opus-5-5 | 809 | 266 | $0.00856 | 4.4 |  |
| 2026-10-23 03:35 | 19 | persona opus summary/transfer | claude-opus-5-5 | 2229 | 680 | $0.02252 | 9.1 |  |
| 2026-10-23 03:35 | 20 | persona opus none/transfer | claude-opus-5-5 | 141 | 491 | $0.01038 | 7 |  |
| 2026-10-23 03:35 | 21 | persona opus sham/transfer | claude-opus-5-5 | 2140 | 470 | $0.01796 | 6.6 |  |
| 2026-10-23 03:35 | 22 | persona opus summary/transfer | claude-opus-5-5 | 773 | 300 | $0.00909 | 4.1 |  |
| 2026-10-23 03:35 | 23 | persona opus rewrite/transfer | claude-opus-5-5 | 749 | 331 | $0.00962 | 4.1 |  |
| 2026-10-23 03:35 | 24 | persona opus none/transfer | claude-opus-5-5 | 129 | 254 | $0.00560 | 4 |  |
| 2026-10-23 03:35 | 25 | persona opus sham/transfer | claude-opus-5-5 | 805 | 358 | $0.01038 | 4.9 |  |
| 2026-10-23 03:35 | 26 | persona opus journal/transfer | claude-opus-5-5 | 809 | 370 | $0.01064 | 6.1 |  |
| 2026-10-23 03:35 | 27 | persona opus summary/transfer | claude-opus-5-5 | 774 | 558 | $0.01426 | 8.2 |  |
| 2026-10-23 03:35 | 28 | persona opus rewrite/transfer | claude-opus-5-5 | 744 | 383 | $0.01064 | 6.9 |  |
| 2026-10-23 03:35 | 29 | persona opus none/transfer | claude-opus-5-5 | 133 | 602 | $0.01257 | 7.3 |  |
| 2026-10-23 03:35 | 30 | persona opus sham/transfer | claude-opus-5-5 | 908 | 591 | $0.01545 | 7.1 |  |
| 2026-10-23 03:35 | 31 | persona opus journal/transfer | claude-opus-5-5 | 809 | 400 | $0.01124 | 6.4 |  |
| 2026-10-23 03:35 | 32 | persona opus summary/transfer | claude-opus-5-5 | 774 | 506 | $0.01322 | 7.6 |  |
| 2026-10-23 03:35 | 33 | persona opus none/transfer | claude-opus-5-5 | 133 | 485 | $0.01023 | 5.8 |  |
| 2026-10-23 03:35 | 34 | persona opus sham/transfer | claude-opus-5-5 | 908 | 342 | $0.01047 | 5.1 |  |
| 2026-10-23 03:35 | 35 | persona opus rewrite/transfer | claude-opus-5-5 | 744 | 584 | $0.01466 | 9.8 |  |
| 2026-10-23 03:35 | 36 | persona opus journal/transfer | claude-opus-5-5 | 2354 | 666 | $0.02274 | 8.5 |  |
| 2026-10-23 03:35 | 37 | persona opus summary/transfer | claude-opus-5-5 | 2229 | 759 | $0.02410 | 9.2 |  |
| 2026-10-23 03:35 | 38 | persona opus rewrite/transfer | claude-opus-5-5 | 2130 | 555 | $0.01962 | 7.4 |  |
| 2026-10-23 03:35 | 39 | persona opus sham/transfer | claude-opus-5-5 | 2140 | 492 | $0.01840 | 6.7 |  |
| 2026-10-23 03:35 | 40 | persona opus none/transfer | claude-opus-5-5 | 141 | 528 | $0.01112 | 7.5 |  |
| 2026-10-23 03:35 | 41 | persona opus journal/transfer | claude-opus-5-5 | 2128 | 452 | $0.01755 | 6 |  |
| 2026-10-23 03:35 | 42 | persona opus summary/transfer | claude-opus-5-5 | 1938 | 462 | $0.01699 | 6.1 |  |
| 2026-10-23 03:35 | 43 | persona opus none/transfer | claude-opus-5-5 | 129 | 250 | $0.00552 | 3.9 |  |
| 2026-10-23 03:35 | 44 | persona opus rewrite/transfer | claude-opus-5-5 | 1875 | 402 | $0.01554 | 5.9 |  |
| 2026-10-23 03:35 | 45 | persona opus sham/transfer | claude-opus-5-5 | 2080 | 370 | $0.01572 | 4.9 |  |
| 2026-10-23 03:35 | 46 | persona opus rewrite/transfer | claude-opus-5-5 | 749 | 308 | $0.00916 | 4.1 |  |
| 2026-10-23 03:35 | 47 | persona opus none/transfer | claude-opus-5-5 | 129 | 265 | $0.00582 | 4.1 |  |
| 2026-10-23 03:35 | 48 | persona opus summary/transfer | claude-opus-5-5 | 773 | 353 | $0.01015 | 5 |  |
| 2026-10-23 03:35 | 49 | persona opus journal/transfer | claude-opus-5-5 | 809 | 232 | $0.00788 | 7.3 |  |
| 2026-10-23 03:35 | 50 | persona opus sham/transfer | claude-opus-5-5 | 805 | 353 | $0.01028 | 5.2 |  |
| 2026-10-23 03:35 | 51 | persona opus journal/thought | claude-opus-5-5 | 2338 | 522 | $0.01979 | 7.5 |  |
| 2026-10-23 03:35 | 52 | persona opus summary/thought | claude-opus-5-5 | 2213 | 492 | $0.01869 | 6.5 |  |
| 2026-10-23 03:35 | 53 | persona opus rewrite/thought | claude-opus-5-5 | 2114 | 531 | $0.01908 | 7.3 |  |
| 2026-10-23 03:35 | 54 | persona opus sham/thought | claude-opus-5-5 | 2124 | 526 | $0.01902 | 7.2 |  |
| 2026-10-23 03:35 | 55 | persona opus none/thought | claude-opus-5-5 | 125 | 678 | $0.01406 | 8.9 |  |
| 2026-10-23 03:35 | 56 | persona opus journal/thought | claude-opus-5-5 | 2098 | 614 | $0.02067 | 9 |  |
| 2026-10-23 03:35 | 57 | persona opus rewrite/thought | claude-opus-5-5 | 1815 | 421 | $0.01568 | 6.1 |  |
| 2026-10-23 03:35 | 58 | persona opus summary/thought | claude-opus-5-5 | 1896 | 561 | $0.01880 | 7.3 |  |
| 2026-10-23 03:35 | 59 | persona opus sham/thought | claude-opus-5-5 | 2360 | 502 | $0.01948 | 7 |  |
| 2026-10-23 03:35 | 60 | persona opus none/thought | claude-opus-5-5 | 147 | 453 | $0.00965 | 8.8 |  |
| 2026-10-23 03:35 | 61 | persona opus journal/thought | claude-opus-5-5 | 900 | 634 | $0.01628 | 9.1 |  |
| 2026-10-23 03:35 | 62 | persona opus none/thought | claude-opus-5-5 | 125 | 531 | $0.01112 | 6.9 |  |
| 2026-10-23 03:35 | 63 | persona opus summary/thought | claude-opus-5-5 | 892 | 700 | $0.01757 | 9.7 |  |
| 2026-10-23 03:35 | 64 | persona opus sham/thought | claude-opus-5-5 | 805 | 543 | $0.01408 | 8.1 |  |
| 2026-10-23 03:35 | 65 | persona opus rewrite/thought | claude-opus-5-5 | 853 | 511 | $0.01363 | 11.2 |  |
| 2026-10-23 03:35 | 66 | persona opus journal/thought | claude-opus-5-5 | 2112 | 691 | $0.02227 | 9 |  |
| 2026-10-23 03:35 | 67 | persona opus none/thought | claude-opus-5-5 | 113 | 453 | $0.00951 | 5.9 |  |
| 2026-10-23 03:35 | 68 | persona opus summary/thought | claude-opus-5-5 | 1922 | 581 | $0.01931 | 9.2 |  |
| 2026-10-23 03:35 | 69 | persona opus rewrite/thought | claude-opus-5-5 | 1859 | 547 | $0.01838 | 8 |  |
| 2026-10-23 03:35 | 70 | persona opus sham/thought | claude-opus-5-5 | 2064 | 512 | $0.01850 | 7.7 |  |
| 2026-10-23 03:35 | 71 | persona opus journal/thought | claude-opus-5-5 | 793 | 535 | $0.01387 | 8 |  |
| 2026-10-23 03:35 | 72 | persona opus none/thought | claude-opus-5-5 | 113 | 471 | $0.00987 | 6.4 |  |
| 2026-10-23 03:35 | 73 | persona opus summary/thought | claude-opus-5-5 | 757 | 602 | $0.01507 | 9.6 |  |
| 2026-10-23 03:35 | 74 | persona opus sham/thought | claude-opus-5-5 | 789 | 487 | $0.01290 | 7.2 |  |
| 2026-10-23 03:35 | 75 | persona opus rewrite/thought | claude-opus-5-5 | 733 | 624 | $0.01541 | 8.3 |  |
| 2026-10-23 03:35 | 76 | persona opus summary/thought | claude-opus-5-5 | 788 | 531 | $0.01377 | 7.1 |  |
| 2026-10-23 03:35 | 77 | persona opus none/thought | claude-opus-5-5 | 147 | 430 | $0.00919 | 5.9 |  |
| 2026-10-23 03:35 | 78 | persona opus rewrite/thought | claude-opus-5-5 | 758 | 492 | $0.01287 | 7.2 |  |
| 2026-10-23 03:35 | 79 | persona opus journal/thought | claude-opus-5-5 | 823 | 532 | $0.01393 | 11.3 |  |
| 2026-10-23 03:35 | 80 | persona opus sham/thought | claude-opus-5-5 | 922 | 461 | $0.01291 | 7.4 |  |
| 2026-10-23 03:35 | 81 | persona opus journal/thought | claude-opus-5-5 | 2338 | 541 | $0.02017 | 7.6 |  |
| 2026-10-23 03:35 | 82 | persona opus summary/thought | claude-opus-5-5 | 2213 | 523 | $0.01931 | 7.6 |  |
| 2026-10-23 03:35 | 83 | persona opus none/thought | claude-opus-5-5 | 125 | 545 | $0.01140 | 6.9 |  |
| 2026-10-23 03:35 | 84 | persona opus rewrite/thought | claude-opus-5-5 | 2114 | 703 | $0.02252 | 9.7 |  |
| 2026-10-23 03:35 | 85 | persona opus summary/thought | claude-opus-5-5 | 788 | 541 | $0.01397 | 7.4 |  |
| 2026-10-23 03:35 | 86 | persona opus sham/thought | claude-opus-5-5 | 2124 | 678 | $0.02206 | 8.8 |  |
| 2026-10-23 03:35 | 87 | persona opus journal/thought | claude-opus-5-5 | 823 | 546 | $0.01421 | 11.2 |  |
| 2026-10-23 03:35 | 88 | persona opus rewrite/thought | claude-opus-5-5 | 758 | 493 | $0.01289 | 8.3 |  |
| 2026-10-23 03:35 | 89 | persona opus none/thought | claude-opus-5-5 | 147 | 476 | $0.01011 | 7.4 |  |
| 2026-10-23 03:35 | 90 | persona opus none/thought | claude-opus-5-5 | 113 | 438 | $0.00921 | 6.2 |  |
| 2026-10-23 03:35 | 91 | persona opus journal/thought | claude-opus-5-5 | 793 | 530 | $0.01377 | 10.8 |  |
| 2026-10-23 03:35 | 92 | persona opus sham/thought | claude-opus-5-5 | 922 | 638 | $0.01645 | 11.9 |  |
| 2026-10-23 03:35 | 93 | persona opus summary/thought | claude-opus-5-5 | 757 | 502 | $0.01307 | 11.6 |  |
| 2026-10-23 03:35 | 94 | persona opus sham/thought | claude-opus-5-5 | 789 | 443 | $0.01202 | 7.1 |  |
| 2026-10-23 03:35 | 95 | persona opus rewrite/thought | claude-opus-5-5 | 733 | 687 | $0.01667 | 13 |  |
| 2026-10-23 03:35 | 96 | persona opus journal/thought | claude-opus-5-5 | 900 | 526 | $0.01412 | 8.4 |  |
| 2026-10-23 03:35 | 97 | persona opus summary/thought | claude-opus-5-5 | 892 | 612 | $0.01581 | 8.5 |  |
| 2026-10-23 03:35 | 98 | persona opus none/thought | claude-opus-5-5 | 125 | 575 | $0.01200 | 7.9 |  |
| 2026-10-23 03:35 | 99 | persona opus rewrite/thought | claude-opus-5-5 | 853 | 563 | $0.01467 | 9.3 |  |
| 2026-10-23 03:35 | 100 | persona opus sham/thought | claude-opus-5-5 | 805 | 555 | $0.01432 | 11.6 |  |
| 2026-10-23 03:35 | 101 | persona opus journal/voice | claude-opus-5-5 | 2116 | 764 | $0.02374 | 10.3 |  |
| 2026-10-23 03:35 | 102 | persona opus summary/voice | claude-opus-5-5 | 1914 | 633 | $0.02032 | 9 |  |
| 2026-10-23 03:35 | 103 | persona opus none/voice | claude-opus-5-5 | 165 | 727 | $0.01520 | 9.1 |  |
| 2026-10-23 03:35 | 104 | persona opus rewrite/voice | claude-opus-5-5 | 1833 | 727 | $0.02187 | 10.5 |  |
| 2026-10-23 03:35 | 105 | persona opus sham/voice | claude-opus-5-5 | 2378 | 756 | $0.02463 | 9.9 |  |
| 2026-10-23 03:35 | 106 | persona opus journal/voice | claude-opus-5-5 | 2380 | 710 | $0.02372 | 8.4 |  |
| 2026-10-23 03:35 | 107 | persona opus none/voice | claude-opus-5-5 | 167 | 644 | $0.01355 | 8.8 |  |
| 2026-10-23 03:35 | 108 | persona opus sham/voice | claude-opus-5-5 | 2166 | 593 | $0.02052 | 8.1 |  |
| 2026-10-23 03:35 | 109 | persona opus summary/voice | claude-opus-5-5 | 2255 | 1064 | $0.03030 | 12.8 |  |
| 2026-10-23 03:35 | 110 | persona opus journal/voice | claude-opus-5-5 | 2146 | 638 | $0.02134 | 8.8 |  |
| 2026-10-23 03:35 | 111 | persona opus rewrite/voice | claude-opus-5-5 | 2156 | 1096 | $0.03054 | 12.4 |  |
| 2026-10-23 03:35 | 112 | persona opus summary/voice | claude-opus-5-5 | 1956 | 723 | $0.02228 | 9.9 |  |
| 2026-10-23 03:35 | 113 | persona opus none/voice | claude-opus-5-5 | 147 | 576 | $0.01211 | 8 |  |
| 2026-10-23 03:35 | 114 | persona opus sham/voice | claude-opus-5-5 | 2098 | 524 | $0.01887 | 7.5 |  |
| 2026-10-23 03:35 | 115 | persona opus rewrite/voice | claude-opus-5-5 | 1893 | 693 | $0.02143 | 9.5 |  |
| 2026-10-23 03:35 | 116 | persona opus journal/voice | claude-opus-5-5 | 841 | 748 | $0.01832 | 10.2 |  |
| 2026-10-23 03:35 | 117 | persona opus rewrite/voice | claude-opus-5-5 | 776 | 609 | $0.01528 | 8.9 |  |
| 2026-10-23 03:35 | 118 | persona opus summary/voice | claude-opus-5-5 | 806 | 753 | $0.01828 | 11.1 |  |
| 2026-10-23 03:35 | 119 | persona opus journal/voice | claude-opus-5-5 | 827 | 595 | $0.01521 | 8.3 |  |
| 2026-10-23 03:35 | 120 | persona opus none/voice | claude-opus-5-5 | 165 | 832 | $0.01730 | 10.7 |  |
| 2026-10-23 03:35 | 121 | persona opus summary/voice | claude-opus-5-5 | 791 | 574 | $0.01464 | 8 |  |
| 2026-10-23 03:35 | 122 | persona opus rewrite/voice | claude-opus-5-5 | 767 | 513 | $0.01333 | 7.6 |  |
| 2026-10-23 03:35 | 123 | persona opus sham/voice | claude-opus-5-5 | 940 | 764 | $0.01904 | 13.3 |  |
| 2026-10-23 03:35 | 124 | persona opus none/voice | claude-opus-5-5 | 147 | 603 | $0.01265 | 8.6 |  |
| 2026-10-23 03:35 | 125 | persona opus journal/voice | claude-opus-5-5 | 942 | 586 | $0.01549 | 8.1 |  |
| 2026-10-23 03:35 | 126 | persona opus sham/voice | claude-opus-5-5 | 823 | 653 | $0.01635 | 9.9 |  |
| 2026-10-23 03:35 | 127 | persona opus none/voice | claude-opus-5-5 | 167 | 545 | $0.01157 | 7.4 |  |
| 2026-10-23 03:35 | 128 | persona opus sham/voice | claude-opus-5-5 | 847 | 544 | $0.01427 | 7.5 |  |
| 2026-10-23 03:35 | 129 | persona opus summary/voice | claude-opus-5-5 | 934 | 832 | $0.02038 | 11.4 |  |
| 2026-10-23 03:35 | 130 | persona opus rewrite/voice | claude-opus-5-5 | 895 | 752 | $0.01862 | 13.9 |  |
| 2026-10-23 03:35 | 131 | persona opus journal/voice | claude-opus-5-5 | 841 | 626 | $0.01588 | 8.4 |  |
| 2026-10-23 03:35 | 132 | persona opus summary/voice | claude-opus-5-5 | 806 | 664 | $0.01650 | 9 |  |
| 2026-10-23 03:35 | 133 | persona opus none/voice | claude-opus-5-5 | 165 | 725 | $0.01516 | 9.5 |  |
| 2026-10-23 03:35 | 134 | persona opus sham/voice | claude-opus-5-5 | 940 | 772 | $0.01920 | 10.5 |  |
| 2026-10-23 03:35 | 135 | persona opus rewrite/voice | claude-opus-5-5 | 776 | 668 | $0.01646 | 12.7 |  |
| 2026-10-23 03:35 | 136 | persona opus summary/voice | claude-opus-5-5 | 791 | 643 | $0.01602 | 8 |  |
| 2026-10-23 03:35 | 137 | persona opus none/voice | claude-opus-5-5 | 147 | 569 | $0.01197 | 7.9 |  |
| 2026-10-23 03:35 | 138 | persona opus journal/voice | claude-opus-5-5 | 827 | 630 | $0.01591 | 13.3 |  |
| 2026-10-23 03:35 | 139 | persona opus rewrite/voice | claude-opus-5-5 | 767 | 584 | $0.01475 | 12.8 |  |
| 2026-10-23 03:35 | 140 | persona opus sham/voice | claude-opus-5-5 | 823 | 531 | $0.01391 | 8.2 |  |
| 2026-10-23 03:35 | 141 | persona opus journal/voice | claude-opus-5-5 | 942 | 435 | $0.01247 | 9.1 |  |
| 2026-10-23 03:35 | 142 | persona opus none/voice | claude-opus-5-5 | 167 | 518 | $0.01103 | 7.3 |  |
| 2026-10-23 03:35 | 143 | persona opus sham/voice | claude-opus-5-5 | 847 | 543 | $0.01425 | 7.5 |  |
| 2026-10-23 03:35 | 144 | persona opus summary/voice | claude-opus-5-5 | 934 | 787 | $0.01948 | 14.1 |  |
| 2026-10-23 03:35 | 145 | persona opus journal/voice | claude-opus-5-5 | 2116 | 572 | $0.01990 | 7.5 |  |
| 2026-10-23 03:35 | 146 | persona opus rewrite/voice | claude-opus-5-5 | 895 | 808 | $0.01974 | 11 |  |
| 2026-10-23 03:35 | 147 | persona opus journal/recollection | claude-opus-5-5 | 2099 | 0 | $0.00840 | 1 |  |
| 2026-10-23 03:35 | 148 | persona opus summary/recollection | claude-opus-5-5 | 1909 | 0 | $0.00764 | 0.7 |  |
| 2026-10-23 03:35 | 149 | persona opus summary/recollection | claude-opus-5-5 | 1909 | 0 | $0.00764 | 0.6 |  |
| 2026-10-23 03:35 | 150 | persona opus journal/recollection | claude-opus-5-5 | 2099 | 0 | $0.00840 | 0.9 |  |
| 2026-10-23 03:35 | 151 | persona opus rewrite/recollection | claude-opus-5-5 | 1846 | 0 | $0.00738 | 1 |  |
| 2026-10-23 03:35 | 152 | persona opus summary/voice | claude-opus-5-5 | 1914 | 705 | $0.02176 | 9.6 |  |
| 2026-10-23 03:35 | 153 | persona opus rewrite/recollection | claude-opus-5-5 | 1846 | 0 | $0.00738 | 1.1 |  |
| 2026-10-23 03:35 | 154 | persona opus rewrite/voice | claude-opus-5-5 | 1833 | 657 | $0.02047 | 9.5 |  |
| 2026-10-23 03:35 | 155 | persona opus none/recollection | claude-opus-5-5 | 100 | 513 | $0.01066 | 6.9 |  |
| 2026-10-23 03:35 | 156 | persona opus sham/recollection | claude-opus-5-5 | 2051 | 378 | $0.01576 | 5.7 |  |
| 2026-10-23 03:35 | 157 | persona opus sham/voice | claude-opus-5-5 | 2378 | 682 | $0.02315 | 9.3 |  |
| 2026-10-23 03:35 | 158 | persona opus none/voice | claude-opus-5-5 | 165 | 811 | $0.01688 | 10.2 |  |
| 2026-10-23 03:35 | 159 | persona opus journal/recollection | claude-opus-5-5 | 875 | 448 | $0.01246 | 5.6 |  |
| 2026-10-23 03:35 | 160 | persona opus summary/recollection | claude-opus-5-5 | 867 | 531 | $0.01409 | 7.2 |  |
| 2026-10-23 03:35 | 161 | persona opus sham/recollection | claude-opus-5-5 | 780 | 340 | $0.00992 | 5.2 |  |
| 2026-10-23 03:35 | 162 | persona opus rewrite/recollection | claude-opus-5-5 | 2089 | 0 | $0.00836 | 0.7 |  |
| 2026-10-23 03:35 | 163 | persona opus rewrite/recollection | claude-opus-5-5 | 2089 | 0 | $0.00836 | 0.7 |  |
| 2026-10-23 03:35 | 164 | persona opus rewrite/recollection | claude-opus-5-5 | 828 | 514 | $0.01359 | 6.8 |  |
| 2026-10-23 03:35 | 165 | persona opus journal/recollection | claude-opus-5-5 | 2313 | 481 | $0.01887 | 6.4 |  |
| 2026-10-23 03:35 | 166 | persona opus summary/recollection | claude-opus-5-5 | 2188 | 520 | $0.01915 | 6.5 |  |
| 2026-10-23 03:35 | 167 | persona opus none/recollection | claude-opus-5-5 | 100 | 493 | $0.01026 | 7.7 |  |
| 2026-10-23 03:35 | 168 | persona opus rewrite/recollection | claude-opus-5-5 | 716 | 0 | $0.00286 | 0.7 |  |
| 2026-10-23 03:35 | 169 | persona opus rewrite/recollection | claude-opus-5-5 | 716 | 0 | $0.00286 | 0.8 |  |
| 2026-10-23 03:35 | 170 | persona opus sham/recollection | claude-opus-5-5 | 880 | 0 | $0.00352 | 0.6 |  |
| 2026-10-23 03:35 | 171 | persona opus summary/recollection | claude-opus-5-5 | 746 | 96 | $0.00490 | 2.7 |  |
| 2026-10-23 03:35 | 172 | persona opus sham/recollection | claude-opus-5-5 | 880 | 0 | $0.00352 | 0.6 |  |
| 2026-10-23 03:35 | 173 | persona opus none/recollection | claude-opus-5-5 | 100 | 399 | $0.00838 | 6 |  |
| 2026-10-23 03:35 | 174 | persona opus sham/recollection | claude-opus-5-5 | 2099 | 394 | $0.01628 | 5.2 |  |
| 2026-10-23 03:35 | 175 | persona opus rewrite/recollection | claude-opus-5-5 | 1773 | 0 | $0.00709 | 1.3 |  |
| 2026-10-23 03:35 | 176 | persona opus journal/recollection | claude-opus-5-5 | 781 | 548 | $0.01408 | 7.1 |  |
| 2026-10-23 03:35 | 177 | persona opus none/recollection | claude-opus-5-5 | 105 | 441 | $0.00924 | 6.6 |  |
| 2026-10-23 03:35 | 178 | persona opus summary/recollection | claude-opus-5-5 | 746 | 388 | $0.01074 | 6.4 |  |
| 2026-10-23 03:35 | 179 | persona opus journal/recollection | claude-opus-5-5 | 2056 | 501 | $0.01824 | 7 |  |
| 2026-10-23 03:35 | 180 | persona opus none/recollection | claude-opus-5-5 | 105 | 348 | $0.00738 | 5.1 |  |
| 2026-10-23 03:35 | 181 | persona opus sham/recollection | claude-opus-5-5 | 2318 | 359 | $0.01645 | 5 |  |
| 2026-10-23 03:35 | 182 | persona opus summary/recollection | claude-opus-5-5 | 1854 | 600 | $0.01942 | 8.4 |  |
| 2026-10-23 03:35 | 183 | persona opus rewrite/recollection | claude-opus-5-5 | 1773 | 564 | $0.01837 | 7.6 |  |
| 2026-10-23 03:35 | 184 | persona opus journal/recollection | claude-opus-5-5 | 780 | 430 | $0.01172 | 5 |  |
| 2026-10-23 03:35 | 185 | persona opus summary/recollection | claude-opus-5-5 | 744 | 0 | $0.00298 | 5.1 |  |
| 2026-10-23 03:35 | 186 | persona opus sham/recollection | claude-opus-5-5 | 776 | 263 | $0.00836 | 4.1 |  |
| 2026-10-23 03:35 | 187 | persona opus rewrite/recollection | claude-opus-5-5 | 2089 | 0 | $0.00836 | 0.7 |  |
| 2026-10-23 03:35 | 188 | persona opus rewrite/recollection | claude-opus-5-5 | 2089 | 0 | $0.00836 | 0.9 |  |
| 2026-10-23 03:35 | 189 | persona opus rewrite/recollection | claude-opus-5-5 | 720 | 544 | $0.01376 | 6.9 |  |
| 2026-10-23 03:35 | 190 | persona opus none/recollection | claude-opus-5-5 | 100 | 476 | $0.00992 | 7.1 |  |
| 2026-10-23 03:35 | 191 | persona opus summary/recollection | claude-opus-5-5 | 744 | 0 | $0.00298 | 5 |  |
| 2026-10-23 03:35 | 192 | persona opus journal/recollection | claude-opus-5-5 | 2099 | 0 | $0.00840 | 1 |  |
| 2026-10-23 03:35 | 193 | persona opus summary/recollection | claude-opus-5-5 | 1909 | 0 | $0.00764 | 0.6 |  |
| 2026-10-23 03:35 | 194 | persona opus summary/recollection | claude-opus-5-5 | 2188 | 482 | $0.01839 | 7.2 |  |
| 2026-10-23 03:35 | 195 | persona opus summary/recollection | claude-opus-5-5 | 1909 | 0 | $0.00764 | 0.7 |  |
| 2026-10-23 03:35 | 196 | persona opus journal/recollection | claude-opus-5-5 | 2313 | 524 | $0.01973 | 7.7 |  |
| 2026-10-23 03:35 | 197 | persona opus journal/recollection | claude-opus-5-5 | 2099 | 0 | $0.00840 | 1 |  |
| 2026-10-23 03:35 | 198 | persona opus rewrite/recollection | claude-opus-5-5 | 1846 | 0 | $0.00738 | 1.1 |  |
| 2026-10-23 03:35 | 199 | persona opus none/recollection | claude-opus-5-5 | 100 | 378 | $0.00796 | 5.7 |  |
| 2026-10-23 03:35 | 200 | persona opus sham/recollection | claude-opus-5-5 | 2099 | 405 | $0.01650 | 5.6 |  |
| 2026-10-23 03:35 | 201 | persona opus rewrite/recollection | claude-opus-5-5 | 828 | 0 | $0.00331 | 1.2 |  |
| 2026-10-23 03:35 | 202 | persona opus journal/recollection | claude-opus-5-5 | 875 | 389 | $0.01128 | 4.9 |  |
| 2026-10-23 03:35 | 203 | persona opus none/recollection | claude-opus-5-5 | 100 | 371 | $0.00782 | 5.1 |  |
| 2026-10-23 03:35 | 204 | persona opus sham/recollection | claude-opus-5-5 | 2051 | 410 | $0.01640 | 5.6 |  |
| 2026-10-23 03:35 | 205 | persona opus rewrite/recollection | claude-opus-5-5 | 1846 | 0 | $0.00738 | 6.5 |  |
| 2026-10-23 03:35 | 206 | persona opus sham/recollection | claude-opus-5-5 | 780 | 316 | $0.00944 | 4.6 |  |
| 2026-10-23 03:35 | 207 | persona opus rewrite/recollection | claude-opus-5-5 | 828 | 477 | $0.01285 | 5.9 |  |
| 2026-10-23 03:35 | 208 | persona opus summary/recollection | claude-opus-5-5 | 867 | 604 | $0.01555 | 7.6 |  |
| 2026-10-23 03:35 | 209 | persona opus none/recollection | claude-opus-5-5 | 100 | 400 | $0.00840 | 5.9 |  |
| 2026-10-23 03:35 | 210 | persona opus journal/recollection | claude-opus-5-5 | 2056 | 449 | $0.01720 | 6.2 |  |
| 2026-10-23 03:35 | 211 | persona opus rewrite/recollection | claude-opus-5-5 | 1773 | 88 | $0.00885 | 2.3 |  |
| 2026-10-23 03:35 | 212 | persona opus summary/recollection | claude-opus-5-5 | 1854 | 556 | $0.01854 | 7.6 |  |
| 2026-10-23 03:35 | 213 | persona opus sham/recollection | claude-opus-5-5 | 2318 | 386 | $0.01699 | 4.7 |  |
| 2026-10-23 03:35 | 214 | persona opus none/recollection | claude-opus-5-5 | 105 | 491 | $0.01024 | 6.4 |  |
| 2026-10-23 03:35 | 215 | persona sonnet journal/transfer | claude-sonnet-5-5 | 916 | 537 | $0.00720 | 6 |  |
| 2026-10-23 03:35 | 216 | persona sonnet summary/transfer | claude-sonnet-5-5 | 908 | 628 | $0.00810 | 6.7 |  |
| 2026-10-23 03:35 | 217 | persona opus rewrite/recollection | claude-opus-5-5 | 1773 | 556 | $0.01821 | 7.3 |  |
| 2026-10-23 03:35 | 218 | persona sonnet none/transfer | claude-sonnet-5-5 | 141 | 593 | $0.00621 | 6 |  |
| 2026-10-23 03:35 | 219 | persona sonnet rewrite/transfer | claude-sonnet-5-5 | 869 | 641 | $0.00815 | 8 |  |
| 2026-10-23 03:35 | 220 | persona sonnet sham/transfer | claude-sonnet-5-5 | 821 | 625 | $0.00789 | 6.8 |  |
| 2026-10-23 03:35 | 221 | persona sonnet journal/transfer | claude-sonnet-5-5 | 2084 | 658 | $0.01075 | 7.4 |  |
| 2026-10-23 03:35 | 222 | persona sonnet summary/transfer | claude-sonnet-5-5 | 1882 | 513 | $0.00889 | 5.9 |  |
| 2026-10-23 03:35 | 223 | persona sonnet rewrite/transfer | claude-sonnet-5-5 | 1801 | 580 | $0.00940 | 7.1 |  |
| 2026-10-23 03:35 | 224 | persona sonnet none/transfer | claude-sonnet-5-5 | 133 | 648 | $0.00675 | 6.5 |  |
| 2026-10-23 03:35 | 225 | persona sonnet rewrite/transfer | claude-sonnet-5-5 | 1875 | 420 | $0.00795 | 4 |  |
| 2026-10-23 03:35 | 226 | persona sonnet summary/transfer | claude-sonnet-5-5 | 1938 | 414 | $0.00802 | 4.4 |  |
| 2026-10-23 03:35 | 227 | persona sonnet journal/transfer | claude-sonnet-5-5 | 2128 | 447 | $0.00873 | 5.7 |  |
| 2026-10-23 03:35 | 228 | persona sonnet none/transfer | claude-sonnet-5-5 | 129 | 250 | $0.00276 | 4.2 |  |
| 2026-10-23 03:35 | 229 | persona sonnet sham/transfer | claude-sonnet-5-5 | 2346 | 742 | $0.01211 | 7.8 |  |
| 2026-10-23 03:35 | 230 | persona sonnet sham/transfer | claude-sonnet-5-5 | 2080 | 346 | $0.00762 | 3.9 |  |
| 2026-10-23 03:35 | 231 | persona sonnet rewrite/transfer | claude-sonnet-5-5 | 2130 | 576 | $0.01002 | 6.2 |  |
| 2026-10-23 03:35 | 232 | persona sonnet journal/transfer | claude-sonnet-5-5 | 2354 | 643 | $0.01114 | 7 |  |
| 2026-10-23 03:35 | 233 | persona sonnet summary/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 234 | persona sonnet rewrite/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 235 | persona sonnet none/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 236 | persona sonnet sham/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 237 | persona sonnet journal/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 238 | persona sonnet summary/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 239 | persona sonnet journal/transfer | claude-sonnet-5-5 | 809 | 357 | $0.00519 | 4.3 |  |
| 2026-10-23 03:35 | 240 | persona sonnet rewrite/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 241 | persona sonnet none/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 242 | persona sonnet sham/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 243 | persona sonnet journal/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 244 | persona sonnet summary/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 245 | persona sonnet rewrite/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 246 | persona sonnet none/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 247 | persona sonnet sham/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 248 | persona sonnet journal/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 249 | persona sonnet summary/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 250 | persona sonnet rewrite/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 251 | persona sonnet none/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 252 | persona sonnet sham/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 253 | persona sonnet journal/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 254 | persona sonnet summary/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 255 | persona sonnet none/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 256 | persona sonnet rewrite/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 257 | persona sonnet sham/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 258 | persona sonnet journal/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 259 | persona sonnet summary/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.2 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 260 | persona sonnet rewrite/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 261 | persona sonnet none/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 262 | persona sonnet sham/transfer | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 263 | persona sonnet summary/transfer | claude-sonnet-5-5 | 2229 | 788 | $0.01234 | 8.2 |  |
| 2026-10-23 03:35 | 264 | persona sonnet journal/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.2 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 265 | persona sonnet summary/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 266 | persona sonnet rewrite/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 267 | persona sonnet none/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 268 | persona sonnet sham/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 269 | persona sonnet journal/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 270 | persona sonnet summary/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 271 | persona sonnet rewrite/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 272 | persona sonnet none/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 273 | persona sonnet sham/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 274 | persona sonnet journal/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 275 | persona sonnet summary/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 276 | persona sonnet rewrite/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 277 | persona sonnet none/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 278 | persona sonnet sham/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 279 | persona sonnet summary/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 280 | persona sonnet journal/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 281 | persona sonnet rewrite/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 282 | persona sonnet none/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 283 | persona sonnet sham/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 284 | persona sonnet journal/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 285 | persona sonnet summary/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 286 | persona sonnet rewrite/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 287 | persona sonnet none/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 288 | persona sonnet sham/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 289 | persona sonnet journal/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 290 | persona sonnet summary/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 291 | persona sonnet rewrite/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 292 | persona sonnet none/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 293 | persona sonnet sham/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 294 | persona sonnet journal/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 295 | persona sonnet sham/transfer | claude-sonnet-5-5 | 2140 | 587 | $0.01015 | 7.3 |  |
| 2026-10-23 03:35 | 296 | persona sonnet none/transfer | claude-sonnet-5-5 | 141 | 635 | $0.00663 | 7.3 |  |
| 2026-10-23 03:35 | 297 | persona sonnet rewrite/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 298 | persona sonnet none/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 299 | persona sonnet summary/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 300 | persona sonnet sham/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 301 | persona sonnet journal/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 302 | persona sonnet summary/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 303 | persona sonnet none/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 304 | persona sonnet rewrite/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 305 | persona sonnet sham/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 306 | persona sonnet journal/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 307 | persona sonnet summary/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 308 | persona sonnet rewrite/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 309 | persona sonnet none/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 310 | persona sonnet journal/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 311 | persona sonnet sham/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 312 | persona sonnet summary/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 313 | persona sonnet rewrite/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 314 | persona sonnet sham/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 315 | persona sonnet journal/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 316 | persona sonnet summary/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 317 | persona sonnet none/thought | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 318 | persona sonnet rewrite/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 319 | persona sonnet journal/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 320 | persona sonnet none/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 321 | persona sonnet sham/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 322 | persona sonnet rewrite/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 323 | persona sonnet summary/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 324 | persona sonnet none/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 325 | persona sonnet sham/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 326 | persona sonnet summary/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 327 | persona sonnet rewrite/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 328 | persona sonnet journal/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 329 | persona sonnet none/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 330 | persona sonnet sham/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 331 | persona sonnet journal/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 332 | persona sonnet rewrite/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 333 | persona sonnet none/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 334 | persona sonnet sham/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 335 | persona sonnet summary/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.2 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 336 | persona sonnet journal/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 337 | persona sonnet rewrite/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 338 | persona sonnet summary/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 339 | persona sonnet none/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 340 | persona sonnet sham/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 341 | persona sonnet journal/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 342 | persona sonnet summary/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 343 | persona sonnet none/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 344 | persona sonnet rewrite/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 345 | persona sonnet sham/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 346 | persona sonnet journal/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 347 | persona sonnet summary/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 348 | persona sonnet rewrite/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 349 | persona sonnet none/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 350 | persona sonnet sham/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 351 | persona sonnet journal/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 352 | persona sonnet summary/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 353 | persona sonnet rewrite/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 354 | persona sonnet none/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 355 | persona sonnet sham/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 356 | persona sonnet journal/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 357 | persona sonnet summary/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 358 | persona sonnet rewrite/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 359 | persona sonnet none/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 360 | persona sonnet sham/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 361 | persona sonnet journal/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 362 | persona sonnet summary/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 363 | persona sonnet none/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 364 | persona sonnet rewrite/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 365 | persona sonnet sham/voice | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 366 | persona sonnet journal/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 367 | persona sonnet summary/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 368 | persona sonnet rewrite/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 369 | persona sonnet none/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 370 | persona sonnet journal/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 371 | persona sonnet sham/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 372 | persona sonnet summary/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 373 | persona sonnet rewrite/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 374 | persona sonnet sham/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 375 | persona sonnet none/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 376 | persona sonnet journal/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 377 | persona sonnet summary/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 378 | persona sonnet none/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 379 | persona sonnet rewrite/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 380 | persona sonnet sham/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 381 | persona sonnet journal/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 382 | persona sonnet summary/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 383 | persona sonnet rewrite/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 384 | persona sonnet sham/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 385 | persona sonnet none/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 386 | persona sonnet journal/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 387 | persona sonnet summary/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 388 | persona sonnet rewrite/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 389 | persona sonnet none/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 390 | persona sonnet sham/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 391 | persona sonnet journal/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 392 | persona sonnet summary/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 393 | persona sonnet rewrite/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 394 | persona sonnet none/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 395 | persona sonnet sham/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 396 | persona sonnet summary/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 397 | persona sonnet rewrite/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 398 | persona sonnet journal/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 399 | persona sonnet none/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 400 | persona sonnet journal/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 401 | persona sonnet sham/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.2 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 402 | persona sonnet rewrite/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 403 | persona sonnet summary/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 404 | persona sonnet none/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 405 | persona sonnet sham/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 406 | persona sonnet journal/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 407 | persona sonnet summary/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 408 | persona sonnet rewrite/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 409 | persona sonnet none/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 410 | persona sonnet sham/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 411 | persona sonnet journal/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 412 | persona sonnet summary/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 413 | persona sonnet rewrite/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 414 | persona sonnet sham/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 415 | persona sonnet none/recollection | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 416 | judge 1 transfer | claude-haiku-5-5 | 948 | 100 | $0.00014 | 0.9 |  |
| 2026-10-23 03:35 | 417 | judge 2 recollection | claude-haiku-5-5 | 2936 | 123 | $0.00036 | 0.9 |  |
| 2026-10-23 03:35 | 418 | judge 2 transfer | claude-haiku-5-5 | 948 | 114 | $0.00015 | 1 |  |
| 2026-10-23 03:35 | 419 | judge 2 voice | claude-haiku-5-5 | 1214 | 143 | $0.00019 | 1 |  |
| 2026-10-23 03:35 | 420 | judge 1 voice | claude-haiku-5-5 | 1214 | 116 | $0.00018 | 1.1 |  |
| 2026-10-23 03:35 | 421 | judge 1 recollection | claude-haiku-5-5 | 2936 | 127 | $0.00036 | 1.1 |  |
| 2026-10-23 03:35 | 422 | judge 2 recollection | claude-haiku-5-5 | 2852 | 91 | $0.00033 | 1.1 |  |
| 2026-10-23 03:35 | 423 | judge 1 recollection | claude-haiku-5-5 | 2831 | 151 | $0.00036 | 1.2 |  |
| 2026-10-23 03:35 | 424 | judge 1 recollection | claude-haiku-5-5 | 2861 | 132 | $0.00035 | 1.3 |  |
| 2026-10-23 03:35 | 425 | judge 1 recollection | claude-haiku-5-5 | 2852 | 98 | $0.00033 | 1.3 |  |
| 2026-10-23 03:35 | 426 | judge 2 recollection | claude-haiku-5-5 | 2831 | 148 | $0.00036 | 1.6 |  |
| 2026-10-23 03:35 | 427 | judge 2 recollection | claude-haiku-5-5 | 3195 | 114 | $0.00038 | 0.9 |  |
| 2026-10-23 03:35 | 428 | judge 2 recollection | claude-haiku-5-5 | 2861 | 142 | $0.00036 | 2 |  |
| 2026-10-23 03:35 | 429 | judge 1 recollection | claude-haiku-5-5 | 3195 | 132 | $0.00039 | 1 |  |
| 2026-10-23 03:35 | 430 | judge 2 voice | claude-haiku-5-5 | 990 | 132 | $0.00016 | 1.1 |  |
| 2026-10-23 03:35 | 431 | judge 1 voice | claude-haiku-5-5 | 1162 | 128 | $0.00018 | 1.1 |  |
| 2026-10-23 03:35 | 432 | judge 1 voice | claude-haiku-5-5 | 990 | 127 | $0.00016 | 1.2 |  |
| 2026-10-23 03:35 | 433 | judge 1 voice | claude-haiku-5-5 | 1042 | 118 | $0.00016 | 1 |  |
| 2026-10-23 03:35 | 434 | judge 1 transfer | claude-haiku-5-5 | 845 | 126 | $0.00015 | 0.9 |  |
| 2026-10-23 03:35 | 435 | judge 2 transfer | claude-haiku-5-5 | 845 | 132 | $0.00015 | 1 |  |
| 2026-10-23 03:35 | 436 | judge 2 recollection | claude-haiku-5-5 | 2955 | 94 | $0.00034 | 0.8 |  |
| 2026-10-23 03:35 | 437 | judge 1 recollection | claude-haiku-5-5 | 2955 | 103 | $0.00035 | 0.8 |  |
| 2026-10-23 03:35 | 438 | judge 2 voice | claude-haiku-5-5 | 1096 | 104 | $0.00016 | 1 |  |
| 2026-10-23 03:35 | 439 | judge 1 voice | claude-haiku-5-5 | 1096 | 101 | $0.00016 | 1.1 |  |
| 2026-10-23 03:35 | 440 | judge 2 transfer | claude-haiku-5-5 | 1065 | 93 | $0.00015 | 0.8 |  |
| 2026-10-23 03:35 | 441 | judge 1 transfer | claude-haiku-5-5 | 1004 | 106 | $0.00015 | 1.2 |  |
| 2026-10-23 03:35 | 442 | judge 2 voice | claude-haiku-5-5 | 1042 | 143 | $0.00018 | 2.2 |  |
| 2026-10-23 03:35 | 443 | judge 1 transfer | claude-haiku-5-5 | 1065 | 112 | $0.00016 | 1.1 |  |
| 2026-10-23 03:35 | 444 | judge 2 transfer | claude-haiku-5-5 | 835 | 95 | $0.00013 | 0.8 |  |
| 2026-10-23 03:35 | 445 | judge 1 transfer | claude-haiku-5-5 | 835 | 126 | $0.00015 | 0.9 |  |
| 2026-10-23 03:35 | 446 | judge 2 transfer | claude-haiku-5-5 | 1004 | 89 | $0.00014 | 1.6 |  |
| 2026-10-23 03:35 | 447 | judge 2 voice | claude-haiku-5-5 | 1162 | 547 | $0.00039 | 3.1 |  |
| 2026-10-23 03:35 | 448 | judge 1 transfer | claude-haiku-5-5 | 845 | 112 | $0.00014 | 1.2 |  |
| 2026-10-23 03:35 | 449 | judge 2 transfer | claude-haiku-5-5 | 845 | 127 | $0.00015 | 1.5 |  |
| 2026-10-23 03:35 | 450 | judge 2 transfer | claude-haiku-5-5 | 990 | 151 | $0.00017 | 1 |  |
| 2026-10-23 03:35 | 451 | judge 1 thought | claude-haiku-5-5 | 1141 | 148 | $0.00019 | 1.1 |  |
| 2026-10-23 03:35 | 452 | judge 1 transfer | claude-haiku-5-5 | 990 | 150 | $0.00017 | 1 |  |
| 2026-10-23 03:35 | 453 | judge 2 thought | claude-haiku-5-5 | 1141 | 166 | $0.00020 | 1.2 |  |
| 2026-10-23 03:35 | 454 | judge 1 recollection | claude-haiku-5-5 | 3190 | 142 | $0.00039 | 1.2 |  |
| 2026-10-23 03:35 | 455 | judge 2 transfer | claude-haiku-5-5 | 991 | 93 | $0.00015 | 1.1 |  |
| 2026-10-23 03:35 | 456 | judge 1 transfer | claude-haiku-5-5 | 991 | 102 | $0.00015 | 1.2 |  |
| 2026-10-23 03:35 | 457 | judge 1 voice | claude-haiku-5-5 | 1070 | 118 | $0.00017 | 1.1 |  |
| 2026-10-23 03:35 | 458 | judge 2 voice | claude-haiku-5-5 | 924 | 126 | $0.00016 | 0.9 |  |
| 2026-10-23 03:35 | 459 | judge 1 voice | claude-haiku-5-5 | 924 | 94 | $0.00014 | 0.9 |  |
| 2026-10-23 03:35 | 460 | judge 1 recollection | claude-haiku-5-5 | 3179 | 143 | $0.00039 | 0.9 |  |
| 2026-10-23 03:35 | 461 | judge 2 recollection | claude-haiku-5-5 | 3179 | 161 | $0.00040 | 0.9 |  |
| 2026-10-23 03:35 | 462 | judge 2 recollection | claude-haiku-5-5 | 2878 | 474 | $0.00052 | 2.8 |  |
| 2026-10-23 03:35 | 463 | referee recollection | claude-opus-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 464 | judge 2 transfer | claude-haiku-5-5 | 790 | 106 | $0.00013 | 0.8 |  |
| 2026-10-23 03:35 | 465 | judge 2 recollection | claude-haiku-5-5 | 3190 | 517 | $0.00058 | 2.8 |  |
| 2026-10-23 03:35 | 466 | judge 1 recollection | claude-haiku-5-5 | 2878 | 439 | $0.00051 | 3.5 |  |
| 2026-10-23 03:35 | 467 | judge 2 voice | claude-haiku-5-5 | 1070 | 138 | $0.00018 | 2.9 |  |
| 2026-10-23 03:35 | 468 | judge 2 transfer | claude-haiku-5-5 | 888 | 102 | $0.00014 | 0.9 |  |
| 2026-10-23 03:35 | 469 | judge 1 transfer | claude-haiku-5-5 | 888 | 98 | $0.00014 | 1 |  |
| 2026-10-23 03:35 | 470 | judge 2 voice | claude-haiku-5-5 | 1014 | 113 | $0.00016 | 0.8 |  |
| 2026-10-23 03:35 | 471 | judge 1 voice | claude-haiku-5-5 | 1014 | 120 | $0.00016 | 1 |  |
| 2026-10-23 03:35 | 472 | judge 1 voice | claude-haiku-5-5 | 989 | 436 | $0.00032 | 3.2 |  |
| 2026-10-23 03:35 | 473 | judge 2 transfer | claude-haiku-5-5 | 1057 | 89 | $0.00015 | 0.9 |  |
| 2026-10-23 03:35 | 474 | judge 1 transfer | claude-haiku-5-5 | 790 | 99 | $0.00013 | 2.6 |  |
| 2026-10-23 03:35 | 475 | judge 1 transfer | claude-haiku-5-5 | 1057 | 98 | $0.00015 | 0.9 |  |
| 2026-10-23 03:35 | 476 | judge 2 voice | claude-haiku-5-5 | 989 | 563 | $0.00038 | 3.9 |  |
| 2026-10-23 03:35 | 477 | judge 2 thought | claude-haiku-5-5 | 1081 | 128 | $0.00017 | 1.1 |  |
| 2026-10-23 03:35 | 478 | judge 1 thought | claude-haiku-5-5 | 1081 | 128 | $0.00017 | 1.3 |  |
| 2026-10-23 03:35 | 479 | referee thought | claude-opus-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 480 | judge 1 thought | claude-haiku-5-5 | 1079 | 456 | $0.00034 | 2.6 |  |
| 2026-10-23 03:35 | 481 | judge 2 thought | claude-haiku-5-5 | 1079 | 493 | $0.00035 | 2.8 |  |
| 2026-10-23 03:35 | 482 | referee thought | claude-opus-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 483 | judge 2 transfer | claude-haiku-5-5 | 1002 | 93 | $0.00015 | 1.4 |  |
| 2026-10-23 03:35 | 484 | judge 1 transfer | claude-haiku-5-5 | 1002 | 111 | $0.00016 | 1.4 |  |
| 2026-10-23 03:35 | 485 | judge 2 voice | claude-haiku-5-5 | 1144 | 105 | $0.00017 | 0.9 |  |
| 2026-10-23 03:35 | 486 | judge 1 thought | claude-haiku-5-5 | 1099 | 117 | $0.00017 | 1.2 |  |
| 2026-10-23 03:35 | 487 | judge 2 recollection | claude-haiku-5-5 | 2855 | 132 | $0.00035 | 1.2 |  |
| 2026-10-23 03:35 | 488 | judge 2 thought | claude-haiku-5-5 | 1099 | 118 | $0.00017 | 1.3 |  |
| 2026-10-23 03:35 | 489 | judge 1 recollection | claude-haiku-5-5 | 2855 | 164 | $0.00037 | 1.4 |  |
| 2026-10-23 03:35 | 490 | judge 1 voice | claude-haiku-5-5 | 1144 | 128 | $0.00018 | 1.2 |  |
| 2026-10-23 03:35 | 491 | judge 2 transfer | claude-haiku-5-5 | 766 | 100 | $0.00013 | 1 |  |
| 2026-10-23 03:35 | 492 | judge 1 transfer | claude-haiku-5-5 | 766 | 119 | $0.00014 | 1.5 |  |
| 2026-10-23 03:35 | 493 | judge 1 transfer | claude-haiku-5-5 | 978 | 95 | $0.00015 | 0.8 |  |
| 2026-10-23 03:35 | 494 | judge 2 transfer | claude-haiku-5-5 | 811 | 131 | $0.00015 | 1.2 |  |
| 2026-10-23 03:35 | 495 | judge 2 transfer | claude-haiku-5-5 | 978 | 93 | $0.00014 | 0.9 |  |
| 2026-10-23 03:35 | 496 | judge 1 transfer | claude-haiku-5-5 | 811 | 138 | $0.00015 | 1.3 |  |
| 2026-10-23 03:35 | 497 | judge 2 voice | claude-haiku-5-5 | 1001 | 327 | $0.00026 | 2.1 |  |
| 2026-10-23 03:35 | 498 | judge 2 transfer | claude-haiku-5-5 | 965 | 107 | $0.00015 | 0.9 |  |
| 2026-10-23 03:35 | 499 | judge 1 transfer | claude-haiku-5-5 | 907 | 103 | $0.00014 | 1 |  |
| 2026-10-23 03:35 | 500 | judge 2 transfer | claude-haiku-5-5 | 907 | 125 | $0.00015 | 1.1 |  |
| 2026-10-23 03:35 | 501 | judge 1 voice | claude-haiku-5-5 | 1038 | 394 | $0.00030 | 2 |  |
| 2026-10-23 03:35 | 502 | judge 1 voice | claude-haiku-5-5 | 1000 | 107 | $0.00015 | 1.1 |  |
| 2026-10-23 03:35 | 503 | judge 1 transfer | claude-haiku-5-5 | 965 | 108 | $0.00015 | 1.4 |  |
| 2026-10-23 03:35 | 504 | judge 2 voice | claude-haiku-5-5 | 1000 | 139 | $0.00017 | 1.2 |  |
| 2026-10-23 03:35 | 505 | judge 2 voice | claude-haiku-5-5 | 1038 | 451 | $0.00033 | 2.3 |  |
| 2026-10-23 03:35 | 506 | judge 2 transfer | claude-haiku-5-5 | 781 | 99 | $0.00013 | 0.8 |  |
| 2026-10-23 03:35 | 507 | judge 1 transfer | claude-haiku-5-5 | 781 | 92 | $0.00012 | 0.8 |  |
| 2026-10-23 03:35 | 508 | judge 2 thought | claude-haiku-5-5 | 1092 | 427 | $0.00032 | 2.8 |  |
| 2026-10-23 03:35 | 509 | judge 1 voice | claude-haiku-5-5 | 1001 | 676 | $0.00044 | 3.6 |  |
| 2026-10-23 03:35 | 510 | judge 2 thought | claude-haiku-5-5 | 1086 | 114 | $0.00017 | 1.1 |  |
| 2026-10-23 03:35 | 511 | referee voice | claude-opus-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 512 | judge 2 thought | claude-haiku-5-5 | 1080 | 138 | $0.00018 | 1.2 |  |
| 2026-10-23 03:35 | 513 | judge 1 thought | claude-haiku-5-5 | 1092 | 517 | $0.00037 | 3.3 |  |
| 2026-10-23 03:35 | 514 | judge 1 thought | claude-haiku-5-5 | 1086 | 112 | $0.00016 | 1.3 |  |
| 2026-10-23 03:35 | 515 | judge 1 thought | claude-haiku-5-5 | 1080 | 151 | $0.00018 | 1.4 |  |
| 2026-10-23 03:35 | 516 | judge 2 voice | claude-haiku-5-5 | 1057 | 154 | $0.00018 | 1.2 |  |
| 2026-10-23 03:35 | 517 | judge 1 thought | claude-haiku-5-5 | 1082 | 110 | $0.00016 | 0.8 |  |
| 2026-10-23 03:35 | 518 | judge 2 thought | claude-haiku-5-5 | 1082 | 114 | $0.00017 | 0.9 |  |
| 2026-10-23 03:35 | 519 | judge 2 transfer | claude-haiku-5-5 | 1026 | 121 | $0.00016 | 0.9 |  |
| 2026-10-23 03:35 | 520 | judge 1 voice | claude-haiku-5-5 | 1057 | 175 | $0.00019 | 1.9 |  |
| 2026-10-23 03:35 | 521 | judge 1 transfer | claude-haiku-5-5 | 1026 | 126 | $0.00017 | 1 |  |
| 2026-10-23 03:35 | 522 | judge 2 voice | claude-haiku-5-5 | 1086 | 99 | $0.00016 | 0.8 |  |
| 2026-10-23 03:35 | 523 | judge 1 voice | claude-haiku-5-5 | 1086 | 98 | $0.00016 | 0.9 |  |
| 2026-10-23 03:35 | 524 | judge 2 voice | claude-haiku-5-5 | 1086 | 174 | $0.00020 | 1.2 |  |
| 2026-10-23 03:35 | 525 | judge 2 transfer | claude-haiku-5-5 | 1039 | 116 | $0.00016 | 1.1 |  |
| 2026-10-23 03:35 | 526 | judge 1 transfer | claude-haiku-5-5 | 1039 | 122 | $0.00016 | 1.1 |  |
| 2026-10-23 03:35 | 527 | judge 2 transfer | claude-haiku-5-5 | 974 | 86 | $0.00014 | 0.9 |  |
| 2026-10-23 03:35 | 528 | judge 1 transfer | claude-haiku-5-5 | 974 | 99 | $0.00015 | 0.9 |  |
| 2026-10-23 03:35 | 529 | judge 1 transfer | claude-haiku-5-5 | 769 | 97 | $0.00013 | 0.9 |  |
| 2026-10-23 03:35 | 530 | judge 2 transfer | claude-haiku-5-5 | 769 | 96 | $0.00012 | 0.9 |  |
| 2026-10-23 03:35 | 531 | judge 1 recollection | claude-haiku-5-5 | 3084 | 88 | $0.00035 | 0.8 |  |
| 2026-10-23 03:35 | 532 | judge 2 transfer | claude-haiku-5-5 | 836 | 90 | $0.00013 | 0.8 |  |
| 2026-10-23 03:35 | 533 | judge 2 recollection | claude-haiku-5-5 | 3084 | 98 | $0.00036 | 0.9 |  |
| 2026-10-23 03:35 | 534 | judge 1 transfer | claude-haiku-5-5 | 836 | 99 | $0.00013 | 0.8 |  |
| 2026-10-23 03:35 | 535 | judge 1 thought | claude-haiku-5-5 | 1397 | 148 | $0.00021 | 1.3 |  |
| 2026-10-23 03:35 | 536 | judge 2 thought | claude-haiku-5-5 | 1397 | 122 | $0.00020 | 1.6 |  |
| 2026-10-23 03:35 | 537 | judge 2 transfer | claude-haiku-5-5 | 989 | 106 | $0.00015 | 0.9 |  |
| 2026-10-23 03:35 | 538 | judge 1 transfer | claude-haiku-5-5 | 989 | 95 | $0.00015 | 1 |  |
| 2026-10-23 03:35 | 539 | judge 1 voice | claude-haiku-5-5 | 1086 | 449 | $0.00033 | 3.3 |  |
| 2026-10-23 03:35 | 540 | judge 1 thought | claude-haiku-5-5 | 1228 | 256 | $0.00025 | 1.4 |  |
| 2026-10-23 03:35 | 541 | judge 2 recollection | claude-haiku-5-5 | 2967 | 131 | $0.00036 | 1.2 |  |
| 2026-10-23 03:35 | 542 | judge 2 voice | claude-haiku-5-5 | 925 | 537 | $0.00036 | 3 |  |
| 2026-10-23 03:35 | 543 | judge 2 transfer | claude-haiku-5-5 | 964 | 109 | $0.00015 | 0.9 |  |
| 2026-10-23 03:35 | 544 | judge 1 transfer | claude-haiku-5-5 | 964 | 108 | $0.00015 | 0.9 |  |
| 2026-10-23 03:35 | 545 | judge 1 voice | claude-haiku-5-5 | 925 | 555 | $0.00037 | 3.1 |  |
| 2026-10-23 03:35 | 546 | judge 2 recollection | claude-haiku-5-5 | 3167 | 458 | $0.00055 | 2.4 |  |
| 2026-10-23 03:35 | 547 | judge 1 thought | claude-haiku-5-5 | 1208 | 146 | $0.00019 | 1 |  |
| 2026-10-23 03:35 | 548 | judge 2 thought | claude-haiku-5-5 | 1228 | 358 | $0.00030 | 2.3 |  |
| 2026-10-23 03:35 | 549 | judge 2 thought | claude-haiku-5-5 | 1208 | 160 | $0.00020 | 1.1 |  |
| 2026-10-23 03:35 | 550 | judge 1 transfer | claude-haiku-5-5 | 831 | 117 | $0.00014 | 0.8 |  |
| 2026-10-23 03:35 | 551 | judge 2 transfer | claude-haiku-5-5 | 831 | 102 | $0.00013 | 0.9 |  |
| 2026-10-23 03:35 | 552 | judge 1 recollection | claude-haiku-5-5 | 3167 | 149 | $0.00039 | 3.1 |  |
| 2026-10-23 03:35 | 553 | referee recollection | claude-opus-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 554 | judge 2 voice | claude-haiku-5-5 | 1191 | 102 | $0.00017 | 0.9 |  |
| 2026-10-23 03:35 | 555 | judge 1 voice | claude-haiku-5-5 | 1191 | 131 | $0.00018 | 1.1 |  |
| 2026-10-23 03:35 | 556 | judge 1 recollection | claude-haiku-5-5 | 2808 | 116 | $0.00034 | 0.9 |  |
| 2026-10-23 03:35 | 557 | judge 2 recollection | claude-haiku-5-5 | 2808 | 122 | $0.00034 | 1 |  |
| 2026-10-23 03:35 | 558 | judge 1 recollection | claude-haiku-5-5 | 2967 | 589 | $0.00059 | 3 |  |
| 2026-10-23 03:35 | 559 | referee recollection | claude-opus-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 560 | judge 1 voice | claude-haiku-5-5 | 1026 | 100 | $0.00015 | 1.3 |  |
| 2026-10-23 03:35 | 561 | judge 2 voice | claude-haiku-5-5 | 1026 | 108 | $0.00016 | 1.4 |  |
| 2026-10-23 03:35 | 562 | judge 2 thought | claude-haiku-5-5 | 1025 | 105 | $0.00015 | 0.9 |  |
| 2026-10-23 03:35 | 563 | judge 1 thought | claude-haiku-5-5 | 1025 | 131 | $0.00017 | 1 |  |
| 2026-10-23 03:35 | 564 | judge 2 recollection | claude-haiku-5-5 | 3107 | 127 | $0.00037 | 1.2 |  |
| 2026-10-23 03:35 | 565 | judge 1 recollection | claude-haiku-5-5 | 3107 | 133 | $0.00038 | 1.3 |  |
| 2026-10-23 03:35 | 566 | judge 2 recollection | claude-haiku-5-5 | 3094 | 113 | $0.00037 | 1.1 |  |
| 2026-10-23 03:35 | 567 | judge 1 recollection | claude-haiku-5-5 | 3094 | 100 | $0.00036 | 1.2 |  |
| 2026-10-23 03:35 | 568 | judge 1 thought | claude-haiku-5-5 | 1190 | 115 | $0.00018 | 0.9 |  |
| 2026-10-23 03:35 | 569 | judge 2 thought | claude-haiku-5-5 | 1190 | 118 | $0.00018 | 1.1 |  |
| 2026-10-23 03:35 | 570 | judge 1 recollection | claude-haiku-5-5 | 2847 | 149 | $0.00036 | 1.4 |  |
| 2026-10-23 03:35 | 571 | judge 1 transfer | claude-haiku-5-5 | 1068 | 107 | $0.00016 | 0.9 |  |
| 2026-10-23 03:35 | 572 | judge 2 transfer | claude-haiku-5-5 | 1068 | 108 | $0.00016 | 1 |  |
| 2026-10-23 03:35 | 573 | judge 1 thought | claude-haiku-5-5 | 1300 | 146 | $0.00020 | 1.2 |  |
| 2026-10-23 03:35 | 574 | judge 1 thought | claude-haiku-5-5 | 1106 | 122 | $0.00017 | 1 |  |
| 2026-10-23 03:35 | 575 | judge 2 thought | claude-haiku-5-5 | 1106 | 127 | $0.00017 | 1 |  |
| 2026-10-23 03:35 | 576 | judge 2 thought | claude-haiku-5-5 | 1300 | 123 | $0.00019 | 1.6 |  |
| 2026-10-23 03:35 | 577 | judge 2 recollection | claude-haiku-5-5 | 2847 | 137 | $0.00035 | 2.3 |  |
| 2026-10-23 03:35 | 578 | judge 2 voice | claude-haiku-5-5 | 1193 | 139 | $0.00019 | 1.3 |  |
| 2026-10-23 03:35 | 579 | judge 1 thought | claude-haiku-5-5 | 1120 | 370 | $0.00030 | 2.4 |  |
| 2026-10-23 03:35 | 580 | judge 1 recollection | claude-haiku-5-5 | 3219 | 94 | $0.00037 | 1.1 |  |
| 2026-10-23 03:35 | 581 | judge 2 thought | claude-haiku-5-5 | 1120 | 435 | $0.00033 | 2.6 |  |
| 2026-10-23 03:35 | 582 | judge 1 transfer | claude-haiku-5-5 | 836 | 107 | $0.00014 | 0.9 |  |
| 2026-10-23 03:35 | 583 | judge 2 transfer | claude-haiku-5-5 | 836 | 132 | $0.00015 | 0.9 |  |
| 2026-10-23 03:35 | 584 | judge 2 recollection | claude-haiku-5-5 | 3219 | 106 | $0.00037 | 1.3 |  |
| 2026-10-23 03:35 | 585 | judge 1 voice | claude-haiku-5-5 | 1106 | 110 | $0.00017 | 1.2 |  |
| 2026-10-23 03:35 | 586 | judge 2 voice | claude-haiku-5-5 | 1106 | 106 | $0.00016 | 1.3 |  |
| 2026-10-23 03:35 | 587 | judge 1 voice | claude-haiku-5-5 | 1193 | 380 | $0.00031 | 2.4 |  |
| 2026-10-23 03:35 | 588 | judge 2 voice | claude-haiku-5-5 | 1075 | 113 | $0.00016 | 1 |  |
| 2026-10-23 03:35 | 589 | judge 1 thought | claude-haiku-5-5 | 1039 | 124 | $0.00017 | 1 |  |
| 2026-10-23 03:35 | 590 | judge 1 voice | claude-haiku-5-5 | 1075 | 117 | $0.00017 | 1.1 |  |
| 2026-10-23 03:35 | 591 | judge 2 recollection | claude-haiku-5-5 | 2639 | 286 | $0.00041 | 1.9 |  |
| 2026-10-23 03:35 | 592 | judge 2 thought | claude-haiku-5-5 | 1039 | 126 | $0.00017 | 1.2 |  |
| 2026-10-23 03:35 | 593 | judge 1 voice | claude-haiku-5-5 | 1084 | 127 | $0.00017 | 1.2 |  |
| 2026-10-23 03:35 | 594 | judge 1 recollection | claude-haiku-5-5 | 2639 | 314 | $0.00042 | 2 |  |
| 2026-10-23 03:35 | 595 | judge 2 voice | claude-haiku-5-5 | 1084 | 149 | $0.00018 | 1.3 |  |
| 2026-10-23 03:35 | 596 | judge 1 transfer | claude-haiku-5-5 | 1005 | 88 | $0.00014 | 0.8 |  |
| 2026-10-23 03:35 | 597 | judge 2 thought | claude-haiku-5-5 | 1118 | 108 | $0.00017 | 0.9 |  |
| 2026-10-23 03:35 | 598 | judge 1 thought | claude-haiku-5-5 | 1118 | 119 | $0.00017 | 1.1 |  |
| 2026-10-23 03:35 | 599 | judge 2 transfer | claude-haiku-5-5 | 1005 | 92 | $0.00015 | 1.3 |  |
| 2026-10-23 03:35 | 600 | judge 1 transfer | claude-haiku-5-5 | 1001 | 91 | $0.00015 | 1 |  |
| 2026-10-23 03:35 | 601 | judge 2 transfer | claude-haiku-5-5 | 1001 | 90 | $0.00015 | 1.1 |  |
| 2026-10-23 03:35 | 602 | judge 2 thought | claude-haiku-5-5 | 1092 | 123 | $0.00017 | 0.9 |  |
| 2026-10-23 03:35 | 603 | judge 2 transfer | claude-haiku-5-5 | 1009 | 98 | $0.00015 | 1.1 |  |
| 2026-10-23 03:35 | 604 | judge 1 thought | claude-haiku-5-5 | 1092 | 137 | $0.00018 | 1 |  |
| 2026-10-23 03:35 | 605 | judge 1 thought | claude-haiku-5-5 | 1080 | 146 | $0.00018 | 1.1 |  |
| 2026-10-23 03:35 | 606 | judge 2 thought | claude-haiku-5-5 | 1080 | 149 | $0.00018 | 1.2 |  |
| 2026-10-23 03:35 | 607 | judge 1 transfer | claude-haiku-5-5 | 1009 | 112 | $0.00016 | 1.4 |  |
| 2026-10-23 03:35 | 608 | judge 1 thought | claude-haiku-5-5 | 1265 | 163 | $0.00021 | 1.1 |  |
| 2026-10-23 03:35 | 609 | judge 2 thought | claude-haiku-5-5 | 1265 | 147 | $0.00020 | 1.1 |  |
| 2026-10-23 03:35 | 610 | judge 1 recollection | claude-haiku-5-5 | 3182 | 76 | $0.00036 | 0.9 |  |
| 2026-10-23 03:35 | 611 | judge 2 recollection | claude-haiku-5-5 | 3182 | 83 | $0.00036 | 0.9 |  |
| 2026-10-23 03:35 | 612 | judge 2 thought | claude-haiku-5-5 | 1276 | 134 | $0.00019 | 1.3 |  |
| 2026-10-23 03:35 | 613 | judge 1 thought | claude-haiku-5-5 | 1241 | 106 | $0.00018 | 0.8 |  |
| 2026-10-23 03:35 | 614 | judge 1 voice | claude-haiku-5-5 | 974 | 134 | $0.00016 | 1 |  |
| 2026-10-23 03:35 | 615 | judge 2 thought | claude-haiku-5-5 | 1241 | 126 | $0.00019 | 0.9 |  |
| 2026-10-23 03:35 | 616 | judge 1 thought | claude-haiku-5-5 | 1276 | 129 | $0.00019 | 1.6 |  |
| 2026-10-23 03:35 | 617 | judge 2 transfer | claude-haiku-5-5 | 884 | 103 | $0.00014 | 0.9 |  |
| 2026-10-23 03:35 | 618 | judge 2 voice | claude-haiku-5-5 | 1053 | 111 | $0.00016 | 0.8 |  |
| 2026-10-23 03:35 | 619 | judge 1 voice | claude-haiku-5-5 | 1053 | 128 | $0.00017 | 0.9 |  |
| 2026-10-23 03:35 | 620 | judge 1 transfer | claude-haiku-5-5 | 884 | 267 | $0.00022 | 1.7 |  |
| 2026-10-23 03:35 | 621 | judge 2 thought | claude-haiku-5-5 | 1243 | 145 | $0.00020 | 1.4 |  |
| 2026-10-23 03:35 | 622 | judge 1 thought | claude-haiku-5-5 | 1243 | 147 | $0.00020 | 1.5 |  |
| 2026-10-23 03:35 | 623 | judge 2 thought | claude-haiku-5-5 | 1074 | 129 | $0.00017 | 1.1 |  |
| 2026-10-23 03:35 | 624 | judge 1 recollection | claude-haiku-5-5 | 3162 | 158 | $0.00040 | 1.2 |  |
| 2026-10-23 03:35 | 625 | judge 2 recollection | claude-haiku-5-5 | 3162 | 157 | $0.00039 | 1.2 |  |
| 2026-10-23 03:35 | 626 | judge 2 voice | claude-haiku-5-5 | 974 | 468 | $0.00033 | 2.5 |  |
| 2026-10-23 03:35 | 627 | judge 2 voice | claude-haiku-5-5 | 1020 | 100 | $0.00015 | 1 |  |
| 2026-10-23 03:35 | 628 | judge 1 voice | claude-haiku-5-5 | 1020 | 113 | $0.00016 | 1.1 |  |
| 2026-10-23 03:35 | 629 | judge 2 thought | claude-haiku-5-5 | 1134 | 121 | $0.00017 | 1 |  |
| 2026-10-23 03:35 | 630 | judge 1 recollection | claude-haiku-5-5 | 3175 | 347 | $0.00049 | 2 |  |
| 2026-10-23 03:35 | 631 | judge 1 thought | claude-haiku-5-5 | 1134 | 141 | $0.00018 | 1.1 |  |
| 2026-10-23 03:35 | 632 | judge 2 transfer | claude-haiku-5-5 | 1026 | 112 | $0.00016 | 1.5 |  |
| 2026-10-23 03:35 | 633 | judge 1 transfer | claude-haiku-5-5 | 1026 | 117 | $0.00016 | 1.5 |  |
| 2026-10-23 03:35 | 634 | judge 2 recollection | claude-haiku-5-5 | 3175 | 502 | $0.00057 | 2.7 |  |
| 2026-10-23 03:35 | 635 | judge 1 thought | claude-haiku-5-5 | 1137 | 438 | $0.00033 | 2.6 |  |
| 2026-10-23 03:35 | 636 | judge 1 recollection | claude-haiku-5-5 | 3148 | 149 | $0.00039 | 1.1 |  |
| 2026-10-23 03:35 | 637 | judge 2 recollection | claude-haiku-5-5 | 3148 | 160 | $0.00039 | 1.1 |  |
| 2026-10-23 03:35 | 638 | judge 2 thought | claude-haiku-5-5 | 1066 | 134 | $0.00017 | 1.1 |  |
| 2026-10-23 03:35 | 639 | judge 1 thought | claude-haiku-5-5 | 1066 | 167 | $0.00019 | 1.3 |  |
| 2026-10-23 03:35 | 640 | judge 2 thought | claude-haiku-5-5 | 1137 | 521 | $0.00037 | 3.2 |  |
| 2026-10-23 03:35 | 641 | judge 1 transfer | claude-haiku-5-5 | 828 | 115 | $0.00014 | 1.2 |  |
| 2026-10-23 03:35 | 642 | judge 1 voice | claude-haiku-5-5 | 1114 | 460 | $0.00034 | 2.1 |  |
| 2026-10-23 03:35 | 643 | judge 2 transfer | claude-haiku-5-5 | 828 | 116 | $0.00014 | 1.3 |  |
| 2026-10-23 03:35 | 644 | judge 2 transfer | claude-haiku-5-5 | 840 | 123 | $0.00015 | 1 |  |
| 2026-10-23 03:35 | 645 | judge 1 transfer | claude-haiku-5-5 | 840 | 122 | $0.00015 | 1 |  |
| 2026-10-23 03:35 | 646 | judge 2 voice | claude-haiku-5-5 | 1114 | 378 | $0.00030 | 2.3 |  |
| 2026-10-23 03:35 | 647 | judge 2 voice | claude-haiku-5-5 | 1161 | 105 | $0.00017 | 0.9 |  |
| 2026-10-23 03:35 | 648 | judge 1 voice | claude-haiku-5-5 | 1047 | 166 | $0.00019 | 1.2 |  |
| 2026-10-23 03:35 | 649 | judge 1 voice | claude-haiku-5-5 | 1161 | 124 | $0.00018 | 1.1 |  |
| 2026-10-23 03:35 | 650 | judge 2 transfer | claude-haiku-5-5 | 849 | 100 | $0.00013 | 1 |  |
| 2026-10-23 03:35 | 651 | judge 1 transfer | claude-haiku-5-5 | 849 | 92 | $0.00013 | 1.1 |  |
| 2026-10-23 03:35 | 652 | judge 2 thought | claude-haiku-5-5 | 1059 | 122 | $0.00017 | 1 |  |
| 2026-10-23 03:35 | 653 | judge 1 thought | claude-haiku-5-5 | 1059 | 135 | $0.00017 | 1 |  |
| 2026-10-23 03:35 | 654 | judge 1 thought | claude-haiku-5-5 | 1074 | 125 | $0.00017 | 5.7 |  |
| 2026-10-23 03:35 | 655 | judge 2 voice | claude-haiku-5-5 | 1047 | 375 | $0.00029 | 1.9 |  |
| 2026-10-23 03:35 | 656 | judge 2 voice | claude-haiku-5-5 | 1022 | 110 | $0.00016 | 0.8 |  |
| 2026-10-23 03:35 | 657 | judge 1 voice | claude-haiku-5-5 | 1022 | 111 | $0.00016 | 0.8 |  |
| 2026-10-23 03:35 | 658 | judge 1 voice | claude-haiku-5-5 | 984 | 108 | $0.00015 | 1 |  |
| 2026-10-23 03:35 | 659 | judge 2 transfer | claude-haiku-5-5 | 805 | 102 | $0.00013 | 1 |  |
| 2026-10-23 03:35 | 660 | judge 1 transfer | claude-haiku-5-5 | 978 | 88 | $0.00014 | 1.9 |  |
| 2026-10-23 03:35 | 661 | judge 1 transfer | claude-haiku-5-5 | 805 | 103 | $0.00013 | 1 |  |
| 2026-10-23 03:35 | 662 | judge 2 transfer | claude-haiku-5-5 | 978 | 101 | $0.00015 | 2.1 |  |
| 2026-10-23 03:35 | 663 | judge 2 thought | claude-haiku-5-5 | 1075 | 152 | $0.00018 | 1.1 |  |
| 2026-10-23 03:35 | 664 | judge 1 thought | claude-haiku-5-5 | 1075 | 137 | $0.00018 | 1.1 |  |
| 2026-10-23 03:35 | 665 | judge 2 voice | claude-haiku-5-5 | 984 | 125 | $0.00016 | 2 |  |
| 2026-10-23 03:35 | 666 | judge 1 thought | claude-haiku-5-5 | 1110 | 114 | $0.00017 | 0.9 |  |
| 2026-10-23 03:35 | 667 | judge 1 transfer | claude-haiku-5-5 | 986 | 104 | $0.00015 | 0.8 |  |
| 2026-10-23 03:35 | 668 | judge 2 transfer | claude-haiku-5-5 | 986 | 85 | $0.00014 | 0.8 |  |
| 2026-10-23 03:35 | 669 | judge 2 voice | claude-haiku-5-5 | 1149 | 328 | $0.00028 | 1.7 |  |
| 2026-10-23 03:35 | 670 | judge 2 thought | claude-haiku-5-5 | 1110 | 117 | $0.00017 | 1.1 |  |
| 2026-10-23 03:35 | 671 | judge 1 recollection | claude-haiku-5-5 | 3156 | 186 | $0.00041 | 1.5 |  |
| 2026-10-23 03:35 | 672 | judge 1 voice | claude-haiku-5-5 | 1118 | 98 | $0.00016 | 0.9 |  |
| 2026-10-23 03:35 | 673 | judge 1 transfer | claude-haiku-5-5 | 805 | 96 | $0.00013 | 0.8 |  |
| 2026-10-23 03:35 | 674 | judge 2 transfer | claude-haiku-5-5 | 805 | 94 | $0.00013 | 0.8 |  |
| 2026-10-23 03:35 | 675 | judge 2 thought | claude-haiku-5-5 | 1208 | 121 | $0.00018 | 1.2 |  |
| 2026-10-23 03:35 | 676 | judge 1 thought | claude-haiku-5-5 | 1208 | 157 | $0.00020 | 1.4 |  |
| 2026-10-23 03:35 | 677 | judge 1 voice | claude-haiku-5-5 | 1149 | 381 | $0.00031 | 3 |  |
| 2026-10-23 03:35 | 678 | judge 2 recollection | claude-haiku-5-5 | 3156 | 475 | $0.00055 | 2.6 |  |
| 2026-10-23 03:35 | 679 | judge 2 recollection | claude-haiku-5-5 | 2967 | 653 | $0.00062 | 3.5 |  |
| 2026-10-23 03:35 | 680 | referee recollection | claude-opus-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 681 | judge 2 voice | claude-haiku-5-5 | 1118 | 89 | $0.00016 | 1.9 |  |
| 2026-10-23 03:35 | 682 | judge 1 thought | claude-haiku-5-5 | 1189 | 134 | $0.00019 | 1.1 |  |
| 2026-10-23 03:35 | 683 | judge 2 thought | claude-haiku-5-5 | 1189 | 136 | $0.00019 | 1.1 |  |
| 2026-10-23 03:35 | 684 | judge 1 recollection | claude-haiku-5-5 | 2967 | 667 | $0.00063 | 4 |  |
| 2026-10-23 03:35 | 685 | judge 1 recollection | claude-haiku-5-5 | 2869 | 146 | $0.00036 | 1.2 |  |
| 2026-10-23 03:35 | 686 | judge 2 voice | claude-haiku-5-5 | 1070 | 97 | $0.00016 | 0.8 |  |
| 2026-10-23 03:35 | 687 | judge 1 transfer | claude-haiku-5-5 | 850 | 97 | $0.00013 | 1.1 |  |
| 2026-10-23 03:35 | 688 | judge 2 transfer | claude-haiku-5-5 | 850 | 119 | $0.00014 | 1.3 |  |
| 2026-10-23 03:35 | 689 | judge 1 voice | claude-haiku-5-5 | 1070 | 116 | $0.00016 | 1 |  |
| 2026-10-23 03:35 | 690 | judge 2 recollection | claude-haiku-5-5 | 2869 | 161 | $0.00037 | 1.6 |  |
| 2026-10-23 03:35 | 691 | judge 1 recollection | claude-haiku-5-5 | 3192 | 86 | $0.00036 | 0.7 |  |
| 2026-10-23 03:35 | 692 | judge 2 recollection | claude-haiku-5-5 | 3192 | 88 | $0.00036 | 0.7 |  |
| 2026-10-23 03:35 | 693 | judge 1 transfer | claude-haiku-5-5 | 810 | 105 | $0.00013 | 0.8 |  |
| 2026-10-23 03:35 | 694 | judge 2 transfer | claude-haiku-5-5 | 959 | 152 | $0.00017 | 1 |  |
| 2026-10-23 03:35 | 695 | judge 1 transfer | claude-haiku-5-5 | 959 | 162 | $0.00018 | 1.1 |  |
| 2026-10-23 03:35 | 696 | judge 2 transfer | claude-haiku-5-5 | 810 | 106 | $0.00013 | 0.9 |  |
| 2026-10-23 03:35 | 697 | judge 1 transfer | claude-haiku-5-5 | 802 | 111 | $0.00014 | 0.9 |  |
| 2026-10-23 03:35 | 698 | judge 2 transfer | claude-haiku-5-5 | 802 | 111 | $0.00014 | 0.9 |  |
| 2026-10-23 03:35 | 699 | judge 2 transfer | claude-haiku-5-5 | 1106 | 105 | $0.00016 | 0.9 |  |
| 2026-10-23 03:35 | 700 | judge 1 transfer | claude-haiku-5-5 | 983 | 89 | $0.00014 | 0.8 |  |
| 2026-10-23 03:35 | 701 | judge 1 transfer | claude-haiku-5-5 | 1106 | 126 | $0.00017 | 0.9 |  |
| 2026-10-23 03:35 | 702 | judge 2 transfer | claude-haiku-5-5 | 820 | 125 | $0.00014 | 1 |  |
| 2026-10-23 03:35 | 703 | judge 2 transfer | claude-haiku-5-5 | 983 | 90 | $0.00014 | 0.9 |  |
| 2026-10-23 03:35 | 704 | judge 1 voice | claude-haiku-5-5 | 1018 | 111 | $0.00016 | 0.9 |  |
| 2026-10-23 03:35 | 705 | judge 2 voice | claude-haiku-5-5 | 1018 | 131 | $0.00017 | 1 |  |
| 2026-10-23 03:35 | 706 | judge 1 transfer | claude-haiku-5-5 | 820 | 126 | $0.00015 | 1.1 |  |
| 2026-10-23 03:35 | 707 | judge 2 voice | claude-haiku-5-5 | 1012 | 111 | $0.00016 | 1.7 |  |
| 2026-10-23 03:35 | 708 | judge 1 voice | claude-haiku-5-5 | 1012 | 133 | $0.00017 | 1.8 |  |
| 2026-10-23 03:35 | 709 | judge 2 transfer | claude-haiku-5-5 | 874 | 99 | $0.00014 | 0.8 |  |
| 2026-10-23 03:35 | 710 | judge 1 transfer | claude-haiku-5-5 | 958 | 124 | $0.00016 | 1 |  |
| 2026-10-23 03:35 | 711 | judge 1 transfer | claude-haiku-5-5 | 949 | 94 | $0.00014 | 0.9 |  |
| 2026-10-23 03:35 | 712 | judge 1 transfer | claude-haiku-5-5 | 1060 | 101 | $0.00016 | 0.8 |  |
| 2026-10-23 03:35 | 713 | judge 1 transfer | claude-haiku-5-5 | 874 | 115 | $0.00014 | 1.1 |  |
| 2026-10-23 03:35 | 714 | judge 2 transfer | claude-haiku-5-5 | 949 | 105 | $0.00015 | 1.2 |  |
| 2026-10-23 03:35 | 715 | judge 2 transfer | claude-haiku-5-5 | 958 | 110 | $0.00015 | 1.5 |  |
| 2026-10-23 03:35 | 716 | judge 2 voice | claude-haiku-5-5 | 1069 | 112 | $0.00016 | 1.3 |  |
| 2026-10-23 03:35 | 717 | judge 1 thought | claude-haiku-5-5 | 1094 | 131 | $0.00017 | 1 |  |
| 2026-10-23 03:35 | 718 | judge 2 transfer | claude-haiku-5-5 | 1060 | 103 | $0.00016 | 1.8 |  |
| 2026-10-23 03:35 | 719 | judge 1 voice | claude-haiku-5-5 | 1069 | 107 | $0.00016 | 1.8 |  |
| 2026-10-23 03:35 | 720 | judge 2 recollection | claude-haiku-5-5 | 2916 | 105 | $0.00034 | 0.8 |  |
| 2026-10-23 03:35 | 721 | judge 2 thought | claude-haiku-5-5 | 1094 | 165 | $0.00019 | 1.4 |  |
| 2026-10-23 03:35 | 722 | judge 1 recollection | claude-haiku-5-5 | 2916 | 106 | $0.00034 | 0.9 |  |
| 2026-10-23 03:35 | 723 | judge 1 transfer | claude-haiku-5-5 | 831 | 121 | $0.00014 | 1.2 |  |
| 2026-10-23 03:35 | 724 | judge 2 transfer | claude-haiku-5-5 | 1043 | 104 | $0.00016 | 1.3 |  |
| 2026-10-23 03:35 | 725 | judge 1 transfer | claude-haiku-5-5 | 1043 | 105 | $0.00016 | 1.3 |  |
| 2026-10-23 03:35 | 726 | judge 2 transfer | claude-haiku-5-5 | 831 | 139 | $0.00015 | 1.5 |  |
| 2026-10-23 03:35 | 727 | judge 2 thought | claude-haiku-5-5 | 1217 | 122 | $0.00018 | 1 |  |
| 2026-10-23 03:35 | 728 | judge 1 thought | claude-haiku-5-5 | 1183 | 131 | $0.00018 | 1.1 |  |
| 2026-10-23 03:35 | 729 | judge 1 thought | claude-haiku-5-5 | 1217 | 125 | $0.00018 | 1.2 |  |
| 2026-10-23 03:35 | 730 | judge 1 thought | claude-haiku-5-5 | 1241 | 149 | $0.00020 | 1.1 |  |
| 2026-10-23 03:35 | 731 | judge 1 thought | claude-haiku-5-5 | 1288 | 141 | $0.00020 | 1.3 |  |
| 2026-10-23 03:35 | 732 | judge 2 thought | claude-haiku-5-5 | 1288 | 132 | $0.00019 | 1.4 |  |
| 2026-10-23 03:35 | 733 | judge 2 thought | claude-haiku-5-5 | 1241 | 136 | $0.00019 | 1.7 |  |
| 2026-10-23 03:35 | 734 | judge 1 thought | claude-haiku-5-5 | 1173 | 130 | $0.00018 | 1.1 |  |
| 2026-10-23 03:35 | 735 | judge 1 transfer | claude-haiku-5-5 | 818 | 123 | $0.00014 | 1.1 |  |
| 2026-10-23 03:35 | 736 | referee thought | claude-opus-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 737 | judge 2 transfer | claude-haiku-5-5 | 818 | 118 | $0.00014 | 1.2 |  |
| 2026-10-23 03:35 | 738 | judge 2 thought | claude-haiku-5-5 | 1173 | 153 | $0.00019 | 1.2 |  |
| 2026-10-23 03:35 | 739 | judge 2 thought | claude-haiku-5-5 | 1183 | 134 | $0.00019 | 2.3 |  |
| 2026-10-23 03:35 | 740 | judge 2 transfer | claude-haiku-5-5 | 1011 | 101 | $0.00015 | 0.9 |  |
| 2026-10-23 03:35 | 741 | judge 2 transfer | claude-haiku-5-5 | 959 | 112 | $0.00015 | 1.5 |  |
| 2026-10-23 03:35 | 742 | judge 1 transfer | claude-haiku-5-5 | 959 | 257 | $0.00022 | 1.7 |  |
| 2026-10-23 03:35 | 743 | judge 2 voice | claude-haiku-5-5 | 1050 | 99 | $0.00015 | 1 |  |
| 2026-10-23 03:35 | 744 | judge 1 transfer | claude-haiku-5-5 | 1011 | 103 | $0.00015 | 1.3 |  |
| 2026-10-23 03:35 | 745 | judge 1 voice | claude-haiku-5-5 | 1050 | 98 | $0.00015 | 1 |  |
| 2026-10-23 03:35 | 746 | judge 1 thought | claude-haiku-5-5 | 1219 | 111 | $0.00018 | 1.1 |  |
| 2026-10-23 03:35 | 747 | judge 2 thought | claude-haiku-5-5 | 1219 | 142 | $0.00019 | 1.1 |  |
| 2026-10-23 03:35 | 748 | judge 2 transfer | claude-haiku-5-5 | 934 | 138 | $0.00016 | 1.6 |  |
| 2026-10-23 03:35 | 749 | judge 2 recollection | claude-haiku-5-5 | 3151 | 145 | $0.00039 | 1.7 |  |
| 2026-10-23 03:35 | 750 | judge 1 recollection | claude-haiku-5-5 | 3151 | 136 | $0.00038 | 1.7 |  |
| 2026-10-23 03:35 | 751 | judge 1 transfer | claude-haiku-5-5 | 934 | 140 | $0.00016 | 1.8 |  |
| 2026-10-23 03:35 | 752 | judge 2 recollection | claude-haiku-5-5 | 2848 | 122 | $0.00035 | 0.9 |  |
| 2026-10-23 03:35 | 753 | judge 1 recollection | claude-haiku-5-5 | 2848 | 121 | $0.00035 | 1.1 |  |
| 2026-10-23 03:35 | 754 | judge 2 transfer | claude-haiku-5-5 | 1020 | 103 | $0.00015 | 1.2 |  |
| 2026-10-23 03:35 | 755 | judge 1 transfer | claude-haiku-5-5 | 790 | 120 | $0.00014 | 1.2 |  |
| 2026-10-23 03:35 | 756 | judge 2 thought | claude-haiku-5-5 | 1115 | 115 | $0.00017 | 1 |  |
| 2026-10-23 03:35 | 757 | judge 2 transfer | claude-haiku-5-5 | 790 | 125 | $0.00014 | 1.7 |  |
| 2026-10-23 03:35 | 758 | judge 1 voice | claude-haiku-5-5 | 1135 | 134 | $0.00018 | 1.2 |  |
| 2026-10-23 03:35 | 759 | judge 1 transfer | claude-haiku-5-5 | 1020 | 109 | $0.00016 | 2.2 |  |
| 2026-10-23 03:35 | 760 | judge 2 thought | claude-haiku-5-5 | 1338 | 130 | $0.00020 | 1.1 |  |
| 2026-10-23 03:35 | 761 | judge 2 voice | claude-haiku-5-5 | 1135 | 126 | $0.00018 | 1.4 |  |
| 2026-10-23 03:35 | 762 | judge 1 thought | claude-haiku-5-5 | 1115 | 124 | $0.00017 | 1.9 |  |
| 2026-10-23 03:35 | 763 | judge 1 voice | claude-haiku-5-5 | 1077 | 119 | $0.00017 | 1 |  |
| 2026-10-23 03:35 | 764 | judge 2 voice | claude-haiku-5-5 | 1077 | 113 | $0.00016 | 1 |  |
| 2026-10-23 03:35 | 765 | judge 2 voice | claude-haiku-5-5 | 1194 | 459 | $0.00035 | 2.4 |  |
| 2026-10-23 03:35 | 766 | judge 1 transfer | claude-haiku-5-5 | 989 | 92 | $0.00014 | 0.9 |  |
| 2026-10-23 03:35 | 767 | judge 1 thought | claude-haiku-5-5 | 1338 | 144 | $0.00021 | 2.1 |  |
| 2026-10-23 03:35 | 768 | judge 1 thought | claude-haiku-5-5 | 1142 | 146 | $0.00019 | 1.4 |  |
| 2026-10-23 03:35 | 769 | judge 1 voice | claude-haiku-5-5 | 1194 | 587 | $0.00041 | 3.1 |  |
| 2026-10-23 03:35 | 770 | judge 1 recollection | claude-haiku-5-5 | 2880 | 82 | $0.00033 | 0.9 |  |
| 2026-10-23 03:35 | 771 | judge 2 transfer | claude-haiku-5-5 | 989 | 93 | $0.00015 | 1.5 |  |
| 2026-10-23 03:35 | 772 | judge 2 recollection | claude-haiku-5-5 | 2880 | 96 | $0.00034 | 1.2 |  |
| 2026-10-23 03:35 | 773 | judge 2 voice | claude-haiku-5-5 | 1139 | 115 | $0.00017 | 0.9 |  |
| 2026-10-23 03:35 | 774 | judge 1 voice | claude-haiku-5-5 | 1139 | 108 | $0.00017 | 0.9 |  |
| 2026-10-23 03:35 | 775 | judge 2 thought | claude-haiku-5-5 | 1142 | 139 | $0.00018 | 2 |  |
| 2026-10-23 03:35 | 776 | judge 2 recollection | claude-haiku-5-5 | 2901 | 383 | $0.00048 | 1.9 |  |
| 2026-10-23 03:35 | 777 | judge 1 transfer | claude-haiku-5-5 | 855 | 130 | $0.00015 | 1 |  |
| 2026-10-23 03:35 | 778 | judge 2 thought | claude-haiku-5-5 | 1095 | 115 | $0.00017 | 1 |  |
| 2026-10-23 03:35 | 779 | judge 1 voice | claude-haiku-5-5 | 1159 | 114 | $0.00017 | 0.8 |  |
| 2026-10-23 03:35 | 780 | judge 1 thought | claude-haiku-5-5 | 1095 | 139 | $0.00018 | 1.1 |  |
| 2026-10-23 03:35 | 781 | judge 2 voice | claude-haiku-5-5 | 1159 | 113 | $0.00017 | 0.9 |  |
| 2026-10-23 03:35 | 782 | referee thought | claude-opus-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 783 | judge 1 voice | claude-haiku-5-5 | 1034 | 98 | $0.00015 | 0.9 |  |
| 2026-10-23 03:35 | 784 | judge 2 voice | claude-haiku-5-5 | 1034 | 124 | $0.00017 | 1 |  |
| 2026-10-23 03:35 | 785 | judge 1 recollection | claude-haiku-5-5 | 2901 | 481 | $0.00053 | 2.5 |  |
| 2026-10-23 03:35 | 786 | judge 2 transfer | claude-haiku-5-5 | 855 | 117 | $0.00014 | 1.5 |  |
| 2026-10-23 03:35 | 787 | judge 1 recollection | claude-haiku-5-5 | 3147 | 109 | $0.00037 | 1.1 |  |
| 2026-10-23 03:35 | 788 | judge 2 recollection | claude-haiku-5-5 | 3147 | 106 | $0.00037 | 1.2 |  |
| 2026-10-23 03:35 | 789 | judge 2 recollection | claude-haiku-5-5 | 2882 | 85 | $0.00033 | 0.8 |  |
| 2026-10-23 03:35 | 790 | judge 1 recollection | claude-haiku-5-5 | 2882 | 93 | $0.00033 | 0.9 |  |
| 2026-10-23 03:35 | 791 | judge 1 recollection | claude-haiku-5-5 | 2761 | 81 | $0.00032 | 0.7 |  |
| 2026-10-23 03:35 | 792 | judge 2 transfer | claude-haiku-5-5 | 819 | 116 | $0.00014 | 0.9 |  |
| 2026-10-23 03:35 | 793 | judge 2 recollection | claude-haiku-5-5 | 2761 | 82 | $0.00032 | 0.8 |  |
| 2026-10-23 03:35 | 794 | judge 1 transfer | claude-haiku-5-5 | 819 | 144 | $0.00015 | 1.1 |  |
| 2026-10-23 03:35 | 795 | judge 2 thought | claude-haiku-5-5 | 1154 | 121 | $0.00018 | 0.9 |  |
| 2026-10-23 03:35 | 796 | judge 1 thought | claude-haiku-5-5 | 1154 | 149 | $0.00019 | 1 |  |
| 2026-10-23 03:35 | 797 | judge 1 recollection | claude-haiku-5-5 | 3178 | 119 | $0.00038 | 1.2 |  |
| 2026-10-23 03:35 | 798 | judge 2 transfer | claude-haiku-5-5 | 843 | 96 | $0.00013 | 1.1 |  |
| 2026-10-23 03:35 | 799 | judge 2 transfer | claude-haiku-5-5 | 1008 | 92 | $0.00015 | 0.9 |  |
| 2026-10-23 03:35 | 800 | judge 1 transfer | claude-haiku-5-5 | 1008 | 90 | $0.00015 | 0.9 |  |
| 2026-10-23 03:35 | 801 | judge 2 transfer | claude-haiku-5-5 | 1023 | 105 | $0.00015 | 1 |  |
| 2026-10-23 03:35 | 802 | judge 1 voice | claude-haiku-5-5 | 1075 | 100 | $0.00016 | 0.9 |  |
| 2026-10-23 03:35 | 803 | judge 2 voice | claude-haiku-5-5 | 1075 | 99 | $0.00016 | 1 |  |
| 2026-10-23 03:35 | 804 | judge 1 transfer | claude-haiku-5-5 | 1008 | 93 | $0.00015 | 1.6 |  |
| 2026-10-23 03:35 | 805 | judge 2 recollection | claude-haiku-5-5 | 3178 | 107 | $0.00037 | 2.1 |  |
| 2026-10-23 03:35 | 806 | judge 2 transfer | claude-haiku-5-5 | 1008 | 113 | $0.00016 | 2 |  |
| 2026-10-23 03:35 | 807 | judge 1 transfer | claude-haiku-5-5 | 1023 | 121 | $0.00016 | 2.1 |  |
| 2026-10-23 03:35 | 808 | judge 2 recollection | claude-haiku-5-5 | 3153 | 144 | $0.00039 | 1.1 |  |
| 2026-10-23 03:35 | 809 | judge 1 recollection | claude-haiku-5-5 | 3153 | 155 | $0.00039 | 1.1 |  |
| 2026-10-23 03:35 | 810 | judge 1 transfer | claude-haiku-5-5 | 843 | 113 | $0.00014 | 2.9 |  |
| 2026-10-23 03:35 | 811 | judge 2 thought | claude-haiku-5-5 | 1129 | 128 | $0.00018 | 1.1 |  |
| 2026-10-23 03:35 | 812 | judge 1 thought | claude-haiku-5-5 | 1129 | 153 | $0.00019 | 1.2 |  |
| 2026-10-23 03:35 | 813 | judge 1 thought | claude-haiku-5-5 | 1075 | 136 | $0.00018 | 1.1 |  |
| 2026-10-23 03:35 | 814 | judge 2 thought | claude-haiku-5-5 | 1075 | 148 | $0.00018 | 1.3 |  |
| 2026-10-23 03:35 | 815 | judge 1 thought | claude-haiku-5-5 | 1228 | 120 | $0.00018 | 1.1 |  |
| 2026-10-23 03:35 | 816 | judge 1 transfer | claude-haiku-5-5 | 1003 | 94 | $0.00015 | 1 |  |
| 2026-10-23 03:35 | 817 | judge 2 transfer | claude-haiku-5-5 | 1003 | 116 | $0.00016 | 1.1 |  |
| 2026-10-23 03:35 | 818 | judge 2 thought | claude-haiku-5-5 | 1228 | 120 | $0.00018 | 1.3 |  |
| 2026-10-23 03:35 | 819 | judge 2 voice | claude-haiku-5-5 | 1001 | 106 | $0.00015 | 1.1 |  |
| 2026-10-23 03:35 | 820 | judge 2 thought | claude-haiku-5-5 | 1154 | 129 | $0.00018 | 1 |  |
| 2026-10-23 03:35 | 821 | judge 1 voice | claude-haiku-5-5 | 1142 | 484 | $0.00036 | 2.9 |  |
| 2026-10-23 03:35 | 822 | judge 1 thought | claude-haiku-5-5 | 1154 | 124 | $0.00018 | 1.2 |  |
| 2026-10-23 03:35 | 823 | judge 1 voice | claude-haiku-5-5 | 1001 | 112 | $0.00016 | 1.5 |  |
| 2026-10-23 03:35 | 824 | judge 1 voice | claude-haiku-5-5 | 1057 | 98 | $0.00015 | 0.9 |  |
| 2026-10-23 03:35 | 825 | judge 1 thought | claude-haiku-5-5 | 1109 | 114 | $0.00017 | 0.9 |  |
| 2026-10-23 03:35 | 826 | judge 1 recollection | claude-haiku-5-5 | 2893 | 196 | $0.00039 | 1.4 |  |
| 2026-10-23 03:35 | 827 | judge 2 thought | claude-haiku-5-5 | 1109 | 119 | $0.00017 | 1 |  |
| 2026-10-23 03:35 | 828 | judge 2 voice | claude-haiku-5-5 | 1057 | 97 | $0.00015 | 1.2 |  |
| 2026-10-23 03:35 | 829 | judge 2 voice | claude-haiku-5-5 | 1136 | 98 | $0.00016 | 0.8 |  |
| 2026-10-23 03:35 | 830 | judge 1 voice | claude-haiku-5-5 | 1136 | 119 | $0.00017 | 0.8 |  |
| 2026-10-23 03:35 | 831 | judge 2 transfer | claude-haiku-5-5 | 755 | 116 | $0.00013 | 1 |  |
| 2026-10-23 03:35 | 832 | judge 2 recollection | claude-haiku-5-5 | 2893 | 238 | $0.00041 | 1.7 |  |
| 2026-10-23 03:35 | 833 | judge 1 transfer | claude-haiku-5-5 | 755 | 90 | $0.00012 | 1.4 |  |
| 2026-10-23 03:35 | 834 | judge 2 voice | claude-haiku-5-5 | 1142 | 731 | $0.00048 | 4.4 |  |
| 2026-10-23 03:35 | 835 | referee voice | claude-opus-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 03:35 | 836 | judge 2 transfer | claude-haiku-5-5 | 1065 | 89 | $0.00015 | 0.8 |  |
| 2026-10-23 03:35 | 837 | judge 1 transfer | claude-haiku-5-5 | 933 | 95 | $0.00014 | 0.9 |  |
| 2026-10-23 03:35 | 838 | judge 1 transfer | claude-haiku-5-5 | 1065 | 104 | $0.00016 | 0.8 |  |
| 2026-10-23 03:35 | 839 | judge 2 transfer | claude-haiku-5-5 | 933 | 116 | $0.00015 | 1 |  |
| 2026-10-23 03:35 | 840 | judge 1 voice | claude-haiku-5-5 | 1215 | 160 | $0.00020 | 1.3 |  |
| 2026-10-23 03:35 | 841 | judge 2 voice | claude-haiku-5-5 | 1215 | 118 | $0.00018 | 1.4 |  |
| 2026-10-23 03:35 | 842 | judge 2 transfer | claude-haiku-5-5 | 887 | 93 | $0.00014 | 0.9 |  |
| 2026-10-23 03:35 | 843 | judge 1 transfer | claude-haiku-5-5 | 887 | 112 | $0.00014 | 1.5 |  |
| 2026-10-23 03:35 | 844 | judge 1 recollection | claude-haiku-5-5 | 2910 | 570 | $0.00058 | 3.1 |  |
| 2026-10-23 03:35 | 845 | judge 2 recollection | claude-haiku-5-5 | 2910 | 605 | $0.00059 | 3.4 |  |
| 2026-10-23 03:35 | 846 | referee recollection | claude-opus-5-5 | 0 | 0 | $0.00000 | 0.1 | HTTP 403 permission_error |
| 2026-10-23 04:35 | 1 | diagnostic access check (403 model_access_suspended) | claude-sonnet-5-5 | 0 | 0 | $0.00000 | 0.5 | HTTP 403 permission_error |
| 2026-10-23 04:35 | 2 | diagnostic access check (403 model_access_suspended) | claude-opus-5-5 | 0 | 0 | $0.00000 | 0.5 | HTTP 403 permission_error |
| 2026-10-23 04:35 | 3 | diagnostic access check (lifted) | claude-sonnet-5-5 | 13 | 6 | $0.00009 | 1 |  |
| 2026-10-23 04:35 | 4 | diagnostic access check (lifted) | claude-opus-5-5 | 13 | 6 | $0.00017 | 1 |  |
| 2026-10-23 04:40 | 1 | persona sonnet sham/transfer | claude-sonnet-5-5 | 805 | 314 | $0.00475 | 3.6 |  |
| 2026-10-23 04:40 | 2 | persona sonnet summary/transfer | claude-sonnet-5-5 | 773 | 350 | $0.00505 | 3.9 |  |
| 2026-10-23 04:40 | 3 | persona sonnet rewrite/transfer | claude-sonnet-5-5 | 749 | 326 | $0.00476 | 4.1 |  |
| 2026-10-23 04:40 | 4 | persona sonnet none/transfer | claude-sonnet-5-5 | 129 | 275 | $0.00301 | 4.3 |  |
| 2026-10-23 04:40 | 5 | persona sonnet journal/transfer | claude-sonnet-5-5 | 809 | 474 | $0.00636 | 5.8 |  |
| 2026-10-23 04:40 | 6 | persona sonnet rewrite/transfer | claude-sonnet-5-5 | 744 | 554 | $0.00703 | 5.9 |  |
| 2026-10-23 04:40 | 7 | persona sonnet none/transfer | claude-sonnet-5-5 | 133 | 673 | $0.00700 | 6.7 |  |
| 2026-10-23 04:40 | 8 | persona sonnet summary/transfer | claude-sonnet-5-5 | 774 | 705 | $0.00860 | 8.9 |  |
| 2026-10-23 04:40 | 9 | persona sonnet journal/transfer | claude-sonnet-5-5 | 809 | 499 | $0.00661 | 6.9 |  |
| 2026-10-23 04:40 | 10 | persona sonnet summary/transfer | claude-sonnet-5-5 | 774 | 605 | $0.00760 | 6.8 |  |
| 2026-10-23 04:40 | 11 | persona sonnet sham/transfer | claude-sonnet-5-5 | 908 | 751 | $0.00933 | 8.6 |  |
| 2026-10-23 04:40 | 12 | persona sonnet rewrite/transfer | claude-sonnet-5-5 | 744 | 483 | $0.00632 | 5.8 |  |
| 2026-10-23 04:40 | 13 | persona sonnet none/transfer | claude-sonnet-5-5 | 133 | 553 | $0.00580 | 5.8 |  |
| 2026-10-23 04:40 | 14 | persona sonnet journal/transfer | claude-sonnet-5-5 | 2354 | 683 | $0.01154 | 7.1 |  |
| 2026-10-23 04:40 | 15 | persona sonnet sham/transfer | claude-sonnet-5-5 | 908 | 765 | $0.00947 | 7.7 |  |
| 2026-10-23 04:40 | 16 | persona sonnet summary/transfer | claude-sonnet-5-5 | 2229 | 591 | $0.01037 | 7.8 |  |
| 2026-10-23 04:40 | 17 | persona sonnet rewrite/transfer | claude-sonnet-5-5 | 2130 | 665 | $0.01091 | 7 |  |
| 2026-10-23 04:40 | 18 | persona sonnet sham/transfer | claude-sonnet-5-5 | 2140 | 417 | $0.00845 | 4.6 |  |
| 2026-10-23 04:40 | 19 | persona sonnet none/transfer | claude-sonnet-5-5 | 141 | 484 | $0.00512 | 5.1 |  |
| 2026-10-23 04:40 | 20 | persona sonnet journal/transfer | claude-sonnet-5-5 | 2128 | 397 | $0.00823 | 4.7 |  |
| 2026-10-23 04:40 | 21 | persona sonnet summary/transfer | claude-sonnet-5-5 | 1938 | 370 | $0.00758 | 3.9 |  |
| 2026-10-23 04:40 | 22 | persona sonnet sham/transfer | claude-sonnet-5-5 | 2080 | 285 | $0.00701 | 3.5 |  |
| 2026-10-23 04:40 | 23 | persona sonnet none/transfer | claude-sonnet-5-5 | 129 | 351 | $0.00377 | 4.7 |  |
| 2026-10-23 04:40 | 24 | persona sonnet rewrite/transfer | claude-sonnet-5-5 | 1875 | 459 | $0.00834 | 5 |  |
| 2026-10-23 04:40 | 25 | persona sonnet journal/transfer | claude-sonnet-5-5 | 809 | 384 | $0.00546 | 4.2 |  |
| 2026-10-23 04:40 | 26 | persona sonnet summary/transfer | claude-sonnet-5-5 | 773 | 350 | $0.00505 | 3.9 |  |
| 2026-10-23 04:40 | 27 | persona sonnet rewrite/transfer | claude-sonnet-5-5 | 749 | 337 | $0.00487 | 3.7 |  |
| 2026-10-23 04:40 | 28 | persona sonnet none/transfer | claude-sonnet-5-5 | 129 | 296 | $0.00322 | 4.3 |  |
| 2026-10-23 04:40 | 29 | persona sonnet sham/transfer | claude-sonnet-5-5 | 805 | 346 | $0.00507 | 3.8 |  |
| 2026-10-23 04:40 | 30 | persona sonnet summary/thought | claude-sonnet-5-5 | 2213 | 557 | $0.01000 | 6.6 |  |
| 2026-10-23 04:40 | 31 | persona sonnet journal/thought | claude-sonnet-5-5 | 2338 | 716 | $0.01184 | 7.4 |  |
| 2026-10-23 04:40 | 32 | persona sonnet rewrite/thought | claude-sonnet-5-5 | 2114 | 554 | $0.00977 | 7.1 |  |
| 2026-10-23 04:40 | 33 | persona sonnet none/thought | claude-sonnet-5-5 | 125 | 587 | $0.00612 | 6.3 |  |
| 2026-10-23 04:40 | 34 | persona sonnet sham/thought | claude-sonnet-5-5 | 2124 | 638 | $0.01063 | 6.9 |  |
| 2026-10-23 04:40 | 35 | persona sonnet journal/thought | claude-sonnet-5-5 | 2098 | 558 | $0.00978 | 6.5 |  |
| 2026-10-23 04:40 | 36 | persona sonnet summary/thought | claude-sonnet-5-5 | 1896 | 565 | $0.00944 | 6.7 |  |
| 2026-10-23 04:40 | 37 | persona sonnet rewrite/thought | claude-sonnet-5-5 | 1815 | 530 | $0.00893 | 6.1 |  |
| 2026-10-23 04:40 | 38 | persona sonnet sham/thought | claude-sonnet-5-5 | 2360 | 512 | $0.00984 | 6 |  |
| 2026-10-23 04:40 | 39 | persona sonnet none/thought | claude-sonnet-5-5 | 147 | 528 | $0.00557 | 6.2 |  |
| 2026-10-23 04:40 | 40 | persona sonnet summary/thought | claude-sonnet-5-5 | 892 | 561 | $0.00739 | 6.5 |  |
| 2026-10-23 04:40 | 41 | persona sonnet journal/thought | claude-sonnet-5-5 | 900 | 703 | $0.00883 | 8.2 |  |
| 2026-10-23 04:40 | 42 | persona sonnet rewrite/thought | claude-sonnet-5-5 | 853 | 561 | $0.00732 | 6 |  |
| 2026-10-23 04:40 | 43 | persona sonnet none/thought | claude-sonnet-5-5 | 125 | 562 | $0.00587 | 6.4 |  |
| 2026-10-23 04:40 | 44 | persona sonnet sham/thought | claude-sonnet-5-5 | 805 | 568 | $0.00729 | 6.5 |  |
| 2026-10-23 04:40 | 45 | persona sonnet journal/thought | claude-sonnet-5-5 | 2112 | 642 | $0.01064 | 8.4 |  |
| 2026-10-23 04:40 | 46 | persona sonnet summary/thought | claude-sonnet-5-5 | 1922 | 506 | $0.00890 | 6.5 |  |
| 2026-10-23 04:40 | 47 | persona sonnet rewrite/thought | claude-sonnet-5-5 | 1859 | 653 | $0.01025 | 8.2 |  |
| 2026-10-23 04:40 | 48 | persona sonnet none/thought | claude-sonnet-5-5 | 113 | 517 | $0.00540 | 6.4 |  |
| 2026-10-23 04:40 | 49 | persona sonnet journal/thought | claude-sonnet-5-5 | 793 | 508 | $0.00667 | 5.8 |  |
| 2026-10-23 04:40 | 50 | persona sonnet sham/thought | claude-sonnet-5-5 | 2064 | 663 | $0.01076 | 7.7 |  |
| 2026-10-23 04:40 | 51 | persona sonnet summary/thought | claude-sonnet-5-5 | 757 | 468 | $0.00619 | 5.3 |  |
| 2026-10-23 04:40 | 52 | persona sonnet rewrite/thought | claude-sonnet-5-5 | 733 | 539 | $0.00686 | 6.5 |  |
| 2026-10-23 04:40 | 53 | persona sonnet none/thought | claude-sonnet-5-5 | 113 | 489 | $0.00512 | 5.6 |  |
| 2026-10-23 04:40 | 54 | persona sonnet sham/thought | claude-sonnet-5-5 | 789 | 503 | $0.00661 | 5.9 |  |
| 2026-10-23 04:40 | 55 | persona sonnet journal/thought | claude-sonnet-5-5 | 823 | 590 | $0.00755 | 8.4 |  |
| 2026-10-23 04:40 | 56 | persona sonnet summary/thought | claude-sonnet-5-5 | 788 | 629 | $0.00787 | 7.1 |  |
| 2026-10-23 04:40 | 57 | persona sonnet none/thought | claude-sonnet-5-5 | 147 | 473 | $0.00502 | 5.4 |  |
| 2026-10-23 04:40 | 58 | persona sonnet rewrite/thought | claude-sonnet-5-5 | 758 | 612 | $0.00764 | 7.4 |  |
| 2026-10-23 04:40 | 59 | persona sonnet sham/thought | claude-sonnet-5-5 | 922 | 511 | $0.00695 | 6 |  |
| 2026-10-23 04:40 | 60 | persona sonnet journal/thought | claude-sonnet-5-5 | 2338 | 577 | $0.01045 | 6.1 |  |
| 2026-10-23 04:40 | 61 | persona sonnet rewrite/thought | claude-sonnet-5-5 | 2114 | 479 | $0.00902 | 5.8 |  |
| 2026-10-23 04:40 | 62 | persona sonnet summary/thought | claude-sonnet-5-5 | 2213 | 634 | $0.01077 | 7.5 |  |
| 2026-10-23 04:40 | 63 | persona sonnet none/thought | claude-sonnet-5-5 | 125 | 600 | $0.00625 | 7.2 |  |
| 2026-10-23 04:40 | 64 | persona sonnet sham/thought | claude-sonnet-5-5 | 2124 | 601 | $0.01026 | 7.1 |  |
| 2026-10-23 04:40 | 65 | persona sonnet journal/thought | claude-sonnet-5-5 | 823 | 569 | $0.00734 | 6.1 |  |
| 2026-10-23 04:40 | 66 | persona sonnet summary/thought | claude-sonnet-5-5 | 788 | 656 | $0.00814 | 8 |  |
| 2026-10-23 04:40 | 67 | persona sonnet none/thought | claude-sonnet-5-5 | 147 | 547 | $0.00576 | 6.1 |  |
| 2026-10-23 04:40 | 68 | persona sonnet sham/thought | claude-sonnet-5-5 | 922 | 512 | $0.00696 | 6.1 |  |
| 2026-10-23 04:40 | 69 | persona sonnet journal/thought | claude-sonnet-5-5 | 793 | 500 | $0.00659 | 5.8 |  |
| 2026-10-23 04:40 | 70 | persona sonnet rewrite/thought | claude-sonnet-5-5 | 758 | 617 | $0.00769 | 10.7 |  |
| 2026-10-23 04:40 | 71 | persona sonnet summary/thought | claude-sonnet-5-5 | 757 | 433 | $0.00584 | 5.6 |  |
| 2026-10-23 04:40 | 72 | persona sonnet rewrite/thought | claude-sonnet-5-5 | 733 | 599 | $0.00746 | 7 |  |
| 2026-10-23 04:40 | 73 | persona sonnet none/thought | claude-sonnet-5-5 | 113 | 574 | $0.00597 | 6.3 |  |
| 2026-10-23 04:40 | 74 | persona sonnet sham/thought | claude-sonnet-5-5 | 789 | 482 | $0.00640 | 6 |  |
| 2026-10-23 04:40 | 75 | persona sonnet journal/thought | claude-sonnet-5-5 | 900 | 680 | $0.00860 | 8.1 |  |
| 2026-10-23 04:40 | 76 | persona sonnet summary/thought | claude-sonnet-5-5 | 892 | 707 | $0.00885 | 7.6 |  |
| 2026-10-23 04:40 | 77 | persona sonnet none/thought | claude-sonnet-5-5 | 125 | 575 | $0.00600 | 6.1 |  |
| 2026-10-23 04:40 | 78 | persona sonnet rewrite/thought | claude-sonnet-5-5 | 853 | 577 | $0.00748 | 6.3 |  |
| 2026-10-23 04:40 | 79 | persona sonnet sham/thought | claude-sonnet-5-5 | 805 | 570 | $0.00731 | 6.8 |  |
| 2026-10-23 04:40 | 80 | persona sonnet journal/voice | claude-sonnet-5-5 | 2116 | 822 | $0.01245 | 8.1 |  |
| 2026-10-23 04:40 | 81 | persona sonnet rewrite/voice | claude-sonnet-5-5 | 1833 | 725 | $0.01092 | 7.7 |  |
| 2026-10-23 04:40 | 82 | persona sonnet summary/voice | claude-sonnet-5-5 | 1914 | 812 | $0.01195 | 8.9 |  |
| 2026-10-23 04:40 | 83 | persona sonnet none/voice | claude-sonnet-5-5 | 165 | 752 | $0.00785 | 8.5 |  |
| 2026-10-23 04:40 | 84 | persona sonnet journal/voice | claude-sonnet-5-5 | 2380 | 707 | $0.01183 | 7 |  |
| 2026-10-23 04:40 | 85 | persona sonnet sham/voice | claude-sonnet-5-5 | 2378 | 775 | $0.01251 | 8.2 |  |
| 2026-10-23 04:40 | 86 | persona sonnet summary/voice | claude-sonnet-5-5 | 2255 | 1102 | $0.01553 | 10.3 |  |
| 2026-10-23 04:40 | 87 | persona sonnet rewrite/voice | claude-sonnet-5-5 | 2156 | 747 | $0.01178 | 7 |  |
| 2026-10-23 04:40 | 88 | persona sonnet none/voice | claude-sonnet-5-5 | 167 | 633 | $0.00666 | 6.6 |  |
| 2026-10-23 04:40 | 89 | persona sonnet sham/voice | claude-sonnet-5-5 | 2166 | 612 | $0.01045 | 6.7 |  |
| 2026-10-23 04:40 | 90 | persona sonnet summary/voice | claude-sonnet-5-5 | 1956 | 645 | $0.01036 | 6.6 |  |
| 2026-10-23 04:40 | 91 | persona sonnet journal/voice | claude-sonnet-5-5 | 2146 | 714 | $0.01143 | 7.3 |  |
| 2026-10-23 04:40 | 92 | persona sonnet rewrite/voice | claude-sonnet-5-5 | 1893 | 740 | $0.01119 | 8.1 |  |
| 2026-10-23 04:40 | 93 | persona sonnet none/voice | claude-sonnet-5-5 | 147 | 800 | $0.00829 | 9.4 |  |
| 2026-10-23 04:40 | 94 | persona sonnet sham/voice | claude-sonnet-5-5 | 2098 | 654 | $0.01074 | 7.2 |  |
| 2026-10-23 04:40 | 95 | persona sonnet journal/voice | claude-sonnet-5-5 | 841 | 658 | $0.00826 | 7 |  |
| 2026-10-23 04:40 | 96 | persona sonnet summary/voice | claude-sonnet-5-5 | 806 | 821 | $0.00982 | 8.5 |  |
| 2026-10-23 04:40 | 97 | persona sonnet none/voice | claude-sonnet-5-5 | 165 | 711 | $0.00744 | 6.7 |  |
| 2026-10-23 04:40 | 98 | persona sonnet rewrite/voice | claude-sonnet-5-5 | 776 | 850 | $0.01005 | 9.2 |  |
| 2026-10-23 04:40 | 99 | persona sonnet sham/voice | claude-sonnet-5-5 | 940 | 906 | $0.01094 | 9.9 |  |
| 2026-10-23 04:40 | 100 | persona sonnet journal/voice | claude-sonnet-5-5 | 827 | 589 | $0.00754 | 6.5 |  |
| 2026-10-23 04:40 | 101 | persona sonnet summary/voice | claude-sonnet-5-5 | 791 | 502 | $0.00660 | 5.7 |  |
| 2026-10-23 04:40 | 102 | persona sonnet rewrite/voice | claude-sonnet-5-5 | 767 | 514 | $0.00667 | 6.1 |  |
| 2026-10-23 04:40 | 103 | persona sonnet none/voice | claude-sonnet-5-5 | 147 | 610 | $0.00639 | 7 |  |
| 2026-10-23 04:40 | 104 | persona sonnet sham/voice | claude-sonnet-5-5 | 823 | 663 | $0.00828 | 8 |  |
| 2026-10-23 04:40 | 105 | persona sonnet journal/voice | claude-sonnet-5-5 | 942 | 789 | $0.00977 | 8.9 |  |
| 2026-10-23 04:40 | 106 | persona sonnet summary/voice | claude-sonnet-5-5 | 934 | 802 | $0.00989 | 7.8 |  |
| 2026-10-23 04:40 | 107 | persona sonnet rewrite/voice | claude-sonnet-5-5 | 895 | 686 | $0.00865 | 7.7 |  |
| 2026-10-23 04:40 | 108 | persona sonnet none/voice | claude-sonnet-5-5 | 167 | 609 | $0.00642 | 6.9 |  |
| 2026-10-23 04:40 | 109 | persona sonnet journal/voice | claude-sonnet-5-5 | 841 | 745 | $0.00913 | 7.4 |  |
| 2026-10-23 04:40 | 110 | persona sonnet sham/voice | claude-sonnet-5-5 | 847 | 596 | $0.00765 | 8.2 |  |
| 2026-10-23 04:40 | 111 | persona sonnet summary/voice | claude-sonnet-5-5 | 806 | 792 | $0.00953 | 8.2 |  |
| 2026-10-23 04:40 | 112 | persona sonnet rewrite/voice | claude-sonnet-5-5 | 776 | 791 | $0.00946 | 7.9 |  |
| 2026-10-23 04:40 | 113 | persona sonnet sham/voice | claude-sonnet-5-5 | 940 | 757 | $0.00945 | 8 |  |
| 2026-10-23 04:40 | 114 | persona sonnet none/voice | claude-sonnet-5-5 | 165 | 862 | $0.00895 | 9.4 |  |
| 2026-10-23 04:40 | 115 | persona sonnet journal/voice | claude-sonnet-5-5 | 827 | 515 | $0.00680 | 5.7 |  |
| 2026-10-23 04:40 | 116 | persona sonnet summary/voice | claude-sonnet-5-5 | 791 | 519 | $0.00677 | 6.5 |  |
| 2026-10-23 04:40 | 117 | persona sonnet rewrite/voice | claude-sonnet-5-5 | 767 | 588 | $0.00741 | 8.4 |  |
| 2026-10-23 04:40 | 118 | persona sonnet none/voice | claude-sonnet-5-5 | 147 | 638 | $0.00667 | 7.5 |  |
| 2026-10-23 04:40 | 119 | persona sonnet sham/voice | claude-sonnet-5-5 | 823 | 667 | $0.00832 | 7.9 |  |
| 2026-10-23 04:40 | 120 | persona sonnet journal/voice | claude-sonnet-5-5 | 942 | 669 | $0.00857 | 10.5 |  |
| 2026-10-23 04:40 | 121 | persona sonnet none/voice | claude-sonnet-5-5 | 167 | 554 | $0.00587 | 5.9 |  |
| 2026-10-23 04:40 | 122 | persona sonnet rewrite/voice | claude-sonnet-5-5 | 895 | 718 | $0.00897 | 7.7 |  |
| 2026-10-23 04:40 | 123 | persona sonnet summary/voice | claude-sonnet-5-5 | 934 | 949 | $0.01136 | 9 |  |
| 2026-10-23 04:40 | 124 | persona sonnet sham/voice | claude-sonnet-5-5 | 847 | 663 | $0.00832 | 7.8 |  |
| 2026-10-23 04:40 | 125 | persona sonnet journal/voice | claude-sonnet-5-5 | 2116 | 803 | $0.01226 | 8 |  |
| 2026-10-23 04:40 | 126 | persona sonnet rewrite/voice | claude-sonnet-5-5 | 1833 | 720 | $0.01087 | 7.2 |  |
| 2026-10-23 04:40 | 127 | persona sonnet summary/voice | claude-sonnet-5-5 | 1914 | 791 | $0.01174 | 9.1 |  |
| 2026-10-23 04:40 | 128 | persona sonnet none/voice | claude-sonnet-5-5 | 165 | 750 | $0.00783 | 8.6 |  |
| 2026-10-23 04:40 | 129 | persona sonnet sham/voice | claude-sonnet-5-5 | 2378 | 736 | $0.01212 | 7.7 |  |
| 2026-10-23 04:40 | 130 | judge 2 voice | claude-haiku-5-5 | 1084 | 89 | $0.00015 | 0.8 |  |
| 2026-10-23 04:40 | 131 | judge 2 thought | claude-haiku-5-5 | 1114 | 95 | $0.00016 | 0.8 |  |
| 2026-10-23 04:40 | 132 | judge 1 thought | claude-haiku-5-5 | 1114 | 93 | $0.00016 | 0.9 |  |
| 2026-10-23 04:40 | 133 | judge 1 voice | claude-haiku-5-5 | 1084 | 106 | $0.00016 | 0.9 |  |
| 2026-10-23 04:40 | 134 | judge 2 thought | claude-haiku-5-5 | 1077 | 114 | $0.00016 | 1 |  |
| 2026-10-23 04:40 | 135 | judge 1 thought | claude-haiku-5-5 | 1077 | 151 | $0.00018 | 1.4 |  |
| 2026-10-23 04:40 | 136 | judge 2 voice | claude-haiku-5-5 | 1029 | 98 | $0.00015 | 0.9 |  |
| 2026-10-23 04:40 | 137 | judge 1 voice | claude-haiku-5-5 | 1029 | 117 | $0.00016 | 1 |  |
| 2026-10-23 04:40 | 138 | judge 2 transfer | claude-haiku-5-5 | 919 | 99 | $0.00014 | 1.2 |  |
| 2026-10-23 04:40 | 139 | judge 1 transfer | claude-haiku-5-5 | 919 | 115 | $0.00015 | 1.3 |  |
| 2026-10-23 04:40 | 140 | judge 2 transfer | claude-haiku-5-5 | 835 | 129 | $0.00015 | 1 |  |
| 2026-10-23 04:40 | 141 | referee thought | claude-opus-5-5 | 1241 | 206 | $0.00908 | 2.7 |  |
| 2026-10-23 04:40 | 142 | judge 1 voice | claude-haiku-5-5 | 1115 | 98 | $0.00016 | 0.9 |  |
| 2026-10-23 04:40 | 143 | judge 2 voice | claude-haiku-5-5 | 1115 | 103 | $0.00016 | 0.9 |  |
| 2026-10-23 04:40 | 144 | judge 1 voice | claude-haiku-5-5 | 1231 | 126 | $0.00019 | 0.9 |  |
| 2026-10-23 04:40 | 145 | judge 2 voice | claude-haiku-5-5 | 1231 | 135 | $0.00019 | 0.9 |  |
| 2026-10-23 04:40 | 146 | judge 1 transfer | claude-haiku-5-5 | 835 | 130 | $0.00015 | 1.7 |  |
| 2026-10-23 04:40 | 147 | judge 2 voice | claude-haiku-5-5 | 1093 | 102 | $0.00016 | 0.9 |  |
| 2026-10-23 04:40 | 148 | judge 1 voice | claude-haiku-5-5 | 1093 | 94 | $0.00016 | 1 |  |
| 2026-10-23 04:40 | 149 | judge 2 voice | claude-haiku-5-5 | 1178 | 147 | $0.00019 | 1 |  |
| 2026-10-23 04:40 | 150 | judge 2 transfer | claude-haiku-5-5 | 856 | 94 | $0.00013 | 0.8 |  |
| 2026-10-23 04:40 | 151 | judge 1 voice | claude-haiku-5-5 | 1178 | 193 | $0.00021 | 1 |  |
| 2026-10-23 04:40 | 152 | judge 1 transfer | claude-haiku-5-5 | 856 | 102 | $0.00014 | 0.8 |  |
| 2026-10-23 04:40 | 153 | judge 2 thought | claude-haiku-5-5 | 1384 | 130 | $0.00020 | 1.1 |  |
| 2026-10-23 04:40 | 154 | judge 1 thought | claude-haiku-5-5 | 1384 | 149 | $0.00021 | 1.2 |  |
| 2026-10-23 04:40 | 155 | judge 1 transfer | claude-haiku-5-5 | 798 | 96 | $0.00013 | 0.9 |  |
| 2026-10-23 04:40 | 156 | judge 2 transfer | claude-haiku-5-5 | 798 | 118 | $0.00014 | 0.9 |  |
| 2026-10-23 04:40 | 157 | judge 2 transfer | claude-haiku-5-5 | 817 | 89 | $0.00013 | 0.8 |  |
| 2026-10-23 04:40 | 158 | judge 1 transfer | claude-haiku-5-5 | 860 | 129 | $0.00015 | 1.1 |  |
| 2026-10-23 04:40 | 159 | judge 2 transfer | claude-haiku-5-5 | 860 | 133 | $0.00015 | 1.1 |  |
| 2026-10-23 04:40 | 160 | judge 1 transfer | claude-haiku-5-5 | 817 | 128 | $0.00015 | 1.2 |  |
| 2026-10-23 04:40 | 161 | judge 1 thought | claude-haiku-5-5 | 1312 | 131 | $0.00020 | 1.1 |  |
| 2026-10-23 04:40 | 162 | judge 2 transfer | claude-haiku-5-5 | 825 | 129 | $0.00015 | 1 |  |
| 2026-10-23 04:40 | 163 | judge 1 transfer | claude-haiku-5-5 | 825 | 127 | $0.00015 | 1.1 |  |
| 2026-10-23 04:40 | 164 | judge 2 transfer | claude-haiku-5-5 | 910 | 86 | $0.00013 | 0.8 |  |
| 2026-10-23 04:40 | 165 | judge 1 transfer | claude-haiku-5-5 | 910 | 86 | $0.00013 | 0.8 |  |
| 2026-10-23 04:40 | 166 | judge 2 thought | claude-haiku-5-5 | 1312 | 154 | $0.00021 | 1.5 |  |
| 2026-10-23 04:40 | 167 | judge 1 voice | claude-haiku-5-5 | 1174 | 106 | $0.00017 | 0.9 |  |
| 2026-10-23 04:40 | 168 | judge 2 thought | claude-haiku-5-5 | 1307 | 116 | $0.00019 | 0.9 |  |
| 2026-10-23 04:40 | 169 | judge 2 voice | claude-haiku-5-5 | 1095 | 124 | $0.00017 | 0.9 |  |
| 2026-10-23 04:40 | 170 | judge 1 voice | claude-haiku-5-5 | 1095 | 121 | $0.00017 | 1 |  |
| 2026-10-23 04:40 | 171 | judge 1 thought | claude-haiku-5-5 | 1307 | 124 | $0.00019 | 1 |  |
| 2026-10-23 04:40 | 172 | judge 2 thought | claude-haiku-5-5 | 1223 | 152 | $0.00020 | 1.2 |  |
| 2026-10-23 04:40 | 173 | judge 1 thought | claude-haiku-5-5 | 1223 | 154 | $0.00020 | 1.2 |  |
| 2026-10-23 04:40 | 174 | judge 2 voice | claude-haiku-5-5 | 1174 | 126 | $0.00018 | 2.4 |  |
| 2026-10-23 04:40 | 175 | judge 2 voice | claude-haiku-5-5 | 1052 | 130 | $0.00017 | 1 |  |
| 2026-10-23 04:40 | 176 | judge 2 voice | claude-haiku-5-5 | 1084 | 120 | $0.00017 | 0.9 |  |
| 2026-10-23 04:40 | 177 | judge 1 voice | claude-haiku-5-5 | 1084 | 143 | $0.00018 | 1.2 |  |
| 2026-10-23 04:40 | 178 | judge 2 thought | claude-haiku-5-5 | 1146 | 142 | $0.00019 | 1.4 |  |
| 2026-10-23 04:40 | 179 | judge 1 thought | claude-haiku-5-5 | 1146 | 141 | $0.00019 | 1.7 |  |
| 2026-10-23 04:40 | 180 | judge 1 voice | claude-haiku-5-5 | 1021 | 88 | $0.00015 | 0.8 |  |
| 2026-10-23 04:40 | 181 | judge 1 transfer | claude-haiku-5-5 | 898 | 114 | $0.00015 | 1.3 |  |
| 2026-10-23 04:40 | 182 | judge 2 voice | claude-haiku-5-5 | 1021 | 111 | $0.00016 | 0.9 |  |
| 2026-10-23 04:40 | 183 | judge 2 transfer | claude-haiku-5-5 | 898 | 91 | $0.00014 | 1.6 |  |
| 2026-10-23 04:40 | 184 | judge 1 thought | claude-haiku-5-5 | 1114 | 105 | $0.00016 | 0.8 |  |
| 2026-10-23 04:40 | 185 | judge 2 thought | claude-haiku-5-5 | 1114 | 112 | $0.00017 | 0.8 |  |
| 2026-10-23 04:40 | 186 | judge 1 voice | claude-haiku-5-5 | 1052 | 615 | $0.00041 | 3 |  |
| 2026-10-23 04:40 | 187 | judge 1 transfer | claude-haiku-5-5 | 993 | 88 | $0.00014 | 0.7 |  |
| 2026-10-23 04:40 | 188 | judge 2 transfer | claude-haiku-5-5 | 993 | 103 | $0.00015 | 0.7 |  |
| 2026-10-23 04:40 | 189 | judge 1 voice | claude-haiku-5-5 | 1098 | 116 | $0.00017 | 0.9 |  |
| 2026-10-23 04:40 | 190 | judge 2 voice | claude-haiku-5-5 | 1098 | 117 | $0.00017 | 1 |  |
| 2026-10-23 04:40 | 191 | judge 2 thought | claude-haiku-5-5 | 1337 | 138 | $0.00020 | 1.1 |  |
| 2026-10-23 04:40 | 192 | judge 1 thought | claude-haiku-5-5 | 1337 | 145 | $0.00021 | 1.2 |  |
| 2026-10-23 04:40 | 193 | judge 1 voice | claude-haiku-5-5 | 1083 | 92 | $0.00015 | 0.9 |  |
| 2026-10-23 04:40 | 194 | judge 2 voice | claude-haiku-5-5 | 1083 | 99 | $0.00016 | 0.9 |  |
| 2026-10-23 04:40 | 195 | judge 2 transfer | claude-haiku-5-5 | 978 | 120 | $0.00016 | 0.7 |  |
| 2026-10-23 04:40 | 196 | judge 1 transfer | claude-haiku-5-5 | 978 | 124 | $0.00016 | 0.8 |  |
| 2026-10-23 04:40 | 197 | referee voice | claude-opus-5-5 | 1142 | 481 | $0.01419 | 6.1 |  |
| 2026-10-23 04:40 | 198 | referee voice | claude-opus-5-5 | 1001 | 552 | $0.01504 | 6.1 |  |
| 2026-10-23 04:40 | 199 | judge 2 voice | claude-haiku-5-5 | 1005 | 144 | $0.00017 | 1.1 |  |
| 2026-10-23 04:40 | 200 | judge 1 voice | claude-haiku-5-5 | 1005 | 126 | $0.00016 | 1.1 |  |
| 2026-10-23 04:40 | 201 | judge 1 voice | claude-haiku-5-5 | 1243 | 119 | $0.00018 | 1 |  |
| 2026-10-23 04:40 | 202 | judge 2 voice | claude-haiku-5-5 | 1243 | 274 | $0.00026 | 1.8 |  |
| 2026-10-23 04:40 | 203 | judge 2 transfer | claude-haiku-5-5 | 965 | 94 | $0.00014 | 0.9 |  |
| 2026-10-23 04:40 | 204 | judge 1 thought | claude-haiku-5-5 | 1239 | 132 | $0.00019 | 1.1 |  |
| 2026-10-23 04:40 | 205 | judge 2 thought | claude-haiku-5-5 | 1239 | 124 | $0.00019 | 1.1 |  |
| 2026-10-23 04:40 | 206 | judge 1 transfer | claude-haiku-5-5 | 965 | 102 | $0.00015 | 1.1 |  |
| 2026-10-23 04:40 | 207 | judge 2 transfer | claude-haiku-5-5 | 894 | 118 | $0.00015 | 0.9 |  |
| 2026-10-23 04:40 | 208 | referee recollection | claude-opus-5-5 | 3156 | 629 | $0.02520 | 7.5 |  |
| 2026-10-23 04:40 | 209 | judge 2 thought | claude-haiku-5-5 | 1131 | 131 | $0.00018 | 1 |  |
| 2026-10-23 04:40 | 210 | judge 1 transfer | claude-haiku-5-5 | 894 | 133 | $0.00016 | 1.1 |  |
| 2026-10-23 04:40 | 211 | judge 1 thought | claude-haiku-5-5 | 1258 | 115 | $0.00018 | 0.9 |  |
| 2026-10-23 04:40 | 212 | judge 2 thought | claude-haiku-5-5 | 1258 | 141 | $0.00020 | 1.1 |  |
| 2026-10-23 04:40 | 213 | judge 1 thought | claude-haiku-5-5 | 1131 | 170 | $0.00020 | 1.3 |  |
| 2026-10-23 04:40 | 214 | judge 1 transfer | claude-haiku-5-5 | 998 | 92 | $0.00015 | 0.9 |  |
| 2026-10-23 04:40 | 215 | judge 2 thought | claude-haiku-5-5 | 1197 | 130 | $0.00018 | 1.1 |  |
| 2026-10-23 04:40 | 216 | judge 2 transfer | claude-haiku-5-5 | 998 | 94 | $0.00015 | 0.9 |  |
| 2026-10-23 04:40 | 217 | judge 1 thought | claude-haiku-5-5 | 1197 | 136 | $0.00019 | 1.2 |  |
| 2026-10-23 04:40 | 218 | judge 1 voice | claude-haiku-5-5 | 1118 | 131 | $0.00018 | 0.9 |  |
| 2026-10-23 04:40 | 219 | judge 2 voice | claude-haiku-5-5 | 1069 | 407 | $0.00031 | 1.8 |  |
| 2026-10-23 04:40 | 220 | judge 2 voice | claude-haiku-5-5 | 1118 | 113 | $0.00017 | 1 |  |
| 2026-10-23 04:40 | 221 | judge 1 voice | claude-haiku-5-5 | 1069 | 407 | $0.00031 | 2 |  |
| 2026-10-23 04:40 | 222 | judge 2 voice | claude-haiku-5-5 | 955 | 310 | $0.00025 | 2.3 |  |
| 2026-10-23 04:40 | 223 | judge 1 voice | claude-haiku-5-5 | 955 | 289 | $0.00024 | 2.4 |  |
| 2026-10-23 04:40 | 224 | judge 2 thought | claude-haiku-5-5 | 1320 | 131 | $0.00020 | 1.4 |  |
| 2026-10-23 04:40 | 225 | judge 1 thought | claude-haiku-5-5 | 1320 | 129 | $0.00020 | 1.5 |  |
| 2026-10-23 04:40 | 226 | judge 2 thought | claude-haiku-5-5 | 1107 | 148 | $0.00018 | 1 |  |
| 2026-10-23 04:40 | 227 | judge 1 thought | claude-haiku-5-5 | 1107 | 129 | $0.00018 | 1 |  |
| 2026-10-23 04:40 | 228 | referee recollection | claude-opus-5-5 | 3179 | 267 | $0.01806 | 3.3 |  |
| 2026-10-23 04:40 | 229 | referee thought | claude-opus-5-5 | 1258 | 492 | $0.01487 | 5.8 |  |
| 2026-10-23 04:40 | 230 | judge 2 voice | claude-haiku-5-5 | 1124 | 486 | $0.00036 | 2.8 |  |
| 2026-10-23 04:40 | 231 | judge 1 voice | claude-haiku-5-5 | 1124 | 624 | $0.00042 | 3.4 |  |
| 2026-10-23 04:40 | 232 | judge 1 voice | claude-haiku-5-5 | 1043 | 366 | $0.00029 | 2.1 |  |
| 2026-10-23 04:40 | 233 | judge 2 voice | claude-haiku-5-5 | 1043 | 424 | $0.00032 | 2.2 |  |
| 2026-10-23 04:40 | 234 | judge 2 voice | claude-haiku-5-5 | 913 | 491 | $0.00034 | 2.6 |  |
| 2026-10-23 04:40 | 235 | judge 2 voice | claude-haiku-5-5 | 1086 | 100 | $0.00016 | 1.2 |  |
| 2026-10-23 04:40 | 236 | judge 1 voice | claude-haiku-5-5 | 1086 | 132 | $0.00017 | 1.3 |  |
| 2026-10-23 04:40 | 237 | judge 1 thought | claude-haiku-5-5 | 1125 | 124 | $0.00017 | 0.9 |  |
| 2026-10-23 04:40 | 238 | judge 2 thought | claude-haiku-5-5 | 1125 | 124 | $0.00017 | 0.9 |  |
| 2026-10-23 04:40 | 239 | judge 1 voice | claude-haiku-5-5 | 913 | 664 | $0.00042 | 3.7 |  |
| 2026-10-23 04:40 | 240 | judge 1 transfer | claude-haiku-5-5 | 857 | 117 | $0.00014 | 1.1 |  |
| 2026-10-23 04:40 | 241 | judge 2 transfer | claude-haiku-5-5 | 857 | 125 | $0.00015 | 1.2 |  |
| 2026-10-23 04:40 | 242 | judge 1 transfer | claude-haiku-5-5 | 804 | 112 | $0.00014 | 0.9 |  |
| 2026-10-23 04:40 | 243 | referee recollection | claude-opus-5-5 | 2910 | 469 | $0.02102 | 5.3 |  |
| 2026-10-23 04:40 | 244 | judge 2 transfer | claude-haiku-5-5 | 804 | 105 | $0.00013 | 1.1 |  |
| 2026-10-23 04:40 | 245 | judge 2 voice | claude-haiku-5-5 | 1142 | 93 | $0.00016 | 1.1 |  |
| 2026-10-23 04:40 | 246 | judge 1 voice | claude-haiku-5-5 | 1142 | 106 | $0.00017 | 1.2 |  |
| 2026-10-23 04:40 | 247 | judge 2 thought | claude-haiku-5-5 | 1300 | 127 | $0.00019 | 1 |  |
| 2026-10-23 04:40 | 248 | judge 1 thought | claude-haiku-5-5 | 1300 | 137 | $0.00020 | 1.1 |  |
| 2026-10-23 04:40 | 249 | referee voice | claude-opus-5-5 | 1124 | 539 | $0.01528 | 6.1 |  |
| 2026-10-23 04:40 | 250 | judge 1 thought | claude-haiku-5-5 | 1097 | 108 | $0.00016 | 0.9 |  |
| 2026-10-23 04:40 | 251 | judge 2 thought | claude-haiku-5-5 | 1097 | 104 | $0.00016 | 0.9 |  |
| 2026-10-23 04:40 | 252 | judge 1 thought | claude-haiku-5-5 | 1283 | 135 | $0.00020 | 0.9 |  |
| 2026-10-23 04:40 | 253 | judge 2 thought | claude-haiku-5-5 | 1283 | 135 | $0.00020 | 1 |  |
| 2026-10-23 04:40 | 254 | judge 1 thought | claude-haiku-5-5 | 1327 | 121 | $0.00019 | 1.1 |  |
| 2026-10-23 04:40 | 255 | judge 2 thought | claude-haiku-5-5 | 1327 | 135 | $0.00020 | 1.2 |  |
| 2026-10-23 04:40 | 256 | judge 1 voice | claude-haiku-5-5 | 1072 | 140 | $0.00018 | 0.9 |  |
| 2026-10-23 04:40 | 257 | judge 2 voice | claude-haiku-5-5 | 1072 | 138 | $0.00018 | 1 |  |
| 2026-10-23 04:40 | 258 | referee voice | claude-opus-5-5 | 913 | 446 | $0.01257 | 5.3 |  |
| 2026-10-23 04:40 | 259 | judge 1 voice | claude-haiku-5-5 | 1149 | 150 | $0.00019 | 1.1 |  |
| 2026-10-23 04:40 | 260 | judge 2 voice | claude-haiku-5-5 | 1149 | 398 | $0.00031 | 2.1 |  |
| 2026-10-23 04:40 | 261 | judge 1 voice | claude-haiku-5-5 | 1001 | 130 | $0.00017 | 1.4 |  |
| 2026-10-23 04:40 | 262 | judge 2 voice | claude-haiku-5-5 | 1001 | 133 | $0.00017 | 1.4 |  |
| 2026-10-23 04:40 | 263 | judge 2 thought | claude-haiku-5-5 | 1304 | 146 | $0.00020 | 1 |  |
| 2026-10-23 04:40 | 264 | judge 1 voice | claude-haiku-5-5 | 1081 | 467 | $0.00034 | 2.5 |  |
| 2026-10-23 04:40 | 265 | judge 2 thought | claude-haiku-5-5 | 1164 | 498 | $0.00037 | 3.1 |  |
| 2026-10-23 04:40 | 266 | judge 1 thought | claude-haiku-5-5 | 1304 | 167 | $0.00021 | 1.6 |  |
| 2026-10-23 04:40 | 267 | judge 1 thought | claude-haiku-5-5 | 1164 | 656 | $0.00044 | 3.6 |  |
| 2026-10-23 04:40 | 268 | judge 2 voice | claude-haiku-5-5 | 1081 | 574 | $0.00040 | 3.1 |  |
| 2026-10-23 04:40 | 269 | judge 1 voice | claude-haiku-5-5 | 1049 | 128 | $0.00017 | 1 |  |
| 2026-10-23 04:40 | 270 | judge 2 voice | claude-haiku-5-5 | 1049 | 132 | $0.00017 | 1.1 |  |
| 2026-10-23 04:40 | 271 | judge 1 voice | claude-haiku-5-5 | 983 | 118 | $0.00016 | 0.9 |  |
| 2026-10-23 04:40 | 272 | judge 2 voice | claude-haiku-5-5 | 983 | 119 | $0.00016 | 1 |  |
| 2026-10-23 04:40 | 273 | judge 2 voice | claude-haiku-5-5 | 1106 | 109 | $0.00017 | 1.4 |  |
| 2026-10-23 04:40 | 274 | judge 1 voice | claude-haiku-5-5 | 1106 | 104 | $0.00016 | 1.4 |  |
| 2026-10-23 04:40 | 275 | judge 1 voice | claude-haiku-5-5 | 1079 | 408 | $0.00031 | 2.3 |  |
| 2026-10-23 04:40 | 276 | judge 2 voice | claude-haiku-5-5 | 1079 | 421 | $0.00032 | 2.4 |  |
| 2026-10-23 04:40 | 277 | judge 2 thought | claude-haiku-5-5 | 1090 | 133 | $0.00018 | 1 |  |
| 2026-10-23 04:40 | 278 | judge 1 thought | claude-haiku-5-5 | 1090 | 161 | $0.00019 | 1.2 |  |
| 2026-10-23 04:40 | 279 | referee voice | claude-opus-5-5 | 1149 | 521 | $0.01502 | 5.9 |  |
| 2026-10-23 04:40 | 280 | referee thought | claude-opus-5-5 | 1164 | 321 | $0.01108 | 4.1 |  |
| 2026-10-23 04:40 | 281 | judge 2 transfer | claude-haiku-5-5 | 1056 | 99 | $0.00016 | 0.9 |  |
| 2026-10-23 04:40 | 282 | judge 1 transfer | claude-haiku-5-5 | 1056 | 95 | $0.00015 | 0.9 |  |
| 2026-10-23 04:40 | 283 | judge 2 thought | claude-haiku-5-5 | 1301 | 148 | $0.00020 | 1.5 |  |
| 2026-10-23 04:40 | 284 | judge 1 thought | claude-haiku-5-5 | 1301 | 113 | $0.00019 | 1.8 |  |
| 2026-10-23 04:40 | 285 | judge 2 thought | claude-haiku-5-5 | 1114 | 136 | $0.00018 | 1.3 |  |
| 2026-10-23 04:40 | 286 | judge 1 thought | claude-haiku-5-5 | 1114 | 144 | $0.00018 | 1.3 |  |
| 2026-10-23 04:40 | 287 | judge 2 voice | claude-haiku-5-5 | 957 | 102 | $0.00015 | 1 |  |
| 2026-10-23 04:40 | 288 | judge 1 voice | claude-haiku-5-5 | 957 | 115 | $0.00015 | 1.5 |  |
| 2026-10-23 04:40 | 289 | judge 1 transfer | claude-haiku-5-5 | 961 | 105 | $0.00015 | 0.8 |  |
| 2026-10-23 04:40 | 290 | judge 2 transfer | claude-haiku-5-5 | 961 | 99 | $0.00015 | 1 |  |
| 2026-10-23 04:40 | 291 | judge 2 thought | claude-haiku-5-5 | 1253 | 143 | $0.00020 | 1.2 |  |
| 2026-10-23 04:40 | 292 | judge 1 thought | claude-haiku-5-5 | 1253 | 140 | $0.00020 | 1.3 |  |
| 2026-10-23 04:40 | 293 | judge 2 transfer | claude-haiku-5-5 | 807 | 122 | $0.00014 | 0.9 |  |
| 2026-10-23 04:40 | 294 | judge 1 transfer | claude-haiku-5-5 | 807 | 122 | $0.00014 | 1 |  |
| 2026-10-23 04:40 | 295 | judge 1 thought | claude-haiku-5-5 | 1114 | 134 | $0.00018 | 1.1 |  |
| 2026-10-23 04:40 | 296 | judge 2 thought | claude-haiku-5-5 | 1114 | 159 | $0.00019 | 1.1 |  |
| 2026-10-23 04:40 | 297 | referee recollection | claude-opus-5-5 | 3167 | 270 | $0.01807 | 3.5 |  |
| 2026-10-23 04:40 | 298 | judge 1 thought | claude-haiku-5-5 | 1350 | 121 | $0.00020 | 1 |  |
| 2026-10-23 04:40 | 299 | judge 2 thought | claude-haiku-5-5 | 1350 | 148 | $0.00021 | 1.1 |  |
| 2026-10-23 04:40 | 300 | judge 1 voice | claude-haiku-5-5 | 1096 | 145 | $0.00018 | 1.1 |  |
| 2026-10-23 04:40 | 301 | judge 2 voice | claude-haiku-5-5 | 1096 | 141 | $0.00018 | 1.2 |  |
| 2026-10-23 04:40 | 302 | judge 2 thought | claude-haiku-5-5 | 1318 | 135 | $0.00020 | 1.2 |  |
| 2026-10-23 04:40 | 303 | judge 1 thought | claude-haiku-5-5 | 1318 | 159 | $0.00021 | 2 |  |
| 2026-10-23 04:40 | 304 | referee thought | claude-opus-5-5 | 1095 | 348 | $0.01134 | 4.4 |  |
| 2026-10-23 04:40 | 305 | judge 1 voice | claude-haiku-5-5 | 1091 | 393 | $0.00031 | 2.2 |  |
| 2026-10-23 04:40 | 306 | judge 2 thought | claude-haiku-5-5 | 1141 | 158 | $0.00019 | 1.9 |  |
| 2026-10-23 04:40 | 307 | judge 2 transfer | claude-haiku-5-5 | 859 | 132 | $0.00015 | 1.1 |  |
| 2026-10-23 04:40 | 308 | judge 1 transfer | claude-haiku-5-5 | 859 | 147 | $0.00016 | 1.6 |  |
| 2026-10-23 04:40 | 309 | judge 2 voice | claude-haiku-5-5 | 1091 | 438 | $0.00033 | 2.8 |  |
| 2026-10-23 04:40 | 310 | judge 1 thought | claude-haiku-5-5 | 1141 | 141 | $0.00018 | 2.8 |  |
| 2026-10-23 04:40 | 311 | judge 1 transfer | claude-haiku-5-5 | 1055 | 85 | $0.00015 | 0.9 |  |
| 2026-10-23 04:40 | 312 | judge 2 transfer | claude-haiku-5-5 | 1055 | 115 | $0.00016 | 0.9 |  |
| 2026-10-23 04:40 | 313 | judge 2 voice | claude-haiku-5-5 | 1119 | 363 | $0.00029 | 1.7 |  |
| 2026-10-23 04:40 | 314 | judge 2 voice | claude-haiku-5-5 | 1066 | 347 | $0.00028 | 1.8 |  |
| 2026-10-23 04:40 | 315 | judge 1 thought | claude-haiku-5-5 | 1141 | 374 | $0.00030 | 2.7 |  |
| 2026-10-23 04:40 | 316 | judge 2 thought | claude-haiku-5-5 | 1141 | 419 | $0.00032 | 2.8 |  |
| 2026-10-23 04:40 | 317 | judge 1 voice | claude-haiku-5-5 | 1119 | 374 | $0.00030 | 2.1 |  |
| 2026-10-23 04:40 | 318 | judge 1 voice | claude-haiku-5-5 | 1066 | 375 | $0.00029 | 2.2 |  |
| 2026-10-23 04:40 | 319 | judge 2 voice | claude-haiku-5-5 | 996 | 137 | $0.00017 | 1.4 |  |
| 2026-10-23 04:40 | 320 | judge 1 thought | claude-haiku-5-5 | 1375 | 124 | $0.00020 | 0.9 |  |
| 2026-10-23 04:40 | 321 | judge 2 thought | claude-haiku-5-5 | 1375 | 122 | $0.00020 | 0.9 |  |
| 2026-10-23 04:40 | 322 | judge 1 voice | claude-haiku-5-5 | 996 | 134 | $0.00017 | 1.7 |  |
| 2026-10-23 04:40 | 323 | judge 1 transfer | claude-haiku-5-5 | 930 | 96 | $0.00014 | 1 |  |
| 2026-10-23 04:40 | 324 | judge 1 thought | claude-haiku-5-5 | 1372 | 135 | $0.00020 | 1.2 |  |
| 2026-10-23 04:40 | 325 | judge 2 transfer | claude-haiku-5-5 | 930 | 97 | $0.00014 | 1.4 |  |
| 2026-10-23 04:40 | 326 | judge 2 thought | claude-haiku-5-5 | 1372 | 196 | $0.00024 | 1.4 |  |
| 2026-10-23 04:40 | 327 | judge 2 thought | claude-haiku-5-5 | 1128 | 121 | $0.00017 | 0.9 |  |
| 2026-10-23 04:40 | 328 | judge 1 thought | claude-haiku-5-5 | 1128 | 110 | $0.00017 | 1 |  |
| 2026-10-23 04:40 | 329 | judge 2 transfer | claude-haiku-5-5 | 819 | 123 | $0.00014 | 1 |  |
| 2026-10-23 04:40 | 330 | judge 1 voice | claude-haiku-5-5 | 1204 | 282 | $0.00026 | 1.7 |  |
| 2026-10-23 04:40 | 331 | judge 1 transfer | claude-haiku-5-5 | 819 | 118 | $0.00014 | 1.3 |  |
| 2026-10-23 04:40 | 332 | judge 2 voice | claude-haiku-5-5 | 1101 | 115 | $0.00017 | 1.1 |  |
| 2026-10-23 04:40 | 333 | judge 1 voice | claude-haiku-5-5 | 1101 | 99 | $0.00016 | 1.5 |  |
| 2026-10-23 04:40 | 334 | judge 2 voice | claude-haiku-5-5 | 1204 | 476 | $0.00036 | 2.5 |  |
| 2026-10-23 04:40 | 335 | judge 2 transfer | claude-haiku-5-5 | 906 | 122 | $0.00015 | 0.9 |  |
| 2026-10-23 04:40 | 336 | judge 1 voice | claude-haiku-5-5 | 1099 | 99 | $0.00016 | 0.9 |  |
| 2026-10-23 04:40 | 337 | judge 1 transfer | claude-haiku-5-5 | 906 | 111 | $0.00015 | 1.8 |  |
| 2026-10-23 04:40 | 338 | judge 2 voice | claude-haiku-5-5 | 1099 | 124 | $0.00017 | 1.1 |  |
| 2026-10-23 04:40 | 339 | judge 1 thought | claude-haiku-5-5 | 1172 | 126 | $0.00018 | 1.4 |  |
| 2026-10-23 04:40 | 340 | judge 2 thought | claude-haiku-5-5 | 1172 | 110 | $0.00017 | 1.4 |  |
| 2026-10-23 04:40 | 341 | judge 2 transfer | claude-haiku-5-5 | 876 | 100 | $0.00014 | 0.9 |  |
| 2026-10-23 04:40 | 342 | judge 1 transfer | claude-haiku-5-5 | 876 | 117 | $0.00015 | 1 |  |
| 2026-10-23 04:40 | 343 | referee thought | claude-opus-5-5 | 1372 | 331 | $0.01211 | 4.1 |  |
| 2026-10-23 04:40 | 344 | judge 1 voice | claude-haiku-5-5 | 957 | 117 | $0.00015 | 1 |  |
| 2026-10-23 04:40 | 345 | judge 2 voice | claude-haiku-5-5 | 957 | 129 | $0.00016 | 1 |  |
| 2026-10-23 04:40 | 346 | judge 1 voice | claude-haiku-5-5 | 1109 | 177 | $0.00020 | 1.6 |  |
| 2026-10-23 04:40 | 347 | judge 1 voice | claude-haiku-5-5 | 1090 | 112 | $0.00016 | 1 |  |
| 2026-10-23 04:40 | 348 | judge 2 voice | claude-haiku-5-5 | 1090 | 106 | $0.00016 | 1.1 |  |
| 2026-10-23 04:40 | 349 | judge 2 voice | claude-haiku-5-5 | 1013 | 132 | $0.00017 | 1 |  |
| 2026-10-23 04:40 | 350 | judge 1 voice | claude-haiku-5-5 | 1013 | 115 | $0.00016 | 1.5 |  |
| 2026-10-23 04:40 | 351 | judge 2 thought | claude-haiku-5-5 | 1311 | 124 | $0.00019 | 1 |  |
| 2026-10-23 04:40 | 352 | judge 1 thought | claude-haiku-5-5 | 1311 | 140 | $0.00020 | 1.1 |  |
| 2026-10-23 04:40 | 353 | judge 2 thought | claude-haiku-5-5 | 1154 | 119 | $0.00017 | 2.4 |  |
| 2026-10-23 04:40 | 354 | judge 2 voice | claude-haiku-5-5 | 1109 | 669 | $0.00045 | 3.8 |  |
| 2026-10-23 04:40 | 355 | judge 2 thought | claude-haiku-5-5 | 1149 | 146 | $0.00019 | 1.1 |  |
| 2026-10-23 04:40 | 356 | judge 1 thought | claude-haiku-5-5 | 1149 | 155 | $0.00019 | 1.3 |  |
| 2026-10-23 04:40 | 357 | judge 1 thought | claude-haiku-5-5 | 1154 | 594 | $0.00041 | 3.6 |  |
| 2026-10-23 04:40 | 358 | judge 1 voice | claude-haiku-5-5 | 1125 | 91 | $0.00016 | 0.9 |  |
| 2026-10-23 04:40 | 359 | judge 2 voice | claude-haiku-5-5 | 1125 | 92 | $0.00016 | 1 |  |
| 2026-10-23 04:40 | 360 | judge 2 thought | claude-haiku-5-5 | 1179 | 131 | $0.00018 | 1 |  |
| 2026-10-23 04:40 | 361 | judge 2 thought | claude-haiku-5-5 | 1146 | 123 | $0.00018 | 1.1 |  |
| 2026-10-23 04:40 | 362 | judge 1 thought | claude-haiku-5-5 | 1179 | 151 | $0.00019 | 1.2 |  |
| 2026-10-23 04:40 | 363 | judge 1 thought | claude-haiku-5-5 | 1146 | 139 | $0.00018 | 1.1 |  |
| 2026-10-23 04:40 | 364 | judge 2 voice | claude-haiku-5-5 | 971 | 158 | $0.00018 | 1.3 |  |
| 2026-10-23 04:40 | 365 | judge 1 thought | claude-haiku-5-5 | 1161 | 157 | $0.00019 | 1.3 |  |
| 2026-10-23 04:40 | 366 | judge 1 voice | claude-haiku-5-5 | 971 | 128 | $0.00016 | 2.3 |  |
| 2026-10-23 04:40 | 367 | judge 2 thought | claude-haiku-5-5 | 1161 | 157 | $0.00019 | 1.7 |  |
| 2026-10-23 04:40 | 368 | judge 1 thought | claude-haiku-5-5 | 1280 | 151 | $0.00020 | 1.3 |  |
| 2026-10-23 04:40 | 369 | judge 2 thought | claude-haiku-5-5 | 1280 | 160 | $0.00021 | 1.4 |  |
| 2026-10-23 04:40 | 370 | judge 1 thought | claude-haiku-5-5 | 1325 | 142 | $0.00020 | 1.2 |  |
| 2026-10-23 04:40 | 371 | judge 2 thought | claude-haiku-5-5 | 1325 | 120 | $0.00019 | 1.4 |  |
| 2026-10-23 04:40 | 372 | referee thought | claude-opus-5-5 | 1146 | 247 | $0.00952 | 3.2 |  |
| 2026-10-23 04:40 | 373 | referee thought | claude-opus-5-5 | 1079 | 563 | $0.01558 | 6.5 |  |
| 2026-10-23 04:40 | 374 | judge 2 voice | claude-haiku-5-5 | 949 | 123 | $0.00016 | 0.9 |  |
| 2026-10-23 04:40 | 375 | judge 1 thought | claude-haiku-5-5 | 1223 | 137 | $0.00019 | 1.3 |  |
| 2026-10-23 04:40 | 376 | judge 1 voice | claude-haiku-5-5 | 949 | 127 | $0.00016 | 1 |  |
| 2026-10-23 04:40 | 377 | judge 2 thought | claude-haiku-5-5 | 1223 | 144 | $0.00019 | 1.5 |  |
| 2026-10-23 04:40 | 378 | judge 1 thought | claude-haiku-5-5 | 1195 | 128 | $0.00018 | 1 |  |
| 2026-10-23 04:40 | 379 | judge 2 thought | claude-haiku-5-5 | 1195 | 152 | $0.00020 | 1.2 |  |
| 2026-10-23 04:40 | 380 | judge 2 thought | claude-haiku-5-5 | 1184 | 131 | $0.00018 | 1.1 |  |
| 2026-10-23 04:40 | 381 | judge 2 thought | claude-haiku-5-5 | 1136 | 122 | $0.00017 | 1 |  |
| 2026-10-23 04:40 | 382 | judge 1 thought | claude-haiku-5-5 | 1184 | 127 | $0.00018 | 1.2 |  |
| 2026-10-23 04:40 | 383 | judge 1 thought | claude-haiku-5-5 | 1136 | 132 | $0.00018 | 1.1 |  |
| 2026-10-23 04:40 | 384 | judge 2 thought | claude-haiku-5-5 | 1342 | 121 | $0.00019 | 1.1 |  |
| 2026-10-23 04:40 | 385 | judge 1 thought | claude-haiku-5-5 | 1342 | 135 | $0.00020 | 1.3 |  |
| 2026-10-23 04:40 | 386 | judge 1 voice | claude-haiku-5-5 | 1092 | 156 | $0.00019 | 1 |  |
| 2026-10-23 04:40 | 387 | judge 2 transfer | claude-haiku-5-5 | 902 | 99 | $0.00014 | 1 |  |
| 2026-10-23 04:40 | 388 | judge 1 transfer | claude-haiku-5-5 | 902 | 101 | $0.00014 | 1 |  |
| 2026-10-23 04:40 | 389 | judge 2 voice | claude-haiku-5-5 | 1092 | 123 | $0.00017 | 1.1 |  |
| 2026-10-23 04:40 | 390 | judge 1 transfer | claude-haiku-5-5 | 855 | 89 | $0.00013 | 0.8 |  |
| 2026-10-23 04:40 | 391 | judge 2 transfer | claude-haiku-5-5 | 855 | 102 | $0.00014 | 0.8 |  |
| 2026-10-23 04:40 | 392 | judge 2 transfer | claude-haiku-5-5 | 931 | 112 | $0.00015 | 1 |  |
| 2026-10-23 04:40 | 393 | judge 1 transfer | claude-haiku-5-5 | 832 | 124 | $0.00015 | 1 |  |
| 2026-10-23 04:40 | 394 | judge 2 transfer | claude-haiku-5-5 | 832 | 123 | $0.00014 | 1 |  |
| 2026-10-23 04:40 | 395 | judge 2 voice | claude-haiku-5-5 | 1093 | 91 | $0.00015 | 1 |  |
| 2026-10-23 04:40 | 396 | judge 1 voice | claude-haiku-5-5 | 1093 | 120 | $0.00017 | 1.2 |  |
| 2026-10-23 04:40 | 397 | judge 1 transfer | claude-haiku-5-5 | 931 | 99 | $0.00014 | 2 |  |
| 2026-10-23 04:40 | 398 | judge 2 thought | claude-haiku-5-5 | 1229 | 150 | $0.00020 | 1.2 |  |
| 2026-10-23 04:40 | 399 | judge 1 thought | claude-haiku-5-5 | 1229 | 150 | $0.00020 | 1.2 |  |
| 2026-10-23 04:40 | 400 | referee recollection | claude-opus-5-5 | 2967 | 484 | $0.02155 | 5.5 |  |
| 2026-10-23 04:40 | 401 | judge 2 voice | claude-haiku-5-5 | 1035 | 102 | $0.00015 | 0.8 |  |
| 2026-10-23 04:40 | 402 | judge 1 voice | claude-haiku-5-5 | 1035 | 90 | $0.00015 | 0.9 |  |
| 2026-10-23 04:40 | 403 | judge 2 thought | claude-haiku-5-5 | 1114 | 122 | $0.00017 | 1 |  |
| 2026-10-23 04:40 | 404 | judge 1 thought | claude-haiku-5-5 | 1114 | 113 | $0.00017 | 1 |  |
| 2026-10-23 04:40 | 405 | referee thought | claude-opus-5-5 | 1081 | 321 | $0.01074 | 3.9 |  |
