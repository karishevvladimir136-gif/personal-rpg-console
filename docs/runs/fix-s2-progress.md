# Fixes after session 2 — progress (the whole run, stages A → B → D → C → E → F)

The run's instruction: `docs/stages/FIX_S2_RUN.md` (copied from `claude/handoff` with `FIX_S2_AB.md`, `FIX_S2_CDEF.md`
and `FIX_S2_PLAN.md`); the owner's notes: `docs/runs/session2-owner-notes.md` on `claude/handoff` (not copied).

**Branch:** `claude/session2-fixes-a-f-jh3krk` — the cloud session's own branch (the session may push only there; the
run's instruction names `claude/fix-s2`, so the work is on this branch instead, as `docs/CLOUD.md` allows). Based on
`origin/claude/session-2-prep` at `d74b6c6`, with `origin/claude/stage-fix-turn-lease` (`fb40961`) merged first.

**Money:** the ledger `docs/runs/fix-s2-ledger.md` (cap $50; A+B within $30), guarded by
`scripts/eval/real-replay/lib/ledger.mjs` (`fixs2`).

## Done

- Setup: the branch, the lease-renewal branch reviewed and merged (migration 71: every dm_tool, checkpoint, commit and
  fail of a dm-loop-v1 turn renews the lease while its token is the turn's; a retry may claim a pending or generating
  turn; the composer drops a refused resume command), `.env.local` from the `APP_*` variables, the ledger.

## In progress

- Stage A.

## Next

- Stage A → B → D → C → E → F.

## Owner's instructions during the run

- 2026-10-20: item 31 (the region map, the location paintings) moved to the parallel 2D Live session
  (`docs/stages/LIVE2D_1.md`, branch `claude/live2d-1`) — skipped in stage F. This run's migrations stay below the prefix
  `2026102102`; `src/lib/live2d/` and `src/components/live2d/` are not touched (the new section at the end of
  `FIX_S2_CDEF.md`).

## Open questions

- None yet.
