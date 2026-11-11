# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$132.8914** in 89482 calls; the last credit read $369.3183 → spent by credit $130.6817 (2026-11-11T11:32:40.183Z).

- 2026-11-11 03:58 UTC: Part B: Sol writes the sets — 1 calls, $0.0580
- 2026-11-11 03:59 UTC: Part B: the raters check the sets — 31 calls, $0.1467
- 2026-11-11 04:01 UTC: Part B: the raters check the sets — 30 calls, $0.1232
- 2026-11-11 04:04 UTC: Part C anchors — 1219 calls, $4.5150
- 2026-11-11 04:20 UTC: Part C clean — 3660 calls, $12.8575
- 2026-11-11 05:01 UTC: Part A rows neutral — 18959 calls, $26.9819
- 2026-11-11 06:20 UTC: Part A rows neutral — 6704 calls, $4.2961
- 2026-11-11 07:01 UTC: Part A rows rude — 25979 calls, $40.3888
- 2026-11-11 09:01 UTC: Part A rows warm — 25699 calls, $32.7378
- 2026-11-11 11:02 UTC: Part A rows curt — 7200 calls, $10.7862

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 14014 | 0 | 4577633 | 4018923 (381131) | $102.9111 |
| judge | 27995 | 0 | 27161637 | 5368583 (0) | $5.4005 |
| judge-referee | 1742 | 0 | 1389044 | 273694 (135626) | $8.4574 |
| field | 19274 | 0 | 15398450 | 3160181 (0) | $3.1199 |
| warn | 24796 | 0 | 21579573 | 7342361 (0) | $5.8291 |
| warn-referee | 1298 | 0 | 923202 | 186621 (97704) | $5.5689 |
| field-referee | 301 | 0 | 204528 | 44190 (24599) | $1.2764 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 2254 | 0 | 811133 | 825806 (0) | $49.4016 |
| aws-bedrock/claude-haiku-5-5 — field | 19274 | 0 | 15398450 | 3160181 (0) | $3.1199 |
| aws-bedrock/claude-haiku-5-5 — judge | 27995 | 0 | 27161637 | 5368583 (0) | $5.4005 |
| aws-bedrock/claude-haiku-5-5 — reply | 1723 | 0 | 641063 | 976538 (0) | $0.5524 |
| aws-bedrock/claude-haiku-5-5 — warn | 24796 | 0 | 21579573 | 7342361 (0) | $5.8291 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 2212 | 0 | 796069 | 847889 (0) | $20.1421 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 301 | 0 | 204528 | 44190 (24599) | $1.2764 |
| moonshot/kimi-k3 — judge-referee | 1663 | 0 | 1309182 | 252693 (135626) | $7.7179 |
| moonshot/kimi-k3 — reply | 1762 | 0 | 700981 | 304960 (91681) | $6.6773 |
| moonshot/kimi-k3 — warn-referee | 1298 | 0 | 923202 | 186621 (97704) | $5.5689 |
| openai/gpt-6-astra — reply | 1810 | 0 | 486758 | 264486 (102559) | $18.0919 |
| openai/gpt-6.1-sol — reply | 1718 | 0 | 462888 | 278638 (125926) | $3.7122 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 2135 | 0 | 556011 | 338616 (60965) | $2.2683 |
