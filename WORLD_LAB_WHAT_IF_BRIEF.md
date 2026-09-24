# World Lab / What If — architecture proposal

**Phase 3.75 design only, September 19, 2026. Not implemented or owner-approved.** Preserve accepted implementation `8099e0cca1463f767476190c456d4f3947e7c84e` and acceptance `6db58b5e3d464e4a09604ce344424c4fa8ed763e`. This document extends the existing Saves/Timelines architecture; it does not authorize simulation, model calls or campaign import.

**Current status:** the dated design note above is historical. D1 detached simulation and D2A single-model What If are now owner accepted, with their exact accepted boundaries and limitations in [DEV_STATUS](DEV_STATUS.md). D2B multi-model work remains unstarted and is deferred until Mega DM v1 is implemented, evaluated and owner-accepted. The forward order is **Mega DM v1 → D2B → Timeline Explorer V1 → Timeline Explorer V2 → Enter This World**; later visual work follows separately. The future descriptions below are not assertions that comparison or entry already exists.

## Product contract

Future campaign **World / Мир → What If** is a clearly labelled **NON-CANON** space. Natural-language requests such as “dragons exist during WWII,” “the Starks survive the Red Wedding,” or “a meteor hits Hogwarts” become reviewable structured premises. Simulation is an experiment in a chosen reality, not a reliable historical forecast or an instruction to alter the live campaign.

`Playable/source-world checkpoint → simulation fork → coherent intermediate checkpoints → optional Enter This World`

Every checkpoint references exact structured state, relevant original records, public/private knowledge and provenance. Generated narrative is a view of that state, never the only representation. A useful moment, including twelve minutes after a simulated impact, can become playable if a coherent checkpoint exists there. Do not promise arbitrary unrecorded instants; offer a bounded rerun/fork to create a missing checkpoint.

Saves remains the canonical inside-campaign Save/Load experience with Save Games and Timelines tabs and mobile More access. World/What If explains simulation intent and comparison and links to the same checkpoint/timeline identities. It must not build another save manager or node-graph requirement.

## Contracts before execution

The [World Library brief](WORLD_LIBRARY_AND_WORLD_PACKS_BRIEF.md) defines the versioned Scenario Contract. A **Divergence Contract** additionally pins the base world/pack and checkpoint, what changes, type of divergence (history/event/character/rule/outcome), approved assumptions, constraints and exact simulation start point. Approving “dragons in WWII” requires enough detail about when/where they exist and relevant capabilities to avoid silently changing the premise later.

A run records owner/campaign/timeline/run IDs; immutable scenario/divergence versions; continuity anchor; start and requested end/horizon; world resolution policy; ruleset/profile version if applicable; model execution profile; operation IDs; input dependencies; status and coherent checkpoint/head. Do not let a client supply arbitrary source IDs or private facts. Server authorization resolves all references.

The shared comparison base must pin **more than a save ID**. Existing historical saves do not rewind ordinary canon documents, global correction authority or every asset. Pin the exact approved source/pack/document versions, effective guidance, rules/appearance mappings and correction generation in a comparison input bundle. Every run receives the same approved factual inputs and visibility policy, though provider-specific transport/token accounting can differ. Record that digest with each run. Unsupported context capacity pauses the selected run; it never silently drops evidence to match a smaller model.

Changing a premise, material source, resolution policy or starting state creates a new contract version and fork. It cannot quietly change an already running experiment. A simulation divergence is a branch-local approved assumption, **not a campaign-wide canon correction**. Global corrections retain accepted authority: invalidate affected derived work, pause a run whose basis became inconsistent, and require an explicit new base/rebase fork. Historical inputs/results remain inspectable under current authorization and correction labels; they are not silently rewritten or served as current truth.

## Reusing Saves, with an explicit concurrency extension

The accepted implementation in `src/lib/saves/` and migrations `202609190008_phase35_timelines.sql` / `202609190009_phase35_fencing.sql` has one active campaign projection, immutable deduplicated row versions, exact manifest membership, preserved heads, and a monotonic activation epoch. Activation restores that projection and revokes old leases. Existing `{timelineId, epoch}` fences protect the serving active campaign. They do **not** by themselves make three inactive simulation branches concurrently writable.

Future implementation must extend that system as follows, rather than repeatedly switching the live campaign:

1. Reuse existing timeline/save/row-version identities and manifests. Add simulation-purpose and non-canon metadata, not a separate branch database or prose-only simulator state.
2. Introduce authorized **detached manifest readers** that resolve a selected immutable branch head without reading another timeline's active tables. Apply the same source, public/private, correction and knowledge validation used by Memory before ranking or limits.
3. Validate proposed branch changes against that detached input, then append immutable row versions and a new manifest with an atomic compare-and-swap of **that branch's head**. Never install its rows into the live projection just to run a model.
4. Extend the existing fencing vocabulary with a per-run lease generation and expected branch-head revision/base manifest. The execution envelope also binds owner, campaign, timeline, contract/source versions and canon generation. These conceptual additions require coordinated future contracts/migrations; no worker should invent a competing fence or SQL table independently.
5. Use the existing active epoch for operations that actually touch the playable projection, including Enter This World. A normal live timeline switch need not invalidate an independent detached run with unchanged authorized inputs; branch cancellation, source invalidation or changed run lease must reject its stale result. State this distinction explicitly in tests.

Current capture/restore has a fixed table-family allowlist and validates **manifest schema version 1**. Adding World Threads, control assignments, profile components or simulation records requires versioned readers/capture validation and explicit family mappings. Do not simply expand the version-1 required-table list and make old accepted saves unloadable. Preserve old manifests unchanged; an old save maps to “world engine unconfigured/no threads” where appropriate, not invented historical simulation. Incompatible profiles or unmappable state pause safely before activation.

Detached readers/writers also need adapters for existing TurnStore/MemoryStore/domain validation seams; current active-projection readers cannot be claimed to support them unchanged. Index world events through the accepted Memory path, with exact manifest/source membership and inherited entity identity. Reuse correction invalidation and public/private summaries; do not create a second retrieval layer. A shared immutable vault reduces duplication while each run has its own mutable head/lease.

For a source world without a playable campaign, a future private campaign workspace can host this same timeline system with explicit non-playable purpose until entry. That workspace binds the owner-level World Pack; the pack itself is not disguised as a campaign. Separate campaign instances get distinct campaign entity IDs with origin mappings; forks within one family preserve those identities.

## Bounded simulation and failure handling

The [World Engine](WORLD_ENGINE_BRIEF.md) resolves meaningful causal intervals, not every minute or citizen. Start/Continue authorizes a finite in-world horizon and bounded workload. Code selects due actors/threads/deadlines first; deterministic/no-op steps make no model calls. Simulation events commit with their causal order, world time, knowledge and originating operation. An explicitly selected aggregate World Logic policy can model institutions/war without pretending to run every soldier's tabletop combat.

No wall-clock progression, cron or always-running agents. A finite authorized request may finish while its page is backgrounded; the application must not invent additional simulation after that horizon. Interruptions preserve the last coherent committed checkpoint and pending input. Stop, capacity limits or unresolved assumptions pause at a boundary and explain what is needed. A provider failure leaves the preceding head valid, cannot duplicate events or reroll recorded results, and never substitutes a model automatically.

Unresolved player checks/turns from an inherited checkpoint are not permission to choose the owner's action. Start from a stable boundary, or require an explicit scenario assumption and valid transition. Preserve any pending original results; do not silently discard/reroll them. When a PC is intentionally simulated as an NPC in a non-canon experiment, the owner explicitly authorizes that branch-local control change. It never changes the original playable PC.

Use a small durable run/job ledger and concurrent server requests outside SQL transactions, with short branch-local commits. No distributed event bus, orchestration platform or one agent per actor. The World Resolver has no player-facing persona; the normal RPG still has one primary DM.

## One to three models and comparison

The owner selects **1–3 independent runs** from the identical approved base. Proposed default: one; comparison explicitly selects two or three. Each gets its own timeline, run ID, model/options/provenance, lease, head, artifacts and failure status. Provider requests can genuinely run concurrently; one refusal or timeout does not block another run's success. A shared configured provider credential is an application secret, never copied into a run or campaign record.

Compare public structured outcomes at matched checkpoints/world times: shared outcomes or apparent consensus, changed factions/relationships/locations, major divergences and uncertain/unresolved results. Normalize by inherited entity IDs or approved scenario mappings, not fuzzy names alone. Mark unequal progress, failed runs and different policy versions clearly. Similar conclusions are not statistically independent evidence or proof of correctness. No “which model won” scoreboard and no secret-revealing comparisons from private event counts/diffs.

A future optional [Decision Model](MODEL_RUNTIME_BRIEF.md#optional-decision-model-capability--design-only) may label public outcome similarities/divergences after those deterministic matching and privacy checks. It is an advisory comparison aid: ambiguous cases stay visible/uncertain or go to the explicitly selected reasoning path, not silent exclusion. Labels cannot merge timelines, establish canon, rank a winner, authorize promotion or mutate either run. The [final Phase 3.75 owner decision](PHASE375_ARCHITECTURE_DECISION.md) closes Jev evaluation with DO NOT ADOPT for this role. No benchmark continuation is scheduled; the extension remains conceptual, and any future different candidate requires fresh explicit evaluation/adoption authorization. No classifier or external evaluation surface is a required Lab dependency.

Deterministic code and recorded dice remain authoritative. If a future experiment requests a shared RNG seed, record its policy and align only genuinely identical checks; diverging causal actions cannot be forced onto the same roll stream to manufacture comparability. Same inputs across generative models do not imply identical outcomes or universal reproducibility.

The owner may select Model A's July 1943 checkpoint and continue with A, B and C. Reuse the same checkpoint as the new approved base; create three children, retaining ancestry and previous provenance. No relabelling old A artifacts as B-generated. Changing a model mid-run otherwise pauses for explicit approval and creates a visible continuation boundary. See [Model Runtime](MODEL_RUNTIME_BRIEF.md).

## Timeline Explorer V1 and V2 — future views over accepted authority

**V1** is a read-only, interactive, spoiler-safe projection of existing Saves/Timelines and World Lab ancestry and exact checkpoint identities. Distinguish the original playable history from **NON-CANON** simulation branches; show divergence point, parent/child lineage, coherent checkpoints, fictional time, run/model label when applicable, run status and a public summary. Inspect is read-only; continue/fork is offered only where its existing authority permits it. Compare appears only where supported; Enter This World remains a later separate operation. A node graph is optional presentation, not an architectural requirement. No second save database, branch head or timeline authority is created.

**V2** extends V1 with validated parent-to-child deltas, causal transition summaries, parallel run branches, matched-horizon *public* comparison and clearer divergence inspection. Derive all of it from authorized exact manifests/checkpoints and existing knowledge/privacy filtering before ranking or display. Do not expose private plans, hidden counts, future-source knowledge or raw resolver context. V2 cannot merge branches, rewrite history or promote a simulation into playable Canon. Implement both Explorer slices only after D2B in the current forward plan, and before Enter This World.

## Enter This World

From any suitable coherent checkpoint, **Enter This World** creates a new playable child timeline. It is a validated materialization/activation operation built on accepted save/load, not reconstruction from a recap and not a merge into the original history.

1. Choose the exact checkpoint and review public state, provenance, unresolved gaps and entry eligibility. Reauthorize every referenced record and reject stale heads/leases.
2. Choose current PC, an existing canon character at this checkpoint, a simulated person/role, or a new original character. Reuse the selected existing entity; create a new identity only for a genuinely new person. Cross-world import of a current PC requires an explicit crossover/adaptation mapping of memories and possessions.
3. Choose the inherited world/profile default, World Logic, an available full ruleset, or an approved custom profile. Validate component mappings and required fields. Keep world history intact; new mechanics govern future uncertainty. Missing playable detail requires an explicit approved entry supplement, not silent backfilled source history.
4. Preserve exact existing public/private state, entity relationships, events, resources and per-actor knowledge. Carry source/contract/model provenance. Exclude later simulation checkpoints, sibling futures and future source outcomes through exact membership/cutoffs.
5. Create a playable child manifest with a recorded entry transition and branch-local control assignment. The selected PC ceases to be autonomously controlled in this child. Personality/canon informs play without forcing decisions. Establish a coherent resumable session if none exists; do not reuse another branch's execution lease.
6. Validate compatibility, safety-save the current playable head and atomically activate the child using the existing monotonic epoch mechanism. Idempotent retry returns that same child rather than creating duplicates. Failure leaves the old active projection intact.

The **original playable timeline and simulation history remain unchanged and inspectable**; activation may change which timeline is selected, just as accepted load does. Simulation branch heads continue independently only within their authorized jobs. No branch merge, retroactive rewrite, guessed inventory restoration or automatic model call merely to promote/load. If entry is blocked by a pending unsupported operation, missing state or source conflict, preserve all records and explain the required resolution.

Lab inspection never grants the player character knowledge. Normal Lab/player APIs must not expose DM-private plans, raw resolver prompts, hidden event titles/counts or inherited secrets. Owner-authored source materials and explicitly public simulation reports are separate from engine-private state. The owner may remember having read a book, but actor retrieval still enforces positive knowledge. There is no new spoiler/debug bypass here.

## Future acceptance gates — not executed here

- Two unrelated scenarios and 1–3 parallel runs remain non-canon and isolated; active campaign rows/head never change merely by running or comparing experiments.
- Contracts, complete shared input versions and model provenance remain pinned; one failed provider leaves siblings healthy and no automatic fallback occurs.
- Detached readers filter branch/actor/private sources before retrieval limits; stale/cancelled/invalidated callbacks cannot commit. Test both independent live switches and genuine run-fence changes.
- Exact checkpoint round trips include World Threads/deadlines/private plans, resources, corrections and knowledge. Version-1 saves still load safely; new record families do not invalidate old manifests.
- Intermediate Enter This World yields exact playable state and a valid session/control/ruleset mapping; original and simulation manifests remain unchanged. Duplicate promotion is idempotent, failed promotion atomic.
- Existing character takeover has one identity, no autonomous PC actions and no future-source/sibling knowledge. New/crossover entry supplements are explicit and attributable.
- Model-A checkpoint continuation with A/B/C preserves ancestry and matched-base comparison; unequal horizons or failed results are honestly labelled.
- Synthetic private canaries never appear in ordinary state, comparison, counts, diagnostics, narration or approved visual projections. Finite tests cannot guarantee perfect causality, branching, memory isolation or recovery.

Owner decisions: default run count, exact World/What If labels and public detail, and proposed implementation order. Recommended: one run by default, explicit 2–3 comparison, simple chronological checkpoints and summaries rather than a graph.
