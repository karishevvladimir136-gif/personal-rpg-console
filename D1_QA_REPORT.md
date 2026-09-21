# World Lab D1 independent QA

Independent review completed on September 20, 2026. **29/29 adversarial tests passed, with no skips**, against the lead's current integration source through `D1_QA_SOURCE_ROOT`. All SQL used fresh, disposable PGlite databases. No application credentials, live Supabase, provider requests, imported campaigns, deployment, or main-branch changes were used.

This is code and disposable-database evidence, not owner approval or a claim about a hosted deployment. The lead's final integrated checks and EN/RU desktop/mobile browser acceptance remain separate gates.

## Scope and source

- QA branch base: `0e1e94281a246187c0cb0414ef48f2905b7eadff`.
- Reviewed integration worktree: `.worktrees/world-lab-d1`, including the lead's uncommitted migration/service changes and integrated Runtime/Memory work.
- Migration SHA-256 during the complete successful run: `2480148e79f302f059ef2455a0dda57febf163d6fb469cd8c6f0e43ebea79e81`.
- Changes owned by QA: `tests/d1-qa*.mjs` and this report only. The lead made every production fix.

The suite consumes `tests/d1-sql-fixture.mjs` from the selected source root and exercises the actual `rpg_world_lab` SQL function and production reader, writer, service, projection, and Memory adapters. Its World input helper uses exact detached rows and the existing pure World validator; it never reads or installs a live RuntimeSource.

## Verified behavior

| Boundary                       | Independent evidence                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Live isolation                 | Successful deterministic commits leave all 40 accepted live capture families and playable timeline/head/epoch authority unchanged. Sibling detached envelopes and another campaign remain unchanged.                                                                                                                                                                                                                                                   |
| Wave 4 preservation            | A real configured currency, item policy, progression track, awarded reward, pending progression choice, entity resources, inventory, and private state survive detached inheritance and continuation exactly.                                                                                                                                                                                                                                          |
| Exact membership               | SQL rejects missing/duplicate/foreign manifest references, substituted families, corrupt payload digests, changed row keys, foreign campaign payloads, and cross-run checkpoint selection. Historical versions, inputs, and receipts are immutable.                                                                                                                                                                                                    |
| Fencing and retries            | Two proposals from one head produce one winner. Stale head/lease/input/canon/owner/campaign/Scenario/Divergence fences fail. Cancellation and replacement revoke old callbacks. Lost responses and exact committed retries create no duplicate step or renewed lease. Service retries return their original checkpoint even after later progress.                                                                                                      |
| Failure atomicity              | A synthetic failure injected after vault inserts but before manifest insertion rolls back versions, manifests, head updates, and receipts. Retrying after removing the injected failure succeeds once.                                                                                                                                                                                                                                                 |
| Independent timeline authority | Normal live load/switch changes the live epoch without revoking a valid detached callback. Canon-generation or pinned source-version changes reject new work, preserve historical inputs, and mark inspection as source-changed.                                                                                                                                                                                                                       |
| Bounded execution              | Two explicit 60-minute continuations stop at the authorized 120-minute horizon. Resolver-required work pauses at the existing coherent checkpoint. Resume alone advances no time. Unchanged-time no-op writes no versions or checkpoint. Provider-call tripwire remains at zero.                                                                                                                                                                       |
| Public privacy                 | Added private/future events do not change public summaries, event counts, or serialization. Raw input, source heads, leases, private titles/counts, DM state, and SQL diagnostics remain outside public DTOs. Valid public text-span evidence survives; malformed/foreign/private/future evidence is withheld.                                                                                                                                         |
| Actor Memory                   | Positive knowledge and transitive references are required. A flood of 150 private/future/unknown high-ranking candidates cannot crowd out valid known evidence under a one-excerpt limit. Unknown aliases remain unavailable. Missing required evidence and stale canon return neutral bounded pauses.                                                                                                                                                 |
| Client/database boundaries     | Browser authority-field injection and direct commit requests fail validation. Writes require same origin. Service-role RPC access works; anon/authenticated roles cannot invoke the private RPC or read its run/receipt ledger. The server wrapper requires campaign authorization and `server-only`.                                                                                                                                                  |
| Historical upgrades            | Populated prefixes 7, 9, 10, 11, 12, and 13 upgrade through migration 14. Existing version payloads/digests, manifests, save points, entities/items, and private state remain unchanged; historical saves load. Genuine schema 1 and pre-Wave-4 schema 2 family inventories/payloads stay intact, with no Lab rows added to playable captures. Prefix 7 predates Saves, so its proof covers populated application state and post-upgrade Saves access. |

## Defects found and repaired by the lead

1. Valid text-span evidence was compared with the whole source digest and disappeared from public projections. Reproduced before repair; regression passes.
2. SQL allowed `trigger: none` to advance time although the writer prohibited it. Found in source review; direct-SQL regression passes.
3. A null lifecycle revision bypassed the SQL revision comparison. Found in source review; null-revision rejection and unchanged-state regression pass.
4. A PL/pgSQL `payload` name ambiguity prevented positive commits. Reproduced against actual SQL; all positive commit paths now pass.
5. SQL accepted an approved Pack containing reviewed but unresolved contradictions even though the server rejected it. Reproduced through accepted Library/binding APIs; SQL now rejects every included unresolved Pack.
6. Service retries returned the current run instead of the original operation result. Found in source review; historical prepare/continue/resume result regressions now pass.

No unresolved material defect was observed in the exercised boundaries at handoff.

## Actual checks and limits

- `node --test --test-concurrency=2 tests/d1-qa*.test.mjs`: **29 passed, 0 failed, 0 skipped** against the integration source; 26.5 seconds in the final run.
- Focused ESLint on all QA files with `--max-warnings 0`: passed after final test edits.
- Whole-worktree ESLint with `--max-warnings 0`: passed.
- Next type generation plus `tsc --noEmit --incremental false`: passed.
- `next build --webpack`: passed.

The last three checks ran in the independent QA worktree on its base production source plus QA files. They do not replace the lead's complete integrated suite/typecheck/lint/build. Next-generated changes to `next-env.d.ts` were restored before handoff.

PGlite serializes SQL submissions: the race test proves rejection of the losing callback after both callers read one head, not real multi-session hosted lock scheduling. UI files had not all landed when this review concluded, so a complete final browser import graph and EN/RU desktop/mobile rendering remain with integration acceptance. No physical-device or hosted verification is claimed.

To reproduce against another checkout, set `D1_QA_SOURCE_ROOT` to its absolute path, then run the focused Node test command above. When these files are integrated into the same checkout, the environment override is unnecessary. No manual owner setup is required for this QA work.
