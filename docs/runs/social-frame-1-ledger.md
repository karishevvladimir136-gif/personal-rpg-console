# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$86.7795** in 52360 calls; the last credit read $414.6063 → spent by credit $85.3937 (2026-11-11T08:31:23.401Z).

- 2026-11-11 03:58 UTC: Part B: Sol writes the sets — 1 calls, $0.0580
- 2026-11-11 03:59 UTC: Part B: the raters check the sets — 31 calls, $0.1467
- 2026-11-11 04:01 UTC: Part B: the raters check the sets — 30 calls, $0.1232
- 2026-11-11 04:04 UTC: Part C anchors — 1219 calls, $4.5150
- 2026-11-11 04:20 UTC: Part C clean — 3660 calls, $12.8575
- 2026-11-11 05:01 UTC: Part A rows neutral — 18959 calls, $26.9819
- 2026-11-11 06:20 UTC: Part A rows neutral — 6704 calls, $4.2961
- 2026-11-11 07:01 UTC: Part A rows rude — 21756 calls, $37.8010

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 8546 | 0 | 2772877 | 2580799 (222324) | $68.7633 |
| judge | 17085 | 0 | 16660615 | 3284037 (0) | $3.3081 |
| judge-referee | 1034 | 0 | 831815 | 164153 (76120) | $5.1426 |
| field | 10790 | 0 | 8625724 | 1768605 (0) | $1.7469 |
| warn | 13887 | 0 | 12097051 | 4271780 (0) | $3.3456 |
| warn-referee | 797 | 0 | 565165 | 118108 (62570) | $3.4671 |
| field-referee | 159 | 0 | 107953 | 23609 (13237) | $0.6780 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 1480 | 0 | 525126 | 575830 (0) | $34.0428 |
| aws-bedrock/claude-haiku-5-5 — field | 10790 | 0 | 8625724 | 1768605 (0) | $1.7469 |
| aws-bedrock/claude-haiku-5-5 — judge | 17085 | 0 | 16660615 | 3284037 (0) | $3.3081 |
| aws-bedrock/claude-haiku-5-5 — reply | 908 | 0 | 336230 | 517192 (0) | $0.2922 |
| aws-bedrock/claude-haiku-5-5 — warn | 13887 | 0 | 12097051 | 4271780 (0) | $3.3456 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 1475 | 0 | 523161 | 603793 (0) | $14.1685 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 159 | 0 | 107953 | 23609 (13237) | $0.6780 |
| moonshot/kimi-k3 — judge-referee | 955 | 0 | 751953 | 143152 (76120) | $4.4031 |
| moonshot/kimi-k3 — reply | 1023 | 0 | 407144 | 182155 (57306) | $3.9538 |
| moonshot/kimi-k3 — warn-referee | 797 | 0 | 565165 | 118108 (62570) | $3.4671 |
| openai/gpt-6-astra — reply | 1080 | 0 | 291324 | 160513 (63847) | $10.9389 |
| openai/gpt-6.1-sol — reply | 885 | 0 | 237285 | 140069 (62267) | $1.8753 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 1295 | 0 | 329877 | 219257 (38904) | $1.4266 |
