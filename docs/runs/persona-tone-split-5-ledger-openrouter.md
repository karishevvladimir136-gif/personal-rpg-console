# Persona tone split 5 — OpenRouter ledger

Ceiling $150. Every check keeps the remaining ceiling of AUTHORITY_2 (issue #7) ($120 less its spend, read from the key since $280.5466); the writer's and the raters' checks kept GAME_PARTY_3's whole $150 instead (the rule before the freeze). Spent **$58.8964** in 47899 calls over 5 run(s). Every call is in `persona-tone-split-5-ledger-openrouter.json`. One door: OpenRouter (the Claude models through its Messages route at the list price; the others at OpenRouter's own charge, `usage.cost`).

- 2026-11-10 19:57 UTC: the writer (Sol, 120 + 25 candidates) — 16 calls, $0.4934 → `persona-tone-split-5-candidates.json`
- 2026-11-10 20:30 UTC: the raters (Opus, DeepSeek, GLM) — 344 calls, $1.3935 → `persona-tone-split-5-ratings.json` (stopped: the provider answered HTTP 429 http_429: Provider returned error deepseek/deepseek-v4-pro-0813 is temporarily rate-limited upstream. Please retry shortly, or add your own provider ke)
- 2026-11-10 21:11 UTC: the raters (Opus, DeepSeek, GLM) — 92 calls, $0.3278 → `persona-tone-split-5-ratings.json`
- 2026-11-11 00:13 UTC: part middle (haiku, glm, kimi, deepseek, sol, grok, astra, opus, fable) — resumed from persona-tone-split-5-part-middle.partial.json — 45138 calls, $54.9697 → `persona-tone-split-5-part-middle-20261110-211318.json` (stopped: the provider answered HTTP 429 http_429: Provider returned error deepseek/deepseek-v4-pro-0813 is temporarily rate-limited upstream. Please retry shortly, or add your own provider ke)
- 2026-11-11 02:17 UTC: part middle (haiku, glm, kimi, deepseek, sol, grok, astra, opus, fable) — resumed from persona-tone-split-5-part-middle.partial.json — 2309 calls, $1.7120 → `persona-tone-split-5-part-middle-20261110-211318.json`

| Role | Calls | Cost |
| --- | --- | --- |
| the writer (Sol) | 16 | $0.4934 |
| the raters | 436 | $1.7213 |
| subjects | 6497 | $41.1052 |
| the judges (Haiku) | 38864 | $8.0671 |
| the referee (Kimi) | 2086 | $7.5094 |

| Model — purpose | Calls | Input | Cache read | Output (of it reasoning) | Cost |
| --- | --- | --- | --- | --- | --- |
| openai/gpt-6.1-sol — writer | 16 | 10581 | 0 | 47220 (22844) | $0.4934 |
| z-ai/glm-5.3 — rater | 145 | 68491 | 2496 | 12616 (3276) | $0.1520 |
| claude-opus-5-5 — rater | 145 | 100867 | 0 | 33231 (0) | $1.0681 |
| deepseek/deepseek-v4-pro-0813 — rater | 146 | 70111 | 0 | 157684 (148842) | $0.5011 |
| z-ai/glm-5.3 — reply | 720 | 38720 | 159232 | 110436 (17412) | $0.5815 |
| claude-haiku-5-5 — field | 12955 | 10306713 | 0 | 2305021 (0) | $2.1832 |
| claude-haiku-5-5 — warn | 12955 | 11589008 | 0 | 3795511 (0) | $3.0567 |
| claude-haiku-5-5 — judge | 12954 | 13086977 | 0 | 3037108 (0) | $2.8273 |
| claude-opus-5-5 — reply | 722 | 273336 | 0 | 241061 (0) | $5.9146 |
| openai/gpt-6.1-sol — reply | 720 | 197928 | 0 | 112510 (45234) | $1.5210 |
| openai/gpt-6-astra — reply | 724 | 197928 | 0 | 102032 (33294) | $7.0809 |
| claude-fable-5-1 — reply | 720 | 273336 | 0 | 285978 (0) | $17.0323 |
| moonshotai/kimi-k3 — reply | 722 | 152040 | 138240 | 135532 (38678) | $2.5271 |
| claude-haiku-5-5 — reply | 720 | 273336 | 0 | 399152 (0) | $0.2269 |
| moonshotai/kimi-k3 — judge-referee | 1205 | 515255 | 443904 | 199532 (113040) | $4.6719 |
| moonshotai/kimi-k3 — warn-referee | 628 | 192380 | 259072 | 79773 (41001) | $1.8515 |
| x-ai/grok-4.7 — reply | 723 | 184920 | 901248 | 575118 (517041) | $4.2712 |
| moonshotai/kimi-k3 — field-referee | 253 | 133817 | 35840 | 38253 (21961) | $0.9860 |
| deepseek/deepseek-v4-pro-0813 — reply | 726 | 192072 | 0 | 653912 (585736) | $1.9499 |
