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

- Part 2 (built) — the battle model (`src/lib/live2d/battle/*`: contracts, geometry, the DM's battlefield text, the
  optional rules module), migration `202610210201_live2d_battle.sql` (`public_field` on the encounter, battle
  backgrounds), the grown `combat` tool (start/place/move/next_turn/attack/condition/hp/profile/feature/known/intent/
  reaction/log/end), the battlefield block in the DM's context, `battle.prepare` (the top-down background), the battle
  screen (`src/components/live2d/battle/*`, `/preview/live2d/battle?fight=ford|lair&round=N`), the two scripted fights
  through the real loop (`tests/live2d-fights.test.mjs`), 18 battle screenshots. The owner's turn-lease fix
  (`claude/stage-fix-turn-lease`, migration 71) is merged: the first live fight attempts died on the expired lease.

## In progress
- Part 2 — the live DM probes (scenarios `20-live2d-ford`, `21-live2d-lair`, Opus 5.5, $3.50 each), then the report's
  Part 2 section, the full suite on the frozen candidate, the final screenshots index.

## Next
- Owner acceptance (`docs/runs/live2d-1-acceptance.md`); the proposals for the fix run in the report.

## Open questions
- none yet
