# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$44.6824** in 23900 calls; the last credit read $455.7684 → spent by credit $44.2316 (2026-11-11T06:19:43.241Z).

- 2026-11-11 03:58 UTC: Part B: Sol writes the sets — 1 calls, $0.0580
- 2026-11-11 03:59 UTC: Part B: the raters check the sets — 31 calls, $0.1467
- 2026-11-11 04:01 UTC: Part B: the raters check the sets — 30 calls, $0.1232
- 2026-11-11 04:04 UTC: Part C anchors — 1219 calls, $4.5150
- 2026-11-11 04:20 UTC: Part C clean — 3660 calls, $12.8575
- 2026-11-11 05:01 UTC: Part A rows neutral — 18959 calls, $26.9819

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 4397 | 0 | 1375013 | 1300688 (76422) | $37.1918 |
| judge | 8779 | 0 | 8639401 | 1512579 (0) | $1.6202 |
| judge-referee | 412 | 0 | 342275 | 69594 (25308) | $2.2556 |
| field | 4354 | 0 | 3477206 | 684691 (0) | $0.6901 |
| warn | 5577 | 0 | 4845089 | 1547764 (0) | $1.2584 |
| warn-referee | 269 | 0 | 192444 | 36207 (18753) | $1.1204 |
| field-referee | 50 | 0 | 34117 | 7704 (4401) | $0.2179 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 940 | 0 | 317718 | 334458 (0) | $19.9001 |
| aws-bedrock/claude-haiku-5-5 — field | 4354 | 0 | 3477206 | 684691 (0) | $0.6901 |
| aws-bedrock/claude-haiku-5-5 — judge | 8779 | 0 | 8639401 | 1512579 (0) | $1.6202 |
| aws-bedrock/claude-haiku-5-5 — reply | 310 | 0 | 111798 | 153011 (0) | $0.0877 |
| aws-bedrock/claude-haiku-5-5 — warn | 5577 | 0 | 4845089 | 1547764 (0) | $1.2584 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 940 | 0 | 317718 | 336196 (0) | $7.9948 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 50 | 0 | 34117 | 7704 (4401) | $0.2179 |
| moonshot/kimi-k3 — judge-referee | 333 | 0 | 262413 | 48593 (25308) | $1.5161 |
| moonshot/kimi-k3 — reply | 356 | 0 | 139190 | 59275 (17225) | $1.3067 |
| moonshot/kimi-k3 — warn-referee | 269 | 0 | 192444 | 36207 (18753) | $1.1204 |
| openai/gpt-6-astra — reply | 478 | 0 | 125405 | 64641 (22513) | $4.4861 |
| openai/gpt-6.1-sol — reply | 266 | 0 | 69780 | 39234 (16113) | $0.5319 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 707 | 0 | 170674 | 131883 (20571) | $0.8192 |
