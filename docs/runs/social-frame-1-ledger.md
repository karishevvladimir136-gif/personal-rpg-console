# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$175.2421** in 122259 calls; the last credit read $327.8173 → spent by credit $172.1827 (2026-11-11T14:02:22.889Z).

- 2026-11-11 03:58 UTC: Part B: Sol writes the sets — 1 calls, $0.0580
- 2026-11-11 03:59 UTC: Part B: the raters check the sets — 31 calls, $0.1467
- 2026-11-11 04:01 UTC: Part B: the raters check the sets — 30 calls, $0.1232
- 2026-11-11 04:04 UTC: Part C anchors — 1219 calls, $4.5150
- 2026-11-11 04:20 UTC: Part C clean — 3660 calls, $12.8575
- 2026-11-11 05:01 UTC: Part A rows neutral — 18959 calls, $26.9819
- 2026-11-11 06:20 UTC: Part A rows neutral — 6704 calls, $4.2961
- 2026-11-11 07:01 UTC: Part A rows rude — 25979 calls, $40.3888
- 2026-11-11 09:01 UTC: Part A rows warm — 25699 calls, $32.7378
- 2026-11-11 11:02 UTC: Part A rows curt — 25337 calls, $30.6667
- 2026-11-11 13:01 UTC: Part A rows flattering — 14640 calls, $22.4703

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 18832 | 0 | 6161399 | 5218023 (510550) | $134.6465 |
| judge | 37627 | 0 | 36413606 | 7172758 (0) | $7.2277 |
| judge-referee | 2404 | 0 | 1913102 | 372527 (187823) | $11.5121 |
| field | 26750 | 0 | 21357992 | 4373215 (0) | $4.3224 |
| warn | 34430 | 0 | 29937406 | 10050191 (0) | $8.0188 |
| warn-referee | 1732 | 0 | 1232894 | 247020 (129773) | $7.4040 |
| field-referee | 422 | 0 | 287918 | 61258 (33862) | $1.7826 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 2968 | 0 | 1076949 | 1058741 (0) | $63.7065 |
| aws-bedrock/claude-haiku-5-5 — field | 26750 | 0 | 21357992 | 4373215 (0) | $4.3224 |
| aws-bedrock/claude-haiku-5-5 — judge | 37627 | 0 | 36413606 | 7172758 (0) | $7.2277 |
| aws-bedrock/claude-haiku-5-5 — reply | 2391 | 0 | 886489 | 1307002 (0) | $0.7421 |
| aws-bedrock/claude-haiku-5-5 — warn | 34430 | 0 | 29937406 | 10050191 (0) | $8.0188 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 2946 | 0 | 1067802 | 1078864 (0) | $25.8485 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 422 | 0 | 287918 | 61258 (33862) | $1.7826 |
| moonshot/kimi-k3 — judge-referee | 2325 | 0 | 1833240 | 351526 (187823) | $10.7726 |
| moonshot/kimi-k3 — reply | 2436 | 0 | 965753 | 419526 (127002) | $9.1901 |
| moonshot/kimi-k3 — warn-referee | 1732 | 0 | 1232894 | 247020 (129773) | $7.4040 |
| openai/gpt-6-astra — reply | 2529 | 0 | 677738 | 367937 (141750) | $25.1742 |
| openai/gpt-6.1-sol — reply | 2368 | 0 | 634215 | 373589 (164210) | $5.0043 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 2794 | 0 | 729723 | 430374 (77588) | $2.9153 |
