# POV & World Leverage — character perspective, knowledge and authority

September 19, 2026. **Architecture/product contract only; no implementation is authorized by this file.**

A campaign may be experienced from very different positions inside the same authoritative world: monarch, president, general, colonel, private soldier, detective, merchant, prisoner, child, deity-like being or another role. These characters must not receive the same information, permissions, resources or ability to cause large-scale change merely because the human owner controls them.

This contract is distinct from the existing **Player Role** setting (One of many / Significant figure / Chosen one). Player Role describes narrative prominence. **POV & World Leverage derives from the controlled character's actual identity and current world state.**

## Core rule

> **One world, different perspectives; one authority model, different leverage.**

The owner can attempt any coherent free-form action. What the controlled character can actually know, command, access or change is constrained by authoritative state and the selected ruleset.

No in-character role receives a direct “edit reality” permission. Large influence happens through plausible in-world mechanisms: orders, institutions, wealth, magic, technology, reputation, violence, persuasion, law, logistics and other established capabilities.

Owner-side Chat with DM / World Authoring remains a separate explicit out-of-character capability and must never be confused with what the current character can do.

## Perspective dimensions

A controlled Actor may have bounded, versioned references/state for the dimensions that matter in its campaign:

- **Knowledge** — witnessed/told/learned facts, reports, maps, intelligence and uncertainties.
- **Capabilities** — skills, powers, equipment, physical access and applicable rules.
- **Institutional authority** — offices/ranks/roles that make certain orders or decisions binding.
- **Command scope** — Actors, units, organizations or assets the character can legitimately direct.
- **Jurisdiction** — where that authority applies and where it does not.
- **Resource control** — money, troops, vehicles, infrastructure, inventory, budgets or other assets the character can allocate.
- **Social access** — audiences, institutions, restricted spaces and people reachable because of status/relationships.
- **Information access** — reports, classified material, institutional channels, sensors or archives available to the role.
- **Reputation / legitimacy** — whether others recognize the claimed authority and how reliably commands are obeyed.
- **Current constraints** — captivity, injury, communications loss, mutiny, legal limits, distance, time, chain of command or other conditions.

Not every campaign needs every dimension. Reuse existing entities/relationships/inventory/knowledge/rules wherever possible rather than creating a universal bureaucracy simulator.

## Example: same war, three POVs

### Monarch / head of state

May plausibly:
- appoint or dismiss officials where legally/fictionally permitted;
- set broad strategy;
- authorize campaigns, diplomacy or major resource allocations;
- receive high-level intelligence and reports.

May still *not* automatically:
- know what happened in a trench five minutes ago;
- personally control every subordinate action;
- make an impossible order execute instantly;
- know secrets not contained in their information channels.

### Colonel

May plausibly:
- command assigned formations/assets;
- issue operational orders within chain/jurisdiction;
- receive military intelligence relevant to the command;
- request support beyond direct control.

May not automatically:
- rewrite national strategy;
- command unrelated forces;
- spend state resources outside authority;
- know political/private facts merely because the owner knows them.

### Infantry soldier

May plausibly:
- act directly in the local environment;
- use carried equipment;
- speak to nearby Actors;
- report information through available channels;
- influence events through exceptional actions.

Usually may not:
- issue binding army-wide orders;
- access strategic intelligence;
- allocate national resources;
- instantly change distant events.

A soldier can nevertheless become strategically important through play. Leverage is dynamic, not a permanent caste.

## Knowledge and leverage are independent

High authority does not imply omniscience.

A king may know national strategy but not a local murder.
A scout may know the terrain better than the general.
A prisoner may know a critical secret while having almost no immediate command authority.

Context assembly must therefore filter **knowledge separately from capability/authority**.

## Orders are actions, not guaranteed outcomes

When a character with authority issues an order:

1. validate that the order is within plausible command/jurisdiction;
2. record the order/intention through normal authoritative action/event flow;
3. affected Actors/Threads respond according to relationships, logistics, communications, morale, law/rules and circumstances;
4. only validated consequences become committed facts.

Authority can raise compliance dramatically without becoming magical remote state mutation.

Orders may be delayed, misunderstood, resisted, partially executed or impossible when world state justifies it.

## Strategic versus embodied play

The same engine may support different interaction scales without creating separate games.

- **Embodied/local POV:** movement, conversation, combat, investigation, physical interaction.
- **Operational POV:** unit/task-force orders, logistics, local planning.
- **Strategic/political POV:** policy, diplomacy, appointments, high-level allocation and intelligence review.

A character may legitimately move between scales when their role supports it. The UI may later present suitable tools/views, but free-form natural language remains available.

Do not expose strategic controls merely because the campaign contains strategic state.

## POV switching and takeover

A campaign/timeline may later support controlling different established Actors, subject to explicit owner action and scenario rules.

Switching control:
- reuses the same stable Actor identity;
- does not merge characters' memories/knowledge;
- builds the next context from the newly controlled Actor's knowledge and access;
- disables autonomous decisions for the currently player-controlled Actor;
- does not grant the new POV knowledge learned only by the previous POV unless information was actually communicated;
- does not create a new timeline by itself unless the owner explicitly forks.

Multiple parallel viewpoints may instead be represented by separate timeline forks when the owner wants to explore contradictory choices from the same checkpoint.

## Counterfactual / historical worlds

For historical or source worlds, preserve four distinct layers:

1. source/historical baseline;
2. approved scenario divergence;
3. branch/world events;
4. current character knowledge.

A historian/owner may know the real outcome. A character inside 1862 does not gain that future knowledge unless the scenario explicitly establishes it.

Institutional authority is reconstructed from the chosen entry point and source/scenario evidence; do not silently give a famous historical character powers they did not actually possess.

## World Engine integration

World Actors already carry capabilities, relationships, location, control assignment and knowledge references. Extend that contract only as needed with typed authority/control/resource relationships.

Before committing an action with external scope, validate:
- controlled Actor identity;
- active campaign/timeline/epoch;
- current location/communications where relevant;
- capability;
- ownership/control/permission;
- institutional authority and jurisdiction where relevant;
- accessible resources;
- required rules/checks;
- target existence and current state.

The AI may propose an interpretation of free-form intent; server/rules validation determines what can commit.

## UI / presentation implications

Future UI may adapt to the active POV:
- local character sheet/inventory for embodied play;
- command roster for a commander;
- reports/intelligence view for leadership;
- treasury/resources only when legitimately accessible;
- map detail appropriate to known information.

These are projections over one authoritative system, not separate sources of truth.

The permanent Text mode must remain capable of expressing all scales without requiring a specialized screen.

## Acceptance examples

A future implementation should prove at least:

1. A private soldier cannot issue an authoritative division-wide movement order merely through natural language.
2. A colonel can issue an order to a bound subordinate formation but cannot directly mutate the soldiers' final positions/outcomes without normal resolution.
3. A head of state can authorize a policy/resource action supported by the scenario while remaining ignorant of unreported local facts.
4. A low-status character who learns a critical secret knows it even when a high-status character does not.
5. Switching POV does not leak private knowledge between Actors.
6. Promotion/demotion/capture/rebellion can change leverage prospectively without rewriting history.
7. Out-of-character World Authoring remains clearly separate from in-character actions.
