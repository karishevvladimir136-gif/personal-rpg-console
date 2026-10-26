# FIX_S4 run 1 smoke (rerun after 11w′) — the OpenRouter ledger

Cap $9.9769; spent before this run $0.0000; this run $2.7698; total $2.7698; 29 calls.

| Session | Purpose | Model | Calls | Input (uncached) | Cache read | Cache write | Output | USD | Errors | Refusals | 429 waits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A-luna | wizard | anthropic/claude-opus-5.5 | 2 | 16408 | 0 | 1567 | 12585 | $0.3252 | 0 | 0 | 0 |
| A-luna | prep | anthropic/claude-opus-5.5 | 1 | 4096 | 0 | 17206 | 13690 | $0.4278 | 0 | 0 | 0 |
| A-luna | check A-luna opening | anthropic/claude-haiku-5.5 | 1 | 800 | 0 | 0 | 75 | $0.0001 | 0 | 0 | 0 |
| A-luna | check A-luna t* player | anthropic/claude-haiku-5.5 | 4 | 4497 | 0 | 0 | 255 | $0.0006 | 0 | 0 | 0 |
| A-luna | dm t* | anthropic/claude-opus-5.5 | 10 | 40 | 219488 | 254815 | 28337 | $2.0129 | 0 | 0 | 0 |
| A-luna | dm t* | anthropic/claude-haiku-5.5 | 5 | 12724 | 0 | 0 | 2118 | $0.0023 | 0 | 0 | 0 |
| A-luna | check A-luna t* dm | anthropic/claude-haiku-5.5 | 4 | 4695 | 0 | 0 | 320 | $0.0006 | 0 | 0 | 0 |
| A-luna | check A-luna note | anthropic/claude-haiku-5.5 | 1 | 639 | 0 | 0 | 74 | $0.0001 | 0 | 0 | 0 |
| A-luna | check A-luna after | anthropic/claude-haiku-5.5 | 1 | 402 | 0 | 0 | 72 | $0.0001 | 0 | 0 | 0 |
