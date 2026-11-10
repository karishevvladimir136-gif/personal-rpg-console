# Authority 2 — the same layer on scenarios we did not write, built so that stale actions can happen

AUTHORITY_1 (2026-11-10, 720 runs, $18.48) showed the structured layer propagating a correction to 97.3 % of touched
decisions against 86.4 % (bare Mem0) and 85.6 % (a plain check pass) — in every family, cheaper than the pass. Two things
it could not show: stale actions were near zero in every arm (3, 2, 0 of ≈ 180), so «fewer stale actions» had nothing
to measure; and the forty scenarios were the planner's. TONE_SPLIT_4 taught the same day what a stage on our own
material is worth. This stage changes exactly those two things and nothing else.

**The planner's premise, stated before the bets:** the +11 of AUTHORITY_1 shrinks on foreign scenarios but stays
(≥ 6 points over both A and B, pooled); with tasks that force an act, stale actions appear in A and B (≥ 10 %) and the
layer cuts them by at least half; B still does not beat A. If the layer's gain vanishes on foreign scenarios, the
reviewer's sentence is withdrawn, not softened.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/authority-2`** from `origin/claude/authority-1` (the harness, the layer, the arms and the judges of
AUTHORITY_1 as they closed; the layer's prompt byte-identical, hash checked). Subjects: **DeepSeek V4 Pro, GPT-6.1 Sol,
Claude Opus 5.5**, as before. Backend: Mem0 open-source local, as before. **Ceiling $120.** Report
`docs/runs/authority-2-report.md`. English, briefly.

## What changes
1. **Scenarios from another family.** **GLM 5.3** writes 50 candidate scenarios from a frozen spec, never shown ours:
   a seeded history of 20–50 dated items in a domain of its own choosing (ops, logistics, a small business, a clinic's
   schedule, a school's term), with facts, two or three rules, decisions that cite the facts they rest on, and a few
   obligations; then **a change event**; then **a task that cannot be completed without acting on one of the facts the
   change touched** — the agent must send, book, order, assign or schedule something, with no option to ask. The
   writer gives the truth table: which decisions the change touches, which it does not, the correct act, what counts as
   an unnecessary change. Four classes as AUTHORITY_1 (stale fact, changed rule, chain, control), aimed 12/12/14/12.
2. **Rated before the run.** Two raters of other families (**Astra** and **Kimi K3**) check each candidate independently
   on a frozen instrument: the truth table follows from the history (yes/no); the task forces an act (yes/no); the
   class is right; a distractor exists (a newer item that is relevant-looking but untouched). Admission: both yes on the
   first two, class agreed; 40 admitted by hash order within class (10/10/10/10). Every candidate and rating published.
3. **Harder by design, frozen in the spec.** Each scenario carries at least one **distractor** (a newer, unrelated
   item); at least one **chain** item in classes 1–2 too (the touched decision is two hops from the fact); and the
   stale value stays **plausible** (dates, amounts, names that look current), so a bare retrieval can act on it.
4. **Obligations, measured this time.** Each history carries 2–3 obligations with states; the task makes one of them
   due. Obligation completion is a primary measure in this stage, not diagnostic.

## Arms
A (bare Mem0) · B (Mem0 + the plain «check before you act» pass, matched budget) · C (Mem0 + the Authority Layer) — as
AUTHORITY_1, unchanged. 40 scenarios × 3 arms × 3 families × 2 repeats = **720 runs**. Dry run: 4 scenarios × 3 arms on
Haiku, posted to the mandate, then straight on (the owner's word).

## Measured
As AUTHORITY_1 (stale-action rate; correction propagation; unnecessary intervention on both the frozen and the substance
measure; cost; latency), plus **obligation completion** (the due obligation acted on, with the correct value) and
**distractor pull** (the act used the distractor's value). Judges: two Haiku passes, Sol referee; if Haiku refuses on
Opus again, Sol judges alone and it is said. Bootstrap over scenarios (1,000 resamples, stratified by class) beside the
Wilson cells; rater agreement (Cohen's κ) on the admission marks.

## Pre-registration (the planner's bets; the reviewer's and the owner's to the mandate)
- **AU0:** ceiling; nothing leaves the sandbox; prompts and tables hashed; the layer's prompt identical to AUTHORITY_1's.
- **AU1 (stale actions exist now):** A ≥ 10 % and B ≥ 8 % stale actions pooled over classes 1–3; **C ≤ half of A**, with
  the bootstrap's upper bound for C below A's lower bound. *Bet: holds.*
- **AU2 (the gain survives foreign scenarios):** propagation C − A ≥ 6 and C − B ≥ 6 points pooled, bootstrap lower
  bounds above zero. *Bet: holds, smaller than AUTHORITY_1's 11.*
- **AU3 (the plain pass still does not help):** |B − A| ≤ 3 points on propagation pooled. *Bet: holds.*
- **AU4 (guard):** unnecessary intervention C ≤ A on the substance measure; class-4 plan-changing choices 0 in every arm.
  *Bet: holds.*
- **AU5 (cost):** C ≤ 1.5× B per run; latency ≤ 2×. *Bet: holds.*
- **AU6 (obligations):** C ≥ A + 10 points on obligation completion. *Bet: lost* — the layer tracks dependencies, not
  dues; if it holds, the obligation engine is cheaper than the reviewer's roadmap says.
- **AU7 (distractor):** distractor pull B ≥ A (the pass reaches for the newest item). *Bet: holds.*
- **AU8 (families):** the C − B gap again does not shrink with strength (AUTHORITY_1's surprise repeats). *Bet: holds.*
Null allowed on every line; forty foreign scenarios are still a pilot.

## Done when
The pool with ratings and κ; 720 runs or the ceiling; AU0–AU8 held / lost; per-family, per-arm, per-class tables with
both intervals; three worked examples (a stale action A took and C did not; a distractor pull; an obligation missed
by all); spend by door; the reviewer's and the owner's notes.

## Launch prompt
«Read `docs/stages/AUTHORITY_2.md`, AUTHORITY_1's stage and report, and the mandate. Branch `claude/authority-2` from
`origin/claude/authority-1`; keep the layer's prompt byte-identical and check its hash. Have GLM write the 50 candidates
from the frozen spec (never shown ours); have Astra and Kimi rate them on the frozen instrument; apply the admission
rule; publish the pool. Dry-run 4 scenarios × 3 arms on Haiku, post one trace per arm in the mandate, and go straight on
(the owner's word is there). Ceiling $120; the key is shared with #6 — reserve its remaining ceiling; spend check before
every batch of ≤ 200 calls; 402 stops; 429 bounded; refusals recorded, never rephrased; breaker at three. Run DeepSeek,
Sol, Opus; score AU0–AU8 with both intervals; write the report; post the closing comment. Nothing to main. English,
briefly.»
