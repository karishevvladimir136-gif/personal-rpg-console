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

Preferred initial provider:
fal / Seedance reference-to-video.

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

GENERAL
- language
- difficulty
- narrative verbosity
- visible dice
- mature tone

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
- OpenAI image generation

Video:
- fal API / Seedance

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
- fal queue
- Seedance reference/image-to-video
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
