# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$183.4369** in 129326 calls; the last credit read $319.7073 → spent by credit $180.2927 (2026-11-11T14:32:14.660Z).

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
- 2026-11-11 13:01 UTC: Part A rows flattering — 21706 calls, $30.6649

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 19862 | 0 | 6504952 | 5475761 (542432) | $140.5621 |
| judge | 39702 | 0 | 38413379 | 7556950 (0) | $7.6198 |
| judge-referee | 2540 | 0 | 2020075 | 392990 (198626) | $12.1399 |
| field | 28380 | 0 | 22659512 | 4642756 (0) | $4.5873 |
| warn | 36503 | 0 | 31741069 | 10646253 (0) | $8.4972 |
| warn-referee | 1830 | 0 | 1302511 | 260643 (136895) | $7.8172 |
| field-referee | 447 | 0 | 304920 | 64706 (35702) | $1.8853 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 3056 | 0 | 1110207 | 1088908 (0) | $65.5475 |
| aws-bedrock/claude-haiku-5-5 — field | 28380 | 0 | 22659512 | 4642756 (0) | $4.5873 |
| aws-bedrock/claude-haiku-5-5 — judge | 39702 | 0 | 38413379 | 7556950 (0) | $7.6198 |
| aws-bedrock/claude-haiku-5-5 — reply | 2542 | 0 | 943583 | 1385830 (0) | $0.7873 |
| aws-bedrock/claude-haiku-5-5 — warn | 36503 | 0 | 31741069 | 10646253 (0) | $8.4972 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 3100 | 0 | 1126290 | 1128912 (0) | $27.0834 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 447 | 0 | 304920 | 64706 (35702) | $1.8853 |
| moonshot/kimi-k3 — judge-referee | 2461 | 0 | 1940213 | 371989 (198626) | $11.4005 |
| moonshot/kimi-k3 — reply | 2614 | 0 | 1036554 | 450346 (136405) | $9.8649 |
| moonshot/kimi-k3 — warn-referee | 1830 | 0 | 1302511 | 260643 (136895) | $7.8172 |
| openai/gpt-6-astra — reply | 2700 | 0 | 723720 | 392430 (151191) | $26.8587 |
| openai/gpt-6.1-sol — reply | 2498 | 0 | 669419 | 394003 (172788) | $5.2789 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 2952 | 0 | 772449 | 453342 (82048) | $3.0761 |
