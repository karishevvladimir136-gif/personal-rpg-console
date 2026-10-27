# Game player villain 1 — the OpenRouter ledger

Cap $100; spent before this run $0.0000; this run $2.2099; total $2.2099; 34 calls.

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
