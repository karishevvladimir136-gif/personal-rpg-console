# Phase 3.8B fal asset-host diagnostic: one observation

**STOPPED_AWAITING_OWNER_REVIEW.** The only authorized result GET returned HTTP 200 at the exact response URL, without a redirect. The body hash matched the prior result exactly before interpretation. Frozen optional-field identity validation passed. The observed asset hostname is **storage.googleapis.com**. The unchanged frozen policy classified it as **clearly_unapproved_or_unsafe_host**, reason **host_not_approved**. This establishes a policy mismatch; it does not establish malicious hosting, provider ownership, artifact failure or artifact usability. No host-policy change was made.

## Execution and immutable provenance

- Approved execution SHA: adebc5e5d9c8e83c1ed6ace277582147b37d5901.
- Branch: codex/phase38-fal-host-diagnostic-preparation.
- Diagnostic: phase38b-fal-host-diagnostic-1; hash 8de9ecf328aa6459ea09d7686533cf1e34f86bf0b04978846c1d87f197fc3602.
- Freeze-file SHA-256: 3a7535cc8de4a8e239287331f67acdc356fe66f9116d3a589e5052acee823914.
- Existing request: 01a0bc76-ae7f-7e02-960b-a207094622d2; fal / fal-ai/hunyuan_world/image-to-world.
- Observation UTC: 2026-09-20T03:41:54.614Z.
- Prior retrieval evidence: 31d6431002b32060d4a1f365fc8b06b90f841a00.
- Prior and observed body SHA-256: 5dd84907167313f73db618cc1e1768bb658c59fafdb4dc2fb4119d7e2c1e78d6.
- Actual provider API model: **UNKNOWN**; optional provider-reported request ID: absent. No provenance was inferred.
- Init occurred once after verifying directory/anchor absence; init made zero requests, DNS requests, reservations or generations.
- Original STOPPED continuation, completed-status recovery and stopped retrieval histories remain byte-for-byte unchanged. The JSON records verified source bindings and journal hashes.

## Sanitized world_file descriptor

| Field | Observed value |
|---|---|
| Scheme | https |
| Hostname | storage.googleapis.com |
| Hostname SHA-256 | df8ab3acb3324531fb5c42308bf6cc9cac1e499d1f3e2268243a1dd4072e58d4 |
| URL SHA-256 | 28e7ae50a56a53c390eaf1da596976d58f4e1b4273d28a0255d9cd6ab293d771 |
| Pathname | Withheld by frozen sanitizer; hash only |
| Path SHA-256 | 8437ed77f94ab487679dd8f75014ee3448af3eaf18d63c67037e7d11648d2723 |
| Query present | true |
| Fragment / credentials / explicit port | false / false / false |
| Reported content type | application/octet-stream |
| Reported extension classification | zip |
| Reported size | 85481294 bytes |

ZIP classification and size are descriptor claims, not downloaded/decoded evidence. No signed URL, query contents, arbitrary filename, raw response body, secret, provider headers or binary artifact is included.

## Network and accounting

Exactly **1 new HTTP GET**, **0 artifact downloads**, **0 asset DNS lookups**. No polling, POST, retry, second GET, redirect following, generation/resubmission, fallback, next, cancel, billing endpoint, World Labs or chest call.

Accounting unchanged: **$4.15 / $4.75 reserved; $2.528 known reported billing; fal-world billing UNKNOWN; original $0.35 fal reservation retained once; $0.60 chest allocation unreleased**. No new reservation, refund or billing mutation. Historical totals after this observation: **46 API requests, 8 downloads, 3 generations**. Chest remains unattempted.

## Verification and boundaries

**549/549 deterministic experiment tests passed**, zero failures/skips/cancellations. Typecheck, zero-warning lint and isolated experiment build passed in a separate evidence worktree. Execution checkout remains clean at the approved SHA. No production code/runtime/schema/UI/dependencies, main, protocol, frozen validator or host allowlist changed. Full production suite/build was not rerun.

Only this report, the companion sanitized JSON and DEV_STATUS.md are changed. Preparation/freeze and all prior evidence are preserved. Physical iPhone/Safari and optional historical Phase 1 conflict-rebase remain unverified. Finite synthetic evidence is not universal acceptance; no hosted deployment or real campaign/private-data acceptance.

## Recommended next step

**STOP for owner review.** Any host ownership/trust assessment, policy correction or artifact retrieval requires a new owner-reviewed checkpoint and authorization. Do not poll, retry, download, run chest or continue jobs.
