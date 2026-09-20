# fal-world 001 — stopped at first status poll; awaiting owner review

Execution: `a8b3d503fd9da4b75e3dfdaf071ee8423550217c`. Continuation: `9b3f84c9e74a3be531d322dc59b623400e3de15a2b09e7231cfeb730cc56a8e1`. [Exact courtyard review](courtyard-manual-review-001.json) was durably appended through the existing CLI and reopened/verified before submission. Both room/courtyard approvals are solely for the synthetic experiment; all visual/production/navigation/metric limitations remain.

Exactly one existing next operation submitted **spatial-fal-world-1** to **fal**, requested model **fal-ai/hunyuan_world/image-to-world**. Request ID: **01a0bc76-ae7f-7e02-960b-a207094622d2**. Safely reported actual model: **UNKNOWN**.

The frozen dependency was the retained **spatial-room-1 panorama**, SHA-256 `aeb206aa80a770dfb859448c083c9d0ca7405073e69e17e7b544907abcd738ac`. No courtyard/thumbnail/upload substitution. Labels, classes and export_drc=true unchanged. Provider URL is not published.

## Actual outcome

Submission returned HTTP 200. The first status poll triggered **http_or_redirect_failure** at stage **poll**. This frozen assertion requires HTTP 200 and an unchanged response URL; the exact failed status/URL/body is not retained, so the evidence cannot distinguish those alternatives. No additional request was made to investigate or retrieve the result. Do not infer the provider's generation failed or completed.

New requests: **1 submission + 1 status poll = 2 provider requests**. **0 result reads, 0 asset downloads, 0 retries/fallbacks, 0 diagnostics, 0 World Labs/chest calls, 0 separate exports.** First poll started 20.636 seconds after the reservation/start; completion interval and provider compute duration are UNKNOWN.

No result/artifact was captured. File format, size, hash, structural metadata and usable world/3D output are **unverified**. DRC was requested, but whether it was returned is **unverified**. No fal-world approval or second next occurred.

## Accounting and preservation

Full fal reservation **$0.35** retained; frozen expected maximum **$0.30** is not an observed charge. fal actual billing remains **UNKNOWN**, not zero. Cumulative reservation **$4.15 / $4.75**; cumulative known reported billing remains **$2.528**, plus the unknown fal charge. Remaining **$0.60** is the unreleased chest allocation, not authorization. No billing request was made.

Lifetime totals: **43 API requests + 8 downloads; 3 generation submissions; 7 world reads**. Original STOPPED history, earlier evidence and raw input bytes remain unchanged. Earlier courtyard journal/witness are exact prefixes of the new append-only local records. [Sanitized summary](fal-world-001.json) preserves source hashes and safe observations; private local continuation state, keys, URLs, response bodies and binary assets are not copied into this commit.

After stop: **273 deterministic tests passed**, zero failures/skips; experiment typecheck, zero-warning lint and isolated build passed. Frozen source/protocol unchanged. Production full suite/build not rerun; no production, migration, dependency, UI, deployment or roadmap integration changes.

## Status / next step

- spatial-room-1: narrowly owner-approved for experiment continuation.
- spatial-courtyard-1: narrowly owner-approved for experiment continuation.
- spatial-fal-world-1: submitted once, STOPPED at polling gate; awaiting manual owner review, with no captured result to approve.
- spatial-chest-1: **unreleased and unattempted**.

**STOP for owner review.** Do not retry, diagnose, repair/reset history, issue another next, run chest or implement EXPLORE/renderer. Physical iPhone/Safari and historical optional Phase 1 conflict-rebase remain unverified. Finite synthetic evidence does not establish universal correctness; no hosted or real campaign/private-data acceptance.
