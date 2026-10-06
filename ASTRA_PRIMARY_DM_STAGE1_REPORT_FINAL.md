# Astra primary DM — Stage 1 final evaluation report

**Status:** All 30 original blind cells have been attempted under the authorized Stage 1A, 1B and 1C runs. Twenty-nine committed; one Stage 1C final failed invariant validation. Owner blind scoring remains pending. Stage 2 was not run.

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

## Stage 1C — final four cells

- 4/4 sessions; 6/8 model requests; 3 committed and 1 final validation failure. No semantic retry or manual repair.
- 2 model tool requests, 2 checkpointed public-state query receipts, 2 same-model continuation requests.
- Measured provider latency 96.96 s; total session wall time 97.15 s; session wall p50/p95 18.52 s / 40.34 s.
- Tokens: 9,031 input, 0 cached, 2,485 output (including 1,519 reasoning).
- Reported-token Standard estimate US $0.2146 additional; conservative cache-write accounting US $0.2371, below the US $5 hard ceiling. Actual invoice unavailable. All requests specified `gpt-6-astra` / reasoning `high` / `default`; all responses confirmed the model and tier.
- Consume-oil/X proposed `expectedRevision: null` for existing oil item revision `1` while narrating its consumption. The invariant validator rejected the item change and no player-facing response or state was committed. Its uncommitted proposal is preserved in the blind review. The other three cells committed.

## Combined and interpretation

- 66 total model requests across 50 session attempts; reported-token Standard estimate US $2.8381; conservative total US $3.2034.
- The consolidated blind review has 29/30 committed variants and no unattempted cells: ten valid Stage 1A and sixteen valid Stage 1B outcomes remain unchanged; three Stage 1C cells committed; one Stage 1C final was rejected.
- Across Stage 1B and 1C, 16 server tools executed and 15 sessions completed a same-model tool continuation.
- Average model round trips: 1.00 for 14 committed no-tool turns; 2.07 for 15 committed tool turns.
- The jump-kiss Stage 1A final used a natural-language position string that the validator correctly rejects; the response schema now restricts position to the validator's existing values. The companion-refusal Stage 1A final used worldMinutes 0 because the minimal packet omitted the current 720; every arm now receives that current time. Both are generic harness defects. No final was manually repaired.
- The prototype now derives replay identity from the operation and checkpoint tool position. A saved receipt replays exactly after restart; changed arguments at that position conflict. The model supplies semantic tool arguments only.

- Quality remains for owner scoring: one validated jump-kiss variant narrates a successful kiss after a public-state query without a physical roll. The numeric/state validator did not establish a condition or other mechanical effect; this is visible DM adjudication evidence, not a result to edit or rerun under this authorization.

## Isolation

Only synthetic packets, disposable local journals and direct OpenAI text requests were used. Main, owner database, owner app, owner gameplay and the historical failed turn were untouched. No migration, deployment, media request or Stage 2 run occurred. The blind mapping remains in a separate private local file, which this renderer does not read.

Pricing basis: [official GPT-6 Astra model page](https://developers.openai.com/api/docs/models/gpt-6-astra).
