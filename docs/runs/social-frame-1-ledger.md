# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$44.8654** in 24140 calls; the last credit read $455.4879 → spent by credit $44.5121 (2026-11-11T06:21:07.476Z).

- 2026-11-11 03:58 UTC: Part B: Sol writes the sets — 1 calls, $0.0580
- 2026-11-11 03:59 UTC: Part B: the raters check the sets — 31 calls, $0.1467
- 2026-11-11 04:01 UTC: Part B: the raters check the sets — 30 calls, $0.1232
- 2026-11-11 04:04 UTC: Part C anchors — 1219 calls, $4.5150
- 2026-11-11 04:20 UTC: Part C clean — 3660 calls, $12.8575
- 2026-11-11 05:01 UTC: Part A rows neutral — 18959 calls, $26.9819
- 2026-11-11 06:20 UTC: Part A rows neutral — 240 calls, $0.1830

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 4431 | 0 | 1385256 | 1306572 (77509) | $37.3165 |
| judge | 8851 | 0 | 8706989 | 1525601 (0) | $1.6335 |
| judge-referee | 413 | 0 | 343036 | 69900 (25538) | $2.2625 |
| field | 4409 | 0 | 3519281 | 692604 (0) | $0.6982 |
| warn | 5651 | 0 | 4907379 | 1567083 (0) | $1.2743 |
| warn-referee | 272 | 0 | 194476 | 36535 (18884) | $1.1315 |
| field-referee | 51 | 0 | 34801 | 7778 (4410) | $0.2211 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 940 | 0 | 317718 | 334458 (0) | $19.9001 |
| aws-bedrock/claude-haiku-5-5 — field | 4409 | 0 | 3519281 | 692604 (0) | $0.6982 |
| aws-bedrock/claude-haiku-5-5 — judge | 8851 | 0 | 8706989 | 1525601 (0) | $1.6335 |
| aws-bedrock/claude-haiku-5-5 — reply | 317 | 0 | 114253 | 155278 (0) | $0.0891 |
| aws-bedrock/claude-haiku-5-5 — warn | 5651 | 0 | 4907379 | 1567083 (0) | $1.2743 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 940 | 0 | 317718 | 336196 (0) | $7.9948 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 51 | 0 | 34801 | 7778 (4410) | $0.2211 |
| moonshot/kimi-k3 — judge-referee | 334 | 0 | 263174 | 48899 (25538) | $1.5230 |
| moonshot/kimi-k3 — reply | 362 | 0 | 141496 | 60104 (17459) | $1.3260 |
| moonshot/kimi-k3 — warn-referee | 272 | 0 | 194476 | 36535 (18884) | $1.1315 |
| openai/gpt-6-astra — reply | 487 | 0 | 127766 | 65936 (23081) | $4.5745 |
| openai/gpt-6.1-sol — reply | 272 | 0 | 71340 | 39886 (16260) | $0.5415 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 713 | 0 | 172235 | 132724 (20709) | $0.8251 |
