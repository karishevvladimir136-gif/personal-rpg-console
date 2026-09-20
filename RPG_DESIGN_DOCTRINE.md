# RPG Design Doctrine — industry best practices for an AI-native RPG

September 19, 2026. **Product/design doctrine only; no implementation is authorized by this file.** These principles are extracted from successful CRPG, immersive-sim and procedural-RPG design. They guide future World Engine, DM, quest, companion, combat and renderer decisions without copying proprietary content or requiring a specific art style.

Primary references:
- Larian / Baldur's Gate 3 systemic freedom and player-first design:
  - https://www.pcgamer.com/larian-studios-swen-vincke-is-loving-players-systems-based-hijinks-in-baldurs-gate-3-everybody-knows-about-the-owlbear-now/
  - https://www.pcgamer.com/games/baldurs-gate/i-call-it-chaos-at-scale-for-the-first-anniversary-of-baldurs-gate-3-we-spoke-exclusively-to-swen-vincke-about-the-past-present-and-future-of-larian-studios/
- Warren Spector / Deus Ex player-first immersive-sim design:
  - https://www.gamedeveloper.com/business/warren-spector-explains-the-player-first-design-choices-behind-i-deus-ex-i-
  - https://www.gamedeveloper.com/design/all-for-games-an-interview-with-warren-spector
- Chris Avellone / honeycomb mission structure:
  - https://www.gamedeveloper.com/design/an-interview-with-chris-avellone-game-designer-writer-and-former-unlucky-schlep-part-2
- ZA/UM / Disco Elysium micro-reactivity and depth:
  - https://www.gamedeveloper.com/business/understanding-the-meaningless-micro-reactive-and-marvellous-writing-of-i-disco-elysium-i-
  - https://www.gamedeveloper.com/design/player-agency-politics-and-narrative-design-in-disco-elysium-
- Wildermyth / procedural-character emotional consistency:
  - https://www.gdcvault.com/play/1027924/Independent-Games-Summit-Session-Getting
- Additional systemic/procedural references:
  - [SYSTEMIC_WORLD_REFERENCES.md](SYSTEMIC_WORLD_REFERENCES.md)

## 1. Player-first, not authored-path-first

The player is not trying to discover the designer's intended solution. The product should treat unusual but coherent plans as legitimate gameplay.

Design problems, goals and situations rather than single required solutions.

The authoritative systems define constraints; the AI DM interprets arbitrary player intent within those constraints.

Examples:
- enter the building rather than “find the red key”;
- resolve the hostage crisis rather than “use dialogue option 3”;
- cross the river rather than “repair exactly this bridge.”

Buttons and suggested actions are conveniences, never the full action vocabulary.

## 2. Systems and narrative must react to each other

Systemic actions are story events.

If the player burns a bridge, kills a leader, bankrupts a merchant, floods a tunnel, humiliates a noble or saves a faction, that state should be available to later narrative and world progression.

Narrative outcomes likewise update structured state where they have mechanical/world meaning.

Do not build one “gameplay layer” and one disconnected “story layer.”

## 3. Choice → consequence → recovery

Choice without consequences is cosmetic. Consequence without recovery often turns freedom into save-scumming.

For significant decisions:
1. let the player choose an approach;
2. show durable consequences;
3. preserve plausible ways to continue playing after failure, exposure or a changed plan.

Recovery does not mean erasing consequences. It means the game continues meaningfully.

Examples:
- failed stealth becomes a chase, negotiation, arrest, escape or changed security state;
- a dead quest-giver may close one opportunity while other causally valid information paths remain;
- a ruined faction relationship changes access rather than breaking the campaign.

## 4. Problems, not puzzles

A “puzzle” may have authored solutions, but most world obstacles should be semantic problems with multiple approaches.

The DM/rules layer should evaluate:
- resources;
- knowledge;
- environment;
- abilities;
- social leverage;
- time;
- risk;
- consequences.

Do not reject a plan merely because no designer explicitly authored it.

## 5. Fail forward when failure can create better play

Failed checks should often create a new state rather than simply “nothing happens.”

Possible failure outcomes:
- partial information;
- cost/resource loss;
- worsened position;
- new enemy attention;
- embarrassment/reputation change;
- alternate clue;
- time pressure;
- a different route.

Some failures can genuinely close opportunities. Fail-forward is a design preference, not invulnerability.

## 6. Honeycomb quests, not quest corridors

Prefer an overarching problem surrounded by optional/interacting satellite hooks over strictly linear chains.

A regional crisis may involve:
- militia;
- smugglers;
- damaged infrastructure;
- missing workers;
- rival factions;
- local politics.

The player can engage some, all or none. Their outcomes change the central situation.

World Threads and Adventure Hooks are the natural implementation primitives.

Avoid excessive special-case branching. Prefer reusable state transitions and causal relationships.

## 7. Adventure Hooks are invitations, not obligations

A POI/hook may lead to:
- atmosphere;
- treasure;
- a person;
- a short incident;
- a dungeon;
- a faction problem;
- a major arc;
- a trap;
- nothing important.

Do not signal the content's true importance in advance unless player knowledge justifies it.

Use the knowledge ladder:
latent/private → hinted → rumored/clued → discovered → investigated → resolved/changed/expired.

Marker visibility remains an owner preference; even All Known is limited to player-known information.

## 8. Micro-reactivity at scale

The world should notice small things.

High-value micro-reactivity includes:
- appearance/equipment;
- injuries;
- prior lies;
- promises;
- favors;
- reputation;
- recent public events;
- relationships;
- profession/background;
- discovered knowledge;
- unusual behavior.

Not every reaction needs a quest branch or state-machine fork. Many can be dialogue/narration texture grounded in existing structured facts.

The AI DM is especially suited to producing cheap semantic reactivity from persistent state.

Do not fabricate memories merely to sound reactive.

## 9. Major choices must still cause macro-reactivity

Micro-reactivity cannot replace substantial consequences.

Large actions can change:
- faction relationships;
- settlement state;
- location accessibility;
- NPC goals/status;
- economy/access at coarse resolution;
- active Threads;
- public reputation;
- companion relationships;
- future POIs and opportunities.

Use structured authoritative state for durable macro consequences.

## 10. Characters must remain themselves

Generated/adaptive NPCs and companions need stable identity constraints:
- traits;
- values;
- goals;
- fears/boundaries;
- formative history;
- current beliefs;
- knowledge;
- relationship memory.

AI improvises within character identity rather than reinventing personality each scene.

Character growth is allowed, but meaningful change should follow events and be recorded.

Avoid “acting out of character” purely because the current prompt favored a convenient response.

## 11. Companions are actors, not UI accessories

Companions have:
- independent knowledge;
- values;
- goals;
- opinions;
- memories;
- initiative;
- relationship state.

They may object, advise, joke, refuse, volunteer help, pursue personal concerns or react to the player's behavior when a bounded trigger justifies it.

Do not run a continuous agent per companion. Use the same bounded World Actor/Thread principles.

## 12. Deep where the player looks

Infinite breadth is not automatically good.

Use lazy depth:
- unexplored town: small stable overview;
- player visits repeatedly: richer NPC network, history, rumors and POIs;
- player investigates one family/faction: deepen that thread;
- ignored content remains shallow until needed.

Player attention is a strong signal for where world detail should become dense.

Do not pre-generate enormous unused lore trees.

## 13. Environmental storytelling before exposition

When possible, show world history through current state:
- damage;
- object placement;
- abandoned belongings;
- lighting;
- repairs;
- graffiti;
- corpses/debris;
- architecture;
- changed businesses;
- public memorials;
- missing infrastructure.

Narration can clarify what the PC notices, but the scene should often let the player infer and investigate.

Future 2D/FRAME/EXPLORE presentation should be a projection of authoritative events/state, not a separate source of facts.

## 14. Character identity creates affordances, not just modifiers

Background/class/profession/species/history should affect:
- what the PC recognizes;
- what approaches occur to them;
- what NPCs assume;
- what social spaces open/close;
- specialized dialogue;
- available mechanics/tools;
- check framing/difficulty.

A detective, surgeon, aristocrat and veteran may perceive the same scene differently even before dice.

Do not reduce identity to numerical bonuses only.

## 15. Selective simulation beats total simulation

Follow [SYSTEMIC_WORLD_REFERENCES.md](SYSTEMIC_WORLD_REFERENCES.md): simulate deeply only when the subsystem creates meaningful choices, durable consequences or reusable affordances.

AI capability is not justification for simulating everything.

Narratively abstract low-value fidelity.

## 16. The world moves without the player, but fairly

World Actors/Threads may progress while in-world time advances.

Avoid two extremes:
- nothing changes until the player arrives;
- the world races ahead with hidden irreversible disasters.

Use deadlines, warnings, Surface Before Complete, knowledge rules and bounded settlement.

Wall-clock time never advances campaign state.

## 17. Fallbacks should preserve the world, not preserve every quest

Unexpected player action must not crash campaign logic.

But do not protect content artificially.

If the player kills, destroys or abandons something:
- some opportunities can end permanently;
- consequences propagate;
- information may remain available only where causally justified;
- the world adapts rather than resurrecting the designer's preferred storyline.

The goal is campaign resilience, not content invulnerability.

## 18. Structured procgen supplies grammar; AI supplies semantics

Use code/procedural systems for:
- valid connectivity;
- topology constraints;
- archetypes;
- budgets;
- duplicate prevention;
- quest/arc stage validity;
- trigger/deadline enforcement;
- authoritative mechanics.

Use AI for:
- motivations;
- contextual complications;
- interpretation;
- dialogue;
- flavor/culture;
- free-form intent;
- alternate solutions;
- semantic elaboration.

Then validate before authoritative commit.

## 19. Freedom needs opportunity density

A huge world with no invitations to engage feels empty.

Maintain bounded opportunity density appropriate to:
- location scale;
- campaign genre;
- pacing;
- current active Threads;
- owner preference.

Chat with DM may explicitly alter future opportunity density/theme through bounded world-authoring requests.

Do not generate infinite content in the background.

## 20. Evaluate the game by stories players can tell

A strong outcome is not merely “quest completed.”

The desired result is that the owner can recount:
- a plan the game did not explicitly suggest;
- an unexpected systemic consequence;
- an NPC remembering a small detail;
- a failed roll creating a better scene;
- a world situation changing because of earlier behavior;
- a companion behaving recognizably like themselves;
- a discovery that did not feel like a checklist marker.

These are acceptance targets for future qualitative playtests.

## Review questions for future implementation

Before accepting a World Engine/DM/quest feature, ask:

1. Does it expand player agency or only add configuration?
2. Does the system remember consequences?
3. Can unexpected actions continue coherently?
4. Does failure create playable states?
5. Is this deep enough where the player cares and cheap enough elsewhere?
6. Does it respect character knowledge/private truth?
7. Does it preserve NPC/companion identity?
8. Could a player solve the situation in a way we did not pre-author?
9. Is the simulation creating decisions, or merely bookkeeping?
10. Would this generate a memorable story rather than just another task?


## 21. Perspective changes what the player can know and move

The same world should feel materially different when played as a ruler, commander, ordinary soldier, investigator or other Actor. Do not equate narrative importance with authority or authority with knowledge. Use the controlled Actor's actual capabilities, command/resource relationships, jurisdiction and information access. See [POV & World Leverage](POV_AND_WORLD_LEVERAGE.md).

The best outcome is not merely different dialogue. Different POVs should expose different **affordances, information and scales of consequence** while preserving one authoritative world.


## 22. Power progression can change affordances, not just numbers

**Pathfinder: Wrath of the Righteous** is a useful reference for separating ordinary class/build progression from a higher-level identity path. Its Mythic Paths are valuable as a design lesson because they change narrative branches, world reactions, available solutions, allies and the player's relationship to the setting rather than merely increasing combat statistics.

RPG Console should generalize the useful principle without copying Mythic Paths as a mandatory mechanic:

- a major transformation, office, curse, faction allegiance, divine status, technology, reputation tier or other campaign-specific change may unlock new **affordances**;
- these affordances can affect what the character can perceive, attempt, command, negotiate, survive or transform;
- the world should react socially and causally to major identity changes;
- the change must be stored as authoritative world/character state with provenance and history;
- characters who reject or lose such power remain valid play paths when the campaign permits it.

Do not create one universal “mythic” subsystem for every campaign. The ruleset/world determines what kinds of progression exist.

## 23. One character may legitimately operate at multiple scales

Wrath of the Righteous combines party-scale adventuring with the Knight Commander's strategic control of the crusade. The useful principle is not the specific crusade minigame; it is that **the same controlled Actor may have both embodied/local and institutional/strategic affordances**.

RPG Console should support scale changes when the Actor's world leverage justifies them:

- local: talk, investigate, fight, move, manipulate objects;
- operational: direct a squad/unit/expedition, allocate local resources;
- strategic: command armies, set policy, negotiate between institutions, assign high-level resources.

All scales use the same authoritative world and Event/Thread history. Do not create an unrelated strategy-game state store.

## 24. Major identity paths should have world reactivity

When a character becomes meaningfully different, the change should not live only on the character sheet.

Relevant Actors may:
- trust or fear them differently;
- grant or remove access;
- join or leave;
- offer different solutions;
- reinterpret prior actions;
- change political or religious responses;
- create new Threads or close old ones.

This can arise from mythic transformation, political office, faction allegiance, public reputation, technological augmentation, social status or another campaign-specific identity shift.

Use the same micro/macro-reactivity rules already defined; do not hard-code one fantasy morality tree.

## 25. Alternate control/presentation modes should share one state

Wrath of the Righteous demonstrates that different combat/control modes can coexist over the same encounter state. RPG Console generalizes this principle:

- Text, 2D Live and EXPLORE are views over one authoritative campaign;
- future detailed/fast combat presentations may differ without creating different outcomes or duplicate rolls;
- strategic and embodied views must resolve against the same Actor/Thread/Event state;
- switching presentation alone never changes canon, time, knowledge or timeline.

## 26. Strategic layers must remain integrated and optional where possible

Wrath of the Righteous is also a caution: a secondary strategy layer can become friction when it feels disconnected from the main RPG. Owlcat publicly reworked Crusade after feedback that it did not intertwine enough with story/companions and later provided an auto-crusade option.

For RPG Console:
- do not build a separate grand-strategy minigame merely because a ruler/commander POV exists;
- prefer natural-language orders + compact structured controls + World Engine resolution;
- expose detailed strategic UI only when it materially helps the campaign;
- keep Text capable of issuing the same legitimate orders;
- strategic consequences should feed companions, factions, locations and Threads rather than live in an isolated subsystem;
- allow campaigns to abstract low-value management instead of forcing repetitive administration.

The desired feeling is **greater leverage**, not more bureaucracy.

## 27. Complexity should follow the world, not the engine

Pathfinder's rich build system is useful for players who want that rules density, but RPG Console must not universalize it.

The engine should support:
- simple World Logic;
- full imported/implemented rulesets;
- campaign-specific mechanics;
- optional advanced progression.

Do not expose feats, subclasses, prestige layers, alignment matrices or other rule concepts unless the selected ruleset actually uses them.

Depth should come from meaningful choices and world reactivity, not from mandatory configuration complexity.


## 28. A polity can be an actor without becoming a spreadsheet

Kingmaker's kingdom and Rogue Trader's colonies support a general rule: settlements, realms, ships and institutions may be persistent World Actors with coarse capabilities, problems and projects.

They do not require per-citizen simulation or a mandatory management minigame.

## 29. Delegate instead of making powerful characters omnipresent

Rulers and commanders should assign trusted Actors to bounded tasks rather than personally resolving every problem.

Delegation creates:
- responsibility;
- time;
- uncertainty;
- relationship consequences;
- opportunities for success/failure/intervention.

The player remains free to intervene personally when plausible.

## 30. Rumours are claims, not facts

A rumor may be true, false, distorted or obsolete. Store and present it as knowledge about a claim until evidence establishes more.

Map/journal UI must not silently convert a rumor into authoritative truth.

## 31. Urgency requires epistemic fairness

If the character plausibly knows that an event has a deadline or escalating danger, the UI/DM should communicate useful urgency.

Do not reveal hidden clocks merely because the engine knows them. But do not punish the player for missing a deadline their character should obviously have understood.

## 32. Strategic decisions should sometimes exclude alternatives

Meaningful power often involves prioritization. Holdings, armies, budgets or institutions may force mutually exclusive or delayed choices.

Opportunity cost is preferable to endless accumulation when the setting supports it.

## 33. Record why the world changed

Major decisions and resulting Events should retain causal provenance so the player can later understand why a settlement, faction, companion or strategic situation changed.

Expose safe player-known history; keep private causes private until discovered.

## 34. Test emergent combinations adversarially

Assume players will combine systems in ways designers and agents did not predict.

For any state-mutating subsystem:
- validate ownership/access/capability/resources;
- ensure idempotency;
- test extreme combinations;
- keep caps/rules explicit;
- accept clever valid interactions instead of blocking them merely for being unexpected.


## 35. Time pressure is optional

A living world does not require mandatory quest timers.

Campaigns support **Off / Critical Only / Normal** deadline pressure.

With **Off**, exploration, travel and rest should not silently destroy content because a hidden clock advanced. The world can still react causally to actions and immediate hazards; this is not temporal stasis.

This preference is especially important for players who enjoy exploration, experimentation and role-play without optimization anxiety.

Never conflate:
- world reactivity;
- world autonomy;
- explicit immediate causal danger;
- quest/deadline pressure.

They are separate design dimensions.
