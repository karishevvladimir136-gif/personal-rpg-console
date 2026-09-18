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

# 6. NAVIGATION HIERARCHY

The app has three distinct levels (consolidated owner requirement, section 36):

- **Main menu:** Campaigns, General Settings, Exit. No campaign sidebar, character data, or gameplay bottom navigation. Before authentication, Exit explains that sign-out is unavailable; it never closes the browser, stops the server, or erases preview state.
- **Campaign selection:** existing cards, management previews, New Campaign preview, and Back to main menu. Continue opens the selected campaign's Game. Concepts remain clearly unstarted and cannot resolve to another campaign's data.
- **Inside a campaign:** Game, Character, Inventory, Party, Journal, Map, Library, Gallery, Sessions, Campaign Settings, and a separate Back to campaigns control. Show the active campaign name. Mobile bottom navigation is restricted to this level. Camp is entered from Game → Rest → Long Rest, not a permanent recovery shortcut.

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

The primary inventory presentation is a responsive icon-slot grid, with storage views separate from category filters and search. Player, companion, stash, and applicable transport views share equipment and item records; see section 36.

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

Campaign **Rules & Play Style → Checks & Dice** controls check frequency and presentation independently of difficulty (section 35). The AI proposes a structured check; the server validates it and produces/records the actual result before narrating the action's outcome. Animation only presents that recorded result and must not generate another roll. Phase 0 is an explicitly labeled fixed-sample exception for UI demonstration, never live gameplay.

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

CAMPAIGN SETTINGS — PER CAMPAIGN
- General: campaign language (independent of interface language) and campaign visual preferences
- dedicated **Rules & Play Style** tab: difficulty/rules, story structure, player role, world autonomy (section 33), and Checks & Dice (section 35)
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

# 39. Owner-approved Phase 1 persistence boundary

Phase 0 is approved at `96b69dcd63d2fa015f5e75bcc5d632c41e04369e`. Later Phase 0 stop/approval-pending notes above are historical checkpoints superseded by this explicit approval. Phase 1 implementation is authorized; Phase 2 and deployment remain unauthorized.

Use Supabase Postgres/Auth for the private single owner. Verify the signed-in user on every server read/write, match the configured owner and database registry, enforce owner-only RLS, and prevent cross-campaign references. No public registration. Complete owner authentication and access checks before any separately authorized deployment. All credentials remain server-side; DM-private records reside in a separate unexposed schema, with no ordinary client accessor. Media providers/models remain owner-selectable in later phases.

Persist campaigns, separate global preferences, complete campaign settings, documents and immutable versions, generic characters/companions/NPCs/transport, shared inventory/storage/equipment, sessions/public scenes/resume state, quests, locations and asset metadata. Every campaign-owned record includes campaign_id. Manual corrections are explicit owner actions with the highest state authority; revision checks prevent silent overwrite. Stable request IDs and atomic operations prevent duplicate corrections on retry. Document restoration creates a new current version. Settings history applies prospectively and cannot rewrite existing scenes or established facts.

Preserve the approved visual language and bilingual UI. Persistent routes use actual campaign IDs and generic records without hardcoded James & Jinn dependencies; exercise two unrelated synthetic campaigns. The approved Phase 0 gameplay demonstrations remain isolated under `/preview`, with no persistence hooks. No persistence operation resolves combat, rolls dice, rests, cooks, consumes resources, transforms items, generates media or calls AI. Future gameplay record structures remain inert. Asset metadata does not imply uploading or generated media.

Verification must distinguish SQL tests with an auth stub from actual Supabase Auth/REST and application/browser cookie integration. Missing configuration is a blocker to acceptance, not proof of persistence. Never use a mock store as a hidden substitute for the persistent application. Preserve the approved checkpoint, commit migrations, inspect targets before applying them, and do not seed real campaign/private material or destructively reset an existing target.

# 40. Chat with DM and DM Guide

## Purpose and Phase 1 scope

Add a per-campaign **Chat with DM** navigation tab, translated **Чат с DM**. This is a separate out-of-game space for feedback about narration, tone, pacing, companion initiative and DM behavior. Keep Game's existing OOC control for brief remarks.

- Persist literal owner messages separately from gameplay transcripts and companion conversations. Messages survive navigation, refresh and sign-in. Show timestamps, saving/error states, and preserve text after failed saves. There are no fabricated DM replies or AI calls.
- Clearly display: **DM replies and application of these preferences arrive in Phase 2.**
- Provide an editable **DM Guide** using the existing documents and immutable version history. Explicit manual Save, inspect history, and restore an older version as a new current version. Keep a stable campaign-to-guide document link; it is a reference document, not established story canon. Sending a feedback message never changes the guide.
- Distinguish saved guidance from guidance actually applied by a runtime. Phase 1 has no live DM; saved guidance is not being applied yet.
- Scope all records, reads and writes to the authorized owner and selected campaign. This screen cannot advance game time, trigger checks, alter inventory/health/quests/relationships/canon, reveal DM-private state or provide spoiler access. Reuse the same authorization, revision and retry protections as other persistence operations.
- Verify message/guide persistence, restoration, campaign isolation, save-failure draft retention, and absence of gameplay mutations. Preserve English/Russian and desktop/mobile usability.

## Future Phase 2 contract — documentation only

The **same primary DM runtime** supports a separate feedback mode. It can discuss preferences and propose concise guidance changes. The owner explicitly chooses **This session** or **Save for this campaign** before a proposal is approved. Approved guidance affects future narration only and cannot override authoritative mechanics, player agency, established canon or secrecy. Conflicts with canon require clarification, never silent rewriting.

Session guidance expires with its session; campaign guidance remains versioned. Ordinary gameplay receives effective approved guidance, not the entire feedback conversation. Campaign documents supply world/story context, structured settings supply explicit mechanics/play-style choices, and approved guidance supplies preferences within those boundaries. There is no second DM agent, simulation engine, automatic guide rewriting, or implemented feedback AI in Phase 1.
