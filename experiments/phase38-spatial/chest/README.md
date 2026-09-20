# Phase 3.8B final chest release — offline preparation

This distinct `phase38b-chest-final-1` identity releases only the final already-planned `spatial-chest-1` allocation. Preparation is OFFLINE ONLY: no provider/fal/DNS/download/reservation/generation and no live initialization. The owner must separately authorize the exact committed SHA before `init` or `run`. Only the requested GitHub preparation push uses network. No credentials are requested or read during preparation.

## Accepted history and permanent boundaries

Fal-world is owner-accepted for structural capability at `b666764a7e352bc82d1528ad7c392662bed0bd9f`, based on recovery evidence `e74f98070a35506bdb0401e2d2db2e492c9f8da4`: exact 85,481,294-byte ZIP, SHA-256 `721f2afef8c2c045566e20f203557c549d712eef430edd671e5bb2c00b2de331`, three valid nonempty PLY meshes, `STRUCTURALLY_USABLE_PLY_WORLD_CANDIDATE`. Visual/navigation remain UNVERIFIED. `export_drc:true` returned no DRC; retain that limitation and do not retry/resubmit fal-world. Future presentation must support observed PLY or validated offline conversion, not DRC exclusively.

Original protocol hash: `496360cc4171778eb153009ff4fe445d8ef75b08ab9aa0c4e884452e21c3bacb`. Continuation hash: `9b3f84c9e74a3be531d322dc59b623400e3de15a2b09e7231cfeb730cc56a8e1`. The manifest pins all 33 preceding committed evidence files and 24 private journal/witness/identity/anchor files, plus source commit ancestry and original freeze. It includes room/courtyard evidence and reviews, the original fal STOP, all subsequent recovery/status/diagnostic/artifact evidence, and accepted final PLY evidence.

Old continuation and fal STOP remain immutable and closed. No old ledger is opened for append, reset or rewritten. Historical `nextJob()` is unchanged and continues rejecting stopped experiments. New code never invokes it. Only a new fixed `chest/private-chest/` root plus sibling anchor is designed here; both remain absent during preparation. Original live freeze and source files remain unchanged; this folder has its own freeze and isolated typecheck/build.

## Exact frozen final job

- ID: `spatial-chest-1`
- Provider: `fal`
- Model: `fal-ai/hunyuan-3d/v3.1/pro/text-to-3d`
- Submission endpoint: `https://queue.fal.run/fal-ai/hunyuan-3d/v3.1/pro/text-to-3d`
- Reservation: $0.60; frozen published maximum: $0.525. No current price query is made in this offline task.

```json
{
  "prompt": "A single undecorated wooden storage chest with iron corner bands and a visibly separate closed lid, shown as one isolated object. No contents, text, symbols, surrounding room or people.",
  "generate_type": "Normal",
  "enable_pbr": true
}
```

No face-count override, seed, added defaults, parameters, provider fallback or alternative model. Manifest job must equal the original frozen job exactly. Unknown provider model naming remains UNKNOWN, never fabricated from the request. Any conflicting provider/model/attempt metadata stops execution.

## Accounting and one-shot lifecycle

Prior: $4.15/$4.75 reserved, $2.528 known reported billing, fal-world UNKNOWN, its $0.35 reservation retained once, chest $0.60 unreleased. Initialization reserves nothing. The sole `run` durably reserves $0.60 before any submission, producing exactly $4.75/$4.75 cumulative and four total generation slots including the three historical jobs. Unknown chest billing stays UNKNOWN; numeric billable units may be retained but are never converted to USD without explicit billing evidence. No billing endpoint, refund or budget reuse.

Append-only identity/anchor, hash-chain journal, witness and exclusive lock reuse the existing ledger primitive. A crash or any attempted run consumes the one-shot path: nonempty journal forbids replay; existing root/anchor forbids reinitialization; terminal state forbids further events. Fixed execution directory prevents another worktree from being used as a second allocation. There is no `next`, job/model selection, fifth-job, review/approval, retry, cancellation or recovery command. Failure needs owner review, not automatic diagnostics.

## Future live scope, only after exact-SHA authorization

At most **1 POST submission + 45 status GETs + 1 result GET + 1 required GLB download** = **47 API requests / 48 total HTTP requests**, subject to the deadline. Status polls are separated by 20 seconds. Deadline: 900,000 ms for the job's network lifecycle; each request at most 60,000 ms and never beyond remaining time. Zero retries, resubmissions, redirect following or fallback. Exactly one generation at a time. Completed submission may need no status polls; no result read until validated completion.

JSON body limit 2 MiB. One required asset, GLB only, bounded to 256 MiB. Prior retained downloads total 112,407,427 bytes; one maximum chest asset remains below the original 1 GiB aggregate ceiling. Existing transport reads bounded chunks, caps accumulated bytes and stores completed bytes exclusively in ignored private storage. It has no resume/retry. No additional textures or sidecar asset downloads.

Queue receipt/status/result URLs must satisfy the original exact fal route policy for the newly submitted request ID; changed result/status URLs stop. Optional request IDs/model/endpoint/provider/attempt metadata and request headers are checked when provided; queue request ID is required. Unexpected status, HTTP response, format, host, metadata or download failure stops before the next request. Only exact validated `model_glb` output objects confer asset provenance.

Existing fal host allowlist is unchanged: `fal.media`, `v3.fal.media`, `v3b.fal.media`. No general GCS expansion. HTTPS, no credentials/ports/fragments/path normalization tricks; all DNS answers must be public; one address is pinned with original-host TLS/SNI, no second address or redirect. Asset requests use empty explicit headers; no fal credential/cookies are forwarded. Binary bytes, full signed URLs, arbitrary provider bodies/headers and private names never belong in Git. Local terminal records retain only safe reasons/metadata/hashes.

## Bounded structural and lid inspection

The inspector supports static, embedded GLB 2 with triangle primitives and uncompressed typed accessors. Unsupported compressed extensions, external buffers/images, skins/animations, sparse accessors, invalid references or non-finite geometry stop for review; no decoder installation or extra asset request follows. Existing container/PBR checks are retained. JSON <=2 MiB; bounded arrays <=4,096; <=4 million vertex occurrences and <=12 million indices; hierarchy depth <=64; 60-second structural deadline.

Report container/byte/hash, meshes/nodes/materials/textures/images, observable PBR factors and texture bindings, primitives, vertex/index counts, actual position bounds, node transforms/hierarchy and candidate part ownership. Dimensions use stored coordinates, not verified meters. Bounds cover declared node instances; canonical orientation/up/hinge axes, metric alignment, visual usefulness and navigation remain unverified. Embedded image bytes are not rendered/decoded. No arbitrary node/mesh names are exposed; only bounded semantic hints are reported.

Lid classifications: `SEPARATELY_ADDRESSABLE_LID`, `POSSIBLE_BUT_UNVERIFIED_LID`, `FUSED_OR_NOT_SEPARATELY_ADDRESSABLE`, `STRUCTURE_UNVERIFIED`. This automated inspector **never promotes names, materials or appearance into SEPARATELY_ADDRESSABLE_LID**. A sole primitive is fused/not separately addressable; distinct primitive/mesh ownership is only a possible unverified candidate. A strong separate-lid claim requires later explicit semantic/manual verification of the actual structural part. Texture/material boundaries alone are insufficient. A fused lid is a valid terminal capability limitation, never retry permission. Visual quality stays MANUAL_REVIEW_REQUIRED.

## Operator boundary

No setup or credential changes are required now. After separate owner authorization of this exact clean branch/SHA, the fixed worktree is `C:\Dev\personal-rpg-console-phase38-chest-final-preparation`. The CLI admits only `inspect`, `init --live --approved-sha=<exact SHA>`, `run --live --approved-sha=<exact SHA>`, and local `audit --live --approved-sha=<exact SHA>`. No URL/job/limit/source/private-path override exists. `inspect` verifies sources without environment access or creating state; `init` is offline, creates a new identity exactly once and reserves nothing. `run` alone may read server-local FAL_KEY after all gates. Never paste credentials into chat. No command is executed live during preparation.

## Verification and stop

Run existing experiment tests plus `tests/offline/*.test.mjs` and `chest/*.test.mjs`; typecheck/build the original, offline and chest configs; lint the experiment with zero warnings. Synthetic tests mock every provider/download and use temporary private ledgers only. Actual histories are read-only hash-checked, never modified by tests. No production tests/build because production is unchanged. Actual results are recorded in DEV_STATUS and PREPARATION_RESULTS.json.

**STOP for owner review of this preparation SHA and manifest/freeze hashes. Do not initialize or submit the chest.** After any future chest attempt, stop for owner review. The next step after chest review is the final Phase 3.8B architecture/evidence freeze, not another spatial generation. Successful synthetic chest output is not production EXPLORE acceptance. No Phase 4, renderer, World Engine, deployment or real/private import.
