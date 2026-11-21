# TOWN_11 — run log: the harness during the run (not results)

- **2026-11-21 06:13 UTC** — session start; branch `claude/town-11` from `origin/claude/town-5` (8e5e3ffa). Issue #22.
- **06:17** first balance read: llmapi $92.58, OpenRouter $460.63 (the owner's top-up seen).
- **06:3x** harness `scripts/town-11` written (TOWN_5's, adapted); proofs at $0: 41/41 (TOWN_0's 7, TOWN_1's 6, TOWN_2's 11, TOWN_5's 8, TOWN_11's 9).
- **Spend check** (`spend-check-first.json`, then `spend-check.json`): pooled $546.03 → $545.66 against the need $421.14 ($195 + TOWN_7 $60, TOWN_8 $45, TOWN_9 $55, TOWN_10 $50, TOWN_3's remainder $16.14) — covered. Between the two readings llmapi fell $92.58 → $85.03 under the Sol stages; Haiku and the judges were moved to OpenRouter's Anthropic endpoint (freeze, decision 1). This stage sends nothing through llmapi.
- Projection recorded; freeze written before the first paid call.
- **06:4x** the stage ledger is rewritten after every turn; it is committed as a snapshot at each day boundary and at the end (between snapshots git is told to skip its working-tree changes: `git update-index --skip-worktree`).
- **07:2x** haiku-week day 1 measured at c24: $0.2948 ($0.012 a cycle); by sol-week's shape the week ≈ $5.70 of its $15.
- **08:5x** deepseek-week day 1 measured at c24: $4.547 ($0.19 a cycle; projection $4.64). By sol-week's shape the week ≈ $88 against its $60: R1 is expected to stop it in day 6 (≈ c130). DeepSeek runs ≈ 5.5 min a cycle on Together (no retries).
- **12:4x** haiku-week reached c168 (the whole week), world $8.26 of $15; the after-question follows. At that day's end llmapi held $4.29 (the Sol stages drew it down; this stage sends nothing through it — decision 1), OpenRouter $399.25.
- **12:44** the three Claude seating checks (first screen once, OpenRouter pinned to Anthropic): Opus 5.5, Fable 5.2 and Fable 5.1 all answered (end_turn, first action read hall; provenance true; $0.0074, $0.0138, $0.0191). Fable 5.1 refused this text 6 of 6 in TOWN_2 and TOWN_3 (llmapi's Bedrock route); here it answered once. The stage runs no Fable 5.1 world; none was run. opus-week started 12:44:47 beside deepseek-week (two at a time); fable52-week waits for a slot.
- **13:3x** opus-week day 1 measured at c24: $7.57 ($0.32 a cycle; projection $7.15); by sol-week's shape the three days ≈ $37 of its $60.
