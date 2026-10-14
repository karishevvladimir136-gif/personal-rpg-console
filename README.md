# Personal RPG Console — Phase 1 persistence

## Local owner app

Double-click **Start RPG Console.cmd** for the real saved-campaign application. It starts the existing local services, signs the existing owner in silently on loopback, and opens the campaign list. See [local owner startup](LOCAL_OWNER_STARTUP.md) for the privacy boundary and recovery behavior. **Start Preview.cmd** remains the isolated demonstration launcher.

A private application for one owner. Phase 0 is approved at commit 96b69dcd63d2fa015f5e75bcc5d632c41e04369e. Phase 1 adds saved records and owner access; gameplay, AI and deployment remain deferred.

## Open the application

Double-click **Start Preview.cmd**, leave its window open, then open **http://127.0.0.1:3000/**. Or run `pnpm dev` in this folder. The local server uses loopback port **3000**.

Persistent screens require a configured Supabase instance and the single owner account. Until then the application displays an honest setup screen. Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md); it includes setup and real persistence/access checks. No project was deployed or created automatically. Keep real/private campaign material out until those checks pass.

The account-free visual demonstration remains at **http://127.0.0.1:3000/preview**. It is isolated from saved campaigns and never writes gameplay results.

## Phase 1 click-through after setup

1. Sign in, create two unrelated campaigns, and add a different character/document to each. Refresh and sign out/in; verify each retains its own records.
2. Change global Interface Language independently from a campaign's language/rules settings. Save explicitly.
3. In Library, save a document twice, inspect version history, and restore an older version. Restoration creates a new version. Try competing edits in two tabs; the stale draft must be preserved.
4. Correct inventory/storage/equipment manually. Character, Party and Inventory share the same saved item records.
5. Save a session, scene and public resume point. Game displays stored writing; it does not generate replies or execute actions.
6. Open **Chat with DM / Чат с DM**. Send feedback, refresh, and inspect the timestamped message. Edit/save **DM Guide**, view history and restore a prior version. Sending chat must not change the guide. Saved guidance is not applied yet.
7. Disconnect the test service while saving a draft, then retry after reconnecting. Text must remain, and the retry must not duplicate a record. Check both campaigns and narrow-screen English/Russian layouts.

See [DEV_STATUS.md](DEV_STATUS.md) for actual results and remaining verification prerequisites. Phase 1 owner review is pending. No Phase 2 work or deployment is authorized.

## Approved Phase 0 demonstration

A private, clickable James & Jinn campaign preview. No account, API key, database, or external service is required.

## Open the preview on this computer

1. Open this project folder in File Explorer.
2. Double-click **Start Preview.cmd**. Leave the small terminal window open.
3. Open **http://127.0.0.1:3000/preview** in your browser.
4. Choose **Campaigns**, then **Continue the story** on The Long Road West card.

Direct Game: **http://127.0.0.1:3000/preview/campaigns/long-road-west/game**. Main menu: **http://127.0.0.1:3000/preview**.

If the preview is already running, simply open that address. To stop a preview started by the launcher, close its terminal window. This is a local preview on this computer, not a deployed website or an iPhone-accessible hosted app. To check the phone layout on this computer, narrow the browser window.

## Things to try

- The main menu has Campaigns, General Settings and an honest Exit explanation. Campaign selection has no campaign sidebar. Inside a campaign, **Back to campaigns** switches levels.
- Explore campaign screens using the sidebar. On a narrow screen, use the bottom bar and the top-left menu.
- **Game:** type an action, switch OOC on/off, add a note, inspect what James knows, open the sample frame, or save a moment.
- **Game → Dice preview** (beneath the action input): click the die or **Roll** for a fixed sample. Expand **Demo setup** to try sample A (success), B (failure), C (advantage), D (disadvantage), or E (no target supplied). **Replay sample animation** repeats the same result; it is not a gameplay reroll.
- **Character / Inventory:** select equipment slots, switch character tabs, filter or search the inventory, and inspect an item.
- **Journal:** inspect evidence cards, read the timeline, or add a personal note.
- **Map:** select a known city and choose a sample destination. Region and Local show illustrative diagrams.
- **Library:** filter and search sample documents, read them, and open the sample version-history view.
- **Sessions / Gallery:** read the illustrative recap, open artwork, and find a saved scene in Favorites.
- **Main menu → General Settings → General → Interface Language:** choose **English** or **Русский**. Navigation, controls, dialogs, and sample content change together. In Russian, this is **Главное меню → Общие настройки → Общие → Язык интерфейса**.
- **Campaign Settings → General → Campaign Language:** choose a separate future story language for The Long Road West. This does not change the interface or generate a story yet.
- **Campaign Settings → Rules & Play Style:** tune difficulty and independent narrative preferences. Advanced includes separate short/long rest supply costs; zero means no cost, and edits select Custom without changing Recovery. Under **Checks & Dice**, try Hidden / Key Rolls / All Player Rolls, Interactive Dice, and Show DC, then **Open dice preview**. Key Rolls shows only narrative for a non-important sample. Hidden retains the saved toggle choices while disabling them. Check Frequency is a future preference, not an active check generator.
- **General Settings:** turn on larger story text and optional suggested actions, then return to Game.

Actions, notes, favorites, destination, reading controls, and both language choices are kept in memory while navigating. Refreshing resets the preview, including both languages to English. Your own writing is never translated. New campaign cards and other screen-local sample controls are temporary too. No files or real campaign data are changed by the UI.

Campaign rules/check/dice settings and the selected demo sample also survive navigation. Defaults are Medium / Balanced story / One of many / Moderate autonomy, with Balanced check frequency, Key Rolls, Interactive Dice On, and Show DC Off. Demo results never change the character, inventory, history, or reroll allowance. Refresh resets these choices; closing an unfinished animation cancels it. On narrow screens the dice window scrolls vertically to keep every control reachable.

## New inventory, companion and Camp walkthrough

- **Inventory:** switch Player / Companions / Camp Stash / Transport & Mounts. Search or filter within storage. Focus/hover for a short preview; click/tap for details. The Pact amulet has expanded sample history. Character slots and inventory cells open the same item records.
- **Party → Jinn → Talk:** type freely or use a starter. Messages are temporary; no AI reply or relationship change is generated. Goran is absent and unavailable.
- **Game → Rest:** Short Rest previews participants, supplies and expected recovery. **Long Rest / Enter Camp → Enter demo camp** opens the gathering scene. The unsafe eligibility sample blocks entry.
- **Camp:** talk with Jinn (the same messages as Party), inspect his inventory, open the stash or **Cook / Prepare a drink**. Try grilled meat/coffee, change recipients, and view the simulated outcome. Stew demonstrates missing ingredients. Talk over food/drink reuses the conversation panel.
- **Camp → Review & Complete Long Rest:** review participants/source/cost, then show a simulated completion and close access. **Leave Camp / Cancel** returns to Game without recovery. Neither changes HP, inventory, time or history.
- **Item details → Storage & use preview:** inspect item/source/destination/quantity. Accessible items can be sent to camp anywhere; stash withdrawal/use/equip requires active long-rest camp. Short rest does not unlock it; cargo still requires proximity. No actual transfer occurs.
- **Item details → Generate image:** read the disconnected-service explanation; optionally show the local illustration demo to see Regenerate/Restore controls. No request or charge occurs.

Shared campaign settings, conversations and camp active state survive navigation. Refresh closes camp and resets temporary state. Recipe/rest-dialog selections and image-demo states are screen-local and may reset on closing. Both languages cover the new screens; interface and story languages remain independent.

## Combat preview walkthrough

Open **http://127.0.0.1:3000/preview/campaigns/long-road-west/game** → **Preview Combat**. This is a separate synthetic demonstration inside Game; nothing changes your campaign.

1. **Attack → Raincoat lookout → Confirm demo action → Roll → Continue**. Review the cost before confirming. If you close before completing a roll, use **Resume sample roll**; reviewing/replaying cannot spend or hit twice.
2. **End Turn** gives you Jinn. Attack the same lookout; End Turn → **Play scripted enemy turn** returns to James in round 2. Try Item on an injured party member, Move or Defend.
3. Defeat the remaining sentry to **Show encounter summary** and **Collect demo loot**. Or choose **Finish demo with withdrawal**. The summary retains injuries and lists spent resources; it never heals or rests the party. Loot is demo-only.
4. Type a free-text proposal, hide the illustration, inspect a companion, or use the mobile Scene & actions / Party details / Combat history switches. **Reset demo** starts fresh; **Exit combat preview** or **Return to Game** restores normal Game. Navigation away and refresh also discard the encounter.
5. To compare dice styles, leave combat → **Campaign Settings → Rules & Play Style → Checks & Dice**. Hidden resolves with no dice modal or numbers; Interactive Off displays an immediate compact result; Key/All show these important sample attacks. No public target number is supplied for combat attacks, so Show DC adds none. The generic dice preview still demonstrates disclosed DCs. Check Frequency will not remove mandatory combat attacks/saves.

All action values, enemies, abilities, results and loot are invented. Direct control of James/Jinn and one grouped scripted enemy turn illustrate the flow; no actual combat engine, AI, server dice or background simulation exists. English/Russian cover the controls and sample text; your proposal stays literal. Phase 0 is approved at the preserved checkpoint.

## Deliberately outside Phase 0

Real story responses, server dice rolls, campaign persistence, uploads and document editing, inventory mutations, backups, AI, authentication, image/video generation, and freeform evidence-board editing are not connected. Their preview controls explain this. There are no invented live dice results and no private DM facts in the client data.

Phase 0 is approved. Phase 1 persistence is separate from this isolated demonstration.

## Visual and product decisions

- The supplied seven design references guide the charcoal, bronze, literary, cinematic presentation.
- Scene and character artwork is displayed through art-only SVG windows into local copies of the supplied mockups. All interface text, controls, cards, evidence links, and equipment slots are real HTML/SVG. The original reference files remain unchanged. These are preview assets, not a final visual bible.
- The map is a clean, illustrative SVG atlas so baked-in reference labels cannot conflict with the live controls. It is not geographic or travel guidance.
- New York is the consistent current location. Chicago and Denver are previously visited; San Francisco is a known lead.
- James is 32, a private detective, a level 3 human warlock; Jinn is his long-term partner. Further details are illustrative sample data, not imported canon.
- James & Jinn is the only connected campaign. Other worlds are clearly labeled visual concepts, avoiding false cross-campaign navigation.
- Suggested actions are off initially; free text is the primary way to interact.
- The Evidence Board has a fixed composition with clickable cards; dragging and editing connections belongs to later work.

## For development

Use Node.js 24 and pnpm. Install with pnpm install, run pnpm dev, and leave the loopback preview running. The exact dependency tree is committed in pnpm-lock.yaml. System fonts avoid remote font requests.

Run pnpm typecheck, pnpm lint, pnpm test (while a preview is running), and pnpm build. PREVIEW_URL overrides the default test address. Live Supabase tests are separately opt-in and require the disposable setup described in SUPABASE_SETUP.md; a skipped integration is not a pass.

Routes and styles live in src/app. Persistent UI lives in persistent-* components; typed public contracts/client helpers are in src/lib/persistence, and server-only access is in src/lib/server. Supabase migrations are committed in supabase/migrations. The /preview routes, preview-state, camp-preview and combat-preview remain isolated demonstrations with player-readable sample data.

Localization uses the shared React provider and src/lib/locales/ru.json. English source phrases are keys; Russian phrases are values. Worker fragments are retained for focused tests and merged into the central catalog. There are no duplicated language routes or localization framework. See src/lib/locales/README.md before adding text.
