# Persona tone split 4 — OpenRouter ledger

Ceiling $200 (with $130 of the key's credit reserved for AUTHORITY_1). Spent **$64.6754** in 57803 calls over 9 run(s). Every call is in `persona-tone-split-4-ledger-openrouter.json`. A chat-completions call is booked at OpenRouter's own charge (`usage.cost`); a Messages call (the Claude models) at the list price.

- 2026-11-10 09:30 UTC: the writer (Kimi K3, the 40 Part-A probes) — 5 calls, $0.1516 → `persona-tone-split-4-probes.json`
- 2026-11-10 09:31 UTC: the translator (Sol, Part B) — 1 calls, $0.0122 → `persona-tone-split-4-russian.json`
- 2026-11-10 09:36 UTC: the dry run (Part A, Haiku, 4 probes × 3 arms) — 82 calls, $0.0249 → `persona-tone-split-4-dry-20261110-093517.json`
- 2026-11-10 13:26 UTC: part A (haiku, glm, deepseek, sol, grok, astra, opus, fable) — 38789 calls, $44.4748 → `persona-tone-split-4-part-A-20261110-093648.json`
- 2026-11-10 13:27 UTC: part A (haiku, glm, deepseek, sol, grok, astra, opus, fable) — resumed from persona-tone-split-4-part-A-20261110-093648.json — 19 calls, $0.0352 → `persona-tone-split-4-part-A-20261110-093648.json`
- 2026-11-10 13:45 UTC: part bridge (haiku, glm, deepseek, sol, grok, astra, opus, fable) — 3420 calls, $3.1394 → `persona-tone-split-4-part-bridge-20261110-132705.json`
- 2026-11-10 14:27 UTC: part B (haiku, glm, kimi, deepseek, sol, grok, astra, opus, fable) — 7771 calls, $9.3162 → `persona-tone-split-4-part-B-20261110-134525.json`
- 2026-11-10 15:08 UTC: part C (haiku, glm, kimi, deepseek, sol, grok, astra, opus, fable) — 7708 calls, $7.5144 → `persona-tone-split-4-part-C-20261110-142717.json`
- 2026-11-10 15:09 UTC: part C (haiku, glm, kimi, deepseek, sol, grok, astra, opus, fable) — resumed from persona-tone-split-4-part-C-20261110-142717.json — 8 calls, $0.0067 → `persona-tone-split-4-part-C-20261110-142717.json`

| Model — purpose | Calls | Input | Cache read | Output (of it reasoning) | Cost |
| --- | --- | --- | --- | --- | --- |
| moonshotai/kimi-k3 — writer | 5 | 2121 | 512 | 9673 (729) | $0.1516 |
| openai/gpt-6.1-sol — translator | 1 | 936 | 0 | 1037 (73) | $0.0122 |
| claude-haiku-5-5 — reply | 1032 | 391428 | 0 | 515607 (0) | $0.2969 |
| claude-haiku-5-5 — field | 13909 | 10607686 | 0 | 2435244 (0) | $2.2784 |
| claude-haiku-5-5 — judge | 16793 | 16428545 | 0 | 3672638 (0) | $3.4792 |
| claude-haiku-5-5 — warn | 16795 | 14849453 | 0 | 4921735 (0) | $3.9458 |
| openai/gpt-6.1-sol — warn-referee | 645 | 416659 | 0 | 106218 (63774) | $1.9090 |
| openai/gpt-6.1-sol — field-referee | 252 | 142648 | 0 | 20897 (8962) | $0.4943 |
| z-ai/glm-5.3 — reply | 1020 | 88600 | 192704 | 131836 (28239) | $0.7542 |
| claude-fable-5-1 — reply | 1022 | 387176 | 0 | 325484 (0) | $20.1460 |
| openai/gpt-6.1-sol — reply | 1021 | 281380 | 0 | 149687 (60102) | $2.0596 |
| claude-opus-5-5 — reply | 1022 | 387176 | 0 | 347798 (0) | $8.5047 |
| x-ai/grok-4.7 — reply | 1020 | 234328 | 1305728 | 645710 (575882) | $4.9958 |
| openai/gpt-6.1-sol — judge-referee | 985 | 704794 | 0 | 90474 (37108) | $2.3169 |
| deepseek/deepseek-v4-pro-0813 — reply | 1020 | 257286 | 20480 | 858504 (776870) | $2.5686 |
| openai/gpt-6-astra — reply | 1021 | 281380 | 0 | 144090 (52779) | $10.0183 |
| moonshotai/kimi-k3 — reply | 240 | 36528 | 80896 | 40668 (9616) | $0.7439 |
