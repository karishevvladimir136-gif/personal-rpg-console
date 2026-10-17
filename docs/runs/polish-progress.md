# Polish run — progress (resume from here)

Branch `claude/polish` from `origin/claude/integration` (4caf099) with `origin/claude/fix-dm-craft-payload` (ae78e9b)
merged. Spec: `docs/stages/POLISH.md` («Scope of this run», «Order of work»). Environment `rpg-console`, session start as
`docs/CLOUD.md`. Paid cap for the whole run: $15. Spent so far: **$0.00**.

A restarted session: read this file, check `git log` of `claude/polish`, continue at the first group not marked done.
Never repeat a paid step marked done below (its record is in `docs/runs/polish-*.jsonl`).

| Group | State | Notes |
| --- | --- | --- |
| 0 — session start, merge, baseline | done | fix-branch test `tests/dm-craft-server-payload.test.mjs` passes; baseline typecheck pass, lint pass (0 warnings); full suite running at group 0 push (result recorded below when known) |
| 1 — correctness of the turn and the records | next | |
| 2 — rolls | pending | |
| 3 — speed and cost | pending | paid: cache/depth measurement (30-turn Russian replay) — not started |
| 4 — DM craft doctrine (pending versions) | pending | |
| 5 — pictures | pending | do not edit the picture-models files (POLISH.md «The parallel session») |
| 6 — game screen layout | pending | |
| 7 — voice mechanics + budgets | pending | |
| 8 — character and inventory | pending | |
| 9 — codex, map, journal | pending | |
| 10 — wizard and first turn | pending | |
| final — checks, live smoke, screenshots, report | pending | |

## Baseline (integration + fix branch, before any polish change)

- typecheck: pass. lint: pass, zero warnings.
- full suite `node --test --test-concurrency=2 tests/*.test.mjs`: (filled in when the background run ends).

## Paid calls log

(none yet)
