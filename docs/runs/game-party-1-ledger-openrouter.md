# Game party 1 — the OpenRouter ledger

Cap $400; spent before this run $0.0000; this run $36.6166; total $36.6166; 357 calls.

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
