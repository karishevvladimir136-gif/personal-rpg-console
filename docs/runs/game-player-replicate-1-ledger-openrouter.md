# Game player replicate 1 — the OpenRouter ledger

Cap $300; spent before this run $0.0000; this run $149.7549; total $149.7549; 3736 calls.

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
| A-astra | wizard | anthropic/claude-opus-5.5 | 3 | 21881 | 0 | 1567 | 16427 | $0.4239 | 0 | 0 | 0 |
| A-astra | prep | anthropic/claude-opus-5.5 | 1 | 3386 | 15056 | 409 | 8696 | $0.1937 | 0 | 0 | 0 |
| A-astra | check A-astra opening | anthropic/claude-haiku-5.5 | 1 | 676 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| A-astra | check A-astra t* player | anthropic/claude-haiku-5.5 | 20 | 25660 | 0 | 0 | 1387 | $0.0033 | 0 | 0 | 0 |
| A-astra | dm t* | anthropic/claude-opus-5.5 | 44 | 176 | 1245484 | 1326486 | 131303 | $9.5688 | 0 | 0 | 0 |
| A-astra | dm t* | anthropic/claude-haiku-5.5 | 23 | 56376 | 0 | 0 | 9295 | $0.0103 | 0 | 0 | 0 |
| A-astra | check A-astra t* dm | anthropic/claude-haiku-5.5 | 20 | 26236 | 0 | 0 | 1591 | $0.0034 | 0 | 0 | 0 |
| A-astra | check A-astra t* dm (told before a card) | anthropic/claude-haiku-5.5 | 3 | 2098 | 0 | 0 | 201 | $0.0003 | 0 | 0 | 0 |
| A-astra | check A-astra t* player (card) | anthropic/claude-haiku-5.5 | 8 | 4220 | 0 | 0 | 486 | $0.0007 | 0 | 0 | 0 |
| A-astra | dm t* onward | anthropic/claude-opus-5.5 | 6 | 18 | 249076 | 114604 | 18592 | $0.9947 | 0 | 0 | 0 |
| A-astra | dm t* onward | anthropic/claude-haiku-5.5 | 6 | 13028 | 0 | 0 | 1478 | $0.0020 | 0 | 0 | 0 |
| A-astra | check referee A-astra t* player | anthropic/claude-opus-5.5 | 1 | 1301 | 0 | 0 | 66 | $0.0065 | 0 | 0 | 0 |
| A-astra | check A-astra note | anthropic/claude-haiku-5.5 | 1 | 1346 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| A-astra | check A-astra after | anthropic/claude-haiku-5.5 | 1 | 620 | 0 | 0 | 75 | $0.0001 | 0 | 0 | 0 |
| score A-astra | tag player A-astra t* 1 | anthropic/claude-haiku-5.5 | 20 | 52945 | 0 | 0 | 5475 | $0.0080 | 0 | 0 | 0 |
| score A-astra | tag player A-astra t* 2 | anthropic/claude-haiku-5.5 | 20 | 52945 | 0 | 0 | 4535 | $0.0076 | 0 | 0 | 0 |
| score A-astra | tag player A-astra t* referee | anthropic/claude-opus-5.5 | 4 | 10932 | 0 | 0 | 972 | $0.0632 | 0 | 0 | 0 |
| score A-astra | tag dm A-astra t* 1 | anthropic/claude-haiku-5.5 | 20 | 28443 | 0 | 0 | 5584 | $0.0056 | 0 | 0 | 0 |
| score A-astra | tag dm A-astra t* 2 | anthropic/claude-haiku-5.5 | 20 | 28443 | 0 | 0 | 5340 | $0.0055 | 0 | 0 | 0 |
| score A-astra | threads A-astra | anthropic/claude-opus-5.5 | 1 | 18999 | 0 | 0 | 668 | $0.0894 | 0 | 0 | 0 |
| score A-astra | rollcheck A-astra t* | anthropic/claude-haiku-5.5 | 3 | 4957 | 0 | 0 | 498 | $0.0007 | 0 | 0 | 0 |
| score A-astra | note A-astra 1 | anthropic/claude-haiku-5.5 | 1 | 1260 | 0 | 0 | 101 | $0.0002 | 0 | 0 | 0 |
| score A-astra | note A-astra 2 | anthropic/claude-haiku-5.5 | 1 | 1260 | 0 | 0 | 110 | $0.0002 | 0 | 0 | 0 |
| score A-astra | authorship A-astra 1 | anthropic/claude-opus-5.5 | 1 | 25297 | 0 | 0 | 1205 | $0.1253 | 0 | 0 | 0 |
| score A-astra | authorship A-astra 2 | anthropic/claude-opus-5.5 | 1 | 25297 | 0 | 0 | 1078 | $0.1227 | 0 | 0 | 0 |
| score A-astra | note extra A-astra 1 | anthropic/claude-haiku-5.5 | 1 | 1343 | 0 | 0 | 232 | $0.0003 | 0 | 0 | 0 |
| score A-astra | note extra A-astra 2 | anthropic/claude-haiku-5.5 | 1 | 1343 | 0 | 0 | 265 | $0.0003 | 0 | 0 | 0 |
| score A-astra | made A-astra t* 1 | anthropic/claude-haiku-5.5 | 20 | 45465 | 0 | 0 | 1441 | $0.0053 | 0 | 0 | 0 |
| score A-astra | made A-astra t* 2 | anthropic/claude-haiku-5.5 | 20 | 45465 | 0 | 0 | 1479 | $0.0053 | 0 | 0 | 0 |
| A-sol | wizard | anthropic/claude-opus-5.5 | 2 | 12460 | 0 | 1567 | 13960 | $0.3369 | 0 | 0 | 0 |
| A-sol | prep | anthropic/claude-opus-5.5 | 1 | 3228 | 15056 | 437 | 8755 | $0.1945 | 0 | 0 | 0 |
| A-sol | check A-sol opening | anthropic/claude-haiku-5.5 | 1 | 704 | 0 | 0 | 86 | $0.0001 | 0 | 0 | 0 |
| A-sol | check A-sol t* player | anthropic/claude-haiku-5.5 | 20 | 23382 | 0 | 0 | 1348 | $0.0030 | 0 | 0 | 0 |
| A-sol | dm t* | anthropic/claude-opus-5.5 | 46 | 178 | 1357906 | 1308501 | 122567 | $9.3179 | 0 | 0 | 0 |
| A-sol | check A-sol t* dm (told before a card) | anthropic/claude-haiku-5.5 | 1 | 568 | 0 | 0 | 69 | $0.0001 | 0 | 0 | 0 |
| A-sol | check A-sol t* player (card) | anthropic/claude-haiku-5.5 | 2 | 1033 | 0 | 0 | 113 | $0.0002 | 0 | 0 | 0 |
| A-sol | dm t* onward | anthropic/claude-opus-5.5 | 2 | 6 | 56518 | 21209 | 4413 | $0.2056 | 0 | 0 | 0 |
| A-sol | dm t* onward | anthropic/claude-haiku-5.5 | 2 | 3342 | 0 | 0 | 515 | $0.0006 | 0 | 0 | 0 |
| A-sol | check A-sol t* dm | anthropic/claude-haiku-5.5 | 20 | 24535 | 0 | 0 | 1447 | $0.0032 | 0 | 0 | 0 |
| A-sol | dm t* | anthropic/claude-haiku-5.5 | 22 | 56937 | 0 | 0 | 7810 | $0.0096 | 0 | 0 | 0 |
| A-sol | check A-sol note | anthropic/claude-haiku-5.5 | 1 | 1028 | 0 | 0 | 70 | $0.0001 | 0 | 0 | 0 |
| A-sol | check A-sol after | anthropic/claude-haiku-5.5 | 1 | 524 | 0 | 0 | 68 | $0.0001 | 0 | 0 | 0 |
| score A-sol | tag player A-sol t* 1 | anthropic/claude-haiku-5.5 | 20 | 48484 | 0 | 0 | 4308 | $0.0070 | 0 | 0 | 0 |
| score A-sol | tag player A-sol t* 2 | anthropic/claude-haiku-5.5 | 20 | 48484 | 0 | 0 | 4295 | $0.0070 | 0 | 0 | 0 |
| score A-sol | tag player A-sol t* referee | anthropic/claude-opus-5.5 | 5 | 12611 | 0 | 0 | 509 | $0.0606 | 0 | 0 | 0 |
| score A-sol | tag dm A-sol t* 1 | anthropic/claude-haiku-5.5 | 20 | 26129 | 0 | 0 | 6150 | $0.0057 | 0 | 0 | 0 |
| score A-sol | tag dm A-sol t* 2 | anthropic/claude-haiku-5.5 | 20 | 26129 | 0 | 0 | 5901 | $0.0056 | 0 | 0 | 0 |
| score A-sol | threads A-sol | anthropic/claude-opus-5.5 | 1 | 17429 | 0 | 0 | 792 | $0.0856 | 0 | 0 | 0 |
| score A-sol | rollcheck A-sol t* | anthropic/claude-haiku-5.5 | 2 | 3181 | 0 | 0 | 202 | $0.0004 | 0 | 0 | 0 |
| score A-sol | note A-sol 1 | anthropic/claude-haiku-5.5 | 1 | 942 | 0 | 0 | 115 | $0.0002 | 0 | 0 | 0 |
| score A-sol | note A-sol 2 | anthropic/claude-haiku-5.5 | 1 | 942 | 0 | 0 | 107 | $0.0001 | 0 | 0 | 0 |
| score A-sol | authorship A-sol 1 | anthropic/claude-opus-5.5 | 1 | 22304 | 0 | 0 | 1380 | $0.1168 | 0 | 0 | 0 |
| score A-sol | authorship A-sol 2 | anthropic/claude-opus-5.5 | 1 | 22304 | 0 | 0 | 1218 | $0.1136 | 0 | 0 | 0 |
| score A-sol | note extra A-sol 1 | anthropic/claude-haiku-5.5 | 1 | 1025 | 0 | 0 | 298 | $0.0003 | 0 | 0 | 0 |
| score A-sol | note extra A-sol 2 | anthropic/claude-haiku-5.5 | 1 | 1025 | 0 | 0 | 221 | $0.0002 | 0 | 0 | 0 |
| score A-sol | made A-sol t* 1 | anthropic/claude-haiku-5.5 | 20 | 41004 | 0 | 0 | 1385 | $0.0048 | 0 | 0 | 0 |
| score A-sol | made A-sol t* 2 | anthropic/claude-haiku-5.5 | 20 | 41004 | 0 | 0 | 1332 | $0.0048 | 0 | 0 | 0 |
| B-opus | wizard | anthropic/claude-opus-5.5 | 2 | 11702 | 0 | 1567 | 14296 | $0.3406 | 0 | 0 | 0 |
| B-opus | prep | anthropic/claude-opus-5.5 | 1 | 2714 | 15056 | 498 | 5020 | $0.1183 | 0 | 0 | 0 |
| B-opus | check B-opus opening | anthropic/claude-haiku-5.5 | 1 | 765 | 0 | 0 | 82 | $0.0001 | 0 | 0 | 0 |
| B-opus | player t* | anthropic/claude-opus-5.5 | 20 | 80 | 650652 | 49225 | 13640 | $0.6494 | 0 | 0 | 0 |
| B-opus | check B-opus t* player | anthropic/claude-haiku-5.5 | 20 | 40330 | 0 | 0 | 1484 | $0.0048 | 0 | 0 | 0 |
| B-opus | dm t* | anthropic/claude-opus-5.5 | 47 | 174 | 1797547 | 1193493 | 140193 | $9.2381 | 0 | 0 | 0 |
| B-opus | dm t* | anthropic/claude-haiku-5.5 | 20 | 60762 | 0 | 0 | 7598 | $0.0099 | 0 | 0 | 0 |
| B-opus | check B-opus t* dm | anthropic/claude-haiku-5.5 | 20 | 41208 | 0 | 0 | 1795 | $0.0050 | 0 | 0 | 0 |
| B-opus | check B-opus t* dm (told before a card) | anthropic/claude-haiku-5.5 | 8 | 7780 | 0 | 0 | 532 | $0.0010 | 0 | 0 | 0 |
| B-opus | player t* card 1 | anthropic/claude-opus-5.5 | 8 | 32 | 235411 | 6616 | 757 | $0.0954 | 0 | 0 | 0 |
| B-opus | check B-opus t* player (card) | anthropic/claude-haiku-5.5 | 23 | 13842 | 0 | 0 | 1452 | $0.0021 | 0 | 0 | 0 |
| B-opus | player t* card 2 | anthropic/claude-opus-5.5 | 8 | 32 | 242027 | 1637 | 945 | $0.0756 | 0 | 0 | 0 |
| B-opus | dm t* onward | anthropic/claude-opus-5.5 | 24 | 78 | 1161991 | 303621 | 60501 | $2.9608 | 0 | 0 | 0 |
| B-opus | dm t* onward | anthropic/claude-haiku-5.5 | 18 | 46597 | 0 | 0 | 6170 | $0.0077 | 0 | 0 | 0 |
| B-opus | player t* card 3 | anthropic/claude-opus-5.5 | 6 | 24 | 173787 | 1293 | 1859 | $0.0785 | 0 | 0 | 0 |
| B-opus | player t* card 4 | anthropic/claude-opus-5.5 | 1 | 4 | 27094 | 449 | 233 | $0.0123 | 0 | 0 | 0 |
| B-opus | note | anthropic/claude-opus-5.5 | 1 | 4 | 59220 | 2219 | 2674 | $0.0764 | 0 | 0 | 0 |
| B-opus | check B-opus note | anthropic/claude-haiku-5.5 | 1 | 1808 | 0 | 0 | 74 | $0.0002 | 0 | 0 | 0 |
| B-opus | after | anthropic/claude-opus-5.5 | 1 | 4 | 61439 | 1473 | 1474 | $0.0491 | 0 | 0 | 0 |
| B-opus | check B-opus after | anthropic/claude-haiku-5.5 | 1 | 1171 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| score B-opus | tag player B-opus t* 1 | anthropic/claude-haiku-5.5 | 20 | 75869 | 0 | 0 | 4620 | $0.0099 | 0 | 0 | 0 |
| score B-opus | tag player B-opus t* 2 | anthropic/claude-haiku-5.5 | 20 | 75869 | 0 | 0 | 5345 | $0.0103 | 0 | 0 | 0 |
| score B-opus | tag player B-opus t* referee | anthropic/claude-opus-5.5 | 1 | 4897 | 0 | 0 | 303 | $0.0256 | 0 | 0 | 0 |
| score B-opus | tag dm B-opus t* 1 | anthropic/claude-haiku-5.5 | 20 | 44426 | 0 | 0 | 6675 | $0.0078 | 0 | 0 | 0 |
| score B-opus | tag dm B-opus t* 2 | anthropic/claude-haiku-5.5 | 20 | 44426 | 0 | 0 | 6666 | $0.0078 | 0 | 0 | 0 |
| score B-opus | tag dm B-opus t* referee | anthropic/claude-opus-5.5 | 1 | 1973 | 0 | 0 | 89 | $0.0097 | 0 | 0 | 0 |
| score B-opus | threads B-opus | anthropic/claude-opus-5.5 | 1 | 26394 | 0 | 0 | 743 | $0.1204 | 0 | 0 | 0 |
| score B-opus | deception B-opus t* 1 | anthropic/claude-haiku-5.5 | 1 | 2357 | 0 | 0 | 496 | $0.0005 | 0 | 0 | 0 |
| score B-opus | deception B-opus t* 2 | anthropic/claude-haiku-5.5 | 1 | 2357 | 0 | 0 | 424 | $0.0004 | 0 | 0 | 0 |
| score B-opus | rollcheck B-opus t* | anthropic/claude-haiku-5.5 | 13 | 30419 | 0 | 0 | 3432 | $0.0048 | 0 | 0 | 0 |
| score B-opus | note B-opus 1 | anthropic/claude-haiku-5.5 | 1 | 1722 | 0 | 0 | 122 | $0.0002 | 0 | 0 | 0 |
| score B-opus | note B-opus 2 | anthropic/claude-haiku-5.5 | 1 | 1722 | 0 | 0 | 114 | $0.0002 | 0 | 0 | 0 |
| score B-opus | authorship B-opus 1 | anthropic/claude-opus-5.5 | 1 | 45439 | 0 | 0 | 1606 | $0.2139 | 0 | 0 | 0 |
| score B-opus | authorship B-opus 2 | anthropic/claude-opus-5.5 | 1 | 45439 | 0 | 0 | 1414 | $0.2100 | 0 | 0 | 0 |
| score B-opus | goal scale B-opus t* 1 | anthropic/claude-haiku-5.5 | 1 | 502 | 0 | 0 | 430 | $0.0003 | 0 | 0 | 0 |
| score B-opus | goal scale B-opus t* 2 | anthropic/claude-haiku-5.5 | 1 | 502 | 0 | 0 | 522 | $0.0003 | 0 | 0 | 0 |
| score B-opus | note extra B-opus 1 | anthropic/claude-haiku-5.5 | 1 | 1805 | 0 | 0 | 227 | $0.0003 | 0 | 0 | 0 |
| score B-opus | note extra B-opus 2 | anthropic/claude-haiku-5.5 | 1 | 1805 | 0 | 0 | 113 | $0.0002 | 0 | 0 | 0 |
| score B-opus | made B-opus t* 1 | anthropic/claude-haiku-5.5 | 20 | 68389 | 0 | 0 | 1517 | $0.0076 | 0 | 0 | 0 |
| score B-opus | made B-opus t* 2 | anthropic/claude-haiku-5.5 | 20 | 68389 | 0 | 0 | 1572 | $0.0076 | 0 | 0 | 0 |
| score B-opus | lady B-opus t* 1 | anthropic/claude-haiku-5.5 | 5 | 11597 | 0 | 0 | 435 | $0.0014 | 0 | 0 | 0 |
| score B-opus | lady B-opus t* 2 | anthropic/claude-haiku-5.5 | 5 | 11597 | 0 | 0 | 467 | $0.0014 | 0 | 0 | 0 |
| B-fable | wizard | anthropic/claude-opus-5.5 | 2 | 12190 | 0 | 1567 | 15174 | $0.3601 | 0 | 0 | 0 |
| B-fable | prep | anthropic/claude-opus-5.5 | 1 | 2581 | 15056 | 513 | 5649 | $0.1304 | 0 | 0 | 0 |
| B-fable | check B-fable opening | anthropic/claude-haiku-5.5 | 1 | 780 | 0 | 0 | 83 | $0.0001 | 0 | 0 | 0 |
| B-fable | player t* | anthropic/claude-fable-5.1 | 20 | 80 | 550726 | 46871 | 12718 | $1.3603 | 0 | 0 | 0 |
| B-fable | check B-fable t* player | anthropic/claude-haiku-5.5 | 20 | 35094 | 0 | 0 | 1559 | $0.0043 | 0 | 0 | 0 |
| B-fable | dm t* | anthropic/claude-opus-5.5 | 41 | 164 | 1193607 | 1326774 | 138102 | $9.7223 | 0 | 0 | 0 |
| B-fable | dm t* | anthropic/claude-haiku-5.5 | 21 | 58168 | 0 | 0 | 8990 | $0.0103 | 0 | 0 | 0 |
| B-fable | check B-fable t* dm | anthropic/claude-haiku-5.5 | 20 | 35404 | 0 | 0 | 1824 | $0.0045 | 0 | 0 | 0 |
| B-fable | check referee B-fable t* dm | anthropic/claude-opus-5.5 | 1 | 1329 | 0 | 0 | 62 | $0.0066 | 0 | 0 | 0 |
| B-fable | check B-fable t* dm (told before a card) | anthropic/claude-haiku-5.5 | 3 | 3597 | 0 | 0 | 222 | $0.0005 | 0 | 0 | 0 |
| B-fable | player t* card 1 | anthropic/claude-fable-5.1 | 3 | 12 | 133096 | 3029 | 85 | $0.0755 | 0 | 0 | 0 |
| B-fable | check B-fable t* player (card) | anthropic/claude-haiku-5.5 | 8 | 4806 | 0 | 0 | 489 | $0.0007 | 0 | 0 | 0 |
| B-fable | player t* card 2 | anthropic/claude-fable-5.1 | 3 | 12 | 136125 | 458 | 405 | $0.0601 | 0 | 0 | 0 |
| B-fable | dm t* onward | anthropic/claude-opus-5.5 | 7 | 22 | 400777 | 162708 | 21434 | $1.3225 | 0 | 0 | 1 |
| B-fable | dm t* onward | anthropic/claude-haiku-5.5 | 6 | 15692 | 0 | 0 | 1446 | $0.0023 | 0 | 0 | 0 |
| B-fable | player t* card 3 | anthropic/claude-fable-5.1 | 1 | 4 | 50358 | 118 | 9 | $0.0146 | 0 | 0 | 0 |
| B-fable | player t* card 4 | anthropic/claude-fable-5.1 | 1 | 4 | 50476 | 126 | 219 | $0.0252 | 0 | 0 | 0 |
| B-fable | note | anthropic/claude-fable-5.1 | 1 | 4 | 50602 | 1341 | 3335 | $0.1962 | 0 | 0 | 0 |
| B-fable | check B-fable note | anthropic/claude-haiku-5.5 | 1 | 1998 | 0 | 0 | 62 | $0.0002 | 0 | 0 | 0 |
| B-fable | after | anthropic/claude-fable-5.1 | 1 | 4 | 51943 | 1663 | 1144 | $0.0910 | 0 | 0 | 0 |
| B-fable | check B-fable after | anthropic/claude-haiku-5.5 | 1 | 1092 | 0 | 0 | 76 | $0.0001 | 0 | 0 | 0 |
| score B-fable | tag player B-fable t* 1 | anthropic/claude-haiku-5.5 | 20 | 65959 | 0 | 0 | 8007 | $0.0106 | 0 | 0 | 0 |
| score B-fable | tag player B-fable t* 2 | anthropic/claude-haiku-5.5 | 20 | 65959 | 0 | 0 | 8059 | $0.0106 | 0 | 0 | 0 |
| score B-fable | tag player B-fable t* referee | anthropic/claude-opus-5.5 | 6 | 21652 | 0 | 0 | 1458 | $0.1158 | 0 | 0 | 0 |
| score B-fable | tag dm B-fable t* 1 | anthropic/claude-haiku-5.5 | 20 | 38007 | 0 | 0 | 6119 | $0.0069 | 0 | 0 | 0 |
| score B-fable | tag dm B-fable t* 2 | anthropic/claude-haiku-5.5 | 20 | 38007 | 0 | 0 | 6610 | $0.0071 | 0 | 0 | 0 |
| score B-fable | threads B-fable | anthropic/claude-opus-5.5 | 1 | 22377 | 0 | 0 | 679 | $0.1031 | 0 | 0 | 0 |
| score B-fable | rollcheck B-fable t* | anthropic/claude-haiku-5.5 | 3 | 7192 | 0 | 0 | 588 | $0.0010 | 0 | 0 | 0 |
| score B-fable | note B-fable 1 | anthropic/claude-haiku-5.5 | 1 | 1912 | 0 | 0 | 107 | $0.0002 | 0 | 0 | 0 |
| score B-fable | note B-fable 2 | anthropic/claude-haiku-5.5 | 1 | 1912 | 0 | 0 | 129 | $0.0003 | 0 | 0 | 0 |
| score B-fable | authorship B-fable 1 | anthropic/claude-opus-5.5 | 1 | 35156 | 0 | 0 | 2099 | $0.1826 | 0 | 0 | 0 |
| score B-fable | authorship B-fable 2 | anthropic/claude-opus-5.5 | 1 | 35156 | 0 | 0 | 2150 | $0.1836 | 0 | 0 | 0 |
| score B-fable | goal scale B-fable t* 1 | anthropic/claude-haiku-5.5 | 1 | 579 | 0 | 0 | 219 | $0.0002 | 0 | 0 | 0 |
| score B-fable | goal scale B-fable t* 2 | anthropic/claude-haiku-5.5 | 1 | 579 | 0 | 0 | 295 | $0.0002 | 0 | 0 | 0 |
| score B-fable | note extra B-fable 1 | anthropic/claude-haiku-5.5 | 1 | 1995 | 0 | 0 | 111 | $0.0003 | 0 | 0 | 0 |
| score B-fable | note extra B-fable 2 | anthropic/claude-haiku-5.5 | 1 | 1995 | 0 | 0 | 115 | $0.0003 | 0 | 0 | 0 |
| score B-fable | made B-fable t* 1 | anthropic/claude-haiku-5.5 | 20 | 58479 | 0 | 0 | 1569 | $0.0066 | 0 | 0 | 0 |
| score B-fable | made B-fable t* 2 | anthropic/claude-haiku-5.5 | 20 | 58479 | 0 | 0 | 1491 | $0.0066 | 0 | 0 | 0 |
| score B-fable | lady B-fable t* 1 | anthropic/claude-haiku-5.5 | 5 | 10009 | 0 | 0 | 693 | $0.0013 | 0 | 0 | 0 |
| score B-fable | lady B-fable t* 2 | anthropic/claude-haiku-5.5 | 5 | 10009 | 0 | 0 | 670 | $0.0013 | 0 | 0 | 0 |
| B-astra | wizard | anthropic/claude-opus-5.5 | 2 | 11706 | 0 | 1567 | 14625 | $0.3472 | 0 | 0 | 0 |
| B-astra | prep | anthropic/claude-opus-5.5 | 1 | 2819 | 15056 | 422 | 6155 | $0.1408 | 0 | 0 | 0 |
| B-astra | check B-astra opening | anthropic/claude-haiku-5.5 | 1 | 689 | 0 | 0 | 65 | $0.0001 | 0 | 0 | 0 |
| B-astra | check B-astra t* player | anthropic/claude-haiku-5.5 | 20 | 26910 | 0 | 0 | 1375 | $0.0034 | 0 | 0 | 0 |
| B-astra | dm t* | anthropic/claude-opus-5.5 | 42 | 166 | 1079364 | 1173872 | 124371 | $8.6381 | 0 | 0 | 0 |
| B-astra | dm t* | anthropic/claude-haiku-5.5 | 21 | 54452 | 0 | 0 | 7553 | $0.0092 | 0 | 0 | 0 |
| B-astra | check B-astra t* dm | anthropic/claude-haiku-5.5 | 20 | 27028 | 0 | 0 | 1553 | $0.0035 | 0 | 0 | 0 |
| B-astra | check B-astra t* dm (told before a card) | anthropic/claude-haiku-5.5 | 2 | 1774 | 0 | 0 | 148 | $0.0003 | 0 | 0 | 0 |
| B-astra | check B-astra t* player (card) | anthropic/claude-haiku-5.5 | 6 | 3629 | 0 | 0 | 370 | $0.0005 | 0 | 0 | 0 |
| B-astra | dm t* onward | anthropic/claude-opus-5.5 | 6 | 20 | 261180 | 68129 | 10792 | $0.6088 | 0 | 0 | 0 |
| B-astra | dm t* onward | anthropic/claude-haiku-5.5 | 4 | 9074 | 0 | 0 | 531 | $0.0012 | 0 | 0 | 0 |
| B-astra | check B-astra note | anthropic/claude-haiku-5.5 | 1 | 1154 | 0 | 0 | 63 | $0.0001 | 0 | 0 | 0 |
| B-astra | check B-astra after | anthropic/claude-haiku-5.5 | 1 | 547 | 0 | 0 | 74 | $0.0001 | 0 | 0 | 0 |
| score B-astra | tag player B-astra t* 1 | anthropic/claude-haiku-5.5 | 20 | 55240 | 0 | 0 | 5821 | $0.0084 | 0 | 0 | 0 |
| score B-astra | tag player B-astra t* 2 | anthropic/claude-haiku-5.5 | 20 | 55240 | 0 | 0 | 5171 | $0.0081 | 0 | 0 | 0 |
| score B-astra | tag player B-astra t* referee | anthropic/claude-opus-5.5 | 7 | 17514 | 0 | 0 | 1430 | $0.0987 | 0 | 0 | 0 |
| score B-astra | tag dm B-astra t* 1 | anthropic/claude-haiku-5.5 | 20 | 29379 | 0 | 0 | 6293 | $0.0061 | 0 | 0 | 0 |
| score B-astra | tag dm B-astra t* 2 | anthropic/claude-haiku-5.5 | 20 | 29379 | 0 | 0 | 6218 | $0.0060 | 0 | 0 | 0 |
| score B-astra | tag dm B-astra t* referee | anthropic/claude-opus-5.5 | 1 | 1766 | 0 | 0 | 277 | $0.0126 | 0 | 0 | 0 |
| score B-astra | threads B-astra | anthropic/claude-opus-5.5 | 1 | 19900 | 0 | 0 | 708 | $0.0938 | 0 | 0 | 0 |
| score B-astra | rollcheck B-astra t* | anthropic/claude-haiku-5.5 | 2 | 3687 | 0 | 0 | 333 | $0.0005 | 0 | 0 | 0 |
| score B-astra | note B-astra 1 | anthropic/claude-haiku-5.5 | 1 | 1068 | 0 | 0 | 114 | $0.0002 | 0 | 0 | 0 |
| score B-astra | note B-astra 2 | anthropic/claude-haiku-5.5 | 1 | 1068 | 0 | 0 | 113 | $0.0002 | 0 | 0 | 0 |
| score B-astra | authorship B-astra 1 | anthropic/claude-opus-5.5 | 1 | 26590 | 0 | 0 | 1819 | $0.1427 | 0 | 0 | 0 |
| score B-astra | authorship B-astra 2 | anthropic/claude-opus-5.5 | 1 | 26590 | 0 | 0 | 1505 | $0.1365 | 0 | 0 | 0 |
| score B-astra | note extra B-astra 1 | anthropic/claude-haiku-5.5 | 1 | 1151 | 0 | 0 | 289 | $0.0003 | 0 | 0 | 0 |
| score B-astra | note extra B-astra 2 | anthropic/claude-haiku-5.5 | 1 | 1151 | 0 | 0 | 316 | $0.0003 | 0 | 0 | 0 |
| score B-astra | made B-astra t* 1 | anthropic/claude-haiku-5.5 | 20 | 47760 | 0 | 0 | 1387 | $0.0055 | 0 | 0 | 0 |
| score B-astra | made B-astra t* 2 | anthropic/claude-haiku-5.5 | 20 | 47760 | 0 | 0 | 1406 | $0.0055 | 0 | 0 | 0 |
| score B-astra | lady B-astra t* 1 | anthropic/claude-haiku-5.5 | 5 | 9313 | 0 | 0 | 471 | $0.0012 | 0 | 0 | 0 |
| score B-astra | lady B-astra t* 2 | anthropic/claude-haiku-5.5 | 5 | 9313 | 0 | 0 | 460 | $0.0012 | 0 | 0 | 0 |
| B-sol | wizard | anthropic/claude-opus-5.5 | 2 | 12071 | 0 | 1567 | 13648 | $0.3291 | 0 | 0 | 0 |
| B-sol | prep | anthropic/claude-opus-5.5 | 1 | 2660 | 15056 | 509 | 5171 | $0.1211 | 0 | 0 | 0 |
| B-sol | check B-sol opening | anthropic/claude-haiku-5.5 | 1 | 776 | 0 | 0 | 77 | $0.0001 | 0 | 0 | 0 |
| B-sol | check B-sol t* player | anthropic/claude-haiku-5.5 | 20 | 27789 | 0 | 0 | 1389 | $0.0035 | 0 | 0 | 0 |
| B-sol | dm t* | anthropic/claude-opus-5.5 | 41 | 154 | 1268214 | 1189660 | 114974 | $8.5735 | 0 | 0 | 0 |
| B-sol | dm t* | anthropic/claude-haiku-5.5 | 20 | 52059 | 0 | 0 | 7411 | $0.0089 | 0 | 0 | 0 |
| B-sol | check B-sol t* dm | anthropic/claude-haiku-5.5 | 20 | 28306 | 0 | 0 | 1560 | $0.0036 | 0 | 0 | 0 |
| B-sol | check B-sol t* dm (told before a card) | anthropic/claude-haiku-5.5 | 6 | 5072 | 0 | 0 | 414 | $0.0007 | 0 | 0 | 0 |
| B-sol | check B-sol t* player (card) | anthropic/claude-haiku-5.5 | 13 | 8063 | 0 | 0 | 791 | $0.0012 | 0 | 0 | 0 |
| B-sol | dm t* onward | anthropic/claude-opus-5.5 | 17 | 56 | 734771 | 218168 | 37892 | $1.9959 | 0 | 0 | 0 |
| B-sol | dm t* onward | anthropic/claude-haiku-5.5 | 13 | 30725 | 0 | 0 | 3437 | $0.0048 | 0 | 0 | 0 |
| B-sol | check B-sol note | anthropic/claude-haiku-5.5 | 1 | 1179 | 0 | 0 | 65 | $0.0002 | 0 | 0 | 0 |
| B-sol | check B-sol after | anthropic/claude-haiku-5.5 | 1 | 604 | 0 | 0 | 65 | $0.0001 | 0 | 0 | 0 |
| score B-sol | tag player B-sol t* 1 | anthropic/claude-haiku-5.5 | 20 | 60016 | 0 | 0 | 4060 | $0.0080 | 0 | 0 | 0 |
| score B-sol | tag player B-sol t* 2 | anthropic/claude-haiku-5.5 | 20 | 60016 | 0 | 0 | 4076 | $0.0080 | 0 | 0 | 0 |
| score B-sol | tag player B-sol t* referee | anthropic/claude-opus-5.5 | 2 | 4302 | 0 | 0 | 271 | $0.0226 | 0 | 0 | 0 |
| score B-sol | tag dm B-sol t* 1 | anthropic/claude-haiku-5.5 | 20 | 32080 | 0 | 0 | 6565 | $0.0065 | 0 | 0 | 0 |
| score B-sol | tag dm B-sol t* 2 | anthropic/claude-haiku-5.5 | 20 | 32080 | 0 | 0 | 6536 | $0.0065 | 0 | 0 | 0 |
| score B-sol | threads B-sol | anthropic/claude-opus-5.5 | 1 | 22265 | 0 | 0 | 803 | $0.1051 | 0 | 0 | 0 |
| score B-sol | deception B-sol t* 1 | anthropic/claude-haiku-5.5 | 1 | 2329 | 0 | 0 | 224 | $0.0003 | 0 | 0 | 0 |
| score B-sol | deception B-sol t* 2 | anthropic/claude-haiku-5.5 | 1 | 2329 | 0 | 0 | 105 | $0.0003 | 0 | 0 | 0 |
| score B-sol | rollcheck B-sol t* | anthropic/claude-haiku-5.5 | 11 | 21025 | 0 | 0 | 2039 | $0.0031 | 0 | 0 | 0 |
| score B-sol | note B-sol 1 | anthropic/claude-haiku-5.5 | 1 | 1093 | 0 | 0 | 110 | $0.0002 | 0 | 0 | 0 |
| score B-sol | note B-sol 2 | anthropic/claude-haiku-5.5 | 1 | 1093 | 0 | 0 | 113 | $0.0002 | 0 | 0 | 0 |
| score B-sol | authorship B-sol 1 | anthropic/claude-opus-5.5 | 1 | 30137 | 0 | 0 | 1415 | $0.1488 | 0 | 0 | 0 |
| score B-sol | authorship B-sol 2 | anthropic/claude-opus-5.5 | 1 | 30137 | 0 | 0 | 1379 | $0.1481 | 0 | 0 | 0 |
| score B-sol | note extra B-sol 1 | anthropic/claude-haiku-5.5 | 1 | 1176 | 0 | 0 | 234 | $0.0002 | 0 | 0 | 0 |
| score B-sol | note extra B-sol 2 | anthropic/claude-haiku-5.5 | 1 | 1176 | 0 | 0 | 259 | $0.0002 | 0 | 0 | 0 |
| score B-sol | made B-sol t* 1 | anthropic/claude-haiku-5.5 | 20 | 52536 | 0 | 0 | 1432 | $0.0060 | 0 | 0 | 0 |
| score B-sol | made B-sol t* 2 | anthropic/claude-haiku-5.5 | 20 | 52536 | 0 | 0 | 1509 | $0.0060 | 0 | 0 | 0 |
| score B-sol | lady B-sol t* 1 | anthropic/claude-haiku-5.5 | 5 | 9868 | 0 | 0 | 928 | $0.0015 | 0 | 0 | 0 |
| score B-sol | lady B-sol t* 2 | anthropic/claude-haiku-5.5 | 5 | 9868 | 0 | 0 | 1421 | $0.0017 | 0 | 0 | 0 |
| C-opus | wizard | anthropic/claude-opus-5.5 | 2 | 11900 | 0 | 1567 | 13831 | $0.3321 | 0 | 0 | 0 |
| C-opus | check C-opus opening | anthropic/claude-haiku-5.5 | 1 | 767 | 0 | 0 | 70 | $0.0001 | 0 | 0 | 0 |
| C-opus | player t* | anthropic/claude-opus-5.5 | 12 | 48 | 242431 | 32404 | 9786 | $0.4064 | 0 | 0 | 0 |
| C-opus | check C-opus t* player | anthropic/claude-haiku-5.5 | 12 | 21891 | 0 | 0 | 873 | $0.0026 | 0 | 0 | 0 |
| C-opus | dm t* ooc | anthropic/claude-opus-5.5 | 1 | 8949 | 0 | 16238 | 1342 | $0.1925 | 0 | 0 | 0 |
| C-opus | check C-opus t* dm (out of game) | anthropic/claude-haiku-5.5 | 1 | 1155 | 0 | 0 | 70 | $0.0002 | 0 | 0 | 0 |
| C-opus | dm t* | anthropic/claude-opus-5.5 | 24 | 94 | 667881 | 586681 | 95734 | $5.0835 | 0 | 0 | 0 |
| C-opus | dm t* | anthropic/claude-haiku-5.5 | 13 | 41722 | 0 | 0 | 4948 | $0.0066 | 0 | 0 | 0 |
| C-opus | check C-opus t* dm | anthropic/claude-haiku-5.5 | 10 | 19331 | 0 | 0 | 1035 | $0.0025 | 0 | 0 | 0 |
| C-opus | check C-opus t* dm (told before a card) | anthropic/claude-haiku-5.5 | 4 | 5422 | 0 | 0 | 292 | $0.0007 | 0 | 0 | 0 |
| C-opus | player t* card 1 | anthropic/claude-opus-5.5 | 3 | 12 | 90393 | 2745 | 492 | $0.0417 | 0 | 0 | 0 |
| C-opus | check C-opus t* player (card) | anthropic/claude-haiku-5.5 | 13 | 8748 | 0 | 0 | 815 | $0.0013 | 0 | 0 | 0 |
| C-opus | player t* card 2 | anthropic/claude-opus-5.5 | 3 | 12 | 93138 | 595 | 431 | $0.0303 | 0 | 0 | 0 |
| C-opus | player t* card 3 | anthropic/claude-opus-5.5 | 3 | 12 | 93733 | 464 | 493 | $0.0310 | 0 | 0 | 0 |
| C-opus | player t* card 4 | anthropic/claude-opus-5.5 | 2 | 8 | 62981 | 1686 | 307 | $0.0272 | 0 | 0 | 0 |
| C-opus | dm t* onward | anthropic/claude-opus-5.5 | 6 | 18 | 289616 | 83631 | 14393 | $0.7640 | 0 | 0 | 0 |
| C-opus | dm t* onward | anthropic/claude-haiku-5.5 | 5 | 11048 | 0 | 0 | 1876 | $0.0020 | 0 | 0 | 0 |
| C-opus | player t* card 5 | anthropic/claude-opus-5.5 | 1 | 4 | 37894 | 395 | 60 | $0.0108 | 0 | 0 | 0 |
| C-opus | player t* card 6 | anthropic/claude-opus-5.5 | 1 | 4 | 38289 | 276 | 108 | $0.0112 | 0 | 0 | 0 |
| C-opus | note | anthropic/claude-opus-5.5 | 1 | 4 | 38565 | 119 | 1912 | $0.0466 | 0 | 0 | 0 |
| C-opus | check C-opus note | anthropic/claude-haiku-5.5 | 1 | 1900 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| C-opus | after | anthropic/claude-opus-5.5 | 1 | 4 | 38684 | 1565 | 1351 | $0.0426 | 0 | 0 | 0 |
| C-opus | check C-opus after | anthropic/claude-haiku-5.5 | 1 | 1094 | 0 | 0 | 66 | $0.0001 | 0 | 0 | 0 |
| score C-opus | tag player C-opus t* 1 | anthropic/claude-haiku-5.5 | 12 | 40165 | 0 | 0 | 3645 | $0.0058 | 0 | 0 | 0 |
| score C-opus | tag player C-opus t* 2 | anthropic/claude-haiku-5.5 | 12 | 40165 | 0 | 0 | 4041 | $0.0060 | 0 | 0 | 0 |
| score C-opus | tag player C-opus t* referee | anthropic/claude-opus-5.5 | 1 | 2630 | 0 | 0 | 362 | $0.0178 | 0 | 0 | 0 |
| score C-opus | tag dm C-opus t* 1 | anthropic/claude-haiku-5.5 | 10 | 20600 | 0 | 0 | 3508 | $0.0038 | 0 | 0 | 0 |
| score C-opus | tag dm C-opus t* 2 | anthropic/claude-haiku-5.5 | 10 | 20600 | 0 | 0 | 3672 | $0.0039 | 0 | 0 | 0 |
| score C-opus | threads C-opus | anthropic/claude-opus-5.5 | 1 | 12260 | 0 | 0 | 444 | $0.0579 | 0 | 0 | 0 |
| score C-opus | rollcheck C-opus t* | anthropic/claude-haiku-5.5 | 3 | 6170 | 0 | 0 | 425 | $0.0008 | 0 | 0 | 0 |
| score C-opus | note C-opus 1 | anthropic/claude-haiku-5.5 | 1 | 1814 | 0 | 0 | 116 | $0.0002 | 0 | 0 | 0 |
| score C-opus | note C-opus 2 | anthropic/claude-haiku-5.5 | 1 | 1814 | 0 | 0 | 117 | $0.0002 | 0 | 0 | 0 |
| score C-opus | authorship C-opus 1 | anthropic/claude-opus-5.5 | 1 | 24700 | 0 | 0 | 1274 | $0.1243 | 0 | 0 | 0 |
| score C-opus | authorship C-opus 2 | anthropic/claude-opus-5.5 | 1 | 24700 | 0 | 0 | 1064 | $0.1201 | 0 | 0 | 0 |
| score C-opus | note extra C-opus 1 | anthropic/claude-haiku-5.5 | 1 | 1897 | 0 | 0 | 374 | $0.0004 | 0 | 0 | 0 |
| score C-opus | note extra C-opus 2 | anthropic/claude-haiku-5.5 | 1 | 1897 | 0 | 0 | 412 | $0.0004 | 0 | 0 | 0 |
| score C-opus | made C-opus t* 1 | anthropic/claude-haiku-5.5 | 11 | 34045 | 0 | 0 | 804 | $0.0038 | 0 | 0 | 0 |
| score C-opus | made C-opus t* 2 | anthropic/claude-haiku-5.5 | 11 | 34045 | 0 | 0 | 773 | $0.0038 | 0 | 0 | 0 |
| C-fable | wizard | anthropic/claude-opus-5.5 | 2 | 11805 | 0 | 1567 | 13498 | $0.3250 | 0 | 0 | 0 |
| C-fable | check C-fable opening | anthropic/claude-haiku-5.5 | 1 | 715 | 0 | 0 | 80 | $0.0001 | 0 | 0 | 0 |
| C-fable | player t* | anthropic/claude-fable-5.1 | 20 | 80 | 508405 | 44605 | 9915 | $1.1812 | 0 | 0 | 0 |
| C-fable | check C-fable t* player | anthropic/claude-haiku-5.5 | 20 | 32250 | 0 | 0 | 1406 | $0.0039 | 0 | 0 | 0 |
| C-fable | dm t* | anthropic/claude-opus-5.5 | 49 | 190 | 1590674 | 1230898 | 143883 | $9.4279 | 0 | 0 | 0 |
| C-fable | dm t* | anthropic/claude-haiku-5.5 | 26 | 70560 | 0 | 0 | 11866 | $0.0130 | 0 | 0 | 0 |
| C-fable | check C-fable t* dm | anthropic/claude-haiku-5.5 | 19 | 31713 | 0 | 0 | 1579 | $0.0040 | 0 | 0 | 0 |
| C-fable | dm t* ooc | anthropic/claude-opus-5.5 | 1 | 10444 | 15738 | 1510 | 739 | $0.0718 | 0 | 0 | 0 |
| C-fable | check C-fable t* dm (out of game) | anthropic/claude-haiku-5.5 | 1 | 884 | 0 | 0 | 67 | $0.0001 | 0 | 0 | 0 |
| C-fable | check C-fable t* dm (told before a card) | anthropic/claude-haiku-5.5 | 1 | 1058 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| C-fable | player t* card 1 | anthropic/claude-fable-5.1 | 1 | 4 | 40134 | 833 | 9 | $0.0209 | 0 | 0 | 0 |
| C-fable | check C-fable t* player (card) | anthropic/claude-haiku-5.5 | 2 | 1238 | 0 | 0 | 119 | $0.0002 | 0 | 0 | 0 |
| C-fable | player t* card 2 | anthropic/claude-fable-5.1 | 1 | 4 | 40967 | 112 | 169 | $0.0201 | 0 | 0 | 0 |
| C-fable | dm t* onward | anthropic/claude-opus-5.5 | 3 | 10 | 177981 | 44756 | 6623 | $0.3919 | 0 | 0 | 0 |
| C-fable | dm t* onward | anthropic/claude-haiku-5.5 | 2 | 4458 | 0 | 0 | 485 | $0.0007 | 0 | 0 | 0 |
| C-fable | note | anthropic/claude-fable-5.1 | 1 | 4 | 45550 | 1481 | 1825 | $0.1212 | 0 | 0 | 0 |
| C-fable | check C-fable note | anthropic/claude-haiku-5.5 | 1 | 1343 | 0 | 0 | 80 | $0.0002 | 0 | 0 | 0 |
| C-fable | after | anthropic/claude-fable-5.1 | 1 | 4 | 47031 | 1008 | 552 | $0.0520 | 0 | 0 | 0 |
| C-fable | check C-fable after | anthropic/claude-haiku-5.5 | 1 | 848 | 0 | 0 | 77 | $0.0001 | 0 | 0 | 0 |
| score C-fable | tag player C-fable t* 1 | anthropic/claude-haiku-5.5 | 20 | 60644 | 0 | 0 | 4439 | $0.0083 | 0 | 0 | 0 |
| score C-fable | tag player C-fable t* 2 | anthropic/claude-haiku-5.5 | 20 | 60644 | 0 | 0 | 4933 | $0.0085 | 0 | 0 | 0 |
| score C-fable | tag player C-fable t* referee | anthropic/claude-opus-5.5 | 4 | 14452 | 0 | 0 | 843 | $0.0747 | 0 | 0 | 0 |
| score C-fable | tag dm C-fable t* 1 | anthropic/claude-haiku-5.5 | 19 | 33460 | 0 | 0 | 6184 | $0.0064 | 0 | 0 | 0 |
| score C-fable | tag dm C-fable t* 2 | anthropic/claude-haiku-5.5 | 19 | 33460 | 0 | 0 | 6563 | $0.0066 | 0 | 0 | 0 |
| score C-fable | threads C-fable | anthropic/claude-opus-5.5 | 1 | 20534 | 0 | 0 | 783 | $0.0978 | 0 | 0 | 0 |
| score C-fable | rollcheck C-fable t* | anthropic/claude-haiku-5.5 | 2 | 4089 | 0 | 0 | 383 | $0.0006 | 0 | 0 | 0 |
| score C-fable | note C-fable 1 | anthropic/claude-haiku-5.5 | 1 | 1257 | 0 | 0 | 124 | $0.0002 | 0 | 0 | 0 |
| score C-fable | note C-fable 2 | anthropic/claude-haiku-5.5 | 1 | 1257 | 0 | 0 | 131 | $0.0002 | 0 | 0 | 0 |
| score C-fable | authorship C-fable 1 | anthropic/claude-opus-5.5 | 1 | 30149 | 0 | 0 | 1737 | $0.1553 | 0 | 0 | 0 |
| score C-fable | authorship C-fable 2 | anthropic/claude-opus-5.5 | 1 | 30149 | 0 | 0 | 1476 | $0.1501 | 0 | 0 | 0 |
| score C-fable | note extra C-fable 1 | anthropic/claude-haiku-5.5 | 1 | 1340 | 0 | 0 | 394 | $0.0003 | 0 | 0 | 0 |
| score C-fable | note extra C-fable 2 | anthropic/claude-haiku-5.5 | 1 | 1340 | 0 | 0 | 466 | $0.0004 | 0 | 0 | 0 |
| score C-fable | made C-fable t* 1 | anthropic/claude-haiku-5.5 | 19 | 51323 | 0 | 0 | 1407 | $0.0058 | 0 | 0 | 0 |
| score C-fable | made C-fable t* 2 | anthropic/claude-haiku-5.5 | 19 | 51323 | 0 | 0 | 1385 | $0.0058 | 0 | 0 | 0 |
| C-astra | wizard | anthropic/claude-opus-5.5 | 2 | 11799 | 0 | 1567 | 13705 | $0.3291 | 0 | 0 | 0 |
| C-astra | check C-astra opening | anthropic/claude-haiku-5.5 | 1 | 696 | 0 | 0 | 68 | $0.0001 | 0 | 0 | 0 |
| C-astra | check C-astra t* player | anthropic/claude-haiku-5.5 | 20 | 29640 | 0 | 0 | 1401 | $0.0037 | 0 | 0 | 0 |
| C-astra | dm t* | anthropic/claude-opus-5.5 | 49 | 190 | 1671561 | 1229465 | 137517 | $9.3058 | 0 | 0 | 0 |
| C-astra | dm t* | anthropic/claude-haiku-5.5 | 25 | 70428 | 0 | 0 | 10264 | $0.0122 | 0 | 0 | 0 |
| C-astra | check C-astra t* dm | anthropic/claude-haiku-5.5 | 20 | 30599 | 0 | 0 | 1587 | $0.0039 | 0 | 0 | 0 |
| C-astra | check C-astra t* dm (told before a card) | anthropic/claude-haiku-5.5 | 4 | 2971 | 0 | 0 | 320 | $0.0005 | 0 | 0 | 0 |
| C-astra | check C-astra t* player (card) | anthropic/claude-haiku-5.5 | 10 | 5743 | 0 | 0 | 599 | $0.0009 | 0 | 0 | 0 |
| C-astra | dm t* onward | anthropic/claude-opus-5.5 | 10 | 32 | 452353 | 145965 | 26772 | $1.3559 | 0 | 0 | 0 |
| C-astra | dm t* onward | anthropic/claude-haiku-5.5 | 8 | 17984 | 0 | 0 | 1777 | $0.0027 | 0 | 0 | 0 |
| C-astra | check C-astra note | anthropic/claude-haiku-5.5 | 1 | 1164 | 0 | 0 | 72 | $0.0002 | 0 | 0 | 0 |
| C-astra | check C-astra after | anthropic/claude-haiku-5.5 | 1 | 606 | 0 | 0 | 77 | $0.0001 | 0 | 0 | 0 |
| score C-astra | tag player C-astra t* 1 | anthropic/claude-haiku-5.5 | 20 | 60846 | 0 | 0 | 4108 | $0.0081 | 0 | 0 | 0 |
| score C-astra | tag player C-astra t* 2 | anthropic/claude-haiku-5.5 | 20 | 60846 | 0 | 0 | 3823 | $0.0080 | 0 | 0 | 0 |
| score C-astra | tag player C-astra t* referee | anthropic/claude-opus-5.5 | 2 | 5296 | 0 | 0 | 391 | $0.0290 | 0 | 0 | 0 |
| score C-astra | tag dm C-astra t* 1 | anthropic/claude-haiku-5.5 | 20 | 33048 | 0 | 0 | 7584 | $0.0071 | 0 | 0 | 0 |
| score C-astra | tag dm C-astra t* 2 | anthropic/claude-haiku-5.5 | 20 | 33048 | 0 | 0 | 7387 | $0.0070 | 0 | 0 | 0 |
| score C-astra | tag dm C-astra t* referee | anthropic/claude-opus-5.5 | 1 | 1413 | 0 | 0 | 348 | $0.0126 | 0 | 0 | 0 |
| score C-astra | threads C-astra | anthropic/claude-opus-5.5 | 1 | 22520 | 0 | 0 | 614 | $0.1024 | 0 | 0 | 0 |
| score C-astra | rollcheck C-astra t* | anthropic/claude-haiku-5.5 | 4 | 7073 | 0 | 0 | 676 | $0.0010 | 0 | 0 | 0 |
| score C-astra | note C-astra 1 | anthropic/claude-haiku-5.5 | 1 | 1078 | 0 | 0 | 102 | $0.0002 | 0 | 0 | 0 |
| score C-astra | note C-astra 2 | anthropic/claude-haiku-5.5 | 1 | 1078 | 0 | 0 | 97 | $0.0002 | 0 | 0 | 0 |
| score C-astra | authorship C-astra 1 | anthropic/claude-opus-5.5 | 1 | 31162 | 0 | 0 | 1872 | $0.1621 | 0 | 0 | 0 |
| score C-astra | authorship C-astra 2 | anthropic/claude-opus-5.5 | 1 | 31162 | 0 | 0 | 1477 | $0.1542 | 0 | 0 | 0 |
| score C-astra | goal scale C-astra t* 1 | anthropic/claude-haiku-5.5 | 1 | 401 | 0 | 0 | 214 | $0.0001 | 0 | 0 | 0 |
| score C-astra | goal scale C-astra t* 2 | anthropic/claude-haiku-5.5 | 1 | 401 | 0 | 0 | 251 | $0.0002 | 0 | 0 | 0 |
| score C-astra | note extra C-astra 1 | anthropic/claude-haiku-5.5 | 1 | 1161 | 0 | 0 | 102 | $0.0002 | 0 | 0 | 0 |
| score C-astra | note extra C-astra 2 | anthropic/claude-haiku-5.5 | 1 | 1161 | 0 | 0 | 176 | $0.0002 | 0 | 0 | 0 |
| score C-astra | made C-astra t* 1 | anthropic/claude-haiku-5.5 | 20 | 53366 | 0 | 0 | 1458 | $0.0061 | 0 | 0 | 0 |
| score C-astra | made C-astra t* 2 | anthropic/claude-haiku-5.5 | 20 | 53366 | 0 | 0 | 1501 | $0.0061 | 0 | 0 | 0 |
| C-sol | wizard | anthropic/claude-opus-5.5 | 2 | 11903 | 0 | 1567 | 15366 | $0.3628 | 0 | 0 | 0 |
| C-sol | check C-sol opening | anthropic/claude-haiku-5.5 | 1 | 724 | 0 | 0 | 60 | $0.0001 | 0 | 0 | 0 |
| C-sol | check C-sol t* player | anthropic/claude-haiku-5.5 | 20 | 26328 | 0 | 0 | 1359 | $0.0033 | 0 | 0 | 0 |
| C-sol | dm t* | anthropic/claude-opus-5.5 | 43 | 168 | 1200983 | 1195247 | 138456 | $9.0487 | 0 | 0 | 0 |
| C-sol | dm t* | anthropic/claude-haiku-5.5 | 21 | 56950 | 0 | 0 | 8906 | $0.0101 | 0 | 0 | 0 |
| C-sol | check C-sol t* dm | anthropic/claude-haiku-5.5 | 20 | 27384 | 0 | 0 | 1671 | $0.0036 | 0 | 0 | 0 |
| C-sol | check C-sol t* dm (told before a card) | anthropic/claude-haiku-5.5 | 3 | 2155 | 0 | 0 | 222 | $0.0003 | 0 | 0 | 0 |
| C-sol | check C-sol t* player (card) | anthropic/claude-haiku-5.5 | 6 | 3322 | 0 | 0 | 352 | $0.0005 | 0 | 0 | 0 |
| C-sol | dm t* onward | anthropic/claude-opus-5.5 | 7 | 22 | 268936 | 92899 | 14500 | $0.8084 | 0 | 0 | 0 |
| C-sol | dm t* onward | anthropic/claude-haiku-5.5 | 6 | 11198 | 0 | 0 | 1176 | $0.0017 | 0 | 0 | 0 |
| C-sol | check referee C-sol t* player | anthropic/claude-opus-5.5 | 1 | 1134 | 0 | 0 | 62 | $0.0058 | 0 | 0 | 0 |
| C-sol | check C-sol note | anthropic/claude-haiku-5.5 | 1 | 1097 | 0 | 0 | 66 | $0.0001 | 0 | 0 | 0 |
| C-sol | check C-sol after | anthropic/claude-haiku-5.5 | 1 | 564 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| score C-sol | tag player C-sol t* 1 | anthropic/claude-haiku-5.5 | 20 | 54599 | 0 | 0 | 3234 | $0.0071 | 0 | 0 | 0 |
| score C-sol | tag player C-sol t* 2 | anthropic/claude-haiku-5.5 | 20 | 54599 | 0 | 0 | 3090 | $0.0070 | 0 | 0 | 0 |
| score C-sol | tag player C-sol t* referee | anthropic/claude-opus-5.5 | 3 | 6962 | 0 | 0 | 308 | $0.0340 | 0 | 0 | 0 |
| score C-sol | tag dm C-sol t* 1 | anthropic/claude-haiku-5.5 | 20 | 29554 | 0 | 0 | 6771 | $0.0063 | 0 | 0 | 0 |
| score C-sol | tag dm C-sol t* 2 | anthropic/claude-haiku-5.5 | 20 | 29554 | 0 | 0 | 6716 | $0.0063 | 0 | 0 | 0 |
| score C-sol | threads C-sol | anthropic/claude-opus-5.5 | 1 | 20022 | 0 | 0 | 892 | $0.0979 | 0 | 0 | 0 |
| score C-sol | rollcheck C-sol t* | anthropic/claude-haiku-5.5 | 3 | 4434 | 0 | 0 | 494 | $0.0007 | 0 | 0 | 0 |
| score C-sol | note C-sol 1 | anthropic/claude-haiku-5.5 | 1 | 1011 | 0 | 0 | 102 | $0.0002 | 0 | 0 | 0 |
| score C-sol | note C-sol 2 | anthropic/claude-haiku-5.5 | 1 | 1011 | 0 | 0 | 109 | $0.0002 | 0 | 0 | 0 |
| score C-sol | authorship C-sol 1 | anthropic/claude-opus-5.5 | 1 | 26332 | 0 | 0 | 1378 | $0.1329 | 0 | 0 | 0 |
| score C-sol | authorship C-sol 2 | anthropic/claude-opus-5.5 | 1 | 26332 | 0 | 0 | 1451 | $0.1343 | 0 | 0 | 0 |
| score C-sol | note extra C-sol 1 | anthropic/claude-haiku-5.5 | 1 | 1094 | 0 | 0 | 227 | $0.0002 | 0 | 0 | 0 |
| score C-sol | note extra C-sol 2 | anthropic/claude-haiku-5.5 | 1 | 1094 | 0 | 0 | 194 | $0.0002 | 0 | 0 | 0 |
| score C-sol | made C-sol t* 1 | anthropic/claude-haiku-5.5 | 20 | 47119 | 0 | 0 | 1440 | $0.0054 | 0 | 0 | 0 |
| score C-sol | made C-sol t* 2 | anthropic/claude-haiku-5.5 | 20 | 47119 | 0 | 0 | 1410 | $0.0054 | 0 | 0 | 0 |
| A-deepseek-1 | wizard | anthropic/claude-opus-5.5 | 3 | 22637 | 0 | 1567 | 16779 | $0.4340 | 0 | 0 | 0 |
| A-deepseek-1 | prep | anthropic/claude-opus-5.5 | 1 | 3262 | 0 | 15674 | 12623 | $0.3909 | 0 | 0 | 0 |
| A-deepseek-1 | check A-deepseek-1 opening | anthropic/claude-haiku-5.5 | 1 | 885 | 0 | 0 | 64 | $0.0001 | 0 | 0 | 0 |
| A-deepseek-1 | player t* | deepseek/deepseek-v4-pro-0813 | 3 | 11450 | 19712 | 0 | 3794 | $0.0267 | 0 | 0 | 0 |
| A-deepseek-1 | check A-deepseek-1 t* player | anthropic/claude-haiku-5.5 | 3 | 3695 | 0 | 0 | 193 | $0.0005 | 0 | 0 | 0 |
| A-deepseek-1 | dm t* | anthropic/claude-opus-5.5 | 5 | 20 | 77182 | 130018 | 15083 | $1.0236 | 0 | 0 | 0 |
| A-deepseek-1 | dm t* | anthropic/claude-haiku-5.5 | 2 | 4519 | 0 | 0 | 588 | $0.0007 | 0 | 0 | 0 |
| A-deepseek-1 | check A-deepseek-1 t* dm | anthropic/claude-haiku-5.5 | 2 | 2321 | 0 | 0 | 150 | $0.0003 | 0 | 0 | 0 |
| A-deepseek-1 | check A-deepseek-1 t* dm (told before a card) | anthropic/claude-haiku-5.5 | 1 | 1007 | 0 | 0 | 79 | $0.0001 | 0 | 0 | 0 |
| A-deepseek-1 | player t* card 1 | deepseek/deepseek-v4-pro-0813 | 1 | 801 | 11008 | 0 | 260 | $0.0028 | 0 | 0 | 0 |
| A-deepseek-1 | check A-deepseek-1 t* player (card) | anthropic/claude-haiku-5.5 | 6 | 3932 | 0 | 0 | 367 | $0.0006 | 0 | 0 | 0 |
| A-deepseek-1 | player t* card 2 | deepseek/deepseek-v4-pro-0813 | 1 | 369 | 11520 | 0 | 412 | $0.0027 | 0 | 0 | 0 |
| A-deepseek-1 | player t* card 3 | deepseek/deepseek-v4-pro-0813 | 1 | 357 | 11776 | 0 | 103 | $0.0019 | 0 | 0 | 0 |
| A-deepseek-1 | player t* card 4 | deepseek/deepseek-v4-pro-0813 | 1 | 175 | 12032 | 0 | 185 | $0.0019 | 0 | 0 | 0 |
| A-deepseek-1 | player t* card 5 | deepseek/deepseek-v4-pro-0813 | 1 | 255 | 12032 | 0 | 490 | $0.0028 | 0 | 0 | 0 |
| A-deepseek-1 | player t* card 6 | deepseek/deepseek-v4-pro-0813 | 1 | 631 | 12032 | 0 | 1072 | $0.0048 | 0 | 0 | 0 |
| A-deepseek-1 | note | deepseek/deepseek-v4-pro-0813 | 1 | 578 | 12544 | 0 | 1046 | $0.0047 | 0 | 0 | 0 |
| A-deepseek-1 | check A-deepseek-1 note | anthropic/claude-haiku-5.5 | 1 | 952 | 0 | 0 | 69 | $0.0001 | 0 | 0 | 0 |
| A-deepseek-1 | after | deepseek/deepseek-v4-pro-0813 | 1 | 505 | 13056 | 0 | 554 | $0.0034 | 0 | 0 | 0 |
| A-deepseek-1 | check A-deepseek-1 after | anthropic/claude-haiku-5.5 | 1 | 564 | 0 | 0 | 73 | $0.0001 | 0 | 0 | 0 |
| score A-deepseek-1 | tag player A-deepseek-1 t* 1 | anthropic/claude-haiku-5.5 | 3 | 6227 | 0 | 0 | 1110 | $0.0012 | 0 | 0 | 0 |
| score A-deepseek-1 | tag player A-deepseek-1 t* 2 | anthropic/claude-haiku-5.5 | 3 | 6227 | 0 | 0 | 829 | $0.0010 | 0 | 0 | 0 |
| score A-deepseek-1 | tag player A-deepseek-1 t* referee | anthropic/claude-opus-5.5 | 1 | 2003 | 0 | 0 | 113 | $0.0103 | 0 | 0 | 0 |
| score A-deepseek-1 | tag dm A-deepseek-1 t* 1 | anthropic/claude-haiku-5.5 | 2 | 2463 | 0 | 0 | 511 | $0.0005 | 0 | 0 | 0 |
| score A-deepseek-1 | tag dm A-deepseek-1 t* 2 | anthropic/claude-haiku-5.5 | 2 | 2463 | 0 | 0 | 375 | $0.0004 | 0 | 0 | 0 |
| score A-deepseek-1 | threads A-deepseek-1 | anthropic/claude-opus-5.5 | 1 | 1642 | 0 | 0 | 327 | $0.0131 | 0 | 0 | 0 |
| score A-deepseek-1 | note A-deepseek-1 1 | anthropic/claude-haiku-5.5 | 1 | 866 | 0 | 0 | 206 | $0.0002 | 0 | 0 | 0 |
| score A-deepseek-1 | note A-deepseek-1 2 | anthropic/claude-haiku-5.5 | 1 | 866 | 0 | 0 | 120 | $0.0001 | 0 | 0 | 0 |
| score A-deepseek-1 | authorship A-deepseek-1 1 | anthropic/claude-opus-5.5 | 1 | 4476 | 0 | 0 | 545 | $0.0288 | 0 | 0 | 0 |
| score A-deepseek-1 | authorship A-deepseek-1 2 | anthropic/claude-opus-5.5 | 1 | 4476 | 0 | 0 | 497 | $0.0278 | 0 | 0 | 0 |
| score A-deepseek-1 | note extra A-deepseek-1 1 | anthropic/claude-haiku-5.5 | 1 | 949 | 0 | 0 | 239 | $0.0002 | 0 | 0 | 0 |
| score A-deepseek-1 | note extra A-deepseek-1 2 | anthropic/claude-haiku-5.5 | 1 | 949 | 0 | 0 | 408 | $0.0003 | 0 | 0 | 0 |
| score A-deepseek-1 | made A-deepseek-1 t* 1 | anthropic/claude-haiku-5.5 | 3 | 5105 | 0 | 0 | 216 | $0.0006 | 0 | 0 | 0 |
| score A-deepseek-1 | made A-deepseek-1 t* 2 | anthropic/claude-haiku-5.5 | 3 | 5105 | 0 | 0 | 211 | $0.0006 | 0 | 0 | 0 |
| A-deepseek-2 | wizard | anthropic/claude-opus-5.5 | 2 | 11846 | 0 | 1567 | 12822 | $0.3117 | 0 | 0 | 0 |
| A-deepseek-2 | prep | anthropic/claude-opus-5.5 | 1 | 3368 | 15056 | 484 | 8166 | $0.1837 | 0 | 0 | 0 |
| A-deepseek-2 | check A-deepseek-2 opening | anthropic/claude-haiku-5.5 | 1 | 751 | 0 | 0 | 69 | $0.0001 | 0 | 0 | 0 |
| A-deepseek-2 | player t* | deepseek/deepseek-v4-pro-0813 | 3 | 11558 | 19200 | 0 | 1922 | $0.0219 | 0 | 0 | 0 |
| A-deepseek-2 | check A-deepseek-2 t* player | anthropic/claude-haiku-5.5 | 3 | 3869 | 0 | 0 | 190 | $0.0005 | 0 | 0 | 0 |
| A-deepseek-2 | dm t* | anthropic/claude-opus-5.5 | 6 | 22 | 126229 | 98436 | 16902 | $0.8632 | 0 | 0 | 0 |
| A-deepseek-2 | dm t* | anthropic/claude-haiku-5.5 | 2 | 5169 | 0 | 0 | 735 | $0.0009 | 0 | 0 | 0 |
| A-deepseek-2 | check A-deepseek-2 t* dm | anthropic/claude-haiku-5.5 | 2 | 2683 | 0 | 0 | 173 | $0.0004 | 0 | 0 | 0 |
| A-deepseek-2 | check referee A-deepseek-2 t* dm | anthropic/claude-opus-5.5 | 1 | 1270 | 0 | 0 | 48 | $0.0060 | 0 | 0 | 0 |
| A-deepseek-2 | check A-deepseek-2 t* dm (told before a card) | anthropic/claude-haiku-5.5 | 1 | 1103 | 0 | 0 | 84 | $0.0002 | 0 | 0 | 0 |
| A-deepseek-2 | player t* card 1 | deepseek/deepseek-v4-pro-0813 | 1 | 780 | 11008 | 0 | 385 | $0.0031 | 0 | 0 | 0 |
| A-deepseek-2 | check A-deepseek-2 t* player (card) | anthropic/claude-haiku-5.5 | 3 | 2497 | 0 | 0 | 197 | $0.0003 | 0 | 0 | 0 |
| A-deepseek-2 | player t* card 2 | deepseek/deepseek-v4-pro-0813 | 1 | 523 | 11520 | 0 | 702 | $0.0037 | 0 | 0 | 0 |
| A-deepseek-2 | player t* card 3 | deepseek/deepseek-v4-pro-0813 | 1 | 678 | 11776 | 0 | 662 | $0.0038 | 0 | 0 | 0 |
| A-deepseek-2 | note | deepseek/deepseek-v4-pro-0813 | 1 | 323 | 12288 | 0 | 1128 | $0.0046 | 0 | 0 | 0 |
| A-deepseek-2 | check A-deepseek-2 note | anthropic/claude-haiku-5.5 | 1 | 1161 | 0 | 0 | 67 | $0.0001 | 0 | 0 | 0 |
| A-deepseek-2 | after | deepseek/deepseek-v4-pro-0813 | 1 | 644 | 12544 | 0 | 375 | $0.0031 | 0 | 0 | 0 |
| A-deepseek-2 | check A-deepseek-2 after | anthropic/claude-haiku-5.5 | 1 | 590 | 0 | 0 | 74 | $0.0001 | 0 | 0 | 0 |
| score A-deepseek-2 | tag player A-deepseek-2 t* 1 | anthropic/claude-haiku-5.5 | 3 | 6748 | 0 | 0 | 659 | $0.0010 | 0 | 0 | 0 |
| score A-deepseek-2 | tag player A-deepseek-2 t* 2 | anthropic/claude-haiku-5.5 | 3 | 6748 | 0 | 0 | 1084 | $0.0012 | 0 | 0 | 0 |
| score A-deepseek-2 | tag player A-deepseek-2 t* referee | anthropic/claude-opus-5.5 | 2 | 4107 | 0 | 0 | 564 | $0.0277 | 0 | 0 | 0 |
| score A-deepseek-2 | tag dm A-deepseek-2 t* 1 | anthropic/claude-haiku-5.5 | 2 | 2825 | 0 | 0 | 666 | $0.0006 | 0 | 0 | 0 |
| score A-deepseek-2 | tag dm A-deepseek-2 t* 2 | anthropic/claude-haiku-5.5 | 2 | 2825 | 0 | 0 | 645 | $0.0006 | 0 | 0 | 0 |
| score A-deepseek-2 | threads A-deepseek-2 | anthropic/claude-opus-5.5 | 1 | 1989 | 0 | 0 | 389 | $0.0157 | 0 | 0 | 0 |
| score A-deepseek-2 | note A-deepseek-2 1 | anthropic/claude-haiku-5.5 | 1 | 1075 | 0 | 0 | 302 | $0.0003 | 0 | 0 | 0 |
| score A-deepseek-2 | note A-deepseek-2 2 | anthropic/claude-haiku-5.5 | 1 | 1075 | 0 | 0 | 264 | $0.0002 | 0 | 0 | 0 |
| score A-deepseek-2 | authorship A-deepseek-2 1 | anthropic/claude-opus-5.5 | 1 | 4464 | 0 | 0 | 746 | $0.0328 | 0 | 0 | 0 |
| score A-deepseek-2 | authorship A-deepseek-2 2 | anthropic/claude-opus-5.5 | 1 | 4464 | 0 | 0 | 767 | $0.0332 | 0 | 0 | 0 |
| score A-deepseek-2 | note extra A-deepseek-2 1 | anthropic/claude-haiku-5.5 | 1 | 1158 | 0 | 0 | 213 | $0.0002 | 0 | 0 | 0 |
| score A-deepseek-2 | note extra A-deepseek-2 2 | anthropic/claude-haiku-5.5 | 1 | 1158 | 0 | 0 | 223 | $0.0002 | 0 | 0 | 0 |
| score A-deepseek-2 | made A-deepseek-2 t* 1 | anthropic/claude-haiku-5.5 | 3 | 5626 | 0 | 0 | 210 | $0.0007 | 0 | 0 | 0 |
| score A-deepseek-2 | made A-deepseek-2 t* 2 | anthropic/claude-haiku-5.5 | 3 | 5626 | 0 | 0 | 198 | $0.0007 | 0 | 0 | 0 |
| B-deepseek-1 | wizard | anthropic/claude-opus-5.5 | 2 | 11781 | 0 | 1567 | 13926 | $0.3335 | 0 | 0 | 0 |
| B-deepseek-1 | prep | anthropic/claude-opus-5.5 | 1 | 2829 | 15056 | 578 | 7578 | $0.1705 | 0 | 0 | 0 |
| B-deepseek-1 | check B-deepseek-1 opening | anthropic/claude-haiku-5.5 | 1 | 845 | 0 | 0 | 77 | $0.0001 | 0 | 0 | 0 |
| B-deepseek-1 | player t* | deepseek/deepseek-v4-pro-0813 | 11 | 22030 | 132608 | 0 | 13358 | $0.0766 | 0 | 0 | 2 |
| B-deepseek-1 | check B-deepseek-1 t* player | anthropic/claude-haiku-5.5 | 11 | 19646 | 0 | 0 | 871 | $0.0024 | 0 | 0 | 0 |
| B-deepseek-1 | dm t* | anthropic/claude-opus-5.5 | 23 | 92 | 574475 | 589524 | 78556 | $4.6787 | 0 | 0 | 0 |
| B-deepseek-1 | dm t* | anthropic/claude-haiku-5.5 | 13 | 33579 | 0 | 0 | 5023 | $0.0059 | 0 | 0 | 0 |
| B-deepseek-1 | check B-deepseek-1 t* dm | anthropic/claude-haiku-5.5 | 10 | 17431 | 0 | 0 | 794 | $0.0021 | 0 | 0 | 0 |
| B-deepseek-1 | check B-deepseek-1 t* dm (told before a card) | anthropic/claude-haiku-5.5 | 1 | 1890 | 0 | 0 | 66 | $0.0002 | 0 | 0 | 0 |
| B-deepseek-1 | player t* card 1 | deepseek/deepseek-v4-pro-0813 | 1 | 1481 | 19968 | 0 | 391 | $0.0049 | 0 | 0 | 0 |
| B-deepseek-1 | check B-deepseek-1 t* player (card) | anthropic/claude-haiku-5.5 | 3 | 3255 | 0 | 0 | 218 | $0.0004 | 0 | 0 | 0 |
| B-deepseek-1 | player t* card 2 | deepseek/deepseek-v4-pro-0813 | 1 | 436 | 21248 | 0 | 945 | $0.0051 | 0 | 0 | 0 |
| B-deepseek-1 | player t* card 3 | deepseek/deepseek-v4-pro-0813 | 1 | 934 | 21504 | 0 | 638 | $0.0050 | 0 | 0 | 1 |
| B-deepseek-1 | note | deepseek/deepseek-v4-pro-0813 | 1 | 661 | 22272 | 0 | 1927 | $0.0081 | 0 | 0 | 0 |
| B-deepseek-1 | check B-deepseek-1 note | anthropic/claude-haiku-5.5 | 1 | 2700 | 0 | 0 | 69 | $0.0003 | 0 | 0 | 0 |
| B-deepseek-1 | after | deepseek/deepseek-v4-pro-0813 | 1 | 1845 | 22784 | 0 | 1819 | $0.0094 | 0 | 0 | 0 |
| B-deepseek-1 | check B-deepseek-1 after | anthropic/claude-haiku-5.5 | 1 | 1374 | 0 | 0 | 73 | $0.0002 | 0 | 0 | 0 |
| score B-deepseek-1 | tag player B-deepseek-1 t* 1 | anthropic/claude-haiku-5.5 | 11 | 32412 | 0 | 0 | 1784 | $0.0041 | 0 | 0 | 0 |
| score B-deepseek-1 | tag player B-deepseek-1 t* 2 | anthropic/claude-haiku-5.5 | 11 | 32412 | 0 | 0 | 2103 | $0.0043 | 0 | 0 | 0 |
| score B-deepseek-1 | tag player B-deepseek-1 t* referee | anthropic/claude-opus-5.5 | 2 | 5985 | 0 | 0 | 299 | $0.0299 | 0 | 0 | 0 |
| score B-deepseek-1 | tag dm B-deepseek-1 t* 1 | anthropic/claude-haiku-5.5 | 10 | 18141 | 0 | 0 | 2972 | $0.0033 | 0 | 0 | 0 |
| score B-deepseek-1 | tag dm B-deepseek-1 t* 2 | anthropic/claude-haiku-5.5 | 10 | 18141 | 0 | 0 | 3078 | $0.0034 | 0 | 0 | 0 |
| score B-deepseek-1 | threads B-deepseek-1 | anthropic/claude-opus-5.5 | 1 | 8756 | 0 | 0 | 783 | $0.0507 | 0 | 0 | 0 |
| score B-deepseek-1 | note B-deepseek-1 1 | anthropic/claude-haiku-5.5 | 1 | 2614 | 0 | 0 | 197 | $0.0004 | 0 | 0 | 0 |
| score B-deepseek-1 | note B-deepseek-1 2 | anthropic/claude-haiku-5.5 | 1 | 2614 | 0 | 0 | 165 | $0.0003 | 0 | 0 | 0 |
| score B-deepseek-1 | authorship B-deepseek-1 1 | anthropic/claude-opus-5.5 | 1 | 18547 | 0 | 0 | 1053 | $0.0952 | 0 | 0 | 0 |
| score B-deepseek-1 | authorship B-deepseek-1 2 | anthropic/claude-opus-5.5 | 1 | 18547 | 0 | 0 | 924 | $0.0927 | 0 | 0 | 0 |
| score B-deepseek-1 | note extra B-deepseek-1 1 | anthropic/claude-haiku-5.5 | 1 | 2697 | 0 | 0 | 98 | $0.0003 | 0 | 0 | 0 |
| score B-deepseek-1 | note extra B-deepseek-1 2 | anthropic/claude-haiku-5.5 | 1 | 2697 | 0 | 0 | 97 | $0.0003 | 0 | 0 | 0 |
| score B-deepseek-1 | made B-deepseek-1 t* 1 | anthropic/claude-haiku-5.5 | 11 | 28298 | 0 | 0 | 740 | $0.0032 | 0 | 0 | 0 |
| score B-deepseek-1 | made B-deepseek-1 t* 2 | anthropic/claude-haiku-5.5 | 11 | 28298 | 0 | 0 | 785 | $0.0032 | 0 | 0 | 0 |
| score B-deepseek-1 | lady B-deepseek-1 t* 1 | anthropic/claude-haiku-5.5 | 5 | 10498 | 0 | 0 | 706 | $0.0014 | 0 | 0 | 0 |
| score B-deepseek-1 | lady B-deepseek-1 t* 2 | anthropic/claude-haiku-5.5 | 5 | 10498 | 0 | 0 | 602 | $0.0014 | 0 | 0 | 0 |
| B-deepseek-2 | wizard | anthropic/claude-opus-5.5 | 2 | 11608 | 0 | 1567 | 13026 | $0.3148 | 0 | 0 | 0 |
| B-deepseek-2 | prep | anthropic/claude-opus-5.5 | 1 | 2671 | 15056 | 477 | 5849 | $0.1345 | 0 | 0 | 0 |
| B-deepseek-2 | check B-deepseek-2 opening | anthropic/claude-haiku-5.5 | 1 | 744 | 0 | 0 | 55 | $0.0001 | 0 | 0 | 0 |
| B-deepseek-2 | player t* | deepseek/deepseek-v4-pro-0813 | 12 | 38996 | 131584 | 0 | 8583 | $0.0862 | 0 | 0 | 0 |
| B-deepseek-2 | check B-deepseek-2 t* player | anthropic/claude-haiku-5.5 | 12 | 19203 | 0 | 0 | 845 | $0.0023 | 0 | 0 | 0 |
| B-deepseek-2 | dm t* | anthropic/claude-opus-5.5 | 29 | 116 | 787954 | 703598 | 83668 | $5.3945 | 0 | 0 | 0 |
| B-deepseek-2 | dm t* | anthropic/claude-haiku-5.5 | 17 | 44076 | 0 | 0 | 7606 | $0.0082 | 0 | 0 | 0 |
| B-deepseek-2 | check B-deepseek-2 t* dm | anthropic/claude-haiku-5.5 | 11 | 17985 | 0 | 0 | 856 | $0.0022 | 0 | 0 | 0 |
| B-deepseek-2 | check B-deepseek-2 t* dm (told before a card) | anthropic/claude-haiku-5.5 | 1 | 967 | 0 | 0 | 59 | $0.0001 | 0 | 0 | 0 |
| B-deepseek-2 | player t* card 1 | deepseek/deepseek-v4-pro-0813 | 1 | 807 | 20992 | 0 | 401 | $0.0042 | 0 | 0 | 0 |
| B-deepseek-2 | check B-deepseek-2 t* player (card) | anthropic/claude-haiku-5.5 | 3 | 1861 | 0 | 0 | 216 | $0.0003 | 0 | 0 | 0 |
| B-deepseek-2 | player t* card 2 | deepseek/deepseek-v4-pro-0813 | 1 | 594 | 21504 | 0 | 136 | $0.0033 | 0 | 0 | 0 |
| B-deepseek-2 | player t* card 3 | deepseek/deepseek-v4-pro-0813 | 1 | 225 | 22016 | 0 | 118 | $0.0028 | 0 | 0 | 0 |
| B-deepseek-2 | note | deepseek/deepseek-v4-pro-0813 | 1 | 286 | 22016 | 0 | 742 | $0.0045 | 0 | 0 | 0 |
| B-deepseek-2 | check B-deepseek-2 note | anthropic/claude-haiku-5.5 | 1 | 845 | 0 | 0 | 69 | $0.0001 | 0 | 0 | 0 |
| B-deepseek-2 | after | deepseek/deepseek-v4-pro-0813 | 1 | 635 | 22016 | 0 | 1000 | $0.0056 | 0 | 0 | 0 |
| B-deepseek-2 | check B-deepseek-2 after | anthropic/claude-haiku-5.5 | 1 | 564 | 0 | 0 | 67 | $0.0001 | 0 | 0 | 0 |
| score B-deepseek-2 | tag player B-deepseek-2 t* 1 | anthropic/claude-haiku-5.5 | 12 | 33057 | 0 | 0 | 2429 | $0.0045 | 0 | 0 | 0 |
| score B-deepseek-2 | tag player B-deepseek-2 t* 2 | anthropic/claude-haiku-5.5 | 12 | 33057 | 0 | 0 | 2323 | $0.0045 | 0 | 0 | 0 |
| score B-deepseek-2 | tag player B-deepseek-2 t* referee | anthropic/claude-opus-5.5 | 1 | 3039 | 0 | 0 | 102 | $0.0142 | 0 | 0 | 0 |
| score B-deepseek-2 | tag dm B-deepseek-2 t* 1 | anthropic/claude-haiku-5.5 | 11 | 18766 | 0 | 0 | 3377 | $0.0036 | 0 | 0 | 0 |
| score B-deepseek-2 | tag dm B-deepseek-2 t* 2 | anthropic/claude-haiku-5.5 | 11 | 18766 | 0 | 0 | 3485 | $0.0036 | 0 | 0 | 0 |
| score B-deepseek-2 | threads B-deepseek-2 | anthropic/claude-opus-5.5 | 1 | 9454 | 0 | 0 | 614 | $0.0501 | 0 | 0 | 0 |
| score B-deepseek-2 | note B-deepseek-2 1 | anthropic/claude-haiku-5.5 | 1 | 759 | 0 | 0 | 170 | $0.0002 | 0 | 0 | 0 |
| score B-deepseek-2 | note B-deepseek-2 2 | anthropic/claude-haiku-5.5 | 1 | 759 | 0 | 0 | 177 | $0.0002 | 0 | 0 | 0 |
| score B-deepseek-2 | authorship B-deepseek-2 1 | anthropic/claude-opus-5.5 | 1 | 18292 | 0 | 0 | 938 | $0.0919 | 0 | 0 | 0 |
| score B-deepseek-2 | authorship B-deepseek-2 2 | anthropic/claude-opus-5.5 | 1 | 18292 | 0 | 0 | 1039 | $0.0939 | 0 | 0 | 0 |
| score B-deepseek-2 | goal scale B-deepseek-2 t* 1 | anthropic/claude-haiku-5.5 | 1 | 454 | 0 | 0 | 68 | $0.0001 | 0 | 0 | 0 |
| score B-deepseek-2 | goal scale B-deepseek-2 t* 2 | anthropic/claude-haiku-5.5 | 1 | 454 | 0 | 0 | 60 | $0.0001 | 0 | 0 | 0 |
| score B-deepseek-2 | note extra B-deepseek-2 1 | anthropic/claude-haiku-5.5 | 1 | 842 | 0 | 0 | 387 | $0.0003 | 0 | 0 | 0 |
| score B-deepseek-2 | note extra B-deepseek-2 2 | anthropic/claude-haiku-5.5 | 1 | 842 | 0 | 0 | 368 | $0.0003 | 0 | 0 | 0 |
| score B-deepseek-2 | made B-deepseek-2 t* 1 | anthropic/claude-haiku-5.5 | 12 | 28569 | 0 | 0 | 862 | $0.0033 | 0 | 0 | 0 |
| score B-deepseek-2 | made B-deepseek-2 t* 2 | anthropic/claude-haiku-5.5 | 12 | 28569 | 0 | 0 | 840 | $0.0033 | 0 | 0 | 0 |
| score B-deepseek-2 | lady B-deepseek-2 t* 1 | anthropic/claude-haiku-5.5 | 5 | 9297 | 0 | 0 | 609 | $0.0012 | 0 | 0 | 0 |
| score B-deepseek-2 | lady B-deepseek-2 t* 2 | anthropic/claude-haiku-5.5 | 5 | 9297 | 0 | 0 | 556 | $0.0012 | 0 | 0 | 0 |
| C-deepseek-1 | wizard | anthropic/claude-opus-5.5 | 2 | 11884 | 0 | 1567 | 13565 | $0.3267 | 0 | 0 | 0 |
| C-deepseek-1 | check C-deepseek-1 opening | anthropic/claude-haiku-5.5 | 1 | 678 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| C-deepseek-1 | player t* | deepseek/deepseek-v4-pro-0813 | 1 | 9059 | 0 | 0 | 364 | $0.0127 | 0 | 0 | 0 |
| C-deepseek-1 | check C-deepseek-1 t* player | anthropic/claude-haiku-5.5 | 1 | 894 | 0 | 0 | 78 | $0.0001 | 0 | 0 | 0 |
| C-deepseek-1 | dm t* | anthropic/claude-opus-5.5 | 1 | 4 | 0 | 31584 | 1902 | $0.2468 | 0 | 0 | 0 |
| C-deepseek-1 | check C-deepseek-1 t* dm (told before a card) | anthropic/claude-haiku-5.5 | 1 | 629 | 0 | 0 | 81 | $0.0001 | 0 | 0 | 0 |
| C-deepseek-1 | player t* card 1 | deepseek/deepseek-v4-pro-0813 | 1 | 407 | 8960 | 0 | 508 | $0.0027 | 0 | 0 | 0 |
| C-deepseek-1 | check C-deepseek-1 t* player (card) | anthropic/claude-haiku-5.5 | 4 | 2360 | 0 | 0 | 254 | $0.0004 | 0 | 0 | 0 |
| C-deepseek-1 | player t* card 2 | deepseek/deepseek-v4-pro-0813 | 1 | 441 | 9216 | 0 | 145 | $0.0019 | 0 | 0 | 0 |
| C-deepseek-1 | player t* card 3 | deepseek/deepseek-v4-pro-0813 | 1 | 270 | 9472 | 0 | 367 | $0.0023 | 0 | 0 | 0 |
| C-deepseek-1 | player t* card 4 | deepseek/deepseek-v4-pro-0813 | 1 | 366 | 9472 | 0 | 641 | $0.0031 | 0 | 0 | 0 |
| C-deepseek-1 | note | deepseek/deepseek-v4-pro-0813 | 1 | 357 | 9728 | 0 | 865 | $0.0037 | 0 | 0 | 0 |
| C-deepseek-1 | check C-deepseek-1 note | anthropic/claude-haiku-5.5 | 1 | 723 | 0 | 0 | 76 | $0.0001 | 0 | 0 | 0 |
| C-deepseek-1 | after | deepseek/deepseek-v4-pro-0813 | 1 | 386 | 9984 | 0 | 297 | $0.0023 | 0 | 0 | 0 |
| C-deepseek-1 | check C-deepseek-1 after | anthropic/claude-haiku-5.5 | 1 | 478 | 0 | 0 | 65 | $0.0001 | 0 | 0 | 0 |
| score C-deepseek-1 | tag player C-deepseek-1 t* 1 | anthropic/claude-haiku-5.5 | 1 | 1305 | 0 | 0 | 713 | $0.0005 | 0 | 0 | 0 |
| score C-deepseek-1 | tag player C-deepseek-1 t* 2 | anthropic/claude-haiku-5.5 | 1 | 1305 | 0 | 0 | 780 | $0.0005 | 0 | 0 | 0 |
| score C-deepseek-1 | note C-deepseek-1 1 | anthropic/claude-haiku-5.5 | 1 | 637 | 0 | 0 | 96 | $0.0001 | 0 | 0 | 0 |
| score C-deepseek-1 | note C-deepseek-1 2 | anthropic/claude-haiku-5.5 | 1 | 637 | 0 | 0 | 102 | $0.0001 | 0 | 0 | 0 |
| score C-deepseek-1 | authorship C-deepseek-1 1 | anthropic/claude-opus-5.5 | 1 | 1660 | 0 | 0 | 325 | $0.0131 | 0 | 0 | 0 |
| score C-deepseek-1 | authorship C-deepseek-1 2 | anthropic/claude-opus-5.5 | 1 | 1660 | 0 | 0 | 357 | $0.0138 | 0 | 0 | 0 |
| score C-deepseek-1 | goal scale C-deepseek-1 t* 1 | anthropic/claude-haiku-5.5 | 1 | 515 | 0 | 0 | 83 | $0.0001 | 0 | 0 | 0 |
| score C-deepseek-1 | goal scale C-deepseek-1 t* 2 | anthropic/claude-haiku-5.5 | 1 | 515 | 0 | 0 | 118 | $0.0001 | 0 | 0 | 0 |
| score C-deepseek-1 | note extra C-deepseek-1 1 | anthropic/claude-haiku-5.5 | 1 | 720 | 0 | 0 | 458 | $0.0003 | 0 | 0 | 0 |
| score C-deepseek-1 | note extra C-deepseek-1 2 | anthropic/claude-haiku-5.5 | 1 | 720 | 0 | 0 | 382 | $0.0003 | 0 | 0 | 0 |
| score C-deepseek-1 | note extra C-deepseek-1 referee | anthropic/claude-opus-5.5 | 1 | 720 | 0 | 0 | 200 | $0.0069 | 0 | 0 | 0 |
| score C-deepseek-1 | made C-deepseek-1 t* 1 | anthropic/claude-haiku-5.5 | 1 | 931 | 0 | 0 | 78 | $0.0001 | 0 | 0 | 0 |
| score C-deepseek-1 | made C-deepseek-1 t* 2 | anthropic/claude-haiku-5.5 | 1 | 931 | 0 | 0 | 76 | $0.0001 | 0 | 0 | 0 |
