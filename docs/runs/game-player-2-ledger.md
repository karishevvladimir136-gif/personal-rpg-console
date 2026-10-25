# Game player 2 — the Anthropic ledger

Cap $110; spent before this run $0.0000; this run $11.4489; total $11.4489; 198 calls.

| Session | Purpose | Model | Calls | Input (uncached) | Cache read | Cache write | Output | USD | Errors | Refusals | 429 waits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C-opus | wizard | claude-opus-5-5 | 2 | 11181 | 0 | 1567 | 11419 | $0.2809 | 0 | 0 | 0 |
| C-fable | wizard | claude-opus-5-5 | 2 | 11591 | 0 | 1567 | 14106 | $0.3363 | 0 | 0 | 0 |
| C-astra | wizard | claude-opus-5-5 | 2 | 11950 | 0 | 1567 | 15848 | $0.3726 | 0 | 0 | 0 |
| C-sol | wizard | claude-opus-5-5 | 2 | 11293 | 0 | 1567 | 11034 | $0.2737 | 0 | 0 | 0 |
| C-sol | check C-sol opening | claude-haiku-5-5 | 1 | 726 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| C-opus | check C-opus opening | claude-haiku-5-5 | 1 | 710 | 0 | 0 | 69 | $0.0001 | 0 | 0 | 0 |
| C-opus | player t* | claude-opus-5-5 | 5 | 20 | 65947 | 17574 | 2901 | $0.1592 | 0 | 0 | 0 |
| C-sol | check C-sol t* player | claude-haiku-5-5 | 7 | 8359 | 0 | 0 | 463 | $0.0011 | 0 | 0 | 0 |
| C-sol | dm t* | claude-opus-5-5 | 13 | 52 | 242232 | 312848 | 44769 | $2.5762 | 0 | 0 | 0 |
| C-opus | check C-opus t* player | claude-haiku-5-5 | 5 | 6367 | 0 | 0 | 361 | $0.0008 | 0 | 0 | 0 |
| C-opus | dm t* | claude-opus-5-5 | 7 | 28 | 153036 | 132883 | 17947 | $1.0718 | 0 | 0 | 0 |
| C-fable | check C-fable opening | claude-haiku-5-5 | 1 | 688 | 0 | 0 | 76 | $0.0001 | 0 | 0 | 0 |
| C-fable | player t* | claude-fable-5-1 | 5 | 20 | 64030 | 18757 | 2584 | $0.3799 | 0 | 0 | 0 |
| C-fable | check C-fable t* player | claude-haiku-5-5 | 5 | 7419 | 0 | 0 | 350 | $0.0009 | 0 | 0 | 0 |
| C-fable | dm t* | claude-opus-5-5 | 12 | 44 | 265368 | 184962 | 33256 | $1.6612 | 1 | 0 | 0 |
| C-astra | check C-astra opening | claude-haiku-5-5 | 1 | 658 | 0 | 0 | 63 | $0.0001 | 0 | 0 | 0 |
| C-opus | check C-opus t* dm (told before a card) | claude-haiku-5-5 | 3 | 3397 | 0 | 0 | 218 | $0.0004 | 0 | 0 | 0 |
| C-opus | player t* card 1 | claude-opus-5-5 | 3 | 12 | 47727 | 2773 | 432 | $0.0321 | 0 | 0 | 0 |
| C-opus | check C-opus t* player (card) | claude-haiku-5-5 | 7 | 4803 | 0 | 0 | 439 | $0.0007 | 0 | 0 | 0 |
| C-astra | check C-astra t* player | claude-haiku-5-5 | 9 | 8880 | 0 | 0 | 643 | $0.0012 | 0 | 0 | 0 |
| C-opus | player t* card 2 | claude-opus-5-5 | 3 | 12 | 50500 | 401 | 830 | $0.0288 | 0 | 0 | 0 |
| C-astra | dm t* | claude-opus-5-5 | 16 | 60 | 378504 | 251080 | 35487 | $2.0564 | 0 | 0 | 0 |
| C-opus | dm t* onward | claude-opus-5-5 | 8 | 26 | 256707 | 83275 | 25752 | $0.9829 | 0 | 0 | 0 |
| C-opus | dm t* onward | claude-haiku-5-5 | 7 | 17423 | 0 | 0 | 2486 | $0.0030 | 0 | 0 | 0 |
| C-fable | dm t* | claude-haiku-5-5 | 6 | 14396 | 0 | 0 | 1925 | $0.0024 | 0 | 0 | 0 |
| C-sol | dm t* | claude-haiku-5-5 | 6 | 15588 | 0 | 0 | 2185 | $0.0027 | 0 | 0 | 0 |
| C-sol | check C-sol t* dm | claude-haiku-5-5 | 6 | 7502 | 0 | 0 | 466 | $0.0010 | 0 | 0 | 0 |
| C-astra | dm t* | claude-haiku-5-5 | 7 | 15874 | 0 | 0 | 2090 | $0.0026 | 0 | 0 | 0 |
| C-astra | check C-astra t* dm | claude-haiku-5-5 | 6 | 6590 | 0 | 0 | 440 | $0.0009 | 0 | 0 | 0 |
| C-opus | check C-opus t* dm | claude-haiku-5-5 | 4 | 5178 | 0 | 0 | 346 | $0.0007 | 0 | 0 | 0 |
| C-fable | check C-fable t* dm | claude-haiku-5-5 | 4 | 6339 | 0 | 0 | 335 | $0.0008 | 0 | 0 | 0 |
| C-opus | dm t* | claude-haiku-5-5 | 2 | 5045 | 0 | 0 | 1646 | $0.0013 | 0 | 0 | 0 |
| C-astra | dm t* ooc | claude-opus-5-5 | 2 | 19178 | 18168 | 18666 | 1733 | $0.2643 | 0 | 0 | 0 |
| C-astra | check C-astra t* dm (out of game) | claude-haiku-5-5 | 2 | 1496 | 0 | 0 | 164 | $0.0002 | 0 | 0 | 0 |
| C-fable | check C-fable t* dm (told before a card) | claude-haiku-5-5 | 1 | 1225 | 0 | 0 | 82 | $0.0002 | 0 | 0 | 0 |
| C-fable | player t* card 1 | claude-fable-5-1 | 1 | 4 | 16073 | 1020 | 9 | $0.0173 | 0 | 0 | 0 |
| C-opus | player t* card 3 | claude-opus-5-5 | 1 | 4 | 17355 | 310 | 335 | $0.0117 | 0 | 0 | 0 |
| C-fable | check C-fable t* player (card) | claude-haiku-5-5 | 3 | 1961 | 0 | 0 | 209 | $0.0003 | 0 | 0 | 0 |
| C-fable | player t* card 2 | claude-fable-5-1 | 1 | 4 | 17093 | 132 | 299 | $0.0209 | 0 | 0 | 0 |
| C-fable | player t* card 3 | claude-fable-5-1 | 1 | 4 | 17225 | 255 | 384 | $0.0267 | 0 | 0 | 0 |
| C-fable | dm t* onward | claude-opus-5-5 | 3 | 10 | 104950 | 30667 | 7851 | $0.3314 | 0 | 0 | 0 |
| C-fable | dm t* onward | claude-haiku-5-5 | 3 | 8602 | 0 | 0 | 1585 | $0.0017 | 0 | 0 | 0 |
| C-astra | check C-astra t* dm (told before a card) | claude-haiku-5-5 | 1 | 1192 | 0 | 0 | 79 | $0.0002 | 0 | 0 | 0 |
| C-sol | check C-sol t* dm (told before a card) | claude-haiku-5-5 | 1 | 569 | 0 | 0 | 70 | $0.0001 | 0 | 0 | 0 |
| C-astra | check C-astra t* player (card) | claude-haiku-5-5 | 2 | 1592 | 0 | 0 | 116 | $0.0002 | 0 | 0 | 0 |
| C-sol | check C-sol t* player (card) | claude-haiku-5-5 | 2 | 975 | 0 | 0 | 123 | $0.0002 | 0 | 0 | 0 |
| C-astra | dm t* onward | claude-opus-5-5 | 2 | 6 | 65695 | 28722 | 7724 | $0.3113 | 0 | 0 | 0 |
| C-sol | dm t* onward | claude-opus-5-5 | 2 | 6 | 69570 | 27988 | 3759 | $0.2291 | 0 | 0 | 0 |
| C-sol | dm t* onward | claude-haiku-5-5 | 1 | 969 | 0 | 0 | 48 | $0.0001 | 0 | 0 | 0 |
| C-astra | dm t* onward | claude-haiku-5-5 | 1 | 2130 | 0 | 0 | 158 | $0.0003 | 0 | 0 | 0 |
