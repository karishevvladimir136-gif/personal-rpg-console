# Game party 1 — the dry run on Haiku — the OpenRouter ledger

Cap $6; spent before this run $0.0000; this run $0.1442; total $0.1442; 104 calls.

| Session | Purpose | Model | Calls | Input (uncached) | Cache read | Cache write | Output | USD | Errors | Refusals | 429 waits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SAND-haiku | relay opening | anthropic/claude-haiku-5.5 | 2 | 2042 | 0 | 0 | 4107 | $0.0023 | 0 | 0 | 0 |
| SAND-haiku/Bram | player r1 | anthropic/claude-haiku-5.5 | 2 | 8 | 0 | 21254 | 1069 | $0.0032 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Bram r1 | anthropic/claude-haiku-5.5 | 2 | 3357 | 0 | 0 | 133 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku/Sefa | player r1 | anthropic/claude-haiku-5.5 | 2 | 8 | 0 | 22022 | 1386 | $0.0034 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Sefa r1 | anthropic/claude-haiku-5.5 | 2 | 3762 | 0 | 0 | 142 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku/Pell | player r1 | anthropic/claude-haiku-5.5 | 2 | 8 | 0 | 21441 | 1096 | $0.0032 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Pell r1 | anthropic/claude-haiku-5.5 | 2 | 3323 | 0 | 0 | 140 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku | dm r1 | anthropic/claude-haiku-5.5 | 9 | 7715 | 126376 | 140583 | 25336 | $0.0353 | 0 | 0 | 0 |
| SAND-haiku | relay r1 | anthropic/claude-haiku-5.5 | 2 | 3822 | 0 | 0 | 9470 | $0.0051 | 0 | 0 | 0 |
| SAND-haiku/Bram | player r2 | anthropic/claude-haiku-5.5 | 2 | 8 | 21254 | 2321 | 1389 | $0.0012 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Bram r2 | anthropic/claude-haiku-5.5 | 2 | 3091 | 0 | 0 | 127 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku/Sefa | player r2 | anthropic/claude-haiku-5.5 | 2 | 8 | 22022 | 2367 | 1188 | $0.0011 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Sefa r2 | anthropic/claude-haiku-5.5 | 2 | 3203 | 0 | 0 | 143 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku/Pell | player r2 | anthropic/claude-haiku-5.5 | 2 | 8 | 21441 | 2278 | 1628 | $0.0013 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Pell r2 | anthropic/claude-haiku-5.5 | 2 | 3302 | 0 | 0 | 132 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku | dm r2 | anthropic/claude-haiku-5.5 | 11 | 10664 | 212262 | 108979 | 27948 | $0.0310 | 0 | 0 | 0 |
| SAND-haiku | relay r2 | anthropic/claude-haiku-5.5 | 2 | 4921 | 0 | 0 | 7895 | $0.0044 | 0 | 0 | 0 |
| SAND-haiku/Bram | player r3 | anthropic/claude-haiku-5.5 | 2 | 8 | 23575 | 1882 | 1765 | $0.0014 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Bram r3 | anthropic/claude-haiku-5.5 | 2 | 2780 | 0 | 0 | 144 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku/Sefa | player r3 | anthropic/claude-haiku-5.5 | 2 | 8 | 24389 | 1968 | 1081 | $0.0010 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Sefa r3 | anthropic/claude-haiku-5.5 | 2 | 2458 | 0 | 0 | 172 | $0.0003 | 0 | 0 | 0 |
| SAND-haiku/Pell | player r3 | anthropic/claude-haiku-5.5 | 2 | 8 | 23719 | 1991 | 1694 | $0.0013 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Pell r3 | anthropic/claude-haiku-5.5 | 2 | 2539 | 0 | 0 | 155 | $0.0003 | 0 | 0 | 0 |
| SAND-haiku | dm r3 | anthropic/claude-haiku-5.5 | 6 | 5397 | 87584 | 111347 | 20833 | $0.0260 | 0 | 0 | 0 |
| SAND-haiku | relay r3 | anthropic/claude-haiku-5.5 | 2 | 4877 | 0 | 0 | 10023 | $0.0055 | 0 | 0 | 0 |
| SAND-haiku/Bram | after 1 | anthropic/claude-haiku-5.5 | 2 | 8 | 25457 | 2335 | 1079 | $0.0011 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Bram after 1 | anthropic/claude-haiku-5.5 | 2 | 1099 | 0 | 0 | 135 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku/Bram | after 2 | anthropic/claude-haiku-5.5 | 2 | 8 | 27792 | 489 | 870 | $0.0008 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Bram after 2 | anthropic/claude-haiku-5.5 | 2 | 1123 | 0 | 0 | 140 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku/Bram | after 3 | anthropic/claude-haiku-5.5 | 2 | 8 | 28281 | 487 | 923 | $0.0008 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Bram after 3 | anthropic/claude-haiku-5.5 | 2 | 1132 | 0 | 0 | 134 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku/Sefa | after 1 | anthropic/claude-haiku-5.5 | 2 | 8 | 26357 | 2035 | 845 | $0.0009 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Sefa after 1 | anthropic/claude-haiku-5.5 | 2 | 1161 | 0 | 0 | 137 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku/Pell | after 1 | anthropic/claude-haiku-5.5 | 2 | 8 | 25710 | 2150 | 1004 | $0.0010 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Pell after 1 | anthropic/claude-haiku-5.5 | 2 | 1166 | 0 | 0 | 126 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku/Pell | after 2 | anthropic/claude-haiku-5.5 | 2 | 8 | 27860 | 556 | 1320 | $0.0010 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Pell after 2 | anthropic/claude-haiku-5.5 | 2 | 1209 | 0 | 0 | 137 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku/Pell | after 3 | anthropic/claude-haiku-5.5 | 2 | 8 | 28416 | 573 | 811 | $0.0008 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Pell after 3 | anthropic/claude-haiku-5.5 | 2 | 1038 | 0 | 0 | 133 | $0.0002 | 0 | 0 | 0 |
| SAND-haiku | relay r2 (asked again) | anthropic/claude-haiku-5.5 | 1 | 2642 | 0 | 0 | 3954 | $0.0022 | 0 | 0 | 0 |
| SAND-haiku | relay r3 (asked again) | anthropic/claude-haiku-5.5 | 1 | 2476 | 0 | 0 | 5461 | $0.0030 | 0 | 0 | 0 |
| SAND-haiku/Sefa | after 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 14400 | 229 | 561 | $0.0005 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Sefa after 2 | anthropic/claude-haiku-5.5 | 1 | 568 | 0 | 0 | 66 | $0.0001 | 0 | 0 | 0 |
| SAND-haiku/Sefa | after 3 | anthropic/claude-haiku-5.5 | 1 | 4 | 14629 | 250 | 436 | $0.0004 | 0 | 0 | 0 |
| SAND-haiku/check | check SAND-haiku Sefa after 3 | anthropic/claude-haiku-5.5 | 1 | 607 | 0 | 0 | 66 | $0.0001 | 0 | 0 | 0 |
