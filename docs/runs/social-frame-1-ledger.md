# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$57.9185** in 35404 calls; the last credit read $442.9118 → spent by credit $57.0882 (2026-11-11T07:20:31.800Z).

- 2026-11-11 03:58 UTC: Part B: Sol writes the sets — 1 calls, $0.0580
- 2026-11-11 03:59 UTC: Part B: the raters check the sets — 31 calls, $0.1467
- 2026-11-11 04:01 UTC: Part B: the raters check the sets — 30 calls, $0.1232
- 2026-11-11 04:04 UTC: Part C anchors — 1219 calls, $4.5150
- 2026-11-11 04:20 UTC: Part C clean — 3660 calls, $12.8575
- 2026-11-11 05:01 UTC: Part A rows neutral — 18959 calls, $26.9819
- 2026-11-11 06:20 UTC: Part A rows neutral — 6704 calls, $4.2961
- 2026-11-11 07:01 UTC: Part A rows rude — 4800 calls, $8.9400

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 6086 | 0 | 1922380 | 1758751 (133980) | $46.4292 |
| judge | 12153 | 0 | 11872191 | 2193738 (0) | $2.2841 |
| judge-referee | 644 | 0 | 524479 | 105718 (45098) | $3.3441 |
| field | 6952 | 0 | 5540822 | 1115602 (0) | $1.1119 |
| warn | 8953 | 0 | 7768725 | 2568747 (0) | $2.0612 |
| warn-referee | 453 | 0 | 323184 | 63565 (33458) | $1.9230 |
| field-referee | 101 | 0 | 68108 | 15515 (8923) | $0.4370 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 1088 | 0 | 374560 | 400138 (0) | $23.7525 |
| aws-bedrock/claude-haiku-5-5 — field | 6952 | 0 | 5540822 | 1115602 (0) | $1.1119 |
| aws-bedrock/claude-haiku-5-5 — judge | 12153 | 0 | 11872191 | 2193738 (0) | $2.2841 |
| aws-bedrock/claude-haiku-5-5 — reply | 612 | 0 | 222622 | 316332 (0) | $0.1804 |
| aws-bedrock/claude-haiku-5-5 — warn | 8953 | 0 | 7768725 | 2568747 (0) | $2.0612 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 1052 | 0 | 360725 | 391427 (0) | $9.2714 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 101 | 0 | 68108 | 15515 (8923) | $0.4370 |
| moonshot/kimi-k3 — judge-referee | 565 | 0 | 444617 | 84717 (45098) | $2.6046 |
| moonshot/kimi-k3 — reply | 637 | 0 | 250399 | 108074 (32135) | $2.3723 |
| moonshot/kimi-k3 — warn-referee | 453 | 0 | 323184 | 63565 (33458) | $1.9230 |
| openai/gpt-6-astra — reply | 663 | 0 | 175727 | 93183 (34394) | $6.4164 |
| openai/gpt-6.1-sol — reply | 612 | 0 | 161610 | 91862 (38473) | $1.2418 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 1022 | 0 | 254007 | 175745 (28978) | $1.1289 |
