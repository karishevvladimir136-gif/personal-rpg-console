# Game player 2 — the OpenRouter ledger

Cap $70; spent before this run $0.0000; this run $14.1753; total $14.1753; 213 calls.

| Session | Purpose | Model | Calls | Input (uncached) | Cache read | Cache write | Output | USD | Errors | Refusals | 429 waits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| smoke | smoke judge haiku | anthropic/claude-haiku-5.5 | 1 | 31 | 0 | 0 | 9 | $0.0000 | 0 | 0 | 0 |
| smoke | smoke player opus | anthropic/claude-opus-5.5 | 1 | 50 | 0 | 0 | 45 | $0.0011 | 0 | 0 | 0 |
| smoke | smoke player fable | anthropic/claude-fable-5.1 | 1 | 50 | 0 | 0 | 34 | $0.0022 | 0 | 0 | 0 |
| C-opus | wizard | anthropic/claude-opus-5.5 | 2 | 11912 | 1567 | 0 | 13377 | $0.3155 | 0 | 0 | 0 |
| C-fable | wizard | anthropic/claude-opus-5.5 | 2 | 12337 | 1567 | 0 | 13516 | $0.3200 | 0 | 0 | 0 |
| C-astra | wizard | anthropic/claude-opus-5.5 | 2 | 12032 | 1567 | 0 | 13085 | $0.3101 | 0 | 0 | 0 |
| C-sol | wizard | anthropic/claude-opus-5.5 | 2 | 11272 | 1567 | 0 | 12707 | $0.2995 | 0 | 0 | 0 |
| C-sol | check C-sol opening | anthropic/claude-haiku-5.5 | 1 | 638 | 0 | 0 | 91 | $0.0001 | 0 | 0 | 0 |
| C-fable | check C-fable opening | anthropic/claude-haiku-5.5 | 1 | 651 | 0 | 0 | 71 | $0.0001 | 0 | 0 | 0 |
| C-fable | player t* | anthropic/claude-fable-5.1 | 7 | 28 | 107834 | 22982 | 3400 | $0.4845 | 0 | 0 | 0 |
| C-sol | check C-sol t* player | anthropic/claude-haiku-5.5 | 8 | 8660 | 0 | 0 | 549 | $0.0011 | 0 | 0 | 0 |
| C-opus | check C-opus opening | anthropic/claude-haiku-5.5 | 1 | 655 | 0 | 0 | 62 | $0.0001 | 0 | 0 | 0 |
| C-astra | check C-astra opening | anthropic/claude-haiku-5.5 | 1 | 699 | 0 | 0 | 75 | $0.0001 | 0 | 0 | 0 |
| C-sol | dm t* | anthropic/claude-opus-5.5 | 15 | 56 | 303179 | 334770 | 42221 | $2.7119 | 0 | 0 | 0 |
| C-opus | player t* | anthropic/claude-opus-5.5 | 7 | 28 | 107097 | 24384 | 5034 | $0.2441 | 0 | 0 | 0 |
| C-astra | check C-astra t* player | anthropic/claude-haiku-5.5 | 8 | 9232 | 0 | 0 | 534 | $0.0012 | 0 | 0 | 0 |
| C-astra | dm t* | anthropic/claude-opus-5.5 | 18 | 70 | 408808 | 405014 | 59387 | $3.3148 | 0 | 0 | 0 |
| C-fable | check C-fable t* player | anthropic/claude-haiku-5.5 | 7 | 10489 | 0 | 0 | 490 | $0.0013 | 0 | 0 | 0 |
| C-fable | dm t* | anthropic/claude-opus-5.5 | 14 | 56 | 326106 | 293394 | 43879 | $2.4348 | 0 | 0 | 0 |
| C-opus | check C-opus t* player | anthropic/claude-haiku-5.5 | 7 | 11941 | 0 | 0 | 549 | $0.0015 | 0 | 0 | 0 |
| C-opus | dm t* | anthropic/claude-opus-5.5 | 14 | 54 | 319260 | 275639 | 44992 | $2.3704 | 0 | 0 | 0 |
| C-sol | dm t* | anthropic/claude-haiku-5.5 | 5 | 12990 | 0 | 0 | 2304 | $0.0025 | 0 | 0 | 0 |
| C-sol | check C-sol t* dm | anthropic/claude-haiku-5.5 | 7 | 7952 | 0 | 0 | 528 | $0.0011 | 0 | 0 | 0 |
| C-astra | dm t* | anthropic/claude-haiku-5.5 | 9 | 20337 | 0 | 0 | 2822 | $0.0034 | 0 | 0 | 0 |
| C-opus | dm t* | anthropic/claude-haiku-5.5 | 6 | 15697 | 0 | 0 | 2359 | $0.0027 | 0 | 0 | 0 |
| C-astra | check C-astra t* dm | anthropic/claude-haiku-5.5 | 7 | 8392 | 0 | 0 | 532 | $0.0011 | 0 | 0 | 0 |
| C-opus | check C-opus t* dm | anthropic/claude-haiku-5.5 | 6 | 10842 | 0 | 0 | 477 | $0.0013 | 0 | 0 | 0 |
| C-fable | dm t* | anthropic/claude-haiku-5.5 | 7 | 17255 | 0 | 0 | 2790 | $0.0031 | 0 | 0 | 0 |
| C-fable | check C-fable t* dm | anthropic/claude-haiku-5.5 | 6 | 9513 | 0 | 0 | 452 | $0.0012 | 0 | 0 | 0 |
| C-sol | check C-sol t* dm (told before a card) | anthropic/claude-haiku-5.5 | 3 | 1719 | 0 | 0 | 181 | $0.0003 | 0 | 0 | 0 |
| C-sol | check C-sol t* player (card) | anthropic/claude-haiku-5.5 | 5 | 2817 | 0 | 0 | 297 | $0.0004 | 0 | 0 | 0 |
| C-sol | dm t* onward | anthropic/claude-opus-5.5 | 5 | 16 | 165368 | 52304 | 12372 | $0.5421 | 0 | 0 | 0 |
| C-astra | check referee C-astra t* dm | anthropic/claude-opus-5.5 | 1 | 1152 | 0 | 0 | 51 | $0.0056 | 0 | 0 | 0 |
| C-sol | dm t* onward | anthropic/claude-haiku-5.5 | 4 | 7496 | 0 | 0 | 976 | $0.0012 | 0 | 0 | 0 |
| C-fable | check C-fable t* dm (told before a card) | anthropic/claude-haiku-5.5 | 1 | 1008 | 0 | 0 | 61 | $0.0001 | 0 | 0 | 0 |
| C-fable | player t* card 1 | anthropic/claude-fable-5.1 | 1 | 4 | 18325 | 792 | 26 | $0.0158 | 0 | 0 | 0 |
| C-fable | check C-fable t* player (card) | anthropic/claude-haiku-5.5 | 2 | 1109 | 0 | 0 | 125 | $0.0002 | 0 | 0 | 0 |
| C-fable | player t* card 2 | anthropic/claude-fable-5.1 | 1 | 4 | 19117 | 120 | 27 | $0.0077 | 0 | 0 | 0 |
| C-fable | dm t* onward | anthropic/claude-opus-5.5 | 3 | 10 | 112546 | 31217 | 8290 | $0.3444 | 0 | 0 | 0 |
| C-fable | dm t* onward | anthropic/claude-haiku-5.5 | 2 | 5075 | 0 | 0 | 638 | $0.0008 | 0 | 0 | 0 |
| C-opus | check C-opus t* dm (told before a card) | anthropic/claude-haiku-5.5 | 1 | 902 | 0 | 0 | 66 | $0.0001 | 0 | 0 | 0 |
| C-opus | player t* card 1 | anthropic/claude-opus-5.5 | 1 | 4 | 22605 | 685 | 58 | $0.0091 | 0 | 0 | 0 |
| C-opus | check C-opus t* player (card) | anthropic/claude-haiku-5.5 | 2 | 926 | 0 | 0 | 123 | $0.0002 | 0 | 0 | 0 |
| C-opus | player t* card 2 | anthropic/claude-opus-5.5 | 1 | 4 | 23290 | 120 | 214 | $0.0096 | 0 | 0 | 0 |
| C-opus | dm t* onward | anthropic/claude-opus-5.5 | 4 | 14 | 172459 | 38794 | 8852 | $0.4056 | 0 | 0 | 0 |
| C-opus | dm t* onward | anthropic/claude-haiku-5.5 | 3 | 7796 | 0 | 0 | 830 | $0.0012 | 0 | 0 | 0 |
