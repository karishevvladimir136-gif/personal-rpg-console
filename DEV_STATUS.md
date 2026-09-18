# Development status

Last updated: September 17, 2026.

Update this file before every milestone-completion commit and after any major architectural change. Record the actual verification results and remaining limitations. Never include secrets, API keys, credentials, or private DM content.

## Current milestone

**Milestone / Phase 0 — Static clickable UI shell, including bilingual Rules & Play Style and the final Checks & Dice demonstrator.**

Scope: a private, single-user campaign preview with realistic James & Jinn sample data. No later milestone has been started.

## Current status

Phase 0 and all requested refinements, including Checks & Dice and the interactive fixed-sample dice window, are implemented and verified. Earlier checkpoints were committed and pushed as `ab7b891` (original shell), `84e73f0` (bilingual), and `54c1c73` (Rules & Play Style). Explicit owner approval remains pending; implementation completion is not owner approval. Phase 1 has not started.

The local development server was restarted as a background process after the original preview stopped. It uses port **3000**, bound to **127.0.0.1**. Preview: **http://127.0.0.1:3000/campaigns**. The server must be running on this computer for that address to work.

No accounts, API keys, or external service setup are required. This preview is local and has not been deployed.

## Completed work

- Added independent campaign Check Frequency (Balanced default), Dice Presentation (Key Rolls default), Interactive Dice (On), and Show DC (Off). Difficulty presets and all prior narrative/language settings are preserved. Hidden disables the latter controls while retaining saved preferences.
- Added **Game → Dice preview** and **Settings → Campaign settings → Rules & Play Style → Checks & Dice → Open dice preview**. The modal is clearly labeled “Demo roll — no campaign effects”; Hidden/non-important Key Rolls show narrative only, non-interactive rolls show compact results, and eligible interactive rolls show the d20 window.
- Built original faceted SVG dice with restrained CSS tumble/glow, neutral waiting, explained modifiers, eligible DCs, kept/discarded dice, totals/outcomes, and explicit animation replay. Five fixed fixtures cover ordinary success/failure, advantage/disadvantage, and a player check with no target supplied. No randomness, service call, private check data, or campaign mutations.
- Kept demo selections/completed sample state in memory across navigation. Added synchronous activation guards, timer cleanup, reduced-motion immediate reveal, final-result announcements, keyboard focus wrapping/restoration, and a portal so Game toolbar styles cannot affect the modal.
- Verified English/Russian on desktop and both 390px/320px widths. Added nine automated tests; updated the original Game smoke test to recognize the labeled demo. Documented the future validated/idempotent server-check contract in MASTER_SPEC section 35 and DEVELOPMENT_PLAN Phases 0–2 without implementing a backend.

- Added **Settings → Campaign settings → Rules & Play Style**, separate from application preferences. Campaign General retains campaign language and visual preferences; the old reading-panel difficulty selector was removed.
- Added Easy / Medium / Hard / Custom with centralized provisional values and Advanced controls: independent HP/damage, rerolls and conditional allowance, defeat, recovery, scarcity. Every difficulty edit selects Custom.
- Added independent Story Structure, Player Role, and World Autonomy choices with explanations and agency guarantees. Defaults are Medium / Balanced / One of many / Moderate. Clear preview wording explains that settings do not affect gameplay.
- Shared campaign-scoped state retains choices across navigation and interface-language switches; refresh resets defaults. Rules capabilities independently gate HP/damage controls and preset application. The illustrative James & Jinn rules profile supports both.
- Added English/Russian text, keyboard-operable tabs and radio groups, responsive layouts, and eight regression tests. Recorded prospective application, canon clarification, and future code-enforced mechanics in MASTER_SPEC section 33 and DEVELOPMENT_PLAN milestones 0–3. Future requirements are documentation only.

- Read the project specifications and inspected all seven supplied design references.
- Built a reusable charcoal-and-bronze application shell with literary headings, cinematic artwork, desktop sidebar, mobile bottom navigation, and a mobile menu.
- Added all eleven navigation routes: Campaigns, Game, Character, Inventory, Party, Journal, Map, Library, Gallery, Sessions, and Settings.
- Built the three-column desktop Game layout with narration, player replies, character resources, objectives, party, clues, and sticky action input.
- Added mock actions, OOC mode, personal notes, saved moments, and optional suggested actions.
- Built the character paper doll, equipment-slot details, character tabs, inventory search/filtering, and item descriptions.
- Added the fixed evidence board, clue details, quests, timeline, known people, locations, and notes.
- Added an illustrative map with selectable known cities, a temporary destination, and Region / Local diagrams.
- Added searchable sample documents, a sample version-history view, session recap, artwork gallery, and favorites.
- Added reading preferences, clear explanations for unavailable future features, keyboard focus styles, native modal dialogs, and missing-page handling.
- Added a Windows preview launcher, owner-facing README, verification notes, and fourteen HTTP smoke tests.
- Added a global English/Russian selector under Settings → General and a separate campaign language selector under Settings → Campaign settings for The Long Road West.
- Localized all eleven screens, navigation, tabs, filters, dialogs, accessibility labels, mock documents, item details, narrative samples, and map labels without duplicating routes or components.
- Added Russian search support and translated travel notices; preserved all user-entered text literally across interface language changes.
- Added four translation regression checks alongside the existing fourteen smoke tests.

## Files / areas changed

Final Checks & Dice refinement:

- `src/lib/campaign-settings.ts`: four independent preferences, defaults, actions, and choice definitions.
- `src/lib/dice-preview.ts`: player-visible fixed fixtures, arithmetic, display/DC policy, and guarded/cancelable animation lifecycle, separate from components and future resolution.
- `src/components/dice-preview.tsx`, `game.tsx`, `campaign-settings.tsx`, `preview-context.tsx`, `ui.tsx`: reusable modal/entries, controls, shared demo state, focus handling, and original SVG.
- `src/app/globals.css`, `src/lib/locales/ru.json`: responsive animation/presentation styles and Russian catalog additions. No packages or assets added.
- `tests/dice-preview.test.mjs`, `tests/preview.test.mjs`: nine regressions plus revised Game demo-entry smoke check.
- `MASTER_SPEC.md`, `DEVELOPMENT_PLAN.md`, `README.md`, `VERIFICATION.md`, `DEV_STATUS.md`: consolidated requirements, future runtime boundary, opening instructions, actual results, and limitations. Media-provider requirements and remote item-transformation documentation are preserved.

Focused Rules & Play Style refinement:

- `src/lib/campaign-settings.ts`: typed campaign settings, presets/defaults/bounds, rules capabilities, choice definitions, and pure state transitions.
- `src/components/campaign-settings.tsx`, `preview-context.tsx`, `screens.tsx`: campaign tabs, controls, shared temporary state, and separation from application preferences.
- `src/app/globals.css`, `src/lib/locales/ru.json`: responsive charcoal/bronze styling and Russian translations.
- `tests/campaign-settings.test.mjs`: eight regression tests; existing route and translation tests remain intact.
- `MASTER_SPEC.md`, `DEVELOPMENT_PLAN.md`, `DEV_STATUS.md`, `VERIFICATION.md`: requirement, phased plan, decisions, actual verification, and limitations. No dependencies or backend configuration changed.

Existing Phase 0 foundation, preserved by this refinement:

| Area                                                                                          | Purpose                                                                                                     |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `src/app/`                                                                                    | Next.js routes, layout, visual styles, icon, and missing-page screen.                                       |
| `src/components/`                                                                             | Shared UI, navigation, preview state, all screens, and the illustrative map.                                |
| `src/lib/mock-data.ts`                                                                        | Player-readable James & Jinn sample campaign records.                                                       |
| `src/lib/i18n.ts`, `src/lib/locales/`                                                         | Small translator, English-source/Russian message catalog, and contributor instructions.                     |
| `src/components/language-context.tsx`                                                         | Shared interface language, document language/title, and localized boundary text.                            |
| `src/components/preview-context.tsx`, `screens.tsx`                                           | Independent campaign language scoped by `campaign_id`; Settings → General and campaign controls.            |
| `public/art/`                                                                                 | Local copies of supplied artwork references used by the preview.                                            |
| `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`                                       | Frontend dependencies, scripts, reproducible dependency versions, and package-manager settings.             |
| `next.config.ts`, `next-env.d.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs` | Next.js, TypeScript, lint, and Tailwind configuration.                                                      |
| `.gitignore`                                                                                  | Excludes dependencies, generated builds, logs, and all `.env*` files.                                       |
| `tests/preview.test.mjs`                                                                      | Route, navigation, artwork, redirect, 404, and sample-dice smoke checks.                                    |
| `tests/i18n.test.mjs`                                                                         | Translation coverage, placeholder parity, safe fallback, literal interpolation, and untranslated UI checks. |
| `Start Preview.cmd`, `scripts/preview.mjs`                                                    | Starts the local preview or identifies an already running preview.                                          |
| `README.md`, `VERIFICATION.md`, `DEV_STATUS.md`                                               | Opening instructions, scope, checks, decisions, and current development status.                             |
| `AGENTS.md`                                                                                   | Adds the requirement to maintain this status file.                                                          |

The original `/design` images and `START_HERE.md` are unchanged. `MASTER_SPEC.md` and `DEVELOPMENT_PLAN.md` preserve the owner's preliminary media-model requirement (see documentation-only update below) and add Rules & Play Style. There are no database migrations or service integrations.

## Tests and build status

- `pnpm typecheck`: passed after the final Checks & Dice refinement.
- `pnpm lint`: passed with no warnings after the final Checks & Dice refinement.
- `pnpm build`: passed after the final Checks & Dice refinement; all eleven screen routes were statically generated.
- `pnpm test`: all **35 tests passed** against development and the rebuilt production preview: 14 HTTP checks, 4 translation checks, 8 rules tests, and 9 new dice/preference/lifecycle tests.
- Browser checks: navigation and key mock interactions passed on desktop and at 390 × 844 and 320 × 740 phone viewports. No page-wide horizontal overflow at 320px.
- Launcher: syntax and existing-server detection checked; server start verified.
- The restarted background development preview returned HTTP 200 for `/campaigns`.

Language refinement verification: both languages were checked across all eleven screens at desktop width; all eleven Russian screens fit a 320 × 740 viewport without page-wide overflow. The Russian Game screen was also visually checked at 390 × 844. Russian inventory/document searches, character tabs, equipment details, map views/destination, document history, independent preferences, literal notes/actions, and refresh reset passed browser checks. The optimized production build also passed its language-switch and navigation check. See `VERIFICATION.md` for the detailed checklist.

Rules refinement verification: browser checks passed for defaults; Easy/Medium/Hard application; independent HP/damage and automatic Custom; limited/unlimited allowance visibility; independent narrative choices and campaign language; keyboard tab navigation; client-navigation retention; and refresh reset. Reviewed English/Russian Settings on desktop and at 320px, plus Russian narrative cards at 390px. No page-wide horizontal overflow at either phone width. The final production preview retained Hard and Russian after Library → Settings. The temporary production server is stopped; development remains on port 3000. See `VERIFICATION.md` for the checklist.

Checks & Dice browser verification: both entries, neutral waiting, keyboard/button/die activation, 19-point success, 9-point failure, both kept-die cases, explicit replay, Escape during animation/reopen, focus wrapping/restoration, all presentation modes, conditional DC, retained Hidden preferences, and navigation retention passed. English and Russian page/modal widths were checked at 320px and 390px. Production confirmed waiting without a result/DC, the correct final announcement/result, and the existing note-dialog behavior. Physical devices and actual screen-reader speech remain unverified.

## Key technical decisions


- Dice settings extend the existing campaign object/dictionaries. Check frequency is a future runtime preference; it does not create checks in Phase 0. Presentation settings actively govern only the isolated demonstrator.
- Sample A is the requested 14 + 3 + 2 = 19 success. Sample B fails; C keeps the higher die; D keeps the lower die. Sample E has no DC in its client fixture at all. Authored outcomes do not impose universal natural-1/natural-20 rules.
- Fixture data, presentation policy, and animation lifecycle are separate. A roughly 1.15-second CSS animation presents fixed data; a synchronous guard blocks duplicate starts and disposal cancels pending callbacks. Reduced motion skips the timer/tumble. Native HTML/CSS/SVG and existing React are sufficient; no animation/3D/physics dependencies.
- Demo setup is expandable to keep Roll prominent. Replay is explicitly a replay of the same sample; completed samples remain available across navigation. Closing an unfinished animation leaves that sample unrevealed. No real reroll counters, character data, inventory, or transcript are changed.
- Future server validation, real dice, recorded results, idempotent check IDs, reroll authorization, and private-check isolation are documented only. Phase 1 will persist preferences; Phase 2 will resolve real checks before outcome narration.

- Rules & Play Style uses a typed object with `campaign_id`, rules capabilities, and independent difficulty, story structure, player role, and autonomy. Definitions/state transitions live outside React presentation. This is temporary state, not a game engine.
- Provisional tuning: Easy uses 0.75× HP/damage; Medium 1×/1×; Hard 1.5×/1.25×. Other values are explicit in MASTER_SPEC section 33. Custom retains current values. Preview bounds are 0.25–3× in 0.25 steps and 1–20 limited rerolls per session; these are not approved game balance.
- Unsupported HP/damage controls are disabled; preset/manual changes do not apply unsupported mechanics. The illustrative sample rules profile does not represent imported canon.
- Native radio groups, selects, sliders, details, and accessible tabs keep the UI lightweight. Both languages share components and stable state values.
- Future persistence/effective settings history belong to Phase 1; code-enforced mechanics and single-DM narrative guidance to Phase 2; continuity integration to Phase 3. Changes must be prospective and canon conflicts clarified. Recording these requirements does not authorize later phases.

- Next.js App Router, React, TypeScript, and Tailwind CSS; one frontend application with no external backend.
- Installed stable versions: Next.js 16.3.5, React 19.3.0, Tailwind 4.3.3. TypeScript 6.0 and ESLint 9 match the Next.js lint toolchain's supported ranges. Exact packages are in the lockfile.
- Shared React state keeps actions, notes, favorites, destination, and reading controls available across navigation. Refresh resets that state. No database or browser persistence is implemented.
- English source phrases serve as dictionary keys, with centralized Russian values and a small interpolation helper. No localization dependency or duplicated language routes/components were introduced.
- Both language choices default to English, survive client navigation, and reset on refresh. Interface language controls UI and static demo content. Campaign language is an independent mock preference for the selected campaign; persistence belongs to Phase 1 and AI behavior to Phase 2.
- User-entered notes, actions, and draft campaign names never pass through translation. OOC metadata is separate from message text. Tabs, filters, option values, and record IDs retain stable values independent of display language.
- HTML language and browser title follow the interface language. Language option names remain English / Русский so either language can be recognized.
- Node 24 runs translation tests directly against TypeScript; the package explicitly uses the existing ES module syntax. No dependency changes were needed.
- Campaign-scoped sample records carry `campaign_id`. The client contains only player-readable mock information; no DM-private dataset exists in this phase.
- Artwork loads locally through SVG windows into supplied mockups. UI controls are real HTML/SVG. System fonts avoid remote font requests.
- The world map uses a clean illustrative SVG so embedded reference labels do not duplicate live controls.
- New York is the current location. James is a 32-year-old private detective and level 3 human warlock; Jinn is his long-term partner. Additional details are illustrative, not imported canon.
- James & Jinn is the only connected sample campaign. Other worlds are labeled visual concepts.
- Free text is the main interaction. Suggested actions start off. No live dice results or AI responses are simulated as genuine gameplay.
- Preview servers bind to this computer's loopback address. The restarted development server runs independently in the background. Background logs belong outside `.next` so production builds can clear their output without a Windows file-lock error; `*.log` is ignored by Git.

## Known issues

- All dice examples are fixed demonstrations, not playable checks. Check frequency does not generate checks and the UI cannot adjudicate real actions. No server, account, database, or AI was introduced.
- Native keyboard focus wrapping, Escape, focus restoration, disabled animation controls, live-region content, and timer cancellation were checked. Actual screen-reader speech, operating-system reduced-motion switching, physical touch/Safari, and the phone software keyboard were not tested. Reduced-motion lifecycle behavior is automated-test covered and the CSS media rule was inspected; browser animation emulation was not used. Browser console logs were not separately captured for this final refinement.
- Narrow dice dialogs scroll vertically when necessary; horizontal page/modal overflow was checked at 320px and 390px in both languages. Demo selectors and controls remain reachable.

- Rules & Play Style has no gameplay effect. Numerical tuning is provisional, no reroll counters/resources are consumed, and no NPC simulation runs.
- Rules selections survive navigation but reset on refresh. Returning to Settings opens General; reopening Rules & Play Style reveals the retained selections. Advanced expansion can reset after leaving Settings.
- Only James & Jinn is connected. Unsupported-rules behavior is covered by pure state tests; Phase 0 has no rules-system editor or second playable campaign.

- Physical iPhone / Safari behavior and the software keyboard have not been tested; mobile checks used Chromium viewport sizes.
- Artwork and map geography are preview material. A later approved visual bible may replace these assets.
- The Evidence Board composition is fixed; card dragging and connection editing are outside Phase 0.
- Refreshing clears temporary interactions. Some screen-local controls also reset when leaving their screen.
- Both language choices reset to English on refresh; this is the intentional Phase 0 behavior. Campaign language does not affect story generation yet.
- Wording embedded inside supplied bitmap artwork (for example, street graffiti) is unchanged; live UI labels are translated.
- Local previews stop when their server process stops or the computer restarts. Use the launcher or ask to restart the server if the browser reports connection refused.
- Explicit owner approval of the visual direction is still pending.

## Remaining work

- Owner click-through and approval of the final dice/check refinement. No Phase 1 work is authorized or started.
- Real server check resolution and persistence remain future work under the documented phases. Validate assistive technology and physical mobile behavior during later authorized accessibility/device testing.

- Owner reviews the new Rules & Play Style controls and wording in either language; Phase 0 approval remains pending.
- Validate gameplay balance and supported rules-system behavior during separately authorized runtime work. Preview values are not final mechanics.

- Owner reviews the screens and approves the visual direction, or requests focused Phase 0 adjustments.
- Record any accepted adjustments and verification results here before another milestone-completion commit.
- Campaign persistence, authentication, editable documents and inventory, real story responses, server dice, long-term memory, backups, and image/video generation remain deliberately unimplemented.

## Recommended next step

Open **http://127.0.0.1:3000/game** and click **Dice preview** beneath the action input. Click the die or **Roll**; expand **Demo setup** to select A (success), B (failure), C (advantage), D (disadvantage), or E (no target supplied). To test display preferences, open **Settings → Campaign settings → Rules & Play Style → Checks & Dice**, change a setting, and click **Open dice preview**. Try non-important + Key Rolls, Hidden, Interactive Dice Off, and Show DC On. For Russian use **Application preferences → General → Interface Language → Русский**. Navigation keeps choices; refresh restores defaults. No setup or keys are needed. Owner approval remains pending; wait for a separate request before starting Phase 1.

## Documentation-only update — September 18, 2026

Recorded the owner's preliminary media architecture requirement in MASTER_SPEC section 32 and aligned DEVELOPMENT_PLAN milestones 4/5: independent FRAME/VIDEO provider/model defaults, manual per-generation choice, optional quality profiles, and spoiler-safe text-model prompt preparation before generation. Concrete integrations/models remain undecided; candidates are not claims of verified API availability. That documentation-only update changed no application code, dependencies, runtime integrations, or Phase 0 acceptance status, and did not rerun checks. Its remote commits are now integrated with the verified bilingual refinement; the verification results above apply to the current application. Both sets of changes are preserved. Phase 4/5 implementation still requires a separate owner request.

## Documentation-only update — Item transformations — September 18, 2026

Recorded the owner's requirement in MASTER_SPEC section 34 and DEVELOPMENT_PLAN Milestone 2: free-text gameplay can propose improvised item transformations, with server validation and atomic, retry-safe inventory changes. Ingredients may be consumed, components embedded, and tools retained; provenance must be recorded. Camp-stored materials are unavailable outside an active long-rest camp. Full crafting/alchemy interfaces and recipe systems remain deferred.

This update changes documentation only. No application code, schema, runtime behavior, or Phase 0 approval status has changed. Tests, typecheck, lint, and build were not rerun for this documentation-only update; prior verification results remain historical results, not verification of the future feature. Implementation requires separate authorization for Phase 2. Continue the currently authorized Phase 0 work; integrate these remote documentation changes before the next push without overwriting local work.

These remote documentation commits are integrated into the final Checks & Dice checkpoint. Item transformations remain section 34; the consolidated dice contract is section 35. The integration changed documentation only, preserving the application code verified by the 35-test/typecheck/lint/build runs above. No future item-transformation feature was implemented or tested.
