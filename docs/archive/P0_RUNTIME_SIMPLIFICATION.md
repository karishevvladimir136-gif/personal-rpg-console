# P0 runtime simplification — original reviewed candidate

**Final-gate follow-up:** The owner-reviewed `56d2e3b0b41602758d87fbbf46dc2fc267e8fb80` record below is preserved as history. The operation-specific private/public boundary, amended disposable Migration 51 and final live contract evidence are documented in [P0_RUNTIME_PRIVACY_LIVE_GATE.md](P0_RUNTIME_PRIVACY_LIVE_GATE.md). That follow-up supersedes the original unified-private authoring limitation and proposed benchmark below. Main and owner DB are not activated by either report.

Base: `5fb142b7dad6406473e3d3ae77e49cc5b2d3320d`. Isolated branch: `codex/astra-simplified-play-runtime`. Owner database remains Migration **50**. This candidate is not activated, merged or deployed.

## Decision and call graph

**Fail open on fiction; fail closed on durable state.** Free text remains the DM's input. No verb-specific mechanics were added.

Previous ordinary path:

`durable begin → claim → foreground Memory summaries (up to three) → Astra High planner → tools/continuations → final checkpoint → public-safe context → Astra Medium narrator → checkpoint → atomic commit`

New explicitly pinned ordinary path:

`durable input + unified contract pin → claim → deterministic bounded Memory selection → Astra High unified response → validate state and public fiction → checkpoint final + narration together → atomic commit → bounded background Memory maintenance`

Tool-bearing turns use the same Astra DM and server tools, then receive narration in the final continuation. There is no dedicated rewrite request for unified turns. Existing unpinned/historical operations retain their original two-stage semantics; their public-safe narrator remains Medium. Production service tier remains default. No model/provider fallback was introduced.

The preserved failed owner mill operation is not repaired or converted by this candidate. Its eventual recovery/abandonment requires the owner's separate decision; only a new operation receives the unified pin after approved activation.

## Authority and optional consequences

Owner/RLS, campaign isolation, exact revisions, timeline fences, operation identity, deterministic rolls/combat, HP/resource/item ownership and quantities, progression, frozen historical World and SQL reconstruction/commit guards remain authoritative. Migrations 1–50 are unchanged. No raw SQL or general state-writing capability was added.

The existing ordered-effect planner already validates compatible effects independently against a server-owned shadow and records rejected optional positions. The unified publication adapter reuses it. Public narration is a bounded list of text fragments with dependencies on original effect positions; fragments asserting rejected consequences are removed. Independent dialogue survives. A final with no surviving safe fiction becomes a technical retry rather than invented replacement prose. Foreign identities and invalid base-state writes still fail closed. Accepted final, narration, effects and private patches commit together through the existing TurnStore.

The model remains responsible for correctly identifying prose dependencies. This contract does not provide a general semantic proof that arbitrary untagged prose describes only accepted consequences. Tests distinguish independent NPC dialogue from effect-dependent reward claims. Unified model-authored `outcomes` must be empty: only the server may add accepted mechanical/effect outcomes to validated Memory facts. Ordinary fiction remains in the committed Scene; it cannot bypass rejected effects through a second public-fact field. Legacy outcome behavior is unchanged.

## Context and Memory

Unified play separates a **64,000-byte preferred packet target** from the validated model capability's outer input bound and safety/output reserves. Passing the target causes optional selection/compaction, not a correctness failure. Current state, literal input, current Canon and owner corrections retain priority. Optional Craft, retrieval tails and redundant recent prose can be removed. Identity-backed exchange/Scene duplication is compacted; long histories remain bounded by existing recent windows and retrieval limits.

Foreground work reads, retrieves and selects. It does not invoke a summary model for unified turns. Stale optional summaries/checkpoints and derived-index pressure can be omitted while current authority and authorized continuity remain present. Campaign/timeline/source revision failures remain hard conflicts. After successful commit, the existing fenced Memory queue can process up to three jobs while the player reads; no second memory store or daemon was added. Exact committed replay schedules no maintenance, and a background lookup/scheduling failure cannot change the successful response. A process restart can interrupt maintenance; persisted jobs and subsequent commits provide the existing recovery lifecycle.

## Privacy and diagnostics

Unified authoring receives authorized private DM context. Only validated narration/visual strings and the existing public turn projection are published. Raw source, private patches, Character Models, final proposals and receipts remain server-only. Private values are checked before public commitment, including nested Character Model/generic buckets. Raw receipt/check IDs are rejected in prose, and unified continuation packets omit private raw dice/DC metadata and receipt identities. Public dice UI keeps the existing authoritative Check projection.

The private-disclosure check detects recorded values and internal identifiers; it is not a semantic/paraphrase secrecy guarantee. This differs from the historical separate public-safe narrator boundary and is a material part of owner review for the requested unified contract.

Safe JSON diagnostics retain operation/stage, final request bytes, category sizes, model/reasoning/tier, usage, latency, response status, abort/cause codes and request IDs where available. They never log prompts, assistant output, credentials or hidden prose. Narration parsing now has bounded reason codes. Successful usage includes reasoning/cached tokens for Astra only, preserving strict legacy World/Lab receipt shapes.

## Transport and player errors

One automatic retry remains available for an eligible fast pre-response connection failure with unchanged authority. Long waits and timeout-class failures do not immediately consume another full 60-second attempt. Received responses and semantic validation errors are not automatically retried for quality. Existing operation/receipt replay remains exact-once.

Internal `context` and `validation` failures no longer imply the player's understandable action was insufficient. Normal narration can ask a genuine question in fiction; infrastructure failures use a compact technical message. Unified capacity and narrowly identified provider JSON/public-fragment format failures permit manual Try again. Scope, privacy, fabricated outcome and hard-state validation remain nonretryable; format failures do not trigger automatic semantic retries.

## Migration 51 — disposable only

`202610140051_astra_unified_contract.sql` adds nullable private `turns.astra_response_contract`, accepting only `unified-v1`. It pins the contract in the same transaction as literal begin, returns it only through private claim/lookup, and rejects attempts to change a pinned contract. Missing old-save values naturally mean legacy two-stage semantics. It reuses the same runtime identity and checkpoint/commit authority; this is not a second runtime/store.

The new service-only SECURITY DEFINER wrapper delegates internally. Direct service_role/PUBLIC/anon/authenticated execution of its renamed predecessor is revoked. No unrelated function/permission authority is altered. Populated 50→51 tests preserve all **79** normalized table fingerprints, all unrelated function definitions/ACLs, immutable old manifests, and old/new pending save/retry/load behavior.

Owner activation requires separate review, a fresh owner backup, Migration 51 authorization/application and main integration. None occurred in this sprint.

Exact migration SHA-256: `FCC923F8B208365510FD79B99F989DD5BCCE0A638DFEBF26AEAA313D795C967D`.

## Forensic baseline

See [the retained owner-safe evidence](P0_LIVE_PLAYABILITY_FORENSIC.md). Latest mill operation `5267cd71-79c0-44e1-b24a-2d7a7c3eddea` failed at narration parsing, not context preparation. The exact rejected narrator field was not retained. Current offline planner reassembly fits at **63,537 bytes** with only **463 bytes** headroom; required-only is **46,557**. Four observed foreground summary calls total **45.793 seconds**. Logs contain 60-second warning gaps but no native/cause metadata sufficient to prove the historical interruption causes. No inference replaces missing evidence.

Offline reconstruction of the same captured source through the unified production modules selects **63,798 bytes**, retaining literal input and current state, under the **993,404-byte** outer bound (**929,606 bytes** headroom). It performs one captured Memory read, two captured retrievals and zero summaries/enqueues/claims. This is a current offline reconstruction, not a replay of the owner's operation or a measured live request.

## Verification

Frozen implementation: **218/218 disjoint focused checks pass** (174 integrated runtime/provider/context/Memory/save/UI checks, 25 real production-module acceptance checks, six startup-admission checks and 13 generic provider/runtime checks). Final complete repository suite: **2,336/2,337**, **zero failures**, one existing explicit-opt-in live disposable Supabase Auth/PostgREST skip; duration **503.712 seconds**, three test workers. TypeScript, repository ESLint with zero warnings and production webpack build pass on the final source. No paid provider benchmark has run.

The first complete-suite attempt was stopped after two startup test-loader failures: its isolated module map did not include the new background helper and Next `after`. The test loader now uses the real helper and a bounded scheduling stub; all six startup-admission tests pass. The next run exposed a real diagnostic regression: invalid raw reasoning configuration could enter the new metadata field, and the old observer-key assertion omitted the five approved fields. Reasoning now stays null until model configuration is validated; the 13 generic runtime tests pass with the new safe metadata allowlist. Earlier logs remain available. A fresh complete run after the final production fix passes with the totals above; no earlier failing result is represented as a pass.

The full migration chain runs on disposable PGlite, including populated **50 → 51** compatibility/ACL checks. Existing saved pending turns remain legacy, new unified pins survive retry/save/load, and all 79 normalized table fingerprints plus unrelated function definitions/ACLs are preserved. No owner migration was applied.

All **seven** specified free-form actions commit through actual production modules with one fake primary response, no dedicated narrator and no foreground summaries. Optional effect rejection preserves independent fiction. Foreign scope, invalid HP/resource changes, stale revisions, forged Memory outcomes and private disclosure remain atomic no-ops. Manual formatting/capacity retry and fast-only automatic transport retry have separate regression coverage.

### 200-turn production-module soak

| Result | Verified value |
| --- | --- |
| Committed turns | 200 |
| Fake primary DM requests | 300; every no-tool turn exactly one |
| Durable tool receipts | 100 |
| Foreground summary calls | 0 |
| Background fake summaries | 45 |
| Provider-bound bytes | 41,331–64,535, including framing reserve |
| First/final 60-request maximum | 62,865 / 64,535 bytes |
| Final hero | HP 10, Focus 20 |
| Final supplies / NPC HP | 10 / 40 |
| Final clock / completed rests | 9,800 minutes / 20 |
| Final Location | Original home Location |

Real derived-index overflow was deliberately exercised before background maintenance resumed. Old promise evidence remained retrievable beyond 100 turns. Context fell repeatedly instead of appending all history. Exact committed replay, final save/load and frozen World Foundation/Event equality pass. The fake provider controls fictional outputs; this tests Console authority and context behavior, not Astra's creative quality or semantic dependency tagging.

The sequencing comparison models a legacy planner at 40ms plus narrator at 20ms versus a combined response at 55ms: **two responses / 60ms versus one response / 55ms**, with zero foreground summaries in both controlled fixtures. These explicitly modeled numbers are not measured live Astra latency or a speed forecast. Real timing, tokens and tier cost remain unmeasured for the unified path.

Ignored focused evidence is under `test-results/p0-runtime/`. Integrated verification logs and safe offline byte/integrity results are outside Git at `C:/Users/<owner>/.codex/owner-backups/p0-live-playability/20261014-2331/`. Private captures in that external directory were not committed.

## Performance benchmark boundary

The isolated proposed benchmark is three synthetic Iris-sized no-tool actions across default/Fast/Ultrafast, with the same Astra High unified contract and no owner data: **nine normal requests, maximum 18 requests including eligible fast transport retries, proposed hard ceiling US $20, no quality retries**. Current rates and explicit paid-call authorization must be confirmed before dispatch; no paid request is inferred from this implementation authorization. The previous paired High/Medium comparison is retained as historical evidence, not a current-tier proof. Existing fetcher-based benchmark overrides can test tiers without changing production defaults or introducing a gateway. Historical WebSocket experiments did not show a wall-time improvement, so no WebSocket path was added.

Synthetic timings establish call-graph/critical-path behavior only. Real Astra latency, output quality and fastest-tier benefit require separately authorized live measurement.

## Deferred UX

The paper-doll lower-slot empty region and Gallery reserved-metadata/classification bugs are confirmed and deferred as directed. Gallery Delete additionally needs safe reference/history handling; direct Storage deletion is not an accepted substitute. No portrait regeneration, Gallery redesign or media request occurred.

## Changed areas and owner safety

- Unified contract, schema, dependency-filtered publication and compatible-effect adapter: `src/lib/gameplay/astra-{primary,plan-context,plan-schema,compatible-effects}.ts`.
- Begin pin/store types and private RPC adapter: `src/lib/gameplay/{server-contracts,dm-store}.ts`, `src/lib/server/dm/store.ts`, Migration 51.
- Context selection and manual capacity retry: `src/lib/gameplay/{dm-context,dm-errors}.ts`, `src/lib/memory/{context,unified-context,lifecycle,after-commit}.ts`, `src/lib/server/gameplay-service.ts`.
- Bounded provider/parse/transport/usage diagnostics: `src/lib/server/dm/{provider,astra-primary-provider,plan-diagnostic}.ts`.
- One player-facing failure-message correction: `src/components/gameplay-turn.tsx`.
- New unified/context/migration/200-turn acceptance fixtures and focused legacy/UI/startup test updates under `tests/`; these two root reports and `DEV_STATUS.md`.

Read-only owner verification still matches all **79/79** table fingerprints. Owner DB remains **50**, main remains `5fb142b7dad6406473e3d3ae77e49cc5b2d3320d`, and Iris remains revision **79**, world minute **508**, same timeline/failed mill operation. No owner retry/cancel/gameplay input, provider/media call, environment change, app restart, main integration or deployment occurred. Test HTTP requests used only the credential-free isolated preview on port 3129. The existing owner app on port 3000 was not used for tests.
