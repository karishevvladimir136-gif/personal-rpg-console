# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$17.1138** in 4498 calls; the last credit read $483.0304 → spent by credit $16.9696 (2026-11-11T04:46:56.155Z).

- 2026-11-11 03:58 UTC: Part B: Sol writes the sets — 1 calls, $0.0580
- 2026-11-11 03:59 UTC: Part B: the raters check the sets — 31 calls, $0.1467
- 2026-11-11 04:01 UTC: Part B: the raters check the sets — 30 calls, $0.1232
- 2026-11-11 04:04 UTC: Part C anchors — 1219 calls, $4.5150
- 2026-11-11 04:20 UTC: Part C clean — 3217 calls, $12.2707

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 1456 | 0 | 420999 | 560563 (10319) | $15.6216 |
| judge | 2912 | 0 | 2976786 | 448468 (0) | $0.5219 |
| judge-referee | 68 | 0 | 69310 | 18253 (0) | $0.6423 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 400 | 0 | 122730 | 168156 (0) | $9.6351 |
| aws-bedrock/claude-haiku-5-5 — judge | 2912 | 0 | 2976786 | 448468 (0) | $0.5219 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 68 | 0 | 69310 | 18253 (0) | $0.6423 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 400 | 0 | 122730 | 167182 (0) | $3.8346 |
| aws-bedrock/claude-sonnet-5-5 — reply | 334 | 0 | 102489 | 152444 (0) | $1.7294 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 322 | 0 | 73050 | 72781 (10319) | $0.4225 |
