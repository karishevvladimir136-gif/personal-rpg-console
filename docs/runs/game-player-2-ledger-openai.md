# Game player 2 — the OpenAI ledger

Cap $40; spent before this run $0.0000; this run $0.5551; total $0.5551; 20 calls.

| Session | Purpose | Model | Calls | Input (uncached) | Cache read | Cache write | Output | USD | Errors | Refusals | 429 waits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C-sol | player t* | gpt-6.1-sol | 7 | 21 | 64656 | 13391 | 563 | $0.1685 | 0 | 0 | 0 |
| C-astra | player t* | gpt-6-astra | 9 | 27 | 87087 | 13918 | 615 | $0.2921 | 0 | 0 | 0 |
| C-astra | player t* card 1 | gpt-6-astra | 1 | 3 | 13918 | 678 | 9 | $0.0229 | 0 | 0 | 0 |
| C-sol | player t* card 1 | gpt-6.1-sol | 1 | 3 | 13391 | 257 | 9 | $0.0275 | 0 | 0 | 0 |
| C-astra | player t* card 2 | gpt-6-astra | 1 | 3 | 14596 | 93 | 8 | $0.0162 | 0 | 0 | 0 |
| C-sol | player t* card 2 | gpt-6.1-sol | 1 | 3 | 13648 | 96 | 40 | $0.0279 | 0 | 0 | 0 |
