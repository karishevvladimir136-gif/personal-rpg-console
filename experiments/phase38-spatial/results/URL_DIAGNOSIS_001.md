# Phase 3.8B — one-read asset URL diagnosis

Owner accepted the metadata correction at `32b2effdc8aeae525fe28dda3f09c73b04773cb3`; recovery evidence remains `98eb76618503dd2382ef97aaabfcb1377cab26e1`. On September 19, 2026 (Pacific), the newly authorized single authenticated Get World returned HTTP 200 for existing world `82a0e059-50a4-41a4-8565-5e516ffadc0e`. Response bytes/hash exactly match the original and prior recovery response. The accepted metadata validator passes identity/private/request fencing; actual reported model is `marble-1.1`.

## Sanitized structural observations

All four required URLs use HTTPS and exact hostname `cdn.marble.worldlabs.ai`. None has an explicit port, user/password, query, fragment or percent-encoded path. Full URLs and literal asset identifiers/filenames were not retained. Extensions below describe URL paths, not verified downloaded file formats.

| Frozen role | Redacted normalized path shape | Original exact rejection |
| --- | --- | --- |
| SPZ 100k | /{uuid}/{asset}.spz | asset_host_not_allowed |
| Collider | /{uuid}/{asset}.glb | asset_host_not_allowed |
| Panorama | /{uuid}/{segment}/{asset}.png | asset_host_not_allowed |
| Thumbnail | /{uuid}/{segment}/{asset}.webp | asset_host_not_allowed |

The failed assertion is `protocol.assetHosts[provider]?.includes(u.hostname)`. The original list contained only `wlt-ai-cdn.art`. No other original URL assertion fails for these observed structures. [Get World](https://docs.worldlabs.ai/api/reference/worlds/get) documents generated asset URL fields, but does not guarantee that hostname as the exclusive CDN. [Quickstart](https://docs.worldlabs.ai/api) likewise does not establish an exclusive hostname. Rechecked current official pages on September 19; the authenticated response establishes this observed host, not a universal provider CDN promise.

## Proposed minimum policy and boundaries

Use the observed exact `cdn.marble.worldlabs.ai` in addition to the existing exact host as a bounded experiment allowlist, not a wildcard or universal provider guarantee. Require lineage from the validated private, identity-fenced World Labs response, unchanged exact retained URLs, HTTPS without credentials/ports/fragments, safe paths, no redirects and public-only DNS destinations pinned to the connection. A future unrecognized host stops for review. A separate correction commit will supply offline regression tests; this evidence commit changes no executable files.

Exactly **1 authenticated GET**, **0 generations**, **0 downloads**, **0 exports**, **0 fal calls**, **0 retries**. No DNS lookups or HTTP requests to asset hosts were made. Original journal/witness/identity/anchor hashes are unchanged; no room regeneration or remaining-job continuation. The original charge/reservation stays $1.264/$1.30. No additional charge is inferred from a metadata response.

The existing world remains a reuse candidate. URL rejection is a local hostname assumption, not evidence of missing assets. Public DNS reachability, actual file format/support, visual usability, panorama sharing and manual approval are still unverified. In particular, the thumbnail path ends in .webp while the frozen image parser supports PNG/JPEG only; bytes were not inspected, so do not silently claim image compatibility or expand format support in this URL-only task.
