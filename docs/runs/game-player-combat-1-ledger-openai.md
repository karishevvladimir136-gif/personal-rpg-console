# Game player combat 1 — the OpenAI ledger

Cap $15; spent before this run $0.0000; this run $3.5989; total $3.5989; 95 calls.

| Session | Purpose | Model | Calls | Input (uncached) | Cache read | Cache write | Output | USD | Errors | Refusals | 429 waits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CW-astra | player t* | gpt-6-astra | 25 | 75 | 562330 | 32483 | 2485 | $1.0934 | 0 | 0 | 0 |
| CW-astra | player t* card 1 | gpt-6-astra | 8 | 24 | 132507 | 3009 | 81 | $0.1744 | 0 | 0 | 0 |
| CW-astra | player t* card 2 | gpt-6-astra | 8 | 24 | 135516 | 1282 | 118 | $0.1577 | 0 | 0 | 0 |
| CW-astra | player t* card 3 | gpt-6-astra | 4 | 12 | 74431 | 647 | 35 | $0.0844 | 0 | 0 | 0 |
| CW-astra | player t* card 4 | gpt-6-astra | 3 | 9 | 53174 | 406 | 24 | $0.0595 | 0 | 0 | 0 |
| CW-astra | note | gpt-6-astra | 1 | 3 | 37827 | 1194 | 662 | $0.0859 | 0 | 0 | 0 |
| CW-astra | after | gpt-6-astra | 1 | 3 | 39021 | 682 | 235 | $0.0593 | 0 | 0 | 0 |
| CW-sol | player t* | gpt-6.1-sol | 25 | 75 | 481969 | 27744 | 2466 | $1.0581 | 0 | 0 | 0 |
| CW-sol | player t* card 1 | gpt-6.1-sol | 8 | 24 | 148586 | 2342 | 84 | $0.3039 | 0 | 0 | 0 |
| CW-sol | player t* card 2 | gpt-6.1-sol | 8 | 24 | 150928 | 1131 | 92 | $0.3057 | 0 | 0 | 0 |
| CW-sol | player t* card 3 | gpt-6.1-sol | 1 | 3 | 19727 | 122 | 9 | $0.0399 | 0 | 0 | 0 |
| CW-sol | player t* card 4 | gpt-6.1-sol | 1 | 3 | 19849 | 128 | 8 | $0.0401 | 0 | 0 | 0 |
| CW-sol | note | gpt-6.1-sol | 1 | 3 | 31467 | 853 | 403 | $0.0691 | 0 | 0 | 0 |
| CW-sol | after | gpt-6.1-sol | 1 | 3 | 32320 | 423 | 184 | $0.0675 | 0 | 0 | 0 |
