# Live UI Phase-0 reconciliation — isolated review candidate

**Map / Atlas V2 successor:** This document records the earlier Phase-0 screen and standalone subject-image milestone. The isolated `codex/astra-ui-media-map-integration` branch adds reviewed-scope World / Region / Local presentation placement and optional generated map artwork. Its current design and verification are recorded in [MAP_ATLAS_V2_IMPLEMENTATION.md](MAP_ATLAS_V2_IMPLEMENTATION.md); the earlier flat-Map limitation below remains accurate for the original Phase-0 candidate.

**Status:** Presentation and standalone visual-job candidate for owner review. This branch starts from `3f59d8d82373c825b44ea7c79acbdbde210f9193`. It is not merged, deployed, or active in the owner app. The owner database and gameplay were not changed. The local Supabase service was unavailable for live-data acceptance, so the screenshots use an explicitly labeled synthetic public fixture; they do not show the owner's campaign.

## Player navigation

The previous persistent sidebar exposed Game, Adventures, Character, Inventory, Party, Journal, Timeline Explorer, Places of Belonging, Map, World, Chat with DM, Library, Gallery, Visual Bible / FRAME, Sessions, Saves, and Campaign Settings at the same level. The new primary navigation is Game, Character, Inventory, Party, Journal, Map, Library, Gallery, Sessions, and Campaign Settings. Existing routes remain reachable for compatibility.

| Earlier top-level capability | Player-facing location |
| --- | --- |
| Adventures | Journal → Quests; existing Adventure review remains available there |
| Timeline Explorer | Journal → Timeline |
| World records | Journal and Map contextual sections; the existing World route remains reachable |
| Places of Belonging | Map and Journal contextual sections |
| World Lab / What-If | Map / Journal contextual action; detached simulation authority is unchanged |
| Chat with DM | Campaign Settings |
| Campaign DM Style | Campaign Settings → DM Style |
| Visual Bible / FRAME | Gallery → Visual references and Game → FRAME for the current scene |
| Saves | Sessions → Saves |
| Camp and Combat | Contextual Game/Party controls, with encounter status controlling visibility |

## Data and presentation boundary

The persistent Game, Character, Inventory, Party, Journal, Map, Library, Gallery, Sessions, Settings, and campaign list read current public campaign snapshots and existing runtime APIs. The Phase-0 preview stays intact. The new `/preview/live-ui` route adapts an isolated synthetic `CampaignSnapshot` to those presentation components for visual review; it does not fetch or mutate a real campaign. The fixture has a visibly labeled synthetic banner, disabled gameplay and image actions, and no access to owner-private context.

The live pages reuse the existing Phase-0 shell direction: charcoal surfaces, bronze accents, narrative typography, card and panel language, story column, compact context rail, and responsive layouts. They keep the persistent `CampaignData` and `GameplayRuntime` adapters for live records and actions. Shared `LiveDisclosure` provides accessible collapsible secondary sections without introducing another data store; its preferences are browser-local presentation state. The fixture adapter is confined to `/preview/live-ui`, and the original `/preview` remains a separate visual oracle.

Game uses the Phase-0 story-first composition: current scene art or an atmospheric empty state, readable story history, the existing free-text composer, and a narrow contextual rail. Actor icons appear only when an existing structured turn identity identifies the player or companion; narration text is never parsed to guess a speaker. Character uses the real public entity, HP/resources, equipped Items and a neutral non-canonical equipment mannequin when no approved portrait is available. Inventory groups real storages, supports search/category filtering, and keeps exact Items and mutation controls. Party shows public people and existing Talk/Inventory routes; private Character Model fields are absent. Map lists only saved known/visited Locations and does not manufacture distances, routes, pins or regional geometry.

The Game scene art, full context rail and its cards, mechanics, rest, continuity and record editing are collapsible. Character attributes, conditions, equipment/progression, Inventory filters/equipment/corrections/trade, Journal secondary tools, Map details, Library groups, Gallery history, Sessions recap and Saves tools use compact disclosures. Visual collapse preferences are local-only. Opening a disclosure does not itself change gameplay.

## Inline subject images

Character, Item Details and Map/Location detail mount the same contextual `GenerateVisual(subject)` workflow for one public entity, item or known Location. The workflow uses the existing OpenAI image provider, media reservation, storage path, paid grounding review, draft, explicit owner acceptance, asset record and visual-reference documents. A separate explicit **Use as visual reference** action approves the accepted image as a reference. The image is presentation only; neither accepting pixels nor approving a reference establishes Canon, Item mechanics, ownership, quantity, hidden facts or gameplay results. Approved written visual guidance is included in the prompt; the current provider contract does not send reference image pixels as model input.

The existing scene FRAME job requires a Scene. The owner separately authorized one additive migration, `supabase/migrations/202610060040_standalone_visual_jobs.sql`, to admit a bounded standalone subject basis through the same real media lifecycle. Migration 39 belongs to the separate Astra World Logic takeover. Migration 40 is a branch-only review artifact and **has not been applied to the owner database**. It must not be merged or activated until migration-39 ordering is resolved. Existing scene FRAME and video authority remain intact.

## Review screenshots

All files under [`docs/review/live-ui-phase0`](docs/review/live-ui-phase0/) are synthetic UI review captures, not owner-campaign evidence.

| Screen | Capture |
| --- | --- |
| Campaigns | `01-campaigns-desktop.jpg` |
| Game | `02-game-desktop.jpg`; mobile `12-game-mobile.jpg` and first viewport `12-game-mobile-viewport.jpg` |
| Character | `03-character-desktop.jpg` |
| Inventory and Item Details | `04-inventory-desktop.jpg`, `14-item-details-desktop.jpg`; mobile `13-inventory-mobile.jpg` |
| Party | `05-party-desktop.jpg` |
| Journal Quests | `06a-journal-quests-desktop.jpg` |
| Journal Evidence | `06b-journal-evidence-desktop.jpg` |
| Map | `07-map-desktop.jpg` |
| Library | `08-library-desktop.jpg` |
| Gallery | `09-gallery-desktop.jpg` |
| Sessions | `10-sessions-desktop.jpg` |
| Campaign Settings | `11-settings-desktop.jpg` |

## Verification and limitations

The complete repository suite passed **1,990/1,991** with zero failures and one existing skip. Focused live UI/persistence tests passed **36/36**. TypeScript, repository ESLint with zero warnings, and the production webpack build passed. The synthetic browser review reached all ten player screens without browser console errors. Subject-image media tests and migration-40 disposable SQL tests passed; the latter exercise the branch's 38→40 file chain. A separate disposable smoke check applied the reviewed migration 39 from its isolated takeover worktree at `3d5768a`, then migration 40, and successfully queued and reserved a synthetic subject-image job. That check does not replace a committed 39→40 regression after ordered integration.

The preview route cannot establish that the owner campaign looks correct with its live records; that requires local Supabase and a separate read-only owner review. The public Location contract has no map geometry/region hierarchy or route graph, so Map intentionally presents saved place lists and destination planning rather than invented cartography. Favorites have no persistent public flag, so Gallery does not manufacture one. Existing media references supply approved text guidance, not image-pixel conditioning. No provider call, owner database change, owner gameplay change, or deployment occurred.
