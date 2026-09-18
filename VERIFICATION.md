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
