# Game player same-world 1 — the dry run on Haiku — the OpenRouter ledger

Cap $4; spent before this run $0.0000; this run $0.1565; total $0.1565; 138 calls.

| Session | Purpose | Model | Calls | Input (uncached) | Cache read | Cache write | Output | USD | Errors | Refusals | 429 waits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| freeze A | wizard | anthropic/claude-haiku-5.5 | 2 | 10344 | 1567 | 0 | 16380 | $0.0092 | 0 | 0 | 0 |
| freeze B | wizard | anthropic/claude-haiku-5.5 | 2 | 10369 | 1567 | 0 | 19451 | $0.0108 | 0 | 0 | 0 |
| freeze A | prep | anthropic/claude-haiku-5.5 | 1 | 3700 | 0 | 16941 | 18525 | $0.0130 | 0 | 0 | 0 |
| freeze B | prep | anthropic/claude-haiku-5.5 | 1 | 3139 | 16673 | 289 | 12674 | $0.0069 | 0 | 0 | 0 |
| A-haiku-1 | check A-haiku-1 opening | anthropic/claude-haiku-5.5 | 1 | 535 | 0 | 0 | 67 | $0.0001 | 0 | 0 | 0 |
| A-haiku-1 | player t* | anthropic/claude-haiku-5.5 | 3 | 12 | 27369 | 15017 | 1907 | $0.0031 | 0 | 0 | 0 |
| A-haiku-1 | check A-haiku-1 t* player | anthropic/claude-haiku-5.5 | 3 | 2985 | 0 | 0 | 232 | $0.0004 | 0 | 0 | 0 |
| A-haiku-1 | dm t* | anthropic/claude-haiku-5.5 | 17 | 9218 | 295404 | 173781 | 24013 | $0.0407 | 0 | 0 | 0 |
| A-haiku-1 | check A-haiku-1 t* dm | anthropic/claude-haiku-5.5 | 3 | 3355 | 0 | 0 | 218 | $0.0004 | 0 | 0 | 0 |
| A-haiku-1 | note | anthropic/claude-haiku-5.5 | 1 | 4 | 15017 | 975 | 751 | $0.0006 | 0 | 0 | 0 |
| A-haiku-1 | check A-haiku-1 note | anthropic/claude-haiku-5.5 | 1 | 774 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| A-haiku-1 | after | anthropic/claude-haiku-5.5 | 1 | 4 | 15992 | 439 | 476 | $0.0005 | 0 | 0 | 0 |
| A-haiku-1 | check A-haiku-1 after | anthropic/claude-haiku-5.5 | 1 | 590 | 0 | 0 | 63 | $0.0001 | 0 | 0 | 0 |
| score A-haiku-1 | tag player A-haiku-1 t* 1 | anthropic/claude-haiku-5.5 | 3 | 5594 | 0 | 0 | 805 | $0.0010 | 0 | 0 | 0 |
| score A-haiku-1 | tag player A-haiku-1 t* 2 | anthropic/claude-haiku-5.5 | 3 | 5594 | 0 | 0 | 1302 | $0.0012 | 0 | 0 | 0 |
| score A-haiku-1 | tag dm A-haiku-1 t* 1 | anthropic/claude-haiku-5.5 | 3 | 3568 | 0 | 0 | 1124 | $0.0009 | 0 | 0 | 0 |
| score A-haiku-1 | tag dm A-haiku-1 t* 2 | anthropic/claude-haiku-5.5 | 3 | 3568 | 0 | 0 | 1178 | $0.0009 | 0 | 0 | 0 |
| score A-haiku-1 | threads A-haiku-1 | anthropic/claude-haiku-5.5 | 1 | 1740 | 0 | 0 | 852 | $0.0006 | 0 | 0 | 0 |
| score A-haiku-1 | note A-haiku-1 1 | anthropic/claude-haiku-5.5 | 1 | 688 | 0 | 0 | 100 | $0.0001 | 0 | 0 | 0 |
| score A-haiku-1 | note A-haiku-1 2 | anthropic/claude-haiku-5.5 | 1 | 688 | 0 | 0 | 106 | $0.0001 | 0 | 0 | 0 |
| score A-haiku-1 | authorship A-haiku-1 1 | anthropic/claude-haiku-5.5 | 1 | 3397 | 0 | 0 | 393 | $0.0005 | 0 | 0 | 0 |
| score A-haiku-1 | authorship A-haiku-1 2 | anthropic/claude-haiku-5.5 | 1 | 3397 | 0 | 0 | 350 | $0.0005 | 0 | 0 | 0 |
| score A-haiku-1 | note extra A-haiku-1 1 | anthropic/claude-haiku-5.5 | 1 | 771 | 0 | 0 | 283 | $0.0002 | 0 | 0 | 0 |
| score A-haiku-1 | note extra A-haiku-1 2 | anthropic/claude-haiku-5.5 | 1 | 771 | 0 | 0 | 84 | $0.0001 | 0 | 0 | 0 |
| score A-haiku-1 | note extra A-haiku-1 referee | anthropic/claude-haiku-5.5 | 1 | 771 | 0 | 0 | 381 | $0.0003 | 0 | 0 | 0 |
| score A-haiku-1 | made A-haiku-1 t* 1 | anthropic/claude-haiku-5.5 | 3 | 4472 | 0 | 0 | 254 | $0.0006 | 0 | 0 | 0 |
| score A-haiku-1 | made A-haiku-1 t* 2 | anthropic/claude-haiku-5.5 | 3 | 4472 | 0 | 0 | 252 | $0.0006 | 0 | 0 | 0 |
| score A-haiku-1 | overlap A-haiku-1 1 | anthropic/claude-haiku-5.5 | 1 | 7950 | 0 | 0 | 1429 | $0.0015 | 0 | 0 | 0 |
| score A-haiku-1 | overlap A-haiku-1 2 | anthropic/claude-haiku-5.5 | 1 | 7950 | 0 | 0 | 1693 | $0.0016 | 0 | 0 | 0 |
| score A-haiku-1 | world A-haiku-1 1 | anthropic/claude-haiku-5.5 | 1 | 1881 | 0 | 0 | 534 | $0.0005 | 0 | 0 | 0 |
| score A-haiku-1 | world A-haiku-1 2 | anthropic/claude-haiku-5.5 | 1 | 1881 | 0 | 0 | 458 | $0.0004 | 0 | 0 | 0 |
| B-haiku-1 | check B-haiku-1 opening | anthropic/claude-haiku-5.5 | 1 | 556 | 0 | 0 | 72 | $0.0001 | 0 | 0 | 0 |
| B-haiku-1 | player t* | anthropic/claude-haiku-5.5 | 3 | 12 | 26368 | 15055 | 2230 | $0.0033 | 0 | 0 | 0 |
| B-haiku-1 | check B-haiku-1 t* player | anthropic/claude-haiku-5.5 | 3 | 3647 | 0 | 0 | 200 | $0.0005 | 0 | 0 | 0 |
| B-haiku-1 | dm t* | anthropic/claude-haiku-5.5 | 19 | 13372 | 369124 | 141904 | 29026 | $0.0375 | 0 | 0 | 0 |
| B-haiku-1 | check B-haiku-1 t* dm | anthropic/claude-haiku-5.5 | 3 | 4099 | 0 | 0 | 214 | $0.0005 | 0 | 0 | 0 |
| B-haiku-1 | note | anthropic/claude-haiku-5.5 | 1 | 4 | 15055 | 1167 | 1269 | $0.0009 | 0 | 0 | 0 |
| B-haiku-1 | check B-haiku-1 note | anthropic/claude-haiku-5.5 | 1 | 1032 | 0 | 0 | 67 | $0.0001 | 0 | 0 | 0 |
| B-haiku-1 | after | anthropic/claude-haiku-5.5 | 1 | 4 | 16222 | 697 | 613 | $0.0006 | 0 | 0 | 0 |
| B-haiku-1 | check B-haiku-1 after | anthropic/claude-haiku-5.5 | 1 | 565 | 0 | 0 | 65 | $0.0001 | 0 | 0 | 0 |
| score B-haiku-1 | tag player B-haiku-1 t* 1 | anthropic/claude-haiku-5.5 | 3 | 6948 | 0 | 0 | 955 | $0.0012 | 0 | 0 | 0 |
| score B-haiku-1 | tag player B-haiku-1 t* 2 | anthropic/claude-haiku-5.5 | 3 | 6948 | 0 | 0 | 947 | $0.0012 | 0 | 0 | 0 |
| score B-haiku-1 | tag dm B-haiku-1 t* 1 | anthropic/claude-haiku-5.5 | 3 | 4312 | 0 | 0 | 998 | $0.0009 | 0 | 0 | 0 |
| score B-haiku-1 | tag dm B-haiku-1 t* 2 | anthropic/claude-haiku-5.5 | 3 | 4312 | 0 | 0 | 1137 | $0.0010 | 0 | 0 | 0 |
| score B-haiku-1 | threads B-haiku-1 | anthropic/claude-haiku-5.5 | 1 | 2432 | 0 | 0 | 513 | $0.0005 | 0 | 0 | 0 |
| score B-haiku-1 | note B-haiku-1 1 | anthropic/claude-haiku-5.5 | 1 | 946 | 0 | 0 | 210 | $0.0002 | 0 | 0 | 0 |
| score B-haiku-1 | note B-haiku-1 2 | anthropic/claude-haiku-5.5 | 1 | 946 | 0 | 0 | 224 | $0.0002 | 0 | 0 | 0 |
| score B-haiku-1 | authorship B-haiku-1 1 | anthropic/claude-haiku-5.5 | 1 | 4167 | 0 | 0 | 499 | $0.0007 | 0 | 0 | 0 |
| score B-haiku-1 | authorship B-haiku-1 2 | anthropic/claude-haiku-5.5 | 1 | 4167 | 0 | 0 | 526 | $0.0007 | 0 | 0 | 0 |
| score B-haiku-1 | goal scale B-haiku-1 t* 1 | anthropic/claude-haiku-5.5 | 1 | 689 | 0 | 0 | 397 | $0.0003 | 0 | 0 | 0 |
| score B-haiku-1 | goal scale B-haiku-1 t* 2 | anthropic/claude-haiku-5.5 | 1 | 689 | 0 | 0 | 316 | $0.0002 | 0 | 0 | 0 |
| score B-haiku-1 | note extra B-haiku-1 1 | anthropic/claude-haiku-5.5 | 1 | 1029 | 0 | 0 | 133 | $0.0002 | 0 | 0 | 0 |
| score B-haiku-1 | note extra B-haiku-1 2 | anthropic/claude-haiku-5.5 | 1 | 1029 | 0 | 0 | 225 | $0.0002 | 0 | 0 | 0 |
| score B-haiku-1 | made B-haiku-1 t* 1 | anthropic/claude-haiku-5.5 | 3 | 5826 | 0 | 0 | 226 | $0.0007 | 0 | 0 | 0 |
| score B-haiku-1 | made B-haiku-1 t* 2 | anthropic/claude-haiku-5.5 | 3 | 5826 | 0 | 0 | 210 | $0.0007 | 0 | 0 | 0 |
| score B-haiku-1 | lady B-haiku-1 t* 1 | anthropic/claude-haiku-5.5 | 3 | 5793 | 0 | 0 | 200 | $0.0007 | 0 | 0 | 0 |
| score B-haiku-1 | lady B-haiku-1 t* 2 | anthropic/claude-haiku-5.5 | 3 | 5793 | 0 | 0 | 202 | $0.0007 | 0 | 0 | 0 |
| score B-haiku-1 | overlap B-haiku-1 1 | anthropic/claude-haiku-5.5 | 1 | 8470 | 0 | 0 | 1664 | $0.0017 | 0 | 0 | 0 |
| score B-haiku-1 | overlap B-haiku-1 2 | anthropic/claude-haiku-5.5 | 1 | 8470 | 0 | 0 | 534 | $0.0011 | 0 | 0 | 0 |
| score B-haiku-1 | overlap B-haiku-1 referee | anthropic/claude-haiku-5.5 | 1 | 8470 | 0 | 0 | 1757 | $0.0017 | 0 | 0 | 0 |
| score B-haiku-1 | world B-haiku-1 1 | anthropic/claude-haiku-5.5 | 1 | 2594 | 0 | 0 | 118 | $0.0003 | 0 | 0 | 0 |
| score B-haiku-1 | world B-haiku-1 2 | anthropic/claude-haiku-5.5 | 1 | 2594 | 0 | 0 | 129 | $0.0003 | 0 | 0 | 0 |
