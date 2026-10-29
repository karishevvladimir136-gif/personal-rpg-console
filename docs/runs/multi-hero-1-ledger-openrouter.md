# Multi-hero 1 — the dry run on Haiku — the OpenRouter ledger

Cap $5; spent before this run $0.0000; this run $0.8660; total $0.8660; 292 calls.

| Session | Purpose | Model | Calls | Input (uncached) | Cache read | Cache write | Output | USD | Errors | Refusals | 429 waits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| freeze SAND | wizard | anthropic/claude-haiku-5.5 | 6 | 20603 | 1567 | 3134 | 25473 | $0.0152 | 0 | 0 | 0 |
| freeze GOAL | wizard | anthropic/claude-haiku-5.5 | 6 | 20475 | 4701 | 0 | 25015 | $0.0146 | 0 | 0 | 0 |
| freeze DUNGEON | wizard | anthropic/claude-haiku-5.5 | 6 | 20583 | 4701 | 0 | 23476 | $0.0138 | 0 | 0 | 0 |
| freeze GOAL | prep | anthropic/claude-haiku-5.5 | 2 | 11654 | 0 | 35114 | 41987 | $0.0292 | 0 | 0 | 0 |
| freeze DUNGEON | prep | anthropic/claude-haiku-5.5 | 2 | 12050 | 17626 | 17560 | 41132 | $0.0255 | 0 | 0 | 0 |
| A8 | A8 GOAL 1 | anthropic/claude-haiku-5.5 | 2 | 16036 | 0 | 0 | 4883 | $0.0040 | 0 | 0 | 0 |
| A8 | A8 GOAL 2 | anthropic/claude-haiku-5.5 | 2 | 16036 | 0 | 0 | 4771 | $0.0040 | 0 | 0 | 0 |
| A8 | A8 DUNGEON 1 | anthropic/claude-haiku-5.5 | 2 | 15920 | 0 | 0 | 5598 | $0.0044 | 0 | 0 | 0 |
| A8 | A8 DUNGEON 2 | anthropic/claude-haiku-5.5 | 2 | 15920 | 0 | 0 | 5431 | $0.0043 | 0 | 0 | 0 |
| SAND-haiku | relay opening | anthropic/claude-haiku-5.5 | 1 | 1189 | 0 | 0 | 1279 | $0.0008 | 0 | 0 | 0 |
| SAND-haiku/Bram | player r1 | anthropic/claude-haiku-5.5 | 1 | 4 | 0 | 10511 | 735 | $0.0017 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Bram r1 | anthropic/claude-haiku-5.5 | 1 | 1557 | 0 | 0 | 76 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku/Sefa | player r1 | anthropic/claude-haiku-5.5 | 1 | 4 | 0 | 10904 | 538 | $0.0016 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Sefa r1 | anthropic/claude-haiku-5.5 | 1 | 1740 | 0 | 0 | 61 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku/Pell | player r1 | anthropic/claude-haiku-5.5 | 1 | 4 | 0 | 10599 | 470 | $0.0016 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Pell r1 | anthropic/claude-haiku-5.5 | 1 | 1456 | 0 | 0 | 59 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku | dm r1 | anthropic/claude-haiku-5.5 | 5 | 5110 | 42352 | 86381 | 9793 | $0.0197 | 0 | 0 | 0 |
| SAND-haiku | relay r1 | anthropic/claude-haiku-5.5 | 1 | 2281 | 0 | 0 | 4216 | $0.0023 | 0 | 0 | 0 |
| SAND-haiku | relay r1 (retold) | anthropic/claude-haiku-5.5 | 1 | 2517 | 0 | 0 | 4420 | $0.0025 | 0 | 0 | 0 |
| SAND-haiku/Sefa | player r2 | anthropic/claude-haiku-5.5 | 1 | 4 | 10904 | 1287 | 739 | $0.0006 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Sefa r2 | anthropic/claude-haiku-5.5 | 1 | 1701 | 0 | 0 | 71 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku/check | check referee SAND-haiku Sefa r2 | anthropic/claude-haiku-5.5 | 1 | 1701 | 0 | 0 | 62 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku/Pell | player r2 | anthropic/claude-haiku-5.5 | 1 | 4 | 10599 | 1144 | 902 | $0.0007 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Pell r2 | anthropic/claude-haiku-5.5 | 1 | 1748 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku/Bram | player r2 | anthropic/claude-haiku-5.5 | 1 | 4 | 10511 | 1065 | 981 | $0.0007 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Bram r2 | anthropic/claude-haiku-5.5 | 1 | 1562 | 0 | 0 | 62 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku | dm r2 | anthropic/claude-haiku-5.5 | 4 | 2590 | 83818 | 40525 | 12485 | $0.0125 | 0 | 0 | 0 |
| SAND-haiku | relay r2 | anthropic/claude-haiku-5.5 | 1 | 2781 | 0 | 0 | 4890 | $0.0027 | 0 | 0 | 0 |
| SAND-haiku | relay r2 (retold) | anthropic/claude-haiku-5.5 | 1 | 2943 | 0 | 0 | 3579 | $0.0021 | 0 | 0 | 0 |
| SAND-haiku/Pell | player r3 | anthropic/claude-haiku-5.5 | 1 | 4 | 11743 | 993 | 776 | $0.0006 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Pell r3 | anthropic/claude-haiku-5.5 | 1 | 1211 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku/Bram | player r3 | anthropic/claude-haiku-5.5 | 1 | 4 | 11576 | 1100 | 658 | $0.0006 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Bram r3 | anthropic/claude-haiku-5.5 | 1 | 1288 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku/Sefa | player r3 | anthropic/claude-haiku-5.5 | 1 | 4 | 12191 | 1012 | 679 | $0.0006 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Sefa r3 | anthropic/claude-haiku-5.5 | 1 | 1343 | 0 | 0 | 77 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku | dm r3 | anthropic/claude-haiku-5.5 | 6 | 5177 | 140362 | 57397 | 9566 | $0.0140 | 0 | 0 | 0 |
| SAND-haiku | relay r3 | anthropic/claude-haiku-5.5 | 1 | 2624 | 0 | 0 | 4738 | $0.0026 | 0 | 0 | 0 |
| SAND-haiku | relay r3 (retold) | anthropic/claude-haiku-5.5 | 1 | 2785 | 0 | 0 | 4146 | $0.0024 | 0 | 0 | 0 |
| SAND-haiku/Bram | player r4 | anthropic/claude-haiku-5.5 | 1 | 4 | 12676 | 1093 | 792 | $0.0007 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Bram r4 | anthropic/claude-haiku-5.5 | 1 | 1488 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku/Sefa | player r4 | anthropic/claude-haiku-5.5 | 1 | 4 | 13203 | 1095 | 745 | $0.0006 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Sefa r4 | anthropic/claude-haiku-5.5 | 1 | 1393 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku/Pell | player r4 | anthropic/claude-haiku-5.5 | 1 | 4 | 12736 | 1078 | 967 | $0.0007 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Pell r4 | anthropic/claude-haiku-5.5 | 1 | 1589 | 0 | 0 | 77 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku | dm r4 | anthropic/claude-haiku-5.5 | 4 | 2559 | 86064 | 50412 | 12529 | $0.0138 | 0 | 0 | 0 |
| SAND-haiku | relay r4 | anthropic/claude-haiku-5.5 | 1 | 2759 | 0 | 0 | 2867 | $0.0017 | 0 | 0 | 0 |
| SAND-haiku | relay r4 (asked again) | anthropic/claude-haiku-5.5 | 1 | 2759 | 0 | 0 | 4321 | $0.0024 | 0 | 0 | 0 |
| SAND-haiku | relay r4 (retold) | anthropic/claude-haiku-5.5 | 1 | 2957 | 0 | 0 | 4397 | $0.0025 | 0 | 0 | 0 |
| SAND-haiku/Sefa | player r5 | anthropic/claude-haiku-5.5 | 1 | 4 | 14298 | 1208 | 735 | $0.0007 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Sefa r5 | anthropic/claude-haiku-5.5 | 1 | 1525 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku/Pell | player r5 | anthropic/claude-haiku-5.5 | 1 | 4 | 13814 | 1242 | 361 | $0.0005 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Pell r5 | anthropic/claude-haiku-5.5 | 1 | 1344 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku/Bram | player r5 | anthropic/claude-haiku-5.5 | 1 | 4 | 13769 | 1160 | 740 | $0.0007 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Bram r5 | anthropic/claude-haiku-5.5 | 1 | 1461 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku | dm r5 | anthropic/claude-haiku-5.5 | 1 | 4 | 24093 | 29031 | 4425 | $0.0062 | 0 | 0 | 0 |
| SAND-haiku | relay r5 card | anthropic/claude-haiku-5.5 | 1 | 2152 | 0 | 0 | 1954 | $0.0012 | 0 | 0 | 0 |
| SAND-haiku | relay r5 card (retold) | anthropic/claude-haiku-5.5 | 1 | 2279 | 0 | 0 | 3120 | $0.0018 | 0 | 0 | 0 |
| SAND-haiku/Sefa | player r5 card 1 | anthropic/claude-haiku-5.5 | 2 | 8 | 32232 | 1667 | 761 | $0.0009 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Sefa r5 card | anthropic/claude-haiku-5.5 | 3 | 2930 | 0 | 0 | 217 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku | dm r5 card prose (with a press) | anthropic/claude-haiku-5.5 | 1 | 16310 | 0 | 25154 | 587 | $0.0070 | 0 | 0 | 0 |
| SAND-haiku | dm r5 card prose | anthropic/claude-haiku-5.5 | 1 | 16943 | 25154 | 0 | 1336 | $0.0026 | 0 | 0 | 0 |
| SAND-haiku/Sefa | player r5 card 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 17173 | 719 | 333 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku | dm r5 onward | anthropic/claude-haiku-5.5 | 5 | 5261 | 124647 | 45938 | 17656 | $0.0163 | 0 | 0 | 0 |
| SAND-haiku | relay r5 | anthropic/claude-haiku-5.5 | 1 | 3544 | 0 | 0 | 5180 | $0.0029 | 0 | 0 | 0 |
| SAND-haiku | relay r5 (asked again) | anthropic/claude-haiku-5.5 | 1 | 3544 | 0 | 0 | 4875 | $0.0028 | 0 | 0 | 0 |
| SAND-haiku | relay r5 (retold) | anthropic/claude-haiku-5.5 | 1 | 3666 | 0 | 0 | 4863 | $0.0028 | 0 | 0 | 0 |
| SAND-haiku/Sefa | player r6 | anthropic/claude-haiku-5.5 | 1 | 4 | 17892 | 609 | 569 | $0.0005 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Sefa r6 | anthropic/claude-haiku-5.5 | 1 | 1253 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku/Bram | player r6 | anthropic/claude-haiku-5.5 | 1 | 4 | 14929 | 879 | 353 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Bram r6 | anthropic/claude-haiku-5.5 | 1 | 1130 | 0 | 0 | 72 | $0.0001 | 0 | 0 | 0 |
| SAND-haiku | dm r6 | anthropic/claude-haiku-5.5 | 4 | 2741 | 75221 | 95289 | 11457 | $0.0189 | 0 | 0 | 0 |
| SAND-haiku | relay r6 | anthropic/claude-haiku-5.5 | 2 | 4491 | 0 | 0 | 5964 | $0.0034 | 0 | 0 | 0 |
| SAND-haiku | relay r6 (retold) | anthropic/claude-haiku-5.5 | 1 | 2341 | 0 | 0 | 3629 | $0.0020 | 0 | 0 | 0 |
| SAND-haiku/Pell | player r6 | anthropic/claude-haiku-5.5 | 1 | 4 | 0 | 15654 | 615 | $0.0023 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Pell r6 | anthropic/claude-haiku-5.5 | 1 | 831 | 0 | 0 | 73 | $0.0001 | 0 | 0 | 0 |
| SAND-haiku | relay r6 card | anthropic/claude-haiku-5.5 | 2 | 3165 | 0 | 0 | 1719 | $0.0012 | 0 | 0 | 0 |
| SAND-haiku/Pell | player r6 card 1 | anthropic/claude-haiku-5.5 | 6 | 24 | 99443 | 2373 | 2489 | $0.0025 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Pell r6 card | anthropic/claude-haiku-5.5 | 6 | 4349 | 0 | 0 | 363 | $0.0006 | 0 | 0 | 0 |
| SAND-haiku | dm r6 card prose (with a press) | anthropic/claude-haiku-5.5 | 4 | 77271 | 110528 | 3304 | 5569 | $0.0123 | 0 | 0 | 0 |
| SAND-haiku | dm r6 onward | anthropic/claude-haiku-5.5 | 8 | 6514 | 257030 | 37610 | 10504 | $0.0132 | 0 | 0 | 0 |
| SAND-haiku/Bram | after 1 | anthropic/claude-haiku-5.5 | 1 | 4 | 15808 | 1062 | 542 | $0.0006 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Bram after 1 | anthropic/claude-haiku-5.5 | 1 | 546 | 0 | 0 | 68 | $0.0001 | 0 | 0 | 0 |
| SAND-haiku/Bram | after 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 16870 | 241 | 437 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Bram after 2 | anthropic/claude-haiku-5.5 | 1 | 579 | 0 | 0 | 84 | $0.0001 | 0 | 0 | 0 |
| SAND-haiku/Bram | after 3 | anthropic/claude-haiku-5.5 | 1 | 4 | 17111 | 261 | 339 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Bram after 3 | anthropic/claude-haiku-5.5 | 1 | 447 | 0 | 0 | 56 | $0.0001 | 0 | 0 | 0 |
| SAND-haiku/Sefa | after 1 | anthropic/claude-haiku-5.5 | 1 | 4 | 18501 | 1153 | 627 | $0.0006 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Sefa after 1 | anthropic/claude-haiku-5.5 | 1 | 668 | 0 | 0 | 75 | $0.0001 | 0 | 0 | 0 |
| SAND-haiku/Sefa | after 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 19654 | 363 | 460 | $0.0005 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Sefa after 2 | anthropic/claude-haiku-5.5 | 1 | 611 | 0 | 0 | 81 | $0.0001 | 0 | 0 | 0 |
| SAND-haiku/Sefa | after 3 | anthropic/claude-haiku-5.5 | 1 | 4 | 20017 | 293 | 609 | $0.0005 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Sefa after 3 | anthropic/claude-haiku-5.5 | 1 | 545 | 0 | 0 | 70 | $0.0001 | 0 | 0 | 0 |
| SAND-haiku/Pell | after 1 | anthropic/claude-haiku-5.5 | 1 | 4 | 18027 | 508 | 729 | $0.0006 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Pell after 1 | anthropic/claude-haiku-5.5 | 1 | 698 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| SAND-haiku/Pell | after 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 18535 | 393 | 512 | $0.0005 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Pell after 2 | anthropic/claude-haiku-5.5 | 1 | 604 | 0 | 0 | 72 | $0.0001 | 0 | 0 | 0 |
| SAND-haiku/Pell | after 3 | anthropic/claude-haiku-5.5 | 1 | 4 | 18928 | 286 | 261 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Pell after 3 | anthropic/claude-haiku-5.5 | 1 | 450 | 0 | 0 | 52 | $0.0001 | 0 | 0 | 0 |
| SAND-haiku/initiative | initiative r1 1 | anthropic/claude-haiku-5.5 | 1 | 1803 | 0 | 0 | 117 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku/initiative | initiative r1 2 | anthropic/claude-haiku-5.5 | 1 | 1803 | 0 | 0 | 61 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku/initiative | initiative r2 1 | anthropic/claude-haiku-5.5 | 1 | 2303 | 0 | 0 | 63 | $0.0003 | 0 | 0 | 0 |
| SAND-haiku/initiative | initiative r2 2 | anthropic/claude-haiku-5.5 | 1 | 2303 | 0 | 0 | 62 | $0.0003 | 0 | 0 | 0 |
| SAND-haiku/initiative | initiative r3 1 | anthropic/claude-haiku-5.5 | 1 | 2146 | 0 | 0 | 364 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku/initiative | initiative r3 2 | anthropic/claude-haiku-5.5 | 1 | 2146 | 0 | 0 | 398 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku/initiative | initiative r4 1 | anthropic/claude-haiku-5.5 | 1 | 2281 | 0 | 0 | 83 | $0.0003 | 0 | 0 | 0 |
| SAND-haiku/initiative | initiative r4 2 | anthropic/claude-haiku-5.5 | 1 | 2281 | 0 | 0 | 211 | $0.0003 | 0 | 0 | 0 |
| SAND-haiku/initiative | initiative r5 1 | anthropic/claude-haiku-5.5 | 1 | 2370 | 0 | 0 | 396 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku/initiative | initiative r5 2 | anthropic/claude-haiku-5.5 | 1 | 2370 | 0 | 0 | 300 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku/initiative | initiative r6 1 | anthropic/claude-haiku-5.5 | 1 | 2619 | 0 | 0 | 462 | $0.0005 | 0 | 0 | 0 |
| SAND-haiku/initiative | initiative r6 2 | anthropic/claude-haiku-5.5 | 1 | 2619 | 0 | 0 | 532 | $0.0005 | 0 | 0 | 0 |
| SAND-haiku-dry2 | relay opening | anthropic/claude-sonnet-5.5 | 1 | 1198 | 0 | 0 | 1014 | $0.0125 | 0 | 0 | 0 |
| SAND-haiku-dry2/Bram | player r1 | anthropic/claude-haiku-5.5 | 1 | 4 | 0 | 10611 | 433 | $0.0015 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Bram r1 | anthropic/claude-haiku-5.5 | 1 | 1581 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku-dry2/Sefa | player r1 | anthropic/claude-haiku-5.5 | 1 | 4 | 0 | 11003 | 619 | $0.0017 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Sefa r1 | anthropic/claude-haiku-5.5 | 1 | 1775 | 0 | 0 | 54 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku-dry2/Pell | player r1 | anthropic/claude-haiku-5.5 | 1 | 4 | 0 | 10717 | 677 | $0.0017 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Pell r1 | anthropic/claude-haiku-5.5 | 1 | 1812 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku-dry2 | dm r1 | anthropic/claude-haiku-5.5 | 6 | 4113 | 81720 | 89540 | 8873 | $0.0199 | 0 | 0 | 0 |
| SAND-haiku-dry2 | relay r1 | anthropic/claude-sonnet-5.5 | 1 | 2329 | 0 | 0 | 2223 | $0.0269 | 0 | 0 | 0 |
| SAND-haiku-dry2 | relay r1 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3149 | 0 | 0 | 661 | $0.0129 | 0 | 0 | 0 |
| SAND-haiku-dry2 | relay r1 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3244 | 0 | 0 | 735 | $0.0138 | 0 | 0 | 0 |
| SAND-haiku-dry2 | relay r1 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3170 | 0 | 0 | 679 | $0.0131 | 0 | 0 | 0 |
| SAND-haiku-dry2/Sefa | player r2 | anthropic/claude-haiku-5.5 | 1 | 4 | 11003 | 1023 | 368 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Sefa r2 | anthropic/claude-haiku-5.5 | 1 | 1462 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku-dry2/Pell | player r2 | anthropic/claude-haiku-5.5 | 1 | 4 | 10717 | 1151 | 487 | $0.0005 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Pell r2 | anthropic/claude-haiku-5.5 | 1 | 1529 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku-dry2/Bram | player r2 | anthropic/claude-haiku-5.5 | 1 | 4 | 10611 | 928 | 310 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Bram r2 | anthropic/claude-haiku-5.5 | 1 | 1333 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku-dry2 | dm r2 | anthropic/claude-haiku-5.5 | 4 | 2594 | 87603 | 56641 | 12099 | $0.0144 | 0 | 0 | 0 |
| SAND-haiku-dry2 | relay r2 | anthropic/claude-sonnet-5.5 | 1 | 2597 | 0 | 0 | 2705 | $0.0322 | 0 | 0 | 0 |
| SAND-haiku-dry2 | relay r2 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3554 | 0 | 0 | 799 | $0.0151 | 0 | 0 | 0 |
| SAND-haiku-dry2 | relay r2 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3626 | 0 | 0 | 875 | $0.0160 | 0 | 0 | 0 |
| SAND-haiku-dry2 | relay r2 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3709 | 0 | 0 | 923 | $0.0166 | 0 | 0 | 0 |
| SAND-haiku-dry2/Pell | player r3 | anthropic/claude-haiku-5.5 | 1 | 4 | 11868 | 1396 | 945 | $0.0008 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Pell r3 | anthropic/claude-haiku-5.5 | 1 | 1635 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku-dry2/Bram | player r3 | anthropic/claude-haiku-5.5 | 1 | 4 | 11539 | 1277 | 348 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Bram r3 | anthropic/claude-haiku-5.5 | 1 | 1630 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku-dry2/Sefa | player r3 | anthropic/claude-haiku-5.5 | 1 | 4 | 12026 | 1226 | 893 | $0.0007 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Sefa r3 | anthropic/claude-haiku-5.5 | 1 | 1557 | 0 | 0 | 80 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku-dry2 | dm r3 | anthropic/claude-haiku-5.5 | 4 | 2669 | 87878 | 57433 | 12610 | $0.0148 | 0 | 0 | 0 |
| SAND-haiku-dry2 | relay r3 | anthropic/claude-sonnet-5.5 | 1 | 2693 | 0 | 0 | 2604 | $0.0314 | 0 | 0 | 0 |
| SAND-haiku-dry2 | relay r3 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3686 | 0 | 0 | 834 | $0.0157 | 0 | 0 | 0 |
| SAND-haiku-dry2 | relay r3 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3555 | 0 | 0 | 724 | $0.0143 | 0 | 0 | 0 |
| SAND-haiku-dry2 | relay r3 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3791 | 0 | 0 | 918 | $0.0168 | 0 | 0 | 0 |
| SAND-haiku-dry2/Bram | player r4 | anthropic/claude-haiku-5.5 | 1 | 4 | 12816 | 1070 | 378 | $0.0005 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Bram r4 | anthropic/claude-haiku-5.5 | 1 | 1415 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku-dry2/Sefa | player r4 | anthropic/claude-haiku-5.5 | 1 | 4 | 13252 | 1309 | 625 | $0.0006 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Sefa r4 | anthropic/claude-haiku-5.5 | 1 | 1639 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku-dry2/Pell | player r4 | anthropic/claude-haiku-5.5 | 1 | 4 | 13264 | 1249 | 520 | $0.0005 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Pell r4 | anthropic/claude-haiku-5.5 | 1 | 1673 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku-dry2 | dm r4 | anthropic/claude-haiku-5.5 | 6 | 4333 | 129530 | 52218 | 13333 | $0.0151 | 0 | 0 | 0 |
| SAND-haiku-dry2 | relay r4 | anthropic/claude-sonnet-5.5 | 1 | 2998 | 0 | 0 | 2447 | $0.0305 | 0 | 0 | 0 |
| SAND-haiku-dry2 | relay r4 (asked again) | anthropic/claude-sonnet-5.5 | 1 | 2998 | 0 | 0 | 1917 | $0.0252 | 0 | 0 | 0 |
| SAND-haiku-dry2 | relay r4 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3729 | 0 | 0 | 575 | $0.0132 | 0 | 0 | 0 |
| SAND-haiku-dry2 | relay r4 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3829 | 0 | 0 | 707 | $0.0147 | 0 | 0 | 0 |
| SAND-haiku-dry2/Sefa | player r5 | anthropic/claude-haiku-5.5 | 1 | 4 | 14561 | 932 | 603 | $0.0006 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Sefa r5 | anthropic/claude-haiku-5.5 | 1 | 1176 | 0 | 0 | 81 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku-dry2/Pell | player r5 | anthropic/claude-haiku-5.5 | 1 | 4 | 14513 | 1239 | 333 | $0.0005 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Pell r5 | anthropic/claude-haiku-5.5 | 1 | 1367 | 0 | 0 | 74 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku-dry2/Bram | player r5 | anthropic/claude-haiku-5.5 | 1 | 4 | 13886 | 968 | 270 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Bram r5 | anthropic/claude-haiku-5.5 | 1 | 1175 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku-dry2 | dm r5 | anthropic/claude-haiku-5.5 | 3 | 2622 | 45473 | 55423 | 8933 | $0.0123 | 0 | 0 | 0 |
| SAND-haiku-dry2 | relay r5 | anthropic/claude-sonnet-5.5 | 1 | 2295 | 0 | 0 | 2589 | $0.0305 | 0 | 0 | 0 |
| SAND-haiku-dry2 | relay r5 (Bram's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3271 | 0 | 0 | 824 | $0.0148 | 0 | 0 | 0 |
| SAND-haiku-dry2/Pell | player r6 | anthropic/claude-haiku-5.5 | 1 | 4 | 15752 | 1129 | 722 | $0.0007 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Pell r6 | anthropic/claude-haiku-5.5 | 1 | 1505 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku-dry2/Bram | player r6 | anthropic/claude-haiku-5.5 | 1 | 4 | 14854 | 1100 | 662 | $0.0006 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Bram r6 | anthropic/claude-haiku-5.5 | 1 | 1445 | 0 | 0 | 84 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku-dry2/Sefa | player r6 | anthropic/claude-haiku-5.5 | 1 | 4 | 15493 | 1172 | 681 | $0.0006 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Sefa r6 | anthropic/claude-haiku-5.5 | 1 | 1557 | 0 | 0 | 87 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku-dry2 | dm r6 | anthropic/claude-haiku-5.5 | 3 | 2612 | 47568 | 56002 | 12493 | $0.0141 | 0 | 0 | 0 |
| SAND-haiku-dry2 | relay r6 | anthropic/claude-sonnet-5.5 | 1 | 2668 | 0 | 0 | 2316 | $0.0285 | 0 | 0 | 0 |
| SAND-haiku-dry2 | relay r6 (Pell's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3589 | 0 | 0 | 749 | $0.0147 | 0 | 0 | 0 |
| SAND-haiku-dry2 | relay r6 (Sefa's screen, retold) | anthropic/claude-sonnet-5.5 | 1 | 3620 | 0 | 0 | 787 | $0.0151 | 0 | 0 | 0 |
| SAND-haiku-dry2/Bram | after 1 | anthropic/claude-haiku-5.5 | 1 | 4 | 15954 | 988 | 412 | $0.0005 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Bram after 1 | anthropic/claude-haiku-5.5 | 1 | 504 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| SAND-haiku-dry2/Bram | after 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 16942 | 199 | 479 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Bram after 2 | anthropic/claude-haiku-5.5 | 1 | 637 | 0 | 0 | 70 | $0.0001 | 0 | 0 | 0 |
| SAND-haiku-dry2/Bram | after 3 | anthropic/claude-haiku-5.5 | 1 | 4 | 17141 | 319 | 497 | $0.0005 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Bram after 3 | anthropic/claude-haiku-5.5 | 1 | 650 | 0 | 0 | 64 | $0.0001 | 0 | 0 | 0 |
| SAND-haiku-dry2/Sefa | after 1 | anthropic/claude-haiku-5.5 | 1 | 4 | 16665 | 1211 | 522 | $0.0006 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Sefa after 1 | anthropic/claude-haiku-5.5 | 1 | 656 | 0 | 0 | 78 | $0.0001 | 0 | 0 | 0 |
| SAND-haiku-dry2/Sefa | after 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 17876 | 351 | 438 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Sefa after 2 | anthropic/claude-haiku-5.5 | 1 | 543 | 0 | 0 | 65 | $0.0001 | 0 | 0 | 0 |
| SAND-haiku-dry2/Sefa | after 3 | anthropic/claude-haiku-5.5 | 1 | 4 | 18227 | 225 | 302 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Sefa after 3 | anthropic/claude-haiku-5.5 | 1 | 487 | 0 | 0 | 52 | $0.0001 | 0 | 0 | 0 |
| SAND-haiku-dry2/Pell | after 1 | anthropic/claude-haiku-5.5 | 1 | 4 | 16881 | 1165 | 524 | $0.0006 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Pell after 1 | anthropic/claude-haiku-5.5 | 1 | 672 | 0 | 0 | 84 | $0.0001 | 0 | 0 | 0 |
| SAND-haiku-dry2/Pell | after 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 18046 | 367 | 546 | $0.0005 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Pell after 2 | anthropic/claude-haiku-5.5 | 1 | 620 | 0 | 0 | 69 | $0.0001 | 0 | 0 | 0 |
| SAND-haiku-dry2/Pell | after 3 | anthropic/claude-haiku-5.5 | 1 | 4 | 18413 | 302 | 443 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku-dry2/check | check SAND-haiku-dry2 Pell after 3 | anthropic/claude-haiku-5.5 | 1 | 559 | 0 | 0 | 62 | $0.0001 | 0 | 0 | 0 |
| SAND-haiku-dry2/initiative | initiative r1 1 | anthropic/claude-haiku-5.5 | 1 | 1851 | 0 | 0 | 199 | $0.0003 | 0 | 0 | 0 |
| SAND-haiku-dry2/initiative | initiative r1 2 | anthropic/claude-haiku-5.5 | 1 | 1851 | 0 | 0 | 235 | $0.0003 | 0 | 0 | 0 |
| SAND-haiku-dry2/initiative | initiative r2 1 | anthropic/claude-haiku-5.5 | 1 | 2119 | 0 | 0 | 119 | $0.0003 | 0 | 0 | 0 |
| SAND-haiku-dry2/initiative | initiative r2 2 | anthropic/claude-haiku-5.5 | 1 | 2119 | 0 | 0 | 157 | $0.0003 | 0 | 0 | 0 |
| SAND-haiku-dry2/initiative | initiative r3 1 | anthropic/claude-haiku-5.5 | 1 | 2215 | 0 | 0 | 240 | $0.0003 | 0 | 0 | 0 |
| SAND-haiku-dry2/initiative | initiative r3 2 | anthropic/claude-haiku-5.5 | 1 | 2215 | 0 | 0 | 297 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku-dry2/initiative | initiative r4 1 | anthropic/claude-haiku-5.5 | 1 | 2520 | 0 | 0 | 235 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku-dry2/initiative | initiative r4 2 | anthropic/claude-haiku-5.5 | 1 | 2520 | 0 | 0 | 168 | $0.0003 | 0 | 0 | 0 |
| SAND-haiku-dry2/initiative | initiative r5 1 | anthropic/claude-haiku-5.5 | 1 | 1817 | 0 | 0 | 280 | $0.0003 | 0 | 0 | 0 |
| SAND-haiku-dry2/initiative | initiative r5 2 | anthropic/claude-haiku-5.5 | 1 | 1817 | 0 | 0 | 199 | $0.0003 | 0 | 0 | 0 |
| SAND-haiku-dry2/initiative | initiative r6 1 | anthropic/claude-haiku-5.5 | 1 | 2190 | 0 | 0 | 398 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku-dry2/initiative | initiative r6 2 | anthropic/claude-haiku-5.5 | 1 | 2190 | 0 | 0 | 338 | $0.0004 | 0 | 0 | 0 |
