# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$75.6164** in 44995 calls; the last credit read $425.3903 → spent by credit $74.6097 (2026-11-11T08:01:08.841Z).

- 2026-11-11 03:58 UTC: Part B: Sol writes the sets — 1 calls, $0.0580
- 2026-11-11 03:59 UTC: Part B: the raters check the sets — 31 calls, $0.1467
- 2026-11-11 04:01 UTC: Part B: the raters check the sets — 30 calls, $0.1232
- 2026-11-11 04:04 UTC: Part C anchors — 1219 calls, $4.5150
- 2026-11-11 04:20 UTC: Part C clean — 3660 calls, $12.8575
- 2026-11-11 05:01 UTC: Part A rows neutral — 18959 calls, $26.9819
- 2026-11-11 06:20 UTC: Part A rows neutral — 6704 calls, $4.2961
- 2026-11-11 07:01 UTC: Part A rows rude — 14391 calls, $26.6379

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 7480 | 0 | 2405536 | 2229318 (181846) | $60.4665 |
| judge | 14943 | 0 | 14582923 | 2805995 (0) | $2.8613 |
| judge-referee | 865 | 0 | 698279 | 136710 (60733) | $4.3304 |
| field | 9125 | 0 | 7288521 | 1479461 (0) | $1.4686 |
| warn | 11741 | 0 | 10215042 | 3535360 (0) | $2.7892 |
| warn-referee | 646 | 0 | 458819 | 94721 (50199) | $2.7973 |
| field-referee | 133 | 0 | 90176 | 20314 (11655) | $0.5752 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 1369 | 0 | 482523 | 526391 (0) | $31.1448 |
| aws-bedrock/claude-haiku-5-5 — field | 9125 | 0 | 7288521 | 1479461 (0) | $1.4686 |
| aws-bedrock/claude-haiku-5-5 — judge | 14943 | 0 | 14582923 | 2805995 (0) | $2.8613 |
| aws-bedrock/claude-haiku-5-5 — reply | 764 | 0 | 280842 | 420112 (0) | $0.2381 |
| aws-bedrock/claude-haiku-5-5 — warn | 11741 | 0 | 10215042 | 3535360 (0) | $2.7892 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 1283 | 0 | 449468 | 507085 (0) | $11.9396 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 133 | 0 | 90176 | 20314 (11655) | $0.5752 |
| moonshot/kimi-k3 — judge-referee | 786 | 0 | 618417 | 115709 (60733) | $3.5909 |
| moonshot/kimi-k3 — reply | 836 | 0 | 331150 | 144928 (44493) | $3.1674 |
| moonshot/kimi-k3 — warn-referee | 646 | 0 | 458819 | 94721 (50199) | $2.7973 |
| openai/gpt-6-astra — reply | 906 | 0 | 243114 | 132174 (51361) | $9.0398 |
| openai/gpt-6.1-sol — reply | 757 | 0 | 201801 | 118419 (51883) | $1.5878 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 1165 | 0 | 293908 | 198219 (34109) | $1.2836 |
