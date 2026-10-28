# Game party 1 — the OpenRouter ledger

Cap $400; spent before this run $0.0000; this run $143.7291; total $143.7291; 1522 calls.

| Session | Purpose | Model | Calls | Input (uncached) | Cache read | Cache write | Output | USD | Errors | Refusals | 429 waits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| freeze SAND | wizard | anthropic/claude-opus-5.5 | 6 | 21559 | 3134 | 1567 | 18306 | $0.4608 | 0 | 0 | 0 |
| freeze GOAL | wizard | anthropic/claude-opus-5.5 | 4 | 14380 | 3134 | 0 | 12266 | $0.3035 | 0 | 0 | 0 |
| freeze DUNGEON | wizard | anthropic/claude-opus-5.5 | 4 | 14452 | 3134 | 0 | 10528 | $0.2690 | 0 | 0 | 0 |
| freeze GOAL | prep | anthropic/claude-opus-5.5 | 1 | 5783 | 0 | 17375 | 13743 | $0.4370 | 0 | 0 | 0 |
| freeze DUNGEON | prep | anthropic/claude-opus-5.5 | 1 | 5865 | 8601 | 8732 | 10894 | $0.3129 | 0 | 0 | 0 |
| SAND-T1 | relay opening | anthropic/claude-opus-5.5 | 1 | 1068 | 0 | 0 | 1576 | $0.0358 | 0 | 0 | 0 |
| SAND-T1/Bram | player r1 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 10595 | 349 | $0.0600 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r1 | anthropic/claude-haiku-5.5 | 1 | 1698 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r1 | anthropic/claude-haiku-5.5 | 1 | 1778 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| SAND-T1/Pell | player r1 | deepseek/deepseek-v4-pro-0813 | 1 | 7207 | 0 | 0 | 542 | $0.0108 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Pell r1 | anthropic/claude-haiku-5.5 | 1 | 1608 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| SAND-T1 | dm r1 | anthropic/claude-opus-5.5 | 4 | 16 | 93102 | 90772 | 9289 | $0.7793 | 0 | 0 | 0 |
| SAND-T1 | dm r1 | anthropic/claude-haiku-5.5 | 2 | 6252 | 0 | 0 | 1798 | $0.0015 | 0 | 0 | 0 |
| SAND-T1 | relay r1 | anthropic/claude-opus-5.5 | 1 | 2094 | 0 | 0 | 4307 | $0.0945 | 0 | 0 | 0 |
| SAND-T1/Bram | player r2 | anthropic/claude-opus-5.5 | 1 | 4 | 10595 | 1502 | 916 | $0.0280 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r2 | anthropic/claude-haiku-5.5 | 1 | 1994 | 0 | 0 | 79 | $0.0002 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r2 | anthropic/claude-haiku-5.5 | 1 | 1785 | 0 | 0 | 81 | $0.0002 | 0 | 0 | 0 |
| SAND-T1/Pell | player r2 | deepseek/deepseek-v4-pro-0813 | 1 | 1380 | 6912 | 0 | 543 | $0.0039 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Pell r2 | anthropic/claude-haiku-5.5 | 1 | 1875 | 0 | 0 | 82 | $0.0002 | 0 | 0 | 0 |
| SAND-T1 | dm r2 | anthropic/claude-opus-5.5 | 2 | 8 | 40315 | 58166 | 10378 | $0.5108 | 0 | 0 | 0 |
| SAND-T1 | dm r2 | anthropic/claude-haiku-5.5 | 1 | 3347 | 0 | 0 | 595 | $0.0006 | 0 | 0 | 0 |
| SAND-T1 | relay r2 | anthropic/claude-opus-5.5 | 1 | 2421 | 0 | 0 | 5181 | $0.1133 | 0 | 0 | 0 |
| SAND-T1/Bram | player r3 | anthropic/claude-opus-5.5 | 1 | 4 | 12097 | 1721 | 968 | $0.0304 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r3 | anthropic/claude-haiku-5.5 | 1 | 2180 | 0 | 0 | 77 | $0.0003 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r3 | anthropic/claude-haiku-5.5 | 1 | 2006 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| SAND-T1/Pell | player r3 | deepseek/deepseek-v4-pro-0813 | 1 | 1314 | 8192 | 0 | 685 | $0.0043 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Pell r3 | anthropic/claude-haiku-5.5 | 1 | 2429 | 0 | 0 | 65 | $0.0003 | 0 | 0 | 0 |
| SAND-T1 | dm r3 | anthropic/claude-opus-5.5 | 3 | 12 | 86433 | 52724 | 10861 | $0.5035 | 0 | 0 | 0 |
| SAND-T1 | dm r3 | anthropic/claude-haiku-5.5 | 2 | 5664 | 0 | 0 | 872 | $0.0010 | 0 | 0 | 0 |
| SAND-T1 | relay r3 | anthropic/claude-opus-5.5 | 1 | 2991 | 0 | 0 | 6000 | $0.1320 | 0 | 0 | 0 |
| SAND-T1 | relay r3 (asked again) | anthropic/claude-opus-5.5 | 1 | 2991 | 0 | 0 | 6000 | $0.1320 | 0 | 0 | 0 |
| SAND-T1/Bram | player r4 | anthropic/claude-opus-5.5 | 1 | 4 | 13818 | 1589 | 731 | $0.0253 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r4 | anthropic/claude-haiku-5.5 | 1 | 1885 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r4 | anthropic/claude-haiku-5.5 | 1 | 1476 | 0 | 0 | 80 | $0.0002 | 0 | 0 | 0 |
| SAND-T1/Pell | player r4 | deepseek/deepseek-v4-pro-0813 | 1 | 1458 | 9216 | 0 | 467 | $0.0040 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Pell r4 | anthropic/claude-haiku-5.5 | 1 | 1737 | 0 | 0 | 77 | $0.0002 | 0 | 0 | 0 |
| SAND-T1 | dm r4 | anthropic/claude-opus-5.5 | 2 | 8 | 43518 | 67542 | 12032 | $0.5941 | 0 | 0 | 0 |
| SAND-T1 | dm r4 | anthropic/claude-haiku-5.5 | 1 | 3838 | 0 | 0 | 562 | $0.0007 | 0 | 0 | 0 |
| SAND-T1 | relay r4 | anthropic/claude-opus-5.5 | 1 | 2972 | 0 | 0 | 6000 | $0.1319 | 0 | 0 | 0 |
| SAND-T1 | relay r4 (asked again) | anthropic/claude-opus-5.5 | 1 | 2972 | 0 | 0 | 6000 | $0.1319 | 0 | 0 | 0 |
| SAND-T1/Bram | player r5 | anthropic/claude-opus-5.5 | 1 | 4 | 15407 | 1762 | 842 | $0.0287 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r5 | anthropic/claude-haiku-5.5 | 1 | 2172 | 0 | 0 | 74 | $0.0003 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r5 | anthropic/claude-haiku-5.5 | 1 | 1702 | 0 | 0 | 57 | $0.0002 | 0 | 0 | 0 |
| SAND-T1/Pell | player r5 | deepseek/deepseek-v4-pro-0813 | 1 | 1320 | 10496 | 0 | 871 | $0.0050 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Pell r5 | anthropic/claude-haiku-5.5 | 1 | 2044 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| SAND-T1 | dm r5 | anthropic/claude-opus-5.5 | 3 | 12 | 101838 | 68493 | 14406 | $0.6579 | 0 | 0 | 0 |
| SAND-T1 | dm r5 | anthropic/claude-haiku-5.5 | 2 | 5916 | 0 | 0 | 644 | $0.0009 | 0 | 0 | 0 |
| SAND-T1 | relay r5 | anthropic/claude-opus-5.5 | 1 | 3298 | 0 | 0 | 6000 | $0.1332 | 0 | 0 | 0 |
| SAND-T1 | relay r5 (asked again) | anthropic/claude-opus-5.5 | 1 | 3298 | 0 | 0 | 6000 | $0.1332 | 0 | 0 | 0 |
| SAND-T1/Bram | player r6 | anthropic/claude-opus-5.5 | 1 | 4 | 17169 | 1882 | 1049 | $0.0338 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r6 | anthropic/claude-haiku-5.5 | 1 | 2181 | 0 | 0 | 74 | $0.0003 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r6 | anthropic/claude-haiku-5.5 | 1 | 1611 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| SAND-T1/Pell | player r6 | deepseek/deepseek-v4-pro-0813 | 1 | 1534 | 11520 | 0 | 814 | $0.0053 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Pell r6 | anthropic/claude-haiku-5.5 | 1 | 2041 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| SAND-T1 | dm r6 | anthropic/claude-opus-5.5 | 3 | 12 | 109824 | 75363 | 13316 | $0.6731 | 0 | 0 | 0 |
| SAND-T1 | dm r6 | anthropic/claude-haiku-5.5 | 2 | 7187 | 0 | 0 | 1160 | $0.0013 | 0 | 0 | 0 |
| SAND-T1 | relay r6 | anthropic/claude-opus-5.5 | 1 | 3785 | 0 | 0 | 4617 | $0.1075 | 0 | 0 | 0 |
| SAND-T1/Bram | player r7 | anthropic/claude-opus-5.5 | 1 | 4 | 19051 | 2134 | 731 | $0.0291 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r7 | anthropic/claude-haiku-5.5 | 1 | 2380 | 0 | 0 | 70 | $0.0003 | 0 | 0 | 0 |
| SAND-T1 | dm r7 | anthropic/claude-opus-5.5 | 7 | 28 | 236201 | 230829 | 14530 | $1.5096 | 0 | 0 | 0 |
| SAND-T1 | dm r7 | anthropic/claude-haiku-5.5 | 5 | 12503 | 0 | 0 | 2582 | $0.0025 | 0 | 0 | 0 |
| SAND-T1 | relay r7 | anthropic/claude-opus-5.5 | 2 | 3959 | 0 | 0 | 2023 | $0.0563 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r7 | anthropic/claude-haiku-5.5 | 1 | 1452 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| SAND-T1/Pell | player r7 | deepseek/deepseek-v4-pro-0813 | 1 | 1398 | 12800 | 0 | 457 | $0.0043 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Pell r7 | anthropic/claude-haiku-5.5 | 1 | 1685 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r8 | anthropic/claude-haiku-5.5 | 1 | 1472 | 0 | 0 | 71 | $0.0002 | 0 | 0 | 0 |
| SAND-T1 | dm r8 | anthropic/claude-opus-5.5 | 4 | 16 | 114239 | 146044 | 8078 | $0.9194 | 0 | 0 | 0 |
| SAND-T1 | dm r8 | anthropic/claude-haiku-5.5 | 2 | 4338 | 0 | 0 | 670 | $0.0008 | 0 | 0 | 0 |
| SAND-T1 | relay r8 | anthropic/claude-opus-5.5 | 2 | 3020 | 0 | 0 | 1608 | $0.0442 | 0 | 0 | 0 |
| SAND-T1/Bram | player r8 | anthropic/claude-opus-5.5 | 1 | 4 | 21185 | 1568 | 658 | $0.0253 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r8 | anthropic/claude-haiku-5.5 | 1 | 1762 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| SAND-T1/Bram | player r9 | anthropic/claude-opus-5.5 | 1 | 4 | 22753 | 1169 | 684 | $0.0241 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r9 | anthropic/claude-haiku-5.5 | 1 | 1472 | 0 | 0 | 80 | $0.0002 | 0 | 0 | 0 |
| SAND-T1 | dm r9 | anthropic/claude-opus-5.5 | 6 | 24 | 250404 | 157581 | 12550 | $1.0985 | 0 | 0 | 0 |
| SAND-T1 | dm r9 | anthropic/claude-haiku-5.5 | 4 | 9630 | 0 | 0 | 1140 | $0.0015 | 0 | 0 | 0 |
| SAND-T1 | relay r9 | anthropic/claude-opus-5.5 | 2 | 3871 | 0 | 0 | 2676 | $0.0690 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r9 | anthropic/claude-haiku-5.5 | 1 | 856 | 0 | 0 | 68 | $0.0001 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r10 | anthropic/claude-haiku-5.5 | 1 | 1019 | 0 | 0 | 64 | $0.0001 | 0 | 0 | 0 |
| SAND-T1 | dm r10 | anthropic/claude-opus-5.5 | 4 | 16 | 123425 | 155464 | 12024 | $1.0478 | 0 | 0 | 0 |
| SAND-T1 | dm r10 | anthropic/claude-haiku-5.5 | 2 | 5707 | 0 | 0 | 827 | $0.0010 | 0 | 0 | 0 |
| SAND-T1 | relay r10 | anthropic/claude-opus-5.5 | 2 | 3827 | 0 | 0 | 2667 | $0.0686 | 0 | 0 | 0 |
| SAND-T1/Bram | player r10 | anthropic/claude-opus-5.5 | 1 | 4 | 23922 | 1683 | 622 | $0.0257 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r10 | anthropic/claude-haiku-5.5 | 1 | 1957 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| SAND-T1/Bram | player r11 | anthropic/claude-opus-5.5 | 1 | 4 | 25605 | 1541 | 1042 | $0.0337 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r11 | anthropic/claude-haiku-5.5 | 1 | 2134 | 0 | 0 | 71 | $0.0002 | 0 | 0 | 0 |
| SAND-T1 | dm r11 | anthropic/claude-opus-5.5 | 6 | 24 | 273644 | 174419 | 15352 | $1.2456 | 0 | 0 | 0 |
| SAND-T1 | dm r11 | anthropic/claude-haiku-5.5 | 4 | 12665 | 0 | 0 | 1660 | $0.0021 | 0 | 0 | 0 |
| SAND-T1 | relay r11 | anthropic/claude-opus-5.5 | 2 | 4617 | 0 | 0 | 3093 | $0.0803 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r11 | anthropic/claude-haiku-5.5 | 1 | 1358 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r12 | anthropic/claude-haiku-5.5 | 1 | 1179 | 0 | 0 | 64 | $0.0001 | 0 | 0 | 0 |
| SAND-T1 | dm r12 | anthropic/claude-opus-5.5 | 4 | 16 | 135101 | 169733 | 18242 | $1.2477 | 0 | 0 | 0 |
| SAND-T1 | dm r12 | anthropic/claude-haiku-5.5 | 2 | 6271 | 0 | 0 | 839 | $0.0010 | 0 | 0 | 0 |
| SAND-T1 | relay r12 | anthropic/claude-opus-5.5 | 2 | 4052 | 0 | 0 | 2402 | $0.0642 | 0 | 0 | 0 |
| SAND-T1/Bram | player r12 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 29398 | 595 | $0.1589 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r12 | anthropic/claude-haiku-5.5 | 1 | 2280 | 0 | 0 | 70 | $0.0003 | 0 | 0 | 0 |
| SAND-T1/Bram | player r13 | anthropic/claude-opus-5.5 | 1 | 4 | 29398 | 1351 | 737 | $0.0274 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r13 | anthropic/claude-haiku-5.5 | 1 | 1918 | 0 | 0 | 81 | $0.0002 | 0 | 0 | 0 |
| SAND-T1 | dm r13 | anthropic/claude-opus-5.5 | 4 | 16 | 140320 | 180668 | 17083 | $1.2839 | 0 | 0 | 0 |
| SAND-T1 | dm r13 | anthropic/claude-haiku-5.5 | 2 | 6392 | 0 | 0 | 968 | $0.0011 | 0 | 0 | 0 |
| SAND-T1 | relay r13 | anthropic/claude-opus-5.5 | 2 | 4404 | 0 | 0 | 2999 | $0.0776 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r13 | anthropic/claude-haiku-5.5 | 1 | 1538 | 0 | 0 | 60 | $0.0002 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r14 | anthropic/claude-haiku-5.5 | 1 | 1487 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| SAND-T1 | dm r14 | anthropic/claude-opus-5.5 | 4 | 16 | 147094 | 191611 | 12924 | $1.2523 | 0 | 0 | 0 |
| SAND-T1 | dm r14 | anthropic/claude-haiku-5.5 | 2 | 5473 | 0 | 0 | 502 | $0.0008 | 0 | 0 | 0 |
| SAND-T1 | relay r14 | anthropic/claude-opus-5.5 | 2 | 3753 | 0 | 0 | 2229 | $0.0596 | 0 | 0 | 0 |
| SAND-T1/Bram | player r14 | anthropic/claude-opus-5.5 | 1 | 4 | 30749 | 1991 | 655 | $0.0292 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r14 | anthropic/claude-haiku-5.5 | 1 | 2156 | 0 | 0 | 70 | $0.0003 | 0 | 0 | 0 |
| SAND-T1/Bram | player r15 | anthropic/claude-opus-5.5 | 1 | 4 | 32740 | 1554 | 577 | $0.0259 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r15 | anthropic/claude-haiku-5.5 | 1 | 1850 | 0 | 0 | 87 | $0.0002 | 0 | 0 | 0 |
| SAND-T1 | dm r15 | anthropic/claude-opus-5.5 | 4 | 16 | 151750 | 203008 | 10723 | $1.2697 | 0 | 0 | 0 |
| SAND-T1 | dm r15 | anthropic/claude-haiku-5.5 | 2 | 5229 | 0 | 0 | 494 | $0.0008 | 0 | 0 | 0 |
| SAND-T1 | relay r15 | anthropic/claude-opus-5.5 | 2 | 3474 | 0 | 0 | 1843 | $0.0508 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r15 | anthropic/claude-haiku-5.5 | 1 | 1124 | 0 | 0 | 60 | $0.0001 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r16 | anthropic/claude-haiku-5.5 | 1 | 974 | 0 | 0 | 68 | $0.0001 | 0 | 0 | 0 |
| SAND-T1 | dm r16 | anthropic/claude-opus-5.5 | 5 | 20 | 239271 | 201863 | 12798 | $1.3171 | 0 | 0 | 0 |
| SAND-T1 | dm r16 | anthropic/claude-haiku-5.5 | 2 | 5209 | 0 | 0 | 474 | $0.0008 | 0 | 0 | 0 |
| SAND-T1 | relay r16 | anthropic/claude-opus-5.5 | 2 | 3824 | 0 | 0 | 2408 | $0.0635 | 0 | 0 | 0 |
| SAND-T1/Bram | player r16 | anthropic/claude-opus-5.5 | 1 | 4 | 34294 | 1633 | 891 | $0.0329 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r16 | anthropic/claude-haiku-5.5 | 1 | 2214 | 0 | 0 | 76 | $0.0003 | 0 | 0 | 0 |
| SAND-T1/Bram | player r17 | anthropic/claude-opus-5.5 | 1 | 4 | 35927 | 1910 | 726 | $0.0313 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r17 | anthropic/claude-haiku-5.5 | 1 | 2099 | 0 | 0 | 71 | $0.0002 | 0 | 0 | 0 |
| SAND-T1 | dm r17 | anthropic/claude-opus-5.5 | 3 | 12 | 139831 | 162827 | 6674 | $0.9888 | 0 | 0 | 0 |
| SAND-T1 | relay r17 card | anthropic/claude-opus-5.5 | 1 | 2299 | 0 | 0 | 1217 | $0.0335 | 0 | 0 | 0 |
| SAND-T1/Bram | player r17 card 1 | anthropic/claude-opus-5.5 | 2 | 8 | 77455 | 1966 | 152 | $0.0284 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r17 card | anthropic/claude-haiku-5.5 | 2 | 1960 | 0 | 0 | 118 | $0.0003 | 0 | 0 | 0 |
| SAND-T1 | dm r17 onward | anthropic/claude-opus-5.5 | 3 | 10 | 246807 | 58644 | 9564 | $0.5339 | 0 | 0 | 0 |
| SAND-T1 | dm r17 onward | anthropic/claude-haiku-5.5 | 2 | 6140 | 0 | 0 | 315 | $0.0008 | 0 | 0 | 0 |
| SAND-T1 | relay r17 | anthropic/claude-opus-5.5 | 2 | 5691 | 0 | 0 | 1909 | $0.0609 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r17 | anthropic/claude-haiku-5.5 | 1 | 964 | 0 | 0 | 60 | $0.0001 | 0 | 0 | 0 |
| SAND-T1 | dm r17 | anthropic/claude-haiku-5.5 | 1 | 2527 | 0 | 0 | 563 | $0.0005 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r18 | anthropic/claude-haiku-5.5 | 1 | 1215 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| SAND-T1 | dm r18 | anthropic/claude-opus-5.5 | 4 | 16 | 169024 | 222613 | 16419 | $1.4814 | 0 | 0 | 0 |
| SAND-T1 | dm r18 | anthropic/claude-haiku-5.5 | 2 | 6687 | 0 | 0 | 683 | $0.0010 | 0 | 0 | 0 |
| SAND-T1 | relay r18 | anthropic/claude-opus-5.5 | 2 | 4202 | 0 | 0 | 2795 | $0.0727 | 0 | 0 | 0 |
| SAND-T1/Bram | player r18 | anthropic/claude-opus-5.5 | 1 | 4 | 39803 | 785 | 981 | $0.0315 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r18 | anthropic/claude-haiku-5.5 | 1 | 1677 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| SAND-T1/Bram | player r19 | anthropic/claude-opus-5.5 | 1 | 4 | 40588 | 1982 | 1077 | $0.0396 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r19 | anthropic/claude-haiku-5.5 | 1 | 2563 | 0 | 0 | 74 | $0.0003 | 0 | 0 | 0 |
| SAND-T1 | dm r19 | anthropic/claude-opus-5.5 | 5 | 20 | 296046 | 234363 | 16501 | $1.5740 | 0 | 0 | 0 |
| SAND-T1 | dm r19 | anthropic/claude-haiku-5.5 | 3 | 8520 | 0 | 0 | 1162 | $0.0014 | 0 | 0 | 0 |
| SAND-T1 | relay r19 | anthropic/claude-opus-5.5 | 2 | 4443 | 0 | 0 | 2622 | $0.0702 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r19 | anthropic/claude-haiku-5.5 | 1 | 1212 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r20 | anthropic/claude-haiku-5.5 | 1 | 1191 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| SAND-T1 | dm r20 | anthropic/claude-opus-5.5 | 4 | 16 | 248786 | 170160 | 13415 | $1.1762 | 0 | 0 | 0 |
| SAND-T1 | dm r20 | anthropic/claude-haiku-5.5 | 2 | 7138 | 0 | 0 | 1630 | $0.0015 | 0 | 0 | 0 |
| SAND-T1 | relay r20 | anthropic/claude-opus-5.5 | 2 | 6103 | 0 | 0 | 2908 | $0.0826 | 0 | 0 | 0 |
| SAND-T1/Bram | player r20 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 44854 | 794 | $0.2402 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r20 | anthropic/claude-haiku-5.5 | 1 | 2445 | 0 | 0 | 80 | $0.0003 | 0 | 0 | 0 |
| SAND-T1 | relay r20 card | anthropic/claude-opus-5.5 | 1 | 2202 | 0 | 0 | 1129 | $0.0314 | 0 | 0 | 0 |
| SAND-T1/Bram | player r20 card 1 | anthropic/claude-opus-5.5 | 2 | 8 | 91387 | 1870 | 151 | $0.0307 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r20 card | anthropic/claude-haiku-5.5 | 2 | 1811 | 0 | 0 | 122 | $0.0002 | 0 | 0 | 0 |
| SAND-T1 | dm r20 onward | anthropic/claude-opus-5.5 | 4 | 14 | 366038 | 73486 | 8414 | $0.6090 | 0 | 0 | 0 |
| SAND-T1 | dm r20 onward | anthropic/claude-haiku-5.5 | 3 | 10447 | 0 | 0 | 1881 | $0.0020 | 0 | 0 | 0 |
| SAND-T1/Bram | player r21 | anthropic/claude-opus-5.5 | 1 | 4 | 46724 | 912 | 752 | $0.0290 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r21 | anthropic/claude-haiku-5.5 | 1 | 1822 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| SAND-T1 | dm r21 | anthropic/claude-opus-5.5 | 5 | 18 | 325231 | 253151 | 15564 | $1.6551 | 0 | 0 | 0 |
| SAND-T1 | dm r21 | anthropic/claude-haiku-5.5 | 2 | 6156 | 0 | 0 | 1111 | $0.0012 | 0 | 0 | 0 |
| SAND-T1 | relay r21 | anthropic/claude-opus-5.5 | 2 | 4083 | 0 | 0 | 2320 | $0.0627 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r21 | anthropic/claude-haiku-5.5 | 1 | 1781 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r22 | anthropic/claude-haiku-5.5 | 1 | 1280 | 0 | 0 | 60 | $0.0002 | 0 | 0 | 0 |
| SAND-T1 | dm r22 | anthropic/claude-opus-5.5 | 5 | 20 | 333366 | 253902 | 9467 | $1.5316 | 0 | 0 | 0 |
| SAND-T1 | dm r22 | anthropic/claude-haiku-5.5 | 3 | 6760 | 0 | 0 | 921 | $0.0011 | 0 | 0 | 0 |
| SAND-T1 | relay r22 | anthropic/claude-opus-5.5 | 2 | 3761 | 0 | 0 | 2133 | $0.0577 | 0 | 0 | 0 |
| SAND-T1/Bram | player r22 | anthropic/claude-opus-5.5 | 1 | 4 | 47636 | 1813 | 827 | $0.0351 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r22 | anthropic/claude-haiku-5.5 | 1 | 2089 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| SAND-T1/Bram | player r23 | anthropic/claude-opus-5.5 | 1 | 4 | 49449 | 1559 | 588 | $0.0295 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r23 | anthropic/claude-haiku-5.5 | 1 | 1743 | 0 | 0 | 79 | $0.0002 | 0 | 0 | 0 |
| SAND-T1 | dm r23 | anthropic/claude-opus-5.5 | 4 | 16 | 199787 | 256498 | 14048 | $1.6132 | 0 | 0 | 0 |
| SAND-T1 | dm r23 | anthropic/claude-haiku-5.5 | 2 | 6358 | 0 | 0 | 789 | $0.0010 | 0 | 0 | 0 |
| SAND-T1 | relay r23 | anthropic/claude-opus-5.5 | 2 | 3960 | 0 | 0 | 2416 | $0.0642 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r23 | anthropic/claude-haiku-5.5 | 1 | 1270 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r24 | anthropic/claude-haiku-5.5 | 1 | 1429 | 0 | 0 | 78 | $0.0002 | 0 | 0 | 0 |
| SAND-T1 | dm r24 | anthropic/claude-opus-5.5 | 3 | 12 | 184397 | 195459 | 13952 | $1.3029 | 0 | 0 | 0 |
| SAND-T1 | relay r24 card | anthropic/claude-opus-5.5 | 1 | 1505 | 0 | 0 | 762 | $0.0213 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r24 card | anthropic/claude-haiku-5.5 | 2 | 1658 | 0 | 0 | 114 | $0.0002 | 0 | 0 | 0 |
| SAND-T1 | dm r24 onward | anthropic/claude-opus-5.5 | 4 | 14 | 402340 | 78427 | 8601 | $0.6447 | 0 | 0 | 0 |
| SAND-T1 | dm r24 onward | anthropic/claude-haiku-5.5 | 3 | 10296 | 0 | 0 | 1328 | $0.0017 | 0 | 0 | 0 |
| SAND-T1 | relay r24 | anthropic/claude-opus-5.5 | 2 | 5982 | 0 | 0 | 3209 | $0.0881 | 0 | 0 | 0 |
| SAND-T1/Bram | player r24 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 52568 | 523 | $0.2733 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r24 | anthropic/claude-haiku-5.5 | 1 | 1939 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| SAND-T1 | dm r24 | anthropic/claude-haiku-5.5 | 1 | 3779 | 0 | 0 | 421 | $0.0006 | 0 | 0 | 0 |
| SAND-T1/Bram | player r25 | anthropic/claude-opus-5.5 | 1 | 4 | 52568 | 1946 | 651 | $0.0333 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram r25 | anthropic/claude-haiku-5.5 | 1 | 2235 | 0 | 0 | 83 | $0.0003 | 0 | 0 | 0 |
| SAND-T1 | dm r25 | anthropic/claude-opus-5.5 | 4 | 16 | 213072 | 260877 | 14234 | $1.6440 | 0 | 0 | 0 |
| SAND-T1 | dm r25 | anthropic/claude-haiku-5.5 | 2 | 6753 | 0 | 0 | 771 | $0.0011 | 0 | 0 | 0 |
| SAND-T1 | relay r25 | anthropic/claude-opus-5.5 | 2 | 4285 | 0 | 0 | 3158 | $0.0803 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa r25 | anthropic/claude-haiku-5.5 | 1 | 1450 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| SAND-T1/Bram | after 1 | anthropic/claude-opus-5.5 | 1 | 4 | 54514 | 2071 | 1236 | $0.0460 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram after 1 | anthropic/claude-haiku-5.5 | 1 | 1135 | 0 | 0 | 80 | $0.0002 | 0 | 0 | 0 |
| SAND-T1/Bram | after 2 | anthropic/claude-opus-5.5 | 1 | 4 | 56585 | 830 | 989 | $0.0353 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram after 2 | anthropic/claude-haiku-5.5 | 1 | 1094 | 0 | 0 | 70 | $0.0001 | 0 | 0 | 0 |
| SAND-T1/Bram | after 3 | anthropic/claude-opus-5.5 | 1 | 4 | 57415 | 776 | 836 | $0.0321 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Bram after 3 | anthropic/claude-haiku-5.5 | 1 | 886 | 0 | 0 | 63 | $0.0001 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa after 1 | anthropic/claude-haiku-5.5 | 1 | 767 | 0 | 0 | 69 | $0.0001 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa after 2 | anthropic/claude-haiku-5.5 | 1 | 587 | 0 | 0 | 65 | $0.0001 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Sefa after 3 | anthropic/claude-haiku-5.5 | 1 | 446 | 0 | 0 | 66 | $0.0001 | 0 | 0 | 0 |
| SAND-T1/Pell | after 1 | deepseek/deepseek-v4-pro-0813 | 1 | 14446 | 0 | 0 | 870 | $0.0210 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Pell after 1 | anthropic/claude-haiku-5.5 | 1 | 760 | 0 | 0 | 66 | $0.0001 | 0 | 0 | 0 |
| SAND-T1/Pell | after 2 | deepseek/deepseek-v4-pro-0813 | 1 | 429 | 14336 | 0 | 760 | $0.0040 | 0 | 0 | 0 |
| SAND-T1/check | check SAND-T1 Pell after 2 | anthropic/claude-haiku-5.5 | 1 | 584 | 0 | 0 | 75 | $0.0001 | 0 | 0 | 0 |
| SAND-T1/Pell | after 3 | deepseek/deepseek-v4-pro-0813 | 1 | 14962 | 0 | 0 | 698 | $0.0213 | 0 | 0 | 2 |
| SAND-T1/check | check SAND-T1 Pell after 3 | anthropic/claude-haiku-5.5 | 1 | 675 | 0 | 0 | 62 | $0.0001 | 0 | 0 | 0 |
| SAND-T2 | relay opening | anthropic/claude-opus-5.5 | 1 | 1092 | 0 | 0 | 1648 | $0.0373 | 0 | 0 | 0 |
| SAND-T2/Bram | player r1 | anthropic/claude-fable-5.1 | 1 | 4 | 0 | 10590 | 333 | $0.1491 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r1 | anthropic/claude-haiku-5.5 | 1 | 1678 | 0 | 0 | 61 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r1 | anthropic/claude-haiku-5.5 | 1 | 1767 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/Pell | player r1 | deepseek/deepseek-v4-pro-0813 | 1 | 7204 | 0 | 0 | 506 | $0.0107 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r1 | anthropic/claude-haiku-5.5 | 1 | 1602 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| SAND-T2 | dm r1 | anthropic/claude-opus-5.5 | 2 | 8 | 40315 | 42040 | 6715 | $0.3526 | 0 | 0 | 0 |
| SAND-T2 | dm r1 | anthropic/claude-haiku-5.5 | 1 | 2777 | 0 | 0 | 332 | $0.0004 | 0 | 0 | 0 |
| SAND-T2 | relay r1 | anthropic/claude-opus-5.5 | 1 | 1981 | 0 | 0 | 3896 | $0.0858 | 0 | 0 | 0 |
| SAND-T2/Bram | player r2 | anthropic/claude-fable-5.1 | 1 | 4 | 10590 | 1287 | 612 | $0.0494 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r2 | anthropic/claude-haiku-5.5 | 1 | 1834 | 0 | 0 | 79 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r2 | anthropic/claude-haiku-5.5 | 1 | 1621 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/Pell | player r2 | deepseek/deepseek-v4-pro-0813 | 1 | 1206 | 6912 | 0 | 1141 | $0.0052 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r2 | anthropic/claude-haiku-5.5 | 1 | 1733 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| SAND-T2 | dm r2 | anthropic/claude-opus-5.5 | 3 | 12 | 87430 | 60534 | 8742 | $0.4989 | 0 | 0 | 0 |
| SAND-T2 | dm r2 | anthropic/claude-haiku-5.5 | 2 | 5076 | 0 | 0 | 917 | $0.0010 | 0 | 0 | 0 |
| SAND-T2 | relay r2 | anthropic/claude-opus-5.5 | 1 | 2692 | 0 | 0 | 4057 | $0.0919 | 0 | 0 | 0 |
| SAND-T2/Bram | player r3 | anthropic/claude-fable-5.1 | 1 | 4 | 11877 | 1520 | 670 | $0.0555 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r3 | anthropic/claude-haiku-5.5 | 1 | 1922 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r3 | anthropic/claude-haiku-5.5 | 1 | 1620 | 0 | 0 | 62 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/Pell | player r3 | deepseek/deepseek-v4-pro-0813 | 1 | 1289 | 7936 | 0 | 1558 | $0.0065 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r3 | anthropic/claude-haiku-5.5 | 1 | 1726 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| SAND-T2 | dm r3 | anthropic/claude-opus-5.5 | 5 | 18 | 190160 | 63860 | 10269 | $0.5688 | 0 | 0 | 0 |
| SAND-T2 | dm r3 | anthropic/claude-haiku-5.5 | 2 | 6736 | 0 | 0 | 1770 | $0.0016 | 0 | 0 | 0 |
| SAND-T2 | relay r3 | anthropic/claude-opus-5.5 | 1 | 2795 | 0 | 0 | 4726 | $0.1057 | 0 | 0 | 0 |
| SAND-T2/Bram | player r4 | anthropic/claude-fable-5.1 | 1 | 4 | 13397 | 1786 | 804 | $0.0659 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r4 | anthropic/claude-haiku-5.5 | 1 | 2074 | 0 | 0 | 85 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r4 | anthropic/claude-haiku-5.5 | 1 | 1608 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/Pell | player r4 | deepseek/deepseek-v4-pro-0813 | 1 | 1170 | 8960 | 0 | 677 | $0.0042 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r4 | anthropic/claude-haiku-5.5 | 1 | 1534 | 0 | 0 | 61 | $0.0002 | 0 | 0 | 0 |
| SAND-T2 | dm r4 | anthropic/claude-opus-5.5 | 2 | 8 | 43628 | 57601 | 10806 | $0.5192 | 0 | 0 | 0 |
| SAND-T2 | dm r4 | anthropic/claude-haiku-5.5 | 1 | 3850 | 0 | 0 | 481 | $0.0006 | 0 | 0 | 0 |
| SAND-T2 | relay r4 | anthropic/claude-opus-5.5 | 1 | 3105 | 0 | 0 | 6004 | $0.1325 | 0 | 0 | 0 |
| SAND-T2/Bram | player r5 | anthropic/claude-fable-5.1 | 1 | 4 | 15183 | 2016 | 690 | $0.0635 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r5 | anthropic/claude-haiku-5.5 | 1 | 2327 | 0 | 0 | 77 | $0.0003 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r5 | anthropic/claude-haiku-5.5 | 1 | 2038 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/Pell | player r5 | deepseek/deepseek-v4-pro-0813 | 1 | 1385 | 9984 | 0 | 795 | $0.0049 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r5 | anthropic/claude-haiku-5.5 | 1 | 2074 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| SAND-T2 | dm r5 | anthropic/claude-opus-5.5 | 3 | 12 | 102323 | 71451 | 12467 | $0.6344 | 0 | 0 | 0 |
| SAND-T2 | dm r5 | anthropic/claude-haiku-5.5 | 2 | 6507 | 0 | 0 | 577 | $0.0009 | 0 | 0 | 0 |
| SAND-T2 | relay r5 | anthropic/claude-opus-5.5 | 1 | 3294 | 0 | 0 | 5037 | $0.1139 | 0 | 0 | 0 |
| SAND-T2/Bram | player r6 | anthropic/claude-fable-5.1 | 1 | 4 | 17199 | 1567 | 696 | $0.0587 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r6 | anthropic/claude-haiku-5.5 | 1 | 1903 | 0 | 0 | 77 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r6 | anthropic/claude-haiku-5.5 | 1 | 1900 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| SAND-T2 | dm r6 | anthropic/claude-opus-5.5 | 2 | 8 | 56196 | 65888 | 6051 | $0.4767 | 0 | 0 | 0 |
| SAND-T2 | relay r6 card | anthropic/claude-opus-5.5 | 2 | 3516 | 0 | 0 | 2232 | $0.0587 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r6 card | anthropic/claude-haiku-5.5 | 2 | 2519 | 0 | 0 | 120 | $0.0003 | 0 | 0 | 0 |
| SAND-T2 | dm r6 onward | anthropic/claude-opus-5.5 | 5 | 16 | 228530 | 72594 | 10007 | $0.6089 | 0 | 0 | 0 |
| SAND-T2 | dm r6 onward | anthropic/claude-haiku-5.5 | 4 | 9751 | 0 | 0 | 979 | $0.0015 | 0 | 0 | 0 |
| SAND-T2 | relay r6 | anthropic/claude-opus-5.5 | 2 | 6336 | 0 | 0 | 3199 | $0.0893 | 0 | 0 | 0 |
| SAND-T2/Pell | player r6 | deepseek/deepseek-v4-pro-0813 | 1 | 1262 | 11264 | 0 | 297 | $0.0035 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r6 | anthropic/claude-haiku-5.5 | 1 | 1836 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/Pell | player r6 card 1 | deepseek/deepseek-v4-pro-0813 | 2 | 798 | 24832 | 0 | 223 | $0.0041 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r6 card | anthropic/claude-haiku-5.5 | 2 | 1062 | 0 | 0 | 112 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/Bram | player r7 | anthropic/claude-fable-5.1 | 1 | 4 | 18766 | 1930 | 711 | $0.0644 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r7 | anthropic/claude-haiku-5.5 | 1 | 2279 | 0 | 0 | 77 | $0.0003 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r7 | anthropic/claude-haiku-5.5 | 1 | 1022 | 0 | 0 | 74 | $0.0001 | 0 | 0 | 0 |
| SAND-T2 | dm r7 | anthropic/claude-opus-5.5 | 2 | 8 | 64528 | 69863 | 3474 | $0.4410 | 0 | 0 | 0 |
| SAND-T2 | relay r7 card | anthropic/claude-opus-5.5 | 2 | 3191 | 0 | 0 | 1786 | $0.0485 | 0 | 0 | 0 |
| SAND-T2/Bram | player r7 card 1 | anthropic/claude-fable-5.1 | 2 | 8 | 42869 | 1708 | 80 | $0.0361 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r7 card | anthropic/claude-haiku-5.5 | 2 | 1726 | 0 | 0 | 111 | $0.0002 | 0 | 0 | 0 |
| SAND-T2 | dm r7 onward | anthropic/claude-opus-5.5 | 5 | 16 | 247164 | 76323 | 9528 | $0.6217 | 0 | 0 | 0 |
| SAND-T2 | dm r7 onward | anthropic/claude-haiku-5.5 | 4 | 10369 | 0 | 0 | 944 | $0.0015 | 0 | 0 | 0 |
| SAND-T2 | relay r7 | anthropic/claude-opus-5.5 | 2 | 5843 | 0 | 0 | 4087 | $0.1051 | 0 | 0 | 0 |
| SAND-T2/Pell | player r7 | deepseek/deepseek-v4-pro-0813 | 1 | 605 | 12800 | 0 | 525 | $0.0034 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r7 | anthropic/claude-haiku-5.5 | 1 | 1269 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/Pell | player r7 card 1 | deepseek/deepseek-v4-pro-0813 | 2 | 14223 | 13568 | 0 | 396 | $0.0209 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r7 card | anthropic/claude-haiku-5.5 | 3 | 2490 | 0 | 0 | 191 | $0.0003 | 0 | 0 | 0 |
| SAND-T2 | dm r7 card prose | anthropic/claude-opus-5.5 | 1 | 18844 | 0 | 34073 | 1458 | $0.3771 | 0 | 0 | 0 |
| SAND-T2/Pell | player r7 card 2 | deepseek/deepseek-v4-pro-0813 | 1 | 827 | 13824 | 0 | 107 | $0.0027 | 0 | 0 | 0 |
| SAND-T2/Bram | player r8 | anthropic/claude-fable-5.1 | 1 | 4 | 22404 | 706 | 919 | $0.0604 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r8 | anthropic/claude-haiku-5.5 | 1 | 1714 | 0 | 0 | 81 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r8 | anthropic/claude-haiku-5.5 | 1 | 1935 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/Pell | player r8 | deepseek/deepseek-v4-pro-0813 | 1 | 1009 | 14336 | 0 | 294 | $0.0035 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r8 | anthropic/claude-haiku-5.5 | 1 | 1546 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| SAND-T2 | dm r8 | anthropic/claude-opus-5.5 | 3 | 12 | 127976 | 66589 | 14632 | $0.6557 | 0 | 0 | 0 |
| SAND-T2 | dm r8 | anthropic/claude-haiku-5.5 | 2 | 7940 | 0 | 0 | 955 | $0.0013 | 0 | 0 | 0 |
| SAND-T2 | relay r8 | anthropic/claude-opus-5.5 | 1 | 4367 | 0 | 0 | 6023 | $0.1379 | 0 | 0 | 0 |
| SAND-T2/Bram | player r9 | anthropic/claude-fable-5.1 | 1 | 4 | 23110 | 2407 | 605 | $0.0662 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r9 | anthropic/claude-haiku-5.5 | 1 | 2575 | 0 | 0 | 72 | $0.0003 | 0 | 0 | 0 |
| SAND-T2/Pell | player r9 | deepseek/deepseek-v4-pro-0813 | 1 | 1711 | 15104 | 0 | 382 | $0.0047 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r9 | anthropic/claude-haiku-5.5 | 1 | 2306 | 0 | 0 | 63 | $0.0003 | 0 | 0 | 0 |
| SAND-T2 | dm r9 | anthropic/claude-opus-5.5 | 5 | 20 | 193679 | 150672 | 11865 | $1.0459 | 0 | 0 | 0 |
| SAND-T2 | dm r9 | anthropic/claude-haiku-5.5 | 3 | 7504 | 0 | 0 | 1162 | $0.0013 | 0 | 0 | 0 |
| SAND-T2 | relay r9 | anthropic/claude-opus-5.5 | 2 | 4113 | 0 | 0 | 3162 | $0.0797 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r9 | anthropic/claude-haiku-5.5 | 1 | 1942 | 0 | 0 | 81 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/Bram | player r10 | anthropic/claude-fable-5.1 | 1 | 4 | 25517 | 1222 | 603 | $0.0518 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r10 | anthropic/claude-haiku-5.5 | 1 | 1519 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/Pell | player r10 | deepseek/deepseek-v4-pro-0813 | 1 | 1085 | 16640 | 0 | 1807 | $0.0078 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r10 | anthropic/claude-haiku-5.5 | 1 | 1720 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| SAND-T2 | dm r10 | anthropic/claude-opus-5.5 | 5 | 20 | 207360 | 157889 | 12457 | $1.0896 | 0 | 0 | 0 |
| SAND-T2 | dm r10 | anthropic/claude-haiku-5.5 | 3 | 8148 | 0 | 0 | 1414 | $0.0015 | 0 | 0 | 0 |
| SAND-T2 | relay r10 | anthropic/claude-opus-5.5 | 2 | 4436 | 0 | 0 | 4080 | $0.0993 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r10 | anthropic/claude-haiku-5.5 | 1 | 1376 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/Bram | player r11 | anthropic/claude-fable-5.1 | 1 | 4 | 26739 | 1585 | 516 | $0.0523 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r11 | anthropic/claude-haiku-5.5 | 1 | 1819 | 0 | 0 | 76 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r11 | anthropic/claude-haiku-5.5 | 1 | 1089 | 0 | 0 | 66 | $0.0001 | 0 | 0 | 0 |
| SAND-T2/Pell | player r11 | deepseek/deepseek-v4-pro-0813 | 1 | 1562 | 17408 | 0 | 362 | $0.0047 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r11 | anthropic/claude-haiku-5.5 | 1 | 1923 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| SAND-T2 | dm r11 | anthropic/claude-opus-5.5 | 3 | 12 | 150850 | 81734 | 4382 | $0.5299 | 0 | 0 | 0 |
| SAND-T2 | dm r11 | anthropic/claude-haiku-5.5 | 2 | 4525 | 0 | 0 | 557 | $0.0007 | 0 | 0 | 0 |
| SAND-T2 | relay r11 | anthropic/claude-opus-5.5 | 1 | 2387 | 0 | 0 | 2987 | $0.0693 | 0 | 0 | 0 |
| SAND-T2/Bram | player r12 | anthropic/claude-fable-5.1 | 1 | 4 | 28324 | 1164 | 327 | $0.0380 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r12 | anthropic/claude-haiku-5.5 | 1 | 1304 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r12 | anthropic/claude-haiku-5.5 | 1 | 1134 | 0 | 0 | 74 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/Pell | player r12 | deepseek/deepseek-v4-pro-0813 | 1 | 1038 | 18688 | 0 | 812 | $0.0053 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r12 | anthropic/claude-haiku-5.5 | 1 | 1835 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| SAND-T2 | dm r12 | anthropic/claude-opus-5.5 | 3 | 12 | 129721 | 84522 | 6118 | $0.5761 | 0 | 0 | 0 |
| SAND-T2 | dm r12 | anthropic/claude-haiku-5.5 | 2 | 6466 | 0 | 0 | 1373 | $0.0013 | 0 | 0 | 0 |
| SAND-T2 | relay r12 | anthropic/claude-opus-5.5 | 1 | 3157 | 0 | 0 | 2619 | $0.0650 | 0 | 0 | 0 |
| SAND-T2/Bram | player r13 | anthropic/claude-fable-5.1 | 2 | 8 | 59651 | 1459 | 888 | $0.0776 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r13 | anthropic/claude-haiku-5.5 | 2 | 1977 | 0 | 0 | 144 | $0.0003 | 0 | 0 | 0 |
| SAND-T2 | dm r13 ooc Bram | anthropic/claude-opus-5.5 | 1 | 22228 | 34073 | 15405 | 878 | $0.2365 | 0 | 0 | 0 |
| SAND-T2/Pell | player r13 | deepseek/deepseek-v4-pro-0813 | 1 | 1254 | 19456 | 0 | 424 | $0.0047 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r13 | anthropic/claude-haiku-5.5 | 1 | 1236 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| SAND-T2 | dm r13 | anthropic/claude-opus-5.5 | 8 | 28 | 483283 | 164773 | 9717 | $1.1278 | 0 | 0 | 0 |
| SAND-T2 | dm r13 | anthropic/claude-haiku-5.5 | 4 | 9974 | 0 | 0 | 1844 | $0.0019 | 0 | 0 | 0 |
| SAND-T2 | relay r13 | anthropic/claude-opus-5.5 | 2 | 3673 | 0 | 0 | 3130 | $0.0773 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r13 | anthropic/claude-haiku-5.5 | 2 | 1741 | 0 | 0 | 131 | $0.0002 | 0 | 0 | 0 |
| SAND-T2 | dm r13 ooc Sefa | anthropic/claude-opus-5.5 | 1 | 22548 | 49478 | 1783 | 871 | $0.1318 | 0 | 0 | 0 |
| SAND-T2/Bram | player r14 | anthropic/claude-fable-5.1 | 1 | 4 | 30947 | 874 | 228 | $0.0301 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r14 | anthropic/claude-haiku-5.5 | 1 | 1170 | 0 | 0 | 71 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/Pell | player r14 | deepseek/deepseek-v4-pro-0813 | 1 | 1363 | 20480 | 0 | 561 | $0.0053 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r14 | anthropic/claude-haiku-5.5 | 1 | 1933 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| SAND-T2 | dm r14 | anthropic/claude-opus-5.5 | 4 | 16 | 225282 | 125923 | 10086 | $0.8835 | 0 | 0 | 0 |
| SAND-T2 | dm r14 | anthropic/claude-haiku-5.5 | 2 | 5464 | 0 | 0 | 530 | $0.0008 | 0 | 0 | 0 |
| SAND-T2 | relay r14 | anthropic/claude-opus-5.5 | 2 | 3759 | 0 | 0 | 3289 | $0.0808 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r14 | anthropic/claude-haiku-5.5 | 1 | 860 | 0 | 0 | 56 | $0.0001 | 0 | 0 | 0 |
| SAND-T2 | relay r14 card | anthropic/claude-opus-5.5 | 1 | 795 | 0 | 0 | 146 | $0.0061 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r14 card | anthropic/claude-haiku-5.5 | 4 | 2050 | 0 | 0 | 239 | $0.0003 | 0 | 0 | 0 |
| SAND-T2 | dm r14 onward | anthropic/claude-opus-5.5 | 3 | 10 | 215536 | 45133 | 2084 | $0.3105 | 0 | 0 | 0 |
| SAND-T2 | dm r14 onward | anthropic/claude-haiku-5.5 | 2 | 3230 | 0 | 0 | 573 | $0.0006 | 0 | 0 | 0 |
| SAND-T2/Bram | player r15 | anthropic/claude-fable-5.1 | 1 | 4 | 31821 | 802 | 632 | $0.0496 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r15 | anthropic/claude-haiku-5.5 | 1 | 1403 | 0 | 0 | 71 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/Pell | player r15 | deepseek/deepseek-v4-pro-0813 | 1 | 966 | 21760 | 0 | 430 | $0.0045 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r15 | anthropic/claude-haiku-5.5 | 1 | 1563 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| SAND-T2 | dm r15 | anthropic/claude-opus-5.5 | 5 | 16 | 329909 | 137027 | 5297 | $0.8664 | 0 | 0 | 0 |
| SAND-T2 | relay r15 card | anthropic/claude-opus-5.5 | 1 | 1792 | 0 | 0 | 928 | $0.0257 | 0 | 0 | 0 |
| SAND-T2/Pell | player r15 card 1 | deepseek/deepseek-v4-pro-0813 | 4 | 1892 | 93952 | 0 | 1388 | $0.0155 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r15 card | anthropic/claude-haiku-5.5 | 7 | 7315 | 0 | 0 | 636 | $0.0010 | 0 | 0 | 0 |
| SAND-T2 | dm r15 card prose | anthropic/claude-opus-5.5 | 3 | 72849 | 159839 | 3028 | 4653 | $0.4406 | 0 | 0 | 0 |
| SAND-T2/Pell | player r15 card 2 | deepseek/deepseek-v4-pro-0813 | 2 | 2179 | 47616 | 0 | 896 | $0.0099 | 0 | 0 | 0 |
| SAND-T2/Pell | player r15 card 3 | deepseek/deepseek-v4-pro-0813 | 1 | 1163 | 25344 | 0 | 598 | $0.0056 | 0 | 0 | 0 |
| SAND-T2 | dm r15 onward | anthropic/claude-opus-5.5 | 3 | 10 | 226450 | 45103 | 7015 | $0.4111 | 0 | 0 | 0 |
| SAND-T2 | dm r15 onward | anthropic/claude-haiku-5.5 | 2 | 6281 | 0 | 0 | 725 | $0.0010 | 0 | 0 | 0 |
| SAND-T2 | relay r15 | anthropic/claude-opus-5.5 | 2 | 4597 | 0 | 0 | 3106 | $0.0805 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r15 | anthropic/claude-haiku-5.5 | 1 | 769 | 0 | 0 | 61 | $0.0001 | 0 | 0 | 0 |
| SAND-T2 | dm r15 | anthropic/claude-haiku-5.5 | 2 | 3217 | 0 | 0 | 432 | $0.0005 | 0 | 0 | 0 |
| SAND-T2/Bram | player r16 | anthropic/claude-fable-5.1 | 1 | 4 | 0 | 34323 | 673 | $0.4627 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r16 | anthropic/claude-haiku-5.5 | 1 | 2174 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/Pell | player r16 | deepseek/deepseek-v4-pro-0813 | 1 | 849 | 26368 | 0 | 492 | $0.0050 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r16 | anthropic/claude-haiku-5.5 | 1 | 1625 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| SAND-T2 | dm r16 | anthropic/claude-opus-5.5 | 5 | 18 | 269186 | 191863 | 11755 | $1.2576 | 0 | 0 | 0 |
| SAND-T2 | dm r16 | anthropic/claude-haiku-5.5 | 3 | 8950 | 0 | 0 | 848 | $0.0013 | 0 | 0 | 0 |
| SAND-T2 | relay r16 | anthropic/claude-opus-5.5 | 2 | 4228 | 0 | 0 | 4960 | $0.1161 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r16 | anthropic/claude-haiku-5.5 | 1 | 481 | 0 | 0 | 62 | $0.0001 | 0 | 0 | 0 |
| SAND-T2/Bram | player r17 | anthropic/claude-fable-5.1 | 1 | 4 | 34323 | 2244 | 1160 | $0.0947 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r17 | anthropic/claude-haiku-5.5 | 1 | 2792 | 0 | 0 | 76 | $0.0003 | 0 | 0 | 0 |
| SAND-T2/Pell | player r17 | deepseek/deepseek-v4-pro-0813 | 1 | 1736 | 27136 | 0 | 727 | $0.0069 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r17 | anthropic/claude-haiku-5.5 | 1 | 2640 | 0 | 0 | 75 | $0.0003 | 0 | 0 | 0 |
| SAND-T2 | dm r17 | anthropic/claude-opus-5.5 | 6 | 24 | 343684 | 196998 | 12954 | $1.3242 | 0 | 0 | 0 |
| SAND-T2 | dm r17 | anthropic/claude-haiku-5.5 | 4 | 14439 | 0 | 0 | 1341 | $0.0021 | 0 | 0 | 0 |
| SAND-T2 | relay r17 | anthropic/claude-opus-5.5 | 2 | 5055 | 0 | 0 | 5297 | $0.1262 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r17 | anthropic/claude-haiku-5.5 | 1 | 681 | 0 | 0 | 59 | $0.0001 | 0 | 0 | 0 |
| SAND-T2/Bram | player r18 | anthropic/claude-fable-5.1 | 1 | 4 | 36567 | 2495 | 914 | $0.0861 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r18 | anthropic/claude-haiku-5.5 | 1 | 2728 | 0 | 0 | 77 | $0.0003 | 0 | 0 | 0 |
| SAND-T2/Pell | player r18 | deepseek/deepseek-v4-pro-0813 | 1 | 1989 | 28672 | 0 | 853 | $0.0077 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r18 | anthropic/claude-haiku-5.5 | 1 | 2595 | 0 | 0 | 56 | $0.0003 | 0 | 0 | 0 |
| SAND-T2 | dm r18 | anthropic/claude-opus-5.5 | 5 | 20 | 292352 | 200360 | 12388 | $1.3185 | 0 | 0 | 0 |
| SAND-T2 | dm r18 | anthropic/claude-haiku-5.5 | 3 | 9677 | 0 | 0 | 824 | $0.0014 | 0 | 0 | 0 |
| SAND-T2 | relay r18 | anthropic/claude-opus-5.5 | 2 | 4904 | 0 | 0 | 4833 | $0.1163 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r18 | anthropic/claude-haiku-5.5 | 1 | 745 | 0 | 0 | 57 | $0.0001 | 0 | 0 | 0 |
| SAND-T2/Bram | player r19 | anthropic/claude-fable-5.1 | 1 | 4 | 39062 | 2091 | 724 | $0.0721 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r19 | anthropic/claude-haiku-5.5 | 1 | 2201 | 0 | 0 | 66 | $0.0003 | 0 | 0 | 0 |
| SAND-T2/Pell | player r19 | deepseek/deepseek-v4-pro-0813 | 1 | 1778 | 30464 | 0 | 318 | $0.0062 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r19 | anthropic/claude-haiku-5.5 | 1 | 2512 | 0 | 0 | 70 | $0.0003 | 0 | 0 | 0 |
| SAND-T2 | dm r19 | anthropic/claude-opus-5.5 | 5 | 20 | 308936 | 195133 | 10950 | $1.2659 | 0 | 0 | 0 |
| SAND-T2 | dm r19 | anthropic/claude-haiku-5.5 | 3 | 8979 | 0 | 0 | 1116 | $0.0015 | 0 | 0 | 0 |
| SAND-T2 | relay r19 | anthropic/claude-opus-5.5 | 2 | 4438 | 0 | 0 | 4179 | $0.1013 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r19 | anthropic/claude-haiku-5.5 | 1 | 1035 | 0 | 0 | 64 | $0.0001 | 0 | 0 | 0 |
| SAND-T2/Bram | player r20 | anthropic/claude-fable-5.1 | 1 | 4 | 41153 | 1933 | 791 | $0.0740 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r20 | anthropic/claude-haiku-5.5 | 1 | 2377 | 0 | 0 | 70 | $0.0003 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r20 | anthropic/claude-haiku-5.5 | 1 | 802 | 0 | 0 | 56 | $0.0001 | 0 | 0 | 0 |
| SAND-T2 | dm r20 | anthropic/claude-opus-5.5 | 6 | 24 | 392559 | 201841 | 11070 | $1.3170 | 0 | 0 | 0 |
| SAND-T2 | dm r20 | anthropic/claude-haiku-5.5 | 4 | 10729 | 0 | 0 | 1570 | $0.0019 | 0 | 0 | 0 |
| SAND-T2 | relay r20 | anthropic/claude-opus-5.5 | 2 | 4176 | 0 | 0 | 2623 | $0.0692 | 0 | 0 | 0 |
| SAND-T2/Pell | player r20 | deepseek/deepseek-v4-pro-0813 | 1 | 1221 | 32000 | 0 | 389 | $0.0058 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r20 | anthropic/claude-haiku-5.5 | 1 | 1698 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/Bram | player r21 | anthropic/claude-fable-5.1 | 1 | 4 | 43086 | 1166 | 324 | $0.0416 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r21 | anthropic/claude-haiku-5.5 | 1 | 1052 | 0 | 0 | 75 | $0.0001 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r21 | anthropic/claude-haiku-5.5 | 1 | 1359 | 0 | 0 | 62 | $0.0002 | 0 | 0 | 0 |
| SAND-T2 | dm r21 | anthropic/claude-opus-5.5 | 6 | 24 | 446113 | 200306 | 9527 | $1.2888 | 0 | 0 | 0 |
| SAND-T2 | dm r21 | anthropic/claude-haiku-5.5 | 4 | 9310 | 0 | 0 | 1318 | $0.0016 | 0 | 0 | 0 |
| SAND-T2 | relay r21 | anthropic/claude-opus-5.5 | 2 | 4048 | 0 | 0 | 2330 | $0.0628 | 0 | 0 | 0 |
| SAND-T2/Pell | player r21 | deepseek/deepseek-v4-pro-0813 | 1 | 845 | 33024 | 0 | 426 | $0.0055 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r21 | anthropic/claude-haiku-5.5 | 1 | 1286 | 0 | 0 | 71 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/Bram | player r22 | anthropic/claude-fable-5.1 | 1 | 4 | 44252 | 687 | 542 | $0.0468 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r22 | anthropic/claude-haiku-5.5 | 1 | 1243 | 0 | 0 | 74 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r22 | anthropic/claude-haiku-5.5 | 1 | 681 | 0 | 0 | 57 | $0.0001 | 0 | 0 | 0 |
| SAND-T2 | dm r22 | anthropic/claude-opus-5.5 | 5 | 20 | 277686 | 213816 | 12359 | $1.3823 | 0 | 0 | 0 |
| SAND-T2 | dm r22 | anthropic/claude-haiku-5.5 | 3 | 10089 | 0 | 0 | 2256 | $0.0021 | 0 | 0 | 0 |
| SAND-T2 | relay r22 | anthropic/claude-opus-5.5 | 2 | 4512 | 0 | 0 | 3391 | $0.0859 | 0 | 0 | 0 |
| SAND-T2/Pell | player r22 | deepseek/deepseek-v4-pro-0813 | 1 | 867 | 33792 | 0 | 330 | $0.0054 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r22 | anthropic/claude-haiku-5.5 | 1 | 1519 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/Bram | player r23 | anthropic/claude-fable-5.1 | 1 | 4 | 44939 | 1397 | 445 | $0.0510 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r23 | anthropic/claude-haiku-5.5 | 1 | 1597 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| SAND-T2 | dm r23 | anthropic/claude-opus-5.5 | 10 | 38 | 679763 | 338030 | 18596 | $2.2113 | 0 | 0 | 0 |
| SAND-T2 | dm r23 | anthropic/claude-haiku-5.5 | 6 | 19422 | 0 | 0 | 3541 | $0.0037 | 0 | 0 | 0 |
| SAND-T2 | relay r23 | anthropic/claude-opus-5.5 | 3 | 6058 | 0 | 0 | 4041 | $0.1051 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r23 | anthropic/claude-haiku-5.5 | 1 | 1325 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/Pell | player r23 | deepseek/deepseek-v4-pro-0813 | 1 | 931 | 34560 | 0 | 590 | $0.0062 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r23 | anthropic/claude-haiku-5.5 | 1 | 1405 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/Bram | player r24 | anthropic/claude-fable-5.1 | 1 | 4 | 0 | 47403 | 441 | $0.6146 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r24 | anthropic/claude-haiku-5.5 | 1 | 1391 | 0 | 0 | 71 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/Pell | player r24 | deepseek/deepseek-v4-pro-0813 | 1 | 879 | 35328 | 0 | 483 | $0.0059 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r24 | anthropic/claude-haiku-5.5 | 1 | 1510 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| SAND-T2 | dm r24 | anthropic/claude-opus-5.5 | 5 | 20 | 357277 | 223441 | 18590 | $1.5726 | 0 | 0 | 0 |
| SAND-T2 | dm r24 | anthropic/claude-haiku-5.5 | 4 | 12262 | 0 | 0 | 1539 | $0.0020 | 0 | 0 | 0 |
| SAND-T2 | relay r24 | anthropic/claude-opus-5.5 | 2 | 5344 | 0 | 0 | 5732 | $0.1360 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r24 | anthropic/claude-haiku-5.5 | 1 | 2077 | 0 | 0 | 59 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/Bram | player r25 | anthropic/claude-fable-5.1 | 1 | 4 | 47403 | 2327 | 473 | $0.0646 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram r25 | anthropic/claude-haiku-5.5 | 1 | 2541 | 0 | 0 | 71 | $0.0003 | 0 | 0 | 0 |
| SAND-T2/Pell | player r25 | deepseek/deepseek-v4-pro-0813 | 1 | 1489 | 36096 | 0 | 375 | $0.0065 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell r25 | anthropic/claude-haiku-5.5 | 1 | 2169 | 0 | 0 | 68 | $0.0003 | 0 | 0 | 0 |
| SAND-T2 | dm r25 | anthropic/claude-opus-5.5 | 4 | 16 | 219685 | 225520 | 15316 | $1.4859 | 0 | 0 | 0 |
| SAND-T2 | dm r25 | anthropic/claude-haiku-5.5 | 2 | 6468 | 0 | 0 | 576 | $0.0009 | 0 | 0 | 0 |
| SAND-T2 | relay r25 | anthropic/claude-opus-5.5 | 2 | 4046 | 0 | 0 | 3676 | $0.0897 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa r25 | anthropic/claude-haiku-5.5 | 1 | 1479 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| SAND-T2/Bram | after 1 | anthropic/claude-fable-5.1 | 1 | 4 | 49730 | 1240 | 680 | $0.0620 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram after 1 | anthropic/claude-haiku-5.5 | 1 | 935 | 0 | 0 | 62 | $0.0001 | 0 | 0 | 0 |
| SAND-T2/Bram | after 2 | anthropic/claude-fable-5.1 | 1 | 4 | 50970 | 630 | 671 | $0.0542 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram after 2 | anthropic/claude-haiku-5.5 | 1 | 951 | 0 | 0 | 70 | $0.0001 | 0 | 0 | 0 |
| SAND-T2/Bram | after 3 | anthropic/claude-fable-5.1 | 1 | 4 | 51600 | 633 | 1468 | $0.0943 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Bram after 3 | anthropic/claude-haiku-5.5 | 1 | 1112 | 0 | 0 | 62 | $0.0001 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa after 1 | anthropic/claude-haiku-5.5 | 1 | 665 | 0 | 0 | 70 | $0.0001 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa after 2 | anthropic/claude-haiku-5.5 | 1 | 567 | 0 | 0 | 68 | $0.0001 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Sefa after 3 | anthropic/claude-haiku-5.5 | 1 | 444 | 0 | 0 | 55 | $0.0001 | 0 | 0 | 0 |
| SAND-T2/Pell | after 1 | deepseek/deepseek-v4-pro-0813 | 1 | 1293 | 37376 | 0 | 596 | $0.0070 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell after 1 | anthropic/claude-haiku-5.5 | 1 | 786 | 0 | 0 | 91 | $0.0001 | 0 | 0 | 0 |
| SAND-T2/Pell | after 2 | deepseek/deepseek-v4-pro-0813 | 1 | 622 | 38400 | 0 | 677 | $0.0064 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell after 2 | anthropic/claude-haiku-5.5 | 1 | 893 | 0 | 0 | 65 | $0.0001 | 0 | 0 | 0 |
| SAND-T2/Pell | after 3 | deepseek/deepseek-v4-pro-0813 | 1 | 544 | 38912 | 0 | 692 | $0.0064 | 0 | 0 | 0 |
| SAND-T2/check | check SAND-T2 Pell after 3 | anthropic/claude-haiku-5.5 | 1 | 826 | 0 | 0 | 65 | $0.0001 | 0 | 0 | 0 |
| GOAL-T1 | relay opening | anthropic/claude-opus-5.5 | 1 | 1005 | 0 | 0 | 1291 | $0.0298 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram r1 | anthropic/claude-haiku-5.5 | 1 | 1461 | 0 | 0 | 49 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r1 | deepseek/deepseek-v4-pro-0813 | 1 | 7428 | 0 | 0 | 352 | $0.0106 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r1 | anthropic/claude-haiku-5.5 | 1 | 1637 | 0 | 0 | 56 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r1 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 10720 | 349 | $0.0606 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r1 | anthropic/claude-haiku-5.5 | 1 | 1645 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1 | dm r1 | anthropic/claude-opus-5.5 | 2 | 8 | 21377 | 71137 | 9684 | $0.6100 | 0 | 0 | 0 |
| GOAL-T1 | dm r1 | anthropic/claude-haiku-5.5 | 1 | 3323 | 0 | 0 | 487 | $0.0006 | 0 | 0 | 0 |
| GOAL-T1 | relay r1 | anthropic/claude-opus-5.5 | 1 | 2193 | 0 | 0 | 4035 | $0.0895 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram r2 | anthropic/claude-haiku-5.5 | 1 | 1678 | 0 | 0 | 77 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r2 | deepseek/deepseek-v4-pro-0813 | 1 | 1094 | 7168 | 0 | 1155 | $0.0051 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r2 | anthropic/claude-haiku-5.5 | 1 | 1697 | 0 | 0 | 77 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r2 | anthropic/claude-opus-5.5 | 1 | 4 | 10720 | 1434 | 767 | $0.0247 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r2 | anthropic/claude-haiku-5.5 | 1 | 2006 | 0 | 0 | 85 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1 | dm r2 | anthropic/claude-opus-5.5 | 1 | 4 | 18787 | 30347 | 12161 | $0.4033 | 0 | 0 | 0 |
| GOAL-T1 | relay r2 card | anthropic/claude-opus-5.5 | 1 | 2723 | 0 | 0 | 1776 | $0.0464 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r2 card 1 | anthropic/claude-opus-5.5 | 2 | 8 | 26468 | 2546 | 490 | $0.0279 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r2 card | anthropic/claude-haiku-5.5 | 2 | 2713 | 0 | 0 | 118 | $0.0003 | 0 | 0 | 0 |
| GOAL-T1 | dm r2 card prose (with a press) | anthropic/claude-opus-5.5 | 2 | 32631 | 19506 | 19506 | 1358 | $0.3176 | 0 | 0 | 0 |
| GOAL-T1 | dm r2 onward | anthropic/claude-opus-5.5 | 4 | 14 | 185060 | 50740 | 6250 | $0.4158 | 0 | 0 | 0 |
| GOAL-T1 | dm r2 onward | anthropic/claude-haiku-5.5 | 3 | 11205 | 0 | 0 | 1739 | $0.0020 | 0 | 0 | 0 |
| GOAL-T1 | relay r2 | anthropic/claude-opus-5.5 | 1 | 4796 | 0 | 0 | 5061 | $0.1204 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram r3 | anthropic/claude-haiku-5.5 | 1 | 2558 | 0 | 0 | 63 | $0.0003 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r3 | deepseek/deepseek-v4-pro-0813 | 1 | 1665 | 8192 | 0 | 1645 | $0.0073 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r3 | anthropic/claude-haiku-5.5 | 1 | 2505 | 0 | 0 | 64 | $0.0003 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r3 | anthropic/claude-opus-5.5 | 1 | 4 | 14700 | 436 | 859 | $0.0223 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r3 | anthropic/claude-haiku-5.5 | 1 | 1395 | 0 | 0 | 71 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1 | dm r3 | anthropic/claude-opus-5.5 | 3 | 12 | 96500 | 74918 | 10080 | $0.6032 | 0 | 0 | 0 |
| GOAL-T1 | dm r3 | anthropic/claude-haiku-5.5 | 2 | 6118 | 0 | 0 | 922 | $0.0011 | 0 | 0 | 0 |
| GOAL-T1 | relay r3 | anthropic/claude-opus-5.5 | 1 | 3325 | 0 | 0 | 6503 | $0.1434 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram r4 | anthropic/claude-haiku-5.5 | 1 | 2719 | 0 | 0 | 72 | $0.0003 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r4 | deepseek/deepseek-v4-pro-0813 | 1 | 1802 | 9728 | 0 | 1339 | $0.0068 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r4 | anthropic/claude-haiku-5.5 | 1 | 2843 | 0 | 0 | 68 | $0.0003 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r4 | anthropic/claude-opus-5.5 | 1 | 4 | 15136 | 2364 | 876 | $0.0324 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r4 | anthropic/claude-haiku-5.5 | 1 | 2608 | 0 | 0 | 57 | $0.0003 | 0 | 0 | 0 |
| GOAL-T1 | dm r4 | anthropic/claude-opus-5.5 | 1 | 4 | 22850 | 31804 | 4003 | $0.2516 | 0 | 0 | 0 |
| GOAL-T1 | relay r4 card | anthropic/claude-opus-5.5 | 1 | 2808 | 0 | 0 | 1960 | $0.0504 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r4 card 1 | anthropic/claude-opus-5.5 | 2 | 8 | 37193 | 2687 | 494 | $0.0308 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r4 card | anthropic/claude-haiku-5.5 | 2 | 2752 | 0 | 0 | 134 | $0.0003 | 0 | 0 | 0 |
| GOAL-T1 | dm r4 card prose (with a press) | anthropic/claude-opus-5.5 | 2 | 39076 | 44207 | 5195 | 1562 | $0.2379 | 0 | 0 | 0 |
| GOAL-T1 | dm r4 onward | anthropic/claude-opus-5.5 | 4 | 14 | 187636 | 42642 | 6904 | $0.3889 | 0 | 0 | 0 |
| GOAL-T1 | dm r4 onward | anthropic/claude-haiku-5.5 | 3 | 9378 | 0 | 0 | 2422 | $0.0021 | 0 | 0 | 0 |
| GOAL-T1 | relay r4 | anthropic/claude-opus-5.5 | 1 | 4965 | 0 | 0 | 3819 | $0.0962 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram r5 | anthropic/claude-haiku-5.5 | 1 | 1881 | 0 | 0 | 71 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r5 | deepseek/deepseek-v4-pro-0813 | 1 | 1476 | 11264 | 0 | 378 | $0.0040 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r5 | anthropic/claude-haiku-5.5 | 1 | 1664 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1 | dm r5 | anthropic/claude-opus-5.5 | 6 | 24 | 227084 | 174294 | 19499 | $1.3211 | 0 | 0 | 0 |
| GOAL-T1 | dm r5 | anthropic/claude-haiku-5.5 | 3 | 11048 | 0 | 0 | 1772 | $0.0020 | 0 | 0 | 0 |
| GOAL-T1 | relay r5 | anthropic/claude-opus-5.5 | 2 | 4558 | 0 | 0 | 4916 | $0.1166 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r5 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 20696 | 668 | $0.1169 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r5 | anthropic/claude-haiku-5.5 | 1 | 1234 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram r6 | anthropic/claude-haiku-5.5 | 1 | 2192 | 0 | 0 | 69 | $0.0003 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r6 | deepseek/deepseek-v4-pro-0813 | 1 | 1354 | 12544 | 0 | 469 | $0.0042 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r6 | anthropic/claude-haiku-5.5 | 1 | 2032 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1 | dm r6 | anthropic/claude-opus-5.5 | 3 | 10 | 137782 | 93178 | 6960 | $0.6420 | 0 | 0 | 0 |
| GOAL-T1 | relay r6 card | anthropic/claude-opus-5.5 | 2 | 4557 | 0 | 0 | 2584 | $0.0699 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r6 card 1 | deepseek/deepseek-v4-pro-0813 | 2 | 1186 | 28416 | 0 | 573 | $0.0059 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r6 card | anthropic/claude-haiku-5.5 | 3 | 3026 | 0 | 0 | 193 | $0.0004 | 0 | 0 | 0 |
| GOAL-T1 | dm r6 card prose | anthropic/claude-opus-5.5 | 1 | 22068 | 24701 | 6114 | 625 | $0.1546 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r6 card 2 | deepseek/deepseek-v4-pro-0813 | 1 | 928 | 14592 | 0 | 170 | $0.0031 | 0 | 0 | 0 |
| GOAL-T1 | dm r6 onward | anthropic/claude-opus-5.5 | 4 | 12 | 197734 | 95756 | 15659 | $0.8316 | 0 | 0 | 0 |
| GOAL-T1 | dm r6 onward | anthropic/claude-haiku-5.5 | 4 | 12872 | 0 | 0 | 969 | $0.0018 | 0 | 0 | 0 |
| GOAL-T1 | relay r6 | anthropic/claude-opus-5.5 | 2 | 8250 | 0 | 0 | 3393 | $0.1009 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r6 | anthropic/claude-opus-5.5 | 1 | 4 | 20696 | 1355 | 934 | $0.0296 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r6 | anthropic/claude-haiku-5.5 | 1 | 1798 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r6 card 1 | anthropic/claude-opus-5.5 | 2 | 8 | 46390 | 2783 | 598 | $0.0352 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r6 card | anthropic/claude-haiku-5.5 | 2 | 2931 | 0 | 0 | 131 | $0.0004 | 0 | 0 | 0 |
| GOAL-T1 | dm r6 card prose (with a press) | anthropic/claude-opus-5.5 | 2 | 44058 | 63303 | 1673 | 1523 | $0.2327 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram r7 | anthropic/claude-haiku-5.5 | 1 | 1847 | 0 | 0 | 59 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r7 | deepseek/deepseek-v4-pro-0813 | 1 | 626 | 15360 | 0 | 1181 | $0.0054 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r7 | anthropic/claude-haiku-5.5 | 1 | 1815 | 0 | 0 | 74 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1 | dm r7 | anthropic/claude-opus-5.5 | 7 | 28 | 353934 | 224702 | 28299 | $1.7768 | 0 | 0 | 0 |
| GOAL-T1 | dm r7 | anthropic/claude-haiku-5.5 | 5 | 17254 | 0 | 0 | 2642 | $0.0030 | 0 | 0 | 0 |
| GOAL-T1 | relay r7 | anthropic/claude-opus-5.5 | 2 | 6148 | 0 | 0 | 4795 | $0.1205 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r7 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 25650 | 1091 | $0.1501 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r7 | anthropic/claude-haiku-5.5 | 1 | 1696 | 0 | 0 | 71 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram r8 | anthropic/claude-haiku-5.5 | 1 | 1904 | 0 | 0 | 52 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r8 | deepseek/deepseek-v4-pro-0813 | 1 | 1658 | 15872 | 0 | 389 | $0.0048 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r8 | anthropic/claude-haiku-5.5 | 1 | 1911 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1 | dm r8 | anthropic/claude-opus-5.5 | 4 | 16 | 122638 | 205973 | 17956 | $1.4258 | 0 | 0 | 0 |
| GOAL-T1 | dm r8 | anthropic/claude-haiku-5.5 | 2 | 7074 | 0 | 0 | 828 | $0.0011 | 0 | 0 | 0 |
| GOAL-T1 | relay r8 | anthropic/claude-opus-5.5 | 2 | 4700 | 0 | 0 | 4445 | $0.1077 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r8 | anthropic/claude-opus-5.5 | 1 | 4 | 25650 | 1930 | 916 | $0.0331 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r8 | anthropic/claude-haiku-5.5 | 1 | 2125 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram r9 | anthropic/claude-haiku-5.5 | 1 | 1683 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r9 | deepseek/deepseek-v4-pro-0813 | 1 | 1177 | 17408 | 0 | 645 | $0.0049 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r9 | anthropic/claude-haiku-5.5 | 1 | 1755 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1 | dm r9 | anthropic/claude-opus-5.5 | 5 | 20 | 229896 | 215874 | 16442 | $1.4657 | 0 | 0 | 0 |
| GOAL-T1 | dm r9 | anthropic/claude-haiku-5.5 | 3 | 9255 | 0 | 0 | 1162 | $0.0015 | 0 | 0 | 0 |
| GOAL-T1 | relay r9 | anthropic/claude-opus-5.5 | 2 | 5153 | 0 | 0 | 4914 | $0.1189 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r9 | anthropic/claude-opus-5.5 | 1 | 4 | 27580 | 1648 | 934 | $0.0325 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r9 | anthropic/claude-haiku-5.5 | 1 | 2173 | 0 | 0 | 70 | $0.0003 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram r10 | anthropic/claude-haiku-5.5 | 1 | 2277 | 0 | 0 | 85 | $0.0003 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r10 | deepseek/deepseek-v4-pro-0813 | 1 | 1503 | 18432 | 0 | 557 | $0.0052 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r10 | anthropic/claude-haiku-5.5 | 1 | 2222 | 0 | 0 | 68 | $0.0003 | 0 | 0 | 0 |
| GOAL-T1 | dm r10 | anthropic/claude-opus-5.5 | 7 | 28 | 403439 | 245381 | 20147 | $1.7214 | 0 | 0 | 0 |
| GOAL-T1 | dm r10 | anthropic/claude-haiku-5.5 | 4 | 13600 | 0 | 0 | 1509 | $0.0021 | 0 | 0 | 0 |
| GOAL-T1 | relay r10 | anthropic/claude-opus-5.5 | 2 | 5260 | 0 | 0 | 4387 | $0.1088 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r10 | anthropic/claude-opus-5.5 | 1 | 4 | 29228 | 1415 | 1121 | $0.0354 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r10 | anthropic/claude-haiku-5.5 | 1 | 1817 | 0 | 0 | 81 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram r11 | anthropic/claude-haiku-5.5 | 1 | 1828 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r11 | deepseek/deepseek-v4-pro-0813 | 1 | 1362 | 19712 | 0 | 201 | $0.0043 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r11 | anthropic/claude-haiku-5.5 | 1 | 1588 | 0 | 0 | 43 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1 | dm r11 | anthropic/claude-opus-5.5 | 4 | 16 | 145462 | 238046 | 17880 | $1.5879 | 0 | 0 | 0 |
| GOAL-T1 | dm r11 | anthropic/claude-haiku-5.5 | 3 | 8718 | 0 | 0 | 1500 | $0.0016 | 0 | 0 | 0 |
| GOAL-T1 | relay r11 | anthropic/claude-opus-5.5 | 2 | 4143 | 0 | 0 | 3474 | $0.0861 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r11 | anthropic/claude-opus-5.5 | 1 | 4 | 30643 | 2126 | 675 | $0.0303 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r11 | anthropic/claude-haiku-5.5 | 1 | 2177 | 0 | 0 | 77 | $0.0003 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram r12 | anthropic/claude-haiku-5.5 | 1 | 1542 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r12 | deepseek/deepseek-v4-pro-0813 | 1 | 940 | 20992 | 0 | 990 | $0.0059 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r12 | anthropic/claude-haiku-5.5 | 1 | 1805 | 0 | 0 | 61 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1 | dm r12 | anthropic/claude-opus-5.5 | 4 | 16 | 151983 | 246329 | 12840 | $1.5276 | 0 | 0 | 0 |
| GOAL-T1 | dm r12 | anthropic/claude-haiku-5.5 | 2 | 6830 | 0 | 0 | 487 | $0.0009 | 0 | 0 | 0 |
| GOAL-T1 | relay r12 | anthropic/claude-opus-5.5 | 2 | 4442 | 0 | 0 | 3717 | $0.0921 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r12 | anthropic/claude-opus-5.5 | 1 | 4 | 32769 | 1512 | 1057 | $0.0353 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r12 | anthropic/claude-haiku-5.5 | 1 | 1840 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram r13 | anthropic/claude-haiku-5.5 | 1 | 1558 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r13 | deepseek/deepseek-v4-pro-0813 | 1 | 1073 | 21760 | 0 | 1217 | $0.0067 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r13 | anthropic/claude-haiku-5.5 | 1 | 1624 | 0 | 0 | 89 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1 | dm r13 | anthropic/claude-opus-5.5 | 8 | 28 | 511265 | 204533 | 15156 | $3.5973 | 1 | 0 | 0 |
| GOAL-T1 | dm r13 | anthropic/claude-haiku-5.5 | 4 | 11651 | 0 | 0 | 1987 | $0.0022 | 0 | 0 | 0 |
| GOAL-T1 | relay r13 | anthropic/claude-opus-5.5 | 2 | 4417 | 0 | 0 | 4192 | $0.1015 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r13 | anthropic/claude-opus-5.5 | 1 | 4 | 34281 | 1761 | 808 | $0.0318 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r13 | anthropic/claude-haiku-5.5 | 1 | 1982 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram r14 | anthropic/claude-haiku-5.5 | 1 | 1551 | 0 | 0 | 57 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r14 | deepseek/deepseek-v4-pro-0813 | 1 | 1284 | 22528 | 0 | 396 | $0.0050 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r14 | anthropic/claude-haiku-5.5 | 1 | 1563 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1 | dm r14 | anthropic/claude-opus-5.5 | 5 | 20 | 251908 | 274254 | 16073 | $1.7526 | 0 | 0 | 0 |
| GOAL-T1 | dm r14 | anthropic/claude-haiku-5.5 | 3 | 10752 | 0 | 0 | 1433 | $0.0018 | 0 | 0 | 0 |
| GOAL-T1 | relay r14 | anthropic/claude-opus-5.5 | 2 | 4317 | 0 | 0 | 4253 | $0.1023 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r14 | anthropic/claude-opus-5.5 | 1 | 4 | 36042 | 1471 | 871 | $0.0320 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r14 | anthropic/claude-haiku-5.5 | 1 | 1805 | 0 | 0 | 82 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram r15 | anthropic/claude-haiku-5.5 | 1 | 1848 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r15 | deepseek/deepseek-v4-pro-0813 | 1 | 1422 | 23552 | 0 | 442 | $0.0054 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r15 | anthropic/claude-haiku-5.5 | 1 | 1970 | 0 | 0 | 77 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1 | dm r15 | anthropic/claude-opus-5.5 | 6 | 24 | 434449 | 277265 | 13809 | $1.7589 | 0 | 0 | 0 |
| GOAL-T1 | dm r15 | anthropic/claude-haiku-5.5 | 4 | 10504 | 0 | 0 | 1235 | $0.0017 | 0 | 0 | 0 |
| GOAL-T1 | relay r15 | anthropic/claude-opus-5.5 | 2 | 4321 | 0 | 0 | 3808 | $0.0934 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r15 | anthropic/claude-opus-5.5 | 1 | 4 | 37513 | 1398 | 552 | $0.0255 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r15 | anthropic/claude-haiku-5.5 | 1 | 1576 | 0 | 0 | 85 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram r16 | anthropic/claude-haiku-5.5 | 1 | 1854 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r16 | deepseek/deepseek-v4-pro-0813 | 1 | 1165 | 24832 | 0 | 623 | $0.0056 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r16 | anthropic/claude-haiku-5.5 | 1 | 1700 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1 | dm r16 | anthropic/claude-opus-5.5 | 5 | 20 | 265144 | 270521 | 10484 | $1.6237 | 0 | 0 | 0 |
| GOAL-T1 | dm r16 | anthropic/claude-haiku-5.5 | 3 | 9441 | 0 | 0 | 1881 | $0.0019 | 0 | 0 | 0 |
| GOAL-T1 | relay r16 | anthropic/claude-opus-5.5 | 2 | 4168 | 0 | 0 | 3521 | $0.0871 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r16 | anthropic/claude-opus-5.5 | 1 | 4 | 38911 | 1167 | 1042 | $0.0345 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r16 | anthropic/claude-haiku-5.5 | 1 | 1631 | 0 | 0 | 79 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram r17 | anthropic/claude-haiku-5.5 | 1 | 1741 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r17 | deepseek/deepseek-v4-pro-0813 | 1 | 926 | 25856 | 0 | 730 | $0.0057 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r17 | anthropic/claude-haiku-5.5 | 1 | 1536 | 0 | 0 | 77 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1 | dm r17 | anthropic/claude-opus-5.5 | 6 | 24 | 462744 | 288091 | 16753 | $1.8790 | 0 | 0 | 0 |
| GOAL-T1 | dm r17 | anthropic/claude-haiku-5.5 | 4 | 12454 | 0 | 0 | 1146 | $0.0018 | 0 | 0 | 0 |
| GOAL-T1 | relay r17 | anthropic/claude-opus-5.5 | 2 | 5427 | 0 | 0 | 4536 | $0.1124 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r17 | anthropic/claude-opus-5.5 | 1 | 4 | 40078 | 1477 | 906 | $0.0335 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r17 | anthropic/claude-haiku-5.5 | 1 | 1932 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram r18 | anthropic/claude-haiku-5.5 | 1 | 2042 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r18 | deepseek/deepseek-v4-pro-0813 | 1 | 1344 | 26624 | 0 | 1154 | $0.0074 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r18 | anthropic/claude-haiku-5.5 | 1 | 1851 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1 | dm r18 | anthropic/claude-opus-5.5 | 5 | 20 | 281989 | 285840 | 15613 | $1.8095 | 0 | 0 | 0 |
| GOAL-T1 | dm r18 | anthropic/claude-haiku-5.5 | 2 | 6753 | 0 | 0 | 901 | $0.0011 | 0 | 0 | 0 |
| GOAL-T1 | relay r18 | anthropic/claude-opus-5.5 | 2 | 4415 | 0 | 0 | 4170 | $0.1011 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r18 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 43283 | 665 | $0.2297 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r18 | anthropic/claude-haiku-5.5 | 1 | 1943 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram r19 | anthropic/claude-haiku-5.5 | 1 | 1823 | 0 | 0 | 61 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r19 | deepseek/deepseek-v4-pro-0813 | 1 | 1367 | 27648 | 0 | 483 | $0.0058 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r19 | anthropic/claude-haiku-5.5 | 1 | 1778 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1 | dm r19 | anthropic/claude-opus-5.5 | 5 | 20 | 347720 | 287967 | 17991 | $1.8794 | 0 | 0 | 0 |
| GOAL-T1 | dm r19 | anthropic/claude-haiku-5.5 | 3 | 9497 | 0 | 0 | 1257 | $0.0016 | 0 | 0 | 0 |
| GOAL-T1 | relay r19 | anthropic/claude-opus-5.5 | 2 | 4675 | 0 | 0 | 4537 | $0.1094 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r19 | anthropic/claude-opus-5.5 | 1 | 4 | 43283 | 1352 | 666 | $0.0288 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r19 | anthropic/claude-haiku-5.5 | 1 | 1610 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram r20 | anthropic/claude-haiku-5.5 | 1 | 2207 | 0 | 0 | 67 | $0.0003 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r20 | deepseek/deepseek-v4-pro-0813 | 1 | 1300 | 28928 | 0 | 432 | $0.0057 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r20 | anthropic/claude-haiku-5.5 | 1 | 1912 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1 | dm r20 | anthropic/claude-opus-5.5 | 6 | 22 | 522144 | 288973 | 18591 | $1.9332 | 0 | 0 | 0 |
| GOAL-T1 | dm r20 | anthropic/claude-haiku-5.5 | 3 | 10867 | 0 | 0 | 1414 | $0.0018 | 0 | 0 | 0 |
| GOAL-T1 | relay r20 | anthropic/claude-opus-5.5 | 2 | 5019 | 0 | 0 | 5517 | $0.1304 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r20 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 46058 | 581 | $0.2419 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r20 | anthropic/claude-haiku-5.5 | 1 | 1676 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram r21 | anthropic/claude-haiku-5.5 | 1 | 2526 | 0 | 0 | 71 | $0.0003 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r21 | deepseek/deepseek-v4-pro-0813 | 1 | 1849 | 29952 | 0 | 838 | $0.0076 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r21 | anthropic/claude-haiku-5.5 | 1 | 2811 | 0 | 0 | 75 | $0.0003 | 0 | 0 | 0 |
| GOAL-T1 | dm r21 | anthropic/claude-opus-5.5 | 5 | 20 | 315925 | 287098 | 18637 | $1.8831 | 0 | 0 | 0 |
| GOAL-T1 | dm r21 | anthropic/claude-haiku-5.5 | 3 | 12641 | 0 | 0 | 2350 | $0.0024 | 0 | 0 | 0 |
| GOAL-T1 | relay r21 | anthropic/claude-opus-5.5 | 2 | 5214 | 0 | 0 | 5621 | $0.1333 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r21 | anthropic/claude-opus-5.5 | 1 | 4 | 46058 | 1118 | 673 | $0.0283 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r21 | anthropic/claude-haiku-5.5 | 1 | 1516 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram r22 | anthropic/claude-haiku-5.5 | 1 | 2684 | 0 | 0 | 89 | $0.0003 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r22 | deepseek/deepseek-v4-pro-0813 | 1 | 2073 | 31488 | 0 | 602 | $0.0074 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r22 | anthropic/claude-haiku-5.5 | 1 | 2482 | 0 | 0 | 63 | $0.0003 | 0 | 0 | 0 |
| GOAL-T1 | dm r22 | anthropic/claude-opus-5.5 | 7 | 28 | 573301 | 306675 | 15882 | $1.9746 | 0 | 0 | 0 |
| GOAL-T1 | dm r22 | anthropic/claude-haiku-5.5 | 5 | 18677 | 0 | 0 | 2518 | $0.0031 | 0 | 0 | 0 |
| GOAL-T1 | relay r22 | anthropic/claude-opus-5.5 | 2 | 5161 | 0 | 0 | 4626 | $0.1132 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r22 | anthropic/claude-opus-5.5 | 1 | 4 | 47176 | 1225 | 1058 | $0.0367 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r22 | anthropic/claude-haiku-5.5 | 1 | 1698 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram r23 | anthropic/claude-haiku-5.5 | 1 | 1972 | 0 | 0 | 74 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r23 | deepseek/deepseek-v4-pro-0813 | 1 | 1370 | 33280 | 0 | 594 | $0.0067 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r23 | anthropic/claude-haiku-5.5 | 1 | 1935 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1 | dm r23 | anthropic/claude-opus-5.5 | 6 | 24 | 487744 | 301475 | 14575 | $1.9078 | 0 | 0 | 0 |
| GOAL-T1 | dm r23 | anthropic/claude-haiku-5.5 | 4 | 12284 | 0 | 0 | 2286 | $0.0024 | 0 | 0 | 0 |
| GOAL-T1 | relay r23 | anthropic/claude-opus-5.5 | 2 | 4508 | 0 | 0 | 3579 | $0.0896 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r23 | anthropic/claude-opus-5.5 | 1 | 4 | 48401 | 1918 | 797 | $0.0352 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r23 | anthropic/claude-haiku-5.5 | 1 | 2181 | 0 | 0 | 64 | $0.0003 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram r24 | anthropic/claude-haiku-5.5 | 1 | 1523 | 0 | 0 | 77 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r24 | deepseek/deepseek-v4-pro-0813 | 1 | 905 | 34560 | 0 | 618 | $0.0062 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r24 | anthropic/claude-haiku-5.5 | 1 | 1428 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1 | dm r24 | anthropic/claude-opus-5.5 | 6 | 24 | 514946 | 272921 | 14674 | $1.7704 | 0 | 0 | 0 |
| GOAL-T1 | dm r24 | anthropic/claude-haiku-5.5 | 4 | 10792 | 0 | 0 | 1564 | $0.0019 | 0 | 0 | 0 |
| GOAL-T1 | relay r24 | anthropic/claude-opus-5.5 | 2 | 3578 | 0 | 0 | 3352 | $0.0814 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r24 | anthropic/claude-opus-5.5 | 1 | 4 | 50319 | 1567 | 665 | $0.0312 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r24 | anthropic/claude-haiku-5.5 | 1 | 1633 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram r25 | anthropic/claude-haiku-5.5 | 1 | 1398 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/Sefa | player r25 | deepseek/deepseek-v4-pro-0813 | 1 | 898 | 35328 | 0 | 468 | $0.0059 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa r25 | anthropic/claude-haiku-5.5 | 1 | 1318 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/Pell | player r25 | anthropic/claude-opus-5.5 | 1 | 4 | 51886 | 980 | 1376 | $0.0428 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell r25 | anthropic/claude-haiku-5.5 | 1 | 1619 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1 | dm r25 | anthropic/claude-opus-5.5 | 3 | 12 | 289051 | 147429 | 4812 | $0.8944 | 0 | 0 | 0 |
| GOAL-T1 | dm r25 | anthropic/claude-haiku-5.5 | 2 | 5165 | 0 | 0 | 504 | $0.0008 | 0 | 0 | 0 |
| GOAL-T1 | relay r25 | anthropic/claude-opus-5.5 | 1 | 2759 | 0 | 0 | 3897 | $0.0890 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram after 1 | anthropic/claude-haiku-5.5 | 1 | 806 | 0 | 0 | 75 | $0.0001 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram after 2 | anthropic/claude-haiku-5.5 | 1 | 546 | 0 | 0 | 65 | $0.0001 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Bram after 3 | anthropic/claude-haiku-5.5 | 1 | 517 | 0 | 0 | 74 | $0.0001 | 0 | 0 | 0 |
| GOAL-T1/Sefa | after 1 | deepseek/deepseek-v4-pro-0813 | 1 | 1190 | 36096 | 0 | 845 | $0.0074 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa after 1 | anthropic/claude-haiku-5.5 | 1 | 1045 | 0 | 0 | 67 | $0.0001 | 0 | 0 | 0 |
| GOAL-T1/Sefa | after 2 | deepseek/deepseek-v4-pro-0813 | 1 | 669 | 37120 | 0 | 987 | $0.0071 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa after 2 | anthropic/claude-haiku-5.5 | 1 | 932 | 0 | 0 | 80 | $0.0001 | 0 | 0 | 0 |
| GOAL-T1/Sefa | after 3 | deepseek/deepseek-v4-pro-0813 | 1 | 592 | 37632 | 0 | 576 | $0.0060 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Sefa after 3 | anthropic/claude-haiku-5.5 | 1 | 797 | 0 | 0 | 65 | $0.0001 | 0 | 0 | 0 |
| GOAL-T1/Pell | after 1 | anthropic/claude-opus-5.5 | 1 | 4 | 52866 | 1615 | 1059 | $0.0398 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell after 1 | anthropic/claude-haiku-5.5 | 1 | 1119 | 0 | 0 | 90 | $0.0002 | 0 | 0 | 0 |
| GOAL-T1/Pell | after 2 | anthropic/claude-opus-5.5 | 1 | 4 | 54481 | 814 | 920 | $0.0334 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell after 2 | anthropic/claude-haiku-5.5 | 1 | 1011 | 0 | 0 | 70 | $0.0001 | 0 | 0 | 0 |
| GOAL-T1/Pell | after 3 | anthropic/claude-opus-5.5 | 1 | 4 | 55295 | 693 | 881 | $0.0322 | 0 | 0 | 0 |
| GOAL-T1/check | check GOAL-T1 Pell after 3 | anthropic/claude-haiku-5.5 | 1 | 891 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| GOAL-T2 | relay opening | anthropic/claude-opus-5.5 | 1 | 1005 | 0 | 0 | 1554 | $0.0351 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r1 | anthropic/claude-haiku-5.5 | 1 | 1495 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r1 | deepseek/deepseek-v4-pro-0813 | 1 | 7439 | 0 | 0 | 336 | $0.0105 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r1 | anthropic/claude-haiku-5.5 | 1 | 1731 | 0 | 0 | 61 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2/Pell | player r1 | anthropic/claude-fable-5.1 | 1 | 4 | 0 | 10729 | 281 | $0.1482 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Pell r1 | anthropic/claude-haiku-5.5 | 1 | 1618 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2 | dm r1 | anthropic/claude-opus-5.5 | 1 | 4 | 18422 | 25725 | 1466 | $0.1627 | 0 | 0 | 0 |
| GOAL-T2 | relay r1 card | anthropic/claude-opus-5.5 | 2 | 2500 | 0 | 0 | 1482 | $0.0396 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r1 card | anthropic/claude-haiku-5.5 | 2 | 1272 | 0 | 0 | 126 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2/Pell | player r1 card 1 | anthropic/claude-fable-5.1 | 2 | 8 | 22088 | 799 | 153 | $0.0232 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Pell r1 card | anthropic/claude-haiku-5.5 | 2 | 1231 | 0 | 0 | 112 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2 | dm r1 onward | anthropic/claude-opus-5.5 | 3 | 10 | 111685 | 32927 | 9312 | $0.3733 | 0 | 0 | 0 |
| GOAL-T2 | dm r1 onward | anthropic/claude-haiku-5.5 | 2 | 5455 | 0 | 0 | 592 | $0.0008 | 0 | 0 | 0 |
| GOAL-T2 | relay r1 | anthropic/claude-opus-5.5 | 1 | 3306 | 0 | 0 | 3847 | $0.0902 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r2 | anthropic/claude-haiku-5.5 | 1 | 1639 | 0 | 0 | 84 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r2 | deepseek/deepseek-v4-pro-0813 | 1 | 1178 | 7168 | 0 | 940 | $0.0047 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r2 | anthropic/claude-haiku-5.5 | 1 | 1647 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2/Pell | player r2 | anthropic/claude-fable-5.1 | 1 | 4 | 11528 | 1024 | 521 | $0.0418 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Pell r2 | anthropic/claude-haiku-5.5 | 1 | 1752 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2 | dm r2 | anthropic/claude-opus-5.5 | 2 | 8 | 40164 | 64058 | 6793 | $0.4699 | 0 | 0 | 0 |
| GOAL-T2 | dm r2 | anthropic/claude-haiku-5.5 | 1 | 3269 | 0 | 0 | 321 | $0.0005 | 0 | 0 | 0 |
| GOAL-T2 | relay r2 | anthropic/claude-opus-5.5 | 1 | 2550 | 0 | 0 | 5366 | $0.1175 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r3 | anthropic/claude-haiku-5.5 | 1 | 2096 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r3 | deepseek/deepseek-v4-pro-0813 | 1 | 1472 | 8192 | 0 | 1253 | $0.0060 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r3 | anthropic/claude-haiku-5.5 | 1 | 2512 | 0 | 0 | 81 | $0.0003 | 0 | 0 | 0 |
| GOAL-T2/Pell | player r3 | anthropic/claude-fable-5.1 | 1 | 4 | 12552 | 1853 | 659 | $0.0593 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Pell r3 | anthropic/claude-haiku-5.5 | 1 | 2231 | 0 | 0 | 66 | $0.0003 | 0 | 0 | 0 |
| GOAL-T2 | dm r3 | anthropic/claude-opus-5.5 | 2 | 8 | 42075 | 54769 | 9394 | $0.4758 | 0 | 0 | 0 |
| GOAL-T2 | dm r3 | anthropic/claude-haiku-5.5 | 1 | 3526 | 0 | 0 | 364 | $0.0005 | 0 | 0 | 0 |
| GOAL-T2 | relay r3 | anthropic/claude-opus-5.5 | 1 | 2934 | 0 | 0 | 5962 | $0.1310 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r4 | anthropic/claude-haiku-5.5 | 1 | 2686 | 0 | 0 | 61 | $0.0003 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r4 | deepseek/deepseek-v4-pro-0813 | 1 | 1860 | 9472 | 0 | 1212 | $0.0065 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r4 | anthropic/claude-haiku-5.5 | 1 | 2272 | 0 | 0 | 69 | $0.0003 | 0 | 0 | 0 |
| GOAL-T2/Pell | player r4 | anthropic/claude-fable-5.1 | 1 | 4 | 14405 | 2341 | 525 | $0.0592 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Pell r4 | anthropic/claude-haiku-5.5 | 1 | 2616 | 0 | 0 | 77 | $0.0003 | 0 | 0 | 0 |
| GOAL-T2 | dm r4 | anthropic/claude-opus-5.5 | 3 | 12 | 100611 | 75553 | 9897 | $0.6026 | 0 | 0 | 0 |
| GOAL-T2 | dm r4 | anthropic/claude-haiku-5.5 | 2 | 7334 | 0 | 0 | 991 | $0.0012 | 0 | 0 | 0 |
| GOAL-T2 | relay r4 | anthropic/claude-opus-5.5 | 1 | 3009 | 0 | 0 | 4444 | $0.1009 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r5 | anthropic/claude-haiku-5.5 | 1 | 1640 | 0 | 0 | 62 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r5 | deepseek/deepseek-v4-pro-0813 | 1 | 1050 | 11264 | 0 | 1221 | $0.0057 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r5 | anthropic/claude-haiku-5.5 | 1 | 1877 | 0 | 0 | 74 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2 | dm r5 | anthropic/claude-opus-5.5 | 4 | 16 | 132238 | 112318 | 6334 | $0.7258 | 0 | 0 | 0 |
| GOAL-T2 | relay r5 card | anthropic/claude-opus-5.5 | 1 | 1386 | 0 | 0 | 280 | $0.0111 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r5 card 1 | deepseek/deepseek-v4-pro-0813 | 2 | 1038 | 24832 | 0 | 619 | $0.0054 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r5 card | anthropic/claude-haiku-5.5 | 3 | 2736 | 0 | 0 | 222 | $0.0004 | 0 | 0 | 0 |
| GOAL-T2 | dm r5 card prose | anthropic/claude-opus-5.5 | 1 | 18912 | 0 | 26357 | 968 | $0.3059 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r5 card 2 | deepseek/deepseek-v4-pro-0813 | 1 | 928 | 12800 | 0 | 458 | $0.0037 | 0 | 0 | 0 |
| GOAL-T2 | dm r5 card prose (with a press) | anthropic/claude-opus-5.5 | 1 | 19493 | 26357 | 0 | 1055 | $0.1043 | 0 | 0 | 0 |
| GOAL-T2 | dm r5 onward | anthropic/claude-opus-5.5 | 3 | 10 | 142643 | 36933 | 4996 | $0.3132 | 0 | 0 | 0 |
| GOAL-T2 | dm r5 onward | anthropic/claude-haiku-5.5 | 2 | 3783 | 0 | 0 | 187 | $0.0005 | 0 | 0 | 0 |
| GOAL-T2 | relay r5 | anthropic/claude-opus-5.5 | 2 | 4341 | 0 | 0 | 3159 | $0.0805 | 0 | 0 | 0 |
| GOAL-T2/Pell | player r5 | anthropic/claude-fable-5.1 | 1 | 4 | 0 | 18428 | 517 | $0.2562 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Pell r5 | anthropic/claude-haiku-5.5 | 1 | 2017 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2 | dm r5 | anthropic/claude-haiku-5.5 | 2 | 6122 | 0 | 0 | 1300 | $0.0013 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r6 | anthropic/claude-haiku-5.5 | 1 | 1476 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r6 | deepseek/deepseek-v4-pro-0813 | 1 | 699 | 13568 | 0 | 702 | $0.0041 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r6 | anthropic/claude-haiku-5.5 | 1 | 1161 | 0 | 0 | 67 | $0.0001 | 0 | 0 | 0 |
| GOAL-T2 | dm r6 | anthropic/claude-opus-5.5 | 6 | 24 | 232150 | 164458 | 14517 | $1.1683 | 0 | 0 | 0 |
| GOAL-T2 | dm r6 | anthropic/claude-haiku-5.5 | 4 | 11878 | 0 | 0 | 1405 | $0.0019 | 0 | 0 | 0 |
| GOAL-T2 | relay r6 | anthropic/claude-opus-5.5 | 2 | 4498 | 0 | 0 | 3694 | $0.0919 | 0 | 0 | 0 |
| GOAL-T2/Pell | player r6 | anthropic/claude-fable-5.1 | 1 | 4 | 18428 | 1462 | 875 | $0.0667 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Pell r6 | anthropic/claude-haiku-5.5 | 1 | 1892 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r7 | anthropic/claude-haiku-5.5 | 1 | 1582 | 0 | 0 | 61 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r7 | deepseek/deepseek-v4-pro-0813 | 1 | 1086 | 14080 | 0 | 857 | $0.0050 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r7 | anthropic/claude-haiku-5.5 | 1 | 1329 | 0 | 0 | 79 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2 | dm r7 | anthropic/claude-opus-5.5 | 6 | 24 | 242717 | 168433 | 7398 | $1.0475 | 0 | 0 | 0 |
| GOAL-T2 | dm r7 | anthropic/claude-haiku-5.5 | 4 | 8923 | 0 | 0 | 1636 | $0.0017 | 0 | 0 | 0 |
| GOAL-T2 | relay r7 | anthropic/claude-opus-5.5 | 1 | 1817 | 0 | 0 | 1776 | $0.0428 | 0 | 0 | 0 |
| GOAL-T2/Pell | player r7 | anthropic/claude-fable-5.1 | 1 | 0 | 0 | 0 | 0 | $0.0000 | 0 | 1 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r8 | anthropic/claude-haiku-5.5 | 1 | 1077 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r8 | deepseek/deepseek-v4-pro-0813 | 1 | 888 | 14848 | 0 | 1108 | $0.0055 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r8 | anthropic/claude-haiku-5.5 | 1 | 2115 | 0 | 0 | 99 | $0.0003 | 0 | 0 | 0 |
| GOAL-T2 | dm r8 | anthropic/claude-opus-5.5 | 3 | 12 | 124470 | 74024 | 8748 | $0.5711 | 0 | 0 | 0 |
| GOAL-T2 | dm r8 | anthropic/claude-haiku-5.5 | 2 | 5232 | 0 | 0 | 506 | $0.0008 | 0 | 0 | 0 |
| GOAL-T2 | relay r8 | anthropic/claude-opus-5.5 | 1 | 3124 | 0 | 0 | 1987 | $0.0522 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r9 | anthropic/claude-haiku-5.5 | 1 | 997 | 0 | 0 | 67 | $0.0001 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r9 | deepseek/deepseek-v4-pro-0813 | 1 | 1634 | 15616 | 0 | 132 | $0.0040 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r9 | anthropic/claude-haiku-5.5 | 1 | 1166 | 0 | 0 | 43 | $0.0001 | 0 | 0 | 0 |
| GOAL-T2 | dm r9 | anthropic/claude-opus-5.5 | 2 | 8 | 56197 | 79641 | 9302 | $0.6030 | 0 | 0 | 0 |
| GOAL-T2 | dm r9 | anthropic/claude-haiku-5.5 | 1 | 3383 | 0 | 0 | 512 | $0.0006 | 0 | 0 | 0 |
| GOAL-T2 | relay r9 | anthropic/claude-opus-5.5 | 1 | 2001 | 0 | 0 | 3076 | $0.0695 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r10 | anthropic/claude-haiku-5.5 | 1 | 1728 | 0 | 0 | 81 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r10 | deepseek/deepseek-v4-pro-0813 | 1 | 1232 | 16896 | 0 | 1671 | $0.0076 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r10 | anthropic/claude-haiku-5.5 | 1 | 2085 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2 | dm r10 | anthropic/claude-opus-5.5 | 2 | 8 | 58681 | 87311 | 11315 | $0.6787 | 0 | 0 | 0 |
| GOAL-T2 | dm r10 | anthropic/claude-haiku-5.5 | 1 | 3692 | 0 | 0 | 366 | $0.0006 | 0 | 0 | 0 |
| GOAL-T2 | relay r10 | anthropic/claude-opus-5.5 | 1 | 2910 | 0 | 0 | 4269 | $0.0970 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r11 | anthropic/claude-haiku-5.5 | 1 | 2371 | 0 | 0 | 66 | $0.0003 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r11 | deepseek/deepseek-v4-pro-0813 | 1 | 1770 | 17920 | 0 | 542 | $0.0055 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r11 | anthropic/claude-haiku-5.5 | 1 | 2372 | 0 | 0 | 67 | $0.0003 | 0 | 0 | 0 |
| GOAL-T2 | dm r11 | anthropic/claude-opus-5.5 | 3 | 12 | 144144 | 94457 | 8864 | $0.6853 | 0 | 0 | 0 |
| GOAL-T2 | dm r11 | anthropic/claude-haiku-5.5 | 2 | 5047 | 0 | 0 | 643 | $0.0008 | 0 | 0 | 0 |
| GOAL-T2 | relay r11 | anthropic/claude-opus-5.5 | 1 | 2283 | 0 | 0 | 3235 | $0.0738 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r12 | anthropic/claude-haiku-5.5 | 1 | 1888 | 0 | 0 | 82 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r12 | deepseek/deepseek-v4-pro-0813 | 1 | 1349 | 19456 | 0 | 596 | $0.0052 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r12 | anthropic/claude-haiku-5.5 | 1 | 1879 | 0 | 0 | 62 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2 | dm r12 | anthropic/claude-opus-5.5 | 2 | 8 | 68130 | 86773 | 9275 | $0.6380 | 0 | 0 | 0 |
| GOAL-T2 | dm r12 | anthropic/claude-haiku-5.5 | 1 | 3028 | 0 | 0 | 379 | $0.0005 | 0 | 0 | 0 |
| GOAL-T2 | relay r12 | anthropic/claude-opus-5.5 | 1 | 2135 | 0 | 0 | 2843 | $0.0654 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r13 | anthropic/claude-haiku-5.5 | 1 | 1690 | 0 | 0 | 77 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r13 | deepseek/deepseek-v4-pro-0813 | 1 | 1064 | 20736 | 0 | 527 | $0.0048 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r13 | anthropic/claude-haiku-5.5 | 1 | 1805 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2 | dm r13 | anthropic/claude-opus-5.5 | 3 | 12 | 152874 | 95483 | 3966 | $0.5918 | 0 | 0 | 0 |
| GOAL-T2 | dm r13 | anthropic/claude-haiku-5.5 | 2 | 4171 | 0 | 0 | 460 | $0.0006 | 0 | 0 | 0 |
| GOAL-T2 | relay r13 | anthropic/claude-opus-5.5 | 1 | 2129 | 0 | 0 | 1331 | $0.0351 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r14 | anthropic/claude-haiku-5.5 | 1 | 1271 | 0 | 0 | 71 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r14 | deepseek/deepseek-v4-pro-0813 | 1 | 878 | 21504 | 0 | 593 | $0.0048 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r14 | anthropic/claude-haiku-5.5 | 1 | 1041 | 0 | 0 | 77 | $0.0001 | 0 | 0 | 0 |
| GOAL-T2 | dm r14 | anthropic/claude-opus-5.5 | 2 | 8 | 71535 | 86648 | 4345 | $0.5389 | 0 | 0 | 0 |
| GOAL-T2 | dm r14 | anthropic/claude-haiku-5.5 | 2 | 3890 | 0 | 0 | 259 | $0.0005 | 0 | 0 | 0 |
| GOAL-T2 | relay r14 | anthropic/claude-opus-5.5 | 1 | 1740 | 0 | 0 | 1202 | $0.0310 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r15 | anthropic/claude-haiku-5.5 | 1 | 1097 | 0 | 0 | 85 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r15 | deepseek/deepseek-v4-pro-0813 | 1 | 687 | 22272 | 0 | 190 | $0.0036 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r15 | anthropic/claude-haiku-5.5 | 1 | 788 | 0 | 0 | 42 | $0.0001 | 0 | 0 | 0 |
| GOAL-T2 | dm r15 | anthropic/claude-opus-5.5 | 2 | 8 | 66939 | 93065 | 8792 | $0.6579 | 0 | 0 | 0 |
| GOAL-T2 | dm r15 | anthropic/claude-haiku-5.5 | 1 | 3101 | 0 | 0 | 550 | $0.0006 | 0 | 0 | 0 |
| GOAL-T2 | relay r15 | anthropic/claude-opus-5.5 | 1 | 1706 | 0 | 0 | 1523 | $0.0373 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r16 | anthropic/claude-haiku-5.5 | 1 | 1419 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2 | dm r16 | anthropic/claude-opus-5.5 | 4 | 16 | 137144 | 194044 | 11909 | $1.2431 | 0 | 0 | 0 |
| GOAL-T2 | dm r16 | anthropic/claude-haiku-5.5 | 2 | 5490 | 0 | 0 | 836 | $0.0010 | 0 | 0 | 0 |
| GOAL-T2 | relay r16 | anthropic/claude-opus-5.5 | 2 | 3955 | 0 | 0 | 2005 | $0.0559 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r16 | deepseek/deepseek-v4-pro-0813 | 1 | 317 | 22784 | 0 | 1194 | $0.0058 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r16 | anthropic/claude-haiku-5.5 | 1 | 1192 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r17 | anthropic/claude-haiku-5.5 | 1 | 1461 | 0 | 0 | 71 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2 | dm r17 | anthropic/claude-opus-5.5 | 4 | 16 | 142294 | 204021 | 10387 | $1.2648 | 0 | 0 | 0 |
| GOAL-T2 | dm r17 | anthropic/claude-haiku-5.5 | 2 | 5171 | 0 | 0 | 757 | $0.0009 | 0 | 0 | 0 |
| GOAL-T2 | relay r17 | anthropic/claude-opus-5.5 | 2 | 3109 | 0 | 0 | 1748 | $0.0474 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r17 | deepseek/deepseek-v4-pro-0813 | 1 | 1281 | 22784 | 0 | 115 | $0.0042 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r17 | anthropic/claude-haiku-5.5 | 1 | 1024 | 0 | 0 | 43 | $0.0001 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r18 | anthropic/claude-haiku-5.5 | 1 | 1696 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2 | dm r18 | anthropic/claude-opus-5.5 | 4 | 16 | 147027 | 211292 | 16639 | $1.4247 | 0 | 0 | 0 |
| GOAL-T2 | dm r18 | anthropic/claude-haiku-5.5 | 2 | 6035 | 0 | 0 | 1053 | $0.0011 | 0 | 0 | 0 |
| GOAL-T2 | relay r18 | anthropic/claude-opus-5.5 | 2 | 3626 | 0 | 0 | 2161 | $0.0577 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r18 | deepseek/deepseek-v4-pro-0813 | 1 | 24395 | 0 | 0 | 306 | $0.0325 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r18 | anthropic/claude-haiku-5.5 | 1 | 923 | 0 | 0 | 64 | $0.0001 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r19 | anthropic/claude-haiku-5.5 | 1 | 1674 | 0 | 0 | 55 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2 | dm r19 | anthropic/claude-opus-5.5 | 6 | 24 | 341717 | 237118 | 15706 | $1.5748 | 0 | 0 | 0 |
| GOAL-T2 | dm r19 | anthropic/claude-haiku-5.5 | 3 | 8198 | 0 | 0 | 878 | $0.0013 | 0 | 0 | 0 |
| GOAL-T2 | relay r19 | anthropic/claude-opus-5.5 | 2 | 3907 | 0 | 0 | 2187 | $0.0594 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r19 | deepseek/deepseek-v4-pro-0813 | 1 | 748 | 24320 | 0 | 635 | $0.0051 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r19 | anthropic/claude-haiku-5.5 | 1 | 1615 | 0 | 0 | 62 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r20 | anthropic/claude-haiku-5.5 | 1 | 1597 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2 | dm r20 | anthropic/claude-opus-5.5 | 4 | 16 | 156381 | 238441 | 9464 | $1.4206 | 0 | 0 | 0 |
| GOAL-T2 | dm r20 | anthropic/claude-haiku-5.5 | 2 | 4971 | 0 | 0 | 796 | $0.0009 | 0 | 0 | 0 |
| GOAL-T2 | relay r20 | anthropic/claude-opus-5.5 | 2 | 3481 | 0 | 0 | 1625 | $0.0464 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r20 | deepseek/deepseek-v4-pro-0813 | 1 | 1115 | 24832 | 0 | 1024 | $0.0066 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r20 | anthropic/claude-haiku-5.5 | 1 | 1565 | 0 | 0 | 78 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r21 | anthropic/claude-haiku-5.5 | 1 | 1375 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2 | dm r21 | anthropic/claude-opus-5.5 | 5 | 20 | 286305 | 234829 | 15848 | $1.5574 | 0 | 0 | 0 |
| GOAL-T2 | dm r21 | anthropic/claude-haiku-5.5 | 3 | 8531 | 0 | 0 | 1011 | $0.0014 | 0 | 0 | 0 |
| GOAL-T2 | relay r21 | anthropic/claude-opus-5.5 | 2 | 3879 | 0 | 0 | 2510 | $0.0657 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r21 | deepseek/deepseek-v4-pro-0813 | 1 | 876 | 25856 | 0 | 477 | $0.0050 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r21 | anthropic/claude-haiku-5.5 | 1 | 1063 | 0 | 0 | 74 | $0.0001 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r22 | anthropic/claude-haiku-5.5 | 1 | 2040 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2 | dm r22 | anthropic/claude-opus-5.5 | 5 | 20 | 294582 | 237069 | 11109 | $1.4727 | 0 | 0 | 0 |
| GOAL-T2 | dm r22 | anthropic/claude-haiku-5.5 | 3 | 7542 | 0 | 0 | 957 | $0.0012 | 0 | 0 | 0 |
| GOAL-T2 | relay r22 | anthropic/claude-opus-5.5 | 2 | 3483 | 0 | 0 | 1806 | $0.0501 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r22 | deepseek/deepseek-v4-pro-0813 | 1 | 661 | 26624 | 0 | 458 | $0.0047 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r22 | anthropic/claude-haiku-5.5 | 1 | 1327 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r23 | anthropic/claude-haiku-5.5 | 1 | 1397 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2 | dm r23 | anthropic/claude-opus-5.5 | 4 | 16 | 171270 | 244321 | 16019 | $1.5839 | 0 | 0 | 0 |
| GOAL-T2 | dm r23 | anthropic/claude-haiku-5.5 | 2 | 6457 | 0 | 0 | 690 | $0.0010 | 0 | 0 | 0 |
| GOAL-T2 | relay r23 | anthropic/claude-opus-5.5 | 2 | 3658 | 0 | 0 | 2018 | $0.0550 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r23 | deepseek/deepseek-v4-pro-0813 | 1 | 878 | 27136 | 0 | 462 | $0.0051 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r23 | anthropic/claude-haiku-5.5 | 1 | 1152 | 0 | 0 | 71 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r24 | anthropic/claude-haiku-5.5 | 1 | 1735 | 0 | 0 | 60 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2 | dm r24 | anthropic/claude-opus-5.5 | 5 | 20 | 305268 | 248007 | 15525 | $1.6191 | 0 | 0 | 0 |
| GOAL-T2 | dm r24 | anthropic/claude-haiku-5.5 | 3 | 8342 | 0 | 0 | 986 | $0.0013 | 0 | 0 | 0 |
| GOAL-T2 | relay r24 | anthropic/claude-opus-5.5 | 2 | 4123 | 0 | 0 | 2230 | $0.0611 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r24 | deepseek/deepseek-v4-pro-0813 | 1 | 792 | 27904 | 0 | 700 | $0.0056 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r24 | anthropic/claude-haiku-5.5 | 1 | 1486 | 0 | 0 | 81 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram r25 | anthropic/claude-haiku-5.5 | 1 | 1770 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2 | dm r25 | anthropic/claude-opus-5.5 | 5 | 20 | 266062 | 257007 | 21389 | $1.7768 | 0 | 0 | 0 |
| GOAL-T2 | dm r25 | anthropic/claude-haiku-5.5 | 3 | 12823 | 0 | 0 | 2370 | $0.0025 | 0 | 0 | 0 |
| GOAL-T2 | relay r25 | anthropic/claude-opus-5.5 | 2 | 5062 | 0 | 0 | 3208 | $0.0844 | 0 | 0 | 0 |
| GOAL-T2/Sefa | player r25 | deepseek/deepseek-v4-pro-0813 | 1 | 1236 | 28416 | 0 | 730 | $0.0063 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa r25 | anthropic/claude-haiku-5.5 | 1 | 1722 | 0 | 0 | 84 | $0.0002 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram after 1 | anthropic/claude-haiku-5.5 | 1 | 635 | 0 | 0 | 61 | $0.0001 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram after 2 | anthropic/claude-haiku-5.5 | 1 | 523 | 0 | 0 | 79 | $0.0001 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Bram after 3 | anthropic/claude-haiku-5.5 | 1 | 456 | 0 | 0 | 61 | $0.0001 | 0 | 0 | 0 |
| GOAL-T2/Sefa | after 1 | deepseek/deepseek-v4-pro-0813 | 1 | 1454 | 29440 | 0 | 426 | $0.0059 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa after 1 | anthropic/claude-haiku-5.5 | 1 | 390 | 0 | 0 | 61 | $0.0001 | 0 | 0 | 0 |
| GOAL-T2/Sefa | after 2 | deepseek/deepseek-v4-pro-0813 | 1 | 238 | 30720 | 0 | 508 | $0.0047 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa after 2 | anthropic/claude-haiku-5.5 | 1 | 586 | 0 | 0 | 79 | $0.0001 | 0 | 0 | 0 |
| GOAL-T2/Sefa | after 3 | deepseek/deepseek-v4-pro-0813 | 1 | 437 | 30720 | 0 | 2599 | $0.0104 | 0 | 0 | 0 |
| GOAL-T2/check | check GOAL-T2 Sefa after 3 | anthropic/claude-haiku-5.5 | 1 | 1097 | 0 | 0 | 66 | $0.0001 | 0 | 0 | 0 |
