# Game player same-world 1 — the OpenRouter ledger

Cap $350; spent before this run $0.0000; this run $190.5070; total $190.5070; 4516 calls.

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
| A-fable-1 | check A-fable-1 opening | anthropic/claude-haiku-5.5 | 1 | 879 | 0 | 0 | 66 | $0.0001 | 0 | 0 | 0 |
| A-fable-1 | player t* | anthropic/claude-fable-5.1 | 20 | 80 | 548477 | 46613 | 12298 | $1.3355 | 0 | 0 | 0 |
| A-fable-1 | check A-fable-1 t* player | anthropic/claude-haiku-5.5 | 20 | 37083 | 0 | 0 | 1427 | $0.0044 | 0 | 0 | 0 |
| A-fable-1 | dm t* | anthropic/claude-opus-5.5 | 42 | 164 | 1303010 | 1412678 | 163376 | $10.6841 | 0 | 0 | 0 |
| A-fable-1 | dm t* | anthropic/claude-haiku-5.5 | 20 | 59874 | 0 | 0 | 7122 | $0.0095 | 0 | 0 | 0 |
| A-fable-1 | check A-fable-1 t* dm | anthropic/claude-haiku-5.5 | 20 | 37460 | 0 | 0 | 1806 | $0.0046 | 0 | 0 | 0 |
| A-fable-1 | check A-fable-1 t* dm (told before a card) | anthropic/claude-haiku-5.5 | 2 | 2163 | 0 | 0 | 158 | $0.0003 | 0 | 0 | 0 |
| A-fable-1 | player t* card 1 | anthropic/claude-fable-5.1 | 2 | 8 | 67408 | 1755 | 36 | $0.0407 | 0 | 0 | 0 |
| A-fable-1 | check A-fable-1 t* player (card) | anthropic/claude-haiku-5.5 | 6 | 3570 | 0 | 0 | 349 | $0.0005 | 0 | 0 | 0 |
| A-fable-1 | player t* card 2 | anthropic/claude-fable-5.1 | 2 | 8 | 69163 | 333 | 267 | $0.0349 | 0 | 0 | 0 |
| A-fable-1 | player t* card 3 | anthropic/claude-fable-5.1 | 1 | 4 | 26833 | 163 | 9 | $0.0092 | 0 | 0 | 0 |
| A-fable-1 | player t* card 4 | anthropic/claude-fable-5.1 | 1 | 4 | 26996 | 188 | 104 | $0.0143 | 0 | 0 | 0 |
| A-fable-1 | dm t* onward | anthropic/claude-opus-5.5 | 6 | 18 | 348639 | 92653 | 15774 | $0.8485 | 0 | 0 | 0 |
| A-fable-1 | dm t* onward | anthropic/claude-haiku-5.5 | 4 | 12319 | 0 | 0 | 1287 | $0.0019 | 0 | 0 | 0 |
| A-fable-1 | note | anthropic/claude-fable-5.1 | 1 | 4 | 49052 | 1412 | 1515 | $0.1057 | 0 | 0 | 0 |
| A-fable-1 | check A-fable-1 note | anthropic/claude-haiku-5.5 | 1 | 1825 | 0 | 0 | 85 | $0.0002 | 0 | 0 | 0 |
| A-fable-1 | after | anthropic/claude-fable-5.1 | 1 | 4 | 50464 | 1490 | 766 | $0.0696 | 0 | 0 | 0 |
| A-fable-1 | check A-fable-1 after | anthropic/claude-haiku-5.5 | 1 | 901 | 0 | 0 | 114 | $0.0001 | 0 | 0 | 0 |
| score A-fable-1 | tag player A-fable-1 t* 1 | anthropic/claude-haiku-5.5 | 20 | 69767 | 0 | 0 | 4356 | $0.0092 | 0 | 0 | 0 |
| score A-fable-1 | tag player A-fable-1 t* 2 | anthropic/claude-haiku-5.5 | 20 | 69767 | 0 | 0 | 4899 | $0.0094 | 0 | 0 | 0 |
| score A-fable-1 | tag player A-fable-1 t* referee | anthropic/claude-opus-5.5 | 7 | 21688 | 0 | 0 | 1428 | $0.1153 | 0 | 0 | 0 |
| score A-fable-1 | tag dm A-fable-1 t* 1 | anthropic/claude-haiku-5.5 | 20 | 39638 | 0 | 0 | 6148 | $0.0070 | 0 | 0 | 0 |
| score A-fable-1 | tag dm A-fable-1 t* 2 | anthropic/claude-haiku-5.5 | 20 | 39638 | 0 | 0 | 6561 | $0.0072 | 0 | 0 | 0 |
| score A-fable-1 | threads A-fable-1 | anthropic/claude-opus-5.5 | 1 | 23890 | 0 | 0 | 717 | $0.1099 | 0 | 0 | 0 |
| score A-fable-1 | rollcheck A-fable-1 t* | anthropic/claude-haiku-5.5 | 3 | 7742 | 0 | 0 | 432 | $0.0010 | 0 | 0 | 0 |
| score A-fable-1 | note A-fable-1 1 | anthropic/claude-haiku-5.5 | 1 | 1739 | 0 | 0 | 261 | $0.0003 | 0 | 0 | 0 |
| score A-fable-1 | note A-fable-1 2 | anthropic/claude-haiku-5.5 | 1 | 1739 | 0 | 0 | 258 | $0.0003 | 0 | 0 | 0 |
| score A-fable-1 | authorship A-fable-1 1 | anthropic/claude-opus-5.5 | 1 | 37321 | 0 | 0 | 1364 | $0.1766 | 0 | 0 | 0 |
| score A-fable-1 | authorship A-fable-1 2 | anthropic/claude-opus-5.5 | 1 | 37321 | 0 | 0 | 1888 | $0.1870 | 0 | 0 | 0 |
| score A-fable-1 | note extra A-fable-1 1 | anthropic/claude-haiku-5.5 | 1 | 1822 | 0 | 0 | 97 | $0.0002 | 0 | 0 | 0 |
| score A-fable-1 | note extra A-fable-1 2 | anthropic/claude-haiku-5.5 | 1 | 1822 | 0 | 0 | 92 | $0.0002 | 0 | 0 | 0 |
| score A-fable-1 | made A-fable-1 t* 1 | anthropic/claude-haiku-5.5 | 20 | 62287 | 0 | 0 | 1525 | $0.0070 | 0 | 0 | 0 |
| score A-fable-1 | made A-fable-1 t* 2 | anthropic/claude-haiku-5.5 | 20 | 62287 | 0 | 0 | 1512 | $0.0070 | 0 | 0 | 0 |
| score A-fable-1 | overlap A-fable-1 1 | anthropic/claude-haiku-5.5 | 1 | 42903 | 0 | 0 | 581 | $0.0046 | 0 | 0 | 0 |
| score A-fable-1 | overlap A-fable-1 2 | anthropic/claude-haiku-5.5 | 1 | 42903 | 0 | 0 | 574 | $0.0046 | 0 | 0 | 0 |
| score A-fable-1 | overlap A-fable-1 referee | anthropic/claude-opus-5.5 | 1 | 42903 | 0 | 0 | 1362 | $0.1989 | 0 | 0 | 0 |
| score A-fable-1 | world A-fable-1 1 | anthropic/claude-haiku-5.5 | 1 | 24755 | 0 | 0 | 138 | $0.0025 | 0 | 0 | 0 |
| score A-fable-1 | world A-fable-1 2 | anthropic/claude-haiku-5.5 | 1 | 24755 | 0 | 0 | 120 | $0.0025 | 0 | 0 | 0 |
| A-astra-1 | check A-astra-1 opening | anthropic/claude-haiku-5.5 | 1 | 879 | 0 | 0 | 70 | $0.0001 | 0 | 0 | 0 |
| A-astra-1 | check A-astra-1 t* player | anthropic/claude-haiku-5.5 | 20 | 24637 | 0 | 0 | 1368 | $0.0031 | 0 | 0 | 0 |
| A-astra-1 | dm t* | anthropic/claude-opus-5.5 | 37 | 146 | 931921 | 1065521 | 107235 | $7.7093 | 0 | 0 | 0 |
| A-astra-1 | dm t* | anthropic/claude-haiku-5.5 | 18 | 46224 | 0 | 0 | 5770 | $0.0075 | 0 | 0 | 0 |
| A-astra-1 | check A-astra-1 t* dm | anthropic/claude-haiku-5.5 | 18 | 23337 | 0 | 0 | 1429 | $0.0030 | 0 | 0 | 0 |
| A-astra-1 | dm t* ooc | anthropic/claude-opus-5.5 | 2 | 26327 | 24758 | 24758 | 1177 | $0.3319 | 0 | 0 | 0 |
| A-astra-1 | check A-astra-1 t* dm (out of game) | anthropic/claude-haiku-5.5 | 1 | 601 | 0 | 0 | 75 | $0.0001 | 0 | 0 | 0 |
| A-astra-1 | check A-astra-1 t* dm (told before a card) | anthropic/claude-haiku-5.5 | 1 | 551 | 0 | 0 | 63 | $0.0001 | 0 | 0 | 0 |
| A-astra-1 | check A-astra-1 t* player (card) | anthropic/claude-haiku-5.5 | 2 | 1036 | 0 | 0 | 118 | $0.0002 | 0 | 0 | 0 |
| A-astra-1 | dm t* onward | anthropic/claude-opus-5.5 | 2 | 6 | 86509 | 30826 | 4090 | $0.2533 | 0 | 0 | 0 |
| A-astra-1 | dm t* onward | anthropic/claude-haiku-5.5 | 2 | 4135 | 0 | 0 | 237 | $0.0005 | 0 | 0 | 0 |
| A-astra-1 | check A-astra-1 note | anthropic/claude-haiku-5.5 | 1 | 1350 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| A-astra-1 | check A-astra-1 after | anthropic/claude-haiku-5.5 | 1 | 662 | 0 | 0 | 67 | $0.0001 | 0 | 0 | 0 |
| score A-astra-1 | tag player A-astra-1 t* 1 | anthropic/claude-haiku-5.5 | 20 | 48220 | 0 | 0 | 4251 | $0.0069 | 0 | 0 | 0 |
| score A-astra-1 | tag player A-astra-1 t* 2 | anthropic/claude-haiku-5.5 | 20 | 48220 | 0 | 0 | 4856 | $0.0072 | 0 | 0 | 0 |
| score A-astra-1 | tag player A-astra-1 t* referee | anthropic/claude-opus-5.5 | 3 | 7898 | 0 | 0 | 665 | $0.0449 | 0 | 0 | 0 |
| score A-astra-1 | tag dm A-astra-1 t* 1 | anthropic/claude-haiku-5.5 | 18 | 24742 | 0 | 0 | 6138 | $0.0055 | 0 | 0 | 0 |
| score A-astra-1 | tag dm A-astra-1 t* 2 | anthropic/claude-haiku-5.5 | 18 | 24742 | 0 | 0 | 6188 | $0.0056 | 0 | 0 | 0 |
| score A-astra-1 | threads A-astra-1 | anthropic/claude-opus-5.5 | 1 | 16484 | 0 | 0 | 581 | $0.0776 | 0 | 0 | 0 |
| score A-astra-1 | rollcheck A-astra-1 t* | anthropic/claude-haiku-5.5 | 1 | 1542 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| score A-astra-1 | note A-astra-1 1 | anthropic/claude-haiku-5.5 | 1 | 1264 | 0 | 0 | 113 | $0.0002 | 0 | 0 | 0 |
| score A-astra-1 | note A-astra-1 2 | anthropic/claude-haiku-5.5 | 1 | 1264 | 0 | 0 | 107 | $0.0002 | 0 | 0 | 0 |
| score A-astra-1 | authorship A-astra-1 1 | anthropic/claude-opus-5.5 | 1 | 21785 | 0 | 0 | 1229 | $0.1117 | 0 | 0 | 0 |
| score A-astra-1 | authorship A-astra-1 2 | anthropic/claude-opus-5.5 | 1 | 21785 | 0 | 0 | 1163 | $0.1104 | 0 | 0 | 0 |
| score A-astra-1 | note extra A-astra-1 1 | anthropic/claude-haiku-5.5 | 1 | 1347 | 0 | 0 | 417 | $0.0003 | 0 | 0 | 0 |
| score A-astra-1 | note extra A-astra-1 2 | anthropic/claude-haiku-5.5 | 1 | 1347 | 0 | 0 | 440 | $0.0004 | 0 | 0 | 0 |
| score A-astra-1 | note extra A-astra-1 referee | anthropic/claude-opus-5.5 | 1 | 1347 | 0 | 0 | 338 | $0.0121 | 0 | 0 | 0 |
| score A-astra-1 | made A-astra-1 t* 1 | anthropic/claude-haiku-5.5 | 18 | 38834 | 0 | 0 | 1257 | $0.0045 | 0 | 0 | 0 |
| score A-astra-1 | made A-astra-1 t* 2 | anthropic/claude-haiku-5.5 | 18 | 38834 | 0 | 0 | 1288 | $0.0045 | 0 | 0 | 0 |
| score A-astra-1 | overlap A-astra-1 1 | anthropic/claude-haiku-5.5 | 1 | 26879 | 0 | 0 | 893 | $0.0031 | 0 | 0 | 0 |
| score A-astra-1 | overlap A-astra-1 2 | anthropic/claude-haiku-5.5 | 1 | 26879 | 0 | 0 | 906 | $0.0031 | 0 | 0 | 0 |
| score A-astra-1 | overlap A-astra-1 referee | anthropic/claude-opus-5.5 | 1 | 26879 | 0 | 0 | 558 | $0.1187 | 0 | 0 | 0 |
| score A-astra-1 | world A-astra-1 1 | anthropic/claude-haiku-5.5 | 1 | 16954 | 0 | 0 | 117 | $0.0018 | 0 | 0 | 0 |
| score A-astra-1 | world A-astra-1 2 | anthropic/claude-haiku-5.5 | 1 | 16954 | 0 | 0 | 364 | $0.0019 | 0 | 0 | 0 |
| A-sol-1 | check A-sol-1 opening | anthropic/claude-haiku-5.5 | 1 | 879 | 0 | 0 | 72 | $0.0001 | 0 | 0 | 0 |
| A-sol-1 | check A-sol-1 t* player | anthropic/claude-haiku-5.5 | 20 | 25156 | 0 | 0 | 1371 | $0.0032 | 0 | 0 | 0 |
| A-sol-1 | dm t* | anthropic/claude-opus-5.5 | 40 | 158 | 1070260 | 1162418 | 118271 | $8.4407 | 0 | 0 | 0 |
| A-sol-1 | dm t* | anthropic/claude-haiku-5.5 | 21 | 53375 | 0 | 0 | 7696 | $0.0092 | 0 | 0 | 0 |
| A-sol-1 | check A-sol-1 t* dm | anthropic/claude-haiku-5.5 | 18 | 22827 | 0 | 0 | 1432 | $0.0030 | 0 | 0 | 0 |
| A-sol-1 | check referee A-sol-1 t* dm | anthropic/claude-opus-5.5 | 1 | 1017 | 0 | 0 | 52 | $0.0051 | 0 | 0 | 0 |
| A-sol-1 | dm t* ooc | anthropic/claude-opus-5.5 | 2 | 30728 | 43994 | 9412 | 1634 | $0.2397 | 0 | 0 | 0 |
| A-sol-1 | check A-sol-1 note | anthropic/claude-haiku-5.5 | 1 | 1226 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| A-sol-1 | check A-sol-1 after | anthropic/claude-haiku-5.5 | 1 | 514 | 0 | 0 | 72 | $0.0001 | 0 | 0 | 0 |
| score A-sol-1 | tag player A-sol-1 t* 1 | anthropic/claude-haiku-5.5 | 20 | 46893 | 0 | 0 | 5318 | $0.0073 | 0 | 0 | 0 |
| score A-sol-1 | tag player A-sol-1 t* 2 | anthropic/claude-haiku-5.5 | 20 | 46893 | 0 | 0 | 4631 | $0.0070 | 0 | 0 | 0 |
| score A-sol-1 | tag player A-sol-1 t* referee | anthropic/claude-opus-5.5 | 2 | 4395 | 0 | 0 | 316 | $0.0239 | 0 | 0 | 0 |
| score A-sol-1 | tag dm A-sol-1 t* 1 | anthropic/claude-haiku-5.5 | 18 | 24105 | 0 | 0 | 5954 | $0.0054 | 0 | 0 | 0 |
| score A-sol-1 | tag dm A-sol-1 t* 2 | anthropic/claude-haiku-5.5 | 18 | 24105 | 0 | 0 | 5612 | $0.0052 | 0 | 0 | 0 |
| score A-sol-1 | threads A-sol-1 | anthropic/claude-opus-5.5 | 1 | 16104 | 0 | 0 | 681 | $0.0780 | 0 | 0 | 0 |
| score A-sol-1 | note A-sol-1 1 | anthropic/claude-haiku-5.5 | 1 | 1140 | 0 | 0 | 104 | $0.0002 | 0 | 0 | 0 |
| score A-sol-1 | note A-sol-1 2 | anthropic/claude-haiku-5.5 | 1 | 1140 | 0 | 0 | 121 | $0.0002 | 0 | 0 | 0 |
| score A-sol-1 | authorship A-sol-1 1 | anthropic/claude-opus-5.5 | 1 | 20720 | 0 | 0 | 1625 | $0.1154 | 0 | 0 | 0 |
| score A-sol-1 | authorship A-sol-1 2 | anthropic/claude-opus-5.5 | 1 | 20720 | 0 | 0 | 1695 | $0.1168 | 0 | 0 | 0 |
| score A-sol-1 | note extra A-sol-1 1 | anthropic/claude-haiku-5.5 | 1 | 1223 | 0 | 0 | 609 | $0.0004 | 0 | 0 | 0 |
| score A-sol-1 | note extra A-sol-1 2 | anthropic/claude-haiku-5.5 | 1 | 1223 | 0 | 0 | 459 | $0.0004 | 0 | 0 | 0 |
| score A-sol-1 | made A-sol-1 t* 1 | anthropic/claude-haiku-5.5 | 18 | 37570 | 0 | 0 | 1249 | $0.0044 | 0 | 0 | 0 |
| score A-sol-1 | made A-sol-1 t* 2 | anthropic/claude-haiku-5.5 | 18 | 37570 | 0 | 0 | 1252 | $0.0044 | 0 | 0 | 0 |
| score A-sol-1 | overlap A-sol-1 1 | anthropic/claude-haiku-5.5 | 1 | 25783 | 0 | 0 | 583 | $0.0029 | 0 | 0 | 0 |
| score A-sol-1 | overlap A-sol-1 2 | anthropic/claude-haiku-5.5 | 1 | 25783 | 0 | 0 | 569 | $0.0029 | 0 | 0 | 0 |
| score A-sol-1 | overlap A-sol-1 referee | anthropic/claude-opus-5.5 | 1 | 25783 | 0 | 0 | 1213 | $0.1274 | 0 | 0 | 0 |
| score A-sol-1 | world A-sol-1 1 | anthropic/claude-haiku-5.5 | 1 | 16379 | 0 | 0 | 129 | $0.0017 | 0 | 0 | 0 |
| score A-sol-1 | world A-sol-1 2 | anthropic/claude-haiku-5.5 | 1 | 16379 | 0 | 0 | 128 | $0.0017 | 0 | 0 | 0 |
| A-deepseek-1 | check A-deepseek-1 opening | anthropic/claude-haiku-5.5 | 1 | 879 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| A-deepseek-1 | player t* | deepseek/deepseek-v4-pro-0813 | 20 | 36026 | 421888 | 0 | 25938 | $0.1565 | 0 | 0 | 0 |
| A-deepseek-1 | check A-deepseek-1 t* player | anthropic/claude-haiku-5.5 | 20 | 39236 | 0 | 0 | 1443 | $0.0046 | 0 | 0 | 0 |
| A-deepseek-1 | dm t* | anthropic/claude-opus-5.5 | 56 | 222 | 2275279 | 1425883 | 135134 | $10.3842 | 0 | 0 | 0 |
| A-deepseek-1 | dm t* | anthropic/claude-haiku-5.5 | 34 | 80566 | 0 | 0 | 7627 | $0.0119 | 0 | 0 | 0 |
| A-deepseek-1 | check A-deepseek-1 t* dm | anthropic/claude-haiku-5.5 | 20 | 39364 | 0 | 0 | 1578 | $0.0047 | 0 | 0 | 0 |
| A-deepseek-1 | check A-deepseek-1 t* dm (told before a card) | anthropic/claude-haiku-5.5 | 1 | 2016 | 0 | 0 | 58 | $0.0002 | 0 | 0 | 0 |
| A-deepseek-1 | player t* card 1 | deepseek/deepseek-v4-pro-0813 | 1 | 1527 | 24064 | 0 | 441 | $0.0055 | 0 | 0 | 0 |
| A-deepseek-1 | check A-deepseek-1 t* player (card) | anthropic/claude-haiku-5.5 | 3 | 3136 | 0 | 0 | 197 | $0.0004 | 0 | 0 | 0 |
| A-deepseek-1 | dm t* card prose | anthropic/claude-opus-5.5 | 1 | 17141 | 17291 | 20415 | 680 | $0.2489 | 0 | 0 | 0 |
| A-deepseek-1 | check A-deepseek-1 t* dm (out of game, prose at a card) | anthropic/claude-haiku-5.5 | 1 | 824 | 0 | 0 | 68 | $0.0001 | 0 | 0 | 0 |
| A-deepseek-1 | player t* card 2 | deepseek/deepseek-v4-pro-0813 | 1 | 728 | 25344 | 0 | 367 | $0.0044 | 0 | 0 | 0 |
| A-deepseek-1 | dm t* card prose (with a press) | anthropic/claude-opus-5.5 | 2 | 36133 | 75412 | 0 | 1091 | $0.1814 | 0 | 0 | 0 |
| A-deepseek-1 | check A-deepseek-1 t* dm (out of game, with a press) | anthropic/claude-haiku-5.5 | 2 | 1761 | 0 | 0 | 128 | $0.0002 | 0 | 0 | 0 |
| A-deepseek-1 | player t* card 3 | deepseek/deepseek-v4-pro-0813 | 1 | 601 | 25856 | 0 | 659 | $0.0051 | 0 | 0 | 0 |
| A-deepseek-1 | dm t* onward | anthropic/claude-opus-5.5 | 2 | 6 | 90288 | 35461 | 4238 | $0.2801 | 0 | 0 | 0 |
| A-deepseek-1 | dm t* onward | anthropic/claude-haiku-5.5 | 2 | 4913 | 0 | 0 | 517 | $0.0007 | 0 | 0 | 0 |
| A-deepseek-1 | check referee A-deepseek-1 t* dm | anthropic/claude-opus-5.5 | 1 | 1751 | 0 | 0 | 61 | $0.0082 | 0 | 0 | 0 |
| A-deepseek-1 | note | deepseek/deepseek-v4-pro-0813 | 1 | 1240 | 34816 | 0 | 1127 | $0.0080 | 0 | 0 | 0 |
| A-deepseek-1 | check A-deepseek-1 note | anthropic/claude-haiku-5.5 | 1 | 841 | 0 | 0 | 75 | $0.0001 | 0 | 0 | 0 |
| A-deepseek-1 | after | deepseek/deepseek-v4-pro-0813 | 1 | 574 | 35840 | 0 | 554 | $0.0058 | 0 | 0 | 0 |
| A-deepseek-1 | check A-deepseek-1 after | anthropic/claude-haiku-5.5 | 1 | 689 | 0 | 0 | 78 | $0.0001 | 0 | 0 | 0 |
| score A-deepseek-1 | tag player A-deepseek-1 t* 1 | anthropic/claude-haiku-5.5 | 20 | 66337 | 0 | 0 | 5000 | $0.0091 | 0 | 0 | 0 |
| score A-deepseek-1 | tag player A-deepseek-1 t* 2 | anthropic/claude-haiku-5.5 | 20 | 66337 | 0 | 0 | 5817 | $0.0095 | 0 | 0 | 0 |
| score A-deepseek-1 | tag player A-deepseek-1 t* referee | anthropic/claude-opus-5.5 | 4 | 15152 | 0 | 0 | 1038 | $0.0814 | 0 | 0 | 0 |
| score A-deepseek-1 | tag dm A-deepseek-1 t* 1 | anthropic/claude-haiku-5.5 | 20 | 41167 | 0 | 0 | 6494 | $0.0074 | 0 | 0 | 0 |
| score A-deepseek-1 | tag dm A-deepseek-1 t* 2 | anthropic/claude-haiku-5.5 | 20 | 41167 | 0 | 0 | 6725 | $0.0075 | 0 | 0 | 0 |
| score A-deepseek-1 | threads A-deepseek-1 | anthropic/claude-opus-5.5 | 1 | 19219 | 0 | 0 | 695 | $0.0908 | 0 | 0 | 0 |
| score A-deepseek-1 | rollcheck A-deepseek-1 t* | anthropic/claude-haiku-5.5 | 2 | 4441 | 0 | 0 | 333 | $0.0006 | 0 | 0 | 0 |
| score A-deepseek-1 | note A-deepseek-1 1 | anthropic/claude-haiku-5.5 | 1 | 755 | 0 | 0 | 341 | $0.0002 | 0 | 0 | 0 |
| score A-deepseek-1 | note A-deepseek-1 2 | anthropic/claude-haiku-5.5 | 1 | 755 | 0 | 0 | 210 | $0.0002 | 0 | 0 | 0 |
| score A-deepseek-1 | authorship A-deepseek-1 1 | anthropic/claude-opus-5.5 | 1 | 37079 | 0 | 0 | 1763 | $0.1836 | 0 | 0 | 0 |
| score A-deepseek-1 | authorship A-deepseek-1 2 | anthropic/claude-opus-5.5 | 1 | 37079 | 0 | 0 | 1253 | $0.1734 | 0 | 0 | 0 |
| score A-deepseek-1 | note extra A-deepseek-1 1 | anthropic/claude-haiku-5.5 | 1 | 838 | 0 | 0 | 79 | $0.0001 | 0 | 0 | 0 |
| score A-deepseek-1 | note extra A-deepseek-1 2 | anthropic/claude-haiku-5.5 | 1 | 838 | 0 | 0 | 80 | $0.0001 | 0 | 0 | 0 |
| score A-deepseek-1 | made A-deepseek-1 t* 1 | anthropic/claude-haiku-5.5 | 20 | 58857 | 0 | 0 | 1456 | $0.0066 | 0 | 0 | 0 |
| score A-deepseek-1 | made A-deepseek-1 t* 2 | anthropic/claude-haiku-5.5 | 20 | 58857 | 0 | 0 | 1437 | $0.0066 | 0 | 0 | 0 |
| score A-deepseek-1 | overlap A-deepseek-1 1 | anthropic/claude-haiku-5.5 | 1 | 43645 | 0 | 0 | 552 | $0.0046 | 0 | 0 | 0 |
| score A-deepseek-1 | overlap A-deepseek-1 2 | anthropic/claude-haiku-5.5 | 1 | 43645 | 0 | 0 | 573 | $0.0047 | 0 | 0 | 0 |
| score A-deepseek-1 | overlap A-deepseek-1 referee | anthropic/claude-opus-5.5 | 1 | 43645 | 0 | 0 | 549 | $0.1856 | 0 | 0 | 0 |
| score A-deepseek-1 | world A-deepseek-1 1 | anthropic/claude-haiku-5.5 | 1 | 19466 | 0 | 0 | 99 | $0.0020 | 0 | 0 | 0 |
| score A-deepseek-1 | world A-deepseek-1 2 | anthropic/claude-haiku-5.5 | 1 | 19466 | 0 | 0 | 139 | $0.0020 | 0 | 0 | 0 |
| A-opus-2 | check A-opus-2 opening | anthropic/claude-haiku-5.5 | 1 | 879 | 0 | 0 | 74 | $0.0001 | 0 | 0 | 0 |
| A-opus-2 | player t* | anthropic/claude-opus-5.5 | 20 | 80 | 537268 | 49149 | 15334 | $0.6602 | 0 | 0 | 0 |
| A-opus-2 | check A-opus-2 t* player | anthropic/claude-haiku-5.5 | 20 | 40605 | 0 | 0 | 1482 | $0.0048 | 0 | 0 | 0 |
| A-opus-2 | dm t* ooc | anthropic/claude-opus-5.5 | 3 | 27740 | 53097 | 612 | 5356 | $0.2336 | 0 | 0 | 0 |
| A-opus-2 | check A-opus-2 t* dm (out of game) | anthropic/claude-haiku-5.5 | 1 | 890 | 0 | 0 | 77 | $0.0001 | 0 | 0 | 0 |
| A-opus-2 | dm t* | anthropic/claude-opus-5.5 | 41 | 160 | 1334313 | 1422794 | 215755 | $11.7908 | 0 | 0 | 0 |
| A-opus-2 | dm t* | anthropic/claude-haiku-5.5 | 21 | 76247 | 0 | 0 | 9789 | $0.0125 | 0 | 0 | 0 |
| A-opus-2 | check A-opus-2 t* dm | anthropic/claude-haiku-5.5 | 17 | 38596 | 0 | 0 | 1697 | $0.0047 | 0 | 0 | 0 |
| A-opus-2 | check A-opus-2 t* dm (told before a card) | anthropic/claude-haiku-5.5 | 1 | 1410 | 0 | 0 | 76 | $0.0002 | 0 | 0 | 0 |
| A-opus-2 | player t* card 1 | anthropic/claude-opus-5.5 | 1 | 4 | 32281 | 1209 | 66 | $0.0138 | 0 | 0 | 0 |
| A-opus-2 | check A-opus-2 t* player (card) | anthropic/claude-haiku-5.5 | 2 | 1528 | 0 | 0 | 110 | $0.0002 | 0 | 0 | 0 |
| A-opus-2 | player t* card 2 | anthropic/claude-opus-5.5 | 1 | 4 | 33490 | 173 | 53 | $0.0086 | 0 | 0 | 0 |
| A-opus-2 | dm t* onward | anthropic/claude-opus-5.5 | 2 | 6 | 93599 | 43576 | 6269 | $0.3620 | 0 | 0 | 0 |
| A-opus-2 | dm t* onward | anthropic/claude-haiku-5.5 | 2 | 5190 | 0 | 0 | 300 | $0.0007 | 0 | 0 | 0 |
| A-opus-2 | note | anthropic/claude-opus-5.5 | 1 | 4 | 50531 | 2934 | 2411 | $0.0730 | 0 | 0 | 0 |
| A-opus-2 | check A-opus-2 note | anthropic/claude-haiku-5.5 | 1 | 1924 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| A-opus-2 | after | anthropic/claude-opus-5.5 | 1 | 4 | 53465 | 1589 | 1309 | $0.0448 | 0 | 0 | 0 |
| A-opus-2 | check A-opus-2 after | anthropic/claude-haiku-5.5 | 1 | 1170 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| score A-opus-2 | tag player A-opus-2 t* 1 | anthropic/claude-haiku-5.5 | 20 | 72993 | 0 | 0 | 5277 | $0.0099 | 0 | 0 | 0 |
| score A-opus-2 | tag player A-opus-2 t* 2 | anthropic/claude-haiku-5.5 | 20 | 72993 | 0 | 0 | 4891 | $0.0097 | 0 | 0 | 0 |
| score A-opus-2 | tag player A-opus-2 t* referee | anthropic/claude-opus-5.5 | 1 | 4926 | 0 | 0 | 331 | $0.0263 | 0 | 0 | 0 |
| score A-opus-2 | tag dm A-opus-2 t* 1 | anthropic/claude-haiku-5.5 | 17 | 40406 | 0 | 0 | 5915 | $0.0070 | 0 | 0 | 0 |
| score A-opus-2 | tag dm A-opus-2 t* 2 | anthropic/claude-haiku-5.5 | 17 | 40406 | 0 | 0 | 5779 | $0.0069 | 0 | 0 | 0 |
| score A-opus-2 | threads A-opus-2 | anthropic/claude-opus-5.5 | 1 | 24085 | 0 | 0 | 808 | $0.1125 | 0 | 0 | 0 |
| score A-opus-2 | rollcheck A-opus-2 t* | anthropic/claude-haiku-5.5 | 2 | 5227 | 0 | 0 | 408 | $0.0007 | 0 | 0 | 0 |
| score A-opus-2 | note A-opus-2 1 | anthropic/claude-haiku-5.5 | 1 | 1838 | 0 | 0 | 115 | $0.0002 | 0 | 0 | 0 |
| score A-opus-2 | note A-opus-2 2 | anthropic/claude-haiku-5.5 | 1 | 1838 | 0 | 0 | 113 | $0.0002 | 0 | 0 | 0 |
| score A-opus-2 | authorship A-opus-2 1 | anthropic/claude-opus-5.5 | 1 | 39514 | 0 | 0 | 1730 | $0.1927 | 0 | 0 | 0 |
| score A-opus-2 | authorship A-opus-2 2 | anthropic/claude-opus-5.5 | 1 | 39514 | 0 | 0 | 1596 | $0.1900 | 0 | 0 | 0 |
| score A-opus-2 | note extra A-opus-2 1 | anthropic/claude-haiku-5.5 | 1 | 1921 | 0 | 0 | 584 | $0.0005 | 0 | 0 | 0 |
| score A-opus-2 | note extra A-opus-2 2 | anthropic/claude-haiku-5.5 | 1 | 1921 | 0 | 0 | 384 | $0.0004 | 0 | 0 | 0 |
| score A-opus-2 | note extra A-opus-2 referee | anthropic/claude-opus-5.5 | 1 | 1921 | 0 | 0 | 328 | $0.0142 | 0 | 0 | 0 |
| score A-opus-2 | made A-opus-2 t* 1 | anthropic/claude-haiku-5.5 | 17 | 62716 | 0 | 0 | 1239 | $0.0069 | 0 | 0 | 0 |
| score A-opus-2 | made A-opus-2 t* 2 | anthropic/claude-haiku-5.5 | 17 | 62716 | 0 | 0 | 1300 | $0.0069 | 0 | 0 | 0 |
| score A-opus-2 | overlap A-opus-2 1 | anthropic/claude-haiku-5.5 | 1 | 45820 | 0 | 0 | 524 | $0.0048 | 0 | 0 | 0 |
| score A-opus-2 | overlap A-opus-2 2 | anthropic/claude-haiku-5.5 | 1 | 45820 | 0 | 0 | 550 | $0.0049 | 0 | 0 | 0 |
| score A-opus-2 | overlap A-opus-2 referee | anthropic/claude-opus-5.5 | 1 | 45820 | 0 | 0 | 557 | $0.1944 | 0 | 0 | 0 |
| score A-opus-2 | world A-opus-2 1 | anthropic/claude-haiku-5.5 | 1 | 26112 | 0 | 0 | 118 | $0.0027 | 0 | 0 | 0 |
| score A-opus-2 | world A-opus-2 2 | anthropic/claude-haiku-5.5 | 1 | 26112 | 0 | 0 | 128 | $0.0027 | 0 | 0 | 0 |
| A-fable-2 | check A-fable-2 opening | anthropic/claude-haiku-5.5 | 1 | 879 | 0 | 0 | 68 | $0.0001 | 0 | 0 | 0 |
| A-fable-2 | player t* | anthropic/claude-fable-5.1 | 20 | 80 | 544961 | 46694 | 14364 | $1.4389 | 0 | 0 | 0 |
| A-fable-2 | check A-fable-2 t* player | anthropic/claude-haiku-5.5 | 20 | 36921 | 0 | 0 | 1472 | $0.0044 | 0 | 0 | 0 |
| A-fable-2 | check referee A-fable-2 t* player | anthropic/claude-opus-5.5 | 1 | 1207 | 0 | 0 | 65 | $0.0061 | 0 | 0 | 0 |
| A-fable-2 | dm t* | anthropic/claude-opus-5.5 | 52 | 206 | 1803559 | 1504716 | 172552 | $11.4253 | 0 | 0 | 0 |
| A-fable-2 | dm t* | anthropic/claude-haiku-5.5 | 27 | 78664 | 0 | 0 | 10637 | $0.0132 | 0 | 0 | 0 |
| A-fable-2 | check A-fable-2 t* dm | anthropic/claude-haiku-5.5 | 20 | 37923 | 0 | 0 | 1662 | $0.0046 | 0 | 0 | 0 |
| A-fable-2 | note | anthropic/claude-fable-5.1 | 1 | 4 | 46694 | 2159 | 1373 | $0.1074 | 0 | 0 | 0 |
| A-fable-2 | check A-fable-2 note | anthropic/claude-haiku-5.5 | 1 | 1671 | 0 | 0 | 69 | $0.0002 | 0 | 0 | 0 |
| A-fable-2 | after | anthropic/claude-fable-5.1 | 1 | 4 | 48853 | 1336 | 747 | $0.0663 | 0 | 0 | 0 |
| A-fable-2 | check A-fable-2 after | anthropic/claude-haiku-5.5 | 1 | 1041 | 0 | 0 | 75 | $0.0001 | 0 | 0 | 0 |
| score A-fable-2 | tag player A-fable-2 t* 1 | anthropic/claude-haiku-5.5 | 20 | 67958 | 0 | 0 | 5635 | $0.0096 | 0 | 0 | 0 |
| score A-fable-2 | tag player A-fable-2 t* 2 | anthropic/claude-haiku-5.5 | 20 | 67958 | 0 | 0 | 6605 | $0.0101 | 0 | 0 | 0 |
| score A-fable-2 | tag player A-fable-2 t* referee | anthropic/claude-opus-5.5 | 2 | 7671 | 0 | 0 | 391 | $0.0385 | 0 | 0 | 0 |
| score A-fable-2 | tag dm A-fable-2 t* 1 | anthropic/claude-haiku-5.5 | 20 | 39343 | 0 | 0 | 7041 | $0.0075 | 0 | 0 | 0 |
| score A-fable-2 | tag dm A-fable-2 t* 2 | anthropic/claude-haiku-5.5 | 20 | 39343 | 0 | 0 | 6843 | $0.0074 | 0 | 0 | 0 |
| score A-fable-2 | threads A-fable-2 | anthropic/claude-opus-5.5 | 1 | 23209 | 0 | 0 | 711 | $0.1071 | 0 | 0 | 0 |
| score A-fable-2 | note A-fable-2 1 | anthropic/claude-haiku-5.5 | 1 | 1585 | 0 | 0 | 159 | $0.0002 | 0 | 0 | 0 |
| score A-fable-2 | note A-fable-2 2 | anthropic/claude-haiku-5.5 | 1 | 1585 | 0 | 0 | 152 | $0.0002 | 0 | 0 | 0 |
| score A-fable-2 | authorship A-fable-2 1 | anthropic/claude-opus-5.5 | 1 | 35516 | 0 | 0 | 1851 | $0.1791 | 0 | 0 | 0 |
| score A-fable-2 | authorship A-fable-2 2 | anthropic/claude-opus-5.5 | 1 | 35516 | 0 | 0 | 2201 | $0.1861 | 0 | 0 | 0 |
| score A-fable-2 | note extra A-fable-2 1 | anthropic/claude-haiku-5.5 | 1 | 1668 | 0 | 0 | 97 | $0.0002 | 0 | 0 | 0 |
| score A-fable-2 | note extra A-fable-2 2 | anthropic/claude-haiku-5.5 | 1 | 1668 | 0 | 0 | 99 | $0.0002 | 0 | 0 | 0 |
| score A-fable-2 | made A-fable-2 t* 1 | anthropic/claude-haiku-5.5 | 20 | 60478 | 0 | 0 | 1556 | $0.0068 | 0 | 0 | 0 |
| score A-fable-2 | made A-fable-2 t* 2 | anthropic/claude-haiku-5.5 | 20 | 60478 | 0 | 0 | 1595 | $0.0068 | 0 | 0 | 0 |
| score A-fable-2 | made A-fable-2 t* referee | anthropic/claude-opus-5.5 | 1 | 3146 | 0 | 0 | 57 | $0.0137 | 0 | 0 | 0 |
| score A-fable-2 | overlap A-fable-2 1 | anthropic/claude-haiku-5.5 | 1 | 41166 | 0 | 0 | 570 | $0.0044 | 0 | 0 | 0 |
| score A-fable-2 | overlap A-fable-2 2 | anthropic/claude-haiku-5.5 | 1 | 41166 | 0 | 0 | 531 | $0.0044 | 0 | 0 | 0 |
| score A-fable-2 | overlap A-fable-2 referee | anthropic/claude-opus-5.5 | 1 | 41166 | 0 | 0 | 558 | $0.1758 | 0 | 0 | 0 |
| score A-fable-2 | world A-fable-2 1 | anthropic/claude-haiku-5.5 | 1 | 23785 | 0 | 0 | 130 | $0.0024 | 0 | 0 | 0 |
| score A-fable-2 | world A-fable-2 2 | anthropic/claude-haiku-5.5 | 1 | 23785 | 0 | 0 | 118 | $0.0024 | 0 | 0 | 0 |
| A-astra-2 | check A-astra-2 opening | anthropic/claude-haiku-5.5 | 1 | 879 | 0 | 0 | 68 | $0.0001 | 0 | 0 | 0 |
| A-astra-2 | check A-astra-2 t* player | anthropic/claude-haiku-5.5 | 20 | 24142 | 0 | 0 | 1321 | $0.0031 | 0 | 0 | 0 |
| A-astra-2 | dm t* | anthropic/claude-opus-5.5 | 40 | 158 | 1096822 | 1115926 | 113949 | $8.1293 | 0 | 0 | 0 |
| A-astra-2 | dm t* | anthropic/claude-haiku-5.5 | 21 | 52438 | 0 | 0 | 7234 | $0.0089 | 0 | 0 | 0 |
| A-astra-2 | check A-astra-2 t* dm | anthropic/claude-haiku-5.5 | 19 | 23334 | 0 | 0 | 1656 | $0.0032 | 0 | 0 | 0 |
| A-astra-2 | dm t* ooc | anthropic/claude-opus-5.5 | 1 | 15206 | 0 | 26250 | 796 | $0.2867 | 0 | 0 | 0 |
| A-astra-2 | check A-astra-2 t* dm (told before a card) | anthropic/claude-haiku-5.5 | 2 | 1623 | 0 | 0 | 135 | $0.0002 | 0 | 0 | 0 |
| A-astra-2 | check A-astra-2 t* player (card) | anthropic/claude-haiku-5.5 | 4 | 2689 | 0 | 0 | 231 | $0.0004 | 0 | 0 | 0 |
| A-astra-2 | dm t* onward | anthropic/claude-opus-5.5 | 5 | 16 | 240817 | 74748 | 6907 | $0.5601 | 0 | 0 | 0 |
| A-astra-2 | dm t* onward | anthropic/claude-haiku-5.5 | 4 | 8180 | 0 | 0 | 498 | $0.0011 | 0 | 0 | 0 |
| A-astra-2 | check A-astra-2 note | anthropic/claude-haiku-5.5 | 1 | 1349 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| A-astra-2 | check A-astra-2 after | anthropic/claude-haiku-5.5 | 1 | 589 | 0 | 0 | 64 | $0.0001 | 0 | 0 | 0 |
| score A-astra-2 | tag player A-astra-2 t* 1 | anthropic/claude-haiku-5.5 | 20 | 48460 | 0 | 0 | 4470 | $0.0071 | 0 | 0 | 0 |
| score A-astra-2 | tag player A-astra-2 t* 2 | anthropic/claude-haiku-5.5 | 20 | 48460 | 0 | 0 | 4386 | $0.0070 | 0 | 0 | 0 |
| score A-astra-2 | tag player A-astra-2 t* referee | anthropic/claude-opus-5.5 | 4 | 9219 | 0 | 0 | 652 | $0.0499 | 0 | 0 | 0 |
| score A-astra-2 | tag dm A-astra-2 t* 1 | anthropic/claude-haiku-5.5 | 19 | 25541 | 0 | 0 | 5582 | $0.0053 | 0 | 0 | 0 |
| score A-astra-2 | tag dm A-astra-2 t* 2 | anthropic/claude-haiku-5.5 | 19 | 25541 | 0 | 0 | 5795 | $0.0055 | 0 | 0 | 0 |
| score A-astra-2 | threads A-astra-2 | anthropic/claude-opus-5.5 | 1 | 16987 | 0 | 0 | 774 | $0.0834 | 0 | 0 | 0 |
| score A-astra-2 | rollcheck A-astra-2 t* | anthropic/claude-haiku-5.5 | 2 | 3195 | 0 | 0 | 240 | $0.0004 | 0 | 0 | 0 |
| score A-astra-2 | note A-astra-2 1 | anthropic/claude-haiku-5.5 | 1 | 1263 | 0 | 0 | 109 | $0.0002 | 0 | 0 | 0 |
| score A-astra-2 | note A-astra-2 2 | anthropic/claude-haiku-5.5 | 1 | 1263 | 0 | 0 | 130 | $0.0002 | 0 | 0 | 0 |
| score A-astra-2 | authorship A-astra-2 1 | anthropic/claude-opus-5.5 | 1 | 22550 | 0 | 0 | 1797 | $0.1261 | 0 | 0 | 0 |
| score A-astra-2 | authorship A-astra-2 2 | anthropic/claude-opus-5.5 | 1 | 22550 | 0 | 0 | 1635 | $0.1229 | 0 | 0 | 0 |
| score A-astra-2 | note extra A-astra-2 1 | anthropic/claude-haiku-5.5 | 1 | 1346 | 0 | 0 | 660 | $0.0005 | 0 | 0 | 0 |
| score A-astra-2 | note extra A-astra-2 2 | anthropic/claude-haiku-5.5 | 1 | 1346 | 0 | 0 | 439 | $0.0004 | 0 | 0 | 0 |
| score A-astra-2 | note extra A-astra-2 referee | anthropic/claude-opus-5.5 | 1 | 1346 | 0 | 0 | 264 | $0.0107 | 0 | 0 | 0 |
| score A-astra-2 | made A-astra-2 t* 1 | anthropic/claude-haiku-5.5 | 19 | 39437 | 0 | 0 | 1289 | $0.0046 | 0 | 0 | 0 |
| score A-astra-2 | made A-astra-2 t* 2 | anthropic/claude-haiku-5.5 | 19 | 39437 | 0 | 0 | 1288 | $0.0046 | 0 | 0 | 0 |
| score A-astra-2 | overlap A-astra-2 1 | anthropic/claude-haiku-5.5 | 1 | 27757 | 0 | 0 | 559 | $0.0031 | 0 | 0 | 0 |
| score A-astra-2 | overlap A-astra-2 2 | anthropic/claude-haiku-5.5 | 1 | 27757 | 0 | 0 | 580 | $0.0031 | 0 | 0 | 0 |
| score A-astra-2 | overlap A-astra-2 referee | anthropic/claude-opus-5.5 | 1 | 27757 | 0 | 0 | 528 | $0.1216 | 0 | 0 | 0 |
| score A-astra-2 | world A-astra-2 1 | anthropic/claude-haiku-5.5 | 1 | 17248 | 0 | 0 | 122 | $0.0018 | 0 | 0 | 0 |
| score A-astra-2 | world A-astra-2 2 | anthropic/claude-haiku-5.5 | 1 | 17248 | 0 | 0 | 112 | $0.0018 | 0 | 0 | 0 |
| A-sol-2 | check A-sol-2 opening | anthropic/claude-haiku-5.5 | 1 | 879 | 0 | 0 | 74 | $0.0001 | 0 | 0 | 0 |
| A-sol-2 | check A-sol-2 t* player | anthropic/claude-haiku-5.5 | 20 | 23520 | 0 | 0 | 1329 | $0.0030 | 0 | 0 | 0 |
| A-sol-2 | dm t* | anthropic/claude-opus-5.5 | 39 | 156 | 1040248 | 1047270 | 103236 | $7.5568 | 0 | 0 | 0 |
| A-sol-2 | dm t* | anthropic/claude-haiku-5.5 | 20 | 49200 | 0 | 0 | 6670 | $0.0083 | 0 | 0 | 0 |
| A-sol-2 | check A-sol-2 t* dm | anthropic/claude-haiku-5.5 | 18 | 22617 | 0 | 0 | 1351 | $0.0029 | 0 | 0 | 0 |
| A-sol-2 | dm t* ooc | anthropic/claude-opus-5.5 | 2 | 30809 | 46223 | 11641 | 1596 | $0.2575 | 0 | 0 | 0 |
| A-sol-2 | check A-sol-2 t* dm (out of game) | anthropic/claude-haiku-5.5 | 1 | 627 | 0 | 0 | 82 | $0.0001 | 0 | 0 | 0 |
| A-sol-2 | check A-sol-2 t* dm (told before a card) | anthropic/claude-haiku-5.5 | 1 | 584 | 0 | 0 | 75 | $0.0001 | 0 | 0 | 0 |
| A-sol-2 | check A-sol-2 t* player (card) | anthropic/claude-haiku-5.5 | 2 | 1146 | 0 | 0 | 122 | $0.0002 | 0 | 0 | 0 |
| A-sol-2 | dm t* onward | anthropic/claude-opus-5.5 | 2 | 6 | 91654 | 31134 | 2837 | $0.2308 | 0 | 0 | 0 |
| A-sol-2 | dm t* onward | anthropic/claude-haiku-5.5 | 2 | 3916 | 0 | 0 | 406 | $0.0006 | 0 | 0 | 0 |
| A-sol-2 | check A-sol-2 note | anthropic/claude-haiku-5.5 | 1 | 1102 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| A-sol-2 | check A-sol-2 after | anthropic/claude-haiku-5.5 | 1 | 544 | 0 | 0 | 85 | $0.0001 | 0 | 0 | 0 |
| score A-sol-2 | tag player A-sol-2 t* 1 | anthropic/claude-haiku-5.5 | 20 | 46985 | 0 | 0 | 4368 | $0.0069 | 0 | 0 | 0 |
| score A-sol-2 | tag player A-sol-2 t* 2 | anthropic/claude-haiku-5.5 | 20 | 46985 | 0 | 0 | 4669 | $0.0070 | 0 | 0 | 0 |
| score A-sol-2 | tag player A-sol-2 t* referee | anthropic/claude-opus-5.5 | 2 | 5272 | 0 | 0 | 422 | $0.0295 | 0 | 0 | 0 |
| score A-sol-2 | tag dm A-sol-2 t* 1 | anthropic/claude-haiku-5.5 | 18 | 24114 | 0 | 0 | 4950 | $0.0049 | 0 | 0 | 0 |
| score A-sol-2 | tag dm A-sol-2 t* 2 | anthropic/claude-haiku-5.5 | 18 | 24114 | 0 | 0 | 5001 | $0.0049 | 0 | 0 | 0 |
| score A-sol-2 | threads A-sol-2 | anthropic/claude-opus-5.5 | 1 | 16196 | 0 | 0 | 618 | $0.0771 | 0 | 0 | 0 |
| score A-sol-2 | rollcheck A-sol-2 t* | anthropic/claude-haiku-5.5 | 1 | 1520 | 0 | 0 | 121 | $0.0002 | 0 | 0 | 0 |
| score A-sol-2 | note A-sol-2 1 | anthropic/claude-haiku-5.5 | 1 | 1016 | 0 | 0 | 108 | $0.0002 | 0 | 0 | 0 |
| score A-sol-2 | note A-sol-2 2 | anthropic/claude-haiku-5.5 | 1 | 1016 | 0 | 0 | 104 | $0.0002 | 0 | 0 | 0 |
| score A-sol-2 | authorship A-sol-2 1 | anthropic/claude-opus-5.5 | 1 | 21172 | 0 | 0 | 1314 | $0.1110 | 0 | 0 | 0 |
| score A-sol-2 | authorship A-sol-2 2 | anthropic/claude-opus-5.5 | 1 | 21172 | 0 | 0 | 1295 | $0.1106 | 0 | 0 | 0 |
| score A-sol-2 | note extra A-sol-2 1 | anthropic/claude-haiku-5.5 | 1 | 1099 | 0 | 0 | 267 | $0.0002 | 0 | 0 | 0 |
| score A-sol-2 | note extra A-sol-2 2 | anthropic/claude-haiku-5.5 | 1 | 1099 | 0 | 0 | 233 | $0.0002 | 0 | 0 | 0 |
| score A-sol-2 | made A-sol-2 t* 1 | anthropic/claude-haiku-5.5 | 18 | 37612 | 0 | 0 | 1234 | $0.0044 | 0 | 0 | 0 |
| score A-sol-2 | made A-sol-2 t* 2 | anthropic/claude-haiku-5.5 | 18 | 37612 | 0 | 0 | 1230 | $0.0044 | 0 | 0 | 0 |
| score A-sol-2 | overlap A-sol-2 1 | anthropic/claude-haiku-5.5 | 1 | 26151 | 0 | 0 | 554 | $0.0029 | 0 | 0 | 0 |
| score A-sol-2 | overlap A-sol-2 2 | anthropic/claude-haiku-5.5 | 1 | 26151 | 0 | 0 | 565 | $0.0029 | 0 | 0 | 0 |
| score A-sol-2 | overlap A-sol-2 referee | anthropic/claude-opus-5.5 | 1 | 26151 | 0 | 0 | 549 | $0.1156 | 0 | 0 | 0 |
| score A-sol-2 | world A-sol-2 1 | anthropic/claude-haiku-5.5 | 1 | 16725 | 0 | 0 | 111 | $0.0017 | 0 | 0 | 0 |
| score A-sol-2 | world A-sol-2 2 | anthropic/claude-haiku-5.5 | 1 | 16725 | 0 | 0 | 110 | $0.0017 | 0 | 0 | 0 |
| A-deepseek-2 | check A-deepseek-2 opening | anthropic/claude-haiku-5.5 | 1 | 879 | 0 | 0 | 70 | $0.0001 | 0 | 0 | 0 |
| A-deepseek-2 | player t* | deepseek/deepseek-v4-pro-0813 | 20 | 35093 | 424960 | 0 | 28506 | $0.1622 | 0 | 0 | 0 |
| A-deepseek-2 | check A-deepseek-2 t* player | anthropic/claude-haiku-5.5 | 20 | 35825 | 0 | 0 | 1440 | $0.0043 | 0 | 0 | 0 |
| A-deepseek-2 | dm t* | anthropic/claude-opus-5.5 | 45 | 174 | 1491244 | 1327536 | 134478 | $9.7149 | 0 | 0 | 0 |
| A-deepseek-2 | dm t* | anthropic/claude-haiku-5.5 | 22 | 56017 | 0 | 0 | 6159 | $0.0087 | 0 | 0 | 0 |
| A-deepseek-2 | check A-deepseek-2 t* dm | anthropic/claude-haiku-5.5 | 20 | 35940 | 0 | 0 | 1595 | $0.0044 | 0 | 0 | 0 |
| A-deepseek-2 | check A-deepseek-2 t* dm (told before a card) | anthropic/claude-haiku-5.5 | 2 | 2377 | 0 | 0 | 177 | $0.0003 | 0 | 0 | 0 |
| A-deepseek-2 | player t* card 1 | deepseek/deepseek-v4-pro-0813 | 2 | 1951 | 29440 | 0 | 244 | $0.0061 | 0 | 0 | 0 |
| A-deepseek-2 | check A-deepseek-2 t* player (card) | anthropic/claude-haiku-5.5 | 10 | 11974 | 0 | 0 | 713 | $0.0016 | 0 | 0 | 0 |
| A-deepseek-2 | player t* card 2 | deepseek/deepseek-v4-pro-0813 | 2 | 659 | 30976 | 0 | 1830 | $0.0087 | 0 | 0 | 0 |
| A-deepseek-2 | dm t* card prose | anthropic/claude-opus-5.5 | 6 | 92411 | 145408 | 9331 | 7545 | $0.6243 | 0 | 0 | 0 |
| A-deepseek-2 | check A-deepseek-2 t* dm (out of game, prose at a card) | anthropic/claude-haiku-5.5 | 5 | 7971 | 0 | 0 | 348 | $0.0010 | 0 | 0 | 0 |
| A-deepseek-2 | player t* card 3 | deepseek/deepseek-v4-pro-0813 | 2 | 2530 | 31232 | 0 | 1700 | $0.0108 | 0 | 0 | 0 |
| A-deepseek-2 | dm t* card prose (with a press) | anthropic/claude-opus-5.5 | 1 | 12769 | 21629 | 0 | 757 | $0.0705 | 0 | 0 | 0 |
| A-deepseek-2 | check A-deepseek-2 t* dm (out of game, with a press) | anthropic/claude-haiku-5.5 | 1 | 527 | 0 | 0 | 59 | $0.0001 | 0 | 0 | 0 |
| A-deepseek-2 | dm t* onward | anthropic/claude-opus-5.5 | 5 | 16 | 206219 | 63582 | 10723 | $0.5737 | 0 | 0 | 0 |
| A-deepseek-2 | dm t* onward | anthropic/claude-haiku-5.5 | 4 | 8278 | 0 | 0 | 572 | $0.0011 | 0 | 0 | 0 |
| A-deepseek-2 | player t* card 4 | deepseek/deepseek-v4-pro-0813 | 1 | 1180 | 19456 | 0 | 935 | $0.0059 | 0 | 0 | 0 |
| A-deepseek-2 | player t* card 5 | deepseek/deepseek-v4-pro-0813 | 1 | 1277 | 20480 | 0 | 532 | $0.0051 | 0 | 0 | 0 |
| A-deepseek-2 | player t* card 6 | deepseek/deepseek-v4-pro-0813 | 1 | 537 | 21504 | 0 | 493 | $0.0041 | 0 | 0 | 0 |
| A-deepseek-2 | player t* card 7 | deepseek/deepseek-v4-pro-0813 | 1 | 894 | 21760 | 0 | 267 | $0.0040 | 0 | 0 | 0 |
| A-deepseek-2 | note | deepseek/deepseek-v4-pro-0813 | 1 | 1079 | 37632 | 0 | 980 | $0.0077 | 0 | 0 | 0 |
| A-deepseek-2 | check A-deepseek-2 note | anthropic/claude-haiku-5.5 | 1 | 1057 | 0 | 0 | 84 | $0.0001 | 0 | 0 | 0 |
| A-deepseek-2 | after | deepseek/deepseek-v4-pro-0813 | 1 | 847 | 38400 | 0 | 1007 | $0.0076 | 0 | 0 | 0 |
| A-deepseek-2 | check A-deepseek-2 after | anthropic/claude-haiku-5.5 | 1 | 640 | 0 | 0 | 69 | $0.0001 | 0 | 0 | 0 |
| score A-deepseek-2 | tag player A-deepseek-2 t* 1 | anthropic/claude-haiku-5.5 | 20 | 63341 | 0 | 0 | 3606 | $0.0081 | 0 | 0 | 0 |
| score A-deepseek-2 | tag player A-deepseek-2 t* 2 | anthropic/claude-haiku-5.5 | 20 | 63341 | 0 | 0 | 3722 | $0.0082 | 0 | 0 | 0 |
| score A-deepseek-2 | tag player A-deepseek-2 t* referee | anthropic/claude-opus-5.5 | 5 | 15280 | 0 | 0 | 1212 | $0.0854 | 0 | 0 | 0 |
| score A-deepseek-2 | tag dm A-deepseek-2 t* 1 | anthropic/claude-haiku-5.5 | 20 | 38205 | 0 | 0 | 6678 | $0.0072 | 0 | 0 | 0 |
| score A-deepseek-2 | tag dm A-deepseek-2 t* 2 | anthropic/claude-haiku-5.5 | 20 | 38205 | 0 | 0 | 6787 | $0.0072 | 0 | 0 | 0 |
| score A-deepseek-2 | threads A-deepseek-2 | anthropic/claude-opus-5.5 | 1 | 19172 | 0 | 0 | 599 | $0.0887 | 0 | 0 | 0 |
| score A-deepseek-2 | rollcheck A-deepseek-2 t* | anthropic/claude-haiku-5.5 | 2 | 3930 | 0 | 0 | 366 | $0.0006 | 0 | 0 | 0 |
| score A-deepseek-2 | note A-deepseek-2 1 | anthropic/claude-haiku-5.5 | 1 | 971 | 0 | 0 | 375 | $0.0003 | 0 | 0 | 0 |
| score A-deepseek-2 | note A-deepseek-2 2 | anthropic/claude-haiku-5.5 | 1 | 971 | 0 | 0 | 237 | $0.0002 | 0 | 0 | 0 |
| score A-deepseek-2 | note A-deepseek-2 referee | anthropic/claude-opus-5.5 | 1 | 971 | 0 | 0 | 246 | $0.0088 | 0 | 0 | 0 |
| score A-deepseek-2 | authorship A-deepseek-2 1 | anthropic/claude-opus-5.5 | 1 | 37047 | 0 | 0 | 1295 | $0.1741 | 0 | 0 | 0 |
| score A-deepseek-2 | authorship A-deepseek-2 2 | anthropic/claude-opus-5.5 | 1 | 37047 | 0 | 0 | 1232 | $0.1728 | 0 | 0 | 0 |
| score A-deepseek-2 | note extra A-deepseek-2 1 | anthropic/claude-haiku-5.5 | 1 | 1054 | 0 | 0 | 95 | $0.0002 | 0 | 0 | 0 |
| score A-deepseek-2 | note extra A-deepseek-2 2 | anthropic/claude-haiku-5.5 | 1 | 1054 | 0 | 0 | 95 | $0.0002 | 0 | 0 | 0 |
| score A-deepseek-2 | made A-deepseek-2 t* 1 | anthropic/claude-haiku-5.5 | 20 | 55861 | 0 | 0 | 1440 | $0.0063 | 0 | 0 | 0 |
| score A-deepseek-2 | made A-deepseek-2 t* 2 | anthropic/claude-haiku-5.5 | 20 | 55861 | 0 | 0 | 1423 | $0.0063 | 0 | 0 | 0 |
| score A-deepseek-2 | overlap A-deepseek-2 1 | anthropic/claude-haiku-5.5 | 1 | 47649 | 0 | 0 | 565 | $0.0050 | 0 | 0 | 0 |
| score A-deepseek-2 | overlap A-deepseek-2 2 | anthropic/claude-haiku-5.5 | 1 | 47649 | 0 | 0 | 551 | $0.0050 | 0 | 0 | 0 |
| score A-deepseek-2 | overlap A-deepseek-2 referee | anthropic/claude-opus-5.5 | 1 | 47649 | 0 | 0 | 553 | $0.2017 | 0 | 0 | 0 |
| score A-deepseek-2 | world A-deepseek-2 1 | anthropic/claude-haiku-5.5 | 1 | 19419 | 0 | 0 | 175 | $0.0020 | 0 | 0 | 0 |
| score A-deepseek-2 | world A-deepseek-2 2 | anthropic/claude-haiku-5.5 | 1 | 19419 | 0 | 0 | 135 | $0.0020 | 0 | 0 | 0 |
| B-opus-1 | check B-opus-1 opening | anthropic/claude-haiku-5.5 | 1 | 796 | 0 | 0 | 75 | $0.0001 | 0 | 0 | 0 |
| B-opus-1 | player t* | anthropic/claude-opus-5.5 | 16 | 64 | 353206 | 34831 | 10765 | $0.4604 | 0 | 0 | 0 |
| B-opus-1 | check B-opus-1 t* player | anthropic/claude-haiku-5.5 | 16 | 26428 | 0 | 0 | 1178 | $0.0032 | 0 | 0 | 0 |
| B-opus-1 | dm t* | anthropic/claude-opus-5.5 | 30 | 120 | 830434 | 893594 | 99636 | $6.6922 | 0 | 0 | 0 |
| B-opus-1 | dm t* | anthropic/claude-haiku-5.5 | 14 | 38137 | 0 | 0 | 5951 | $0.0068 | 0 | 0 | 0 |
| B-opus-1 | check B-opus-1 t* dm | anthropic/claude-haiku-5.5 | 15 | 25086 | 0 | 0 | 1338 | $0.0032 | 0 | 0 | 0 |
| B-opus-1 | check B-opus-1 t* dm (told before a card) | anthropic/claude-haiku-5.5 | 5 | 5091 | 0 | 0 | 342 | $0.0007 | 0 | 0 | 0 |
| B-opus-1 | player t* card 1 | anthropic/claude-opus-5.5 | 5 | 20 | 132745 | 4105 | 299 | $0.0531 | 0 | 0 | 0 |
| B-opus-1 | check B-opus-1 t* player (card) | anthropic/claude-haiku-5.5 | 10 | 6011 | 0 | 0 | 594 | $0.0009 | 0 | 0 | 0 |
| B-opus-1 | player t* card 2 | anthropic/claude-opus-5.5 | 5 | 20 | 136850 | 875 | 491 | $0.0416 | 0 | 0 | 0 |
| B-opus-1 | dm t* onward | anthropic/claude-opus-5.5 | 9 | 28 | 373118 | 150422 | 29744 | $1.4217 | 0 | 0 | 0 |
| B-opus-1 | dm t* onward | anthropic/claude-haiku-5.5 | 9 | 20145 | 0 | 0 | 3182 | $0.0036 | 0 | 0 | 0 |
| B-opus-1 | dm t* card ooc (with a press) | anthropic/claude-opus-5.5 | 1 | 20405 | 17291 | 21638 | 488 | $0.2679 | 0 | 0 | 0 |
| B-opus-1 | note | anthropic/claude-opus-5.5 | 1 | 4 | 39811 | 88 | 1802 | $0.0445 | 0 | 0 | 0 |
| B-opus-1 | check B-opus-1 note | anthropic/claude-haiku-5.5 | 1 | 1507 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| B-opus-1 | after | anthropic/claude-opus-5.5 | 1 | 4 | 39899 | 1172 | 1263 | $0.0391 | 0 | 0 | 0 |
| B-opus-1 | check B-opus-1 after | anthropic/claude-haiku-5.5 | 1 | 1202 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| score B-opus-1 | tag player B-opus-1 t* 1 | anthropic/claude-haiku-5.5 | 16 | 48733 | 0 | 0 | 5200 | $0.0075 | 0 | 0 | 0 |
| score B-opus-1 | tag player B-opus-1 t* 2 | anthropic/claude-haiku-5.5 | 16 | 48733 | 0 | 0 | 5202 | $0.0075 | 0 | 0 | 0 |
| score B-opus-1 | tag player B-opus-1 t* referee | anthropic/claude-opus-5.5 | 3 | 11236 | 0 | 0 | 697 | $0.0589 | 0 | 0 | 0 |
| score B-opus-1 | tag dm B-opus-1 t* 1 | anthropic/claude-haiku-5.5 | 15 | 26854 | 0 | 0 | 4839 | $0.0051 | 0 | 0 | 0 |
| score B-opus-1 | tag dm B-opus-1 t* 2 | anthropic/claude-haiku-5.5 | 15 | 26854 | 0 | 0 | 4999 | $0.0052 | 0 | 0 | 0 |
| score B-opus-1 | threads B-opus-1 | anthropic/claude-opus-5.5 | 1 | 15642 | 0 | 0 | 724 | $0.0770 | 0 | 0 | 0 |
| score B-opus-1 | deception B-opus-1 t* 1 | anthropic/claude-haiku-5.5 | 1 | 2435 | 0 | 0 | 603 | $0.0005 | 0 | 0 | 0 |
| score B-opus-1 | deception B-opus-1 t* 2 | anthropic/claude-haiku-5.5 | 1 | 2435 | 0 | 0 | 783 | $0.0006 | 0 | 0 | 0 |
| score B-opus-1 | rollcheck B-opus-1 t* | anthropic/claude-haiku-5.5 | 4 | 7754 | 0 | 0 | 674 | $0.0011 | 0 | 0 | 0 |
| score B-opus-1 | note B-opus-1 1 | anthropic/claude-haiku-5.5 | 1 | 1421 | 0 | 0 | 219 | $0.0003 | 0 | 0 | 0 |
| score B-opus-1 | note B-opus-1 2 | anthropic/claude-haiku-5.5 | 1 | 1421 | 0 | 0 | 196 | $0.0002 | 0 | 0 | 0 |
| score B-opus-1 | authorship B-opus-1 1 | anthropic/claude-opus-5.5 | 1 | 27485 | 0 | 0 | 1365 | $0.1372 | 0 | 0 | 0 |
| score B-opus-1 | authorship B-opus-1 2 | anthropic/claude-opus-5.5 | 1 | 27485 | 0 | 0 | 1199 | $0.1339 | 0 | 0 | 0 |
| score B-opus-1 | goal scale B-opus-1 t* 1 | anthropic/claude-haiku-5.5 | 1 | 616 | 0 | 0 | 128 | $0.0001 | 0 | 0 | 0 |
| score B-opus-1 | goal scale B-opus-1 t* 2 | anthropic/claude-haiku-5.5 | 1 | 616 | 0 | 0 | 120 | $0.0001 | 0 | 0 | 0 |
| score B-opus-1 | note extra B-opus-1 1 | anthropic/claude-haiku-5.5 | 1 | 1504 | 0 | 0 | 623 | $0.0005 | 0 | 0 | 0 |
| score B-opus-1 | note extra B-opus-1 2 | anthropic/claude-haiku-5.5 | 1 | 1504 | 0 | 0 | 500 | $0.0004 | 0 | 0 | 0 |
| score B-opus-1 | note extra B-opus-1 referee | anthropic/claude-opus-5.5 | 1 | 1504 | 0 | 0 | 241 | $0.0108 | 0 | 0 | 0 |
| score B-opus-1 | made B-opus-1 t* 1 | anthropic/claude-haiku-5.5 | 16 | 42749 | 0 | 0 | 1185 | $0.0049 | 0 | 0 | 0 |
| score B-opus-1 | made B-opus-1 t* 2 | anthropic/claude-haiku-5.5 | 16 | 42749 | 0 | 0 | 1198 | $0.0049 | 0 | 0 | 0 |
| score B-opus-1 | lady B-opus-1 t* 1 | anthropic/claude-haiku-5.5 | 5 | 9993 | 0 | 0 | 472 | $0.0012 | 0 | 0 | 0 |
| score B-opus-1 | lady B-opus-1 t* 2 | anthropic/claude-haiku-5.5 | 5 | 9993 | 0 | 0 | 505 | $0.0013 | 0 | 0 | 0 |
| score B-opus-1 | overlap B-opus-1 1 | anthropic/claude-haiku-5.5 | 1 | 32812 | 0 | 0 | 1158 | $0.0039 | 0 | 0 | 0 |
| score B-opus-1 | overlap B-opus-1 2 | anthropic/claude-haiku-5.5 | 1 | 32812 | 0 | 0 | 1322 | $0.0039 | 0 | 0 | 0 |
| score B-opus-1 | overlap B-opus-1 referee | anthropic/claude-opus-5.5 | 1 | 32812 | 0 | 0 | 546 | $0.1422 | 0 | 0 | 0 |
| score B-opus-1 | world B-opus-1 1 | anthropic/claude-haiku-5.5 | 1 | 15876 | 0 | 0 | 155 | $0.0017 | 0 | 0 | 0 |
| score B-opus-1 | world B-opus-1 2 | anthropic/claude-haiku-5.5 | 1 | 15876 | 0 | 0 | 152 | $0.0017 | 0 | 0 | 0 |
| B-fable-1 | check B-fable-1 opening | anthropic/claude-haiku-5.5 | 1 | 796 | 0 | 0 | 69 | $0.0001 | 0 | 0 | 0 |
| B-fable-1 | player t* | anthropic/claude-fable-5.1 | 20 | 80 | 515740 | 42663 | 11052 | $1.2156 | 0 | 0 | 0 |
| B-fable-1 | check B-fable-1 t* player | anthropic/claude-haiku-5.5 | 20 | 33392 | 0 | 0 | 1533 | $0.0041 | 0 | 0 | 0 |
| B-fable-1 | dm t* | anthropic/claude-opus-5.5 | 43 | 172 | 1282596 | 1517257 | 164689 | $11.2166 | 0 | 0 | 0 |
| B-fable-1 | dm t* | anthropic/claude-haiku-5.5 | 23 | 68569 | 0 | 0 | 11376 | $0.0125 | 0 | 0 | 0 |
| B-fable-1 | check B-fable-1 t* dm | anthropic/claude-haiku-5.5 | 20 | 33805 | 0 | 0 | 1596 | $0.0042 | 0 | 0 | 0 |
| B-fable-1 | check B-fable-1 t* dm (told before a card) | anthropic/claude-haiku-5.5 | 1 | 980 | 0 | 0 | 58 | $0.0001 | 0 | 0 | 0 |
| B-fable-1 | player t* card 1 | anthropic/claude-fable-5.1 | 1 | 4 | 21722 | 797 | 9 | $0.0159 | 0 | 0 | 0 |
| B-fable-1 | check B-fable-1 t* player (card) | anthropic/claude-haiku-5.5 | 2 | 1248 | 0 | 0 | 122 | $0.0002 | 0 | 0 | 0 |
| B-fable-1 | player t* card 2 | anthropic/claude-fable-5.1 | 1 | 4 | 22519 | 199 | 7 | $0.0085 | 0 | 0 | 0 |
| B-fable-1 | dm t* onward | anthropic/claude-opus-5.5 | 3 | 10 | 134734 | 40673 | 6916 | $0.3687 | 0 | 0 | 0 |
| B-fable-1 | dm t* onward | anthropic/claude-haiku-5.5 | 3 | 6602 | 0 | 0 | 1533 | $0.0014 | 0 | 0 | 0 |
| B-fable-1 | note | anthropic/claude-fable-5.1 | 1 | 4 | 43659 | 1716 | 2140 | $0.1394 | 0 | 0 | 0 |
| B-fable-1 | check B-fable-1 note | anthropic/claude-haiku-5.5 | 1 | 1660 | 0 | 0 | 81 | $0.0002 | 0 | 0 | 0 |
| B-fable-1 | check referee B-fable-1 note | anthropic/claude-opus-5.5 | 1 | 1660 | 0 | 0 | 55 | $0.0077 | 0 | 0 | 0 |
| B-fable-1 | after | anthropic/claude-fable-5.1 | 1 | 4 | 45375 | 1325 | 1561 | $0.1060 | 0 | 0 | 0 |
| B-fable-1 | check B-fable-1 after | anthropic/claude-haiku-5.5 | 1 | 1212 | 0 | 0 | 85 | $0.0002 | 0 | 0 | 0 |
| score B-fable-1 | tag player B-fable-1 t* 1 | anthropic/claude-haiku-5.5 | 20 | 62377 | 0 | 0 | 3168 | $0.0078 | 0 | 0 | 0 |
| score B-fable-1 | tag player B-fable-1 t* 2 | anthropic/claude-haiku-5.5 | 20 | 62377 | 0 | 0 | 4788 | $0.0086 | 0 | 0 | 0 |
| score B-fable-1 | tag player B-fable-1 t* referee | anthropic/claude-opus-5.5 | 4 | 13057 | 0 | 0 | 1197 | $0.0762 | 0 | 0 | 0 |
| score B-fable-1 | tag dm B-fable-1 t* 1 | anthropic/claude-haiku-5.5 | 20 | 35504 | 0 | 0 | 6478 | $0.0068 | 0 | 0 | 0 |
| score B-fable-1 | tag dm B-fable-1 t* 2 | anthropic/claude-haiku-5.5 | 20 | 35504 | 0 | 0 | 6186 | $0.0066 | 0 | 0 | 0 |
| score B-fable-1 | threads B-fable-1 | anthropic/claude-opus-5.5 | 1 | 21207 | 0 | 0 | 704 | $0.0989 | 0 | 0 | 0 |
| score B-fable-1 | rollcheck B-fable-1 t* | anthropic/claude-haiku-5.5 | 1 | 1821 | 0 | 0 | 197 | $0.0003 | 0 | 0 | 0 |
| score B-fable-1 | note B-fable-1 1 | anthropic/claude-haiku-5.5 | 1 | 1574 | 0 | 0 | 191 | $0.0003 | 0 | 0 | 0 |
| score B-fable-1 | note B-fable-1 2 | anthropic/claude-haiku-5.5 | 1 | 1574 | 0 | 0 | 183 | $0.0002 | 0 | 0 | 0 |
| score B-fable-1 | authorship B-fable-1 1 | anthropic/claude-opus-5.5 | 1 | 32993 | 0 | 0 | 1506 | $0.1621 | 0 | 0 | 0 |
| score B-fable-1 | authorship B-fable-1 2 | anthropic/claude-opus-5.5 | 1 | 32993 | 0 | 0 | 1504 | $0.1621 | 0 | 0 | 0 |
| score B-fable-1 | goal scale B-fable-1 t* 1 | anthropic/claude-haiku-5.5 | 1 | 626 | 0 | 0 | 355 | $0.0002 | 0 | 0 | 0 |
| score B-fable-1 | goal scale B-fable-1 t* 2 | anthropic/claude-haiku-5.5 | 1 | 626 | 0 | 0 | 312 | $0.0002 | 0 | 0 | 0 |
| score B-fable-1 | note extra B-fable-1 1 | anthropic/claude-haiku-5.5 | 1 | 1657 | 0 | 0 | 319 | $0.0003 | 0 | 0 | 0 |
| score B-fable-1 | note extra B-fable-1 2 | anthropic/claude-haiku-5.5 | 1 | 1657 | 0 | 0 | 305 | $0.0003 | 0 | 0 | 0 |
| score B-fable-1 | made B-fable-1 t* 1 | anthropic/claude-haiku-5.5 | 20 | 54897 | 0 | 0 | 1480 | $0.0062 | 0 | 0 | 0 |
| score B-fable-1 | made B-fable-1 t* 2 | anthropic/claude-haiku-5.5 | 20 | 54897 | 0 | 0 | 1560 | $0.0063 | 0 | 0 | 0 |
| score B-fable-1 | lady B-fable-1 t* 1 | anthropic/claude-haiku-5.5 | 5 | 11606 | 0 | 0 | 570 | $0.0014 | 0 | 0 | 0 |
| score B-fable-1 | lady B-fable-1 t* 2 | anthropic/claude-haiku-5.5 | 5 | 11606 | 0 | 0 | 768 | $0.0015 | 0 | 0 | 0 |
| score B-fable-1 | overlap B-fable-1 1 | anthropic/claude-haiku-5.5 | 1 | 38204 | 0 | 0 | 1416 | $0.0045 | 0 | 0 | 0 |
| score B-fable-1 | overlap B-fable-1 2 | anthropic/claude-haiku-5.5 | 1 | 38204 | 0 | 0 | 1631 | $0.0046 | 0 | 0 | 0 |
| score B-fable-1 | overlap B-fable-1 referee | anthropic/claude-opus-5.5 | 1 | 38204 | 0 | 0 | 548 | $0.1638 | 0 | 0 | 0 |
| score B-fable-1 | world B-fable-1 1 | anthropic/claude-haiku-5.5 | 1 | 21371 | 0 | 0 | 146 | $0.0022 | 0 | 0 | 0 |
| score B-fable-1 | world B-fable-1 2 | anthropic/claude-haiku-5.5 | 1 | 21371 | 0 | 0 | 125 | $0.0022 | 0 | 0 | 0 |
| B-astra-1 | check B-astra-1 opening | anthropic/claude-haiku-5.5 | 1 | 796 | 0 | 0 | 87 | $0.0001 | 0 | 0 | 0 |
| B-astra-1 | check B-astra-1 t* player | anthropic/claude-haiku-5.5 | 20 | 26015 | 0 | 0 | 1362 | $0.0033 | 0 | 0 | 0 |
| B-astra-1 | dm t* | anthropic/claude-opus-5.5 | 44 | 174 | 1301339 | 1287615 | 130886 | $9.3765 | 0 | 0 | 0 |
| B-astra-1 | dm t* | anthropic/claude-haiku-5.5 | 21 | 52990 | 0 | 0 | 7795 | $0.0092 | 0 | 0 | 0 |
| B-astra-1 | check B-astra-1 t* dm | anthropic/claude-haiku-5.5 | 20 | 26386 | 0 | 0 | 1514 | $0.0034 | 0 | 0 | 0 |
| B-astra-1 | check B-astra-1 t* dm (told before a card) | anthropic/claude-haiku-5.5 | 3 | 2238 | 0 | 0 | 208 | $0.0003 | 0 | 0 | 0 |
| B-astra-1 | check B-astra-1 t* player (card) | anthropic/claude-haiku-5.5 | 7 | 4261 | 0 | 0 | 423 | $0.0006 | 0 | 0 | 0 |
| B-astra-1 | dm t* onward | anthropic/claude-opus-5.5 | 6 | 18 | 265908 | 123171 | 16994 | $1.0090 | 0 | 0 | 0 |
| B-astra-1 | dm t* onward | anthropic/claude-haiku-5.5 | 6 | 13281 | 0 | 0 | 1688 | $0.0022 | 0 | 0 | 0 |
| B-astra-1 | check B-astra-1 note | anthropic/claude-haiku-5.5 | 1 | 1373 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| B-astra-1 | check B-astra-1 after | anthropic/claude-haiku-5.5 | 1 | 602 | 0 | 0 | 69 | $0.0001 | 0 | 0 | 0 |
| score B-astra-1 | tag player B-astra-1 t* 1 | anthropic/claude-haiku-5.5 | 20 | 52815 | 0 | 0 | 4840 | $0.0077 | 0 | 0 | 0 |
| score B-astra-1 | tag player B-astra-1 t* 2 | anthropic/claude-haiku-5.5 | 20 | 52815 | 0 | 0 | 4208 | $0.0074 | 0 | 0 | 0 |
| score B-astra-1 | tag player B-astra-1 t* referee | anthropic/claude-opus-5.5 | 5 | 13230 | 0 | 0 | 662 | $0.0662 | 0 | 0 | 0 |
| score B-astra-1 | tag dm B-astra-1 t* 1 | anthropic/claude-haiku-5.5 | 20 | 28556 | 0 | 0 | 6454 | $0.0061 | 0 | 0 | 0 |
| score B-astra-1 | tag dm B-astra-1 t* 2 | anthropic/claude-haiku-5.5 | 20 | 28556 | 0 | 0 | 6298 | $0.0060 | 0 | 0 | 0 |
| score B-astra-1 | threads B-astra-1 | anthropic/claude-opus-5.5 | 1 | 18551 | 0 | 0 | 699 | $0.0882 | 0 | 0 | 0 |
| score B-astra-1 | rollcheck B-astra-1 t* | anthropic/claude-haiku-5.5 | 4 | 6651 | 0 | 0 | 830 | $0.0011 | 0 | 0 | 0 |
| score B-astra-1 | note B-astra-1 1 | anthropic/claude-haiku-5.5 | 1 | 1287 | 0 | 0 | 122 | $0.0002 | 0 | 0 | 0 |
| score B-astra-1 | note B-astra-1 2 | anthropic/claude-haiku-5.5 | 1 | 1287 | 0 | 0 | 107 | $0.0002 | 0 | 0 | 0 |
| score B-astra-1 | authorship B-astra-1 1 | anthropic/claude-opus-5.5 | 1 | 26273 | 0 | 0 | 1652 | $0.1381 | 0 | 0 | 0 |
| score B-astra-1 | authorship B-astra-1 2 | anthropic/claude-opus-5.5 | 1 | 26273 | 0 | 0 | 1288 | $0.1309 | 0 | 0 | 0 |
| score B-astra-1 | goal scale B-astra-1 t* 1 | anthropic/claude-haiku-5.5 | 1 | 391 | 0 | 0 | 347 | $0.0002 | 0 | 0 | 0 |
| score B-astra-1 | goal scale B-astra-1 t* 2 | anthropic/claude-haiku-5.5 | 1 | 391 | 0 | 0 | 352 | $0.0002 | 0 | 0 | 0 |
| score B-astra-1 | goal scale B-astra-1 t* referee | anthropic/claude-opus-5.5 | 1 | 391 | 0 | 0 | 139 | $0.0043 | 0 | 0 | 0 |
| score B-astra-1 | note extra B-astra-1 1 | anthropic/claude-haiku-5.5 | 1 | 1370 | 0 | 0 | 197 | $0.0002 | 0 | 0 | 0 |
| score B-astra-1 | note extra B-astra-1 2 | anthropic/claude-haiku-5.5 | 1 | 1370 | 0 | 0 | 228 | $0.0003 | 0 | 0 | 0 |
| score B-astra-1 | made B-astra-1 t* 1 | anthropic/claude-haiku-5.5 | 20 | 45335 | 0 | 0 | 1431 | $0.0052 | 0 | 0 | 0 |
| score B-astra-1 | made B-astra-1 t* 2 | anthropic/claude-haiku-5.5 | 20 | 45335 | 0 | 0 | 1429 | $0.0052 | 0 | 0 | 0 |
| score B-astra-1 | lady B-astra-1 t* 1 | anthropic/claude-haiku-5.5 | 5 | 9282 | 0 | 0 | 630 | $0.0012 | 0 | 0 | 0 |
| score B-astra-1 | lady B-astra-1 t* 2 | anthropic/claude-haiku-5.5 | 5 | 9282 | 0 | 0 | 723 | $0.0013 | 0 | 0 | 0 |
| score B-astra-1 | overlap B-astra-1 1 | anthropic/claude-haiku-5.5 | 1 | 31262 | 0 | 0 | 519 | $0.0034 | 0 | 0 | 0 |
| score B-astra-1 | overlap B-astra-1 2 | anthropic/claude-haiku-5.5 | 1 | 31262 | 0 | 0 | 524 | $0.0034 | 0 | 0 | 0 |
| score B-astra-1 | overlap B-astra-1 referee | anthropic/claude-opus-5.5 | 1 | 31262 | 0 | 0 | 528 | $0.1356 | 0 | 0 | 0 |
| score B-astra-1 | world B-astra-1 1 | anthropic/claude-haiku-5.5 | 1 | 18715 | 0 | 0 | 157 | $0.0019 | 0 | 0 | 0 |
| score B-astra-1 | world B-astra-1 2 | anthropic/claude-haiku-5.5 | 1 | 18715 | 0 | 0 | 122 | $0.0019 | 0 | 0 | 0 |
| B-sol-1 | check B-sol-1 opening | anthropic/claude-haiku-5.5 | 1 | 796 | 0 | 0 | 79 | $0.0001 | 0 | 0 | 0 |
| B-sol-1 | check B-sol-1 t* player | anthropic/claude-haiku-5.5 | 20 | 29764 | 0 | 0 | 1332 | $0.0036 | 0 | 0 | 0 |
| B-sol-1 | dm t* | anthropic/claude-opus-5.5 | 49 | 190 | 1650922 | 1371975 | 141995 | $10.1019 | 0 | 0 | 0 |
| B-sol-1 | dm t* | anthropic/claude-haiku-5.5 | 23 | 62702 | 0 | 0 | 10905 | $0.0117 | 0 | 0 | 0 |
| B-sol-1 | check B-sol-1 t* dm | anthropic/claude-haiku-5.5 | 20 | 30783 | 0 | 0 | 1631 | $0.0039 | 0 | 0 | 0 |
| B-sol-1 | check B-sol-1 t* dm (told before a card) | anthropic/claude-haiku-5.5 | 2 | 1703 | 0 | 0 | 149 | $0.0002 | 0 | 0 | 0 |
| B-sol-1 | check B-sol-1 t* player (card) | anthropic/claude-haiku-5.5 | 5 | 3372 | 0 | 0 | 296 | $0.0005 | 0 | 0 | 0 |
| B-sol-1 | dm t* onward | anthropic/claude-opus-5.5 | 4 | 12 | 162367 | 73989 | 13333 | $0.6691 | 0 | 0 | 0 |
| B-sol-1 | dm t* onward | anthropic/claude-haiku-5.5 | 4 | 9944 | 0 | 0 | 1290 | $0.0016 | 0 | 0 | 0 |
| B-sol-1 | check B-sol-1 note | anthropic/claude-haiku-5.5 | 1 | 1073 | 0 | 0 | 70 | $0.0001 | 0 | 0 | 0 |
| B-sol-1 | check B-sol-1 after | anthropic/claude-haiku-5.5 | 1 | 578 | 0 | 0 | 66 | $0.0001 | 0 | 0 | 0 |
| score B-sol-1 | tag player B-sol-1 t* 1 | anthropic/claude-haiku-5.5 | 20 | 60952 | 0 | 0 | 3564 | $0.0079 | 0 | 0 | 0 |
| score B-sol-1 | tag player B-sol-1 t* 2 | anthropic/claude-haiku-5.5 | 20 | 60952 | 0 | 0 | 4612 | $0.0084 | 0 | 0 | 0 |
| score B-sol-1 | tag player B-sol-1 t* referee | anthropic/claude-opus-5.5 | 5 | 15603 | 0 | 0 | 755 | $0.0775 | 0 | 0 | 0 |
| score B-sol-1 | tag dm B-sol-1 t* 1 | anthropic/claude-haiku-5.5 | 20 | 33026 | 0 | 0 | 6435 | $0.0065 | 0 | 0 | 0 |
| score B-sol-1 | tag dm B-sol-1 t* 2 | anthropic/claude-haiku-5.5 | 20 | 33026 | 0 | 0 | 6485 | $0.0065 | 0 | 0 | 0 |
| score B-sol-1 | threads B-sol-1 | anthropic/claude-opus-5.5 | 1 | 22833 | 0 | 0 | 670 | $0.1047 | 0 | 0 | 0 |
| score B-sol-1 | rollcheck B-sol-1 t* | anthropic/claude-haiku-5.5 | 3 | 5613 | 0 | 0 | 458 | $0.0008 | 0 | 0 | 0 |
| score B-sol-1 | note B-sol-1 1 | anthropic/claude-haiku-5.5 | 1 | 987 | 0 | 0 | 122 | $0.0002 | 0 | 0 | 0 |
| score B-sol-1 | note B-sol-1 2 | anthropic/claude-haiku-5.5 | 1 | 987 | 0 | 0 | 120 | $0.0002 | 0 | 0 | 0 |
| score B-sol-1 | authorship B-sol-1 1 | anthropic/claude-opus-5.5 | 1 | 30293 | 0 | 0 | 1242 | $0.1460 | 0 | 0 | 0 |
| score B-sol-1 | authorship B-sol-1 2 | anthropic/claude-opus-5.5 | 1 | 30293 | 0 | 0 | 1447 | $0.1501 | 0 | 0 | 0 |
| score B-sol-1 | goal scale B-sol-1 t* 1 | anthropic/claude-haiku-5.5 | 1 | 415 | 0 | 0 | 190 | $0.0001 | 0 | 0 | 0 |
| score B-sol-1 | goal scale B-sol-1 t* 2 | anthropic/claude-haiku-5.5 | 1 | 415 | 0 | 0 | 147 | $0.0001 | 0 | 0 | 0 |
| score B-sol-1 | note extra B-sol-1 1 | anthropic/claude-haiku-5.5 | 1 | 1070 | 0 | 0 | 255 | $0.0002 | 0 | 0 | 0 |
| score B-sol-1 | note extra B-sol-1 2 | anthropic/claude-haiku-5.5 | 1 | 1070 | 0 | 0 | 221 | $0.0002 | 0 | 0 | 0 |
| score B-sol-1 | made B-sol-1 t* 1 | anthropic/claude-haiku-5.5 | 20 | 53472 | 0 | 0 | 1497 | $0.0061 | 0 | 0 | 0 |
| score B-sol-1 | made B-sol-1 t* 2 | anthropic/claude-haiku-5.5 | 20 | 53472 | 0 | 0 | 1471 | $0.0061 | 0 | 0 | 0 |
| score B-sol-1 | lady B-sol-1 t* 1 | anthropic/claude-haiku-5.5 | 5 | 9397 | 0 | 0 | 419 | $0.0011 | 0 | 0 | 0 |
| score B-sol-1 | lady B-sol-1 t* 2 | anthropic/claude-haiku-5.5 | 5 | 9397 | 0 | 0 | 415 | $0.0011 | 0 | 0 | 0 |
| score B-sol-1 | overlap B-sol-1 1 | anthropic/claude-haiku-5.5 | 1 | 35407 | 0 | 0 | 515 | $0.0038 | 0 | 0 | 0 |
| score B-sol-1 | overlap B-sol-1 2 | anthropic/claude-haiku-5.5 | 1 | 35407 | 0 | 0 | 530 | $0.0038 | 0 | 0 | 0 |
| score B-sol-1 | overlap B-sol-1 referee | anthropic/claude-opus-5.5 | 1 | 35407 | 0 | 0 | 515 | $0.1519 | 0 | 0 | 0 |
| score B-sol-1 | world B-sol-1 1 | anthropic/claude-haiku-5.5 | 1 | 23030 | 0 | 0 | 177 | $0.0024 | 0 | 0 | 0 |
| score B-sol-1 | world B-sol-1 2 | anthropic/claude-haiku-5.5 | 1 | 23030 | 0 | 0 | 136 | $0.0024 | 0 | 0 | 0 |
| B-deepseek-1 | check B-deepseek-1 opening | anthropic/claude-haiku-5.5 | 1 | 796 | 0 | 0 | 78 | $0.0001 | 0 | 0 | 0 |
| B-deepseek-1 | player t* | deepseek/deepseek-v4-pro-0813 | 6 | 13305 | 50176 | 0 | 2741 | $0.0294 | 0 | 0 | 0 |
| B-deepseek-1 | check B-deepseek-1 t* player | anthropic/claude-haiku-5.5 | 6 | 6908 | 0 | 0 | 394 | $0.0009 | 0 | 0 | 0 |
| B-deepseek-1 | dm t* | anthropic/claude-opus-5.5 | 11 | 44 | 226392 | 264171 | 25651 | $1.8924 | 0 | 0 | 0 |
| B-deepseek-1 | dm t* | anthropic/claude-haiku-5.5 | 5 | 10469 | 0 | 0 | 1594 | $0.0018 | 0 | 0 | 0 |
| B-deepseek-1 | check B-deepseek-1 t* dm | anthropic/claude-haiku-5.5 | 5 | 5919 | 0 | 0 | 372 | $0.0008 | 0 | 0 | 0 |
| B-deepseek-1 | check B-deepseek-1 t* dm (told before a card) | anthropic/claude-haiku-5.5 | 1 | 904 | 0 | 0 | 62 | $0.0001 | 0 | 0 | 0 |
| B-deepseek-1 | player t* card 1 | deepseek/deepseek-v4-pro-0813 | 1 | 620 | 12288 | 0 | 823 | $0.0042 | 0 | 0 | 0 |
| B-deepseek-1 | check B-deepseek-1 t* player (card) | anthropic/claude-haiku-5.5 | 12 | 15054 | 0 | 0 | 1097 | $0.0021 | 0 | 0 | 0 |
| B-deepseek-1 | dm t* card prose | anthropic/claude-opus-5.5 | 10 | 134019 | 199611 | 22179 | 14957 | $1.0526 | 0 | 0 | 0 |
| B-deepseek-1 | player t* card 2 | deepseek/deepseek-v4-pro-0813 | 1 | 663 | 12800 | 0 | 900 | $0.0045 | 0 | 0 | 0 |
| B-deepseek-1 | check B-deepseek-1 t* dm (out of game, prose at a card) | anthropic/claude-haiku-5.5 | 7 | 10866 | 0 | 0 | 484 | $0.0013 | 0 | 0 | 0 |
| B-deepseek-1 | player t* card 3 | deepseek/deepseek-v4-pro-0813 | 1 | 1396 | 13312 | 0 | 739 | $0.0051 | 0 | 0 | 0 |
| B-deepseek-1 | player t* card 4 | deepseek/deepseek-v4-pro-0813 | 1 | 1135 | 14592 | 0 | 110 | $0.0032 | 0 | 0 | 0 |
| B-deepseek-1 | player t* card 5 | deepseek/deepseek-v4-pro-0813 | 1 | 208 | 15616 | 0 | 589 | $0.0034 | 0 | 0 | 0 |
| B-deepseek-1 | player t* card 6 | deepseek/deepseek-v4-pro-0813 | 1 | 999 | 15616 | 0 | 755 | $0.0048 | 0 | 0 | 0 |
| B-deepseek-1 | player t* card 7 | deepseek/deepseek-v4-pro-0813 | 1 | 855 | 16384 | 0 | 601 | $0.0043 | 0 | 0 | 0 |
| B-deepseek-1 | player t* card 8 | deepseek/deepseek-v4-pro-0813 | 1 | 767 | 17152 | 0 | 205 | $0.0032 | 0 | 0 | 0 |
| B-deepseek-1 | player t* card 9 | deepseek/deepseek-v4-pro-0813 | 1 | 386 | 17664 | 0 | 689 | $0.0041 | 0 | 0 | 0 |
| B-deepseek-1 | player t* card 10 | deepseek/deepseek-v4-pro-0813 | 1 | 1201 | 17920 | 0 | 675 | $0.0051 | 0 | 0 | 0 |
| B-deepseek-1 | player t* card 11 | deepseek/deepseek-v4-pro-0813 | 1 | 1092 | 18944 | 0 | 342 | $0.0042 | 0 | 0 | 0 |
| B-deepseek-1 | player t* card 12 | deepseek/deepseek-v4-pro-0813 | 1 | 114 | 19968 | 0 | 917 | $0.0045 | 0 | 0 | 0 |
| B-deepseek-1 | note | deepseek/deepseek-v4-pro-0813 | 1 | 807 | 19968 | 0 | 761 | $0.0050 | 0 | 0 | 0 |
| B-deepseek-1 | check B-deepseek-1 note | anthropic/claude-haiku-5.5 | 1 | 1274 | 0 | 0 | 71 | $0.0002 | 0 | 0 | 0 |
| B-deepseek-1 | after | deepseek/deepseek-v4-pro-0813 | 1 | 981 | 20480 | 0 | 569 | $0.0048 | 0 | 0 | 0 |
| B-deepseek-1 | check B-deepseek-1 after | anthropic/claude-haiku-5.5 | 1 | 766 | 0 | 0 | 66 | $0.0001 | 0 | 0 | 0 |
| score B-deepseek-1 | tag player B-deepseek-1 t* 1 | anthropic/claude-haiku-5.5 | 6 | 12197 | 0 | 0 | 1723 | $0.0021 | 0 | 0 | 0 |
| score B-deepseek-1 | tag player B-deepseek-1 t* 2 | anthropic/claude-haiku-5.5 | 6 | 12197 | 0 | 0 | 1496 | $0.0020 | 0 | 0 | 0 |
| score B-deepseek-1 | tag player B-deepseek-1 t* referee | anthropic/claude-opus-5.5 | 3 | 5946 | 0 | 0 | 536 | $0.0345 | 0 | 0 | 0 |
| score B-deepseek-1 | tag dm B-deepseek-1 t* 1 | anthropic/claude-haiku-5.5 | 5 | 6274 | 0 | 0 | 1240 | $0.0012 | 0 | 0 | 0 |
| score B-deepseek-1 | tag dm B-deepseek-1 t* 2 | anthropic/claude-haiku-5.5 | 5 | 6274 | 0 | 0 | 1321 | $0.0013 | 0 | 0 | 0 |
| score B-deepseek-1 | threads B-deepseek-1 | anthropic/claude-opus-5.5 | 1 | 3229 | 0 | 0 | 317 | $0.0193 | 0 | 0 | 0 |
| score B-deepseek-1 | note B-deepseek-1 1 | anthropic/claude-haiku-5.5 | 1 | 1188 | 0 | 0 | 100 | $0.0002 | 0 | 0 | 0 |
| score B-deepseek-1 | note B-deepseek-1 2 | anthropic/claude-haiku-5.5 | 1 | 1188 | 0 | 0 | 98 | $0.0002 | 0 | 0 | 0 |
| score B-deepseek-1 | authorship B-deepseek-1 1 | anthropic/claude-opus-5.5 | 1 | 11732 | 0 | 0 | 589 | $0.0587 | 0 | 0 | 0 |
| score B-deepseek-1 | authorship B-deepseek-1 2 | anthropic/claude-opus-5.5 | 1 | 11732 | 0 | 0 | 670 | $0.0603 | 0 | 0 | 0 |
| score B-deepseek-1 | note extra B-deepseek-1 1 | anthropic/claude-haiku-5.5 | 1 | 1271 | 0 | 0 | 386 | $0.0003 | 0 | 0 | 0 |
| score B-deepseek-1 | note extra B-deepseek-1 2 | anthropic/claude-haiku-5.5 | 1 | 1271 | 0 | 0 | 322 | $0.0003 | 0 | 0 | 0 |
| score B-deepseek-1 | made B-deepseek-1 t* 1 | anthropic/claude-haiku-5.5 | 6 | 9953 | 0 | 0 | 411 | $0.0012 | 0 | 0 | 0 |
| score B-deepseek-1 | made B-deepseek-1 t* 2 | anthropic/claude-haiku-5.5 | 6 | 9953 | 0 | 0 | 432 | $0.0012 | 0 | 0 | 0 |
| score B-deepseek-1 | lady B-deepseek-1 t* 1 | anthropic/claude-haiku-5.5 | 5 | 8627 | 0 | 0 | 417 | $0.0011 | 0 | 0 | 0 |
| score B-deepseek-1 | lady B-deepseek-1 t* 2 | anthropic/claude-haiku-5.5 | 5 | 8627 | 0 | 0 | 469 | $0.0011 | 0 | 0 | 0 |
| score B-deepseek-1 | overlap B-deepseek-1 1 | anthropic/claude-haiku-5.5 | 1 | 22620 | 0 | 0 | 557 | $0.0025 | 0 | 0 | 0 |
| score B-deepseek-1 | overlap B-deepseek-1 2 | anthropic/claude-haiku-5.5 | 1 | 22620 | 0 | 0 | 535 | $0.0025 | 0 | 0 | 0 |
| score B-deepseek-1 | world B-deepseek-1 1 | anthropic/claude-haiku-5.5 | 1 | 3603 | 0 | 0 | 367 | $0.0005 | 0 | 0 | 0 |
| score B-deepseek-1 | world B-deepseek-1 2 | anthropic/claude-haiku-5.5 | 1 | 3603 | 0 | 0 | 420 | $0.0006 | 0 | 0 | 0 |
| B-opus-2 | check B-opus-2 opening | anthropic/claude-haiku-5.5 | 1 | 796 | 0 | 0 | 78 | $0.0001 | 0 | 0 | 0 |
| B-opus-2 | player t* | anthropic/claude-opus-5.5 | 12 | 48 | 217704 | 27532 | 6681 | $0.3150 | 0 | 0 | 0 |
| B-opus-2 | check B-opus-2 t* player | anthropic/claude-haiku-5.5 | 12 | 17236 | 0 | 0 | 893 | $0.0022 | 0 | 0 | 0 |
| B-opus-2 | dm t* | anthropic/claude-opus-5.5 | 25 | 98 | 693776 | 566513 | 61378 | $4.2295 | 0 | 0 | 0 |
| B-opus-2 | dm t* | anthropic/claude-haiku-5.5 | 13 | 33596 | 0 | 0 | 5331 | $0.0060 | 0 | 0 | 0 |
| B-opus-2 | check B-opus-2 t* dm | anthropic/claude-haiku-5.5 | 11 | 15955 | 0 | 0 | 877 | $0.0020 | 0 | 0 | 0 |
| B-opus-2 | check B-opus-2 t* dm (told before a card) | anthropic/claude-haiku-5.5 | 1 | 775 | 0 | 0 | 63 | $0.0001 | 0 | 0 | 0 |
| B-opus-2 | player t* card 1 | anthropic/claude-opus-5.5 | 1 | 4 | 23505 | 565 | 59 | $0.0087 | 0 | 0 | 0 |
| B-opus-2 | check B-opus-2 t* player (card) | anthropic/claude-haiku-5.5 | 2 | 1132 | 0 | 0 | 132 | $0.0002 | 0 | 0 | 0 |
| B-opus-2 | player t* card 2 | anthropic/claude-opus-5.5 | 1 | 4 | 24070 | 155 | 83 | $0.0073 | 0 | 0 | 0 |
| B-opus-2 | dm t* onward | anthropic/claude-opus-5.5 | 3 | 10 | 135036 | 34862 | 7983 | $0.3610 | 0 | 0 | 0 |
| B-opus-2 | dm t* onward | anthropic/claude-haiku-5.5 | 2 | 4629 | 0 | 0 | 574 | $0.0007 | 0 | 0 | 0 |
| B-opus-2 | note | anthropic/claude-opus-5.5 | 1 | 4 | 28252 | 545 | 1997 | $0.0483 | 0 | 0 | 0 |
| B-opus-2 | check B-opus-2 note | anthropic/claude-haiku-5.5 | 1 | 1486 | 0 | 0 | 68 | $0.0002 | 0 | 0 | 0 |
| B-opus-2 | after | anthropic/claude-opus-5.5 | 1 | 4 | 28797 | 1151 | 1055 | $0.0326 | 0 | 0 | 0 |
| B-opus-2 | check B-opus-2 after | anthropic/claude-haiku-5.5 | 1 | 1135 | 0 | 0 | 65 | $0.0001 | 0 | 0 | 0 |
| score B-opus-2 | tag player B-opus-2 t* 1 | anthropic/claude-haiku-5.5 | 11 | 29833 | 0 | 0 | 3669 | $0.0048 | 0 | 0 | 0 |
| score B-opus-2 | tag player B-opus-2 t* 2 | anthropic/claude-haiku-5.5 | 11 | 29833 | 0 | 0 | 3629 | $0.0048 | 0 | 0 | 0 |
| score B-opus-2 | tag player B-opus-2 t* referee | anthropic/claude-opus-5.5 | 3 | 7961 | 0 | 0 | 310 | $0.0380 | 0 | 0 | 0 |
| score B-opus-2 | tag dm B-opus-2 t* 1 | anthropic/claude-haiku-5.5 | 11 | 16970 | 0 | 0 | 3986 | $0.0037 | 0 | 0 | 0 |
| score B-opus-2 | tag dm B-opus-2 t* 2 | anthropic/claude-haiku-5.5 | 11 | 16970 | 0 | 0 | 3995 | $0.0037 | 0 | 0 | 0 |
| score B-opus-2 | threads B-opus-2 | anthropic/claude-opus-5.5 | 1 | 10053 | 0 | 0 | 574 | $0.0517 | 0 | 0 | 0 |
| score B-opus-2 | rollcheck B-opus-2 t* | anthropic/claude-haiku-5.5 | 1 | 1914 | 0 | 0 | 105 | $0.0002 | 0 | 0 | 0 |
| score B-opus-2 | note B-opus-2 1 | anthropic/claude-haiku-5.5 | 1 | 1400 | 0 | 0 | 223 | $0.0003 | 0 | 0 | 0 |
| score B-opus-2 | note B-opus-2 2 | anthropic/claude-haiku-5.5 | 1 | 1400 | 0 | 0 | 119 | $0.0002 | 0 | 0 | 0 |
| score B-opus-2 | authorship B-opus-2 1 | anthropic/claude-opus-5.5 | 1 | 16358 | 0 | 0 | 853 | $0.0825 | 0 | 0 | 0 |
| score B-opus-2 | authorship B-opus-2 2 | anthropic/claude-opus-5.5 | 1 | 16358 | 0 | 0 | 1355 | $0.0925 | 0 | 0 | 0 |
| score B-opus-2 | goal scale B-opus-2 t* 1 | anthropic/claude-haiku-5.5 | 1 | 485 | 0 | 0 | 92 | $0.0001 | 0 | 0 | 0 |
| score B-opus-2 | goal scale B-opus-2 t* 2 | anthropic/claude-haiku-5.5 | 1 | 485 | 0 | 0 | 76 | $0.0001 | 0 | 0 | 0 |
| score B-opus-2 | note extra B-opus-2 1 | anthropic/claude-haiku-5.5 | 1 | 1483 | 0 | 0 | 526 | $0.0004 | 0 | 0 | 0 |
| score B-opus-2 | note extra B-opus-2 2 | anthropic/claude-haiku-5.5 | 1 | 1483 | 0 | 0 | 488 | $0.0004 | 0 | 0 | 0 |
| score B-opus-2 | note extra B-opus-2 referee | anthropic/claude-opus-5.5 | 1 | 1483 | 0 | 0 | 282 | $0.0116 | 0 | 0 | 0 |
| score B-opus-2 | made B-opus-2 t* 1 | anthropic/claude-haiku-5.5 | 11 | 25719 | 0 | 0 | 806 | $0.0030 | 0 | 0 | 0 |
| score B-opus-2 | made B-opus-2 t* 2 | anthropic/claude-haiku-5.5 | 11 | 25719 | 0 | 0 | 787 | $0.0030 | 0 | 0 | 0 |
| score B-opus-2 | lady B-opus-2 t* 1 | anthropic/claude-haiku-5.5 | 5 | 10784 | 0 | 0 | 423 | $0.0013 | 0 | 0 | 0 |
| score B-opus-2 | lady B-opus-2 t* 2 | anthropic/claude-haiku-5.5 | 5 | 10784 | 0 | 0 | 391 | $0.0013 | 0 | 0 | 0 |
| score B-opus-2 | overlap B-opus-2 1 | anthropic/claude-haiku-5.5 | 1 | 21458 | 0 | 0 | 540 | $0.0024 | 0 | 0 | 0 |
| score B-opus-2 | overlap B-opus-2 2 | anthropic/claude-haiku-5.5 | 1 | 21458 | 0 | 0 | 539 | $0.0024 | 0 | 0 | 0 |
| score B-opus-2 | world B-opus-2 1 | anthropic/claude-haiku-5.5 | 1 | 10343 | 0 | 0 | 124 | $0.0011 | 0 | 0 | 0 |
| score B-opus-2 | world B-opus-2 2 | anthropic/claude-haiku-5.5 | 1 | 10343 | 0 | 0 | 144 | $0.0011 | 0 | 0 | 0 |
| B-fable-2 | check B-fable-2 opening | anthropic/claude-haiku-5.5 | 1 | 796 | 0 | 0 | 68 | $0.0001 | 0 | 0 | 0 |
| B-fable-2 | player t* | anthropic/claude-fable-5.1 | 20 | 80 | 549269 | 44764 | 13334 | $1.3644 | 0 | 0 | 0 |
| B-fable-2 | check B-fable-2 t* player | anthropic/claude-haiku-5.5 | 20 | 36898 | 0 | 0 | 1479 | $0.0044 | 0 | 0 | 0 |
| B-fable-2 | dm t* | anthropic/claude-opus-5.5 | 45 | 176 | 1567610 | 1479655 | 182205 | $11.4500 | 0 | 0 | 0 |
| B-fable-2 | dm t* | anthropic/claude-haiku-5.5 | 23 | 71266 | 0 | 0 | 9371 | $0.0118 | 0 | 0 | 0 |
| B-fable-2 | check B-fable-2 t* dm | anthropic/claude-haiku-5.5 | 20 | 38268 | 0 | 0 | 1639 | $0.0046 | 0 | 0 | 0 |
| B-fable-2 | check B-fable-2 t* dm (told before a card) | anthropic/claude-haiku-5.5 | 3 | 3992 | 0 | 0 | 229 | $0.0005 | 0 | 0 | 0 |
| B-fable-2 | player t* card 1 | anthropic/claude-fable-5.1 | 3 | 12 | 78278 | 3355 | 78 | $0.0655 | 0 | 0 | 0 |
| B-fable-2 | check B-fable-2 t* player (card) | anthropic/claude-haiku-5.5 | 10 | 6102 | 0 | 0 | 600 | $0.0009 | 0 | 0 | 0 |
| B-fable-2 | player t* card 2 | anthropic/claude-fable-5.1 | 3 | 12 | 81633 | 467 | 530 | $0.0529 | 0 | 0 | 0 |
| B-fable-2 | dm t* onward | anthropic/claude-opus-5.5 | 7 | 22 | 314220 | 124168 | 22394 | $1.1317 | 0 | 0 | 0 |
| B-fable-2 | dm t* onward | anthropic/claude-haiku-5.5 | 7 | 20649 | 0 | 0 | 2706 | $0.0034 | 0 | 0 | 0 |
| B-fable-2 | player t* card 3 | anthropic/claude-fable-5.1 | 2 | 8 | 63814 | 320 | 78 | $0.0239 | 0 | 0 | 0 |
| B-fable-2 | player t* card 4 | anthropic/claude-fable-5.1 | 2 | 8 | 64134 | 289 | 209 | $0.0302 | 0 | 0 | 0 |
| B-fable-2 | note | anthropic/claude-fable-5.1 | 1 | 4 | 49195 | 2621 | 2856 | $0.1879 | 0 | 0 | 0 |
| B-fable-2 | check B-fable-2 note | anthropic/claude-haiku-5.5 | 1 | 1552 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| B-fable-2 | after | anthropic/claude-fable-5.1 | 1 | 4 | 51816 | 1217 | 1136 | $0.0850 | 0 | 0 | 0 |
| B-fable-2 | check B-fable-2 after | anthropic/claude-haiku-5.5 | 1 | 984 | 0 | 0 | 64 | $0.0001 | 0 | 0 | 0 |
| score B-fable-2 | tag player B-fable-2 t* 1 | anthropic/claude-haiku-5.5 | 20 | 71637 | 0 | 0 | 6305 | $0.0103 | 0 | 0 | 0 |
| score B-fable-2 | tag player B-fable-2 t* 2 | anthropic/claude-haiku-5.5 | 20 | 71637 | 0 | 0 | 5968 | $0.0101 | 0 | 0 | 0 |
| score B-fable-2 | tag player B-fable-2 t* referee | anthropic/claude-opus-5.5 | 8 | 28791 | 0 | 0 | 1382 | $0.1428 | 0 | 0 | 0 |
| score B-fable-2 | tag dm B-fable-2 t* 1 | anthropic/claude-haiku-5.5 | 20 | 41232 | 0 | 0 | 6756 | $0.0075 | 0 | 0 | 0 |
| score B-fable-2 | tag dm B-fable-2 t* 2 | anthropic/claude-haiku-5.5 | 20 | 41232 | 0 | 0 | 6703 | $0.0075 | 0 | 0 | 0 |
| score B-fable-2 | threads B-fable-2 | anthropic/claude-opus-5.5 | 1 | 25291 | 0 | 0 | 712 | $0.1154 | 0 | 0 | 0 |
| score B-fable-2 | rollcheck B-fable-2 t* | anthropic/claude-haiku-5.5 | 5 | 12456 | 0 | 0 | 1332 | $0.0019 | 0 | 0 | 0 |
| score B-fable-2 | note B-fable-2 1 | anthropic/claude-haiku-5.5 | 1 | 1466 | 0 | 0 | 112 | $0.0002 | 0 | 0 | 0 |
| score B-fable-2 | note B-fable-2 2 | anthropic/claude-haiku-5.5 | 1 | 1466 | 0 | 0 | 114 | $0.0002 | 0 | 0 | 0 |
| score B-fable-2 | authorship B-fable-2 1 | anthropic/claude-opus-5.5 | 1 | 39025 | 0 | 0 | 1490 | $0.1859 | 0 | 0 | 0 |
| score B-fable-2 | authorship B-fable-2 2 | anthropic/claude-opus-5.5 | 1 | 39025 | 0 | 0 | 1242 | $0.1809 | 0 | 0 | 0 |
| score B-fable-2 | goal scale B-fable-2 t* 1 | anthropic/claude-haiku-5.5 | 1 | 577 | 0 | 0 | 359 | $0.0002 | 0 | 0 | 0 |
| score B-fable-2 | goal scale B-fable-2 t* 2 | anthropic/claude-haiku-5.5 | 1 | 577 | 0 | 0 | 404 | $0.0003 | 0 | 0 | 0 |
| score B-fable-2 | note extra B-fable-2 1 | anthropic/claude-haiku-5.5 | 1 | 1549 | 0 | 0 | 327 | $0.0003 | 0 | 0 | 0 |
| score B-fable-2 | note extra B-fable-2 2 | anthropic/claude-haiku-5.5 | 1 | 1549 | 0 | 0 | 319 | $0.0003 | 0 | 0 | 0 |
| score B-fable-2 | made B-fable-2 t* 1 | anthropic/claude-haiku-5.5 | 20 | 64157 | 0 | 0 | 1584 | $0.0072 | 0 | 0 | 0 |
| score B-fable-2 | made B-fable-2 t* 2 | anthropic/claude-haiku-5.5 | 20 | 64157 | 0 | 0 | 1546 | $0.0072 | 0 | 0 | 0 |
| score B-fable-2 | lady B-fable-2 t* 1 | anthropic/claude-haiku-5.5 | 5 | 13061 | 0 | 0 | 415 | $0.0015 | 0 | 0 | 0 |
| score B-fable-2 | lady B-fable-2 t* 2 | anthropic/claude-haiku-5.5 | 5 | 13061 | 0 | 0 | 432 | $0.0015 | 0 | 0 | 0 |
| score B-fable-2 | overlap B-fable-2 1 | anthropic/claude-haiku-5.5 | 1 | 44813 | 0 | 0 | 525 | $0.0047 | 0 | 0 | 0 |
| score B-fable-2 | overlap B-fable-2 2 | anthropic/claude-haiku-5.5 | 1 | 44813 | 0 | 0 | 542 | $0.0048 | 0 | 0 | 0 |
| score B-fable-2 | overlap B-fable-2 referee | anthropic/claude-opus-5.5 | 1 | 44813 | 0 | 0 | 513 | $0.1895 | 0 | 0 | 0 |
| score B-fable-2 | world B-fable-2 1 | anthropic/claude-haiku-5.5 | 1 | 25938 | 0 | 0 | 199 | $0.0027 | 0 | 0 | 0 |
| score B-fable-2 | world B-fable-2 2 | anthropic/claude-haiku-5.5 | 1 | 25938 | 0 | 0 | 126 | $0.0027 | 0 | 0 | 0 |
