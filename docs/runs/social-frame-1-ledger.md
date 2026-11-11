# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$152.7718** in 107619 calls; the last credit read $349.7896 → spent by credit $150.2104 (2026-11-11T12:58:58.803Z).

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

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 16676 | 0 | 5427741 | 4658292 (455332) | $117.0331 |
| judge | 33331 | 0 | 32277393 | 6376651 (0) | $6.4161 |
| judge-referee | 2099 | 0 | 1671186 | 328087 (164852) | $10.1197 |
| field | 23430 | 0 | 18700158 | 3833637 (0) | $3.7868 |
| warn | 30133 | 0 | 26198775 | 8810562 (0) | $7.0252 |
| warn-referee | 1519 | 0 | 1080450 | 217598 (114325) | $6.5053 |
| field-referee | 369 | 0 | 251485 | 53548 (29594) | $1.5577 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 2516 | 0 | 905499 | 910408 (0) | $54.5754 |
| aws-bedrock/claude-haiku-5-5 — field | 23430 | 0 | 18700158 | 3833637 (0) | $3.7868 |
| aws-bedrock/claude-haiku-5-5 — judge | 33331 | 0 | 32277393 | 6376651 (0) | $6.4161 |
| aws-bedrock/claude-haiku-5-5 — reply | 2160 | 0 | 798852 | 1185193 (0) | $0.6725 |
| aws-bedrock/claude-haiku-5-5 — warn | 30133 | 0 | 26198775 | 8810562 (0) | $7.0252 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 2560 | 0 | 921582 | 955504 (0) | $22.7964 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 369 | 0 | 251485 | 53548 (29594) | $1.5577 |
| moonshot/kimi-k3 — judge-referee | 2020 | 0 | 1591324 | 307086 (164852) | $9.3803 |
| moonshot/kimi-k3 — reply | 2160 | 0 | 856020 | 371518 (111209) | $8.1408 |
| moonshot/kimi-k3 — warn-referee | 1519 | 0 | 1080450 | 217598 (114325) | $6.5053 |
| openai/gpt-6-astra — reply | 2160 | 0 | 578328 | 314807 (121655) | $21.5236 |
| openai/gpt-6.1-sol — reply | 2160 | 0 | 578328 | 342553 (151444) | $4.5822 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 2560 | 0 | 666402 | 396319 (71024) | $2.6768 |
