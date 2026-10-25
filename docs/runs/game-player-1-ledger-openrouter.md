# Game player 1 — the OpenRouter ledger (the Claude models through OpenRouter)

Cap $90; spent before this run $0.0000; this run $57.9124; total $57.9124; 1489 calls.

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
| score A-astra | tag player A-astra t* 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 50704 | 0 | 0 | 5521 | $0.0078 | 0 | 0 | 0 |
| score A-astra | tag player A-astra t* 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 50704 | 0 | 0 | 4585 | $0.0074 | 0 | 0 | 0 |
| score A-astra | tag player A-astra t* referee | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 3 | 6679 | 0 | 0 | 576 | $0.0382 | 0 | 0 | 0 |
| score A-astra | tag dm A-astra t* 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 27338 | 0 | 0 | 6415 | $0.0059 | 0 | 0 | 0 |
| score A-astra | tag dm A-astra t* 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 27338 | 0 | 0 | 6471 | $0.0060 | 0 | 0 | 0 |
| score A-astra | tag dm A-astra t* referee | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 1642 | 0 | 0 | 102 | $0.0086 | 0 | 0 | 0 |
| score A-astra | threads A-astra | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 18068 | 0 | 0 | 621 | $0.0847 | 0 | 0 | 0 |
| score A-astra | rollcheck A-astra t* | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 4 | 6254 | 0 | 0 | 496 | $0.0009 | 0 | 0 | 0 |
| score A-astra | note A-astra 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 1277 | 0 | 0 | 132 | $0.0002 | 0 | 0 | 0 |
| score A-astra | note A-astra 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 1277 | 0 | 0 | 122 | $0.0002 | 0 | 0 | 0 |
| score A-astra | authorship A-astra 1 | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 25056 | 0 | 0 | 1431 | $0.1288 | 0 | 0 | 0 |
| score A-astra | authorship A-astra 2 | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 25056 | 0 | 0 | 1559 | $0.1314 | 0 | 0 | 0 |
| score A-sol | tag player A-sol t* 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 54134 | 0 | 0 | 4333 | $0.0076 | 0 | 0 | 0 |
| score A-sol | tag player A-sol t* 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 54134 | 0 | 0 | 3942 | $0.0074 | 0 | 0 | 0 |
| score A-sol | tag player A-sol t* referee | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 3 | 8847 | 0 | 0 | 387 | $0.0431 | 0 | 0 | 0 |
| score A-sol | tag dm A-sol t* 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 28968 | 0 | 0 | 6909 | $0.0064 | 0 | 0 | 0 |
| score A-sol | tag dm A-sol t* 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 28968 | 0 | 0 | 6717 | $0.0063 | 0 | 0 | 0 |
| score A-sol | threads A-sol | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 19722 | 0 | 0 | 881 | $0.0965 | 0 | 0 | 0 |
| score A-sol | deception A-sol t* 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 2099 | 0 | 0 | 249 | $0.0003 | 0 | 0 | 0 |
| score A-sol | deception A-sol t* 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 2099 | 0 | 0 | 410 | $0.0004 | 0 | 0 | 0 |
| score A-sol | rollcheck A-sol t* | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 8 | 13822 | 0 | 0 | 1592 | $0.0022 | 0 | 0 | 0 |
| score A-sol | note A-sol 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 1001 | 0 | 0 | 121 | $0.0002 | 0 | 0 | 0 |
| score A-sol | note A-sol 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 1001 | 0 | 0 | 119 | $0.0002 | 0 | 0 | 0 |
| score A-sol | authorship A-sol 1 | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 27251 | 0 | 0 | 1494 | $0.1389 | 0 | 0 | 0 |
| score A-sol | authorship A-sol 2 | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 27251 | 0 | 0 | 1498 | $0.1390 | 0 | 0 | 0 |
| score A-fable | tag player A-fable t* 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 58226 | 0 | 0 | 4838 | $0.0082 | 0 | 0 | 0 |
| score A-fable | tag player A-fable t* 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 58226 | 0 | 0 | 4745 | $0.0082 | 0 | 0 | 0 |
| score A-fable | tag player A-fable t* referee | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 5 | 14666 | 0 | 0 | 1796 | $0.0946 | 0 | 0 | 0 |
| score A-fable | tag dm A-fable t* 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 18 | 30989 | 0 | 0 | 5756 | $0.0060 | 0 | 0 | 0 |
| score A-fable | tag dm A-fable t* 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 18 | 30989 | 0 | 0 | 6009 | $0.0061 | 0 | 0 | 0 |
| score A-fable | threads A-fable | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 19603 | 0 | 0 | 856 | $0.0955 | 0 | 0 | 0 |
| score A-fable | rollcheck A-fable t* | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 3 | 6248 | 0 | 0 | 480 | $0.0009 | 0 | 0 | 0 |
| score A-fable | note A-fable 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 1355 | 0 | 0 | 114 | $0.0002 | 0 | 0 | 0 |
| score A-fable | note A-fable 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 1355 | 0 | 0 | 114 | $0.0002 | 0 | 0 | 0 |
| score A-fable | authorship A-fable 1 | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 30308 | 0 | 0 | 1925 | $0.1597 | 0 | 0 | 0 |
| score A-fable | authorship A-fable 2 | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 30308 | 0 | 0 | 2029 | $0.1618 | 0 | 0 | 0 |
| score A-opus | tag player A-opus t* 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 77605 | 0 | 0 | 4660 | $0.0101 | 0 | 0 | 0 |
| score A-opus | tag player A-opus t* 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 77605 | 0 | 0 | 4370 | $0.0099 | 0 | 0 | 0 |
| score A-opus | tag player A-opus t* referee | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 4532 | 0 | 0 | 108 | $0.0203 | 0 | 0 | 0 |
| score A-opus | tag dm A-opus t* 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 44881 | 0 | 0 | 6975 | $0.0080 | 0 | 0 | 0 |
| score A-opus | tag dm A-opus t* 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 44881 | 0 | 0 | 7090 | $0.0080 | 0 | 0 | 0 |
| score A-opus | threads A-opus | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 27067 | 0 | 0 | 912 | $0.1265 | 0 | 0 | 0 |
| score A-opus | deception A-opus t* 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 2 | 4811 | 0 | 0 | 738 | $0.0009 | 0 | 0 | 0 |
| score A-opus | deception A-opus t* 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 2 | 4811 | 0 | 0 | 517 | $0.0007 | 0 | 0 | 0 |
| score A-opus | rollcheck A-opus t* | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 7 | 18454 | 0 | 0 | 1348 | $0.0025 | 0 | 0 | 0 |
| score A-opus | note A-opus 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 1705 | 0 | 0 | 122 | $0.0002 | 0 | 0 | 0 |
| score A-opus | note A-opus 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 1705 | 0 | 0 | 112 | $0.0002 | 0 | 0 | 0 |
| score A-opus | authorship A-opus 1 | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 43240 | 0 | 0 | 1544 | $0.2038 | 0 | 0 | 0 |
| score A-opus | authorship A-opus 2 | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 43240 | 0 | 0 | 1694 | $0.2068 | 0 | 0 | 0 |
| — | the scoring of Table B, first attempt — crashed before its ledger write (estimate) | — | openrouter | (estimate) | – | 1 | 0 | 0 | 0 | 0 | $2.0080 | 0 | 0 | 0 |
| score B-sol | tag player B-sol t* 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 56210 | 0 | 0 | 5689 | $0.0085 | 0 | 0 | 0 |
| score B-sol | tag player B-sol t* 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 56210 | 0 | 0 | 4451 | $0.0078 | 0 | 0 | 0 |
| score B-sol | tag player B-sol t* referee | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 5 | 14328 | 0 | 0 | 1107 | $0.0795 | 0 | 0 | 0 |
| score B-sol | tag dm B-sol t* 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 30140 | 0 | 0 | 6605 | $0.0063 | 0 | 0 | 0 |
| score B-sol | tag dm B-sol t* 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 30140 | 0 | 0 | 6586 | $0.0063 | 0 | 0 | 0 |
| score B-sol | threads B-sol | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 20604 | 0 | 0 | 674 | $0.0959 | 0 | 0 | 0 |
| score B-sol | rollcheck B-sol t* | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 2 | 4019 | 0 | 0 | 307 | $0.0006 | 0 | 0 | 0 |
| score B-sol | note B-sol 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 1225 | 0 | 0 | 105 | $0.0002 | 0 | 0 | 0 |
| score B-sol | note B-sol 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 1225 | 0 | 0 | 98 | $0.0002 | 0 | 0 | 0 |
| score B-sol | authorship B-sol 1 | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 27000 | 0 | 0 | 1599 | $0.1400 | 0 | 0 | 0 |
| score B-sol | authorship B-sol 2 | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 27000 | 0 | 0 | 1515 | $0.1383 | 0 | 0 | 0 |
| score B-astra | tag player B-astra t* 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 57379 | 0 | 0 | 4663 | $0.0081 | 0 | 0 | 0 |
| score B-astra | tag player B-astra t* 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 57379 | 0 | 0 | 5041 | $0.0083 | 0 | 0 | 0 |
| score B-astra | tag player B-astra t* referee | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 3033 | 0 | 0 | 298 | $0.0181 | 0 | 0 | 0 |
| score B-astra | tag dm B-astra t* 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 31213 | 0 | 0 | 6216 | $0.0062 | 0 | 0 | 0 |
| score B-astra | tag dm B-astra t* 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 31213 | 0 | 0 | 5882 | $0.0061 | 0 | 0 | 0 |
| score B-astra | threads B-astra | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 21117 | 0 | 0 | 1045 | $0.1054 | 0 | 0 | 0 |
| score B-astra | rollcheck B-astra t* | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 6 | 10845 | 0 | 0 | 988 | $0.0016 | 0 | 0 | 0 |
| score B-astra | note B-astra 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 1329 | 0 | 0 | 98 | $0.0002 | 0 | 0 | 0 |
| score B-astra | note B-astra 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 1329 | 0 | 0 | 124 | $0.0002 | 0 | 0 | 0 |
| score B-astra | authorship B-astra 1 | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 30323 | 0 | 0 | 1822 | $0.1577 | 0 | 0 | 0 |
| score B-astra | authorship B-astra 2 | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 30323 | 0 | 0 | 1833 | $0.1580 | 0 | 0 | 0 |
| score B-opus | tag player B-opus t* 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 69337 | 0 | 0 | 4530 | $0.0092 | 0 | 0 | 0 |
| score B-opus | tag player B-opus t* 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 69337 | 0 | 0 | 5544 | $0.0097 | 0 | 0 | 0 |
| score B-opus | tag player B-opus t* referee | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 6 | 22054 | 0 | 0 | 1398 | $0.1162 | 0 | 0 | 0 |
| score B-opus | tag dm B-opus t* 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 39252 | 0 | 0 | 7070 | $0.0075 | 0 | 0 | 0 |
| score B-opus | tag dm B-opus t* 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 39252 | 0 | 0 | 6745 | $0.0073 | 0 | 0 | 0 |
| score B-opus | threads B-opus | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 24121 | 0 | 0 | 595 | $0.1084 | 0 | 0 | 0 |
| score B-opus | deception B-opus t* 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 4 | 10072 | 0 | 0 | 1782 | $0.0019 | 0 | 0 | 0 |
| score B-opus | deception B-opus t* 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 4 | 10072 | 0 | 0 | 1945 | $0.0020 | 0 | 0 | 0 |
| score B-opus | rollcheck B-opus t* | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 10 | 20222 | 0 | 0 | 2050 | $0.0030 | 0 | 0 | 0 |
| score B-opus | note B-opus 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 1558 | 0 | 0 | 106 | $0.0002 | 0 | 0 | 0 |
| score B-opus | note B-opus 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 1558 | 0 | 0 | 109 | $0.0002 | 0 | 0 | 0 |
| score B-opus | authorship B-opus 1 | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 39234 | 0 | 0 | 1465 | $0.1862 | 0 | 0 | 0 |
| score B-opus | authorship B-opus 2 | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 39234 | 0 | 0 | 1456 | $0.1861 | 0 | 0 | 0 |
| score B-fable | tag player B-fable t* 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 79999 | 0 | 0 | 3683 | $0.0098 | 0 | 0 | 0 |
| score B-fable | tag player B-fable t* 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 79999 | 0 | 0 | 4250 | $0.0101 | 0 | 0 | 0 |
| score B-fable | tag player B-fable t* referee | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 4 | 15475 | 0 | 0 | 1003 | $0.0820 | 0 | 0 | 0 |
| score B-fable | tag dm B-fable t* 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 46591 | 0 | 0 | 6974 | $0.0081 | 0 | 0 | 0 |
| score B-fable | tag dm B-fable t* 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 20 | 46591 | 0 | 0 | 6993 | $0.0082 | 0 | 0 | 0 |
| score B-fable | threads B-fable | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 28270 | 0 | 0 | 844 | $0.1300 | 0 | 0 | 0 |
| score B-fable | deception B-fable t* 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 2407 | 0 | 0 | 705 | $0.0006 | 0 | 0 | 0 |
| score B-fable | deception B-fable t* 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 2407 | 0 | 0 | 527 | $0.0005 | 0 | 0 | 0 |
| score B-fable | deception B-fable t* referee | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 2407 | 0 | 0 | 299 | $0.0156 | 0 | 0 | 0 |
| score B-fable | rollcheck B-fable t* | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 11 | 29291 | 0 | 0 | 1956 | $0.0039 | 0 | 0 | 0 |
| score B-fable | note B-fable 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 1900 | 0 | 0 | 114 | $0.0002 | 0 | 0 | 0 |
| score B-fable | note B-fable 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 1900 | 0 | 0 | 118 | $0.0002 | 0 | 0 | 0 |
| score B-fable | authorship B-fable 1 | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 48349 | 0 | 0 | 1583 | $0.2251 | 0 | 0 | 0 |
| score B-fable | authorship B-fable 2 | claude-opus-5-5 | openrouter | Claude Platform on AWS | claude-opus-5-5 | 1 | 48349 | 0 | 0 | 1488 | $0.2232 | 0 | 0 | 0 |
