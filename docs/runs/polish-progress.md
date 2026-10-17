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
| 4 — DM craft doctrine (pending versions) | done | migration `202610170060_polish_craft.sql` (six pending cards, `dm_likes`); `tests/polish-group4.test.mjs`; scenario `18-heros-knowledge` (fake 4/4); `docs/TURN_LOOP.md` §14. Pending DM Craft versions to list in the report: heros-knowledge, danger-and-pacing, heros-moment, time-and-clock, open-questions-and-tics, records-match-the-fiction (all v1, never activated) |
| 5 — pictures | done | `redraw-anchor.tsx` (one Stage V path for every picture button), hide/lightbox/«Кадр сцены» in `live-frames.tsx` and `game-screen.tsx`, the OpenAI anchors choice removed; `tests/polish-group5.test.mjs`; `docs/stages/STAGE_V.md` §8. Picture-models files untouched. Needs the owner: the atlas artwork («Создать карту») has no Stage V composition and left the map screen |
| 6 — game screen layout | done | one stage (the frame takes the header), one page scroll, sticky compact composer with icon tools, the addressee read from the text, one «Ведущий думает…», changes folded and led by items/money with the «⚡ думал глубже» mark, no timers (clock in words), no adventure card, «Зацепки» / «Долги и обещания», goal from the taken quest or the arc, hero line in words; `tests/polish-group6.test.mjs`. Screenshots and the 15-lines check come in the final group |
| 7 — voice mechanics + budgets | done | migration `202610170061_polish_voice.sql`; speech profile + tic counter, budgets of item 8, voice slots (off), «Образцы голоса» (off), finish_turn nudge, naturalness metrics, opening by the campaign's DM when OpenAI; `tests/polish-group7.test.mjs`; `docs/TURN_LOOP.md` §16. Not done: an Opus-written opening (OpenAI-only bootstrap contract) — in the report |
| 8 — character and inventory | done | migration `202610170062_polish_character.sql` (a narrative hero gets humanoid slots); the wallet always exists in the world's currency (Cyrillic currencies are money), the universal paper doll for records without slots, the backstory block, zero stub numbers hidden, HP owner-correction buttons, Russian stat labels; `tests/polish-group8.test.mjs`. Rest heals by the ruleset through the loop's rest tool (unchanged); the player's rest action moves with the «Ещё» split (group 10). Page width to check on the final screenshots |
| 9 — codex, map, journal | done | place hierarchy (`parentRef`, `whereabouts`) with the atlas laying markers out by itself and dashed rumours; the whole-world codex in tabs; the journal cleanup; the pinned list moved to the settings; the reward line localized; `tests/polish-group9.test.mjs`; `docs/TURN_LOOP.md` §17. Needs the owner: a `lore` record for the «Мир» tab (today: the canon documents); quest text linking named things |
| 10 — wizard, first turn, combat profile, «Ещё» | next | |
| final — checks, live smoke, screenshots, report | pending | |

## Baseline (integration + fix branch, before any polish change)

- typecheck: pass. lint: pass, zero warnings.
- full suite `node --test --test-concurrency=2 tests/*.test.mjs`: the run started at group 0 overlapped with the first
  group-1 edits (tests read the migrations folder and the sources live), so its 18 failures are not a baseline: 17 came from
  half-applied polish changes, 1 is the known environment failure (`universal-bootstrap-sql`, the CRLF checksum of migration 30).
  The integration branch's own final result stands as the baseline: 2489 tests, 2461 pass, 1 environment failure, 27 skipped.

## Paid calls log

(none yet)
