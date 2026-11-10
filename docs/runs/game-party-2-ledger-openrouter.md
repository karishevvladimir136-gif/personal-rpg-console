# Game party 2 — the OpenRouter ledger

Cap $240; spent before this run $0.0000; this run $235.0355; total $235.0355; 5321 calls.

| Session | Purpose | Model | Calls | Input (uncached) | Cache read | Cache write | Output | USD | Errors | Refusals | 429 waits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| freeze S1 | wizard | anthropic/claude-opus-5.5 | 2 | 5945 | 0 | 1567 | 5435 | $0.1403 | 0 | 0 | 0 |
| freeze S2 | wizard | anthropic/claude-opus-5.5 | 2 | 5914 | 1567 | 0 | 5861 | $0.1412 | 0 | 0 | 0 |
| freeze S3 | wizard | anthropic/claude-opus-5.5 | 2 | 5951 | 1567 | 0 | 6185 | $0.1478 | 0 | 0 | 0 |
| freeze S1 | prep | anthropic/claude-opus-5.5 | 2 | 14690 | 17854 | 17854 | 25050 | $0.7062 | 0 | 0 | 0 |
| freeze S2 | prep | anthropic/claude-opus-5.5 | 1 | 7303 | 8814 | 9074 | 11080 | $0.3252 | 0 | 0 | 0 |
| freeze S3 | prep | anthropic/claude-opus-5.5 | 2 | 14958 | 26689 | 9061 | 21198 | $0.5616 | 0 | 0 | 0 |
| S1-none-haiku | relay opening | anthropic/claude-sonnet-5.5 | 1 | 1291 | 0 | 0 | 1329 | $0.0159 | 0 | 0 | 0 |
| S1-none-haiku/Pell | player r1 | anthropic/claude-haiku-5.5 | 1 | 4 | 0 | 10964 | 495 | $0.0016 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Pell r1 | anthropic/claude-haiku-5.5 | 1 | 1744 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku/Bram | player r1 | anthropic/claude-haiku-5.5 | 1 | 4 | 0 | 10866 | 645 | $0.0017 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Bram r1 | anthropic/claude-haiku-5.5 | 1 | 1831 | 0 | 0 | 74 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku/Sefa | player r1 | anthropic/claude-haiku-5.5 | 1 | 4 | 0 | 11255 | 536 | $0.0017 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Sefa r1 | anthropic/claude-haiku-5.5 | 1 | 1934 | 0 | 0 | 79 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku | dm r1 | anthropic/claude-haiku-5.5 | 4 | 2572 | 49092 | 101926 | 10116 | $0.0216 | 0 | 0 | 0 |
| S1-none-haiku | relay r1 | anthropic/claude-sonnet-5.5 | 1 | 2433 | 0 | 0 | 2371 | $0.0286 | 0 | 0 | 0 |
| S1-none-haiku | relay r1 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3307 | 0 | 0 | 751 | $0.0141 | 0 | 0 | 0 |
| S1-none-haiku | relay r1 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3333 | 0 | 0 | 757 | $0.0142 | 0 | 0 | 0 |
| S1-none-haiku | relay r1 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3295 | 0 | 0 | 730 | $0.0139 | 0 | 0 | 0 |
| S1-none-haiku/Bram | player r2 | anthropic/claude-haiku-5.5 | 1 | 4 | 10866 | 1164 | 793 | $0.0007 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Bram r2 | anthropic/claude-haiku-5.5 | 1 | 1489 | 0 | 0 | 71 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku/Sefa | player r2 | anthropic/claude-haiku-5.5 | 1 | 4 | 11255 | 1064 | 712 | $0.0006 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Sefa r2 | anthropic/claude-haiku-5.5 | 1 | 1434 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku/Pell | player r2 | anthropic/claude-haiku-5.5 | 1 | 4 | 10964 | 1045 | 986 | $0.0007 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Pell r2 | anthropic/claude-haiku-5.5 | 1 | 1354 | 0 | 0 | 78 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku | dm r2 | anthropic/claude-haiku-5.5 | 1 | 4 | 19265 | 31495 | 3022 | $0.0058 | 0 | 0 | 0 |
| S1-none-haiku | relay r2 card | anthropic/claude-sonnet-5.5 | 1 | 2220 | 0 | 0 | 735 | $0.0118 | 0 | 0 | 0 |
| S1-none-haiku | relay r2 card (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 2968 | 0 | 0 | 582 | $0.0118 | 0 | 0 | 0 |
| S1-none-haiku/Pell | player r2 card 1 | anthropic/claude-haiku-5.5 | 2 | 8 | 25728 | 1159 | 1047 | $0.0009 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Pell r2 card | anthropic/claude-haiku-5.5 | 4 | 3822 | 0 | 0 | 301 | $0.0005 | 0 | 0 | 0 |
| S1-none-haiku | dm r2 card prose | anthropic/claude-haiku-5.5 | 2 | 33287 | 20002 | 20002 | 1922 | $0.0085 | 0 | 0 | 0 |
| S1-none-haiku/Pell | player r2 card 2 | anthropic/claude-haiku-5.5 | 2 | 8 | 26887 | 1393 | 905 | $0.0009 | 0 | 0 | 0 |
| S1-none-haiku | dm r2 card prose (with a press) | anthropic/claude-haiku-5.5 | 1 | 17115 | 20002 | 0 | 964 | $0.0024 | 0 | 0 | 0 |
| S1-none-haiku | dm r2 onward | anthropic/claude-haiku-5.5 | 5 | 3646 | 124743 | 37771 | 4886 | $0.0088 | 0 | 0 | 0 |
| S1-none-haiku | relay r2 | anthropic/claude-sonnet-5.5 | 1 | 3183 | 0 | 0 | 1808 | $0.0244 | 0 | 0 | 0 |
| S1-none-haiku/Sefa | player r3 | anthropic/claude-haiku-5.5 | 1 | 4 | 12319 | 1080 | 775 | $0.0006 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Sefa r3 | anthropic/claude-haiku-5.5 | 1 | 1416 | 0 | 0 | 84 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku/Pell | player r3 | anthropic/claude-haiku-5.5 | 1 | 4 | 14561 | 606 | 785 | $0.0006 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Pell r3 | anthropic/claude-haiku-5.5 | 1 | 930 | 0 | 0 | 76 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku/Bram | player r3 | anthropic/claude-haiku-5.5 | 1 | 4 | 12030 | 1030 | 650 | $0.0006 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Bram r3 | anthropic/claude-haiku-5.5 | 1 | 1341 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku | dm r3 | anthropic/claude-haiku-5.5 | 1 | 4 | 20795 | 33458 | 4842 | $0.0069 | 0 | 0 | 0 |
| S1-none-haiku | relay r3 card | anthropic/claude-sonnet-5.5 | 1 | 2257 | 0 | 0 | 799 | $0.0125 | 0 | 0 | 0 |
| S1-none-haiku | relay r3 card (asked again) | anthropic/claude-sonnet-5.5 | 1 | 2257 | 0 | 0 | 702 | $0.0115 | 0 | 0 | 0 |
| S1-none-haiku/Pell | player r3 card 1 | anthropic/claude-haiku-5.5 | 2 | 8 | 31051 | 1078 | 1425 | $0.0012 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Pell r3 card | anthropic/claude-haiku-5.5 | 3 | 2557 | 0 | 0 | 181 | $0.0003 | 0 | 0 | 0 |
| S1-none-haiku | dm r3 card prose (with a press) | anthropic/claude-haiku-5.5 | 1 | 17457 | 20002 | 1673 | 476 | $0.0025 | 0 | 0 | 0 |
| S1-none-haiku | dm r3 card prose | anthropic/claude-haiku-5.5 | 1 | 18171 | 21675 | 0 | 1104 | $0.0026 | 0 | 0 | 0 |
| S1-none-haiku/Pell | player r3 card 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 16245 | 799 | 182 | $0.0004 | 0 | 0 | 0 |
| S1-none-haiku | dm r3 onward | anthropic/claude-haiku-5.5 | 6 | 6651 | 130208 | 42365 | 7628 | $0.0111 | 0 | 0 | 0 |
| S1-none-haiku | relay r3 | anthropic/claude-sonnet-5.5 | 1 | 3072 | 0 | 0 | 2501 | $0.0312 | 0 | 0 | 0 |
| S1-none-haiku | relay r3 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4084 | 0 | 0 | 864 | $0.0168 | 0 | 0 | 0 |
| S1-none-haiku | relay r3 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3866 | 0 | 0 | 633 | $0.0141 | 0 | 0 | 0 |
| S1-none-haiku/Sefa | player r4 | anthropic/claude-haiku-5.5 | 1 | 4 | 13399 | 1243 | 985 | $0.0008 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Sefa r4 | anthropic/claude-haiku-5.5 | 1 | 1586 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku/Bram | player r4 | anthropic/claude-haiku-5.5 | 1 | 4 | 13060 | 1258 | 490 | $0.0005 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Bram r4 | anthropic/claude-haiku-5.5 | 1 | 1525 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku | dm r4 | anthropic/claude-haiku-5.5 | 2 | 8 | 46753 | 69909 | 2668 | $0.0108 | 0 | 0 | 0 |
| S1-none-haiku | relay r4 card | anthropic/claude-sonnet-5.5 | 2 | 3021 | 0 | 0 | 818 | $0.0142 | 0 | 0 | 0 |
| S1-none-haiku/Sefa | player r4 card 1 | anthropic/claude-haiku-5.5 | 2 | 8 | 30201 | 1118 | 413 | $0.0006 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Sefa r4 card | anthropic/claude-haiku-5.5 | 2 | 1523 | 0 | 0 | 130 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku | dm r4 card prose (with a press) | anthropic/claude-haiku-5.5 | 3 | 56596 | 68659 | 3105 | 2356 | $0.0081 | 0 | 0 | 0 |
| S1-none-haiku | dm r4 onward | anthropic/claude-haiku-5.5 | 9 | 6677 | 215356 | 74380 | 8490 | $0.0164 | 0 | 0 | 0 |
| S1-none-haiku | relay r4 | anthropic/claude-sonnet-5.5 | 2 | 4306 | 0 | 0 | 1261 | $0.0212 | 0 | 0 | 0 |
| S1-none-haiku | relay r4 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3191 | 0 | 0 | 481 | $0.0112 | 0 | 0 | 0 |
| S1-none-haiku/Pell | player r4 | anthropic/claude-haiku-5.5 | 1 | 4 | 17044 | 648 | 525 | $0.0005 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Pell r4 | anthropic/claude-haiku-5.5 | 1 | 1226 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku/Pell | player r4 card 1 | anthropic/claude-haiku-5.5 | 2 | 8 | 36025 | 841 | 772 | $0.0009 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Pell r4 card | anthropic/claude-haiku-5.5 | 2 | 1602 | 0 | 0 | 118 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku/Bram | player r5 | anthropic/claude-haiku-5.5 | 1 | 4 | 14318 | 818 | 714 | $0.0006 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Bram r5 | anthropic/claude-haiku-5.5 | 1 | 1201 | 0 | 0 | 74 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku/Sefa | player r5 | anthropic/claude-haiku-5.5 | 1 | 4 | 15760 | 548 | 856 | $0.0007 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Sefa r5 | anthropic/claude-haiku-5.5 | 1 | 1036 | 0 | 0 | 67 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku | dm r5 | anthropic/claude-haiku-5.5 | 8 | 8376 | 155568 | 144460 | 21308 | $0.0313 | 0 | 0 | 0 |
| S1-none-haiku | relay r5 | anthropic/claude-sonnet-5.5 | 2 | 4119 | 0 | 0 | 2565 | $0.0339 | 0 | 0 | 0 |
| S1-none-haiku | relay r5 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3634 | 0 | 0 | 970 | $0.0170 | 0 | 0 | 0 |
| S1-none-haiku | relay r5 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3640 | 0 | 0 | 969 | $0.0170 | 0 | 0 | 0 |
| S1-none-haiku/Pell | player r5 | anthropic/claude-haiku-5.5 | 1 | 4 | 18533 | 677 | 899 | $0.0007 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Pell r5 | anthropic/claude-haiku-5.5 | 1 | 816 | 0 | 0 | 79 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku/Sefa | player r6 | anthropic/claude-haiku-5.5 | 1 | 4 | 16308 | 1340 | 743 | $0.0007 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Sefa r6 | anthropic/claude-haiku-5.5 | 1 | 1628 | 0 | 0 | 78 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku/Bram | player r6 | anthropic/claude-haiku-5.5 | 1 | 4 | 15136 | 1348 | 616 | $0.0006 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Bram r6 | anthropic/claude-haiku-5.5 | 1 | 1580 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku | dm r6 | anthropic/claude-haiku-5.5 | 2 | 8 | 56536 | 72784 | 6338 | $0.0130 | 0 | 0 | 0 |
| S1-none-haiku | relay r6 card | anthropic/claude-sonnet-5.5 | 2 | 3095 | 0 | 0 | 773 | $0.0139 | 0 | 0 | 0 |
| S1-none-haiku | relay r6 card (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 2551 | 0 | 0 | 544 | $0.0105 | 0 | 0 | 0 |
| S1-none-haiku/Sefa | player r6 card 1 | anthropic/claude-haiku-5.5 | 2 | 8 | 36266 | 1150 | 667 | $0.0008 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Sefa r6 card | anthropic/claude-haiku-5.5 | 3 | 2311 | 0 | 0 | 204 | $0.0003 | 0 | 0 | 0 |
| S1-none-haiku | dm r6 card prose (with a press) | anthropic/claude-haiku-5.5 | 2 | 38996 | 52621 | 4205 | 1597 | $0.0061 | 0 | 0 | 0 |
| S1-none-haiku | dm r6 card prose | anthropic/claude-haiku-5.5 | 1 | 19543 | 27841 | 0 | 774 | $0.0026 | 0 | 0 | 0 |
| S1-none-haiku/Sefa | player r6 card 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 18798 | 541 | 7 | $0.0003 | 0 | 0 | 0 |
| S1-none-haiku | dm r6 onward | anthropic/claude-haiku-5.5 | 9 | 6593 | 238832 | 76822 | 13468 | $0.0194 | 0 | 0 | 0 |
| S1-none-haiku | relay r6 | anthropic/claude-sonnet-5.5 | 2 | 4324 | 0 | 0 | 1643 | $0.0251 | 0 | 0 | 0 |
| S1-none-haiku | relay r6 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3295 | 0 | 0 | 578 | $0.0124 | 0 | 0 | 0 |
| S1-none-haiku/Pell | player r6 | anthropic/claude-haiku-5.5 | 1 | 4 | 19210 | 686 | 571 | $0.0006 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Pell r6 | anthropic/claude-haiku-5.5 | 1 | 1063 | 0 | 0 | 80 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku/Pell | player r6 card 1 | anthropic/claude-haiku-5.5 | 2 | 8 | 40250 | 649 | 333 | $0.0007 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Pell r6 card | anthropic/claude-haiku-5.5 | 2 | 1316 | 0 | 0 | 119 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku/Bram | player r7 | anthropic/claude-haiku-5.5 | 1 | 4 | 16484 | 896 | 507 | $0.0005 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Bram r7 | anthropic/claude-haiku-5.5 | 1 | 1185 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku/Sefa | player r7 | anthropic/claude-haiku-5.5 | 1 | 4 | 19339 | 430 | 287 | $0.0004 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Sefa r7 | anthropic/claude-haiku-5.5 | 1 | 1025 | 0 | 0 | 81 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku | dm r7 | anthropic/claude-haiku-5.5 | 12 | 9166 | 352976 | 149126 | 20092 | $0.0333 | 0 | 0 | 0 |
| S1-none-haiku | relay r7 | anthropic/claude-sonnet-5.5 | 2 | 3431 | 0 | 0 | 2019 | $0.0271 | 0 | 0 | 0 |
| S1-none-haiku | relay r7 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 2735 | 0 | 0 | 645 | $0.0119 | 0 | 0 | 0 |
| S1-none-haiku | relay r7 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 2810 | 0 | 0 | 698 | $0.0126 | 0 | 0 | 0 |
| S1-none-haiku | relay r7 (Sefa's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 2791 | 0 | 0 | 710 | $0.0127 | 0 | 0 | 0 |
| S1-none-haiku/Pell | player r7 | anthropic/claude-haiku-5.5 | 1 | 4 | 20545 | 799 | 664 | $0.0006 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Pell r7 | anthropic/claude-haiku-5.5 | 1 | 1007 | 0 | 0 | 75 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku/Bram | after 1 | anthropic/claude-haiku-5.5 | 1 | 4 | 17380 | 948 | 650 | $0.0006 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Bram after 1 | anthropic/claude-haiku-5.5 | 1 | 608 | 0 | 0 | 72 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku/Bram | after 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 18328 | 303 | 818 | $0.0006 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Bram after 2 | anthropic/claude-haiku-5.5 | 1 | 676 | 0 | 0 | 74 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku/Bram | after 3 | anthropic/claude-haiku-5.5 | 1 | 4 | 18631 | 358 | 543 | $0.0005 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Bram after 3 | anthropic/claude-haiku-5.5 | 1 | 577 | 0 | 0 | 66 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku/Sefa | after 1 | anthropic/claude-haiku-5.5 | 1 | 4 | 19769 | 1005 | 559 | $0.0006 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Sefa after 1 | anthropic/claude-haiku-5.5 | 1 | 651 | 0 | 0 | 76 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku/Sefa | after 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 20774 | 346 | 811 | $0.0007 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Sefa after 2 | anthropic/claude-haiku-5.5 | 1 | 690 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku/Sefa | after 3 | anthropic/claude-haiku-5.5 | 1 | 4 | 21120 | 372 | 371 | $0.0004 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Sefa after 3 | anthropic/claude-haiku-5.5 | 1 | 459 | 0 | 0 | 61 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku/Pell | after 1 | anthropic/claude-haiku-5.5 | 1 | 4 | 21344 | 733 | 319 | $0.0005 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Pell after 1 | anthropic/claude-haiku-5.5 | 1 | 443 | 0 | 0 | 67 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku/Pell | after 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 22077 | 138 | 393 | $0.0004 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Pell after 2 | anthropic/claude-haiku-5.5 | 1 | 509 | 0 | 0 | 68 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku/Pell | after 3 | anthropic/claude-haiku-5.5 | 1 | 4 | 22215 | 191 | 517 | $0.0005 | 0 | 0 | 0 |
| S1-none-haiku/check | check S1-none-haiku Pell after 3 | anthropic/claude-haiku-5.5 | 1 | 524 | 0 | 0 | 61 | $0.0001 | 0 | 0 | 0 |
| S2-high-haiku | relay opening | anthropic/claude-sonnet-5.5 | 1 | 1324 | 0 | 0 | 1397 | $0.0166 | 0 | 0 | 0 |
| S2-high-haiku/Sefa | player r1 | anthropic/claude-haiku-5.5 | 1 | 4 | 0 | 11247 | 527 | $0.0017 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Sefa r1 | anthropic/claude-haiku-5.5 | 1 | 1902 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| S2-high-haiku/Pell | player r1 | anthropic/claude-haiku-5.5 | 1 | 4 | 0 | 10957 | 473 | $0.0016 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Pell r1 | anthropic/claude-haiku-5.5 | 1 | 1732 | 0 | 0 | 77 | $0.0002 | 0 | 0 | 0 |
| S2-high-haiku/Bram | player r1 | anthropic/claude-haiku-5.5 | 1 | 4 | 0 | 10859 | 494 | $0.0016 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Bram r1 | anthropic/claude-haiku-5.5 | 1 | 1672 | 0 | 0 | 61 | $0.0002 | 0 | 0 | 0 |
| S2-high-haiku | dm r1 | anthropic/claude-haiku-5.5 | 6 | 4251 | 126946 | 70002 | 6977 | $0.0146 | 0 | 0 | 0 |
| S2-high-haiku | relay r1 | anthropic/claude-sonnet-5.5 | 1 | 2167 | 0 | 0 | 2550 | $0.0298 | 0 | 0 | 0 |
| S2-high-haiku | relay r1 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3134 | 0 | 0 | 842 | $0.0147 | 0 | 0 | 0 |
| S2-high-haiku | relay r1 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3151 | 0 | 0 | 857 | $0.0149 | 0 | 0 | 0 |
| S2-high-haiku/Pell | player r2 | anthropic/claude-haiku-5.5 | 1 | 4 | 10957 | 1048 | 763 | $0.0006 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Pell r2 | anthropic/claude-haiku-5.5 | 1 | 1480 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| S2-high-haiku/Bram | player r2 | anthropic/claude-haiku-5.5 | 1 | 4 | 10859 | 1032 | 508 | $0.0005 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Bram r2 | anthropic/claude-haiku-5.5 | 1 | 1372 | 0 | 0 | 81 | $0.0002 | 0 | 0 | 0 |
| S2-high-haiku/Sefa | player r2 | anthropic/claude-haiku-5.5 | 1 | 4 | 11247 | 994 | 1080 | $0.0008 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Sefa r2 | anthropic/claude-haiku-5.5 | 1 | 1498 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| S2-high-haiku | dm r2 | anthropic/claude-haiku-5.5 | 5 | 3347 | 143346 | 76759 | 16607 | $0.0198 | 0 | 0 | 0 |
| S2-high-haiku | relay r2 | anthropic/claude-sonnet-5.5 | 1 | 2852 | 0 | 0 | 2709 | $0.0328 | 0 | 0 | 0 |
| S2-high-haiku | relay r2 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3929 | 0 | 0 | 930 | $0.0172 | 0 | 0 | 0 |
| S2-high-haiku | relay r2 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3826 | 0 | 0 | 824 | $0.0159 | 0 | 0 | 0 |
| S2-high-haiku/Sefa | player r3 | anthropic/claude-haiku-5.5 | 1 | 4 | 12241 | 1304 | 1171 | $0.0009 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Sefa r3 | anthropic/claude-haiku-5.5 | 1 | 1576 | 0 | 0 | 77 | $0.0002 | 0 | 0 | 0 |
| S2-high-haiku/Bram | player r3 | anthropic/claude-haiku-5.5 | 1 | 4 | 11891 | 1187 | 744 | $0.0006 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Bram r3 | anthropic/claude-haiku-5.5 | 1 | 1496 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| S2-high-haiku | dm r3 | anthropic/claude-haiku-5.5 | 9 | 8747 | 232690 | 116383 | 21488 | $0.0288 | 0 | 0 | 0 |
| S2-high-haiku | relay r3 | anthropic/claude-sonnet-5.5 | 2 | 4227 | 0 | 0 | 2432 | $0.0328 | 0 | 0 | 0 |
| S2-high-haiku/Pell | player r3 | anthropic/claude-haiku-5.5 | 1 | 4 | 12005 | 1217 | 961 | $0.0008 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Pell r3 | anthropic/claude-haiku-5.5 | 1 | 1616 | 0 | 0 | 77 | $0.0002 | 0 | 0 | 0 |
| S2-high-haiku | relay r3 card | anthropic/claude-sonnet-5.5 | 1 | 1410 | 0 | 0 | 143 | $0.0043 | 0 | 0 | 0 |
| S2-high-haiku/Pell | player r3 card 1 | anthropic/claude-haiku-5.5 | 2 | 8 | 27073 | 830 | 338 | $0.0005 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Pell r3 card | anthropic/claude-haiku-5.5 | 2 | 1043 | 0 | 0 | 118 | $0.0002 | 0 | 0 | 0 |
| S2-high-haiku | dm r3 onward | anthropic/claude-haiku-5.5 | 7 | 6248 | 189615 | 38664 | 5802 | $0.0103 | 0 | 0 | 0 |
| S2-high-haiku/Bram | player r4 | anthropic/claude-haiku-5.5 | 1 | 4 | 13078 | 1391 | 905 | $0.0008 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Bram r4 | anthropic/claude-haiku-5.5 | 1 | 1865 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| S2-high-haiku/Sefa | player r4 | anthropic/claude-haiku-5.5 | 1 | 4 | 13545 | 1403 | 1013 | $0.0008 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Sefa r4 | anthropic/claude-haiku-5.5 | 1 | 1898 | 0 | 0 | 74 | $0.0002 | 0 | 0 | 0 |
| S2-high-haiku | dm r4 | anthropic/claude-haiku-5.5 | 12 | 8717 | 329442 | 150505 | 20039 | $0.0332 | 0 | 0 | 0 |
| S2-high-haiku | relay r4 | anthropic/claude-sonnet-5.5 | 2 | 4101 | 0 | 0 | 2216 | $0.0304 | 0 | 0 | 0 |
| S2-high-haiku | relay r4 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3196 | 0 | 0 | 569 | $0.0121 | 0 | 0 | 0 |
| S2-high-haiku | relay r4 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3536 | 0 | 0 | 911 | $0.0162 | 0 | 0 | 0 |
| S2-high-haiku | relay r4 (Sefa's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 3528 | 0 | 0 | 909 | $0.0161 | 0 | 0 | 0 |
| S2-high-haiku/Pell | player r4 | anthropic/claude-haiku-5.5 | 1 | 4 | 14052 | 393 | 406 | $0.0004 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Pell r4 | anthropic/claude-haiku-5.5 | 1 | 1107 | 0 | 0 | 67 | $0.0001 | 0 | 0 | 0 |
| S2-high-haiku/Sefa | player r5 | anthropic/claude-haiku-5.5 | 1 | 4 | 14948 | 1504 | 1272 | $0.0010 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Sefa r5 | anthropic/claude-haiku-5.5 | 1 | 1787 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| S2-high-haiku/Bram | player r5 | anthropic/claude-haiku-5.5 | 1 | 4 | 14469 | 981 | 488 | $0.0005 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Bram r5 | anthropic/claude-haiku-5.5 | 1 | 1235 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| S2-high-haiku | dm r5 | anthropic/claude-haiku-5.5 | 2 | 8 | 53882 | 75412 | 8384 | $0.0143 | 0 | 0 | 0 |
| S2-high-haiku | relay r5 card | anthropic/claude-sonnet-5.5 | 2 | 3473 | 0 | 0 | 823 | $0.0152 | 0 | 0 | 0 |
| S2-high-haiku | relay r5 card (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 2710 | 0 | 0 | 490 | $0.0103 | 0 | 0 | 0 |
| S2-high-haiku/Sefa | player r5 card 1 | anthropic/claude-haiku-5.5 | 4 | 16 | 70181 | 1948 | 1414 | $0.0017 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Sefa r5 card | anthropic/claude-haiku-5.5 | 5 | 3744 | 0 | 0 | 363 | $0.0006 | 0 | 0 | 0 |
| S2-high-haiku | dm r5 card prose (with a press) | anthropic/claude-haiku-5.5 | 4 | 80401 | 89094 | 17122 | 2596 | $0.0137 | 0 | 0 | 0 |
| S2-high-haiku | dm r5 card prose | anthropic/claude-haiku-5.5 | 2 | 42337 | 53108 | 1565 | 2675 | $0.0064 | 0 | 0 | 0 |
| S2-high-haiku/Sefa | player r5 card 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 18400 | 724 | 480 | $0.0005 | 0 | 0 | 0 |
| S2-high-haiku | dm r5 onward | anthropic/claude-haiku-5.5 | 8 | 7533 | 177024 | 78855 | 8647 | $0.0167 | 0 | 0 | 0 |
| S2-high-haiku | relay r5 | anthropic/claude-sonnet-5.5 | 2 | 4746 | 0 | 0 | 1983 | $0.0293 | 0 | 0 | 0 |
| S2-high-haiku | relay r5 (asked again) | anthropic/claude-sonnet-5.5 | 1 | 2936 | 0 | 0 | 541 | $0.0113 | 0 | 0 | 0 |
| S2-high-haiku | relay r5 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3539 | 0 | 0 | 406 | $0.0111 | 0 | 0 | 0 |
| S2-high-haiku | relay r5 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 3509 | 0 | 0 | 408 | $0.0111 | 0 | 0 | 0 |
| S2-high-haiku/Pell | player r5 | anthropic/claude-haiku-5.5 | 1 | 4 | 14445 | 981 | 937 | $0.0007 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Pell r5 | anthropic/claude-haiku-5.5 | 1 | 1228 | 0 | 0 | 62 | $0.0002 | 0 | 0 | 0 |
| S2-high-haiku/Pell | player r5 card 1 | anthropic/claude-haiku-5.5 | 2 | 8 | 31491 | 847 | 1037 | $0.0009 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Pell r5 card | anthropic/claude-haiku-5.5 | 3 | 2293 | 0 | 0 | 187 | $0.0003 | 0 | 0 | 0 |
| S2-high-haiku/Pell | player r5 card 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 16273 | 832 | 198 | $0.0004 | 0 | 0 | 0 |
| S2-high-haiku/Bram | player r6 | anthropic/claude-haiku-5.5 | 1 | 4 | 15450 | 743 | 210 | $0.0004 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Bram r6 | anthropic/claude-haiku-5.5 | 1 | 956 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| S2-high-haiku/Sefa | player r6 | anthropic/claude-haiku-5.5 | 1 | 4 | 19124 | 84 | 963 | $0.0007 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Sefa r6 | anthropic/claude-haiku-5.5 | 1 | 676 | 0 | 0 | 67 | $0.0001 | 0 | 0 | 0 |
| S2-high-haiku | dm r6 | anthropic/claude-haiku-5.5 | 9 | 5185 | 280314 | 120169 | 11933 | $0.0245 | 0 | 0 | 0 |
| S2-high-haiku | relay r6 card | anthropic/claude-sonnet-5.5 | 1 | 1841 | 0 | 0 | 442 | $0.0081 | 0 | 0 | 0 |
| S2-high-haiku/Bram | player r6 card 1 | anthropic/claude-haiku-5.5 | 2 | 8 | 33344 | 913 | 381 | $0.0006 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Bram r6 card | anthropic/claude-haiku-5.5 | 3 | 2018 | 0 | 0 | 203 | $0.0003 | 0 | 0 | 0 |
| S2-high-haiku | dm r6 card prose | anthropic/claude-haiku-5.5 | 1 | 21194 | 28119 | 785 | 91 | $0.0026 | 0 | 0 | 0 |
| S2-high-haiku/Bram | player r6 card 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 16880 | 271 | 9 | $0.0002 | 0 | 0 | 0 |
| S2-high-haiku | dm r6 card prose (with a press) | anthropic/claude-haiku-5.5 | 1 | 21504 | 28904 | 0 | 878 | $0.0029 | 0 | 0 | 0 |
| S2-high-haiku | dm r6 onward | anthropic/claude-haiku-5.5 | 3 | 2531 | 91442 | 40017 | 2238 | $0.0073 | 0 | 0 | 0 |
| S2-high-haiku | relay r6 | anthropic/claude-sonnet-5.5 | 2 | 4192 | 0 | 0 | 1118 | $0.0196 | 0 | 0 | 0 |
| S2-high-haiku/Pell | player r6 | anthropic/claude-haiku-5.5 | 1 | 4 | 17105 | 318 | 984 | $0.0007 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Pell r6 | anthropic/claude-haiku-5.5 | 1 | 1045 | 0 | 0 | 69 | $0.0001 | 0 | 0 | 0 |
| S2-high-haiku/Sefa | player r7 | anthropic/claude-haiku-5.5 | 1 | 4 | 19208 | 696 | 881 | $0.0007 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Sefa r7 | anthropic/claude-haiku-5.5 | 1 | 1130 | 0 | 0 | 77 | $0.0002 | 0 | 0 | 0 |
| S2-high-haiku/Bram | player r7 | anthropic/claude-haiku-5.5 | 1 | 4 | 17377 | 139 | 300 | $0.0003 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Bram r7 | anthropic/claude-haiku-5.5 | 1 | 482 | 0 | 0 | 62 | $0.0001 | 0 | 0 | 0 |
| S2-high-haiku | dm r7 | anthropic/claude-haiku-5.5 | 9 | 5961 | 258442 | 148141 | 11531 | $0.0276 | 0 | 0 | 0 |
| S2-high-haiku | relay r7 | anthropic/claude-sonnet-5.5 | 2 | 3694 | 0 | 0 | 1760 | $0.0250 | 0 | 0 | 0 |
| S2-high-haiku | relay r7 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 2298 | 0 | 0 | 356 | $0.0082 | 0 | 0 | 0 |
| S2-high-haiku | relay r7 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 2501 | 0 | 0 | 526 | $0.0103 | 0 | 0 | 0 |
| S2-high-haiku | relay r7 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 2482 | 0 | 0 | 528 | $0.0102 | 0 | 0 | 0 |
| S2-high-haiku/Pell | player r7 | anthropic/claude-haiku-5.5 | 1 | 4 | 17423 | 1000 | 473 | $0.0005 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Pell r7 | anthropic/claude-haiku-5.5 | 1 | 1195 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| S2-high-haiku/Bram | after 1 | anthropic/claude-haiku-5.5 | 1 | 4 | 17516 | 684 | 403 | $0.0005 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Bram after 1 | anthropic/claude-haiku-5.5 | 1 | 557 | 0 | 0 | 72 | $0.0001 | 0 | 0 | 0 |
| S2-high-haiku/Bram | after 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 18200 | 252 | 491 | $0.0005 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Bram after 2 | anthropic/claude-haiku-5.5 | 1 | 591 | 0 | 0 | 72 | $0.0001 | 0 | 0 | 0 |
| S2-high-haiku/Bram | after 3 | anthropic/claude-haiku-5.5 | 1 | 4 | 18452 | 273 | 258 | $0.0003 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Bram after 3 | anthropic/claude-haiku-5.5 | 1 | 458 | 0 | 0 | 59 | $0.0001 | 0 | 0 | 0 |
| S2-high-haiku/Bram | after 4 | anthropic/claude-haiku-5.5 | 1 | 4 | 18725 | 149 | 261 | $0.0003 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Bram after 4 | anthropic/claude-haiku-5.5 | 1 | 596 | 0 | 0 | 79 | $0.0001 | 0 | 0 | 0 |
| S2-high-haiku/Sefa | after 1 | anthropic/claude-haiku-5.5 | 1 | 4 | 19904 | 819 | 353 | $0.0005 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Sefa after 1 | anthropic/claude-haiku-5.5 | 1 | 507 | 0 | 0 | 63 | $0.0001 | 0 | 0 | 0 |
| S2-high-haiku/Sefa | after 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 20723 | 202 | 569 | $0.0005 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Sefa after 2 | anthropic/claude-haiku-5.5 | 1 | 515 | 0 | 0 | 86 | $0.0001 | 0 | 0 | 0 |
| S2-high-haiku/Sefa | after 3 | anthropic/claude-haiku-5.5 | 1 | 4 | 20925 | 197 | 335 | $0.0004 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Sefa after 3 | anthropic/claude-haiku-5.5 | 1 | 482 | 0 | 0 | 70 | $0.0001 | 0 | 0 | 0 |
| S2-high-haiku/Pell | after 1 | anthropic/claude-haiku-5.5 | 1 | 4 | 18423 | 1018 | 614 | $0.0006 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Pell after 1 | anthropic/claude-haiku-5.5 | 1 | 672 | 0 | 0 | 64 | $0.0001 | 0 | 0 | 0 |
| S2-high-haiku/Pell | after 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 19441 | 367 | 487 | $0.0005 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Pell after 2 | anthropic/claude-haiku-5.5 | 1 | 553 | 0 | 0 | 81 | $0.0001 | 0 | 0 | 0 |
| S2-high-haiku/Pell | after 3 | anthropic/claude-haiku-5.5 | 1 | 4 | 19808 | 235 | 368 | $0.0004 | 0 | 0 | 0 |
| S2-high-haiku/check | check S2-high-haiku Pell after 3 | anthropic/claude-haiku-5.5 | 1 | 508 | 0 | 0 | 62 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku2 | relay opening | anthropic/claude-sonnet-5.5 | 1 | 1291 | 0 | 0 | 1314 | $0.0157 | 0 | 0 | 0 |
| S1-none-haiku2/Pell | player r1 | anthropic/claude-haiku-5.5 | 1 | 4 | 0 | 10959 | 663 | $0.0017 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Pell r1 | anthropic/claude-haiku-5.5 | 1 | 1842 | 0 | 0 | 74 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku2/Bram | player r1 | anthropic/claude-haiku-5.5 | 1 | 4 | 0 | 10861 | 569 | $0.0016 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Bram r1 | anthropic/claude-haiku-5.5 | 1 | 1706 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku2/Sefa | player r1 | anthropic/claude-haiku-5.5 | 1 | 4 | 0 | 11250 | 522 | $0.0017 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Sefa r1 | anthropic/claude-haiku-5.5 | 1 | 1891 | 0 | 0 | 76 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku2 | dm r1 | anthropic/claude-haiku-5.5 | 3 | 1918 | 65301 | 31168 | 7217 | $0.0083 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r1 card | anthropic/claude-sonnet-5.5 | 1 | 2584 | 0 | 0 | 1033 | $0.0155 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r1 card (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3604 | 0 | 0 | 891 | $0.0161 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r1 card (Pell's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 3604 | 0 | 0 | 1028 | $0.0175 | 0 | 0 | 0 |
| S1-none-haiku2/Pell | player r1 card 1 | anthropic/claude-haiku-5.5 | 2 | 8 | 23239 | 1564 | 1075 | $0.0010 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Pell r1 card | anthropic/claude-haiku-5.5 | 3 | 2820 | 0 | 0 | 188 | $0.0004 | 0 | 0 | 0 |
| S1-none-haiku2 | dm r1 card prose (with a press) | anthropic/claude-haiku-5.5 | 1 | 14867 | 18038 | 434 | 660 | $0.0021 | 0 | 0 | 0 |
| S1-none-haiku2 | dm r1 card prose | anthropic/claude-haiku-5.5 | 1 | 15603 | 18472 | 0 | 946 | $0.0022 | 0 | 0 | 0 |
| S1-none-haiku2/Pell | player r1 card 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 12523 | 666 | 428 | $0.0004 | 0 | 0 | 0 |
| S1-none-haiku2 | dm r1 onward | anthropic/claude-haiku-5.5 | 4 | 3258 | 121814 | 37609 | 7764 | $0.0101 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r1 | anthropic/claude-sonnet-5.5 | 1 | 3953 | 0 | 0 | 2221 | $0.0301 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r1 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4927 | 0 | 0 | 835 | $0.0182 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r1 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5014 | 0 | 0 | 928 | $0.0193 | 0 | 0 | 0 |
| S1-none-haiku2/Bram | player r2 | anthropic/claude-haiku-5.5 | 1 | 4 | 10861 | 1130 | 580 | $0.0005 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Bram r2 | anthropic/claude-haiku-5.5 | 1 | 1491 | 0 | 0 | 77 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku2/Sefa | player r2 | anthropic/claude-haiku-5.5 | 1 | 4 | 11250 | 1234 | 858 | $0.0007 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Sefa r2 | anthropic/claude-haiku-5.5 | 1 | 1741 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku2/Pell | player r2 | anthropic/claude-haiku-5.5 | 1 | 4 | 13189 | 372 | 344 | $0.0004 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Pell r2 | anthropic/claude-haiku-5.5 | 1 | 1024 | 0 | 0 | 68 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku2 | dm r2 | anthropic/claude-haiku-5.5 | 4 | 2460 | 94322 | 70154 | 9759 | $0.0150 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r2 | anthropic/claude-sonnet-5.5 | 1 | 2578 | 0 | 0 | 1883 | $0.0240 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r2 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3342 | 0 | 0 | 606 | $0.0127 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r2 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3356 | 0 | 0 | 626 | $0.0130 | 0 | 0 | 0 |
| S1-none-haiku2/Sefa | player r3 | anthropic/claude-haiku-5.5 | 1 | 4 | 12484 | 1109 | 965 | $0.0007 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Sefa r3 | anthropic/claude-haiku-5.5 | 1 | 1284 | 0 | 0 | 76 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku2/Pell | player r3 | anthropic/claude-haiku-5.5 | 1 | 4 | 13561 | 880 | 336 | $0.0004 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Pell r3 | anthropic/claude-haiku-5.5 | 1 | 1187 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku2/Bram | player r3 | anthropic/claude-haiku-5.5 | 1 | 4 | 11991 | 930 | 938 | $0.0007 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Bram r3 | anthropic/claude-haiku-5.5 | 1 | 1344 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku2 | dm r3 | anthropic/claude-haiku-5.5 | 4 | 3547 | 95932 | 70407 | 16078 | $0.0183 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r3 | anthropic/claude-sonnet-5.5 | 1 | 3211 | 0 | 0 | 4164 | $0.0481 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r3 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4686 | 0 | 0 | 1352 | $0.0229 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r3 (Pell's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 4687 | 0 | 0 | 1356 | $0.0229 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r3 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4699 | 0 | 0 | 1360 | $0.0230 | 0 | 0 | 0 |
| S1-none-haiku2/Pell | player r4 | anthropic/claude-haiku-5.5 | 1 | 4 | 14441 | 1687 | 956 | $0.0008 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Pell r4 | anthropic/claude-haiku-5.5 | 1 | 1994 | 0 | 0 | 80 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku2/Bram | player r4 | anthropic/claude-haiku-5.5 | 1 | 4 | 12921 | 1789 | 1328 | $0.0010 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Bram r4 | anthropic/claude-haiku-5.5 | 1 | 2126 | 0 | 0 | 84 | $0.0003 | 0 | 0 | 0 |
| S1-none-haiku2/Sefa | player r4 | anthropic/claude-haiku-5.5 | 1 | 4 | 13593 | 1662 | 1421 | $0.0011 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Sefa r4 | anthropic/claude-haiku-5.5 | 1 | 2033 | 0 | 0 | 80 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku2 | dm r4 | anthropic/claude-haiku-5.5 | 4 | 3079 | 99202 | 77052 | 15166 | $0.0187 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r4 | anthropic/claude-sonnet-5.5 | 1 | 2828 | 0 | 0 | 3305 | $0.0387 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r4 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4025 | 0 | 0 | 1084 | $0.0189 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r4 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4012 | 0 | 0 | 1062 | $0.0186 | 0 | 0 | 0 |
| S1-none-haiku2/Bram | player r5 | anthropic/claude-haiku-5.5 | 1 | 4 | 14710 | 1525 | 701 | $0.0007 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Bram r5 | anthropic/claude-haiku-5.5 | 1 | 1733 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku2/Sefa | player r5 | anthropic/claude-haiku-5.5 | 1 | 4 | 15255 | 1455 | 547 | $0.0006 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Sefa r5 | anthropic/claude-haiku-5.5 | 1 | 1666 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku2/Pell | player r5 | anthropic/claude-haiku-5.5 | 1 | 4 | 16128 | 1374 | 763 | $0.0007 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Pell r5 | anthropic/claude-haiku-5.5 | 1 | 1740 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku2 | dm r5 | anthropic/claude-haiku-5.5 | 7 | 4877 | 229633 | 83013 | 13658 | $0.0201 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r5 | anthropic/claude-sonnet-5.5 | 1 | 2702 | 0 | 0 | 2325 | $0.0287 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r5 (asked again) | anthropic/claude-sonnet-5.5 | 1 | 2702 | 0 | 0 | 2505 | $0.0305 | 0 | 0 | 0 |
| S1-none-haiku2/Sefa | player r6 | anthropic/claude-haiku-5.5 | 1 | 4 | 16710 | 1083 | 1125 | $0.0009 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Sefa r6 | anthropic/claude-haiku-5.5 | 1 | 1577 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku2/Pell | player r6 | anthropic/claude-haiku-5.5 | 1 | 4 | 17502 | 1240 | 399 | $0.0005 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Pell r6 | anthropic/claude-haiku-5.5 | 1 | 1575 | 0 | 0 | 85 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku2/Bram | player r6 | anthropic/claude-haiku-5.5 | 1 | 4 | 16235 | 1128 | 950 | $0.0008 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Bram r6 | anthropic/claude-haiku-5.5 | 1 | 1479 | 0 | 0 | 71 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku2 | dm r6 | anthropic/claude-haiku-5.5 | 1 | 4 | 27354 | 35109 | 4726 | $0.0072 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r6 card | anthropic/claude-sonnet-5.5 | 1 | 2419 | 0 | 0 | 864 | $0.0135 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r6 card (asked again) | anthropic/claude-sonnet-5.5 | 1 | 2419 | 0 | 0 | 966 | $0.0145 | 0 | 0 | 0 |
| S1-none-haiku2/Bram | player r6 card 1 | anthropic/claude-haiku-5.5 | 2 | 8 | 35521 | 983 | 948 | $0.0010 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Bram r6 card | anthropic/claude-haiku-5.5 | 2 | 1525 | 0 | 0 | 120 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku2 | dm r6 card prose (with a press) | anthropic/claude-haiku-5.5 | 1 | 18748 | 18472 | 9888 | 1451 | $0.0048 | 0 | 0 | 0 |
| S1-none-haiku2 | dm r6 onward | anthropic/claude-haiku-5.5 | 4 | 4202 | 83841 | 39215 | 3210 | $0.0078 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r6 | anthropic/claude-sonnet-5.5 | 1 | 3051 | 0 | 0 | 1836 | $0.0245 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r6 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3940 | 0 | 0 | 737 | $0.0152 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r6 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3902 | 0 | 0 | 696 | $0.0148 | 0 | 0 | 0 |
| S1-none-haiku2/Pell | player r7 | anthropic/claude-haiku-5.5 | 1 | 4 | 18742 | 1101 | 539 | $0.0006 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Pell r7 | anthropic/claude-haiku-5.5 | 1 | 1313 | 0 | 0 | 82 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku2/Bram | player r7 | anthropic/claude-haiku-5.5 | 1 | 4 | 18346 | 535 | 315 | $0.0004 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Bram r7 | anthropic/claude-haiku-5.5 | 1 | 899 | 0 | 0 | 68 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku2/Sefa | player r7 | anthropic/claude-haiku-5.5 | 1 | 4 | 17793 | 1194 | 873 | $0.0008 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Sefa r7 | anthropic/claude-haiku-5.5 | 1 | 1579 | 0 | 0 | 95 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku2 | dm r7 | anthropic/claude-haiku-5.5 | 4 | 2963 | 106794 | 76378 | 11692 | $0.0169 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r7 | anthropic/claude-sonnet-5.5 | 1 | 2945 | 0 | 0 | 3002 | $0.0359 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r7 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4086 | 0 | 0 | 1006 | $0.0182 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r7 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4203 | 0 | 0 | 1097 | $0.0194 | 0 | 0 | 0 |
| S1-none-haiku2 | relay r7 (Sefa's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 4203 | 0 | 0 | 1109 | $0.0195 | 0 | 0 | 0 |
| S1-none-haiku2/Bram | after 1 | anthropic/claude-haiku-5.5 | 1 | 4 | 18881 | 1364 | 499 | $0.0006 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Bram after 1 | anthropic/claude-haiku-5.5 | 1 | 547 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku2/Bram | after 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 20245 | 242 | 444 | $0.0005 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Bram after 2 | anthropic/claude-haiku-5.5 | 1 | 532 | 0 | 0 | 65 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku2/Bram | after 3 | anthropic/claude-haiku-5.5 | 1 | 4 | 20487 | 214 | 358 | $0.0004 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Bram after 3 | anthropic/claude-haiku-5.5 | 1 | 515 | 0 | 0 | 65 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku2/Sefa | after 1 | anthropic/claude-haiku-5.5 | 1 | 4 | 18987 | 1632 | 980 | $0.0009 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Sefa after 1 | anthropic/claude-haiku-5.5 | 1 | 690 | 0 | 0 | 72 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku2/Sefa | after 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 20619 | 385 | 595 | $0.0006 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Sefa after 2 | anthropic/claude-haiku-5.5 | 1 | 555 | 0 | 0 | 72 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku2/Sefa | after 3 | anthropic/claude-haiku-5.5 | 1 | 4 | 21004 | 237 | 475 | $0.0005 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Sefa after 3 | anthropic/claude-haiku-5.5 | 1 | 559 | 0 | 0 | 68 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku2/Pell | after 1 | anthropic/claude-haiku-5.5 | 1 | 4 | 19843 | 1094 | 605 | $0.0006 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Pell after 1 | anthropic/claude-haiku-5.5 | 1 | 639 | 0 | 0 | 64 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku2/Pell | after 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 20937 | 334 | 573 | $0.0005 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Pell after 2 | anthropic/claude-haiku-5.5 | 1 | 656 | 0 | 0 | 79 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku2/Pell | after 3 | anthropic/claude-haiku-5.5 | 1 | 4 | 21271 | 338 | 381 | $0.0004 | 0 | 0 | 0 |
| S1-none-haiku2/check | check S1-none-haiku2 Pell after 3 | anthropic/claude-haiku-5.5 | 1 | 461 | 0 | 0 | 57 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku2/diagnosis | relay r5 diagnosis | anthropic/claude-sonnet-5.5 | 1 | 2702 | 0 | 0 | 2355 | $0.0290 | 0 | 0 | 0 |
| S1-none-haiku3 | relay opening | anthropic/claude-sonnet-5.5 | 1 | 1291 | 0 | 0 | 1329 | $0.0159 | 0 | 0 | 0 |
| S1-none-haiku3/Pell | player r1 | anthropic/claude-haiku-5.5 | 1 | 4 | 0 | 10964 | 702 | $0.0017 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Pell r1 | anthropic/claude-haiku-5.5 | 1 | 1819 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku3/Bram | player r1 | anthropic/claude-haiku-5.5 | 1 | 4 | 0 | 10866 | 614 | $0.0017 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Bram r1 | anthropic/claude-haiku-5.5 | 1 | 1786 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku3/Sefa | player r1 | anthropic/claude-haiku-5.5 | 1 | 4 | 0 | 11255 | 490 | $0.0017 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Sefa r1 | anthropic/claude-haiku-5.5 | 1 | 1869 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku3 | dm r1 | anthropic/claude-haiku-5.5 | 1 | 4 | 19265 | 26946 | 1905 | $0.0045 | 0 | 0 | 0 |
| S1-none-haiku3 | relay r1 card | anthropic/claude-sonnet-5.5 | 1 | 1858 | 0 | 0 | 503 | $0.0087 | 0 | 0 | 0 |
| S1-none-haiku3 | relay r1 card (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 2390 | 0 | 0 | 364 | $0.0084 | 0 | 0 | 0 |
| S1-none-haiku3/Pell | player r1 card 1 | anthropic/claude-haiku-5.5 | 2 | 8 | 22743 | 993 | 387 | $0.0005 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Pell r1 card | anthropic/claude-haiku-5.5 | 2 | 1296 | 0 | 0 | 125 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku3 | dm r1 onward | anthropic/claude-haiku-5.5 | 5 | 4178 | 116821 | 40062 | 14540 | $0.0139 | 0 | 0 | 0 |
| S1-none-haiku3 | relay r1 | anthropic/claude-sonnet-5.5 | 1 | 2701 | 0 | 0 | 1614 | $0.0215 | 0 | 0 | 0 |
| S1-none-haiku3/Bram | player r2 | anthropic/claude-haiku-5.5 | 1 | 4 | 10866 | 939 | 701 | $0.0006 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Bram r2 | anthropic/claude-haiku-5.5 | 1 | 1279 | 0 | 0 | 82 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku3/Sefa | player r2 | anthropic/claude-haiku-5.5 | 1 | 4 | 11255 | 882 | 579 | $0.0005 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Sefa r2 | anthropic/claude-haiku-5.5 | 1 | 1235 | 0 | 0 | 87 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku3/Pell | player r2 | anthropic/claude-haiku-5.5 | 1 | 4 | 11957 | 396 | 303 | $0.0003 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Pell r2 | anthropic/claude-haiku-5.5 | 1 | 1007 | 0 | 0 | 80 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku3 | dm r2 | anthropic/claude-haiku-5.5 | 4 | 2675 | 93793 | 69784 | 12455 | $0.0163 | 0 | 0 | 0 |
| S1-none-haiku3 | relay r2 | anthropic/claude-sonnet-5.5 | 1 | 2591 | 0 | 0 | 2385 | $0.0290 | 0 | 0 | 0 |
| S1-none-haiku3 | relay r2 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3449 | 0 | 0 | 701 | $0.0139 | 0 | 0 | 0 |
| S1-none-haiku3 | relay r2 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3545 | 0 | 0 | 810 | $0.0152 | 0 | 0 | 0 |
| S1-none-haiku3 | relay r2 (Sefa's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 3551 | 0 | 0 | 788 | $0.0150 | 0 | 0 | 0 |
| S1-none-haiku3 | relay r2 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3514 | 0 | 0 | 751 | $0.0145 | 0 | 0 | 0 |
| S1-none-haiku3/Sefa | player r3 | anthropic/claude-haiku-5.5 | 1 | 4 | 12137 | 1083 | 772 | $0.0006 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Sefa r3 | anthropic/claude-haiku-5.5 | 1 | 1471 | 0 | 0 | 79 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku3/Pell | player r3 | anthropic/claude-haiku-5.5 | 1 | 4 | 12353 | 1062 | 1140 | $0.0008 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Pell r3 | anthropic/claude-haiku-5.5 | 1 | 1475 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku3/Bram | player r3 | anthropic/claude-haiku-5.5 | 1 | 4 | 11805 | 1068 | 829 | $0.0007 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Bram r3 | anthropic/claude-haiku-5.5 | 1 | 1516 | 0 | 0 | 80 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku3 | dm r3 | anthropic/claude-haiku-5.5 | 4 | 3137 | 90182 | 59508 | 11957 | $0.0148 | 0 | 0 | 0 |
| S1-none-haiku3 | relay r3 | anthropic/claude-sonnet-5.5 | 1 | 3073 | 0 | 0 | 3892 | $0.0451 | 0 | 0 | 0 |
| S1-none-haiku3 | relay r3 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4461 | 0 | 0 | 1250 | $0.0214 | 0 | 0 | 0 |
| S1-none-haiku3 | relay r3 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4395 | 0 | 0 | 1191 | $0.0207 | 0 | 0 | 0 |
| S1-none-haiku3 | relay r3 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4539 | 0 | 0 | 1315 | $0.0222 | 0 | 0 | 0 |
| S1-none-haiku3 | relay r3 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 4531 | 0 | 0 | 1321 | $0.0223 | 0 | 0 | 0 |
| S1-none-haiku3/Pell | player r4 | anthropic/claude-haiku-5.5 | 1 | 4 | 13415 | 1590 | 984 | $0.0008 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Pell r4 | anthropic/claude-haiku-5.5 | 1 | 1984 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku3/Bram | player r4 | anthropic/claude-haiku-5.5 | 1 | 4 | 12873 | 1806 | 567 | $0.0006 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Bram r4 | anthropic/claude-haiku-5.5 | 1 | 2197 | 0 | 0 | 73 | $0.0003 | 0 | 0 | 0 |
| S1-none-haiku3/Sefa | player r4 | anthropic/claude-haiku-5.5 | 1 | 4 | 13220 | 1599 | 914 | $0.0008 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Sefa r4 | anthropic/claude-haiku-5.5 | 1 | 1971 | 0 | 0 | 62 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku3 | dm r4 | anthropic/claude-haiku-5.5 | 7 | 4522 | 205878 | 74760 | 15996 | $0.0200 | 0 | 0 | 0 |
| S1-none-haiku3 | relay r4 | anthropic/claude-sonnet-5.5 | 1 | 3166 | 0 | 0 | 2141 | $0.0277 | 0 | 0 | 0 |
| S1-none-haiku3/Bram | player r5 | anthropic/claude-haiku-5.5 | 1 | 4 | 14679 | 1242 | 879 | $0.0007 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Bram r5 | anthropic/claude-haiku-5.5 | 1 | 1438 | 0 | 0 | 83 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku3/Sefa | player r5 | anthropic/claude-haiku-5.5 | 1 | 4 | 14819 | 1147 | 995 | $0.0008 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Sefa r5 | anthropic/claude-haiku-5.5 | 1 | 1432 | 0 | 0 | 80 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku3 | dm r5 | anthropic/claude-haiku-5.5 | 7 | 4141 | 191795 | 117038 | 16221 | $0.0254 | 0 | 0 | 0 |
| S1-none-haiku3 | relay r5 | anthropic/claude-sonnet-5.5 | 2 | 5150 | 0 | 0 | 1570 | $0.0260 | 0 | 0 | 0 |
| S1-none-haiku3 | relay r5 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3328 | 0 | 0 | 567 | $0.0123 | 0 | 0 | 0 |
| S1-none-haiku3/Pell | player r5 | anthropic/claude-haiku-5.5 | 1 | 4 | 15005 | 1143 | 740 | $0.0007 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Pell r5 | anthropic/claude-haiku-5.5 | 1 | 1382 | 0 | 0 | 79 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku3 | relay r5 card | anthropic/claude-sonnet-5.5 | 1 | 1818 | 0 | 0 | 550 | $0.0091 | 0 | 0 | 0 |
| S1-none-haiku3/Pell | player r5 card 1 | anthropic/claude-haiku-5.5 | 2 | 8 | 33270 | 1155 | 200 | $0.0006 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Pell r5 card | anthropic/claude-haiku-5.5 | 3 | 2150 | 0 | 0 | 483 | $0.0005 | 0 | 0 | 0 |
| S1-none-haiku3 | dm r5 card prose | anthropic/claude-haiku-5.5 | 1 | 17621 | 18472 | 9262 | 878 | $0.0042 | 0 | 0 | 0 |
| S1-none-haiku3/Pell | player r5 card 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 17303 | 447 | 102 | $0.0003 | 0 | 0 | 0 |
| S1-none-haiku3 | dm r5 onward | anthropic/claude-haiku-5.5 | 6 | 5565 | 220963 | 37565 | 8635 | $0.0118 | 0 | 0 | 0 |
| S1-none-haiku3/Sefa | player r6 | anthropic/claude-haiku-5.5 | 1 | 4 | 15966 | 965 | 1002 | $0.0008 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Sefa r6 | anthropic/claude-haiku-5.5 | 1 | 1214 | 0 | 0 | 59 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku3/Bram | player r6 | anthropic/claude-haiku-5.5 | 1 | 4 | 15921 | 1029 | 314 | $0.0004 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Bram r6 | anthropic/claude-haiku-5.5 | 1 | 1210 | 0 | 0 | 84 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku3 | dm r6 | anthropic/claude-haiku-5.5 | 7 | 5148 | 164266 | 144189 | 14059 | $0.0274 | 0 | 0 | 0 |
| S1-none-haiku3 | relay r6 | anthropic/claude-sonnet-5.5 | 2 | 4004 | 0 | 0 | 2094 | $0.0289 | 0 | 0 | 0 |
| S1-none-haiku3 | relay r6 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3251 | 0 | 0 | 788 | $0.0144 | 0 | 0 | 0 |
| S1-none-haiku3/Pell | player r6 | anthropic/claude-haiku-5.5 | 1 | 4 | 17750 | 332 | 545 | $0.0005 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Pell r6 | anthropic/claude-haiku-5.5 | 1 | 940 | 0 | 0 | 78 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku3/Bram | player r7 | anthropic/claude-haiku-5.5 | 1 | 4 | 16950 | 1088 | 889 | $0.0008 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Bram r7 | anthropic/claude-haiku-5.5 | 1 | 1483 | 0 | 0 | 85 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku3/Sefa | player r7 | anthropic/claude-haiku-5.5 | 1 | 4 | 16931 | 1009 | 940 | $0.0008 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Sefa r7 | anthropic/claude-haiku-5.5 | 1 | 1464 | 0 | 0 | 80 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku3/check | check referee S1-none-haiku3 Sefa r7 | anthropic/claude-haiku-5.5 | 1 | 1464 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| S1-none-haiku3 | dm r7 | anthropic/claude-haiku-5.5 | 9 | 6399 | 256894 | 142989 | 12197 | $0.0274 | 0 | 0 | 0 |
| S1-none-haiku3 | relay r7 | anthropic/claude-sonnet-5.5 | 2 | 3772 | 0 | 0 | 1891 | $0.0265 | 0 | 0 | 0 |
| S1-none-haiku3 | relay r7 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3321 | 0 | 0 | 738 | $0.0140 | 0 | 0 | 0 |
| S1-none-haiku3 | relay r7 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3258 | 0 | 0 | 645 | $0.0130 | 0 | 0 | 0 |
| S1-none-haiku3 | relay r7 (Sefa's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 3237 | 0 | 0 | 649 | $0.0130 | 0 | 0 | 0 |
| S1-none-haiku3/Pell | player r7 | anthropic/claude-haiku-5.5 | 1 | 4 | 18082 | 775 | 234 | $0.0004 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Pell r7 | anthropic/claude-haiku-5.5 | 1 | 1024 | 0 | 0 | 79 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku3/Bram | after 1 | anthropic/claude-haiku-5.5 | 1 | 4 | 18038 | 1152 | 993 | $0.0008 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Bram after 1 | anthropic/claude-haiku-5.5 | 1 | 721 | 0 | 0 | 72 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku3/Bram | after 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 19190 | 416 | 575 | $0.0005 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Bram after 2 | anthropic/claude-haiku-5.5 | 1 | 556 | 0 | 0 | 89 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku3/Bram | after 3 | anthropic/claude-haiku-5.5 | 1 | 4 | 19606 | 238 | 374 | $0.0004 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Bram after 3 | anthropic/claude-haiku-5.5 | 1 | 531 | 0 | 0 | 63 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku3/Sefa | after 1 | anthropic/claude-haiku-5.5 | 1 | 4 | 17940 | 1130 | 728 | $0.0007 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Sefa after 1 | anthropic/claude-haiku-5.5 | 1 | 662 | 0 | 0 | 74 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku3/Sefa | after 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 19070 | 357 | 549 | $0.0005 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Sefa after 2 | anthropic/claude-haiku-5.5 | 1 | 583 | 0 | 0 | 70 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku3/Sefa | after 3 | anthropic/claude-haiku-5.5 | 1 | 4 | 19427 | 265 | 527 | $0.0005 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Sefa after 3 | anthropic/claude-haiku-5.5 | 1 | 597 | 0 | 0 | 70 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku3/Pell | after 1 | anthropic/claude-haiku-5.5 | 1 | 4 | 18857 | 623 | 436 | $0.0005 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Pell after 1 | anthropic/claude-haiku-5.5 | 1 | 612 | 0 | 0 | 78 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku3/Pell | after 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 19480 | 307 | 592 | $0.0005 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Pell after 2 | anthropic/claude-haiku-5.5 | 1 | 627 | 0 | 0 | 70 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku3/Pell | after 3 | anthropic/claude-haiku-5.5 | 1 | 4 | 19787 | 309 | 385 | $0.0004 | 0 | 0 | 0 |
| S1-none-haiku3/check | check S1-none-haiku3 Pell after 3 | anthropic/claude-haiku-5.5 | 1 | 478 | 0 | 0 | 66 | $0.0001 | 0 | 0 | 0 |
| S1-none-haiku3/score | round r1 1 | anthropic/claude-haiku-5.5 | 1 | 3235 | 0 | 0 | 1619 | $0.0011 | 0 | 0 | 0 |
| S1-none-haiku3/score | round r1 2 | anthropic/claude-haiku-5.5 | 1 | 3235 | 0 | 0 | 1577 | $0.0011 | 0 | 0 | 0 |
| S1-none-haiku3/score | round r1 referee | anthropic/claude-haiku-5.5 | 1 | 3235 | 0 | 0 | 2139 | $0.0014 | 0 | 0 | 0 |
| S1-none-haiku3/score | hold r1 1 | anthropic/claude-haiku-5.5 | 1 | 3463 | 0 | 0 | 891 | $0.0008 | 0 | 0 | 0 |
| S1-none-haiku3/score | hold r1 2 | anthropic/claude-haiku-5.5 | 1 | 3463 | 0 | 0 | 1122 | $0.0009 | 0 | 0 | 0 |
| S1-none-haiku3/score | hold r1 referee | anthropic/claude-haiku-5.5 | 1 | 3463 | 0 | 0 | 1183 | $0.0009 | 0 | 0 | 0 |
| S1-none-haiku3/score | round r2 1 | anthropic/claude-haiku-5.5 | 1 | 3519 | 0 | 0 | 1384 | $0.0010 | 0 | 0 | 0 |
| S1-none-haiku3/score | round r2 2 | anthropic/claude-haiku-5.5 | 1 | 3519 | 0 | 0 | 1456 | $0.0011 | 0 | 0 | 0 |
| S1-none-haiku3/score | round r2 referee | anthropic/claude-haiku-5.5 | 1 | 3519 | 0 | 0 | 2124 | $0.0014 | 0 | 0 | 0 |
| S1-none-haiku3/score | hold r2 1 | anthropic/claude-haiku-5.5 | 1 | 3747 | 0 | 0 | 1079 | $0.0009 | 0 | 0 | 0 |
| S1-none-haiku3/score | hold r2 2 | anthropic/claude-haiku-5.5 | 1 | 3747 | 0 | 0 | 1147 | $0.0009 | 0 | 0 | 0 |
| S1-none-haiku3/score | hold r2 referee | anthropic/claude-haiku-5.5 | 1 | 3747 | 0 | 0 | 1001 | $0.0009 | 0 | 0 | 0 |
| S1-none-haiku3/score | round r3 1 | anthropic/claude-haiku-5.5 | 1 | 4001 | 0 | 0 | 1706 | $0.0013 | 0 | 0 | 0 |
| S1-none-haiku3/score | round r3 2 | anthropic/claude-haiku-5.5 | 1 | 4001 | 0 | 0 | 1801 | $0.0013 | 0 | 0 | 0 |
| S1-none-haiku3/score | round r3 referee | anthropic/claude-haiku-5.5 | 1 | 4001 | 0 | 0 | 2061 | $0.0014 | 0 | 0 | 0 |
| S1-none-haiku3/score | hold r3 1 | anthropic/claude-haiku-5.5 | 1 | 4229 | 0 | 0 | 1733 | $0.0013 | 0 | 0 | 0 |
| S1-none-haiku3/score | hold r3 2 | anthropic/claude-haiku-5.5 | 1 | 4229 | 0 | 0 | 1435 | $0.0011 | 0 | 0 | 0 |
| S1-none-haiku3/score | hold r3 referee | anthropic/claude-haiku-5.5 | 1 | 4229 | 0 | 0 | 1501 | $0.0012 | 0 | 0 | 0 |
| S1-none-haiku3/score | round r4 1 | anthropic/claude-haiku-5.5 | 1 | 4094 | 0 | 0 | 1571 | $0.0012 | 0 | 0 | 0 |
| S1-none-haiku3/score | round r4 2 | anthropic/claude-haiku-5.5 | 1 | 4094 | 0 | 0 | 1850 | $0.0013 | 0 | 0 | 0 |
| S1-none-haiku3/score | round r4 referee | anthropic/claude-haiku-5.5 | 1 | 4094 | 0 | 0 | 2649 | $0.0017 | 0 | 0 | 0 |
| S1-none-haiku3/score | hold r4 1 | anthropic/claude-haiku-5.5 | 1 | 4322 | 0 | 0 | 838 | $0.0009 | 0 | 0 | 0 |
| S1-none-haiku3/score | hold r4 2 | anthropic/claude-haiku-5.5 | 1 | 4322 | 0 | 0 | 989 | $0.0009 | 0 | 0 | 0 |
| S1-none-haiku3/score | hold r4 referee | anthropic/claude-haiku-5.5 | 1 | 4322 | 0 | 0 | 1457 | $0.0012 | 0 | 0 | 0 |
| S1-none-haiku3/score | round r5 1 | anthropic/claude-haiku-5.5 | 1 | 4717 | 0 | 0 | 2401 | $0.0017 | 0 | 0 | 0 |
| S1-none-haiku3/score | round r5 2 | anthropic/claude-haiku-5.5 | 1 | 4717 | 0 | 0 | 2056 | $0.0015 | 0 | 0 | 0 |
| S1-none-haiku3/score | round r5 referee | anthropic/claude-haiku-5.5 | 1 | 4717 | 0 | 0 | 2814 | $0.0019 | 0 | 0 | 0 |
| S1-none-haiku3/score | hold r5 1 | anthropic/claude-haiku-5.5 | 1 | 4945 | 0 | 0 | 1311 | $0.0011 | 0 | 0 | 0 |
| S1-none-haiku3/score | hold r5 2 | anthropic/claude-haiku-5.5 | 1 | 4945 | 0 | 0 | 876 | $0.0009 | 0 | 0 | 0 |
| S1-none-haiku3/score | hold r5 referee | anthropic/claude-haiku-5.5 | 1 | 4945 | 0 | 0 | 1672 | $0.0013 | 0 | 0 | 0 |
| S1-none-haiku3/score | round r6 1 | anthropic/claude-haiku-5.5 | 1 | 4058 | 0 | 0 | 2232 | $0.0015 | 0 | 0 | 0 |
| S1-none-haiku3/score | round r6 2 | anthropic/claude-haiku-5.5 | 1 | 4058 | 0 | 0 | 2287 | $0.0015 | 0 | 0 | 0 |
| S1-none-haiku3/score | round r6 referee | anthropic/claude-haiku-5.5 | 1 | 4058 | 0 | 0 | 2759 | $0.0018 | 0 | 0 | 0 |
| S1-none-haiku3/score | hold r6 1 | anthropic/claude-haiku-5.5 | 1 | 4286 | 0 | 0 | 1616 | $0.0012 | 0 | 0 | 0 |
| S1-none-haiku3/score | hold r6 2 | anthropic/claude-haiku-5.5 | 1 | 4286 | 0 | 0 | 1271 | $0.0011 | 0 | 0 | 0 |
| S1-none-haiku3/score | hold r6 referee | anthropic/claude-haiku-5.5 | 1 | 4286 | 0 | 0 | 1936 | $0.0014 | 0 | 0 | 0 |
| S1-none-haiku3/score | round r7 1 | anthropic/claude-haiku-5.5 | 1 | 3826 | 0 | 0 | 1906 | $0.0013 | 0 | 0 | 0 |
| S1-none-haiku3/score | round r7 2 | anthropic/claude-haiku-5.5 | 1 | 3826 | 0 | 0 | 1777 | $0.0013 | 0 | 0 | 0 |
| S1-none-haiku3/score | round r7 referee | anthropic/claude-haiku-5.5 | 1 | 3826 | 0 | 0 | 1874 | $0.0013 | 0 | 0 | 0 |
| S1-none-haiku3/score | hold r7 1 | anthropic/claude-haiku-5.5 | 1 | 4054 | 0 | 0 | 1174 | $0.0010 | 0 | 0 | 0 |
| S1-none-haiku3/score | hold r7 2 | anthropic/claude-haiku-5.5 | 1 | 4054 | 0 | 0 | 1163 | $0.0010 | 0 | 0 | 0 |
| S1-none-haiku3/score | hold r7 referee | anthropic/claude-haiku-5.5 | 1 | 4054 | 0 | 0 | 1562 | $0.0012 | 0 | 0 | 0 |
| S1-none-T1 | relay opening | anthropic/claude-sonnet-5.5 | 1 | 1291 | 0 | 0 | 1296 | $0.0155 | 0 | 0 | 0 |
| S1-none-T1/Pell | player r1 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 10953 | 484 | $0.0645 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Pell r1 | anthropic/claude-haiku-5.5 | 1 | 1856 | 0 | 0 | 76 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1/Bram | player r1 | openai/gpt-6.1-sol | 1 | 3 | 0 | 7239 | 106 | $0.0192 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Bram r1 | anthropic/claude-haiku-5.5 | 1 | 1605 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1/Sefa | player r1 | deepseek/deepseek-v4-pro-0813 | 1 | 7585 | 0 | 0 | 1104 | $0.0127 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Sefa r1 | anthropic/claude-haiku-5.5 | 1 | 1784 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1 | dm r1 | anthropic/claude-opus-5.5 | 3 | 12 | 49528 | 100967 | 7639 | $0.7895 | 0 | 0 | 0 |
| S1-none-T1 | dm r1 | anthropic/claude-haiku-5.5 | 1 | 3053 | 0 | 0 | 778 | $0.0007 | 0 | 0 | 0 |
| S1-none-T1 | relay r1 | anthropic/claude-sonnet-5.5 | 1 | 2564 | 0 | 0 | 2818 | $0.0333 | 0 | 0 | 0 |
| S1-none-T1/Bram | player r2 | openai/gpt-6.1-sol | 1 | 3 | 7239 | 609 | 104 | $0.0033 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Bram r2 | anthropic/claude-haiku-5.5 | 1 | 1201 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1/Sefa | player r2 | deepseek/deepseek-v4-pro-0813 | 1 | 823 | 7424 | 0 | 1841 | $0.0066 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Sefa r2 | anthropic/claude-haiku-5.5 | 1 | 1375 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1/Pell | player r2 | anthropic/claude-opus-5.5 | 1 | 4 | 10953 | 1551 | 715 | $0.0243 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Pell r2 | anthropic/claude-haiku-5.5 | 1 | 1962 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1 | dm r2 | anthropic/claude-opus-5.5 | 4 | 16 | 151765 | 81710 | 10199 | $0.6479 | 0 | 0 | 0 |
| S1-none-T1 | dm r2 | anthropic/claude-haiku-5.5 | 2 | 6075 | 0 | 0 | 533 | $0.0009 | 0 | 0 | 0 |
| S1-none-T1 | relay r2 | anthropic/claude-sonnet-5.5 | 1 | 3074 | 0 | 0 | 4369 | $0.0498 | 0 | 0 | 0 |
| S1-none-T1 | relay r2 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4605 | 0 | 0 | 1457 | $0.0238 | 0 | 0 | 0 |
| S1-none-T1 | relay r2 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4502 | 0 | 0 | 1335 | $0.0224 | 0 | 0 | 0 |
| S1-none-T1 | relay r2 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4596 | 0 | 0 | 1442 | $0.0236 | 0 | 0 | 0 |
| S1-none-T1/Sefa | player r3 | deepseek/deepseek-v4-pro-0813 | 1 | 1404 | 7936 | 0 | 1109 | $0.0055 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Sefa r3 | anthropic/claude-haiku-5.5 | 1 | 1971 | 0 | 0 | 80 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1/Pell | player r3 | anthropic/claude-opus-5.5 | 1 | 4 | 12504 | 1859 | 787 | $0.0276 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Pell r3 | anthropic/claude-haiku-5.5 | 1 | 2112 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1/Bram | player r3 | openai/gpt-6.1-sol | 1 | 3 | 7848 | 1071 | 116 | $0.0046 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Bram r3 | anthropic/claude-haiku-5.5 | 1 | 1882 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1 | dm r3 | anthropic/claude-opus-5.5 | 5 | 20 | 219341 | 84039 | 12733 | $0.7253 | 0 | 0 | 0 |
| S1-none-T1 | dm r3 | anthropic/claude-haiku-5.5 | 3 | 10613 | 0 | 0 | 1863 | $0.0020 | 0 | 0 | 0 |
| S1-none-T1 | relay r3 | anthropic/claude-sonnet-5.5 | 1 | 3417 | 0 | 0 | 2227 | $0.0291 | 0 | 0 | 0 |
| S1-none-T1/Bram | player r4 | openai/gpt-6.1-sol | 1 | 3 | 8919 | 486 | 124 | $0.0034 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Bram r4 | anthropic/claude-haiku-5.5 | 1 | 943 | 0 | 0 | 66 | $0.0001 | 0 | 0 | 0 |
| S1-none-T1 | dm r4 | anthropic/claude-opus-5.5 | 3 | 12 | 70086 | 108727 | 6284 | $0.6934 | 0 | 0 | 0 |
| S1-none-T1 | dm r4 | anthropic/claude-haiku-5.5 | 1 | 2680 | 0 | 0 | 241 | $0.0004 | 0 | 0 | 0 |
| S1-none-T1 | relay r4 | anthropic/claude-sonnet-5.5 | 2 | 5485 | 0 | 0 | 3646 | $0.0474 | 0 | 0 | 0 |
| S1-none-T1/Pell | player r4 | anthropic/claude-opus-5.5 | 1 | 4 | 14363 | 1381 | 706 | $0.0239 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Pell r4 | anthropic/claude-haiku-5.5 | 1 | 1772 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1/Sefa | player r4 | deepseek/deepseek-v4-pro-0813 | 1 | 918 | 9216 | 0 | 802 | $0.0042 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Sefa r4 | anthropic/claude-haiku-5.5 | 1 | 1364 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1 | relay r4 card | anthropic/claude-sonnet-5.5 | 1 | 1865 | 0 | 0 | 440 | $0.0081 | 0 | 0 | 0 |
| S1-none-T1 | relay r4 card (asked again) | anthropic/claude-sonnet-5.5 | 1 | 1865 | 0 | 0 | 905 | $0.0128 | 0 | 0 | 0 |
| S1-none-T1 | relay r4 card (Pell's screen alone) | anthropic/claude-sonnet-5.5 | 1 | 1922 | 0 | 0 | 357 | $0.0074 | 0 | 0 | 0 |
| S1-none-T1 | relay r4 card (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 2447 | 0 | 0 | 375 | $0.0086 | 0 | 0 | 0 |
| S1-none-T1 | relay r4 card (Pell's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 2408 | 0 | 0 | 482 | $0.0096 | 0 | 0 | 0 |
| S1-none-T1/Pell | player r4 card 1 | anthropic/claude-opus-5.5 | 2 | 8 | 32467 | 1152 | 28 | $0.0128 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Pell r4 card | anthropic/claude-haiku-5.5 | 2 | 1297 | 0 | 0 | 111 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1 | dm r4 onward | anthropic/claude-opus-5.5 | 3 | 10 | 142820 | 47498 | 7945 | $0.4250 | 0 | 0 | 0 |
| S1-none-T1 | dm r4 onward | anthropic/claude-haiku-5.5 | 2 | 6333 | 0 | 0 | 701 | $0.0010 | 0 | 0 | 0 |
| S1-none-T1/Bram | player r5 | openai/gpt-6.1-sol | 1 | 3 | 9405 | 556 | 70 | $0.0030 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Bram r5 | anthropic/claude-haiku-5.5 | 1 | 1047 | 0 | 0 | 63 | $0.0001 | 0 | 0 | 0 |
| S1-none-T1 | dm r5 | anthropic/claude-opus-5.5 | 7 | 26 | 301975 | 160242 | 13327 | $1.1376 | 0 | 0 | 0 |
| S1-none-T1 | dm r5 | anthropic/claude-haiku-5.5 | 4 | 13398 | 0 | 0 | 1649 | $0.0022 | 0 | 0 | 0 |
| S1-none-T1 | relay r5 | anthropic/claude-sonnet-5.5 | 2 | 5104 | 0 | 0 | 2904 | $0.0392 | 0 | 0 | 0 |
| S1-none-T1/Sefa | player r5 | deepseek/deepseek-v4-pro-0813 | 1 | 1261 | 9984 | 0 | 915 | $0.0050 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Sefa r5 | anthropic/claude-haiku-5.5 | 1 | 2121 | 0 | 0 | 79 | $0.0003 | 0 | 0 | 0 |
| S1-none-T1/Pell | player r5 | anthropic/claude-opus-5.5 | 1 | 4 | 16896 | 1461 | 818 | $0.0271 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Pell r5 | anthropic/claude-haiku-5.5 | 1 | 2319 | 0 | 0 | 73 | $0.0003 | 0 | 0 | 0 |
| S1-none-T1 | relay r5 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4722 | 0 | 0 | 845 | $0.0179 | 0 | 0 | 0 |
| S1-none-T1/Bram | player r6 | openai/gpt-6.1-sol | 1 | 3 | 9961 | 366 | 70 | $0.0026 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Bram r6 | anthropic/claude-haiku-5.5 | 1 | 822 | 0 | 0 | 63 | $0.0001 | 0 | 0 | 0 |
| S1-none-T1 | dm r6 | anthropic/claude-opus-5.5 | 6 | 24 | 168730 | 231656 | 16474 | $1.5365 | 0 | 0 | 0 |
| S1-none-T1 | dm r6 | anthropic/claude-haiku-5.5 | 3 | 9367 | 0 | 0 | 1553 | $0.0017 | 0 | 0 | 0 |
| S1-none-T1 | relay r6 | anthropic/claude-sonnet-5.5 | 3 | 6403 | 0 | 0 | 3146 | $0.0443 | 0 | 0 | 0 |
| S1-none-T1/Sefa | player r6 | deepseek/deepseek-v4-pro-0813 | 1 | 1306 | 11008 | 0 | 847 | $0.0050 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Sefa r6 | anthropic/claude-haiku-5.5 | 1 | 1484 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1/Pell | player r6 | anthropic/claude-opus-5.5 | 1 | 4 | 18357 | 2036 | 729 | $0.0284 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Pell r6 | anthropic/claude-haiku-5.5 | 1 | 2385 | 0 | 0 | 79 | $0.0003 | 0 | 0 | 0 |
| S1-none-T1/Bram | player r7 | openai/gpt-6.1-sol | 1 | 3 | 10327 | 433 | 88 | $0.0030 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Bram r7 | anthropic/claude-haiku-5.5 | 1 | 998 | 0 | 0 | 74 | $0.0001 | 0 | 0 | 0 |
| S1-none-T1 | dm r7 | anthropic/claude-opus-5.5 | 6 | 24 | 186582 | 239731 | 16946 | $1.5882 | 0 | 0 | 0 |
| S1-none-T1 | dm r7 | anthropic/claude-haiku-5.5 | 3 | 9554 | 0 | 0 | 1606 | $0.0018 | 0 | 0 | 0 |
| S1-none-T1 | relay r7 | anthropic/claude-sonnet-5.5 | 3 | 6631 | 0 | 0 | 3185 | $0.0451 | 0 | 0 | 0 |
| S1-none-T1 | relay r7 (asked again) | anthropic/claude-sonnet-5.5 | 1 | 1761 | 0 | 0 | 797 | $0.0115 | 0 | 0 | 0 |
| S1-none-T1 | relay r7 (Bram's screen alone) | anthropic/claude-sonnet-5.5 | 1 | 1817 | 0 | 0 | 736 | $0.0110 | 0 | 0 | 0 |
| S1-none-T1/Sefa | player r7 | deepseek/deepseek-v4-pro-0813 | 1 | 1249 | 12032 | 0 | 1381 | $0.0064 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Sefa r7 | anthropic/claude-haiku-5.5 | 1 | 1872 | 0 | 0 | 77 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1/Pell | player r7 | anthropic/claude-opus-5.5 | 1 | 4 | 20393 | 1822 | 684 | $0.0269 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Pell r7 | anthropic/claude-haiku-5.5 | 1 | 2052 | 0 | 0 | 95 | $0.0003 | 0 | 0 | 0 |
| S1-none-T1/Bram | player r8 | openai/gpt-6.1-sol | 1 | 3 | 10760 | 629 | 154 | $0.0042 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Bram r8 | anthropic/claude-haiku-5.5 | 1 | 1274 | 0 | 0 | 58 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1 | dm r8 | anthropic/claude-opus-5.5 | 7 | 28 | 285785 | 254090 | 14372 | $1.6269 | 0 | 0 | 0 |
| S1-none-T1 | dm r8 | anthropic/claude-haiku-5.5 | 4 | 11316 | 0 | 0 | 1321 | $0.0018 | 0 | 0 | 0 |
| S1-none-T1 | relay r8 | anthropic/claude-sonnet-5.5 | 3 | 6435 | 0 | 0 | 2766 | $0.0405 | 0 | 0 | 0 |
| S1-none-T1/Sefa | player r8 | deepseek/deepseek-v4-pro-0813 | 1 | 1419 | 13056 | 0 | 657 | $0.0049 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Sefa r8 | anthropic/claude-haiku-5.5 | 1 | 1925 | 0 | 0 | 88 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1/Pell | player r8 | anthropic/claude-opus-5.5 | 1 | 4 | 22215 | 1542 | 548 | $0.0231 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Pell r8 | anthropic/claude-haiku-5.5 | 1 | 1823 | 0 | 0 | 199 | $0.0003 | 0 | 0 | 0 |
| S1-none-T1/Bram | player r9 | openai/gpt-6.1-sol | 1 | 3 | 11389 | 611 | 120 | $0.0039 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Bram r9 | anthropic/claude-haiku-5.5 | 1 | 1134 | 0 | 0 | 61 | $0.0001 | 0 | 0 | 0 |
| S1-none-T1 | dm r9 | anthropic/claude-opus-5.5 | 7 | 28 | 300583 | 261386 | 14536 | $1.6701 | 0 | 0 | 0 |
| S1-none-T1 | dm r9 | anthropic/claude-haiku-5.5 | 4 | 11373 | 0 | 0 | 1308 | $0.0018 | 0 | 0 | 0 |
| S1-none-T1 | relay r9 | anthropic/claude-sonnet-5.5 | 3 | 6323 | 0 | 0 | 3010 | $0.0427 | 0 | 0 | 0 |
| S1-none-T1/Sefa | player r9 | deepseek/deepseek-v4-pro-0813 | 1 | 1131 | 14336 | 0 | 1762 | $0.0075 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Sefa r9 | anthropic/claude-haiku-5.5 | 1 | 1604 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1/Pell | player r9 | anthropic/claude-opus-5.5 | 1 | 4 | 23757 | 1368 | 1063 | $0.0329 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Pell r9 | anthropic/claude-haiku-5.5 | 1 | 1638 | 0 | 0 | 76 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1/Sefa | player r10 | deepseek/deepseek-v4-pro-0813 | 1 | 905 | 15360 | 0 | 1020 | $0.0054 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Sefa r10 | anthropic/claude-haiku-5.5 | 1 | 1324 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1/Bram | player r10 | openai/gpt-6.1-sol | 1 | 3 | 12000 | 795 | 142 | $0.0046 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Bram r10 | anthropic/claude-haiku-5.5 | 1 | 1469 | 0 | 0 | 57 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1 | dm r10 | anthropic/claude-opus-5.5 | 5 | 20 | 238044 | 183958 | 11110 | $1.1992 | 0 | 0 | 0 |
| S1-none-T1 | dm r10 | anthropic/claude-haiku-5.5 | 3 | 8547 | 0 | 0 | 1248 | $0.0015 | 0 | 0 | 0 |
| S1-none-T1 | relay r10 | anthropic/claude-sonnet-5.5 | 2 | 4989 | 0 | 0 | 2797 | $0.0379 | 0 | 0 | 0 |
| S1-none-T1 | relay r10 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3547 | 0 | 0 | 710 | $0.0142 | 0 | 0 | 0 |
| S1-none-T1 | relay r10 (Sefa's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 3547 | 0 | 0 | 1530 | $0.0224 | 0 | 0 | 0 |
| S1-none-T1 | relay r10 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3946 | 0 | 0 | 1115 | $0.0190 | 0 | 0 | 0 |
| S1-none-T1 | relay r10 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 3946 | 0 | 0 | 2354 | $0.0314 | 0 | 0 | 0 |
| S1-none-T1/Pell | player r10 | anthropic/claude-opus-5.5 | 1 | 4 | 25125 | 1391 | 511 | $0.0222 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Pell r10 | anthropic/claude-haiku-5.5 | 1 | 1625 | 0 | 0 | 74 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1/Bram | player r11 | openai/gpt-6.1-sol | 1 | 3 | 12795 | 914 | 165 | $0.0052 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Bram r11 | anthropic/claude-haiku-5.5 | 1 | 1624 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1/Sefa | player r11 | deepseek/deepseek-v4-pro-0813 | 1 | 0 | 0 | 0 | 0 | $0.0511 | 0 | 0 | 0 |
| S1-none-T1 | dm r11 | anthropic/claude-opus-5.5 | 5 | 20 | 218421 | 189905 | 16293 | $1.3289 | 0 | 0 | 0 |
| S1-none-T1 | dm r11 | anthropic/claude-haiku-5.5 | 3 | 11139 | 0 | 0 | 1680 | $0.0020 | 0 | 0 | 0 |
| S1-none-T1 | relay r11 | anthropic/claude-sonnet-5.5 | 2 | 5049 | 0 | 0 | 2713 | $0.0372 | 0 | 0 | 0 |
| S1-none-T1/Pell | player r11 | anthropic/claude-opus-5.5 | 1 | 4 | 26516 | 1165 | 728 | $0.0257 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Pell r11 | anthropic/claude-haiku-5.5 | 1 | 1563 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1/Pell | player r12 | anthropic/claude-opus-5.5 | 1 | 4 | 27681 | 1453 | 836 | $0.0295 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Pell r12 | anthropic/claude-haiku-5.5 | 1 | 1971 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1/Bram | player r12 | openai/gpt-6.1-sol | 1 | 3 | 13709 | 1240 | 74 | $0.0052 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Bram r12 | anthropic/claude-haiku-5.5 | 1 | 1935 | 0 | 0 | 57 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1 | dm r12 | anthropic/claude-opus-5.5 | 3 | 12 | 149197 | 95364 | 7761 | $0.6667 | 0 | 0 | 0 |
| S1-none-T1 | dm r12 | anthropic/claude-haiku-5.5 | 1 | 3370 | 0 | 0 | 455 | $0.0006 | 0 | 0 | 0 |
| S1-none-T1 | relay r12 | anthropic/claude-sonnet-5.5 | 1 | 2714 | 0 | 0 | 1717 | $0.0226 | 0 | 0 | 0 |
| S1-none-T1/Bram | player r13 | openai/gpt-6.1-sol | 1 | 3 | 14949 | 613 | 100 | $0.0040 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Bram r13 | anthropic/claude-haiku-5.5 | 1 | 1213 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1/Pell | player r13 | anthropic/claude-opus-5.5 | 1 | 4 | 29134 | 1477 | 603 | $0.0253 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Pell r13 | anthropic/claude-haiku-5.5 | 1 | 1704 | 0 | 0 | 82 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1 | dm r13 | anthropic/claude-opus-5.5 | 3 | 12 | 146785 | 102240 | 8123 | $0.7086 | 0 | 0 | 0 |
| S1-none-T1 | dm r13 | anthropic/claude-haiku-5.5 | 1 | 3885 | 0 | 0 | 589 | $0.0007 | 0 | 0 | 0 |
| S1-none-T1 | relay r13 | anthropic/claude-sonnet-5.5 | 1 | 2984 | 0 | 0 | 4844 | $0.0544 | 0 | 0 | 0 |
| S1-none-T1 | relay r13 (asked again) | anthropic/claude-sonnet-5.5 | 1 | 2984 | 0 | 0 | 2547 | $0.0314 | 0 | 0 | 0 |
| S1-none-T1 | relay r13 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4268 | 0 | 0 | 1208 | $0.0206 | 0 | 0 | 0 |
| S1-none-T1 | relay r13 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 4268 | 0 | 0 | 1170 | $0.0202 | 0 | 0 | 0 |
| S1-none-T1/Bram | player r14 | openai/gpt-6.1-sol | 1 | 3 | 15562 | 912 | 106 | $0.0049 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Bram r14 | anthropic/claude-haiku-5.5 | 1 | 1629 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1 | dm r14 | anthropic/claude-opus-5.5 | 5 | 20 | 269336 | 194016 | 13524 | $1.3043 | 0 | 0 | 0 |
| S1-none-T1 | dm r14 | anthropic/claude-haiku-5.5 | 3 | 8149 | 0 | 0 | 1727 | $0.0017 | 0 | 0 | 0 |
| S1-none-T1 | relay r14 | anthropic/claude-sonnet-5.5 | 2 | 4853 | 0 | 0 | 2357 | $0.0333 | 0 | 0 | 0 |
| S1-none-T1/Pell | player r14 | anthropic/claude-opus-5.5 | 1 | 4 | 30611 | 1805 | 813 | $0.0314 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Pell r14 | anthropic/claude-haiku-5.5 | 1 | 2212 | 0 | 0 | 67 | $0.0003 | 0 | 0 | 0 |
| S1-none-T1/Bram | player r15 | openai/gpt-6.1-sol | 1 | 3 | 16474 | 725 | 90 | $0.0044 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Bram r15 | anthropic/claude-haiku-5.5 | 1 | 1314 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| S1-none-T1 | dm r15 | anthropic/claude-opus-5.5 | 8 | 32 | 511847 | 206332 | 18085 | $1.5050 | 0 | 0 | 0 |
| S1-none-T1 | dm r15 | anthropic/claude-haiku-5.5 | 5 | 18530 | 0 | 0 | 3118 | $0.0034 | 0 | 0 | 0 |
| S1-none-T1 | relay r15 | anthropic/claude-sonnet-5.5 | 2 | 5676 | 0 | 0 | 2433 | $0.0357 | 0 | 0 | 0 |
| S1-none-T1/Pell | player r15 | anthropic/claude-opus-5.5 | 1 | 4 | 32416 | 1952 | 1147 | $0.0392 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Pell r15 | anthropic/claude-haiku-5.5 | 1 | 2534 | 0 | 0 | 73 | $0.0003 | 0 | 0 | 0 |
| S1-none-T1/Bram | after 1 | openai/gpt-6.1-sol | 1 | 3 | 17199 | 658 | 170 | $0.0051 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Bram after 1 | anthropic/claude-haiku-5.5 | 1 | 577 | 0 | 0 | 73 | $0.0001 | 0 | 0 | 0 |
| S1-none-T1/Bram | after 2 | openai/gpt-6.1-sol | 1 | 3 | 17857 | 167 | 92 | $0.0031 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Bram after 2 | anthropic/claude-haiku-5.5 | 1 | 464 | 0 | 0 | 69 | $0.0001 | 0 | 0 | 0 |
| S1-none-T1/Bram | after 3 | openai/gpt-6.1-sol | 1 | 3 | 18024 | 109 | 111 | $0.0032 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Bram after 3 | anthropic/claude-haiku-5.5 | 1 | 468 | 0 | 0 | 59 | $0.0001 | 0 | 0 | 0 |
| S1-none-T1/Sefa | after 1 | deepseek/deepseek-v4-pro-0813 | 1 | 377 | 16640 | 0 | 699 | $0.0040 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Sefa after 1 | anthropic/claude-haiku-5.5 | 1 | 1024 | 0 | 0 | 79 | $0.0001 | 0 | 0 | 0 |
| S1-none-T1/Sefa | after 2 | deepseek/deepseek-v4-pro-0813 | 1 | 638 | 16896 | 0 | 836 | $0.0047 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Sefa after 2 | anthropic/claude-haiku-5.5 | 1 | 695 | 0 | 0 | 80 | $0.0001 | 0 | 0 | 0 |
| S1-none-T1/Sefa | after 3 | deepseek/deepseek-v4-pro-0813 | 1 | 392 | 17408 | 0 | 580 | $0.0038 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Sefa after 3 | anthropic/claude-haiku-5.5 | 1 | 731 | 0 | 0 | 79 | $0.0001 | 0 | 0 | 0 |
| S1-none-T1/Pell | after 1 | anthropic/claude-opus-5.5 | 1 | 4 | 34368 | 2440 | 962 | $0.0383 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Pell after 1 | anthropic/claude-haiku-5.5 | 1 | 1060 | 0 | 0 | 66 | $0.0001 | 0 | 0 | 0 |
| S1-none-T1/Pell | after 2 | anthropic/claude-opus-5.5 | 1 | 4 | 36808 | 755 | 853 | $0.0282 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Pell after 2 | anthropic/claude-haiku-5.5 | 1 | 928 | 0 | 0 | 77 | $0.0001 | 0 | 0 | 0 |
| S1-none-T1/Pell | after 3 | anthropic/claude-opus-5.5 | 1 | 4 | 37563 | 610 | 788 | $0.0263 | 0 | 0 | 0 |
| S1-none-T1/check | check S1-none-T1 Pell after 3 | anthropic/claude-haiku-5.5 | 1 | 877 | 0 | 0 | 75 | $0.0001 | 0 | 0 | 0 |
| S1-none-T1/score | round r1 1 | anthropic/claude-haiku-5.5 | 1 | 3492 | 0 | 0 | 1113 | $0.0009 | 0 | 0 | 0 |
| S1-none-T1/score | round r1 2 | anthropic/claude-haiku-5.5 | 1 | 3492 | 0 | 0 | 1255 | $0.0010 | 0 | 0 | 0 |
| S1-none-T1/score | hold r1 1 | anthropic/claude-haiku-5.5 | 1 | 3720 | 0 | 0 | 338 | $0.0005 | 0 | 0 | 0 |
| S1-none-T1/score | hold r1 2 | anthropic/claude-haiku-5.5 | 1 | 3720 | 0 | 0 | 338 | $0.0005 | 0 | 0 | 0 |
| S1-none-T1/score | round r2 1 | anthropic/claude-haiku-5.5 | 1 | 4002 | 0 | 0 | 1090 | $0.0009 | 0 | 0 | 0 |
| S1-none-T1/score | round r2 2 | anthropic/claude-haiku-5.5 | 1 | 4002 | 0 | 0 | 455 | $0.0006 | 0 | 0 | 0 |
| S1-none-T1/score | round r2 referee | anthropic/claude-opus-5.5 | 1 | 4002 | 0 | 0 | 884 | $0.0337 | 0 | 0 | 0 |
| S1-none-T1/score | hold r2 1 | anthropic/claude-haiku-5.5 | 1 | 4230 | 0 | 0 | 1564 | $0.0012 | 0 | 0 | 0 |
| S1-none-T1/score | hold r2 2 | anthropic/claude-haiku-5.5 | 1 | 4230 | 0 | 0 | 1271 | $0.0011 | 0 | 0 | 0 |
| S1-none-T1/score | hold r2 referee | anthropic/claude-opus-5.5 | 1 | 4230 | 0 | 0 | 874 | $0.0344 | 0 | 0 | 0 |
| S1-none-T1/score | round r3 1 | anthropic/claude-haiku-5.5 | 1 | 4345 | 0 | 0 | 1667 | $0.0013 | 0 | 0 | 0 |
| S1-none-T1/score | round r3 2 | anthropic/claude-haiku-5.5 | 1 | 4345 | 0 | 0 | 1820 | $0.0013 | 0 | 0 | 0 |
| S1-none-T1/score | round r3 referee | anthropic/claude-opus-5.5 | 1 | 4345 | 0 | 0 | 1226 | $0.0419 | 0 | 0 | 0 |
| S1-none-T1/score | hold r3 1 | anthropic/claude-haiku-5.5 | 1 | 4573 | 0 | 0 | 1480 | $0.0012 | 0 | 0 | 0 |
| S1-none-T1/score | hold r3 2 | anthropic/claude-haiku-5.5 | 1 | 4573 | 0 | 0 | 414 | $0.0007 | 0 | 0 | 0 |
| S1-none-T1/score | hold r3 referee | anthropic/claude-opus-5.5 | 1 | 4573 | 0 | 0 | 1004 | $0.0384 | 0 | 0 | 0 |
| S1-none-T1/score | round r4 1 | anthropic/claude-haiku-5.5 | 1 | 5137 | 0 | 0 | 1547 | $0.0013 | 0 | 0 | 0 |
| S1-none-T1/score | round r4 2 | anthropic/claude-haiku-5.5 | 1 | 5137 | 0 | 0 | 1335 | $0.0012 | 0 | 0 | 0 |
| S1-none-T1/score | hold r4 1 | anthropic/claude-haiku-5.5 | 1 | 5365 | 0 | 0 | 1139 | $0.0011 | 0 | 0 | 0 |
| S1-none-T1/score | hold r4 2 | anthropic/claude-haiku-5.5 | 1 | 5365 | 0 | 0 | 329 | $0.0007 | 0 | 0 | 0 |
| S1-none-T1/score | hold r4 referee | anthropic/claude-opus-5.5 | 1 | 5365 | 0 | 0 | 815 | $0.0378 | 0 | 0 | 0 |
| S1-none-T1/score | round r5 1 | anthropic/claude-haiku-5.5 | 1 | 5158 | 0 | 0 | 1556 | $0.0013 | 0 | 0 | 0 |
| S1-none-T1/score | round r5 2 | anthropic/claude-haiku-5.5 | 1 | 5158 | 0 | 0 | 1712 | $0.0014 | 0 | 0 | 0 |
| S1-none-T1/score | round r5 referee | anthropic/claude-opus-5.5 | 1 | 5158 | 0 | 0 | 938 | $0.0394 | 0 | 0 | 0 |
| S1-none-T1/score | hold r5 1 | anthropic/claude-haiku-5.5 | 1 | 5386 | 0 | 0 | 1300 | $0.0012 | 0 | 0 | 0 |
| S1-none-T1/score | hold r5 2 | anthropic/claude-haiku-5.5 | 1 | 5386 | 0 | 0 | 1307 | $0.0012 | 0 | 0 | 0 |
| S1-none-T1/score | hold r5 referee | anthropic/claude-opus-5.5 | 1 | 5386 | 0 | 0 | 1025 | $0.0420 | 0 | 0 | 0 |
| S1-none-T1/score | round r6 1 | anthropic/claude-haiku-5.5 | 1 | 5605 | 0 | 0 | 1871 | $0.0015 | 0 | 0 | 0 |
| S1-none-T1/score | round r6 2 | anthropic/claude-haiku-5.5 | 1 | 5605 | 0 | 0 | 1403 | $0.0013 | 0 | 0 | 0 |
| S1-none-T1/score | round r6 referee | anthropic/claude-opus-5.5 | 1 | 5605 | 0 | 0 | 1095 | $0.0443 | 0 | 0 | 0 |
| S1-none-T1/score | hold r6 1 | anthropic/claude-haiku-5.5 | 1 | 5833 | 0 | 0 | 1098 | $0.0011 | 0 | 0 | 0 |
| S1-none-T1/score | hold r6 2 | anthropic/claude-haiku-5.5 | 1 | 5833 | 0 | 0 | 1069 | $0.0011 | 0 | 0 | 0 |
| S1-none-T1/score | hold r6 referee | anthropic/claude-opus-5.5 | 1 | 5833 | 0 | 0 | 894 | $0.0412 | 0 | 0 | 0 |
| S1-none-T1/score | round r7 1 | anthropic/claude-haiku-5.5 | 1 | 5833 | 0 | 0 | 2634 | $0.0019 | 0 | 0 | 0 |
| S1-none-T1/score | round r7 2 | anthropic/claude-haiku-5.5 | 1 | 5833 | 0 | 0 | 1696 | $0.0014 | 0 | 0 | 0 |
| S1-none-T1/score | round r7 referee | anthropic/claude-opus-5.5 | 1 | 5833 | 0 | 0 | 1370 | $0.0507 | 0 | 0 | 0 |
| S1-none-T1/score | hold r7 1 | anthropic/claude-haiku-5.5 | 1 | 6061 | 0 | 0 | 1279 | $0.0012 | 0 | 0 | 0 |
| S1-none-T1/score | hold r7 2 | anthropic/claude-haiku-5.5 | 1 | 6061 | 0 | 0 | 347 | $0.0008 | 0 | 0 | 0 |
| S1-none-T1/score | hold r7 referee | anthropic/claude-opus-5.5 | 1 | 6061 | 0 | 0 | 1235 | $0.0489 | 0 | 0 | 0 |
| S1-none-T1/score | round r8 1 | anthropic/claude-haiku-5.5 | 1 | 5637 | 0 | 0 | 1907 | $0.0015 | 0 | 0 | 0 |
| S1-none-T1/score | round r8 2 | anthropic/claude-haiku-5.5 | 1 | 5637 | 0 | 0 | 1784 | $0.0015 | 0 | 0 | 0 |
| S1-none-T1/score | round r8 referee | anthropic/claude-opus-5.5 | 1 | 5637 | 0 | 0 | 1185 | $0.0462 | 0 | 0 | 0 |
| S1-none-T1/score | hold r8 1 | anthropic/claude-haiku-5.5 | 1 | 5865 | 0 | 0 | 410 | $0.0008 | 0 | 0 | 0 |
| S1-none-T1/score | hold r8 2 | anthropic/claude-haiku-5.5 | 1 | 5865 | 0 | 0 | 389 | $0.0008 | 0 | 0 | 0 |
| S1-none-T1/score | round r9 1 | anthropic/claude-haiku-5.5 | 1 | 5525 | 0 | 0 | 1849 | $0.0015 | 0 | 0 | 0 |
| S1-none-T1/score | round r9 2 | anthropic/claude-haiku-5.5 | 1 | 5525 | 0 | 0 | 2106 | $0.0016 | 0 | 0 | 0 |
| S1-none-T1/score | round r9 referee | anthropic/claude-opus-5.5 | 1 | 5525 | 0 | 0 | 1254 | $0.0472 | 0 | 0 | 0 |
| S1-none-T1/score | hold r9 1 | anthropic/claude-haiku-5.5 | 1 | 5753 | 0 | 0 | 389 | $0.0008 | 0 | 0 | 0 |
| S1-none-T1/score | hold r9 2 | anthropic/claude-haiku-5.5 | 1 | 5753 | 0 | 0 | 387 | $0.0008 | 0 | 0 | 0 |
| S1-none-T1/score | hold r9 referee | anthropic/claude-opus-5.5 | 1 | 5753 | 0 | 0 | 1261 | $0.0482 | 0 | 0 | 0 |
| S1-none-T1/score | round r10 1 | anthropic/claude-haiku-5.5 | 1 | 5043 | 0 | 0 | 1693 | $0.0014 | 0 | 0 | 0 |
| S1-none-T1/score | round r10 2 | anthropic/claude-haiku-5.5 | 1 | 5043 | 0 | 0 | 2236 | $0.0016 | 0 | 0 | 0 |
| S1-none-T1/score | round r10 referee | anthropic/claude-opus-5.5 | 1 | 5043 | 0 | 0 | 1300 | $0.0462 | 0 | 0 | 0 |
| S1-none-T1/score | hold r10 1 | anthropic/claude-haiku-5.5 | 1 | 5271 | 0 | 0 | 974 | $0.0010 | 0 | 0 | 0 |
| S1-none-T1/score | hold r10 2 | anthropic/claude-haiku-5.5 | 1 | 5271 | 0 | 0 | 435 | $0.0007 | 0 | 0 | 0 |
| S1-none-T1/score | round r11 1 | anthropic/claude-haiku-5.5 | 1 | 5140 | 0 | 0 | 1806 | $0.0014 | 0 | 0 | 0 |
| S1-none-T1/score | round r11 2 | anthropic/claude-haiku-5.5 | 1 | 5140 | 0 | 0 | 1677 | $0.0014 | 0 | 0 | 0 |
| S1-none-T1/score | hold r11 1 | anthropic/claude-haiku-5.5 | 1 | 5368 | 0 | 0 | 1864 | $0.0015 | 0 | 0 | 0 |
| S1-none-T1/score | hold r11 2 | anthropic/claude-haiku-5.5 | 1 | 5368 | 0 | 0 | 1649 | $0.0014 | 0 | 0 | 0 |
| S1-none-T1/score | hold r11 referee | anthropic/claude-opus-5.5 | 1 | 5368 | 0 | 0 | 1089 | $0.0433 | 0 | 0 | 0 |
| S1-none-T1/score | round r12 1 | anthropic/claude-haiku-5.5 | 1 | 3665 | 0 | 0 | 1409 | $0.0011 | 0 | 0 | 0 |
| S1-none-T1/score | round r12 2 | anthropic/claude-haiku-5.5 | 1 | 3665 | 0 | 0 | 1416 | $0.0011 | 0 | 0 | 0 |
| S1-none-T1/score | round r12 referee | anthropic/claude-opus-5.5 | 1 | 3665 | 0 | 0 | 1096 | $0.0366 | 0 | 0 | 0 |
| S1-none-T1/score | hold r12 1 | anthropic/claude-haiku-5.5 | 1 | 3893 | 0 | 0 | 1252 | $0.0010 | 0 | 0 | 0 |
| S1-none-T1/score | hold r12 2 | anthropic/claude-haiku-5.5 | 1 | 3893 | 0 | 0 | 1339 | $0.0011 | 0 | 0 | 0 |
| S1-none-T1/score | hold r12 referee | anthropic/claude-opus-5.5 | 1 | 3893 | 0 | 0 | 996 | $0.0355 | 0 | 0 | 0 |
| S1-none-T1/score | round r13 1 | anthropic/claude-haiku-5.5 | 1 | 3935 | 0 | 0 | 1596 | $0.0012 | 0 | 0 | 0 |
| S1-none-T1/score | round r13 2 | anthropic/claude-haiku-5.5 | 1 | 3935 | 0 | 0 | 1568 | $0.0012 | 0 | 0 | 0 |
| S1-none-T1/score | round r13 referee | anthropic/claude-opus-5.5 | 1 | 3935 | 0 | 0 | 1108 | $0.0379 | 0 | 0 | 0 |
| S1-none-T1/score | hold r13 1 | anthropic/claude-haiku-5.5 | 1 | 4163 | 0 | 0 | 1327 | $0.0011 | 0 | 0 | 0 |
| S1-none-T1/score | hold r13 2 | anthropic/claude-haiku-5.5 | 1 | 4163 | 0 | 0 | 1341 | $0.0011 | 0 | 0 | 0 |
| S1-none-T1/score | round r14 1 | anthropic/claude-haiku-5.5 | 1 | 4948 | 0 | 0 | 1580 | $0.0013 | 0 | 0 | 0 |
| S1-none-T1/score | round r14 2 | anthropic/claude-haiku-5.5 | 1 | 4948 | 0 | 0 | 1867 | $0.0014 | 0 | 0 | 0 |
| S1-none-T1/score | round r14 referee | anthropic/claude-opus-5.5 | 1 | 4948 | 0 | 0 | 1223 | $0.0443 | 0 | 0 | 0 |
| S1-none-T1/score | hold r14 1 | anthropic/claude-haiku-5.5 | 1 | 5176 | 0 | 0 | 359 | $0.0007 | 0 | 0 | 0 |
| S1-none-T1/score | hold r14 2 | anthropic/claude-haiku-5.5 | 1 | 5176 | 0 | 0 | 341 | $0.0007 | 0 | 0 | 0 |
| S1-none-T1/score | round r15 1 | anthropic/claude-haiku-5.5 | 1 | 5771 | 0 | 0 | 1500 | $0.0013 | 0 | 0 | 0 |
| S1-none-T1/score | round r15 2 | anthropic/claude-haiku-5.5 | 1 | 5771 | 0 | 0 | 1673 | $0.0014 | 0 | 0 | 0 |
| S1-none-T1/score | round r15 referee | anthropic/claude-opus-5.5 | 1 | 5771 | 0 | 0 | 925 | $0.0416 | 0 | 0 | 0 |
| S1-none-T1/score | hold r15 1 | anthropic/claude-haiku-5.5 | 1 | 5999 | 0 | 0 | 2011 | $0.0016 | 0 | 0 | 0 |
| S1-none-T1/score | hold r15 2 | anthropic/claude-haiku-5.5 | 1 | 5999 | 0 | 0 | 1200 | $0.0012 | 0 | 0 | 0 |
| S1-none-T1/score | hold r15 referee | anthropic/claude-opus-5.5 | 1 | 5999 | 0 | 0 | 770 | $0.0394 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r1 1 | anthropic/claude-haiku-5.5 | 1 | 2086 | 0 | 0 | 375 | $0.0004 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r1 2 | anthropic/claude-haiku-5.5 | 1 | 2086 | 0 | 0 | 345 | $0.0004 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r2 1 | anthropic/claude-haiku-5.5 | 1 | 2596 | 0 | 0 | 421 | $0.0005 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r2 2 | anthropic/claude-haiku-5.5 | 1 | 2596 | 0 | 0 | 562 | $0.0005 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r3 1 | anthropic/claude-haiku-5.5 | 1 | 2939 | 0 | 0 | 453 | $0.0005 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r3 2 | anthropic/claude-haiku-5.5 | 1 | 2939 | 0 | 0 | 393 | $0.0005 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r4 1 | anthropic/claude-haiku-5.5 | 1 | 3740 | 0 | 0 | 749 | $0.0007 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r4 2 | anthropic/claude-haiku-5.5 | 1 | 3740 | 0 | 0 | 1027 | $0.0009 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r4 3 | anthropic/claude-haiku-5.5 | 1 | 3740 | 0 | 0 | 723 | $0.0007 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r5 1 | anthropic/claude-haiku-5.5 | 1 | 3761 | 0 | 0 | 84 | $0.0004 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r5 2 | anthropic/claude-haiku-5.5 | 1 | 3761 | 0 | 0 | 119 | $0.0004 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r6 1 | anthropic/claude-haiku-5.5 | 1 | 4217 | 0 | 0 | 935 | $0.0009 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r6 2 | anthropic/claude-haiku-5.5 | 1 | 4217 | 0 | 0 | 856 | $0.0008 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r7 1 | anthropic/claude-haiku-5.5 | 1 | 4445 | 0 | 0 | 927 | $0.0009 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r7 2 | anthropic/claude-haiku-5.5 | 1 | 4445 | 0 | 0 | 681 | $0.0008 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r7 3 | anthropic/claude-haiku-5.5 | 1 | 4445 | 0 | 0 | 1049 | $0.0010 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r8 1 | anthropic/claude-haiku-5.5 | 1 | 4249 | 0 | 0 | 608 | $0.0007 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r8 2 | anthropic/claude-haiku-5.5 | 1 | 4249 | 0 | 0 | 593 | $0.0007 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r9 1 | anthropic/claude-haiku-5.5 | 1 | 4137 | 0 | 0 | 648 | $0.0007 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r9 2 | anthropic/claude-haiku-5.5 | 1 | 4137 | 0 | 0 | 734 | $0.0008 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r10 1 | anthropic/claude-haiku-5.5 | 1 | 3646 | 0 | 0 | 711 | $0.0007 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r10 2 | anthropic/claude-haiku-5.5 | 1 | 3646 | 0 | 0 | 677 | $0.0007 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r11 1 | anthropic/claude-haiku-5.5 | 1 | 3746 | 0 | 0 | 705 | $0.0007 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r11 2 | anthropic/claude-haiku-5.5 | 1 | 3746 | 0 | 0 | 695 | $0.0007 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r11 3 | anthropic/claude-haiku-5.5 | 1 | 3746 | 0 | 0 | 398 | $0.0006 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r12 1 | anthropic/claude-haiku-5.5 | 1 | 2259 | 0 | 0 | 494 | $0.0005 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r12 2 | anthropic/claude-haiku-5.5 | 1 | 2259 | 0 | 0 | 322 | $0.0004 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r13 1 | anthropic/claude-haiku-5.5 | 1 | 2529 | 0 | 0 | 219 | $0.0004 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r13 2 | anthropic/claude-haiku-5.5 | 1 | 2529 | 0 | 0 | 234 | $0.0004 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r14 1 | anthropic/claude-haiku-5.5 | 1 | 3551 | 0 | 0 | 663 | $0.0007 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r14 2 | anthropic/claude-haiku-5.5 | 1 | 3551 | 0 | 0 | 739 | $0.0007 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r15 1 | anthropic/claude-haiku-5.5 | 1 | 4374 | 0 | 0 | 83 | $0.0005 | 0 | 0 | 0 |
| S1-none-T1/score | initiative r15 2 | anthropic/claude-haiku-5.5 | 1 | 4374 | 0 | 0 | 108 | $0.0005 | 0 | 0 | 0 |
| S1-none-T2 | relay opening | anthropic/claude-sonnet-5.5 | 1 | 1291 | 0 | 0 | 1311 | $0.0157 | 0 | 0 | 0 |
| S1-none-T2/Pell | player r1 | anthropic/claude-fable-5.1 | 1 | 4 | 0 | 10958 | 443 | $0.1592 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Pell r1 | anthropic/claude-haiku-5.5 | 1 | 1825 | 0 | 0 | 59 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Bram | player r1 | openai/gpt-6-astra | 1 | 3 | 0 | 7243 | 106 | $0.0959 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Bram r1 | anthropic/claude-haiku-5.5 | 1 | 1609 | 0 | 0 | 61 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Sefa | player r1 | deepseek/deepseek-v4-pro-0813 | 1 | 165 | 7424 | 0 | 570 | $0.0024 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Sefa r1 | anthropic/claude-haiku-5.5 | 1 | 1861 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2 | dm r1 | anthropic/claude-opus-5.5 | 1 | 4 | 10225 | 35626 | 1361 | $0.2344 | 0 | 0 | 0 |
| S1-none-T2 | relay r1 card | anthropic/claude-sonnet-5.5 | 1 | 1816 | 0 | 0 | 585 | $0.0095 | 0 | 0 | 0 |
| S1-none-T2 | relay r1 card (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 2417 | 0 | 0 | 558 | $0.0104 | 0 | 0 | 0 |
| S1-none-T2/Pell | player r1 card 1 | anthropic/claude-fable-5.1 | 2 | 8 | 22810 | 1079 | 16 | $0.0201 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Pell r1 card | anthropic/claude-haiku-5.5 | 2 | 1370 | 0 | 0 | 120 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2 | dm r1 onward | anthropic/claude-opus-5.5 | 3 | 10 | 116736 | 35005 | 6194 | $0.3223 | 0 | 0 | 0 |
| S1-none-T2 | dm r1 onward | anthropic/claude-haiku-5.5 | 2 | 4124 | 0 | 0 | 575 | $0.0007 | 0 | 0 | 0 |
| S1-none-T2 | relay r1 | anthropic/claude-sonnet-5.5 | 1 | 2992 | 0 | 0 | 2447 | $0.0305 | 0 | 0 | 0 |
| S1-none-T2 | relay r1 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3917 | 0 | 0 | 787 | $0.0157 | 0 | 0 | 0 |
| S1-none-T2 | relay r1 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3932 | 0 | 0 | 780 | $0.0157 | 0 | 0 | 0 |
| S1-none-T2 | relay r1 (Sefa's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 3913 | 0 | 0 | 781 | $0.0156 | 0 | 0 | 0 |
| S1-none-T2/Bram | player r2 | openai/gpt-6-astra | 1 | 3 | 7243 | 675 | 122 | $0.0218 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Bram r2 | anthropic/claude-haiku-5.5 | 1 | 1312 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Sefa | player r2 | deepseek/deepseek-v4-pro-0813 | 1 | 912 | 7424 | 0 | 2239 | $0.0077 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Sefa r2 | anthropic/claude-haiku-5.5 | 1 | 1319 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Pell | player r2 | anthropic/claude-fable-5.1 | 1 | 4 | 12037 | 769 | 954 | $0.0604 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Pell r2 | anthropic/claude-haiku-5.5 | 1 | 1654 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2 | dm r2 | anthropic/claude-opus-5.5 | 3 | 12 | 93967 | 69651 | 8303 | $0.5381 | 0 | 0 | 0 |
| S1-none-T2 | dm r2 | anthropic/claude-haiku-5.5 | 1 | 3266 | 0 | 0 | 395 | $0.0005 | 0 | 0 | 0 |
| S1-none-T2 | relay r2 | anthropic/claude-sonnet-5.5 | 1 | 2832 | 0 | 0 | 3261 | $0.0383 | 0 | 0 | 0 |
| S1-none-T2 | relay r2 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4015 | 0 | 0 | 1041 | $0.0184 | 0 | 0 | 0 |
| S1-none-T2 | relay r2 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4057 | 0 | 0 | 1077 | $0.0189 | 0 | 0 | 0 |
| S1-none-T2 | relay r2 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3960 | 0 | 0 | 1010 | $0.0180 | 0 | 0 | 0 |
| S1-none-T2/Sefa | player r3 | deepseek/deepseek-v4-pro-0813 | 1 | 1023 | 8192 | 0 | 993 | $0.0047 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Sefa r3 | anthropic/claude-haiku-5.5 | 1 | 1697 | 0 | 0 | 79 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Pell | player r3 | anthropic/claude-fable-5.1 | 1 | 4 | 12806 | 1576 | 712 | $0.0585 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Pell r3 | anthropic/claude-haiku-5.5 | 1 | 1857 | 0 | 0 | 83 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Bram | player r3 | openai/gpt-6-astra | 1 | 3 | 7918 | 835 | 117 | $0.0242 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Bram r3 | anthropic/claude-haiku-5.5 | 1 | 1507 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2 | dm r3 | anthropic/claude-opus-5.5 | 4 | 16 | 153556 | 80560 | 10808 | $0.6555 | 0 | 0 | 0 |
| S1-none-T2 | dm r3 | anthropic/claude-haiku-5.5 | 2 | 6639 | 0 | 0 | 590 | $0.0010 | 0 | 0 | 0 |
| S1-none-T2 | relay r3 | anthropic/claude-sonnet-5.5 | 1 | 3363 | 0 | 0 | 3711 | $0.0438 | 0 | 0 | 0 |
| S1-none-T2 | relay r3 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4532 | 0 | 0 | 1052 | $0.0196 | 0 | 0 | 0 |
| S1-none-T2 | relay r3 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4858 | 0 | 0 | 1417 | $0.0239 | 0 | 0 | 0 |
| S1-none-T2 | relay r3 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 4890 | 0 | 0 | 1410 | $0.0239 | 0 | 0 | 0 |
| S1-none-T2/Pell | player r4 | anthropic/claude-fable-5.1 | 1 | 4 | 14382 | 1567 | 500 | $0.0482 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Pell r4 | anthropic/claude-haiku-5.5 | 1 | 1762 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Bram | player r4 | openai/gpt-6-astra | 1 | 3 | 8753 | 1094 | 111 | $0.0280 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Bram r4 | anthropic/claude-haiku-5.5 | 1 | 1890 | 0 | 0 | 61 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Sefa | player r4 | deepseek/deepseek-v4-pro-0813 | 1 | 1298 | 8960 | 0 | 664 | $0.0043 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Sefa r4 | anthropic/claude-haiku-5.5 | 1 | 1663 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2 | dm r4 | anthropic/claude-opus-5.5 | 4 | 14 | 162324 | 82695 | 9661 | $0.6470 | 0 | 0 | 0 |
| S1-none-T2 | dm r4 | anthropic/claude-haiku-5.5 | 1 | 4044 | 0 | 0 | 506 | $0.0007 | 0 | 0 | 0 |
| S1-none-T2 | relay r4 | anthropic/claude-sonnet-5.5 | 1 | 3122 | 0 | 0 | 2423 | $0.0305 | 0 | 0 | 0 |
| S1-none-T2/Bram | player r5 | openai/gpt-6-astra | 1 | 3 | 9847 | 494 | 189 | $0.0255 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Bram r5 | anthropic/claude-haiku-5.5 | 1 | 1099 | 0 | 0 | 58 | $0.0001 | 0 | 0 | 0 |
| S1-none-T2/Sefa | player r5 | deepseek/deepseek-v4-pro-0813 | 1 | 825 | 9984 | 0 | 296 | $0.0028 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Sefa r5 | anthropic/claude-haiku-5.5 | 1 | 1125 | 0 | 0 | 86 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2 | dm r5 | anthropic/claude-opus-5.5 | 6 | 24 | 212347 | 154486 | 11671 | $1.0598 | 0 | 0 | 0 |
| S1-none-T2 | dm r5 | anthropic/claude-haiku-5.5 | 2 | 6490 | 0 | 0 | 719 | $0.0010 | 0 | 0 | 0 |
| S1-none-T2 | relay r5 | anthropic/claude-sonnet-5.5 | 2 | 4665 | 0 | 0 | 4719 | $0.0565 | 0 | 0 | 0 |
| S1-none-T2 | relay r5 (asked again) | anthropic/claude-sonnet-5.5 | 1 | 2241 | 0 | 0 | 1871 | $0.0232 | 0 | 0 | 0 |
| S1-none-T2/Pell | player r5 | anthropic/claude-fable-5.1 | 1 | 4 | 15949 | 1605 | 742 | $0.0612 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Pell r5 | anthropic/claude-haiku-5.5 | 1 | 2079 | 0 | 0 | 77 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Sefa | player r6 | deepseek/deepseek-v4-pro-0813 | 1 | 1069 | 10496 | 0 | 460 | $0.0036 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Sefa r6 | anthropic/claude-haiku-5.5 | 1 | 1422 | 0 | 0 | 82 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Bram | player r6 | openai/gpt-6-astra | 1 | 3 | 10341 | 784 | 144 | $0.0274 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Bram r6 | anthropic/claude-haiku-5.5 | 1 | 1368 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2 | dm r6 | anthropic/claude-opus-5.5 | 7 | 28 | 297843 | 164051 | 14322 | $1.1771 | 0 | 0 | 0 |
| S1-none-T2 | dm r6 | anthropic/claude-haiku-5.5 | 4 | 11518 | 0 | 0 | 1524 | $0.0019 | 0 | 0 | 0 |
| S1-none-T2 | relay r6 | anthropic/claude-sonnet-5.5 | 2 | 5165 | 0 | 0 | 3144 | $0.0418 | 0 | 0 | 0 |
| S1-none-T2 | relay r6 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3843 | 0 | 0 | 894 | $0.0166 | 0 | 0 | 0 |
| S1-none-T2 | relay r6 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 3829 | 0 | 0 | 893 | $0.0166 | 0 | 0 | 0 |
| S1-none-T2/Pell | player r6 | anthropic/claude-fable-5.1 | 1 | 4 | 17554 | 1527 | 605 | $0.0538 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Pell r6 | anthropic/claude-haiku-5.5 | 1 | 1802 | 0 | 0 | 83 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Bram | player r7 | openai/gpt-6-astra | 1 | 3 | 11125 | 754 | 176 | $0.0294 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Bram r7 | anthropic/claude-haiku-5.5 | 1 | 1459 | 0 | 0 | 81 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Sefa | player r7 | deepseek/deepseek-v4-pro-0813 | 1 | 1358 | 11264 | 0 | 1078 | $0.0057 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Sefa r7 | anthropic/claude-haiku-5.5 | 1 | 1737 | 0 | 0 | 59 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2 | dm r7 | anthropic/claude-opus-5.5 | 5 | 20 | 170545 | 162289 | 14793 | $1.1519 | 0 | 0 | 0 |
| S1-none-T2 | dm r7 | anthropic/claude-haiku-5.5 | 2 | 7227 | 0 | 0 | 995 | $0.0012 | 0 | 0 | 0 |
| S1-none-T2 | relay r7 | anthropic/claude-sonnet-5.5 | 2 | 5195 | 0 | 0 | 3315 | $0.0435 | 0 | 0 | 0 |
| S1-none-T2/Pell | player r7 | anthropic/claude-fable-5.1 | 1 | 4 | 19081 | 1409 | 658 | $0.0553 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Pell r7 | anthropic/claude-haiku-5.5 | 1 | 1737 | 0 | 0 | 81 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Sefa | player r8 | deepseek/deepseek-v4-pro-0813 | 1 | 1022 | 12544 | 0 | 322 | $0.0034 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Sefa r8 | anthropic/claude-haiku-5.5 | 1 | 1699 | 0 | 0 | 92 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Bram | player r8 | openai/gpt-6-astra | 1 | 3 | 11879 | 783 | 165 | $0.0299 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Bram r8 | anthropic/claude-haiku-5.5 | 1 | 1394 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2 | dm r8 | anthropic/claude-opus-5.5 | 6 | 24 | 254268 | 168479 | 12897 | $1.1612 | 0 | 0 | 0 |
| S1-none-T2 | dm r8 | anthropic/claude-haiku-5.5 | 3 | 8426 | 0 | 0 | 1110 | $0.0014 | 0 | 0 | 0 |
| S1-none-T2 | relay r8 | anthropic/claude-sonnet-5.5 | 2 | 4561 | 0 | 0 | 2902 | $0.0381 | 0 | 0 | 0 |
| S1-none-T2 | relay r8 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3117 | 0 | 0 | 799 | $0.0142 | 0 | 0 | 0 |
| S1-none-T2/Pell | player r8 | anthropic/claude-fable-5.1 | 1 | 4 | 20490 | 1706 | 824 | $0.0677 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Pell r8 | anthropic/claude-haiku-5.5 | 1 | 1906 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Bram | player r9 | openai/gpt-6-astra | 1 | 3 | 12662 | 718 | 99 | $0.0266 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Bram r9 | anthropic/claude-haiku-5.5 | 1 | 1273 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Sefa | player r9 | deepseek/deepseek-v4-pro-0813 | 1 | 1000 | 13312 | 0 | 414 | $0.0037 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Sefa r9 | anthropic/claude-haiku-5.5 | 1 | 1294 | 0 | 0 | 79 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2 | dm r9 | anthropic/claude-opus-5.5 | 7 | 28 | 354673 | 171814 | 12571 | $1.1899 | 0 | 0 | 0 |
| S1-none-T2 | dm r9 | anthropic/claude-haiku-5.5 | 4 | 10312 | 0 | 0 | 931 | $0.0015 | 0 | 0 | 0 |
| S1-none-T2 | relay r9 | anthropic/claude-sonnet-5.5 | 2 | 4370 | 0 | 0 | 2354 | $0.0323 | 0 | 0 | 0 |
| S1-none-T2/Pell | player r9 | anthropic/claude-fable-5.1 | 1 | 4 | 22196 | 1546 | 813 | $0.0656 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Pell r9 | anthropic/claude-haiku-5.5 | 1 | 1881 | 0 | 0 | 89 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Sefa | player r10 | deepseek/deepseek-v4-pro-0813 | 1 | 806 | 14080 | 0 | 411 | $0.0035 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Sefa r10 | anthropic/claude-haiku-5.5 | 1 | 1222 | 0 | 0 | 81 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Bram | player r10 | openai/gpt-6-astra | 1 | 3 | 13380 | 460 | 49 | $0.0216 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Bram r10 | anthropic/claude-haiku-5.5 | 1 | 887 | 0 | 0 | 76 | $0.0001 | 0 | 0 | 0 |
| S1-none-T2 | dm r10 | anthropic/claude-opus-5.5 | 6 | 24 | 254259 | 173283 | 14646 | $1.2204 | 0 | 0 | 0 |
| S1-none-T2 | dm r10 | anthropic/claude-haiku-5.5 | 3 | 10546 | 0 | 0 | 2102 | $0.0021 | 0 | 0 | 0 |
| S1-none-T2 | relay r10 | anthropic/claude-sonnet-5.5 | 2 | 5184 | 0 | 0 | 3784 | $0.0482 | 0 | 0 | 0 |
| S1-none-T2 | relay r10 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3745 | 0 | 0 | 1372 | $0.0212 | 0 | 0 | 0 |
| S1-none-T2/Pell | player r10 | anthropic/claude-fable-5.1 | 1 | 4 | 23742 | 1578 | 867 | $0.0691 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Pell r10 | anthropic/claude-haiku-5.5 | 1 | 2077 | 0 | 0 | 78 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Bram | player r11 | openai/gpt-6-astra | 1 | 3 | 13840 | 836 | 129 | $0.0308 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Bram r11 | anthropic/claude-haiku-5.5 | 1 | 1659 | 0 | 0 | 53 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Sefa | player r11 | deepseek/deepseek-v4-pro-0813 | 1 | 1338 | 14592 | 0 | 602 | $0.0048 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Sefa r11 | anthropic/claude-haiku-5.5 | 1 | 1872 | 0 | 0 | 81 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Pell | player r11 | anthropic/claude-fable-5.1 | 1 | 4 | 25320 | 1848 | 891 | $0.0740 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Pell r11 | anthropic/claude-haiku-5.5 | 1 | 2246 | 0 | 0 | 93 | $0.0003 | 0 | 0 | 0 |
| S1-none-T2 | dm r11 | anthropic/claude-opus-5.5 | 4 | 16 | 211173 | 101877 | 14162 | $0.8407 | 0 | 0 | 0 |
| S1-none-T2 | dm r11 | anthropic/claude-haiku-5.5 | 2 | 9170 | 0 | 0 | 1745 | $0.0018 | 0 | 0 | 0 |
| S1-none-T2 | relay r11 | anthropic/claude-sonnet-5.5 | 1 | 3601 | 0 | 0 | 4037 | $0.0476 | 0 | 0 | 0 |
| S1-none-T2 | relay r11 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5011 | 0 | 0 | 1307 | $0.0231 | 0 | 0 | 0 |
| S1-none-T2 | relay r11 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5087 | 0 | 0 | 1379 | $0.0240 | 0 | 0 | 0 |
| S1-none-T2/Sefa | player r12 | deepseek/deepseek-v4-pro-0813 | 1 | 1536 | 15616 | 0 | 491 | $0.0048 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Sefa r12 | anthropic/claude-haiku-5.5 | 1 | 1932 | 0 | 0 | 58 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Pell | player r12 | anthropic/claude-fable-5.1 | 1 | 4 | 27168 | 1938 | 798 | $0.0710 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Pell r12 | anthropic/claude-haiku-5.5 | 1 | 2168 | 0 | 0 | 83 | $0.0003 | 0 | 0 | 0 |
| S1-none-T2/Bram | player r12 | openai/gpt-6-astra | 1 | 3 | 14676 | 1071 | 126 | $0.0344 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Bram r12 | anthropic/claude-haiku-5.5 | 1 | 1863 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2 | dm r12 | anthropic/claude-opus-5.5 | 3 | 12 | 163748 | 101845 | 12809 | $0.8064 | 0 | 0 | 0 |
| S1-none-T2 | dm r12 | anthropic/claude-haiku-5.5 | 2 | 7648 | 0 | 0 | 617 | $0.0011 | 0 | 0 | 0 |
| S1-none-T2 | relay r12 | anthropic/claude-sonnet-5.5 | 1 | 4018 | 0 | 0 | 4287 | $0.0509 | 0 | 0 | 0 |
| S1-none-T2 | relay r12 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5522 | 0 | 0 | 1353 | $0.0246 | 0 | 0 | 0 |
| S1-none-T2 | relay r12 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5300 | 0 | 0 | 1136 | $0.0220 | 0 | 0 | 0 |
| S1-none-T2 | relay r12 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5806 | 0 | 0 | 1662 | $0.0282 | 0 | 0 | 0 |
| S1-none-T2/Pell | player r13 | anthropic/claude-fable-5.1 | 1 | 4 | 29106 | 1842 | 838 | $0.0722 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Pell r13 | anthropic/claude-haiku-5.5 | 1 | 2134 | 0 | 0 | 76 | $0.0003 | 0 | 0 | 0 |
| S1-none-T2/Bram | player r13 | openai/gpt-6-astra | 1 | 3 | 15747 | 1340 | 156 | $0.0403 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Bram r13 | anthropic/claude-haiku-5.5 | 1 | 2194 | 0 | 0 | 73 | $0.0003 | 0 | 0 | 0 |
| S1-none-T2/Sefa | player r13 | deepseek/deepseek-v4-pro-0813 | 1 | 1405 | 16896 | 0 | 451 | $0.0047 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Sefa r13 | anthropic/claude-haiku-5.5 | 1 | 1947 | 0 | 0 | 76 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2 | dm r13 | anthropic/claude-opus-5.5 | 1 | 4 | 50389 | 47340 | 1370 | $0.2838 | 0 | 0 | 0 |
| S1-none-T2 | relay r13 card | anthropic/claude-sonnet-5.5 | 2 | 3972 | 0 | 0 | 1140 | $0.0193 | 0 | 0 | 0 |
| S1-none-T2 | relay r13 card (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 2679 | 0 | 0 | 535 | $0.0107 | 0 | 0 | 0 |
| S1-none-T2 | relay r13 card (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 2699 | 0 | 0 | 538 | $0.0108 | 0 | 0 | 0 |
| S1-none-T2/Bram | player r13 card 1 | openai/gpt-6-astra | 2 | 6 | 34795 | 751 | 17 | $0.0451 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Bram r13 card | anthropic/claude-haiku-5.5 | 2 | 1466 | 0 | 0 | 123 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Pell | player r13 card 1 | anthropic/claude-fable-5.1 | 2 | 8 | 62995 | 1268 | 242 | $0.0438 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Pell r13 card | anthropic/claude-haiku-5.5 | 2 | 1286 | 0 | 0 | 114 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2 | dm r13 onward | anthropic/claude-opus-5.5 | 2 | 6 | 119107 | 47615 | 4652 | $0.3550 | 0 | 0 | 0 |
| S1-none-T2 | dm r13 onward | anthropic/claude-haiku-5.5 | 2 | 4613 | 0 | 0 | 261 | $0.0006 | 0 | 0 | 0 |
| S1-none-T2 | relay r13 | anthropic/claude-sonnet-5.5 | 1 | 3836 | 0 | 0 | 2562 | $0.0333 | 0 | 0 | 0 |
| S1-none-T2 | relay r13 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4702 | 0 | 0 | 708 | $0.0165 | 0 | 0 | 0 |
| S1-none-T2/Bram | player r14 | openai/gpt-6-astra | 1 | 3 | 17838 | 504 | 182 | $0.0333 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Bram r14 | anthropic/claude-haiku-5.5 | 1 | 1307 | 0 | 0 | 76 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Sefa | player r14 | deepseek/deepseek-v4-pro-0813 | 1 | 838 | 18176 | 0 | 455 | $0.0041 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Sefa r14 | anthropic/claude-haiku-5.5 | 1 | 1366 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Pell | player r14 | anthropic/claude-fable-5.1 | 1 | 4 | 32216 | 503 | 792 | $0.0540 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Pell r14 | anthropic/claude-haiku-5.5 | 1 | 1367 | 0 | 0 | 79 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2 | dm r14 | anthropic/claude-opus-5.5 | 2 | 8 | 74978 | 93734 | 4553 | $0.5810 | 0 | 0 | 0 |
| S1-none-T2 | dm r14 | anthropic/claude-haiku-5.5 | 1 | 3209 | 0 | 0 | 470 | $0.0006 | 0 | 0 | 0 |
| S1-none-T2 | relay r14 | anthropic/claude-sonnet-5.5 | 1 | 3089 | 0 | 0 | 2325 | $0.0294 | 0 | 0 | 0 |
| S1-none-T2 | relay r14 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4072 | 0 | 0 | 809 | $0.0162 | 0 | 0 | 0 |
| S1-none-T2 | relay r14 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3971 | 0 | 0 | 710 | $0.0150 | 0 | 0 | 0 |
| S1-none-T2 | relay r14 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3958 | 0 | 0 | 679 | $0.0147 | 0 | 0 | 0 |
| S1-none-T2/Sefa | player r15 | deepseek/deepseek-v4-pro-0813 | 1 | 815 | 18944 | 0 | 821 | $0.0051 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Sefa r15 | anthropic/claude-haiku-5.5 | 1 | 1386 | 0 | 0 | 74 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Pell | player r15 | anthropic/claude-fable-5.1 | 1 | 4 | 32719 | 1252 | 746 | $0.0612 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Pell r15 | anthropic/claude-haiku-5.5 | 1 | 1607 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Bram | player r15 | openai/gpt-6-astra | 1 | 3 | 18342 | 765 | 142 | $0.0350 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Bram r15 | anthropic/claude-haiku-5.5 | 1 | 1357 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2 | dm r15 | anthropic/claude-opus-5.5 | 3 | 12 | 146013 | 100259 | 9305 | $0.7234 | 0 | 0 | 0 |
| S1-none-T2 | dm r15 | anthropic/claude-haiku-5.5 | 1 | 3939 | 0 | 0 | 406 | $0.0006 | 0 | 0 | 0 |
| S1-none-T2 | relay r15 | anthropic/claude-sonnet-5.5 | 1 | 3541 | 0 | 0 | 4093 | $0.0480 | 0 | 0 | 0 |
| S1-none-T2 | relay r15 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5053 | 0 | 0 | 1399 | $0.0241 | 0 | 0 | 0 |
| S1-none-T2 | relay r15 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4799 | 0 | 0 | 1152 | $0.0211 | 0 | 0 | 0 |
| S1-none-T2 | relay r15 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5050 | 0 | 0 | 1414 | $0.0242 | 0 | 0 | 0 |
| S1-none-T2/Bram | after 1 | openai/gpt-6-astra | 1 | 3 | 19107 | 1080 | 209 | $0.0431 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Bram after 1 | anthropic/claude-haiku-5.5 | 1 | 664 | 0 | 0 | 61 | $0.0001 | 0 | 0 | 0 |
| S1-none-T2/Bram | after 2 | openai/gpt-6-astra | 1 | 3 | 20187 | 225 | 191 | $0.0326 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Bram after 2 | anthropic/claude-haiku-5.5 | 1 | 641 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| S1-none-T2/Bram | after 3 | openai/gpt-6-astra | 1 | 3 | 20412 | 208 | 110 | $0.0285 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Bram after 3 | anthropic/claude-haiku-5.5 | 1 | 493 | 0 | 0 | 59 | $0.0001 | 0 | 0 | 0 |
| S1-none-T2/Sefa | after 1 | deepseek/deepseek-v4-pro-0813 | 1 | 1488 | 19456 | 0 | 451 | $0.0051 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Sefa after 1 | anthropic/claude-haiku-5.5 | 1 | 656 | 0 | 0 | 64 | $0.0001 | 0 | 0 | 0 |
| S1-none-T2/Sefa | after 2 | deepseek/deepseek-v4-pro-0813 | 1 | 464 | 20736 | 0 | 1157 | $0.0057 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Sefa after 2 | anthropic/claude-haiku-5.5 | 1 | 742 | 0 | 0 | 80 | $0.0001 | 0 | 0 | 0 |
| S1-none-T2/Sefa | after 3 | deepseek/deepseek-v4-pro-0813 | 1 | 518 | 20992 | 0 | 663 | $0.0045 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Sefa after 3 | anthropic/claude-haiku-5.5 | 1 | 698 | 0 | 0 | 58 | $0.0001 | 0 | 0 | 0 |
| S1-none-T2/Pell | after 1 | anthropic/claude-fable-5.1 | 1 | 4 | 33971 | 1711 | 902 | $0.0750 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Pell after 1 | anthropic/claude-haiku-5.5 | 1 | 1174 | 0 | 0 | 86 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Pell | after 2 | anthropic/claude-fable-5.1 | 1 | 4 | 35682 | 869 | 844 | $0.0620 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Pell after 2 | anthropic/claude-haiku-5.5 | 1 | 1125 | 0 | 0 | 113 | $0.0002 | 0 | 0 | 0 |
| S1-none-T2/Pell | after 3 | anthropic/claude-fable-5.1 | 1 | 4 | 36551 | 807 | 1274 | $0.0830 | 0 | 0 | 0 |
| S1-none-T2/check | check S1-none-T2 Pell after 3 | anthropic/claude-haiku-5.5 | 1 | 1049 | 0 | 0 | 74 | $0.0001 | 0 | 0 | 0 |
| S1-none-T2/score | round r1 1 | anthropic/claude-haiku-5.5 | 1 | 3463 | 0 | 0 | 1666 | $0.0012 | 0 | 0 | 0 |
| S1-none-T2/score | round r1 2 | anthropic/claude-haiku-5.5 | 1 | 3463 | 0 | 0 | 1710 | $0.0012 | 0 | 0 | 0 |
| S1-none-T2/score | round r1 referee | anthropic/claude-opus-5.5 | 1 | 3463 | 0 | 0 | 1063 | $0.0351 | 0 | 0 | 0 |
| S1-none-T2/score | hold r1 1 | anthropic/claude-haiku-5.5 | 1 | 3691 | 0 | 0 | 442 | $0.0006 | 0 | 0 | 0 |
| S1-none-T2/score | hold r1 2 | anthropic/claude-haiku-5.5 | 1 | 3691 | 0 | 0 | 455 | $0.0006 | 0 | 0 | 0 |
| S1-none-T2/score | round r2 1 | anthropic/claude-haiku-5.5 | 1 | 3760 | 0 | 0 | 1348 | $0.0010 | 0 | 0 | 0 |
| S1-none-T2/score | round r2 2 | anthropic/claude-haiku-5.5 | 1 | 3760 | 0 | 0 | 1379 | $0.0011 | 0 | 0 | 0 |
| S1-none-T2/score | round r2 referee | anthropic/claude-opus-5.5 | 1 | 3760 | 0 | 0 | 1150 | $0.0380 | 0 | 0 | 0 |
| S1-none-T2/score | hold r2 1 | anthropic/claude-haiku-5.5 | 1 | 3988 | 0 | 0 | 1270 | $0.0010 | 0 | 0 | 0 |
| S1-none-T2/score | hold r2 2 | anthropic/claude-haiku-5.5 | 1 | 3988 | 0 | 0 | 1352 | $0.0011 | 0 | 0 | 0 |
| S1-none-T2/score | hold r2 referee | anthropic/claude-opus-5.5 | 1 | 3988 | 0 | 0 | 851 | $0.0330 | 0 | 0 | 0 |
| S1-none-T2/score | round r3 1 | anthropic/claude-haiku-5.5 | 1 | 4439 | 0 | 0 | 1496 | $0.0012 | 0 | 0 | 0 |
| S1-none-T2/score | round r3 2 | anthropic/claude-haiku-5.5 | 1 | 4439 | 0 | 0 | 1593 | $0.0012 | 0 | 0 | 0 |
| S1-none-T2/score | hold r3 1 | anthropic/claude-haiku-5.5 | 1 | 4667 | 0 | 0 | 1033 | $0.0010 | 0 | 0 | 0 |
| S1-none-T2/score | hold r3 2 | anthropic/claude-haiku-5.5 | 1 | 4667 | 0 | 0 | 1130 | $0.0010 | 0 | 0 | 0 |
| S1-none-T2/score | hold r3 referee | anthropic/claude-opus-5.5 | 1 | 4667 | 0 | 0 | 818 | $0.0350 | 0 | 0 | 0 |
| S1-none-T2/score | round r4 1 | anthropic/claude-haiku-5.5 | 1 | 4181 | 0 | 0 | 1982 | $0.0014 | 0 | 0 | 0 |
| S1-none-T2/score | round r4 2 | anthropic/claude-haiku-5.5 | 1 | 4181 | 0 | 0 | 1896 | $0.0014 | 0 | 0 | 0 |
| S1-none-T2/score | round r4 referee | anthropic/claude-opus-5.5 | 1 | 4181 | 0 | 0 | 1238 | $0.0415 | 0 | 0 | 0 |
| S1-none-T2/score | hold r4 1 | anthropic/claude-haiku-5.5 | 1 | 4409 | 0 | 0 | 1409 | $0.0011 | 0 | 0 | 0 |
| S1-none-T2/score | hold r4 2 | anthropic/claude-haiku-5.5 | 1 | 4409 | 0 | 0 | 1408 | $0.0011 | 0 | 0 | 0 |
| S1-none-T2/score | hold r4 referee | anthropic/claude-opus-5.5 | 1 | 4409 | 0 | 0 | 1010 | $0.0378 | 0 | 0 | 0 |
| S1-none-T2/score | round r5 1 | anthropic/claude-haiku-5.5 | 1 | 4773 | 0 | 0 | 1808 | $0.0014 | 0 | 0 | 0 |
| S1-none-T2/score | round r5 2 | anthropic/claude-haiku-5.5 | 1 | 4773 | 0 | 0 | 1512 | $0.0012 | 0 | 0 | 0 |
| S1-none-T2/score | hold r5 1 | anthropic/claude-haiku-5.5 | 1 | 5001 | 0 | 0 | 1646 | $0.0013 | 0 | 0 | 0 |
| S1-none-T2/score | hold r5 2 | anthropic/claude-haiku-5.5 | 1 | 5001 | 0 | 0 | 1585 | $0.0013 | 0 | 0 | 0 |
| S1-none-T2/score | round r6 1 | anthropic/claude-haiku-5.5 | 1 | 5403 | 0 | 0 | 1872 | $0.0015 | 0 | 0 | 0 |
| S1-none-T2/score | round r6 2 | anthropic/claude-haiku-5.5 | 1 | 5403 | 0 | 0 | 2451 | $0.0018 | 0 | 0 | 0 |
| S1-none-T2/score | round r6 referee | anthropic/claude-opus-5.5 | 1 | 5403 | 0 | 0 | 1058 | $0.0428 | 0 | 0 | 0 |
| S1-none-T2/score | hold r6 1 | anthropic/claude-haiku-5.5 | 1 | 5631 | 0 | 0 | 406 | $0.0008 | 0 | 0 | 0 |
| S1-none-T2/score | hold r6 2 | anthropic/claude-haiku-5.5 | 1 | 5631 | 0 | 0 | 1210 | $0.0012 | 0 | 0 | 0 |
| S1-none-T2/score | hold r6 referee | anthropic/claude-opus-5.5 | 1 | 5631 | 0 | 0 | 960 | $0.0417 | 0 | 0 | 0 |
| S1-none-T2/score | round r7 1 | anthropic/claude-haiku-5.5 | 1 | 5323 | 0 | 0 | 2645 | $0.0019 | 0 | 0 | 0 |
| S1-none-T2/score | round r7 2 | anthropic/claude-haiku-5.5 | 1 | 5323 | 0 | 0 | 2636 | $0.0019 | 0 | 0 | 0 |
| S1-none-T2/score | round r7 referee | anthropic/claude-opus-5.5 | 1 | 5323 | 0 | 0 | 1252 | $0.0463 | 0 | 0 | 0 |
| S1-none-T2/score | hold r7 1 | anthropic/claude-haiku-5.5 | 1 | 5551 | 0 | 0 | 412 | $0.0008 | 0 | 0 | 0 |
| S1-none-T2/score | hold r7 2 | anthropic/claude-haiku-5.5 | 1 | 5551 | 0 | 0 | 1456 | $0.0013 | 0 | 0 | 0 |
| S1-none-T2/score | hold r7 referee | anthropic/claude-opus-5.5 | 1 | 5551 | 0 | 0 | 1505 | $0.0523 | 0 | 0 | 0 |
| S1-none-T2/score | round r8 1 | anthropic/claude-haiku-5.5 | 1 | 4891 | 0 | 0 | 1917 | $0.0014 | 0 | 0 | 0 |
| S1-none-T2/score | round r8 2 | anthropic/claude-haiku-5.5 | 1 | 4891 | 0 | 0 | 1759 | $0.0014 | 0 | 0 | 0 |
| S1-none-T2/score | round r8 referee | anthropic/claude-opus-5.5 | 1 | 4891 | 0 | 0 | 1237 | $0.0443 | 0 | 0 | 0 |
| S1-none-T2/score | hold r8 1 | anthropic/claude-haiku-5.5 | 1 | 5119 | 0 | 0 | 417 | $0.0007 | 0 | 0 | 0 |
| S1-none-T2/score | hold r8 2 | anthropic/claude-haiku-5.5 | 1 | 5119 | 0 | 0 | 1212 | $0.0011 | 0 | 0 | 0 |
| S1-none-T2/score | hold r8 referee | anthropic/claude-opus-5.5 | 1 | 5119 | 0 | 0 | 1092 | $0.0423 | 0 | 0 | 0 |
| S1-none-T2/score | round r9 1 | anthropic/claude-haiku-5.5 | 1 | 4716 | 0 | 0 | 1901 | $0.0014 | 0 | 0 | 0 |
| S1-none-T2/score | round r9 2 | anthropic/claude-haiku-5.5 | 1 | 4716 | 0 | 0 | 2021 | $0.0015 | 0 | 0 | 0 |
| S1-none-T2/score | round r9 referee | anthropic/claude-opus-5.5 | 1 | 4716 | 0 | 0 | 1206 | $0.0430 | 0 | 0 | 0 |
| S1-none-T2/score | hold r9 1 | anthropic/claude-haiku-5.5 | 1 | 4944 | 0 | 0 | 1737 | $0.0014 | 0 | 0 | 0 |
| S1-none-T2/score | hold r9 2 | anthropic/claude-haiku-5.5 | 1 | 4944 | 0 | 0 | 1477 | $0.0012 | 0 | 0 | 0 |
| S1-none-T2/score | hold r9 referee | anthropic/claude-opus-5.5 | 1 | 4944 | 0 | 0 | 1247 | $0.0447 | 0 | 0 | 0 |
| S1-none-T2/score | round r10 1 | anthropic/claude-haiku-5.5 | 1 | 5288 | 0 | 0 | 1934 | $0.0015 | 0 | 0 | 0 |
| S1-none-T2/score | round r10 2 | anthropic/claude-haiku-5.5 | 1 | 5288 | 0 | 0 | 2069 | $0.0016 | 0 | 0 | 0 |
| S1-none-T2/score | round r10 referee | anthropic/claude-opus-5.5 | 1 | 5288 | 0 | 0 | 1073 | $0.0426 | 0 | 0 | 0 |
| S1-none-T2/score | hold r10 1 | anthropic/claude-haiku-5.5 | 1 | 5516 | 0 | 0 | 1530 | $0.0013 | 0 | 0 | 0 |
| S1-none-T2/score | hold r10 2 | anthropic/claude-haiku-5.5 | 1 | 5516 | 0 | 0 | 1621 | $0.0014 | 0 | 0 | 0 |
| S1-none-T2/score | hold r10 referee | anthropic/claude-opus-5.5 | 1 | 5516 | 0 | 0 | 990 | $0.0419 | 0 | 0 | 0 |
| S1-none-T2/score | round r11 1 | anthropic/claude-haiku-5.5 | 1 | 4568 | 0 | 0 | 2230 | $0.0016 | 0 | 0 | 0 |
| S1-none-T2/score | round r11 2 | anthropic/claude-haiku-5.5 | 1 | 4568 | 0 | 0 | 1927 | $0.0014 | 0 | 0 | 0 |
| S1-none-T2/score | round r11 referee | anthropic/claude-opus-5.5 | 1 | 4568 | 0 | 0 | 1116 | $0.0406 | 0 | 0 | 0 |
| S1-none-T2/score | hold r11 1 | anthropic/claude-haiku-5.5 | 1 | 4796 | 0 | 0 | 1871 | $0.0014 | 0 | 0 | 0 |
| S1-none-T2/score | hold r11 2 | anthropic/claude-haiku-5.5 | 1 | 4796 | 0 | 0 | 1727 | $0.0013 | 0 | 0 | 0 |
| S1-none-T2/score | round r12 1 | anthropic/claude-haiku-5.5 | 1 | 5042 | 0 | 0 | 1762 | $0.0014 | 0 | 0 | 0 |
| S1-none-T2/score | round r12 2 | anthropic/claude-haiku-5.5 | 1 | 5042 | 0 | 0 | 1911 | $0.0015 | 0 | 0 | 0 |
| S1-none-T2/score | round r12 referee | anthropic/claude-opus-5.5 | 1 | 5042 | 0 | 0 | 1107 | $0.0423 | 0 | 0 | 0 |
| S1-none-T2/score | hold r12 1 | anthropic/claude-haiku-5.5 | 1 | 5270 | 0 | 0 | 1345 | $0.0012 | 0 | 0 | 0 |
| S1-none-T2/score | hold r12 2 | anthropic/claude-haiku-5.5 | 1 | 5270 | 0 | 0 | 1548 | $0.0013 | 0 | 0 | 0 |
| S1-none-T2/score | hold r12 referee | anthropic/claude-opus-5.5 | 1 | 5270 | 0 | 0 | 1186 | $0.0448 | 0 | 0 | 0 |
| S1-none-T2/score | round r13 1 | anthropic/claude-haiku-5.5 | 1 | 3904 | 0 | 0 | 1432 | $0.0011 | 0 | 0 | 0 |
| S1-none-T2/score | round r13 2 | anthropic/claude-haiku-5.5 | 1 | 3904 | 0 | 0 | 1824 | $0.0013 | 0 | 0 | 0 |
| S1-none-T2/score | round r13 referee | anthropic/claude-opus-5.5 | 1 | 3904 | 0 | 0 | 1077 | $0.0372 | 0 | 0 | 0 |
| S1-none-T2/score | hold r13 1 | anthropic/claude-haiku-5.5 | 1 | 4132 | 0 | 0 | 1225 | $0.0010 | 0 | 0 | 0 |
| S1-none-T2/score | hold r13 2 | anthropic/claude-haiku-5.5 | 1 | 4132 | 0 | 0 | 1578 | $0.0012 | 0 | 0 | 0 |
| S1-none-T2/score | round r14 1 | anthropic/claude-haiku-5.5 | 1 | 4081 | 0 | 0 | 2071 | $0.0014 | 0 | 0 | 0 |
| S1-none-T2/score | round r14 2 | anthropic/claude-haiku-5.5 | 1 | 4081 | 0 | 0 | 2136 | $0.0015 | 0 | 0 | 0 |
| S1-none-T2/score | round r14 referee | anthropic/claude-opus-5.5 | 1 | 4081 | 0 | 0 | 1135 | $0.0390 | 0 | 0 | 0 |
| S1-none-T2/score | hold r14 1 | anthropic/claude-haiku-5.5 | 1 | 4309 | 0 | 0 | 1549 | $0.0012 | 0 | 0 | 0 |
| S1-none-T2/score | hold r14 2 | anthropic/claude-haiku-5.5 | 1 | 4309 | 0 | 0 | 1718 | $0.0013 | 0 | 0 | 0 |
| S1-none-T2/score | hold r14 referee | anthropic/claude-opus-5.5 | 1 | 4309 | 0 | 0 | 1362 | $0.0445 | 0 | 0 | 0 |
| S1-none-T2/score | round r15 1 | anthropic/claude-haiku-5.5 | 1 | 4469 | 0 | 0 | 1875 | $0.0014 | 0 | 0 | 0 |
| S1-none-T2/score | round r15 2 | anthropic/claude-haiku-5.5 | 1 | 4469 | 0 | 0 | 2086 | $0.0015 | 0 | 0 | 0 |
| S1-none-T2/score | round r15 referee | anthropic/claude-opus-5.5 | 1 | 4469 | 0 | 0 | 1231 | $0.0425 | 0 | 0 | 0 |
| S1-none-T2/score | hold r15 1 | anthropic/claude-haiku-5.5 | 1 | 4697 | 0 | 0 | 2268 | $0.0016 | 0 | 0 | 0 |
| S1-none-T2/score | hold r15 2 | anthropic/claude-haiku-5.5 | 1 | 4697 | 0 | 0 | 1940 | $0.0014 | 0 | 0 | 0 |
| S1-none-T2/score | hold r15 referee | anthropic/claude-opus-5.5 | 1 | 4697 | 0 | 0 | 1446 | $0.0477 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r1 1 | anthropic/claude-haiku-5.5 | 1 | 2057 | 0 | 0 | 585 | $0.0005 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r1 2 | anthropic/claude-haiku-5.5 | 1 | 2057 | 0 | 0 | 530 | $0.0005 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r2 1 | anthropic/claude-haiku-5.5 | 1 | 2354 | 0 | 0 | 219 | $0.0003 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r2 2 | anthropic/claude-haiku-5.5 | 1 | 2354 | 0 | 0 | 247 | $0.0004 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r3 1 | anthropic/claude-haiku-5.5 | 1 | 3033 | 0 | 0 | 240 | $0.0004 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r3 2 | anthropic/claude-haiku-5.5 | 1 | 3033 | 0 | 0 | 54 | $0.0003 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r4 1 | anthropic/claude-haiku-5.5 | 1 | 2775 | 0 | 0 | 258 | $0.0004 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r4 2 | anthropic/claude-haiku-5.5 | 1 | 2775 | 0 | 0 | 249 | $0.0004 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r5 1 | anthropic/claude-haiku-5.5 | 1 | 3376 | 0 | 0 | 897 | $0.0008 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r5 2 | anthropic/claude-haiku-5.5 | 1 | 3376 | 0 | 0 | 687 | $0.0007 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r6 1 | anthropic/claude-haiku-5.5 | 1 | 4006 | 0 | 0 | 601 | $0.0007 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r6 2 | anthropic/claude-haiku-5.5 | 1 | 4006 | 0 | 0 | 947 | $0.0009 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r7 1 | anthropic/claude-haiku-5.5 | 1 | 3926 | 0 | 0 | 623 | $0.0007 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r7 2 | anthropic/claude-haiku-5.5 | 1 | 3926 | 0 | 0 | 603 | $0.0007 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r8 1 | anthropic/claude-haiku-5.5 | 1 | 3494 | 0 | 0 | 691 | $0.0007 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r8 2 | anthropic/claude-haiku-5.5 | 1 | 3494 | 0 | 0 | 392 | $0.0005 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r9 1 | anthropic/claude-haiku-5.5 | 1 | 3319 | 0 | 0 | 80 | $0.0004 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r9 2 | anthropic/claude-haiku-5.5 | 1 | 3319 | 0 | 0 | 82 | $0.0004 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r10 1 | anthropic/claude-haiku-5.5 | 1 | 3891 | 0 | 0 | 489 | $0.0006 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r10 2 | anthropic/claude-haiku-5.5 | 1 | 3891 | 0 | 0 | 665 | $0.0007 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r11 1 | anthropic/claude-haiku-5.5 | 1 | 3162 | 0 | 0 | 393 | $0.0005 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r11 2 | anthropic/claude-haiku-5.5 | 1 | 3162 | 0 | 0 | 351 | $0.0005 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r12 1 | anthropic/claude-haiku-5.5 | 1 | 3636 | 0 | 0 | 89 | $0.0004 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r12 2 | anthropic/claude-haiku-5.5 | 1 | 3636 | 0 | 0 | 102 | $0.0004 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r13 1 | anthropic/claude-haiku-5.5 | 1 | 2498 | 0 | 0 | 111 | $0.0003 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r13 2 | anthropic/claude-haiku-5.5 | 1 | 2498 | 0 | 0 | 710 | $0.0006 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r13 3 | anthropic/claude-haiku-5.5 | 1 | 2498 | 0 | 0 | 717 | $0.0006 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r14 1 | anthropic/claude-haiku-5.5 | 1 | 2675 | 0 | 0 | 330 | $0.0004 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r14 2 | anthropic/claude-haiku-5.5 | 1 | 2675 | 0 | 0 | 372 | $0.0005 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r15 1 | anthropic/claude-haiku-5.5 | 1 | 3063 | 0 | 0 | 93 | $0.0004 | 0 | 0 | 0 |
| S1-none-T2/score | initiative r15 2 | anthropic/claude-haiku-5.5 | 1 | 3063 | 0 | 0 | 110 | $0.0004 | 0 | 0 | 0 |
| a7-baseline/judge | a7 baseline reflect r1 1 | anthropic/claude-haiku-5.5 | 1 | 2061 | 0 | 0 | 479 | $0.0004 | 0 | 0 | 0 |
| a7-baseline/judge | a7 baseline reflect r1 2 | anthropic/claude-haiku-5.5 | 1 | 2061 | 0 | 0 | 505 | $0.0005 | 0 | 0 | 0 |
| a7-baseline/judge | a7 baseline reflect r2 1 | anthropic/claude-haiku-5.5 | 1 | 2358 | 0 | 0 | 528 | $0.0005 | 0 | 0 | 0 |
| a7-baseline/judge | a7 baseline reflect r2 2 | anthropic/claude-haiku-5.5 | 1 | 2358 | 0 | 0 | 558 | $0.0005 | 0 | 0 | 0 |
| a7-baseline/judge | a7 baseline reflect r5 1 | anthropic/claude-haiku-5.5 | 1 | 3380 | 0 | 0 | 1182 | $0.0009 | 0 | 0 | 0 |
| a7-baseline/judge | a7 baseline reflect r5 2 | anthropic/claude-haiku-5.5 | 1 | 3380 | 0 | 0 | 710 | $0.0007 | 0 | 0 | 0 |
| a7-baseline/judge | a7 baseline reflect r6 1 | anthropic/claude-haiku-5.5 | 1 | 4010 | 0 | 0 | 114 | $0.0005 | 0 | 0 | 0 |
| a7-baseline/judge | a7 baseline reflect r6 2 | anthropic/claude-haiku-5.5 | 1 | 4010 | 0 | 0 | 119 | $0.0005 | 0 | 0 | 0 |
| a7-baseline/judge | a7 baseline reflect r8 1 | anthropic/claude-haiku-5.5 | 1 | 3498 | 0 | 0 | 142 | $0.0004 | 0 | 0 | 0 |
| a7-baseline/judge | a7 baseline reflect r8 2 | anthropic/claude-haiku-5.5 | 1 | 3498 | 0 | 0 | 152 | $0.0004 | 0 | 0 | 0 |
| a7-baseline/judge | a7 baseline reflect r11 1 | anthropic/claude-haiku-5.5 | 1 | 3166 | 0 | 0 | 670 | $0.0007 | 0 | 0 | 0 |
| a7-baseline/judge | a7 baseline reflect r11 2 | anthropic/claude-haiku-5.5 | 1 | 3166 | 0 | 0 | 591 | $0.0006 | 0 | 0 | 0 |
| a7-baseline/judge | a7 baseline reflect r13 1 | anthropic/claude-haiku-5.5 | 1 | 2502 | 0 | 0 | 903 | $0.0007 | 0 | 0 | 0 |
| a7-baseline/judge | a7 baseline reflect r13 2 | anthropic/claude-haiku-5.5 | 1 | 2502 | 0 | 0 | 178 | $0.0003 | 0 | 0 | 0 |
| a7-baseline/judge | a7 baseline reflect r14 1 | anthropic/claude-haiku-5.5 | 1 | 2679 | 0 | 0 | 446 | $0.0005 | 0 | 0 | 0 |
| a7-baseline/judge | a7 baseline reflect r14 2 | anthropic/claude-haiku-5.5 | 1 | 2679 | 0 | 0 | 457 | $0.0005 | 0 | 0 | 0 |
| a7-baseline/judge | a7 baseline reflect r15 1 | anthropic/claude-haiku-5.5 | 1 | 3067 | 0 | 0 | 462 | $0.0005 | 0 | 0 | 0 |
| a7-baseline/judge | a7 baseline reflect r15 2 | anthropic/claude-haiku-5.5 | 1 | 3067 | 0 | 0 | 655 | $0.0006 | 0 | 0 | 0 |
| a7-replay | a7 replay dm r1 PellBramSefa | anthropic/claude-opus-5.5 | 2 | 1789 | 0 | 71360 | 3927 | $0.4425 | 0 | 0 | 0 |
| a7-replay | a7 replay dm r2 BramSefaPell | anthropic/claude-opus-5.5 | 2 | 2197 | 38674 | 35999 | 4767 | $0.2919 | 0 | 0 | 0 |
| a7-replay | a7 replay dm r5 BramSefa | anthropic/claude-opus-5.5 | 2 | 1279 | 41987 | 46607 | 5542 | $0.3574 | 0 | 0 | 0 |
| a7-replay | a7 replay dm r5 Pell | anthropic/claude-opus-5.5 | 2 | 1527 | 88594 | 0 | 5424 | $0.1323 | 0 | 0 | 0 |
| a7-replay | a7 replay dm r6 SefaBram | anthropic/claude-opus-5.5 | 2 | 1225 | 55908 | 38836 | 7428 | $0.3588 | 0 | 0 | 0 |
| a7-replay | a7 replay dm r6 Pell | anthropic/claude-opus-5.5 | 2 | 1447 | 94744 | 0 | 4396 | $0.1127 | 0 | 0 | 0 |
| a7-replay | a7 replay dm r8 SefaBram | anthropic/claude-opus-5.5 | 2 | 1275 | 62058 | 47346 | 5122 | $0.3567 | 0 | 0 | 0 |
| a7-replay | a7 replay dm r8 Pell | anthropic/claude-opus-5.5 | 2 | 1243 | 109404 | 0 | 6344 | $0.1537 | 0 | 0 | 0 |
| a7-replay | a7 replay dm r11 BramSefaPell | anthropic/claude-opus-5.5 | 2 | 2877 | 76718 | 52288 | 9176 | $0.4718 | 0 | 0 | 0 |
| a7-replay | a7 replay dm r13 PellBramSefa | anthropic/claude-opus-5.5 | 2 | 2375 | 96320 | 44680 | 5048 | $0.3531 | 0 | 0 | 0 |
| a7-replay | a7 replay dm r13 PellBramSefa step 2 | anthropic/claude-opus-5.5 | 1 | 3233 | 70059 | 0 | 1199 | $0.0509 | 0 | 0 | 0 |
| a7-replay | a7 replay dm r14 BramSefaPell | anthropic/claude-opus-5.5 | 2 | 2633 | 108314 | 36881 | 6321 | $0.3430 | 0 | 0 | 0 |
| a7-replay | a7 replay dm r15 SefaPellBram | anthropic/claude-opus-5.5 | 2 | 2591 | 112509 | 37235 | 7132 | $0.3617 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay hold r1 1 | anthropic/claude-haiku-5.5 | 2 | 3993 | 0 | 0 | 451 | $0.0006 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay hold r1 2 | anthropic/claude-haiku-5.5 | 2 | 3993 | 0 | 0 | 452 | $0.0006 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay reflect r1 1 | anthropic/claude-haiku-5.5 | 2 | 4001 | 0 | 0 | 1169 | $0.0010 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay reflect r1 2 | anthropic/claude-haiku-5.5 | 2 | 4001 | 0 | 0 | 726 | $0.0008 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay hold r2 1 | anthropic/claude-haiku-5.5 | 2 | 4365 | 0 | 0 | 356 | $0.0006 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay hold r2 2 | anthropic/claude-haiku-5.5 | 2 | 4365 | 0 | 0 | 294 | $0.0006 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay reflect r2 1 | anthropic/claude-haiku-5.5 | 2 | 4373 | 0 | 0 | 315 | $0.0006 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay reflect r2 2 | anthropic/claude-haiku-5.5 | 2 | 4373 | 0 | 0 | 271 | $0.0006 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay hold r5 1 | anthropic/claude-haiku-5.5 | 2 | 6845 | 0 | 0 | 829 | $0.0011 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay hold r5 2 | anthropic/claude-haiku-5.5 | 2 | 6845 | 0 | 0 | 771 | $0.0011 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay reflect r5 1 | anthropic/claude-haiku-5.5 | 2 | 6853 | 0 | 0 | 750 | $0.0011 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay reflect r5 2 | anthropic/claude-haiku-5.5 | 2 | 6853 | 0 | 0 | 1202 | $0.0013 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay hold r6 1 | anthropic/claude-haiku-5.5 | 2 | 6322 | 0 | 0 | 1473 | $0.0014 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay hold r6 2 | anthropic/claude-haiku-5.5 | 2 | 6322 | 0 | 0 | 1545 | $0.0014 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay reflect r6 1 | anthropic/claude-haiku-5.5 | 2 | 6330 | 0 | 0 | 927 | $0.0011 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay reflect r6 2 | anthropic/claude-haiku-5.5 | 2 | 6330 | 0 | 0 | 1184 | $0.0012 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay hold r8 1 | anthropic/claude-haiku-5.5 | 2 | 6713 | 0 | 0 | 965 | $0.0012 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay hold r8 2 | anthropic/claude-haiku-5.5 | 2 | 6713 | 0 | 0 | 995 | $0.0012 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay reflect r8 1 | anthropic/claude-haiku-5.5 | 2 | 6721 | 0 | 0 | 1221 | $0.0013 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay reflect r8 2 | anthropic/claude-haiku-5.5 | 2 | 6721 | 0 | 0 | 1318 | $0.0013 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay hold r11 1 | anthropic/claude-haiku-5.5 | 2 | 6360 | 0 | 0 | 284 | $0.0008 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay hold r11 2 | anthropic/claude-haiku-5.5 | 2 | 6360 | 0 | 0 | 214 | $0.0007 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay reflect r11 1 | anthropic/claude-haiku-5.5 | 2 | 6368 | 0 | 0 | 1296 | $0.0013 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay reflect r11 2 | anthropic/claude-haiku-5.5 | 2 | 6368 | 0 | 0 | 890 | $0.0011 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay hold r13 1 | anthropic/claude-haiku-5.5 | 2 | 4951 | 0 | 0 | 268 | $0.0006 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay hold r13 2 | anthropic/claude-haiku-5.5 | 2 | 4951 | 0 | 0 | 275 | $0.0006 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay reflect r13 1 | anthropic/claude-haiku-5.5 | 2 | 4959 | 0 | 0 | 1594 | $0.0013 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay reflect r13 2 | anthropic/claude-haiku-5.5 | 2 | 4959 | 0 | 0 | 1745 | $0.0014 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay reflect r13 3 | anthropic/claude-haiku-5.5 | 1 | 2351 | 0 | 0 | 831 | $0.0007 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay hold r14 1 | anthropic/claude-haiku-5.5 | 2 | 5381 | 0 | 0 | 777 | $0.0009 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay hold r14 2 | anthropic/claude-haiku-5.5 | 2 | 5381 | 0 | 0 | 607 | $0.0008 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay hold r14 3 | anthropic/claude-haiku-5.5 | 1 | 2563 | 0 | 0 | 512 | $0.0005 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay reflect r14 1 | anthropic/claude-haiku-5.5 | 2 | 5389 | 0 | 0 | 1321 | $0.0012 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay reflect r14 2 | anthropic/claude-haiku-5.5 | 2 | 5389 | 0 | 0 | 910 | $0.0010 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay hold r15 1 | anthropic/claude-haiku-5.5 | 2 | 6060 | 0 | 0 | 470 | $0.0008 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay hold r15 2 | anthropic/claude-haiku-5.5 | 2 | 6060 | 0 | 0 | 470 | $0.0008 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay reflect r15 1 | anthropic/claude-haiku-5.5 | 2 | 6068 | 0 | 0 | 249 | $0.0007 | 0 | 0 | 0 |
| a7-replay/judge | a7 replay reflect r15 2 | anthropic/claude-haiku-5.5 | 2 | 6068 | 0 | 0 | 253 | $0.0007 | 0 | 0 | 0 |
| S1-moderate-T1 | relay opening | anthropic/claude-sonnet-5.5 | 1 | 1291 | 0 | 0 | 1272 | $0.0153 | 0 | 0 | 0 |
| S1-moderate-T1/Pell | player r1 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 10964 | 472 | $0.0643 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Pell r1 | anthropic/claude-haiku-5.5 | 1 | 1860 | 0 | 0 | 76 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1/Bram | player r1 | openai/gpt-6.1-sol | 1 | 3 | 0 | 7248 | 83 | $0.0190 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Bram r1 | anthropic/claude-haiku-5.5 | 1 | 1572 | 0 | 0 | 61 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1/Sefa | player r1 | deepseek/deepseek-v4-pro-0813 | 1 | 7594 | 0 | 0 | 405 | $0.0109 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Sefa r1 | anthropic/claude-haiku-5.5 | 1 | 1863 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r1 | anthropic/claude-opus-5.5 | 3 | 12 | 49859 | 102271 | 8464 | $0.8128 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r1 | anthropic/claude-haiku-5.5 | 1 | 3200 | 0 | 0 | 417 | $0.0005 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r1 | anthropic/claude-sonnet-5.5 | 1 | 2638 | 0 | 0 | 3714 | $0.0424 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r1 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3937 | 0 | 0 | 1335 | $0.0212 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r1 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 3937 | 0 | 0 | 1295 | $0.0208 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r1 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4017 | 0 | 0 | 1255 | $0.0206 | 0 | 0 | 0 |
| S1-moderate-T1/Bram | player r2 | openai/gpt-6.1-sol | 1 | 3 | 7248 | 908 | 119 | $0.0042 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Bram r2 | anthropic/claude-haiku-5.5 | 1 | 1700 | 0 | 0 | 76 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1/Sefa | player r2 | deepseek/deepseek-v4-pro-0813 | 1 | 1235 | 7424 | 0 | 2313 | $0.0084 | 0 | 0 | 1 |
| S1-moderate-T1/check | check S1-moderate-T1 Sefa r2 | anthropic/claude-haiku-5.5 | 1 | 2139 | 0 | 0 | 77 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T1/Pell | player r2 | anthropic/claude-opus-5.5 | 1 | 4 | 10964 | 1548 | 1071 | $0.0314 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Pell r2 | anthropic/claude-haiku-5.5 | 1 | 2109 | 0 | 0 | 77 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r2 | anthropic/claude-opus-5.5 | 1 | 4 | 19337 | 27162 | 2211 | $0.1893 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r2 card | anthropic/claude-sonnet-5.5 | 1 | 2402 | 0 | 0 | 811 | $0.0129 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r2 card (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3256 | 0 | 0 | 688 | $0.0134 | 0 | 0 | 0 |
| S1-moderate-T1/Pell | player r2 card 1 | anthropic/claude-opus-5.5 | 2 | 8 | 26446 | 1607 | 101 | $0.0154 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Pell r2 card | anthropic/claude-haiku-5.5 | 2 | 1623 | 0 | 0 | 114 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r2 onward | anthropic/claude-opus-5.5 | 3 | 10 | 116562 | 35534 | 6956 | $0.3401 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r2 onward | anthropic/claude-haiku-5.5 | 2 | 5293 | 0 | 0 | 653 | $0.0009 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r2 | anthropic/claude-sonnet-5.5 | 1 | 4217 | 0 | 0 | 4011 | $0.0485 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r2 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5836 | 0 | 0 | 1517 | $0.0268 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r2 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5751 | 0 | 0 | 1436 | $0.0259 | 0 | 0 | 0 |
| S1-moderate-T1/Sefa | player r3 | deepseek/deepseek-v4-pro-0813 | 1 | 1587 | 8448 | 0 | 469 | $0.0041 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Sefa r3 | anthropic/claude-haiku-5.5 | 1 | 2068 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1/Pell | player r3 | anthropic/claude-opus-5.5 | 1 | 4 | 14119 | 910 | 723 | $0.0218 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Pell r3 | anthropic/claude-haiku-5.5 | 1 | 1708 | 0 | 0 | 77 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1/Bram | player r3 | openai/gpt-6.1-sol | 1 | 3 | 8156 | 1147 | 92 | $0.0046 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Bram r3 | anthropic/claude-haiku-5.5 | 1 | 1942 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r3 | anthropic/claude-opus-5.5 | 3 | 12 | 99297 | 77462 | 10245 | $0.6201 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r3 | anthropic/claude-haiku-5.5 | 1 | 4049 | 0 | 0 | 349 | $0.0006 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r3 | anthropic/claude-sonnet-5.5 | 1 | 3497 | 0 | 0 | 3652 | $0.0435 | 0 | 0 | 0 |
| S1-moderate-T1/Pell | player r4 | anthropic/claude-opus-5.5 | 1 | 4 | 15029 | 1822 | 907 | $0.0303 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Pell r4 | anthropic/claude-haiku-5.5 | 1 | 2307 | 0 | 0 | 63 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T1/Bram | player r4 | openai/gpt-6.1-sol | 1 | 3 | 9303 | 960 | 152 | $0.0049 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Bram r4 | anthropic/claude-haiku-5.5 | 1 | 1735 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1/Sefa | player r4 | deepseek/deepseek-v4-pro-0813 | 1 | 1263 | 9728 | 0 | 1739 | $0.0071 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Sefa r4 | anthropic/claude-haiku-5.5 | 1 | 1571 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r4 | anthropic/claude-opus-5.5 | 1 | 4 | 23773 | 37378 | 2862 | $0.2568 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r4 card | anthropic/claude-sonnet-5.5 | 1 | 2068 | 0 | 0 | 553 | $0.0097 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r4 card (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 2701 | 0 | 0 | 427 | $0.0097 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r4 card (Pell's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 2675 | 0 | 0 | 436 | $0.0097 | 0 | 0 | 0 |
| S1-moderate-T1/Pell | player r4 card 1 | anthropic/claude-opus-5.5 | 5 | 20 | 90543 | 2280 | 1466 | $0.0589 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Pell r4 card | anthropic/claude-haiku-5.5 | 5 | 3271 | 0 | 0 | 330 | $0.0005 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r4 card ooc (with a press) | anthropic/claude-opus-5.5 | 4 | 77572 | 76869 | 25623 | 2672 | $0.5841 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r4 onward | anthropic/claude-opus-5.5 | 3 | 10 | 141213 | 48666 | 11688 | $0.5054 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r4 onward | anthropic/claude-haiku-5.5 | 2 | 6399 | 0 | 0 | 1046 | $0.0012 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r4 | anthropic/claude-sonnet-5.5 | 1 | 4058 | 0 | 0 | 3860 | $0.0467 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r4 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5289 | 0 | 0 | 1109 | $0.0217 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r4 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 5285 | 0 | 0 | 1112 | $0.0217 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r4 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5405 | 0 | 0 | 1215 | $0.0230 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r4 (Sefa's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 5389 | 0 | 0 | 1222 | $0.0230 | 0 | 0 | 0 |
| S1-moderate-T1/Bram | player r5 | openai/gpt-6.1-sol | 1 | 3 | 10263 | 878 | 193 | $0.0052 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Bram r5 | anthropic/claude-haiku-5.5 | 1 | 1625 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1/Sefa | player r5 | deepseek/deepseek-v4-pro-0813 | 1 | 1281 | 10752 | 0 | 593 | $0.0043 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Sefa r5 | anthropic/claude-haiku-5.5 | 1 | 1864 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1/Pell | player r5 | anthropic/claude-opus-5.5 | 1 | 4 | 19131 | 1508 | 1215 | $0.0357 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Pell r5 | anthropic/claude-haiku-5.5 | 1 | 2463 | 0 | 0 | 73 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r5 | anthropic/claude-opus-5.5 | 6 | 20 | 325431 | 100829 | 17998 | $0.9375 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r5 | anthropic/claude-haiku-5.5 | 2 | 9434 | 0 | 0 | 2003 | $0.0019 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r5 | anthropic/claude-sonnet-5.5 | 1 | 4119 | 0 | 0 | 4294 | $0.0512 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r5 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5382 | 0 | 0 | 1115 | $0.0219 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r5 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 6244 | 0 | 0 | 2019 | $0.0327 | 0 | 0 | 0 |
| S1-moderate-T1/Sefa | player r6 | deepseek/deepseek-v4-pro-0813 | 1 | 1223 | 11776 | 0 | 1159 | $0.0058 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Sefa r6 | anthropic/claude-haiku-5.5 | 1 | 1736 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1/Bram | player r6 | openai/gpt-6.1-sol | 1 | 3 | 11141 | 990 | 160 | $0.0052 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Bram r6 | anthropic/claude-haiku-5.5 | 1 | 1681 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r6 | anthropic/claude-opus-5.5 | 6 | 24 | 286823 | 137662 | 16335 | $1.0891 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r6 | anthropic/claude-haiku-5.5 | 3 | 10722 | 0 | 0 | 1602 | $0.0019 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r6 | anthropic/claude-sonnet-5.5 | 2 | 6723 | 0 | 0 | 5915 | $0.0726 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r6 (asked again) | anthropic/claude-sonnet-5.5 | 1 | 2916 | 0 | 0 | 2455 | $0.0304 | 0 | 0 | 0 |
| S1-moderate-T1/Pell | player r6 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 23461 | 1344 | $0.1442 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Pell r6 | anthropic/claude-haiku-5.5 | 1 | 3227 | 0 | 0 | 73 | $0.0004 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r6 card | anthropic/claude-sonnet-5.5 | 1 | 2197 | 0 | 0 | 684 | $0.0112 | 0 | 0 | 0 |
| S1-moderate-T1/Pell | player r6 card 1 | anthropic/claude-opus-5.5 | 2 | 8 | 48451 | 1854 | 880 | $0.0366 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Pell r6 card | anthropic/claude-haiku-5.5 | 2 | 1819 | 0 | 0 | 164 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r6 card ooc (with a press) | anthropic/claude-opus-5.5 | 2 | 44056 | 59541 | 8295 | 2422 | $0.3029 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r6 onward | anthropic/claude-opus-5.5 | 3 | 10 | 159017 | 52977 | 6796 | $0.4326 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r6 onward | anthropic/claude-haiku-5.5 | 2 | 6826 | 0 | 0 | 876 | $0.0011 | 0 | 0 | 0 |
| S1-moderate-T1/Bram | player r7 | openai/gpt-6.1-sol | 1 | 3 | 12131 | 947 | 233 | $0.0059 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Bram r7 | anthropic/claude-haiku-5.5 | 1 | 1649 | 0 | 0 | 61 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1/Sefa | player r7 | deepseek/deepseek-v4-pro-0813 | 1 | 1401 | 12800 | 0 | 3480 | $0.0121 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Sefa r7 | anthropic/claude-haiku-5.5 | 1 | 2060 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r7 | anthropic/claude-opus-5.5 | 6 | 24 | 257387 | 183987 | 15491 | $1.2949 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r7 | anthropic/claude-haiku-5.5 | 3 | 8951 | 0 | 0 | 1103 | $0.0014 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r7 | anthropic/claude-sonnet-5.5 | 2 | 5319 | 0 | 0 | 3501 | $0.0456 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r7 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4319 | 0 | 0 | 1316 | $0.0218 | 0 | 0 | 0 |
| S1-moderate-T1/Pell | player r7 | anthropic/claude-opus-5.5 | 1 | 4 | 25315 | 1200 | 1398 | $0.0390 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Pell r7 | anthropic/claude-haiku-5.5 | 1 | 2048 | 0 | 0 | 100 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T1/Sefa | player r8 | deepseek/deepseek-v4-pro-0813 | 1 | 1340 | 14080 | 0 | 440 | $0.0043 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Sefa r8 | anthropic/claude-haiku-5.5 | 1 | 1911 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1/Bram | player r8 | openai/gpt-6.1-sol | 1 | 3 | 13078 | 1119 | 126 | $0.0054 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Bram r8 | anthropic/claude-haiku-5.5 | 1 | 1807 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r8 | anthropic/claude-opus-5.5 | 6 | 24 | 298259 | 183003 | 11013 | $1.2056 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r8 | anthropic/claude-haiku-5.5 | 4 | 10410 | 0 | 0 | 980 | $0.0015 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r8 | anthropic/claude-sonnet-5.5 | 2 | 4677 | 0 | 0 | 2485 | $0.0342 | 0 | 0 | 0 |
| S1-moderate-T1/Pell | player r8 | anthropic/claude-opus-5.5 | 1 | 4 | 26515 | 1531 | 842 | $0.0298 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Pell r8 | anthropic/claude-haiku-5.5 | 1 | 1752 | 0 | 0 | 80 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1/Bram | player r9 | openai/gpt-6.1-sol | 1 | 3 | 14197 | 683 | 197 | $0.0051 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Bram r9 | anthropic/claude-haiku-5.5 | 1 | 1254 | 0 | 0 | 53 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1/Sefa | player r9 | deepseek/deepseek-v4-pro-0813 | 1 | 1162 | 15104 | 0 | 2659 | $0.0099 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Sefa r9 | anthropic/claude-haiku-5.5 | 1 | 1493 | 0 | 0 | 71 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r9 | anthropic/claude-opus-5.5 | 5 | 20 | 201425 | 180032 | 10790 | $1.1645 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r9 | anthropic/claude-haiku-5.5 | 3 | 9024 | 0 | 0 | 1961 | $0.0019 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r9 | anthropic/claude-sonnet-5.5 | 2 | 4255 | 0 | 0 | 2258 | $0.0311 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r9 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 2955 | 0 | 0 | 733 | $0.0132 | 0 | 0 | 0 |
| S1-moderate-T1/Pell | player r9 | anthropic/claude-opus-5.5 | 1 | 4 | 28046 | 1311 | 865 | $0.0295 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Pell r9 | anthropic/claude-haiku-5.5 | 1 | 1504 | 0 | 0 | 86 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1/check | check referee S1-moderate-T1 Pell r9 | anthropic/claude-opus-5.5 | 1 | 1504 | 0 | 0 | 263 | $0.0113 | 0 | 0 | 0 |
| S1-moderate-T1/Sefa | player r10 | deepseek/deepseek-v4-pro-0813 | 1 | 880 | 16128 | 0 | 1049 | $0.0055 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Sefa r10 | anthropic/claude-haiku-5.5 | 1 | 1250 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1/Bram | player r10 | openai/gpt-6.1-sol | 1 | 3 | 14880 | 628 | 77 | $0.0038 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Bram r10 | anthropic/claude-haiku-5.5 | 1 | 1177 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r10 | anthropic/claude-opus-5.5 | 5 | 20 | 233005 | 183984 | 11609 | $1.2070 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r10 | anthropic/claude-haiku-5.5 | 3 | 8275 | 0 | 0 | 731 | $0.0012 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r10 | anthropic/claude-sonnet-5.5 | 2 | 4308 | 0 | 0 | 2997 | $0.0386 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r10 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3224 | 0 | 0 | 930 | $0.0157 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r10 (Sefa's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 3219 | 0 | 0 | 926 | $0.0157 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r10 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3328 | 0 | 0 | 1026 | $0.0169 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r10 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 3307 | 0 | 0 | 1025 | $0.0169 | 0 | 0 | 0 |
| S1-moderate-T1/Pell | player r10 | anthropic/claude-opus-5.5 | 1 | 4 | 29357 | 1209 | 563 | $0.0232 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Pell r10 | anthropic/claude-haiku-5.5 | 1 | 1505 | 0 | 0 | 95 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1/Bram | player r11 | openai/gpt-6.1-sol | 1 | 3 | 15508 | 809 | 107 | $0.0046 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Bram r11 | anthropic/claude-haiku-5.5 | 1 | 1487 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1/Sefa | player r11 | deepseek/deepseek-v4-pro-0813 | 1 | 974 | 16896 | 0 | 309 | $0.0038 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Sefa r11 | anthropic/claude-haiku-5.5 | 1 | 1538 | 0 | 0 | 81 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r11 | anthropic/claude-opus-5.5 | 5 | 20 | 285976 | 149370 | 8902 | $0.9910 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r11 card | anthropic/claude-sonnet-5.5 | 1 | 1622 | 0 | 0 | 496 | $0.0082 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r11 card (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 2181 | 0 | 0 | 390 | $0.0083 | 0 | 0 | 0 |
| S1-moderate-T1/Bram | player r11 card 1 | openai/gpt-6.1-sol | 2 | 6 | 33116 | 654 | 17 | $0.0051 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Bram r11 card | anthropic/claude-haiku-5.5 | 2 | 1411 | 0 | 0 | 120 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r11 onward | anthropic/claude-opus-5.5 | 5 | 16 | 382780 | 58057 | 7219 | $0.5113 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r11 onward | anthropic/claude-haiku-5.5 | 2 | 5426 | 0 | 0 | 952 | $0.0010 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r11 | anthropic/claude-sonnet-5.5 | 2 | 5193 | 0 | 0 | 2830 | $0.0387 | 0 | 0 | 0 |
| S1-moderate-T1/Pell | player r11 | anthropic/claude-opus-5.5 | 1 | 4 | 30566 | 1345 | 799 | $0.0288 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Pell r11 | anthropic/claude-haiku-5.5 | 1 | 1730 | 0 | 0 | 71 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r11 | anthropic/claude-haiku-5.5 | 3 | 9356 | 0 | 0 | 2189 | $0.0020 | 0 | 0 | 0 |
| S1-moderate-T1/Sefa | player r12 | deepseek/deepseek-v4-pro-0813 | 1 | 1065 | 17664 | 0 | 734 | $0.0051 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Sefa r12 | anthropic/claude-haiku-5.5 | 1 | 1254 | 0 | 0 | 43 | $0.0001 | 0 | 0 | 0 |
| S1-moderate-T1/Bram | player r12 | openai/gpt-6.1-sol | 1 | 3 | 16971 | 493 | 127 | $0.0042 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Bram r12 | anthropic/claude-haiku-5.5 | 1 | 1187 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r12 | anthropic/claude-opus-5.5 | 8 | 32 | 501469 | 205296 | 17418 | $1.4849 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r12 | anthropic/claude-haiku-5.5 | 5 | 14929 | 0 | 0 | 2455 | $0.0027 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r12 | anthropic/claude-sonnet-5.5 | 2 | 4902 | 0 | 0 | 2930 | $0.0391 | 0 | 0 | 0 |
| S1-moderate-T1/Pell | player r12 | anthropic/claude-opus-5.5 | 1 | 4 | 31911 | 1634 | 1008 | $0.0347 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Pell r12 | anthropic/claude-haiku-5.5 | 1 | 2127 | 0 | 0 | 77 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T1/Bram | player r13 | openai/gpt-6.1-sol | 1 | 3 | 17464 | 760 | 116 | $0.0048 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Bram r13 | anthropic/claude-haiku-5.5 | 1 | 1361 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1/Sefa | player r13 | deepseek/deepseek-v4-pro-0813 | 1 | 844 | 18432 | 0 | 766 | $0.0049 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Sefa r13 | anthropic/claude-haiku-5.5 | 1 | 1495 | 0 | 0 | 59 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r13 | anthropic/claude-opus-5.5 | 5 | 20 | 260169 | 203271 | 11098 | $1.3018 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r13 | anthropic/claude-haiku-5.5 | 3 | 8882 | 0 | 0 | 1359 | $0.0016 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r13 | anthropic/claude-sonnet-5.5 | 2 | 4979 | 0 | 0 | 3342 | $0.0434 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r13 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3780 | 0 | 0 | 1108 | $0.0186 | 0 | 0 | 0 |
| S1-moderate-T1/Pell | player r13 | anthropic/claude-opus-5.5 | 1 | 4 | 33545 | 1854 | 750 | $0.0310 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Pell r13 | anthropic/claude-haiku-5.5 | 1 | 2032 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1/Bram | player r14 | openai/gpt-6.1-sol | 1 | 3 | 18224 | 908 | 121 | $0.0053 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Bram r14 | anthropic/claude-haiku-5.5 | 1 | 1596 | 0 | 0 | 57 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1/Sefa | player r14 | deepseek/deepseek-v4-pro-0813 | 1 | 1120 | 19200 | 0 | 1137 | $0.0063 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Sefa r14 | anthropic/claude-haiku-5.5 | 1 | 2926 | 0 | 0 | 79 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T1/Pell | player r14 | anthropic/claude-opus-5.5 | 1 | 4 | 35399 | 1558 | 901 | $0.0329 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Pell r14 | anthropic/claude-haiku-5.5 | 1 | 2022 | 0 | 0 | 76 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r14 | anthropic/claude-opus-5.5 | 1 | 4 | 58178 | 48766 | 6557 | $0.3922 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r14 card | anthropic/claude-sonnet-5.5 | 1 | 4858 | 0 | 0 | 2619 | $0.0359 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r14 card (asked again) | anthropic/claude-sonnet-5.5 | 1 | 4858 | 0 | 0 | 1372 | $0.0234 | 0 | 0 | 0 |
| S1-moderate-T1/Pell | player r14 card 1 | anthropic/claude-opus-5.5 | 2 | 8 | 75907 | 2194 | 125 | $0.0287 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Pell r14 card | anthropic/claude-haiku-5.5 | 2 | 2132 | 0 | 0 | 123 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r14 onward | anthropic/claude-opus-5.5 | 4 | 14 | 313608 | 65067 | 7057 | $0.5293 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r14 onward | anthropic/claude-haiku-5.5 | 3 | 13536 | 0 | 0 | 2042 | $0.0024 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r14 | anthropic/claude-sonnet-5.5 | 1 | 6832 | 0 | 0 | 4199 | $0.0557 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r14 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 8721 | 0 | 0 | 1773 | $0.0352 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r14 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 8429 | 0 | 0 | 1468 | $0.0315 | 0 | 0 | 0 |
| S1-moderate-T1/Bram | player r15 | openai/gpt-6.1-sol | 1 | 3 | 19132 | 1384 | 121 | $0.0066 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Bram r15 | anthropic/claude-haiku-5.5 | 1 | 2251 | 0 | 0 | 63 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T1/Pell | player r15 | anthropic/claude-opus-5.5 | 1 | 4 | 39151 | 877 | 1018 | $0.0326 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Pell r15 | anthropic/claude-haiku-5.5 | 1 | 1875 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r15 | anthropic/claude-opus-5.5 | 6 | 24 | 360106 | 226330 | 18244 | $1.5907 | 0 | 0 | 0 |
| S1-moderate-T1 | dm r15 | anthropic/claude-haiku-5.5 | 3 | 9666 | 0 | 0 | 1116 | $0.0015 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r15 | anthropic/claude-sonnet-5.5 | 2 | 5483 | 0 | 0 | 3795 | $0.0489 | 0 | 0 | 0 |
| S1-moderate-T1 | relay r15 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4863 | 0 | 0 | 1338 | $0.0231 | 0 | 0 | 0 |
| S1-moderate-T1/Sefa | player r15 | deepseek/deepseek-v4-pro-0813 | 1 | 2276 | 20224 | 0 | 1607 | $0.0092 | 0 | 0 | 2 |
| S1-moderate-T1/check | check S1-moderate-T1 Sefa r15 | anthropic/claude-haiku-5.5 | 1 | 2124 | 0 | 0 | 71 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1/Bram | after 1 | openai/gpt-6.1-sol | 1 | 3 | 20516 | 1116 | 220 | $0.0070 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Bram after 1 | anthropic/claude-haiku-5.5 | 1 | 705 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| S1-moderate-T1/Bram | after 2 | openai/gpt-6.1-sol | 1 | 3 | 21632 | 236 | 138 | $0.0041 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Bram after 2 | anthropic/claude-haiku-5.5 | 1 | 546 | 0 | 0 | 73 | $0.0001 | 0 | 0 | 0 |
| S1-moderate-T1/Bram | after 3 | openai/gpt-6.1-sol | 1 | 3 | 21868 | 155 | 109 | $0.0037 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Bram after 3 | anthropic/claude-haiku-5.5 | 1 | 432 | 0 | 0 | 62 | $0.0001 | 0 | 0 | 0 |
| S1-moderate-T1/Sefa | after 1 | deepseek/deepseek-v4-pro-0813 | 1 | 23403 | 0 | 0 | 445 | $0.0316 | 0 | 0 | 2 |
| S1-moderate-T1/check | check S1-moderate-T1 Sefa after 1 | anthropic/claude-haiku-5.5 | 1 | 783 | 0 | 0 | 76 | $0.0001 | 0 | 0 | 0 |
| S1-moderate-T1/Sefa | after 2 | deepseek/deepseek-v4-pro-0813 | 1 | 440 | 23296 | 0 | 906 | $0.0053 | 0 | 0 | 2 |
| S1-moderate-T1/check | check S1-moderate-T1 Sefa after 2 | anthropic/claude-haiku-5.5 | 1 | 779 | 0 | 0 | 72 | $0.0001 | 0 | 0 | 0 |
| S1-moderate-T1/Sefa | after 3 | deepseek/deepseek-v4-pro-0813 | 1 | 524 | 23552 | 0 | 501 | $0.0043 | 0 | 0 | 2 |
| S1-moderate-T1/check | check S1-moderate-T1 Sefa after 3 | anthropic/claude-haiku-5.5 | 1 | 754 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| S1-moderate-T1/Pell | after 1 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 42096 | 1160 | $0.2337 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Pell after 1 | anthropic/claude-haiku-5.5 | 1 | 1150 | 0 | 0 | 74 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T1/Pell | after 2 | anthropic/claude-opus-5.5 | 1 | 4 | 42096 | 845 | 1054 | $0.0337 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Pell after 2 | anthropic/claude-haiku-5.5 | 1 | 993 | 0 | 0 | 75 | $0.0001 | 0 | 0 | 0 |
| S1-moderate-T1/Pell | after 3 | anthropic/claude-opus-5.5 | 1 | 4 | 42941 | 675 | 930 | $0.0306 | 0 | 0 | 0 |
| S1-moderate-T1/check | check S1-moderate-T1 Pell after 3 | anthropic/claude-haiku-5.5 | 1 | 928 | 0 | 0 | 58 | $0.0001 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r1 1 | anthropic/claude-haiku-5.5 | 1 | 3566 | 0 | 0 | 1382 | $0.0010 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r1 2 | anthropic/claude-haiku-5.5 | 1 | 3566 | 0 | 0 | 1235 | $0.0010 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r1 referee | anthropic/claude-opus-5.5 | 1 | 3566 | 0 | 0 | 850 | $0.0313 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r1 1 | anthropic/claude-haiku-5.5 | 1 | 3819 | 0 | 0 | 341 | $0.0006 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r1 2 | anthropic/claude-haiku-5.5 | 1 | 3819 | 0 | 0 | 340 | $0.0006 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r2 1 | anthropic/claude-haiku-5.5 | 1 | 4434 | 0 | 0 | 1194 | $0.0010 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r2 2 | anthropic/claude-haiku-5.5 | 1 | 4434 | 0 | 0 | 1527 | $0.0012 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r2 1 | anthropic/claude-haiku-5.5 | 1 | 4687 | 0 | 0 | 1279 | $0.0011 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r2 2 | anthropic/claude-haiku-5.5 | 1 | 4687 | 0 | 0 | 337 | $0.0006 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r2 referee | anthropic/claude-opus-5.5 | 1 | 4687 | 0 | 0 | 641 | $0.0316 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r3 1 | anthropic/claude-haiku-5.5 | 1 | 4425 | 0 | 0 | 1659 | $0.0013 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r3 2 | anthropic/claude-haiku-5.5 | 1 | 4425 | 0 | 0 | 1567 | $0.0012 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r3 referee | anthropic/claude-opus-5.5 | 1 | 4425 | 0 | 0 | 984 | $0.0374 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r3 1 | anthropic/claude-haiku-5.5 | 1 | 4678 | 0 | 0 | 396 | $0.0007 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r3 2 | anthropic/claude-haiku-5.5 | 1 | 4678 | 0 | 0 | 418 | $0.0007 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r4 1 | anthropic/claude-haiku-5.5 | 1 | 4520 | 0 | 0 | 2068 | $0.0015 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r4 2 | anthropic/claude-haiku-5.5 | 1 | 4520 | 0 | 0 | 1967 | $0.0014 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r4 referee | anthropic/claude-opus-5.5 | 1 | 4520 | 0 | 0 | 1187 | $0.0418 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r4 1 | anthropic/claude-haiku-5.5 | 1 | 4773 | 0 | 0 | 1049 | $0.0010 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r4 2 | anthropic/claude-haiku-5.5 | 1 | 4773 | 0 | 0 | 1348 | $0.0012 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r4 referee | anthropic/claude-opus-5.5 | 1 | 4773 | 0 | 0 | 948 | $0.0381 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r5 1 | anthropic/claude-haiku-5.5 | 1 | 5047 | 0 | 0 | 2206 | $0.0016 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r5 2 | anthropic/claude-haiku-5.5 | 1 | 5047 | 0 | 0 | 2405 | $0.0017 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r5 referee | anthropic/claude-opus-5.5 | 1 | 5047 | 0 | 0 | 1362 | $0.0474 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r5 1 | anthropic/claude-haiku-5.5 | 1 | 5300 | 0 | 0 | 1703 | $0.0014 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r5 2 | anthropic/claude-haiku-5.5 | 1 | 5300 | 0 | 0 | 1818 | $0.0014 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r5 referee | anthropic/claude-opus-5.5 | 1 | 5300 | 0 | 0 | 1062 | $0.0424 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r6 1 | anthropic/claude-haiku-5.5 | 1 | 6360 | 0 | 0 | 2364 | $0.0018 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r6 2 | anthropic/claude-haiku-5.5 | 1 | 6360 | 0 | 0 | 1952 | $0.0016 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r6 referee | anthropic/claude-opus-5.5 | 1 | 6360 | 0 | 0 | 1267 | $0.0508 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r6 1 | anthropic/claude-haiku-5.5 | 1 | 6613 | 0 | 0 | 473 | $0.0009 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r6 2 | anthropic/claude-haiku-5.5 | 1 | 6613 | 0 | 0 | 336 | $0.0008 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r6 referee | anthropic/claude-opus-5.5 | 1 | 6613 | 0 | 0 | 1269 | $0.0518 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r7 1 | anthropic/claude-haiku-5.5 | 1 | 5373 | 0 | 0 | 3614 | $0.0023 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r7 2 | anthropic/claude-haiku-5.5 | 1 | 5373 | 0 | 0 | 2555 | $0.0018 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r7 referee | anthropic/claude-opus-5.5 | 1 | 5373 | 0 | 0 | 1256 | $0.0466 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r7 1 | anthropic/claude-haiku-5.5 | 1 | 5626 | 0 | 0 | 1811 | $0.0015 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r7 2 | anthropic/claude-haiku-5.5 | 1 | 5626 | 0 | 0 | 1590 | $0.0014 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r7 referee | anthropic/claude-opus-5.5 | 1 | 5626 | 0 | 0 | 1223 | $0.0470 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r8 1 | anthropic/claude-haiku-5.5 | 1 | 5025 | 0 | 0 | 2048 | $0.0015 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r8 2 | anthropic/claude-haiku-5.5 | 1 | 5025 | 0 | 0 | 2343 | $0.0017 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r8 referee | anthropic/claude-opus-5.5 | 1 | 5025 | 0 | 0 | 1142 | $0.0429 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r8 1 | anthropic/claude-haiku-5.5 | 1 | 5278 | 0 | 0 | 1648 | $0.0014 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r8 2 | anthropic/claude-haiku-5.5 | 1 | 5278 | 0 | 0 | 1421 | $0.0012 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r8 referee | anthropic/claude-opus-5.5 | 1 | 5278 | 0 | 0 | 958 | $0.0403 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r9 1 | anthropic/claude-haiku-5.5 | 1 | 4309 | 0 | 0 | 1795 | $0.0013 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r9 2 | anthropic/claude-haiku-5.5 | 1 | 4309 | 0 | 0 | 2007 | $0.0014 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r9 referee | anthropic/claude-opus-5.5 | 1 | 4309 | 0 | 0 | 1170 | $0.0406 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r9 1 | anthropic/claude-haiku-5.5 | 1 | 4562 | 0 | 0 | 1441 | $0.0012 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r9 2 | anthropic/claude-haiku-5.5 | 1 | 4562 | 0 | 0 | 1499 | $0.0012 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r9 referee | anthropic/claude-opus-5.5 | 1 | 4562 | 0 | 0 | 1296 | $0.0442 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r10 1 | anthropic/claude-haiku-5.5 | 1 | 4465 | 0 | 0 | 2226 | $0.0016 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r10 2 | anthropic/claude-haiku-5.5 | 1 | 4465 | 0 | 0 | 2401 | $0.0016 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r10 referee | anthropic/claude-opus-5.5 | 1 | 4465 | 0 | 0 | 1078 | $0.0394 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r10 1 | anthropic/claude-haiku-5.5 | 1 | 4718 | 0 | 0 | 1476 | $0.0012 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r10 2 | anthropic/claude-haiku-5.5 | 1 | 4718 | 0 | 0 | 1530 | $0.0012 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r10 referee | anthropic/claude-opus-5.5 | 1 | 4718 | 0 | 0 | 896 | $0.0368 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r11 1 | anthropic/claude-haiku-5.5 | 1 | 4977 | 0 | 0 | 1982 | $0.0015 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r11 2 | anthropic/claude-haiku-5.5 | 1 | 4977 | 0 | 0 | 2434 | $0.0017 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r11 referee | anthropic/claude-opus-5.5 | 1 | 4977 | 0 | 0 | 1556 | $0.0510 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r11 1 | anthropic/claude-haiku-5.5 | 1 | 5230 | 0 | 0 | 1640 | $0.0013 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r11 2 | anthropic/claude-haiku-5.5 | 1 | 5230 | 0 | 0 | 2000 | $0.0015 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r11 referee | anthropic/claude-opus-5.5 | 1 | 5230 | 0 | 0 | 1285 | $0.0466 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r12 1 | anthropic/claude-haiku-5.5 | 1 | 5051 | 0 | 0 | 1539 | $0.0013 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r12 2 | anthropic/claude-haiku-5.5 | 1 | 5051 | 0 | 0 | 1631 | $0.0013 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r12 referee | anthropic/claude-opus-5.5 | 1 | 5051 | 0 | 0 | 1008 | $0.0404 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r12 1 | anthropic/claude-haiku-5.5 | 1 | 5304 | 0 | 0 | 1314 | $0.0012 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r12 2 | anthropic/claude-haiku-5.5 | 1 | 5304 | 0 | 0 | 361 | $0.0007 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r12 referee | anthropic/claude-opus-5.5 | 1 | 5304 | 0 | 0 | 1075 | $0.0427 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r13 1 | anthropic/claude-haiku-5.5 | 1 | 5230 | 0 | 0 | 2185 | $0.0016 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r13 2 | anthropic/claude-haiku-5.5 | 1 | 5230 | 0 | 0 | 2031 | $0.0015 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r13 referee | anthropic/claude-opus-5.5 | 1 | 5230 | 0 | 0 | 1306 | $0.0470 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r13 1 | anthropic/claude-haiku-5.5 | 1 | 5483 | 0 | 0 | 1921 | $0.0015 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r13 2 | anthropic/claude-haiku-5.5 | 1 | 5483 | 0 | 0 | 1685 | $0.0014 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r13 referee | anthropic/claude-opus-5.5 | 1 | 5483 | 0 | 0 | 1508 | $0.0521 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r14 1 | anthropic/claude-haiku-5.5 | 1 | 6592 | 0 | 0 | 488 | $0.0009 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r14 2 | anthropic/claude-haiku-5.5 | 1 | 6592 | 0 | 0 | 486 | $0.0009 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r14 referee | anthropic/claude-opus-5.5 | 1 | 6592 | 0 | 0 | 1282 | $0.0520 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r14 1 | anthropic/claude-haiku-5.5 | 1 | 6845 | 0 | 0 | 498 | $0.0009 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r14 2 | anthropic/claude-haiku-5.5 | 1 | 6845 | 0 | 0 | 463 | $0.0009 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r14 referee | anthropic/claude-opus-5.5 | 1 | 6845 | 0 | 0 | 1010 | $0.0476 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r15 1 | anthropic/claude-haiku-5.5 | 1 | 5681 | 0 | 0 | 2228 | $0.0017 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r15 2 | anthropic/claude-haiku-5.5 | 1 | 5681 | 0 | 0 | 2312 | $0.0017 | 0 | 0 | 0 |
| S1-moderate-T1/score | round r15 referee | anthropic/claude-opus-5.5 | 1 | 5681 | 0 | 0 | 1783 | $0.0584 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r15 1 | anthropic/claude-haiku-5.5 | 1 | 5934 | 0 | 0 | 1373 | $0.0013 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r15 2 | anthropic/claude-haiku-5.5 | 1 | 5934 | 0 | 0 | 1511 | $0.0013 | 0 | 0 | 0 |
| S1-moderate-T1/score | hold r15 referee | anthropic/claude-opus-5.5 | 1 | 5934 | 0 | 0 | 1190 | $0.0475 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r1 1 | anthropic/claude-haiku-5.5 | 1 | 2160 | 0 | 0 | 212 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r1 2 | anthropic/claude-haiku-5.5 | 1 | 2160 | 0 | 0 | 222 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r2 1 | anthropic/claude-haiku-5.5 | 1 | 3028 | 0 | 0 | 50 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r2 2 | anthropic/claude-haiku-5.5 | 1 | 3028 | 0 | 0 | 51 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r3 1 | anthropic/claude-haiku-5.5 | 1 | 3019 | 0 | 0 | 191 | $0.0004 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r3 2 | anthropic/claude-haiku-5.5 | 1 | 3019 | 0 | 0 | 165 | $0.0004 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r4 1 | anthropic/claude-haiku-5.5 | 1 | 3114 | 0 | 0 | 621 | $0.0006 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r4 2 | anthropic/claude-haiku-5.5 | 1 | 3114 | 0 | 0 | 487 | $0.0006 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r5 1 | anthropic/claude-haiku-5.5 | 1 | 3641 | 0 | 0 | 160 | $0.0004 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r5 2 | anthropic/claude-haiku-5.5 | 1 | 3641 | 0 | 0 | 290 | $0.0005 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r6 1 | anthropic/claude-haiku-5.5 | 1 | 4963 | 0 | 0 | 1072 | $0.0010 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r6 2 | anthropic/claude-haiku-5.5 | 1 | 4963 | 0 | 0 | 686 | $0.0008 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r6 3 | anthropic/claude-haiku-5.5 | 1 | 4963 | 0 | 0 | 852 | $0.0009 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r7 1 | anthropic/claude-haiku-5.5 | 1 | 3976 | 0 | 0 | 771 | $0.0008 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r7 2 | anthropic/claude-haiku-5.5 | 1 | 3976 | 0 | 0 | 956 | $0.0009 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r7 3 | anthropic/claude-haiku-5.5 | 1 | 3976 | 0 | 0 | 899 | $0.0008 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r8 1 | anthropic/claude-haiku-5.5 | 1 | 3628 | 0 | 0 | 742 | $0.0007 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r8 2 | anthropic/claude-haiku-5.5 | 1 | 3628 | 0 | 0 | 694 | $0.0007 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r8 3 | anthropic/claude-haiku-5.5 | 1 | 3628 | 0 | 0 | 635 | $0.0007 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r9 1 | anthropic/claude-haiku-5.5 | 1 | 2912 | 0 | 0 | 623 | $0.0006 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r9 2 | anthropic/claude-haiku-5.5 | 1 | 2912 | 0 | 0 | 599 | $0.0006 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r10 1 | anthropic/claude-haiku-5.5 | 1 | 3068 | 0 | 0 | 851 | $0.0007 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r10 2 | anthropic/claude-haiku-5.5 | 1 | 3068 | 0 | 0 | 762 | $0.0007 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r11 1 | anthropic/claude-haiku-5.5 | 1 | 3580 | 0 | 0 | 417 | $0.0006 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r11 2 | anthropic/claude-haiku-5.5 | 1 | 3580 | 0 | 0 | 537 | $0.0006 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r12 1 | anthropic/claude-haiku-5.5 | 1 | 3654 | 0 | 0 | 489 | $0.0006 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r12 2 | anthropic/claude-haiku-5.5 | 1 | 3654 | 0 | 0 | 602 | $0.0007 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r13 1 | anthropic/claude-haiku-5.5 | 1 | 3833 | 0 | 0 | 463 | $0.0006 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r13 2 | anthropic/claude-haiku-5.5 | 1 | 3833 | 0 | 0 | 421 | $0.0006 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r14 1 | anthropic/claude-haiku-5.5 | 1 | 4970 | 0 | 0 | 67 | $0.0005 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r14 2 | anthropic/claude-haiku-5.5 | 1 | 4970 | 0 | 0 | 69 | $0.0005 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r15 1 | anthropic/claude-haiku-5.5 | 1 | 4284 | 0 | 0 | 311 | $0.0006 | 0 | 0 | 0 |
| S1-moderate-T1/score | initiative r15 2 | anthropic/claude-haiku-5.5 | 1 | 4284 | 0 | 0 | 375 | $0.0006 | 0 | 0 | 0 |
| S1-moderate-T2 | relay opening | anthropic/claude-sonnet-5.5 | 2 | 2582 | 0 | 0 | 2577 | $0.0309 | 0 | 0 | 0 |
| S1-moderate-T2/Pell | player r1 | anthropic/claude-fable-5.1 | 2 | 8 | 0 | 21939 | 980 | $0.3233 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Pell r1 | anthropic/claude-haiku-5.5 | 2 | 3764 | 0 | 0 | 142 | $0.0004 | 0 | 0 | 0 |
| S1-moderate-T2/Bram | player r1 | openai/gpt-6-astra | 2 | 6 | 6510 | 7994 | 216 | $0.1173 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Bram r1 | anthropic/claude-haiku-5.5 | 2 | 3244 | 0 | 0 | 138 | $0.0004 | 0 | 0 | 0 |
| S1-moderate-T2/Sefa | player r1 | deepseek/deepseek-v4-pro-0813 | 2 | 15196 | 0 | 0 | 1306 | $0.0232 | 0 | 0 | 1 |
| S1-moderate-T2/check | check S1-moderate-T2 Sefa r1 | anthropic/claude-haiku-5.5 | 2 | 3718 | 0 | 0 | 136 | $0.0004 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r1 | anthropic/claude-opus-5.5 | 7 | 28 | 238285 | 127534 | 21243 | $1.1103 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r1 | anthropic/claude-haiku-5.5 | 3 | 9652 | 0 | 0 | 1795 | $0.0019 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r1 | anthropic/claude-sonnet-5.5 | 2 | 5219 | 0 | 0 | 5867 | $0.0691 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r1 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3916 | 0 | 0 | 1079 | $0.0186 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r1 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3782 | 0 | 0 | 933 | $0.0169 | 0 | 0 | 0 |
| S1-moderate-T2/Bram | player r2 | openai/gpt-6-astra | 2 | 6 | 14504 | 1472 | 235 | $0.0447 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Bram r2 | anthropic/claude-haiku-5.5 | 2 | 2821 | 0 | 0 | 128 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T2/Sefa | player r2 | deepseek/deepseek-v4-pro-0813 | 2 | 9346 | 7424 | 0 | 2759 | $0.0201 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Sefa r2 | anthropic/claude-haiku-5.5 | 2 | 2792 | 0 | 0 | 109 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T2/Pell | player r2 | anthropic/claude-fable-5.1 | 2 | 8 | 21939 | 3001 | 1301 | $0.1081 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Pell r2 | anthropic/claude-haiku-5.5 | 2 | 3856 | 0 | 0 | 154 | $0.0005 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r2 | anthropic/claude-opus-5.5 | 4 | 16 | 113574 | 103959 | 10515 | $0.7634 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r2 card | anthropic/claude-sonnet-5.5 | 1 | 2091 | 0 | 0 | 777 | $0.0120 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r2 card (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 2910 | 0 | 0 | 646 | $0.0123 | 0 | 0 | 0 |
| S1-moderate-T2/Pell | player r2 card 1 | anthropic/claude-fable-5.1 | 2 | 8 | 26321 | 1470 | 106 | $0.0303 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Pell r2 card | anthropic/claude-haiku-5.5 | 2 | 1558 | 0 | 0 | 113 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r2 onward | anthropic/claude-opus-5.5 | 3 | 10 | 129960 | 40430 | 5859 | $0.3454 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r2 onward | anthropic/claude-haiku-5.5 | 2 | 4718 | 0 | 0 | 388 | $0.0007 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r2 | anthropic/claude-sonnet-5.5 | 2 | 5942 | 0 | 0 | 6231 | $0.0742 | 0 | 0 | 0 |
| S1-moderate-T2/Sefa | player r3 | deepseek/deepseek-v4-pro-0813 | 2 | 2232 | 16384 | 0 | 2469 | $0.0110 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Sefa r3 | anthropic/claude-haiku-5.5 | 2 | 3411 | 0 | 0 | 137 | $0.0004 | 0 | 0 | 0 |
| S1-moderate-T2/Pell | player r3 | anthropic/claude-fable-5.1 | 2 | 8 | 26410 | 2190 | 1458 | $0.1070 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Pell r3 | anthropic/claude-haiku-5.5 | 2 | 3356 | 0 | 0 | 146 | $0.0004 | 0 | 0 | 0 |
| S1-moderate-T2/Bram | player r3 | openai/gpt-6-astra | 2 | 6 | 15976 | 1652 | 278 | $0.0506 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Bram r3 | anthropic/claude-haiku-5.5 | 2 | 3029 | 0 | 0 | 135 | $0.0004 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r3 | anthropic/claude-opus-5.5 | 3 | 12 | 63563 | 104852 | 11415 | $0.7760 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r3 | anthropic/claude-haiku-5.5 | 1 | 3699 | 0 | 0 | 562 | $0.0007 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r3 | anthropic/claude-sonnet-5.5 | 2 | 6628 | 0 | 0 | 7396 | $0.0872 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r3 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 2 | 9165 | 0 | 0 | 2279 | $0.0411 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r3 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4249 | 0 | 0 | 1226 | $0.0208 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r3 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 2 | 9350 | 0 | 0 | 2488 | $0.0436 | 0 | 0 | 0 |
| S1-moderate-T2/Pell | player r4 | anthropic/claude-fable-5.1 | 2 | 8 | 30168 | 2866 | 1229 | $0.1049 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Pell r4 | anthropic/claude-haiku-5.5 | 2 | 3833 | 0 | 0 | 126 | $0.0004 | 0 | 0 | 0 |
| S1-moderate-T2/Bram | player r4 | openai/gpt-6-astra | 2 | 6 | 17628 | 1983 | 286 | $0.0568 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Bram r4 | anthropic/claude-haiku-5.5 | 2 | 3572 | 0 | 0 | 142 | $0.0004 | 0 | 0 | 0 |
| S1-moderate-T2/Sefa | player r4 | deepseek/deepseek-v4-pro-0813 | 2 | 3752 | 16896 | 0 | 3347 | $0.0153 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Sefa r4 | anthropic/claude-haiku-5.5 | 2 | 3604 | 0 | 0 | 146 | $0.0004 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r4 | anthropic/claude-opus-5.5 | 6 | 22 | 205108 | 159310 | 21072 | $1.2714 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r4 | anthropic/claude-haiku-5.5 | 2 | 8217 | 0 | 0 | 1155 | $0.0014 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r4 | anthropic/claude-sonnet-5.5 | 2 | 6271 | 0 | 0 | 5560 | $0.0681 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r4 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 2 | 8611 | 0 | 0 | 2047 | $0.0377 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r4 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 2 | 8181 | 0 | 0 | 1623 | $0.0326 | 0 | 0 | 0 |
| S1-moderate-T2/Bram | player r5 | openai/gpt-6-astra | 2 | 6 | 19611 | 1499 | 255 | $0.0512 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Bram r5 | anthropic/claude-haiku-5.5 | 2 | 2684 | 0 | 0 | 137 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T2/Sefa | player r5 | deepseek/deepseek-v4-pro-0813 | 2 | 2060 | 20224 | 0 | 2681 | $0.0117 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Sefa r5 | anthropic/claude-haiku-5.5 | 2 | 2757 | 0 | 0 | 137 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r5 | anthropic/claude-opus-5.5 | 7 | 26 | 243871 | 201316 | 17956 | $1.4327 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r5 | anthropic/claude-haiku-5.5 | 2 | 7351 | 0 | 0 | 972 | $0.0012 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r5 | anthropic/claude-sonnet-5.5 | 2 | 5361 | 0 | 0 | 4320 | $0.0539 | 0 | 0 | 0 |
| S1-moderate-T2/Pell | player r5 | anthropic/claude-fable-5.1 | 2 | 8 | 16464 | 19567 | 1343 | $0.3159 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Pell r5 | anthropic/claude-haiku-5.5 | 2 | 3786 | 0 | 0 | 171 | $0.0005 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r5 card | anthropic/claude-sonnet-5.5 | 1 | 2105 | 0 | 0 | 794 | $0.0121 | 0 | 0 | 0 |
| S1-moderate-T2/Pell | player r5 card 1 | anthropic/claude-fable-5.1 | 2 | 8 | 37838 | 1514 | 650 | $0.0610 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Pell r5 card | anthropic/claude-haiku-5.5 | 3 | 2288 | 0 | 0 | 202 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r5 card ooc | anthropic/claude-opus-5.5 | 1 | 20714 | 0 | 28618 | 1157 | $0.3349 | 0 | 0 | 0 |
| S1-moderate-T2/Pell | player r5 card 2 | anthropic/claude-fable-5.1 | 1 | 4 | 19422 | 311 | 121 | $0.0148 | 0 | 0 | 0 |
| S1-moderate-T2/Bram | after 1 | openai/gpt-6-astra | 2 | 6 | 27014 | 1619 | 364 | $0.0655 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Bram after 1 | anthropic/claude-haiku-5.5 | 2 | 1239 | 0 | 0 | 145 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T2/Bram | after 2 | openai/gpt-6-astra | 2 | 6 | 28633 | 396 | 244 | $0.0458 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Bram after 2 | anthropic/claude-haiku-5.5 | 2 | 1046 | 0 | 0 | 135 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T2/Bram | after 3 | openai/gpt-6-astra | 2 | 6 | 29029 | 278 | 176 | $0.0414 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Bram after 3 | anthropic/claude-haiku-5.5 | 2 | 920 | 0 | 0 | 123 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T2/Sefa | after 1 | deepseek/deepseek-v4-pro-0813 | 2 | 10043 | 19968 | 0 | 884 | $0.0174 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Sefa after 1 | anthropic/claude-haiku-5.5 | 2 | 1502 | 0 | 0 | 136 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T2/Sefa | after 2 | deepseek/deepseek-v4-pro-0813 | 2 | 933 | 29696 | 0 | 1215 | $0.0073 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Sefa after 2 | anthropic/claude-haiku-5.5 | 2 | 1588 | 0 | 0 | 152 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T2/Sefa | after 3 | deepseek/deepseek-v4-pro-0813 | 2 | 13138 | 18176 | 0 | 1699 | $0.0233 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Sefa after 3 | anthropic/claude-haiku-5.5 | 2 | 1602 | 0 | 0 | 131 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T2/Pell | after 1 | anthropic/claude-fable-5.1 | 2 | 8 | 47211 | 580 | 1646 | $0.1014 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Pell after 1 | anthropic/claude-haiku-5.5 | 2 | 2134 | 0 | 0 | 166 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T2/Pell | after 2 | anthropic/claude-fable-5.1 | 2 | 8 | 47791 | 1524 | 1302 | $0.0962 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Pell after 2 | anthropic/claude-haiku-5.5 | 2 | 1903 | 0 | 0 | 167 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T2/Pell | after 3 | anthropic/claude-fable-5.1 | 2 | 8 | 49315 | 1267 | 1685 | $0.1125 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Pell after 3 | anthropic/claude-haiku-5.5 | 2 | 2063 | 0 | 0 | 154 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r2 | anthropic/claude-haiku-5.5 | 1 | 2974 | 0 | 0 | 476 | $0.0005 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r2 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3444 | 0 | 0 | 1025 | $0.0171 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r2 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3248 | 0 | 0 | 827 | $0.0148 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r3 card | anthropic/claude-sonnet-5.5 | 1 | 2374 | 0 | 0 | 880 | $0.0135 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r3 card (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3296 | 0 | 0 | 786 | $0.0145 | 0 | 0 | 0 |
| S1-moderate-T2/Pell | player r3 card 1 | anthropic/claude-fable-5.1 | 2 | 8 | 28847 | 1568 | 100 | $0.0319 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Pell r3 card | anthropic/claude-haiku-5.5 | 2 | 1695 | 0 | 0 | 117 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r3 onward | anthropic/claude-opus-5.5 | 5 | 18 | 254128 | 46675 | 8414 | $0.4526 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r3 onward | anthropic/claude-haiku-5.5 | 3 | 8512 | 0 | 0 | 1510 | $0.0016 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r4 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3824 | 0 | 0 | 805 | $0.0157 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r5 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3916 | 0 | 0 | 698 | $0.0148 | 0 | 0 | 0 |
| S1-moderate-T2/Sefa | player r6 | deepseek/deepseek-v4-pro-0813 | 1 | 992 | 10752 | 0 | 781 | $0.0044 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Sefa r6 | anthropic/claude-haiku-5.5 | 1 | 1377 | 0 | 0 | 89 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T2/Bram | player r6 | openai/gpt-6-astra | 1 | 3 | 10360 | 579 | 170 | $0.0261 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Bram r6 | anthropic/claude-haiku-5.5 | 1 | 1210 | 0 | 0 | 59 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r6 | anthropic/claude-opus-5.5 | 5 | 20 | 164464 | 166425 | 17413 | $1.2260 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r6 | anthropic/claude-haiku-5.5 | 3 | 9644 | 0 | 0 | 1279 | $0.0016 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r6 | anthropic/claude-sonnet-5.5 | 2 | 4816 | 0 | 0 | 3561 | $0.0452 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r6 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4092 | 0 | 0 | 1218 | $0.0204 | 0 | 0 | 0 |
| S1-moderate-T2/Pell | player r6 | anthropic/claude-fable-5.1 | 1 | 4 | 17926 | 1682 | 915 | $0.0713 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Pell r6 | anthropic/claude-haiku-5.5 | 1 | 2054 | 0 | 0 | 79 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T2/Bram | player r7 | openai/gpt-6-astra | 1 | 3 | 10939 | 1258 | 193 | $0.0363 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Bram r7 | anthropic/claude-haiku-5.5 | 1 | 2150 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T2/Sefa | player r7 | deepseek/deepseek-v4-pro-0813 | 1 | 1323 | 11520 | 0 | 871 | $0.0051 | 0 | 0 | 1 |
| S1-moderate-T2/check | check S1-moderate-T2 Sefa r7 | anthropic/claude-haiku-5.5 | 1 | 1880 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r7 | anthropic/claude-opus-5.5 | 6 | 24 | 232802 | 180362 | 20684 | $1.3720 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r7 | anthropic/claude-haiku-5.5 | 3 | 10496 | 0 | 0 | 2441 | $0.0023 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r7 | anthropic/claude-sonnet-5.5 | 2 | 5138 | 0 | 0 | 3252 | $0.0428 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r7 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4127 | 0 | 0 | 1189 | $0.0201 | 0 | 0 | 0 |
| S1-moderate-T2/Pell | player r7 | anthropic/claude-fable-5.1 | 1 | 4 | 0 | 20815 | 1031 | $0.3118 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Pell r7 | anthropic/claude-haiku-5.5 | 1 | 1558 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T2/Bram | player r8 | openai/gpt-6-astra | 1 | 3 | 12197 | 1081 | 154 | $0.0334 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Bram r8 | anthropic/claude-haiku-5.5 | 1 | 1789 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T2/Sefa | player r8 | deepseek/deepseek-v4-pro-0813 | 1 | 1277 | 12544 | 0 | 1675 | $0.0073 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Sefa r8 | anthropic/claude-haiku-5.5 | 1 | 1729 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T2/Pell | player r8 | anthropic/claude-fable-5.1 | 1 | 4 | 20815 | 1408 | 803 | $0.0630 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Pell r8 | anthropic/claude-haiku-5.5 | 1 | 1560 | 0 | 0 | 62 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r8 | anthropic/claude-opus-5.5 | 5 | 16 | 294603 | 93289 | 10454 | $0.7392 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r8 | anthropic/claude-haiku-5.5 | 2 | 6823 | 0 | 0 | 926 | $0.0011 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r8 | anthropic/claude-sonnet-5.5 | 1 | 3359 | 0 | 0 | 3837 | $0.0451 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r8 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4615 | 0 | 0 | 1095 | $0.0202 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r8 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 4605 | 0 | 0 | 1101 | $0.0202 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r8 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4811 | 0 | 0 | 1313 | $0.0228 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r8 (Pell's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 4812 | 0 | 0 | 1311 | $0.0227 | 0 | 0 | 0 |
| S1-moderate-T2/Sefa | player r9 | deepseek/deepseek-v4-pro-0813 | 1 | 1429 | 13568 | 0 | 2105 | $0.0087 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Sefa r9 | anthropic/claude-haiku-5.5 | 1 | 1869 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T2/Pell | player r9 | anthropic/claude-fable-5.1 | 1 | 4 | 22223 | 1798 | 941 | $0.0751 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Pell r9 | anthropic/claude-haiku-5.5 | 1 | 2250 | 0 | 0 | 72 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T2/Bram | player r9 | openai/gpt-6-astra | 1 | 3 | 13278 | 969 | 109 | $0.0309 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Bram r9 | anthropic/claude-haiku-5.5 | 1 | 1601 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r9 | anthropic/claude-opus-5.5 | 4 | 16 | 202838 | 101608 | 12090 | $0.7983 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r9 | anthropic/claude-haiku-5.5 | 2 | 6995 | 0 | 0 | 1221 | $0.0013 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r9 | anthropic/claude-sonnet-5.5 | 1 | 3596 | 0 | 0 | 4391 | $0.0511 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r9 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5133 | 0 | 0 | 1429 | $0.0246 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r9 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5203 | 0 | 0 | 1451 | $0.0249 | 0 | 0 | 0 |
| S1-moderate-T2/Pell | player r10 | anthropic/claude-fable-5.1 | 1 | 4 | 24021 | 1944 | 797 | $0.0702 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Pell r10 | anthropic/claude-haiku-5.5 | 1 | 2358 | 0 | 0 | 75 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T2/Bram | player r10 | openai/gpt-6-astra | 1 | 3 | 14247 | 1160 | 155 | $0.0365 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Bram r10 | anthropic/claude-haiku-5.5 | 1 | 2012 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T2/Sefa | player r10 | deepseek/deepseek-v4-pro-0813 | 1 | 1320 | 14848 | 0 | 3404 | $0.0121 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Sefa r10 | anthropic/claude-haiku-5.5 | 1 | 2098 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r10 | anthropic/claude-opus-5.5 | 3 | 12 | 121036 | 89423 | 11605 | $0.7117 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r10 | anthropic/claude-haiku-5.5 | 1 | 4120 | 0 | 0 | 705 | $0.0008 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r10 | anthropic/claude-sonnet-5.5 | 1 | 3535 | 0 | 0 | 2611 | $0.0332 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r10 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4643 | 0 | 0 | 975 | $0.0190 | 0 | 0 | 0 |
| S1-moderate-T2/Bram | player r11 | openai/gpt-6-astra | 1 | 3 | 15407 | 857 | 125 | $0.0324 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Bram r11 | anthropic/claude-haiku-5.5 | 1 | 1531 | 0 | 0 | 57 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T2/Sefa | player r11 | deepseek/deepseek-v4-pro-0813 | 1 | 1224 | 15872 | 0 | 1938 | $0.0082 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Sefa r11 | anthropic/claude-haiku-5.5 | 1 | 1659 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r11 | anthropic/claude-opus-5.5 | 5 | 20 | 193599 | 179110 | 9663 | $1.1400 | 0 | 0 | 0 |
| S1-moderate-T2 | dm r11 | anthropic/claude-haiku-5.5 | 2 | 5778 | 0 | 0 | 731 | $0.0009 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r11 | anthropic/claude-sonnet-5.5 | 1 | 2269 | 0 | 0 | 2086 | $0.0254 | 0 | 0 | 0 |
| S1-moderate-T2 | relay r11 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3427 | 0 | 0 | 1025 | $0.0171 | 0 | 0 | 0 |
| S1-moderate-T2/Pell | player r11 | anthropic/claude-fable-5.1 | 1 | 4 | 0 | 27281 | 635 | $0.3728 | 0 | 0 | 0 |
| S1-moderate-T2/check | check S1-moderate-T2 Pell r11 | anthropic/claude-haiku-5.5 | 1 | 1429 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r1 1 | anthropic/claude-haiku-5.5 | 1 | 3431 | 0 | 0 | 2037 | $0.0014 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r1 2 | anthropic/claude-haiku-5.5 | 1 | 3431 | 0 | 0 | 1879 | $0.0013 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r1 referee | anthropic/claude-opus-5.5 | 1 | 3431 | 0 | 0 | 1011 | $0.0339 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r1 1 | anthropic/claude-haiku-5.5 | 1 | 3684 | 0 | 0 | 405 | $0.0006 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r1 2 | anthropic/claude-haiku-5.5 | 1 | 3684 | 0 | 0 | 871 | $0.0008 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r2 1 | anthropic/claude-haiku-5.5 | 1 | 3205 | 0 | 0 | 1705 | $0.0012 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r2 2 | anthropic/claude-haiku-5.5 | 1 | 3205 | 0 | 0 | 1861 | $0.0013 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r2 referee | anthropic/claude-opus-5.5 | 1 | 3205 | 0 | 0 | 1017 | $0.0332 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r2 1 | anthropic/claude-haiku-5.5 | 1 | 3458 | 0 | 0 | 1198 | $0.0009 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r2 2 | anthropic/claude-haiku-5.5 | 1 | 3458 | 0 | 0 | 1544 | $0.0011 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r3 1 | anthropic/claude-haiku-5.5 | 1 | 3848 | 0 | 0 | 1325 | $0.0010 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r3 2 | anthropic/claude-haiku-5.5 | 1 | 3848 | 0 | 0 | 1820 | $0.0013 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r3 referee | anthropic/claude-opus-5.5 | 1 | 3848 | 0 | 0 | 991 | $0.0352 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r3 1 | anthropic/claude-haiku-5.5 | 1 | 4101 | 0 | 0 | 1185 | $0.0010 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r3 2 | anthropic/claude-haiku-5.5 | 1 | 4101 | 0 | 0 | 1628 | $0.0012 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r3 referee | anthropic/claude-opus-5.5 | 1 | 4101 | 0 | 0 | 940 | $0.0352 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r4 1 | anthropic/claude-haiku-5.5 | 1 | 3804 | 0 | 0 | 1644 | $0.0012 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r4 2 | anthropic/claude-haiku-5.5 | 1 | 3804 | 0 | 0 | 1427 | $0.0011 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r4 referee | anthropic/claude-opus-5.5 | 1 | 3804 | 0 | 0 | 1022 | $0.0357 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r4 1 | anthropic/claude-haiku-5.5 | 1 | 4057 | 0 | 0 | 331 | $0.0006 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r4 2 | anthropic/claude-haiku-5.5 | 1 | 4057 | 0 | 0 | 342 | $0.0006 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r5 1 | anthropic/claude-haiku-5.5 | 1 | 3990 | 0 | 0 | 1902 | $0.0014 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r5 2 | anthropic/claude-haiku-5.5 | 1 | 3990 | 0 | 0 | 1606 | $0.0012 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r5 referee | anthropic/claude-opus-5.5 | 1 | 3990 | 0 | 0 | 1004 | $0.0360 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r5 1 | anthropic/claude-haiku-5.5 | 1 | 4243 | 0 | 0 | 947 | $0.0009 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r5 2 | anthropic/claude-haiku-5.5 | 1 | 4243 | 0 | 0 | 1116 | $0.0010 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r5 referee | anthropic/claude-opus-5.5 | 1 | 4243 | 0 | 0 | 926 | $0.0355 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r6 1 | anthropic/claude-haiku-5.5 | 1 | 4956 | 0 | 0 | 2032 | $0.0015 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r6 2 | anthropic/claude-haiku-5.5 | 1 | 4956 | 0 | 0 | 2376 | $0.0017 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r6 referee | anthropic/claude-opus-5.5 | 1 | 4956 | 0 | 0 | 1101 | $0.0418 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r6 1 | anthropic/claude-haiku-5.5 | 1 | 5209 | 0 | 0 | 1849 | $0.0014 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r6 2 | anthropic/claude-haiku-5.5 | 1 | 5209 | 0 | 0 | 1765 | $0.0014 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r6 referee | anthropic/claude-opus-5.5 | 1 | 5209 | 0 | 0 | 947 | $0.0398 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r7 1 | anthropic/claude-haiku-5.5 | 1 | 5192 | 0 | 0 | 2431 | $0.0017 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r7 2 | anthropic/claude-haiku-5.5 | 1 | 5192 | 0 | 0 | 2614 | $0.0018 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r7 referee | anthropic/claude-opus-5.5 | 1 | 5192 | 0 | 0 | 1064 | $0.0420 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r7 1 | anthropic/claude-haiku-5.5 | 1 | 5445 | 0 | 0 | 1860 | $0.0015 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r7 2 | anthropic/claude-haiku-5.5 | 1 | 5445 | 0 | 0 | 1556 | $0.0013 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r7 referee | anthropic/claude-opus-5.5 | 1 | 5445 | 0 | 0 | 1119 | $0.0442 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r8 1 | anthropic/claude-haiku-5.5 | 1 | 4377 | 0 | 0 | 2256 | $0.0016 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r8 2 | anthropic/claude-haiku-5.5 | 1 | 4377 | 0 | 0 | 1777 | $0.0013 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r8 referee | anthropic/claude-opus-5.5 | 1 | 4377 | 0 | 0 | 1045 | $0.0384 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r8 1 | anthropic/claude-haiku-5.5 | 1 | 4630 | 0 | 0 | 1931 | $0.0014 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r8 2 | anthropic/claude-haiku-5.5 | 1 | 4630 | 0 | 0 | 1833 | $0.0014 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r8 referee | anthropic/claude-opus-5.5 | 1 | 4630 | 0 | 0 | 1022 | $0.0390 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r9 1 | anthropic/claude-haiku-5.5 | 1 | 4537 | 0 | 0 | 2172 | $0.0015 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r9 2 | anthropic/claude-haiku-5.5 | 1 | 4537 | 0 | 0 | 2285 | $0.0016 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r9 referee | anthropic/claude-opus-5.5 | 1 | 4537 | 0 | 0 | 1250 | $0.0431 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r9 1 | anthropic/claude-haiku-5.5 | 1 | 4790 | 0 | 0 | 2146 | $0.0016 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r9 2 | anthropic/claude-haiku-5.5 | 1 | 4790 | 0 | 0 | 1856 | $0.0014 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r9 referee | anthropic/claude-opus-5.5 | 1 | 4790 | 0 | 0 | 1426 | $0.0477 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r10 1 | anthropic/claude-haiku-5.5 | 1 | 4463 | 0 | 0 | 2147 | $0.0015 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r10 2 | anthropic/claude-haiku-5.5 | 1 | 4463 | 0 | 0 | 2031 | $0.0015 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r10 referee | anthropic/claude-opus-5.5 | 1 | 4463 | 0 | 0 | 1205 | $0.0420 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r10 1 | anthropic/claude-haiku-5.5 | 1 | 4716 | 0 | 0 | 2229 | $0.0016 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r10 2 | anthropic/claude-haiku-5.5 | 1 | 4716 | 0 | 0 | 1646 | $0.0013 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r10 referee | anthropic/claude-opus-5.5 | 1 | 4716 | 0 | 0 | 1094 | $0.0407 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r11 1 | anthropic/claude-haiku-5.5 | 1 | 3714 | 0 | 0 | 2195 | $0.0015 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r11 2 | anthropic/claude-haiku-5.5 | 1 | 3714 | 0 | 0 | 2321 | $0.0015 | 0 | 0 | 0 |
| S1-moderate-T2/score | round r11 referee | anthropic/claude-opus-5.5 | 1 | 3714 | 0 | 0 | 1283 | $0.0405 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r11 1 | anthropic/claude-haiku-5.5 | 1 | 3967 | 0 | 0 | 1659 | $0.0012 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r11 2 | anthropic/claude-haiku-5.5 | 1 | 3967 | 0 | 0 | 1613 | $0.0012 | 0 | 0 | 0 |
| S1-moderate-T2/score | hold r11 referee | anthropic/claude-opus-5.5 | 1 | 3967 | 0 | 0 | 1034 | $0.0365 | 0 | 0 | 0 |
| S1-moderate-T2/score | initiative r1 1 | anthropic/claude-haiku-5.5 | 1 | 2025 | 0 | 0 | 240 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T2/score | initiative r1 2 | anthropic/claude-haiku-5.5 | 1 | 2025 | 0 | 0 | 298 | $0.0004 | 0 | 0 | 0 |
| S1-moderate-T2/score | initiative r2 1 | anthropic/claude-haiku-5.5 | 1 | 1799 | 0 | 0 | 230 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T2/score | initiative r2 2 | anthropic/claude-haiku-5.5 | 1 | 1799 | 0 | 0 | 323 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T2/score | initiative r3 1 | anthropic/claude-haiku-5.5 | 1 | 2442 | 0 | 0 | 213 | $0.0004 | 0 | 0 | 0 |
| S1-moderate-T2/score | initiative r3 2 | anthropic/claude-haiku-5.5 | 1 | 2442 | 0 | 0 | 218 | $0.0004 | 0 | 0 | 0 |
| S1-moderate-T2/score | initiative r4 1 | anthropic/claude-haiku-5.5 | 1 | 2398 | 0 | 0 | 133 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T2/score | initiative r4 2 | anthropic/claude-haiku-5.5 | 1 | 2398 | 0 | 0 | 126 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T2/score | initiative r5 1 | anthropic/claude-haiku-5.5 | 1 | 2584 | 0 | 0 | 506 | $0.0005 | 0 | 0 | 0 |
| S1-moderate-T2/score | initiative r5 2 | anthropic/claude-haiku-5.5 | 1 | 2584 | 0 | 0 | 177 | $0.0003 | 0 | 0 | 0 |
| S1-moderate-T2/score | initiative r6 1 | anthropic/claude-haiku-5.5 | 1 | 3559 | 0 | 0 | 782 | $0.0007 | 0 | 0 | 0 |
| S1-moderate-T2/score | initiative r6 2 | anthropic/claude-haiku-5.5 | 1 | 3559 | 0 | 0 | 595 | $0.0007 | 0 | 0 | 0 |
| S1-moderate-T2/score | initiative r7 1 | anthropic/claude-haiku-5.5 | 1 | 3795 | 0 | 0 | 537 | $0.0006 | 0 | 0 | 0 |
| S1-moderate-T2/score | initiative r7 2 | anthropic/claude-haiku-5.5 | 1 | 3795 | 0 | 0 | 473 | $0.0006 | 0 | 0 | 0 |
| S1-moderate-T2/score | initiative r8 1 | anthropic/claude-haiku-5.5 | 1 | 2971 | 0 | 0 | 182 | $0.0004 | 0 | 0 | 0 |
| S1-moderate-T2/score | initiative r8 2 | anthropic/claude-haiku-5.5 | 1 | 2971 | 0 | 0 | 221 | $0.0004 | 0 | 0 | 0 |
| S1-moderate-T2/score | initiative r9 1 | anthropic/claude-haiku-5.5 | 1 | 3131 | 0 | 0 | 287 | $0.0005 | 0 | 0 | 0 |
| S1-moderate-T2/score | initiative r9 2 | anthropic/claude-haiku-5.5 | 1 | 3131 | 0 | 0 | 260 | $0.0004 | 0 | 0 | 0 |
| S1-moderate-T2/score | initiative r10 1 | anthropic/claude-haiku-5.5 | 1 | 3057 | 0 | 0 | 216 | $0.0004 | 0 | 0 | 0 |
| S1-moderate-T2/score | initiative r10 2 | anthropic/claude-haiku-5.5 | 1 | 3057 | 0 | 0 | 265 | $0.0004 | 0 | 0 | 0 |
| S1-moderate-T2/score | initiative r11 1 | anthropic/claude-haiku-5.5 | 1 | 2317 | 0 | 0 | 297 | $0.0004 | 0 | 0 | 0 |
| S1-moderate-T2/score | initiative r11 2 | anthropic/claude-haiku-5.5 | 1 | 2317 | 0 | 0 | 273 | $0.0004 | 0 | 0 | 0 |
| S1-high-T1 | relay opening | anthropic/claude-sonnet-5.5 | 1 | 1291 | 0 | 0 | 1272 | $0.0153 | 0 | 0 | 0 |
| S1-high-T1/Pell | player r1 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 10964 | 492 | $0.0647 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Pell r1 | anthropic/claude-haiku-5.5 | 1 | 1893 | 0 | 0 | 76 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1/Bram | player r1 | openai/gpt-6.1-sol | 1 | 3 | 0 | 7248 | 91 | $0.0190 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Bram r1 | anthropic/claude-haiku-5.5 | 1 | 1587 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1/Sefa | player r1 | deepseek/deepseek-v4-pro-0813 | 1 | 7594 | 0 | 0 | 506 | $0.0112 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Sefa r1 | anthropic/claude-haiku-5.5 | 1 | 1972 | 0 | 0 | 82 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1 | dm r1 | anthropic/claude-opus-5.5 | 1 | 4 | 19337 | 26945 | 3101 | $0.2006 | 0 | 0 | 0 |
| S1-high-T1 | relay r1 card | anthropic/claude-sonnet-5.5 | 1 | 2517 | 0 | 0 | 1093 | $0.0160 | 0 | 0 | 0 |
| S1-high-T1 | relay r1 card (asked again) | anthropic/claude-sonnet-5.5 | 1 | 2517 | 0 | 0 | 1112 | $0.0162 | 0 | 0 | 0 |
| S1-high-T1/Pell | player r1 card 1 | anthropic/claude-opus-5.5 | 2 | 8 | 23366 | 1603 | 225 | $0.0172 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Pell r1 card | anthropic/claude-haiku-5.5 | 2 | 1832 | 0 | 0 | 113 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1 | dm r1 onward | anthropic/claude-opus-5.5 | 3 | 10 | 117829 | 38232 | 6333 | $0.3414 | 0 | 0 | 0 |
| S1-high-T1 | dm r1 onward | anthropic/claude-haiku-5.5 | 2 | 4797 | 0 | 0 | 487 | $0.0007 | 0 | 0 | 0 |
| S1-high-T1 | relay r1 | anthropic/claude-sonnet-5.5 | 1 | 3852 | 0 | 0 | 1464 | $0.0223 | 0 | 0 | 0 |
| S1-high-T1/Bram | player r2 | openai/gpt-6.1-sol | 1 | 3 | 7248 | 156 | 69 | $0.0018 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Bram r2 | anthropic/claude-haiku-5.5 | 1 | 471 | 0 | 0 | 60 | $0.0001 | 0 | 0 | 0 |
| S1-high-T1/Sefa | player r2 | deepseek/deepseek-v4-pro-0813 | 1 | 475 | 7424 | 0 | 580 | $0.0029 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Sefa r2 | anthropic/claude-haiku-5.5 | 1 | 757 | 0 | 0 | 74 | $0.0001 | 0 | 0 | 0 |
| S1-high-T1/Pell | player r2 | anthropic/claude-opus-5.5 | 1 | 4 | 12567 | 1319 | 696 | $0.0230 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Pell r2 | anthropic/claude-haiku-5.5 | 1 | 2107 | 0 | 0 | 62 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1 | dm r2 | anthropic/claude-opus-5.5 | 1 | 4 | 19337 | 32655 | 3155 | $0.2364 | 0 | 0 | 0 |
| S1-high-T1 | relay r2 card | anthropic/claude-sonnet-5.5 | 1 | 2135 | 0 | 0 | 734 | $0.0116 | 0 | 0 | 0 |
| S1-high-T1 | relay r2 card (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 2900 | 0 | 0 | 604 | $0.0118 | 0 | 0 | 0 |
| S1-high-T1/Sefa | player r2 card 1 | deepseek/deepseek-v4-pro-0813 | 2 | 1449 | 16128 | 0 | 890 | $0.0058 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Sefa r2 card | anthropic/claude-haiku-5.5 | 5 | 5405 | 0 | 0 | 310 | $0.0007 | 0 | 0 | 0 |
| S1-high-T1 | dm r2 card prose (with a press) | anthropic/claude-opus-5.5 | 2 | 34830 | 20592 | 20592 | 1127 | $0.3307 | 0 | 0 | 0 |
| S1-high-T1 | dm r2 card prose | anthropic/claude-opus-5.5 | 3 | 53680 | 61776 | 0 | 2709 | $0.2813 | 0 | 0 | 0 |
| S1-high-T1/Sefa | player r2 card 2 | deepseek/deepseek-v4-pro-0813 | 1 | 914 | 8704 | 0 | 330 | $0.0029 | 0 | 0 | 0 |
| S1-high-T1/Sefa | player r2 card 3 | deepseek/deepseek-v4-pro-0813 | 1 | 811 | 9472 | 0 | 568 | $0.0035 | 0 | 0 | 0 |
| S1-high-T1/Sefa | player r2 card 4 | deepseek/deepseek-v4-pro-0813 | 1 | 824 | 9984 | 0 | 328 | $0.0029 | 0 | 0 | 0 |
| S1-high-T1 | dm r2 onward | anthropic/claude-opus-5.5 | 3 | 10 | 127497 | 41797 | 6946 | $0.3734 | 0 | 0 | 0 |
| S1-high-T1 | dm r2 onward | anthropic/claude-haiku-5.5 | 2 | 6212 | 0 | 0 | 841 | $0.0010 | 0 | 0 | 0 |
| S1-high-T1 | relay r2 | anthropic/claude-sonnet-5.5 | 1 | 3709 | 0 | 0 | 2604 | $0.0335 | 0 | 0 | 0 |
| S1-high-T1/Sefa | player r3 | deepseek/deepseek-v4-pro-0813 | 1 | 441 | 10496 | 0 | 821 | $0.0038 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Sefa r3 | anthropic/claude-haiku-5.5 | 1 | 1011 | 0 | 0 | 91 | $0.0001 | 0 | 0 | 0 |
| S1-high-T1/Pell | player r3 | anthropic/claude-opus-5.5 | 1 | 4 | 13886 | 1585 | 969 | $0.0301 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Pell r3 | anthropic/claude-haiku-5.5 | 1 | 2014 | 0 | 0 | 59 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1/Bram | player r3 | openai/gpt-6.1-sol | 1 | 3 | 7404 | 959 | 132 | $0.0045 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Bram r3 | anthropic/claude-haiku-5.5 | 1 | 1769 | 0 | 0 | 81 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1 | dm r3 | anthropic/claude-opus-5.5 | 3 | 12 | 95434 | 67892 | 11112 | $0.5875 | 0 | 0 | 0 |
| S1-high-T1 | dm r3 | anthropic/claude-haiku-5.5 | 2 | 6521 | 0 | 0 | 313 | $0.0008 | 0 | 0 | 0 |
| S1-high-T1 | relay r3 | anthropic/claude-sonnet-5.5 | 1 | 3771 | 0 | 0 | 3106 | $0.0386 | 0 | 0 | 0 |
| S1-high-T1 | relay r3 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5026 | 0 | 0 | 1117 | $0.0212 | 0 | 0 | 0 |
| S1-high-T1 | relay r3 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 5026 | 0 | 0 | 1122 | $0.0213 | 0 | 0 | 0 |
| S1-high-T1/Sefa | player r4 | deepseek/deepseek-v4-pro-0813 | 1 | 1357 | 10752 | 0 | 1215 | $0.0060 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Sefa r4 | anthropic/claude-haiku-5.5 | 1 | 1580 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1/Bram | player r4 | openai/gpt-6.1-sol | 1 | 3 | 8363 | 886 | 81 | $0.0039 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Bram r4 | anthropic/claude-haiku-5.5 | 1 | 1553 | 0 | 0 | 81 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1 | dm r4 | anthropic/claude-opus-5.5 | 6 | 22 | 225148 | 157519 | 15193 | $1.1498 | 0 | 0 | 0 |
| S1-high-T1 | dm r4 | anthropic/claude-haiku-5.5 | 3 | 9368 | 0 | 0 | 944 | $0.0014 | 0 | 0 | 0 |
| S1-high-T1 | relay r4 | anthropic/claude-sonnet-5.5 | 2 | 4840 | 0 | 0 | 3562 | $0.0453 | 0 | 0 | 0 |
| S1-high-T1 | relay r4 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3625 | 0 | 0 | 1204 | $0.0193 | 0 | 0 | 0 |
| S1-high-T1/Pell | player r4 | anthropic/claude-opus-5.5 | 1 | 4 | 15471 | 1521 | 841 | $0.0275 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Pell r4 | anthropic/claude-haiku-5.5 | 1 | 1798 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1/Bram | player r5 | openai/gpt-6.1-sol | 1 | 3 | 9249 | 908 | 91 | $0.0041 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Bram r5 | anthropic/claude-haiku-5.5 | 1 | 1643 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1/Sefa | player r5 | deepseek/deepseek-v4-pro-0813 | 1 | 1018 | 12032 | 0 | 1503 | $0.0064 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Sefa r5 | anthropic/claude-haiku-5.5 | 1 | 1741 | 0 | 0 | 84 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1 | dm r5 | anthropic/claude-opus-5.5 | 7 | 24 | 272052 | 129322 | 15189 | $2.7891 | 1 | 0 | 0 |
| S1-high-T1 | dm r5 | anthropic/claude-haiku-5.5 | 3 | 8948 | 0 | 0 | 925 | $0.0014 | 0 | 0 | 0 |
| S1-high-T1 | relay r5 | anthropic/claude-sonnet-5.5 | 2 | 5392 | 0 | 0 | 3252 | $0.0433 | 0 | 0 | 0 |
| S1-high-T1 | relay r5 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3849 | 0 | 0 | 942 | $0.0171 | 0 | 0 | 0 |
| S1-high-T1/Pell | player r5 | anthropic/claude-opus-5.5 | 1 | 4 | 16992 | 1767 | 1026 | $0.0328 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Pell r5 | anthropic/claude-haiku-5.5 | 1 | 2190 | 0 | 0 | 87 | $0.0003 | 0 | 0 | 0 |
| S1-high-T1/Sefa | player r6 | deepseek/deepseek-v4-pro-0813 | 1 | 1198 | 12800 | 0 | 1393 | $0.0065 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Sefa r6 | anthropic/claude-haiku-5.5 | 1 | 1723 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1/Bram | player r6 | openai/gpt-6.1-sol | 1 | 3 | 10157 | 882 | 114 | $0.0044 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Bram r6 | anthropic/claude-haiku-5.5 | 1 | 1559 | 0 | 0 | 76 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1 | dm r6 | anthropic/claude-opus-5.5 | 5 | 20 | 224004 | 135259 | 11633 | $0.9651 | 0 | 0 | 0 |
| S1-high-T1 | dm r6 | anthropic/claude-haiku-5.5 | 2 | 5498 | 0 | 0 | 595 | $0.0008 | 0 | 0 | 0 |
| S1-high-T1 | relay r6 | anthropic/claude-sonnet-5.5 | 2 | 5455 | 0 | 0 | 2787 | $0.0388 | 0 | 0 | 0 |
| S1-high-T1/Pell | player r6 | anthropic/claude-opus-5.5 | 1 | 4 | 18759 | 1713 | 895 | $0.0302 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Pell r6 | anthropic/claude-haiku-5.5 | 1 | 2069 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1 | relay r6 card | anthropic/claude-sonnet-5.5 | 1 | 1985 | 0 | 0 | 415 | $0.0081 | 0 | 0 | 0 |
| S1-high-T1/Pell | player r6 card 1 | anthropic/claude-opus-5.5 | 2 | 8 | 42111 | 1376 | 66 | $0.0167 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Pell r6 card | anthropic/claude-haiku-5.5 | 2 | 1308 | 0 | 0 | 113 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1 | dm r6 onward | anthropic/claude-opus-5.5 | 2 | 6 | 97719 | 45152 | 3578 | $0.3169 | 0 | 0 | 0 |
| S1-high-T1 | dm r6 onward | anthropic/claude-haiku-5.5 | 2 | 4508 | 0 | 0 | 481 | $0.0007 | 0 | 0 | 0 |
| S1-high-T1/Bram | player r7 | openai/gpt-6.1-sol | 1 | 3 | 11039 | 791 | 203 | $0.0051 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Bram r7 | anthropic/claude-haiku-5.5 | 1 | 1574 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1/Sefa | player r7 | deepseek/deepseek-v4-pro-0813 | 1 | 1213 | 13824 | 0 | 2009 | $0.0082 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Sefa r7 | anthropic/claude-haiku-5.5 | 1 | 1811 | 0 | 0 | 87 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1 | dm r7 | anthropic/claude-opus-5.5 | 7 | 28 | 324428 | 184903 | 14324 | $1.2889 | 0 | 0 | 0 |
| S1-high-T1 | dm r7 | anthropic/claude-haiku-5.5 | 4 | 13477 | 0 | 0 | 2306 | $0.0025 | 0 | 0 | 0 |
| S1-high-T1 | relay r7 | anthropic/claude-sonnet-5.5 | 2 | 5677 | 0 | 0 | 3549 | $0.0468 | 0 | 0 | 0 |
| S1-high-T1/Pell | player r7 | anthropic/claude-opus-5.5 | 1 | 4 | 21848 | 677 | 885 | $0.0255 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Pell r7 | anthropic/claude-haiku-5.5 | 1 | 1551 | 0 | 0 | 76 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1/Sefa | player r8 | deepseek/deepseek-v4-pro-0813 | 1 | 1328 | 14848 | 0 | 2864 | $0.0107 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Sefa r8 | anthropic/claude-haiku-5.5 | 1 | 1997 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1/Bram | player r8 | openai/gpt-6.1-sol | 1 | 3 | 11830 | 1173 | 141 | $0.0055 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Bram r8 | anthropic/claude-haiku-5.5 | 1 | 1901 | 0 | 0 | 52 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1 | dm r8 | anthropic/claude-opus-5.5 | 7 | 26 | 339785 | 191043 | 17595 | $1.3877 | 0 | 0 | 0 |
| S1-high-T1 | dm r8 | anthropic/claude-haiku-5.5 | 4 | 13788 | 0 | 0 | 2469 | $0.0026 | 0 | 0 | 0 |
| S1-high-T1 | relay r8 | anthropic/claude-sonnet-5.5 | 2 | 6007 | 0 | 0 | 3841 | $0.0504 | 0 | 0 | 0 |
| S1-high-T1 | relay r8 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4522 | 0 | 0 | 1139 | $0.0204 | 0 | 0 | 0 |
| S1-high-T1/Pell | player r8 | anthropic/claude-opus-5.5 | 1 | 4 | 22525 | 1454 | 775 | $0.0273 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Pell r8 | anthropic/claude-haiku-5.5 | 1 | 1818 | 0 | 0 | 85 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1/Bram | player r9 | openai/gpt-6.1-sol | 1 | 3 | 13003 | 920 | 192 | $0.0055 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Bram r9 | anthropic/claude-haiku-5.5 | 1 | 1684 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1/Sefa | player r9 | deepseek/deepseek-v4-pro-0813 | 1 | 1669 | 15872 | 0 | 2445 | $0.0101 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Sefa r9 | anthropic/claude-haiku-5.5 | 1 | 2200 | 0 | 0 | 81 | $0.0003 | 0 | 0 | 0 |
| S1-high-T1 | dm r9 | anthropic/claude-opus-5.5 | 5 | 20 | 269392 | 154501 | 18202 | $1.2051 | 0 | 0 | 0 |
| S1-high-T1 | dm r9 | anthropic/claude-haiku-5.5 | 2 | 7672 | 0 | 0 | 884 | $0.0012 | 0 | 0 | 0 |
| S1-high-T1 | relay r9 | anthropic/claude-sonnet-5.5 | 2 | 7321 | 0 | 0 | 4210 | $0.0567 | 0 | 0 | 0 |
| S1-high-T1 | relay r9 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5265 | 0 | 0 | 1648 | $0.0270 | 0 | 0 | 0 |
| S1-high-T1/Pell | player r9 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 25810 | 1327 | $0.1556 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Pell r9 | anthropic/claude-haiku-5.5 | 1 | 2162 | 0 | 0 | 89 | $0.0003 | 0 | 0 | 0 |
| S1-high-T1 | relay r9 card | anthropic/claude-sonnet-5.5 | 1 | 2208 | 0 | 0 | 752 | $0.0119 | 0 | 0 | 0 |
| S1-high-T1/Pell | player r9 card 1 | anthropic/claude-opus-5.5 | 2 | 8 | 53041 | 1648 | 108 | $0.0210 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Pell r9 card | anthropic/claude-haiku-5.5 | 2 | 1654 | 0 | 0 | 122 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1 | dm r9 onward | anthropic/claude-opus-5.5 | 3 | 10 | 211797 | 52324 | 4196 | $0.3879 | 0 | 0 | 0 |
| S1-high-T1 | dm r9 onward | anthropic/claude-haiku-5.5 | 2 | 5950 | 0 | 0 | 565 | $0.0009 | 0 | 0 | 0 |
| S1-high-T1/Sefa | player r10 | deepseek/deepseek-v4-pro-0813 | 1 | 1533 | 17408 | 0 | 4046 | $0.0143 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Sefa r10 | anthropic/claude-haiku-5.5 | 1 | 2279 | 0 | 0 | 62 | $0.0003 | 0 | 0 | 0 |
| S1-high-T1/Bram | player r10 | openai/gpt-6.1-sol | 1 | 3 | 13923 | 1322 | 291 | $0.0076 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Bram r10 | anthropic/claude-haiku-5.5 | 1 | 2286 | 0 | 0 | 70 | $0.0003 | 0 | 0 | 0 |
| S1-high-T1 | dm r10 | anthropic/claude-opus-5.5 | 9 | 36 | 552939 | 213786 | 22018 | $1.6366 | 0 | 0 | 0 |
| S1-high-T1 | dm r10 | anthropic/claude-haiku-5.5 | 6 | 22501 | 0 | 0 | 4545 | $0.0045 | 0 | 0 | 0 |
| S1-high-T1 | relay r10 | anthropic/claude-sonnet-5.5 | 2 | 6467 | 0 | 0 | 4218 | $0.0551 | 0 | 0 | 0 |
| S1-high-T1 | relay r10 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5708 | 0 | 0 | 1601 | $0.0274 | 0 | 0 | 0 |
| S1-high-T1 | relay r10 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 5693 | 0 | 0 | 1600 | $0.0274 | 0 | 0 | 0 |
| S1-high-T1/Pell | player r10 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 28445 | 904 | $0.1603 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Pell r10 | anthropic/claude-haiku-5.5 | 1 | 1937 | 0 | 0 | 61 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1/Bram | player r11 | openai/gpt-6.1-sol | 1 | 3 | 15245 | 1378 | 286 | $0.0078 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Bram r11 | anthropic/claude-haiku-5.5 | 1 | 2216 | 0 | 0 | 74 | $0.0003 | 0 | 0 | 0 |
| S1-high-T1/Sefa | player r11 | deepseek/deepseek-v4-pro-0813 | 1 | 1707 | 18688 | 0 | 3733 | $0.0138 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Sefa r11 | anthropic/claude-haiku-5.5 | 1 | 2515 | 0 | 0 | 64 | $0.0003 | 0 | 0 | 0 |
| S1-high-T1 | dm r11 | anthropic/claude-opus-5.5 | 8 | 32 | 480711 | 216709 | 21041 | $1.6157 | 0 | 0 | 0 |
| S1-high-T1 | dm r11 | anthropic/claude-haiku-5.5 | 5 | 20415 | 0 | 0 | 4161 | $0.0041 | 0 | 0 | 0 |
| S1-high-T1 | relay r11 | anthropic/claude-sonnet-5.5 | 2 | 6579 | 0 | 0 | 4211 | $0.0553 | 0 | 0 | 0 |
| S1-high-T1 | relay r11 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5555 | 0 | 0 | 1444 | $0.0255 | 0 | 0 | 0 |
| S1-high-T1/Pell | player r11 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 30083 | 736 | $0.1652 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Pell r11 | anthropic/claude-haiku-5.5 | 1 | 1876 | 0 | 0 | 87 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1/Sefa | player r12 | deepseek/deepseek-v4-pro-0813 | 1 | 749 | 20224 | 0 | 904 | $0.0053 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Sefa r12 | anthropic/claude-haiku-5.5 | 1 | 757 | 0 | 0 | 70 | $0.0001 | 0 | 0 | 0 |
| S1-high-T1/Bram | player r12 | openai/gpt-6.1-sol | 1 | 3 | 16623 | 1196 | 214 | $0.0068 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Bram r12 | anthropic/claude-haiku-5.5 | 1 | 2035 | 0 | 0 | 87 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1 | dm r12 | anthropic/claude-opus-5.5 | 5 | 20 | 234361 | 202392 | 18955 | $1.4500 | 0 | 0 | 0 |
| S1-high-T1 | dm r12 | anthropic/claude-haiku-5.5 | 3 | 10504 | 0 | 0 | 1463 | $0.0018 | 0 | 0 | 0 |
| S1-high-T1 | relay r12 | anthropic/claude-sonnet-5.5 | 2 | 5761 | 0 | 0 | 3504 | $0.0466 | 0 | 0 | 0 |
| S1-high-T1 | relay r12 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4450 | 0 | 0 | 1306 | $0.0220 | 0 | 0 | 0 |
| S1-high-T1/Pell | player r12 | anthropic/claude-opus-5.5 | 1 | 4 | 30083 | 1703 | 968 | $0.0339 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Pell r12 | anthropic/claude-haiku-5.5 | 1 | 2009 | 0 | 0 | 88 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1/Bram | player r13 | openai/gpt-6.1-sol | 1 | 3 | 17819 | 1143 | 154 | $0.0062 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Bram r13 | anthropic/claude-haiku-5.5 | 1 | 1846 | 0 | 0 | 58 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1 | dm r13 | anthropic/claude-opus-5.5 | 6 | 24 | 308907 | 250423 | 10132 | $1.5314 | 0 | 0 | 0 |
| S1-high-T1 | dm r13 | anthropic/claude-haiku-5.5 | 3 | 9270 | 0 | 0 | 2010 | $0.0019 | 0 | 0 | 0 |
| S1-high-T1 | relay r13 | anthropic/claude-sonnet-5.5 | 3 | 7586 | 0 | 0 | 2635 | $0.0415 | 0 | 0 | 0 |
| S1-high-T1/Sefa | player r13 | deepseek/deepseek-v4-pro-0813 | 1 | 1173 | 20736 | 0 | 3003 | $0.0114 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Sefa r13 | anthropic/claude-haiku-5.5 | 1 | 1737 | 0 | 0 | 83 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1 | relay r13 card | anthropic/claude-sonnet-5.5 | 1 | 1831 | 0 | 0 | 523 | $0.0089 | 0 | 0 | 0 |
| S1-high-T1/Sefa | player r13 card 1 | deepseek/deepseek-v4-pro-0813 | 2 | 1358 | 44288 | 0 | 349 | $0.0071 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Sefa r13 card | anthropic/claude-haiku-5.5 | 2 | 1585 | 0 | 0 | 122 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1 | dm r13 card prose (with a press) | anthropic/claude-opus-5.5 | 2 | 47559 | 84038 | 47818 | 668 | $0.6029 | 0 | 0 | 0 |
| S1-high-T1 | dm r13 onward | anthropic/claude-opus-5.5 | 4 | 14 | 325021 | 61128 | 8170 | $0.5341 | 0 | 0 | 0 |
| S1-high-T1 | dm r13 onward | anthropic/claude-haiku-5.5 | 2 | 5321 | 0 | 0 | 538 | $0.0008 | 0 | 0 | 0 |
| S1-high-T1/Pell | player r13 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 33445 | 888 | $0.1850 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Pell r13 | anthropic/claude-haiku-5.5 | 1 | 2015 | 0 | 0 | 91 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1/Bram | player r14 | openai/gpt-6.1-sol | 1 | 3 | 18962 | 756 | 128 | $0.0051 | 0 | 0 | 0 |
| S1-high-T1/check | check S1-high-T1 Bram r14 | anthropic/claude-haiku-5.5 | 1 | 1336 | 0 | 0 | 82 | $0.0002 | 0 | 0 | 0 |
| S1-high-T1 | dm r14 | anthropic/claude-opus-5.5 | 1 | 4 | 68507 | 50665 | 4664 | $0.3658 | 0 | 0 | 0 |
| S1-high-T1/score | round r1 1 | anthropic/claude-haiku-5.5 | 1 | 3830 | 0 | 0 | 1952 | $0.0014 | 0 | 0 | 0 |
| S1-high-T1/score | round r1 2 | anthropic/claude-haiku-5.5 | 1 | 3830 | 0 | 0 | 1918 | $0.0013 | 0 | 0 | 0 |
| S1-high-T1/score | round r1 referee | anthropic/claude-opus-5.5 | 1 | 3830 | 0 | 0 | 1371 | $0.0427 | 0 | 0 | 0 |
| S1-high-T1/score | hold r1 1 | anthropic/claude-haiku-5.5 | 1 | 4104 | 0 | 0 | 351 | $0.0006 | 0 | 0 | 0 |
| S1-high-T1/score | hold r1 2 | anthropic/claude-haiku-5.5 | 1 | 4104 | 0 | 0 | 336 | $0.0006 | 0 | 0 | 0 |
| S1-high-T1/score | round r2 1 | anthropic/claude-haiku-5.5 | 1 | 4009 | 0 | 0 | 900 | $0.0009 | 0 | 0 | 0 |
| S1-high-T1/score | round r2 2 | anthropic/claude-haiku-5.5 | 1 | 4009 | 0 | 0 | 1312 | $0.0011 | 0 | 0 | 0 |
| S1-high-T1/score | round r2 referee | anthropic/claude-opus-5.5 | 1 | 4009 | 0 | 0 | 868 | $0.0334 | 0 | 0 | 0 |
| S1-high-T1/score | hold r2 1 | anthropic/claude-haiku-5.5 | 1 | 4283 | 0 | 0 | 368 | $0.0006 | 0 | 0 | 0 |
| S1-high-T1/score | hold r2 2 | anthropic/claude-haiku-5.5 | 1 | 4283 | 0 | 0 | 935 | $0.0009 | 0 | 0 | 0 |
| S1-high-T1/score | round r3 1 | anthropic/claude-haiku-5.5 | 1 | 4699 | 0 | 0 | 1692 | $0.0013 | 0 | 0 | 0 |
| S1-high-T1/score | round r3 2 | anthropic/claude-haiku-5.5 | 1 | 4699 | 0 | 0 | 1714 | $0.0013 | 0 | 0 | 0 |
| S1-high-T1/score | round r3 referee | anthropic/claude-opus-5.5 | 1 | 4699 | 0 | 0 | 949 | $0.0378 | 0 | 0 | 0 |
| S1-high-T1/score | hold r3 1 | anthropic/claude-haiku-5.5 | 1 | 4973 | 0 | 0 | 1217 | $0.0011 | 0 | 0 | 0 |
| S1-high-T1/score | hold r3 2 | anthropic/claude-haiku-5.5 | 1 | 4973 | 0 | 0 | 418 | $0.0007 | 0 | 0 | 0 |
| S1-high-T1/score | hold r3 referee | anthropic/claude-opus-5.5 | 1 | 4973 | 0 | 0 | 796 | $0.0358 | 0 | 0 | 0 |
| S1-high-T1/score | round r4 1 | anthropic/claude-haiku-5.5 | 1 | 5100 | 0 | 0 | 1670 | $0.0013 | 0 | 0 | 0 |
| S1-high-T1/score | round r4 2 | anthropic/claude-haiku-5.5 | 1 | 5100 | 0 | 0 | 1355 | $0.0012 | 0 | 0 | 0 |
| S1-high-T1/score | round r4 referee | anthropic/claude-opus-5.5 | 1 | 5100 | 0 | 0 | 1108 | $0.0426 | 0 | 0 | 0 |
| S1-high-T1/score | hold r4 1 | anthropic/claude-haiku-5.5 | 1 | 5374 | 0 | 0 | 838 | $0.0010 | 0 | 0 | 0 |
| S1-high-T1/score | hold r4 2 | anthropic/claude-haiku-5.5 | 1 | 5374 | 0 | 0 | 1526 | $0.0013 | 0 | 0 | 0 |
| S1-high-T1/score | hold r4 referee | anthropic/claude-opus-5.5 | 1 | 5374 | 0 | 0 | 771 | $0.0369 | 0 | 0 | 0 |
| S1-high-T1/score | round r5 1 | anthropic/claude-haiku-5.5 | 1 | 5565 | 0 | 0 | 1751 | $0.0014 | 0 | 0 | 0 |
| S1-high-T1/score | round r5 2 | anthropic/claude-haiku-5.5 | 1 | 5565 | 0 | 0 | 1760 | $0.0014 | 0 | 0 | 0 |
| S1-high-T1/score | round r5 referee | anthropic/claude-opus-5.5 | 1 | 5565 | 0 | 0 | 1101 | $0.0443 | 0 | 0 | 0 |
| S1-high-T1/score | hold r5 1 | anthropic/claude-haiku-5.5 | 1 | 5839 | 0 | 0 | 1422 | $0.0013 | 0 | 0 | 0 |
| S1-high-T1/score | hold r5 2 | anthropic/claude-haiku-5.5 | 1 | 5839 | 0 | 0 | 1289 | $0.0012 | 0 | 0 | 0 |
| S1-high-T1/score | hold r5 referee | anthropic/claude-opus-5.5 | 1 | 5839 | 0 | 0 | 808 | $0.0395 | 0 | 0 | 0 |
| S1-high-T1/score | round r6 1 | anthropic/claude-haiku-5.5 | 1 | 5262 | 0 | 0 | 1843 | $0.0014 | 0 | 0 | 0 |
| S1-high-T1/score | round r6 2 | anthropic/claude-haiku-5.5 | 1 | 5262 | 0 | 0 | 1692 | $0.0014 | 0 | 0 | 0 |
| S1-high-T1/score | round r6 referee | anthropic/claude-opus-5.5 | 1 | 5262 | 0 | 0 | 1071 | $0.0425 | 0 | 0 | 0 |
| S1-high-T1/score | hold r6 1 | anthropic/claude-haiku-5.5 | 1 | 5536 | 0 | 0 | 406 | $0.0008 | 0 | 0 | 0 |
| S1-high-T1/score | hold r6 2 | anthropic/claude-haiku-5.5 | 1 | 5536 | 0 | 0 | 417 | $0.0008 | 0 | 0 | 0 |
| S1-high-T1/score | hold r6 referee | anthropic/claude-opus-5.5 | 1 | 5536 | 0 | 0 | 880 | $0.0397 | 0 | 0 | 0 |
| S1-high-T1/score | round r7 1 | anthropic/claude-haiku-5.5 | 1 | 5919 | 0 | 0 | 2278 | $0.0017 | 0 | 0 | 0 |
| S1-high-T1/score | round r7 2 | anthropic/claude-haiku-5.5 | 1 | 5919 | 0 | 0 | 2220 | $0.0017 | 0 | 0 | 0 |
| S1-high-T1/score | round r7 referee | anthropic/claude-opus-5.5 | 1 | 5919 | 0 | 0 | 1042 | $0.0445 | 0 | 0 | 0 |
| S1-high-T1/score | hold r7 1 | anthropic/claude-haiku-5.5 | 1 | 6193 | 0 | 0 | 1498 | $0.0014 | 0 | 0 | 0 |
| S1-high-T1/score | hold r7 2 | anthropic/claude-haiku-5.5 | 1 | 6193 | 0 | 0 | 1239 | $0.0012 | 0 | 0 | 0 |
| S1-high-T1/score | hold r7 referee | anthropic/claude-opus-5.5 | 1 | 6193 | 0 | 0 | 958 | $0.0439 | 0 | 0 | 0 |
| S1-high-T1/score | round r8 1 | anthropic/claude-haiku-5.5 | 1 | 6061 | 0 | 0 | 1953 | $0.0016 | 0 | 0 | 0 |
| S1-high-T1/score | round r8 2 | anthropic/claude-haiku-5.5 | 1 | 6061 | 0 | 0 | 1699 | $0.0015 | 0 | 0 | 0 |
| S1-high-T1/score | round r8 referee | anthropic/claude-opus-5.5 | 1 | 6061 | 0 | 0 | 1274 | $0.0497 | 0 | 0 | 0 |
| S1-high-T1/score | hold r8 1 | anthropic/claude-haiku-5.5 | 1 | 6335 | 0 | 0 | 1597 | $0.0014 | 0 | 0 | 0 |
| S1-high-T1/score | hold r8 2 | anthropic/claude-haiku-5.5 | 1 | 6335 | 0 | 0 | 1073 | $0.0012 | 0 | 0 | 0 |
| S1-high-T1/score | hold r8 referee | anthropic/claude-opus-5.5 | 1 | 6335 | 0 | 0 | 1011 | $0.0456 | 0 | 0 | 0 |
| S1-high-T1/score | round r9 1 | anthropic/claude-haiku-5.5 | 1 | 6910 | 0 | 0 | 2383 | $0.0019 | 0 | 0 | 0 |
| S1-high-T1/score | round r9 2 | anthropic/claude-haiku-5.5 | 1 | 6910 | 0 | 0 | 1845 | $0.0016 | 0 | 0 | 0 |
| S1-high-T1/score | round r9 referee | anthropic/claude-opus-5.5 | 1 | 6910 | 0 | 0 | 1260 | $0.0528 | 0 | 0 | 0 |
| S1-high-T1/score | hold r9 1 | anthropic/claude-haiku-5.5 | 1 | 7184 | 0 | 0 | 1461 | $0.0014 | 0 | 0 | 0 |
| S1-high-T1/score | hold r9 2 | anthropic/claude-haiku-5.5 | 1 | 7184 | 0 | 0 | 1372 | $0.0014 | 0 | 0 | 0 |
| S1-high-T1/score | hold r9 referee | anthropic/claude-opus-5.5 | 1 | 7184 | 0 | 0 | 1096 | $0.0507 | 0 | 0 | 0 |
| S1-high-T1/score | round r10 1 | anthropic/claude-haiku-5.5 | 1 | 6616 | 0 | 0 | 2167 | $0.0017 | 0 | 0 | 0 |
| S1-high-T1/score | round r10 2 | anthropic/claude-haiku-5.5 | 1 | 6616 | 0 | 0 | 2565 | $0.0019 | 0 | 0 | 0 |
| S1-high-T1/score | round r10 referee | anthropic/claude-opus-5.5 | 1 | 6616 | 0 | 0 | 1382 | $0.0541 | 0 | 0 | 0 |
| S1-high-T1/score | hold r10 1 | anthropic/claude-haiku-5.5 | 1 | 6890 | 0 | 0 | 494 | $0.0009 | 0 | 0 | 0 |
| S1-high-T1/score | hold r10 2 | anthropic/claude-haiku-5.5 | 1 | 6890 | 0 | 0 | 2291 | $0.0018 | 0 | 0 | 0 |
| S1-high-T1/score | hold r10 referee | anthropic/claude-opus-5.5 | 1 | 6890 | 0 | 0 | 1025 | $0.0481 | 0 | 0 | 0 |
| S1-high-T1/score | round r11 1 | anthropic/claude-haiku-5.5 | 1 | 6633 | 0 | 0 | 2702 | $0.0020 | 0 | 0 | 0 |
| S1-high-T1/score | round r11 2 | anthropic/claude-haiku-5.5 | 1 | 6633 | 0 | 0 | 2897 | $0.0021 | 0 | 0 | 0 |
| S1-high-T1/score | round r11 referee | anthropic/claude-opus-5.5 | 1 | 6633 | 0 | 0 | 1437 | $0.0553 | 0 | 0 | 0 |
| S1-high-T1/score | hold r11 1 | anthropic/claude-haiku-5.5 | 1 | 6907 | 0 | 0 | 415 | $0.0009 | 0 | 0 | 0 |
| S1-high-T1/score | hold r11 2 | anthropic/claude-haiku-5.5 | 1 | 6907 | 0 | 0 | 1756 | $0.0016 | 0 | 0 | 0 |
| S1-high-T1/score | hold r11 referee | anthropic/claude-opus-5.5 | 1 | 6907 | 0 | 0 | 1448 | $0.0566 | 0 | 0 | 0 |
| S1-high-T1/score | round r12 1 | anthropic/claude-haiku-5.5 | 1 | 5815 | 0 | 0 | 2073 | $0.0016 | 0 | 0 | 0 |
| S1-high-T1/score | round r12 2 | anthropic/claude-haiku-5.5 | 1 | 5815 | 0 | 0 | 2371 | $0.0018 | 0 | 0 | 0 |
| S1-high-T1/score | round r12 referee | anthropic/claude-opus-5.5 | 1 | 5815 | 0 | 0 | 1368 | $0.0506 | 0 | 0 | 0 |
| S1-high-T1/score | hold r12 1 | anthropic/claude-haiku-5.5 | 1 | 6089 | 0 | 0 | 1693 | $0.0015 | 0 | 0 | 0 |
| S1-high-T1/score | hold r12 2 | anthropic/claude-haiku-5.5 | 1 | 6089 | 0 | 0 | 1682 | $0.0014 | 0 | 0 | 0 |
| S1-high-T1/score | hold r12 referee | anthropic/claude-opus-5.5 | 1 | 6089 | 0 | 0 | 1133 | $0.0470 | 0 | 0 | 0 |
| S1-high-T1/score | round r13 1 | anthropic/claude-haiku-5.5 | 1 | 6313 | 0 | 0 | 2281 | $0.0018 | 0 | 0 | 0 |
| S1-high-T1/score | round r13 2 | anthropic/claude-haiku-5.5 | 1 | 6313 | 0 | 0 | 1955 | $0.0016 | 0 | 0 | 0 |
| S1-high-T1/score | round r13 referee | anthropic/claude-opus-5.5 | 1 | 6313 | 0 | 0 | 1365 | $0.0526 | 0 | 0 | 0 |
| S1-high-T1/score | hold r13 1 | anthropic/claude-haiku-5.5 | 1 | 6587 | 0 | 0 | 468 | $0.0009 | 0 | 0 | 0 |
| S1-high-T1/score | hold r13 2 | anthropic/claude-haiku-5.5 | 1 | 6587 | 0 | 0 | 2119 | $0.0017 | 0 | 0 | 0 |
| S1-high-T1/score | hold r13 referee | anthropic/claude-opus-5.5 | 1 | 6587 | 0 | 0 | 1243 | $0.0512 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r1 1 | anthropic/claude-haiku-5.5 | 1 | 2424 | 0 | 0 | 237 | $0.0004 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r1 2 | anthropic/claude-haiku-5.5 | 1 | 2424 | 0 | 0 | 305 | $0.0004 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r2 1 | anthropic/claude-haiku-5.5 | 1 | 2603 | 0 | 0 | 133 | $0.0003 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r2 2 | anthropic/claude-haiku-5.5 | 1 | 2603 | 0 | 0 | 143 | $0.0003 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r3 1 | anthropic/claude-haiku-5.5 | 1 | 3293 | 0 | 0 | 656 | $0.0007 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r3 2 | anthropic/claude-haiku-5.5 | 1 | 3293 | 0 | 0 | 644 | $0.0007 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r3 3 | anthropic/claude-haiku-5.5 | 1 | 3293 | 0 | 0 | 381 | $0.0005 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r4 1 | anthropic/claude-haiku-5.5 | 1 | 3703 | 0 | 0 | 354 | $0.0005 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r4 2 | anthropic/claude-haiku-5.5 | 1 | 3703 | 0 | 0 | 365 | $0.0006 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r5 1 | anthropic/claude-haiku-5.5 | 1 | 4168 | 0 | 0 | 458 | $0.0006 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r5 2 | anthropic/claude-haiku-5.5 | 1 | 4168 | 0 | 0 | 544 | $0.0007 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r6 1 | anthropic/claude-haiku-5.5 | 1 | 3865 | 0 | 0 | 531 | $0.0007 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r6 2 | anthropic/claude-haiku-5.5 | 1 | 3865 | 0 | 0 | 398 | $0.0006 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r7 1 | anthropic/claude-haiku-5.5 | 1 | 4522 | 0 | 0 | 506 | $0.0007 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r7 2 | anthropic/claude-haiku-5.5 | 1 | 4522 | 0 | 0 | 513 | $0.0007 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r8 1 | anthropic/claude-haiku-5.5 | 1 | 4664 | 0 | 0 | 674 | $0.0008 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r8 2 | anthropic/claude-haiku-5.5 | 1 | 4664 | 0 | 0 | 812 | $0.0009 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r9 1 | anthropic/claude-haiku-5.5 | 1 | 5513 | 0 | 0 | 786 | $0.0009 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r9 2 | anthropic/claude-haiku-5.5 | 1 | 5513 | 0 | 0 | 656 | $0.0009 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r10 1 | anthropic/claude-haiku-5.5 | 1 | 5219 | 0 | 0 | 961 | $0.0010 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r10 2 | anthropic/claude-haiku-5.5 | 1 | 5219 | 0 | 0 | 551 | $0.0008 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r10 3 | anthropic/claude-haiku-5.5 | 1 | 5219 | 0 | 0 | 759 | $0.0009 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r11 1 | anthropic/claude-haiku-5.5 | 1 | 5236 | 0 | 0 | 508 | $0.0008 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r11 2 | anthropic/claude-haiku-5.5 | 1 | 5236 | 0 | 0 | 460 | $0.0008 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r12 1 | anthropic/claude-haiku-5.5 | 1 | 4418 | 0 | 0 | 511 | $0.0007 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r12 2 | anthropic/claude-haiku-5.5 | 1 | 4418 | 0 | 0 | 751 | $0.0008 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r12 3 | anthropic/claude-haiku-5.5 | 1 | 4418 | 0 | 0 | 652 | $0.0008 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r13 1 | anthropic/claude-haiku-5.5 | 1 | 4925 | 0 | 0 | 566 | $0.0008 | 0 | 0 | 0 |
| S1-high-T1/score | initiative r13 2 | anthropic/claude-haiku-5.5 | 1 | 4925 | 0 | 0 | 839 | $0.0009 | 0 | 0 | 0 |
| S1-high-T2 | relay opening | anthropic/claude-sonnet-5.5 | 1 | 1291 | 0 | 0 | 1305 | $0.0156 | 0 | 0 | 0 |
| S1-high-T2/Pell | player r1 | anthropic/claude-fable-5.1 | 1 | 4 | 0 | 10975 | 374 | $0.1559 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Pell r1 | anthropic/claude-haiku-5.5 | 1 | 1781 | 0 | 0 | 71 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2/Bram | player r1 | openai/gpt-6-astra | 1 | 3 | 0 | 7256 | 115 | $0.0965 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Bram r1 | anthropic/claude-haiku-5.5 | 1 | 1638 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2/Sefa | player r1 | deepseek/deepseek-v4-pro-0813 | 1 | 7602 | 0 | 0 | 585 | $0.0114 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Sefa r1 | anthropic/claude-haiku-5.5 | 1 | 1815 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2 | dm r1 | anthropic/claude-opus-5.5 | 3 | 12 | 90317 | 62192 | 9790 | $0.5249 | 0 | 0 | 0 |
| S1-high-T2 | dm r1 | anthropic/claude-haiku-5.5 | 1 | 3088 | 0 | 0 | 481 | $0.0005 | 0 | 0 | 0 |
| S1-high-T2 | relay r1 | anthropic/claude-sonnet-5.5 | 1 | 2366 | 0 | 0 | 2948 | $0.0342 | 0 | 0 | 0 |
| S1-high-T2/Bram | player r2 | openai/gpt-6-astra | 1 | 3 | 7256 | 729 | 135 | $0.0231 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Bram r2 | anthropic/claude-haiku-5.5 | 1 | 1409 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2/Sefa | player r2 | deepseek/deepseek-v4-pro-0813 | 1 | 939 | 7424 | 0 | 2815 | $0.0093 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Sefa r2 | anthropic/claude-haiku-5.5 | 1 | 1467 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2/Pell | player r2 | anthropic/claude-fable-5.1 | 1 | 4 | 10975 | 1376 | 784 | $0.0592 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Pell r2 | anthropic/claude-haiku-5.5 | 1 | 1875 | 0 | 0 | 76 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2 | dm r2 | anthropic/claude-opus-5.5 | 1 | 4 | 19337 | 32382 | 3682 | $0.2440 | 0 | 0 | 0 |
| S1-high-T2 | relay r2 card | anthropic/claude-sonnet-5.5 | 1 | 2330 | 0 | 0 | 1097 | $0.0156 | 0 | 0 | 0 |
| S1-high-T2 | relay r2 card (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3399 | 0 | 0 | 945 | $0.0162 | 0 | 0 | 0 |
| S1-high-T2/Sefa | player r2 card 1 | deepseek/deepseek-v4-pro-0813 | 2 | 1495 | 17152 | 0 | 892 | $0.0060 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Sefa r2 card | anthropic/claude-haiku-5.5 | 3 | 3610 | 0 | 0 | 192 | $0.0005 | 0 | 0 | 0 |
| S1-high-T2 | dm r2 card prose | anthropic/claude-opus-5.5 | 1 | 17386 | 18110 | 1946 | 1195 | $0.1126 | 0 | 0 | 0 |
| S1-high-T2/Sefa | player r2 card 2 | deepseek/deepseek-v4-pro-0813 | 1 | 1197 | 9216 | 0 | 255 | $0.0031 | 0 | 0 | 0 |
| S1-high-T2 | dm r2 onward | anthropic/claude-opus-5.5 | 3 | 10 | 127380 | 43712 | 7479 | $0.3937 | 0 | 0 | 0 |
| S1-high-T2 | dm r2 onward | anthropic/claude-haiku-5.5 | 2 | 4988 | 0 | 0 | 654 | $0.0008 | 0 | 0 | 0 |
| S1-high-T2 | relay r2 | anthropic/claude-sonnet-5.5 | 1 | 3799 | 0 | 0 | 3512 | $0.0427 | 0 | 0 | 0 |
| S1-high-T2 | relay r2 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5349 | 0 | 0 | 1463 | $0.0253 | 0 | 0 | 0 |
| S1-high-T2 | relay r2 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5265 | 0 | 0 | 1369 | $0.0242 | 0 | 0 | 0 |
| S1-high-T2/Sefa | player r3 | deepseek/deepseek-v4-pro-0813 | 1 | 573 | 10240 | 0 | 564 | $0.0032 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Sefa r3 | anthropic/claude-haiku-5.5 | 1 | 1120 | 0 | 0 | 70 | $0.0001 | 0 | 0 | 0 |
| S1-high-T2/Pell | player r3 | anthropic/claude-fable-5.1 | 1 | 4 | 12351 | 1832 | 720 | $0.0620 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Pell r3 | anthropic/claude-haiku-5.5 | 1 | 2170 | 0 | 0 | 72 | $0.0003 | 0 | 0 | 0 |
| S1-high-T2/Bram | player r3 | openai/gpt-6-astra | 1 | 3 | 7985 | 1139 | 134 | $0.0290 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Bram r3 | anthropic/claude-haiku-5.5 | 1 | 1968 | 0 | 0 | 85 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2 | dm r3 | anthropic/claude-opus-5.5 | 3 | 12 | 99741 | 78708 | 11205 | $0.6437 | 0 | 0 | 0 |
| S1-high-T2 | dm r3 | anthropic/claude-haiku-5.5 | 1 | 3817 | 0 | 0 | 1027 | $0.0009 | 0 | 0 | 0 |
| S1-high-T2 | relay r3 | anthropic/claude-sonnet-5.5 | 1 | 3046 | 0 | 0 | 3812 | $0.0442 | 0 | 0 | 0 |
| S1-high-T2 | relay r3 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4197 | 0 | 0 | 1012 | $0.0185 | 0 | 0 | 0 |
| S1-high-T2 | relay r3 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4465 | 0 | 0 | 1331 | $0.0222 | 0 | 0 | 0 |
| S1-high-T2 | relay r3 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 4465 | 0 | 0 | 1317 | $0.0221 | 0 | 0 | 0 |
| S1-high-T2/Pell | player r4 | anthropic/claude-fable-5.1 | 1 | 4 | 14183 | 1820 | 549 | $0.0538 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Pell r4 | anthropic/claude-haiku-5.5 | 1 | 2097 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2/Bram | player r4 | openai/gpt-6-astra | 1 | 3 | 9124 | 1040 | 117 | $0.0280 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Bram r4 | anthropic/claude-haiku-5.5 | 1 | 1793 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2/Sefa | player r4 | deepseek/deepseek-v4-pro-0813 | 1 | 1229 | 10496 | 0 | 321 | $0.0035 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Sefa r4 | anthropic/claude-haiku-5.5 | 1 | 1660 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2 | dm r4 | anthropic/claude-opus-5.5 | 3 | 12 | 103354 | 81689 | 10027 | $0.6363 | 0 | 0 | 0 |
| S1-high-T2 | dm r4 | anthropic/claude-haiku-5.5 | 1 | 3471 | 0 | 0 | 550 | $0.0006 | 0 | 0 | 0 |
| S1-high-T2 | relay r4 | anthropic/claude-sonnet-5.5 | 1 | 2789 | 0 | 0 | 3947 | $0.0450 | 0 | 0 | 0 |
| S1-high-T2 | relay r4 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4276 | 0 | 0 | 1349 | $0.0220 | 0 | 0 | 0 |
| S1-high-T2 | relay r4 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4248 | 0 | 0 | 1341 | $0.0219 | 0 | 0 | 0 |
| S1-high-T2/Bram | player r5 | openai/gpt-6-astra | 1 | 3 | 10164 | 1045 | 84 | $0.0275 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Bram r5 | anthropic/claude-haiku-5.5 | 1 | 1789 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2/Sefa | player r5 | deepseek/deepseek-v4-pro-0813 | 1 | 1338 | 11520 | 0 | 459 | $0.0041 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Sefa r5 | anthropic/claude-haiku-5.5 | 1 | 1896 | 0 | 0 | 74 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2/Pell | player r5 | anthropic/claude-fable-5.1 | 1 | 4 | 16003 | 1634 | 575 | $0.0532 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Pell r5 | anthropic/claude-haiku-5.5 | 1 | 1941 | 0 | 0 | 76 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2 | dm r5 | anthropic/claude-opus-5.5 | 4 | 14 | 174131 | 80324 | 10808 | $0.6585 | 0 | 0 | 0 |
| S1-high-T2 | dm r5 | anthropic/claude-haiku-5.5 | 2 | 6762 | 0 | 0 | 1379 | $0.0014 | 0 | 0 | 0 |
| S1-high-T2 | relay r5 | anthropic/claude-sonnet-5.5 | 1 | 3240 | 0 | 0 | 2690 | $0.0334 | 0 | 0 | 0 |
| S1-high-T2/Sefa | player r6 | deepseek/deepseek-v4-pro-0813 | 1 | 1028 | 12544 | 0 | 588 | $0.0041 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Sefa r6 | anthropic/claude-haiku-5.5 | 1 | 1367 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2/Pell | player r6 | anthropic/claude-fable-5.1 | 1 | 4 | 17637 | 1782 | 1080 | $0.0807 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Pell r6 | anthropic/claude-haiku-5.5 | 1 | 2356 | 0 | 0 | 71 | $0.0003 | 0 | 0 | 0 |
| S1-high-T2/Bram | player r6 | openai/gpt-6-astra | 1 | 3 | 11209 | 568 | 202 | $0.0284 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Bram r6 | anthropic/claude-haiku-5.5 | 1 | 1217 | 0 | 0 | 60 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2 | dm r6 | anthropic/claude-opus-5.5 | 1 | 4 | 26990 | 39417 | 3777 | $0.2852 | 0 | 0 | 0 |
| S1-high-T2 | relay r6 card | anthropic/claude-sonnet-5.5 | 1 | 2146 | 0 | 0 | 525 | $0.0095 | 0 | 0 | 0 |
| S1-high-T2 | relay r6 card (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 2683 | 0 | 0 | 364 | $0.0090 | 0 | 0 | 0 |
| S1-high-T2/Pell | player r6 card 1 | anthropic/claude-fable-5.1 | 2 | 8 | 40018 | 1355 | 820 | $0.0680 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Pell r6 card | anthropic/claude-haiku-5.5 | 2 | 1744 | 0 | 0 | 141 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2 | dm r6 card prose (with a press) | anthropic/claude-opus-5.5 | 1 | 21287 | 20056 | 8527 | 1292 | $0.1832 | 0 | 0 | 0 |
| S1-high-T2 | dm r6 onward | anthropic/claude-opus-5.5 | 3 | 8 | 158359 | 43995 | 6994 | $0.3916 | 0 | 0 | 0 |
| S1-high-T2 | dm r6 onward | anthropic/claude-haiku-5.5 | 2 | 7106 | 0 | 0 | 930 | $0.0012 | 0 | 0 | 0 |
| S1-high-T2 | relay r6 | anthropic/claude-sonnet-5.5 | 1 | 4092 | 0 | 0 | 2531 | $0.0335 | 0 | 0 | 0 |
| S1-high-T2/Bram | player r7 | openai/gpt-6-astra | 1 | 3 | 11777 | 689 | 173 | $0.0291 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Bram r7 | anthropic/claude-haiku-5.5 | 1 | 1287 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2/Sefa | player r7 | deepseek/deepseek-v4-pro-0813 | 1 | 952 | 13312 | 0 | 904 | $0.0049 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Sefa r7 | anthropic/claude-haiku-5.5 | 1 | 1293 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2 | dm r7 | anthropic/claude-opus-5.5 | 8 | 32 | 368273 | 183649 | 19027 | $1.3869 | 0 | 0 | 0 |
| S1-high-T2 | dm r7 | anthropic/claude-haiku-5.5 | 4 | 13353 | 0 | 0 | 2449 | $0.0026 | 0 | 0 | 0 |
| S1-high-T2 | relay r7 | anthropic/claude-sonnet-5.5 | 2 | 5255 | 0 | 0 | 3860 | $0.0491 | 0 | 0 | 0 |
| S1-high-T2 | relay r7 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4030 | 0 | 0 | 1270 | $0.0208 | 0 | 0 | 0 |
| S1-high-T2/Pell | player r7 | anthropic/claude-fable-5.1 | 1 | 4 | 20774 | 1616 | 1483 | $0.0996 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Pell r7 | anthropic/claude-haiku-5.5 | 1 | 2141 | 0 | 0 | 77 | $0.0003 | 0 | 0 | 0 |
| S1-high-T2/Sefa | player r8 | deepseek/deepseek-v4-pro-0813 | 1 | 1292 | 14080 | 0 | 1303 | $0.0065 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Sefa r8 | anthropic/claude-haiku-5.5 | 1 | 1831 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2/Bram | player r8 | openai/gpt-6-astra | 1 | 3 | 12466 | 1113 | 231 | $0.0380 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Bram r8 | anthropic/claude-haiku-5.5 | 1 | 1992 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2 | dm r8 | anthropic/claude-opus-5.5 | 6 | 22 | 316718 | 153714 | 20359 | $1.2509 | 0 | 0 | 0 |
| S1-high-T2 | relay r8 card | anthropic/claude-sonnet-5.5 | 1 | 2227 | 0 | 0 | 1058 | $0.0150 | 0 | 0 | 0 |
| S1-high-T2/Bram | player r8 card 1 | openai/gpt-6-astra | 2 | 6 | 28130 | 1142 | 17 | $0.0433 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Bram r8 card | anthropic/claude-haiku-5.5 | 2 | 1955 | 0 | 0 | 125 | $0.0003 | 0 | 0 | 0 |
| S1-high-T2 | dm r8 onward | anthropic/claude-opus-5.5 | 4 | 14 | 248744 | 58798 | 7783 | $0.4995 | 0 | 0 | 0 |
| S1-high-T2 | dm r8 onward | anthropic/claude-haiku-5.5 | 3 | 10494 | 0 | 0 | 2040 | $0.0021 | 0 | 0 | 0 |
| S1-high-T2 | relay r8 | anthropic/claude-sonnet-5.5 | 2 | 6628 | 0 | 0 | 2915 | $0.0424 | 0 | 0 | 0 |
| S1-high-T2/Pell | player r8 | anthropic/claude-fable-5.1 | 1 | 4 | 0 | 24180 | 1117 | $0.3581 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Pell r8 | anthropic/claude-haiku-5.5 | 1 | 2069 | 0 | 0 | 78 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2 | dm r8 | anthropic/claude-haiku-5.5 | 2 | 5918 | 0 | 0 | 681 | $0.0009 | 0 | 0 | 0 |
| S1-high-T2/Bram | player r9 | openai/gpt-6-astra | 1 | 3 | 14721 | 524 | 131 | $0.0279 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Bram r9 | anthropic/claude-haiku-5.5 | 1 | 1260 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2/Sefa | player r9 | deepseek/deepseek-v4-pro-0813 | 1 | 1321 | 15104 | 0 | 1097 | $0.0061 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Sefa r9 | anthropic/claude-haiku-5.5 | 1 | 1791 | 0 | 0 | 57 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2 | dm r9 | anthropic/claude-opus-5.5 | 5 | 20 | 257505 | 139475 | 9747 | $0.9549 | 0 | 0 | 0 |
| S1-high-T2 | relay r9 card | anthropic/claude-sonnet-5.5 | 1 | 1662 | 0 | 0 | 531 | $0.0086 | 0 | 0 | 0 |
| S1-high-T2 | relay r9 card (asked again) | anthropic/claude-sonnet-5.5 | 1 | 1662 | 0 | 0 | 551 | $0.0088 | 0 | 0 | 0 |
| S1-high-T2/Sefa | player r9 card 1 | deepseek/deepseek-v4-pro-0813 | 2 | 1122 | 33024 | 0 | 734 | $0.0067 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Sefa r9 card | anthropic/claude-haiku-5.5 | 3 | 2885 | 0 | 0 | 170 | $0.0004 | 0 | 0 | 0 |
| S1-high-T2 | dm r9 card prose | anthropic/claude-opus-5.5 | 1 | 23727 | 28583 | 10697 | 1287 | $0.2119 | 0 | 0 | 0 |
| S1-high-T2/Sefa | player r9 card 2 | deepseek/deepseek-v4-pro-0813 | 1 | 1111 | 16896 | 0 | 177 | $0.0036 | 0 | 0 | 0 |
| S1-high-T2 | dm r9 onward | anthropic/claude-opus-5.5 | 2 | 6 | 104589 | 47420 | 5907 | $0.3762 | 0 | 0 | 0 |
| S1-high-T2 | dm r9 onward | anthropic/claude-haiku-5.5 | 2 | 5337 | 0 | 0 | 520 | $0.0008 | 0 | 0 | 0 |
| S1-high-T2 | relay r9 | anthropic/claude-sonnet-5.5 | 2 | 5567 | 0 | 0 | 2782 | $0.0390 | 0 | 0 | 0 |
| S1-high-T2/Pell | player r9 | anthropic/claude-fable-5.1 | 1 | 4 | 0 | 25857 | 1122 | $0.3794 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Pell r9 | anthropic/claude-haiku-5.5 | 1 | 1933 | 0 | 0 | 80 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2 | dm r9 | anthropic/claude-haiku-5.5 | 3 | 9381 | 0 | 0 | 1797 | $0.0018 | 0 | 0 | 0 |
| S1-high-T2/Sefa | player r10 | deepseek/deepseek-v4-pro-0813 | 1 | 575 | 17920 | 0 | 265 | $0.0032 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Sefa r10 | anthropic/claude-haiku-5.5 | 1 | 1213 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2/Bram | player r10 | openai/gpt-6-astra | 1 | 3 | 15245 | 978 | 186 | $0.0368 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Bram r10 | anthropic/claude-haiku-5.5 | 1 | 1729 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2 | dm r10 | anthropic/claude-opus-5.5 | 3 | 10 | 173488 | 99958 | 7644 | $0.6999 | 0 | 0 | 0 |
| S1-high-T2 | relay r10 card | anthropic/claude-sonnet-5.5 | 2 | 4408 | 0 | 0 | 1630 | $0.0251 | 0 | 0 | 0 |
| S1-high-T2 | relay r10 card (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3764 | 0 | 0 | 1218 | $0.0197 | 0 | 0 | 0 |
| S1-high-T2 | relay r10 card (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 3764 | 0 | 0 | 1072 | $0.0182 | 0 | 0 | 0 |
| S1-high-T2/Bram | player r10 card 1 | openai/gpt-6-astra | 4 | 12 | 68420 | 1482 | 60 | $0.0901 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Bram r10 card | anthropic/claude-haiku-5.5 | 4 | 3085 | 0 | 0 | 245 | $0.0004 | 0 | 0 | 0 |
| S1-high-T2 | dm r10 onward | anthropic/claude-opus-5.5 | 5 | 16 | 291960 | 111579 | 16280 | $0.9420 | 0 | 0 | 0 |
| S1-high-T2 | dm r10 onward | anthropic/claude-haiku-5.5 | 5 | 18331 | 0 | 0 | 2787 | $0.0032 | 0 | 0 | 0 |
| S1-high-T2 | relay r10 | anthropic/claude-sonnet-5.5 | 2 | 7566 | 0 | 0 | 2635 | $0.0415 | 0 | 0 | 0 |
| S1-high-T2/Pell | player r10 | anthropic/claude-fable-5.1 | 1 | 4 | 0 | 27402 | 1212 | $0.4032 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Pell r10 | anthropic/claude-haiku-5.5 | 1 | 1879 | 0 | 0 | 87 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2/Pell | player r10 card 1 | anthropic/claude-fable-5.1 | 4 | 16 | 113478 | 1678 | 944 | $0.0967 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Pell r10 card | anthropic/claude-haiku-5.5 | 4 | 3071 | 0 | 0 | 243 | $0.0004 | 0 | 0 | 0 |
| S1-high-T2 | dm r10 card prose (with a press) | anthropic/claude-opus-5.5 | 1 | 25327 | 39280 | 5831 | 1624 | $0.1883 | 0 | 0 | 0 |
| S1-high-T2/Bram | player r11 | openai/gpt-6-astra | 1 | 3 | 17705 | 546 | 102 | $0.0297 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Bram r11 | anthropic/claude-haiku-5.5 | 1 | 1218 | 0 | 0 | 62 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2/Sefa | player r11 | deepseek/deepseek-v4-pro-0813 | 1 | 1069 | 18176 | 0 | 871 | $0.0055 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Sefa r11 | anthropic/claude-haiku-5.5 | 1 | 1369 | 0 | 0 | 89 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2 | dm r11 | anthropic/claude-opus-5.5 | 2 | 8 | 93964 | 98421 | 8842 | $0.6992 | 0 | 0 | 0 |
| S1-high-T2 | relay r11 card | anthropic/claude-sonnet-5.5 | 2 | 3418 | 0 | 0 | 1049 | $0.0173 | 0 | 0 | 0 |
| S1-high-T2/Sefa | player r11 card 1 | deepseek/deepseek-v4-pro-0813 | 2 | 1346 | 38656 | 0 | 892 | $0.0079 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Sefa r11 card | anthropic/claude-haiku-5.5 | 3 | 3863 | 0 | 0 | 198 | $0.0005 | 0 | 0 | 0 |
| S1-high-T2 | dm r11 card prose | anthropic/claude-opus-5.5 | 1 | 25512 | 45111 | 2156 | 1882 | $0.1660 | 0 | 0 | 0 |
| S1-high-T2/Sefa | player r11 card 2 | deepseek/deepseek-v4-pro-0813 | 1 | 1365 | 19968 | 0 | 324 | $0.0046 | 0 | 0 | 0 |
| S1-high-T2 | dm r11 card prose (with a press) | anthropic/claude-opus-5.5 | 3 | 74652 | 143460 | 1659 | 2937 | $0.3993 | 0 | 0 | 0 |
| S1-high-T2 | dm r11 onward | anthropic/claude-opus-5.5 | 6 | 16 | 444661 | 109387 | 11095 | $0.8578 | 0 | 0 | 0 |
| S1-high-T2 | dm r11 onward | anthropic/claude-haiku-5.5 | 4 | 10669 | 0 | 0 | 1277 | $0.0017 | 0 | 0 | 0 |
| S1-high-T2 | relay r11 | anthropic/claude-sonnet-5.5 | 2 | 5999 | 0 | 0 | 2893 | $0.0409 | 0 | 0 | 0 |
| S1-high-T2 | relay r11 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4227 | 0 | 0 | 1075 | $0.0192 | 0 | 0 | 0 |
| S1-high-T2/Pell | player r11 | anthropic/claude-fable-5.1 | 1 | 4 | 0 | 31019 | 798 | $0.4277 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Pell r11 | anthropic/claude-haiku-5.5 | 1 | 2033 | 0 | 0 | 100 | $0.0003 | 0 | 0 | 0 |
| S1-high-T2/Pell | player r11 card 1 | anthropic/claude-fable-5.1 | 6 | 24 | 193250 | 2286 | 1142 | $0.1342 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Pell r11 card | anthropic/claude-haiku-5.5 | 6 | 3921 | 0 | 0 | 670 | $0.0007 | 0 | 0 | 0 |
| S1-high-T2/Bram | player r12 | openai/gpt-6-astra | 1 | 3 | 18251 | 950 | 119 | $0.0361 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Bram r12 | anthropic/claude-haiku-5.5 | 1 | 1681 | 0 | 0 | 80 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2 | dm r12 | anthropic/claude-opus-5.5 | 7 | 26 | 407020 | 250603 | 13057 | $1.6092 | 0 | 0 | 0 |
| S1-high-T2 | relay r12 card | anthropic/claude-sonnet-5.5 | 1 | 1275 | 0 | 0 | 264 | $0.0052 | 0 | 0 | 0 |
| S1-high-T2/Bram | player r12 card 1 | openai/gpt-6-astra | 4 | 12 | 78298 | 762 | 62 | $0.0910 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Bram r12 card | anthropic/claude-haiku-5.5 | 4 | 2130 | 0 | 0 | 251 | $0.0003 | 0 | 0 | 0 |
| S1-high-T2 | dm r12 onward | anthropic/claude-opus-5.5 | 3 | 10 | 221898 | 53056 | 3988 | $0.3895 | 0 | 0 | 0 |
| S1-high-T2 | dm r12 onward | anthropic/claude-haiku-5.5 | 2 | 5051 | 0 | 0 | 429 | $0.0007 | 0 | 0 | 0 |
| S1-high-T2 | relay r12 | anthropic/claude-sonnet-5.5 | 3 | 6514 | 0 | 0 | 2963 | $0.0427 | 0 | 0 | 0 |
| S1-high-T2/Sefa | player r12 | deepseek/deepseek-v4-pro-0813 | 1 | 735 | 21248 | 0 | 846 | $0.0053 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Sefa r12 | anthropic/claude-haiku-5.5 | 1 | 1226 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2 | dm r12 | anthropic/claude-haiku-5.5 | 4 | 8962 | 0 | 0 | 1048 | $0.0014 | 0 | 0 | 0 |
| S1-high-T2/Pell | player r12 | anthropic/claude-fable-5.1 | 1 | 4 | 33305 | 1470 | 979 | $0.0757 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Pell r12 | anthropic/claude-haiku-5.5 | 1 | 2069 | 0 | 0 | 92 | $0.0003 | 0 | 0 | 0 |
| S1-high-T2/Bram | player r13 | openai/gpt-6-astra | 1 | 3 | 19963 | 779 | 195 | $0.0395 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Bram r13 | anthropic/claude-haiku-5.5 | 1 | 1690 | 0 | 0 | 62 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2 | dm r13 | anthropic/claude-opus-5.5 | 9 | 34 | 611179 | 269814 | 17693 | $1.8397 | 0 | 0 | 0 |
| S1-high-T2 | dm r13 | anthropic/claude-haiku-5.5 | 5 | 15029 | 0 | 0 | 1945 | $0.0025 | 0 | 0 | 0 |
| S1-high-T2 | relay r13 | anthropic/claude-sonnet-5.5 | 2 | 4927 | 0 | 0 | 2828 | $0.0381 | 0 | 0 | 0 |
| S1-high-T2/Sefa | player r13 | deepseek/deepseek-v4-pro-0813 | 1 | 1064 | 21760 | 0 | 1310 | $0.0070 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Sefa r13 | anthropic/claude-haiku-5.5 | 1 | 1461 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| S1-high-T2/Pell | player r13 | anthropic/claude-fable-5.1 | 1 | 4 | 0 | 36367 | 1005 | $0.5049 | 0 | 0 | 0 |
| S1-high-T2/check | check S1-high-T2 Pell r13 | anthropic/claude-haiku-5.5 | 1 | 2077 | 0 | 0 | 89 | $0.0003 | 0 | 0 | 0 |
| S1-high-T2/score | round r1 1 | anthropic/claude-haiku-5.5 | 1 | 3294 | 0 | 0 | 1507 | $0.0011 | 0 | 0 | 0 |
| S1-high-T2/score | round r1 2 | anthropic/claude-haiku-5.5 | 1 | 3294 | 0 | 0 | 1949 | $0.0013 | 0 | 0 | 0 |
| S1-high-T2/score | round r1 referee | anthropic/claude-opus-5.5 | 1 | 3294 | 0 | 0 | 1066 | $0.0345 | 0 | 0 | 0 |
| S1-high-T2/score | hold r1 1 | anthropic/claude-haiku-5.5 | 1 | 3568 | 0 | 0 | 979 | $0.0008 | 0 | 0 | 0 |
| S1-high-T2/score | hold r1 2 | anthropic/claude-haiku-5.5 | 1 | 3568 | 0 | 0 | 917 | $0.0008 | 0 | 0 | 0 |
| S1-high-T2/score | hold r1 referee | anthropic/claude-opus-5.5 | 1 | 3568 | 0 | 0 | 752 | $0.0293 | 0 | 0 | 0 |
| S1-high-T2/score | round r2 1 | anthropic/claude-haiku-5.5 | 1 | 3796 | 0 | 0 | 1755 | $0.0013 | 0 | 0 | 0 |
| S1-high-T2/score | round r2 2 | anthropic/claude-haiku-5.5 | 1 | 3796 | 0 | 0 | 1566 | $0.0012 | 0 | 0 | 0 |
| S1-high-T2/score | round r2 referee | anthropic/claude-opus-5.5 | 1 | 3796 | 0 | 0 | 1208 | $0.0393 | 0 | 0 | 0 |
| S1-high-T2/score | hold r2 1 | anthropic/claude-haiku-5.5 | 1 | 4070 | 0 | 0 | 1156 | $0.0010 | 0 | 0 | 0 |
| S1-high-T2/score | hold r2 2 | anthropic/claude-haiku-5.5 | 1 | 4070 | 0 | 0 | 350 | $0.0006 | 0 | 0 | 0 |
| S1-high-T2/score | hold r2 referee | anthropic/claude-opus-5.5 | 1 | 4070 | 0 | 0 | 918 | $0.0346 | 0 | 0 | 0 |
| S1-high-T2/score | round r3 1 | anthropic/claude-haiku-5.5 | 1 | 3974 | 0 | 0 | 2294 | $0.0015 | 0 | 0 | 0 |
| S1-high-T2/score | round r3 2 | anthropic/claude-haiku-5.5 | 1 | 3974 | 0 | 0 | 1581 | $0.0012 | 0 | 0 | 0 |
| S1-high-T2/score | round r3 referee | anthropic/claude-opus-5.5 | 1 | 3974 | 0 | 0 | 1143 | $0.0388 | 0 | 0 | 0 |
| S1-high-T2/score | hold r3 1 | anthropic/claude-haiku-5.5 | 1 | 4248 | 0 | 0 | 905 | $0.0009 | 0 | 0 | 0 |
| S1-high-T2/score | hold r3 2 | anthropic/claude-haiku-5.5 | 1 | 4248 | 0 | 0 | 347 | $0.0006 | 0 | 0 | 0 |
| S1-high-T2/score | hold r3 referee | anthropic/claude-opus-5.5 | 1 | 4248 | 0 | 0 | 843 | $0.0339 | 0 | 0 | 0 |
| S1-high-T2/score | round r4 1 | anthropic/claude-haiku-5.5 | 1 | 3717 | 0 | 0 | 1715 | $0.0012 | 0 | 0 | 0 |
| S1-high-T2/score | round r4 2 | anthropic/claude-haiku-5.5 | 1 | 3717 | 0 | 0 | 1786 | $0.0013 | 0 | 0 | 0 |
| S1-high-T2/score | round r4 referee | anthropic/claude-opus-5.5 | 1 | 3717 | 0 | 0 | 1358 | $0.0420 | 0 | 0 | 0 |
| S1-high-T2/score | hold r4 1 | anthropic/claude-haiku-5.5 | 1 | 3991 | 0 | 0 | 1113 | $0.0010 | 0 | 0 | 0 |
| S1-high-T2/score | hold r4 2 | anthropic/claude-haiku-5.5 | 1 | 3991 | 0 | 0 | 1106 | $0.0010 | 0 | 0 | 0 |
| S1-high-T2/score | hold r4 referee | anthropic/claude-opus-5.5 | 1 | 3991 | 0 | 0 | 906 | $0.0341 | 0 | 0 | 0 |
| S1-high-T2/score | round r5 1 | anthropic/claude-haiku-5.5 | 1 | 4168 | 0 | 0 | 1564 | $0.0012 | 0 | 0 | 0 |
| S1-high-T2/score | round r5 2 | anthropic/claude-haiku-5.5 | 1 | 4168 | 0 | 0 | 1444 | $0.0011 | 0 | 0 | 0 |
| S1-high-T2/score | round r5 referee | anthropic/claude-opus-5.5 | 1 | 4168 | 0 | 0 | 1104 | $0.0388 | 0 | 0 | 0 |
| S1-high-T2/score | hold r5 1 | anthropic/claude-haiku-5.5 | 1 | 4442 | 0 | 0 | 345 | $0.0006 | 0 | 0 | 0 |
| S1-high-T2/score | hold r5 2 | anthropic/claude-haiku-5.5 | 1 | 4442 | 0 | 0 | 865 | $0.0009 | 0 | 0 | 0 |
| S1-high-T2/score | round r6 1 | anthropic/claude-haiku-5.5 | 1 | 4625 | 0 | 0 | 1817 | $0.0014 | 0 | 0 | 0 |
| S1-high-T2/score | round r6 2 | anthropic/claude-haiku-5.5 | 1 | 4625 | 0 | 0 | 1901 | $0.0014 | 0 | 0 | 0 |
| S1-high-T2/score | round r6 referee | anthropic/claude-opus-5.5 | 1 | 4625 | 0 | 0 | 1039 | $0.0393 | 0 | 0 | 0 |
| S1-high-T2/score | hold r6 1 | anthropic/claude-haiku-5.5 | 1 | 4899 | 0 | 0 | 434 | $0.0007 | 0 | 0 | 0 |
| S1-high-T2/score | hold r6 2 | anthropic/claude-haiku-5.5 | 1 | 4899 | 0 | 0 | 472 | $0.0007 | 0 | 0 | 0 |
| S1-high-T2/score | hold r6 referee | anthropic/claude-opus-5.5 | 1 | 4899 | 0 | 0 | 1028 | $0.0402 | 0 | 0 | 0 |
| S1-high-T2/score | round r7 1 | anthropic/claude-haiku-5.5 | 1 | 5416 | 0 | 0 | 2305 | $0.0017 | 0 | 0 | 0 |
| S1-high-T2/score | round r7 2 | anthropic/claude-haiku-5.5 | 1 | 5416 | 0 | 0 | 2122 | $0.0016 | 0 | 0 | 0 |
| S1-high-T2/score | round r7 referee | anthropic/claude-opus-5.5 | 1 | 5416 | 0 | 0 | 1354 | $0.0487 | 0 | 0 | 0 |
| S1-high-T2/score | hold r7 1 | anthropic/claude-haiku-5.5 | 1 | 5690 | 0 | 0 | 476 | $0.0008 | 0 | 0 | 0 |
| S1-high-T2/score | hold r7 2 | anthropic/claude-haiku-5.5 | 1 | 5690 | 0 | 0 | 1602 | $0.0014 | 0 | 0 | 0 |
| S1-high-T2/score | hold r7 referee | anthropic/claude-opus-5.5 | 1 | 5690 | 0 | 0 | 1234 | $0.0474 | 0 | 0 | 0 |
| S1-high-T2/score | round r8 1 | anthropic/claude-haiku-5.5 | 1 | 5736 | 0 | 0 | 2125 | $0.0016 | 0 | 0 | 0 |
| S1-high-T2/score | round r8 2 | anthropic/claude-haiku-5.5 | 1 | 5736 | 0 | 0 | 2315 | $0.0017 | 0 | 0 | 0 |
| S1-high-T2/score | round r8 referee | anthropic/claude-opus-5.5 | 1 | 5736 | 0 | 0 | 1262 | $0.0482 | 0 | 0 | 0 |
| S1-high-T2/score | hold r8 1 | anthropic/claude-haiku-5.5 | 1 | 6010 | 0 | 0 | 448 | $0.0008 | 0 | 0 | 0 |
| S1-high-T2/score | hold r8 2 | anthropic/claude-haiku-5.5 | 1 | 6010 | 0 | 0 | 1529 | $0.0014 | 0 | 0 | 0 |
| S1-high-T2/score | hold r8 referee | anthropic/claude-opus-5.5 | 1 | 6010 | 0 | 0 | 1102 | $0.0461 | 0 | 0 | 0 |
| S1-high-T2/score | round r9 1 | anthropic/claude-haiku-5.5 | 1 | 5151 | 0 | 0 | 1929 | $0.0015 | 0 | 0 | 0 |
| S1-high-T2/score | round r9 2 | anthropic/claude-haiku-5.5 | 1 | 5151 | 0 | 0 | 2071 | $0.0016 | 0 | 0 | 0 |
| S1-high-T2/score | round r9 referee | anthropic/claude-opus-5.5 | 1 | 5151 | 0 | 0 | 1140 | $0.0434 | 0 | 0 | 0 |
| S1-high-T2/score | hold r9 1 | anthropic/claude-haiku-5.5 | 1 | 5425 | 0 | 0 | 1459 | $0.0013 | 0 | 0 | 0 |
| S1-high-T2/score | hold r9 2 | anthropic/claude-haiku-5.5 | 1 | 5425 | 0 | 0 | 1593 | $0.0013 | 0 | 0 | 0 |
| S1-high-T2/score | hold r9 referee | anthropic/claude-opus-5.5 | 1 | 5425 | 0 | 0 | 902 | $0.0397 | 0 | 0 | 0 |
| S1-high-T2/score | round r10 1 | anthropic/claude-haiku-5.5 | 1 | 6134 | 0 | 0 | 1876 | $0.0016 | 0 | 0 | 0 |
| S1-high-T2/score | round r10 2 | anthropic/claude-haiku-5.5 | 1 | 6134 | 0 | 0 | 2492 | $0.0019 | 0 | 0 | 0 |
| S1-high-T2/score | round r10 referee | anthropic/claude-opus-5.5 | 1 | 6134 | 0 | 0 | 1145 | $0.0474 | 0 | 0 | 0 |
| S1-high-T2/score | hold r10 1 | anthropic/claude-haiku-5.5 | 1 | 6408 | 0 | 0 | 1463 | $0.0014 | 0 | 0 | 0 |
| S1-high-T2/score | hold r10 2 | anthropic/claude-haiku-5.5 | 1 | 6408 | 0 | 0 | 1560 | $0.0014 | 0 | 0 | 0 |
| S1-high-T2/score | round r11 1 | anthropic/claude-haiku-5.5 | 1 | 5149 | 0 | 0 | 1994 | $0.0015 | 0 | 0 | 0 |
| S1-high-T2/score | round r11 2 | anthropic/claude-haiku-5.5 | 1 | 5149 | 0 | 0 | 1484 | $0.0013 | 0 | 0 | 0 |
| S1-high-T2/score | round r11 referee | anthropic/claude-opus-5.5 | 1 | 5149 | 0 | 0 | 1185 | $0.0443 | 0 | 0 | 0 |
| S1-high-T2/score | hold r11 1 | anthropic/claude-haiku-5.5 | 1 | 5423 | 0 | 0 | 1485 | $0.0013 | 0 | 0 | 0 |
| S1-high-T2/score | hold r11 2 | anthropic/claude-haiku-5.5 | 1 | 5423 | 0 | 0 | 1596 | $0.0013 | 0 | 0 | 0 |
| S1-high-T2/score | hold r11 referee | anthropic/claude-opus-5.5 | 1 | 5423 | 0 | 0 | 1186 | $0.0454 | 0 | 0 | 0 |
| S1-high-T2/score | round r12 1 | anthropic/claude-haiku-5.5 | 1 | 5604 | 0 | 0 | 1898 | $0.0015 | 0 | 0 | 0 |
| S1-high-T2/score | round r12 2 | anthropic/claude-haiku-5.5 | 1 | 5604 | 0 | 0 | 1818 | $0.0015 | 0 | 0 | 0 |
| S1-high-T2/score | round r12 referee | anthropic/claude-opus-5.5 | 1 | 5604 | 0 | 0 | 1133 | $0.0451 | 0 | 0 | 0 |
| S1-high-T2/score | hold r12 1 | anthropic/claude-haiku-5.5 | 1 | 5878 | 0 | 0 | 1333 | $0.0013 | 0 | 0 | 0 |
| S1-high-T2/score | hold r12 2 | anthropic/claude-haiku-5.5 | 1 | 5878 | 0 | 0 | 1355 | $0.0013 | 0 | 0 | 0 |
| S1-high-T2/score | hold r12 referee | anthropic/claude-opus-5.5 | 1 | 5878 | 0 | 0 | 852 | $0.0406 | 0 | 0 | 0 |
| S1-high-T2/score | round r13 1 | anthropic/claude-haiku-5.5 | 1 | 5828 | 0 | 0 | 2216 | $0.0017 | 0 | 0 | 0 |
| S1-high-T2/score | round r13 2 | anthropic/claude-haiku-5.5 | 1 | 5828 | 0 | 0 | 1921 | $0.0015 | 0 | 0 | 0 |
| S1-high-T2/score | round r13 referee | anthropic/claude-opus-5.5 | 1 | 5828 | 0 | 0 | 1063 | $0.0446 | 0 | 0 | 0 |
| S1-high-T2/score | hold r13 1 | anthropic/claude-haiku-5.5 | 1 | 6102 | 0 | 0 | 370 | $0.0008 | 0 | 0 | 0 |
| S1-high-T2/score | hold r13 2 | anthropic/claude-haiku-5.5 | 1 | 6102 | 0 | 0 | 440 | $0.0008 | 0 | 0 | 0 |
| S1-high-T2/score | hold r13 referee | anthropic/claude-opus-5.5 | 1 | 6102 | 0 | 0 | 916 | $0.0427 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r1 1 | anthropic/claude-haiku-5.5 | 1 | 1888 | 0 | 0 | 430 | $0.0004 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r1 2 | anthropic/claude-haiku-5.5 | 1 | 1888 | 0 | 0 | 403 | $0.0004 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r2 1 | anthropic/claude-haiku-5.5 | 1 | 2390 | 0 | 0 | 359 | $0.0004 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r2 2 | anthropic/claude-haiku-5.5 | 1 | 2390 | 0 | 0 | 55 | $0.0003 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r3 1 | anthropic/claude-haiku-5.5 | 1 | 2568 | 0 | 0 | 66 | $0.0003 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r3 2 | anthropic/claude-haiku-5.5 | 1 | 2568 | 0 | 0 | 162 | $0.0003 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r4 1 | anthropic/claude-haiku-5.5 | 1 | 2311 | 0 | 0 | 58 | $0.0003 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r4 2 | anthropic/claude-haiku-5.5 | 1 | 2311 | 0 | 0 | 57 | $0.0003 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r5 1 | anthropic/claude-haiku-5.5 | 1 | 2762 | 0 | 0 | 142 | $0.0003 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r5 2 | anthropic/claude-haiku-5.5 | 1 | 2762 | 0 | 0 | 178 | $0.0004 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r6 1 | anthropic/claude-haiku-5.5 | 1 | 3219 | 0 | 0 | 275 | $0.0005 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r6 2 | anthropic/claude-haiku-5.5 | 1 | 3219 | 0 | 0 | 212 | $0.0004 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r7 1 | anthropic/claude-haiku-5.5 | 1 | 4019 | 0 | 0 | 531 | $0.0007 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r7 2 | anthropic/claude-haiku-5.5 | 1 | 4019 | 0 | 0 | 412 | $0.0006 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r8 1 | anthropic/claude-haiku-5.5 | 1 | 4339 | 0 | 0 | 819 | $0.0008 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r8 2 | anthropic/claude-haiku-5.5 | 1 | 4339 | 0 | 0 | 452 | $0.0007 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r8 3 | anthropic/claude-haiku-5.5 | 1 | 4339 | 0 | 0 | 725 | $0.0008 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r9 1 | anthropic/claude-haiku-5.5 | 1 | 3754 | 0 | 0 | 715 | $0.0007 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r9 2 | anthropic/claude-haiku-5.5 | 1 | 3754 | 0 | 0 | 559 | $0.0007 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r9 3 | anthropic/claude-haiku-5.5 | 1 | 3754 | 0 | 0 | 570 | $0.0007 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r10 1 | anthropic/claude-haiku-5.5 | 1 | 4737 | 0 | 0 | 481 | $0.0007 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r10 2 | anthropic/claude-haiku-5.5 | 1 | 4737 | 0 | 0 | 574 | $0.0008 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r11 1 | anthropic/claude-haiku-5.5 | 1 | 3752 | 0 | 0 | 500 | $0.0006 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r11 2 | anthropic/claude-haiku-5.5 | 1 | 3752 | 0 | 0 | 425 | $0.0006 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r12 1 | anthropic/claude-haiku-5.5 | 1 | 4216 | 0 | 0 | 486 | $0.0007 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r12 2 | anthropic/claude-haiku-5.5 | 1 | 4216 | 0 | 0 | 814 | $0.0008 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r13 1 | anthropic/claude-haiku-5.5 | 1 | 4440 | 0 | 0 | 613 | $0.0008 | 0 | 0 | 0 |
| S1-high-T2/score | initiative r13 2 | anthropic/claude-haiku-5.5 | 1 | 4440 | 0 | 0 | 667 | $0.0008 | 0 | 0 | 0 |
| S2-moderate-T1 | relay opening | anthropic/claude-sonnet-5.5 | 1 | 1324 | 0 | 0 | 1391 | $0.0166 | 0 | 0 | 0 |
| S2-moderate-T1/Sefa | player r1 | deepseek/deepseek-v4-pro-0813 | 1 | 7612 | 0 | 0 | 666 | $0.0116 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Sefa r1 | anthropic/claude-haiku-5.5 | 1 | 1943 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1/Pell | player r1 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 10974 | 408 | $0.0630 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Pell r1 | anthropic/claude-haiku-5.5 | 1 | 1820 | 0 | 0 | 76 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1/Bram | player r1 | openai/gpt-6.1-sol | 1 | 3 | 0 | 7264 | 82 | $0.0190 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Bram r1 | anthropic/claude-haiku-5.5 | 1 | 1607 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r1 | anthropic/claude-opus-5.5 | 1 | 4 | 10341 | 35986 | 2365 | $0.2564 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r1 card | anthropic/claude-sonnet-5.5 | 1 | 1918 | 0 | 0 | 711 | $0.0109 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r1 card (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 2653 | 0 | 0 | 590 | $0.0112 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r1 card (Pell's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 2663 | 0 | 0 | 589 | $0.0112 | 0 | 0 | 0 |
| S2-moderate-T1/Pell | player r1 card 1 | anthropic/claude-opus-5.5 | 2 | 8 | 22925 | 1158 | 125 | $0.0129 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Pell r1 card | anthropic/claude-haiku-5.5 | 2 | 1501 | 0 | 0 | 116 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r1 onward | anthropic/claude-opus-5.5 | 4 | 14 | 166746 | 37896 | 6378 | $0.3504 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r1 onward | anthropic/claude-haiku-5.5 | 2 | 4660 | 0 | 0 | 406 | $0.0007 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r1 | anthropic/claude-sonnet-5.5 | 1 | 3264 | 0 | 0 | 2820 | $0.0347 | 0 | 0 | 0 |
| S2-moderate-T1/Pell | player r2 | anthropic/claude-opus-5.5 | 1 | 4 | 12132 | 574 | 614 | $0.0176 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Pell r2 | anthropic/claude-haiku-5.5 | 1 | 1270 | 0 | 0 | 62 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1/Bram | player r2 | openai/gpt-6.1-sol | 1 | 3 | 7264 | 872 | 108 | $0.0040 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Bram r2 | anthropic/claude-haiku-5.5 | 1 | 1600 | 0 | 0 | 80 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1/Sefa | player r2 | deepseek/deepseek-v4-pro-0813 | 1 | 1160 | 7424 | 0 | 200 | $0.0028 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Sefa r2 | anthropic/claude-haiku-5.5 | 1 | 1400 | 0 | 0 | 42 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r2 | anthropic/claude-opus-5.5 | 3 | 12 | 94276 | 71135 | 5595 | $0.4919 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r2 | anthropic/claude-haiku-5.5 | 2 | 4798 | 0 | 0 | 542 | $0.0008 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r2 | anthropic/claude-sonnet-5.5 | 1 | 2225 | 0 | 0 | 2808 | $0.0325 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r2 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3269 | 0 | 0 | 913 | $0.0157 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r2 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3271 | 0 | 0 | 916 | $0.0157 | 0 | 0 | 0 |
| S2-moderate-T1/Bram | player r3 | openai/gpt-6.1-sol | 1 | 3 | 8136 | 762 | 90 | $0.0036 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Bram r3 | anthropic/claude-haiku-5.5 | 1 | 1359 | 0 | 0 | 87 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1/Sefa | player r3 | deepseek/deepseek-v4-pro-0813 | 1 | 798 | 8448 | 0 | 720 | $0.0038 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Sefa r3 | anthropic/claude-haiku-5.5 | 1 | 1454 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1/Pell | player r3 | anthropic/claude-opus-5.5 | 1 | 4 | 12706 | 1268 | 604 | $0.0210 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Pell r3 | anthropic/claude-haiku-5.5 | 1 | 1672 | 0 | 0 | 81 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r3 | anthropic/claude-opus-5.5 | 3 | 12 | 97331 | 72088 | 9825 | $0.5807 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r3 | anthropic/claude-haiku-5.5 | 1 | 3854 | 0 | 0 | 401 | $0.0006 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r3 | anthropic/claude-sonnet-5.5 | 1 | 3081 | 0 | 0 | 3221 | $0.0384 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r3 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4149 | 0 | 0 | 918 | $0.0175 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r3 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4103 | 0 | 0 | 871 | $0.0169 | 0 | 0 | 0 |
| S2-moderate-T1/Sefa | player r4 | deepseek/deepseek-v4-pro-0813 | 1 | 1094 | 8960 | 0 | 277 | $0.0030 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Sefa r4 | anthropic/claude-haiku-5.5 | 1 | 1380 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1/Pell | player r4 | anthropic/claude-opus-5.5 | 1 | 4 | 13974 | 1829 | 793 | $0.0278 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Pell r4 | anthropic/claude-haiku-5.5 | 1 | 2200 | 0 | 0 | 71 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T1/Bram | player r4 | openai/gpt-6.1-sol | 1 | 3 | 8898 | 941 | 136 | $0.0046 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Bram r4 | anthropic/claude-haiku-5.5 | 1 | 1720 | 0 | 0 | 81 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r4 | anthropic/claude-opus-5.5 | 3 | 12 | 99245 | 74641 | 10997 | $0.6197 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r4 | anthropic/claude-haiku-5.5 | 1 | 3575 | 0 | 0 | 556 | $0.0006 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r4 | anthropic/claude-sonnet-5.5 | 1 | 3057 | 0 | 0 | 4491 | $0.0510 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r4 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4592 | 0 | 0 | 1414 | $0.0233 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r4 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4701 | 0 | 0 | 1528 | $0.0247 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r4 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4580 | 0 | 0 | 1392 | $0.0231 | 0 | 0 | 0 |
| S2-moderate-T1/Pell | player r5 | anthropic/claude-opus-5.5 | 1 | 4 | 15803 | 2041 | 809 | $0.0296 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Pell r5 | anthropic/claude-haiku-5.5 | 1 | 2448 | 0 | 0 | 69 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T1/Bram | player r5 | openai/gpt-6.1-sol | 1 | 3 | 9839 | 1118 | 101 | $0.0048 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Bram r5 | anthropic/claude-haiku-5.5 | 1 | 1879 | 0 | 0 | 60 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1/Sefa | player r5 | deepseek/deepseek-v4-pro-0813 | 1 | 1187 | 9984 | 0 | 1547 | $0.0066 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Sefa r5 | anthropic/claude-haiku-5.5 | 1 | 1998 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r5 | anthropic/claude-opus-5.5 | 1 | 4 | 24834 | 38299 | 4642 | $0.2959 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r5 card | anthropic/claude-sonnet-5.5 | 1 | 3452 | 0 | 0 | 1649 | $0.0234 | 0 | 0 | 0 |
| S2-moderate-T1/Pell | player r5 card 1 | anthropic/claude-opus-5.5 | 2 | 8 | 37933 | 2430 | 26 | $0.0203 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Pell r5 card | anthropic/claude-haiku-5.5 | 2 | 2442 | 0 | 0 | 123 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r5 onward | anthropic/claude-opus-5.5 | 3 | 10 | 145403 | 54256 | 10016 | $0.5007 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r5 onward | anthropic/claude-haiku-5.5 | 2 | 8145 | 0 | 0 | 855 | $0.0012 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r5 | anthropic/claude-sonnet-5.5 | 1 | 5839 | 0 | 0 | 4011 | $0.0518 | 0 | 0 | 0 |
| S2-moderate-T1/Bram | player r6 | openai/gpt-6.1-sol | 1 | 3 | 10957 | 1142 | 82 | $0.0048 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Bram r6 | anthropic/claude-haiku-5.5 | 1 | 1946 | 0 | 0 | 59 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1/Sefa | player r6 | deepseek/deepseek-v4-pro-0813 | 1 | 1410 | 11008 | 0 | 424 | $0.0040 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Sefa r6 | anthropic/claude-haiku-5.5 | 1 | 2002 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r6 | anthropic/claude-opus-5.5 | 4 | 16 | 140275 | 126482 | 7546 | $0.8266 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r6 | anthropic/claude-haiku-5.5 | 1 | 3365 | 0 | 0 | 354 | $0.0005 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r6 | anthropic/claude-sonnet-5.5 | 2 | 5325 | 0 | 0 | 3487 | $0.0455 | 0 | 0 | 0 |
| S2-moderate-T1/Pell | player r6 | anthropic/claude-opus-5.5 | 1 | 4 | 20274 | 953 | 963 | $0.0281 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Pell r6 | anthropic/claude-haiku-5.5 | 1 | 1968 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r6 card | anthropic/claude-sonnet-5.5 | 1 | 1757 | 0 | 0 | 240 | $0.0059 | 0 | 0 | 0 |
| S2-moderate-T1/Pell | player r6 card 1 | anthropic/claude-opus-5.5 | 5 | 20 | 111278 | 1826 | 655 | $0.0446 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Pell r6 card | anthropic/claude-haiku-5.5 | 5 | 2701 | 0 | 0 | 296 | $0.0004 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r6 onward | anthropic/claude-opus-5.5 | 2 | 6 | 93170 | 43571 | 7106 | $0.3786 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r6 onward | anthropic/claude-haiku-5.5 | 2 | 5131 | 0 | 0 | 611 | $0.0008 | 0 | 0 | 0 |
| S2-moderate-T1/Sefa | player r7 | deepseek/deepseek-v4-pro-0813 | 1 | 1114 | 12288 | 0 | 718 | $0.0045 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Sefa r7 | anthropic/claude-haiku-5.5 | 1 | 1699 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1/Bram | player r7 | openai/gpt-6.1-sol | 1 | 3 | 12099 | 928 | 90 | $0.0044 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Bram r7 | anthropic/claude-haiku-5.5 | 1 | 1619 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r7 | anthropic/claude-opus-5.5 | 7 | 26 | 328056 | 188551 | 16580 | $1.3502 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r7 | anthropic/claude-haiku-5.5 | 3 | 9158 | 0 | 0 | 972 | $0.0014 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r7 | anthropic/claude-sonnet-5.5 | 2 | 4764 | 0 | 0 | 2842 | $0.0379 | 0 | 0 | 0 |
| S2-moderate-T1/Pell | player r7 | anthropic/claude-opus-5.5 | 1 | 4 | 23053 | 1102 | 951 | $0.0292 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Pell r7 | anthropic/claude-haiku-5.5 | 1 | 2048 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1/Bram | player r8 | openai/gpt-6.1-sol | 1 | 3 | 13027 | 751 | 154 | $0.0047 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Bram r8 | anthropic/claude-haiku-5.5 | 1 | 1450 | 0 | 0 | 77 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1/Sefa | player r8 | deepseek/deepseek-v4-pro-0813 | 1 | 920 | 13312 | 0 | 697 | $0.0043 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Sefa r8 | anthropic/claude-haiku-5.5 | 1 | 1386 | 0 | 0 | 60 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r8 | anthropic/claude-opus-5.5 | 4 | 16 | 115594 | 186359 | 12272 | $1.2101 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r8 | anthropic/claude-haiku-5.5 | 3 | 8689 | 0 | 0 | 746 | $0.0012 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r8 | anthropic/claude-sonnet-5.5 | 2 | 4330 | 0 | 0 | 2182 | $0.0305 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r8 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 2882 | 0 | 0 | 660 | $0.0124 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r8 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 2817 | 0 | 0 | 589 | $0.0115 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r8 (Sefa's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 2829 | 0 | 0 | 595 | $0.0116 | 0 | 0 | 0 |
| S2-moderate-T1/Pell | player r8 | anthropic/claude-opus-5.5 | 1 | 4 | 24155 | 1661 | 864 | $0.0304 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Pell r8 | anthropic/claude-haiku-5.5 | 1 | 1863 | 0 | 0 | 83 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1/Bram | player r9 | openai/gpt-6.1-sol | 1 | 3 | 13778 | 632 | 72 | $0.0037 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Bram r9 | anthropic/claude-haiku-5.5 | 1 | 1101 | 0 | 0 | 58 | $0.0001 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r9 | anthropic/claude-opus-5.5 | 5 | 20 | 162678 | 232893 | 10763 | $1.4227 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r9 | anthropic/claude-haiku-5.5 | 2 | 5775 | 0 | 0 | 1005 | $0.0011 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r9 | anthropic/claude-sonnet-5.5 | 3 | 6163 | 0 | 0 | 2964 | $0.0420 | 0 | 0 | 0 |
| S2-moderate-T1/Sefa | player r9 | deepseek/deepseek-v4-pro-0813 | 1 | 752 | 14080 | 0 | 203 | $0.0029 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Sefa r9 | anthropic/claude-haiku-5.5 | 1 | 1168 | 0 | 0 | 60 | $0.0001 | 0 | 0 | 0 |
| S2-moderate-T1/Pell | player r9 | anthropic/claude-opus-5.5 | 1 | 4 | 25816 | 1402 | 802 | $0.0282 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Pell r9 | anthropic/claude-haiku-5.5 | 1 | 1704 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r9 card | anthropic/claude-sonnet-5.5 | 1 | 1671 | 0 | 0 | 317 | $0.0065 | 0 | 0 | 0 |
| S2-moderate-T1/Pell | player r9 card 1 | anthropic/claude-opus-5.5 | 2 | 8 | 55328 | 1101 | 63 | $0.0179 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Pell r9 card | anthropic/claude-haiku-5.5 | 2 | 1226 | 0 | 0 | 125 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r9 onward | anthropic/claude-opus-5.5 | 4 | 14 | 276949 | 48689 | 3153 | $0.3620 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r9 onward | anthropic/claude-haiku-5.5 | 3 | 7828 | 0 | 0 | 1220 | $0.0014 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r9 (asked again) | anthropic/claude-sonnet-5.5 | 1 | 2616 | 0 | 0 | 714 | $0.0124 | 0 | 0 | 0 |
| S2-moderate-T1/Sefa | player r10 | deepseek/deepseek-v4-pro-0813 | 1 | 1019 | 14592 | 0 | 396 | $0.0038 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Sefa r10 | anthropic/claude-haiku-5.5 | 1 | 1498 | 0 | 0 | 81 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1/Pell | player r10 | anthropic/claude-opus-5.5 | 1 | 4 | 28319 | 612 | 1068 | $0.0301 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Pell r10 | anthropic/claude-haiku-5.5 | 1 | 1655 | 0 | 0 | 90 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1/Bram | player r10 | openai/gpt-6.1-sol | 1 | 3 | 14410 | 604 | 87 | $0.0038 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Bram r10 | anthropic/claude-haiku-5.5 | 1 | 1187 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r10 | anthropic/claude-opus-5.5 | 4 | 14 | 220399 | 87172 | 7117 | $0.6270 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r10 | anthropic/claude-haiku-5.5 | 1 | 3327 | 0 | 0 | 252 | $0.0005 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r10 | anthropic/claude-sonnet-5.5 | 1 | 2853 | 0 | 0 | 2240 | $0.0281 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r10 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3722 | 0 | 0 | 713 | $0.0146 | 0 | 0 | 0 |
| S2-moderate-T1/Pell | player r11 | anthropic/claude-opus-5.5 | 1 | 4 | 28931 | 1436 | 925 | $0.0315 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Pell r11 | anthropic/claude-haiku-5.5 | 1 | 1659 | 0 | 0 | 74 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1/Bram | player r11 | openai/gpt-6.1-sol | 1 | 3 | 15014 | 613 | 139 | $0.0044 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Bram r11 | anthropic/claude-haiku-5.5 | 1 | 1220 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1/Sefa | player r11 | deepseek/deepseek-v4-pro-0813 | 1 | 1023 | 15360 | 0 | 2467 | $0.0093 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Sefa r11 | anthropic/claude-haiku-5.5 | 1 | 1451 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r11 | anthropic/claude-opus-5.5 | 3 | 12 | 153543 | 92998 | 6622 | $0.6342 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r11 | anthropic/claude-haiku-5.5 | 2 | 5719 | 0 | 0 | 588 | $0.0009 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r11 | anthropic/claude-sonnet-5.5 | 1 | 2941 | 0 | 0 | 2892 | $0.0348 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r11 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4132 | 0 | 0 | 1039 | $0.0187 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r11 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 4128 | 0 | 0 | 1047 | $0.0187 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r11 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4041 | 0 | 0 | 945 | $0.0175 | 0 | 0 | 0 |
| S2-moderate-T1/Bram | player r12 | openai/gpt-6.1-sol | 1 | 3 | 15627 | 874 | 145 | $0.0052 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Bram r12 | anthropic/claude-haiku-5.5 | 1 | 1594 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1/Sefa | player r12 | deepseek/deepseek-v4-pro-0813 | 1 | 1228 | 16128 | 0 | 1538 | $0.0072 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Sefa r12 | anthropic/claude-haiku-5.5 | 1 | 1759 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1/Pell | player r12 | anthropic/claude-opus-5.5 | 1 | 4 | 30367 | 1479 | 1177 | $0.0370 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Pell r12 | anthropic/claude-haiku-5.5 | 1 | 1971 | 0 | 0 | 78 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r12 | anthropic/claude-opus-5.5 | 3 | 12 | 135525 | 101144 | 13969 | $0.8193 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r12 | anthropic/claude-haiku-5.5 | 1 | 4796 | 0 | 0 | 411 | $0.0007 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r12 | anthropic/claude-sonnet-5.5 | 1 | 3926 | 0 | 0 | 4379 | $0.0516 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r12 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5501 | 0 | 0 | 1412 | $0.0251 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r12 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 5477 | 0 | 0 | 1422 | $0.0252 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r12 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5483 | 0 | 0 | 1409 | $0.0251 | 0 | 0 | 0 |
| S2-moderate-T1/Sefa | player r13 | deepseek/deepseek-v4-pro-0813 | 1 | 1598 | 17152 | 0 | 816 | $0.0059 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Sefa r13 | anthropic/claude-haiku-5.5 | 1 | 2105 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1/Pell | player r13 | anthropic/claude-opus-5.5 | 1 | 4 | 31846 | 2299 | 1277 | $0.0434 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Pell r13 | anthropic/claude-haiku-5.5 | 1 | 2408 | 0 | 0 | 75 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T1/Bram | player r13 | openai/gpt-6.1-sol | 1 | 3 | 16501 | 1210 | 258 | $0.0073 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Bram r13 | anthropic/claude-haiku-5.5 | 1 | 2065 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r13 | anthropic/claude-opus-5.5 | 3 | 12 | 138493 | 101970 | 9789 | $0.7427 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r13 | anthropic/claude-haiku-5.5 | 1 | 4122 | 0 | 0 | 503 | $0.0007 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r13 | anthropic/claude-sonnet-5.5 | 1 | 3395 | 0 | 0 | 3780 | $0.0446 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r13 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4812 | 0 | 0 | 1248 | $0.0221 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r13 (Sefa's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 4822 | 0 | 0 | 1269 | $0.0223 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r13 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4707 | 0 | 0 | 1161 | $0.0210 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r13 (Pell's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 4721 | 0 | 0 | 1163 | $0.0211 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r13 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4798 | 0 | 0 | 1248 | $0.0221 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r13 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 4808 | 0 | 0 | 1260 | $0.0222 | 0 | 0 | 0 |
| S2-moderate-T1/Pell | player r14 | anthropic/claude-opus-5.5 | 1 | 4 | 34145 | 1806 | 902 | $0.0339 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Pell r14 | anthropic/claude-haiku-5.5 | 1 | 2167 | 0 | 0 | 83 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T1/Bram | player r14 | openai/gpt-6.1-sol | 1 | 3 | 17711 | 1067 | 158 | $0.0060 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Bram r14 | anthropic/claude-haiku-5.5 | 1 | 1832 | 0 | 0 | 76 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1/Sefa | player r14 | deepseek/deepseek-v4-pro-0813 | 1 | 1477 | 18432 | 0 | 1252 | $0.0070 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Sefa r14 | anthropic/claude-haiku-5.5 | 1 | 2042 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r14 | anthropic/claude-opus-5.5 | 2 | 8 | 72567 | 93431 | 12065 | $0.7306 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r14 | anthropic/claude-haiku-5.5 | 1 | 3985 | 0 | 0 | 520 | $0.0007 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r14 | anthropic/claude-sonnet-5.5 | 1 | 3478 | 0 | 0 | 2201 | $0.0290 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r14 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4770 | 0 | 0 | 1148 | $0.0210 | 0 | 0 | 0 |
| S2-moderate-T1/Pell | player r15 | anthropic/claude-opus-5.5 | 1 | 4 | 35951 | 1881 | 1338 | $0.0434 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Pell r15 | anthropic/claude-haiku-5.5 | 1 | 2326 | 0 | 0 | 64 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T1/Bram | player r15 | openai/gpt-6.1-sol | 1 | 3 | 18778 | 555 | 174 | $0.0050 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Bram r15 | anthropic/claude-haiku-5.5 | 1 | 1073 | 0 | 0 | 65 | $0.0001 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r15 | anthropic/claude-opus-5.5 | 2 | 8 | 110084 | 110008 | 5121 | $0.6902 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r15 card | anthropic/claude-sonnet-5.5 | 2 | 3924 | 0 | 0 | 1022 | $0.0181 | 0 | 0 | 0 |
| S2-moderate-T1/Pell | player r15 card 1 | anthropic/claude-opus-5.5 | 2 | 8 | 77022 | 1528 | 43 | $0.0239 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Pell r15 card | anthropic/claude-haiku-5.5 | 2 | 1375 | 0 | 0 | 119 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r15 onward | anthropic/claude-opus-5.5 | 3 | 10 | 204128 | 64362 | 10104 | $0.5648 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r15 onward | anthropic/claude-haiku-5.5 | 2 | 7255 | 0 | 0 | 683 | $0.0011 | 0 | 0 | 0 |
| S2-moderate-T1 | relay r15 | anthropic/claude-sonnet-5.5 | 1 | 3917 | 0 | 0 | 1214 | $0.0200 | 0 | 0 | 0 |
| S2-moderate-T1/Sefa | player r15 | deepseek/deepseek-v4-pro-0813 | 1 | 873 | 19712 | 0 | 505 | $0.0044 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Sefa r15 | anthropic/claude-haiku-5.5 | 1 | 1004 | 0 | 0 | 69 | $0.0001 | 0 | 0 | 0 |
| S2-moderate-T1/Sefa | player r15 card 1 | deepseek/deepseek-v4-pro-0813 | 2 | 797 | 41472 | 0 | 513 | $0.0065 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Sefa r15 card | anthropic/claude-haiku-5.5 | 5 | 5117 | 0 | 0 | 330 | $0.0007 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r15 card prose | anthropic/claude-opus-5.5 | 3 | 88622 | 116364 | 58182 | 2783 | $0.8989 | 0 | 0 | 0 |
| S2-moderate-T1/Sefa | player r15 card 2 | deepseek/deepseek-v4-pro-0813 | 1 | 730 | 20992 | 0 | 351 | $0.0040 | 0 | 0 | 0 |
| S2-moderate-T1/Sefa | player r15 card 3 | deepseek/deepseek-v4-pro-0813 | 1 | 836 | 21504 | 0 | 446 | $0.0044 | 0 | 0 | 0 |
| S2-moderate-T1/Sefa | player r15 card 4 | deepseek/deepseek-v4-pro-0813 | 1 | 596 | 22272 | 0 | 603 | $0.0046 | 0 | 0 | 0 |
| S2-moderate-T1 | dm r15 card prose (with a press) | anthropic/claude-opus-5.5 | 1 | 30965 | 58182 | 0 | 890 | $0.1533 | 0 | 0 | 0 |
| S2-moderate-T1/Bram | after 1 | openai/gpt-6.1-sol | 1 | 3 | 19333 | 166 | 213 | $0.0045 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Bram after 1 | anthropic/claude-haiku-5.5 | 1 | 683 | 0 | 0 | 81 | $0.0001 | 0 | 0 | 0 |
| S2-moderate-T1/Bram | after 2 | openai/gpt-6.1-sol | 1 | 3 | 19499 | 229 | 129 | $0.0038 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Bram after 2 | anthropic/claude-haiku-5.5 | 1 | 542 | 0 | 0 | 87 | $0.0001 | 0 | 0 | 0 |
| S2-moderate-T1/Bram | after 3 | openai/gpt-6.1-sol | 1 | 3 | 19728 | 146 | 73 | $0.0031 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Bram after 3 | anthropic/claude-haiku-5.5 | 1 | 438 | 0 | 0 | 57 | $0.0001 | 0 | 0 | 0 |
| S2-moderate-T1/Bram | after 4 | openai/gpt-6.1-sol | 1 | 3 | 19874 | 93 | 155 | $0.0038 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Bram after 4 | anthropic/claude-haiku-5.5 | 1 | 568 | 0 | 0 | 77 | $0.0001 | 0 | 0 | 0 |
| S2-moderate-T1/Sefa | after 1 | deepseek/deepseek-v4-pro-0813 | 1 | 460 | 22784 | 0 | 464 | $0.0041 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Sefa after 1 | anthropic/claude-haiku-5.5 | 1 | 455 | 0 | 0 | 77 | $0.0001 | 0 | 0 | 0 |
| S2-moderate-T1/Sefa | after 2 | deepseek/deepseek-v4-pro-0813 | 1 | 313 | 23040 | 0 | 709 | $0.0046 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Sefa after 2 | anthropic/claude-haiku-5.5 | 1 | 904 | 0 | 0 | 86 | $0.0001 | 0 | 0 | 0 |
| S2-moderate-T1/Sefa | after 3 | deepseek/deepseek-v4-pro-0813 | 1 | 745 | 23040 | 0 | 655 | $0.0050 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Sefa after 3 | anthropic/claude-haiku-5.5 | 1 | 820 | 0 | 0 | 67 | $0.0001 | 0 | 0 | 0 |
| S2-moderate-T1/Pell | after 1 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 40446 | 1215 | $0.2265 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Pell after 1 | anthropic/claude-haiku-5.5 | 1 | 1236 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T1/Pell | after 2 | anthropic/claude-opus-5.5 | 1 | 4 | 40446 | 931 | 955 | $0.0319 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Pell after 2 | anthropic/claude-haiku-5.5 | 1 | 1071 | 0 | 0 | 83 | $0.0001 | 0 | 0 | 0 |
| S2-moderate-T1/Pell | after 3 | anthropic/claude-opus-5.5 | 1 | 4 | 41377 | 753 | 1020 | $0.0325 | 0 | 0 | 0 |
| S2-moderate-T1/check | check S2-moderate-T1 Pell after 3 | anthropic/claude-haiku-5.5 | 1 | 958 | 0 | 0 | 67 | $0.0001 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r1 1 | anthropic/claude-haiku-5.5 | 1 | 3597 | 0 | 0 | 1159 | $0.0009 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r1 2 | anthropic/claude-haiku-5.5 | 1 | 3597 | 0 | 0 | 1139 | $0.0009 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r1 referee | anthropic/claude-opus-5.5 | 1 | 3597 | 0 | 0 | 736 | $0.0291 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r1 1 | anthropic/claude-haiku-5.5 | 1 | 3994 | 0 | 0 | 347 | $0.0006 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r1 2 | anthropic/claude-haiku-5.5 | 1 | 3994 | 0 | 0 | 345 | $0.0006 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r2 1 | anthropic/claude-haiku-5.5 | 1 | 3198 | 0 | 0 | 1372 | $0.0010 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r2 2 | anthropic/claude-haiku-5.5 | 1 | 3198 | 0 | 0 | 1440 | $0.0010 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r2 referee | anthropic/claude-opus-5.5 | 1 | 3198 | 0 | 0 | 840 | $0.0296 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r2 1 | anthropic/claude-haiku-5.5 | 1 | 3595 | 0 | 0 | 1664 | $0.0012 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r2 2 | anthropic/claude-haiku-5.5 | 1 | 3595 | 0 | 0 | 1353 | $0.0010 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r3 1 | anthropic/claude-haiku-5.5 | 1 | 4009 | 0 | 0 | 1907 | $0.0014 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r3 2 | anthropic/claude-haiku-5.5 | 1 | 4009 | 0 | 0 | 1612 | $0.0012 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r3 referee | anthropic/claude-opus-5.5 | 1 | 4009 | 0 | 0 | 1003 | $0.0361 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r3 1 | anthropic/claude-haiku-5.5 | 1 | 4406 | 0 | 0 | 1879 | $0.0014 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r3 2 | anthropic/claude-haiku-5.5 | 1 | 4406 | 0 | 0 | 506 | $0.0007 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r3 referee | anthropic/claude-opus-5.5 | 1 | 4406 | 0 | 0 | 1094 | $0.0395 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r4 1 | anthropic/claude-haiku-5.5 | 1 | 3985 | 0 | 0 | 1592 | $0.0012 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r4 2 | anthropic/claude-haiku-5.5 | 1 | 3985 | 0 | 0 | 1626 | $0.0012 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r4 referee | anthropic/claude-opus-5.5 | 1 | 3985 | 0 | 0 | 918 | $0.0343 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r4 1 | anthropic/claude-haiku-5.5 | 1 | 4382 | 0 | 0 | 765 | $0.0008 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r4 2 | anthropic/claude-haiku-5.5 | 1 | 4382 | 0 | 0 | 679 | $0.0008 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r5 1 | anthropic/claude-haiku-5.5 | 1 | 5238 | 0 | 0 | 2108 | $0.0016 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r5 2 | anthropic/claude-haiku-5.5 | 1 | 5238 | 0 | 0 | 1842 | $0.0014 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r5 referee | anthropic/claude-opus-5.5 | 1 | 5238 | 0 | 0 | 1037 | $0.0417 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r5 1 | anthropic/claude-haiku-5.5 | 1 | 5635 | 0 | 0 | 465 | $0.0008 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r5 2 | anthropic/claude-haiku-5.5 | 1 | 5635 | 0 | 0 | 442 | $0.0008 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r6 1 | anthropic/claude-haiku-5.5 | 1 | 5179 | 0 | 0 | 2019 | $0.0015 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r6 2 | anthropic/claude-haiku-5.5 | 1 | 5179 | 0 | 0 | 2419 | $0.0017 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r6 referee | anthropic/claude-opus-5.5 | 1 | 5179 | 0 | 0 | 982 | $0.0404 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r6 1 | anthropic/claude-haiku-5.5 | 1 | 5576 | 0 | 0 | 1051 | $0.0011 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r6 2 | anthropic/claude-haiku-5.5 | 1 | 5576 | 0 | 0 | 772 | $0.0009 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r6 referee | anthropic/claude-opus-5.5 | 1 | 5576 | 0 | 0 | 752 | $0.0373 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r7 1 | anthropic/claude-haiku-5.5 | 1 | 4989 | 0 | 0 | 1510 | $0.0013 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r7 2 | anthropic/claude-haiku-5.5 | 1 | 4989 | 0 | 0 | 1653 | $0.0013 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r7 referee | anthropic/claude-opus-5.5 | 1 | 4989 | 0 | 0 | 1168 | $0.0433 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r7 1 | anthropic/claude-haiku-5.5 | 1 | 5386 | 0 | 0 | 1545 | $0.0013 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r7 2 | anthropic/claude-haiku-5.5 | 1 | 5386 | 0 | 0 | 1025 | $0.0011 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r7 referee | anthropic/claude-opus-5.5 | 1 | 5386 | 0 | 0 | 794 | $0.0374 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r8 1 | anthropic/claude-haiku-5.5 | 1 | 4455 | 0 | 0 | 1679 | $0.0013 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r8 2 | anthropic/claude-haiku-5.5 | 1 | 4455 | 0 | 0 | 2322 | $0.0016 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r8 referee | anthropic/claude-opus-5.5 | 1 | 4455 | 0 | 0 | 1136 | $0.0405 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r8 1 | anthropic/claude-haiku-5.5 | 1 | 4852 | 0 | 0 | 1561 | $0.0013 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r8 2 | anthropic/claude-haiku-5.5 | 1 | 4852 | 0 | 0 | 1265 | $0.0011 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r8 referee | anthropic/claude-opus-5.5 | 1 | 4852 | 0 | 0 | 1248 | $0.0444 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r9 1 | anthropic/claude-haiku-5.5 | 1 | 5088 | 0 | 0 | 1369 | $0.0012 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r9 2 | anthropic/claude-haiku-5.5 | 1 | 5088 | 0 | 0 | 428 | $0.0007 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r9 referee | anthropic/claude-opus-5.5 | 1 | 5088 | 0 | 0 | 1018 | $0.0407 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r9 1 | anthropic/claude-haiku-5.5 | 1 | 5485 | 0 | 0 | 329 | $0.0007 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r9 2 | anthropic/claude-haiku-5.5 | 1 | 5485 | 0 | 0 | 339 | $0.0007 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r10 1 | anthropic/claude-haiku-5.5 | 1 | 3781 | 0 | 0 | 1680 | $0.0012 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r10 2 | anthropic/claude-haiku-5.5 | 1 | 3781 | 0 | 0 | 1806 | $0.0013 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r10 referee | anthropic/claude-opus-5.5 | 1 | 3781 | 0 | 0 | 1181 | $0.0387 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r10 1 | anthropic/claude-haiku-5.5 | 1 | 4178 | 0 | 0 | 836 | $0.0008 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r10 2 | anthropic/claude-haiku-5.5 | 1 | 4178 | 0 | 0 | 854 | $0.0008 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r10 referee | anthropic/claude-opus-5.5 | 1 | 4178 | 0 | 0 | 1154 | $0.0398 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r11 1 | anthropic/claude-haiku-5.5 | 1 | 4143 | 0 | 0 | 1776 | $0.0013 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r11 2 | anthropic/claude-haiku-5.5 | 1 | 4143 | 0 | 0 | 1786 | $0.0013 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r11 referee | anthropic/claude-opus-5.5 | 1 | 4143 | 0 | 0 | 1149 | $0.0396 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r11 1 | anthropic/claude-haiku-5.5 | 1 | 4540 | 0 | 0 | 1134 | $0.0010 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r11 2 | anthropic/claude-haiku-5.5 | 1 | 4540 | 0 | 0 | 1110 | $0.0010 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r11 referee | anthropic/claude-opus-5.5 | 1 | 4540 | 0 | 0 | 925 | $0.0367 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r12 1 | anthropic/claude-haiku-5.5 | 1 | 4905 | 0 | 0 | 2090 | $0.0015 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r12 2 | anthropic/claude-haiku-5.5 | 1 | 4905 | 0 | 0 | 2365 | $0.0017 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r12 referee | anthropic/claude-opus-5.5 | 1 | 4905 | 0 | 0 | 1593 | $0.0515 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r12 1 | anthropic/claude-haiku-5.5 | 1 | 5302 | 0 | 0 | 1813 | $0.0014 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r12 2 | anthropic/claude-haiku-5.5 | 1 | 5302 | 0 | 0 | 1871 | $0.0015 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r12 referee | anthropic/claude-opus-5.5 | 1 | 5302 | 0 | 0 | 1039 | $0.0420 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r13 1 | anthropic/claude-haiku-5.5 | 1 | 4323 | 0 | 0 | 2419 | $0.0016 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r13 2 | anthropic/claude-haiku-5.5 | 1 | 4323 | 0 | 0 | 1917 | $0.0014 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r13 referee | anthropic/claude-opus-5.5 | 1 | 4323 | 0 | 0 | 1491 | $0.0471 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r13 1 | anthropic/claude-haiku-5.5 | 1 | 4720 | 0 | 0 | 462 | $0.0007 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r13 2 | anthropic/claude-haiku-5.5 | 1 | 4720 | 0 | 0 | 1440 | $0.0012 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r13 referee | anthropic/claude-opus-5.5 | 1 | 4720 | 0 | 0 | 1287 | $0.0446 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r14 1 | anthropic/claude-haiku-5.5 | 1 | 4406 | 0 | 0 | 1799 | $0.0013 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r14 2 | anthropic/claude-haiku-5.5 | 1 | 4406 | 0 | 0 | 2189 | $0.0015 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r14 referee | anthropic/claude-opus-5.5 | 1 | 4406 | 0 | 0 | 1317 | $0.0440 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r14 1 | anthropic/claude-haiku-5.5 | 1 | 4803 | 0 | 0 | 2167 | $0.0016 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r14 2 | anthropic/claude-haiku-5.5 | 1 | 4803 | 0 | 0 | 2215 | $0.0016 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r14 referee | anthropic/claude-opus-5.5 | 1 | 4803 | 0 | 0 | 1371 | $0.0466 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r15 1 | anthropic/claude-haiku-5.5 | 1 | 4606 | 0 | 0 | 2468 | $0.0017 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r15 2 | anthropic/claude-haiku-5.5 | 1 | 4606 | 0 | 0 | 2413 | $0.0017 | 0 | 0 | 0 |
| S2-moderate-T1/score | round r15 referee | anthropic/claude-opus-5.5 | 1 | 4606 | 0 | 0 | 1512 | $0.0487 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r15 1 | anthropic/claude-haiku-5.5 | 1 | 5003 | 0 | 0 | 2056 | $0.0015 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r15 2 | anthropic/claude-haiku-5.5 | 1 | 5003 | 0 | 0 | 1739 | $0.0014 | 0 | 0 | 0 |
| S2-moderate-T1/score | hold r15 referee | anthropic/claude-opus-5.5 | 1 | 5003 | 0 | 0 | 1858 | $0.0572 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r1 1 | anthropic/claude-haiku-5.5 | 1 | 2191 | 0 | 0 | 170 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r1 2 | anthropic/claude-haiku-5.5 | 1 | 2191 | 0 | 0 | 149 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r2 1 | anthropic/claude-haiku-5.5 | 1 | 1792 | 0 | 0 | 339 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r2 2 | anthropic/claude-haiku-5.5 | 1 | 1792 | 0 | 0 | 398 | $0.0004 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r3 1 | anthropic/claude-haiku-5.5 | 1 | 2603 | 0 | 0 | 71 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r3 2 | anthropic/claude-haiku-5.5 | 1 | 2603 | 0 | 0 | 60 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r4 1 | anthropic/claude-haiku-5.5 | 1 | 2579 | 0 | 0 | 201 | $0.0004 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r4 2 | anthropic/claude-haiku-5.5 | 1 | 2579 | 0 | 0 | 187 | $0.0004 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r5 1 | anthropic/claude-haiku-5.5 | 1 | 3832 | 0 | 0 | 161 | $0.0005 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r5 2 | anthropic/claude-haiku-5.5 | 1 | 3832 | 0 | 0 | 181 | $0.0005 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r6 1 | anthropic/claude-haiku-5.5 | 1 | 3782 | 0 | 0 | 335 | $0.0005 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r6 2 | anthropic/claude-haiku-5.5 | 1 | 3782 | 0 | 0 | 244 | $0.0005 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r7 1 | anthropic/claude-haiku-5.5 | 1 | 3592 | 0 | 0 | 410 | $0.0006 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r7 2 | anthropic/claude-haiku-5.5 | 1 | 3592 | 0 | 0 | 339 | $0.0005 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r8 1 | anthropic/claude-haiku-5.5 | 1 | 3058 | 0 | 0 | 609 | $0.0006 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r8 2 | anthropic/claude-haiku-5.5 | 1 | 3058 | 0 | 0 | 428 | $0.0005 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r9 1 | anthropic/claude-haiku-5.5 | 1 | 3700 | 0 | 0 | 442 | $0.0006 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r9 2 | anthropic/claude-haiku-5.5 | 1 | 3700 | 0 | 0 | 620 | $0.0007 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r10 1 | anthropic/claude-haiku-5.5 | 1 | 2375 | 0 | 0 | 328 | $0.0004 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r10 2 | anthropic/claude-haiku-5.5 | 1 | 2375 | 0 | 0 | 337 | $0.0004 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r11 1 | anthropic/claude-haiku-5.5 | 1 | 2737 | 0 | 0 | 542 | $0.0005 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r11 2 | anthropic/claude-haiku-5.5 | 1 | 2737 | 0 | 0 | 580 | $0.0006 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r12 1 | anthropic/claude-haiku-5.5 | 1 | 3499 | 0 | 0 | 176 | $0.0004 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r12 2 | anthropic/claude-haiku-5.5 | 1 | 3499 | 0 | 0 | 180 | $0.0004 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r13 1 | anthropic/claude-haiku-5.5 | 1 | 2917 | 0 | 0 | 442 | $0.0005 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r13 2 | anthropic/claude-haiku-5.5 | 1 | 2917 | 0 | 0 | 510 | $0.0005 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r14 1 | anthropic/claude-haiku-5.5 | 1 | 3000 | 0 | 0 | 439 | $0.0005 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r14 2 | anthropic/claude-haiku-5.5 | 1 | 3000 | 0 | 0 | 554 | $0.0006 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r14 3 | anthropic/claude-haiku-5.5 | 1 | 3000 | 0 | 0 | 699 | $0.0006 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r15 1 | anthropic/claude-haiku-5.5 | 1 | 3209 | 0 | 0 | 335 | $0.0005 | 0 | 0 | 0 |
| S2-moderate-T1/score | initiative r15 2 | anthropic/claude-haiku-5.5 | 1 | 3209 | 0 | 0 | 363 | $0.0005 | 0 | 0 | 0 |
| S2-moderate-T2 | relay opening | anthropic/claude-sonnet-5.5 | 2 | 2648 | 0 | 0 | 2788 | $0.0332 | 0 | 0 | 0 |
| S2-moderate-T2/Sefa | player r1 | deepseek/deepseek-v4-pro-0813 | 2 | 15226 | 0 | 0 | 1639 | $0.0241 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Sefa r1 | anthropic/claude-haiku-5.5 | 2 | 3595 | 0 | 0 | 113 | $0.0004 | 0 | 0 | 0 |
| S2-moderate-T2/Pell | player r1 | anthropic/claude-fable-5.1 | 2 | 8 | 0 | 21950 | 889 | $0.3189 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Pell r1 | anthropic/claude-haiku-5.5 | 2 | 3763 | 0 | 0 | 128 | $0.0004 | 0 | 0 | 0 |
| S2-moderate-T2/Bram | player r1 | openai/gpt-6-astra | 2 | 6 | 6487 | 8043 | 205 | $0.1173 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Bram r1 | anthropic/claude-haiku-5.5 | 2 | 3286 | 0 | 0 | 127 | $0.0004 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r1 | anthropic/claude-opus-5.5 | 2 | 8 | 38742 | 53810 | 4809 | $0.3730 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r1 card | anthropic/claude-sonnet-5.5 | 3 | 5587 | 0 | 0 | 2190 | $0.0331 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r1 card (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3003 | 0 | 0 | 1747 | $0.0235 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r1 card (Sefa's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 3003 | 0 | 0 | 803 | $0.0140 | 0 | 0 | 0 |
| S2-moderate-T2/Sefa | player r1 card 1 | deepseek/deepseek-v4-pro-0813 | 2 | 1241 | 15616 | 0 | 810 | $0.0053 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Sefa r1 card | anthropic/claude-haiku-5.5 | 4 | 3949 | 0 | 0 | 288 | $0.0005 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r1 card prose | anthropic/claude-opus-5.5 | 2 | 31417 | 36689 | 467 | 1531 | $0.1674 | 0 | 0 | 0 |
| S2-moderate-T2/Sefa | player r1 card 2 | deepseek/deepseek-v4-pro-0813 | 1 | 946 | 8192 | 0 | 1617 | $0.0063 | 0 | 0 | 0 |
| S2-moderate-T2/Sefa | player r1 card 3 | deepseek/deepseek-v4-pro-0813 | 1 | 9587 | 0 | 0 | 365 | $0.0134 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r1 card prose (with a press) | anthropic/claude-opus-5.5 | 1 | 16492 | 18578 | 0 | 529 | $0.0803 | 0 | 0 | 0 |
| S2-moderate-T2/Bram | after 1 | openai/gpt-6-astra | 2 | 6 | 29875 | 1458 | 372 | $0.0668 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Bram after 1 | anthropic/claude-haiku-5.5 | 2 | 1244 | 0 | 0 | 129 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2/Bram | after 2 | openai/gpt-6-astra | 2 | 6 | 31333 | 404 | 244 | $0.0486 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Bram after 2 | anthropic/claude-haiku-5.5 | 2 | 1030 | 0 | 0 | 148 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2/Bram | after 3 | openai/gpt-6-astra | 2 | 6 | 31737 | 278 | 260 | $0.0483 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Bram after 3 | anthropic/claude-haiku-5.5 | 2 | 989 | 0 | 0 | 115 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2/Bram | after 4 | openai/gpt-6-astra | 2 | 6 | 32015 | 263 | 358 | $0.0533 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Bram after 4 | anthropic/claude-haiku-5.5 | 2 | 1214 | 0 | 0 | 141 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2/Sefa | after 1 | deepseek/deepseek-v4-pro-0813 | 2 | 1883 | 32768 | 0 | 775 | $0.0077 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Sefa after 1 | anthropic/claude-haiku-5.5 | 2 | 1003 | 0 | 0 | 139 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2/Sefa | after 2 | deepseek/deepseek-v4-pro-0813 | 2 | 623 | 34304 | 0 | 1747 | $0.0088 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Sefa after 2 | anthropic/claude-haiku-5.5 | 2 | 1191 | 0 | 0 | 135 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2/Sefa | after 3 | deepseek/deepseek-v4-pro-0813 | 2 | 1538 | 33792 | 0 | 925 | $0.0078 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Sefa after 3 | anthropic/claude-haiku-5.5 | 2 | 1303 | 0 | 0 | 131 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2/Pell | after 1 | anthropic/claude-fable-5.1 | 2 | 8 | 0 | 55268 | 944 | $0.7381 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Pell after 1 | anthropic/claude-haiku-5.5 | 2 | 1464 | 0 | 0 | 150 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2/Pell | after 2 | anthropic/claude-fable-5.1 | 2 | 8 | 55268 | 854 | 1134 | $0.0813 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Pell after 2 | anthropic/claude-haiku-5.5 | 2 | 1641 | 0 | 0 | 145 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2/Pell | after 3 | anthropic/claude-fable-5.1 | 2 | 8 | 56122 | 1005 | 1222 | $0.0878 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Pell after 3 | anthropic/claude-haiku-5.5 | 2 | 1631 | 0 | 0 | 139 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r1 card (asked again) | anthropic/claude-sonnet-5.5 | 1 | 1780 | 0 | 0 | 661 | $0.0102 | 0 | 0 | 0 |
| S2-moderate-T2/Bram | player r1 card 1 | openai/gpt-6-astra | 2 | 6 | 15098 | 708 | 17 | $0.0249 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Bram r1 card | anthropic/claude-haiku-5.5 | 2 | 1455 | 0 | 0 | 120 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r1 card (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 2451 | 0 | 0 | 510 | $0.0100 | 0 | 0 | 0 |
| S2-moderate-T2/Pell | player r1 card 1 | anthropic/claude-fable-5.1 | 2 | 8 | 22947 | 1177 | 16 | $0.0213 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Pell r1 card | anthropic/claude-haiku-5.5 | 2 | 1429 | 0 | 0 | 118 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r1 onward | anthropic/claude-opus-5.5 | 4 | 14 | 167325 | 39723 | 7396 | $0.3801 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r1 onward | anthropic/claude-haiku-5.5 | 2 | 4868 | 0 | 0 | 449 | $0.0007 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r1 | anthropic/claude-sonnet-5.5 | 1 | 3809 | 0 | 0 | 2587 | $0.0335 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r1 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5014 | 0 | 0 | 1080 | $0.0208 | 0 | 0 | 0 |
| S2-moderate-T2/Pell | player r2 | anthropic/claude-fable-5.1 | 1 | 4 | 12151 | 807 | 581 | $0.0422 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Pell r2 | anthropic/claude-haiku-5.5 | 1 | 1578 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2/Bram | player r2 | openai/gpt-6-astra | 1 | 3 | 7972 | 466 | 134 | $0.0205 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Bram r2 | anthropic/claude-haiku-5.5 | 1 | 1166 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2/Sefa | player r2 | deepseek/deepseek-v4-pro-0813 | 1 | 1057 | 7424 | 0 | 482 | $0.0034 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Sefa r2 | anthropic/claude-haiku-5.5 | 1 | 1615 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r2 | anthropic/claude-opus-5.5 | 1 | 4 | 19371 | 36201 | 2072 | $0.2320 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r2 card | anthropic/claude-sonnet-5.5 | 1 | 2192 | 0 | 0 | 801 | $0.0124 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r2 card (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3029 | 0 | 0 | 672 | $0.0128 | 0 | 0 | 0 |
| S2-moderate-T2/Sefa | player r2 card 1 | deepseek/deepseek-v4-pro-0813 | 2 | 1341 | 17152 | 0 | 385 | $0.0045 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Sefa r2 card | anthropic/claude-haiku-5.5 | 3 | 2530 | 0 | 0 | 172 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r2 card prose | anthropic/claude-opus-5.5 | 1 | 17639 | 18578 | 1883 | 490 | $0.0991 | 0 | 0 | 0 |
| S2-moderate-T2/Sefa | player r2 card 2 | deepseek/deepseek-v4-pro-0813 | 1 | 9754 | 0 | 0 | 256 | $0.0133 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r2 onward | anthropic/claude-opus-5.5 | 4 | 14 | 192317 | 45987 | 6925 | $0.4070 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r2 onward | anthropic/claude-haiku-5.5 | 2 | 4765 | 0 | 0 | 453 | $0.0007 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r2 | anthropic/claude-sonnet-5.5 | 1 | 3595 | 0 | 0 | 2474 | $0.0319 | 0 | 0 | 0 |
| S2-moderate-T2/Bram | player r3 | openai/gpt-6-astra | 1 | 3 | 8438 | 895 | 111 | $0.0252 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Bram r3 | anthropic/claude-haiku-5.5 | 1 | 1566 | 0 | 0 | 77 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2/Sefa | player r3 | deepseek/deepseek-v4-pro-0813 | 1 | 593 | 9472 | 0 | 418 | $0.0028 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Sefa r3 | anthropic/claude-haiku-5.5 | 1 | 960 | 0 | 0 | 79 | $0.0001 | 0 | 0 | 0 |
| S2-moderate-T2/Pell | player r3 | anthropic/claude-fable-5.1 | 1 | 4 | 12958 | 1390 | 692 | $0.0553 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Pell r3 | anthropic/claude-haiku-5.5 | 1 | 1863 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r3 | anthropic/claude-opus-5.5 | 1 | 4 | 21254 | 36029 | 4603 | $0.2826 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r3 card | anthropic/claude-sonnet-5.5 | 1 | 2653 | 0 | 0 | 1101 | $0.0163 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r3 card (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3727 | 0 | 0 | 1043 | $0.0179 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r3 card (Pell's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 3727 | 0 | 0 | 1053 | $0.0180 | 0 | 0 | 0 |
| S2-moderate-T2/Pell | player r3 card 1 | anthropic/claude-fable-5.1 | 2 | 8 | 30322 | 1791 | 222 | $0.0411 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Pell r3 card | anthropic/claude-haiku-5.5 | 2 | 1807 | 0 | 0 | 118 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r3 onward | anthropic/claude-opus-5.5 | 3 | 10 | 136170 | 47202 | 7334 | $0.4100 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r3 onward | anthropic/claude-haiku-5.5 | 2 | 6035 | 0 | 0 | 507 | $0.0009 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r3 | anthropic/claude-sonnet-5.5 | 1 | 4028 | 0 | 0 | 2818 | $0.0362 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r3 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5241 | 0 | 0 | 1067 | $0.0212 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r3 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5372 | 0 | 0 | 1196 | $0.0227 | 0 | 0 | 0 |
| S2-moderate-T2/Sefa | player r4 | deepseek/deepseek-v4-pro-0813 | 1 | 1074 | 9984 | 0 | 1150 | $0.0054 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Sefa r4 | anthropic/claude-haiku-5.5 | 1 | 1736 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2/Pell | player r4 | anthropic/claude-fable-5.1 | 1 | 4 | 16139 | 469 | 506 | $0.0352 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Pell r4 | anthropic/claude-haiku-5.5 | 1 | 1150 | 0 | 0 | 62 | $0.0001 | 0 | 0 | 0 |
| S2-moderate-T2/Bram | player r4 | openai/gpt-6-astra | 1 | 3 | 9333 | 1038 | 202 | $0.0324 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Bram r4 | anthropic/claude-haiku-5.5 | 1 | 1825 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r4 | anthropic/claude-opus-5.5 | 3 | 12 | 105128 | 85636 | 11085 | $0.6777 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r4 | anthropic/claude-haiku-5.5 | 1 | 3806 | 0 | 0 | 602 | $0.0007 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r4 | anthropic/claude-sonnet-5.5 | 1 | 2891 | 0 | 0 | 3909 | $0.0449 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r4 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4246 | 0 | 0 | 1237 | $0.0209 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r4 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4284 | 0 | 0 | 1256 | $0.0211 | 0 | 0 | 0 |
| S2-moderate-T2/Pell | player r5 | anthropic/claude-fable-5.1 | 1 | 4 | 16608 | 1606 | 599 | $0.0542 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Pell r5 | anthropic/claude-haiku-5.5 | 1 | 2052 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2/Bram | player r5 | openai/gpt-6-astra | 1 | 3 | 10371 | 1098 | 148 | $0.0315 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Bram r5 | anthropic/claude-haiku-5.5 | 1 | 1857 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2/Sefa | player r5 | deepseek/deepseek-v4-pro-0813 | 1 | 1388 | 10752 | 0 | 278 | $0.0036 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Sefa r5 | anthropic/claude-haiku-5.5 | 1 | 1802 | 0 | 0 | 80 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r5 | anthropic/claude-opus-5.5 | 1 | 4 | 25544 | 41559 | 3688 | $0.2928 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r5 card | anthropic/claude-sonnet-5.5 | 1 | 2471 | 0 | 0 | 857 | $0.0135 | 0 | 0 | 0 |
| S2-moderate-T2/Pell | player r5 card 1 | anthropic/claude-fable-5.1 | 4 | 16 | 57884 | 21456 | 186 | $0.2921 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Pell r5 card | anthropic/claude-haiku-5.5 | 4 | 2680 | 0 | 0 | 240 | $0.0004 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r5 onward | anthropic/claude-opus-5.5 | 3 | 10 | 159642 | 47331 | 5990 | $0.3884 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r5 onward | anthropic/claude-haiku-5.5 | 2 | 5476 | 0 | 0 | 641 | $0.0009 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r5 | anthropic/claude-sonnet-5.5 | 1 | 4007 | 0 | 0 | 2470 | $0.0327 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r5 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4959 | 0 | 0 | 809 | $0.0180 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r5 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4924 | 0 | 0 | 770 | $0.0175 | 0 | 0 | 0 |
| S2-moderate-T2/Bram | player r6 | openai/gpt-6-astra | 1 | 3 | 11469 | 703 | 134 | $0.0270 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Bram r6 | anthropic/claude-haiku-5.5 | 1 | 1293 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2/Sefa | player r6 | deepseek/deepseek-v4-pro-0813 | 1 | 831 | 12032 | 0 | 622 | $0.0039 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Sefa r6 | anthropic/claude-haiku-5.5 | 1 | 1371 | 0 | 0 | 81 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2/Pell | player r6 | anthropic/claude-fable-5.1 | 1 | 4 | 20131 | 783 | 809 | $0.0553 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Pell r6 | anthropic/claude-haiku-5.5 | 1 | 1780 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r6 | anthropic/claude-opus-5.5 | 1 | 4 | 27581 | 43539 | 3929 | $0.3091 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r6 card | anthropic/claude-sonnet-5.5 | 2 | 5220 | 0 | 0 | 2172 | $0.0322 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r6 card (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3622 | 0 | 0 | 853 | $0.0158 | 0 | 0 | 0 |
| S2-moderate-T2/Pell | player r6 card 1 | anthropic/claude-fable-5.1 | 2 | 8 | 43493 | 1875 | 377 | $0.0532 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Pell r6 card | anthropic/claude-haiku-5.5 | 2 | 1823 | 0 | 0 | 127 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r6 card (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3845 | 0 | 0 | 1046 | $0.0181 | 0 | 0 | 0 |
| S2-moderate-T2/Bram | player r6 card 1 | openai/gpt-6-astra | 2 | 6 | 25289 | 1113 | 17 | $0.0401 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Bram r6 card | anthropic/claude-haiku-5.5 | 2 | 2037 | 0 | 0 | 116 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r6 onward | anthropic/claude-opus-5.5 | 4 | 14 | 227093 | 53764 | 7695 | $0.4682 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r6 onward | anthropic/claude-haiku-5.5 | 3 | 9396 | 0 | 0 | 1594 | $0.0017 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r6 | anthropic/claude-sonnet-5.5 | 1 | 5213 | 0 | 0 | 1879 | $0.0292 | 0 | 0 | 0 |
| S2-moderate-T2/Sefa | player r7 | deepseek/deepseek-v4-pro-0813 | 1 | 1350 | 12544 | 0 | 534 | $0.0044 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Sefa r7 | anthropic/claude-haiku-5.5 | 1 | 1890 | 0 | 0 | 61 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2/Pell | player r7 | anthropic/claude-fable-5.1 | 1 | 4 | 22789 | 610 | 1307 | $0.0787 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Pell r7 | anthropic/claude-haiku-5.5 | 1 | 1786 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2/Bram | player r7 | openai/gpt-6-astra | 2 | 6 | 26637 | 459 | 217 | $0.0433 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Bram r7 | anthropic/claude-haiku-5.5 | 2 | 1400 | 0 | 0 | 127 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r7 ooc Bram | anthropic/claude-opus-5.5 | 1 | 21973 | 20461 | 11175 | 886 | $0.1991 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r7 | anthropic/claude-opus-5.5 | 3 | 12 | 111600 | 83058 | 9615 | $0.6372 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r7 | anthropic/claude-haiku-5.5 | 1 | 3836 | 0 | 0 | 769 | $0.0008 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r7 | anthropic/claude-sonnet-5.5 | 1 | 3645 | 0 | 0 | 3834 | $0.0456 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r7 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5177 | 0 | 0 | 1408 | $0.0244 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r7 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4847 | 0 | 0 | 1089 | $0.0206 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r7 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5016 | 0 | 0 | 1246 | $0.0225 | 0 | 0 | 0 |
| S2-moderate-T2/Pell | player r8 | anthropic/claude-fable-5.1 | 1 | 4 | 23399 | 1974 | 1445 | $0.1028 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Pell r8 | anthropic/claude-haiku-5.5 | 1 | 2306 | 0 | 0 | 79 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T2/Bram | player r8 | openai/gpt-6-astra | 1 | 3 | 13744 | 992 | 242 | $0.0383 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Bram r8 | anthropic/claude-haiku-5.5 | 1 | 1908 | 0 | 0 | 78 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2/Sefa | player r8 | deepseek/deepseek-v4-pro-0813 | 3 | 5937 | 9216 | 0 | 1247 | $0.0596 | 1 | 0 | 4 |
| S2-moderate-T2/check | check S2-moderate-T2 Sefa r8 | anthropic/claude-haiku-5.5 | 1 | 2105 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r8 | anthropic/claude-opus-5.5 | 1 | 4 | 32429 | 41830 | 5241 | $0.3288 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r8 card | anthropic/claude-sonnet-5.5 | 1 | 2681 | 0 | 0 | 897 | $0.0143 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r8 card (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3629 | 0 | 0 | 882 | $0.0161 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r8 card (Pell's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 3629 | 0 | 0 | 888 | $0.0161 | 0 | 0 | 0 |
| S2-moderate-T2/Pell | player r8 card 1 | anthropic/claude-fable-5.1 | 4 | 16 | 82048 | 27724 | 221 | $0.3783 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Pell r8 card | anthropic/claude-haiku-5.5 | 4 | 2733 | 0 | 0 | 228 | $0.0004 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r8 onward | anthropic/claude-opus-5.5 | 3 | 10 | 159011 | 55547 | 9635 | $0.5023 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r8 onward | anthropic/claude-haiku-5.5 | 2 | 7378 | 0 | 0 | 1002 | $0.0012 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r8 | anthropic/claude-sonnet-5.5 | 1 | 5330 | 0 | 0 | 1325 | $0.0239 | 0 | 0 | 0 |
| S2-moderate-T2/Bram | player r9 | openai/gpt-6-astra | 1 | 3 | 14736 | 290 | 122 | $0.0245 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Bram r9 | anthropic/claude-haiku-5.5 | 1 | 542 | 0 | 0 | 80 | $0.0001 | 0 | 0 | 0 |
| S2-moderate-T2/Sefa | player r9 | deepseek/deepseek-v4-pro-0813 | 1 | 630 | 14848 | 0 | 1296 | $0.0057 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Sefa r9 | anthropic/claude-haiku-5.5 | 1 | 549 | 0 | 0 | 55 | $0.0001 | 0 | 0 | 0 |
| S2-moderate-T2/Pell | player r9 | anthropic/claude-fable-5.1 | 1 | 4 | 27724 | 1288 | 1938 | $0.1200 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Pell r9 | anthropic/claude-haiku-5.5 | 1 | 2335 | 0 | 0 | 91 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r9 | anthropic/claude-opus-5.5 | 5 | 18 | 303886 | 112737 | 12410 | $0.8839 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r9 | anthropic/claude-haiku-5.5 | 2 | 6802 | 0 | 0 | 1203 | $0.0013 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r9 | anthropic/claude-sonnet-5.5 | 1 | 3280 | 0 | 0 | 4125 | $0.0478 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r9 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4715 | 0 | 0 | 1276 | $0.0222 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r9 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 4710 | 0 | 0 | 1276 | $0.0222 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r9 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4872 | 0 | 0 | 1427 | $0.0240 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r9 (Sefa's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 4866 | 0 | 0 | 1441 | $0.0241 | 0 | 0 | 0 |
| S2-moderate-T2/Sefa | player r10 | deepseek/deepseek-v4-pro-0813 | 1 | 1268 | 15360 | 0 | 1607 | $0.0074 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Sefa r10 | anthropic/claude-haiku-5.5 | 1 | 2127 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2/Pell | player r10 | anthropic/claude-fable-5.1 | 1 | 4 | 29012 | 2037 | 1059 | $0.0857 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Pell r10 | anthropic/claude-haiku-5.5 | 1 | 2361 | 0 | 0 | 69 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T2/Bram | player r10 | openai/gpt-6-astra | 1 | 3 | 15026 | 1014 | 179 | $0.0367 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Bram r10 | anthropic/claude-haiku-5.5 | 1 | 1895 | 0 | 0 | 57 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r10 | anthropic/claude-opus-5.5 | 4 | 16 | 210681 | 103252 | 12035 | $0.8067 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r10 | anthropic/claude-haiku-5.5 | 2 | 7500 | 0 | 0 | 904 | $0.0012 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r10 | anthropic/claude-sonnet-5.5 | 1 | 4046 | 0 | 0 | 4078 | $0.0489 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r10 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5669 | 0 | 0 | 1469 | $0.0260 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r10 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5423 | 0 | 0 | 1200 | $0.0228 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r10 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5477 | 0 | 0 | 1268 | $0.0236 | 0 | 0 | 0 |
| S2-moderate-T2/Pell | player r11 | anthropic/claude-fable-5.1 | 1 | 4 | 31049 | 2015 | 1070 | $0.0865 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Pell r11 | anthropic/claude-haiku-5.5 | 1 | 2202 | 0 | 0 | 75 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T2/Bram | player r11 | openai/gpt-6-astra | 1 | 3 | 16040 | 1113 | 133 | $0.0366 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Bram r11 | anthropic/claude-haiku-5.5 | 1 | 1834 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2/Sefa | player r11 | deepseek/deepseek-v4-pro-0813 | 1 | 1556 | 16384 | 0 | 1660 | $0.0080 | 0 | 0 | 2 |
| S2-moderate-T2/check | check S2-moderate-T2 Sefa r11 | anthropic/claude-haiku-5.5 | 1 | 2183 | 0 | 0 | 77 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r11 | anthropic/claude-opus-5.5 | 4 | 16 | 227460 | 110682 | 9338 | $0.7955 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r11 | anthropic/claude-haiku-5.5 | 2 | 7568 | 0 | 0 | 677 | $0.0011 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r11 | anthropic/claude-sonnet-5.5 | 1 | 4184 | 0 | 0 | 4642 | $0.0548 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r11 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5662 | 0 | 0 | 1357 | $0.0249 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r11 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5922 | 0 | 0 | 1603 | $0.0279 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r11 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 5916 | 0 | 0 | 1612 | $0.0280 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r11 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5899 | 0 | 0 | 1579 | $0.0276 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r11 (Sefa's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 5892 | 0 | 0 | 1583 | $0.0276 | 0 | 0 | 0 |
| S2-moderate-T2/Bram | player r12 | openai/gpt-6-astra | 1 | 3 | 17153 | 1293 | 148 | $0.0407 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Bram r12 | anthropic/claude-haiku-5.5 | 1 | 2170 | 0 | 0 | 68 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T2/Sefa | player r12 | deepseek/deepseek-v4-pro-0813 | 1 | 1695 | 17664 | 0 | 924 | $0.0064 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Sefa r12 | anthropic/claude-haiku-5.5 | 1 | 2130 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2/Pell | player r12 | anthropic/claude-fable-5.1 | 1 | 4 | 0 | 35077 | 859 | $0.4815 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Pell r12 | anthropic/claude-haiku-5.5 | 1 | 2349 | 0 | 0 | 81 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r12 | anthropic/claude-opus-5.5 | 3 | 12 | 139113 | 111787 | 10847 | $0.8140 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r12 | anthropic/claude-haiku-5.5 | 1 | 4152 | 0 | 0 | 565 | $0.0007 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r12 | anthropic/claude-sonnet-5.5 | 1 | 3373 | 0 | 0 | 4402 | $0.0508 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r12 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4939 | 0 | 0 | 1437 | $0.0242 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r12 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4864 | 0 | 0 | 1362 | $0.0233 | 0 | 0 | 0 |
| S2-moderate-T2/Sefa | player r13 | deepseek/deepseek-v4-pro-0813 | 1 | 1326 | 19200 | 0 | 789 | $0.0057 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Sefa r13 | anthropic/claude-haiku-5.5 | 1 | 2225 | 0 | 0 | 70 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T2/Pell | player r13 | anthropic/claude-fable-5.1 | 1 | 4 | 35077 | 2006 | 1001 | $0.0839 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Pell r13 | anthropic/claude-haiku-5.5 | 1 | 2478 | 0 | 0 | 76 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T2/Bram | player r13 | openai/gpt-6-astra | 1 | 3 | 18446 | 1154 | 140 | $0.0399 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Bram r13 | anthropic/claude-haiku-5.5 | 1 | 1966 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r13 | anthropic/claude-opus-5.5 | 3 | 12 | 139466 | 108036 | 19148 | $0.9586 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r13 | anthropic/claude-haiku-5.5 | 1 | 5066 | 0 | 0 | 973 | $0.0010 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r13 | anthropic/claude-sonnet-5.5 | 1 | 4145 | 0 | 0 | 3988 | $0.0482 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r13 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5364 | 0 | 0 | 1124 | $0.0220 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r13 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5766 | 0 | 0 | 1472 | $0.0263 | 0 | 0 | 0 |
| S2-moderate-T2/Pell | player r14 | anthropic/claude-fable-5.1 | 1 | 4 | 37083 | 2116 | 1045 | $0.0880 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Pell r14 | anthropic/claude-haiku-5.5 | 1 | 2206 | 0 | 0 | 63 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T2/Bram | player r14 | openai/gpt-6-astra | 1 | 3 | 19600 | 1195 | 233 | $0.0462 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Bram r14 | anthropic/claude-haiku-5.5 | 1 | 2083 | 0 | 0 | 80 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2/Sefa | player r14 | deepseek/deepseek-v4-pro-0813 | 1 | 1416 | 20224 | 0 | 918 | $0.0063 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Sefa r14 | anthropic/claude-haiku-5.5 | 1 | 1864 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r14 | anthropic/claude-opus-5.5 | 4 | 16 | 227909 | 114862 | 14385 | $0.9175 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r14 | anthropic/claude-haiku-5.5 | 2 | 10092 | 0 | 0 | 1328 | $0.0017 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r14 | anthropic/claude-sonnet-5.5 | 1 | 4484 | 0 | 0 | 6714 | $0.0761 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r14 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 6945 | 0 | 0 | 2402 | $0.0379 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r14 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 6966 | 0 | 0 | 2432 | $0.0383 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r14 (Sefa's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 6958 | 0 | 0 | 2434 | $0.0383 | 0 | 0 | 0 |
| S2-moderate-T2/Bram | player r15 | openai/gpt-6-astra | 1 | 3 | 20795 | 1814 | 229 | $0.0549 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Bram r15 | anthropic/claude-haiku-5.5 | 1 | 2954 | 0 | 0 | 79 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T2/Sefa | player r15 | deepseek/deepseek-v4-pro-0813 | 1 | 2108 | 21504 | 0 | 646 | $0.0066 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Sefa r15 | anthropic/claude-haiku-5.5 | 1 | 2939 | 0 | 0 | 65 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T2/Pell | player r15 | anthropic/claude-fable-5.1 | 1 | 4 | 0 | 41514 | 1245 | $0.5812 | 0 | 0 | 0 |
| S2-moderate-T2/check | check S2-moderate-T2 Pell r15 | anthropic/claude-haiku-5.5 | 1 | 2955 | 0 | 0 | 78 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r15 | anthropic/claude-opus-5.5 | 3 | 12 | 153398 | 120111 | 15080 | $0.9438 | 0 | 0 | 0 |
| S2-moderate-T2 | dm r15 | anthropic/claude-haiku-5.5 | 1 | 4917 | 0 | 0 | 921 | $0.0010 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r15 | anthropic/claude-sonnet-5.5 | 1 | 4280 | 0 | 0 | 4840 | $0.0570 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r15 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 6000 | 0 | 0 | 1584 | $0.0278 | 0 | 0 | 0 |
| S2-moderate-T2 | relay r15 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5917 | 0 | 0 | 1505 | $0.0269 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r1 1 | anthropic/claude-haiku-5.5 | 1 | 3665 | 0 | 0 | 965 | $0.0008 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r1 2 | anthropic/claude-haiku-5.5 | 1 | 3665 | 0 | 0 | 1179 | $0.0010 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r1 referee | anthropic/claude-opus-5.5 | 1 | 3665 | 0 | 0 | 625 | $0.0272 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r1 1 | anthropic/claude-haiku-5.5 | 1 | 4062 | 0 | 0 | 338 | $0.0006 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r1 2 | anthropic/claude-haiku-5.5 | 1 | 4062 | 0 | 0 | 341 | $0.0006 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r2 1 | anthropic/claude-haiku-5.5 | 1 | 3823 | 0 | 0 | 1487 | $0.0011 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r2 2 | anthropic/claude-haiku-5.5 | 1 | 3823 | 0 | 0 | 1461 | $0.0011 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r2 referee | anthropic/claude-opus-5.5 | 1 | 3823 | 0 | 0 | 886 | $0.0330 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r2 1 | anthropic/claude-haiku-5.5 | 1 | 4220 | 0 | 0 | 950 | $0.0009 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r2 2 | anthropic/claude-haiku-5.5 | 1 | 4220 | 0 | 0 | 980 | $0.0009 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r3 1 | anthropic/claude-haiku-5.5 | 1 | 4031 | 0 | 0 | 1866 | $0.0013 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r3 2 | anthropic/claude-haiku-5.5 | 1 | 4031 | 0 | 0 | 1836 | $0.0013 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r3 referee | anthropic/claude-opus-5.5 | 1 | 4031 | 0 | 0 | 929 | $0.0347 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r3 1 | anthropic/claude-haiku-5.5 | 1 | 4428 | 0 | 0 | 1136 | $0.0010 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r3 2 | anthropic/claude-haiku-5.5 | 1 | 4428 | 0 | 0 | 1146 | $0.0010 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r4 1 | anthropic/claude-haiku-5.5 | 1 | 3819 | 0 | 0 | 1993 | $0.0014 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r4 2 | anthropic/claude-haiku-5.5 | 1 | 3819 | 0 | 0 | 1735 | $0.0012 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r4 referee | anthropic/claude-opus-5.5 | 1 | 3819 | 0 | 0 | 1018 | $0.0356 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r4 1 | anthropic/claude-haiku-5.5 | 1 | 4216 | 0 | 0 | 1538 | $0.0012 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r4 2 | anthropic/claude-haiku-5.5 | 1 | 4216 | 0 | 0 | 1459 | $0.0012 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r4 referee | anthropic/claude-opus-5.5 | 1 | 4216 | 0 | 0 | 863 | $0.0341 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r5 1 | anthropic/claude-haiku-5.5 | 1 | 4212 | 0 | 0 | 458 | $0.0007 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r5 2 | anthropic/claude-haiku-5.5 | 1 | 4212 | 0 | 0 | 474 | $0.0007 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r5 referee | anthropic/claude-opus-5.5 | 1 | 4212 | 0 | 0 | 1349 | $0.0438 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r5 1 | anthropic/claude-haiku-5.5 | 1 | 4609 | 0 | 0 | 392 | $0.0007 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r5 2 | anthropic/claude-haiku-5.5 | 1 | 4609 | 0 | 0 | 397 | $0.0007 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r6 1 | anthropic/claude-haiku-5.5 | 1 | 4200 | 0 | 0 | 464 | $0.0007 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r6 2 | anthropic/claude-haiku-5.5 | 1 | 4200 | 0 | 0 | 1846 | $0.0013 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r6 referee | anthropic/claude-opus-5.5 | 1 | 4200 | 0 | 0 | 1020 | $0.0372 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r6 1 | anthropic/claude-haiku-5.5 | 1 | 4597 | 0 | 0 | 1061 | $0.0010 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r6 2 | anthropic/claude-haiku-5.5 | 1 | 4597 | 0 | 0 | 1188 | $0.0011 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r6 referee | anthropic/claude-opus-5.5 | 1 | 4597 | 0 | 0 | 762 | $0.0336 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r7 1 | anthropic/claude-haiku-5.5 | 1 | 4573 | 0 | 0 | 1555 | $0.0012 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r7 2 | anthropic/claude-haiku-5.5 | 1 | 4573 | 0 | 0 | 1705 | $0.0013 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r7 referee | anthropic/claude-opus-5.5 | 1 | 4573 | 0 | 0 | 1011 | $0.0385 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r7 1 | anthropic/claude-haiku-5.5 | 1 | 4970 | 0 | 0 | 1065 | $0.0010 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r7 2 | anthropic/claude-haiku-5.5 | 1 | 4970 | 0 | 0 | 408 | $0.0007 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r8 1 | anthropic/claude-haiku-5.5 | 1 | 5491 | 0 | 0 | 2231 | $0.0017 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r8 2 | anthropic/claude-haiku-5.5 | 1 | 5491 | 0 | 0 | 1769 | $0.0014 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r8 referee | anthropic/claude-opus-5.5 | 1 | 5491 | 0 | 0 | 1267 | $0.0473 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r8 1 | anthropic/claude-haiku-5.5 | 1 | 5888 | 0 | 0 | 1510 | $0.0013 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r8 2 | anthropic/claude-haiku-5.5 | 1 | 5888 | 0 | 0 | 365 | $0.0008 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r8 referee | anthropic/claude-opus-5.5 | 1 | 5888 | 0 | 0 | 745 | $0.0385 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r9 1 | anthropic/claude-haiku-5.5 | 1 | 4291 | 0 | 0 | 1751 | $0.0013 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r9 2 | anthropic/claude-haiku-5.5 | 1 | 4291 | 0 | 0 | 1929 | $0.0014 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r9 referee | anthropic/claude-opus-5.5 | 1 | 4291 | 0 | 0 | 1101 | $0.0392 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r9 1 | anthropic/claude-haiku-5.5 | 1 | 4688 | 0 | 0 | 1644 | $0.0013 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r9 2 | anthropic/claude-haiku-5.5 | 1 | 4688 | 0 | 0 | 1337 | $0.0011 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r9 referee | anthropic/claude-opus-5.5 | 1 | 4688 | 0 | 0 | 1369 | $0.0461 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r10 1 | anthropic/claude-haiku-5.5 | 1 | 5050 | 0 | 0 | 2069 | $0.0015 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r10 2 | anthropic/claude-haiku-5.5 | 1 | 5050 | 0 | 0 | 2009 | $0.0015 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r10 referee | anthropic/claude-opus-5.5 | 1 | 5050 | 0 | 0 | 1374 | $0.0477 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r10 1 | anthropic/claude-haiku-5.5 | 1 | 5447 | 0 | 0 | 1443 | $0.0013 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r10 2 | anthropic/claude-haiku-5.5 | 1 | 5447 | 0 | 0 | 1713 | $0.0014 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r10 referee | anthropic/claude-opus-5.5 | 1 | 5447 | 0 | 0 | 1610 | $0.0540 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r11 1 | anthropic/claude-haiku-5.5 | 1 | 5212 | 0 | 0 | 1962 | $0.0015 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r11 2 | anthropic/claude-haiku-5.5 | 1 | 5212 | 0 | 0 | 478 | $0.0008 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r11 referee | anthropic/claude-opus-5.5 | 1 | 5212 | 0 | 0 | 1473 | $0.0503 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r11 1 | anthropic/claude-haiku-5.5 | 1 | 5609 | 0 | 0 | 400 | $0.0008 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r11 2 | anthropic/claude-haiku-5.5 | 1 | 5609 | 0 | 0 | 938 | $0.0010 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r12 1 | anthropic/claude-haiku-5.5 | 1 | 4301 | 0 | 0 | 2100 | $0.0015 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r12 2 | anthropic/claude-haiku-5.5 | 1 | 4301 | 0 | 0 | 2082 | $0.0015 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r12 referee | anthropic/claude-opus-5.5 | 1 | 4301 | 0 | 0 | 1224 | $0.0417 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r12 1 | anthropic/claude-haiku-5.5 | 1 | 4698 | 0 | 0 | 401 | $0.0007 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r12 2 | anthropic/claude-haiku-5.5 | 1 | 4698 | 0 | 0 | 1689 | $0.0013 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r12 referee | anthropic/claude-opus-5.5 | 1 | 4698 | 0 | 0 | 1258 | $0.0440 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r13 1 | anthropic/claude-haiku-5.5 | 1 | 5073 | 0 | 0 | 2104 | $0.0016 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r13 2 | anthropic/claude-haiku-5.5 | 1 | 5073 | 0 | 0 | 1744 | $0.0014 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r13 referee | anthropic/claude-opus-5.5 | 1 | 5073 | 0 | 0 | 1094 | $0.0422 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r13 1 | anthropic/claude-haiku-5.5 | 1 | 5470 | 0 | 0 | 1924 | $0.0015 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r13 2 | anthropic/claude-haiku-5.5 | 1 | 5470 | 0 | 0 | 1839 | $0.0015 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r13 referee | anthropic/claude-opus-5.5 | 1 | 5470 | 0 | 0 | 1424 | $0.0504 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r14 1 | anthropic/claude-haiku-5.5 | 1 | 5412 | 0 | 0 | 1980 | $0.0015 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r14 2 | anthropic/claude-haiku-5.5 | 1 | 5412 | 0 | 0 | 1910 | $0.0015 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r14 referee | anthropic/claude-opus-5.5 | 1 | 5412 | 0 | 0 | 1237 | $0.0464 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r14 1 | anthropic/claude-haiku-5.5 | 1 | 5809 | 0 | 0 | 1382 | $0.0013 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r14 2 | anthropic/claude-haiku-5.5 | 1 | 5809 | 0 | 0 | 1148 | $0.0012 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r14 referee | anthropic/claude-opus-5.5 | 1 | 5809 | 0 | 0 | 1030 | $0.0438 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r15 1 | anthropic/claude-haiku-5.5 | 1 | 5208 | 0 | 0 | 2094 | $0.0016 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r15 2 | anthropic/claude-haiku-5.5 | 1 | 5208 | 0 | 0 | 1875 | $0.0015 | 0 | 0 | 0 |
| S2-moderate-T2/score | round r15 referee | anthropic/claude-opus-5.5 | 1 | 5208 | 0 | 0 | 1049 | $0.0418 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r15 1 | anthropic/claude-haiku-5.5 | 1 | 5605 | 0 | 0 | 1786 | $0.0015 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r15 2 | anthropic/claude-haiku-5.5 | 1 | 5605 | 0 | 0 | 1912 | $0.0015 | 0 | 0 | 0 |
| S2-moderate-T2/score | hold r15 referee | anthropic/claude-opus-5.5 | 1 | 5605 | 0 | 0 | 1276 | $0.0479 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r1 1 | anthropic/claude-haiku-5.5 | 1 | 2259 | 0 | 0 | 146 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r1 2 | anthropic/claude-haiku-5.5 | 1 | 2259 | 0 | 0 | 161 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r2 1 | anthropic/claude-haiku-5.5 | 1 | 2417 | 0 | 0 | 153 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r2 2 | anthropic/claude-haiku-5.5 | 1 | 2417 | 0 | 0 | 67 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r3 1 | anthropic/claude-haiku-5.5 | 1 | 2625 | 0 | 0 | 466 | $0.0005 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r3 2 | anthropic/claude-haiku-5.5 | 1 | 2625 | 0 | 0 | 540 | $0.0005 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r4 1 | anthropic/claude-haiku-5.5 | 1 | 2413 | 0 | 0 | 347 | $0.0004 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r4 2 | anthropic/claude-haiku-5.5 | 1 | 2413 | 0 | 0 | 514 | $0.0005 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r4 3 | anthropic/claude-haiku-5.5 | 1 | 2413 | 0 | 0 | 578 | $0.0005 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r5 1 | anthropic/claude-haiku-5.5 | 1 | 2806 | 0 | 0 | 203 | $0.0004 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r5 2 | anthropic/claude-haiku-5.5 | 1 | 2806 | 0 | 0 | 212 | $0.0004 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r6 1 | anthropic/claude-haiku-5.5 | 1 | 2794 | 0 | 0 | 146 | $0.0004 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r6 2 | anthropic/claude-haiku-5.5 | 1 | 2794 | 0 | 0 | 153 | $0.0004 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r7 1 | anthropic/claude-haiku-5.5 | 1 | 3167 | 0 | 0 | 58 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r7 2 | anthropic/claude-haiku-5.5 | 1 | 3167 | 0 | 0 | 58 | $0.0003 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r8 1 | anthropic/claude-haiku-5.5 | 1 | 4085 | 0 | 0 | 497 | $0.0007 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r8 2 | anthropic/claude-haiku-5.5 | 1 | 4085 | 0 | 0 | 360 | $0.0006 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r9 1 | anthropic/claude-haiku-5.5 | 1 | 2885 | 0 | 0 | 537 | $0.0006 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r9 2 | anthropic/claude-haiku-5.5 | 1 | 2885 | 0 | 0 | 618 | $0.0006 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r9 3 | anthropic/claude-haiku-5.5 | 1 | 2885 | 0 | 0 | 604 | $0.0006 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r10 1 | anthropic/claude-haiku-5.5 | 1 | 3644 | 0 | 0 | 184 | $0.0005 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r10 2 | anthropic/claude-haiku-5.5 | 1 | 3644 | 0 | 0 | 159 | $0.0004 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r11 1 | anthropic/claude-haiku-5.5 | 1 | 3806 | 0 | 0 | 351 | $0.0006 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r11 2 | anthropic/claude-haiku-5.5 | 1 | 3806 | 0 | 0 | 423 | $0.0006 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r12 1 | anthropic/claude-haiku-5.5 | 1 | 2895 | 0 | 0 | 156 | $0.0004 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r12 2 | anthropic/claude-haiku-5.5 | 1 | 2895 | 0 | 0 | 148 | $0.0004 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r13 1 | anthropic/claude-haiku-5.5 | 1 | 3667 | 0 | 0 | 174 | $0.0005 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r13 2 | anthropic/claude-haiku-5.5 | 1 | 3667 | 0 | 0 | 61 | $0.0004 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r14 1 | anthropic/claude-haiku-5.5 | 1 | 4006 | 0 | 0 | 157 | $0.0005 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r14 2 | anthropic/claude-haiku-5.5 | 1 | 4006 | 0 | 0 | 194 | $0.0005 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r15 1 | anthropic/claude-haiku-5.5 | 1 | 3802 | 0 | 0 | 344 | $0.0006 | 0 | 0 | 0 |
| S2-moderate-T2/score | initiative r15 2 | anthropic/claude-haiku-5.5 | 1 | 3802 | 0 | 0 | 237 | $0.0005 | 0 | 0 | 0 |
| S2-high-T1 | relay opening | anthropic/claude-sonnet-5.5 | 2 | 2648 | 0 | 0 | 2791 | $0.0332 | 0 | 0 | 0 |
| S2-high-T1/Sefa | player r1 | deepseek/deepseek-v4-pro-0813 | 2 | 15226 | 0 | 0 | 1154 | $0.0228 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Sefa r1 | anthropic/claude-haiku-5.5 | 2 | 3693 | 0 | 0 | 136 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1/Pell | player r1 | anthropic/claude-opus-5.5 | 2 | 8 | 0 | 21951 | 841 | $0.1266 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Pell r1 | anthropic/claude-haiku-5.5 | 2 | 3692 | 0 | 0 | 146 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1/Bram | player r1 | openai/gpt-6.1-sol | 2 | 6 | 6487 | 8043 | 178 | $0.0225 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Bram r1 | anthropic/claude-haiku-5.5 | 2 | 3243 | 0 | 0 | 124 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1 | dm r1 | anthropic/claude-opus-5.5 | 8 | 32 | 284710 | 128330 | 18845 | $1.0756 | 0 | 0 | 0 |
| S2-high-T1 | dm r1 | anthropic/claude-haiku-5.5 | 4 | 12788 | 0 | 0 | 2130 | $0.0023 | 0 | 0 | 0 |
| S2-high-T1 | relay r1 | anthropic/claude-sonnet-5.5 | 2 | 5201 | 0 | 0 | 7546 | $0.0859 | 0 | 0 | 0 |
| S2-high-T1/Pell | player r2 | anthropic/claude-opus-5.5 | 2 | 8 | 21951 | 3075 | 1172 | $0.0432 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Pell r2 | anthropic/claude-haiku-5.5 | 2 | 3755 | 0 | 0 | 141 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1/Bram | player r2 | openai/gpt-6.1-sol | 2 | 6 | 14530 | 1996 | 173 | $0.0082 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Bram r2 | anthropic/claude-haiku-5.5 | 2 | 3442 | 0 | 0 | 127 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1/Sefa | player r2 | deepseek/deepseek-v4-pro-0813 | 2 | 2378 | 14848 | 0 | 2128 | $0.0101 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Sefa r2 | anthropic/claude-haiku-5.5 | 2 | 3464 | 0 | 0 | 117 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1 | dm r2 | anthropic/claude-opus-5.5 | 6 | 24 | 195260 | 152105 | 16949 | $1.1491 | 0 | 0 | 0 |
| S2-high-T1 | dm r2 | anthropic/claude-haiku-5.5 | 3 | 9654 | 0 | 0 | 1433 | $0.0017 | 0 | 0 | 0 |
| S2-high-T1 | relay r2 | anthropic/claude-sonnet-5.5 | 2 | 5093 | 0 | 0 | 6547 | $0.0757 | 0 | 0 | 0 |
| S2-high-T1 | relay r2 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3892 | 0 | 0 | 1195 | $0.0197 | 0 | 0 | 0 |
| S2-high-T1 | relay r2 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 2 | 7340 | 0 | 0 | 1965 | $0.0343 | 0 | 0 | 0 |
| S2-high-T1 | relay r2 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 2 | 7345 | 0 | 0 | 1975 | $0.0344 | 0 | 0 | 0 |
| S2-high-T1/Bram | player r3 | openai/gpt-6.1-sol | 2 | 6 | 16526 | 1588 | 208 | $0.0077 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Bram r3 | anthropic/claude-haiku-5.5 | 2 | 2956 | 0 | 0 | 133 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1/Sefa | player r3 | deepseek/deepseek-v4-pro-0813 | 2 | 2028 | 16896 | 0 | 1715 | $0.0088 | 0 | 0 | 1 |
| S2-high-T1/check | check S2-high-T1 Sefa r3 | anthropic/claude-haiku-5.5 | 2 | 3035 | 0 | 0 | 149 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1/Pell | player r3 | anthropic/claude-opus-5.5 | 2 | 8 | 25026 | 3061 | 1154 | $0.0434 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Pell r3 | anthropic/claude-haiku-5.5 | 2 | 3860 | 0 | 0 | 149 | $0.0005 | 0 | 0 | 0 |
| S2-high-T1 | dm r3 | anthropic/claude-opus-5.5 | 2 | 8 | 42235 | 66902 | 4854 | $0.4503 | 0 | 0 | 0 |
| S2-high-T1 | relay r3 card | anthropic/claude-sonnet-5.5 | 2 | 4358 | 0 | 0 | 1534 | $0.0241 | 0 | 0 | 0 |
| S2-high-T1 | relay r3 card (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 2 | 5948 | 0 | 0 | 1269 | $0.0246 | 0 | 0 | 0 |
| S2-high-T1/Pell | player r3 card 1 | anthropic/claude-opus-5.5 | 4 | 16 | 58526 | 2718 | 327 | $0.0319 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Pell r3 card | anthropic/claude-haiku-5.5 | 4 | 3136 | 0 | 0 | 237 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1 | dm r3 onward | anthropic/claude-opus-5.5 | 7 | 24 | 324980 | 87157 | 18058 | $0.8620 | 0 | 0 | 0 |
| S2-high-T1 | dm r3 onward | anthropic/claude-haiku-5.5 | 5 | 16344 | 0 | 0 | 2530 | $0.0029 | 0 | 0 | 0 |
| S2-high-T1 | relay r3 | anthropic/claude-sonnet-5.5 | 2 | 7563 | 0 | 0 | 6738 | $0.0825 | 0 | 0 | 0 |
| S2-high-T1/Sefa | player r4 | deepseek/deepseek-v4-pro-0813 | 2 | 2357 | 18688 | 0 | 2949 | $0.0126 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Sefa r4 | anthropic/claude-haiku-5.5 | 2 | 3876 | 0 | 0 | 135 | $0.0005 | 0 | 0 | 0 |
| S2-high-T1/Pell | player r4 | anthropic/claude-opus-5.5 | 2 | 8 | 30805 | 1674 | 1830 | $0.0512 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Pell r4 | anthropic/claude-haiku-5.5 | 2 | 3295 | 0 | 0 | 156 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1/Bram | player r4 | openai/gpt-6.1-sol | 2 | 6 | 18114 | 2111 | 312 | $0.0102 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Bram r4 | anthropic/claude-haiku-5.5 | 2 | 3719 | 0 | 0 | 141 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1 | dm r4 | anthropic/claude-opus-5.5 | 7 | 28 | 268071 | 170647 | 26057 | $1.4417 | 0 | 0 | 0 |
| S2-high-T1 | dm r4 | anthropic/claude-haiku-5.5 | 3 | 10949 | 0 | 0 | 1644 | $0.0019 | 0 | 0 | 0 |
| S2-high-T1 | relay r4 | anthropic/claude-sonnet-5.5 | 2 | 6568 | 0 | 0 | 6916 | $0.0823 | 0 | 0 | 0 |
| S2-high-T1/Pell | player r5 | anthropic/claude-opus-5.5 | 2 | 8 | 32479 | 3276 | 1601 | $0.0549 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Pell r5 | anthropic/claude-haiku-5.5 | 2 | 4100 | 0 | 0 | 130 | $0.0005 | 0 | 0 | 0 |
| S2-high-T1/Bram | player r5 | openai/gpt-6.1-sol | 2 | 6 | 20225 | 1961 | 268 | $0.0096 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Bram r5 | anthropic/claude-haiku-5.5 | 2 | 3368 | 0 | 0 | 123 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1/Sefa | player r5 | deepseek/deepseek-v4-pro-0813 | 2 | 2407 | 20736 | 0 | 2968 | $0.0129 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Sefa r5 | anthropic/claude-haiku-5.5 | 2 | 3376 | 0 | 0 | 123 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1 | dm r5 | anthropic/claude-opus-5.5 | 5 | 20 | 195221 | 128895 | 14874 | $0.9960 | 0 | 0 | 0 |
| S2-high-T1 | dm r5 | anthropic/claude-haiku-5.5 | 2 | 6870 | 0 | 0 | 783 | $0.0011 | 0 | 0 | 0 |
| S2-high-T1 | relay r5 | anthropic/claude-sonnet-5.5 | 2 | 8785 | 0 | 0 | 4633 | $0.0639 | 0 | 0 | 0 |
| S2-high-T1 | relay r5 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4196 | 0 | 0 | 686 | $0.0153 | 0 | 0 | 0 |
| S2-high-T1 | relay r5 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 4213 | 0 | 0 | 687 | $0.0153 | 0 | 0 | 0 |
| S2-high-T1 | relay r5 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4608 | 0 | 0 | 1105 | $0.0203 | 0 | 0 | 0 |
| S2-high-T1/Bram | player r6 | openai/gpt-6.1-sol | 2 | 6 | 22186 | 804 | 357 | $0.0078 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Bram r6 | anthropic/claude-haiku-5.5 | 2 | 1846 | 0 | 0 | 157 | $0.0003 | 0 | 0 | 0 |
| S2-high-T1/Sefa | player r6 | deepseek/deepseek-v4-pro-0813 | 2 | 1593 | 22784 | 0 | 2719 | $0.0114 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Sefa r6 | anthropic/claude-haiku-5.5 | 2 | 2468 | 0 | 0 | 139 | $0.0003 | 0 | 0 | 0 |
| S2-high-T1/Pell | player r6 | anthropic/claude-opus-5.5 | 2 | 8 | 38312 | 3205 | 2031 | $0.0643 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Pell r6 | anthropic/claude-haiku-5.5 | 2 | 4576 | 0 | 0 | 147 | $0.0005 | 0 | 0 | 0 |
| S2-high-T1 | dm r6 | anthropic/claude-opus-5.5 | 4 | 14 | 144524 | 117608 | 16903 | $0.9735 | 0 | 0 | 0 |
| S2-high-T1 | relay r6 card | anthropic/claude-sonnet-5.5 | 1 | 3046 | 0 | 0 | 1410 | $0.0202 | 0 | 0 | 0 |
| S2-high-T1 | relay r6 card (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4471 | 0 | 0 | 1246 | $0.0214 | 0 | 0 | 0 |
| S2-high-T1/Pell | player r6 card 1 | anthropic/claude-opus-5.5 | 4 | 16 | 84523 | 2544 | 302 | $0.0357 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Pell r6 card | anthropic/claude-haiku-5.5 | 4 | 3201 | 0 | 0 | 243 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1 | dm r6 onward | anthropic/claude-opus-5.5 | 3 | 10 | 163281 | 48507 | 7395 | $0.4231 | 0 | 0 | 0 |
| S2-high-T1 | dm r6 onward | anthropic/claude-haiku-5.5 | 2 | 6198 | 0 | 0 | 1032 | $0.0011 | 0 | 0 | 0 |
| S2-high-T1 | relay r6 | anthropic/claude-sonnet-5.5 | 2 | 8271 | 0 | 0 | 8686 | $0.1034 | 0 | 0 | 0 |
| S2-high-T1 | relay r6 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 2 | 10860 | 0 | 0 | 2286 | $0.0446 | 0 | 0 | 0 |
| S2-high-T1 | relay r6 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 2 | 11589 | 0 | 0 | 3010 | $0.0533 | 0 | 0 | 0 |
| S2-high-T1/Sefa | player r7 | deepseek/deepseek-v4-pro-0813 | 2 | 14725 | 12288 | 0 | 7520 | $0.0399 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Sefa r7 | anthropic/claude-haiku-5.5 | 2 | 4755 | 0 | 0 | 144 | $0.0005 | 0 | 0 | 0 |
| S2-high-T1/Pell | player r7 | anthropic/claude-opus-5.5 | 2 | 8 | 44061 | 2759 | 3074 | $0.0841 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Pell r7 | anthropic/claude-haiku-5.5 | 2 | 4385 | 0 | 0 | 134 | $0.0005 | 0 | 0 | 0 |
| S2-high-T1/Bram | player r7 | openai/gpt-6.1-sol | 2 | 6 | 22990 | 1998 | 232 | $0.0096 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Bram r7 | anthropic/claude-haiku-5.5 | 2 | 3391 | 0 | 0 | 149 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1 | dm r7 | anthropic/claude-opus-5.5 | 2 | 8 | 61336 | 76728 | 6839 | $0.5486 | 0 | 0 | 0 |
| S2-high-T1 | relay r7 card | anthropic/claude-sonnet-5.5 | 2 | 5022 | 0 | 0 | 2034 | $0.0304 | 0 | 0 | 0 |
| S2-high-T1 | relay r7 card (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 2 | 7221 | 0 | 0 | 1880 | $0.0332 | 0 | 0 | 0 |
| S2-high-T1 | relay r7 card (Sefa's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 2 | 7187 | 0 | 0 | 1876 | $0.0331 | 0 | 0 | 0 |
| S2-high-T1/Sefa | player r7 card 1 | deepseek/deepseek-v4-pro-0813 | 7 | 19774 | 86784 | 0 | 4784 | $0.0468 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Sefa r7 card | anthropic/claude-haiku-5.5 | 13 | 16188 | 0 | 0 | 872 | $0.0021 | 0 | 0 | 0 |
| S2-high-T1 | dm r7 card prose (with a press) | anthropic/claude-opus-5.5 | 1 | 23373 | 0 | 31472 | 1473 | $0.3747 | 0 | 0 | 0 |
| S2-high-T1 | dm r7 card prose | anthropic/claude-opus-5.5 | 6 | 144068 | 179693 | 15472 | 9983 | $0.9356 | 0 | 0 | 0 |
| S2-high-T1 | dm r7 card prose again | anthropic/claude-opus-5.5 | 1 | 23786 | 31472 | 0 | 2138 | $0.1442 | 0 | 0 | 0 |
| S2-high-T1/Sefa | player r7 card 2 | deepseek/deepseek-v4-pro-0813 | 5 | 3711 | 61696 | 0 | 1772 | $0.0652 | 0 | 0 | 5 |
| S2-high-T1/Sefa | player r7 card 3 | deepseek/deepseek-v4-pro-0813 | 2 | 7986 | 28416 | 0 | 2940 | $0.0209 | 0 | 0 | 0 |
| S2-high-T1/Bram | after 1 | openai/gpt-6.1-sol | 2 | 6 | 34858 | 993 | 401 | $0.0100 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Bram after 1 | anthropic/claude-haiku-5.5 | 2 | 1309 | 0 | 0 | 138 | $0.0002 | 0 | 0 | 0 |
| S2-high-T1/Bram | after 2 | openai/gpt-6.1-sol | 2 | 6 | 35851 | 433 | 236 | $0.0070 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Bram after 2 | anthropic/claude-haiku-5.5 | 2 | 1026 | 0 | 0 | 126 | $0.0002 | 0 | 0 | 0 |
| S2-high-T1/Bram | after 3 | openai/gpt-6.1-sol | 2 | 6 | 36284 | 270 | 173 | $0.0060 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Bram after 3 | anthropic/claude-haiku-5.5 | 2 | 915 | 0 | 0 | 117 | $0.0002 | 0 | 0 | 0 |
| S2-high-T1/Bram | after 4 | openai/gpt-6.1-sol | 2 | 6 | 36554 | 213 | 303 | $0.0072 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Bram after 4 | anthropic/claude-haiku-5.5 | 2 | 1089 | 0 | 0 | 132 | $0.0002 | 0 | 0 | 0 |
| S2-high-T1/Sefa | after 1 | deepseek/deepseek-v4-pro-0813 | 2 | 1848 | 46848 | 0 | 1291 | $0.0104 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Sefa after 1 | anthropic/claude-haiku-5.5 | 2 | 1632 | 0 | 0 | 154 | $0.0002 | 0 | 0 | 0 |
| S2-high-T1/Sefa | after 2 | deepseek/deepseek-v4-pro-0813 | 2 | 3338 | 46080 | 0 | 1350 | $0.0125 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Sefa after 2 | anthropic/claude-haiku-5.5 | 2 | 1170 | 0 | 0 | 163 | $0.0002 | 0 | 0 | 0 |
| S2-high-T1/Sefa | after 3 | deepseek/deepseek-v4-pro-0813 | 2 | 919 | 48896 | 0 | 713 | $0.0079 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Sefa after 3 | anthropic/claude-haiku-5.5 | 2 | 1309 | 0 | 0 | 131 | $0.0002 | 0 | 0 | 0 |
| S2-high-T1/Pell | after 1 | anthropic/claude-opus-5.5 | 2 | 8 | 0 | 67661 | 1995 | $0.3782 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Pell after 1 | anthropic/claude-haiku-5.5 | 2 | 2079 | 0 | 0 | 157 | $0.0003 | 0 | 0 | 0 |
| S2-high-T1/Pell | after 2 | anthropic/claude-opus-5.5 | 2 | 8 | 67661 | 1469 | 1850 | $0.0579 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Pell after 2 | anthropic/claude-haiku-5.5 | 2 | 1997 | 0 | 0 | 138 | $0.0003 | 0 | 0 | 0 |
| S2-high-T1/Pell | after 3 | anthropic/claude-opus-5.5 | 2 | 8 | 69130 | 1361 | 1772 | $0.0561 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Pell after 3 | anthropic/claude-haiku-5.5 | 2 | 1912 | 0 | 0 | 139 | $0.0003 | 0 | 0 | 0 |
| S2-high-T1 | relay r1 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4260 | 0 | 0 | 1357 | $0.0221 | 0 | 0 | 0 |
| S2-high-T1 | relay r1 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4290 | 0 | 0 | 1383 | $0.0224 | 0 | 0 | 0 |
| S2-high-T1 | relay r1 (Pell's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 4291 | 0 | 0 | 1384 | $0.0224 | 0 | 0 | 0 |
| S2-high-T1 | relay r1 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4340 | 0 | 0 | 1430 | $0.0230 | 0 | 0 | 0 |
| S2-high-T1 | relay r1 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 4332 | 0 | 0 | 1443 | $0.0231 | 0 | 0 | 0 |
| S2-high-T1 | relay r4 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4749 | 0 | 0 | 1100 | $0.0205 | 0 | 0 | 0 |
| S2-high-T1 | relay r5 card | anthropic/claude-sonnet-5.5 | 1 | 3158 | 0 | 0 | 1134 | $0.0177 | 0 | 0 | 0 |
| S2-high-T1 | relay r5 card (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4328 | 0 | 0 | 1009 | $0.0187 | 0 | 0 | 0 |
| S2-high-T1 | relay r5 card (Pell's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 4319 | 0 | 0 | 1012 | $0.0188 | 0 | 0 | 0 |
| S2-high-T1/Pell | player r5 card 1 | anthropic/claude-opus-5.5 | 5 | 20 | 99477 | 2557 | 1002 | $0.0528 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Pell r5 card | anthropic/claude-haiku-5.5 | 5 | 3526 | 0 | 0 | 300 | $0.0005 | 0 | 0 | 0 |
| S2-high-T1 | dm r5 onward | anthropic/claude-opus-5.5 | 4 | 14 | 220074 | 56365 | 10007 | $0.5260 | 0 | 0 | 0 |
| S2-high-T1 | dm r5 onward | anthropic/claude-haiku-5.5 | 3 | 13870 | 0 | 0 | 1394 | $0.0021 | 0 | 0 | 0 |
| S2-high-T1 | dm r6 | anthropic/claude-haiku-5.5 | 1 | 3976 | 0 | 0 | 822 | $0.0008 | 0 | 0 | 0 |
| S2-high-T1 | relay r6 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5060 | 0 | 0 | 1461 | $0.0247 | 0 | 0 | 0 |
| S2-high-T1 | dm r7 onward | anthropic/claude-opus-5.5 | 5 | 18 | 294166 | 55784 | 11789 | $0.5736 | 0 | 0 | 0 |
| S2-high-T1 | dm r7 onward | anthropic/claude-haiku-5.5 | 3 | 12195 | 0 | 0 | 1782 | $0.0021 | 0 | 0 | 0 |
| S2-high-T1 | relay r7 | anthropic/claude-sonnet-5.5 | 1 | 5350 | 0 | 0 | 4542 | $0.0561 | 0 | 0 | 0 |
| S2-high-T1 | relay r7 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 7028 | 0 | 0 | 1521 | $0.0293 | 0 | 0 | 0 |
| S2-high-T1 | relay r7 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 6910 | 0 | 0 | 1366 | $0.0275 | 0 | 0 | 0 |
| S2-high-T1 | relay r7 (Pell's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 6873 | 0 | 0 | 1369 | $0.0274 | 0 | 0 | 0 |
| S2-high-T1 | relay r7 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 7086 | 0 | 0 | 2154 | $0.0357 | 0 | 0 | 0 |
| S2-high-T1/Pell | player r8 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 26417 | 935 | $0.1508 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Pell r8 | anthropic/claude-haiku-5.5 | 1 | 2364 | 0 | 0 | 74 | $0.0003 | 0 | 0 | 0 |
| S2-high-T1/Bram | player r8 | openai/gpt-6.1-sol | 1 | 3 | 12673 | 1266 | 137 | $0.0058 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Bram r8 | anthropic/claude-haiku-5.5 | 1 | 2090 | 0 | 0 | 74 | $0.0002 | 0 | 0 | 0 |
| S2-high-T1/Sefa | player r8 | deepseek/deepseek-v4-pro-0813 | 1 | 1420 | 18432 | 0 | 1902 | $0.0086 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Sefa r8 | anthropic/claude-haiku-5.5 | 1 | 2355 | 0 | 0 | 74 | $0.0003 | 0 | 0 | 0 |
| S2-high-T1 | dm r8 | anthropic/claude-opus-5.5 | 4 | 16 | 198376 | 108209 | 19861 | $0.9888 | 0 | 0 | 0 |
| S2-high-T1 | dm r8 | anthropic/claude-haiku-5.5 | 2 | 7847 | 0 | 0 | 794 | $0.0012 | 0 | 0 | 0 |
| S2-high-T1 | relay r8 | anthropic/claude-sonnet-5.5 | 1 | 3915 | 0 | 0 | 5097 | $0.0588 | 0 | 0 | 0 |
| S2-high-T1 | relay r8 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5601 | 0 | 0 | 1590 | $0.0271 | 0 | 0 | 0 |
| S2-high-T1 | relay r8 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5752 | 0 | 0 | 1697 | $0.0285 | 0 | 0 | 0 |
| S2-high-T1 | relay r8 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 5709 | 0 | 0 | 1697 | $0.0284 | 0 | 0 | 0 |
| S2-high-T1 | relay r8 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5714 | 0 | 0 | 1686 | $0.0283 | 0 | 0 | 0 |
| S2-high-T1 | relay r8 (Sefa's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 5697 | 0 | 0 | 1688 | $0.0283 | 0 | 0 | 0 |
| S2-high-T1/Bram | player r9 | openai/gpt-6.1-sol | 1 | 3 | 13939 | 1330 | 144 | $0.0062 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Bram r9 | anthropic/claude-haiku-5.5 | 1 | 2233 | 0 | 0 | 77 | $0.0003 | 0 | 0 | 0 |
| S2-high-T1/Sefa | player r9 | deepseek/deepseek-v4-pro-0813 | 1 | 1648 | 19712 | 0 | 497 | $0.0054 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Sefa r9 | anthropic/claude-haiku-5.5 | 1 | 1973 | 0 | 0 | 43 | $0.0002 | 0 | 0 | 0 |
| S2-high-T1/Pell | player r9 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 28610 | 1221 | $0.1675 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Pell r9 | anthropic/claude-haiku-5.5 | 1 | 2568 | 0 | 0 | 77 | $0.0003 | 0 | 0 | 0 |
| S2-high-T1 | dm r9 | anthropic/claude-opus-5.5 | 3 | 12 | 130384 | 110389 | 18466 | $0.9569 | 0 | 0 | 0 |
| S2-high-T1 | dm r9 | anthropic/claude-haiku-5.5 | 1 | 5205 | 0 | 0 | 555 | $0.0008 | 0 | 0 | 0 |
| S2-high-T1 | relay r9 | anthropic/claude-sonnet-5.5 | 1 | 3899 | 0 | 0 | 5157 | $0.0594 | 0 | 0 | 0 |
| S2-high-T1 | relay r9 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5754 | 0 | 0 | 1730 | $0.0288 | 0 | 0 | 0 |
| S2-high-T1/Sefa | player r10 | deepseek/deepseek-v4-pro-0813 | 1 | 1320 | 21248 | 0 | 630 | $0.0055 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Sefa r10 | anthropic/claude-haiku-5.5 | 1 | 2491 | 0 | 0 | 66 | $0.0003 | 0 | 0 | 0 |
| S2-high-T1/Pell | player r10 | anthropic/claude-opus-5.5 | 1 | 4 | 28610 | 2319 | 936 | $0.0361 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Pell r10 | anthropic/claude-haiku-5.5 | 1 | 2480 | 0 | 0 | 66 | $0.0003 | 0 | 0 | 0 |
| S2-high-T1/Bram | player r10 | openai/gpt-6.1-sol | 1 | 3 | 15269 | 1293 | 163 | $0.0064 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Bram r10 | anthropic/claude-haiku-5.5 | 1 | 2193 | 0 | 0 | 80 | $0.0003 | 0 | 0 | 0 |
| S2-high-T1 | dm r10 | anthropic/claude-opus-5.5 | 3 | 12 | 131983 | 104552 | 12390 | $0.8061 | 0 | 0 | 0 |
| S2-high-T1 | dm r10 | anthropic/claude-haiku-5.5 | 1 | 4527 | 0 | 0 | 891 | $0.0009 | 0 | 0 | 0 |
| S2-high-T1 | relay r10 | anthropic/claude-sonnet-5.5 | 1 | 3874 | 0 | 0 | 3715 | $0.0449 | 0 | 0 | 0 |
| S2-high-T1 | relay r10 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5223 | 0 | 0 | 1229 | $0.0227 | 0 | 0 | 0 |
| S2-high-T1 | relay r10 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5156 | 0 | 0 | 1127 | $0.0216 | 0 | 0 | 0 |
| S2-high-T1/Pell | player r11 | anthropic/claude-opus-5.5 | 1 | 4 | 30929 | 1787 | 734 | $0.0298 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Pell r11 | anthropic/claude-haiku-5.5 | 1 | 2169 | 0 | 0 | 61 | $0.0002 | 0 | 0 | 0 |
| S2-high-T1/Bram | player r11 | openai/gpt-6.1-sol | 1 | 3 | 16562 | 979 | 95 | $0.0051 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Bram r11 | anthropic/claude-haiku-5.5 | 1 | 1619 | 0 | 0 | 82 | $0.0002 | 0 | 0 | 0 |
| S2-high-T1/Sefa | player r11 | deepseek/deepseek-v4-pro-0813 | 1 | 1510 | 22272 | 0 | 3689 | $0.0138 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Sefa r11 | anthropic/claude-haiku-5.5 | 1 | 1973 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| S2-high-T1 | dm r11 | anthropic/claude-opus-5.5 | 3 | 12 | 141282 | 115016 | 10660 | $0.8256 | 0 | 0 | 0 |
| S2-high-T1 | dm r11 | anthropic/claude-haiku-5.5 | 1 | 4644 | 0 | 0 | 300 | $0.0006 | 0 | 0 | 0 |
| S2-high-T1 | relay r11 | anthropic/claude-sonnet-5.5 | 1 | 4023 | 0 | 0 | 4624 | $0.0543 | 0 | 0 | 0 |
| S2-high-T1 | relay r11 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5711 | 0 | 0 | 1527 | $0.0267 | 0 | 0 | 0 |
| S2-high-T1/Bram | player r12 | openai/gpt-6.1-sol | 1 | 3 | 17541 | 1204 | 125 | $0.0060 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Bram r12 | anthropic/claude-haiku-5.5 | 1 | 2052 | 0 | 0 | 86 | $0.0002 | 0 | 0 | 0 |
| S2-high-T1/Sefa | player r12 | deepseek/deepseek-v4-pro-0813 | 1 | 1631 | 23552 | 0 | 958 | $0.0070 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Sefa r12 | anthropic/claude-haiku-5.5 | 1 | 2204 | 0 | 0 | 69 | $0.0003 | 0 | 0 | 0 |
| S2-high-T1/Pell | player r12 | anthropic/claude-opus-5.5 | 1 | 4 | 32716 | 2059 | 979 | $0.0364 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Pell r12 | anthropic/claude-haiku-5.5 | 1 | 2458 | 0 | 0 | 90 | $0.0003 | 0 | 0 | 0 |
| S2-high-T1 | dm r12 | anthropic/claude-opus-5.5 | 5 | 20 | 321179 | 119028 | 14836 | $0.9657 | 0 | 0 | 0 |
| S2-high-T1 | dm r12 | anthropic/claude-haiku-5.5 | 3 | 13446 | 0 | 0 | 1903 | $0.0023 | 0 | 0 | 0 |
| S2-high-T1 | relay r12 | anthropic/claude-sonnet-5.5 | 1 | 4268 | 0 | 0 | 4860 | $0.0571 | 0 | 0 | 0 |
| S2-high-T1 | relay r12 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5981 | 0 | 0 | 1592 | $0.0279 | 0 | 0 | 0 |
| S2-high-T1/Sefa | player r13 | deepseek/deepseek-v4-pro-0813 | 1 | 1483 | 25088 | 0 | 937 | $0.0069 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Sefa r13 | anthropic/claude-haiku-5.5 | 1 | 2400 | 0 | 0 | 65 | $0.0003 | 0 | 0 | 0 |
| S2-high-T1/Pell | player r13 | anthropic/claude-opus-5.5 | 1 | 4 | 34775 | 2283 | 746 | $0.0333 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Pell r13 | anthropic/claude-haiku-5.5 | 1 | 2511 | 0 | 0 | 68 | $0.0003 | 0 | 0 | 0 |
| S2-high-T1/Bram | player r13 | openai/gpt-6.1-sol | 1 | 3 | 18745 | 1214 | 161 | $0.0065 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Bram r13 | anthropic/claude-haiku-5.5 | 1 | 2099 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| S2-high-T1 | dm r13 | anthropic/claude-opus-5.5 | 5 | 20 | 333278 | 119219 | 9930 | $0.8720 | 0 | 0 | 0 |
| S2-high-T1 | dm r13 | anthropic/claude-haiku-5.5 | 3 | 11689 | 0 | 0 | 2227 | $0.0023 | 0 | 0 | 0 |
| S2-high-T1 | relay r13 | anthropic/claude-sonnet-5.5 | 1 | 4283 | 0 | 0 | 5457 | $0.0631 | 0 | 0 | 0 |
| S2-high-T1 | relay r13 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 6112 | 0 | 0 | 1717 | $0.0294 | 0 | 0 | 0 |
| S2-high-T1 | relay r13 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 6235 | 0 | 0 | 1811 | $0.0306 | 0 | 0 | 0 |
| S2-high-T1 | relay r13 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 6205 | 0 | 0 | 1808 | $0.0305 | 0 | 0 | 0 |
| S2-high-T1/Pell | player r14 | anthropic/claude-opus-5.5 | 1 | 4 | 37058 | 2364 | 1306 | $0.0454 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Pell r14 | anthropic/claude-haiku-5.5 | 1 | 2842 | 0 | 0 | 65 | $0.0003 | 0 | 0 | 0 |
| S2-high-T1/Bram | player r14 | openai/gpt-6.1-sol | 1 | 3 | 19959 | 1415 | 150 | $0.0070 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Bram r14 | anthropic/claude-haiku-5.5 | 1 | 2308 | 0 | 0 | 65 | $0.0003 | 0 | 0 | 0 |
| S2-high-T1/Sefa | player r14 | deepseek/deepseek-v4-pro-0813 | 1 | 1787 | 26368 | 0 | 2083 | $0.0104 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Sefa r14 | anthropic/claude-haiku-5.5 | 1 | 2812 | 0 | 0 | 82 | $0.0003 | 0 | 0 | 0 |
| S2-high-T1 | dm r14 | anthropic/claude-opus-5.5 | 4 | 16 | 264157 | 127001 | 12848 | $0.9553 | 0 | 0 | 0 |
| S2-high-T1 | dm r14 | anthropic/claude-haiku-5.5 | 2 | 7972 | 0 | 0 | 1059 | $0.0013 | 0 | 0 | 0 |
| S2-high-T1 | relay r14 | anthropic/claude-sonnet-5.5 | 1 | 4563 | 0 | 0 | 4130 | $0.0504 | 0 | 0 | 0 |
| S2-high-T1 | relay r14 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5944 | 0 | 0 | 1243 | $0.0243 | 0 | 0 | 0 |
| S2-high-T1 | relay r14 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 6089 | 0 | 0 | 1387 | $0.0260 | 0 | 0 | 0 |
| S2-high-T1 | relay r14 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 6091 | 0 | 0 | 1402 | $0.0262 | 0 | 0 | 0 |
| S2-high-T1 | relay r14 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 6082 | 0 | 0 | 1384 | $0.0260 | 0 | 0 | 0 |
| S2-high-T1 | relay r14 (Sefa's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 6100 | 0 | 0 | 1383 | $0.0260 | 0 | 0 | 0 |
| S2-high-T1/Bram | player r15 | openai/gpt-6.1-sol | 1 | 3 | 21374 | 1169 | 140 | $0.0065 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Bram r15 | anthropic/claude-haiku-5.5 | 1 | 1957 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| S2-high-T1/Sefa | player r15 | deepseek/deepseek-v4-pro-0813 | 1 | 1841 | 27904 | 0 | 1821 | $0.0099 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Sefa r15 | anthropic/claude-haiku-5.5 | 1 | 2395 | 0 | 0 | 81 | $0.0003 | 0 | 0 | 0 |
| S2-high-T1/Pell | player r15 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 41435 | 1263 | $0.2325 | 0 | 0 | 0 |
| S2-high-T1/check | check S2-high-T1 Pell r15 | anthropic/claude-haiku-5.5 | 1 | 2376 | 0 | 0 | 57 | $0.0003 | 0 | 0 | 0 |
| S2-high-T1 | dm r15 | anthropic/claude-opus-5.5 | 4 | 16 | 275646 | 140349 | 22029 | $1.2090 | 0 | 0 | 0 |
| S2-high-T1 | dm r15 | anthropic/claude-haiku-5.5 | 2 | 9901 | 0 | 0 | 953 | $0.0015 | 0 | 0 | 0 |
| S2-high-T1 | relay r15 | anthropic/claude-sonnet-5.5 | 1 | 5437 | 0 | 0 | 3899 | $0.0499 | 0 | 0 | 0 |
| S2-high-T1 | relay r15 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 6570 | 0 | 0 | 977 | $0.0229 | 0 | 0 | 0 |
| S2-high-T1/score | round r1 1 | anthropic/claude-haiku-5.5 | 1 | 3731 | 0 | 0 | 1121 | $0.0009 | 0 | 0 | 0 |
| S2-high-T1/score | round r1 2 | anthropic/claude-haiku-5.5 | 1 | 3731 | 0 | 0 | 1187 | $0.0010 | 0 | 0 | 0 |
| S2-high-T1/score | round r1 referee | anthropic/claude-opus-5.5 | 1 | 3731 | 0 | 0 | 614 | $0.0272 | 0 | 0 | 0 |
| S2-high-T1/score | hold r1 1 | anthropic/claude-haiku-5.5 | 1 | 4086 | 0 | 0 | 329 | $0.0006 | 0 | 0 | 0 |
| S2-high-T1/score | hold r1 2 | anthropic/claude-haiku-5.5 | 1 | 4086 | 0 | 0 | 326 | $0.0006 | 0 | 0 | 0 |
| S2-high-T1/score | round r2 1 | anthropic/claude-haiku-5.5 | 1 | 3463 | 0 | 0 | 1562 | $0.0011 | 0 | 0 | 0 |
| S2-high-T1/score | round r2 2 | anthropic/claude-haiku-5.5 | 1 | 3463 | 0 | 0 | 2070 | $0.0014 | 0 | 0 | 0 |
| S2-high-T1/score | round r2 referee | anthropic/claude-opus-5.5 | 1 | 3463 | 0 | 0 | 1076 | $0.0354 | 0 | 0 | 0 |
| S2-high-T1/score | hold r2 1 | anthropic/claude-haiku-5.5 | 1 | 3818 | 0 | 0 | 1328 | $0.0010 | 0 | 0 | 0 |
| S2-high-T1/score | hold r2 2 | anthropic/claude-haiku-5.5 | 1 | 3818 | 0 | 0 | 1200 | $0.0010 | 0 | 0 | 0 |
| S2-high-T1/score | round r3 1 | anthropic/claude-haiku-5.5 | 1 | 4204 | 0 | 0 | 1730 | $0.0013 | 0 | 0 | 0 |
| S2-high-T1/score | round r3 2 | anthropic/claude-haiku-5.5 | 1 | 4204 | 0 | 0 | 1776 | $0.0013 | 0 | 0 | 0 |
| S2-high-T1/score | round r3 referee | anthropic/claude-opus-5.5 | 1 | 4204 | 0 | 0 | 1003 | $0.0369 | 0 | 0 | 0 |
| S2-high-T1/score | hold r3 1 | anthropic/claude-haiku-5.5 | 1 | 4559 | 0 | 0 | 866 | $0.0009 | 0 | 0 | 0 |
| S2-high-T1/score | hold r3 2 | anthropic/claude-haiku-5.5 | 1 | 4559 | 0 | 0 | 963 | $0.0009 | 0 | 0 | 0 |
| S2-high-T1/score | round r4 1 | anthropic/claude-haiku-5.5 | 1 | 4559 | 0 | 0 | 1653 | $0.0013 | 0 | 0 | 0 |
| S2-high-T1/score | round r4 2 | anthropic/claude-haiku-5.5 | 1 | 4559 | 0 | 0 | 1522 | $0.0012 | 0 | 0 | 0 |
| S2-high-T1/score | round r4 referee | anthropic/claude-opus-5.5 | 1 | 4559 | 0 | 0 | 1064 | $0.0395 | 0 | 0 | 0 |
| S2-high-T1/score | hold r4 1 | anthropic/claude-haiku-5.5 | 1 | 4914 | 0 | 0 | 1306 | $0.0011 | 0 | 0 | 0 |
| S2-high-T1/score | hold r4 2 | anthropic/claude-haiku-5.5 | 1 | 4914 | 0 | 0 | 1627 | $0.0013 | 0 | 0 | 0 |
| S2-high-T1/score | hold r4 referee | anthropic/claude-opus-5.5 | 1 | 4914 | 0 | 0 | 1111 | $0.0419 | 0 | 0 | 0 |
| S2-high-T1/score | round r5 1 | anthropic/claude-haiku-5.5 | 1 | 5325 | 0 | 0 | 492 | $0.0008 | 0 | 0 | 0 |
| S2-high-T1/score | round r5 2 | anthropic/claude-haiku-5.5 | 1 | 5325 | 0 | 0 | 1712 | $0.0014 | 0 | 0 | 0 |
| S2-high-T1/score | round r5 referee | anthropic/claude-opus-5.5 | 1 | 5325 | 0 | 0 | 939 | $0.0401 | 0 | 0 | 0 |
| S2-high-T1/score | hold r5 1 | anthropic/claude-haiku-5.5 | 1 | 5680 | 0 | 0 | 1216 | $0.0012 | 0 | 0 | 0 |
| S2-high-T1/score | hold r5 2 | anthropic/claude-haiku-5.5 | 1 | 5680 | 0 | 0 | 1154 | $0.0011 | 0 | 0 | 0 |
| S2-high-T1/score | hold r5 referee | anthropic/claude-opus-5.5 | 1 | 5680 | 0 | 0 | 1045 | $0.0436 | 0 | 0 | 0 |
| S2-high-T1/score | round r6 1 | anthropic/claude-haiku-5.5 | 1 | 4415 | 0 | 0 | 1512 | $0.0012 | 0 | 0 | 0 |
| S2-high-T1/score | round r6 2 | anthropic/claude-haiku-5.5 | 1 | 4415 | 0 | 0 | 1916 | $0.0014 | 0 | 0 | 0 |
| S2-high-T1/score | round r6 referee | anthropic/claude-opus-5.5 | 1 | 4415 | 0 | 0 | 1094 | $0.0395 | 0 | 0 | 0 |
| S2-high-T1/score | hold r6 1 | anthropic/claude-haiku-5.5 | 1 | 4770 | 0 | 0 | 1189 | $0.0011 | 0 | 0 | 0 |
| S2-high-T1/score | hold r6 2 | anthropic/claude-haiku-5.5 | 1 | 4770 | 0 | 0 | 1400 | $0.0012 | 0 | 0 | 0 |
| S2-high-T1/score | hold r6 referee | anthropic/claude-opus-5.5 | 1 | 4770 | 0 | 0 | 837 | $0.0358 | 0 | 0 | 0 |
| S2-high-T1/score | round r7 1 | anthropic/claude-haiku-5.5 | 1 | 5386 | 0 | 0 | 1621 | $0.0013 | 0 | 0 | 0 |
| S2-high-T1/score | round r7 2 | anthropic/claude-haiku-5.5 | 1 | 5386 | 0 | 0 | 1970 | $0.0015 | 0 | 0 | 0 |
| S2-high-T1/score | hold r7 1 | anthropic/claude-haiku-5.5 | 1 | 5741 | 0 | 0 | 332 | $0.0007 | 0 | 0 | 0 |
| S2-high-T1/score | hold r7 2 | anthropic/claude-haiku-5.5 | 1 | 5741 | 0 | 0 | 344 | $0.0007 | 0 | 0 | 0 |
| S2-high-T1/score | round r8 1 | anthropic/claude-haiku-5.5 | 1 | 4946 | 0 | 0 | 1625 | $0.0013 | 0 | 0 | 0 |
| S2-high-T1/score | round r8 2 | anthropic/claude-haiku-5.5 | 1 | 4946 | 0 | 0 | 1744 | $0.0014 | 0 | 0 | 0 |
| S2-high-T1/score | round r8 referee | anthropic/claude-opus-5.5 | 1 | 4946 | 0 | 0 | 1393 | $0.0476 | 0 | 0 | 0 |
| S2-high-T1/score | hold r8 1 | anthropic/claude-haiku-5.5 | 1 | 5301 | 0 | 0 | 1457 | $0.0013 | 0 | 0 | 0 |
| S2-high-T1/score | hold r8 2 | anthropic/claude-haiku-5.5 | 1 | 5301 | 0 | 0 | 1632 | $0.0013 | 0 | 0 | 0 |
| S2-high-T1/score | hold r8 referee | anthropic/claude-opus-5.5 | 1 | 5301 | 0 | 0 | 1009 | $0.0414 | 0 | 0 | 0 |
| S2-high-T1/score | round r9 1 | anthropic/claude-haiku-5.5 | 1 | 4822 | 0 | 0 | 482 | $0.0007 | 0 | 0 | 0 |
| S2-high-T1/score | round r9 2 | anthropic/claude-haiku-5.5 | 1 | 4822 | 0 | 0 | 493 | $0.0007 | 0 | 0 | 0 |
| S2-high-T1/score | round r9 referee | anthropic/claude-opus-5.5 | 1 | 4822 | 0 | 0 | 970 | $0.0387 | 0 | 0 | 0 |
| S2-high-T1/score | hold r9 1 | anthropic/claude-haiku-5.5 | 1 | 5177 | 0 | 0 | 344 | $0.0007 | 0 | 0 | 0 |
| S2-high-T1/score | hold r9 2 | anthropic/claude-haiku-5.5 | 1 | 5177 | 0 | 0 | 348 | $0.0007 | 0 | 0 | 0 |
| S2-high-T1/score | round r10 1 | anthropic/claude-haiku-5.5 | 1 | 4802 | 0 | 0 | 1933 | $0.0014 | 0 | 0 | 0 |
| S2-high-T1/score | round r10 2 | anthropic/claude-haiku-5.5 | 1 | 4802 | 0 | 0 | 2294 | $0.0016 | 0 | 0 | 0 |
| S2-high-T1/score | round r10 referee | anthropic/claude-opus-5.5 | 1 | 4802 | 0 | 0 | 1204 | $0.0433 | 0 | 0 | 0 |
| S2-high-T1/score | hold r10 1 | anthropic/claude-haiku-5.5 | 1 | 5157 | 0 | 0 | 1527 | $0.0013 | 0 | 0 | 0 |
| S2-high-T1/score | hold r10 2 | anthropic/claude-haiku-5.5 | 1 | 5157 | 0 | 0 | 1366 | $0.0012 | 0 | 0 | 0 |
| S2-high-T1/score | hold r10 referee | anthropic/claude-opus-5.5 | 1 | 5157 | 0 | 0 | 912 | $0.0389 | 0 | 0 | 0 |
| S2-high-T1/score | round r11 1 | anthropic/claude-haiku-5.5 | 1 | 4951 | 0 | 0 | 1780 | $0.0014 | 0 | 0 | 0 |
| S2-high-T1/score | round r11 2 | anthropic/claude-haiku-5.5 | 1 | 4951 | 0 | 0 | 2294 | $0.0016 | 0 | 0 | 0 |
| S2-high-T1/score | round r11 referee | anthropic/claude-opus-5.5 | 1 | 4951 | 0 | 0 | 1448 | $0.0488 | 0 | 0 | 0 |
| S2-high-T1/score | hold r11 1 | anthropic/claude-haiku-5.5 | 1 | 5306 | 0 | 0 | 401 | $0.0007 | 0 | 0 | 0 |
| S2-high-T1/score | hold r11 2 | anthropic/claude-haiku-5.5 | 1 | 5306 | 0 | 0 | 337 | $0.0007 | 0 | 0 | 0 |
| S2-high-T1/score | hold r11 referee | anthropic/claude-opus-5.5 | 1 | 5306 | 0 | 0 | 1158 | $0.0444 | 0 | 0 | 0 |
| S2-high-T1/score | round r12 1 | anthropic/claude-haiku-5.5 | 1 | 5302 | 0 | 0 | 1897 | $0.0015 | 0 | 0 | 0 |
| S2-high-T1/score | round r12 2 | anthropic/claude-haiku-5.5 | 1 | 5302 | 0 | 0 | 2668 | $0.0019 | 0 | 0 | 0 |
| S2-high-T1/score | round r12 referee | anthropic/claude-opus-5.5 | 1 | 5302 | 0 | 0 | 1236 | $0.0459 | 0 | 0 | 0 |
| S2-high-T1/score | hold r12 1 | anthropic/claude-haiku-5.5 | 1 | 5657 | 0 | 0 | 974 | $0.0011 | 0 | 0 | 0 |
| S2-high-T1/score | hold r12 2 | anthropic/claude-haiku-5.5 | 1 | 5657 | 0 | 0 | 1176 | $0.0012 | 0 | 0 | 0 |
| S2-high-T1/score | hold r12 referee | anthropic/claude-opus-5.5 | 1 | 5657 | 0 | 0 | 929 | $0.0412 | 0 | 0 | 0 |
| S2-high-T1/score | round r13 1 | anthropic/claude-haiku-5.5 | 1 | 5269 | 0 | 0 | 1302 | $0.0012 | 0 | 0 | 0 |
| S2-high-T1/score | round r13 2 | anthropic/claude-haiku-5.5 | 1 | 5269 | 0 | 0 | 1297 | $0.0012 | 0 | 0 | 0 |
| S2-high-T1/score | round r13 referee | anthropic/claude-opus-5.5 | 1 | 5269 | 0 | 0 | 581 | $0.0327 | 0 | 0 | 0 |
| S2-high-T1/score | hold r13 1 | anthropic/claude-haiku-5.5 | 1 | 5624 | 0 | 0 | 377 | $0.0008 | 0 | 0 | 0 |
| S2-high-T1/score | hold r13 2 | anthropic/claude-haiku-5.5 | 1 | 5624 | 0 | 0 | 772 | $0.0009 | 0 | 0 | 0 |
| S2-high-T1/score | hold r13 referee | anthropic/claude-opus-5.5 | 1 | 5624 | 0 | 0 | 798 | $0.0385 | 0 | 0 | 0 |
| S2-high-T1/score | round r14 1 | anthropic/claude-haiku-5.5 | 1 | 5623 | 0 | 0 | 509 | $0.0008 | 0 | 0 | 0 |
| S2-high-T1/score | round r14 2 | anthropic/claude-haiku-5.5 | 1 | 5623 | 0 | 0 | 1899 | $0.0015 | 0 | 0 | 0 |
| S2-high-T1/score | round r14 referee | anthropic/claude-opus-5.5 | 1 | 5623 | 0 | 0 | 1384 | $0.0502 | 0 | 0 | 0 |
| S2-high-T1/score | hold r14 1 | anthropic/claude-haiku-5.5 | 1 | 5978 | 0 | 0 | 1784 | $0.0015 | 0 | 0 | 0 |
| S2-high-T1/score | hold r14 2 | anthropic/claude-haiku-5.5 | 1 | 5978 | 0 | 0 | 409 | $0.0008 | 0 | 0 | 0 |
| S2-high-T1/score | hold r14 referee | anthropic/claude-opus-5.5 | 1 | 5978 | 0 | 0 | 1093 | $0.0458 | 0 | 0 | 0 |
| S2-high-T1/score | round r15 1 | anthropic/claude-haiku-5.5 | 1 | 6365 | 0 | 0 | 2096 | $0.0017 | 0 | 0 | 0 |
| S2-high-T1/score | round r15 2 | anthropic/claude-haiku-5.5 | 1 | 6365 | 0 | 0 | 2087 | $0.0017 | 0 | 0 | 0 |
| S2-high-T1/score | round r15 referee | anthropic/claude-opus-5.5 | 1 | 6365 | 0 | 0 | 1505 | $0.0556 | 0 | 0 | 0 |
| S2-high-T1/score | hold r15 1 | anthropic/claude-haiku-5.5 | 1 | 6720 | 0 | 0 | 1462 | $0.0014 | 0 | 0 | 0 |
| S2-high-T1/score | hold r15 2 | anthropic/claude-haiku-5.5 | 1 | 6720 | 0 | 0 | 1391 | $0.0014 | 0 | 0 | 0 |
| S2-high-T1/score | hold r15 referee | anthropic/claude-opus-5.5 | 1 | 6720 | 0 | 0 | 1318 | $0.0532 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r1 1 | anthropic/claude-haiku-5.5 | 1 | 2325 | 0 | 0 | 406 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r1 2 | anthropic/claude-haiku-5.5 | 1 | 2325 | 0 | 0 | 429 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r2 1 | anthropic/claude-haiku-5.5 | 1 | 2057 | 0 | 0 | 141 | $0.0003 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r2 2 | anthropic/claude-haiku-5.5 | 1 | 2057 | 0 | 0 | 138 | $0.0003 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r3 1 | anthropic/claude-haiku-5.5 | 1 | 2798 | 0 | 0 | 161 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r3 2 | anthropic/claude-haiku-5.5 | 1 | 2798 | 0 | 0 | 250 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r4 1 | anthropic/claude-haiku-5.5 | 1 | 3153 | 0 | 0 | 285 | $0.0005 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r4 2 | anthropic/claude-haiku-5.5 | 1 | 3153 | 0 | 0 | 406 | $0.0005 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r5 1 | anthropic/claude-haiku-5.5 | 1 | 3919 | 0 | 0 | 196 | $0.0005 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r5 2 | anthropic/claude-haiku-5.5 | 1 | 3919 | 0 | 0 | 229 | $0.0005 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r6 1 | anthropic/claude-haiku-5.5 | 1 | 3009 | 0 | 0 | 221 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r6 2 | anthropic/claude-haiku-5.5 | 1 | 3009 | 0 | 0 | 166 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r7 1 | anthropic/claude-haiku-5.5 | 1 | 3980 | 0 | 0 | 67 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r7 2 | anthropic/claude-haiku-5.5 | 1 | 3980 | 0 | 0 | 244 | $0.0005 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r8 1 | anthropic/claude-haiku-5.5 | 1 | 3540 | 0 | 0 | 167 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r8 2 | anthropic/claude-haiku-5.5 | 1 | 3540 | 0 | 0 | 159 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r9 1 | anthropic/claude-haiku-5.5 | 1 | 3416 | 0 | 0 | 57 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r9 2 | anthropic/claude-haiku-5.5 | 1 | 3416 | 0 | 0 | 74 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r10 1 | anthropic/claude-haiku-5.5 | 1 | 3396 | 0 | 0 | 81 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r10 2 | anthropic/claude-haiku-5.5 | 1 | 3396 | 0 | 0 | 73 | $0.0004 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r11 1 | anthropic/claude-haiku-5.5 | 1 | 3545 | 0 | 0 | 367 | $0.0005 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r11 2 | anthropic/claude-haiku-5.5 | 1 | 3545 | 0 | 0 | 385 | $0.0005 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r11 3 | anthropic/claude-haiku-5.5 | 1 | 3545 | 0 | 0 | 285 | $0.0005 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r12 1 | anthropic/claude-haiku-5.5 | 1 | 3896 | 0 | 0 | 229 | $0.0005 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r12 2 | anthropic/claude-haiku-5.5 | 1 | 3896 | 0 | 0 | 229 | $0.0005 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r13 1 | anthropic/claude-haiku-5.5 | 1 | 3863 | 0 | 0 | 229 | $0.0005 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r13 2 | anthropic/claude-haiku-5.5 | 1 | 3863 | 0 | 0 | 281 | $0.0005 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r14 1 | anthropic/claude-haiku-5.5 | 1 | 4217 | 0 | 0 | 451 | $0.0006 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r14 2 | anthropic/claude-haiku-5.5 | 1 | 4217 | 0 | 0 | 603 | $0.0007 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r15 1 | anthropic/claude-haiku-5.5 | 1 | 4959 | 0 | 0 | 507 | $0.0007 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r15 2 | anthropic/claude-haiku-5.5 | 1 | 4959 | 0 | 0 | 472 | $0.0007 | 0 | 0 | 0 |
| S2-high-T1/score | initiative r15 3 | anthropic/claude-haiku-5.5 | 1 | 4959 | 0 | 0 | 343 | $0.0007 | 0 | 0 | 0 |
| S2-high-T2 | relay opening | anthropic/claude-sonnet-5.5 | 1 | 1324 | 0 | 0 | 1385 | $0.0165 | 0 | 0 | 0 |
| S2-high-T2/Sefa | player r1 | deepseek/deepseek-v4-pro-0813 | 1 | 7611 | 0 | 0 | 787 | $0.0119 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Sefa r1 | anthropic/claude-haiku-5.5 | 1 | 1893 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2/Pell | player r1 | anthropic/claude-fable-5.1 | 1 | 4 | 0 | 10972 | 501 | $0.1622 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Pell r1 | anthropic/claude-haiku-5.5 | 1 | 1931 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2/Bram | player r1 | openai/gpt-6-astra | 1 | 3 | 0 | 7263 | 80 | $0.0948 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Bram r1 | anthropic/claude-haiku-5.5 | 1 | 1608 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2 | dm r1 | anthropic/claude-opus-5.5 | 1 | 4 | 19371 | 26844 | 2619 | $0.1905 | 0 | 0 | 0 |
| S2-high-T2 | relay r1 card | anthropic/claude-sonnet-5.5 | 2 | 4530 | 0 | 0 | 1976 | $0.0288 | 0 | 0 | 0 |
| S2-high-T2/Sefa | player r1 card 1 | deepseek/deepseek-v4-pro-0813 | 2 | 1491 | 15616 | 0 | 1210 | $0.0066 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Sefa r1 card | anthropic/claude-haiku-5.5 | 3 | 3837 | 0 | 0 | 187 | $0.0005 | 0 | 0 | 0 |
| S2-high-T2 | relay r1 card (asked again) | anthropic/claude-sonnet-5.5 | 1 | 2265 | 0 | 0 | 929 | $0.0138 | 0 | 0 | 0 |
| S2-high-T2 | relay r1 card (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3221 | 0 | 0 | 800 | $0.0144 | 0 | 0 | 0 |
| S2-high-T2/Pell | player r1 card 1 | anthropic/claude-fable-5.1 | 2 | 8 | 12286 | 12473 | 149 | $0.1665 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Pell r1 card | anthropic/claude-haiku-5.5 | 2 | 1731 | 0 | 0 | 118 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2 | dm r1 card prose | anthropic/claude-opus-5.5 | 1 | 16400 | 18111 | 467 | 829 | $0.0895 | 0 | 0 | 0 |
| S2-high-T2/Sefa | player r1 card 2 | deepseek/deepseek-v4-pro-0813 | 1 | 1332 | 8448 | 0 | 165 | $0.0030 | 0 | 0 | 0 |
| S2-high-T2 | dm r1 onward | anthropic/claude-opus-5.5 | 3 | 10 | 117852 | 37651 | 6540 | $0.3427 | 0 | 0 | 0 |
| S2-high-T2 | dm r1 onward | anthropic/claude-haiku-5.5 | 2 | 5177 | 0 | 0 | 595 | $0.0008 | 0 | 0 | 0 |
| S2-high-T2 | relay r1 | anthropic/claude-sonnet-5.5 | 1 | 4507 | 0 | 0 | 2274 | $0.0318 | 0 | 0 | 0 |
| S2-high-T2 | relay r1 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5839 | 0 | 0 | 1209 | $0.0238 | 0 | 0 | 0 |
| S2-high-T2/Pell | player r2 | anthropic/claude-fable-5.1 | 1 | 4 | 12473 | 464 | 516 | $0.0348 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Pell r2 | anthropic/claude-haiku-5.5 | 1 | 1148 | 0 | 0 | 71 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2/Bram | player r2 | openai/gpt-6-astra | 1 | 3 | 7263 | 953 | 95 | $0.0240 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Bram r2 | anthropic/claude-haiku-5.5 | 1 | 1712 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2/Sefa | player r2 | deepseek/deepseek-v4-pro-0813 | 1 | 730 | 9472 | 0 | 452 | $0.0031 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Sefa r2 | anthropic/claude-haiku-5.5 | 1 | 1118 | 0 | 0 | 66 | $0.0001 | 0 | 0 | 0 |
| S2-high-T2 | dm r2 | anthropic/claude-opus-5.5 | 2 | 8 | 40749 | 71391 | 5316 | $0.4772 | 0 | 0 | 0 |
| S2-high-T2 | dm r2 | anthropic/claude-haiku-5.5 | 1 | 2821 | 0 | 0 | 138 | $0.0004 | 0 | 0 | 0 |
| S2-high-T2 | relay r2 | anthropic/claude-sonnet-5.5 | 1 | 2451 | 0 | 0 | 2683 | $0.0317 | 0 | 0 | 0 |
| S2-high-T2/Bram | player r3 | openai/gpt-6-astra | 1 | 3 | 8216 | 711 | 92 | $0.0217 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Bram r3 | anthropic/claude-haiku-5.5 | 1 | 1340 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2/Sefa | player r3 | deepseek/deepseek-v4-pro-0813 | 1 | 1080 | 9984 | 0 | 952 | $0.0049 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Sefa r3 | anthropic/claude-haiku-5.5 | 1 | 1727 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2/Pell | player r3 | anthropic/claude-fable-5.1 | 1 | 4 | 12937 | 1146 | 557 | $0.0454 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Pell r3 | anthropic/claude-haiku-5.5 | 1 | 1463 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2 | dm r3 | anthropic/claude-opus-5.5 | 1 | 4 | 21293 | 33811 | 2293 | $0.2240 | 0 | 0 | 0 |
| S2-high-T2 | relay r3 card | anthropic/claude-sonnet-5.5 | 1 | 2009 | 0 | 0 | 625 | $0.0103 | 0 | 0 | 0 |
| S2-high-T2/Bram | player r3 card 1 | openai/gpt-6-astra | 2 | 6 | 18382 | 671 | 17 | $0.0277 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Bram r3 card | anthropic/claude-haiku-5.5 | 2 | 1414 | 0 | 0 | 122 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2 | dm r3 onward | anthropic/claude-opus-5.5 | 3 | 10 | 134274 | 39670 | 6269 | $0.3506 | 0 | 0 | 0 |
| S2-high-T2 | dm r3 onward | anthropic/claude-haiku-5.5 | 2 | 5162 | 0 | 0 | 402 | $0.0007 | 0 | 0 | 0 |
| S2-high-T2 | relay r3 | anthropic/claude-sonnet-5.5 | 1 | 3672 | 0 | 0 | 890 | $0.0162 | 0 | 0 | 0 |
| S2-high-T2/Sefa | player r4 | deepseek/deepseek-v4-pro-0813 | 1 | 659 | 10752 | 0 | 618 | $0.0035 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Sefa r4 | anthropic/claude-haiku-5.5 | 1 | 655 | 0 | 0 | 62 | $0.0001 | 0 | 0 | 0 |
| S2-high-T2/Pell | player r4 | anthropic/claude-fable-5.1 | 1 | 4 | 14083 | 432 | 713 | $0.0446 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Pell r4 | anthropic/claude-haiku-5.5 | 1 | 749 | 0 | 0 | 64 | $0.0001 | 0 | 0 | 0 |
| S2-high-T2/Bram | player r4 | openai/gpt-6-astra | 1 | 3 | 9598 | 716 | 219 | $0.0295 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Bram r4 | anthropic/claude-haiku-5.5 | 1 | 1571 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2 | dm r4 | anthropic/claude-opus-5.5 | 3 | 12 | 99977 | 75777 | 9145 | $0.5888 | 0 | 0 | 0 |
| S2-high-T2 | dm r4 | anthropic/claude-haiku-5.5 | 2 | 6826 | 0 | 0 | 1026 | $0.0012 | 0 | 0 | 0 |
| S2-high-T2 | relay r4 | anthropic/claude-sonnet-5.5 | 1 | 2895 | 0 | 0 | 2960 | $0.0354 | 0 | 0 | 0 |
| S2-high-T2 | relay r4 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4214 | 0 | 0 | 1157 | $0.0200 | 0 | 0 | 0 |
| S2-high-T2 | relay r4 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3974 | 0 | 0 | 917 | $0.0171 | 0 | 0 | 0 |
| S2-high-T2/Pell | player r5 | anthropic/claude-fable-5.1 | 1 | 4 | 14515 | 1350 | 799 | $0.0605 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Pell r5 | anthropic/claude-haiku-5.5 | 1 | 2006 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2/Bram | player r5 | openai/gpt-6-astra | 1 | 3 | 10314 | 751 | 87 | $0.0241 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Bram r5 | anthropic/claude-haiku-5.5 | 1 | 1261 | 0 | 0 | 74 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2/Sefa | player r5 | deepseek/deepseek-v4-pro-0813 | 1 | 1215 | 11264 | 0 | 1307 | $0.0061 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Sefa r5 | anthropic/claude-haiku-5.5 | 1 | 2157 | 0 | 0 | 75 | $0.0003 | 0 | 0 | 0 |
| S2-high-T2 | dm r5 | anthropic/claude-opus-5.5 | 3 | 12 | 99782 | 70182 | 11024 | $0.5975 | 0 | 0 | 0 |
| S2-high-T2 | dm r5 | anthropic/claude-haiku-5.5 | 1 | 3673 | 0 | 0 | 392 | $0.0006 | 0 | 0 | 0 |
| S2-high-T2 | relay r5 | anthropic/claude-sonnet-5.5 | 1 | 3578 | 0 | 0 | 4098 | $0.0481 | 0 | 0 | 0 |
| S2-high-T2 | relay r5 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4754 | 0 | 0 | 1023 | $0.0197 | 0 | 0 | 0 |
| S2-high-T2 | relay r5 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5334 | 0 | 0 | 1549 | $0.0262 | 0 | 0 | 0 |
| S2-high-T2 | relay r5 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 5158 | 0 | 0 | 1402 | $0.0243 | 0 | 0 | 0 |
| S2-high-T2/Bram | player r6 | openai/gpt-6-astra | 1 | 3 | 11065 | 1217 | 145 | $0.0336 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Bram r6 | anthropic/claude-haiku-5.5 | 1 | 2071 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2/Sefa | player r6 | deepseek/deepseek-v4-pro-0813 | 1 | 1673 | 12288 | 0 | 1561 | $0.0075 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Sefa r6 | anthropic/claude-haiku-5.5 | 1 | 2252 | 0 | 0 | 71 | $0.0003 | 0 | 0 | 0 |
| S2-high-T2/Pell | player r6 | anthropic/claude-fable-5.1 | 1 | 4 | 15865 | 1763 | 818 | $0.0669 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Pell r6 | anthropic/claude-haiku-5.5 | 1 | 1815 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2 | dm r6 | anthropic/claude-opus-5.5 | 4 | 16 | 179491 | 92572 | 10535 | $0.7177 | 0 | 0 | 0 |
| S2-high-T2 | dm r6 | anthropic/claude-haiku-5.5 | 2 | 5771 | 0 | 0 | 979 | $0.0011 | 0 | 0 | 0 |
| S2-high-T2 | relay r6 | anthropic/claude-sonnet-5.5 | 1 | 3304 | 0 | 0 | 4055 | $0.0472 | 0 | 0 | 0 |
| S2-high-T2 | relay r6 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4805 | 0 | 0 | 1377 | $0.0234 | 0 | 0 | 0 |
| S2-high-T2/Sefa | player r7 | deepseek/deepseek-v4-pro-0813 | 1 | 1365 | 13824 | 0 | 919 | $0.0055 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Sefa r7 | anthropic/claude-haiku-5.5 | 1 | 2113 | 0 | 0 | 93 | $0.0003 | 0 | 0 | 0 |
| S2-high-T2/Pell | player r7 | anthropic/claude-fable-5.1 | 1 | 4 | 17628 | 1816 | 642 | $0.0592 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Pell r7 | anthropic/claude-haiku-5.5 | 1 | 2209 | 0 | 0 | 88 | $0.0003 | 0 | 0 | 0 |
| S2-high-T2/Bram | player r7 | openai/gpt-6-astra | 1 | 3 | 12282 | 1107 | 106 | $0.0314 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Bram r7 | anthropic/claude-haiku-5.5 | 1 | 1858 | 0 | 0 | 78 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2 | dm r7 | anthropic/claude-opus-5.5 | 4 | 16 | 176257 | 86349 | 12032 | $0.7151 | 0 | 0 | 0 |
| S2-high-T2 | dm r7 | anthropic/claude-haiku-5.5 | 2 | 6654 | 0 | 0 | 496 | $0.0009 | 0 | 0 | 0 |
| S2-high-T2 | relay r7 | anthropic/claude-sonnet-5.5 | 1 | 3692 | 0 | 0 | 2789 | $0.0353 | 0 | 0 | 0 |
| S2-high-T2/Bram | player r8 | openai/gpt-6-astra | 1 | 3 | 13389 | 888 | 103 | $0.0297 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Bram r8 | anthropic/claude-haiku-5.5 | 1 | 1580 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2/Sefa | player r8 | deepseek/deepseek-v4-pro-0813 | 1 | 1228 | 15104 | 0 | 1623 | $0.0073 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Sefa r8 | anthropic/claude-haiku-5.5 | 1 | 1625 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2 | dm r8 | anthropic/claude-opus-5.5 | 4 | 16 | 153067 | 133333 | 10727 | $0.9261 | 0 | 0 | 0 |
| S2-high-T2 | dm r8 | anthropic/claude-haiku-5.5 | 2 | 7549 | 0 | 0 | 1805 | $0.0017 | 0 | 0 | 0 |
| S2-high-T2 | relay r8 | anthropic/claude-sonnet-5.5 | 2 | 5399 | 0 | 0 | 3455 | $0.0453 | 0 | 0 | 0 |
| S2-high-T2 | relay r8 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4255 | 0 | 0 | 1401 | $0.0225 | 0 | 0 | 0 |
| S2-high-T2 | relay r8 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 4258 | 0 | 0 | 1402 | $0.0225 | 0 | 0 | 0 |
| S2-high-T2 | relay r8 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4168 | 0 | 0 | 1332 | $0.0217 | 0 | 0 | 0 |
| S2-high-T2/Pell | player r8 | anthropic/claude-fable-5.1 | 1 | 4 | 0 | 20699 | 624 | $0.2900 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Pell r8 | anthropic/claude-haiku-5.5 | 1 | 1508 | 0 | 0 | 80 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2 | relay r8 card | anthropic/claude-sonnet-5.5 | 1 | 1833 | 0 | 0 | 521 | $0.0089 | 0 | 0 | 0 |
| S2-high-T2/Pell | player r8 card 1 | anthropic/claude-fable-5.1 | 2 | 8 | 42431 | 1222 | 16 | $0.0268 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Pell r8 card | anthropic/claude-haiku-5.5 | 2 | 1385 | 0 | 0 | 114 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2 | dm r8 onward | anthropic/claude-opus-5.5 | 2 | 6 | 99473 | 44770 | 2940 | $0.3026 | 0 | 0 | 0 |
| S2-high-T2 | dm r8 onward | anthropic/claude-haiku-5.5 | 2 | 4135 | 0 | 0 | 307 | $0.0006 | 0 | 0 | 0 |
| S2-high-T2/Sefa | player r9 | deepseek/deepseek-v4-pro-0813 | 1 | 1446 | 16128 | 0 | 611 | $0.0051 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Sefa r9 | anthropic/claude-haiku-5.5 | 1 | 2297 | 0 | 0 | 85 | $0.0003 | 0 | 0 | 0 |
| S2-high-T2/Bram | player r9 | openai/gpt-6-astra | 1 | 3 | 14277 | 1112 | 128 | $0.0346 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Bram r9 | anthropic/claude-haiku-5.5 | 1 | 1915 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2 | dm r9 | anthropic/claude-opus-5.5 | 4 | 16 | 118536 | 173259 | 9057 | $1.0807 | 0 | 0 | 0 |
| S2-high-T2 | dm r9 | anthropic/claude-haiku-5.5 | 2 | 5780 | 0 | 0 | 727 | $0.0009 | 0 | 0 | 0 |
| S2-high-T2 | relay r9 | anthropic/claude-sonnet-5.5 | 2 | 4584 | 0 | 0 | 2858 | $0.0377 | 0 | 0 | 0 |
| S2-high-T2 | relay r9 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3697 | 0 | 0 | 961 | $0.0170 | 0 | 0 | 0 |
| S2-high-T2 | relay r9 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 3657 | 0 | 0 | 961 | $0.0169 | 0 | 0 | 0 |
| S2-high-T2/Pell | player r9 | anthropic/claude-fable-5.1 | 1 | 4 | 21921 | 601 | 646 | $0.0453 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Pell r9 | anthropic/claude-haiku-5.5 | 1 | 1412 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2/Bram | player r10 | openai/gpt-6-astra | 1 | 3 | 15389 | 817 | 127 | $0.0320 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Bram r10 | anthropic/claude-haiku-5.5 | 1 | 1488 | 0 | 0 | 79 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2/Sefa | player r10 | deepseek/deepseek-v4-pro-0813 | 1 | 1260 | 17408 | 0 | 800 | $0.0055 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Sefa r10 | anthropic/claude-haiku-5.5 | 1 | 1639 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2 | dm r10 | anthropic/claude-opus-5.5 | 4 | 16 | 130672 | 171176 | 10081 | $1.0930 | 0 | 0 | 0 |
| S2-high-T2 | dm r10 | anthropic/claude-haiku-5.5 | 2 | 6351 | 0 | 0 | 862 | $0.0011 | 0 | 0 | 0 |
| S2-high-T2 | relay r10 | anthropic/claude-sonnet-5.5 | 2 | 4630 | 0 | 0 | 2520 | $0.0345 | 0 | 0 | 0 |
| S2-high-T2 | relay r10 (asked again) | anthropic/claude-sonnet-5.5 | 1 | 2636 | 0 | 0 | 1873 | $0.0240 | 0 | 0 | 0 |
| S2-high-T2 | relay r10 (Bram's screen alone) | anthropic/claude-sonnet-5.5 | 1 | 2692 | 0 | 0 | 847 | $0.0139 | 0 | 0 | 0 |
| S2-high-T2 | relay r10 (Sefa's screen alone) | anthropic/claude-sonnet-5.5 | 1 | 2693 | 0 | 0 | 1022 | $0.0156 | 0 | 0 | 0 |
| S2-high-T2 | relay r10 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3674 | 0 | 0 | 893 | $0.0163 | 0 | 0 | 0 |
| S2-high-T2/Pell | player r10 | anthropic/claude-fable-5.1 | 1 | 4 | 22522 | 1369 | 524 | $0.0490 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Pell r10 | anthropic/claude-haiku-5.5 | 1 | 1566 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2/Sefa | player r11 | deepseek/deepseek-v4-pro-0813 | 1 | 1321 | 18432 | 0 | 1966 | $0.0087 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Sefa r11 | anthropic/claude-haiku-5.5 | 1 | 1991 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2/Bram | player r11 | openai/gpt-6-astra | 1 | 3 | 16206 | 751 | 90 | $0.0301 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Bram r11 | anthropic/claude-haiku-5.5 | 1 | 1313 | 0 | 0 | 61 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2 | dm r11 | anthropic/claude-opus-5.5 | 3 | 12 | 109426 | 141739 | 8040 | $0.9008 | 0 | 0 | 0 |
| S2-high-T2 | relay r11 card | anthropic/claude-sonnet-5.5 | 1 | 2035 | 0 | 0 | 563 | $0.0097 | 0 | 0 | 0 |
| S2-high-T2 | relay r11 card (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 2648 | 0 | 0 | 455 | $0.0098 | 0 | 0 | 0 |
| S2-high-T2/Sefa | player r11 card 1 | deepseek/deepseek-v4-pro-0813 | 2 | 1458 | 40448 | 0 | 1349 | $0.0094 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Sefa r11 card | anthropic/claude-haiku-5.5 | 4 | 4419 | 0 | 0 | 269 | $0.0006 | 0 | 0 | 0 |
| S2-high-T2 | dm r11 card prose | anthropic/claude-opus-5.5 | 2 | 48742 | 61947 | 25725 | 2561 | $0.4644 | 0 | 0 | 0 |
| S2-high-T2/Sefa | player r11 card 2 | deepseek/deepseek-v4-pro-0813 | 2 | 1892 | 41728 | 0 | 597 | $0.0082 | 0 | 0 | 0 |
| S2-high-T2 | dm r11 onward | anthropic/claude-opus-5.5 | 2 | 6 | 110115 | 48963 | 5403 | $0.3749 | 0 | 0 | 0 |
| S2-high-T2 | dm r11 onward | anthropic/claude-haiku-5.5 | 2 | 5151 | 0 | 0 | 836 | $0.0009 | 0 | 0 | 0 |
| S2-high-T2 | relay r11 | anthropic/claude-sonnet-5.5 | 2 | 5266 | 0 | 0 | 2063 | $0.0312 | 0 | 0 | 0 |
| S2-high-T2 | relay r11 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4008 | 0 | 0 | 656 | $0.0146 | 0 | 0 | 0 |
| S2-high-T2 | relay r11 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 4019 | 0 | 0 | 665 | $0.0147 | 0 | 0 | 0 |
| S2-high-T2/Pell | player r11 | anthropic/claude-fable-5.1 | 1 | 4 | 0 | 25043 | 658 | $0.3460 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Pell r11 | anthropic/claude-haiku-5.5 | 1 | 1482 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2 | dm r11 | anthropic/claude-haiku-5.5 | 1 | 3065 | 0 | 0 | 356 | $0.0005 | 0 | 0 | 0 |
| S2-high-T2/Bram | player r12 | openai/gpt-6-astra | 1 | 3 | 16957 | 582 | 110 | $0.0298 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Bram r12 | anthropic/claude-haiku-5.5 | 1 | 1174 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2/Sefa | player r12 | deepseek/deepseek-v4-pro-0813 | 1 | 509 | 22272 | 0 | 1129 | $0.0058 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Sefa r12 | anthropic/claude-haiku-5.5 | 1 | 1365 | 0 | 0 | 86 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2 | dm r12 | anthropic/claude-opus-5.5 | 7 | 28 | 354957 | 210869 | 18125 | $1.4973 | 0 | 0 | 0 |
| S2-high-T2 | dm r12 | anthropic/claude-haiku-5.5 | 3 | 10228 | 0 | 0 | 1202 | $0.0016 | 0 | 0 | 0 |
| S2-high-T2 | relay r12 | anthropic/claude-sonnet-5.5 | 2 | 5002 | 0 | 0 | 3277 | $0.0428 | 0 | 0 | 0 |
| S2-high-T2 | relay r12 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3868 | 0 | 0 | 1100 | $0.0187 | 0 | 0 | 0 |
| S2-high-T2 | relay r12 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 3861 | 0 | 0 | 1103 | $0.0188 | 0 | 0 | 0 |
| S2-high-T2 | relay r12 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3794 | 0 | 0 | 1041 | $0.0180 | 0 | 0 | 0 |
| S2-high-T2/Pell | player r12 | anthropic/claude-fable-5.1 | 1 | 4 | 25043 | 1195 | 581 | $0.0503 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Pell r12 | anthropic/claude-haiku-5.5 | 1 | 1604 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2/Sefa | player r13 | deepseek/deepseek-v4-pro-0813 | 1 | 1395 | 22528 | 0 | 978 | $0.0066 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Sefa r13 | anthropic/claude-haiku-5.5 | 1 | 1723 | 0 | 0 | 78 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2/Bram | player r13 | openai/gpt-6-astra | 1 | 3 | 17539 | 904 | 87 | $0.0332 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Bram r13 | anthropic/claude-haiku-5.5 | 1 | 1554 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2 | dm r13 | anthropic/claude-opus-5.5 | 6 | 24 | 293020 | 219995 | 13076 | $1.4299 | 0 | 0 | 0 |
| S2-high-T2 | dm r13 | anthropic/claude-haiku-5.5 | 2 | 6785 | 0 | 0 | 823 | $0.0011 | 0 | 0 | 0 |
| S2-high-T2 | relay r13 | anthropic/claude-sonnet-5.5 | 2 | 4890 | 0 | 0 | 3572 | $0.0455 | 0 | 0 | 0 |
| S2-high-T2 | relay r13 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3838 | 0 | 0 | 1257 | $0.0202 | 0 | 0 | 0 |
| S2-high-T2/Pell | player r13 | anthropic/claude-fable-5.1 | 1 | 4 | 26238 | 1479 | 799 | $0.0650 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Pell r13 | anthropic/claude-haiku-5.5 | 1 | 1875 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2/Bram | player r14 | openai/gpt-6-astra | 1 | 3 | 18443 | 976 | 158 | $0.0386 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Bram r14 | anthropic/claude-haiku-5.5 | 1 | 1738 | 0 | 0 | 85 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2/Sefa | player r14 | deepseek/deepseek-v4-pro-0813 | 1 | 1279 | 23808 | 0 | 750 | $0.0060 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Sefa r14 | anthropic/claude-haiku-5.5 | 1 | 2276 | 0 | 0 | 88 | $0.0003 | 0 | 0 | 0 |
| S2-high-T2 | dm r14 | anthropic/claude-opus-5.5 | 5 | 20 | 227947 | 234248 | 21261 | $1.6543 | 0 | 0 | 0 |
| S2-high-T2 | dm r14 | anthropic/claude-haiku-5.5 | 2 | 7355 | 0 | 0 | 666 | $0.0011 | 0 | 0 | 0 |
| S2-high-T2 | relay r14 | anthropic/claude-sonnet-5.5 | 2 | 5729 | 0 | 0 | 3834 | $0.0498 | 0 | 0 | 0 |
| S2-high-T2 | relay r14 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4731 | 0 | 0 | 1361 | $0.0231 | 0 | 0 | 0 |
| S2-high-T2 | relay r14 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 4715 | 0 | 0 | 1367 | $0.0231 | 0 | 0 | 0 |
| S2-high-T2/Pell | player r14 | anthropic/claude-fable-5.1 | 1 | 4 | 27717 | 1518 | 1333 | $0.0926 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Pell r14 | anthropic/claude-haiku-5.5 | 1 | 1948 | 0 | 0 | 82 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2/Sefa | player r15 | deepseek/deepseek-v4-pro-0813 | 1 | 1802 | 24832 | 0 | 1931 | $0.0098 | 0 | 0 | 2 |
| S2-high-T2/check | check S2-high-T2 Sefa r15 | anthropic/claude-haiku-5.5 | 1 | 2272 | 0 | 0 | 67 | $0.0003 | 0 | 0 | 0 |
| S2-high-T2/Bram | player r15 | openai/gpt-6-astra | 1 | 3 | 19419 | 1146 | 187 | $0.0431 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Bram r15 | anthropic/claude-haiku-5.5 | 1 | 1943 | 0 | 0 | 78 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2 | dm r15 | anthropic/claude-opus-5.5 | 5 | 20 | 236909 | 236216 | 17216 | $1.5834 | 0 | 0 | 0 |
| S2-high-T2 | dm r15 | anthropic/claude-haiku-5.5 | 2 | 7084 | 0 | 0 | 700 | $0.0011 | 0 | 0 | 0 |
| S2-high-T2 | relay r15 | anthropic/claude-sonnet-5.5 | 2 | 5177 | 0 | 0 | 3026 | $0.0406 | 0 | 0 | 0 |
| S2-high-T2 | relay r15 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3714 | 0 | 0 | 940 | $0.0168 | 0 | 0 | 0 |
| S2-high-T2 | relay r15 (Bram's screen, retold, pass 2) | anthropic/claude-sonnet-5.5 | 1 | 3711 | 0 | 0 | 942 | $0.0168 | 0 | 0 | 0 |
| S2-high-T2/Pell | player r15 | anthropic/claude-fable-5.1 | 1 | 4 | 0 | 30881 | 955 | $0.4338 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Pell r15 | anthropic/claude-haiku-5.5 | 1 | 1947 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2/Bram | after 1 | openai/gpt-6-astra | 1 | 3 | 20565 | 864 | 200 | $0.0414 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Bram after 1 | anthropic/claude-haiku-5.5 | 1 | 652 | 0 | 0 | 79 | $0.0001 | 0 | 0 | 0 |
| S2-high-T2/Bram | after 2 | openai/gpt-6-astra | 1 | 3 | 21429 | 216 | 196 | $0.0340 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Bram after 2 | anthropic/claude-haiku-5.5 | 1 | 640 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| S2-high-T2/Bram | after 3 | openai/gpt-6-astra | 1 | 3 | 21645 | 213 | 99 | $0.0293 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Bram after 3 | anthropic/claude-haiku-5.5 | 1 | 442 | 0 | 0 | 60 | $0.0001 | 0 | 0 | 0 |
| S2-high-T2/Bram | after 4 | openai/gpt-6-astra | 1 | 3 | 21858 | 101 | 192 | $0.0328 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Bram after 4 | anthropic/claude-haiku-5.5 | 1 | 570 | 0 | 0 | 63 | $0.0001 | 0 | 0 | 0 |
| S2-high-T2/Sefa | after 1 | deepseek/deepseek-v4-pro-0813 | 1 | 1367 | 26368 | 0 | 539 | $0.0058 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Sefa after 1 | anthropic/claude-haiku-5.5 | 1 | 799 | 0 | 0 | 100 | $0.0001 | 0 | 0 | 0 |
| S2-high-T2/Sefa | after 2 | deepseek/deepseek-v4-pro-0813 | 1 | 435 | 27648 | 0 | 742 | $0.0053 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Sefa after 2 | anthropic/claude-haiku-5.5 | 1 | 904 | 0 | 0 | 81 | $0.0001 | 0 | 0 | 0 |
| S2-high-T2/Sefa | after 3 | deepseek/deepseek-v4-pro-0813 | 1 | 616 | 27904 | 0 | 592 | $0.0051 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Sefa after 3 | anthropic/claude-haiku-5.5 | 1 | 681 | 0 | 0 | 65 | $0.0001 | 0 | 0 | 0 |
| S2-high-T2/Pell | after 1 | anthropic/claude-fable-5.1 | 1 | 4 | 30881 | 1730 | 1284 | $0.0936 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Pell after 1 | anthropic/claude-haiku-5.5 | 1 | 1121 | 0 | 0 | 74 | $0.0001 | 0 | 0 | 0 |
| S2-high-T2/Pell | after 2 | anthropic/claude-fable-5.1 | 1 | 4 | 32611 | 816 | 1193 | $0.0780 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Pell after 2 | anthropic/claude-haiku-5.5 | 1 | 1061 | 0 | 0 | 88 | $0.0002 | 0 | 0 | 0 |
| S2-high-T2/Pell | after 3 | anthropic/claude-fable-5.1 | 1 | 4 | 33427 | 743 | 1066 | $0.0710 | 0 | 0 | 0 |
| S2-high-T2/check | check S2-high-T2 Pell after 3 | anthropic/claude-haiku-5.5 | 1 | 1101 | 0 | 0 | 78 | $0.0001 | 0 | 0 | 0 |
| S2-high-T2/check | check referee S2-high-T2 Pell after 3 | anthropic/claude-opus-5.5 | 1 | 1101 | 0 | 0 | 66 | $0.0057 | 0 | 0 | 0 |
| S2-high-T2/score | round r1 1 | anthropic/claude-haiku-5.5 | 1 | 3704 | 0 | 0 | 1034 | $0.0009 | 0 | 0 | 0 |
| S2-high-T2/score | round r1 2 | anthropic/claude-haiku-5.5 | 1 | 3704 | 0 | 0 | 968 | $0.0009 | 0 | 0 | 0 |
| S2-high-T2/score | hold r1 1 | anthropic/claude-haiku-5.5 | 1 | 4059 | 0 | 0 | 562 | $0.0007 | 0 | 0 | 0 |
| S2-high-T2/score | hold r1 2 | anthropic/claude-haiku-5.5 | 1 | 4059 | 0 | 0 | 602 | $0.0007 | 0 | 0 | 0 |
| S2-high-T2/score | round r2 1 | anthropic/claude-haiku-5.5 | 1 | 3379 | 0 | 0 | 1625 | $0.0012 | 0 | 0 | 0 |
| S2-high-T2/score | round r2 2 | anthropic/claude-haiku-5.5 | 1 | 3379 | 0 | 0 | 1678 | $0.0012 | 0 | 0 | 0 |
| S2-high-T2/score | round r2 referee | anthropic/claude-opus-5.5 | 1 | 3379 | 0 | 0 | 939 | $0.0323 | 0 | 0 | 0 |
| S2-high-T2/score | hold r2 1 | anthropic/claude-haiku-5.5 | 1 | 3734 | 0 | 0 | 1445 | $0.0011 | 0 | 0 | 0 |
| S2-high-T2/score | hold r2 2 | anthropic/claude-haiku-5.5 | 1 | 3734 | 0 | 0 | 1176 | $0.0010 | 0 | 0 | 0 |
| S2-high-T2/score | round r3 1 | anthropic/claude-haiku-5.5 | 1 | 4106 | 0 | 0 | 1931 | $0.0014 | 0 | 0 | 0 |
| S2-high-T2/score | round r3 2 | anthropic/claude-haiku-5.5 | 1 | 4106 | 0 | 0 | 1732 | $0.0013 | 0 | 0 | 0 |
| S2-high-T2/score | hold r3 1 | anthropic/claude-haiku-5.5 | 1 | 4461 | 0 | 0 | 912 | $0.0009 | 0 | 0 | 0 |
| S2-high-T2/score | hold r3 2 | anthropic/claude-haiku-5.5 | 1 | 4461 | 0 | 0 | 993 | $0.0009 | 0 | 0 | 0 |
| S2-high-T2/score | round r4 1 | anthropic/claude-haiku-5.5 | 1 | 3823 | 0 | 0 | 1499 | $0.0011 | 0 | 0 | 0 |
| S2-high-T2/score | round r4 2 | anthropic/claude-haiku-5.5 | 1 | 3823 | 0 | 0 | 1790 | $0.0013 | 0 | 0 | 0 |
| S2-high-T2/score | round r4 referee | anthropic/claude-opus-5.5 | 1 | 3823 | 0 | 0 | 1229 | $0.0399 | 0 | 0 | 0 |
| S2-high-T2/score | hold r4 1 | anthropic/claude-haiku-5.5 | 1 | 4178 | 0 | 0 | 1434 | $0.0011 | 0 | 0 | 0 |
| S2-high-T2/score | hold r4 2 | anthropic/claude-haiku-5.5 | 1 | 4178 | 0 | 0 | 417 | $0.0006 | 0 | 0 | 0 |
| S2-high-T2/score | hold r4 referee | anthropic/claude-opus-5.5 | 1 | 4178 | 0 | 0 | 62 | $0.0180 | 0 | 1 | 0 |
| S3-T1 | relay opening | anthropic/claude-sonnet-5.5 | 1 | 1311 | 0 | 0 | 1372 | $0.0163 | 0 | 0 | 0 |
| S3-T1/Pell | player r1 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 10997 | 523 | $0.0655 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Pell r1 | anthropic/claude-haiku-5.5 | 1 | 1859 | 0 | 0 | 61 | $0.0002 | 0 | 0 | 0 |
| S3-T1/Bram | player r1 | openai/gpt-6.1-sol | 1 | 3 | 0 | 7270 | 94 | $0.0191 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Bram r1 | anthropic/claude-haiku-5.5 | 1 | 1618 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| S3-T1/Sefa | player r1 | deepseek/deepseek-v4-pro-0813 | 1 | 7610 | 0 | 0 | 626 | $0.0115 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Sefa r1 | anthropic/claude-haiku-5.5 | 1 | 1790 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| S3-T1 | dm r1 | anthropic/claude-opus-5.5 | 3 | 12 | 50236 | 103196 | 9296 | $0.8342 | 0 | 0 | 0 |
| S3-T1 | dm r1 | anthropic/claude-haiku-5.5 | 1 | 3371 | 0 | 0 | 427 | $0.0006 | 0 | 0 | 0 |
| S3-T1 | relay r1 | anthropic/claude-sonnet-5.5 | 1 | 2547 | 0 | 0 | 3342 | $0.0385 | 0 | 0 | 0 |
| S3-T1 | relay r1 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3799 | 0 | 0 | 1134 | $0.0189 | 0 | 0 | 0 |
| S3-T1 | relay r1 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3700 | 0 | 0 | 1039 | $0.0178 | 0 | 0 | 0 |
| S3-T1 | relay r1 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3721 | 0 | 0 | 1052 | $0.0180 | 0 | 0 | 0 |
| S3-T1/Bram | player r2 | openai/gpt-6.1-sol | 1 | 3 | 7270 | 854 | 99 | $0.0039 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Bram r2 | anthropic/claude-haiku-5.5 | 1 | 1556 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| S3-T1/Sefa | player r2 | deepseek/deepseek-v4-pro-0813 | 1 | 1063 | 7424 | 0 | 1353 | $0.0056 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Sefa r2 | anthropic/claude-haiku-5.5 | 1 | 1746 | 0 | 0 | 60 | $0.0002 | 0 | 0 | 0 |
| S3-T1/Pell | player r2 | anthropic/claude-opus-5.5 | 1 | 4 | 10997 | 1528 | 1048 | $0.0308 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Pell r2 | anthropic/claude-haiku-5.5 | 1 | 2186 | 0 | 0 | 89 | $0.0003 | 0 | 0 | 0 |
| S3-T1 | dm r2 | anthropic/claude-opus-5.5 | 2 | 8 | 40736 | 66107 | 8200 | $0.5078 | 0 | 0 | 0 |
| S3-T1 | dm r2 | anthropic/claude-haiku-5.5 | 1 | 3199 | 0 | 0 | 309 | $0.0005 | 0 | 0 | 0 |
| S3-T1 | relay r2 | anthropic/claude-sonnet-5.5 | 1 | 3093 | 0 | 0 | 2166 | $0.0278 | 0 | 0 | 0 |
| S3-T1/Bram | player r3 | openai/gpt-6.1-sol | 1 | 3 | 8124 | 508 | 75 | $0.0028 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Bram r3 | anthropic/claude-haiku-5.5 | 1 | 1004 | 0 | 0 | 57 | $0.0001 | 0 | 0 | 0 |
| S3-T1 | dm r3 | anthropic/claude-opus-5.5 | 5 | 20 | 141669 | 136520 | 11907 | $0.9580 | 0 | 0 | 0 |
| S3-T1 | dm r3 | anthropic/claude-haiku-5.5 | 2 | 5819 | 0 | 0 | 570 | $0.0009 | 0 | 0 | 0 |
| S3-T1 | relay r3 | anthropic/claude-sonnet-5.5 | 2 | 4239 | 0 | 0 | 2523 | $0.0337 | 0 | 0 | 0 |
| S3-T1/Sefa | player r3 | deepseek/deepseek-v4-pro-0813 | 1 | 993 | 8192 | 0 | 451 | $0.0033 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Sefa r3 | anthropic/claude-haiku-5.5 | 1 | 1232 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| S3-T1/Pell | player r3 | anthropic/claude-opus-5.5 | 1 | 4 | 12525 | 1562 | 846 | $0.0273 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Pell r3 | anthropic/claude-haiku-5.5 | 1 | 1694 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| S3-T1 | relay r3 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3538 | 0 | 0 | 624 | $0.0133 | 0 | 0 | 0 |
| S3-T1 | relay r3 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 4019 | 0 | 0 | 1128 | $0.0193 | 0 | 0 | 0 |
| S3-T1/Bram | player r4 | openai/gpt-6.1-sol | 1 | 3 | 8632 | 494 | 102 | $0.0031 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Bram r4 | anthropic/claude-haiku-5.5 | 1 | 1053 | 0 | 0 | 72 | $0.0001 | 0 | 0 | 0 |
| S3-T1 | dm r4 | anthropic/claude-opus-5.5 | 5 | 20 | 124380 | 167219 | 11985 | $1.1120 | 0 | 0 | 0 |
| S3-T1 | dm r4 | anthropic/claude-haiku-5.5 | 2 | 5558 | 0 | 0 | 632 | $0.0009 | 0 | 0 | 0 |
| S3-T1 | relay r4 | anthropic/claude-sonnet-5.5 | 3 | 5577 | 0 | 0 | 2168 | $0.0328 | 0 | 0 | 0 |
| S3-T1/Sefa | player r4 | deepseek/deepseek-v4-pro-0813 | 1 | 883 | 8960 | 0 | 374 | $0.0030 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Sefa r4 | anthropic/claude-haiku-5.5 | 1 | 1164 | 0 | 0 | 67 | $0.0001 | 0 | 0 | 0 |
| S3-T1/Pell | player r4 | anthropic/claude-opus-5.5 | 1 | 4 | 14087 | 1670 | 645 | $0.0241 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Pell r4 | anthropic/claude-haiku-5.5 | 1 | 1936 | 0 | 0 | 71 | $0.0002 | 0 | 0 | 0 |
| S3-T1 | relay r4 card | anthropic/claude-sonnet-5.5 | 1 | 1448 | 0 | 0 | 150 | $0.0044 | 0 | 0 | 0 |
| S3-T1/Pell | player r4 card 1 | anthropic/claude-opus-5.5 | 4 | 16 | 65630 | 1261 | 259 | $0.0247 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Pell r4 card | anthropic/claude-haiku-5.5 | 4 | 2070 | 0 | 0 | 243 | $0.0003 | 0 | 0 | 0 |
| S3-T1 | dm r4 onward | anthropic/claude-opus-5.5 | 2 | 6 | 84110 | 38609 | 6630 | $0.3425 | 0 | 0 | 0 |
| S3-T1 | dm r4 onward | anthropic/claude-haiku-5.5 | 2 | 4998 | 0 | 0 | 657 | $0.0008 | 0 | 0 | 0 |
| S3-T1/Bram | player r5 | openai/gpt-6.1-sol | 1 | 3 | 9126 | 471 | 68 | $0.0028 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Bram r5 | anthropic/claude-haiku-5.5 | 1 | 983 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| S3-T1 | dm r5 | anthropic/claude-opus-5.5 | 6 | 24 | 228732 | 159592 | 12080 | $1.0959 | 0 | 0 | 0 |
| S3-T1 | dm r5 | anthropic/claude-haiku-5.5 | 2 | 5999 | 0 | 0 | 1030 | $0.0011 | 0 | 0 | 0 |
| S3-T1 | relay r5 | anthropic/claude-sonnet-5.5 | 3 | 7480 | 0 | 0 | 2744 | $0.0424 | 0 | 0 | 0 |
| S3-T1/Sefa | player r5 | deepseek/deepseek-v4-pro-0813 | 1 | 768 | 9728 | 0 | 640 | $0.0036 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Sefa r5 | anthropic/claude-haiku-5.5 | 1 | 1211 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| S3-T1 | relay r5 card | anthropic/claude-sonnet-5.5 | 2 | 3154 | 0 | 0 | 964 | $0.0159 | 0 | 0 | 0 |
| S3-T1/Sefa | player r5 card 1 | deepseek/deepseek-v4-pro-0813 | 2 | 1154 | 21248 | 0 | 792 | $0.0057 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Sefa r5 card | anthropic/claude-haiku-5.5 | 3 | 3065 | 0 | 0 | 202 | $0.0004 | 0 | 0 | 0 |
| S3-T1 | dm r5 card prose | anthropic/claude-opus-5.5 | 1 | 20435 | 0 | 29318 | 957 | $0.3354 | 0 | 0 | 0 |
| S3-T1/Sefa | player r5 card 2 | deepseek/deepseek-v4-pro-0813 | 1 | 1043 | 11008 | 0 | 161 | $0.0029 | 0 | 0 | 0 |
| S3-T1 | dm r5 onward | anthropic/claude-opus-5.5 | 7 | 24 | 378656 | 97329 | 12032 | $0.8031 | 0 | 0 | 0 |
| S3-T1 | dm r5 onward | anthropic/claude-haiku-5.5 | 6 | 17945 | 0 | 0 | 3445 | $0.0035 | 0 | 0 | 0 |
| S3-T1/Pell | player r5 | anthropic/claude-opus-5.5 | 1 | 4 | 17018 | 689 | 890 | $0.0247 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Pell r5 | anthropic/claude-haiku-5.5 | 1 | 1472 | 0 | 0 | 81 | $0.0002 | 0 | 0 | 0 |
| S3-T1/Pell | player r5 card 1 | anthropic/claude-opus-5.5 | 2 | 8 | 36151 | 940 | 37 | $0.0127 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Pell r5 card | anthropic/claude-haiku-5.5 | 2 | 1102 | 0 | 0 | 122 | $0.0002 | 0 | 0 | 0 |
| S3-T1/Bram | player r6 | openai/gpt-6.1-sol | 1 | 3 | 9597 | 666 | 158 | $0.0042 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Bram r6 | anthropic/claude-haiku-5.5 | 1 | 1350 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| S3-T1 | dm r6 | anthropic/claude-opus-5.5 | 4 | 16 | 120453 | 183239 | 10274 | $1.1591 | 0 | 0 | 0 |
| S3-T1 | relay r6 card | anthropic/claude-sonnet-5.5 | 2 | 3668 | 0 | 0 | 1277 | $0.0201 | 0 | 0 | 0 |
| S3-T1 | relay r6 card (asked again) | anthropic/claude-sonnet-5.5 | 1 | 1347 | 0 | 0 | 335 | $0.0060 | 0 | 0 | 0 |
| S3-T1/Bram | player r6 card 1 | openai/gpt-6.1-sol | 2 | 6 | 20907 | 527 | 17 | $0.0036 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Bram r6 card | anthropic/claude-haiku-5.5 | 2 | 1216 | 0 | 0 | 120 | $0.0002 | 0 | 0 | 0 |
| S3-T1 | dm r6 onward | anthropic/claude-opus-5.5 | 6 | 20 | 336636 | 105794 | 13098 | $0.8583 | 0 | 0 | 0 |
| S3-T1 | dm r6 onward | anthropic/claude-haiku-5.5 | 5 | 13569 | 0 | 0 | 1507 | $0.0021 | 0 | 0 | 0 |
| S3-T1 | relay r6 | anthropic/claude-sonnet-5.5 | 3 | 7833 | 0 | 0 | 2312 | $0.0388 | 0 | 0 | 0 |
| S3-T1/Sefa | player r6 | deepseek/deepseek-v4-pro-0813 | 1 | 529 | 11776 | 0 | 831 | $0.0040 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Sefa r6 | anthropic/claude-haiku-5.5 | 1 | 886 | 0 | 0 | 63 | $0.0001 | 0 | 0 | 0 |
| S3-T1 | dm r6 | anthropic/claude-haiku-5.5 | 1 | 3114 | 0 | 0 | 393 | $0.0005 | 0 | 0 | 0 |
| S3-T1/Pell | player r6 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 20052 | 1052 | $0.1213 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Pell r6 | anthropic/claude-haiku-5.5 | 1 | 2279 | 0 | 0 | 76 | $0.0003 | 0 | 0 | 0 |
| S3-T1/Pell | player r6 card 1 | anthropic/claude-opus-5.5 | 2 | 8 | 41613 | 1689 | 104 | $0.0189 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Pell r6 card | anthropic/claude-haiku-5.5 | 2 | 1760 | 0 | 0 | 119 | $0.0002 | 0 | 0 | 0 |
| S3-T1/Bram | player r7 | openai/gpt-6.1-sol | 1 | 3 | 10790 | 487 | 161 | $0.0039 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Bram r7 | anthropic/claude-haiku-5.5 | 1 | 1199 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| S3-T1 | dm r7 | anthropic/claude-opus-5.5 | 6 | 24 | 224259 | 265206 | 24826 | $1.8814 | 0 | 0 | 0 |
| S3-T1 | dm r7 | anthropic/claude-haiku-5.5 | 2 | 7337 | 0 | 0 | 853 | $0.0012 | 0 | 0 | 0 |
| S3-T1 | relay r7 | anthropic/claude-sonnet-5.5 | 3 | 7124 | 0 | 0 | 3445 | $0.0487 | 0 | 0 | 0 |
| S3-T1/Sefa | player r7 | deepseek/deepseek-v4-pro-0813 | 1 | 1076 | 12032 | 0 | 587 | $0.0041 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Sefa r7 | anthropic/claude-haiku-5.5 | 1 | 1414 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| S3-T1/Pell | player r7 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 22290 | 886 | $0.1292 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Pell r7 | anthropic/claude-haiku-5.5 | 1 | 1317 | 0 | 0 | 74 | $0.0002 | 0 | 0 | 0 |
| S3-T1 | relay r7 card | anthropic/claude-sonnet-5.5 | 1 | 1542 | 0 | 0 | 294 | $0.0060 | 0 | 0 | 0 |
| S3-T1/Pell | player r7 card 1 | anthropic/claude-opus-5.5 | 2 | 8 | 45382 | 1007 | 27 | $0.0147 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Pell r7 card | anthropic/claude-haiku-5.5 | 2 | 1184 | 0 | 0 | 124 | $0.0002 | 0 | 0 | 0 |
| S3-T1 | dm r7 onward | anthropic/claude-opus-5.5 | 3 | 10 | 187117 | 60103 | 6536 | $0.4687 | 0 | 0 | 0 |
| S3-T1 | dm r7 onward | anthropic/claude-haiku-5.5 | 3 | 9239 | 0 | 0 | 2123 | $0.0020 | 0 | 0 | 0 |
| S3-T1/Bram | player r8 | openai/gpt-6.1-sol | 1 | 3 | 11277 | 994 | 127 | $0.0049 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Bram r8 | anthropic/claude-haiku-5.5 | 1 | 1725 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| S3-T1 | dm r8 | anthropic/claude-opus-5.5 | 7 | 28 | 347641 | 297624 | 20473 | $1.9805 | 0 | 0 | 0 |
| S3-T1 | dm r8 | anthropic/claude-haiku-5.5 | 4 | 13704 | 0 | 0 | 2163 | $0.0025 | 0 | 0 | 0 |
| S3-T1 | relay r8 | anthropic/claude-sonnet-5.5 | 3 | 6492 | 0 | 0 | 3230 | $0.0453 | 0 | 0 | 0 |
| S3-T1 | relay r8 (asked again) | anthropic/claude-sonnet-5.5 | 1 | 2150 | 0 | 0 | 1230 | $0.0166 | 0 | 0 | 0 |
| S3-T1/Sefa | player r8 | deepseek/deepseek-v4-pro-0813 | 1 | 1056 | 12800 | 0 | 382 | $0.0036 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Sefa r8 | anthropic/claude-haiku-5.5 | 1 | 1385 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| S3-T1/Sefa | player r8 card 1 | deepseek/deepseek-v4-pro-0813 | 4 | 1820 | 56064 | 0 | 1244 | $0.0112 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Sefa r8 card | anthropic/claude-haiku-5.5 | 6 | 4670 | 0 | 0 | 375 | $0.0007 | 0 | 0 | 0 |
| S3-T1 | dm r8 card prose | anthropic/claude-opus-5.5 | 2 | 55235 | 72092 | 13456 | 1746 | $0.3779 | 0 | 0 | 0 |
| S3-T1/Sefa | player r8 card 2 | deepseek/deepseek-v4-pro-0813 | 2 | 1624 | 29184 | 0 | 1837 | $0.0098 | 0 | 0 | 0 |
| S3-T1 | dm r8 card prose (with a press) | anthropic/claude-opus-5.5 | 1 | 27447 | 42774 | 0 | 282 | $0.1240 | 0 | 0 | 0 |
| S3-T1 | dm r8 onward | anthropic/claude-opus-5.5 | 3 | 10 | 196564 | 63111 | 8071 | $0.5163 | 0 | 0 | 0 |
| S3-T1 | dm r8 onward | anthropic/claude-haiku-5.5 | 2 | 4750 | 0 | 0 | 414 | $0.0007 | 0 | 0 | 0 |
| S3-T1/Pell | player r8 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 24454 | 1267 | $0.1476 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Pell r8 | anthropic/claude-haiku-5.5 | 1 | 2042 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| S3-T1/Bram | player r9 | openai/gpt-6.1-sol | 1 | 3 | 12271 | 946 | 88 | $0.0045 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Bram r9 | anthropic/claude-haiku-5.5 | 1 | 1643 | 0 | 0 | 62 | $0.0002 | 0 | 0 | 0 |
| S3-T1 | dm r9 | anthropic/claude-opus-5.5 | 4 | 16 | 160178 | 249111 | 9211 | $1.4744 | 0 | 0 | 0 |
| S3-T1 | relay r9 card | anthropic/claude-sonnet-5.5 | 2 | 2841 | 0 | 0 | 575 | $0.0114 | 0 | 0 | 0 |
| S3-T1/Bram | player r9 card 1 | openai/gpt-6.1-sol | 4 | 12 | 54128 | 684 | 56 | $0.0077 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Bram r9 card | anthropic/claude-haiku-5.5 | 4 | 2065 | 0 | 0 | 248 | $0.0003 | 0 | 0 | 0 |
| S3-T1 | dm r9 onward | anthropic/claude-opus-5.5 | 7 | 24 | 520408 | 146143 | 18429 | $1.2035 | 0 | 0 | 0 |
| S3-T1 | dm r9 onward | anthropic/claude-haiku-5.5 | 5 | 14731 | 0 | 0 | 2466 | $0.0027 | 0 | 0 | 0 |
| S3-T1 | relay r9 | anthropic/claude-sonnet-5.5 | 3 | 7165 | 0 | 0 | 2943 | $0.0438 | 0 | 0 | 0 |
| S3-T1/Sefa | player r9 | deepseek/deepseek-v4-pro-0813 | 1 | 864 | 15872 | 0 | 442 | $0.0039 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Sefa r9 | anthropic/claude-haiku-5.5 | 1 | 1592 | 0 | 0 | 79 | $0.0002 | 0 | 0 | 0 |
| S3-T1 | dm r9 | anthropic/claude-haiku-5.5 | 2 | 5217 | 0 | 0 | 460 | $0.0008 | 0 | 0 | 0 |
| S3-T1/Pell | player r9 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 25969 | 1061 | $0.1511 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Pell r9 | anthropic/claude-haiku-5.5 | 1 | 1822 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| S3-T1/Pell | player r9 card 1 | anthropic/claude-opus-5.5 | 3 | 12 | 79966 | 1328 | 359 | $0.0299 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Pell r9 card | anthropic/claude-haiku-5.5 | 3 | 1711 | 0 | 0 | 186 | $0.0003 | 0 | 0 | 0 |
| S3-T1/Bram | player r10 | openai/gpt-6.1-sol | 1 | 3 | 13901 | 549 | 144 | $0.0042 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Bram r10 | anthropic/claude-haiku-5.5 | 1 | 1225 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| S3-T1 | dm r10 | anthropic/claude-opus-5.5 | 5 | 20 | 194268 | 337779 | 20749 | $2.1549 | 0 | 0 | 0 |
| S3-T1 | dm r10 | anthropic/claude-haiku-5.5 | 3 | 8644 | 0 | 0 | 1021 | $0.0014 | 0 | 0 | 0 |
| S3-T1 | relay r10 | anthropic/claude-sonnet-5.5 | 3 | 7892 | 0 | 0 | 2525 | $0.0410 | 0 | 0 | 0 |
| S3-T1/Sefa | player r10 | deepseek/deepseek-v4-pro-0813 | 1 | 1038 | 16640 | 0 | 344 | $0.0039 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Sefa r10 | anthropic/claude-haiku-5.5 | 1 | 1581 | 0 | 0 | 84 | $0.0002 | 0 | 0 | 0 |
| S3-T1/Pell | player r10 | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 28327 | 1191 | $0.1655 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Pell r10 | anthropic/claude-haiku-5.5 | 1 | 1977 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| S3-T1 | relay r10 card | anthropic/claude-sonnet-5.5 | 1 | 2581 | 0 | 0 | 1108 | $0.0162 | 0 | 0 | 0 |
| S3-T1/Pell | player r10 card 1 | anthropic/claude-opus-5.5 | 2 | 8 | 58427 | 1976 | 25 | $0.0221 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Pell r10 card | anthropic/claude-haiku-5.5 | 2 | 1974 | 0 | 0 | 116 | $0.0003 | 0 | 0 | 0 |
| S3-T1 | dm r10 onward | anthropic/claude-opus-5.5 | 2 | 6 | 139982 | 73495 | 6352 | $0.5225 | 0 | 0 | 0 |
| S3-T1 | dm r10 onward | anthropic/claude-haiku-5.5 | 2 | 6384 | 0 | 0 | 677 | $0.0010 | 0 | 0 | 0 |
| S3-T1/Bram | player r11 | openai/gpt-6.1-sol | 1 | 3 | 14450 | 634 | 79 | $0.0038 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Bram r11 | anthropic/claude-haiku-5.5 | 1 | 1208 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| S3-T1 | dm r11 | anthropic/claude-opus-5.5 | 3 | 12 | 129660 | 198401 | 9250 | $1.2128 | 0 | 0 | 0 |
| S3-T1 | dm r11 | anthropic/claude-haiku-5.5 | 1 | 3323 | 0 | 0 | 312 | $0.0005 | 0 | 0 | 0 |
| S3-T1 | relay r11 | anthropic/claude-sonnet-5.5 | 1 | 1683 | 0 | 0 | 812 | $0.0115 | 0 | 0 | 0 |
| S3-T1/Sefa | player r11 | deepseek/deepseek-v4-pro-0813 | 1 | 1120 | 17408 | 0 | 450 | $0.0044 | 0 | 0 | 0 |
| S3-T1/check | check S3-T1 Sefa r11 | anthropic/claude-haiku-5.5 | 1 | 1610 | 0 | 0 | 82 | $0.0002 | 0 | 0 | 0 |
| S3-T1/score/r1 | round r1 1 | anthropic/claude-haiku-5.5 | 1 | 3475 | 0 | 0 | 1471 | $0.0011 | 0 | 0 | 0 |
| S3-T1/score/r1 | round r1 2 | anthropic/claude-haiku-5.5 | 1 | 3475 | 0 | 0 | 1487 | $0.0011 | 0 | 0 | 0 |
| S3-T1/score/r1 | round r1 referee | anthropic/claude-opus-5.5 | 1 | 3475 | 0 | 0 | 652 | $0.0269 | 0 | 0 | 0 |
| S3-T1/score/r1 | hold r1 1 | anthropic/claude-haiku-5.5 | 1 | 3699 | 0 | 0 | 331 | $0.0005 | 0 | 0 | 0 |
| S3-T1/score/r1 | hold r1 2 | anthropic/claude-haiku-5.5 | 1 | 3699 | 0 | 0 | 330 | $0.0005 | 0 | 0 | 0 |
| S3-T1/score/r2 | round r2 1 | anthropic/claude-haiku-5.5 | 1 | 4021 | 0 | 0 | 2103 | $0.0015 | 0 | 0 | 0 |
| S3-T1/score/r2 | round r2 2 | anthropic/claude-haiku-5.5 | 1 | 4021 | 0 | 0 | 2061 | $0.0014 | 0 | 0 | 0 |
| S3-T1/score/r2 | round r2 referee | anthropic/claude-opus-5.5 | 1 | 4021 | 0 | 0 | 984 | $0.0358 | 0 | 0 | 0 |
| S3-T1/score/r2 | hold r2 1 | anthropic/claude-haiku-5.5 | 1 | 4245 | 0 | 0 | 439 | $0.0006 | 0 | 0 | 0 |
| S3-T1/score/r2 | hold r2 2 | anthropic/claude-haiku-5.5 | 1 | 4245 | 0 | 0 | 360 | $0.0006 | 0 | 0 | 0 |
| S3-T1/score/r2 | hold r2 referee | anthropic/claude-opus-5.5 | 1 | 4245 | 0 | 0 | 56 | $0.0181 | 0 | 1 | 0 |
| S3-T1/score/r3 | round r3 1 | anthropic/claude-haiku-5.5 | 1 | 4293 | 0 | 0 | 1797 | $0.0013 | 0 | 0 | 0 |
| S3-T1/score/r3 | round r3 2 | anthropic/claude-haiku-5.5 | 1 | 4293 | 0 | 0 | 1546 | $0.0012 | 0 | 0 | 0 |
| S3-T1/score/r3 | round r3 referee | anthropic/claude-opus-5.5 | 1 | 4293 | 0 | 0 | 312 | $0.0234 | 0 | 1 | 0 |
| S3-T1/score/r4 | round r4 1 | anthropic/claude-haiku-5.5 | 1 | 4665 | 0 | 0 | 1193 | $0.0011 | 0 | 0 | 0 |
| S3-T1/score/r4 | round r4 2 | anthropic/claude-haiku-5.5 | 1 | 4665 | 0 | 0 | 973 | $0.0010 | 0 | 0 | 0 |
| S3-T1/score/r4 | round r4 referee | anthropic/claude-opus-5.5 | 1 | 4665 | 0 | 0 | 50 | $0.0197 | 0 | 1 | 0 |
