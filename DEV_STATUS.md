# Development status

**Current stage:** Stage 1 — two models — done, including the live probe of both models; waiting for the owner's
review and «дальше». Plan: `docs/REBUILD_PLAN.md`; task: `docs/stages/STAGE_1.md`; rules: `CLAUDE.md`.

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

**Paid runs (2026-10-15):** model probe $0.5595 of $2 (Astra $0.3422; Opus $0.2173 after the key fix); old Astra
turn on bench 01/03/08 $2.2854 of $3 (stopped by the budget guard); total $2.8449. Probe medians per turn: Opus
medium 9.1 s / $0.018, Opus high 9.5 s / $0.018, Astra medium 8.5 s / $0.020, Astra high 12.4 s / $0.030.
Numbers: `docs/MODELS.md` (probe), `docs/BASELINE.md` §8 (live baseline).

**Known issues:** after the Astra takeover a campaign's settings (including the DM model) cannot be changed —
`rpg_world` accepts reads only (migration 39); the choice can be set before takeover. Live Astra failed 4 of 7 secret-scenario
turns with non-retryable validation (literal privacy guard; see BASELINE §8). Cache writes make most Astra input
cost 1.25×. Stale leftover edits from the old detached checkout are in `git stash` ("pre-stage-0: …").

**Next step:** Stage 2 (new turn loop) after «дальше». Note for it: after a tool call Opus delivered its reply in one
burst at the end of the request, so first-word time on such turns equals the whole turn (7–11 s).

The full pre-rebuild status history is in `docs/archive/DEV_STATUS_history.md`.
