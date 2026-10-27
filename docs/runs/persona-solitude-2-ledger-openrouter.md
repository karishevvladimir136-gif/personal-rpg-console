# Persona solitude 2 — the OpenRouter ledger (Claude through the door, the open families, the judges)

Cap $40. Spent **$0.0110** in 7 calls over 1 run(s).
- 2026-10-27 04:25 UTC: persona-solitude-2: the smoke, one short call per family in M2's shape — 7 calls, $0.0110 → `persona-solitude-2-smoke-20261027-042511.json`

Per 1M tokens (input / cache read / cache write / output): Opus 5.5 `claude-opus-5-5` $4 / $0.2 / $5 / $20; Fable 5.1 `claude-fable-5-1` $10 / $0.25 / $12.5 / $50; Haiku 5.5 `claude-haiku-5-5` $0.1 / $0.01 / $0.125 / $0.5; GPT-6 Astra `gpt-6-astra` $10 / $1 / $12.5 / $50; DeepSeek V4 Pro `deepseek/deepseek-v4-pro-0813` $1.3 / $0.1 / $1.3 / $2.6; Kimi K3 `moonshotai/kimi-k3` $3 / $0.3 / $3 / $15; GLM 5.3 `z-ai/glm-5.3` $1.4 / $0.26 / $1.4 / $4.4; Grok 4.7 `x-ai/grok-4.7` $2 / $0.5 / $2 / $6; the judges Claude Haiku 5.5 and Claude Opus 5.5 at Anthropic's list prices. The open families are booked at OpenRouter's own charge (`usage.cost`); Astra's cached input at its published cache price (X1). Output tokens include reasoning.

| Model — purpose | Calls | Input (uncached) | Cache read | Cache write | Output (of it reasoning) | Cost |
| --- | --- | --- | --- | --- | --- | --- |
| claude-opus-5-5 — smoke | 1 | 36 | 0 | 0 | 63 | $0.0014 |
| claude-fable-5-1 — smoke | 1 | 36 | 0 | 0 | 127 | $0.0067 |
| claude-haiku-5-5 — smoke | 1 | 36 | 0 | 0 | 4 | $0.0000 |
| deepseek/deepseek-v4-pro-0813 — smoke | 1 | 26 | 0 | 0 | 64 (61) | $0.0002 |
| moonshotai/kimi-k3 — smoke | 1 | 149 | 0 | 0 | 22 (6) | $0.0008 |
| z-ai/glm-5.3 — smoke | 1 | 35 | 0 | 0 | 11 (8) | $0.0001 |
| x-ai/grok-4.7 — smoke | 1 | 119 | 1152 | 0 | 170 (156) | $0.0018 |

## Every call

| Run | # | Purpose | Model | Effort | In | Cache r/w | Out | Cost | s | Stop | Request id | Response id | Error |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-27 04:25 | 1 | smoke claude-opus-5-5 | claude-opus-5-5 | output_config.effort=medium | 36 | 0/0 | 63 | $0.00140 | 2.8 | end_turn | gen-1793075066-CaIQpyiRZu71M5uKNmoq | msg_011CgS75aBH9bv6UXTAPbeLd |  |
| 2026-10-27 04:25 | 2 | smoke claude-fable-5-1 | claude-fable-5-1 | output_config.effort=medium | 36 | 0/0 | 127 | $0.00671 | 4.8 | end_turn | gen-1793075072-RPYcCt5OiDePxnwcg2VL | msg_011CgS761Z226kBn8N1XnLEa |  |
| 2026-10-27 04:25 | 3 | smoke claude-haiku-5-5 | claude-haiku-5-5 | output_config.effort=medium | 36 | 0/0 | 4 | $0.00001 | 0.8 | end_turn | gen-1793075080-5RBJVIZe5KKT1iP71n6h | msg_011CgS76ZmkUDCpKq5RJu5vT |  |
| 2026-10-27 04:25 | 4 | smoke deepseek/deepseek-v4-pro-0813 | deepseek/deepseek-v4-pro-0813 | reasoning.effort=medium | 26 | 0/0 | 64 | $0.00020 | 1.1 | end_turn | gen-1793075091-wU8BCehlmUbGbWsY3H8g | gen-1793075091-wU8BCehlmUbGbWsY3H8g |  |
| 2026-10-27 04:25 | 5 | smoke moonshotai/kimi-k3 | moonshotai/kimi-k3 | reasoning.effort=medium | 149 | 0/0 | 22 | $0.00078 | 1.7 | end_turn | gen-1793075095-0ZrCcZqMAiIcw6DVFDDY | gen-1793075095-0ZrCcZqMAiIcw6DVFDDY |  |
| 2026-10-27 04:25 | 6 | smoke z-ai/glm-5.3 | z-ai/glm-5.3 | reasoning.effort=medium | 35 | 0/0 | 11 | $0.00010 | 5.1 | end_turn | gen-1793075099-ct9uLh9cFOp4krkcfKn1 | gen-1793075099-ct9uLh9cFOp4krkcfKn1 |  |
| 2026-10-27 04:25 | 7 | smoke x-ai/grok-4.7 | x-ai/grok-4.7 | reasoning.effort=medium | 119 | 1152/0 | 170 | $0.00183 | 3.3 | end_turn | gen-1793075107-zmTMDIobMOiau5R3Phr0 | gen-1793075107-zmTMDIobMOiau5R3Phr0 |  |
