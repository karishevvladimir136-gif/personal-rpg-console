# Astra takeover + live UI/media ordered integration

**Status:** Isolated owner-review candidate. This branch starts at the reviewed Astra World Logic takeover commit `3d5768aed99cb30a1631cd892efc2cdf49e4f320` and merges the exact accepted UI candidate `312b2647cb7f1407426d177a26dacee0233a439f`. It has not been merged to `main`, applied to the owner database, or activated in the owner app.

## Migration order and authority

The committed migration filenames remain in order:

1. `202610060039_astra_world_logic_takeover.sql` — private, save-aware Astra takeover authority from the reviewed takeover branch.
2. `202610060040_standalone_visual_jobs.sql` — bounded entity/item/location image jobs through the existing media lifecycle from the accepted UI branch.

No migration was renumbered. The media migration does not change takeover routing, gameplay validation, Memory, or World Lab authority. Its image drafts remain review-only until the owner explicitly accepts them. Acceptance of an image and approval as a visual reference are separate actions. Generated pixels establish no gameplay or Canon fact.

## Small entity avatars

The shared `SubjectAvatar` renders an accepted safe public entity visual where one exists and falls back to the existing initial/icon otherwise. It is used for Game player/companion speaker avatars, Game traveling companions, Party cards, and the campaign-card hero. Rendering does not request generation, expose private Character Model fields, or show unaccepted draft pixels. The full Character portrait behavior is unchanged.

Approved visual references currently supply **approved textual visual guidance** only. Their image pixels are not yet sent to the image model. Pixel conditioning and broader visual consistency are separate future work.

## Merge resolution

The only merge conflict was the top of `DEV_STATUS.md`, where each reviewed branch added a milestone status. Both historical status sections were retained in their original order with a separator. The takeover migration and runtime files had no overlapping UI-branch changes. The integration adds only the avatar closure and reproducible ordered migration coverage beyond the two reviewed candidates.

## Verification

The exact committed 38→39→40 sequence was installed in disposable PGlite. A populated 39→40 upgrade preserved RPG table fingerprints and an existing save. Focused migration 39/40 tests passed **11/11**; combined migration 35–40 regressions passed **55/55**. Focused takeover, Saves/Timelines and World Lab tests passed **63/63**. Avatar/UI selection and rendering regressions passed **26/26**, including a newer draft reference coexisting with an older accepted image and an approved mock reference coexisting with accepted real pixels. The final complete repository suite passed **2,000/2,001**, zero failures and one existing skip. Route type generation, TypeScript, repository ESLint with zero warnings, and the production webpack build passed. The original `/preview` and synthetic `/preview/live-ui` routes remained buildable; the latter returned HTTP 200 on an isolated test server. All database tests used disposable databases. No model, image, or media provider call occurred.

## Activation boundary

The owner database has not received migrations 39 or 40. The owner campaign, unfinished encounter, app activation, and deployment are unchanged. Owner review and a separate, ordered real-database activation decision are required before this branch can affect live play.
