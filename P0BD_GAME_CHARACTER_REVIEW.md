# P0B + P0D — Game and Character owner review

Status: implemented and verified on `codex/playtest-game-character`, from accepted `c885dc357ab63ee32421679e881735750022172f`. Not owner accepted, not merged to main, and not integrated with the separate P0A opening fix.

## What to review

Open [the isolated local candidate](http://127.0.0.1:3114/campaigns), choose **Greenmarch — First Adventure**, then open **Game** and **Character**.

Game leads with the saved story, distinct player actions and the action box. **Latest moment** and **Your action** jump to the appropriate place. New narration follows the latest moment until the reader scrolls back. **FRAME & VIDEO · this scene**, **Combat & rest**, **Session & continuity**, and **Advanced · records & corrections** retain the existing controls below the play surface. Recovery and clarification messages remain visible; active combat/recovery and failed continuity reads expand their relevant secondary controls.

Character leads with Garrick's recorded name, description, Level 1, HP, stats and equipment. Click the equipped **Plain sword** or an item in **Possessions** to inspect it. **Character corrections** retains the manual editor. The full-body illustration is an explicitly labelled neutral placeholder, not Garrick's established appearance or a portrait of James. It does not invent species, features, class abilities or equipment. Approved character-art selection is not implemented by this presentation task.

The candidate has OpenAI/fal credentials removed and FRAME/VIDEO generation disabled. The existing owner application on port 3112 is unchanged. This preview is for visual review; do not send actions or save corrections before the separate P0A integration is reviewed. The unchanged pre-P0A campaign still displays its recorded missing-canon clarification and lacks a current location. This lane displays an opening supplied by the existing state contract; it does not create one.

## Fresh verification

- New component/rendering regression tests: **10 passed**. Real Game/Character components render persisted fixtures in EN/RU without providers or mutations. Coverage includes story/composer ordering, recovery, recorded-only character data/equipment, missing-state restraint, isolated-preview subscriptions and opt-in follow-latest behavior.
- Affected UI/records/media regressions: **85 passed, 0 failed, 0 skipped** (3,285.7778 ms). The ten new tests are included in this total.
- Complete repository invocation: **1,719 total; 1,692 passed, 26 failed, 1 skipped** (307,468.7203 ms). All 26 failures were HTTP connection refusals to the default, unused port 3000. Without changing code, the four HTTP test files were rerun with `PREVIEW_URL=http://127.0.0.1:3114`: **29 passed, 0 failed** (10,682.5801 ms). Thus every non-skipped test has passing evidence on the frozen candidate; this is not reported as a single clean full-suite invocation. The one existing hosted Supabase opt-in skip remains a skip.
- Next route type generation, nonincremental TypeScript check, repository-wide zero-warning lint and production webpack build: **passed**. Generated `next-env.d.ts` churn is excluded from the commit.
- Logs are local and ignored: `test-results/p0bd/focused-tests.txt`, `full-suite.txt`, `http-tests.txt`, `typegen.txt`, `typecheck.txt`, `lint.txt`, and `build.txt`.

## Browser evidence

Ordinary authenticated campaign routes were checked at **1440×1000** and **390×844** in EN/RU. EN uses read-only Garrick records in the owner's local database; RU uses existing synthetic records in the disposable rehearsal database. Only the disposable clone's language preference was changed and restored. Equipment and correction dialogs were opened without saving. No action, rest, end-session, save/load or media-generation operation was performed. There was no horizontal document overflow. Mobile requires ordinary vertical scrolling for the full character sheet. Viewport checks are not physical iPhone testing.

Screenshots and viewport measurements are saved under:

`C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0bd-ui-review/`

| Screen | Before, EN | After, EN | After, RU |
| --- | --- | --- | --- |
| Game desktop | `game-en-desktop-before.png` | `game-en-desktop-after.png` | `game-ru-desktop-after.png` |
| Game mobile | `game-en-mobile-before.png` | `game-en-mobile-after.png` | `game-ru-mobile-after.png` |
| Character desktop | `character-en-desktop-before.png` | `character-en-desktop-after.png` | `character-ru-desktop-after.png` |
| Character mobile | `character-en-mobile-before.png` | `character-en-mobile-after.png` | `character-ru-mobile-after.png` |

Russian interface labels are localized. Persisted descriptions, item names and profile-defined stat/resource keys retain their original language and meaning.

## Files and integration boundary

Presentation changes: `persistent-game.tsx`, `persistent-records.tsx`, `gameplay-composer.tsx`, `gameplay-turn.tsx`, new `character-artwork.tsx` and scoped `playtest-game-character.module.css`. Localization: `src/lib/locales/ru.json`. Tests: `tests/playtest-game-character-ui.test.mjs`. Documentation: this guide and the appended current status in `DEV_STATUS.md`.

No Adventure/bootstrap/runtime/provider, persistence, schema, migration, mechanics, dice, save/timeline, media authority, World Library or New Hero file is changed. There is no known P0A implementation-file overlap. The integrator must reconcile `DEV_STATUS.md` and any concurrently changed locale entries, then review the two lanes together. The original dirty checkout and accepted playtest checkout remain untouched. No new provider calls, real migrations, deployment or future lane were started.

Stop for owner/supervisor review.
