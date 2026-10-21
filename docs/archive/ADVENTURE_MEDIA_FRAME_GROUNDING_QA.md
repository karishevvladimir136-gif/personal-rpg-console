# Independent FRAME grounding QA

## Result and scope

**PASS: 12/12 focused offline checks, zero failures or skips.** No unresolved material production defect was found in this bounded authority/privacy review. New FRAME pixels cannot attach without an exact durable verifier pass; failed, uncertain, forged or stale results cannot bypass that gate. This is deterministic implementation evidence, not owner approval or evidence that a live vision model recognizes every mismatch.

Review date: 2026-09-28. The worker changed only `tests/media-frame-grounding-independent.test.mjs` and this report on `codex/adventure-v1`. No production, migration, shared fixture, Adventure or status file was edited. There were no provider calls, paid generation, real database changes, data imports or deployments. The full suite/build remain Lead-owned verification.

The reviewed integration was `codex/v1-adventure-media` at `582935da96e9c36da9426e6c86d78a0da5a2ae1e` **plus an uncommitted grounding candidate**. The frozen ownership contract's FRAME grounding addendum authorized this exact test/report lane. This report does not describe a final frozen candidate; the hashes below identify the source used for the passing run.

## Evidence

The test imports the integration's real `tests/phase35-storage-fixture.mjs` by file URL. Its disposable PGlite database applies the actual migration prefix **1–27**; a separate database applies **1–26**, creates genuine completed schema-2 FRAME/save history, and then applies migration 27. The test does not emulate SQL completion/claim authority.

| Independent case                    | Observed result                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No check, pending check, exact pass | New image attachment denied before an exact durable pass; one asset after pass.                                                                                                                                                                                                                                                                    |
| Failed verdict                      | `fail_grounding` cannot attach; public status contains no private verdict details.                                                                                                                                                                                                                                                                 |
| Uncertain verdict                   | `uncertain_review` cannot attach; public status contains no private verdict details.                                                                                                                                                                                                                                                               |
| Image/job/campaign pins             | Changed SHA-256, job version, owner, campaign, asset campaign or asset receipt identity denied; check history cannot be rewritten/deleted.                                                                                                                                                                                                         |
| Concurrent submissions/budget       | Five submitted claims produce one durable claim; dispatch/claim retry does not recharge. USD 0.60 reserved once: USD 0.40 image plus USD 0.20 check. Exhausted budget rolls back the next dispatch. These are disposable reservations, not observed charges.                                                                                       |
| Lost completed responses            | Exact verifier result and final attachment receipts replay unchanged; changed replay denied; no second asset or reserve.                                                                                                                                                                                                                           |
| Lost pending claim                  | Repeated claim returns pending existing receipt, never fresh permission to call a verifier or attach.                                                                                                                                                                                                                                              |
| Genuine owner correction            | A real scene correction blocks pending check completion and late attachment. Already durable verifier evidence remains exactly replayable as operational history, without granting attachment.                                                                                                                                                     |
| Grants                              | Anonymous/authenticated roles cannot execute verifier functions or read private evidence; service claim authority is present.                                                                                                                                                                                                                      |
| Genuine legacy upgrade              | Existing schema-2 art, immutable save manifest and successful completion receipt survive upgrade unchanged. New schema-2 creation/dispatch and unchecked completion are denied; historical reservations are neither backfilled nor recharged.                                                                                                      |
| Requester privacy/isolation         | Actual orchestration and Responses requester with injected offline fetch receive only the exact public contract and scoped PNG. Private, other-campaign and unapproved-reference canaries, internal IDs/pins, diagnostic content, tools and state grants are absent. Input ceiling/output cap, no response storage and strict schema are asserted. |
| Forged verifier output/retry        | Extra public/private patches or World Events fail closed through the actual requester/parser/SQL path. Exact retry/recovery makes no second image/check call and grants no asset.                                                                                                                                                                  |

Authoritative comparisons cover public gameplay/ordinary documents, DM private state, runtime state/turns/events, World foundations/stages/events/commands, private Memory sources/summaries/checkpoints/jobs, source head/Canon generation and ordinary playable state. The verifier claim/result stage is separately compared with the **complete** Memory generation intact and makes no changes to those rows.

### Inherited Memory bookkeeping caveat

Normal FRAME document updates use accepted document authority and its Phase 3 `memory_record_source` trigger. That trigger advances the Memory cache generation and invalidates cached summaries/checkpoints; therefore a complete FRAME lifecycle does not leave every private operational row byte-identical. The disposable migration-26 and migration-27 lifecycles showed the same generation delta (6 in this fixture, including ordinary lazy initialization). New verifier claim/result receipts added **zero** invalidations. Runtime revision, Canon generation, DM private state and World Events stayed unchanged.

The broad lifecycle assertions exclude only this cache-generation field; the dedicated verifier-stage assertions exclude nothing. No Memory/document redesign or weakened source fence was introduced. No new checkpoint-eligibility cause arose from this correction, so no broader Lab rerun was performed by this lane.

## Verification and reproduction

Bundled Node 24.19.0, explicit isolated worker directory, read-only integrated source override:

```powershell
$env:FRAME_GROUNDING_REVIEW_ROOT='C:\Users\<owner>\.codex\worktrees\v1-timeline\personal-rpg-console'
& 'C:\Users\<owner>\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests/media-frame-grounding-independent.test.mjs
```

When integrated, the test defaults to its own repository root without the override.

- Focused independent tests: **12 passed, 0 failed, 0 skipped**, approximately 4.0 seconds.
- Node `--check` for the owned test: passed.
- Scoped ESLint `--max-warnings=0`: passed, zero warnings.
- Prettier check for the owned test: passed.
- No new TypeScript production files; the full typecheck/build and integrated gate remain Lead-owned.

Review included `src/lib/server/media/{orchestration,grounding,grounding-state,server}.ts`, `src/lib/visual-frame/{real-frame,closed-world}.ts`, the Responses requester in `src/lib/server/dm/provider.ts`, migration 27, the scoped contract addendum and their real fixture boundaries.

| Reviewed source                                        | SHA-256                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| `src/lib/server/media/orchestration.ts`                | `2c7c6f6642fe45a6f9fca7472081bbd6c9ec212f6e36168d607ca61c250da974` |
| `src/lib/server/media/grounding.ts`                    | `e379a218da174078f51dfef091118d5baf6c531fc547c9a154c56e316e93dd7a` |
| `src/lib/server/media/grounding-state.ts`              | `95ea0a5f2bd7e9247fb06152adac2c2af202a84eeb6252fa153db3846d78029c` |
| `src/lib/server/media/server.ts`                       | `06b61a12e7fddc7c59d8a635007a4ee646180d42a5b1d02298b8a3dacc69880b` |
| `src/lib/visual-frame/real-frame.ts`                   | `1531e29eefb750ab8e541d4233e7e10d79dc0536180511ade5a827fc1e7459b6` |
| `src/lib/visual-frame/closed-world.ts`                 | `08bf9df0934684d7e49ff9c1993094b6b554f36115921c66c6c2539a57b592dd` |
| `src/lib/server/dm/provider.ts`                        | `70deac71ceb614ae853dcc2cb5741da3d7095bc66d4fad2b97619ed472423292` |
| `supabase/migrations/202609280027_frame_grounding.sql` | `bad75bf792b44a6c259d329b00fdc7cba9001994da5a77e0b6491d7296d31a07` |
| `tests/phase35-storage-fixture.mjs`                    | `ceada0a0e81886cac595dc1c78d6e2dc95f4f34113a422ee935f8d1d5a38bae1` |

## Limits

The concurrent JavaScript submissions share PGlite's single database execution queue. They exercise the real claim/receipt functions and deduplication, but do not replace an independent multi-session Postgres race test. Storage is an injected scoped in-memory adapter; the PNG and vision replies are synthetic. This pass does not test real Storage access, provider availability/cost, live visual accuracy, browser presentation or owner media acceptance. Failed/uncertain evidence remains private and no automatic paid retry was exercised or authorized. Final frozen-candidate checks and any bounded live sample remain separate Lead gates.
