# Phase 3.8B: single fal status observation

**HTTP 200; validated queue state COMPLETED. STOPPED FOR OWNER REVIEW; no result retrieved.** This is a result candidate only, not artifact or production acceptance.

## Authorized checkpoint and identity

- Execution: `115dcf0c50a8b815e61d597970101898a7723bcf`, branch `codex/phase38-fal-recovery-preparation`; clean before and after execution.
- Recovery: `phase38b-fal-recovery-1`.
- Recovery hash: `0768f1a2a46f9aa6557d057d048e6ba896e5f4094da42a1f837f215080ff586a`.
- Freeze-file SHA-256: `3f0265ca9407ed83153e77c737853c0a7aae4c05de9e8e4a6799f283d5b8517c`.
- Original stopped execution: `a8b3d503fd9da4b75e3dfdaf071ee8423550217c`; historical evidence: `28efcc7b50f6943022f93906770d2e8196e1e682`.
- Existing request: `01a0bc76-ae7f-7e02-960b-a207094622d2`.
- Pinned provider/model: fal / `fal-ai/hunyuan_world/image-to-world`. Safely reported actual model: **UNKNOWN** (null); no inference from the requested route.

## Observation and exact scope

Recovery initialization occurred once. Root and anchor were absent beforehand; initialization created no provider request, reservation or generation. The empty journal was verified before observation.

Exactly **one provider request**, a GET to the frozen status route, began at **2026-09-20T02:16:09.561Z**. HTTP **200**; classification **exact_response_url**; HTTPS on `queue.fal.run`, exact pinned request/status path, no embedded credentials, query, fragment or explicit port. No Location header was reported, no redirect occurred or was followed. Body validation retained only the pinned request ID, queue state **COMPLETED**, explicit null actual model and permitted body hash.

The frozen terminal record is `OBSERVED_AWAITING_OWNER_REVIEW`, reason `queue_compatibility_not_established`, `resultCandidate: true`. That literal reason is preserved: this one observation qualifies a candidate, not blanket queue/result compatibility or a retrieval release.

**Zero result GETs, artifact downloads, POSTs, retries, resubmissions, generation submissions, extra polls, fallback, World Labs calls, billing calls, cancel/export calls, next invocations or chest calls.** No approval record was appended. Chest remains unattempted. No provider request followed the single observation.

An initial local CLI launch stopped before opening the recovery journal because the shell wrapper escaped a Windows path incorrectly. A local audit confirmed zero journal entries and zero provider requests; the launch path was corrected without changing approved code. The authorized GET was then performed once. No provider request was retried.

## Accounting and preserved evidence

| Item | After observation |
| --- | --- |
| Cumulative reservation / ceiling | $4.15 / $4.75 |
| Known reported billing | $2.528 |
| fal-world actual charge | UNKNOWN |
| Existing fal reservation | $0.35, retained exactly once |
| Unreleased chest allocation | $0.60 |
| New reservations / refunds | 0 / 0 |
| Lifetime generation submissions | 3, unchanged |
| Lifetime API requests / downloads | 44 / 8 |

Unknown fal charges are not zero and retain the full reservation. No billing endpoint was called. The original STOPPED continuation and original room stop remain byte-for-byte unchanged; no earlier failure was overwritten or reinterpreted. Original source hashes and terminal digest were verified before and after observation. All 39 approved recovery freeze inputs and all 32 original continuation freeze inputs remain unchanged.

[Sanitized JSON evidence](fal-status-observation-001.json) contains the safe HTTP/URL metadata, validated queue fields, body hash, exact counts and local journal/identity/witness hashes. The live journal, anchor and empty artifact directory remain ignored in the execution worktree. No key, environment file, Authorization header, arbitrary header, raw provider body, signed asset URL or binary asset is committed.

## Verification after observation

- **336 deterministic tests passed**, zero failures, skips or cancellations.
- **Typecheck passed.**
- **Lint passed with `--max-warnings 0`.**
- **Isolated experiment build passed.**

Checks ran on the unchanged approved code in the separate evidence worktree. The existing suite requires absence of a live recovery directory; isolation preserves the initialized journal rather than deleting it or modifying frozen tests. Production tests/build were not rerun because production was unchanged. Main, runtime, schema, UI, dependencies and the original checkout's pre-existing documentation edits remain untouched. This commit contains only evidence and development status.

## Remaining limitations and next step

No result was fetched, so output type, DRC availability, asset usability, sizes and hashes remain unverified. Actual model and fal billing remain UNKNOWN. The completed-state observation does not explain or relabel the historical failed poll, establish a generation completion time, or approve any output. Previous room/courtyard structural approvals do not establish visual fidelity, navigation or independent metric alignment. Physical iPhone/Safari and the optional historical Phase 1 conflict-rebase remain unverified; finite synthetic checks are not universal guarantees. No hosted or real campaign/private-data acceptance has occurred.

**STOP for owner review.** No result retrieval, further polling, chest, next job, generation, EXPLORE/renderer implementation or deployment. Any further provider request requires new explicit owner authorization.
