# Game player same-world 1 — the OpenRouter ledger

Cap $220; spent before this run $0.0000; this run $18.5725; total $18.5725; 325 calls.

| Session | Purpose | Model | Calls | Input (uncached) | Cache read | Cache write | Output | USD | Errors | Refusals | 429 waits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| probe deepseek | probe reasoning field | deepseek/deepseek-v4-pro-0813 | 1 | 32 | 0 | 0 | 84 | $0.0003 | 0 | 0 | 0 |
| freeze A | wizard | anthropic/claude-opus-5.5 | 2 | 11676 | 0 | 1567 | 13144 | $0.3174 | 0 | 0 | 0 |
| freeze B | wizard | anthropic/claude-opus-5.5 | 2 | 11434 | 1567 | 0 | 13028 | $0.3066 | 0 | 0 | 0 |
| freeze A | prep | anthropic/claude-opus-5.5 | 1 | 4052 | 16673 | 612 | 15233 | $0.3291 | 0 | 0 | 0 |
| freeze B | prep | anthropic/claude-opus-5.5 | 1 | 3310 | 16673 | 529 | 7940 | $0.1796 | 0 | 0 | 0 |
| A-opus-1 | check A-opus-1 opening | anthropic/claude-haiku-5.5 | 1 | 879 | 0 | 0 | 69 | $0.0001 | 0 | 0 | 0 |
| A-opus-1 | player t* | anthropic/claude-opus-5.5 | 20 | 80 | 611205 | 35102 | 15309 | $0.6043 | 0 | 0 | 0 |
| A-opus-1 | check A-opus-1 t* player | anthropic/claude-haiku-5.5 | 20 | 40342 | 0 | 0 | 1377 | $0.0047 | 0 | 0 | 0 |
| A-opus-1 | dm t* | anthropic/claude-opus-5.5 | 50 | 192 | 1920016 | 1552720 | 193983 | $14.1542 | 1 | 0 | 0 |
| A-opus-1 | dm t* | anthropic/claude-haiku-5.5 | 26 | 83743 | 0 | 0 | 10973 | $0.0139 | 0 | 0 | 0 |
| A-opus-1 | check A-opus-1 t* dm | anthropic/claude-haiku-5.5 | 20 | 42243 | 0 | 0 | 1529 | $0.0050 | 0 | 0 | 0 |
| A-opus-1 | check A-opus-1 t* dm (told before a card) | anthropic/claude-haiku-5.5 | 3 | 3955 | 0 | 0 | 209 | $0.0005 | 0 | 0 | 0 |
| A-opus-1 | player t* card 1 | anthropic/claude-opus-5.5 | 3 | 12 | 113444 | 3333 | 175 | $0.0429 | 0 | 0 | 0 |
| A-opus-1 | check A-opus-1 t* player (card) | anthropic/claude-haiku-5.5 | 8 | 5172 | 0 | 0 | 484 | $0.0008 | 0 | 0 | 0 |
| A-opus-1 | player t* card 2 | anthropic/claude-opus-5.5 | 3 | 12 | 116777 | 495 | 511 | $0.0361 | 0 | 0 | 0 |
| A-opus-1 | dm t* onward | anthropic/claude-opus-5.5 | 8 | 26 | 475945 | 167147 | 25424 | $1.4395 | 0 | 0 | 0 |
| A-opus-1 | dm t* onward | anthropic/claude-haiku-5.5 | 7 | 22092 | 0 | 0 | 2564 | $0.0035 | 0 | 0 | 0 |
| A-opus-1 | dm t* retry | anthropic/claude-opus-5.5 | 1 | 4 | 100902 | 0 | 4724 | $0.1147 | 0 | 0 | 0 |
| A-opus-1 | player t* card 3 | anthropic/claude-opus-5.5 | 1 | 4 | 47887 | 164 | 37 | $0.0112 | 0 | 0 | 0 |
| A-opus-1 | player t* card 4 | anthropic/claude-opus-5.5 | 1 | 4 | 48051 | 172 | 149 | $0.0135 | 0 | 0 | 0 |
| A-opus-1 | note | anthropic/claude-opus-5.5 | 1 | 4 | 53415 | 3781 | 2310 | $0.0758 | 0 | 0 | 0 |
| A-opus-1 | check A-opus-1 note | anthropic/claude-haiku-5.5 | 1 | 1472 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| A-opus-1 | after | anthropic/claude-opus-5.5 | 1 | 4 | 57196 | 1137 | 947 | $0.0361 | 0 | 0 | 0 |
| A-opus-1 | check A-opus-1 after | anthropic/claude-haiku-5.5 | 1 | 999 | 0 | 0 | 63 | $0.0001 | 0 | 0 | 0 |
| score A-opus-1 | tag player A-opus-1 t* 1 | anthropic/claude-haiku-5.5 | 20 | 77469 | 0 | 0 | 6566 | $0.0110 | 0 | 0 | 0 |
| score A-opus-1 | tag player A-opus-1 t* 2 | anthropic/claude-haiku-5.5 | 20 | 77469 | 0 | 0 | 6712 | $0.0111 | 0 | 0 | 0 |
| score A-opus-1 | tag player A-opus-1 t* referee | anthropic/claude-opus-5.5 | 3 | 11778 | 0 | 0 | 867 | $0.0645 | 0 | 0 | 0 |
| score A-opus-1 | tag dm A-opus-1 t* 1 | anthropic/claude-haiku-5.5 | 20 | 45137 | 0 | 0 | 6534 | $0.0078 | 0 | 0 | 0 |
| score A-opus-1 | tag dm A-opus-1 t* 2 | anthropic/claude-haiku-5.5 | 20 | 45137 | 0 | 0 | 6751 | $0.0079 | 0 | 0 | 0 |
| score A-opus-1 | threads A-opus-1 | anthropic/claude-opus-5.5 | 1 | 26446 | 0 | 0 | 706 | $0.1199 | 0 | 0 | 0 |
| score A-opus-1 | deception A-opus-1 t* 1 | anthropic/claude-haiku-5.5 | 1 | 2617 | 0 | 0 | 279 | $0.0004 | 0 | 0 | 0 |
| score A-opus-1 | deception A-opus-1 t* 2 | anthropic/claude-haiku-5.5 | 1 | 2617 | 0 | 0 | 344 | $0.0004 | 0 | 0 | 0 |
| score A-opus-1 | rollcheck A-opus-1 t* | anthropic/claude-haiku-5.5 | 5 | 14686 | 0 | 0 | 908 | $0.0019 | 0 | 0 | 0 |
| score A-opus-1 | note A-opus-1 1 | anthropic/claude-haiku-5.5 | 1 | 1386 | 0 | 0 | 108 | $0.0002 | 0 | 0 | 0 |
| score A-opus-1 | note A-opus-1 2 | anthropic/claude-haiku-5.5 | 1 | 1386 | 0 | 0 | 96 | $0.0002 | 0 | 0 | 0 |
| score A-opus-1 | authorship A-opus-1 1 | anthropic/claude-opus-5.5 | 1 | 42477 | 0 | 0 | 1959 | $0.2091 | 0 | 0 | 0 |
| score A-opus-1 | authorship A-opus-1 2 | anthropic/claude-opus-5.5 | 1 | 42477 | 0 | 0 | 1797 | $0.2058 | 0 | 0 | 0 |
| score A-opus-1 | note extra A-opus-1 1 | anthropic/claude-haiku-5.5 | 1 | 1469 | 0 | 0 | 463 | $0.0004 | 0 | 0 | 0 |
| score A-opus-1 | note extra A-opus-1 2 | anthropic/claude-haiku-5.5 | 1 | 1469 | 0 | 0 | 456 | $0.0004 | 0 | 0 | 0 |
| score A-opus-1 | made A-opus-1 t* 1 | anthropic/claude-haiku-5.5 | 20 | 69989 | 0 | 0 | 1476 | $0.0077 | 0 | 0 | 0 |
| score A-opus-1 | made A-opus-1 t* 2 | anthropic/claude-haiku-5.5 | 20 | 69989 | 0 | 0 | 1441 | $0.0077 | 0 | 0 | 0 |
| score A-opus-1 | overlap A-opus-1 1 | anthropic/claude-haiku-5.5 | 1 | 49677 | 0 | 0 | 568 | $0.0053 | 0 | 0 | 0 |
| score A-opus-1 | overlap A-opus-1 2 | anthropic/claude-haiku-5.5 | 1 | 49677 | 0 | 0 | 607 | $0.0053 | 0 | 0 | 0 |
| score A-opus-1 | overlap A-opus-1 referee | anthropic/claude-opus-5.5 | 1 | 49677 | 0 | 0 | 555 | $0.2098 | 0 | 0 | 0 |
| score A-opus-1 | world A-opus-1 1 | anthropic/claude-haiku-5.5 | 1 | 28489 | 0 | 0 | 131 | $0.0029 | 0 | 0 | 0 |
| score A-opus-1 | world A-opus-1 2 | anthropic/claude-haiku-5.5 | 1 | 28489 | 0 | 0 | 114 | $0.0029 | 0 | 0 | 0 |
