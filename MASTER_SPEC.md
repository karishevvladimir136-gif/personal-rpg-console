# PERSONAL RPG CONSOLE
## Final Product Specification v1.0
### Private single-user home application

---

# 1. PRODUCT GOAL

Build a private personal RPG application that replaces the current manual workflow built around ChatGPT Projects, World Bibles, Character Bibles, Campaign Briefs, Checkpoints and DM Ledgers.

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

Every important database object must belong to a `campaign_id`.

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

---

# 3. CORE INFORMATION MODEL

The hierarchy is:

APP
→ CAMPAIGNS
→ SESSIONS
→ SCENES

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

# 6. MAIN DESKTOP NAVIGATION

Persistent left sidebar:

- Campaigns
- Game
- Character
- Inventory
- Party
- Journal
- Map
- Library
- Gallery
- Sessions
- Settings

Bottom/sidebar campaign card:
- campaign title;
- current session;
- small cover image;
- quick switch.

Mobile bottom navigation:

- Game
- Character
- Map
- Journal
- Library

More menu:
- Inventory
- Party
- Gallery
- Sessions
- Settings
- Campaign switcher

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
- level;
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

Supported initial files:
- TXT
- MD
- PDF
- DOCX
- PNG/JPG/WebP

Every edit creates a new version rather than destructively overwriting history.

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

Placeholder:
“What do you do, James?”

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

Show:
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

Simple visual paper-doll:
- Head
- Neck/Amulet
- Armor/Coat
- Main Hand
- Off Hand
- Belt
- Legs
- Boots

Do NOT build a 3D character system.

Use a static character image with surrounding equipment slots.

Tabs:
- Character
- Abilities
- Spells
- Background
- Notes

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

Step 3:
Character
- upload/paste Character Bible
- optional portrait/reference images

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

No campaign should auto-generate a story unless user explicitly requests it.

---

# 15. GAME / DM RUNTIME

The DM is one primary AI runtime.

Do not begin with a swarm of agents.

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

Use a deterministic server dice tool.

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

---

# 17. MEMORY ARCHITECTURE

Do not resend the entire campaign transcript every turn.

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

Only current version is canonical.

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
- visible dice display

CAMPAIGN SETTINGS — PER CAMPAIGN
- General: campaign language (independent of interface language) and campaign visual preferences
- dedicated **Rules & Play Style** tab: difficulty/rules, story structure, player role, world autonomy (section 33)
- mature tone

Difficulty is a campaign setting, never a global application preference. Each campaign's rules system determines which mechanical controls apply.

AI
- text model
- context depth

VISUAL
- campaign visual style
- frame aspect ratio
- video duration
- audio default

DATA
- export
- import
- restore snapshot
- archive

ADVANCED
- DM Private Data
- debug log
- rebuild index

DM Private Data requires double spoiler confirmation.

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
- OpenAI server-side API

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
- `.env*` excluded from git.
- never send Supabase service-role key to client.
- never send OpenAI key to client.
- never send fal key to client.
- never send DM private state in normal browser payloads.
- all DB rows scoped by campaign.
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
- server-side OpenAI call
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

## PHASE 4 — FRAME

Add:
- visual references
- image generation
- spoiler-safe prompt builder
- gallery

Success:
James stays recognizably consistent across several scenes.

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

If a feature is not necessary for the user to play their own campaign, it can wait.

---

# 30. FIRST CAMPAIGN ACCEPTANCE TEST

Use the existing James & Jinn campaign.

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

Version 1 is successful when:

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

Everything else is optional.


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

- **Low:** important NPCs and factions act mostly near the current story as time and events advance.
- **Moderate (default):** relevant goals can also progress off-screen as in-world time and meaningful events advance.
- **High:** important NPCs and factions pursue their goals more actively; consequences surface through relevant events.

Autonomy is event-driven narrative guidance for the one DM runtime. High does not imply a full-world simulator, continuous background processing, or multiple AI agents.

## Authority and prospective application

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
