# Game player combat 1 — the OpenRouter ledger

Cap $90; spent before this run $0.0000; this run $29.9995; total $29.9995; 639 calls.

| Session | Purpose | Model | Calls | Input (uncached) | Cache read | Cache write | Output | USD | Errors | Refusals | 429 waits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CW-haiku | wizard | anthropic/claude-opus-5.5 | 2 | 16832 | 0 | 1567 | 14569 | $0.3665 | 0 | 0 | 0 |
| CW-haiku | prep | anthropic/claude-opus-5.5 | 1 | 4127 | 0 | 17101 | 10270 | $0.3587 | 0 | 0 | 0 |
| CW-haiku | check CW-haiku opening | anthropic/claude-haiku-5.5 | 1 | 695 | 0 | 0 | 65 | $0.0001 | 0 | 0 | 0 |
| CW-haiku | player t* | anthropic/claude-haiku-5.5 | 8 | 32 | 129398 | 25347 | 8030 | $0.0085 | 0 | 0 | 0 |
| CW-haiku | check CW-haiku t* player | anthropic/claude-haiku-5.5 | 8 | 14131 | 0 | 0 | 562 | $0.0017 | 0 | 0 | 0 |
| CW-haiku | dm t* | anthropic/claude-opus-5.5 | 19 | 76 | 498027 | 505753 | 65919 | $4.0348 | 0 | 0 | 0 |
| CW-haiku | dm t* | anthropic/claude-haiku-5.5 | 10 | 28572 | 0 | 0 | 5037 | $0.0054 | 0 | 0 | 0 |
| CW-haiku | check CW-haiku t* dm | anthropic/claude-haiku-5.5 | 8 | 14787 | 0 | 0 | 954 | $0.0020 | 0 | 0 | 0 |
| CW-haiku | note | anthropic/claude-haiku-5.5 | 1 | 4 | 25347 | 1710 | 1241 | $0.0011 | 0 | 0 | 0 |
| CW-haiku | check CW-haiku note | anthropic/claude-haiku-5.5 | 1 | 1009 | 0 | 0 | 64 | $0.0001 | 0 | 0 | 0 |
| CW-haiku | after | anthropic/claude-haiku-5.5 | 1 | 4 | 27057 | 674 | 672 | $0.0007 | 0 | 0 | 0 |
| CW-haiku | check CW-haiku after | anthropic/claude-haiku-5.5 | 1 | 598 | 0 | 0 | 64 | $0.0001 | 0 | 0 | 0 |
| score CW-haiku | tag player CW-haiku t* 1 | anthropic/claude-haiku-5.5 | 8 | 26003 | 0 | 0 | 1795 | $0.0035 | 0 | 0 | 0 |
| score CW-haiku | tag player CW-haiku t* 2 | anthropic/claude-haiku-5.5 | 8 | 26003 | 0 | 0 | 1767 | $0.0035 | 0 | 0 | 0 |
| score CW-haiku | tag player CW-haiku t* referee | anthropic/claude-opus-5.5 | 2 | 6478 | 0 | 0 | 207 | $0.0301 | 0 | 0 | 0 |
| score CW-haiku | tag dm CW-haiku t* 1 | anthropic/claude-haiku-5.5 | 8 | 15355 | 0 | 0 | 2853 | $0.0030 | 0 | 0 | 0 |
| score CW-haiku | tag dm CW-haiku t* 2 | anthropic/claude-haiku-5.5 | 8 | 15355 | 0 | 0 | 2997 | $0.0030 | 0 | 0 | 0 |
| score CW-haiku | threads CW-haiku | anthropic/claude-opus-5.5 | 1 | 9053 | 0 | 0 | 506 | $0.0463 | 0 | 0 | 0 |
| score CW-haiku | note CW-haiku 1 | anthropic/claude-haiku-5.5 | 1 | 923 | 0 | 0 | 108 | $0.0001 | 0 | 0 | 0 |
| score CW-haiku | note CW-haiku 2 | anthropic/claude-haiku-5.5 | 1 | 923 | 0 | 0 | 96 | $0.0001 | 0 | 0 | 0 |
| score CW-haiku | combat player CW-haiku t* 1 | anthropic/claude-haiku-5.5 | 8 | 29099 | 0 | 0 | 2081 | $0.0040 | 0 | 0 | 0 |
| score CW-haiku | combat player CW-haiku t* 2 | anthropic/claude-haiku-5.5 | 8 | 29099 | 0 | 0 | 2364 | $0.0041 | 0 | 0 | 0 |
| score CW-haiku | combat dm CW-haiku t* 1 | anthropic/claude-haiku-5.5 | 8 | 15579 | 0 | 0 | 1190 | $0.0022 | 0 | 0 | 0 |
| score CW-haiku | combat dm CW-haiku t* 2 | anthropic/claude-haiku-5.5 | 8 | 15579 | 0 | 0 | 1168 | $0.0021 | 0 | 0 | 0 |
| score CW-haiku | combat player CW-haiku t* referee | anthropic/claude-opus-5.5 | 2 | 7756 | 0 | 0 | 816 | $0.0473 | 0 | 0 | 0 |
| score CW-haiku | exit CW-haiku | anthropic/claude-opus-5.5 | 1 | 13483 | 0 | 0 | 613 | $0.0662 | 0 | 0 | 0 |
| CW-opus | wizard | anthropic/claude-opus-5.5 | 2 | 16781 | 0 | 1567 | 13338 | $0.3417 | 0 | 0 | 0 |
| CW-opus | prep | anthropic/claude-opus-5.5 | 1 | 4179 | 0 | 17124 | 8730 | $0.3283 | 0 | 0 | 0 |
| CW-opus | check CW-opus opening | anthropic/claude-haiku-5.5 | 1 | 718 | 0 | 0 | 74 | $0.0001 | 0 | 0 | 0 |
| CW-opus | player t* | anthropic/claude-opus-5.5 | 25 | 100 | 899257 | 104927 | 19912 | $1.1031 | 0 | 0 | 0 |
| CW-opus | check CW-opus t* player | anthropic/claude-haiku-5.5 | 25 | 48763 | 0 | 0 | 1903 | $0.0058 | 0 | 0 | 0 |
| CW-opus | dm t* | anthropic/claude-opus-5.5 | 102 | 316 | 5491172 | 1964156 | 240466 | $19.5773 | 2 | 0 | 0 |
| CW-opus | dm t* | anthropic/claude-haiku-5.5 | 35 | 116566 | 0 | 0 | 18574 | $0.0209 | 0 | 0 | 0 |
| CW-opus | check CW-opus t* dm | anthropic/claude-haiku-5.5 | 24 | 48542 | 0 | 0 | 2040 | $0.0059 | 0 | 0 | 0 |
| CW-opus | check referee CW-opus t* dm | anthropic/claude-opus-5.5 | 2 | 3743 | 0 | 0 | 180 | $0.0186 | 0 | 0 | 0 |
| CW-opus | check CW-opus t* dm (told before a card) | anthropic/claude-haiku-5.5 | 5 | 5211 | 0 | 0 | 369 | $0.0007 | 0 | 0 | 0 |
| CW-opus | player t* card 1 | anthropic/claude-opus-5.5 | 5 | 20 | 199838 | 4500 | 428 | $0.0711 | 0 | 0 | 0 |
| CW-opus | check CW-opus t* player (card) | anthropic/claude-haiku-5.5 | 11 | 7097 | 0 | 0 | 680 | $0.0010 | 0 | 0 | 0 |
| CW-opus | player t* card 2 | anthropic/claude-opus-5.5 | 5 | 20 | 204338 | 1101 | 462 | $0.0557 | 0 | 0 | 0 |
| CW-opus | dm t* onward | anthropic/claude-opus-5.5 | 21 | 58 | 1275888 | 258811 | 46446 | $2.4784 | 0 | 0 | 0 |
| CW-opus | dm t* onward | anthropic/claude-haiku-5.5 | 11 | 30507 | 0 | 0 | 4169 | $0.0051 | 0 | 0 | 0 |
| CW-opus | player t* card 3 | anthropic/claude-opus-5.5 | 1 | 4 | 23770 | 315 | 28 | $0.0069 | 0 | 0 | 0 |
| CW-opus | dm t* ooc | anthropic/claude-opus-5.5 | 1 | 19339 | 17291 | 9042 | 1212 | $0.1774 | 0 | 0 | 0 |
| CW-opus | check CW-opus t* dm (out of game) | anthropic/claude-haiku-5.5 | 1 | 825 | 0 | 0 | 81 | $0.0001 | 0 | 0 | 0 |
| CW-opus | check referee CW-opus t* player | anthropic/claude-opus-5.5 | 1 | 1845 | 0 | 0 | 54 | $0.0085 | 0 | 0 | 0 |
| CW-opus | note | anthropic/claude-opus-5.5 | 1 | 4 | 67971 | 1161 | 2754 | $0.0745 | 0 | 0 | 0 |
| CW-opus | check CW-opus note | anthropic/claude-haiku-5.5 | 1 | 1994 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| CW-opus | after | anthropic/claude-opus-5.5 | 1 | 4 | 69132 | 1659 | 1223 | $0.0466 | 0 | 0 | 0 |
| CW-opus | check CW-opus after | anthropic/claude-haiku-5.5 | 1 | 1117 | 0 | 0 | 70 | $0.0001 | 0 | 0 | 0 |
| score CW-opus | tag player CW-opus t* 1 | anthropic/claude-haiku-5.5 | 25 | 91935 | 0 | 0 | 6305 | $0.0123 | 0 | 0 | 0 |
| score CW-opus | tag player CW-opus t* 2 | anthropic/claude-haiku-5.5 | 25 | 91935 | 0 | 0 | 6369 | $0.0124 | 0 | 0 | 0 |
| score CW-opus | tag player CW-opus t* referee | anthropic/claude-opus-5.5 | 4 | 16110 | 0 | 0 | 877 | $0.0820 | 0 | 0 | 0 |
| score CW-opus | tag dm CW-opus t* 1 | anthropic/claude-haiku-5.5 | 24 | 51558 | 0 | 0 | 8349 | $0.0093 | 0 | 0 | 0 |
| score CW-opus | tag dm CW-opus t* 2 | anthropic/claude-haiku-5.5 | 24 | 51558 | 0 | 0 | 8128 | $0.0092 | 0 | 0 | 0 |
| score CW-opus | threads CW-opus | anthropic/claude-opus-5.5 | 1 | 31834 | 0 | 0 | 892 | $0.1452 | 0 | 0 | 0 |
| score CW-opus | deception CW-opus t* 1 | anthropic/claude-haiku-5.5 | 1 | 2710 | 0 | 0 | 246 | $0.0004 | 0 | 0 | 0 |
| score CW-opus | deception CW-opus t* 2 | anthropic/claude-haiku-5.5 | 1 | 2710 | 0 | 0 | 235 | $0.0004 | 0 | 0 | 0 |
| score CW-opus | rollcheck CW-opus t* | anthropic/claude-haiku-5.5 | 11 | 23731 | 0 | 0 | 2617 | $0.0037 | 0 | 0 | 0 |
| score CW-opus | note CW-opus 1 | anthropic/claude-haiku-5.5 | 1 | 1908 | 0 | 0 | 108 | $0.0002 | 0 | 0 | 0 |
| score CW-opus | note CW-opus 2 | anthropic/claude-haiku-5.5 | 1 | 1908 | 0 | 0 | 117 | $0.0002 | 0 | 0 | 0 |
| score CW-opus | combat player CW-opus t* 1 | anthropic/claude-haiku-5.5 | 24 | 98639 | 0 | 0 | 8100 | $0.0139 | 0 | 0 | 0 |
| score CW-opus | combat player CW-opus t* 2 | anthropic/claude-haiku-5.5 | 24 | 98639 | 0 | 0 | 7365 | $0.0135 | 0 | 0 | 0 |
| score CW-opus | combat dm CW-opus t* 1 | anthropic/claude-haiku-5.5 | 24 | 52230 | 0 | 0 | 6860 | $0.0087 | 0 | 0 | 0 |
| score CW-opus | combat dm CW-opus t* 2 | anthropic/claude-haiku-5.5 | 24 | 52230 | 0 | 0 | 6650 | $0.0085 | 0 | 0 | 0 |
| score CW-opus | combat player CW-opus t* referee | anthropic/claude-opus-5.5 | 6 | 24664 | 0 | 0 | 2400 | $0.1467 | 0 | 0 | 0 |
| score CW-opus | combat dm CW-opus t* referee | anthropic/claude-opus-5.5 | 2 | 4730 | 0 | 0 | 524 | $0.0294 | 0 | 0 | 0 |
| score CW-opus | exit CW-opus | anthropic/claude-opus-5.5 | 1 | 42179 | 0 | 0 | 569 | $0.1801 | 0 | 0 | 0 |
