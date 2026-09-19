# Phase 3.8B — live run 001, stopped for owner review

Execution SHA: `2f8f82edb5d5f3c960d45922b71c543e99208192`. Protocol SHA-256: `496360cc4171778eb153009ff4fe445d8ef75b08ab9aa0c4e884452e21c3bacb`. The clean frozen checkout and all 17 pinned files were verified; the owner confirmed keys saved/funding ready. The ledger was initialized exactly once. Evidence is published on the separate `codex/phase38-spatial-evidence` branch, preserving the execution checkout at its authorized SHA. Earlier setup-stop evidence remains untouched.

## Outcome and accounting

**One of four submissions attempted; zero passed the frozen acceptance gates; one stopped during world metadata validation; three not attempted.** The room operation completed according to the frozen polling flow, but this is not a successful spatial capability test or proof of a provider generation failure. No later job was submitted and no gate was bypassed.

- Requested provider/model: World Labs direct `api.worldlabs.ai`, `marble-1.1`. Provider-internal actual model/revision is **UNKNOWN**. The pin proves the request target, not an independently reported execution revision.
- Operation ID: `6719be80-101e-45a6-b27a-6905ebc183c1`. This is an operation ID, **not** a World Labs world ID.
- One submission, 16 status polls and one world read: **18 authenticated requests, all recorded HTTP 200**. Zero fal calls, downloads, retries, observed fallbacks or diagnostics.
- Provider-reported **1,580 credits / $1.264** recorded before the stop. The full **$1.30 reservation remains consumed**. No unknown charges for the single attempted job; dashboard totals and account-funding amounts were not inspected. The other three slots incurred no requests/charges. No unused reservation is recycled.
- Room completion was observed by the start of the world read, **329.745 seconds (about 5 minutes 30 seconds)** after the harness began. This includes submission/polling and is an observed upper bound, not provider-internal generation time. Courtyard latency is not applicable because it was not attempted.

## Exact stop and evidence limits

The first world GET returned HTTP 200 with **3,868 bytes**. Its retained SHA-256 is `b47fd9cf01c6d05bbe95ca844540df27df5edd27bcf183c9b30aa8d35a103fe4`. The next durable entry is the frozen stop: stage `world`, reason `unexplained_or_invalid_response`, billing `REPORTED`. No second world GET or asset download followed.

The frozen validator rejected that response. It retains only a response hash/size and a generic stop, not the raw body or specific failed assertion. Consequently the exact invalid field/root cause is **UNKNOWN**; this evidence cannot distinguish a provider defect from a harness compatibility issue. No diagnosis is invented and no new API read was made to recover it. The world ID used transiently for that GET was not retained; the ledger contains only the world URL hash. Its value cannot be recovered from the operation ID or hash.

The hash-verified, field-allowlisted [ledger copy](live-run-001-ledger.jsonl) preserves all 40 records byte-for-byte. It includes only request metadata, IDs, hashes, sizes, numeric charges and stop state; no credentials, request headers, signed asset URLs, raw provider messages or real/private data. [Machine-readable report](live-run-001.json) records hashes of the original journal, witness, identity and anchor. All original files remain untouched. No reset, truncation, retry, replacement ID or approval was written.

## Capabilities versus visual observations

| Requested observation | Actual result / boundary |
| --- | --- |
| World ID, persistence and re-open | World ID UNKNOWN in retained evidence; one HTTP-200 world read, validation rejected; re-open not reached and persistence unverified |
| Marble SPZ, collider, panorama, thumbnail | No files downloaded; availability/formats/size/asset hashes UNKNOWN, not evidence of absence |
| Room/courtyard visual or prompt adherence | No visual inspection possible from retained evidence; courtyard not attempted |
| Panorama compatibility/sharing | Unverified; no panorama transferred to fal |
| fal Hunyuan World type/usability | Not attempted |
| Chest GLB/PBR and independently addressable lid | Not attempted |
| Scale, collider and synthetic binding | Not verified; no offline geometry/binding replay possible without assets |
| Mobile/browser/privacy/export quality | No new acceptance; synthetic HTTP success is not production EXPLORE acceptance |

## Verification after the run

- Frozen deterministic suite: **91 passed, zero failed/skipped**.
- Experiment TypeScript typecheck, ESLint and isolated emit/build: passed.
- Real retained ledger chain/witness/anchor verified; calling the pure next-job gate fails with `experiment_stopped` without network I/O or journal changes. All durable evidence bytes match before/after audit.
- Frozen protocol/harness, production runtime/UI/schema/dependencies, production main and the original checkout's edits remain unchanged. Full application tests/build were not repeated for evidence/status-only edits; preparation results are preserved at their own checkpoint.

No credential value is exposed in the report or committed. No real campaign/private material was used. Physical iPhone/Safari and historical optional Phase 1 conflict-rebase confirmation remain unverified. Finite synthetic tests do not guarantee universal recovery; no hosted deployment or real-data acceptance occurred.

**Stop for owner review.** No remaining submission or investigation network request is authorized by a successful HTTP response. Any diagnosis requiring new provider reads, recovery plan or harness change needs a separately scoped owner instruction. No EXPLORE implementation, Phase 4, 2D renderer or deployment is started.
