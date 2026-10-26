# Game player replicate 1 — the OpenRouter ledger

Cap $300; spent before this run $0.0000; this run $19.7017; total $19.7017; 395 calls.

| Session | Purpose | Model | Calls | Input (uncached) | Cache read | Cache write | Output | USD | Errors | Refusals | 429 waits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A-opus | wizard | anthropic/claude-opus-5.5 | 4 | 23700 | 0 | 3134 | 29587 | $0.7022 | 0 | 0 | 0 |
| A-opus | prep | anthropic/claude-opus-5.5 | 2 | 6825 | 15056 | 16117 | 18061 | $0.5205 | 0 | 0 | 0 |
| A-opus | check A-opus opening | anthropic/claude-haiku-5.5 | 2 | 1595 | 0 | 0 | 142 | $0.0002 | 0 | 0 | 0 |
| A-opus | player t* | anthropic/claude-opus-5.5 | 9 | 36 | 113931 | 39110 | 5739 | $0.3333 | 0 | 0 | 0 |
| A-opus | check A-opus t* player | anthropic/claude-haiku-5.5 | 9 | 13543 | 0 | 0 | 621 | $0.0017 | 0 | 0 | 0 |
| A-opus | dm t* | anthropic/claude-opus-5.5 | 16 | 60 | 278208 | 383570 | 52534 | $3.1637 | 1 | 0 | 0 |
| A-opus | dm t* | anthropic/claude-haiku-5.5 | 6 | 16818 | 0 | 0 | 2202 | $0.0028 | 0 | 0 | 0 |
| A-opus | check A-opus t* dm | anthropic/claude-haiku-5.5 | 7 | 10925 | 0 | 0 | 763 | $0.0015 | 0 | 0 | 0 |
| A-opus | check A-opus t* dm (told before a card) | anthropic/claude-haiku-5.5 | 2 | 1894 | 0 | 0 | 135 | $0.0003 | 0 | 0 | 0 |
| A-opus | player t* card 1 | anthropic/claude-opus-5.5 | 2 | 8 | 33537 | 1543 | 455 | $0.0236 | 0 | 0 | 0 |
| A-opus | check A-opus t* player (card) | anthropic/claude-haiku-5.5 | 6 | 3686 | 0 | 0 | 384 | $0.0006 | 0 | 0 | 0 |
| A-opus | player t* card 2 | anthropic/claude-opus-5.5 | 2 | 8 | 35080 | 452 | 427 | $0.0178 | 0 | 0 | 0 |
| A-opus | dm t* onward | anthropic/claude-opus-5.5 | 4 | 14 | 145908 | 31334 | 6552 | $0.3169 | 0 | 0 | 0 |
| A-opus | dm t* onward | anthropic/claude-haiku-5.5 | 2 | 3811 | 0 | 0 | 375 | $0.0006 | 0 | 0 | 0 |
| A-opus | player t* card 3 | anthropic/claude-opus-5.5 | 1 | 4 | 19460 | 317 | 138 | $0.0083 | 0 | 0 | 0 |
| A-opus | player t* card 4 | anthropic/claude-opus-5.5 | 1 | 4 | 19777 | 198 | 184 | $0.0086 | 0 | 0 | 0 |
| A-opus | note | anthropic/claude-opus-5.5 | 1 | 4 | 19975 | 137 | 1551 | $0.0357 | 0 | 0 | 0 |
| A-opus | check A-opus note | anthropic/claude-haiku-5.5 | 1 | 1375 | 0 | 0 | 87 | $0.0002 | 0 | 0 | 0 |
| A-opus | after | anthropic/claude-opus-5.5 | 1 | 4 | 20112 | 1040 | 719 | $0.0236 | 0 | 0 | 0 |
| A-opus | check A-opus after | anthropic/claude-haiku-5.5 | 1 | 928 | 0 | 0 | 65 | $0.0001 | 0 | 0 | 0 |
| score A-opus | tag player A-opus t* 1 | anthropic/claude-haiku-5.5 | 4 | 9699 | 0 | 0 | 1435 | $0.0017 | 0 | 0 | 0 |
| score A-opus | tag player A-opus t* 2 | anthropic/claude-haiku-5.5 | 4 | 9699 | 0 | 0 | 1567 | $0.0018 | 0 | 0 | 0 |
| score A-opus | tag dm A-opus t* 1 | anthropic/claude-haiku-5.5 | 3 | 4507 | 0 | 0 | 1147 | $0.0010 | 0 | 0 | 0 |
| score A-opus | tag dm A-opus t* 2 | anthropic/claude-haiku-5.5 | 3 | 4507 | 0 | 0 | 952 | $0.0009 | 0 | 0 | 0 |
| score A-opus | threads A-opus | anthropic/claude-opus-5.5 | 1 | 2824 | 0 | 0 | 502 | $0.0213 | 0 | 0 | 0 |
| score A-opus | rollcheck A-opus t* | anthropic/claude-haiku-5.5 | 1 | 1792 | 0 | 0 | 228 | $0.0003 | 0 | 0 | 0 |
| score A-opus | note A-opus 1 | anthropic/claude-haiku-5.5 | 1 | 1289 | 0 | 0 | 140 | $0.0002 | 0 | 0 | 0 |
| score A-opus | note A-opus 2 | anthropic/claude-haiku-5.5 | 1 | 1289 | 0 | 0 | 118 | $0.0002 | 0 | 0 | 0 |
| score A-opus | authorship A-opus 1 | anthropic/claude-opus-5.5 | 1 | 6414 | 0 | 0 | 630 | $0.0383 | 0 | 0 | 0 |
| score A-opus | authorship A-opus 2 | anthropic/claude-opus-5.5 | 1 | 6414 | 0 | 0 | 585 | $0.0374 | 0 | 0 | 0 |
| score A-opus | note extra A-opus 1 | anthropic/claude-haiku-5.5 | 1 | 1372 | 0 | 0 | 111 | $0.0002 | 0 | 0 | 0 |
| score A-opus | note extra A-opus 2 | anthropic/claude-haiku-5.5 | 1 | 1372 | 0 | 0 | 109 | $0.0002 | 0 | 0 | 0 |
| score A-opus | made A-opus t* 1 | anthropic/claude-haiku-5.5 | 4 | 8203 | 0 | 0 | 318 | $0.0010 | 0 | 0 | 0 |
| score A-opus | made A-opus t* 2 | anthropic/claude-haiku-5.5 | 4 | 8203 | 0 | 0 | 290 | $0.0010 | 0 | 0 | 0 |
| A-fable | wizard | anthropic/claude-opus-5.5 | 2 | 11876 | 0 | 1567 | 14737 | $0.3501 | 0 | 0 | 0 |
| A-fable | prep | anthropic/claude-opus-5.5 | 1 | 3303 | 15056 | 521 | 8393 | $0.1883 | 0 | 0 | 0 |
| A-fable | check A-fable opening | anthropic/claude-haiku-5.5 | 1 | 788 | 0 | 0 | 68 | $0.0001 | 0 | 0 | 0 |
| A-fable | player t* | anthropic/claude-fable-5.1 | 20 | 80 | 582074 | 48855 | 11881 | $1.3511 | 0 | 0 | 0 |
| A-fable | check A-fable t* player | anthropic/claude-haiku-5.5 | 20 | 36764 | 0 | 0 | 1491 | $0.0044 | 0 | 0 | 0 |
| A-fable | dm t* | anthropic/claude-opus-5.5 | 43 | 170 | 1257133 | 1447270 | 164381 | $10.8690 | 0 | 0 | 1 |
| A-fable | dm t* | anthropic/claude-haiku-5.5 | 22 | 68895 | 0 | 0 | 10212 | $0.0120 | 0 | 0 | 0 |
| A-fable | check A-fable t* dm | anthropic/claude-haiku-5.5 | 20 | 37090 | 0 | 0 | 1639 | $0.0045 | 0 | 0 | 0 |
| A-fable | check A-fable t* dm (told before a card) | anthropic/claude-haiku-5.5 | 2 | 2295 | 0 | 0 | 129 | $0.0003 | 0 | 0 | 0 |
| A-fable | player t* card 1 | anthropic/claude-fable-5.1 | 2 | 8 | 64507 | 1951 | 18 | $0.0415 | 0 | 0 | 0 |
| A-fable | check A-fable t* player (card) | anthropic/claude-haiku-5.5 | 5 | 3306 | 0 | 0 | 328 | $0.0005 | 0 | 0 | 0 |
| A-fable | player t* card 2 | anthropic/claude-fable-5.1 | 2 | 8 | 66458 | 317 | 297 | $0.0355 | 0 | 0 | 0 |
| A-fable | dm t* onward | anthropic/claude-opus-5.5 | 5 | 16 | 271305 | 88807 | 13424 | $0.7668 | 0 | 0 | 0 |
| A-fable | dm t* onward | anthropic/claude-haiku-5.5 | 4 | 10168 | 0 | 0 | 1012 | $0.0015 | 0 | 0 | 0 |
| A-fable | player t* card 3 | anthropic/claude-fable-5.1 | 1 | 4 | 43345 | 222 | 264 | $0.0269 | 0 | 0 | 0 |
| A-fable | note | anthropic/claude-fable-5.1 | 1 | 4 | 51345 | 1357 | 2227 | $0.1412 | 0 | 0 | 0 |
| A-fable | check A-fable note | anthropic/claude-haiku-5.5 | 1 | 1511 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| A-fable | after | anthropic/claude-fable-5.1 | 1 | 4 | 52702 | 1176 | 823 | $0.0691 | 0 | 0 | 0 |
| A-fable | check A-fable after | anthropic/claude-haiku-5.5 | 1 | 978 | 0 | 0 | 73 | $0.0001 | 0 | 0 | 0 |
| score A-fable | tag player A-fable t* 1 | anthropic/claude-haiku-5.5 | 20 | 69362 | 0 | 0 | 5479 | $0.0097 | 0 | 0 | 0 |
| score A-fable | tag player A-fable t* 2 | anthropic/claude-haiku-5.5 | 20 | 69362 | 0 | 0 | 5266 | $0.0096 | 0 | 0 | 0 |
| score A-fable | tag player A-fable t* referee | anthropic/claude-opus-5.5 | 3 | 9350 | 0 | 0 | 879 | $0.0550 | 0 | 0 | 0 |
| score A-fable | tag dm A-fable t* 1 | anthropic/claude-haiku-5.5 | 20 | 39400 | 0 | 0 | 6637 | $0.0073 | 0 | 0 | 0 |
| score A-fable | tag dm A-fable t* 2 | anthropic/claude-haiku-5.5 | 20 | 39400 | 0 | 0 | 5835 | $0.0069 | 0 | 0 | 0 |
| score A-fable | threads A-fable | anthropic/claude-opus-5.5 | 1 | 24040 | 0 | 0 | 838 | $0.1129 | 0 | 0 | 0 |
| score A-fable | rollcheck A-fable t* | anthropic/claude-haiku-5.5 | 2 | 4628 | 0 | 0 | 454 | $0.0007 | 0 | 0 | 0 |
| score A-fable | note A-fable 1 | anthropic/claude-haiku-5.5 | 1 | 1425 | 0 | 0 | 135 | $0.0002 | 0 | 0 | 0 |
| score A-fable | note A-fable 2 | anthropic/claude-haiku-5.5 | 1 | 1425 | 0 | 0 | 135 | $0.0002 | 0 | 0 | 0 |
| score A-fable | authorship A-fable 1 | anthropic/claude-opus-5.5 | 1 | 36115 | 0 | 0 | 1612 | $0.1767 | 0 | 0 | 0 |
| score A-fable | authorship A-fable 2 | anthropic/claude-opus-5.5 | 1 | 36115 | 0 | 0 | 1657 | $0.1776 | 0 | 0 | 0 |
| score A-fable | note extra A-fable 1 | anthropic/claude-haiku-5.5 | 1 | 1508 | 0 | 0 | 371 | $0.0003 | 0 | 0 | 0 |
| score A-fable | note extra A-fable 2 | anthropic/claude-haiku-5.5 | 1 | 1508 | 0 | 0 | 461 | $0.0004 | 0 | 0 | 0 |
| score A-fable | made A-fable t* 1 | anthropic/claude-haiku-5.5 | 20 | 61882 | 0 | 0 | 1504 | $0.0069 | 0 | 0 | 0 |
| score A-fable | made A-fable t* 2 | anthropic/claude-haiku-5.5 | 20 | 61882 | 0 | 0 | 1423 | $0.0069 | 0 | 0 | 0 |
