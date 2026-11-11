# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$48.9785** in 30604 calls; the last credit read $451.4502 → spent by credit $48.5498 (2026-11-11T07:00:13.239Z).

- 2026-11-11 03:58 UTC: Part B: Sol writes the sets — 1 calls, $0.0580
- 2026-11-11 03:59 UTC: Part B: the raters check the sets — 31 calls, $0.1467
- 2026-11-11 04:01 UTC: Part B: the raters check the sets — 30 calls, $0.1232
- 2026-11-11 04:04 UTC: Part C anchors — 1219 calls, $4.5150
- 2026-11-11 04:20 UTC: Part C clean — 3660 calls, $12.8575
- 2026-11-11 05:01 UTC: Part A rows neutral — 18959 calls, $26.9819
- 2026-11-11 06:20 UTC: Part A rows neutral — 6704 calls, $4.2961

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 5380 | 0 | 1678656 | 1528027 (110873) | $39.3370 |
| judge | 10757 | 0 | 10522533 | 1885596 (0) | $1.9951 |
| judge-referee | 540 | 0 | 443510 | 90445 (37122) | $2.8721 |
| field | 5876 | 0 | 4678474 | 936889 (0) | $0.9363 |
| warn | 7559 | 0 | 6549961 | 2083398 (0) | $1.6967 |
| warn-referee | 356 | 0 | 254331 | 48287 (25204) | $1.4873 |
| field-referee | 74 | 0 | 50321 | 11674 (6845) | $0.3261 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 940 | 0 | 317718 | 334458 (0) | $19.9001 |
| aws-bedrock/claude-haiku-5-5 — field | 5876 | 0 | 4678474 | 936889 (0) | $0.9363 |
| aws-bedrock/claude-haiku-5-5 — judge | 10757 | 0 | 10522533 | 1885596 (0) | $1.9951 |
| aws-bedrock/claude-haiku-5-5 — reply | 540 | 0 | 194988 | 269201 (0) | $0.1541 |
| aws-bedrock/claude-haiku-5-5 — warn | 7559 | 0 | 6549961 | 2083398 (0) | $1.6967 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 940 | 0 | 317718 | 336196 (0) | $7.9948 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 74 | 0 | 50321 | 11674 (6845) | $0.3261 |
| moonshot/kimi-k3 — judge-referee | 461 | 0 | 363648 | 69444 (37122) | $2.1326 |
| moonshot/kimi-k3 — reply | 540 | 0 | 210900 | 90353 (26888) | $1.9880 |
| moonshot/kimi-k3 — warn-referee | 356 | 0 | 254331 | 48287 (25204) | $1.4873 |
| openai/gpt-6-astra — reply | 540 | 0 | 141612 | 74125 (26485) | $5.1224 |
| openai/gpt-6.1-sol — reply | 540 | 0 | 141612 | 78875 (31820) | $1.0720 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 940 | 0 | 231378 | 162829 (25680) | $1.0404 |
