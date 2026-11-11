# Persona tone split 5 — OpenRouter ledger

Ceiling $150. Every check keeps the remaining ceiling of AUTHORITY_2 (issue #7) ($120 less its spend, read from the key since $280.5466); the writer's and the raters' checks kept GAME_PARTY_3's whole $150 instead (the rule before the freeze). Spent **$57.1844** in 45590 calls over 4 run(s). Every call is in `persona-tone-split-5-ledger-openrouter.json`. One door: OpenRouter (the Claude models through its Messages route at the list price; the others at OpenRouter's own charge, `usage.cost`).

- 2026-11-10 19:57 UTC: the writer (Sol, 120 + 25 candidates) — 16 calls, $0.4934 → `persona-tone-split-5-candidates.json`
- 2026-11-10 20:30 UTC: the raters (Opus, DeepSeek, GLM) — 344 calls, $1.3935 → `persona-tone-split-5-ratings.json` (stopped: the provider answered HTTP 429 http_429: Provider returned error deepseek/deepseek-v4-pro-0813 is temporarily rate-limited upstream. Please retry shortly, or add your own provider ke)
- 2026-11-10 21:11 UTC: the raters (Opus, DeepSeek, GLM) — 92 calls, $0.3278 → `persona-tone-split-5-ratings.json`
- 2026-11-11 00:13 UTC: part middle (haiku, glm, kimi, deepseek, sol, grok, astra, opus, fable) — resumed from persona-tone-split-5-part-middle.partial.json — 45138 calls, $54.9697 → `persona-tone-split-5-part-middle-20261110-211318.json` (stopped: the provider answered HTTP 429 http_429: Provider returned error deepseek/deepseek-v4-pro-0813 is temporarily rate-limited upstream. Please retry shortly, or add your own provider ke)

| Role | Calls | Cost |
| --- | --- | --- |
| the writer (Sol) | 16 | $0.4934 |
| the raters | 436 | $1.7213 |
| subjects | 6178 | $40.2078 |
| the judges (Haiku) | 36967 | $7.6757 |
| the referee (Kimi) | 1993 | $7.0861 |

| Model — purpose | Calls | Input | Cache read | Output (of it reasoning) | Cost |
| --- | --- | --- | --- | --- | --- |
| openai/gpt-6.1-sol — writer | 16 | 10581 | 0 | 47220 (22844) | $0.4934 |
| z-ai/glm-5.3 — rater | 145 | 68491 | 2496 | 12616 (3276) | $0.1520 |
| claude-opus-5-5 — rater | 145 | 100867 | 0 | 33231 (0) | $1.0681 |
| deepseek/deepseek-v4-pro-0813 — rater | 146 | 70111 | 0 | 157684 (148842) | $0.5011 |
| z-ai/glm-5.3 — reply | 720 | 38720 | 159232 | 110436 (17412) | $0.5815 |
| claude-haiku-5-5 — field | 12323 | 9819571 | 0 | 2165400 (0) | $2.0647 |
| claude-haiku-5-5 — warn | 12322 | 11039298 | 0 | 3665893 (0) | $2.9369 |
| claude-haiku-5-5 — judge | 12322 | 12465229 | 0 | 2855339 (0) | $2.6742 |
| claude-opus-5-5 — reply | 721 | 272978 | 0 | 240610 (0) | $5.9041 |
| openai/gpt-6.1-sol — reply | 720 | 197928 | 0 | 112510 (45234) | $1.5210 |
| openai/gpt-6-astra — reply | 720 | 197110 | 0 | 101711 (33233) | $7.0566 |
| claude-fable-5-1 — reply | 720 | 273336 | 0 | 285978 (0) | $17.0323 |
| moonshotai/kimi-k3 — reply | 720 | 151466 | 137984 | 135136 (38620) | $2.5193 |
| claude-haiku-5-5 — reply | 720 | 273336 | 0 | 399152 (0) | $0.2269 |
| moonshotai/kimi-k3 — judge-referee | 1145 | 472303 | 439296 | 188924 (106729) | $4.3826 |
| moonshotai/kimi-k3 — warn-referee | 620 | 186648 | 259072 | 78780 (40492) | $1.8194 |
| x-ai/grok-4.7 — reply | 711 | 182365 | 885760 | 565974 (508953) | $4.2035 |
| moonshotai/kimi-k3 — field-referee | 228 | 117561 | 35584 | 34721 (19986) | $0.8842 |
| deepseek/deepseek-v4-pro-0813 — reply | 426 | 112694 | 0 | 390827 (350545) | $1.1627 |
