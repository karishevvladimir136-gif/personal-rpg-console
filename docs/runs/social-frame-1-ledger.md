# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$153.1676** in 107859 calls; the last credit read $349.5019 → spent by credit $150.4981 (2026-11-11T13:02:06.620Z).

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
- 2026-11-11 13:01 UTC: Part A rows flattering — 240 calls, $0.3958

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 16717 | 0 | 5441370 | 4668398 (456432) | $117.3295 |
| judge | 33399 | 0 | 32342997 | 6390743 (0) | $6.4297 |
| judge-referee | 2106 | 0 | 1676954 | 329227 (165504) | $10.1541 |
| field | 23482 | 0 | 18741684 | 3842992 (0) | $3.7957 |
| warn | 30199 | 0 | 26256191 | 8833674 (0) | $7.0425 |
| warn-referee | 1524 | 0 | 1084066 | 218287 (114683) | $6.5265 |
| field-referee | 370 | 0 | 252240 | 53666 (29646) | $1.5617 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 2523 | 0 | 908106 | 912489 (0) | $54.7055 |
| aws-bedrock/claude-haiku-5-5 — field | 23482 | 0 | 18741684 | 3842992 (0) | $3.7957 |
| aws-bedrock/claude-haiku-5-5 — judge | 33399 | 0 | 32342997 | 6390743 (0) | $6.4297 |
| aws-bedrock/claude-haiku-5-5 — reply | 2165 | 0 | 800705 | 1187432 (0) | $0.6738 |
| aws-bedrock/claude-haiku-5-5 — warn | 30199 | 0 | 26256191 | 8833674 (0) | $7.0425 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 2568 | 0 | 924603 | 957800 (0) | $22.8544 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 370 | 0 | 252240 | 53666 (29646) | $1.5617 |
| moonshot/kimi-k3 — judge-referee | 2027 | 0 | 1597092 | 308226 (165504) | $9.4147 |
| moonshot/kimi-k3 — reply | 2164 | 0 | 857638 | 372466 (111521) | $8.1599 |
| moonshot/kimi-k3 — warn-referee | 1524 | 0 | 1084066 | 218287 (114683) | $6.5265 |
| openai/gpt-6-astra — reply | 2167 | 0 | 580234 | 315880 (122058) | $21.5963 |
| openai/gpt-6.1-sol — reply | 2165 | 0 | 579635 | 343317 (151763) | $4.5924 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 2565 | 0 | 667719 | 397024 (71090) | $2.6817 |
