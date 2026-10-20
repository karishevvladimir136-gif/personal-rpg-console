# Fixes after session 2 — the whole run (stages A → B → D → C → E → F)

The owner (2026-10-19 23:16): play the next session only on the fixed app — «я хочу играть на нормальном инвентаре и
остальном, давай всё». So all six stages run before session 3.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`). Branch **`claude/fix-s2`** from `origin/claude/session-2-prep`
(tip `d74b6c6`). If `origin/claude/stage-fix-turn-lease` exists (a local session's lease-renewal fix), review it and merge
it first. One session at a time, nothing in parallel.

Order and detail:
1. **A and B** — `docs/stages/FIX_S2_AB.md` (use this branch name and this progress file instead of the ones written there).
2. **D, then C, then E, then F** — `docs/stages/FIX_S2_CDEF.md`.
Read first: `docs/runs/session2-owner-notes.md` whole (the owner's verdict, key findings 1 and 2, items 1–85),
`docs/stages/FIX_S2_PLAN.md`.

Working rules:
- Commit and push after each part; keep `docs/runs/fix-s2-progress.md` current (done, in progress, next, open
  questions). If your context runs low, finish the part you are in, push, write «next» in the progress file and stop — a
  new session continues from it with the same instruction.
- Each stage ends green (the full suite on a clean worktree pinned to the stage's last commit), with its probes passed
  and its screenshots (Playwright with the preinstalled Chromium; desktop 1920×1080 and 2560×1440, phone 390×844 where a
  screen has a phone layout) in `docs/runs/fix-s2-shots/`.
- **The regression list** (the owner's verdict at the top of the notes) is re-checked at the end of every stage on the
  probe scenes: honest dice, enemies that play to kill, no item lost, active companions, right modifiers and advantage,
  honest magic and slots, facts held, secrets only through people who know them.
- Hard rules: never `main`; keys only in `.env.local`, never printed or logged; `APP_ANTHROPIC_API_KEY`, never
  `ANTHROPIC_API_KEY`; never the owner's real database or port 3000; never edit an applied migration; the repo is public —
  no campaign dialogue, voice-bank passages or session transcripts in git, fixtures synthetic; live paid calls within
  **$50 for the whole run** (A+B up to $30), stopped by a guard, every call in `docs/runs/fix-s2-ledger.md`; anything
  destructive or anything that needs the owner goes to «Needs the owner» in the report.
- Report in English: `docs/runs/fix-s2-report.md` — per stage what changed, the numbers (cost per turn before/after,
  requests per turn, voice metrics for both instruction languages), what was already fixed on the base branch, the money
  spent, «Needs the owner».

At the end, write **`docs/runs/fix-s2-acceptance.md` in Russian** — the owner's acceptance pass in his sandbox: per screen
and per feature, what changed, where to look, what to try (two to five lines each), with a box for «принято» or a note.
The owner accepts each screen himself before anything is called done (his rule from session 2). Then stop; the planner
writes the local prompt that loads the branch into the sandbox and replays the heavy turns of session 2.
