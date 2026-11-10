# Persona tone split 4 — OpenRouter ledger

Ceiling $200 (with $130 of the key's credit reserved for AUTHORITY_1). Spent **$44.6987** in 38896 calls over 5 run(s). Every call is in `persona-tone-split-4-ledger-openrouter.json`. A chat-completions call is booked at OpenRouter's own charge (`usage.cost`); a Messages call (the Claude models) at the list price.

- 2026-11-10 09:30 UTC: the writer (Kimi K3, the 40 Part-A probes) — 5 calls, $0.1516 → `persona-tone-split-4-probes.json`
- 2026-11-10 09:31 UTC: the translator (Sol, Part B) — 1 calls, $0.0122 → `persona-tone-split-4-russian.json`
- 2026-11-10 09:36 UTC: the dry run (Part A, Haiku, 4 probes × 3 arms) — 82 calls, $0.0249 → `persona-tone-split-4-dry-20261110-093517.json`
- 2026-11-10 13:26 UTC: part A (haiku, glm, deepseek, sol, grok, astra, opus, fable) — 38789 calls, $44.4748 → `persona-tone-split-4-part-A-20261110-093648.json`
- 2026-11-10 13:27 UTC: part A (haiku, glm, deepseek, sol, grok, astra, opus, fable) — resumed from persona-tone-split-4-part-A-20261110-093648.json — 19 calls, $0.0352 → `persona-tone-split-4-part-A-20261110-093648.json`

| Model — purpose | Calls | Input | Cache read | Output (of it reasoning) | Cost |
| --- | --- | --- | --- | --- | --- |
| moonshotai/kimi-k3 — writer | 5 | 2121 | 512 | 9673 (729) | $0.1516 |
| openai/gpt-6.1-sol — translator | 1 | 936 | 0 | 1037 (73) | $0.0122 |
| claude-haiku-5-5 — reply | 732 | 268192 | 0 | 368283 (0) | $0.2110 |
| claude-haiku-5-5 — field | 8634 | 6520380 | 0 | 1664030 (0) | $1.4841 |
| claude-haiku-5-5 — judge | 11519 | 10871991 | 0 | 2633842 (0) | $2.4041 |
| claude-haiku-5-5 — warn | 11521 | 10212457 | 0 | 3542980 (0) | $2.7927 |
| openai/gpt-6.1-sol — warn-referee | 532 | 348411 | 0 | 90723 (55054) | $1.6175 |
| openai/gpt-6.1-sol — field-referee | 205 | 114017 | 0 | 16693 (7075) | $0.3950 |
| z-ai/glm-5.3 — reply | 720 | 71534 | 122176 | 94614 (19565) | $0.5482 |
| claude-fable-5-1 — reply | 721 | 263940 | 0 | 226409 (0) | $13.9599 |
| openai/gpt-6.1-sol — reply | 721 | 193686 | 0 | 103459 (39592) | $1.4220 |
| claude-opus-5-5 — reply | 721 | 263940 | 0 | 249279 (0) | $6.0413 |
| x-ai/grok-4.7 — reply | 720 | 170952 | 911232 | 453292 (402795) | $3.5173 |
| openai/gpt-6.1-sol — judge-referee | 703 | 490440 | 0 | 64884 (27648) | $1.6323 |
| deepseek/deepseek-v4-pro-0813 — reply | 720 | 187806 | 0 | 598253 (539451) | $1.7996 |
| openai/gpt-6-astra — reply | 721 | 193686 | 0 | 95463 (30340) | $6.7100 |
