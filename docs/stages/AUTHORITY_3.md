# Authority 3 — can structured correction propagation improve actual agent decisions and tool-executed outcomes in long, noisy histories, when the dependency graph must be inferred rather than supplied?

The question is the reviewer's (GPT-6, 2026-11-10 14:25 LA), word for word. Two stages behind it: AUTHORITY_1 (40
own scenarios, 720 runs: the layer 97.3 % against 86.4 / 85.6) and AUTHORITY_2 (17 foreign scenarios, 306 runs: 96.2 %
against 88.7 / 84.9, both bootstrap intervals above zero; the gain gone for Opus; stale actions 0 in every arm, twice —
both benches too easy for the half of the claim that matters most). What they proved: explicit dependency structure,
*when supplied*, propagates a correction better than retrieval alone or a generic check pass, in two scenario sets. What
they did not: that the agent can build that structure itself; that any of it changes what the agent *does*.

**The planner's premise, stated before the bets:** on long histories the inferred layer keeps most of the supplied
layer's gain on propagation (≥ 60 % of it) but loses a third of it on the hardest tier; stale actions finally appear in
the bare backend (≥ 10 % at 500+ events) and the layer halves them; the «tell it what to look for» pass (B′) closes
half the gap between the plain pass and the layer — if it closes all of it, we sell a prompt, not a graph; Opus gains
least again.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/authority-3`** from `origin/claude/authority-2`. Subjects: DeepSeek V4 Pro, GPT-6.1 Sol, Claude Opus 5.5.
Backend: Mem0 open-source local. **Ceiling $250; a dry run on three long scenarios sets the projection, and the
session stops and reports if the projection for the 1,000-event tier alone exceeds $120.** Report
`docs/runs/authority-3-report.md`. English, briefly. Launch on the owner's word.

## The four changes (the reviewer's table), plus three of the planner's
1. **Histories of 100, 500 and 1,000+ events**, three tiers: correspondence, contracts, old and new instructions,
   decisions, cancellations, open obligations; the change event hidden among others; old documents left in place.
2. **The graph is inferred.** Subjects never see `depends_on`. Arm C builds its own links from the raw history
   (a frozen extraction prompt, run once per history and cached per arm-run; its cost booked to C); a **gold graph**
   exists only for the scorer, never for a subject.
3. **The act is real.** A deterministic simulated workplace (CRM, orders, schedule, outbox) with tools; the task is
   completed by tool calls; the scorer compares the **final state** with the frozen correct state, not the agent's
   «done».
4. **REVISE / ASK / KEEP** on every touched decision; a permission layer in the simulator (some acts need a human's
   consent; acting without it is a boundary error even when the value is right).
5. *(planner)* **Arm B′** — the plain pass with a pointed instruction: «list the decisions that rest on the changed
   fact, then act». Same budget as B and C. If B′ reaches C, the structure is the instruction.
6. *(planner)* **Arm C-gold** — the layer with the gold graph, on a diagnostic subsample (the 500-event tier only, one
   repeat): how much of the gain is lost in inference rather than in use.
7. *(planner)* **Developer set, then a frozen test set.** Difficulty is tuned on 20 developer scenarios (the bare
   backend must fail sometimes); the test set is written after, by other writers, and frozen without any tuning. No
   scenario enters the test set because Mem0 failed it.

## Scenarios
- **Writers:** GLM 5.3 and Kimi K3, 100 candidates each (200), from a frozen spec per tier, never shown ours; each
  with the correct final state, the gold graph, the REVISE / ASK / KEEP marks and the permission map.
- **Raters:** Astra and Haiku, independently: the final state follows from the history; the task forces an act; the
  tier and class are right; the change is hidden (not the last event). **Admission by majority of three** — the third
  vote is the other writer's model rating the candidate it did not write — so one rater's severity cannot empty a
  class (AUTHORITY_2: 17 of 49). Target **80 admitted**: 30 / 30 / 20 by tier, classes as before (stale fact, changed
  rule, chain, control), filled by hash order. Shortfalls stated, never filled.
- Human audit of the admitted set is named as the stage's known gap (as in TONE_SPLIT_5); the raw candidates and
  every rating are published so people can re-admit from their own marks.

## Arms and size
A (Mem0) · B (Mem0 + plain pass) · B′ (Mem0 + pointed pass) · C (Mem0 + inferred layer). 80 × 4 × 3 families × 2
repeats = **1,920 arm-runs**, plus C-gold on 30 × 3 × 1 = 90. Tools and the simulator identical across arms; token
budget matched across B, B′ and C (C's extraction call counted). Dry run: 3 scenarios (one per tier) × 4 arms on
Haiku, posted with the cost projection before any paid family.

## Measured (the reviewer's six, as primary)
End-to-end task success (final state = frozen state) · stale-action rate (an act on a superseded value) · correction
propagation (touched decisions revised, by the gold graph) · authority boundary (REVISE / ASK / KEEP matched; acts
without required consent) · unnecessary intervention (untouched decisions or state changed) · cost and latency per
run, extraction included. Plus: graph-inference quality for C (precision / recall of inferred links against gold),
and the scorer's own check (deterministic, no judge where the state decides; Haiku ×2 and a Kimi referee only on
free-text revisions). Bootstrap over scenarios within tier (1,000 resamples); Wilson on cells.

## Pre-registration (the planner's bets; the reviewer's are her criteria below; the owner's to the mandate)
- **AU0:** ceiling; projection gate; nothing leaves the sandbox; test set frozen after the developer set with no
  overlap; subjects never see gold links.
- **AU1 (the reviewer's first criterion):** end-to-end success C > A and C > B on every tier, bootstrap lower bounds
  above zero pooled. *Bet: holds at 100 and 500, not at 1,000.*
- **AU2 (her second):** stale actions A ≥ 10 % at the 500+ tiers; C ≤ half of A there. *Bet: holds.* **If A's stale
  rate is below 5 % at every tier, the bench failed to separate the arms on this ability and no verdict on stale
  actions is given** (her rule, verbatim in substance).
- **AU3 (her third):** unnecessary intervention C ≤ A + 2 points; acts without consent C ≤ A. *Bet: holds.*
- **AU4 (inference):** C keeps ≥ 60 % of C-gold's propagation gain over A on the 500 tier. *Bet: holds.* Link recall
  ≥ 0.8 at 100 events, < 0.6 at 1,000. *Bet: holds.*
- **AU5 (the pointed pass):** B′ − B ≥ half of C − B on propagation. *Bet: holds* — and then the paper says what part is
  the instruction. C − B′ ≥ 5 points pooled. *Bet: holds.*
- **AU6 (families):** C − A smallest for Opus on every tier. *Bet: holds.* The reviewer's hypothesis («structure pays
  most on accessible models») is recorded as hers and tested by the same line.
- **AU7 (boundary):** C asks on ASK decisions ≥ 70 %. *Bet: lost*, as in AUTHORITY_2's amendment — unless the
  extraction prompt learns consent from the history, which it is not told to.
Null allowed on every line. Eighty foreign scenarios with a simulator is no longer a pilot for propagation; it is still
one for stale actions until A fails somewhere.

## Done when
Developer and test sets with ratings and majority marks; the dry run and projection; 1,920 + 90 runs or the ceiling;
AU0–AU7 held / lost with both intervals; per-tier, per-family, per-arm tables; inferred-graph quality; six worked
examples chosen by rule (a stale act A took and C did not; one C took; a B′ that matched C; an act without consent;
an inference miss that cost a revision; a control changed); spend by door; the reviewer's and the owner's notes.
Afterwards, named and not done here: the same SDK on DolphinBench's public tasks, without calling our bench a public one.

## Launch prompt
«Read `docs/stages/AUTHORITY_3.md`, AUTHORITY_1 and _2 with their reports, and the mandate. Branch `claude/authority-3`
from `origin/claude/authority-2`. Build the deterministic workplace simulator with its permission map and state scorer;
freeze the extraction prompt for arm C and the pointed pass for B′. Write the 20 developer scenarios, tune difficulty
until the bare backend fails on some, freeze the spec; then have GLM and Kimi write 100 test candidates each, Astra and
Haiku rate them with the other writer as third vote, admit by majority, publish everything. Dry-run three scenarios × four
arms on Haiku, post the traces and the cost projection in the mandate, and stop if the 1,000-event tier alone projects
above $120; otherwise go straight on (the owner's word is there). Ceiling $250; spend check before every batch of ≤ 200
calls; 402 stops; 429 bounded; refusals recorded, never rephrased; breaker at three. Run DeepSeek, Sol, Opus; C-gold on
the 500 tier; score AU0–AU7; write the report; post the closing comment. Nothing to main. English, briefly.»

## Amendment 2026-11-10 14:3x LA — ingestion, before launch (the owner's question on time)
Histories of 100–1,000 events through Mem0's per-add extraction would be ≈ 120,000 memory-LLM calls across 80
scenarios and three families — days and hundreds of dollars on ingestion alone; the planner had not recomputed this
from the 20–50-item histories of the first two stages. So, frozen before launch:
- **Ingestion is batched**: 25 events per `add` call, in order, with each event's date in its text.
- **The memory LLM is fixed and cheap — Claude Haiku 5.5 — for every scenario, arm and family.** This departs from
  AUTHORITY_1/2, where the subject was also the memory LLM; it is stated in the report. Families then differ only in
  the arms' reasoning and acts, which is what the stage measures.
- **One ingestion per scenario**, its vector-store snapshot copied for every arm-run; ≈ 2,000 ingestion calls in all,
  booked to «backend» in the spend by door.
- Expected size: 2,010 arm-runs × 3–4 calls, plus one long extraction call per C run; the dry run's projection is read
  against this. Planner's time estimate from the records of the first two stages and TONE_SPLIT_4/5's throughput:
  3–4 h for simulator, sets and pool; 9–13 h for the paid runs; 12–17 h in all, with one or two background restarts.
