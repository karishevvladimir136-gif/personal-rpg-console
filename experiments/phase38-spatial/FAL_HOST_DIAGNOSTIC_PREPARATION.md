# Phase 3.8B — offline one-read asset-host diagnostic

**OFFLINE PREPARATION ONLY. No provider request, artifact download, asset DNS lookup, generation, reservation, billing request or live diagnostic initialization occurred. No credentials were accessed/requested.** Existing Hunyuan fal-world remains queue-COMPLETED. Its prior result HTTP/optional identity checks passed, `world_file` exists, and the current blocker is the unknown hostname rejected by the frozen asset policy. No fal-world artifact has been downloaded. Chest remains unattempted.

## Diagnostic identity and scope

Identity: `phase38b-fal-host-diagnostic-1`.

Canonical manifest SHA-256: `8de9ecf328aa6459ea09d7686533cf1e34f86bf0b04978846c1d87f197fc3602`.

This observability-only capability has one fixed future request, after separate owner approval of the exact clean preparation SHA:

```text
GET https://queue.fal.run/fal-ai/hunyuan_world/requests/01a0bc76-ae7f-7e02-960b-a207094622d2
```

Provider/model: `fal` / `fal-ai/hunyuan_world/image-to-world`. No operator-supplied route, ID, model, method, expected hash or read-limit override. CLI actions are `inspect` (offline), `init` (local only), `audit` (local only) and `observe-host` (one separately authorized future GET). There is **no** polling, POST, artifact fetch/download/DNS, generation, next, retry, fallback, redirect following, cancellation, billing, World Labs or chest action. Existing unrelated historical runners are preserved but not exposed or invoked through this CLI.

A fresh ignored `private-fal-host-diagnostic/` directory and sibling anchor can be created once after live authorization, with no reserve/generation/request. The append-only hash-chain/witness, exclusive lock, request-intent-before-transport and duplicate/partial-journal protections reuse the existing experiment ledger. A crash or prior begin consumes the attempt; never reset/reinitialize to continue. Unit tests initialize only temporary synthetic directories; no live diagnostic directory exists.

## Exact immutable source and evidence bindings

[Diagnostic manifest](fal-host-diagnostic.json) freezes these values and carries the prior source chain through the unchanged [retrieval manifest](fal-retrieval.json). No previous finding or journal is rewritten.

| Binding | Exact value |
| --- | --- |
| `originalExecutionSHA` | `a8b3d503fd9da4b75e3dfdaf071ee8423550217c` |
| `originalProtocolHash` | `496360cc4171778eb153009ff4fe445d8ef75b08ab9aa0c4e884452e21c3bacb` |
| `continuationHash` | `9b3f84c9e74a3be531d322dc59b623400e3de15a2b09e7231cfeb730cc56a8e1` |
| `originalStopEvidenceCommit` | `28efcc7b50f6943022f93906770d2e8196e1e682` |
| `originalStopEvidenceSHA256` | `98a64a1e9e0018cf291bb58e60066558e44f6b20bd4cfb1265cbc4a6b6af9b5d` |
| `recoveryPreparationSHA` | `115dcf0c50a8b815e61d597970101898a7723bcf` |
| `recoveryIdentity` | `phase38b-fal-recovery-1` |
| `recoveryHash` | `0768f1a2a46f9aa6557d057d048e6ba896e5f4094da42a1f837f215080ff586a` |
| `completedStatusEvidenceCommit` | `3371a20427c33abed810ff0af83a031c943090ac` |
| `completedStatusEvidenceSHA256` | `0d665139d78999cba6e31422e041c81008383b6e84cea2997fb4e206dffde81e` |
| `completedBodySHA256` | `aa0b4ea61115e93b202b7630801e934dc3af3f6488d5035a6f49cd91a454ed98` |
| `recoveryTerminalDigest` | `412176ac819cfbc9e509c01dd9318cc432ea3f44beffb9d48900937fcef1a3f9` |
| `retrievalPreparationSHA` | `9160d9766559d38139a51516384461958399defc` |
| `retrievalIdentity` | `phase38b-fal-retrieval-1` |
| `retrievalHash` | `546d44c1bd66dcd23ade1995355cc4f8fc1e16425652e16beb501ddaca98ac9a` |
| `retrievalEvidenceCommit` | `31d6431002b32060d4a1f365fc8b06b90f841a00` |
| `retrievalEvidenceFile` | `results/fal-retrieval-001.json` |
| `retrievalEvidenceSHA256` | `0f3f2be536235f49b8c4ec69b1b46eb4b82f7fb1e3f54ae12fb1a2df2c72fed6` |
| `previousResultBodySHA256` | `5dd84907167313f73db618cc1e1768bb658c59fafdb4dc2fb4119d7e2c1e78d6` |
| `retrievalTerminalDigest` | `7d37b96225ad7cc0ee077f5f8772e0ddc9c32971b52541fc81b0dec272855e67` |

The previous result-retrieval files are bound byte-for-byte, relative to the existing `private-fal-retrieval` directory:

| File | SHA-256 |
| --- | --- |
| `journal.jsonl` | `ba680b1974f1e31e884dbe97c43b4734390d365a0f341e449a92dcccab2d6d4a` |
| `witness.jsonl` | `34b6f7f260f4995af7a961b8adeca8b66eff5694effef04db4757a90d8a5f0fc` |
| `identity.json` | `4b78cef0cb0e37dd587d8b06e3f65993fa10933887cf87d9733f63986494358a` |
| `../private-fal-retrieval.anchor` | `4b78cef0cb0e37dd587d8b06e3f65993fa10933887cf87d9733f63986494358a` |

The existing retrieval source verifier checks the original STOPPED continuation and completed-status recovery hashes, identities, terminal digests, request/accounting and committed safe observation. The new verifier additionally checks exact retrieval evidence bytes, HTTP 200 / unchanged response URL / no redirect / identity record, result body hash, finding B / `asset_host_not_allowed`, zero prior downloads, and the previous retrieval chain/witness/identity/terminal. CLI release verifies Git ancestry from the finding-B evidence commit and its exact committed evidence hash. Source checks are read-only and repeated before any future diagnostic request.

Future source roots:

- `C:\Dev\personal-rpg-console-phase38-continuation`
- `C:\Dev\personal-rpg-console-phase38-fal-recovery-preparation\experiments\phase38-spatial\private-fal-recovery`
- `C:\Dev\personal-rpg-console-phase38-fal-retrieval-preparation\experiments\phase38-spatial\private-fal-retrieval`

## Response and unchanged-body gates

Future maximum: **one HTTPS result GET**, **zero other HTTP requests**, **zero asset DNS requests**. Result body at most **2 MiB**, request deadline at most **60 seconds**, overall operation bound **15 minutes**. Manual redirects; HTTP 200 and the exact response URL are mandatory. On non-200/redirect/URL mismatch, retain only existing approved safe HTTP metadata and stop without interpreting the body. No redirect is followed.

The returned bytes are hashed before JSON parsing or any result/descriptor interpretation. SHA-256 must equal:

`5dd84907167313f73db618cc1e1768bb658c59fafdb4dc2fb4119d7e2c1e78d6`

Any difference, including signed-URL rotation or a malformed changed body, records the new body hash plus `matchesPrevious=false`, stops as `changed_provider_result`, and produces **no identity/descriptor interpretation**. There is no tolerance, canonical-JSON comparison or replacement-hash override.

If unchanged, reuse the exact existing optional result identity checks (request/model/endpoint/provider, errors, attempts and fallback where supplied). Missing/null actual model remains UNKNOWN, never inferred from the route. Then inspect only the required `world_file` descriptor in memory. The raw body is not persisted.

## Exact retained descriptor metadata

Metadata is durably appended **before** calling the unchanged asset URL/host policy for classification. No download authority or retained downloadable asset object is created.

| Field | Retention rule |
| --- | --- |
| `urlSHA256` | Hash of the returned URL string; never the URL itself |
| `scheme` | `https`, `http`, `other`, or null if unavailable |
| `hostname`, `hostnameSHA256` | Bounded normalized hostname and hash; ASCII hostname/IP syntax only, maximum 253 characters |
| `pathname`, `pathSHA256` | At most 160 characters of a narrow static path vocabulary (generic files/outputs/synthetic plus world/model/artifact/output and a known extension); every other pathname is hash-only |
| `queryPresent`, `fragmentPresent` | Booleans only; no contents |
| `credentialsPresent` | Boolean only; never username/password |
| `explicitPortPresent` | Boolean, including an explicitly written default `:443`; no normalization bypass |
| `contentType` | Simple lowercase MIME string, bounded to 96 characters; no parameters or arbitrary text |
| `fileExtension` | Only glb/gltf/drc/spz/zip/gz/ply/obj/splat/bin classification; never a full filename |
| `fileSize` | Provider-supplied non-negative integer at most 268,435,456; otherwise null |

Oversized/malformed strings yield bounded hash/null/flag metadata, never parser error text. HTTPS, no credentials, no explicit port/fragment, safe canonical URL/path and non-local/non-IP host checks remain in force for classification. There is no asset fetch or DNS lookup to test a host.

After recording metadata, classify and **stop regardless**:

- `currently_allowed_host`: the existing exact asset policy matches; still no download authorization.
- `new_same_provider_looking_host_requires_review`: otherwise-safe hostname falls under fal.media/fal.run but is absent from the exact current allowlist. This is a lexical review hint, **not evidence of provider ownership, public DNS or permission to fetch**.
- `clearly_unapproved_or_unsafe_host`: unrelated/unapproved or malformed/unsafe URL; stop without further interpretation or requests.

No allowlist, asset transport or prior validator change is included. Any future policy change requires a separately reviewed checkpoint with concrete host evidence and regression coverage. Do not infer DRC or structural usability from metadata/extension alone.

## Accounting and verification

Unchanged: **$4.15 / $4.75 reserved**, **$2.528 known billing**, fal charge **UNKNOWN**, existing **$0.35 reservation counted once**, chest **$0.60 unreleased**. No refunds or zero-charge assumptions. Historical totals before any future diagnostic remain three generation submissions, 45 API requests and eight downloads. No artifact download is possible through this capability.

Tests reconstruct the exact prior safe journal from committed sanitized evidence; all result/HTTP transports and writable history fixtures are synthetic mocks. Pipeline mocks represent a hash-matched synthetic body; separate real-reader tests prove the SHA-256 is calculated from response bytes and changed malformed/valid bodies stop before interpretation. Unit-only verifier/reader injection has no CLI flag. No real response body or secret is copied into fixtures.

Run the full deterministic experiment suite, typecheck, zero-warning lint and isolated build. Actual final results are recorded in DEV_STATUS. Production tests/build are not required because production remains unchanged.

**STOP after preparation for owner review.** No live initialization or `observe-host` until explicit authorization of the exact new SHA. No artifact retrieval, host-policy repair, chest, main merge, roadmap changes, renderer/EXPLORE implementation or deployment. No owner credential setup is needed for this offline task.
