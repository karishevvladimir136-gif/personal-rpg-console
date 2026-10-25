# Game player 1 — the OpenAI ledger

Cap $80; spent before this run $0.0000; this run $4.9485; total $4.9485; 565 calls.

Every call's own line — with its door (`provider`), `upstream`, `servedModel`, request id and message id — is in the ledger's `.json`.

| Session | Purpose | Model | Provider (door) | Upstream | Served model | Calls | Input (uncached) | Cache read | Cache write | Output | USD | Errors | Refusals | 429 waits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A-sol | player t* | gpt-6.1-sol | openai | openai | gpt-6.1-sol | 22 | 66 | 344600 | 27916 | 2151 | $0.7806 | 0 | 0 | 0 |
| A-sol | player t* card 1 | gpt-6.1-sol | openai | openai | gpt-6.1-sol | 6 | 18 | 101989 | 1765 | 54 | $0.2090 | 0 | 0 | 0 |
| A-sol | player t* card 2 | gpt-6.1-sol | openai | openai | gpt-6.1-sol | 6 | 18 | 103754 | 751 | 80 | $0.2102 | 0 | 0 | 0 |
| A-sol | note | gpt-6.1-sol | openai | openai | gpt-6.1-sol | 2 | 6 | 38567 | 2813 | 807 | $0.0922 | 0 | 0 | 0 |
| A-sol | after | gpt-6.1-sol | openai | openai | gpt-6.1-sol | 2 | 6 | 41380 | 847 | 319 | $0.0881 | 0 | 0 | 0 |
| A-astra | player t* | gpt-6-astra | openai | openai | gpt-6-astra | 20 | 60 | 309802 | 23866 | 1773 | $0.6974 | 0 | 0 | 0 |
| A-astra | player t* card 1 | gpt-6-astra | openai | openai | gpt-6-astra | 3 | 9 | 53198 | 1295 | 27 | $0.0708 | 0 | 0 | 0 |
| A-astra | player t* card 2 | gpt-6-astra | openai | openai | gpt-6-astra | 3 | 9 | 54493 | 295 | 89 | $0.0627 | 0 | 0 | 0 |
| A-astra | player t* card 3 | gpt-6-astra | openai | openai | gpt-6-astra | 1 | 3 | 11352 | 153 | 8 | $0.0137 | 0 | 0 | 0 |
| A-sol | player t* card 3 | gpt-6.1-sol | openai | openai | gpt-6.1-sol | 1 | 3 | 21126 | 109 | 9 | $0.0426 | 0 | 0 | 0 |
| A-sol | player t* card 4 | gpt-6.1-sol | openai | openai | gpt-6.1-sol | 1 | 3 | 21235 | 127 | 8 | $0.0429 | 0 | 0 | 0 |
| A-astra | note | gpt-6-astra | openai | openai | gpt-6-astra | 1 | 3 | 25609 | 965 | 615 | $0.0685 | 0 | 0 | 0 |
| A-astra | after | gpt-6-astra | openai | openai | gpt-6-astra | 1 | 3 | 26574 | 635 | 246 | $0.0468 | 0 | 0 | 0 |
| B-sol | player t* | gpt-6.1-sol | openai | openai | gpt-6.1-sol | 24 | 72 | 348024 | 37531 | 2138 | $0.8114 | 0 | 0 | 0 |
| B-sol | player t* card 1 | gpt-6.1-sol | openai | openai | gpt-6.1-sol | 3 | 9 | 50025 | 1523 | 27 | $0.1041 | 0 | 0 | 0 |
| B-sol | player t* card 2 | gpt-6.1-sol | openai | openai | gpt-6.1-sol | 3 | 9 | 51548 | 333 | 36 | $0.1043 | 0 | 0 | 0 |
| score A-astra | tag player A-astra t* 1 | gpt-6-luna | openai | openai | gpt-6-luna | 20 | 60 | 18648 | 17085 | 4464 | $0.0062 | 0 | 0 | 0 |
| score A-astra | tag player A-astra t* 2 | gpt-6-luna | openai | openai | gpt-6-luna | 20 | 60 | 13475 | 22258 | 3612 | $0.0059 | 0 | 0 | 0 |
| score A-astra | tag player A-astra t* referee | gpt-6-luna | openai | openai | gpt-6-luna | 3 | 9 | 0 | 4822 | 1774 | $0.0015 | 0 | 0 | 0 |
| score A-astra | tag dm A-astra t* 1 | gpt-6-luna | openai | openai | gpt-6-luna | 20 | 11829 | 0 | 7202 | 3536 | $0.0039 | 0 | 0 | 0 |
| score A-astra | tag dm A-astra t* 2 | gpt-6-luna | openai | openai | gpt-6-luna | 20 | 11829 | 5870 | 1332 | 3669 | $0.0038 | 0 | 0 | 0 |
| score A-astra | threads A-astra | gpt-6-luna | openai | openai | gpt-6-luna | 1 | 3 | 0 | 12385 | 3097 | $0.0031 | 0 | 0 | 0 |
| score A-astra | rollcheck A-astra t* | gpt-6-luna | openai | openai | gpt-6-luna | 4 | 1856 | 0 | 2427 | 1029 | $0.0010 | 0 | 0 | 0 |
| score A-astra | note A-astra 1 | gpt-6-luna | openai | openai | gpt-6-luna | 1 | 809 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| score A-astra | note A-astra 2 | gpt-6-luna | openai | openai | gpt-6-luna | 1 | 809 | 0 | 0 | 57 | $0.0001 | 0 | 0 | 0 |
| score A-sol | tag player A-sol t* 1 | gpt-6-luna | openai | openai | gpt-6-luna | 20 | 60 | 12158 | 25953 | 3305 | $0.0061 | 0 | 0 | 0 |
| score A-sol | tag player A-sol t* 2 | gpt-6-luna | openai | openai | gpt-6-luna | 20 | 60 | 22883 | 15228 | 3391 | $0.0059 | 0 | 0 | 0 |
| score A-sol | tag player A-sol t* referee | gpt-6-luna | openai | openai | gpt-6-luna | 4 | 12 | 0 | 7369 | 2685 | $0.0023 | 0 | 0 | 0 |
| score A-sol | tag dm A-sol t* 1 | gpt-6-luna | openai | openai | gpt-6-luna | 20 | 10609 | 3480 | 6060 | 3731 | $0.0040 | 0 | 0 | 0 |
| score A-sol | tag dm A-sol t* 2 | gpt-6-luna | openai | openai | gpt-6-luna | 20 | 10609 | 4771 | 4769 | 4018 | $0.0041 | 0 | 0 | 0 |
| score A-sol | threads A-sol | gpt-6-luna | openai | openai | gpt-6-luna | 1 | 3 | 0 | 13527 | 3274 | $0.0033 | 0 | 0 | 0 |
| score A-sol | deception A-sol t* 1 | gpt-6-luna | openai | openai | gpt-6-luna | 1 | 3 | 0 | 1334 | 160 | $0.0002 | 0 | 0 | 0 |
| score A-sol | deception A-sol t* 2 | gpt-6-luna | openai | openai | gpt-6-luna | 1 | 3 | 1334 | 0 | 228 | $0.0002 | 0 | 0 | 0 |
| score A-sol | rollcheck A-sol t* | gpt-6-luna | openai | openai | gpt-6-luna | 8 | 1871 | 0 | 7608 | 2663 | $0.0025 | 0 | 0 | 0 |
| score A-sol | note A-sol 1 | gpt-6-luna | openai | openai | gpt-6-luna | 1 | 628 | 0 | 0 | 92 | $0.0001 | 0 | 0 | 0 |
| score A-sol | note A-sol 2 | gpt-6-luna | openai | openai | gpt-6-luna | 1 | 628 | 0 | 0 | 84 | $0.0001 | 0 | 0 | 0 |
| score A-fable | tag player A-fable t* 1 | gpt-6-luna | openai | openai | gpt-6-luna | 20 | 60 | 15291 | 26018 | 5103 | $0.0073 | 0 | 0 | 0 |
| score A-fable | tag player A-fable t* 2 | gpt-6-luna | openai | openai | gpt-6-luna | 20 | 60 | 24429 | 16880 | 3938 | $0.0065 | 0 | 0 | 0 |
| score A-fable | tag player A-fable t* referee | gpt-6-luna | openai | openai | gpt-6-luna | 6 | 18 | 0 | 13092 | 4931 | $0.0041 | 0 | 0 | 0 |
| score A-fable | tag dm A-fable t* 1 | gpt-6-luna | openai | openai | gpt-6-luna | 18 | 3669 | 2324 | 15802 | 3162 | $0.0042 | 0 | 0 | 0 |
| score A-fable | tag dm A-fable t* 2 | gpt-6-luna | openai | openai | gpt-6-luna | 18 | 3669 | 14498 | 3628 | 3373 | $0.0040 | 0 | 0 | 0 |
| score A-fable | threads A-fable | gpt-6-luna | openai | openai | gpt-6-luna | 1 | 3 | 0 | 13533 | 5086 | $0.0042 | 0 | 0 | 0 |
| score A-fable | rollcheck A-fable t* | gpt-6-luna | openai | openai | gpt-6-luna | 3 | 9 | 0 | 4283 | 574 | $0.0008 | 0 | 0 | 0 |
| score A-fable | note A-fable 1 | gpt-6-luna | openai | openai | gpt-6-luna | 1 | 948 | 0 | 0 | 95 | $0.0001 | 0 | 0 | 0 |
| score A-fable | note A-fable 2 | gpt-6-luna | openai | openai | gpt-6-luna | 1 | 948 | 0 | 0 | 74 | $0.0001 | 0 | 0 | 0 |
| score A-opus | tag player A-opus t* 1 | gpt-6-luna | openai | openai | gpt-6-luna | 20 | 60 | 22381 | 32175 | 4619 | $0.0086 | 0 | 0 | 0 |
| score A-opus | tag player A-opus t* 2 | gpt-6-luna | openai | openai | gpt-6-luna | 20 | 60 | 27280 | 27276 | 5290 | $0.0088 | 0 | 0 | 0 |
| score A-opus | tag player A-opus t* referee | gpt-6-luna | openai | openai | gpt-6-luna | 5 | 15 | 0 | 13880 | 3589 | $0.0035 | 0 | 0 | 0 |
| score A-opus | tag dm A-opus t* 1 | gpt-6-luna | openai | openai | gpt-6-luna | 20 | 966 | 18531 | 11845 | 3043 | $0.0050 | 0 | 0 | 0 |
| score A-opus | tag dm A-opus t* 2 | gpt-6-luna | openai | openai | gpt-6-luna | 20 | 966 | 10667 | 19709 | 3155 | $0.0052 | 0 | 0 | 0 |
| score A-opus | threads A-opus | gpt-6-luna | openai | openai | gpt-6-luna | 1 | 3 | 0 | 18632 | 3605 | $0.0041 | 0 | 0 | 0 |
| score A-opus | deception A-opus t* 1 | gpt-6-luna | openai | openai | gpt-6-luna | 2 | 6 | 0 | 3116 | 188 | $0.0005 | 0 | 0 | 0 |
| score A-opus | deception A-opus t* 2 | gpt-6-luna | openai | openai | gpt-6-luna | 2 | 6 | 3116 | 0 | 152 | $0.0004 | 0 | 0 | 0 |
| score A-opus | rollcheck A-opus t* | gpt-6-luna | openai | openai | gpt-6-luna | 7 | 21 | 0 | 12774 | 2946 | $0.0031 | 0 | 0 | 0 |
| score A-opus | note A-opus 1 | gpt-6-luna | openai | openai | gpt-6-luna | 1 | 3 | 0 | 1150 | 81 | $0.0002 | 0 | 0 | 0 |
| score A-opus | note A-opus 2 | gpt-6-luna | openai | openai | gpt-6-luna | 1 | 3 | 1150 | 0 | 53 | $0.0001 | 0 | 0 | 0 |
| score B-opus | tag player B-opus t* 1 | gpt-6-luna | openai | openai | gpt-6-luna | 7 | 21 | 7122 | 8411 | 1806 | $0.0027 | 0 | 0 | 0 |
| score B-opus | tag player B-opus t* 2 | gpt-6-luna | openai | openai | gpt-6-luna | 7 | 21 | 6229 | 9304 | 1502 | $0.0025 | 0 | 0 | 0 |
| score B-opus | tag player B-opus t* referee | gpt-6-luna | openai | openai | gpt-6-luna | 1 | 3 | 0 | 2182 | 201 | $0.0004 | 0 | 0 | 0 |
| score B-opus | tag dm B-opus t* 1 | gpt-6-luna | openai | openai | gpt-6-luna | 7 | 1852 | 4231 | 2690 | 1226 | $0.0016 | 0 | 0 | 0 |
| score B-opus | tag dm B-opus t* 2 | gpt-6-luna | openai | openai | gpt-6-luna | 7 | 1852 | 2690 | 4231 | 1206 | $0.0016 | 0 | 0 | 0 |
| score B-opus | threads B-opus | gpt-6-luna | openai | openai | gpt-6-luna | 1 | 3 | 0 | 5527 | 2236 | $0.0018 | 0 | 0 | 0 |
| score B-opus | rollcheck B-opus t* | gpt-6-luna | openai | openai | gpt-6-luna | 4 | 12 | 0 | 5626 | 1765 | $0.0016 | 0 | 0 | 0 |
| score B-sol | tag player B-sol t* 1 | gpt-6-luna | openai | openai | gpt-6-luna | 4 | 12 | 1401 | 5903 | 919 | $0.0013 | 0 | 0 | 0 |
| score B-sol | tag player B-sol t* 2 | gpt-6-luna | openai | openai | gpt-6-luna | 4 | 12 | 3992 | 3312 | 523 | $0.0011 | 0 | 0 | 0 |
| score B-sol | tag player B-sol t* referee | gpt-6-luna | openai | openai | gpt-6-luna | 1 | 3 | 0 | 2311 | 433 | $0.0005 | 0 | 0 | 0 |
| score B-sol | tag dm B-sol t* 1 | gpt-6-luna | openai | openai | gpt-6-luna | 4 | 1801 | 1323 | 1094 | 800 | $0.0008 | 0 | 0 | 0 |
| score B-sol | tag dm B-sol t* 2 | gpt-6-luna | openai | openai | gpt-6-luna | 4 | 1801 | 1094 | 1323 | 767 | $0.0008 | 0 | 0 | 0 |
| score B-sol | threads B-sol | gpt-6-luna | openai | openai | gpt-6-luna | 1 | 3 | 0 | 2980 | 2385 | $0.0016 | 0 | 0 | 0 |
| score B-sol | rollcheck B-sol t* | gpt-6-luna | openai | openai | gpt-6-luna | 1 | 3 | 0 | 1404 | 307 | $0.0003 | 0 | 0 | 0 |
| B-astra | player t* | gpt-6-astra | openai | openai | gpt-6-astra | 20 | 60 | 350829 | 25442 | 2300 | $0.7845 | 0 | 0 | 0 |
| B-astra | player t* card 1 | gpt-6-astra | openai | openai | gpt-6-astra | 6 | 18 | 106700 | 2797 | 75 | $0.1456 | 0 | 0 | 0 |
| B-astra | player t* card 2 | gpt-6-astra | openai | openai | gpt-6-astra | 6 | 18 | 109497 | 659 | 78 | $0.1218 | 0 | 0 | 0 |
| B-astra | player t* card 3 | gpt-6-astra | openai | openai | gpt-6-astra | 1 | 3 | 15106 | 87 | 69 | $0.0197 | 0 | 0 | 0 |
| B-astra | player t* card 4 | gpt-6-astra | openai | openai | gpt-6-astra | 1 | 3 | 15193 | 127 | 9 | $0.0173 | 0 | 0 | 0 |
| B-astra | player t* card 5 | gpt-6-astra | openai | openai | gpt-6-astra | 1 | 3 | 15320 | 93 | 39 | $0.0185 | 0 | 0 | 0 |
| B-sol | note | gpt-6.1-sol | openai | openai | gpt-6.1-sol | 1 | 3 | 27049 | 1364 | 556 | $0.0631 | 0 | 0 | 0 |
| B-sol | after | gpt-6.1-sol | openai | openai | gpt-6.1-sol | 1 | 3 | 28413 | 576 | 210 | $0.0604 | 0 | 0 | 0 |
| B-astra | note | gpt-6-astra | openai | openai | gpt-6-astra | 1 | 3 | 29205 | 1519 | 622 | $0.0793 | 0 | 0 | 0 |
| B-astra | after | gpt-6-astra | openai | openai | gpt-6-astra | 1 | 3 | 30724 | 642 | 204 | $0.0490 | 0 | 0 | 0 |
