# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$100.2526** in 63783 calls; the last credit read $401.3438 → spent by credit $98.6562 (2026-11-11T09:31:29.165Z).

- 2026-11-11 03:58 UTC: Part B: Sol writes the sets — 1 calls, $0.0580
- 2026-11-11 03:59 UTC: Part B: the raters check the sets — 31 calls, $0.1467
- 2026-11-11 04:01 UTC: Part B: the raters check the sets — 30 calls, $0.1232
- 2026-11-11 04:04 UTC: Part C anchors — 1219 calls, $4.5150
- 2026-11-11 04:20 UTC: Part C clean — 3660 calls, $12.8575
- 2026-11-11 05:01 UTC: Part A rows neutral — 18959 calls, $26.9819
- 2026-11-11 06:20 UTC: Part A rows neutral — 6704 calls, $4.2961
- 2026-11-11 07:01 UTC: Part A rows rude — 25979 calls, $40.3888
- 2026-11-11 09:01 UTC: Part A rows warm — 7200 calls, $10.8853

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 10229 | 0 | 3332161 | 3054285 (275488) | $78.4640 |
| judge | 20436 | 0 | 19892026 | 3949627 (0) | $3.9640 |
| judge-referee | 1253 | 0 | 1004600 | 197535 (94155) | $6.1617 |
| field | 13403 | 0 | 10715215 | 2205684 (0) | $2.1744 |
| warn | 17237 | 0 | 15014811 | 5253160 (0) | $4.1281 |
| warn-referee | 962 | 0 | 683569 | 141632 (74767) | $4.1752 |
| field-referee | 201 | 0 | 136546 | 29845 (16752) | $0.8573 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 1708 | 0 | 610253 | 649342 (0) | $38.5696 |
| aws-bedrock/claude-haiku-5-5 — field | 13403 | 0 | 10715215 | 2205684 (0) | $2.1744 |
| aws-bedrock/claude-haiku-5-5 — judge | 20436 | 0 | 19892026 | 3949627 (0) | $3.9640 |
| aws-bedrock/claude-haiku-5-5 — reply | 1194 | 0 | 445068 | 696316 (0) | $0.3927 |
| aws-bedrock/claude-haiku-5-5 — warn | 17237 | 0 | 15014811 | 5253160 (0) | $4.1281 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 1676 | 0 | 597977 | 668673 (0) | $15.7654 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 201 | 0 | 136546 | 29845 (16752) | $0.8573 |
| moonshot/kimi-k3 — judge-referee | 1174 | 0 | 924738 | 176534 (94155) | $5.4222 |
| moonshot/kimi-k3 — reply | 1222 | 0 | 487063 | 215501 (66058) | $4.6937 |
| moonshot/kimi-k3 — warn-referee | 962 | 0 | 683569 | 141632 (74767) | $4.1752 |
| openai/gpt-6-astra — reply | 1258 | 0 | 339443 | 185660 (72958) | $12.6774 |
| openai/gpt-6.1-sol — reply | 1178 | 0 | 317932 | 192435 (87779) | $2.5602 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 1593 | 0 | 411695 | 264368 (48693) | $1.7396 |
