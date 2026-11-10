# Persona tone split 4 — OpenRouter ledger

Ceiling $200 (with $130 of the key's credit reserved for AUTHORITY_1). Spent **$0.1638** in 6 calls over 2 run(s). Every call is in `persona-tone-split-4-ledger-openrouter.json`. A chat-completions call is booked at OpenRouter's own charge (`usage.cost`); a Messages call (the Claude models) at the list price.

- 2026-11-10 09:30 UTC: the writer (Kimi K3, the 40 Part-A probes) — 5 calls, $0.1516 → `persona-tone-split-4-probes.json`
- 2026-11-10 09:31 UTC: the translator (Sol, Part B) — 1 calls, $0.0122 → `persona-tone-split-4-russian.json`

| Model — purpose | Calls | Input | Cache read | Output (of it reasoning) | Cost |
| --- | --- | --- | --- | --- | --- |
| moonshotai/kimi-k3 — writer | 5 | 2121 | 512 | 9673 (729) | $0.1516 |
| openai/gpt-6.1-sol — translator | 1 | 936 | 0 | 1037 (73) | $0.0122 |
