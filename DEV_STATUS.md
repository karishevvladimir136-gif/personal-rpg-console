# Development status

**Current stage:** Stage 3 — record integrity and campaign limits — done; waiting for the owner's review and
«дальше». Plan: `docs/REBUILD_PLAN.md`; task: `docs/stages/STAGE_3.md`; design of the loop with the new
sections on limits, the folded finish and SQL integrity: `docs/TURN_LOOP.md` §3, §6, §9; procedure for
stage 6: `docs/RELEASE_CHECKLIST.md`; rules: `CLAUDE.md`.

**Branch:** `claude/stage-3-records` from `claude/stage-2b-speed`. Not merged, not pushed. The UI session
works in parallel on `claude/stage-5-ui`; nothing under `src/components/**` or `src/app/**` was touched here.

**Stage 3 in short (2026-10-15):**
- The database guards the loop's invariants itself (migration 54, additive): money and every named counter
  never below zero and never above its stored `<name>_max` cap (table CHECK, legacy rows respected); item
  quantities and HP bounds (the existing CHECKs, now tested directly); a quest reward claimed at most once —
  the commit records the claim on the quest row from the loop's private terms and fails a second one
  (`rpg_reward_claimed`), a trigger forbids moving or clearing it, an FK ties it to an operation of the same
  campaign; a committed turn can never be re-committed, rewritten (status, input, narration, runtime) or
  deleted (`rpg_immutable_history`), outside a save restore; cross-campaign writes and stale revisions were
  already refused by the applier and are now tested in SQL. `tests/record-integrity-sql.test.mjs` tries each
  of these directly in SQL on PGlite, including forged commit packets: every attempt fails.
- Per-turn limits are campaign settings (`dm_settings.limits`, same API and RPC as runtime and model; null =
  generous defaults: 1,000,000 money created, 50 items, 20 new characters, a week of game time, 40 tool
  calls, 10 model requests per turn). They are pinned into the operation with the model when the turn starts,
  enforced per call from the pin (a change applies to the next turn; a retry keeps its pin), and the SQL commit
  re-checks the time and new-character limits. No settings panel change in this stage (the panel belongs to
  the stage 5 UI session): the API returns and accepts `limits`, and `dm-settings-client.ts` carries the field
  names, labels and ceilings for that screen.
- Compatibility: old `astra-primary-v1` turns, saves and loads read exactly the same across migration 54
  (tested by applying it to a running campaign); a save on `dm-loop-v1` carries new characters with Character
  Models, places, holdings, quests with claimed rewards, private notes and receipts, and a load restores it
  byte for byte, then the same NPC continues (bench scenario 06 green); a synthetic 24-turn taken-over Astra
  campaign with two saves and a branch was switched to `dm-loop-v1`, played on, rewound to a pre-switch save
  and continued on either runtime with its history untouched. Loop turns now honour the per-turn autosave
  policy like the older runtimes (they skipped it in stage 2). `docs/RELEASE_CHECKLIST.md` says what stage 6
  must do against a copy of the owner's database; nothing was run against it.
- Stage 2b leftovers: Astra's `finish_turn` round of its own is folded into the final bookkeeping message
  (the instructions make time passing the last bookkeeping call; on an OpenAI pin a message of accepted
  bookkeeping that closes with time passing ends the turn — never after a rejected or deciding call). The
  owner's Character Model correction screen and the old Astra commit now accept the stage 2b bounds (12
  entries per list, 400–600 characters per text, 6000 bytes).
- Bench: scenario 13 "invariant attack" (11 attacks rejected with reasons, turn commits, state intact);
  fake bench on `dm-loop-v1` 13 of 13 scenarios, 123/123 checks; old Astra fake bench unchanged (2 of 8).
- Paid smoke (the live path changed: the fold and one instruction line), cap $2: GPT‑6 Astra medium on
  scenarios 01 and 06, 8 turns, 13 requests, **$0.80**; 0 failed turns, 16/17 checks (the miss is the known
  "delivered job left open" model habit of stage 2b, scenario 06), 0 suspected leaks. The fold fired in 4 of
  8 turns (the one-call-per-request ones) and saved a request each; the other 4 already batched `finish_turn`
  in one message. Medians: first word 4.3 s, turn 21.3 s, $0.084, 1.5 requests, cache reads 75%.
- What to try: nothing new to click. Play a campaign on the new loop as before; a job's reward can no longer
  be paid twice by any path, and a campaign's limits can be lowered through the settings API (the panel
  comes with stage 5).
- Known limits: a job agreed on the old runtime keeps its terms in the quest row, not in the loop's private
  terms, so after a switch the loop asks the DM to record the terms again (`quest update`) before
  `claim_reward`; the loop's item-count limit is enforced in TypeScript only (splits make extra rows, so the
  SQL commit does not count items); the folded finish records no scene kinds for that turn.
- Checks on the final branch state (commit `0ce5ae2` plus this status and two lint fixes in tests): typecheck pass;
  lint pass (0 errors, 0 warnings); build pass; tests 2436 — 2409 pass, 0 fail, 27 skipped (26 HTTP tests
  without `PREVIEW_URL`, by design, + 1 opt-in), 993 s on a laptop shared with another session's suite (a first
  run under heavier load timed out two spawn-script tests at their 30 s limit; both pass alone in 2–10 s, and
  migrations 1..53 and 1..54 both build a PGlite database in ~1.2 s, so there is no slowdown); fake bench on
  `dm-loop-v1` 13 of 13 scenarios, 123/123 checks, no harness problems; old Astra fake bench 2 of 8 (unchanged).

**Stage 2b (accepted) — in short:** the DM tells the story first and acts inside it (first sentence streams at
once, deciding calls before their outcome, bookkeeping in one final message with `finish_turn`); Character
Model bounds became anti-garbage limits; Astra's prompt cache works across turns; a clock note set to text is
rejected as one call. Medians: Opus 5.5 high first word 8.2 s, turn 25.9 s, $0.075; Astra medium first word
2.0 s, turn 14.3 s, $0.093. Details: `docs/SPEED.md`.

**Stage 2 (accepted) — what exists:**
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

**Known issues carried forward:** scripted scenario checks are a poor pass/fail measure for live play (models
rename NPCs, record them at first sight, let jobs fail or leave them open). Switching a real taken-over campaign
is rehearsed on synthetic data only — Stage 6 does it on a copy of the owner's database (`docs/RELEASE_CHECKLIST.md`).
Stale leftover edits from the old detached checkout are in `git stash` ("pre-stage-0: …").

**Next step:** Stage 4 after «дальше». Not started.

The full pre-rebuild status history is in `docs/archive/DEV_STATUS_history.md`.
