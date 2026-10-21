# Independent FRAME draft / owner-approval QA

## Result and scope

**PASS: 24/24 focused offline checks, zero failures, skips or cancellations.** No unresolved material defect remains in this bounded review. Safe and warning QA results create a draft with no Asset. Explicit owner acceptance attaches that exact draft atomically; discard and hard rejection preserve previous accepted art and cannot become ordinary accepted art. Gameplay, Canon and an existing eligible Lab checkpoint remain unchanged by the media lifecycle.

Review date: 2026-09-28. Worker branch: `codex/media-frame-approval-qa`, starting at `07a6b8dce89eda81ed887b07d70110f08161ed23`. This lane changed only `tests/media-frame-owner-approval-independent.test.mjs` and this report. Production, SQL/migrations, fixtures, status and historical evidence were read only; all production repairs were made by Lead.

The owner request is attachment `b86e066f-cc82-4a1f-8f7e-85eb2885347b/Pasted text.txt`, with the ownership boundary in `ADVENTURE_MEDIA_V1_CONTRACTS.md`. The reviewed integration was `codex/v1-adventure-media` at `d61d6fbcc26312873930ec74be5a61841dd05cbd` **plus the uncommitted FRAME approval candidate**. Source hashes below identify the passing review; this is not a final frozen-candidate or owner approval claim.

No providers, hosted database, real/private data, paid generation, imports or deployment were used. Added live spend and live reservations: **USD 0**. All budget amounts in these tests are disposable SQL fixture reservations.

## Evidence

The test imports the actual integrated `tests/phase35-storage-fixture.mjs`, production modules and migrations through an explicit source-root override. PGlite applies real migrations **1–28**. Separate populated databases create genuinely completed schema-2 art under migrations **1–26**, and schema-3 art with a historical verifier pass under **1–27**, then upgrade to the current prefix. The SQL draft, check, acceptance, receipt and pixel-read authorities are exercised directly, not emulated by a fixture.

| Case                                  | Observed result                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Safe and warning drafts               | Both native QA v2 statuses persist schema-4 draft/review/hash without an Asset. Private QA reasons are absent from ordinary campaign/save responses.                                                                                                                                                                                    |
| Explicit acceptance                   | Only the owner acceptance action moves the exact reviewed draft to completed plus one normal Asset. New provenance records the acceptance request and exact draft version.                                                                                                                                                              |
| Discard / regenerate / prior art      | Discard retains immutable output and document history, adds no Asset and preserves the previous accepted Asset exactly. Regeneration queues a separate job; a new explicit dispatch reserves its own image and QA allowance.                                                                                                            |
| Hard rejection                        | Output remains private/auditable; job is failed with no reviewable draft and no Asset. Prior accepted art remains byte-identical.                                                                                                                                                                                                       |
| Forged QA and completion              | Missing/pending QA, legacy verdict on a new job, extra state patches, changed SHA/job version/owner/campaign, forged review hash, foreign storage path, changed output or Asset identity cannot draft or attach.                                                                                                                        |
| Wrong-status material findings        | All nine material/spoiler/safety categories reject `review_warning` in the production parser and SQL validator. Only illustrative variation or uncertain quality can be owner-reviewable warnings.                                                                                                                                      |
| Duplicate / lost responses            | Exact draft, verifier, acceptance and discard receipts replay; changed requests are rejected. Lost image upload, draft persistence and owner acceptance responses produce no extra image or claimed QA request.                                                                                                                         |
| Pending unknown check                 | A lost QA claim remains the same pending claim. It grants neither another verifier call nor a reviewed draft or Asset.                                                                                                                                                                                                                  |
| Submitted concurrency / budget        | Five submitted claims and repeated decisions grant one reservation, one check, one draft and one Asset. USD 0.60 is reserved once: USD 0.40 image plus USD 0.20 QA. Exhausted budget rolls back the next dispatch.                                                                                                                      |
| Exact recovery after later correction | Original immutable generating intent reconstructs only the durable draft receipt, even after acceptance and an ordinary scene correction. It grants no new art, generation or gameplay mutation.                                                                                                                                        |
| Stale acceptance / callbacks          | Real scene correction, source-head change and timeline activation reject stale owner acceptance. Late check/draft callbacks after factual correction fail; already completed QA evidence remains exact operational history.                                                                                                             |
| Scoped requester privacy              | Actual orchestration and Responses requester receive only the exact public illustration contract and scoped PNG. DM-private, other-campaign and unapproved-reference canaries, private/internal identifiers, state patches, tools and credentials are absent. Strict schema, no response storage and bounded input/output are asserted. |
| Malicious model response              | Added public/private patches or World Events fail closed through the production requester/parser and real SQL. Exact retry creates no second image/check and grants no Asset.                                                                                                                                                           |
| Corrupt stored pixels                 | Altered PNG bytes, dimensions, length, usage shape, SHA or campaign path refuse acceptance; restoring the unchanged original permits the same explicit acceptance without paid regeneration.                                                                                                                                            |
| Immutable evidence                    | QA contract/result/hash and assigned draft/owner pins cannot be rewritten or deleted before or after acceptance.                                                                                                                                                                                                                        |
| Draft-pixel authorization             | Exact safe/warning drafts alone return the canonical path/hash. Queued, discarded, foreign, unauthorized and manually authored unchecked draft bodies cannot expose pixels, including a claim whose result and draft pin are NULL.                                                                                                      |
| Grants                                | Anonymous/authenticated roles cannot execute draft/check/accept/recovery/pixel authorities or read private QA receipts; the service role has the required callable authority.                                                                                                                                                           |
| Genuine historical upgrades           | Old record/Asset/receipt bytes and immutable save manifests survive upgrade. Historical saves read and load; historical owner-approval markers remain absent. New legacy creation/dispatch and retroactive acceptance are denied; old reservations are preserved exactly.                                                               |
| Lab / gameplay / Canon                | Full draft → acceptance, replacement → discard and hard-reject lifecycles preserve ordinary authoritative state and an exact eligible NON-CANON Lab checkpoint. A normal continuation from that checkpoint still prepares an exact child.                                                                                               |

Authoritative comparisons include the public gameplay snapshot and ordinary documents, runtime state/turns/events, DM-private state, World foundations/stages/events/commands, private Memory sources/summaries/checkpoints/jobs, source head/Canon generation and ordinary playable state. The inherited Memory cache-generation field from normal FRAME document writes is excluded from broad lifecycle comparisons, as in the prior grounding QA. Dedicated check claim/result comparisons include the complete Memory generation and confirm those operational receipts add no invalidation. No Memory redesign or weaker factual/source fence was introduced.

## Findings and repairs

Lead centrally repaired three issues during this review:

1. **Warning-category laundering, found by inspection.** The initial v2 parser allowed a material/spoiler category under `review_warning`. Lead tightened the parser, provider instructions and SQL result validator. The independent nine-category adversarial test now passes.
2. **Missing evidence treated as a pixel-read match, found by inspection.** The initial draft-pixel SQL used ordinary inequality against nullable check result/draft pins, which can evaluate to NULL instead of refusing access. Lead made comparisons null-safe and required a safe/warning verdict. The independent ordinary-document-authoring attack with a pending claim now refuses pixel access.
3. **Migration delimiter failure, reproduced.** The newly appended draft-pixel function initially used single dollar delimiters. Two shared fixture setup runs failed with SQL `42601`, position 29585, before any case could run. Lead repaired the literal delimiters; the final migration, populated upgrades and all 24 checks pass.

The first 20-case run passed 19 checks; one test predicate accidentally matched the harmless word “diagnostics” in fixed provider instructions. It was corrected to assert exact request fields while retaining all canary checks. After the central repairs, one corruption test correctly refused pixels with `invalid_image`; its local assertion was corrected to recognize that fail-closed error. Neither predicate adjustment changed production authority or weakened the privacy/artifact assertions.

## Verification and reproduction

Bundled Node 24.19.0; explicit worker checkout and read-only integrated source override:

```powershell
$env:FRAME_APPROVAL_REVIEW_ROOT='C:\Users\<owner>\.codex\worktrees\v1-timeline\personal-rpg-console'
& 'C:\Users\<owner>\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests/media-frame-owner-approval-independent.test.mjs
```

After integration, the test defaults to its own repository root. It uses the actual migration list and has no credentials or hosted database configuration.

- Focused independent tests: **24 passed, 0 failed, 0 skipped**, 13.19 seconds.
- Node syntax check: passed.
- Scoped ESLint with `--max-warnings=0`: passed, zero warnings.
- Prettier check for the two owned files: passed.
- Full repository suite, type generation/nonincremental typecheck, repository lint/build and browser/live product gate: Lead-owned final verification, not executed or claimed by this lane.

| Reviewed source                                           | SHA-256                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------ |
| `src/lib/visual-frame/real-frame.ts`                      | `9cc1f85d2f310b580045466cd8742465e1ae46b36083e445669471fb7b84a0e5` |
| `src/lib/visual-frame/illustration-review.ts`             | `302a8e42f8c83ee6cf5ef8fda6b241102c59ae6ae0201ca2e1b7f0be6592631f` |
| `src/lib/server/media/orchestration.ts`                   | `e21391baa7abbd8991c27bde1e7805a08abf2a07548e806d463e1e3d51a2bb43` |
| `src/lib/server/media/grounding.ts`                       | `812e8175fda182f1f10a71f775c6176667aa0c53ffb10b19c07aad2b221c062e` |
| `src/lib/server/media/grounding-state.ts`                 | `cb609613c6a5f9e64d4bf6296ebe669f6f55d35455b9ff87294cb44b67206a47` |
| `src/lib/server/media/server.ts` (inspected)              | `cf1acc97c2c90cd2a79cb4a844ff82b8670318970b9f05eae245f7a3c7a5ba50` |
| `src/lib/server/dm/provider.ts`                           | `70deac71ceb614ae853dcc2cb5741da3d7095bc66d4fad2b97619ed472423292` |
| `src/app/api/visual-frame/route.ts` (inspected)           | `44543993aae92b5a7789b5db4e61e267acd32d61290ac016aac6ff0161bd2141` |
| `supabase/migrations/202609280028_frame_owner_review.sql` | `5a39d1a26e8239d3b93542696b42b70bf4c589e6fbb7708ad6023bed64bb7425` |
| `tests/phase35-storage-fixture.mjs`                       | `ceada0a0e81886cac595dc1c78d6e2dc95f4f34113a422ee935f8d1d5a38bae1` |

## Limits and next gate

PGlite serializes the submitted concurrent operations; these tests verify the real durable claim/decision functions but do not replace a multi-session Postgres race test. Scoped PNG storage and vision replies are injected synthetic adapters. This pass proves neither real Supabase Storage behavior nor live provider visual accuracy, artistic consistency, billing, browser presentation or owner media acceptance.

Legacy art stays readable and lacks the new owner-approval provenance; VIDEO source enforcement remains a separate later review after the FRAME product gate. This lane implemented no VIDEO and made no live calls. The unchanged F1–F5 draft/approval product gate, honest consistency observations, bounded spend evidence and final integrated checks remain required before delivery. The prior failed live FRAME gates are untouched.
