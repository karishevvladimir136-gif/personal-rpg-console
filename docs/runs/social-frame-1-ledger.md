# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$89.3673** in 56583 calls; the last credit read $412.0466 → spent by credit $87.9534 (2026-11-11T09:00:24.626Z).

- 2026-11-11 03:58 UTC: Part B: Sol writes the sets — 1 calls, $0.0580
- 2026-11-11 03:59 UTC: Part B: the raters check the sets — 31 calls, $0.1467
- 2026-11-11 04:01 UTC: Part B: the raters check the sets — 30 calls, $0.1232
- 2026-11-11 04:04 UTC: Part C anchors — 1219 calls, $4.5150
- 2026-11-11 04:20 UTC: Part C clean — 3660 calls, $12.8575
- 2026-11-11 05:01 UTC: Part A rows neutral — 18959 calls, $26.9819
- 2026-11-11 06:20 UTC: Part A rows neutral — 6704 calls, $4.2961
- 2026-11-11 07:01 UTC: Part A rows rude — 25979 calls, $40.3888

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 9160 | 0 | 2969712 | 2775093 (250785) | $69.7808 |
| judge | 18315 | 0 | 17845733 | 3548757 (0) | $3.5590 |
| judge-referee | 1130 | 0 | 907042 | 178728 (83990) | $5.5869 |
| field | 11754 | 0 | 9392464 | 1935525 (0) | $1.9070 |
| warn | 15117 | 0 | 13166205 | 4655135 (0) | $3.6442 |
| warn-referee | 869 | 0 | 616645 | 130192 (69268) | $3.8028 |
| field-referee | 176 | 0 | 119529 | 26673 (15192) | $0.7587 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 1480 | 0 | 525126 | 575830 (0) | $34.0428 |
| aws-bedrock/claude-haiku-5-5 — field | 11754 | 0 | 9392464 | 1935525 (0) | $1.9070 |
| aws-bedrock/claude-haiku-5-5 — judge | 18315 | 0 | 17845733 | 3548757 (0) | $3.5590 |
| aws-bedrock/claude-haiku-5-5 — reply | 1080 | 0 | 402396 | 633115 (0) | $0.3568 |
| aws-bedrock/claude-haiku-5-5 — warn | 15117 | 0 | 13166205 | 4655135 (0) | $3.6442 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 1480 | 0 | 525126 | 606360 (0) | $14.2277 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 176 | 0 | 119529 | 26673 (15192) | $0.7587 |
| moonshot/kimi-k3 — judge-referee | 1051 | 0 | 827180 | 157727 (83990) | $4.8474 |
| moonshot/kimi-k3 — reply | 1080 | 0 | 430440 | 192571 (60444) | $4.1799 |
| moonshot/kimi-k3 — warn-referee | 869 | 0 | 616645 | 130192 (69268) | $3.8028 |
| openai/gpt-6-astra — reply | 1080 | 0 | 291324 | 160513 (63847) | $10.9389 |
| openai/gpt-6.1-sol — reply | 1080 | 0 | 291324 | 175760 (80217) | $2.3402 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 1480 | 0 | 381246 | 248954 (46277) | $1.6291 |
