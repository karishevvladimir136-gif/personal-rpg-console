# Phase 3.8B final chest — stopped live evidence

**STOPPED at the first status poll. No result or asset was retrieved. STOP for owner review.** Fal accepted the one chest submission with HTTP 200 and IN_QUEUE, but the frozen transport rejected the first poll with **http_or_redirect_failure**. This establishes a local transport stop, not failure or completion of the provider generation. No additional provider call followed.

## Approved execution and immutable history

- Execution SHA: **5468dcb72683e8c78eb0a098b15c7f1bf0e056cb**. Execution branch remains clean and unchanged.
- Identity: **phase38b-chest-final-1**.
- Manifest hash: **03ece6c4df5ce8ee60b691991008f1556d3d5036f86483366f43c4595f3cf55a**.
- Manifest file SHA-256: **1691737f7de7b87c38636198dc69150ad74cd6ace82bf0bb01c0af611d96bbc2**.
- Chest freeze SHA-256: **2571e5cd3343d590f13726870af9e8e7d0d6998eb1d47f77aba99c9f1231ce3f**.
- Original protocol: **496360cc4171778eb153009ff4fe445d8ef75b08ab9aa0c4e884452e21c3bacb**.
- Continuation hash: **9b3f84c9e74a3be531d322dc59b623400e3de15a2b09e7231cfeb730cc56a8e1**.
- All 33 earlier evidence files, 24 private history files and original 67 frozen inputs remain unchanged. The original continuation/fal STOP remains closed; old nextJob protection is unchanged.
- Fal-world remains owner-accepted structurally at b666764a7e352bc82d1528ad7c392662bed0bd9f. Three valid PLY meshes; absent requested DRC remains a limitation. No fal-world retry.

## Exact single authorized attempt

Requested provider/model: **fal / fal-ai/hunyuan-3d/v3.1/pro/text-to-3d**. Actual provider API model: **UNKNOWN/null**; never inferred from the request. Exact frozen Normal + PBR input, without a seed, face-count override or extra parameters, is retained in the sanitized JSON.

Request ID: **01a0bd57-6a2f-77f2-b12d-58e56ce400ac**.

| Operation | Count | Outcome |
|---|---:|---|
| Successful initialization | 1 | Zero network/reservations/generations |
| Reservation | 1 | $0.60; cumulative $4.75 |
| POST submission | 1 | HTTP 200; exact response URL; IN_QUEUE |
| Status GET | 1 | Frozen transport rejected HTTP/response-URL condition |
| Result GET | 0 | Not attempted |
| Artifact GET/download | 0 | Not attempted |
| Asset DNS lookup | 0 | Not attempted |

Exactly **2 new provider API/HTTP requests**. Started **2026-09-20T05:43:38.285Z**; stopped **2026-09-20T05:43:58.865Z**; local attempt elapsed **20580 ms**. Poll occurred 20008 ms after the queue receipt. Provider completion latency/state remain unknown.

The generic frozen transport requires status 200 and exact response URL before returning any response object. Its failed assertion did not retain the numeric poll status, response URL, redirect metadata or body hash. The original rejection is preserved without diagnosis or reinterpretation. No redirect was followed. Submission response hash: **82572e2c7fc329519a9717bab36682ab2a98e69d2480d198f019e849d942a16e**; 437 bytes, no billable-units metadata. Raw response bodies and headers are excluded.

## Structural capability outcome

**No GLB was downloaded, so the frozen structural inspector was not reached.** Format, byte count/hash, container validity, mesh/node/primitive/vertex/index/material/texture/image counts, PBR/normals/UVs, bounds/dimensions, hierarchy, transforms and candidate parts are **UNVERIFIED / not available**.

Lid classification: **STRUCTURE_UNVERIFIED**. **A separate lid is not proven.** Visual quality: **MANUAL_REVIEW_REQUIRED**. Navigation: **UNVERIFIED**. No canonical metres/orientation or articulation claims; no renderer work.

## Accounting

Prior reservations $4.15 + single retained chest reservation $0.60 = **$4.75 / $4.75**, remaining allocation **$0**. Known reported billing remains **$2.528**. Fal-world and chest actual billing are both **UNKNOWN**, not zero. The prior $0.35 fal-world reservation is retained once; the new $0.60 chest reservation is permanent. Frozen published maximum $0.525 is not an actual charge observation. No billing request, refund or reuse.

Cumulative history: **4 generation submissions, 49 API requests excluding asset downloads, 9 completed downloads**. The fourth and final generation slot is consumed; no fifth job exists or is authorized.

## Retained integrity and verification

Sanitized exact journal/witness copies are retained beside [JSON evidence](chest-final-001.json).

- Journal SHA-256: **a9674f6c6887e1d64c24ef0b057921940fb1036ec6025e30d1d2ad5ef200e597**.
- Witness SHA-256: **6c5d2dd519afc6c19d26760619c116ee93097d83e2c74463d90559e39b2c8689**.
- Identity/anchor SHA-256: **5dd255cf6fc4b4454bad00edfb76300476981940211229779fe70527faef30a2**.
- Terminal digest: **0d3295106a1e35c47b842700418e987ac370db8e23b15bd8300b3d53b38783b8**; seven entries, permanent STOPPED state.

After the terminal result: **839 deterministic tests passed**, zero failures/skips/cancellations; all three relevant typechecks and isolated builds passed; lint passed with zero warnings. Verification used the separate evidence worktree with synthetic transports. No live ledger removed/reset. Production tests/build not run because production is unchanged.

Only this report, sanitized JSON, safe journal/witness copies and DEV_STATUS.md change. No credentials, signed URLs, unsafe raw provider bodies, GLB or texture bytes are committed. Execution code, freezes, production/main/dependencies/schema/UI and original checkout's pre-existing documentation remain untouched. Physical iPhone/Safari and the historical optional Phase 1 conflict-rebase remain unverified. Finite fixtures do not guarantee universal recovery. No hosted deployment, real campaign/private-data or production EXPLORE acceptance.

**Zero retries, fallback, redirect following, second submission, fifth generation, fal-world retry, diagnostics, cancellation, billing/World Labs/export calls, approval or next release.**

**STOP for owner review.** No further provider call or generation is authorized. The next planned step after owner review is final Phase 3.8B architecture/evidence freeze, not another spatial generation or implementation.
