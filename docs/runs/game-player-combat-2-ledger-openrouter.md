# Game player combat 2 — the OpenRouter ledger

Cap $70; spent before this run $0.0000; this run $2.5691; total $2.5691; 79 calls.

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
