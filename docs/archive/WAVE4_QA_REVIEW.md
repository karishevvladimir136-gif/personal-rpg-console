# Wave 4 independent QA review

Date: September 20, 2026. QA branch: `codex/wave4-qa`, originally based on `f8db002`.

The final independent run passed **44/44 tests**, with no skipped tests, against Lead's current integration checkout. All reproduced findings listed below passed their regressions after Lead's repairs. This is synthetic verification, not owner acceptance or live model-quality evaluation.

The inspected integration HEAD was `9ec70c93d4dc6ed1487409a1ad4bcf5d3a0b945b`, with uncommitted integration repairs. Migration 13's SHA-256 at the end of this run was `0c82fb28bab8c53b060bf61a3cf50d58601a179c1211c2775e9c648994ff6dda`. Final integration should rerun these tests after any further production changes.

## Scope and execution

Only QA tests and this report are changed by this worker. Lead owns production repairs, migrations, normal Game integration, UI, and `DEV_STATUS.md`. Every SQL test uses a new disposable in-memory PGlite database and synthetic records. No real database, provider, account credentials, deployment, or source migration was used.

`tests/wave4-qa-fixture.mjs` applies migrations 1–12 and then migration 13. Tests normally import the current checkout. `WAVE4_QA_SOURCE_ROOT` allows an independent review of Lead's current production modules and migration without copying or editing them. `WAVE4_QA_MIGRATION` can override migration 13 alone. Domain fixture data remains synthetic and local.

Final command:

```powershell
$env:WAVE4_QA_SOURCE_ROOT = 'C:/Users/<owner>/OneDrive/Documents/GitHub/personal-rpg-console/.worktrees/production-wave4'
node --test tests/wave4-qa-*.test.mjs tests/wave4-migration.test.mjs
```

Result: **44 passed, 0 failed, 0 skipped**, approximately 20 seconds.

Service-plan mutation probes explicitly roll back even if an invalid plan is accepted. Each adversarial group first proves that its valid control plan succeeds. These are defense-in-depth tests, not evidence that a public client or model can submit a plan: public request parsing rejects plans and the server recomputes them.

## Verified behavior

- Actual SQL partial purchases and full-stack resale conserve stock and both money balances. Transferred identities, exact operation receipts, repeated clicks, and competing stale quotes behave consistently.
- A late item-revision failure rolls back earlier money changes, the turn, World Events, receipts, immutable version capture, and save creation together.
- Runtime revision, foundation revision, exact head, foreign timeline, activation epoch, and owner repricing invalidate old quotes.
- Quest rewards use ordinary resources and stock. Earned advancement becomes a capability only after an explicit valid choice. Repeated selection has no effect, and the selected advancement survives save/load.
- Reward source entitlement survives save/load and forks made after earning it. Renaming the definition cannot repay the same source. A fork made before the reward does not inherit sibling future receipts. Returning to the original branch preserves its receipt.
- Progression Off applies approved item/currency rewards once without creating XP or choices. Re-enabling progression does not retroactively award XP.
- Owner progression corrections, including a value above one million, persist and survive restore without fabricated earned receipts. Persisted quest/restricted/stolen-item policies, merchant acceptance, funds, and capacity gate commerce.
- Pinned approved Pack preparation creates only selected entities, locations, one merchant storage, and the selected Thread. No stock or currency is fabricated. Exact retry preserves identities. An unchanged review adds only one exact-retry command receipt; it creates no additional world records, events, saves, or runtime revision. Corrections and provenance survive save/load while source/Pack bodies remain unchanged.
- Upgrades from migration prefixes 1–9, 1–10, 1–11, and 1–12 restore old saves with disabled/empty version-zero loop state. Pre-column foundation rows restore `loop_state = null`. Existing entity/item/DM contents and historical vault payloads/digests remain unchanged. Vault mutation remains denied.
- Private-policy and hidden-Actor stock stay out of authenticated item RLS, ordinary campaign reads, runtime snapshots, owner/player projection, and public memory. Referenced derivatives cannot retrieve a now-private item. A reward's public source cannot expose a private item identifier through its editable definition. Anonymous/authenticated callers cannot invoke the service-only loop RPC or read private tables.
- Browser import traversal does not reach private Wave 4 planners, Node authority, or service RPC code. Public request parsing rejects plan/patch authority envelopes. Preparation still uses entry-time Canon when campaign time is later.
- A ruleset switch after loop configuration safely fails without changing existing state. The recent-history projection returns the latest twenty public events in sequence order.

## Findings reproduced and repaired

All rows below passed in the final 44-test run.

| Finding                         | Reproduction and repair verified                                                                                                                                                                                              |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hidden Actor stock disclosure   | Undisclosed merchant stock previously escaped through owner item/policy projections and ordinary campaign JSON. Central visibility now hides it consistently, including RLS and memory.                                       |
| Private reward item reference   | A public quest's reward definition previously exposed a private item identifier. The unsafe definition is now omitted from the public owner projection.                                                                       |
| Inconsistent ruleset change     | Changing console-basic-v1 to World Logic after configuration previously left an old loop profile and broke subsequent projection. The operation now rejects safely with existing progress and receipts preserved.             |
| Unchanged preparation rejected  | Saving an unchanged selection previously produced a valid empty plan that SQL rejected. It now succeeds as a recorded no-op with exact retry.                                                                                 |
| Progression bounds disagreed    | The domain accepted 1,000,001 while SQL used a generic one-million ceiling. The explicit progression bound now agrees with the domain.                                                                                        |
| Trade without payment           | Removing both balance changes from a paid trade plan was accepted. The service boundary now rejects it.                                                                                                                       |
| Inflated reward without receipt | An altered reward plan could credit 999 instead of 107 and omit `reward.granted`. It now rejects atomically.                                                                                                                  |
| Other settlement invariant gaps | Omitted reward stock debit, inflated quantity/progression, substituted pending options, immediate Actor capability, unrelated companion currency, and extra trade stock are rejected. Legitimate control plans still succeed. |
| Guard SQL precedence regression | A guard edit temporarily caused `operator does not exist: boolean #> unknown`, rejecting valid actions. The corrected expressions pass both valid and forged-plan cases.                                                      |
| Unordered recent history        | An unordered merged event aggregate made the last-twenty slice select arbitrary old entries. A 25-event SQL fixture now returns exactly events 6–25 in order.                                                                 |

## Tooling and remaining verification scope

- QA checkout: `next typegen` and `tsc --noEmit` passed.
- QA checkout: repository ESLint with `--max-warnings=0` passed; focused QA lint passed after subsequent test refinements.
- Fresh original Wave 4 commerce/progression/preparation suites on the QA base: **50/50 passed**.
- Default `next build` on the QA worktree was blocked by the existing `node_modules` junction pointing outside Turbopack's project root.
- `next build --webpack` on the QA base passed compilation, TypeScript, page generation, and route generation. Generated `next-env.d.ts` changes were restored; subsequent `tsc --noEmit` passed. This is not a claim that the final integration checkout passed its separate build gate.

The Actions worker is separately verifying actual normal Game runtime checkpoint/commit settlement in `tests/wave4-game-sql.test.mjs`, using this QA fixture. No browser session, physical iPhone, live provider quality, final full repository suite, or owner approval is claimed here. Lead must perform the final combined integration checks and report implementation separately from owner acceptance.
