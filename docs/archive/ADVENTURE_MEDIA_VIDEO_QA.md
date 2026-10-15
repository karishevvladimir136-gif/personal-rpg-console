# Independent VIDEO review

Ownership: only this report and `tests/media-video-independent.test.mjs` on the reused isolated QA branch. Production, migrations, fixtures, shared status and final repository verification remain with Lead.

The independent test reads the integrated source and migration files through `VIDEO_REVIEW_ROOT`. It uses real disposable Postgres-compatible SQL authority, genuine schema4 FRAME drafts and explicit owner acceptance, and production VIDEO orchestration with injected provider/storage stubs. A failing global network guard prevents accidental provider calls. No credentials, hosted database, production storage, paid generation or unrelated product lanes are involved.

Final focused result, 2026-09-28: **44 passed, 0 failed, 0 skipped**, fresh disposable setup and standard Node 24.19.0 test runner, 28.52 seconds. Owned test syntax, zero-warning scoped ESLint, Prettier and diff checks passed. Lead retains the combined repository suite, nonincremental typecheck, lint, build and browser verification.

## Actual authority and recovery coverage

- Genuine reviewed schema4 FRAME drafts become eligible only after explicit owner acceptance. A warning draft is eligible after acceptance; an unaccepted/discarded FRAME and historical never-approved art are refused. The VIDEO pins the exact asset revision, FRAME document version, image digest and owner approval request.
- Real SQL refuses forged approval identifiers even when the public provenance reader accepts their syntax. Browser-saved completed FRAME/Asset records cannot manufacture the missing private acceptance evidence. Foreign campaign, wrong owner, unapproved/private basis and extra gameplay patch fields cannot attach output. Service RPC grants and inaccessible private dispatch evidence are checked directly.
- Scene, save head, timeline, ordinary Canon correction, source asset revision and a committed gameplay event invalidate dispatch and completion. Retained pixels and previous art survive refusal. Ordinary document correction cannot gain lifecycle immunity by using a valid VIDEO prefix.
- Concurrent identical dispatches make one claim, reservation and provider submission. Concurrent polls may retrieve the same result but persist one Asset and immutable output. Changed mutation replay is refused. Ready completion replays its exact receipt; old completion intent is refused after load onto another timeline.
- Lost claim, submit, submission-record, storage and completion responses are exercised before or after persistence. Unknown submission retains the existing generating job and reservation; polling without its recorded provider ID neither calls the provider nor submits a replacement. Explicit cancellation and a separate explicit replacement job remain possible.
- FRAME and VIDEO consume one combined dollar ledger. VIDEO reserves exactly 7,000,000 micros with zero extra QA reserve, at most two clips; FRAME retains its separate call quota and 400,000 image plus 200,000 QA reservation. A ledger one micro below the next required reservation refuses the claim. Null VIDEO policy makes zero VIDEO claims, source reads or provider calls.
- Failed/cancelled new VIDEO preserves the earlier ready VIDEO and accepted FRAME. Ready historical VIDEO remains readable through the scoped private output RPC after save/load, while its archived basis cannot start another job.

## Privacy and presentation-only evidence

The actual fal adapter runs with an injected offline fetcher. Its request contains only the exact accepted PNG as data, public animation prompt and fixed parameters: ten seconds, 720p, automatic aspect ratio, synchronized audio requested, standard bitrate and H264. It uses one POST with `X-Fal-No-Retry: 1`, then reads the same provider request ID. Private DM, foreign campaign, unapproved reference and private QA canaries do not enter the request. Provider credentials do not accompany the media CDN download. Wrong-request status, unexpected model, unapproved/credential-bearing URLs, wrong content type, truncated MP4 structure and lying size metadata are refused.

The comparison covers authoritative public facts, non-media Documents/Assets, DM/private runtime, turns/events, Memory facts/checkpoints/jobs, World facts/commands, source head/Canon/timeline and normal runtime play. As with FRAME, existing media document bookkeeping advances the inherited Memory cache generation; that cache generation counter is explicitly excluded from this fact comparison. No other gameplay mutation is exempted.

The real integrated Lab fixture produces an eligible completed checkpoint before media work. FRAME acceptance plus successful/failed/cancelled VIDEO leaves its exact continuation basis and gameplay state unchanged. Normal continuation interpretation/approval then creates a prepared child using scripted data. An ordinary owner correction subsequently advances Canon and makes the old checkpoint ineligible.

## Populated upgrade coverage

Genuine migration prefixes **24, 25, 26, 27 and 28** each contain public/private gameplay, merchant stock, wallet balances, normal Wave4 commerce configuration and an actual partial-buy receipt, schema1 MOCK media and a manual save before upgrading through migration29. Exact commerce commit/receipt replay preserves both wallets and stock. Original Documents/Assets, immutable version IDs/digests/payloads and manifests remain unchanged; historical load restores items/entities and private state.

Separate genuine prefixes26/27/28 preserve completed schema2/3/4 FRAME Assets, immutable document history, exact completion receipts, reservations and saved manifests through upgrade/load. Schema2/3 art remains readable without being relabelled as owner-approved; schema4 keeps its original explicit approval.

## Central defects found and repaired

1. `VideoError` used a TypeScript parameter property, so the repository's standard strip-only Node test runner failed before loading VIDEO. Lead replaced it with an explicit property/assignment. The final run uses the standard runner without transform flags.
2. Duplicate `rpg_video_claim` receipt lookup reused `b` for a SQL table alias and a PL/pgSQL budget record. Real concurrent dispatch reproduced SQL42702. Lead renamed the alias; the concurrent lifecycle test now passes.
3. The inherited FRAME call limit counted newly added VIDEO reservations. One FRAME plus one VIDEO incorrectly exhausted a two-FRAME allowance below the shared dollar ceiling. Lead extended migration29 to filter the FRAME quota/duplicate reservation by media kind, preserving historical migrations. The regression now passes.

No unresolved defect was found in this bounded independent review. This is not a hosted Supabase authorization/storage check, real fal submission, playable codec/audio/duration verification, or live visual evaluation. The MP4 fixture is a structural container stub. Missing credentials are represented by the unconfigured policy test; no real environment secrets were read. Historical failed FRAME evidence remains unchanged; the finite later illustration gate does not prove deterministic likeness or universal spoiler detection.

## Reviewed source and reproduction

Reviewed integration checkout: `8905d98c33cd0160cbe06d0e9cde33c33bf4eb43` plus the uncommitted VIDEO implementation below, before Lead's final freeze. SHA-256:

| Integrated source                                  | SHA-256                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| `src/lib/scene-video/model.ts`                     | `286997056971AB5443571E32A29F99E7BB4AB3993354A9B0819F376B28F62782` |
| `src/lib/server/media/video-orchestration.ts`      | `D91D20DEE3F72714B46E7BFC8509CE51D81248E90292F9596A0B1C359BF429CF` |
| `src/lib/server/media/video-provider.ts`           | `D4C28906957F9736CE7B332E30A34BE5CE8787DCE9671D102AE2162F1253D6EB` |
| `src/lib/server/media/video-server.ts`             | `E1EEF1F493B5D337DA295D63B57730FB219F18AD7AB1A8452B222C159A968F4E` |
| `supabase/migrations/202609280029_scene_video.sql` | `3295A1B630E3E6AA6322DF043E50AACC5E154167B495F28537DF8C5A6EE70652` |

Focused command from the isolated worker checkout:

```powershell
$env:VIDEO_REVIEW_ROOT='C:/Users/karis/.codex/worktrees/v1-timeline/personal-rpg-console'
& 'C:/Users/karis/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' --test tests/media-video-independent.test.mjs
```

Only the two owned QA files are committed. No production file, migration, shared fixture, status file, main checkout, credential or real provider result was changed by this worker.
