# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$197.7042** in 142044 calls; the last credit read $305.4778 → spent by credit $194.5222 (2026-11-11T15:49:31.074Z).

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
- 2026-11-11 13:01 UTC: Part A rows flattering — 25760 calls, $32.9141
- 2026-11-11 15:03 UTC: Part B — 8653 calls, $12.0098
- 2026-11-11 15:49 UTC: Part B — 12 calls, $0.0085

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 23340 | 4 | 7155831 | 6043400 (596055) | $152.8633 |
| judge | 40891 | 0 | 39549051 | 7788994 (0) | $7.8494 |
| judge-referee | 2621 | 0 | 2084166 | 405126 (205192) | $12.5143 |
| field | 29310 | 0 | 23393410 | 4793920 (0) | $4.7363 |
| warn | 37693 | 0 | 32765643 | 10973908 (0) | $8.7635 |
| warn-referee | 1882 | 0 | 1339294 | 267724 (140689) | $8.0337 |
| field-referee | 464 | 0 | 316709 | 67177 (37114) | $1.9578 |
| choice | 5760 | 0 | 3346942 | 497609 (0) | $0.5835 |
| choice-referee | 21 | 0 | 9157 | 3134 (2008) | $0.0745 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 3416 | 0 | 1176897 | 1154639 (0) | $69.5009 |
| aws-bedrock/claude-fable-5-2 — reply | 360 | 0 | 66690 | 57550 (0) | $2.8355 |
| aws-bedrock/claude-haiku-5-5 — choice | 5760 | 0 | 3346942 | 497609 (0) | $0.5835 |
| aws-bedrock/claude-haiku-5-5 — field | 29310 | 0 | 23393410 | 4793920 (0) | $4.7363 |
| aws-bedrock/claude-haiku-5-5 — judge | 40891 | 0 | 39549051 | 7788994 (0) | $7.8494 |
| aws-bedrock/claude-haiku-5-5 — reply | 3060 | 0 | 1070250 | 1561161 (0) | $0.8876 |
| aws-bedrock/claude-haiku-5-5 — warn | 37693 | 0 | 32765643 | 10973908 (0) | $8.7635 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 3460 | 0 | 1192980 | 1196004 (0) | $28.6920 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — choice-referee | 21 | 0 | 9157 | 3134 (2008) | $0.0745 |
| moonshot/kimi-k3 — field-referee | 464 | 0 | 316709 | 67177 (37114) | $1.9578 |
| moonshot/kimi-k3 — judge-referee | 2542 | 0 | 2004304 | 384125 (205192) | $11.7748 |
| moonshot/kimi-k3 — reply | 3063 | 3 | 1140570 | 520187 (164870) | $11.2245 |
| moonshot/kimi-k3 — warn-referee | 1882 | 0 | 1339294 | 267724 (140689) | $8.0337 |
| openai/gpt-6-astra — reply | 3060 | 0 | 764676 | 411227 (152635) | $28.2081 |
| openai/gpt-6.1-sol — reply | 3060 | 0 | 764676 | 445384 (189014) | $5.9832 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 3461 | 1 | 856362 | 515258 (89536) | $3.4660 |
