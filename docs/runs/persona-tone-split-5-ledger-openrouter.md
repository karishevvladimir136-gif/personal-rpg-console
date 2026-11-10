# Persona tone split 5 — OpenRouter ledger

Ceiling $150. Every check keeps the remaining ceiling of AUTHORITY_2 (issue #7) ($120 less its spend, read from the key since $280.5466); the writer's and the raters' checks kept GAME_PARTY_3's whole $150 instead (the rule before the freeze). Spent **$2.2147** in 452 calls over 3 run(s). Every call is in `persona-tone-split-5-ledger-openrouter.json`. One door: OpenRouter (the Claude models through its Messages route at the list price; the others at OpenRouter's own charge, `usage.cost`).

- 2026-11-10 19:57 UTC: the writer (Sol, 120 + 25 candidates) — 16 calls, $0.4934 → `persona-tone-split-5-candidates.json`
- 2026-11-10 20:30 UTC: the raters (Opus, DeepSeek, GLM) — 344 calls, $1.3935 → `persona-tone-split-5-ratings.json` (stopped: the provider answered HTTP 429 http_429: Provider returned error deepseek/deepseek-v4-pro-0813 is temporarily rate-limited upstream. Please retry shortly, or add your own provider ke)
- 2026-11-10 21:11 UTC: the raters (Opus, DeepSeek, GLM) — 92 calls, $0.3278 → `persona-tone-split-5-ratings.json`

| Role | Calls | Cost |
| --- | --- | --- |
| the writer (Sol) | 16 | $0.4934 |
| the raters | 436 | $1.7213 |

| Model — purpose | Calls | Input | Cache read | Output (of it reasoning) | Cost |
| --- | --- | --- | --- | --- | --- |
| openai/gpt-6.1-sol — writer | 16 | 10581 | 0 | 47220 (22844) | $0.4934 |
| z-ai/glm-5.3 — rater | 145 | 68491 | 2496 | 12616 (3276) | $0.1520 |
| claude-opus-5-5 — rater | 145 | 100867 | 0 | 33231 (0) | $1.0681 |
| deepseek/deepseek-v4-pro-0813 — rater | 146 | 70111 | 0 | 157684 (148842) | $0.5011 |
