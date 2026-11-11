# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$164.0344** in 114819 calls; the last credit read $338.7809 → spent by credit $161.2191 (2026-11-11T13:31:26.898Z).

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
- 2026-11-11 13:01 UTC: Part A rows flattering — 7200 calls, $11.2626

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 17735 | 0 | 5788446 | 4935321 (481750) | $125.8766 |
| judge | 35437 | 0 | 34310955 | 6769555 (0) | $6.8159 |
| judge-referee | 2258 | 0 | 1797758 | 351998 (177511) | $10.8581 |
| field | 25078 | 0 | 20020598 | 4103673 (0) | $4.0539 |
| warn | 32239 | 0 | 28034647 | 9423697 (0) | $7.5153 |
| warn-referee | 1621 | 0 | 1153641 | 232489 (122477) | $6.9483 |
| field-referee | 389 | 0 | 265479 | 56133 (30914) | $1.6384 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 2745 | 0 | 992266 | 985941 (0) | $59.2197 |
| aws-bedrock/claude-haiku-5-5 — field | 25078 | 0 | 20020598 | 4103673 (0) | $4.0539 |
| aws-bedrock/claude-haiku-5-5 — judge | 35437 | 0 | 34310955 | 6769555 (0) | $6.8159 |
| aws-bedrock/claude-haiku-5-5 — reply | 2268 | 0 | 839830 | 1243793 (0) | $0.7059 |
| aws-bedrock/claude-haiku-5-5 — warn | 32239 | 0 | 28034647 | 9423697 (0) | $7.5153 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 2757 | 0 | 996228 | 1018532 (0) | $24.3556 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 389 | 0 | 265479 | 56133 (30914) | $1.6384 |
| moonshot/kimi-k3 — judge-referee | 2179 | 0 | 1717896 | 330997 (177511) | $10.1186 |
| moonshot/kimi-k3 — reply | 2291 | 0 | 908125 | 393070 (117392) | $8.6204 |
| moonshot/kimi-k3 — warn-referee | 1621 | 0 | 1153641 | 232489 (122477) | $6.9483 |
| openai/gpt-6-astra — reply | 2339 | 0 | 626529 | 341202 (132013) | $23.3254 |
| openai/gpt-6.1-sol — reply | 2261 | 0 | 605573 | 358146 (158200) | $4.7926 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 2674 | 0 | 697165 | 412647 (74145) | $2.7917 |
