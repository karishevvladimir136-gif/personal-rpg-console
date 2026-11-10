# Persona tone split 4 — OpenRouter ledger

Ceiling $200 (with $130 of the key's credit reserved for AUTHORITY_1). Spent **$57.1543** in 50087 calls over 7 run(s). Every call is in `persona-tone-split-4-ledger-openrouter.json`. A chat-completions call is booked at OpenRouter's own charge (`usage.cost`); a Messages call (the Claude models) at the list price.

- 2026-11-10 09:30 UTC: the writer (Kimi K3, the 40 Part-A probes) — 5 calls, $0.1516 → `persona-tone-split-4-probes.json`
- 2026-11-10 09:31 UTC: the translator (Sol, Part B) — 1 calls, $0.0122 → `persona-tone-split-4-russian.json`
- 2026-11-10 09:36 UTC: the dry run (Part A, Haiku, 4 probes × 3 arms) — 82 calls, $0.0249 → `persona-tone-split-4-dry-20261110-093517.json`
- 2026-11-10 13:26 UTC: part A (haiku, glm, deepseek, sol, grok, astra, opus, fable) — 38789 calls, $44.4748 → `persona-tone-split-4-part-A-20261110-093648.json`
- 2026-11-10 13:27 UTC: part A (haiku, glm, deepseek, sol, grok, astra, opus, fable) — resumed from persona-tone-split-4-part-A-20261110-093648.json — 19 calls, $0.0352 → `persona-tone-split-4-part-A-20261110-093648.json`
- 2026-11-10 13:45 UTC: part bridge (haiku, glm, deepseek, sol, grok, astra, opus, fable) — 3420 calls, $3.1394 → `persona-tone-split-4-part-bridge-20261110-132705.json`
- 2026-11-10 14:27 UTC: part B (haiku, glm, kimi, deepseek, sol, grok, astra, opus, fable) — 7771 calls, $9.3162 → `persona-tone-split-4-part-B-20261110-134525.json`

| Model — purpose | Calls | Input | Cache read | Output (of it reasoning) | Cost |
| --- | --- | --- | --- | --- | --- |
| moonshotai/kimi-k3 — writer | 5 | 2121 | 512 | 9673 (729) | $0.1516 |
| openai/gpt-6.1-sol — translator | 1 | 936 | 0 | 1037 (73) | $0.0122 |
| claude-haiku-5-5 — reply | 912 | 349060 | 0 | 462964 (0) | $0.2664 |
| claude-haiku-5-5 — field | 11749 | 9011666 | 0 | 2167010 (0) | $1.9847 |
| claude-haiku-5-5 — judge | 14633 | 14202535 | 0 | 3323188 (0) | $3.0818 |
| claude-haiku-5-5 — warn | 14635 | 13039593 | 0 | 4382062 (0) | $3.4950 |
| openai/gpt-6.1-sol — warn-referee | 604 | 392618 | 0 | 101782 (61431) | $1.8165 |
| openai/gpt-6.1-sol — field-referee | 243 | 137716 | 0 | 20313 (8775) | $0.4786 |
| z-ai/glm-5.3 — reply | 900 | 81824 | 168000 | 118265 (24781) | $0.6786 |
| claude-fable-5-1 — reply | 901 | 344808 | 0 | 287748 (0) | $17.8355 |
| openai/gpt-6.1-sol — reply | 901 | 250076 | 0 | 131365 (50693) | $1.8138 |
| claude-opus-5-5 — reply | 901 | 344808 | 0 | 311869 (0) | $7.6166 |
| x-ai/grok-4.7 — reply | 900 | 209128 | 1151616 | 572715 (509071) | $4.4304 |
| openai/gpt-6.1-sol — judge-referee | 881 | 628779 | 0 | 80387 (32778) | $2.0640 |
| deepseek/deepseek-v4-pro-0813 — reply | 900 | 226742 | 20480 | 774310 (700476) | $2.3100 |
| openai/gpt-6-astra — reply | 901 | 250076 | 0 | 123596 (41318) | $8.6806 |
| moonshotai/kimi-k3 — reply | 120 | 17416 | 53248 | 24654 (4810) | $0.4380 |
