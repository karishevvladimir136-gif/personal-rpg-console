# TOWN_11 — run log: the harness during the run (not results)

- **2026-11-21 06:13 UTC** — session start; branch `claude/town-11` from `origin/claude/town-5` (8e5e3ffa). Issue #22.
- **06:17** first balance read: llmapi $92.58, OpenRouter $460.63 (the owner's top-up seen).
- **06:3x** harness `scripts/town-11` written (TOWN_5's, adapted); proofs at $0: 41/41 (TOWN_0's 7, TOWN_1's 6, TOWN_2's 11, TOWN_5's 8, TOWN_11's 9).
- **Spend check** (`spend-check-first.json`, then `spend-check.json`): pooled $546.03 → $545.66 against the need $421.14 ($195 + TOWN_7 $60, TOWN_8 $45, TOWN_9 $55, TOWN_10 $50, TOWN_3's remainder $16.14) — covered. Between the two readings llmapi fell $92.58 → $85.03 under the Sol stages; Haiku and the judges were moved to OpenRouter's Anthropic endpoint (freeze, decision 1). This stage sends nothing through llmapi.
- Projection recorded; freeze written before the first paid call.
