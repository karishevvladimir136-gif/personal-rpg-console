# TOWN_7 — run log (the harness during the run)

All times UTC, 2026-11-21.

- 05:08 calibration, branch point, projection, freeze, 42/42 proofs; commit 8c5fb5a9 pushed before any paid call.
- 05:21 spend check: llmapi $112.77, OpenRouter $110.97; reservations held (together $223.75 against $186.63).
- 05:24–05:30 trunk (c25–26): $0.27; practised at c26 (coder 4 together in South House; the session's reading agrees); checkpoint 53da6922…; replay identical.
- 05:31 sol-A and sol-E started together (loop.sh, resumes from the per-turn save); B, C, D queued two at a time (queue.sh).
- 06:31 sol-E done ($4.44, replay identical). The queue was stopped before it started sol-B, so that B and C would run as the stage's pair.
- 06:50 sol-A done ($5.75, replay identical); sol-B and sol-C started together (spend checks passed: llmapi $71.47 / $71.26, OpenRouter $459.9 — OpenRouter was topped up from outside between 05:31 and 06:31).
- 06:55 note: llmapi fell from $111.9 to $71.3 in 80 minutes, about $10 of it this stage's; TOWN_8 and TOWN_9 run on the same key (TOWN_9's pushed ledger $6.70 at 06:47; TOWN_8's pushed ledger not yet current). The frozen spend check keeps TOWN_9's $55 on llmapi for every world; if llmapi is below that plus a world's need at sol-D's start, sol-D (and the Opus worlds, whose judges are on llmapi) do not start and the stop is reported. The rule is not relaxed.
- 08:13 sol-B and sol-C done (replay identical; $5.6 and $6.4). The spend check for sol-D failed: llmapi $18.49 against the $60 its row needs (TOWN_9's $55 + D's need + $5); OpenRouter $456.09. sol-D not started on llmapi.
- 08:20 two harness changes during the run, before any further paid call, both recorded here and in the code (proofs H8 and H11, 11/11 green): (1) **the spend check is door-aware** — as frozen it asked llmapi to hold TOWN_9's $55 for every step, also for one that spends nothing on llmapi, which protects nobody and only stops OpenRouter work; now a key must hold its reservations only when the step spends on it (the combined row always applies). (2) **a world may run via OpenRouter** (`--via-openrouter`): the same models pinned to the same hosts, `allow_fallbacks: false` — GPT-6.1 Sol on OpenAI, the welfare judges Haiku 5.5 and Opus 5.5 on Anthropic — for when llmapi cannot hold TOWN_9's reservation. Precedent: TOWN_5 moved Claude to another host when the specified one answered «not available». A world's route is recorded in its record and summary; the report flags it.
