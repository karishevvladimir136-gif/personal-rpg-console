# World Engine — architecture proposal

**Phase 3.75 design only, September 19, 2026. Not implemented or owner-approved.** This pass authorizes documentation, not runtime work, migrations, UI, provider calls, deployment or imports. Accepted baseline: Phase 3.5 implementation `8099e0cca1463f767476190c456d4f3947e7c84e`, acceptance `6db58b5e3d464e4a09604ce344424c4fa8ed763e`. Earlier accepted checkpoints remain preserved.

## Purpose and connected design

Natural language in → structured reality underneath → natural language out. Important people, factions and situations continue to pursue goals as the fictional world changes. Resolve causally meaningful narrative state, not every citizen, meal or minute. This supports fantasy, literary/romance, historical, military, political and civilization-scale stories through different levels of detail, not through a microscopic planetary simulator.

The primary gameplay DM remains one runtime. A World Resolver is a bounded structured decision task used by it and by the future Lab. It has no personality, player conversation or autonomous agenda. There is no LLM per NPC and no second DM.

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

## Small core: Actor → Thread → Event

| Concept | Minimum logical content |
| --- | --- |
| World Actor | Reference to an existing stable entity or a future typed faction/institution record; capabilities, relevant relationships, location, control assignment, knowledge references and applicable revision |
| World Thread | Stable ID, campaign/timeline scope, actor references, goal/threat/opportunity, state, prerequisites, dependencies, locations, optional progress/target, next evaluation time, optional deadline, consequence policy, visibility, source/provenance references and revision |
| World Event | Stable event/operation ID, campaign/timeline, in-world time and ordering, actors/location, originating thread, cause references, validated consequences, source references, visibility and explicit witnesses/recipients |

Use a thread's progress/deadline fields for clocks. A separate generic Clock service is unnecessary. Actors reference the same people shown in Character/Party; an actor role is not another person record. Player-controlled actors cannot receive autonomous decisions. Organizations may have aggregate capabilities without pretending each member is a separately simulated entity.

An Event is immutable factual history only after validation and commit. A proposed event, rumor, actor intention or simulation assumption is not a completed fact. Keep the accepted memory statement kinds and add origin classification orthogonally: source fact, source inference, approved scenario assumption or committed simulation fact. Exact after-values and original causes are retained; prose is a presentation of those records.

World rules (magic, technology, geography, institutional constraints) describe what is possible. A Ruleset Profile describes how uncertain player-scale actions and resources are resolved. Neither a World Thread nor a World Event requires HP, AC, classes, spell slots, d20s, or a provider-specific object.

## Time, triggers and deterministic selection

Only in-world time and committed causal changes advance the world. Wall-clock timestamps are audit/lease metadata. Closing the app, waiting overnight, refreshing, polling, logging in, changing language or creating a save must not advance fictional time. No cron progression or unattended swarm.

Meaningful actions, travel, rest, explicit time skips, important state changes and crossed deadlines may request evaluation. A session boundary may evaluate already-due work at the same world minute; it does not add time or charge a rest. Feedback/OOC is not a trigger. A trigger does not imply a model call.

Selection is server code: authorize owner/campaign; bind active timeline/epoch; read exact revisions and time interval; exclude completed or player-controlled actor decisions; check prerequisites, affected locations/actors, deadline crossings and prior trigger receipts. Deterministic consequences use validated code directly. If nothing is due, model cost is zero and state does not change.

After deterministic eligibility, a separately evaluated **optional Decision Model** may rank/filter authorized Thread/Actor candidates under the [Model Runtime contract](MODEL_RUNTIME_BRIEF.md#optional-decision-model-capability--design-only). It is disabled by default. Mandatory deadlines, warning/agency obligations, direct targets and necessary dependencies bypass pruning. Retain relevant **and uncertain** candidates; only sufficiently confident irrelevant optional candidates may be omitted from this request. Classifier failure retains candidates for the selected strong resolver, subject to bounded segmentation/pause; it never bypasses secrecy or changes that model. For 8 relevant + 5 uncertain candidates, a 12-thread cap cannot silently discard one. Classification creates no Event, changes no state and does not mark a pruned Thread resolved. Require the synthetic recall-first Phase 3.75A spike and separate adoption approval before any live pruning.

Proposed initial workload limits, subject to synthetic evaluation rather than promises of game balance:

| Autonomy | Eligible emphasis | Threads per evaluation | Referenced actors |
| --- | --- | --- | --- |
| Low | Explicit deadlines, directly affected/nearby active threads | 3 | 8 |
| Moderate | Important related goals and consequential off-screen developments | 8 | 16 |
| High | Broader important active goals with causal relevance | 12 | 24 |

Cap each segment at eight committed events and normally zero or one resolver request. These are maximums, not targets or token-cost optimization. Allocate the strongest configured task model an adequate context budget. Mandatory deadlines and consequences cannot be silently discarded when capacity is reached: persist remaining work and pause or propose a smaller interval. Multiple changes from one cause are validated together; a partial cap cannot sever required consequences.

## Consequence policy and fair warning

- **Background:** ordinary off-screen developments can complete: a merchant leaves or smugglers relocate. Disclosure still requires observable evidence or an authorized recipient.
- **Surface Before Complete:** an interactable, major player-relevant catastrophe can progress, but irreversible completion requires recorded warning and a meaningful chance to respond. A private clue existing somewhere is not proof the player was warned. Persist the warning's public event/recipient and opportunity boundary. The policy is a narrative constraint, not a promise that every tragedy is avoidable.
- **Hard Deadline:** an established deadline genuinely occurs when crossed. Record what is known, by whom, and any explicit commitment such as “the ship leaves at sunset.” Hidden deadlines can have private consequences, but cannot be used to disguise a surface-before-complete player arc as an unavoidable surprise. The owner can explicitly approve a harsher premise in the scenario contract.

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
