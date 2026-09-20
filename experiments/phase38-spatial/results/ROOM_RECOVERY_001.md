# Existing-room recovery 001 — structural success; awaiting owner review

Execution: `a8b3d503fd9da4b75e3dfdaf071ee8423550217c`. Owner authorized init and room recovery only. Both executed once. No manual approval or next action occurred.

Raw result SHA-256: `b2a74c1f1325699ad6c5e8505d3ec09a73a7c8af299f03bce824a5cd38973066`. Sanitized structural record: [JSON](room-recovery-001.json). Exact safe append-only [journal](room-recovery-001-ledger.jsonl) and [witness](room-recovery-001-witness.jsonl) copies preserve their source hashes. Raw result containing provider-returned URLs and the four binary assets remain ignored/local only; no credential or signed URL is committed.

Existing operation `6719be80-101e-45a6-b27a-6905ebc183c1`; world `82a0e059-50a4-41a4-8565-5e516ffadc0e`. Get World reports `marble-1.1`; privacy is private. Both reads were HTTP 200, identity-stable and byte-identical.

Exactly 2 authenticated world GETs and 4 successful asset downloads; 0 generation submissions, operation polls, exports, fal calls, retries or fallbacks. Recovery elapsed 2867 ms (not generation latency).

| Asset | Detected structure | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| splat | SPZ v2; 98,304 points | 1129723 | `1f54d810e39af515f3cef5c31a482ef7747d293a1890159c631663185518b16c` |
| collider | GLB/glTF 2; 1 mesh, 2 nodes, 0 materials | 3538308 | `0fcc9393ac3348ce6e62d57bd5fbbf7b8d79155a0855142adaedd80267ad8775` |
| pano | PNG 4608 × 2304; 2:1 dimensions | 9987509 | `aeb206aa80a770dfb859448c083c9d0ca7405073e69e17e7b544907abcd738ac` |
| thumbnail | WebP/VP8 720 × 480; one chunk | 15270 | `bd942ece19d644ba7238032b0b00fcf6ca9bf8f59263a3ff5a14f5512ae6ad3d` |

Reported scale: `metric_scale_factor = 2.268181800842285`; `ground_plane_offset = 1.537428617477417`. These values are retained metadata, not an independently verified physical scale or collider alignment.

Original accounting remains one retained $1.30 reservation and $1.264 / 1,580 credits charge. No new generation charge or reservation. No billing dashboard query or additional billing claim. The original cumulative ceiling is $4.75. Original stopped history/evidence and frozen files verified unchanged. Historical 21 API requests plus 2 new = 23; lifetime world reads 5; lifetime generation submissions still 1.

Post-run offline verification: 273 deterministic tests passed, 0 failures/skips; experiment typecheck, zero-warning lint and isolated build passed. No production build rerun; production code/dependencies/schema/UI and main unchanged.

No visual/prompt-adherence acceptance: only frozen structural checks passed. Panorama has 2:1 dimensions; actual projection/decodability/sharing, splat rendering, collider usability, metric scale and cross-asset alignment still require review. Bounded WebP header inspection is not full pixel decoding. The room remains awaiting manual review; courtyard/fal-world/chest are not released or attempted.

**STOP for owner review. No approval, next action, generation continuation, EXPLORE implementation or deployment.**
