# SOCIAL_FRAME_1 — ledger (llmapi.ai)

Ceiling $220 on APP_LLMAPI_KEY, read from its credit ($500.0000 at the session's first reading, before any call). One door: llmapi.ai, every call pinned with `X-No-Fallback: true`. The gateway returns no per-call charge on this account: each call is booked at the gateway's listed per-token price for the pinned provider (input and output, reasoning inside output), and the credit read at every spend check is the authority.

Booked **$35.2155** in 16941 calls; the last credit read $465.2103 → spent by credit $34.7897 (2026-11-11T05:50:29.015Z).

- 2026-11-11 03:58 UTC: Part B: Sol writes the sets — 1 calls, $0.0580
- 2026-11-11 03:59 UTC: Part B: the raters check the sets — 31 calls, $0.1467
- 2026-11-11 04:01 UTC: Part B: the raters check the sets — 30 calls, $0.1232
- 2026-11-11 04:04 UTC: Part C anchors — 1219 calls, $4.5150
- 2026-11-11 04:20 UTC: Part C clean — 3660 calls, $12.8575
- 2026-11-11 05:01 UTC: Part A rows neutral — 12000 calls, $17.5150

| Role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| rater-B | 61 | 0 | 49980 | 8232 (347) | $0.2700 |
| reply | 3373 | 0 | 1040719 | 1047231 (49924) | $29.9087 |
| judge | 6728 | 0 | 6667836 | 1128031 (0) | $1.2308 |
| judge-referee | 294 | 0 | 248822 | 51878 (15831) | $1.7095 |
| field | 2760 | 0 | 2205100 | 433796 (0) | $0.4374 |
| warn | 3530 | 0 | 3067506 | 976236 (0) | $0.7949 |
| warn-referee | 164 | 0 | 117043 | 21961 (11431) | $0.6805 |
| field-referee | 30 | 0 | 20395 | 4304 (2327) | $0.1257 |

| Model — role | Calls | Errors | Input | Output (of it reasoning) | Booked |
| --- | --- | --- | --- | --- | --- |
| aws-bedrock/claude-fable-5-1 — reply | 782 | 0 | 260772 | 285302 (0) | $16.8728 |
| aws-bedrock/claude-haiku-5-5 — field | 2760 | 0 | 2205100 | 433796 (0) | $0.4374 |
| aws-bedrock/claude-haiku-5-5 — judge | 6728 | 0 | 6667836 | 1128031 (0) | $1.2308 |
| aws-bedrock/claude-haiku-5-5 — reply | 192 | 0 | 69571 | 95208 (0) | $0.0546 |
| aws-bedrock/claude-haiku-5-5 — warn | 3530 | 0 | 3067506 | 976236 (0) | $0.7949 |
| aws-bedrock/claude-opus-5-5 — judge-referee | 79 | 0 | 79862 | 21001 (0) | $0.7395 |
| aws-bedrock/claude-opus-5-5 — rater-B | 30 | 0 | 30083 | 5485 (0) | $0.2300 |
| aws-bedrock/claude-opus-5-5 — reply | 732 | 0 | 242827 | 271205 (0) | $6.3954 |
| aws-bedrock/claude-sonnet-5-5 — reply | 400 | 0 | 122730 | 181990 (0) | $2.0654 |
| moonshot/kimi-k3 — field-referee | 30 | 0 | 20395 | 4304 (2327) | $0.1257 |
| moonshot/kimi-k3 — judge-referee | 215 | 0 | 168960 | 30877 (15831) | $0.9700 |
| moonshot/kimi-k3 — reply | 211 | 0 | 82545 | 34099 (9022) | $0.7591 |
| moonshot/kimi-k3 — warn-referee | 164 | 0 | 117043 | 21961 (11431) | $0.6805 |
| openai/gpt-6-astra — reply | 294 | 0 | 77064 | 39060 (13469) | $2.7236 |
| openai/gpt-6.1-sol — reply | 165 | 0 | 43254 | 24093 (9815) | $0.3274 |
| openai/gpt-6.1-sol — writer | 1 | 0 | 428 | 5713 (512) | $0.0580 |
| zai/glm-5.3 — rater-B | 31 | 0 | 19897 | 2747 (347) | $0.0399 |
| zai/glm-5.3 — reply | 597 | 0 | 141956 | 116274 (17618) | $0.7103 |
