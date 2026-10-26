# FIX_S4 run 1 smoke — the OpenAI ledger

Cap $3; spent before this run $0.0000; this run $0.0104; total $0.0104; 8 calls.

| Session | Purpose | Model | Calls | Input (uncached) | Cache read | Cache write | Output | USD | Errors | Refusals | 429 waits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A-luna | player t* | gpt-6-luna | 4 | 12 | 29924 | 10916 | 1245 | $0.0050 | 0 | 0 | 0 |
| A-luna | player t* card 1 | gpt-6-luna | 1 | 3 | 10302 | 540 | 20 | $0.0011 | 0 | 0 | 0 |
| A-luna | player t* card 2 | gpt-6-luna | 1 | 3 | 10842 | 149 | 50 | $0.0011 | 0 | 0 | 0 |
| A-luna | note | gpt-6-luna | 1 | 3 | 11605 | 837 | 1024 | $0.0018 | 0 | 0 | 0 |
| A-luna | after | gpt-6-luna | 1 | 3 | 12442 | 236 | 192 | $0.0014 | 0 | 0 | 0 |
