# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$16.4043** in 4058 calls; the last credit read $483.8550 → spent by credit $16.1450 (2026-11-11T04:40:40.357Z).

- 2026-11-11 03:58 UTC: Part B: Sol writes the sets — 1 calls, $0.0580
- 2026-11-11 03:59 UTC: Part B: the raters check the sets — 31 calls, $0.1467
- 2026-11-11 04:01 UTC: Part B: the raters check the sets — 30 calls, $0.1232
- 2026-11-11 04:04 UTC: Part C anchors — 1219 calls, $4.5150
- 2026-11-11 04:20 UTC: Part C clean — 2777 calls, $11.5613

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 1313 | 0 | 382114 | 510634 (8431) | $15.0485 |
| judge | 2624 | 0 | 2677768 | 405716 (0) | $0.4706 |
| judge-referee | 59 | 0 | 60645 | 15730 (0) | $0.5572 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 397 | 0 | 121700 | 166908 (0) | $9.5624 |
| aws-bedrock/claude-haiku-5-5 — judge | 2624 | 0 | 2677768 | 405716 (0) | $0.4706 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 59 | 0 | 60645 | 15730 (0) | $0.5572 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 395 | 0 | 121086 | 164542 (0) | $3.7752 |
| aws-bedrock/claude-sonnet-5-5 — reply | 266 | 0 | 81615 | 121162 (0) | $1.3748 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 255 | 0 | 57713 | 58022 (8431) | $0.3361 |
