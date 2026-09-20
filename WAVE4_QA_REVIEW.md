# Wave 4 independent QA review

Date: September 20, 2026. QA base: `f8db002`, branch `codex/wave4-qa`.
This report records independent synthetic evidence, not owner acceptance or live model-quality evaluation.

## Scope and execution

Only the QA tests and this report are changed by this worker. Production repairs, migrations, normal Game integration, UI, and `DEV_STATUS.md` belong to Lead. All database tests create disposable in-memory PGlite databases with synthetic records. No real database, provider, account credentials, deployment, or source migration was used.

`tests/wave4-qa-fixture.mjs` builds the database from committed migrations 1–12 and then migration 13. Tests normally use the QA checkout. `WAVE4_QA_SOURCE_ROOT` can point to Lead's checkout to import current production modules and migration 13 without copying or editing them. `WAVE4_QA_MIGRATION` optionally overrides only migration 13. Pure-domain fixture data remains synthetic and local.

Run the independent checks with:

```powershell
$env:WAVE4_QA_SOURCE_ROOT = 'C:/Users/karis/OneDrive/Documents/GitHub/personal-rpg-console/.worktrees/production-wave4'
node --test tests/wave4-qa-*.test.mjs tests/wave4-migration.test.mjs
```

The tests assert the required safe behavior. A reproduced defect therefore remains a failing regression until the corresponding production repair passes it. Service-plan mutation probes explicitly roll back even when an invalid plan is accepted. They are defense-in-depth tests, not evidence that a public client or model can submit a plan: the public request parser rejects plans, and the route recomputes them on the server.

## Verified behavior

- Actual SQL partial purchases, full-stack resale, both money balances, canonical transferred identities, total stock conservation, exact operation receipts, repeated clicks, and competing stale quotes.
- Late item-revision failure rolls back earlier money changes, the turn, World Events, receipts, immutable version capture, and save creation together.
- Runtime revision, foundation revision, exact head, foreign timeline, activation epoch, and owner repricing invalidate old quotes.
- Quest reward grants use ordinary resources and stock. Earned pending advancement becomes a capability only after an explicit valid choice. Repeating the choice has no effect; its state survives save/load.
- Reward source entitlement persists after save/load and into a fork made after earning it. Renaming the reward definition does not repay the source. A fork made before the source was rewarded does not inherit sibling future receipts. Returning to the original branch preserves its receipt.
- Progression Off still applies approved item/currency rewards once without creating XP or choices. Re-enabling progression does not retroactively award XP.
- Owner progression corrections survive save/load without fabricated earned receipts. Persisted quest/restricted/stolen-item policies, merchant acceptance, funds, and capacity gate commerce.
- Approved pinned Pack preparation creates only selected entities, locations, one merchant storage, and the selected Thread. No stock/currency is fabricated. Exact retry preserves identities. Owner corrections and source provenance survive save/load while immutable source/Pack bodies remain unchanged.
- Upgrades from migration prefixes 1–9, 1–10, 1–11, and 1–12 restore old saves with disabled/empty version-zero loop state. Pre-column `world_foundations` rows restore `loop_state = null`. Existing entity/item/DM contents and historical vault payloads/digests remain unchanged. Vault mutation remains denied.
- Private-policy stock is omitted from authenticated item RLS, ordinary campaign reads, runtime snapshots, owner/player projection, public memory search, and referenced memory derivatives. Anonymous/authenticated callers cannot invoke the service-only loop RPC or read private tables.
- Browser entry-point import traversal does not reach the private Wave 4 planners, Node authority, or service RPC code. Public request parsing rejects plan/patch authority envelopes. Preparation uses entry-time Canon even when campaign time is later.

## Reproduced findings sent to Lead

| Finding                                         | Impact / reproduction                                                                                                                                                                                                                                                               | State at first review                                                         |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Hidden Actor inventory projection               | Make the existing merchant Actor undisclosed while retaining public stock policy. `foundationLoopProjection.owner.items` and `.itemPolicies` reveal stock/owner identities; ordinary campaign JSON also includes the stock. Tests require consistent hiding through RLS and memory. | Open; Lead repairing centrally.                                               |
| Reward entry references private stock           | A reward tied to a public quest includes a private item. `owner.rewards.entries` exposes the hidden item identifier despite `owner.items` omitting it.                                                                                                                              | Open; reported with pure reproduction.                                        |
| Ruleset switch leaves inconsistent profile      | After configuring/granting a reward, accepted `owner_configure` changes console-basic-v1 to World Logic but retains the old `loop_state.profile`. The next ordinary foundation projection throws `stale_progression`.                                                               | Open; requires safe rejection or compatible preserved state.                  |
| Unchanged Pack preparation rejected             | Reopen a prepared selection and Save without edits using a new operation. The pure planner produces an unchanged state and no events; the unconditional SQL commit rejects it.                                                                                                      | Open; route or SQL can handle an explicitly validated no-op.                  |
| Progression bounds disagree                     | Owner correction value 1,000,001 passes the domain's 1e9 bound, but migration 13 originally used the general 1e6 SQL bound for progression.                                                                                                                                         | Lead repair in progress; requires fresh regression run.                       |
| Paid trade plan omits payment                   | Remove the two entity balance changes from a valid paid trade plan and invoke the service RPC. Initially accepted.                                                                                                                                                                  | Fixed in Lead override and independently retested passing.                    |
| Reward plan inflates currency and omits receipt | Change expected credits 107 to 999 and remove `reward.granted`. Initially accepted by the service RPC.                                                                                                                                                                              | Fixed in Lead override and independently retested passing.                    |
| Remaining service settlement invariants         | Reward plans could omit the source-item debit, inflate recipient quantity/progression, substitute pending options, or grant Actor capability directly. Trade plans could append unrelated companion currency, an extra stack, or a capability.                                      | Open at last adversarial run; Lead has reproductions and is extending guards. |

The last completed aggregate against the then-current Lead override had 19 passing and 4 failing tests out of 23; later added cases are reported separately above, not represented by that historical count. The additional advancement/Off/persisted-policy cases passed 3/3. The reward-reference and profile-switch regressions failed individually as documented. The service-only adversarial run passed the quest/private/foreign-owner rejections but exposed the remaining settlement findings. Final integration requires a fresh run after all Lead fixes.

## Tooling checks on the QA checkout

- `next typegen` and `tsc --noEmit`: passed.
- Repository ESLint with `--max-warnings=0`: passed; focused QA lint also passed.
- Fresh original Wave 4 commerce/progression/preparation suites: 50/50 passed.
- Default `next build`: blocked by the existing worktree `node_modules` junction pointing outside Turbopack's project root.
- `next build --webpack`: passed production compilation, TypeScript, page generation, and route generation. Generated `next-env.d.ts` changes were restored; a subsequent `tsc --noEmit` passed.

Normal Game runtime checkpoint/commit settlement is being tested separately by the Actions worker in `tests/wave4-game-sql.test.mjs`, using this QA fixture. This review does not claim browser coverage, physical iPhone coverage, a fresh full repository suite on final integration, live provider quality, or owner approval.
