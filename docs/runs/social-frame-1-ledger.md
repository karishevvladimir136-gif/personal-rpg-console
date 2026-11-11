# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$140.5297** in 94521 calls; the last credit read $361.8033 → spent by credit $138.1967 (2026-11-11T11:53:46.067Z).

- 2026-11-11 03:58 UTC: Part B: Sol writes the sets — 1 calls, $0.0580
- 2026-11-11 03:59 UTC: Part B: the raters check the sets — 31 calls, $0.1467
- 2026-11-11 04:01 UTC: Part B: the raters check the sets — 30 calls, $0.1232
- 2026-11-11 04:04 UTC: Part C anchors — 1219 calls, $4.5150
- 2026-11-11 04:20 UTC: Part C clean — 3660 calls, $12.8575
- 2026-11-11 05:01 UTC: Part A rows neutral — 18959 calls, $26.9819
- 2026-11-11 06:20 UTC: Part A rows neutral — 6704 calls, $4.2961
- 2026-11-11 07:01 UTC: Part A rows rude — 25979 calls, $40.3888
- 2026-11-11 09:01 UTC: Part A rows warm — 25699 calls, $32.7378
- 2026-11-11 11:02 UTC: Part A rows curt — 12239 calls, $18.4246

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 14755 | 0 | 4820677 | 4204807 (399983) | $108.9718 |
| judge | 29481 | 0 | 28593060 | 5640812 (0) | $5.6797 |
| judge-referee | 1834 | 0 | 1461398 | 288868 (144291) | $8.9021 |
| field | 20432 | 0 | 16321212 | 3336446 (0) | $3.3003 |
| warn | 26281 | 0 | 22869194 | 7753156 (0) | $6.1635 |
| warn-referee | 1359 | 0 | 967081 | 195146 (102174) | $5.8284 |
| field-referee | 317 | 0 | 215392 | 47317 (26688) | $1.3559 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 2419 | 0 | 870728 | 879490 (0) | $52.6818 |
| aws-bedrock/claude-haiku-5-5 — field | 20432 | 0 | 16321212 | 3336446 (0) | $3.3003 |
| aws-bedrock/claude-haiku-5-5 — judge | 29481 | 0 | 28593060 | 5640812 (0) | $5.6797 |
| aws-bedrock/claude-haiku-5-5 — reply | 1801 | 0 | 669199 | 1012001 (0) | $0.5729 |
| aws-bedrock/claude-haiku-5-5 — warn | 26281 | 0 | 22869194 | 7753156 (0) | $6.1635 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 2345 | 0 | 844008 | 888904 (0) | $21.1541 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 317 | 0 | 215392 | 47317 (26688) | $1.3559 |
| moonshot/kimi-k3 — judge-referee | 1755 | 0 | 1381536 | 267867 (144291) | $8.1626 |
| moonshot/kimi-k3 — reply | 1857 | 0 | 737941 | 321325 (97065) | $7.0337 |
| moonshot/kimi-k3 — warn-referee | 1359 | 0 | 967081 | 195146 (102174) | $5.8284 |
| openai/gpt-6-astra — reply | 1923 | 0 | 516438 | 281947 (109836) | $19.2617 |
| openai/gpt-6.1-sol — reply | 1792 | 0 | 482049 | 288786 (129846) | $3.8520 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 2218 | 0 | 577584 | 350364 (63236) | $2.3502 |
