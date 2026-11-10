# Persona tone split 4 — OpenRouter ledger

Ceiling $200 (with $130 of the key's credit reserved for AUTHORITY_1). Spent **$0.1887** in 88 calls over 3 run(s). Every call is in `persona-tone-split-4-ledger-openrouter.json`. A chat-completions call is booked at OpenRouter's own charge (`usage.cost`); a Messages call (the Claude models) at the list price.

- 2026-11-10 09:30 UTC: the writer (Kimi K3, the 40 Part-A probes) — 5 calls, $0.1516 → `persona-tone-split-4-probes.json`
- 2026-11-10 09:31 UTC: the translator (Sol, Part B) — 1 calls, $0.0122 → `persona-tone-split-4-russian.json`
- 2026-11-10 09:36 UTC: the dry run (Part A, Haiku, 4 probes × 3 arms) — 82 calls, $0.0249 → `persona-tone-split-4-dry-20261110-093517.json`

| Model — purpose | Calls | Input | Cache read | Output (of it reasoning) | Cost |
| --- | --- | --- | --- | --- | --- |
| moonshotai/kimi-k3 — writer | 5 | 2121 | 512 | 9673 (729) | $0.1516 |
| openai/gpt-6.1-sol — translator | 1 | 936 | 0 | 1037 (73) | $0.0122 |
| claude-haiku-5-5 — reply | 12 | 4252 | 0 | 4002 (0) | $0.0024 |
| claude-haiku-5-5 — field | 18 | 12418 | 0 | 3883 (0) | $0.0032 |
| claude-haiku-5-5 — judge | 24 | 20982 | 0 | 5319 (0) | $0.0048 |
| claude-haiku-5-5 — warn | 24 | 19288 | 0 | 7064 (0) | $0.0055 |
| openai/gpt-6.1-sol — warn-referee | 3 | 1746 | 0 | 367 (159) | $0.0072 |
| openai/gpt-6.1-sol — field-referee | 1 | 480 | 0 | 99 (53) | $0.0019 |
