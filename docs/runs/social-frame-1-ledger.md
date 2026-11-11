# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$153.5304** in 108099 calls; the last credit read $349.1984 → spent by credit $150.8016 (2026-11-11T13:03:02.905Z).

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
- 2026-11-11 13:01 UTC: Part A rows flattering — 480 calls, $0.7586

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 16753 | 0 | 5453989 | 4677934 (456967) | $117.6136 |
| judge | 33469 | 0 | 32411565 | 6403228 (0) | $6.4428 |
| judge-referee | 2111 | 0 | 1680937 | 329795 (165733) | $10.1746 |
| field | 23536 | 0 | 18785754 | 3852041 (0) | $3.8046 |
| warn | 30270 | 0 | 26319017 | 8854096 (0) | $7.0589 |
| warn-referee | 1526 | 0 | 1085556 | 218630 (114851) | $6.5361 |
| field-referee | 372 | 0 | 253661 | 54053 (29909) | $1.5718 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 2533 | 0 | 911874 | 915304 (0) | $54.8839 |
| aws-bedrock/claude-haiku-5-5 — field | 23536 | 0 | 18785754 | 3852041 (0) | $3.8046 |
| aws-bedrock/claude-haiku-5-5 — judge | 33469 | 0 | 32411565 | 6403228 (0) | $6.4428 |
| aws-bedrock/claude-haiku-5-5 — reply | 2168 | 0 | 801844 | 1189925 (0) | $0.6751 |
| aws-bedrock/claude-haiku-5-5 — warn | 30270 | 0 | 26319017 | 8854096 (0) | $7.0589 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 2575 | 0 | 927338 | 959737 (0) | $22.9041 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 372 | 0 | 253661 | 54053 (29909) | $1.5718 |
| moonshot/kimi-k3 — judge-referee | 2032 | 0 | 1601075 | 308794 (165733) | $9.4351 |
| moonshot/kimi-k3 — reply | 2169 | 0 | 859649 | 373231 (111659) | $8.1774 |
| moonshot/kimi-k3 — warn-referee | 1526 | 0 | 1085556 | 218630 (114851) | $6.5361 |
| openai/gpt-6-astra — reply | 2170 | 0 | 581062 | 316250 (122156) | $21.6231 |
| openai/gpt-6.1-sol — reply | 2168 | 0 | 580488 | 343635 (151844) | $4.5973 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 2570 | 0 | 669004 | 397862 (71308) | $2.6872 |
