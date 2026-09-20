# Wave 1 independent QA review

Review date: 2026-09-20. Worker D used the owner-requested Astra / Extra High configuration and edited only `tests/wave1-qa*` and this report. All databases, source text, identities, provider transports and secret markers in these tests are synthetic. No live provider, hosted database, real campaign, deployment or browser acceptance work was performed.

## Reviewed integration

- Frozen contract: `5769d86687097b2fdb300cb9dbd018244c9a9c42`.
- Runtime worker: `23c0e55ee57614c579c03b7ccaace202ed99d019`.
- World worker: `8e3eb41a5044b2c09c1bf950afc94b11ab22ae6b`.
- Library worker: `f22f4b7`.
- Lead integration and hardening: `6fd8d18`, `afb5b91`, `0eeb304eefa1eab7bd66dd3d4c7343c7752ea248`, and final persistence alignment `16a7496`.

Those commits were cherry-picked into the isolated QA checkout for testing. The QA deliverable commit contains only the independent tests and this report; it does not contain production changes.

## Verification performed

- Independent QA suite: **30 passed, 0 failed, 0 skipped** using Node's test runner with concurrency 2. This is a fresh result against the committed hardening checkpoint, without a migration override.
- Route type generation and TypeScript `--noEmit`: passed.
- Repository-wide ESLint with `--max-warnings=0`: passed.
- Final complete repository suite and production build: owned by Lead; this report does not claim their pending central results.

The optional `WAVE1_QA_MIGRATION` environment variable in the isolated fixture permits read-only review of an integrator's migration while it is still being developed. Final tests use the committed repository migration by default. Every SQL fixture first applies the accepted nine migrations and then applies Wave 1; the legacy-save test creates an actual v1 save before that upgrade.

## Coverage

| Boundary             | Independent checks                                                                                                                                                                                                                                                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Campaign / owner     | Foreign library returns and owner writes, forbidden owner RPC calls, no anon/authenticated access to foundation/library RPCs, source-bound campaign isolation and foreign entity mapping rejection                                                                                                                                                                |
| Source / pack        | Immutable originals, exact operation replay, changed-content conflicts, stable per-campaign identity mappings, source-only/future/private/expired/reference knowledge filtering before limits, no automatic binding repin                                                                                                                                         |
| Ruleset              | Exact builtin versions, World Logic without HP or dice fields, neutral identity/control scope validation                                                                                                                                                                                                                                                          |
| Runtime              | Unsupported provider/model/options/registry/task and secret-bearing extra fields fail without a transport call; generic errors omit private strings; initial leased pending turn can persist its execution policy; retries retain that choice                                                                                                                     |
| World                | Independent stale campaign/owner/revision/head/epoch checks, canonical entity ID preservation, all four legacy/current PC control channels, late resolver pause without partial mutation, deterministic event IDs, deadline/autonomy independence, immediate causal effects while simulation is Off, explicit reconciliation before re-enabling overdue deadlines |
| Public boundary      | Private additions cannot change public projection; private thread IDs and unexecuted future step observations cannot be injected into public events; client import graphs exclude server/foundation modules and credential references; public runtime DTO omits private markers and internal settlement fields                                                    |
| Transaction / Memory | Staging is inert, malformed commit rolls back gameplay and world together, duplicate commit adds no events, committed reports retain `record` epistemic treatment, source corrections invalidate staged work and public/private event derivatives without rewriting history                                                                                       |
| Saves                | Actual legacy v1 save remains loadable; immutable old manifest unchanged; v2 turn autosave includes world/events/stages/receipts/profile families; exact restore removes abandoned future events before Memory scanning; old callbacks fail; corrections remain effective after restoring an older save                                                           |

## Defects identified and resolved by Lead

1. **World configuration could not run:** a PL/pgSQL variable and JSON source alias both named `s` made every configured world fail with PostgreSQL ambiguity error `42702`. The qualified source alias now passes the configuration and settlement fixtures.
2. **Initial profile pin could not run:** a fresh leased turn remains `pending` before planning, but profile persistence required `generating`. The initial-pending regression now passes and checks retained retry policy.
3. **Campaign identity duplication:** binding the same pack entity under a new binding could allocate another identity in the same campaign. SQL now rejects this; independent campaigns retain separate identities.
4. **Correction derivative gaps:** private event Memory was not fully invalidated and SQL classified world reports as facts. Public/private derivative invalidation and `record` treatment now pass, including restoration of an older save.
5. **SQL settlement defense gaps:** forged deadline completion with Deadline Pressure Off and autonomous legacy-player decisions were accepted. Both direct RPC attacks now fail before event commitment.
6. **Public provenance gaps:** a public event could contain a private thread ID or substitute text from an unreached future step. Both direct RPC attacks now fail after settlement hardening.

## Agreed bounded recovery behavior

The additional recovery regression covers a manual save changing the expected head and loading a staged pending settlement into a child timeline. Both paths reject the original settlement with a safe, non-retryable `conflict`. Recorded input, checks/dice, private plan and narration draft remain intact; no World Event or game-state change publishes. The test also proves that the existing cancellation path works and the failed operation does not block an explicit new action.

Lead chose this explicit safe-pause boundary for new pending world settlements in the Wave 1 contract update. Wave 1 does not silently rebase the saved world proposal, make a replacement decision, reroll preserved dice or rewrite historical origin identity. Existing pending saves without world settlements retain their accepted Phase 2–3.5 behavior. Seamless resumption of a staged world settlement after activation/head change remains intentionally unimplemented and must be disclosed to the owner.

## Scope and evidence limits

This verifies deterministic authority, filtering, persistence and recovery boundaries for the first bounded Wave 1 slice. It is not model-quality evaluation, complete A/B/C implementation, full tabletop rules support, live Supabase/Auth verification, browser/device testing or owner approval. Semantic public text still depends on approved application inputs; schema checks do not prove arbitrary prose spoiler-free. The application remains private and single-user. Final integrated checks and owner-facing milestone status belong to Lead.
