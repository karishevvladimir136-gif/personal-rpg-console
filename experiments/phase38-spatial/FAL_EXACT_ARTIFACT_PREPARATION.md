# Phase 3.8B exact fal artifact retrieval — OFFLINE PREPARATION ONLY

No live retrieval is authorized by this checkpoint. Separate owner authorization of the exact clean preparation SHA is required for initialization and retrieval. This preparation performs no provider/result/asset/DNS requests, reservations, generations or chest calls, reads no credentials, and installs no dependencies. The preparation commit is local only to preserve zero network activity; pushing it is a separate Git operation.

## Frozen identity and evidence

The canonicalized SHA-256 of `fal-exact-artifact.json` identifies `phase38b-fal-exact-artifact-1`; `freeze.json` additionally hashes the manifest, this document, all experiment sources/tests and existing frozen inputs. Run the offline `inspect` command to display that hash. These are separate from, and never replace, prior protocol/continuation/diagnostic identities.

| Binding | Exact value |
|---|---|
| Required accepted evidence commit | `745ee77f32ca61f795948f1292f7921d4fe406e7` |
| Diagnostic execution SHA | `adebc5e5d9c8e83c1ed6ace277582147b37d5901` |
| Diagnostic identity | `phase38b-fal-host-diagnostic-1` |
| Diagnostic hash | `8de9ecf328aa6459ea09d7686533cf1e34f86bf0b04978846c1d87f197fc3602` |
| Diagnostic JSON evidence SHA-256 | `882f1fd2bc7f9a917802680717566ee72d3a0a2a0ba4b87fc4250c014cc7f115` |
| Diagnostic terminal digest | `1746edd7614017df229651b6da3c6796b9df94a2556f093b4e1ad60723a37879` |
| Prior result retrieval evidence | `31d6431002b32060d4a1f365fc8b06b90f841a00` |
| Existing fal request | `01a0bc76-ae7f-7e02-960b-a207094622d2` |
| Requested model | `fal-ai/hunyuan_world/image-to-world` |
| Original protocol | `496360cc4171778eb153009ff4fe445d8ef75b08ab9aa0c4e884452e21c3bacb` |
| Original continuation | `9b3f84c9e74a3be531d322dc59b623400e3de15a2b09e7231cfeb730cc56a8e1` |

The manifest carries all preceding original STOPPED continuation, completed-status recovery, retrieval and diagnostic evidence/file/terminal bindings. Source verification is read-only and rejects any changed historical bytes. No prior ledger is reset, reopened for writing, relabeled or superseded.

## Exact future request budget

At most **two serialized HTTP GETs total**:

1. Exactly one authenticated GET to `https://queue.fal.run/fal-ai/hunyuan_world/requests/01a0bc76-ae7f-7e02-960b-a207094622d2`.
2. Only after every gate passes, at most one unauthenticated GET to the exact returned, fingerprint-matched asset URL.

Result timeout: **60 seconds**, body ceiling **2,097,152 bytes**. Asset timeout: **300 seconds including DNS/connect/streaming**, hard body ceiling **94,371,840 bytes (90 MiB)**. Whole retrieval/inspection deadline: **900 seconds**; ZIP inspection deadline **120 seconds** within it. At most one application-level asset DNS resolution (at most 32 returned addresses); every address must pass the existing conservative public-unicast filter. The connection pins one validated address with original-host SNI/certificate verification. No second DNS resolution or alternate-address retry. OS DNS internals are not measured as individual wire packets.

Zero polling, POSTs, retries, redirects followed, fallback, resubmission, export, cancellation, billing, World Labs, chest or next calls. No result refresh after URL expiry. Any changed signed URL or result body stops for owner review, even if provider rotation would otherwise be legitimate.

## Provenance-bound artifact capability

HTTP 200, exact result response URL and no redirect are mandatory. Hash raw result bytes **before JSON interpretation**; require:

`5dd84907167313f73db618cc1e1768bb658c59fafdb4dc2fb4119d7e2c1e78d6`

Apply the unchanged optional-field identity validator: supplied request/model/endpoint/provider/attempt/fallback fields must match; missing provider-internal model naming remains UNKNOWN. An unchanged result is necessary but not a claim of provider model identity or billing.

Only then parse `world_file`. Require all fingerprints and descriptor fields from the accepted diagnostic:

| Field | Frozen value |
|---|---|
| Scheme / hostname | HTTPS / `storage.googleapis.com` |
| Hostname SHA-256 | `df8ab3acb3324531fb5c42308bf6cc9cac1e499d1f3e2268243a1dd4072e58d4` |
| Complete URL SHA-256 | `28e7ae50a56a53c390eaf1da596976d58f4e1b4273d28a0255d9cd6ab293d771` |
| Pathname SHA-256 | `8437ed77f94ab487679dd8f75014ee3448af3eaf18d63c67037e7d11648d2723` |
| Query / fragment / URL credentials / explicit port | present / absent / absent / absent |
| Reported MIME / extension / size | `application/octet-stream` / ZIP / **85,481,294 bytes** |

The exact full descriptor fingerprint must match. A different GCS object, changed query/signature, path or hostname cannot qualify. No operator-provided URL/pin/hash/size override exists in the CLI. An in-memory opaque capability retains the exact provider URL privately; transport refuses fabricated/copied capabilities. Synthetic test seams are module-level only and are never CLI/environment options.

**No global/persistent allowlist change:** GCS is shared infrastructure. This isolated, one-use capability authorizes only one provenanced object after future approval; it does not establish a general trusted host. Existing experiment and production host policies remain unchanged, including rejection of arbitrary GCS URLs.

## Streaming and private evidence

The asset request has **empty headers**: no `FAL_KEY`, Authorization, cookies or result-request headers are forwarded. The signature stays only in memory. All non-200 responses, including redirects, stop without following Location.

Use exclusive private-file creation, streaming SHA-256 and bounded writes. `Content-Length`, if present, must equal **85,481,294**; the final streamed count must equal it even when Content-Length is absent. Compatible asset-response MIME, if supplied: application/octet-stream, application/zip or application/x-zip-compressed. Non-identity Content-Encoding is rejected. Overflow cancels transport and retains only the bounded partial bytes. No archive-wide memory buffering occurs during download.

Future files live only under ignored `experiments/phase38-spatial/private-fal-artifact/`. A new ignored sibling anchor, immutable identity, chained journal, witness and exclusive lock prevent duplicate/restarted attempts. A durable request entry precedes transport. Even a crash or partial attempt cannot restart. Partial bytes remain in `artifact.zip.partial`; successful complete bytes become `artifact.zip` via non-overwriting publication. Existing partial/completed files are never reused or overwritten. Partial failure records include safe reason, retained byte count and SHA-256, not transport exception strings or signed URLs. A process crash may leave partial bytes without a completion hash; it remains terminal for network replay, and requires later offline review.

No binaries, credentials, signed URLs, query values, arbitrary provider fields or raw result bodies enter Git. The local ledger records only safe HTTP metadata, immutable body/URL/path hashes, bounded descriptor, partial/full file hash/count, sanitized inventory and inspection results. Record the safe stop assertion even when the archive is unsupported or malformed.

## ZIP safety and structural inspection

Node built-ins only; no install, new dependency, external decoder, renderer, execution or extraction. Read a bounded central directory, validate **all paths/local headers/ranges before decompression**, then stream every entry through size checks, CRC-32 and SHA-256.

- At most **1,024 entries**, **4 MiB central directory**, **1,024 filename bytes**, **32 path components**.
- At most **256 MiB per entry**, **512 MiB aggregate uncompressed**, and **200:1 per-entry compression ratio**.
- ZIP stored and raw-deflate methods only; bounded classic single-disk ZIP. ZIP64, encryption, unsupported flags/compression/extras and unknown container layouts fail closed.
- Require complete EOCD/central/local/data-descriptor agreement, finite bounds, exact CRC/size, no overlapping entries, hidden gaps/trailers or corrupted streams.
- Reject absolute/drive/UNC paths, traversal, alternate separators, percent-encoded ambiguity, control/NUL characters, Windows devices/ADS, unsafe trailing dots/spaces, duplicate/case-conflicting paths and file/directory collisions. Reject symlinks, devices and special-file modes.
- No extraction is needed. Consequently no provider-supplied pathname is used for a filesystem write. Nothing in the archive is executed or rendered.
- Sanitized inventory contains only entry index, pathname hash, extension category, compressed/uncompressed size and SHA-256. No arbitrary filenames/comments or text contents are published.

The inventory answers whether DRC and other world-format candidates are present. DRC requires a plausible bounded DRACO header (v2.0–2.3, recognized geometry/method/flags), but **full Draco decoding remains unverified**. GLB files up to **32 MiB** may use the existing bounded GLB structural validator. glTF up to 32 MiB receives JSON/version inspection only; external buffers/resources are never fetched. OBJ/PLY/SPZ/splat and larger candidates are inventory observations, not full format validation. Unknown formats are explicitly unverified; malformed recognized DRC/GLB/glTF fails closed. CRC validity is not proof of geometry validity. No valid world candidates is reported explicitly, never converted into successful world usability.

The final state is always manual review: `RETRIEVED_AWAITING_OWNER_REVIEW` means safe byte retrieval/archive inspection, not accepted navigation, visual quality, production EXPLORE, confirmed DRC decode or automatic approval. `STOPPED_AWAITING_OWNER_REVIEW` retains safe reasons. Neither state releases chest/next or permits a second request.

## Accounting and preserved boundary

Unchanged: **$4.15 / $4.75 reserved**, **$2.528 known reported**, fal billing **UNKNOWN**, original **$0.35 fal reservation retained once**, **$0.60 chest allocation unreleased**. Historical source totals before future execution: 46 API requests, 8 downloads and 3 generations. No new reservation, refund or billing mutation exists in this runner. Chest remains unattempted. Main, production, root dependencies, schema, UI and original dirty documentation are untouched.

## Commands — future authorization only

Offline now: `node experiments/phase38-spatial/src/fal-artifact-cli.ts inspect` (no credentials/network/initialization).

After a future exact-SHA authorization, the lead first verifies clean HEAD/freeze/history, absence of the new root/anchor, and local credential presence without printing its value. CLI actions are `init`, `retrieve`, `audit`, with exactly these flags:

- `--live`
- `--approved-sha=<exact newly approved preparation SHA>`
- `--continuation-root=C:/Dev/personal-rpg-console-phase38-continuation`
- `--recovery-root=C:/Dev/personal-rpg-console-phase38-fal-recovery-preparation/experiments/phase38-spatial/private-fal-recovery`
- `--retrieval-root=C:/Dev/personal-rpg-console-phase38-fal-retrieval-preparation/experiments/phase38-spatial/private-fal-retrieval`
- `--diagnostic-root=C:/Dev/personal-rpg-console-phase38-fal-host-diagnostic-preparation/experiments/phase38-spatial/private-fal-host-diagnostic`

`init` is once-only and makes no requests/reservations. `retrieve` consumes the entire one-shot capability, including failures; never rerun. `audit` is local only. No alternate URL/action/pin/hash/limit flag exists. The owner never supplies secrets in chat. Future execution may use the already-saved local server key through transient process environment; never copy it into committed files.

After future execution: preserve originals, commit only sanitized evidence in a separate worktree, and STOP. Live retrieval is **not performed during this preparation**.
