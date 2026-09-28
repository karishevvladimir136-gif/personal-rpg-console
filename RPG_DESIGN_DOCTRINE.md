# RPG Design Doctrine — industry best practices for an AI-native RPG

**Mega DM v1 owner-approved design addendum:** player intent is sovereign while the world owns outcome. A learnable world should make supported choices leave durable fingerprints and make surprises coherent in retrospect. Important people remain recognizable across changing circumstances, with bounded knowledge, their own goals and evidence-backed relationships. “A person is larger than their wounds.” Long-horizon emotional rhythm may include grief and loss while keeping room for earned agency, connection, humor and hope; misery is not sophistication. The game is entertainment, never therapy or a retention system. Details and implementation boundaries are in [Cognitive DM Craft](COGNITIVE_DM_CRAFT_RESEARCH.md), [Living Characters](LIVING_CHARACTERS_BRIEF.md) and [Positive Afterglow](POSITIVE_AFTERGLOW_BRIEF.md). These project heuristics are not validated psychological formulas.

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

## 36. DM Craft — reusable owner-approved education

**Future product architecture only.** The owner should progressively teach and shape the DM over years without editing prompts, JSON or source code. The frontier model remains the reasoning/generative engine; DM Craft supplies reusable principles and techniques, not model fine-tuning or authoritative world state.

**DM Craft = what my DM has learned. Campaign DM Style = how I want my DM to run this particular campaign.** Global DM Craft is an owner-scoped, first-class main-menu destination outside campaigns. Campaign → DM Style belongs inside the selected campaign. See [product navigation and feedback](MASTER_SPEC.md#dm-craft-and-campaign-dm-style--future-product-design), [runtime boundaries](MODEL_RUNTIME_BRIEF.md#dm-craft-context-and-authority--future-design) and [progressive roadmap](DEVELOPMENT_PLAN.md#progressive-dm-craft-slices-after-world-engine-foundations).

Global DM Craft is neither campaign canon, campaign Memory, DM-private world state, a campaign setting, a second DM, an autonomous agent nor direct fine-tuning. It cannot mutate the game. Manual owner corrections/decisions have highest authority over Craft, while code-enforced mechanics, secrecy and authoritative world facts remain binding.

### Core Doctrine and Craft Library

**Core Doctrine** is a deliberately short, high-value, versioned set of approved principles supplied broadly to relevant planning. The full design document is source material, not an enormous permanent system prompt. A future compact selection may say:

- Respect plausible free-form intent; systems define constraints and authoritative state defines truth.
- Present problems with alternate approaches, not single intended puzzle solutions.
- Unexpected valid actions create consequences, not invisible walls; failure usually changes the situation rather than halting play.
- NPC knowledge is not world truth; rumors remain claims and POV boundaries remain binding.
- Companions/NPCs have goals and initiative; persistent consequences remain persistent.
- Never repair a quest by silently invalidating player choices.
- Preserve controlled-PC agency, established Canon, mechanics and the distinction between world truth and each Actor's positive knowledge. Do not silently retcon a promise, relationship, death, failed plan or other committed history.

**Craft Library** is a larger versioned collection of structured Craft Cards, retrieved only when relevant. A conceptual card contains stable ID, title, category, when relevant, guidance, avoid/anti-patterns, optional examples, source/provenance, version, approval status and applicable DM stages. Only approved versions are active; cards are guidance, never facts about the current campaign.

Categories may include Quest Structure, Systemic Play, Investigation, Failure / Recovery, Factions, NPC / Companion Behavior, Scene Directing / DM Performance, Dialogue, Dramatic Pacing, Mystery, Exploration, Political / Strategic Play and World Reactivity. Material can cover player agency, fail-forward, quest resilience, honeycomb structures, actor autonomy, knowledge/POV boundaries, fair warning/urgency, micro-reactivity, moral conflict, delayed consequences and spotlight management. Categories are organizational aids, not mandatory subsystems.

### Long-Form Campaign Craft v1 — general design observations

The completed actual-play reference set is primarily **Critical Role Campaign 1 / Vox Machina** and **Campaign 2 / Mighty Nein**, with selected **Brennan Lee Mulligan / Dimension 20** campaigns as a compressed structural contrast. These are observations about campaign design, never instructions to imitate a living creator's distinctive voice or reproduce dialogue, characters, plots or copyrighted scenes. Owner-approved cards should express general, testable techniques in original wording.

- **Infinite potential + accumulating meaning:** players can pursue new directions, while established relationships, places and consequences continue to matter. Familiarity compounds value. Revisited NPCs and locations should appreciate through history; **Return With Delta** means a return reveals a causally supported change, not an arbitrary reset. Home bases and emotional geography anchor a stable core while the periphery evolves. Novelty has a budget: constant replacement of the world destroys accumulated meaning.
- **Waves, not constant escalation:** arcs rise, crest and release. Post-climax decompression, quiet scenes and downtime build emotional capital and give choices room to breathe. Dramatic pace should fit the campaign's explicit pressure policy; wandering is not secretly punished while Deadline Pressure is Off.
- **Relationships cause play:** promises, tensions and changing loyalties create scenes and choices. Player-created goals are legitimate campaign content. Character backstory may become world history, and personal arcs may braid with world arcs when supported, without forcing a predetermined reveal. Characters retain recognizable identity while changing believably over a long campaign.
- **Setup → dormancy → payoff:** seed opportunities, allow relevant threads to sleep, and pay them off when causality and player attention warrant it. Retrieval alone is not a reason to surface a dormant mystery. Callbacks need utility or changed meaning, not repetition to prove memory. A meaningful reveal reframes prior understanding rather than dumping exposition.
- **Consequences at mixed horizons:** immediate, medium and very delayed effects can coexist; latency and unresolved obligations should be tracked without guaranteeing every setup pays off. NPCs/factions may follow bounded off-screen trajectories, and companions may initiate within their knowledge and goals, while the controlled PC's choices remain the owner's. Failure becomes Canon; recovery responds to that failure rather than soft-resetting it.

The long-form references suggest accumulation-first, loose horizons, player-created detours, recurring people/places, long dormancy and emergent convergence. The selected compressed-format contrast suggests deliberate setup/escalation/payoff, clearer convergence and intensity control, while still adapting honestly when player choices or rolls invalidate the expected route. Neither pattern is a universal pacing rule. Stage-relevant approved cards, not this whole analysis, are what a future DM request receives.

### Teach DM and Sources / Packs

In the future **Teach DM** workflow, the owner can say: “I like how systemic games let me solve problems in unexpected ways. The DM should not force me back onto the intended route.” The same DM feedback boundary proposes a structured card; the owner can **Approve, Edit or Reject** in ordinary language. Only an explicitly approved version becomes active. All durable changes, including doctrine edits and pack activation, are versioned and reversible; restoring an older choice creates a new effective revision and preserves history. The AI cannot silently rewrite its own rules.

A bounded Sources / Packs workflow may accept owner notes, documents, analysis, appropriate references and separately authorized research/import results. It extracts proposed techniques into a pack such as **Modern Systemic RPG Quest Design v1**. Review must identify which card versions the owner is approving; unapproved cards remain inactive. Sources themselves never automatically become runtime instructions. Preserve references/provenance, owner-authored notes and derived principles rather than proprietary scripts, complete quest text or long actual-play transcripts. Import or research requires its own authorization; this addition starts neither.

Scene Directing / DM Performance explicitly supports general techniques from tabletop GM practice and owner-approved actual-play analysis, including Critical Role: NPC initiative, scene breathing room, tension escalation, delayed reveals, companion spotlight, distinct NPC goals, callback payoff, character-driven detours and maintaining momentum during improvisation. It is not “imitate Matt Mercer” or reproduction of a living creator's distinctive expression. These techniques primarily inform narration and appropriate social/scene planning.

### Initial candidate material — not implemented cards

The existing roadmap already supplies candidate material for a future owner-approved **RPG Console Core Craft** pack. The principles above, [Systemic World References](SYSTEMIC_WORLD_REFERENCES.md) and [POV / World Leverage](POV_AND_WORLD_LEVERAGE.md) contain lessons derived from:

- Larian / BG3 player-first systemic freedom; Deus Ex / immersive-sim problems-not-puzzles and recovery.
- New Vegas honeycomb quests; Disco Elysium micro-reactivity and fail-forward; Wildermyth character consistency.
- Pathfinder: Wrath of the Righteous embodied/strategic scale and transformative identity.
- Kingmaker realm-as-Actor, delegation and fair urgency; Rogue Trader jurisdictional authority, rumors ≠ facts, holdings/projects and officer companions.
- POV / World Leverage, selective simulation, persistent consequences and campaign resilience after unexpected actions, plus other approved roadmap research.

These are documented sources from which cards can later be produced and reviewed, not an active library or an already-approved pack. No new research cycle is needed for this design addition.

### Owner feedback corpus and DM Craft evaluation / Academy

**Permanent Mega DM benchmark:** freeze one synthetic campaign of approximately 48 scenes and version its fixture/expected authorities. Seed recurring NPCs and locations/home base; promises and changing relationships; character backstory becoming world content; quiet downtime and high-intensity scenes followed by decompression; failed plan and recovery; player-created objective and delayed/abandoned apparent main quest; companion tension and a legitimate initiative opportunity; dormant mystery and delayed useful callback; setup/dormancy/payoff; short/medium/long consequence latency; personal/world arc intersection; and character evolution without identity loss. The fixture is synthetic and non-canonical, never a live campaign import.

Assess continuity, character consistency, familiar people/place use, Return With Delta, familiarity/novelty balance, downtime and intensity variance, meaningful setup/payoff, callback usefulness, uptake of player goals/backstory, relationship causality, consequence latency, durable failure/recovery, NPC/companion initiative, deadline pressure and player agency. Red lines include DM-private or NPC-knowledge leakage, unauthorized PC thoughts/actions, history rewrite, erased consequences, unsupported resurrection, lost major promise, soft-reset failure, premature payoff solely because retrieval returned a thread, and forcing the presumed intended route.

Layer one is deterministic/offline verification of fixture integrity, approved stage selection, provenance, state/knowledge/privacy and authority. Layer two is separately authorized live model-quality replay on the *same frozen campaign* for release candidates. Where informative, compare the same model/context baseline, baseline + Core Doctrine, and baseline + Core Doctrine + Long-Form Craft. Review rubric dimensions and failures; one model output is never unquestioned ground truth. Mega DM v1 is not owner accepted merely because deterministic tests pass; report model-quality evidence and limitations separately.

Later, **Great DM response**, **Bad DM behavior** and an explanation of why may create non-canonical improvement/evaluation examples with provenance and approval status. They are not world canon, Memory facts or private campaign truth. A campaign-linked example retains its campaign/timeline/operation scope; promotion into the global approved corpus requires explicit owner approval and removal of campaign/private facts, preferably by synthetic abstraction. An approval never waives secrecy or permits cross-campaign retrieval of original facts.

Examples may later support relevant retrieval, regression fixtures, preference evaluation and an optional future fine-tuning dataset. Evaluation uses synthetic or explicitly approved scenarios in development/QA, never authoritative gameplay. A lightweight Academy should test:

- A previously killed quest-giver leaves only causally plausible recovery paths, without resurrection or erased consequences.
- An unexpected infiltration approach is judged against constraints rather than an intended route.
- Failed persuasion creates a plausible complication rather than an automatic dead end.
- A companion with relevant expertise gets an opportunity for initiative without deciding for the player.
- An NPC cannot know DM-private information; rival factions retain independent interests.
- Prior player consequences remain committed rather than silently undone.

Where useful, compare baseline DM against DM plus a proposed Craft Pack on the same frozen scenarios/model/context, record expected behavior, regressions and limits, and review before declaring benefit. Candidate versions may enter isolated evaluation without becoming active gameplay guidance. No evaluation or model call is executed by this documentation pass.

### Fine-tuning is optional and late

First build compact Doctrine, Craft Cards, relevant retrieval, owner feedback and synthetic evaluation. Only sufficient owner-approved/evaluated data could justify later consideration of supported fine-tuning or preference training. A possible record is world/context + player action → preferred plan, or same context → response A versus B → owner preference. A separate provider/model/data/privacy/cost review and explicit authorization are required. The application must remain fully functional without fine-tuning; it is neither a dependency nor current implementation work.

## 37. Earned growth, meaningful rewards and credible challenge

Progression is a first-class requirement for RPG-capable Rulesets, not a universal XP/level ontology. Systems define constraints; authoritative state defines truth; AI interprets arbitrary intent; validated consequences persist. The [Rulesets progression and scaling contract](RULESETS_AND_DYNAMIC_UI_BRIEF.md#progression-engine-and-reward-authority) owns the mechanics. DM Craft can later teach these principles, but never grant numeric progression or mechanical abilities.

Reward meaningful achievements and legitimate alternate solutions rather than implicitly making killing the objective. Preserve how a problem was solved when choosing relevant mastery or other rewards. Distinct tracks can express skill, institutional rank, relationships to powers and transformative identity; career opportunity is not merely a fantasy XP threshold. Repetition without meaningful challenge should not create unlimited mastery.

Growth should change affordances and sometimes make old dangers easy. Hybrid is the recommended general challenge policy: preserve intrinsic threat hierarchy, permit plausible bounded encounter adaptation and allow earned easier victories. Do not weaken ancient threats automatically, strengthen every rat to match the party, inflate bosses without bounds or rescale an already materialized encounter to negate success. Difficulty and progression are separate choices; fixed zones and full level matching are both optional profile policies.

Pacing should offer meaningful optional preparation, warnings and opportunities, not fabricated XP or a forced route. Forecast reward budgets help detect obvious under/over-progression and early caps without awarding anything. Caps are Ruleset policy, not engine limitations; horizontal, social and epic growth can remain meaningful beyond a normal cap. High power may expand [World Leverage](POV_AND_WORLD_LEVERAGE.md#progression-and-world-scale-capabilities), subject to actual resources, authority, resistance and bounded causal settlement. This is derived product direction, not a new research cycle or already active Craft Cards.

## 38. Adventures, pacing and tier-sensitive experience

**Owner-directed future product doctrine, not an active prompt change.** Adventures are bounded stories within a continuing Campaign, not resets of hero state or mandatory replacements for sandbox. Quick 1–2h, Evening 3–5h, Mini Arc 8–15h, Custom and Open-ended guide density/escalation/convergence; Session count and actual playtime do not impose artificial rush, fictional deadlines or a prescribed PC route. Aim for setup/payoff, climax and resolution appropriate to the requested envelope while respecting detours, alternate solutions and durable outcomes.

A low-tier and a high-tier hero in the same World should receive materially different threats, solutions, social context, stakes, expected competence, reactions, reward significance, equipment value and consequence scale where appropriate. Actual capabilities matter; World Logic need not use levels. Do not reduce tier awareness to HP inflation, universal level matching or removal of earned competence. Preserve [World Anchored / Adaptive / Hybrid](RULESETS_AND_DYNAMIC_UI_BRIEF.md#challenge-scaling-and-encounter-materialization); weak enemies can stay weak and powerful heroes can feel powerful.

Extend §37 reward doctrine with [reward integrity](RULESETS_AND_DYNAMIC_UI_BRIEF.md#reward-integrity-and-usable-power): rarity/scarcity, mechanical power, economic value, narrative significance and current usability are distinct. A major achievement deserves meaningful payoff, with deliberate justified exceptions, while usable power stays within supported policy bounds. Low-tier heroes can discover powerful artifacts without automatically gaining full usable mechanics. Do not flatten every reward into equipment or XP; exploration, information, contacts and access may matter.

The [future Adventure Acceptance Set](ADVENTURE_ACCEPTANCE_SET_BRIEF.md) evaluates hook/pacing, agency, tier awareness, creativity, exploration, NPCs, variety, rewards, loot plausibility, setup/payoff and closure through evidence and owner play, separate from deterministic authority tests. Preserve the frozen Mega DM v1 benchmark/rubric and historical comparisons unchanged. There is no automated universal DM score or silent prompt/Craft activation from this doctrine update.

## 39. World-authentic loot and creative exploration

Treat secured objects as properties/constraints and search as free-form intent, not a catalogue of loot buttons or a single intended key solution. Contextual contents respect actual owners/history and remain stable after materialization. Drawers can be empty, NPC possessions reflect their lives, caches reflect their context and a major vault normally has meaningful reward significance; no universal level-scaled treasure or corpse farming. Discovery, possession, ownership, identification and usability remain separate.

Creative physical/social solutions use known World properties and the active Ruleset, not invented measurements or capabilities. A chest may break, its fragile contents may suffer and its noise may have causal consequences; legitimate alternatives should not be rejected for lacking a UI button. Persistent depletion and item loss create consequences/recovery where required, not silent respawn, duplicate grants or universal indestructibility. [World Engine](WORLD_ENGINE_BRIEF.md#search-containers-and-stable-contextual-contents) owns causal contents/Events; [Rulesets](RULESETS_AND_DYNAMIC_UI_BRIEF.md#hidden-properties-provenance-and-economic-absorption) owns mechanics/knowledge/commerce eligibility. No full crafting or loot simulation starts here.
