# Phase 3.8B — proposed asset URL correction

September 19, 2026 (Pacific). Offline experiment correction only, based on owner-accepted metadata checkpoint `32b2effdc8aeae525fe28dda3f09c73b04773cb3`. The one-read diagnostic evidence was separately committed and pushed as **`dec27b8f566bea3412ba6afb80d3e17379c1fcd1`**. Prior recovery evidence and all stopped-run records are unchanged.

## Finding and policy rationale

The four required URLs from the authenticated private world all use **cdn.marble.worldlabs.ai**, HTTPS, no explicit port, no credentials, no query/fragment and simple unencoded paths. Original `asset_host_not_allowed` was solely the stale single-host allowlist. See [sanitized observations](results/url-diagnosis-001.json) and [diagnostic report](results/URL_DIAGNOSIS_001.md).

[Get World](https://docs.worldlabs.ai/api/reference/worlds/get) promises generated asset URL fields, not an exclusive CDN hostname. The exact new hostname was observed in the authenticated, identity-validated response and is beneath the provider's worldlabs.ai domain. Retain a small experiment-specific set: the historical wlt-ai-cdn.art plus observed cdn.marble.worldlabs.ai. No wildcard, arbitrary new host, third-party proxy, guessed universal CDN contract or automatic host learning. Future unrecognized hosts stop for review. This set is defense in depth; provenance and network-destination checks are mandatory too.

## Minimum implementation

- `assetUrl` adds only that exact World Labs hostname and rejects embedded credentials (including empty user delimiters), explicit ports (including :443), fragments, controls/whitespace/backslashes, traversal, nested/unsafe/malformed encodings and parser-normalized ambiguity. Query strings are kept exactly when present; they are not logged or rewritten. Fal hosts remain unchanged.
- Successful private, identity-fenced world output validation retains immutable asset descriptors in a module-private WeakMap. The exact returned URL is the only permitted download target. Forged descriptors, JSON clones, modified query/path and caller-supplied URL strings have no authority. Fal result descriptors receive the equivalent binding after their existing result validation; no fal request/model behavior is expanded.
- The runner passes those retained descriptors. The general JSON HTTP transport cannot fetch CDN URLs as a bypass. Download requests must be GET without body or credentials.
- The asset transport resolves the exact allowed hostname once, within the existing per-request deadline; rejects empty/mixed/private/loopback/link-local/mapped/transitional/reserved DNS destinations; then pins a single approved address in Node's custom connection lookup. TLS still verifies the original hostname. Agent reuse and automatic alternate-family/address attempts are disabled. No redirect following, retries or fallback. Existing byte limits and remaining deadline apply to streaming. Safe assertion codes exclude arbitrary provider/DNS/socket error messages.
- Node built-ins only; no root or experiment dependencies added. [Node connection documentation](https://nodejs.org/docs/latest-v24.x/api/net.html#socketconnectoptions-connectlistener) supports custom lookup/family control; [HTTPS](https://nodejs.org/docs/latest-v24.x/api/https.html#httpsrequestoptions-callback) preserves hostname certificate verification. Tests inject DNS and connections; no network is required.

The original `protocol.json` and its canonical SHA-256 **496360cc4171778eb153009ff4fe445d8ef75b08ab9aa0c4e884452e21c3bacb** remain byte-identical. The effective URL-policy extension is deliberately in this separately reviewed harness source/checkpoint, pinned by the updated freeze manifest. Do not mistake unchanged workload/protocol hash for unchanged harness authorization. Original execution/checkpoint stays untouched. Prompts/seeds/models/prices/budgets/counts/polling/billing/review/ledger/format validators are unchanged.

## Actual verification

**223 deterministic tests passed (141 existing + 82 new), zero failures/skips.** Experiment TypeScript typecheck, ESLint with zero warnings, and isolated emit/build passed. New cases cover the four observed structural URL shapes with substituted synthetic identifiers, hostile URL normalization/SSRF cases, private IPv4/IPv6 and DNS-rebinding protection, exact source URL binding, headers, TLS identity, redirect/error/timeout/size limits, no retries, and unchanged WebP rejection. Existing stop-before-next, reservation/ledger/secret/no-production tests remain green. Full production suite/build was not rerun for isolated experiment-only changes.

Live diagnostic: exactly **1 authenticated metadata GET; 0 generations, 0 asset downloads, 0 exports, 0 fal calls, 0 retries**. No asset hostname DNS/probe was performed. The accepted metadata checks ran over the actual body during that one GET. The new URL tests use sanitized shape-equivalent synthetic URLs: full original URLs/bodies were not retained, and the new transport has not been exercised live.

## Reuse and stopping boundary

The existing world is still retrievable and its observed URL structures are compatible with the proposed policy, without regeneration. That does **not** clear asset capability/visual acceptance: public DNS/reachability, actual bytes and format, scale/collider usability, panorama sharing and manual review remain unverified. The thumbnail URL ends in **.webp**, but the frozen binary image inspector accepts PNG/JPEG only. Treat this as a disclosed possible next format barrier; no WebP decoder or parser loosening is included.

No resume, replacement ledger, stop removal, room regeneration or remaining-job command is introduced/executed. Original $1.264 billing and full $1.30 reservation remain intact. The one-GET authorization is exhausted. **Stop for owner review; no live continuation.** Production main/runtime/UI/schema/dependencies and original uncommitted documentation remain untouched.
