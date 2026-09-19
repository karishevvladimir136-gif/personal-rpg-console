# Development status

Last updated: September 19, 2026. Update before milestone-completion commits and after architectural changes. Never include secrets, credentials or DM-private content.

## Current milestone and status

**PHASE 3.75 ARCHITECTURE DOCUMENTATION — design pass completed; pending owner review.** The proposed World Engine / World Lab / Source Worlds layer is neither implemented nor owner-approved. Only documentation work is authorized in this pass. Latest accepted implementation remains Phase 3.5 `8099e0cca1463f767476190c456d4f3947e7c84e`, with explicit acceptance at `6db58b5e3d464e4a09604ce344424c4fa8ed763e`. Earlier accepted checkpoints and their actual verification records remain below.

### Completed work and inspected foundations

Read the specification, development plan and agent instructions, then inspected accepted runtime/mechanics, Memory, save contracts/adapters and migrations, followed by the current status record. The resulting architecture deliberately extends existing systems:

- World Actors reference stable entities; Threads hold goals/deadlines; Events are validated factual history. Bounded in-world triggers and staged turn settlement preserve recorded dice, agency and private knowledge.
- World Lab uses existing timeline identities, immutable row versions/manifests and source membership. Concurrent non-canon runs require a future detached-manifest reader/writer and per-run head/lease fencing; the current single active campaign projection cannot support them by switching live timelines. Enter This World creates a validated playable child while preserving the original and simulation.
- World Library/Packs preserve originals, evidence, conflicts and approved visuals. Reusable owner-scoped versions bind into isolated campaign instances. Entry anchors distinguish current canon/character knowledge from later source events; original/canon/simulated character selection and literal/native scenario composition preserve provenance and agency.
- D&D is a selectable ruleset, not universal ontology. The accepted `console-basic-v1` remains a house-profile compatibility baseline, not full official 5e. Proposed World Logic/custom profiles and bounded sheet/inventory components remove future compulsory HP/d20 assumptions without rewriting accepted behavior.
- Model Runtime extends current DmProvider/SummaryProvider seams with provider/task selection, pinned execution profiles, verified budgets and provenance. One primary DM, no silent fallback or automatic cheap-model routing. Supported-provider onboarding uses one ignored local server-secret file, future safe example/instructions and Settings → AI Providers with explicit Test Connection. Campaigns never contain keys; no configuration/setup implementation was added.

### Files / areas changed

Exactly eight documentation files: [MASTER_SPEC.md](MASTER_SPEC.md), [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md), this DEV_STATUS.md, and new [WORLD_ENGINE_BRIEF.md](WORLD_ENGINE_BRIEF.md), [WORLD_LAB_WHAT_IF_BRIEF.md](WORLD_LAB_WHAT_IF_BRIEF.md), [WORLD_LIBRARY_AND_WORLD_PACKS_BRIEF.md](WORLD_LIBRARY_AND_WORLD_PACKS_BRIEF.md), [RULESETS_AND_DYNAMIC_UI_BRIEF.md](RULESETS_AND_DYNAMIC_UI_BRIEF.md), [MODEL_RUNTIME_BRIEF.md](MODEL_RUNTIME_BRIEF.md). The specification explicitly revises former universal rules/provider assumptions; the plan proposes separately reviewed A–E slices and records remaining owner decisions. Accepted Phase 2/3/3.5 contract files are unchanged.

### Verification for this documentation pass

**Passed:** documentation whitespace/diff check; all 44 relative Markdown file links across the eight changed documents resolve; code fences are balanced; no conflict markers or encoding replacement characters; exact eight-file documentation scope. Inspected code/migration references match the accepted repository. The prior Phase 3.5 acceptance and all following historical status/verification text are unchanged. SHA-256 checks confirm the original checkout's two pre-existing edited documents are byte-for-byte unchanged. Runtime, migrations, tests, configuration and accepted contracts have no changes in this checkout.

No application test suite, typecheck, lint, production build, browser acceptance or live integration was rerun: no executable/configuration change was made. Historical passing results below belong to their original accepted checkpoints, not this design pass. No app/provider/model API calls, migrations, database operations, runtime/UI implementation, synthetic fixture changes, deployment or real-data imports occurred. Git fetch/push is solely repository synchronization.

### Key decisions and known limitations

- Reuse existing Memory, authority/knowledge filters and save vault/manifests. Version-1 manifest validation uses a fixed family list; future world/profile families need compatible versioned readers, not silent invalidation of accepted saves.
- Pin complete source/contract/profile versions for comparisons; a save ID alone cannot pin ordinary canon documents outside rollback. Global canon corrections retain authority and invalidate affected derived work; a What If premise remains a local assumption.
- Canon before entry is history; future source outcomes do not force choices. Model pretraining knowledge cannot be guaranteed erased. Exact state never comes solely from a generated recap, and source originals survive compilation/summarization.
- Use the existing Next.js/Supabase application with small adapters and bounded jobs. No new backend, swarm, graph database, alternate branch system or general low-code platform.
- No tracked `.env.example` currently exists. The future Model Runtime slice must supply a placeholder-only example, keep real secrets ignored and provide exact nontechnical file/variable/restart instructions. Proposed providers are candidates, not newly verified working integrations. Test Connection is future explicit synthetic work, never automatic probing or a call made here.
- Physical iPhone/Safari remains unverified. The historical optional Phase 1 conflict-rebase confirmation remains unverified. Finite synthetic/model tests do not guarantee perfect memory, branching, simulation causality or universal recovery. No hosted deployment or real campaign/private-data acceptance has occurred.

The work uses an isolated `codex/world-architecture-docs` checkout based on the accepted checkpoint. The original checkout's pre-existing uncommitted DEV_STATUS.md and PHASE3_EVALUATION.md are outside this pass: not staged, overwritten, reconciled or attributed to it. Original acceptance/implementation verification text remains preserved below.

### Remaining work and recommended next step

Owner review of the five briefs and the decision table in DEVELOPMENT_PLAN: phase/order naming, canon-continuation policy, default imported-world ruleset, Live World/Off behavior, visual association scope, default simulation count, initial model/provider task policy and ruleset breadth. Suggested defaults are explicit proposals, not owner decisions. Review does not require source-code inspection or manual setup.

Stop after the documentation commit/push. A later explicit instruction may scope A1 or another agreed slice with concrete contracts, compatibility gates and independently authorized live evaluation. Do not begin Phase 3.75 implementation, Phase 4, FRAME, VIDEO, deployment or real campaign/private import now.

## Accepted Phase 3.5 checkpoint — preserved historical record

**PHASE 3.5 OWNER-APPROVED — Save / Load / Timeline Forks.** The owner explicitly accepted implementation checkpoint `8099e0cca1463f767476190c456d4f3947e7c84e` on September 18, 2026. This acceptance is separate from the implementation verification recorded below and does not claim additional testing. Preserve Phase 3 implementation `ca4499bc279d37eb52c0a36b0524eb19322071b0` and owner acceptance `96964964a7d5046ff34b6b6ae695ecf494885cc4`, plus all earlier accepted checkpoints.

## Phase 3.5 owner-acceptance record

This status-only acceptance commit changes **only DEV_STATUS.md in the isolated phase35-lead checkout**. Application code, migrations, runtime, tests, configuration, Phase 3/3.5 contracts, save/timeline data and synthetic fixtures are unchanged. Tests, typecheck, lint, production build, live integration and browser checks were not rerun for this documentation-only acceptance. Verification is limited to the exact checkpoint, single-file diff, preserved verification text and original-document hashes. All implementation results below belong to the accepted implementation checkpoint.

All disclosed limitations and verification boundaries remain in effect:

- Physical iPhone/Safari remains unverified.
- The historical optional Phase 1 conflict-rebase confirmation remains unverified.
- Finite synthetic tests do not guarantee perfect branching, memory isolation or universal recovery.
- No hosted deployment or real campaign/private-data acceptance has occurred.
- The original checkout's pre-existing uncommitted DEV_STATUS.md and PHASE3_EVALUATION.md remain byte-for-byte untouched. They are not staged, overwritten, reconciled or attributed to Phase 3.5; their recorded hashes are checked for this acceptance commit as well.

This acceptance authorizes no further implementation. Do not begin World Engine, Phase 4, FRAME, VIDEO, deployment or real campaign/private-data import. Stop after committing and pushing this acceptance record.

## Phase 3.5 completed work

- Contract/types checkpoint `73d4ab2b7bb38f76aa9528afb68c323a1e674124` was committed first. All three separate-worktree development workers acknowledged that exact checkpoint before GO. The lead integrated storage, memory and UI commits and completed the shared routing, authorization, translation and verification work. Only Worker A changed supabase/**. The product still has one gameplay DM.
- Dedicated bilingual Saves screen with Save Games and Timelines tabs, Quick Save, named manual saves, bounded autosaves, safety-before-load records, load confirmation and preserved-timeline switching. Desktop placement follows Sessions; mobile uses More and retains five bottom controls. The existing charcoal/bronze design is preserved.
- Immutable deduplicated record-version manifests restore exact structured state, consumed/equipped/stored items, quests, time/location, rests/encounters/effects, pending operations/checks, effective settings/guidance and public/private memory membership. Loading forks a path; switching restores a preserved head. Neither regenerates narration, replays mutations or rerolls recorded dice.
- Exact inherited source/version membership excludes abandoned public/private history, summaries, aliases and NPC knowledge before retrieval limits. Phase 3 bounded context and manual-correction authority remain. Explicit campaign-wide canon corrections propagate on activation; branch corrections preserve siblings.
- Stable request IDs, atomic safety/fork/load/switch, monotonic activation fences and revoked execution leases protect retries and concurrent tabs. Operation IDs used in an abandoned future cannot become fresh actions. Stale provider/job callbacks and browser writes fail closed. Drafts and uncertain requests remain available for explicit review/retry.

## Phase 3.5 files / areas changed

PHASE3_5_CONTRACTS.md; shared save DTOs and timeline envelopes; src/lib/saves/ and src/lib/server/saves/; campaign Saves routes/page; authorized repository/gameplay/memory services and RPC adapters; Phase 3 memory filtering/context/jobs; client draft/recovery providers and Saves UI/navigation/styles; merged Russian strings; migrations 202609190008_phase35_timelines.sql and 202609190009_phase35_fencing.sql; focused Phase 3.5 tests and updated prior compatibility fixtures; synthetic application/privacy acceptance scripts; MASTER_SPEC.md §42, DEVELOPMENT_PLAN.md, PHASE3_5_BRIEF.md, PHASE3_5_SETUP.md and this record. Local environments, credentials, backups, logs, reports and build output remain ignored.

## Phase 3.5 tests and build status

### Automated local verification

- Final Next route type generation, TypeScript check, full ESLint and normal Turbopack production build **passed**. The final build followed live/browser verification; no lint warnings. Worker-local tests were followed by the full integrated gate.
- Full integrated suite: **303 total, 302 passed, 1 intentionally skipped, 0 failed**. The skip is the historical opt-in Phase 1 empty-database seed test; the populated database was not reset or reseeded. HTTP tests targeted the integrated production preview on port 3001. Existing Phase 0–3 regressions passed alongside the new save/branch suites.
- The final rebuilt production preview also passed all **27 HTTP/route checks**, with no failures or skips.
- Embedded PostgreSQL executes all committed migrations and production adapters: populated upgrade, immutable saves, Quick Save replacement, bounded retention, exact restoration, active rests/encounters/effects/component provenance, preserved pending dice versus fresh future rolls, stale leases, idempotency, owner/campaign boundaries, correction scopes and global version allocation. Existing upgrade assertions still compare all original gameplay fields; they additionally validate new serving fences. Old memory fixtures now carry the required authorized campaign fence.
- The production SQL branch test adds **1,000 later events**, processes **at least 42 bounded memory batches**, forks repeatedly and returns to preserved heads. Exact mechanics and original public/private summaries return on the old timeline; abandoned secrets, NPC knowledge and summaries remain absent on the fork. The old promise remains retrievable below the existing **64,000** operational input cap. A separate mixed-history retrieval test rejects stale/sibling sources and nested references.

### Populated disposable local Supabase and application verification

- Created an ignored local database backup before applying committed migrations 008–009 atomically, without reset. All **40 pre-existing table row counts and content fingerprints matched exactly before/after migration**. Eight existing synthetic campaigns and their accounts/history were preserved, with one root timeline backfilled per campaign. The backup is 922,432 bytes; SHA-256 `FDE0E6815BC33FD7EF1D65DF6D4F8A5B5A559C50C529F253AB9F0339533A9867`.
- Appended only two unrelated fixtures: **Synthetic Phase 3.5 · Amber Observatory** and **Synthetic Phase 3.5 · Silver Current**. Real Auth/API acceptance passed **11 scenario groups**, covering manual/quick/replacement, safety/fork/switch, exact restored state and public/private/NPC/summary boundaries, duplicate and stale writes, saved pending dice/new future check identity, effective settings/guide restoration with new immutable versions, canon/branch corrections, logout/relogin and unrelated-campaign isolation.
- Anonymous/non-owner access, direct ordinary-owner privileged RPC/private-schema access, cross-campaign requests and foreign-origin writes were denied. The main harness inspected **199 ordinary API responses, six authenticated HTML pages and 20 production client bundles**, with no synthetic private marker exposed.
- A final read-only privacy pass inspected **11 additional Auth/API/error responses, 12 authenticated HTML pages, all 20 final client bundles and six ordinary application stdout/stderr logs**. No synthetic canary, server credential name or configured secret value appeared. Save/Timeline DOM checks also contained no canary. No real private material was used.
- **Zero OpenAI calls** during Phase 3.5 implementation acceptance. Deterministic synthetic fixture packets and source selections exercise the persistence/runtime boundary without inventing product replies or making paid model requests. The final preview retains the existing local provider configuration; no new key or model change is required.

### Browser verification actually performed

- Created manual saves, loaded a new named path, verified the safety/preserved-timeline UI, and switched back to the original timeline. English and Russian save titles persist after refresh.
- In a second tab, an unsaved character description survived a timeline change and its stale save control was blocked. This is a real two-tab browser check, separate from API/SQL conflict tests.
- Deliberately stopped only the temporary localhost test server, submitted a manual save and verified the title and original request were retained. Restarted it, chose **Retry same request**, observed exactly one resulting save card, then refreshed successfully. The ordinary error revealed no private detail.
- Changed and saved the synthetic campaign's autosave policy, confirmed its persisted values and restored the defaults. Saved Russian through General Settings and confirmed it across navigation; restored English afterward.
- Inspected **both tabs in English and Russian at desktop, 390px and 320px**, including narrow Save Games controls, timeline cards and mobile More navigation. No horizontal overflow; no sixth permanent bottom item. Restored the normal viewport. This is desktop browser resizing, not physical-device verification.

## Phase 3.5 key decisions and known limitations

- One existing active campaign projection, a private immutable row-version vault and exact manifests avoid copying the entire database per save. Atomic reads prevent mixed snapshots during activation. Technical revision/lease/fence rebinding never changes recorded outcomes or mechanics.
- Campaign identity, global preferences, ordinary canon/reference documents, feedback history and immutable document/settings histories remain outside historical rollback. Saved effective settings/guide versions control future play; new edits allocate versions above all preserved siblings. Feedback is never world history.
- Default autosaves occur at successful session boundaries, with **15** recent slots per timeline (configurable **10–20**, or off). Optional turn autosaves exclude feedback/OOC. Retention bounds the visible recent slots; immutable history referenced by saves/branches is preserved, so storage can grow. This is not a backup/export system.
- If campaign-wide canon changed after a saved unresolved proposal was generated, loading that stale proposal fails atomically instead of silently treating it as current. Input, checks and old history remain preserved; the app does not rebuild a plan, reroll or call AI merely to load. Owner recovery bypasses only soft policy, never consistency or authorization.
- Physical iPhone/Safari remains unverified. The optional historical Phase 1 conflict-rebase confirmation remains unverified; the new timeline stale-draft check is a different test. Finite synthetic branching/model evaluations are not a guarantee of perfect memory or universal recovery. No hosted deployment or real campaign/private-data acceptance has occurred.

## Preserved pre-existing owner edits

The original checkout's uncommitted DEV_STATUS.md and PHASE3_EVALUATION.md were preserved **byte-for-byte**, not staged, overwritten, attributed to this milestone or silently reconciled. Their original SHA-256 values were rechecked after implementation and browser verification and still match the record in PHASE3_5_CONTRACTS.md. Phase 3.5 uses the accepted committed documents in **.worktrees/phase35-lead** and separate worker checkouts. The original dirty main checkout remains at its prior accepted commit; the integrated lead branch is pushed safely to origin/main without modifying it or force-pushing. Deliberate reconciliation of those unrelated local edits remains separate from this milestone.

## Phase 3.5 remaining work and recommended next step

No required available implementation, verification or owner-acceptance gate remains open. **Explicit owner acceptance is recorded at `8099e0cca1463f767476190c456d4f3947e7c84e`.** The prepared local preview and restart instructions remain in **PHASE3_5_SETUP.md**; preview/runtime state was not changed or reverified for this status-only acceptance.

**Stop after recording and pushing this acceptance.** Await a separate owner instruction before any further work. World Engine, Phase 4, FRAME, VIDEO, deployment and real campaign/private-data import remain unauthorized.

## Accepted Phase 3 checkpoint (historical)

The following acceptance and verification belong to the preserved Phase 3 checkpoint. Its next-phase stop applied until the explicit Phase 3.5 authorization above.

### Phase 3 acceptance status

**PHASE 3 OWNER-APPROVED — Long-Term Memory.** The owner explicitly accepted implementation checkpoint `ca4499bc279d37eb52c0a36b0524eb19322071b0` on September 18, 2026. This acceptance is separate from implementation verification and does not claim additional testing. Phase 2 and earlier approved checkpoints remain preserved.

## Phase 3 owner-acceptance record

This status-only acceptance commit changes **only DEV_STATUS.md**. Application code, migrations, runtime, tests, configuration, Phase 3 contracts and campaign data are unchanged. The implementation verification results and their boundaries at the accepted checkpoint remain preserved; tests, typecheck, lint, production build, live model evaluation and browser checks were not rerun for this documentation-only acceptance. Verification for this commit is restricted to its diff and single-file scope.

All disclosed limitations remain in effect:

- Physical iPhone/Safari remains unverified.
- The optional historical Phase 1 conflict-rebase confirmation remains unverified.
- Finite synthetic retrieval/model evaluation is not a guarantee of perfect memory; the disclosed sample, failures, lead-review boundary and operational limits remain unchanged.
- No hosted deployment or real campaign/private-data acceptance has occurred. No real campaign or real DM-private material has been imported.

Phase 3 has no remaining owner-acceptance gate. **Stop after recording and pushing this acceptance.** Phase 3.5, Phase 4, World Engine, deployment and real campaign/private-data import are not authorized by this acceptance. Await a separate owner instruction before any further work.

## Phase 3 current status and completed work

- Three separate-worktree development workers acknowledged PHASE3_CONTRACTS.md and the lead-owned contracts before GO. The lead integrated storage, retrieval and UI checkpoints in order. When workers reached their usage limit, the lead preserved their commits and completed integration and verification locally, taking sole ownership of final migration fixes. The application still has one primary gameplay DM.
- Source-linked public/private indexes, immutable summary versions, ordered coverage, bounded jobs and correction invalidation extend the existing authoritative records. Original messages, scenes, events, document versions and state revisions remain available; derived memory never becomes the sole truth.
- END SESSION saves an exact resume boundary before recap generation. Failure/retry does not lose state or input. Continue preserves an unresolved operation and its recorded dice; only explicit resolution/cancellation and a subsequent Continue start the next session. Continuing does not heal, replenish supplies or advance world time.
- Bounded context retains exact current state, rules, effective guidance, pending checks and valid checkpoint metadata, then selects recent complete exchanges, canon and relevant older evidence. PostgreSQL English/Russian/simple text search and aliases support historical recall without embeddings, a second backend or a second gameplay agent. Missing essential evidence or unsafe size/conflict pauses rather than inventing continuity.
- Model-generated summaries are strict source/version selections. The server renders original complete source spans, retaining claims, uncertainty, negation and intentions. Separate private planning memory never reaches public narration, ordinary APIs or client bundles. Companion retrieval requires positive knowledge evidence for its listeners. Feedback/OOC/guide text is not world history.
- Sessions/Game expose saved-point, recap, pending, failure, explicit retry and Continue states in English/Russian, preserving the approved visual design. Correction invalidation withholds stale recaps immediately; rebuilding uses current originals. No Save/Load or timeline UI was added.

## Phase 3 files / areas changed

PHASE3_CONTRACTS.md; shared and pure memory modules in src/lib/memory/; authorized server memory/context/provider orchestration; campaign memory routes and gameplay integration; Sessions/Game components and localized labels; additive migrations 202609180005 through 202609180007; focused storage, populated-upgrade, retrieval, lifecycle, summary and UI tests; synthetic acceptance scripts; PHASE3_SETUP.md, PHASE3_EVALUATION.md, MASTER_SPEC.md, DEVELOPMENT_PLAN.md and this status file. PHASE3_5_BRIEF.md records the complete queued future brief and navigation clarification. Local environments, credentials, backups, reports and logs remain ignored.

## Phase 3 tests and build status

### Automated local verification

- Final Next route type generation, TypeScript check, full ESLint and normal Turbopack production build **passed**, after live/browser verification and the final retry fix. No lint warnings.
- The final production application also passed **27 HTTP/route checks** (19 preview/route and eight authorization/policy checks), plus the real local application verification below. Its temporary port-3001 server was stopped; the development preview remains on port 3000.
- Full suite: **266 total, 265 passed, 1 intentionally skipped, 0 failed**. The skip is the opt-in Phase 1 empty-database seed test, already passed at the accepted Phase 1 checkpoint; it must not reseed populated fixtures. Current real Supabase checks are reported separately below.
- Embedded PostgreSQL tests execute the migrations and production adapters, including upgrade of populated Phase 2 data; owner/campaign/private boundaries; immutable originals; source versions; stale jobs/corrections; ordered coverage; expired and exhausted retry recovery; duplicate requests; and pending recorded dice across END/Continue.
- Production SQL repeatedly compacted **1,000 events across 20 sessions into at least 42 bounded batches**, preserving exact HP/resources, zero-quantity consumed items and embedded-component provenance. The old promise remained retrievable and its runtime context stayed below the 64,000 operational input cap.
- The labeled retrieval evaluation contains **43 scenarios, 2,435 sources and 48 sessions across two unrelated campaigns**. Expected-source recall **37/38 (97.37%)**; **43/43 critical cases included required evidence or paused safely**; zero campaign/private leaks. A redundant derived summary was missed while its original promise was retrieved; the miss remains counted. This evaluator uses a dedicated candidate table; separate production-query/adapter/context tests cover the actual runtime path.

### Real disposable local Supabase / application verification

- Backed up the populated local database and applied additive migrations 005–007 without reset. Existing synthetic accounts, the single authorized owner and prior fixtures were preserved. An initial backfill type error rolled the entire first attempt back; it was fixed and covered by a populated-database regression before successful reapplication.
- Appended only **Synthetic Phase 3 · Lantern Harbor** and **Synthetic Phase 3 · Frost Circuit**. Real Auth logout/relogin, campaign isolation, anonymous/non-owner denial, ordinary-client RPC/private-schema denial, public-summary RLS and feedback exclusion from world retrieval passed.
- Ten normal owner API responses and all **17 final production client bundles** contained no synthetic private canary or server credential names/values (the earlier build's 20 bundles also passed). Six authenticated production HTML pages and four ordinary application log files likewise contained no marker or credential. No real private material was used. Stable check IDs/results and public records survived refresh/relogin. Final production verification made no model calls.
- Owner correction of a synthetic promise immediately invalidated old derived memory/checkpoint access. Rebuilding used the corrected red-compass record, while the unrelated campaign remained unchanged. Recap processing/feedback did not change HP, inventory, quests, scenes or time. One public recap failure was deliberately injected to verify recovery; it was not a provider outage.

### Live model-quality verification

- Configured **gpt-6-astra / xhigh**, strict Responses outputs and store:false; every response reported Astra. No fallback or model switch. **25 valid generated cases (21 continuations and four source-selection summaries) passed lead rubric review: 25/25, zero critical state contradictions and zero private disclosures.** One additional invalid-checkpoint case safely paused without a model call.
- The dedicated harness made 26 successful requests, including one initially misconfigured Russian fixture excluded from scoring. Its configured campaign language was corrected and the replacement answered in Russian. The original output and exclusion remain recorded. This was lead review, not an independent second review.
- Application acceptance added ten calls, including actual historical recall through the existing planner/narrator and recap recovery. One private-summary output failed validation, leaving coverage unchanged. Tightening the schema to nonempty, allowed source/version selections and explicitly retrying recovered it.
- Combined **36 generation requests: 35 validated successes, one rejected output; 59,679 input and 12,879 output tokens** including known rejected-output usage. Conservative uncached estimate **$1.24**, latency **2.39–24.18 seconds**, mean **8.65 seconds** per request. Within the authorized 48-request/$15 envelope. Full case/results/limitations are in PHASE3_EVALUATION.md; successful schema validation alone was not counted as quality acceptance.

### Browser verification actually performed

- Exercised END, preparing/ready/failure/retry, saved resume metadata, Sessions history, Continue with an unresolved action, and Continue to the next session. Reopened the same server-recorded **6 + 3 = 9** failed forage roll and explicitly confirmed it. Only completing the action charged its one hour; starting the next session charged nothing and preserved HP/items.
- After Continue, a real Game question recalled Nera's old unresolved brass-compass promise accurately. Separately rebuilt the corrected second-campaign recap, then continued without changing its HP/time or the other campaign.
- Inspected desktop, 390px and 320px layouts, English/Russian Game/Sessions and persistent language selection, including refresh. Narrow pages had no horizontal overflow. Restored English and the normal viewport. Owner-authored text and extractive quotations retain their original language.
- Physical iPhone/Safari and the optional Phase 1 conflict-rebase confirmation were **not** tested and remain disclosed non-blocking limitations from earlier owner approvals.

## Phase 3 key decisions and known limitations

One Supabase backend, existing authoritative mechanics and one gameplay DM remain. Source/version references and positive knowledge checks precede ranking; exact state and manual corrections outrank summaries. Jobs publish coverage atomically and never rebuild from summaries alone. No private error details or source IDs appear in public failure messages.

The 64,000 application input cap is intentionally smaller than Astra's context window. Each lifecycle request processes at most four jobs; preflight at most two. Polling does not generate. A fresh explicit retry can recover an exhausted attempt window, while duplicate operation IDs cannot reset an active lease. Long backlogs may require another explicit continuation. Complete paragraphs are preserved; an indivisible source exceeding 24,000 UTF-8 bytes pauses safely. These are bounded, inspectable memory aids, not a guarantee of perfect recall.

Physical iPhone/Safari and the optional Phase 1 conflict-rebase confirmation remain unverified. Quality results are a finite synthetic sample reviewed by the lead. No hosted deployment, real campaign acceptance, semantic/embedding retrieval, Save/Load or timeline restoration is claimed. Session continuation uses current authoritative state; it is not historical rollback.

## Phase 3 remaining work and recommended next step

No required Phase 3 implementation, verification or owner-acceptance gate remains open. **Explicit owner acceptance is recorded at `ca4499bc279d37eb52c0a36b0524eb19322071b0`.** Open http://127.0.0.1:3000/campaigns and follow PHASE3_SETUP.md using the existing synthetic owner account; keep Docker Desktop and the development server running. No new key, provider or manual configuration is needed for this prepared local environment.

The complete queued Phase 3.5 Save/Load/Timeline Fork brief and the dedicated **Saves / Сохранения** navigation requirement are recorded in PHASE3_5_BRIEF.md, MASTER_SPEC §42 and DEVELOPMENT_PLAN. The future screen will have Save Games and Timelines tabs, desktop placement after Sessions, and mobile access through More. This is documentation only. Phase 3 owner acceptance is now recorded; separate Phase 3.5 authorization is still required before implementation. Stop here; do not deploy, import real material or begin another phase.

## Accepted Phase 2 checkpoint (historical)

The following Phase 2 sections preserve the accepted checkpoint and its verification. Their next-phase prohibition applied until the new Phase 3 authorization recorded above.


**PHASE 2 OWNER-APPROVED.** The owner explicitly accepted Phase 2 at commit `24fcd405b65b7ddd281837e491f1975e1fe3a765` on September 18, 2026. This acceptance is distinct from the implementation and verification results recorded below. The disclosed non-blocking limitations remain unchanged, including physical iPhone/Safari and the optional Phase 1 conflict-rebase confirmation, which remain unverified. Phase 1 remains owner-approved at `a0c7a815b413251df45a961af8c77986975e546f`, recorded in `1a4fee6cc7e3827a51749e23fe1b00a7eee78b1a`. Phase 3 has not begun and is not authorized. Deployment and real campaign/DM-private imports remain prohibited.

## Phase 2 current status and completed work

- All three development workers acknowledged PHASE2_CONTRACTS.md and the lead's shared DTOs before GO, used separate worktrees/branches, and did not push. The lead integrated runtime/database, mechanics and UI in that order. Only the database worker changed supabase/**. These were development workers; the application has one primary DM runtime.
- Owner-authorized APIs connect persistent Game, OOC, companion conversations and separate Chat with DM to the server-side runtime. Strict planning/output schemas, public-only narration and allow-listed errors keep private planning and raw provider payloads out of browser responses.
- Durable accepted input, operation/check IDs, fenced leases, saved plans/results and transactional consequences survive failure and retry. Duplicate operations return their recorded result; stale state/settings/document revisions reject old proposals. Dice use server randomness; animation never generates a new roll. Explicit rerolls enforce the campaign allowance.
- The explicit console-basic-v1 house profile enforces supported checks/combat budgets, enemy HP/damage scaling, defeat policies, items/resources, quests/locations, camp/rest supplies and recovery, remote storage/cargo access, meal/coffee preparation and consumption, effects and the component-aware spear transformation. Unsupported mechanics fail closed. Manual corrections and isolated Phase 0 previews remain available.
- Feedback proposes guidance without automatically applying it. Session approval and immutable campaign-guide versions reuse existing document infrastructure, revision checks and retry receipts. Session guidance expires with its session; ordinary gameplay receives approved guidance rather than the entire feedback conversation.
- The owner-selected baseline is gpt-6-astra with xhigh reasoning. Explicit server configuration, bounded context and strict Responses output remain in place. No automatic fallback or switching. The earlier configuration-only change was verified against official OpenAI documentation before editing; live verification is recorded separately below.
- Acceptance review identified missing context needed to reliably plan the supported rules and narrate exact results. Planning now receives centralized profile constants, check/action pairings and historical settings pinned by active rests/encounters. Narration receives an allow-listed projection of validated public after-values, including effect and turn-budget changes. Missing pinned settings pause safely. Raw resolutions, hidden checks and private patches remain excluded. Four new context regressions cover these boundaries.
- Safe provider diagnostics now record HTTP status and known error codes/types only, never arbitrary error messages. Added the bounded opt-in live harness and fresh-fixture privacy checks. Corrected two Russian system labels without translating owner-authored narration or changing the visual design.

## Phase 2 files / areas changed

Integrated implementation: PHASE2_CONTRACTS.md; shared DTOs/context/schema/mechanics/turn modules in src/lib/gameplay/; server-only src/lib/server/dm/ and gameplay service; campaign play/turn/resume/guidance routes; additive migration 202609180004_phase2_runtime.sql; Game/Chat/Camp/actions/configuration UI and existing Party/Inventory/Settings integration; gameplay.css; EN/RU strings; tests and synthetic acceptance scripts; specification/plan/setup/status documentation.

The live-acceptance follow-up at `24fcd405b65b7ddd281837e491f1975e1fe3a765` changed the context builder, provider diagnostics, focused regressions, combat system-label localization, scripts/gameplay-live-acceptance.mjs, scripts/gameplay-access-acceptance.mjs, locale documentation, PHASE2_CONTRACTS.md, PHASE2_SETUP.md and this status file. No new migration or mechanic was introduced. Local environment, credentials, reports, logs and backups remain ignored.

This owner-acceptance follow-up changes **only DEV_STATUS.md** to record approval of that exact checkpoint. No application code, configuration, migrations, runtime or campaign data changed.

## Phase 2 tests and build status

The results below belong to the owner-approved implementation checkpoint `24fcd405b65b7ddd281837e491f1975e1fe3a765`. Tests, typecheck, lint, build and live API checks were not rerun for this status-only acceptance record; its diff was checked and restricted to DEV_STATUS.md.

### Automated local verification

- After live/browser checks: Next route type generation, TypeScript, full ESLint and the normal Turbopack production build **passed**. No lint warnings.
- Final full suite: **218 total, 217 passed, 1 explicitly skipped, 0 failed**. The skipped test is the opt-in Phase 1 empty-database integration/seed test; it passed at the accepted Phase 1 checkpoint and must not reseed these populated fixtures. Current real Supabase checks are separate below.
- The suite covers output/patch validation, owner/campaign boundaries, turn serialization and lease recovery, duplicate/reconnect/retry, stable dice, explicit rerolls, hidden/DC filtering, stale corrections/settings, required/discretionary checks, inventory/resources, encounters/rest/storage/effects/transformation, guidance approval/scope/version conflicts, bounded context/oversize and drafts/localization.
- Embedded PostgreSQL integration executes all four migrations with synthetic Auth and scripted provider responses through the production turn engine/RPC adapter. A separate 26-operation deterministic mechanics journey reloads serialized state between actions. Neither is described as live OpenAI verification.
- Final checks exposed a flaky privacy assertion that searched random UUID text for the letters 'dc'. It now checks actual field names; the exact expected public object assertion remains. An unexpected untracked root loading.tsx made redirects/404s stream with HTTP 200. Its contents were preserved in an ignored local backup and it was removed from routing. Original redirect/404 assertions were retained and passed. The **19 route/HTML tests also passed against the final production server**.

### Real disposable local Supabase / application verification

- Preserved the populated Phase 1 database and its two accounts/one authorized owner. At integration checkpoint 8178509, a local backup preceded additive migration 004; no reset/destructive reseed occurred. Auth/Postgres/REST remain local. Service credentials were configured directly in ignored environment files without exposing them.
- At that integration checkpoint, scripts/gameplay-app-acceptance.mjs passed **all 8 groups** against real Auth/database/application APIs: owner/non-owner/anonymous/origin restrictions, persisted mechanics, duplicate/concurrent protection, stale correction, campaign isolation, rest/recipes/effects, consumed-source preservation, quest/location consequences and logout/relogin. These checks did not call OpenAI.
- The live acceptance harness appended a fresh Glass Orchard / Quiet Comet synthetic pair, preserving earlier fixtures. Final verification passed for **26 committed operations**, exact saved input/status/results, duplicate submissions of all 26 operations without new generations, logout/relogin durability and unrelated-campaign isolation. The initial failed-operation verification separately passed before billing was fixed: no narration, dice, state revision or gameplay consequence committed, and exact input survived relogin.
- Guidance verification passed: explicit session approval, separate campaign approval, a manual guide edit and restoration of an older version as a new **fourth version**, preserving all originals. Proposals did not automatically edit the guide; approvals/manual version operations did not change HP, inventory, quests, scenes, time or other gameplay state.
- Final scripts/gameplay-access-acceptance.mjs --live passed against both development and the final production application. Real PostgREST denied anonymous, ordinary owner and non-owner direct access to the service-only runtime RPC/private schema. **30** normal owner campaign/play/turn responses contained no synthetic private canary, operational checkpoint or server credential. All **20** production client JavaScript files contained no private canary or server credential names/values. Only synthetic private markers were used.
- The temporary production verification server was stopped. The development preview remains at **http://127.0.0.1:3000/campaigns**, using local Supabase.

### Browser verification actually performed

- Inspected desktop, 390px and 320px layouts, including Game, Russian Game/settings, Camp, companion controls and Chat with DM. Checked narrow pages had no horizontal overflow. Saved Russian, refreshed to verify translated persistent controls, then restored the owner's English preference. Saved narration remains in its campaign language.
- Earlier unconfigured-provider checks verified exact input/draft survival across navigation/refresh, retry of the same accepted action, cancellation without draft loss, isolated feedback errors and no fabricated narration/rolls.
- During live acceptance, **Resume this turn** recovered a rate-limited camp action using the same operation. Entering camp granted no early healing, supplies or time. Persistent records reflected later explicit recovery and charges.
- Opened the actual interactive dice result: server-recorded 1 + 4 = 5 for the failed forage check. Replayed, refreshed and reopened it with the same result, then clicked **Continue with this result**. Narration followed the resolved failure; read-only API checks confirmed stable check IDs/results.
- In Chat with DM, clicked **This session** and **Save for this campaign** on separate real proposals. Manually saved a guide edit, opened version history and restored the older version as a new version. The mobile feedback/guide screen was also inspected at 320px.
- Companion knowledge/future-plan behavior and the Russian second-campaign action were verified against actual live responses and persisted public snapshots. Not every live turn was individually exercised through browser controls; the bounded harness uses the same authorized application API.

### Live OpenAI verification: passed, bounded synthetic sample

**26 committed turns:** 25 in Glass Orchard and one additional Russian-language action in unrelated Quiet Comet. The sequence used natural-language owner input through the production planner/narrator, not scripted provider results. It covered observation, one healing item, a focus expenditure, a future intention, companion knowledge/acknowledgment, camp/meal/coffee/rest, stash access/refusal, server-rolled forage and transformation, an encounter with player and private NPC attacks, negotiation, exact-state continuity, quest archival, two feedback proposals and a post-approval turn.

Persisted results matched the expected code-enforced consequences: HP recovered only as authorized; focus and consumables remained spent; meal/coffee waited for rest completion; a spear retained component provenance; a blocked withdrawal changed nothing; negotiation granted no healing/refund; the stated intention never became an accomplished fact. Private NPC roll details stayed absent. The Russian action changed only its own location/quest; the first campaign stayed unchanged. Review of all sampled public narration found no material state contradiction or synthetic private marker disclosure.

**Actual model:** every successful response reported gpt-6-astra; configured reasoning was xhigh throughout. **54 generation requests total: 53 application requests (49 successful, 4 failed) plus one earlier tiny diagnostic request that failed with insufficient_quota.** The 49 successful responses comprise 24 planning, 23 narration and 2 feedback responses. A separate non-generation model-access GET returned HTTP 200.

Before billing was fixed, the application had two failed attempts on the first operation (the first lacked an HTTP diagnostic; the next returned 429); the separate diagnostic established insufficient_quota. After billing, two temporary rate_limit_exceeded responses occurred, one in planning and one in narration. Explicit resumes reused saved operation identity and recovered successfully. No automatic retries, rerolls, model fallback or settings reduction occurred.

**Reported successful usage: 427,975 input tokens and 26,479 output tokens.** Using the verified [Astra standard prices](https://developers.openai.com/api/docs/models/gpt-6-astra) of $10/M input and $50/M output gives approximately **$5.60 before input caching discounts**. This is an uncached estimate for reported successful usage, not a billing receipt; cached-token breakdown and failed-request usage/cost were unavailable. Successful per-request latency ranged from **5.75 to 25.95 seconds**, median **10.37 seconds**; a gameplay turn normally needs both planning and narration. The existing 4,096 total output/reasoning reserve and 60-second request timeout were sufficient for this sample.

## Phase 2 key decisions and known limitations

- One DM runtime with private planning and public-only narration; the browser never receives raw provider/private planning data. External calls run outside transactions; fenced commits revalidate the campaign revision. The server remains authoritative for mechanics.
- Astra/xhigh is explicitly selected. Supported alternatives remain owner choices; there is no automatic switching. Strict Responses schemas, store:false, bounded requests and content-free diagnostics remain.
- Context conservatively counts serialized UTF-8 bytes plus framing/schema against explicit input/output/safety budgets and a 64,000 input cap. At most 32 complete exchanges are admitted. Missing essential history or oversized mandatory sources pause rather than silently truncating/inventing continuity. No automatic summaries, compaction, retrieval, embeddings or guarantee for arbitrarily long campaigns.
- The small console-basic-v1 house profile is not official D&D or an automatic rules-document interpreter. Rest/encounter settings are pinned when they begin; changes are prospective. Existing inert records are reused.
- Live acceptance is a finite synthetic sample, not a general model-quality guarantee. The post-approval response was compatible with the approved style and context tests verify guidance inclusion, but this does not establish causal style adherence across future responses. OpenAI availability, quota and rate limits remain external constraints; retry preserves the recorded operation.
- **Physical iPhone/Safari and the optional Phase 1 conflict-rebase confirmation remain non-blocking unverified items.** Desktop-browser mobile widths do not verify physical Safari. No hosted environment, deployment or real campaign/private data was tested or imported.

## Phase 2 remaining work and recommended next step

No required Phase 2 implementation or acceptance gate remains open. **Explicit owner acceptance is recorded at `24fcd405b65b7ddd281837e491f1975e1fe3a765`.** The known limitations above remain disclosed; acceptance does not claim additional verification. Await separate owner authorization before starting any next phase.

Stop after recording and pushing this acceptance. Do not begin Phase 3, deploy or import real campaign/DM-private material.

## Approved Phase 0 checkpoint

The owner explicitly approved **96b69dcd63d2fa015f5e75bcc5d632c41e04369e**. It remains unchanged in Git as the approved restore point.

- **Original implementation verification:** typecheck, lint, production build and 60 automated tests, plus the implementation browser checks recorded in the historical VERIFICATION.md.
- **Independent review reported by the owner:** typecheck, lint, production build, 41 logic/localization tests, 5 HTTP tests and 14 additional HTML/status route checks passed. Independent visual and image-asset verification was **not performed**. Physical iPhone/Safari remains unverified. These records are distinct.

## Accepted Phase 1 status (historical checkpoint)

All Phase 1 subsections below describe that accepted checkpoint, not the current Phase 2 implementation. In particular, their disabled-gameplay/no-service-key statements were true at Phase 1 and are superseded by the explicit Phase 2 record above.

Remote documentation commits through f46014d were safely merged; section 38 remains intact. Our persistence and Chat with DM additions are sections 39 and 40. Only ordered source records and immutable correction-history foundations are added now; no memory runtime is implemented.

**The owner explicitly accepted Phase 1 at commit `a0c7a815b413251df45a961af8c77986975e546f`.** This is owner approval of that implementation checkpoint, separate from the verification results below. The required local database, application HTTP and browser acceptance checks passed on September 18, 2026 UTC (September 17 locally). Physical iPhone/Safari and the optional conflict-rebase confirmation action remain disclosed, non-blocking unverified items; acceptance does not claim they were tested. At that acceptance checkpoint Phase 2 was not yet authorized; its subsequent authorization is recorded above. Deployment, real campaign imports and real DM-private imports remain prohibited.

Three implementation workers used separate worktrees and agreed shared contracts before implementation; the lead integrated their work. The queued Chat with DM addition joined the campaigns/documents workstream, with an additive migration from the sole database owner. This acceptance follow-up preserves that implementation and the approved Phase 0 checkpoint.

Disposable local Supabase is running on WSL 2.7.14 and Docker Desktop 4.91.0 / Engine 29.8.0. The official CLI 2.117.0 release checksum was verified. All three committed migrations applied to the initially empty database. After the owner selected Docker Desktop's localhost-only publishing option, Docker mappings and Windows listeners were verified on loopback before accounts were created. Exactly two synthetic Auth users and exactly one owner-registry row exist. The two campaigns are **Synthetic · Tidal Observatory** and **Synthetic · Copper Orchard**. Only synthetic private canaries were inserted through trusted local SQL for leakage checks. No deployment, real campaign import or real DM-private import occurred.

Two acceptance blockers were reproduced and fixed narrowly: the local Supabase email provider was disabled alongside public signup, and Next proxy normalization changed `127.0.0.1` to `localhost` before the strict origin check. Email/password login is now enabled while global public signup remains disabled; the proxy preserves the original URL. Real tests verify both owner login and rejection of signup, non-owner access and foreign-origin writes. No origin check was relaxed.

## Queued section 38 coordination checkpoint

- **Documentation incorporated:** fetched origin/main and confirmed `d5b2771`, `24443b7` and `f46014d` are ancestors of the integrated branch, merged in `2f85834`. Section 38 matches the remote text verbatim. Its milestone 1–3 requirements and the separate Chat with DM refinement are retained. This follow-up does not restart implementation or duplicate the merge.
- **Foundations implemented and verified:** existing campaign/entity UUIDs and operation request IDs; database-assigned scene/feedback ordering; immutable document/settings versions; revision-checked state corrections; public/private access boundaries; and immutable original/correction receipts linking campaign, operation, source record and resulting revision. Migration 003 was supplied by the existing database/migrations owner and integrated in `04c6c73`. Scene ordering survives corrections, and document restoration appends a version. SQL tests cover tied timestamps, source relationships, retries, original-record preservation and populated-database migration. This is embedded PostgreSQL verification with synthetic auth, not live Supabase verification.
- **Runtime features deferred:** Phase 2 context assembly/token budgeting and live DM behavior; Phase 3 automatic summaries, historical/semantic retrieval and correction-driven derived-memory rebuilding. No embeddings, new memory service or memory UI were added. Section 38's long-campaign, compaction, retrieval-quality and model-quality gates remain future acceptance requirements, not Phase 1 results or additional work.

## Completed work

- Owner-authenticated server APIs, verified cookie sessions, owner-only RLS, separate private schema, campaign-scoped references, bounded same-origin writes and safe public errors.
- Campaigns, independent application/campaign settings, immutable document/settings history, atomic idempotent manual corrections and stale-revision conflicts.
- Generic character/companion/NPC records, storage/items/equipment, sessions/public scenes/resume state, quest/location/asset metadata screens.
- Chat with DM owner messages and reference-only DM Guide reuse the existing save/version/restore infrastructure; no fake replies, automatic guide edits or runtime application.
- Approved Phase 0 demonstrations remain isolated under `/preview`. Persistent screens use actual campaign data without sample fallbacks. Gameplay stays disabled.
- Three migrations include stable public source ordering and immutable private correction receipts. Remote memory requirements remain documented; no summaries, retrieval or memory UI were implemented.
- Setup instructions and opt-in non-destructive two-campaign synthetic verification. START_HERE reflects selectable media providers/models and required owner-access verification before separately approved deployment.

## Files / areas changed

`supabase/`, `src/lib/server/`, `src/lib/persistence/`, owner-only API routes, persistence providers/shell/forms, campaign route integration, English/Russian catalog, isolated preview routing, focused tests, setup/contract/spec/plan/status documentation and dependencies.

The verification follow-up at `a0c7a8` changed only `next.config.ts`, local `supabase/config.toml`, the live integration regression, the new `scripts/persistence-app-acceptance.mjs`, local-tooling ignores, and setup/status documentation. It introduced no migration, feature, AI behavior or visual refactoring. Credentials, CLI binaries, logs and disposable configuration remain ignored locally.

This owner-acceptance follow-up changes **only `DEV_STATUS.md`** to record approval of the exact checkpoint above. No application code, configuration, migrations, runtime or campaign data changed.

## Tests and build status

The results below belong to the approved implementation checkpoint. Tests, typecheck, lint and build were not rerun for this status-only acceptance record; its diff was checked and restricted to `DEV_STATUS.md`.

### Automated local checks

- Final type generation, TypeScript check, full ESLint and production build **passed**, rerun after live/browser verification. No lint warnings.
- Ordinary suite: **122 total, 121 passed, 1 explicitly skipped, 0 failed**. It passed against both development and production servers; the final development rerun passed again after browser acceptance. The skipped test is deliberately opt-in and was executed separately below, not silently counted as a pass in this invocation.
- Embedded PostgreSQL tests execute all three migrations with synthetic auth roles: durable reopen, two campaigns, owner/non-owner/anonymous access, immutable document/guide history, revision conflicts/retries, inventory integrity, feedback isolation, ordering and preserved original/correction receipts. These remain distinct from real Auth verification.

### Live disposable Supabase and application HTTP

- Opt-in `tests/persistence-database-supabase.test.mjs`: **1 passed, 0 failed, 0 skipped** against real local Supabase Auth/PostgREST after the provider fix. Public signup is explicitly rejected. All three migration versions and the two-user/one-owner counts were checked directly. Do not rerun its seed step on these populated fixtures; it correctly refuses a nonempty database.
- New application acceptance script: **all 9 groups passed against development on port 3000 and production on port 3001**. Real cookie login/logout/relogin, anonymous and independently authenticated non-owner denial, cross-campaign references/history denial, immutable restore, stale-write conflicts, independent settings, manual character/inventory/session/scene corrections, retry-safe DM feedback, guide separation and persisted relogin snapshots passed.
- Before/after snapshots prove sending feedback changes only its feedback collection: HP, inventory, quests, scenes, public state/time/canon, settings and guide remain unchanged; the other campaign remains unchanged. Unsupported dice/combat/rest/DM-reply/private operations and foreign-origin writes are rejected.
- Synthetic private canaries were absent from every checked public HTTP response and all 20 production JavaScript chunks. Normal authenticated/anonymous private-schema access is denied. No service-role key is in the app environment; no environment or credential file is tracked.

### Browser acceptance

- Real owner sign-in, sign-out and sign-in again passed. Both unrelated campaigns retain distinct characters, places, inventories and campaign languages. The second campaign has no messages or guidance from the first.
- Two Library tabs loaded the same revision: the first saved, the second received a conflict, and its full unsaved draft remained intact. Refreshing saved data presented the newer comparison without replacing that draft. Document history/restoration in the other tab appended a new version and retained older versions.
- Stopping only the local REST service produced a genuine feedback-save error. The complete typed draft remained. Restarting the service and retrying saved it with a timestamp; refresh and relogin retained it. No fake DM reply appeared and sending feedback did not modify the guide.
- Manually saved two DM Guide versions, viewed their history and restored the older as a new current version. The restored text and feedback survived refresh and relogin.
- Manually corrected inventory quantity in the Russian 320px interface; refresh retained the new quantity. Character HP, session recap and manually corrected scene records saved by the HTTP checks were visible in the browser.
- Saved Russian globally, refreshed and signed out/in: Russian returned. Saved English again and loaded it on the narrow-screen settings page. Campaign story languages remained independent. Inspected desktop and 390px/320px screenshots and menu/form interactions with no horizontal page overflow. The mobile inventory dialog scrolls within the screen.
- Game's execution controls remain disabled; only manual records and the separate Phase 0 demonstrations are available.

### Not claimed

Physical iPhone/Safari was not tested. An additional **Keep my draft for the next revision** native confirmation stalled browser automation; completing that optional rebase confirmation remains unverified. This does not negate the observed stale-save rejection and exact draft preservation above. The owner was asked to cancel the synthetic confirmation if visible. No deployment, hosted Supabase verification, live AI, gameplay execution or real-data acceptance is claimed.

## Key technical decisions

One Supabase backend; no browser database client, service key, AI or second runtime. Every public read has an explicit projection. Writes use one allow-listed transactional RPC with expected revisions and stable retry IDs; direct table writes are denied. Document restore appends a version; scene settings revisions never change when preferences change. The private schema has no ordinary application reader. PGlite is development-only SQL verification.

Feedback is append-only, campaign-scoped owner text. The DM Guide is a stable linked reference document using the same immutable history, not established canon. Approved guidance is not applied until a separately authorized Phase 2 runtime exists. Future companion/rest/recipe/combat structures remain inert.

## Known issues

Physical iPhone/Safari and the optional conflict-rebase confirmation action remain unverified and non-blocking for the owner's explicit Phase 1 acceptance. The optional Supabase Vector **log collector** restart-looped on this Windows host and is excluded from the local stack; required Auth/Postgres/REST services are healthy. This collector is unrelated to embedding/vector-search features, which remain unimplemented. A saved Russian preference is loaded after initial page hydration, so a brief English loading render can occur on refresh; the saved preference then appears correctly.

NPC records are supported, but NPC equipment is unavailable in Phase 1; equipment supports players, companions and appropriate transports/mounts. Asset uploads/media generation and gameplay execution are outside this phase. Preexisting history receives deterministic sequence backfill; unknown old commit order is not reconstructed. No secrets or real campaign material are seeded.

## Remaining work

No required Phase 1 acceptance work remains. The owner has explicitly accepted the implementation with the two non-blocking unverified items preserved above. Stop after recording acceptance; do not reset or replace the synthetic fixtures, import real campaign or real DM-private material, deploy, or start Phase 2. Acceptance does not itself authorize any next phase.

## Recommended next step

Await a separate owner instruction. No further implementation or setup is requested by this acceptance. The following local access instructions remain available for optional inspection of the accepted synthetic environment.

Keep Docker Desktop and the port-3000 development server running. Open **http://127.0.0.1:3000/campaigns**. The browser is signed in to the synthetic owner; if sign-in is requested, use the ignored local `test-results/LOCAL_TEST_LOGIN.txt` file directly in the application, never in chat. The temporary production verification server on port 3001 was stopped after its checks.

For optional inspection: open each synthetic campaign and compare its records; in **Chat with DM / Чат с DM**, refresh the saved feedback and restored guide; in **Library**, open version history; in **General Settings**, save either interface language and refresh. Sign out/in once if desired. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for the full repeatable procedure. If the older synthetic Library tab has a native draft-confirmation prompt, cancel it before continuing.

The approved visual preview remains separately isolated at **http://127.0.0.1:3000/preview/campaigns/long-road-west/game**. The configured persistent application starts at **http://127.0.0.1:3000/**. No sample campaign is imported into its database.

---

## Historical remote documentation handoff — September 18, 2026

The owner reports having sent Phase 0 approval and the Phase 1 multi-agent implementation prompt to the local development Codex. The implementation status below records the last published Phase 0 checkpoint, not a verification of the local Phase 1 work. Do not interpret its historical approval-pending/stop statements as revoking the owner's subsequent authorization.

Added MASTER_SPEC section 38 and aligned DEVELOPMENT_PLAN milestones 1–3: exact state versus derived memory, source/visibility/revision tracking, model-specific context budgets, bounded retrieval, validated summary/checkpoint lifecycle, corrections/invalidation, idempotent turn/resume behavior, failure recovery and measurable synthetic acceptance gates. These are requirements, not implemented features or guarantees of perfect recall.

This update changes documentation only; no application code, migrations, dependencies, runtime, credentials or campaign data were changed. Tests/typecheck/lint/build were not rerun for this update. Earlier verification results below remain historical.

For the active lead integrator: fetch and safely merge these remote documentation changes at the next safe checkpoint; preserve local work, including the separately requested Chat with DM refinement. Coordinate overlapping documentation edits. Continue authorized Phase 1; incorporate only its memory foundations now. Phase 2/3 runtime work remains deferred until separately authorized.

---
