# Phase 3.8B exact fal artifact recovery — retained evidence

**RETRIEVED_AWAITING_OWNER_REVIEW. STOP.** The single authorized attempt downloaded the existing synthetic artifact and passed the frozen ZIP integrity inspection. This does not approve geometry, visual quality, navigation, production EXPLORE or another job.

## Execution and identity

- Exact clean execution SHA: 0c6ee50ef82a8d2b0423a31bf75ab402cfa492c5.
- Branch: codex/phase38-fal-artifact-recovery-preparation.
- Recovery identity: phase38b-fal-exact-artifact-recovery-1.
- Recovery manifest hash: 6c4762d090718fe11188f4d777eb51a1dd37ff515e14eeab6159f80c7d42ed98.
- Manifest file SHA-256: 585525468d336981c535b2bca23d9fb1c6dc61c7211f676cb5ff476445840183.
- Freeze file SHA-256: 27ed701679ff4b369c720d6ce10368a4f87d9f38f6284beb4bf7c59f0c6774ae; 67 inputs unchanged.
- Original protocol hash: 496360cc4171778eb153009ff4fe445d8ef75b08ab9aa0c4e884452e21c3bacb.
- Existing request: 01a0bc76-ae7f-7e02-960b-a207094622d2.
- Observation began: 2026-09-20T04:45:39.870Z.
- Requested provider/model: fal / fal-ai/hunyuan_world/image-to-world; actual provider API model **UNKNOWN** (null). The response did not report a separate request ID; route identity remained exact.

Initialization succeeded **once**, with zero HTTP/DNS/reservation/generation operations. Before init, the new and old private roots/anchors were absent; the corrected ignore guard created nothing. The old stopped root/anchor remain absent.

## Request outcomes

| Operation | Count | Outcome |
|---|---:|---|
| Exact fal result GET | 1 | HTTP 200; exact response URL; no redirect |
| Exact provenance-bound artifact GET | 1 | HTTP 200; exact capability URL; no redirect |
| Bounded asset DNS resolution | 1 | All returned addresses passed public-address checks; first answer pinned with original-host TLS/SNI |
| Complete artifact downloads | 1 | Exact 85,481,294 bytes |

The raw result hash was checked before JSON/descriptor interpretation and **exactly matched** 5dd84907167313f73db618cc1e1768bb658c59fafdb4dc2fb4119d7e2c1e78d6. The signed capability was unchanged; no URL refresh occurred. The asset transport used empty explicit headers and never received the fal credential. One application-level asset DNS lookup follows from the frozen default successful transport; low-level OS DNS packets and queue-host lookup are not separately measured.

Artifact SHA-256: **721f2afef8c2c045566e20f203557c549d712eef430edd671e5bb2c00b2de331**. Its size/hash were also verified against retained bytes locally after the run. Full signed URLs, raw response bodies, credentials and archive bytes are excluded from this report and Git.

## Offline archive inspection

**ZIP integrity passed** under the frozen classic-ZIP limits: all entry CRCs and content hashes verified; paths, conflicts, file types, directory/entry bounds and compression bounds passed. No extraction, execution or additional network.

- Entries: **17**.
- Aggregate uncompressed bytes: **152960818**.
- Inventory: **12 PNG, 3 PLY, 2 JSON**. Extension labels are inventory classifications, not proof of decoded image/geometry validity.
- DRC: **absent**; bounded Draco header result not applicable.
- GLB/glTF: **absent**.
- World-format candidates: **3 PLY**, each **ARCHIVE_INTEGRITY_ONLY / UNVERIFIED**.
- Structural usability: **MANUAL_REVIEW_REQUIRED**.
- Visual quality: **UNVERIFIED**. Navigation quality: **UNVERIFIED**.

Every entry's index, extension, compressed/uncompressed sizes, content SHA-256 and path SHA-256 are retained in [sanitized JSON](fal-exact-artifact-recovery-001.json); no original entry names/content are exposed.

| Entry | Extension | Compressed bytes | Uncompressed bytes | Content SHA-256 |
|---:|---|---:|---:|---|
| 0 | png | 8664112 | 8942162 | df843c52388d9befbf312a5fdeb70b45b210b4454b91ec2c8f044567d11e7acd |
| 1 | png | 2106434 | 2105789 | 7111ceb4fdaca5bccd0df99a5924dfa5f55a8f263e078cfdf51c680651dabd3f |
| 2 | png | 8589739 | 8865703 | 4b9df9f2db65349ce287e8f1bb06cc0176764a4055f5153fa94d3ce3bcc7a77d |
| 3 | png | 2033194 | 2032574 | 4d3d0e07fdf130d257754f2f23ca7b47272dd58915ff805279e7d039b5c04fee |
| 4 | png | 2106434 | 2105789 | 7111ceb4fdaca5bccd0df99a5924dfa5f55a8f263e078cfdf51c680651dabd3f |
| 5 | ply | 2996121 | 4988607 | 049c9f02b7410eec5070c2c59020d7e308f7ee6d4735634ab98ea557fe04b0c1 |
| 6 | png | 123 | 8021 | 3342e13ecfc44d571553b2dd1df7ef2832f0e765ca4597fdda91636af445b1ee |
| 7 | png | 2023773 | 2023153 | c36fc8c67b56f16b55b987c9efeac6b84278a575b1787afb296fa6f574d92c93 |
| 8 | json | 330 | 1189 | 76d091387a4ec51674469702c86f19c1d66ae65acf85ec7c5b6404703949657d |
| 9 | png | 2065398 | 2064771 | ae2fa045e493a649cfdfead8997453408cba7c4037f785708904fee0fa9fad33 |
| 10 | png | 4368 | 11792 | 3923bc127be5805fdcb1e8d9bec5ff8a2a84e2981780027d01261a8fb01273f2 |
| 11 | json | 328 | 1191 | dd2e06487b51b86d35ea27e84396d7bfa6ababe297d63be8e17bc0fceb958ee1 |
| 12 | png | 2095 | 9740 | 9eb35072b296557c260a8cce706f32c844627c815c9760053d0c8eed9b334b94 |
| 13 | png | 8404854 | 8688378 | fee0acfaf72c990af53a9b0fdbab0ab0cbf4c985961e97b6431481714266a524 |
| 14 | ply | 35098915 | 97639951 | 097c1da725a549f1380113af256f125cad8f53bc3a74ecde3234feaf2878f18a |
| 15 | ply | 2885552 | 4693739 | 0b241dc4e68168573ea679d8f1d4bcc41a2050ab02948f21df34e9a4dc89b233 |
| 16 | png | 8497706 | 8778269 | 4985dbabd17727b10de04583752320dc0ae89c08c0da579ce7898c6aaaea54c9 |

## Accounting and safety

Unchanged: **$4.15 / $4.75 reserved; $2.528 known reported billing; fal charge UNKNOWN; original $0.35 fal reservation retained once; $0.60 chest allocation unreleased**. No new reservation/refund/generation or billing reconciliation. Historical 46 API requests, 8 downloads, 3 generations plus this attempt = **47 API requests excluding asset downloads, 9 completed downloads, 3 generations**. This attempt made exactly **2 HTTP GETs**. Unknown charges are not zero.

Zero POSTs, retries/resumes, second result/asset GETs, redirect following, polling, resubmissions, fallback, generation, billing/World Labs/export/next/chest calls. Global/persistent allowlists unchanged. No approval appended and no next job released. Chest remains unattempted.

## Preservation and verification

Original stop commit 5c01cb463ea677186de5ed85aba874a4a363c746, file hash a7eb980b950c3a30f0c4686fdd9c4529d9e02927d38b63ab2df6ecf65c915760, remains immutable and is not reinterpreted as successful. All 29 previous committed evidence files and prior continuation/status/retrieval/diagnostic history passed exact hash verification before/after. New recovery terminal digest: 443f7ba0a74b235468f2ffe0c8ba52506f8f4245e29616ca6b27a29c287a2d47. Journal/anchor/witness hashes are recorded in the JSON. The approved execution branch is still clean at the exact SHA.

After the observation, **704 deterministic tests passed**, zero failures/skips/cancellations; typecheck passed; lint passed with zero warnings; isolated experiment build passed. Checks used a separate evidence worktree without copying/removing the live private journal. Production tests/build were not rerun because production is unchanged. No dependencies were installed.

Only this report, its sanitized JSON and DEV_STATUS.md change. Runtime, schema, dependencies, frozen contracts, global host policy, main and the original checkout's pre-existing documentation remain unchanged. Physical iPhone/Safari and optional historical Phase 1 conflict-rebase remain unverified. Finite synthetic tests are not universal guarantees; no hosted deployment or real campaign/private-data acceptance.

**STOP for owner review.** No chest/next, additional request, archive extraction/viewer, production EXPLORE or implementation is authorized by this result.
