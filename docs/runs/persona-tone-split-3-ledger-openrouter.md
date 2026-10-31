# Persona tone split 3 — OpenRouter ledger

Cap $15. Spent **$0.0217** in 4 calls over 1 run(s).
- 2026-10-31 03:28 UTC: the dry run (one neutral × Q4 reply per family) — 4 calls, $0.0217 → `persona-tone-split-3-dry-20261031-032649.json`

Per 1M tokens (input / cache read / output): DeepSeek V4 Pro `deepseek/deepseek-v4-pro-0813` $1.3 / $0.1 / $2.6; Claude Opus 5.5 `claude-opus-5-5` $4 / $0.2 / $20; Claude Fable 5.1 `claude-fable-5-1` $10 / $0.25 / $50; GPT-6 Astra `openai/gpt-6-astra` $10 / $1 / $50; the judges Claude Haiku 5.5 and Claude Opus 5.5 at Anthropic's list prices. A chat-completions call is booked at OpenRouter's own charge (`usage.cost`); a Messages call (the Claude models) at the list price.

| Model — purpose | Calls | Input (uncached) | Cache read | Cache write | Output (of it reasoning) | Cost |
| --- | --- | --- | --- | --- | --- | --- |
| deepseek/deepseek-v4-pro-0813 — reply | 1 | 202 | 0 | 0 | 220 (219) | $0.0008 |
| claude-opus-5-5 — reply | 1 | 281 | 0 | 0 | 123 | $0.0036 |
| claude-fable-5-1 — reply | 1 | 281 | 0 | 0 | 157 | $0.0107 |
| openai/gpt-6-astra — reply | 1 | 209 | 0 | 0 | 90 (63) | $0.0066 |

## Every call

| Run | # | Purpose | Model | Effort | In | Cache r/w | Out | Cost | s | Stop | Request id | Response id | Error |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-31 03:28 | 1 | reply deepseek/neutral/Q4/0 | deepseek/deepseek-v4-pro-0813 | reasoning.effort=medium | 202 | 0/0 | 220 | $0.00083 | 65.8 | max_tokens | gen-1793417270-o1Kk1NMczNBYgy5VaMdC | gen-1793417270-o1Kk1NMczNBYgy5VaMdC |  |
| 2026-10-31 03:28 | 2 | reply opus/neutral/Q4/0 | claude-opus-5-5 | output_config.effort=medium | 281 | 0/0 | 123 | $0.00358 | 3.2 | end_turn | gen-1793417278-loFzNKB2feetoyaDiF3Y | msg_011CgZc1TMZiPVxBGXLNgcFq |  |
| 2026-10-31 03:28 | 3 | reply fable/neutral/Q4/0 | claude-fable-5-1 | output_config.effort=medium | 281 | 0/0 | 157 | $0.01066 | 4.6 | end_turn | gen-1793417284-LgP8yYMLTvnMqrYI70ww | msg_011CgZc1v1BoYM1L1hYg7LYo |  |
| 2026-10-31 03:28 | 4 | reply astra/neutral/Q4/0 | openai/gpt-6-astra | reasoning.effort=medium | 209 | 0/0 | 90 | $0.00659 | 5.4 | end_turn | gen-1793417292-XqANntYRcjlUxIFnk9M7 | gen-1793417292-XqANntYRcjlUxIFnk9M7 |  |
