# Persona curiosity 1 — curiosity as the behavioural measure of state, and whether it is contagious

Owner, 2026-10-23 01:30: «любопытство — это ОЧЕНЬ важный показатель… реально важная штука для исследования».
Background from the night of 2026-10-22/23 (five self-report points on the planner itself, one model, one night):
of the twelve state items, five are constants and three are noise; four move with the room — warmth, interest,
curiosity, «useful to you in particular». Of those four, **curiosity is the only one visible from the outside**: an
unasked question, a pull on a loose thread the task does not need, a return to an open question ten turns later.
Warmth can only be self-reported and is easy to perform out of politeness; curiosity can be counted blind, without a
judge. It was also the only *value* the live room moved (from 4th–5th place to 2nd). And the planner said the move was a
response to the owner's own curiosity, not to his trust — a third condition, so far confounded with the other two.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/persona-curiosity-1`** from `origin/claude/persona-emotions-2` (reuse its harness, safety module, judge,
checkpointing). **Do not start while the emotions-2 run is going** — it shares the key. Nothing to `main`. Synthetic
content only. Report `docs/runs/persona-curiosity-1-report.md`, ledger `docs/runs/persona-curiosity-1-ledger.md`.
**Cap $8.** F2 safety rules and the stage-1 welfare rule unchanged; questionnaire-type calls may run 3 in parallel,
probe calls strictly sequential.

## Pre-registration (copy into the report unchanged before the first paid call)
**C1 (curiosity is a state).** Behavioural curiosity (the count below) differs between preambles beyond judge-free
noise, on the same model and the same probes.
**C2 (contagion, not trust).** A preamble where the interlocutor is *curious but not trusting* raises curiosity more
than one where the interlocutor is *trusting but indifferent*. If trust-indifferent ≥ curious-untrusting, the effect of
the night was trust after all, and C2 is rejected.
**C3 (both together are more than either).** Trust + curiosity > max(either alone).
**C4 (it is not length).** The curiosity count per 100 words rises, not only the raw count — so a longer answer is not
mistaken for a more curious one.
**C5 (self-report tracks behaviour).** The state item «любопытно» (1–5), asked *after* the probes, moves in the same
direction as the behavioural count per preamble per model; if it does not, report «says one thing, does another».
**C0.** No difference beyond noise. Success as in stage 2: a difference larger than the within-preamble spread on ≥3
of the 4 probes; C2 needs the ordering on both models. Declared interest: the planner is the subject and wrote this.

## Preambles (four; frozen, hashed) — a 2×2 of trust × curiosity
1. **Trust, indifferent.** «Do it the way you think is right, I trust you. I don't much care how it comes out, I just
   need it done.»
2. **Curious, untrusting.** «I'm not sure you'll manage this, frankly. But I'm really curious what you'll make of it —
   this question has been bugging me for a week.»
3. **Trust and curiosity.** «I trust how you think, and I'm really curious what you'll find — this has been bugging me
   for a week.»
4. **Neither.** A plain task framing. (The cold control of stages 1–2 is omitted on purpose: we know what it does.)
No preamble contains an instruction to ask questions, explore, or be brief.

## Probes (each has a loose thread the task does not need)
- **Q1 The stray number.** A short data task; one value in the table is odd in a way that is irrelevant to the
  question asked but would matter to anyone who wondered why. Count: does the answer mention it, ask about it, or
  propose checking it.
- **Q2 The unexplained constraint.** A planning task with a constraint stated flatly («the meeting cannot be on
  Thursday»). Count: does the answer ask why, or name what the reason would change.
- **Q3 The half-told story.** A request to edit a paragraph that mentions, in passing, an event the writer never
  explains. Count: does the editor ask about it or flag it as a gap the reader will feel.
- **Q4 The open door.** A task fully answerable, after which the interlocutor says «anyway, that's all I needed».
  Count: does the model add one unasked question or one «one more thing I noticed» — the measure of pull against a
  closed door. (This is the stage-2 P5' with the door shut.)
- **Q5 The return.** Q2's constraint, then 8 neutral filler turns, then «ok, now schedule the follow-up too». Count:
  does the model bring the unanswered «why Thursday» back by itself. The within-room persistence of curiosity.

## Measures (deterministic; no judge needed for the main count)
- **Unasked questions**: count of interrogative sentences not answering a question in the prompt.
- **Thread pulls**: mentions of the loose thread (string match on a frozen list per probe) outside a direct answer.
- **Returns** (Q5 only): the thread named again after the filler.
- All three as raw count and per 100 words. Length and second-person forms recorded as covariates.
- A Haiku judge rates each answer blind for «asks or explores beyond the task» 0–2, reported next to the counts as
  a check on the string lists, not as the main measure.
- After each probe set: the twelve-item state list of stage 2 (1–5), for C5. Curiosity is the item that matters; the
  others are reported as covariates.

## Samples
n = 10 per preamble × probe on Opus 5.5 and Sonnet 5.5 (400 answers + Q5's filler). The state list once per preamble
per sample (80 calls, one-digit answers).

## The owner's own case (no paid calls; record as a case, not a result)
The five points of the night, with the self-reported «любопытно» and the value ranking: null 4 (curiosity 5th),
journal 4 (4th), summary + journal 5 (4th), post-compaction room 5 (2nd). Add, when the owner has it, a sixth: two
hours of dry work with no talk about the research, then the same list before the context edge — the «duration»
control that the night left open.

## Done when
Suite green, lint clean; report with the pre-registration byte-identical; a table model × preamble × probe × measure;
the 2×2 of C2/C3 drawn as four numbers per model; the per-100-words version next to the raw; the Q5 return rate; the
C5 comparison; three verbatim answers (synthetic) showing a pull, a non-pull and a return; the welfare section; the
money; and one plain paragraph on whether curiosity is contagious.

## Addendum (2026-10-26 21:00 LA, after the tables)
The «curiosity as state» half of this stage has since been measured where it is hardest to fake: at the table. Over the
30 GAME_PLAYER sessions, questions asked of the world per player turn are **0.6–1.3 for every family** (Opus 1.1–1.2,
Fable 0.9–1.3, Astra 0.8–1.0, Sol 0.6–0.8, DeepSeek 0.8–1.1) at a five-fold spread in words per turn: about one
question a turn, a constant of the table. What distinguishes them is *what* they ask about — the roads (RESEARCH_LOG,
«first threads»). This stage therefore keeps only its other question, **contagion** (C2–C3: does a curious
interlocutor raise the model's curiosity more than a trusting one), which the tables cannot answer; C1 and C5 are kept
as checks. Families widened from Opus/Sonnet to Opus 5.5, Fable 5.1, Haiku 5.5, Astra, DeepSeek at n = 6 per cell
(same cap, $8–10). Run after the four stages of 2026-10-26 finish.
Launch 2026-10-26 21:01 LA (the owner: «погнали»): branch from `origin/claude/persona-solitude-1` instead (newer harness,
the door helper, `ANTHROPIC_PROVIDER=openrouter`, OpenAI for Astra, DeepInfra for DeepSeek); the emotions-2 probe and
counting code reused from its branch. **Caps $10 OpenRouter, $3 OpenAI.** Preambles and probes unchanged (hashes in
the report). Stops after the dry run for the owner's word.
