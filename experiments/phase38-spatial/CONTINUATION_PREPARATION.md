# Phase 3.8B — offline continuation preparation

September 19, 2026 (Pacific). **OFFLINE PREPARATION ONLY. No provider calls, asset reads/downloads, generation, live-ledger initialization, credential access/setup or live continuation are authorized by this checkpoint. Stop for owner review of the exact final SHA.**

Owner accepts URL correction `c94d4e588981d94d6679ba76861cc5776f7bfc3d` and metadata correction `32b2effdc8aeae525fe28dda3f09c73b04773cb3`. Prior evidence is `dec27b8f566bea3412ba6afb80d3e17379c1fcd1` and `98eb76618503dd2382ef97aaabfcb1377cab26e1`. Original execution remains `2f8f82edb5d5f3c960d45922b71c543e99208192`, workload protocol SHA-256 `496360cc4171778eb153009ff4fe445d8ef75b08ab9aa0c4e884452e21c3bacb`.

## Distinct identity; no erasure or restart

[continuation.json](continuation.json) freezes the new identity, every historical source hash, exact operation/world IDs, original reservation/billing, accepted corrections and future bounds. The updated freeze manifest pins this contract, source, tests and instructions. Its canonical continuation hash and freeze-file SHA-256 are reported with the final Git SHA; neither is the original workload protocol hash.

Original operation: **6719be80-101e-45a6-b27a-6905ebc183c1**. Original world: **82a0e059-50a4-41a4-8565-5e516ffadc0e**. Original run stays **STOPPED** forever. The code reads its files directly and verifies hashes, journal chain and witness; it never opens its Ledger or writes even a lock there. Earlier evidence files are hashed and checked too. Source checks repeat before a new continuation reservation or request.

A future explicitly authorized `init` may create only the new ignored `private-continuation` journal, paired identity/anchor, hash chain and witness. It copies the historical reservation/receipt/billing once with provenance, records the original STOPPED fact separately, and binds the complete continuation contract into its identity. This is a new explicitly authorized attempt to inspect an existing world, not a reinterpretation of the original failed observation. Incomplete initialization fails closed; no repair/reset. The original room has no generation slot. The old live CLI is disabled in this checkpoint, so it cannot accidentally start a fresh room run. No code or history in the original checkout changes.

## Permanent cumulative accounting

| Item | Reservation | Known original charge |
| --- | ---: | ---: |
| Existing room, carried once | $1.30 | $1.264 / 1,580 credits |
| Remaining courtyard | $2.50 | Not attempted |
| Remaining fal world | $0.35 | Not attempted |
| Remaining chest | $0.60 | Not attempted |
| Total ceiling | **$4.75** | Future charges remain separate |

$3.45 is the unused portion of the original experiment ceiling, never a refreshed budget. No refund/reuse of $1.30; one historical generation plus at most three new generations = four lifetime submissions. Unknown new charges retain full reservations and block review/next-job release. No replacement/fifth generation. Manual fal receipt reconciliation, per-job published price checks and manual output review reuse existing code.

## Frozen future recovery and reads

A future separate exact-SHA authorization may run `recover-room` once:

1. Two authenticated Get World reads of the **same exact existing world**: validate the fresh result, then check it is stable on re-open. Operation binding comes from verified historical successful-operation evidence; **zero new Get Operation polls** are needed. No generation, export or fal endpoint is reachable from this flow.
2. At most four downloads, in order: SPZ 100k, collider, panorama, thumbnail. Only the exact immutable asset descriptors returned by validated identity/private/model/scale checks are eligible. Accepted hostname/provenance/public-DNS/TLS/no-redirect guards remain. No alternate host, URL, retry, regeneration or recovery reattempt.
3. Retain structurally inspected bytes, SHA-256 hashes and a result requiring manual review. Any read/identity/privacy/model/scale/URL/DNS/download/format failure appends STOP before any new generation. A crash after durable recovery-begin also cannot repeat recovery. Nothing is automatically approved.
4. Successful recovery still requires explicit review of the exact result hash, safe visible content, required asset usability, routing, asset-first scope, and panorama compatibility/sharing. Only then can the remaining original jobs run in their frozen order, each pausing for its own billing/output review.

Bounds: **2 room world GETs + 4 room asset downloads**, zero exports/fal/generation/retries during room recovery. **15 minutes** total recovery deadline; at most **60 seconds per request**, including DNS/connection/body time. JSON 2 MiB; each asset 256 MiB; total retained/downloaded asset response bytes across the continuation 1 GiB. Structural WebP does not increase these limits.

Remaining-job bounds are unchanged: three serialized submissions maximum; up to 45 polls/job at 20-second spacing; 15 minutes/job; courtyard two world reads/four downloads, fal-world one result read/one download, chest one result read/one download. New continuation maximum: **144 authenticated API requests + 10 asset downloads** (including recovery), no retries/fallback/diagnostics.

Historical counts remain visible: **21 API requests and 3 world reads** (18 original requests plus the separately authorized two-read and one-read diagnostics), zero historical downloads. Maximum lifetime API requests through this bounded continuation is **165**, within the original 190 cap. World reads are explicitly **3 historical + 2 recovery + 2 courtyard = 7 maximum lifetime**. The original workload's four reads are not silently reset or relabeled: four future reads are separately specified in this continuation, with the three historical reads carried alongside. No runtime increases beyond this new reviewed contract are allowed.

## Bounded thumbnail WebP support

Node built-ins only. Thumbnail inspection recognizes exact RIFF/WEBP bytes, exact declared/container length, padded chunk boundaries, VP8 keyframe header, VP8L header, and VP8X canvas plus a supported static image bitstream. It validates positive matching dimensions, reserved/version bits and bounded chunk features. Limits: **64 chunks, 16,384 per dimension, 67,108,864 pixels**; animation unsupported. Metadata/unknown bounded chunks are inert, never executed. VP8L alpha hint remains informational as documented.

This is structural inspection, not a complete entropy decoder or guarantee of pixel correctness. Deeper bitstream corruption and visual quality still require actual output review. WebP applies **only to thumbnails**. Panorama remains PNG/JPEG with its existing 2:1 equirectangular requirement; a .webp extension alone never qualifies an asset.

Format references: [RIFF/WebP container](https://developers.google.com/speed/webp/docs/riff_container), [lossless headers](https://developers.google.com/speed/webp/docs/webp_lossless_bitstream_specification). Only public format documentation was consulted; no provider API was called.

## Actual offline verification

**273 deterministic tests passed, zero failures/skips (223 earlier tests plus 50 continuation/WebP cases).** Experiment typecheck, ESLint with zero warnings and isolated TypeScript emit/build passed. An initial missing recovery-start identity assertion was caught by regression testing and fixed before freezing. Tests use disposable copies of the already-synthetic historical ledger and fake network/DNS/transports; original records are never edited. Includes immutable history, single carry-forward, exact operation/world pins, no room regeneration, failed/crashed recovery, review gating, three remaining submissions, no duplicate recovery/assets/submissions, unknown charges, WebP malformed/truncated/oversized cases and all previous URL/SSRF/DNS/redirect guards. Existing no-production-import/secret/budget tests remain green.

No production full-suite/build rerun for this isolated experiment change; earlier production verification remains historical. Real WebP output, actual asset format/usability, scale/collider binding, room visuals, panorama sharing, fal-world usability and chest articulation remain unverified. Physical iPhone/Safari, optional historical Phase 1 conflict-rebase and finite synthetic-evaluation limitations remain. No hosted or real campaign/private-data acceptance.

## Future operator instructions — do not execute during preparation

Worktree: `C:\Dev\personal-rpg-console-phase38-continuation`. Safe offline inspection:

```powershell
node experiments/phase38-spatial/src/continuation-cli.ts inspect
```

After explicit authorization of the exact final SHA only, the separate continuation CLI supports `init`, `recover-room`, `status`, `review`, `billing`, and `next`. Every non-inspect command requires `--live`, `--approved-sha=<exact clean HEAD>` and `--original-repo=C:\Dev\personal-rpg-console-phase38-preparation`. `review`/`billing` additionally require one local `--record=<path>`; records must name the exact continuation hash and original protocol hash as well as existing result/receipt fields. Do not set review booleans until inspection genuinely supports them. `next` cannot bypass room recovery/review or any later billing/review gate. There is no reset, room-submit, resume-partial or skip command.

Credentials are loaded only for separately authorized `recover-room`/`next`, from ignored worktree-local `.env.local` under the established convention. No keys were read/copied/requested in preparation. Do not use the legacy CLI for live work.

**Stop for owner review. No live continuation, production change, EXPLORE implementation, Phase 4, renderer or deployment.**
