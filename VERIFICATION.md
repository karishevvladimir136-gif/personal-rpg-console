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
