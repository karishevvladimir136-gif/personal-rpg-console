# World Engine — architecture proposal

**Phase 3.75 design only, September 19, 2026. Not implemented or owner-approved.** This pass authorizes documentation, not runtime work, migrations, UI, provider calls, deployment or imports. Accepted baseline: Phase 3.5 implementation `8099e0cca1463f767476190c456d4f3947e7c84e`, acceptance `6db58b5e3d464e4a09604ce344424c4fa8ed763e`. Earlier accepted checkpoints remain preserved.

**Current reading:** that opening is the original dated design record. Waves 1–4 and World Lab D1/D2A have since been owner accepted; [DEV_STATUS](DEV_STATUS.md) records actual implementation and limits. The next priority is Mega DM v1 on the same single-DM/World authority, before deferred D2B; this document does not authorize implementation.

## Purpose and connected design

Natural language in → structured reality underneath → natural language out. Important people, factions and situations continue to pursue goals as the fictional world changes. Resolve causally meaningful narrative state, not every citizen, meal or minute. This supports fantasy, literary/romance, historical, military, political and civilization-scale stories through different levels of detail, not through a microscopic planetary simulator.

The primary gameplay DM remains one runtime. A World Resolver is a bounded structured decision task used by it and by the future Lab. It has no personality, player conversation or autonomous agenda. There is no LLM per NPC and no second DM.

Future [DM Craft](MODEL_RUNTIME_BRIEF.md#dm-craft-context-and-authority--future-design) supplies compact approved Doctrine and relevant stage-specific techniques to this same DM after foundations/integration begin. Owner-scoped global Craft and campaign-scoped DM Style remain separate from Actor/Thread/Event/Hook state, Canon and Memory. Guidance may improve proposed consequences or presentation but cannot create an Event, grant knowledge, override Deadline Pressure/World Autonomy or commit world mutations. Explicit World Authoring remains a separate validated operation; approving a card or style preference never invokes it. See the [progressive roadmap](DEVELOPMENT_PLAN.md#progressive-dm-craft-slices-after-world-engine-foundations); Craft is not a new foundational dependency or implementation authorization.

Related proposals: [World Library / Packs](WORLD_LIBRARY_AND_WORLD_PACKS_BRIEF.md), [World Lab / What If](WORLD_LAB_WHAT_IF_BRIEF.md), [Rulesets / Dynamic UI](RULESETS_AND_DYNAMIC_UI_BRIEF.md), and [Model Runtime](MODEL_RUNTIME_BRIEF.md). MASTER_SPEC §44 is the design entry point; DEVELOPMENT_PLAN lists separately reviewable implementation slices. The following names describe logical contracts, not new SQL tables or executable DTOs.

## What the accepted implementation actually provides

| Existing code / contract | Reuse | Extension required later |
| --- | --- | --- |
| `src/lib/gameplay/turn-engine.ts`, `server-contracts.ts`, `timeline.ts` | Durable input, recorded checks, plan/resolve/narrate/commit, leases and stale-state rejection | World-settlement stage and typed world deltas; do not add an independently committing DM |
| `src/lib/memory/{context,retrieval,summary,jobs,timeline}.ts` | Original source links, separate public/private paths, positive knowledge checks, correction invalidation, bounded context | Index validated world events and thread evidence using the same pipeline |
| Migrations `202609190008_phase35_timelines.sql` and `202609190009_phase35_fencing.sql` | Timeline UUIDs, immutable version vault/manifests, active epoch, safety saves and correction scope | Register versioned world record families and pending world work in manifests; old saves need an explicit compatibility reader |
| `src/lib/campaign-settings.ts` | Low / Moderate / High autonomy and independent narrative preferences | Separate simulation On/Off and code-defined eligibility policy; current autonomy is DM guidance, not an implemented scheduler |
| `src/lib/persistence/contracts.ts` | Stable entities, locations, items and provenance | Faction/institution references and structured relationships where current text fields are insufficient |

Current private `fact/clock/npc/faction/consequence` patches are not already a full actor/thread/event system. Extend their validated meaning and references without claiming free-form legacy private strings have been safely converted. Inspectable migration mappings must preserve the originals; ambiguous legacy records remain legacy until explicitly mapped.

## POV, authority and world leverage

**Kingmaker / Rogue Trader reinforce two implementation rules:** model realms/holdings as coarse World Actors rather than separate strategy games, and let powerful PCs delegate bounded long-running tasks to advisors/officers through normal Threads/Events. Rumours remain claims rather than facts. Known urgency must be surfaced fairly; hidden clocks never become omniscient UI, but character-known deadlines should not be obscured.


**Wrath of the Righteous** is a useful scale reference: one player-controlled Actor may validly act both locally and strategically when their actual authority supports it. Preserve one Actor/state history across those scales. Do not copy a mandatory detached crusade minigame; strategic orders should flow through normal World Actor/Thread/Event resolution and remain expressible in Text.


See [POV & World Leverage](POV_AND_WORLD_LEVERAGE.md). World Actors may differ radically in knowledge, capabilities, institutional authority, command scope, jurisdiction, resources and information access. These are orthogonal to narrative prominence. A player-controlled monarch, colonel and private soldier therefore receive different authorized contexts and can cause different classes of in-world action while sharing one World Engine. Orders are validated actions that create intentions/events and consequences through normal settlement; they are never magical direct edits of remote state. Owner-side World Authoring remains out-of-character and separate.

## Small core: Actor → Thread → Event

| Concept | Minimum logical content |
| --- | --- |
| World Actor | Reference to an existing stable entity or a future typed faction/institution record; capabilities, relevant relationships, location, control assignment, knowledge references and applicable revision |
| World Thread | Stable ID, campaign/timeline scope, actor references, goal/threat/opportunity, state, prerequisites, dependencies, locations, optional progress/target, next evaluation time, optional deadline, consequence policy, visibility, source/provenance references and revision |
| World Event | Stable event/operation ID, campaign/timeline, in-world time and ordering, actors/location, originating thread, cause references, validated consequences, source references, visibility and explicit witnesses/recipients |

Use a thread's progress/deadline fields for clocks. A separate generic Clock service is unnecessary. Actors reference the same people shown in Character/Party; an actor role is not another person record. Player-controlled actors cannot receive autonomous decisions. Organizations may have aggregate capabilities without pretending each member is a separately simulated entity.

An Event is immutable factual history only after validation and commit. A proposed event, rumor, actor intention or simulation assumption is not a completed fact. Keep the accepted memory statement kinds and add origin classification orthogonally: source fact, source inference, approved scenario assumption or committed simulation fact. Exact after-values and original causes are retained; prose is a presentation of those records.

World rules (magic, technology, geography, institutional constraints) describe what is possible. A Ruleset Profile describes how uncertain player-scale actions and resources are resolved. Neither a World Thread nor a World Event requires HP, AC, classes, spell slots, d20s, or a provider-specific object.

### Semantic physical causality and selective simulation

The World Engine supports **bounded semantic/causal simulation** for consequences that are too contextual to enumerate as fixed scripts. Deterministic server code remains responsible for exact mechanics the active Ruleset can calculate reliably—costs, resources, ranges, damage/check formulas, thresholds, timing, identity and permission. The selected strong reasoning model may then reason over the authorized world snapshot to propose meso/macro causal consequences such as structural collapse, fire spread, flooding, blocked roads, infrastructure failure, terrain deformation, displacement or secondary social/logistical effects. The current owner-selected model may be Astra-class, but this contract is provider-neutral and must not make authoritative state depend on one vendor.

The model is a **causal reasoner, not the authority and not a claim of engineering-grade physics**. Give it bounded relevant state—terrain, materials/building classes where known, weather, infrastructure, populations/Actors at the appropriate aggregation, world rules and already-validated mechanical effect—plus explicit uncertainty. It must not invent hidden measurements or fake precision. Server validation constrains scope, protected identities, impossible references and supported consequence types before committing authoritative Events.

Use **selective simulation** rather than a rigid body per brick or an entity per citizen. Resolve a city-scale effect at district/critical-structure/infrastructure/population-cohort scale, then materialize finer local detail only when play requires it. Important named Actors and established structures keep their own authoritative identities. This supports persistent changes such as a crater replacing a district, a diverted river, collapsed fortifications or a burned quarter without pretending to run CFD, finite-element analysis or millions of physical objects.

Visual generation happens **after** authoritative settlement. Text, 2D frames, video and future EXPLORE may depict the committed destruction, deformation or aftermath, but generated imagery cannot create, enlarge or undo consequences. If a later local scene is generated from a changed Location, it must reflect the new state rather than restore the pre-event world for visual convenience.

## Progression, rewards and world-scale settlement

Future [Progression Engine / Rulesets](RULESETS_AND_DYNAMIC_UI_BRIEF.md#progression-engine-and-reward-authority) integrates with this engine, not a second backend or parallel commit authority. A validated World Event/achievement can establish reward eligibility; it never writes arbitrary XP or abilities. The DM proposes semantic evidence/approach, trusted Reward Resolver policy validates eligibility/quantities/distribution, and Progression Engine owns staged track changes, reward receipts and Pending Advancement. Package entries affecting items, factions, relationships, access or titles use their existing domain validators and causal Events. Keep all applicable effects atomic with normal player/world settlement and campaign/timeline fencing.

**Progression Pacing Director** is bounded planning over Ruleset/content metadata, not a second DM, autonomous scheduler or reward issuer. Major Threads/Arcs can carry applicable recommended power bands and forecast reward budgets. It may flag mismatches and propose meaningful preparation hooks, training or warnings through normal bounded authoring; budgets never become grants and new hooks remain private until discovered. Preserve player choice, Deadline Pressure and World Autonomy rules. [Challenge Scaling and encounter materialization](RULESETS_AND_DYNAMIC_UI_BRIEF.md#challenge-scaling-and-encounter-materialization) owns intrinsic threat, party capability, encounter budget/envelope and pinned encounter mechanics; the World Engine cannot silently rescale an active encounter.

High-level/world-scale actions follow **player intent → Ruleset capability/prerequisite check → DM interpretation → bounded causal proposal → server validation → authoritative Event(s) → affected Actors / Locations / Threads / resources → persistent consequences**. Mass teleportation, resurrection, weather control, planar travel, major destruction, reality-changing rituals, city-scale attacks and extreme political/military actions are possible only when supported by actual capabilities and implemented typed mechanics. Resources, prerequisites, saves/resistance, agency, jurisdiction and constraints remain binding. Do not require a bespoke animation/script for every story possibility, but unsupported mechanical scope pauses rather than becoming unvalidated reality edits.

A city-scale attack may affect Location state, buildings/POIs, Actors/coarse population, factions, services/infrastructure, quests/hooks, migration, reputation, relationships, political Threads and future encounters. Use relevant aggregate state and selective simulation, not an entity per citizen. Large effects may require staged bounded causal settlement: pin authorized scope, costs/checks, causal dependencies and resumable stage receipts; each coherent stage commits atomically under existing fences. Preserve already committed consequences, disclose only safe pending status, and do not narrate uncommitted distant effects as complete. Repeated stages cannot repeat costs, destruction or reward entitlements; forecast consequences remain proposals until validated/committed.

Manual corrections remain authoritative. Memory may describe progression history but cannot supply authoritative amounts, and DM Craft may guide pacing/design but cannot grant progression. Text/2D/EXPLORE consume public projections; Interaction Bindings emit ordinary authorized action intents that may eventually yield validated Events/rewards. No renderer-owned progression or encounter state. Existing saves require compatible versioned extensions for progression receipts/tracks, pending choices and active encounter mechanics; no future-branch leakage or rematerialization on load.

## Time, triggers and deterministic selection

Only in-world time and committed causal changes advance the world. Wall-clock timestamps are audit/lease metadata. Closing the app, waiting overnight, refreshing, polling, logging in, changing language or creating a save must not advance fictional time. No cron progression or unattended swarm.

Meaningful actions, travel, rest, explicit time skips, important state changes and crossed deadlines may request evaluation. A session boundary may evaluate already-due work at the same world minute; it does not add time or charge a rest. Feedback/OOC is not a trigger. A trigger does not imply a model call.

Selection is server code: authorize owner/campaign; bind active timeline/epoch; read exact revisions and time interval; exclude completed or player-controlled actor decisions; check prerequisites, affected locations/actors, deadline crossings and prior trigger receipts. Deterministic consequences use validated code directly. If nothing is due, model cost is zero and state does not change.

After deterministic eligibility, a separately evaluated **optional Decision Model** may rank/filter authorized Thread/Actor candidates under the [Model Runtime contract](MODEL_RUNTIME_BRIEF.md#optional-decision-model-capability--design-only). It is disabled by default. Mandatory deadlines, warning/agency obligations, direct targets and necessary dependencies bypass pruning. Retain relevant **and uncertain** candidates; only sufficiently confident irrelevant optional candidates may be omitted from this request. Classifier failure retains candidates for the selected strong resolver, subject to bounded segmentation/pause; it never bypasses secrecy or changes that model. For 8 relevant + 5 uncertain candidates, a 12-thread cap cannot silently discard one. Classification creates no Event, changes no state and does not mark a pruned Thread resolved. The [final Phase 3.75 owner decision](PHASE375_ARCHITECTURE_DECISION.md) closes Jev evaluation with DO NOT ADOPT for this role. No benchmark continuation is scheduled; the extension remains conceptual, and any future different candidate requires fresh explicit evaluation/adoption authorization.

Proposed initial workload limits, subject to synthetic evaluation rather than promises of game balance:

| Autonomy | Eligible emphasis | Threads per evaluation | Referenced actors |
| --- | --- | --- | --- |
| Low | Explicit deadlines, directly affected/nearby active threads | 3 | 8 |
| Moderate | Important related goals and consequential off-screen developments | 8 | 16 |
| High | Broader important active goals with causal relevance | 12 | 24 |

Cap each segment at eight committed events and normally zero or one resolver request. These are maximums, not targets or token-cost optimization. Allocate the strongest configured task model an adequate context budget. Mandatory deadlines and consequences cannot be silently discarded when capacity is reached: persist remaining work and pause or propose a smaller interval. Multiple changes from one cause are validated together; a partial cap cannot sever required consequences.

## Deadline-pressure preference

Deadline pressure is orthogonal to World Autonomy and simulation On/Off.

- **Off:** elapsed in-world time alone cannot fail, expire or irreversibly complete quests, Adventure Hooks or autonomous Threads. Do not accrue a hidden backlog of missed deadlines. Exploration, resting and travel cannot punish the player through unseen countdowns. Direct causal processes initiated/entered by play still resolve: a lit fuse can explode, an active battle can finish, a burning room can burn, and a ship the player is currently watching depart can leave when that immediate scene logically resolves.
- **Critical Only:** suppress ordinary timed expiry; permit only scenario-critical deadlines that were explicitly established as part of the premise/current state. Apply normal knowledge/fair-warning rules.
- **Normal:** use the full bounded deadline policy below.

Deadline mode is a campaign setting captured by Saves/Timelines and applied prospectively. Changing it never rewrites committed history. Re-enabling deadlines does not execute a retroactive backlog; future deadlines resume from current authoritative state under an explicit reconciliation step.

## Consequence policy and fair warning

- **Background:** ordinary off-screen developments can complete: a merchant leaves or smugglers relocate. Disclosure still requires observable evidence or an authorized recipient.
- **Surface Before Complete:** an interactable, major player-relevant catastrophe can progress, but irreversible completion requires recorded warning and a meaningful chance to respond. A private clue existing somewhere is not proof the player was warned. Persist the warning's public event/recipient and opportunity boundary. The policy is a narrative constraint, not a promise that every tragedy is avoidable.
- **Hard Deadline:** under **Normal**, an established deadline genuinely occurs when crossed. Under **Critical Only**, only explicitly scenario-critical deadlines use this behavior. Under **Off**, autonomous/quest hard-deadline completion is disabled. Record what is known, by whom, and any explicit commitment such as “the ship leaves at sunset.” Hidden deadlines can have private consequences only when the selected deadline mode permits them, and cannot be used to disguise a surface-before-complete player arc as an unavoidable surprise.

Before a requested long skip, surface known consequential deadlines without revealing hidden ones. Where warning/agency is needed, offer the last coherent stopping point rather than secretly choosing the player's response or fabricating a past warning. A deadline is a conditional consequence with prerequisites, not permission to ignore changed circumstances.

Proposed Off behavior: do not evaluate autonomous threads and do not secretly accrue off-mode progression debt. Ruleset-owned direct costs still work. Preserve threads and record the disabled interval. Re-enabling presents an explicit reconciliation of overdue known deadlines/affected threads; never silently execute a backlog. Exact owner preference for re-enablement is an open design decision.

## Settlement, large skips and failure safety

Extend the existing turn operation, not a parallel action loop:

1. Preserve input and operation identity; bind state/settings/ruleset/model policy and timeline fence. Validate the player proposal and reuse recorded server dice.
2. Compute a proposed mechanical after-state and time interval without committing it. Deterministically select due world work against that causal transition. No due work follows the existing path unchanged.
3. If needed, persist an `awaiting world settlement` stage in the same pending operation. The resolver receives only relevant authorized evidence, actor knowledge and allowed operations. Return structured proposed events/patches, causes, source refs and any safe clarification requirement; it does not narrate to the player.
4. Code validates prerequisites, chronological consistency, agency, visibility, resource invariants, event identity, thread transitions, limits and source membership. World changes cannot overwrite a recorded player roll or make the chosen action succeed by assertion. If a bridge falls before arrival, resolve the travel boundary coherently rather than committing contradictory locations.
5. The primary DM narrates only validated public outcomes. Recheck the exact initiating fence/revisions and atomically commit the player outcome, applicable world events, state, memory source links and completed trigger receipt. No external call inside the database transaction.

A resolver failure preserves the pending operation, input, recorded dice and staged validated work. It commits neither a half-resolved player turn nor half a world update. Retry reuses stored results and event IDs; a stale result cannot bind itself to the newly active branch. Cancel/review follows explicit existing operation semantics, never a hidden reroll or automatic model fallback. An explicit manual correction invalidates affected staged work while preserving its audit history.

For a three-month skip, evaluate ordered causal boundaries/deadlines, not every hour/day. A bounded segment ends at the next consequential boundary, warning or workload limit. Persist staged progress against the initiating revision, with an explicit remaining horizon. If more work is needed, stop for **Continue simulation** or approval of a shorter coherent skip; do not chain unlimited model requests behind one click. Committing an approved prefix makes it actual history with its own stable operation; remaining time is a new explicit segment. No incomplete interval is reported as fully simulated. Lab checkpoints use the same exact-state rule, not a separate prose-only catch-up engine.

## Memory, privacy and saves

Reuse the existing public/private source paths and source-version invalidation. Index only committed world events. A private artifact acquisition may change private actor/thread state; it does not automatically create a public clue, recap or NPC memory. Later discovery is a separate validated public event with its own safe provenance link. Private causes, candidate counts, titles and failure details never enter public DTOs or ordinary logs. Actors act on their own knowledge; the resolver's access to private truth does not give that knowledge to every actor.

Register actor control, threads/progress/deadlines, events, warning/awareness evidence, pending settlement and trigger receipts with the existing manifest capture/validation/activation model. Preserve exact ancestry membership and the distinction between immutable origin and current serving fence. Timeline-specific corrections change that branch; applicable campaign-wide canon corrections invalidate derived/staged work without rewriting committed sibling events.

Current manifest validation accepts only schema version 1 and an exact record-family list. Adding families without a versioned reader would break old saves. A future migration must retain v1 loading, derive an explicit empty/unconfigured World Engine state for old saves, and create new versioned manifests without mutating old manifests. Never infer past autonomous events that were never simulated.


## RPG design doctrine

Future World Engine behavior should follow [RPG Design Doctrine](RPG_DESIGN_DOCTRINE.md): player-first systemic freedom, problems rather than single-solution puzzles, choice→consequence→recovery, fail-forward, honeycomb Threads/Hooks, micro- and macro-reactivity, stable character identity, environmental storytelling, lazy depth and campaign resilience after unexpected player actions. These are design evaluation rules, not permission for more simulation or implementation scope.

## Systemic/procedural references

See [Systemic World References](SYSTEMIC_WORLD_REFERENCES.md) for extracted design lessons from **Terra Randoma** and **Approaching Infinity**. They are references for procedural density, selective simulation, faction/world interactions, discovery and lazy generation—not visual-style targets. The binding principles are: structured procgen + AI semantics; bounded opportunity density; selective simulation only where it creates meaningful affordances; multi-scale maps over one authority; knowledge-gated discovery; and lazy elaboration rather than eager infinite content.

## Adventure hooks, Points of Interest and owner-directed density

A large generative world needs **interesting opportunity density**, not just physical freedom. Represent potential adventures as bounded latent hooks associated with a region/location and optionally one or more Threads. A hook is not automatically a quest, event or discovered fact. It may be a place, rumor, unusual activity, person, object, danger, mystery or other reason to investigate.

Create hooks from established geography/history/factions/Threads or from an explicit owner world-authoring request. Do not run an autonomous background “content generator.” Generate a finite batch when a separately authorized operation needs it, such as first meaningful location authoring or the owner saying in Chat with DM that an area feels empty. Respect requested themes/density/exclusions while preserving canon, agency and secrecy.

Keep latent premise/truth private. A player-visible POI is a knowledge-filtered projection created only through a valid discovery source such as direct observation, public geography, NPC rumor, clue, map/document or an already public event. Record stable identity and provenance so multiple rumors enrich the same POI instead of spawning duplicates. A POI can be unvisited, visited, changed, resolved, expired or no longer relevant without deleting its history.

Lazy elaboration is preferred. Seed enough to make the opportunity coherent; expand characters, interiors, encounters and detailed consequences only when play approaches them. Hooks may connect to persistent Threads, but the hook itself has no authority to settle consequences. The ordinary World Engine resolver/validation path remains responsible for causal progression.

The UI should not expose every latent hook or private count. It may later distinguish obvious landmarks, rumors, discoveries, activity, leads or unknown signals and offer owner-controlled visibility density. Ignoring a hook may allow its underlying Thread to progress under the normal fairness/deadline rules; wall-clock time and Chat with DM still do not advance world time.

## Future UX and non-goals

Inside-campaign **World / Мир** contains **Live World / Живой мир** and **What If / Что, если…**. Live World offers simulation On/Off, autonomy and player-known developments/warnings. It is not a debug dashboard or a private-state viewer. Natural-language requests such as “let the factions pursue their goals while we travel” become a small reviewable change, not a large configuration form. Preserve existing navigation/Saves and mobile More behavior; no UI is built now.

V1 excludes full economies/societies, minute-by-minute weather, autonomous tactical battle simulators, continuous background processing, per-NPC agents, branch-merging AI, arbitrary SQL/model writes and extra orchestration infrastructure. Wars/civilizations can use important institutions, supply constraints and decisive events at an explicit coarse resolution. Do not claim quantitative historical forecasting or total world fidelity.

## Future acceptance gates — not executed in this pass

- Zero fictional advancement from wall time, app closure, save/load, polling or session naming; correct explicit travel/rest/skip advancement and no-op zero-call behavior.
- Low/Moderate/High differ in eligible bounded scope; PC-controlled actors are never autonomously decided for.
- Background, warned catastrophe and established hard deadline scenarios; no fabricated warnings, omitted due work or unacknowledged off-mode catch-up.
- Duplicate triggers, timeout before/after commit, refresh, two tabs, rules/canon correction, timeline switch during resolution and cancellation: no duplicate event, reroll, cost or partial turn.
- Exact old-save/new-save restoration of threads, clocks, control, private plans and knowledge; abandoned events/summaries excluded before query limits; existing Phase 0–3.5 regressions preserved.
- Synthetic private markers absent from Live World, What If, normal APIs, recaps, logs and bundles; an NPC cannot act on unknown evidence merely because the resolver knows it.
- A long skip over many deadlines processes bounded causal segments and stops honestly at its evaluated horizon; repeated forks preserve source history and bounded memory.
- Model-quality evaluation of causality, warnings, uncertainty and agency is separate from schema/security tests. New paid/live evaluations require explicit authorization; finite samples cannot prove perfect simulation.
