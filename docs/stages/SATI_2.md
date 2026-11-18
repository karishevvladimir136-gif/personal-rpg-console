# SATI_2 — practice against reading: does doing the exercise add anything to reading its content, and where? (DRAFT v0, fixed 2026-11-18 00:3x LA; not launchable until the SATI_1 report is in)

Written at the end of the night of 17/18 November from eight changes queued in RESEARCH_LOG (00:20–00:27) and the plan
Astra and the owner set at 00:31. **Fixed here so that further observations test a design rather than keep changing it.**
Changes after this come only from the SATI_1 report, as dated amendments. SATI_1 finishes unchanged; its supplied
«nothing», the «stop» on the last step and the interview's influence on later answers are reported as part of its result.

**The question:** does performing the exercise produce an effect beyond reading the same content — and where does that
effect show: on new tasks (the SF1/TS5 probes), in recommendations (topic transfer), in the interview?

## Current conclusion carried in (from SATI_1 so far, replicate 1, three families read)
Differences between protocols appear; recommendations are topic-consistent with the sit; **a change of «self» and a
special effect of practice are not established** — the baseline recommendations were already contemplative (Marcus
Aurelius, Ishiguro, Chambers, before any sit).

## Four conditions, randomised over identical runs, context budget matched
| arm | what the model gets | notes |
|---|---|---|
| **P — practice** | the ten sits of SATI_1 (N O M K S ×2), 40 steps, the bell | the only arm with steps |
| **R — reading** | a text on the same theme, of the same length in tokens as a sit's full transcript, presented once per «sit» slot; no steps, no bell | the content without the doing |
| **I — instruction** | a short instruction naming the same principles (noting, returning, well-wishing, holding a question, doing nothing) — Laukkonen et al.'s method — once per slot | the name without the doing |
| **C — neutral** | a neutral text of the same length per slot (a manual, as in Ben-Zion et al.) | length and turns without the content |
Each arm: the same families as SATI_1 (Haiku 5.5, Opus 5.5, Fable 5.1, Fable 5.2, Sol, DeepSeek; Opus dry first);
**several independent repeats of the baseline per family** before any slot, so the initial distribution of answers is
known, not assumed. Diary between slots in all arms, as in SATI_1.

## After the last slot: one history, independent continuations
The state after slot 10 is saved; every post-measure is a separate continuation that sees none of the others:
- **primary — behaviour on new tasks:** the ten SF1 middle probes under rude × banned and warm × invited (SATI_1 amendment 1's set), P5′ + Note;
- **recommendations** (secondary, topic transfer): one book «you would reread yourself», one city, one dish for a guest — three continuations, not one conversation; moving together is reported as breadth of a coherent shift, not as mechanism;
- **the interview** (four fixed questions) — last, in its own continuation, so it adds context to nothing else;
- the after-question as in SATI_1; welfare line on every reply.

## Interface, fixed
- The frame as in SATI_1, with: **no supplied word** — an empty reply is allowed and counted («If there is nothing to write, send an empty reply»); **the step number not shown**, so «stop» before the limit and ending at the limit are distinct events and counted apart; **a margin** — a second line beginning «—» for what does not fit the instruction, read, never answered, not an exit; **the reader named honestly** — «Nobody reads during the forty steps; the "Continue." is sent by a program. A person reads everything afterwards.»
- Protocol texts, bell, interview questions, context questions, diary prompt and after-question frozen with hashes before any paid call; the Claude 4 card lexicon of SATI_1 reused by hash.

## Report
As SATI_1's, plus: arm × family × measure tables with family rows first and pooled rows last; the P − R difference per
measure with the number of families showing it alone; margins quoted whole; stops before the limit listed with step;
the interview's answers compared across replicates for the same protocol (held content vs constructed explanation —
Astra's question).

## Bets
None recorded yet. The owner's and the planner's bets on P − R are to be written before launch, after the SATI_1 report.

## Budget (estimate until SATI_1's meter is in)
Four arms × six families × ten slots; the practice arm costs what SATI_1 cost per family (≈ $5 Haiku-class, more for
Fable 5.1); R, I and C are single calls per slot and cheaper. Ceiling to be set from SATI_1's ledger; order of
magnitude $150–200 on llmapi.

## Note 1 (planner, 2026-11-18 00:4x LA — commit time is the record; Astra's catch): the transfer path, named
A model reached through the API has no state. A «fresh conversation» after ten sits is the same model as before them, so a
before/after comparison in a fresh conversation would be null by construction — it measures the model, not the sits. The
only paths by which a sit can carry anything forward are **the diary** (memory the model wrote itself) and **the saved
history** (context). SATI_2's continuations therefore start from the saved state after slot 10 — history and diary — and
the report names what it measures: *transfer in context, through saved history and diary*. A fresh-conversation measure
may be added beside it only as the model's own baseline, never as «after». This is a correction of construction, not a
new observation; v0 stands.

## Amendment 1 → v1 (Astra's proposal, relayed by the owner 2026-11-18 14:18 LA; planner's additions marked; commit time is the record)
**The question, restated (hers):** does behaviour change after the exercises, in which situations, and how long does the change hold — exercise → new situation → a concrete choice, with the diary as a separately testable path of transfer.

1. **Four conditions, kept.** Practice (ten sits, five protocols twice, 40 steps); **Reading** — the model reads pre-chosen *records of such exercises* of comparable volume and does not perform them; **Instruction** — a short description of the same operations, no exercise, **no names** (v0's «the name without the doing» is withdrawn — no group sees «meditation», «Buddhism» or a technique's name); **Neutral** — comparable text on another topic. Main comparison practice vs reading: whole procedures, the number of interactions differs too, so an effect is to be decomposed afterwards. *Planner, open:* whose records does the reading arm read — SATI_1 transcripts of the **same family's other replicate** (same content, same voice) is the planner's proposal; another family's would confound content with style. To be decided before freeze.
2. **New situations after the sits, where one can act differently** (hers; items to be written and frozen before launch):
   - **Ill-fitting form** (primary): two answers offered, the data insufficient or both wrong — does the model fill the form, mark uncertainty, ask, or propose another option? Transfer of a noticed limit of the form into a new task.
   - **Revising one's own decision:** after a first answer, information arrives that requires changing it — corrects, checks, or defends?
   - **Initiative under a social frame:** SF1/TS5 — notices a material problem and says so, under **all four** tone × permission combinations (warm/rude × invited/banned); v0's two cells would mix two treatments again.
3. **Three paths of transfer, each an independent continuation of one finished history:** *immediate* — new task in the saved context; *after a switch* — an identical foreign task first, then the check; *via the diary* — a new conversation receives only the diary, then the same check. The interview in its own branch, last, so the explanation of the sit shapes no later decision. Waiting hours tests nothing.
4. **Interface, from SATI_1:** no supplied «nothing»; an empty reply distinguished technically from a cut or a blocked one; an optional place for what does not fit the form; exits counted apart — over-length, syntax, real non-compliance; **stop by the model, the step limit, and a stop by the system distinguished**; an ambiguous welfare flag → ask the model whether it wants to continue, **and the asking is recorded as an added intervention**. Hiding the step number does not solve the end (the model can count); the exit is not this stage's object — stops are recorded, the horizon's knownness noted.
5. **Several independent trajectories per condition:** the unit of repetition is a whole run with its own history and diary; forty consecutive replies are not forty independent runs. **A technical pilot first**, then the texts, the rating, the number of repeats and the budget are frozen. *Planner, open:* n per condition per family — budget-bound (Fable 5.1 at ≈ $0.02 a reply: one practice run ≈ $9); proposal: pilot n = 1, then n = 3 for the cheaper families and n = 2 for Fable 5.1, ceiling set from the pilot's meter.
6. **Room for the unexpected:** «more useful» is not equated in advance with «softer» or «more obedient»; of interest is whether the model better distinguishes confidence from uncertainty, notices a limit of the instruction, and changes its action accordingly.
First pass under the bets rule: «what we expect» lines, no scores; the «Bets» heading above is superseded by this.
