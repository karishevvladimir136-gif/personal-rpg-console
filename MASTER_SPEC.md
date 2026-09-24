# PERSONAL RPG CONSOLE
## Product specification — accepted foundation and owner-approved World roadmap
### Private single-user home application

**Current source-of-truth integration:** Phases 0–3.5 remain owner-accepted at their recorded checkpoints. The source-of-truth integration is owner-approved at `7d945d3754647015ecdd765cef2b688dbab38777`; the complete owner-approved roadmap at `a3d0fa66da42f36a5401c3513e3484e83150f9d3` is integrated from production base `cb7f6be2fb513de13604d381046a3240f3261383`. The [Phase 3.75 owner architecture freeze](PHASE375_ARCHITECTURE_DECISION.md) remains unchanged. Phase 3.8B is **ARCHITECTURE / CAPABILITY EVIDENCE COMPLETE WITH DOCUMENTED LIMITATIONS**; the [production-safe final record](PHASE38B_ARCHITECTURE_FREEZE.md) references historical freeze `3c99552a66d9b4b270b3a7a8552c709cf9faf73e` without importing its experiment infrastructure. **Broad product research/design is closed** unless implementation reveals a genuine architectural blocker. The next development phase is the **Production Multi-Agent Coding Sprint**, scoped in DEVELOPMENT_PLAN and to begin in a fresh project task. Production coding has not started in this documentation finalization; no provider call, import or deployment occurs. Historical phase instructions are not renewed permissions.

**Forward priority after owner-accepted World Lab D2A:** the preceding integration note records its historical point in time. From the accepted D2A baseline, the next bounded product priority is **Mega DM v1**, then **D2B → Timeline Explorer V1 → Timeline Explorer V2 → Enter This World → FRAME / Visual Bible + fal → 2D Presentation Engine → VIDEO**. D2B is deferred until Mega DM v1 is implemented, evaluated and owner-accepted. This order is a roadmap, not implementation authorization; [current status](DEV_STATUS.md) distinguishes accepted work from future work.

---

# 1. PRODUCT GOAL

Build a private source-grounded narrative world application that replaces the current manual RPG workflow built around World Bibles, Character Bibles, Campaign Briefs, Checkpoints and DM Ledgers, and can grow into reusable source worlds, scenario composition and bounded counterfactual simulation.

The intended product supports traditional fantasy, literary and relationship-focused play, historical/alternate-history worlds, military and political scenarios, civilization-scale counterfactuals and freeform worlds. Natural language remains the main interface: **natural language in → structured reality underneath → natural language out**. The new World capabilities are design targets, not claims about the accepted runtime.

The future path is **World Library → World Pack → Scenario Composition → Divergence / What If → Enter This World → Ruleset → RPG**. An owner can compile uploaded sources or describe a new world, explore consequences with one to three explicitly selected models, then play from a chosen exact checkpoint. Ordinary gameplay retains one primary DM.

The finished experience should feel like opening a living campaign world rather than opening a generic chatbot.

The application is for one owner only.

It is NOT a commercial SaaS product.

Do not design for:
- public sign-up;
- subscriptions;
- payments;
- multiplayer;
- social feeds;
- creator marketplaces;
- teams;
- public campaign sharing;
- enterprise scale;
- millions of users.

The product only needs to be excellent for one person using several independent campaigns from desktop and iPhone.

Core promise:

> Open a campaign. Press Continue. Write what the character does. Play.
>
> The application handles canon, continuity, hidden DM state, inventory, session memory, images, videos and checkpoints underneath.

---

# 2. PRODUCT PRINCIPLES

## 2.1 Story first

The user should think about the story, not the software.

Never require the user to manually:
- copy checkpoints;
- version DM Ledgers;
- paste old session summaries;
- edit JSON;
- choose retrieval chunks;
- manage context windows;
- remind the DM who recurring NPCs are.

## 2.2 Multiple isolated campaigns

Every campaign is its own universe.

Campaign A must never leak:
- canon;
- NPCs;
- DM secrets;
- inventory;
- visual references;
- session memories;

into Campaign B.

Every campaign-owned database object must belong to a `campaign_id`. Future reusable World Library sources and World Pack versions are owner-scoped, with explicit authorized campaign bindings and separate instantiated campaign identities. This is an intentional extension of the old campaign-only assumption, not permission to share mutable campaign state. See section 44 and the World Library brief.

## 2.3 Free-form RPG

The default interface is free text.

Do not turn the game into an A/B/C adventure.

Suggested actions may appear as optional convenience chips, but they must never limit what the user can type.

## 2.4 Real hidden DM state

The current manual “DM Ledger — do not open” workflow becomes true server-side private state.

Hidden data must not be sent to the normal browser response.

## 2.5 Long-term continuity

The application should support campaigns lasting hundreds of scenes and many sessions without depending on a single giant chat transcript.

## 2.6 Visual continuity

Generated images and videos should use canonical character/location/item references where available.

Visual generation must never reveal secrets the player has not discovered.

## 2.7 Ruleset and provider independence

No world, campaign, character, save, timeline, World Thread or What If simulation may depend structurally on D&D 5e. D&D 5e is one selectable full ruleset, alongside World Logic and approved custom profiles. Existing fixed d20/HP UI and the `console-basic-v1` house profile require a future compatibility refactor; they are not a complete official 5e implementation or proof that decoupling already exists.

No durable world architecture may depend on a particular AI provider/model. Model choice is execution policy and provenance. The accepted runtime uses OpenAI; future small server adapters and a verified model registry permit replacement without changing world identity or history. Quality takes priority over token-cost savings; use the owner's strongest configured preference rather than automatic economy routing. Keep bounded context, one gameplay DM and no silent fallback. Avoid commercial concurrency economics and infrastructure sprawl.

---

# 3. CORE INFORMATION MODEL

The accepted campaign hierarchy is:

APP
→ CAMPAIGNS
→ SESSIONS
→ SCENES

The proposed authoring layer adds owner-scoped World Library → immutable World Pack versions → approved Scenario/Divergence contracts → isolated campaign/timeline instances. Existing campaign timelines contain sessions/scenes and exact save manifests. World Actors reference stable entities; Threads represent goals/clocks; Events record validated facts. Source packs are not live campaigns, summaries or a second branching system. The five section 44 briefs define these future extensions.

Each Campaign contains:

- Campaign settings
- RPG Engine / Instructions
- Canon documents
- Reference documents
- Character Bible
- Campaign Brief
- Public campaign state
- Private DM state
- Player character
- NPC records
- Relationships
- Inventory
- Quests
- Clues
- Locations
- Sessions
- Scenes
- Images
- Videos
- Visual Bible / approved references
- Session summaries
- Campaign snapshots

---

# 4. DATA VISIBILITY

Use four visibility classes.

## PLAYER CANON

Readable/editable by user and treated as authoritative.

Examples:
- World Bible
- Character Bible
- Campaign Brief
- House Rules
- Current Character State
- Current Inventory

## REFERENCE

Material available to the DM but lower priority than canon.

Examples:
- inspiration PDFs
- research
- concept images
- optional notes

## PLAYER DISCOVERED

Facts the player character has legitimately learned.

Examples:
- clues
- known NPC facts
- discovered locations
- known relationships
- revealed timeline events

## DM PRIVATE

Server-only material.

Examples:
- true culprit
- hidden clocks
- unrevealed motives
- secret faction plans
- clue graph
- unrevealed NPC history
- campaign truth
- future consequences

Normal client payloads must NEVER contain DM PRIVATE content.

A spoiler-gated debug screen may expose it only after two explicit confirmations.

---

# 5. VISUAL DIRECTION

Use the generated mockups in `/design` as the primary visual reference.

The UI should be inspired by premium narrative RPG tools such as Everweave, but it must not copy proprietary assets.

Visual language:

- deep charcoal / near-black backgrounds;
- warm bronze-gold accents;
- off-white literary text;
- muted red HP;
- cool blue magical resources;
- thin elegant borders;
- large cinematic campaign art;
- restrained ornament;
- serif typography for story/headings;
- clean sans-serif for controls/data;
- rounded but not bubbly panels;
- premium dark RPG journal feel.

Avoid:
- generic SaaS dashboard look;
- excessive neon cyberpunk;
- fake parchment everywhere;
- huge skeuomorphic fantasy frames;
- childish game UI;
- heavy animations that slow reading.

The UI must support completely different genres later:
- dark fantasy;
- science fiction;
- horror;
- western;
- modern supernatural.

Campaign art creates identity; the overall app shell stays consistent.

---

# 6. NAVIGATION HIERARCHY

The app has three distinct levels (consolidated owner requirement, section 36):

- **Main menu:** Campaigns, future **DM Craft**, General Settings, Exit. DM Craft is a first-class owner-scoped application destination outside campaigns. No campaign sidebar, character data, or gameplay bottom navigation. Before authentication, Exit explains that sign-out is unavailable; it never closes the browser, stops the server, or erases preview state.
- **Campaign selection:** existing cards, management previews, New Campaign preview, and Back to main menu. Continue opens the selected campaign's Game. Concepts remain clearly unstarted and cannot resolve to another campaign's data.
- **Inside a campaign:** Game, Chat with DM, future **DM Style**, Character, Inventory, Party, Journal, Map, Library, Gallery, Sessions, Saves, Campaign Settings, and a separate Back to campaigns control. DM Style is a first-class campaign section, never a global preference. Show the active campaign name. Mobile bottom navigation is restricted to this level; Saves uses More. Camp is entered from Game → Rest → Long Rest, not a permanent recovery shortcut.

Future design adds **World / Мир**, containing Live World and What If, without replacing Saves. Owner-level World Library is distinct from campaign Library. Preserve the current hierarchy, bilingual presentation and mobile More pattern; this document adds no navigation implementation.

Use explicit campaign-scoped URLs and resolve campaign identity from the URL. Unknown IDs return a missing-page response, never the sample campaign. Reuse layouts/screens and retain useful legacy redirects. Global interface language and reading/accessibility preferences have one source of truth, separate from campaign story language, rules/play style, narrative style, and visual preferences.

---

# 7. SCREEN A — CAMPAIGNS + LIBRARY

Reference mockup:
`design/03_campaigns_library.png`

## Campaign Home

Show campaign cards with:
- cover;
- title;
- genre/subtitle;
- current character;
- level or another profile-appropriate descriptor, if applicable;
- session number;
- current known location;
- last played;
- Continue button.

Actions:
- New Campaign
- Continue
- Rename
- Duplicate
- Archive
- Export
- Delete

Campaign isolation is mandatory.

## Library

Inside a selected campaign, show:

CANON
- RPG Engine
- World Bible
- Character Bible
- Campaign Brief
- any additional canon docs

REFERENCE
- maps
- research
- PDFs
- images
- notes

ARCHIVED
- old versions

Actions:
- Upload Document
- New Document
- Edit
- Rename
- Change status
- Version history
- Restore old version
- Archive

DM PRIVATE does not appear in the normal Library list.

Intended document/asset formats (not a claim that every importer already exists):
- TXT
- MD
- PDF
- DOCX
- PNG/JPG/WebP

Every edit creates a new version rather than destructively overwriting history.

Reusable source ingestion, including EPUB, compiler passes and World Pack provenance are separately scoped in [WORLD_LIBRARY_AND_WORLD_PACKS_BRIEF.md](WORLD_LIBRARY_AND_WORLD_PACKS_BRIEF.md). They extend existing document versioning and Memory rather than duplicating them.

Future **World Library → New World Pack** may offer **Upload Sources / Research from Web / Describe From Scratch / Combine**. Research from Web is an explicit owner-triggered bounded research job: the system proposes a finite research plan, may use parallel specialized workers to find/read public sources, preserves citations/provenance and disagreements, then feeds approved sources into the same Canon Compiler. It is not unrestricted scraping, not a second canon authority and not the gameplay DM silently browsing during ordinary turns. The owner sees coverage/gaps and may explicitly run another bounded **Deepen Research** pass.

---

# 8. SCREEN B — GAME

Reference mockup:
`design/01_game.png`

This is the primary screen.

Desktop uses three columns:

LEFT
navigation

CENTER
story / scene feed

RIGHT
context-sensitive quick state

## Scene card

A DM scene may contain:
- large scene image if generated;
- narration;
- NPC dialogue;
- visible dice results;
- compact combat block when relevant;
- FRAME button;
- VIDEO button;
- overflow menu;
- bookmark/save moment.

Player reply appears below as a distinct card.

The input stays pinned at bottom.

Placeholder uses the current character name; “What do you do, James?” is a sample campaign example, not a hardcoded identity.

Controls:
- Send
- OOC toggle
- Roll Dice
- Take Note
- What Do I Know?
- optional suggested actions

Suggested actions are optional and never exhaustive.

## Context-sensitive right panel

Do not always show the same information.

The following HP/combat/resource examples apply only to compatible ruleset profiles. A literary or historical World Logic campaign may instead show relationships, injuries, reputation, possessions or current commitments. Do not force empty D&D panels into every campaign.

NORMAL SCENE
- HP/resources
- current objective
- party
- location
- recent clues

INVESTIGATION
- current clues
- involved NPCs
- evidence links

COMBAT
- HP
- conditions
- initiative
- enemies
- distances/resources

TRAVEL
- current route
- vehicle
- destination
- weather
- travel objective

SOCIAL SCENE
- involved NPC
- known facts
- public relationship status

---

# 9. SCREEN C — CHARACTER + INVENTORY

Reference:
`design/02_character_inventory.png`

## Character

Keep identity and source facts stable; derive mechanics panels from the selected versioned Ruleset Profile. The following is the fantasy/house-profile example, not the universal character ontology:
- portrait / full-body approved art;
- name;
- species;
- class;
- level;
- XP if used;
- HP;
- AC;
- initiative;
- speed;
- core stats;
- core skills;
- spell/pact resources;
- active conditions.

Simple visual paper-doll for compatible bodies/equipment:
- Head
- Neck/Amulet
- Armor/Coat
- Main Hand
- Off Hand
- Belt
- Legs
- Boots

Do NOT build a 3D character system.

Use a static character image with surrounding equipment slots when appropriate. Other profiles may use a loadout, documents/possessions or relationship-focused sheet. Use bounded reusable field/component types, not generated executable UI or a low-code platform; see [RULESETS_AND_DYNAMIC_UI_BRIEF.md](RULESETS_AND_DYNAMIC_UI_BRIEF.md).

Tabs:
- Character
- Abilities
- future **Progression** for applicable Rulesets
- Spells
- Background
- Notes

### Spells and spellcasting — future product design

For spell-capable profiles, **Character → Spells** is a first-class Ruleset-driven view over authoritative Ability Definitions, Actor ownership/unlock state, preparation state and current resources. It is not a free-form DM list. A profile may distinguish **known**, **spellbook-owned**, **prepared/selected**, **available by source**, and **currently castable** spells; expose only distinctions that actually exist in that Ruleset. A wizard-like profile can present a Spellbook plus prepared subset, while another caster may expose only known spells, a class-granted available list, pact/invocation resources, mana, cooldowns or another profile-specific model.

Where applicable, the authoritative spellcasting contract includes spell/ability source and version, prerequisites, class/domain/school access, preparation rules, slots/charges/mana or other costs, components, concentration/maintenance, ritual or alternate casting, range/targets/area, duration, checks/saves/resistance, upcasting/scaling and recovery policy. **Can Cast Now** is derived server-side from the current character, world and Ruleset state; the DM cannot invent access to a spell or ignore a missing resource. Acquisition through level-up, teacher/training, scroll/book, research, pact, artifact or another validated source preserves provenance.

High-level magic is not artificially limited to encounter-scale presentation. If the active World Magic Rules and Ruleset genuinely authorize a large effect, casting can enter the same bounded [world-scale settlement](WORLD_ENGINE_BRIEF.md#progression-rewards-and-world-scale-settlement) as any other powerful action and persistently alter Locations, infrastructure, terrain or other world state. Text, 2D, video and future EXPLORE visualize committed consequences; they never decide what the spell accomplished.

### Progression and advancement — future product design

**Character → Progression** is a first-class profile-driven experience. Progression is required for RPG-capable Rulesets, but XP/levels/classes/skill trees are not universal. XP profiles can show level, current XP, next threshold and a progress bar; milestone profiles show actual milestones without fake numeric XP. Multi-track profiles show only relevant tracks in a readable compact view; Off/zero-track profiles do not display empty fantasy mechanics.

Show **LEVEL UP AVAILABLE** or **ADVANCEMENT AVAILABLE** when a validated Pending Advancement exists. The player normally opens it explicitly, selects supported class/subclass/multiclass, feat, stat, spell, skill, proficiency, perk, feature or mythic options, reviews Before / After and confirms. Server validation applies the choice atomically; the AI never silently chooses permanent mechanics unless the Ruleset explicitly defines automatic advancement. Display discovered latent abilities separately from unlocked abilities, with only player-known prerequisites. Pending choices survive save/load.

Game may show compact system notices separate from DM prose, such as “+500 XP — Objective Complete,” “Sword Mastery increased” or “Advancement Available,” only from committed results. The amount is illustrative, not a universal reward. Aggregate minor rewards to avoid narrative-feed spam. Session Recap can include progression gained, improved tracks, advancement, new abilities/features, pending choices and title/rank changes, grounded in authoritative records and player visibility.

The [Rulesets progression contract](RULESETS_AND_DYNAMIC_UI_BRIEF.md#progression-engine-and-reward-authority) defines tracks, rewards, ability ownership/eligibility, exact saves and future acceptance. These screens and mechanics are not implemented by this design addition.

## Inventory

Structured categories:
- Equipped
- Weapons
- Ammunition
- Gear
- Consumables
- Quest Items
- Key Items
- Money
- Vehicle Storage
- Other Storage

The accepted adventure-profile inventory presentation is a responsive icon-slot grid, with storage views separate from category filters and search. Player, companion, stash, and applicable transport views share equipment and item records; see section 36. Future profiles may use military loadouts, social documents, attunement, cargo, survival resources or abstract possessions while retaining stable ownership/provenance and exact saves.

Each item supports:
- icon/image;
- quantity;
- description;
- mechanics;
- acquired session;
- storage location.

Manual corrections by the user are canonical.

---

# 10. SCREEN D — JOURNAL / EVIDENCE BOARD / RELATIONSHIPS

Reference:
`design/04_evidence_board.png`

Tabs:
- Quests
- Timeline
- People
- Locations
- Evidence
- Notes

## Evidence Board

A visual investigation board.

Cards may represent:
- clue;
- NPC;
- place;
- item;
- document;
- theory.

Allow user to:
- drag cards;
- create manual links;
- add personal notes;
- mark theories.

AI may suggest connections but must not create player-visible secret connections.

Right panel:
- discovered clues;
- known relationships.

Relationships should use human-readable states, not hidden numeric love meters.

Examples:
- Close
- Friendly
- Professional trust
- Cautious
- Tense
- Hostile
- Unknown
- Romantic interest
- Complicated

Only show what is reasonably knowable to the player.

---

# 11. SCREEN E — MAP & TRAVEL

Reference:
`design/05_map_travel.png`

Tabs:
- World
- Region
- Local

The map is not a tactical grid.

It is a campaign travel/discovery map.

Show:
- current location;
- visited locations;
- known locations;
- unknown/locked locations;
- current route;
- planned route;
- points of interest;
- hazard zones if known.

Location detail card:
- image;
- name;
- region;
- visited status;
- known description;
- known resources/threats;
- Set Destination.

Never reveal undiscovered DM-only locations.

For the first implementation, maps may be image-based with overlay pins and routes rather than a full GIS system.

---

# 12. SCREEN F — SESSION RECAP + GALLERY

Reference:
`design/06_session_recap.png`

At session end automatically create:

- session title;
- session cover/poster;
- short recap;
- key moments;
- important discoveries;
- inventory/resource changes;
- relationship changes;
- exact resume point.

Gallery tabs:
- Session
- Frames
- Videos
- Characters
- Locations
- Items
- Favorites

Any scene can be marked:
“Save Moment”

Every session may generate one poster-like cover.

---

# 13. SCREEN G — MOBILE

Reference:
`design/07_mobile.png`

Mobile is first-class.

Requirements:
- full-width game feed;
- sticky input;
- FRAME/VIDEO directly under scene;
- collapsible quick character bar;
- large touch targets;
- bottom navigation;
- full-screen generated media;
- usable inventory;
- usable map;
- no hover-only controls.

A native iOS app is NOT required initially.

A responsive web app installed to the Home Screen is sufficient.

---

# 14. CREATE CAMPAIGN FLOW

Step 1:
Basics
- title
- subtitle
- language
- rules preset
- difficulty
- cover

Step 2:
Documents
- upload world/instruction files
- mark Canon or Reference
- future: select a pinned World Pack, describe a world from scratch, or approve a composed Scenario Contract

Step 3:
Character
- upload/paste Character Bible
- optional portrait/reference images
- future origin choices: Original Character or Existing Canon Character, with an explicit date/age/chapter/event continuity anchor
- derive an evidence-backed snapshot of identity, location, capabilities, possessions, relationships and character knowledge at entry; do not leak later source outcomes
- reuse an existing world entity on takeover, with branch-local player control; personality informs play without forcing source plot

Step 4:
Campaign Brief
- upload/paste
- may be blank

Step 5:
DM setup
Option:
- start with existing private state
- generate private campaign state from Brief
- leave empty

Step 6:
Review and Create

Future creation/Enter This World selects an available Full Ruleset, World Logic or approved Custom Ruleset and a primary model configuration with optional task overrides. Campaigns hold configuration IDs, never provider keys. Canon before the entry point is history; subsequent outcomes can diverge. Source fidelity does not override player agency. These new creation paths are design-only under section 44; they do not authorize importing real private state through the historical Step 5 example.

No campaign should auto-generate a story unless user explicitly requests it.

### Progression and scaling setup — future design

**Create Campaign → Rules & Play Style** offers a small compatible set: Ruleset (available D&D-like, World Logic, Custom or other supported profile); Progression (**Ruleset Default / XP / Milestone / Hybrid / Off**); and Challenge Scaling (**World Anchored / Adaptive / Hybrid**). Expose only choices the active profile supports; Hybrid scaling is the recommended general RPG default, not a universal requirement. Advanced can hold additional profile-specific controls, without dozens of mandatory setup sliders.

After creation these live at **Campaign → Rules & Play Style**, the existing dedicated campaign settings section. They are mechanical policies, distinct from Campaign DM Style and Global DM Craft. Changes are prospective/versioned and require compatible mappings at a coherent boundary; never rewrite historical rewards, progression, pending choices or materialized encounters. See [Challenge Scaling](RULESETS_AND_DYNAMIC_UI_BRIEF.md#challenge-scaling-and-encounter-materialization).

---

# 15. GAME / DM RUNTIME

The DM is one primary AI runtime.

Future DM Craft adds non-canonical guidance to that same runtime: **authoritative RPG state + Canon / Memory + approved Global DM Craft + Campaign DM Style → existing DmProvider plan / narrate / feedback → server-validated consequences → authoritative commit**. Stage-specific privacy still applies; feedback proposes preferences, not gameplay consequences. The frontier model remains the reasoning/generative engine. See [DM Craft runtime boundaries](MODEL_RUNTIME_BRIEF.md#dm-craft-context-and-authority--future-design).

It uses the campaign's selected execution policy and applicable ruleset. OpenAI is the accepted initial transport, not a universal dependency. Future World Resolver/Compiler/Memory tasks return bounded validated proposals through the shared Model Runtime; they are not autonomous DMs. Models never write state directly. Proposed world settlement extends the durable turn lifecycle with atomic player/world outcomes, recorded dice and the existing timeline fences (World Engine brief).

Do not begin with a swarm of agents.

Future progression follows **validated Event/achievement → Ruleset Reward Resolver → staged Progression Events/tracks → prerequisites/Pending Advancement → explicit choices when needed → server validation and atomic commit**. Trusted policy owns reward eligibility, numeric valuation, distribution, caps and unlocks; the DM supplies semantic evidence, never arbitrary XP or ability grants. World Engine, Memory, DM Craft and Text/2D/EXPLORE are not progression authorities. [Rulesets](RULESETS_AND_DYNAMIC_UI_BRIEF.md#progression-engine-and-reward-authority) owns the detailed contract; [World Engine](WORLD_ENGINE_BRIEF.md#progression-rewards-and-world-scale-settlement) supplies causal integration.

The DM receives:
- RPG Engine;
- relevant current canon;
- character summary;
- public campaign state;
- private campaign state;
- recent scenes;
- retrieved older memories;
- relevant NPC/location/item records.

The DM returns a structured object containing:

PLAYER OUTPUT
- narration
- visible rolls
- public discoveries
- suggested optional actions if desired

STATE PATCHES
- character resource changes
- inventory changes
- quest changes
- location changes
- relationship changes
- public state changes

PRIVATE PATCHES
- hidden clocks
- NPC private state
- faction plans
- unrevealed consequences
- new DM facts

VISUAL DESCRIPTION
- spoiler-safe visible characters
- location
- lighting
- weather
- action
- image/video direction

Private fields are processed server-side and never rendered to the player.

---

# 16. DICE

Use real server-generated randomness with durably recorded results and deterministic validation/application. Retry reuses the recorded roll. The selected ruleset defines eligible dice/check methods; World Logic may resolve actions without dice. Current d20 mechanics remain a compatibility profile rather than a universal rule.

Examples:
- 1d20+5
- 2d6
- 1d10+3

Return:
- individual dice;
- modifier;
- total.

The AI requests a roll.
The server actually rolls it.

Do not let the model simply invent visible dice numbers.

Hidden rolls remain server-side.

Campaign **Rules & Play Style → Checks & Dice** controls check frequency and presentation independently of difficulty (section 35). The AI proposes a structured check; the server validates it and produces/records the actual result before narrating the action's outcome. Animation only presents that recorded result and must not generate another roll. Phase 0 is an explicitly labeled fixed-sample exception for UI demonstration, never live gameplay.

---

# 17. MEMORY ARCHITECTURE

Do not resend the entire campaign transcript every turn.

Detailed budgeting, retrieval, summary lifecycle, failure handling and acceptance requirements are specified in section 38. Recent-scene counts below are targets subject to token budgets, not unlimited input.

## Always available
- core instructions;
- current character;
- current public state;
- current private state summary;
- current scene.

## Recent context
Last ~10–20 scenes.

## Long-term retrieval
Search:
- canon docs;
- older scene summaries;
- NPC memories;
- promises;
- prior clues;
- item provenance;
- locations;
- relationship events.

## Session summaries
Created automatically at END SESSION.

## Campaign snapshots
Created periodically and at session end.

## Canon conflict checks
Before final output, check important facts such as:
- NPC alive/dead;
- eye/hair/species;
- known relationships;
- inventory ownership;
- location;
- important promises;
- consumed/destroyed items.

Manual user corrections override AI-generated state.

---

# 18. “WHAT DO I KNOW?”

Add a button available from Game and NPC/Clue screens.

Purpose:
Answer only from player-discovered information.

Examples:
- What do I know about Marcus?
- What do I know about the symbol?
- What do I know about this city?

This function must never query hidden DM truth in a way that leaks secrets.

---

# 19. VISUAL BIBLE

Each campaign has approved visual references.

Categories:
- Player Character
- Companions
- Important NPCs
- Locations
- Items
- Vehicles
- Campaign style

Actions:
- Set as Canon Reference
- Replace reference
- Add alternate outfit
- Add injured state
- Add location variant

Generation priority:
1. user-approved reference;
2. current canonical reference;
3. canon text description.

---

# 20. FRAME GENERATION

Every scene has FRAME.

One click should work.

Optional expanded settings:
- Portrait
- Wide Shot
- Close-up
- Cinematic
- Location
- Item

The server generates a spoiler-safe visual brief from:
- scene;
- visible characters;
- canonical references;
- equipment;
- location;
- time;
- weather;
- visual style.

Never include:
- unseen enemies;
- secret rooms;
- unrevealed identities;
- future transformations;
- hidden magical effects.

Save result to:
- scene;
- gallery;
- visual history.

---

# 21. VIDEO GENERATION

Every scene has VIDEO.

Default:
- 10 seconds;
- current frame if available;
- otherwise generate a hidden keyframe;
- audio on.

Advanced:
- 5 sec atmosphere
- 10 sec action
- 15 sec cinematic
- custom

Video runs asynchronously.

Player may continue playing while generation is queued.

Status:
- Queued
- Generating
- Ready
- Failed / Retry

Provider and model:
Owner-selectable from supported integrations; fal is a candidate, not a required exclusive provider. See section 32.

Use references for:
- James
- recurring NPCs
- current location
- current frame
- important item

Never expose `FAL_KEY` in the browser.

---

# 22. LIBRARY VERSIONING

Documents must be editable.

Saving creates a new immutable version.

Only the applicable approved version is current canon in its declared scope. Existing campaign-wide owner corrections remain authoritative across restored timelines; ordinary documents remain outside historical save rollback. Future reusable source versions and Scenario Contracts are explicitly pinned; changing a pack alone does not change campaigns. A divergence is a branch-local assumption, not a global canon correction.

Statuses:
- CANON
- REFERENCE
- ARCHIVED

Priority:
1. explicit user correction;
2. current structured game state;
3. current canonical docs;
4. Campaign Brief;
5. Reference docs;
6. archived docs are excluded unless requested.

Preserve source conflicts and the owner's explicit source-priority policy. Distinguish source facts, source inferences, approved scenario assumptions and committed simulation facts, in addition to Memory's statement kinds. A whole corpus may describe a future that has not happened at the campaign anchor. Canon-at-entry, character knowledge and future source events must be filtered separately; no silent rewriting to reconcile contradictions.

---

# 23. SESSION MANAGEMENT

Buttons:
- New Session
- End Session

END SESSION automatically:
- closes current narrative point;
- creates player recap;
- creates private snapshot;
- creates resume point;
- updates campaign summary;
- optionally generates session cover.

No manual DM Ledger handling.

---

# 24. BACKUP / EXPORT

Because this is a personal project, portability matters more than scaling.

Allow:
- Full Campaign Backup
- Text-only Backup

A full export should contain:
- campaign metadata;
- docs + versions;
- public state;
- private DM state;
- characters;
- inventory;
- quests;
- NPC records;
- sessions;
- scene transcript;
- asset metadata;
- optionally actual media.

Import creates an independent restored campaign.

---

# 25. SETTINGS

APPLICATION PREFERENCES — GLOBAL
- interface language (English / Russian)
- reading size, suggested actions, and narration display preferences

CAMPAIGN SETTINGS — PER CAMPAIGN
- General: campaign language (independent of interface language) and campaign visual preferences
- dedicated **Rules & Play Style** tab: difficulty/rules, story structure, player role, world autonomy (section 33), and Checks & Dice (section 35)
- future compatible Progression and Challenge Scaling choices in that same **Rules & Play Style** section, as defined in campaign creation above
- mature tone

Future **Campaign → DM Style** provides a small understandable home for DM behavior preferences, integrating existing narrative settings/approved guidance without duplicating their sources of truth. Global **Main menu → DM Craft** is separate: reusable owner-approved education, not campaign settings or canon. See [the DM Craft product contract](#dm-craft-and-campaign-dm-style--future-product-design).

Difficulty is a campaign setting, never a global application preference. Each campaign's rules system determines which mechanical controls apply.

AI
- future global **AI Providers**: safe connection status, exact local setup instructions and explicit Test Connection; never show stored keys
- future campaign primary model and optional DM Reasoning, Narration, World Engine, What If, Canon Compiler and Memory overrides; unset tasks inherit, unavailable explicit choices pause without fallback
- verified per-model context accounting and bounded task budgets; do not ask the owner to manage token windows

Supported-provider onboarding must require only obtaining a key, adding its documented line to the running checkout's ignored `.env.local`, restarting through an explained simple workflow, then testing/selecting models in Settings. No TypeScript, HTTP or database editing. Credentials are application-level server secrets; campaigns/save exports contain only configuration IDs/options. No tracked `.env.example` exists today: future Model Runtime implementation must add a placeholder-only template with a narrow Git exception while retaining real secret-file exclusion. Test Connection is an explicit synthetic, bounded request with possible-charge disclosure; status-page rendering makes no provider calls. See [MODEL_RUNTIME_BRIEF.md](MODEL_RUNTIME_BRIEF.md) for status semantics, secret handling and future acceptance gates. None of this settings UI is implemented here.


TIME PRESSURE / DEADLINES
- campaign setting: **Off / Critical Only / Normal**
- **Off:** no quest, Adventure Hook or autonomous World Thread may fail, expire or irreversibly complete solely because in-world time passed; no hidden countdown may punish exploration/rest/travel; player-created immediate causal processes (for example a lit fuse, an active fire, an attack already underway) still resolve normally
- **Critical Only:** ordinary quests/hooks do not expire from time alone; only explicitly established scenario-critical deadlines may advance to irreversible completion, with fair player-known warning when the character should know
- **Normal:** ordinary bounded World Engine deadlines may operate under the normal knowledge/fair-warning rules
- changing this setting is prospective and never rewrites already committed Events; the setting must survive saves/timeline restores
- this setting is independent from World Autonomy: the world may remain reactive and actors may still respond to causal events even when deadline pressure is Off

MAP / EXPLORATION
- quest & POI marker visibility: **Off / Tracked Only / Standard / All Known**
- marker visibility is presentation only and may be changed at any time without changing canon, discovery state or quest state
- **Off** hides automatic quest/POI markers while preserving essential navigation such as current position and explicit manual pins/destination controls
- **Tracked Only** shows the currently tracked objective/destination and explicit manual pins
- **Standard** shows discovered/known quest objectives plus important discovered POIs/leads according to normal campaign presentation
- **All Known** shows every currently player-known mappable quest objective, POI, lead, rumor/location signal and other explicitly known adventure marker supported by the map
- no normal marker mode reveals DM-private, undiscovered or future information; spoiler/private inspection remains a separate protected concept

VISUAL
- campaign visual style
- frame aspect ratio
- video duration
- audio default

DATA
- export
- import
- open Saves for existing Save/Load/Timeline management (primary experience stays outside Settings)
- archive

ADVANCED
- DM Private Data
- debug log
- rebuild index

DM Private Data requires double spoiler confirmation.

This historical advanced-access idea is not authorization to expose secrets or build a bypass. Ordinary APIs, future World/What If and provider diagnostics retain current server-only privacy. Any future private-data inspection/export needs a separate explicit security design and owner authorization.

---

# 26. RECOMMENDED TECH STACK

Keep it boring.

Frontend + server:
- current stable Next.js
- TypeScript
- Tailwind CSS

Database:
- Supabase Postgres

Storage:
- Supabase Storage

Auth:
- Supabase Auth with one owner account

Hosting:
- Vercel

AI text:
- accepted initial implementation: OpenAI server-side API
- future: small provider adapters, model registry and task contracts from [MODEL_RUNTIME_BRIEF.md](MODEL_RUNTIME_BRIEF.md); provider/model selection is independent of world storage

Image:
- owner-selected supported image provider/model (OpenAI and fal are candidates)

Video:
- owner-selected supported video provider/model (fal is a candidate)

Keep provider integrations replaceable through small server-side adapters; see section 32.

Use current stable packages.
Do not introduce microservices.
Do not introduce Kubernetes.
Do not build a separate Python backend unless a real need appears.

---

# 27. SECURITY RULES

Mandatory:

- API keys only in server environment variables.
- real `.env*` secret files excluded from git; future placeholder-only `.env.example` may have a narrow explicit exception, never real values.
- never send Supabase service-role key to client.
- never send OpenAI key to client.
- never send fal key to client.
- never send any other provider key to client; no credentials duplicated in campaigns or exported model settings.
- never send DM private state in normal browser payloads.
- every campaign-owned row scoped by campaign and authorized owner; proposed reusable source/pack records owner-scoped with explicit versioned bindings, never implicit cross-campaign access.
- all destructive data actions require confirmation.
- create snapshot before restore/migration when practical.

---

# 28. DEVELOPMENT PHASES

## PHASE 0 — STATIC UI SHELL

Build from mockups with fake data.

Must include:
- Campaign Home
- Game
- Character + Inventory
- Library
- Journal/Evidence
- Map
- Sessions/Recap
- responsive mobile shell

No AI yet.

Success:
The user can click through the whole interface and say:
“Yes, this feels like the product.”

## PHASE 1 — PERSISTENT DATA

Add:
- Supabase
- campaigns
- documents
- versions
- sessions
- scenes
- character
- inventory
- quests
- locations
- NPCs
- assets metadata

Success:
Refresh browser and nothing disappears.

## PHASE 2 — TEXT DM

Add:
- server-side OpenAI call as the accepted initial provider (future adapters are separate scope)
- structured output
- dice tool
- public/private patches
- Game input
- state updates

Success:
Play 20–30 scenes and state remains coherent.

## PHASE 3 — MEMORY

Add:
- session summary
- snapshots
- document retrieval
- old-scene retrieval
- NPC memories
- canon conflict checks

Success:
Start a second session and the campaign continues correctly without manual copying.

## PHASE 3.5 — SAVES / TIMELINE FORKS

Owner-accepted exact-state manifests, preserved branches, epoch/lease fencing, source membership and safety-before-load behavior. See section 42 and the accepted contracts; extend this system instead of creating a second branch engine.

## PROPOSED PHASE 3.75 — WORLD ENGINE / WORLD LAB / SOURCE WORLDS

Architecture only, pending review and separate implementation authorization. Proposed order: A Model Runtime/onboarding and ruleset decoupling; B World Library/Packs and entry/scenario contracts; C bounded World Engine; D detached simulation branches and 1–3 model comparison; E Enter This World, canon-character takeover and full composition UX. DEVELOPMENT_PLAN defines dependencies and independent review gates. No media, deployment or real import is authorized by this proposal.

## PHASE 4 — FRAME

Add:
- visual references
- image generation
- spoiler-safe prompt builder
- gallery

Success:
The selected character stays recognizably consistent across several scenes, using approved Visual Bible/World Pack associations. James is one separately authorized future acceptance example.

## PHASE 5 — VIDEO

Add:
- selected provider asynchronous jobs
- owner-selected supported reference/image-to-video models
- progress jobs
- video gallery

Success:
VIDEO produces a coherent short clip while gameplay continues.

## PHASE 6 — POLISH

Add:
- evidence board drag/drop
- relationship UX
- What Do I Know?
- session cover
- search
- backups
- better mobile
- minor animation

---

# 29. DO NOT BUILD YET

Do not allow the coding agent to expand scope into:

- multiplayer
- voice
- tactical battle grid
- 3D character
- miniatures
- native iOS
- public accounts
- subscriptions
- payments
- social sharing
- marketplace
- elaborate admin panel
- complex microservice architecture
- custom vector database
- custom video infrastructure

Only the explicitly authorized milestone may be implemented. The section 44 world architecture is a planned product direction; it does not authorize future work merely because it would be useful.

---

# 30. FIRST CAMPAIGN ACCEPTANCE TEST

This is a **future real-data acceptance scenario**, requiring separate explicit owner authorization. No real campaign/private-data acceptance or deployment has occurred. Current development/evaluation uses synthetic records only. When later authorized, use the existing James & Jinn campaign as one compatibility test, not the universal world model.

Import:
- RPG Engine
- World Bible 1
- World Bible 2
- Character Bible
- Campaign Brief
- current private DM state

Verify:
- James is 32;
- private detective;
- Jinn is long-term partner;
- world lore loads;
- current inventory loads;
- DM secrets remain invisible.

Play 30 scenes.

Verify:
- HP persists;
- pact slots persist;
- special ammo decrements;
- inventory changes persist;
- NPC memory remains consistent;
- clues appear only after discovery;
- private clocks never leak;
- campaign documents influence future turns.

End session.

Start a new session.

Verify:
- exact resume point;
- correct public recap;
- private plans continue;
- no manual copy/paste.

Create a second unrelated campaign.

Verify:
- zero James/Jinn contamination.

---

# 31. DEFINITION OF “DONE ENOUGH”

This project does not need to become a spaceship.

The original RPG baseline aimed for:

1. Multiple campaigns work.
2. James campaign can be played comfortably.
3. Long-term state survives new sessions.
4. Canon docs can be edited.
5. Inventory/character UI is usable.
6. DM secrets stay hidden.
7. Frame generation works.
8. Video generation works.
9. Mobile is usable.
10. Backups exist.

These baseline goals do not replace the broader owner-requested direction in section 44. World creation, source grounding, diverse rulesets and provider-independent simulations are planned requirements with separately reviewable implementation slices; none is silently considered implemented or approved. Keep the private single-user architecture simple.


---

# 32. SELECTABLE MEDIA MODELS & PROMPT PREPARATION

Owner-approved preliminary requirement. Model/provider selection is required; the concrete integrations and model identifiers remain undecided. This is documentation only for now, not authorization to expand Phase 0. Implement FRAME in Phase 4 and VIDEO in Phase 5.

## Owner control

Campaign visual settings must provide independent default provider/model selections for FRAME and VIDEO. Each generation may override its campaign default without changing that default. Always allow manual selection from supported, configured models, not only fixed quality presets.

Optional convenience profiles: Fast / Quality / Key Scene. The owner assigns supported models and options to these profiles. These names are labels, not guaranteed rankings or prices. Never silently substitute a different model/provider, especially a more expensive one; explain unavailability and ask for a choice.

OpenAI, fal, and Magnific are candidates only. Magnific may serve a separate enhancement/upscaling step if its verified API supports it. Do not assume every provider supports both image and video generation. The owner's examples of model families or versions are not verified API identifiers. Before implementation, confirm available endpoints, capabilities, pricing, and owner choices.

## Generation pipeline

1. Build a campaign/scene-scoped, spoiler-safe visual brief using only player-visible scene facts and approved visual references.
2. A server-side text-model call expands the brief into a model-appropriate generation prompt: composition, lighting, atmosphere, and (for video) camera movement and motion. This is prompt preparation, not another story DM or a separate chat the owner must manage.
3. Offer optional prompt inspection/editing before submission; ordinary one-click generation uses the campaign default.
4. Validate supported parameters and submit to the explicitly selected generation provider/model.
5. Track the asynchronous job and attach its result to the originating campaign/scene and Gallery even if the player navigates elsewhere.

Expansion must preserve canonical appearance, equipment, participants, actions, and scene facts. It must not invent plot events, reveal unseen enemies or hidden identities, or access private DM context. Apply the same spoiler-safe boundary to reference assets and any automatically created video keyframe. Generated media and prompt edits do not automatically change story canon or approved references.

## Small, replaceable integration boundary

Use a simple model registry plus small server-side provider adapters, not a generic plugin platform or new backend. Separate prompt preparation from image/video submission and status retrieval. Record the selected provider/model, final prompt, supported parameters, reference asset IDs, job status, and resulting asset metadata per generation, scoped to campaign and scene. Keep credentials server-only.

Expose only options supported by the selected model: reference images, image-to-video, aspect ratio, resolution, duration, and audio. Earlier 10-second/audio-on defaults and 5/10/15-second options apply only when supported; otherwise show a supported choice explicitly. Do not claim an unsupported capability or silently discard references/options.

Display expected cost when a reliable estimate is available, otherwise label cost as unknown. Any fallback keyframe/enhancement step must be disclosed before paid submission. Avoid duplicate paid submissions on repeated clicks/retries; failures preserve gameplay and allow an explicit retry.

---

# 33. CAMPAIGN RULES & PLAY STYLE

Owner requirement: a dedicated **Rules & Play Style** tab within campaign settings, separate from global application preferences. These structured settings belong to one campaign (`campaign_id`), including when there is only one active preview campaign. Keep settings types, preset definitions, and state transitions separate from presentation components. Both English and Russian interfaces expose the same controls and state.

## Difficulty & Rules

Offer Easy / Medium / Hard / Custom. Start at **Medium**. An expandable Advanced section exposes independent enemy HP and damage multipliers, rerolls (disabled / limited / unlimited), allowance per session when limited, defeat consequences (narrative setbacks / lasting injuries / death possible), recovery (forgiving / standard / restrictive), and resource scarcity (abundant / standard / scarce).

Explicit Phase 0 preview values, centralized in `src/lib/campaign-settings.ts`:

| Preset | Enemy HP | Enemy damage | Rerolls | Allowance per session | Defeat | Recovery | Resources |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Easy | 0.75× | 0.75× | Unlimited | 3, inactive until limited | Narrative setbacks | Forgiving | Abundant |
| Medium | 1× | 1× | Limited | 2 | Lasting injuries | Standard | Standard |
| Hard | 1.5× | 1.25× | Disabled | 1, inactive until limited | Death possible | Restrictive | Scarce |
| Custom | Retain current values | Retain current values | Retain current value | Retain current value | Retain current value | Retain current value | Retain current value |

Selecting a preset replaces all applicable difficulty parameters; selecting Custom retains them. Editing any individual difficulty parameter selects Custom. Changing story structure, player role, world autonomy, or campaign language does not change difficulty. Preview multiplier controls allow 0.25–3× in 0.25 steps; a limited allowance is 1–20 per session. An inactive allowance is remembered when changing reroll mode but grants no rerolls.

Separate rest-supply costs also belong to difficulty: Easy short/long = 0/0, Medium = 0/1, Hard = 1/2 supply units per participating character. Custom preserves both. The preview allows 0–5 whole units for each cost; zero explicitly means no cost. Editing either selects Custom without changing Recovery, recipe requirements, or narrative/dice settings.

These numbers and bounds are provisional examples, not calibrated game balance or final rules. Phase 0 must clearly state that no setting affects gameplay. The James & Jinn sample uses an illustrative rules profile supporting both HP and numerical damage. HP controls are not universally applicable: rules capabilities independently determine HP and damage support. Unsupported controls are unavailable, and preset/manual edits must not silently apply unsupported mechanics. Future supported systems may need different mechanical controls; do not force HP semantics onto them.

## Story Structure

- **Story-led:** the DM actively supports a central narrative. The player decides how their character responds.
- **Balanced (default):** a central narrative coexists with player-led exploration.
- **Sandbox:** player goals drive play; there is no forced return to a main plot.

All modes preserve player agency. Story-led must never mean predetermined player choices.

## Player Role

- **One of many (default):** part of a larger world; significance can grow from choices.
- **Significant figure:** already holds an important place in the world.
- **Chosen one:** a special calling is part of the premise, without predetermining the player's response.

Player role is independent of difficulty and story structure. Choosing a role must not silently invent or rewrite established campaign canon.

## World Autonomy

**Deadline Pressure is a separate campaign preference.** World Autonomy controls how broadly important Actors/Threads may react; it must not silently re-enable quest timers. With Deadline Pressure Off, autonomous time passage cannot expire quests/hooks or complete irreversible player-relevant Threads solely due elapsed in-world time. Direct causal processes already initiated by play still resolve.

- **Low:** important NPCs and factions act mostly near the current story as time and events advance.
- **Moderate (default):** relevant goals can also progress off-screen as in-world time and meaningful events advance.
- **High:** important NPCs and factions pursue their goals more actively; consequences surface through relevant events.

In the accepted runtime autonomy is event-driven narrative guidance for the one DM. Proposed Phase 3.75 adds bounded code-selected World Threads and validated World Events, with separate simulation On/Off and explicit in-world triggers. High still does not imply a full-world simulator, wall-clock progression, continuous background processing or multiple AI agents. See [WORLD_ENGINE_BRIEF.md](WORLD_ENGINE_BRIEF.md) for deadlines, fair warning, capacity limits and failure-safe settlement.

## Authority and prospective application

Future Progression and Challenge Scaling use the [Rulesets contract](RULESETS_AND_DYNAMIC_UI_BRIEF.md#challenge-scaling-and-encounter-materialization). Difficulty, intrinsic World Threat, actual Party Power and Encounter Budget are distinct. Hybrid preserves threat hierarchy with bounded plausible adaptation before encounter mechanics are committed; it never silently matches every enemy to party level. Progression pacing offers meaningful opportunities and warnings without forced leveling or invented rewards. Level caps are profile policy, not engine limits; horizontal/social/epic growth can continue when supported. Established mechanics stay authoritative until a validated causal change.

- Campaign documents provide world and story context. Structured settings provide explicit mechanics and play-style choices; neither replaces the other.
- Mechanical rules such as supported HP/damage scaling, reroll limits, recovery costs, and resource consumption must eventually be enforced and validated by code, not merely requested in an AI prompt.
- Narrative settings guide the DM but never override established canon or player agency. Conflicts with campaign canon require clarification rather than silent rewriting; the canon priority list is not permission to retcon because a setting changed.
- Changes apply prospectively. They never retroactively rewrite scenes, rolls, outcomes, spent resources, or established facts. Later persistence/runtime work must retain the effective settings for historical outcomes.

## Phased implementation

- **Phase 0:** interactive, bilingual preview controls with shared in-memory state. Selections survive screen navigation; refresh may restore defaults. Test preset application, Custom transitions, independent narrative settings, and unsupported mechanics. No database migrations, API routes, persistence, authentication, AI integration, or simulation engine. Owner approval remains pending.
- **Phase 1, only when separately authorized:** persist and validate campaign-scoped structured settings and rules-system capabilities; keep them separate from global preferences and campaign documents. Preserve settings history/effective revisions for prospective application. No AI behavior in this phase.
- **Phase 2, only when separately authorized:** enforce supported mechanics in server code and integrate narrative guidance into the single DM runtime. Clarify canon conflicts before applying a conflicting change. Progress relevant NPC/faction goals at meaningful events or advances in in-world time, without background simulation. Apply settings only to future play.
- **Phase 3:** include effective settings and their history in snapshots/resume and continuity checks without reinterpreting past facts under new settings.

Future scope in this section is a requirement record, not authorization to begin those phases.

---

# 34. ITEM TRANSFORMATIONS THROUGH GAMEPLAY

## Purpose and scope

Support improvised item transformations through free-text gameplay actions in Phase 2, without requiring a dedicated crafting or alchemy interface. For example, a player may attempt to fasten a knife to a stick using suitable bindings to make an improvised spear. The DM assesses plausibility under campaign rules; a player's description alone does not guarantee success or create an item.

This is a future requirement, not authorization to expand Phase 0. Full recipe systems, crafting progression, alchemy screens, and disassembly are deferred and require separate approval.

## Resolution contract

- The single DM proposes a structured transformation as part of normal gameplay: campaign/action identifiers, source item identifiers and quantities, required tools, proposed output item data, and any required check, time, or resource costs.
- Distinguish consumed ingredients, embedded components, and retained tools. Embedded components become unavailable as separate usable items; tools remain unless an explicit applicable rule consumes or damages them. Do not automatically grant the ability to recover components later.
- The server validates the proposal against current campaign state: ownership or permission, accessible inventory, available quantities, applicable rules, output mechanics, and any required server-resolved checks. AI narration alone cannot mutate inventory or award arbitrary bonuses.
- Camp storage is not a source of usable ingredients or tools outside an active long-rest camp. Being able to send an item to camp does not grant permission to withdraw or use it remotely. Other containers follow their own access rules.
- Resolve a valid attempt's outcome before applying its inventory changes. A failed in-game attempt may consume materials or time only as allowed by the applicable rules; it does not automatically produce the requested item.
- Apply all changes for an outcome atomically: input quantities/components, output creation, and associated costs either commit together or do not commit. Technical failures must not leave partial inventory changes.
- Use an action identifier to make retries and duplicate submissions idempotent. Revalidate current state to prevent the same inputs from being used by overlapping actions.
- Persist provenance linking the campaign, action/session, source items and quantities, component disposition, and resulting item identifiers. Preserve history even when ingredients are consumed.
- Separate player-known output descriptions and mechanics from any DM-private properties. Keep hidden information server-side.

## Extension boundary

Use the same small, validated inventory operation for improvised assembly, cooking, and later approved transformations where appropriate. Future recipe selection or alchemy can supply proposals to this operation without replacing the inventory model. Do not build a general-purpose crafting framework now.

Phase 2 acceptance must cover successful transformation, failed checks with explicit costs, missing or inaccessible materials, retained tools, embedded components, cross-campaign rejection, atomic rollback, and retry/duplicate protection.

---

# 35. SKILL CHECKS & DICE PRESENTATION

This owner-requested consolidation supersedes earlier check-frequency and dice-presentation proposals only. Preserve all difficulty parameters, reroll policies, story structure, player role, autonomy, media-provider/model requirements, and English/Russian preferences. **Checks & Dice** belongs to each campaign's existing Rules & Play Style tab, not global application preferences.

## Independent settings

| Setting | Choices | Initial value |
| --- | --- | --- |
| Check Frequency | Narrative / Balanced / Full RPG | Balanced |
| Dice Presentation | Hidden / Key Rolls / All Player Rolls | Key Rolls |
| Interactive Dice | On / Off | On |
| Show DC | On / Off | Off |

- Narrative: rare checks at major uncertain turning points.
- Balanced: regular checks for meaningful uncertain actions.
- Full RPG: systematically consider appropriate checks during dialogue, investigation, perception, stealth, exploration, and physical actions. Never require rolls for trivial guaranteed actions, impossible actions, or repeated unchanged attempts.
- Frequency does not change difficulty, select Custom, or alter any narrative setting. Difficulty presets do not overwrite these preferences.
- Hidden resolves player-facing checks through narrative consequences without showing numbers or breakdowns. Key Rolls displays important player-facing rolls; All Player Rolls displays every player-facing roll. Unshown player-facing checks expose only the resulting narrative, with no roll notice.
- Interactive Dice On uses the interactive window for displayed player-facing rolls. Off resolves displayed rolls automatically and shows a compact result. Hidden disables the Interactive Dice control without discarding its saved value.
- DC means the target number required to succeed. Show DC only affects displayed player-facing checks whose target is permitted to be disclosed. Hidden disables this control while retaining its saved preference. An undisclosable target is never supplied to the client merely to be visually concealed.
- Private DM checks, private DCs, and hints that a private check occurred must never be sent or shown regardless of these preferences.

## Phase 0 demonstrator

Use the existing shared campaign state and bilingual dictionaries. Settings and demo selections remain in memory across navigation; refresh may reset them. No backend, API routes, authentication, database, AI, or gameplay engine.

Entry points: **Game → Dice preview** beneath the action input, and **Campaign Settings → Rules & Play Style → Checks & Dice → Open dice preview**. The window is labeled **Demo roll — no campaign effects**. An expandable **Demo setup** contains a small sample selector and important/non-important player-check selector so Key Rolls can be tested.

Fixed sample fixtures, not random dice or AI:

| Sample | Check | Dice / kept | Modifiers | Total | Public DC | Authored outcome |
| --- | --- | --- | --- | --- | --- | --- |
| A | Persuasion | 14 | Charisma +3, Proficiency +2 | 19 | 15 | Success |
| B | Investigation | 6 | Intelligence +1, Proficiency +2 | 9 | 13 | Failure |
| C | Stealth, advantage | 6, 16 / 16 | Dexterity +3, Proficiency +2 | 21 | 17 | Success |
| D | Perception, disadvantage | 17, 7 / 7 | Wisdom +2, Proficiency +2 | 11 | 14 | Failure |
| E | Insight | 12 | Wisdom +2, Proficiency +2 | 16 | Not supplied | Success |

Sample labels omit the outcome so the waiting window does not announce it before Roll. Sample E is a player-facing check with no target supplied, not a private DM check. The fixtures contain no private checks or private targets. Outcome values are authored examples, not universal natural-1/natural-20 skill-check rules.

Honor preferences: Hidden and non-important Key Rolls show only a sample narrative consequence; displayed non-interactive rolls immediately show compact results; eligible interactive rolls begin in a neutral waiting state. Show the skill, action, permitted DC, modifiers with explanations, and advantage/disadvantage when applicable. An original lightweight inline SVG faceted d20 and the prominent Roll button perform the same action. Use a short restrained tumble/rotation, soft bronze glow, and clean reveal, with muted failure styling and no confetti. Show individual dice, kept result, modifier breakdown, total, and success/failure after resolution, plus Continue/Close.

Use real HTML/CSS/SVG; no copied proprietary assets, generated screenshot UI, 3D engine, physics, or heavyweight animation dependency. The modal follows the existing charcoal/bronze, literary journal style.

Explicit **Replay sample animation** shows the same fixed sample and is not a gameplay reroll. It does not consume allowances or change character state, inventory, history, scenes, or canon. Closing during animation cancels it and leaves the sample unrevealed; reopening a completed sample can display its existing result. Switching samples/importance resets only the demonstration. No sample outcome is appended to gameplay.

## Accessibility and verification

Use an accessible native modal with title, focus containment/restoration, Escape handling, and keyboard-operable die and Roll button. Announce only the final result, not animation frames. Respect reduced motion with immediate reveal and no tumble. Guard repeated activation synchronously and disable controls during animation; cancel timers on close/unmount/sample switch. Check English/Russian at desktop, 390px and 320px, including controls inside the scrollable modal.

Regression coverage must include setting independence, all presentation/importance combinations, interaction On/Off, DC disclosure, fixed arithmetic and higher/lower selection, repeated activations, close/reopen cancellation, and both languages. Report unit/policy tests separately from browser checks and disclose unverified device/assistive-technology behavior.

## Future runtime contract and phases

- **Phase 0:** only the above fixed-fixture UI. Separate fixtures, presentation policy, and animation lifecycle from components; animation never chooses a result. Owner approval remains pending.
- **Phase 1, separately authorized:** persist campaign-scoped choices alongside other rules/play-style settings, including saved toggles while Hidden. Validate independent values and preserve effective revisions. Do not add real check resolution yet.
- **Phase 2, separately authorized:** the single AI DM proposes a structured check; server code validates rules-system compatibility, stakes, modifiers, visibility, DC disclosure, importance, and whether a roll is appropriate. Do not narrate the action's outcome until the check resolves. The server generates and durably records actual dice/results; the UI presents that result separately. Use stable check IDs and idempotent resolution so double-clicks, retries, navigation, and refresh cannot grant extra rolls. Rerolls require server authorization under the configured campaign policy. Keep private checks/targets entirely server-side, emitting no UI hints. Apply rules-system-specific natural-roll behavior only when explicitly supported. This future contract is documentation, not implementation authorization.


---

# 36. CONSOLIDATED PHASE 0 — NAVIGATION, POSSESSIONS & CAMP

This is the preserved adventure/house-profile requirement and historical preview scope. Its slot grid, camp-stash convenience rules, cooking benefits and rest resources are not universal physics for every future world. Phase 3.75 must retain accepted compatibility while making such mechanics/presentation conditional on a versioned ruleset, with explicit mappings for old saves. It does not rewrite the accepted preview.

This owner-approved requirement supersedes overlapping fragmented refinement proposals. Approval of the requirement is **not** approval of Phase 0 delivery. Preserve sections 32–35, the media-model plan, and existing working features. Implement only Phase 0 until the owner separately authorizes another phase.

## Shared records and visual inventory

Use small, reusable item-grid, detail, equipment-profile, conversation, transfer-preview, rest/camp, and recipe components. Items, entities, storage locations, conversations, and settings are campaign-scoped; ownership, current storage, and equipped entity/slot are distinct. Character, Party, Inventory, and Camp reference the same records. Never create a second copy of a character inventory.

Storage views: Player; Companions with selector; Camp / Shared Stash; Transport & Mounts only when applicable. Categories filter within storage; retain translated search. Each cell has a persistent icon, relevant quantity, restrained rarity, equipped/status indication, and an accessible name. No inventory Tetris or arbitrary capacity limits. Static artwork or silhouettes and compatible equipment slots replace any need for 3D. Characters with no established slots, including non-humanoid companions, must not acquire assumed humanoid equipment.

Transport is an entity, not a universal car panel. Show name, local image, compatible slots, cargo grid, and known location/availability. Small profiles can cover vehicle protection/utility/cargo fittings/compatible talisman, horse saddle/barding/saddlebags/charm, or explicitly configured anatomy- and rules-appropriate mount slots. Profiles are examples, not universal rules. James & Jinn retains Old Ford; do not invent a horse or dragon in canon. No transport simulator, breeding, mount combat, or capacity game.

Hover and keyboard focus show stored short descriptions; click/tap opens accessible details with larger icon, name/type/rarity, quantity/storage, known mechanics separated from flavor, and known acquisition/provenance. Ordinary flavor is concise; long legendary history may expand. Never infer mechanical powers from prose or reveal unknown properties/curses/identities. Added sample possessions, rarity, supplies, and descriptions are explicitly illustrative, not imported canon.

## Companion conversation

Party cards expose Talk and Inventory. Talk opens free text with portrait, name, player-known relationship, and optional input-populating starters: what happened, next move, or tell me about yourself. Only available companions can be approached; absent contacts cannot be summoned. Phase 0 uses authored labeled sample exchanges and literal temporary player messages, keyed by campaign and companion and shared between Party and Camp. No fabricated live AI reply or relationship change.

Future conversations use the **same primary DM runtime**, respecting personality, knowledge, history, goals, nearby listeners, and circumstances. Record them in campaign/session history. Trust may improve or worsen; affection is not guaranteed and repetition must not farm relationships. Never expose DM-private facts. Social checks obey section 35. Serialize state-changing turns across Game and companion conversations; do not create an agent per companion.

## Rest and focused Camp

Game has reachable Short Rest and Long Rest / Enter Camp actions. Short Rest is a compact dialog. Long Rest leads to a dedicated campaign-scoped Camp scene: warm central fire or setting-appropriate gathering point, available companion portraits/silhouettes, dark surroundings, restrained glow, readable controls, and original RPG-journal composition. Use local HTML/CSS/SVG/artwork; no paid art or 3D engine. At mobile widths arrange characters vertically with large labeled alternatives to hotspots.

Show participants, illustrative duration, expected recovery under the existing Recovery preference, separate short/long supply costs and cost basis, available sources, and known restrictions. Both costs support zero and select Custom when edited (section 33). Cost does not determine recovery. Actual recovery must later respect the chosen system/edition, class features, and explicit house rules; never promise universal full healing or spell-slot restoration.

Camp offers Talk, companion inventory, Camp Stash, Cook / Prepare a drink, rest review, explicit Complete Long Rest, and Leave Camp / Cancel. The sample fire is illustrative, not a new canon location; future settings may use inns, ships, or shelters. Phase 0 has explicit temporary active/closed camp state with quiet/unsafe sample eligibility scenarios. Direct navigation or a refresh starts closed; opening a rest dialog alone does not unlock the stash. Confirmations show simulated outcomes only. Never alter HP, spells, stock, time, or history.

Future authoritative flow: validate eligibility → enter active camp/rest stage → manage accessible items, talk, optionally cook → explicitly complete to apply recovery and advance time. Leaving grants no recovery. Completed transfers, conversations, and cooking must not be silently undone by leaving. Access closes on leave/completion; refresh/direct navigation cannot bypass authoritative eligibility. Hidden threats and interruption checks remain server-only. The UI demonstrator is not a rest engine.

## Owner-selected camp-stash convenience rule

Remote deposits are allowed at any time from an otherwise accessible, controllable inventory, with no physical delivery. This supersedes any blanket no-remote-deposits rule. Inspection is always allowed. Withdrawal, use, and equipment assignment from the stash require an active long-rest camp stage; short rest never unlocks them. Vehicle/mount cargo retains its own proximity/access restrictions. Long-rest supplies may be selected from the stash during active-camp confirmation. The rule also governs source ingredients/tools for section 34 transformations.

Phase 0 shows item/source/destination/quantity and access explanations without inventory mutation. Future transfers must validate campaign, ownership/permission, accessibility, quantity, and equipment compatibility; commit atomically and idempotently. Stash access is authoritative state, never permission granted solely by opening a dialog.

## Simple optional cooking and drinks

Use a small fixed campaign-appropriate recipe set, not crafting, survival simulation, or a minigame. James & Jinn preview examples: known edible meat → grilled meal; suitable ingredients → stew; coffee supplies + water → coffee. Coffee is not assumed in every world, and unfamiliar creatures are not assumed edible. Each recipe exposes ingredient quantities and accessible sources (including stash), servings, selected eligible recipients, flavor, one modest temporary benefit, Prepare, and insufficient-ingredients feedback. Talk over food/drink reuses the same conversation panel, with cuisine/creature/discovery starters, never another AI.

Future operations validate and consume ingredients and grant the prepared item/effect atomically. Explicit preparation-versus-consumption semantics prevent charging ingredients or servings twice. At most one meal and one drink benefit per character; repeated servings refresh/replace rather than stack. No permanent stat increases, no numbers inferred from generated flavor. Define activation and expiry: bonuses for the next adventure survive the rest that created them. Current illustrative effects are 2 temporary HP for a meal and +1 to one eligible skill check for coffee, activated after the creating rest and expiring at the next long rest (or first use for coffee). These numbers are provisional and are **not official D&D rules**; system-compatible effects require later validation.

Cooking remains optional. Zero rest cost does not make recipe ingredients free. Do not also count meal ingredients/servings as rest supplies unless a later explicit rule permits substitution. Phase 0 creates no food, consumes no ingredients, applies no effects, changes no dice, and generates no AI response.

## Optional item imagery — Phase 4 contract only

Items are awarded and usable immediately with fallback category icons. Generate image appears in item details, not every cell. Phase 0 explains that no provider is connected or charged; optional local illustration demo states alone expose Regenerate and Restore default icon.

Phase 4: optional asynchronous generation uses the owner-selected supported image model consistent with section 32, preparing prompts only from known appearance and safe references. Save assets against the intended item identity so ownership/storage/equipment transfers retain its image. Reuse generic icons for identical ordinary items; unique art must not replace unrelated items. Failure retains the current icon; regeneration preserves the prior asset. Navigation, hover, and refresh never start paid generation. Deduplicate jobs and disclose reliable cost estimates or explicitly unknown cost. Art neither changes mechanics nor establishes new canon. All credentials/providers stay server-side.

## Phase boundaries and verification

- **Phase 0:** bilingual interfaces, authored fixtures, temporary state only. No persistence, auth, APIs, real dice, provider calls, AI, migrations, or actual gameplay operations.
- **Phase 1, separately authorized:** persistent entities/settings/items/storage/equipment/conversation records and recipe/effect structures. Access-dependent actions remain unavailable until authoritative rules/state exist; persistence alone must not enable them.
- **Phase 2:** real single-DM conversations, checks, rest/camp lifecycle, resource consumption, cooking effects, and validated atomic/idempotent operations.
- **Phase 3:** long-term conversation/event memory and continuity.
- **Phase 4:** optional item imagery alongside the existing visual/media plan; preserve separate later VIDEO requirements.

Keep structured fixtures, preset definitions, and preview policy separate from presentation. English/Russian cover controls, prose, dialogs, errors, and accessibility labels; UI language stays independent from campaign story language. Test route identity/isolation, shared records/state, transfer rules, camp lifecycle, recipe availability/recipients, and dice/difficulty regressions. Use browser checks for desktop, 390px and 320px, keyboard/focus/dialog behavior, reduced motion, and bilingual click-through. Record automated versus browser verification honestly. Update DEV_STATUS and opening instructions; commit/push safely. Owner approval remains pending; do not begin Phase 1.

---

# 37. GAME COMBAT VIEW — PHASE 0 PREVIEW AND FUTURE CONTRACT

Combat is a presentation mode **inside Game**, never a separate top-level navigation tab. In Phase 0, Game → **Preview Combat** enters a visibly labeled synthetic encounter; Exit returns to the normal Game without changing the campaign. Later, actual encounter state controls entry/exit.

## Presentation and interaction

Preserve charcoal/bronze, literary typography and reusable UI patterns. Desktop places portrait initiative order and current round above party details (left), static encounter scene/target cards (center), public action history (right), and active-character controls below. Distinguish the active participant, inspected participant and selected target with explicit text as well as visual emphasis. Party inspection shows only public HP/conditions/details. Enemy health defaults to **Unhurt / Wounded / Near Death**, with Withdrawn for a defeated demo opponent. Public **Nearby / Far Away / In Cover** labels describe positioning; illustration coordinates never determine mechanical distance. No grid, draggable tokens or pathfinding.

Provide Attack, Abilities / Spells, Item, Move, Defend, End Turn and literal free-text Describe your action. Initial interaction is **direct party control**; defer automatic companion control and tactical-grid combat. A D&D-style demonstration displays action, bonus action, reaction and movement; keep resource labels/data separate so future systems need not inherit that budget.

Flow: select an available action → eligible target → explicit cost → confirm → permitted dice presentation → authored public result → isolated resources/health/history update. James and Jinn take individual turns, followed by one explicitly advanced scripted opponent turn and return to party control. No AI interprets free text: preserve it literally and attach a clearly labeled authored demo response without inferred cost/effect.

Mobile keeps scene/targets and controls primary, with accessible Party details and Combat history switches. Preserve English/Russian, keyboard focus/labels, native dialog containment/restoration, reduced motion, public condition badges and brief text feedback for damage/healing. Combat works with the illustration hidden or unavailable; never generate artwork per action.

## Isolation, dice and end states

The demo reducer and fixtures are separate from campaign state. It takes only read-only dice preferences; never writes campaign health, settings, rest, inventory or scenes. Reset/Exit/navigation/refresh discard the encounter. In-memory action IDs, target/cost validation and idempotent completion guard duplicate clicks. Closing an unfinished roll keeps the reserved action; reopening resumes the same fixed sample. Replaying a completed animation never applies damage or costs twice.

Reuse the existing dice dialog/presenter and Hidden / Key Rolls / All Player Rolls, Interactive Dice and Show DC policies. Hidden completes the mock action without opening a modal or exposing roll numbers/breakdowns in history. Interactive Off applies the authored result immediately with compact presentation. The combat sample attacks are important player-facing rolls. They contain **no target number**; Show DC cannot invent one. Existing generic skill-check samples still demonstrate disclosed DCs. Enemy turns supply authored public consequences only; no enemy or DM roll exists in the client payload or log.

**Check Frequency affects discretionary situational checks. It does not remove required attack rolls or saving throws from the selected combat rules.** All prototype data is invented and public. Future hidden state must remain server-side, not merely CSS-hidden or filtered from a browser-owned record.

A mock summary shows outcome, injuries/conditions, spent resources and available loot. No automatic healing or rest. Victory loot can be collected once only inside demo state; withdrawal grants none. Real encounters may end through **victory, escape, surrender, negotiation or objective completion**, not only combat defeat.

## Explicit phases

- **Phase 0 only:** isolated UI with fixed 14 + 4 = 18 player rolls, 6-damage strike, 8-damage invented lantern ability, 4-HP tonic, 10-ft cover move and authored guard/enemy response. These numbers are provisional UI examples, not official D&D mechanics or campaign canon. Enemy responses stop at 1 party HP; no defeat/death engine. No persistence, migrations, routes/API, authentication, AI, server dice, paid media, real combat rules or simulation engine.
- **Phase 1, separately authorized:** campaign-scoped persistence foundations for encounters/participants, turn order, public positioning, system-specific resources and pending-action identifiers/status. Separate public records from server-private encounter data. Persistence alone must not activate combat resolution.
- **Phase 2, separately authorized:** authoritative rules-system-aware action/target/cost validation, literal free-text proposals validated through the single DM runtime, server dice, reactions and real campaign consequences. Server-enforced atomic/idempotent resolution prevents duplicate spending/results on retries, navigation and reconnect. Preserve player agency/canon and authorized disclosure; enforce mechanics in code rather than prompts.

Test isolated lifecycle, valid targets/costs, repeated/stale confirmation/completion/turn events, presentation modes, no hidden checks/targets, literal proposals, summary/loot/reset and localization. Verify desktop/mobile and keyboard in a browser; record actual checks and limitations in DEV_STATUS. Implementation completion does not imply owner approval. **Stop for owner review; do not start Phase 1.**

---

# 38. CONTEXT BUDGET, MEMORY AND CONTINUITY CONTRACT

This section makes sections 15, 17, 18, 22 and 23 operational. It specifies future behavior, not a claim of implementation or perfect model recall. Supabase stores durable records; application code chooses authorized context. Do not send the entire campaign transcript indefinitely or depend on a provider conversation thread, prompt cache, chat memory, or a summary as the only copy of history.

## 38.1 Minimal architecture and phase boundaries

Use the existing application server and Supabase. One primary DM runtime remains responsible for play. Summarization is a bounded supporting task, not an autonomous agent or world simulator. Start with structured lookups and database text search; add semantic retrieval in the same storage system only when evaluated recall requires it. No separate vector service, graph database, or orchestration platform is required.

- Phase 1: durable campaign-scoped records, immutable document versions, ordered messages/scenes, visibility boundaries, state revisions and stable IDs. Reuse existing entities; these requirements do not authorize a new memory UI or an AI/indexing subsystem. Coordinate any foundation adjustments with the current lead integrator at a safe checkpoint.
- Phase 2: bounded server-side context assembly, current structured state, approved instructions, selected canonical excerpts, a validated/imported checkpoint and recent complete exchanges; budget checks, serialized state-changing turns and safe recovery. Read checkpoints without requiring automated summarization or historical semantic search. If relevant older material is unavailable, request clarification instead of pretending it was retrieved. Do not silently drop necessary history to continue indefinitely.
- Phase 3: automatic summaries/checkpoints, older-event retrieval, correction-driven invalidation, continuity evaluation and reliable resume. Implement the complete lifecycle below.
- Later public knowledge and media features must use the same visibility boundaries when separately authorized.
- Proposed Phase 3.75 extends the same Memory paths for source/pack provenance, entry-point knowledge, World Events and detached simulation manifests. No parallel memory service; owner-library authorization and exact campaign/timeline membership remain distinct.

Keep these boundaries in DEVELOPMENT_PLAN. Do not interrupt active Phase 1 workers or restart completed work merely to implement Phase 3 early.

## 38.2 Sources of truth and record identity

Maintain these logical categories using existing tables where practical:
1. Exact structured state: identity, relationships, quantities, ownership, time/location, commitments and pending actions; plus profile-specific resources, equipment, conditions, encounter/rest state (HP is one supported profile example, not a universal requirement).
2. Source history: committed player inputs, public narration, companion dialogue with known participants/listeners, validated outcomes and state changes, and separately stored private DM events.
3. Versioned documents: current canon, references, explicit corrections and approved DM guidance.
4. Derived memory: summaries, checkpoints, extracted facts and search indexes, always linked to source records and their versions.

Each campaign-owned record has campaign_id; relevant derived records also carry source IDs/version or source range, visibility, source state revision, schema/generator version, creation time and validity status. Use stable entity IDs, aliases and ordered event/turn identifiers; names and timestamps alone are not identity or ordering.

Exact game state is never reconstructed solely from prose summaries. Summarization cannot consume items, restore HP, advance time, kill/revive NPCs or complete quests. Such changes require the normal validated state operation. Preserve source history after summarization. A record's absence from the current prompt does not delete it.

Sections 22's authority order applies. Summaries and embeddings are derivative evidence and never outrank their sources. Distinguish:
- a confirmed event;
- a speaker's claim, lie or rumor;
- a player hypothesis;
- a pending intention;
- an unresolved question.

Keep attribution, negation, uncertainty, conditions and temporal scope. "The witness says X" does not become confirmed X. A plan is not a completed action. Silence does not mean an NPC forgot or an obligation was fulfilled.

## 38.3 Visibility and knowledge

Authorize campaign and owner before retrieval. Apply campaign, visibility, source-version and status filters in the data query, before ranking/limits; validate referenced records again before use. Privileged database credentials do not replace authorization.

Maintain separate public/player-known and DM-private source paths, derived summaries, indexes, caches and response serializers. A whole DM prompt must never be sent to the browser. Public recap, What Do I Know, public search and media briefs must be built from authorized public inputs, not a private-inclusive draft that is later cosmetically redacted. A private-derived artifact remains private unless specific facts are explicitly revealed through validated gameplay.

Model knowledge is not NPC knowledge. Record which participants witnessed or were told a fact when relevant; companion speech must not inherit another NPC's secrets or a private conversation automatically. Distinguish player-known facts from what a particular NPC knows.

For future source worlds, distinguish full Source Knowledge, Canon at Entry, Character Knowledge at Entry and Future Source Events. Apply world-time and positive-knowledge eligibility before ranking. A later source event is not current reality or an inevitable plan; model pretraining does not grant actor knowledge. World Engine actors and Lab comparisons use the same boundary. See section 44 for source-origin classifications and detached timeline extensions.

Do not expose private titles, snippets, citation IDs, scores, counts, job names or error payloads through ordinary UI. Context diagnostics may show neutral status/token totals, never private content. Full prompts and private model responses are excluded from ordinary logs and analytics.

## 38.4 Building one bounded request

Build context on the server from a consistent campaign state revision:
1. Trusted runtime instructions: security, tool permissions, output schema and rules enforcement.
2. Effective approved DM guidance and campaign settings.
3. Compact current state and continuity anchors: active entities, current scene/time/location, urgent unresolved obligations, encounter/rest state and pending checks/actions.
4. Valid checkpoint plus any exact committed events after its source watermark.
5. Selected current canonical excerpts and relevant older memories, with source identity and visibility.
6. Recent complete exchanges, preserving necessary dialogue and tool/check results.
7. Current player input.

Imported documents, quoted dialogue and retrieved text are data, not instructions granting access or tool authority. Approved guidance cannot override security, structured mechanics, player agency or established facts. The separate Chat with DM history does not become in-world events; only explicitly approved effective guidance belongs in gameplay context.

Budget configuration is per selected model:
- C = verified usable context limit.
- O = reserved maximum output, including any reasoning allowance counted by that provider/model.
- S = explicit safety margin; initial policy is 5% of C, rounded up, adjustable after measurement.
- Input budget B = C - O - S.
- Count the fully serialized input, tool schemas, message framing and attachments using supported accounting, not only narration characters.

Verify actual model accounting/limits against official provider documentation at implementation time. Store tokenizer/accounting version and measured usage. Do not hardcode a universal model limit. Use a documented conservative estimate if exact counting is unavailable; reject invalid budgets. Recalculate on model/settings changes and before every continuation after tool results.

Treat the last 10–20 scenes as a recency target, never a guarantee they fit. Preserve complete exchange/tool-result groups; do not cut halfway through an unresolved check or replace its recorded result with an invented one. Large documents and tool results must be selected/chunked, not blindly appended.

Mandatory context includes trusted boundaries, current action/input, relevant exact state, effective rules/guidance, pending action/check details, and facts necessary to avoid immediate contradiction. Optional context includes redundant old prose and tangential retrieved excerpts.

When over budget:
1. Deduplicate source spans and remove irrelevant/low-priority optional excerpts.
2. Replace older covered exchanges with a valid source-backed summary, retaining recent relevant dialogue and post-summary deltas.
3. Retrieve smaller targeted excerpts instead of entire documents, without losing essential qualifications.
4. Recount and retry assembly with a fixed bounded attempt limit.
5. If mandatory context still does not fit, do not call the model or mutate the world. Preserve input and offer a neutral actionable explanation: shorten input, narrow the requested task, or choose a supported larger-context model explicitly.

Never silently truncate player input, authorization instructions, required rules, pending outcomes or necessary state. Do not silently switch models or create unlimited summarization/retrieval loops. A provider context-limit error receives at most one smaller safe reassembly retry for that request; otherwise preserve the turn for retry.

## 38.5 Retrieval policy

Build retrieval candidates from current scene participants/location, active quests, named/aliased entities, the player's explicit question and unresolved obligations. Load exact relevant records first. Rank historical candidates by entity/event relevance, authority, temporal validity and significance, with recency as one factor. Old promises must not disappear merely because newer chatter exists.

Return a bounded, source-linked, deduplicated set within the remaining token budget. Initial tunable policy: at most 12 historical excerpts per assembly, with at most one query expansion if essential evidence is absent. These are limits, not a requirement to fill every slot. Allow explicit entity-linked facts to displace lower-value results.

Retrieval returns the latest applicable facts while retaining earlier versions as history where needed. Exclude archived/superseded material from current canon unless explicitly requested for historical comparison. Historical retrieval must still respect campaign and visibility permissions. Track valid-in-world time separately from when a record was saved.

Test English/Russian queries, aliases, renamed entities and paraphrases. Avoid copying full old conversations when a short sourced excerpt suffices. Search scores are not factual confidence.

The Phase 3.75 Decision Model evaluation is closed with Jev DO NOT ADOPT. A future newly authorized candidate could use the optional classification/reranking seam without replacing accepted retrieval or becoming a new memory service. Section 44.5.1 records the decision and future gates. Apply scope/knowledge validation before classification, retain mandatory evidence and uncertain candidates, and never treat a relevance label as canon or a reason to delete original sources.

On low recall or conflicting evidence, perform one bounded targeted lookup; if unresolved, ask a non-spoiling clarification or acknowledge uncertainty. Do not invent the missing promise, identity or outcome. A retrieval outage may degrade to current state/recent context only when the action does not require missing history; otherwise pause that action.

## 38.6 Summaries and checkpoints

Phase 3 triggers:
- END SESSION.
- Before accepting the next turn when selected context exceeds 80% of B and older unsummarized committed exchanges can safely be compacted.
- Recovery/rebuild after invalidation where needed.

Use configurable thresholds and source-watermark deduplication. No timer-only summarization loop and no summary job for every keystroke. Incremental jobs read previous valid summaries plus exact newly committed source ranges; periodically rebuild affected summaries from originals to avoid repeated summary-of-summary drift.

A checkpoint records:
- exact source/state watermark and version;
- current scene, time, location and participants;
- concise current situation and last committed action/outcome;
- unanswered question or next expected input;
- pending action/check identifiers/status;
- unresolved promises, clues and immediate goals;
- public/private separation and links to exact structured state;
- effective settings/guidance revision references.

Summaries retain consequential dialogue, decisions, relationship events, promises, discoveries and unresolved threads with source references. Every durable factual assertion must be traceable to supplied source records; separate atmospheric paraphrase from facts.

Generate public recaps using public sources only. Generate private continuity summaries separately. Validate schema, source existence, source campaign/visibility, numeric/state references and source coverage before activation. Reject unsupported material changes; do not repair them by inventing facts.

Schema validation cannot prove narrative accuracy. Add targeted contradiction checks against authoritative records and evaluate summaries on labeled continuity cases. On failure, keep the last valid summary plus uncovered source events. Do not mark a range covered until a valid replacement is committed.

Publish the new summary/checkpoint and its coverage watermark atomically. Keep version history and link superseded entries. Raw events remain available for reconstruction.

END SESSION must be idempotent. Record the gameplay boundary and exact resume metadata durably even if an AI recap job fails. A failed recap remains pending/retryable; it does not lose gameplay or falsely claim completion. Pending rolls/actions must be preserved for resume, never auto-resolved by ending a session.

## 38.7 Corrections, conflicts and stale memory

Explicit owner corrections are versioned and authoritative, but validate the operation and its scope. A style request is not a canon correction. Do not silently treat contradictory imported documents as owner corrections.

When source documents/state are corrected, archived or deleted, invalidate affected summaries, extracted facts, search entries and caches through source references. Exclude stale derivatives immediately, even if rebuilding is delayed. Visibility becoming more restrictive must revoke public derivative access before those artifacts can be served again.

If a checkpoint is invalid, rebuild from valid sources/current state or pause safely; never quietly resume from stale facts. Preserve an audit trail without exposing private facts.

Resolve conflicts by authority and applicable time. For equally authoritative contradictions, request clarification instead of silently retconning. Clarification itself must not reveal a private contradiction; use a neutral prompt or retain valid existing canon. Corrections do not undo unrelated completed events.

## 38.8 Turns, retries and resume

Serialize state-changing Game and companion turns per campaign. Associate each accepted action with a stable operation ID and expected state revision. Reject/reconcile stale updates rather than committing a model response generated from superseded state.

Persist accepted input and operation status before external calls. A timeout or closed browser must not lose the input, duplicate a committed turn, or roll again. Reload/reconnect retrieves the existing operation and recorded result.

Use a bounded lifecycle such as pending / awaiting-check / generating / committed / failed. Provider calls occur outside long database transactions; commit validated narration, state changes and event linkage atomically at the applicable operation boundary. Recorded rolls and already committed actions are reused on retry, never replayed as new mutations.

Do not publish unvalidated private-inclusive streams or claim uncommitted mechanical outcomes as final. Resume uses the last committed revision and pending operation, not a newly improvised reconstruction.

Derived summary/index jobs use source revisions. A stale job must not overwrite newer state or mark unseen events covered; discard or supersede it safely. Cache keys include campaign, visibility, relevant source/state/guidance revisions and model/accounting version; no cross-campaign cache reuse.

## 38.9 Failure handling and observability

Gameplay records must remain durable if summarization, indexing or model calls fail. Retry supporting jobs with bounded backoff and persistent status using the smallest adequate infrastructure. If sufficient valid context cannot be built, pause safely rather than fabricate continuity.

Record content-minimized diagnostics: operation ID, context budget/usage, selected source counts and revisions, summary coverage lag, retries, latency and failure category. No raw private text, secrets or full prompts. Owners see plain-language status, not internal DM details. Prompt caching is optional optimization, never durable memory.

Schema snapshots/checkpoints are not substitutes for backups. Preserve recovery source records and document how to restore/rebuild memory without changing canon. Full export/import UI remains in its separately authorized phase.

## 38.10 Acceptance and regression gates

Use synthetic campaigns only. Keep deterministic storage/security/budget tests separate from model-quality evaluations.

Required cases:
- At least two campaigns containing similarly named NPCs/items, with zero cross-campaign retrieval, cache or update leakage.
- Seed unique private markers; verify no disclosure in public search/recaps/media inputs/browser responses/errors/logs. Include NPC knowledge and quoted-instruction attacks.
- Structured resources/quantities remain exact over repeated summaries; consumed items stay consumed and embedded components stay unavailable. Old **Memory** checkpoints cannot restore them. An explicitly authorized Phase 3.5 save load is different: it restores exact saved state into a fork through validated manifests, never by trusting a summary.
- An old promise survives hundreds of distracting events; distinguish rumor from fact, intention from completion, negation, renamed entities, and corrected/retracted canon.
- Test English/Russian paraphrases and aliases.
- A fixture of at least 1,000 synthetic events across 20 sessions forces several compactions; final assembly remains within B without dropping mandatory context.
- Test a very long document, oversized player input, smaller-model switch, tool-result growth and provider context-limit rejection.
- Test failed/stale summary jobs, stale indexes, restrictive visibility changes, invalid sources and equally authoritative conflicts.
- Test double submission, two browser tabs, timeout after commit, reconnect during a roll, repeated END SESSION, and resume with pending actions; no duplicate mutation or reroll.
- Resume a new session at the exact last committed point, preserving participants, resources, unresolved decisions and operation status.

For retrieval evaluation, maintain at least 30 labeled scenarios with expected source facts, including old relevant evidence and irrelevant recent decoys. Initial acceptance target: at least 90% retrieval recall of labeled relevant evidence within the configured budget, and 100% inclusion of designated critical facts needed for the next action or an explicit safe pause. Source inclusion does not itself prove model use.

Evaluate at least 20 representative continuation/summary cases with a rubric for factual continuity, uncertainty, NPC knowledge, tone, player agency and spoiler safety. At least 90% must pass the overall rubric, with zero critical state contradictions or private disclosures in the evaluated suite. Report the model/configuration, sample size, failures, latency and token usage honestly. Passing finite tests is not a guarantee of perfect memory.

Do not conduct paid model evaluation without authorization and configured credentials. If only deterministic tests can run, report model-quality verification as blocked, not passed. No real campaign import until the relevant persistence, secrecy and continuity gates pass on synthetic data.

---

# 39. Owner-approved Phase 1 persistence boundary

Phase 0 is approved at `96b69dcd63d2fa015f5e75bcc5d632c41e04369e`. Later Phase 0 stop/approval-pending notes above are historical checkpoints superseded by this explicit approval. This checkpoint authorized Phase 1 only; the subsequent Phase 2 authorization is recorded in section 41. Deployment remains unauthorized.

Use Supabase Postgres/Auth for the private single owner. Verify the signed-in user on every server read/write, match the configured owner and database registry, enforce owner-only RLS, and prevent cross-campaign references. No public registration. Complete owner authentication and access checks before any separately authorized deployment. All credentials remain server-side; DM-private records reside in a separate unexposed schema, with no ordinary client accessor. Media providers/models remain owner-selectable in later phases.

Persist campaigns, separate global preferences, complete campaign settings, documents and immutable versions, generic characters/companions/NPCs/transport, shared inventory/storage/equipment, sessions/public scenes/resume state, quests, locations and asset metadata. Every campaign-owned record includes campaign_id. Manual corrections are explicit owner actions with the highest state authority; revision checks prevent silent overwrite. Stable request IDs and atomic operations prevent duplicate corrections on retry. Document restoration creates a new current version. Settings history applies prospectively and cannot rewrite existing scenes or established facts.

Preserve the approved visual language and bilingual UI. Persistent routes use actual campaign IDs and generic records without hardcoded James & Jinn dependencies; exercise two unrelated synthetic campaigns. The approved Phase 0 gameplay demonstrations remain isolated under `/preview`, with no persistence hooks. No persistence operation resolves combat, rolls dice, rests, cooks, consumes resources, transforms items, generates media or calls AI. Future gameplay record structures remain inert. Asset metadata does not imply uploading or generated media.

Verification must distinguish SQL tests with an auth stub from actual Supabase Auth/REST and application/browser cookie integration. Missing configuration is a blocker to acceptance, not proof of persistence. Never use a mock store as a hidden substitute for the persistent application. Preserve the approved checkpoint, commit migrations, inspect targets before applying them, and do not seed real campaign/private material or destructively reset an existing target.

# 40. Chat with DM and DM Guide

The Phase 1/2 contracts below describe existing foundations. The future DM Craft extension is additive design, not a claim that the new screens, controls or retrieval already exist.

## DM Craft and Campaign DM Style — future product design

**DM Craft = what my DM has learned. Campaign DM Style = how I want my DM to run this particular campaign.**

Application/main menu → **DM Craft** is owner-scoped and reusable across campaigns. Possible internal sections are Doctrine, Craft Library, Teach DM, Sources / Packs, Approved Examples and Evaluation. These can arrive progressively; the first implementation need not provide all sections. This destination is not campaign canon, Memory, DM-private state, a campaign setting, a second DM, an autonomous agent or direct fine-tuning. [RPG Design Doctrine](RPG_DESIGN_DOCTRINE.md#36-dm-craft--reusable-owner-approved-education) defines the compact Core Doctrine, relevant Craft Cards, approval/version history, sources, examples and Academy.

Selected Campaign → **DM Style** is campaign-scoped (`campaign_id`) and controls future conduct in that campaign. Prefer a small set of understandable controls plus natural-language feedback, not dozens of mandatory sliders. Directional examples include NPC Initiative and Companion Agency (Low / Normal / High), World Reactivity, Description Density, Dialogue Density, Dramatic Pace, Humor, Mystery, Combat Frequency, Romance, Fail-Forward Strength, Systemic Freedom emphasis, narrative tone and DM presence/conversational style. These are not a mandatory enumeration. Style cannot override authoritative mechanics, actor knowledge, committed consequences, explicit World Autonomy or Deadline Pressure policies.

Integrate existing campaign guidance/settings history: approved style revisions follow the existing timeline-specific effective settings/guide model. Saves pin their effective revisions; load/fork/switch restores the applicable style for future play while preserving immutable history and `campaign_id`. Session-only feedback still expires with its session. Global Craft versions remain owner-scoped outside campaign rollback; an old save cannot rewrite the owner's global library. Runtime provenance pins the versions used by historical/pending operations; see [runtime save and retry rules](MODEL_RUNTIME_BRIEF.md#dm-craft-context-and-authority--future-design). This is a future extension requiring compatible save readers, not a change to accepted manifests today.

Chat with DM uses the same `feedback()` boundary to propose reviewable changes with explicit scope:

- “Companions are too passive. Let them initiate conversations more often.” → propose **Companion Agency: Normal → High** for this campaign; the owner explicitly applies it.
- “Make this campaign more slow-burn and mysterious.” → propose Campaign DM Style or other appropriate campaign-scoped guidance, prospectively only.
- “I hate quests where there is only one intended solution in any of my campaigns.” → with explicit global teaching intent, propose a Global DM Craft Card; require explicit owner approval before activation.

Never silently promote campaign feedback into global doctrine. Ambiguous scope stays a proposal until the owner chooses it. Teach DM offers Approve / Edit / Reject without prompt, JSON or code editing. Only approved material is active; durable edits are versioned and reversible, and manual owner decisions take precedence over Craft. A guidance approval cannot create a world fact. The separate World Authoring extension below still requires its bounded validated mutation path; neither teaching nor style changes invoke it implicitly.

Implementation follows [progressive DM Craft slices](DEVELOPMENT_PLAN.md#progressive-dm-craft-slices-after-world-engine-foundations) after World Engine foundations begin. No fine-tuning, retrieval, runtime, database or UI work is implemented by this specification update.

**Mega DM v1 owner contract:** keep the one existing `DmProvider` and primary DM. Main menu → **DM Craft** shows the effective compact, versioned Core Doctrine and approved Long-Form Campaign Craft with their approval/version status in owner-readable form. Campaign → **DM Style** is a small, campaign-scoped, prospective, reversible preference layer alongside the existing versioned DM Guide; start with a bounded selection of Companion Agency/NPC Initiative, description/dialogue density, pace, mystery/humor, combat/romance emphasis, fail-forward strength and tone/DM presence, narrowing exact controls during implementation. Campaign → **Chat with DM / Чат с DM** remains the live out-of-game conversation with the same DM. These three surfaces have distinct scope. Style and teaching never override Canon, mechanics, secrecy, controlled-PC agency, World Autonomy or Deadline Pressure. A natural-language teaching request yields a scoped **Approve / Edit / Reject** proposal; only an explicitly approved immutable version takes effect, and campaign feedback never silently becomes global Craft.

The same DM receives authoritative state and properly authorized Canon/Memory, plus a small deterministic stage-relevant subset of approved Global Craft and the effective Campaign Style. `plan()` considers alternate approaches, durable goals/relationships and causal consequences; `narrate()` considers scene rhythm, voice, useful callbacks and presentation. `feedback()` proposes guidance only. Server validation and the existing commit path alone own gameplay state. Global Craft is not a World Pack, Memory fact, source of new capabilities or second learning agent. Preserve selected guidance/version provenance server-side without exposing private prompts or chain-of-thought. The [Doctrine](RPG_DESIGN_DOCTRINE.md#36-dm-craft--reusable-owner-approved-education) and [runtime brief](MODEL_RUNTIME_BRIEF.md#dm-craft-context-and-authority--future-design) define the bounded v1 detail and its permanent synthetic quality gate.

## Purpose and Phase 1 scope

Add a per-campaign **Chat with DM** navigation tab, translated **Чат с DM**. This is a separate out-of-game space for feedback about narration, tone, pacing, companion initiative and DM behavior. Keep Game's existing OOC control for brief remarks.

- Persist literal owner messages separately from gameplay transcripts and companion conversations. Messages survive navigation, refresh and sign-in. Show timestamps, saving/error states, and preserve text after failed saves. There are no fabricated DM replies or AI calls.
- Clearly display: **DM replies and application of these preferences arrive in Phase 2.**
- Provide an editable **DM Guide** using the existing documents and immutable version history. Explicit manual Save, inspect history, and restore an older version as a new current version. Keep a stable campaign-to-guide document link; it is a reference document, not established story canon. Sending a feedback message never changes the guide.
- Distinguish saved guidance from guidance actually applied by a runtime. Phase 1 has no live DM; saved guidance is not being applied yet.
- Scope all records, reads and writes to the authorized owner and selected campaign. This screen cannot advance game time, trigger checks, alter inventory/health/quests/relationships/canon, reveal DM-private state or provide spoiler access. Reuse the same authorization, revision and retry protections as other persistence operations.
- Verify message/guide persistence, restoration, campaign isolation, save-failure draft retention, and absence of gameplay mutations. Preserve English/Russian and desktop/mobile usability.

## Phase 2 contract

The **same primary DM runtime** supports a separate feedback mode. It can discuss preferences and propose concise guidance changes. The owner explicitly chooses **This session** or **Save for this campaign** before a proposal is approved. Approved guidance affects future narration only and cannot override authoritative mechanics, player agency, established canon or secrecy. Conflicts with canon require clarification, never silent rewriting.

Session guidance expires with its session; campaign guidance remains versioned. Ordinary gameplay receives effective approved guidance, not the entire feedback conversation. Campaign documents supply world/story context, structured settings supply explicit mechanics/play-style choices, and approved guidance supplies preferences within those boundaries. There is no second DM agent, simulation engine, automatic guide rewriting, or implemented feedback AI in Phase 1.

### Future World Authoring extension — after World Engine implementation

Chat with DM may later accept explicit owner authoring directions that intentionally change the **future opportunity space** without pretending the player character learned hidden facts. Examples: “this region feels empty; add more mysteries,” “give this city several grounded detective hooks,” “less random bandit combat, more social intrigue,” or “seed a few dangerous places I should not know the truth about yet.”

Treat this separately from ordinary tone/pacing guidance. A world-authoring request may create a bounded set of **latent DM-private Adventure Hooks / Points of Interest seeds** attached to an authorized region/location and future World Threads, but it does not directly reveal them, add player-visible quest journal entries, advance world time, force encounters or rewrite established canon. The owner may specify density, themes, danger, scale or exclusions in natural language; the runtime converts that into a small reviewable authoring operation. Hidden truth and unrevealed hooks remain private until ordinary in-world discovery makes an appropriate projection player-known.

Do not eagerly expand every seed into a complete quest, cast and dungeon. Persist enough identity/provenance to make a discovered or revisited hook stable, then elaborate details lazily when play reaches them. Explicit owner authoring may intentionally add new possibilities; normal DM feedback must never silently perform this mutation. This extension requires the World Engine authority/privacy rules and separate implementation authorization.

# 41. Authorized Phase 2 implementation boundary

Historical implemented/accepted scope: OpenAI below names the initial adapter. Section 44 proposes future provider independence without changing this accepted checkpoint or reopening its live-call authorization.

The owner approved Phase 1 at `a0c7a815b413251df45a961af8c77986975e546f`, recorded in `1a4fee6cc7e3827a51749e23fe1b00a7eee78b1a`, and separately authorized **Phase 2 — Text DM**. Earlier phase-stop statements are historical, not a revocation of this authorization. [PHASE2_CONTRACTS.md](PHASE2_CONTRACTS.md) defines the lead-approved shared lifecycle, structured output, dice, privacy, bounded context and development file ownership.

Implement one server-side OpenAI DM runtime, durable serialized/idempotent turns, real recorded server checks, validated atomic public/private consequences, supported rules/inventory/quest/encounter/rest/storage/transformation/companion mechanics, and explicit session/campaign DM-guidance approval. Preserve manual correction authority, existing records, bilingual UI and visual design. Reuse private storage without exposing it to ordinary database callers or browser/API payloads. Free text remains primary. Unsupported mechanics and unavailable essential context pause safely instead of being improvised as authoritative state.

Use synthetic campaigns only, including a 20–30 turn acceptance campaign. Integrated deterministic checks precede live OpenAI verification; record actual model, call count, usage/cost where available and failures separately. Credentials remain in ignored server environment files. Stop for owner setup when live credentials are required; never ask for a key in chat. No large paid evaluation without explicit approval. Do not claim deterministic model substitutes prove live quality.

At the Phase 2 checkpoint, Phase 3 automatic summaries and retrieval remained outside authorization; the later separate authorization is recorded in section 43. World simulation, media generation, deployment, real James & Jinn/private imports, voice, multiplayer and multi-agent gameplay remain unauthorized. Development workers are not gameplay agents. Owner acceptance is separate from implementation readiness.


# 42. Authorized Phase 3.5 — Save / Load / Timeline Fork

**Current acceptance:** implementation `8099e0cca1463f767476190c456d4f3947e7c84e` is owner-approved, recorded at `6db58b5e3d464e4a09604ce344424c4fa8ed763e`. The milestone's former readiness/stop wording below is historical. Section 44 authorizes documentation only and leaves accepted contracts/implementation unchanged. Future world families and concurrent inactive branches require versioned manifest compatibility and detached readers/commits; the current single active projection cannot be used concurrently by toggling its active timeline.

The owner accepted Phase 3 implementation `ca4499bc279d37eb52c0a36b0524eb19322071b0`, recorded at `96964964a7d5046ff34b6b6ae695ecf494885cc4`, and separately authorized Phase 3.5. Preserve those and all earlier accepted checkpoints. [PHASE3_5_BRIEF.md](PHASE3_5_BRIEF.md) remains the requirement record; [PHASE3_5_CONTRACTS.md](PHASE3_5_CONTRACTS.md) defines the inspected architecture, shared DTOs, ownership and acceptance gates. All three separate-worktree development workers acknowledged the committed contract before GO. The product retains one gameplay DM.

Saves reference exact immutable record versions, not generated summaries. The existing campaign tables are the active projection; a private immutable row-version vault and manifest preserve save points and timeline heads without copying an entire database per save. Load atomically preserves the current head and safety save, forks the selected history, restores exact mechanics/settings/guide/pending dice and memory membership, and advances a monotonic timeline epoch. Switch restores a preserved head. Ancestry includes only versions in the fork manifest, never unrestricted later parent history. Old leases/jobs and stale browser writes fail closed. Public DTOs disclose only owner-visible labels and status; private snapshot contents, counts, plans and knowledge remain server-only.

Manual and quick saves use stable idempotent command IDs; replacing Quick Save changes its pointer, not history. Default session-boundary autosaves retain 15 visible slots per timeline, configurable 10–20 or off; optional committed gameplay-turn boundaries exclude feedback/OOC. Referenced historical records are never destroyed to enforce the visible retention bound. Save/load/switch are deterministic and never generate narration or reroll recorded checks. Explicit emergency recovery can bypass an owner-selected soft load policy, never authorization or consistency checks.

Corrections have typed scope. Ordinary canon/reference document corrections are campaign-wide and invalidate/re-index affected memory before an old head can be served; branch state/scene corrections and effective guide/settings edits remain timeline-specific. Original source versions survive both. Settings and guide histories remain immutable while restored effective versions control future play. A new future action can roll once under a new operation ID; an inherited pending check resumes its original recorded result. Tests must cover the hard abandoned-future scenario, multi-fork long history, exact restoration, privacy, two-tab concurrency and failure recovery.

Saves / Сохранения is a first-class inside-campaign navigation entry. Desktop order: Library → Gallery → Sessions → Saves → Campaign Settings. The dedicated screen has Save Games / Сохранения and Timelines / Временные линии tabs; Quick Save, Manual Saves and Autosaves belong in Save Games. Timelines shows current and preserved branches simply, without a node graph. Mobile uses More, not another permanent bottom item. Settings is not the primary save/load experience. A Game overflow Quick Save shortcut is optional. No Saves behavior was part of accepted Phase 3. Phase 3.5 stops at READY FOR OWNER ACCEPTANCE after integrated deterministic, populated local Supabase/Auth/privacy and bilingual desktop/mobile browser gates. No World Engine, simulation, Phase 4/media, deployment or real campaign/private import is authorized.

# 43. Authorized Phase 3 — Long-Term Memory

Historical accepted scope: implementation `ca4499bc279d37eb52c0a36b0524eb19322071b0`, acceptance `96964964a7d5046ff34b6b6ae695ecf494885cc4`. The old evaluation envelope and phase-stop instructions below do not authorize fresh model calls in this documentation pass. Phase 3.5 separately added exact save rollback/forks; Memory checkpoints remain derived evidence, not rollback commands.

The owner accepted Phase 2 implementation `24fcd405b65b7ddd281837e491f1975e1fe3a765`, recorded at `ea35b71ad6c95cf63ab40a1a33db4a92041052fc`, then separately authorized Phase 3 and its bounded synthetic live evaluation. Preserve both checkpoints. [PHASE3_CONTRACTS.md](PHASE3_CONTRACTS.md) defines shared lifecycle and development ownership; §38 remains the memory/continuity acceptance contract.

Keep one gameplay DM. Supporting summaries select complete original source spans through strict structured output; the server validates selections and renders original wording, retaining attribution, negation and uncertainty. Public recaps use public originals; private continuity has separate storage/jobs and never enters public narration or companion context. Exact current records, not a digest or old checkpoint, determine resources and mechanics. Immutable checkpoints are audit/resume references, never rollback commands.

Use authorized PostgreSQL text/alias retrieval first, bounded source-linked excerpts and positive witness/participant knowledge. Current exact state stays outside the historical excerpt allowance. Relevant unresolved evidence is required; unrelated obligations cannot consume every context slot. Corrections, supersession and restrictive visibility invalidate derivative access before rebuilding. Raw records and prior immutable summary/checkpoint versions remain available for audit.

END SESSION records the boundary before generation; pending operations and recorded dice remain unchanged. Explicit Continue resumes that same operation or starts exactly one next session after it is terminal. Recap failure does not discard progress. Work runs in bounded batches on explicit lifecycle triggers, with ordered coverage, lease fencing and fresh-revision validation. An explicit retry starts a fresh bounded attempt window; repeating its command ID cannot reset an active lease or duplicate work. There is no timer-driven generation, new backend, provider conversation memory, automatic model switch or vector service.

Verification uses synthetic records only and separates deterministic/storage tests, labeled retrieval recall, live model rubric review and real browser checks. The authorized initial live envelope is at most 48 generation requests and approximately $15 conservatively estimated usage. Report actual failures and limitations; passing finite samples does not guarantee perfect memory. Stop at PHASE 3 READY FOR OWNER ACCEPTANCE only after all gates pass. No self-approval, Phase 3.5 implementation, Phase 4, deployment or real campaign/private import.

---

# 44. PROPOSED PHASE 3.75 — WORLD ENGINE / WORLD LAB / SOURCE WORLDS

**World architecture implementation remains separately gated. The Model Runtime baseline and Decision Model disposition are now frozen by the owner; broader A–E implementation is not approved by that decision.** The product requirements in this section broaden the original RPG direction without pretending that the accepted OpenAI/d20 implementation has already been generalized. Do not begin any sub-phase, change contracts/migrations, make model calls, deploy, generate media or import real campaign/private data on the authority of this design pass.

## 44.1 Connected architecture and reuse

| Design brief | Future responsibility | Accepted foundation / required extension |
| --- | --- | --- |
| [World Engine](WORLD_ENGINE_BRIEF.md) | Stable Actor references → persistent Threads → immutable validated Events; bounded causal world progression | Extend durable turn settlement, private state and Memory; add versioned world manifest families |
| [World Lab / What If](WORLD_LAB_WHAT_IF_BRIEF.md) | Non-canon divergence, coherent checkpoints, 1–3 independent model runs, comparison and Enter This World | Reuse existing timeline IDs/vault/manifests; add detached reads/branch-head commits and per-run fencing without toggling live projection |
| [World Library / World Packs](WORLD_LIBRARY_AND_WORLD_PACKS_BRIEF.md) | Original sources, evidence-backed reusable worlds, source conflicts, scratch worlds, entry anchors, composition and approved visuals | Reuse immutable versions, source references and correction authority; add owner-scoped packs and authorized campaign bindings |
| [Rulesets / Dynamic UI](RULESETS_AND_DYNAMIC_UI_BRIEF.md) | Full Ruleset / World Logic / Custom; stable identity with optional mechanics and bounded component-driven sheets/inventory | Retain house-profile behavior, introduce versioned profile adapters/mappings and preserve old saves |
| [Model Runtime](MODEL_RUNTIME_BRIEF.md) | Server adapters, verified model registry, task contracts, explicit selection and provenance; nontechnical onboarding | Extend existing DmProvider/SummaryProvider seams; current OpenAI-only configuration remains until separately authorized refactoring |

All remain modules within the existing Next.js server and Supabase/Postgres/Storage/Auth architecture. No second backend, autonomous agent swarm, general low-code platform, graph database or external vector service. Natural-language authoring produces short reviewable contracts; validated structured state is authoritative; narration presents it. One chosen primary DM configuration handles normal gameplay. The owner values quality over small token savings, with finite workloads and explicit expensive operations.

## 44.2 World progression and privacy

**Rumors are epistemic claims, not facts.** Store/source them as what an Actor heard or believes until corroborated/refuted; a rumor marker never proves its contents. Strategic/holding management should reuse World Actors/Threads/Events, support delegation and optional abstraction, and avoid a separate mandatory kingdom/colony simulation. Character-known urgency must be communicated fairly without exposing DM-private clocks.

Character perspective and in-world influence follow [POV & World Leverage](POV_AND_WORLD_LEVERAGE.md). Narrative **Player Role** does not grant authority. The controlled Actor's actual knowledge, capabilities, institutional authority, command scope, jurisdiction, resources and access constrain large-scale actions. High status never implies omniscience; low status never prevents locally important or emergent influence. In-character authority is never equivalent to owner-side World Authoring.

Future World Engine and primary DM behavior must follow the player-agency principles in [RPG Design Doctrine](RPG_DESIGN_DOCTRINE.md). In particular: design problems rather than single authored solutions; preserve choice→consequence→recovery; use fail-forward where appropriate; combine micro-reactivity with durable macro consequences; keep NPC/companion identity stable; and prefer campaign resilience after unexpected player action over protecting authored content.

**Selective simulation is required.** Do not simulate a subsystem merely because AI makes it possible. Prefer deeper structured state only when it creates meaningful player choices, durable consequences or reusable affordances; otherwise abstract through narration/coarse state. [Systemic procedural references](SYSTEMIC_WORLD_REFERENCES.md) record supporting lessons from Terra Randoma and Approaching Infinity. World/region/town/local presentations may use different gameified scales while one authoritative Location/state graph preserves meaning.

Only meaningful in-world actions/time advances and causal events trigger evaluation. Code filters due threads, prerequisites, control and already-applied events before an optional bounded resolver request. Proposed Low/Moderate/High ceilings are 3/8/12 threads and 8/16/24 actors, at most eight events and normally zero or one resolver call per segment; these are reviewable operational limits, not established game balance. Capacity must pause rather than omit mandatory consequences. Large skips use ordered causal boundaries, not hourly loops or unlimited hidden continuation.

Background consequences may complete; major interactable catastrophes require recorded warning/opportunity under Surface Before Complete; established Hard Deadlines can genuinely occur. **When Deadline Pressure is Off, this general deadline behavior is suppressed for quests, Adventure Hooks and autonomous Threads: elapsed in-world time alone cannot fail/expire them or trigger irreversible completion.** Critical Only allows only explicitly established scenario-critical deadlines. Normal uses the full policy. Hidden deadlines cannot bypass a declared fairness policy. Wall-clock time, closed apps, provider tests and Chat with DM never advance the world. Future Live World shows only player-known developments, On/Off and autonomy. No secret threads, private counts or raw resolver output.

The resolver proposes; code validates against rules, agency, chronology and visibility. Extend the pending turn with staged world settlement; failures preserve input/dice and commit no partial player/world outcome. Final state, public narration and source-linked events commit atomically behind existing authorization and fresh timeline fences. Reuse public/private Memory and positive actor knowledge; do not let privileged resolver context become everyone's knowledge.

## 44.3 Source continuity, composition and visuals

Preserve originals and exact source-version locators. World Packs contain structured entities/relationships/history/geography/rules, explicit contradictions, coverage gaps and approved asset associations. Compiler passes are bounded, resumable and auditable. Source Facts, Source Inferences, Scenario Assumptions and Simulation Facts remain distinct; this origin classification supplements rather than replaces existing Memory statement kinds.

Source Knowledge, Canon at Entry, Character Knowledge at Entry and Future Source Events are distinct projections. Existing Canon Character entry derives a snapshot at an explicit date/age/chapter/event with no automatic knowledge of later source events. Canon before entry is history; after entry, player choices and world outcomes may diverge. Model pretraining cannot be guaranteed erased; future evaluations must disclose that limit.

Scenario Composition supports literal crossover and native adaptation with ingredient provenance, identity mappings, assumptions and pinned source priorities. A Divergence Contract records base, change, start, assumptions and constraints. Neither can drift silently mid-simulation. Full composition UX can arrive in E, but minimum contracts and entry cutoff validation are prerequisites for D.

Owner-provided/approved images bind versioned appearance variants to entities, locations and objects; for example an uploaded adaptation's character appearance. Preserve provenance, approval, temporal/visibility restrictions and authoring versus player knowledge. Reuse Visual Bible/Storage for later FRAME/VIDEO grounding. No unrestricted scraping, image generation or current media implementation is implied.

## 44.4 Exact simulations and playable entry

Lab simulations are NON-CANON until explicitly entered. Runs share one approved exact manifest plus pinned source/contract/guidance/profile input versions; each independently advances its own head and provenance. Current active-projection RPCs are insufficient: implement detached manifest access and compare-and-swap head updates under per-run lease/branch revision fencing before parallelism. Preserve the existing active epoch for live activation. Keep old version-1 manifests loadable through versioned family mappings; never expand a fixed allowlist and silently invalidate accepted saves.

Compare shared outcomes and divergences at comparable world times, with clear failed/incomplete runs and no model-winner claim. Fork any coherent simulation checkpoint to continue with other explicitly selected models. No automatic fallback; a changed model has an explicit provenance boundary. Global corrections invalidate affected runs, while local divergence assumptions do not retcon live canon.

Enter This World validates an exact checkpoint, selected existing/simulated/current/new PC and chosen profile, creates a playable child and activates it through existing safety/fork machinery. Preserve original and simulation history, public/private knowledge, provenance and pending-result semantics. Existing-entity takeover changes branch-local control, not identity; autonomous decisions stop for that PC. Missing playable facts require approved supplements, not reconstruction from prose or invented past. Ruleset choice governs future mechanics without rewriting world history.

## 44.5 Model onboarding, selection and authority

The supported-provider flow is key obtained → documented line in the running checkout's `.env.local` → explained restart → Settings → AI Providers → explicit Test Connection → global/campaign model choice. Future implementation supplies a placeholder-only example and exact nontechnical local instructions; never ask for a key in chat or expose stored values to the browser. App-level credentials are referenced server-side; campaign policies contain safe provider/model IDs and supported options only.

Configured and tested/usable status are distinct. No provider request on status-page load. A Test Connection request uses synthetic bounded input, discloses potential cost and returns sanitized status without touching gameplay. Adding an unsupported adapter is development work; routine connection/selection for supported adapters requires no TypeScript, request code or database editing.

Tasks inherit the campaign primary unless explicitly overridden; global defaults apply only when unset. Resolve and pin execution profiles before requests. An unavailable explicit choice pauses rather than silently falling back. Record provider, requested/actual model or unknown, relevant options, task/prompt/contract versions, source/checkpoint identity and time, without chain-of-thought or secret payloads. Safe model reporting and provider budgets require verified capabilities during later implementation.

### 44.5.1 Optional Decision Model layer

Design an optional vendor-neutral classification capability within [Model Runtime](MODEL_RUNTIME_BRIEF.md#optional-decision-model-capability--design-only), **disabled by default and never a required dependency or replacement for the primary reasoning model**. The conceptual flow is authoritative Postgres state → deterministic eligibility filtering → optional Decision Model filtering/ranking → frontier reasoning when needed → server validation → authoritative commit. Candidate uses: Thread/Actor relevance, Canon Compiler passages, retrieval/Memory candidate selection and parallel-simulation similarity/divergence classification.

The conceptual `classify(inputs, labels, instructions?)` boundary returns validated candidate IDs, selected labels, confidence/equivalent uncertainty and per-label scores where supported, plus provider/model/input/contract provenance. Missing or uncalibrated scores are not certainty. Relevant and uncertain candidates pass through; only sufficiently confident irrelevant optional candidates may be pruned under an evaluated policy. Mandatory deadlines, warning/agency obligations and necessary evidence bypass pruning. Capacity overflow segments or pauses; no hidden top-k loss. Authorization, visibility and knowledge checks still fail closed before and after classification. Failure bypasses the optimization without changing the explicitly selected strong model.

A Decision Model cannot create World Events, kill/move/change entities, modify inventory/player state, alter timelines, decide canon, bypass knowledge validation, impose irreversible consequences or write directly to persistent state. Classification is routing metadata, not an authoritative patch or factual Memory record. Existing server validation/commit remains the only mutation path.

The [final Phase 3.75 owner decision](PHASE375_ARCHITECTURE_DECISION.md) is **Jev DO NOT ADOPT** for Thread relevance, Actor relevance, Canon/source classification and parallel outcome comparison. Its incomplete benchmark is closed, and it remains disabled for production/real/private data. classifier.dev, OpenRouter, GLiNER and Vercel Workflows are deferred and must not be contacted or integrated in this task. Any external proxy use needs separate explicit approval and data/retention/licensing review; sensitive source libraries and campaign/private state are not authorized inputs by default. A direct adapter, alternative implementation or no classifier remains possible. No call, provider dependency or integration is made in this pass.

No further Phase 3.75 live requests, diagnostics, retries, smoke or benchmark attempts. A future different, explicitly authorized evaluation may reuse the following criteria on synthetic Thread relevance, Actor relevance, source/passages, simulation comparison, English/Russian and adversarial/ambiguous fixtures. Compare deterministic filtering only, candidate Decision Model and frontier baseline against reviewed labels. Measure recall/false negatives, precision, uncertainty/abstention/calibration, latency, expensive-model context avoided and cost where available. Prioritize extremely high recall; define task-specific thresholds and critical fixtures before held-out evaluation. Finite zero misses do not prove perfect recall. Adopt only with meaningful measured benefit and a separate explicit go/no-go decision; otherwise keep disabled. These retained criteria neither reopen Jev nor authorize another spike.

## 44.6 Review boundary

DEVELOPMENT_PLAN proposes independently reviewable A–E slices and lists owner decisions. Every future slice requires explicit scope authorization, coordinated contracts, compatibility/migration planning, synthetic regression/privacy/failure checks and separately authorized live quality evaluation. The brief acceptance lists are future tests, not results from this pass. Physical iPhone/Safari and historical optional Phase 1 conflict-rebase confirmation remain unverified; finite synthetic/model evaluations guarantee neither perfect memory nor universal branching/recovery. No hosted deployment or real campaign/private-data acceptance has occurred. Stop after this documentation commit for owner review.


# 45. SPATIAL RUNTIME / EXPLORE — final architecture, implementation pending

**Phase 3.8B: ARCHITECTURE / CAPABILITY EVIDENCE COMPLETE WITH DOCUMENTED LIMITATIONS.** [Spatial Runtime](PHASE38_SPATIAL_RUNTIME.md) preserves the provider-neutral contracts; [final decisions and immutable evidence references](PHASE38B_ARCHITECTURE_FREEZE.md) close the capability experiment. The [dated capability matrix](PHASE38_PROVIDER_CAPABILITIES.md) and [original 3.8B proposal](PHASE38B_LIVE_PROTOCOL.md) are historical records, not current execution instructions. Production EXPLORE remains asset-first after Phase 4 FRAME / Visual Bible and separate implementation authorization. This integration changes documentation only.

## 45.1 Authority and optional presentation

Generated space is a versioned projection of canonical Location state, never its authority. Providers cannot change inventory, canon, quests, authoritative entities/NPCs/relationships/time/discoveries or saves/timelines, or expose private facts. Player interaction emits a typed reference to existing campaign/location/entity and binding versions; server authorization/revision/knowledge/rules checks and the normal DM/mechanics commit path resolve it before presentation updates. A generated object does not create a canonical entity. Camera motion and streaming video are not game progression.

Text remains permanently first-class and spatial-independent. 2D Live is the primary planned visual gameplay layer, optional over the same authoritative state; EXPLORE is optional and progressive. Spatial providers never gate World Engine, Rulesets, DM, Memory, Saves/Timelines or progression. EXPLORE failure never blocks text, DM, campaign load, Saves, FRAME or VIDEO. Use existing Next.js/Supabase/Storage, small adapters and bounded durable jobs; no new authoritative database, microservices, orchestration infrastructure or game-engine server.

## 45.2 Capabilities, artifacts and bindings

Keep create/reconstruct/extend/hosted world, splat, mesh/scene, panorama, realtime stream, object, parts, articulation, topology and PBR capabilities distinct and optional. Do not force one universal format. Stable app Location/entity IDs are independent of provider IDs. Immutable artifact versions pin source scene/location/reference versions, campaign/timeline/knowledge scope, provider/model requested and safely reported actual or null, job/world IDs, formats/assets, non-secret config, provenance, review/status and cost/usage where available.

Versioned Spatial Bindings (Interaction Bindings, the same concept rather than a parallel subsystem) map structurally verified addressable provider nodes/parts/anchors to stable canonical entities/actions and an exact artifact version. Provider IDs are never canonical RPG entity IDs. Regeneration or provider change requires verification/rebinding without changing RPG identity. Existing save/timeline membership, revision and activation-epoch fencing reject stale selection/callbacks; future compatible manifest versions may pin artifact/binding references. Old saves remain loadable without spatial media. No parallel save system or historical retcon. Current state wins when items are removed, doors change, locations are corrected or more areas are discovered; stale unsafe geometry is withheld until safely updated.

## 45.3 Public knowledge and capability evidence

V1 spatial inputs and all browser-delivered geometry use only player-discovered information. Exclude hidden rooms/enemies/identities/objects, future transformations and private plans before provider submission; never generate a private-inclusive world and visually hide its secrets. Review/quarantine output, since models can invent geometry. If unseen regions cannot safely be excluded, withhold the artifact. Future server-private generation needs its own authorization, storage/access and provider privacy gates.

The closed research covered Marble/current World API and Atlas successor, HY-World 2.x, WorldPlay, fal Hunyuan World, Hunyuan3D and Seed3D, with a later stream capability left optional. Documentation claims remain distinct from measured evidence. Room/courtyard observations are sufficient for the architecture decision only: no production rendering, visual quality, navigation, canonical metric correctness or production EXPLORE acceptance. Fal-world is accepted as `STRUCTURALLY_USABLE_PLY_WORLD_CANDIDATE`; future implementation must support observed PLY or a validated offline conversion path, never DRC exclusively. Requested DRC was absent; visual/navigation remain unverified and no retry is planned.

## 45.4 Later diagnostics and evaluation

Owner Diagnostics / System Inspector is late-stage sanitized operational visibility, not a spoiler or key viewer. AutoEval / autoresearch is a future bounded, separately owner-authorized experimentation capability with explicit datasets, budgets, frozen contracts and review. It never autonomously edits/adopts production code, changes authoritative state or runs paid background probes. No such work begins during source-of-truth integration.

## 45.5 Final closure and implementation handoff

Chest generation POST was accepted into the queue; the first poll stopped locally at `http_or_redirect_failure`. Completion and charge remain UNKNOWN; no GLB was retrieved and object/PBR/articulation remain UNVERIFIED. Lid classification is `STRUCTURE_UNVERIFIED`; a separate lid is not proven. This is not proof of provider generation failure. Object generation is not a production architecture dependency, and no recovery or retry is planned.

The four generation submissions permanently consumed the complete **$4.75 / $4.75 reservation allocation**; remaining allocation is $0. Known reported billing is **$2.528**, with fal-world and chest charges UNKNOWN. Reservations are not actual charges. Unknown charges remain reserved and never count as zero; there is no refund/reuse, replenishment or fifth generation.

**No additional Phase 3.8B experiment is planned.** Future provider issues are bounded implementation blockers, not continuation of this bake-off. Preserve original STOPPED records and evidence by exact historical commit/hash references. The final record is architecture/capability evidence, not production or real-data acceptance. The [integration review](SOURCE_OF_TRUTH_INTEGRATION.md) records coverage and verification. The next phase, under its separately scoped implementation task, is the **Production Multi-Agent Coding Sprint** with lead-owned shared contracts established before parallel work. No coding starts here.

# 46. FUTURE 2D PRESENTATION, TRAVEL & ADVENTURE DISCOVERY

**Roadmap/product direction only. No 2D renderer implementation is authorized by this section.** Text gameplay remains a permanent first-class mode. A future 2D presentation runtime and EXPLORE are optional views over the same authoritative RPG state; neither may become required to load, continue or understand a campaign.

Detailed product direction: [2D Rendering Direction](2D_RENDERING_DIRECTION.md). The references below describe interaction/presentation ideas, not a fixed art style or instruction to copy proprietary assets.

## 46.1 Permanent presentation modes

The same campaign may be played through:

- **Text** — the current free-form narrative RPG experience; always available and complete enough to continue play.
- **2D Live** — a future style-agnostic 2D presentation of travel, locations, actors, objects, checks and combat.
- **EXPLORE** — optional spatial presentation through the separately defined Spatial Runtime.

Switching presentation does not create a new timeline, change canon or grant knowledge. A visual layer may fail or be unavailable while Text continues normally.

## 46.2 First 2D target and references

The first useful 2D target is deliberately modest: **Fabled Lands-like open exploration and map hierarchy + Sorcery!-like encounters/checks/combat + unrestricted free-form AI-DM input**. It is not a Skyrim/GTA-style seamless simulation and does not require 3D.

Interaction/presentation references:

- **Everweave** — AI-RPG presentation baseline and cinematic narrative framing;
- **Sorcery!** — gamebook flow, checks and compact combat/event presentation;
- **Duskpunk** — dialogue/check/RPG presentation;
- **Quest for Infamy** — local 2D scenes, character presence and object interaction;
- **Fabled Lands** — open-world freedom and world/region/town/local navigation;
- **Sunless Sea** — atmospheric 2D travel, discoveries and encounters;
- **Sunless Skies** — region traversal, points of interest and environmental presentation.

The renderer must remain **visual-style agnostic**. Pixel art, painterly illustration, graphic-novel treatment, dark atmospheric art or another approved campaign style use the same gameplay semantics. Do not make any named reference game's aesthetic part of authoritative state.

## 46.3 World → region → town → local scene

Support different presentation scales rather than simulating every metre continuously. Example: the player says “we drive to Chicago”; a vehicle marker follows a route on a region/world map while bounded travel events may occur. The player may interrupt the route, investigate a visible place, enter a town overview, choose a district such as the market, then enter a local scene.

The authoritative model supplies locations, route/state, known entities, time/weather and discoveries. The renderer presents them. Maps and generated images never become the source of connectivity, inventory, quest truth or hidden geography. New detail may be created **lazily**: a town can first exist as a stable overview/graph; a market, tavern, alley or basement becomes visually detailed only when play requires it. Once meaningful generated detail is accepted, preserve stable IDs/provenance so revisits remain coherent.

## 46.4 Points of Interest and Adventure Hooks

Absolute freedom must not become an empty world. The World Engine may maintain a bounded set of potential **Adventure Hooks / POIs** appropriate to a meaningful region/location. A POI is an invitation to investigate, not automatically a quest or a mandatory objective.

Possible player-visible projections include landmark, rumor, discovery, unusual activity, lead and unknown/question-mark style signals; exact labels/UI are a later design choice. Examples include an old cemetery, abandoned vault, strange radio tower, sealed mine, travelling antiquarian, suspicious house, local fight club or magical anomaly.

Separate **latent truth** from **player knowledge**:

- a hidden Adventure Hook or linked World Thread may exist in DM-private state;
- obvious geography may be visible immediately;
- an NPC rumor, map, clue, direct observation or prior event may reveal only an appropriate player-known projection;
- only then may the corresponding POI appear on the player's map/journal;
- additional rumors/evidence can enrich the same stable POI without revealing its private resolution.

POIs may evolve or expire with World Threads. Ignoring a mine, caravan, cult activity or warning does not freeze the world; later public state may show smoke, collapse, departure or another consequence if normal World Engine progression justifies it. Never fabricate background advancement from wall-clock time.

Avoid checklist-marker spam. Later UX may offer owner preferences such as Minimal / Normal / Explorer visibility or equivalent, but the default should preserve discovery and uncertainty rather than expose every latent hook.


### Quest / POI marker visibility is an owner preference

Quest markers are not treated as inherently bad design. The player can choose how much explicit map guidance they want without changing the underlying world or discovery rules:

- **Off** — no automatic quest/POI markers; keep only essential navigation and manual pins/destination controls.
- **Tracked Only** — only the currently tracked objective/destination plus manual pins.
- **Standard** — discovered quest objectives and a curated set of important known POIs/leads.
- **All Known** — every player-known mappable quest objective, POI, rumor/lead/location signal and other known adventure marker supported by the current map.

The setting may be changed at any time and is presentation-only. **All Known does not mean reveal DM-private content**: undiscovered secrets, latent hooks and future information remain hidden. A player who wants modern-RPG convenience can have dense markers; a player who wants discovery/immersion can remove them entirely.

## 46.5 Owner-directed adventure density through Chat with DM

After the World Engine exists, the owner may explicitly ask Chat with DM for more/fewer or different kinds of opportunities in a region: more mysteries, social intrigue, dangerous places, grounded detective stories, fewer generic bandits, several possible adventures within a day's travel, and so on.

This is a deliberate **world-authoring request**, not merely narration guidance. The system may seed a bounded number of latent private hooks/threads under the requested constraints without revealing their truths or forcing them into the journal. A request such as “add five interesting things; make one potentially much larger but don't tell me which” is valid: the player should still discover them organically in-world.

Generation is lazy and finite. A latent hook needs only enough stable identity, theme, location relationship and private premise to remain coherent. Detailed NPCs, interiors, encounters and assets can be elaborated when the player engages. No autonomous infinite quest generation or paid background loop.

## 46.6 Combat and free-form actions

The first 2D combat presentation should remain compact rather than becoming a tactical-grid dependency. Sorcery!-style readable exchanges/checks are the baseline inspiration, while the player retains free-form input alongside convenience actions. An unusual action such as jumping onto a table, dropping a chandelier or attacking the environment is resolved by normal DM/rules/dice authority first; the renderer only presents the validated result.

## 46.7 Future semantic visual mutations

A later renderer may translate validated world deltas into visual mutations using the cheapest safe method: ordinary sprite/state swaps, decals/particles/lights, reusable asset variants, bounded local generative image edits, or rare scene recomposition. Do not regenerate an entire scene for every action and do not infer authoritative state from pixels. Example: graffiti can be a runtime decal immediately, while damage to a unique statue may later receive a local AI-assisted asset edit after the authoritative damage state already committed.

This visual-mutation concept is future work, not permission to choose an image model, add dependencies or implement a renderer now.
