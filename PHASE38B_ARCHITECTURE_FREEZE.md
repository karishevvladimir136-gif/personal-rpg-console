# Phase 3.8B — final architecture and capability evidence freeze

**ARCHITECTURE / CAPABILITY EVIDENCE COMPLETE WITH DOCUMENTED LIMITATIONS.** September 20, 2026 UTC. This documentation-only closure uses the owner-accepted final chest evidence and prior accepted structural observations. It does not claim production renderer completion, final visual quality, navigation, canonical metric alignment, object articulation, production EXPLORE readiness or hosted deployment acceptance.

Freeze identity: **phase38b-final-architecture-evidence-freeze-1**. The [machine-readable freeze](experiments/phase38-spatial/final-freeze.json) binds source commits, exact evidence and private-history hashes, original harness freezes, retained-file hashes, final accounting and the documentation in this commit. It is an offline evidence index, not a new execution identity, ledger, budget or provider permission. Its integrity field records the canonical payload SHA-256; no execution protocol/hash is replaced.

## Evidence bindings

| Evidence | Exact accepted checkpoint | Retained record |
|---|---|---|
| Room recovery | d6a420056ea2eaca326567a914d5c070a43d0a82 | [Room](experiments/phase38-spatial/results/ROOM_RECOVERY_001.md) |
| Courtyard | 420a94e3d13232d2b0f86bdb389770e77486e7a2 | [Courtyard](experiments/phase38-spatial/results/COURTYARD_001.md) |
| Original fal STOP | 28efcc7b50f6943022f93906770d2e8196e1e682 | [Original fal stop](experiments/phase38-spatial/results/FAL_WORLD_001.md) |
| Fal completed-status observation | 3371a20427c33abed810ff0af83a031c943090ac | [Status observation](experiments/phase38-spatial/results/FAL_STATUS_OBSERVATION_001.md) |
| Fal artifact recovery | e74f98070a35506bdb0401e2d2db2e492c9f8da4 | [Artifact recovery](experiments/phase38-spatial/results/FAL_EXACT_ARTIFACT_RECOVERY_001.md) |
| Final PLY structural acceptance | b666764a7e352bc82d1528ad7c392662bed0bd9f | [PLY inspection](experiments/phase38-spatial/results/FAL_PLY_INSPECTION_001.md) |
| Final chest / freeze base | b7917b371a54d919842df69acdc3c19bc2f0bc2a | [Chest stop](experiments/phase38-spatial/results/CHEST_FINAL_001.md) |

Chest execution remains **5468dcb72683e8c78eb0a098b15c7f1bf0e056cb**, identity **phase38b-chest-final-1**, request **01a0bd57-6a2f-77f2-b12d-58e56ce400ac**. Chest manifest hash: **03ece6c4df5ce8ee60b691991008f1556d3d5036f86483366f43c4595f3cf55a**. Original protocol hash: **496360cc4171778eb153009ff4fe445d8ef75b08ab9aa0c4e884452e21c3bacb**. Continuation hash: **9b3f84c9e74a3be531d322dc59b623400e3de15a2b09e7231cfeb730cc56a8e1**.

All historical STOPPED records remain exactly as observed. Later separately authorized recovery evidence and owner decisions add information; they never relabel an earlier STOP as successful or overwrite its result. Historical “awaiting review”, “not attempted” or setup instructions in those records describe their original checkpoint, not current authorization. The [original live protocol](PHASE38B_LIVE_PROTOCOL.md) and [dated provider research](PHASE38_PROVIDER_CAPABILITIES.md) remain unchanged historical documents.

## Capability decisions

| Job | Final architecture/capability disposition | Remaining boundaries |
|---|---|---|
| spatial-room-1 | Bounded World Labs spatial-world capability sufficient for the architecture decision; recovered without regeneration. Requested/reported marble-1.1; world 82a0e059-50a4-41a4-8565-5e516ffadc0e. | Structural synthetic continuation approval only; no final visual/prompt-fidelity, renderer, navigation or canonical metric acceptance. |
| spatial-courtyard-1 | Independent bounded World Labs capability sufficient for the architecture decision. Requested/reported marble-1.1-plus; world fedc9eef-f123-4f96-b00a-bd9e955a9326. | Reopen and structural evidence do not establish final visual quality, navigation, metrics or production EXPLORE readiness. |
| spatial-fal-world-1 | Owner-accepted STRUCTURALLY_USABLE_PLY_WORLD_CANDIDATE; exact retained ZIP and three valid nonempty PLY layers. | No DRC despite export_drc:true; actual provider API model and billing UNKNOWN. Visual quality/navigation UNVERIFIED. No retry. |
| spatial-chest-1 | Accepted POST, HTTP 200, IN_QUEUE; first poll stopped at http_or_redirect_failure. | Completion and charge UNKNOWN; no GLB retrieved; object/PBR/articulation UNVERIFIED. This is not proof of provider generation failure. No recovery/retry/poll. |

Both Marble worlds returned retained **SPZ v2 / 98,304 points**, a collider **GLB with 1 mesh / 2 nodes / 0 materials**, **PNG 4608 × 2304** panorama and **WebP 720 × 480** thumbnail. Both pairs of world reads were identity-stable and byte-identical at observation time. This is bounded reopen evidence, not a long-term hosting/service guarantee. Provider scale metadata was present: room metric scale 2.268181800842285 / ground offset 1.537428617477417; courtyard 4.759617805480957 / 2.742072582244873. These numbers do not prove metres, collider alignment or navigation.

Fal-world's exact retained artifact is **85,481,294 bytes**, SHA-256 **721f2afef8c2c045566e20f203557c549d712eef430edd671e5bb2c00b2de331**. Its valid ZIP has **3 valid nonempty PLY mesh layers, 12 PNG and 2 JSON files**. The accepted inspection checked **1,963,959 vertices / 3,953,559 triangular faces**, finite coordinates and valid face references. It did not establish manifoldness, watertightness, metric scale, visual coherence or navigation. PNG/JSON support does not imply texture mapping correctness or full decoded-image acceptance.

**PLY is an acceptable observed provider representation.** The request used export_drc:true, but no DRC was returned. Preserve this provider/export limitation. Future adapters/renderers must support observed PLY or a validated offline conversion path; production must not require DRC exclusively. No retry, replacement model, conversion implementation or new format experiment is justified by this finding.

Chest made exactly **1 POST and 1 status GET**, then stopped; **0 result GETs and 0 asset downloads**. The frozen transport discarded detailed status/response-URL metadata before reporting its combined HTTP-or-URL guard failure. Do not infer a non-200 code, redirect, completion, failed generation or zero charge. No GLB/geometry/material/texture/PBR/part measurement exists. Lid classification: **STRUCTURE_UNVERIFIED**. **A separate lid is NOT proven.** Visual quality: **MANUAL_REVIEW_REQUIRED**; navigation **UNVERIFIED / not assessed for this isolated object**. No further observation or recovery is planned.

## Accounting freeze

| Original generation slot | Permanent reservation | Known reported charge |
|---|---:|---:|
| Room | $1.30 | $1.264 / 1,580 credits |
| Courtyard | $2.50 | $1.264 / 1,580 credits |
| Fal-world | $0.35 | UNKNOWN |
| Chest | $0.60 | UNKNOWN |
| Total | **$4.75 / $4.75** | **$2.528 known**, plus unknown fal charges |

**Four historical generation submissions; remaining allocation $0.** The room reservation carried into the continuation is counted once, with its original source hash verified. Reservations are not charges. Unknown charges are never zero. Fal-world/chest reservations remain retained; no refund, reuse, replenishment or fifth generation. Retained cumulative observations: 49 provider API requests excluding assets and 9 completed downloads. This freeze adds none and does not query billing or account balances.

## Architecture decision

1. **Authoritative RPG/world state remains the source of truth.** Spatial and visual outputs are untrusted, versioned projections; generated objects, coordinates or camera movement never create canonical entities or mutate time, inventory, quests, relationships or progression.
2. **Interaction Bindings are provider-neutral.** They are the same versioned spatial-binding concept in [Spatial Runtime](PHASE38_SPATIAL_RUNTIME.md#artifact-and-binding-records--proposed-minimum-metadata), not a second subsystem. They map structurally verified addressable nodes, meshes, parts or anchors to stable canonical RPG entities/actions. Provider object IDs are never canonical entity IDs. Geometry generation, provider switching and rebinding preserve canonical identity.
3. **Object generation is not a production architecture dependency.** Missing/fused/non-addressable parts are acceptable provider limitations. No automatic regeneration, fabricated articulation or semantic lid proof from names/materials/colors. Unsupported interactions remain available through the normal text/rules/DM authority path.
4. **Text mode is permanently first-class and functional without spatial generation. 2D Live is the primary planned visual gameplay layer**, optional over the same authoritative state and visual-style agnostic. **EXPLORE remains optional and progressive**, asset-first after Phase 4 Visual Bible / canonical asset foundations. Marble remains the intended initial EXPLORE provider unless implementation reveals a concrete blocker, not a universal ontology or runtime dependency.
5. **Spatial providers are implementation infrastructure.** World Engine, Rulesets, DM, Memory, Saves/Timelines and progression do not depend on successful spatial generation. Reuse accepted source/version, memory, storage, timeline membership and activation-epoch systems; do not build parallel authority or rollback systems.
6. **Privacy and authority guards remain intact.** Player-visible knowledge only enters browser-delivered projections; quarantine/withhold unsafe geometry. Interactions pass ordinary owner/campaign/timeline/revision/knowledge/rules validation and authoritative commit. Unsupported provider response fields/formats must be handled from observed documented contracts without fabricating provenance or loosening security.

The experiment establishes enough capability evidence to freeze this architecture despite the chest's unverified object result. It is not acceptance of a production renderer, final visual quality, navigation, canonical metrics, articulated objects, real data, EXPLORE readiness or hosted deployment.

## Source-of-truth handoff

Latest owner-approved roadmap target: **chatgpt/poi-2d-roadmap**, exact SHA **a3d0fa66da42f36a5401c3513e3484e83150f9d3**.

The owner reports its scope as World Engine; World Library / Packs; bounded Research from Web; Rulesets / Dynamic UI; Progression / Rewards / Challenge Scaling; companion progression; DM Craft / Campaign DM Style; spellbook / spellcasting; World Magic Rules; semantic physical causality; Text / 2D / EXPLORE architecture; and Interaction Bindings. Record these requirements without another design pass here.

**Offline verification boundary:** that exact roadmap object is absent from this local object database. The local branch still resolves to 34ad3f3baedfde936f0d855f78c1adfcd2119415. No fetch, remote roadmap check, roadmap edit or substitution was performed. This freeze records the owner's target; it does not claim independently reviewed contents or ancestry for the unavailable SHA.

The next separately reviewed step is **safe source-of-truth integration of the exact roadmap into production main**, including this freeze's final decisions. That task must retrieve and verify the designated commit, inspect overlaps and retain both sets of owner requirements while preserving the original checkout's pre-existing uncommitted documents. No merge of main or modification of the roadmap branch occurs here. Earlier proposed slice numbering remains historical until this reconciliation; do not independently invent a replacement roadmap now.

**Broad product research/design is closed.** Do not begin another broad architecture/research cycle unless actual implementation reveals a genuine blocker. **After safe roadmap integration, the next development phase is a production multi-agent coding sprint**, with a Lead/Integrator controlling shared contracts/migrations and specialized development agents operating from the same source of truth. Development workers do not imply multiple primary gameplay DM runtimes. This document does not start that sprint.

**No additional Phase 3.8B spatial/provider experiment is planned.** A future provider issue is a separately bounded implementation blocker investigation, not continuation of this bake-off. No chest recovery, fal-world retry, additional generation, diagnostics, provider probing, production coding, deployment or real campaign/private import follows from this freeze.

## Verification and preservation

Current offline checks verify all **37 prior evidence files** against the accepted Git base, all **28 private history files**, **7 journal/witness/identity chains / 164 entries**, all referenced source commit ancestry, the unchanged **67-input original and 11-input chest freezes**, and final reservation/billing arithmetic. **11 retained local evidence files were rehashed** (9 binary assets and 2 private response files; only hashes/lengths retained), totaling **112,412,777 bytes**. No asset is re-fetched, rendered, extracted or decoded; prior PLY/image inspection findings remain attributed to their accepted records.

The [machine-readable verification record](experiments/phase38-spatial/final-freeze.json) records documentation links/anchors, strict UTF-8, conflict-marker and whitespace checks; unchanged source/history bindings; and preserved branch/document baselines. It contains no credentials, signed URLs, private provider bodies or binary bytes. No new ledger or approval record is created; all original STOPs remain immutable.

Historical post-chest verification at b7917b371a54d919842df69acdc3c19bc2f0bc2a: **839 deterministic tests passed**, all three experiment typechecks/builds and zero-warning lint passed. Those checks are not claimed rerun here. This task changes documentation/evidence indexing only and verifies original files by hash; code tests/typecheck/lint/build are not relevant to changed files and are not rerun. No production or live integration check is performed.

Physical iPhone/Safari and the optional historical Phase 1 conflict-rebase confirmation remain unverified. Finite synthetic evidence does not guarantee perfect branching, memory isolation, geometry, provider behavior or recovery. No hosted deployment or real campaign/DM-private-data acceptance has occurred. Production/main, roadmap, execution checkouts, accepted records and original uncommitted documentation remain untouched.

**STOP for owner review.** Only the expressly requested GitHub freeze-branch push/verification uses network; provider, experiment, DNS/asset, generation, polling, retrieval and billing calls are all zero.
