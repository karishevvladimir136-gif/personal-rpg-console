# Production Mega Sprint — Wave 1 shared contracts

Version **1**. Authorized production base: dd695a7056cfb7569237d305fe48aa2893f1f18e. This is the bounded A1 / minimum A2 / B1 / first C implementation wave, not completion of A/B/C. Owner authorization includes immediate worker implementation after the contract commit and baseline checks. No second GO is required.

## Authority and scope

MASTER_SPEC and DEVELOPMENT_PLAN remain the product authority. Preserve accepted Phase 0–3.5 behavior, direct OpenAI Responses, one primary DM, one Memory pipeline and one Saves/Timelines system. No live provider calls, real inputs, deployment, D/E, B2, Phase 4, visual renderer, EXPLORE, VIDEO or experimental provider work. Existing production code is inspected at the authorized base; no experiment code is imported.

All development uses Astra / Extra High. Lead runtime metadata is verified gpt-6-astra / xhigh; every worker is explicitly configured identically. Tool capacity permits three concurrent workers plus the lead, so A/B/C start together and independent D starts at the first free slot. This capacity constraint changes neither D's independence nor required coverage.

## Canonical identity and shared types

[contracts.ts](src/lib/production/contracts.ts) is the Lead-owned version-1 wire boundary. Application-created UUIDs identify owners, campaigns, source versions, reusable packs, scenarios, divergences, bindings, Actors, Threads, Events, Hooks and operations. Reuse the existing campaign UUID and TimelineFence. Actor references to an existing character keep its existing entity ID; no second inventory/character store. Group/faction/location Actors may have neutral canonical identities without HP/classes/d20. Source-local identity maps explicitly to independent campaign identities; mappings persist across that campaign's timeline family, never become shared mutable pack state. Provider identifiers are optional provenance only.

Source/pack records belong to an authorized owner, never a fake library campaign. A campaign binding pins the owner, campaign, immutable pack/scenario/source versions, explicit priority order, temporal entry anchor and mappings. Bindings cannot grant access to another campaign's private truth. Instantiation is explicit and idempotent, not automatic pack-update propagation.

## Authority, evidence and knowledge

Postgres is authoritative. Manual owner corrections outrank derived work. Source evidence is preserved versioned material; approved Canon is a separate status and authority; Memory is a derived index with epistemic labels, not a second source of truth. Source Fact / Inference / Scenario Assumption / Simulation Fact must not collapse into fact/rumor epistemic status.

EvidenceLocator pins an authorized immutable source version, exact format-independent locator, digest, visibility and knowledge scope. Source Knowledge, Canon at Entry, Character Knowledge and Future Source Events stay distinct. Future/source-only evidence never enters ordinary current-state/player retrieval merely because the owner uploaded it. No automatic canon publication or source future reenactment.

Public projections are explicit allowlists. Server-private text, IDs, counts, routing details and secret credentials are not public DTO fields. A public World Event carries only independently validated public text/evidence/actor references; private causality stays private. Inputs, imported text and model responses never grant authority. No direct client access to internal foundation RPCs or private tables.

## World selection and settlement

Worker A owns the typed World domain inside FoundationSnapshot.world: Actors, persistent Threads, latent Hooks and policy. Version and validate this bounded JSON domain; do not put library/ruleset/runtime policy data inside it. Source bindings, ruleset selection and execution policy occupy separate shared fields. Existing runtime worldMinutes is the authoritative time; wall-clock time is audit only.

World Autonomy and Deadline Pressure (off / critical_only / normal) are independent. Simulation Off accrues no hidden work debt. Deadline Off cannot time-expire quests/hooks/Threads; immediate explicitly initiated causal effects still resolve. Re-enable reconciles from current fictional time, never a backlog. Never decide for controlled PCs, including legacy player-kind entity references. Select bounded coherent work; mandatory work exceeding limits pauses rather than silently disappearing. No due work means no model calls and no world mutation.

WorldSettlement is a proposal with stable operation identity, campaign/fence, expected runtime/world revision and timeline head, source versions, coherent time interval, proposed immutable Events and nextWorld. Event IDs persist across retries. The Event envelope fixes visibility, actor/thread membership, origin timeline, schema version and source provenance; database assigns monotonic sequence at commitment. Event payloads remain domain-specific, not a universal patch type.

Lead integrates staging into the accepted turn path: resolve mechanics/checks first, stage bounded world work before narration, narrate only validated public outcomes, then atomically commit player/world state and Events under the initiating fence. Failure commits no partial state. Stored pending work and dice survive retry. Duplicate operation with identical request returns its recorded result; changed request, stale revision/head/fence/source or wrong owner/campaign fails. No external calls inside SQL transactions. Unsupported resolver-dependent work pauses; no fabricated model resolution.

## Persistence and RPC agreement

The Lead alone implements additive migration(s), SQL validation, owner checks and service-only dispatch. Existing records are not destructively migrated and local real data is not touched. Tests use disposable PGlite/synthetic fixtures only.

- Library RPC name: rpg_library. FoundationRpc arguments are shared; campaign_id is null. Actions read / put. put uses LibraryWrite. read filters kind/id/versionId. Immutable source/pack/scenario/divergence/compiler-job versions are stored as LibraryRecord; compiler lifecycle progression adds a version. The server validates typed body semantics before RPC, and SQL independently enforces owner, version/idempotency, scope and referenced-version integrity. No arbitrary SQL or executable source content.
- Campaign RPC name: rpg_world. Same argument envelope with required campaign and timeline fence. read returns FoundationSnapshot; configure / bind / stage are server-only, validated explicit owner/domain operations. Every mutating command includes FoundationCommand. configure sets an explicitly validated world/ruleset/execution policy; bind uses CampaignPackBinding. stage persists WorldSettlement without changing committed game time/state. The Lead owns the final atomic commit hook and immutable event persistence.
- Existing public APIs must not return FoundationSnapshot or LibraryRecord unfiltered. Pure injected RPC adapters are testable offline; server factories enforce server-only credentials and authorized owner identity. No UI or arbitrary client-driven world patch route is required in this bounded foundation wave.

## Saves, history and Memory

One active campaign projection and the existing immutable timeline_versions / timeline_manifests remain the save engine. Lead adds a deliberate manifest v2 reader/writer for new world projection/event/stage/receipt/binding/profile families. V1 readers remain valid and load an explicitly empty/unconfigured world foundation without invented past events. Immutable owner-library history is not rolled back; saves pin campaign bindings and profile versions. Loading cannot invoke providers, mutate old manifests or reinterpret historical dice.

Origin timeline identity is historical provenance; current serving TimelineFence supplies epoch/revision/head authorization. Old callbacks cannot rebind to a new active branch. Exact membership excludes future/sibling events before retrieval limits. Campaign-wide source corrections invalidate affected derived/pending work through existing Memory rules; they do not rewrite committed events or independently alter other campaigns.

Worker C's World Event adapter reuses event/private_event Memory source kinds and the existing indexing/restriction pipeline; only committed, in-scope Events enter it. Lead owns SQL index hooks and family registry changes. No new retrieval engine or full transcript context.

## Rulesets and Model Runtime

RulesetProfileRef pins ID, version, mode and validator version. Full Ruleset, World Logic and Custom Ruleset are explicit bounded profiles. console-basic-v1 stays interpreted exactly as today and is not full D&D 5e. Neutral identity/control/capabilities are distinct from optional mechanics. No generated code/plugins, universal HP/d20 or automatic profile conversion. Full/custom unsupported actions pause. This wave implements profile foundations, not new universal combat UI or complete rules systems.

ExecutionProfile pins task, safe provider/model/options, registry and policy version. Resolution order: explicit task override, campaign primary, global default. Invalid/unavailable explicit choices fail; never fall back. Existing direct OpenAI requester and strict schemas/budgets remain the working adapter. Credentials remain environment-only server secrets. Worker C owns provider/task registry and delegating existing DM/summary factories. Profile choice freezes before an operation and remains stable for its stages/retry; no silent switch. No new provider or live test in this wave. Owner model-selection UI is not part of this first seam slice.

## Ownership and integration

| Owner | Exclusive files / duties |
| --- | --- |
| Lead / Integrator | This document; src/lib/production/**; supabase/** and all migrations; existing shared persistence/gameplay/memory/save contracts, turn engine, RPC/route integration and cross-subsystem registries; DEV_STATUS; all final integration changes |
| A — World Engine | src/lib/world/** and src/lib/server/world/**; tests/wave1-world* only. Import Lead shared types, implement typed deterministic selection/staging/public projection and focused tests. No migrations or central turn edits. |
| B — Library / Packs / Rulesets | src/lib/world-library/**, src/lib/world-packs/**, src/lib/rulesets/**; src/lib/server/world-library/** and src/lib/server/world-packs/**; tests/wave1-library*, tests/wave1-packs*, tests/wave1-rulesets*. Source/pack/scenario/job body validators and RPC adapters. No migration/shared type edits. |
| C — Runtime / Memory / Saves | src/lib/model-runtime/**, src/lib/production-adapters/**, src/lib/server/model-runtime/**; delegated src/lib/server/dm/index.ts and src/lib/server/memory/provider.ts; tests/wave1-runtime*, tests/wave1-memory*, tests/wave1-saves*. No migration or existing shared contract/save engine edits. |
| D — independent QA | tests/wave1-qa* and WAVE1_QA_REVIEW.md; isolated fixtures, adversarial review and defect reports, no production redesign. |

Each worker branches/worktrees from the same contract-freeze commit, acknowledges this contract, then implements immediately under the already granted owner authorization. Report branch/SHA/files/current test results/dependencies/limitations. Lead alone integrates; Lead pushes worker branches centrally. Shared-contract changes require a precise request, Lead decision and explicit update from the Lead commit; pause only dependent work. No competing definitions, migrations, schema families or rollback systems.

## Verification and completion boundary

Baseline: existing suite, zero-warning lint and typecheck/build as appropriate. After integration: complete suite, Wave 1 deterministic/adversarial cases, typecheck, zero-warning lint, production build; inspect migration safety, legacy save load, stale/duplicate settlement, private/client boundaries, source-future isolation and unsupported provider policy. No historical count is a fresh result. Deterministic correctness is not model-quality evaluation, live Auth acceptance, browser/device acceptance or owner approval. Stop after integrated Wave 1 branch commits/push and report remaining bounded work; main stays at the authorized base.

Contract-freeze baseline: 303 tests collected, 302 passed, 1 live Supabase integration test skipped, 0 failed; route type generation + TypeScript typecheck passed; zero-warning ESLint passed. No live AI/provider test was run. Full production build remains part of final integrated verification.

## Integration addendum v1.1

The existing turn checkpoint and commit packet gain one optional INTERNAL `worldSettlement` field. `prepareWorld` runs after authoritative mechanics and before narration; exact deterministic replay validates a saved proposal. Only public observations join narration outcomes. Feedback/OOC bypass world advancement. Unsupported ruleset gameplay pauses before provider execution; this slice does not route World Logic through the legacy mechanics interpreter.

Execution profiles are immutable private records pinned for **all relevant DM stages together** before the first request, or for one summary job. `rpg_execution_profile` is service-only, owner/campaign/operation/lease/timeline fenced. Environment selection is the global default; an explicit campaign or task choice never silently falls back. Credentials remain server secrets and are not persisted in profiles.

The additive migration owns `library_records`/`library_commands` outside campaign rollback and five v2 save families: `world_foundations`, `world_events`, `world_stages`, `world_commands`, `execution_profiles`. v1 readers retain the exact previous family inventory and load absent foundations as unconfigured legacy defaults. There is no second rollback engine. Pending staged world proposals from an activated branch cannot execute under their old fence; they pause/conflict rather than applying stale work. Source revisions retain bindings and original Events, invalidate dependent current Memory derivatives/stages, and never automatically repin campaigns. Explicit version repinning preserves existing identity mappings.
