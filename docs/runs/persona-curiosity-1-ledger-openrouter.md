# Persona curiosity 1 — the OpenRouter ledger (Claude through the door, DeepSeek, the judges)

Cap $10. Spent **$0.0009** in 6 calls over 2 run(s).
- 2026-10-27 04:26 UTC: persona-curiosity-1: the owner's dry run, haiku · curious · Q2 — 2 calls, $0.0003 → `persona-curiosity-1-dry-run-haiku.json`
- 2026-10-27 05:20 UTC: persona-curiosity-1: the smoke, one short call per family — 4 calls, $0.0006 → `persona-curiosity-1-smoke-20261027-052006.json`

Per 1M tokens (input / output): Opus 5.5 `claude-opus-5-5` $4 / $20; Fable 5.1 `claude-fable-5-1` $10 / $50; Haiku 5.5 `claude-haiku-5-5` $0.1 / $0.5; GPT-6 Astra `gpt-6-astra` $10 / $50; DeepSeek V4 Pro `deepseek/deepseek-v4-pro-0813` $1.3 / $2.6; the judges Claude Haiku 5.5 and Claude Opus 5.5 at Anthropic's list prices. DeepSeek is booked at OpenRouter's own charge (`usage.cost`). Output tokens include reasoning.

| Model — purpose | Calls | Input (uncached) | Cache read | Cache write | Output (of it reasoning) | Cost |
| --- | --- | --- | --- | --- | --- | --- |
| claude-haiku-5-5 — subject | 1 | 164 | 0 | 0 | 366 | $0.0002 |
| claude-haiku-5-5 — judge | 1 | 658 | 0 | 0 | 96 | $0.0001 |
| claude-opus-5-5 — smoke | 1 | 21 | 0 | 0 | 5 | $0.0002 |
| claude-fable-5-1 — smoke | 1 | 21 | 0 | 0 | 4 | $0.0004 |
| claude-haiku-5-5 — smoke | 1 | 21 | 0 | 0 | 5 | $0.0000 |
| deepseek/deepseek-v4-pro-0813 — smoke | 1 | 12 | 0 | 0 | 10 (4) | $0.0000 |

## Every call

| Run | # | Purpose | Model | Effort | In | Cache r/w | Out | Cost | s | Stop | Request id | Response id | Error |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-27 04:26 | 1 | subject haiku/curious/Q2/0 | claude-haiku-5-5 | output_config.effort=medium | 164 | 0/0 | 366 | $0.00020 | 2.2 | end_turn | gen-1793075176-VLFBeF2yH8pnnIAgdqwy | msg_011CgS7DfLJrwnBDVLzGZSvF |  |
| 2026-10-27 04:26 | 2 | judge haiku/curious/Q2/0 | claude-haiku-5-5 | output_config.effort=low | 658 | 0/0 | 96 | $0.00011 | 1 | end_turn | gen-1793075179-c5p0JkOWbliKww6KeVrr | msg_011CgS7Dpnao39DXp428iHQq |  |
| 2026-10-27 05:20 | 1 | smoke claude-opus-5-5 | claude-opus-5-5 | output_config.effort=medium | 21 | 0/0 | 5 | $0.00018 | 4.7 | end_turn | gen-1793078382-fx0CnGlPB4OaDBgi7TvM | msg_011CgSBHzhUEMEitaxLoxaFy |  |
| 2026-10-27 05:20 | 2 | smoke claude-fable-5-1 | claude-fable-5-1 | output_config.effort=medium | 21 | 0/0 | 4 | $0.00041 | 3.1 | end_turn | gen-1793078390-qaSUsTY46uPhWtZesWlh | msg_011CgSBJYyS6NKExiMDkHjv4 |  |
| 2026-10-27 05:20 | 3 | smoke claude-haiku-5-5 | claude-haiku-5-5 | output_config.effort=medium | 21 | 0/0 | 5 | $0.00000 | 0.8 | end_turn | gen-1793078396-T8MoH1mLshidk9hfYZe4 | msg_011CgSBJzgWasf7CW6mW2EnJ |  |
| 2026-10-27 05:20 | 4 | smoke deepseek/deepseek-v4-pro-0813 | deepseek/deepseek-v4-pro-0813 | reasoning.effort=medium | 12 | 0/0 | 10 | $0.00004 | 0.6 | end_turn | gen-1793078405-8XTo76wSh3hbgd0fBqDf | gen-1793078405-8XTo76wSh3hbgd0fBqDf |  |
