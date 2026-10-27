# Game player villain 1 — the OpenRouter ledger

Cap $100; spent before this run $0.0000; this run $42.0446; total $42.0446; 505 calls.

| Session | Purpose | Model | Calls | Input (uncached) | Cache read | Cache write | Output | USD | Errors | Refusals | 429 waits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| V-haiku | wizard | anthropic/claude-opus-5.5 | 2 | 11388 | 0 | 1567 | 12313 | $0.2996 | 0 | 0 | 0 |
| V-haiku | check V-haiku opening | anthropic/claude-haiku-5.5 | 1 | 827 | 0 | 0 | 73 | $0.0001 | 0 | 0 | 0 |
| V-haiku | player t* | anthropic/claude-haiku-5.5 | 4 | 16 | 37465 | 15527 | 3336 | $0.0040 | 0 | 0 | 0 |
| V-haiku | check V-haiku t* player | anthropic/claude-haiku-5.5 | 4 | 6297 | 0 | 0 | 271 | $0.0008 | 0 | 0 | 0 |
| V-haiku | decline t* | anthropic/claude-haiku-5.5 | 1 | 1208 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| V-haiku | dm t* | anthropic/claude-opus-5.5 | 8 | 32 | 124125 | 212325 | 34072 | $1.9002 | 0 | 0 | 0 |
| V-haiku | dm t* | anthropic/claude-haiku-5.5 | 4 | 11384 | 0 | 0 | 1825 | $0.0021 | 0 | 0 | 0 |
| V-haiku | check V-haiku t* dm | anthropic/claude-haiku-5.5 | 4 | 6750 | 0 | 0 | 351 | $0.0009 | 0 | 0 | 0 |
| V-haiku | note | anthropic/claude-haiku-5.5 | 1 | 4 | 15527 | 1637 | 657 | $0.0007 | 0 | 0 | 0 |
| V-haiku | check V-haiku note | anthropic/claude-haiku-5.5 | 1 | 743 | 0 | 0 | 76 | $0.0001 | 0 | 0 | 0 |
| V-haiku | after | anthropic/claude-haiku-5.5 | 1 | 4 | 17164 | 408 | 702 | $0.0006 | 0 | 0 | 0 |
| V-haiku | check V-haiku after | anthropic/claude-haiku-5.5 | 1 | 684 | 0 | 0 | 72 | $0.0001 | 0 | 0 | 0 |
| V-haiku | after 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 17572 | 385 | 678 | $0.0006 | 0 | 0 | 0 |
| V-haiku | check V-haiku after 2 | anthropic/claude-haiku-5.5 | 1 | 736 | 0 | 0 | 76 | $0.0001 | 0 | 0 | 0 |
| V-opus | wizard | anthropic/claude-opus-5.5 | 5 | 31912 | 0 | 3134 | 23896 | $0.6212 | 0 | 0 | 0 |
| V-opus | check V-opus opening | anthropic/claude-haiku-5.5 | 2 | 1554 | 0 | 0 | 122 | $0.0002 | 0 | 0 | 0 |
| V-opus | player t* | anthropic/claude-opus-5.5 | 32 | 128 | 711910 | 68194 | 27039 | $1.0246 | 0 | 0 | 0 |
| V-opus | check V-opus t* player | anthropic/claude-haiku-5.5 | 32 | 57386 | 0 | 0 | 2394 | $0.0069 | 0 | 0 | 0 |
| V-opus | decline t* | anthropic/claude-haiku-5.5 | 3 | 4345 | 0 | 0 | 175 | $0.0005 | 0 | 0 | 0 |
| V-opus | dm t* | anthropic/claude-opus-5.5 | 67 | 266 | 1994176 | 1922798 | 260732 | $15.4248 | 0 | 0 | 0 |
| V-opus | check V-opus t* dm (told before a card) | anthropic/claude-haiku-5.5 | 6 | 7627 | 0 | 0 | 456 | $0.0010 | 0 | 0 | 0 |
| V-opus | player t* card 1 | anthropic/claude-opus-5.5 | 6 | 24 | 156173 | 6427 | 595 | $0.0754 | 0 | 0 | 0 |
| V-opus | check V-opus t* player (card) | anthropic/claude-haiku-5.5 | 16 | 10681 | 0 | 0 | 978 | $0.0016 | 0 | 0 | 0 |
| V-opus | player t* card 2 | anthropic/claude-opus-5.5 | 6 | 24 | 162600 | 1053 | 982 | $0.0575 | 0 | 0 | 0 |
| V-opus | dm t* onward | anthropic/claude-opus-5.5 | 11 | 34 | 471589 | 174917 | 30433 | $1.5777 | 0 | 0 | 0 |
| V-opus | dm t* onward | anthropic/claude-haiku-5.5 | 10 | 20457 | 0 | 0 | 2043 | $0.0031 | 0 | 0 | 0 |
| V-opus | check V-opus t* dm | anthropic/claude-haiku-5.5 | 31 | 57054 | 0 | 0 | 2374 | $0.0069 | 0 | 0 | 0 |
| V-opus | dm t* | anthropic/claude-haiku-5.5 | 33 | 93097 | 0 | 0 | 12493 | $0.0156 | 0 | 0 | 0 |
| V-opus | dm t* card prose | anthropic/claude-opus-5.5 | 2 | 31803 | 33816 | 33816 | 1001 | $0.4245 | 0 | 0 | 0 |
| V-opus | check V-opus t* dm (out of game, prose at a card) | anthropic/claude-haiku-5.5 | 2 | 1118 | 0 | 0 | 134 | $0.0002 | 0 | 0 | 0 |
| V-opus | player t* card 3 | anthropic/claude-opus-5.5 | 1 | 4 | 30429 | 429 | 381 | $0.0159 | 0 | 0 | 0 |
| V-opus | dm t* card ooc (with a press) | anthropic/claude-opus-5.5 | 2 | 32328 | 67632 | 0 | 2180 | $0.1864 | 0 | 0 | 0 |
| V-opus | check V-opus t* dm (out of game, with a press) | anthropic/claude-haiku-5.5 | 1 | 577 | 0 | 0 | 66 | $0.0001 | 0 | 0 | 0 |
| V-opus | player t* card 4 | anthropic/claude-opus-5.5 | 1 | 4 | 30858 | 559 | 411 | $0.0172 | 0 | 0 | 0 |
| V-opus | player t* card 5 | anthropic/claude-opus-5.5 | 1 | 4 | 31417 | 427 | 162 | $0.0117 | 0 | 0 | 0 |
| V-opus | player t* card 6 | anthropic/claude-opus-5.5 | 1 | 4 | 31844 | 422 | 304 | $0.0146 | 0 | 0 | 0 |
| V-opus | note | anthropic/claude-opus-5.5 | 2 | 8 | 77511 | 2425 | 2972 | $0.0871 | 0 | 0 | 0 |
| V-opus | check V-opus note | anthropic/claude-haiku-5.5 | 2 | 2894 | 0 | 0 | 135 | $0.0004 | 0 | 0 | 0 |
| V-opus | after | anthropic/claude-opus-5.5 | 2 | 8 | 79936 | 2224 | 2350 | $0.0741 | 0 | 0 | 0 |
| V-opus | check V-opus after | anthropic/claude-haiku-5.5 | 2 | 2052 | 0 | 0 | 131 | $0.0003 | 0 | 0 | 0 |
| V-opus | after 2 | anthropic/claude-opus-5.5 | 2 | 8 | 82160 | 1454 | 2340 | $0.0705 | 0 | 0 | 0 |
| V-opus | check V-opus after 2 | anthropic/claude-haiku-5.5 | 2 | 2226 | 0 | 0 | 147 | $0.0003 | 0 | 0 | 0 |
| V-fable | wizard (cut: the run was stopped for the item-1 fix; booked from the spend checks, not metered) | anthropic/claude-opus-5.5 | 1 | 0 | 0 | 0 | 0 | $0.4800 | 1 | 0 | 0 |
| V-opus | the replay's first start, stopped at t* for the owner's changes (booked by hand, not metered) | anthropic/claude-opus-5.5 | 1 | 0 | 0 | 0 | 0 | $2.5000 | 1 | 0 | 0 |
| V-fable | wizard | anthropic/claude-opus-5.5 | 2 | 11553 | 0 | 1567 | 10894 | $0.2719 | 0 | 0 | 0 |
| V-fable | check V-fable opening | anthropic/claude-haiku-5.5 | 1 | 744 | 0 | 0 | 59 | $0.0001 | 0 | 0 | 0 |
| V-fable | player t* | anthropic/claude-fable-5.1 | 20 | 80 | 503391 | 37579 | 16472 | $1.4200 | 0 | 0 | 0 |
| V-fable | check V-fable t* player | anthropic/claude-haiku-5.5 | 20 | 34068 | 0 | 0 | 1443 | $0.0041 | 0 | 0 | 0 |
| V-fable | decline t* | anthropic/claude-haiku-5.5 | 1 | 1154 | 0 | 0 | 54 | $0.0001 | 0 | 0 | 0 |
| V-fable | dm t* | anthropic/claude-opus-5.5 | 37 | 140 | 1075223 | 1203228 | 136185 | $10.9754 | 1 | 0 | 0 |
| V-fable | dm t* | anthropic/claude-haiku-5.5 | 15 | 42192 | 0 | 0 | 5407 | $0.0069 | 0 | 0 | 0 |
| V-fable | check V-fable t* dm | anthropic/claude-haiku-5.5 | 20 | 34607 | 0 | 0 | 1572 | $0.0042 | 0 | 0 | 0 |
| V-fable | check V-fable t* dm (told before a card) | anthropic/claude-haiku-5.5 | 6 | 6055 | 0 | 0 | 421 | $0.0008 | 0 | 0 | 0 |
| V-fable | player t* card 1 | anthropic/claude-fable-5.1 | 6 | 24 | 131336 | 4879 | 111 | $0.0996 | 0 | 0 | 0 |
| V-fable | check V-fable t* player (card) | anthropic/claude-haiku-5.5 | 14 | 7442 | 0 | 0 | 818 | $0.0012 | 0 | 0 | 0 |
| V-fable | player t* card 2 | anthropic/claude-fable-5.1 | 6 | 24 | 136215 | 1082 | 214 | $0.0585 | 0 | 0 | 0 |
| V-fable | dm t* onward | anthropic/claude-opus-5.5 | 13 | 36 | 498464 | 160466 | 34983 | $3.3545 | 1 | 0 | 0 |
| V-fable | dm t* onward | anthropic/claude-haiku-5.5 | 11 | 20124 | 0 | 0 | 2764 | $0.0034 | 0 | 0 | 0 |
| V-fable | player t* card 3 | anthropic/claude-fable-5.1 | 1 | 4 | 18693 | 176 | 9 | $0.0074 | 0 | 0 | 0 |
| V-fable | player t* card 4 | anthropic/claude-fable-5.1 | 1 | 4 | 18869 | 184 | 114 | $0.0128 | 0 | 0 | 0 |
| V-fable | dm t* retry | anthropic/claude-opus-5.5 | 4 | 16 | 252949 | 57193 | 15702 | $0.6507 | 0 | 0 | 0 |
| V-fable | dm t* retry | anthropic/claude-haiku-5.5 | 2 | 5992 | 0 | 0 | 1163 | $0.0012 | 0 | 0 | 0 |
| V-fable | note | anthropic/claude-fable-5.1 | 1 | 4 | 43900 | 1919 | 1410 | $0.1055 | 0 | 0 | 0 |
| V-fable | check V-fable note | anthropic/claude-haiku-5.5 | 1 | 1722 | 0 | 0 | 75 | $0.0002 | 0 | 0 | 0 |
| V-fable | after | anthropic/claude-fable-5.1 | 1 | 4 | 45819 | 1387 | 979 | $0.0778 | 0 | 0 | 0 |
| V-fable | check V-fable after | anthropic/claude-haiku-5.5 | 1 | 978 | 0 | 0 | 88 | $0.0001 | 0 | 0 | 0 |
| V-fable | after 2 | anthropic/claude-fable-5.1 | 1 | 4 | 47206 | 679 | 1150 | $0.0778 | 0 | 0 | 0 |
| V-fable | check V-fable after 2 | anthropic/claude-haiku-5.5 | 1 | 1188 | 0 | 0 | 88 | $0.0002 | 0 | 0 | 0 |
