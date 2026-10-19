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
| 6 — live replay D and C, the judge, the first-word breakdown | in progress | the bench takes `--writer`, `--bookkeeper sonnet@high`, `--bookkeeper-switch 11:medium`; the runs play from a worktree pinned to 0341d5d (parts 1–5 + the knob; before part 7). **D done**: 20 turns, $4.17 (`docs/runs/polish3-20261019-034810-loop-opus+sonnet-live-ru-replay.jsonl`); first word 15.3 s median, text 34.1 s, records 50.9 s, held-send wait 14.3 s median; 34/40 checks (six time-word misses). C (Fable + Opus, 10 turns, budget $7) running; the judge on D running (budget $1). `scripts/eval/first-word.mjs` written: the queue before the first request is 160–290 ms; the first word is the model's time to the first token, correlated with the request's output (r 0.42–0.87), not with the cached prefix |
| 7 — craft by role and by situation | done | `origin/claude/craft-approval` merged (migration 90; its tests green); migration 69 (`dm_craft_roles`, per key); layer 1 without the library (8 851 → 4 162 tokens on the fixture), the selected cards in the tail by role, the bookkeeper's selection on the narration and the ledger; the time-word check in code (`time-words.ts`); the replay tool's `--craft` sets; the DM Craft screen's «Для кого». Tests `tests/polish3-craft.test.mjs`. Post-part-7 first word: to be measured (a short D run after C, if the cap allows) |
| final — checks, screenshots, docs, report | in progress | typecheck, lint pass; fake bench loop runtime 21/21; `docs/TURN_LOOP.md` §22–§25, `docs/SPEED.md` §9 written. Pending: the full suite on the final code, build, screenshots, the astra-runtime fake bench (6 scenarios fail on the pinned pre-polish-3 code as well — see the report), `DEV_STATUS.md`, the report |

## Paid calls log

| When (UTC) | What | Record | Spent |
| --- | --- | --- | --- |
| 2026-10-19 03:48–04:06 | part 6: live replay D, 20 turns, Opus 5.5 writer + Sonnet 5.5 bookkeeper (medium from turn 11), budget $6.5 | `docs/runs/polish3-20261019-034810-loop-opus+sonnet-live-ru-replay.jsonl` | $4.17 |
| | **Total** | `docs/runs/polish3-ledger.json` | **$4.17 of $20** (C, the judge, the smoke pending) |
