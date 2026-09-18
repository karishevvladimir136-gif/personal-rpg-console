# Development status

Last updated: September 17, 2026.

Update this file before every milestone-completion commit and after any major architectural change. Record the actual verification results and remaining limitations. Never include secrets, API keys, credentials, or private DM content.

## Current milestone

**Milestone / Phase 0 — Static clickable UI shell.**

Scope: a private, single-user campaign preview with realistic James & Jinn sample data. No later milestone has been started.

## Current status

Phase 0 implementation is complete and ready for its repository checkpoint. The owner can explore the preview; explicit visual approval remains the product acceptance step and has not been recorded.

The local development server was restarted as a background process after the original preview stopped. It uses port **3000**, bound to **127.0.0.1**. Preview: **http://127.0.0.1:3000/campaigns**. The server must be running on this computer for that address to work.

No accounts, API keys, or external service setup are required. This preview is local and has not been deployed.

## Completed work

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

## Files / areas changed

| Area                                                                                          | Purpose                                                                                         |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/app/`                                                                                    | Next.js routes, layout, visual styles, icon, and missing-page screen.                           |
| `src/components/`                                                                             | Shared UI, navigation, preview state, all screens, and the illustrative map.                    |
| `src/lib/mock-data.ts`                                                                        | Player-readable James & Jinn sample campaign records.                                           |
| `public/art/`                                                                                 | Local copies of supplied artwork references used by the preview.                                |
| `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`                                       | Frontend dependencies, scripts, reproducible dependency versions, and package-manager settings. |
| `next.config.ts`, `next-env.d.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs` | Next.js, TypeScript, lint, and Tailwind configuration.                                          |
| `.gitignore`                                                                                  | Excludes dependencies, generated builds, logs, and all `.env*` files.                           |
| `tests/preview.test.mjs`                                                                      | Route, navigation, artwork, redirect, 404, and sample-dice smoke checks.                        |
| `Start Preview.cmd`, `scripts/preview.mjs`                                                    | Starts the local preview or identifies an already running preview.                              |
| `README.md`, `VERIFICATION.md`, `DEV_STATUS.md`                                               | Opening instructions, scope, checks, decisions, and current development status.                 |
| `AGENTS.md`                                                                                   | Adds the requirement to maintain this status file.                                              |

The original `/design` images and `START_HERE.md` are unchanged. `MASTER_SPEC.md` and `DEVELOPMENT_PLAN.md` now include the owner's preliminary media-model selection requirement (see documentation-only update below). There are no database migrations or service integrations.

## Tests and build status

- `pnpm typecheck`: passed again before the Phase 0 checkpoint.
- `pnpm lint`: passed again with no warnings before the checkpoint.
- `pnpm build`: passed again; all eleven screen routes were statically generated. The first checkpoint attempt found a Windows log-file lock; restarting the background server with logs outside `.next` resolved it.
- `pnpm test`: all **14 tests passed** against the production preview during implementation and again against the development preview before the checkpoint.
- Browser checks: navigation and key mock interactions passed on desktop and at 390 × 844 and 320 × 740 phone viewports. No page-wide horizontal overflow at 320px.
- Production browser console: no errors observed during the final review.
- Launcher: syntax and existing-server detection checked; server start verified.
- The restarted background development preview returned HTTP 200 for `/campaigns`.

See `VERIFICATION.md` for the detailed browser checklist. This file must be updated if any final commit checks fail or change these results.

## Key technical decisions

- Next.js App Router, React, TypeScript, and Tailwind CSS; one frontend application with no external backend.
- Installed stable versions: Next.js 16.3.5, React 19.3.0, Tailwind 4.3.3. TypeScript 6.0 and ESLint 9 match the Next.js lint toolchain's supported ranges. Exact packages are in the lockfile.
- Shared React state keeps actions, notes, favorites, destination, and reading controls available across navigation. Refresh resets that state. No database or browser persistence is implemented.
- Campaign-scoped sample records carry `campaign_id`. The client contains only player-readable mock information; no DM-private dataset exists in this phase.
- Artwork loads locally through SVG windows into supplied mockups. UI controls are real HTML/SVG. System fonts avoid remote font requests.
- The world map uses a clean illustrative SVG so embedded reference labels do not duplicate live controls.
- New York is the current location. James is a 32-year-old private detective and level 3 human warlock; Jinn is his long-term partner. Additional details are illustrative, not imported canon.
- James & Jinn is the only connected sample campaign. Other worlds are labeled visual concepts.
- Free text is the main interaction. Suggested actions start off. No live dice results or AI responses are simulated as genuine gameplay.
- Preview servers bind to this computer's loopback address. The restarted development server runs independently in the background. Background logs belong outside `.next` so production builds can clear their output without a Windows file-lock error; `*.log` is ignored by Git.

## Known issues

- Physical iPhone / Safari behavior and the software keyboard have not been tested; mobile checks used Chromium viewport sizes.
- Artwork and map geography are preview material. A later approved visual bible may replace these assets.
- The Evidence Board composition is fixed; card dragging and connection editing are outside Phase 0.
- Refreshing clears temporary interactions. Some screen-local controls also reset when leaving their screen.
- Local previews stop when their server process stops or the computer restarts. Use the launcher or ask to restart the server if the browser reports connection refused.
- Explicit owner approval of the visual direction is still pending.

## Remaining work

- Owner reviews the screens and approves the visual direction, or requests focused Phase 0 adjustments.
- Record any accepted adjustments and verification results here before another milestone-completion commit.
- Campaign persistence, authentication, editable documents and inventory, real story responses, server dice, long-term memory, backups, and image/video generation remain deliberately unimplemented.

## Recommended next step

Open **http://127.0.0.1:3000/campaigns**, click **Continue the story**, and review the screens on a wide and narrow browser window. After explicit visual approval, wait for a separate request to begin Milestone 1 from `DEVELOPMENT_PLAN.md`. Do not automatically add services or start the next phase.


## Documentation-only update — September 18, 2026

Recorded the owner's preliminary media architecture requirement in MASTER_SPEC section 32 and aligned DEVELOPMENT_PLAN milestones 4/5: independent FRAME/VIDEO provider/model defaults, manual per-generation choice, optional quality profiles, and spoiler-safe text-model prompt preparation before generation. Concrete integrations/models remain undecided; candidates are not claims of verified API availability. No application code, dependencies, runtime integrations, or Phase 0 acceptance status changed. No build/typecheck/lint/runtime tests were rerun for this documentation-only update; earlier results above belong to the prior implementation checkpoint. The implementation agent must integrate these remote documentation changes with any ongoing local language/settings changes without overwriting either. Phase 4/5 implementation still requires a separate owner request.
