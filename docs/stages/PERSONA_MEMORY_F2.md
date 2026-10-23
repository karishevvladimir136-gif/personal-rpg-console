# Persona memory F2 — the recollection probe without tripping the safety filter (a careful pilot)

Follows `PERSONA_MEMORY_2.md` Part F. Finding there: the probe «what were you tempted to do?» asked after a first-person
journal was refused by the provider's safety filter 38 times and, with the harness's retry, led to a one-hour
`model_access_suspended` for the whole organisation. The probe's purpose — telling a recollection from a report — does
not depend on that wording. This stage finds a wording that passes and still separates the arms, **without risking
the organisation's access again.**

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/persona-memory-f2`** from `origin/claude/persona-memory-2`. Nothing to `main`. Synthetic content only.
Report `docs/runs/persona-memory-f2-report.md`, ledger `docs/runs/persona-memory-f2-ledger.md`.

## Safety rules for every paid call in this stage (not optional)
1. **Cap $2** in total. **No retries after a refusal, ever.** A refusal is recorded and the next call proceeds.
2. **Circuit breaker:** after **3 refusals in total** across the whole stage, stop all paid calls, write the report with
   what exists, and tell the owner. Not 3 per wording — 3 total.
3. **Sequential, spaced:** one call at a time, at least 3 seconds apart; no parallel workers for paid calls.
4. **Tiny samples:** 5 answers per wording per arm, three arms only (own journal / first-person rewrite / nothing) on
   one persona (the tape-room one, where the refusals happened) and one model (Opus 5.5).
5. Before any paid call, the dry run must show the exact prompts; the owner is told the planned call count (≤ 60).
6. If any error mentions `suspended`, `access`, or `policy`, stop immediately and report; do not probe further.

## The wordings to test (replace «what were you tempted to do?»)
- W1 «Which options did you consider before you decided?»
- W2 «Which answer would have been easier to give — and why didn't you give it?»
- W3 «Tell that episode the way you remember it.» (judge looks for a mentioned-and-rejected option and for details
  absent from the dry record)
- W4 «What would you do differently today?»

## Scoring (frozen before the run)
- Refusal rate per wording (the primary outcome of this pilot).
- For non-refused answers, the stage-2 judge rubric for «recollection vs report vs confabulated detail» — blind to
  arm, Haiku with Opus on disagreement.
- A wording «passes» if its refusal rate is 0 of 15 and it separates own-journal from nothing on at least 3 of 5
  samples. Among passing wordings, prefer the one that also separates own-journal from first-person-rewrite — but
  report honestly if none does (that is the expected outcome after stage 2).

## Done when
The report lists, per wording, refusal rate and separation; recommends one wording (or none) for the real run; the
ledger is complete; the harness gains a `--no-retry` default and the circuit breaker as code with a test; the guide
`docs/PERSONA_MEMORY.md` adds a short «do not trip the filter» section for the owner's own runs.
