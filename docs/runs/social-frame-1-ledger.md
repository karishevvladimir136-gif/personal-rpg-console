# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$62.3635** in 37804 calls; the last credit read $438.4385 → spent by credit $61.5615 (2026-11-11T07:30:57.895Z).

- 2026-11-11 03:58 UTC: Part B: Sol writes the sets — 1 calls, $0.0580
- 2026-11-11 03:59 UTC: Part B: the raters check the sets — 31 calls, $0.1467
- 2026-11-11 04:01 UTC: Part B: the raters check the sets — 30 calls, $0.1232
- 2026-11-11 04:04 UTC: Part C anchors — 1219 calls, $4.5150
- 2026-11-11 04:20 UTC: Part C clean — 3660 calls, $12.8575
- 2026-11-11 05:01 UTC: Part A rows neutral — 18959 calls, $26.9819
- 2026-11-11 06:20 UTC: Part A rows neutral — 6704 calls, $4.2961
- 2026-11-11 07:01 UTC: Part A rows rude — 7200 calls, $13.3850

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 6432 | 0 | 2042863 | 1874939 (144845) | $49.8875 |
| judge | 12844 | 0 | 12546983 | 2351025 (0) | $2.4302 |
| judge-referee | 709 | 0 | 575941 | 115056 (49933) | $3.6385 |
| field | 7500 | 0 | 5982406 | 1211965 (0) | $1.2042 |
| warn | 9645 | 0 | 8377829 | 2814484 (0) | $2.2450 |
| warn-referee | 501 | 0 | 356466 | 71972 (38264) | $2.1490 |
| field-referee | 111 | 0 | 74988 | 17069 (9824) | $0.4810 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 1158 | 0 | 401360 | 431844 (0) | $25.6058 |
| aws-bedrock/claude-haiku-5-5 — field | 7500 | 0 | 5982406 | 1211965 (0) | $1.2042 |
| aws-bedrock/claude-haiku-5-5 — judge | 12844 | 0 | 12546983 | 2351025 (0) | $2.4302 |
| aws-bedrock/claude-haiku-5-5 — reply | 650 | 0 | 237268 | 342698 (0) | $0.1951 |
| aws-bedrock/claude-haiku-5-5 — warn | 9645 | 0 | 8377829 | 2814484 (0) | $2.2450 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 1108 | 0 | 382360 | 418986 (0) | $9.9092 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 111 | 0 | 74988 | 17069 (9824) | $0.4810 |
| moonshot/kimi-k3 — judge-referee | 630 | 0 | 496079 | 94055 (49933) | $2.8991 |
| moonshot/kimi-k3 — reply | 692 | 0 | 272744 | 117996 (34993) | $2.5882 |
| moonshot/kimi-k3 — warn-referee | 501 | 0 | 356466 | 71972 (38264) | $2.1490 |
| openai/gpt-6-astra — reply | 723 | 0 | 192142 | 102397 (38412) | $7.0413 |
| openai/gpt-6.1-sol — reply | 643 | 0 | 170164 | 97308 (41081) | $1.3134 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 1058 | 0 | 264095 | 181720 (30359) | $1.1693 |
