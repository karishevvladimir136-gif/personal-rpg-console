# P0BD Character correction — current owner review

Status: implemented and freshly verified on the same `codex/playtest-game-character` branch after `b667fbbb37179d7f37f18e47e66b922df0f0abfe`. Owner review pending. Game improvements are preserved; P0A remains separate. Main is unchanged.

## What changed

The hooded illustration is replaced with a simple articulated equipment mannequin. It has no face, hair, clothing, species or canonical appearance and remains clearly labelled non-canonical. The compact **Equipped** layout uses only the real slots.

**Equipment finding A:** the accepted New Hero Fighter template records exactly **Main hand / Off hand / Body**; richer slots were not being omitted. This correction adds none.

Character's stock labels now read **Starter Rules**, **XP Progression**, **Level 1** and **0 / 100**. Internal progression taxonomy remains behind **Progression details**. Stored profile IDs, thresholds, track records and owner-authored descriptions/labels are unchanged.

Clicking an equipped or possessed item first opens read-only name, description, known mechanics, quantity, owner/storage and equipped status/slot. Supported **Use, transfer or equip** gameplay actions are retained. The full existing correction form appears only after **Advanced · owner correction → Correct item record**. No editable record authority fields are exposed by default, and the correction validator/save semantics are unchanged.

## What to click

Open [the isolated production review](http://127.0.0.1:3114/campaigns/96c58937-efbd-472a-8c3a-5b2d3e3b9d1a/character).

1. Inspect Garrick's name, Level 1, HP 12 / 12, three supported equipment slots, possessions and XP 0 / 100.
2. Click **Plain sword** in equipment or possessions. Confirm read-only details appear first.
3. Open **Use, transfer or equip** to inspect the existing gameplay actions; do not execute them during this visual review.
4. Open **Advanced · owner correction**, then **Correct item record** to confirm the original tool is still available. Close without saving.
5. Open **Progression details** only if the internal track information is wanted.
6. Open Inventory and inspect Plain sword; it uses the same read-only first flow. Game retains the reviewed story/composer hierarchy.

This review has provider credentials removed and FRAME/VIDEO disabled. The existing owner application on port 3112 is untouched. P0A/migration 30 is not installed in this UI lane or the real database; Garrick's previously active empty Adventure is not silently repaired here. Do not send actions or save corrections for this visual review.

## Fresh final checks

- Actual Game/Character/Progression/Item component tests: **13 passed**.
- Focused component, public-record and foundation rendering checks: **30 passed**.
- Affected UI/records/media regressions: **117 passed, zero failures/skips** (4,681.1383 ms). Totals overlap.
- One complete final-candidate suite: **1,722 total; 1,721 passed, zero failed, one existing hosted-Supabase opt-in skip** (174,518.5281 ms).
- Route type generation, nonincremental TypeScript, repository-wide zero-warning lint and production webpack build: **passed**.
- HTTP tests used `PREVIEW_URL=http://127.0.0.1:3114`. The earlier baseline's default-port connection failures and later passing rerun remain historical evidence below; they are not substituted for the new clean invocation.
- Logs: ignored `test-results/p0bd-character/final-full-suite.txt`, `final-typegen.txt`, `final-typecheck.txt`, `final-lint.txt`, `final-build.txt`, `focused-iteration.txt` and `affected-tests.txt`.

## New screenshot evidence

Ordinary authenticated routes were checked at **1440×1000** and **390×844**. EN uses unchanged Garrick records; final RU uses existing Synthetic Mira records in the disposable rehearsal database, whose single Hand slot and Progression Off are genuine recorded differences. RU browser screenshots demonstrate localization and recorded-state restraint, rather than pretending to be Garrick's database. The deterministic EN/RU component fixtures additionally verify Garrick's three-slot/XP rendering. Final built-production EN desktop/mobile was separately confirmed.

Screenshot folder:
`C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0bd-character-correction/`

| View | Before reviewed b667 | Current correction |
| --- | --- | --- |
| EN Character desktop | `character-en-desktop-before.png` | `character-en-desktop-after.png` |
| EN Character mobile | `character-en-mobile-before.png` | `character-en-mobile-after.png` |
| EN item desktop | `item-details-en-desktop-before.png` | `item-details-en-desktop-after.png` |
| EN item mobile | `item-details-en-mobile-before.png` | `item-details-en-mobile-after.png` |
| RU Character desktop | `character-ru-desktop-before.png` | `character-ru-desktop-after.png` |
| RU Character mobile | `character-ru-mobile-before.png` | `character-ru-mobile-after.png` |
| RU item desktop | `item-details-ru-desktop-before.png` | `item-details-ru-desktop-after.png` |
| RU item mobile | `item-details-ru-mobile-before.png` | `item-details-ru-mobile-after.png` |

Additional evidence: `progression-en-mobile-after.png`, `owner-correction-en-desktop-secondary.png`, `owner-correction-ru-desktop-secondary.png`, `inventory-item-en-mobile-after.png`, `inventory-item-ru-mobile-after.png`, and `viewport-checks.json`. Desktop Character and normal item after-captures show the production build. Some earlier before full-page captures contain browser stitching artifacts and are not new implementation output. Mobile needs ordinary vertical scrolling; no horizontal document overflow was found. This is not physical iPhone testing.

**Preference/isolation note:** during before-review an older clone-labelled preview launcher lost parsed environment names/values during nested regex checking. A temporary RU preference therefore reached the original database. English was restored normally. The launcher was corrected locally, explicitly checked against the disposable URL, and subsequent Russian preference saves were verified on the clone only and restored. Both databases end in English. Language-preference audit writes are retained, not claimed absent. Garrick's pre/post gameplay fingerprint matches; no item/equipment correction or gameplay operation was saved. RU before captures from that launcher show Garrick; final RU after captures correctly show synthetic records, so compare layout/localization rather than their different stats.

## Files and stop boundary

This correction changes only:

- `src/components/character-artwork.tsx`
- `src/components/character-presentation.ts` (new display-only helper)
- `src/components/persistent-records.tsx`
- `src/components/playtest-game-character.module.css` (Character/item styles; Game rules unchanged)
- `src/components/foundation-loop/foundation-loop.tsx`
- `src/components/foundation-loop/progression.tsx`
- `src/components/foundation-loop/text.ts`
- `src/components/foundation-loop/foundation-loop.module.css`
- `src/lib/locales/ru.json`
- `tests/playtest-game-character-ui.test.mjs`
- `DEV_STATUS.md`
- this review guide.

No migration, authority, runtime, Adventure/bootstrap, provider, mechanics, storage/equipment persistence, Game behavior or save/timeline change. No automatic portrait or provider call. Custom owner content stays verbatim; only exact stock UI copy is aliased. The simple stand is placeholder equipment presentation, not a canonical portrait. Approved portrait selection and more slots are outside this correction.

P0A is committed separately at `52de33156f9abfed358a185eafeaeec2b7efe3d1`, with its own review guide and disposable migration-30 evidence. Neither branch is merged or integrated. Joint owner/supervisor review is the next step; no P0C, deployment, real migration/import or additional scope was started.

---

## Preserved earlier P0BD review and verification history

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
