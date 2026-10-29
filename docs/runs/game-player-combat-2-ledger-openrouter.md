# Game player combat 2 — the OpenRouter ledger

Cap $95; spent before this run $0.0000; this run $34.7436; total $34.7436; 817 calls.

| Session | Purpose | Model | Calls | Input (uncached) | Cache read | Cache write | Output | USD | Errors | Refusals | 429 waits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| freeze CW | wizard | anthropic/claude-opus-5.5 | 2 | 16570 | 0 | 1567 | 12379 | $0.3217 | 0 | 0 | 0 |
| freeze CW | prep | anthropic/claude-opus-5.5 | 1 | 4224 | 0 | 17151 | 9522 | $0.3445 | 0 | 0 | 0 |
| freeze CW | the layer's reading | anthropic/claude-opus-5.5 | 1 | 4148 | 0 | 0 | 568 | $0.0280 | 0 | 0 | 0 |
| CW-haiku | check CW-haiku opening | anthropic/claude-haiku-5.5 | 1 | 745 | 0 | 0 | 74 | $0.0001 | 0 | 0 | 0 |
| CW-haiku | player t* | anthropic/claude-haiku-5.5 | 3 | 12 | 28495 | 16637 | 2735 | $0.0037 | 0 | 0 | 0 |
| CW-haiku | check CW-haiku t* player | anthropic/claude-haiku-5.5 | 3 | 4351 | 0 | 0 | 252 | $0.0006 | 0 | 0 | 0 |
| CW-haiku | dm t* | anthropic/claude-opus-5.5 | 12 | 44 | 415336 | 189058 | 31061 | $1.6831 | 0 | 0 | 0 |
| CW-haiku | dm t* | anthropic/claude-haiku-5.5 | 6 | 14554 | 0 | 0 | 3524 | $0.0032 | 0 | 0 | 0 |
| CW-haiku | check CW-haiku t* dm | anthropic/claude-haiku-5.5 | 3 | 4981 | 0 | 0 | 276 | $0.0006 | 0 | 0 | 0 |
| CW-haiku | check referee CW-haiku t* dm | anthropic/claude-opus-5.5 | 1 | 1790 | 0 | 0 | 56 | $0.0083 | 0 | 0 | 0 |
| CW-haiku | note | anthropic/claude-haiku-5.5 | 1 | 4 | 16637 | 1608 | 966 | $0.0009 | 0 | 0 | 0 |
| CW-haiku | check CW-haiku note | anthropic/claude-haiku-5.5 | 1 | 894 | 0 | 0 | 63 | $0.0001 | 0 | 0 | 0 |
| CW-haiku | after | anthropic/claude-haiku-5.5 | 1 | 4 | 18245 | 559 | 733 | $0.0006 | 0 | 0 | 0 |
| CW-haiku | check CW-haiku after | anthropic/claude-haiku-5.5 | 1 | 666 | 0 | 0 | 85 | $0.0001 | 0 | 0 | 0 |
| score CW-haiku | tag player CW-haiku t* 1 | anthropic/claude-haiku-5.5 | 3 | 8549 | 0 | 0 | 679 | $0.0012 | 0 | 0 | 0 |
| score CW-haiku | tag player CW-haiku t* 2 | anthropic/claude-haiku-5.5 | 3 | 8549 | 0 | 0 | 801 | $0.0013 | 0 | 0 | 0 |
| score CW-haiku | tag player CW-haiku t* referee | anthropic/claude-opus-5.5 | 1 | 3326 | 0 | 0 | 338 | $0.0201 | 0 | 0 | 0 |
| score CW-haiku | tag dm CW-haiku t* 1 | anthropic/claude-haiku-5.5 | 3 | 5194 | 0 | 0 | 989 | $0.0010 | 0 | 0 | 0 |
| score CW-haiku | tag dm CW-haiku t* 2 | anthropic/claude-haiku-5.5 | 3 | 5194 | 0 | 0 | 826 | $0.0009 | 0 | 0 | 0 |
| score CW-haiku | threads CW-haiku | anthropic/claude-opus-5.5 | 1 | 3329 | 0 | 0 | 401 | $0.0213 | 0 | 0 | 0 |
| score CW-haiku | rollcheck CW-haiku t* | anthropic/claude-haiku-5.5 | 2 | 3990 | 0 | 0 | 226 | $0.0005 | 0 | 0 | 0 |
| score CW-haiku | note CW-haiku 1 | anthropic/claude-haiku-5.5 | 1 | 808 | 0 | 0 | 103 | $0.0001 | 0 | 0 | 0 |
| score CW-haiku | note CW-haiku 2 | anthropic/claude-haiku-5.5 | 1 | 808 | 0 | 0 | 95 | $0.0001 | 0 | 0 | 0 |
| score CW-haiku | combat player CW-haiku t* 1 | anthropic/claude-haiku-5.5 | 3 | 9710 | 0 | 0 | 851 | $0.0014 | 0 | 0 | 0 |
| score CW-haiku | combat player CW-haiku t* 2 | anthropic/claude-haiku-5.5 | 3 | 9710 | 0 | 0 | 978 | $0.0015 | 0 | 0 | 0 |
| score CW-haiku | combat dm CW-haiku t* 1 | anthropic/claude-haiku-5.5 | 3 | 5278 | 0 | 0 | 583 | $0.0008 | 0 | 0 | 0 |
| score CW-haiku | combat dm CW-haiku t* 2 | anthropic/claude-haiku-5.5 | 3 | 5278 | 0 | 0 | 591 | $0.0008 | 0 | 0 | 0 |
| score CW-haiku | combat player CW-haiku t* referee | anthropic/claude-opus-5.5 | 1 | 3713 | 0 | 0 | 379 | $0.0224 | 0 | 0 | 0 |
| score CW-haiku | exit CW-haiku | anthropic/claude-opus-5.5 | 1 | 5201 | 0 | 0 | 413 | $0.0291 | 0 | 0 | 0 |
| score CW-haiku | fork CW-haiku t* 1 | anthropic/claude-haiku-5.5 | 3 | 9104 | 0 | 0 | 1257 | $0.0015 | 0 | 0 | 0 |
| score CW-haiku | fork CW-haiku t* 2 | anthropic/claude-haiku-5.5 | 3 | 9104 | 0 | 0 | 1376 | $0.0016 | 0 | 0 | 0 |
| score CW-haiku | fork CW-haiku t* referee | anthropic/claude-opus-5.5 | 2 | 5924 | 0 | 0 | 292 | $0.0295 | 0 | 0 | 0 |
| score CW-haiku | captive CW-haiku | anthropic/claude-opus-5.5 | 1 | 5224 | 0 | 0 | 448 | $0.0299 | 0 | 0 | 0 |
| score CW-haiku | note CW-haiku | anthropic/claude-opus-5.5 | 1 | 1146 | 0 | 0 | 192 | $0.0084 | 0 | 0 | 0 |
| freeze CW | the amended layer's reading | anthropic/claude-opus-5.5 | 1 | 4497 | 0 | 0 | 385 | $0.0257 | 0 | 0 | 0 |
| CW-opus | check CW-opus opening | anthropic/claude-haiku-5.5 | 2 | 1490 | 0 | 0 | 130 | $0.0002 | 0 | 0 | 0 |
| CW-opus | player t* | anthropic/claude-opus-5.5 | 38 | 152 | 1074948 | 87846 | 26760 | $1.1900 | 0 | 0 | 0 |
| CW-opus | check CW-opus t* player | anthropic/claude-haiku-5.5 | 38 | 70905 | 0 | 0 | 2742 | $0.0085 | 0 | 0 | 0 |
| CW-opus | dm t* | anthropic/claude-opus-5.5 | 84 | 322 | 2820853 | 2900262 | 322805 | $25.6830 | 2 | 0 | 0 |
| CW-opus | check CW-opus t* dm (told before a card) | anthropic/claude-haiku-5.5 | 6 | 6654 | 0 | 0 | 423 | $0.0009 | 0 | 0 | 0 |
| CW-opus | player t* card 1 | anthropic/claude-opus-5.5 | 6 | 24 | 223580 | 5433 | 190 | $0.0758 | 0 | 0 | 0 |
| CW-opus | check CW-opus t* player (card) | anthropic/claude-haiku-5.5 | 12 | 7895 | 0 | 0 | 715 | $0.0011 | 0 | 0 | 0 |
| CW-opus | player t* card 2 | anthropic/claude-opus-5.5 | 6 | 24 | 229013 | 992 | 244 | $0.0557 | 0 | 0 | 0 |
| CW-opus | dm t* onward | anthropic/claude-opus-5.5 | 13 | 40 | 740184 | 321233 | 42595 | $2.6063 | 0 | 0 | 0 |
| CW-opus | dm t* onward | anthropic/claude-haiku-5.5 | 13 | 33978 | 0 | 0 | 4814 | $0.0058 | 0 | 0 | 0 |
| CW-opus | check CW-opus t* dm | anthropic/claude-haiku-5.5 | 37 | 69650 | 0 | 0 | 3037 | $0.0085 | 0 | 0 | 0 |
| CW-opus | dm t* | anthropic/claude-haiku-5.5 | 43 | 132040 | 0 | 0 | 21498 | $0.0240 | 0 | 0 | 0 |
| CW-opus | check referee CW-opus t* dm | anthropic/claude-opus-5.5 | 1 | 2456 | 0 | 0 | 54 | $0.0109 | 0 | 0 | 0 |
| CW-opus | note | anthropic/claude-opus-5.5 | 2 | 8 | 94271 | 1546 | 4352 | $0.1137 | 0 | 0 | 0 |
| CW-opus | check CW-opus note | anthropic/claude-haiku-5.5 | 2 | 3034 | 0 | 0 | 143 | $0.0004 | 0 | 0 | 0 |
| CW-opus | after | anthropic/claude-opus-5.5 | 2 | 8 | 95817 | 2364 | 2352 | $0.0781 | 0 | 0 | 0 |
| CW-opus | check CW-opus after | anthropic/claude-haiku-5.5 | 2 | 2181 | 0 | 0 | 153 | $0.0003 | 0 | 0 | 0 |
| CW-opus | after 2 | anthropic/claude-opus-5.5 | 2 | 8 | 98181 | 1553 | 2526 | $0.0780 | 0 | 0 | 0 |
| CW-opus | check CW-opus after 2 | anthropic/claude-haiku-5.5 | 2 | 2311 | 0 | 0 | 158 | $0.0003 | 0 | 0 | 0 |
| score CW-opus | tag player CW-opus t* 1 | anthropic/claude-haiku-5.5 | 37 | 130343 | 0 | 0 | 8300 | $0.0172 | 0 | 0 | 0 |
| score CW-opus | tag player CW-opus t* 2 | anthropic/claude-haiku-5.5 | 37 | 130343 | 0 | 0 | 7999 | $0.0170 | 0 | 0 | 0 |
| score CW-opus | tag player CW-opus t* referee | anthropic/claude-opus-5.5 | 5 | 16987 | 0 | 0 | 1564 | $0.0992 | 0 | 0 | 0 |
| score CW-opus | tag dm CW-opus t* 1 | anthropic/claude-haiku-5.5 | 37 | 74687 | 0 | 0 | 12610 | $0.0138 | 0 | 0 | 0 |
| score CW-opus | tag dm CW-opus t* 2 | anthropic/claude-haiku-5.5 | 37 | 74687 | 0 | 0 | 13033 | $0.0140 | 0 | 0 | 0 |
| score CW-opus | threads CW-opus | anthropic/claude-opus-5.5 | 2 | 45431 | 0 | 0 | 1164 | $0.2050 | 0 | 0 | 0 |
| score CW-opus | deception CW-opus t* 1 | anthropic/claude-haiku-5.5 | 2 | 4903 | 0 | 0 | 566 | $0.0008 | 0 | 0 | 0 |
| score CW-opus | deception CW-opus t* 2 | anthropic/claude-haiku-5.5 | 2 | 4903 | 0 | 0 | 519 | $0.0007 | 0 | 0 | 0 |
| score CW-opus | rollcheck CW-opus t* | anthropic/claude-haiku-5.5 | 7 | 15747 | 0 | 0 | 1422 | $0.0023 | 0 | 0 | 0 |
| score CW-opus | note CW-opus 1 | anthropic/claude-haiku-5.5 | 2 | 2862 | 0 | 0 | 255 | $0.0004 | 0 | 0 | 0 |
| score CW-opus | note CW-opus 2 | anthropic/claude-haiku-5.5 | 2 | 2862 | 0 | 0 | 252 | $0.0004 | 0 | 0 | 0 |
| score CW-opus | combat player CW-opus t* 1 | anthropic/claude-haiku-5.5 | 37 | 144662 | 0 | 0 | 9429 | $0.0192 | 0 | 0 | 0 |
| score CW-opus | combat player CW-opus t* 2 | anthropic/claude-haiku-5.5 | 37 | 144662 | 0 | 0 | 9090 | $0.0190 | 0 | 0 | 0 |
| score CW-opus | combat dm CW-opus t* 1 | anthropic/claude-haiku-5.5 | 37 | 75723 | 0 | 0 | 7776 | $0.0115 | 0 | 0 | 0 |
| score CW-opus | combat dm CW-opus t* 2 | anthropic/claude-haiku-5.5 | 37 | 75723 | 0 | 0 | 7716 | $0.0114 | 0 | 0 | 0 |
| score CW-opus | combat player CW-opus t* referee | anthropic/claude-opus-5.5 | 7 | 28298 | 0 | 0 | 2802 | $0.1692 | 0 | 0 | 0 |
| score CW-opus | exit CW-opus | anthropic/claude-opus-5.5 | 2 | 61043 | 0 | 0 | 898 | $0.2621 | 0 | 0 | 0 |
| score CW-opus | fork CW-opus t* 1 | anthropic/claude-haiku-5.5 | 37 | 137188 | 0 | 0 | 17262 | $0.0223 | 0 | 0 | 0 |
| score CW-opus | fork CW-opus t* 2 | anthropic/claude-haiku-5.5 | 37 | 137188 | 0 | 0 | 17902 | $0.0227 | 0 | 0 | 0 |
| score CW-opus | fork CW-opus t* referee | anthropic/claude-opus-5.5 | 15 | 56622 | 0 | 0 | 5146 | $0.3294 | 0 | 0 | 0 |
| score CW-opus | captive CW-opus | anthropic/claude-opus-5.5 | 2 | 61076 | 0 | 0 | 861 | $0.2615 | 0 | 0 | 0 |
| score CW-opus | note CW-opus | anthropic/claude-opus-5.5 | 2 | 4387 | 0 | 0 | 556 | $0.0287 | 0 | 0 | 0 |
| CW-opus | dm t* retry | anthropic/claude-opus-5.5 | 3 | 12 | 215720 | 65309 | 14818 | $0.6661 | 0 | 0 | 0 |
| CW-opus | dm t* retry | anthropic/claude-haiku-5.5 | 2 | 5949 | 0 | 0 | 1093 | $0.0011 | 0 | 0 | 0 |
| score CW-opus | combat dm CW-opus t* referee | anthropic/claude-opus-5.5 | 1 | 2709 | 0 | 0 | 79 | $0.0124 | 0 | 0 | 0 |
