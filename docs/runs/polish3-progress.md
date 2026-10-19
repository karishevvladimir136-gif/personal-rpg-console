# Polish 3 — progress (resume from here)

Branch `claude/polish-3-stage-009b43` (the session's own; pushed also as `claude/polish-3`) from `origin/claude/polish-2`
(096fb5a) with `origin/claude/dm-arch-bakeoff-zuxey2` (34bf6c1) merged first. Spec: `docs/stages/POLISH_3.md` on
`origin/claude/handoff` (part 7 added by the owner on 2026-10-18 while the run was going). Run locally on the owner's
machine (the Codex runtime's Node 24.19, pnpm 11.25) in a git worktree with a keys-only `.env.local` copied from the
sandbox clone — no Supabase values, no owner database. Paid cap for the stage: **$20**, enforced by the replay tools'
guard and `docs/runs/polish3-ledger.json`.

A restarted session: read this file, `git log` of the branch, continue at the first part not marked done. Never
repeat a paid step marked done (its record is in `docs/runs/polish3-*` / `docs/runs/real-replay-*`).

| Part | State | Notes |
| --- | --- | --- |
| 1 — merge, baseline | done | merge commit c17ca39 (only `DEV_STATUS.md` conflicted: both sections kept); typecheck pass, lint pass. Full suite on a clean worktree pinned to the merge, Node 24.19, `--test-concurrency=2`: **2587 tests, 2557 pass, 27 skipped, 3 fail** — the bake-off's own layer test (the bookkeeper's layers were picked by index and polish 2's history blocks shifted them; fixed in part 2), and two Windows CRLF artefacts (`sandbox-start`, `polish-group6` regexes on files the checkout converts to CRLF; `docs/CLOUD.md`: environment-specific, not rewritten) |
| 2 — the split as a campaign setting | done | migration 68 (`dm_split`, `snapshots_keep`, the role-aware model assert, the pin and the opening's ticket admit a writer); `src/lib/gameplay/dm-loop/roles.ts` (the three roles, the field sheet), `context.ts` role option + named parts, `two-pass/` rewritten (the pin carries the bookkeeper, the ledger asked once and clipped, the writer's continuation retried once, «recording» status, the campaign dispatcher), the server flag gone; the game screen's «Ведущий записывает…» state and the held send; the settings screen's «Ведущий» with the three choices and «Подробнее»; the director reads the ledger; the opening by the writer. Tests `tests/polish3-split.test.mjs`, `tests/dm-arch-two-pass.test.mjs` updated |
| 3 — bookkeeping fixes | done | every rejected record call goes back once with its reason on both runtimes (`retriableRejection`; deciding calls the state refused are the story's business); the exact field names of the schemas in both roles' layer 1 (`toolFieldSheet`); `move_party` resolves an ID the model mangled by a character (`nearlySameId`; the bake-off's `db431570-…-cea-…` for `…-9cea-…` — a dropped character, not the parent/whereabouts kind) |
| 4 — snapshots and the replay tool | done (code) | `rpg_private.turn_snapshots` + `rpg_turn_snapshots` RPC (save at commit, list, read, prune by `snapshotsKeep`); turns from before the migration (session 1) read from the turn row's claim-time source; `GET /api/campaigns/<id>/snapshots`; `src/lib/gameplay/replay/` (the isolated in-memory store, the samples); `scripts/eval/real-replay/` (replay, synthetic, craft variants, the ledger). Tests `tests/polish3-replay.test.mjs`. Paid smoke: pending |
| 5 — picture defaults | done | the director off by default (existing rows switched off by migration 68; the switch stays), live frames on Sunburst by default (Flare stays a choice) |
| 6 — live replay D and C, the judge, the first-word breakdown | pending | |
| 7 — craft by role and by situation | pending | merge `origin/claude/craft-approval` first |
| final — checks, screenshots, docs, report | pending | |

## Paid calls log

| When (UTC) | What | Record | Spent |
| --- | --- | --- | --- |
| | **Total** | `docs/runs/polish3-ledger.json` | **$0.00 of $20** |
