# Game player combat 1 — the OpenRouter ledger

Cap $90; spent before this run $0.0000; this run $4.9951; total $4.9951; 133 calls.

| Session | Purpose | Model | Calls | Input (uncached) | Cache read | Cache write | Output | USD | Errors | Refusals | 429 waits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CW-haiku | wizard | anthropic/claude-opus-5.5 | 2 | 16832 | 0 | 1567 | 14569 | $0.3665 | 0 | 0 | 0 |
| CW-haiku | prep | anthropic/claude-opus-5.5 | 1 | 4127 | 0 | 17101 | 10270 | $0.3587 | 0 | 0 | 0 |
| CW-haiku | check CW-haiku opening | anthropic/claude-haiku-5.5 | 1 | 695 | 0 | 0 | 65 | $0.0001 | 0 | 0 | 0 |
| CW-haiku | player t* | anthropic/claude-haiku-5.5 | 8 | 32 | 129398 | 25347 | 8030 | $0.0085 | 0 | 0 | 0 |
| CW-haiku | check CW-haiku t* player | anthropic/claude-haiku-5.5 | 8 | 14131 | 0 | 0 | 562 | $0.0017 | 0 | 0 | 0 |
| CW-haiku | dm t* | anthropic/claude-opus-5.5 | 19 | 76 | 498027 | 505753 | 65919 | $4.0348 | 0 | 0 | 0 |
| CW-haiku | dm t* | anthropic/claude-haiku-5.5 | 10 | 28572 | 0 | 0 | 5037 | $0.0054 | 0 | 0 | 0 |
| CW-haiku | check CW-haiku t* dm | anthropic/claude-haiku-5.5 | 8 | 14787 | 0 | 0 | 954 | $0.0020 | 0 | 0 | 0 |
| CW-haiku | note | anthropic/claude-haiku-5.5 | 1 | 4 | 25347 | 1710 | 1241 | $0.0011 | 0 | 0 | 0 |
| CW-haiku | check CW-haiku note | anthropic/claude-haiku-5.5 | 1 | 1009 | 0 | 0 | 64 | $0.0001 | 0 | 0 | 0 |
| CW-haiku | after | anthropic/claude-haiku-5.5 | 1 | 4 | 27057 | 674 | 672 | $0.0007 | 0 | 0 | 0 |
| CW-haiku | check CW-haiku after | anthropic/claude-haiku-5.5 | 1 | 598 | 0 | 0 | 64 | $0.0001 | 0 | 0 | 0 |
| score CW-haiku | tag player CW-haiku t* 1 | anthropic/claude-haiku-5.5 | 8 | 26003 | 0 | 0 | 1795 | $0.0035 | 0 | 0 | 0 |
| score CW-haiku | tag player CW-haiku t* 2 | anthropic/claude-haiku-5.5 | 8 | 26003 | 0 | 0 | 1767 | $0.0035 | 0 | 0 | 0 |
| score CW-haiku | tag player CW-haiku t* referee | anthropic/claude-opus-5.5 | 2 | 6478 | 0 | 0 | 207 | $0.0301 | 0 | 0 | 0 |
| score CW-haiku | tag dm CW-haiku t* 1 | anthropic/claude-haiku-5.5 | 8 | 15355 | 0 | 0 | 2853 | $0.0030 | 0 | 0 | 0 |
| score CW-haiku | tag dm CW-haiku t* 2 | anthropic/claude-haiku-5.5 | 8 | 15355 | 0 | 0 | 2997 | $0.0030 | 0 | 0 | 0 |
| score CW-haiku | threads CW-haiku | anthropic/claude-opus-5.5 | 1 | 9053 | 0 | 0 | 506 | $0.0463 | 0 | 0 | 0 |
| score CW-haiku | note CW-haiku 1 | anthropic/claude-haiku-5.5 | 1 | 923 | 0 | 0 | 108 | $0.0001 | 0 | 0 | 0 |
| score CW-haiku | note CW-haiku 2 | anthropic/claude-haiku-5.5 | 1 | 923 | 0 | 0 | 96 | $0.0001 | 0 | 0 | 0 |
| score CW-haiku | combat player CW-haiku t* 1 | anthropic/claude-haiku-5.5 | 8 | 29099 | 0 | 0 | 2081 | $0.0040 | 0 | 0 | 0 |
| score CW-haiku | combat player CW-haiku t* 2 | anthropic/claude-haiku-5.5 | 8 | 29099 | 0 | 0 | 2364 | $0.0041 | 0 | 0 | 0 |
| score CW-haiku | combat dm CW-haiku t* 1 | anthropic/claude-haiku-5.5 | 8 | 15579 | 0 | 0 | 1190 | $0.0022 | 0 | 0 | 0 |
| score CW-haiku | combat dm CW-haiku t* 2 | anthropic/claude-haiku-5.5 | 8 | 15579 | 0 | 0 | 1168 | $0.0021 | 0 | 0 | 0 |
| score CW-haiku | combat player CW-haiku t* referee | anthropic/claude-opus-5.5 | 2 | 7756 | 0 | 0 | 816 | $0.0473 | 0 | 0 | 0 |
| score CW-haiku | exit CW-haiku | anthropic/claude-opus-5.5 | 1 | 13483 | 0 | 0 | 613 | $0.0662 | 0 | 0 | 0 |
