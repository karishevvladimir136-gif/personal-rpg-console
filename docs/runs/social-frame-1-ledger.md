# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$186.4803** in 133859 calls; the last credit read $316.9347 → spent by credit $183.0653 (2026-11-11T15:04:55.323Z).

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
- 2026-11-11 13:01 UTC: Part A rows flattering — 25760 calls, $32.9141
- 2026-11-11 15:03 UTC: Part B — 480 calls, $0.7944

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 20619 | 0 | 6720077 | 5650675 (566383) | $142.2583 |
| judge | 40891 | 0 | 39549051 | 7788994 (0) | $7.8494 |
| judge-referee | 2621 | 0 | 2084166 | 405126 (205192) | $12.5143 |
| field | 29310 | 0 | 23393410 | 4793920 (0) | $4.7363 |
| warn | 37693 | 0 | 32765643 | 10973908 (0) | $8.7635 |
| warn-referee | 1882 | 0 | 1339294 | 267724 (140689) | $8.0337 |
| field-referee | 464 | 0 | 316709 | 67177 (37114) | $1.9578 |
| choice | 315 | 0 | 181078 | 27616 (0) | $0.0319 |
| choice-referee | 2 | 0 | 854 | 306 (186) | $0.0072 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 3084 | 0 | 1115392 | 1094245 (0) | $65.8662 |
| aws-bedrock/claude-fable-5-2 — reply | 22 | 0 | 4082 | 3103 (0) | $0.1568 |
| aws-bedrock/claude-haiku-5-5 — choice | 315 | 0 | 181078 | 27616 (0) | $0.0319 |
| aws-bedrock/claude-haiku-5-5 — field | 29310 | 0 | 23393410 | 4793920 (0) | $4.7363 |
| aws-bedrock/claude-haiku-5-5 — judge | 40891 | 0 | 39549051 | 7788994 (0) | $7.8494 |
| aws-bedrock/claude-haiku-5-5 — reply | 2716 | 0 | 1006584 | 1475289 (0) | $0.8383 |
| aws-bedrock/claude-haiku-5-5 — warn | 37693 | 0 | 32765643 | 10973908 (0) | $8.7635 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 3129 | 0 | 1131586 | 1133031 (0) | $27.1870 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — choice-referee | 2 | 0 | 854 | 306 (186) | $0.0072 |
| moonshot/kimi-k3 — field-referee | 464 | 0 | 316709 | 67177 (37114) | $1.9578 |
| moonshot/kimi-k3 — judge-referee | 2542 | 0 | 2004304 | 384125 (205192) | $11.7748 |
| moonshot/kimi-k3 — reply | 2714 | 0 | 1073453 | 467061 (142350) | $10.2263 |
| moonshot/kimi-k3 — warn-referee | 1882 | 0 | 1339294 | 267724 (140689) | $8.0337 |
| openai/gpt-6-astra — reply | 2727 | 0 | 726814 | 394101 (151252) | $26.9732 |
| openai/gpt-6.1-sol — reply | 2714 | 0 | 725333 | 426194 (186365) | $5.7126 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 3113 | 0 | 814103 | 475661 (86416) | $3.2327 |
