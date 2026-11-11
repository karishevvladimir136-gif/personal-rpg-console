# Persona tone split 5 — OpenRouter ledger

Ceiling $150. Every check keeps the remaining ceiling of AUTHORITY_2 (issue #7) ($120 less its spend, read from the key since $280.5466); the writer's and the raters' checks kept GAME_PARTY_3's whole $150 instead (the rule before the freeze). Spent **$94.7136** in 82186 calls over 6 run(s). Every call is in `persona-tone-split-5-ledger-openrouter.json`. One door: OpenRouter (the Claude models through its Messages route at the list price; the others at OpenRouter's own charge, `usage.cost`).

- 2026-11-10 19:57 UTC: the writer (Sol, 120 + 25 candidates) — 16 calls, $0.4934 → `persona-tone-split-5-candidates.json`
- 2026-11-10 20:30 UTC: the raters (Opus, DeepSeek, GLM) — 344 calls, $1.3935 → `persona-tone-split-5-ratings.json` (stopped: the provider answered HTTP 429 http_429: Provider returned error deepseek/deepseek-v4-pro-0813 is temporarily rate-limited upstream. Please retry shortly, or add your own provider ke)
- 2026-11-10 21:11 UTC: the raters (Opus, DeepSeek, GLM) — 92 calls, $0.3278 → `persona-tone-split-5-ratings.json`
- 2026-11-11 00:13 UTC: part middle (haiku, glm, kimi, deepseek, sol, grok, astra, opus, fable) — resumed from persona-tone-split-5-part-middle.partial.json — 45138 calls, $54.9697 → `persona-tone-split-5-part-middle-20261110-211318.json` (stopped: the provider answered HTTP 429 http_429: Provider returned error deepseek/deepseek-v4-pro-0813 is temporarily rate-limited upstream. Please retry shortly, or add your own provider ke)
- 2026-11-11 02:17 UTC: part middle (haiku, glm, kimi, deepseek, sol, grok, astra, opus, fable) — resumed from persona-tone-split-5-part-middle.partial.json — 2309 calls, $1.7120 → `persona-tone-split-5-part-middle-20261110-211318.json`
- 2026-11-11 05:22 UTC: part edges (haiku, glm, kimi, deepseek, sol, grok, astra, opus, fable) — 34287 calls, $35.8172 → `persona-tone-split-5-part-edges-20261111-021749.json`

| Role | Calls | Cost |
| --- | --- | --- |
| the writer (Sol) | 16 | $0.4934 |
| the raters | 436 | $1.7213 |
| subjects | 11249 | $68.0757 |
| the judges (Haiku) | 67348 | $13.2503 |
| the referee (Kimi) | 3137 | $11.1729 |

| Model — purpose | Calls | Input | Cache read | Output (of it reasoning) | Cost |
| --- | --- | --- | --- | --- | --- |
| openai/gpt-6.1-sol — writer | 16 | 10581 | 0 | 47220 (22844) | $0.4934 |
| z-ai/glm-5.3 — rater | 145 | 68491 | 2496 | 12616 (3276) | $0.1520 |
| claude-opus-5-5 — rater | 145 | 100867 | 0 | 33231 (0) | $1.0681 |
| deepseek/deepseek-v4-pro-0813 — rater | 146 | 70111 | 0 | 157684 (148842) | $0.5011 |
| z-ai/glm-5.3 — reply | 1248 | 86072 | 256384 | 168539 (30340) | $0.9287 |
| claude-haiku-5-5 — field | 22449 | 17278679 | 0 | 3452758 (0) | $3.4542 |
| claude-haiku-5-5 — warn | 22450 | 19547472 | 0 | 6163121 (0) | $5.0363 |
| claude-haiku-5-5 — judge | 22449 | 22089089 | 0 | 5101628 (0) | $4.7597 |
| claude-opus-5-5 — reply | 1250 | 471449 | 0 | 428087 (0) | $10.4475 |
| openai/gpt-6.1-sol — reply | 1248 | 342456 | 0 | 186829 (84018) | $2.5532 |
| openai/gpt-6-astra — reply | 1252 | 342456 | 0 | 170496 (65137) | $11.9494 |
| claude-fable-5-1 — reply | 1248 | 471816 | 0 | 447654 (0) | $27.1009 |
| moonshotai/kimi-k3 — reply | 1250 | 261758 | 240128 | 219807 (71744) | $4.1509 |
| claude-haiku-5-5 — reply | 1248 | 471816 | 0 | 670862 (0) | $0.3826 |
| moonshotai/kimi-k3 — judge-referee | 1805 | 746000 | 684032 | 289456 (160554) | $6.7850 |
| moonshotai/kimi-k3 — warn-referee | 1006 | 300171 | 421120 | 141445 (76534) | $3.1485 |
| x-ai/grok-4.7 — reply | 1251 | 321498 | 1559168 | 982885 (895879) | $7.3199 |
| moonshotai/kimi-k3 — field-referee | 326 | 171273 | 46080 | 47446 (26720) | $1.2393 |
| deepseek/deepseek-v4-pro-0813 — reply | 1254 | 332400 | 0 | 1080952 (980283) | $3.2426 |
