# Phase 1 verification — September 18, 2026

Phase 0 approval remains fixed at 96b69dcd63d2fa015f5e75bcc5d632c41e04369e. The earlier implementation checks below are historical, not an independent review. The owner separately reported 41 logic/localization tests, 5 HTTP tests and 14 HTML/status route checks plus typecheck/lint/build; that review did not include visual or image-asset verification.

## Integrated implementation checks

The lead integrated all three workers' commits into main, preserved their separate ownership, and safely merged concurrent remote documentation through f46014d. The merged scope includes Chat with DM and only the Phase 1 source-history foundations of the memory contract. No Phase 2/3 runtime, deployment, model call, real campaign import or paid service was used.

Typecheck, lint, production build and the development/production test suite are run on the integrated tree. Final counts and the current status are recorded in DEV_STATUS.md. Focused coverage includes actual migrations/RLS/SQL constraints in PGlite with explicitly synthetic auth roles, two unrelated campaigns, immutable history/restore, stale revisions, idempotent retries, global/campaign settings separation, shared inventory integrity, private marker isolation, feedback/guide isolation and no gameplay mutation, database restart/serialization, pagination beyond 1,000 records, source ordering/correction history, failed file reads, navigation draft guards, localization, HTTP access/origin/status checks, and preserved preview regressions.

The database engine test is real PostgreSQL SQL execution with test-only auth stubs. It is **not Supabase Auth/PostgREST or signed-in application verification**. The live disposable Supabase suite is explicitly skipped without its opt-in configuration. Missing environment configuration, Docker/Supabase CLI and a local instance prevent that acceptance step.

## Browser observations in this Phase 1 run

- The unconfigured application redirects to the honest Setup screen; its isolated preview link opens the approved main menu.
- English/Russian preview settings, main menu, campaign selection, Continue the story, Game and mobile navigation were exercised through real UI controls.
- Russian Game and mobile menu were inspected at an observed 390px viewport; setup was inspected at 320px. No horizontal page overflow in those checks. Setup and Russian Game screenshots were visually inspected.
- Signed-in campaign creation, editor saves, DM feedback/Guide restore, cookie expiration/relogin, and full persistent desktop/mobile flows were **not** browser-tested because Supabase is unconfigured. Form/model/SQL tests do not substitute for those flows.
- Physical iPhone/Safari, software keyboard and screen-reader speech remain unverified. Earlier full Phase 0 visual checks are retained below but were not repeated wholesale.

## Remaining acceptance gate

Follow SUPABASE_SETUP.md against a disposable local target, apply every migration in order, configure the one owner with public signup disabled, then run the opt-in real integration and application/browser checklist. Check two unrelated campaigns, explicit guide/message saves, reload/relogin, restore-new-version, failed input retention, direct unauthenticated/non-owner requests and preview isolation before entering real campaign data. Phase 1 owner approval remains pending; do not deploy or start Phase 2.

---

# Phase 0 verification

Checked on September 17, 2026.

## Automated checks

- TypeScript typecheck: passed.
- ESLint: passed, no warnings.
- Optimized Next.js production build: passed; all eleven screen routes are statically generated.
- 18 automated tests: passed against development and production (14 HTTP smoke checks plus 4 translation checks for coverage, parameters, fallback, and untranslated UI text).
- Windows launcher's Node script: syntax checked and existing-server detection checked.
- Git whitespace check: passed. Original design references are unchanged. The owner's concurrent documentation-only media-planning updates to the product specifications are preserved. `AGENTS.md` includes the owner's development-status maintenance rule.

## Browser checks

Tested in the Codex in-app Chromium browser at desktop widths and 390 × 844 / 320 × 740 phone viewports.

- All eleven screens opened through the navigation. No horizontal page overflow at 320px.
- Campaign Continue opens Game.
- Sending a typed action adds it to the story as a preview action.
- Saving the sample scene makes it appear in Gallery → Favorites across navigation.
- Adding a Game note makes it appear in Journal → Notes across navigation.
- Inventory category filtering and item-detail dialog work.
- Map selection changes the detail card; Set destination confirms a temporary plan without starting travel.
- Larger story text changes narration to 22px; suggested actions become visible on Game.
- Character paper doll, Journal evidence cards, local artwork, desktop columns, mobile navigation, and sticky input visually inspected.
- Dialogs use native modal focus containment, Escape handling, accessible titles, and return focus to the opener.

During development, caught and fixed duplicated map labels, cropped character art, and a Next.js smooth-scroll warning. Development hot-refresh notices are not production errors.

Before the Phase 0 checkpoint, typecheck, lint, and all fourteen smoke tests passed again. A build initially hit a Windows lock on the background server's log file inside `.next`. Moving background logs outside the build directory resolved the lock; the production build then passed, and the development preview was restarted on port 3000.

## English/Russian refinement

Completed September 17, 2026, before Phase 1. Final typecheck, lint, optimized build, and all 18 tests passed. No localization dependency or backend was added.

- All eleven routes rendered in both languages through the same navigation and components at 1280px desktop width.
- All eleven Russian screens fit 320 × 740 without page-wide horizontal overflow. Russian Settings at 320px and Game at 390 × 844 were visually inspected.
- Interface Language changed navigation, headings, controls, accessible names, dialogs, and mock content. `html.lang` followed the selection; the browser title remained translated across navigation.
- Campaign Language changed independently of Interface Language, remained selected across navigation and interface switches, and did not change the story or UI. Both choices reset to English after refresh as documented.
- Narrative-style selection retained its value when the interface switched languages while Settings remained open.
- Russian inventory and library searches returned the expected translated records. Item details, equipment slots (including Empty), all character tabs, and document version history worked in Russian.
- All three map views had translated labels. Selecting San Francisco and setting a destination displayed a complete Russian confirmation.
- A note containing the exact dictionary key `The Letter` remained literal. A mixed English/Russian player action remained unchanged when switching back to English, while its OOC prefix translated correctly.
- The missing-page screen remained translatable. A server-rendered boundary passes its message keys to the shared translation component; the original 404 smoke check passes.
- Production Settings switched to Russian and navigation to Game preserved that language. No production browser warnings or errors were observed.
- The development preview was restarted and left on **127.0.0.1:3000**; the temporary production test server on port 3001 was stopped.

The catalog contains 555 English-source/Russian pairs. Original words painted into supplied artwork remain unchanged. Automated checks cover dictionary use and mock fields; visual translation review and physical-device checks remain owner acceptance work.

This is viewport testing, not a test on physical iPhone hardware. The phone software keyboard and Safari-specific behavior still merit owner testing when a hosted preview is introduced. Owner approval of the visual direction remains the acceptance step.

## Campaign Rules & Play Style refinement

Completed September 17, 2026. Final `pnpm typecheck`, `pnpm lint` (no warnings), and `pnpm build` passed. All **26 tests passed** against development on port 3000 and the final production build on port 3001: 14 existing HTTP smoke checks, 4 existing localization checks, and 8 new campaign-settings regression tests.

Automated coverage checks exact defaults and preset values, individual difficulty changes selecting Custom, Custom retaining prior values, independent narrative axes/campaign language, rules capabilities for HP and damage, invalid numeric inputs, retained inactive reroll allowances, and translated choice labels/descriptions.

Browser checks performed on the actual UI:

- Campaign General and Rules & Play Style are separate from Application preferences. Home and arrow keys move/select campaign tabs.
- Medium / Balanced / One of many / Moderate appear on first load and after refresh.
- Hard produces 1.5× HP / 1.25× damage, disabled rerolls, death possible, restrictive recovery, scarce resources. Easy and Medium restore documented values without changing narrative choices.
- Raising HP selects Custom and leaves damage unchanged; raising damage separately leaves HP unchanged.
- Limited rerolls exposes allowance; unlimited hides it. Choosing 5/6 works as temporary settings without generating rolls.
- Sandbox / Chosen one / High and custom HP/damage/allowance survive Library → Settings. Returning opens General; reopening Rules & Play Style reveals retained selections.
- Campaign language remains independent of interface language. Russian renders new choices/descriptions, preserving state after a language switch.
- English and Russian layouts fit 320 × 740 without page-wide horizontal overflow. Russian narrative/autonomy cards were also visually inspected at 390 × 844. Desktop styling preserves charcoal/bronze panels and literary headings.
- Refresh resets temporary settings and interface language. The final production browser retained Hard and Russian across Library → Settings.

The temporary production server was stopped. Development remains **http://127.0.0.1:3000/settings**. Rules-system incompatibility is tested in pure state transitions; the connected sample uses both HP and damage and has no rules-system editor. No physical Safari/iPhone testing was performed. Numerical tuning is provisional, settings have no gameplay effect, owner approval is pending, and no later phase has begun.

## Final Phase 0 — Checks & Dice

Verified September 17, 2026. `pnpm typecheck`, `pnpm lint` (no warnings), and the optimized production build passed after the final code changes. All **35 tests passed** against both development (3000) and production (3001): 14 HTTP smoke tests, 4 translation tests, 8 earlier campaign-setting tests, and 9 new checks/dice tests.

Automated regression coverage:

- Default Balanced frequency / Key Rolls / Interactive On / Show DC Off; preference edits preserve difficulty and all narrative fields, and presets preserve dice preferences.
- Full presentation × importance × interaction matrix, private visibility suppression, Show DC eligibility, undisclosed-target omission, and retained preferences while Hidden.
- Fixed sample arithmetic, both higher/lower kept results, authored outcomes without invented natural-1/natural-20 rules, and unchanged fixture data.
- Repeated activation schedules one reveal; another presentation requires explicit replay. Close/dispose cancels timers, and a stale queued callback cannot reveal the reopened sample. Reduced motion schedules no animation timer. Completed samples can reopen without another roll.
- Every data-driven fixture/setting label and description is present in English/Russian; the existing UI AST/catalog checks include the new components and accessible names.

Manual browser checks (Chromium via the in-app browser):

- Both entry points work: Game → Dice preview beneath the composer and campaign Rules & Play Style → Checks & Dice → Open dice preview.
- Waiting shows the skill/action/modifiers and neutral dice, with no outcome or result announcement. Show DC Off omits the target. Roll works via keyboard and die click; both activation controls are disabled during the animation.
- Sample A reveals 14 + 3 + 2 = 19, success. Sample B reveals 6 + 1 + 2 = 9, failure. C shows 6/16, keeps 16, total 21. D shows 17/7, keeps 7, total 11. Result and narrative appear only after the animation; the final live region contains the total/outcome, not frame updates.
- Explicit replay starts the same sample animation. Escape during replay cancels it; reopening is neutral and no stale result appears. Closing restores focus to the opener. Tab/Shift+Tab wrap inside the modal after the focus-boundary fix; Continue receives focus after reveal. The existing Take note modal still opens/closes and restores opener focus.
- Full RPG leaves Medium and the narrative defaults unchanged. Key Rolls + non-important shows only narrative. All Player Rolls displays non-important checks. Interactive Off shows an immediate compact result without die/Roll controls.
- Show DC On displays disclosed targets; sample E supplies no DC and never displays one. Hidden shows only a sample narrative with no dice, target, result breakdown, or modifier panel. Its disabled switches retain their saved values and work again when presentation changes.
- Settings and the completed/selected sample survived Settings → Game and English → Russian. Refresh restores preview defaults. No demo consequence was added to the story, character, inventory, or reroll allowance.
- English and Russian were reviewed at desktop, 390 × 844 and 320 × 740. Game's original toolbar styles no longer hide the modal SVG on phones because the dialog is portaled outside the toolbar. Page and modal scroll widths showed no horizontal overflow after each resize settled. Narrow dialogs scroll vertically; controls and long Russian labels remain reachable. The Russian Close action uses a separate key from relationship “Close.”
- Final production verification confirmed a neutral initial window with no result/DC, keyboard die activation, correct 19-point result/live-region text, Continue, and existing note-modal behavior. The temporary production server was stopped; the development preview remains on **127.0.0.1:3000**.

Not verified: actual screen-reader speech, operating-system reduced-motion preference switching or browser media emulation, physical iPhone/Safari/touch/software keyboard, and separate console-log capture for this refinement. Reduced-motion behavior was verified in the lifecycle tests and its CSS media rule inspected. Rapid duplicate activation is covered by the controller regression test; browser checks verified disabled controls while rolling. No real dice, AI, backend, persistence, or rules-engine behavior was tested or implemented. Owner approval of Phase 0 remains pending.

Remote documentation-only item-transformation requirements are preserved alongside the checks contract. Those future Phase 2 capabilities are unimplemented and are not covered by the above application tests.

## Consolidated Phase 0 refinement — September 17, 2026

This section supersedes earlier opening/navigation instructions; earlier verification sections are historical. Owner Phase 0 approval remains pending.

Automated verification:

- `pnpm typecheck`: passed.
- `pnpm lint`: passed without warnings.
- `pnpm build`: passed, including app-level routes, scoped campaign screens, legacy redirects and campaign-root redirect. The final build includes the Russian conversation-starter wrapping fix.
- `pnpm test`: **49 passed** against development and production. Breakdown: 19 HTTP, 4 dictionary/source localization, 8 difficulty/rules, 9 dice/presentation/lifecycle, 9 consolidated-refinement tests.
- HTTP checks cover the three navigation levels, all screens and local artwork, legacy redirects, campaign-root continuation, unknown/concept campaign rejection, reachable Game Rest/dice entries, and direct Camp starting closed.
- New pure-model tests cover campaign URL identity; shared/scoped equipment and storage references; absent/no-equipment entities; deposits versus camp-only withdrawals and cargo proximity; invalid quantities and cross-campaign rejection; sample camp transitions without inventory mutation; zero-capable separate costs and Custom behavior; independent/eligible conversations; recipe access, recipients, insufficiency and unchanged stock; translated data-driven content; and the image demonstration's lack of provider/network/persistence code.
- Existing dice tests still cover fixed arithmetic, higher/lower kept die, private-check/DC filtering, setting independence, duplicate activation, cancellation and reduced-motion scheduling. Unit tests do not substitute for the React/browser checks below.

Browser checks (performed through the browser UI, not claimed as automated test-suite coverage):

- Main menu has only Campaigns, General Settings and Exit. Exit explains the missing sign-out without closing/clearing anything. Selection → Continue opens the scoped Game route; campaign sidebar/bottom navigation is absent outside campaigns. Mobile menu links reach all original screens.
- Desktop item grids and player paper doll reviewed visually. Item click/keyboard focus, short tooltip, expanded amulet history, separated mechanics/flavor, quantity/owner/storage and image explanation/local demo/restore all checked. Focus returns to the invoking item.
- Remote notebook deposit shows an unchanged-inventory sample outcome. Closed-camp stash transfer/use/equip are disabled. Active camp enables the spare-coat previews; cargo remains unavailable. Companion inventory from Camp selects Jinn's shared belongings.
- Party → Jinn accepts literal English/Russian player text and retains it in Camp. Starters populate free text. Goran Talk/Inventory are disabled. Food/drink Talk uses the same history and additional optional starters without a reply.
- Unsafe sample prevents entry; quiet sample enters. Short Rest shows no stash supply availability and causes no recovery/unlock. Long Rest lists participants and stash supplies; completion closes access and reports no real changes. Leave returns to Game without recovery.
- Grilled meal and coffee are available; stew shows missing vegetables. Selected recipients appear in the simulated preparation outcome. Provisional bonus, one-meal/one-drink limits, after-rest activation/expiry, separate preparation/consumption and no-cost-rest caveats are visible.
- Long-rest cost 0 selects Custom, preserves other settings and remains after Library → Campaign Settings. Campaign Language changed independently while the interface remained English. Interface Russian switches app/campaign labels without translating entered messages.
- React dice regression caught during the state refactor: unstable setter identity cancelled the reveal timer. Fixed with stable campaign-store callbacks. Development and production now reveal 14 + 3 + 2 = 19; production keyboard Enter activation and Hidden narrative-only presentation also passed.
- Nested dialog regression caught: Escape in an item detail also closed its stash parent. Stop propagation now keeps Tab/Shift+Tab in the top dialog; first Escape restores item focus inside stash, second Escape closes stash. Confirmed in browser.
- Desktop and 390px/320px layouts reviewed. All ten sidebar campaign screens plus Camp fit Russian 320px without page-wide horizontal overflow. General Settings also fits. Camp/cooking, companion conversation, transfer and item-image dialogs checked at phone widths. Long food-conversation starters originally caused 15px internal overflow at 320px; wrapping fixed it, and dialog scroll width now equals client width (256px) for conversation and nested item/stash dialogs. At 390px cooking dialog widths were 326px with no horizontal overflow.

Limits of verification:

- Real gameplay, access security, persistence, AI, provider calls, item transfer effects, buffs and server dice do not exist and were not tested as implemented features.
- No second playable campaign is provided. Isolation is covered by invalid/other-ID model tests and HTTP rejection of unknown/concept routes.
- Actual screen-reader speech, OS-level reduced-motion switching, physical iPhone/Safari and software keyboard were not tested. Reduced-motion dice behavior is unit-tested; camp CSS removes its animation under the preference. Browser console logs and a network trace were not separately collected. The image action code has no provider/network path.
- Full-page screenshot stitching produced duplicate fixed/sticky regions; visual assessment used normal viewport screenshots and DOM width measurements instead.
- Development remains on loopback port 3000. Temporary production verification uses port 3001 and is stopped after verification. Changes remain temporary; refreshing resets languages and closes demo camp.

## Combat View refinement — September 17, 2026

Owner approval remains pending. Phase 1 has not started. This section records the final combat refinement; previous sections remain historical.

Automated verification:

- `pnpm typecheck`: passed. `pnpm lint`: passed without warnings.
- Final `pnpm build`: passed; 26 prerender entries plus the validated campaign-root redirect. No API or combat route was added.
- `pnpm test`: **60 passed** against development and the final production build on port 3001. Existing 49 checks retained, plus 11 combat tests.
- Combat coverage: enter/exit/withdrawal/reset and campaign-state isolation; valid targets/costs and immutable reducer inputs; reserve/resolve once, repeated/stale confirmation/turn/completion guards; all Hidden/Key/All × interactive combinations across each Check Frequency; missing public target and no enemy roll payload; direct companion control, guard/position transitions, healing/resource caps; literal proposal text and no interpreted effect; full victory/injuries/one-time demo loot; data-driven Russian text. Game HTTP smoke also verifies the entry is present and combat starts closed.
- Existing dice controller tests retain animation double-activation, cancellation/unmount and reduced-motion coverage. No actual rules engine, backend, AI, server dice or persistence is implemented/tested.

Browser verification through real UI interactions:

- English desktop: internal Game entry, active versus inspected participant, action/eligible target/cost confirmation, fixed 14 + 4 = 18 roll and public breakdown, active-turn budget, qualitative enemy health, James/Jinn turns, scripted enemy response, return to round 2, tonic healing limited to max HP and bonus-action cost.
- Escape during an unfinished animation leaves damage unapplied and the action reserved. Resume uses the same sample. Review/replay leaves exactly one action history entry and one spent action. Continue restores focus to Review sample roll; Exit restores Preview Combat focus. A focus fallback was added because Confirm disappears after reservation.
- Literal English/Russian proposal preserved spaces, newline and `<test>` as text, with a labeled authored response and no resource effect. Existing unsent normal Game draft survived entering/exiting combat in production.
- Full Hidden-mode encounter: no modal or roll details; public damage still appears. James/Jinn defeated the lookout, the remaining sentry injured Jinn, party finished the sentry, and victory summary retained 15/18 Jinn HP with four spent actions and one charge. Demo loot became disabled after one collection. Withdrawal summary grants no loot and retains existing injuries; return restores unchanged campaign HP/pact resources.
- All Player Rolls + Interactive Off + Show DC On: immediate compact result with no manual Roll control, no invented target number. Key Rolls interactive remains the default. Generic skill-check preview still reveals the original 19-point persuasion sample in production; combat did not replace its fixture/state.
- English 390px and Russian 390px/320px layout checks: primary scene/actions, accessible party/history switches, inspected Jinn while James remains active, no-art interaction, controls and action confirmation. Russian 320px page scroll width equals client width (305px); dice dialog width/scroll width both 256px. Russian history and summary have no horizontal overflow. Keyboard Enter resolves the Russian production dice sample; Tab from the final replay button wraps to Close. Russian desktop and reset were also checked.
- Screenshots reviewed at desktop and narrow phone widths. No per-action artwork is generated. CSS disables combat feedback animation for reduced motion; the shared dice lifecycle has automated reduced-motion coverage.

Verification limits:

- Physical iPhone/Safari, real touch/software keyboard, actual screen-reader speech and OS-level reduced-motion switching were not tested. Separate browser console/network tracing was not performed.
- Enemy actions are a grouped, explicitly triggered sample; no private roll or DM data exists. Demo HP, costs, conditions and loot are provisional and cannot prove real D&D mechanics.
- Navigation/refresh discards combat; campaign settings still retain their existing temporary navigation behavior. No deployment was made. Development preview remains on loopback port 3000; temporary production verification is stopped after use.
