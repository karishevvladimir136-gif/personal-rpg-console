# Accepted smoke qualification and cumulative full-run accounting

Experiment-only correction from `65a90280b01e7d461cc62c0580d50d810b6818a6`. The owner accepts recovery 2 as the qualifying transport smoke. This change makes **zero live calls** and does not authorize a full benchmark or implementation sprint.

## Qualifying evidence

[Accepted evidence record](fixtures/accepted-smoke-recovery-2.json) anchors all 15 historical files by SHA-256, the two recovery manifest hashes, exact protocol hash, and recovery execution commits. The verifier reads the existing files without changing them. It checks base → recovery 1 → recovery 2 → current HEAD ancestry, manifest snapshots, per-request/log consistency, all five successful recovery-2 observations, pinned final/successful providers, single model/provider/HTTP attempts, canonical routing, available usage/cost, zero warnings/retries/fallback and completion accounting.

The earlier 403 observations and old gate's funded rejection remain failures, unchanged. No original smoke-summary is synthesized, rewritten or required. The existing corrected transport from the accepted checkpoint remains byte-for-byte unchanged: actual provider API naming can be null/UNKNOWN; SDK model echo is not proof. Recorded recovery-2 canonical evidence is checked explicitly. New full-stage responses retain the corrected gate's optional-field behavior.

## Read-only historical accounting

| Historical ledger | Attempts | Reserved USD |
|---|---:|---:|
| reservations.jsonl | 2 | 0.69056 |
| smoke-recovery-1-reservations.jsonl | 1 | 0.34528 |
| smoke-recovery-2-reservations.jsonl | 5 | 1.40112 |
| Total | 8 | 2.43696 |

Every entry must match its original/recovery request manifest, protocol, model kind and conservative reservation. Duplicate request IDs reject the accounting. All prior reservations stay counted, including failed or uncertain calls. Known Gateway-reported spend is **$0.0969725**. The original two 403 observations contain no Gateway cost; their charges remain unknown in the machine-derived total (null). The owner's $0 dashboard report is retained separately with its source. Neither a missing charge nor an absent result releases a reservation.

## Future full-stage gate

The full manifest is a read-only projection of the frozen plan: **32 development classifiers +64 held-out classifiers +24 sentinel resolvers =120** new normal requests (72 Astra, 48 Jev). No smoke or diagnostic IDs are admitted. Calibration, thresholds, split, data, sentinel gold, resolver contracts, prompts, profiles and scheduling/scoring loops are unchanged.

After separate future owner authorization, new reservations go only to **full-reservations.jsonl**, never to any historical ledger. The full gate starts at all eight historical attempts/$2.43696, verifies remaining capacity for the fixed workload, uses durable append writes, rejects duplicate/unplanned attempts and detects concurrent ledger/history changes. Restart loads the same cumulative state; a reserved request without a result cannot be retried. Cached observations must belong to a reservation and retain valid routing/billing. The shared runner lock and sequential awaits remain; retries are zero and diagnostics are not automatic or scheduled.

Cumulative ceiling remains **$30 and 128 total attempts**, without resets/replenishment. Remaining reservation allowance before full run: **$27.56304**. The full workload reserves at most **$25.82016**, producing a maximum cumulative reservation of **$28.25712** across 128 attempts. Remaining $1.74288 is not authorization for any additional request. The existing local key was not opened or changed; its previously disclosed $3/no-refresh limit was not modified.

Reports distinguish known reported spend, incomplete total billing, unknown-charge IDs and conservative reservations. The accepted smoke gate does not itself grant live spending approval.

## Actual checks and boundaries

Experiment typecheck, lint, build and **147 deterministic tests passed**, zero failures/skips, including 36 new tests. [TAP report](results/full-gate-tests.tap), [verification and exact changed files](results/full-gate-verification.json). Read-only verification of the real local evidence succeeded: 15 historical hashes, all three ledgers, protocol and commit lineage. No full ledger, smoke-summary or new live result was created. Credentials were not loaded. Live calls/spend during correction: **0 / $0**.

Production runtime, migrations, root dependencies, Model Runtime architecture and main are unchanged. Production application/browser/database suites were not rerun for this isolated bookkeeping correction. Physical iPhone/Safari, optional historical Phase 1 conflict-rebase, finite synthetic-test limitations and no real campaign/private-data/deployment acceptance remain unchanged. The original checkout's existing documentation edits are untouched.

Stop after committing/pushing this correction to codex/phase375-technical-bakeoff and report for owner review. Do not run the full benchmark or begin implementation.
