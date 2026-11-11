# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$150.8814** in 104029 calls; the last credit read $351.6214 → spent by credit $148.3786 (2026-11-11T12:33:15.591Z).

- 2026-11-11 03:58 UTC: Part B: Sol writes the sets — 1 calls, $0.0580
- 2026-11-11 03:59 UTC: Part B: the raters check the sets — 31 calls, $0.1467
- 2026-11-11 04:01 UTC: Part B: the raters check the sets — 30 calls, $0.1232
- 2026-11-11 04:04 UTC: Part C anchors — 1219 calls, $4.5150
- 2026-11-11 04:20 UTC: Part C clean — 3660 calls, $12.8575
- 2026-11-11 05:01 UTC: Part A rows neutral — 18959 calls, $26.9819
- 2026-11-11 06:20 UTC: Part A rows neutral — 6704 calls, $4.2961
- 2026-11-11 07:01 UTC: Part A rows rude — 25979 calls, $40.3888
- 2026-11-11 09:01 UTC: Part A rows warm — 25699 calls, $32.7378
- 2026-11-11 11:02 UTC: Part A rows curt — 21746 calls, $28.7762

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 16148 | 0 | 5268545 | 4530922 (438183) | $116.2902 |
| judge | 32268 | 0 | 31269170 | 6169529 (0) | $6.2117 |
| judge-referee | 2026 | 0 | 1612698 | 316928 (158860) | $9.7769 |
| field | 22629 | 0 | 18065946 | 3692355 (0) | $3.6528 |
| warn | 29067 | 0 | 25281993 | 8529479 (0) | $6.7929 |
| warn-referee | 1476 | 0 | 1050052 | 212100 (111617) | $6.3317 |
| field-referee | 353 | 0 | 240416 | 51736 (28782) | $1.4973 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 2516 | 0 | 905499 | 910408 (0) | $54.5754 |
| aws-bedrock/claude-haiku-5-5 — field | 22629 | 0 | 18065946 | 3692355 (0) | $3.6528 |
| aws-bedrock/claude-haiku-5-5 — judge | 32268 | 0 | 31269170 | 6169529 (0) | $6.2117 |
| aws-bedrock/claude-haiku-5-5 — reply | 2011 | 0 | 744959 | 1113118 (0) | $0.6311 |
| aws-bedrock/claude-haiku-5-5 — warn | 29067 | 0 | 25281993 | 8529479 (0) | $6.7929 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 2560 | 0 | 921582 | 955504 (0) | $22.7964 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 353 | 0 | 240416 | 51736 (28782) | $1.4973 |
| moonshot/kimi-k3 — judge-referee | 1947 | 0 | 1532836 | 295927 (158860) | $9.0374 |
| moonshot/kimi-k3 — reply | 2109 | 0 | 836220 | 363097 (108600) | $7.9551 |
| moonshot/kimi-k3 — warn-referee | 1476 | 0 | 1050052 | 212100 (111617) | $6.3317 |
| openai/gpt-6-astra — reply | 2160 | 0 | 578328 | 314807 (121655) | $21.5236 |
| openai/gpt-6.1-sol — reply | 1967 | 0 | 527862 | 314082 (140218) | $4.1965 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 2425 | 0 | 631365 | 377916 (67710) | $2.5467 |
