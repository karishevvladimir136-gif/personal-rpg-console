# Game player replicate 1 — the OpenRouter ledger

Cap $300; spent before this run $0.0000; this run $2.9918; total $2.9918; 32 calls.

| Session | Purpose | Model | Calls | Input (uncached) | Cache read | Cache write | Output | USD | Errors | Refusals | 429 waits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A-opus | wizard | anthropic/claude-opus-5.5 | 2 | 12061 | 0 | 1567 | 15437 | $0.3648 | 0 | 0 | 0 |
| A-opus | prep | anthropic/claude-opus-5.5 | 1 | 3409 | 0 | 15560 | 10135 | $0.3408 | 0 | 0 | 0 |
| A-opus | check A-opus opening | anthropic/claude-haiku-5.5 | 1 | 771 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| A-opus | player t* | anthropic/claude-opus-5.5 | 5 | 20 | 67068 | 21645 | 3402 | $0.1898 | 0 | 0 | 0 |
| A-opus | check A-opus t* player | anthropic/claude-haiku-5.5 | 5 | 8312 | 0 | 0 | 359 | $0.0010 | 0 | 0 | 0 |
| A-opus | dm t* | anthropic/claude-opus-5.5 | 10 | 36 | 165350 | 245080 | 35316 | $2.0924 | 1 | 0 | 0 |
| A-opus | dm t* | anthropic/claude-haiku-5.5 | 4 | 11830 | 0 | 0 | 1507 | $0.0019 | 0 | 0 | 0 |
| A-opus | check A-opus t* dm | anthropic/claude-haiku-5.5 | 4 | 6995 | 0 | 0 | 308 | $0.0009 | 0 | 0 | 0 |
