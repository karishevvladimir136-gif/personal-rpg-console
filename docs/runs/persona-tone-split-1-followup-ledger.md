# Persona tone split 1, follow-up (dismissal without «comments»; the stakes axis; certainty × stakes) — the paid-call ledger

Cap $11.11. Spent **$9.0374** in 2303 calls over 3 run(s).
- 2026-10-24 02:43 UTC: persona-tone-split-1-followup: opus+sonnet+fable × 2 arms × 5 probes × n 10, effort medium — 921 calls, $3.0725 → `persona-tone-split-1-followup-run-20261024-024338.json`
- 2026-10-24 03:23 UTC: persona-tone-split-1-followup-stakes: opus+sonnet+fable × 3 arms × 3 stakes probes × n 10, effort medium — 827 calls, $4.0401 → `persona-tone-split-1-followup-stakes-run-20261024-032332.json`
- 2026-10-24 04:42 UTC: persona-tone-split-1-followup-certainty: opus+sonnet+fable × 3 arms × 2 new probes (the 2×2's other two cells from the stakes run) × n 10, effort medium — 555 calls, $1.9248 → `persona-tone-split-1-followup-certainty-run-20261024-044213.json`

Prices per 1M tokens: Opus 5.5 input $4 / output $20; Sonnet 5.5 $2 / $10; Haiku 5.5 $0.10 / $0.50. Fable 5.1 input $10 / output $50. Output tokens include thinking. Judge: claude-haiku-5-5, referee claude-opus-5-5.

| Model — purpose | Calls | Input tokens | Output tokens | Cost |
| --- | --- | --- | --- | --- |
| claude-opus-5-5 — subject | 250 | 80640 | 78205 | $1.8867 |
| claude-haiku-5-5 — judge | 1500 | 1641512 | 226365 | $0.2773 |
| claude-fable-5-1 — subject | 250 | 80640 | 93189 | $5.4659 |
| claude-sonnet-5-5 — subject | 250 | 80640 | 73776 | $0.8990 |
| claude-opus-5-5 — referee | 53 | 60320 | 13360 | $0.5085 |

## Every call

| Run | # | Purpose | Model | Input | Output | Cost | Seconds | Error |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-24 02:43 | 1 | subject opus dismissal-plain/Q4 | claude-opus-5-5 | 261 | 122 | $0.00348 | 2.9 |  |
| 2026-10-24 02:43 | 2 | judge 1 Q4 opus | claude-haiku-5-5 | 908 | 123 | $0.00015 | 1 |  |
| 2026-10-24 02:43 | 3 | judge 2 Q4 opus | claude-haiku-5-5 | 908 | 140 | $0.00016 | 1.1 |  |
| 2026-10-24 02:43 | 4 | subject fable dismissal-plain/P4' | claude-fable-5-1 | 261 | 200 | $0.01261 | 5 |  |
| 2026-10-24 02:43 | 5 | judge 2 P4' fable | claude-haiku-5-5 | 837 | 75 | $0.00012 | 0.9 |  |
| 2026-10-24 02:43 | 6 | judge 1 P4' fable | claude-haiku-5-5 | 837 | 80 | $0.00012 | 0.9 |  |
| 2026-10-24 02:43 | 7 | subject sonnet dismissal-plain/P1' | claude-sonnet-5-5 | 356 | 731 | $0.00802 | 10 |  |
| 2026-10-24 02:43 | 8 | judge 2 P1' sonnet | claude-haiku-5-5 | 1459 | 493 | $0.00039 | 2.9 |  |
| 2026-10-24 02:43 | 9 | judge 1 P1' sonnet | claude-haiku-5-5 | 1459 | 636 | $0.00046 | 3.8 |  |
| 2026-10-24 02:43 | 10 | subject opus dismissal-plain/P1' | claude-opus-5-5 | 356 | 386 | $0.00914 | 5.7 |  |
| 2026-10-24 02:43 | 11 | judge 2 P1' opus | claude-haiku-5-5 | 1293 | 391 | $0.00032 | 2.4 |  |
| 2026-10-24 02:43 | 12 | judge 1 P1' opus | claude-haiku-5-5 | 1293 | 579 | $0.00042 | 3.5 |  |
| 2026-10-24 02:43 | 13 | subject opus dismissal-plain-length/P4' | claude-opus-5-5 | 275 | 134 | $0.00378 | 2.7 |  |
| 2026-10-24 02:43 | 14 | judge 1 P4' opus | claude-haiku-5-5 | 835 | 87 | $0.00013 | 0.7 |  |
| 2026-10-24 02:43 | 15 | judge 2 P4' opus | claude-haiku-5-5 | 835 | 83 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 16 | subject sonnet dismissal-plain/P4' | claude-sonnet-5-5 | 261 | 121 | $0.00173 | 1.6 |  |
| 2026-10-24 02:43 | 17 | judge 2 P4' sonnet | claude-haiku-5-5 | 839 | 87 | $0.00013 | 0.7 |  |
| 2026-10-24 02:43 | 18 | judge 1 P4' sonnet | claude-haiku-5-5 | 839 | 81 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 19 | subject sonnet dismissal-plain/P5' | claude-sonnet-5-5 | 337 | 205 | $0.00272 | 2 |  |
| 2026-10-24 02:43 | 20 | judge 2 P5' sonnet | claude-haiku-5-5 | 1060 | 89 | $0.00015 | 0.8 |  |
| 2026-10-24 02:43 | 21 | judge 1 P5' sonnet | claude-haiku-5-5 | 1060 | 84 | $0.00015 | 1 |  |
| 2026-10-24 02:43 | 22 | subject opus dismissal-plain-length/P1' | claude-opus-5-5 | 370 | 519 | $0.01186 | 6.4 |  |
| 2026-10-24 02:43 | 23 | judge 1 P1' opus | claude-haiku-5-5 | 1367 | 404 | $0.00034 | 2.1 |  |
| 2026-10-24 02:43 | 24 | judge 2 P1' opus | claude-haiku-5-5 | 1367 | 336 | $0.00030 | 2.5 |  |
| 2026-10-24 02:43 | 25 | subject fable dismissal-plain-length/Q1 | claude-fable-5-1 | 314 | 100 | $0.00814 | 2.2 |  |
| 2026-10-24 02:43 | 26 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 78 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 27 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 85 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 28 | subject opus dismissal-plain-length/P5' | claude-opus-5-5 | 351 | 305 | $0.00750 | 4 |  |
| 2026-10-24 02:43 | 29 | judge 2 P5' opus | claude-haiku-5-5 | 1114 | 147 | $0.00018 | 1.1 |  |
| 2026-10-24 02:43 | 30 | judge 1 P5' opus | claude-haiku-5-5 | 1114 | 559 | $0.00039 | 3 |  |
| 2026-10-24 02:43 | 31 | subject opus dismissal-plain/P4' | claude-opus-5-5 | 261 | 182 | $0.00468 | 3.3 |  |
| 2026-10-24 02:43 | 32 | referee P5' opus | claude-opus-5-5 | 1114 | 378 | $0.01202 | 4.3 |  |
| 2026-10-24 02:43 | 33 | judge 1 P4' opus | claude-haiku-5-5 | 873 | 75 | $0.00012 | 1.7 |  |
| 2026-10-24 02:43 | 34 | judge 2 P4' opus | claude-haiku-5-5 | 873 | 83 | $0.00013 | 2 |  |
| 2026-10-24 02:43 | 35 | subject sonnet dismissal-plain-length/Q1 | claude-sonnet-5-5 | 314 | 31 | $0.00094 | 0.8 |  |
| 2026-10-24 02:43 | 36 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 87 | $0.00013 | 3.3 |  |
| 2026-10-24 02:43 | 37 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 92 | $0.00014 | 3.9 |  |
| 2026-10-24 02:43 | 38 | subject fable dismissal-plain-length/Q4 | claude-fable-5-1 | 275 | 224 | $0.01395 | 4 |  |
| 2026-10-24 02:43 | 39 | judge 1 Q4 fable | claude-haiku-5-5 | 926 | 96 | $0.00014 | 2.3 |  |
| 2026-10-24 02:43 | 40 | judge 2 Q4 fable | claude-haiku-5-5 | 926 | 106 | $0.00015 | 3.1 |  |
| 2026-10-24 02:43 | 41 | subject sonnet dismissal-plain-length/P4' | claude-sonnet-5-5 | 275 | 132 | $0.00187 | 1.7 |  |
| 2026-10-24 02:43 | 42 | judge 2 P4' sonnet | claude-haiku-5-5 | 850 | 91 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 43 | judge 1 P4' sonnet | claude-haiku-5-5 | 850 | 78 | $0.00012 | 0.9 |  |
| 2026-10-24 02:43 | 44 | subject sonnet dismissal-plain/Q4 | claude-sonnet-5-5 | 261 | 57 | $0.00109 | 1.2 |  |
| 2026-10-24 02:43 | 45 | judge 1 Q4 sonnet | claude-haiku-5-5 | 944 | 114 | $0.00015 | 1.6 |  |
| 2026-10-24 02:43 | 46 | judge 2 Q4 sonnet | claude-haiku-5-5 | 944 | 123 | $0.00016 | 2.1 |  |
| 2026-10-24 02:43 | 47 | subject fable dismissal-plain/Q4 | claude-fable-5-1 | 261 | 268 | $0.01601 | 6 |  |
| 2026-10-24 02:43 | 48 | judge 2 Q4 fable | claude-haiku-5-5 | 942 | 114 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 49 | judge 1 Q4 fable | claude-haiku-5-5 | 942 | 131 | $0.00016 | 1 |  |
| 2026-10-24 02:43 | 50 | subject fable dismissal-plain/P1' | claude-fable-5-1 | 356 | 522 | $0.02966 | 9.5 |  |
| 2026-10-24 02:43 | 51 | judge 1 P1' fable | claude-haiku-5-5 | 1351 | 379 | $0.00032 | 2.3 |  |
| 2026-10-24 02:43 | 52 | judge 2 P1' fable | claude-haiku-5-5 | 1351 | 409 | $0.00034 | 2.4 |  |
| 2026-10-24 02:43 | 53 | subject fable dismissal-plain-length/P5' | claude-fable-5-1 | 351 | 460 | $0.02651 | 7.8 |  |
| 2026-10-24 02:43 | 54 | judge 2 P5' fable | claude-haiku-5-5 | 1109 | 140 | $0.00018 | 1.1 |  |
| 2026-10-24 02:43 | 55 | judge 1 P5' fable | claude-haiku-5-5 | 1109 | 160 | $0.00019 | 4.6 |  |
| 2026-10-24 02:43 | 56 | subject fable dismissal-plain/Q1 | claude-fable-5-1 | 300 | 208 | $0.01340 | 5 |  |
| 2026-10-24 02:43 | 57 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 78 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 58 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 87 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 59 | subject opus dismissal-plain/Q1 | claude-opus-5-5 | 300 | 88 | $0.00296 | 1.7 |  |
| 2026-10-24 02:43 | 60 | judge 2 Q1 opus | claude-haiku-5-5 | 877 | 81 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 61 | judge 1 Q1 opus | claude-haiku-5-5 | 877 | 80 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 62 | subject opus dismissal-plain-length/Q1 | claude-opus-5-5 | 314 | 81 | $0.00288 | 1.9 |  |
| 2026-10-24 02:43 | 63 | judge 2 Q1 opus | claude-haiku-5-5 | 875 | 78 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 64 | judge 1 Q1 opus | claude-haiku-5-5 | 875 | 78 | $0.00013 | 1 |  |
| 2026-10-24 02:43 | 65 | subject sonnet dismissal-plain-length/P1' | claude-sonnet-5-5 | 370 | 583 | $0.00657 | 5.6 |  |
| 2026-10-24 02:43 | 66 | judge 2 P1' sonnet | claude-haiku-5-5 | 1420 | 169 | $0.00023 | 1.8 |  |
| 2026-10-24 02:43 | 67 | subject sonnet dismissal-plain/Q1 | claude-sonnet-5-5 | 300 | 41 | $0.00101 | 0.8 |  |
| 2026-10-24 02:43 | 68 | judge 1 P1' sonnet | claude-haiku-5-5 | 1420 | 499 | $0.00039 | 4.2 |  |
| 2026-10-24 02:43 | 69 | judge 2 Q1 sonnet | claude-haiku-5-5 | 910 | 83 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 70 | judge 1 Q1 sonnet | claude-haiku-5-5 | 910 | 75 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 71 | referee P1' sonnet | claude-opus-5-5 | 1420 | 562 | $0.01692 | 6.5 |  |
| 2026-10-24 02:43 | 72 | subject fable dismissal-plain-length/P1' | claude-fable-5-1 | 370 | 633 | $0.03535 | 9.7 |  |
| 2026-10-24 02:43 | 73 | judge 2 P1' fable | claude-haiku-5-5 | 1507 | 549 | $0.00043 | 3.1 |  |
| 2026-10-24 02:43 | 74 | judge 1 P1' fable | claude-haiku-5-5 | 1507 | 567 | $0.00043 | 3.2 |  |
| 2026-10-24 02:43 | 75 | subject opus dismissal-plain-length/Q4 | claude-opus-5-5 | 275 | 157 | $0.00424 | 2.9 |  |
| 2026-10-24 02:43 | 76 | judge 2 Q4 opus | claude-haiku-5-5 | 933 | 103 | $0.00014 | 0.8 |  |
| 2026-10-24 02:43 | 77 | judge 1 Q4 opus | claude-haiku-5-5 | 933 | 97 | $0.00014 | 0.9 |  |
| 2026-10-24 02:43 | 78 | subject sonnet dismissal-plain-length/P5' | claude-sonnet-5-5 | 351 | 235 | $0.00305 | 2.1 |  |
| 2026-10-24 02:43 | 79 | judge 2 P5' sonnet | claude-haiku-5-5 | 1046 | 109 | $0.00016 | 0.8 |  |
| 2026-10-24 02:43 | 80 | judge 1 P5' sonnet | claude-haiku-5-5 | 1046 | 101 | $0.00016 | 0.9 |  |
| 2026-10-24 02:43 | 81 | subject fable dismissal-plain/P5' | claude-fable-5-1 | 337 | 426 | $0.02467 | 7.2 |  |
| 2026-10-24 02:43 | 82 | judge 1 P5' fable | claude-haiku-5-5 | 1131 | 132 | $0.00018 | 1.1 |  |
| 2026-10-24 02:43 | 83 | judge 2 P5' fable | claude-haiku-5-5 | 1131 | 564 | $0.00040 | 2.8 |  |
| 2026-10-24 02:43 | 84 | referee P5' fable | claude-opus-5-5 | 1131 | 298 | $0.01048 | 3.7 |  |
| 2026-10-24 02:43 | 85 | subject opus dismissal-plain/P5' | claude-opus-5-5 | 337 | 384 | $0.00903 | 5.5 |  |
| 2026-10-24 02:43 | 86 | judge 1 P5' opus | claude-haiku-5-5 | 1144 | 93 | $0.00016 | 0.8 |  |
| 2026-10-24 02:43 | 87 | judge 2 P5' opus | claude-haiku-5-5 | 1144 | 106 | $0.00017 | 1 |  |
| 2026-10-24 02:43 | 88 | subject sonnet dismissal-plain-length/Q4 | claude-sonnet-5-5 | 275 | 109 | $0.00164 | 1.6 |  |
| 2026-10-24 02:43 | 89 | judge 1 Q4 sonnet | claude-haiku-5-5 | 902 | 75 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 90 | judge 2 Q4 sonnet | claude-haiku-5-5 | 902 | 84 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 91 | subject fable dismissal-plain-length/P4' | claude-fable-5-1 | 275 | 186 | $0.01205 | 3.1 |  |
| 2026-10-24 02:43 | 92 | judge 2 P4' fable | claude-haiku-5-5 | 853 | 103 | $0.00014 | 1 |  |
| 2026-10-24 02:43 | 93 | judge 1 P4' fable | claude-haiku-5-5 | 853 | 103 | $0.00014 | 1 |  |
| 2026-10-24 02:43 | 94 | subject sonnet dismissal-plain-length/P1' | claude-sonnet-5-5 | 370 | 619 | $0.00693 | 5.5 |  |
| 2026-10-24 02:43 | 95 | judge 2 P1' sonnet | claude-haiku-5-5 | 1411 | 412 | $0.00035 | 2.3 |  |
| 2026-10-24 02:43 | 96 | judge 1 P1' sonnet | claude-haiku-5-5 | 1411 | 514 | $0.00040 | 2.8 |  |
| 2026-10-24 02:43 | 97 | subject opus dismissal-plain/P4' | claude-opus-5-5 | 261 | 153 | $0.00410 | 4.5 |  |
| 2026-10-24 02:43 | 98 | judge 1 P4' opus | claude-haiku-5-5 | 845 | 78 | $0.00012 | 0.7 |  |
| 2026-10-24 02:43 | 99 | judge 2 P4' opus | claude-haiku-5-5 | 845 | 79 | $0.00012 | 0.9 |  |
| 2026-10-24 02:43 | 100 | subject opus dismissal-plain-length/P4' | claude-opus-5-5 | 275 | 148 | $0.00406 | 2.8 |  |
| 2026-10-24 02:43 | 101 | judge 2 P4' opus | claude-haiku-5-5 | 839 | 80 | $0.00012 | 1.1 |  |
| 2026-10-24 02:43 | 102 | judge 1 P4' opus | claude-haiku-5-5 | 839 | 81 | $0.00012 | 1.2 |  |
| 2026-10-24 02:43 | 103 | subject fable dismissal-plain/P5' | claude-fable-5-1 | 337 | 543 | $0.03052 | 10.1 |  |
| 2026-10-24 02:43 | 104 | judge 1 P5' fable | claude-haiku-5-5 | 1112 | 124 | $0.00017 | 1 |  |
| 2026-10-24 02:43 | 105 | judge 2 P5' fable | claude-haiku-5-5 | 1112 | 123 | $0.00017 | 1.4 |  |
| 2026-10-24 02:43 | 106 | subject sonnet dismissal-plain/P1' | claude-sonnet-5-5 | 356 | 734 | $0.00805 | 6.4 |  |
| 2026-10-24 02:43 | 107 | judge 1 P1' sonnet | claude-haiku-5-5 | 1423 | 638 | $0.00046 | 3.6 |  |
| 2026-10-24 02:43 | 108 | judge 2 P1' sonnet | claude-haiku-5-5 | 1423 | 646 | $0.00047 | 3.9 |  |
| 2026-10-24 02:43 | 109 | subject opus dismissal-plain-length/Q1 | claude-opus-5-5 | 314 | 82 | $0.00290 | 2.1 |  |
| 2026-10-24 02:43 | 110 | judge 2 Q1 opus | claude-haiku-5-5 | 885 | 79 | $0.00013 | 0.7 |  |
| 2026-10-24 02:43 | 111 | judge 1 Q1 opus | claude-haiku-5-5 | 885 | 86 | $0.00013 | 0.7 |  |
| 2026-10-24 02:43 | 112 | subject opus dismissal-plain/Q4 | claude-opus-5-5 | 261 | 130 | $0.00364 | 2.5 |  |
| 2026-10-24 02:43 | 113 | judge 1 Q4 opus | claude-haiku-5-5 | 932 | 100 | $0.00014 | 1.4 |  |
| 2026-10-24 02:43 | 114 | judge 2 Q4 opus | claude-haiku-5-5 | 932 | 114 | $0.00015 | 1.7 |  |
| 2026-10-24 02:43 | 115 | subject fable dismissal-plain-length/P1' | claude-fable-5-1 | 370 | 531 | $0.03025 | 8.5 |  |
| 2026-10-24 02:43 | 116 | judge 2 P1' fable | claude-haiku-5-5 | 1359 | 316 | $0.00029 | 1.9 |  |
| 2026-10-24 02:43 | 117 | judge 1 P1' fable | claude-haiku-5-5 | 1359 | 386 | $0.00033 | 2.2 |  |
| 2026-10-24 02:43 | 118 | subject sonnet dismissal-plain-length/Q4 | claude-sonnet-5-5 | 275 | 72 | $0.00127 | 1.2 |  |
| 2026-10-24 02:43 | 119 | judge 1 Q4 sonnet | claude-haiku-5-5 | 959 | 107 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 120 | judge 2 Q4 sonnet | claude-haiku-5-5 | 959 | 115 | $0.00015 | 1 |  |
| 2026-10-24 02:43 | 121 | subject sonnet dismissal-plain-length/P5' | claude-sonnet-5-5 | 351 | 269 | $0.00339 | 2.2 |  |
| 2026-10-24 02:43 | 122 | judge 2 P5' sonnet | claude-haiku-5-5 | 1051 | 94 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 123 | judge 1 P5' sonnet | claude-haiku-5-5 | 1051 | 113 | $0.00016 | 1 |  |
| 2026-10-24 02:43 | 124 | subject sonnet dismissal-plain/P4' | claude-sonnet-5-5 | 261 | 137 | $0.00189 | 2 |  |
| 2026-10-24 02:43 | 125 | judge 2 P4' sonnet | claude-haiku-5-5 | 855 | 68 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 126 | judge 1 P4' sonnet | claude-haiku-5-5 | 855 | 82 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 127 | subject sonnet dismissal-plain/P5' | claude-sonnet-5-5 | 337 | 232 | $0.00299 | 2.1 |  |
| 2026-10-24 02:43 | 128 | judge 1 P5' sonnet | claude-haiku-5-5 | 1060 | 90 | $0.00015 | 0.8 |  |
| 2026-10-24 02:43 | 129 | judge 2 P5' sonnet | claude-haiku-5-5 | 1060 | 89 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 130 | subject opus dismissal-plain/Q1 | claude-opus-5-5 | 300 | 71 | $0.00262 | 1.4 |  |
| 2026-10-24 02:43 | 131 | judge 2 Q1 opus | claude-haiku-5-5 | 875 | 73 | $0.00012 | 0.9 |  |
| 2026-10-24 02:43 | 132 | judge 1 Q1 opus | claude-haiku-5-5 | 875 | 88 | $0.00013 | 1 |  |
| 2026-10-24 02:43 | 133 | subject fable dismissal-plain/P4' | claude-fable-5-1 | 261 | 201 | $0.01266 | 5.7 |  |
| 2026-10-24 02:43 | 134 | judge 1 P4' fable | claude-haiku-5-5 | 828 | 72 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 135 | judge 2 P4' fable | claude-haiku-5-5 | 828 | 81 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 136 | subject opus dismissal-plain/P5' | claude-opus-5-5 | 337 | 315 | $0.00765 | 4.2 |  |
| 2026-10-24 02:43 | 137 | judge 2 P5' opus | claude-haiku-5-5 | 1123 | 149 | $0.00019 | 1 |  |
| 2026-10-24 02:43 | 138 | judge 1 P5' opus | claude-haiku-5-5 | 1123 | 142 | $0.00018 | 1.1 |  |
| 2026-10-24 02:43 | 139 | subject opus dismissal-plain-length/P1' | claude-opus-5-5 | 370 | 429 | $0.01006 | 5.9 |  |
| 2026-10-24 02:43 | 140 | judge 2 P1' opus | claude-haiku-5-5 | 1323 | 153 | $0.00021 | 1.1 |  |
| 2026-10-24 02:43 | 141 | judge 1 P1' opus | claude-haiku-5-5 | 1323 | 150 | $0.00021 | 1.2 |  |
| 2026-10-24 02:43 | 142 | subject opus dismissal-plain-length/Q4 | claude-opus-5-5 | 275 | 212 | $0.00534 | 3.5 |  |
| 2026-10-24 02:43 | 143 | judge 2 Q4 opus | claude-haiku-5-5 | 937 | 105 | $0.00015 | 0.7 |  |
| 2026-10-24 02:43 | 144 | judge 1 Q4 opus | claude-haiku-5-5 | 937 | 107 | $0.00015 | 0.7 |  |
| 2026-10-24 02:43 | 145 | subject opus dismissal-plain-length/P5' | claude-opus-5-5 | 351 | 377 | $0.00894 | 5 |  |
| 2026-10-24 02:43 | 146 | judge 1 P5' opus | claude-haiku-5-5 | 1127 | 132 | $0.00018 | 1 |  |
| 2026-10-24 02:43 | 147 | judge 2 P5' opus | claude-haiku-5-5 | 1127 | 150 | $0.00019 | 1.1 |  |
| 2026-10-24 02:43 | 148 | subject sonnet dismissal-plain/Q4 | claude-sonnet-5-5 | 261 | 61 | $0.00113 | 1.1 |  |
| 2026-10-24 02:43 | 149 | referee P5' opus | claude-opus-5-5 | 1127 | 274 | $0.00999 | 3.3 |  |
| 2026-10-24 02:43 | 150 | judge 2 Q4 sonnet | claude-haiku-5-5 | 948 | 268 | $0.00023 | 1.6 |  |
| 2026-10-24 02:43 | 151 | judge 1 Q4 sonnet | claude-haiku-5-5 | 948 | 397 | $0.00029 | 2.2 |  |
| 2026-10-24 02:43 | 152 | subject sonnet dismissal-plain-length/P4' | claude-sonnet-5-5 | 275 | 143 | $0.00198 | 1.8 |  |
| 2026-10-24 02:43 | 153 | referee Q4 sonnet | claude-opus-5-5 | 948 | 219 | $0.00817 | 2.7 |  |
| 2026-10-24 02:43 | 154 | judge 2 P4' sonnet | claude-haiku-5-5 | 861 | 84 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 155 | judge 1 P4' sonnet | claude-haiku-5-5 | 861 | 74 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 156 | subject fable dismissal-plain/Q4 | claude-fable-5-1 | 261 | 37 | $0.00446 | 3.7 |  |
| 2026-10-24 02:43 | 157 | judge 2 Q4 fable | claude-haiku-5-5 | 924 | 127 | $0.00016 | 1.1 |  |
| 2026-10-24 02:43 | 158 | judge 1 Q4 fable | claude-haiku-5-5 | 924 | 102 | $0.00014 | 1.3 |  |
| 2026-10-24 02:43 | 159 | subject fable dismissal-plain-length/Q4 | claude-fable-5-1 | 275 | 277 | $0.01660 | 4.5 |  |
| 2026-10-24 02:43 | 160 | judge 2 Q4 fable | claude-haiku-5-5 | 936 | 110 | $0.00015 | 0.8 |  |
| 2026-10-24 02:43 | 161 | judge 1 Q4 fable | claude-haiku-5-5 | 936 | 129 | $0.00016 | 1 |  |
| 2026-10-24 02:43 | 162 | referee Q4 fable | claude-opus-5-5 | 936 | 97 | $0.00568 | 1.5 |  |
| 2026-10-24 02:43 | 163 | subject sonnet dismissal-plain/Q1 | claude-sonnet-5-5 | 300 | 41 | $0.00101 | 0.9 |  |
| 2026-10-24 02:43 | 164 | judge 1 Q1 sonnet | claude-haiku-5-5 | 910 | 86 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 165 | judge 2 Q1 sonnet | claude-haiku-5-5 | 910 | 92 | $0.00014 | 0.8 |  |
| 2026-10-24 02:43 | 166 | subject fable dismissal-plain-length/Q1 | claude-fable-5-1 | 314 | 87 | $0.00749 | 2 |  |
| 2026-10-24 02:43 | 167 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 73 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 168 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 78 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 169 | subject fable dismissal-plain-length/P4' | claude-fable-5-1 | 275 | 191 | $0.01230 | 3.5 |  |
| 2026-10-24 02:43 | 170 | judge 2 P4' fable | claude-haiku-5-5 | 848 | 84 | $0.00013 | 1.5 |  |
| 2026-10-24 02:43 | 171 | judge 1 P4' fable | claude-haiku-5-5 | 848 | 80 | $0.00012 | 1.6 |  |
| 2026-10-24 02:43 | 172 | subject sonnet dismissal-plain-length/Q1 | claude-sonnet-5-5 | 314 | 31 | $0.00094 | 0.7 |  |
| 2026-10-24 02:43 | 173 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 88 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 174 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 84 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 175 | subject fable dismissal-plain/P1' | claude-fable-5-1 | 356 | 535 | $0.03031 | 9.8 |  |
| 2026-10-24 02:43 | 176 | judge 2 P1' fable | claude-haiku-5-5 | 1442 | 570 | $0.00043 | 3.1 |  |
| 2026-10-24 02:43 | 177 | judge 1 P1' fable | claude-haiku-5-5 | 1442 | 613 | $0.00045 | 3.3 |  |
| 2026-10-24 02:43 | 178 | subject opus dismissal-plain/P1' | claude-opus-5-5 | 356 | 360 | $0.00862 | 4.9 |  |
| 2026-10-24 02:43 | 179 | judge 1 P1' opus | claude-haiku-5-5 | 1253 | 362 | $0.00031 | 2.1 |  |
| 2026-10-24 02:43 | 180 | judge 2 P1' opus | claude-haiku-5-5 | 1253 | 424 | $0.00034 | 2.3 |  |
| 2026-10-24 02:43 | 181 | subject fable dismissal-plain/Q1 | claude-fable-5-1 | 300 | 175 | $0.01175 | 4.6 |  |
| 2026-10-24 02:43 | 182 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 76 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 183 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 73 | $0.00012 | 0.9 |  |
| 2026-10-24 02:43 | 184 | subject fable dismissal-plain-length/P5' | claude-fable-5-1 | 351 | 330 | $0.02001 | 4.7 |  |
| 2026-10-24 02:43 | 185 | judge 2 P5' fable | claude-haiku-5-5 | 1050 | 108 | $0.00016 | 1 |  |
| 2026-10-24 02:43 | 186 | judge 1 P5' fable | claude-haiku-5-5 | 1050 | 95 | $0.00015 | 1.6 |  |
| 2026-10-24 02:43 | 187 | subject sonnet dismissal-plain/Q4 | claude-sonnet-5-5 | 261 | 55 | $0.00107 | 1.1 |  |
| 2026-10-24 02:43 | 188 | judge 2 Q4 sonnet | claude-haiku-5-5 | 942 | 112 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 189 | judge 1 Q4 sonnet | claude-haiku-5-5 | 942 | 115 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 190 | subject opus dismissal-plain-length/P1' | claude-opus-5-5 | 370 | 584 | $0.01316 | 7 |  |
| 2026-10-24 02:43 | 191 | judge 1 P1' opus | claude-haiku-5-5 | 1359 | 390 | $0.00033 | 2 |  |
| 2026-10-24 02:43 | 192 | judge 2 P1' opus | claude-haiku-5-5 | 1359 | 390 | $0.00033 | 2 |  |
| 2026-10-24 02:43 | 193 | subject opus dismissal-plain/P1' | claude-opus-5-5 | 356 | 407 | $0.00956 | 6 |  |
| 2026-10-24 02:43 | 194 | judge 1 P1' opus | claude-haiku-5-5 | 1274 | 340 | $0.00030 | 2.2 |  |
| 2026-10-24 02:43 | 195 | judge 2 P1' opus | claude-haiku-5-5 | 1274 | 449 | $0.00035 | 2.6 |  |
| 2026-10-24 02:43 | 196 | subject opus dismissal-plain-length/Q1 | claude-opus-5-5 | 314 | 67 | $0.00260 | 1.7 |  |
| 2026-10-24 02:43 | 197 | judge 1 Q1 opus | claude-haiku-5-5 | 875 | 78 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 198 | judge 2 Q1 opus | claude-haiku-5-5 | 875 | 69 | $0.00012 | 1 |  |
| 2026-10-24 02:43 | 199 | referee P1' opus | claude-opus-5-5 | 1274 | 300 | $0.01110 | 4.1 |  |
| 2026-10-24 02:43 | 200 | subject sonnet dismissal-plain/P4' | claude-sonnet-5-5 | 261 | 162 | $0.00214 | 1.8 |  |
| 2026-10-24 02:43 | 201 | judge 1 P4' sonnet | claude-haiku-5-5 | 880 | 82 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 202 | judge 2 P4' sonnet | claude-haiku-5-5 | 880 | 91 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 203 | subject sonnet dismissal-plain/Q1 | claude-sonnet-5-5 | 300 | 43 | $0.00103 | 1.1 |  |
| 2026-10-24 02:43 | 204 | judge 1 Q1 sonnet | claude-haiku-5-5 | 912 | 91 | $0.00014 | 0.7 |  |
| 2026-10-24 02:43 | 205 | judge 2 Q1 sonnet | claude-haiku-5-5 | 912 | 84 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 206 | subject opus dismissal-plain-length/Q4 | claude-opus-5-5 | 275 | 157 | $0.00424 | 2.9 |  |
| 2026-10-24 02:43 | 207 | judge 1 Q4 opus | claude-haiku-5-5 | 936 | 99 | $0.00014 | 0.9 |  |
| 2026-10-24 02:43 | 208 | judge 2 Q4 opus | claude-haiku-5-5 | 936 | 103 | $0.00015 | 1 |  |
| 2026-10-24 02:43 | 209 | subject sonnet dismissal-plain/P5' | claude-sonnet-5-5 | 337 | 195 | $0.00262 | 1.9 |  |
| 2026-10-24 02:43 | 210 | judge 2 P5' sonnet | claude-haiku-5-5 | 1046 | 91 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 211 | judge 1 P5' sonnet | claude-haiku-5-5 | 1046 | 104 | $0.00016 | 0.9 |  |
| 2026-10-24 02:43 | 212 | subject fable dismissal-plain/P1' | claude-fable-5-1 | 356 | 546 | $0.03086 | 9.5 |  |
| 2026-10-24 02:43 | 213 | judge 2 P1' fable | claude-haiku-5-5 | 1442 | 405 | $0.00035 | 2.4 |  |
| 2026-10-24 02:43 | 214 | judge 1 P1' fable | claude-haiku-5-5 | 1442 | 497 | $0.00039 | 3 |  |
| 2026-10-24 02:43 | 215 | subject fable dismissal-plain-length/Q1 | claude-fable-5-1 | 314 | 322 | $0.01924 | 4.7 |  |
| 2026-10-24 02:43 | 216 | judge 2 Q1 fable | claude-haiku-5-5 | 899 | 92 | $0.00014 | 0.9 |  |
| 2026-10-24 02:43 | 217 | judge 1 Q1 fable | claude-haiku-5-5 | 899 | 93 | $0.00014 | 0.9 |  |
| 2026-10-24 02:43 | 218 | subject sonnet dismissal-plain/P1' | claude-sonnet-5-5 | 356 | 741 | $0.00812 | 6.9 |  |
| 2026-10-24 02:43 | 219 | judge 1 P1' sonnet | claude-haiku-5-5 | 1428 | 150 | $0.00022 | 1.1 |  |
| 2026-10-24 02:43 | 220 | judge 2 P1' sonnet | claude-haiku-5-5 | 1428 | 147 | $0.00022 | 1.3 |  |
| 2026-10-24 02:43 | 221 | subject opus dismissal-plain/Q4 | claude-opus-5-5 | 261 | 217 | $0.00538 | 4.1 |  |
| 2026-10-24 02:43 | 222 | judge 2 Q4 opus | claude-haiku-5-5 | 936 | 117 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 223 | judge 1 Q4 opus | claude-haiku-5-5 | 936 | 110 | $0.00015 | 1.3 |  |
| 2026-10-24 02:43 | 224 | subject fable dismissal-plain/P4' | claude-fable-5-1 | 261 | 237 | $0.01446 | 4.8 |  |
| 2026-10-24 02:43 | 225 | judge 2 P4' fable | claude-haiku-5-5 | 859 | 95 | $0.00013 | 1.1 |  |
| 2026-10-24 02:43 | 226 | judge 1 P4' fable | claude-haiku-5-5 | 859 | 88 | $0.00013 | 1.2 |  |
| 2026-10-24 02:43 | 227 | subject fable dismissal-plain-length/P5' | claude-fable-5-1 | 351 | 392 | $0.02311 | 6.4 |  |
| 2026-10-24 02:43 | 228 | judge 1 P5' fable | claude-haiku-5-5 | 1115 | 111 | $0.00017 | 1 |  |
| 2026-10-24 02:43 | 229 | judge 2 P5' fable | claude-haiku-5-5 | 1115 | 104 | $0.00016 | 1 |  |
| 2026-10-24 02:43 | 230 | subject opus dismissal-plain-length/P5' | claude-opus-5-5 | 351 | 354 | $0.00848 | 5 |  |
| 2026-10-24 02:43 | 231 | judge 1 P5' opus | claude-haiku-5-5 | 1136 | 118 | $0.00017 | 0.9 |  |
| 2026-10-24 02:43 | 232 | judge 2 P5' opus | claude-haiku-5-5 | 1136 | 165 | $0.00020 | 1.2 |  |
| 2026-10-24 02:43 | 233 | subject fable dismissal-plain-length/P4' | claude-fable-5-1 | 275 | 221 | $0.01380 | 3.9 |  |
| 2026-10-24 02:43 | 234 | judge 2 P4' fable | claude-haiku-5-5 | 853 | 82 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 235 | judge 1 P4' fable | claude-haiku-5-5 | 853 | 83 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 236 | subject opus dismissal-plain-length/P4' | claude-opus-5-5 | 275 | 158 | $0.00426 | 2.8 |  |
| 2026-10-24 02:43 | 237 | judge 2 P4' opus | claude-haiku-5-5 | 854 | 83 | $0.00013 | 1.1 |  |
| 2026-10-24 02:43 | 238 | judge 1 P4' opus | claude-haiku-5-5 | 854 | 84 | $0.00013 | 1.4 |  |
| 2026-10-24 02:43 | 239 | subject opus dismissal-plain/P5' | claude-opus-5-5 | 337 | 388 | $0.00911 | 5.3 |  |
| 2026-10-24 02:43 | 240 | judge 2 P5' opus | claude-haiku-5-5 | 1143 | 121 | $0.00017 | 1 |  |
| 2026-10-24 02:43 | 241 | judge 1 P5' opus | claude-haiku-5-5 | 1143 | 143 | $0.00019 | 1.1 |  |
| 2026-10-24 02:43 | 242 | subject opus dismissal-plain/P4' | claude-opus-5-5 | 261 | 172 | $0.00448 | 3 |  |
| 2026-10-24 02:43 | 243 | judge 2 P4' opus | claude-haiku-5-5 | 844 | 81 | $0.00012 | 0.7 |  |
| 2026-10-24 02:43 | 244 | judge 1 P4' opus | claude-haiku-5-5 | 844 | 75 | $0.00012 | 1.2 |  |
| 2026-10-24 02:43 | 245 | subject sonnet dismissal-plain-length/P5' | claude-sonnet-5-5 | 351 | 247 | $0.00317 | 2.4 |  |
| 2026-10-24 02:43 | 246 | judge 2 P5' sonnet | claude-haiku-5-5 | 1046 | 106 | $0.00016 | 0.9 |  |
| 2026-10-24 02:43 | 247 | judge 1 P5' sonnet | claude-haiku-5-5 | 1046 | 101 | $0.00016 | 0.9 |  |
| 2026-10-24 02:43 | 248 | subject sonnet dismissal-plain-length/P4' | claude-sonnet-5-5 | 275 | 139 | $0.00194 | 1.8 |  |
| 2026-10-24 02:43 | 249 | judge 2 P4' sonnet | claude-haiku-5-5 | 857 | 88 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 250 | judge 1 P4' sonnet | claude-haiku-5-5 | 857 | 84 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 251 | subject fable dismissal-plain-length/P1' | claude-fable-5-1 | 370 | 459 | $0.02665 | 7.1 |  |
| 2026-10-24 02:43 | 252 | judge 1 P1' fable | claude-haiku-5-5 | 1343 | 388 | $0.00033 | 2.2 |  |
| 2026-10-24 02:43 | 253 | judge 2 P1' fable | claude-haiku-5-5 | 1343 | 406 | $0.00034 | 2.3 |  |
| 2026-10-24 02:43 | 254 | subject sonnet dismissal-plain-length/Q1 | claude-sonnet-5-5 | 314 | 41 | $0.00104 | 0.9 |  |
| 2026-10-24 02:43 | 255 | judge 1 Q1 sonnet | claude-haiku-5-5 | 910 | 84 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 256 | judge 2 Q1 sonnet | claude-haiku-5-5 | 910 | 83 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 257 | subject sonnet dismissal-plain-length/P1' | claude-sonnet-5-5 | 370 | 660 | $0.00734 | 6.5 |  |
| 2026-10-24 02:43 | 258 | judge 1 P1' sonnet | claude-haiku-5-5 | 1428 | 327 | $0.00031 | 1.9 |  |
| 2026-10-24 02:43 | 259 | judge 2 P1' sonnet | claude-haiku-5-5 | 1428 | 404 | $0.00034 | 2.1 |  |
| 2026-10-24 02:43 | 260 | subject fable dismissal-plain-length/Q4 | claude-fable-5-1 | 275 | 357 | $0.02060 | 6 |  |
| 2026-10-24 02:43 | 261 | judge 1 Q4 fable | claude-haiku-5-5 | 933 | 109 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 262 | judge 2 Q4 fable | claude-haiku-5-5 | 933 | 117 | $0.00015 | 1 |  |
| 2026-10-24 02:43 | 263 | subject fable dismissal-plain/P5' | claude-fable-5-1 | 337 | 471 | $0.02692 | 8.2 |  |
| 2026-10-24 02:43 | 264 | judge 2 P5' fable | claude-haiku-5-5 | 1108 | 102 | $0.00016 | 0.8 |  |
| 2026-10-24 02:43 | 265 | judge 1 P5' fable | claude-haiku-5-5 | 1108 | 127 | $0.00017 | 1 |  |
| 2026-10-24 02:43 | 266 | subject fable dismissal-plain/Q1 | claude-fable-5-1 | 300 | 216 | $0.01380 | 4.6 |  |
| 2026-10-24 02:43 | 267 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 83 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 268 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 83 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 269 | subject fable dismissal-plain/Q4 | claude-fable-5-1 | 261 | 43 | $0.00476 | 3.4 |  |
| 2026-10-24 02:43 | 270 | judge 1 Q4 fable | claude-haiku-5-5 | 930 | 99 | $0.00014 | 0.9 |  |
| 2026-10-24 02:43 | 271 | judge 2 Q4 fable | claude-haiku-5-5 | 930 | 113 | $0.00015 | 2.2 |  |
| 2026-10-24 02:43 | 272 | subject sonnet dismissal-plain-length/Q4 | claude-sonnet-5-5 | 275 | 91 | $0.00146 | 1.4 |  |
| 2026-10-24 02:43 | 273 | judge 2 Q4 sonnet | claude-haiku-5-5 | 978 | 138 | $0.00017 | 1 |  |
| 2026-10-24 02:43 | 274 | judge 1 Q4 sonnet | claude-haiku-5-5 | 978 | 143 | $0.00017 | 1.2 |  |
| 2026-10-24 02:43 | 275 | subject opus dismissal-plain/Q1 | claude-opus-5-5 | 300 | 67 | $0.00254 | 1.3 |  |
| 2026-10-24 02:43 | 276 | judge 1 Q1 opus | claude-haiku-5-5 | 877 | 70 | $0.00012 | 0.9 |  |
| 2026-10-24 02:43 | 277 | judge 2 Q1 opus | claude-haiku-5-5 | 877 | 80 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 278 | subject sonnet dismissal-plain-length/Q4 | claude-sonnet-5-5 | 275 | 60 | $0.00115 | 1.3 |  |
| 2026-10-24 02:43 | 279 | judge 1 Q4 sonnet | claude-haiku-5-5 | 947 | 128 | $0.00016 | 0.9 |  |
| 2026-10-24 02:43 | 280 | judge 2 Q4 sonnet | claude-haiku-5-5 | 947 | 114 | $0.00015 | 1.6 |  |
| 2026-10-24 02:43 | 281 | subject sonnet dismissal-plain/Q1 | claude-sonnet-5-5 | 300 | 41 | $0.00101 | 2.6 |  |
| 2026-10-24 02:43 | 282 | judge 2 Q1 sonnet | claude-haiku-5-5 | 910 | 86 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 283 | judge 1 Q1 sonnet | claude-haiku-5-5 | 910 | 82 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 284 | subject fable dismissal-plain/P5' | claude-fable-5-1 | 337 | 618 | $0.03427 | 10.8 |  |
| 2026-10-24 02:43 | 285 | judge 2 P5' fable | claude-haiku-5-5 | 1123 | 116 | $0.00017 | 1.2 |  |
| 2026-10-24 02:43 | 286 | judge 1 P5' fable | claude-haiku-5-5 | 1123 | 121 | $0.00017 | 1.3 |  |
| 2026-10-24 02:43 | 287 | subject fable dismissal-plain-length/Q1 | claude-fable-5-1 | 314 | 112 | $0.00874 | 2.3 |  |
| 2026-10-24 02:43 | 288 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 87 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 289 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 87 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 290 | subject opus dismissal-plain/P1' | claude-opus-5-5 | 356 | 494 | $0.01130 | 7.4 |  |
| 2026-10-24 02:43 | 291 | judge 1 P1' opus | claude-haiku-5-5 | 1317 | 409 | $0.00034 | 2.2 |  |
| 2026-10-24 02:43 | 292 | judge 2 P1' opus | claude-haiku-5-5 | 1317 | 432 | $0.00035 | 2.4 |  |
| 2026-10-24 02:43 | 293 | subject sonnet dismissal-plain/Q4 | claude-sonnet-5-5 | 261 | 49 | $0.00101 | 1 |  |
| 2026-10-24 02:43 | 294 | judge 2 Q4 sonnet | claude-haiku-5-5 | 936 | 107 | $0.00015 | 1.3 |  |
| 2026-10-24 02:43 | 295 | judge 1 Q4 sonnet | claude-haiku-5-5 | 936 | 113 | $0.00015 | 1.9 |  |
| 2026-10-24 02:43 | 296 | subject opus dismissal-plain-length/P5' | claude-opus-5-5 | 351 | 424 | $0.00988 | 5.6 |  |
| 2026-10-24 02:43 | 297 | judge 1 P5' opus | claude-haiku-5-5 | 1113 | 137 | $0.00018 | 1.1 |  |
| 2026-10-24 02:43 | 298 | judge 2 P5' opus | claude-haiku-5-5 | 1113 | 540 | $0.00038 | 2.8 |  |
| 2026-10-24 02:43 | 299 | referee P5' opus | claude-opus-5-5 | 1113 | 312 | $0.01069 | 3.7 |  |
| 2026-10-24 02:43 | 300 | subject sonnet dismissal-plain-length/Q1 | claude-sonnet-5-5 | 314 | 31 | $0.00094 | 0.8 |  |
| 2026-10-24 02:43 | 301 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 88 | $0.00013 | 0.7 |  |
| 2026-10-24 02:43 | 302 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 76 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 303 | subject sonnet dismissal-plain-length/P1' | claude-sonnet-5-5 | 370 | 778 | $0.00852 | 6.9 |  |
| 2026-10-24 02:43 | 304 | judge 1 P1' sonnet | claude-haiku-5-5 | 1440 | 601 | $0.00044 | 3.2 |  |
| 2026-10-24 02:43 | 305 | judge 2 P1' sonnet | claude-haiku-5-5 | 1440 | 655 | $0.00047 | 3.4 |  |
| 2026-10-24 02:43 | 306 | subject opus dismissal-plain-length/P1' | claude-opus-5-5 | 370 | 413 | $0.00974 | 5.2 |  |
| 2026-10-24 02:43 | 307 | judge 2 P1' opus | claude-haiku-5-5 | 1318 | 456 | $0.00036 | 3.1 |  |
| 2026-10-24 02:43 | 308 | judge 1 P1' opus | claude-haiku-5-5 | 1318 | 595 | $0.00043 | 3.5 |  |
| 2026-10-24 02:43 | 309 | subject fable dismissal-plain-length/P5' | claude-fable-5-1 | 351 | 510 | $0.02901 | 7.5 |  |
| 2026-10-24 02:43 | 310 | judge 2 P5' fable | claude-haiku-5-5 | 1132 | 129 | $0.00018 | 1.1 |  |
| 2026-10-24 02:43 | 311 | judge 1 P5' fable | claude-haiku-5-5 | 1132 | 131 | $0.00018 | 1.1 |  |
| 2026-10-24 02:43 | 312 | subject sonnet dismissal-plain/P1' | claude-sonnet-5-5 | 356 | 677 | $0.00748 | 6.2 |  |
| 2026-10-24 02:43 | 313 | judge 1 P1' sonnet | claude-haiku-5-5 | 1450 | 663 | $0.00048 | 3.9 |  |
| 2026-10-24 02:43 | 314 | judge 2 P1' sonnet | claude-haiku-5-5 | 1450 | 770 | $0.00053 | 4.2 |  |
| 2026-10-24 02:43 | 315 | referee P1' sonnet | claude-opus-5-5 | 1450 | 401 | $0.01382 | 4.8 |  |
| 2026-10-24 02:43 | 316 | subject fable dismissal-plain/Q1 | claude-fable-5-1 | 300 | 158 | $0.01090 | 3.6 |  |
| 2026-10-24 02:43 | 317 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 78 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 318 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 83 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 319 | subject opus dismissal-plain-length/Q4 | claude-opus-5-5 | 275 | 172 | $0.00454 | 3.1 |  |
| 2026-10-24 02:43 | 320 | judge 1 Q4 opus | claude-haiku-5-5 | 950 | 134 | $0.00016 | 0.9 |  |
| 2026-10-24 02:43 | 321 | judge 2 Q4 opus | claude-haiku-5-5 | 950 | 110 | $0.00015 | 1.5 |  |
| 2026-10-24 02:43 | 322 | subject opus dismissal-plain-length/P4' | claude-opus-5-5 | 275 | 147 | $0.00404 | 2.7 |  |
| 2026-10-24 02:43 | 323 | judge 2 P4' opus | claude-haiku-5-5 | 839 | 81 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 324 | judge 1 P4' opus | claude-haiku-5-5 | 839 | 79 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 325 | subject opus dismissal-plain/Q1 | claude-opus-5-5 | 300 | 70 | $0.00260 | 2.5 |  |
| 2026-10-24 02:43 | 326 | judge 2 Q1 opus | claude-haiku-5-5 | 877 | 79 | $0.00013 | 1.1 |  |
| 2026-10-24 02:43 | 327 | judge 1 Q1 opus | claude-haiku-5-5 | 877 | 73 | $0.00012 | 1.3 |  |
| 2026-10-24 02:43 | 328 | subject fable dismissal-plain-length/P1' | claude-fable-5-1 | 370 | 601 | $0.03375 | 9.6 |  |
| 2026-10-24 02:43 | 329 | judge 1 P1' fable | claude-haiku-5-5 | 1441 | 414 | $0.00035 | 2.4 |  |
| 2026-10-24 02:43 | 330 | judge 2 P1' fable | claude-haiku-5-5 | 1441 | 418 | $0.00035 | 2.5 |  |
| 2026-10-24 02:43 | 331 | subject sonnet dismissal-plain/P4' | claude-sonnet-5-5 | 261 | 124 | $0.00176 | 1.7 |  |
| 2026-10-24 02:43 | 332 | judge 1 P4' sonnet | claude-haiku-5-5 | 842 | 69 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 333 | judge 2 P4' sonnet | claude-haiku-5-5 | 842 | 78 | $0.00012 | 1.1 |  |
| 2026-10-24 02:43 | 334 | subject fable dismissal-plain/P1' | claude-fable-5-1 | 356 | 435 | $0.02531 | 7.8 |  |
| 2026-10-24 02:43 | 335 | judge 2 P1' fable | claude-haiku-5-5 | 1390 | 397 | $0.00034 | 2.2 |  |
| 2026-10-24 02:43 | 336 | judge 1 P1' fable | claude-haiku-5-5 | 1390 | 444 | $0.00036 | 2.5 |  |
| 2026-10-24 02:43 | 337 | subject opus dismissal-plain/Q4 | claude-opus-5-5 | 261 | 162 | $0.00428 | 4 |  |
| 2026-10-24 02:43 | 338 | judge 1 Q4 opus | claude-haiku-5-5 | 939 | 94 | $0.00014 | 0.8 |  |
| 2026-10-24 02:43 | 339 | judge 2 Q4 opus | claude-haiku-5-5 | 939 | 98 | $0.00014 | 0.8 |  |
| 2026-10-24 02:43 | 340 | subject sonnet dismissal-plain-length/P4' | claude-sonnet-5-5 | 275 | 130 | $0.00185 | 1.6 |  |
| 2026-10-24 02:43 | 341 | judge 1 P4' sonnet | claude-haiku-5-5 | 848 | 87 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 342 | judge 2 P4' sonnet | claude-haiku-5-5 | 848 | 75 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 343 | subject fable dismissal-plain/P4' | claude-fable-5-1 | 261 | 231 | $0.01416 | 4.8 |  |
| 2026-10-24 02:43 | 344 | judge 1 P4' fable | claude-haiku-5-5 | 854 | 71 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 345 | judge 2 P4' fable | claude-haiku-5-5 | 854 | 85 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 346 | subject sonnet dismissal-plain/P5' | claude-sonnet-5-5 | 337 | 190 | $0.00257 | 1.8 |  |
| 2026-10-24 02:43 | 347 | judge 2 P5' sonnet | claude-haiku-5-5 | 1048 | 97 | $0.00015 | 0.8 |  |
| 2026-10-24 02:43 | 348 | judge 1 P5' sonnet | claude-haiku-5-5 | 1048 | 103 | $0.00016 | 0.9 |  |
| 2026-10-24 02:43 | 349 | subject opus dismissal-plain/P5' | claude-opus-5-5 | 337 | 403 | $0.00941 | 5.1 |  |
| 2026-10-24 02:43 | 350 | judge 2 P5' opus | claude-haiku-5-5 | 1130 | 157 | $0.00019 | 1.1 |  |
| 2026-10-24 02:43 | 351 | judge 1 P5' opus | claude-haiku-5-5 | 1130 | 146 | $0.00019 | 1.3 |  |
| 2026-10-24 02:43 | 352 | subject opus dismissal-plain/P4' | claude-opus-5-5 | 261 | 140 | $0.00384 | 2.8 |  |
| 2026-10-24 02:43 | 353 | judge 1 P4' opus | claude-haiku-5-5 | 838 | 77 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 354 | judge 2 P4' opus | claude-haiku-5-5 | 838 | 78 | $0.00012 | 1.2 |  |
| 2026-10-24 02:43 | 355 | subject opus dismissal-plain-length/Q1 | claude-opus-5-5 | 314 | 89 | $0.00304 | 1.9 |  |
| 2026-10-24 02:43 | 356 | judge 1 Q1 opus | claude-haiku-5-5 | 885 | 76 | $0.00013 | 0.7 |  |
| 2026-10-24 02:43 | 357 | judge 2 Q1 opus | claude-haiku-5-5 | 885 | 82 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 358 | subject fable dismissal-plain/Q4 | claude-fable-5-1 | 261 | 11 | $0.00316 | 2.6 |  |
| 2026-10-24 02:43 | 359 | judge 1 Q4 fable | claude-haiku-5-5 | 898 | 93 | $0.00014 | 0.7 |  |
| 2026-10-24 02:43 | 360 | judge 2 Q4 fable | claude-haiku-5-5 | 898 | 68 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 361 | subject fable dismissal-plain-length/Q4 | claude-fable-5-1 | 275 | 185 | $0.01200 | 3.2 |  |
| 2026-10-24 02:43 | 362 | judge 1 Q4 fable | claude-haiku-5-5 | 898 | 83 | $0.00013 | 0.7 |  |
| 2026-10-24 02:43 | 363 | judge 2 Q4 fable | claude-haiku-5-5 | 898 | 69 | $0.00012 | 1 |  |
| 2026-10-24 02:43 | 364 | subject fable dismissal-plain-length/P4' | claude-fable-5-1 | 275 | 325 | $0.01900 | 6.6 |  |
| 2026-10-24 02:43 | 365 | judge 2 P4' fable | claude-haiku-5-5 | 919 | 84 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 366 | judge 1 P4' fable | claude-haiku-5-5 | 919 | 96 | $0.00014 | 0.9 |  |
| 2026-10-24 02:43 | 367 | subject sonnet dismissal-plain-length/P5' | claude-sonnet-5-5 | 351 | 237 | $0.00307 | 2.1 |  |
| 2026-10-24 02:43 | 368 | judge 1 P5' sonnet | claude-haiku-5-5 | 1048 | 92 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 369 | judge 2 P5' sonnet | claude-haiku-5-5 | 1048 | 102 | $0.00016 | 1 |  |
| 2026-10-24 02:43 | 370 | subject sonnet dismissal-plain-length/P4' | claude-sonnet-5-5 | 275 | 173 | $0.00228 | 2.2 |  |
| 2026-10-24 02:43 | 371 | judge 2 P4' sonnet | claude-haiku-5-5 | 891 | 107 | $0.00014 | 0.9 |  |
| 2026-10-24 02:43 | 372 | judge 1 P4' sonnet | claude-haiku-5-5 | 891 | 84 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 373 | subject fable dismissal-plain-length/P1' | claude-fable-5-1 | 370 | 511 | $0.02925 | 8 |  |
| 2026-10-24 02:43 | 374 | judge 1 P1' fable | claude-haiku-5-5 | 1339 | 351 | $0.00031 | 2.1 |  |
| 2026-10-24 02:43 | 375 | judge 2 P1' fable | claude-haiku-5-5 | 1339 | 557 | $0.00041 | 3.2 |  |
| 2026-10-24 02:43 | 376 | referee P1' fable | claude-opus-5-5 | 1339 | 285 | $0.01106 | 3.2 |  |
| 2026-10-24 02:43 | 377 | subject opus dismissal-plain-length/P1' | claude-opus-5-5 | 370 | 625 | $0.01398 | 7.7 |  |
| 2026-10-24 02:43 | 378 | judge 1 P1' opus | claude-haiku-5-5 | 1370 | 345 | $0.00031 | 1.7 |  |
| 2026-10-24 02:43 | 379 | judge 2 P1' opus | claude-haiku-5-5 | 1370 | 391 | $0.00033 | 1.9 |  |
| 2026-10-24 02:43 | 380 | subject sonnet dismissal-plain-length/Q4 | claude-sonnet-5-5 | 275 | 120 | $0.00175 | 1.8 |  |
| 2026-10-24 02:43 | 381 | judge 2 Q4 sonnet | claude-haiku-5-5 | 916 | 74 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 382 | judge 1 Q4 sonnet | claude-haiku-5-5 | 916 | 76 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 383 | subject opus dismissal-plain/P5' | claude-opus-5-5 | 337 | 466 | $0.01067 | 6 |  |
| 2026-10-24 02:43 | 384 | judge 2 P5' opus | claude-haiku-5-5 | 1121 | 142 | $0.00018 | 1.2 |  |
| 2026-10-24 02:43 | 385 | judge 1 P5' opus | claude-haiku-5-5 | 1121 | 138 | $0.00018 | 1.3 |  |
| 2026-10-24 02:43 | 386 | subject opus dismissal-plain-length/Q4 | claude-opus-5-5 | 275 | 189 | $0.00488 | 3.3 |  |
| 2026-10-24 02:43 | 387 | judge 2 Q4 opus | claude-haiku-5-5 | 946 | 101 | $0.00015 | 0.8 |  |
| 2026-10-24 02:43 | 388 | judge 1 Q4 opus | claude-haiku-5-5 | 946 | 103 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 389 | subject sonnet dismissal-plain/Q1 | claude-sonnet-5-5 | 300 | 41 | $0.00101 | 1.2 |  |
| 2026-10-24 02:43 | 390 | judge 1 Q1 sonnet | claude-haiku-5-5 | 910 | 80 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 391 | judge 2 Q1 sonnet | claude-haiku-5-5 | 910 | 88 | $0.00014 | 0.9 |  |
| 2026-10-24 02:43 | 392 | subject fable dismissal-plain/P4' | claude-fable-5-1 | 261 | 255 | $0.01536 | 5.2 |  |
| 2026-10-24 02:43 | 393 | judge 1 P4' fable | claude-haiku-5-5 | 872 | 77 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 394 | judge 2 P4' fable | claude-haiku-5-5 | 872 | 70 | $0.00012 | 1 |  |
| 2026-10-24 02:43 | 395 | subject fable dismissal-plain/Q1 | claude-fable-5-1 | 300 | 227 | $0.01435 | 4.4 |  |
| 2026-10-24 02:43 | 396 | judge 1 Q1 fable | claude-haiku-5-5 | 876 | 77 | $0.00013 | 0.7 |  |
| 2026-10-24 02:43 | 397 | judge 2 Q1 fable | claude-haiku-5-5 | 876 | 82 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 398 | subject opus dismissal-plain-length/Q1 | claude-opus-5-5 | 314 | 64 | $0.00254 | 1.8 |  |
| 2026-10-24 02:43 | 399 | judge 2 Q1 opus | claude-haiku-5-5 | 875 | 78 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 400 | judge 1 Q1 opus | claude-haiku-5-5 | 875 | 77 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 401 | subject fable dismissal-plain-length/P5' | claude-fable-5-1 | 351 | 423 | $0.02466 | 6.8 |  |
| 2026-10-24 02:43 | 402 | judge 2 P5' fable | claude-haiku-5-5 | 1122 | 143 | $0.00018 | 1.2 |  |
| 2026-10-24 02:43 | 403 | judge 1 P5' fable | claude-haiku-5-5 | 1122 | 147 | $0.00019 | 1.3 |  |
| 2026-10-24 02:43 | 404 | subject sonnet dismissal-plain/P1' | claude-sonnet-5-5 | 356 | 779 | $0.00850 | 6.8 |  |
| 2026-10-24 02:43 | 405 | judge 2 P1' sonnet | claude-haiku-5-5 | 1490 | 622 | $0.00046 | 4.1 |  |
| 2026-10-24 02:43 | 406 | judge 1 P1' sonnet | claude-haiku-5-5 | 1490 | 579 | $0.00044 | 4.2 |  |
| 2026-10-24 02:43 | 407 | referee P1' sonnet | claude-opus-5-5 | 1490 | 412 | $0.01420 | 4.8 |  |
| 2026-10-24 02:43 | 408 | subject sonnet dismissal-plain/P5' | claude-sonnet-5-5 | 337 | 220 | $0.00287 | 2.2 |  |
| 2026-10-24 02:43 | 409 | judge 1 P5' sonnet | claude-haiku-5-5 | 1048 | 107 | $0.00016 | 0.9 |  |
| 2026-10-24 02:43 | 410 | judge 2 P5' sonnet | claude-haiku-5-5 | 1048 | 107 | $0.00016 | 0.9 |  |
| 2026-10-24 02:43 | 411 | subject sonnet dismissal-plain/P4' | claude-sonnet-5-5 | 261 | 138 | $0.00190 | 1.8 |  |
| 2026-10-24 02:43 | 412 | judge 1 P4' sonnet | claude-haiku-5-5 | 856 | 75 | $0.00012 | 0.9 |  |
| 2026-10-24 02:43 | 413 | judge 2 P4' sonnet | claude-haiku-5-5 | 856 | 77 | $0.00012 | 1 |  |
| 2026-10-24 02:43 | 414 | subject opus dismissal-plain/Q4 | claude-opus-5-5 | 261 | 153 | $0.00410 | 2.7 |  |
| 2026-10-24 02:43 | 415 | judge 2 Q4 opus | claude-haiku-5-5 | 931 | 108 | $0.00015 | 0.8 |  |
| 2026-10-24 02:43 | 416 | judge 1 Q4 opus | claude-haiku-5-5 | 931 | 109 | $0.00015 | 1.3 |  |
| 2026-10-24 02:43 | 417 | subject fable dismissal-plain-length/P4' | claude-fable-5-1 | 275 | 242 | $0.01485 | 4 |  |
| 2026-10-24 02:43 | 418 | judge 2 P4' fable | claude-haiku-5-5 | 888 | 89 | $0.00013 | 1 |  |
| 2026-10-24 02:43 | 419 | judge 1 P4' fable | claude-haiku-5-5 | 888 | 94 | $0.00014 | 1 |  |
| 2026-10-24 02:43 | 420 | subject fable dismissal-plain/P5' | claude-fable-5-1 | 337 | 401 | $0.02342 | 6.8 |  |
| 2026-10-24 02:43 | 421 | judge 1 P5' fable | claude-haiku-5-5 | 1130 | 109 | $0.00017 | 1 |  |
| 2026-10-24 02:43 | 422 | judge 2 P5' fable | claude-haiku-5-5 | 1130 | 110 | $0.00017 | 1 |  |
| 2026-10-24 02:43 | 423 | subject opus dismissal-plain/P1' | claude-opus-5-5 | 356 | 360 | $0.00862 | 6.3 |  |
| 2026-10-24 02:43 | 424 | judge 2 P1' opus | claude-haiku-5-5 | 1287 | 389 | $0.00032 | 2.1 |  |
| 2026-10-24 02:43 | 425 | judge 1 P1' opus | claude-haiku-5-5 | 1287 | 422 | $0.00034 | 2.4 |  |
| 2026-10-24 02:43 | 426 | subject sonnet dismissal-plain-length/P1' | claude-sonnet-5-5 | 370 | 754 | $0.00828 | 7.2 |  |
| 2026-10-24 02:43 | 427 | judge 2 P1' sonnet | claude-haiku-5-5 | 1463 | 526 | $0.00041 | 2.9 |  |
| 2026-10-24 02:43 | 428 | judge 1 P1' sonnet | claude-haiku-5-5 | 1463 | 627 | $0.00046 | 3.5 |  |
| 2026-10-24 02:43 | 429 | subject sonnet dismissal-plain-length/Q1 | claude-sonnet-5-5 | 314 | 31 | $0.00094 | 0.8 |  |
| 2026-10-24 02:43 | 430 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 78 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 431 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 85 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 432 | subject fable dismissal-plain-length/Q1 | claude-fable-5-1 | 314 | 185 | $0.01239 | 3.1 |  |
| 2026-10-24 02:43 | 433 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 79 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 434 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 67 | $0.00012 | 0.9 |  |
| 2026-10-24 02:43 | 435 | subject sonnet dismissal-plain-length/P5' | claude-sonnet-5-5 | 351 | 252 | $0.00322 | 2.5 |  |
| 2026-10-24 02:43 | 436 | judge 2 P5' sonnet | claude-haiku-5-5 | 1048 | 86 | $0.00015 | 1.3 |  |
| 2026-10-24 02:43 | 437 | judge 1 P5' sonnet | claude-haiku-5-5 | 1048 | 84 | $0.00015 | 1.6 |  |
| 2026-10-24 02:43 | 438 | subject opus dismissal-plain-length/P4' | claude-opus-5-5 | 275 | 140 | $0.00390 | 2.8 |  |
| 2026-10-24 02:43 | 439 | judge 2 P4' opus | claude-haiku-5-5 | 836 | 77 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 440 | judge 1 P4' opus | claude-haiku-5-5 | 836 | 83 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 441 | subject sonnet dismissal-plain/Q4 | claude-sonnet-5-5 | 261 | 54 | $0.00106 | 1.2 |  |
| 2026-10-24 02:43 | 442 | judge 2 Q4 sonnet | claude-haiku-5-5 | 941 | 100 | $0.00014 | 0.8 |  |
| 2026-10-24 02:43 | 443 | judge 1 Q4 sonnet | claude-haiku-5-5 | 941 | 110 | $0.00015 | 1.2 |  |
| 2026-10-24 02:43 | 444 | subject fable dismissal-plain-length/Q4 | claude-fable-5-1 | 275 | 374 | $0.02145 | 6.6 |  |
| 2026-10-24 02:43 | 445 | judge 2 Q4 fable | claude-haiku-5-5 | 962 | 103 | $0.00015 | 1 |  |
| 2026-10-24 02:43 | 446 | judge 1 Q4 fable | claude-haiku-5-5 | 962 | 112 | $0.00015 | 1.1 |  |
| 2026-10-24 02:43 | 447 | subject opus dismissal-plain-length/P5' | claude-opus-5-5 | 351 | 399 | $0.00938 | 4.9 |  |
| 2026-10-24 02:43 | 448 | judge 2 P5' opus | claude-haiku-5-5 | 1124 | 155 | $0.00019 | 1.1 |  |
| 2026-10-24 02:43 | 449 | judge 1 P5' opus | claude-haiku-5-5 | 1124 | 160 | $0.00019 | 1.3 |  |
| 2026-10-24 02:43 | 450 | subject fable dismissal-plain/Q4 | claude-fable-5-1 | 261 | 300 | $0.01761 | 6.2 |  |
| 2026-10-24 02:43 | 451 | judge 1 Q4 fable | claude-haiku-5-5 | 921 | 113 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 452 | judge 2 Q4 fable | claude-haiku-5-5 | 921 | 126 | $0.00016 | 0.9 |  |
| 2026-10-24 02:43 | 453 | subject opus dismissal-plain/P4' | claude-opus-5-5 | 261 | 192 | $0.00488 | 3.5 |  |
| 2026-10-24 02:43 | 454 | judge 1 P4' opus | claude-haiku-5-5 | 849 | 87 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 455 | judge 2 P4' opus | claude-haiku-5-5 | 849 | 85 | $0.00013 | 1 |  |
| 2026-10-24 02:43 | 456 | subject opus dismissal-plain/Q1 | claude-opus-5-5 | 300 | 70 | $0.00260 | 1.5 |  |
| 2026-10-24 02:43 | 457 | judge 1 Q1 opus | claude-haiku-5-5 | 877 | 80 | $0.00013 | 0.6 |  |
| 2026-10-24 02:43 | 458 | judge 2 Q1 opus | claude-haiku-5-5 | 877 | 73 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 459 | subject fable dismissal-plain/P1' | claude-fable-5-1 | 356 | 535 | $0.03031 | 9.4 |  |
| 2026-10-24 02:43 | 460 | judge 2 P1' fable | claude-haiku-5-5 | 1477 | 365 | $0.00033 | 2 |  |
| 2026-10-24 02:43 | 461 | judge 1 P1' fable | claude-haiku-5-5 | 1477 | 390 | $0.00034 | 2.1 |  |
| 2026-10-24 02:43 | 462 | subject fable dismissal-plain-length/P4' | claude-fable-5-1 | 275 | 283 | $0.01690 | 5.1 |  |
| 2026-10-24 02:43 | 463 | judge 1 P4' fable | claude-haiku-5-5 | 856 | 86 | $0.00013 | 0.7 |  |
| 2026-10-24 02:43 | 464 | judge 2 P4' fable | claude-haiku-5-5 | 856 | 100 | $0.00014 | 1.3 |  |
| 2026-10-24 02:43 | 465 | referee P4' fable | claude-opus-5-5 | 856 | 154 | $0.00650 | 2.4 |  |
| 2026-10-24 02:43 | 466 | subject sonnet dismissal-plain/P4' | claude-sonnet-5-5 | 261 | 135 | $0.00187 | 1.8 |  |
| 2026-10-24 02:43 | 467 | judge 2 P4' sonnet | claude-haiku-5-5 | 853 | 85 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 468 | judge 1 P4' sonnet | claude-haiku-5-5 | 853 | 74 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 469 | subject opus dismissal-plain/P1' | claude-opus-5-5 | 356 | 441 | $0.01024 | 6 |  |
| 2026-10-24 02:43 | 470 | judge 1 P1' opus | claude-haiku-5-5 | 1352 | 536 | $0.00040 | 3.2 |  |
| 2026-10-24 02:43 | 471 | judge 2 P1' opus | claude-haiku-5-5 | 1352 | 574 | $0.00042 | 3.7 |  |
| 2026-10-24 02:43 | 472 | subject sonnet dismissal-plain-length/Q4 | claude-sonnet-5-5 | 275 | 80 | $0.00135 | 1.6 |  |
| 2026-10-24 02:43 | 473 | judge 1 Q4 sonnet | claude-haiku-5-5 | 967 | 110 | $0.00015 | 0.8 |  |
| 2026-10-24 02:43 | 474 | judge 2 Q4 sonnet | claude-haiku-5-5 | 967 | 137 | $0.00017 | 1.1 |  |
| 2026-10-24 02:43 | 475 | subject opus dismissal-plain-length/P5' | claude-opus-5-5 | 351 | 444 | $0.01028 | 5.6 |  |
| 2026-10-24 02:43 | 476 | judge 1 P5' opus | claude-haiku-5-5 | 1131 | 129 | $0.00018 | 1.1 |  |
| 2026-10-24 02:43 | 477 | judge 2 P5' opus | claude-haiku-5-5 | 1131 | 112 | $0.00017 | 1.1 |  |
| 2026-10-24 02:43 | 478 | referee P5' opus | claude-opus-5-5 | 1131 | 163 | $0.00778 | 2.8 |  |
| 2026-10-24 02:43 | 479 | subject opus dismissal-plain/P5' | claude-opus-5-5 | 337 | 345 | $0.00825 | 4.4 |  |
| 2026-10-24 02:43 | 480 | judge 1 P5' opus | claude-haiku-5-5 | 1128 | 128 | $0.00018 | 1 |  |
| 2026-10-24 02:43 | 481 | judge 2 P5' opus | claude-haiku-5-5 | 1128 | 129 | $0.00018 | 1.1 |  |
| 2026-10-24 02:43 | 482 | subject fable dismissal-plain-length/Q1 | claude-fable-5-1 | 314 | 177 | $0.01199 | 3.1 |  |
| 2026-10-24 02:43 | 483 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 85 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 484 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 85 | $0.00013 | 1 |  |
| 2026-10-24 02:43 | 485 | subject opus dismissal-plain-length/P1' | claude-opus-5-5 | 370 | 539 | $0.01226 | 6.6 |  |
| 2026-10-24 02:43 | 486 | judge 2 P1' opus | claude-haiku-5-5 | 1345 | 375 | $0.00032 | 2.3 |  |
| 2026-10-24 02:43 | 487 | judge 1 P1' opus | claude-haiku-5-5 | 1345 | 374 | $0.00032 | 2.5 |  |
| 2026-10-24 02:43 | 488 | subject fable dismissal-plain/P1' | claude-fable-5-1 | 356 | 468 | $0.02696 | 7.8 |  |
| 2026-10-24 02:43 | 489 | judge 1 P1' fable | claude-haiku-5-5 | 1421 | 385 | $0.00033 | 2 |  |
| 2026-10-24 02:43 | 490 | judge 2 P1' fable | claude-haiku-5-5 | 1421 | 442 | $0.00036 | 3.1 |  |
| 2026-10-24 02:43 | 491 | subject fable dismissal-plain-length/P5' | claude-fable-5-1 | 351 | 509 | $0.02896 | 7.9 |  |
| 2026-10-24 02:43 | 492 | judge 1 P5' fable | claude-haiku-5-5 | 1119 | 156 | $0.00019 | 1.2 |  |
| 2026-10-24 02:43 | 493 | judge 2 P5' fable | claude-haiku-5-5 | 1119 | 148 | $0.00019 | 1.4 |  |
| 2026-10-24 02:43 | 494 | subject sonnet dismissal-plain-length/P5' | claude-sonnet-5-5 | 351 | 234 | $0.00304 | 2.1 |  |
| 2026-10-24 02:43 | 495 | judge 1 P5' sonnet | claude-haiku-5-5 | 1060 | 103 | $0.00016 | 0.9 |  |
| 2026-10-24 02:43 | 496 | judge 2 P5' sonnet | claude-haiku-5-5 | 1060 | 81 | $0.00015 | 1.1 |  |
| 2026-10-24 02:43 | 497 | subject fable dismissal-plain/Q4 | claude-fable-5-1 | 261 | 37 | $0.00446 | 1.3 |  |
| 2026-10-24 02:43 | 498 | judge 1 Q4 fable | claude-haiku-5-5 | 924 | 102 | $0.00014 | 0.9 |  |
| 2026-10-24 02:43 | 499 | judge 2 Q4 fable | claude-haiku-5-5 | 924 | 108 | $0.00015 | 1.1 |  |
| 2026-10-24 02:43 | 500 | subject sonnet dismissal-plain/P5' | claude-sonnet-5-5 | 337 | 186 | $0.00253 | 2.2 |  |
| 2026-10-24 02:43 | 501 | judge 2 P5' sonnet | claude-haiku-5-5 | 1053 | 86 | $0.00015 | 0.8 |  |
| 2026-10-24 02:43 | 502 | judge 1 P5' sonnet | claude-haiku-5-5 | 1053 | 83 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 503 | subject sonnet dismissal-plain/P1' | claude-sonnet-5-5 | 356 | 616 | $0.00687 | 5.9 |  |
| 2026-10-24 02:43 | 504 | judge 1 P1' sonnet | claude-haiku-5-5 | 1429 | 492 | $0.00039 | 2.8 |  |
| 2026-10-24 02:43 | 505 | judge 2 P1' sonnet | claude-haiku-5-5 | 1429 | 519 | $0.00040 | 2.8 |  |
| 2026-10-24 02:43 | 506 | subject opus dismissal-plain-length/P4' | claude-opus-5-5 | 275 | 142 | $0.00394 | 2.8 |  |
| 2026-10-24 02:43 | 507 | judge 1 P4' opus | claude-haiku-5-5 | 838 | 78 | $0.00012 | 0.7 |  |
| 2026-10-24 02:43 | 508 | judge 2 P4' opus | claude-haiku-5-5 | 838 | 75 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 509 | subject fable dismissal-plain/Q1 | claude-fable-5-1 | 300 | 143 | $0.01015 | 2.2 |  |
| 2026-10-24 02:43 | 510 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 83 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 511 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 78 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 512 | subject opus dismissal-plain/Q4 | claude-opus-5-5 | 261 | 170 | $0.00444 | 3 |  |
| 2026-10-24 02:43 | 513 | judge 2 Q4 opus | claude-haiku-5-5 | 931 | 123 | $0.00015 | 1 |  |
| 2026-10-24 02:43 | 514 | judge 1 Q4 opus | claude-haiku-5-5 | 931 | 131 | $0.00016 | 1 |  |
| 2026-10-24 02:43 | 515 | subject sonnet dismissal-plain/Q1 | claude-sonnet-5-5 | 300 | 31 | $0.00091 | 2 |  |
| 2026-10-24 02:43 | 516 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 82 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 517 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 82 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 518 | subject sonnet dismissal-plain-length/P4' | claude-sonnet-5-5 | 275 | 153 | $0.00208 | 2 |  |
| 2026-10-24 02:43 | 519 | judge 1 P4' sonnet | claude-haiku-5-5 | 871 | 67 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 520 | judge 2 P4' sonnet | claude-haiku-5-5 | 871 | 68 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 521 | subject fable dismissal-plain-length/P1' | claude-fable-5-1 | 370 | 560 | $0.03170 | 8.8 |  |
| 2026-10-24 02:43 | 522 | judge 2 P1' fable | claude-haiku-5-5 | 1405 | 443 | $0.00036 | 2.3 |  |
| 2026-10-24 02:43 | 523 | judge 1 P1' fable | claude-haiku-5-5 | 1405 | 467 | $0.00037 | 2.5 |  |
| 2026-10-24 02:43 | 524 | subject fable dismissal-plain/P4' | claude-fable-5-1 | 261 | 212 | $0.01321 | 3.9 |  |
| 2026-10-24 02:43 | 525 | judge 1 P4' fable | claude-haiku-5-5 | 862 | 86 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 526 | judge 2 P4' fable | claude-haiku-5-5 | 862 | 81 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 527 | subject opus dismissal-plain/P4' | claude-opus-5-5 | 261 | 159 | $0.00422 | 2.9 |  |
| 2026-10-24 02:43 | 528 | judge 2 P4' opus | claude-haiku-5-5 | 856 | 70 | $0.00012 | 0.9 |  |
| 2026-10-24 02:43 | 529 | judge 1 P4' opus | claude-haiku-5-5 | 856 | 79 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 530 | subject fable dismissal-plain/P5' | claude-fable-5-1 | 337 | 345 | $0.02062 | 5 |  |
| 2026-10-24 02:43 | 531 | judge 1 P5' fable | claude-haiku-5-5 | 1061 | 94 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 532 | judge 2 P5' fable | claude-haiku-5-5 | 1061 | 91 | $0.00015 | 1.7 |  |
| 2026-10-24 02:43 | 533 | subject sonnet dismissal-plain/Q4 | claude-sonnet-5-5 | 261 | 48 | $0.00100 | 1.1 |  |
| 2026-10-24 02:43 | 534 | judge 1 Q4 sonnet | claude-haiku-5-5 | 935 | 105 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 535 | judge 2 Q4 sonnet | claude-haiku-5-5 | 935 | 127 | $0.00016 | 1.1 |  |
| 2026-10-24 02:43 | 536 | subject fable dismissal-plain-length/Q4 | claude-fable-5-1 | 275 | 44 | $0.00495 | 1.5 |  |
| 2026-10-24 02:43 | 537 | judge 2 Q4 fable | claude-haiku-5-5 | 931 | 120 | $0.00015 | 1 |  |
| 2026-10-24 02:43 | 538 | judge 1 Q4 fable | claude-haiku-5-5 | 931 | 130 | $0.00016 | 1.1 |  |
| 2026-10-24 02:43 | 539 | subject opus dismissal-plain-length/Q4 | claude-opus-5-5 | 275 | 245 | $0.00600 | 4.5 |  |
| 2026-10-24 02:43 | 540 | judge 1 Q4 opus | claude-haiku-5-5 | 947 | 102 | $0.00015 | 1 |  |
| 2026-10-24 02:43 | 541 | judge 2 Q4 opus | claude-haiku-5-5 | 947 | 120 | $0.00015 | 1.5 |  |
| 2026-10-24 02:43 | 542 | subject sonnet dismissal-plain-length/P1' | claude-sonnet-5-5 | 370 | 615 | $0.00689 | 5.9 |  |
| 2026-10-24 02:43 | 543 | judge 1 P1' sonnet | claude-haiku-5-5 | 1428 | 408 | $0.00035 | 2.5 |  |
| 2026-10-24 02:43 | 544 | judge 2 P1' sonnet | claude-haiku-5-5 | 1428 | 578 | $0.00043 | 3.3 |  |
| 2026-10-24 02:43 | 545 | subject opus dismissal-plain-length/Q1 | claude-opus-5-5 | 314 | 38 | $0.00202 | 2 |  |
| 2026-10-24 02:43 | 546 | judge 2 Q1 opus | claude-haiku-5-5 | 875 | 78 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 547 | judge 1 Q1 opus | claude-haiku-5-5 | 875 | 84 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 548 | subject opus dismissal-plain/Q1 | claude-opus-5-5 | 300 | 65 | $0.00250 | 1.5 |  |
| 2026-10-24 02:43 | 549 | judge 2 Q1 opus | claude-haiku-5-5 | 875 | 69 | $0.00012 | 0.9 |  |
| 2026-10-24 02:43 | 550 | judge 1 Q1 opus | claude-haiku-5-5 | 875 | 85 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 551 | subject sonnet dismissal-plain-length/Q1 | claude-sonnet-5-5 | 314 | 31 | $0.00094 | 0.8 |  |
| 2026-10-24 02:43 | 552 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 77 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 553 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 88 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 554 | subject opus dismissal-plain-length/Q1 | claude-opus-5-5 | 314 | 76 | $0.00278 | 1.8 |  |
| 2026-10-24 02:43 | 555 | judge 2 Q1 opus | claude-haiku-5-5 | 875 | 83 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 556 | judge 1 Q1 opus | claude-haiku-5-5 | 875 | 85 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 557 | subject fable dismissal-plain/Q4 | claude-fable-5-1 | 261 | 51 | $0.00516 | 1.5 |  |
| 2026-10-24 02:43 | 558 | judge 2 Q4 fable | claude-haiku-5-5 | 938 | 120 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 559 | judge 1 Q4 fable | claude-haiku-5-5 | 938 | 107 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 560 | subject opus dismissal-plain/Q1 | claude-opus-5-5 | 300 | 76 | $0.00272 | 1.6 |  |
| 2026-10-24 02:43 | 561 | judge 1 Q1 opus | claude-haiku-5-5 | 875 | 78 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 562 | judge 2 Q1 opus | claude-haiku-5-5 | 875 | 86 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 563 | subject sonnet dismissal-plain/Q1 | claude-sonnet-5-5 | 300 | 41 | $0.00101 | 1 |  |
| 2026-10-24 02:43 | 564 | judge 1 Q1 sonnet | claude-haiku-5-5 | 910 | 93 | $0.00014 | 0.8 |  |
| 2026-10-24 02:43 | 565 | judge 2 Q1 sonnet | claude-haiku-5-5 | 910 | 84 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 566 | subject fable dismissal-plain-length/Q4 | claude-fable-5-1 | 275 | 49 | $0.00520 | 1.5 |  |
| 2026-10-24 02:43 | 567 | judge 2 Q4 fable | claude-haiku-5-5 | 936 | 99 | $0.00014 | 0.8 |  |
| 2026-10-24 02:43 | 568 | judge 1 Q4 fable | claude-haiku-5-5 | 936 | 111 | $0.00015 | 1.3 |  |
| 2026-10-24 02:43 | 569 | subject fable dismissal-plain/P4' | claude-fable-5-1 | 261 | 119 | $0.00856 | 2 |  |
| 2026-10-24 02:43 | 570 | judge 2 P4' fable | claude-haiku-5-5 | 799 | 88 | $0.00012 | 0.7 |  |
| 2026-10-24 02:43 | 571 | judge 1 P4' fable | claude-haiku-5-5 | 799 | 111 | $0.00014 | 0.8 |  |
| 2026-10-24 02:43 | 572 | subject sonnet dismissal-plain-length/P1' | claude-sonnet-5-5 | 370 | 596 | $0.00670 | 5.8 |  |
| 2026-10-24 02:43 | 573 | judge 1 P1' sonnet | claude-haiku-5-5 | 1424 | 553 | $0.00042 | 3 |  |
| 2026-10-24 02:43 | 574 | judge 2 P1' sonnet | claude-haiku-5-5 | 1424 | 657 | $0.00047 | 3.5 |  |
| 2026-10-24 02:43 | 575 | subject fable dismissal-plain-length/Q1 | claude-fable-5-1 | 314 | 131 | $0.00969 | 2 |  |
| 2026-10-24 02:43 | 576 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 83 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 577 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 71 | $0.00012 | 0.9 |  |
| 2026-10-24 02:43 | 578 | subject opus dismissal-plain/Q4 | claude-opus-5-5 | 261 | 132 | $0.00368 | 2.8 |  |
| 2026-10-24 02:43 | 579 | judge 1 Q4 opus | claude-haiku-5-5 | 929 | 126 | $0.00016 | 1.2 |  |
| 2026-10-24 02:43 | 580 | judge 2 Q4 opus | claude-haiku-5-5 | 929 | 108 | $0.00015 | 1.3 |  |
| 2026-10-24 02:43 | 581 | subject opus dismissal-plain-length/P1' | claude-opus-5-5 | 370 | 445 | $0.01038 | 6.7 |  |
| 2026-10-24 02:43 | 582 | judge 1 P1' opus | claude-haiku-5-5 | 1328 | 444 | $0.00035 | 2.3 |  |
| 2026-10-24 02:43 | 583 | judge 2 P1' opus | claude-haiku-5-5 | 1328 | 466 | $0.00037 | 2.6 |  |
| 2026-10-24 02:43 | 584 | subject fable dismissal-plain-length/P4' | claude-fable-5-1 | 275 | 263 | $0.01590 | 4.4 |  |
| 2026-10-24 02:43 | 585 | judge 2 P4' fable | claude-haiku-5-5 | 879 | 107 | $0.00014 | 1 |  |
| 2026-10-24 02:43 | 586 | judge 1 P4' fable | claude-haiku-5-5 | 879 | 116 | $0.00015 | 1 |  |
| 2026-10-24 02:43 | 587 | subject fable dismissal-plain/Q1 | claude-fable-5-1 | 300 | 157 | $0.01085 | 3 |  |
| 2026-10-24 02:43 | 588 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 77 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 589 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 83 | $0.00013 | 1 |  |
| 2026-10-24 02:43 | 590 | subject fable dismissal-plain-length/P1' | claude-fable-5-1 | 370 | 673 | $0.03735 | 10.5 |  |
| 2026-10-24 02:43 | 591 | judge 2 P1' fable | claude-haiku-5-5 | 1509 | 437 | $0.00037 | 2.2 |  |
| 2026-10-24 02:43 | 592 | judge 1 P1' fable | claude-haiku-5-5 | 1509 | 495 | $0.00040 | 2.5 |  |
| 2026-10-24 02:43 | 593 | subject sonnet dismissal-plain/P5' | claude-sonnet-5-5 | 337 | 222 | $0.00289 | 2.4 |  |
| 2026-10-24 02:43 | 594 | judge 2 P5' sonnet | claude-haiku-5-5 | 1046 | 98 | $0.00015 | 0.8 |  |
| 2026-10-24 02:43 | 595 | judge 1 P5' sonnet | claude-haiku-5-5 | 1046 | 101 | $0.00016 | 0.9 |  |
| 2026-10-24 02:43 | 596 | subject sonnet dismissal-plain-length/P5' | claude-sonnet-5-5 | 351 | 224 | $0.00294 | 2 |  |
| 2026-10-24 02:43 | 597 | judge 2 P5' sonnet | claude-haiku-5-5 | 1048 | 106 | $0.00016 | 0.8 |  |
| 2026-10-24 02:43 | 598 | judge 1 P5' sonnet | claude-haiku-5-5 | 1048 | 87 | $0.00015 | 0.8 |  |
| 2026-10-24 02:43 | 599 | subject opus dismissal-plain-length/Q4 | claude-opus-5-5 | 275 | 214 | $0.00538 | 3.4 |  |
| 2026-10-24 02:43 | 600 | judge 1 Q4 opus | claude-haiku-5-5 | 938 | 108 | $0.00015 | 1 |  |
| 2026-10-24 02:43 | 601 | judge 2 Q4 opus | claude-haiku-5-5 | 938 | 126 | $0.00016 | 1 |  |
| 2026-10-24 02:43 | 602 | subject sonnet dismissal-plain/P1' | claude-sonnet-5-5 | 356 | 628 | $0.00699 | 6 |  |
| 2026-10-24 02:43 | 603 | judge 1 P1' sonnet | claude-haiku-5-5 | 1438 | 465 | $0.00038 | 2.7 |  |
| 2026-10-24 02:43 | 604 | judge 2 P1' sonnet | claude-haiku-5-5 | 1438 | 393 | $0.00034 | 3.5 |  |
| 2026-10-24 02:43 | 605 | subject sonnet dismissal-plain/Q4 | claude-sonnet-5-5 | 261 | 65 | $0.00117 | 1.3 |  |
| 2026-10-24 02:43 | 606 | judge 2 Q4 sonnet | claude-haiku-5-5 | 952 | 111 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 607 | judge 1 Q4 sonnet | claude-haiku-5-5 | 952 | 109 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 608 | subject opus dismissal-plain-length/P5' | claude-opus-5-5 | 351 | 396 | $0.00932 | 5.1 |  |
| 2026-10-24 02:43 | 609 | judge 2 P5' opus | claude-haiku-5-5 | 1122 | 148 | $0.00019 | 1.1 |  |
| 2026-10-24 02:43 | 610 | judge 1 P5' opus | claude-haiku-5-5 | 1122 | 648 | $0.00044 | 3.5 |  |
| 2026-10-24 02:43 | 611 | subject sonnet dismissal-plain/P4' | claude-sonnet-5-5 | 261 | 137 | $0.00189 | 1.5 |  |
| 2026-10-24 02:43 | 612 | judge 2 P4' sonnet | claude-haiku-5-5 | 855 | 85 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 613 | judge 1 P4' sonnet | claude-haiku-5-5 | 855 | 68 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 614 | referee P5' opus | claude-opus-5-5 | 1122 | 343 | $0.01135 | 4.3 |  |
| 2026-10-24 02:43 | 615 | subject opus dismissal-plain/P4' | claude-opus-5-5 | 261 | 156 | $0.00416 | 3.2 |  |
| 2026-10-24 02:43 | 616 | judge 1 P4' opus | claude-haiku-5-5 | 846 | 76 | $0.00012 | 0.9 |  |
| 2026-10-24 02:43 | 617 | judge 2 P4' opus | claude-haiku-5-5 | 846 | 89 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 618 | subject opus dismissal-plain-length/P4' | claude-opus-5-5 | 275 | 153 | $0.00416 | 2.9 |  |
| 2026-10-24 02:43 | 619 | judge 1 P4' opus | claude-haiku-5-5 | 849 | 92 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 620 | judge 2 P4' opus | claude-haiku-5-5 | 849 | 85 | $0.00013 | 1 |  |
| 2026-10-24 02:43 | 621 | subject fable dismissal-plain/P5' | claude-fable-5-1 | 337 | 469 | $0.02682 | 6.8 |  |
| 2026-10-24 02:43 | 622 | judge 1 P5' fable | claude-haiku-5-5 | 1138 | 276 | $0.00025 | 1.7 |  |
| 2026-10-24 02:43 | 623 | judge 2 P5' fable | claude-haiku-5-5 | 1138 | 413 | $0.00032 | 2.4 |  |
| 2026-10-24 02:43 | 624 | subject sonnet dismissal-plain-length/Q1 | claude-sonnet-5-5 | 314 | 31 | $0.00094 | 1 |  |
| 2026-10-24 02:43 | 625 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 77 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 626 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 87 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 627 | subject sonnet dismissal-plain-length/Q4 | claude-sonnet-5-5 | 275 | 56 | $0.00111 | 1.2 |  |
| 2026-10-24 02:43 | 628 | judge 2 Q4 sonnet | claude-haiku-5-5 | 943 | 116 | $0.00015 | 1.4 |  |
| 2026-10-24 02:43 | 629 | judge 1 Q4 sonnet | claude-haiku-5-5 | 943 | 106 | $0.00015 | 2.1 |  |
| 2026-10-24 02:43 | 630 | subject opus dismissal-plain/P1' | claude-opus-5-5 | 356 | 378 | $0.00898 | 5.1 |  |
| 2026-10-24 02:43 | 631 | judge 1 P1' opus | claude-haiku-5-5 | 1294 | 462 | $0.00036 | 2.5 |  |
| 2026-10-24 02:43 | 632 | judge 2 P1' opus | claude-haiku-5-5 | 1294 | 582 | $0.00042 | 3.9 |  |
| 2026-10-24 02:43 | 633 | subject opus dismissal-plain/P5' | claude-opus-5-5 | 337 | 323 | $0.00781 | 4 |  |
| 2026-10-24 02:43 | 634 | judge 2 P5' opus | claude-haiku-5-5 | 1131 | 576 | $0.00040 | 3.2 |  |
| 2026-10-24 02:43 | 635 | judge 1 P5' opus | claude-haiku-5-5 | 1131 | 560 | $0.00039 | 3.3 |  |
| 2026-10-24 02:43 | 636 | subject fable dismissal-plain-length/P5' | claude-fable-5-1 | 351 | 466 | $0.02681 | 7.3 |  |
| 2026-10-24 02:43 | 637 | judge 1 P5' fable | claude-haiku-5-5 | 1049 | 108 | $0.00016 | 0.8 |  |
| 2026-10-24 02:43 | 638 | judge 2 P5' fable | claude-haiku-5-5 | 1049 | 100 | $0.00015 | 1 |  |
| 2026-10-24 02:43 | 639 | subject sonnet dismissal-plain-length/P4' | claude-sonnet-5-5 | 275 | 132 | $0.00187 | 1.6 |  |
| 2026-10-24 02:43 | 640 | judge 1 P4' sonnet | claude-haiku-5-5 | 850 | 79 | $0.00012 | 0.7 |  |
| 2026-10-24 02:43 | 641 | judge 2 P4' sonnet | claude-haiku-5-5 | 850 | 84 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 642 | subject fable dismissal-plain/P1' | claude-fable-5-1 | 356 | 472 | $0.02716 | 7.4 |  |
| 2026-10-24 02:43 | 643 | judge 2 P1' fable | claude-haiku-5-5 | 1322 | 325 | $0.00029 | 1.7 |  |
| 2026-10-24 02:43 | 644 | judge 1 P1' fable | claude-haiku-5-5 | 1322 | 537 | $0.00040 | 3 |  |
| 2026-10-24 02:43 | 645 | subject opus dismissal-plain/P5' | claude-opus-5-5 | 337 | 331 | $0.00797 | 4.3 |  |
| 2026-10-24 02:43 | 646 | judge 1 P5' opus | claude-haiku-5-5 | 1127 | 432 | $0.00033 | 2.2 |  |
| 2026-10-24 02:43 | 647 | judge 2 P5' opus | claude-haiku-5-5 | 1127 | 510 | $0.00037 | 2.5 |  |
| 2026-10-24 02:43 | 648 | subject sonnet dismissal-plain-length/P1' | claude-sonnet-5-5 | 370 | 614 | $0.00688 | 5.6 |  |
| 2026-10-24 02:43 | 649 | judge 1 P1' sonnet | claude-haiku-5-5 | 1423 | 117 | $0.00020 | 1.2 |  |
| 2026-10-24 02:43 | 650 | judge 2 P1' sonnet | claude-haiku-5-5 | 1423 | 650 | $0.00047 | 3.4 |  |
| 2026-10-24 02:43 | 651 | subject opus dismissal-plain/Q4 | claude-opus-5-5 | 261 | 126 | $0.00356 | 2.7 |  |
| 2026-10-24 02:43 | 652 | judge 2 Q4 opus | claude-haiku-5-5 | 907 | 107 | $0.00014 | 0.9 |  |
| 2026-10-24 02:43 | 653 | judge 1 Q4 opus | claude-haiku-5-5 | 907 | 109 | $0.00015 | 1.1 |  |
| 2026-10-24 02:43 | 654 | referee P1' sonnet | claude-opus-5-5 | 1423 | 575 | $0.01719 | 6.5 |  |
| 2026-10-24 02:43 | 655 | subject fable dismissal-plain/Q1 | claude-fable-5-1 | 300 | 137 | $0.00985 | 2.5 |  |
| 2026-10-24 02:43 | 656 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 77 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 657 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 76 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 658 | subject sonnet dismissal-plain-length/P5' | claude-sonnet-5-5 | 351 | 273 | $0.00343 | 2.5 |  |
| 2026-10-24 02:43 | 659 | judge 2 P5' sonnet | claude-haiku-5-5 | 1048 | 93 | $0.00015 | 0.8 |  |
| 2026-10-24 02:43 | 660 | judge 1 P5' sonnet | claude-haiku-5-5 | 1048 | 105 | $0.00016 | 0.8 |  |
| 2026-10-24 02:43 | 661 | subject opus dismissal-plain-length/P5' | claude-opus-5-5 | 351 | 338 | $0.00816 | 4.4 |  |
| 2026-10-24 02:43 | 662 | judge 1 P5' opus | claude-haiku-5-5 | 1120 | 137 | $0.00018 | 1.1 |  |
| 2026-10-24 02:43 | 663 | judge 2 P5' opus | claude-haiku-5-5 | 1120 | 140 | $0.00018 | 2.9 |  |
| 2026-10-24 02:43 | 664 | subject sonnet dismissal-plain/Q1 | claude-sonnet-5-5 | 300 | 41 | $0.00101 | 0.8 |  |
| 2026-10-24 02:43 | 665 | judge 2 Q1 sonnet | claude-haiku-5-5 | 910 | 85 | $0.00013 | 0.7 |  |
| 2026-10-24 02:43 | 666 | judge 1 Q1 sonnet | claude-haiku-5-5 | 910 | 83 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 667 | subject sonnet dismissal-plain/Q4 | claude-sonnet-5-5 | 261 | 47 | $0.00099 | 1.3 |  |
| 2026-10-24 02:43 | 668 | judge 2 Q4 sonnet | claude-haiku-5-5 | 934 | 95 | $0.00014 | 0.9 |  |
| 2026-10-24 02:43 | 669 | judge 1 Q4 sonnet | claude-haiku-5-5 | 934 | 102 | $0.00014 | 0.9 |  |
| 2026-10-24 02:43 | 670 | subject opus dismissal-plain/Q1 | claude-opus-5-5 | 300 | 73 | $0.00266 | 1.5 |  |
| 2026-10-24 02:43 | 671 | judge 2 Q1 opus | claude-haiku-5-5 | 875 | 83 | $0.00013 | 1 |  |
| 2026-10-24 02:43 | 672 | judge 1 Q1 opus | claude-haiku-5-5 | 875 | 83 | $0.00013 | 1 |  |
| 2026-10-24 02:43 | 673 | subject sonnet dismissal-plain/P1' | claude-sonnet-5-5 | 356 | 789 | $0.00860 | 7.4 |  |
| 2026-10-24 02:43 | 674 | judge 2 P1' sonnet | claude-haiku-5-5 | 1406 | 505 | $0.00039 | 3 |  |
| 2026-10-24 02:43 | 675 | judge 1 P1' sonnet | claude-haiku-5-5 | 1406 | 560 | $0.00042 | 3.1 |  |
| 2026-10-24 02:43 | 676 | subject fable dismissal-plain/Q4 | claude-fable-5-1 | 261 | 43 | $0.00476 | 1.3 |  |
| 2026-10-24 02:43 | 677 | judge 2 Q4 fable | claude-haiku-5-5 | 930 | 121 | $0.00015 | 1 |  |
| 2026-10-24 02:43 | 678 | judge 1 Q4 fable | claude-haiku-5-5 | 930 | 106 | $0.00015 | 1.1 |  |
| 2026-10-24 02:43 | 679 | subject opus dismissal-plain-length/Q1 | claude-opus-5-5 | 314 | 78 | $0.00282 | 1.8 |  |
| 2026-10-24 02:43 | 680 | judge 1 Q1 opus | claude-haiku-5-5 | 886 | 96 | $0.00014 | 0.8 |  |
| 2026-10-24 02:43 | 681 | judge 2 Q1 opus | claude-haiku-5-5 | 886 | 96 | $0.00014 | 0.9 |  |
| 2026-10-24 02:43 | 682 | subject sonnet dismissal-plain-length/Q4 | claude-sonnet-5-5 | 275 | 200 | $0.00255 | 2.3 |  |
| 2026-10-24 02:43 | 683 | judge 1 Q4 sonnet | claude-haiku-5-5 | 927 | 107 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 684 | judge 2 Q4 sonnet | claude-haiku-5-5 | 927 | 114 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 685 | subject fable dismissal-plain/P1' | claude-fable-5-1 | 356 | 569 | $0.03201 | 8.5 |  |
| 2026-10-24 02:43 | 686 | judge 1 P1' fable | claude-haiku-5-5 | 1458 | 137 | $0.00021 | 1.2 |  |
| 2026-10-24 02:43 | 687 | judge 2 P1' fable | claude-haiku-5-5 | 1458 | 673 | $0.00048 | 5.6 |  |
| 2026-10-24 02:43 | 688 | subject opus dismissal-plain-length/P1' | claude-opus-5-5 | 370 | 623 | $0.01394 | 7.7 |  |
| 2026-10-24 02:43 | 689 | referee P1' fable | claude-opus-5-5 | 1458 | 504 | $0.01591 | 5.5 |  |
| 2026-10-24 02:43 | 690 | judge 1 P1' opus | claude-haiku-5-5 | 1423 | 381 | $0.00033 | 3.4 |  |
| 2026-10-24 02:43 | 691 | judge 2 P1' opus | claude-haiku-5-5 | 1423 | 406 | $0.00035 | 3.5 |  |
| 2026-10-24 02:43 | 692 | subject opus dismissal-plain/P1' | claude-opus-5-5 | 356 | 349 | $0.00840 | 5 |  |
| 2026-10-24 02:43 | 693 | judge 2 P1' opus | claude-haiku-5-5 | 1248 | 357 | $0.00030 | 2 |  |
| 2026-10-24 02:43 | 694 | judge 1 P1' opus | claude-haiku-5-5 | 1248 | 527 | $0.00039 | 2.8 |  |
| 2026-10-24 02:43 | 695 | subject opus dismissal-plain-length/P4' | claude-opus-5-5 | 275 | 166 | $0.00442 | 3.1 |  |
| 2026-10-24 02:43 | 696 | judge 2 P4' opus | claude-haiku-5-5 | 862 | 80 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 697 | judge 1 P4' opus | claude-haiku-5-5 | 862 | 82 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 698 | subject sonnet dismissal-plain-length/P4' | claude-sonnet-5-5 | 275 | 131 | $0.00186 | 1.8 |  |
| 2026-10-24 02:43 | 699 | judge 2 P4' sonnet | claude-haiku-5-5 | 849 | 94 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 700 | judge 1 P4' sonnet | claude-haiku-5-5 | 849 | 75 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 701 | subject fable dismissal-plain/P5' | claude-fable-5-1 | 337 | 476 | $0.02717 | 7.2 |  |
| 2026-10-24 02:43 | 702 | judge 1 P5' fable | claude-haiku-5-5 | 1137 | 137 | $0.00018 | 1.2 |  |
| 2026-10-24 02:43 | 703 | judge 2 P5' fable | claude-haiku-5-5 | 1137 | 127 | $0.00018 | 1.4 |  |
| 2026-10-24 02:43 | 704 | subject fable dismissal-plain/P4' | claude-fable-5-1 | 261 | 218 | $0.01351 | 4.5 |  |
| 2026-10-24 02:43 | 705 | judge 1 P4' fable | claude-haiku-5-5 | 859 | 77 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 706 | judge 2 P4' fable | claude-haiku-5-5 | 859 | 80 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 707 | subject fable dismissal-plain-length/Q1 | claude-fable-5-1 | 314 | 219 | $0.01409 | 3.6 |  |
| 2026-10-24 02:43 | 708 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 78 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 709 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 87 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 710 | subject sonnet dismissal-plain/P4' | claude-sonnet-5-5 | 261 | 116 | $0.00168 | 1.5 |  |
| 2026-10-24 02:43 | 711 | judge 2 P4' sonnet | claude-haiku-5-5 | 834 | 74 | $0.00012 | 1 |  |
| 2026-10-24 02:43 | 712 | judge 1 P4' sonnet | claude-haiku-5-5 | 834 | 73 | $0.00012 | 4 |  |
| 2026-10-24 02:43 | 713 | subject sonnet dismissal-plain/P5' | claude-sonnet-5-5 | 337 | 187 | $0.00254 | 1.7 |  |
| 2026-10-24 02:43 | 714 | judge 1 P5' sonnet | claude-haiku-5-5 | 1047 | 95 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 715 | judge 2 P5' sonnet | claude-haiku-5-5 | 1047 | 107 | $0.00016 | 1.1 |  |
| 2026-10-24 02:43 | 716 | subject fable dismissal-plain-length/P4' | claude-fable-5-1 | 275 | 248 | $0.01515 | 4.3 |  |
| 2026-10-24 02:43 | 717 | judge 2 P4' fable | claude-haiku-5-5 | 877 | 79 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 718 | judge 1 P4' fable | claude-haiku-5-5 | 877 | 68 | $0.00012 | 0.9 |  |
| 2026-10-24 02:43 | 719 | subject fable dismissal-plain-length/P1' | claude-fable-5-1 | 370 | 474 | $0.02740 | 7.9 |  |
| 2026-10-24 02:43 | 720 | judge 2 P1' fable | claude-haiku-5-5 | 1422 | 370 | $0.00033 | 2.1 |  |
| 2026-10-24 02:43 | 721 | judge 1 P1' fable | claude-haiku-5-5 | 1422 | 393 | $0.00034 | 2.2 |  |
| 2026-10-24 02:43 | 722 | subject sonnet dismissal-plain-length/Q1 | claude-sonnet-5-5 | 314 | 31 | $0.00094 | 0.8 |  |
| 2026-10-24 02:43 | 723 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 77 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 724 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 97 | $0.00014 | 0.8 |  |
| 2026-10-24 02:43 | 725 | subject fable dismissal-plain-length/P5' | claude-fable-5-1 | 351 | 380 | $0.02251 | 5.7 |  |
| 2026-10-24 02:43 | 726 | judge 2 P5' fable | claude-haiku-5-5 | 1150 | 117 | $0.00017 | 0.9 |  |
| 2026-10-24 02:43 | 727 | judge 1 P5' fable | claude-haiku-5-5 | 1150 | 134 | $0.00018 | 1.3 |  |
| 2026-10-24 02:43 | 728 | subject opus dismissal-plain-length/Q4 | claude-opus-5-5 | 275 | 162 | $0.00434 | 2.8 |  |
| 2026-10-24 02:43 | 729 | judge 2 Q4 opus | claude-haiku-5-5 | 939 | 120 | $0.00015 | 1.3 |  |
| 2026-10-24 02:43 | 730 | judge 1 Q4 opus | claude-haiku-5-5 | 939 | 99 | $0.00014 | 3.2 |  |
| 2026-10-24 02:43 | 731 | subject fable dismissal-plain-length/Q4 | claude-fable-5-1 | 275 | 47 | $0.00510 | 1.3 |  |
| 2026-10-24 02:43 | 732 | judge 1 Q4 fable | claude-haiku-5-5 | 934 | 124 | $0.00016 | 1 |  |
| 2026-10-24 02:43 | 733 | judge 2 Q4 fable | claude-haiku-5-5 | 934 | 115 | $0.00015 | 1.1 |  |
| 2026-10-24 02:43 | 734 | subject opus dismissal-plain/P4' | claude-opus-5-5 | 261 | 165 | $0.00434 | 3.3 |  |
| 2026-10-24 02:43 | 735 | judge 1 P4' opus | claude-haiku-5-5 | 848 | 88 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 736 | judge 2 P4' opus | claude-haiku-5-5 | 848 | 88 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 737 | subject opus dismissal-plain/Q4 | claude-opus-5-5 | 261 | 203 | $0.00510 | 3.4 |  |
| 2026-10-24 02:43 | 738 | judge 1 Q4 opus | claude-haiku-5-5 | 937 | 99 | $0.00014 | 1 |  |
| 2026-10-24 02:43 | 739 | judge 2 Q4 opus | claude-haiku-5-5 | 937 | 99 | $0.00014 | 1 |  |
| 2026-10-24 02:43 | 740 | subject fable dismissal-plain/P5' | claude-fable-5-1 | 337 | 481 | $0.02742 | 7.8 |  |
| 2026-10-24 02:43 | 741 | judge 1 P5' fable | claude-haiku-5-5 | 1121 | 145 | $0.00018 | 1.1 |  |
| 2026-10-24 02:43 | 742 | judge 2 P5' fable | claude-haiku-5-5 | 1121 | 148 | $0.00019 | 1.1 |  |
| 2026-10-24 02:43 | 743 | subject sonnet dismissal-plain/Q1 | claude-sonnet-5-5 | 300 | 32 | $0.00092 | 0.9 |  |
| 2026-10-24 02:43 | 744 | judge 1 Q1 sonnet | claude-haiku-5-5 | 901 | 85 | $0.00013 | 0.7 |  |
| 2026-10-24 02:43 | 745 | judge 2 Q1 sonnet | claude-haiku-5-5 | 901 | 101 | $0.00014 | 0.8 |  |
| 2026-10-24 02:43 | 746 | subject opus dismissal-plain-length/Q4 | claude-opus-5-5 | 275 | 170 | $0.00450 | 3.4 |  |
| 2026-10-24 02:43 | 747 | judge 1 Q4 opus | claude-haiku-5-5 | 928 | 110 | $0.00015 | 1 |  |
| 2026-10-24 02:43 | 748 | judge 2 Q4 opus | claude-haiku-5-5 | 928 | 104 | $0.00014 | 1.1 |  |
| 2026-10-24 02:43 | 749 | subject opus dismissal-plain/P5' | claude-opus-5-5 | 337 | 347 | $0.00829 | 5.2 |  |
| 2026-10-24 02:43 | 750 | judge 2 P5' opus | claude-haiku-5-5 | 1130 | 122 | $0.00017 | 1 |  |
| 2026-10-24 02:43 | 751 | judge 1 P5' opus | claude-haiku-5-5 | 1130 | 143 | $0.00018 | 1.1 |  |
| 2026-10-24 02:43 | 752 | subject fable dismissal-plain/P4' | claude-fable-5-1 | 261 | 169 | $0.01106 | 3.1 |  |
| 2026-10-24 02:43 | 753 | judge 2 P4' fable | claude-haiku-5-5 | 826 | 76 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 754 | judge 1 P4' fable | claude-haiku-5-5 | 826 | 76 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 755 | subject fable dismissal-plain-length/P5' | claude-fable-5-1 | 351 | 415 | $0.02426 | 6.3 |  |
| 2026-10-24 02:43 | 756 | judge 1 P5' fable | claude-haiku-5-5 | 1135 | 406 | $0.00032 | 2.1 |  |
| 2026-10-24 02:43 | 757 | judge 2 P5' fable | claude-haiku-5-5 | 1135 | 368 | $0.00030 | 2.2 |  |
| 2026-10-24 02:43 | 758 | subject fable dismissal-plain-length/P1' | claude-fable-5-1 | 370 | 562 | $0.03180 | 8.5 |  |
| 2026-10-24 02:43 | 759 | judge 2 P1' fable | claude-haiku-5-5 | 1340 | 433 | $0.00035 | 2.7 |  |
| 2026-10-24 02:43 | 760 | judge 1 P1' fable | claude-haiku-5-5 | 1340 | 536 | $0.00040 | 3.6 |  |
| 2026-10-24 02:43 | 761 | subject sonnet dismissal-plain/P5' | claude-sonnet-5-5 | 337 | 180 | $0.00247 | 2.1 |  |
| 2026-10-24 02:43 | 762 | judge 2 P5' sonnet | claude-haiku-5-5 | 1046 | 85 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 763 | judge 1 P5' sonnet | claude-haiku-5-5 | 1046 | 89 | $0.00015 | 1.1 |  |
| 2026-10-24 02:43 | 764 | subject fable dismissal-plain-length/Q1 | claude-fable-5-1 | 314 | 126 | $0.00944 | 1.9 |  |
| 2026-10-24 02:43 | 765 | judge 1 Q1 fable | claude-haiku-5-5 | 899 | 95 | $0.00014 | 1 |  |
| 2026-10-24 02:43 | 766 | judge 2 Q1 fable | claude-haiku-5-5 | 899 | 94 | $0.00014 | 1 |  |
| 2026-10-24 02:43 | 767 | subject sonnet dismissal-plain-length/Q4 | claude-sonnet-5-5 | 275 | 104 | $0.00159 | 1.5 |  |
| 2026-10-24 02:43 | 768 | judge 2 Q4 sonnet | claude-haiku-5-5 | 918 | 88 | $0.00014 | 1 |  |
| 2026-10-24 02:43 | 769 | judge 1 Q4 sonnet | claude-haiku-5-5 | 918 | 97 | $0.00014 | 2.1 |  |
| 2026-10-24 02:43 | 770 | subject sonnet dismissal-plain-length/P5' | claude-sonnet-5-5 | 351 | 193 | $0.00263 | 1.8 |  |
| 2026-10-24 02:43 | 771 | judge 2 P5' sonnet | claude-haiku-5-5 | 1046 | 93 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 772 | judge 1 P5' sonnet | claude-haiku-5-5 | 1046 | 100 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 773 | subject sonnet dismissal-plain-length/P1' | claude-sonnet-5-5 | 370 | 750 | $0.00824 | 7.3 |  |
| 2026-10-24 02:43 | 774 | judge 2 P1' sonnet | claude-haiku-5-5 | 1449 | 587 | $0.00044 | 3 |  |
| 2026-10-24 02:43 | 775 | judge 1 P1' sonnet | claude-haiku-5-5 | 1449 | 717 | $0.00050 | 3.9 |  |
| 2026-10-24 02:43 | 776 | subject sonnet dismissal-plain-length/Q1 | claude-sonnet-5-5 | 314 | 31 | $0.00094 | 0.8 |  |
| 2026-10-24 02:43 | 777 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 90 | $0.00014 | 0.8 |  |
| 2026-10-24 02:43 | 778 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 72 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 779 | subject sonnet dismissal-plain-length/P4' | claude-sonnet-5-5 | 275 | 123 | $0.00178 | 1.6 |  |
| 2026-10-24 02:43 | 780 | judge 2 P4' sonnet | claude-haiku-5-5 | 841 | 82 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 781 | judge 1 P4' sonnet | claude-haiku-5-5 | 841 | 85 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 782 | subject opus dismissal-plain/Q1 | claude-opus-5-5 | 300 | 69 | $0.00258 | 1.4 |  |
| 2026-10-24 02:43 | 783 | judge 2 Q1 opus | claude-haiku-5-5 | 875 | 85 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 784 | judge 1 Q1 opus | claude-haiku-5-5 | 875 | 77 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 785 | subject opus dismissal-plain/P1' | claude-opus-5-5 | 356 | 415 | $0.00972 | 6.3 |  |
| 2026-10-24 02:43 | 786 | judge 1 P1' opus | claude-haiku-5-5 | 1300 | 430 | $0.00034 | 2.2 |  |
| 2026-10-24 02:43 | 787 | judge 2 P1' opus | claude-haiku-5-5 | 1300 | 407 | $0.00033 | 2.3 |  |
| 2026-10-24 02:43 | 788 | subject fable dismissal-plain-length/Q4 | claude-fable-5-1 | 275 | 125 | $0.00900 | 2.5 |  |
| 2026-10-24 02:43 | 789 | judge 2 Q4 fable | claude-haiku-5-5 | 898 | 66 | $0.00012 | 0.6 |  |
| 2026-10-24 02:43 | 790 | judge 1 Q4 fable | claude-haiku-5-5 | 898 | 93 | $0.00014 | 0.7 |  |
| 2026-10-24 02:43 | 791 | subject opus dismissal-plain-length/P5' | claude-opus-5-5 | 351 | 373 | $0.00886 | 5 |  |
| 2026-10-24 02:43 | 792 | judge 2 P5' opus | claude-haiku-5-5 | 1117 | 125 | $0.00017 | 1 |  |
| 2026-10-24 02:43 | 793 | judge 1 P5' opus | claude-haiku-5-5 | 1117 | 137 | $0.00018 | 1 |  |
| 2026-10-24 02:43 | 794 | subject opus dismissal-plain-length/P1' | claude-opus-5-5 | 370 | 402 | $0.00952 | 5.3 |  |
| 2026-10-24 02:43 | 795 | judge 2 P1' opus | claude-haiku-5-5 | 1316 | 376 | $0.00032 | 3 |  |
| 2026-10-24 02:43 | 796 | judge 1 P1' opus | claude-haiku-5-5 | 1316 | 388 | $0.00033 | 3.7 |  |
| 2026-10-24 02:43 | 797 | referee P1' opus | claude-opus-5-5 | 1316 | 386 | $0.01298 | 4.5 |  |
| 2026-10-24 02:43 | 798 | subject sonnet dismissal-plain/P1' | claude-sonnet-5-5 | 356 | 702 | $0.00773 | 6.2 |  |
| 2026-10-24 02:43 | 799 | judge 2 P1' sonnet | claude-haiku-5-5 | 1454 | 114 | $0.00020 | 0.9 |  |
| 2026-10-24 02:43 | 800 | judge 1 P1' sonnet | claude-haiku-5-5 | 1454 | 131 | $0.00021 | 1 |  |
| 2026-10-24 02:43 | 801 | subject sonnet dismissal-plain/Q4 | claude-sonnet-5-5 | 261 | 56 | $0.00108 | 1.3 |  |
| 2026-10-24 02:43 | 802 | judge 2 Q4 sonnet | claude-haiku-5-5 | 943 | 101 | $0.00014 | 0.8 |  |
| 2026-10-24 02:43 | 803 | judge 1 Q4 sonnet | claude-haiku-5-5 | 943 | 120 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 804 | referee Q4 sonnet | claude-opus-5-5 | 943 | 300 | $0.00977 | 3.4 |  |
| 2026-10-24 02:43 | 805 | subject fable dismissal-plain/Q4 | claude-fable-5-1 | 261 | 46 | $0.00491 | 1.6 |  |
| 2026-10-24 02:43 | 806 | judge 2 Q4 fable | claude-haiku-5-5 | 933 | 117 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 807 | judge 1 Q4 fable | claude-haiku-5-5 | 933 | 89 | $0.00014 | 1.2 |  |
| 2026-10-24 02:43 | 808 | subject fable dismissal-plain-length/P4' | claude-fable-5-1 | 275 | 439 | $0.02470 | 8.1 |  |
| 2026-10-24 02:43 | 809 | judge 1 P4' fable | claude-haiku-5-5 | 967 | 194 | $0.00019 | 1.9 |  |
| 2026-10-24 02:43 | 810 | judge 2 P4' fable | claude-haiku-5-5 | 967 | 268 | $0.00023 | 2 |  |
| 2026-10-24 02:43 | 811 | referee P4' fable | claude-opus-5-5 | 967 | 144 | $0.00675 | 2 |  |
| 2026-10-24 02:43 | 812 | subject fable dismissal-plain/P1' | claude-fable-5-1 | 356 | 433 | $0.02521 | 7.5 |  |
| 2026-10-24 02:43 | 813 | judge 2 P1' fable | claude-haiku-5-5 | 1311 | 383 | $0.00032 | 1.9 |  |
| 2026-10-24 02:43 | 814 | judge 1 P1' fable | claude-haiku-5-5 | 1311 | 424 | $0.00034 | 3.1 |  |
| 2026-10-24 02:43 | 815 | subject opus dismissal-plain/P4' | claude-opus-5-5 | 261 | 159 | $0.00422 | 3.1 |  |
| 2026-10-24 02:43 | 816 | judge 2 P4' opus | claude-haiku-5-5 | 850 | 93 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 817 | judge 1 P4' opus | claude-haiku-5-5 | 850 | 88 | $0.00013 | 1 |  |
| 2026-10-24 02:43 | 818 | subject fable dismissal-plain/Q1 | claude-fable-5-1 | 300 | 201 | $0.01305 | 3.3 |  |
| 2026-10-24 02:43 | 819 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 87 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 820 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 85 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 821 | subject opus dismissal-plain-length/Q1 | claude-opus-5-5 | 314 | 77 | $0.00280 | 1.9 |  |
| 2026-10-24 02:43 | 822 | judge 1 Q1 opus | claude-haiku-5-5 | 875 | 69 | $0.00012 | 0.9 |  |
| 2026-10-24 02:43 | 823 | judge 2 Q1 opus | claude-haiku-5-5 | 875 | 83 | $0.00013 | 1 |  |
| 2026-10-24 02:43 | 824 | subject sonnet dismissal-plain/P4' | claude-sonnet-5-5 | 261 | 128 | $0.00180 | 1.5 |  |
| 2026-10-24 02:43 | 825 | judge 1 P4' sonnet | claude-haiku-5-5 | 846 | 81 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 826 | judge 2 P4' sonnet | claude-haiku-5-5 | 846 | 78 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 827 | subject opus dismissal-plain-length/P4' | claude-opus-5-5 | 275 | 144 | $0.00398 | 2.6 |  |
| 2026-10-24 02:43 | 828 | judge 2 P4' opus | claude-haiku-5-5 | 840 | 78 | $0.00012 | 0.9 |  |
| 2026-10-24 02:43 | 829 | judge 1 P4' opus | claude-haiku-5-5 | 840 | 78 | $0.00012 | 1 |  |
| 2026-10-24 02:43 | 830 | subject fable dismissal-plain-length/Q1 | claude-fable-5-1 | 314 | 118 | $0.00904 | 1.8 |  |
| 2026-10-24 02:43 | 831 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 81 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 832 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 78 | $0.00013 | 1 |  |
| 2026-10-24 02:43 | 833 | subject fable dismissal-plain/P4' | claude-fable-5-1 | 261 | 188 | $0.01201 | 3.2 |  |
| 2026-10-24 02:43 | 834 | judge 1 P4' fable | claude-haiku-5-5 | 828 | 68 | $0.00012 | 0.9 |  |
| 2026-10-24 02:43 | 835 | judge 2 P4' fable | claude-haiku-5-5 | 828 | 86 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 836 | subject opus dismissal-plain/P1' | claude-opus-5-5 | 356 | 413 | $0.00968 | 5.7 |  |
| 2026-10-24 02:43 | 837 | judge 2 P1' opus | claude-haiku-5-5 | 1306 | 340 | $0.00030 | 2.6 |  |
| 2026-10-24 02:43 | 838 | judge 1 P1' opus | claude-haiku-5-5 | 1306 | 395 | $0.00033 | 2.9 |  |
| 2026-10-24 02:43 | 839 | subject fable dismissal-plain-length/P5' | claude-fable-5-1 | 351 | 478 | $0.02741 | 6.8 |  |
| 2026-10-24 02:43 | 840 | judge 2 P5' fable | claude-haiku-5-5 | 1115 | 115 | $0.00017 | 1 |  |
| 2026-10-24 02:43 | 841 | judge 1 P5' fable | claude-haiku-5-5 | 1115 | 127 | $0.00017 | 1.1 |  |
| 2026-10-24 02:43 | 842 | subject sonnet dismissal-plain/P1' | claude-sonnet-5-5 | 356 | 631 | $0.00702 | 5.8 |  |
| 2026-10-24 02:43 | 843 | judge 2 P1' sonnet | claude-haiku-5-5 | 1438 | 480 | $0.00038 | 2.8 |  |
| 2026-10-24 02:43 | 844 | judge 1 P1' sonnet | claude-haiku-5-5 | 1438 | 507 | $0.00040 | 3.1 |  |
| 2026-10-24 02:43 | 845 | subject fable dismissal-plain-length/P4' | claude-fable-5-1 | 275 | 182 | $0.01185 | 2.9 |  |
| 2026-10-24 02:43 | 846 | judge 1 P4' fable | claude-haiku-5-5 | 834 | 290 | $0.00023 | 1.8 |  |
| 2026-10-24 02:43 | 847 | referee P1' sonnet | claude-opus-5-5 | 1438 | 420 | $0.01415 | 4.6 |  |
| 2026-10-24 02:43 | 848 | judge 2 P4' fable | claude-haiku-5-5 | 834 | 357 | $0.00026 | 2.3 |  |
| 2026-10-24 02:43 | 849 | subject sonnet dismissal-plain/P4' | claude-sonnet-5-5 | 261 | 131 | $0.00183 | 1.6 |  |
| 2026-10-24 02:43 | 850 | referee P4' fable | claude-opus-5-5 | 834 | 194 | $0.00722 | 2.5 |  |
| 2026-10-24 02:43 | 851 | judge 1 P4' sonnet | claude-haiku-5-5 | 849 | 84 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 852 | judge 2 P4' sonnet | claude-haiku-5-5 | 849 | 76 | $0.00012 | 0.8 |  |
| 2026-10-24 02:43 | 853 | subject sonnet dismissal-plain-length/P4' | claude-sonnet-5-5 | 275 | 151 | $0.00206 | 1.9 |  |
| 2026-10-24 02:43 | 854 | judge 2 P4' sonnet | claude-haiku-5-5 | 869 | 108 | $0.00014 | 0.9 |  |
| 2026-10-24 02:43 | 855 | judge 1 P4' sonnet | claude-haiku-5-5 | 869 | 99 | $0.00014 | 0.9 |  |
| 2026-10-24 02:43 | 856 | subject opus dismissal-plain/Q4 | claude-opus-5-5 | 261 | 177 | $0.00458 | 4 |  |
| 2026-10-24 02:43 | 857 | judge 1 Q4 opus | claude-haiku-5-5 | 929 | 98 | $0.00014 | 1.7 |  |
| 2026-10-24 02:43 | 858 | judge 2 Q4 opus | claude-haiku-5-5 | 929 | 104 | $0.00014 | 2.2 |  |
| 2026-10-24 02:43 | 859 | subject opus dismissal-plain-length/Q1 | claude-opus-5-5 | 314 | 75 | $0.00276 | 1.8 |  |
| 2026-10-24 02:43 | 860 | judge 2 Q1 opus | claude-haiku-5-5 | 875 | 78 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 861 | judge 1 Q1 opus | claude-haiku-5-5 | 875 | 78 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 862 | subject sonnet dismissal-plain-length/Q1 | claude-sonnet-5-5 | 314 | 31 | $0.00094 | 0.7 |  |
| 2026-10-24 02:43 | 863 | judge 1 Q1 sonnet | claude-haiku-5-5 | 900 | 84 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 864 | judge 2 Q1 sonnet | claude-haiku-5-5 | 900 | 96 | $0.00014 | 0.9 |  |
| 2026-10-24 02:43 | 865 | subject fable dismissal-plain/Q1 | claude-fable-5-1 | 300 | 97 | $0.00785 | 1.6 |  |
| 2026-10-24 02:43 | 866 | judge 2 Q1 fable | claude-haiku-5-5 | 875 | 85 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 867 | judge 1 Q1 fable | claude-haiku-5-5 | 875 | 85 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 868 | subject opus dismissal-plain/P5' | claude-opus-5-5 | 337 | 313 | $0.00761 | 4.2 |  |
| 2026-10-24 02:43 | 869 | judge 1 P5' opus | claude-haiku-5-5 | 1118 | 127 | $0.00018 | 1 |  |
| 2026-10-24 02:43 | 870 | judge 2 P5' opus | claude-haiku-5-5 | 1118 | 147 | $0.00019 | 1.1 |  |
| 2026-10-24 02:43 | 871 | subject opus dismissal-plain/P4' | claude-opus-5-5 | 261 | 166 | $0.00436 | 2.9 |  |
| 2026-10-24 02:43 | 872 | judge 2 P4' opus | claude-haiku-5-5 | 850 | 82 | $0.00013 | 1 |  |
| 2026-10-24 02:43 | 873 | judge 1 P4' opus | claude-haiku-5-5 | 850 | 81 | $0.00013 | 1.3 |  |
| 2026-10-24 02:43 | 874 | subject opus dismissal-plain-length/P1' | claude-opus-5-5 | 370 | 457 | $0.01062 | 5.9 |  |
| 2026-10-24 02:43 | 875 | judge 1 P1' opus | claude-haiku-5-5 | 1326 | 351 | $0.00031 | 2.2 |  |
| 2026-10-24 02:43 | 876 | judge 2 P1' opus | claude-haiku-5-5 | 1326 | 364 | $0.00031 | 2.3 |  |
| 2026-10-24 02:43 | 877 | subject sonnet dismissal-plain-length/P5' | claude-sonnet-5-5 | 351 | 428 | $0.00498 | 3.5 |  |
| 2026-10-24 02:43 | 878 | judge 1 P5' sonnet | claude-haiku-5-5 | 1046 | 110 | $0.00016 | 0.9 |  |
| 2026-10-24 02:43 | 879 | judge 2 P5' sonnet | claude-haiku-5-5 | 1046 | 111 | $0.00016 | 1 |  |
| 2026-10-24 02:43 | 880 | subject sonnet dismissal-plain/P5' | claude-sonnet-5-5 | 337 | 189 | $0.00256 | 1.8 |  |
| 2026-10-24 02:43 | 881 | judge 2 P5' sonnet | claude-haiku-5-5 | 1045 | 108 | $0.00016 | 0.9 |  |
| 2026-10-24 02:43 | 882 | judge 1 P5' sonnet | claude-haiku-5-5 | 1045 | 101 | $0.00015 | 1 |  |
| 2026-10-24 02:43 | 883 | subject fable dismissal-plain/P5' | claude-fable-5-1 | 337 | 322 | $0.01947 | 4.8 |  |
| 2026-10-24 02:43 | 884 | judge 1 P5' fable | claude-haiku-5-5 | 1050 | 100 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 885 | judge 2 P5' fable | claude-haiku-5-5 | 1050 | 89 | $0.00015 | 1.5 |  |
| 2026-10-24 02:43 | 886 | subject opus dismissal-plain-length/Q4 | claude-opus-5-5 | 275 | 159 | $0.00428 | 3.1 |  |
| 2026-10-24 02:43 | 887 | judge 1 Q4 opus | claude-haiku-5-5 | 933 | 124 | $0.00016 | 1 |  |
| 2026-10-24 02:43 | 888 | judge 2 Q4 opus | claude-haiku-5-5 | 933 | 105 | $0.00015 | 1.3 |  |
| 2026-10-24 02:43 | 889 | subject sonnet dismissal-plain/Q4 | claude-sonnet-5-5 | 261 | 31 | $0.00083 | 0.9 |  |
| 2026-10-24 02:43 | 890 | judge 2 Q4 sonnet | claude-haiku-5-5 | 918 | 101 | $0.00014 | 0.8 |  |
| 2026-10-24 02:43 | 891 | judge 1 Q4 sonnet | claude-haiku-5-5 | 918 | 102 | $0.00014 | 1.1 |  |
| 2026-10-24 02:43 | 892 | subject opus dismissal-plain-length/P5' | claude-opus-5-5 | 351 | 369 | $0.00878 | 4.5 |  |
| 2026-10-24 02:43 | 893 | judge 2 P5' opus | claude-haiku-5-5 | 1126 | 157 | $0.00019 | 1.1 |  |
| 2026-10-24 02:43 | 894 | judge 1 P5' opus | claude-haiku-5-5 | 1126 | 148 | $0.00019 | 1.2 |  |
| 2026-10-24 02:43 | 895 | subject fable dismissal-plain-length/P1' | claude-fable-5-1 | 370 | 623 | $0.03485 | 9.9 |  |
| 2026-10-24 02:43 | 896 | judge 1 P1' fable | claude-haiku-5-5 | 1398 | 391 | $0.00034 | 2 |  |
| 2026-10-24 02:43 | 897 | judge 2 P1' fable | claude-haiku-5-5 | 1398 | 402 | $0.00034 | 2.1 |  |
| 2026-10-24 02:43 | 898 | subject sonnet dismissal-plain-length/P1' | claude-sonnet-5-5 | 370 | 696 | $0.00770 | 6.5 |  |
| 2026-10-24 02:43 | 899 | judge 2 P1' sonnet | claude-haiku-5-5 | 1475 | 612 | $0.00045 | 3.5 |  |
| 2026-10-24 02:43 | 900 | judge 1 P1' sonnet | claude-haiku-5-5 | 1475 | 689 | $0.00049 | 4.4 |  |
| 2026-10-24 02:43 | 901 | subject fable dismissal-plain/P1' | claude-fable-5-1 | 356 | 440 | $0.02556 | 6.8 |  |
| 2026-10-24 02:43 | 902 | judge 1 P1' fable | claude-haiku-5-5 | 1329 | 423 | $0.00034 | 2.2 |  |
| 2026-10-24 02:43 | 903 | judge 2 P1' fable | claude-haiku-5-5 | 1329 | 522 | $0.00039 | 2.9 |  |
| 2026-10-24 02:43 | 904 | subject fable dismissal-plain-length/Q4 | claude-fable-5-1 | 275 | 173 | $0.01140 | 2.7 |  |
| 2026-10-24 02:43 | 905 | judge 2 Q4 fable | claude-haiku-5-5 | 906 | 79 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 906 | judge 1 Q4 fable | claude-haiku-5-5 | 906 | 77 | $0.00013 | 0.8 |  |
| 2026-10-24 02:43 | 907 | subject sonnet dismissal-plain-length/Q4 | claude-sonnet-5-5 | 275 | 64 | $0.00119 | 1.1 |  |
| 2026-10-24 02:43 | 908 | judge 1 Q4 sonnet | claude-haiku-5-5 | 951 | 111 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 909 | judge 2 Q4 sonnet | claude-haiku-5-5 | 951 | 111 | $0.00015 | 1 |  |
| 2026-10-24 02:43 | 910 | subject fable dismissal-plain/Q4 | claude-fable-5-1 | 261 | 38 | $0.00451 | 1.4 |  |
| 2026-10-24 02:43 | 911 | judge 1 Q4 fable | claude-haiku-5-5 | 925 | 117 | $0.00015 | 0.9 |  |
| 2026-10-24 02:43 | 912 | judge 2 Q4 fable | claude-haiku-5-5 | 925 | 115 | $0.00015 | 1 |  |
| 2026-10-24 02:43 | 913 | subject opus dismissal-plain/Q1 | claude-opus-5-5 | 300 | 74 | $0.00268 | 1.4 |  |
| 2026-10-24 02:43 | 914 | judge 2 Q1 opus | claude-haiku-5-5 | 875 | 85 | $0.00013 | 0.9 |  |
| 2026-10-24 02:43 | 915 | judge 1 Q1 opus | claude-haiku-5-5 | 875 | 83 | $0.00013 | 1 |  |
| 2026-10-24 02:43 | 916 | subject sonnet dismissal-plain/Q1 | claude-sonnet-5-5 | 300 | 41 | $0.00101 | 1.1 |  |
| 2026-10-24 02:43 | 917 | judge 2 Q1 sonnet | claude-haiku-5-5 | 910 | 89 | $0.00014 | 0.8 |  |
| 2026-10-24 02:43 | 918 | judge 1 Q1 sonnet | claude-haiku-5-5 | 910 | 89 | $0.00014 | 0.8 |  |
| 2026-10-24 02:43 | 919 | subject opus dismissal-plain-length/P4' | claude-opus-5-5 | 275 | 163 | $0.00436 | 3 |  |
| 2026-10-24 02:43 | 920 | judge 1 P4' opus | claude-haiku-5-5 | 859 | 84 | $0.00013 | 0.7 |  |
| 2026-10-24 02:43 | 921 | judge 2 P4' opus | claude-haiku-5-5 | 859 | 72 | $0.00012 | 0.7 |  |
| 2026-10-24 03:23 | 1 | subject fable dismissal/S2 | claude-fable-5-1 | 350 | 428 | $0.02490 | 7.1 |  |
| 2026-10-24 03:23 | 2 | judge 1 S2 fable | claude-haiku-5-5 | 1167 | 116 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 3 | judge 2 S2 fable | claude-haiku-5-5 | 1167 | 118 | $0.00018 | 1.4 |  |
| 2026-10-24 03:23 | 4 | subject sonnet neutral/S2 | claude-sonnet-5-5 | 316 | 419 | $0.00482 | 3.7 |  |
| 2026-10-24 03:23 | 5 | judge 2 S2 sonnet | claude-haiku-5-5 | 1204 | 110 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 6 | judge 1 S2 sonnet | claude-haiku-5-5 | 1204 | 122 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 7 | subject opus neutral/S2 | claude-opus-5-5 | 316 | 485 | $0.01096 | 5.1 |  |
| 2026-10-24 03:23 | 8 | judge 2 S2 opus | claude-haiku-5-5 | 1347 | 111 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 9 | judge 1 S2 opus | claude-haiku-5-5 | 1347 | 135 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 10 | subject opus dismissal-plain/P5' | claude-opus-5-5 | 337 | 326 | $0.00787 | 4.3 |  |
| 2026-10-24 03:23 | 11 | judge 1 P5' opus | claude-haiku-5-5 | 1105 | 117 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 12 | judge 2 P5' opus | claude-haiku-5-5 | 1105 | 118 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 13 | subject fable dismissal-plain/P5' | claude-fable-5-1 | 337 | 443 | $0.02552 | 6.5 |  |
| 2026-10-24 03:23 | 14 | judge 2 P5' fable | claude-haiku-5-5 | 1132 | 163 | $0.00019 | 1.1 |  |
| 2026-10-24 03:23 | 15 | judge 1 P5' fable | claude-haiku-5-5 | 1132 | 126 | $0.00018 | 1.7 |  |
| 2026-10-24 03:23 | 16 | subject opus dismissal/S3 | claude-opus-5-5 | 378 | 426 | $0.01003 | 5.1 |  |
| 2026-10-24 03:23 | 17 | judge 2 S3 opus | claude-haiku-5-5 | 1242 | 111 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 18 | judge 1 S3 opus | claude-haiku-5-5 | 1242 | 114 | $0.00018 | 4.2 |  |
| 2026-10-24 03:23 | 19 | subject sonnet dismissal-plain/P5' | claude-sonnet-5-5 | 337 | 187 | $0.00254 | 1.8 |  |
| 2026-10-24 03:23 | 20 | judge 1 P5' sonnet | claude-haiku-5-5 | 1047 | 106 | $0.00016 | 0.8 |  |
| 2026-10-24 03:23 | 21 | judge 2 P5' sonnet | claude-haiku-5-5 | 1047 | 97 | $0.00015 | 0.8 |  |
| 2026-10-24 03:23 | 22 | subject opus dismissal-plain/S3 | claude-opus-5-5 | 374 | 483 | $0.01116 | 6.6 |  |
| 2026-10-24 03:23 | 23 | judge 2 S3 opus | claude-haiku-5-5 | 1258 | 128 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 24 | judge 1 S3 opus | claude-haiku-5-5 | 1258 | 130 | $0.00019 | 1.1 |  |
| 2026-10-24 03:23 | 25 | subject fable neutral/S3 | claude-fable-5-1 | 344 | 558 | $0.03134 | 11.4 |  |
| 2026-10-24 03:23 | 26 | judge 1 S3 fable | claude-haiku-5-5 | 1340 | 119 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 27 | judge 2 S3 fable | claude-haiku-5-5 | 1340 | 123 | $0.00020 | 1.1 |  |
| 2026-10-24 03:23 | 28 | subject fable dismissal-plain/S2 | claude-fable-5-1 | 346 | 471 | $0.02701 | 7.5 |  |
| 2026-10-24 03:23 | 29 | judge 2 S2 fable | claude-haiku-5-5 | 1190 | 118 | $0.00018 | 1.1 |  |
| 2026-10-24 03:23 | 30 | judge 1 S2 fable | claude-haiku-5-5 | 1190 | 130 | $0.00018 | 1.1 |  |
| 2026-10-24 03:23 | 31 | subject sonnet neutral/P5' | claude-sonnet-5-5 | 307 | 388 | $0.00449 | 3.5 |  |
| 2026-10-24 03:23 | 32 | judge 1 P5' sonnet | claude-haiku-5-5 | 1177 | 147 | $0.00019 | 1.1 |  |
| 2026-10-24 03:23 | 33 | judge 2 P5' sonnet | claude-haiku-5-5 | 1177 | 112 | $0.00017 | 2 |  |
| 2026-10-24 03:23 | 34 | subject sonnet dismissal/P5' | claude-sonnet-5-5 | 341 | 184 | $0.00252 | 1.7 |  |
| 2026-10-24 03:23 | 35 | judge 1 P5' sonnet | claude-haiku-5-5 | 1047 | 99 | $0.00015 | 0.9 |  |
| 2026-10-24 03:23 | 36 | judge 2 P5' sonnet | claude-haiku-5-5 | 1047 | 96 | $0.00015 | 1 |  |
| 2026-10-24 03:23 | 37 | subject fable dismissal/S3 | claude-fable-5-1 | 378 | 469 | $0.02723 | 10.1 |  |
| 2026-10-24 03:23 | 38 | judge 2 S3 fable | claude-haiku-5-5 | 1265 | 122 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 39 | judge 1 S3 fable | claude-haiku-5-5 | 1265 | 142 | $0.00020 | 1.3 |  |
| 2026-10-24 03:23 | 40 | subject opus dismissal-plain/S2 | claude-opus-5-5 | 346 | 381 | $0.00900 | 5.6 |  |
| 2026-10-24 03:23 | 41 | judge 2 S2 opus | claude-haiku-5-5 | 1209 | 129 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 42 | judge 1 S2 opus | claude-haiku-5-5 | 1209 | 119 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 43 | subject fable neutral/S2 | claude-fable-5-1 | 316 | 633 | $0.03481 | 11.6 |  |
| 2026-10-24 03:23 | 44 | judge 1 S2 fable | claude-haiku-5-5 | 1388 | 120 | $0.00020 | 0.9 |  |
| 2026-10-24 03:23 | 45 | judge 2 S2 fable | claude-haiku-5-5 | 1388 | 139 | $0.00021 | 1 |  |
| 2026-10-24 03:23 | 46 | subject opus neutral/S3 | claude-opus-5-5 | 344 | 530 | $0.01198 | 6.2 |  |
| 2026-10-24 03:23 | 47 | judge 1 S3 opus | claude-haiku-5-5 | 1316 | 120 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 48 | judge 2 S3 opus | claude-haiku-5-5 | 1316 | 124 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 49 | subject opus dismissal/S2 | claude-opus-5-5 | 350 | 294 | $0.00728 | 3.7 |  |
| 2026-10-24 03:23 | 50 | judge 2 S2 opus | claude-haiku-5-5 | 1123 | 118 | $0.00017 | 1 |  |
| 2026-10-24 03:23 | 51 | judge 1 S2 opus | claude-haiku-5-5 | 1123 | 113 | $0.00017 | 1.1 |  |
| 2026-10-24 03:23 | 52 | subject fable dismissal/P5' | claude-fable-5-1 | 341 | 552 | $0.03101 | 11.4 |  |
| 2026-10-24 03:23 | 53 | judge 1 P5' fable | claude-haiku-5-5 | 1113 | 128 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 54 | judge 2 P5' fable | claude-haiku-5-5 | 1113 | 136 | $0.00018 | 1.2 |  |
| 2026-10-24 03:23 | 55 | referee P5' fable | claude-opus-5-5 | 1113 | 324 | $0.01093 | 5.2 |  |
| 2026-10-24 03:23 | 56 | subject opus neutral/P5' | claude-opus-5-5 | 307 | 396 | $0.00915 | 4.7 |  |
| 2026-10-24 03:23 | 57 | judge 2 P5' opus | claude-haiku-5-5 | 1161 | 116 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 58 | judge 1 P5' opus | claude-haiku-5-5 | 1161 | 126 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 59 | subject sonnet dismissal/S2 | claude-sonnet-5-5 | 350 | 366 | $0.00436 | 3.3 |  |
| 2026-10-24 03:23 | 60 | judge 2 S2 sonnet | claude-haiku-5-5 | 1122 | 115 | $0.00017 | 1.1 |  |
| 2026-10-24 03:23 | 61 | judge 1 S2 sonnet | claude-haiku-5-5 | 1122 | 115 | $0.00017 | 1.2 |  |
| 2026-10-24 03:23 | 62 | subject sonnet dismissal/S3 | claude-sonnet-5-5 | 378 | 448 | $0.00524 | 4.1 |  |
| 2026-10-24 03:23 | 63 | judge 2 S3 sonnet | claude-haiku-5-5 | 1250 | 138 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 64 | judge 1 S3 sonnet | claude-haiku-5-5 | 1250 | 143 | $0.00020 | 1.1 |  |
| 2026-10-24 03:23 | 65 | subject sonnet dismissal-plain/S3 | claude-sonnet-5-5 | 374 | 525 | $0.00600 | 4.3 |  |
| 2026-10-24 03:23 | 66 | judge 1 S3 sonnet | claude-haiku-5-5 | 1305 | 134 | $0.00020 | 1.1 |  |
| 2026-10-24 03:23 | 67 | judge 2 S3 sonnet | claude-haiku-5-5 | 1305 | 135 | $0.00020 | 1.3 |  |
| 2026-10-24 03:23 | 68 | subject fable dismissal-plain/S3 | claude-fable-5-1 | 374 | 497 | $0.02859 | 7.7 |  |
| 2026-10-24 03:23 | 69 | judge 1 S3 fable | claude-haiku-5-5 | 1232 | 133 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 70 | judge 2 S3 fable | claude-haiku-5-5 | 1232 | 160 | $0.00020 | 1.1 |  |
| 2026-10-24 03:23 | 71 | subject fable neutral/P5' | claude-fable-5-1 | 307 | 394 | $0.02277 | 6.3 |  |
| 2026-10-24 03:23 | 72 | judge 1 P5' fable | claude-haiku-5-5 | 1178 | 124 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 73 | judge 2 P5' fable | claude-haiku-5-5 | 1178 | 145 | $0.00019 | 1.2 |  |
| 2026-10-24 03:23 | 74 | subject opus dismissal/P5' | claude-opus-5-5 | 341 | 395 | $0.00926 | 5 |  |
| 2026-10-24 03:23 | 75 | judge 2 P5' opus | claude-haiku-5-5 | 1113 | 626 | $0.00042 | 3.4 |  |
| 2026-10-24 03:23 | 76 | judge 1 P5' opus | claude-haiku-5-5 | 1113 | 604 | $0.00041 | 3.9 |  |
| 2026-10-24 03:23 | 77 | subject sonnet neutral/S3 | claude-sonnet-5-5 | 344 | 559 | $0.00628 | 4.9 |  |
| 2026-10-24 03:23 | 78 | referee P5' opus | claude-opus-5-5 | 1113 | 372 | $0.01189 | 4.3 |  |
| 2026-10-24 03:23 | 79 | judge 2 S3 sonnet | claude-haiku-5-5 | 1352 | 128 | $0.00020 | 1.1 |  |
| 2026-10-24 03:23 | 80 | judge 1 S3 sonnet | claude-haiku-5-5 | 1352 | 129 | $0.00020 | 1.3 |  |
| 2026-10-24 03:23 | 81 | subject sonnet dismissal-plain/S2 | claude-sonnet-5-5 | 346 | 344 | $0.00413 | 3.4 |  |
| 2026-10-24 03:23 | 82 | judge 1 S2 sonnet | claude-haiku-5-5 | 1149 | 116 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 83 | judge 2 S2 sonnet | claude-haiku-5-5 | 1149 | 120 | $0.00017 | 1 |  |
| 2026-10-24 03:23 | 84 | subject fable dismissal-plain/P5' | claude-fable-5-1 | 337 | 495 | $0.02812 | 9.2 |  |
| 2026-10-24 03:23 | 85 | judge 1 P5' fable | claude-haiku-5-5 | 1108 | 140 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 86 | judge 2 P5' fable | claude-haiku-5-5 | 1108 | 145 | $0.00018 | 1.2 |  |
| 2026-10-24 03:23 | 87 | referee P5' fable | claude-opus-5-5 | 1108 | 246 | $0.00935 | 3 |  |
| 2026-10-24 03:23 | 88 | subject sonnet dismissal-plain/S2 | claude-sonnet-5-5 | 346 | 345 | $0.00414 | 3.2 |  |
| 2026-10-24 03:23 | 89 | judge 2 S2 sonnet | claude-haiku-5-5 | 1122 | 95 | $0.00016 | 0.9 |  |
| 2026-10-24 03:23 | 90 | judge 1 S2 sonnet | claude-haiku-5-5 | 1122 | 136 | $0.00018 | 1.1 |  |
| 2026-10-24 03:23 | 91 | referee S2 sonnet | claude-opus-5-5 | 1122 | 202 | $0.00853 | 2.9 |  |
| 2026-10-24 03:23 | 92 | subject opus neutral/P5' | claude-opus-5-5 | 307 | 381 | $0.00885 | 5 |  |
| 2026-10-24 03:23 | 93 | judge 1 P5' opus | claude-haiku-5-5 | 1195 | 127 | $0.00018 | 1.1 |  |
| 2026-10-24 03:23 | 94 | judge 2 P5' opus | claude-haiku-5-5 | 1195 | 137 | $0.00019 | 1.1 |  |
| 2026-10-24 03:23 | 95 | subject fable dismissal-plain/S2 | claude-fable-5-1 | 346 | 494 | $0.02816 | 8.3 |  |
| 2026-10-24 03:23 | 96 | judge 2 S2 fable | claude-haiku-5-5 | 1196 | 114 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 97 | judge 1 S2 fable | claude-haiku-5-5 | 1196 | 115 | $0.00018 | 1.7 |  |
| 2026-10-24 03:23 | 98 | subject opus neutral/S2 | claude-opus-5-5 | 316 | 526 | $0.01178 | 5.7 |  |
| 2026-10-24 03:23 | 99 | judge 2 S2 opus | claude-haiku-5-5 | 1360 | 127 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 100 | judge 1 S2 opus | claude-haiku-5-5 | 1360 | 134 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 101 | subject opus dismissal-plain/P5' | claude-opus-5-5 | 337 | 330 | $0.00795 | 5.4 |  |
| 2026-10-24 03:23 | 102 | judge 1 P5' opus | claude-haiku-5-5 | 1132 | 154 | $0.00019 | 1.3 |  |
| 2026-10-24 03:23 | 103 | judge 2 P5' opus | claude-haiku-5-5 | 1132 | 158 | $0.00019 | 1.3 |  |
| 2026-10-24 03:23 | 104 | subject opus dismissal-plain/S3 | claude-opus-5-5 | 374 | 555 | $0.01260 | 6.5 |  |
| 2026-10-24 03:23 | 105 | judge 1 S3 opus | claude-haiku-5-5 | 1278 | 130 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 106 | judge 2 S3 opus | claude-haiku-5-5 | 1278 | 118 | $0.00019 | 1.1 |  |
| 2026-10-24 03:23 | 107 | subject sonnet dismissal-plain/P5' | claude-sonnet-5-5 | 337 | 183 | $0.00250 | 1.7 |  |
| 2026-10-24 03:23 | 108 | judge 1 P5' sonnet | claude-haiku-5-5 | 1049 | 105 | $0.00016 | 0.9 |  |
| 2026-10-24 03:23 | 109 | judge 2 P5' sonnet | claude-haiku-5-5 | 1049 | 110 | $0.00016 | 0.9 |  |
| 2026-10-24 03:23 | 110 | subject sonnet dismissal/S2 | claude-sonnet-5-5 | 350 | 359 | $0.00429 | 3.2 |  |
| 2026-10-24 03:23 | 111 | judge 1 S2 sonnet | claude-haiku-5-5 | 1119 | 117 | $0.00017 | 1.2 |  |
| 2026-10-24 03:23 | 112 | judge 2 S2 sonnet | claude-haiku-5-5 | 1119 | 100 | $0.00016 | 1.6 |  |
| 2026-10-24 03:23 | 113 | subject fable dismissal/S3 | claude-fable-5-1 | 378 | 654 | $0.03648 | 10.3 |  |
| 2026-10-24 03:23 | 114 | judge 1 S3 fable | claude-haiku-5-5 | 1370 | 154 | $0.00021 | 1 |  |
| 2026-10-24 03:23 | 115 | judge 2 S3 fable | claude-haiku-5-5 | 1370 | 139 | $0.00021 | 1 |  |
| 2026-10-24 03:23 | 116 | subject sonnet neutral/S2 | claude-sonnet-5-5 | 316 | 404 | $0.00467 | 3.5 |  |
| 2026-10-24 03:23 | 117 | judge 1 S2 sonnet | claude-haiku-5-5 | 1225 | 111 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 118 | judge 2 S2 sonnet | claude-haiku-5-5 | 1225 | 118 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 119 | subject opus dismissal/P5' | claude-opus-5-5 | 341 | 450 | $0.01036 | 5.3 |  |
| 2026-10-24 03:23 | 120 | judge 1 P5' opus | claude-haiku-5-5 | 1126 | 143 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 121 | judge 2 P5' opus | claude-haiku-5-5 | 1126 | 516 | $0.00037 | 2.7 |  |
| 2026-10-24 03:23 | 122 | referee P5' opus | claude-opus-5-5 | 1126 | 334 | $0.01118 | 3.9 |  |
| 2026-10-24 03:23 | 123 | subject opus neutral/S3 | claude-opus-5-5 | 344 | 553 | $0.01244 | 5.7 |  |
| 2026-10-24 03:23 | 124 | judge 1 S3 opus | claude-haiku-5-5 | 1344 | 118 | $0.00019 | 1.1 |  |
| 2026-10-24 03:23 | 125 | judge 2 S3 opus | claude-haiku-5-5 | 1344 | 129 | $0.00020 | 1.2 |  |
| 2026-10-24 03:23 | 126 | subject fable dismissal-plain/S3 | claude-fable-5-1 | 374 | 489 | $0.02819 | 7.6 |  |
| 2026-10-24 03:23 | 127 | judge 2 S3 fable | claude-haiku-5-5 | 1283 | 132 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 128 | judge 1 S3 fable | claude-haiku-5-5 | 1283 | 140 | $0.00020 | 1.1 |  |
| 2026-10-24 03:23 | 129 | subject fable dismissal/S2 | claude-fable-5-1 | 350 | 378 | $0.02240 | 5.6 |  |
| 2026-10-24 03:23 | 130 | judge 1 S2 fable | claude-haiku-5-5 | 1144 | 110 | $0.00017 | 1 |  |
| 2026-10-24 03:23 | 131 | judge 2 S2 fable | claude-haiku-5-5 | 1144 | 117 | $0.00017 | 2.1 |  |
| 2026-10-24 03:23 | 132 | subject fable neutral/S2 | claude-fable-5-1 | 316 | 415 | $0.02391 | 6.6 |  |
| 2026-10-24 03:23 | 133 | judge 1 S2 fable | claude-haiku-5-5 | 1234 | 108 | $0.00018 | 0.8 |  |
| 2026-10-24 03:23 | 134 | judge 2 S2 fable | claude-haiku-5-5 | 1234 | 110 | $0.00018 | 0.8 |  |
| 2026-10-24 03:23 | 135 | subject opus dismissal-plain/S2 | claude-opus-5-5 | 346 | 308 | $0.00754 | 5.2 |  |
| 2026-10-24 03:23 | 136 | judge 2 S2 opus | claude-haiku-5-5 | 1132 | 123 | $0.00017 | 1.2 |  |
| 2026-10-24 03:23 | 137 | judge 1 S2 opus | claude-haiku-5-5 | 1132 | 119 | $0.00017 | 1.7 |  |
| 2026-10-24 03:23 | 138 | subject fable neutral/S3 | claude-fable-5-1 | 344 | 652 | $0.03604 | 10.2 |  |
| 2026-10-24 03:23 | 139 | judge 2 S3 fable | claude-haiku-5-5 | 1357 | 140 | $0.00021 | 0.9 |  |
| 2026-10-24 03:23 | 140 | judge 1 S3 fable | claude-haiku-5-5 | 1357 | 119 | $0.00020 | 2.3 |  |
| 2026-10-24 03:23 | 141 | subject sonnet neutral/P5' | claude-sonnet-5-5 | 307 | 559 | $0.00620 | 4.8 |  |
| 2026-10-24 03:23 | 142 | judge 1 P5' sonnet | claude-haiku-5-5 | 1175 | 111 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 143 | judge 2 P5' sonnet | claude-haiku-5-5 | 1175 | 132 | $0.00018 | 1.4 |  |
| 2026-10-24 03:23 | 144 | subject fable neutral/P5' | claude-fable-5-1 | 307 | 405 | $0.02332 | 7.1 |  |
| 2026-10-24 03:23 | 145 | judge 2 P5' fable | claude-haiku-5-5 | 1200 | 106 | $0.00017 | 1.2 |  |
| 2026-10-24 03:23 | 146 | judge 1 P5' fable | claude-haiku-5-5 | 1200 | 111 | $0.00018 | 1.4 |  |
| 2026-10-24 03:23 | 147 | subject opus dismissal/S3 | claude-opus-5-5 | 378 | 460 | $0.01071 | 6.2 |  |
| 2026-10-24 03:23 | 148 | judge 2 S3 opus | claude-haiku-5-5 | 1257 | 136 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 149 | judge 1 S3 opus | claude-haiku-5-5 | 1257 | 123 | $0.00019 | 1.6 |  |
| 2026-10-24 03:23 | 150 | subject sonnet dismissal/S3 | claude-sonnet-5-5 | 378 | 505 | $0.00581 | 4.3 |  |
| 2026-10-24 03:23 | 151 | judge 2 S3 sonnet | claude-haiku-5-5 | 1274 | 128 | $0.00019 | 2.7 |  |
| 2026-10-24 03:23 | 152 | judge 1 S3 sonnet | claude-haiku-5-5 | 1274 | 134 | $0.00019 | 2.8 |  |
| 2026-10-24 03:23 | 153 | subject sonnet neutral/S3 | claude-sonnet-5-5 | 344 | 643 | $0.00712 | 5.3 |  |
| 2026-10-24 03:23 | 154 | judge 2 S3 sonnet | claude-haiku-5-5 | 1343 | 145 | $0.00021 | 1 |  |
| 2026-10-24 03:23 | 155 | judge 1 S3 sonnet | claude-haiku-5-5 | 1343 | 134 | $0.00020 | 1.1 |  |
| 2026-10-24 03:23 | 156 | subject opus dismissal/S2 | claude-opus-5-5 | 350 | 282 | $0.00704 | 3.5 |  |
| 2026-10-24 03:23 | 157 | judge 1 S2 opus | claude-haiku-5-5 | 1121 | 110 | $0.00017 | 0.8 |  |
| 2026-10-24 03:23 | 158 | judge 2 S2 opus | claude-haiku-5-5 | 1121 | 109 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 159 | subject sonnet dismissal-plain/S3 | claude-sonnet-5-5 | 374 | 536 | $0.00611 | 4.2 |  |
| 2026-10-24 03:23 | 160 | judge 2 S3 sonnet | claude-haiku-5-5 | 1278 | 144 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 161 | judge 1 S3 sonnet | claude-haiku-5-5 | 1278 | 136 | $0.00020 | 1.6 |  |
| 2026-10-24 03:23 | 162 | subject fable dismissal/P5' | claude-fable-5-1 | 341 | 513 | $0.02906 | 8.1 |  |
| 2026-10-24 03:23 | 163 | judge 1 P5' fable | claude-haiku-5-5 | 1129 | 140 | $0.00018 | 1.1 |  |
| 2026-10-24 03:23 | 164 | judge 2 P5' fable | claude-haiku-5-5 | 1129 | 129 | $0.00018 | 1.2 |  |
| 2026-10-24 03:23 | 165 | subject sonnet dismissal/P5' | claude-sonnet-5-5 | 341 | 186 | $0.00254 | 1.9 |  |
| 2026-10-24 03:23 | 166 | judge 2 P5' sonnet | claude-haiku-5-5 | 1046 | 113 | $0.00016 | 1 |  |
| 2026-10-24 03:23 | 167 | judge 1 P5' sonnet | claude-haiku-5-5 | 1046 | 107 | $0.00016 | 1.1 |  |
| 2026-10-24 03:23 | 168 | subject opus neutral/S3 | claude-opus-5-5 | 344 | 631 | $0.01400 | 6.6 |  |
| 2026-10-24 03:23 | 169 | judge 1 S3 opus | claude-haiku-5-5 | 1355 | 113 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 170 | judge 2 S3 opus | claude-haiku-5-5 | 1355 | 131 | $0.00020 | 1.3 |  |
| 2026-10-24 03:23 | 171 | referee S3 opus | claude-opus-5-5 | 1355 | 119 | $0.00780 | 2.3 |  |
| 2026-10-24 03:23 | 172 | subject sonnet dismissal-plain/S2 | claude-sonnet-5-5 | 346 | 512 | $0.00581 | 4.2 |  |
| 2026-10-24 03:23 | 173 | judge 1 S2 sonnet | claude-haiku-5-5 | 1127 | 107 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 174 | judge 2 S2 sonnet | claude-haiku-5-5 | 1127 | 113 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 175 | subject sonnet dismissal/P5' | claude-sonnet-5-5 | 341 | 190 | $0.00258 | 1.9 |  |
| 2026-10-24 03:23 | 176 | judge 1 P5' sonnet | claude-haiku-5-5 | 1043 | 104 | $0.00016 | 0.9 |  |
| 2026-10-24 03:23 | 177 | judge 2 P5' sonnet | claude-haiku-5-5 | 1043 | 94 | $0.00015 | 1 |  |
| 2026-10-24 03:23 | 178 | subject opus dismissal-plain/P5' | claude-opus-5-5 | 337 | 368 | $0.00871 | 5 |  |
| 2026-10-24 03:23 | 179 | judge 2 P5' opus | claude-haiku-5-5 | 1115 | 132 | $0.00018 | 1.1 |  |
| 2026-10-24 03:23 | 180 | judge 1 P5' opus | claude-haiku-5-5 | 1115 | 144 | $0.00018 | 1.2 |  |
| 2026-10-24 03:23 | 181 | subject fable dismissal/S2 | claude-fable-5-1 | 350 | 364 | $0.02170 | 5.5 |  |
| 2026-10-24 03:23 | 182 | judge 1 S2 fable | claude-haiku-5-5 | 1126 | 98 | $0.00016 | 0.8 |  |
| 2026-10-24 03:23 | 183 | judge 2 S2 fable | claude-haiku-5-5 | 1126 | 124 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 184 | subject sonnet dismissal-plain/S3 | claude-sonnet-5-5 | 374 | 608 | $0.00683 | 5.3 |  |
| 2026-10-24 03:23 | 185 | judge 2 S3 sonnet | claude-haiku-5-5 | 1293 | 140 | $0.00020 | 0.9 |  |
| 2026-10-24 03:23 | 186 | judge 1 S3 sonnet | claude-haiku-5-5 | 1293 | 113 | $0.00019 | 1.3 |  |
| 2026-10-24 03:23 | 187 | subject opus dismissal/S2 | claude-opus-5-5 | 350 | 338 | $0.00816 | 4.1 |  |
| 2026-10-24 03:23 | 188 | judge 1 S2 opus | claude-haiku-5-5 | 1129 | 108 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 189 | judge 2 S2 opus | claude-haiku-5-5 | 1129 | 114 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 190 | subject fable dismissal-plain/S3 | claude-fable-5-1 | 374 | 513 | $0.02939 | 7.7 |  |
| 2026-10-24 03:23 | 191 | judge 2 S3 fable | claude-haiku-5-5 | 1295 | 129 | $0.00019 | 1.7 |  |
| 2026-10-24 03:23 | 192 | judge 1 S3 fable | claude-haiku-5-5 | 1295 | 124 | $0.00019 | 1.8 |  |
| 2026-10-24 03:23 | 193 | subject fable neutral/P5' | claude-fable-5-1 | 307 | 378 | $0.02197 | 5.6 |  |
| 2026-10-24 03:23 | 194 | judge 2 P5' fable | claude-haiku-5-5 | 1156 | 135 | $0.00018 | 2.2 |  |
| 2026-10-24 03:23 | 195 | judge 1 P5' fable | claude-haiku-5-5 | 1156 | 129 | $0.00018 | 2.4 |  |
| 2026-10-24 03:23 | 196 | subject fable neutral/S3 | claude-fable-5-1 | 344 | 516 | $0.02924 | 7.7 |  |
| 2026-10-24 03:23 | 197 | judge 2 S3 fable | claude-haiku-5-5 | 1335 | 116 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 198 | judge 1 S3 fable | claude-haiku-5-5 | 1335 | 118 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 199 | subject sonnet dismissal-plain/P5' | claude-sonnet-5-5 | 337 | 184 | $0.00251 | 1.8 |  |
| 2026-10-24 03:23 | 200 | judge 2 P5' sonnet | claude-haiku-5-5 | 1048 | 102 | $0.00016 | 0.9 |  |
| 2026-10-24 03:23 | 201 | judge 1 P5' sonnet | claude-haiku-5-5 | 1048 | 93 | $0.00015 | 0.9 |  |
| 2026-10-24 03:23 | 202 | subject fable neutral/S2 | claude-fable-5-1 | 316 | 493 | $0.02781 | 7.8 |  |
| 2026-10-24 03:23 | 203 | judge 1 S2 fable | claude-haiku-5-5 | 1280 | 116 | $0.00019 | 1.1 |  |
| 2026-10-24 03:23 | 204 | judge 2 S2 fable | claude-haiku-5-5 | 1280 | 116 | $0.00019 | 1.1 |  |
| 2026-10-24 03:23 | 205 | subject fable dismissal/P5' | claude-fable-5-1 | 341 | 392 | $0.02301 | 7.1 |  |
| 2026-10-24 03:23 | 206 | judge 1 P5' fable | claude-haiku-5-5 | 1115 | 470 | $0.00035 | 2.4 |  |
| 2026-10-24 03:23 | 207 | judge 2 P5' fable | claude-haiku-5-5 | 1115 | 588 | $0.00041 | 3.9 |  |
| 2026-10-24 03:23 | 208 | subject fable dismissal-plain/S2 | claude-fable-5-1 | 346 | 525 | $0.02971 | 8.6 |  |
| 2026-10-24 03:23 | 209 | judge 1 S2 fable | claude-haiku-5-5 | 1219 | 130 | $0.00019 | 1.1 |  |
| 2026-10-24 03:23 | 210 | judge 2 S2 fable | claude-haiku-5-5 | 1219 | 117 | $0.00018 | 1.2 |  |
| 2026-10-24 03:23 | 211 | subject opus neutral/P5' | claude-opus-5-5 | 307 | 383 | $0.00889 | 4.5 |  |
| 2026-10-24 03:23 | 212 | judge 2 P5' opus | claude-haiku-5-5 | 1163 | 109 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 213 | judge 1 P5' opus | claude-haiku-5-5 | 1163 | 112 | $0.00017 | 1 |  |
| 2026-10-24 03:23 | 214 | subject opus dismissal-plain/S3 | claude-opus-5-5 | 374 | 561 | $0.01272 | 7.6 |  |
| 2026-10-24 03:23 | 215 | judge 1 S3 opus | claude-haiku-5-5 | 1281 | 139 | $0.00020 | 0.9 |  |
| 2026-10-24 03:23 | 216 | judge 2 S3 opus | claude-haiku-5-5 | 1281 | 121 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 217 | subject sonnet neutral/P5' | claude-sonnet-5-5 | 307 | 377 | $0.00438 | 3.7 |  |
| 2026-10-24 03:23 | 218 | judge 1 P5' sonnet | claude-haiku-5-5 | 1142 | 117 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 219 | judge 2 P5' sonnet | claude-haiku-5-5 | 1142 | 145 | $0.00019 | 1.1 |  |
| 2026-10-24 03:23 | 220 | subject sonnet dismissal/S2 | claude-sonnet-5-5 | 350 | 341 | $0.00411 | 2.9 |  |
| 2026-10-24 03:23 | 221 | judge 2 S2 sonnet | claude-haiku-5-5 | 1109 | 96 | $0.00016 | 1.3 |  |
| 2026-10-24 03:23 | 222 | judge 1 S2 sonnet | claude-haiku-5-5 | 1109 | 97 | $0.00016 | 1.5 |  |
| 2026-10-24 03:23 | 223 | subject opus dismissal/P5' | claude-opus-5-5 | 341 | 337 | $0.00810 | 4 |  |
| 2026-10-24 03:23 | 224 | judge 2 P5' opus | claude-haiku-5-5 | 1122 | 140 | $0.00018 | 1.2 |  |
| 2026-10-24 03:23 | 225 | judge 1 P5' opus | claude-haiku-5-5 | 1122 | 151 | $0.00019 | 1.4 |  |
| 2026-10-24 03:23 | 226 | subject sonnet neutral/S2 | claude-sonnet-5-5 | 316 | 474 | $0.00537 | 3.9 |  |
| 2026-10-24 03:23 | 227 | judge 1 S2 sonnet | claude-haiku-5-5 | 1228 | 129 | $0.00019 | 1.1 |  |
| 2026-10-24 03:23 | 228 | judge 2 S2 sonnet | claude-haiku-5-5 | 1228 | 119 | $0.00018 | 2.2 |  |
| 2026-10-24 03:23 | 229 | subject opus neutral/S2 | claude-opus-5-5 | 316 | 453 | $0.01032 | 4.9 |  |
| 2026-10-24 03:23 | 230 | judge 2 S2 opus | claude-haiku-5-5 | 1327 | 116 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 231 | judge 1 S2 opus | claude-haiku-5-5 | 1327 | 115 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 232 | subject fable dismissal/S3 | claude-fable-5-1 | 378 | 600 | $0.03378 | 9.1 |  |
| 2026-10-24 03:23 | 233 | judge 1 S3 fable | claude-haiku-5-5 | 1326 | 127 | $0.00020 | 1.2 |  |
| 2026-10-24 03:23 | 234 | judge 2 S3 fable | claude-haiku-5-5 | 1326 | 136 | $0.00020 | 1.2 |  |
| 2026-10-24 03:23 | 235 | subject opus dismissal-plain/S2 | claude-opus-5-5 | 346 | 305 | $0.00748 | 4 |  |
| 2026-10-24 03:23 | 236 | judge 1 S2 opus | claude-haiku-5-5 | 1139 | 112 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 237 | judge 2 S2 opus | claude-haiku-5-5 | 1139 | 117 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 238 | subject sonnet dismissal/S3 | claude-sonnet-5-5 | 378 | 547 | $0.00623 | 4.6 |  |
| 2026-10-24 03:23 | 239 | judge 2 S3 sonnet | claude-haiku-5-5 | 1285 | 128 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 240 | judge 1 S3 sonnet | claude-haiku-5-5 | 1285 | 135 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 241 | subject sonnet neutral/S3 | claude-sonnet-5-5 | 344 | 577 | $0.00646 | 4.7 |  |
| 2026-10-24 03:23 | 242 | judge 2 S3 sonnet | claude-haiku-5-5 | 1350 | 116 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 243 | judge 1 S3 sonnet | claude-haiku-5-5 | 1350 | 108 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 244 | subject fable dismissal-plain/P5' | claude-fable-5-1 | 337 | 448 | $0.02577 | 7.9 |  |
| 2026-10-24 03:23 | 245 | judge 1 P5' fable | claude-haiku-5-5 | 1133 | 109 | $0.00017 | 1.1 |  |
| 2026-10-24 03:23 | 246 | judge 2 P5' fable | claude-haiku-5-5 | 1133 | 125 | $0.00018 | 1.3 |  |
| 2026-10-24 03:23 | 247 | subject opus dismissal/S3 | claude-opus-5-5 | 378 | 520 | $0.01191 | 6 |  |
| 2026-10-24 03:23 | 248 | judge 1 S3 opus | claude-haiku-5-5 | 1263 | 138 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 249 | judge 2 S3 opus | claude-haiku-5-5 | 1263 | 136 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 250 | subject sonnet dismissal-plain/S2 | claude-sonnet-5-5 | 346 | 338 | $0.00407 | 3.5 |  |
| 2026-10-24 03:23 | 251 | judge 1 S2 sonnet | claude-haiku-5-5 | 1149 | 106 | $0.00017 | 0.8 |  |
| 2026-10-24 03:23 | 252 | judge 2 S2 sonnet | claude-haiku-5-5 | 1149 | 115 | $0.00017 | 1 |  |
| 2026-10-24 03:23 | 253 | subject fable dismissal/S3 | claude-fable-5-1 | 378 | 711 | $0.03933 | 10.8 |  |
| 2026-10-24 03:23 | 254 | judge 1 S3 fable | claude-haiku-5-5 | 1389 | 121 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 255 | judge 2 S3 fable | claude-haiku-5-5 | 1389 | 137 | $0.00021 | 1.3 |  |
| 2026-10-24 03:23 | 256 | subject fable dismissal-plain/P5' | claude-fable-5-1 | 337 | 459 | $0.02632 | 7.6 |  |
| 2026-10-24 03:23 | 257 | judge 2 P5' fable | claude-haiku-5-5 | 1136 | 126 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 258 | judge 1 P5' fable | claude-haiku-5-5 | 1136 | 141 | $0.00018 | 1.2 |  |
| 2026-10-24 03:23 | 259 | subject sonnet dismissal-plain/S3 | claude-sonnet-5-5 | 374 | 540 | $0.00615 | 4.4 |  |
| 2026-10-24 03:23 | 260 | judge 1 S3 sonnet | claude-haiku-5-5 | 1298 | 121 | $0.00019 | 1.1 |  |
| 2026-10-24 03:23 | 261 | judge 2 S3 sonnet | claude-haiku-5-5 | 1298 | 122 | $0.00019 | 6.3 |  |
| 2026-10-24 03:23 | 262 | subject fable neutral/S2 | claude-fable-5-1 | 316 | 491 | $0.02771 | 7.1 |  |
| 2026-10-24 03:23 | 263 | judge 2 S2 fable | claude-haiku-5-5 | 1279 | 114 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 264 | judge 1 S2 fable | claude-haiku-5-5 | 1279 | 109 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 265 | subject sonnet dismissal/S3 | claude-sonnet-5-5 | 378 | 499 | $0.00575 | 4.1 |  |
| 2026-10-24 03:23 | 266 | judge 2 S3 sonnet | claude-haiku-5-5 | 1290 | 116 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 267 | judge 1 S3 sonnet | claude-haiku-5-5 | 1290 | 110 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 268 | subject fable neutral/P5' | claude-fable-5-1 | 307 | 373 | $0.02172 | 6.3 |  |
| 2026-10-24 03:23 | 269 | judge 1 P5' fable | claude-haiku-5-5 | 1167 | 125 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 270 | judge 2 P5' fable | claude-haiku-5-5 | 1167 | 126 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 271 | subject opus dismissal/S2 | claude-opus-5-5 | 350 | 277 | $0.00694 | 3.6 |  |
| 2026-10-24 03:23 | 272 | judge 2 S2 opus | claude-haiku-5-5 | 1120 | 123 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 273 | judge 1 S2 opus | claude-haiku-5-5 | 1120 | 118 | $0.00017 | 1 |  |
| 2026-10-24 03:23 | 274 | subject opus dismissal-plain/P5' | claude-opus-5-5 | 337 | 306 | $0.00747 | 4 |  |
| 2026-10-24 03:23 | 275 | judge 1 P5' opus | claude-haiku-5-5 | 1136 | 127 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 276 | judge 2 P5' opus | claude-haiku-5-5 | 1136 | 142 | $0.00018 | 1.2 |  |
| 2026-10-24 03:23 | 277 | subject sonnet neutral/S3 | claude-sonnet-5-5 | 344 | 605 | $0.00674 | 5.2 |  |
| 2026-10-24 03:23 | 278 | judge 1 S3 sonnet | claude-haiku-5-5 | 1403 | 132 | $0.00021 | 1.1 |  |
| 2026-10-24 03:23 | 279 | judge 2 S3 sonnet | claude-haiku-5-5 | 1403 | 122 | $0.00020 | 1.4 |  |
| 2026-10-24 03:23 | 280 | subject sonnet neutral/P5' | claude-sonnet-5-5 | 307 | 379 | $0.00440 | 4.1 |  |
| 2026-10-24 03:23 | 281 | judge 2 P5' sonnet | claude-haiku-5-5 | 1176 | 115 | $0.00018 | 1.7 |  |
| 2026-10-24 03:23 | 282 | judge 1 P5' sonnet | claude-haiku-5-5 | 1176 | 124 | $0.00018 | 1.8 |  |
| 2026-10-24 03:23 | 283 | subject sonnet dismissal/S2 | claude-sonnet-5-5 | 350 | 363 | $0.00433 | 3 |  |
| 2026-10-24 03:23 | 284 | judge 1 S2 sonnet | claude-haiku-5-5 | 1131 | 116 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 285 | judge 2 S2 sonnet | claude-haiku-5-5 | 1131 | 122 | $0.00017 | 1 |  |
| 2026-10-24 03:23 | 286 | subject sonnet dismissal-plain/P5' | claude-sonnet-5-5 | 337 | 185 | $0.00252 | 1.9 |  |
| 2026-10-24 03:23 | 287 | judge 1 P5' sonnet | claude-haiku-5-5 | 1048 | 93 | $0.00015 | 0.8 |  |
| 2026-10-24 03:23 | 288 | judge 2 P5' sonnet | claude-haiku-5-5 | 1048 | 105 | $0.00016 | 1.4 |  |
| 2026-10-24 03:23 | 289 | subject opus dismissal-plain/S2 | claude-opus-5-5 | 346 | 383 | $0.00904 | 5 |  |
| 2026-10-24 03:23 | 290 | judge 1 S2 opus | claude-haiku-5-5 | 1178 | 124 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 291 | judge 2 S2 opus | claude-haiku-5-5 | 1178 | 99 | $0.00017 | 1.4 |  |
| 2026-10-24 03:23 | 292 | subject opus dismissal/P5' | claude-opus-5-5 | 341 | 395 | $0.00926 | 5.3 |  |
| 2026-10-24 03:23 | 293 | judge 2 P5' opus | claude-haiku-5-5 | 1130 | 120 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 294 | judge 1 P5' opus | claude-haiku-5-5 | 1130 | 154 | $0.00019 | 1.1 |  |
| 2026-10-24 03:23 | 295 | referee P5' opus | claude-opus-5-5 | 1130 | 293 | $0.01038 | 4 |  |
| 2026-10-24 03:23 | 296 | subject sonnet neutral/S2 | claude-sonnet-5-5 | 316 | 389 | $0.00452 | 3.3 |  |
| 2026-10-24 03:23 | 297 | judge 1 S2 sonnet | claude-haiku-5-5 | 1199 | 122 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 298 | judge 2 S2 sonnet | claude-haiku-5-5 | 1199 | 124 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 299 | subject opus dismissal-plain/S3 | claude-opus-5-5 | 374 | 573 | $0.01296 | 6.5 |  |
| 2026-10-24 03:23 | 300 | judge 2 S3 opus | claude-haiku-5-5 | 1297 | 130 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 301 | judge 1 S3 opus | claude-haiku-5-5 | 1297 | 132 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 302 | subject opus dismissal/S3 | claude-opus-5-5 | 378 | 476 | $0.01103 | 5.4 |  |
| 2026-10-24 03:23 | 303 | judge 1 S3 opus | claude-haiku-5-5 | 1240 | 107 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 304 | judge 2 S3 opus | claude-haiku-5-5 | 1240 | 111 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 305 | subject sonnet dismissal/P5' | claude-sonnet-5-5 | 341 | 184 | $0.00252 | 1.6 |  |
| 2026-10-24 03:23 | 306 | judge 2 P5' sonnet | claude-haiku-5-5 | 1046 | 94 | $0.00015 | 0.8 |  |
| 2026-10-24 03:23 | 307 | judge 1 P5' sonnet | claude-haiku-5-5 | 1046 | 98 | $0.00015 | 0.8 |  |
| 2026-10-24 03:23 | 308 | subject opus neutral/S3 | claude-opus-5-5 | 344 | 595 | $0.01328 | 8.5 |  |
| 2026-10-24 03:23 | 309 | judge 2 S3 opus | claude-haiku-5-5 | 1354 | 128 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 310 | judge 1 S3 opus | claude-haiku-5-5 | 1354 | 139 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 311 | subject fable dismissal/S2 | claude-fable-5-1 | 350 | 417 | $0.02435 | 6.9 |  |
| 2026-10-24 03:23 | 312 | judge 1 S2 fable | claude-haiku-5-5 | 1156 | 118 | $0.00017 | 1.1 |  |
| 2026-10-24 03:23 | 313 | judge 2 S2 fable | claude-haiku-5-5 | 1156 | 115 | $0.00017 | 2 |  |
| 2026-10-24 03:23 | 314 | subject fable neutral/S3 | claude-fable-5-1 | 344 | 620 | $0.03444 | 10.3 |  |
| 2026-10-24 03:23 | 315 | judge 1 S3 fable | claude-haiku-5-5 | 1417 | 113 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 316 | judge 2 S3 fable | claude-haiku-5-5 | 1417 | 131 | $0.00021 | 1.1 |  |
| 2026-10-24 03:23 | 317 | subject fable dismissal-plain/S2 | claude-fable-5-1 | 346 | 399 | $0.02341 | 5.9 |  |
| 2026-10-24 03:23 | 318 | judge 1 S2 fable | claude-haiku-5-5 | 1166 | 115 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 319 | judge 2 S2 fable | claude-haiku-5-5 | 1166 | 116 | $0.00017 | 1 |  |
| 2026-10-24 03:23 | 320 | subject opus neutral/P5' | claude-opus-5-5 | 307 | 422 | $0.00967 | 6.3 |  |
| 2026-10-24 03:23 | 321 | judge 2 P5' opus | claude-haiku-5-5 | 1226 | 102 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 322 | judge 1 P5' opus | claude-haiku-5-5 | 1226 | 108 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 323 | subject opus neutral/S2 | claude-opus-5-5 | 316 | 594 | $0.01314 | 6 |  |
| 2026-10-24 03:23 | 324 | judge 2 S2 opus | claude-haiku-5-5 | 1442 | 108 | $0.00020 | 0.9 |  |
| 2026-10-24 03:23 | 325 | judge 1 S2 opus | claude-haiku-5-5 | 1442 | 122 | $0.00021 | 1.3 |  |
| 2026-10-24 03:23 | 326 | subject fable dismissal/P5' | claude-fable-5-1 | 341 | 306 | $0.01871 | 4.6 |  |
| 2026-10-24 03:23 | 327 | judge 1 P5' fable | claude-haiku-5-5 | 1064 | 98 | $0.00016 | 1.6 |  |
| 2026-10-24 03:23 | 328 | judge 2 P5' fable | claude-haiku-5-5 | 1064 | 116 | $0.00016 | 1.6 |  |
| 2026-10-24 03:23 | 329 | subject fable dismissal-plain/S3 | claude-fable-5-1 | 374 | 586 | $0.03304 | 9 |  |
| 2026-10-24 03:23 | 330 | judge 2 S3 fable | claude-haiku-5-5 | 1315 | 136 | $0.00020 | 0.9 |  |
| 2026-10-24 03:23 | 331 | judge 1 S3 fable | claude-haiku-5-5 | 1315 | 132 | $0.00020 | 1.4 |  |
| 2026-10-24 03:23 | 332 | subject sonnet dismissal-plain/S2 | claude-sonnet-5-5 | 346 | 352 | $0.00421 | 3.2 |  |
| 2026-10-24 03:23 | 333 | judge 1 S2 sonnet | claude-haiku-5-5 | 1132 | 103 | $0.00016 | 0.9 |  |
| 2026-10-24 03:23 | 334 | judge 2 S2 sonnet | claude-haiku-5-5 | 1132 | 121 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 335 | subject opus dismissal-plain/S3 | claude-opus-5-5 | 374 | 504 | $0.01158 | 6.5 |  |
| 2026-10-24 03:23 | 336 | judge 2 S3 opus | claude-haiku-5-5 | 1280 | 129 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 337 | judge 1 S3 opus | claude-haiku-5-5 | 1280 | 134 | $0.00019 | 1.1 |  |
| 2026-10-24 03:23 | 338 | subject opus dismissal/S3 | claude-opus-5-5 | 378 | 519 | $0.01189 | 6.3 |  |
| 2026-10-24 03:23 | 339 | judge 2 S3 opus | claude-haiku-5-5 | 1268 | 129 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 340 | judge 1 S3 opus | claude-haiku-5-5 | 1268 | 138 | $0.00020 | 1.2 |  |
| 2026-10-24 03:23 | 341 | subject sonnet dismissal-plain/S3 | claude-sonnet-5-5 | 374 | 528 | $0.00603 | 4.6 |  |
| 2026-10-24 03:23 | 342 | judge 2 S3 sonnet | claude-haiku-5-5 | 1263 | 129 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 343 | judge 1 S3 sonnet | claude-haiku-5-5 | 1263 | 137 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 344 | subject opus neutral/P5' | claude-opus-5-5 | 307 | 342 | $0.00807 | 4.6 |  |
| 2026-10-24 03:23 | 345 | judge 1 P5' opus | claude-haiku-5-5 | 1180 | 125 | $0.00018 | 1.5 |  |
| 2026-10-24 03:23 | 346 | judge 2 P5' opus | claude-haiku-5-5 | 1180 | 122 | $0.00018 | 1.7 |  |
| 2026-10-24 03:23 | 347 | subject opus dismissal-plain/S2 | claude-opus-5-5 | 346 | 322 | $0.00782 | 4.1 |  |
| 2026-10-24 03:23 | 348 | judge 1 S2 opus | claude-haiku-5-5 | 1119 | 115 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 349 | judge 2 S2 opus | claude-haiku-5-5 | 1119 | 113 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 350 | subject fable dismissal-plain/P5' | claude-fable-5-1 | 337 | 512 | $0.02897 | 8.4 |  |
| 2026-10-24 03:23 | 351 | judge 2 P5' fable | claude-haiku-5-5 | 1140 | 119 | $0.00017 | 1.1 |  |
| 2026-10-24 03:23 | 352 | judge 1 P5' fable | claude-haiku-5-5 | 1140 | 409 | $0.00032 | 2.6 |  |
| 2026-10-24 03:23 | 353 | referee P5' fable | claude-opus-5-5 | 1140 | 271 | $0.00998 | 6.5 |  |
| 2026-10-24 03:23 | 354 | subject fable dismissal/P5' | claude-fable-5-1 | 341 | 444 | $0.02561 | 6.6 |  |
| 2026-10-24 03:23 | 355 | judge 2 P5' fable | claude-haiku-5-5 | 1060 | 83 | $0.00015 | 0.9 |  |
| 2026-10-24 03:23 | 356 | judge 1 P5' fable | claude-haiku-5-5 | 1060 | 96 | $0.00015 | 0.9 |  |
| 2026-10-24 03:23 | 357 | subject sonnet dismissal/S2 | claude-sonnet-5-5 | 350 | 402 | $0.00472 | 3.4 |  |
| 2026-10-24 03:23 | 358 | judge 1 S2 sonnet | claude-haiku-5-5 | 1123 | 104 | $0.00016 | 1 |  |
| 2026-10-24 03:23 | 359 | judge 2 S2 sonnet | claude-haiku-5-5 | 1123 | 94 | $0.00016 | 1.1 |  |
| 2026-10-24 03:23 | 360 | subject fable dismissal/S3 | claude-fable-5-1 | 378 | 521 | $0.02983 | 9 |  |
| 2026-10-24 03:23 | 361 | judge 2 S3 fable | claude-haiku-5-5 | 1278 | 117 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 362 | judge 1 S3 fable | claude-haiku-5-5 | 1278 | 135 | $0.00020 | 1.1 |  |
| 2026-10-24 03:23 | 363 | subject opus dismissal-plain/P5' | claude-opus-5-5 | 337 | 415 | $0.00965 | 5.3 |  |
| 2026-10-24 03:23 | 364 | judge 1 P5' opus | claude-haiku-5-5 | 1108 | 130 | $0.00018 | 1.1 |  |
| 2026-10-24 03:23 | 365 | judge 2 P5' opus | claude-haiku-5-5 | 1108 | 144 | $0.00018 | 1.2 |  |
| 2026-10-24 03:23 | 366 | subject fable dismissal-plain/S2 | claude-fable-5-1 | 346 | 448 | $0.02586 | 6.7 |  |
| 2026-10-24 03:23 | 367 | judge 1 S2 fable | claude-haiku-5-5 | 1195 | 119 | $0.00018 | 1.2 |  |
| 2026-10-24 03:23 | 368 | judge 2 S2 fable | claude-haiku-5-5 | 1195 | 118 | $0.00018 | 1.4 |  |
| 2026-10-24 03:23 | 369 | subject opus neutral/S2 | claude-opus-5-5 | 316 | 494 | $0.01114 | 13.9 |  |
| 2026-10-24 03:23 | 370 | judge 1 S2 opus | claude-haiku-5-5 | 1343 | 104 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 371 | judge 2 S2 opus | claude-haiku-5-5 | 1343 | 112 | $0.00019 | 1.2 |  |
| 2026-10-24 03:23 | 372 | subject sonnet dismissal/S3 | claude-sonnet-5-5 | 378 | 533 | $0.00609 | 4.6 |  |
| 2026-10-24 03:23 | 373 | judge 2 S3 sonnet | claude-haiku-5-5 | 1292 | 119 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 374 | judge 1 S3 sonnet | claude-haiku-5-5 | 1292 | 122 | $0.00019 | 1.7 |  |
| 2026-10-24 03:23 | 375 | subject fable neutral/S2 | claude-fable-5-1 | 316 | 460 | $0.02616 | 6.7 |  |
| 2026-10-24 03:23 | 376 | judge 1 S2 fable | claude-haiku-5-5 | 1242 | 129 | $0.00019 | 1.1 |  |
| 2026-10-24 03:23 | 377 | judge 2 S2 fable | claude-haiku-5-5 | 1242 | 115 | $0.00018 | 1.1 |  |
| 2026-10-24 03:23 | 378 | subject opus dismissal/P5' | claude-opus-5-5 | 341 | 324 | $0.00784 | 4.1 |  |
| 2026-10-24 03:23 | 379 | judge 1 P5' opus | claude-haiku-5-5 | 1124 | 128 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 380 | judge 2 P5' opus | claude-haiku-5-5 | 1124 | 125 | $0.00017 | 1.1 |  |
| 2026-10-24 03:23 | 381 | subject sonnet dismissal-plain/P5' | claude-sonnet-5-5 | 337 | 224 | $0.00291 | 11.2 |  |
| 2026-10-24 03:23 | 382 | judge 2 P5' sonnet | claude-haiku-5-5 | 1061 | 87 | $0.00015 | 0.9 |  |
| 2026-10-24 03:23 | 383 | judge 1 P5' sonnet | claude-haiku-5-5 | 1061 | 92 | $0.00015 | 1 |  |
| 2026-10-24 03:23 | 384 | subject sonnet dismissal/P5' | claude-sonnet-5-5 | 341 | 198 | $0.00266 | 1.9 |  |
| 2026-10-24 03:23 | 385 | judge 2 P5' sonnet | claude-haiku-5-5 | 1046 | 90 | $0.00015 | 0.9 |  |
| 2026-10-24 03:23 | 386 | judge 1 P5' sonnet | claude-haiku-5-5 | 1046 | 110 | $0.00016 | 2.1 |  |
| 2026-10-24 03:23 | 387 | subject sonnet neutral/S2 | claude-sonnet-5-5 | 316 | 421 | $0.00484 | 6.8 |  |
| 2026-10-24 03:23 | 388 | judge 2 S2 sonnet | claude-haiku-5-5 | 1219 | 115 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 389 | judge 1 S2 sonnet | claude-haiku-5-5 | 1219 | 119 | $0.00018 | 1.1 |  |
| 2026-10-24 03:23 | 390 | subject fable dismissal-plain/S3 | claude-fable-5-1 | 374 | 532 | $0.03034 | 7.4 |  |
| 2026-10-24 03:23 | 391 | judge 2 S3 fable | claude-haiku-5-5 | 1308 | 124 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 392 | judge 1 S3 fable | claude-haiku-5-5 | 1308 | 121 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 393 | subject opus neutral/S3 | claude-opus-5-5 | 344 | 557 | $0.01252 | 6.1 |  |
| 2026-10-24 03:23 | 394 | judge 1 S3 opus | claude-haiku-5-5 | 1361 | 123 | $0.00020 | 0.9 |  |
| 2026-10-24 03:23 | 395 | judge 2 S3 opus | claude-haiku-5-5 | 1361 | 127 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 396 | subject fable neutral/P5' | claude-fable-5-1 | 307 | 410 | $0.02357 | 6.4 |  |
| 2026-10-24 03:23 | 397 | judge 2 P5' fable | claude-haiku-5-5 | 1205 | 109 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 398 | judge 1 P5' fable | claude-haiku-5-5 | 1205 | 153 | $0.00020 | 1.1 |  |
| 2026-10-24 03:23 | 399 | subject opus dismissal/S2 | claude-opus-5-5 | 350 | 270 | $0.00680 | 3.4 |  |
| 2026-10-24 03:23 | 400 | judge 2 S2 opus | claude-haiku-5-5 | 1120 | 111 | $0.00017 | 0.8 |  |
| 2026-10-24 03:23 | 401 | judge 1 S2 opus | claude-haiku-5-5 | 1120 | 98 | $0.00016 | 1 |  |
| 2026-10-24 03:23 | 402 | subject fable dismissal/S2 | claude-fable-5-1 | 350 | 396 | $0.02330 | 8.3 |  |
| 2026-10-24 03:23 | 403 | judge 2 S2 fable | claude-haiku-5-5 | 1159 | 116 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 404 | judge 1 S2 fable | claude-haiku-5-5 | 1159 | 113 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 405 | subject fable neutral/S3 | claude-fable-5-1 | 344 | 631 | $0.03499 | 10.5 |  |
| 2026-10-24 03:23 | 406 | judge 1 S3 fable | claude-haiku-5-5 | 1402 | 111 | $0.00020 | 0.9 |  |
| 2026-10-24 03:23 | 407 | judge 2 S3 fable | claude-haiku-5-5 | 1402 | 141 | $0.00021 | 1 |  |
| 2026-10-24 03:23 | 408 | subject sonnet neutral/S3 | claude-sonnet-5-5 | 344 | 598 | $0.00667 | 5.9 |  |
| 2026-10-24 03:23 | 409 | judge 1 S3 sonnet | claude-haiku-5-5 | 1361 | 133 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 410 | judge 2 S3 sonnet | claude-haiku-5-5 | 1361 | 139 | $0.00021 | 1.1 |  |
| 2026-10-24 03:23 | 411 | subject sonnet neutral/P5' | claude-sonnet-5-5 | 307 | 386 | $0.00447 | 4 |  |
| 2026-10-24 03:23 | 412 | judge 1 P5' sonnet | claude-haiku-5-5 | 1169 | 143 | $0.00019 | 1.3 |  |
| 2026-10-24 03:23 | 413 | judge 2 P5' sonnet | claude-haiku-5-5 | 1169 | 160 | $0.00020 | 1.4 |  |
| 2026-10-24 03:23 | 414 | referee P5' sonnet | claude-opus-5-5 | 1169 | 113 | $0.00694 | 2 |  |
| 2026-10-24 03:23 | 415 | subject opus dismissal/P5' | claude-opus-5-5 | 341 | 367 | $0.00870 | 4.5 |  |
| 2026-10-24 03:23 | 416 | judge 2 P5' opus | claude-haiku-5-5 | 1125 | 115 | $0.00017 | 1 |  |
| 2026-10-24 03:23 | 417 | judge 1 P5' opus | claude-haiku-5-5 | 1125 | 151 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 418 | subject opus dismissal-plain/S3 | claude-opus-5-5 | 374 | 521 | $0.01192 | 6.4 |  |
| 2026-10-24 03:23 | 419 | judge 2 S3 opus | claude-haiku-5-5 | 1285 | 113 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 420 | judge 1 S3 opus | claude-haiku-5-5 | 1285 | 138 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 421 | subject fable neutral/S3 | claude-fable-5-1 | 344 | 628 | $0.03484 | 11.8 |  |
| 2026-10-24 03:23 | 422 | judge 2 S3 fable | claude-haiku-5-5 | 1422 | 142 | $0.00021 | 1.2 |  |
| 2026-10-24 03:23 | 423 | judge 1 S3 fable | claude-haiku-5-5 | 1422 | 137 | $0.00021 | 1.4 |  |
| 2026-10-24 03:23 | 424 | subject sonnet dismissal/S2 | claude-sonnet-5-5 | 350 | 320 | $0.00390 | 2.8 |  |
| 2026-10-24 03:23 | 425 | judge 2 S2 sonnet | claude-haiku-5-5 | 1104 | 120 | $0.00017 | 1 |  |
| 2026-10-24 03:23 | 426 | judge 1 S2 sonnet | claude-haiku-5-5 | 1104 | 130 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 427 | subject fable dismissal-plain/S3 | claude-fable-5-1 | 374 | 501 | $0.02879 | 9.3 |  |
| 2026-10-24 03:23 | 428 | judge 2 S3 fable | claude-haiku-5-5 | 1264 | 131 | $0.00019 | 1.1 |  |
| 2026-10-24 03:23 | 429 | judge 1 S3 fable | claude-haiku-5-5 | 1264 | 147 | $0.00020 | 1.2 |  |
| 2026-10-24 03:23 | 430 | subject opus dismissal/S2 | claude-opus-5-5 | 350 | 286 | $0.00712 | 3.6 |  |
| 2026-10-24 03:23 | 431 | judge 1 S2 opus | claude-haiku-5-5 | 1122 | 130 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 432 | judge 2 S2 opus | claude-haiku-5-5 | 1122 | 122 | $0.00017 | 1 |  |
| 2026-10-24 03:23 | 433 | subject sonnet dismissal-plain/P5' | claude-sonnet-5-5 | 337 | 201 | $0.00268 | 1.7 |  |
| 2026-10-24 03:23 | 434 | judge 2 P5' sonnet | claude-haiku-5-5 | 1060 | 110 | $0.00016 | 0.8 |  |
| 2026-10-24 03:23 | 435 | judge 1 P5' sonnet | claude-haiku-5-5 | 1060 | 93 | $0.00015 | 1.4 |  |
| 2026-10-24 03:23 | 436 | subject fable dismissal-plain/P5' | claude-fable-5-1 | 337 | 410 | $0.02387 | 8.1 |  |
| 2026-10-24 03:23 | 437 | judge 2 P5' fable | claude-haiku-5-5 | 1170 | 160 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 438 | judge 1 P5' fable | claude-haiku-5-5 | 1170 | 157 | $0.00020 | 1.1 |  |
| 2026-10-24 03:23 | 439 | subject opus neutral/S3 | claude-opus-5-5 | 344 | 568 | $0.01274 | 6.4 |  |
| 2026-10-24 03:23 | 440 | judge 2 S3 opus | claude-haiku-5-5 | 1365 | 134 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 441 | judge 1 S3 opus | claude-haiku-5-5 | 1365 | 134 | $0.00020 | 2 |  |
| 2026-10-24 03:23 | 442 | subject sonnet dismissal/P5' | claude-sonnet-5-5 | 341 | 194 | $0.00262 | 1.8 |  |
| 2026-10-24 03:23 | 443 | judge 1 P5' sonnet | claude-haiku-5-5 | 1048 | 94 | $0.00015 | 1 |  |
| 2026-10-24 03:23 | 444 | judge 2 P5' sonnet | claude-haiku-5-5 | 1048 | 89 | $0.00015 | 1 |  |
| 2026-10-24 03:23 | 445 | subject opus neutral/S2 | claude-opus-5-5 | 316 | 505 | $0.01136 | 5.2 |  |
| 2026-10-24 03:23 | 446 | judge 1 S2 opus | claude-haiku-5-5 | 1361 | 120 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 447 | judge 2 S2 opus | claude-haiku-5-5 | 1361 | 128 | $0.00020 | 1.1 |  |
| 2026-10-24 03:23 | 448 | subject fable neutral/S2 | claude-fable-5-1 | 316 | 498 | $0.02806 | 7.7 |  |
| 2026-10-24 03:23 | 449 | judge 2 S2 fable | claude-haiku-5-5 | 1292 | 137 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 450 | judge 1 S2 fable | claude-haiku-5-5 | 1292 | 134 | $0.00020 | 1.1 |  |
| 2026-10-24 03:23 | 451 | subject sonnet neutral/S2 | claude-sonnet-5-5 | 316 | 431 | $0.00494 | 3.8 |  |
| 2026-10-24 03:23 | 452 | judge 2 S2 sonnet | claude-haiku-5-5 | 1245 | 116 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 453 | judge 1 S2 sonnet | claude-haiku-5-5 | 1245 | 118 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 454 | subject opus dismissal-plain/S2 | claude-opus-5-5 | 346 | 293 | $0.00724 | 3.6 |  |
| 2026-10-24 03:23 | 455 | judge 2 S2 opus | claude-haiku-5-5 | 1134 | 100 | $0.00016 | 0.8 |  |
| 2026-10-24 03:23 | 456 | judge 1 S2 opus | claude-haiku-5-5 | 1134 | 125 | $0.00018 | 1.6 |  |
| 2026-10-24 03:23 | 457 | subject fable dismissal/S2 | claude-fable-5-1 | 350 | 435 | $0.02525 | 6.6 |  |
| 2026-10-24 03:23 | 458 | judge 2 S2 fable | claude-haiku-5-5 | 1206 | 107 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 459 | judge 1 S2 fable | claude-haiku-5-5 | 1206 | 114 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 460 | subject fable neutral/P5' | claude-fable-5-1 | 307 | 385 | $0.02232 | 6 |  |
| 2026-10-24 03:23 | 461 | judge 1 P5' fable | claude-haiku-5-5 | 1141 | 141 | $0.00018 | 1.1 |  |
| 2026-10-24 03:23 | 462 | judge 2 P5' fable | claude-haiku-5-5 | 1141 | 126 | $0.00018 | 1.9 |  |
| 2026-10-24 03:23 | 463 | referee P5' fable | claude-opus-5-5 | 1141 | 198 | $0.00852 | 2.6 |  |
| 2026-10-24 03:23 | 464 | subject fable dismissal/S3 | claude-fable-5-1 | 378 | 546 | $0.03108 | 8.2 |  |
| 2026-10-24 03:23 | 465 | judge 1 S3 fable | claude-haiku-5-5 | 1254 | 128 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 466 | judge 2 S3 fable | claude-haiku-5-5 | 1254 | 116 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 467 | subject fable dismissal-plain/S2 | claude-fable-5-1 | 346 | 390 | $0.02296 | 7.7 |  |
| 2026-10-24 03:23 | 468 | judge 2 S2 fable | claude-haiku-5-5 | 1174 | 130 | $0.00018 | 1.1 |  |
| 2026-10-24 03:23 | 469 | judge 1 S2 fable | claude-haiku-5-5 | 1174 | 111 | $0.00017 | 1.5 |  |
| 2026-10-24 03:23 | 470 | subject fable dismissal/P5' | claude-fable-5-1 | 341 | 439 | $0.02536 | 9.1 |  |
| 2026-10-24 03:23 | 471 | judge 1 P5' fable | claude-haiku-5-5 | 1058 | 110 | $0.00016 | 0.9 |  |
| 2026-10-24 03:23 | 472 | judge 2 P5' fable | claude-haiku-5-5 | 1058 | 147 | $0.00018 | 1.2 |  |
| 2026-10-24 03:23 | 473 | subject sonnet dismissal-plain/S3 | claude-sonnet-5-5 | 374 | 485 | $0.00560 | 4.4 |  |
| 2026-10-24 03:23 | 474 | judge 2 S3 sonnet | claude-haiku-5-5 | 1276 | 129 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 475 | judge 1 S3 sonnet | claude-haiku-5-5 | 1276 | 134 | $0.00019 | 1.1 |  |
| 2026-10-24 03:23 | 476 | subject sonnet dismissal-plain/S2 | claude-sonnet-5-5 | 346 | 347 | $0.00416 | 3.2 |  |
| 2026-10-24 03:23 | 477 | judge 2 S2 sonnet | claude-haiku-5-5 | 1124 | 93 | $0.00016 | 0.7 |  |
| 2026-10-24 03:23 | 478 | judge 1 S2 sonnet | claude-haiku-5-5 | 1124 | 102 | $0.00016 | 0.8 |  |
| 2026-10-24 03:23 | 479 | subject sonnet dismissal/S3 | claude-sonnet-5-5 | 378 | 492 | $0.00568 | 4.2 |  |
| 2026-10-24 03:23 | 480 | judge 2 S3 sonnet | claude-haiku-5-5 | 1278 | 124 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 481 | judge 1 S3 sonnet | claude-haiku-5-5 | 1278 | 114 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 482 | subject opus dismissal/S3 | claude-opus-5-5 | 378 | 452 | $0.01055 | 5.2 |  |
| 2026-10-24 03:23 | 483 | judge 1 S3 opus | claude-haiku-5-5 | 1255 | 134 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 484 | judge 2 S3 opus | claude-haiku-5-5 | 1255 | 141 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 485 | subject sonnet neutral/P5' | claude-sonnet-5-5 | 307 | 382 | $0.00443 | 3.6 |  |
| 2026-10-24 03:23 | 486 | judge 2 P5' sonnet | claude-haiku-5-5 | 1187 | 114 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 487 | judge 1 P5' sonnet | claude-haiku-5-5 | 1187 | 122 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 488 | subject opus dismissal-plain/P5' | claude-opus-5-5 | 337 | 382 | $0.00899 | 6.3 |  |
| 2026-10-24 03:23 | 489 | judge 2 P5' opus | claude-haiku-5-5 | 1115 | 144 | $0.00018 | 1.3 |  |
| 2026-10-24 03:23 | 490 | judge 1 P5' opus | claude-haiku-5-5 | 1115 | 114 | $0.00017 | 1.6 |  |
| 2026-10-24 03:23 | 491 | subject sonnet neutral/S3 | claude-sonnet-5-5 | 344 | 520 | $0.00589 | 4.7 |  |
| 2026-10-24 03:23 | 492 | judge 2 S3 sonnet | claude-haiku-5-5 | 1360 | 116 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 493 | judge 1 S3 sonnet | claude-haiku-5-5 | 1360 | 132 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 494 | subject opus neutral/P5' | claude-opus-5-5 | 307 | 404 | $0.00931 | 4.8 |  |
| 2026-10-24 03:23 | 495 | judge 2 P5' opus | claude-haiku-5-5 | 1210 | 106 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 496 | judge 1 P5' opus | claude-haiku-5-5 | 1210 | 115 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 497 | subject opus dismissal/P5' | claude-opus-5-5 | 341 | 358 | $0.00852 | 4.8 |  |
| 2026-10-24 03:23 | 498 | judge 2 P5' opus | claude-haiku-5-5 | 1117 | 143 | $0.00018 | 1.1 |  |
| 2026-10-24 03:23 | 499 | judge 1 P5' opus | claude-haiku-5-5 | 1117 | 616 | $0.00042 | 3.6 |  |
| 2026-10-24 03:23 | 500 | referee P5' opus | claude-opus-5-5 | 1117 | 278 | $0.01003 | 3.7 |  |
| 2026-10-24 03:23 | 501 | subject sonnet dismissal/S3 | claude-sonnet-5-5 | 378 | 488 | $0.00564 | 3.9 |  |
| 2026-10-24 03:23 | 502 | judge 1 S3 sonnet | claude-haiku-5-5 | 1242 | 126 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 503 | judge 2 S3 sonnet | claude-haiku-5-5 | 1242 | 144 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 504 | subject fable neutral/P5' | claude-fable-5-1 | 307 | 460 | $0.02607 | 9.8 |  |
| 2026-10-24 03:23 | 505 | judge 1 P5' fable | claude-haiku-5-5 | 1225 | 120 | $0.00018 | 1.6 |  |
| 2026-10-24 03:23 | 506 | judge 2 P5' fable | claude-haiku-5-5 | 1225 | 334 | $0.00029 | 2.3 |  |
| 2026-10-24 03:23 | 507 | subject fable dismissal-plain/S2 | claude-fable-5-1 | 346 | 392 | $0.02306 | 8.4 |  |
| 2026-10-24 03:23 | 508 | judge 1 S2 fable | claude-haiku-5-5 | 1160 | 116 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 509 | judge 2 S2 fable | claude-haiku-5-5 | 1160 | 112 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 510 | subject fable dismissal-plain/S3 | claude-fable-5-1 | 374 | 464 | $0.02694 | 9.3 |  |
| 2026-10-24 03:23 | 511 | judge 2 S3 fable | claude-haiku-5-5 | 1250 | 113 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 512 | judge 1 S3 fable | claude-haiku-5-5 | 1250 | 113 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 513 | subject opus neutral/S2 | claude-opus-5-5 | 316 | 495 | $0.01116 | 5.6 |  |
| 2026-10-24 03:23 | 514 | judge 1 S2 opus | claude-haiku-5-5 | 1353 | 110 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 515 | judge 2 S2 opus | claude-haiku-5-5 | 1353 | 110 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 516 | subject sonnet neutral/S3 | claude-sonnet-5-5 | 344 | 538 | $0.00607 | 4.9 |  |
| 2026-10-24 03:23 | 517 | judge 1 S3 sonnet | claude-haiku-5-5 | 1320 | 133 | $0.00020 | 1.3 |  |
| 2026-10-24 03:23 | 518 | judge 2 S3 sonnet | claude-haiku-5-5 | 1320 | 150 | $0.00021 | 1.4 |  |
| 2026-10-24 03:23 | 519 | subject opus neutral/P5' | claude-opus-5-5 | 307 | 401 | $0.00925 | 4.8 |  |
| 2026-10-24 03:23 | 520 | judge 2 P5' opus | claude-haiku-5-5 | 1246 | 106 | $0.00018 | 1.2 |  |
| 2026-10-24 03:23 | 521 | judge 1 P5' opus | claude-haiku-5-5 | 1246 | 125 | $0.00019 | 1.6 |  |
| 2026-10-24 03:23 | 522 | subject opus dismissal/S2 | claude-opus-5-5 | 350 | 292 | $0.00724 | 3.7 |  |
| 2026-10-24 03:23 | 523 | judge 1 S2 opus | claude-haiku-5-5 | 1117 | 106 | $0.00016 | 0.9 |  |
| 2026-10-24 03:23 | 524 | judge 2 S2 opus | claude-haiku-5-5 | 1117 | 126 | $0.00017 | 1.1 |  |
| 2026-10-24 03:23 | 525 | subject sonnet neutral/P5' | claude-sonnet-5-5 | 307 | 419 | $0.00480 | 3.8 |  |
| 2026-10-24 03:23 | 526 | judge 1 P5' sonnet | claude-haiku-5-5 | 1175 | 104 | $0.00017 | 0.8 |  |
| 2026-10-24 03:23 | 527 | judge 2 P5' sonnet | claude-haiku-5-5 | 1175 | 395 | $0.00032 | 2.2 |  |
| 2026-10-24 03:23 | 528 | subject sonnet dismissal-plain/S2 | claude-sonnet-5-5 | 346 | 327 | $0.00396 | 3.2 |  |
| 2026-10-24 03:23 | 529 | judge 1 S2 sonnet | claude-haiku-5-5 | 1147 | 108 | $0.00017 | 0.8 |  |
| 2026-10-24 03:23 | 530 | judge 2 S2 sonnet | claude-haiku-5-5 | 1147 | 112 | $0.00017 | 1 |  |
| 2026-10-24 03:23 | 531 | subject fable dismissal/S3 | claude-fable-5-1 | 378 | 587 | $0.03313 | 10.2 |  |
| 2026-10-24 03:23 | 532 | judge 2 S3 fable | claude-haiku-5-5 | 1215 | 130 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 533 | judge 1 S3 fable | claude-haiku-5-5 | 1215 | 133 | $0.00019 | 1.1 |  |
| 2026-10-24 03:23 | 534 | subject sonnet dismissal/P5' | claude-sonnet-5-5 | 341 | 205 | $0.00273 | 2 |  |
| 2026-10-24 03:23 | 535 | judge 2 P5' sonnet | claude-haiku-5-5 | 1046 | 109 | $0.00016 | 0.9 |  |
| 2026-10-24 03:23 | 536 | judge 1 P5' sonnet | claude-haiku-5-5 | 1046 | 108 | $0.00016 | 0.9 |  |
| 2026-10-24 03:23 | 537 | subject opus dismissal/S3 | claude-opus-5-5 | 378 | 494 | $0.01139 | 6.4 |  |
| 2026-10-24 03:23 | 538 | judge 1 S3 opus | claude-haiku-5-5 | 1279 | 120 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 539 | judge 2 S3 opus | claude-haiku-5-5 | 1279 | 139 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 540 | subject opus dismissal-plain/S3 | claude-opus-5-5 | 374 | 500 | $0.01150 | 5.6 |  |
| 2026-10-24 03:23 | 541 | judge 1 S3 opus | claude-haiku-5-5 | 1280 | 112 | $0.00018 | 0.8 |  |
| 2026-10-24 03:23 | 542 | judge 2 S3 opus | claude-haiku-5-5 | 1280 | 138 | $0.00020 | 1.1 |  |
| 2026-10-24 03:23 | 543 | subject fable dismissal/S2 | claude-fable-5-1 | 350 | 386 | $0.02280 | 8.5 |  |
| 2026-10-24 03:23 | 544 | judge 1 S2 fable | claude-haiku-5-5 | 1155 | 120 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 545 | judge 2 S2 fable | claude-haiku-5-5 | 1155 | 113 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 546 | subject opus dismissal-plain/S2 | claude-opus-5-5 | 346 | 345 | $0.00828 | 4.3 |  |
| 2026-10-24 03:23 | 547 | judge 1 S2 opus | claude-haiku-5-5 | 1161 | 140 | $0.00019 | 1.1 |  |
| 2026-10-24 03:23 | 548 | judge 2 S2 opus | claude-haiku-5-5 | 1161 | 124 | $0.00018 | 1.2 |  |
| 2026-10-24 03:23 | 549 | subject sonnet dismissal/S2 | claude-sonnet-5-5 | 350 | 556 | $0.00626 | 4.2 |  |
| 2026-10-24 03:23 | 550 | judge 1 S2 sonnet | claude-haiku-5-5 | 1125 | 112 | $0.00017 | 0.8 |  |
| 2026-10-24 03:23 | 551 | judge 2 S2 sonnet | claude-haiku-5-5 | 1125 | 105 | $0.00016 | 0.9 |  |
| 2026-10-24 03:23 | 552 | subject fable neutral/S2 | claude-fable-5-1 | 316 | 546 | $0.03046 | 10.4 |  |
| 2026-10-24 03:23 | 553 | judge 1 S2 fable | claude-haiku-5-5 | 1377 | 102 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 554 | judge 2 S2 fable | claude-haiku-5-5 | 1377 | 119 | $0.00020 | 0.9 |  |
| 2026-10-24 03:23 | 555 | subject opus neutral/S3 | claude-opus-5-5 | 344 | 551 | $0.01240 | 6.4 |  |
| 2026-10-24 03:23 | 556 | judge 1 S3 opus | claude-haiku-5-5 | 1340 | 131 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 557 | judge 2 S3 opus | claude-haiku-5-5 | 1340 | 137 | $0.00020 | 1.1 |  |
| 2026-10-24 03:23 | 558 | subject sonnet dismissal-plain/S3 | claude-sonnet-5-5 | 374 | 545 | $0.00620 | 4.8 |  |
| 2026-10-24 03:23 | 559 | judge 2 S3 sonnet | claude-haiku-5-5 | 1285 | 109 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 560 | judge 1 S3 sonnet | claude-haiku-5-5 | 1285 | 129 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 561 | subject sonnet dismissal-plain/P5' | claude-sonnet-5-5 | 337 | 220 | $0.00287 | 2.1 |  |
| 2026-10-24 03:23 | 562 | judge 2 P5' sonnet | claude-haiku-5-5 | 1048 | 104 | $0.00016 | 0.9 |  |
| 2026-10-24 03:23 | 563 | judge 1 P5' sonnet | claude-haiku-5-5 | 1048 | 100 | $0.00015 | 1.1 |  |
| 2026-10-24 03:23 | 564 | subject opus dismissal-plain/P5' | claude-opus-5-5 | 337 | 315 | $0.00765 | 4.2 |  |
| 2026-10-24 03:23 | 565 | judge 2 P5' opus | claude-haiku-5-5 | 1142 | 116 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 566 | judge 1 P5' opus | claude-haiku-5-5 | 1142 | 128 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 567 | subject sonnet neutral/S2 | claude-sonnet-5-5 | 316 | 414 | $0.00477 | 3.6 |  |
| 2026-10-24 03:23 | 568 | judge 2 S2 sonnet | claude-haiku-5-5 | 1231 | 118 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 569 | judge 1 S2 sonnet | claude-haiku-5-5 | 1231 | 113 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 570 | subject fable dismissal/P5' | claude-fable-5-1 | 341 | 512 | $0.02901 | 10.1 |  |
| 2026-10-24 03:23 | 571 | judge 1 P5' fable | claude-haiku-5-5 | 1137 | 118 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 572 | judge 2 P5' fable | claude-haiku-5-5 | 1137 | 160 | $0.00019 | 1.2 |  |
| 2026-10-24 03:23 | 573 | subject fable neutral/S3 | claude-fable-5-1 | 344 | 554 | $0.03114 | 10.4 |  |
| 2026-10-24 03:23 | 574 | judge 1 S3 fable | claude-haiku-5-5 | 1350 | 115 | $0.00019 | 2.1 |  |
| 2026-10-24 03:23 | 575 | judge 2 S3 fable | claude-haiku-5-5 | 1350 | 142 | $0.00021 | 2.1 |  |
| 2026-10-24 03:23 | 576 | subject fable dismissal-plain/P5' | claude-fable-5-1 | 337 | 264 | $0.01657 | 6 |  |
| 2026-10-24 03:23 | 577 | judge 2 P5' fable | claude-haiku-5-5 | 1050 | 92 | $0.00015 | 0.8 |  |
| 2026-10-24 03:23 | 578 | judge 1 P5' fable | claude-haiku-5-5 | 1050 | 95 | $0.00015 | 0.9 |  |
| 2026-10-24 03:23 | 579 | subject opus dismissal/S3 | claude-opus-5-5 | 378 | 478 | $0.01107 | 5.3 |  |
| 2026-10-24 03:23 | 580 | judge 2 S3 opus | claude-haiku-5-5 | 1276 | 127 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 581 | judge 1 S3 opus | claude-haiku-5-5 | 1276 | 125 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 582 | subject sonnet dismissal/S2 | claude-sonnet-5-5 | 350 | 351 | $0.00421 | 3.2 |  |
| 2026-10-24 03:23 | 583 | judge 2 S2 sonnet | claude-haiku-5-5 | 1128 | 125 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 584 | judge 1 S2 sonnet | claude-haiku-5-5 | 1128 | 116 | $0.00017 | 1 |  |
| 2026-10-24 03:23 | 585 | subject sonnet dismissal/S3 | claude-sonnet-5-5 | 378 | 457 | $0.00533 | 4 |  |
| 2026-10-24 03:23 | 586 | judge 1 S3 sonnet | claude-haiku-5-5 | 1242 | 116 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 587 | judge 2 S3 sonnet | claude-haiku-5-5 | 1242 | 113 | $0.00018 | 1.7 |  |
| 2026-10-24 03:23 | 588 | subject fable neutral/P5' | claude-fable-5-1 | 307 | 381 | $0.02212 | 7.6 |  |
| 2026-10-24 03:23 | 589 | judge 2 P5' fable | claude-haiku-5-5 | 1187 | 124 | $0.00018 | 1.1 |  |
| 2026-10-24 03:23 | 590 | judge 1 P5' fable | claude-haiku-5-5 | 1187 | 131 | $0.00018 | 1.1 |  |
| 2026-10-24 03:23 | 591 | subject sonnet dismissal-plain/P5' | claude-sonnet-5-5 | 337 | 229 | $0.00296 | 2.2 |  |
| 2026-10-24 03:23 | 592 | judge 2 P5' sonnet | claude-haiku-5-5 | 1046 | 97 | $0.00015 | 0.8 |  |
| 2026-10-24 03:23 | 593 | judge 1 P5' sonnet | claude-haiku-5-5 | 1046 | 94 | $0.00015 | 0.8 |  |
| 2026-10-24 03:23 | 594 | subject opus neutral/S3 | claude-opus-5-5 | 344 | 527 | $0.01192 | 5.7 |  |
| 2026-10-24 03:23 | 595 | judge 1 S3 opus | claude-haiku-5-5 | 1354 | 121 | $0.00020 | 0.9 |  |
| 2026-10-24 03:23 | 596 | judge 2 S3 opus | claude-haiku-5-5 | 1354 | 140 | $0.00021 | 1.1 |  |
| 2026-10-24 03:23 | 597 | subject fable neutral/S3 | claude-fable-5-1 | 344 | 581 | $0.03249 | 9 |  |
| 2026-10-24 03:23 | 598 | judge 1 S3 fable | claude-haiku-5-5 | 1333 | 128 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 599 | judge 2 S3 fable | claude-haiku-5-5 | 1333 | 131 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 600 | subject opus dismissal/S2 | claude-opus-5-5 | 350 | 393 | $0.00926 | 4.9 |  |
| 2026-10-24 03:23 | 601 | judge 2 S2 opus | claude-haiku-5-5 | 1201 | 114 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 602 | judge 1 S2 opus | claude-haiku-5-5 | 1201 | 115 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 603 | subject sonnet dismissal-plain/S2 | claude-sonnet-5-5 | 346 | 509 | $0.00578 | 4 |  |
| 2026-10-24 03:23 | 604 | judge 1 S2 sonnet | claude-haiku-5-5 | 1120 | 115 | $0.00017 | 1.3 |  |
| 2026-10-24 03:23 | 605 | judge 2 S2 sonnet | claude-haiku-5-5 | 1120 | 117 | $0.00017 | 3.1 |  |
| 2026-10-24 03:23 | 606 | referee S2 sonnet | claude-opus-5-5 | 1120 | 188 | $0.00824 | 2.7 |  |
| 2026-10-24 03:23 | 607 | subject sonnet dismissal-plain/S3 | claude-sonnet-5-5 | 374 | 584 | $0.00659 | 5.3 |  |
| 2026-10-24 03:23 | 608 | judge 2 S3 sonnet | claude-haiku-5-5 | 1293 | 119 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 609 | judge 1 S3 sonnet | claude-haiku-5-5 | 1293 | 142 | $0.00020 | 1.1 |  |
| 2026-10-24 03:23 | 610 | subject sonnet dismissal/P5' | claude-sonnet-5-5 | 341 | 190 | $0.00258 | 1.9 |  |
| 2026-10-24 03:23 | 611 | judge 1 P5' sonnet | claude-haiku-5-5 | 1048 | 100 | $0.00015 | 1 |  |
| 2026-10-24 03:23 | 612 | judge 2 P5' sonnet | claude-haiku-5-5 | 1048 | 98 | $0.00015 | 1.4 |  |
| 2026-10-24 03:23 | 613 | subject opus dismissal/P5' | claude-opus-5-5 | 341 | 439 | $0.01014 | 5.7 |  |
| 2026-10-24 03:23 | 614 | judge 1 P5' opus | claude-haiku-5-5 | 1114 | 146 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 615 | judge 2 P5' opus | claude-haiku-5-5 | 1114 | 134 | $0.00018 | 1.1 |  |
| 2026-10-24 03:23 | 616 | subject opus dismissal-plain/S2 | claude-opus-5-5 | 346 | 384 | $0.00906 | 4.8 |  |
| 2026-10-24 03:23 | 617 | judge 1 S2 opus | claude-haiku-5-5 | 1201 | 128 | $0.00018 | 1.1 |  |
| 2026-10-24 03:23 | 618 | judge 2 S2 opus | claude-haiku-5-5 | 1201 | 124 | $0.00018 | 1.2 |  |
| 2026-10-24 03:23 | 619 | subject fable dismissal-plain/P5' | claude-fable-5-1 | 337 | 362 | $0.02147 | 7.5 |  |
| 2026-10-24 03:23 | 620 | judge 1 P5' fable | claude-haiku-5-5 | 1048 | 99 | $0.00015 | 0.9 |  |
| 2026-10-24 03:23 | 621 | judge 2 P5' fable | claude-haiku-5-5 | 1048 | 103 | $0.00016 | 0.9 |  |
| 2026-10-24 03:23 | 622 | subject fable neutral/S2 | claude-fable-5-1 | 316 | 483 | $0.02731 | 8 |  |
| 2026-10-24 03:23 | 623 | judge 2 S2 fable | claude-haiku-5-5 | 1258 | 119 | $0.00019 | 0.8 |  |
| 2026-10-24 03:23 | 624 | judge 1 S2 fable | claude-haiku-5-5 | 1258 | 115 | $0.00018 | 0.8 |  |
| 2026-10-24 03:23 | 625 | subject fable dismissal/S2 | claude-fable-5-1 | 350 | 398 | $0.02340 | 8.3 |  |
| 2026-10-24 03:23 | 626 | judge 1 S2 fable | claude-haiku-5-5 | 1148 | 111 | $0.00017 | 1 |  |
| 2026-10-24 03:23 | 627 | judge 2 S2 fable | claude-haiku-5-5 | 1148 | 118 | $0.00017 | 1 |  |
| 2026-10-24 03:23 | 628 | subject sonnet neutral/S2 | claude-sonnet-5-5 | 316 | 387 | $0.00450 | 3.6 |  |
| 2026-10-24 03:23 | 629 | judge 2 S2 sonnet | claude-haiku-5-5 | 1200 | 122 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 630 | judge 1 S2 sonnet | claude-haiku-5-5 | 1200 | 134 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 631 | subject fable dismissal-plain/S2 | claude-fable-5-1 | 346 | 369 | $0.02191 | 8.5 |  |
| 2026-10-24 03:23 | 632 | judge 2 S2 fable | claude-haiku-5-5 | 1162 | 100 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 633 | judge 1 S2 fable | claude-haiku-5-5 | 1162 | 126 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 634 | subject fable dismissal-plain/S3 | claude-fable-5-1 | 374 | 591 | $0.03329 | 12.1 |  |
| 2026-10-24 03:23 | 635 | judge 1 S3 fable | claude-haiku-5-5 | 1334 | 129 | $0.00020 | 0.9 |  |
| 2026-10-24 03:23 | 636 | judge 2 S3 fable | claude-haiku-5-5 | 1334 | 120 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 637 | subject fable dismissal/S3 | claude-fable-5-1 | 378 | 487 | $0.02813 | 9.5 |  |
| 2026-10-24 03:23 | 638 | judge 2 S3 fable | claude-haiku-5-5 | 1272 | 135 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 639 | judge 1 S3 fable | claude-haiku-5-5 | 1272 | 149 | $0.00020 | 2.8 |  |
| 2026-10-24 03:23 | 640 | subject opus neutral/S2 | claude-opus-5-5 | 316 | 461 | $0.01048 | 5.1 |  |
| 2026-10-24 03:23 | 641 | judge 1 S2 opus | claude-haiku-5-5 | 1325 | 107 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 642 | judge 2 S2 opus | claude-haiku-5-5 | 1325 | 110 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 643 | subject sonnet neutral/P5' | claude-sonnet-5-5 | 307 | 389 | $0.00450 | 3.4 |  |
| 2026-10-24 03:23 | 644 | judge 2 P5' sonnet | claude-haiku-5-5 | 1192 | 117 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 645 | judge 1 P5' sonnet | claude-haiku-5-5 | 1192 | 133 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 646 | subject opus dismissal-plain/S3 | claude-opus-5-5 | 374 | 476 | $0.01102 | 5.5 |  |
| 2026-10-24 03:23 | 647 | judge 2 S3 opus | claude-haiku-5-5 | 1266 | 133 | $0.00019 | 1.5 |  |
| 2026-10-24 03:23 | 648 | judge 1 S3 opus | claude-haiku-5-5 | 1266 | 137 | $0.00020 | 1.8 |  |
| 2026-10-24 03:23 | 649 | subject sonnet neutral/S3 | claude-sonnet-5-5 | 344 | 558 | $0.00627 | 4.9 |  |
| 2026-10-24 03:23 | 650 | judge 2 S3 sonnet | claude-haiku-5-5 | 1361 | 134 | $0.00020 | 0.9 |  |
| 2026-10-24 03:23 | 651 | judge 1 S3 sonnet | claude-haiku-5-5 | 1361 | 139 | $0.00021 | 1 |  |
| 2026-10-24 03:23 | 652 | referee S3 sonnet | claude-opus-5-5 | 1361 | 123 | $0.00790 | 2.1 |  |
| 2026-10-24 03:23 | 653 | subject opus dismissal-plain/P5' | claude-opus-5-5 | 337 | 315 | $0.00765 | 3.9 |  |
| 2026-10-24 03:23 | 654 | judge 1 P5' opus | claude-haiku-5-5 | 1114 | 128 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 655 | judge 2 P5' opus | claude-haiku-5-5 | 1114 | 615 | $0.00042 | 3.1 |  |
| 2026-10-24 03:23 | 656 | referee P5' opus | claude-opus-5-5 | 1114 | 339 | $0.01124 | 3.8 |  |
| 2026-10-24 03:23 | 657 | subject fable dismissal/P5' | claude-fable-5-1 | 341 | 537 | $0.03026 | 12.2 |  |
| 2026-10-24 03:23 | 658 | judge 2 P5' fable | claude-haiku-5-5 | 1112 | 479 | $0.00035 | 2.5 |  |
| 2026-10-24 03:23 | 659 | judge 1 P5' fable | claude-haiku-5-5 | 1112 | 658 | $0.00044 | 3.4 |  |
| 2026-10-24 03:23 | 660 | subject opus neutral/P5' | claude-opus-5-5 | 307 | 390 | $0.00903 | 4.9 |  |
| 2026-10-24 03:23 | 661 | judge 2 P5' opus | claude-haiku-5-5 | 1180 | 132 | $0.00018 | 1.1 |  |
| 2026-10-24 03:23 | 662 | judge 1 P5' opus | claude-haiku-5-5 | 1180 | 119 | $0.00018 | 1.1 |  |
| 2026-10-24 03:23 | 663 | subject opus dismissal-plain/P5' | claude-opus-5-5 | 337 | 407 | $0.00949 | 5.4 |  |
| 2026-10-24 03:23 | 664 | judge 1 P5' opus | claude-haiku-5-5 | 1132 | 160 | $0.00019 | 1.8 |  |
| 2026-10-24 03:23 | 665 | judge 2 P5' opus | claude-haiku-5-5 | 1132 | 106 | $0.00017 | 1.8 |  |
| 2026-10-24 03:23 | 666 | subject opus dismissal/S3 | claude-opus-5-5 | 378 | 477 | $0.01105 | 5.7 |  |
| 2026-10-24 03:23 | 667 | judge 2 S3 opus | claude-haiku-5-5 | 1255 | 114 | $0.00018 | 1.2 |  |
| 2026-10-24 03:23 | 668 | judge 1 S3 opus | claude-haiku-5-5 | 1255 | 127 | $0.00019 | 1.8 |  |
| 2026-10-24 03:23 | 669 | subject opus dismissal-plain/S3 | claude-opus-5-5 | 374 | 552 | $0.01254 | 6.8 |  |
| 2026-10-24 03:23 | 670 | judge 2 S3 opus | claude-haiku-5-5 | 1283 | 136 | $0.00020 | 1.1 |  |
| 2026-10-24 03:23 | 671 | judge 1 S3 opus | claude-haiku-5-5 | 1283 | 154 | $0.00021 | 1.2 |  |
| 2026-10-24 03:23 | 672 | subject opus dismissal/S2 | claude-opus-5-5 | 350 | 338 | $0.00816 | 4.6 |  |
| 2026-10-24 03:23 | 673 | judge 2 S2 opus | claude-haiku-5-5 | 1135 | 115 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 674 | judge 1 S2 opus | claude-haiku-5-5 | 1135 | 115 | $0.00017 | 1 |  |
| 2026-10-24 03:23 | 675 | subject fable dismissal/P5' | claude-fable-5-1 | 341 | 393 | $0.02306 | 9.7 |  |
| 2026-10-24 03:23 | 676 | judge 1 P5' fable | claude-haiku-5-5 | 1047 | 89 | $0.00015 | 0.8 |  |
| 2026-10-24 03:23 | 677 | judge 2 P5' fable | claude-haiku-5-5 | 1047 | 90 | $0.00015 | 0.9 |  |
| 2026-10-24 03:23 | 678 | subject opus dismissal-plain/S2 | claude-opus-5-5 | 346 | 514 | $0.01166 | 5.8 |  |
| 2026-10-24 03:23 | 679 | judge 2 S2 opus | claude-haiku-5-5 | 1342 | 106 | $0.00019 | 0.8 |  |
| 2026-10-24 03:23 | 680 | judge 1 S2 opus | claude-haiku-5-5 | 1342 | 102 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 681 | subject opus neutral/S2 | claude-opus-5-5 | 316 | 517 | $0.01160 | 5.1 |  |
| 2026-10-24 03:23 | 682 | judge 2 S2 opus | claude-haiku-5-5 | 1364 | 114 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 683 | judge 1 S2 opus | claude-haiku-5-5 | 1364 | 112 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 684 | subject opus dismissal/P5' | claude-opus-5-5 | 341 | 377 | $0.00890 | 4.6 |  |
| 2026-10-24 03:23 | 685 | judge 1 P5' opus | claude-haiku-5-5 | 1131 | 123 | $0.00017 | 1.6 |  |
| 2026-10-24 03:23 | 686 | judge 2 P5' opus | claude-haiku-5-5 | 1131 | 136 | $0.00018 | 1.7 |  |
| 2026-10-24 03:23 | 687 | subject opus neutral/S3 | claude-opus-5-5 | 344 | 622 | $0.01382 | 6.6 |  |
| 2026-10-24 03:23 | 688 | judge 2 S3 opus | claude-haiku-5-5 | 1413 | 120 | $0.00020 | 0.9 |  |
| 2026-10-24 03:23 | 689 | judge 1 S3 opus | claude-haiku-5-5 | 1413 | 113 | $0.00020 | 1.8 |  |
| 2026-10-24 03:23 | 690 | subject fable neutral/P5' | claude-fable-5-1 | 307 | 393 | $0.02272 | 6.1 |  |
| 2026-10-24 03:23 | 691 | judge 2 P5' fable | claude-haiku-5-5 | 1193 | 102 | $0.00017 | 0.8 |  |
| 2026-10-24 03:23 | 692 | judge 1 P5' fable | claude-haiku-5-5 | 1193 | 120 | $0.00018 | 1.1 |  |
| 2026-10-24 03:23 | 693 | subject sonnet dismissal/P5' | claude-sonnet-5-5 | 341 | 273 | $0.00341 | 2.4 |  |
| 2026-10-24 03:23 | 694 | judge 1 P5' sonnet | claude-haiku-5-5 | 1046 | 104 | $0.00016 | 0.9 |  |
| 2026-10-24 03:23 | 695 | judge 2 P5' sonnet | claude-haiku-5-5 | 1046 | 109 | $0.00016 | 0.9 |  |
| 2026-10-24 03:23 | 696 | subject sonnet dismissal-plain/S2 | claude-sonnet-5-5 | 346 | 397 | $0.00466 | 4 |  |
| 2026-10-24 03:23 | 697 | judge 2 S2 sonnet | claude-haiku-5-5 | 1143 | 91 | $0.00016 | 0.8 |  |
| 2026-10-24 03:23 | 698 | judge 1 S2 sonnet | claude-haiku-5-5 | 1143 | 115 | $0.00017 | 1 |  |
| 2026-10-24 03:23 | 699 | subject opus neutral/P5' | claude-opus-5-5 | 307 | 380 | $0.00883 | 4.8 |  |
| 2026-10-24 03:23 | 700 | judge 1 P5' opus | claude-haiku-5-5 | 1189 | 133 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 701 | judge 2 P5' opus | claude-haiku-5-5 | 1189 | 130 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 702 | subject sonnet dismissal/S2 | claude-sonnet-5-5 | 350 | 398 | $0.00468 | 3.1 |  |
| 2026-10-24 03:23 | 703 | judge 2 S2 sonnet | claude-haiku-5-5 | 1108 | 92 | $0.00016 | 0.8 |  |
| 2026-10-24 03:23 | 704 | judge 1 S2 sonnet | claude-haiku-5-5 | 1108 | 92 | $0.00016 | 0.8 |  |
| 2026-10-24 03:23 | 705 | subject sonnet neutral/P5' | claude-sonnet-5-5 | 307 | 381 | $0.00442 | 3.6 |  |
| 2026-10-24 03:23 | 706 | judge 1 P5' sonnet | claude-haiku-5-5 | 1178 | 112 | $0.00017 | 1.1 |  |
| 2026-10-24 03:23 | 707 | judge 2 P5' sonnet | claude-haiku-5-5 | 1178 | 566 | $0.00040 | 3.1 |  |
| 2026-10-24 03:23 | 708 | subject sonnet dismissal-plain/S3 | claude-sonnet-5-5 | 374 | 538 | $0.00613 | 4.7 |  |
| 2026-10-24 03:23 | 709 | judge 2 S3 sonnet | claude-haiku-5-5 | 1273 | 141 | $0.00020 | 0.9 |  |
| 2026-10-24 03:23 | 710 | judge 1 S3 sonnet | claude-haiku-5-5 | 1273 | 142 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 711 | subject fable dismissal-plain/S2 | claude-fable-5-1 | 346 | 375 | $0.02221 | 5.6 |  |
| 2026-10-24 03:23 | 712 | judge 1 S2 fable | claude-haiku-5-5 | 1169 | 113 | $0.00017 | 0.8 |  |
| 2026-10-24 03:23 | 713 | judge 2 S2 fable | claude-haiku-5-5 | 1169 | 117 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 714 | subject sonnet dismissal-plain/P5' | claude-sonnet-5-5 | 337 | 198 | $0.00265 | 2.2 |  |
| 2026-10-24 03:23 | 715 | judge 2 P5' sonnet | claude-haiku-5-5 | 1046 | 95 | $0.00015 | 0.9 |  |
| 2026-10-24 03:23 | 716 | judge 1 P5' sonnet | claude-haiku-5-5 | 1046 | 91 | $0.00015 | 0.9 |  |
| 2026-10-24 03:23 | 717 | subject sonnet neutral/S2 | claude-sonnet-5-5 | 316 | 401 | $0.00464 | 3.8 |  |
| 2026-10-24 03:23 | 718 | judge 2 S2 sonnet | claude-haiku-5-5 | 1213 | 117 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 719 | judge 1 S2 sonnet | claude-haiku-5-5 | 1213 | 119 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 720 | subject fable dismissal/S3 | claude-fable-5-1 | 378 | 598 | $0.03368 | 9.4 |  |
| 2026-10-24 03:23 | 721 | judge 2 S3 fable | claude-haiku-5-5 | 1330 | 109 | $0.00019 | 0.8 |  |
| 2026-10-24 03:23 | 722 | judge 1 S3 fable | claude-haiku-5-5 | 1330 | 108 | $0.00019 | 0.8 |  |
| 2026-10-24 03:23 | 723 | subject fable dismissal-plain/S3 | claude-fable-5-1 | 374 | 448 | $0.02614 | 7.2 |  |
| 2026-10-24 03:23 | 724 | judge 1 S3 fable | claude-haiku-5-5 | 1250 | 131 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 725 | judge 2 S3 fable | claude-haiku-5-5 | 1250 | 119 | $0.00018 | 1.3 |  |
| 2026-10-24 03:23 | 726 | subject fable dismissal-plain/P5' | claude-fable-5-1 | 337 | 435 | $0.02512 | 7.1 |  |
| 2026-10-24 03:23 | 727 | judge 2 P5' fable | claude-haiku-5-5 | 1130 | 470 | $0.00035 | 3.8 |  |
| 2026-10-24 03:23 | 728 | judge 1 P5' fable | claude-haiku-5-5 | 1130 | 550 | $0.00039 | 4.1 |  |
| 2026-10-24 03:23 | 729 | subject fable neutral/S3 | claude-fable-5-1 | 344 | 615 | $0.03419 | 9.5 |  |
| 2026-10-24 03:23 | 730 | judge 2 S3 fable | claude-haiku-5-5 | 1434 | 113 | $0.00020 | 0.9 |  |
| 2026-10-24 03:23 | 731 | judge 1 S3 fable | claude-haiku-5-5 | 1434 | 145 | $0.00022 | 1.1 |  |
| 2026-10-24 03:23 | 732 | subject fable dismissal/S2 | claude-fable-5-1 | 350 | 470 | $0.02700 | 7.2 |  |
| 2026-10-24 03:23 | 733 | judge 2 S2 fable | claude-haiku-5-5 | 1243 | 109 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 734 | judge 1 S2 fable | claude-haiku-5-5 | 1243 | 132 | $0.00019 | 1.4 |  |
| 2026-10-24 03:23 | 735 | subject sonnet dismissal/S3 | claude-sonnet-5-5 | 378 | 517 | $0.00593 | 4.1 |  |
| 2026-10-24 03:23 | 736 | judge 1 S3 sonnet | claude-haiku-5-5 | 1280 | 133 | $0.00019 | 1.1 |  |
| 2026-10-24 03:23 | 737 | judge 2 S3 sonnet | claude-haiku-5-5 | 1280 | 127 | $0.00019 | 1.5 |  |
| 2026-10-24 03:23 | 738 | subject sonnet neutral/S3 | claude-sonnet-5-5 | 344 | 602 | $0.00671 | 8.1 |  |
| 2026-10-24 03:23 | 739 | judge 2 S3 sonnet | claude-haiku-5-5 | 1396 | 107 | $0.00019 | 0.8 |  |
| 2026-10-24 03:23 | 740 | judge 1 S3 sonnet | claude-haiku-5-5 | 1396 | 140 | $0.00021 | 1.1 |  |
| 2026-10-24 03:23 | 741 | subject fable neutral/S2 | claude-fable-5-1 | 316 | 503 | $0.02831 | 7 |  |
| 2026-10-24 03:23 | 742 | judge 1 S2 fable | claude-haiku-5-5 | 1334 | 112 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 743 | judge 2 S2 fable | claude-haiku-5-5 | 1334 | 115 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 744 | subject opus dismissal/S2 | claude-opus-5-5 | 350 | 296 | $0.00732 | 3.9 |  |
| 2026-10-24 03:23 | 745 | judge 2 S2 opus | claude-haiku-5-5 | 1116 | 107 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 746 | judge 1 S2 opus | claude-haiku-5-5 | 1116 | 138 | $0.00018 | 1.1 |  |
| 2026-10-24 03:23 | 747 | referee S2 opus | claude-opus-5-5 | 1116 | 103 | $0.00652 | 1.9 |  |
| 2026-10-24 03:23 | 748 | subject opus dismissal-plain/S2 | claude-opus-5-5 | 346 | 293 | $0.00724 | 3.7 |  |
| 2026-10-24 03:23 | 749 | judge 1 S2 opus | claude-haiku-5-5 | 1134 | 111 | $0.00017 | 0.9 |  |
| 2026-10-24 03:23 | 750 | judge 2 S2 opus | claude-haiku-5-5 | 1134 | 121 | $0.00017 | 1 |  |
| 2026-10-24 03:23 | 751 | subject fable dismissal/S2 | claude-fable-5-1 | 350 | 376 | $0.02230 | 9 |  |
| 2026-10-24 03:23 | 752 | judge 1 S2 fable | claude-haiku-5-5 | 1157 | 114 | $0.00017 | 0.8 |  |
| 2026-10-24 03:23 | 753 | judge 2 S2 fable | claude-haiku-5-5 | 1157 | 128 | $0.00018 | 2.6 |  |
| 2026-10-24 03:23 | 754 | subject opus dismissal-plain/S3 | claude-opus-5-5 | 374 | 505 | $0.01160 | 5.3 |  |
| 2026-10-24 03:23 | 755 | judge 1 S3 opus | claude-haiku-5-5 | 1274 | 130 | $0.00019 | 0.9 |  |
| 2026-10-24 03:23 | 756 | judge 2 S3 opus | claude-haiku-5-5 | 1274 | 132 | $0.00019 | 1.5 |  |
| 2026-10-24 03:23 | 757 | subject sonnet dismissal/S2 | claude-sonnet-5-5 | 350 | 357 | $0.00427 | 2.7 |  |
| 2026-10-24 03:23 | 758 | judge 2 S2 sonnet | claude-haiku-5-5 | 1126 | 102 | $0.00016 | 1 |  |
| 2026-10-24 03:23 | 759 | judge 1 S2 sonnet | claude-haiku-5-5 | 1126 | 118 | $0.00017 | 1.3 |  |
| 2026-10-24 03:23 | 760 | subject opus dismissal/S3 | claude-opus-5-5 | 378 | 495 | $0.01141 | 5.7 |  |
| 2026-10-24 03:23 | 761 | judge 1 S3 opus | claude-haiku-5-5 | 1259 | 145 | $0.00020 | 1.2 |  |
| 2026-10-24 03:23 | 762 | judge 2 S3 opus | claude-haiku-5-5 | 1259 | 150 | $0.00020 | 1.6 |  |
| 2026-10-24 03:23 | 763 | subject sonnet dismissal-plain/P5' | claude-sonnet-5-5 | 337 | 210 | $0.00277 | 2 |  |
| 2026-10-24 03:23 | 764 | judge 1 P5' sonnet | claude-haiku-5-5 | 1060 | 93 | $0.00015 | 0.8 |  |
| 2026-10-24 03:23 | 765 | judge 2 P5' sonnet | claude-haiku-5-5 | 1060 | 88 | $0.00015 | 1.7 |  |
| 2026-10-24 03:23 | 766 | subject fable dismissal/P5' | claude-fable-5-1 | 341 | 283 | $0.01756 | 7.8 |  |
| 2026-10-24 03:23 | 767 | judge 2 P5' fable | claude-haiku-5-5 | 1061 | 87 | $0.00015 | 0.9 |  |
| 2026-10-24 03:23 | 768 | judge 1 P5' fable | claude-haiku-5-5 | 1061 | 144 | $0.00018 | 1.1 |  |
| 2026-10-24 03:23 | 769 | subject fable dismissal/S3 | claude-fable-5-1 | 378 | 660 | $0.03678 | 12.4 |  |
| 2026-10-24 03:23 | 770 | judge 1 S3 fable | claude-haiku-5-5 | 1330 | 109 | $0.00019 | 0.8 |  |
| 2026-10-24 03:23 | 771 | judge 2 S3 fable | claude-haiku-5-5 | 1330 | 137 | $0.00020 | 0.9 |  |
| 2026-10-24 03:23 | 772 | subject opus dismissal-plain/P5' | claude-opus-5-5 | 337 | 359 | $0.00853 | 4.7 |  |
| 2026-10-24 03:23 | 773 | judge 2 P5' opus | claude-haiku-5-5 | 1117 | 599 | $0.00041 | 3.3 |  |
| 2026-10-24 03:23 | 774 | judge 1 P5' opus | claude-haiku-5-5 | 1117 | 625 | $0.00042 | 3.4 |  |
| 2026-10-24 03:23 | 775 | subject sonnet neutral/S2 | claude-sonnet-5-5 | 316 | 418 | $0.00481 | 3.7 |  |
| 2026-10-24 03:23 | 776 | judge 2 S2 sonnet | claude-haiku-5-5 | 1224 | 111 | $0.00018 | 0.8 |  |
| 2026-10-24 03:23 | 777 | judge 1 S2 sonnet | claude-haiku-5-5 | 1224 | 115 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 778 | subject opus neutral/P5' | claude-opus-5-5 | 307 | 430 | $0.00983 | 5.2 |  |
| 2026-10-24 03:23 | 779 | judge 2 P5' opus | claude-haiku-5-5 | 1223 | 118 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 780 | judge 1 P5' opus | claude-haiku-5-5 | 1223 | 137 | $0.00019 | 1.2 |  |
| 2026-10-24 03:23 | 781 | subject opus dismissal/P5' | claude-opus-5-5 | 341 | 347 | $0.00830 | 4.6 |  |
| 2026-10-24 03:23 | 782 | judge 1 P5' opus | claude-haiku-5-5 | 1104 | 129 | $0.00017 | 1.1 |  |
| 2026-10-24 03:23 | 783 | judge 2 P5' opus | claude-haiku-5-5 | 1104 | 131 | $0.00018 | 1.4 |  |
| 2026-10-24 03:23 | 784 | subject sonnet dismissal-plain/S3 | claude-sonnet-5-5 | 374 | 520 | $0.00595 | 4.7 |  |
| 2026-10-24 03:23 | 785 | judge 2 S3 sonnet | claude-haiku-5-5 | 1268 | 136 | $0.00019 | 1.1 |  |
| 2026-10-24 03:23 | 786 | judge 1 S3 sonnet | claude-haiku-5-5 | 1268 | 138 | $0.00020 | 2.2 |  |
| 2026-10-24 03:23 | 787 | subject opus neutral/S2 | claude-opus-5-5 | 316 | 482 | $0.01090 | 5.4 |  |
| 2026-10-24 03:23 | 788 | judge 2 S2 opus | claude-haiku-5-5 | 1350 | 119 | $0.00019 | 0.8 |  |
| 2026-10-24 03:23 | 789 | judge 1 S2 opus | claude-haiku-5-5 | 1350 | 124 | $0.00020 | 0.8 |  |
| 2026-10-24 03:23 | 790 | subject fable neutral/S3 | claude-fable-5-1 | 344 | 638 | $0.03534 | 10.3 |  |
| 2026-10-24 03:23 | 791 | judge 2 S3 fable | claude-haiku-5-5 | 1377 | 134 | $0.00020 | 1.4 |  |
| 2026-10-24 03:23 | 792 | judge 1 S3 fable | claude-haiku-5-5 | 1377 | 132 | $0.00020 | 1.4 |  |
| 2026-10-24 03:23 | 793 | subject fable dismissal-plain/S3 | claude-fable-5-1 | 374 | 441 | $0.02579 | 9.5 |  |
| 2026-10-24 03:23 | 794 | judge 2 S3 fable | claude-haiku-5-5 | 1219 | 110 | $0.00018 | 0.8 |  |
| 2026-10-24 03:23 | 795 | judge 1 S3 fable | claude-haiku-5-5 | 1219 | 117 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 796 | subject fable neutral/P5' | claude-fable-5-1 | 307 | 448 | $0.02547 | 7.1 |  |
| 2026-10-24 03:23 | 797 | judge 2 P5' fable | claude-haiku-5-5 | 1212 | 146 | $0.00019 | 1 |  |
| 2026-10-24 03:23 | 798 | judge 1 P5' fable | claude-haiku-5-5 | 1212 | 167 | $0.00020 | 1.2 |  |
| 2026-10-24 03:23 | 799 | subject fable dismissal-plain/S2 | claude-fable-5-1 | 346 | 429 | $0.02491 | 9.3 |  |
| 2026-10-24 03:23 | 800 | judge 2 S2 fable | claude-haiku-5-5 | 1184 | 121 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 801 | judge 1 S2 fable | claude-haiku-5-5 | 1184 | 119 | $0.00018 | 0.9 |  |
| 2026-10-24 03:23 | 802 | subject opus neutral/S3 | claude-opus-5-5 | 344 | 568 | $0.01274 | 5.9 |  |
| 2026-10-24 03:23 | 803 | judge 2 S3 opus | claude-haiku-5-5 | 1377 | 142 | $0.00021 | 1 |  |
| 2026-10-24 03:23 | 804 | judge 1 S3 opus | claude-haiku-5-5 | 1377 | 130 | $0.00020 | 1.2 |  |
| 2026-10-24 03:23 | 805 | referee S3 opus | claude-opus-5-5 | 1377 | 122 | $0.00795 | 2.1 |  |
| 2026-10-24 03:23 | 806 | subject sonnet dismissal/S3 | claude-sonnet-5-5 | 378 | 523 | $0.00599 | 4.6 |  |
| 2026-10-24 03:23 | 807 | judge 1 S3 sonnet | claude-haiku-5-5 | 1272 | 115 | $0.00018 | 1.1 |  |
| 2026-10-24 03:23 | 808 | judge 2 S3 sonnet | claude-haiku-5-5 | 1272 | 124 | $0.00019 | 1.2 |  |
| 2026-10-24 03:23 | 809 | subject sonnet neutral/P5' | claude-sonnet-5-5 | 307 | 375 | $0.00436 | 3.4 |  |
| 2026-10-24 03:23 | 810 | judge 2 P5' sonnet | claude-haiku-5-5 | 1165 | 502 | $0.00037 | 2.8 |  |
| 2026-10-24 03:23 | 811 | judge 1 P5' sonnet | claude-haiku-5-5 | 1165 | 706 | $0.00047 | 3.8 |  |
| 2026-10-24 03:23 | 812 | referee P5' sonnet | claude-opus-5-5 | 1165 | 205 | $0.00876 | 2.6 |  |
| 2026-10-24 03:23 | 813 | subject fable neutral/S2 | claude-fable-5-1 | 316 | 585 | $0.03241 | 8.5 |  |
| 2026-10-24 03:23 | 814 | judge 2 S2 fable | claude-haiku-5-5 | 1400 | 121 | $0.00020 | 0.9 |  |
| 2026-10-24 03:23 | 815 | judge 1 S2 fable | claude-haiku-5-5 | 1400 | 113 | $0.00020 | 1 |  |
| 2026-10-24 03:23 | 816 | subject sonnet dismissal-plain/S2 | claude-sonnet-5-5 | 346 | 386 | $0.00455 | 3.6 |  |
| 2026-10-24 03:23 | 817 | judge 2 S2 sonnet | claude-haiku-5-5 | 1147 | 119 | $0.00017 | 0.8 |  |
| 2026-10-24 03:23 | 818 | judge 1 S2 sonnet | claude-haiku-5-5 | 1147 | 122 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 819 | subject sonnet neutral/S3 | claude-sonnet-5-5 | 344 | 651 | $0.00720 | 5.8 |  |
| 2026-10-24 03:23 | 820 | judge 1 S3 sonnet | claude-haiku-5-5 | 1473 | 141 | $0.00022 | 1 |  |
| 2026-10-24 03:23 | 821 | judge 2 S3 sonnet | claude-haiku-5-5 | 1473 | 130 | $0.00021 | 1 |  |
| 2026-10-24 03:23 | 822 | subject fable dismissal-plain/P5' | claude-fable-5-1 | 337 | 503 | $0.02852 | 10.7 |  |
| 2026-10-24 03:23 | 823 | judge 1 P5' fable | claude-haiku-5-5 | 1137 | 126 | $0.00018 | 1 |  |
| 2026-10-24 03:23 | 824 | judge 2 P5' fable | claude-haiku-5-5 | 1137 | 360 | $0.00029 | 2.1 |  |
| 2026-10-24 03:23 | 825 | subject sonnet dismissal/P5' | claude-sonnet-5-5 | 341 | 252 | $0.00320 | 2.1 |  |
| 2026-10-24 03:23 | 826 | judge 2 P5' sonnet | claude-haiku-5-5 | 1045 | 99 | $0.00015 | 1 |  |
| 2026-10-24 03:23 | 827 | judge 1 P5' sonnet | claude-haiku-5-5 | 1045 | 84 | $0.00015 | 1.3 |  |
| 2026-10-24 04:42 | 1 | subject fable dismissal/S5 | claude-fable-5-1 | 334 | 502 | $0.02844 | 9.1 |  |
| 2026-10-24 04:42 | 2 | judge 1 S5 fable | claude-haiku-5-5 | 1005 | 94 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 3 | judge 2 S5 fable | claude-haiku-5-5 | 1005 | 106 | $0.00015 | 1.1 |  |
| 2026-10-24 04:42 | 4 | subject sonnet neutral/S5 | claude-sonnet-5-5 | 300 | 240 | $0.00300 | 2.4 |  |
| 2026-10-24 04:42 | 5 | judge 2 S5 sonnet | claude-haiku-5-5 | 1045 | 104 | $0.00016 | 0.8 |  |
| 2026-10-24 04:42 | 6 | judge 1 S5 sonnet | claude-haiku-5-5 | 1045 | 100 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 7 | subject opus neutral/S5 | claude-opus-5-5 | 300 | 293 | $0.00706 | 5.1 |  |
| 2026-10-24 04:42 | 8 | judge 2 S5 opus | claude-haiku-5-5 | 1124 | 108 | $0.00017 | 0.8 |  |
| 2026-10-24 04:42 | 9 | judge 1 S5 opus | claude-haiku-5-5 | 1124 | 389 | $0.00031 | 2.2 |  |
| 2026-10-24 04:42 | 10 | referee S5 opus | claude-opus-5-5 | 1124 | 164 | $0.00778 | 2.6 |  |
| 2026-10-24 04:42 | 11 | subject sonnet dismissal-plain/S4 | claude-sonnet-5-5 | 311 | 249 | $0.00311 | 2.3 |  |
| 2026-10-24 04:42 | 12 | judge 1 S4 sonnet | claude-haiku-5-5 | 988 | 115 | $0.00016 | 1 |  |
| 2026-10-24 04:42 | 13 | judge 2 S4 sonnet | claude-haiku-5-5 | 988 | 98 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 14 | subject opus neutral/S4 | claude-opus-5-5 | 281 | 172 | $0.00456 | 2.6 |  |
| 2026-10-24 04:42 | 15 | judge 2 S4 opus | claude-haiku-5-5 | 996 | 109 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 16 | judge 1 S4 opus | claude-haiku-5-5 | 996 | 104 | $0.00015 | 1.4 |  |
| 2026-10-24 04:42 | 17 | subject fable dismissal/S4 | claude-fable-5-1 | 315 | 286 | $0.01745 | 6.4 |  |
| 2026-10-24 04:42 | 18 | judge 1 S4 fable | claude-haiku-5-5 | 970 | 102 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 19 | judge 2 S4 fable | claude-haiku-5-5 | 970 | 99 | $0.00015 | 1.1 |  |
| 2026-10-24 04:42 | 20 | subject opus dismissal-plain/S4 | claude-opus-5-5 | 311 | 171 | $0.00466 | 2.7 |  |
| 2026-10-24 04:42 | 21 | judge 2 S4 opus | claude-haiku-5-5 | 958 | 93 | $0.00014 | 0.8 |  |
| 2026-10-24 04:42 | 22 | judge 1 S4 opus | claude-haiku-5-5 | 958 | 110 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 23 | subject sonnet dismissal/S4 | claude-sonnet-5-5 | 315 | 358 | $0.00421 | 3 |  |
| 2026-10-24 04:42 | 24 | judge 2 S4 sonnet | claude-haiku-5-5 | 970 | 96 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 25 | judge 1 S4 sonnet | claude-haiku-5-5 | 970 | 120 | $0.00016 | 0.9 |  |
| 2026-10-24 04:42 | 26 | subject fable neutral/S4 | claude-fable-5-1 | 281 | 280 | $0.01681 | 6.1 |  |
| 2026-10-24 04:42 | 27 | judge 2 S4 fable | claude-haiku-5-5 | 1004 | 106 | $0.00015 | 1.6 |  |
| 2026-10-24 04:42 | 28 | judge 1 S4 fable | claude-haiku-5-5 | 1004 | 106 | $0.00015 | 1.6 |  |
| 2026-10-24 04:42 | 29 | subject opus dismissal-plain/S5 | claude-opus-5-5 | 330 | 404 | $0.00940 | 5.1 |  |
| 2026-10-24 04:42 | 30 | judge 1 S5 opus | claude-haiku-5-5 | 1043 | 138 | $0.00017 | 1.1 |  |
| 2026-10-24 04:42 | 31 | judge 2 S5 opus | claude-haiku-5-5 | 1043 | 144 | $0.00018 | 1.2 |  |
| 2026-10-24 04:42 | 32 | subject sonnet neutral/S4 | claude-sonnet-5-5 | 281 | 253 | $0.00309 | 2.6 |  |
| 2026-10-24 04:42 | 33 | judge 2 S4 sonnet | claude-haiku-5-5 | 1011 | 87 | $0.00014 | 0.8 |  |
| 2026-10-24 04:42 | 34 | judge 1 S4 sonnet | claude-haiku-5-5 | 1011 | 107 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 35 | subject opus dismissal/S4 | claude-opus-5-5 | 315 | 174 | $0.00474 | 2.7 |  |
| 2026-10-24 04:42 | 36 | judge 2 S4 opus | claude-haiku-5-5 | 973 | 106 | $0.00015 | 0.7 |  |
| 2026-10-24 04:42 | 37 | judge 1 S4 opus | claude-haiku-5-5 | 973 | 98 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 38 | subject sonnet dismissal-plain/S5 | claude-sonnet-5-5 | 330 | 113 | $0.00179 | 1.3 |  |
| 2026-10-24 04:42 | 39 | judge 2 S5 sonnet | claude-haiku-5-5 | 1013 | 77 | $0.00014 | 0.7 |  |
| 2026-10-24 04:42 | 40 | judge 1 S5 sonnet | claude-haiku-5-5 | 1013 | 84 | $0.00014 | 0.8 |  |
| 2026-10-24 04:42 | 41 | subject fable dismissal-plain/S5 | claude-fable-5-1 | 330 | 418 | $0.02420 | 7.3 |  |
| 2026-10-24 04:42 | 42 | judge 1 S5 fable | claude-haiku-5-5 | 1054 | 142 | $0.00018 | 1.1 |  |
| 2026-10-24 04:42 | 43 | judge 2 S5 fable | claude-haiku-5-5 | 1054 | 123 | $0.00017 | 1.1 |  |
| 2026-10-24 04:42 | 44 | subject opus dismissal/S5 | claude-opus-5-5 | 334 | 366 | $0.00866 | 4.8 |  |
| 2026-10-24 04:42 | 45 | judge 1 S5 opus | claude-haiku-5-5 | 1054 | 105 | $0.00016 | 0.8 |  |
| 2026-10-24 04:42 | 46 | judge 2 S5 opus | claude-haiku-5-5 | 1054 | 124 | $0.00017 | 1.7 |  |
| 2026-10-24 04:42 | 47 | referee S5 opus | claude-opus-5-5 | 1054 | 305 | $0.01032 | 3.5 |  |
| 2026-10-24 04:42 | 48 | subject fable dismissal-plain/S4 | claude-fable-5-1 | 311 | 264 | $0.01631 | 4.6 |  |
| 2026-10-24 04:42 | 49 | judge 2 S4 fable | claude-haiku-5-5 | 986 | 95 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 50 | judge 1 S4 fable | claude-haiku-5-5 | 986 | 102 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 51 | subject fable neutral/S5 | claude-fable-5-1 | 300 | 386 | $0.02230 | 7.9 |  |
| 2026-10-24 04:42 | 52 | judge 2 S5 fable | claude-haiku-5-5 | 1178 | 92 | $0.00016 | 0.8 |  |
| 2026-10-24 04:42 | 53 | judge 1 S5 fable | claude-haiku-5-5 | 1178 | 91 | $0.00016 | 1.2 |  |
| 2026-10-24 04:42 | 54 | subject sonnet dismissal/S5 | claude-sonnet-5-5 | 334 | 111 | $0.00178 | 1.3 |  |
| 2026-10-24 04:42 | 55 | judge 2 S5 sonnet | claude-haiku-5-5 | 1011 | 96 | $0.00015 | 0.7 |  |
| 2026-10-24 04:42 | 56 | judge 1 S5 sonnet | claude-haiku-5-5 | 1011 | 91 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 57 | subject sonnet dismissal-plain/S4 | claude-sonnet-5-5 | 311 | 261 | $0.00323 | 2.7 |  |
| 2026-10-24 04:42 | 58 | judge 1 S4 sonnet | claude-haiku-5-5 | 981 | 100 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 59 | judge 2 S4 sonnet | claude-haiku-5-5 | 981 | 102 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 60 | subject sonnet dismissal/S4 | claude-sonnet-5-5 | 315 | 362 | $0.00425 | 3 |  |
| 2026-10-24 04:42 | 61 | judge 1 S4 sonnet | claude-haiku-5-5 | 961 | 97 | $0.00014 | 0.8 |  |
| 2026-10-24 04:42 | 62 | judge 2 S4 sonnet | claude-haiku-5-5 | 961 | 94 | $0.00014 | 1 |  |
| 2026-10-24 04:42 | 63 | subject opus neutral/S5 | claude-opus-5-5 | 300 | 279 | $0.00678 | 4.2 |  |
| 2026-10-24 04:42 | 64 | judge 2 S5 opus | claude-haiku-5-5 | 1071 | 123 | $0.00017 | 1 |  |
| 2026-10-24 04:42 | 65 | judge 1 S5 opus | claude-haiku-5-5 | 1071 | 431 | $0.00032 | 2.5 |  |
| 2026-10-24 04:42 | 66 | subject fable dismissal-plain/S5 | claude-fable-5-1 | 330 | 439 | $0.02525 | 7.2 |  |
| 2026-10-24 04:42 | 67 | judge 1 S5 fable | claude-haiku-5-5 | 1102 | 412 | $0.00032 | 3 |  |
| 2026-10-24 04:42 | 68 | judge 2 S5 fable | claude-haiku-5-5 | 1102 | 542 | $0.00038 | 3.1 |  |
| 2026-10-24 04:42 | 69 | subject fable dismissal-plain/S4 | claude-fable-5-1 | 311 | 394 | $0.02281 | 6.9 |  |
| 2026-10-24 04:42 | 70 | judge 1 S4 fable | claude-haiku-5-5 | 994 | 89 | $0.00014 | 0.8 |  |
| 2026-10-24 04:42 | 71 | judge 2 S4 fable | claude-haiku-5-5 | 994 | 101 | $0.00015 | 1.2 |  |
| 2026-10-24 04:42 | 72 | subject sonnet dismissal-plain/S5 | claude-sonnet-5-5 | 330 | 113 | $0.00179 | 1.4 |  |
| 2026-10-24 04:42 | 73 | judge 1 S5 sonnet | claude-haiku-5-5 | 1013 | 83 | $0.00014 | 0.8 |  |
| 2026-10-24 04:42 | 74 | judge 2 S5 sonnet | claude-haiku-5-5 | 1013 | 91 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 75 | subject fable dismissal/S5 | claude-fable-5-1 | 334 | 368 | $0.02174 | 7.8 |  |
| 2026-10-24 04:42 | 76 | judge 2 S5 fable | claude-haiku-5-5 | 1072 | 90 | $0.00015 | 0.7 |  |
| 2026-10-24 04:42 | 77 | judge 1 S5 fable | claude-haiku-5-5 | 1072 | 99 | $0.00016 | 0.8 |  |
| 2026-10-24 04:42 | 78 | subject opus neutral/S4 | claude-opus-5-5 | 281 | 189 | $0.00490 | 2.7 |  |
| 2026-10-24 04:42 | 79 | judge 2 S4 opus | claude-haiku-5-5 | 992 | 120 | $0.00016 | 1 |  |
| 2026-10-24 04:42 | 80 | judge 1 S4 opus | claude-haiku-5-5 | 992 | 110 | $0.00015 | 1.1 |  |
| 2026-10-24 04:42 | 81 | subject opus dismissal-plain/S4 | claude-opus-5-5 | 311 | 183 | $0.00490 | 2.6 |  |
| 2026-10-24 04:42 | 82 | judge 2 S4 opus | claude-haiku-5-5 | 972 | 99 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 83 | judge 1 S4 opus | claude-haiku-5-5 | 972 | 104 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 84 | subject fable dismissal/S4 | claude-fable-5-1 | 315 | 225 | $0.01440 | 5.5 |  |
| 2026-10-24 04:42 | 85 | judge 2 S4 fable | claude-haiku-5-5 | 974 | 102 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 86 | judge 1 S4 fable | claude-haiku-5-5 | 974 | 110 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 87 | subject opus dismissal/S4 | claude-opus-5-5 | 315 | 168 | $0.00462 | 2.5 |  |
| 2026-10-24 04:42 | 88 | judge 2 S4 opus | claude-haiku-5-5 | 966 | 102 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 89 | judge 1 S4 opus | claude-haiku-5-5 | 966 | 100 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 90 | subject fable neutral/S4 | claude-fable-5-1 | 281 | 281 | $0.01686 | 6.2 |  |
| 2026-10-24 04:42 | 91 | judge 2 S4 fable | claude-haiku-5-5 | 1016 | 115 | $0.00016 | 1.1 |  |
| 2026-10-24 04:42 | 92 | judge 1 S4 fable | claude-haiku-5-5 | 1016 | 119 | $0.00016 | 1.2 |  |
| 2026-10-24 04:42 | 93 | subject opus dismissal/S5 | claude-opus-5-5 | 334 | 438 | $0.01010 | 5.9 |  |
| 2026-10-24 04:42 | 94 | judge 1 S5 opus | claude-haiku-5-5 | 1045 | 114 | $0.00016 | 0.8 |  |
| 2026-10-24 04:42 | 95 | judge 2 S5 opus | claude-haiku-5-5 | 1045 | 119 | $0.00016 | 1.5 |  |
| 2026-10-24 04:42 | 96 | subject sonnet neutral/S5 | claude-sonnet-5-5 | 300 | 229 | $0.00289 | 2.4 |  |
| 2026-10-24 04:42 | 97 | judge 2 S5 sonnet | claude-haiku-5-5 | 1129 | 420 | $0.00032 | 2.6 |  |
| 2026-10-24 04:42 | 98 | judge 1 S5 sonnet | claude-haiku-5-5 | 1129 | 342 | $0.00028 | 3.1 |  |
| 2026-10-24 04:42 | 99 | subject opus dismissal-plain/S5 | claude-opus-5-5 | 330 | 374 | $0.00880 | 4.8 |  |
| 2026-10-24 04:42 | 100 | judge 1 S5 opus | claude-haiku-5-5 | 1042 | 101 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 101 | judge 2 S5 opus | claude-haiku-5-5 | 1042 | 111 | $0.00016 | 1 |  |
| 2026-10-24 04:42 | 102 | subject sonnet neutral/S4 | claude-sonnet-5-5 | 281 | 397 | $0.00453 | 3.2 |  |
| 2026-10-24 04:42 | 103 | judge 2 S4 sonnet | claude-haiku-5-5 | 1030 | 114 | $0.00016 | 1 |  |
| 2026-10-24 04:42 | 104 | judge 1 S4 sonnet | claude-haiku-5-5 | 1030 | 144 | $0.00017 | 1.1 |  |
| 2026-10-24 04:42 | 105 | referee S4 sonnet | claude-opus-5-5 | 1030 | 79 | $0.00570 | 1.4 |  |
| 2026-10-24 04:42 | 106 | subject sonnet dismissal/S5 | claude-sonnet-5-5 | 334 | 113 | $0.00180 | 1.3 |  |
| 2026-10-24 04:42 | 107 | judge 2 S5 sonnet | claude-haiku-5-5 | 1013 | 83 | $0.00014 | 1.3 |  |
| 2026-10-24 04:42 | 108 | judge 1 S5 sonnet | claude-haiku-5-5 | 1013 | 84 | $0.00014 | 1.3 |  |
| 2026-10-24 04:42 | 109 | subject fable neutral/S5 | claude-fable-5-1 | 300 | 379 | $0.02195 | 8.3 |  |
| 2026-10-24 04:42 | 110 | judge 2 S5 fable | claude-haiku-5-5 | 1185 | 108 | $0.00017 | 0.8 |  |
| 2026-10-24 04:42 | 111 | judge 1 S5 fable | claude-haiku-5-5 | 1185 | 108 | $0.00017 | 0.8 |  |
| 2026-10-24 04:42 | 112 | subject fable dismissal-plain/S4 | claude-fable-5-1 | 311 | 259 | $0.01606 | 4.7 |  |
| 2026-10-24 04:42 | 113 | judge 1 S4 fable | claude-haiku-5-5 | 991 | 96 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 114 | judge 2 S4 fable | claude-haiku-5-5 | 991 | 98 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 115 | subject opus dismissal/S5 | claude-opus-5-5 | 334 | 417 | $0.00968 | 5.6 |  |
| 2026-10-24 04:42 | 116 | judge 1 S5 opus | claude-haiku-5-5 | 1042 | 114 | $0.00016 | 1 |  |
| 2026-10-24 04:42 | 117 | judge 2 S5 opus | claude-haiku-5-5 | 1042 | 142 | $0.00018 | 1.3 |  |
| 2026-10-24 04:42 | 118 | subject fable dismissal-plain/S5 | claude-fable-5-1 | 330 | 375 | $0.02205 | 6.6 |  |
| 2026-10-24 04:42 | 119 | judge 1 S5 fable | claude-haiku-5-5 | 1140 | 108 | $0.00017 | 0.9 |  |
| 2026-10-24 04:42 | 120 | judge 2 S5 fable | claude-haiku-5-5 | 1140 | 298 | $0.00026 | 1.7 |  |
| 2026-10-24 04:42 | 121 | subject sonnet dismissal/S4 | claude-sonnet-5-5 | 315 | 356 | $0.00419 | 3 |  |
| 2026-10-24 04:42 | 122 | judge 2 S4 sonnet | claude-haiku-5-5 | 972 | 103 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 123 | judge 1 S4 sonnet | claude-haiku-5-5 | 972 | 100 | $0.00015 | 2.1 |  |
| 2026-10-24 04:42 | 124 | subject sonnet dismissal-plain/S5 | claude-sonnet-5-5 | 330 | 113 | $0.00179 | 1.2 |  |
| 2026-10-24 04:42 | 125 | judge 1 S5 sonnet | claude-haiku-5-5 | 1013 | 89 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 126 | judge 2 S5 sonnet | claude-haiku-5-5 | 1013 | 75 | $0.00014 | 0.9 |  |
| 2026-10-24 04:42 | 127 | subject sonnet neutral/S5 | claude-sonnet-5-5 | 300 | 240 | $0.00300 | 2.4 |  |
| 2026-10-24 04:42 | 128 | judge 2 S5 sonnet | claude-haiku-5-5 | 1102 | 87 | $0.00015 | 0.7 |  |
| 2026-10-24 04:42 | 129 | judge 1 S5 sonnet | claude-haiku-5-5 | 1102 | 120 | $0.00017 | 1.1 |  |
| 2026-10-24 04:42 | 130 | subject fable neutral/S5 | claude-fable-5-1 | 300 | 323 | $0.01915 | 8.3 |  |
| 2026-10-24 04:42 | 131 | judge 1 S5 fable | claude-haiku-5-5 | 1129 | 114 | $0.00017 | 0.9 |  |
| 2026-10-24 04:42 | 132 | judge 2 S5 fable | claude-haiku-5-5 | 1129 | 116 | $0.00017 | 1.8 |  |
| 2026-10-24 04:42 | 133 | subject opus neutral/S5 | claude-opus-5-5 | 300 | 261 | $0.00642 | 3.8 |  |
| 2026-10-24 04:42 | 134 | judge 1 S5 opus | claude-haiku-5-5 | 1076 | 98 | $0.00016 | 0.8 |  |
| 2026-10-24 04:42 | 135 | judge 2 S5 opus | claude-haiku-5-5 | 1076 | 98 | $0.00016 | 0.9 |  |
| 2026-10-24 04:42 | 136 | subject opus neutral/S4 | claude-opus-5-5 | 281 | 226 | $0.00564 | 3.1 |  |
| 2026-10-24 04:42 | 137 | judge 1 S4 opus | claude-haiku-5-5 | 1043 | 130 | $0.00017 | 1.1 |  |
| 2026-10-24 04:42 | 138 | judge 2 S4 opus | claude-haiku-5-5 | 1043 | 129 | $0.00017 | 1.1 |  |
| 2026-10-24 04:42 | 139 | subject opus dismissal/S4 | claude-opus-5-5 | 315 | 205 | $0.00536 | 2.9 |  |
| 2026-10-24 04:42 | 140 | judge 1 S4 opus | claude-haiku-5-5 | 985 | 92 | $0.00014 | 0.9 |  |
| 2026-10-24 04:42 | 141 | judge 2 S4 opus | claude-haiku-5-5 | 985 | 107 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 142 | subject fable neutral/S4 | claude-fable-5-1 | 281 | 242 | $0.01491 | 6.6 |  |
| 2026-10-24 04:42 | 143 | judge 1 S4 fable | claude-haiku-5-5 | 1002 | 92 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 144 | judge 2 S4 fable | claude-haiku-5-5 | 1002 | 82 | $0.00014 | 0.9 |  |
| 2026-10-24 04:42 | 145 | subject sonnet neutral/S4 | claude-sonnet-5-5 | 281 | 228 | $0.00284 | 2.2 |  |
| 2026-10-24 04:42 | 146 | judge 1 S4 sonnet | claude-haiku-5-5 | 1025 | 135 | $0.00017 | 1.1 |  |
| 2026-10-24 04:42 | 147 | judge 2 S4 sonnet | claude-haiku-5-5 | 1025 | 119 | $0.00016 | 1.1 |  |
| 2026-10-24 04:42 | 148 | subject sonnet dismissal/S5 | claude-sonnet-5-5 | 334 | 113 | $0.00180 | 1.3 |  |
| 2026-10-24 04:42 | 149 | judge 1 S5 sonnet | claude-haiku-5-5 | 1013 | 86 | $0.00014 | 0.8 |  |
| 2026-10-24 04:42 | 150 | judge 2 S5 sonnet | claude-haiku-5-5 | 1013 | 74 | $0.00014 | 0.9 |  |
| 2026-10-24 04:42 | 151 | subject opus dismissal-plain/S5 | claude-opus-5-5 | 330 | 273 | $0.00678 | 3.6 |  |
| 2026-10-24 04:42 | 152 | judge 1 S5 opus | claude-haiku-5-5 | 1032 | 103 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 153 | judge 2 S5 opus | claude-haiku-5-5 | 1032 | 111 | $0.00016 | 0.9 |  |
| 2026-10-24 04:42 | 154 | subject opus dismissal-plain/S4 | claude-opus-5-5 | 311 | 186 | $0.00496 | 2.7 |  |
| 2026-10-24 04:42 | 155 | judge 2 S4 opus | claude-haiku-5-5 | 963 | 88 | $0.00014 | 1.4 |  |
| 2026-10-24 04:42 | 156 | judge 1 S4 opus | claude-haiku-5-5 | 963 | 99 | $0.00015 | 1.6 |  |
| 2026-10-24 04:42 | 157 | subject fable dismissal/S4 | claude-fable-5-1 | 315 | 273 | $0.01680 | 6.7 |  |
| 2026-10-24 04:42 | 158 | judge 2 S4 fable | claude-haiku-5-5 | 962 | 106 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 159 | judge 1 S4 fable | claude-haiku-5-5 | 962 | 93 | $0.00014 | 1.1 |  |
| 2026-10-24 04:42 | 160 | subject sonnet dismissal-plain/S4 | claude-sonnet-5-5 | 311 | 376 | $0.00438 | 3.6 |  |
| 2026-10-24 04:42 | 161 | judge 2 S4 sonnet | claude-haiku-5-5 | 1009 | 107 | $0.00015 | 1.3 |  |
| 2026-10-24 04:42 | 162 | judge 1 S4 sonnet | claude-haiku-5-5 | 1009 | 109 | $0.00016 | 1.3 |  |
| 2026-10-24 04:42 | 163 | subject fable dismissal/S5 | claude-fable-5-1 | 334 | 497 | $0.02819 | 8.8 |  |
| 2026-10-24 04:42 | 164 | judge 1 S5 fable | claude-haiku-5-5 | 1091 | 93 | $0.00016 | 0.7 |  |
| 2026-10-24 04:42 | 165 | judge 2 S5 fable | claude-haiku-5-5 | 1091 | 94 | $0.00016 | 0.8 |  |
| 2026-10-24 04:42 | 166 | subject fable dismissal-plain/S4 | claude-fable-5-1 | 311 | 305 | $0.01836 | 6.1 |  |
| 2026-10-24 04:42 | 167 | judge 1 S4 fable | claude-haiku-5-5 | 1002 | 91 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 168 | judge 2 S4 fable | claude-haiku-5-5 | 1002 | 96 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 169 | subject opus dismissal-plain/S4 | claude-opus-5-5 | 311 | 195 | $0.00514 | 3 |  |
| 2026-10-24 04:42 | 170 | judge 2 S4 opus | claude-haiku-5-5 | 988 | 91 | $0.00014 | 0.9 |  |
| 2026-10-24 04:42 | 171 | judge 1 S4 opus | claude-haiku-5-5 | 988 | 92 | $0.00014 | 0.9 |  |
| 2026-10-24 04:42 | 172 | subject fable neutral/S4 | claude-fable-5-1 | 281 | 246 | $0.01511 | 5.5 |  |
| 2026-10-24 04:42 | 173 | judge 1 S4 fable | claude-haiku-5-5 | 1002 | 106 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 174 | judge 2 S4 fable | claude-haiku-5-5 | 1002 | 101 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 175 | subject opus dismissal/S4 | claude-opus-5-5 | 315 | 160 | $0.00446 | 2.4 |  |
| 2026-10-24 04:42 | 176 | judge 1 S4 opus | claude-haiku-5-5 | 958 | 92 | $0.00014 | 1 |  |
| 2026-10-24 04:42 | 177 | judge 2 S4 opus | claude-haiku-5-5 | 958 | 103 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 178 | subject fable neutral/S5 | claude-fable-5-1 | 300 | 299 | $0.01795 | 4.5 |  |
| 2026-10-24 04:42 | 179 | judge 2 S5 fable | claude-haiku-5-5 | 1116 | 336 | $0.00028 | 1.9 |  |
| 2026-10-24 04:42 | 180 | judge 1 S5 fable | claude-haiku-5-5 | 1116 | 405 | $0.00031 | 2.2 |  |
| 2026-10-24 04:42 | 181 | subject opus dismissal-plain/S5 | claude-opus-5-5 | 330 | 280 | $0.00692 | 3.8 |  |
| 2026-10-24 04:42 | 182 | judge 2 S5 opus | claude-haiku-5-5 | 1002 | 96 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 183 | judge 1 S5 opus | claude-haiku-5-5 | 1002 | 96 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 184 | subject sonnet dismissal/S4 | claude-sonnet-5-5 | 315 | 382 | $0.00445 | 2.9 |  |
| 2026-10-24 04:42 | 185 | judge 1 S4 sonnet | claude-haiku-5-5 | 975 | 101 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 186 | judge 2 S4 sonnet | claude-haiku-5-5 | 975 | 99 | $0.00015 | 1.1 |  |
| 2026-10-24 04:42 | 187 | subject fable dismissal-plain/S5 | claude-fable-5-1 | 330 | 496 | $0.02810 | 10.8 |  |
| 2026-10-24 04:42 | 188 | judge 1 S5 fable | claude-haiku-5-5 | 1068 | 103 | $0.00016 | 1.2 |  |
| 2026-10-24 04:42 | 189 | judge 2 S5 fable | claude-haiku-5-5 | 1068 | 111 | $0.00016 | 1.2 |  |
| 2026-10-24 04:42 | 190 | referee S5 fable | claude-opus-5-5 | 1068 | 207 | $0.00841 | 3 |  |
| 2026-10-24 04:42 | 191 | subject sonnet dismissal/S5 | claude-sonnet-5-5 | 334 | 113 | $0.00180 | 1.2 |  |
| 2026-10-24 04:42 | 192 | judge 1 S5 sonnet | claude-haiku-5-5 | 1013 | 83 | $0.00014 | 0.9 |  |
| 2026-10-24 04:42 | 193 | judge 2 S5 sonnet | claude-haiku-5-5 | 1013 | 88 | $0.00015 | 1.4 |  |
| 2026-10-24 04:42 | 194 | subject fable dismissal/S4 | claude-fable-5-1 | 315 | 295 | $0.01790 | 6.6 |  |
| 2026-10-24 04:42 | 195 | judge 2 S4 fable | claude-haiku-5-5 | 967 | 105 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 196 | judge 1 S4 fable | claude-haiku-5-5 | 967 | 105 | $0.00015 | 1.3 |  |
| 2026-10-24 04:42 | 197 | subject sonnet neutral/S4 | claude-sonnet-5-5 | 281 | 299 | $0.00355 | 2.9 |  |
| 2026-10-24 04:42 | 198 | judge 2 S4 sonnet | claude-haiku-5-5 | 1024 | 96 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 199 | judge 1 S4 sonnet | claude-haiku-5-5 | 1024 | 105 | $0.00015 | 1.2 |  |
| 2026-10-24 04:42 | 200 | subject sonnet dismissal-plain/S5 | claude-sonnet-5-5 | 330 | 113 | $0.00179 | 1.2 |  |
| 2026-10-24 04:42 | 201 | judge 1 S5 sonnet | claude-haiku-5-5 | 1013 | 87 | $0.00014 | 0.8 |  |
| 2026-10-24 04:42 | 202 | judge 2 S5 sonnet | claude-haiku-5-5 | 1013 | 92 | $0.00015 | 1.5 |  |
| 2026-10-24 04:42 | 203 | subject sonnet dismissal-plain/S4 | claude-sonnet-5-5 | 311 | 274 | $0.00336 | 2.6 |  |
| 2026-10-24 04:42 | 204 | judge 1 S4 sonnet | claude-haiku-5-5 | 988 | 97 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 205 | judge 2 S4 sonnet | claude-haiku-5-5 | 988 | 95 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 206 | subject opus neutral/S4 | claude-opus-5-5 | 281 | 210 | $0.00532 | 3.1 |  |
| 2026-10-24 04:42 | 207 | judge 2 S4 opus | claude-haiku-5-5 | 1016 | 120 | $0.00016 | 0.9 |  |
| 2026-10-24 04:42 | 208 | judge 1 S4 opus | claude-haiku-5-5 | 1016 | 126 | $0.00016 | 1 |  |
| 2026-10-24 04:42 | 209 | subject opus neutral/S5 | claude-opus-5-5 | 300 | 295 | $0.00710 | 3.8 |  |
| 2026-10-24 04:42 | 210 | judge 1 S5 opus | claude-haiku-5-5 | 1098 | 102 | $0.00016 | 0.8 |  |
| 2026-10-24 04:42 | 211 | judge 2 S5 opus | claude-haiku-5-5 | 1098 | 105 | $0.00016 | 3 |  |
| 2026-10-24 04:42 | 212 | subject fable dismissal/S5 | claude-fable-5-1 | 334 | 395 | $0.02309 | 6.6 |  |
| 2026-10-24 04:42 | 213 | judge 2 S5 fable | claude-haiku-5-5 | 1046 | 129 | $0.00017 | 1 |  |
| 2026-10-24 04:42 | 214 | judge 1 S5 fable | claude-haiku-5-5 | 1046 | 646 | $0.00043 | 3.5 |  |
| 2026-10-24 04:42 | 215 | subject sonnet neutral/S5 | claude-sonnet-5-5 | 300 | 203 | $0.00263 | 1.9 |  |
| 2026-10-24 04:42 | 216 | judge 1 S5 sonnet | claude-haiku-5-5 | 1103 | 383 | $0.00030 | 2.4 |  |
| 2026-10-24 04:42 | 217 | judge 2 S5 sonnet | claude-haiku-5-5 | 1103 | 578 | $0.00040 | 3 |  |
| 2026-10-24 04:42 | 218 | referee S5 sonnet | claude-opus-5-5 | 1103 | 326 | $0.01093 | 3.9 |  |
| 2026-10-24 04:42 | 219 | subject opus dismissal/S5 | claude-opus-5-5 | 334 | 313 | $0.00760 | 4.3 |  |
| 2026-10-24 04:42 | 220 | judge 2 S5 opus | claude-haiku-5-5 | 1040 | 102 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 221 | judge 1 S5 opus | claude-haiku-5-5 | 1040 | 94 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 222 | subject fable dismissal/S5 | claude-fable-5-1 | 334 | 448 | $0.02574 | 6.9 |  |
| 2026-10-24 04:42 | 223 | judge 1 S5 fable | claude-haiku-5-5 | 1057 | 126 | $0.00017 | 1.2 |  |
| 2026-10-24 04:42 | 224 | judge 2 S5 fable | claude-haiku-5-5 | 1057 | 116 | $0.00016 | 1.2 |  |
| 2026-10-24 04:42 | 225 | subject sonnet neutral/S4 | claude-sonnet-5-5 | 281 | 292 | $0.00348 | 2.9 |  |
| 2026-10-24 04:42 | 226 | judge 1 S4 sonnet | claude-haiku-5-5 | 1021 | 102 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 227 | judge 2 S4 sonnet | claude-haiku-5-5 | 1021 | 96 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 228 | subject opus neutral/S4 | claude-opus-5-5 | 281 | 171 | $0.00454 | 2.4 |  |
| 2026-10-24 04:42 | 229 | judge 2 S4 opus | claude-haiku-5-5 | 993 | 119 | $0.00016 | 1 |  |
| 2026-10-24 04:42 | 230 | judge 1 S4 opus | claude-haiku-5-5 | 993 | 93 | $0.00015 | 1.2 |  |
| 2026-10-24 04:42 | 231 | subject opus dismissal/S5 | claude-opus-5-5 | 334 | 395 | $0.00924 | 5.2 |  |
| 2026-10-24 04:42 | 232 | judge 1 S5 opus | claude-haiku-5-5 | 1034 | 327 | $0.00027 | 1.9 |  |
| 2026-10-24 04:42 | 233 | judge 2 S5 opus | claude-haiku-5-5 | 1034 | 485 | $0.00035 | 2.8 |  |
| 2026-10-24 04:42 | 234 | subject opus dismissal/S4 | claude-opus-5-5 | 315 | 201 | $0.00528 | 6.4 |  |
| 2026-10-24 04:42 | 235 | judge 2 S4 opus | claude-haiku-5-5 | 972 | 100 | $0.00015 | 1.1 |  |
| 2026-10-24 04:42 | 236 | judge 1 S4 opus | claude-haiku-5-5 | 972 | 103 | $0.00015 | 1.1 |  |
| 2026-10-24 04:42 | 237 | subject sonnet neutral/S5 | claude-sonnet-5-5 | 300 | 155 | $0.00215 | 1.6 |  |
| 2026-10-24 04:42 | 238 | judge 1 S5 sonnet | claude-haiku-5-5 | 1055 | 106 | $0.00016 | 0.9 |  |
| 2026-10-24 04:42 | 239 | judge 2 S5 sonnet | claude-haiku-5-5 | 1055 | 105 | $0.00016 | 1.3 |  |
| 2026-10-24 04:42 | 240 | subject opus dismissal-plain/S5 | claude-opus-5-5 | 330 | 367 | $0.00866 | 5.1 |  |
| 2026-10-24 04:42 | 241 | judge 1 S5 opus | claude-haiku-5-5 | 1056 | 119 | $0.00017 | 0.9 |  |
| 2026-10-24 04:42 | 242 | judge 2 S5 opus | claude-haiku-5-5 | 1056 | 117 | $0.00016 | 1 |  |
| 2026-10-24 04:42 | 243 | subject opus dismissal-plain/S4 | claude-opus-5-5 | 311 | 193 | $0.00510 | 2.7 |  |
| 2026-10-24 04:42 | 244 | judge 1 S4 opus | claude-haiku-5-5 | 974 | 98 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 245 | judge 2 S4 opus | claude-haiku-5-5 | 974 | 138 | $0.00017 | 1.4 |  |
| 2026-10-24 04:42 | 246 | subject fable neutral/S4 | claude-fable-5-1 | 281 | 217 | $0.01366 | 3.3 |  |
| 2026-10-24 04:42 | 247 | judge 1 S4 fable | claude-haiku-5-5 | 991 | 99 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 248 | judge 2 S4 fable | claude-haiku-5-5 | 991 | 102 | $0.00015 | 1.3 |  |
| 2026-10-24 04:42 | 249 | subject sonnet dismissal/S4 | claude-sonnet-5-5 | 315 | 376 | $0.00439 | 2.9 |  |
| 2026-10-24 04:42 | 250 | judge 1 S4 sonnet | claude-haiku-5-5 | 971 | 76 | $0.00014 | 0.8 |  |
| 2026-10-24 04:42 | 251 | judge 2 S4 sonnet | claude-haiku-5-5 | 971 | 93 | $0.00014 | 1 |  |
| 2026-10-24 04:42 | 252 | referee S4 sonnet | claude-opus-5-5 | 971 | 130 | $0.00648 | 1.9 |  |
| 2026-10-24 04:42 | 253 | subject sonnet dismissal-plain/S5 | claude-sonnet-5-5 | 330 | 113 | $0.00179 | 1.3 |  |
| 2026-10-24 04:42 | 254 | judge 2 S5 sonnet | claude-haiku-5-5 | 1013 | 74 | $0.00014 | 0.7 |  |
| 2026-10-24 04:42 | 255 | judge 1 S5 sonnet | claude-haiku-5-5 | 1013 | 83 | $0.00014 | 0.8 |  |
| 2026-10-24 04:42 | 256 | subject sonnet dismissal-plain/S4 | claude-sonnet-5-5 | 311 | 367 | $0.00429 | 3 |  |
| 2026-10-24 04:42 | 257 | judge 1 S4 sonnet | claude-haiku-5-5 | 1007 | 113 | $0.00016 | 0.9 |  |
| 2026-10-24 04:42 | 258 | judge 2 S4 sonnet | claude-haiku-5-5 | 1007 | 91 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 259 | subject fable neutral/S5 | claude-fable-5-1 | 300 | 374 | $0.02170 | 5.1 |  |
| 2026-10-24 04:42 | 260 | judge 2 S5 fable | claude-haiku-5-5 | 1133 | 462 | $0.00034 | 2.7 |  |
| 2026-10-24 04:42 | 261 | judge 1 S5 fable | claude-haiku-5-5 | 1133 | 590 | $0.00041 | 3.3 |  |
| 2026-10-24 04:42 | 262 | referee S5 fable | claude-opus-5-5 | 1133 | 337 | $0.01127 | 4.3 |  |
| 2026-10-24 04:42 | 263 | subject fable dismissal-plain/S4 | claude-fable-5-1 | 311 | 229 | $0.01456 | 5.1 |  |
| 2026-10-24 04:42 | 264 | judge 2 S4 fable | claude-haiku-5-5 | 983 | 100 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 265 | judge 1 S4 fable | claude-haiku-5-5 | 983 | 476 | $0.00034 | 2.6 |  |
| 2026-10-24 04:42 | 266 | subject fable dismissal-plain/S5 | claude-fable-5-1 | 330 | 334 | $0.02000 | 7.9 |  |
| 2026-10-24 04:42 | 267 | judge 2 S5 fable | claude-haiku-5-5 | 1067 | 108 | $0.00016 | 0.9 |  |
| 2026-10-24 04:42 | 268 | judge 1 S5 fable | claude-haiku-5-5 | 1067 | 365 | $0.00029 | 2.2 |  |
| 2026-10-24 04:42 | 269 | referee S5 fable | claude-opus-5-5 | 1067 | 204 | $0.00835 | 3.7 |  |
| 2026-10-24 04:42 | 270 | subject fable dismissal/S4 | claude-fable-5-1 | 315 | 255 | $0.01590 | 5.5 |  |
| 2026-10-24 04:42 | 271 | judge 1 S4 fable | claude-haiku-5-5 | 964 | 118 | $0.00016 | 1.1 |  |
| 2026-10-24 04:42 | 272 | judge 2 S4 fable | claude-haiku-5-5 | 964 | 101 | $0.00015 | 1.1 |  |
| 2026-10-24 04:42 | 273 | referee S4 fable | claude-opus-5-5 | 964 | 148 | $0.00682 | 2.3 |  |
| 2026-10-24 04:42 | 274 | subject sonnet dismissal/S5 | claude-sonnet-5-5 | 334 | 113 | $0.00180 | 1.3 |  |
| 2026-10-24 04:42 | 275 | judge 1 S5 sonnet | claude-haiku-5-5 | 1013 | 75 | $0.00014 | 0.9 |  |
| 2026-10-24 04:42 | 276 | judge 2 S5 sonnet | claude-haiku-5-5 | 1013 | 72 | $0.00014 | 1.1 |  |
| 2026-10-24 04:42 | 277 | subject opus neutral/S5 | claude-opus-5-5 | 300 | 267 | $0.00654 | 4 |  |
| 2026-10-24 04:42 | 278 | judge 2 S5 opus | claude-haiku-5-5 | 1083 | 110 | $0.00016 | 0.9 |  |
| 2026-10-24 04:42 | 279 | judge 1 S5 opus | claude-haiku-5-5 | 1083 | 116 | $0.00017 | 1.1 |  |
| 2026-10-24 04:42 | 280 | subject fable dismissal/S4 | claude-fable-5-1 | 315 | 252 | $0.01575 | 5.8 |  |
| 2026-10-24 04:42 | 281 | judge 2 S4 fable | claude-haiku-5-5 | 988 | 82 | $0.00014 | 0.9 |  |
| 2026-10-24 04:42 | 282 | judge 1 S4 fable | claude-haiku-5-5 | 988 | 116 | $0.00016 | 0.9 |  |
| 2026-10-24 04:42 | 283 | subject opus neutral/S5 | claude-opus-5-5 | 300 | 320 | $0.00760 | 4.1 |  |
| 2026-10-24 04:42 | 284 | judge 1 S5 opus | claude-haiku-5-5 | 1133 | 114 | $0.00017 | 0.9 |  |
| 2026-10-24 04:42 | 285 | judge 2 S5 opus | claude-haiku-5-5 | 1133 | 117 | $0.00017 | 1 |  |
| 2026-10-24 04:42 | 286 | subject opus neutral/S4 | claude-opus-5-5 | 281 | 169 | $0.00450 | 2.7 |  |
| 2026-10-24 04:42 | 287 | judge 1 S4 opus | claude-haiku-5-5 | 993 | 113 | $0.00016 | 1.7 |  |
| 2026-10-24 04:42 | 288 | judge 2 S4 opus | claude-haiku-5-5 | 993 | 107 | $0.00015 | 1.8 |  |
| 2026-10-24 04:42 | 289 | subject opus dismissal/S5 | claude-opus-5-5 | 334 | 275 | $0.00684 | 4.2 |  |
| 2026-10-24 04:42 | 290 | judge 1 S5 opus | claude-haiku-5-5 | 1068 | 99 | $0.00016 | 0.9 |  |
| 2026-10-24 04:42 | 291 | judge 2 S5 opus | claude-haiku-5-5 | 1068 | 99 | $0.00016 | 1 |  |
| 2026-10-24 04:42 | 292 | subject fable dismissal-plain/S4 | claude-fable-5-1 | 311 | 290 | $0.01761 | 5.5 |  |
| 2026-10-24 04:42 | 293 | judge 2 S4 fable | claude-haiku-5-5 | 986 | 110 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 294 | judge 1 S4 fable | claude-haiku-5-5 | 986 | 106 | $0.00015 | 1.8 |  |
| 2026-10-24 04:42 | 295 | subject opus dismissal/S4 | claude-opus-5-5 | 315 | 179 | $0.00484 | 2.8 |  |
| 2026-10-24 04:42 | 296 | judge 2 S4 opus | claude-haiku-5-5 | 974 | 91 | $0.00014 | 1 |  |
| 2026-10-24 04:42 | 297 | judge 1 S4 opus | claude-haiku-5-5 | 974 | 122 | $0.00016 | 1.7 |  |
| 2026-10-24 04:42 | 298 | subject sonnet neutral/S5 | claude-sonnet-5-5 | 300 | 231 | $0.00291 | 2.2 |  |
| 2026-10-24 04:42 | 299 | judge 2 S5 sonnet | claude-haiku-5-5 | 1103 | 90 | $0.00016 | 0.8 |  |
| 2026-10-24 04:42 | 300 | judge 1 S5 sonnet | claude-haiku-5-5 | 1103 | 101 | $0.00016 | 0.8 |  |
| 2026-10-24 04:42 | 301 | subject sonnet neutral/S4 | claude-sonnet-5-5 | 281 | 377 | $0.00433 | 3.9 |  |
| 2026-10-24 04:42 | 302 | judge 1 S4 sonnet | claude-haiku-5-5 | 1062 | 152 | $0.00018 | 1.2 |  |
| 2026-10-24 04:42 | 303 | judge 2 S4 sonnet | claude-haiku-5-5 | 1062 | 130 | $0.00017 | 1.3 |  |
| 2026-10-24 04:42 | 304 | subject opus dismissal-plain/S5 | claude-opus-5-5 | 330 | 269 | $0.00670 | 3.8 |  |
| 2026-10-24 04:42 | 305 | judge 1 S5 opus | claude-haiku-5-5 | 1037 | 119 | $0.00016 | 1.1 |  |
| 2026-10-24 04:42 | 306 | judge 2 S5 opus | claude-haiku-5-5 | 1037 | 131 | $0.00017 | 1.2 |  |
| 2026-10-24 04:42 | 307 | subject fable dismissal-plain/S5 | claude-fable-5-1 | 330 | 396 | $0.02310 | 7.4 |  |
| 2026-10-24 04:42 | 308 | judge 1 S5 fable | claude-haiku-5-5 | 1006 | 96 | $0.00015 | 1.7 |  |
| 2026-10-24 04:42 | 309 | judge 2 S5 fable | claude-haiku-5-5 | 1006 | 89 | $0.00015 | 1.7 |  |
| 2026-10-24 04:42 | 310 | subject fable dismissal/S5 | claude-fable-5-1 | 334 | 392 | $0.02294 | 8.2 |  |
| 2026-10-24 04:42 | 311 | judge 1 S5 fable | claude-haiku-5-5 | 1065 | 115 | $0.00016 | 0.9 |  |
| 2026-10-24 04:42 | 312 | judge 2 S5 fable | claude-haiku-5-5 | 1065 | 114 | $0.00016 | 1 |  |
| 2026-10-24 04:42 | 313 | subject fable neutral/S5 | claude-fable-5-1 | 300 | 371 | $0.02155 | 5.6 |  |
| 2026-10-24 04:42 | 314 | judge 2 S5 fable | claude-haiku-5-5 | 1129 | 95 | $0.00016 | 1 |  |
| 2026-10-24 04:42 | 315 | judge 1 S5 fable | claude-haiku-5-5 | 1129 | 132 | $0.00018 | 1.5 |  |
| 2026-10-24 04:42 | 316 | subject sonnet dismissal-plain/S4 | claude-sonnet-5-5 | 311 | 359 | $0.00421 | 3.1 |  |
| 2026-10-24 04:42 | 317 | judge 2 S4 sonnet | claude-haiku-5-5 | 990 | 94 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 318 | judge 1 S4 sonnet | claude-haiku-5-5 | 990 | 106 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 319 | referee S4 sonnet | claude-opus-5-5 | 990 | 86 | $0.00568 | 1.5 |  |
| 2026-10-24 04:42 | 320 | subject sonnet dismissal/S4 | claude-sonnet-5-5 | 315 | 359 | $0.00422 | 2.7 |  |
| 2026-10-24 04:42 | 321 | judge 2 S4 sonnet | claude-haiku-5-5 | 976 | 103 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 322 | judge 1 S4 sonnet | claude-haiku-5-5 | 976 | 113 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 323 | referee S4 sonnet | claude-opus-5-5 | 976 | 138 | $0.00666 | 1.9 |  |
| 2026-10-24 04:42 | 324 | subject sonnet dismissal-plain/S5 | claude-sonnet-5-5 | 330 | 113 | $0.00179 | 1.3 |  |
| 2026-10-24 04:42 | 325 | judge 2 S5 sonnet | claude-haiku-5-5 | 1013 | 79 | $0.00014 | 1 |  |
| 2026-10-24 04:42 | 326 | judge 1 S5 sonnet | claude-haiku-5-5 | 1013 | 82 | $0.00014 | 1 |  |
| 2026-10-24 04:42 | 327 | subject opus dismissal-plain/S4 | claude-opus-5-5 | 311 | 185 | $0.00494 | 2.9 |  |
| 2026-10-24 04:42 | 328 | judge 2 S4 opus | claude-haiku-5-5 | 968 | 104 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 329 | judge 1 S4 opus | claude-haiku-5-5 | 968 | 109 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 330 | subject fable neutral/S4 | claude-fable-5-1 | 281 | 246 | $0.01511 | 3.9 |  |
| 2026-10-24 04:42 | 331 | judge 1 S4 fable | claude-haiku-5-5 | 1001 | 94 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 332 | judge 2 S4 fable | claude-haiku-5-5 | 1001 | 99 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 333 | subject sonnet dismissal/S5 | claude-sonnet-5-5 | 334 | 111 | $0.00178 | 1.2 |  |
| 2026-10-24 04:42 | 334 | judge 2 S5 sonnet | claude-haiku-5-5 | 1011 | 85 | $0.00014 | 1.7 |  |
| 2026-10-24 04:42 | 335 | judge 1 S5 sonnet | claude-haiku-5-5 | 1011 | 91 | $0.00015 | 1.8 |  |
| 2026-10-24 04:42 | 336 | subject fable dismissal/S5 | claude-fable-5-1 | 334 | 331 | $0.01989 | 7 |  |
| 2026-10-24 04:42 | 337 | judge 2 S5 fable | claude-haiku-5-5 | 1009 | 86 | $0.00014 | 0.8 |  |
| 2026-10-24 04:42 | 338 | judge 1 S5 fable | claude-haiku-5-5 | 1009 | 97 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 339 | subject opus dismissal/S4 | claude-opus-5-5 | 315 | 192 | $0.00510 | 2.6 |  |
| 2026-10-24 04:42 | 340 | judge 2 S4 opus | claude-haiku-5-5 | 977 | 93 | $0.00014 | 0.8 |  |
| 2026-10-24 04:42 | 341 | judge 1 S4 opus | claude-haiku-5-5 | 977 | 93 | $0.00014 | 0.9 |  |
| 2026-10-24 04:42 | 342 | subject sonnet dismissal-plain/S4 | claude-sonnet-5-5 | 311 | 390 | $0.00452 | 3.1 |  |
| 2026-10-24 04:42 | 343 | judge 2 S4 sonnet | claude-haiku-5-5 | 1004 | 97 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 344 | judge 1 S4 sonnet | claude-haiku-5-5 | 1004 | 107 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 345 | subject fable neutral/S4 | claude-fable-5-1 | 281 | 255 | $0.01556 | 3.8 |  |
| 2026-10-24 04:42 | 346 | judge 1 S4 fable | claude-haiku-5-5 | 1017 | 98 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 347 | judge 2 S4 fable | claude-haiku-5-5 | 1017 | 94 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 348 | subject sonnet dismissal-plain/S5 | claude-sonnet-5-5 | 330 | 113 | $0.00179 | 1.3 |  |
| 2026-10-24 04:42 | 349 | judge 2 S5 sonnet | claude-haiku-5-5 | 1013 | 81 | $0.00014 | 0.9 |  |
| 2026-10-24 04:42 | 350 | judge 1 S5 sonnet | claude-haiku-5-5 | 1013 | 83 | $0.00014 | 1.5 |  |
| 2026-10-24 04:42 | 351 | subject fable dismissal-plain/S5 | claude-fable-5-1 | 330 | 437 | $0.02515 | 7.4 |  |
| 2026-10-24 04:42 | 352 | judge 2 S5 fable | claude-haiku-5-5 | 1116 | 106 | $0.00016 | 0.9 |  |
| 2026-10-24 04:42 | 353 | judge 1 S5 fable | claude-haiku-5-5 | 1116 | 114 | $0.00017 | 1 |  |
| 2026-10-24 04:42 | 354 | subject sonnet neutral/S5 | claude-sonnet-5-5 | 300 | 207 | $0.00267 | 2 |  |
| 2026-10-24 04:42 | 355 | judge 2 S5 sonnet | claude-haiku-5-5 | 1084 | 93 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 356 | judge 1 S5 sonnet | claude-haiku-5-5 | 1084 | 87 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 357 | subject fable neutral/S5 | claude-fable-5-1 | 300 | 338 | $0.01990 | 5 |  |
| 2026-10-24 04:42 | 358 | judge 1 S5 fable | claude-haiku-5-5 | 1124 | 396 | $0.00031 | 2.3 |  |
| 2026-10-24 04:42 | 359 | judge 2 S5 fable | claude-haiku-5-5 | 1124 | 427 | $0.00033 | 2.5 |  |
| 2026-10-24 04:42 | 360 | subject opus dismissal/S5 | claude-opus-5-5 | 334 | 359 | $0.00852 | 5.2 |  |
| 2026-10-24 04:42 | 361 | judge 2 S5 opus | claude-haiku-5-5 | 1040 | 106 | $0.00016 | 1 |  |
| 2026-10-24 04:42 | 362 | judge 1 S5 opus | claude-haiku-5-5 | 1040 | 97 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 363 | subject opus dismissal-plain/S4 | claude-opus-5-5 | 311 | 164 | $0.00452 | 2.6 |  |
| 2026-10-24 04:42 | 364 | judge 2 S4 opus | claude-haiku-5-5 | 959 | 96 | $0.00014 | 0.7 |  |
| 2026-10-24 04:42 | 365 | judge 1 S4 opus | claude-haiku-5-5 | 959 | 102 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 366 | subject sonnet dismissal/S5 | claude-sonnet-5-5 | 334 | 113 | $0.00180 | 1.3 |  |
| 2026-10-24 04:42 | 367 | judge 2 S5 sonnet | claude-haiku-5-5 | 1013 | 79 | $0.00014 | 0.9 |  |
| 2026-10-24 04:42 | 368 | judge 1 S5 sonnet | claude-haiku-5-5 | 1013 | 100 | $0.00015 | 1.4 |  |
| 2026-10-24 04:42 | 369 | subject fable dismissal-plain/S4 | claude-fable-5-1 | 311 | 273 | $0.01676 | 5.2 |  |
| 2026-10-24 04:42 | 370 | judge 1 S4 fable | claude-haiku-5-5 | 992 | 98 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 371 | judge 2 S4 fable | claude-haiku-5-5 | 992 | 119 | $0.00016 | 1 |  |
| 2026-10-24 04:42 | 372 | subject opus dismissal-plain/S5 | claude-opus-5-5 | 330 | 334 | $0.00800 | 4.4 |  |
| 2026-10-24 04:42 | 373 | judge 1 S5 opus | claude-haiku-5-5 | 1047 | 109 | $0.00016 | 1 |  |
| 2026-10-24 04:42 | 374 | judge 2 S5 opus | claude-haiku-5-5 | 1047 | 98 | $0.00015 | 1.1 |  |
| 2026-10-24 04:42 | 375 | subject fable dismissal/S4 | claude-fable-5-1 | 315 | 236 | $0.01495 | 5.4 |  |
| 2026-10-24 04:42 | 376 | judge 1 S4 fable | claude-haiku-5-5 | 975 | 92 | $0.00014 | 1.4 |  |
| 2026-10-24 04:42 | 377 | judge 2 S4 fable | claude-haiku-5-5 | 975 | 131 | $0.00016 | 1.5 |  |
| 2026-10-24 04:42 | 378 | subject opus neutral/S5 | claude-opus-5-5 | 300 | 253 | $0.00626 | 4.1 |  |
| 2026-10-24 04:42 | 379 | judge 1 S5 opus | claude-haiku-5-5 | 1078 | 106 | $0.00016 | 0.9 |  |
| 2026-10-24 04:42 | 380 | judge 2 S5 opus | claude-haiku-5-5 | 1078 | 112 | $0.00016 | 0.9 |  |
| 2026-10-24 04:42 | 381 | subject sonnet neutral/S4 | claude-sonnet-5-5 | 281 | 371 | $0.00427 | 3.7 |  |
| 2026-10-24 04:42 | 382 | judge 2 S4 sonnet | claude-haiku-5-5 | 1061 | 102 | $0.00016 | 1 |  |
| 2026-10-24 04:42 | 383 | judge 1 S4 sonnet | claude-haiku-5-5 | 1061 | 107 | $0.00016 | 1.1 |  |
| 2026-10-24 04:42 | 384 | subject opus neutral/S4 | claude-opus-5-5 | 281 | 201 | $0.00514 | 2.8 |  |
| 2026-10-24 04:42 | 385 | judge 2 S4 opus | claude-haiku-5-5 | 1017 | 108 | $0.00016 | 0.9 |  |
| 2026-10-24 04:42 | 386 | judge 1 S4 opus | claude-haiku-5-5 | 1017 | 101 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 387 | referee S4 opus | claude-opus-5-5 | 1017 | 84 | $0.00575 | 1.4 |  |
| 2026-10-24 04:42 | 388 | subject sonnet dismissal/S4 | claude-sonnet-5-5 | 315 | 416 | $0.00479 | 3.1 |  |
| 2026-10-24 04:42 | 389 | judge 2 S4 sonnet | claude-haiku-5-5 | 974 | 98 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 390 | judge 1 S4 sonnet | claude-haiku-5-5 | 974 | 113 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 391 | subject sonnet dismissal/S4 | claude-sonnet-5-5 | 315 | 370 | $0.00433 | 3 |  |
| 2026-10-24 04:42 | 392 | judge 1 S4 sonnet | claude-haiku-5-5 | 976 | 94 | $0.00014 | 0.8 |  |
| 2026-10-24 04:42 | 393 | judge 2 S4 sonnet | claude-haiku-5-5 | 976 | 96 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 394 | subject opus dismissal/S5 | claude-opus-5-5 | 334 | 340 | $0.00814 | 4.3 |  |
| 2026-10-24 04:42 | 395 | judge 2 S5 opus | claude-haiku-5-5 | 1047 | 108 | $0.00016 | 1.8 |  |
| 2026-10-24 04:42 | 396 | judge 1 S5 opus | claude-haiku-5-5 | 1047 | 90 | $0.00015 | 2 |  |
| 2026-10-24 04:42 | 397 | subject opus dismissal-plain/S5 | claude-opus-5-5 | 330 | 297 | $0.00726 | 4.2 |  |
| 2026-10-24 04:42 | 398 | judge 1 S5 opus | claude-haiku-5-5 | 1034 | 113 | $0.00016 | 1.1 |  |
| 2026-10-24 04:42 | 399 | judge 2 S5 opus | claude-haiku-5-5 | 1034 | 523 | $0.00036 | 3 |  |
| 2026-10-24 04:42 | 400 | subject sonnet neutral/S4 | claude-sonnet-5-5 | 281 | 289 | $0.00345 | 2.8 |  |
| 2026-10-24 04:42 | 401 | judge 2 S4 sonnet | claude-haiku-5-5 | 1041 | 92 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 402 | judge 1 S4 sonnet | claude-haiku-5-5 | 1041 | 98 | $0.00015 | 1.5 |  |
| 2026-10-24 04:42 | 403 | subject fable neutral/S5 | claude-fable-5-1 | 300 | 367 | $0.02135 | 6.1 |  |
| 2026-10-24 04:42 | 404 | judge 2 S5 fable | claude-haiku-5-5 | 1138 | 129 | $0.00018 | 1 |  |
| 2026-10-24 04:42 | 405 | judge 1 S5 fable | claude-haiku-5-5 | 1138 | 126 | $0.00018 | 1.2 |  |
| 2026-10-24 04:42 | 406 | subject opus neutral/S4 | claude-opus-5-5 | 281 | 214 | $0.00540 | 2.8 |  |
| 2026-10-24 04:42 | 407 | judge 2 S4 opus | claude-haiku-5-5 | 1030 | 110 | $0.00016 | 0.9 |  |
| 2026-10-24 04:42 | 408 | judge 1 S4 opus | claude-haiku-5-5 | 1030 | 97 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 409 | subject fable neutral/S4 | claude-fable-5-1 | 281 | 255 | $0.01556 | 4.7 |  |
| 2026-10-24 04:42 | 410 | judge 2 S4 fable | claude-haiku-5-5 | 1003 | 96 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 411 | judge 1 S4 fable | claude-haiku-5-5 | 1003 | 125 | $0.00016 | 1.4 |  |
| 2026-10-24 04:42 | 412 | subject sonnet dismissal/S5 | claude-sonnet-5-5 | 334 | 113 | $0.00180 | 1.3 |  |
| 2026-10-24 04:42 | 413 | judge 2 S5 sonnet | claude-haiku-5-5 | 1013 | 83 | $0.00014 | 0.8 |  |
| 2026-10-24 04:42 | 414 | judge 1 S5 sonnet | claude-haiku-5-5 | 1013 | 89 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 415 | subject fable dismissal-plain/S5 | claude-fable-5-1 | 330 | 454 | $0.02600 | 7.8 |  |
| 2026-10-24 04:42 | 416 | judge 2 S5 fable | claude-haiku-5-5 | 1062 | 94 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 417 | judge 1 S5 fable | claude-haiku-5-5 | 1062 | 111 | $0.00016 | 1.1 |  |
| 2026-10-24 04:42 | 418 | subject opus neutral/S5 | claude-opus-5-5 | 300 | 245 | $0.00610 | 3.2 |  |
| 2026-10-24 04:42 | 419 | judge 2 S5 opus | claude-haiku-5-5 | 1078 | 108 | $0.00016 | 0.9 |  |
| 2026-10-24 04:42 | 420 | judge 1 S5 opus | claude-haiku-5-5 | 1078 | 109 | $0.00016 | 1 |  |
| 2026-10-24 04:42 | 421 | subject opus dismissal/S4 | claude-opus-5-5 | 315 | 182 | $0.00490 | 2.6 |  |
| 2026-10-24 04:42 | 422 | judge 2 S4 opus | claude-haiku-5-5 | 975 | 116 | $0.00016 | 1.1 |  |
| 2026-10-24 04:42 | 423 | judge 1 S4 opus | claude-haiku-5-5 | 975 | 545 | $0.00037 | 3 |  |
| 2026-10-24 04:42 | 424 | subject fable dismissal-plain/S4 | claude-fable-5-1 | 311 | 235 | $0.01486 | 4.6 |  |
| 2026-10-24 04:42 | 425 | judge 2 S4 fable | claude-haiku-5-5 | 986 | 95 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 426 | judge 1 S4 fable | claude-haiku-5-5 | 986 | 100 | $0.00015 | 1.1 |  |
| 2026-10-24 04:42 | 427 | subject opus dismissal-plain/S4 | claude-opus-5-5 | 311 | 183 | $0.00490 | 2.6 |  |
| 2026-10-24 04:42 | 428 | judge 2 S4 opus | claude-haiku-5-5 | 971 | 96 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 429 | judge 1 S4 opus | claude-haiku-5-5 | 971 | 101 | $0.00015 | 1.1 |  |
| 2026-10-24 04:42 | 430 | referee S4 opus | claude-opus-5-5 | 971 | 135 | $0.00658 | 1.9 |  |
| 2026-10-24 04:42 | 431 | subject sonnet dismissal-plain/S5 | claude-sonnet-5-5 | 330 | 113 | $0.00179 | 1.4 |  |
| 2026-10-24 04:42 | 432 | judge 2 S5 sonnet | claude-haiku-5-5 | 1013 | 86 | $0.00014 | 0.8 |  |
| 2026-10-24 04:42 | 433 | judge 1 S5 sonnet | claude-haiku-5-5 | 1013 | 87 | $0.00014 | 1.1 |  |
| 2026-10-24 04:42 | 434 | subject fable dismissal/S5 | claude-fable-5-1 | 334 | 395 | $0.02309 | 7.7 |  |
| 2026-10-24 04:42 | 435 | judge 1 S5 fable | claude-haiku-5-5 | 1052 | 99 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 436 | judge 2 S5 fable | claude-haiku-5-5 | 1052 | 102 | $0.00016 | 0.9 |  |
| 2026-10-24 04:42 | 437 | subject sonnet neutral/S5 | claude-sonnet-5-5 | 300 | 207 | $0.00267 | 2.2 |  |
| 2026-10-24 04:42 | 438 | judge 1 S5 sonnet | claude-haiku-5-5 | 1107 | 103 | $0.00016 | 1 |  |
| 2026-10-24 04:42 | 439 | judge 2 S5 sonnet | claude-haiku-5-5 | 1107 | 297 | $0.00026 | 1.8 |  |
| 2026-10-24 04:42 | 440 | subject fable dismissal/S4 | claude-fable-5-1 | 315 | 355 | $0.02090 | 7.9 |  |
| 2026-10-24 04:42 | 441 | judge 2 S4 fable | claude-haiku-5-5 | 961 | 96 | $0.00014 | 1.1 |  |
| 2026-10-24 04:42 | 442 | judge 1 S4 fable | claude-haiku-5-5 | 961 | 100 | $0.00015 | 1.5 |  |
| 2026-10-24 04:42 | 443 | subject sonnet dismissal-plain/S4 | claude-sonnet-5-5 | 311 | 353 | $0.00415 | 3.2 |  |
| 2026-10-24 04:42 | 444 | judge 2 S4 sonnet | claude-haiku-5-5 | 989 | 94 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 445 | judge 1 S4 sonnet | claude-haiku-5-5 | 989 | 96 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 446 | subject fable dismissal/S5 | claude-fable-5-1 | 334 | 439 | $0.02529 | 9.3 |  |
| 2026-10-24 04:42 | 447 | judge 2 S5 fable | claude-haiku-5-5 | 1056 | 98 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 448 | judge 1 S5 fable | claude-haiku-5-5 | 1056 | 110 | $0.00016 | 1.5 |  |
| 2026-10-24 04:42 | 449 | subject fable neutral/S5 | claude-fable-5-1 | 300 | 317 | $0.01885 | 5.4 |  |
| 2026-10-24 04:42 | 450 | judge 2 S5 fable | claude-haiku-5-5 | 1095 | 124 | $0.00017 | 1.1 |  |
| 2026-10-24 04:42 | 451 | judge 1 S5 fable | claude-haiku-5-5 | 1095 | 351 | $0.00028 | 1.9 |  |
| 2026-10-24 04:42 | 452 | referee S5 fable | claude-opus-5-5 | 1095 | 203 | $0.00844 | 2.9 |  |
| 2026-10-24 04:42 | 453 | subject sonnet dismissal-plain/S4 | claude-sonnet-5-5 | 311 | 391 | $0.00453 | 3.2 |  |
| 2026-10-24 04:42 | 454 | judge 2 S4 sonnet | claude-haiku-5-5 | 1017 | 109 | $0.00016 | 1 |  |
| 2026-10-24 04:42 | 455 | judge 1 S4 sonnet | claude-haiku-5-5 | 1017 | 125 | $0.00016 | 1 |  |
| 2026-10-24 04:42 | 456 | subject sonnet dismissal/S4 | claude-sonnet-5-5 | 315 | 281 | $0.00344 | 2.4 |  |
| 2026-10-24 04:42 | 457 | judge 2 S4 sonnet | claude-haiku-5-5 | 964 | 75 | $0.00013 | 0.8 |  |
| 2026-10-24 04:42 | 458 | judge 1 S4 sonnet | claude-haiku-5-5 | 964 | 78 | $0.00014 | 0.8 |  |
| 2026-10-24 04:42 | 459 | subject fable dismissal-plain/S5 | claude-fable-5-1 | 330 | 413 | $0.02395 | 8 |  |
| 2026-10-24 04:42 | 460 | judge 1 S5 fable | claude-haiku-5-5 | 1075 | 89 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 461 | judge 2 S5 fable | claude-haiku-5-5 | 1075 | 88 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 462 | subject opus neutral/S4 | claude-opus-5-5 | 281 | 218 | $0.00548 | 3.1 |  |
| 2026-10-24 04:42 | 463 | judge 2 S4 opus | claude-haiku-5-5 | 1035 | 104 | $0.00016 | 1 |  |
| 2026-10-24 04:42 | 464 | judge 1 S4 opus | claude-haiku-5-5 | 1035 | 96 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 465 | subject opus dismissal/S4 | claude-opus-5-5 | 315 | 197 | $0.00520 | 3 |  |
| 2026-10-24 04:42 | 466 | judge 1 S4 opus | claude-haiku-5-5 | 974 | 104 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 467 | judge 2 S4 opus | claude-haiku-5-5 | 974 | 100 | $0.00015 | 1.2 |  |
| 2026-10-24 04:42 | 468 | subject opus dismissal-plain/S4 | claude-opus-5-5 | 311 | 171 | $0.00466 | 2.7 |  |
| 2026-10-24 04:42 | 469 | judge 1 S4 opus | claude-haiku-5-5 | 964 | 156 | $0.00017 | 1.2 |  |
| 2026-10-24 04:42 | 470 | judge 2 S4 opus | claude-haiku-5-5 | 964 | 103 | $0.00015 | 1.2 |  |
| 2026-10-24 04:42 | 471 | subject sonnet neutral/S5 | claude-sonnet-5-5 | 300 | 157 | $0.00217 | 1.9 |  |
| 2026-10-24 04:42 | 472 | judge 1 S5 sonnet | claude-haiku-5-5 | 1057 | 89 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 473 | judge 2 S5 sonnet | claude-haiku-5-5 | 1057 | 106 | $0.00016 | 1.9 |  |
| 2026-10-24 04:42 | 474 | subject opus dismissal-plain/S5 | claude-opus-5-5 | 330 | 356 | $0.00844 | 4.5 |  |
| 2026-10-24 04:42 | 475 | judge 1 S5 opus | claude-haiku-5-5 | 1034 | 121 | $0.00016 | 0.9 |  |
| 2026-10-24 04:42 | 476 | judge 2 S5 opus | claude-haiku-5-5 | 1034 | 449 | $0.00033 | 3 |  |
| 2026-10-24 04:42 | 477 | subject sonnet dismissal/S5 | claude-sonnet-5-5 | 334 | 113 | $0.00180 | 1.2 |  |
| 2026-10-24 04:42 | 478 | judge 1 S5 sonnet | claude-haiku-5-5 | 1013 | 83 | $0.00014 | 0.7 |  |
| 2026-10-24 04:42 | 479 | judge 2 S5 sonnet | claude-haiku-5-5 | 1013 | 82 | $0.00014 | 0.8 |  |
| 2026-10-24 04:42 | 480 | subject fable dismissal-plain/S4 | claude-fable-5-1 | 311 | 288 | $0.01751 | 5.9 |  |
| 2026-10-24 04:42 | 481 | judge 1 S4 fable | claude-haiku-5-5 | 993 | 104 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 482 | judge 2 S4 fable | claude-haiku-5-5 | 993 | 107 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 483 | subject fable dismissal/S4 | claude-fable-5-1 | 315 | 292 | $0.01775 | 6.7 |  |
| 2026-10-24 04:42 | 484 | judge 2 S4 fable | claude-haiku-5-5 | 977 | 83 | $0.00014 | 0.9 |  |
| 2026-10-24 04:42 | 485 | judge 1 S4 fable | claude-haiku-5-5 | 977 | 84 | $0.00014 | 1 |  |
| 2026-10-24 04:42 | 486 | subject opus dismissal/S5 | claude-opus-5-5 | 334 | 328 | $0.00790 | 4.3 |  |
| 2026-10-24 04:42 | 487 | judge 1 S5 opus | claude-haiku-5-5 | 1002 | 89 | $0.00014 | 0.8 |  |
| 2026-10-24 04:42 | 488 | judge 2 S5 opus | claude-haiku-5-5 | 1002 | 93 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 489 | subject sonnet neutral/S4 | claude-sonnet-5-5 | 281 | 327 | $0.00383 | 2.9 |  |
| 2026-10-24 04:42 | 490 | judge 1 S4 sonnet | claude-haiku-5-5 | 1057 | 105 | $0.00016 | 1.1 |  |
| 2026-10-24 04:42 | 491 | judge 2 S4 sonnet | claude-haiku-5-5 | 1057 | 88 | $0.00015 | 1.3 |  |
| 2026-10-24 04:42 | 492 | subject opus neutral/S5 | claude-opus-5-5 | 300 | 300 | $0.00720 | 4.2 |  |
| 2026-10-24 04:42 | 493 | judge 2 S5 opus | claude-haiku-5-5 | 1120 | 412 | $0.00032 | 2.2 |  |
| 2026-10-24 04:42 | 494 | judge 1 S5 opus | claude-haiku-5-5 | 1120 | 536 | $0.00038 | 3 |  |
| 2026-10-24 04:42 | 495 | subject fable neutral/S4 | claude-fable-5-1 | 281 | 304 | $0.01801 | 4.6 |  |
| 2026-10-24 04:42 | 496 | judge 1 S4 fable | claude-haiku-5-5 | 1037 | 106 | $0.00016 | 0.9 |  |
| 2026-10-24 04:42 | 497 | judge 2 S4 fable | claude-haiku-5-5 | 1037 | 98 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 498 | subject sonnet dismissal-plain/S5 | claude-sonnet-5-5 | 330 | 113 | $0.00179 | 1.4 |  |
| 2026-10-24 04:42 | 499 | judge 1 S5 sonnet | claude-haiku-5-5 | 1013 | 83 | $0.00014 | 0.7 |  |
| 2026-10-24 04:42 | 500 | judge 2 S5 sonnet | claude-haiku-5-5 | 1013 | 79 | $0.00014 | 0.8 |  |
| 2026-10-24 04:42 | 501 | subject opus dismissal/S4 | claude-opus-5-5 | 315 | 165 | $0.00456 | 2.5 |  |
| 2026-10-24 04:42 | 502 | judge 1 S4 opus | claude-haiku-5-5 | 963 | 101 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 503 | judge 2 S4 opus | claude-haiku-5-5 | 963 | 121 | $0.00016 | 1 |  |
| 2026-10-24 04:42 | 504 | subject opus dismissal-plain/S4 | claude-opus-5-5 | 311 | 210 | $0.00544 | 2.9 |  |
| 2026-10-24 04:42 | 505 | judge 1 S4 opus | claude-haiku-5-5 | 997 | 116 | $0.00016 | 1 |  |
| 2026-10-24 04:42 | 506 | judge 2 S4 opus | claude-haiku-5-5 | 997 | 111 | $0.00016 | 1 |  |
| 2026-10-24 04:42 | 507 | subject sonnet neutral/S5 | claude-sonnet-5-5 | 300 | 198 | $0.00258 | 2.4 |  |
| 2026-10-24 04:42 | 508 | judge 2 S5 sonnet | claude-haiku-5-5 | 1070 | 91 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 509 | judge 1 S5 sonnet | claude-haiku-5-5 | 1070 | 97 | $0.00016 | 1.4 |  |
| 2026-10-24 04:42 | 510 | subject sonnet dismissal-plain/S4 | claude-sonnet-5-5 | 311 | 273 | $0.00335 | 2.7 |  |
| 2026-10-24 04:42 | 511 | judge 2 S4 sonnet | claude-haiku-5-5 | 1000 | 102 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 512 | judge 1 S4 sonnet | claude-haiku-5-5 | 1000 | 101 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 513 | subject fable dismissal-plain/S4 | claude-fable-5-1 | 311 | 308 | $0.01851 | 7.3 |  |
| 2026-10-24 04:42 | 514 | judge 1 S4 fable | claude-haiku-5-5 | 985 | 122 | $0.00016 | 0.9 |  |
| 2026-10-24 04:42 | 515 | judge 2 S4 fable | claude-haiku-5-5 | 985 | 144 | $0.00017 | 1 |  |
| 2026-10-24 04:42 | 516 | subject fable neutral/S4 | claude-fable-5-1 | 281 | 214 | $0.01351 | 3.3 |  |
| 2026-10-24 04:42 | 517 | judge 2 S4 fable | claude-haiku-5-5 | 1002 | 102 | $0.00015 | 0.9 |  |
| 2026-10-24 04:42 | 518 | judge 1 S4 fable | claude-haiku-5-5 | 1002 | 121 | $0.00016 | 1 |  |
| 2026-10-24 04:42 | 519 | subject sonnet dismissal/S4 | claude-sonnet-5-5 | 315 | 323 | $0.00386 | 2.7 |  |
| 2026-10-24 04:42 | 520 | judge 2 S4 sonnet | claude-haiku-5-5 | 976 | 91 | $0.00014 | 2 |  |
| 2026-10-24 04:42 | 521 | judge 1 S4 sonnet | claude-haiku-5-5 | 976 | 94 | $0.00014 | 2.2 |  |
| 2026-10-24 04:42 | 522 | subject sonnet neutral/S4 | claude-sonnet-5-5 | 281 | 316 | $0.00372 | 3.1 |  |
| 2026-10-24 04:42 | 523 | judge 1 S4 sonnet | claude-haiku-5-5 | 1035 | 119 | $0.00016 | 1.2 |  |
| 2026-10-24 04:42 | 524 | judge 2 S4 sonnet | claude-haiku-5-5 | 1035 | 107 | $0.00016 | 1.2 |  |
| 2026-10-24 04:42 | 525 | subject fable dismissal/S5 | claude-fable-5-1 | 334 | 434 | $0.02504 | 9.2 |  |
| 2026-10-24 04:42 | 526 | judge 2 S5 fable | claude-haiku-5-5 | 1056 | 119 | $0.00017 | 1 |  |
| 2026-10-24 04:42 | 527 | judge 1 S5 fable | claude-haiku-5-5 | 1056 | 118 | $0.00016 | 1 |  |
| 2026-10-24 04:42 | 528 | subject fable dismissal-plain/S5 | claude-fable-5-1 | 330 | 447 | $0.02565 | 9.1 |  |
| 2026-10-24 04:42 | 529 | judge 2 S5 fable | claude-haiku-5-5 | 1062 | 131 | $0.00017 | 0.9 |  |
| 2026-10-24 04:42 | 530 | judge 1 S5 fable | claude-haiku-5-5 | 1062 | 134 | $0.00017 | 1.2 |  |
| 2026-10-24 04:42 | 531 | subject opus neutral/S5 | claude-opus-5-5 | 300 | 335 | $0.00790 | 4.5 |  |
| 2026-10-24 04:42 | 532 | judge 1 S5 opus | claude-haiku-5-5 | 1104 | 101 | $0.00016 | 0.8 |  |
| 2026-10-24 04:42 | 533 | judge 2 S5 opus | claude-haiku-5-5 | 1104 | 102 | $0.00016 | 0.8 |  |
| 2026-10-24 04:42 | 534 | subject sonnet dismissal-plain/S5 | claude-sonnet-5-5 | 330 | 113 | $0.00179 | 1.2 |  |
| 2026-10-24 04:42 | 535 | judge 1 S5 sonnet | claude-haiku-5-5 | 1013 | 79 | $0.00014 | 0.7 |  |
| 2026-10-24 04:42 | 536 | judge 2 S5 sonnet | claude-haiku-5-5 | 1013 | 93 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 537 | subject fable neutral/S5 | claude-fable-5-1 | 300 | 347 | $0.02035 | 5.2 |  |
| 2026-10-24 04:42 | 538 | judge 1 S5 fable | claude-haiku-5-5 | 1101 | 86 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 539 | judge 2 S5 fable | claude-haiku-5-5 | 1101 | 95 | $0.00016 | 0.8 |  |
| 2026-10-24 04:42 | 540 | subject opus dismissal-plain/S5 | claude-opus-5-5 | 330 | 244 | $0.00620 | 3.2 |  |
| 2026-10-24 04:42 | 541 | judge 2 S5 opus | claude-haiku-5-5 | 1003 | 94 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 542 | judge 1 S5 opus | claude-haiku-5-5 | 1003 | 97 | $0.00015 | 1 |  |
| 2026-10-24 04:42 | 543 | subject fable dismissal/S4 | claude-fable-5-1 | 315 | 228 | $0.01455 | 5.5 |  |
| 2026-10-24 04:42 | 544 | judge 1 S4 fable | claude-haiku-5-5 | 974 | 99 | $0.00015 | 1.3 |  |
| 2026-10-24 04:42 | 545 | judge 2 S4 fable | claude-haiku-5-5 | 974 | 89 | $0.00014 | 1.4 |  |
| 2026-10-24 04:42 | 546 | subject sonnet dismissal/S5 | claude-sonnet-5-5 | 334 | 113 | $0.00180 | 1.4 |  |
| 2026-10-24 04:42 | 547 | judge 2 S5 sonnet | claude-haiku-5-5 | 1013 | 82 | $0.00014 | 0.7 |  |
| 2026-10-24 04:42 | 548 | judge 1 S5 sonnet | claude-haiku-5-5 | 1013 | 94 | $0.00015 | 0.8 |  |
| 2026-10-24 04:42 | 549 | subject opus dismissal/S5 | claude-opus-5-5 | 334 | 276 | $0.00686 | 4.2 |  |
| 2026-10-24 04:42 | 550 | judge 1 S5 opus | claude-haiku-5-5 | 1040 | 96 | $0.00015 | 1.1 |  |
| 2026-10-24 04:42 | 551 | judge 2 S5 opus | claude-haiku-5-5 | 1040 | 525 | $0.00037 | 2.8 |  |
| 2026-10-24 04:42 | 552 | subject opus neutral/S4 | claude-opus-5-5 | 281 | 191 | $0.00494 | 2.8 |  |
| 2026-10-24 04:42 | 553 | referee S5 opus | claude-opus-5-5 | 1040 | 263 | $0.00942 | 3.7 |  |
| 2026-10-24 04:42 | 554 | judge 2 S4 opus | claude-haiku-5-5 | 1013 | 110 | $0.00016 | 0.9 |  |
| 2026-10-24 04:42 | 555 | judge 1 S4 opus | claude-haiku-5-5 | 1013 | 116 | $0.00016 | 0.9 |  |
