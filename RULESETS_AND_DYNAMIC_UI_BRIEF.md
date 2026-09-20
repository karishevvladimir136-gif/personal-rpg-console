# Rulesets and Dynamic UI — architecture proposal

**Phase 3.75 design only, September 19, 2026. Not implemented or owner-approved.** This document changes no character record, rule, check, sheet, inventory, configuration or UI. Preserve the accepted Phase 3.5 implementation and all earlier campaign behavior.

> No world, campaign, character, save, timeline, World Engine thread or What If simulation may depend structurally on D&D 5e. D&D 5e is one selectable ruleset, not the RPG Console's universal ontology.

The owner should describe a world and how they want to play in normal language. Structured profiles and code enforcement remain underneath. The same app shell can host a fantasy adventurer, a WWII dragon rider, a literary relationship story or a political scenario without inventing HP and spell slots for every person.

## Honest baseline and reuse

The accepted records already separate stable entities from item ownership, storage and equipment. `src/lib/persistence/contracts.ts` allows nullable HP, general numeric stats/resources and configured equipment slots. That is useful flexibility, but not a complete ruleset-neutral engine. Entity kinds, mutation schemas, visible checks, combat controls and character editors still carry fixed assumptions.

`src/lib/gameplay/mechanics/profile.ts` and `gameplay/contracts.ts` currently accept **console-basic-v1**, a small explicit house profile. `src/lib/gameplay/dice.ts` rolls d20s with advantage/disadvantage; the plan schema uses fixed skill/attack/save fields. `gameplay-configuration.tsx` correctly disclaims official D&D support. Do not call this a complete D&D 5e implementation. Preserve existing 5e-oriented campaigns and previews through a compatibility profile; add a declared D&D 5e edition/coverage profile later if authorized and verified.

Reuse the turn engine's accepted input, operation/check IDs, recorded results, server validation and atomic commit. Keep existing inventory identities, component provenance, manual-correction authority, settings versions and save manifests. Do not introduce a second inventory or a second character database.

## Three profile modes

| Mode | Meaning | Authority |
| --- | --- | --- |
| Full Ruleset | A declared supported system/edition, e.g. D&D 5e with explicit supported features and house rules | Versioned server implementation and validated profile; unsupported mechanics pause |
| World Logic | World facts, character capabilities and physical/social circumstances resolve narrative uncertainty; dice optional | Bounded structured proposals, world constraints, evidence and code-validated allowed transitions |
| Custom Ruleset | Owner-approved structured rules compiled from natural-language instructions | Safe declarative primitives interpreted/validated by server code, never arbitrary generated code |

World Engine answers what exists, what changes, what actors pursue and what events occur. Rulesets answer how uncertainty, costs, checks, resources, progression and supported capabilities are resolved, including prerequisites for world-scale actions; the World Engine settles their bounded causal consequences. A Lab run can exist without a traditional tabletop system; it still pins world rules, a resolution policy, constraints and a schema version. World Logic is a real explicit profile, not “skip validation and trust the model.”

A profile has a stable ID/version, mode, label, applicable capabilities, fields/resources, action definitions, check/effect semantics, equipment/storage rules, presentation schema, supported conversions and validator version. Profiles do not contain provider credentials or mandate a model. Logical names here are design contracts, not implementation tables or plugins.

## Neutral identity and optional mechanics

Separate a stable person/object/location from its mechanics components:

- Identity: campaign-owned entity ID, name/aliases, source origin where present, descriptive facts, relationships, location and knowledge references.
- Control: explicit branch-scoped player/NPC control assignment; not an immutable species, class or character identity. Preserve historical control and never duplicate the person merely because control changes.
- Capabilities: established abilities, limitations and relevant social/physical facts, with source/provenance and validity.
- Mechanics: optional typed profile components such as HP/AC, fatigue/ammunition, stress/neural load, reputation or spells. No universal requirement for level, class, six ability scores, armor, humanoid slots or combat initiative.

Existing `kind: player/companion/npc` and HP fields remain readable through compatibility mappings. A future transition must explicitly migrate or adapt schemas, validators, database constraints, context projection and UI together; dropping fields from a screen alone does not remove a structural dependency. Old saved values are retained, not reinterpreted as a different mechanic.

Existing canon-character entry reuses [continuity anchors and source snapshots](WORLD_LIBRARY_AND_WORLD_PACKS_BRIEF.md). Within a campaign, transfer control of the same entity. Across independent campaigns, create a separately scoped instance once, linked to its pack identity; source identity must not become shared mutable gameplay state. Player control suspends autonomous decisions for that actor in the playable branch. Character fidelity informs expectations and NPC reactions, never forces the owner to repeat canon choices, emotions or romance outcomes.

## Resolution and custom rules without programming

The profile supplies allowed actions/check definitions and costs. The DM proposes typed actions and evidence; the server validates current scope, ownership, availability, prerequisites, bounds, agency and supported operations. Exact resource arithmetic, inventory changes, cooldowns, rerolls and any required randomness belong to code. No model-written number becomes a recorded die result.

Generalize the existing recorded-check envelope to identify check system/version, parameters, dice or other supported random method, raw recorded results, interpreted outcome and disclosure policy. Preserve old d20 results verbatim. A no-dice social decision creates a validated narrative outcome with its grounds, not a fictitious dice record. Animation still presents already-recorded results and never determines them.

World Logic may accept qualitative outcomes such as injury, lost access or a relationship event under approved constraints. Code can reject impossible references, forbidden resource mutations and violated declared constraints; it cannot prove every historical, physical or emotional judgment correct. Missing evidence or unresolved contradiction pauses for clarification. Quality evaluation must test plausible causality and agency separately from schema checks. Internal relationship dispositions are not automatically public numeric meters.

For custom rules, natural-language instructions compile into a reviewable profile draft using a bounded vocabulary: typed fields, thresholds, capped arithmetic, explicit costs, prerequisite predicates, finite outcome/effect tables, expiries and slot compatibility. Show plain-language examples and unsupported parts. The owner approves a new immutable profile version. No JavaScript/SQL evaluation, arbitrary remote tools, recursive workflows, general scripting language or low-code platform. If a requested rule cannot be expressed safely, report it as unsupported and retain the draft; do not pretend prose alone enforces it.

Mechanical changes apply prospectively at a coherent boundary. Do not switch profiles mid-roll, rest or encounter by recomputing a stored result. A change request supplies an explicit mapping/preview, incompatible-field handling and owner confirmation. Missing mappings pause; never silently heal, invent ammunition, convert relationships into HP or delete possessions. Preserve the old profile and exact state in its saves. Purely presentational layout changes cannot mutate mechanics.

## Progression Engine and reward authority

**Final planned foundational product-architecture addendum before the separately scoped production coding sprint; design only. Progression is required for RPG-capable Rulesets, but XP, levels, classes, encounter levels and skill trees are not universal engine ontology.** A profile defines progression, including a deliberate Off mode or zero tracks. The current “XP if used” display is not an implemented authoritative progression loop.

Conceptual flow: **authoritative Event / validated achievement → Reward Resolver → one or more Progression Events → staged Progression Track updates → threshold/prerequisite evaluation → Pending Advancement where applicable → explicit player choices where needed → server validation → authoritative atomic commit**. Staged updates are not partially persisted mechanics. The initial settlement can atomically commit the earned grant, track values and a pending choice; a later player selection atomically consumes its resources, installs valid choices and completes that pending advancement. Do not keep a database transaction open while waiting for the player.

The DM may propose semantic classifications with evidence: objective completed, encounter resolved/significance, approach used, discovery, training, meaningful contribution, story milestone, successful command decision or fictionally learned technique. A model label alone is not an authoritative achievement. Trusted Ruleset/server logic validates eligibility and determines quantities, affected tracks, thresholds, caps, unlocks, choices and distribution. Never implement `xp += whateverTheLLMSaid`. Manual owner corrections remain highest authority through explicit, versioned, validated correction/grant operations, not hidden model edits.

### Composable Progression Tracks

A Ruleset defines zero or more tracks, not one universal XP bar. Tracks may be numeric, ranked, milestone-based or ordered-state, capped or open-ended. A conceptual definition/state pair may include stable track ID, Actor/campaign scope, category/type, current value/rank/state, applicable thresholds, eligible source Event categories, advancement policy, reward/unlock table, prerequisites, dependencies on other tracks, cap and Ruleset/version provenance. Only require fields meaningful to that profile. Campaign instances always carry `campaign_id`, relevant Actor identity and timeline/version membership; reusable definitions do not share mutable progress across campaigns.

| Progression school | Ruleset-owned behavior |
| --- | --- |
| Classic XP / character level | Quest, encounter and objective rewards feed general XP and level thresholds. The profile owns XP tables, encounter/creature valuation, caps, class/subclass/multiclass requirements, features, spells, feats and ASI/stat choices; core code hard-codes no D&D values. A crossed threshold creates Pending Advancement rather than silent permanent AI choices. |
| Milestone | Validated achievements advance an ordered state/rank or open a choice; no fabricated numeric XP is required. |
| Use-based skills/mastery | Meaningful sword, bow, stealth, medicine, diplomacy, gunnery, driving or command use can affect only the relevant supported tracks. Eligibility considers actual challenge/outcome, difficulty, novelty, repeated target/action limits, diminishing returns, structured training and source identity. |
| Career / institutional rank | Achievements, competence, service/time, training, reputation, organizational opportunity, superior/authority decisions and campaign circumstances can enable promotion. Generic XP does not universally make a person a Major. |
| Secondary / transformative | Mythic paths, pact evolution, transformation, cyberware, attunement, faction standing, research, command, crew cohesion, legendary mastery and realm authority may coexist with other tracks. |
| Hybrid or Off | Combine supported tracks/dependencies, or disable progression grants/advancement deliberately; Off does not disable ordinary validated world consequences or inventory transfers. |

Use-based progression is not unrestricted repetition farming. Engaging a real enemy accurately under combat conditions may improve Gunnery; thousands of shots into an empty wall do not automatically confer mastery unless an explicit training policy models that practice. Even then, practice has the profile's limits and source identity.

Dependencies are declarative, bounded prerequisite predicates, not generated code. For example Character Level ≥ 5 + Sword Mastery ≥ 4 + one Advancement Point may make an advanced sword technique unlockable. Eligibility is separate from ownership, and spending the point happens only in a validated atomic unlock. Detect unsupported/cyclic dependencies and do not cascade unbounded awards. Multiple thresholds crossed in one grant must produce the profile's ordered valid choices without skipping required selections or granting the same level twice.

Hybrid examples demonstrate distinct mechanisms: a fantasy profile combines general XP → level, meaningful sword use → mastery and level + mastery + point → technique. A WWII tank-crew profile may use Gunnery, Driving / Vehicle Handling, Tactical Awareness, Crew Cohesion, Command proficiency and Military Rank / Career. Combat/training, shared battle history and leadership feed appropriate tracks; Lieutenant → Captain → Major follows career policy and circumstances rather than fantasy XP unless a custom profile deliberately specifies otherwise. These are illustrative profiles, not researched historical promotion tables or implemented rules.

### Reward Packages and valuation

Quests/objectives support typed **Reward Packages**, not just `completed = true`. Where supported, package entries can grant general XP, skill/mastery progress, advancement/perk/feat points, items, currency, reputation, faction standing, career/rank progress, relationship consequences, titles, training opportunities, latent abilities, access/content unlocks and secondary-track progress. Every entry uses its owning domain's validator; world/faction/relationship consequences stay authoritative Events, not a conversion of everything into XP. Existing item ownership and relationship records remain the source of truth.

Packages can reflect both what happened and how. A hostage rescue may earn baseline objective XP plus relevant Stealth progress for stealth, Diplomacy for negotiation, or combat mastery for fighting under the profile's eligibility rules. Alternative approach entries are not automatically cumulative, and an encounter plus its enclosing quest cannot accidentally count the same reward twice. The DM classifies the approach; trusted policy determines mechanical amounts and legitimate stacking/exclusions.

Reward Resolver valuation may use canonical threat, challenge relative to participants, objective significance, encounter scale, risk, contribution, novelty, discovery significance, campaign importance, solution method and difficulty policy. Ruleset/content profiles own tables and formulas; there is no universal `bandit = 50 XP` or `dragon = 5000 XP`. Freeze relevant valuation inputs/policy with settlement so a retry or later level change cannot recalculate a different award.

Eligible sources can include combat and noncombat encounter resolution, quests/objectives, discoveries, exploration, social achievements, investigation, research, training, story milestones and command achievements. Prefer meaningful challenge resolution over corpse farming where the profile supports it: defeating an ancient dragon, negotiating a treaty, forcing retreat, recovering what it wants, trapping it or another legitimate solution may earn an appropriate reward. Kill XP is allowed only when the selected Ruleset intentionally defines it; it is not the engine's implicit goal. Trivial repeated challenges may give reduced/no vertical progression under explicit policy.

Companion/Actor distribution is profile/campaign policy: shared party XP, individual contribution, synchronized party advancement, independent NPC advancement or custom distribution. Never assume universal companion level matching. Autonomous advancement still needs validated Events/rules and normal bounded settlement, not arbitrary background AI mutation; player-controlled permanent choices remain explicit unless the profile defines automatic advancement.

### Reward identity, atomicity and corrections

Every durable grant links to a stable authoritative source: Event, encounter, objective/quest, discovery, training Event or explicit manual grant. A conceptual uniqueness boundary includes campaign/timeline lineage membership, source identity, reward-policy entitlement, package entry and recipient/track as applicable. One entitlement applies at most once; retries cannot obtain a fresh entitlement merely by using a new request ID or a new policy version. A repeatable training/reward policy must explicitly define a genuinely new eligible source/occurrence.

Progression settlement participates in existing atomic turn/world settlement, leases, expected revisions and timeline-epoch fencing. Grant receipts, track changes, non-progression package effects and pending advancement state commit coherently or not at all. Model retry, API timeout, refresh, reconnect, duplicate settlement/request, save/load, crash recovery and replayed Event handling cannot duplicate rewards. A failed or stale choice cannot spend points without installing the ability or install it twice. Revalidate owner/campaign, active branch, source/recipient eligibility, prerequisites, remaining resources and effective policy before commit.

Inherited receipts in a fork prevent re-awarding already committed ancestry. A branch may earn its own genuinely future reward independently; later sibling or abandoned-future receipts are not pulled into its history. Source eligibility and receipt membership must both follow the saved history, not a global “already rewarded anywhere” flag or a scan of all future Events. Manual corrections retain provenance and invalidate/reconcile affected eligibility explicitly, without deleting historical receipts or silently replaying old rewards.

### Advancement, abilities and latent learning

**Pending Advancement** records source, beneficiary, track/policy version, earned threshold/rank, available validated choices, unspent resources and status. **Character → Progression** offers LEVEL UP AVAILABLE / ADVANCEMENT AVAILABLE and a Before / After preview. Supported choices can include class level, subclass, multiclass, feat, ASI/stat increase, spells, skills, proficiencies, perks, class features and special/mythic options. Final selection is server-validated; AI cannot silently choose permanent mechanics unless the Ruleset explicitly defines automatic advancement. The [product UX](MASTER_SPEC.md#progression-and-advancement--future-product-design) stays small and profile-specific.

Separate **Ability Definition** (versioned supported mechanics), **Actor ownership/unlock state** and **progression eligibility**. Acquisition can come from class/level, feat/perk, mastery, training/teacher, research, artifact, pact, cyberware, mutation/transformation, story Event or another validated mechanic. Retain source and version for each; discovering a definition never grants permission to use it.

An optional discovered/latent ability records learning provenance and prerequisites while remaining unusable. For example a fictional “Braavosi Counter” learned from a sword master could be LATENT until Level 5, Sword Mastery 4 and one Advancement Point; once eligible, the player may explicitly unlock it under the profile. This is an illustrative label, not fixed RPG Console terminology or imported proprietary mechanics. Player-visible latent entries require actual discovery and cannot disclose hidden unlocks/prerequisites through disabled UI.

AI-generated custom abilities are optional and Ruleset-controlled. The model may propose name, flavor, source, intended role and bounded typed mechanics. Server/profile validation must cover supported primitives, quantities, costs, prerequisites, targets, duration, stacking and bounds. Candidate primitives include damage, healing, check modifiers, resource effects, conditions, movement, summons and other explicitly supported mechanics; listing a primitive does not imply it is implemented. Never execute generated code or accept unvalidated direct state mutation. An unsupported fictional effect can remain narrative-only when it has no mechanical consequences, or pause as unsupported; it cannot silently become an enforceable rule.

### World Magic Rules and spellcasting profiles

Magic has **two distinct layers**. **World Magic Rules** belong to the campaign/world and define what supernatural phenomena are possible or impossible: available traditions/domains, metaphysical constraints, sources of power, conservation/tradeoffs, environmental dependencies, rare exceptions and the maximum credible scope of effects. **The active Ruleset** defines how an Actor gains access to those capabilities and how a concrete use is paid for, targeted, checked, resisted, sustained and resolved. Neither layer is universal, and changing presentation cannot change either.

A declared Full Ruleset may provide detailed spellcasting semantics. A D&D-like profile, for example, may distinguish class access, known or spellbook-owned spells, preparation, spell slots or equivalent resources, concentration, ritual casting, components, ranges/areas, durations, attack/save resolution and scaling. Exact edition coverage must be explicitly implemented and verified before the product claims full support; do not infer missing official mechanics from model familiarity. Other campaigns may use mana, fatigue, pacts, freeform domains, ritual-only magic, skill/mastery, environmental energy, technology-like supernatural systems or no magic at all.

For spell-capable Actors, keep **Ability Definition**, ownership/unlock, preparation/selection, current resources and castability separate. A spell can exist in the world without being known, be known without being prepared, be prepared without being currently affordable, or be available from a source without being owned. The server derives current castability from authoritative state and profile rules. The DM can interpret intent and propose semantic effects but cannot fabricate spell ownership, preparation, costs, prerequisites or permission.

Valid high-scale magic may cross from encounter mechanics into bounded world settlement. If World Magic Rules and the Ruleset authorize terrain manipulation, city-scale fire, mass weather effects, planar changes or comparable scope, the result can create persistent typed World Events and Location/terrain changes rather than collapsing to flavor text. Large scope increases the need for explicit costs, prerequisites, resistance, uncertainty bounds and staged settlement; it does not create a blanket permission to edit reality.

### Caps and continued power growth

**Level caps are Ruleset policies, not RPG Console engine limitations.** A profile may have no levels, hard/soft caps, open-ended mastery, capped vertical progression plus other tracks, or independent caps. The core must not inherit a videogame's technical level limit as a world law.

Post-cap rewards may continue horizontally (techniques, feats/perks, spells, mastery, alternate abilities, specialization, equipment/artifacts), socially (reputation, titles, land/holdings, followers, military command, political authority, faction access, jurisdiction) or through epic/transformative tracks (mythic ranks, divine favor, pacts, legendary mastery, transformation, world-scale powers). Policy chooses appropriate packages instead of continuing meaningless unusable XP when it disables post-cap XP. Do not erase earned power or automatically grant political authority from character level. [World Leverage](POV_AND_WORLD_LEVERAGE.md#progression-and-world-scale-capabilities) combines actual abilities, resources, position, relationships, institutional authority, tracks and current constraints.

## Challenge Scaling and encounter materialization

**Challenge Scaling is a Ruleset/campaign policy; Hybrid is the recommended general RPG default, not universal full level scaling.** Neither full party-level matching nor fixed level zones are mandatory. Only expose modes supported by the active profile; World Logic/non-level campaigns can use qualitative capabilities and may omit inapplicable controls.

| Mode | Contract |
| --- | --- |
| World Anchored | Threats have largely intrinsic power. A weak party meeting an ancient dragon still faces an ancient dragon. Provide appropriate warnings, knowledge, retreat and alternatives; an early attempt can be catastrophic. |
| Adaptive | Encounters may adapt substantially toward current party capability within the selected Ruleset's declared constraints. This prioritizes consistent challenge without retroactively rewriting established facts. |
| Hybrid | Preserve meaningful threat hierarchy while allowing bounded plausible encounter variation. Ordinary goblins can become easy for an experienced party; an ancient dragon retains a high minimum credible danger. |

Distinguish **World Threat** (intrinsic/canonical danger of Actor/group/location/problem), **Party Power** (actual involved levels, abilities, equipment, companions, resources, conditions and tracks) and **Encounter Budget** (target intensity under difficulty, scaling policy, context role and the canonical threat envelope). They are not interchangeable numbers, and no universal scalar is required.

An Actor/template may define a plausible **scaling envelope**. Goblin raiders might have low intrinsic threat and an early-game encounter band with variable composition. An ancient dragon retains extreme threat and a high minimum credible danger even when tactics/minions/phases vary. A level-18 character may legitimately overpower enemies that were dangerous at level 3; universal matching must not erase that reward for growth.

Within an approved envelope, adapt count, elite/minion composition, tactics, reinforcements, resources, phases, environmental complications and loadouts where fiction permits. Prefer meaningful boss configurations over mere HP inflation. An illustrative Vampire Lord might have recommended band 8–10, minimum credible combat profile 7 and adaptation envelope 8–11: arriving at 8 gives intended challenge, 10 may select a stronger configuration, but arriving at 12 does not automatically turn the boss into 15. These values illustrate one content profile, not engine constants. Established enemy capabilities cannot be rewritten just to preserve difficulty.

Background Actors need not all have full combat stat blocks. Canonical identity, threat category, capabilities, equipment/resources, narrative role, location and current state can exist before mechanical encounter detail. When needed, a trusted Ruleset **Encounter Resolver/Compiler** materializes concrete mechanics from that state, party power, difficulty, scaling policy and environment within the declared envelope. Commit the profile/version, relevant inputs, configuration and encounter identity; concrete mechanics then become authoritative for that encounter.

Do not continuously regenerate or silently rescale committed enemy stats during combat, on retry, load, a party level-up or a difficulty change. Ordinary validated damage, conditions, reinforcements and predeclared phase transitions can still change encounter state causally. Existing materialized capabilities constrain later encounters unless an explicit world Event justifies a change; rematerialization is not an excuse to rewrite identity. No hidden difficulty rescue or inflation after observing the player's choices.

Difficulty remains separate: it may influence supported HP/damage multipliers, resource scarcity, recovery, rerolls, encounter-budget target and tactical pressure. It does not automatically change world identity or match every enemy to player level. A dragon remains a dragon. Effective changes apply prospectively at a coherent boundary, preserving active encounters and recorded outcomes.

### Bounded Progression Pacing Director

The **Progression Pacing / Progression Director** is a bounded planning/checking concept, mostly deterministic Ruleset/content metadata, not a second AI DM or autonomous agent. Where applicable, major Threads/Arcs/bosses may declare expected/recommended power bands and reward budgets. Compare current party power, upcoming challenge, remaining meaningful objectives/opportunities and available expected rewards to detect obvious under/over-progression trajectories, premature caps or rewards becoming meaningless too early. For example a level-5 party approaching a roughly level-7 confrontation may have several meaningful objectives whose expected rewards approximately support preparation; there is no requirement to force an exact level.

An expected reward budget is a forecast, never a grant or a second reward ledger. Do not fabricate achievements/XP, rewrite outcomes or force the player onto a prescribed route to hit a number. Use the existing single DM and bounded World Engine authoring/settlement to propose plausible opportunities; proposals do not directly spawn canonical rewards or discovered hooks. Reuse current trigger/workload limits, no background progression loop.

For an underpowered party, policy may offer optional Adventure Hooks/quests, training, exploration rewards, equipment opportunities, companion quests, side encounters, preparation routes or a fair warning. The player remains free to attempt danger early. World Anchored can permit catastrophic attempts; Adaptive can compensate more; Hybrid preserves the threat while allowing reasonable preparation opportunities. Warnings and opportunity projections reveal only player-known information, never secret boss bands or hidden reward budgets.

For an overpowered party, preserve earned power and allow easier victories. Trivial encounters may yield reduced/diminishing vertical progression or horizontal rewards, while reputation/world consequences still matter. Use the upper credible envelope, smarter tactics/phases/resources only when justified and before materialization; never strengthen every rat/bandit, remove earned levels or rescale an active fight. Pacing is advisory preparation support, not a parity guarantee.

### Progression saves, imports and policy compatibility

Extend existing versioned save manifests/readers to restore exact XP/progress, levels/class levels, track values/ranks, unspent advancement resources, pending choices, unlocked abilities/features, latent abilities, applied Progression Event/source-entitlement identities, effective progression/distribution/scaling policy versions and materialized active encounter state. Retain source and ability definition versions. A branch accumulates future progression independently; no later XP/choice leaks backward, old loads cannot re-award future rewards, and another branch's party strength cannot rescale a restored encounter. No second save system.

If an imported character is Level 7 with no trustworthy XP history, preserve Level 7 and explicitly record an imported/baseline progression state. Missing XP is unknown, not fabricated past reward Events. A future profile may need an owner-approved starting offset/baseline mapping for subsequent thresholds; it cannot disguise that mapping as earned XP. Old saves remain readable with a declared compatibility adapter or a safe pause for missing mappings; no automatic conversion/history invention on load. Manual correction takes precedence through the existing correction model.

## Inventory variability with one ownership model

Keep stable item identity, owner/controller, storage/container, equipped assignment, quantity where meaningful, provenance and access constraints. Add profile-defined components and views rather than duplicating holdings by screen.

| Experience | Useful view/components |
| --- | --- |
| Adventure | Equipment slots, weapons, consumables, currency |
| Military | Loadout, ammunition, unit-issued versus owned equipment, vehicle access |
| Literary/social | Possessions, letters, documents, titles/access rights; no forced weight or combat stats |
| Magic | Attunement/known properties, configured slots and costs |
| Ship/vehicle | Cargo, fittings and accessible storage; movement does not clone contents |
| Survival | Supplies, consumption and expiry under explicit rules |
| Abstract possessions | Entitlement/count/presence appropriate to the profile, with clear ownership and provenance |

Do not turn a document into a consumable just to fit a universal bag UI. Reference its existing versioned record when appropriate. Hidden curses, private descriptions, unknown documents or secret storage cannot be exposed by changing view modes. Embedded components and zero-quantity consumed items retain their accepted provenance and cannot reappear as available stock.

The accepted remote camp-deposit/active-camp withdrawal, cooking and meal/coffee rules belong to the compatibility profile and campaigns choosing them. They are not universal physics or mandatory mechanics for new worlds. Keep their existing behavior until an explicit profile change; a military or literary profile defines its own validated access/cost rules.

## Bounded schema-driven presentation

Reuse the literary charcoal/bronze shell, responsive panels, dialogs, lists and shared entity/item components. A versioned Sheet Definition arranges a small allow-listed set: short/long text, bounded number, choice, boolean, resource meter, condition list, entity/item reference, relationship label, equipment slots, holdings list/grid and approved image reference. A bounded group/list is enough; no arbitrary HTML/CSS/scripts, downloadable components or executable formulas from the model.

The server projects authorized visible values, applicable fields and valid action descriptors before sending a schema. Hidden field names, disabled controls, totals or layout gaps must not reveal a secret. Client presentation cannot grant mechanics permission. Missing/unsupported fields yield a neutral read-only explanation and preserve data, not a fabricated default value. English/Russian labels, keyboard access and small-screen layout are part of each supported component.

Examples: D&D-style HP/AC/level/class/spell slots; dragon rider injuries/fatigue/ammunition/bond; literary reputation/relationships/possessions; sci-fi stress/neural load/cyberware. Bind all views to the same IDs and versioned data. Re-render when an approved profile, world context or presentation definition changes. “Regenerate the sheet” means recompose the view from validated definitions, not reroll a character or ask AI to overwrite canonical state.

## Save, memory and upgrade contract

Saves pin profile/schema/validator versions, exact mechanics components, control assignments, applicable capabilities, item provenance, pending checks and effects. Extend the Phase 3.5 manifest version reader; the current fixed schema/family list cannot simply accept extra records. Keep old manifests immutable and the old profile interpreter available for inspection/resume, or pause with a safe compatibility explanation. No automatic conversion merely on load.

When entering a Lab checkpoint, inherit its World Logic/profile or explicitly choose a supported profile. A separately recorded playable-entry mapping may add player-scale mechanics, but cannot change checkpoint history, invent past outcomes or erase injuries/possessions. If exact mapping is not possible, retain World Logic or ask the owner to resolve the mismatch before entry. The checkpoint and original simulation stay intact.

Memory treats profile facts as applicable versioned rules and exact mechanics as authoritative. Narrative summaries cannot convert a resource or decide that a character gained a class/ability. Changing rules does not overwrite historical event sources; display old rolls under the profile that produced them.

## Future acceptance gates — not executed here

### Progression and reward coverage

- One eligible source entitlement rewards at most once across retry, timeout, refresh/reconnect, duplicate settlement, crash recovery and replay. Save/load does not duplicate XP; forks inherit existing receipts but isolate future progression, including cross-campaign rejection.
- XP threshold crossing creates the correct Pending Advancement, including multiple thresholds; milestone mode needs no fake XP; Off yields no accidental progression grants while valid world/inventory consequences still work.
- Choices are server-validated; invalid feat/spell/perk or missing prerequisites are rejected without partial resource spend. Simultaneous/stale selections cannot double-unlock. Manual corrections win with preserved history.
- Multiple tracks advance independently and dependencies unlock only valid choices; use-based rewards affect relevant tracks only. Repeated trivial/spam actions cannot farm unrestricted mastery; explicit training obeys policy limits.
- Career/rank cannot advance through unrelated generic XP; companion rewards follow the chosen distribution policy without implicit level matching.
- Latent abilities cannot be used before validated unlock; custom abilities cannot bypass typed effect validation or execute generated code; private prerequisites are not exposed by UI.
- Imported Level 7 with unknown XP preserves the baseline without fictitious reward history. Legacy saves retain supported compatibility; exact progress, unspent resources, pending choices, ability versions and encounter state restore without future/sibling leakage.

### Challenge and pacing coverage

- World Anchored never silently downscales fixed major threats; Adaptive follows its declared policy; Hybrid retains threat hierarchy while allowing bounded adjustment.
- Trivial enemies do not universally scale to high-level parties; earned easier victories remain possible. Boss configurations stay inside approved envelopes and committed encounter stats remain stable, apart from legitimate causal mechanics.
- Difficulty changes never rewrite world identity or active encounter state; retries/load cannot rematerialize stronger/weaker opponents. Low-power parties receive warnings/preparation opportunities where policy requires, without leaking private threat data or forbidding early attempts.
- Pacing detects obvious under/over-level trajectories or premature cap risk without fabricating outcomes. Expected reward budgets never grant/double-award progress. Post-cap policy can replace unusable XP with meaningful supported rewards.

### World-scale power coverage

- Powerful actions still require real profile capabilities, prerequisites, resources and resistance/check handling; political/military scope requires actual authority, not merely level.
- World-scale effects use bounded validated causal settlement and durable receipts. Retry/staged continuation cannot duplicate costs/effects or leave partially applied stages; interrupted work resumes only its authorized scope.
- A player description or AI proposal alone cannot destroy/change world state. Unsupported effects pause or remain genuinely non-mechanical narration, never unvalidated mechanics. Text, 2D and EXPLORE share the same results and presentation cannot create rewards.

### Existing profile and UI compatibility

- Accepted console-basic-v1/5e-oriented campaigns and isolated previews retain results; any separately implemented D&D 5e profile declares edition and coverage and passes its own rules tests.
- A no-HP/no-d20 World Logic literary campaign and a military/sci-fi custom profile play, save, load and fork without forced D&D fields.
- Natural-language custom rules produce inspectable bounded definitions; unsupported rules, arbitrary code and hidden-field injection fail safely.
- All supported profile arithmetic, inventory access, consumption, reroll limits and effects are server-enforced. No UI configuration can bypass them.
- Existing NPC-to-PC takeover keeps identity, relationships, inventory and permitted knowledge, disables autonomous choice only in the target branch and preserves siblings.
- Character/inventory/combat resources adapt in English/Russian at desktop, 390px and 320px with keyboard/reduced-motion checks; no private fields/metadata in schemas.
- Switching profile or presentation with pending checks/encounters does not lose input or re-resolve dice; missing migration mappings stop safely. Old saves remain inspectable/loadable under declared compatibility.
- Entering the same simulation checkpoint with two supported profiles preserves the same underlying past and explicitly records different future-resolution policies.

Open owner choices: which full D&D edition/coverage is wanted, whether imported literary/historical worlds default to World Logic, and the first small custom-rule primitives. No choice in this brief authorizes implementation.
