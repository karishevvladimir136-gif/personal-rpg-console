# Polish 2 — progress (resume from here)

Branch `claude/polish-2` from `origin/claude/polish` (b740161) with `origin/claude/picture-models` (1b60abb) merged first.
Spec: `docs/stages/POLISH_2.md` on `origin/claude/handoff`. Environment `rpg-console`, session start as `docs/CLOUD.md`.
Paid caps: **$15** for the turn loop (part 4), **$10** for pictures (parts 2–3). Spent so far: turn loop **$0.00**, pictures **see the log below** (briefs $0.16; the frames run settles its own ledger `docs/runs/pictures-brief-ledger.json`).

A restarted session: read this file, check `git log` of `claude/polish-2`, continue at the first part not marked done.
Never repeat a paid step marked done below (its record is in `docs/runs/polish2-*`).

The parallel session `claude/dm-arch` owns `src/lib/gameplay/dm-loop/two-pass/**`, `scripts/eval/dm-arch/**`,
`docs/samples/dm-arch/`, `docs/runs/dmarch-*` — never edited here.

| Part | State | Notes |
| --- | --- | --- |
| 1 — merge, baseline | done | merge commit da4e1c7, clean (the two sides changed different hunks of `pictures-service.ts`); typecheck pass; lint pass, zero warnings. The first full-suite run read the part-2 edits live and was stopped; the clean run on a worktree pinned to da4e1c7: **2557 tests, 2530 pass, 27 skipped, 0 fail** (1849 s) |
| 2 — GPT Image 2.5 in the app | done | migration 64 (`models` per tier, provider `openai`); `modelForTier(tier, settings)` with the blind-pick defaults; the OpenAI path in `picture-job.ts` with the Flare → Sunburst ladder; anchors through `compileAnchorPrompt` with `carried`; `readWorldClock`; the settings screen picks a model per tier; `tests/polish2-pictures.test.mjs` (7); `docs/stages/STAGE_V.md` §9. No paid call |
| 3 — shot director | in progress | code committed (5290d86): `brief.ts`, `brief-model.ts`, migration 65, `directFrame` in the service, profiles on the cards, the redraw comment; `tests/polish2-director.test.mjs` (6). Paid: briefs ×2 runs ($0.156, the second after the prompt was tightened); the 64 proof frames running (`docs/runs/pictures-brief-*`) |
| 4 — cache: append-only history | in progress | code written (history blocks between the world and the living dossier, four breakpoints, no top-level one); tests being updated; the 20-turn live replay not yet run |
| 5 — opening by the campaign's DM | not started | |
| 6 — small follow-ups | not started | |
| final — checks, report | not started | |

## Paid calls log

| When (UTC) | What | Record | Spent |
| --- | --- | --- | --- |
| 2026-10-17 | Part 3 briefs, Claude Sonnet 5.5, two runs of eight | `docs/runs/pictures-brief-briefs.json`, `pictures-brief-ledger.json` | $0.16 |
| 2026-10-17 | Part 3 proof frames, GPT Image 2.5 Sunburst + Flare, 8 shots × 2 prompts × 2 samples | `docs/runs/pictures-brief-results.json`, the ledger | (settling) |
| | **Total** | | **see the ledger** |
