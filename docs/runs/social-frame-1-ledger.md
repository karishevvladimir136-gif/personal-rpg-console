# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$48.7072** in 30173 calls; the last credit read $451.8005 → spent by credit $48.1995 (2026-11-11T06:50:28.743Z).

- 2026-11-11 03:58 UTC: Part B: Sol writes the sets — 1 calls, $0.0580
- 2026-11-11 03:59 UTC: Part B: the raters check the sets — 31 calls, $0.1467
- 2026-11-11 04:01 UTC: Part B: the raters check the sets — 30 calls, $0.1232
- 2026-11-11 04:04 UTC: Part C anchors — 1219 calls, $4.5150
- 2026-11-11 04:20 UTC: Part C clean — 3660 calls, $12.8575
- 2026-11-11 05:01 UTC: Part A rows neutral — 18959 calls, $26.9819
- 2026-11-11 06:20 UTC: Part A rows neutral — 6273 calls, $4.0247

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 5317 | 0 | 1661851 | 1518407 (107223) | $39.2072 |
| judge | 10631 | 0 | 10402155 | 1857266 (0) | $1.9688 |
| judge-referee | 530 | 0 | 435343 | 88500 (35928) | $2.8184 |
| field | 5774 | 0 | 4598288 | 920401 (0) | $0.9200 |
| warn | 7433 | 0 | 6441737 | 2052323 (0) | $1.6703 |
| warn-referee | 355 | 0 | 253641 | 48089 (25075) | $1.4823 |
| field-referee | 71 | 0 | 48238 | 11159 (6519) | $0.3121 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 940 | 0 | 317718 | 334458 (0) | $19.9001 |
| aws-bedrock/claude-haiku-5-5 — field | 5774 | 0 | 4598288 | 920401 (0) | $0.9200 |
| aws-bedrock/claude-haiku-5-5 — judge | 10631 | 0 | 10402155 | 1857266 (0) | $1.9688 |
| aws-bedrock/claude-haiku-5-5 — reply | 540 | 0 | 194988 | 269201 (0) | $0.1541 |
| aws-bedrock/claude-haiku-5-5 — warn | 7433 | 0 | 6441737 | 2052323 (0) | $1.6703 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 940 | 0 | 317718 | 336196 (0) | $7.9948 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 71 | 0 | 48238 | 11159 (6519) | $0.3121 |
| moonshot/kimi-k3 — judge-referee | 451 | 0 | 355481 | 67499 (35928) | $2.0789 |
| moonshot/kimi-k3 — reply | 540 | 0 | 210900 | 90353 (26888) | $1.9880 |
| moonshot/kimi-k3 — warn-referee | 355 | 0 | 253641 | 48089 (25075) | $1.4823 |
| openai/gpt-6-astra — reply | 540 | 0 | 141612 | 74125 (26485) | $5.1224 |
| openai/gpt-6.1-sol — reply | 477 | 0 | 124807 | 69255 (28170) | $0.9422 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 940 | 0 | 231378 | 162829 (25680) | $1.0404 |
