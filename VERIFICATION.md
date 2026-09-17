# Phase 0 verification

Checked on September 17, 2026.

## Automated checks

- TypeScript typecheck: passed.
- ESLint: passed, no warnings.
- Optimized Next.js production build: passed; all eleven screen routes are statically generated.
- 14 HTTP smoke tests: passed (all screen routes, local navigation, referenced art files, home redirect, 404, no invented live dice results).
- Windows launcher's Node script: syntax checked and existing-server detection checked.
- Git whitespace check: passed. Original design references and product specifications are unchanged. `AGENTS.md` now includes the owner's development-status maintenance rule.

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

This is viewport testing, not a test on physical iPhone hardware. The phone software keyboard and Safari-specific behavior still merit owner testing when a hosted preview is introduced. Owner approval of the visual direction remains the acceptance step.
