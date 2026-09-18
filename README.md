# Personal RPG Console — Phase 0

A private, clickable James & Jinn campaign preview. No account, API key, database, or external service is required.

## Open the preview on this computer

1. Open this project folder in File Explorer.
2. Double-click **Start Preview.cmd**. Leave the small terminal window open.
3. Open **http://127.0.0.1:3000** in your browser.
4. Choose **Campaigns**, then **Continue the story** on The Long Road West card.

Direct Game: **http://127.0.0.1:3000/campaigns/long-road-west/game**. Main menu: **http://127.0.0.1:3000/**.

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

## Deliberately outside Phase 0

Real story responses, server dice rolls, campaign persistence, uploads and document editing, inventory mutations, backups, AI, authentication, image/video generation, and freeform evidence-board editing are not connected. Their preview controls explain this. There are no invented live dice results and no private DM facts in the client data.

Visual approval by the owner is the remaining Phase 0 acceptance step. No later milestone has been started.

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

Use Node.js 24 and pnpm on a new computer (verified with Node 24.19.0). The translation tests use Node's built-in TypeScript support. This workstation also supports its bundled Codex Node runtime via the Windows launcher.

```sh
pnpm install
pnpm dev
```

The exact dependency tree is committed in `pnpm-lock.yaml`. Next.js 16.3.5, React 19.3.0, and Tailwind 4.3.3 were the stable registry versions when implemented. TypeScript 6.0 and ESLint 9 match the supported ranges of the Next.js lint toolchain. Frontend dependencies only; no runtime connections to external services. System fonts avoid remote font requests.

Checks:

```sh
pnpm typecheck
pnpm lint
pnpm build
pnpm start
# In a second terminal while the preview is running:
pnpm test
```

`pnpm test` runs 49 checks: 19 HTTP route/navigation checks, 4 translation checks, 8 rules tests, 9 dice tests and 9 campaign/inventory/camp/conversation/recipe regressions. Coverage includes presentation independence, DC disclosure, repeated activation, cancellation, and reduced-motion scheduling. `PREVIEW_URL` can override the default test address. See `VERIFICATION.md` for browser checks and unverified physical-device/assistive-technology behavior.

Source layout: `src/app` contains the routes and styles, `src/components` contains reusable UI and screens, and `src/lib/mock-data.ts` contains player-readable sample records. Campaign-scoped records carry `campaign_id`. The registry in `campaign-routing.ts` validates URL identity; `inventory-model.ts` unifies items/entities/storage/equipment; `preview-state.ts` isolates temporary campaign state; `camp-preview.ts` provides authored recipe and access/rest fixtures. There are no server API routes or database migrations in this phase.

Localization uses a small shared React provider and `src/lib/locales/ru.json`: English source phrases are the dictionary keys; Russian phrases are their values. No localization package, duplicate routes, or language-specific screen components are needed. See `src/lib/locales/README.md` before adding text.
