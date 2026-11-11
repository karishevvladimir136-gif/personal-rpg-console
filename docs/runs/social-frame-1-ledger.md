# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$24.7575** in 9741 calls; the last credit read $475.5474 → spent by credit $24.4526 (2026-11-11T05:20:24.615Z).

- 2026-11-11 03:58 UTC: Part B: Sol writes the sets — 1 calls, $0.0580
- 2026-11-11 03:59 UTC: Part B: the raters check the sets — 31 calls, $0.1467
- 2026-11-11 04:01 UTC: Part B: the raters check the sets — 30 calls, $0.1232
- 2026-11-11 04:04 UTC: Part C anchors — 1219 calls, $4.5150
- 2026-11-11 04:20 UTC: Part C clean — 3660 calls, $12.8575
- 2026-11-11 05:01 UTC: Part A rows neutral — 4800 calls, $7.0569

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 2314 | 0 | 693793 | 783825 (27546) | $21.6423 |
| judge | 4619 | 0 | 4629385 | 745161 (0) | $0.8355 |
| judge-referee | 166 | 0 | 147388 | 33232 (6090) | $1.1255 |
| field | 1080 | 0 | 864458 | 168810 (0) | $0.1709 |
| warn | 1418 | 0 | 1230492 | 389763 (0) | $0.3179 |
| warn-referee | 68 | 0 | 48824 | 8833 (4535) | $0.2790 |
| field-referee | 14 | 0 | 9660 | 1966 (1051) | $0.0585 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 554 | 0 | 178440 | 215649 (0) | $12.5669 |
| aws-bedrock/claude-haiku-5-5 — field | 1080 | 0 | 864458 | 168810 (0) | $0.1709 |
| aws-bedrock/claude-haiku-5-5 — judge | 4619 | 0 | 4629385 | 745161 (0) | $0.8355 |
| aws-bedrock/claude-haiku-5-5 — reply | 83 | 0 | 29971 | 38440 (0) | $0.0222 |
| aws-bedrock/claude-haiku-5-5 — warn | 1418 | 0 | 1230492 | 389763 (0) | $0.3179 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 530 | 0 | 169630 | 207733 (0) | $4.8332 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 14 | 0 | 9660 | 1966 (1051) | $0.0585 |
| moonshot/kimi-k3 — judge-referee | 87 | 0 | 67526 | 12231 (6090) | $0.3860 |
| moonshot/kimi-k3 — reply | 89 | 0 | 34771 | 13905 (3096) | $0.3129 |
| moonshot/kimi-k3 — warn-referee | 68 | 0 | 48824 | 8833 (4535) | $0.2790 |
| openai/gpt-6-astra — reply | 119 | 0 | 31201 | 16077 (5466) | $1.1159 |
| openai/gpt-6.1-sol — reply | 63 | 0 | 16571 | 9635 (4033) | $0.1295 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 476 | 0 | 110479 | 100396 (14951) | $0.5964 |
