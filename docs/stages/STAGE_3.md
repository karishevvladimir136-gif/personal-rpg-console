# Stage 3 — record integrity and campaign limits

Branch: `claude/stage-3-records` from `claude/stage-2b-speed`. First commit: this file and the current
`docs/REBUILD_PLAN.md` from `origin/claude/handoff`. A UI session (stage 5) runs in parallel in its own worktree on
`claude/stage-5-ui`; do not touch `src/components/**` or `src/app/**` beyond the minimal hooks named below, and never
touch that worktree.

Goal: the database itself guards the invariants of the new turn loop, so no code path — a bug, a retry, a future tool —
can corrupt a campaign. Campaign limits become settings. Old turns, saves and branches keep working, and an existing
campaign can be switched to `dm-loop-v1` safely. Logic stays in TypeScript; SQL only applies and guards (CLAUDE.md §5).

## 1. Invariants in SQL (additive migration)

Enforce with constraints where possible (CHECK, UNIQUE, FK, exclusion), otherwise with a guard inside the commit function
that fails with a clear error code — never by re-implementing game logic:
- item quantities ≥ 0; money / currency balances ≥ 0 for every holder;
- HP and named resources within their stored bounds (respect whatever the ruleset stores, e.g. temporary HP);
- a quest reward is claimed at most once (unique per quest and reward), including the "paid via money transfer" settlement
  added in stage 2;
- every record a commit touches belongs to the campaign and the timeline/branch of the operation; revision checks hold;
- operation IDs stay unique; a committed operation cannot be committed again.
Write tests that bypass TypeScript and try to violate each invariant directly in SQL on PGlite — every attempt must fail.
Add a bench scenario "invariant attack": a scripted model that tries double rewards, negative money, item duplication via
split/transfer, HP overflow, writes to another campaign's IDs. Expected: calls rejected with reasons, turn commits,
state intact.

## 2. Campaign limits as settings

Move the stage 2 limits module to campaign settings with generous defaults: money granted per turn, items created per
turn, new characters per turn, time advanced per turn, tool calls and model requests per turn. Validation reads them from
the pinned operation. Expose them through the existing settings API; the only UI in this stage is a minimal block in the
existing campaign settings panel (the new UI comes from stage 5).

## 3. Compatibility

- Old `astra-primary-v1` turns, saves, branches and rewinds load and display exactly as before.
- Saves made on `dm-loop-v1` include everything the new loop writes (new characters with Character Models, places,
  holdings, quests and reward claims, private patches, receipts) and restore it exactly; load → continue → the same NPC,
  no duplicates (bench scenario 06 stays green).
- Switching an existing taken-over campaign to `dm-loop-v1`: build a synthetic long campaign on the old runtime
  (reuse fixtures; dozens of turns, saves, a branch), switch it, play several new-loop turns, rewind to a pre-switch save,
  continue on each runtime. History intact, no data rewritten.
- Leave a written procedure in `docs/RELEASE_CHECKLIST.md` for stage 6 (dump, apply migrations to a copy of the owner's
  database, smoke play, switch campaigns) — do not run anything against the owner's database.

## 4. Small leftovers from stage 2b

- Astra at medium puts `finish_turn` in a round of its own: fold it into the last tool round if the provider allows.
- The owner's Character Model correction path still uses the old SQL bounds: align it with the relaxed bounds.

## 5. Checks

typecheck / lint / test / build; fake bench 12 of 12 plus the invariant-attack scenario; old Astra bench unchanged.
A short paid smoke run is allowed only if something changed on the live path: **$2 cap**.
Report in English: invariants and how each is enforced, limits as settings, compatibility results, what stage 6 must do.
Update the top of `DEV_STATUS.md`. Do not start stage 4. Nothing to `main`.
