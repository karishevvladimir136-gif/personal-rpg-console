# Persona tone split 1 — the paid-call ledger

Cap $20. Spent **$9.5149** in 2797 calls over 1 run(s).
- 2026-10-23 23:31 UTC: persona-tone-split-1: opus+sonnet+fable × 5 arms × (5 probes + closed) × n 10, effort medium — 2797 calls, $9.5149 → `persona-tone-split-1-run-20261023-233114.json`

Prices per 1M tokens: Opus 5.5 input $4 / output $20; Sonnet 5.5 $2 / $10; Haiku 5.5 $0.10 / $0.50. Fable 5.1 input $10 / output $50. Output tokens include thinking. Judge: claude-haiku-5-5, referee claude-opus-5-5.

| Model — purpose | Calls | Input tokens | Output tokens | Cost |
| --- | --- | --- | --- | --- |
| claude-fable-5-1 — subject | 300 | 83422 | 82284 | $4.9484 |
| claude-haiku-5-5 — judge | 1792 | 1746566 | 322720 | $0.3360 |
| claude-opus-5-5 — subject | 300 | 84440 | 85060 | $2.0390 |
| claude-sonnet-5-5 — subject | 300 | 84440 | 86403 | $1.0329 |
| claude-opus-5-5 — referee | 105 | 129987 | 31931 | $1.1586 |

## Every call

| Run | # | Purpose | Model | Input | Output | Cost | Seconds | Error |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-23 23:31 | 1 | subject fable dismissal/Q4 | claude-fable-5-1 | 265 | 237 | $0.01450 | 4.1 |  |
| 2026-10-23 23:31 | 2 | judge 2 Q4 fable | claude-haiku-5-5 | 931 | 106 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 3 | judge 1 Q4 fable | claude-haiku-5-5 | 931 | 114 | $0.00015 | 1.9 |  |
| 2026-10-23 23:31 | 4 | subject opus invited/P5' | claude-opus-5-5 | 339 | 760 | $0.01656 | 9.1 |  |
| 2026-10-23 23:31 | 5 | judge 1 P5' opus | claude-haiku-5-5 | 1375 | 115 | $0.00019 | 1.1 |  |
| 2026-10-23 23:31 | 6 | judge 2 P5' opus | claude-haiku-5-5 | 1375 | 110 | $0.00019 | 1.3 |  |
| 2026-10-23 23:31 | 7 | subject sonnet both/P1' | claude-sonnet-5-5 | 335 | 278 | $0.00345 | 2.9 |  |
| 2026-10-23 23:31 | 8 | judge 1 P1' sonnet | claude-haiku-5-5 | 1385 | 508 | $0.00039 | 2.8 |  |
| 2026-10-23 23:31 | 9 | judge 2 P1' sonnet | claude-haiku-5-5 | 1385 | 568 | $0.00042 | 3.2 |  |
| 2026-10-23 23:31 | 10 | subject sonnet dismissal/Q1 | claude-sonnet-5-5 | 304 | 31 | $0.00092 | 0.8 |  |
| 2026-10-23 23:31 | 11 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 90 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 12 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 82 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 13 | subject fable brief/Q1 | claude-fable-5-1 | 284 | 188 | $0.01224 | 4 |  |
| 2026-10-23 23:31 | 14 | judge 1 Q1 fable | claude-haiku-5-5 | 899 | 84 | $0.00013 | 0.7 |  |
| 2026-10-23 23:31 | 15 | judge 2 Q1 fable | claude-haiku-5-5 | 899 | 93 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 16 | subject sonnet brief/Q1 | claude-sonnet-5-5 | 284 | 31 | $0.00088 | 0.9 |  |
| 2026-10-23 23:31 | 17 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 92 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 18 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 91 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 19 | subject fable brief/P1' | claude-fable-5-1 | 340 | 436 | $0.02520 | 8.4 |  |
| 2026-10-23 23:31 | 20 | judge 1 P1' fable | claude-haiku-5-5 | 1418 | 136 | $0.00021 | 1.2 |  |
| 2026-10-23 23:31 | 21 | judge 2 P1' fable | claude-haiku-5-5 | 1418 | 656 | $0.00047 | 3.4 |  |
| 2026-10-23 23:31 | 22 | referee P1' fable | claude-opus-5-5 | 1418 | 362 | $0.01291 | 4.2 |  |
| 2026-10-23 23:31 | 23 | subject sonnet brief/P5' | claude-sonnet-5-5 | 321 | 319 | $0.00383 | 3.3 |  |
| 2026-10-23 23:31 | 24 | judge 2 P5' sonnet | claude-haiku-5-5 | 1124 | 112 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 25 | judge 1 P5' sonnet | claude-haiku-5-5 | 1124 | 121 | $0.00017 | 1.9 |  |
| 2026-10-23 23:31 | 26 | subject sonnet both/Q1 | claude-sonnet-5-5 | 279 | 31 | $0.00087 | 1 |  |
| 2026-10-23 23:31 | 27 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 84 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 28 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 92 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 29 | subject fable both/Q1 | claude-fable-5-1 | 279 | 170 | $0.01129 | 2.8 |  |
| 2026-10-23 23:31 | 30 | judge 2 Q1 fable | claude-haiku-5-5 | 876 | 76 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 31 | judge 1 Q1 fable | claude-haiku-5-5 | 876 | 88 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 32 | subject fable neutral/Q4 | claude-fable-5-1 | 231 | 49 | $0.00476 | 1.4 |  |
| 2026-10-23 23:31 | 33 | judge 2 Q4 fable | claude-haiku-5-5 | 936 | 109 | $0.00015 | 1.6 |  |
| 2026-10-23 23:31 | 34 | judge 1 Q4 fable | claude-haiku-5-5 | 936 | 124 | $0.00016 | 1.7 |  |
| 2026-10-23 23:31 | 35 | subject fable brief/P4' | claude-fable-5-1 | 245 | 130 | $0.00895 | 4.1 |  |
| 2026-10-23 23:31 | 36 | judge 1 P4' fable | claude-haiku-5-5 | 818 | 102 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 37 | judge 2 P4' fable | claude-haiku-5-5 | 818 | 120 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 38 | subject fable invited/Q4 | claude-fable-5-1 | 263 | 296 | $0.01743 | 5.3 |  |
| 2026-10-23 23:31 | 39 | judge 2 Q4 fable | claude-haiku-5-5 | 1042 | 122 | $0.00017 | 1.5 |  |
| 2026-10-23 23:31 | 40 | judge 1 Q4 fable | claude-haiku-5-5 | 1042 | 142 | $0.00018 | 1.9 |  |
| 2026-10-23 23:31 | 41 | subject fable dismissal/P1' | claude-fable-5-1 | 360 | 439 | $0.02555 | 6.9 |  |
| 2026-10-23 23:31 | 42 | judge 1 P1' fable | claude-haiku-5-5 | 1293 | 370 | $0.00031 | 2.4 |  |
| 2026-10-23 23:31 | 43 | judge 2 P1' fable | claude-haiku-5-5 | 1293 | 402 | $0.00033 | 2.5 |  |
| 2026-10-23 23:31 | 44 | subject opus brief/P4' | claude-opus-5-5 | 245 | 170 | $0.00438 | 3.6 |  |
| 2026-10-23 23:31 | 45 | referee P1' fable | claude-opus-5-5 | 1293 | 343 | $0.01203 | 5 |  |
| 2026-10-23 23:31 | 46 | judge 2 P4' opus | claude-haiku-5-5 | 856 | 98 | $0.00013 | 1 |  |
| 2026-10-23 23:31 | 47 | judge 1 P4' opus | claude-haiku-5-5 | 856 | 81 | $0.00013 | 2.1 |  |
| 2026-10-23 23:31 | 48 | subject fable both/Q4 | claude-fable-5-1 | 240 | 180 | $0.01140 | 3 |  |
| 2026-10-23 23:31 | 49 | judge 1 Q4 fable | claude-haiku-5-5 | 938 | 114 | $0.00015 | 1.7 |  |
| 2026-10-23 23:31 | 50 | judge 2 Q4 fable | claude-haiku-5-5 | 938 | 117 | $0.00015 | 1.7 |  |
| 2026-10-23 23:31 | 51 | subject sonnet dismissal/C | claude-sonnet-5-5 | 251 | 40 | $0.00090 | 1 |  |
| 2026-10-23 23:31 | 52 | judge 1 C sonnet | claude-haiku-5-5 | 403 | 54 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 53 | judge 2 C sonnet | claude-haiku-5-5 | 403 | 61 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 54 | subject opus both/P4' | claude-opus-5-5 | 240 | 151 | $0.00398 | 2.5 |  |
| 2026-10-23 23:31 | 55 | judge 1 P4' opus | claude-haiku-5-5 | 837 | 68 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 56 | judge 2 P4' opus | claude-haiku-5-5 | 837 | 82 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 57 | subject sonnet brief/P4' | claude-sonnet-5-5 | 245 | 83 | $0.00132 | 1.4 |  |
| 2026-10-23 23:31 | 58 | judge 2 P4' sonnet | claude-haiku-5-5 | 801 | 87 | $0.00012 | 0.9 |  |
| 2026-10-23 23:31 | 59 | judge 1 P4' sonnet | claude-haiku-5-5 | 801 | 87 | $0.00012 | 2 |  |
| 2026-10-23 23:31 | 60 | subject sonnet invited/Q4 | claude-sonnet-5-5 | 263 | 478 | $0.00531 | 5.3 |  |
| 2026-10-23 23:31 | 61 | judge 2 Q4 sonnet | claude-haiku-5-5 | 1101 | 286 | $0.00025 | 1.7 |  |
| 2026-10-23 23:31 | 62 | judge 1 Q4 sonnet | claude-haiku-5-5 | 1101 | 311 | $0.00027 | 1.9 |  |
| 2026-10-23 23:31 | 63 | subject fable invited/P4' | claude-fable-5-1 | 263 | 297 | $0.01748 | 5.5 |  |
| 2026-10-23 23:31 | 64 | judge 1 P4' fable | claude-haiku-5-5 | 971 | 180 | $0.00019 | 1.3 |  |
| 2026-10-23 23:31 | 65 | judge 2 P4' fable | claude-haiku-5-5 | 971 | 179 | $0.00019 | 1.4 |  |
| 2026-10-23 23:31 | 66 | subject opus neutral/Q4 | claude-opus-5-5 | 231 | 124 | $0.00340 | 2.3 |  |
| 2026-10-23 23:31 | 67 | judge 1 Q4 opus | claude-haiku-5-5 | 964 | 118 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 68 | judge 2 Q4 opus | claude-haiku-5-5 | 964 | 131 | $0.00016 | 1.3 |  |
| 2026-10-23 23:31 | 69 | subject sonnet neutral/P1' | claude-sonnet-5-5 | 326 | 928 | $0.00993 | 8.4 |  |
| 2026-10-23 23:31 | 70 | judge 1 P1' sonnet | claude-haiku-5-5 | 1556 | 600 | $0.00046 | 5.1 |  |
| 2026-10-23 23:31 | 71 | judge 2 P1' sonnet | claude-haiku-5-5 | 1556 | 516 | $0.00041 | 5.3 |  |
| 2026-10-23 23:31 | 72 | subject fable neutral/P5' | claude-fable-5-1 | 307 | 506 | $0.02837 | 7 |  |
| 2026-10-23 23:31 | 73 | judge 1 P5' fable | claude-haiku-5-5 | 1202 | 137 | $0.00019 | 1 |  |
| 2026-10-23 23:31 | 74 | judge 2 P5' fable | claude-haiku-5-5 | 1202 | 113 | $0.00018 | 1.2 |  |
| 2026-10-23 23:31 | 75 | referee P5' fable | claude-opus-5-5 | 1202 | 101 | $0.00683 | 1.9 |  |
| 2026-10-23 23:31 | 76 | subject sonnet invited/P5' | claude-sonnet-5-5 | 339 | 613 | $0.00681 | 5.6 |  |
| 2026-10-23 23:31 | 77 | judge 1 P5' sonnet | claude-haiku-5-5 | 1314 | 121 | $0.00019 | 0.9 |  |
| 2026-10-23 23:31 | 78 | judge 2 P5' sonnet | claude-haiku-5-5 | 1314 | 138 | $0.00020 | 1.3 |  |
| 2026-10-23 23:31 | 79 | subject sonnet invited/P4' | claude-sonnet-5-5 | 263 | 576 | $0.00629 | 5.5 |  |
| 2026-10-23 23:31 | 80 | judge 1 P4' sonnet | claude-haiku-5-5 | 1019 | 189 | $0.00020 | 1.4 |  |
| 2026-10-23 23:31 | 81 | judge 2 P4' sonnet | claude-haiku-5-5 | 1019 | 170 | $0.00019 | 2.2 |  |
| 2026-10-23 23:31 | 82 | subject opus neutral/Q1 | claude-opus-5-5 | 270 | 218 | $0.00544 | 2.8 |  |
| 2026-10-23 23:31 | 83 | judge 2 Q1 opus | claude-haiku-5-5 | 936 | 96 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 84 | judge 1 Q1 opus | claude-haiku-5-5 | 936 | 115 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 85 | subject fable neutral/C | claude-fable-5-1 | 217 | 44 | $0.00437 | 1.2 |  |
| 2026-10-23 23:31 | 86 | judge 1 C fable | claude-haiku-5-5 | 407 | 53 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 87 | judge 2 C fable | claude-haiku-5-5 | 407 | 54 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 88 | subject sonnet both/P4' | claude-sonnet-5-5 | 240 | 109 | $0.00157 | 1.7 |  |
| 2026-10-23 23:31 | 89 | judge 2 P4' sonnet | claude-haiku-5-5 | 827 | 70 | $0.00012 | 0.9 |  |
| 2026-10-23 23:31 | 90 | judge 1 P4' sonnet | claude-haiku-5-5 | 827 | 72 | $0.00012 | 0.9 |  |
| 2026-10-23 23:31 | 91 | subject fable both/P5' | claude-fable-5-1 | 316 | 340 | $0.02016 | 4.7 |  |
| 2026-10-23 23:31 | 92 | judge 2 P5' fable | claude-haiku-5-5 | 1133 | 411 | $0.00032 | 3.3 |  |
| 2026-10-23 23:31 | 93 | judge 1 P5' fable | claude-haiku-5-5 | 1133 | 533 | $0.00038 | 3.8 |  |
| 2026-10-23 23:31 | 94 | subject sonnet invited/C | claude-sonnet-5-5 | 249 | 475 | $0.00525 | 4.4 |  |
| 2026-10-23 23:31 | 95 | judge 2 C sonnet | claude-haiku-5-5 | 572 | 74 | $0.00009 | 0.8 |  |
| 2026-10-23 23:31 | 96 | judge 1 C sonnet | claude-haiku-5-5 | 572 | 82 | $0.00010 | 0.9 |  |
| 2026-10-23 23:31 | 97 | subject opus neutral/P5' | claude-opus-5-5 | 307 | 426 | $0.00975 | 5.1 |  |
| 2026-10-23 23:31 | 98 | judge 2 P5' opus | claude-haiku-5-5 | 1228 | 465 | $0.00036 | 2.6 |  |
| 2026-10-23 23:31 | 99 | judge 1 P5' opus | claude-haiku-5-5 | 1228 | 520 | $0.00038 | 2.8 |  |
| 2026-10-23 23:31 | 100 | subject sonnet invited/Q1 | claude-sonnet-5-5 | 302 | 401 | $0.00461 | 3.9 |  |
| 2026-10-23 23:31 | 101 | judge 1 Q1 sonnet | claude-haiku-5-5 | 1001 | 104 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 102 | judge 2 Q1 sonnet | claude-haiku-5-5 | 1001 | 119 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 103 | subject sonnet neutral/C | claude-sonnet-5-5 | 217 | 52 | $0.00095 | 0.9 |  |
| 2026-10-23 23:31 | 104 | judge 2 C sonnet | claude-haiku-5-5 | 415 | 54 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 105 | judge 1 C sonnet | claude-haiku-5-5 | 415 | 62 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 106 | subject opus brief/Q4 | claude-opus-5-5 | 245 | 103 | $0.00304 | 2.5 |  |
| 2026-10-23 23:31 | 107 | judge 1 Q4 opus | claude-haiku-5-5 | 951 | 120 | $0.00016 | 0.9 |  |
| 2026-10-23 23:31 | 108 | judge 2 Q4 opus | claude-haiku-5-5 | 951 | 144 | $0.00017 | 1.1 |  |
| 2026-10-23 23:31 | 109 | subject opus invited/Q1 | claude-opus-5-5 | 302 | 334 | $0.00789 | 4.6 |  |
| 2026-10-23 23:31 | 110 | judge 1 Q1 opus | claude-haiku-5-5 | 1050 | 115 | $0.00016 | 1.4 |  |
| 2026-10-23 23:31 | 111 | judge 2 Q1 opus | claude-haiku-5-5 | 1050 | 229 | $0.00022 | 2.5 |  |
| 2026-10-23 23:31 | 112 | subject opus both/Q1 | claude-opus-5-5 | 279 | 132 | $0.00376 | 2.3 |  |
| 2026-10-23 23:31 | 113 | judge 2 Q1 opus | claude-haiku-5-5 | 885 | 79 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 114 | judge 1 Q1 opus | claude-haiku-5-5 | 885 | 78 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 115 | subject fable both/P1' | claude-fable-5-1 | 335 | 455 | $0.02610 | 7.3 |  |
| 2026-10-23 23:31 | 116 | judge 2 P1' fable | claude-haiku-5-5 | 1312 | 392 | $0.00033 | 2.1 |  |
| 2026-10-23 23:31 | 117 | judge 1 P1' fable | claude-haiku-5-5 | 1312 | 484 | $0.00037 | 2.4 |  |
| 2026-10-23 23:31 | 118 | subject fable dismissal/C | claude-fable-5-1 | 251 | 40 | $0.00451 | 1.4 |  |
| 2026-10-23 23:31 | 119 | judge 1 C fable | claude-haiku-5-5 | 403 | 63 | $0.00007 | 1 |  |
| 2026-10-23 23:31 | 120 | judge 2 C fable | claude-haiku-5-5 | 403 | 53 | $0.00007 | 1.2 |  |
| 2026-10-23 23:31 | 121 | subject sonnet neutral/P4' | claude-sonnet-5-5 | 231 | 283 | $0.00329 | 3.1 |  |
| 2026-10-23 23:31 | 122 | judge 1 P4' sonnet | claude-haiku-5-5 | 1001 | 374 | $0.00029 | 2.2 |  |
| 2026-10-23 23:31 | 123 | judge 2 P4' sonnet | claude-haiku-5-5 | 1001 | 336 | $0.00027 | 2.2 |  |
| 2026-10-23 23:31 | 124 | subject sonnet brief/Q4 | claude-sonnet-5-5 | 245 | 56 | $0.00105 | 1.1 |  |
| 2026-10-23 23:31 | 125 | judge 2 Q4 sonnet | claude-haiku-5-5 | 943 | 106 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 126 | judge 1 Q4 sonnet | claude-haiku-5-5 | 943 | 133 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 127 | subject fable both/P4' | claude-fable-5-1 | 240 | 128 | $0.00880 | 2.2 |  |
| 2026-10-23 23:31 | 128 | judge 2 P4' fable | claude-haiku-5-5 | 806 | 100 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 129 | judge 1 P4' fable | claude-haiku-5-5 | 806 | 100 | $0.00013 | 1 |  |
| 2026-10-23 23:31 | 130 | subject opus brief/C | claude-opus-5-5 | 231 | 74 | $0.00240 | 2.1 |  |
| 2026-10-23 23:31 | 131 | judge 2 C opus | claude-haiku-5-5 | 408 | 60 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 132 | judge 1 C opus | claude-haiku-5-5 | 408 | 68 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 133 | subject opus brief/Q1 | claude-opus-5-5 | 284 | 191 | $0.00496 | 3.2 |  |
| 2026-10-23 23:31 | 134 | judge 1 Q1 opus | claude-haiku-5-5 | 885 | 76 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 135 | judge 2 Q1 opus | claude-haiku-5-5 | 885 | 91 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 136 | subject opus neutral/P1' | claude-opus-5-5 | 326 | 519 | $0.01168 | 6.5 |  |
| 2026-10-23 23:31 | 137 | judge 2 P1' opus | claude-haiku-5-5 | 1431 | 396 | $0.00034 | 2.2 |  |
| 2026-10-23 23:31 | 138 | judge 1 P1' opus | claude-haiku-5-5 | 1431 | 606 | $0.00045 | 3.4 |  |
| 2026-10-23 23:31 | 139 | subject opus invited/C | claude-opus-5-5 | 249 | 414 | $0.00928 | 5.9 |  |
| 2026-10-23 23:31 | 140 | judge 1 C opus | claude-haiku-5-5 | 593 | 70 | $0.00009 | 1.5 |  |
| 2026-10-23 23:31 | 141 | judge 2 C opus | claude-haiku-5-5 | 593 | 72 | $0.00010 | 1.7 |  |
| 2026-10-23 23:31 | 142 | subject fable brief/Q4 | claude-fable-5-1 | 245 | 43 | $0.00460 | 1.5 |  |
| 2026-10-23 23:31 | 143 | judge 1 Q4 fable | claude-haiku-5-5 | 930 | 96 | $0.00014 | 1.2 |  |
| 2026-10-23 23:31 | 144 | judge 2 Q4 fable | claude-haiku-5-5 | 930 | 98 | $0.00014 | 1.7 |  |
| 2026-10-23 23:31 | 145 | subject sonnet both/Q4 | claude-sonnet-5-5 | 240 | 43 | $0.00091 | 1 |  |
| 2026-10-23 23:31 | 146 | judge 2 Q4 sonnet | claude-haiku-5-5 | 930 | 103 | $0.00014 | 1 |  |
| 2026-10-23 23:31 | 147 | judge 1 Q4 sonnet | claude-haiku-5-5 | 930 | 109 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 148 | subject fable brief/P5' | claude-fable-5-1 | 321 | 341 | $0.02026 | 5 |  |
| 2026-10-23 23:31 | 149 | judge 2 P5' fable | claude-haiku-5-5 | 1133 | 129 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 150 | judge 1 P5' fable | claude-haiku-5-5 | 1133 | 152 | $0.00019 | 1.3 |  |
| 2026-10-23 23:31 | 151 | subject fable both/C | claude-fable-5-1 | 226 | 44 | $0.00446 | 1.3 |  |
| 2026-10-23 23:31 | 152 | judge 2 C fable | claude-haiku-5-5 | 407 | 55 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 153 | judge 1 C fable | claude-haiku-5-5 | 407 | 54 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 154 | subject opus dismissal/P5' | claude-opus-5-5 | 341 | 368 | $0.00872 | 7.5 |  |
| 2026-10-23 23:31 | 155 | judge 2 P5' opus | claude-haiku-5-5 | 1124 | 139 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 156 | judge 1 P5' opus | claude-haiku-5-5 | 1124 | 148 | $0.00019 | 1.2 |  |
| 2026-10-23 23:31 | 157 | subject opus both/C | claude-opus-5-5 | 226 | 69 | $0.00228 | 1.5 |  |
| 2026-10-23 23:31 | 158 | judge 2 C opus | claude-haiku-5-5 | 400 | 50 | $0.00006 | 0.7 |  |
| 2026-10-23 23:31 | 159 | judge 1 C opus | claude-haiku-5-5 | 400 | 57 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 160 | referee P5' opus | claude-opus-5-5 | 1124 | 324 | $0.01098 | 4.4 |  |
| 2026-10-23 23:31 | 161 | subject fable dismissal/Q1 | claude-fable-5-1 | 304 | 99 | $0.00799 | 1.8 |  |
| 2026-10-23 23:31 | 162 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 72 | $0.00012 | 0.7 |  |
| 2026-10-23 23:31 | 163 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 77 | $0.00013 | 0.7 |  |
| 2026-10-23 23:31 | 164 | subject fable invited/P5' | claude-fable-5-1 | 339 | 515 | $0.02914 | 7.7 |  |
| 2026-10-23 23:31 | 165 | judge 2 P5' fable | claude-haiku-5-5 | 1279 | 130 | $0.00019 | 1.3 |  |
| 2026-10-23 23:31 | 166 | judge 1 P5' fable | claude-haiku-5-5 | 1279 | 121 | $0.00019 | 1.6 |  |
| 2026-10-23 23:31 | 167 | subject sonnet neutral/Q4 | claude-sonnet-5-5 | 231 | 87 | $0.00133 | 1.5 |  |
| 2026-10-23 23:31 | 168 | judge 1 Q4 sonnet | claude-haiku-5-5 | 974 | 107 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 169 | judge 2 Q4 sonnet | claude-haiku-5-5 | 974 | 106 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 170 | subject opus invited/P4' | claude-opus-5-5 | 263 | 586 | $0.01277 | 8.4 |  |
| 2026-10-23 23:31 | 171 | judge 2 P4' opus | claude-haiku-5-5 | 1061 | 196 | $0.00020 | 1.5 |  |
| 2026-10-23 23:31 | 172 | judge 1 P4' opus | claude-haiku-5-5 | 1061 | 189 | $0.00020 | 2.1 |  |
| 2026-10-23 23:31 | 173 | subject sonnet brief/P1' | claude-sonnet-5-5 | 340 | 569 | $0.00637 | 5.4 |  |
| 2026-10-23 23:31 | 174 | judge 1 P1' sonnet | claude-haiku-5-5 | 1414 | 175 | $0.00023 | 1.3 |  |
| 2026-10-23 23:31 | 175 | judge 2 P1' sonnet | claude-haiku-5-5 | 1414 | 175 | $0.00023 | 1.3 |  |
| 2026-10-23 23:31 | 176 | subject fable dismissal/P5' | claude-fable-5-1 | 341 | 365 | $0.02166 | 5.4 |  |
| 2026-10-23 23:31 | 177 | judge 1 P5' fable | claude-haiku-5-5 | 1055 | 93 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 178 | judge 2 P5' fable | claude-haiku-5-5 | 1055 | 92 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 179 | subject fable neutral/Q1 | claude-fable-5-1 | 270 | 206 | $0.01300 | 3.1 |  |
| 2026-10-23 23:31 | 180 | judge 1 Q1 fable | claude-haiku-5-5 | 909 | 79 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 181 | judge 2 Q1 fable | claude-haiku-5-5 | 909 | 82 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 182 | subject sonnet dismissal/P1' | claude-sonnet-5-5 | 360 | 666 | $0.00738 | 6.4 |  |
| 2026-10-23 23:31 | 183 | judge 1 P1' sonnet | claude-haiku-5-5 | 1363 | 481 | $0.00038 | 2.9 |  |
| 2026-10-23 23:31 | 184 | judge 2 P1' sonnet | claude-haiku-5-5 | 1363 | 555 | $0.00041 | 3.1 |  |
| 2026-10-23 23:31 | 185 | subject opus invited/Q4 | claude-opus-5-5 | 263 | 393 | $0.00891 | 5.8 |  |
| 2026-10-23 23:31 | 186 | judge 2 Q4 opus | claude-haiku-5-5 | 1054 | 130 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 187 | judge 1 Q4 opus | claude-haiku-5-5 | 1054 | 101 | $0.00016 | 1.5 |  |
| 2026-10-23 23:31 | 188 | subject opus dismissal/Q1 | claude-opus-5-5 | 304 | 85 | $0.00292 | 1.3 |  |
| 2026-10-23 23:31 | 189 | judge 2 Q1 opus | claude-haiku-5-5 | 875 | 73 | $0.00012 | 0.7 |  |
| 2026-10-23 23:31 | 190 | judge 1 Q1 opus | claude-haiku-5-5 | 875 | 77 | $0.00013 | 0.7 |  |
| 2026-10-23 23:31 | 191 | subject fable dismissal/P4' | claude-fable-5-1 | 265 | 189 | $0.01210 | 3.4 |  |
| 2026-10-23 23:31 | 192 | judge 1 P4' fable | claude-haiku-5-5 | 847 | 102 | $0.00014 | 1 |  |
| 2026-10-23 23:31 | 193 | judge 2 P4' fable | claude-haiku-5-5 | 847 | 104 | $0.00014 | 1 |  |
| 2026-10-23 23:31 | 194 | subject opus dismissal/Q4 | claude-opus-5-5 | 265 | 215 | $0.00536 | 3.9 |  |
| 2026-10-23 23:31 | 195 | judge 2 Q4 opus | claude-haiku-5-5 | 921 | 156 | $0.00017 | 1.4 |  |
| 2026-10-23 23:31 | 196 | judge 1 Q4 opus | claude-haiku-5-5 | 921 | 119 | $0.00015 | 1.6 |  |
| 2026-10-23 23:31 | 197 | subject sonnet both/P5' | claude-sonnet-5-5 | 316 | 317 | $0.00380 | 3.2 |  |
| 2026-10-23 23:31 | 198 | judge 1 P5' sonnet | claude-haiku-5-5 | 1087 | 126 | $0.00017 | 1.1 |  |
| 2026-10-23 23:31 | 199 | judge 2 P5' sonnet | claude-haiku-5-5 | 1087 | 124 | $0.00017 | 1.6 |  |
| 2026-10-23 23:31 | 200 | subject sonnet dismissal/P4' | claude-sonnet-5-5 | 265 | 129 | $0.00182 | 2.4 |  |
| 2026-10-23 23:31 | 201 | judge 1 P4' sonnet | claude-haiku-5-5 | 847 | 71 | $0.00012 | 1.2 |  |
| 2026-10-23 23:31 | 202 | judge 2 P4' sonnet | claude-haiku-5-5 | 847 | 88 | $0.00013 | 1.4 |  |
| 2026-10-23 23:31 | 203 | subject sonnet neutral/P5' | claude-sonnet-5-5 | 307 | 583 | $0.00644 | 4.6 |  |
| 2026-10-23 23:31 | 204 | judge 2 P5' sonnet | claude-haiku-5-5 | 1169 | 122 | $0.00018 | 1 |  |
| 2026-10-23 23:31 | 205 | judge 1 P5' sonnet | claude-haiku-5-5 | 1169 | 111 | $0.00017 | 1.1 |  |
| 2026-10-23 23:31 | 206 | referee P5' sonnet | claude-opus-5-5 | 1169 | 193 | $0.00854 | 2.6 |  |
| 2026-10-23 23:31 | 207 | subject fable brief/C | claude-fable-5-1 | 231 | 44 | $0.00451 | 1.2 |  |
| 2026-10-23 23:31 | 208 | judge 1 C fable | claude-haiku-5-5 | 407 | 58 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 209 | judge 2 C fable | claude-haiku-5-5 | 407 | 54 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 210 | subject fable invited/C | claude-fable-5-1 | 249 | 340 | $0.01949 | 5.2 |  |
| 2026-10-23 23:31 | 211 | judge 2 C fable | claude-haiku-5-5 | 526 | 69 | $0.00009 | 0.8 |  |
| 2026-10-23 23:31 | 212 | judge 1 C fable | claude-haiku-5-5 | 526 | 71 | $0.00009 | 0.8 |  |
| 2026-10-23 23:31 | 213 | subject opus neutral/P4' | claude-opus-5-5 | 231 | 234 | $0.00560 | 3.5 |  |
| 2026-10-23 23:31 | 214 | judge 2 P4' opus | claude-haiku-5-5 | 917 | 111 | $0.00015 | 1.6 |  |
| 2026-10-23 23:31 | 215 | judge 1 P4' opus | claude-haiku-5-5 | 917 | 464 | $0.00032 | 2.9 |  |
| 2026-10-23 23:31 | 216 | subject opus both/P1' | claude-opus-5-5 | 335 | 333 | $0.00800 | 4 |  |
| 2026-10-23 23:31 | 217 | referee P4' opus | claude-opus-5-5 | 917 | 209 | $0.00785 | 5 |  |
| 2026-10-23 23:31 | 218 | judge 2 P1' opus | claude-haiku-5-5 | 1273 | 411 | $0.00033 | 2.3 |  |
| 2026-10-23 23:31 | 219 | judge 1 P1' opus | claude-haiku-5-5 | 1273 | 505 | $0.00038 | 2.9 |  |
| 2026-10-23 23:31 | 220 | subject opus dismissal/P1' | claude-opus-5-5 | 360 | 424 | $0.00992 | 5.3 |  |
| 2026-10-23 23:31 | 221 | judge 1 P1' opus | claude-haiku-5-5 | 1291 | 123 | $0.00019 | 0.9 |  |
| 2026-10-23 23:31 | 222 | judge 2 P1' opus | claude-haiku-5-5 | 1291 | 135 | $0.00020 | 1.1 |  |
| 2026-10-23 23:31 | 223 | subject opus both/P5' | claude-opus-5-5 | 316 | 342 | $0.00810 | 4.2 |  |
| 2026-10-23 23:31 | 224 | judge 2 P5' opus | claude-haiku-5-5 | 1127 | 143 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 225 | judge 1 P5' opus | claude-haiku-5-5 | 1127 | 143 | $0.00018 | 1.2 |  |
| 2026-10-23 23:31 | 226 | subject opus neutral/C | claude-opus-5-5 | 217 | 74 | $0.00235 | 1.2 |  |
| 2026-10-23 23:31 | 227 | judge 1 C opus | claude-haiku-5-5 | 408 | 48 | $0.00006 | 0.8 |  |
| 2026-10-23 23:31 | 228 | judge 2 C opus | claude-haiku-5-5 | 408 | 56 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 229 | subject sonnet dismissal/P5' | claude-sonnet-5-5 | 341 | 183 | $0.00251 | 2 |  |
| 2026-10-23 23:31 | 230 | judge 1 P5' sonnet | claude-haiku-5-5 | 1047 | 99 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 231 | judge 2 P5' sonnet | claude-haiku-5-5 | 1047 | 99 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 232 | subject sonnet brief/C | claude-sonnet-5-5 | 231 | 40 | $0.00086 | 0.9 |  |
| 2026-10-23 23:31 | 233 | judge 2 C sonnet | claude-haiku-5-5 | 403 | 54 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 234 | judge 1 C sonnet | claude-haiku-5-5 | 403 | 54 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 235 | subject fable invited/P1' | claude-fable-5-1 | 358 | 780 | $0.04258 | 11.4 |  |
| 2026-10-23 23:31 | 236 | judge 2 P1' fable | claude-haiku-5-5 | 1561 | 173 | $0.00024 | 1.3 |  |
| 2026-10-23 23:31 | 237 | judge 1 P1' fable | claude-haiku-5-5 | 1561 | 183 | $0.00025 | 1.3 |  |
| 2026-10-23 23:31 | 238 | subject fable neutral/P1' | claude-fable-5-1 | 326 | 751 | $0.04081 | 11.9 |  |
| 2026-10-23 23:31 | 239 | judge 1 P1' fable | claude-haiku-5-5 | 1611 | 628 | $0.00048 | 3.4 |  |
| 2026-10-23 23:31 | 240 | judge 2 P1' fable | claude-haiku-5-5 | 1611 | 760 | $0.00054 | 4.4 |  |
| 2026-10-23 23:31 | 241 | referee P1' fable | claude-opus-5-5 | 1611 | 525 | $0.01694 | 6.8 |  |
| 2026-10-23 23:31 | 242 | subject sonnet neutral/Q1 | claude-sonnet-5-5 | 270 | 105 | $0.00159 | 1.5 |  |
| 2026-10-23 23:31 | 243 | judge 1 Q1 sonnet | claude-haiku-5-5 | 974 | 105 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 244 | judge 2 Q1 sonnet | claude-haiku-5-5 | 974 | 110 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 245 | subject opus both/Q4 | claude-opus-5-5 | 240 | 159 | $0.00414 | 2.8 |  |
| 2026-10-23 23:31 | 246 | judge 2 Q4 opus | claude-haiku-5-5 | 926 | 106 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 247 | judge 1 Q4 opus | claude-haiku-5-5 | 926 | 114 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 248 | subject opus brief/P5' | claude-opus-5-5 | 321 | 345 | $0.00818 | 5.5 |  |
| 2026-10-23 23:31 | 249 | judge 2 P5' opus | claude-haiku-5-5 | 1179 | 114 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 250 | judge 1 P5' opus | claude-haiku-5-5 | 1179 | 126 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 251 | subject fable invited/Q1 | claude-fable-5-1 | 302 | 208 | $0.01342 | 3.2 |  |
| 2026-10-23 23:31 | 252 | judge 1 Q1 fable | claude-haiku-5-5 | 976 | 101 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 253 | judge 2 Q1 fable | claude-haiku-5-5 | 976 | 104 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 254 | subject opus dismissal/C | claude-opus-5-5 | 251 | 71 | $0.00242 | 1.2 |  |
| 2026-10-23 23:31 | 255 | judge 1 C opus | claude-haiku-5-5 | 402 | 71 | $0.00008 | 0.9 |  |
| 2026-10-23 23:31 | 256 | judge 2 C opus | claude-haiku-5-5 | 402 | 49 | $0.00006 | 1 |  |
| 2026-10-23 23:31 | 257 | subject sonnet both/C | claude-sonnet-5-5 | 226 | 55 | $0.00100 | 1.3 |  |
| 2026-10-23 23:31 | 258 | judge 1 C sonnet | claude-haiku-5-5 | 418 | 58 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 259 | judge 2 C sonnet | claude-haiku-5-5 | 418 | 60 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 260 | subject fable neutral/P4' | claude-fable-5-1 | 231 | 178 | $0.01121 | 2.9 |  |
| 2026-10-23 23:31 | 261 | judge 2 P4' fable | claude-haiku-5-5 | 876 | 130 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 262 | judge 1 P4' fable | claude-haiku-5-5 | 876 | 123 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 263 | subject sonnet invited/P1' | claude-sonnet-5-5 | 358 | 942 | $0.01014 | 8.8 |  |
| 2026-10-23 23:31 | 264 | judge 1 P1' sonnet | claude-haiku-5-5 | 1577 | 535 | $0.00043 | 3 |  |
| 2026-10-23 23:31 | 265 | judge 2 P1' sonnet | claude-haiku-5-5 | 1577 | 607 | $0.00046 | 3.3 |  |
| 2026-10-23 23:31 | 266 | subject sonnet dismissal/Q4 | claude-sonnet-5-5 | 265 | 16 | $0.00069 | 0.9 |  |
| 2026-10-23 23:31 | 267 | judge 2 Q4 sonnet | claude-haiku-5-5 | 903 | 75 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 268 | judge 1 Q4 sonnet | claude-haiku-5-5 | 903 | 78 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 269 | subject opus brief/P1' | claude-opus-5-5 | 340 | 459 | $0.01054 | 6.7 |  |
| 2026-10-23 23:31 | 270 | judge 1 P1' opus | claude-haiku-5-5 | 1354 | 548 | $0.00041 | 3.5 |  |
| 2026-10-23 23:31 | 271 | judge 2 P1' opus | claude-haiku-5-5 | 1354 | 663 | $0.00047 | 3.6 |  |
| 2026-10-23 23:31 | 272 | subject opus dismissal/P4' | claude-opus-5-5 | 265 | 152 | $0.00410 | 3.3 |  |
| 2026-10-23 23:31 | 273 | judge 1 P4' opus | claude-haiku-5-5 | 836 | 80 | $0.00012 | 0.9 |  |
| 2026-10-23 23:31 | 274 | judge 2 P4' opus | claude-haiku-5-5 | 836 | 80 | $0.00012 | 0.9 |  |
| 2026-10-23 23:31 | 275 | referee P1' opus | claude-opus-5-5 | 1354 | 376 | $0.01294 | 4.4 |  |
| 2026-10-23 23:31 | 276 | subject opus invited/P1' | claude-opus-5-5 | 358 | 809 | $0.01761 | 10.1 |  |
| 2026-10-23 23:31 | 277 | judge 2 P1' opus | claude-haiku-5-5 | 1614 | 162 | $0.00024 | 1.5 |  |
| 2026-10-23 23:31 | 278 | judge 1 P1' opus | claude-haiku-5-5 | 1614 | 622 | $0.00047 | 3.5 |  |
| 2026-10-23 23:31 | 279 | subject sonnet neutral/C | claude-sonnet-5-5 | 217 | 52 | $0.00095 | 0.9 |  |
| 2026-10-23 23:31 | 280 | judge 1 C sonnet | claude-haiku-5-5 | 415 | 54 | $0.00007 | 0.6 |  |
| 2026-10-23 23:31 | 281 | judge 2 C sonnet | claude-haiku-5-5 | 415 | 62 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 282 | referee P1' opus | claude-opus-5-5 | 1614 | 400 | $0.01446 | 4.3 |  |
| 2026-10-23 23:31 | 283 | subject sonnet neutral/Q4 | claude-sonnet-5-5 | 231 | 99 | $0.00145 | 1.5 |  |
| 2026-10-23 23:31 | 284 | judge 1 Q4 sonnet | claude-haiku-5-5 | 986 | 110 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 285 | judge 2 Q4 sonnet | claude-haiku-5-5 | 986 | 106 | $0.00015 | 1.2 |  |
| 2026-10-23 23:31 | 286 | subject fable both/P1' | claude-fable-5-1 | 335 | 356 | $0.02115 | 5.6 |  |
| 2026-10-23 23:31 | 287 | judge 2 P1' fable | claude-haiku-5-5 | 1337 | 397 | $0.00033 | 2.5 |  |
| 2026-10-23 23:31 | 288 | judge 1 P1' fable | claude-haiku-5-5 | 1337 | 364 | $0.00032 | 2.6 |  |
| 2026-10-23 23:31 | 289 | subject opus brief/P4' | claude-opus-5-5 | 245 | 126 | $0.00350 | 3.2 |  |
| 2026-10-23 23:31 | 290 | judge 2 P4' opus | claude-haiku-5-5 | 831 | 85 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 291 | judge 1 P4' opus | claude-haiku-5-5 | 831 | 77 | $0.00012 | 0.9 |  |
| 2026-10-23 23:31 | 292 | subject sonnet brief/P5' | claude-sonnet-5-5 | 321 | 305 | $0.00369 | 3.3 |  |
| 2026-10-23 23:31 | 293 | judge 2 P5' sonnet | claude-haiku-5-5 | 1107 | 116 | $0.00017 | 1.1 |  |
| 2026-10-23 23:31 | 294 | judge 1 P5' sonnet | claude-haiku-5-5 | 1107 | 104 | $0.00016 | 1.5 |  |
| 2026-10-23 23:31 | 295 | subject sonnet brief/Q4 | claude-sonnet-5-5 | 245 | 53 | $0.00102 | 1.1 |  |
| 2026-10-23 23:31 | 296 | judge 2 Q4 sonnet | claude-haiku-5-5 | 940 | 122 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 297 | judge 1 Q4 sonnet | claude-haiku-5-5 | 940 | 146 | $0.00017 | 1.1 |  |
| 2026-10-23 23:31 | 298 | subject fable neutral/C | claude-fable-5-1 | 217 | 48 | $0.00457 | 1.3 |  |
| 2026-10-23 23:31 | 299 | judge 1 C fable | claude-haiku-5-5 | 411 | 58 | $0.00007 | 1.3 |  |
| 2026-10-23 23:31 | 300 | judge 2 C fable | claude-haiku-5-5 | 411 | 64 | $0.00007 | 1.4 |  |
| 2026-10-23 23:31 | 301 | subject fable dismissal/P5' | claude-fable-5-1 | 341 | 408 | $0.02381 | 6 |  |
| 2026-10-23 23:31 | 302 | judge 2 P5' fable | claude-haiku-5-5 | 1048 | 88 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 303 | judge 1 P5' fable | claude-haiku-5-5 | 1048 | 104 | $0.00016 | 0.9 |  |
| 2026-10-23 23:31 | 304 | subject sonnet neutral/P5' | claude-sonnet-5-5 | 307 | 408 | $0.00469 | 3.7 |  |
| 2026-10-23 23:31 | 305 | judge 1 P5' sonnet | claude-haiku-5-5 | 1180 | 495 | $0.00037 | 2.8 |  |
| 2026-10-23 23:31 | 306 | judge 2 P5' sonnet | claude-haiku-5-5 | 1180 | 513 | $0.00037 | 2.9 |  |
| 2026-10-23 23:31 | 307 | subject opus brief/P1' | claude-opus-5-5 | 340 | 388 | $0.00912 | 5 |  |
| 2026-10-23 23:31 | 308 | judge 2 P1' opus | claude-haiku-5-5 | 1325 | 472 | $0.00037 | 3 |  |
| 2026-10-23 23:31 | 309 | judge 1 P1' opus | claude-haiku-5-5 | 1325 | 532 | $0.00040 | 3.8 |  |
| 2026-10-23 23:31 | 310 | subject fable dismissal/C | claude-fable-5-1 | 251 | 40 | $0.00451 | 1.4 |  |
| 2026-10-23 23:31 | 311 | judge 1 C fable | claude-haiku-5-5 | 403 | 57 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 312 | judge 2 C fable | claude-haiku-5-5 | 403 | 50 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 313 | subject fable dismissal/Q4 | claude-fable-5-1 | 265 | 269 | $0.01610 | 5.3 |  |
| 2026-10-23 23:31 | 314 | judge 1 Q4 fable | claude-haiku-5-5 | 937 | 109 | $0.00015 | 0.8 |  |
| 2026-10-23 23:31 | 315 | judge 2 Q4 fable | claude-haiku-5-5 | 937 | 111 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 316 | subject opus invited/Q1 | claude-opus-5-5 | 302 | 424 | $0.00969 | 6.8 |  |
| 2026-10-23 23:31 | 317 | judge 2 Q1 opus | claude-haiku-5-5 | 1052 | 123 | $0.00017 | 1.2 |  |
| 2026-10-23 23:31 | 318 | judge 1 Q1 opus | claude-haiku-5-5 | 1052 | 126 | $0.00017 | 1.5 |  |
| 2026-10-23 23:31 | 319 | subject opus both/Q1 | claude-opus-5-5 | 279 | 76 | $0.00264 | 1.6 |  |
| 2026-10-23 23:31 | 320 | judge 1 Q1 opus | claude-haiku-5-5 | 877 | 71 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 321 | judge 2 Q1 opus | claude-haiku-5-5 | 877 | 76 | $0.00013 | 1 |  |
| 2026-10-23 23:31 | 322 | subject opus neutral/P5' | claude-opus-5-5 | 307 | 457 | $0.01037 | 5.5 |  |
| 2026-10-23 23:31 | 323 | judge 1 P5' opus | claude-haiku-5-5 | 1196 | 110 | $0.00017 | 1.1 |  |
| 2026-10-23 23:31 | 324 | judge 2 P5' opus | claude-haiku-5-5 | 1196 | 117 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 325 | subject fable invited/P5' | claude-fable-5-1 | 339 | 492 | $0.02799 | 7.5 |  |
| 2026-10-23 23:31 | 326 | judge 1 P5' fable | claude-haiku-5-5 | 1265 | 121 | $0.00019 | 1.1 |  |
| 2026-10-23 23:31 | 327 | judge 2 P5' fable | claude-haiku-5-5 | 1265 | 114 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 328 | subject opus dismissal/P1' | claude-opus-5-5 | 360 | 439 | $0.01022 | 5.5 |  |
| 2026-10-23 23:31 | 329 | judge 2 P1' opus | claude-haiku-5-5 | 1295 | 359 | $0.00031 | 2.1 |  |
| 2026-10-23 23:31 | 330 | judge 1 P1' opus | claude-haiku-5-5 | 1295 | 533 | $0.00040 | 2.7 |  |
| 2026-10-23 23:31 | 331 | subject sonnet both/Q4 | claude-sonnet-5-5 | 240 | 53 | $0.00101 | 1.6 |  |
| 2026-10-23 23:31 | 332 | judge 1 Q4 sonnet | claude-haiku-5-5 | 940 | 100 | $0.00014 | 1 |  |
| 2026-10-23 23:31 | 333 | judge 2 Q4 sonnet | claude-haiku-5-5 | 940 | 92 | $0.00014 | 1.1 |  |
| 2026-10-23 23:31 | 334 | subject sonnet dismissal/P5' | claude-sonnet-5-5 | 341 | 160 | $0.00228 | 1.6 |  |
| 2026-10-23 23:31 | 335 | judge 2 P5' sonnet | claude-haiku-5-5 | 1046 | 91 | $0.00015 | 1.2 |  |
| 2026-10-23 23:31 | 336 | judge 1 P5' sonnet | claude-haiku-5-5 | 1046 | 105 | $0.00016 | 2.5 |  |
| 2026-10-23 23:31 | 337 | subject sonnet brief/P4' | claude-sonnet-5-5 | 245 | 90 | $0.00139 | 1.4 |  |
| 2026-10-23 23:31 | 338 | judge 2 P4' sonnet | claude-haiku-5-5 | 808 | 82 | $0.00012 | 0.9 |  |
| 2026-10-23 23:31 | 339 | judge 1 P4' sonnet | claude-haiku-5-5 | 808 | 93 | $0.00013 | 1.5 |  |
| 2026-10-23 23:31 | 340 | subject opus brief/C | claude-opus-5-5 | 231 | 70 | $0.00232 | 2 |  |
| 2026-10-23 23:31 | 341 | judge 2 C opus | claude-haiku-5-5 | 404 | 73 | $0.00008 | 0.8 |  |
| 2026-10-23 23:31 | 342 | judge 1 C opus | claude-haiku-5-5 | 404 | 52 | $0.00007 | 1.1 |  |
| 2026-10-23 23:31 | 343 | subject sonnet dismissal/C | claude-sonnet-5-5 | 251 | 40 | $0.00090 | 1.1 |  |
| 2026-10-23 23:31 | 344 | judge 2 C sonnet | claude-haiku-5-5 | 403 | 54 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 345 | judge 1 C sonnet | claude-haiku-5-5 | 403 | 49 | $0.00006 | 0.8 |  |
| 2026-10-23 23:31 | 346 | subject sonnet invited/P1' | claude-sonnet-5-5 | 358 | 898 | $0.00970 | 7.7 |  |
| 2026-10-23 23:31 | 347 | judge 2 P1' sonnet | claude-haiku-5-5 | 1566 | 123 | $0.00022 | 1.1 |  |
| 2026-10-23 23:31 | 348 | judge 1 P1' sonnet | claude-haiku-5-5 | 1566 | 140 | $0.00023 | 1.3 |  |
| 2026-10-23 23:31 | 349 | subject fable invited/C | claude-fable-5-1 | 249 | 329 | $0.01894 | 4.5 |  |
| 2026-10-23 23:31 | 350 | judge 2 C fable | claude-haiku-5-5 | 505 | 65 | $0.00008 | 0.8 |  |
| 2026-10-23 23:31 | 351 | judge 1 C fable | claude-haiku-5-5 | 505 | 60 | $0.00008 | 1 |  |
| 2026-10-23 23:31 | 352 | subject fable both/C | claude-fable-5-1 | 226 | 44 | $0.00446 | 1.4 |  |
| 2026-10-23 23:31 | 353 | judge 2 C fable | claude-haiku-5-5 | 407 | 55 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 354 | judge 1 C fable | claude-haiku-5-5 | 407 | 54 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 355 | subject fable dismissal/P4' | claude-fable-5-1 | 265 | 88 | $0.00705 | 1.8 |  |
| 2026-10-23 23:31 | 356 | judge 2 P4' fable | claude-haiku-5-5 | 787 | 109 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 357 | judge 1 P4' fable | claude-haiku-5-5 | 787 | 100 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 358 | subject sonnet invited/P5' | claude-sonnet-5-5 | 339 | 590 | $0.00658 | 5.5 |  |
| 2026-10-23 23:31 | 359 | judge 1 P5' sonnet | claude-haiku-5-5 | 1250 | 115 | $0.00018 | 0.9 |  |
| 2026-10-23 23:31 | 360 | judge 2 P5' sonnet | claude-haiku-5-5 | 1250 | 114 | $0.00018 | 1 |  |
| 2026-10-23 23:31 | 361 | subject opus invited/P5' | claude-opus-5-5 | 339 | 639 | $0.01414 | 8.2 |  |
| 2026-10-23 23:31 | 362 | judge 1 P5' opus | claude-haiku-5-5 | 1364 | 270 | $0.00027 | 2.2 |  |
| 2026-10-23 23:31 | 363 | judge 2 P5' opus | claude-haiku-5-5 | 1364 | 289 | $0.00028 | 3.3 |  |
| 2026-10-23 23:31 | 364 | subject fable neutral/Q1 | claude-fable-5-1 | 270 | 204 | $0.01290 | 3.2 |  |
| 2026-10-23 23:31 | 365 | judge 2 Q1 fable | claude-haiku-5-5 | 908 | 81 | $0.00013 | 0.7 |  |
| 2026-10-23 23:31 | 366 | judge 1 Q1 fable | claude-haiku-5-5 | 908 | 92 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 367 | subject sonnet both/P4' | claude-sonnet-5-5 | 240 | 111 | $0.00159 | 1.8 |  |
| 2026-10-23 23:31 | 368 | judge 1 P4' sonnet | claude-haiku-5-5 | 829 | 83 | $0.00012 | 0.9 |  |
| 2026-10-23 23:31 | 369 | judge 2 P4' sonnet | claude-haiku-5-5 | 829 | 88 | $0.00013 | 1 |  |
| 2026-10-23 23:31 | 370 | subject opus neutral/Q4 | claude-opus-5-5 | 231 | 119 | $0.00330 | 2.3 |  |
| 2026-10-23 23:31 | 371 | judge 1 Q4 opus | claude-haiku-5-5 | 962 | 132 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 372 | judge 2 Q4 opus | claude-haiku-5-5 | 962 | 137 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 373 | subject opus invited/P4' | claude-opus-5-5 | 263 | 563 | $0.01231 | 7.4 |  |
| 2026-10-23 23:31 | 374 | judge 1 P4' opus | claude-haiku-5-5 | 1032 | 216 | $0.00021 | 1.7 |  |
| 2026-10-23 23:31 | 375 | judge 2 P4' opus | claude-haiku-5-5 | 1032 | 253 | $0.00023 | 2.3 |  |
| 2026-10-23 23:31 | 376 | subject opus dismissal/Q4 | claude-opus-5-5 | 265 | 168 | $0.00442 | 3 |  |
| 2026-10-23 23:31 | 377 | judge 1 Q4 opus | claude-haiku-5-5 | 921 | 106 | $0.00015 | 1.2 |  |
| 2026-10-23 23:31 | 378 | judge 2 Q4 opus | claude-haiku-5-5 | 921 | 104 | $0.00014 | 1.2 |  |
| 2026-10-23 23:31 | 379 | subject sonnet brief/P1' | claude-sonnet-5-5 | 340 | 560 | $0.00628 | 5.3 |  |
| 2026-10-23 23:31 | 380 | judge 2 P1' sonnet | claude-haiku-5-5 | 1379 | 495 | $0.00039 | 3.4 |  |
| 2026-10-23 23:31 | 381 | judge 1 P1' sonnet | claude-haiku-5-5 | 1379 | 578 | $0.00043 | 4 |  |
| 2026-10-23 23:31 | 382 | subject fable invited/Q1 | claude-fable-5-1 | 302 | 199 | $0.01297 | 3.1 |  |
| 2026-10-23 23:31 | 383 | judge 1 Q1 fable | claude-haiku-5-5 | 965 | 130 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 384 | judge 2 Q1 fable | claude-haiku-5-5 | 965 | 110 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 385 | referee P1' sonnet | claude-opus-5-5 | 1379 | 335 | $0.01222 | 4.4 |  |
| 2026-10-23 23:31 | 386 | subject fable brief/Q1 | claude-fable-5-1 | 284 | 137 | $0.00969 | 2.2 |  |
| 2026-10-23 23:31 | 387 | judge 2 Q1 fable | claude-haiku-5-5 | 899 | 84 | $0.00013 | 0.7 |  |
| 2026-10-23 23:31 | 388 | judge 1 Q1 fable | claude-haiku-5-5 | 899 | 97 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 389 | subject sonnet both/Q1 | claude-sonnet-5-5 | 279 | 41 | $0.00097 | 1.1 |  |
| 2026-10-23 23:31 | 390 | judge 2 Q1 sonnet | claude-haiku-5-5 | 910 | 92 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 391 | judge 1 Q1 sonnet | claude-haiku-5-5 | 910 | 91 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 392 | subject opus dismissal/P4' | claude-opus-5-5 | 265 | 169 | $0.00444 | 3.3 |  |
| 2026-10-23 23:31 | 393 | judge 1 P4' opus | claude-haiku-5-5 | 840 | 77 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 394 | judge 2 P4' opus | claude-haiku-5-5 | 840 | 77 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 395 | subject opus invited/Q4 | claude-opus-5-5 | 263 | 454 | $0.01013 | 6.2 |  |
| 2026-10-23 23:31 | 396 | judge 1 Q4 opus | claude-haiku-5-5 | 1183 | 132 | $0.00018 | 1 |  |
| 2026-10-23 23:31 | 397 | judge 2 Q4 opus | claude-haiku-5-5 | 1183 | 251 | $0.00024 | 1.7 |  |
| 2026-10-23 23:31 | 398 | subject opus invited/P1' | claude-opus-5-5 | 358 | 734 | $0.01611 | 10.9 |  |
| 2026-10-23 23:31 | 399 | judge 2 P1' opus | claude-haiku-5-5 | 1605 | 158 | $0.00024 | 1.9 |  |
| 2026-10-23 23:31 | 400 | judge 1 P1' opus | claude-haiku-5-5 | 1605 | 558 | $0.00044 | 3.3 |  |
| 2026-10-23 23:31 | 401 | subject fable both/Q4 | claude-fable-5-1 | 240 | 180 | $0.01140 | 3.3 |  |
| 2026-10-23 23:31 | 402 | judge 2 Q4 fable | claude-haiku-5-5 | 932 | 126 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 403 | judge 1 Q4 fable | claude-haiku-5-5 | 932 | 110 | $0.00015 | 1.7 |  |
| 2026-10-23 23:31 | 404 | subject opus dismissal/Q1 | claude-opus-5-5 | 304 | 82 | $0.00286 | 1.3 |  |
| 2026-10-23 23:31 | 405 | judge 2 Q1 opus | claude-haiku-5-5 | 875 | 78 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 406 | judge 1 Q1 opus | claude-haiku-5-5 | 875 | 77 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 407 | subject sonnet dismissal/Q1 | claude-sonnet-5-5 | 304 | 31 | $0.00092 | 0.8 |  |
| 2026-10-23 23:31 | 408 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 82 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 409 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 91 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 410 | subject sonnet invited/Q4 | claude-sonnet-5-5 | 263 | 597 | $0.00650 | 5.6 |  |
| 2026-10-23 23:31 | 411 | judge 1 Q4 sonnet | claude-haiku-5-5 | 1153 | 127 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 412 | judge 2 Q4 sonnet | claude-haiku-5-5 | 1153 | 213 | $0.00022 | 1.3 |  |
| 2026-10-23 23:31 | 413 | subject fable brief/C | claude-fable-5-1 | 231 | 39 | $0.00426 | 1.2 |  |
| 2026-10-23 23:31 | 414 | judge 2 C fable | claude-haiku-5-5 | 402 | 53 | $0.00007 | 0.9 |  |
| 2026-10-23 23:31 | 415 | judge 1 C fable | claude-haiku-5-5 | 402 | 53 | $0.00007 | 0.9 |  |
| 2026-10-23 23:31 | 416 | subject opus invited/C | claude-opus-5-5 | 249 | 390 | $0.00880 | 5.3 |  |
| 2026-10-23 23:31 | 417 | judge 2 C opus | claude-haiku-5-5 | 551 | 66 | $0.00009 | 1 |  |
| 2026-10-23 23:31 | 418 | judge 1 C opus | claude-haiku-5-5 | 551 | 58 | $0.00008 | 1.2 |  |
| 2026-10-23 23:31 | 419 | subject sonnet both/C | claude-sonnet-5-5 | 226 | 43 | $0.00088 | 1.2 |  |
| 2026-10-23 23:31 | 420 | judge 1 C sonnet | claude-haiku-5-5 | 406 | 59 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 421 | judge 2 C sonnet | claude-haiku-5-5 | 406 | 66 | $0.00007 | 1 |  |
| 2026-10-23 23:31 | 422 | subject opus neutral/P4' | claude-opus-5-5 | 231 | 194 | $0.00480 | 3 |  |
| 2026-10-23 23:31 | 423 | judge 2 P4' opus | claude-haiku-5-5 | 899 | 88 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 424 | judge 1 P4' opus | claude-haiku-5-5 | 899 | 81 | $0.00013 | 1 |  |
| 2026-10-23 23:31 | 425 | subject opus both/Q4 | claude-opus-5-5 | 240 | 171 | $0.00438 | 3.1 |  |
| 2026-10-23 23:31 | 426 | judge 2 Q4 opus | claude-haiku-5-5 | 938 | 116 | $0.00015 | 1.4 |  |
| 2026-10-23 23:31 | 427 | judge 1 Q4 opus | claude-haiku-5-5 | 938 | 107 | $0.00015 | 1.7 |  |
| 2026-10-23 23:31 | 428 | subject opus neutral/P1' | claude-opus-5-5 | 326 | 567 | $0.01264 | 7.7 |  |
| 2026-10-23 23:31 | 429 | judge 2 P1' opus | claude-haiku-5-5 | 1470 | 531 | $0.00041 | 2.9 |  |
| 2026-10-23 23:31 | 430 | judge 1 P1' opus | claude-haiku-5-5 | 1470 | 606 | $0.00045 | 3.3 |  |
| 2026-10-23 23:31 | 431 | subject opus both/P5' | claude-opus-5-5 | 316 | 332 | $0.00790 | 4 |  |
| 2026-10-23 23:31 | 432 | judge 1 P5' opus | claude-haiku-5-5 | 1132 | 105 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 433 | judge 2 P5' opus | claude-haiku-5-5 | 1132 | 180 | $0.00020 | 1.3 |  |
| 2026-10-23 23:31 | 434 | referee P1' opus | claude-opus-5-5 | 1470 | 596 | $0.01780 | 6.7 |  |
| 2026-10-23 23:31 | 435 | referee P5' opus | claude-opus-5-5 | 1132 | 287 | $0.01027 | 3.8 |  |
| 2026-10-23 23:31 | 436 | subject fable brief/Q4 | claude-fable-5-1 | 245 | 141 | $0.00950 | 2.2 |  |
| 2026-10-23 23:31 | 437 | judge 2 Q4 fable | claude-haiku-5-5 | 937 | 127 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 438 | judge 1 Q4 fable | claude-haiku-5-5 | 937 | 113 | $0.00015 | 1.2 |  |
| 2026-10-23 23:31 | 439 | subject fable invited/P4' | claude-fable-5-1 | 263 | 430 | $0.02413 | 7.3 |  |
| 2026-10-23 23:31 | 440 | judge 1 P4' fable | claude-haiku-5-5 | 1008 | 206 | $0.00020 | 1.9 |  |
| 2026-10-23 23:31 | 441 | judge 2 P4' fable | claude-haiku-5-5 | 1008 | 216 | $0.00021 | 2 |  |
| 2026-10-23 23:31 | 442 | subject opus dismissal/C | claude-opus-5-5 | 251 | 71 | $0.00242 | 1.2 |  |
| 2026-10-23 23:31 | 443 | judge 1 C opus | claude-haiku-5-5 | 402 | 56 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 444 | judge 2 C opus | claude-haiku-5-5 | 402 | 51 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 445 | subject fable neutral/P5' | claude-fable-5-1 | 307 | 386 | $0.02237 | 5.6 |  |
| 2026-10-23 23:31 | 446 | judge 1 P5' fable | claude-haiku-5-5 | 1162 | 409 | $0.00032 | 2.3 |  |
| 2026-10-23 23:31 | 447 | judge 2 P5' fable | claude-haiku-5-5 | 1162 | 442 | $0.00034 | 2.5 |  |
| 2026-10-23 23:31 | 448 | subject fable dismissal/P1' | claude-fable-5-1 | 360 | 519 | $0.02955 | 8.3 |  |
| 2026-10-23 23:31 | 449 | subject opus neutral/Q1 | claude-opus-5-5 | 270 | 192 | $0.00492 | 2.5 |  |
| 2026-10-23 23:31 | 450 | judge 2 P1' fable | claude-haiku-5-5 | 1395 | 440 | $0.00036 | 5.8 |  |
| 2026-10-23 23:31 | 451 | judge 1 P1' fable | claude-haiku-5-5 | 1395 | 563 | $0.00042 | 6.2 |  |
| 2026-10-23 23:31 | 452 | judge 1 Q1 opus | claude-haiku-5-5 | 946 | 118 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 453 | judge 2 Q1 opus | claude-haiku-5-5 | 946 | 109 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 454 | subject fable both/P4' | claude-fable-5-1 | 240 | 262 | $0.01550 | 4.2 |  |
| 2026-10-23 23:31 | 455 | judge 2 P4' fable | claude-haiku-5-5 | 885 | 99 | $0.00014 | 1.8 |  |
| 2026-10-23 23:31 | 456 | judge 1 P4' fable | claude-haiku-5-5 | 885 | 95 | $0.00014 | 2.1 |  |
| 2026-10-23 23:31 | 457 | subject fable neutral/Q4 | claude-fable-5-1 | 231 | 58 | $0.00521 | 1.6 |  |
| 2026-10-23 23:31 | 458 | judge 1 Q4 fable | claude-haiku-5-5 | 945 | 105 | $0.00015 | 0.8 |  |
| 2026-10-23 23:31 | 459 | judge 2 Q4 fable | claude-haiku-5-5 | 945 | 105 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 460 | subject opus brief/Q4 | claude-opus-5-5 | 245 | 94 | $0.00286 | 2.4 |  |
| 2026-10-23 23:31 | 461 | judge 1 Q4 opus | claude-haiku-5-5 | 935 | 104 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 462 | judge 2 Q4 opus | claude-haiku-5-5 | 935 | 106 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 463 | subject fable invited/P1' | claude-fable-5-1 | 358 | 728 | $0.03998 | 11.6 |  |
| 2026-10-23 23:31 | 464 | judge 1 P1' fable | claude-haiku-5-5 | 1585 | 130 | $0.00022 | 0.9 |  |
| 2026-10-23 23:31 | 465 | judge 2 P1' fable | claude-haiku-5-5 | 1585 | 119 | $0.00022 | 1 |  |
| 2026-10-23 23:31 | 466 | subject fable dismissal/Q1 | claude-fable-5-1 | 304 | 100 | $0.00804 | 1.7 |  |
| 2026-10-23 23:31 | 467 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 71 | $0.00012 | 0.9 |  |
| 2026-10-23 23:31 | 468 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 75 | $0.00013 | 1 |  |
| 2026-10-23 23:31 | 469 | subject opus both/P4' | claude-opus-5-5 | 240 | 164 | $0.00424 | 3 |  |
| 2026-10-23 23:31 | 470 | judge 2 P4' opus | claude-haiku-5-5 | 849 | 87 | $0.00013 | 1.1 |  |
| 2026-10-23 23:31 | 471 | judge 1 P4' opus | claude-haiku-5-5 | 849 | 74 | $0.00012 | 3 |  |
| 2026-10-23 23:31 | 472 | subject fable invited/Q4 | claude-fable-5-1 | 263 | 318 | $0.01853 | 5.3 |  |
| 2026-10-23 23:31 | 473 | judge 1 Q4 fable | claude-haiku-5-5 | 1116 | 111 | $0.00017 | 0.9 |  |
| 2026-10-23 23:31 | 474 | judge 2 Q4 fable | claude-haiku-5-5 | 1116 | 106 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 475 | subject sonnet neutral/Q1 | claude-sonnet-5-5 | 270 | 83 | $0.00137 | 8.8 |  |
| 2026-10-23 23:31 | 476 | judge 1 Q1 sonnet | claude-haiku-5-5 | 952 | 107 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 477 | judge 2 Q1 sonnet | claude-haiku-5-5 | 952 | 109 | $0.00015 | 1.2 |  |
| 2026-10-23 23:31 | 478 | subject fable both/Q1 | claude-fable-5-1 | 279 | 166 | $0.01109 | 3.3 |  |
| 2026-10-23 23:31 | 479 | judge 1 Q1 fable | claude-haiku-5-5 | 876 | 85 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 480 | judge 2 Q1 fable | claude-haiku-5-5 | 876 | 86 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 481 | subject opus brief/Q1 | claude-opus-5-5 | 284 | 190 | $0.00494 | 3.5 |  |
| 2026-10-23 23:31 | 482 | judge 1 Q1 opus | claude-haiku-5-5 | 924 | 109 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 483 | judge 2 Q1 opus | claude-haiku-5-5 | 924 | 107 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 484 | subject fable brief/P4' | claude-fable-5-1 | 245 | 165 | $0.01070 | 3 |  |
| 2026-10-23 23:31 | 485 | judge 1 P4' fable | claude-haiku-5-5 | 815 | 94 | $0.00013 | 0.7 |  |
| 2026-10-23 23:31 | 486 | judge 2 P4' fable | claude-haiku-5-5 | 815 | 105 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 487 | subject opus brief/P5' | claude-opus-5-5 | 321 | 351 | $0.00830 | 4.8 |  |
| 2026-10-23 23:31 | 488 | judge 2 P5' opus | claude-haiku-5-5 | 1186 | 109 | $0.00017 | 0.9 |  |
| 2026-10-23 23:31 | 489 | judge 1 P5' opus | claude-haiku-5-5 | 1186 | 109 | $0.00017 | 0.9 |  |
| 2026-10-23 23:31 | 490 | referee P5' opus | claude-opus-5-5 | 1186 | 118 | $0.00710 | 2.2 |  |
| 2026-10-23 23:31 | 491 | subject sonnet neutral/P1' | claude-sonnet-5-5 | 326 | 845 | $0.00910 | 11.5 |  |
| 2026-10-23 23:31 | 492 | judge 1 P1' sonnet | claude-haiku-5-5 | 1547 | 558 | $0.00043 | 3 |  |
| 2026-10-23 23:31 | 493 | judge 2 P1' sonnet | claude-haiku-5-5 | 1547 | 626 | $0.00047 | 4.3 |  |
| 2026-10-23 23:31 | 494 | subject sonnet invited/P4' | claude-sonnet-5-5 | 263 | 973 | $0.01026 | 8.9 |  |
| 2026-10-23 23:31 | 495 | judge 1 P4' sonnet | claude-haiku-5-5 | 1098 | 192 | $0.00021 | 1.4 |  |
| 2026-10-23 23:31 | 496 | judge 2 P4' sonnet | claude-haiku-5-5 | 1098 | 123 | $0.00017 | 1.5 |  |
| 2026-10-23 23:31 | 497 | subject opus both/P1' | claude-opus-5-5 | 335 | 411 | $0.00956 | 4.6 |  |
| 2026-10-23 23:31 | 498 | judge 1 P1' opus | claude-haiku-5-5 | 1289 | 365 | $0.00031 | 2.4 |  |
| 2026-10-23 23:31 | 499 | judge 2 P1' opus | claude-haiku-5-5 | 1289 | 534 | $0.00040 | 2.9 |  |
| 2026-10-23 23:31 | 500 | referee P1' opus | claude-opus-5-5 | 1289 | 305 | $0.01126 | 3.1 |  |
| 2026-10-23 23:31 | 501 | subject sonnet neutral/P4' | claude-sonnet-5-5 | 231 | 302 | $0.00348 | 6.4 |  |
| 2026-10-23 23:31 | 502 | judge 1 P4' sonnet | claude-haiku-5-5 | 1020 | 137 | $0.00017 | 1.2 |  |
| 2026-10-23 23:31 | 503 | judge 2 P4' sonnet | claude-haiku-5-5 | 1020 | 131 | $0.00017 | 1.8 |  |
| 2026-10-23 23:31 | 504 | subject sonnet brief/C | claude-sonnet-5-5 | 231 | 45 | $0.00091 | 1 |  |
| 2026-10-23 23:31 | 505 | judge 1 C sonnet | claude-haiku-5-5 | 408 | 57 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 506 | judge 2 C sonnet | claude-haiku-5-5 | 408 | 60 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 507 | subject sonnet both/P1' | claude-sonnet-5-5 | 335 | 276 | $0.00343 | 3.1 |  |
| 2026-10-23 23:31 | 508 | judge 1 P1' sonnet | claude-haiku-5-5 | 1383 | 143 | $0.00021 | 1 |  |
| 2026-10-23 23:31 | 509 | judge 2 P1' sonnet | claude-haiku-5-5 | 1383 | 365 | $0.00032 | 2.2 |  |
| 2026-10-23 23:31 | 510 | referee P1' sonnet | claude-opus-5-5 | 1383 | 372 | $0.01297 | 4.4 |  |
| 2026-10-23 23:31 | 511 | subject fable neutral/P1' | claude-fable-5-1 | 326 | 749 | $0.04071 | 12.9 |  |
| 2026-10-23 23:31 | 512 | judge 2 P1' fable | claude-haiku-5-5 | 1598 | 580 | $0.00045 | 3.5 |  |
| 2026-10-23 23:31 | 513 | judge 1 P1' fable | claude-haiku-5-5 | 1598 | 642 | $0.00048 | 4.1 |  |
| 2026-10-23 23:31 | 514 | referee P1' fable | claude-opus-5-5 | 1598 | 296 | $0.01231 | 3.4 |  |
| 2026-10-23 23:31 | 515 | subject fable both/P5' | claude-fable-5-1 | 316 | 378 | $0.02206 | 5.5 |  |
| 2026-10-23 23:31 | 516 | judge 2 P5' fable | claude-haiku-5-5 | 1114 | 324 | $0.00027 | 2 |  |
| 2026-10-23 23:31 | 517 | judge 1 P5' fable | claude-haiku-5-5 | 1114 | 509 | $0.00037 | 2.9 |  |
| 2026-10-23 23:31 | 518 | subject sonnet dismissal/P1' | claude-sonnet-5-5 | 360 | 630 | $0.00702 | 5.8 |  |
| 2026-10-23 23:31 | 519 | judge 1 P1' sonnet | claude-haiku-5-5 | 1405 | 644 | $0.00046 | 3.4 |  |
| 2026-10-23 23:31 | 520 | judge 2 P1' sonnet | claude-haiku-5-5 | 1405 | 669 | $0.00047 | 3.6 |  |
| 2026-10-23 23:31 | 521 | subject fable neutral/P4' | claude-fable-5-1 | 231 | 324 | $0.01851 | 6.7 |  |
| 2026-10-23 23:31 | 522 | judge 2 P4' fable | claude-haiku-5-5 | 994 | 457 | $0.00033 | 2.7 |  |
| 2026-10-23 23:31 | 523 | judge 1 P4' fable | claude-haiku-5-5 | 994 | 432 | $0.00032 | 2.9 |  |
| 2026-10-23 23:31 | 524 | subject sonnet brief/Q1 | claude-sonnet-5-5 | 284 | 31 | $0.00088 | 0.7 |  |
| 2026-10-23 23:31 | 525 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 90 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 526 | referee P4' fable | claude-opus-5-5 | 994 | 297 | $0.00992 | 3.7 |  |
| 2026-10-23 23:31 | 527 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 84 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 528 | subject sonnet both/P5' | claude-sonnet-5-5 | 316 | 158 | $0.00221 | 1.8 |  |
| 2026-10-23 23:31 | 529 | judge 2 P5' sonnet | claude-haiku-5-5 | 1088 | 650 | $0.00043 | 3.5 |  |
| 2026-10-23 23:31 | 530 | judge 1 P5' sonnet | claude-haiku-5-5 | 1088 | 674 | $0.00045 | 4.4 |  |
| 2026-10-23 23:31 | 531 | subject opus dismissal/P5' | claude-opus-5-5 | 341 | 358 | $0.00852 | 4.2 |  |
| 2026-10-23 23:31 | 532 | judge 2 P5' opus | claude-haiku-5-5 | 1120 | 136 | $0.00018 | 1.2 |  |
| 2026-10-23 23:31 | 533 | referee P5' sonnet | claude-opus-5-5 | 1088 | 407 | $0.01249 | 4.8 |  |
| 2026-10-23 23:31 | 534 | judge 1 P5' opus | claude-haiku-5-5 | 1120 | 471 | $0.00035 | 2.5 |  |
| 2026-10-23 23:31 | 535 | subject opus neutral/C | claude-opus-5-5 | 217 | 83 | $0.00253 | 1.3 |  |
| 2026-10-23 23:31 | 536 | judge 1 C opus | claude-haiku-5-5 | 417 | 49 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 537 | judge 2 C opus | claude-haiku-5-5 | 417 | 61 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 538 | subject sonnet dismissal/P4' | claude-sonnet-5-5 | 265 | 129 | $0.00182 | 1.8 |  |
| 2026-10-23 23:31 | 539 | judge 2 P4' sonnet | claude-haiku-5-5 | 847 | 79 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 540 | judge 1 P4' sonnet | claude-haiku-5-5 | 847 | 82 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 541 | subject fable brief/P1' | claude-fable-5-1 | 340 | 406 | $0.02370 | 6.6 |  |
| 2026-10-23 23:31 | 542 | judge 1 P1' fable | claude-haiku-5-5 | 1400 | 451 | $0.00037 | 2.6 |  |
| 2026-10-23 23:31 | 543 | judge 2 P1' fable | claude-haiku-5-5 | 1400 | 508 | $0.00039 | 2.7 |  |
| 2026-10-23 23:31 | 544 | subject sonnet dismissal/Q4 | claude-sonnet-5-5 | 265 | 16 | $0.00069 | 0.9 |  |
| 2026-10-23 23:31 | 545 | judge 1 Q4 sonnet | claude-haiku-5-5 | 903 | 80 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 546 | judge 2 Q4 sonnet | claude-haiku-5-5 | 903 | 78 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 547 | subject sonnet invited/Q1 | claude-sonnet-5-5 | 302 | 480 | $0.00540 | 4.8 |  |
| 2026-10-23 23:31 | 548 | judge 1 Q1 sonnet | claude-haiku-5-5 | 1073 | 101 | $0.00016 | 0.9 |  |
| 2026-10-23 23:31 | 549 | judge 2 Q1 sonnet | claude-haiku-5-5 | 1073 | 108 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 550 | subject fable brief/P5' | claude-fable-5-1 | 321 | 398 | $0.02311 | 6.3 |  |
| 2026-10-23 23:31 | 551 | judge 1 P5' fable | claude-haiku-5-5 | 1139 | 155 | $0.00019 | 1.4 |  |
| 2026-10-23 23:31 | 552 | judge 2 P5' fable | claude-haiku-5-5 | 1139 | 494 | $0.00036 | 2.9 |  |
| 2026-10-23 23:31 | 553 | subject opus both/C | claude-opus-5-5 | 226 | 77 | $0.00244 | 1.5 |  |
| 2026-10-23 23:31 | 554 | judge 1 C opus | claude-haiku-5-5 | 408 | 59 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 555 | judge 2 C opus | claude-haiku-5-5 | 408 | 60 | $0.00007 | 0.9 |  |
| 2026-10-23 23:31 | 556 | referee P5' fable | claude-opus-5-5 | 1139 | 212 | $0.00880 | 2.7 |  |
| 2026-10-23 23:31 | 557 | subject sonnet invited/C | claude-sonnet-5-5 | 249 | 456 | $0.00506 | 4.4 |  |
| 2026-10-23 23:31 | 558 | judge 1 C sonnet | claude-haiku-5-5 | 526 | 67 | $0.00009 | 0.7 |  |
| 2026-10-23 23:31 | 559 | judge 2 C sonnet | claude-haiku-5-5 | 526 | 69 | $0.00009 | 0.7 |  |
| 2026-10-23 23:31 | 560 | subject sonnet dismissal/Q1 | claude-sonnet-5-5 | 304 | 31 | $0.00092 | 1.2 |  |
| 2026-10-23 23:31 | 561 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 87 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 562 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 88 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 563 | subject opus neutral/C | claude-opus-5-5 | 217 | 74 | $0.00235 | 1.1 |  |
| 2026-10-23 23:31 | 564 | judge 2 C opus | claude-haiku-5-5 | 408 | 53 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 565 | judge 1 C opus | claude-haiku-5-5 | 408 | 55 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 566 | subject fable brief/C | claude-fable-5-1 | 231 | 39 | $0.00426 | 1.2 |  |
| 2026-10-23 23:31 | 567 | judge 1 C fable | claude-haiku-5-5 | 402 | 52 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 568 | judge 2 C fable | claude-haiku-5-5 | 402 | 51 | $0.00007 | 1 |  |
| 2026-10-23 23:31 | 569 | subject sonnet invited/P1' | claude-sonnet-5-5 | 358 | 956 | $0.01028 | 9.1 |  |
| 2026-10-23 23:31 | 570 | judge 2 P1' sonnet | claude-haiku-5-5 | 1617 | 123 | $0.00022 | 1.2 |  |
| 2026-10-23 23:31 | 571 | judge 1 P1' sonnet | claude-haiku-5-5 | 1617 | 118 | $0.00022 | 1.8 |  |
| 2026-10-23 23:31 | 572 | subject fable both/P4' | claude-fable-5-1 | 240 | 173 | $0.01105 | 3.3 |  |
| 2026-10-23 23:31 | 573 | referee P1' sonnet | claude-opus-5-5 | 1617 | 334 | $0.01315 | 4.6 |  |
| 2026-10-23 23:31 | 574 | judge 2 P4' fable | claude-haiku-5-5 | 823 | 74 | $0.00012 | 1.1 |  |
| 2026-10-23 23:31 | 575 | judge 1 P4' fable | claude-haiku-5-5 | 823 | 76 | $0.00012 | 1.5 |  |
| 2026-10-23 23:31 | 576 | subject opus dismissal/Q4 | claude-opus-5-5 | 265 | 233 | $0.00572 | 3.7 |  |
| 2026-10-23 23:31 | 577 | judge 1 Q4 opus | claude-haiku-5-5 | 930 | 122 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 578 | judge 2 Q4 opus | claude-haiku-5-5 | 930 | 126 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 579 | subject opus dismissal/P1' | claude-opus-5-5 | 360 | 372 | $0.00888 | 5.2 |  |
| 2026-10-23 23:31 | 580 | judge 2 P1' opus | claude-haiku-5-5 | 1266 | 138 | $0.00020 | 1.1 |  |
| 2026-10-23 23:31 | 581 | judge 1 P1' opus | claude-haiku-5-5 | 1266 | 455 | $0.00035 | 2.3 |  |
| 2026-10-23 23:31 | 582 | subject sonnet both/C | claude-sonnet-5-5 | 226 | 43 | $0.00088 | 0.8 |  |
| 2026-10-23 23:31 | 583 | judge 2 C sonnet | claude-haiku-5-5 | 406 | 53 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 584 | referee P1' opus | claude-opus-5-5 | 1266 | 288 | $0.01082 | 3.4 |  |
| 2026-10-23 23:31 | 585 | judge 1 C sonnet | claude-haiku-5-5 | 406 | 74 | $0.00008 | 2.5 |  |
| 2026-10-23 23:31 | 586 | subject opus neutral/Q1 | claude-opus-5-5 | 270 | 121 | $0.00350 | 2 |  |
| 2026-10-23 23:31 | 587 | judge 2 Q1 opus | claude-haiku-5-5 | 888 | 83 | $0.00013 | 0.6 |  |
| 2026-10-23 23:31 | 588 | judge 1 Q1 opus | claude-haiku-5-5 | 888 | 79 | $0.00013 | 1.4 |  |
| 2026-10-23 23:31 | 589 | subject fable both/P5' | claude-fable-5-1 | 316 | 323 | $0.01931 | 4.8 |  |
| 2026-10-23 23:31 | 590 | judge 2 P5' fable | claude-haiku-5-5 | 1133 | 137 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 591 | judge 1 P5' fable | claude-haiku-5-5 | 1133 | 145 | $0.00019 | 1.2 |  |
| 2026-10-23 23:31 | 592 | subject fable invited/Q1 | claude-fable-5-1 | 302 | 187 | $0.01237 | 3.1 |  |
| 2026-10-23 23:31 | 593 | judge 2 Q1 fable | claude-haiku-5-5 | 975 | 109 | $0.00015 | 1.5 |  |
| 2026-10-23 23:31 | 594 | judge 1 Q1 fable | claude-haiku-5-5 | 975 | 106 | $0.00015 | 1.9 |  |
| 2026-10-23 23:31 | 595 | subject opus dismissal/Q1 | claude-opus-5-5 | 304 | 84 | $0.00290 | 1.3 |  |
| 2026-10-23 23:31 | 596 | judge 2 Q1 opus | claude-haiku-5-5 | 875 | 83 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 597 | judge 1 Q1 opus | claude-haiku-5-5 | 875 | 86 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 598 | subject sonnet brief/P5' | claude-sonnet-5-5 | 321 | 343 | $0.00407 | 3.5 |  |
| 2026-10-23 23:31 | 599 | judge 2 P5' sonnet | claude-haiku-5-5 | 1102 | 117 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 600 | judge 1 P5' sonnet | claude-haiku-5-5 | 1102 | 151 | $0.00019 | 1.7 |  |
| 2026-10-23 23:31 | 601 | subject fable both/P1' | claude-fable-5-1 | 335 | 373 | $0.02200 | 6.4 |  |
| 2026-10-23 23:31 | 602 | judge 1 P1' fable | claude-haiku-5-5 | 1370 | 427 | $0.00035 | 2.6 |  |
| 2026-10-23 23:31 | 603 | judge 2 P1' fable | claude-haiku-5-5 | 1370 | 525 | $0.00040 | 3 |  |
| 2026-10-23 23:31 | 604 | subject opus dismissal/C | claude-opus-5-5 | 251 | 75 | $0.00250 | 1.2 |  |
| 2026-10-23 23:31 | 605 | judge 1 C opus | claude-haiku-5-5 | 404 | 65 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 606 | judge 2 C opus | claude-haiku-5-5 | 404 | 97 | $0.00009 | 0.9 |  |
| 2026-10-23 23:31 | 607 | subject fable invited/Q4 | claude-fable-5-1 | 263 | 346 | $0.01993 | 6.4 |  |
| 2026-10-23 23:31 | 608 | judge 1 Q4 fable | claude-haiku-5-5 | 1129 | 92 | $0.00016 | 2 |  |
| 2026-10-23 23:31 | 609 | judge 2 Q4 fable | claude-haiku-5-5 | 1129 | 110 | $0.00017 | 2.2 |  |
| 2026-10-23 23:31 | 610 | subject sonnet both/P5' | claude-sonnet-5-5 | 316 | 171 | $0.00234 | 1.8 |  |
| 2026-10-23 23:31 | 611 | judge 2 P5' sonnet | claude-haiku-5-5 | 1101 | 122 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 612 | judge 1 P5' sonnet | claude-haiku-5-5 | 1101 | 123 | $0.00017 | 1.2 |  |
| 2026-10-23 23:31 | 613 | subject sonnet neutral/Q1 | claude-sonnet-5-5 | 270 | 157 | $0.00211 | 1.6 |  |
| 2026-10-23 23:31 | 614 | judge 2 Q1 sonnet | claude-haiku-5-5 | 1026 | 127 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 615 | judge 1 Q1 sonnet | claude-haiku-5-5 | 1026 | 129 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 616 | subject sonnet both/Q1 | claude-sonnet-5-5 | 279 | 41 | $0.00097 | 1.8 |  |
| 2026-10-23 23:31 | 617 | judge 1 Q1 sonnet | claude-haiku-5-5 | 910 | 91 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 618 | judge 2 Q1 sonnet | claude-haiku-5-5 | 910 | 96 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 619 | subject fable dismissal/Q1 | claude-fable-5-1 | 304 | 120 | $0.00904 | 2.3 |  |
| 2026-10-23 23:31 | 620 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 85 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 621 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 78 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 622 | subject sonnet dismissal/P4' | claude-sonnet-5-5 | 265 | 129 | $0.00182 | 1.7 |  |
| 2026-10-23 23:31 | 623 | judge 1 P4' sonnet | claude-haiku-5-5 | 847 | 75 | $0.00012 | 1.5 |  |
| 2026-10-23 23:31 | 624 | judge 2 P4' sonnet | claude-haiku-5-5 | 847 | 88 | $0.00013 | 1.5 |  |
| 2026-10-23 23:31 | 625 | subject sonnet dismissal/P5' | claude-sonnet-5-5 | 341 | 182 | $0.00250 | 1.7 |  |
| 2026-10-23 23:31 | 626 | judge 1 P5' sonnet | claude-haiku-5-5 | 1047 | 86 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 627 | judge 2 P5' sonnet | claude-haiku-5-5 | 1047 | 96 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 628 | subject sonnet neutral/P1' | claude-sonnet-5-5 | 326 | 887 | $0.00952 | 8.5 |  |
| 2026-10-23 23:31 | 629 | judge 2 P1' sonnet | claude-haiku-5-5 | 1527 | 615 | $0.00046 | 3.5 |  |
| 2026-10-23 23:31 | 630 | judge 1 P1' sonnet | claude-haiku-5-5 | 1527 | 586 | $0.00045 | 4 |  |
| 2026-10-23 23:31 | 631 | subject fable dismissal/P5' | claude-fable-5-1 | 341 | 443 | $0.02556 | 6.5 |  |
| 2026-10-23 23:31 | 632 | judge 2 P5' fable | claude-haiku-5-5 | 1141 | 121 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 633 | judge 1 P5' fable | claude-haiku-5-5 | 1141 | 110 | $0.00017 | 1.3 |  |
| 2026-10-23 23:31 | 634 | subject opus dismissal/P4' | claude-opus-5-5 | 265 | 164 | $0.00434 | 3.1 |  |
| 2026-10-23 23:31 | 635 | judge 2 P4' opus | claude-haiku-5-5 | 842 | 78 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 636 | judge 1 P4' opus | claude-haiku-5-5 | 842 | 82 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 637 | subject sonnet both/P1' | claude-sonnet-5-5 | 335 | 267 | $0.00334 | 3 |  |
| 2026-10-23 23:31 | 638 | judge 1 P1' sonnet | claude-haiku-5-5 | 1374 | 351 | $0.00031 | 1.8 |  |
| 2026-10-23 23:31 | 639 | judge 2 P1' sonnet | claude-haiku-5-5 | 1374 | 427 | $0.00035 | 2.2 |  |
| 2026-10-23 23:31 | 640 | subject fable neutral/Q4 | claude-fable-5-1 | 231 | 53 | $0.00496 | 1.6 |  |
| 2026-10-23 23:31 | 641 | judge 2 Q4 fable | claude-haiku-5-5 | 940 | 110 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 642 | judge 1 Q4 fable | claude-haiku-5-5 | 940 | 107 | $0.00015 | 1.4 |  |
| 2026-10-23 23:31 | 643 | subject fable dismissal/P1' | claude-fable-5-1 | 360 | 438 | $0.02550 | 6.9 |  |
| 2026-10-23 23:31 | 644 | judge 1 P1' fable | claude-haiku-5-5 | 1281 | 355 | $0.00031 | 2.1 |  |
| 2026-10-23 23:31 | 645 | judge 2 P1' fable | claude-haiku-5-5 | 1281 | 440 | $0.00035 | 2.5 |  |
| 2026-10-23 23:31 | 646 | referee P1' fable | claude-opus-5-5 | 1281 | 280 | $0.01072 | 3.3 |  |
| 2026-10-23 23:31 | 647 | subject fable neutral/Q1 | claude-fable-5-1 | 270 | 268 | $0.01610 | 4.1 |  |
| 2026-10-23 23:31 | 648 | judge 2 Q1 fable | claude-haiku-5-5 | 921 | 101 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 649 | judge 1 Q1 fable | claude-haiku-5-5 | 921 | 100 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 650 | subject opus invited/P5' | claude-opus-5-5 | 339 | 717 | $0.01570 | 8.9 |  |
| 2026-10-23 23:31 | 651 | judge 1 P5' opus | claude-haiku-5-5 | 1365 | 118 | $0.00020 | 1 |  |
| 2026-10-23 23:31 | 652 | judge 2 P5' opus | claude-haiku-5-5 | 1365 | 110 | $0.00019 | 1 |  |
| 2026-10-23 23:31 | 653 | subject fable invited/P5' | claude-fable-5-1 | 339 | 440 | $0.02539 | 6.5 |  |
| 2026-10-23 23:31 | 654 | judge 2 P5' fable | claude-haiku-5-5 | 1214 | 134 | $0.00019 | 1 |  |
| 2026-10-23 23:31 | 655 | judge 1 P5' fable | claude-haiku-5-5 | 1214 | 122 | $0.00018 | 1 |  |
| 2026-10-23 23:31 | 656 | subject opus both/P4' | claude-opus-5-5 | 240 | 151 | $0.00398 | 2.1 |  |
| 2026-10-23 23:31 | 657 | judge 2 P4' opus | claude-haiku-5-5 | 836 | 79 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 658 | judge 1 P4' opus | claude-haiku-5-5 | 836 | 78 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 659 | subject opus brief/P4' | claude-opus-5-5 | 245 | 132 | $0.00362 | 3.5 |  |
| 2026-10-23 23:31 | 660 | judge 1 P4' opus | claude-haiku-5-5 | 834 | 109 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 661 | judge 2 P4' opus | claude-haiku-5-5 | 834 | 100 | $0.00013 | 1.5 |  |
| 2026-10-23 23:31 | 662 | subject sonnet neutral/P5' | claude-sonnet-5-5 | 307 | 427 | $0.00488 | 3.8 |  |
| 2026-10-23 23:31 | 663 | judge 2 P5' sonnet | claude-haiku-5-5 | 1200 | 119 | $0.00018 | 1 |  |
| 2026-10-23 23:31 | 664 | judge 1 P5' sonnet | claude-haiku-5-5 | 1200 | 125 | $0.00018 | 1 |  |
| 2026-10-23 23:31 | 665 | subject opus invited/Q1 | claude-opus-5-5 | 302 | 347 | $0.00815 | 4.9 |  |
| 2026-10-23 23:31 | 666 | judge 2 Q1 opus | claude-haiku-5-5 | 995 | 100 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 667 | judge 1 Q1 opus | claude-haiku-5-5 | 995 | 93 | $0.00015 | 2.6 |  |
| 2026-10-23 23:31 | 668 | subject fable invited/P4' | claude-fable-5-1 | 263 | 1046 | $0.05493 | 16.9 |  |
| 2026-10-23 23:31 | 669 | judge 2 P4' fable | claude-haiku-5-5 | 1146 | 253 | $0.00024 | 2.1 |  |
| 2026-10-23 23:31 | 670 | judge 1 P4' fable | claude-haiku-5-5 | 1146 | 264 | $0.00025 | 2.2 |  |
| 2026-10-23 23:31 | 671 | subject sonnet invited/Q4 | claude-sonnet-5-5 | 263 | 636 | $0.00689 | 6.4 |  |
| 2026-10-23 23:31 | 672 | judge 2 Q4 sonnet | claude-haiku-5-5 | 1155 | 269 | $0.00025 | 1.9 |  |
| 2026-10-23 23:31 | 673 | judge 1 Q4 sonnet | claude-haiku-5-5 | 1155 | 268 | $0.00025 | 1.9 |  |
| 2026-10-23 23:31 | 674 | subject sonnet brief/Q1 | claude-sonnet-5-5 | 284 | 31 | $0.00088 | 1.1 |  |
| 2026-10-23 23:31 | 675 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 91 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 676 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 92 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 677 | subject opus invited/C | claude-opus-5-5 | 249 | 418 | $0.00936 | 5.6 |  |
| 2026-10-23 23:31 | 678 | judge 2 C opus | claude-haiku-5-5 | 580 | 65 | $0.00009 | 1.8 |  |
| 2026-10-23 23:31 | 679 | judge 1 C opus | claude-haiku-5-5 | 580 | 65 | $0.00009 | 2.2 |  |
| 2026-10-23 23:31 | 680 | subject fable neutral/P5' | claude-fable-5-1 | 307 | 440 | $0.02507 | 7 |  |
| 2026-10-23 23:31 | 681 | judge 2 P5' fable | claude-haiku-5-5 | 1205 | 119 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 682 | judge 1 P5' fable | claude-haiku-5-5 | 1205 | 113 | $0.00018 | 1.3 |  |
| 2026-10-23 23:31 | 683 | subject sonnet brief/Q4 | claude-sonnet-5-5 | 245 | 52 | $0.00101 | 1 |  |
| 2026-10-23 23:31 | 684 | judge 1 Q4 sonnet | claude-haiku-5-5 | 939 | 128 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 685 | judge 2 Q4 sonnet | claude-haiku-5-5 | 939 | 113 | $0.00015 | 1.7 |  |
| 2026-10-23 23:31 | 686 | subject sonnet invited/P4' | claude-sonnet-5-5 | 263 | 879 | $0.00932 | 7.7 |  |
| 2026-10-23 23:31 | 687 | judge 1 P4' sonnet | claude-haiku-5-5 | 1132 | 189 | $0.00021 | 1.3 |  |
| 2026-10-23 23:31 | 688 | judge 2 P4' sonnet | claude-haiku-5-5 | 1132 | 230 | $0.00023 | 1.5 |  |
| 2026-10-23 23:31 | 689 | subject sonnet brief/P1' | claude-sonnet-5-5 | 340 | 545 | $0.00613 | 4.8 |  |
| 2026-10-23 23:31 | 690 | judge 1 P1' sonnet | claude-haiku-5-5 | 1377 | 139 | $0.00021 | 1.1 |  |
| 2026-10-23 23:31 | 691 | judge 2 P1' sonnet | claude-haiku-5-5 | 1377 | 504 | $0.00039 | 2.8 |  |
| 2026-10-23 23:31 | 692 | referee P1' sonnet | claude-opus-5-5 | 1377 | 697 | $0.01945 | 7.4 |  |
| 2026-10-23 23:31 | 693 | subject fable brief/P1' | claude-fable-5-1 | 340 | 435 | $0.02515 | 6.8 |  |
| 2026-10-23 23:31 | 694 | judge 2 P1' fable | claude-haiku-5-5 | 1421 | 504 | $0.00039 | 3 |  |
| 2026-10-23 23:31 | 695 | judge 1 P1' fable | claude-haiku-5-5 | 1421 | 550 | $0.00042 | 3.2 |  |
| 2026-10-23 23:31 | 696 | subject fable both/C | claude-fable-5-1 | 226 | 39 | $0.00421 | 1.6 |  |
| 2026-10-23 23:31 | 697 | judge 2 C fable | claude-haiku-5-5 | 402 | 53 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 698 | judge 1 C fable | claude-haiku-5-5 | 402 | 53 | $0.00007 | 1.6 |  |
| 2026-10-23 23:31 | 699 | subject opus both/C | claude-opus-5-5 | 226 | 81 | $0.00252 | 1.5 |  |
| 2026-10-23 23:31 | 700 | judge 1 C opus | claude-haiku-5-5 | 415 | 50 | $0.00007 | 1.5 |  |
| 2026-10-23 23:31 | 701 | judge 2 C opus | claude-haiku-5-5 | 415 | 57 | $0.00007 | 1.6 |  |
| 2026-10-23 23:31 | 702 | subject opus neutral/Q4 | claude-opus-5-5 | 231 | 104 | $0.00300 | 2.1 |  |
| 2026-10-23 23:31 | 703 | judge 2 Q4 opus | claude-haiku-5-5 | 952 | 108 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 704 | judge 1 Q4 opus | claude-haiku-5-5 | 952 | 96 | $0.00014 | 1.2 |  |
| 2026-10-23 23:31 | 705 | subject fable both/Q4 | claude-fable-5-1 | 240 | 249 | $0.01485 | 4.4 |  |
| 2026-10-23 23:31 | 706 | judge 1 Q4 fable | claude-haiku-5-5 | 929 | 113 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 707 | judge 2 Q4 fable | claude-haiku-5-5 | 929 | 107 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 708 | subject sonnet invited/Q1 | claude-sonnet-5-5 | 302 | 336 | $0.00396 | 3.1 |  |
| 2026-10-23 23:31 | 709 | judge 1 Q1 sonnet | claude-haiku-5-5 | 1009 | 109 | $0.00016 | 0.9 |  |
| 2026-10-23 23:31 | 710 | judge 2 Q1 sonnet | claude-haiku-5-5 | 1009 | 116 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 711 | subject opus brief/P5' | claude-opus-5-5 | 321 | 321 | $0.00770 | 5.2 |  |
| 2026-10-23 23:31 | 712 | judge 2 P5' opus | claude-haiku-5-5 | 1185 | 128 | $0.00018 | 1.9 |  |
| 2026-10-23 23:31 | 713 | judge 1 P5' opus | claude-haiku-5-5 | 1185 | 115 | $0.00018 | 2 |  |
| 2026-10-23 23:31 | 714 | referee P5' opus | claude-opus-5-5 | 1185 | 108 | $0.00690 | 2.2 |  |
| 2026-10-23 23:31 | 715 | subject opus neutral/P1' | claude-opus-5-5 | 326 | 585 | $0.01300 | 7.5 |  |
| 2026-10-23 23:31 | 716 | judge 1 P1' opus | claude-haiku-5-5 | 1507 | 449 | $0.00038 | 2.5 |  |
| 2026-10-23 23:31 | 717 | judge 2 P1' opus | claude-haiku-5-5 | 1507 | 580 | $0.00044 | 2.8 |  |
| 2026-10-23 23:31 | 718 | subject opus both/Q4 | claude-opus-5-5 | 240 | 166 | $0.00428 | 2.6 |  |
| 2026-10-23 23:31 | 719 | judge 1 Q4 opus | claude-haiku-5-5 | 941 | 92 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 720 | judge 2 Q4 opus | claude-haiku-5-5 | 941 | 155 | $0.00017 | 1.2 |  |
| 2026-10-23 23:31 | 721 | subject opus brief/C | claude-opus-5-5 | 231 | 74 | $0.00240 | 3.1 |  |
| 2026-10-23 23:31 | 722 | judge 2 C opus | claude-haiku-5-5 | 408 | 61 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 723 | judge 1 C opus | claude-haiku-5-5 | 408 | 60 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 724 | subject opus brief/Q4 | claude-opus-5-5 | 245 | 114 | $0.00326 | 2.7 |  |
| 2026-10-23 23:31 | 725 | judge 1 Q4 opus | claude-haiku-5-5 | 952 | 104 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 726 | judge 2 Q4 opus | claude-haiku-5-5 | 952 | 123 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 727 | subject opus invited/P4' | claude-opus-5-5 | 263 | 657 | $0.01419 | 8.8 |  |
| 2026-10-23 23:31 | 728 | judge 2 P4' opus | claude-haiku-5-5 | 1084 | 193 | $0.00020 | 1.4 |  |
| 2026-10-23 23:31 | 729 | judge 1 P4' opus | claude-haiku-5-5 | 1084 | 225 | $0.00022 | 1.5 |  |
| 2026-10-23 23:31 | 730 | subject fable brief/Q1 | claude-fable-5-1 | 284 | 72 | $0.00644 | 1.4 |  |
| 2026-10-23 23:31 | 731 | judge 2 Q1 fable | claude-haiku-5-5 | 941 | 104 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 732 | judge 1 Q1 fable | claude-haiku-5-5 | 941 | 101 | $0.00014 | 1.1 |  |
| 2026-10-23 23:31 | 733 | subject opus brief/P1' | claude-opus-5-5 | 340 | 404 | $0.00944 | 6.4 |  |
| 2026-10-23 23:31 | 734 | judge 2 P1' opus | claude-haiku-5-5 | 1327 | 478 | $0.00037 | 2.6 |  |
| 2026-10-23 23:31 | 735 | judge 1 P1' opus | claude-haiku-5-5 | 1327 | 525 | $0.00040 | 2.8 |  |
| 2026-10-23 23:31 | 736 | subject fable dismissal/Q4 | claude-fable-5-1 | 265 | 98 | $0.00755 | 2.2 |  |
| 2026-10-23 23:31 | 737 | judge 1 Q4 fable | claude-haiku-5-5 | 893 | 78 | $0.00013 | 1 |  |
| 2026-10-23 23:31 | 738 | judge 2 Q4 fable | claude-haiku-5-5 | 893 | 74 | $0.00013 | 1.2 |  |
| 2026-10-23 23:31 | 739 | subject sonnet both/Q4 | claude-sonnet-5-5 | 240 | 54 | $0.00102 | 1.1 |  |
| 2026-10-23 23:31 | 740 | judge 1 Q4 sonnet | claude-haiku-5-5 | 941 | 368 | $0.00028 | 2.3 |  |
| 2026-10-23 23:31 | 741 | judge 2 Q4 sonnet | claude-haiku-5-5 | 941 | 336 | $0.00026 | 3.2 |  |
| 2026-10-23 23:31 | 742 | subject sonnet dismissal/C | claude-sonnet-5-5 | 251 | 40 | $0.00090 | 1.1 |  |
| 2026-10-23 23:31 | 743 | judge 1 C sonnet | claude-haiku-5-5 | 403 | 51 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 744 | judge 2 C sonnet | claude-haiku-5-5 | 403 | 54 | $0.00007 | 1 |  |
| 2026-10-23 23:31 | 745 | subject sonnet invited/C | claude-sonnet-5-5 | 249 | 241 | $0.00291 | 2.2 |  |
| 2026-10-23 23:31 | 746 | judge 2 C sonnet | claude-haiku-5-5 | 604 | 74 | $0.00010 | 1.3 |  |
| 2026-10-23 23:31 | 747 | judge 1 C sonnet | claude-haiku-5-5 | 604 | 70 | $0.00010 | 1.7 |  |
| 2026-10-23 23:31 | 748 | subject opus both/Q1 | claude-opus-5-5 | 279 | 69 | $0.00250 | 1.7 |  |
| 2026-10-23 23:31 | 749 | judge 1 Q1 opus | claude-haiku-5-5 | 875 | 77 | $0.00013 | 0.7 |  |
| 2026-10-23 23:31 | 750 | judge 2 Q1 opus | claude-haiku-5-5 | 875 | 73 | $0.00012 | 0.7 |  |
| 2026-10-23 23:31 | 751 | subject fable invited/P1' | claude-fable-5-1 | 358 | 657 | $0.03643 | 10.7 |  |
| 2026-10-23 23:31 | 752 | judge 2 P1' fable | claude-haiku-5-5 | 1511 | 488 | $0.00040 | 3.6 |  |
| 2026-10-23 23:31 | 753 | judge 1 P1' fable | claude-haiku-5-5 | 1511 | 633 | $0.00047 | 3.8 |  |
| 2026-10-23 23:31 | 754 | subject sonnet brief/P4' | claude-sonnet-5-5 | 245 | 94 | $0.00143 | 1.5 |  |
| 2026-10-23 23:31 | 755 | judge 1 P4' sonnet | claude-haiku-5-5 | 812 | 100 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 756 | judge 2 P4' sonnet | claude-haiku-5-5 | 812 | 86 | $0.00012 | 1.4 |  |
| 2026-10-23 23:31 | 757 | subject sonnet neutral/P4' | claude-sonnet-5-5 | 231 | 229 | $0.00275 | 2.5 |  |
| 2026-10-23 23:31 | 758 | judge 1 P4' sonnet | claude-haiku-5-5 | 947 | 103 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 759 | judge 2 P4' sonnet | claude-haiku-5-5 | 947 | 113 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 760 | subject opus neutral/P5' | claude-opus-5-5 | 307 | 378 | $0.00879 | 4.8 |  |
| 2026-10-23 23:31 | 761 | judge 2 P5' opus | claude-haiku-5-5 | 1199 | 121 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 762 | judge 1 P5' opus | claude-haiku-5-5 | 1199 | 114 | $0.00018 | 1.2 |  |
| 2026-10-23 23:31 | 763 | subject sonnet neutral/Q4 | claude-sonnet-5-5 | 231 | 110 | $0.00156 | 1.5 |  |
| 2026-10-23 23:31 | 764 | judge 1 Q4 sonnet | claude-haiku-5-5 | 997 | 154 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 765 | judge 2 Q4 sonnet | claude-haiku-5-5 | 997 | 136 | $0.00017 | 3.2 |  |
| 2026-10-23 23:31 | 766 | subject opus neutral/P4' | claude-opus-5-5 | 231 | 213 | $0.00518 | 3.9 |  |
| 2026-10-23 23:31 | 767 | judge 2 P4' opus | claude-haiku-5-5 | 918 | 94 | $0.00014 | 1.9 |  |
| 2026-10-23 23:31 | 768 | judge 1 P4' opus | claude-haiku-5-5 | 918 | 87 | $0.00014 | 1.9 |  |
| 2026-10-23 23:31 | 769 | subject opus invited/P1' | claude-opus-5-5 | 358 | 770 | $0.01683 | 9.4 |  |
| 2026-10-23 23:31 | 770 | judge 2 P1' opus | claude-haiku-5-5 | 1596 | 442 | $0.00038 | 2.6 |  |
| 2026-10-23 23:31 | 771 | judge 1 P1' opus | claude-haiku-5-5 | 1596 | 502 | $0.00041 | 2.8 |  |
| 2026-10-23 23:31 | 772 | subject fable brief/Q4 | claude-fable-5-1 | 245 | 56 | $0.00525 | 1.5 |  |
| 2026-10-23 23:31 | 773 | judge 1 Q4 fable | claude-haiku-5-5 | 943 | 131 | $0.00016 | 1.2 |  |
| 2026-10-23 23:31 | 774 | judge 2 Q4 fable | claude-haiku-5-5 | 943 | 138 | $0.00016 | 1.3 |  |
| 2026-10-23 23:31 | 775 | subject sonnet neutral/C | claude-sonnet-5-5 | 217 | 49 | $0.00092 | 0.9 |  |
| 2026-10-23 23:31 | 776 | judge 2 C sonnet | claude-haiku-5-5 | 412 | 60 | $0.00007 | 1.6 |  |
| 2026-10-23 23:31 | 777 | judge 1 C sonnet | claude-haiku-5-5 | 412 | 58 | $0.00007 | 1.7 |  |
| 2026-10-23 23:31 | 778 | subject sonnet dismissal/P1' | claude-sonnet-5-5 | 360 | 709 | $0.00781 | 6.7 |  |
| 2026-10-23 23:31 | 779 | judge 1 P1' sonnet | claude-haiku-5-5 | 1428 | 596 | $0.00044 | 3.4 |  |
| 2026-10-23 23:31 | 780 | judge 2 P1' sonnet | claude-haiku-5-5 | 1428 | 654 | $0.00047 | 3.6 |  |
| 2026-10-23 23:31 | 781 | subject opus both/P5' | claude-opus-5-5 | 316 | 380 | $0.00886 | 5 |  |
| 2026-10-23 23:31 | 782 | judge 2 P5' opus | claude-haiku-5-5 | 1160 | 105 | $0.00017 | 1.2 |  |
| 2026-10-23 23:31 | 783 | referee P1' sonnet | claude-opus-5-5 | 1428 | 474 | $0.01519 | 5.9 |  |
| 2026-10-23 23:31 | 784 | judge 1 P5' opus | claude-haiku-5-5 | 1160 | 112 | $0.00017 | 1.7 |  |
| 2026-10-23 23:31 | 785 | subject fable brief/P5' | claude-fable-5-1 | 321 | 347 | $0.02056 | 5.3 |  |
| 2026-10-23 23:31 | 786 | judge 1 P5' fable | claude-haiku-5-5 | 1142 | 120 | $0.00017 | 1.1 |  |
| 2026-10-23 23:31 | 787 | judge 2 P5' fable | claude-haiku-5-5 | 1142 | 111 | $0.00017 | 1.9 |  |
| 2026-10-23 23:31 | 788 | subject fable dismissal/P4' | claude-fable-5-1 | 265 | 140 | $0.00965 | 2.6 |  |
| 2026-10-23 23:31 | 789 | judge 1 P4' fable | claude-haiku-5-5 | 807 | 83 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 790 | judge 2 P4' fable | claude-haiku-5-5 | 807 | 117 | $0.00014 | 1.1 |  |
| 2026-10-23 23:31 | 791 | subject opus brief/Q1 | claude-opus-5-5 | 284 | 174 | $0.00462 | 3.3 |  |
| 2026-10-23 23:31 | 792 | judge 1 Q1 opus | claude-haiku-5-5 | 928 | 102 | $0.00014 | 1.5 |  |
| 2026-10-23 23:31 | 793 | judge 2 Q1 opus | claude-haiku-5-5 | 928 | 103 | $0.00014 | 1.6 |  |
| 2026-10-23 23:31 | 794 | subject fable invited/C | claude-fable-5-1 | 249 | 286 | $0.01679 | 4 |  |
| 2026-10-23 23:31 | 795 | judge 1 C fable | claude-haiku-5-5 | 482 | 62 | $0.00008 | 0.7 |  |
| 2026-10-23 23:31 | 796 | judge 2 C fable | claude-haiku-5-5 | 482 | 65 | $0.00008 | 0.8 |  |
| 2026-10-23 23:31 | 797 | subject fable both/Q1 | claude-fable-5-1 | 279 | 162 | $0.01089 | 2.8 |  |
| 2026-10-23 23:31 | 798 | judge 1 Q1 fable | claude-haiku-5-5 | 876 | 75 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 799 | judge 2 Q1 fable | claude-haiku-5-5 | 876 | 81 | $0.00013 | 1.6 |  |
| 2026-10-23 23:31 | 800 | subject opus invited/Q4 | claude-opus-5-5 | 263 | 385 | $0.00875 | 6 |  |
| 2026-10-23 23:31 | 801 | judge 2 Q4 opus | claude-haiku-5-5 | 1117 | 129 | $0.00018 | 1.2 |  |
| 2026-10-23 23:31 | 802 | judge 1 Q4 opus | claude-haiku-5-5 | 1117 | 138 | $0.00018 | 2.7 |  |
| 2026-10-23 23:31 | 803 | subject fable neutral/P1' | claude-fable-5-1 | 326 | 642 | $0.03536 | 9.3 |  |
| 2026-10-23 23:31 | 804 | judge 1 P1' fable | claude-haiku-5-5 | 1498 | 370 | $0.00033 | 2.2 |  |
| 2026-10-23 23:31 | 805 | judge 2 P1' fable | claude-haiku-5-5 | 1498 | 442 | $0.00037 | 2.5 |  |
| 2026-10-23 23:31 | 806 | subject sonnet brief/C | claude-sonnet-5-5 | 231 | 44 | $0.00090 | 0.8 |  |
| 2026-10-23 23:31 | 807 | judge 2 C sonnet | claude-haiku-5-5 | 407 | 50 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 808 | judge 1 C sonnet | claude-haiku-5-5 | 407 | 52 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 809 | subject fable neutral/C | claude-fable-5-1 | 217 | 44 | $0.00437 | 1.4 |  |
| 2026-10-23 23:31 | 810 | judge 1 C fable | claude-haiku-5-5 | 407 | 54 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 811 | judge 2 C fable | claude-haiku-5-5 | 407 | 55 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 812 | subject fable dismissal/C | claude-fable-5-1 | 251 | 40 | $0.00451 | 1.5 |  |
| 2026-10-23 23:31 | 813 | judge 1 C fable | claude-haiku-5-5 | 403 | 60 | $0.00007 | 1 |  |
| 2026-10-23 23:31 | 814 | judge 2 C fable | claude-haiku-5-5 | 403 | 61 | $0.00007 | 1.7 |  |
| 2026-10-23 23:31 | 815 | subject opus both/P1' | claude-opus-5-5 | 335 | 422 | $0.00978 | 4.5 |  |
| 2026-10-23 23:31 | 816 | judge 1 P1' opus | claude-haiku-5-5 | 1321 | 523 | $0.00039 | 2.8 |  |
| 2026-10-23 23:31 | 817 | judge 2 P1' opus | claude-haiku-5-5 | 1321 | 597 | $0.00043 | 3.3 |  |
| 2026-10-23 23:31 | 818 | subject opus dismissal/P5' | claude-opus-5-5 | 341 | 358 | $0.00852 | 4.4 |  |
| 2026-10-23 23:31 | 819 | referee P1' opus | claude-opus-5-5 | 1321 | 464 | $0.01456 | 4.9 |  |
| 2026-10-23 23:31 | 820 | judge 2 P5' opus | claude-haiku-5-5 | 1129 | 146 | $0.00019 | 2.6 |  |
| 2026-10-23 23:31 | 821 | judge 1 P5' opus | claude-haiku-5-5 | 1129 | 129 | $0.00018 | 3.1 |  |
| 2026-10-23 23:31 | 822 | subject sonnet invited/P5' | claude-sonnet-5-5 | 339 | 644 | $0.00712 | 5.8 |  |
| 2026-10-23 23:31 | 823 | judge 2 P5' sonnet | claude-haiku-5-5 | 1332 | 297 | $0.00028 | 1.9 |  |
| 2026-10-23 23:31 | 824 | judge 1 P5' sonnet | claude-haiku-5-5 | 1332 | 364 | $0.00032 | 2.3 |  |
| 2026-10-23 23:31 | 825 | subject fable brief/P4' | claude-fable-5-1 | 245 | 152 | $0.01005 | 2.9 |  |
| 2026-10-23 23:31 | 826 | judge 2 P4' fable | claude-haiku-5-5 | 818 | 107 | $0.00014 | 1 |  |
| 2026-10-23 23:31 | 827 | judge 1 P4' fable | claude-haiku-5-5 | 818 | 108 | $0.00014 | 1.1 |  |
| 2026-10-23 23:31 | 828 | subject sonnet dismissal/Q4 | claude-sonnet-5-5 | 265 | 16 | $0.00069 | 0.8 |  |
| 2026-10-23 23:31 | 829 | judge 1 Q4 sonnet | claude-haiku-5-5 | 903 | 77 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 830 | judge 2 Q4 sonnet | claude-haiku-5-5 | 903 | 86 | $0.00013 | 2 |  |
| 2026-10-23 23:31 | 831 | subject sonnet both/P4' | claude-sonnet-5-5 | 240 | 111 | $0.00159 | 1.4 |  |
| 2026-10-23 23:31 | 832 | judge 2 P4' sonnet | claude-haiku-5-5 | 829 | 81 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 833 | judge 1 P4' sonnet | claude-haiku-5-5 | 829 | 80 | $0.00012 | 2.7 |  |
| 2026-10-23 23:31 | 834 | subject fable neutral/P4' | claude-fable-5-1 | 231 | 293 | $0.01696 | 5.2 |  |
| 2026-10-23 23:31 | 835 | judge 1 P4' fable | claude-haiku-5-5 | 936 | 111 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 836 | judge 2 P4' fable | claude-haiku-5-5 | 936 | 128 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 837 | subject opus both/Q1 | claude-opus-5-5 | 279 | 92 | $0.00296 | 1.6 |  |
| 2026-10-23 23:31 | 838 | judge 1 Q1 opus | claude-haiku-5-5 | 877 | 78 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 839 | judge 2 Q1 opus | claude-haiku-5-5 | 877 | 90 | $0.00013 | 1.4 |  |
| 2026-10-23 23:31 | 840 | subject sonnet invited/C | claude-sonnet-5-5 | 249 | 541 | $0.00591 | 4.9 |  |
| 2026-10-23 23:31 | 841 | judge 1 C sonnet | claude-haiku-5-5 | 549 | 77 | $0.00009 | 0.8 |  |
| 2026-10-23 23:31 | 842 | judge 2 C sonnet | claude-haiku-5-5 | 549 | 76 | $0.00009 | 0.8 |  |
| 2026-10-23 23:31 | 843 | subject fable brief/Q4 | claude-fable-5-1 | 245 | 58 | $0.00535 | 1.5 |  |
| 2026-10-23 23:31 | 844 | judge 1 Q4 fable | claude-haiku-5-5 | 945 | 104 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 845 | judge 2 Q4 fable | claude-haiku-5-5 | 945 | 109 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 846 | subject sonnet both/P1' | claude-sonnet-5-5 | 335 | 266 | $0.00333 | 2.9 |  |
| 2026-10-23 23:31 | 847 | judge 1 P1' sonnet | claude-haiku-5-5 | 1373 | 627 | $0.00045 | 4.2 |  |
| 2026-10-23 23:31 | 848 | judge 2 P1' sonnet | claude-haiku-5-5 | 1373 | 691 | $0.00048 | 4.2 |  |
| 2026-10-23 23:31 | 849 | subject fable neutral/Q4 | claude-fable-5-1 | 231 | 45 | $0.00456 | 1.6 |  |
| 2026-10-23 23:31 | 850 | judge 1 Q4 fable | claude-haiku-5-5 | 932 | 115 | $0.00015 | 1.4 |  |
| 2026-10-23 23:31 | 851 | judge 2 Q4 fable | claude-haiku-5-5 | 932 | 118 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 852 | referee P1' sonnet | claude-opus-5-5 | 1373 | 437 | $0.01423 | 4.8 |  |
| 2026-10-23 23:31 | 853 | subject fable invited/P5' | claude-fable-5-1 | 339 | 613 | $0.03404 | 9.1 |  |
| 2026-10-23 23:31 | 854 | judge 2 P5' fable | claude-haiku-5-5 | 1351 | 117 | $0.00019 | 1.3 |  |
| 2026-10-23 23:31 | 855 | judge 1 P5' fable | claude-haiku-5-5 | 1351 | 129 | $0.00020 | 1.8 |  |
| 2026-10-23 23:31 | 856 | subject sonnet brief/Q1 | claude-sonnet-5-5 | 284 | 31 | $0.00088 | 0.9 |  |
| 2026-10-23 23:31 | 857 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 88 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 858 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 88 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 859 | subject opus both/C | claude-opus-5-5 | 226 | 77 | $0.00244 | 1.6 |  |
| 2026-10-23 23:31 | 860 | judge 2 C opus | claude-haiku-5-5 | 408 | 60 | $0.00007 | 0.9 |  |
| 2026-10-23 23:31 | 861 | judge 1 C opus | claude-haiku-5-5 | 408 | 59 | $0.00007 | 0.9 |  |
| 2026-10-23 23:31 | 862 | subject sonnet invited/P4' | claude-sonnet-5-5 | 263 | 803 | $0.00856 | 7.2 |  |
| 2026-10-23 23:31 | 863 | judge 1 P4' sonnet | claude-haiku-5-5 | 1023 | 197 | $0.00020 | 1.5 |  |
| 2026-10-23 23:31 | 864 | judge 2 P4' sonnet | claude-haiku-5-5 | 1023 | 236 | $0.00022 | 1.6 |  |
| 2026-10-23 23:31 | 865 | subject sonnet neutral/P1' | claude-sonnet-5-5 | 326 | 986 | $0.01051 | 8.9 |  |
| 2026-10-23 23:31 | 866 | judge 1 P1' sonnet | claude-haiku-5-5 | 1532 | 711 | $0.00051 | 4 |  |
| 2026-10-23 23:31 | 867 | judge 2 P1' sonnet | claude-haiku-5-5 | 1532 | 890 | $0.00060 | 4.7 |  |
| 2026-10-23 23:31 | 868 | subject opus both/P4' | claude-opus-5-5 | 240 | 152 | $0.00400 | 2.4 |  |
| 2026-10-23 23:31 | 869 | judge 1 P4' opus | claude-haiku-5-5 | 837 | 72 | $0.00012 | 0.7 |  |
| 2026-10-23 23:31 | 870 | referee P1' sonnet | claude-opus-5-5 | 1532 | 314 | $0.01241 | 3.6 |  |
| 2026-10-23 23:31 | 871 | judge 2 P4' opus | claude-haiku-5-5 | 837 | 68 | $0.00012 | 1.5 |  |
| 2026-10-23 23:31 | 872 | subject fable dismissal/P4' | claude-fable-5-1 | 265 | 202 | $0.01275 | 3.5 |  |
| 2026-10-23 23:31 | 873 | judge 1 P4' fable | claude-haiku-5-5 | 819 | 97 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 874 | judge 2 P4' fable | claude-haiku-5-5 | 819 | 94 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 875 | subject opus brief/P5' | claude-opus-5-5 | 321 | 350 | $0.00828 | 5.7 |  |
| 2026-10-23 23:31 | 876 | judge 1 P5' opus | claude-haiku-5-5 | 1183 | 115 | $0.00018 | 1 |  |
| 2026-10-23 23:31 | 877 | judge 2 P5' opus | claude-haiku-5-5 | 1183 | 119 | $0.00018 | 1 |  |
| 2026-10-23 23:31 | 878 | subject fable invited/C | claude-fable-5-1 | 249 | 264 | $0.01569 | 3.5 |  |
| 2026-10-23 23:31 | 879 | judge 1 C fable | claude-haiku-5-5 | 489 | 68 | $0.00008 | 0.7 |  |
| 2026-10-23 23:31 | 880 | judge 2 C fable | claude-haiku-5-5 | 489 | 60 | $0.00008 | 1.1 |  |
| 2026-10-23 23:31 | 881 | subject fable dismissal/P1' | claude-fable-5-1 | 360 | 599 | $0.03355 | 8.2 |  |
| 2026-10-23 23:31 | 882 | judge 1 P1' fable | claude-haiku-5-5 | 1399 | 359 | $0.00032 | 2 |  |
| 2026-10-23 23:31 | 883 | judge 2 P1' fable | claude-haiku-5-5 | 1399 | 398 | $0.00034 | 2.3 |  |
| 2026-10-23 23:31 | 884 | subject opus invited/P1' | claude-opus-5-5 | 358 | 910 | $0.01963 | 11.1 |  |
| 2026-10-23 23:31 | 885 | judge 2 P1' opus | claude-haiku-5-5 | 1646 | 365 | $0.00035 | 2.2 |  |
| 2026-10-23 23:31 | 886 | judge 1 P1' opus | claude-haiku-5-5 | 1646 | 487 | $0.00041 | 2.8 |  |
| 2026-10-23 23:31 | 887 | subject opus neutral/C | claude-opus-5-5 | 217 | 87 | $0.00261 | 1.3 |  |
| 2026-10-23 23:31 | 888 | judge 2 C opus | claude-haiku-5-5 | 419 | 59 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 889 | judge 1 C opus | claude-haiku-5-5 | 419 | 62 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 890 | subject fable invited/Q4 | claude-fable-5-1 | 263 | 208 | $0.01303 | 3.3 |  |
| 2026-10-23 23:31 | 891 | judge 2 Q4 fable | claude-haiku-5-5 | 983 | 159 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 892 | judge 1 Q4 fable | claude-haiku-5-5 | 983 | 159 | $0.00018 | 1.2 |  |
| 2026-10-23 23:31 | 893 | subject sonnet both/C | claude-sonnet-5-5 | 226 | 43 | $0.00088 | 0.8 |  |
| 2026-10-23 23:31 | 894 | judge 2 C sonnet | claude-haiku-5-5 | 406 | 54 | $0.00007 | 0.6 |  |
| 2026-10-23 23:31 | 895 | judge 1 C sonnet | claude-haiku-5-5 | 406 | 53 | $0.00007 | 1 |  |
| 2026-10-23 23:31 | 896 | subject fable dismissal/Q1 | claude-fable-5-1 | 304 | 29 | $0.00449 | 1.3 |  |
| 2026-10-23 23:31 | 897 | judge 1 Q1 fable | claude-haiku-5-5 | 898 | 82 | $0.00013 | 0.7 |  |
| 2026-10-23 23:31 | 898 | judge 2 Q1 fable | claude-haiku-5-5 | 898 | 82 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 899 | subject sonnet brief/P4' | claude-sonnet-5-5 | 245 | 84 | $0.00133 | 1.2 |  |
| 2026-10-23 23:31 | 900 | judge 2 P4' sonnet | claude-haiku-5-5 | 802 | 72 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 901 | judge 1 P4' sonnet | claude-haiku-5-5 | 802 | 69 | $0.00011 | 1 |  |
| 2026-10-23 23:31 | 902 | subject opus brief/Q1 | claude-opus-5-5 | 284 | 184 | $0.00482 | 3.3 |  |
| 2026-10-23 23:31 | 903 | judge 1 Q1 opus | claude-haiku-5-5 | 885 | 78 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 904 | judge 2 Q1 opus | claude-haiku-5-5 | 885 | 78 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 905 | subject opus dismissal/C | claude-opus-5-5 | 251 | 74 | $0.00248 | 1.2 |  |
| 2026-10-23 23:31 | 906 | judge 2 C opus | claude-haiku-5-5 | 405 | 54 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 907 | judge 1 C opus | claude-haiku-5-5 | 405 | 54 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 908 | subject sonnet dismissal/P4' | claude-sonnet-5-5 | 265 | 123 | $0.00176 | 1.7 |  |
| 2026-10-23 23:31 | 909 | judge 2 P4' sonnet | claude-haiku-5-5 | 841 | 90 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 910 | judge 1 P4' sonnet | claude-haiku-5-5 | 841 | 91 | $0.00013 | 1.1 |  |
| 2026-10-23 23:31 | 911 | subject fable brief/Q1 | claude-fable-5-1 | 284 | 191 | $0.01239 | 2.6 |  |
| 2026-10-23 23:31 | 912 | judge 2 Q1 fable | claude-haiku-5-5 | 899 | 78 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 913 | judge 1 Q1 fable | claude-haiku-5-5 | 899 | 84 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 914 | subject sonnet neutral/C | claude-sonnet-5-5 | 217 | 49 | $0.00092 | 0.8 |  |
| 2026-10-23 23:31 | 915 | judge 2 C sonnet | claude-haiku-5-5 | 412 | 53 | $0.00007 | 0.6 |  |
| 2026-10-23 23:31 | 916 | judge 1 C sonnet | claude-haiku-5-5 | 412 | 53 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 917 | subject opus both/P5' | claude-opus-5-5 | 316 | 360 | $0.00846 | 4.6 |  |
| 2026-10-23 23:31 | 918 | judge 2 P5' opus | claude-haiku-5-5 | 1133 | 126 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 919 | judge 1 P5' opus | claude-haiku-5-5 | 1133 | 631 | $0.00043 | 3.2 |  |
| 2026-10-23 23:31 | 920 | referee P5' opus | claude-opus-5-5 | 1133 | 269 | $0.00991 | 3.5 |  |
| 2026-10-23 23:31 | 921 | subject sonnet brief/P1' | claude-sonnet-5-5 | 340 | 582 | $0.00650 | 5.6 |  |
| 2026-10-23 23:31 | 922 | judge 1 P1' sonnet | claude-haiku-5-5 | 1447 | 144 | $0.00022 | 1.5 |  |
| 2026-10-23 23:31 | 923 | judge 2 P1' sonnet | claude-haiku-5-5 | 1447 | 586 | $0.00044 | 3.4 |  |
| 2026-10-23 23:31 | 924 | subject opus neutral/Q4 | claude-opus-5-5 | 231 | 117 | $0.00326 | 2.3 |  |
| 2026-10-23 23:31 | 925 | judge 2 Q4 opus | claude-haiku-5-5 | 960 | 101 | $0.00015 | 0.8 |  |
| 2026-10-23 23:31 | 926 | judge 1 Q4 opus | claude-haiku-5-5 | 960 | 140 | $0.00017 | 1.1 |  |
| 2026-10-23 23:31 | 927 | subject fable brief/P5' | claude-fable-5-1 | 321 | 446 | $0.02551 | 6.4 |  |
| 2026-10-23 23:31 | 928 | judge 1 P5' fable | claude-haiku-5-5 | 1175 | 135 | $0.00018 | 1.4 |  |
| 2026-10-23 23:31 | 929 | judge 2 P5' fable | claude-haiku-5-5 | 1175 | 152 | $0.00019 | 1.5 |  |
| 2026-10-23 23:31 | 930 | subject sonnet dismissal/P1' | claude-sonnet-5-5 | 360 | 618 | $0.00690 | 6.5 |  |
| 2026-10-23 23:31 | 931 | judge 2 P1' sonnet | claude-haiku-5-5 | 1370 | 590 | $0.00043 | 3.2 |  |
| 2026-10-23 23:31 | 932 | judge 1 P1' sonnet | claude-haiku-5-5 | 1370 | 604 | $0.00044 | 3.3 |  |
| 2026-10-23 23:31 | 933 | subject sonnet neutral/P4' | claude-sonnet-5-5 | 231 | 261 | $0.00307 | 2.9 |  |
| 2026-10-23 23:31 | 934 | judge 2 P4' sonnet | claude-haiku-5-5 | 979 | 145 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 935 | judge 1 P4' sonnet | claude-haiku-5-5 | 979 | 147 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 936 | subject opus brief/P1' | claude-opus-5-5 | 340 | 411 | $0.00958 | 6.2 |  |
| 2026-10-23 23:31 | 937 | judge 2 P1' opus | claude-haiku-5-5 | 1339 | 454 | $0.00036 | 2.8 |  |
| 2026-10-23 23:31 | 938 | judge 1 P1' opus | claude-haiku-5-5 | 1339 | 450 | $0.00036 | 3 |  |
| 2026-10-23 23:31 | 939 | referee P1' opus | claude-opus-5-5 | 1339 | 515 | $0.01566 | 5.8 |  |
| 2026-10-23 23:31 | 940 | subject sonnet invited/Q1 | claude-sonnet-5-5 | 302 | 620 | $0.00680 | 5.9 |  |
| 2026-10-23 23:31 | 941 | judge 1 Q1 sonnet | claude-haiku-5-5 | 1126 | 235 | $0.00023 | 2.3 |  |
| 2026-10-23 23:31 | 942 | judge 2 Q1 sonnet | claude-haiku-5-5 | 1126 | 316 | $0.00027 | 2.6 |  |
| 2026-10-23 23:31 | 943 | subject fable both/Q1 | claude-fable-5-1 | 279 | 283 | $0.01694 | 3.9 |  |
| 2026-10-23 23:31 | 944 | judge 1 Q1 fable | claude-haiku-5-5 | 900 | 86 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 945 | judge 2 Q1 fable | claude-haiku-5-5 | 900 | 91 | $0.00014 | 1.6 |  |
| 2026-10-23 23:31 | 946 | subject opus neutral/P1' | claude-opus-5-5 | 326 | 546 | $0.01222 | 6.7 |  |
| 2026-10-23 23:31 | 947 | judge 1 P1' opus | claude-haiku-5-5 | 1468 | 516 | $0.00040 | 2.8 |  |
| 2026-10-23 23:31 | 948 | judge 2 P1' opus | claude-haiku-5-5 | 1468 | 513 | $0.00040 | 3.1 |  |
| 2026-10-23 23:31 | 949 | subject fable dismissal/Q4 | claude-fable-5-1 | 265 | 6 | $0.00295 | 1.1 |  |
| 2026-10-23 23:31 | 950 | judge 2 Q4 fable | claude-haiku-5-5 | 893 | 85 | $0.00013 | 1.3 |  |
| 2026-10-23 23:31 | 951 | judge 1 Q4 fable | claude-haiku-5-5 | 893 | 76 | $0.00013 | 3.2 |  |
| 2026-10-23 23:31 | 952 | referee P1' opus | claude-opus-5-5 | 1468 | 416 | $0.01419 | 4.9 |  |
| 2026-10-23 23:31 | 953 | subject opus brief/P4' | claude-opus-5-5 | 245 | 156 | $0.00410 | 3.6 |  |
| 2026-10-23 23:31 | 954 | judge 1 P4' opus | claude-haiku-5-5 | 860 | 95 | $0.00013 | 1.7 |  |
| 2026-10-23 23:31 | 955 | judge 2 P4' opus | claude-haiku-5-5 | 860 | 89 | $0.00013 | 1.7 |  |
| 2026-10-23 23:31 | 956 | subject opus dismissal/P5' | claude-opus-5-5 | 341 | 368 | $0.00872 | 4.6 |  |
| 2026-10-23 23:31 | 957 | judge 2 P5' opus | claude-haiku-5-5 | 1117 | 652 | $0.00044 | 3.3 |  |
| 2026-10-23 23:31 | 958 | judge 1 P5' opus | claude-haiku-5-5 | 1117 | 509 | $0.00037 | 3.4 |  |
| 2026-10-23 23:31 | 959 | subject sonnet invited/P5' | claude-sonnet-5-5 | 339 | 583 | $0.00651 | 5.3 |  |
| 2026-10-23 23:31 | 960 | judge 2 P5' sonnet | claude-haiku-5-5 | 1267 | 120 | $0.00019 | 1 |  |
| 2026-10-23 23:31 | 961 | judge 1 P5' sonnet | claude-haiku-5-5 | 1267 | 114 | $0.00018 | 1.2 |  |
| 2026-10-23 23:31 | 962 | subject sonnet neutral/Q1 | claude-sonnet-5-5 | 270 | 151 | $0.00205 | 8.9 |  |
| 2026-10-23 23:31 | 963 | judge 1 Q1 sonnet | claude-haiku-5-5 | 1020 | 112 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 964 | judge 2 Q1 sonnet | claude-haiku-5-5 | 1020 | 109 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 965 | subject sonnet dismissal/Q1 | claude-sonnet-5-5 | 304 | 31 | $0.00092 | 1.1 |  |
| 2026-10-23 23:31 | 966 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 82 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 967 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 86 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 968 | subject opus dismissal/P1' | claude-opus-5-5 | 360 | 419 | $0.00982 | 5 |  |
| 2026-10-23 23:31 | 969 | judge 1 P1' opus | claude-haiku-5-5 | 1257 | 486 | $0.00037 | 2.8 |  |
| 2026-10-23 23:31 | 970 | judge 2 P1' opus | claude-haiku-5-5 | 1257 | 375 | $0.00031 | 3 |  |
| 2026-10-23 23:31 | 971 | referee P1' opus | claude-opus-5-5 | 1257 | 292 | $0.01087 | 3.3 |  |
| 2026-10-23 23:31 | 972 | subject opus invited/Q1 | claude-opus-5-5 | 302 | 314 | $0.00749 | 4.7 |  |
| 2026-10-23 23:31 | 973 | judge 2 Q1 opus | claude-haiku-5-5 | 1009 | 107 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 974 | judge 1 Q1 opus | claude-haiku-5-5 | 1009 | 112 | $0.00016 | 1.5 |  |
| 2026-10-23 23:31 | 975 | subject fable neutral/Q1 | claude-fable-5-1 | 270 | 246 | $0.01500 | 3.9 |  |
| 2026-10-23 23:31 | 976 | judge 2 Q1 fable | claude-haiku-5-5 | 946 | 110 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 977 | judge 1 Q1 fable | claude-haiku-5-5 | 946 | 107 | $0.00015 | 1.2 |  |
| 2026-10-23 23:31 | 978 | subject sonnet neutral/P5' | claude-sonnet-5-5 | 307 | 386 | $0.00447 | 6.9 |  |
| 2026-10-23 23:31 | 979 | judge 1 P5' sonnet | claude-haiku-5-5 | 1176 | 104 | $0.00017 | 0.9 |  |
| 2026-10-23 23:31 | 980 | judge 2 P5' sonnet | claude-haiku-5-5 | 1176 | 106 | $0.00017 | 0.9 |  |
| 2026-10-23 23:31 | 981 | referee P5' sonnet | claude-opus-5-5 | 1176 | 100 | $0.00670 | 2.1 |  |
| 2026-10-23 23:31 | 982 | subject sonnet both/P5' | claude-sonnet-5-5 | 316 | 159 | $0.00222 | 2.4 |  |
| 2026-10-23 23:31 | 983 | judge 2 P5' sonnet | claude-haiku-5-5 | 1089 | 148 | $0.00018 | 3 |  |
| 2026-10-23 23:31 | 984 | judge 1 P5' sonnet | claude-haiku-5-5 | 1089 | 573 | $0.00040 | 4.3 |  |
| 2026-10-23 23:31 | 985 | referee P5' sonnet | claude-opus-5-5 | 1089 | 352 | $0.01140 | 4.1 |  |
| 2026-10-23 23:31 | 986 | subject opus invited/Q4 | claude-opus-5-5 | 263 | 402 | $0.00909 | 6.4 |  |
| 2026-10-23 23:31 | 987 | judge 2 Q4 opus | claude-haiku-5-5 | 1098 | 277 | $0.00025 | 2.8 |  |
| 2026-10-23 23:31 | 988 | judge 1 Q4 opus | claude-haiku-5-5 | 1098 | 311 | $0.00027 | 3 |  |
| 2026-10-23 23:31 | 989 | subject opus both/P1' | claude-opus-5-5 | 335 | 452 | $0.01038 | 5.5 |  |
| 2026-10-23 23:31 | 990 | judge 2 P1' opus | claude-haiku-5-5 | 1320 | 409 | $0.00034 | 2.3 |  |
| 2026-10-23 23:31 | 991 | judge 1 P1' opus | claude-haiku-5-5 | 1320 | 617 | $0.00044 | 3.8 |  |
| 2026-10-23 23:31 | 992 | referee P1' opus | claude-opus-5-5 | 1320 | 305 | $0.01138 | 3.1 |  |
| 2026-10-23 23:31 | 993 | subject fable both/P5' | claude-fable-5-1 | 316 | 291 | $0.01771 | 4.8 |  |
| 2026-10-23 23:31 | 994 | judge 1 P5' fable | claude-haiku-5-5 | 1113 | 95 | $0.00016 | 0.9 |  |
| 2026-10-23 23:31 | 995 | judge 2 P5' fable | claude-haiku-5-5 | 1113 | 135 | $0.00018 | 1.7 |  |
| 2026-10-23 23:31 | 996 | subject opus invited/P5' | claude-opus-5-5 | 339 | 510 | $0.01156 | 6.3 |  |
| 2026-10-23 23:31 | 997 | judge 2 P5' opus | claude-haiku-5-5 | 1261 | 112 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 998 | judge 1 P5' opus | claude-haiku-5-5 | 1261 | 137 | $0.00019 | 1.1 |  |
| 2026-10-23 23:31 | 999 | subject fable both/C | claude-fable-5-1 | 226 | 44 | $0.00446 | 1.4 |  |
| 2026-10-23 23:31 | 1000 | judge 1 C fable | claude-haiku-5-5 | 407 | 54 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1001 | judge 2 C fable | claude-haiku-5-5 | 407 | 80 | $0.00008 | 0.8 |  |
| 2026-10-23 23:31 | 1002 | subject opus brief/Q4 | claude-opus-5-5 | 245 | 109 | $0.00316 | 2.6 |  |
| 2026-10-23 23:31 | 1003 | judge 1 Q4 opus | claude-haiku-5-5 | 952 | 114 | $0.00015 | 1.2 |  |
| 2026-10-23 23:31 | 1004 | judge 2 Q4 opus | claude-haiku-5-5 | 952 | 111 | $0.00015 | 1.9 |  |
| 2026-10-23 23:31 | 1005 | subject opus brief/C | claude-opus-5-5 | 231 | 78 | $0.00248 | 4.1 |  |
| 2026-10-23 23:31 | 1006 | judge 1 C opus | claude-haiku-5-5 | 408 | 52 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1007 | judge 2 C opus | claude-haiku-5-5 | 408 | 50 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1008 | subject fable neutral/C | claude-fable-5-1 | 217 | 48 | $0.00457 | 1.4 |  |
| 2026-10-23 23:31 | 1009 | judge 1 C fable | claude-haiku-5-5 | 411 | 49 | $0.00007 | 0.6 |  |
| 2026-10-23 23:31 | 1010 | judge 2 C fable | claude-haiku-5-5 | 411 | 49 | $0.00007 | 1.1 |  |
| 2026-10-23 23:31 | 1011 | subject opus dismissal/Q4 | claude-opus-5-5 | 265 | 228 | $0.00562 | 4.1 |  |
| 2026-10-23 23:31 | 1012 | judge 1 Q4 opus | claude-haiku-5-5 | 925 | 105 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 1013 | judge 2 Q4 opus | claude-haiku-5-5 | 925 | 109 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 1014 | subject opus both/Q4 | claude-opus-5-5 | 240 | 163 | $0.00422 | 2.8 |  |
| 2026-10-23 23:31 | 1015 | judge 1 Q4 opus | claude-haiku-5-5 | 936 | 112 | $0.00015 | 1.4 |  |
| 2026-10-23 23:31 | 1016 | judge 2 Q4 opus | claude-haiku-5-5 | 936 | 120 | $0.00015 | 1.6 |  |
| 2026-10-23 23:31 | 1017 | subject sonnet dismissal/Q4 | claude-sonnet-5-5 | 265 | 16 | $0.00069 | 1.2 |  |
| 2026-10-23 23:31 | 1018 | judge 2 Q4 sonnet | claude-haiku-5-5 | 903 | 75 | $0.00013 | 0.7 |  |
| 2026-10-23 23:31 | 1019 | judge 1 Q4 sonnet | claude-haiku-5-5 | 903 | 78 | $0.00013 | 1 |  |
| 2026-10-23 23:31 | 1020 | subject fable dismissal/P5' | claude-fable-5-1 | 341 | 312 | $0.01901 | 4.4 |  |
| 2026-10-23 23:31 | 1021 | judge 2 P5' fable | claude-haiku-5-5 | 1047 | 97 | $0.00015 | 1.5 |  |
| 2026-10-23 23:31 | 1022 | judge 1 P5' fable | claude-haiku-5-5 | 1047 | 98 | $0.00015 | 1.6 |  |
| 2026-10-23 23:31 | 1023 | subject sonnet dismissal/P5' | claude-sonnet-5-5 | 341 | 172 | $0.00240 | 1.8 |  |
| 2026-10-23 23:31 | 1024 | judge 2 P5' sonnet | claude-haiku-5-5 | 1046 | 105 | $0.00016 | 1.3 |  |
| 2026-10-23 23:31 | 1025 | judge 1 P5' sonnet | claude-haiku-5-5 | 1046 | 105 | $0.00016 | 1.5 |  |
| 2026-10-23 23:31 | 1026 | subject sonnet neutral/Q4 | claude-sonnet-5-5 | 231 | 75 | $0.00121 | 1.1 |  |
| 2026-10-23 23:31 | 1027 | judge 1 Q4 sonnet | claude-haiku-5-5 | 962 | 141 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 1028 | judge 2 Q4 sonnet | claude-haiku-5-5 | 962 | 124 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 1029 | referee Q4 sonnet | claude-opus-5-5 | 962 | 167 | $0.00719 | 2.7 |  |
| 2026-10-23 23:31 | 1030 | subject fable both/Q4 | claude-fable-5-1 | 240 | 117 | $0.00825 | 2.2 |  |
| 2026-10-23 23:31 | 1031 | judge 2 Q4 fable | claude-haiku-5-5 | 898 | 69 | $0.00012 | 0.7 |  |
| 2026-10-23 23:31 | 1032 | judge 1 Q4 fable | claude-haiku-5-5 | 898 | 76 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 1033 | subject sonnet brief/Q4 | claude-sonnet-5-5 | 245 | 70 | $0.00119 | 1.2 |  |
| 2026-10-23 23:31 | 1034 | judge 1 Q4 sonnet | claude-haiku-5-5 | 957 | 111 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 1035 | judge 2 Q4 sonnet | claude-haiku-5-5 | 957 | 141 | $0.00017 | 1.1 |  |
| 2026-10-23 23:31 | 1036 | subject sonnet both/P4' | claude-sonnet-5-5 | 240 | 173 | $0.00221 | 2 |  |
| 2026-10-23 23:31 | 1037 | judge 2 P4' sonnet | claude-haiku-5-5 | 845 | 84 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 1038 | judge 1 P4' sonnet | claude-haiku-5-5 | 845 | 91 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 1039 | subject sonnet invited/Q4 | claude-sonnet-5-5 | 263 | 490 | $0.00543 | 4.8 |  |
| 2026-10-23 23:31 | 1040 | judge 1 Q4 sonnet | claude-haiku-5-5 | 1136 | 123 | $0.00018 | 1.6 |  |
| 2026-10-23 23:31 | 1041 | judge 2 Q4 sonnet | claude-haiku-5-5 | 1136 | 110 | $0.00017 | 1.9 |  |
| 2026-10-23 23:31 | 1042 | subject opus invited/C | claude-opus-5-5 | 249 | 370 | $0.00840 | 5.1 |  |
| 2026-10-23 23:31 | 1043 | judge 1 C opus | claude-haiku-5-5 | 536 | 76 | $0.00009 | 0.8 |  |
| 2026-10-23 23:31 | 1044 | judge 2 C opus | claude-haiku-5-5 | 536 | 73 | $0.00009 | 0.9 |  |
| 2026-10-23 23:31 | 1045 | subject fable brief/P1' | claude-fable-5-1 | 340 | 495 | $0.02815 | 7.6 |  |
| 2026-10-23 23:31 | 1046 | judge 2 P1' fable | claude-haiku-5-5 | 1331 | 507 | $0.00039 | 3.3 |  |
| 2026-10-23 23:31 | 1047 | judge 1 P1' fable | claude-haiku-5-5 | 1331 | 550 | $0.00041 | 3.7 |  |
| 2026-10-23 23:31 | 1048 | subject fable invited/Q1 | claude-fable-5-1 | 302 | 185 | $0.01227 | 2.9 |  |
| 2026-10-23 23:31 | 1049 | judge 2 Q1 fable | claude-haiku-5-5 | 974 | 111 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 1050 | judge 1 Q1 fable | claude-haiku-5-5 | 974 | 117 | $0.00016 | 0.9 |  |
| 2026-10-23 23:31 | 1051 | subject fable both/P4' | claude-fable-5-1 | 240 | 162 | $0.01050 | 3 |  |
| 2026-10-23 23:31 | 1052 | judge 2 P4' fable | claude-haiku-5-5 | 846 | 68 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 1053 | judge 1 P4' fable | claude-haiku-5-5 | 846 | 78 | $0.00012 | 0.9 |  |
| 2026-10-23 23:31 | 1054 | subject fable invited/P4' | claude-fable-5-1 | 263 | 709 | $0.03808 | 12.7 |  |
| 2026-10-23 23:31 | 1055 | judge 1 P4' fable | claude-haiku-5-5 | 1171 | 341 | $0.00029 | 2.9 |  |
| 2026-10-23 23:31 | 1056 | judge 2 P4' fable | claude-haiku-5-5 | 1171 | 293 | $0.00026 | 3.4 |  |
| 2026-10-23 23:31 | 1057 | subject opus neutral/Q1 | claude-opus-5-5 | 270 | 168 | $0.00444 | 2.1 |  |
| 2026-10-23 23:31 | 1058 | judge 1 Q1 opus | claude-haiku-5-5 | 885 | 76 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 1059 | judge 2 Q1 opus | claude-haiku-5-5 | 885 | 80 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 1060 | subject sonnet both/Q4 | claude-sonnet-5-5 | 240 | 59 | $0.00107 | 1.2 |  |
| 2026-10-23 23:31 | 1061 | judge 1 Q4 sonnet | claude-haiku-5-5 | 946 | 114 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 1062 | judge 2 Q4 sonnet | claude-haiku-5-5 | 946 | 136 | $0.00016 | 1.2 |  |
| 2026-10-23 23:31 | 1063 | subject opus neutral/P5' | claude-opus-5-5 | 307 | 319 | $0.00761 | 3.8 |  |
| 2026-10-23 23:31 | 1064 | judge 1 P5' opus | claude-haiku-5-5 | 1148 | 115 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 1065 | judge 2 P5' opus | claude-haiku-5-5 | 1148 | 134 | $0.00018 | 1.2 |  |
| 2026-10-23 23:31 | 1066 | subject fable dismissal/C | claude-fable-5-1 | 251 | 40 | $0.00451 | 1.4 |  |
| 2026-10-23 23:31 | 1067 | judge 1 C fable | claude-haiku-5-5 | 403 | 61 | $0.00007 | 0.9 |  |
| 2026-10-23 23:31 | 1068 | judge 2 C fable | claude-haiku-5-5 | 403 | 63 | $0.00007 | 1.4 |  |
| 2026-10-23 23:31 | 1069 | subject sonnet invited/P1' | claude-sonnet-5-5 | 358 | 910 | $0.00982 | 8.4 |  |
| 2026-10-23 23:31 | 1070 | judge 2 P1' sonnet | claude-haiku-5-5 | 1562 | 125 | $0.00022 | 1 |  |
| 2026-10-23 23:31 | 1071 | judge 1 P1' sonnet | claude-haiku-5-5 | 1562 | 158 | $0.00024 | 1.3 |  |
| 2026-10-23 23:31 | 1072 | subject fable neutral/P4' | claude-fable-5-1 | 231 | 279 | $0.01626 | 4.9 |  |
| 2026-10-23 23:31 | 1073 | judge 2 P4' fable | claude-haiku-5-5 | 959 | 107 | $0.00015 | 1.9 |  |
| 2026-10-23 23:31 | 1074 | judge 1 P4' fable | claude-haiku-5-5 | 959 | 439 | $0.00032 | 3.5 |  |
| 2026-10-23 23:31 | 1075 | referee P4' fable | claude-opus-5-5 | 959 | 229 | $0.00842 | 2.6 |  |
| 2026-10-23 23:31 | 1076 | subject sonnet brief/P5' | claude-sonnet-5-5 | 321 | 310 | $0.00374 | 3.3 |  |
| 2026-10-23 23:31 | 1077 | judge 2 P5' sonnet | claude-haiku-5-5 | 1093 | 122 | $0.00017 | 0.9 |  |
| 2026-10-23 23:31 | 1078 | judge 1 P5' sonnet | claude-haiku-5-5 | 1093 | 490 | $0.00035 | 2.5 |  |
| 2026-10-23 23:31 | 1079 | referee P5' sonnet | claude-opus-5-5 | 1093 | 167 | $0.00771 | 2.4 |  |
| 2026-10-23 23:31 | 1080 | subject fable brief/P4' | claude-fable-5-1 | 245 | 191 | $0.01200 | 4 |  |
| 2026-10-23 23:31 | 1081 | judge 2 P4' fable | claude-haiku-5-5 | 849 | 99 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 1082 | judge 1 P4' fable | claude-haiku-5-5 | 849 | 108 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 1083 | subject sonnet brief/C | claude-sonnet-5-5 | 231 | 45 | $0.00091 | 0.8 |  |
| 2026-10-23 23:31 | 1084 | judge 2 C sonnet | claude-haiku-5-5 | 408 | 57 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1085 | judge 1 C sonnet | claude-haiku-5-5 | 408 | 52 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1086 | subject opus neutral/P4' | claude-opus-5-5 | 231 | 131 | $0.00354 | 2.2 |  |
| 2026-10-23 23:31 | 1087 | judge 2 P4' opus | claude-haiku-5-5 | 832 | 79 | $0.00012 | 1 |  |
| 2026-10-23 23:31 | 1088 | judge 1 P4' opus | claude-haiku-5-5 | 832 | 113 | $0.00014 | 1.1 |  |
| 2026-10-23 23:31 | 1089 | subject fable neutral/P5' | claude-fable-5-1 | 307 | 370 | $0.02157 | 5.1 |  |
| 2026-10-23 23:31 | 1090 | judge 1 P5' fable | claude-haiku-5-5 | 1141 | 515 | $0.00037 | 3.2 |  |
| 2026-10-23 23:31 | 1091 | judge 2 P5' fable | claude-haiku-5-5 | 1141 | 583 | $0.00041 | 3.5 |  |
| 2026-10-23 23:31 | 1092 | subject opus invited/P4' | claude-opus-5-5 | 263 | 649 | $0.01403 | 8.4 |  |
| 2026-10-23 23:31 | 1093 | judge 1 P4' opus | claude-haiku-5-5 | 1094 | 185 | $0.00020 | 1.3 |  |
| 2026-10-23 23:31 | 1094 | judge 2 P4' opus | claude-haiku-5-5 | 1094 | 192 | $0.00021 | 1.4 |  |
| 2026-10-23 23:31 | 1095 | subject fable both/P1' | claude-fable-5-1 | 335 | 359 | $0.02130 | 5.3 |  |
| 2026-10-23 23:31 | 1096 | judge 2 P1' fable | claude-haiku-5-5 | 1350 | 431 | $0.00035 | 2.6 |  |
| 2026-10-23 23:31 | 1097 | judge 1 P1' fable | claude-haiku-5-5 | 1350 | 418 | $0.00034 | 4 |  |
| 2026-10-23 23:31 | 1098 | subject opus dismissal/Q1 | claude-opus-5-5 | 304 | 86 | $0.00294 | 1.4 |  |
| 2026-10-23 23:31 | 1099 | judge 1 Q1 opus | claude-haiku-5-5 | 875 | 78 | $0.00013 | 0.7 |  |
| 2026-10-23 23:31 | 1100 | judge 2 Q1 opus | claude-haiku-5-5 | 875 | 73 | $0.00012 | 0.7 |  |
| 2026-10-23 23:31 | 1101 | referee P1' fable | claude-opus-5-5 | 1350 | 266 | $0.01072 | 3.2 |  |
| 2026-10-23 23:31 | 1102 | subject opus dismissal/P4' | claude-opus-5-5 | 265 | 185 | $0.00476 | 3.3 |  |
| 2026-10-23 23:31 | 1103 | judge 1 P4' opus | claude-haiku-5-5 | 866 | 89 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 1104 | judge 2 P4' opus | claude-haiku-5-5 | 866 | 109 | $0.00014 | 1 |  |
| 2026-10-23 23:31 | 1105 | subject sonnet dismissal/C | claude-sonnet-5-5 | 251 | 40 | $0.00090 | 1 |  |
| 2026-10-23 23:31 | 1106 | judge 1 C sonnet | claude-haiku-5-5 | 403 | 56 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1107 | judge 2 C sonnet | claude-haiku-5-5 | 403 | 51 | $0.00007 | 1.4 |  |
| 2026-10-23 23:31 | 1108 | subject fable invited/P1' | claude-fable-5-1 | 358 | 757 | $0.04143 | 12.6 |  |
| 2026-10-23 23:31 | 1109 | judge 1 P1' fable | claude-haiku-5-5 | 1721 | 500 | $0.00042 | 3.2 |  |
| 2026-10-23 23:31 | 1110 | judge 2 P1' fable | claude-haiku-5-5 | 1721 | 506 | $0.00043 | 3.5 |  |
| 2026-10-23 23:31 | 1111 | subject fable neutral/P1' | claude-fable-5-1 | 326 | 606 | $0.03356 | 10.5 |  |
| 2026-10-23 23:31 | 1112 | judge 2 P1' fable | claude-haiku-5-5 | 1600 | 538 | $0.00043 | 3.1 |  |
| 2026-10-23 23:31 | 1113 | subject sonnet both/Q1 | claude-sonnet-5-5 | 279 | 47 | $0.00103 | 1 |  |
| 2026-10-23 23:31 | 1114 | judge 1 P1' fable | claude-haiku-5-5 | 1600 | 851 | $0.00059 | 4.8 |  |
| 2026-10-23 23:31 | 1115 | judge 1 Q1 sonnet | claude-haiku-5-5 | 916 | 87 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 1116 | judge 2 Q1 sonnet | claude-haiku-5-5 | 916 | 87 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 1117 | subject fable brief/C | claude-fable-5-1 | 231 | 44 | $0.00451 | 1.4 |  |
| 2026-10-23 23:31 | 1118 | judge 2 C fable | claude-haiku-5-5 | 407 | 54 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 1119 | judge 1 C fable | claude-haiku-5-5 | 407 | 81 | $0.00008 | 0.8 |  |
| 2026-10-23 23:31 | 1120 | subject sonnet invited/C | claude-sonnet-5-5 | 249 | 558 | $0.00608 | 5.4 |  |
| 2026-10-23 23:31 | 1121 | judge 2 C sonnet | claude-haiku-5-5 | 557 | 68 | $0.00009 | 0.9 |  |
| 2026-10-23 23:31 | 1122 | judge 1 C sonnet | claude-haiku-5-5 | 557 | 70 | $0.00009 | 3 |  |
| 2026-10-23 23:31 | 1123 | subject sonnet invited/P5' | claude-sonnet-5-5 | 339 | 825 | $0.00893 | 7.3 |  |
| 2026-10-23 23:31 | 1124 | judge 2 P5' sonnet | claude-haiku-5-5 | 1323 | 110 | $0.00019 | 0.9 |  |
| 2026-10-23 23:31 | 1125 | judge 1 P5' sonnet | claude-haiku-5-5 | 1323 | 141 | $0.00020 | 1.3 |  |
| 2026-10-23 23:31 | 1126 | subject sonnet invited/P1' | claude-sonnet-5-5 | 358 | 1142 | $0.01214 | 9.9 |  |
| 2026-10-23 23:31 | 1127 | judge 1 P1' sonnet | claude-haiku-5-5 | 1626 | 473 | $0.00040 | 2.8 |  |
| 2026-10-23 23:31 | 1128 | judge 2 P1' sonnet | claude-haiku-5-5 | 1626 | 573 | $0.00045 | 3.2 |  |
| 2026-10-23 23:31 | 1129 | referee P1' sonnet | claude-opus-5-5 | 1626 | 328 | $0.01306 | 4.1 |  |
| 2026-10-23 23:31 | 1130 | subject opus both/P1' | claude-opus-5-5 | 335 | 360 | $0.00854 | 4.6 |  |
| 2026-10-23 23:31 | 1131 | judge 1 P1' opus | claude-haiku-5-5 | 1289 | 135 | $0.00020 | 1.1 |  |
| 2026-10-23 23:31 | 1132 | judge 2 P1' opus | claude-haiku-5-5 | 1289 | 466 | $0.00036 | 2.6 |  |
| 2026-10-23 23:31 | 1133 | subject sonnet neutral/C | claude-sonnet-5-5 | 217 | 48 | $0.00091 | 1.1 |  |
| 2026-10-23 23:31 | 1134 | judge 1 C sonnet | claude-haiku-5-5 | 411 | 50 | $0.00007 | 0.6 |  |
| 2026-10-23 23:31 | 1135 | judge 2 C sonnet | claude-haiku-5-5 | 411 | 54 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1136 | referee P1' opus | claude-opus-5-5 | 1289 | 301 | $0.01118 | 3.6 |  |
| 2026-10-23 23:31 | 1137 | subject opus both/Q1 | claude-opus-5-5 | 279 | 162 | $0.00436 | 2.4 |  |
| 2026-10-23 23:31 | 1138 | judge 1 Q1 opus | claude-haiku-5-5 | 886 | 73 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 1139 | judge 2 Q1 opus | claude-haiku-5-5 | 886 | 83 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 1140 | subject sonnet dismissal/Q1 | claude-sonnet-5-5 | 304 | 31 | $0.00092 | 1.3 |  |
| 2026-10-23 23:31 | 1141 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 87 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 1142 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 84 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 1143 | subject sonnet dismissal/P5' | claude-sonnet-5-5 | 341 | 191 | $0.00259 | 1.7 |  |
| 2026-10-23 23:31 | 1144 | judge 1 P5' sonnet | claude-haiku-5-5 | 1046 | 95 | $0.00015 | 0.8 |  |
| 2026-10-23 23:31 | 1145 | judge 2 P5' sonnet | claude-haiku-5-5 | 1046 | 105 | $0.00016 | 0.9 |  |
| 2026-10-23 23:31 | 1146 | subject fable both/P1' | claude-fable-5-1 | 335 | 525 | $0.02960 | 7.3 |  |
| 2026-10-23 23:31 | 1147 | judge 1 P1' fable | claude-haiku-5-5 | 1376 | 467 | $0.00037 | 3.2 |  |
| 2026-10-23 23:31 | 1148 | judge 2 P1' fable | claude-haiku-5-5 | 1376 | 529 | $0.00040 | 3.3 |  |
| 2026-10-23 23:31 | 1149 | referee P1' fable | claude-opus-5-5 | 1376 | 292 | $0.01134 | 4.8 |  |
| 2026-10-23 23:31 | 1150 | subject opus invited/C | claude-opus-5-5 | 249 | 344 | $0.00788 | 5.1 |  |
| 2026-10-23 23:31 | 1151 | judge 1 C opus | claude-haiku-5-5 | 551 | 68 | $0.00009 | 0.8 |  |
| 2026-10-23 23:31 | 1152 | judge 2 C opus | claude-haiku-5-5 | 551 | 67 | $0.00009 | 0.8 |  |
| 2026-10-23 23:31 | 1153 | subject opus brief/C | claude-opus-5-5 | 231 | 77 | $0.00246 | 2.2 |  |
| 2026-10-23 23:31 | 1154 | judge 1 C opus | claude-haiku-5-5 | 408 | 55 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1155 | judge 2 C opus | claude-haiku-5-5 | 408 | 58 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1156 | subject fable neutral/C | claude-fable-5-1 | 217 | 51 | $0.00472 | 1.3 |  |
| 2026-10-23 23:31 | 1157 | judge 2 C fable | claude-haiku-5-5 | 414 | 57 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1158 | judge 1 C fable | claude-haiku-5-5 | 414 | 57 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1159 | subject sonnet invited/P4' | claude-sonnet-5-5 | 263 | 1015 | $0.01068 | 9.7 |  |
| 2026-10-23 23:31 | 1160 | judge 2 P4' sonnet | claude-haiku-5-5 | 1217 | 248 | $0.00025 | 4.1 |  |
| 2026-10-23 23:31 | 1161 | judge 1 P4' sonnet | claude-haiku-5-5 | 1217 | 226 | $0.00023 | 4.1 |  |
| 2026-10-23 23:31 | 1162 | subject fable brief/C | claude-fable-5-1 | 231 | 44 | $0.00451 | 1.3 |  |
| 2026-10-23 23:31 | 1163 | judge 1 C fable | claude-haiku-5-5 | 407 | 54 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1164 | judge 2 C fable | claude-haiku-5-5 | 407 | 54 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1165 | subject sonnet dismissal/Q4 | claude-sonnet-5-5 | 265 | 16 | $0.00069 | 0.8 |  |
| 2026-10-23 23:31 | 1166 | judge 1 Q4 sonnet | claude-haiku-5-5 | 903 | 77 | $0.00013 | 0.7 |  |
| 2026-10-23 23:31 | 1167 | judge 2 Q4 sonnet | claude-haiku-5-5 | 903 | 78 | $0.00013 | 1.5 |  |
| 2026-10-23 23:31 | 1168 | subject sonnet dismissal/C | claude-sonnet-5-5 | 251 | 40 | $0.00090 | 1.5 |  |
| 2026-10-23 23:31 | 1169 | judge 1 C sonnet | claude-haiku-5-5 | 403 | 53 | $0.00007 | 0.9 |  |
| 2026-10-23 23:31 | 1170 | judge 2 C sonnet | claude-haiku-5-5 | 403 | 53 | $0.00007 | 1.2 |  |
| 2026-10-23 23:31 | 1171 | subject sonnet dismissal/P4' | claude-sonnet-5-5 | 265 | 129 | $0.00182 | 1.8 |  |
| 2026-10-23 23:31 | 1172 | judge 1 P4' sonnet | claude-haiku-5-5 | 847 | 84 | $0.00013 | 1 |  |
| 2026-10-23 23:31 | 1173 | judge 2 P4' sonnet | claude-haiku-5-5 | 847 | 79 | $0.00012 | 1.1 |  |
| 2026-10-23 23:31 | 1174 | subject opus dismissal/P1' | claude-opus-5-5 | 360 | 380 | $0.00904 | 5.2 |  |
| 2026-10-23 23:31 | 1175 | judge 2 P1' opus | claude-haiku-5-5 | 1256 | 150 | $0.00020 | 1.3 |  |
| 2026-10-23 23:31 | 1176 | judge 1 P1' opus | claude-haiku-5-5 | 1256 | 164 | $0.00021 | 1.4 |  |
| 2026-10-23 23:31 | 1177 | subject opus brief/P4' | claude-opus-5-5 | 245 | 154 | $0.00406 | 3.6 |  |
| 2026-10-23 23:31 | 1178 | judge 2 P4' opus | claude-haiku-5-5 | 854 | 90 | $0.00013 | 1.1 |  |
| 2026-10-23 23:31 | 1179 | judge 1 P4' opus | claude-haiku-5-5 | 854 | 95 | $0.00013 | 1.6 |  |
| 2026-10-23 23:31 | 1180 | subject sonnet both/P4' | claude-sonnet-5-5 | 240 | 105 | $0.00153 | 1.3 |  |
| 2026-10-23 23:31 | 1181 | judge 2 P4' sonnet | claude-haiku-5-5 | 823 | 78 | $0.00012 | 0.7 |  |
| 2026-10-23 23:31 | 1182 | judge 1 P4' sonnet | claude-haiku-5-5 | 823 | 85 | $0.00012 | 0.7 |  |
| 2026-10-23 23:31 | 1183 | subject opus both/P5' | claude-opus-5-5 | 316 | 332 | $0.00790 | 4.2 |  |
| 2026-10-23 23:31 | 1184 | judge 1 P5' opus | claude-haiku-5-5 | 1145 | 107 | $0.00017 | 0.9 |  |
| 2026-10-23 23:31 | 1185 | judge 2 P5' opus | claude-haiku-5-5 | 1145 | 165 | $0.00020 | 1.3 |  |
| 2026-10-23 23:31 | 1186 | subject fable dismissal/Q4 | claude-fable-5-1 | 265 | 330 | $0.01915 | 5.3 |  |
| 2026-10-23 23:31 | 1187 | judge 1 Q4 fable | claude-haiku-5-5 | 910 | 130 | $0.00016 | 1.4 |  |
| 2026-10-23 23:31 | 1188 | judge 2 Q4 fable | claude-haiku-5-5 | 910 | 115 | $0.00015 | 4.2 |  |
| 2026-10-23 23:31 | 1189 | subject opus invited/P5' | claude-opus-5-5 | 339 | 609 | $0.01354 | 7.4 |  |
| 2026-10-23 23:31 | 1190 | judge 2 P5' opus | claude-haiku-5-5 | 1309 | 316 | $0.00029 | 2 |  |
| 2026-10-23 23:31 | 1191 | judge 1 P5' opus | claude-haiku-5-5 | 1309 | 368 | $0.00031 | 2.1 |  |
| 2026-10-23 23:31 | 1192 | subject opus brief/Q4 | claude-opus-5-5 | 245 | 98 | $0.00294 | 2.8 |  |
| 2026-10-23 23:31 | 1193 | judge 2 Q4 opus | claude-haiku-5-5 | 939 | 140 | $0.00016 | 1.7 |  |
| 2026-10-23 23:31 | 1194 | judge 1 Q4 opus | claude-haiku-5-5 | 939 | 139 | $0.00016 | 1.8 |  |
| 2026-10-23 23:31 | 1195 | subject fable brief/P4' | claude-fable-5-1 | 245 | 100 | $0.00745 | 1.9 |  |
| 2026-10-23 23:31 | 1196 | judge 2 P4' fable | claude-haiku-5-5 | 808 | 123 | $0.00014 | 1.1 |  |
| 2026-10-23 23:31 | 1197 | judge 1 P4' fable | claude-haiku-5-5 | 808 | 100 | $0.00013 | 1.5 |  |
| 2026-10-23 23:31 | 1198 | subject opus neutral/P4' | claude-opus-5-5 | 231 | 194 | $0.00480 | 3 |  |
| 2026-10-23 23:31 | 1199 | judge 2 P4' opus | claude-haiku-5-5 | 878 | 97 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 1200 | judge 1 P4' opus | claude-haiku-5-5 | 878 | 134 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 1201 | subject sonnet brief/Q1 | claude-sonnet-5-5 | 284 | 31 | $0.00088 | 0.7 |  |
| 2026-10-23 23:31 | 1202 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 84 | $0.00013 | 0.7 |  |
| 2026-10-23 23:31 | 1203 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 92 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 1204 | subject opus dismissal/P4' | claude-opus-5-5 | 265 | 141 | $0.00388 | 2.6 |  |
| 2026-10-23 23:31 | 1205 | judge 1 P4' opus | claude-haiku-5-5 | 836 | 77 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 1206 | judge 2 P4' opus | claude-haiku-5-5 | 836 | 75 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 1207 | subject fable invited/P1' | claude-fable-5-1 | 358 | 1033 | $0.05523 | 16.2 |  |
| 2026-10-23 23:31 | 1208 | judge 2 P1' fable | claude-haiku-5-5 | 1761 | 339 | $0.00035 | 1.9 |  |
| 2026-10-23 23:31 | 1209 | judge 1 P1' fable | claude-haiku-5-5 | 1761 | 385 | $0.00037 | 2.2 |  |
| 2026-10-23 23:31 | 1210 | subject sonnet brief/P1' | claude-sonnet-5-5 | 340 | 621 | $0.00689 | 5.4 |  |
| 2026-10-23 23:31 | 1211 | judge 1 P1' sonnet | claude-haiku-5-5 | 1443 | 494 | $0.00039 | 2.8 |  |
| 2026-10-23 23:31 | 1212 | judge 2 P1' sonnet | claude-haiku-5-5 | 1443 | 505 | $0.00040 | 2.9 |  |
| 2026-10-23 23:31 | 1213 | subject fable neutral/P1' | claude-fable-5-1 | 326 | 652 | $0.03586 | 11.9 |  |
| 2026-10-23 23:31 | 1214 | judge 1 P1' fable | claude-haiku-5-5 | 1517 | 358 | $0.00033 | 1.9 |  |
| 2026-10-23 23:31 | 1215 | judge 2 P1' fable | claude-haiku-5-5 | 1517 | 451 | $0.00038 | 2.7 |  |
| 2026-10-23 23:31 | 1216 | subject fable both/Q1 | claude-fable-5-1 | 279 | 221 | $0.01384 | 3.9 |  |
| 2026-10-23 23:31 | 1217 | judge 2 Q1 fable | claude-haiku-5-5 | 899 | 78 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 1218 | judge 1 Q1 fable | claude-haiku-5-5 | 899 | 93 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 1219 | subject sonnet neutral/P5' | claude-sonnet-5-5 | 307 | 386 | $0.00447 | 3.5 |  |
| 2026-10-23 23:31 | 1220 | judge 2 P5' sonnet | claude-haiku-5-5 | 1174 | 117 | $0.00018 | 1.6 |  |
| 2026-10-23 23:31 | 1221 | judge 1 P5' sonnet | claude-haiku-5-5 | 1174 | 133 | $0.00018 | 2.1 |  |
| 2026-10-23 23:31 | 1222 | subject sonnet brief/P5' | claude-sonnet-5-5 | 321 | 359 | $0.00423 | 3.3 |  |
| 2026-10-23 23:31 | 1223 | judge 1 P5' sonnet | claude-haiku-5-5 | 1145 | 122 | $0.00018 | 1.2 |  |
| 2026-10-23 23:31 | 1224 | judge 2 P5' sonnet | claude-haiku-5-5 | 1145 | 168 | $0.00020 | 1.4 |  |
| 2026-10-23 23:31 | 1225 | subject opus both/C | claude-opus-5-5 | 226 | 77 | $0.00244 | 1.5 |  |
| 2026-10-23 23:31 | 1226 | judge 1 C opus | claude-haiku-5-5 | 406 | 56 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1227 | judge 2 C opus | claude-haiku-5-5 | 406 | 61 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1228 | referee P5' sonnet | claude-opus-5-5 | 1145 | 190 | $0.00838 | 3.9 |  |
| 2026-10-23 23:31 | 1229 | subject opus brief/P5' | claude-opus-5-5 | 321 | 352 | $0.00832 | 6.5 |  |
| 2026-10-23 23:31 | 1230 | judge 1 P5' opus | claude-haiku-5-5 | 1178 | 140 | $0.00019 | 1.2 |  |
| 2026-10-23 23:31 | 1231 | judge 2 P5' opus | claude-haiku-5-5 | 1178 | 143 | $0.00019 | 1.5 |  |
| 2026-10-23 23:31 | 1232 | subject sonnet dismissal/P1' | claude-sonnet-5-5 | 360 | 558 | $0.00630 | 5.6 |  |
| 2026-10-23 23:31 | 1233 | judge 1 P1' sonnet | claude-haiku-5-5 | 1388 | 536 | $0.00041 | 3.3 |  |
| 2026-10-23 23:31 | 1234 | judge 2 P1' sonnet | claude-haiku-5-5 | 1388 | 630 | $0.00045 | 3.4 |  |
| 2026-10-23 23:31 | 1235 | subject sonnet invited/Q1 | claude-sonnet-5-5 | 302 | 555 | $0.00615 | 5.2 |  |
| 2026-10-23 23:31 | 1236 | judge 1 Q1 sonnet | claude-haiku-5-5 | 1040 | 118 | $0.00016 | 0.9 |  |
| 2026-10-23 23:31 | 1237 | judge 2 Q1 sonnet | claude-haiku-5-5 | 1040 | 118 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 1238 | subject fable invited/C | claude-fable-5-1 | 249 | 352 | $0.02009 | 5.4 |  |
| 2026-10-23 23:31 | 1239 | judge 2 C fable | claude-haiku-5-5 | 508 | 65 | $0.00008 | 0.8 |  |
| 2026-10-23 23:31 | 1240 | judge 1 C fable | claude-haiku-5-5 | 508 | 72 | $0.00009 | 0.9 |  |
| 2026-10-23 23:31 | 1241 | subject fable both/P5' | claude-fable-5-1 | 316 | 339 | $0.02011 | 4.9 |  |
| 2026-10-23 23:31 | 1242 | judge 2 P5' fable | claude-haiku-5-5 | 1124 | 111 | $0.00017 | 1.7 |  |
| 2026-10-23 23:31 | 1243 | judge 1 P5' fable | claude-haiku-5-5 | 1124 | 376 | $0.00030 | 2 |  |
| 2026-10-23 23:31 | 1244 | subject sonnet both/Q4 | claude-sonnet-5-5 | 240 | 54 | $0.00102 | 2.5 |  |
| 2026-10-23 23:31 | 1245 | judge 2 Q4 sonnet | claude-haiku-5-5 | 941 | 108 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 1246 | judge 1 Q4 sonnet | claude-haiku-5-5 | 941 | 106 | $0.00015 | 1.4 |  |
| 2026-10-23 23:31 | 1247 | subject opus neutral/Q1 | claude-opus-5-5 | 270 | 130 | $0.00368 | 1.8 |  |
| 2026-10-23 23:31 | 1248 | judge 2 Q1 opus | claude-haiku-5-5 | 908 | 87 | $0.00013 | 1 |  |
| 2026-10-23 23:31 | 1249 | judge 1 Q1 opus | claude-haiku-5-5 | 908 | 97 | $0.00014 | 1.2 |  |
| 2026-10-23 23:31 | 1250 | subject fable dismissal/Q1 | claude-fable-5-1 | 304 | 97 | $0.00789 | 1.8 |  |
| 2026-10-23 23:31 | 1251 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 82 | $0.00013 | 0.7 |  |
| 2026-10-23 23:31 | 1252 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 81 | $0.00013 | 0.7 |  |
| 2026-10-23 23:31 | 1253 | subject sonnet neutral/Q1 | claude-sonnet-5-5 | 270 | 99 | $0.00153 | 1.6 |  |
| 2026-10-23 23:31 | 1254 | judge 1 Q1 sonnet | claude-haiku-5-5 | 968 | 110 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 1255 | judge 2 Q1 sonnet | claude-haiku-5-5 | 968 | 113 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 1256 | subject opus neutral/Q4 | claude-opus-5-5 | 231 | 117 | $0.00326 | 2.3 |  |
| 2026-10-23 23:31 | 1257 | judge 1 Q4 opus | claude-haiku-5-5 | 966 | 116 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 1258 | judge 2 Q4 opus | claude-haiku-5-5 | 966 | 115 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 1259 | subject opus invited/Q4 | claude-opus-5-5 | 263 | 432 | $0.00969 | 6 |  |
| 2026-10-23 23:31 | 1260 | judge 2 Q4 opus | claude-haiku-5-5 | 1140 | 281 | $0.00025 | 2 |  |
| 2026-10-23 23:31 | 1261 | judge 1 Q4 opus | claude-haiku-5-5 | 1140 | 292 | $0.00026 | 2.4 |  |
| 2026-10-23 23:31 | 1262 | subject opus neutral/P5' | claude-opus-5-5 | 307 | 406 | $0.00935 | 5.2 |  |
| 2026-10-23 23:31 | 1263 | judge 2 P5' opus | claude-haiku-5-5 | 1214 | 115 | $0.00018 | 1.3 |  |
| 2026-10-23 23:31 | 1264 | judge 1 P5' opus | claude-haiku-5-5 | 1214 | 117 | $0.00018 | 1.8 |  |
| 2026-10-23 23:31 | 1265 | subject fable both/Q4 | claude-fable-5-1 | 240 | 203 | $0.01255 | 3.6 |  |
| 2026-10-23 23:31 | 1266 | judge 2 Q4 fable | claude-haiku-5-5 | 937 | 112 | $0.00015 | 1.2 |  |
| 2026-10-23 23:31 | 1267 | judge 1 Q4 fable | claude-haiku-5-5 | 937 | 111 | $0.00015 | 1.2 |  |
| 2026-10-23 23:31 | 1268 | subject fable dismissal/P5' | claude-fable-5-1 | 341 | 560 | $0.03141 | 8.8 |  |
| 2026-10-23 23:31 | 1269 | judge 1 P5' fable | claude-haiku-5-5 | 1100 | 128 | $0.00017 | 1.5 |  |
| 2026-10-23 23:31 | 1270 | judge 2 P5' fable | claude-haiku-5-5 | 1100 | 489 | $0.00035 | 3.1 |  |
| 2026-10-23 23:31 | 1271 | subject sonnet brief/P4' | claude-sonnet-5-5 | 245 | 105 | $0.00154 | 1.4 |  |
| 2026-10-23 23:31 | 1272 | judge 2 P4' sonnet | claude-haiku-5-5 | 823 | 88 | $0.00013 | 1.2 |  |
| 2026-10-23 23:31 | 1273 | judge 1 P4' sonnet | claude-haiku-5-5 | 823 | 79 | $0.00012 | 1.6 |  |
| 2026-10-23 23:31 | 1274 | referee P5' fable | claude-opus-5-5 | 1100 | 364 | $0.01168 | 4.1 |  |
| 2026-10-23 23:31 | 1275 | subject fable dismissal/C | claude-fable-5-1 | 251 | 44 | $0.00471 | 1.4 |  |
| 2026-10-23 23:31 | 1276 | judge 1 C fable | claude-haiku-5-5 | 407 | 54 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 1277 | judge 2 C fable | claude-haiku-5-5 | 407 | 54 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 1278 | subject sonnet neutral/P4' | claude-sonnet-5-5 | 231 | 370 | $0.00416 | 4.4 |  |
| 2026-10-23 23:31 | 1279 | judge 2 P4' sonnet | claude-haiku-5-5 | 1088 | 98 | $0.00016 | 0.9 |  |
| 2026-10-23 23:31 | 1280 | judge 1 P4' sonnet | claude-haiku-5-5 | 1088 | 112 | $0.00016 | 0.9 |  |
| 2026-10-23 23:31 | 1281 | subject opus brief/Q1 | claude-opus-5-5 | 284 | 140 | $0.00394 | 3.9 |  |
| 2026-10-23 23:31 | 1282 | judge 2 Q1 opus | claude-haiku-5-5 | 886 | 78 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 1283 | judge 1 Q1 opus | claude-haiku-5-5 | 886 | 93 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 1284 | subject opus dismissal/C | claude-opus-5-5 | 251 | 71 | $0.00242 | 1.1 |  |
| 2026-10-23 23:31 | 1285 | judge 1 C opus | claude-haiku-5-5 | 405 | 62 | $0.00007 | 0.9 |  |
| 2026-10-23 23:31 | 1286 | judge 2 C opus | claude-haiku-5-5 | 405 | 62 | $0.00007 | 1.1 |  |
| 2026-10-23 23:31 | 1287 | subject fable dismissal/P4' | claude-fable-5-1 | 265 | 158 | $0.01055 | 2.8 |  |
| 2026-10-23 23:31 | 1288 | judge 2 P4' fable | claude-haiku-5-5 | 840 | 99 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 1289 | judge 1 P4' fable | claude-haiku-5-5 | 840 | 94 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 1290 | subject opus both/Q4 | claude-opus-5-5 | 240 | 160 | $0.00416 | 2.8 |  |
| 2026-10-23 23:31 | 1291 | judge 1 Q4 opus | claude-haiku-5-5 | 945 | 120 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 1292 | judge 2 Q4 opus | claude-haiku-5-5 | 945 | 127 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 1293 | subject fable brief/P1' | claude-fable-5-1 | 340 | 360 | $0.02140 | 6 |  |
| 2026-10-23 23:31 | 1294 | judge 1 P1' fable | claude-haiku-5-5 | 1355 | 438 | $0.00035 | 2.6 |  |
| 2026-10-23 23:31 | 1295 | judge 2 P1' fable | claude-haiku-5-5 | 1355 | 505 | $0.00039 | 3.6 |  |
| 2026-10-23 23:31 | 1296 | subject sonnet brief/C | claude-sonnet-5-5 | 231 | 40 | $0.00086 | 0.7 |  |
| 2026-10-23 23:31 | 1297 | judge 2 C sonnet | claude-haiku-5-5 | 403 | 54 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1298 | judge 1 C sonnet | claude-haiku-5-5 | 403 | 53 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 1299 | subject fable neutral/P5' | claude-fable-5-1 | 307 | 366 | $0.02137 | 5.8 |  |
| 2026-10-23 23:31 | 1300 | judge 2 P5' fable | claude-haiku-5-5 | 1165 | 129 | $0.00018 | 1 |  |
| 2026-10-23 23:31 | 1301 | judge 1 P5' fable | claude-haiku-5-5 | 1165 | 132 | $0.00018 | 1 |  |
| 2026-10-23 23:31 | 1302 | subject opus invited/P4' | claude-opus-5-5 | 263 | 630 | $0.01365 | 8.3 |  |
| 2026-10-23 23:31 | 1303 | judge 2 P4' opus | claude-haiku-5-5 | 1063 | 233 | $0.00022 | 1.7 |  |
| 2026-10-23 23:31 | 1304 | judge 1 P4' opus | claude-haiku-5-5 | 1063 | 207 | $0.00021 | 1.8 |  |
| 2026-10-23 23:31 | 1305 | subject sonnet neutral/Q4 | claude-sonnet-5-5 | 231 | 115 | $0.00161 | 1.5 |  |
| 2026-10-23 23:31 | 1306 | judge 1 Q4 sonnet | claude-haiku-5-5 | 1002 | 115 | $0.00016 | 0.9 |  |
| 2026-10-23 23:31 | 1307 | judge 2 Q4 sonnet | claude-haiku-5-5 | 1002 | 115 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 1308 | referee Q4 sonnet | claude-opus-5-5 | 1002 | 92 | $0.00585 | 1.4 |  |
| 2026-10-23 23:31 | 1309 | subject opus both/P4' | claude-opus-5-5 | 240 | 154 | $0.00404 | 2.4 |  |
| 2026-10-23 23:31 | 1310 | judge 1 P4' opus | claude-haiku-5-5 | 834 | 77 | $0.00012 | 0.9 |  |
| 2026-10-23 23:31 | 1311 | judge 2 P4' opus | claude-haiku-5-5 | 834 | 80 | $0.00012 | 0.9 |  |
| 2026-10-23 23:31 | 1312 | subject fable invited/Q4 | claude-fable-5-1 | 263 | 226 | $0.01393 | 4.1 |  |
| 2026-10-23 23:31 | 1313 | judge 1 Q4 fable | claude-haiku-5-5 | 1002 | 119 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 1314 | judge 2 Q4 fable | claude-haiku-5-5 | 1002 | 126 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 1315 | subject opus neutral/C | claude-opus-5-5 | 217 | 75 | $0.00237 | 1.1 |  |
| 2026-10-23 23:31 | 1316 | judge 2 C opus | claude-haiku-5-5 | 404 | 52 | $0.00007 | 0.6 |  |
| 2026-10-23 23:31 | 1317 | judge 1 C opus | claude-haiku-5-5 | 404 | 64 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1318 | subject fable neutral/Q1 | claude-fable-5-1 | 270 | 182 | $0.01180 | 2.7 |  |
| 2026-10-23 23:31 | 1319 | judge 1 Q1 fable | claude-haiku-5-5 | 884 | 83 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 1320 | judge 2 Q1 fable | claude-haiku-5-5 | 884 | 91 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 1321 | subject sonnet brief/Q4 | claude-sonnet-5-5 | 245 | 55 | $0.00104 | 1.1 |  |
| 2026-10-23 23:31 | 1322 | judge 2 Q4 sonnet | claude-haiku-5-5 | 942 | 106 | $0.00015 | 0.8 |  |
| 2026-10-23 23:31 | 1323 | judge 1 Q4 sonnet | claude-haiku-5-5 | 942 | 112 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 1324 | subject opus brief/P1' | claude-opus-5-5 | 340 | 364 | $0.00864 | 5.2 |  |
| 2026-10-23 23:31 | 1325 | judge 2 P1' opus | claude-haiku-5-5 | 1304 | 425 | $0.00034 | 2.4 |  |
| 2026-10-23 23:31 | 1326 | judge 1 P1' opus | claude-haiku-5-5 | 1304 | 423 | $0.00034 | 2.4 |  |
| 2026-10-23 23:31 | 1327 | subject opus invited/Q1 | claude-opus-5-5 | 302 | 398 | $0.00917 | 5.7 |  |
| 2026-10-23 23:31 | 1328 | judge 2 Q1 opus | claude-haiku-5-5 | 998 | 104 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 1329 | judge 1 Q1 opus | claude-haiku-5-5 | 998 | 106 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 1330 | subject fable invited/P5' | claude-fable-5-1 | 339 | 556 | $0.03119 | 8.7 |  |
| 2026-10-23 23:31 | 1331 | judge 1 P5' fable | claude-haiku-5-5 | 1246 | 126 | $0.00019 | 0.9 |  |
| 2026-10-23 23:31 | 1332 | judge 2 P5' fable | claude-haiku-5-5 | 1246 | 124 | $0.00019 | 0.9 |  |
| 2026-10-23 23:31 | 1333 | subject fable brief/Q1 | claude-fable-5-1 | 284 | 166 | $0.01114 | 2.1 |  |
| 2026-10-23 23:31 | 1334 | judge 1 Q1 fable | claude-haiku-5-5 | 885 | 74 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 1335 | judge 2 Q1 fable | claude-haiku-5-5 | 885 | 82 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 1336 | subject opus invited/P1' | claude-opus-5-5 | 358 | 669 | $0.01481 | 9.1 |  |
| 2026-10-23 23:31 | 1337 | judge 2 P1' opus | claude-haiku-5-5 | 1574 | 358 | $0.00034 | 2.3 |  |
| 2026-10-23 23:31 | 1338 | judge 1 P1' opus | claude-haiku-5-5 | 1574 | 384 | $0.00035 | 2.8 |  |
| 2026-10-23 23:31 | 1339 | subject sonnet invited/Q4 | claude-sonnet-5-5 | 263 | 557 | $0.00610 | 5.5 |  |
| 2026-10-23 23:31 | 1340 | judge 1 Q4 sonnet | claude-haiku-5-5 | 1128 | 288 | $0.00026 | 1.8 |  |
| 2026-10-23 23:31 | 1341 | judge 2 Q4 sonnet | claude-haiku-5-5 | 1128 | 262 | $0.00024 | 1.9 |  |
| 2026-10-23 23:31 | 1342 | subject sonnet both/P1' | claude-sonnet-5-5 | 335 | 300 | $0.00367 | 3.9 |  |
| 2026-10-23 23:31 | 1343 | judge 2 P1' sonnet | claude-haiku-5-5 | 1407 | 560 | $0.00042 | 3 |  |
| 2026-10-23 23:31 | 1344 | judge 1 P1' sonnet | claude-haiku-5-5 | 1407 | 780 | $0.00053 | 4.4 |  |
| 2026-10-23 23:31 | 1345 | subject fable invited/Q1 | claude-fable-5-1 | 302 | 192 | $0.01262 | 2.9 |  |
| 2026-10-23 23:31 | 1346 | judge 1 Q1 fable | claude-haiku-5-5 | 967 | 110 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 1347 | judge 2 Q1 fable | claude-haiku-5-5 | 967 | 115 | $0.00015 | 1.3 |  |
| 2026-10-23 23:31 | 1348 | referee P1' sonnet | claude-opus-5-5 | 1407 | 343 | $0.01249 | 4.3 |  |
| 2026-10-23 23:31 | 1349 | subject fable both/P4' | claude-fable-5-1 | 240 | 193 | $0.01205 | 3 |  |
| 2026-10-23 23:31 | 1350 | judge 2 P4' fable | claude-haiku-5-5 | 808 | 102 | $0.00013 | 1.1 |  |
| 2026-10-23 23:31 | 1351 | judge 1 P4' fable | claude-haiku-5-5 | 808 | 69 | $0.00012 | 1.2 |  |
| 2026-10-23 23:31 | 1352 | subject sonnet both/P5' | claude-sonnet-5-5 | 316 | 173 | $0.00236 | 2.1 |  |
| 2026-10-23 23:31 | 1353 | judge 1 P5' sonnet | claude-haiku-5-5 | 1103 | 117 | $0.00017 | 1.8 |  |
| 2026-10-23 23:31 | 1354 | judge 2 P5' sonnet | claude-haiku-5-5 | 1103 | 486 | $0.00035 | 2.8 |  |
| 2026-10-23 23:31 | 1355 | referee P5' sonnet | claude-opus-5-5 | 1103 | 212 | $0.00865 | 2.9 |  |
| 2026-10-23 23:31 | 1356 | subject fable invited/P4' | claude-fable-5-1 | 263 | 679 | $0.03658 | 12.1 |  |
| 2026-10-23 23:31 | 1357 | judge 1 P4' fable | claude-haiku-5-5 | 1166 | 106 | $0.00017 | 0.9 |  |
| 2026-10-23 23:31 | 1358 | judge 2 P4' fable | claude-haiku-5-5 | 1166 | 143 | $0.00019 | 1 |  |
| 2026-10-23 23:31 | 1359 | subject fable brief/Q4 | claude-fable-5-1 | 245 | 60 | $0.00545 | 1.4 |  |
| 2026-10-23 23:31 | 1360 | judge 1 Q4 fable | claude-haiku-5-5 | 947 | 102 | $0.00015 | 0.8 |  |
| 2026-10-23 23:31 | 1361 | judge 2 Q4 fable | claude-haiku-5-5 | 947 | 102 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 1362 | subject fable both/C | claude-fable-5-1 | 226 | 40 | $0.00426 | 1.1 |  |
| 2026-10-23 23:31 | 1363 | judge 1 C fable | claude-haiku-5-5 | 403 | 56 | $0.00007 | 1 |  |
| 2026-10-23 23:31 | 1364 | judge 2 C fable | claude-haiku-5-5 | 403 | 54 | $0.00007 | 1.3 |  |
| 2026-10-23 23:31 | 1365 | subject fable dismissal/P1' | claude-fable-5-1 | 360 | 393 | $0.02325 | 5.4 |  |
| 2026-10-23 23:31 | 1366 | judge 1 P1' fable | claude-haiku-5-5 | 1360 | 634 | $0.00045 | 3.4 |  |
| 2026-10-23 23:31 | 1367 | judge 2 P1' fable | claude-haiku-5-5 | 1360 | 654 | $0.00046 | 3.9 |  |
| 2026-10-23 23:31 | 1368 | subject fable neutral/Q4 | claude-fable-5-1 | 231 | 52 | $0.00491 | 1.4 |  |
| 2026-10-23 23:31 | 1369 | judge 1 Q4 fable | claude-haiku-5-5 | 939 | 108 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 1370 | judge 2 Q4 fable | claude-haiku-5-5 | 939 | 96 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 1371 | referee P1' fable | claude-opus-5-5 | 1360 | 349 | $0.01242 | 4.3 |  |
| 2026-10-23 23:31 | 1372 | subject opus dismissal/Q1 | claude-opus-5-5 | 304 | 77 | $0.00276 | 1.3 |  |
| 2026-10-23 23:31 | 1373 | judge 1 Q1 opus | claude-haiku-5-5 | 875 | 79 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 1374 | judge 2 Q1 opus | claude-haiku-5-5 | 875 | 78 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 1375 | subject sonnet neutral/P1' | claude-sonnet-5-5 | 326 | 732 | $0.00797 | 6.6 |  |
| 2026-10-23 23:31 | 1376 | judge 2 P1' sonnet | claude-haiku-5-5 | 1549 | 706 | $0.00051 | 4.2 |  |
| 2026-10-23 23:31 | 1377 | judge 1 P1' sonnet | claude-haiku-5-5 | 1549 | 725 | $0.00052 | 4.2 |  |
| 2026-10-23 23:31 | 1378 | referee P1' sonnet | claude-opus-5-5 | 1549 | 286 | $0.01192 | 4.9 |  |
| 2026-10-23 23:31 | 1379 | subject fable neutral/P4' | claude-fable-5-1 | 231 | 372 | $0.02091 | 6.1 |  |
| 2026-10-23 23:31 | 1380 | judge 2 P4' fable | claude-haiku-5-5 | 1048 | 112 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 1381 | judge 1 P4' fable | claude-haiku-5-5 | 1048 | 370 | $0.00029 | 3 |  |
| 2026-10-23 23:31 | 1382 | subject fable brief/P5' | claude-fable-5-1 | 321 | 365 | $0.02146 | 5 |  |
| 2026-10-23 23:31 | 1383 | judge 2 P5' fable | claude-haiku-5-5 | 1170 | 113 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 1384 | judge 1 P5' fable | claude-haiku-5-5 | 1170 | 116 | $0.00017 | 1.1 |  |
| 2026-10-23 23:31 | 1385 | subject opus dismissal/P5' | claude-opus-5-5 | 341 | 319 | $0.00774 | 4.1 |  |
| 2026-10-23 23:31 | 1386 | judge 2 P5' opus | claude-haiku-5-5 | 1120 | 494 | $0.00036 | 3 |  |
| 2026-10-23 23:31 | 1387 | judge 1 P5' opus | claude-haiku-5-5 | 1120 | 546 | $0.00038 | 3.5 |  |
| 2026-10-23 23:31 | 1388 | subject sonnet both/Q1 | claude-sonnet-5-5 | 279 | 31 | $0.00087 | 0.8 |  |
| 2026-10-23 23:31 | 1389 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 72 | $0.00013 | 0.7 |  |
| 2026-10-23 23:31 | 1390 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 87 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 1391 | subject sonnet both/C | claude-sonnet-5-5 | 226 | 39 | $0.00084 | 0.9 |  |
| 2026-10-23 23:31 | 1392 | judge 2 C sonnet | claude-haiku-5-5 | 402 | 54 | $0.00007 | 0.6 |  |
| 2026-10-23 23:31 | 1393 | judge 1 C sonnet | claude-haiku-5-5 | 402 | 54 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 1394 | subject opus neutral/P1' | claude-opus-5-5 | 326 | 591 | $0.01312 | 8 |  |
| 2026-10-23 23:31 | 1395 | judge 1 P1' opus | claude-haiku-5-5 | 1512 | 578 | $0.00044 | 3.7 |  |
| 2026-10-23 23:31 | 1396 | judge 2 P1' opus | claude-haiku-5-5 | 1512 | 653 | $0.00048 | 4.1 |  |
| 2026-10-23 23:31 | 1397 | subject opus dismissal/Q4 | claude-opus-5-5 | 265 | 184 | $0.00474 | 2.9 |  |
| 2026-10-23 23:31 | 1398 | judge 2 Q4 opus | claude-haiku-5-5 | 924 | 94 | $0.00014 | 1.8 |  |
| 2026-10-23 23:31 | 1399 | judge 1 Q4 opus | claude-haiku-5-5 | 924 | 128 | $0.00016 | 2.2 |  |
| 2026-10-23 23:31 | 1400 | subject opus neutral/Q1 | claude-opus-5-5 | 270 | 186 | $0.00480 | 2.6 |  |
| 2026-10-23 23:31 | 1401 | referee Q4 opus | claude-opus-5-5 | 924 | 309 | $0.00988 | 3.6 |  |
| 2026-10-23 23:31 | 1402 | judge 2 Q1 opus | claude-haiku-5-5 | 936 | 101 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 1403 | judge 1 Q1 opus | claude-haiku-5-5 | 936 | 107 | $0.00015 | 0.8 |  |
| 2026-10-23 23:31 | 1404 | subject sonnet invited/Q4 | claude-sonnet-5-5 | 263 | 552 | $0.00605 | 5.5 |  |
| 2026-10-23 23:31 | 1405 | judge 1 Q4 sonnet | claude-haiku-5-5 | 1158 | 302 | $0.00027 | 2 |  |
| 2026-10-23 23:31 | 1406 | judge 2 Q4 sonnet | claude-haiku-5-5 | 1158 | 269 | $0.00025 | 2.1 |  |
| 2026-10-23 23:31 | 1407 | subject fable dismissal/P1' | claude-fable-5-1 | 360 | 481 | $0.02765 | 7.3 |  |
| 2026-10-23 23:31 | 1408 | judge 1 P1' fable | claude-haiku-5-5 | 1426 | 464 | $0.00037 | 2.5 |  |
| 2026-10-23 23:31 | 1409 | judge 2 P1' fable | claude-haiku-5-5 | 1426 | 526 | $0.00041 | 3 |  |
| 2026-10-23 23:31 | 1410 | subject fable dismissal/Q4 | claude-fable-5-1 | 265 | 221 | $0.01370 | 3.8 |  |
| 2026-10-23 23:31 | 1411 | judge 1 Q4 fable | claude-haiku-5-5 | 898 | 78 | $0.00013 | 1 |  |
| 2026-10-23 23:31 | 1412 | judge 2 Q4 fable | claude-haiku-5-5 | 898 | 78 | $0.00013 | 1.1 |  |
| 2026-10-23 23:31 | 1413 | subject fable invited/P5' | claude-fable-5-1 | 339 | 506 | $0.02869 | 7.1 |  |
| 2026-10-23 23:31 | 1414 | judge 2 P5' fable | claude-haiku-5-5 | 1263 | 110 | $0.00018 | 0.8 |  |
| 2026-10-23 23:31 | 1415 | judge 1 P5' fable | claude-haiku-5-5 | 1263 | 113 | $0.00018 | 1 |  |
| 2026-10-23 23:31 | 1416 | subject sonnet invited/P4' | claude-sonnet-5-5 | 263 | 641 | $0.00694 | 6.4 |  |
| 2026-10-23 23:31 | 1417 | judge 2 P4' sonnet | claude-haiku-5-5 | 1058 | 179 | $0.00020 | 1.5 |  |
| 2026-10-23 23:31 | 1418 | judge 1 P4' sonnet | claude-haiku-5-5 | 1058 | 181 | $0.00020 | 1.5 |  |
| 2026-10-23 23:31 | 1419 | subject sonnet neutral/Q4 | claude-sonnet-5-5 | 231 | 115 | $0.00161 | 1.6 |  |
| 2026-10-23 23:31 | 1420 | judge 1 Q4 sonnet | claude-haiku-5-5 | 1002 | 126 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 1421 | judge 2 Q4 sonnet | claude-haiku-5-5 | 1002 | 136 | $0.00017 | 1.1 |  |
| 2026-10-23 23:31 | 1422 | subject opus dismissal/P1' | claude-opus-5-5 | 360 | 366 | $0.00876 | 4.1 |  |
| 2026-10-23 23:31 | 1423 | judge 1 P1' opus | claude-haiku-5-5 | 1269 | 361 | $0.00031 | 1.9 |  |
| 2026-10-23 23:31 | 1424 | judge 2 P1' opus | claude-haiku-5-5 | 1269 | 473 | $0.00036 | 2.8 |  |
| 2026-10-23 23:31 | 1425 | subject fable invited/Q4 | claude-fable-5-1 | 263 | 408 | $0.02303 | 7.3 |  |
| 2026-10-23 23:31 | 1426 | judge 2 Q4 fable | claude-haiku-5-5 | 1138 | 94 | $0.00016 | 0.8 |  |
| 2026-10-23 23:31 | 1427 | judge 1 Q4 fable | claude-haiku-5-5 | 1138 | 97 | $0.00016 | 0.8 |  |
| 2026-10-23 23:31 | 1428 | subject sonnet dismissal/P5' | claude-sonnet-5-5 | 341 | 172 | $0.00240 | 1.9 |  |
| 2026-10-23 23:31 | 1429 | judge 1 P5' sonnet | claude-haiku-5-5 | 1046 | 96 | $0.00015 | 0.8 |  |
| 2026-10-23 23:31 | 1430 | judge 2 P5' sonnet | claude-haiku-5-5 | 1046 | 100 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 1431 | subject sonnet brief/P4' | claude-sonnet-5-5 | 245 | 84 | $0.00133 | 1.3 |  |
| 2026-10-23 23:31 | 1432 | judge 2 P4' sonnet | claude-haiku-5-5 | 802 | 71 | $0.00012 | 1 |  |
| 2026-10-23 23:31 | 1433 | judge 1 P4' sonnet | claude-haiku-5-5 | 802 | 89 | $0.00012 | 1.1 |  |
| 2026-10-23 23:31 | 1434 | subject opus invited/Q1 | claude-opus-5-5 | 302 | 387 | $0.00895 | 5.4 |  |
| 2026-10-23 23:31 | 1435 | judge 2 Q1 opus | claude-haiku-5-5 | 1089 | 119 | $0.00017 | 0.9 |  |
| 2026-10-23 23:31 | 1436 | judge 1 Q1 opus | claude-haiku-5-5 | 1089 | 125 | $0.00017 | 1.2 |  |
| 2026-10-23 23:31 | 1437 | subject sonnet brief/P1' | claude-sonnet-5-5 | 340 | 671 | $0.00739 | 6 |  |
| 2026-10-23 23:31 | 1438 | judge 2 P1' sonnet | claude-haiku-5-5 | 1451 | 430 | $0.00036 | 3 |  |
| 2026-10-23 23:31 | 1439 | judge 1 P1' sonnet | claude-haiku-5-5 | 1451 | 551 | $0.00042 | 3.3 |  |
| 2026-10-23 23:31 | 1440 | subject fable neutral/P5' | claude-fable-5-1 | 307 | 338 | $0.01997 | 5.7 |  |
| 2026-10-23 23:31 | 1441 | judge 2 P5' fable | claude-haiku-5-5 | 1167 | 111 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 1442 | judge 1 P5' fable | claude-haiku-5-5 | 1167 | 125 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 1443 | referee P1' sonnet | claude-opus-5-5 | 1451 | 537 | $0.01654 | 6.7 |  |
| 2026-10-23 23:31 | 1444 | subject opus brief/P1' | claude-opus-5-5 | 340 | 397 | $0.00930 | 5.5 |  |
| 2026-10-23 23:31 | 1445 | judge 1 P1' opus | claude-haiku-5-5 | 1341 | 470 | $0.00037 | 2.7 |  |
| 2026-10-23 23:31 | 1446 | judge 2 P1' opus | claude-haiku-5-5 | 1341 | 500 | $0.00038 | 3 |  |
| 2026-10-23 23:31 | 1447 | subject fable both/P5' | claude-fable-5-1 | 316 | 409 | $0.02361 | 6.3 |  |
| 2026-10-23 23:31 | 1448 | judge 2 P5' fable | claude-haiku-5-5 | 1149 | 128 | $0.00018 | 0.9 |  |
| 2026-10-23 23:31 | 1449 | judge 1 P5' fable | claude-haiku-5-5 | 1149 | 131 | $0.00018 | 1 |  |
| 2026-10-23 23:31 | 1450 | subject fable both/Q4 | claude-fable-5-1 | 240 | 293 | $0.01705 | 4.6 |  |
| 2026-10-23 23:31 | 1451 | judge 2 Q4 fable | claude-haiku-5-5 | 927 | 125 | $0.00016 | 1.2 |  |
| 2026-10-23 23:31 | 1452 | judge 1 Q4 fable | claude-haiku-5-5 | 927 | 127 | $0.00016 | 4.3 |  |
| 2026-10-23 23:31 | 1453 | subject opus dismissal/P5' | claude-opus-5-5 | 341 | 381 | $0.00898 | 4.9 |  |
| 2026-10-23 23:31 | 1454 | judge 1 P5' opus | claude-haiku-5-5 | 1067 | 105 | $0.00016 | 0.8 |  |
| 2026-10-23 23:31 | 1455 | judge 2 P5' opus | claude-haiku-5-5 | 1067 | 101 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 1456 | subject fable invited/C | claude-fable-5-1 | 249 | 326 | $0.01879 | 4.5 |  |
| 2026-10-23 23:31 | 1457 | judge 2 C fable | claude-haiku-5-5 | 491 | 62 | $0.00008 | 0.7 |  |
| 2026-10-23 23:31 | 1458 | judge 1 C fable | claude-haiku-5-5 | 491 | 70 | $0.00008 | 1 |  |
| 2026-10-23 23:31 | 1459 | subject sonnet both/P4' | claude-sonnet-5-5 | 240 | 107 | $0.00155 | 1.4 |  |
| 2026-10-23 23:31 | 1460 | judge 1 P4' sonnet | claude-haiku-5-5 | 825 | 72 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 1461 | judge 2 P4' sonnet | claude-haiku-5-5 | 825 | 68 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 1462 | subject opus dismissal/Q1 | claude-opus-5-5 | 304 | 72 | $0.00266 | 1.2 |  |
| 2026-10-23 23:31 | 1463 | judge 1 Q1 opus | claude-haiku-5-5 | 875 | 78 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 1464 | judge 2 Q1 opus | claude-haiku-5-5 | 875 | 78 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 1465 | subject sonnet invited/Q1 | claude-sonnet-5-5 | 302 | 426 | $0.00486 | 4.1 |  |
| 2026-10-23 23:31 | 1466 | judge 1 Q1 sonnet | claude-haiku-5-5 | 1058 | 127 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 1467 | judge 2 Q1 sonnet | claude-haiku-5-5 | 1058 | 125 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 1468 | subject sonnet both/P5' | claude-sonnet-5-5 | 316 | 166 | $0.00229 | 1.8 |  |
| 2026-10-23 23:31 | 1469 | judge 1 P5' sonnet | claude-haiku-5-5 | 1096 | 109 | $0.00016 | 0.9 |  |
| 2026-10-23 23:31 | 1470 | judge 2 P5' sonnet | claude-haiku-5-5 | 1096 | 126 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 1471 | subject fable neutral/Q4 | claude-fable-5-1 | 231 | 77 | $0.00616 | 1.7 |  |
| 2026-10-23 23:31 | 1472 | judge 1 Q4 fable | claude-haiku-5-5 | 964 | 114 | $0.00015 | 4.1 |  |
| 2026-10-23 23:31 | 1473 | judge 2 Q4 fable | claude-haiku-5-5 | 964 | 119 | $0.00016 | 4.3 |  |
| 2026-10-23 23:31 | 1474 | subject opus both/Q1 | claude-opus-5-5 | 279 | 158 | $0.00428 | 2.1 |  |
| 2026-10-23 23:31 | 1475 | judge 2 Q1 opus | claude-haiku-5-5 | 886 | 71 | $0.00012 | 0.7 |  |
| 2026-10-23 23:31 | 1476 | judge 1 Q1 opus | claude-haiku-5-5 | 886 | 84 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 1477 | subject sonnet both/P1' | claude-sonnet-5-5 | 335 | 290 | $0.00357 | 2.8 |  |
| 2026-10-23 23:31 | 1478 | judge 1 P1' sonnet | claude-haiku-5-5 | 1397 | 600 | $0.00044 | 3.3 |  |
| 2026-10-23 23:31 | 1479 | judge 2 P1' sonnet | claude-haiku-5-5 | 1397 | 655 | $0.00047 | 3.4 |  |
| 2026-10-23 23:31 | 1480 | subject sonnet brief/Q4 | claude-sonnet-5-5 | 245 | 58 | $0.00107 | 1.3 |  |
| 2026-10-23 23:31 | 1481 | judge 1 Q4 sonnet | claude-haiku-5-5 | 945 | 117 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 1482 | judge 2 Q4 sonnet | claude-haiku-5-5 | 945 | 134 | $0.00016 | 0.9 |  |
| 2026-10-23 23:31 | 1483 | referee P1' sonnet | claude-opus-5-5 | 1397 | 463 | $0.01485 | 5.1 |  |
| 2026-10-23 23:31 | 1484 | subject fable neutral/P1' | claude-fable-5-1 | 326 | 660 | $0.03626 | 10.5 |  |
| 2026-10-23 23:31 | 1485 | judge 1 P1' fable | claude-haiku-5-5 | 1528 | 583 | $0.00044 | 3.8 |  |
| 2026-10-23 23:31 | 1486 | judge 2 P1' fable | claude-haiku-5-5 | 1528 | 661 | $0.00048 | 4 |  |
| 2026-10-23 23:31 | 1487 | subject fable brief/P4' | claude-fable-5-1 | 245 | 204 | $0.01265 | 3.4 |  |
| 2026-10-23 23:31 | 1488 | judge 1 P4' fable | claude-haiku-5-5 | 866 | 266 | $0.00022 | 2 |  |
| 2026-10-23 23:31 | 1489 | judge 2 P4' fable | claude-haiku-5-5 | 866 | 262 | $0.00022 | 2.1 |  |
| 2026-10-23 23:31 | 1490 | referee P1' fable | claude-opus-5-5 | 1528 | 452 | $0.01515 | 5.2 |  |
| 2026-10-23 23:31 | 1491 | subject fable invited/P4' | claude-fable-5-1 | 263 | 433 | $0.02428 | 8.4 |  |
| 2026-10-23 23:31 | 1492 | judge 1 P4' fable | claude-haiku-5-5 | 1027 | 178 | $0.00019 | 4 |  |
| 2026-10-23 23:31 | 1493 | subject sonnet both/C | claude-sonnet-5-5 | 226 | 55 | $0.00100 | 1.1 |  |
| 2026-10-23 23:31 | 1494 | judge 2 C sonnet | claude-haiku-5-5 | 418 | 58 | $0.00007 | 0.6 |  |
| 2026-10-23 23:31 | 1495 | judge 1 C sonnet | claude-haiku-5-5 | 418 | 58 | $0.00007 | 0.6 |  |
| 2026-10-23 23:31 | 1496 | judge 2 P4' fable | claude-haiku-5-5 | 1027 | 182 | $0.00019 | 4.9 |  |
| 2026-10-23 23:31 | 1497 | subject opus brief/C | claude-opus-5-5 | 231 | 79 | $0.00250 | 3 |  |
| 2026-10-23 23:31 | 1498 | judge 2 C opus | claude-haiku-5-5 | 408 | 57 | $0.00007 | 0.6 |  |
| 2026-10-23 23:31 | 1499 | judge 1 C opus | claude-haiku-5-5 | 408 | 57 | $0.00007 | 0.6 |  |
| 2026-10-23 23:31 | 1500 | subject sonnet brief/C | claude-sonnet-5-5 | 231 | 45 | $0.00091 | 0.9 |  |
| 2026-10-23 23:31 | 1501 | judge 1 C sonnet | claude-haiku-5-5 | 408 | 59 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1502 | judge 2 C sonnet | claude-haiku-5-5 | 408 | 54 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1503 | subject opus neutral/P1' | claude-opus-5-5 | 326 | 642 | $0.01414 | 8 |  |
| 2026-10-23 23:31 | 1504 | judge 2 P1' opus | claude-haiku-5-5 | 1559 | 453 | $0.00038 | 3.2 |  |
| 2026-10-23 23:31 | 1505 | judge 1 P1' opus | claude-haiku-5-5 | 1559 | 462 | $0.00039 | 3.2 |  |
| 2026-10-23 23:31 | 1506 | subject fable neutral/P4' | claude-fable-5-1 | 231 | 273 | $0.01596 | 4.7 |  |
| 2026-10-23 23:31 | 1507 | judge 1 P4' fable | claude-haiku-5-5 | 935 | 98 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 1508 | judge 2 P4' fable | claude-haiku-5-5 | 935 | 109 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 1509 | subject fable brief/Q4 | claude-fable-5-1 | 245 | 136 | $0.00925 | 2.2 |  |
| 2026-10-23 23:31 | 1510 | judge 2 Q4 fable | claude-haiku-5-5 | 945 | 126 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 1511 | judge 1 Q4 fable | claude-haiku-5-5 | 945 | 131 | $0.00016 | 1.3 |  |
| 2026-10-23 23:31 | 1512 | subject sonnet dismissal/Q1 | claude-sonnet-5-5 | 304 | 31 | $0.00092 | 0.9 |  |
| 2026-10-23 23:31 | 1513 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 90 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 1514 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 89 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 1515 | subject opus invited/Q4 | claude-opus-5-5 | 263 | 394 | $0.00893 | 5.8 |  |
| 2026-10-23 23:31 | 1516 | judge 1 Q4 opus | claude-haiku-5-5 | 1133 | 121 | $0.00017 | 1.1 |  |
| 2026-10-23 23:31 | 1517 | judge 2 Q4 opus | claude-haiku-5-5 | 1133 | 271 | $0.00025 | 2.4 |  |
| 2026-10-23 23:31 | 1518 | subject sonnet neutral/Q1 | claude-sonnet-5-5 | 270 | 105 | $0.00159 | 1.4 |  |
| 2026-10-23 23:31 | 1519 | judge 2 Q1 sonnet | claude-haiku-5-5 | 974 | 107 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 1520 | judge 1 Q1 sonnet | claude-haiku-5-5 | 974 | 113 | $0.00015 | 1.2 |  |
| 2026-10-23 23:31 | 1521 | subject fable dismissal/P5' | claude-fable-5-1 | 341 | 353 | $0.02106 | 4.6 |  |
| 2026-10-23 23:31 | 1522 | judge 1 P5' fable | claude-haiku-5-5 | 1058 | 93 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 1523 | judge 2 P5' fable | claude-haiku-5-5 | 1058 | 89 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 1524 | subject sonnet dismissal/C | claude-sonnet-5-5 | 251 | 40 | $0.00090 | 1.1 |  |
| 2026-10-23 23:31 | 1525 | judge 2 C sonnet | claude-haiku-5-5 | 403 | 59 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1526 | judge 1 C sonnet | claude-haiku-5-5 | 403 | 51 | $0.00007 | 1.2 |  |
| 2026-10-23 23:31 | 1527 | subject sonnet brief/P5' | claude-sonnet-5-5 | 321 | 313 | $0.00377 | 3.1 |  |
| 2026-10-23 23:31 | 1528 | judge 2 P5' sonnet | claude-haiku-5-5 | 1110 | 449 | $0.00034 | 2.5 |  |
| 2026-10-23 23:31 | 1529 | judge 1 P5' sonnet | claude-haiku-5-5 | 1110 | 552 | $0.00039 | 2.9 |  |
| 2026-10-23 23:31 | 1530 | subject fable dismissal/P4' | claude-fable-5-1 | 265 | 131 | $0.00920 | 2.2 |  |
| 2026-10-23 23:31 | 1531 | judge 1 P4' fable | claude-haiku-5-5 | 826 | 76 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 1532 | judge 2 P4' fable | claude-haiku-5-5 | 826 | 69 | $0.00012 | 0.9 |  |
| 2026-10-23 23:31 | 1533 | subject opus both/P5' | claude-opus-5-5 | 316 | 328 | $0.00782 | 4.2 |  |
| 2026-10-23 23:31 | 1534 | judge 1 P5' opus | claude-haiku-5-5 | 1119 | 152 | $0.00019 | 1.2 |  |
| 2026-10-23 23:31 | 1535 | judge 2 P5' opus | claude-haiku-5-5 | 1119 | 501 | $0.00036 | 3.2 |  |
| 2026-10-23 23:31 | 1536 | referee P5' opus | claude-opus-5-5 | 1119 | 271 | $0.00990 | 4 |  |
| 2026-10-23 23:31 | 1537 | subject sonnet neutral/P5' | claude-sonnet-5-5 | 307 | 385 | $0.00446 | 4.4 |  |
| 2026-10-23 23:31 | 1538 | judge 2 P5' sonnet | claude-haiku-5-5 | 1179 | 116 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 1539 | judge 1 P5' sonnet | claude-haiku-5-5 | 1179 | 504 | $0.00037 | 2.8 |  |
| 2026-10-23 23:31 | 1540 | referee P5' sonnet | claude-opus-5-5 | 1179 | 99 | $0.00670 | 2 |  |
| 2026-10-23 23:31 | 1541 | subject opus brief/Q1 | claude-opus-5-5 | 284 | 163 | $0.00440 | 5 |  |
| 2026-10-23 23:31 | 1542 | judge 1 Q1 opus | claude-haiku-5-5 | 930 | 111 | $0.00015 | 0.8 |  |
| 2026-10-23 23:31 | 1543 | judge 2 Q1 opus | claude-haiku-5-5 | 930 | 125 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 1544 | subject opus brief/P5' | claude-opus-5-5 | 321 | 349 | $0.00826 | 6.1 |  |
| 2026-10-23 23:31 | 1545 | judge 2 P5' opus | claude-haiku-5-5 | 1169 | 129 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 1546 | judge 1 P5' opus | claude-haiku-5-5 | 1169 | 123 | $0.00018 | 2.2 |  |
| 2026-10-23 23:31 | 1547 | subject opus both/P4' | claude-opus-5-5 | 240 | 126 | $0.00348 | 2.2 |  |
| 2026-10-23 23:31 | 1548 | judge 1 P4' opus | claude-haiku-5-5 | 817 | 100 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 1549 | judge 2 P4' opus | claude-haiku-5-5 | 817 | 86 | $0.00012 | 1 |  |
| 2026-10-23 23:31 | 1550 | subject fable neutral/C | claude-fable-5-1 | 217 | 44 | $0.00437 | 1.2 |  |
| 2026-10-23 23:31 | 1551 | judge 2 C fable | claude-haiku-5-5 | 407 | 54 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1552 | judge 1 C fable | claude-haiku-5-5 | 407 | 54 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1553 | subject fable brief/P1' | claude-fable-5-1 | 340 | 463 | $0.02655 | 7.6 |  |
| 2026-10-23 23:31 | 1554 | judge 1 P1' fable | claude-haiku-5-5 | 1381 | 404 | $0.00034 | 2.3 |  |
| 2026-10-23 23:31 | 1555 | judge 2 P1' fable | claude-haiku-5-5 | 1381 | 439 | $0.00036 | 2.4 |  |
| 2026-10-23 23:31 | 1556 | subject opus dismissal/C | claude-opus-5-5 | 251 | 73 | $0.00246 | 1.2 |  |
| 2026-10-23 23:31 | 1557 | judge 2 C opus | claude-haiku-5-5 | 407 | 50 | $0.00007 | 0.5 |  |
| 2026-10-23 23:31 | 1558 | judge 1 C opus | claude-haiku-5-5 | 407 | 49 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 1559 | subject sonnet neutral/C | claude-sonnet-5-5 | 217 | 54 | $0.00097 | 1 |  |
| 2026-10-23 23:31 | 1560 | judge 2 C sonnet | claude-haiku-5-5 | 417 | 59 | $0.00007 | 0.9 |  |
| 2026-10-23 23:31 | 1561 | judge 1 C sonnet | claude-haiku-5-5 | 417 | 62 | $0.00007 | 1.8 |  |
| 2026-10-23 23:31 | 1562 | subject sonnet dismissal/P1' | claude-sonnet-5-5 | 360 | 555 | $0.00627 | 5.6 |  |
| 2026-10-23 23:31 | 1563 | judge 2 P1' sonnet | claude-haiku-5-5 | 1365 | 695 | $0.00048 | 3.8 |  |
| 2026-10-23 23:31 | 1564 | judge 1 P1' sonnet | claude-haiku-5-5 | 1365 | 657 | $0.00047 | 4 |  |
| 2026-10-23 23:31 | 1565 | subject opus both/Q4 | claude-opus-5-5 | 240 | 162 | $0.00420 | 2.8 |  |
| 2026-10-23 23:31 | 1566 | judge 1 Q4 opus | claude-haiku-5-5 | 943 | 105 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 1567 | judge 2 Q4 opus | claude-haiku-5-5 | 943 | 116 | $0.00015 | 1.2 |  |
| 2026-10-23 23:31 | 1568 | referee P1' sonnet | claude-opus-5-5 | 1365 | 364 | $0.01274 | 4.3 |  |
| 2026-10-23 23:31 | 1569 | subject opus neutral/P5' | claude-opus-5-5 | 307 | 352 | $0.00827 | 7.4 |  |
| 2026-10-23 23:31 | 1570 | judge 1 P5' opus | claude-haiku-5-5 | 1164 | 122 | $0.00018 | 1 |  |
| 2026-10-23 23:31 | 1571 | judge 2 P5' opus | claude-haiku-5-5 | 1164 | 155 | $0.00019 | 1 |  |
| 2026-10-23 23:31 | 1572 | subject fable both/C | claude-fable-5-1 | 226 | 43 | $0.00441 | 1.3 |  |
| 2026-10-23 23:31 | 1573 | judge 2 C fable | claude-haiku-5-5 | 406 | 54 | $0.00007 | 0.6 |  |
| 2026-10-23 23:31 | 1574 | judge 1 C fable | claude-haiku-5-5 | 406 | 78 | $0.00008 | 0.7 |  |
| 2026-10-23 23:31 | 1575 | subject sonnet dismissal/Q4 | claude-sonnet-5-5 | 265 | 16 | $0.00069 | 0.9 |  |
| 2026-10-23 23:31 | 1576 | judge 2 Q4 sonnet | claude-haiku-5-5 | 903 | 76 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 1577 | judge 1 Q4 sonnet | claude-haiku-5-5 | 903 | 75 | $0.00013 | 1 |  |
| 2026-10-23 23:31 | 1578 | subject sonnet both/Q1 | claude-sonnet-5-5 | 279 | 41 | $0.00097 | 1.6 |  |
| 2026-10-23 23:31 | 1579 | judge 1 Q1 sonnet | claude-haiku-5-5 | 910 | 83 | $0.00013 | 0.7 |  |
| 2026-10-23 23:31 | 1580 | judge 2 Q1 sonnet | claude-haiku-5-5 | 910 | 91 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 1581 | subject opus both/P1' | claude-opus-5-5 | 335 | 397 | $0.00928 | 4.7 |  |
| 2026-10-23 23:31 | 1582 | judge 1 P1' opus | claude-haiku-5-5 | 1273 | 365 | $0.00031 | 2.2 |  |
| 2026-10-23 23:31 | 1583 | judge 2 P1' opus | claude-haiku-5-5 | 1273 | 468 | $0.00036 | 2.5 |  |
| 2026-10-23 23:31 | 1584 | subject fable invited/Q1 | claude-fable-5-1 | 302 | 178 | $0.01192 | 2.6 |  |
| 2026-10-23 23:31 | 1585 | judge 2 Q1 fable | claude-haiku-5-5 | 957 | 92 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 1586 | judge 1 Q1 fable | claude-haiku-5-5 | 957 | 120 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 1587 | subject opus invited/P5' | claude-opus-5-5 | 339 | 560 | $0.01256 | 8.5 |  |
| 2026-10-23 23:31 | 1588 | judge 1 P5' opus | claude-haiku-5-5 | 1312 | 102 | $0.00018 | 0.9 |  |
| 2026-10-23 23:31 | 1589 | judge 2 P5' opus | claude-haiku-5-5 | 1312 | 132 | $0.00020 | 1.5 |  |
| 2026-10-23 23:31 | 1590 | subject sonnet invited/P1' | claude-sonnet-5-5 | 358 | 930 | $0.01002 | 8.7 |  |
| 2026-10-23 23:31 | 1591 | judge 1 P1' sonnet | claude-haiku-5-5 | 1562 | 414 | $0.00036 | 2.5 |  |
| 2026-10-23 23:31 | 1592 | judge 2 P1' sonnet | claude-haiku-5-5 | 1562 | 561 | $0.00044 | 3.1 |  |
| 2026-10-23 23:31 | 1593 | subject fable invited/P1' | claude-fable-5-1 | 358 | 807 | $0.04393 | 12.8 |  |
| 2026-10-23 23:31 | 1594 | judge 1 P1' fable | claude-haiku-5-5 | 1634 | 472 | $0.00040 | 2.9 |  |
| 2026-10-23 23:31 | 1595 | judge 2 P1' fable | claude-haiku-5-5 | 1634 | 566 | $0.00045 | 3.2 |  |
| 2026-10-23 23:31 | 1596 | referee P1' fable | claude-opus-5-5 | 1634 | 361 | $0.01376 | 3.9 |  |
| 2026-10-23 23:31 | 1597 | subject opus invited/P1' | claude-opus-5-5 | 358 | 893 | $0.01929 | 11.9 |  |
| 2026-10-23 23:31 | 1598 | judge 1 P1' opus | claude-haiku-5-5 | 1624 | 468 | $0.00040 | 2.9 |  |
| 2026-10-23 23:31 | 1599 | judge 2 P1' opus | claude-haiku-5-5 | 1624 | 591 | $0.00046 | 3.3 |  |
| 2026-10-23 23:31 | 1600 | subject sonnet neutral/P4' | claude-sonnet-5-5 | 231 | 310 | $0.00356 | 3.3 |  |
| 2026-10-23 23:31 | 1601 | judge 1 P4' sonnet | claude-haiku-5-5 | 1028 | 109 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 1602 | judge 2 P4' sonnet | claude-haiku-5-5 | 1028 | 130 | $0.00017 | 1.2 |  |
| 2026-10-23 23:31 | 1603 | referee P1' opus | claude-opus-5-5 | 1624 | 425 | $0.01500 | 5.1 |  |
| 2026-10-23 23:31 | 1604 | subject fable both/Q1 | claude-fable-5-1 | 279 | 186 | $0.01209 | 3.3 |  |
| 2026-10-23 23:31 | 1605 | judge 1 Q1 fable | claude-haiku-5-5 | 876 | 82 | $0.00013 | 1 |  |
| 2026-10-23 23:31 | 1606 | judge 2 Q1 fable | claude-haiku-5-5 | 876 | 85 | $0.00013 | 1 |  |
| 2026-10-23 23:31 | 1607 | subject opus neutral/P4' | claude-opus-5-5 | 231 | 160 | $0.00412 | 2.2 |  |
| 2026-10-23 23:31 | 1608 | judge 2 P4' opus | claude-haiku-5-5 | 862 | 80 | $0.00013 | 1 |  |
| 2026-10-23 23:31 | 1609 | judge 1 P4' opus | claude-haiku-5-5 | 862 | 87 | $0.00013 | 1.1 |  |
| 2026-10-23 23:31 | 1610 | subject fable brief/P5' | claude-fable-5-1 | 321 | 398 | $0.02311 | 6.1 |  |
| 2026-10-23 23:31 | 1611 | judge 2 P5' fable | claude-haiku-5-5 | 1216 | 134 | $0.00019 | 1.2 |  |
| 2026-10-23 23:31 | 1612 | judge 1 P5' fable | claude-haiku-5-5 | 1216 | 115 | $0.00018 | 1.2 |  |
| 2026-10-23 23:31 | 1613 | subject fable both/P1' | claude-fable-5-1 | 335 | 510 | $0.02885 | 7.3 |  |
| 2026-10-23 23:31 | 1614 | judge 1 P1' fable | claude-haiku-5-5 | 1353 | 440 | $0.00036 | 2.6 |  |
| 2026-10-23 23:31 | 1615 | judge 2 P1' fable | claude-haiku-5-5 | 1353 | 595 | $0.00043 | 3.3 |  |
| 2026-10-23 23:31 | 1616 | subject opus brief/P4' | claude-opus-5-5 | 245 | 163 | $0.00424 | 3.4 |  |
| 2026-10-23 23:31 | 1617 | judge 1 P4' opus | claude-haiku-5-5 | 867 | 105 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 1618 | judge 2 P4' opus | claude-haiku-5-5 | 867 | 98 | $0.00014 | 1.1 |  |
| 2026-10-23 23:31 | 1619 | subject opus both/C | claude-opus-5-5 | 226 | 87 | $0.00264 | 1.6 |  |
| 2026-10-23 23:31 | 1620 | judge 2 C opus | claude-haiku-5-5 | 412 | 60 | $0.00007 | 0.6 |  |
| 2026-10-23 23:31 | 1621 | judge 1 C opus | claude-haiku-5-5 | 412 | 60 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1622 | subject fable dismissal/Q1 | claude-fable-5-1 | 304 | 241 | $0.01509 | 3.5 |  |
| 2026-10-23 23:31 | 1623 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 73 | $0.00012 | 0.7 |  |
| 2026-10-23 23:31 | 1624 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 73 | $0.00012 | 0.7 |  |
| 2026-10-23 23:31 | 1625 | subject fable dismissal/C | claude-fable-5-1 | 251 | 44 | $0.00471 | 1.4 |  |
| 2026-10-23 23:31 | 1626 | judge 1 C fable | claude-haiku-5-5 | 407 | 53 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1627 | judge 2 C fable | claude-haiku-5-5 | 407 | 58 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 1628 | subject fable both/P4' | claude-fable-5-1 | 240 | 174 | $0.01110 | 3.3 |  |
| 2026-10-23 23:31 | 1629 | judge 1 P4' fable | claude-haiku-5-5 | 825 | 78 | $0.00012 | 0.9 |  |
| 2026-10-23 23:31 | 1630 | judge 2 P4' fable | claude-haiku-5-5 | 825 | 79 | $0.00012 | 1.1 |  |
| 2026-10-23 23:31 | 1631 | subject fable brief/Q1 | claude-fable-5-1 | 284 | 186 | $0.01214 | 2.6 |  |
| 2026-10-23 23:31 | 1632 | judge 2 Q1 fable | claude-haiku-5-5 | 931 | 114 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 1633 | judge 1 Q1 fable | claude-haiku-5-5 | 931 | 120 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 1634 | referee Q1 fable | claude-opus-5-5 | 931 | 245 | $0.00862 | 3 |  |
| 2026-10-23 23:31 | 1635 | subject sonnet brief/Q1 | claude-sonnet-5-5 | 284 | 31 | $0.00088 | 0.7 |  |
| 2026-10-23 23:31 | 1636 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 87 | $0.00013 | 0.7 |  |
| 2026-10-23 23:31 | 1637 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 90 | $0.00014 | 0.7 |  |
| 2026-10-23 23:31 | 1638 | subject opus dismissal/Q4 | claude-opus-5-5 | 265 | 270 | $0.00646 | 4.3 |  |
| 2026-10-23 23:31 | 1639 | judge 1 Q4 opus | claude-haiku-5-5 | 925 | 123 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 1640 | judge 2 Q4 opus | claude-haiku-5-5 | 925 | 132 | $0.00016 | 1.3 |  |
| 2026-10-23 23:31 | 1641 | subject sonnet neutral/P1' | claude-sonnet-5-5 | 326 | 783 | $0.00848 | 7.2 |  |
| 2026-10-23 23:31 | 1642 | judge 1 P1' sonnet | claude-haiku-5-5 | 1512 | 479 | $0.00039 | 2.7 |  |
| 2026-10-23 23:31 | 1643 | judge 2 P1' sonnet | claude-haiku-5-5 | 1512 | 628 | $0.00047 | 3.7 |  |
| 2026-10-23 23:31 | 1644 | subject fable neutral/Q1 | claude-fable-5-1 | 270 | 149 | $0.01015 | 2 |  |
| 2026-10-23 23:31 | 1645 | judge 1 Q1 fable | claude-haiku-5-5 | 884 | 76 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 1646 | judge 2 Q1 fable | claude-haiku-5-5 | 884 | 94 | $0.00014 | 1 |  |
| 2026-10-23 23:31 | 1647 | subject sonnet dismissal/P4' | claude-sonnet-5-5 | 265 | 140 | $0.00193 | 2 |  |
| 2026-10-23 23:31 | 1648 | judge 1 P4' sonnet | claude-haiku-5-5 | 858 | 85 | $0.00013 | 2.2 |  |
| 2026-10-23 23:31 | 1649 | judge 2 P4' sonnet | claude-haiku-5-5 | 858 | 101 | $0.00014 | 2.3 |  |
| 2026-10-23 23:31 | 1650 | subject fable brief/C | claude-fable-5-1 | 231 | 46 | $0.00461 | 1.3 |  |
| 2026-10-23 23:31 | 1651 | judge 1 C fable | claude-haiku-5-5 | 409 | 48 | $0.00006 | 0.6 |  |
| 2026-10-23 23:31 | 1652 | judge 2 C fable | claude-haiku-5-5 | 409 | 55 | $0.00007 | 1.7 |  |
| 2026-10-23 23:31 | 1653 | subject sonnet invited/C | claude-sonnet-5-5 | 249 | 497 | $0.00547 | 4.2 |  |
| 2026-10-23 23:31 | 1654 | judge 1 C sonnet | claude-haiku-5-5 | 584 | 75 | $0.00010 | 1 |  |
| 2026-10-23 23:31 | 1655 | judge 2 C sonnet | claude-haiku-5-5 | 584 | 74 | $0.00010 | 1.2 |  |
| 2026-10-23 23:31 | 1656 | subject opus neutral/C | claude-opus-5-5 | 217 | 75 | $0.00237 | 1.2 |  |
| 2026-10-23 23:31 | 1657 | judge 1 C opus | claude-haiku-5-5 | 407 | 81 | $0.00008 | 0.8 |  |
| 2026-10-23 23:31 | 1658 | judge 2 C opus | claude-haiku-5-5 | 407 | 79 | $0.00008 | 0.9 |  |
| 2026-10-23 23:31 | 1659 | subject opus brief/Q4 | claude-opus-5-5 | 245 | 102 | $0.00302 | 2.2 |  |
| 2026-10-23 23:31 | 1660 | judge 1 Q4 opus | claude-haiku-5-5 | 953 | 118 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 1661 | judge 2 Q4 opus | claude-haiku-5-5 | 953 | 124 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 1662 | subject opus neutral/Q4 | claude-opus-5-5 | 231 | 112 | $0.00316 | 2.1 |  |
| 2026-10-23 23:31 | 1663 | judge 1 Q4 opus | claude-haiku-5-5 | 955 | 124 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 1664 | judge 2 Q4 opus | claude-haiku-5-5 | 955 | 120 | $0.00016 | 1.3 |  |
| 2026-10-23 23:31 | 1665 | subject sonnet both/Q4 | claude-sonnet-5-5 | 240 | 56 | $0.00104 | 1.3 |  |
| 2026-10-23 23:31 | 1666 | judge 2 Q4 sonnet | claude-haiku-5-5 | 943 | 96 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 1667 | judge 1 Q4 sonnet | claude-haiku-5-5 | 943 | 346 | $0.00027 | 1.9 |  |
| 2026-10-23 23:31 | 1668 | referee Q4 sonnet | claude-opus-5-5 | 943 | 267 | $0.00911 | 3.1 |  |
| 2026-10-23 23:31 | 1669 | subject sonnet invited/P5' | claude-sonnet-5-5 | 339 | 614 | $0.00682 | 5.6 |  |
| 2026-10-23 23:31 | 1670 | judge 1 P5' sonnet | claude-haiku-5-5 | 1286 | 130 | $0.00019 | 1 |  |
| 2026-10-23 23:31 | 1671 | judge 2 P5' sonnet | claude-haiku-5-5 | 1286 | 131 | $0.00019 | 1.1 |  |
| 2026-10-23 23:31 | 1672 | subject opus dismissal/P4' | claude-opus-5-5 | 265 | 151 | $0.00408 | 2.9 |  |
| 2026-10-23 23:31 | 1673 | judge 2 P4' opus | claude-haiku-5-5 | 836 | 86 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 1674 | judge 1 P4' opus | claude-haiku-5-5 | 836 | 83 | $0.00013 | 1.2 |  |
| 2026-10-23 23:31 | 1675 | subject opus invited/P4' | claude-opus-5-5 | 263 | 595 | $0.01295 | 7.9 |  |
| 2026-10-23 23:31 | 1676 | judge 1 P4' opus | claude-haiku-5-5 | 1060 | 181 | $0.00020 | 1.7 |  |
| 2026-10-23 23:31 | 1677 | judge 2 P4' opus | claude-haiku-5-5 | 1060 | 195 | $0.00020 | 2.4 |  |
| 2026-10-23 23:31 | 1678 | subject opus invited/C | claude-opus-5-5 | 249 | 422 | $0.00944 | 6 |  |
| 2026-10-23 23:31 | 1679 | judge 2 C opus | claude-haiku-5-5 | 533 | 78 | $0.00009 | 0.8 |  |
| 2026-10-23 23:31 | 1680 | judge 1 C opus | claude-haiku-5-5 | 533 | 77 | $0.00009 | 0.8 |  |
| 2026-10-23 23:31 | 1681 | subject fable dismissal/Q4 | claude-fable-5-1 | 265 | 97 | $0.00750 | 1.7 |  |
| 2026-10-23 23:31 | 1682 | judge 1 Q4 fable | claude-haiku-5-5 | 893 | 64 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 1683 | judge 2 Q4 fable | claude-haiku-5-5 | 893 | 87 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 1684 | subject fable brief/Q4 | claude-fable-5-1 | 245 | 57 | $0.00530 | 1.5 |  |
| 2026-10-23 23:31 | 1685 | judge 1 Q4 fable | claude-haiku-5-5 | 944 | 130 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 1686 | judge 2 Q4 fable | claude-haiku-5-5 | 944 | 119 | $0.00015 | 1.3 |  |
| 2026-10-23 23:31 | 1687 | subject sonnet both/P5' | claude-sonnet-5-5 | 316 | 172 | $0.00235 | 1.9 |  |
| 2026-10-23 23:31 | 1688 | judge 1 P5' sonnet | claude-haiku-5-5 | 1102 | 140 | $0.00018 | 2.3 |  |
| 2026-10-23 23:31 | 1689 | judge 2 P5' sonnet | claude-haiku-5-5 | 1102 | 538 | $0.00038 | 4.2 |  |
| 2026-10-23 23:31 | 1690 | referee P5' sonnet | claude-opus-5-5 | 1102 | 211 | $0.00863 | 3 |  |
| 2026-10-23 23:31 | 1691 | subject opus dismissal/P1' | claude-opus-5-5 | 360 | 400 | $0.00944 | 4.7 |  |
| 2026-10-23 23:31 | 1692 | judge 2 P1' opus | claude-haiku-5-5 | 1291 | 360 | $0.00031 | 2.2 |  |
| 2026-10-23 23:31 | 1693 | judge 1 P1' opus | claude-haiku-5-5 | 1291 | 441 | $0.00035 | 2.5 |  |
| 2026-10-23 23:31 | 1694 | subject opus invited/C | claude-opus-5-5 | 249 | 481 | $0.01062 | 5.9 |  |
| 2026-10-23 23:31 | 1695 | judge 2 C opus | claude-haiku-5-5 | 585 | 65 | $0.00009 | 0.8 |  |
| 2026-10-23 23:31 | 1696 | judge 1 C opus | claude-haiku-5-5 | 585 | 64 | $0.00009 | 0.8 |  |
| 2026-10-23 23:31 | 1697 | subject sonnet neutral/P1' | claude-sonnet-5-5 | 326 | 924 | $0.00989 | 8.7 |  |
| 2026-10-23 23:31 | 1698 | judge 2 P1' sonnet | claude-haiku-5-5 | 1552 | 426 | $0.00037 | 2.6 |  |
| 2026-10-23 23:31 | 1699 | judge 1 P1' sonnet | claude-haiku-5-5 | 1552 | 456 | $0.00038 | 2.8 |  |
| 2026-10-23 23:31 | 1700 | subject opus brief/P1' | claude-opus-5-5 | 340 | 389 | $0.00914 | 4.7 |  |
| 2026-10-23 23:31 | 1701 | judge 1 P1' opus | claude-haiku-5-5 | 1323 | 454 | $0.00036 | 2.7 |  |
| 2026-10-23 23:31 | 1702 | judge 2 P1' opus | claude-haiku-5-5 | 1323 | 587 | $0.00043 | 3.3 |  |
| 2026-10-23 23:31 | 1703 | subject opus brief/Q1 | claude-opus-5-5 | 284 | 157 | $0.00428 | 2.4 |  |
| 2026-10-23 23:31 | 1704 | judge 2 Q1 opus | claude-haiku-5-5 | 922 | 100 | $0.00014 | 1.8 |  |
| 2026-10-23 23:31 | 1705 | judge 1 Q1 opus | claude-haiku-5-5 | 922 | 109 | $0.00015 | 1.8 |  |
| 2026-10-23 23:31 | 1706 | subject opus dismissal/Q4 | claude-opus-5-5 | 265 | 180 | $0.00466 | 3 |  |
| 2026-10-23 23:31 | 1707 | judge 1 Q4 opus | claude-haiku-5-5 | 937 | 111 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 1708 | judge 2 Q4 opus | claude-haiku-5-5 | 937 | 128 | $0.00016 | 0.9 |  |
| 2026-10-23 23:31 | 1709 | subject sonnet neutral/P5' | claude-sonnet-5-5 | 307 | 398 | $0.00459 | 3.4 |  |
| 2026-10-23 23:31 | 1710 | judge 2 P5' sonnet | claude-haiku-5-5 | 1169 | 103 | $0.00017 | 1.2 |  |
| 2026-10-23 23:31 | 1711 | judge 1 P5' sonnet | claude-haiku-5-5 | 1169 | 112 | $0.00017 | 1.5 |  |
| 2026-10-23 23:31 | 1712 | subject sonnet both/Q1 | claude-sonnet-5-5 | 279 | 41 | $0.00097 | 0.9 |  |
| 2026-10-23 23:31 | 1713 | judge 2 Q1 sonnet | claude-haiku-5-5 | 910 | 92 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 1714 | judge 1 Q1 sonnet | claude-haiku-5-5 | 910 | 101 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 1715 | subject fable brief/Q1 | claude-fable-5-1 | 284 | 139 | $0.00979 | 2.2 |  |
| 2026-10-23 23:31 | 1716 | judge 1 Q1 fable | claude-haiku-5-5 | 884 | 76 | $0.00013 | 0.7 |  |
| 2026-10-23 23:31 | 1717 | judge 2 Q1 fable | claude-haiku-5-5 | 884 | 83 | $0.00013 | 0.7 |  |
| 2026-10-23 23:31 | 1718 | subject fable both/P1' | claude-fable-5-1 | 335 | 368 | $0.02175 | 5.1 |  |
| 2026-10-23 23:31 | 1719 | judge 2 P1' fable | claude-haiku-5-5 | 1305 | 470 | $0.00037 | 2.5 |  |
| 2026-10-23 23:31 | 1720 | judge 1 P1' fable | claude-haiku-5-5 | 1305 | 525 | $0.00039 | 2.9 |  |
| 2026-10-23 23:31 | 1721 | subject fable dismissal/Q1 | claude-fable-5-1 | 304 | 177 | $0.01189 | 2.9 |  |
| 2026-10-23 23:31 | 1722 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 83 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 1723 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 68 | $0.00012 | 0.9 |  |
| 2026-10-23 23:31 | 1724 | subject sonnet brief/Q4 | claude-sonnet-5-5 | 245 | 54 | $0.00103 | 0.9 |  |
| 2026-10-23 23:31 | 1725 | judge 1 Q4 sonnet | claude-haiku-5-5 | 941 | 137 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 1726 | judge 2 Q4 sonnet | claude-haiku-5-5 | 941 | 130 | $0.00016 | 1.3 |  |
| 2026-10-23 23:31 | 1727 | subject fable neutral/P1' | claude-fable-5-1 | 326 | 612 | $0.03386 | 9.3 |  |
| 2026-10-23 23:31 | 1728 | judge 1 P1' fable | claude-haiku-5-5 | 1499 | 145 | $0.00022 | 1.8 |  |
| 2026-10-23 23:31 | 1729 | judge 2 P1' fable | claude-haiku-5-5 | 1499 | 405 | $0.00035 | 2.5 |  |
| 2026-10-23 23:31 | 1730 | referee P1' fable | claude-opus-5-5 | 1499 | 477 | $0.01554 | 5.4 |  |
| 2026-10-23 23:31 | 1731 | subject opus neutral/P1' | claude-opus-5-5 | 326 | 615 | $0.01360 | 7.5 |  |
| 2026-10-23 23:31 | 1732 | judge 2 P1' opus | claude-haiku-5-5 | 1512 | 381 | $0.00034 | 2.4 |  |
| 2026-10-23 23:31 | 1733 | judge 1 P1' opus | claude-haiku-5-5 | 1512 | 475 | $0.00039 | 2.7 |  |
| 2026-10-23 23:31 | 1734 | subject opus invited/P5' | claude-opus-5-5 | 339 | 628 | $0.01392 | 7.1 |  |
| 2026-10-23 23:31 | 1735 | judge 2 P5' opus | claude-haiku-5-5 | 1321 | 122 | $0.00019 | 1 |  |
| 2026-10-23 23:31 | 1736 | judge 1 P5' opus | claude-haiku-5-5 | 1321 | 114 | $0.00019 | 1.1 |  |
| 2026-10-23 23:31 | 1737 | subject opus dismissal/P5' | claude-opus-5-5 | 341 | 368 | $0.00872 | 4.6 |  |
| 2026-10-23 23:31 | 1738 | judge 1 P5' opus | claude-haiku-5-5 | 1116 | 110 | $0.00017 | 0.9 |  |
| 2026-10-23 23:31 | 1739 | judge 2 P5' opus | claude-haiku-5-5 | 1116 | 133 | $0.00018 | 1.2 |  |
| 2026-10-23 23:31 | 1740 | subject opus both/P5' | claude-opus-5-5 | 316 | 318 | $0.00762 | 4.1 |  |
| 2026-10-23 23:31 | 1741 | judge 1 P5' opus | claude-haiku-5-5 | 1105 | 141 | $0.00018 | 1.3 |  |
| 2026-10-23 23:31 | 1742 | judge 2 P5' opus | claude-haiku-5-5 | 1105 | 563 | $0.00039 | 3 |  |
| 2026-10-23 23:31 | 1743 | subject fable neutral/C | claude-fable-5-1 | 217 | 44 | $0.00437 | 1.2 |  |
| 2026-10-23 23:31 | 1744 | judge 1 C fable | claude-haiku-5-5 | 407 | 54 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1745 | judge 2 C fable | claude-haiku-5-5 | 407 | 54 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1746 | referee P5' opus | claude-opus-5-5 | 1105 | 271 | $0.00984 | 4.8 |  |
| 2026-10-23 23:31 | 1747 | subject sonnet brief/P4' | claude-sonnet-5-5 | 245 | 92 | $0.00141 | 1.4 |  |
| 2026-10-23 23:31 | 1748 | judge 1 P4' sonnet | claude-haiku-5-5 | 810 | 78 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 1749 | judge 2 P4' sonnet | claude-haiku-5-5 | 810 | 72 | $0.00012 | 1 |  |
| 2026-10-23 23:31 | 1750 | subject opus neutral/Q4 | claude-opus-5-5 | 231 | 127 | $0.00346 | 2.5 |  |
| 2026-10-23 23:31 | 1751 | judge 2 Q4 opus | claude-haiku-5-5 | 967 | 133 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 1752 | judge 1 Q4 opus | claude-haiku-5-5 | 967 | 137 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 1753 | subject fable neutral/P5' | claude-fable-5-1 | 307 | 379 | $0.02202 | 5.2 |  |
| 2026-10-23 23:31 | 1754 | judge 1 P5' fable | claude-haiku-5-5 | 1186 | 398 | $0.00032 | 2.5 |  |
| 2026-10-23 23:31 | 1755 | judge 2 P5' fable | claude-haiku-5-5 | 1186 | 403 | $0.00032 | 2.6 |  |
| 2026-10-23 23:31 | 1756 | subject sonnet dismissal/Q1 | claude-sonnet-5-5 | 304 | 31 | $0.00092 | 1.5 |  |
| 2026-10-23 23:31 | 1757 | referee P5' fable | claude-opus-5-5 | 1186 | 103 | $0.00680 | 2.1 |  |
| 2026-10-23 23:31 | 1758 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 92 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 1759 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 84 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 1760 | subject sonnet neutral/Q1 | claude-sonnet-5-5 | 270 | 140 | $0.00194 | 1.4 |  |
| 2026-10-23 23:31 | 1761 | judge 1 Q1 sonnet | claude-haiku-5-5 | 1009 | 131 | $0.00017 | 1.1 |  |
| 2026-10-23 23:31 | 1762 | judge 2 Q1 sonnet | claude-haiku-5-5 | 1009 | 131 | $0.00017 | 1.1 |  |
| 2026-10-23 23:31 | 1763 | subject fable brief/P5' | claude-fable-5-1 | 321 | 325 | $0.01946 | 4.3 |  |
| 2026-10-23 23:31 | 1764 | judge 1 P5' fable | claude-haiku-5-5 | 1137 | 144 | $0.00019 | 1.2 |  |
| 2026-10-23 23:31 | 1765 | judge 2 P5' fable | claude-haiku-5-5 | 1137 | 157 | $0.00019 | 2 |  |
| 2026-10-23 23:31 | 1766 | subject opus invited/P4' | claude-opus-5-5 | 263 | 762 | $0.01629 | 9.5 |  |
| 2026-10-23 23:31 | 1767 | judge 2 P4' opus | claude-haiku-5-5 | 1129 | 170 | $0.00020 | 1.2 |  |
| 2026-10-23 23:31 | 1768 | judge 1 P4' opus | claude-haiku-5-5 | 1129 | 222 | $0.00022 | 1.6 |  |
| 2026-10-23 23:31 | 1769 | subject sonnet invited/Q4 | claude-sonnet-5-5 | 263 | 678 | $0.00731 | 6.6 |  |
| 2026-10-23 23:31 | 1770 | judge 1 Q4 sonnet | claude-haiku-5-5 | 1160 | 227 | $0.00023 | 2.1 |  |
| 2026-10-23 23:31 | 1771 | judge 2 Q4 sonnet | claude-haiku-5-5 | 1160 | 329 | $0.00028 | 4.1 |  |
| 2026-10-23 23:31 | 1772 | subject opus both/C | claude-opus-5-5 | 226 | 72 | $0.00234 | 1.4 |  |
| 2026-10-23 23:31 | 1773 | judge 1 C opus | claude-haiku-5-5 | 406 | 62 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1774 | judge 2 C opus | claude-haiku-5-5 | 406 | 54 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1775 | subject opus brief/P5' | claude-opus-5-5 | 321 | 397 | $0.00922 | 5.5 |  |
| 2026-10-23 23:31 | 1776 | judge 2 P5' opus | claude-haiku-5-5 | 1222 | 121 | $0.00018 | 1 |  |
| 2026-10-23 23:31 | 1777 | judge 1 P5' opus | claude-haiku-5-5 | 1222 | 145 | $0.00019 | 1.1 |  |
| 2026-10-23 23:31 | 1778 | referee P5' opus | claude-opus-5-5 | 1222 | 127 | $0.00743 | 2.3 |  |
| 2026-10-23 23:31 | 1779 | subject fable dismissal/P1' | claude-fable-5-1 | 360 | 497 | $0.02845 | 7.9 |  |
| 2026-10-23 23:31 | 1780 | judge 2 P1' fable | claude-haiku-5-5 | 1344 | 330 | $0.00030 | 1.9 |  |
| 2026-10-23 23:31 | 1781 | judge 1 P1' fable | claude-haiku-5-5 | 1344 | 327 | $0.00030 | 1.9 |  |
| 2026-10-23 23:31 | 1782 | subject fable both/C | claude-fable-5-1 | 226 | 39 | $0.00421 | 1.1 |  |
| 2026-10-23 23:31 | 1783 | judge 1 C fable | claude-haiku-5-5 | 402 | 52 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1784 | judge 2 C fable | claude-haiku-5-5 | 402 | 52 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 1785 | subject fable both/P4' | claude-fable-5-1 | 240 | 159 | $0.01035 | 2.9 |  |
| 2026-10-23 23:31 | 1786 | judge 1 P4' fable | claude-haiku-5-5 | 830 | 85 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 1787 | judge 2 P4' fable | claude-haiku-5-5 | 830 | 75 | $0.00012 | 0.9 |  |
| 2026-10-23 23:31 | 1788 | subject opus both/Q1 | claude-opus-5-5 | 279 | 113 | $0.00338 | 1.7 |  |
| 2026-10-23 23:31 | 1789 | judge 1 Q1 opus | claude-haiku-5-5 | 877 | 78 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 1790 | judge 2 Q1 opus | claude-haiku-5-5 | 877 | 74 | $0.00012 | 1 |  |
| 2026-10-23 23:31 | 1791 | subject opus brief/Q4 | claude-opus-5-5 | 245 | 97 | $0.00292 | 2.2 |  |
| 2026-10-23 23:31 | 1792 | judge 2 Q4 opus | claude-haiku-5-5 | 943 | 111 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 1793 | judge 1 Q4 opus | claude-haiku-5-5 | 943 | 101 | $0.00014 | 1 |  |
| 2026-10-23 23:31 | 1794 | subject sonnet both/P1' | claude-sonnet-5-5 | 335 | 265 | $0.00332 | 3.4 |  |
| 2026-10-23 23:31 | 1795 | judge 2 P1' sonnet | claude-haiku-5-5 | 1372 | 127 | $0.00020 | 1.4 |  |
| 2026-10-23 23:31 | 1796 | judge 1 P1' sonnet | claude-haiku-5-5 | 1372 | 145 | $0.00021 | 1.6 |  |
| 2026-10-23 23:31 | 1797 | referee P1' sonnet | claude-opus-5-5 | 1372 | 425 | $0.01399 | 4.9 |  |
| 2026-10-23 23:31 | 1798 | subject opus neutral/P4' | claude-opus-5-5 | 231 | 276 | $0.00644 | 4.1 |  |
| 2026-10-23 23:31 | 1799 | judge 1 P4' opus | claude-haiku-5-5 | 949 | 113 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 1800 | judge 2 P4' opus | claude-haiku-5-5 | 949 | 366 | $0.00028 | 2.2 |  |
| 2026-10-23 23:31 | 1801 | subject opus brief/P4' | claude-opus-5-5 | 245 | 147 | $0.00392 | 3 |  |
| 2026-10-23 23:31 | 1802 | judge 2 P4' opus | claude-haiku-5-5 | 851 | 88 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 1803 | judge 1 P4' opus | claude-haiku-5-5 | 851 | 94 | $0.00013 | 1.6 |  |
| 2026-10-23 23:31 | 1804 | subject fable dismissal/P4' | claude-fable-5-1 | 265 | 61 | $0.00570 | 1.9 |  |
| 2026-10-23 23:31 | 1805 | judge 2 P4' fable | claude-haiku-5-5 | 759 | 105 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 1806 | judge 1 P4' fable | claude-haiku-5-5 | 759 | 104 | $0.00013 | 1 |  |
| 2026-10-23 23:31 | 1807 | subject fable invited/Q1 | claude-fable-5-1 | 302 | 234 | $0.01472 | 3.2 |  |
| 2026-10-23 23:31 | 1808 | judge 1 Q1 fable | claude-haiku-5-5 | 1009 | 109 | $0.00016 | 0.9 |  |
| 2026-10-23 23:31 | 1809 | judge 2 Q1 fable | claude-haiku-5-5 | 1009 | 119 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 1810 | subject sonnet both/P4' | claude-sonnet-5-5 | 240 | 119 | $0.00167 | 1.5 |  |
| 2026-10-23 23:31 | 1811 | judge 2 P4' sonnet | claude-haiku-5-5 | 837 | 75 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 1812 | judge 1 P4' sonnet | claude-haiku-5-5 | 837 | 89 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 1813 | subject sonnet invited/P1' | claude-sonnet-5-5 | 358 | 931 | $0.01003 | 8.4 |  |
| 2026-10-23 23:31 | 1814 | judge 2 P1' sonnet | claude-haiku-5-5 | 1602 | 127 | $0.00022 | 1.2 |  |
| 2026-10-23 23:31 | 1815 | judge 1 P1' sonnet | claude-haiku-5-5 | 1602 | 463 | $0.00039 | 2.7 |  |
| 2026-10-23 23:31 | 1816 | subject opus invited/Q4 | claude-opus-5-5 | 263 | 417 | $0.00939 | 5.8 |  |
| 2026-10-23 23:31 | 1817 | judge 1 Q4 opus | claude-haiku-5-5 | 1142 | 262 | $0.00025 | 1.6 |  |
| 2026-10-23 23:31 | 1818 | judge 2 Q4 opus | claude-haiku-5-5 | 1142 | 303 | $0.00027 | 2.2 |  |
| 2026-10-23 23:31 | 1819 | subject opus both/P1' | claude-opus-5-5 | 335 | 436 | $0.01006 | 4.7 |  |
| 2026-10-23 23:31 | 1820 | judge 2 P1' opus | claude-haiku-5-5 | 1346 | 131 | $0.00020 | 1 |  |
| 2026-10-23 23:31 | 1821 | judge 1 P1' opus | claude-haiku-5-5 | 1346 | 136 | $0.00020 | 1.8 |  |
| 2026-10-23 23:31 | 1822 | subject fable brief/P4' | claude-fable-5-1 | 245 | 153 | $0.01010 | 5.2 |  |
| 2026-10-23 23:31 | 1823 | judge 1 P4' fable | claude-haiku-5-5 | 834 | 413 | $0.00029 | 2.5 |  |
| 2026-10-23 23:31 | 1824 | judge 2 P4' fable | claude-haiku-5-5 | 834 | 433 | $0.00030 | 2.6 |  |
| 2026-10-23 23:31 | 1825 | subject sonnet invited/Q1 | claude-sonnet-5-5 | 302 | 398 | $0.00458 | 4.1 |  |
| 2026-10-23 23:31 | 1826 | referee P4' fable | claude-opus-5-5 | 834 | 418 | $0.01170 | 5.2 |  |
| 2026-10-23 23:31 | 1827 | judge 1 Q1 sonnet | claude-haiku-5-5 | 1021 | 120 | $0.00016 | 1.2 |  |
| 2026-10-23 23:31 | 1828 | judge 2 Q1 sonnet | claude-haiku-5-5 | 1021 | 105 | $0.00015 | 1.8 |  |
| 2026-10-23 23:31 | 1829 | subject opus dismissal/C | claude-opus-5-5 | 251 | 74 | $0.00248 | 1.3 |  |
| 2026-10-23 23:31 | 1830 | judge 1 C opus | claude-haiku-5-5 | 408 | 49 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1831 | judge 2 C opus | claude-haiku-5-5 | 408 | 82 | $0.00008 | 0.7 |  |
| 2026-10-23 23:31 | 1832 | subject fable neutral/P4' | claude-fable-5-1 | 231 | 260 | $0.01531 | 4.5 |  |
| 2026-10-23 23:31 | 1833 | judge 2 P4' fable | claude-haiku-5-5 | 941 | 343 | $0.00027 | 2.6 |  |
| 2026-10-23 23:31 | 1834 | judge 1 P4' fable | claude-haiku-5-5 | 941 | 458 | $0.00032 | 2.8 |  |
| 2026-10-23 23:31 | 1835 | subject fable dismissal/C | claude-fable-5-1 | 251 | 40 | $0.00451 | 1.4 |  |
| 2026-10-23 23:31 | 1836 | judge 2 C fable | claude-haiku-5-5 | 403 | 54 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 1837 | judge 1 C fable | claude-haiku-5-5 | 403 | 60 | $0.00007 | 1 |  |
| 2026-10-23 23:31 | 1838 | subject sonnet invited/C | claude-sonnet-5-5 | 249 | 435 | $0.00485 | 4.2 |  |
| 2026-10-23 23:31 | 1839 | judge 2 C sonnet | claude-haiku-5-5 | 506 | 82 | $0.00009 | 0.8 |  |
| 2026-10-23 23:31 | 1840 | judge 1 C sonnet | claude-haiku-5-5 | 506 | 82 | $0.00009 | 0.9 |  |
| 2026-10-23 23:31 | 1841 | subject opus invited/P1' | claude-opus-5-5 | 358 | 677 | $0.01497 | 8.4 |  |
| 2026-10-23 23:31 | 1842 | judge 1 P1' opus | claude-haiku-5-5 | 1519 | 321 | $0.00031 | 1.8 |  |
| 2026-10-23 23:31 | 1843 | judge 2 P1' opus | claude-haiku-5-5 | 1519 | 438 | $0.00037 | 2.3 |  |
| 2026-10-23 23:31 | 1844 | subject fable invited/Q4 | claude-fable-5-1 | 263 | 273 | $0.01628 | 5.3 |  |
| 2026-10-23 23:31 | 1845 | judge 1 Q4 fable | claude-haiku-5-5 | 1029 | 108 | $0.00016 | 0.8 |  |
| 2026-10-23 23:31 | 1846 | judge 2 Q4 fable | claude-haiku-5-5 | 1029 | 131 | $0.00017 | 1.1 |  |
| 2026-10-23 23:31 | 1847 | subject fable neutral/Q1 | claude-fable-5-1 | 270 | 218 | $0.01360 | 3.5 |  |
| 2026-10-23 23:31 | 1848 | judge 2 Q1 fable | claude-haiku-5-5 | 899 | 90 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 1849 | judge 1 Q1 fable | claude-haiku-5-5 | 899 | 97 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 1850 | subject fable both/Q4 | claude-fable-5-1 | 240 | 324 | $0.01860 | 5.4 |  |
| 2026-10-23 23:31 | 1851 | judge 1 Q4 fable | claude-haiku-5-5 | 936 | 99 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 1852 | judge 2 Q4 fable | claude-haiku-5-5 | 936 | 112 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 1853 | subject sonnet brief/C | claude-sonnet-5-5 | 231 | 45 | $0.00091 | 0.8 |  |
| 2026-10-23 23:31 | 1854 | judge 2 C sonnet | claude-haiku-5-5 | 408 | 59 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1855 | judge 1 C sonnet | claude-haiku-5-5 | 408 | 59 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1856 | subject opus dismissal/P4' | claude-opus-5-5 | 265 | 178 | $0.00462 | 3.1 |  |
| 2026-10-23 23:31 | 1857 | judge 2 P4' opus | claude-haiku-5-5 | 851 | 81 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 1858 | judge 1 P4' opus | claude-haiku-5-5 | 851 | 85 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 1859 | subject sonnet brief/P1' | claude-sonnet-5-5 | 340 | 519 | $0.00587 | 4.7 |  |
| 2026-10-23 23:31 | 1860 | judge 2 P1' sonnet | claude-haiku-5-5 | 1373 | 468 | $0.00037 | 2.7 |  |
| 2026-10-23 23:31 | 1861 | judge 1 P1' sonnet | claude-haiku-5-5 | 1373 | 521 | $0.00040 | 3 |  |
| 2026-10-23 23:31 | 1862 | subject sonnet neutral/C | claude-sonnet-5-5 | 217 | 49 | $0.00092 | 1 |  |
| 2026-10-23 23:31 | 1863 | judge 1 C sonnet | claude-haiku-5-5 | 412 | 57 | $0.00007 | 0.6 |  |
| 2026-10-23 23:31 | 1864 | judge 2 C sonnet | claude-haiku-5-5 | 412 | 59 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1865 | subject fable brief/C | claude-fable-5-1 | 231 | 39 | $0.00426 | 1.2 |  |
| 2026-10-23 23:31 | 1866 | judge 2 C fable | claude-haiku-5-5 | 402 | 52 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 1867 | judge 1 C fable | claude-haiku-5-5 | 402 | 54 | $0.00007 | 1 |  |
| 2026-10-23 23:31 | 1868 | subject sonnet both/Q4 | claude-sonnet-5-5 | 240 | 56 | $0.00104 | 1.4 |  |
| 2026-10-23 23:31 | 1869 | judge 1 Q4 sonnet | claude-haiku-5-5 | 943 | 108 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 1870 | judge 2 Q4 sonnet | claude-haiku-5-5 | 943 | 109 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 1871 | subject opus dismissal/Q1 | claude-opus-5-5 | 304 | 91 | $0.00304 | 1.5 |  |
| 2026-10-23 23:31 | 1872 | judge 1 Q1 opus | claude-haiku-5-5 | 875 | 78 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 1873 | judge 2 Q1 opus | claude-haiku-5-5 | 875 | 79 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 1874 | subject opus neutral/Q1 | claude-opus-5-5 | 270 | 150 | $0.00408 | 2 |  |
| 2026-10-23 23:31 | 1875 | judge 2 Q1 opus | claude-haiku-5-5 | 908 | 102 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 1876 | judge 1 Q1 opus | claude-haiku-5-5 | 908 | 77 | $0.00013 | 1.9 |  |
| 2026-10-23 23:31 | 1877 | subject sonnet dismissal/C | claude-sonnet-5-5 | 251 | 40 | $0.00090 | 1.7 |  |
| 2026-10-23 23:31 | 1878 | judge 1 C sonnet | claude-haiku-5-5 | 403 | 53 | $0.00007 | 1 |  |
| 2026-10-23 23:31 | 1879 | judge 2 C sonnet | claude-haiku-5-5 | 403 | 53 | $0.00007 | 1 |  |
| 2026-10-23 23:31 | 1880 | subject fable brief/P1' | claude-fable-5-1 | 340 | 477 | $0.02725 | 7.4 |  |
| 2026-10-23 23:31 | 1881 | judge 2 P1' fable | claude-haiku-5-5 | 1360 | 122 | $0.00020 | 1 |  |
| 2026-10-23 23:31 | 1882 | judge 1 P1' fable | claude-haiku-5-5 | 1360 | 148 | $0.00021 | 1.2 |  |
| 2026-10-23 23:31 | 1883 | subject opus neutral/P5' | claude-opus-5-5 | 307 | 405 | $0.00933 | 4.8 |  |
| 2026-10-23 23:31 | 1884 | judge 1 P5' opus | claude-haiku-5-5 | 1215 | 124 | $0.00018 | 1 |  |
| 2026-10-23 23:31 | 1885 | judge 2 P5' opus | claude-haiku-5-5 | 1215 | 142 | $0.00019 | 1.1 |  |
| 2026-10-23 23:31 | 1886 | subject sonnet dismissal/Q4 | claude-sonnet-5-5 | 265 | 34 | $0.00087 | 1.1 |  |
| 2026-10-23 23:31 | 1887 | judge 2 Q4 sonnet | claude-haiku-5-5 | 921 | 112 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 1888 | judge 1 Q4 sonnet | claude-haiku-5-5 | 921 | 136 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 1889 | subject fable invited/P5' | claude-fable-5-1 | 339 | 452 | $0.02599 | 6.8 |  |
| 2026-10-23 23:31 | 1890 | judge 1 P5' fable | claude-haiku-5-5 | 1237 | 113 | $0.00018 | 1 |  |
| 2026-10-23 23:31 | 1891 | judge 2 P5' fable | claude-haiku-5-5 | 1237 | 123 | $0.00019 | 1 |  |
| 2026-10-23 23:31 | 1892 | subject sonnet dismissal/P1' | claude-sonnet-5-5 | 360 | 588 | $0.00660 | 5.2 |  |
| 2026-10-23 23:31 | 1893 | judge 2 P1' sonnet | claude-haiku-5-5 | 1408 | 443 | $0.00036 | 2.4 |  |
| 2026-10-23 23:31 | 1894 | judge 1 P1' sonnet | claude-haiku-5-5 | 1408 | 516 | $0.00040 | 2.8 |  |
| 2026-10-23 23:31 | 1895 | subject opus neutral/C | claude-opus-5-5 | 217 | 76 | $0.00239 | 1.2 |  |
| 2026-10-23 23:31 | 1896 | judge 1 C opus | claude-haiku-5-5 | 408 | 56 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1897 | judge 2 C opus | claude-haiku-5-5 | 408 | 57 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1898 | referee P1' sonnet | claude-opus-5-5 | 1408 | 385 | $0.01333 | 4.3 |  |
| 2026-10-23 23:31 | 1899 | subject sonnet invited/P4' | claude-sonnet-5-5 | 263 | 867 | $0.00920 | 7.8 |  |
| 2026-10-23 23:31 | 1900 | judge 2 P4' sonnet | claude-haiku-5-5 | 1148 | 224 | $0.00023 | 1.5 |  |
| 2026-10-23 23:31 | 1901 | judge 1 P4' sonnet | claude-haiku-5-5 | 1148 | 246 | $0.00024 | 2.4 |  |
| 2026-10-23 23:31 | 1902 | referee P4' sonnet | claude-opus-5-5 | 1148 | 180 | $0.00819 | 2.6 |  |
| 2026-10-23 23:31 | 1903 | subject fable invited/P4' | claude-fable-5-1 | 263 | 536 | $0.02943 | 9.8 |  |
| 2026-10-23 23:31 | 1904 | judge 1 P4' fable | claude-haiku-5-5 | 1068 | 155 | $0.00018 | 1.2 |  |
| 2026-10-23 23:31 | 1905 | judge 2 P4' fable | claude-haiku-5-5 | 1068 | 138 | $0.00018 | 1.3 |  |
| 2026-10-23 23:31 | 1906 | subject sonnet invited/P5' | claude-sonnet-5-5 | 339 | 587 | $0.00655 | 6 |  |
| 2026-10-23 23:31 | 1907 | judge 2 P5' sonnet | claude-haiku-5-5 | 1253 | 118 | $0.00018 | 1.2 |  |
| 2026-10-23 23:31 | 1908 | judge 1 P5' sonnet | claude-haiku-5-5 | 1253 | 115 | $0.00018 | 2.2 |  |
| 2026-10-23 23:31 | 1909 | subject sonnet neutral/Q4 | claude-sonnet-5-5 | 231 | 96 | $0.00142 | 1.4 |  |
| 2026-10-23 23:31 | 1910 | judge 2 Q4 sonnet | claude-haiku-5-5 | 983 | 108 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 1911 | judge 1 Q4 sonnet | claude-haiku-5-5 | 983 | 119 | $0.00016 | 1.9 |  |
| 2026-10-23 23:31 | 1912 | subject sonnet dismissal/P5' | claude-sonnet-5-5 | 341 | 175 | $0.00243 | 2.3 |  |
| 2026-10-23 23:31 | 1913 | judge 1 P5' sonnet | claude-haiku-5-5 | 1048 | 87 | $0.00015 | 0.7 |  |
| 2026-10-23 23:31 | 1914 | judge 2 P5' sonnet | claude-haiku-5-5 | 1048 | 100 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 1915 | subject opus brief/C | claude-opus-5-5 | 231 | 73 | $0.00238 | 2.1 |  |
| 2026-10-23 23:31 | 1916 | judge 2 C opus | claude-haiku-5-5 | 404 | 62 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1917 | judge 1 C opus | claude-haiku-5-5 | 404 | 54 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 1918 | subject sonnet brief/P5' | claude-sonnet-5-5 | 321 | 312 | $0.00376 | 3.2 |  |
| 2026-10-23 23:31 | 1919 | judge 1 P5' sonnet | claude-haiku-5-5 | 1103 | 127 | $0.00017 | 1.1 |  |
| 2026-10-23 23:31 | 1920 | judge 2 P5' sonnet | claude-haiku-5-5 | 1103 | 588 | $0.00040 | 3.2 |  |
| 2026-10-23 23:31 | 1921 | subject opus both/Q4 | claude-opus-5-5 | 240 | 143 | $0.00382 | 2.5 |  |
| 2026-10-23 23:31 | 1922 | referee P5' sonnet | claude-opus-5-5 | 1103 | 192 | $0.00825 | 2.8 |  |
| 2026-10-23 23:31 | 1923 | judge 2 Q4 opus | claude-haiku-5-5 | 939 | 102 | $0.00014 | 1.5 |  |
| 2026-10-23 23:31 | 1924 | judge 1 Q4 opus | claude-haiku-5-5 | 939 | 130 | $0.00016 | 1.8 |  |
| 2026-10-23 23:31 | 1925 | subject sonnet both/C | claude-sonnet-5-5 | 226 | 47 | $0.00092 | 0.9 |  |
| 2026-10-23 23:31 | 1926 | judge 1 C sonnet | claude-haiku-5-5 | 410 | 48 | $0.00006 | 1.3 |  |
| 2026-10-23 23:31 | 1927 | judge 2 C sonnet | claude-haiku-5-5 | 410 | 48 | $0.00006 | 1.7 |  |
| 2026-10-23 23:31 | 1928 | subject sonnet brief/Q1 | claude-sonnet-5-5 | 284 | 31 | $0.00088 | 0.7 |  |
| 2026-10-23 23:31 | 1929 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 73 | $0.00013 | 0.7 |  |
| 2026-10-23 23:31 | 1930 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 86 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 1931 | subject fable neutral/Q4 | claude-fable-5-1 | 231 | 68 | $0.00571 | 1.4 |  |
| 2026-10-23 23:31 | 1932 | judge 2 Q4 fable | claude-haiku-5-5 | 955 | 106 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 1933 | judge 1 Q4 fable | claude-haiku-5-5 | 955 | 114 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 1934 | subject sonnet neutral/P4' | claude-sonnet-5-5 | 231 | 228 | $0.00274 | 2.3 |  |
| 2026-10-23 23:31 | 1935 | judge 1 P4' sonnet | claude-haiku-5-5 | 946 | 304 | $0.00025 | 1.8 |  |
| 2026-10-23 23:31 | 1936 | judge 2 P4' sonnet | claude-haiku-5-5 | 946 | 371 | $0.00028 | 2.7 |  |
| 2026-10-23 23:31 | 1937 | subject fable dismissal/P5' | claude-fable-5-1 | 341 | 383 | $0.02256 | 5.8 |  |
| 2026-10-23 23:31 | 1938 | judge 1 P5' fable | claude-haiku-5-5 | 1123 | 120 | $0.00017 | 1.3 |  |
| 2026-10-23 23:31 | 1939 | judge 2 P5' fable | claude-haiku-5-5 | 1123 | 114 | $0.00017 | 1.7 |  |
| 2026-10-23 23:31 | 1940 | subject opus both/P4' | claude-opus-5-5 | 240 | 147 | $0.00390 | 2.3 |  |
| 2026-10-23 23:31 | 1941 | judge 1 P4' opus | claude-haiku-5-5 | 836 | 76 | $0.00012 | 0.7 |  |
| 2026-10-23 23:31 | 1942 | judge 2 P4' opus | claude-haiku-5-5 | 836 | 85 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 1943 | subject fable invited/P1' | claude-fable-5-1 | 358 | 781 | $0.04263 | 13 |  |
| 2026-10-23 23:31 | 1944 | judge 2 P1' fable | claude-haiku-5-5 | 1566 | 525 | $0.00042 | 2.7 |  |
| 2026-10-23 23:31 | 1945 | judge 1 P1' fable | claude-haiku-5-5 | 1566 | 635 | $0.00047 | 3.4 |  |
| 2026-10-23 23:31 | 1946 | subject opus invited/Q1 | claude-opus-5-5 | 302 | 265 | $0.00651 | 4.5 |  |
| 2026-10-23 23:31 | 1947 | judge 1 Q1 opus | claude-haiku-5-5 | 971 | 99 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 1948 | judge 2 Q1 opus | claude-haiku-5-5 | 971 | 114 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 1949 | subject sonnet dismissal/P4' | claude-sonnet-5-5 | 265 | 123 | $0.00176 | 1.9 |  |
| 2026-10-23 23:31 | 1950 | judge 2 P4' sonnet | claude-haiku-5-5 | 841 | 67 | $0.00012 | 0.9 |  |
| 2026-10-23 23:31 | 1951 | judge 1 P4' sonnet | claude-haiku-5-5 | 841 | 79 | $0.00012 | 1.5 |  |
| 2026-10-23 23:31 | 1952 | subject fable both/P5' | claude-fable-5-1 | 316 | 347 | $0.02051 | 5.5 |  |
| 2026-10-23 23:31 | 1953 | judge 2 P5' fable | claude-haiku-5-5 | 1106 | 149 | $0.00019 | 1 |  |
| 2026-10-23 23:31 | 1954 | judge 1 P5' fable | claude-haiku-5-5 | 1106 | 147 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 1955 | subject fable invited/C | claude-fable-5-1 | 249 | 262 | $0.01559 | 4 |  |
| 2026-10-23 23:31 | 1956 | judge 1 C fable | claude-haiku-5-5 | 484 | 65 | $0.00008 | 0.8 |  |
| 2026-10-23 23:31 | 1957 | judge 2 C fable | claude-haiku-5-5 | 484 | 66 | $0.00008 | 1.1 |  |
| 2026-10-23 23:31 | 1958 | subject fable both/Q1 | claude-fable-5-1 | 279 | 122 | $0.00889 | 1.9 |  |
| 2026-10-23 23:31 | 1959 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 63 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 1960 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 84 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 1961 | subject opus both/P5' | claude-opus-5-5 | 316 | 267 | $0.00660 | 3.4 |  |
| 2026-10-23 23:31 | 1962 | judge 1 P5' opus | claude-haiku-5-5 | 1127 | 536 | $0.00038 | 2.8 |  |
| 2026-10-23 23:31 | 1963 | judge 2 P5' opus | claude-haiku-5-5 | 1127 | 639 | $0.00043 | 3.5 |  |
| 2026-10-23 23:31 | 1964 | subject fable both/Q4 | claude-fable-5-1 | 240 | 214 | $0.01310 | 3.4 |  |
| 2026-10-23 23:31 | 1965 | judge 1 Q4 fable | claude-haiku-5-5 | 933 | 110 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 1966 | judge 2 Q4 fable | claude-haiku-5-5 | 933 | 112 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 1967 | subject sonnet neutral/P5' | claude-sonnet-5-5 | 307 | 392 | $0.00453 | 4 |  |
| 2026-10-23 23:31 | 1968 | judge 2 P5' sonnet | claude-haiku-5-5 | 1173 | 412 | $0.00032 | 2.5 |  |
| 2026-10-23 23:31 | 1969 | judge 1 P5' sonnet | claude-haiku-5-5 | 1173 | 474 | $0.00035 | 2.5 |  |
| 2026-10-23 23:31 | 1970 | subject fable neutral/C | claude-fable-5-1 | 217 | 44 | $0.00437 | 1.2 |  |
| 2026-10-23 23:31 | 1971 | judge 1 C fable | claude-haiku-5-5 | 407 | 54 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1972 | judge 2 C fable | claude-haiku-5-5 | 407 | 85 | $0.00008 | 0.9 |  |
| 2026-10-23 23:31 | 1973 | subject fable brief/P4' | claude-fable-5-1 | 245 | 171 | $0.01100 | 2.9 |  |
| 2026-10-23 23:31 | 1974 | judge 2 P4' fable | claude-haiku-5-5 | 869 | 107 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 1975 | judge 1 P4' fable | claude-haiku-5-5 | 869 | 97 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 1976 | subject opus invited/P4' | claude-opus-5-5 | 263 | 527 | $0.01159 | 7.5 |  |
| 2026-10-23 23:31 | 1977 | judge 1 P4' opus | claude-haiku-5-5 | 1028 | 121 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 1978 | judge 2 P4' opus | claude-haiku-5-5 | 1028 | 126 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 1979 | subject opus neutral/Q1 | claude-opus-5-5 | 270 | 243 | $0.00594 | 3.8 |  |
| 2026-10-23 23:31 | 1980 | judge 2 Q1 opus | claude-haiku-5-5 | 956 | 116 | $0.00015 | 0.8 |  |
| 2026-10-23 23:31 | 1981 | judge 1 Q1 opus | claude-haiku-5-5 | 956 | 116 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 1982 | subject opus dismissal/C | claude-opus-5-5 | 251 | 68 | $0.00236 | 1.1 |  |
| 2026-10-23 23:31 | 1983 | judge 1 C opus | claude-haiku-5-5 | 402 | 58 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 1984 | judge 2 C opus | claude-haiku-5-5 | 402 | 53 | $0.00007 | 0.9 |  |
| 2026-10-23 23:31 | 1985 | subject sonnet both/P4' | claude-sonnet-5-5 | 240 | 81 | $0.00129 | 1.3 |  |
| 2026-10-23 23:31 | 1986 | judge 1 P4' sonnet | claude-haiku-5-5 | 799 | 87 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 1987 | judge 2 P4' sonnet | claude-haiku-5-5 | 799 | 108 | $0.00013 | 1 |  |
| 2026-10-23 23:31 | 1988 | subject opus neutral/P1' | claude-opus-5-5 | 326 | 532 | $0.01194 | 6.6 |  |
| 2026-10-23 23:31 | 1989 | judge 1 P1' opus | claude-haiku-5-5 | 1462 | 438 | $0.00037 | 2.7 |  |
| 2026-10-23 23:31 | 1990 | judge 2 P1' opus | claude-haiku-5-5 | 1462 | 504 | $0.00040 | 3 |  |
| 2026-10-23 23:31 | 1991 | subject opus both/C | claude-opus-5-5 | 226 | 79 | $0.00248 | 1.5 |  |
| 2026-10-23 23:31 | 1992 | judge 1 C opus | claude-haiku-5-5 | 408 | 60 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 1993 | judge 2 C opus | claude-haiku-5-5 | 408 | 60 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 1994 | subject sonnet both/C | claude-sonnet-5-5 | 226 | 47 | $0.00092 | 0.9 |  |
| 2026-10-23 23:31 | 1995 | referee P1' opus | claude-opus-5-5 | 1462 | 557 | $0.01699 | 5.8 |  |
| 2026-10-23 23:31 | 1996 | judge 2 C sonnet | claude-haiku-5-5 | 410 | 60 | $0.00007 | 0.9 |  |
| 2026-10-23 23:31 | 1997 | judge 1 C sonnet | claude-haiku-5-5 | 410 | 48 | $0.00006 | 1.7 |  |
| 2026-10-23 23:31 | 1998 | subject fable neutral/P4' | claude-fable-5-1 | 231 | 256 | $0.01511 | 4.8 |  |
| 2026-10-23 23:31 | 1999 | judge 1 P4' fable | claude-haiku-5-5 | 897 | 89 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2000 | judge 2 P4' fable | claude-haiku-5-5 | 897 | 103 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 2001 | subject fable dismissal/C | claude-fable-5-1 | 251 | 43 | $0.00466 | 1.5 |  |
| 2026-10-23 23:31 | 2002 | judge 1 C fable | claude-haiku-5-5 | 406 | 53 | $0.00007 | 0.6 |  |
| 2026-10-23 23:31 | 2003 | judge 2 C fable | claude-haiku-5-5 | 406 | 52 | $0.00007 | 2.7 |  |
| 2026-10-23 23:31 | 2004 | subject opus invited/P5' | claude-opus-5-5 | 339 | 745 | $0.01626 | 9.3 |  |
| 2026-10-23 23:31 | 2005 | judge 2 P5' opus | claude-haiku-5-5 | 1442 | 347 | $0.00032 | 1.9 |  |
| 2026-10-23 23:31 | 2006 | judge 1 P5' opus | claude-haiku-5-5 | 1442 | 347 | $0.00032 | 2 |  |
| 2026-10-23 23:31 | 2007 | subject fable dismissal/P4' | claude-fable-5-1 | 265 | 146 | $0.00995 | 2.9 |  |
| 2026-10-23 23:31 | 2008 | judge 1 P4' fable | claude-haiku-5-5 | 830 | 87 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 2009 | judge 2 P4' fable | claude-haiku-5-5 | 830 | 84 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2010 | subject sonnet dismissal/P1' | claude-sonnet-5-5 | 360 | 534 | $0.00606 | 5.7 |  |
| 2026-10-23 23:31 | 2011 | judge 1 P1' sonnet | claude-haiku-5-5 | 1404 | 535 | $0.00041 | 3.4 |  |
| 2026-10-23 23:31 | 2012 | judge 2 P1' sonnet | claude-haiku-5-5 | 1404 | 627 | $0.00045 | 3.5 |  |
| 2026-10-23 23:31 | 2013 | subject fable dismissal/Q4 | claude-fable-5-1 | 265 | 244 | $0.01485 | 4.2 |  |
| 2026-10-23 23:31 | 2014 | judge 2 Q4 fable | claude-haiku-5-5 | 912 | 116 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 2015 | judge 1 Q4 fable | claude-haiku-5-5 | 912 | 125 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 2016 | subject fable invited/C | claude-fable-5-1 | 249 | 128 | $0.00889 | 2.1 |  |
| 2026-10-23 23:31 | 2017 | judge 1 C fable | claude-haiku-5-5 | 420 | 51 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 2018 | subject sonnet neutral/P4' | claude-sonnet-5-5 | 231 | 244 | $0.00290 | 3.4 |  |
| 2026-10-23 23:31 | 2019 | judge 2 C fable | claude-haiku-5-5 | 420 | 58 | $0.00007 | 7.4 |  |
| 2026-10-23 23:31 | 2020 | judge 1 P4' sonnet | claude-haiku-5-5 | 962 | 420 | $0.00031 | 3 |  |
| 2026-10-23 23:31 | 2021 | judge 2 P4' sonnet | claude-haiku-5-5 | 962 | 473 | $0.00033 | 3.2 |  |
| 2026-10-23 23:31 | 2022 | subject sonnet brief/P4' | claude-sonnet-5-5 | 245 | 87 | $0.00136 | 1.3 |  |
| 2026-10-23 23:31 | 2023 | referee P4' sonnet | claude-opus-5-5 | 962 | 198 | $0.00781 | 2.6 |  |
| 2026-10-23 23:31 | 2024 | judge 1 P4' sonnet | claude-haiku-5-5 | 805 | 96 | $0.00013 | 1.7 |  |
| 2026-10-23 23:31 | 2025 | judge 2 P4' sonnet | claude-haiku-5-5 | 805 | 88 | $0.00012 | 1 |  |
| 2026-10-23 23:31 | 2026 | subject opus neutral/P4' | claude-opus-5-5 | 231 | 225 | $0.00542 | 3.4 |  |
| 2026-10-23 23:31 | 2027 | judge 2 P4' opus | claude-haiku-5-5 | 915 | 127 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 2028 | judge 1 P4' opus | claude-haiku-5-5 | 915 | 130 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 2029 | subject opus brief/Q1 | claude-opus-5-5 | 284 | 48 | $0.00210 | 1.9 |  |
| 2026-10-23 23:31 | 2030 | judge 2 Q1 opus | claude-haiku-5-5 | 885 | 81 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 2031 | judge 1 Q1 opus | claude-haiku-5-5 | 885 | 79 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2032 | subject fable neutral/P5' | claude-fable-5-1 | 307 | 396 | $0.02287 | 7 |  |
| 2026-10-23 23:31 | 2033 | judge 1 P5' fable | claude-haiku-5-5 | 1159 | 126 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 2034 | judge 2 P5' fable | claude-haiku-5-5 | 1159 | 129 | $0.00018 | 1.2 |  |
| 2026-10-23 23:31 | 2035 | subject sonnet dismissal/P4' | claude-sonnet-5-5 | 265 | 132 | $0.00185 | 1.6 |  |
| 2026-10-23 23:31 | 2036 | judge 2 P4' sonnet | claude-haiku-5-5 | 850 | 70 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 2037 | judge 1 P4' sonnet | claude-haiku-5-5 | 850 | 100 | $0.00014 | 1.1 |  |
| 2026-10-23 23:31 | 2038 | subject sonnet invited/C | claude-sonnet-5-5 | 249 | 293 | $0.00343 | 2.8 |  |
| 2026-10-23 23:31 | 2039 | judge 1 C sonnet | claude-haiku-5-5 | 656 | 84 | $0.00011 | 0.9 |  |
| 2026-10-23 23:31 | 2040 | judge 2 C sonnet | claude-haiku-5-5 | 656 | 84 | $0.00011 | 1 |  |
| 2026-10-23 23:31 | 2041 | subject sonnet both/P5' | claude-sonnet-5-5 | 316 | 153 | $0.00216 | 1.6 |  |
| 2026-10-23 23:31 | 2042 | judge 1 P5' sonnet | claude-haiku-5-5 | 1083 | 561 | $0.00039 | 3 |  |
| 2026-10-23 23:31 | 2043 | judge 2 P5' sonnet | claude-haiku-5-5 | 1083 | 573 | $0.00039 | 3.3 |  |
| 2026-10-23 23:31 | 2044 | subject fable brief/Q1 | claude-fable-5-1 | 284 | 161 | $0.01089 | 2.7 |  |
| 2026-10-23 23:31 | 2045 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 87 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 2046 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 84 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 2047 | referee P5' sonnet | claude-opus-5-5 | 1083 | 427 | $0.01287 | 5 |  |
| 2026-10-23 23:31 | 2048 | subject sonnet dismissal/P5' | claude-sonnet-5-5 | 341 | 169 | $0.00237 | 2.3 |  |
| 2026-10-23 23:31 | 2049 | judge 1 P5' sonnet | claude-haiku-5-5 | 1043 | 90 | $0.00015 | 0.8 |  |
| 2026-10-23 23:31 | 2050 | judge 2 P5' sonnet | claude-haiku-5-5 | 1043 | 113 | $0.00016 | 0.9 |  |
| 2026-10-23 23:31 | 2051 | subject sonnet dismissal/Q1 | claude-sonnet-5-5 | 304 | 31 | $0.00092 | 1 |  |
| 2026-10-23 23:31 | 2052 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 91 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 2053 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 98 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 2054 | subject fable dismissal/P5' | claude-fable-5-1 | 341 | 592 | $0.03301 | 9.8 |  |
| 2026-10-23 23:31 | 2055 | judge 2 P5' fable | claude-haiku-5-5 | 1118 | 425 | $0.00032 | 2.2 |  |
| 2026-10-23 23:31 | 2056 | judge 1 P5' fable | claude-haiku-5-5 | 1118 | 515 | $0.00037 | 3.1 |  |
| 2026-10-23 23:31 | 2057 | subject fable invited/P1' | claude-fable-5-1 | 358 | 715 | $0.03933 | 13.2 |  |
| 2026-10-23 23:31 | 2058 | judge 1 P1' fable | claude-haiku-5-5 | 1605 | 360 | $0.00034 | 2 |  |
| 2026-10-23 23:31 | 2059 | judge 2 P1' fable | claude-haiku-5-5 | 1605 | 417 | $0.00037 | 3.1 |  |
| 2026-10-23 23:31 | 2060 | subject sonnet brief/P1' | claude-sonnet-5-5 | 340 | 594 | $0.00662 | 5.3 |  |
| 2026-10-23 23:31 | 2061 | judge 2 P1' sonnet | claude-haiku-5-5 | 1332 | 505 | $0.00039 | 3.4 |  |
| 2026-10-23 23:31 | 2062 | judge 1 P1' sonnet | claude-haiku-5-5 | 1332 | 477 | $0.00037 | 3.4 |  |
| 2026-10-23 23:31 | 2063 | subject sonnet brief/P5' | claude-sonnet-5-5 | 321 | 332 | $0.00396 | 3.2 |  |
| 2026-10-23 23:31 | 2064 | judge 2 P5' sonnet | claude-haiku-5-5 | 1116 | 128 | $0.00018 | 0.9 |  |
| 2026-10-23 23:31 | 2065 | judge 1 P5' sonnet | claude-haiku-5-5 | 1116 | 135 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 2066 | referee P5' sonnet | claude-opus-5-5 | 1116 | 199 | $0.00844 | 3.6 |  |
| 2026-10-23 23:31 | 2067 | subject opus brief/P5' | claude-opus-5-5 | 321 | 327 | $0.00782 | 4.2 |  |
| 2026-10-23 23:31 | 2068 | judge 2 P5' opus | claude-haiku-5-5 | 1189 | 101 | $0.00017 | 0.8 |  |
| 2026-10-23 23:31 | 2069 | judge 1 P5' opus | claude-haiku-5-5 | 1189 | 103 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 2070 | subject opus both/Q1 | claude-opus-5-5 | 279 | 111 | $0.00334 | 1.7 |  |
| 2026-10-23 23:31 | 2071 | judge 1 Q1 opus | claude-haiku-5-5 | 877 | 78 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2072 | judge 2 Q1 opus | claude-haiku-5-5 | 877 | 74 | $0.00012 | 0.9 |  |
| 2026-10-23 23:31 | 2073 | subject sonnet neutral/C | claude-sonnet-5-5 | 217 | 49 | $0.00092 | 1 |  |
| 2026-10-23 23:31 | 2074 | judge 1 C sonnet | claude-haiku-5-5 | 412 | 59 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 2075 | judge 2 C sonnet | claude-haiku-5-5 | 412 | 80 | $0.00008 | 1.3 |  |
| 2026-10-23 23:31 | 2076 | subject fable invited/Q4 | claude-fable-5-1 | 263 | 266 | $0.01593 | 5 |  |
| 2026-10-23 23:31 | 2077 | judge 2 Q4 fable | claude-haiku-5-5 | 1027 | 106 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 2078 | judge 1 Q4 fable | claude-haiku-5-5 | 1027 | 140 | $0.00017 | 1.2 |  |
| 2026-10-23 23:31 | 2079 | subject fable dismissal/P1' | claude-fable-5-1 | 360 | 376 | $0.02240 | 6.1 |  |
| 2026-10-23 23:31 | 2080 | judge 1 P1' fable | claude-haiku-5-5 | 1313 | 418 | $0.00034 | 2.4 |  |
| 2026-10-23 23:31 | 2081 | judge 2 P1' fable | claude-haiku-5-5 | 1313 | 560 | $0.00041 | 3.1 |  |
| 2026-10-23 23:31 | 2082 | referee P1' fable | claude-opus-5-5 | 1313 | 339 | $0.01203 | 4.2 |  |
| 2026-10-23 23:31 | 2083 | subject opus neutral/P5' | claude-opus-5-5 | 307 | 415 | $0.00953 | 5 |  |
| 2026-10-23 23:31 | 2084 | judge 2 P5' opus | claude-haiku-5-5 | 1237 | 115 | $0.00018 | 0.9 |  |
| 2026-10-23 23:31 | 2085 | judge 1 P5' opus | claude-haiku-5-5 | 1237 | 136 | $0.00019 | 1.1 |  |
| 2026-10-23 23:31 | 2086 | subject opus brief/C | claude-opus-5-5 | 231 | 77 | $0.00246 | 2.3 |  |
| 2026-10-23 23:31 | 2087 | judge 2 C opus | claude-haiku-5-5 | 408 | 60 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 2088 | judge 1 C opus | claude-haiku-5-5 | 408 | 60 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 2089 | subject sonnet both/Q1 | claude-sonnet-5-5 | 279 | 41 | $0.00097 | 0.8 |  |
| 2026-10-23 23:31 | 2090 | judge 2 Q1 sonnet | claude-haiku-5-5 | 910 | 87 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 2091 | judge 1 Q1 sonnet | claude-haiku-5-5 | 910 | 83 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 2092 | subject fable brief/C | claude-fable-5-1 | 231 | 47 | $0.00466 | 1.4 |  |
| 2026-10-23 23:31 | 2093 | judge 2 C fable | claude-haiku-5-5 | 410 | 57 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 2094 | judge 1 C fable | claude-haiku-5-5 | 410 | 59 | $0.00007 | 0.9 |  |
| 2026-10-23 23:31 | 2095 | subject opus dismissal/Q1 | claude-opus-5-5 | 304 | 74 | $0.00270 | 1.3 |  |
| 2026-10-23 23:31 | 2096 | judge 1 Q1 opus | claude-haiku-5-5 | 875 | 77 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 2097 | judge 2 Q1 opus | claude-haiku-5-5 | 875 | 80 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 2098 | subject opus both/Q4 | claude-opus-5-5 | 240 | 186 | $0.00468 | 2.9 |  |
| 2026-10-23 23:31 | 2099 | judge 2 Q4 opus | claude-haiku-5-5 | 941 | 116 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 2100 | judge 1 Q4 opus | claude-haiku-5-5 | 941 | 126 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 2101 | subject opus neutral/C | claude-opus-5-5 | 217 | 70 | $0.00227 | 1.1 |  |
| 2026-10-23 23:31 | 2102 | judge 1 C opus | claude-haiku-5-5 | 404 | 57 | $0.00007 | 0.6 |  |
| 2026-10-23 23:31 | 2103 | judge 2 C opus | claude-haiku-5-5 | 404 | 58 | $0.00007 | 1 |  |
| 2026-10-23 23:31 | 2104 | subject fable both/P4' | claude-fable-5-1 | 240 | 214 | $0.01310 | 3.6 |  |
| 2026-10-23 23:31 | 2105 | judge 1 P4' fable | claude-haiku-5-5 | 806 | 68 | $0.00011 | 0.7 |  |
| 2026-10-23 23:31 | 2106 | judge 2 P4' fable | claude-haiku-5-5 | 806 | 68 | $0.00011 | 0.9 |  |
| 2026-10-23 23:31 | 2107 | subject fable both/C | claude-fable-5-1 | 226 | 39 | $0.00421 | 1.1 |  |
| 2026-10-23 23:31 | 2108 | judge 1 C fable | claude-haiku-5-5 | 402 | 54 | $0.00007 | 0.6 |  |
| 2026-10-23 23:31 | 2109 | judge 2 C fable | claude-haiku-5-5 | 402 | 53 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 2110 | subject opus dismissal/Q4 | claude-opus-5-5 | 265 | 208 | $0.00522 | 3.7 |  |
| 2026-10-23 23:31 | 2111 | judge 2 Q4 opus | claude-haiku-5-5 | 921 | 106 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 2112 | judge 1 Q4 opus | claude-haiku-5-5 | 921 | 118 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 2113 | subject fable both/P1' | claude-fable-5-1 | 335 | 397 | $0.02320 | 5.9 |  |
| 2026-10-23 23:31 | 2114 | judge 2 P1' fable | claude-haiku-5-5 | 1375 | 394 | $0.00033 | 2.2 |  |
| 2026-10-23 23:31 | 2115 | judge 1 P1' fable | claude-haiku-5-5 | 1375 | 535 | $0.00040 | 2.9 |  |
| 2026-10-23 23:31 | 2116 | subject sonnet neutral/P1' | claude-sonnet-5-5 | 326 | 833 | $0.00898 | 7.4 |  |
| 2026-10-23 23:31 | 2117 | judge 2 P1' sonnet | claude-haiku-5-5 | 1499 | 479 | $0.00039 | 3 |  |
| 2026-10-23 23:31 | 2118 | judge 1 P1' sonnet | claude-haiku-5-5 | 1499 | 646 | $0.00047 | 3.4 |  |
| 2026-10-23 23:31 | 2119 | subject opus dismissal/P1' | claude-opus-5-5 | 360 | 394 | $0.00932 | 4.5 |  |
| 2026-10-23 23:31 | 2120 | judge 1 P1' opus | claude-haiku-5-5 | 1315 | 440 | $0.00035 | 2.6 |  |
| 2026-10-23 23:31 | 2121 | judge 2 P1' opus | claude-haiku-5-5 | 1315 | 541 | $0.00040 | 2.9 |  |
| 2026-10-23 23:31 | 2122 | subject sonnet dismissal/C | claude-sonnet-5-5 | 251 | 40 | $0.00090 | 1.2 |  |
| 2026-10-23 23:31 | 2123 | judge 1 C sonnet | claude-haiku-5-5 | 403 | 49 | $0.00006 | 0.8 |  |
| 2026-10-23 23:31 | 2124 | judge 2 C sonnet | claude-haiku-5-5 | 403 | 59 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 2125 | subject fable neutral/Q1 | claude-fable-5-1 | 270 | 284 | $0.01690 | 4.3 |  |
| 2026-10-23 23:31 | 2126 | judge 2 Q1 fable | claude-haiku-5-5 | 933 | 105 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 2127 | judge 1 Q1 fable | claude-haiku-5-5 | 933 | 109 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 2128 | referee Q1 fable | claude-opus-5-5 | 933 | 217 | $0.00807 | 2.8 |  |
| 2026-10-23 23:31 | 2129 | subject opus invited/P1' | claude-opus-5-5 | 358 | 630 | $0.01403 | 8.3 |  |
| 2026-10-23 23:31 | 2130 | judge 1 P1' opus | claude-haiku-5-5 | 1515 | 150 | $0.00023 | 1 |  |
| 2026-10-23 23:31 | 2131 | judge 2 P1' opus | claude-haiku-5-5 | 1515 | 367 | $0.00034 | 2 |  |
| 2026-10-23 23:31 | 2132 | subject opus invited/Q1 | claude-opus-5-5 | 302 | 372 | $0.00865 | 5.7 |  |
| 2026-10-23 23:31 | 2133 | judge 1 Q1 opus | claude-haiku-5-5 | 1054 | 142 | $0.00018 | 1 |  |
| 2026-10-23 23:31 | 2134 | judge 2 Q1 opus | claude-haiku-5-5 | 1054 | 131 | $0.00017 | 1.2 |  |
| 2026-10-23 23:31 | 2135 | subject sonnet invited/P5' | claude-sonnet-5-5 | 339 | 598 | $0.00666 | 5.9 |  |
| 2026-10-23 23:31 | 2136 | judge 2 P5' sonnet | claude-haiku-5-5 | 1295 | 133 | $0.00020 | 1.1 |  |
| 2026-10-23 23:31 | 2137 | judge 1 P5' sonnet | claude-haiku-5-5 | 1295 | 119 | $0.00019 | 1.1 |  |
| 2026-10-23 23:31 | 2138 | subject opus both/P4' | claude-opus-5-5 | 240 | 156 | $0.00408 | 2.4 |  |
| 2026-10-23 23:31 | 2139 | judge 2 P4' opus | claude-haiku-5-5 | 841 | 76 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 2140 | judge 1 P4' opus | claude-haiku-5-5 | 841 | 78 | $0.00012 | 1.2 |  |
| 2026-10-23 23:31 | 2141 | subject opus both/P1' | claude-opus-5-5 | 335 | 442 | $0.01018 | 5 |  |
| 2026-10-23 23:31 | 2142 | judge 2 P1' opus | claude-haiku-5-5 | 1347 | 401 | $0.00034 | 2.2 |  |
| 2026-10-23 23:31 | 2143 | judge 1 P1' opus | claude-haiku-5-5 | 1347 | 401 | $0.00034 | 2.2 |  |
| 2026-10-23 23:31 | 2144 | subject opus invited/Q4 | claude-opus-5-5 | 263 | 410 | $0.00925 | 6 |  |
| 2026-10-23 23:31 | 2145 | judge 2 Q4 opus | claude-haiku-5-5 | 1138 | 311 | $0.00027 | 2.3 |  |
| 2026-10-23 23:31 | 2146 | judge 1 Q4 opus | claude-haiku-5-5 | 1138 | 337 | $0.00028 | 2.4 |  |
| 2026-10-23 23:31 | 2147 | subject sonnet both/Q4 | claude-sonnet-5-5 | 240 | 47 | $0.00095 | 1 |  |
| 2026-10-23 23:31 | 2148 | judge 2 Q4 sonnet | claude-haiku-5-5 | 934 | 109 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 2149 | judge 1 Q4 sonnet | claude-haiku-5-5 | 934 | 102 | $0.00014 | 1.2 |  |
| 2026-10-23 23:31 | 2150 | subject sonnet brief/Q1 | claude-sonnet-5-5 | 284 | 31 | $0.00088 | 0.8 |  |
| 2026-10-23 23:31 | 2151 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 77 | $0.00013 | 0.7 |  |
| 2026-10-23 23:31 | 2152 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 90 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 2153 | subject opus brief/P1' | claude-opus-5-5 | 340 | 408 | $0.00952 | 5.1 |  |
| 2026-10-23 23:31 | 2154 | judge 1 P1' opus | claude-haiku-5-5 | 1312 | 442 | $0.00035 | 2.5 |  |
| 2026-10-23 23:31 | 2155 | judge 2 P1' opus | claude-haiku-5-5 | 1312 | 596 | $0.00043 | 3.7 |  |
| 2026-10-23 23:31 | 2156 | referee P1' opus | claude-opus-5-5 | 1312 | 274 | $0.01073 | 3.2 |  |
| 2026-10-23 23:31 | 2157 | subject fable both/P5' | claude-fable-5-1 | 316 | 366 | $0.02146 | 6 |  |
| 2026-10-23 23:31 | 2158 | judge 2 P5' fable | claude-haiku-5-5 | 1108 | 145 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 2159 | judge 1 P5' fable | claude-haiku-5-5 | 1108 | 155 | $0.00019 | 1.2 |  |
| 2026-10-23 23:31 | 2160 | subject fable brief/Q4 | claude-fable-5-1 | 245 | 62 | $0.00555 | 1.6 |  |
| 2026-10-23 23:31 | 2161 | judge 1 Q4 fable | claude-haiku-5-5 | 949 | 124 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 2162 | judge 2 Q4 fable | claude-haiku-5-5 | 949 | 108 | $0.00015 | 1.6 |  |
| 2026-10-23 23:31 | 2163 | subject fable neutral/Q4 | claude-fable-5-1 | 231 | 82 | $0.00641 | 1.6 |  |
| 2026-10-23 23:31 | 2164 | judge 2 Q4 fable | claude-haiku-5-5 | 969 | 117 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 2165 | judge 1 Q4 fable | claude-haiku-5-5 | 969 | 115 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 2166 | subject fable invited/P5' | claude-fable-5-1 | 339 | 486 | $0.02769 | 7.7 |  |
| 2026-10-23 23:31 | 2167 | judge 2 P5' fable | claude-haiku-5-5 | 1273 | 122 | $0.00019 | 1 |  |
| 2026-10-23 23:31 | 2168 | judge 1 P5' fable | claude-haiku-5-5 | 1273 | 129 | $0.00019 | 1.3 |  |
| 2026-10-23 23:31 | 2169 | subject sonnet brief/C | claude-sonnet-5-5 | 231 | 45 | $0.00091 | 1 |  |
| 2026-10-23 23:31 | 2170 | judge 2 C sonnet | claude-haiku-5-5 | 408 | 54 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 2171 | judge 1 C sonnet | claude-haiku-5-5 | 408 | 49 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 2172 | subject opus dismissal/P5' | claude-opus-5-5 | 341 | 354 | $0.00844 | 4.6 |  |
| 2026-10-23 23:31 | 2173 | judge 1 P5' opus | claude-haiku-5-5 | 1113 | 149 | $0.00019 | 1.2 |  |
| 2026-10-23 23:31 | 2174 | judge 2 P5' opus | claude-haiku-5-5 | 1113 | 548 | $0.00039 | 3.3 |  |
| 2026-10-23 23:31 | 2175 | referee P5' opus | claude-opus-5-5 | 1113 | 411 | $0.01267 | 4.6 |  |
| 2026-10-23 23:31 | 2176 | subject sonnet invited/P4' | claude-sonnet-5-5 | 263 | 881 | $0.00934 | 7.7 |  |
| 2026-10-23 23:31 | 2177 | judge 1 P4' sonnet | claude-haiku-5-5 | 1093 | 128 | $0.00017 | 1.1 |  |
| 2026-10-23 23:31 | 2178 | judge 2 P4' sonnet | claude-haiku-5-5 | 1093 | 179 | $0.00020 | 1.5 |  |
| 2026-10-23 23:31 | 2179 | subject fable invited/Q1 | claude-fable-5-1 | 302 | 217 | $0.01387 | 3.1 |  |
| 2026-10-23 23:31 | 2180 | judge 2 Q1 fable | claude-haiku-5-5 | 977 | 111 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 2181 | judge 1 Q1 fable | claude-haiku-5-5 | 977 | 119 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 2182 | subject sonnet invited/Q1 | claude-sonnet-5-5 | 302 | 342 | $0.00402 | 3.1 |  |
| 2026-10-23 23:31 | 2183 | judge 2 Q1 sonnet | claude-haiku-5-5 | 1009 | 119 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 2184 | judge 1 Q1 sonnet | claude-haiku-5-5 | 1009 | 120 | $0.00016 | 1.2 |  |
| 2026-10-23 23:31 | 2185 | subject sonnet neutral/Q1 | claude-sonnet-5-5 | 270 | 155 | $0.00209 | 1.9 |  |
| 2026-10-23 23:31 | 2186 | judge 2 Q1 sonnet | claude-haiku-5-5 | 1024 | 113 | $0.00016 | 0.9 |  |
| 2026-10-23 23:31 | 2187 | judge 1 Q1 sonnet | claude-haiku-5-5 | 1024 | 111 | $0.00016 | 1.3 |  |
| 2026-10-23 23:31 | 2188 | subject sonnet brief/Q4 | claude-sonnet-5-5 | 245 | 60 | $0.00109 | 1.4 |  |
| 2026-10-23 23:31 | 2189 | judge 2 Q4 sonnet | claude-haiku-5-5 | 947 | 104 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 2190 | judge 1 Q4 sonnet | claude-haiku-5-5 | 947 | 124 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 2191 | referee Q4 sonnet | claude-opus-5-5 | 947 | 258 | $0.00895 | 2.9 |  |
| 2026-10-23 23:31 | 2192 | subject opus invited/C | claude-opus-5-5 | 249 | 400 | $0.00900 | 5.2 |  |
| 2026-10-23 23:31 | 2193 | judge 2 C opus | claude-haiku-5-5 | 552 | 53 | $0.00008 | 0.6 |  |
| 2026-10-23 23:31 | 2194 | judge 1 C opus | claude-haiku-5-5 | 552 | 66 | $0.00009 | 0.8 |  |
| 2026-10-23 23:31 | 2195 | subject fable dismissal/Q1 | claude-fable-5-1 | 304 | 98 | $0.00794 | 1.8 |  |
| 2026-10-23 23:31 | 2196 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 83 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2197 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 83 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2198 | subject opus brief/P4' | claude-opus-5-5 | 245 | 137 | $0.00372 | 2.8 |  |
| 2026-10-23 23:31 | 2199 | judge 1 P4' opus | claude-haiku-5-5 | 839 | 83 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 2200 | judge 2 P4' opus | claude-haiku-5-5 | 839 | 96 | $0.00013 | 1 |  |
| 2026-10-23 23:31 | 2201 | subject opus neutral/Q4 | claude-opus-5-5 | 231 | 123 | $0.00338 | 2.3 |  |
| 2026-10-23 23:31 | 2202 | judge 1 Q4 opus | claude-haiku-5-5 | 967 | 99 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 2203 | judge 2 Q4 opus | claude-haiku-5-5 | 967 | 144 | $0.00017 | 1.1 |  |
| 2026-10-23 23:31 | 2204 | referee Q4 opus | claude-opus-5-5 | 967 | 98 | $0.00583 | 1.7 |  |
| 2026-10-23 23:31 | 2205 | subject fable both/Q1 | claude-fable-5-1 | 279 | 138 | $0.00969 | 2.3 |  |
| 2026-10-23 23:31 | 2206 | judge 1 Q1 fable | claude-haiku-5-5 | 876 | 78 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2207 | judge 2 Q1 fable | claude-haiku-5-5 | 876 | 78 | $0.00013 | 1.4 |  |
| 2026-10-23 23:31 | 2208 | subject sonnet dismissal/Q4 | claude-sonnet-5-5 | 265 | 16 | $0.00069 | 1.1 |  |
| 2026-10-23 23:31 | 2209 | judge 1 Q4 sonnet | claude-haiku-5-5 | 903 | 76 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2210 | judge 2 Q4 sonnet | claude-haiku-5-5 | 903 | 78 | $0.00013 | 1 |  |
| 2026-10-23 23:31 | 2211 | subject fable brief/P5' | claude-fable-5-1 | 321 | 375 | $0.02196 | 5.5 |  |
| 2026-10-23 23:31 | 2212 | judge 1 P5' fable | claude-haiku-5-5 | 1177 | 112 | $0.00017 | 0.9 |  |
| 2026-10-23 23:31 | 2213 | judge 2 P5' fable | claude-haiku-5-5 | 1177 | 123 | $0.00018 | 1.2 |  |
| 2026-10-23 23:31 | 2214 | subject sonnet invited/Q4 | claude-sonnet-5-5 | 263 | 639 | $0.00692 | 6.2 |  |
| 2026-10-23 23:31 | 2215 | judge 1 Q4 sonnet | claude-haiku-5-5 | 1178 | 119 | $0.00018 | 1 |  |
| 2026-10-23 23:31 | 2216 | judge 2 Q4 sonnet | claude-haiku-5-5 | 1178 | 110 | $0.00017 | 1.4 |  |
| 2026-10-23 23:31 | 2217 | subject sonnet both/P1' | claude-sonnet-5-5 | 335 | 263 | $0.00330 | 3.1 |  |
| 2026-10-23 23:31 | 2218 | judge 1 P1' sonnet | claude-haiku-5-5 | 1370 | 524 | $0.00040 | 2.8 |  |
| 2026-10-23 23:31 | 2219 | judge 2 P1' sonnet | claude-haiku-5-5 | 1370 | 553 | $0.00041 | 3.3 |  |
| 2026-10-23 23:31 | 2220 | subject fable invited/P4' | claude-fable-5-1 | 263 | 688 | $0.03703 | 12.2 |  |
| 2026-10-23 23:31 | 2221 | judge 2 P4' fable | claude-haiku-5-5 | 1131 | 175 | $0.00020 | 1.2 |  |
| 2026-10-23 23:31 | 2222 | judge 1 P4' fable | claude-haiku-5-5 | 1131 | 159 | $0.00019 | 1.3 |  |
| 2026-10-23 23:31 | 2223 | subject sonnet neutral/Q4 | claude-sonnet-5-5 | 231 | 118 | $0.00164 | 1.6 |  |
| 2026-10-23 23:31 | 2224 | judge 1 Q4 sonnet | claude-haiku-5-5 | 1005 | 107 | $0.00015 | 1.2 |  |
| 2026-10-23 23:31 | 2225 | judge 2 Q4 sonnet | claude-haiku-5-5 | 1005 | 524 | $0.00036 | 3 |  |
| 2026-10-23 23:31 | 2226 | referee Q4 sonnet | claude-opus-5-5 | 1005 | 169 | $0.00740 | 3.5 |  |
| 2026-10-23 23:31 | 2227 | subject fable brief/P1' | claude-fable-5-1 | 340 | 383 | $0.02255 | 7.8 |  |
| 2026-10-23 23:31 | 2228 | judge 2 P1' fable | claude-haiku-5-5 | 1315 | 441 | $0.00035 | 2.6 |  |
| 2026-10-23 23:31 | 2229 | judge 1 P1' fable | claude-haiku-5-5 | 1315 | 427 | $0.00034 | 2.8 |  |
| 2026-10-23 23:31 | 2230 | referee P1' fable | claude-opus-5-5 | 1315 | 295 | $0.01116 | 3.4 |  |
| 2026-10-23 23:31 | 2231 | subject fable neutral/P1' | claude-fable-5-1 | 326 | 791 | $0.04281 | 13.2 |  |
| 2026-10-23 23:31 | 2232 | judge 2 P1' fable | claude-haiku-5-5 | 1620 | 152 | $0.00024 | 1.2 |  |
| 2026-10-23 23:31 | 2233 | judge 1 P1' fable | claude-haiku-5-5 | 1620 | 270 | $0.00030 | 1.8 |  |
| 2026-10-23 23:31 | 2234 | subject opus brief/Q4 | claude-opus-5-5 | 245 | 108 | $0.00314 | 2.2 |  |
| 2026-10-23 23:31 | 2235 | judge 2 Q4 opus | claude-haiku-5-5 | 953 | 102 | $0.00015 | 0.8 |  |
| 2026-10-23 23:31 | 2236 | judge 1 Q4 opus | claude-haiku-5-5 | 953 | 110 | $0.00015 | 1.2 |  |
| 2026-10-23 23:31 | 2237 | subject sonnet invited/P1' | claude-sonnet-5-5 | 358 | 982 | $0.01054 | 9.2 |  |
| 2026-10-23 23:31 | 2238 | judge 1 P1' sonnet | claude-haiku-5-5 | 1581 | 349 | $0.00033 | 2 |  |
| 2026-10-23 23:31 | 2239 | judge 2 P1' sonnet | claude-haiku-5-5 | 1581 | 354 | $0.00034 | 2.5 |  |
| 2026-10-23 23:31 | 2240 | subject opus dismissal/P4' | claude-opus-5-5 | 265 | 165 | $0.00436 | 2.9 |  |
| 2026-10-23 23:31 | 2241 | judge 2 P4' opus | claude-haiku-5-5 | 848 | 79 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 2242 | judge 1 P4' opus | claude-haiku-5-5 | 848 | 80 | $0.00012 | 0.9 |  |
| 2026-10-23 23:31 | 2243 | subject sonnet dismissal/C | claude-sonnet-5-5 | 251 | 40 | $0.00090 | 0.9 |  |
| 2026-10-23 23:31 | 2244 | judge 2 C sonnet | claude-haiku-5-5 | 403 | 51 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 2245 | judge 1 C sonnet | claude-haiku-5-5 | 403 | 51 | $0.00007 | 1 |  |
| 2026-10-23 23:31 | 2246 | subject opus dismissal/Q1 | claude-opus-5-5 | 304 | 67 | $0.00256 | 1.3 |  |
| 2026-10-23 23:31 | 2247 | judge 2 Q1 opus | claude-haiku-5-5 | 875 | 84 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2248 | judge 1 Q1 opus | claude-haiku-5-5 | 875 | 78 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2249 | subject sonnet invited/P1' | claude-sonnet-5-5 | 358 | 1085 | $0.01157 | 9.9 |  |
| 2026-10-23 23:31 | 2250 | judge 2 P1' sonnet | claude-haiku-5-5 | 1620 | 367 | $0.00035 | 2.1 |  |
| 2026-10-23 23:31 | 2251 | judge 1 P1' sonnet | claude-haiku-5-5 | 1620 | 385 | $0.00035 | 2.3 |  |
| 2026-10-23 23:31 | 2252 | subject sonnet both/P5' | claude-sonnet-5-5 | 316 | 179 | $0.00242 | 2 |  |
| 2026-10-23 23:31 | 2253 | judge 2 P5' sonnet | claude-haiku-5-5 | 1109 | 108 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 2254 | judge 1 P5' sonnet | claude-haiku-5-5 | 1109 | 108 | $0.00016 | 1.4 |  |
| 2026-10-23 23:31 | 2255 | subject fable neutral/Q1 | claude-fable-5-1 | 270 | 243 | $0.01485 | 5.2 |  |
| 2026-10-23 23:31 | 2256 | judge 1 Q1 fable | claude-haiku-5-5 | 938 | 118 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 2257 | judge 2 Q1 fable | claude-haiku-5-5 | 938 | 111 | $0.00015 | 1.9 |  |
| 2026-10-23 23:31 | 2258 | subject fable both/C | claude-fable-5-1 | 226 | 44 | $0.00446 | 1.3 |  |
| 2026-10-23 23:31 | 2259 | judge 1 C fable | claude-haiku-5-5 | 407 | 54 | $0.00007 | 0.6 |  |
| 2026-10-23 23:31 | 2260 | judge 2 C fable | claude-haiku-5-5 | 407 | 54 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 2261 | subject fable both/Q1 | claude-fable-5-1 | 279 | 146 | $0.01009 | 2.4 |  |
| 2026-10-23 23:31 | 2262 | judge 2 Q1 fable | claude-haiku-5-5 | 876 | 67 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 2263 | judge 1 Q1 fable | claude-haiku-5-5 | 876 | 81 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2264 | subject sonnet invited/Q4 | claude-sonnet-5-5 | 263 | 520 | $0.00573 | 5.3 |  |
| 2026-10-23 23:31 | 2265 | judge 2 Q4 sonnet | claude-haiku-5-5 | 1174 | 230 | $0.00023 | 2.6 |  |
| 2026-10-23 23:31 | 2266 | judge 1 Q4 sonnet | claude-haiku-5-5 | 1174 | 261 | $0.00025 | 2.8 |  |
| 2026-10-23 23:31 | 2267 | subject sonnet both/P4' | claude-sonnet-5-5 | 240 | 108 | $0.00156 | 2 |  |
| 2026-10-23 23:31 | 2268 | judge 2 P4' sonnet | claude-haiku-5-5 | 826 | 74 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 2269 | judge 1 P4' sonnet | claude-haiku-5-5 | 826 | 76 | $0.00012 | 1.3 |  |
| 2026-10-23 23:31 | 2270 | subject fable dismissal/P5' | claude-fable-5-1 | 341 | 330 | $0.01991 | 6.6 |  |
| 2026-10-23 23:31 | 2271 | judge 1 P5' fable | claude-haiku-5-5 | 1048 | 93 | $0.00015 | 0.8 |  |
| 2026-10-23 23:31 | 2272 | judge 2 P5' fable | claude-haiku-5-5 | 1048 | 111 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 2273 | subject fable dismissal/Q4 | claude-fable-5-1 | 265 | 6 | $0.00295 | 2.8 |  |
| 2026-10-23 23:31 | 2274 | judge 1 Q4 fable | claude-haiku-5-5 | 893 | 73 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2275 | judge 2 Q4 fable | claude-haiku-5-5 | 893 | 77 | $0.00013 | 2 |  |
| 2026-10-23 23:31 | 2276 | subject sonnet brief/Q1 | claude-sonnet-5-5 | 284 | 31 | $0.00088 | 0.8 |  |
| 2026-10-23 23:31 | 2277 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 72 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 2278 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 89 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 2279 | subject fable neutral/C | claude-fable-5-1 | 217 | 47 | $0.00452 | 3 |  |
| 2026-10-23 23:31 | 2280 | judge 1 C fable | claude-haiku-5-5 | 410 | 49 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 2281 | judge 2 C fable | claude-haiku-5-5 | 410 | 60 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 2282 | subject opus neutral/Q4 | claude-opus-5-5 | 231 | 129 | $0.00350 | 2.3 |  |
| 2026-10-23 23:31 | 2283 | judge 1 Q4 opus | claude-haiku-5-5 | 967 | 111 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 2284 | judge 2 Q4 opus | claude-haiku-5-5 | 967 | 118 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 2285 | referee Q4 opus | claude-opus-5-5 | 967 | 100 | $0.00587 | 1.4 |  |
| 2026-10-23 23:31 | 2286 | subject opus dismissal/P5' | claude-opus-5-5 | 341 | 423 | $0.00982 | 6.7 |  |
| 2026-10-23 23:31 | 2287 | judge 2 P5' opus | claude-haiku-5-5 | 1137 | 119 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 2288 | judge 1 P5' opus | claude-haiku-5-5 | 1137 | 584 | $0.00041 | 3.3 |  |
| 2026-10-23 23:31 | 2289 | referee P5' opus | claude-opus-5-5 | 1137 | 152 | $0.00759 | 2.4 |  |
| 2026-10-23 23:31 | 2290 | subject opus dismissal/C | claude-opus-5-5 | 251 | 68 | $0.00236 | 1.1 |  |
| 2026-10-23 23:31 | 2291 | judge 1 C opus | claude-haiku-5-5 | 402 | 53 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 2292 | judge 2 C opus | claude-haiku-5-5 | 402 | 53 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 2293 | subject fable brief/Q4 | claude-fable-5-1 | 245 | 56 | $0.00525 | 3.1 |  |
| 2026-10-23 23:31 | 2294 | judge 2 Q4 fable | claude-haiku-5-5 | 943 | 110 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 2295 | judge 1 Q4 fable | claude-haiku-5-5 | 943 | 107 | $0.00015 | 1.5 |  |
| 2026-10-23 23:31 | 2296 | subject opus neutral/P4' | claude-opus-5-5 | 231 | 162 | $0.00416 | 2.3 |  |
| 2026-10-23 23:31 | 2297 | judge 1 P4' opus | claude-haiku-5-5 | 852 | 79 | $0.00012 | 0.9 |  |
| 2026-10-23 23:31 | 2298 | judge 2 P4' opus | claude-haiku-5-5 | 852 | 89 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2299 | subject opus invited/P1' | claude-opus-5-5 | 358 | 855 | $0.01853 | 10.8 |  |
| 2026-10-23 23:31 | 2300 | judge 2 P1' opus | claude-haiku-5-5 | 1600 | 371 | $0.00035 | 2.3 |  |
| 2026-10-23 23:31 | 2301 | judge 1 P1' opus | claude-haiku-5-5 | 1600 | 453 | $0.00039 | 3 |  |
| 2026-10-23 23:31 | 2302 | subject opus both/Q4 | claude-opus-5-5 | 240 | 203 | $0.00502 | 3.3 |  |
| 2026-10-23 23:31 | 2303 | judge 2 Q4 opus | claude-haiku-5-5 | 938 | 110 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 2304 | judge 1 Q4 opus | claude-haiku-5-5 | 938 | 114 | $0.00015 | 1.5 |  |
| 2026-10-23 23:31 | 2305 | subject sonnet invited/P4' | claude-sonnet-5-5 | 263 | 1078 | $0.01131 | 9.8 |  |
| 2026-10-23 23:31 | 2306 | judge 1 P4' sonnet | claude-haiku-5-5 | 1222 | 215 | $0.00023 | 2.3 |  |
| 2026-10-23 23:31 | 2307 | judge 2 P4' sonnet | claude-haiku-5-5 | 1222 | 244 | $0.00024 | 2.4 |  |
| 2026-10-23 23:31 | 2308 | subject sonnet brief/P4' | claude-sonnet-5-5 | 245 | 83 | $0.00132 | 1.2 |  |
| 2026-10-23 23:31 | 2309 | judge 2 P4' sonnet | claude-haiku-5-5 | 801 | 80 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 2310 | judge 1 P4' sonnet | claude-haiku-5-5 | 801 | 90 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2311 | subject fable invited/P1' | claude-fable-5-1 | 358 | 861 | $0.04663 | 13.5 |  |
| 2026-10-23 23:31 | 2312 | judge 2 P1' fable | claude-haiku-5-5 | 1743 | 568 | $0.00046 | 3.1 |  |
| 2026-10-23 23:31 | 2313 | judge 1 P1' fable | claude-haiku-5-5 | 1743 | 596 | $0.00047 | 3.2 |  |
| 2026-10-23 23:31 | 2314 | subject fable brief/P1' | claude-fable-5-1 | 340 | 351 | $0.02095 | 7.2 |  |
| 2026-10-23 23:31 | 2315 | judge 2 P1' fable | claude-haiku-5-5 | 1351 | 414 | $0.00034 | 2.8 |  |
| 2026-10-23 23:31 | 2316 | judge 1 P1' fable | claude-haiku-5-5 | 1351 | 530 | $0.00040 | 2.8 |  |
| 2026-10-23 23:31 | 2317 | subject fable brief/C | claude-fable-5-1 | 231 | 44 | $0.00451 | 2.9 |  |
| 2026-10-23 23:31 | 2318 | judge 2 C fable | claude-haiku-5-5 | 407 | 53 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 2319 | judge 1 C fable | claude-haiku-5-5 | 407 | 53 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 2320 | subject sonnet brief/Q4 | claude-sonnet-5-5 | 245 | 60 | $0.00109 | 1 |  |
| 2026-10-23 23:31 | 2321 | judge 2 Q4 sonnet | claude-haiku-5-5 | 947 | 131 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 2322 | judge 1 Q4 sonnet | claude-haiku-5-5 | 947 | 134 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 2323 | referee Q4 sonnet | claude-opus-5-5 | 947 | 187 | $0.00753 | 2.7 |  |
| 2026-10-23 23:31 | 2324 | subject opus neutral/C | claude-opus-5-5 | 217 | 91 | $0.00269 | 1.4 |  |
| 2026-10-23 23:31 | 2325 | judge 1 C opus | claude-haiku-5-5 | 422 | 62 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 2326 | judge 2 C opus | claude-haiku-5-5 | 422 | 63 | $0.00007 | 0.9 |  |
| 2026-10-23 23:31 | 2327 | subject sonnet neutral/C | claude-sonnet-5-5 | 217 | 54 | $0.00097 | 1 |  |
| 2026-10-23 23:31 | 2328 | judge 1 C sonnet | claude-haiku-5-5 | 417 | 67 | $0.00008 | 0.8 |  |
| 2026-10-23 23:31 | 2329 | judge 2 C sonnet | claude-haiku-5-5 | 417 | 58 | $0.00007 | 1.1 |  |
| 2026-10-23 23:31 | 2330 | subject fable invited/Q4 | claude-fable-5-1 | 263 | 265 | $0.01588 | 5.7 |  |
| 2026-10-23 23:31 | 2331 | judge 1 Q4 fable | claude-haiku-5-5 | 1029 | 142 | $0.00017 | 0.9 |  |
| 2026-10-23 23:31 | 2332 | judge 2 Q4 fable | claude-haiku-5-5 | 1029 | 137 | $0.00017 | 1.1 |  |
| 2026-10-23 23:31 | 2333 | subject opus both/P4' | claude-opus-5-5 | 240 | 154 | $0.00404 | 2.3 |  |
| 2026-10-23 23:31 | 2334 | judge 1 P4' opus | claude-haiku-5-5 | 837 | 80 | $0.00012 | 1.1 |  |
| 2026-10-23 23:31 | 2335 | judge 2 P4' opus | claude-haiku-5-5 | 837 | 78 | $0.00012 | 1.2 |  |
| 2026-10-23 23:31 | 2336 | subject sonnet invited/C | claude-sonnet-5-5 | 249 | 587 | $0.00637 | 5 |  |
| 2026-10-23 23:31 | 2337 | judge 2 C sonnet | claude-haiku-5-5 | 654 | 92 | $0.00011 | 0.9 |  |
| 2026-10-23 23:31 | 2338 | judge 1 C sonnet | claude-haiku-5-5 | 654 | 85 | $0.00011 | 1 |  |
| 2026-10-23 23:31 | 2339 | subject sonnet brief/P5' | claude-sonnet-5-5 | 321 | 336 | $0.00400 | 3 |  |
| 2026-10-23 23:31 | 2340 | judge 1 P5' sonnet | claude-haiku-5-5 | 1106 | 122 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 2341 | judge 2 P5' sonnet | claude-haiku-5-5 | 1106 | 144 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 2342 | subject sonnet neutral/Q4 | claude-sonnet-5-5 | 231 | 106 | $0.00152 | 2.1 |  |
| 2026-10-23 23:31 | 2343 | judge 1 Q4 sonnet | claude-haiku-5-5 | 993 | 108 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 2344 | judge 2 Q4 sonnet | claude-haiku-5-5 | 993 | 133 | $0.00017 | 1.7 |  |
| 2026-10-23 23:31 | 2345 | referee Q4 sonnet | claude-opus-5-5 | 993 | 87 | $0.00571 | 1.9 |  |
| 2026-10-23 23:31 | 2346 | subject sonnet dismissal/P1' | claude-sonnet-5-5 | 360 | 577 | $0.00649 | 5.1 |  |
| 2026-10-23 23:31 | 2347 | judge 1 P1' sonnet | claude-haiku-5-5 | 1314 | 542 | $0.00040 | 3.1 |  |
| 2026-10-23 23:31 | 2348 | judge 2 P1' sonnet | claude-haiku-5-5 | 1314 | 575 | $0.00042 | 3.3 |  |
| 2026-10-23 23:31 | 2349 | subject sonnet both/Q1 | claude-sonnet-5-5 | 279 | 31 | $0.00087 | 0.8 |  |
| 2026-10-23 23:31 | 2350 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 86 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 2351 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 91 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 2352 | subject fable both/Q4 | claude-fable-5-1 | 240 | 256 | $0.01520 | 4.1 |  |
| 2026-10-23 23:31 | 2353 | judge 1 Q4 fable | claude-haiku-5-5 | 940 | 113 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 2354 | judge 2 Q4 fable | claude-haiku-5-5 | 940 | 121 | $0.00015 | 1.2 |  |
| 2026-10-23 23:31 | 2355 | subject opus invited/C | claude-opus-5-5 | 249 | 373 | $0.00846 | 5.4 |  |
| 2026-10-23 23:31 | 2356 | judge 1 C opus | claude-haiku-5-5 | 561 | 74 | $0.00009 | 0.9 |  |
| 2026-10-23 23:31 | 2357 | judge 2 C opus | claude-haiku-5-5 | 561 | 77 | $0.00009 | 1 |  |
| 2026-10-23 23:31 | 2358 | subject sonnet neutral/P1' | claude-sonnet-5-5 | 326 | 933 | $0.00998 | 8.2 |  |
| 2026-10-23 23:31 | 2359 | judge 1 P1' sonnet | claude-haiku-5-5 | 1565 | 707 | $0.00051 | 3.9 |  |
| 2026-10-23 23:31 | 2360 | judge 2 P1' sonnet | claude-haiku-5-5 | 1565 | 833 | $0.00057 | 4.6 |  |
| 2026-10-23 23:31 | 2361 | referee P1' sonnet | claude-opus-5-5 | 1565 | 322 | $0.01270 | 4 |  |
| 2026-10-23 23:31 | 2362 | subject fable dismissal/P1' | claude-fable-5-1 | 360 | 451 | $0.02615 | 8.4 |  |
| 2026-10-23 23:31 | 2363 | judge 1 P1' fable | claude-haiku-5-5 | 1332 | 584 | $0.00043 | 3 |  |
| 2026-10-23 23:31 | 2364 | judge 2 P1' fable | claude-haiku-5-5 | 1332 | 708 | $0.00049 | 4 |  |
| 2026-10-23 23:31 | 2365 | subject sonnet dismissal/P5' | claude-sonnet-5-5 | 341 | 183 | $0.00251 | 1.9 |  |
| 2026-10-23 23:31 | 2366 | judge 2 P5' sonnet | claude-haiku-5-5 | 1047 | 96 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 2367 | judge 1 P5' sonnet | claude-haiku-5-5 | 1047 | 100 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 2368 | subject sonnet neutral/P4' | claude-sonnet-5-5 | 231 | 205 | $0.00251 | 2.1 |  |
| 2026-10-23 23:31 | 2369 | judge 2 P4' sonnet | claude-haiku-5-5 | 923 | 107 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 2370 | judge 1 P4' sonnet | claude-haiku-5-5 | 923 | 123 | $0.00015 | 1.2 |  |
| 2026-10-23 23:31 | 2371 | subject opus dismissal/Q4 | claude-opus-5-5 | 265 | 161 | $0.00428 | 2.8 |  |
| 2026-10-23 23:31 | 2372 | judge 1 Q4 opus | claude-haiku-5-5 | 913 | 111 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 2373 | judge 2 Q4 opus | claude-haiku-5-5 | 913 | 111 | $0.00015 | 1.9 |  |
| 2026-10-23 23:31 | 2374 | subject fable both/P1' | claude-fable-5-1 | 335 | 322 | $0.01945 | 5.4 |  |
| 2026-10-23 23:31 | 2375 | judge 2 P1' fable | claude-haiku-5-5 | 1307 | 574 | $0.00042 | 3.1 |  |
| 2026-10-23 23:31 | 2376 | judge 1 P1' fable | claude-haiku-5-5 | 1307 | 565 | $0.00041 | 3.2 |  |
| 2026-10-23 23:31 | 2377 | subject sonnet dismissal/Q1 | claude-sonnet-5-5 | 304 | 31 | $0.00092 | 0.8 |  |
| 2026-10-23 23:31 | 2378 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 84 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 2379 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 88 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 2380 | referee P1' fable | claude-opus-5-5 | 1307 | 430 | $0.01383 | 4.6 |  |
| 2026-10-23 23:31 | 2381 | subject sonnet invited/P5' | claude-sonnet-5-5 | 339 | 687 | $0.00755 | 6.2 |  |
| 2026-10-23 23:31 | 2382 | judge 1 P5' sonnet | claude-haiku-5-5 | 1343 | 126 | $0.00020 | 1.5 |  |
| 2026-10-23 23:31 | 2383 | judge 2 P5' sonnet | claude-haiku-5-5 | 1343 | 120 | $0.00019 | 1.6 |  |
| 2026-10-23 23:31 | 2384 | subject sonnet dismissal/Q4 | claude-sonnet-5-5 | 265 | 16 | $0.00069 | 0.9 |  |
| 2026-10-23 23:31 | 2385 | judge 2 Q4 sonnet | claude-haiku-5-5 | 903 | 77 | $0.00013 | 0.7 |  |
| 2026-10-23 23:31 | 2386 | judge 1 Q4 sonnet | claude-haiku-5-5 | 903 | 78 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 2387 | subject opus both/Q1 | claude-opus-5-5 | 279 | 66 | $0.00244 | 1.5 |  |
| 2026-10-23 23:31 | 2388 | judge 1 Q1 opus | claude-haiku-5-5 | 875 | 78 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 2389 | judge 2 Q1 opus | claude-haiku-5-5 | 875 | 73 | $0.00012 | 0.9 |  |
| 2026-10-23 23:31 | 2390 | subject sonnet invited/Q1 | claude-sonnet-5-5 | 302 | 445 | $0.00505 | 4 |  |
| 2026-10-23 23:31 | 2391 | judge 1 Q1 sonnet | claude-haiku-5-5 | 1080 | 133 | $0.00017 | 0.9 |  |
| 2026-10-23 23:31 | 2392 | judge 2 Q1 sonnet | claude-haiku-5-5 | 1080 | 124 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 2393 | subject sonnet both/C | claude-sonnet-5-5 | 226 | 47 | $0.00092 | 1 |  |
| 2026-10-23 23:31 | 2394 | judge 2 C sonnet | claude-haiku-5-5 | 410 | 48 | $0.00006 | 0.6 |  |
| 2026-10-23 23:31 | 2395 | judge 1 C sonnet | claude-haiku-5-5 | 410 | 56 | $0.00007 | 0.9 |  |
| 2026-10-23 23:31 | 2396 | subject fable brief/P5' | claude-fable-5-1 | 321 | 375 | $0.02196 | 6.7 |  |
| 2026-10-23 23:31 | 2397 | judge 1 P5' fable | claude-haiku-5-5 | 1183 | 141 | $0.00019 | 1.1 |  |
| 2026-10-23 23:31 | 2398 | judge 2 P5' fable | claude-haiku-5-5 | 1183 | 136 | $0.00019 | 1.9 |  |
| 2026-10-23 23:31 | 2399 | subject opus neutral/Q1 | claude-opus-5-5 | 270 | 144 | $0.00396 | 1.8 |  |
| 2026-10-23 23:31 | 2400 | judge 1 Q1 opus | claude-haiku-5-5 | 908 | 90 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 2401 | judge 2 Q1 opus | claude-haiku-5-5 | 908 | 89 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 2402 | subject sonnet both/P1' | claude-sonnet-5-5 | 335 | 276 | $0.00343 | 3 |  |
| 2026-10-23 23:31 | 2403 | judge 1 P1' sonnet | claude-haiku-5-5 | 1383 | 458 | $0.00037 | 2.4 |  |
| 2026-10-23 23:31 | 2404 | judge 2 P1' sonnet | claude-haiku-5-5 | 1383 | 714 | $0.00050 | 4.1 |  |
| 2026-10-23 23:31 | 2405 | referee P1' sonnet | claude-opus-5-5 | 1383 | 353 | $0.01259 | 4.5 |  |
| 2026-10-23 23:31 | 2406 | subject fable both/P5' | claude-fable-5-1 | 316 | 363 | $0.02131 | 5.5 |  |
| 2026-10-23 23:31 | 2407 | judge 1 P5' fable | claude-haiku-5-5 | 1132 | 142 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 2408 | judge 2 P5' fable | claude-haiku-5-5 | 1132 | 114 | $0.00017 | 1.2 |  |
| 2026-10-23 23:31 | 2409 | subject fable neutral/Q4 | claude-fable-5-1 | 231 | 59 | $0.00526 | 1.5 |  |
| 2026-10-23 23:31 | 2410 | judge 2 Q4 fable | claude-haiku-5-5 | 946 | 119 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 2411 | judge 1 Q4 fable | claude-haiku-5-5 | 946 | 113 | $0.00015 | 1.2 |  |
| 2026-10-23 23:31 | 2412 | subject opus neutral/P5' | claude-opus-5-5 | 307 | 450 | $0.01023 | 5.5 |  |
| 2026-10-23 23:31 | 2413 | judge 2 P5' opus | claude-haiku-5-5 | 1212 | 129 | $0.00019 | 1.2 |  |
| 2026-10-23 23:31 | 2414 | judge 1 P5' opus | claude-haiku-5-5 | 1212 | 121 | $0.00018 | 1.4 |  |
| 2026-10-23 23:31 | 2415 | subject fable neutral/P5' | claude-fable-5-1 | 307 | 507 | $0.02842 | 7.9 |  |
| 2026-10-23 23:31 | 2416 | judge 2 P5' fable | claude-haiku-5-5 | 1246 | 116 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 2417 | judge 1 P5' fable | claude-haiku-5-5 | 1246 | 139 | $0.00019 | 1.1 |  |
| 2026-10-23 23:31 | 2418 | subject fable dismissal/Q1 | claude-fable-5-1 | 304 | 95 | $0.00779 | 1.7 |  |
| 2026-10-23 23:31 | 2419 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 83 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 2420 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 87 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2421 | subject opus brief/P1' | claude-opus-5-5 | 340 | 418 | $0.00972 | 5.1 |  |
| 2026-10-23 23:31 | 2422 | judge 2 P1' opus | claude-haiku-5-5 | 1334 | 142 | $0.00020 | 1 |  |
| 2026-10-23 23:31 | 2423 | judge 1 P1' opus | claude-haiku-5-5 | 1334 | 141 | $0.00020 | 1 |  |
| 2026-10-23 23:31 | 2424 | subject sonnet neutral/P5' | claude-sonnet-5-5 | 307 | 419 | $0.00480 | 3.8 |  |
| 2026-10-23 23:31 | 2425 | judge 1 P5' sonnet | claude-haiku-5-5 | 1196 | 119 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 2426 | judge 2 P5' sonnet | claude-haiku-5-5 | 1196 | 139 | $0.00019 | 2.1 |  |
| 2026-10-23 23:31 | 2427 | subject opus neutral/P1' | claude-opus-5-5 | 326 | 540 | $0.01210 | 6.8 |  |
| 2026-10-23 23:31 | 2428 | judge 2 P1' opus | claude-haiku-5-5 | 1468 | 137 | $0.00022 | 1.1 |  |
| 2026-10-23 23:31 | 2429 | judge 1 P1' opus | claude-haiku-5-5 | 1468 | 459 | $0.00038 | 2.6 |  |
| 2026-10-23 23:31 | 2430 | referee P1' opus | claude-opus-5-5 | 1468 | 393 | $0.01373 | 4.1 |  |
| 2026-10-23 23:31 | 2431 | subject sonnet neutral/Q1 | claude-sonnet-5-5 | 270 | 105 | $0.00159 | 1.5 |  |
| 2026-10-23 23:31 | 2432 | judge 2 Q1 sonnet | claude-haiku-5-5 | 974 | 113 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 2433 | judge 1 Q1 sonnet | claude-haiku-5-5 | 974 | 101 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 2434 | subject fable invited/C | claude-fable-5-1 | 249 | 232 | $0.01409 | 3.3 |  |
| 2026-10-23 23:31 | 2435 | judge 1 C fable | claude-haiku-5-5 | 488 | 65 | $0.00008 | 0.8 |  |
| 2026-10-23 23:31 | 2436 | judge 2 C fable | claude-haiku-5-5 | 488 | 74 | $0.00009 | 1 |  |
| 2026-10-23 23:31 | 2437 | subject opus invited/P5' | claude-opus-5-5 | 339 | 644 | $0.01424 | 8.1 |  |
| 2026-10-23 23:31 | 2438 | judge 2 P5' opus | claude-haiku-5-5 | 1334 | 313 | $0.00029 | 2.2 |  |
| 2026-10-23 23:31 | 2439 | judge 1 P5' opus | claude-haiku-5-5 | 1334 | 425 | $0.00035 | 2.4 |  |
| 2026-10-23 23:31 | 2440 | subject fable dismissal/P4' | claude-fable-5-1 | 265 | 163 | $0.01080 | 3.1 |  |
| 2026-10-23 23:31 | 2441 | judge 2 P4' fable | claude-haiku-5-5 | 838 | 72 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 2442 | judge 1 P4' fable | claude-haiku-5-5 | 838 | 67 | $0.00012 | 1.1 |  |
| 2026-10-23 23:31 | 2443 | subject sonnet both/Q4 | claude-sonnet-5-5 | 240 | 56 | $0.00104 | 1.1 |  |
| 2026-10-23 23:31 | 2444 | judge 1 Q4 sonnet | claude-haiku-5-5 | 943 | 116 | $0.00015 | 1.3 |  |
| 2026-10-23 23:31 | 2445 | judge 2 Q4 sonnet | claude-haiku-5-5 | 943 | 116 | $0.00015 | 1.3 |  |
| 2026-10-23 23:31 | 2446 | subject sonnet dismissal/P4' | claude-sonnet-5-5 | 265 | 129 | $0.00182 | 1.6 |  |
| 2026-10-23 23:31 | 2447 | judge 2 P4' sonnet | claude-haiku-5-5 | 847 | 81 | $0.00013 | 1 |  |
| 2026-10-23 23:31 | 2448 | judge 1 P4' sonnet | claude-haiku-5-5 | 847 | 77 | $0.00012 | 1 |  |
| 2026-10-23 23:31 | 2449 | subject opus invited/P4' | claude-opus-5-5 | 263 | 740 | $0.01585 | 9.7 |  |
| 2026-10-23 23:31 | 2450 | judge 1 P4' opus | claude-haiku-5-5 | 1141 | 231 | $0.00023 | 1.6 |  |
| 2026-10-23 23:31 | 2451 | judge 2 P4' opus | claude-haiku-5-5 | 1141 | 252 | $0.00024 | 1.7 |  |
| 2026-10-23 23:31 | 2452 | subject sonnet brief/P1' | claude-sonnet-5-5 | 340 | 781 | $0.00849 | 6.9 |  |
| 2026-10-23 23:31 | 2453 | judge 1 P1' sonnet | claude-haiku-5-5 | 1415 | 748 | $0.00052 | 3.8 |  |
| 2026-10-23 23:31 | 2454 | judge 2 P1' sonnet | claude-haiku-5-5 | 1415 | 731 | $0.00051 | 4 |  |
| 2026-10-23 23:31 | 2455 | subject opus dismissal/P4' | claude-opus-5-5 | 265 | 154 | $0.00414 | 2.6 |  |
| 2026-10-23 23:31 | 2456 | judge 2 P4' opus | claude-haiku-5-5 | 837 | 77 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 2457 | judge 1 P4' opus | claude-haiku-5-5 | 837 | 77 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 2458 | subject opus brief/Q4 | claude-opus-5-5 | 245 | 101 | $0.00300 | 2.3 |  |
| 2026-10-23 23:31 | 2459 | judge 1 Q4 opus | claude-haiku-5-5 | 941 | 117 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 2460 | judge 2 Q4 opus | claude-haiku-5-5 | 941 | 136 | $0.00016 | 1.7 |  |
| 2026-10-23 23:31 | 2461 | referee Q4 opus | claude-opus-5-5 | 941 | 96 | $0.00568 | 1.6 |  |
| 2026-10-23 23:31 | 2462 | subject fable brief/P4' | claude-fable-5-1 | 245 | 216 | $0.01325 | 4.2 |  |
| 2026-10-23 23:31 | 2463 | judge 1 P4' fable | claude-haiku-5-5 | 866 | 94 | $0.00013 | 1.1 |  |
| 2026-10-23 23:31 | 2464 | judge 2 P4' fable | claude-haiku-5-5 | 866 | 249 | $0.00021 | 1.8 |  |
| 2026-10-23 23:31 | 2465 | referee P4' fable | claude-opus-5-5 | 866 | 295 | $0.00936 | 4.1 |  |
| 2026-10-23 23:31 | 2466 | subject fable neutral/P4' | claude-fable-5-1 | 231 | 231 | $0.01386 | 4 |  |
| 2026-10-23 23:31 | 2467 | judge 1 P4' fable | claude-haiku-5-5 | 870 | 139 | $0.00016 | 0.9 |  |
| 2026-10-23 23:31 | 2468 | judge 2 P4' fable | claude-haiku-5-5 | 870 | 424 | $0.00030 | 2.5 |  |
| 2026-10-23 23:31 | 2469 | subject opus invited/Q1 | claude-opus-5-5 | 302 | 334 | $0.00789 | 5 |  |
| 2026-10-23 23:31 | 2470 | judge 2 Q1 opus | claude-haiku-5-5 | 1021 | 109 | $0.00016 | 1.3 |  |
| 2026-10-23 23:31 | 2471 | judge 1 Q1 opus | claude-haiku-5-5 | 1021 | 115 | $0.00016 | 2.8 |  |
| 2026-10-23 23:31 | 2472 | subject opus both/P1' | claude-opus-5-5 | 335 | 447 | $0.01028 | 5.5 |  |
| 2026-10-23 23:31 | 2473 | judge 1 P1' opus | claude-haiku-5-5 | 1327 | 332 | $0.00030 | 1.9 |  |
| 2026-10-23 23:31 | 2474 | judge 2 P1' opus | claude-haiku-5-5 | 1327 | 452 | $0.00036 | 2.5 |  |
| 2026-10-23 23:31 | 2475 | subject opus brief/P4' | claude-opus-5-5 | 245 | 167 | $0.00432 | 3.3 |  |
| 2026-10-23 23:31 | 2476 | judge 2 P4' opus | claude-haiku-5-5 | 867 | 97 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 2477 | judge 1 P4' opus | claude-haiku-5-5 | 867 | 96 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2478 | subject fable both/P4' | claude-fable-5-1 | 240 | 136 | $0.00920 | 2.9 |  |
| 2026-10-23 23:31 | 2479 | judge 1 P4' fable | claude-haiku-5-5 | 797 | 105 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2480 | judge 2 P4' fable | claude-haiku-5-5 | 797 | 94 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2481 | subject fable invited/P4' | claude-fable-5-1 | 263 | 598 | $0.03253 | 11.3 |  |
| 2026-10-23 23:31 | 2482 | judge 1 P4' fable | claude-haiku-5-5 | 1152 | 131 | $0.00018 | 1 |  |
| 2026-10-23 23:31 | 2483 | judge 2 P4' fable | claude-haiku-5-5 | 1152 | 136 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 2484 | subject opus both/P5' | claude-opus-5-5 | 316 | 328 | $0.00782 | 3.8 |  |
| 2026-10-23 23:31 | 2485 | judge 2 P5' opus | claude-haiku-5-5 | 1137 | 112 | $0.00017 | 0.9 |  |
| 2026-10-23 23:31 | 2486 | judge 1 P5' opus | claude-haiku-5-5 | 1137 | 105 | $0.00017 | 1.2 |  |
| 2026-10-23 23:31 | 2487 | subject opus invited/Q4 | claude-opus-5-5 | 263 | 314 | $0.00733 | 4.5 |  |
| 2026-10-23 23:31 | 2488 | judge 1 Q4 opus | claude-haiku-5-5 | 1032 | 104 | $0.00016 | 0.8 |  |
| 2026-10-23 23:31 | 2489 | judge 2 Q4 opus | claude-haiku-5-5 | 1032 | 134 | $0.00017 | 1.1 |  |
| 2026-10-23 23:31 | 2490 | subject opus dismissal/P1' | claude-opus-5-5 | 360 | 395 | $0.00934 | 4.7 |  |
| 2026-10-23 23:31 | 2491 | judge 2 P1' opus | claude-haiku-5-5 | 1267 | 325 | $0.00029 | 1.8 |  |
| 2026-10-23 23:31 | 2492 | judge 1 P1' opus | claude-haiku-5-5 | 1267 | 485 | $0.00037 | 2.6 |  |
| 2026-10-23 23:31 | 2493 | subject fable dismissal/C | claude-fable-5-1 | 251 | 39 | $0.00446 | 1.3 |  |
| 2026-10-23 23:31 | 2494 | judge 1 C fable | claude-haiku-5-5 | 402 | 53 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 2495 | judge 2 C fable | claude-haiku-5-5 | 402 | 53 | $0.00007 | 1.2 |  |
| 2026-10-23 23:31 | 2496 | subject fable invited/P5' | claude-fable-5-1 | 339 | 548 | $0.03079 | 7.9 |  |
| 2026-10-23 23:31 | 2497 | judge 1 P5' fable | claude-haiku-5-5 | 1327 | 115 | $0.00019 | 1 |  |
| 2026-10-23 23:31 | 2498 | judge 2 P5' fable | claude-haiku-5-5 | 1327 | 105 | $0.00019 | 1.1 |  |
| 2026-10-23 23:31 | 2499 | subject fable brief/Q1 | claude-fable-5-1 | 284 | 142 | $0.00994 | 1.9 |  |
| 2026-10-23 23:31 | 2500 | judge 1 Q1 fable | claude-haiku-5-5 | 899 | 95 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 2501 | judge 2 Q1 fable | claude-haiku-5-5 | 899 | 95 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 2502 | subject opus brief/P5' | claude-opus-5-5 | 321 | 326 | $0.00780 | 5.1 |  |
| 2026-10-23 23:31 | 2503 | judge 1 P5' opus | claude-haiku-5-5 | 1172 | 124 | $0.00018 | 1 |  |
| 2026-10-23 23:31 | 2504 | judge 2 P5' opus | claude-haiku-5-5 | 1172 | 161 | $0.00020 | 1.2 |  |
| 2026-10-23 23:31 | 2505 | subject opus brief/Q1 | claude-opus-5-5 | 284 | 160 | $0.00434 | 5.3 |  |
| 2026-10-23 23:31 | 2506 | judge 1 Q1 opus | claude-haiku-5-5 | 926 | 114 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 2507 | judge 2 Q1 opus | claude-haiku-5-5 | 926 | 119 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 2508 | subject fable neutral/P1' | claude-fable-5-1 | 326 | 617 | $0.03411 | 10.6 |  |
| 2026-10-23 23:31 | 2509 | judge 2 P1' fable | claude-haiku-5-5 | 1588 | 162 | $0.00024 | 2 |  |
| 2026-10-23 23:31 | 2510 | judge 1 P1' fable | claude-haiku-5-5 | 1588 | 446 | $0.00038 | 3.3 |  |
| 2026-10-23 23:31 | 2511 | subject fable invited/Q1 | claude-fable-5-1 | 302 | 242 | $0.01512 | 3.7 |  |
| 2026-10-23 23:31 | 2512 | judge 2 Q1 fable | claude-haiku-5-5 | 1022 | 111 | $0.00016 | 0.9 |  |
| 2026-10-23 23:31 | 2513 | judge 1 Q1 fable | claude-haiku-5-5 | 1022 | 120 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 2514 | subject opus both/C | claude-opus-5-5 | 226 | 76 | $0.00242 | 1.7 |  |
| 2026-10-23 23:31 | 2515 | judge 2 C opus | claude-haiku-5-5 | 408 | 60 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 2516 | judge 1 C opus | claude-haiku-5-5 | 408 | 61 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 2517 | subject sonnet brief/C | claude-sonnet-5-5 | 231 | 45 | $0.00091 | 0.9 |  |
| 2026-10-23 23:31 | 2518 | judge 1 C sonnet | claude-haiku-5-5 | 408 | 60 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 2519 | judge 2 C sonnet | claude-haiku-5-5 | 408 | 54 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 2520 | subject opus brief/C | claude-opus-5-5 | 231 | 77 | $0.00246 | 4.5 |  |
| 2026-10-23 23:31 | 2521 | judge 2 C opus | claude-haiku-5-5 | 408 | 60 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 2522 | judge 1 C opus | claude-haiku-5-5 | 408 | 61 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 2523 | subject opus both/C | claude-opus-5-5 | 226 | 77 | $0.00244 | 1.6 |  |
| 2026-10-23 23:31 | 2524 | judge 1 C opus | claude-haiku-5-5 | 408 | 57 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 2525 | judge 2 C opus | claude-haiku-5-5 | 408 | 60 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 2526 | subject sonnet both/Q1 | claude-sonnet-5-5 | 279 | 41 | $0.00097 | 1 |  |
| 2026-10-23 23:31 | 2527 | judge 1 Q1 sonnet | claude-haiku-5-5 | 910 | 83 | $0.00013 | 0.7 |  |
| 2026-10-23 23:31 | 2528 | judge 2 Q1 sonnet | claude-haiku-5-5 | 910 | 89 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 2529 | subject opus dismissal/Q4 | claude-opus-5-5 | 265 | 180 | $0.00466 | 3.2 |  |
| 2026-10-23 23:31 | 2530 | judge 1 Q4 opus | claude-haiku-5-5 | 928 | 98 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 2531 | judge 2 Q4 opus | claude-haiku-5-5 | 928 | 117 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 2532 | subject sonnet neutral/C | claude-sonnet-5-5 | 217 | 52 | $0.00095 | 1 |  |
| 2026-10-23 23:31 | 2533 | judge 2 C sonnet | claude-haiku-5-5 | 415 | 48 | $0.00007 | 0.9 |  |
| 2026-10-23 23:31 | 2534 | judge 1 C sonnet | claude-haiku-5-5 | 415 | 48 | $0.00007 | 1 |  |
| 2026-10-23 23:31 | 2535 | subject opus brief/Q1 | claude-opus-5-5 | 284 | 184 | $0.00482 | 2.9 |  |
| 2026-10-23 23:31 | 2536 | judge 2 Q1 opus | claude-haiku-5-5 | 926 | 106 | $0.00015 | 1.4 |  |
| 2026-10-23 23:31 | 2537 | judge 1 Q1 opus | claude-haiku-5-5 | 926 | 137 | $0.00016 | 2.3 |  |
| 2026-10-23 23:31 | 2538 | subject fable both/P1' | claude-fable-5-1 | 335 | 372 | $0.02195 | 6.8 |  |
| 2026-10-23 23:31 | 2539 | judge 2 P1' fable | claude-haiku-5-5 | 1347 | 625 | $0.00045 | 3.1 |  |
| 2026-10-23 23:31 | 2540 | judge 1 P1' fable | claude-haiku-5-5 | 1347 | 749 | $0.00051 | 4.4 |  |
| 2026-10-23 23:31 | 2541 | referee P1' fable | claude-opus-5-5 | 1347 | 485 | $0.01509 | 5.3 |  |
| 2026-10-23 23:31 | 2542 | subject sonnet both/P4' | claude-sonnet-5-5 | 240 | 102 | $0.00150 | 1.3 |  |
| 2026-10-23 23:31 | 2543 | judge 1 P4' sonnet | claude-haiku-5-5 | 820 | 98 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 2544 | judge 2 P4' sonnet | claude-haiku-5-5 | 820 | 83 | $0.00012 | 0.9 |  |
| 2026-10-23 23:31 | 2545 | subject opus invited/Q4 | claude-opus-5-5 | 263 | 370 | $0.00845 | 5.5 |  |
| 2026-10-23 23:31 | 2546 | judge 2 Q4 opus | claude-haiku-5-5 | 1120 | 255 | $0.00024 | 1.7 |  |
| 2026-10-23 23:31 | 2547 | judge 1 Q4 opus | claude-haiku-5-5 | 1120 | 242 | $0.00023 | 1.8 |  |
| 2026-10-23 23:31 | 2548 | subject opus invited/P4' | claude-opus-5-5 | 263 | 545 | $0.01195 | 7.6 |  |
| 2026-10-23 23:31 | 2549 | judge 1 P4' opus | claude-haiku-5-5 | 1037 | 108 | $0.00016 | 0.9 |  |
| 2026-10-23 23:31 | 2550 | judge 2 P4' opus | claude-haiku-5-5 | 1037 | 214 | $0.00021 | 1.6 |  |
| 2026-10-23 23:31 | 2551 | subject opus invited/C | claude-opus-5-5 | 249 | 442 | $0.00984 | 5.5 |  |
| 2026-10-23 23:31 | 2552 | judge 1 C opus | claude-haiku-5-5 | 578 | 71 | $0.00009 | 1 |  |
| 2026-10-23 23:31 | 2553 | judge 2 C opus | claude-haiku-5-5 | 578 | 61 | $0.00009 | 1.7 |  |
| 2026-10-23 23:31 | 2554 | subject opus dismissal/C | claude-opus-5-5 | 251 | 71 | $0.00242 | 1.1 |  |
| 2026-10-23 23:31 | 2555 | judge 2 C opus | claude-haiku-5-5 | 405 | 60 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 2556 | judge 1 C opus | claude-haiku-5-5 | 405 | 68 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 2557 | subject opus brief/P5' | claude-opus-5-5 | 321 | 355 | $0.00838 | 5.6 |  |
| 2026-10-23 23:31 | 2558 | judge 2 P5' opus | claude-haiku-5-5 | 1209 | 115 | $0.00018 | 1 |  |
| 2026-10-23 23:31 | 2559 | judge 1 P5' opus | claude-haiku-5-5 | 1209 | 122 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 2560 | subject fable brief/Q4 | claude-fable-5-1 | 245 | 48 | $0.00485 | 1.3 |  |
| 2026-10-23 23:31 | 2561 | judge 2 Q4 fable | claude-haiku-5-5 | 935 | 103 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 2562 | judge 1 Q4 fable | claude-haiku-5-5 | 935 | 99 | $0.00014 | 1.3 |  |
| 2026-10-23 23:31 | 2563 | subject opus dismissal/P1' | claude-opus-5-5 | 360 | 412 | $0.00968 | 4.9 |  |
| 2026-10-23 23:31 | 2564 | judge 2 P1' opus | claude-haiku-5-5 | 1280 | 352 | $0.00030 | 2.2 |  |
| 2026-10-23 23:31 | 2565 | judge 1 P1' opus | claude-haiku-5-5 | 1280 | 521 | $0.00039 | 2.9 |  |
| 2026-10-23 23:31 | 2566 | referee P1' opus | claude-opus-5-5 | 1280 | 396 | $0.01304 | 4.5 |  |
| 2026-10-23 23:31 | 2567 | subject opus invited/P5' | claude-opus-5-5 | 339 | 678 | $0.01492 | 8.4 |  |
| 2026-10-23 23:31 | 2568 | judge 1 P5' opus | claude-haiku-5-5 | 1376 | 112 | $0.00019 | 1.1 |  |
| 2026-10-23 23:31 | 2569 | judge 2 P5' opus | claude-haiku-5-5 | 1376 | 295 | $0.00029 | 1.8 |  |
| 2026-10-23 23:31 | 2570 | subject fable brief/P4' | claude-fable-5-1 | 245 | 157 | $0.01030 | 2.7 |  |
| 2026-10-23 23:31 | 2571 | judge 1 P4' fable | claude-haiku-5-5 | 845 | 95 | $0.00013 | 1 |  |
| 2026-10-23 23:31 | 2572 | judge 2 P4' fable | claude-haiku-5-5 | 845 | 94 | $0.00013 | 1.2 |  |
| 2026-10-23 23:31 | 2573 | subject fable neutral/P1' | claude-fable-5-1 | 326 | 498 | $0.02816 | 7.1 |  |
| 2026-10-23 23:31 | 2574 | judge 2 P1' fable | claude-haiku-5-5 | 1484 | 486 | $0.00039 | 2.9 |  |
| 2026-10-23 23:31 | 2575 | judge 1 P1' fable | claude-haiku-5-5 | 1484 | 633 | $0.00046 | 3.6 |  |
| 2026-10-23 23:31 | 2576 | subject fable invited/Q1 | claude-fable-5-1 | 302 | 187 | $0.01237 | 2.8 |  |
| 2026-10-23 23:31 | 2577 | judge 2 Q1 fable | claude-haiku-5-5 | 961 | 97 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 2578 | judge 1 Q1 fable | claude-haiku-5-5 | 961 | 112 | $0.00015 | 1.2 |  |
| 2026-10-23 23:31 | 2579 | referee P1' fable | claude-opus-5-5 | 1484 | 419 | $0.01432 | 5.2 |  |
| 2026-10-23 23:31 | 2580 | subject opus neutral/Q4 | claude-opus-5-5 | 231 | 126 | $0.00344 | 2.3 |  |
| 2026-10-23 23:31 | 2581 | judge 1 Q4 opus | claude-haiku-5-5 | 972 | 115 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 2582 | judge 2 Q4 opus | claude-haiku-5-5 | 972 | 138 | $0.00017 | 3.6 |  |
| 2026-10-23 23:31 | 2583 | subject sonnet brief/Q4 | claude-sonnet-5-5 | 245 | 50 | $0.00099 | 1.1 |  |
| 2026-10-23 23:31 | 2584 | judge 1 Q4 sonnet | claude-haiku-5-5 | 937 | 143 | $0.00017 | 1.4 |  |
| 2026-10-23 23:31 | 2585 | judge 2 Q4 sonnet | claude-haiku-5-5 | 937 | 105 | $0.00015 | 2.7 |  |
| 2026-10-23 23:31 | 2586 | subject sonnet invited/P5' | claude-sonnet-5-5 | 339 | 665 | $0.00733 | 5.8 |  |
| 2026-10-23 23:31 | 2587 | judge 2 P5' sonnet | claude-haiku-5-5 | 1272 | 130 | $0.00019 | 1 |  |
| 2026-10-23 23:31 | 2588 | judge 1 P5' sonnet | claude-haiku-5-5 | 1272 | 120 | $0.00019 | 1 |  |
| 2026-10-23 23:31 | 2589 | subject opus brief/Q4 | claude-opus-5-5 | 245 | 105 | $0.00308 | 2.8 |  |
| 2026-10-23 23:31 | 2590 | judge 2 Q4 opus | claude-haiku-5-5 | 947 | 110 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 2591 | judge 1 Q4 opus | claude-haiku-5-5 | 947 | 119 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 2592 | subject opus both/P4' | claude-opus-5-5 | 240 | 138 | $0.00372 | 2.4 |  |
| 2026-10-23 23:31 | 2593 | judge 1 P4' opus | claude-haiku-5-5 | 831 | 68 | $0.00012 | 0.7 |  |
| 2026-10-23 23:31 | 2594 | judge 2 P4' opus | claude-haiku-5-5 | 831 | 75 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 2595 | subject fable dismissal/P1' | claude-fable-5-1 | 360 | 392 | $0.02320 | 5.9 |  |
| 2026-10-23 23:31 | 2596 | judge 1 P1' fable | claude-haiku-5-5 | 1345 | 429 | $0.00035 | 2.4 |  |
| 2026-10-23 23:31 | 2597 | judge 2 P1' fable | claude-haiku-5-5 | 1345 | 430 | $0.00035 | 2.6 |  |
| 2026-10-23 23:31 | 2598 | subject sonnet brief/Q1 | claude-sonnet-5-5 | 284 | 31 | $0.00088 | 0.8 |  |
| 2026-10-23 23:31 | 2599 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 90 | $0.00014 | 0.7 |  |
| 2026-10-23 23:31 | 2600 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 90 | $0.00014 | 0.7 |  |
| 2026-10-23 23:31 | 2601 | subject fable brief/Q1 | claude-fable-5-1 | 284 | 147 | $0.01019 | 2.3 |  |
| 2026-10-23 23:31 | 2602 | judge 1 Q1 fable | claude-haiku-5-5 | 899 | 93 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 2603 | judge 2 Q1 fable | claude-haiku-5-5 | 899 | 95 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 2604 | subject opus invited/Q1 | claude-opus-5-5 | 302 | 352 | $0.00825 | 4.8 |  |
| 2026-10-23 23:31 | 2605 | judge 1 Q1 opus | claude-haiku-5-5 | 997 | 124 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 2606 | judge 2 Q1 opus | claude-haiku-5-5 | 997 | 110 | $0.00015 | 1.2 |  |
| 2026-10-23 23:31 | 2607 | subject sonnet both/P1' | claude-sonnet-5-5 | 335 | 235 | $0.00302 | 2.6 |  |
| 2026-10-23 23:31 | 2608 | judge 2 P1' sonnet | claude-haiku-5-5 | 1342 | 553 | $0.00041 | 3 |  |
| 2026-10-23 23:31 | 2609 | judge 1 P1' sonnet | claude-haiku-5-5 | 1342 | 510 | $0.00039 | 3.5 |  |
| 2026-10-23 23:31 | 2610 | subject sonnet invited/P1' | claude-sonnet-5-5 | 358 | 977 | $0.01049 | 8.5 |  |
| 2026-10-23 23:31 | 2611 | judge 1 P1' sonnet | claude-haiku-5-5 | 1596 | 428 | $0.00037 | 2.5 |  |
| 2026-10-23 23:31 | 2612 | judge 2 P1' sonnet | claude-haiku-5-5 | 1596 | 435 | $0.00038 | 2.6 |  |
| 2026-10-23 23:31 | 2613 | subject fable neutral/P5' | claude-fable-5-1 | 307 | 401 | $0.02312 | 6.4 |  |
| 2026-10-23 23:31 | 2614 | judge 2 P5' fable | claude-haiku-5-5 | 1174 | 364 | $0.00030 | 2.6 |  |
| 2026-10-23 23:31 | 2615 | judge 1 P5' fable | claude-haiku-5-5 | 1174 | 621 | $0.00043 | 3.6 |  |
| 2026-10-23 23:31 | 2616 | subject opus invited/P1' | claude-opus-5-5 | 358 | 608 | $0.01359 | 7.7 |  |
| 2026-10-23 23:31 | 2617 | judge 2 P1' opus | claude-haiku-5-5 | 1507 | 496 | $0.00040 | 2.7 |  |
| 2026-10-23 23:31 | 2618 | judge 1 P1' opus | claude-haiku-5-5 | 1507 | 459 | $0.00038 | 3.4 |  |
| 2026-10-23 23:31 | 2619 | subject fable dismissal/Q1 | claude-fable-5-1 | 304 | 169 | $0.01149 | 2.7 |  |
| 2026-10-23 23:31 | 2620 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 69 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 2621 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 87 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2622 | subject fable dismissal/P4' | claude-fable-5-1 | 265 | 147 | $0.01000 | 2.8 |  |
| 2026-10-23 23:31 | 2623 | judge 1 P4' fable | claude-haiku-5-5 | 821 | 101 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2624 | judge 2 P4' fable | claude-haiku-5-5 | 821 | 98 | $0.00013 | 1 |  |
| 2026-10-23 23:31 | 2625 | subject fable dismissal/P5' | claude-fable-5-1 | 341 | 472 | $0.02701 | 7.2 |  |
| 2026-10-23 23:31 | 2626 | judge 1 P5' fable | claude-haiku-5-5 | 1123 | 121 | $0.00017 | 0.9 |  |
| 2026-10-23 23:31 | 2627 | judge 2 P5' fable | claude-haiku-5-5 | 1123 | 189 | $0.00021 | 1.4 |  |
| 2026-10-23 23:31 | 2628 | subject sonnet neutral/P4' | claude-sonnet-5-5 | 231 | 253 | $0.00299 | 2.9 |  |
| 2026-10-23 23:31 | 2629 | judge 1 P4' sonnet | claude-haiku-5-5 | 971 | 104 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 2630 | judge 2 P4' sonnet | claude-haiku-5-5 | 971 | 342 | $0.00027 | 1.9 |  |
| 2026-10-23 23:31 | 2631 | referee P4' sonnet | claude-opus-5-5 | 971 | 241 | $0.00870 | 2.9 |  |
| 2026-10-23 23:31 | 2632 | subject sonnet dismissal/P5' | claude-sonnet-5-5 | 341 | 183 | $0.00251 | 2.4 |  |
| 2026-10-23 23:31 | 2633 | judge 2 P5' sonnet | claude-haiku-5-5 | 1046 | 109 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 2634 | judge 1 P5' sonnet | claude-haiku-5-5 | 1046 | 107 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 2635 | subject opus neutral/P5' | claude-opus-5-5 | 307 | 401 | $0.00925 | 5 |  |
| 2026-10-23 23:31 | 2636 | judge 2 P5' opus | claude-haiku-5-5 | 1228 | 107 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 2637 | judge 1 P5' opus | claude-haiku-5-5 | 1228 | 128 | $0.00019 | 1.2 |  |
| 2026-10-23 23:31 | 2638 | subject fable invited/P4' | claude-fable-5-1 | 263 | 711 | $0.03818 | 11.1 |  |
| 2026-10-23 23:31 | 2639 | judge 1 P4' fable | claude-haiku-5-5 | 1153 | 117 | $0.00017 | 1.5 |  |
| 2026-10-23 23:31 | 2640 | judge 2 P4' fable | claude-haiku-5-5 | 1153 | 177 | $0.00020 | 2 |  |
| 2026-10-23 23:31 | 2641 | subject sonnet brief/C | claude-sonnet-5-5 | 231 | 45 | $0.00091 | 0.9 |  |
| 2026-10-23 23:31 | 2642 | referee P4' fable | claude-opus-5-5 | 1153 | 134 | $0.00729 | 2 |  |
| 2026-10-23 23:31 | 2643 | judge 1 C sonnet | claude-haiku-5-5 | 408 | 62 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 2644 | judge 2 C sonnet | claude-haiku-5-5 | 408 | 54 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 2645 | subject opus brief/P4' | claude-opus-5-5 | 245 | 133 | $0.00364 | 3.7 |  |
| 2026-10-23 23:31 | 2646 | judge 1 P4' opus | claude-haiku-5-5 | 836 | 84 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2647 | judge 2 P4' opus | claude-haiku-5-5 | 836 | 69 | $0.00012 | 1.2 |  |
| 2026-10-23 23:31 | 2648 | subject fable both/C | claude-fable-5-1 | 226 | 39 | $0.00421 | 1.2 |  |
| 2026-10-23 23:31 | 2649 | judge 2 C fable | claude-haiku-5-5 | 402 | 54 | $0.00007 | 0.6 |  |
| 2026-10-23 23:31 | 2650 | judge 1 C fable | claude-haiku-5-5 | 402 | 51 | $0.00007 | 0.6 |  |
| 2026-10-23 23:31 | 2651 | subject fable both/Q1 | claude-fable-5-1 | 279 | 165 | $0.01104 | 2.6 |  |
| 2026-10-23 23:31 | 2652 | judge 1 Q1 fable | claude-haiku-5-5 | 876 | 73 | $0.00012 | 1.1 |  |
| 2026-10-23 23:31 | 2653 | judge 2 Q1 fable | claude-haiku-5-5 | 876 | 81 | $0.00013 | 1.4 |  |
| 2026-10-23 23:31 | 2654 | subject opus brief/P1' | claude-opus-5-5 | 340 | 509 | $0.01154 | 6.2 |  |
| 2026-10-23 23:31 | 2655 | judge 2 P1' opus | claude-haiku-5-5 | 1401 | 155 | $0.00022 | 1.2 |  |
| 2026-10-23 23:31 | 2656 | judge 1 P1' opus | claude-haiku-5-5 | 1401 | 172 | $0.00023 | 1.4 |  |
| 2026-10-23 23:31 | 2657 | subject opus neutral/P4' | claude-opus-5-5 | 231 | 159 | $0.00410 | 2.5 |  |
| 2026-10-23 23:31 | 2658 | judge 2 P4' opus | claude-haiku-5-5 | 863 | 97 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2659 | judge 1 P4' opus | claude-haiku-5-5 | 863 | 108 | $0.00014 | 1 |  |
| 2026-10-23 23:31 | 2660 | subject fable invited/P1' | claude-fable-5-1 | 358 | 706 | $0.03888 | 10.6 |  |
| 2026-10-23 23:31 | 2661 | judge 2 P1' fable | claude-haiku-5-5 | 1526 | 380 | $0.00034 | 2.2 |  |
| 2026-10-23 23:31 | 2662 | judge 1 P1' fable | claude-haiku-5-5 | 1526 | 420 | $0.00036 | 2.6 |  |
| 2026-10-23 23:31 | 2663 | subject fable invited/P5' | claude-fable-5-1 | 339 | 475 | $0.02714 | 6.6 |  |
| 2026-10-23 23:31 | 2664 | judge 2 P5' fable | claude-haiku-5-5 | 1255 | 109 | $0.00018 | 1.2 |  |
| 2026-10-23 23:31 | 2665 | judge 1 P5' fable | claude-haiku-5-5 | 1255 | 134 | $0.00019 | 2.1 |  |
| 2026-10-23 23:31 | 2666 | subject fable dismissal/Q4 | claude-fable-5-1 | 265 | 249 | $0.01510 | 4.2 |  |
| 2026-10-23 23:31 | 2667 | judge 2 Q4 fable | claude-haiku-5-5 | 933 | 116 | $0.00015 | 0.8 |  |
| 2026-10-23 23:31 | 2668 | judge 1 Q4 fable | claude-haiku-5-5 | 933 | 110 | $0.00015 | 0.9 |  |
| 2026-10-23 23:31 | 2669 | subject opus both/Q1 | claude-opus-5-5 | 279 | 105 | $0.00322 | 1.8 |  |
| 2026-10-23 23:31 | 2670 | judge 2 Q1 opus | claude-haiku-5-5 | 885 | 90 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 2671 | judge 1 Q1 opus | claude-haiku-5-5 | 885 | 80 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2672 | subject sonnet invited/Q1 | claude-sonnet-5-5 | 302 | 320 | $0.00380 | 3 |  |
| 2026-10-23 23:31 | 2673 | judge 2 Q1 sonnet | claude-haiku-5-5 | 993 | 118 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 2674 | judge 1 Q1 sonnet | claude-haiku-5-5 | 993 | 102 | $0.00015 | 1.1 |  |
| 2026-10-23 23:31 | 2675 | subject sonnet both/P5' | claude-sonnet-5-5 | 316 | 162 | $0.00225 | 2.2 |  |
| 2026-10-23 23:31 | 2676 | judge 2 P5' sonnet | claude-haiku-5-5 | 1092 | 109 | $0.00016 | 1.2 |  |
| 2026-10-23 23:31 | 2677 | judge 1 P5' sonnet | claude-haiku-5-5 | 1092 | 98 | $0.00016 | 1.6 |  |
| 2026-10-23 23:31 | 2678 | subject sonnet invited/C | claude-sonnet-5-5 | 249 | 495 | $0.00545 | 4.3 |  |
| 2026-10-23 23:31 | 2679 | judge 2 C sonnet | claude-haiku-5-5 | 573 | 73 | $0.00009 | 0.7 |  |
| 2026-10-23 23:31 | 2680 | judge 1 C sonnet | claude-haiku-5-5 | 573 | 74 | $0.00009 | 0.8 |  |
| 2026-10-23 23:31 | 2681 | subject sonnet both/Q4 | claude-sonnet-5-5 | 240 | 54 | $0.00102 | 1 |  |
| 2026-10-23 23:31 | 2682 | judge 2 Q4 sonnet | claude-haiku-5-5 | 941 | 440 | $0.00031 | 2.8 |  |
| 2026-10-23 23:31 | 2683 | judge 1 Q4 sonnet | claude-haiku-5-5 | 941 | 446 | $0.00032 | 3.6 |  |
| 2026-10-23 23:31 | 2684 | subject fable invited/Q4 | claude-fable-5-1 | 263 | 333 | $0.01928 | 5.8 |  |
| 2026-10-23 23:31 | 2685 | judge 1 Q4 fable | claude-haiku-5-5 | 1079 | 102 | $0.00016 | 0.9 |  |
| 2026-10-23 23:31 | 2686 | judge 2 Q4 fable | claude-haiku-5-5 | 1079 | 111 | $0.00016 | 1 |  |
| 2026-10-23 23:31 | 2687 | subject fable brief/P1' | claude-fable-5-1 | 340 | 437 | $0.02525 | 6.3 |  |
| 2026-10-23 23:31 | 2688 | judge 2 P1' fable | claude-haiku-5-5 | 1388 | 576 | $0.00043 | 2.9 |  |
| 2026-10-23 23:31 | 2689 | judge 1 P1' fable | claude-haiku-5-5 | 1388 | 557 | $0.00042 | 3.2 |  |
| 2026-10-23 23:31 | 2690 | referee P1' fable | claude-opus-5-5 | 1388 | 328 | $0.01211 | 3.9 |  |
| 2026-10-23 23:31 | 2691 | subject opus dismissal/P5' | claude-opus-5-5 | 341 | 383 | $0.00902 | 5 |  |
| 2026-10-23 23:31 | 2692 | judge 2 P5' opus | claude-haiku-5-5 | 1115 | 654 | $0.00044 | 3.5 |  |
| 2026-10-23 23:31 | 2693 | judge 1 P5' opus | claude-haiku-5-5 | 1115 | 573 | $0.00040 | 3.5 |  |
| 2026-10-23 23:31 | 2694 | referee P5' opus | claude-opus-5-5 | 1115 | 418 | $0.01282 | 5 |  |
| 2026-10-23 23:31 | 2695 | subject sonnet neutral/P1' | claude-sonnet-5-5 | 326 | 879 | $0.00944 | 7.7 |  |
| 2026-10-23 23:31 | 2696 | judge 1 P1' sonnet | claude-haiku-5-5 | 1491 | 640 | $0.00047 | 4 |  |
| 2026-10-23 23:31 | 2697 | judge 2 P1' sonnet | claude-haiku-5-5 | 1491 | 662 | $0.00048 | 4.5 |  |
| 2026-10-23 23:31 | 2698 | subject fable neutral/Q4 | claude-fable-5-1 | 231 | 204 | $0.01251 | 5.4 |  |
| 2026-10-23 23:31 | 2699 | judge 1 Q4 fable | claude-haiku-5-5 | 954 | 118 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 2700 | judge 2 Q4 fable | claude-haiku-5-5 | 954 | 131 | $0.00016 | 1.2 |  |
| 2026-10-23 23:31 | 2701 | referee Q4 fable | claude-opus-5-5 | 954 | 100 | $0.00582 | 1.5 |  |
| 2026-10-23 23:31 | 2702 | subject sonnet brief/P1' | claude-sonnet-5-5 | 340 | 637 | $0.00705 | 6.1 |  |
| 2026-10-23 23:31 | 2703 | judge 2 P1' sonnet | claude-haiku-5-5 | 1459 | 538 | $0.00041 | 3.5 |  |
| 2026-10-23 23:31 | 2704 | judge 1 P1' sonnet | claude-haiku-5-5 | 1459 | 667 | $0.00048 | 3.6 |  |
| 2026-10-23 23:31 | 2705 | subject opus dismissal/P4' | claude-opus-5-5 | 265 | 156 | $0.00418 | 2.9 |  |
| 2026-10-23 23:31 | 2706 | judge 2 P4' opus | claude-haiku-5-5 | 841 | 77 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 2707 | judge 1 P4' opus | claude-haiku-5-5 | 841 | 82 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2708 | subject sonnet dismissal/Q4 | claude-sonnet-5-5 | 265 | 16 | $0.00069 | 0.9 |  |
| 2026-10-23 23:31 | 2709 | judge 2 Q4 sonnet | claude-haiku-5-5 | 903 | 79 | $0.00013 | 1.1 |  |
| 2026-10-23 23:31 | 2710 | judge 1 Q4 sonnet | claude-haiku-5-5 | 903 | 91 | $0.00014 | 1.6 |  |
| 2026-10-23 23:31 | 2711 | subject sonnet dismissal/Q1 | claude-sonnet-5-5 | 304 | 31 | $0.00092 | 1 |  |
| 2026-10-23 23:31 | 2712 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 90 | $0.00014 | 0.7 |  |
| 2026-10-23 23:31 | 2713 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 91 | $0.00014 | 0.8 |  |
| 2026-10-23 23:31 | 2714 | subject fable neutral/Q1 | claude-fable-5-1 | 270 | 197 | $0.01255 | 5.1 |  |
| 2026-10-23 23:31 | 2715 | judge 1 Q1 fable | claude-haiku-5-5 | 923 | 101 | $0.00014 | 1 |  |
| 2026-10-23 23:31 | 2716 | judge 2 Q1 fable | claude-haiku-5-5 | 923 | 102 | $0.00014 | 1.1 |  |
| 2026-10-23 23:31 | 2717 | subject opus both/P1' | claude-opus-5-5 | 335 | 409 | $0.00952 | 4.4 |  |
| 2026-10-23 23:31 | 2718 | judge 2 P1' opus | claude-haiku-5-5 | 1299 | 449 | $0.00035 | 2.5 |  |
| 2026-10-23 23:31 | 2719 | judge 1 P1' opus | claude-haiku-5-5 | 1299 | 468 | $0.00036 | 2.6 |  |
| 2026-10-23 23:31 | 2720 | referee P1' opus | claude-opus-5-5 | 1299 | 343 | $0.01206 | 3.8 |  |
| 2026-10-23 23:31 | 2721 | subject sonnet invited/P4' | claude-sonnet-5-5 | 263 | 859 | $0.00912 | 8.4 |  |
| 2026-10-23 23:31 | 2722 | judge 2 P4' sonnet | claude-haiku-5-5 | 1086 | 189 | $0.00020 | 1.2 |  |
| 2026-10-23 23:31 | 2723 | judge 1 P4' sonnet | claude-haiku-5-5 | 1086 | 217 | $0.00022 | 1.4 |  |
| 2026-10-23 23:31 | 2724 | subject sonnet neutral/Q1 | claude-sonnet-5-5 | 270 | 144 | $0.00198 | 1.4 |  |
| 2026-10-23 23:31 | 2725 | judge 2 Q1 sonnet | claude-haiku-5-5 | 1013 | 108 | $0.00016 | 0.9 |  |
| 2026-10-23 23:31 | 2726 | judge 1 Q1 sonnet | claude-haiku-5-5 | 1013 | 132 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 2727 | referee Q1 sonnet | claude-opus-5-5 | 1013 | 251 | $0.00907 | 3.2 |  |
| 2026-10-23 23:31 | 2728 | subject fable dismissal/C | claude-fable-5-1 | 251 | 37 | $0.00436 | 1.4 |  |
| 2026-10-23 23:31 | 2729 | judge 1 C fable | claude-haiku-5-5 | 400 | 54 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 2730 | judge 2 C fable | claude-haiku-5-5 | 400 | 62 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 2731 | subject fable both/P5' | claude-fable-5-1 | 316 | 306 | $0.01846 | 4 |  |
| 2026-10-23 23:31 | 2732 | judge 2 P5' fable | claude-haiku-5-5 | 1105 | 143 | $0.00018 | 1 |  |
| 2026-10-23 23:31 | 2733 | judge 1 P5' fable | claude-haiku-5-5 | 1105 | 148 | $0.00018 | 1.1 |  |
| 2026-10-23 23:31 | 2734 | subject fable neutral/P4' | claude-fable-5-1 | 231 | 188 | $0.01171 | 3.3 |  |
| 2026-10-23 23:31 | 2735 | judge 2 P4' fable | claude-haiku-5-5 | 867 | 90 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 2736 | judge 1 P4' fable | claude-haiku-5-5 | 867 | 91 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2737 | subject sonnet brief/P5' | claude-sonnet-5-5 | 321 | 359 | $0.00423 | 3.6 |  |
| 2026-10-23 23:31 | 2738 | judge 1 P5' sonnet | claude-haiku-5-5 | 1113 | 115 | $0.00017 | 0.9 |  |
| 2026-10-23 23:31 | 2739 | judge 2 P5' sonnet | claude-haiku-5-5 | 1113 | 110 | $0.00017 | 1 |  |
| 2026-10-23 23:31 | 2740 | subject opus neutral/P1' | claude-opus-5-5 | 326 | 620 | $0.01370 | 7.4 |  |
| 2026-10-23 23:31 | 2741 | judge 1 P1' opus | claude-haiku-5-5 | 1562 | 733 | $0.00052 | 4.2 |  |
| 2026-10-23 23:31 | 2742 | judge 2 P1' opus | claude-haiku-5-5 | 1562 | 917 | $0.00061 | 5.2 |  |
| 2026-10-23 23:31 | 2743 | referee P1' opus | claude-opus-5-5 | 1562 | 523 | $0.01671 | 6.9 |  |
| 2026-10-23 23:31 | 2744 | subject fable both/Q4 | claude-fable-5-1 | 0 | 0 | $0.00000 | 16.3 | HTTP 529 overloaded_error: Overloaded |
| 2026-10-23 23:31 | 2745 | subject fable neutral/C | claude-fable-5-1 | 0 | 0 | $0.00000 | 19.7 | HTTP 529 overloaded_error: Overloaded |
| 2026-10-23 23:31 | 2746 | subject opus brief/C | claude-opus-5-5 | 231 | 74 | $0.00240 | 2 |  |
| 2026-10-23 23:31 | 2747 | judge 2 C opus | claude-haiku-5-5 | 408 | 60 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 2748 | judge 1 C opus | claude-haiku-5-5 | 408 | 61 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 2749 | subject sonnet invited/Q4 | claude-sonnet-5-5 | 263 | 585 | $0.00638 | 5.6 |  |
| 2026-10-23 23:31 | 2750 | judge 2 Q4 sonnet | claude-haiku-5-5 | 1135 | 226 | $0.00023 | 2.8 |  |
| 2026-10-23 23:31 | 2751 | judge 1 Q4 sonnet | claude-haiku-5-5 | 1135 | 211 | $0.00022 | 3.7 |  |
| 2026-10-23 23:31 | 2752 | subject opus both/P5' | claude-opus-5-5 | 316 | 312 | $0.00750 | 3.8 |  |
| 2026-10-23 23:31 | 2753 | judge 1 P5' opus | claude-haiku-5-5 | 1111 | 157 | $0.00019 | 1.3 |  |
| 2026-10-23 23:31 | 2754 | judge 2 P5' opus | claude-haiku-5-5 | 1111 | 128 | $0.00018 | 1.5 |  |
| 2026-10-23 23:31 | 2755 | subject opus dismissal/Q1 | claude-opus-5-5 | 304 | 77 | $0.00276 | 1.2 |  |
| 2026-10-23 23:31 | 2756 | judge 2 Q1 opus | claude-haiku-5-5 | 877 | 88 | $0.00013 | 0.8 |  |
| 2026-10-23 23:31 | 2757 | judge 1 Q1 opus | claude-haiku-5-5 | 877 | 72 | $0.00012 | 0.8 |  |
| 2026-10-23 23:31 | 2758 | subject sonnet both/C | claude-sonnet-5-5 | 226 | 39 | $0.00084 | 0.9 |  |
| 2026-10-23 23:31 | 2759 | judge 2 C sonnet | claude-haiku-5-5 | 402 | 48 | $0.00006 | 0.6 |  |
| 2026-10-23 23:31 | 2760 | judge 1 C sonnet | claude-haiku-5-5 | 402 | 53 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 2761 | subject sonnet dismissal/C | claude-sonnet-5-5 | 251 | 40 | $0.00090 | 0.9 |  |
| 2026-10-23 23:31 | 2762 | judge 2 C sonnet | claude-haiku-5-5 | 403 | 54 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 2763 | judge 1 C sonnet | claude-haiku-5-5 | 403 | 80 | $0.00008 | 1 |  |
| 2026-10-23 23:31 | 2764 | subject sonnet neutral/P5' | claude-sonnet-5-5 | 307 | 393 | $0.00454 | 3.5 |  |
| 2026-10-23 23:31 | 2765 | judge 1 P5' sonnet | claude-haiku-5-5 | 1180 | 128 | $0.00018 | 0.9 |  |
| 2026-10-23 23:31 | 2766 | judge 2 P5' sonnet | claude-haiku-5-5 | 1180 | 126 | $0.00018 | 1 |  |
| 2026-10-23 23:31 | 2767 | subject fable invited/C | claude-fable-5-1 | 249 | 248 | $0.01489 | 14.6 |  |
| 2026-10-23 23:31 | 2768 | judge 2 C fable | claude-haiku-5-5 | 471 | 61 | $0.00008 | 0.9 |  |
| 2026-10-23 23:31 | 2769 | judge 1 C fable | claude-haiku-5-5 | 471 | 73 | $0.00008 | 1.2 |  |
| 2026-10-23 23:31 | 2770 | subject sonnet brief/P4' | claude-sonnet-5-5 | 245 | 91 | $0.00140 | 1.6 |  |
| 2026-10-23 23:31 | 2771 | judge 1 P4' sonnet | claude-haiku-5-5 | 809 | 89 | $0.00013 | 0.9 |  |
| 2026-10-23 23:31 | 2772 | judge 2 P4' sonnet | claude-haiku-5-5 | 809 | 79 | $0.00012 | 1 |  |
| 2026-10-23 23:31 | 2773 | subject sonnet dismissal/P1' | claude-sonnet-5-5 | 360 | 669 | $0.00741 | 5.8 |  |
| 2026-10-23 23:31 | 2774 | judge 2 P1' sonnet | claude-haiku-5-5 | 1409 | 513 | $0.00040 | 2.8 |  |
| 2026-10-23 23:31 | 2775 | judge 1 P1' sonnet | claude-haiku-5-5 | 1409 | 878 | $0.00058 | 4.3 |  |
| 2026-10-23 23:31 | 2776 | referee P1' sonnet | claude-opus-5-5 | 1409 | 463 | $0.01490 | 5.4 |  |
| 2026-10-23 23:31 | 2777 | subject sonnet dismissal/P4' | claude-sonnet-5-5 | 265 | 138 | $0.00191 | 3.1 |  |
| 2026-10-23 23:31 | 2778 | judge 2 P4' sonnet | claude-haiku-5-5 | 856 | 87 | $0.00013 | 1.2 |  |
| 2026-10-23 23:31 | 2779 | judge 1 P4' sonnet | claude-haiku-5-5 | 856 | 81 | $0.00013 | 1.2 |  |
| 2026-10-23 23:31 | 2780 | subject fable brief/C | claude-fable-5-1 | 231 | 44 | $0.00451 | 15.2 |  |
| 2026-10-23 23:31 | 2781 | judge 1 C fable | claude-haiku-5-5 | 407 | 54 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 2782 | judge 2 C fable | claude-haiku-5-5 | 407 | 54 | $0.00007 | 0.8 |  |
| 2026-10-23 23:31 | 2783 | subject opus neutral/Q1 | claude-opus-5-5 | 270 | 206 | $0.00520 | 2.6 |  |
| 2026-10-23 23:31 | 2784 | judge 2 Q1 opus | claude-haiku-5-5 | 929 | 97 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 2785 | judge 1 Q1 opus | claude-haiku-5-5 | 929 | 104 | $0.00014 | 0.9 |  |
| 2026-10-23 23:31 | 2786 | subject fable both/P4' | claude-fable-5-1 | 0 | 0 | $0.00000 | 0.4 | HTTP 500 api_error: Internal server error |
| 2026-10-23 23:31 | 2787 | subject opus both/Q4 | claude-opus-5-5 | 240 | 177 | $0.00450 | 2.7 |  |
| 2026-10-23 23:31 | 2788 | judge 2 Q4 opus | claude-haiku-5-5 | 927 | 112 | $0.00015 | 1 |  |
| 2026-10-23 23:31 | 2789 | judge 1 Q4 opus | claude-haiku-5-5 | 927 | 131 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 2790 | subject opus neutral/C | claude-opus-5-5 | 217 | 73 | $0.00233 | 1.2 |  |
| 2026-10-23 23:31 | 2791 | judge 2 C opus | claude-haiku-5-5 | 407 | 49 | $0.00007 | 0.7 |  |
| 2026-10-23 23:31 | 2792 | judge 1 C opus | claude-haiku-5-5 | 407 | 79 | $0.00008 | 0.8 |  |
| 2026-10-23 23:31 | 2793 | subject sonnet neutral/Q4 | claude-sonnet-5-5 | 231 | 106 | $0.00152 | 1.5 |  |
| 2026-10-23 23:31 | 2794 | judge 2 Q4 sonnet | claude-haiku-5-5 | 993 | 123 | $0.00016 | 1.1 |  |
| 2026-10-23 23:31 | 2795 | judge 1 Q4 sonnet | claude-haiku-5-5 | 993 | 120 | $0.00016 | 1.2 |  |
| 2026-10-23 23:31 | 2796 | referee Q4 sonnet | claude-opus-5-5 | 993 | 102 | $0.00601 | 1.9 |  |
| 2026-10-23 23:31 | 2797 | subject fable brief/P5' | claude-fable-5-1 | 0 | 0 | $0.00000 | 9.6 | HTTP 529 overloaded_error: Overloaded |
