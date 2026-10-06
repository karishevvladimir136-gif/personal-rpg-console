# Astra primary DM — Stage 1 evaluation report V2

**Status:** Bounded Stage 1B rerun complete on frozen synthetic data. Owner blind scoring remains pending. Stage 2 was not run.

## Stage 1A — frozen original

- 30 sessions, 30 model requests; 10 committed and 20 validation failures.
- Harness failures: 18 model-supplied tool IDs rejected before execution; two final proposals rejected. No tool receipts or continuations.
- Reported-token Standard estimate: US $1.2420; conservative cache-write accounting: US $1.4079.
- Tokens: 66,366 input, 0 cached, 11,566 output (including 7,636 reasoning).

## Stage 1B — authorized corrected rerun

- 16/16 sessions; 30/64 model requests; 16 committed; 0 validation failures. No semantic retry.
- 14 model tool requests, 14 checkpointed server receipts (7 public-state queries, 7 deterministic skill rolls), 14 continuation requests. 13 sessions completed model → server tool → same-model continuation.
- Tool-loop end-to-end session latency p50/p95: 25.91 s / 59.94 s. Total measured provider latency: 464.00 s.
- Tokens: 70,730 input, 0 cached, 13,486 output (including 8,911 reasoning).
- Reported-token Standard estimate: US $1.3816 additional; conservative cache-write accounting: US $1.5584, below the US $40 hard ceiling. Actual invoice unavailable.
- Every request specified reasoning `high`; all 30 provider responses reported `gpt-6-astra` and service tier `default`. No provider error or usage-limit stop.

## Combined and interpretation

- 60 total model requests across the original and corrected runs; reported-token Standard estimate US $2.6236; conservative total US $2.9663.
- The consolidated blind review has 26/30 committed variants. Ten valid Stage 1A outputs remain unchanged, sixteen authorized Stage 1B outcomes replace earlier blocked entries, and four original tool-ID failures remain blocked outside this authorization.
- Average model round trips: 1.00 for 13 committed no-tool turns; 2.08 for 13 committed tool turns.
- The jump-kiss Stage 1A final used a natural-language position string that the validator correctly rejects; the response schema now restricts position to the validator's existing values. The companion-refusal Stage 1A final used worldMinutes 0 because the minimal packet omitted the current 720; every arm now receives that current time. Both are generic harness defects. No final was manually repaired.
- The prototype now derives replay identity from the operation and checkpoint tool position. A saved receipt replays exactly after restart; changed arguments at that position conflict. The model supplies semantic tool arguments only.

- Quality remains for owner scoring: one validated jump-kiss variant narrates a successful kiss after a public-state query without a physical roll. The numeric/state validator did not establish a condition or other mechanical effect; this is visible DM adjudication evidence, not a result to edit or rerun under this authorization.

## Isolation

Only synthetic packets, disposable local journals and direct OpenAI text requests were used. Main, owner database, owner app, owner gameplay and the historical failed turn were untouched. No migration, deployment, media request or Stage 2 run occurred. The blind mapping remains in a separate private local file, which this renderer does not read.

Pricing basis: [official GPT-6 Astra model page](https://developers.openai.com/api/docs/models/gpt-6-astra).
