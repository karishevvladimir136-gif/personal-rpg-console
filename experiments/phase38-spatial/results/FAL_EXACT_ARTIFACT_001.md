# Phase 3.8B exact fal artifact retrieval: local initialization stop

**STOPPED before initialization and before all provider/asset/DNS requests.** One init invocation returned exit code 1. No live retrieval was invoked or retried. No ledger, anchor, partial file or complete artifact was created. This is a local harness guard failure, not evidence of a provider-generation failure.

## Execution and identity

- Approved clean execution SHA: dcbf8105ce7e18928901620dcf899d76ec000e8b.
- Branch: codex/phase38-fal-artifact-preparation.
- Retrieval identity: phase38b-fal-exact-artifact-1.
- Manifest identity hash: 310e802e1df5781a97336f9915668855421a50ff17e0c74532c44fc5df647f53.
- Freeze-file SHA-256: 643ae14cbd2974992f1860e46a38b7059c627aa84c5284ba265a5f0f53e4fb15.
- Accepted diagnostic evidence: 745ee77f32ca61f795948f1292f7921d4fe406e7; JSON SHA-256 882f1fd2bc7f9a917802680717566ee72d3a0a2a0ba4b87fc4250c014cc7f115.
- Existing request: 01a0bc76-ae7f-7e02-960b-a207094622d2; requested fal model fal-ai/hunyuan_world/image-to-world.
- Expected prior result body SHA-256: 5dd84907167313f73db618cc1e1768bb658c59fafdb4dc2fb4119d7e2c1e78d6. **No new result body was requested or compared.**

## Actual local failure

The exact frozen assertion at src/fal-artifact-cli.ts:89 is:

`git("check-ignore", root, root + ".anchor").split("\n").length === 2`

Its safe reason is **artifact_private_ignore_required**. The CLI printed its generic stop message. Read-only evaluation of that same guard after the stop found **one match (the anchor), not two**. The absent directory argument did not match the directory-only ignore pattern. Both the directory and anchor remain absent. initializeArtifact is called only after this guard, so successful initialization count is **0**. The single init invocation was not replayed. No workaround, repair, directory creation, policy change or historical reset occurred.

The exact HEAD, clean checkout, 63 frozen inputs, manifest/freeze hashes, accepted evidence lineage, all bound historical bytes, absent artifact state and accounting passed the initial read-only preflight. Credential presence was checked locally without exposing or forwarding its value. All prior sources were reverified unchanged after the stop.

## Requests, artifacts and inspection

| Observation | Actual result |
|---|---|
| Init invocations / successful initializations | 1 / 0 |
| Retrieval invocations | 0 |
| Result GET / HTTP / body match | 0 / NOT REQUESTED / NOT OBSERVED |
| Artifact GET / HTTP | 0 / NOT REQUESTED |
| Asset DNS resolutions | 0 |
| Downloaded bytes | 0; no artifact file exists |
| Final artifact size / SHA-256 | UNAVAILABLE |
| ZIP integrity / entry count / uncompressed bytes | NOT INSPECTED / UNKNOWN / UNKNOWN |
| Format inventory / DRC presence / header / GLB / glTF | NOT OBSERVED |
| Structural / visual / navigation usability | UNVERIFIED / UNVERIFIED / UNVERIFIED |

Zero polling, POST, retry, second result/asset GET, redirects followed, resubmission, next, billing, World Labs, chest or generation calls. No automatic extraction or execution. Global/persistent allowlist unchanged. The historical 85,481,294-byte ZIP descriptor is not a newly downloaded or verified artifact.

## Accounting and preservation

Unchanged: **$4.15 / $4.75 reserved; $2.528 known reported billing; fal-world billing UNKNOWN; original $0.35 fal reservation retained once; $0.60 chest allocation unreleased**. Historical totals remain 46 API requests, 8 downloads and 3 generations. No new reservation, refund or ledger mutation. Chest remains unattempted.

## Verification and evidence scope

After the stop, **674/674 deterministic experiment tests passed**, zero failures/skips/cancellations. Typecheck, zero-warning lint and isolated experiment build passed. The passing tests did not cover the failing fresh CLI initialization path: the ignore regression tests check child artifact paths plus the anchor rather than the absent directory argument used by the CLI. This verification gap is disclosed, not treated as live retrieval acceptance. No test or harness code was changed.

Only this report, the companion sanitized JSON and DEV_STATUS.md change in a separate evidence worktree. The approved execution checkout remains clean at its exact SHA. Frozen inputs, previous evidence, original stopped histories, production code/schema/UI/dependencies, main and original checkout's uncommitted documentation are preserved. No secrets, signed URL, query values, raw provider response or binary artifacts are included.

Physical iPhone/Safari and optional historical Phase 1 conflict-rebase remain unverified. Finite synthetic checks do not prove universal recovery, full geometry validity or real-data acceptance. No hosted deployment or real campaign/private-data acceptance.

## Recommended next step

**STOP for owner review.** A separately authorized offline correction and fresh-initialization regression test are needed before another live execution checkpoint. No correction, retry, artifact request or chest continuation was performed.
