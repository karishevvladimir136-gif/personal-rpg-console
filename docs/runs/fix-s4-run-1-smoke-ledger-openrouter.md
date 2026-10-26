# FIX_S4 run 1 smoke — the OpenRouter ledger

Cap $15; spent before this run $0.0000; this run $5.0231; total $5.0231; 78 calls.

| Session | Purpose | Model | Calls | Input (uncached) | Cache read | Cache write | Output | USD | Errors | Refusals | 429 waits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A-haiku | wizard | anthropic/claude-opus-5.5 | 2 | 16094 | 0 | 1567 | 11409 | $0.3004 | 0 | 0 | 0 |
| A-luna | wizard | anthropic/claude-opus-5.5 | 2 | 16442 | 0 | 1567 | 12382 | $0.3212 | 0 | 0 | 0 |
| A-haiku | prep | anthropic/claude-opus-5.5 | 1 | 3968 | 0 | 17122 | 12188 | $0.3966 | 0 | 0 | 0 |
| A-luna | prep | anthropic/claude-opus-5.5 | 1 | 3966 | 16673 | 460 | 13469 | $0.2923 | 0 | 0 | 0 |
| A-haiku | check A-haiku opening | anthropic/claude-haiku-5.5 | 1 | 716 | 0 | 0 | 61 | $0.0001 | 0 | 0 | 0 |
| A-haiku | player t* | anthropic/claude-haiku-5.5 | 4 | 16 | 45359 | 16346 | 2138 | $0.0036 | 0 | 0 | 0 |
| A-haiku | check A-haiku t* player | anthropic/claude-haiku-5.5 | 4 | 4429 | 0 | 0 | 254 | $0.0006 | 0 | 0 | 0 |
| A-haiku | dm t* | anthropic/claude-opus-5.5 | 8 | 32 | 151493 | 225255 | 19226 | $1.6688 | 0 | 0 | 0 |
| A-luna | check A-luna opening | anthropic/claude-haiku-5.5 | 1 | 727 | 0 | 0 | 79 | $0.0001 | 0 | 0 | 0 |
| A-luna | check A-luna t* player | anthropic/claude-haiku-5.5 | 4 | 3995 | 0 | 0 | 259 | $0.0005 | 0 | 0 | 0 |
| A-luna | dm t* | anthropic/claude-opus-5.5 | 8 | 30 | 185461 | 171831 | 17856 | $1.2621 | 0 | 0 | 0 |
| A-haiku | dm t* | anthropic/claude-haiku-5.5 | 4 | 9856 | 0 | 0 | 1902 | $0.0019 | 0 | 0 | 0 |
| A-haiku | check A-haiku t* dm | anthropic/claude-haiku-5.5 | 4 | 5072 | 0 | 0 | 336 | $0.0007 | 0 | 0 | 0 |
| A-luna | dm t* | anthropic/claude-haiku-5.5 | 4 | 8391 | 0 | 0 | 810 | $0.0012 | 0 | 0 | 0 |
| A-luna | check A-luna t* dm | anthropic/claude-haiku-5.5 | 4 | 4494 | 0 | 0 | 290 | $0.0006 | 0 | 0 | 0 |
| A-haiku | dm t* probe ooc | anthropic/claude-opus-5.5 | 1 | 10990 | 0 | 19515 | 628 | $0.2126 | 0 | 0 | 0 |
| A-luna | dm t* probe ooc | anthropic/claude-opus-5.5 | 1 | 10531 | 17291 | 1894 | 1100 | $0.0827 | 0 | 0 | 0 |
| A-haiku | check A-haiku t* dm (probe, out of game) | anthropic/claude-haiku-5.5 | 1 | 624 | 0 | 0 | 65 | $0.0001 | 0 | 0 | 0 |
| A-haiku | check A-haiku t* dm (told before a card) | anthropic/claude-haiku-5.5 | 1 | 616 | 0 | 0 | 61 | $0.0001 | 0 | 0 | 0 |
| A-haiku | player t* card 1 | anthropic/claude-haiku-5.5 | 1 | 4 | 15701 | 813 | 263 | $0.0004 | 0 | 0 | 0 |
| A-haiku | check A-haiku t* player (card) | anthropic/claude-haiku-5.5 | 2 | 1425 | 0 | 0 | 121 | $0.0002 | 0 | 0 | 0 |
| A-haiku | player t* card 2 | anthropic/claude-haiku-5.5 | 1 | 4 | 16514 | 202 | 209 | $0.0003 | 0 | 0 | 0 |
| A-luna | check A-luna t* dm (probe, out of game) | anthropic/claude-haiku-5.5 | 1 | 645 | 0 | 0 | 65 | $0.0001 | 0 | 0 | 0 |
| A-haiku | dm t* onward | anthropic/claude-opus-5.5 | 2 | 6 | 67576 | 28596 | 3649 | $0.2295 | 0 | 0 | 0 |
| A-luna | check A-luna t* dm (told before a card) | anthropic/claude-haiku-5.5 | 1 | 566 | 0 | 0 | 68 | $0.0001 | 0 | 0 | 0 |
| A-luna | check A-luna t* player (card) | anthropic/claude-haiku-5.5 | 2 | 1534 | 0 | 0 | 118 | $0.0002 | 0 | 0 | 0 |
| A-luna | dm t* onward | anthropic/claude-opus-5.5 | 2 | 6 | 64391 | 26266 | 4950 | $0.2432 | 0 | 0 | 0 |
| A-haiku | dm t* onward | anthropic/claude-haiku-5.5 | 2 | 3019 | 0 | 0 | 683 | $0.0006 | 0 | 0 | 0 |
| A-luna | dm t* onward | anthropic/claude-haiku-5.5 | 2 | 3831 | 0 | 0 | 280 | $0.0005 | 0 | 0 | 0 |
| A-haiku | note | anthropic/claude-haiku-5.5 | 1 | 4 | 17361 | 1472 | 530 | $0.0006 | 0 | 0 | 0 |
| A-haiku | check A-haiku note | anthropic/claude-haiku-5.5 | 1 | 888 | 0 | 0 | 75 | $0.0001 | 0 | 0 | 0 |
| A-haiku | after | anthropic/claude-haiku-5.5 | 1 | 4 | 18833 | 553 | 634 | $0.0006 | 0 | 0 | 0 |
| A-haiku | check A-haiku after | anthropic/claude-haiku-5.5 | 1 | 527 | 0 | 0 | 64 | $0.0001 | 0 | 0 | 0 |
| A-luna | check A-luna note | anthropic/claude-haiku-5.5 | 1 | 683 | 0 | 0 | 70 | $0.0001 | 0 | 0 | 0 |
| A-luna | check A-luna after | anthropic/claude-haiku-5.5 | 1 | 441 | 0 | 0 | 63 | $0.0001 | 0 | 0 | 0 |
