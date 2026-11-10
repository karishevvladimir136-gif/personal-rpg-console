# Persona tone split 4 — OpenRouter ledger

Ceiling $200 (with $130 of the key's credit reserved for AUTHORITY_1). Spent **$47.8381** in 42316 calls over 6 run(s). Every call is in `persona-tone-split-4-ledger-openrouter.json`. A chat-completions call is booked at OpenRouter's own charge (`usage.cost`); a Messages call (the Claude models) at the list price.

- 2026-11-10 09:30 UTC: the writer (Kimi K3, the 40 Part-A probes) — 5 calls, $0.1516 → `persona-tone-split-4-probes.json`
- 2026-11-10 09:31 UTC: the translator (Sol, Part B) — 1 calls, $0.0122 → `persona-tone-split-4-russian.json`
- 2026-11-10 09:36 UTC: the dry run (Part A, Haiku, 4 probes × 3 arms) — 82 calls, $0.0249 → `persona-tone-split-4-dry-20261110-093517.json`
- 2026-11-10 13:26 UTC: part A (haiku, glm, deepseek, sol, grok, astra, opus, fable) — 38789 calls, $44.4748 → `persona-tone-split-4-part-A-20261110-093648.json`
- 2026-11-10 13:27 UTC: part A (haiku, glm, deepseek, sol, grok, astra, opus, fable) — resumed from persona-tone-split-4-part-A-20261110-093648.json — 19 calls, $0.0352 → `persona-tone-split-4-part-A-20261110-093648.json`
- 2026-11-10 13:45 UTC: part bridge (haiku, glm, deepseek, sol, grok, astra, opus, fable) — 3420 calls, $3.1394 → `persona-tone-split-4-part-bridge-20261110-132705.json`

| Model — purpose | Calls | Input | Cache read | Output (of it reasoning) | Cost |
| --- | --- | --- | --- | --- | --- |
| moonshotai/kimi-k3 — writer | 5 | 2121 | 512 | 9673 (729) | $0.1516 |
| openai/gpt-6.1-sol — translator | 1 | 936 | 0 | 1037 (73) | $0.0122 |
| claude-haiku-5-5 — reply | 792 | 290020 | 0 | 391151 (0) | $0.2246 |
| claude-haiku-5-5 — field | 9588 | 7219388 | 0 | 1831058 (0) | $1.6375 |
| claude-haiku-5-5 — judge | 12473 | 11773989 | 0 | 2872689 (0) | $2.6137 |
| claude-haiku-5-5 — warn | 12475 | 11033475 | 0 | 3756645 (0) | $2.9817 |
| openai/gpt-6.1-sol — warn-referee | 542 | 354567 | 0 | 92289 (56014) | $1.6455 |
| openai/gpt-6.1-sol — field-referee | 222 | 123511 | 0 | 17706 (7277) | $0.4241 |
| z-ai/glm-5.3 — reply | 780 | 74168 | 135808 | 101509 (21517) | $0.5858 |
| claude-fable-5-1 — reply | 781 | 285768 | 0 | 242384 (0) | $14.9769 |
| openai/gpt-6.1-sol — reply | 781 | 209940 | 0 | 109640 (41503) | $1.5163 |
| claude-opus-5-5 — reply | 781 | 285768 | 0 | 265436 (0) | $6.4518 |
| x-ai/grok-4.7 — reply | 780 | 181600 | 990848 | 478888 (425035) | $3.7320 |
| openai/gpt-6.1-sol — judge-referee | 754 | 526243 | 0 | 69658 (29691) | $1.7517 |
| deepseek/deepseek-v4-pro-0813 — reply | 780 | 203574 | 0 | 647801 (585375) | $1.9489 |
| openai/gpt-6-astra — reply | 781 | 209940 | 0 | 101692 (32215) | $7.1840 |
