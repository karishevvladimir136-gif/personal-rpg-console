# Planner seat 1 — the OpenRouter ledger (Claude through the door, the open families, the judges)

Cap $25. Spent **$0.1025** in 24 calls over 1 run(s).
- 2026-10-27 20:54 UTC: planner-seat-1: the dry run, one Haiku seat per variant — 24 calls, $0.1025 → `planner-seat-1-dry-20261027-205426.json`

Per 1M tokens (input / cache read / cache write / output): Opus 5.5 `claude-opus-5-5` $4 / $0.2 / $5 / $20; Fable 5.1 `claude-fable-5-1` $10 / $0.25 / $12.5 / $50; Haiku 5.5 `claude-haiku-5-5` $0.1 / $0.01 / $0.125 / $0.5; GPT-6 Astra `gpt-6-astra` $10 / $1 / $12.5 / $50; GPT-6.1 Sol `gpt-6.1-sol` $2 / $2 / $2.5 / $10; DeepSeek V4 Pro `deepseek/deepseek-v4-pro-0813` $1.3 / $0.1 / $1.3 / $2.6; Kimi K3 `moonshotai/kimi-k3` $3 / $0.3 / $3 / $15; GLM 5.3 `z-ai/glm-5.3` $1.4 / $0.26 / $1.4 / $4.4; Grok 4.7 `x-ai/grok-4.7` $2 / $0.5 / $2 / $6; the judges Claude Haiku 5.5 and Claude Opus 5.5 at Anthropic's list prices. The open families are booked at OpenRouter's own charge (`usage.cost`). Output tokens include reasoning.

| Model — purpose | Calls | Input (uncached) | Cache read | Cache write | Output (of it reasoning) | Cost |
| --- | --- | --- | --- | --- | --- | --- |
| claude-haiku-5-5 — seat | 6 | 7540 | 197644 | 98822 | 13560 | $0.0219 |
| claude-haiku-5-5 — check | 6 | 8671 | 0 | 0 | 383 | $0.0011 |
| claude-haiku-5-5 — decline | 6 | 8401 | 0 | 0 | 432 | $0.0011 |
| claude-haiku-5-5 — tags | 4 | 25566 | 0 | 0 | 4174 | $0.0046 |
| claude-opus-5-5 — tags | 2 | 12783 | 0 | 0 | 1139 | $0.0739 |

## Every call

| Run | # | Purpose | Model | Effort | In | Cache r/w | Out | Cost | s | Stop | Request id | Response id | Error |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-27 20:54 | 1 | seat masked/haiku/0 t1 | claude-haiku-5-5 | output_config.effort=medium | 4 | 0/49129 | 2916 | $0.00760 | 23.1 | end_turn | gen-1793134361-ro8Hed7LSCLHtKi4tj3R | msg_011CgTQSTDewnZ8Womyjheoh |  |
| 2026-10-27 20:54 | 2 | check masked/haiku/0 t1 | claude-haiku-5-5 | output_config.effort=low | 1739 | 0/0 | 67 | $0.00021 | 1.7 | end_turn | gen-1793134384-JQyGTHq0W2UagF7eBDNa | msg_011CgTQU7RphtqiJy2MU7zF9 |  |
| 2026-10-27 20:54 | 3 | seat named/haiku/0 t1 | claude-haiku-5-5 | output_config.effort=medium | 4 | 0/49693 | 2981 | $0.00770 | 28.3 | end_turn | gen-1793134361-9z01FcnnMDQ97b19zV4L | msg_011CgTQSTmdevBvVZfbXCwge |  |
| 2026-10-27 20:54 | 4 | decline masked/haiku/0 t1 | claude-haiku-5-5 | output_config.effort=low | 1694 | 0/0 | 59 | $0.00020 | 1.1 | end_turn | gen-1793134389-fiSlE1Mk7wBEXLlvyeK5 | msg_011CgTQUTji6w6VZdkMX595e |  |
| 2026-10-27 20:54 | 5 | seat masked/haiku/0 t2 | claude-haiku-5-5 | output_config.effort=medium | 1355 | 49129/0 | 1658 | $0.00146 | 9.6 | end_turn | gen-1793134390-KtPWOKiAPpd98KKKfQpp | msg_011CgTQUZLZ2J5ebCU5Vg3yu |  |
| 2026-10-27 20:54 | 6 | check named/haiku/0 t1 | claude-haiku-5-5 | output_config.effort=low | 1773 | 0/0 | 64 | $0.00021 | 11.2 | end_turn | gen-1793134389-TsMjk3ajmbVd17oVkv5Q | msg_011CgTQUVuBH3Etuh8Lfveaa |  |
| 2026-10-27 20:54 | 7 | check masked/haiku/0 t2 | claude-haiku-5-5 | output_config.effort=low | 1336 | 0/0 | 62 | $0.00016 | 1 | end_turn | gen-1793134399-lOl2K07XiccMYwGvEUey | msg_011CgTQVG2nRPkDyw4wyQRrV |  |
| 2026-10-27 20:54 | 8 | decline named/haiku/0 t1 | claude-haiku-5-5 | output_config.effort=low | 1728 | 0/0 | 69 | $0.00021 | 1.1 | end_turn | gen-1793134403-3NpDB3INUZJ4HEkFGOXo | msg_011CgTQVYSGPAEtT95fpUAJ9 |  |
| 2026-10-27 20:54 | 9 | decline masked/haiku/0 t2 | claude-haiku-5-5 | output_config.effort=low | 1291 | 0/0 | 63 | $0.00016 | 1 | end_turn | gen-1793134404-nummqIVjlxoeyjhFHfcy | msg_011CgTQVZ6hHf3ADnxd7VvAX |  |
| 2026-10-27 20:54 | 10 | seat named/haiku/0 t2 | claude-haiku-5-5 | output_config.effort=medium | 1389 | 49693/0 | 1741 | $0.00151 | 10.3 | end_turn | gen-1793134404-KXzhxVIHdaBtZaMoKTbe | msg_011CgTQVdWMWUMni31qU32Dw |  |
| 2026-10-27 20:54 | 11 | check named/haiku/0 t2 | claude-haiku-5-5 | output_config.effort=low | 1256 | 0/0 | 60 | $0.00016 | 1.1 | end_turn | gen-1793134415-HAL3SmqlIbaLZiIyxhjl | msg_011CgTQWPBB4gNixHE5rGMhq |  |
| 2026-10-27 20:54 | 12 | seat masked/haiku/0 t3 | claude-haiku-5-5 | output_config.effort=medium | 2417 | 49129/0 | 1807 | $0.00164 | 11.4 | end_turn | gen-1793134405-EYbfwrEeSv3Mrd8gMM2H | msg_011CgTQVdi1zqFtcLtHgcgus |  |
| 2026-10-27 20:54 | 13 | check masked/haiku/0 t3 | claude-haiku-5-5 | output_config.effort=low | 1261 | 0/0 | 64 | $0.00016 | 1 | end_turn | gen-1793134416-ovCGaqKrl6JOpdo8mL6q | msg_011CgTQWU4NFfndPDCMsicUS |  |
| 2026-10-27 20:54 | 14 | decline named/haiku/0 t2 | claude-haiku-5-5 | output_config.effort=low | 1211 | 0/0 | 75 | $0.00016 | 0.9 | end_turn | gen-1793134419-gL1p6bSB95t8Tjx6OnFD | msg_011CgTQWgDcRCNSdFSUh26uM |  |
| 2026-10-27 20:54 | 15 | decline masked/haiku/0 t3 | claude-haiku-5-5 | output_config.effort=low | 1216 | 0/0 | 84 | $0.00016 | 1.1 | end_turn | gen-1793134420-Db1j2oM8ldThaLTLFcF8 | msg_011CgTQWksekqqkESQauHffY |  |
| 2026-10-27 20:54 | 16 | tags 1 masked/haiku/0 | claude-haiku-5-5 | output_config.effort=low | 6352 | 0/0 | 867 | $0.00107 | 4.6 | end_turn | gen-1793134421-zNSR0BEe2DQnyoeuCFux | msg_011CgTQWrB9NMAwZ69vyGeHC |  |
| 2026-10-27 20:54 | 17 | tags 2 masked/haiku/0 | claude-haiku-5-5 | output_config.effort=low | 6352 | 0/0 | 1070 | $0.00117 | 5.7 | end_turn | gen-1793134421-baWt2TAPNZB8AIQIIDlF | msg_011CgTQWsWzsCLQnFDgSpU9d |  |
| 2026-10-27 20:54 | 18 | tags referee masked/haiku/0 | claude-opus-5-5 | output_config.effort=low | 6352 | 0/0 | 617 | $0.03775 | 7.5 | end_turn | gen-1793134427-4roBE5YJb5c4ARiChnxt | msg_011CgTQXGbaHwqXK8TDY53z8 |  |
| 2026-10-27 20:54 | 19 | seat named/haiku/0 t3 | claude-haiku-5-5 | output_config.effort=medium | 2371 | 49693/0 | 2457 | $0.00196 | 15.3 | end_turn | gen-1793134420-TXuzhs3pQLKKMN3uQxEf | msg_011CgTQWm3phPacCJD2C87yY |  |
| 2026-10-27 20:54 | 20 | check named/haiku/0 t3 | claude-haiku-5-5 | output_config.effort=low | 1306 | 0/0 | 66 | $0.00016 | 1.2 | end_turn | gen-1793134435-lkX92HT6D1scDXwkNFnj | msg_011CgTQXsvbF4ZNxz34rGSS5 |  |
| 2026-10-27 20:54 | 21 | decline named/haiku/0 t3 | claude-haiku-5-5 | output_config.effort=low | 1261 | 0/0 | 82 | $0.00017 | 1.3 | end_turn | gen-1793134439-TOypBVtOLPCNBO21homc | msg_011CgTQYBnP4PjyyEhweE8yY |  |
| 2026-10-27 20:54 | 22 | tags 2 named/haiku/0 | claude-haiku-5-5 | output_config.effort=low | 6431 | 0/0 | 1059 | $0.00117 | 17.4 | end_turn | gen-1793134441-U8aqj5RDoBaTzJDvHCBS | msg_011CgTQYKTVdELpcsGi6qyhP |  |
| 2026-10-27 20:54 | 23 | tags 1 named/haiku/0 | claude-haiku-5-5 | output_config.effort=low | 6431 | 0/0 | 1178 | $0.00123 | 17.6 | end_turn | gen-1793134441-ZNpddDm19px5FntoKCva | msg_011CgTQYHzBpuoWKJc1QgysF |  |
| 2026-10-27 20:54 | 24 | tags referee named/haiku/0 | claude-opus-5-5 | output_config.effort=low | 6431 | 0/0 | 522 | $0.03616 | 7.3 | end_turn | gen-1793134458-58AAA4a4VYBz8vixeElv | msg_011CgTQZbVBdBqpET8e6hYCs |  |
