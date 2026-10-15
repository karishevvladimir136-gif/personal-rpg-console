# Development status

**Current stage:** Stage 1 — two models — implemented; waiting for the owner's review and «дальше».
Blocked item: the Claude Opus 5.5 live probe (the `ANTHROPIC_API_KEY` in `.env.local` is rejected as invalid —
its `sk-ant-` prefix appears twice). Plan: `docs/REBUILD_PLAN.md`; task: `docs/stages/STAGE_1.md`; rules: `CLAUDE.md`.

**Branch:** `claude/stage-1-models` from `claude/stage-0-baseline`. Not merged, not pushed.

**What exists now:**
- `DmModel` (`src/lib/server/dm/model/`): one streaming call per request, Anthropic (`claude-opus-5-5`) and OpenAI
  (`gpt-6-astra`) adapters on `fetch`, tool-schema compiler with provider limits, classified errors, retries only
  before the first event. Facts: `docs/MODELS.md`.
- One price table and cost-by-usage: `src/lib/model-runtime/dm-models.ts`.
- Campaign choice: `runtimePolicy.taskOverrides["dm.turn"]` may be Claude Opus 5.5 or GPT-6 Astra (default Astra);
  every other task stays OpenAI-only. Migration 52. An Astra turn pins the choice plus the models that actually
  serve it; retries keep the pin. The old Astra turn is unchanged and still runs on Astra.
- HTTP tests never reach the owner's app on :3000 (skipped without `PREVIEW_URL`).
- Bench: three tracked known weaknesses W1–W3 (red by design); fake bench still 2 of 8.

**Checks on the final branch state:** typecheck pass; lint pass (0 warnings); build pass; tests 2401 — 2374 pass,
0 fail, 27 skipped (26 HTTP tests without `PREVIEW_URL`, by design, + 1 existing opt-in), 480 s. Fake bench: 2 of 8,
same checks as BASELINE, W1–W3 open.

**Paid runs (2026-10-15):** model probe $0.3422 of $2 (Astra only; Opus 401); old Astra turn on bench 01/03/08
$2.2854 of $3 (stopped by the budget guard). Numbers: `docs/MODELS.md` (probe), `docs/BASELINE.md` §8 (live baseline).

**Known issues:** after the Astra takeover a campaign's settings (including the DM model) cannot be changed —
`rpg_world` accepts reads only (migration 39); the choice can be set before takeover. Live Astra failed 4 of 7 secret-scenario
turns with non-retryable validation (literal privacy guard; see BASELINE §8). Cache writes make most Astra input
cost 1.25×. Stale leftover edits from the old detached checkout are in `git stash` ("pre-stage-0: …").

**Next step:** owner fixes `ANTHROPIC_API_KEY`; re-run the Opus probe (≤ $1.65 left of the approved $2). Then Stage 2
(new turn loop) after «дальше».

The full pre-rebuild status history is in `docs/archive/DEV_STATUS_history.md`.
