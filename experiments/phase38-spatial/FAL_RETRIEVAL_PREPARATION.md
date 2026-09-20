# Phase 3.8B — offline fal-world retrieval preparation

**OFFLINE ONLY. No provider, DNS, result, asset, generation, export or billing request was made during this preparation. No credentials were accessed or requested.** The fal-world generation is historically confirmed COMPLETED at queue level; no result or artifact has yet been retrieved. Chest remains unattempted. This preparation does not grant live authorization.

## Scope and identity

Distinct retrieval identity: `phase38b-fal-retrieval-1`.

Canonical manifest SHA-256: `546d44c1bd66dcd23ade1995355cc4f8fc1e16425652e16beb501ddaca98ac9a`.

The [frozen retrieval manifest](fal-retrieval.json) binds one existing request: `01a0bc76-ae7f-7e02-960b-a207094622d2`, provider `fal`, model `fal-ai/hunyuan_world/image-to-world`. No operator override for ID, model, method, URL, limits or accounting exists. The standalone CLI accepts `inspect` (offline), `init`, `audit` (local only) and `retrieve`. It exposes no status poll, generation, next, cancellation, resubmission, fallback, World Labs or chest action. Existing historical runners are unchanged; they are not invoked by this capability.

After separate owner approval of the exact clean preparation SHA, initialization may create `private-fal-retrieval/` plus its sibling anchor **once**, without any provider request or reservation. No live retrieval journal or anchor has been initialized during preparation. Both paths are ignored. Mock tests initialize only temporary synthetic fixtures.

## Exact immutable source bindings

| Binding | Exact value |
| --- | --- |
| Original execution SHA | `a8b3d503fd9da4b75e3dfdaf071ee8423550217c` |
| Original protocol hash | `496360cc4171778eb153009ff4fe445d8ef75b08ab9aa0c4e884452e21c3bacb` |
| Continuation hash | `9b3f84c9e74a3be531d322dc59b623400e3de15a2b09e7231cfeb730cc56a8e1` |
| Original fal stop evidence commit | `28efcc7b50f6943022f93906770d2e8196e1e682` |
| Original fal stop evidence SHA-256 | `98a64a1e9e0018cf291bb58e60066558e44f6b20bd4cfb1265cbc4a6b6af9b5d` |
| Recovery preparation SHA | `115dcf0c50a8b815e61d597970101898a7723bcf` |
| Recovery identity | `phase38b-fal-recovery-1` |
| Recovery hash | `0768f1a2a46f9aa6557d057d048e6ba896e5f4094da42a1f837f215080ff586a` |
| Completed-status evidence commit | `3371a20427c33abed810ff0af83a031c943090ac` |
| Completed-status JSON SHA-256 | `0d665139d78999cba6e31422e041c81008383b6e84cea2997fb4e206dffde81e` |
| COMPLETED observation body SHA-256 | `aa0b4ea61115e93b202b7630801e934dc3af3f6488d5035a6f49cd91a454ed98` |
| Original stopped terminal digest | `3121be8dbd3b2aeb12e095a05764a84580bb1b944d27539ebc6ec2d4e8f65f36` |
| Recovery terminal digest | `412176ac819cfbc9e509c01dd9318cc432ea3f44beffb9d48900937fcef1a3f9` |

Prior recovery files, relative to the existing `private-fal-recovery` directory:

| File | SHA-256 |
| --- | --- |
| `journal.jsonl` | `f017d56724bc75ee6b38522a4b439c890f9d74868f2b47fd0d0f72d6e7e701e6` |
| `witness.jsonl` | `27c26e496201a6a1880bf1bdb9fb57725ecc6a250cff753704714318cf837b81` |
| `identity.json` | `aa1914b8b404f825ecf9588f2bd152297be51262136650061aee96854f9bce2d` |
| `../private-fal-recovery.anchor` | `aa1914b8b404f825ecf9588f2bd152297be51262136650061aee96854f9bce2d` |

Original continuation files, relative to `C:\Dev\personal-rpg-console-phase38-continuation`:

| File | SHA-256 |
| --- | --- |
| `experiments/phase38-spatial/private-continuation/journal.jsonl` | `cba079b1e3f6e04810ab22fe3d4d335ae99f1c5cdabd7d35e9ad900e44a98508` |
| `experiments/phase38-spatial/private-continuation/witness.jsonl` | `4310e9d475117a2a5d7558f93bb83c7c4d6dd5713d20b2c14eee31502754b758` |
| `experiments/phase38-spatial/private-continuation/identity.json` | `00797a8cbbde52aed9028199e9b5a0809ecf4c0fe31d8cc1258e8cf193f11fc0` |
| `experiments/phase38-spatial/private-continuation.anchor` | `00797a8cbbde52aed9028199e9b5a0809ecf4c0fe31d8cc1258e8cf193f11fc0` |
| `experiments/phase38-spatial/continuation.json` | `debb7c56ea75d4d6efd5b78d2b9d0544b94e6e0913f4f53408a66b49257ee31b` |
| `experiments/phase38-spatial/protocol.json` | `48e0c66207d872ba91239de4a6f23f12eae1f9309bf57d5b1e7c2b4ad5b131bd` |
| `experiments/phase38-spatial/freeze.json` | `ba7a230ed58d609f39466d0a8ae1eb98f2e7667b520a6c39fbf14778c5c8909e` |

The source verifier checks byte hashes, chain/witness integrity, original STOPPED terminal/accounting, accepted recovery identity/terminal and exact completed-status observation. It only reads prior directories; no old ledger is opened for writing. CLI release additionally requires the completed-status commit to be an ancestor and its committed JSON to match the pinned hash. Every retrieval request rechecks source history. Existing safe evidence is retained unchanged, not relabeled.

## Future bounded live scope — NOT AUTHORIZED YET

Exactly one permitted result route:

```text
https://queue.fal.run/fal-ai/hunyuan_world/requests/01a0bc76-ae7f-7e02-960b-a207094622d2
```

- At most **one result GET**, then only on validated identity/output **one exact retained artifact URL download**; total maximum **two HTTP requests**. No status request.
- **Zero** POSTs, submissions, automatic retries, fallback, extra polls, exports, cancellations, World Labs, billing endpoints, next actions or chest calls.
- Result HTTP 200 and exact response URL are required. Redirects are manual, recorded safely and stopped; no redirect target is followed. Only safe HTTP metadata is retained for rejected transport responses. Raw provider bodies and arbitrary headers are not persisted.
- Result JSON maximum **2 MiB**; artifact maximum **256 MiB**; each request at most **60 seconds**, overall operation at most **15 minutes**. One bounded DNS lookup for the artifact's exact allowed host, one public destination connection, no second resolution or alternate-address retry. DNS is not a generation or extra HTTP request.
- Requests are serialized. Result request intent is journaled durably before transport; asset intent requires the preceding accepted result and identical URL hash. No resume/retry of a partial attempt. A crash leaves the one-shot identity consumed; a stale lock, partial journal/witness, orphan binary or prior begin fails closed. Do not delete/reset any ledger to proceed.
- Explicit initialization and retrieval require `--live`, the exact `--approved-sha`, a clean checkout, and the two existing source roots. Those flags record the future owner's authorization; they are not supplied or used for live execution in this preparation.

Future source roots are the original continuation checkout above and `C:\Dev\personal-rpg-console-phase38-fal-recovery-preparation\experiments\phase38-spatial\private-fal-recovery`. Credentials remain server-only in the local ignored secret convention; do not put secrets into command arguments, chat or Git. No new key setup is needed in this offline task.

## Identity, artifact and findings

Optional provider-reported request/model/endpoint/provider identity must match exactly where supplied; extra model/provider attempts, fallback and provider errors are rejected. Missing/null actual-model naming remains UNKNOWN. No actual model is inferred from the route. The bounded `world_file` parser and the existing fal asset-host allowlist/provenance, public DNS, HTTPS, no-credentials/no-redirect protections are reused unchanged. No other output field or arbitrary URL can grant download authority.

The result records only approved safe identity/hash/output metadata. The artifact record durably retains role, byte count, SHA-256, exact URL hash, result provenance and signature-detected format **before structural inspection**. The downloaded binary remains ignored/local; it is not a committable result. No signed URLs, credentials, headers or raw provider bodies are written into the journal. Artifacts are never executed or extracted.

| Finding | Meaning |
| --- | --- |
| `A_NO_VALIDATED_RESULT` | Transport, body or identity did not qualify a result. This does not assert that no provider output exists. |
| `B_INVALID_OUTPUT_OR_ASSET_URL` | Result identity qualified, but `world_file`/asset URL failed validation; no download. |
| `ASSET_RETRIEVAL_FAILED` | Validated result existed, but its single download failed transport/DNS/size/deadline fencing. |
| `C_UNSUPPORTED_ARTIFACT` | Downloaded bytes retained; current structural inspector cannot support the format. **Not a provider-generation failure.** |
| `STRUCTURAL_INVALID_OR_UNVERIFIED` | Recognized structure failed validation; bytes/hash retained, usability unverified. |
| `D_STRUCTURAL_PASS` | Existing bounded inspector passed. Navigation, visual quality and production usability remain unverified. |

Binary glTF/GLB uses the existing GLB structural inspector; accepted SPZ representations use the existing SPZ inspector and decompression limits. Draco magic, ZIP, gzip and JSON signatures are observed conservatively, not decoded into geometry. Standalone JSON glTF is retained as an unsupported representation: the current safe inspector accepts binary GLB, and no external glTF buffers/images are fetched. Unsupported DRC/archive/other geometry retains observations and stops for review; no large decoder/viewer is added. `export_drc=true` was requested historically but does not prove DRC was returned. `draco_header` is a header observation only, not full Draco validation. No artifact or format observation exists yet for this real request.

## Accounting and release boundary

Unchanged: **$4.15 / $4.75 cumulative reservation**, **$2.528 known reported billing**, fal charge **UNKNOWN**, existing **$0.35 fal reservation counted once**, **$0.60 unreleased chest allocation**. No new reserve, refund or zero-charge assumption. Historical submissions remain **three**, historical API requests **44** (including the one completed-status observation), historical downloads **eight**. The one prior status observation is not scheduled again.

Always STOP for owner review after retrieval, including structural success. No approval/next release is created. This is not production EXPLORE acceptance. No runtime, schema, UI, root dependencies, main or `chatgpt/poi-2d-roadmap` change.

## Deterministic verification

The new tests use only synthetic bodies, in-memory mock transports and temporary journals; exact safe completed-history bytes are reconstructed from committed sanitized evidence. Unit-only source-verifier injection has no CLI flag and does not relax live source checks. Existing hostile URL/DNS/redirect/SSRF tests remain part of the full suite. See DEV_STATUS for actual final results.

```text
node --test experiments/phase38-spatial/tests/*.test.mjs
node node_modules/typescript/bin/tsc -p experiments/phase38-spatial/tsconfig.json --noEmit
node node_modules/eslint/bin/eslint.js experiments/phase38-spatial --max-warnings 0
node node_modules/typescript/bin/tsc -p experiments/phase38-spatial/tsconfig.json
```

No further live action is authorized until the owner approves the exact new preparation SHA.
