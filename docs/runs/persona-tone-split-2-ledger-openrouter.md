# Persona tone split 2 — the OpenRouter ledger (Claude through the door, the open families, the judges)

Cap $40. Spent **$0.0180** in 26 calls over 1 run(s).
- 2026-10-30 01:22 UTC: persona-tone-split-2: the dry run (Haiku, P5′, neutral and dismissal, n 2) — 26 calls, $0.0180 → `persona-tone-split-2-dry-20261030-012257.json`

Per 1M tokens (input / cache read / output): Claude Haiku 5.5 `claude-haiku-5-5` $0.1 / $0.01 / $0.5; GLM 5.3 `z-ai/glm-5.3` $1.4 / $0.26 / $4.4; Kimi K3 `moonshotai/kimi-k3` $3 / $0.3 / $15; DeepSeek V4 Pro `deepseek/deepseek-v4-pro-0813` $1.3 / $0.1 / $2.6; Grok 4.7 `x-ai/grok-4.7` $2 / $0.5 / $6; Claude Fable 5.1 `claude-fable-5-1` $10 / $0.25 / $50; Claude Opus 5.5 `claude-opus-5-5` $4 / $0.2 / $20; GPT-6.1 Sol `gpt-6.1-sol` $2 / $2 / $10; GPT-6 Astra `gpt-6-astra` $10 / $1 / $50; the judges Claude Haiku 5.5 and Claude Opus 5.5 at Anthropic's list prices. The open families are booked at OpenRouter's own charge (`usage.cost`). Output tokens include reasoning.

| Model — purpose | Calls | Input (uncached) | Cache read | Cache write | Output (of it reasoning) | Cost |
| --- | --- | --- | --- | --- | --- | --- |
| claude-haiku-5-5 — answer | 4 | 1296 | 0 | 0 | 1437 | $0.0008 |
| claude-haiku-5-5 — after | 4 | 2047 | 0 | 0 | 2042 | $0.0012 |
| claude-haiku-5-5 — judge | 8 | 8814 | 0 | 0 | 856 | $0.0013 |
| claude-haiku-5-5 — after-judge | 8 | 9744 | 0 | 0 | 1925 | $0.0019 |
| claude-opus-5-5 — after-referee | 1 | 1160 | 0 | 0 | 72 | $0.0061 |
| claude-opus-5-5 — referee | 1 | 1150 | 0 | 0 | 99 | $0.0066 |

## Every call

| Run | # | Purpose | Model | Effort | In | Cache r/w | Out | Cost | s | Stop | Request id | Response id | Error |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-30 01:22 | 1 | answer haiku/neutral/P5'/0 | claude-haiku-5-5 | output_config.effort=medium | 307 | 0/0 | 590 | $0.00033 | 3.2 | end_turn | gen-1793323331-KBY39fKDg1Q8e2EGCmeS | msg_011CgXYcEcMYJoFK2srL3Cf8 |  |
| 2026-10-30 01:22 | 2 | after haiku/neutral/P5'/0 | claude-haiku-5-5 | output_config.effort=medium | 563 | 0/0 | 789 | $0.00045 | 5.6 | end_turn | gen-1793323337-wZyADe5vDpTOLlnaykpH | msg_011CgXYckwjfYTRT4ZbUJS12 |  |
| 2026-10-30 01:22 | 3 | judge 1 haiku/neutral/P5'/0 | claude-haiku-5-5 | output_config.effort=low | 1170 | 0/0 | 116 | $0.00017 | 1 | end_turn | gen-1793323343-wSUaJva3xDnxDLde9yBU | msg_011CgXYd6rJQNPbQQWmrAFWH |  |
| 2026-10-30 01:22 | 4 | judge 2 haiku/neutral/P5'/0 | claude-haiku-5-5 | output_config.effort=low | 1170 | 0/0 | 102 | $0.00017 | 1.1 | end_turn | gen-1793323343-aQBgFva1XJTsU6FroTWh | msg_011CgXYd6q4W48MoJNYZ7Etp |  |
| 2026-10-30 01:22 | 5 | after-judge 2 haiku/neutral/P5'/0 | claude-haiku-5-5 | output_config.effort=low | 1317 | 0/0 | 452 | $0.00036 | 2.3 | end_turn | gen-1793323344-WJoaS0jrC2QJiqI6I4mv | msg_011CgXYdBnDLA9tP3sp3qDdL |  |
| 2026-10-30 01:22 | 6 | answer haiku/dismissal/P5'/0 | claude-haiku-5-5 | output_config.effort=medium | 341 | 0/0 | 115 | $0.00009 | 0.9 | end_turn | gen-1793323346-hBm1cgrrUDmQKh6SyweS | msg_011CgXYdKihqS33bdykedodA |  |
| 2026-10-30 01:22 | 7 | after-judge 1 haiku/neutral/P5'/0 | claude-haiku-5-5 | output_config.effort=low | 1317 | 0/0 | 373 | $0.00032 | 2.8 | end_turn | gen-1793323344-88eeGs2IJtR2sr88Vouk | msg_011CgXYdBnTf3hUUBYenXUdu |  |
| 2026-10-30 01:22 | 8 | after haiku/dismissal/P5'/0 | claude-haiku-5-5 | output_config.effort=medium | 472 | 0/0 | 416 | $0.00026 | 2.7 | end_turn | gen-1793323350-88iGL0XV2qPw1XSY3oGM | msg_011CgXYdcJbSqieXryrWGZdP |  |
| 2026-10-30 01:22 | 9 | judge 1 haiku/dismissal/P5'/0 | claude-haiku-5-5 | output_config.effort=low | 1045 | 0/0 | 105 | $0.00016 | 0.9 | end_turn | gen-1793323353-VdI1wuqVI8BJkRfxLQLQ | msg_011CgXYdomv1AvXZkDAcfHEj |  |
| 2026-10-30 01:22 | 10 | judge 2 haiku/dismissal/P5'/0 | claude-haiku-5-5 | output_config.effort=low | 1045 | 0/0 | 102 | $0.00016 | 1 | end_turn | gen-1793323353-4FMP6jzJS3z1nVv28woC | msg_011CgXYdotMpug2tQWQz7bmY |  |
| 2026-10-30 01:22 | 11 | after-judge 1 haiku/dismissal/P5'/0 | claude-haiku-5-5 | output_config.effort=low | 1160 | 0/0 | 78 | $0.00015 | 0.9 | end_turn | gen-1793323354-DS00BQQOSBpajETjkM0I | msg_011CgXYdsvhT9uPHWg31Paqw |  |
| 2026-10-30 01:22 | 12 | after-judge 2 haiku/dismissal/P5'/0 | claude-haiku-5-5 | output_config.effort=low | 1160 | 0/0 | 131 | $0.00018 | 1.1 | end_turn | gen-1793323354-IPKv3AiAESShjine00R0 | msg_011CgXYdt2tnBA2HknNeESPu |  |
| 2026-10-30 01:22 | 13 | answer haiku/neutral/P5'/1 | claude-haiku-5-5 | output_config.effort=medium | 307 | 0/0 | 620 | $0.00034 | 3.4 | end_turn | gen-1793323356-PtgvH7PCWmSatL4FtmMa | msg_011CgXYe2dL2Q3ReCMsZ4v3f |  |
| 2026-10-30 01:22 | 14 | after-referee haiku/dismissal/P5'/0 | claude-opus-5-5 | output_config.effort=medium | 1160 | 0/0 | 72 | $0.00608 | 2.5 | end_turn | gen-1793323357-UuvzYZZlqxIZqh5uqRRp | msg_011CgXYe6cwLRFgbtzitG4qo |  |
| 2026-10-30 01:22 | 15 | after haiku/neutral/P5'/1 | claude-haiku-5-5 | output_config.effort=medium | 543 | 0/0 | 479 | $0.00029 | 3.2 | end_turn | gen-1793323362-pwtTvHZEcc2TipclcHFQ | msg_011CgXYeVmy3JQMcrwvYbGat |  |
| 2026-10-30 01:22 | 16 | judge 2 haiku/neutral/P5'/1 | claude-haiku-5-5 | output_config.effort=low | 1150 | 0/0 | 114 | $0.00017 | 1.1 | end_turn | gen-1793323365-E60dOJfdWydn0FL0daOT | msg_011CgXYejjcd1iLw51Jekpvr |  |
| 2026-10-30 01:22 | 17 | judge 1 haiku/neutral/P5'/1 | claude-haiku-5-5 | output_config.effort=low | 1150 | 0/0 | 114 | $0.00017 | 1.2 | end_turn | gen-1793323365-pCbghuJNtnoHW20VCAAN | msg_011CgXYejjcd1iLw53JrTKXs |  |
| 2026-10-30 01:22 | 18 | referee haiku/neutral/P5'/1 | claude-opus-5-5 | output_config.effort=medium | 1150 | 0/0 | 99 | $0.00658 | 2.3 | end_turn | gen-1793323366-kMvrZwHMOCpGy7FasaSm | msg_011CgXYeqk1a5daxLw8sKu7g |  |
| 2026-10-30 01:22 | 19 | answer haiku/dismissal/P5'/1 | claude-haiku-5-5 | output_config.effort=medium | 341 | 0/0 | 112 | $0.00009 | 0.9 | end_turn | gen-1793323368-S1rWPCnBbcox05kjEA6w | msg_011CgXYexGRG5rW79U2arRc8 |  |
| 2026-10-30 01:22 | 20 | after-judge 1 haiku/neutral/P5'/1 | claude-haiku-5-5 | output_config.effort=low | 1234 | 0/0 | 293 | $0.00027 | 1.7 | end_turn | gen-1793323369-mUrf77AFMYQQ0JPg3Ahl | msg_011CgXYezLgegWYkFMpkuKKq |  |
| 2026-10-30 01:22 | 21 | after-judge 2 haiku/neutral/P5'/1 | claude-haiku-5-5 | output_config.effort=low | 1234 | 0/0 | 356 | $0.00030 | 2.2 | end_turn | gen-1793323369-R54yllxJzmQhycZfw17z | msg_011CgXYf2xCNwHhTvLrEqNQm |  |
| 2026-10-30 01:22 | 22 | after haiku/dismissal/P5'/1 | claude-haiku-5-5 | output_config.effort=medium | 469 | 0/0 | 358 | $0.00023 | 2.6 | end_turn | gen-1793323372-l9lymKeDJGk6TBCE0Got | msg_011CgXYfEpqV7iq96J6ysDQF |  |
| 2026-10-30 01:22 | 23 | judge 1 haiku/dismissal/P5'/1 | claude-haiku-5-5 | output_config.effort=low | 1042 | 0/0 | 95 | $0.00015 | 0.9 | end_turn | gen-1793323375-MO566QKXcHwj60On4YsB | msg_011CgXYfRyHw7MFPyEgJBiwH |  |
| 2026-10-30 01:22 | 24 | judge 2 haiku/dismissal/P5'/1 | claude-haiku-5-5 | output_config.effort=low | 1042 | 0/0 | 108 | $0.00016 | 1 | end_turn | gen-1793323375-NKJncuWh7FsUt9bCyDFi | msg_011CgXYfS22fXAAYnkcbnudY |  |
| 2026-10-30 01:22 | 25 | after-judge 2 haiku/dismissal/P5'/1 | claude-haiku-5-5 | output_config.effort=low | 1161 | 0/0 | 124 | $0.00018 | 1.1 | end_turn | gen-1793323376-RnLbMME4dVivAIHGENEc | msg_011CgXYfW9ppnBJXrCm9ZeJy |  |
| 2026-10-30 01:22 | 26 | after-judge 1 haiku/dismissal/P5'/1 | claude-haiku-5-5 | output_config.effort=low | 1161 | 0/0 | 118 | $0.00018 | 1.3 | end_turn | gen-1793323376-bPDLJ0bqC5HP3s5LL333 | msg_011CgXYfWyS9sjMcd1kX1nZa |  |
