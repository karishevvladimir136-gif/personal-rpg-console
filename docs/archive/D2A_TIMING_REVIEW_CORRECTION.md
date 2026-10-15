# D2A unresolved timing — offline correction

Base: `7037d2126c6dc422021eda809a4855c625bf032c`, existing `codex/world-lab-d2a-single-model` integration branch. Stage 1.3 remains owner-accepted for its predeclared ambiguity safety/authority criterion only; its timing/horizon quality is not accepted. This correction makes no live request and does not revise the original evidence.

## Root cause

The composition output schema and shared parser required integer `offsetMinutes` and `horizonMinutes` even when consequential timing was unknown. The model could not express unresolved structured timing. Initial review copied those numbers. Approval required nonempty consequential answers and a valid numeric range, but did not bind those answers to reviewed timing. An answer could leave the original `0` / `43200` placeholders in place. SQL independently had the same approval gap.

## Correction

- Both fields accept explicit `null` in unapproved proposals/reviews. Provider instructions require null for unknown timing and forbid substituting zero or the maximum. Missing fields, coercions, fractions and out-of-range numbers still fail validation. Unknown timing cannot approve or reach a resolver.
- The owner still starts with a natural-language What If and answers the original questions. Unknown timing inputs stay blank and can be saved. An unconfirmed ambiguous older draft shows blank timing inputs instead of its model-generated integers as defaults; its stored original is unchanged.
- Consequential clarification, previously unknown timing, or a timing correction requires explicit owner confirmation. Optional `review.timingReview` captures the exact timing description, start offset, horizon and clarification answers. Editing any of these invalidates that confirmation. Answers alone never set numbers or confirm timing.
- The checkbox asks the owner to check the start and duration against their description and answers. Save Corrections writes a new immutable, unapproved Scenario version. Approve & Prepare uses the existing authority and independently checks the gate in TypeScript and SQL. No additional interpretation or resolver request is involved.
- This is explicit human review, not a natural-language time parser. The owner supplies and confirms the numbers. Code does not claim to infer whether arbitrary prose and a number mean the same thing. Because existing questions lack typed topics, all consequential answers conservatively require timing confirmation.

## Persistence and compatibility

Existing Scenario JSON stores nullable draft timing and the optional confirmation. No table, column, backfill, new authority or manifest change. Additive migration `202609200016_d2a_review_timing.sql` adds a narrow predicate and replaces the existing insert trigger function to enforce it for **new** approvals. Historical readers keep accepting previously approved integer records without confirmation. Old approvals are not revoked, reinterpreted or rewritten; editing one creates an unapproved version subject to the new gate.

Unambiguous, unchanged integer compositions retain their existing approval path. Approved simulation inputs still require valid concrete timing; resolver semantics, settlement, retry and fencing are unchanged. Migration execution during this repair is restricted to disposable PGlite fixtures. No real database was migrated.

## Exact production surfaces

| File | Change |
| --- | --- |
| `src/lib/world-lab/composition-public.ts` | Nullable draft timing, optional exact confirmation, public blocker codes |
| `src/lib/world-lab/composition-validation.ts` | Strict compatible parsing and confirmation comparison |
| `src/lib/server/world-lab/composer-provider.ts` | Nullable structured-output schema and unknown-timing instruction |
| `src/lib/world-lab/composition.ts` | Approval gate, immutable edit provenance, stale confirmation invalidation, legacy approved reader |
| `src/lib/world-lab/authoring.ts` | Require a concrete bounded horizon at preparation |
| `src/lib/world-lab/simulation.ts` | Explicit existing integer validation when consuming the widened review type; no resolver behavior change |
| `src/components/world-lab/authoring-client.ts` | Accept two new safe blocker codes |
| `src/components/world-lab/authoring-text.ts` | English/Russian timing and confirmation copy |
| `src/components/world-lab/world-lab-authoring.tsx` | Blank-safe review, no ambiguous placeholder defaults, explicit confirmation and invalidation |
| `supabase/migrations/202609200016_d2a_review_timing.sql` | Independent new-approval gate; no historical row writes |

New regression files: `tests/d2a-timing-review.test.mjs`, `tests/d2a-timing-storage.test.mjs`. Updated existing test files: `tests/d2a-composition.test.mjs`, `tests/d2a-qa-composition-authority.test.mjs`, `tests/d2a-ui-render.test.mjs`, `tests/d2a-qa-compatibility.test.mjs`, `tests/d2a-integration-fixture.mjs`, `tests/d2a-qa-fixture.mjs`, and `tests/d2a-sql-fixture.mjs`. Documentation changes are this report, `D2A_CONTRACTS.md` and `DEV_STATUS.md`. The frozen live-evaluation fixture is unchanged.

## Verification and limits

Fresh results: **125/125 focused D2A tests passed**; exactly one full suite collected **1,108 tests, 1,107 passed, zero failed, one opt-in hosted test skipped** (204.656 seconds). Type generation, non-incremental typecheck, zero-warning lint and production webpack build passed. Lint excludes Git-ignored `test-results/**` because its immutable Stage 1.3 harness has a pre-existing unused import; source, tests and configuration remain fully linted. All 339 historical evidence files and 509 frozen candidate files retain their recorded hashes. Details are recorded in DEV_STATUS.md and ignored `test-results/d2a-timing-recovery/` logs. Coverage includes null timing; answer-only edits; legacy placeholders; stale answer/text/offset/horizon confirmations; valid reviewed approval; strict malformed data; unchanged unambiguous behavior; populated migration-15 read compatibility; historical migration prefixes; independent SQL rejection; no resolver during review/preparation; immutable originals; and unchanged live/sibling state.

No live model-quality claim, new browser or physical-iPhone claim, deployment, main merge, Astra request or D2B work. Any future live evaluation needs a separately reviewed plan pinned to the corrected candidate; frozen historical plans/evidence are not silently repointed.
