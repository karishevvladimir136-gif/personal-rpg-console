# Polish 2 — progress (resume from here)

Branch `claude/polish-2` from `origin/claude/polish` (b740161) with `origin/claude/picture-models` (1b60abb) merged first.
Spec: `docs/stages/POLISH_2.md` on `origin/claude/handoff`. Environment `rpg-console`, session start as `docs/CLOUD.md`.
Paid caps: **$15** for the turn loop (part 4), **$10** for pictures (parts 2–3). Spent so far: turn loop **$0.00**, pictures **$0.00**.

A restarted session: read this file, check `git log` of `claude/polish-2`, continue at the first part not marked done.
Never repeat a paid step marked done below (its record is in `docs/runs/polish2-*`).

The parallel session `claude/dm-arch` owns `src/lib/gameplay/dm-loop/two-pass/**`, `scripts/eval/dm-arch/**`,
`docs/samples/dm-arch/`, `docs/runs/dmarch-*` — never edited here.

| Part | State | Notes |
| --- | --- | --- |
| 1 — merge, baseline | done | merge commit da4e1c7, clean (the two sides changed different hunks of `pictures-service.ts`); typecheck pass; lint pass, zero warnings. The first full-suite run read the part-2 edits live and was stopped; the clean run goes on a worktree pinned to da4e1c7 (result in the report) |
| 2 — GPT Image 2.5 in the app | done | migration 64 (`models` per tier, provider `openai`); `modelForTier(tier, settings)` with the blind-pick defaults; the OpenAI path in `picture-job.ts` with the Flare → Sunburst ladder; anchors through `compileAnchorPrompt` with `carried`; `readWorldClock`; the settings screen picks a model per tier; `tests/polish2-pictures.test.mjs` (7); `docs/stages/STAGE_V.md` §9. No paid call |
| 3 — shot director | not started | |
| 4 — cache: append-only history | not started | |
| 5 — opening by the campaign's DM | not started | |
| 6 — small follow-ups | not started | |
| final — checks, report | not started | |

## Paid calls log

| When (UTC) | What | Record | Spent |
| --- | --- | --- | --- |
| | **Total** | | **$0.00** |
