# Phase 3.8B — read-only recovery 001

Owner reviewed stopped evidence `3a94308e92e9454f056eac899a91ba0d366ee111` and authorized one Get Operation plus one conditional Get World for the existing room. This record does not amend or reinterpret the original stopped ledger. Its failure remains a failure under its original frozen validator.

## Actual observations

Exactly **two authenticated GETs**, both HTTP 200: operation `6719be80-101e-45a6-b27a-6905ebc183c1`, then its world **`82a0e059-50a4-41a4-8565-5e516ffadc0e`**. Zero submissions, retries, asset downloads, exports or fal calls. The read-only one-shot diagnostic reserved both request slots in a separate ignored local record; rerunning cannot issue them again. The original execution SHA and all 17 frozen hashes were verified before the reads.

The operation is done without an error, with the same settled **1,580 credits / $1.264**. This is the prior generation charge, not a new charge. The completed-operation snapshot reports model null; that stays UNKNOWN. The full Get World metadata reports model `marble-1.1`, matching the requested model, and `permission.public=false`, `allow_id_access=false`, matching world ID, display name and creation time. No provider-internal revision beyond that reported model is claimed.

The recovered world body is **3,868 bytes**, SHA-256 `b47fd9cf01c6d05bbe95ca844540df27df5edd27bcf183c9b30aa8d35a103fe4`, byte-identical by hash to the original rejected response. Its request URL hash also matches the original world GET. Applying the unchanged original validator to it raises **`stale_prompt`**, specifically `canonical(w.world_prompt) === canonical(job.input.world_prompt)`. Every other independently checked pre-URL assertion passed (world ID, private scope, known model, creation time, hosted locator and valid scale).

This proves an unsupported local prompt-echo assumption, rather than missing geometry metadata or a provider generation failure. It does not prove visual adherence or asset usability. We retained the returned prompt object's hash/types/equality result, not its content; the precise difference may be recaptioned content or representation. No invented prompt text is attributed to the provider.

## Contract comparison and smallest correction

[Get Operation](https://docs.worldlabs.ai/api/reference/operations/get) requires operation identity/completion and describes cost as nullable settled data on success. [Quickstart](https://docs.worldlabs.ai/api) explicitly permits partial completed snapshots and recaptioned world prompts. Therefore prompt equality cannot fence request identity; compare a recorded operation/world link and the immutable submitted request hash instead. Keep the original prompt unchanged.

[Get World](https://docs.worldlabs.ai/api/reference/worlds/get) marks model, creation time, permission and assets as nullable. Null model means UNKNOWN; a known conflicting model must still fail. Null timestamps are unknown, not automatically stale; a supplied invalid/old timestamp must still fail. Null permission may be inspected as unknown but cannot release downloads/sharing or the next generation. Required asset/scale absence remains a capability/review barrier rather than claiming malformed provider metadata. Metadata inspection and permission to use outputs must be distinct.

Proposed correction: pure metadata inspection with operation/request/world fencing and safe provenance; retain known conflicts/privacy/output/URL/budget guards; record prompt hash/echo status without requiring equality. Preserve a safe specific local assertion code in future stops, with no raw error messages, URLs or credentials. Regression fixtures use structurally equivalent synthetic metadata and placeholder URLs, not signed provider locators. No original ledger reset, reapproval or replay is part of that checkpoint.

## Output fields, not downloaded assets

- SPZ URL fields: **100k, 500k and full_res present**.
- Collider, panorama and thumbnail URL fields: **present**.
- Scale metadata: **present**, metric scale factor `2.268181800842285`, ground-plane offset `1.537428617477417`.
- Every inspected locator fails the frozen `assetUrl` policy. Only presence/type/hash and pass/fail were retained, so the exact rejected URL predicate/host is UNKNOWN. No allowlist expansion is justified by this evidence.
- No file bytes, actual file formats/sizes/content hashes, visual/prompt quality, collisions or rendering were inspected. URL hashes are not asset-content hashes. Panorama sharing/compatibility and chest/fal/courtyard results remain unverified or not attempted.

The existing room is still retrievable and is a candidate for reuse without regeneration. It cannot yet be declared usable or approved for the remaining experiment: the separate URL-policy barrier, actual asset inspection and required manual review remain unresolved. No authorized GET slots remain in this recovery. Any additional provider reads/downloads require new explicit scope.

## Preservation and verification

Original journal, witness, identity and anchor SHA-256 values match before/after recovery; no `billing`, `approval`, `result` or other record was appended to the stopped ledger. Raw responses lived only in memory. Sanitized [observations](recovery-001.json) contain structural metadata, numeric scale/cost, safe model/IDs, hashes and the exact failed assertion. No secrets or signed asset URLs are committed.

The original 91 deterministic tests and isolated typecheck/lint/build passed after the stopped live run; this evidence-only commit adds no runtime code. New correction tests will be reported separately. No production changes, deployment, EXPLORE acceptance, Phase 4 or renderer work. Stop for owner review after the separate correction proposal; no paid continuation is authorized.
