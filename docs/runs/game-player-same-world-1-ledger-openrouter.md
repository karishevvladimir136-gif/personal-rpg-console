# Game player same-world 1 — the OpenRouter ledger

Cap $350; spent before this run $0.0000; this run $76.7177; total $76.7177; 1656 calls.

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
