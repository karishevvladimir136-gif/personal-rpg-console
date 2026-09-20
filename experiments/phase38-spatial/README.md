# Phase 3.8B — isolated experiment

**Current checkpoint: proposed metadata correction, offline verified; STOP FOR OWNER REVIEW.** Recovery evidence is separately committed at `98eb76618503dd2382ef97aaabfcb1377cab26e1`. See [correction scope and verification](CORRECTION_PROPOSAL.md). The two authorized diagnostic GETs are exhausted. Do not initialize a replacement ledger, run `next`, retry the room, download assets or continue other jobs. No new live permission follows from this correction.

## Historical preparation instructions (not current execution permission)

**PREPARATION ONLY. No live generation is authorized.** Phase 3.8A was explicitly owner-approved at 444f6836a5abce2014c3de4b6f234bf2a75399af. The owner must authorize this preparation's exact final Git SHA before any live command. No credentials have been requested or created. This folder uses Node 24 built-ins and the repository's existing TypeScript/lint toolchain; no new package dependencies or production integration.

## Frozen workload

[protocol.json](protocol.json) is the machine-readable four-job definition. [freeze.json](freeze.json) pins its canonical SHA-256 and all harness, fixture and official-evidence file hashes. Exact prompts come unchanged from the approved [protocol](../../PHASE38B_LIVE_PROTOCOL.md). [Official recheck](OFFICIAL_EVIDENCE.md) records current endpoints, prices, host examples and transport opt-outs. Explicit IDs/order: spatial-room-1, spatial-courtyard-1, spatial-fal-world-1, spatial-chest-1. No additional exports, diagnostics, retries or fallback. Reservations are integer micro-USD: 1,300,000 + 2,500,000 + 350,000 + 600,000 = 4,750,000 ($4.75). Published charges total at most $4.553; funding is a different quantity.

The fal panorama input is the exact retained room output with byte-hash lineage and explicit compatibility/sharing review; no substitute image or additional upload. Normal/PBR chest request omits custom face count and multiview. Actual provider-internal model remains null unless proven; requested model and returned consistency metadata are distinct.

## Offline commands used during preparation

From the repository root, using its existing installed development dependencies:

```powershell
node --test experiments/phase38-spatial/tests/*.test.mjs
node node_modules/typescript/bin/tsc -p experiments/phase38-spatial/tsconfig.json --noEmit
node node_modules/eslint/bin/eslint.js experiments/phase38-spatial
node node_modules/typescript/bin/tsc -p experiments/phase38-spatial/tsconfig.json
node experiments/phase38-spatial/src/cli.ts inspect
```

The test suite uses generated synthetic binaries, mock HTTP and a fake clock. Implicit fetch is disabled. No production imports/database clients, real campaign fixtures, credentials or live provider calls. Compile output stays ignored in .build; run source CLI for the future protocol. The freeze-writing development tool is for this preparation, not a live-run repair step: any later source/protocol change requires a new reviewed SHA and approval.

## Durable safety and future operation

The source CLI has no automatic execution path: default/inspect verifies the frozen files and prints nonsecret plan metadata without reading an environment file or creating a run. Live actions require both --live and --approved-sha=<exact clean HEAD>. A missing/mismatched flag, dirty checkout or altered frozen file stops before environment loading or network. The flag is an operator acknowledgement of explicit owner approval, not a substitute for obtaining it. **Do not supply it during preparation.**

A future approved run uses a single fixed ignored private-run directory in this experiment folder. Initialize exactly once; a sibling private-run.anchor prevents reinitialization even if the run directory is accidentally deleted. Never reset, remove, edit or truncate either. A cross-process exclusive lock serializes work; stale locks are not auto-cleared. Reservations, request counters, receipts, immutable content-addressed evidence, bills, manual approvals and stops append to a hash-chained journal and fsynced witness. Missing/truncated/partial/corrupted records, orphan assets or failed hashes block reopening; no automatic repair. Hashes detect accidental changes, not a malicious owner deleting every local safeguard or constructing another checkout; doing so is prohibited, not an authorized recovery method.

Each **next** operation can submit only the next unattempted job. The reservation is durable before submission; a crash after reservation conservatively consumes that slot even if it is unknown whether transport reached the provider. An incomplete/uncertain job cannot be repeated. HTTP/status/result/output failures append a stop and prevent later generations. Known charges remain separate from reservations; missing charges are UNKNOWN, never zero. SDK retries, redirects and alternate domains are absent. Both fal server retry/fallback opt-outs are fixed on submissions.

A structurally complete result pauses for manual output review; it does not approve itself. Missing billing also pauses. Fal units alone are insufficient dollar evidence. A separate append-only **billing** action accepts an owner-verified request-matched dashboard receipt with jobId, requestId, protocolHash and integer microUSD; its local file hash is recorded. Prices above the frozen job maximum fail. A **review** action requires the exact resultSHA256 and protocolHash plus explicit syntheticOnly, safeVisibleEnvelope, requiredOutputsUsable, assetFirst and noUnexpectedRouting confirmations. Room review additionally requires panoramaCompatible and panoramaSharingPermitted. Failed/stale review cannot release the next job. No receipt/review API call or new generation occurs in either action. Reconciliation does not erase unknown observations or return reservations to the budget.

After any unexplained failure, stop for owner review. No routine command clears a stop, rewinds a slot or resumes a partially issued request. Recovery would require separately reviewed instructions and a new explicit scope, not editing this ledger.

## Bounds and output limitations

At most 4 generation POSTs; 45 polls/job at 20-second intervals, 15-minute per-job deadline; 2 fal result GETs total; 2 world GETs/world (initial plus re-open), 4 total; at most 190 authenticated API requests and 14 asset downloads. Counters reserve before I/O, so failed attempts still count. Polling a normally pending receipt is not submission retry. Each HTTP/body read has a deadline and byte bound (JSON 2 MiB, asset 256 MiB, retained-download total 1 GiB). Asset requests send no API credentials. Exact HTTPS hosts are allowlisted; newly returned hosts stop for review.

Structural checks accept SPZ (including bounded gzip/ZSTD validation), GLB 2 with embedded geometry/material references, PNG/JPEG and required identity/scale/publicity metadata. Unknown/opaque DRC, archives, external GLB buffer/material dependencies or unsupported encodings stop rather than trigger a conversion or extra download. This first harness schedules ten asset downloads on its supported happy path; the reviewed fourteen-download ceiling remains hard, and unused material slots never authorize extra requests. Full rendering, safe geometry, collisions, articulation, lid separation and quality remain manual/live evidence, not facts proven by a magic header. No viewer dependency, 2D renderer or frontend is added. A fused lid is a reported articulation limitation, not automatic retry.

Before future approval, account and sharing terms must be reviewed. World Labs' documented minimum API purchase is $5; fal's current minimum top-up is unverified from public billing documentation. Do not equate the $4.75 generation cap with a total account-funding amount. No purchase or setup is requested now. Later instructions will use the ignored .env.local in C:\Dev\personal-rpg-console-phase38-preparation, mapping WORLD_LABS_API_KEY and FAL_KEY server-side; no file exists as part of this preparation and no keys belong in chat/Git/browser. No application restart is needed to run this isolated command-line experiment; each later authorized invocation loads its local environment afresh.

The production main/runtime/dependency lockfiles, Phase 3/3.5 contracts and the closed Phase 3.75 benchmark remain unchanged. Text RPG stays a permanent first-class mode independent of any visual renderer. Stop after preparation commit/push; no next or init live command until exact-SHA owner authorization.
