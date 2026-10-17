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
| 5 — paid: scene branches B, C, D | done | 24/24 pairs over three runs (two guard stops, each costing one paid request): `dmarch-20261017-190822-scenes.jsonl`, `…-193714-scenes.jsonl`, `…-194127-scenes.jsonl`; $14.20 |
| 6 — paid: continuity runs C (D) | done | C 4 turns + 1 transport failure ($1.57), D 5 turns ($0.75) |
| 7 — paid: judge | done | 63 turns, Sonnet 5.5 medium, $0.79: `dmarch-20261017-195450-judge.jsonl` |
| 8 — blind samples, report, flag commit, final checks | done | 32 samples in `docs/samples/dm-arch/`; `docs/runs/dmarch-REPORT.md`; the flag in `gameplay-service.ts`; typecheck, lint (0 warnings), build pass; the touched tests 114 pass; full suite result below |

## Paid calls log

| When (UTC) | What | Record | Spent |
| --- | --- | --- | --- |
| 2026-10-17 18:20 | live smoke: C on s01 | `docs/runs/dmarch-20261017-182013-scenes-smoke.jsonl` | $0.51 |
| 18:21–18:53 | reference run A, 30 turns (budget $9) | `docs/runs/dmarch-20261017-182146-reference-A.jsonl` | $7.77 |
| 19:08–19:36 | scene branches B, C, D, 19 pairs, guard reached (budget $13) | `docs/runs/dmarch-20261017-190822-scenes.jsonl` | $10.53 |
| 19:37–19:41 | scene branches, s18 ×3, guard stop on s28 (budget $4.5) | `docs/runs/dmarch-20261017-193714-scenes.jsonl` | $2.01 |
| 19:41–19:46 | scene branches, s28 ×3 (budget $4) | `docs/runs/dmarch-20261017-194127-scenes.jsonl` | $1.65 |
| 19:46–19:50 | continuity C, 5 turns, the fifth failed on transport (budget $3.2) | `docs/runs/dmarch-20261017-194606-continuity-C.jsonl` | $1.57 |
| 19:50–19:54 | continuity D, 5 turns (budget $1.6) | `docs/runs/dmarch-20261017-195052-continuity-D.jsonl` | $0.75 |
| 19:54–20:05 | judge, 63 turns (budget $3.5) | `docs/runs/dmarch-20261017-195450-judge.jsonl` | $0.79 |
| | **Total** | `docs/runs/dmarch-ledger.json` | **$25.58 of $30** |

## Full suite

Pending at the time of the report: run in chunks of eight files under Node 24 (`node --test --test-concurrency=2`); the
result is recorded here when it finishes.
