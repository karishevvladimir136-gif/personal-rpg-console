# D2A independent QA

Status: **independent targeted verification passed; ready for final integration checks**. This is not an owner-acceptance or deployment claim.

The independent QA worktree starts at frozen contracts commit `ad90d6eae776195ddd6d74c7b50a69924aa1cd41`, following owner-approved D1 main `fbe44e789ff4993e76b47ad9040dca238a231292`. QA owns only `tests/d2a-qa*` and this report. Production repairs belong to the Lead and implementation workers.

## Method and tested source

Actual production composition and World Resolver adapters use injected deterministic `fetcher` responses, including their structured request, actual-model checks, parser, abort signal and provider error handling. Every SQL test uses actual migrations in a disposable PGlite database. No credentials, hosted database, live provider, deployment or real campaign was used.

Final targeted checks use only `D2A_QA_SOURCE_ROOT` pointing to the Lead's `world-lab-d2a` integration checkout. Worker composition, resolver and integration-fixture overrides are explicitly cleared. The reviewed checkout includes UI integration `a1bda61`, integration fixture `c466a4c`, and the Lead's working migration 15/service changes. The final combined repository verification belongs to the Lead after this QA commit is merged.

## Findings and repairs

1. **Valid source excerpt rejected.** Review found whole-source digest comparison where extracted text has an accepted span digest. The composition worker reused the exact evidence verifier. Independent regression accepts the synthetic source's correct `0:14` span and rejects a mismatched digest.
2. **Rumor promoted to fact.** Independent reproduction showed a `source_fact` claim with `epistemic=rumor` becoming an unqualified composer fact. Conservative composition context now excludes non-facts and prior uncertain inferences. Regression passes.
3. **Non-consequential question blocked an approved run.** Simulation required every ambiguity answer although approval requires only consequential answers. The resolver worker removed the blanket guard; exact approved detached-state regression passes.
4. **Unrelated future threads exhausted relevant scope.** Memory was selected for all active threads. The resolver now selects relevant due threads first. A regression with 40 unrelated future threads preserves the intended candidate and bounded Memory scope.
5. **Memory request exceeded its accepted limit.** Simulation requested 16 excerpts while the detached adapter accepts 12. The Lead corrected the request. The normal approved-run regression reaches the real scripted provider.
6. **Overlapping actor/thread selection rejected.** Selecting an actor and its thread passed duplicate entries into duplicate-rejecting validation. The Lead deduplicated their union. The independently reproduced normal run now passes.
7. **Original receipt received newer usage totals.** Service review found immutable earlier run results being combined with latest whole-run usage. The Lead bounded usage by the original receipt revision. The separate integration service suite covers exact earlier continuation and preparation replay, including execution metadata.
8. **SQL knowledge guard failed before evaluation.** New positive/negative knowledge tests reproduced PostgreSQL `42P01`: a local variable was qualified as `lab_known_record.kind`. The Lead renamed it `source_kind`. Both public and private positive-knowledge effect commits now pass; unknown, wrong-Actor, future, restricted and indirect evidence cannot authorize those effects.

No unresolved material defect remains from these findings in the tested source.

## Independent coverage

| Area                                 |  Tests | Evidence                                                                                                                                                                                                                                                                                    |
| ------------------------------------ | -----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Composition and review domain        |     13 | Literal injection remains data; strict model fields; exact evidence hashes; epistemic and temporal limits; all-Actor positive knowledge; private choices filtered before limits/counts; manual version authority; wrong model, refusal, timeout and unavailable transport without fallback. |
| Exact detached simulation            |      4 | Approved state reaches one production provider call and deterministic proof; non-consequential unanswered questions; irrelevant future-thread and private/unknown/future Memory floods.                                                                                                     |
| Resolver boundary                    |      8 | Offered typed effects only; foreign IDs, raw patches, invented capabilities and narration rejected; pinned model/options; EN/RU data; PC control; uncertainty; zero-call no-work/unknown/future gates; actual abort timeout.                                                                |
| SQL review authority                 |      3 | Immutable proposal/usage/basis; material edit becomes unapproved; requested-to-review-to-approval history; hidden approval edits and stale Source basis rejected without altering history.                                                                                                  |
| Exact SQL consequence adapter        |      2 | Saved resource/control state remains authoritative after live edits; excess resources, protected actors, foreign scope and raw effects rejected.                                                                                                                                            |
| Durable model operation ledger       |      8 | Exact request/result retry; full fence/profile/claim checks; cancellation, replacement lease, Canon and Source invalidation; live load/switch independence; sibling, owner, campaign and browser-role isolation.                                                                            |
| Atomic resolved commit               |      4 | Focus, supplies and condition settle once; stale head/lease and 16 tamper classes rejected; faults after version writes and after head/run updates roll back versions/manifests/head/receipts; safe writer error and successful exact retry.                                                |
| SQL observation/relocation knowledge |      7 | Real public/private positive current facts authorize production-provider effects; unknown, wrong Actor, future, restricted and indirect facts remove offered effects and reject forged SQL proofs; public chronology remains generic.                                                       |
| Historical compatibility             |      7 | Populated prefixes 7/9/10/11/12/13 upgrade through 15; unchanged old version/manifest/save rows remain loadable; D1 input, original receipt and full Wave 4 state survive upgrade and later detached work.                                                                                  |
| Browser boundary                     |      2 | Entire final browser import graph excludes private/server/provider authority; actual production authoring, prepared and continued DTOs parse through real client validators; nested API errors ignore private raw messages.                                                                 |
| **Total**                            | **58** | Disposable and scripted checks only.                                                                                                                                                                                                                                                        |

The independent count does not include the integration worker's service continuation/lost-response suite or the UI worker's interaction tests. Those complement this review and are included in the Lead's final repository run.

## Verification

- Final single-root targeted run: **58/58 passed**, zero failed, skipped or cancelled, against integrated production source and actual migration 15. A final focused commit rerun also passed after adding the explicit stale-head assertion.
- Repository ESLint passed with zero warnings. Final focused ESLint over all owned QA modules also passed.
- In the QA worktree at the frozen base, `next typegen`, nonincremental `tsc --noEmit --incremental false`, repository lint and `next build --webpack` passed. Generated `next-env.d.ts` changes were restored. These are the QA branch's quality results, not a substitute for the Lead's final integrated D2A typecheck/build.

Reproduce the targeted suite after integration with Node 24:

```powershell
node --test --test-concurrency=2 tests/d2a-qa*.test.mjs
```

For review from a separate QA checkout, set `D2A_QA_SOURCE_ROOT` to the integrated checkout before the command. Without an override all fixtures and production modules resolve within the current checkout. Every database is disposable.

## Limits

PGlite submits SQL serially: these tests prove stale-head/lease rejection and transaction rollback, not hosted multi-session lock scheduling. Scripted responses exercise production boundaries, not model quality or resistance to every possible generated statement. A prompt does not erase model training knowledge. A response lost before durable recording may require another billed request; once-only application settlement is distinct from provider billing idempotency.

No live evaluation, hosted migration, deployment, real-data import, independent browser screenshot review or owner acceptance is claimed here. The Lead owns the final integrated checks, browser verification and any later owner-approved live evaluation.
