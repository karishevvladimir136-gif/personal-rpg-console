# Adventure / Media V1 — integrated verification

**Status:** the Adventure/loot/reward foundation and real FRAME server path are implemented, integrated and deterministically verified. The changed components are browser checked with public synthetic transports. This is **not a complete two-lane milestone, complete V1, a passed live FRAME gate, VIDEO implementation or owner acceptance**. No real owner Adventure has been executed.

**Baseline:** exact remote main `1f9e3c56896d9cd5a374af6857f918c46bb80603`. Integration branch: `codex/v1-adventure-media`. Final implementation/test freeze: `c556ca56778a8bb1d01aab57f29f43740d9f5e6c`. Only verification/status documentation follows that freeze. Main and the original dirty checkout remain untouched.

## Fresh final gates

| Gate | Result |
| --- | --- |
| Complete repository deterministic suite | 1,523 total: **1,522 passed, 0 failed, 1 skipped**, 155,889.6467 ms |
| Skipped case | Existing explicit opt-in live disposable Supabase Auth/PostgREST test; no hosted behavior is claimed |
| Next route type generation | Passed, exit 0 |
| Nonincremental TypeScript | `tsc --noEmit --incremental false`, passed, exit 0 |
| Repository lint | `eslint . --max-warnings=0`, passed, exit 0 |
| Production webpack build | `next build --webpack`, passed, exit 0 |
| New migration upgrades | Additive 24–26 on disposable PGlite, including populated prefixes 8/10/11/12/13/23/24/25; no fabricated historical World/Adventure/loot-policy membership |
| Isolation/privacy/import regressions | Included in complete suite; synthetic private/future canaries, positive knowledge, campaign/source scope and client/server boundaries |
| EN/RU browser review | Six changed screen groups × two languages × two viewports = **24 combinations**; 1280×900 and 390×844, no document horizontal overflow |
| Provider/model/image/video calls | **0**; no observed provider charge; reservations are not spend |

Commands ran with owner DB/provider credentials removed and real FRAME disabled. The complete suite used `node --test --test-concurrency=4 tests/*.test.mjs`. Test/build logs remain separate from browser and live-quality evidence.

The first frozen complete run is retained as `full-suite.log`: 1,521 passed, one failed, one skipped. Its only failure was an old test comparing the evolving gameplay directory with the historical bake-off base. Independent review confirmed that the closure invariant belongs to exact accepted Mega DM closure `e4f9171f9db87428b5b5812837474eb2c87c5aa8`. That historical scoped diff is still empty. The test now pins that closure while retaining current frozen fixture equality and context/clarification/privacy tests. Its six focused tests passed; the fresh corrected complete run is `full-suite-final.log`. No historical fixture, report or evaluation sample was modified, and no production defect was identified by that failure.

Focused iteration results are separate overlapping evidence, not added into the final count: latest affected Adventure/media/UI 69/69; normal-game/PGlite/owner/reward/upgrade batch 22/22; additional owner/UI/privacy batch 23/23; historical-closure repair 6/6. Worker-focused results are handoff evidence; the table above is the fresh integrated result.

## Authority and normal-path proof

- Adventure preparation/start/manual edit/end/review creates immutable metadata through existing World Events, exact operation receipts and timeline fences. Hero/inventory/resources/progression remain Campaign-owned. New Hero creates one normal house-profile Campaign; it grants no arbitrary model-written identity or mechanics. Save/load/fork preserve exact versions and isolate later history. Unsupported detached playable mode fails closed.
- New source/Canon corrections block stale World/Adventure writes. Server resolves owner-scoped exact World/Pack/source references; clients cannot inject manifests, private source authority or arbitrary hero state. Old associations remain readable without invented membership.
- The normal `runTurn/resumeTurn` + RPC TurnStore + server dice + Foundation/World settlement + narration path proves search, stable contents, weaker-structure bypass with bounded noise/fragile losses, safe failed access, taking known contents/stolen provenance, ordinary commerce acceptance/rejection, rollback and exact save/load/fork/replay. Unsupported creative mechanics and distinct unsupported Actor/entity mappings pause or fail safely; no extra DM or inventory is introduced.
- Reward integrity uses existing trusted definitions, current manual policy versions, quantity-aware ceilings/floors and grant receipts. Independent seven-case actual-server/PGlite review covers manual exceptions, replay before new planning after correction, wrong campaign/input, rarity/value separation, hidden/future policy exclusion and inherited receipts. It exposed a forged policy-event path through unrelated operations; Lead centrally restricted configuration/check/loot events to their owning operations. Both reward and commerce bypass regressions pass with no partial mutation.
- Real FRAME uses current visible committed scene, approved eligible textual references, server policy/model, bounded reservations, immutable private PNG storage and existing Asset/Document jobs. SQL proves queue/claim/complete/failure/cancel/retry/uncertainty, original receipt recovery, stale head/timeline/reference/source rejection, no partial charge/attachment, retained previous art and no ordinary-document prefix exemption. Its bookkeeping preserves gameplay leases, Canon generation and eligible Lab child continuation; genuine factual/source/reference corrections still invalidate stale bases.
- Strict PNG tests cover signature/header/chunks/checksums/bounded inflation/filters/palette; malformed, interlaced or animated results fail closed. Unknown usage or provider outcome is not recorded as zero cost and never triggers an automatic paid retry. Client rendering requires an authorized same-campaign completed asset; malformed reserved metadata stays out of Gallery prose.

## Browser evidence and limits

The actual Adventure/New Hero/Game public-record FRAME/Visual Bible/Gallery/object-reward components are mounted in the ordinary premium shell at [local review](http://127.0.0.1:3102/preview/adventure-media), with public page-local scripted transports. This is not an authenticated hosted Campaign session. The Game preview deliberately disables live gameplay requests; normal free-text runtime authority is proven by the separate disposable SQL tests. Schematics are labelled and are not generated images, pixels/reference fidelity, real Storage or live-model-quality evidence.

Interactions checked: prepare/review/start/manual title edit/end/qualitative review; explicit New Hero review/create confirmation; manual object name/access/portability and reward assessment versions; appearance/outfit draft/save/explicit approval; FRAME current-scene review/reservation disclosure, scripted success/failure/in-flight cancellation and previous-result retention; Gallery history; EN/RU switching and mobile navigation. No physical iPhone test is claimed.

Evidence directory on the review host: `C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/adventure-media-v1-evidence`. `browser-matrix.json` records all 24 combinations and the final loopback production-build preview smoke; `browser-evidence-manifest.json` hashes 39 screenshots and 24 DOM snapshots. Separate logs: `focused-preview-final.log`, `focused-historical-closure.log`, both full-suite logs, `type-generation.log`, `typecheck.log`, `lint.log`, `production-build.log`, and `quality-results.json`. The final evidence manifest records their hashes. Existing accepted tracked artifacts and the baseline DEV_STATUS body are preserved exactly.

## Handoffs

| Branch | Final pushed worker SHA | Scope |
| --- | --- | --- |
| `codex/adventure-v1` | `caf95035f2dd63e709573af92f6effa0108de40a` | Adventure domain/UI, source correction review, public synthetic component harness |
| `codex/adventure-loot-harness` | `cbe8a8d5932799cbbbb2922ee807d25a581cdae7` | Bounded loot/reward definitions, separate acceptance fixtures, normal Game SQL proof |
| `codex/media-v1-frame` | `42f0690fc2ee77a5bbbcd24317c7e38a805721e7` | Real FRAME, strict PNG/lifecycle/privacy checks, independent reward review and live gate preparation |

Lead alone integrated shared contracts, API/runtime/turn/save/navigation changes, migrations 24–26, policy repair, final status and verification. Workers did not merge themselves. The follow-up historical-test review was read-only and used the existing FRAME worker, with no new agent.

The separate `adventure-acceptance-v1` fixtures pin an immutable World basis plus Low Letter, High Letter and Merchant Vault exact JSON digests in `test-fixtures/adventures/v1/manifest.json`. They have no prescribed route, answer key or universal DM quality score. Their structural gates passed; no live Adventure quality evaluation or real owner playtest occurred. Frozen Mega DM fixtures/evidence remain unchanged.

## Remaining gates and unsupported scope

Real FRAME is disabled by default. Exact owner image-model selection is pending. Current text-reference eligibility is deliberately limited to one controlled player, current visited location, equipped items and Campaign style; known NPCs/absent places are not assumed present. Pixel-reference requests fail closed because the conservative image-input charge ceiling has not been established. The five public text-reference scenes and current pricing/reservation policy are in [FRAME gate preparation](ADVENTURE_MEDIA_FRAME_GATE_PREPARATION.md). Five requests would reserve at most $2.00 within the owner's $20 combined ceiling; neither reserve is observed spend. **Live FRAME gate: not run; actual provider/model/usage/cost: none.**

**VIDEO: not implemented or tested; zero calls/cost.** Its FRAME prerequisite has not passed and FAL_KEY is absent. No substitute provider or automatic fallback was introduced. Before paid dispatch, freeze the eligible synthetic basis, confirm the exact owner selection/server credential/configuration and budget, and use isolated synthetic storage only. No real owner DB migration or deployment is authorized by this report.

World creation does not publish Canon or auto-instantiate all Pack entities; existing explicit Campaign Pack binding/Prepare remains required. World repinning/version-edit recovery is not exposed in this slice: genuine pinned-source correction blocks new stale writes rather than force-applying or silently repinning. Detached playable Adventures remain unavailable. The ordinary Level 1 Fighter is a house compatibility template, not official D&D 5e. Loot uses authored established stock/current capability policies, not arbitrary procedural/model-written items; unsupported methods pause. Reward balance is manual trusted content policy, not a universal balance table.

Review the implemented foundation and disclosed limits using [the owner guide](ADVENTURE_MEDIA_V1_OWNER_REVIEW.md). The complete first FRAME+VIDEO owner playtest milestone has not been met. No owner quest/twist/required route, real campaign import, real migration, deployment, DM-quality live request, D2B, Timeline V2, Living World, Enter This World expansion, broad crafting, 2D or EXPLORE was started. Stop for owner review; do not run the real Fighter Adventure yet.
