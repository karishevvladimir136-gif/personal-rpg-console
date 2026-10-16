# Integration — Stage 4 + Stage V into one playable branch

Cloud session (`docs/CLOUD.md`, environment `rpg-console`). Goal: one branch the owner can play in the sandbox tonight.

1. Create `claude/integration` from `origin/claude/stage-4-dm`, then merge `origin/claude/stage-v-visuals`. The stages
   were split by file ownership, so conflicts should be few: `DEV_STATUS.md` (keep every section), possibly
   `game-screen.tsx` and `settings-screen.tsx` (keep both stages' blocks), and `docs/UI_DATA_NEEDS.md`.
2. **Migrations:** list every migration added by Stage 3, Stage 4 and Stage V. Names must be unique, apply in name order
   on a fresh PGlite database and on the Stage 3 synthetic switched campaign, and no migration may depend on one that
   sorts after it. If two collide, rename the later-dated one (it is not applied anywhere yet) and say so. Expected:
   Stage 3 `202610150054_record_integrity`, Stage V `202610160054_stage_v_pictures`, Stage 4
   `202610160055_stage4_dossier` and `202610160056_stage4_restore_defaults` — the names are unique; confirm the pictures
   migration does not need anything from 55/56 and that 56's restore defaults cover saves made before 54 too.
   **Save and restore across both stages:** a save made before migration 54, one made after 56, and one of a campaign
   with frames — each restores, and a loaded save shows its own turns' frames.
3. Stage V's branch history was squashed by its session (tip `3241ad1`); merge the current tip, not an older commit.
   Wiring between the stages: Stage V reads `finish_turn` scene kinds, focus and `playerMoment` from Stage 4's public
   turn; check that live frames, key-moment re-renders and the chronicle (with Stage 4's chapter titles and «Ранее в…»)
   work on the merged branch.
4. Checks: typecheck, lint, build; the full suite as `node --test --test-concurrency=2 tests/*.test.mjs`; fake bench
   green; recapture every screen (desktop and phone, both samples) with the overflow check.
5. A short live smoke on the merged code: 6 turns on Opus and 6 on Astra with live frames on, in a synthetic campaign —
   first word, full turn, frame delay, cost. Cap **$5**.
6. Re-run the sandbox proof from `docs/SANDBOX.md` on the merged branch (start, world, campaign, three turns, stop, start,
   continue) and make sure `Start Sandbox.cmd` and `docs/SANDBOX.md` match the merged code.
6b. **Only if the owner's launch message says so:** do the Stage V review fixes (`docs/stages/STAGE_V.md` §7) on the
   merged branch before steps 4–6, since the merged `game-screen.tsx` is the one to change.
6c. Leave the six pending Stage 4 DM Craft versions pending — the owner activates them himself in the sandbox.
7. Push `claude/integration` only, never `main`. Report in English: conflicts and how they were resolved, the migration
   order, check results, the smoke numbers, anything the owner must know before playing.
