# Game party 2 — the OpenRouter ledger

Cap $60; spent before this run $0.0000; this run $4.9110; total $4.9110; 731 calls.

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
