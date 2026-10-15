# Development status

**Current stage:** Stage 0 — preparation and baseline — done, waiting for the owner's review and «дальше».
Plan: `docs/REBUILD_PLAN.md`; task: `docs/stages/STAGE_0.md`; rules: `CLAUDE.md`; baseline: `docs/BASELINE.md`.

**Branch:** `claude/stage-0-baseline` from `claude/rebuild-base` (= `65dc99c`, `codex/astra-fictional-world-freedom`).
Not merged, not pushed. No `src/` or migration changes; no paid model calls; the owner's database was not used.

**Checks on the final branch state:** typecheck pass; lint pass (0 warnings); build pass;
tests 2375: 2374 pass, 0 fail, 1 existing opt-in skip, 494 s (HTTP tests against an isolated
credential-free build of this branch on port 3197).

**Evaluation bench:** `node scripts/eval/run.mjs --scenario all` (fake provider, disposable PGlite).
Baseline: 2 of 8 scenarios pass (03 reward-once, 08 secret-pressure); 01, 02, 04, 05, 06, 07 fail because
NPCs/places/quests/companions cannot be created in play, rewards are capped at 1–20 and created items are
food/supply/misc only, and eating works only for healing items. Probes: a second payment via `mundane_grant`
is accepted; the privacy guard misses paraphrases and fails a whole turn on any quoted private string.
Median 2 model requests per turn; ~2/3 of turns take the two-request private-informed path.

**Known issues:** HTTP tests default to `127.0.0.1:3000` (the owner's running app) — always run `pnpm test`
with `PREVIEW_URL` pointing to an isolated server. No system Node.js on PATH (Codex runtime Node 24.19.0 used).
Stale leftover edits from the old detached checkout are kept in `git stash` ("pre-stage-0: …").
13 root documents match neither the archive patterns nor the keep list — owner to decide. Details: `docs/BASELINE.md` §7.

**Next step:** owner review of Stage 0; optional live Astra baseline (`--provider live --budget-usd 10`, ≈ $6–9)
only with the owner's approval; then Stage 1 (two models) after «дальше».

The full pre-rebuild status history is in `docs/archive/DEV_STATUS_history.md`.
