# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$143.7904** in 96682 calls; the last credit read $358.4980 → spent by credit $141.5020 (2026-11-11T12:02:47.167Z).

- 2026-11-11 03:58 UTC: Part B: Sol writes the sets — 1 calls, $0.0580
- 2026-11-11 03:59 UTC: Part B: the raters check the sets — 31 calls, $0.1467
- 2026-11-11 04:01 UTC: Part B: the raters check the sets — 30 calls, $0.1232
- 2026-11-11 04:04 UTC: Part C anchors — 1219 calls, $4.5150
- 2026-11-11 04:20 UTC: Part C clean — 3660 calls, $12.8575
- 2026-11-11 05:01 UTC: Part A rows neutral — 18959 calls, $26.9819
- 2026-11-11 06:20 UTC: Part A rows neutral — 6704 calls, $4.2961
- 2026-11-11 07:01 UTC: Part A rows rude — 25979 calls, $40.3888
- 2026-11-11 09:01 UTC: Part A rows warm — 25699 calls, $32.7378
- 2026-11-11 11:02 UTC: Part A rows curt — 14400 calls, $21.6853

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 15071 | 0 | 4925492 | 4286317 (407471) | $111.5204 |
| judge | 30113 | 0 | 29207097 | 5764706 (0) | $5.8031 |
| judge-referee | 1881 | 0 | 1498635 | 295262 (147408) | $9.1097 |
| field | 20932 | 0 | 16725688 | 3414023 (0) | $3.3796 |
| warn | 26913 | 0 | 23424680 | 7933644 (0) | $6.3093 |
| warn-referee | 1384 | 0 | 984847 | 199389 (104808) | $5.9454 |
| field-referee | 326 | 0 | 221873 | 48630 (27374) | $1.3951 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 2488 | 0 | 895537 | 901644 (0) | $54.0376 |
| aws-bedrock/claude-haiku-5-5 — field | 20932 | 0 | 16725688 | 3414023 (0) | $3.3796 |
| aws-bedrock/claude-haiku-5-5 — judge | 30113 | 0 | 29207097 | 5764706 (0) | $5.8031 |
| aws-bedrock/claude-haiku-5-5 — reply | 1831 | 0 | 680267 | 1029143 (0) | $0.5826 |
| aws-bedrock/claude-haiku-5-5 — warn | 26913 | 0 | 23424680 | 7933644 (0) | $6.3093 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 2406 | 0 | 866091 | 907096 (0) | $21.6063 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 326 | 0 | 221873 | 48630 (27374) | $1.3951 |
| moonshot/kimi-k3 — judge-referee | 1802 | 0 | 1418773 | 274261 (147408) | $8.3702 |
| moonshot/kimi-k3 — reply | 1903 | 0 | 755905 | 329545 (99326) | $7.2109 |
| moonshot/kimi-k3 — warn-referee | 1384 | 0 | 984847 | 199389 (104808) | $5.9454 |
| openai/gpt-6-astra — reply | 1970 | 0 | 528842 | 288670 (112314) | $19.7219 |
| openai/gpt-6.1-sol — reply | 1821 | 0 | 489687 | 293426 (131882) | $3.9136 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 2252 | 0 | 586433 | 354803 (63949) | $2.3821 |
