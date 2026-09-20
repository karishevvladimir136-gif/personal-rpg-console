# Systemic World References — procedural generation lessons

September 19, 2026. **Design reference only.** These games are useful for systemic/procedural world design, not as visual-style prescriptions and not as authority models. RPG Console keeps its existing authoritative-state, privacy, save/timeline and AI-DM contracts.

Primary references:
- [Terra Randoma](https://store.steampowered.com/app/1120400/Terra_Randoma/)
- [Terra Randoma — Settlements dev blog](https://store.steampowered.com/news/posts/?appids=1120400&enddate=1566580868&feed=steam_community_announcements)
- [Terra Randoma — Questing dev blog](https://store.steampowered.com/news/posts/?appids=1120400&enddate=1573850031&feed=steam_community_announcements)
- [Approaching Infinity](https://store.steampowered.com/app/551620/Approaching_Infinity/)
- [Approaching Infinity — factions, quests and systemic interactions](https://store.steampowered.com/news/posts/?appids=551620&enddate=1670112763&feed=steam_community_announcements)
- [Approaching Infinity — starter quests / reputation / hidden victory](https://store.steampowered.com/news/posts/?appids=551620&enddate=1664571769&feed=steam_community_announcements)
- [Approaching Infinity — shipwreck generation](https://store.steampowered.com/news/posts/?appids=551620&enddate=1636497195&feed=steam_community_announcements)

## What Terra Randoma teaches us

### 1. Procedural geography is useful only when it creates different journeys

Terra Randoma varies island topology and then populates it with dungeons, settlements, encounters and curiosities. The lesson is not “randomize the map.” The useful part is that geography changes route choice, encounter density and what the player discovers.

For RPG Console scratch/original worlds, a future world author may therefore choose coarse topology/region-generation constraints. Imported/source worlds keep their established geography. Geography generation never overrides canon.

### 2. Settlements are lightweight World Actors

Terra Randoma gives settlements prosperity, crises, reputation effects and player-driven improvement/decline. RPG Console should use the same **coarse-state principle**, without simulating every citizen or commodity.

A meaningful settlement/region may expose bounded structured state such as:
- prosperity / scarcity;
- security / unrest;
- faction control or pressure;
- public mood;
- accessibility;
- known hazards;
- important infrastructure;
- reputation toward the PC.

These are optional world-state dimensions, not universal mandatory stats. The World Engine may derive public consequences from validated Events; it must not run a hidden economy simulator for its own sake.

### 3. Travel itself needs content

Terra Randoma treats wilderness traversal as gameplay through overworld incidents, camping, hunting/foraging, hazards and curiosities. This supports the existing RPG Console rule that travel is not merely a loading transition.

A travel segment may surface bounded:
- encounters;
- rumors;
- discoveries;
- temporary opportunities;
- hazards;
- unusual environmental observations;
- moving actors/caravans/factions.

The engine should prefer contextually justified events from active Threads and local state over pure random tables. Random/procedural variation remains useful as a diversity tool when no stronger causal source exists.

### 4. Quest grammars beat unconstrained random quests

Terra Randoma combines small quest structures such as rescue/retrieve/escort with procedurally generated NPC identity, occupation, appearance and objects. The important lesson is to **separate structural validity from semantic flavor**.

RPG Console can use bounded Adventure Hook / quest grammars as scaffolding while the AI DM supplies motivations, relationships, complications and alternate resolutions. A grammar does not restrict player solutions. “Retrieve an heirloom” can still be solved by bargaining, forgery, theft, investigation, replacement, persuasion or an entirely novel free-form plan.

### 5. Procedural and unique content should coexist

Terra Randoma mixes generated equipment/NPCs/quests with unique treasures, faction quests and larger arcs. RPG Console should likewise avoid the false choice between “everything generated” and “everything bespoke.”

Use:
- reusable procedural/systemic structures for breadth;
- AI-authored contextual semantics for variation;
- persistent unique Threads/characters/locations for identity;
- explicit owner/world-source canon for anchors.

## What Approaching Infinity teaches us

### 1. Selective simulation is the core rule

Approaching Infinity deliberately simulates some systems deeply—fire spread, oxygen/atmosphere, destructible walls and decompression—while heavily abstracting time, distance and scale. Its stated dividing line is whether simulation creates fun/creative play.

Adopt the principle:

> **Simulate deeply only where stateful interaction creates meaningful player affordances or consequences. Abstract aggressively where fidelity mostly creates bookkeeping.**

This protects RPG Console from turning AI capability into uncontrolled simulation complexity.

Examples worth deeper semantic/systemic treatment:
- flammable / burning;
- breakable / breached;
- open / closed / locked;
- pressurized / vacuum / hazardous atmosphere where relevant;
- powered / disabled;
- occupied / abandoned;
- contaminated / flooded / blocked;
- socially controlled / forbidden / guarded.

Do not universally simulate temperature, every civilian schedule, granular economics, centimeter movement, nutrition or physics unless a campaign/ruleset specifically needs them.

### 2. Different map scales may be intentionally gameified

Approaching Infinity presents sectors, planetary zones and ship interiors at different conceptual scales without requiring one physically continuous coordinate system.

This directly supports RPG Console's future:
**world → region → town → district → local scene** hierarchy.

A world map, town overview and local scene may each be a useful gameplay representation with their own coordinates. Transitions preserve authoritative Location relationships and travel consequences; they do not require seamless meter-by-meter geometry.

### 3. Environmental systems create free-form affordances

Approaching Infinity's fire, explosions, destructible walls and decompression turn environment state into player tools, not decoration.

RPG Console should eventually model a **small semantic affordance layer** for important objects/locations. The AI DM can map free-form actions onto supported affordances:
- “burn the trees” → flammable/burning;
- “blow a hole in the wall” → breach/destruction;
- “open the airlock” → atmosphere consequence if that ruleset/location supports it.

Unsupported actions still resolve through the normal DM/rules path rather than being rejected because no button exists. Renderer/world-model physics never becomes authoritative.

### 4. Factions should affect multiple systems

Approaching Infinity links faction relationships to reputation, diplomacy, law enforcement, contraband behavior and commodity prices. It also makes it difficult to be simultaneously friendly with mutually hostile factions.

For RPG Console:
- faction relationships belong in World Actor state;
- PC actions can change faction/public reputation;
- faction relationships can propagate to access, prices, security, rumors, assistance and hostility when relevant;
- consequences should be coarse and explainable, not a hidden total-economy simulation;
- faction reputation is contextual and may conflict rather than collapsing into one universal “good reputation” score.

### 5. World actors should interact without the player

Approaching Infinity allows creatures/factions to fight or otherwise react to each other according to categories and relationships.

RPG Console already plans World Actors/Threads. Use this as support for **bounded autonomous interaction**, not per-NPC agents:
- predators/prey;
- hostile factions;
- guards/criminals;
- competing expeditions;
- rescuers/threats;
- institutions pursuing conflicting goals.

Only meaningful events are settled. Do not continuously simulate every actor.

### 6. Hidden goals need clue ladders, not quest markers

Approaching Infinity includes hidden victories/mysteries that become discoverable through environmental clues, books, scans and exploration rather than appearing as explicit quests.

This strengthens the Adventure Hook knowledge ladder:

**latent private possibility → hint → rumor/clue → discovered POI/lead → investigated → resolved/changed**

Some major opportunities should never begin as a journal quest. The player may discover a system, mystery or arc through ordinary curiosity.

### 7. Open worlds still need onboarding hooks

Approaching Infinity later added starter quests not because the underlying world lacked content, but because new players could fail to perceive its depth.

For RPG Console, a newly started/open campaign should usually surface a **small number of optional, low-pressure initial hooks** appropriate to character knowledge and campaign tone. They demonstrate that the world has depth without turning free exploration into a mandatory tutorial chain.

The owner may disable/minimize this behavior. Existing campaign briefs/canon can supply the starting direction instead.

### 8. Multi-step procedural quests work best as grammars

Approaching Infinity has randomized multi-step quest lines with many variations and locations. The lesson is to store arc structure and state transitions rather than generating an entire giant quest as prose.

A future Adventure Arc may have:
- seed/premise;
- current stage;
- prerequisites;
- candidate next stages;
- linked Actors/Locations/Threads;
- discovery requirements;
- failure/expiry conditions where appropriate;
- private truth;
- player-known projection.

AI elaborates the next needed stage from current state. Do not pre-generate dozens of unused scenes.

### 9. Location archetypes can guide procedural/local generation

Approaching Infinity generates shipwrecks from archetypes such as gunships or survey vessels, then creates rooms/furniture that semantically fit the vessel purpose instead of only shuffling arbitrary hand-built rooms.

RPG Console should use the same **semantic archetype → constrained composition** pattern for generated places:
- market;
- mining town;
- roadside motel;
- noble estate;
- research station;
- ruined temple;
- ship;
- police precinct;
- tavern;
- dungeon.

The archetype constrains expected functional zones and affordances; AI can fill culturally/story-specific details. Do not let an archetype override source/canon.

### 10. Generate required detail lazily when a quest/hook reaches it

Approaching Infinity can ensure quest-specific locations exist even in already-generated sectors. This is a strong precedent for RPG Console's lazy generation model.

If a validated hook now requires “the abandoned observatory north of town,” the engine may create/bind that Location at the moment it becomes necessary, consistent with established geography/canon. It need not have existed as a fully rendered/generated location from campaign start.

This is not permission for arbitrary retroactive world edits. New detail must fit existing constraints and record its origin/provenance.

### 11. Player choices can shape hubs/world facilities

Approaching Infinity allows players to influence what gets built in asteroid bases.

For RPG Console, some settlements/camps/bases may expose **player-driven development choices** as normal authoritative Events:
- repair the bridge or fortify the gate;
- fund a clinic or armory;
- reopen a mine;
- choose what facility a camp/base adds.

The world then reflects that choice. No separate city-builder subsystem is required.

### 12. Knowledge gating matters even in procedural worlds

Approaching Infinity hides unknown factions until encountered and reveals destinations/information progressively.

RPG Console should keep generated worlds under the same player-knowledge contract as authored worlds. Generation is not discovery. A generated faction/location/object can exist privately without being visible in UI, retrieval, map or renderer.

### 13. Optional victories and self-directed goals are compatible

Approaching Infinity lets players follow major faction quest lines, pursue different victory conditions or ignore them and explore indefinitely.

RPG Console should preserve the distinction between:
- campaign-critical/hard-deadline Threads;
- major optional arcs;
- small Adventure Hooks;
- player-created goals;
- pure exploration.

Do not force every campaign toward one “main quest” unless its source/brief explicitly defines one.

## Combined design rules for RPG Console

### Structured procgen + AI semantics

Use deterministic/procedural structure for:
- bounded topology;
- valid connectivity;
- archetype constraints;
- encounter/POI budgets;
- quest/arc stage validity;
- scale and difficulty envelopes;
- duplicate prevention.

Use AI for:
- motivations;
- causal/story interpretation;
- names/culture/flavor;
- context-sensitive complications;
- dialogue;
- free-form player intent;
- alternate solutions;
- semantic elaboration of the next needed detail.

Neither replaces authoritative validation.

### Opportunity-density budget

A meaningful area should normally contain a bounded number of potential opportunities appropriate to its scale and campaign style. Exact counts are a later tuning decision, not a universal constant.

Too few → empty procedural world.
Too many visible markers → checklist/Ubisoft effect.

Latent hooks may outnumber visible POIs because discovery is knowledge-gated. Chat with DM may explicitly adjust density/theme through the owner-authoring path.

### Simulation budget

Every proposed simulated subsystem should answer:
1. Does it create new player choices?
2. Can consequences matter later?
3. Can it be represented with a small authoritative state contract?
4. Does it avoid continuous expensive/background evaluation?

If not, prefer abstraction/narration.

### Discovery ladder

Use stable identity across:
1. latent/private;
2. hinted;
3. rumored;
4. known/discovered;
5. visited/investigated;
6. resolved/changed/expired.

Different sources may reveal different projections of the same POI/Thread.

### Multi-scale world, single authority

World/region/town/local maps and later 2D/EXPLORE presentations can use different coordinate systems and visual scales. Authoritative Location graph, travel rules, current state and knowledge determine meaning. Presentation scale never changes canon.

## What we explicitly do NOT copy

- visual style, pixel art or UI aesthetics;
- permadeath as a universal rule;
- mandatory hunger/oxygen/economy systems;
- fixed quest-template solutions;
- tactical grids as a requirement;
- procedural generation as authority;
- continuous simulation of every NPC/economy/weather system;
- infinite content generation merely because models can generate it.

These references show useful systemic patterns. RPG Console keeps natural-language freedom, persistent AI semantics, source/canon authority, versioning, privacy and player-controlled presentation.


## Pathfinder: Wrath of the Righteous — scale, identity and integration

Wrath of the Righteous is not a visual reference and its Pathfinder rules density is not a default target. It is useful for three systemic ideas:

### 1. Local and strategic agency can belong to one character

The Knight Commander remains a party character while also commanding a crusade. RPG Console should likewise allow one Actor to operate across embodied, operational and strategic scales when their actual authority/resources justify it.

### 2. Transformative progression should change the world

WotR's Mythic Paths alter more than combat abilities: they affect narrative branches, appearance, reactions and available approaches. Generalize this into campaign-specific identity/progression state that changes affordances and world reactivity.

### 3. Secondary systems must feed the RPG

Owlcat's own development notes acknowledged that Crusade initially did not intertwine enough with story and companions, and later added auto-crusade. Treat this as a warning: strategic simulation should feed normal Actors/Threads/Events and remain abstractable, not become an obligatory parallel game.

### Explicit non-copy

Do not copy:
- Pathfinder's mandatory rules complexity;
- class/archetype/prestige proliferation as a universal UI;
- alignment grids as universal morality;
- a separate army-management state store;
- repetitive decree/building administration unless a specific campaign wants it.

Use leverage and reactivity; leave the bureaucracy optional.


## Pathfinder: Kingmaker — realm as actor, delegation and fair urgency

Kingmaker is a systemic reference for combining ordinary party-scale RPG play with ownership of a persistent polity. Its Pathfinder rules/UI are not default targets.

### 1. Treat a realm like an evolving World Actor

Owlcat described the kingdom as effectively an “extra companion,” not a decorative feature. The useful abstraction is that a settlement/realm/institution can have persistent needs, capabilities, crises, relationships and development without simulating every citizen.

For RPG Console, a polity/settlement World Actor may carry only the campaign-relevant coarse state needed for consequential decisions.

### 2. Delegate long-running work to trusted Actors

Kingmaker assigns advisors/companions to kingdom roles and long-running problems/projects. This supports a generic delegation pattern:

- select an authorized Actor/institution;
- assign a bounded objective;
- record resources, expected duration/trigger and responsibility;
- let time/events progress normally;
- settle outcomes through the World Engine;
- surface completion, trouble or a need for intervention.

The player should not personally resolve every administrative task merely because they hold high office.

### 3. Connect episodic adventures causally

Owlcat later described how it strengthened the original adventure by linking otherwise episodic chapters through clearer causal relationships and earlier introductions of important antagonists.

Adventure Hooks may therefore begin as local stories while persistent Threads create:
- recurring Actors;
- foreshadowing;
- shared causes;
- consequences that reappear;
- later realization that apparently separate incidents were connected.

Do not force every hook into one master conspiracy; use causal links only where they improve coherence.

### 4. Downtime can combine systems and relationships

Kingmaker's camp lets companions take roles whose success/failure affects safety/resources, while also providing banter and relationship development.

RPG Console already has Camp/Rest direction. Preserve the useful principle: downtime can be a convergence point for:
- companion interaction;
- preparation;
- small assignments;
- cooking/rest;
- planning;
- consequences from recent travel.

But frequent routine must stay lightweight. Do not turn every rest into mandatory management.

### 5. Urgency must be legible and fair

Kingmaker's kingdom/timer systems are also a caution. Player reports repeatedly describe frustration when deadlines or kingdom-failure pressure were difficult to read or when management competed opaquely with exploration.

RPG Console should therefore strengthen its existing warning/deadline rule:
- hidden private deadlines may exist, but irreversible player-facing consequences require fair observable warning unless surprise is itself causally justified;
- when the character plausibly knows a deadline, present it clearly;
- distinguish “urgent,” “important but stable,” and “no known deadline” without revealing DM-private clocks;
- do not make players maintain an external spreadsheet to understand whether normal exploration will destroy their campaign.

World pressure should create meaningful choices, not administrative anxiety caused by missing information.

### 6. Management depth should be abstractable

Kingmaker provides different difficulty/help approaches for players who do not want equal mechanical complexity.

RPG Console should let campaign/ruleset/UI choose how much management is exposed:
- narrative/abstract resolution;
- compact decisions;
- detailed management where desired.

Abstraction never grants free success; it changes interaction burden, not authoritative consequences.

## Warhammer 40,000: Rogue Trader — jurisdiction, rumours and empire-scale role-play

Rogue Trader is especially useful for POV & World Leverage because the player character begins with extraordinary institutional rights, a ship/retinue and colonies while remaining an embodied party character.

### 1. Authority is powerful but jurisdictional

The Warrant of Trade gives a Rogue Trader enormous rights, but those rights operate differently inside established Imperial structures and beyond the Imperium.

Generalize this:
- authority has domain/jurisdiction;
- rank is not a universal permission flag;
- the same character may have near-sovereign power in one context and need negotiation/permission in another;
- institutional peers may resist, bargain or possess overlapping authority.

This directly supports [POV & World Leverage](POV_AND_WORLD_LEVERAGE.md).

### 2. Rumour is an epistemic object, not a quest fact

Rogue Trader explicitly treats rumours as things that may or may not be true and cannot be “completed” without investigation.

RPG Console should preserve:
- rumor source;
- who heard it;
- confidence/credibility when appropriate;
- claimed subject/location;
- later corroboration/refutation;
- possible propagation.

A rumor marker means “you know this claim exists,” not “the claim is true.”

The player may even encounter rumours about their own actions. Public reputation therefore propagates through fallible information channels rather than global omniscience.

### 3. Holdings can be remote, persistent and consequential

Rogue Trader's colonies can be managed remotely, produce resources and offer development projects with rewards and mutually exclusive choices.

For RPG Console, holdings/settlements/bases can expose a small project layer:
- finite choices;
- resource/opportunity costs;
- mutually exclusive development paths where meaningful;
- narrative events;
- later consequences.

Do not require a city-builder. Projects are structured World Events/Threads over the same authoritative settlement Actor.

### 4. Companions can bridge personal and institutional play

Rogue Trader planned/uses companions in officer/retinue roles while they remain characters with personal beliefs and relationships.

A companion can therefore simultaneously be:
- friend/rival/romance;
- specialist;
- officer/advisor;
- representative of a faction/culture;
- source of a different worldview.

Do not create separate “advisor NPC” copies of existing companions.

### 5. Ideological identity can emerge from decisions

Rogue Trader's Convictions accumulate from important choices and unlock dialogue/perks.

Generalize carefully:
- repeated choices may form a durable public/self identity;
- that identity can unlock/close affordances and alter NPC reactions;
- major identity changes should have provenance in actual events.

Do **not** universalize Dogmatic/Iconoclast/Heretical-style axes or reduce morality to a single meter. Campaigns may use explicit doctrines, faction reputation, values, public reputation, inferred patterns or no morality meter at all.

### 6. Major decisions deserve explainable history

Rogue Trader later added a log of major decisions and extensive reactivity/epilogue fixes.

RPG Console already stores Events/Saves. Future UI should be able to answer:
- what major choice changed this?
- when?
- which Actor/Thread/location was affected?
- what was player-known at the time?

This is player-facing provenance, not DM-private debugging.

### 7. Empire-scale choices need opportunity cost

Colony projects can block alternatives. This is a useful antidote to “eventually buy every upgrade.”

Important strategic development should sometimes represent priorities:
- clinic vs armory;
- trade port vs fortress;
- intelligence network vs public works.

Consequences should follow setting/rules, not a universal tech tree.

### 8. Expect players to break systems

Owlcat publicly noted that Rogue Trader players created builds far more broken than anticipated.

For an AI-native RPG, assume players will also discover unexpected combinations of:
- items;
- powers;
- social authority;
- environmental affordances;
- free-form plans.

Do not rely on “players probably won't try this.” Validate authoritative mutations, preserve resource limits, test pathological combinations and let legitimate emergent solutions work.

### 9. Complexity is not automatically depth

Owlcat's own player survey found substantial demand for fewer character-building options in Rogue Trader despite its deep progression.

RPG Console should keep the engine capable of complex rules without making every campaign expose them. Complexity belongs to the selected ruleset and player preference; depth should primarily come from consequential choices and reactivity.
