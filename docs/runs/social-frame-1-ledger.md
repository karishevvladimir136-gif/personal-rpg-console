# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$111.7773** in 71223 calls; the last credit read $390.0974 → spent by credit $109.9026 (2026-11-11T10:02:24.051Z).

- 2026-11-11 03:58 UTC: Part B: Sol writes the sets — 1 calls, $0.0580
- 2026-11-11 03:59 UTC: Part B: the raters check the sets — 31 calls, $0.1467
- 2026-11-11 04:01 UTC: Part B: the raters check the sets — 30 calls, $0.1232
- 2026-11-11 04:04 UTC: Part C anchors — 1219 calls, $4.5150
- 2026-11-11 04:20 UTC: Part C clean — 3660 calls, $12.8575
- 2026-11-11 05:01 UTC: Part A rows neutral — 18959 calls, $26.9819
- 2026-11-11 06:20 UTC: Part A rows neutral — 6704 calls, $4.2961
- 2026-11-11 07:01 UTC: Part A rows rude — 25979 calls, $40.3888
- 2026-11-11 09:01 UTC: Part A rows warm — 14640 calls, $22.4100

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 11324 | 0 | 3701217 | 3343853 (302638) | $87.6331 |
| judge | 22626 | 0 | 22003926 | 4346034 (0) | $4.3734 |
| judge-referee | 1390 | 0 | 1113139 | 217950 (104850) | $6.7935 |
| field | 15094 | 0 | 12070460 | 2472947 (0) | $2.4435 |
| warn | 19428 | 0 | 16923516 | 5858448 (0) | $4.6216 |
| warn-referee | 1071 | 0 | 760892 | 155578 (81720) | $4.6163 |
| field-referee | 228 | 0 | 154898 | 33544 (18697) | $0.9679 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 1942 | 0 | 697462 | 728162 (0) | $43.3827 |
| aws-bedrock/claude-haiku-5-5 — field | 15094 | 0 | 12070460 | 2472947 (0) | $2.4435 |
| aws-bedrock/claude-haiku-5-5 — judge | 22626 | 0 | 22003926 | 4346034 (0) | $4.3734 |
| aws-bedrock/claude-haiku-5-5 — reply | 1307 | 0 | 486863 | 755695 (0) | $0.4265 |
| aws-bedrock/claude-haiku-5-5 — warn | 19428 | 0 | 16923516 | 5858448 (0) | $4.6216 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 1868 | 0 | 669921 | 735938 (0) | $17.3984 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 228 | 0 | 154898 | 33544 (18697) | $0.9679 |
| moonshot/kimi-k3 — judge-referee | 1311 | 0 | 1033277 | 196949 (104850) | $6.0541 |
| moonshot/kimi-k3 — reply | 1365 | 0 | 544069 | 239162 (72571) | $5.2196 |
| moonshot/kimi-k3 — warn-referee | 1071 | 0 | 760892 | 155578 (81720) | $4.6163 |
| openai/gpt-6-astra — reply | 1437 | 0 | 387747 | 212241 (83516) | $14.4895 |
| openai/gpt-6.1-sol — reply | 1289 | 0 | 347746 | 209624 (95398) | $2.7917 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 1716 | 0 | 444679 | 281041 (51153) | $1.8591 |
