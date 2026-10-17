# DM architecture bake-off — progress (resume from here)

Spec: `docs/stages/DM_ARCH.md` (on `origin/claude/handoff`). Branch `claude/dm-arch-bakeoff-zuxey2` from
`origin/claude/polish` (b740161); the task named it `claude/dm-arch`, the session's designated branch carries the work.
Environment `rpg-console`, session start as `docs/CLOUD.md`. Paid cap for the whole bake-off: **$30**, enforced by the
bench's guard (`scripts/eval/dm-arch/`); every paid request is in the records `docs/runs/dmarch-*.jsonl` and in the
ledger below. Runs in parallel with `claude/polish-2`: new files only (`src/lib/gameplay/dm-loop/two-pass/**`,
`scripts/eval/dm-arch/**`, `docs/samples/dm-arch/`, `docs/runs/dmarch-*`, `tests/dm-arch-*`) plus one small
registration commit (the model registry, the runtime flag).

A restarted session: read this file, `git log` of the branch, continue at the first step not marked done. Never repeat
a paid step marked done (its record is in `docs/runs/dmarch-*.jsonl`). The saved states of the reference run live
in `scripts/eval/out/dmarch-states/` (git-ignored, 8.7 MB each): if they are gone after a restart, the scene
branches not yet played cannot be resumed without replaying the prefix (about $7) — stop and put it under
«Needs the owner» instead of paying again.

## Design (decided 2026-10-17, no owner input needed)

- Session 1 itself lives in the owner's database and is not reachable from the cloud, so the eight voice-plan scenes
  cannot be reached from a saved state at those turns. The bake-off plays the Russian harbour replay
  (`19-polish-ru-replay`, session 1 rebuilt as a fixture) and takes its eight key moments of the same kinds
  (opening, bargaining, the dive, the evening debt, the night, the watch, the fight, the payoff) as the scenes.
- **Reference run = variant A** (Opus 5.5, today's loop, depth high…xhigh): the whole replay, 30 turns. Before each
  scene turn the PGlite state is dumped. A's scene narrations come from this run (they start from the same state).
- **Scene branches**: B, C, D (and A again if the budget allows, for a same-cache-state timing) play each scene turn
  from the restored state — the same context for every variant, one turn each, as the blind page needs.
- **Continuity**: C (and D if the budget allows) also play the first turns of the replay in sequence, to see whether
  the split drifts (what the bookkeeper fails to record is missing from the writer's next context).
- **Judge**: Claude Sonnet 5.5 compares the records with the narration per turn (misses, wrong records, rejected
  calls); craft checks from the bench (time words, leaks, «Твой момент», naturalness).

| Step | State | Notes |
| --- | --- | --- |
| 0 — session start, branch, baseline | done | Node 24.22, `.env.local` written from `APP_*`, `pnpm install`; the three model IDs answer `count_tokens` (free) |
| 1 — registry: Fable 5.1 and Sonnet 5.5 specs | done | `src/lib/model-runtime/dm-models.ts` only; UI list and SQL asserts untouched |
| 2 — two-pass runtime + fake tests | done | `src/lib/gameplay/dm-loop/two-pass/`, `tests/dm-arch-two-pass.test.mjs` |
| 3 — bake-off bench (fake dry run, live smoke of C on s01) | done | `scripts/eval/dm-arch/` |
| 4 — paid: reference run A | done | 30/30 turns committed, 50 requests, **$7.77**; `docs/runs/dmarch-20261017-182146-reference-A.jsonl`; 30 states in `scripts/eval/out/dmarch-states/before-<step>.tar.gz` (git-ignored) |
| 5 — paid: scene branches B, C, D | in progress | started 19:08 UTC, 24 pairs, budget $13; `docs/runs/dmarch-<time>-scenes.jsonl` (restart: rerun `scenes.mjs`, done pairs are skipped) |
| 6 — paid: continuity runs C (D) | pending | |
| 7 — paid: judge | pending | |
| 8 — blind samples, report, flag commit, final checks | pending | |

## Paid calls log

| When (UTC) | What | Record | Spent |
| --- | --- | --- | --- |
| 2026-10-17 18:20 | live smoke: C (Fable writer + Opus bookkeeper) on s01, budget $1.50 — writer 25.5 s / $0.31, bookkeeper 50 s / 13 records / $0.20 | `docs/runs/dmarch-20261017-182013-scenes-smoke.jsonl` | $0.51 |
| 2026-10-17 18:21–18:53 | reference run A, 30 turns, budget $9 | `docs/runs/dmarch-20261017-182146-reference-A.jsonl` | $7.77 |
| 2026-10-17 19:08 | scene branches B, C, D × 8 scenes, budget $13 (running) | `docs/runs/dmarch-*-scenes.jsonl` | reserved $13.00 |
| | **Total** | | **$8.28 spent, $13.00 reserved, of $30** (the live ledger is `docs/runs/dmarch-ledger.json`) |
