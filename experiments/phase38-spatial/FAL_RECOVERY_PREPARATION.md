# Phase 3.8B — offline fal-request recovery preparation

**OFFLINE PREPARATION COMPLETE; STOP FOR OWNER REVIEW. No provider request, credential access or live recovery initialization occurred. No result has been recovered.**

The fal generation was submitted once historically. Original execution `a8b3d503fd9da4b75e3dfdaf071ee8423550217c`, continuation `9b3f84c9e74a3be531d322dc59b623400e3de15a2b09e7231cfeb730cc56a8e1`, and stop evidence `28efcc7b50f6943022f93906770d2e8196e1e682` remain unchanged. The original continuation stays STOPPED with `http_or_redirect_failure`; no claim is made that the provider generation failed or completed.

## Distinct identity and unchanged accounting

[fal-recovery.json](fal-recovery.json) binds original execution/protocol/continuation, stop-evidence commit and file hash, exact job/model/provider/request, stopped journal/witness file hashes and terminal digests, identity/anchor hashes and accounting. Current journal and witness are read directly and chain-checked; no lock or write is made in the source continuation. Source hashes are rechecked before each possible new recovery request.

A separately authorized future init may create only a new ignored `private-fal-recovery` journal/identity/witness plus sibling anchor in this preparation worktree. It reuses the existing durable hash-chain/fsync machinery with recovery-only events. It cannot append a reservation, submission, approval or billing mutation. Duplicate initialization, partial writes, altered sources, orphan evidence and surviving anchors fail closed. A durable begin/request consumes this one observation even if the process crashes; no reset/replay/resubmission.

Permanent accounting: **$4.15 reserved / $4.75 ceiling**, **$2.528 known reported billing plus UNKNOWN fal charge**, including the already-retained **$0.35 fal reservation**. No new reservation, refund or decrement. Three historical generation submissions remain three. The **$0.60 chest allocation remains unreleased**, with no chest route or command.

## Current release: one status observation, then stop

Local evidence contains the submitted request ID and a hash of its status URL, but not the failed poll's HTTP status/URL. The prior official-evidence note links queue documentation; it does not record an authoritative HTTP status-code mapping. No online research was performed. Therefore no broader status-code acceptance is guessed.

This exact checkpoint exposes only `inspect`, `init`, `status` (local journal inspection), and **observe-status**. After separate exact-SHA owner authorization, observe-status may make **one GET**, record safe metadata and stop. Even HTTP 200 plus validated COMPLETED ends at **OBSERVED_AWAITING_OWNER_REVIEW**. Any rejected status/URL/body/identity ends STOPPED. No result or asset is released by this CLI. No result/release/URL/method/model/operator-limit flags exist.

HTTP 200 is an explicit provisional body-parser candidate, not a claim that other fal statuses are invalid. Non-200 statuses, all redirects and changed response URLs are observed and stopped without following or retrying. A later observation must establish the actual behavior before a separately reviewed checkpoint may enable retrieval. The old continuation live CLI is disabled in this preparation checkout; the original execution is untouched.

The domain contains a bounded future retrieval path to verify the required ordering in mock tests: one validated COMPLETED status may precede one result GET and one validated asset download. Its read-limit identity is explicit; **the shipped CLI never supplies those future limits**. There is no test-only live override flag. A future retrieval release requires a new owner-reviewed checkpoint/identity; this preparation is not permission to invoke internal modules directly or reinterpret a stopped observation.

## Exact URL policy

Request ID: `01a0bc76-ae7f-7e02-960b-a207094622d2`. Provider: fal. Model: `fal-ai/hunyuan_world/image-to-world`.

The historical poll URL hash matches this exact primary path, accepted by the existing API policy:

```text
https://queue.fal.run/fal-ai/hunyuan_world/requests/01a0bc76-ae7f-7e02-960b-a207094622d2/status
```

Future result GET is fixed to:

```text
https://queue.fal.run/fal-ai/hunyuan_world/requests/01a0bc76-ae7f-7e02-960b-a207094622d2
```

Existing same-origin API aliases under `fal-ai/hunyuan_world/image-to-world/requests/<same ID>` and the existing result `/response` suffix may be recognized **only for diagnostic classification**. They are not followed, selected by the operator or silently accepted as changed response URLs. No hostname/asset allowlist expansion. HTTPS, exact model/request/stage, no credentials/query/fragment/unsafe normalization and manual redirects remain enforced. No new next/submission/cancellation/export/World Labs/chest/arbitrary-ID capability exists.

## Safe HTTP observability

Before rejecting any status/result JSON HTTP response, a durable recovery_http record stores only:

- stage and fixed request ID;
- numeric HTTP status, or null for transport failure;
- requested and returned URL hashes;
- normalized safe scheme, known queue hostname or hash of an unknown hostname;
- an allowed exact queue path or only its path hash;
- booleans for embedded credentials, port, query and fragment;
- equivalent safe Location structure/hashes;
- separate status qualification, redirect flag, exact URL match and classification: exact URL, allowed same-origin canonicalization, unexpected origin/path, redirect to an allowed path, or redirect to an unapproved/unknown target.

No Authorization/key, query token, signed asset URL, raw response body, arbitrary header or exception message is retained. Relative Location values are inspected against the fixed request URL but never followed. Invalid/secret-bearing URL forms cannot be normalized into approval. Safe observations are recorded before a rejected response body is cancelled.

For a future authorized result path, a matched queue identity and COMPLETED state are mandatory before result GET; a conflicting result/header request ID fails. Existing falOutput/model/fallback/attempt, asset provenance, exact-host, public-DNS/TLS/no-redirect/SSRF and byte/format validators remain. Opaque DRC is not treated as a valid navigable GLB/SPZ merely because requested. Existing asset transport is unchanged; the new safe HTTP diagnostics apply to queue status/result JSON responses. Asset access is unreleased here.

Bounds: one status GET, **zero result reads/downloads currently**; no retry/fallback. Request timeout ≤60 seconds; overall deadline ≤15 minutes; JSON ≤2 MiB. Unreleased future single-asset path retains the existing ≤256 MiB asset / ≤1 GiB total limits. No new generation or charge is assumed.

## Deterministic verification

**336 tests passed: 273 existing + 63 new, zero failures/skips.** Typecheck, zero-warning lint and isolated build passed. Tests use constructed synthetic history, mock fetch/responses/downloads and existing hostile URL/DNS/redirect fixtures; they never use a local key or live provider. Coverage includes GET-only enforcement; exact pins; wrong IDs/models/paths; arbitrary URLs; safe pre-stop status/URL/Location observations; no credential/body leakage; no guessed 201/202/204 or redirect acceptance; source immutability/accounting; completed versus pending result gating; preserved fal asset/format validation; duplicate init/result/asset guards; and crash/deadline/stream-size limits.

Production code/runtime/schema/UI/dependencies and main remain unchanged. No production full-suite/build claim. No visual/prompt, collider, metric-alignment or production EXPLORE acceptance is implied. Physical iPhone/Safari, historical optional Phase 1 conflict-rebase, finite synthetic-evaluation and absence of hosted/real campaign/private-data acceptance limitations remain.

## Operator boundary

Worktree: `C:\Dev\personal-rpg-console-phase38-fal-recovery-preparation`. Safe offline command:

```powershell
node experiments/phase38-spatial/src/fal-recovery-cli.ts inspect
```

Do not initialize or observe during preparation. Future non-inspect commands require separate owner authorization, exact clean `--approved-sha=<HEAD>`, `--live`, and `--source-root=C:\Dev\personal-rpg-console-phase38-continuation`. Keys remain local server secrets; none were read/requested/copied here. The current status-observation command cannot proceed to result retrieval even if completion is reported.

**STOP for review of this preparation SHA. No live observation, result recovery, new reservation, chest or other job.**
