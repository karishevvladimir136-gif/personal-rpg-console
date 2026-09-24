# DEVELOPMENT PLAN
## Personal RPG Console

**Current bounded Mega DM v1 completion:** Cognitive/Living World Craft, a compact server-private Character Model, optional emotional style and development-only afterglow/character review fixtures are implemented on an isolated candidate branch. Complete deterministic verification and separately authorized live quality review precede final Mega DM v1 owner acceptance. D2B remains next only after that acceptance; no D2B work is authorized by this entry. See [Cognitive DM Craft](COGNITIVE_DM_CRAFT_RESEARCH.md), [Living Characters](LIVING_CHARACTERS_BRIEF.md) and [Positive Afterglow](POSITIVE_AFTERGLOW_BRIEF.md). Historical planning notes below remain historical.

**Current boundary:** The owner-approved source-of-truth integration includes the complete roadmap `a3d0fa66da42f36a5401c3513e3484e83150f9d3` on production base `cb7f6be2fb513de13604d381046a3240f3261383`. Phases 0–3.5 are owner-accepted. [Phase 3.75 final owner decision](PHASE375_ARCHITECTURE_DECISION.md) remains fixed. [Phase 3.8B final freeze](PHASE38B_ARCHITECTURE_FREEZE.md) is **ARCHITECTURE / CAPABILITY EVIDENCE COMPLETE WITH DOCUMENTED LIMITATIONS**. Integration content is owner-approved at `7d945d3754647015ecdd765cef2b688dbab38777`; this finalization records approval without starting production coding. No feature coding, provider call, credential setup, deployment or real import is authorized here. Historical milestone prompts below are not fresh instructions.

**Current forward order from owner-accepted World Lab D2A:** **Mega DM v1 → D2B → Timeline Explorer V1 → Timeline Explorer V2 → Enter This World → FRAME / Visual Bible + fal → 2D Presentation Engine → VIDEO.** D2B waits until Mega DM v1 is implemented, evaluated and owner-accepted. The earlier pre-production handoff and A–E design sections below remain historical/contextual; they are not the current next-step instruction. This docs-only consolidation starts none of the future slices.

---

## Final planned foundational addendum before production coding

The Progression / Rewards / Challenge Scaling addition is the **final planned foundational product-architecture addendum before the separately scoped production multi-agent coding sprint**, unless implementation reveals a genuine architectural blocker. No coding or multi-agent work starts in this documentation task. Do not begin another broad product research/design cycle.

Phase 3.8B capability evidence and its architecture freeze are complete with documented limitations. Source-of-truth reconciliation is complete and owner-approved. **Broad product research/design is closed** unless implementation reveals a genuine architectural blocker. The next phase is the **Production Multi-Agent Coding Sprint**, with bounded scope in a fresh project task. No additional Phase 3.8B experiment, chest recovery or fal retry is planned. Preserve the DM Craft sequence and all experiment acceptance boundaries.

## Production Multi-Agent Coding Sprint — handoff only

This records intended development workstreams, not feature implementation or agent dispatch. Natural-language gameplay still uses one primary DM runtime. Establish shared contracts before broad parallel implementation and preserve the existing A–E and media/presentation sequencing below; team roles are not replacement milestones.

| Workstream | Initial responsibility |
| --- | --- |
| Lead / Integrator | Establish and version shared contracts first; scope work, assign file ownership, coordinate migrations, integrate and verify changes |
| World Engine | Implement the approved Actors / Threads / Events / Hooks and world-state slices within lead-owned contracts |
| World Library / Packs / Rulesets | Implement approved source ingestion, Canon Compiler, pack and ruleset slices with shared identity/provenance boundaries |
| Runtime / Memory / Saves integration | Reuse accepted DM, memory, persistence and timeline systems; integrate new state without competing authority or rollback systems |
| QA / Security / Recovery | Independently verify isolation, privacy, authority, migration/save compatibility, deterministic failure/recovery and scoped acceptance |

Parallel workers must **not independently mutate database migrations, core event schemas, save/timeline schemas, shared authority contracts or canonical entity identity contracts**. The Lead/Integrator resolves proposed changes to those shared contracts before dependent work proceeds. Use separately owned files/worktrees and controlled integration; passing worker checks do not replace integrated verification. No team is started by this documentation task.

# MILESTONE 0 — UI SHELL

Goal:
A clickable application that looks and feels correct before any backend complexity.

Build:
- global shell
- campaigns
- game
- character/inventory
- journal/evidence
- map
- library
- session recap
- settings
- responsive mobile

Use fake data only.

Owner-requested Phase 0 refinement (MASTER_SPEC section 33):
- dedicated **Campaign settings → Rules & Play Style** tab, separate from application preferences
- Easy / Medium / Hard / Custom and expandable Advanced difficulty controls; explicit centralized provisional values, independent HP/damage, conditional limited-reroll allowance, defeat, recovery, and scarcity
- respect the campaign's rules-system capabilities; unsupported mechanics are unavailable
- independent Story Structure, Player Role, and World Autonomy controls with explanations and agency guarantees
- defaults: Medium / Balanced / One of many / Moderate
- keep structured settings/presets separate from presentation; use campaign-scoped in-memory state across screen navigation, reset on refresh
- English and Russian labels, responsive desktop/mobile layout, clear preview/no-gameplay-effect notice
- no migrations, API routes, persistence, authentication, AI, or simulation engine

Final Phase 0 checks/dice refinement (MASTER_SPEC section 35):
- extend campaign Rules & Play Style with independent Check Frequency (Narrative / Balanced / Full RPG; Balanced default), Dice Presentation (Hidden / Key Rolls / All Player Rolls; Key Rolls default), Interactive Dice (On), and Show DC (Off)
- Hidden disables the last two controls without discarding preferences; never expose private checks or private DCs, or hint that a private check occurred
- frequency does not change difficulty or select Custom; Full RPG excludes trivial guaranteed, impossible, and repeated unchanged attempts
- reusable original HTML/CSS/inline-SVG d20 demo from Game and Settings, using fixed success/failure/advantage/disadvantage samples and important/non-important checks
- neutral waiting state, modifiers, permitted DC, guarded short animation, result breakdown, final announcement, and explicit sample-animation replay; no campaign effects or allowance consumption
- honor Hidden, compact automatic, and interactive presentation modes; accessible modal, reduced motion, timer cleanup, shared temporary state, both languages, desktop/390px/320px layouts
- test presentation/setting independence, DC policy, fixture arithmetic, kept dice, double activation, cancellation/reopen, and translations; distinguish automated coverage from browser/physical-device checks

Consolidated Phase 0 refinement (MASTER_SPEC section 36):
- separate main menu / campaign selection / URL-scoped campaign navigation, honest Exit, unknown-ID 404s and legacy redirects; preserve concept isolation
- split global interface/reading preferences from campaign story language, narrative/rules/play style, and visual settings
- replace primary inventory tables with reusable icon grids and shared item details; storage views, translated search/category filters, player/companion paper dolls and configurable transport profiles
- one campaign-scoped model for item identity, ownership, storage, and equipment; retain Old Ford without inventing mounts; respect absent companions and unestablished anatomy
- Party/Camp free-text conversation preview with stored sample exchange and temporary campaign/companion messages
- Game Rest → compact Short Rest / dedicated warm Camp; explicit demo entry/eligibility/leave/complete; separate short/long supply costs including zero select Custom independently of Recovery
- remote deposit preview from accessible inventories; stash inspect always, withdraw/use/equip only during active long-rest camp; cargo proximity remains independent
- small optional grilled meal/stew/coffee samples with accessible ingredients, quantities, recipients, provisional effects, insufficient state, and shared Talk over food/drink
- honest item-image entry and local demo states only; no provider, persistence, engine, resource mutations, or actual effects
- retain all existing difficulty/narrative/check/dice behavior; bilingual desktop/390px/320px and keyboard/dialog/reduced-motion verification

Final Phase 0 Combat View refinement (MASTER_SPEC section 37):
- Game-only Preview Combat entry/exit/reset and visible synthetic indicator; no new navigation tab
- portrait initiative/round, public party inspection distinct from active character, static scene with selectable qualitative-health enemies and positioning labels, public log, active-character action/bonus/reaction/movement budget
- action → eligible target → cost confirmation → existing dice presenter → isolated authored consequence; James/Jinn direct control, explicitly advanced enemy response and party return
- reuse Hidden/Key/All, Interactive and Show DC; Hidden opens no modal, compact needs no roll click, no private checks or targets in client/log; Check Frequency never removes mandatory combat rolls/saves
- literal free-text proposal with labeled sample response, stable pending action IDs and duplicate protection; no campaign mutations, actual rules, persistence, AI or provider calls
- summary of injuries/resources/loot, no automatic healing/rest, demo-only loot; reset/exit/navigation discard encounter
- bilingual desktop/390px/320px, keyboard focus, reduced motion, no-art fallback, mobile party/history switches; isolated lifecycle/idempotency/presentation tests and actual browser results
- future direct party control first; automatic companions and tactical grids remain deferred

Acceptance:
- no broken routes
- desktop matches mockups closely
- mobile usable
- preset application, every Custom transition, and narrative independence covered by tests
- rules-system capability checks, both languages, navigation retention, and refresh defaults verified
- typecheck, lint, tests, and production build pass; actual results recorded in DEV_STATUS.md
- user approves visual direction

Implementation completion does not count as owner approval. The owner subsequently approved Phase 0 at 96b69dcd63d2fa015f5e75bcc5d632c41e04369e and explicitly authorized Phase 1. See DEV_STATUS.md for distinct implementation and independent-review records. This historical checkpoint authorized only Phase 1; the later Phase 2 authorization is recorded under Milestone 2. Deployment remains unauthorized.

Suggested agent prompt:

> Implement Milestone 0 only. Use `/design` as primary reference. Build the full static UI shell with mock data. No database, auth or AI. Run typecheck/lint/build. Give me a preview.

---

# MILESTONE 1 — PERSISTENCE

Owner authorization: preserve approved Phase 0 commit 96b69dcd63d2fa015f5e75bcc5d632c41e04369e. One lead integrator and three workers agreed PHASE1_CONTRACTS.md before separate-worktree implementation. No Phase 2 or deployment.

Current implementation acceptance also requires:
- one configured owner, verified server sessions, owner-only RLS and campaign-reference constraints; no public signup or private client projection
- explicit atomic manual corrections, immutable document/settings history, expected-revision conflict handling, idempotent retries, preserved failed drafts
- actual campaign identity across persistent screens; two unrelated synthetic test campaigns; approved gameplay demonstrations isolated under /preview
- **Chat with DM / Чат с DM**: separate timestamped persistent owner feedback, no AI replies; explicit Phase 2 notice and saved-versus-applied guidance distinction
- campaign-linked reference **DM Guide**, edited/saved/restored through the same document version system; restore creates a new version; chat sends never update it
- feedback/guide owner and campaign isolation, save-failure retention, and no changes to time, checks, inventory, health, quests, relationships, canon or private disclosure
- separately report SQL/auth-stub tests, real Supabase Auth/REST, and browser cookie/persistence checks; absent Supabase configuration remains an acceptance blocker
- setup documentation and non-destructive disposable synthetic seed; no real/private campaign import, paid provider or deployment

See MASTER_SPEC sections 39–40 for the authoritative added boundaries.

Goal:
Everything the user edits survives refresh.

Build database entities:
- Campaign
- Document
- DocumentVersion
- Character
- NPC
- Session
- Scene
- CampaignState
- Item
- Quest
- Location
- Asset metadata

Add:
- create campaign
- edit docs
- version history
- inventory editing
- session persistence
- one owner login
- persist campaign-scoped encounter participants, turn order, public positioning, system-specific resources and pending actions/status; separate server-private data (section 37); persistence does not activate combat resolution
- persist campaign Rules & Play Style and rules-system capabilities separately from global preferences and document context (MASTER_SPEC section 33)
- validate structured values and record effective settings revisions/history so changes are prospective
- persist scoped equipment entities/profiles, item ownership/storage/equipped slots, conversation records, recipe/effect data, and required rest-stage records from section 36; keep access-dependent operations disabled until authoritative rules exist
- persist the consolidated Checks & Dice campaign preferences, including the saved Interactive Dice/Show DC values while Hidden; keep presentation separate from difficulty and defer resolution to Phase 2

Acceptance:
- refresh loses nothing
- documents version correctly
- two campaigns stay isolated
- private state never appears in normal client data
- campaign rules/play-style choices survive refresh and remain isolated by `campaign_id`
- settings changes never rewrite historical scenes, rolls, or established facts; no AI behavior yet

Suggested prompt:

> Implement Milestone 1 only using Supabase. Add migrations and persistence for the existing UI. Keep DM Private server-only. Seed realistic demo data. No OpenAI yet. Test campaign isolation and document versioning.

Memory foundations (MASTER_SPEC section 38):
- Reuse existing records for stable campaign/entity/operation IDs, ordered source history, document/state revisions and public/private boundaries.
- Preserve originals and correction history; derived summaries must never become the only copy of facts.
- Coordinate adjustments with the active lead integrator; do not restart workers or add AI summarization/retrieval to Phase 1.
- Verify ordered history and source/version/campaign relationships using synthetic data.

---

# MILESTONE 2 — TEXT DM

The owner now explicitly authorizes this milestone after accepting Phase 1 at `a0c7a815b413251df45a961af8c77986975e546f` (acceptance record `1a4fee6cc7e3827a51749e23fe1b00a7eee78b1a`). Preserve that checkpoint. One lead and up to three development workers use separate worktrees, acknowledge [PHASE2_CONTRACTS.md](PHASE2_CONTRACTS.md) before GO, and share one centrally defined contract; only the database owner edits migrations. The product still has exactly one primary DM runtime.

Run full integrated deterministic checks before live OpenAI calls. Complete a synthetic 20–30 turn campaign and report scripted-provider versus real-model results, actual model/call count/usage/failures separately. Missing secure local setup is a disclosed blocker; no production fake replies. Preserve the approved visual direction and English/Russian support. No Phase 3, deployment, media generation, real campaign/private import or large paid evaluation without separate authorization. Stop at PHASE 2 READY FOR OWNER ACCEPTANCE, not owner approval.

Chat with DM contract for this milestone (MASTER_SPEC section 40): use the same primary DM in a separate feedback mode, propose concise guidance, and require explicit owner choice of This session or Save for this campaign. Session guidance expires with the session; campaign guidance remains versioned. Gameplay receives effective approved guidance rather than all feedback messages. Apply only prospectively, respecting code-enforced mechanics, agency, canon and secrecy. Keep brief Game OOC. This behavior was deferred during Phase 1 and is now part of the authorized Phase 2 scope.

Goal:
The app becomes playable.

Build:
- server-side OpenAI DM endpoint
- section 36 companion conversations through the same DM, contextual knowledge/listeners, non-guaranteed trust, public session history, and serialized state-changing Game/conversation turns
- authoritative rest/camp eligibility and lifecycle, explicit completion/recovery/time, no recovery on leave, access closure, and no refresh/direct-route bypass; preserve completed activities, keep hidden interruptions server-only
- code-enforced remote deposits, active-camp-only stash withdrawal/use/equip, independent cargo access, campaign/quantity validation, and atomic/idempotent operations
- optional small recipe system with explicit preparation versus consumption, validated stock/recipients, modest rules-compatible temporary effects, one meal + one drink maximum, replace/refresh not stacking, activation after creating rest and explicit expiry, no duplicate charges or double counting as rest supplies
- structured schema
- dice tool
- player input
- narration
- state patch validation
- inventory/resource updates
- minimal server-validated item transformations through gameplay actions (MASTER_SPEC section 34): consumed ingredients, embedded components, retained tools, provenance, atomic updates, and idempotent retries; no dedicated crafting/alchemy system
- quest updates
- private state updates
- retry/error handling
- authoritative encounter action/target/cost validation, server dice, reactions, validated literal free-text proposals and atomic/idempotent campaign consequences (section 37); support victory/escape/surrender/negotiation/objective completion, without automatic healing/rest
- Check Frequency applies to discretionary situational checks and never removes required attack rolls or saves
- code-enforced, rules-system-aware mechanics for difficulty, reroll limits, recovery, and resource consumption; AI prompts alone must not enforce mechanics
- pass structured narrative guidance and campaign document context to the single DM while preserving canon and player agency
- clarify settings/canon conflicts rather than silently rewriting; changes only affect future play
- advance relevant NPC/faction goals with meaningful events and in-world time according to autonomy, without a background simulator or multiple AI agents
- validate AI-proposed structured checks server-side before resolution; withhold action outcomes until the server produces and records actual dice results
- separate check resolution from animation/presentation; stable check IDs and idempotent resolution prevent extra rolls from double-clicks, retries, navigation, or refresh
- enforce campaign reroll policy in code; private checks/targets remain server-only without UI hints; disclose only permitted player-facing DCs

Acceptance:
- 20–30 turn test campaign works
- HP/resources remain correct
- consumed items stay consumed
- transformation tests cover valid outputs, rules-defined failed-attempt costs, missing/inaccessible inputs, retained tools, embedded components, campaign isolation, atomic rollback, and duplicate/retry protection
- hidden state does not leak
- failure never destroys player input
- tests prove supported mechanics are enforced, unsupported HP assumptions are rejected, narrative axes stay independent, and historical outcomes are unchanged by settings edits
- tests prove check idempotency, authorized reroll limits, no premature outcome narration, no private-check/DC leakage, and correct campaign-specific natural-roll rules

Suggested prompt:

> Implement Milestone 2 only. Add one server-side DM runtime using OpenAI. Use structured output with separate narration, public patches and private patches. Add deterministic dice. Validate patches before persistence. No long-term retrieval yet.

Bounded context and turn reliability (MASTER_SPEC section 38):
- Implement per-model input/output/safety budgets and server-side assembly from current state, approved guidance, selected canon, validated checkpoint and recent complete exchanges.
- Keep required state/input/pending outcomes intact; pause with input preserved when essential context cannot fit. No silent truncation or automatic model switch.
- No automatic long-term summarization/search in this milestone. Missing historical evidence requires explicit clarification or a safe pause.
- Serialize state-changing turns; persist operation identity/status and reuse recorded outcomes on reconnect/retry.
- Acceptance: deterministic budget, oversized-input, stale-revision, retry/reconnect and public/private serialization tests pass. Report live model checks separately.

---

# MILESTONE 3 — LONG-TERM MEMORY

Separately owner-authorized after Phase 2 acceptance at `24fcd405b65b7ddd281837e491f1975e1fe3a765` (acceptance record `ea35b71ad6c95cf63ab40a1a33db4a92041052fc`). Follow PHASE3_CONTRACTS.md. Development workers acknowledged the shared contract before GO; the lead integrates and verifies. The bounded synthetic Astra/xhigh evaluation is authorized up to 48 requests and approximately $15 estimated usage. No deployment or real campaign/private import. Stop for owner acceptance before the queued Phase 3.5 brief can be separately authorized.

Goal:
New sessions feel like the same campaign.

Build:
- END SESSION
- player recap
- private summary
- exact resume point
- snapshots
- document retrieval
- older scene retrieval
- NPC memory retrieval
- canon priority
- conflict checks
- retrieve scoped companion conversations, trust-relevant events, rest/cooking outcomes and item provenance without private/cross-campaign leakage
- effective campaign settings/history included in snapshots and resume without retroactively reinterpreting prior facts

Acceptance:
- Session 2 starts correctly
- old facts can be recovered
- archived canon is ignored
- manual corrections win
- no cross-campaign leakage

Suggested prompt:

> Implement Milestone 3 only. Add session summaries, snapshots and campaign-scoped long-term retrieval. Follow canon priority from MASTER_SPEC. Add tests for cross-campaign leakage and hidden-data leakage.

Detailed implementation and acceptance (MASTER_SPEC section 38):
- Implement source-linked public/private summaries and exact resume checkpoints with atomic coverage watermarks; END SESSION and budget-pressure triggers are bounded/idempotent.
- Retrieve exact entity/state records first, then bounded historical excerpts using campaign/visibility/version filters before ranking. Start with database lookups/text search; semantic retrieval requires measured need.
- Preserve claims, uncertainty, promises, NPC knowledge and source authority; derived text cannot alter exact resources or established state.
- Invalidate stale summaries/indexes/caches immediately on corrections and restrictive visibility changes. Failed jobs retain prior valid memory and uncovered source events.
- Exercise at least 1,000 synthetic events/20 sessions, two isolated campaigns, repeated compaction, old promises, corrected canon, bilingual retrieval, private markers, interrupted jobs and pending-roll resume.
- Evaluate at least 30 labeled retrieval scenarios (>=90% relevant-evidence recall; all critical facts included or safe pause) and 20 continuation/summary cases (>=90% overall rubric pass, zero critical state contradictions/private disclosures in the evaluated suite).
- Record actual model/configuration, token usage, latency, limitations and failures. Paid evaluations need authorization. Deterministic tests do not substitute for narrative-quality evaluation.
- Implementation notes: complete source selections preserve original qualifiers; public/private jobs and coverage are separate. Relevant obligations, positive NPC knowledge and current source versions control retrieval. Exact current records remain authoritative. Supporting work uses bounded requests and explicit retry, with no automatic background simulation or model switching. See PHASE3_SETUP.md and PHASE3_EVALUATION.md; DEV_STATUS.md records actual final gate results.

---

# MILESTONE 3.5 — SAVE / LOAD / TIMELINE FORKS (OWNER-ACCEPTED)

Implementation `8099e0cca1463f767476190c456d4f3947e7c84e` was owner-accepted at `6db58b5e3d464e4a09604ce344424c4fa8ed763e`. Preserve the following original scope/verification requirements as history, not a fresh instruction to implement or repeat live checks. Actual results and remaining limitations are in DEV_STATUS.md. Current documentation work leaves PHASE3_5_CONTRACTS.md and the implementation untouched.

The owner explicitly accepted Phase 3 implementation `ca4499bc279d37eb52c0a36b0524eb19322071b0` (acceptance `96964964a7d5046ff34b6b6ae695ecf494885cc4`) and separately authorized this milestone. Follow [PHASE3_5_BRIEF.md](PHASE3_5_BRIEF.md) and the committed [PHASE3_5_CONTRACTS.md](PHASE3_5_CONTRACTS.md). One lead plus three separate-worktree development workers acknowledged the concrete shared contracts before GO; only the storage worker edits migrations. Preserve all earlier checkpoints and the original checkout's pre-existing documentation edits exactly, outside milestone commits.

Use immutable save points and preserved timeline forks, exact state/private continuity, source-linked memory ancestry filters, bounded autosaves and safety-before-load recovery. Dedicated desktop ordering is Library → Gallery → Sessions → Saves → Campaign Settings; mobile uses More. Full implementation/verification gates remain in the brief. Phase 4, deployment and real imports remain unauthorized.

Build exact deduplicated record-version manifests over the existing active campaign projection, a stable timeline identity and monotonic activation epoch, atomic safety/fork/load/switch, Quick Save pointer replacement and default 15-slot bounded autosaves. Restore effective settings/guidance and pending operation/check results without replay or new AI calls. Fence every write and job; preserve drafts and reject stale two-tab submissions. Scope source/summary/checkpoint/alias/NPC knowledge to exact inherited membership before retrieval limits. Campaign-wide canon corrections remain effective across restored branches; timeline corrections preserve sibling history. No second memory system, branch simulation or graph UI.

Acceptance: run full Phase 0–3 regressions and new save/branch suites; upgrade a backed-up populated local Phase 3 database without resetting data; verify real Auth, owner/campaign/private denial, exact state and recorded dice, correction scope, idempotency/concurrency, failure recovery, logout/relogin and absence of private canaries in public APIs/HTML/JS/logs. Include repeated forks over at least 1,000 events while retaining bounded Phase 3 context. Verify English/Russian desktop, 390px and 320px in the browser. Run final type generation/typecheck/lint/tests/production build. Report deterministic versus live/browser evidence and remaining limitations separately. Commit/push and stop at PHASE 3.5 READY FOR OWNER ACCEPTANCE, never self-approval. No World Engine, Phase 4, deployment or real import.

---

# PROPOSED PHASE 3.75 — WORLD ENGINE / WORLD LAB / SOURCE WORLDS

**Broader A–E implementation remains design only and separately gated. The owner has now frozen the Model Runtime baseline and rejected Jev adoption; see the final decision above.** The documentation pass stops for review. Each future slice needs its own concrete scope, shared contracts and acceptance record; completing one does not authorize the next. Keep one primary gameplay DM, existing Memory and one Saves/Timelines system.

Direction: **World Library → World Pack → Scenario Composition → Divergence / What If → Enter This World → Ruleset → RPG**. Natural language stays primary. D&D is a selectable ruleset, not universal ontology; providers/models are execution policy, not world identity. Optimize for this owner's quality preference and simple local operation, not cheap-model defaults or commercial scale.

## 3.75A — Model Runtime and ruleset compatibility

References: [Model Runtime](MODEL_RUNTIME_BRIEF.md), [Rulesets / Dynamic UI](RULESETS_AND_DYNAMIC_UI_BRIEF.md).

Independently reviewable slices:

- **A1: provider/task boundary and onboarding.** Wrap the existing DmProvider/SummaryProvider seams in a small server adapter/registry; preserve accepted OpenAI behavior. Add approved supported providers only after official capability verification. Global defaults, per-campaign primary and task overrides resolve explicit versioned execution profiles. Unavailable explicit choices pause without fallback. Preserve bounded context, strict schemas, privacy and model provenance.
- **A1 owner setup:** one ignored `.env.local` in the running checkout; future placeholder-only `.env.example` and narrow Git exception; exact file/variable and simple verified restart instructions. Settings → AI Providers distinguishes configured from successfully tested; explicit synthetic Test Connection with charge disclosure, no calls on page load and no gameplay mutation. Keys never enter campaigns, exports, browser configuration or chat. Routine supported model selection requires no code, HTTP or SQL edits; a new adapter still requires development.
- **A2: ruleset-neutral foundation.** Separate stable identity/control/capabilities from optional versioned mechanical components. Keep `console-basic-v1` compatibility; do not call it full official D&D 5e. Define Full Ruleset, World Logic and bounded declarative Custom profiles, with code-enforced mechanics and no model-authored executable plugins. Adapt character/inventory/resource views using a finite set of reusable components. Profile conversion is explicit and prospective; old saves and recorded checks remain valid.

Future gate: existing Phase 0–3.5 tests pass unchanged in meaning; configured supported-provider onboarding/selection works without source edits; safe status/Test Connection and no secret leakage; strict unsupported-model rejection/no fallback; World Logic and bounded Custom synthetic campaigns work alongside the house profile; no mandatory HP/d20/class UI; old save compatibility and exact quantities/knowledge remain. At least two actually verified providers are needed before claiming working provider replaceability. Full official 5e coverage must be separately enumerated/tested before advertising it.

### Progression and challenge integration within A2 / C

Reference: [Rulesets progression source of truth](RULESETS_AND_DYNAMIC_UI_BRIEF.md#progression-engine-and-reward-authority), [product setup/advancement](MASTER_SPEC.md#progression-and-advancement--future-product-design), [World Engine settlement](WORLD_ENGINE_BRIEF.md#progression-rewards-and-world-scale-settlement). These extend existing foundations rather than creating a parallel character database, backend, reward ledger for pacing or second DM.

Progression is required for RPG-capable Rulesets; XP, levels, classes and caps remain profile-dependent. Small separately scoped production slices should proceed through:

1. **Ruleset contracts and compatibility:** optional composable tracks, typed Reward Packages, ability definition/ownership/eligibility separation, progression/scaling/distribution policies and versions. Preserve imported baselines without fabricated XP; define compatible save readers before adding authoritative record families.
2. **Authoritative reward and advancement settlement:** validated Events/achievements feed trusted valuation; atomically commit source receipts, track updates and Pending Advancement. Explicit choices validate prerequisites/resources and unlocks. Prove retry, save/load, timeline isolation, corrections, Off, milestones, use-based anti-spam, career and companion policy behavior with synthetic fixtures.
3. **Encounter materialization and scaling:** distinct World Threat, Party Power and Encounter Budget; World Anchored / Adaptive / Hybrid policies and credible envelopes. Pin materialized mechanics; prove no mid-encounter rescaling and independent difficulty behavior.
4. **Player-facing integration:** Create Campaign and Campaign Rules & Play Style compatibility-filtered options; Character → Progression, Before / After choices, discovered latent abilities, compact Game notices and authoritative Session Recap. Keep non-level campaigns readable and private metadata server-only.
5. **Bounded pacing and supported power growth:** forecast meaningful reward opportunities against recommended challenge bands, preserve earned easier victories and profile-defined post-cap progression. Integrate supported large effects through bounded World Engine settlement; advanced custom/epic primitives require explicit coverage rather than claiming every example is implemented.

Minimal track/reward contracts fit A2; causal reward integration depends on C's Event/settlement foundation. Full content tables, optional custom abilities and broad progression-school coverage can be independently sliced; do not block a small correct baseline with a giant milestone. A supported RPG profile cannot claim complete progression from an XP display alone. DM Craft may guide design/pacing but has no mechanical grant authority.

Future gates are enumerated in [Rulesets acceptance](RULESETS_AND_DYNAMIC_UI_BRIEF.md#future-acceptance-gates--not-executed-here). Run appropriate implementation checks only when that work is authorized, and distinguish deterministic correctness, model-quality evaluation and owner acceptance. This pass executes documentation checks only, no production tests/build, research, provider calls or Phase 3.8B work.

### Decision Model evaluation — Jev closed; future candidates separately authorized

Define an optional vendor-neutral `classify` capability as specified in [Model Runtime](MODEL_RUNTIME_BRIEF.md#optional-decision-model-capability--design-only). **Jev (TypeSafe) is DO NOT ADOPT** for Thread/Actor relevance, Canon/source classification and parallel comparison. The owner accepts the incomplete Phase 3.75 evidence for this decision; no continuation/rerun/diagnostic calls. classifier.dev, OpenRouter, GLiNER and Vercel Workflows remain deferred and are not contacted. The generic criteria below apply only to a newly authorized future candidate, not an outstanding Jev task. No dependencies, live calls or benchmark execution are authorized by this documentation addition. Any newly authorized spike and adoption remain optional; other A–E work must remain viable without a classifier.

Use only labelled synthetic RPG Console fixtures covering World Thread relevance; World Actor relevance; canon/source passage classification; parallel-simulation similarities/divergences; English and Russian; and adversarial/ambiguous cases. Include critical deadlines, rare relevant actors, distractors, negation, conflicting passages, source-instruction attacks, unknowns and synthetic private/timeline markers.

Compare **deterministic filtering only**, the **candidate Decision Model** and the **frontier reasoning baseline** using identical authorized snapshots and independently reviewed relevance labels. Measure recall/false negatives, precision, calibrated uncertainty/abstention, latency including tail behavior, strong-model context avoided and cost where applicable, including classifier overhead. Report raw classifier quality and end-to-end protected behavior, sample sizes and confidence limits. A frontier answer is not automatically ground truth; unavailable metrics remain unknown.

Freeze task-specific high-recall thresholds/calibration before held-out bilingual/adversarial evaluation. Critical World Engine deadlines/agency evidence must bypass pruning; relevant and uncertain candidates are retained, with bounded segmentation/pause on overflow. Test unavailable/malformed/stale classification, safe bypass without model switching, secrecy and zero gameplay mutation. Very high recall outweighs aggressive filtering; finite zero misses do not guarantee perfect causality. No universal numeric confidence cutoff is assumed here.

Deliver a small evidence report and explicit **adopt / reranking-only / do not adopt** recommendation. A separate owner-reviewed decision and implementation scope are required before live World Engine pruning. Reject adoption if the measured benefit is not meaningful, uncertainty is unreliable or relevant world causality is lost. Retain deterministic eligibility and strong reasoning as the complete baseline. Any external proxy requires separate approval of destination/data handling; synthetic evaluation never authorizes real source/private uploads.

## 3.75B — World Library, World Packs and source contracts

Reference: [World Library / World Packs](WORLD_LIBRARY_AND_WORLD_PACKS_BRIEF.md).

- **B1: evidence and authoring foundations.** Preserve original source versions and accurate format-specific locators; owner-scoped reusable packs bind explicitly into campaign-owned records. Bounded resumable compiler passes extract/index entities, relationships, timelines, geography/rules and contradictions, with visible coverage/unknowns. Scratch-world premises are approved authored assumptions. Distinguish fact origin from Memory epistemic status; reuse source-linked invalidation and privacy.
- **B1 future source acquisition:** add owner-triggered **Research from Web** as another bounded ingestion path into the same Source Store/Canon Compiler. A finite Research Orchestrator plan may fan out to specialized workers for chronology, actors/factions, geography, equipment/capabilities, institutions, primary/secondary sources or other user-requested gaps; workers return source-backed claims/citations and never write canon directly. Cap queries/deep reads/source count/parallelism/time/model cost, deduplicate sources, retain contradictions and stop with a coverage report. **Deepen Research** is a new explicit bounded pass, not an endless swarm. Do not add a separate crawler backend/vector store or let ordinary gameplay browse silently.
- **B1 also supplies prerequisites for Lab:** versioned Scenario/Divergence contracts, source priorities, identity mappings, temporal entry anchors and Source Knowledge / Canon at Entry / Character Knowledge / Future Source Events separation. Minimum approved composition contracts cannot wait until E; only their complete UX can.
- **B2: visual reference associations.** Owner-provided/approved images, versioned entity/location/object bindings and visibility/time/appearance variants through existing Storage/Visual Bible concepts. Manual association is the proposed first scope. No image/video generation or automatic scraping.

Depends on A1 for model-backed compilation and A2's neutral identity/capability contracts. Document/version ingestion can be reviewed before model extraction if explicitly scoped. No real-data import authorization is implied.

Future gate: supported formats retain originals and evidence; malformed/partial extraction reports gaps; contradictory claims and uncertain aliases are not silently resolved; two unrelated campaigns/packs isolate their facts; entry at an earlier source point excludes later outcomes/knowledge; literal crossover and native adaptation are distinguishable; visual references preserve approval/provenance and never reveal later/private appearance. Detailed compiler quality is evaluated separately from parser/schema correctness.

## 3.75C — Bounded World Engine

- Campaign-level **deadline pressure: Off / Critical Only / Normal** must be independent from World Autonomy. Off disables quest/hook/autonomous-thread expiry from elapsed in-world time while preserving direct causal resolution; no retroactive backlog when re-enabled.

Reference: [World Engine](WORLD_ENGINE_BRIEF.md).

Stable entity/faction Actor references, persistent Threads (including clocks/deadlines) and immutable validated Events. Select due work in code on meaningful in-world triggers; zero requests for no-op/deterministic cases. Different bounded Low/Moderate/High scopes, fair warning and hard deadlines, explicit On/Off behavior, bounded causal catch-up and no wall-clock progression. Extend the existing pending turn to stage and atomically commit player/world settlement, preserving input/dice on failure. Index committed events via existing Memory. Add world record families with versioned manifest compatibility; preserve accepted v1 saves.

Depends on A1/A2; source-grounded use also depends on B contracts. A tightly scoped synthetic existing-campaign engine can be reviewed without waiting for every source format. Initial workload ceilings are proposed in the brief and must be tested for correctness, not treated as a cost-saving mandate.

No Decision Model spike is a C prerequisite. Jev evaluation is closed and cannot become a dependency of C. No live pruning before its recall/privacy/failure gates and separate approval; deterministic filtering and the selected strong resolver remain sufficient without it.

Future gate: time/no-op/autonomy/deadline/fair-warning behavior, long skips stopping honestly at evaluated horizons, no autonomous PC decisions, duplicate/failed/stale settlement without partial mutation/reroll, private events/actor knowledge isolation, exact old/new save restore and source invalidation. World/Мир → Live World is public-only and bilingual/mobile. No agent-per-NPC, full economy or continuous simulator.

## Progressive DM Craft slices after World Engine foundations

This section originally described incremental additions to the World Engine/DM roadmap rather than a separate prerequisite to the then-unbuilt foundations. The letters below are design slices, not replacements for Phase 3.75 A–E. Each implementation slice still needs separate scope/authorization; this pass changes documentation only. References: [DM Craft product/navigation](MASTER_SPEC.md#dm-craft-and-campaign-dm-style--future-product-design), [Doctrine and teaching workflow](RPG_DESIGN_DOCTRINE.md#36-dm-craft--reusable-owner-approved-education), [single-DM runtime boundaries](MODEL_RUNTIME_BRIEF.md#dm-craft-context-and-authority--future-design).

**Current priority:** foundations A/B and D2A are accepted; the next bounded implementation/evaluation/owner-acceptance gate is **Mega DM v1**, covering compact versioned Core Doctrine, owner-approved Long-Form Campaign Craft, small deterministic stage-aware selection, a minimal effective-Craft owner view, campaign DM Style alongside the existing DM Guide, and reviewable Chat-with-DM teaching proposals. The UI/teaching pieces may be split into small implementation slices, but v1 is the release gate before D2B. The permanent frozen approximately 48-scene synthetic benchmark in [Doctrine](RPG_DESIGN_DOCTRINE.md#owner-feedback-corpus-and-dm-craft-evaluation--academy) has offline authority/privacy/selection checks plus separately authorized live quality replay; a passing deterministic suite alone does not constitute Mega DM owner acceptance. No feature or provider execution is authorized by this roadmap.

| Order | Small future slice | Review outcome |
| --- | --- | --- |
| A | World Engine foundations: Actors → Threads → Events → Hooks and authoritative consequences | Stable identities, bounded causal settlement and privacy; no Craft-owned world state |
| B | DM / World Engine integration | Existing DmProvider plans/narrates validated outcomes through one authoritative commit path |
| C | DM Craft v1: compact Core Doctrine, initial owner-approved Craft Cards, stage-aware plan/narrate retrieval, provenance and synthetic regression/eval coverage | Approved versions only, small relevant subsets, unchanged authority/secrecy, baseline-versus-pack comparison where useful |
| D | Campaign DM Style integration | Small understandable controls and natural-language proposals; explicit application, campaign isolation and correct saved/timeline effective revisions |
| E | Global DM Craft UI / Teach DM | First-class application main-menu destination; Approve / Edit / Reject, version history and reversible changes without prompt/JSON editing |
| F | Sources / Craft Packs and owner feedback corpus | Bounded separately authorized imports, provenance, explicit activation, non-canonical examples and safe generalization before global reuse |
| G | Optional fine-tuning evaluation much later | Sufficient approved/evaluated data plus separate provider/model/data/privacy/cost review; product remains complete without training |

The first **RPG Console Core Craft** pack can later be produced from existing documented RPG references and doctrine; no cards or pack are implemented or automatically approved by this roadmap. Scene Directing / DM Performance is supported alongside systemic/quest techniques. Sources, examples and Evaluation/Academy screens can arrive progressively after the conceptual global destination is established; do not require every section for v1.

Preserve **Application → DM Craft** versus **Campaign → DM Style**, the single DM and the separation of guidance from Canon / Memory / private truth regardless of exact implementation slicing. Candidate packs are tested only in isolated synthetic or explicitly approved evaluation; Academy is QA, not gameplay authority. Do not restart research, execute evaluations, add infrastructure or alter Phase 3.8B as part of this documentation addition.

## 3.75D — World Lab / What If and parallel realities

Reference: [World Lab / What If](WORLD_LAB_WHAT_IF_BRIEF.md).

**Current status and dependency:** D1 detached foundation and D2A single-model simulation are owner accepted. The D1/D2 bullets below preserve the original design sequence; D2B multi-model comparison is deferred until Mega DM v1 is implemented, evaluated and owner-accepted. After D2B, implement read-only **Timeline Explorer V1** over existing exact ancestry/checkpoints, then **V2** with validated deltas and matched-horizon public comparison, before Enter This World. Neither Explorer is a new Save/Timeline authority or node-graph prerequisite.

- **D1: detached branch foundation.** Extend the accepted vault/manifests and timeline identities with simulation purpose, detached authorized reads, immutable append/branch-head compare-and-swap, per-run lease/expected-head fencing and pinned complete comparison inputs. Never simulate by changing the live active projection. Current active-epoch fencing alone is insufficient. Prove these mechanics with deterministic synthetic fixtures before model runs.
- **D2: one run, then 2–3 independent models.** NON-CANON finite-horizon experiments using approved Scenario/Divergence contracts and World Engine state. Coherent intermediate checkpoints, independent concurrent requests/failures, safe pause/retry/cancel and provenance. Compare public shared outcomes and major divergences at matched horizons; no winner or accuracy guarantee. Continue from another model's checkpoint by creating children. Use simple durable jobs in the existing app/Postgres, no orchestration platform.

Depends on A model policy/budgets, B minimum source/entry/scenario contracts and C world settlement. Extend existing MemoryStore/TurnStore adapters for detached inputs without creating another retrieval system. New source/correction invalidation and old-manifest compatibility must be tested before concurrent execution.

Future gate: 1–3 identical-base runs progress independently without live/sibling contamination; one provider failure does not stop others; stable divergence, bounded workload, correct source/epoch/lease rejection and no private comparison/count leakage; old saves remain loadable; Model-A checkpoint continued by A/B/C retains exact ancestry and provenance. Separately authorize paid quality evaluation only after deterministic/security gates.

## 3.75E — Enter This World, canon-character control and composition UX

References: [World Lab](WORLD_LAB_WHAT_IF_BRIEF.md), [World Library](WORLD_LIBRARY_AND_WORLD_PACKS_BRIEF.md), [Rulesets](RULESETS_AND_DYNAMIC_UI_BRIEF.md).

Enter a coherent intermediate checkpoint as the current PC, an existing canon/simulated person or a new original character. Validate exact state and missing details, profile mappings and knowledge, create a playable child and activate through existing safety-save/fork/epoch mechanisms. Preserve original and simulation history. Transfer branch-local control on an existing identity; never autonomously decide for that PC. Support Original Character / Existing Canon Character creation with precise continuity anchors and agency after entry. Finish natural-language scenario composition UX for literal crossover/native adaptation over the already implemented contracts.

Depends on A2, B entry/contracts and D structured checkpoints, not generated prose. Missing playable fields require explicitly approved supplements; incompatible pending checks or mappings pause safely. No history rewrite or branch merge. Selecting a ruleset defines future mechanics, not past world truth.

Future gate: intermediate exact-state promotion, atomic/idempotent failure/retry, coherent session start/resume, no duplicate character, no source-future/sibling/private leak, no autonomous PC actions, no changes to original/simulation manifests, and faithful profile-driven sheets/inventory across synthetic fantasy, literary and historical worlds. Model-training knowledge leakage remains a measured limitation, not a solved theorem.

## Shared review and verification policy

Before any slice starts, agree on the smallest contract/schema extension and file ownership, with one migration owner if development workers are separately authorized. Do not independently redefine timeline identity, Memory authority or mutation semantics. Retain immutable originals and documented legacy readers; back up local data before future schema changes. Do not silently convert legacy private prose into structured facts.

Each authorized implementation slice runs typecheck, lint, relevant tests and production build, then appropriate populated-local storage/Auth/privacy and English/Russian desktop/mobile checks. Keep deterministic tests, live-provider quality evaluations and owner/browser acceptance separate. Use synthetic worlds and private markers until real import is separately authorized. Finite evaluations do not prove perfect memory, causality, recovery or branching. A documentation pass runs documentation-safe checks only and must not claim runtime verification.

Physical iPhone/Safari and the optional historical Phase 1 conflict-rebase confirmation remain unverified; no hosted deployment or real campaign/private-data acceptance has occurred. Those boundaries carry forward. Stop at each readiness gate for explicit owner acceptance.

## Remaining owner decisions — proposed defaults, not blockers to this design pass

| Decision | Proposed choice for review |
| --- | --- |
| Phase/sub-phase names and order | Keep 3.75 A–E, with A1/A2, B1/B2 and D1/D2 independently scoped; minimal scenario/entry contracts in B before full UX in E |
| Canon continuation strictness | Canon before entry, emergent future; any future constraint explicitly approved and subordinate to player agency |
| Imported-world ruleset default | World Logic unless the owner requests a particular supported tabletop/custom profile |
| Live World visibility and Off/re-enable behavior | Known developments/warnings only; no hidden progression while Off and explicit reconciliation when re-enabled |
| Visual association scope | Manual approval first; automatic association suggestions a later reviewed addition |
| Default Lab run count | One, with explicit comparison selecting two or three |
| Initial providers/models and task policy | Owner's strongest configured primary inherited by all tasks; explicit overrides, verified adapters, no automatic fallback |
| First full/custom ruleset breadth | Preserve house-profile compatibility; separately agree on complete ruleset coverage and the initial bounded custom primitives |

The owner already requires nontechnical onboarding and secret-free campaign settings; those are fixed design requirements, not optional choices in this table. No answer is required to finish the documentation; implementation waits for a new scoped instruction after review.

---

# PHASE 3.8A — SPATIAL RUNTIME ARCHITECTURE / RESEARCH — COMPLETE

The owner-approved architecture and dated official research are preserved in [Spatial Runtime](PHASE38_SPATIAL_RUNTIME.md), [provider capability snapshot](PHASE38_PROVIDER_CAPABILITIES.md) and the [historical 3.8B proposal](PHASE38B_LIVE_PROTOCOL.md). Accepted DM, Memory and Saves/Timelines remain the reused foundation. Historical research and proposed test instructions are closed, not current permission for more calls or design work.

# PHASE 3.8B — FINAL ARCHITECTURE / CAPABILITY EVIDENCE FREEZE

**ARCHITECTURE / CAPABILITY EVIDENCE COMPLETE WITH DOCUMENTED LIMITATIONS.** See [final decisions](PHASE38B_ARCHITECTURE_FREEZE.md) and historical freeze `3c99552a66d9b4b270b3a7a8552c709cf9faf73e`, identity `phase38b-final-architecture-evidence-freeze-1`, canonical hash `eef894c15e27bc167cf3bbcbaaf99dd51ec640f545b1a16cd1b2e539da239119`. Historical experiment files remain on their exact Git checkpoints, outside production.

Room/courtyard establish bounded World Labs capability for architecture only. Fal-world is `STRUCTURALLY_USABLE_PLY_WORLD_CANDIDATE`: support observed PLY or a validated offline conversion path; do not require DRC exclusively. No fal retry. Chest POST entered the queue but the first poll stopped locally; completion/charge UNKNOWN, no GLB retrieved, object/PBR/articulation UNVERIFIED, lid `STRUCTURE_UNVERIFIED`, separate lid not proven. No chest recovery; object generation is not an architecture dependency. None of this establishes final visual quality, navigation, canonical metric correctness or production EXPLORE readiness.

Four submissions consumed the **$4.75 / $4.75 permanent reservation allocation** with $0 remaining. Known reported billing is **$2.528**; both fal charges remain UNKNOWN and reserved. No reservation reuse/refund, replenishment, fifth generation or additional Phase 3.8B experiment is planned. Future provider issues are bounded implementation blocker investigations, not continuation of this bake-off.

Authoritative world/RPG state remains truth; generated assets are projections. Provider IDs never replace canonical identity; Interaction Bindings use verified addressable nodes/parts/anchors. Text is permanently first-class and spatial-independent; 2D Live is the planned primary visual layer; EXPLORE is optional/progressive and asset-first after Phase 4. Spatial providers do not gate World Engine, Rulesets, DM, Memory, Saves/Timelines or progression.

Source-of-truth integration is owner-approved. **Broad product research/design is closed** unless implementation reveals a genuine architectural blocker. The next development phase is the **Production Multi-Agent Coding Sprint** described above; no coding starts during integration.

---

# MILESTONE 4 — FRAME + VISUAL BIBLE

Future separately authorized media phase. Reuse approved World Pack/Visual Bible reference associations and the shared model capability/selection boundary if implemented; do not create a competing asset registry. No FRAME work is authorized by Phase 3.75 decisions or Phase 3.8A research.

Goal:
Scene images feel consistent.

Build:
- optional asynchronous item art from known appearance/safe references using owner-selected supported image model; category fallbacks remain immediately usable, assets follow item identity, generic icons may be reused, unique art cannot affect unrelated items
- item generation only by explicit request, duplicate-job protection, cost estimate/unknown disclosure, preserved prior asset on regeneration/failure, no mechanics/canon changes (section 36)
- Visual Bible UI
- approved references
- FRAME button
- spoiler-safe visual scene builder
- owner-selectable supported image provider/model, with campaign default and per-generation override
- server-side spoiler-safe text-model prompt preparation with optional review/edit
- small model registry and provider adapters (MASTER_SPEC section 32)
- gallery
- Set as Canon Reference

Acceptance:
- 5 generated scenes of the selected synthetic/authorized character look recognizably consistent; real James material requires separate import permission
- hidden NPC/secret details never appear
- failed generation does not affect game

Suggested prompt:

> Implement Milestone 4 only. Add Visual Bible and FRAME generation using owner-selected supported provider/model integrations as specified in MASTER_SPEC section 32. Verify provider capabilities and model choices with the owner before integration. Use approved references and spoiler-safe visible scene data only. Save generated assets to campaign Gallery.

---


# POST-PHASE-4 V1 SLICE — 2D PRESENTATION / RENDERING ENGINE

Separate authorization after Phase 4 Visual Bible / canonical asset foundation. This is the **primary optional visual gameplay presentation**, while Text remains a permanent complete first-class mode. It may be developed before, after or in parallel with the separately authorized EXPLORE production slice; neither depends on the other beyond shared Phase 4 assets and authoritative state.

First target: **Fabled Lands-like world/region/town exploration + Sorcery!-like encounters/checks/combat + unrestricted AI-DM input**. References and product direction are documented in [2D Rendering Direction](2D_RENDERING_DIRECTION.md) and MASTER_SPEC §46. They define interaction patterns, not a fixed art style.

Initial build should stay small:
- world/region travel map with route and moving character/vehicle marker;
- interruptible travel and bounded encounter/discovery presentation;
- generated/persisted town or area overview with districts/known POIs;
- local 2D scene presentation with exits, known actors/objects and narrative/dialogue overlay;
- light animation such as camera movement, parallax, weather, particles and lighting where useful;
- compact checks/combat presentation; free-form actions remain valid;
- style profiles/assets remain campaign-specific rather than hardcoding pixel or painterly art;
- player-visible POIs only; latent Adventure Hooks stay private until discovered.
- marker visibility: Off / Tracked Only / Standard / All Known; presentation-only, with All Known still limited to player-known information.

Do not require seamless movement, tactical grids, 3D, a second game-state store or renderer-owned quest/world logic. The renderer consumes authorized public state and emits typed player intents; normal RPG rules/DM/server validation remain authoritative.

Acceptance for the first slice should prove text-mode independence, world→town→local transitions, route interruption, stable discovered POIs, free-form interaction fallback, save/load consistency and graceful renderer failure. Visual polish/animation can iterate after this minimal playable loop.

---

# POST-PHASE-4 V1 SLICE — EXPLORE PRODUCTION

Separate authorization only after FRAME / Visual Bible and reviewed spatial evidence. Choose the smallest measured hosted/exported presentation path, reuse approved references and Storage, implement public-only artifacts/bindings and normal-game typed interactions, preserve old saves and provider-independent campaign load. Natural language stays primary. No universal D&D/HP or provider ontology. Detailed phase numbering/order relative to VIDEO may be scoped later; production EXPLORE cannot precede Phase 4.

Acceptance includes no spatial-authoritative mutations; source/branch/epoch fencing; known-only geometry; safe item/door/location changes and rebinding; failure isolation; EN/RU desktop/mobile; explicitly disclosed physical iPhone/Safari results. No continuous world simulator or mandatory realtime model.

---

# MILESTONE 5 — VIDEO

Future separately authorized phase; reuse approved source-grounded character/location/object references and shared provider selection without exposing private appearances or duplicating the asset system.

Goal:
One click turns a scene into a short cinematic clip.

Build:
- owner-selected supported video provider/model integration
- campaign default and manual per-generation model override
- video-specific spoiler-safe prompt preparation
- queue submit/status
- video jobs table
- current frame as preferred source
- hidden keyframe fallback
- character/location references
- model-supported duration/audio/reference options (5/10/15 seconds only where supported)
- async status
- gallery video

Acceptance:
- player can continue text game while generation runs
- result attaches to correct campaign/scene
- no API secret in browser
- failure is retryable

Suggested prompt:

> Implement Milestone 5 only following MASTER_SPEC section 32. Confirm the owner's video providers/models and their API capabilities first; fal is a candidate, not a fixed exclusive choice. Keep all keys server-side. Use asynchronous generation with explicit model choice and optional prompt review. Prefer current scene frame and canonical references. Default to 10 seconds only when supported. Do not block gameplay.

---

# MILESTONE 6 — POLISH

Add only after core system is stable:
- drag/drop Evidence Board
- What Do I Know?
- relationship UI
- session cover generation
- travel route polish
- global search
- export/import
- backup recovery/export UX integrated with existing Saves/Timelines; no second historical rollback engine
- accessibility
- mobile refinements
- subtle animations
- late-stage Owner Diagnostics / System Inspector: sanitized operations, source/model provenance and failures; no secrets, private-state browser or spoilers
- later separately scoped AutoEval / autoresearch: bounded owner-authorized experiments with frozen inputs/budgets and review, never autonomous production self-modification, deployment or paid probing

Acceptance:
The owner prefers playing here over managing the same campaign manually in ChatGPT.


## Preliminary media selection decision

FRAME and VIDEO must support owner choice of supported providers/models, independently, with campaign defaults and per-generation overrides. Optional Fast / Quality / Key Scene profiles supplement rather than replace manual selection. Exact providers/models are undecided. Follow MASTER_SPEC section 32, including spoiler-safe prompt expansion, capability validation, cost transparency, and no silent model fallback. This decision adds no implementation work to Phase 0 and does not authorize starting later milestones.
