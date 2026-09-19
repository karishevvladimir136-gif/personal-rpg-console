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

World Engine answers what exists, what changes, what actors pursue and what events occur. Rulesets answer how player-scale uncertainty, costs, checks and resources are resolved. A Lab run can exist without a traditional tabletop system; it still pins world rules, a resolution policy, constraints and a schema version. World Logic is a real explicit profile, not “skip validation and trust the model.”

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

- Accepted console-basic-v1/5e-oriented campaigns and isolated previews retain results; any separately implemented D&D 5e profile declares edition and coverage and passes its own rules tests.
- A no-HP/no-d20 World Logic literary campaign and a military/sci-fi custom profile play, save, load and fork without forced D&D fields.
- Natural-language custom rules produce inspectable bounded definitions; unsupported rules, arbitrary code and hidden-field injection fail safely.
- All supported profile arithmetic, inventory access, consumption, reroll limits and effects are server-enforced. No UI configuration can bypass them.
- Existing NPC-to-PC takeover keeps identity, relationships, inventory and permitted knowledge, disables autonomous choice only in the target branch and preserves siblings.
- Character/inventory/combat resources adapt in English/Russian at desktop, 390px and 320px with keyboard/reduced-motion checks; no private fields/metadata in schemas.
- Switching profile or presentation with pending checks/encounters does not lose input or re-resolve dice; missing migration mappings stop safely. Old saves remain inspectable/loadable under declared compatibility.
- Entering the same simulation checkpoint with two supported profiles preserves the same underlying past and explicitly records different future-resolution policies.

Open owner choices: which full D&D edition/coverage is wanted, whether imported literary/historical worlds default to World Logic, and the first small custom-rule primitives. No choice in this brief authorizes implementation.
