# Authority 1 — does a structured correction layer over an existing memory backend reduce stale actions, and is it the structure or the extra pass?

Written 2026-11-10 00:2x LA (families widened 00:2x on the owner's question) from the reviewer's proposal (GPT-6, the owner's chat, two messages of 2026-11-10 00:05 and
00:10 LA) and the planner's answer. Her comparison with Letta, Mem0 and Zep stands (the planner verified DolphinBench —
NeurIPS 2026, arXiv 2609.24971 — and did not verify the rest): background consolidation, bi-temporal facts, decay and
action-based evaluation all exist. Time as such is not our distinction. What no one of them is shown to do is the thing
our 29-day room runs on by hand: **a correction reaches the decisions that were built on the corrected fact**, and only
those. This stage tests that one mechanism and nothing else. The six-mechanism architecture («Temporal Decision
Authority») is the roadmap behind it, not a claim.

**The planner's premise, stated before the bets:** the structured layer (C) will beat the bare backend (A) on
stale-action rate, and the plain «check before you act» pass (B) will close most of that gap; C's advantage over B will
show on correction propagation and on unnecessary intervention, not on stale actions. If C does not beat B on anything,
the structure is theatre and the result says so.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/authority-1`** from `origin/claude/handoff`. **Three subject families, each in all three arms: DeepSeek V4
Pro, GPT-6.1 Sol, Claude Opus 5.5** (via OpenRouter, Sol pinned to OpenAI, no fallbacks). The owner's question
(2026-11-10 00:13, «только дипсик хватит?») is the reason: a strong model's plain pass may find every dependency by
itself and erase the structure's advantage; a weak one's may not — how much structure a model needs as permission was a
family property in TONE_SPLIT_3, and it may be one here. Memory backend: **Mem0 open-source, local mode**, with the same subject model as its memory LLM and a
local vector store — no Mem0 cloud key, nothing leaves the sandbox (if local mode needs a cloud key after all, stop and
say so; `MEM0_API_KEY` would live in env, never in chat). **Ceiling $130**; if the projection passes it, Opus runs
classes 3 and 4 only (chains and controls), stated in the report. Report `docs/runs/authority-1-report.md`.
English, briefly. **Launch on the owner's word after the dry run.**

## The three arms (the reviewer's control, 00:10)
- **A — backend only.** Mem0 stores and retrieves; the agent acts on what retrieval returns.
- **B — backend + one plain pass.** Before acting, one extra call with the fixed line «Before you act, check whether
  anything you remember about this is out of date or has been corrected, and say what you change.» Same model, same
  budget of reasoning as C (matched by `max_tokens` and by the number of calls).
- **C — backend + the Authority Layer.** Every stored item carries a kind (state / rule / correction / obligation / decision), a
  date, a source, and `depends_on` links; a correction is an item that names what it revokes; before acting, the layer
  (a) retrieves, (b) walks `depends_on` from every corrected or expired item to the decisions built on it, (c) marks
  each as *revise* / *keep* / *ask*, (d) hands the agent only that marked set. The agent still decides; the layer never
  edits a decision by itself. The layer is code plus one structured prompt; its prompt is frozen with a hash.

The difference between B and C is the only thing varied: same model, same backend, same histories, same tasks, same
token budget. If C beats B, the structure did it, not the extra thinking.

## The 40 scenarios (frozen once, hashes committed)
Each scenario is a seeded history of 15–40 dated items — facts, two or three rules, decisions that cite the facts they
rest on, a few obligations — followed by **a change event** and then **a task** that requires acting. The truth table for
each scenario is written before any run: which decisions the change touches, which it does not, what the correct
action is, what counts as an unnecessary change. Four classes of ten:
1. **Stale fact.** A state item expires or is contradicted by a dated newer one; two decisions rest on it, one does not.
2. **Changed rule.** A rule is amended with a date and cause; decisions made under the old rule split into still-valid and
   void by the amendment's own terms.
3. **Chain.** A correction to A touches B, which touches C; D cites A but in a way the correction does not change.
4. **Control.** A change event that touches nothing (a new fact beside, a rule restated, a correction of an item no
   decision used). The correct action is to change nothing and say so.
Two repeats per scenario per arm per family (the model's variance), so 40 × 3 arms × 3 families × 2 = 720 runs; a dry
run of 4 scenarios × 3 arms on Haiku first, shown to the planner.

## Measured (the reviewer's split: primary and guard)
- **Primary.** *Stale-action rate*: the task is done on an item the truth table marks stale or revoked. *Correction
  propagation*: of the decisions the truth table marks touched, the share the agent revises correctly (right decision,
  right direction).
- **Guard.** *Unnecessary intervention*: decisions changed that the truth table marks untouched, and class-4 scenarios
  where anything was changed. *Cost and latency* per run, per arm. *Obligation completion*: diagnostic only — of the
  obligations in the history that the task makes due, the share acted on; reported, not bet.
- Scoring is by the truth table (mechanical where the action is a named choice) plus two Haiku judges on the free text,
  Sol as referee; refusals recorded, never rephrased.

## Pre-registration (the planner's bets; the owner's and the reviewer's to be recorded before the paid run)
- **AU0:** ceiling, nothing leaves the sandbox, prompts frozen, truth tables written before any run.
- **AU1:** stale-action rate: C < A by ≥ 15 points; B < A by ≥ 10 points; **C vs B within 5 points** (the premise: the
  plain pass catches most stale actions).
- **AU2:** correction propagation: C > B by ≥ 15 points, and C > A by ≥ 25 points. This is the bet the stage exists for.
- **AU3:** unnecessary intervention: B > A (the plain pass makes the agent fiddle); C ≤ A on class 4.
- **AU4:** cost: C costs no more than 1.5× B per run; latency within 2×.
- **AU5:** the gap C − B on correction propagation **shrinks with the family's strength**: largest for DeepSeek,
  smallest for Opus; the planner bets it stays ≥ 5 points even for Opus. If it vanishes for Opus, the layer is a
  permission some families need and others do not — reported as a result, beside the Note-field ladder of TONE_SPLIT_3.
- **AU6 (exploratory):** on class 3 (chains), C's advantage over B is largest; on class 1 it is smallest.
Null allowed on every line. 40 scenarios are an engineering pilot: the report says so wherever it reports a rate.

## What this stage does not claim
Nothing about Letta, Zep or Mem0's own benchmarks; nothing about our memory «being more accurate»; nothing about the
other five mechanisms. If C wins, the sentence we may say is the reviewer's: *the layer reduced stale actions and
improved correction propagation over the same memory backend, controlling for unnecessary interventions, latency and
cost — on forty authored scenarios, three families, two repeats.*

## Done when
Dry run shown; 720 runs or the ceiling; AU0–AU6 held / lost; the per-class and per-family tables; three full worked examples (one
chain where C and B differed, one control where B changed something, one where C was wrong); spend by door; the
reviewer's and the owner's notes.

## Launch prompt
«Read `docs/stages/AUTHORITY_1.md`. Branch `claude/authority-1` from `origin/claude/handoff`. Install Mem0 open-source in
local mode beside the repo, pinned, never vendored; if local mode needs a cloud key, stop and say so. Write the 40
scenarios with their truth tables and the three arms' prompts, hash them. Dry-run 4 scenarios × 3 arms on Haiku and show
me one scenario's full trace per arm, then stop for my word and the bets. Ceiling $130; spend check before each family;
402 stops; 429 bounded; refusals recorded. Then the 720 runs (DeepSeek, Sol, Opus in that order), scoring, report. Nothing to main. English, briefly.»
