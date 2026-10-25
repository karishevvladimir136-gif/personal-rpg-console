# Game player 1 — the OpenRouter ledger (the Claude models through OpenRouter)

Cap $90; spent before this run $0.0000; this run $51.5879; total $51.5879; 715 calls.

Every call's own line — with its door (`provider`), `upstream`, `servedModel`, request id and message id — is in the ledger's `.json`.

| Session | Purpose | Model | Provider (door) | Upstream | Served model | Calls | Input (uncached) | Cache read | Cache write | Output | USD | Errors | Refusals | 429 waits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| probe | door probe 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 4 | 0 | 11357 | 33 | $0.0014 | 0 | 0 | 0 |
| probe | door probe 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 4 | 11357 | 0 | 286 | $0.0003 | 0 | 0 | 0 |
| B-opus | wizard | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 2 | 11833 | 0 | 1567 | 13930 | $0.3338 | 0 | 0 | 0 |
| B-fable | wizard | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 2 | 11587 | 0 | 1567 | 13303 | $0.3202 | 0 | 0 | 0 |
| B-astra | wizard | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 2 | 12225 | 0 | 1567 | 14879 | $0.3543 | 0 | 0 | 0 |
| B-sol | wizard | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 3 | 21931 | 0 | 1567 | 17306 | $0.4417 | 0 | 0 | 0 |
| B-fable | prep | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 2768 | 0 | 15613 | 5130 | $0.2386 | 0 | 0 | 0 |
| B-opus | prep | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 2746 | 15056 | 510 | 5071 | $0.1195 | 0 | 0 | 0 |
| B-astra | prep | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 2714 | 15056 | 504 | 5796 | $0.1338 | 0 | 0 | 0 |
| B-sol | prep | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 2798 | 15056 | 538 | 5289 | $0.1243 | 0 | 0 | 0 |
| B-fable | check B-fable opening | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 824 | 0 | 0 | 72 | $0.0001 | 0 | 0 | 0 |
| B-opus | check B-opus opening | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 777 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| B-opus | player t* | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 20 | 80 | 603592 | 42518 | 13258 | $0.5988 | 0 | 0 | 0 |
| B-fable | player t* | claude-fable-5-1 | openrouter | Anthropic | claude-fable-5-1 | 20 | 80 | 639741 | 46714 | 15218 | $1.5056 | 0 | 0 | 0 |
| B-opus | check B-opus t* player | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 33296 | 0 | 0 | 1544 | $0.0041 | 0 | 0 | 0 |
| B-fable | check B-fable t* player | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 39044 | 0 | 0 | 1479 | $0.0046 | 0 | 0 | 0 |
| B-opus | dm t* | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 38 | 146 | 1230903 | 1071560 | 110360 | $7.9536 | 0 | 0 | 0 |
| B-fable | dm t* | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 37 | 2906 | 1240432 | 1192050 | 146433 | $9.2593 | 0 | 0 | 0 |
| B-astra | check B-astra opening | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 771 | 0 | 0 | 66 | $0.0001 | 0 | 0 | 0 |
| B-astra | check B-astra t* player | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 26456 | 0 | 0 | 1425 | $0.0034 | 0 | 0 | 0 |
| B-astra | dm t* | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 36 | 144 | 920881 | 1331987 | 129410 | $9.5001 | 0 | 0 | 0 |
| B-sol | check B-sol opening | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 805 | 0 | 0 | 57 | $0.0001 | 0 | 0 | 0 |
| B-sol | check B-sol t* player | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 26580 | 0 | 0 | 1415 | $0.0034 | 0 | 0 | 0 |
| B-sol | dm t* | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 42 | 168 | 1136253 | 1366171 | 134739 | $9.8181 | 0 | 0 | 0 |
| B-astra | dm t* | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 16 | 47067 | 0 | 0 | 8278 | $0.0088 | 0 | 0 | 0 |
| B-opus | dm t* | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 17 | 46048 | 0 | 0 | 5203 | $0.0072 | 0 | 0 | 0 |
| B-astra | check B-astra t* dm | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 27486 | 0 | 0 | 1850 | $0.0037 | 0 | 0 | 0 |
| B-opus | check B-opus t* dm | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 33779 | 0 | 0 | 1756 | $0.0043 | 0 | 0 | 0 |
| B-sol | dm t* | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 21 | 59291 | 0 | 0 | 7601 | $0.0097 | 0 | 0 | 0 |
| B-sol | check B-sol t* dm | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 27459 | 0 | 0 | 1550 | $0.0035 | 0 | 0 | 0 |
| B-opus | check B-opus t* dm (told before a card) | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 8 | 9387 | 0 | 0 | 570 | $0.0012 | 0 | 0 | 0 |
| B-opus | player t* card 1 | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 8 | 32 | 199714 | 7861 | 700 | $0.0934 | 0 | 0 | 0 |
| B-opus | check B-opus t* player (card) | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 13406 | 0 | 0 | 1204 | $0.0019 | 0 | 0 | 0 |
| B-opus | player t* card 2 | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 8 | 32 | 207575 | 1170 | 1122 | $0.0699 | 0 | 0 | 0 |
| B-opus | player t* card 3 | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 3 | 12 | 83986 | 689 | 331 | $0.0269 | 0 | 0 | 0 |
| B-opus | dm t* onward | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 19 | 60 | 713170 | 247701 | 46266 | $2.3067 | 0 | 0 | 0 |
| B-opus | dm t* onward | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 16 | 36574 | 0 | 0 | 4040 | $0.0057 | 0 | 0 | 0 |
| B-fable | dm t* | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 15 | 48643 | 0 | 0 | 7398 | $0.0086 | 0 | 0 | 0 |
| B-fable | check B-fable t* dm | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 40399 | 0 | 0 | 1731 | $0.0049 | 0 | 0 | 0 |
| B-astra | check B-astra t* dm (told before a card) | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 6 | 5132 | 0 | 0 | 436 | $0.0007 | 0 | 0 | 0 |
| B-astra | check B-astra t* player (card) | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 15 | 9026 | 0 | 0 | 911 | $0.0014 | 0 | 0 | 0 |
| B-astra | dm t* onward | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 18 | 60 | 859908 | 258364 | 44428 | $2.3526 | 0 | 0 | 0 |
| B-fable | check B-fable t* dm (told before a card) | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 9 | 11967 | 0 | 0 | 696 | $0.0015 | 0 | 0 | 0 |
| B-fable | player t* card 1 | claude-fable-5-1 | openrouter | Anthropic | claude-fable-5-1 | 9 | 36 | 350237 | 10355 | 517 | $0.2432 | 0 | 0 | 0 |
| B-fable | check B-fable t* player (card) | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 29 | 19477 | 0 | 0 | 1819 | $0.0029 | 0 | 0 | 0 |
| B-fable | player t* card 2 | claude-fable-5-1 | openrouter | Anthropic | claude-fable-5-1 | 9 | 36 | 360592 | 1562 | 1209 | $0.1705 | 0 | 0 | 0 |
| B-fable | dm t* onward | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 23 | 74 | 1283139 | 446092 | 81072 | $4.1088 | 0 | 0 | 0 |
| B-astra | dm t* onward | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 14 | 33808 | 0 | 0 | 4359 | $0.0056 | 0 | 0 | 0 |
| B-fable | dm t* onward | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 18 | 51362 | 0 | 0 | 5608 | $0.0079 | 0 | 0 | 0 |
| B-fable | check referee B-fable t* dm | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 2 | 3620 | 0 | 0 | 119 | $0.0169 | 0 | 0 | 0 |
| B-sol | check B-sol t* dm (told before a card) | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 2 | 2051 | 0 | 0 | 143 | $0.0003 | 0 | 0 | 0 |
| B-sol | check B-sol t* player (card) | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 4 | 3035 | 0 | 0 | 241 | $0.0004 | 0 | 0 | 0 |
| B-sol | dm t* onward | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 5 | 16 | 222849 | 84653 | 14313 | $0.7542 | 0 | 0 | 0 |
| B-sol | dm t* onward | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 4 | 10659 | 0 | 0 | 1064 | $0.0016 | 0 | 0 | 0 |
| B-fable | player t* card 3 | claude-fable-5-1 | openrouter | Anthropic | claude-fable-5-1 | 4 | 16 | 175068 | 844 | 568 | $0.0829 | 0 | 0 | 0 |
| B-fable | player t* card 4 | claude-fable-5-1 | openrouter | Anthropic | claude-fable-5-1 | 3 | 12 | 124006 | 746 | 201 | $0.0505 | 0 | 0 | 0 |
| B-opus | player t* card 4 | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 4 | 42418 | 136 | 32 | $0.0098 | 0 | 0 | 0 |
| B-fable | player t* card 5 | claude-fable-5-1 | openrouter | Anthropic | claude-fable-5-1 | 2 | 8 | 90251 | 428 | 335 | $0.0447 | 0 | 0 | 0 |
| B-fable | player t* card 6 | claude-fable-5-1 | openrouter | Anthropic | claude-fable-5-1 | 1 | 4 | 43333 | 436 | 241 | $0.0284 | 0 | 0 | 0 |
| B-fable | player t* card 7 | claude-fable-5-1 | openrouter | Anthropic | claude-fable-5-1 | 1 | 4 | 43769 | 259 | 1391 | $0.0838 | 0 | 0 | 0 |
| B-sol | check B-sol note | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 1311 | 0 | 0 | 62 | $0.0002 | 0 | 0 | 0 |
| B-sol | check B-sol after | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 594 | 0 | 0 | 72 | $0.0001 | 0 | 0 | 0 |
| B-astra | check referee B-astra t* player | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 1697 | 0 | 0 | 59 | $0.0080 | 0 | 0 | 0 |
| B-opus | note | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 4 | 52374 | 1383 | 1973 | $0.0569 | 0 | 0 | 0 |
| B-astra | check B-astra note | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 1415 | 0 | 0 | 63 | $0.0002 | 0 | 0 | 0 |
| B-astra | check B-astra after | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 600 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| B-opus | check B-opus note | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 1644 | 0 | 0 | 64 | $0.0002 | 0 | 0 | 0 |
| B-opus | after | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 4 | 53757 | 1309 | 1355 | $0.0444 | 0 | 0 | 0 |
| B-opus | check B-opus after | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 1061 | 0 | 0 | 80 | $0.0001 | 0 | 0 | 0 |
| B-fable | note | claude-fable-5-1 | openrouter | Anthropic | claude-fable-5-1 | 1 | 4 | 61344 | 2080 | 1875 | $0.1351 | 0 | 0 | 0 |
| B-fable | check B-fable note | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 1986 | 0 | 0 | 67 | $0.0002 | 0 | 0 | 0 |
| B-fable | after | claude-fable-5-1 | openrouter | Anthropic | claude-fable-5-1 | 1 | 4 | 63424 | 1651 | 1230 | $0.0980 | 0 | 0 | 0 |
| B-fable | check B-fable after | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 1183 | 0 | 0 | 74 | $0.0002 | 0 | 0 | 0 |
