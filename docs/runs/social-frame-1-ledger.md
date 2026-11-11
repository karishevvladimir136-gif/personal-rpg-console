# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$185.6571** in 133342 calls; the last credit read $317.6233 → spent by credit $182.3767 (2026-11-11T14:58:30.298Z).

- 2026-11-11 03:58 UTC: Part B: Sol writes the sets — 1 calls, $0.0580
- 2026-11-11 03:59 UTC: Part B: the raters check the sets — 31 calls, $0.1467
- 2026-11-11 04:01 UTC: Part B: the raters check the sets — 30 calls, $0.1232
- 2026-11-11 04:04 UTC: Part C anchors — 1219 calls, $4.5150
- 2026-11-11 04:20 UTC: Part C clean — 3660 calls, $12.8575
- 2026-11-11 05:01 UTC: Part A rows neutral — 18959 calls, $26.9819
- 2026-11-11 06:20 UTC: Part A rows neutral — 6704 calls, $4.2961
- 2026-11-11 07:01 UTC: Part A rows rude — 25979 calls, $40.3888
- 2026-11-11 09:01 UTC: Part A rows warm — 25699 calls, $32.7378
- 2026-11-11 11:02 UTC: Part A rows curt — 25337 calls, $30.6667
- 2026-11-11 13:01 UTC: Part A rows flattering — 25723 calls, $32.8853

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 20451 | 0 | 6692116 | 5627465 (564879) | $141.4918 |
| judge | 40881 | 0 | 39539341 | 7786534 (0) | $7.8472 |
| judge-referee | 2620 | 0 | 2083341 | 404842 (204980) | $12.5075 |
| field | 29300 | 0 | 23386096 | 4792489 (0) | $4.7349 |
| warn | 37683 | 0 | 32757339 | 10971364 (0) | $8.7614 |
| warn-referee | 1882 | 0 | 1339294 | 267724 (140689) | $8.0337 |
| field-referee | 463 | 0 | 316035 | 66967 (36966) | $1.9526 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 3056 | 0 | 1110207 | 1088908 (0) | $65.5475 |
| aws-bedrock/claude-haiku-5-5 — field | 29300 | 0 | 23386096 | 4792489 (0) | $4.7349 |
| aws-bedrock/claude-haiku-5-5 — judge | 40881 | 0 | 39539341 | 7786534 (0) | $7.8472 |
| aws-bedrock/claude-haiku-5-5 — reply | 2700 | 0 | 1003560 | 1471591 (0) | $0.8362 |
| aws-bedrock/claude-haiku-5-5 — warn | 37683 | 0 | 32757339 | 10971364 (0) | $8.7614 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 3100 | 0 | 1126290 | 1128912 (0) | $27.0834 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 463 | 0 | 316035 | 66967 (36966) | $1.9526 |
| moonshot/kimi-k3 — judge-referee | 2541 | 0 | 2003479 | 383841 (204980) | $11.7681 |
| moonshot/kimi-k3 — reply | 2700 | 0 | 1070700 | 465040 (141649) | $10.1877 |
| moonshot/kimi-k3 — warn-referee | 1882 | 0 | 1339294 | 267724 (140689) | $8.0337 |
| openai/gpt-6-astra — reply | 2700 | 0 | 723720 | 392430 (151191) | $26.8587 |
| openai/gpt-6.1-sol — reply | 2695 | 0 | 722419 | 424450 (185757) | $5.6893 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 3100 | 0 | 812490 | 474144 (86282) | $3.2237 |
