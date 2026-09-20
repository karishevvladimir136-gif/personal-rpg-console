# Phase 3.8B — fal-world result retrieval evidence

**B_INVALID_OUTPUT_OR_ASSET_URL. HTTP 200 and result identity checks passed; the frozen asset-host policy rejected the world-file URL. STOPPED FOR OWNER REVIEW.** No asset download or second retrieval occurred. This is not a conclusion that provider generation failed.

## Execution and authorization

- Exact clean execution SHA: `9160d9766559d38139a51516384461958399defc`.
- Branch: `codex/phase38-fal-retrieval-preparation`.
- Retrieval identity: `phase38b-fal-retrieval-1`.
- Retrieval hash: `546d44c1bd66dcd23ade1995355cc4f8fc1e16425652e16beb501ddaca98ac9a`.
- Freeze-file SHA-256: `c787942ded0ed6af03a179cd68e15afd4f282e75537bfce4a3e8b64cef7b8c10`.
- Completed-status evidence: `3371a20427c33abed810ff0af83a031c943090ac`.
- Existing request: `01a0bc76-ae7f-7e02-960b-a207094622d2`.
- Provider / requested model: fal / `fal-ai/hunyuan_world/image-to-world`.

Strict local preflight passed: exact clean checkout, manifest/freeze, original continuation and stop evidence, completed-status recovery identity/journal/terminal, exact completed observation, and unchanged accounting. No retrieval directory or anchor existed. Initialization occurred **once**, created no request/reservation/generation, and an empty journal was audited before retrieval. Initial sandbox Git inspection required running under the repository owner; no Git configuration was changed.

## Single result observation

The one authorized result GET began at **2026-09-20T02:52:17.917Z**. HTTP **200**, classification **exact_response_url**, exact approved HTTPS queue route, no query/fragment/embedded credentials/explicit port, no Location header and no redirect. The response body was parsed in memory, and its permitted SHA-256 was retained:

`5dd84907167313f73db618cc1e1768bb658c59fafdb4dc2fb4119d7e2c1e78d6`

Frozen result-identity validation **passed under its optional-field contract**. Safely reported actual model: **UNKNOWN/null**. Provider-reported request ID was also null in the retained identity record; the result route remained exactly pinned. Missing actual-model naming was not inferred from the requested endpoint. Optional model/endpoint/attempt/fallback/error checks were applied as prepared.

The parser reached `world_file.url`, where `assetUrl` rejected the host with exact reason **asset_host_not_allowed**. This field observation follows from the frozen validation path; the raw response and additional output metadata were not retained. The rejected hostname itself is **UNKNOWN in retained evidence**. No asset descriptor passed validation, no asset URL hash was retained, and no signed URL was written to evidence. No diagnostic request, policy change or workaround followed.

| Requested finding | Actual observation |
| --- | --- |
| Final finding | `B_INVALID_OUTPUT_OR_ASSET_URL` |
| Terminal | `STOPPED_AWAITING_OWNER_REVIEW` |
| Rejection | `asset_host_not_allowed`, stage `result` |
| Artifact downloads | **0** |
| Artifact format / byte count / SHA-256 | **UNVERIFIED / unavailable** |
| Structural metadata / usability | **UNVERIFIED; no bytes downloaded or inspected** |
| Navigation / visual / production usability | **UNVERIFIED** |
| DRC availability | **UNVERIFIED**; historical `export_drc=true` is not evidence of output |

No binary evidence exists for this retrieval. The ignored evidence directory is empty. Neither supported structural success nor unsupported-format finding C was reached.

## Counts and accounting

Exactly **one new live HTTP/provider request: one result GET**. Exactly **one retrieve invocation**. Zero status polls, artifact downloads, POSTs, generations, retries, resubmissions, fallback, redirects followed, World Labs calls, billing calls, cancellation, separate exports, next actions or chest calls. The asset download transport/DNS stage was never entered. No approval was appended, and chest remains unattempted.

Accounting remains **$4.15 reserved / $4.75 ceiling**, **$2.528 known reported billing**, fal-world charge **UNKNOWN**, the original **$0.35 fal reservation retained once**, and **$0.60 chest allocation unreleased**. No new reserve/refund or zero-charge assumption. Lifetime counts: **45 API requests, eight downloads, three generation submissions**.

## Evidence integrity and verification

[Sanitized JSON evidence](fal-retrieval-001.json) records safe HTTP metadata, identity/body hash, terminal reason, exact counts, source bindings and new journal/identity/witness hashes. Original room STOPPED history, original continuation STOPPED history and completed-status recovery remain unchanged. All 47 approved freeze inputs and all 23 prior evidence files were verified unchanged. The execution checkout remains clean at the approved SHA. Only this report, its sanitized JSON and DEV_STATUS change in a separate evidence commit.

After the live stop: **441 deterministic tests passed**, zero failures/skips/cancellations; **typecheck passed; lint passed with zero warnings; isolated experiment build passed**. Checks ran on unchanged approved code in the separate evidence worktree because the suite requires absence of live journals. Production suite/build was not rerun; production runtime/schema/UI/dependencies, main, roadmap branch and original checkout's pre-existing documentation edits remain untouched.

No secret values, environment files, authentication headers, raw provider bodies, arbitrary headers, signed asset URLs or binary bytes are committed.

## Remaining boundaries

Historical queue-level COMPLETED remains valid; the new stop neither rewrites the prior failed poll nor proves that the provider failed to generate a usable artifact. The frozen host restriction was applied without broadening; whether the rejected host is legitimate is not established by the retained evidence. No new research or recovery path was started.

Physical iPhone/Safari and the historical optional Phase 1 conflict-rebase remain unverified. Finite synthetic checks are not universal guarantees. No hosted deployment or real campaign/private-data acceptance has occurred.

**STOP for owner review. No second retrieval, polling, download, policy repair, generation, export or chest execution.** Any further live action needs new explicit authorization.
