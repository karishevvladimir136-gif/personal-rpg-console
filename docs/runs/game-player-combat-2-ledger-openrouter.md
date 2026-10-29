# Game player combat 2 — the OpenRouter ledger

Cap $95; spent before this run $0.0000; this run $11.5924; total $11.5924; 329 calls.

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
| CW-opus | check CW-opus opening | anthropic/claude-haiku-5.5 | 1 | 745 | 0 | 0 | 63 | $0.0001 | 0 | 0 | 0 |
| CW-opus | player t* | anthropic/claude-opus-5.5 | 13 | 52 | 275633 | 34560 | 10926 | $0.4467 | 0 | 0 | 0 |
| CW-opus | check CW-opus t* player | anthropic/claude-haiku-5.5 | 13 | 24992 | 0 | 0 | 979 | $0.0030 | 0 | 0 | 0 |
| CW-opus | dm t* | anthropic/claude-opus-5.5 | 28 | 110 | 877499 | 856878 | 128595 | $7.1422 | 0 | 0 | 0 |
| CW-opus | check CW-opus t* dm (told before a card) | anthropic/claude-haiku-5.5 | 2 | 2209 | 0 | 0 | 142 | $0.0003 | 0 | 0 | 0 |
| CW-opus | player t* card 1 | anthropic/claude-opus-5.5 | 2 | 8 | 40726 | 1800 | 59 | $0.0184 | 0 | 0 | 0 |
| CW-opus | check CW-opus t* player (card) | anthropic/claude-haiku-5.5 | 4 | 2532 | 0 | 0 | 238 | $0.0004 | 0 | 0 | 0 |
| CW-opus | player t* card 2 | anthropic/claude-opus-5.5 | 2 | 8 | 42526 | 329 | 114 | $0.0125 | 0 | 0 | 0 |
| CW-opus | dm t* onward | anthropic/claude-opus-5.5 | 4 | 12 | 153463 | 71289 | 11830 | $0.6238 | 0 | 0 | 0 |
| CW-opus | dm t* onward | anthropic/claude-haiku-5.5 | 4 | 8809 | 0 | 0 | 1115 | $0.0014 | 0 | 0 | 0 |
| CW-opus | check CW-opus t* dm | anthropic/claude-haiku-5.5 | 12 | 23552 | 0 | 0 | 961 | $0.0028 | 0 | 0 | 0 |
| CW-opus | dm t* | anthropic/claude-haiku-5.5 | 15 | 47720 | 0 | 0 | 8717 | $0.0091 | 0 | 0 | 0 |
| CW-opus | check referee CW-opus t* dm | anthropic/claude-opus-5.5 | 1 | 2456 | 0 | 0 | 54 | $0.0109 | 0 | 0 | 0 |
| CW-opus | note | anthropic/claude-opus-5.5 | 1 | 4 | 36689 | 755 | 2158 | $0.0543 | 0 | 0 | 0 |
| CW-opus | check CW-opus note | anthropic/claude-haiku-5.5 | 1 | 1529 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| CW-opus | after | anthropic/claude-opus-5.5 | 1 | 4 | 37444 | 1194 | 1324 | $0.0400 | 0 | 0 | 0 |
| CW-opus | check CW-opus after | anthropic/claude-haiku-5.5 | 1 | 1067 | 0 | 0 | 76 | $0.0001 | 0 | 0 | 0 |
| CW-opus | after 2 | anthropic/claude-opus-5.5 | 1 | 4 | 38638 | 753 | 1200 | $0.0355 | 0 | 0 | 0 |
| CW-opus | check CW-opus after 2 | anthropic/claude-haiku-5.5 | 1 | 1102 | 0 | 0 | 80 | $0.0002 | 0 | 0 | 0 |
| score CW-opus | tag player CW-opus t* 1 | anthropic/claude-haiku-5.5 | 12 | 42034 | 0 | 0 | 2828 | $0.0056 | 0 | 0 | 0 |
| score CW-opus | tag player CW-opus t* 2 | anthropic/claude-haiku-5.5 | 12 | 42034 | 0 | 0 | 3380 | $0.0059 | 0 | 0 | 0 |
| score CW-opus | tag player CW-opus t* referee | anthropic/claude-opus-5.5 | 2 | 6419 | 0 | 0 | 764 | $0.0410 | 0 | 0 | 0 |
| score CW-opus | tag dm CW-opus t* 1 | anthropic/claude-haiku-5.5 | 12 | 25114 | 0 | 0 | 4157 | $0.0046 | 0 | 0 | 0 |
| score CW-opus | tag dm CW-opus t* 2 | anthropic/claude-haiku-5.5 | 12 | 25114 | 0 | 0 | 3886 | $0.0045 | 0 | 0 | 0 |
| score CW-opus | threads CW-opus | anthropic/claude-opus-5.5 | 1 | 14740 | 0 | 0 | 483 | $0.0686 | 0 | 0 | 0 |
| score CW-opus | deception CW-opus t* 1 | anthropic/claude-haiku-5.5 | 1 | 2500 | 0 | 0 | 234 | $0.0004 | 0 | 0 | 0 |
| score CW-opus | deception CW-opus t* 2 | anthropic/claude-haiku-5.5 | 1 | 2500 | 0 | 0 | 174 | $0.0003 | 0 | 0 | 0 |
| score CW-opus | rollcheck CW-opus t* | anthropic/claude-haiku-5.5 | 3 | 6655 | 0 | 0 | 480 | $0.0009 | 0 | 0 | 0 |
| score CW-opus | note CW-opus 1 | anthropic/claude-haiku-5.5 | 1 | 1443 | 0 | 0 | 115 | $0.0002 | 0 | 0 | 0 |
| score CW-opus | note CW-opus 2 | anthropic/claude-haiku-5.5 | 1 | 1443 | 0 | 0 | 102 | $0.0002 | 0 | 0 | 0 |
| score CW-opus | combat player CW-opus t* 1 | anthropic/claude-haiku-5.5 | 12 | 46678 | 0 | 0 | 3762 | $0.0065 | 0 | 0 | 0 |
| score CW-opus | combat player CW-opus t* 2 | anthropic/claude-haiku-5.5 | 12 | 46678 | 0 | 0 | 3744 | $0.0065 | 0 | 0 | 0 |
| score CW-opus | combat dm CW-opus t* 1 | anthropic/claude-haiku-5.5 | 12 | 25450 | 0 | 0 | 2198 | $0.0036 | 0 | 0 | 0 |
| score CW-opus | combat dm CW-opus t* 2 | anthropic/claude-haiku-5.5 | 12 | 25450 | 0 | 0 | 2350 | $0.0037 | 0 | 0 | 0 |
| score CW-opus | combat player CW-opus t* referee | anthropic/claude-opus-5.5 | 3 | 13018 | 0 | 0 | 1452 | $0.0811 | 0 | 0 | 0 |
| score CW-opus | exit CW-opus | anthropic/claude-opus-5.5 | 1 | 21804 | 0 | 0 | 372 | $0.0947 | 0 | 0 | 0 |
| score CW-opus | fork CW-opus t* 1 | anthropic/claude-haiku-5.5 | 12 | 44254 | 0 | 0 | 6013 | $0.0074 | 0 | 0 | 0 |
| score CW-opus | fork CW-opus t* 2 | anthropic/claude-haiku-5.5 | 12 | 44254 | 0 | 0 | 5537 | $0.0072 | 0 | 0 | 0 |
| score CW-opus | fork CW-opus t* referee | anthropic/claude-opus-5.5 | 6 | 24259 | 0 | 0 | 2277 | $0.1426 | 0 | 0 | 0 |
| score CW-opus | captive CW-opus | anthropic/claude-opus-5.5 | 1 | 21814 | 0 | 0 | 398 | $0.0952 | 0 | 0 | 0 |
| score CW-opus | note CW-opus | anthropic/claude-opus-5.5 | 1 | 2182 | 0 | 0 | 316 | $0.0150 | 0 | 0 | 0 |
