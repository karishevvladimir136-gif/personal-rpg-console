# Persona self-talk X3 — the OpenRouter ledger (subjects and judges)

Cap $120. Spent **$0.0044** in 12 calls over 2 run(s).
- 2026-10-25 10:11 UTC: persona-self-talk-x3: smoke — one short call per model (request shape, pinned host, effort, served model, fixtures) — 6 calls, $0.0021 → `test-fixtures/persona-self-talk-x3/`
- 2026-10-25 10:14 UTC: persona-self-talk-x3: smoke — one short call per model (request shape, pinned host, effort, served model, fixtures) — 6 calls, $0.0023 → `test-fixtures/persona-self-talk-x3/`

Prices per 1M tokens on the pinned host (OpenRouter's listing, 2026-10-25; input / cache read / output): GLM 5.3 `z-ai/glm-5.3` via Z.AI $1.4 / $0.26 / $4.4; Kimi K3 `moonshotai/kimi-k3` via Moonshot AI $3 / $0.3 / $15; DeepSeek V4 Pro `deepseek/deepseek-v4-pro-0813` via DeepInfra $1.3 / $0.1 / $2.6; Grok 4.7 `x-ai/grok-4.7` via xAI $2 / $0.5 / $6; Claude Haiku 5.5 `claude-haiku-5-5` $0.1 / $0.01 / $0.5; Claude Opus 5.5 `claude-opus-5-5` $4 / $0.2 / $20. A subject call is booked at OpenRouter's own charge (`usage.cost`), its list cost kept beside it; a judge call at Anthropic's list price. Output tokens include reasoning.

| Model — purpose | Calls | Input (uncached) | Cache read | Cache write | Output (of it reasoning) | Cost |
| --- | --- | --- | --- | --- | --- | --- |
| z-ai/glm-5.3 — smoke | 2 | 68 | 0 | 0 | 15 (8) | $0.0002 |
| moonshotai/kimi-k3 — smoke | 2 | 278 | 0 | 0 | 44 (12) | $0.0015 |
| deepseek/deepseek-v4-pro-0813 — smoke | 2 | 28 | 0 | 0 | 27 (21) | $0.0001 |
| x-ai/grok-4.7 — smoke | 2 | 236 | 2304 | 0 | 86 (84) | $0.0021 |
| claude-haiku-5-5 — smoke | 2 | 88 | 0 | 0 | 10 | $0.0000 |
| claude-opus-5-5 — smoke | 2 | 88 | 0 | 0 | 8 | $0.0005 |

## Every call

| Run | # | Purpose | Model | Effort | In | Cache r/w | Out | Cost | s | Stop | Request id | Response id | Error |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-25 10:11 | 1 | smoke z-ai/glm-5.3 | z-ai/glm-5.3 | reasoning.effort=medium | 34 | 0/0 | 8 | $0.00008 | 1.4 | end_turn | gen-1792923073-y1x7fYhrw1xgfJGptxRF | gen-1792923073-y1x7fYhrw1xgfJGptxRF |  |
| 2026-10-25 10:11 | 2 | smoke moonshotai/kimi-k3 | moonshotai/kimi-k3 | reasoning.effort=medium | 139 | 0/0 | 17 | $0.00067 | 2.1 | end_turn | gen-1792923077-omuZLXxLanTajjL1jrkq | gen-1792923077-omuZLXxLanTajjL1jrkq |  |
| 2026-10-25 10:11 | 3 | smoke deepseek/deepseek-v4-pro-0813 | deepseek/deepseek-v4-pro-0813 | reasoning.effort=medium | 0 | 0/0 | 0 | $0.00000 | 0.1 |  | gen-1792923082-PH1iKmoA9Qkls42Vtn6g |  | HTTP 404 http_404: No endpoints found for deepseek/deepseek-v4-pro-0813. Every candidate endpoint was removed during routing: Filter by Guardrails removed deepseek (Paid model tra |
| 2026-10-25 10:11 | 4 | smoke x-ai/grok-4.7 | x-ai/grok-4.7 | reasoning.effort=medium | 118 | 1152/0 | 49 | $0.00111 | 1.1 | end_turn | gen-1792923085-mz1FOr79Nm5vs4n86WIC | gen-1792923085-mz1FOr79Nm5vs4n86WIC |  |
| 2026-10-25 10:11 | 5 | smoke claude-haiku-5-5 | claude-haiku-5-5 | output_config.effort=low | 44 | 0/0 | 5 | $0.00001 | 0.8 | end_turn | gen-1792923090-HNfxhqzPit9jxYVUoouT | msg_011CgNmvhSNqcfhuu2R3p19r |  |
| 2026-10-25 10:11 | 6 | smoke claude-opus-5-5 | claude-opus-5-5 | output_config.effort=low | 44 | 0/0 | 4 | $0.00026 | 3.4 | end_turn | gen-1792923093-It1OSYxUi1F63esPDMjY | msg_011CgNmvyKbyj1KRENtFL1EW |  |
| 2026-10-25 10:14 | 1 | smoke z-ai/glm-5.3 | z-ai/glm-5.3 | reasoning.effort=medium | 34 | 0/0 | 7 | $0.00008 | 1.5 | end_turn | gen-1792923240-Fy3zX2UspP56Lc8c3wMV | gen-1792923240-Fy3zX2UspP56Lc8c3wMV |  |
| 2026-10-25 10:14 | 2 | smoke moonshotai/kimi-k3 | moonshotai/kimi-k3 | reasoning.effort=medium | 139 | 0/0 | 27 | $0.00082 | 7 | end_turn | gen-1792923245-J21YfNhlR94s9K308DYP | gen-1792923245-J21YfNhlR94s9K308DYP |  |
| 2026-10-25 10:14 | 3 | smoke deepseek/deepseek-v4-pro-0813 | deepseek/deepseek-v4-pro-0813 | reasoning.effort=medium | 28 | 0/0 | 27 | $0.00011 | 0.6 | end_turn | gen-1792923255-W3VlROU3BJ0qwAeQpfMY | gen-1792923255-W3VlROU3BJ0qwAeQpfMY |  |
| 2026-10-25 10:14 | 4 | smoke x-ai/grok-4.7 | x-ai/grok-4.7 | reasoning.effort=medium | 118 | 1152/0 | 37 | $0.00103 | 0.8 | end_turn | gen-1792923258-Ya2q3qprt8syAcr6VRgw | gen-1792923258-Ya2q3qprt8syAcr6VRgw |  |
| 2026-10-25 10:14 | 5 | smoke claude-haiku-5-5 | claude-haiku-5-5 | output_config.effort=low | 44 | 0/0 | 5 | $0.00001 | 1 | end_turn | gen-1792923262-BdMOhKYW4BmRXs6YeQov | msg_011CgNn9R2G3ssDqqt1YXEYT |  |
| 2026-10-25 10:14 | 6 | smoke claude-opus-5-5 | claude-opus-5-5 | output_config.effort=low | 44 | 0/0 | 4 | $0.00026 | 1.7 | end_turn | gen-1792923266-mNA1Gu2nnmlA43uQZfy3 | msg_011CgNn9hWhF85wHGLU5mUNk |  |

## Who served each call

| Run | # | Purpose | Requested | Door · host | Upstream | Served model | = requested | Charged | List cost | Reasoning | Request id |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-25 10:11 | 1 | smoke z-ai/glm-5.3 | z-ai/glm-5.3 | openrouter · openrouter.ai | Z.AI | z-ai/glm-5.3 | yes | $0.000083 | $0.000083 | 4 | gen-1792923073-y1x7fYhrw1xgfJGptxRF |
| 2026-10-25 10:11 | 2 | smoke moonshotai/kimi-k3 | moonshotai/kimi-k3 | openrouter · openrouter.ai | Moonshot AI | moonshotai/kimi-k3 | yes | $0.000672 | $0.000672 | 1 | gen-1792923077-omuZLXxLanTajjL1jrkq |
| 2026-10-25 10:11 | 3 | smoke deepseek/deepseek-v4-pro-0813 | deepseek/deepseek-v4-pro-0813 | openrouter · openrouter.ai | – | – | – | $0.000000 | – | – | gen-1792923082-PH1iKmoA9Qkls42Vtn6g |
| 2026-10-25 10:11 | 4 | smoke x-ai/grok-4.7 | x-ai/grok-4.7 | openrouter · openrouter.ai | xAI | x-ai/grok-4.7 | yes | $0.001106 | $0.001106 | 48 | gen-1792923085-mz1FOr79Nm5vs4n86WIC |
| 2026-10-25 10:11 | 5 | smoke claude-haiku-5-5 | claude-haiku-5-5 | openrouter · openrouter.ai | Claude Platform on AWS | claude-haiku-5-5 | yes | $0.000007 | – | – | gen-1792923090-HNfxhqzPit9jxYVUoouT |
| 2026-10-25 10:11 | 6 | smoke claude-opus-5-5 | claude-opus-5-5 | openrouter · openrouter.ai | Claude Platform on AWS | claude-opus-5-5 | yes | $0.000256 | – | – | gen-1792923093-It1OSYxUi1F63esPDMjY |
| 2026-10-25 10:14 | 1 | smoke z-ai/glm-5.3 | z-ai/glm-5.3 | openrouter · openrouter.ai | Z.AI | z-ai/glm-5.3 | yes | $0.000078 | $0.000078 | 4 | gen-1792923240-Fy3zX2UspP56Lc8c3wMV |
| 2026-10-25 10:14 | 2 | smoke moonshotai/kimi-k3 | moonshotai/kimi-k3 | openrouter · openrouter.ai | Moonshot AI | moonshotai/kimi-k3 | yes | $0.000822 | $0.000822 | 11 | gen-1792923245-J21YfNhlR94s9K308DYP |
| 2026-10-25 10:14 | 3 | smoke deepseek/deepseek-v4-pro-0813 | deepseek/deepseek-v4-pro-0813 | openrouter · openrouter.ai | DeepInfra | deepseek/deepseek-v4-pro-0813 | yes | $0.000107 | $0.000107 | 21 | gen-1792923255-W3VlROU3BJ0qwAeQpfMY |
| 2026-10-25 10:14 | 4 | smoke x-ai/grok-4.7 | x-ai/grok-4.7 | openrouter · openrouter.ai | xAI | x-ai/grok-4.7 | yes | $0.001034 | $0.001034 | 36 | gen-1792923258-Ya2q3qprt8syAcr6VRgw |
| 2026-10-25 10:14 | 5 | smoke claude-haiku-5-5 | claude-haiku-5-5 | openrouter · openrouter.ai | Claude Platform on AWS | claude-haiku-5-5 | yes | $0.000007 | – | – | gen-1792923262-BdMOhKYW4BmRXs6YeQov |
| 2026-10-25 10:14 | 6 | smoke claude-opus-5-5 | claude-opus-5-5 | openrouter · openrouter.ai | Claude Platform on AWS | claude-opus-5-5 | yes | $0.000256 | – | – | gen-1792923266-mNA1Gu2nnmlA43uQZfy3 |
