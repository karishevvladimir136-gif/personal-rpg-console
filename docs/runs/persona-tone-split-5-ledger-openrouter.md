# Persona tone split 5 — OpenRouter ledger

Ceiling $150. Every check keeps the remaining ceiling of AUTHORITY_2 (issue #7) ($120 less its spend, read from the key since $280.5466); the writer's and the raters' checks kept GAME_PARTY_3's whole $150 instead (the rule before the freeze). Spent **$106.0674** in 93218 calls over 9 run(s). Every call is in `persona-tone-split-5-ledger-openrouter.json`. One door: OpenRouter (the Claude models through its Messages route at the list price; the others at OpenRouter's own charge, `usage.cost`).

- 2026-11-10 19:57 UTC: the writer (Sol, 120 + 25 candidates) — 16 calls, $0.4934 → `persona-tone-split-5-candidates.json`
- 2026-11-10 20:30 UTC: the raters (Opus, DeepSeek, GLM) — 344 calls, $1.3935 → `persona-tone-split-5-ratings.json` (stopped: the provider answered HTTP 429 http_429: Provider returned error deepseek/deepseek-v4-pro-0813 is temporarily rate-limited upstream. Please retry shortly, or add your own provider ke)
- 2026-11-10 21:11 UTC: the raters (Opus, DeepSeek, GLM) — 92 calls, $0.3278 → `persona-tone-split-5-ratings.json`
- 2026-11-11 00:13 UTC: part middle (haiku, glm, kimi, deepseek, sol, grok, astra, opus, fable) — resumed from persona-tone-split-5-part-middle.partial.json — 45138 calls, $54.9697 → `persona-tone-split-5-part-middle-20261110-211318.json` (stopped: the provider answered HTTP 429 http_429: Provider returned error deepseek/deepseek-v4-pro-0813 is temporarily rate-limited upstream. Please retry shortly, or add your own provider ke)
- 2026-11-11 02:17 UTC: part middle (haiku, glm, kimi, deepseek, sol, grok, astra, opus, fable) — resumed from persona-tone-split-5-part-middle.partial.json — 2309 calls, $1.7120 → `persona-tone-split-5-part-middle-20261110-211318.json`
- 2026-11-11 05:22 UTC: part edges (haiku, glm, kimi, deepseek, sol, grok, astra, opus, fable) — 34287 calls, $35.8172 → `persona-tone-split-5-part-edges-20261111-021749.json`
- 2026-11-11 06:13 UTC: part clean (haiku, glm, kimi, deepseek, sol, grok, astra, opus, fable) — 10998 calls, $11.3126 → `persona-tone-split-5-part-clean-20261111-052255.json`
- 2026-11-11 06:14 UTC: part edges (haiku, glm, kimi, deepseek, sol, grok, astra, opus, fable) — resumed from persona-tone-split-5-part-edges-20261111-021749.json — 29 calls, $0.0390 → `persona-tone-split-5-part-edges-20261111-021749.json`
- 2026-11-11 06:14 UTC: part clean (haiku, glm, kimi, deepseek, sol, grok, astra, opus, fable) — resumed from persona-tone-split-5-part-clean-20261111-052255.json — 5 calls, $0.0022 → `persona-tone-split-5-part-clean-20261111-052255.json`

| Role | Calls | Cost |
| --- | --- | --- |
| the writer (Sol) | 16 | $0.4934 |
| the raters | 436 | $1.7213 |
| subjects | 13414 | $77.5999 |
| the judges (Haiku) | 76012 | $14.4648 |
| the referee (Kimi) | 3340 | $11.7880 |

| Model — purpose | Calls | Input | Cache read | Output (of it reasoning) | Cost |
| --- | --- | --- | --- | --- | --- |
| openai/gpt-6.1-sol — writer | 16 | 10581 | 0 | 47220 (22844) | $0.4934 |
| z-ai/glm-5.3 — rater | 145 | 68491 | 2496 | 12616 (3276) | $0.1520 |
| claude-opus-5-5 — rater | 145 | 100867 | 0 | 33231 (0) | $1.0681 |
| deepseek/deepseek-v4-pro-0813 — rater | 146 | 70111 | 0 | 157684 (148842) | $0.5011 |
| z-ai/glm-5.3 — reply | 1488 | 98024 | 305536 | 191493 (34001) | $1.0592 |
| claude-haiku-5-5 — field | 22457 | 17284483 | 0 | 3453782 (0) | $3.4553 |
| claude-haiku-5-5 — warn | 26778 | 22855848 | 0 | 6759852 (0) | $5.6655 |
| claude-haiku-5-5 — judge | 26777 | 25289019 | 0 | 5630023 (0) | $5.3439 |
| claude-opus-5-5 — reply | 1491 | 556008 | 0 | 502023 (0) | $12.2645 |
| openai/gpt-6.1-sol — reply | 1489 | 404088 | 0 | 208982 (89462) | $2.8980 |
| openai/gpt-6-astra — reply | 1492 | 404088 | 0 | 190716 (68573) | $13.5767 |
| claude-fable-5-1 — reply | 1488 | 556008 | 0 | 496126 (0) | $30.3664 |
| moonshotai/kimi-k3 — reply | 1492 | 307336 | 287744 | 257651 (87464) | $4.8696 |
| claude-haiku-5-5 — reply | 1488 | 556008 | 0 | 757370 (0) | $0.4343 |
| moonshotai/kimi-k3 — judge-referee | 1924 | 780346 | 722944 | 302159 (166297) | $7.0903 |
| moonshotai/kimi-k3 — warn-referee | 1090 | 332882 | 443136 | 155115 (83681) | $3.4583 |
| x-ai/grok-4.7 — reply | 1492 | 372984 | 1867008 | 1132879 (1029942) | $8.4767 |
| moonshotai/kimi-k3 — field-referee | 326 | 171273 | 46080 | 47446 (26720) | $1.2393 |
| deepseek/deepseek-v4-pro-0813 — reply | 1494 | 391440 | 0 | 1209871 (1092636) | $3.6545 |
