# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$119.8818** in 78253 calls; the last credit read $382.1169 → spent by credit $117.8831 (2026-11-11T10:32:23.087Z).

- 2026-11-11 03:58 UTC: Part B: Sol writes the sets — 1 calls, $0.0580
- 2026-11-11 03:59 UTC: Part B: the raters check the sets — 31 calls, $0.1467
- 2026-11-11 04:01 UTC: Part B: the raters check the sets — 30 calls, $0.1232
- 2026-11-11 04:04 UTC: Part C anchors — 1219 calls, $4.5150
- 2026-11-11 04:20 UTC: Part C clean — 3660 calls, $12.8575
- 2026-11-11 05:01 UTC: Part A rows neutral — 18959 calls, $26.9819
- 2026-11-11 06:20 UTC: Part A rows neutral — 6704 calls, $4.2961
- 2026-11-11 07:01 UTC: Part A rows rude — 25979 calls, $40.3888
- 2026-11-11 09:01 UTC: Part A rows warm — 21670 calls, $30.5145

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 12348 | 0 | 4040036 | 3605391 (335639) | $93.3841 |
| judge | 24687 | 0 | 23991205 | 4753164 (0) | $4.7757 |
| judge-referee | 1522 | 0 | 1216457 | 239091 (116589) | $7.4206 |
| field | 16710 | 0 | 13359954 | 2744316 (0) | $2.7082 |
| warn | 21489 | 0 | 18717025 | 6443673 (0) | $5.0935 |
| warn-referee | 1177 | 0 | 837181 | 170595 (89464) | $5.0705 |
| field-referee | 258 | 0 | 174794 | 38459 (21663) | $1.1013 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 2020 | 0 | 726594 | 752603 (0) | $44.8961 |
| aws-bedrock/claude-haiku-5-5 — field | 16710 | 0 | 13359954 | 2744316 (0) | $2.7082 |
| aws-bedrock/claude-haiku-5-5 — judge | 24687 | 0 | 23991205 | 4753164 (0) | $4.7757 |
| aws-bedrock/claude-haiku-5-5 — reply | 1463 | 0 | 545281 | 841753 (0) | $0.4754 |
| aws-bedrock/claude-haiku-5-5 — warn | 21489 | 0 | 18717025 | 6443673 (0) | $5.0935 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 2020 | 0 | 726594 | 786755 (0) | $18.6415 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 258 | 0 | 174794 | 38459 (21663) | $1.1013 |
| moonshot/kimi-k3 — judge-referee | 1443 | 0 | 1136595 | 218090 (116589) | $6.6811 |
| moonshot/kimi-k3 — reply | 1538 | 0 | 613064 | 269405 (82192) | $5.8803 |
| moonshot/kimi-k3 — warn-referee | 1177 | 0 | 837181 | 170595 (89464) | $5.0705 |
| openai/gpt-6-astra — reply | 1620 | 0 | 437256 | 239170 (93570) | $16.3311 |
| openai/gpt-6.1-sol — reply | 1422 | 0 | 383836 | 232119 (105552) | $3.0889 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 1865 | 0 | 484681 | 301596 (54325) | $2.0056 |
