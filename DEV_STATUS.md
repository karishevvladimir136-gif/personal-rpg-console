# Development status

**Current stage:** Stage 2 — the new turn loop (`dm-loop-v1`) — done, including the live bench of both models;
waiting for the owner's review and «дальше». Plan: `docs/REBUILD_PLAN.md`; task: `docs/stages/STAGE_2.md`;
design of the loop: `docs/TURN_LOOP.md`; rules: `CLAUDE.md`.

**Branch:** `claude/stage-2-turn-loop` from `claude/stage-1-models`. Not merged, not pushed.

**What exists now:**
- `dm-loop-v1` (`src/lib/gameplay/dm-loop/`): the DM model (Opus 5.5 or Astra through `DmModel`) writes free
  narration, streamed to the player, and changes state only through 16 validated tools. Every call is checked
  against a shadow copy of the turn's state and gets a receipt (accepted + result, or rejected + a reason the
  model can act on); the turn continues. Receipts are persisted at once; a crash resumes from the last
  checkpoint without re-rolling dice. One atomic commit through the generic SQL applier (migration 53).
- Campaign DM settings (`rpg_private.dm_settings`, RPC `rpg_dm_settings`, panel "DM runtime and model" in
  Campaign Settings): runtime `dm-loop-v1` or `astra-primary-v1`, DM model and effort, editable at any time —
  also after a takeover. New campaigns play on `dm-loop-v1` from the first scene; existing ones keep Astra.
  The model is pinned per operation; retries keep the pin.
- Four-layer request (how to DM / world / living / now) with cache breakpoints; the first three layers are
  stable across turns (verified by per-layer hashes). Cache read share and request sizes are logged per request.
- Live view: narration deltas and accepted changes stream to the game screen over server-sent events, marked
  provisional until the turn is saved (`/api/campaigns/<id>/turns/<op>/stream`).
- Secrets: one narrator sees Character Models and private notes; the literal privacy check only logs
  suspected leaks to the turn diagnostics (W3 closed). A reward is paid exactly once; a plain payment from the
  quest's issuer settles it (W1 closed). W2 (paraphrased leak) is a live-quality question.
- Bench: `--runtime dm-loop-v1` with a scripted DmModel or the live adapters, scripts for scenarios 01–08 plus
  09 (companion talk), 10 (tool cap), 11 (crash resume). The old Astra bench is untouched (still 2 of 8).

**Checks on the final branch state:** typecheck pass; lint pass (0 warnings); build pass; fake bench on
`dm-loop-v1`: 11 of 11 scenarios, 96/96 checks, W1 and W3 closed, W2 open; old fake bench 2 of 8 (unchanged).
Tests: 2415 — 2388 pass, 0 fail, 27 skipped (26 HTTP tests without PREVIEW_URL, by design, + 1 existing opt-in), 398 s.

**Paid runs (2026-10-15, cap $15):** Opus 5.5 high on scenarios 01–08: 33 turns, 137 requests, $3.8769; Astra
medium: 26 turns (24 committed, 2 refused by the budget guard), 109 requests, $3.79 measured ($5.39 reserved).
Smoke and stopped runs: $1.13. Total ≈ $8.8. Medians per turn: Opus 35.3 s / $0.104 / 89% cache reads /
first word 31.8 s; Astra 35.1 s / $0.147 / 75% / first word 23.6 s. No turn failed by the model or the runtime;
no literal secret leak. Numbers: `docs/BASELINE.md` §9.

**Known issues / what Stage 3 must harden:** balances, quantities and the one-reward-claim rule are TypeScript
rules today — SQL invariants in Stage 3 (the generic applier already keeps resources non-negative and HP in
bounds). Both models write the narration after the last tool round, so the first word arrives with the whole
text (23–32 s). Character Model limits from Stage 1 reject many of Opus's notes (Stage 4). Scripted scenario
checks are a poor pass/fail measure for live play (models rename NPCs, record them at first sight, let jobs fail).
Switching a taken-over campaign to `dm-loop-v1` is wired (the begin re-labels the Astra row) but untested on a
real campaign — Stage 6 on a copy of the owner's database. Stale leftover edits from the old detached checkout
are in `git stash` ("pre-stage-0: …").

**Next step:** Stage 3 (atomic write with SQL invariants, campaign limits, compatibility of old turns and saves)
after «дальше».

The full pre-rebuild status history is in `docs/archive/DEV_STATUS_history.md`.
