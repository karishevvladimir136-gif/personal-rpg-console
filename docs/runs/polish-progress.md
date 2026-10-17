# Polish run — progress (resume from here)

Branch `claude/polish` from `origin/claude/integration` (4caf099) with `origin/claude/fix-dm-craft-payload` (ae78e9b)
merged. Spec: `docs/stages/POLISH.md` («Scope of this run», «Order of work»). Environment `rpg-console`, session start as
`docs/CLOUD.md`. Paid cap for the whole run: $15. Spent so far: **$0.00**.

A restarted session: read this file, check `git log` of `claude/polish`, continue at the first group not marked done.
Never repeat a paid step marked done below (its record is in `docs/runs/polish-*.jsonl`).

| Group | State | Notes |
| --- | --- | --- |
| 0 — session start, merge, baseline | done | fix-branch test `tests/dm-craft-server-payload.test.mjs` passes; baseline typecheck pass, lint pass (0 warnings); the baseline suite run overlapped with the first group-1 edits (see below) |
| 1 — correctness of the turn and the records | done | migration `202610170057_polish_records.sql`; `tests/polish-group1.test.mjs` (11 tests); `docs/TURN_LOOP.md` §11. Not done here: the roll card wording and bonuses (group 2), the chip collapse and layout (group 6), pledged items greyed on the inventory (group 8) |
| 2 — rolls | done | migration `202610170058_polish_rolls.sql`; `tests/polish-group2.test.mjs`; bench scenario 17; `docs/TURN_LOOP.md` §12. Left for group 6: the dice tray («Кубы») and «Пробую: <навык>» quick checks in the composer |
| 3 — speed and cost | done | migration `202610170059_polish_speed.sql`; `tests/polish-group3.test.mjs`; `docs/TURN_LOOP.md` §13, `docs/SPEED.md` §7. Paid before/after measurement (30-turn Russian replay, cache share / cost per turn / first word) deferred to the final group — not started, $0 spent. Left for group 6: the quiet «думал глубже» mark on the turn |
| 4 — DM craft doctrine (pending versions) | next | |
| 5 — pictures | pending | do not edit the picture-models files (POLISH.md «The parallel session») |
| 6 — game screen layout | pending | |
| 7 — voice mechanics + budgets | pending | |
| 8 — character and inventory | pending | |
| 9 — codex, map, journal | pending | |
| 10 — wizard and first turn | pending | |
| final — checks, live smoke, screenshots, report | pending | |

## Baseline (integration + fix branch, before any polish change)

- typecheck: pass. lint: pass, zero warnings.
- full suite `node --test --test-concurrency=2 tests/*.test.mjs`: the run started at group 0 overlapped with the first
  group-1 edits (tests read the migrations folder and the sources live), so its 18 failures are not a baseline: 17 came from
  half-applied polish changes, 1 is the known environment failure (`universal-bootstrap-sql`, the CRLF checksum of migration 30).
  The integration branch's own final result stands as the baseline: 2489 tests, 2461 pass, 1 environment failure, 27 skipped.

## Paid calls log

(none yet)
