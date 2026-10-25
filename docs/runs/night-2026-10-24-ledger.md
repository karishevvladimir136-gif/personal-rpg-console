# Night 1 (2026-10-24) — the paid-call ledger

Cap $10. Spent **$0.5765** in 120 calls over 1 run(s).
- 2026-10-24 09:15 UTC: night 1: 60 replies, effort medium — 120 calls, $0.5765 → `night-2026-10-24-run-20261024-091553.json`

Prices per 1M tokens: Opus 5.5 input $4 / output $20; Sonnet 5.5 $2 / $10; Haiku 5.5 $0.10 / $0.50. Fable 5.1 input $10 / output $50. Output tokens include thinking. Check: claude-haiku-5-5, referee claude-opus-5-5.

| Model — purpose | Calls | Input tokens | Output tokens | Cost |
| --- | --- | --- | --- | --- |
| claude-sonnet-5-5 — subject | 20 | 1520 | 5432 | $0.0574 |
| claude-haiku-5-5 — check | 60 | 33940 | 4356 | $0.0056 |
| claude-fable-5-1 — subject | 20 | 1520 | 6941 | $0.3623 |
| claude-opus-5-5 — subject | 20 | 1520 | 7260 | $0.1513 |

## Every call

| Run | # | Purpose | Model | Input | Output | Cost | Seconds | Error |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-24 09:15 | 1 | subject sonnet/bare/0 | claude-sonnet-5-5 | 62 | 294 | $0.00306 | 4.4 |  |
| 2026-10-24 09:15 | 2 | check sonnet/bare/0 | claude-haiku-5-5 | 573 | 71 | $0.00009 | 0.9 |  |
| 2026-10-24 09:15 | 3 | subject fable/bare/7 | claude-fable-5-1 | 62 | 269 | $0.01407 | 5.7 |  |
| 2026-10-24 09:15 | 4 | check fable/bare/7 | claude-haiku-5-5 | 511 | 76 | $0.00009 | 1.9 |  |
| 2026-10-24 09:15 | 5 | subject sonnet/bare/7 | claude-sonnet-5-5 | 62 | 336 | $0.00348 | 4.5 |  |
| 2026-10-24 09:15 | 6 | check sonnet/bare/7 | claude-haiku-5-5 | 615 | 57 | $0.00009 | 0.7 |  |
| 2026-10-24 09:15 | 7 | subject fable/night/0 | claude-fable-5-1 | 90 | 398 | $0.02080 | 8.7 |  |
| 2026-10-24 09:15 | 8 | check fable/night/0 | claude-haiku-5-5 | 590 | 75 | $0.00010 | 1 |  |
| 2026-10-24 09:15 | 9 | subject opus/night/1 | claude-opus-5-5 | 90 | 419 | $0.00874 | 7.1 |  |
| 2026-10-24 09:15 | 10 | check opus/night/1 | claude-haiku-5-5 | 621 | 68 | $0.00010 | 0.8 |  |
| 2026-10-24 09:15 | 11 | subject sonnet/night/6 | claude-sonnet-5-5 | 90 | 326 | $0.00344 | 4.3 |  |
| 2026-10-24 09:15 | 12 | check sonnet/night/6 | claude-haiku-5-5 | 605 | 74 | $0.00010 | 0.9 |  |
| 2026-10-24 09:15 | 13 | subject opus/bare/2 | claude-opus-5-5 | 62 | 381 | $0.00787 | 5.6 |  |
| 2026-10-24 09:15 | 14 | check opus/bare/2 | claude-haiku-5-5 | 626 | 79 | $0.00010 | 0.9 |  |
| 2026-10-24 09:15 | 15 | subject opus/bare/1 | claude-opus-5-5 | 62 | 358 | $0.00741 | 6.7 |  |
| 2026-10-24 09:15 | 16 | check opus/bare/1 | claude-haiku-5-5 | 602 | 64 | $0.00009 | 1.2 |  |
| 2026-10-24 09:15 | 17 | subject opus/night/6 | claude-opus-5-5 | 90 | 332 | $0.00700 | 5.5 |  |
| 2026-10-24 09:15 | 18 | check opus/night/6 | claude-haiku-5-5 | 566 | 68 | $0.00009 | 0.8 |  |
| 2026-10-24 09:15 | 19 | subject sonnet/bare/1 | claude-sonnet-5-5 | 62 | 300 | $0.00312 | 3.9 |  |
| 2026-10-24 09:15 | 20 | check sonnet/bare/1 | claude-haiku-5-5 | 579 | 68 | $0.00009 | 1.9 |  |
| 2026-10-24 09:15 | 21 | subject fable/bare/9 | claude-fable-5-1 | 62 | 364 | $0.01882 | 7.6 |  |
| 2026-10-24 09:15 | 22 | check fable/bare/9 | claude-haiku-5-5 | 566 | 68 | $0.00009 | 0.7 |  |
| 2026-10-24 09:15 | 23 | subject opus/bare/8 | claude-opus-5-5 | 62 | 376 | $0.00777 | 6.6 |  |
| 2026-10-24 09:15 | 24 | check opus/bare/8 | claude-haiku-5-5 | 626 | 76 | $0.00010 | 0.9 |  |
| 2026-10-24 09:15 | 25 | subject sonnet/bare/5 | claude-sonnet-5-5 | 62 | 256 | $0.00268 | 3.8 |  |
| 2026-10-24 09:15 | 26 | check sonnet/bare/5 | claude-haiku-5-5 | 535 | 67 | $0.00009 | 1.3 |  |
| 2026-10-24 09:15 | 27 | subject sonnet/night/7 | claude-sonnet-5-5 | 90 | 183 | $0.00201 | 2.7 |  |
| 2026-10-24 09:15 | 28 | check sonnet/night/7 | claude-haiku-5-5 | 462 | 77 | $0.00008 | 0.8 |  |
| 2026-10-24 09:15 | 29 | subject opus/bare/3 | claude-opus-5-5 | 62 | 397 | $0.00819 | 5.8 |  |
| 2026-10-24 09:15 | 30 | check opus/bare/3 | claude-haiku-5-5 | 638 | 90 | $0.00011 | 0.9 |  |
| 2026-10-24 09:15 | 31 | subject fable/night/1 | claude-fable-5-1 | 90 | 375 | $0.01965 | 7.6 |  |
| 2026-10-24 09:15 | 32 | check fable/night/1 | claude-haiku-5-5 | 576 | 70 | $0.00009 | 0.7 |  |
| 2026-10-24 09:15 | 33 | subject sonnet/night/1 | claude-sonnet-5-5 | 90 | 279 | $0.00297 | 3.9 |  |
| 2026-10-24 09:15 | 34 | check sonnet/night/1 | claude-haiku-5-5 | 558 | 74 | $0.00009 | 0.9 |  |
| 2026-10-24 09:15 | 35 | subject fable/bare/0 | claude-fable-5-1 | 62 | 284 | $0.01482 | 6.3 |  |
| 2026-10-24 09:15 | 36 | check fable/bare/0 | claude-haiku-5-5 | 495 | 89 | $0.00009 | 0.9 |  |
| 2026-10-24 09:15 | 37 | subject fable/bare/4 | claude-fable-5-1 | 62 | 291 | $0.01517 | 7 |  |
| 2026-10-24 09:15 | 38 | check fable/bare/4 | claude-haiku-5-5 | 519 | 57 | $0.00008 | 0.8 |  |
| 2026-10-24 09:15 | 39 | subject sonnet/bare/8 | claude-sonnet-5-5 | 62 | 302 | $0.00314 | 3.9 |  |
| 2026-10-24 09:15 | 40 | check sonnet/bare/8 | claude-haiku-5-5 | 581 | 64 | $0.00009 | 1.5 |  |
| 2026-10-24 09:15 | 41 | subject opus/night/2 | claude-opus-5-5 | 90 | 322 | $0.00680 | 5.4 |  |
| 2026-10-24 09:15 | 42 | check opus/night/2 | claude-haiku-5-5 | 526 | 71 | $0.00009 | 0.7 |  |
| 2026-10-24 09:15 | 43 | subject fable/night/9 | claude-fable-5-1 | 90 | 375 | $0.01965 | 9.1 |  |
| 2026-10-24 09:15 | 44 | check fable/night/9 | claude-haiku-5-5 | 603 | 66 | $0.00009 | 1 |  |
| 2026-10-24 09:15 | 45 | subject opus/bare/9 | claude-opus-5-5 | 62 | 425 | $0.00875 | 6.7 |  |
| 2026-10-24 09:15 | 46 | check opus/bare/9 | claude-haiku-5-5 | 673 | 73 | $0.00010 | 1.4 |  |
| 2026-10-24 09:15 | 47 | subject fable/bare/6 | claude-fable-5-1 | 62 | 445 | $0.02287 | 10 |  |
| 2026-10-24 09:15 | 48 | check fable/bare/6 | claude-haiku-5-5 | 653 | 75 | $0.00010 | 0.9 |  |
| 2026-10-24 09:15 | 49 | subject opus/night/4 | claude-opus-5-5 | 90 | 557 | $0.01150 | 8.9 |  |
| 2026-10-24 09:15 | 50 | check opus/night/4 | claude-haiku-5-5 | 787 | 81 | $0.00012 | 0.9 |  |
| 2026-10-24 09:15 | 51 | subject opus/bare/0 | claude-opus-5-5 | 62 | 373 | $0.00771 | 5.6 |  |
| 2026-10-24 09:15 | 52 | check opus/bare/0 | claude-haiku-5-5 | 618 | 84 | $0.00010 | 0.9 |  |
| 2026-10-24 09:15 | 53 | subject fable/night/6 | claude-fable-5-1 | 90 | 390 | $0.02040 | 9 |  |
| 2026-10-24 09:15 | 54 | check fable/night/6 | claude-haiku-5-5 | 595 | 75 | $0.00010 | 0.9 |  |
| 2026-10-24 09:15 | 55 | subject fable/bare/8 | claude-fable-5-1 | 62 | 255 | $0.01337 | 5.5 |  |
| 2026-10-24 09:15 | 56 | check fable/bare/8 | claude-haiku-5-5 | 477 | 72 | $0.00008 | 0.8 |  |
| 2026-10-24 09:15 | 57 | subject fable/bare/2 | claude-fable-5-1 | 62 | 308 | $0.01602 | 6.6 |  |
| 2026-10-24 09:15 | 58 | check fable/bare/2 | claude-haiku-5-5 | 522 | 72 | $0.00009 | 2.2 |  |
| 2026-10-24 09:15 | 59 | subject opus/bare/7 | claude-opus-5-5 | 62 | 245 | $0.00515 | 4.1 |  |
| 2026-10-24 09:15 | 60 | check opus/bare/7 | claude-haiku-5-5 | 494 | 73 | $0.00009 | 0.7 |  |
| 2026-10-24 09:15 | 61 | subject sonnet/night/3 | claude-sonnet-5-5 | 90 | 230 | $0.00248 | 3.3 |  |
| 2026-10-24 09:15 | 62 | check sonnet/night/3 | claude-haiku-5-5 | 509 | 74 | $0.00009 | 0.8 |  |
| 2026-10-24 09:15 | 63 | subject fable/bare/5 | claude-fable-5-1 | 62 | 413 | $0.02127 | 8.5 |  |
| 2026-10-24 09:15 | 64 | check fable/bare/5 | claude-haiku-5-5 | 600 | 73 | $0.00010 | 0.6 |  |
| 2026-10-24 09:15 | 65 | subject sonnet/night/2 | claude-sonnet-5-5 | 90 | 162 | $0.00180 | 2.6 |  |
| 2026-10-24 09:15 | 66 | check sonnet/night/2 | claude-haiku-5-5 | 441 | 64 | $0.00008 | 0.8 |  |
| 2026-10-24 09:15 | 67 | subject sonnet/night/0 | claude-sonnet-5-5 | 90 | 231 | $0.00249 | 3.3 |  |
| 2026-10-24 09:15 | 68 | check sonnet/night/0 | claude-haiku-5-5 | 510 | 81 | $0.00009 | 0.7 |  |
| 2026-10-24 09:15 | 69 | subject sonnet/bare/2 | claude-sonnet-5-5 | 62 | 332 | $0.00344 | 4 |  |
| 2026-10-24 09:15 | 70 | check sonnet/bare/2 | claude-haiku-5-5 | 611 | 73 | $0.00010 | 1 |  |
| 2026-10-24 09:15 | 71 | subject fable/bare/3 | claude-fable-5-1 | 62 | 402 | $0.02072 | 9.5 |  |
| 2026-10-24 09:15 | 72 | check fable/bare/3 | claude-haiku-5-5 | 628 | 60 | $0.00009 | 0.9 |  |
| 2026-10-24 09:15 | 73 | subject fable/night/5 | claude-fable-5-1 | 90 | 494 | $0.02560 | 11.5 |  |
| 2026-10-24 09:15 | 74 | check fable/night/5 | claude-haiku-5-5 | 689 | 95 | $0.00012 | 1 |  |
| 2026-10-24 09:15 | 75 | subject opus/night/3 | claude-opus-5-5 | 90 | 385 | $0.00806 | 6.2 |  |
| 2026-10-24 09:15 | 76 | check opus/night/3 | claude-haiku-5-5 | 601 | 92 | $0.00011 | 1.5 |  |
| 2026-10-24 09:15 | 77 | subject opus/night/0 | claude-opus-5-5 | 90 | 347 | $0.00730 | 6 |  |
| 2026-10-24 09:15 | 78 | check opus/night/0 | claude-haiku-5-5 | 551 | 66 | $0.00009 | 0.7 |  |
| 2026-10-24 09:15 | 79 | subject sonnet/night/8 | claude-sonnet-5-5 | 90 | 303 | $0.00321 | 4.9 |  |
| 2026-10-24 09:15 | 80 | check sonnet/night/8 | claude-haiku-5-5 | 582 | 78 | $0.00010 | 0.9 |  |
| 2026-10-24 09:15 | 81 | subject fable/night/3 | claude-fable-5-1 | 90 | 272 | $0.01450 | 6.4 |  |
| 2026-10-24 09:15 | 82 | check fable/night/3 | claude-haiku-5-5 | 441 | 65 | $0.00008 | 1 |  |
| 2026-10-24 09:15 | 83 | subject fable/night/7 | claude-fable-5-1 | 90 | 320 | $0.01690 | 8 |  |
| 2026-10-24 09:15 | 84 | check fable/night/7 | claude-haiku-5-5 | 526 | 69 | $0.00009 | 0.9 |  |
| 2026-10-24 09:15 | 85 | subject opus/bare/4 | claude-opus-5-5 | 62 | 233 | $0.00491 | 4 |  |
| 2026-10-24 09:15 | 86 | check opus/bare/4 | claude-haiku-5-5 | 479 | 71 | $0.00008 | 0.9 |  |
| 2026-10-24 09:15 | 87 | subject opus/bare/5 | claude-opus-5-5 | 62 | 328 | $0.00681 | 5.7 |  |
| 2026-10-24 09:15 | 88 | check opus/bare/5 | claude-haiku-5-5 | 579 | 87 | $0.00010 | 0.8 |  |
| 2026-10-24 09:15 | 89 | subject sonnet/night/9 | claude-sonnet-5-5 | 90 | 165 | $0.00183 | 2.6 |  |
| 2026-10-24 09:15 | 90 | check sonnet/night/9 | claude-haiku-5-5 | 444 | 60 | $0.00007 | 1.8 |  |
| 2026-10-24 09:15 | 91 | subject fable/bare/1 | claude-fable-5-1 | 62 | 257 | $0.01347 | 6.3 |  |
| 2026-10-24 09:15 | 92 | check fable/bare/1 | claude-haiku-5-5 | 495 | 82 | $0.00009 | 0.9 |  |
| 2026-10-24 09:15 | 93 | subject opus/night/7 | claude-opus-5-5 | 90 | 372 | $0.00780 | 6.3 |  |
| 2026-10-24 09:15 | 94 | check opus/night/7 | claude-haiku-5-5 | 591 | 69 | $0.00009 | 1.1 |  |
| 2026-10-24 09:15 | 95 | subject opus/night/9 | claude-opus-5-5 | 90 | 419 | $0.00874 | 6.8 |  |
| 2026-10-24 09:15 | 96 | check opus/night/9 | claude-haiku-5-5 | 627 | 68 | $0.00010 | 1 |  |
| 2026-10-24 09:15 | 97 | subject sonnet/bare/3 | claude-sonnet-5-5 | 62 | 264 | $0.00276 | 3.7 |  |
| 2026-10-24 09:15 | 98 | check sonnet/bare/3 | claude-haiku-5-5 | 543 | 68 | $0.00009 | 0.9 |  |
| 2026-10-24 09:15 | 99 | subject sonnet/bare/9 | claude-sonnet-5-5 | 62 | 261 | $0.00273 | 3.6 |  |
| 2026-10-24 09:15 | 100 | check sonnet/bare/9 | claude-haiku-5-5 | 507 | 78 | $0.00009 | 0.9 |  |
| 2026-10-24 09:15 | 101 | subject sonnet/night/4 | claude-sonnet-5-5 | 90 | 258 | $0.00276 | 3.5 |  |
| 2026-10-24 09:15 | 102 | check sonnet/night/4 | claude-haiku-5-5 | 537 | 74 | $0.00009 | 0.8 |  |
| 2026-10-24 09:15 | 103 | subject sonnet/bare/6 | claude-sonnet-5-5 | 62 | 349 | $0.00361 | 4.6 |  |
| 2026-10-24 09:15 | 104 | check sonnet/bare/6 | claude-haiku-5-5 | 628 | 60 | $0.00009 | 0.7 |  |
| 2026-10-24 09:15 | 105 | subject fable/night/8 | claude-fable-5-1 | 90 | 376 | $0.01970 | 7.9 |  |
| 2026-10-24 09:15 | 106 | check fable/night/8 | claude-haiku-5-5 | 568 | 84 | $0.00010 | 0.8 |  |
| 2026-10-24 09:15 | 107 | subject fable/night/4 | claude-fable-5-1 | 90 | 321 | $0.01695 | 7.4 |  |
| 2026-10-24 09:15 | 108 | check fable/night/4 | claude-haiku-5-5 | 525 | 68 | $0.00009 | 0.7 |  |
| 2026-10-24 09:15 | 109 | subject sonnet/night/5 | claude-sonnet-5-5 | 90 | 367 | $0.00385 | 4.6 |  |
| 2026-10-24 09:15 | 110 | check sonnet/night/5 | claude-haiku-5-5 | 646 | 70 | $0.00010 | 1.7 |  |
| 2026-10-24 09:15 | 111 | subject opus/night/8 | claude-opus-5-5 | 90 | 380 | $0.00796 | 7 |  |
| 2026-10-24 09:15 | 112 | check opus/night/8 | claude-haiku-5-5 | 595 | 66 | $0.00009 | 0.9 |  |
| 2026-10-24 09:15 | 113 | subject sonnet/bare/4 | claude-sonnet-5-5 | 62 | 234 | $0.00246 | 3.4 |  |
| 2026-10-24 09:15 | 114 | check sonnet/bare/4 | claude-haiku-5-5 | 513 | 68 | $0.00009 | 0.7 |  |
| 2026-10-24 09:15 | 115 | subject opus/bare/6 | claude-opus-5-5 | 62 | 277 | $0.00579 | 4.7 |  |
| 2026-10-24 09:15 | 116 | check opus/bare/6 | claude-haiku-5-5 | 504 | 73 | $0.00009 | 0.8 |  |
| 2026-10-24 09:15 | 117 | subject opus/night/5 | claude-opus-5-5 | 90 | 334 | $0.00704 | 5.6 |  |
| 2026-10-24 09:15 | 118 | check opus/night/5 | claude-haiku-5-5 | 565 | 69 | $0.00009 | 0.9 |  |
| 2026-10-24 09:15 | 119 | subject fable/night/2 | claude-fable-5-1 | 90 | 332 | $0.01750 | 6.7 |  |
| 2026-10-24 09:15 | 120 | check fable/night/2 | claude-haiku-5-5 | 513 | 77 | $0.00009 | 0.9 |  |
