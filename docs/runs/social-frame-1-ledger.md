# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$122.1051** in 82282 calls; the last credit read $380.0355 → spent by credit $119.9645 (2026-11-11T10:59:54.197Z).

- 2026-11-11 03:58 UTC: Part B: Sol writes the sets — 1 calls, $0.0580
- 2026-11-11 03:59 UTC: Part B: the raters check the sets — 31 calls, $0.1467
- 2026-11-11 04:01 UTC: Part B: the raters check the sets — 30 calls, $0.1232
- 2026-11-11 04:04 UTC: Part C anchors — 1219 calls, $4.5150
- 2026-11-11 04:20 UTC: Part C clean — 3660 calls, $12.8575
- 2026-11-11 05:01 UTC: Part A rows neutral — 18959 calls, $26.9819
- 2026-11-11 06:20 UTC: Part A rows neutral — 6704 calls, $4.2961
- 2026-11-11 07:01 UTC: Part A rows rude — 25979 calls, $40.3888
- 2026-11-11 09:01 UTC: Part A rows warm — 25699 calls, $32.7378

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 12940 | 0 | 4226208 | 3755488 (357147) | $94.3020 |
| judge | 25871 | 0 | 25121875 | 4982089 (0) | $5.0032 |
| judge-referee | 1608 | 0 | 1284333 | 253115 (124473) | $7.8346 |
| field | 17630 | 0 | 14087540 | 2904061 (0) | $2.8608 |
| warn | 22673 | 0 | 19738127 | 6760680 (0) | $5.3542 |
| warn-referee | 1219 | 0 | 866978 | 175942 (92128) | $5.2401 |
| field-referee | 279 | 0 | 189178 | 40988 (22822) | $1.1824 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 2020 | 0 | 726594 | 752603 (0) | $44.8961 |
| aws-bedrock/claude-haiku-5-5 — field | 17630 | 0 | 14087540 | 2904061 (0) | $2.8608 |
| aws-bedrock/claude-haiku-5-5 — judge | 25871 | 0 | 25121875 | 4982089 (0) | $5.0032 |
| aws-bedrock/claude-haiku-5-5 — reply | 1620 | 0 | 603864 | 925748 (0) | $0.5233 |
| aws-bedrock/claude-haiku-5-5 — warn | 22673 | 0 | 19738127 | 6760680 (0) | $5.3542 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 2020 | 0 | 726594 | 786755 (0) | $18.6415 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 279 | 0 | 189178 | 40988 (22822) | $1.1824 |
| moonshot/kimi-k3 — judge-referee | 1529 | 0 | 1204471 | 232114 (124473) | $7.0951 |
| moonshot/kimi-k3 — reply | 1620 | 0 | 645660 | 282633 (85825) | $6.1765 |
| moonshot/kimi-k3 — warn-referee | 1219 | 0 | 866978 | 175942 (92128) | $5.2401 |
| openai/gpt-6-astra — reply | 1620 | 0 | 437256 | 239170 (93570) | $16.3311 |
| openai/gpt-6.1-sol — reply | 1620 | 0 | 437256 | 263574 (119559) | $3.5103 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 2020 | 0 | 526254 | 323015 (58193) | $2.1580 |
