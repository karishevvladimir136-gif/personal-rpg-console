# Development status

Last updated: September 17, 2026.

Update before milestone-completion commits and after architectural changes. Never include secrets, credentials, API keys, or DM-private content.

## Current milestone

**Phase 0 — Static clickable UI with consolidated navigation, inventory, conversations and Camp refinement.** Private single-user James & Jinn preview. Phase 1 has not started.

## Current status

The consolidated Phase 0 refinement is implemented and verified. Typecheck, lint, the production build and all 49 tests pass. Browser checks covered desktop and 390px/320px layouts. **Owner approval remains pending.** Implementation completion is not acceptance. Phase 1 has not started.

Preview: **http://127.0.0.1:3000/** (port **3000**, loopback only). Direct Game: **http://127.0.0.1:3000/campaigns/long-road-west/game**. No accounts, service keys or manual setup required. After a computer restart, double-click **Start Preview.cmd**.

## Completed work

- Separated main menu, campaign selection and explicit campaign routes. General Settings owns interface/reading preferences; Campaign Settings owns story language, narrative style, rules/play style and visual preferences. Added honest Exit/management previews, legacy redirects and unknown-ID 404s.
- Preserved original Game, Character, Journal/Evidence, Map, Library, Gallery, Sessions, rules and dice features and the charcoal/bronze direction. Concepts remain unstarted; only James & Jinn is connected.
- Added responsive icon inventories for player, companions, camp stash and applicable transport. Paper dolls, grids and slots use one item/equipment collection with distinct ownership and storage. Old Ford has configurable vehicle slots and a cargo-proximity explanation; no invented mount or arbitrary capacity limit.
- Added accessible item details with mechanics separate from flavor, quantity/storage/owner/acquisition, expandable amulet history, transfer/use/equip previews and disconnected image-generation entry/local illustration states.
- Added free-text companion conversation with optional starters, authored sample exchange and literal temporary player messages shared by Party and Camp, keyed by campaign and companion. Absent Goran cannot be approached; Jinn has no assumed humanoid slots.
- Added Game Rest, compact Short Rest and dedicated warm Camp, explicit sample eligibility/entry/leave/completion, participants, source/cost and recovery explanation. Separate zero-capable short/long supply costs integrate with Custom independently of Recovery.
- Remote deposit previews work from accessible inventories; stash withdrawal/use/equip requires active long-rest camp. Short rest does not unlock it; cargo proximity remains independent.
- Three sample recipes show ingredients/sources, recipients, insufficiency, provisional temporary effects/expiry and simulated outcomes. Food/drink conversations reuse the same panel. No stock, effects, resources, time, history or relationship changes occur.
- English/Russian catalog additions, responsive CSS, reduced-motion camp glow and native dialogs. Fixed nested Escape/Tab propagation and retained stable dice-state callbacks after the campaign-store refactor.
- MASTER_SPEC section 36 and phased DEVELOPMENT_PLAN record future contracts only. Media-model requirements (32), item transformations (34), and checks/dice (35) are preserved. origin/main matched the clean local checkpoint before edits.

## Files / areas changed

- Routing/layout: app home, legacy [screen], new campaigns/[campaignId] routes, shell/menu, language title, screen dispatch, collections and campaign links.
- Shared model/state: campaign-routing.ts, inventory-model.ts, camp-preview.ts, preview-state.ts, preview-context.tsx and campaign-settings.ts.
- UI: inventory.tsx, companions.tsx, camp.tsx, shared Character equipment, Game rest entry, campaign preferences, Modal keyboard handling, globals.css and ru.json.
- Tests: new camp-inventory.test.mjs; extended preset tests; revised route/navigation smoke tests. Existing dice and translation tests retained.
- Documentation: MASTER_SPEC, DEVELOPMENT_PLAN, README, DEV_STATUS and VERIFICATION. TypeScript permits explicit .ts imports for pure modules tested with Node 24. No packages added.

## Tests and build status

- Development tests: **49 passed** — 19 HTTP, 4 translation, 8 rules, 9 dice and 9 consolidated-refinement tests.
- Typecheck: passed. Lint: passed without warnings.
- Final production build: passed; 26 pages/prerender entries generated, plus validated campaign-root redirect.
- Final production tests: **49 passed**, including after the Russian conversation-starter wrapping fix.
- Browser checks passed: menu/Exit/selection; grids/details/history/image demo; item focus restoration; remote deposit versus locked stash; Party/Camp literal messages; blocked/allowed entry; recipe availability/recipients/food conversation; active stash actions; completion closure; zero-cost Custom retention; dice 19-point reveal. All campaign screens fit Russian 320px without page-wide overflow. Nested Escape/Tab regression passed after fixing propagation. Production verified keyboard dice reveal, Hidden presentation, Russian Camp/cooking/conversations, and refresh closing Camp. A long Russian food starter originally overflowed its 320px dialog; wrapping fixed it and was rechecked in development and the rebuilt production preview. Nested item/transfer/image dialogs also have no horizontal overflow at 320px. At 390px Camp and cooking fit.
- Physical iPhone/Safari, software keyboard, actual screen-reader speech and OS reduced-motion switching are unverified. Dice reduced-motion scheduling is automated; CSS disables camp animation under the preference.

## Key technical decisions

- Registry-backed URL identity never falls back to James. A root memory store keeps a record per connected campaign and separate global reading preferences. Settings and companion messages are explicitly scoped.
- Client navigation retains shared state; refresh resets it. No database/browser storage, APIs, auth, AI/media provider, simulation engine or backend was added.
- Supply units per participant: Easy short/long 0/0; Medium 0/1; Hard 1/2. Each cost accepts 0–5 whole units; values remain provisional. Narrative/check/dice controls remain independent.
- Old Ford's cargo is out of reach in the authored sample. Camp does not move it. Jinn's cup needs no assumed equipment slots. New supplies, spare coat and rarity/history examples remain illustrative rather than imported canon.
- Camp uses CSS/SVG and local portraits. Items retain fallback icons. Regenerate appears only after opting into a local illustration demo; no image job occurs.
- Preparation and consumption are distinct; recipe ingredients are not rest-supply units. Two servings, one meal/drink maximum, activation after the creating rest and explicit expiry are examples, not live or official D&D mechanics.
- Future phases: persistence in Phase 1; authoritative single-DM/check/rest/storage/cooking operations in Phase 2; continuity in Phase 3; optional item imagery in Phase 4. Separate authorization is required.

## Known issues

- All gameplay effects remain deliberately unimplemented: transfers, equipment mutations, consumption, recovery, buffs, relationship changes, generated media and real dice.
- Only one connected campaign exists. Isolation/unknown-ID rejection are tested; no second playable campaign is supplied. Concepts and draft titles never become active campaigns.
- Screen-local recipe/rest selections and local image demos may reset when closed. Shared settings, messages and camp active state survive navigation. Refresh resets temporary state/languages and closes camp.
- Camp is illustrative, not proof the story has moved. Supply stock and benefit values are sample fixtures.
- Physical devices and assistive-technology speech remain unverified. Supplied bitmap artwork may contain embedded lettering that is not localized.
- Preview availability depends on its local process/computer; the app has not been deployed.

## Remaining work

Owner click-through and explicit Phase 0 approval remain. Physical-device and assistive-technology checks remain unverified; all real gameplay/persistence/provider work is deferred by design. This completion checkpoint records the verified implementation and is to be committed/pushed with the focused changes. **Do not begin Phase 1.**

## Recommended next step

Open the main menu → Campaigns → Continue the story. Try Game → Rest → Long Rest / Enter Camp, conversations, stash, cooking and completion. Inspect all storage grids and amulet history. Try Game → Dice preview. Interface language is in Main menu → General Settings; story language/rules remain in Campaign Settings. README contains the click-through instructions.

## Preserved checkpoints

Original shell ab7b891; bilingual UI 84e73f0; Rules & Play Style 54c1c73; Checks & Dice 4403666. Remote media-model and item-transformation documentation is preserved. These checkpoints do not imply approval or implementation of later phases.
