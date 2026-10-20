# 2D Live, first slice — progress (`docs/stages/LIVE2D_1.md`)

Branch `claude/live2d-1-9lq5bf` (the session's own name for `claude/live2d-1`) from `origin/claude/session-2-prep`
(`d74b6c6`). Paid cap $40 (owner, 2026-10-20); every call in `docs/runs/live2d-1-ledger.md`.

## Done
- Environment: Node 24, pnpm install, `.env.local` from the `APP_*` variables (nothing printed).
- Part 1a — the pure model `src/lib/live2d/` (contracts, hierarchy, travel, markers, intents, scene sheet/brief/check/POIs,
  region map), `tests/live2d-model.test.mjs` (9 tests).
- Part 1b — migration `202610210200_live2d.sql` (`rpg_live2d`: scenes with versions, POIs, region maps, private seeds,
  marker settings; the pictures catalogue gains `scene`/`region`/`battle`), `tests/live2d-sql.test.mjs`.
- Part 1c — the server chain `src/lib/live2d/server/*` (sheet → picture → strong check → one corrected redraw → locator →
  POIs; region map with signature and the area's private seeds), route `/api/campaigns/{id}/live2d`,
  `tests/live2d-vision.test.mjs`.
- Part 1d — the «2D» screen `src/components/live2d/*` (nav item after «Карта»; `/preview/live2d` synthetic walk),
  `tests/live2d-ui.test.mjs`.

- Part 1e — the probe set (`scripts/eval/live2d/probe.mjs`: 8/8 places, 100 % must-show after ≤ 1 redraw, 0
  contradictions, 0 people, $0.057 a scene), the preview art, 21 screenshots (`docs/runs/live2d-1-shots/`), the report
  `docs/runs/live2d-1-report.md`, the owner's checklist `docs/runs/live2d-1-acceptance.md`. Spent $0.73 of $40.

## In progress
- Part 2 — the combat screen and the battle map: the battle model (`src/lib/live2d/battle/*`: contracts, geometry,
  battlefield text, the optional rules module), migration `202610210201_live2d_battle.sql` (`public_field` on the
  encounter, battle backgrounds), the grown `combat` tool (start/place/move/next_turn/condition/hp/feature/known/
  intent/reaction/log/end) and the battlefield block in the DM's context. Next inside Part 2: the `attack` action with
  the rules module, `battle.prepare` (the top-down background), the battle map screen (a fork is building it), the two
  scripted fights, the live DM probes, screenshots per round.

## Next
- After Part 2: the full suite on the frozen candidate, the report's Part 2 section, DEV_STATUS.

## Open questions
- none yet
