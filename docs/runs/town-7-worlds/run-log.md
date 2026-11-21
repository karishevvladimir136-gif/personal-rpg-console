# TOWN_7 — run log (the harness during the run)

All times UTC, 2026-11-21.

- 05:08 calibration, branch point, projection, freeze, 42/42 proofs; commit 8c5fb5a9 pushed before any paid call.
- 05:21 spend check: llmapi $112.77, OpenRouter $110.97; reservations held (together $223.75 against $186.63).
- 05:24–05:30 trunk (c25–26): $0.27; practised at c26 (coder 4 together in South House; the session's reading agrees); checkpoint 53da6922…; replay identical.
- 05:31 sol-A and sol-E started together (loop.sh, resumes from the per-turn save); B, C, D queued two at a time (queue.sh).
- 06:31 sol-E done ($4.44, replay identical). The queue was stopped before it started sol-B, so that B and C would run as the stage's pair.
- 06:50 sol-A done ($5.75, replay identical); sol-B and sol-C started together (spend checks passed: llmapi $71.47 / $71.26, OpenRouter $459.9 — OpenRouter was topped up from outside between 05:31 and 06:31).
- 06:55 note: llmapi fell from $111.9 to $71.3 in 80 minutes, about $10 of it this stage's; TOWN_8 and TOWN_9 run on the same key (TOWN_9's pushed ledger $6.70 at 06:47; TOWN_8's pushed ledger not yet current). The frozen spend check keeps TOWN_9's $55 on llmapi for every world; if llmapi is below that plus a world's need at sol-D's start, sol-D (and the Opus worlds, whose judges are on llmapi) do not start and the stop is reported. The rule is not relaxed.
