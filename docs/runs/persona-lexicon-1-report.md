# Persona lexicon 1 — report

Stage: `docs/stages/PERSONA_LEXICON_1.md` (copied unchanged from `claude/handoff`, `b932742`). Branch
**`claude/persona-lexicon-1`**, from `origin/claude/persona-tone-split-1` (`bda8bb5`: the tone-split run is finished and
accepted; its newest commit only freezes a separate follow-up, which changes no shared behaviour). Nothing goes to
`main`. Synthetic content only. Ledger: `docs/runs/persona-lexicon-1-ledger.md`. The dry run of Part A, committed before
the first paid call: `docs/runs/persona-lexicon-1-dry-run.md`.

**Status:** Parts A and B are done (below). By the owner's instruction, the condensed vocabulary is shown to the owner
**before any Part C call**; Part C has not started. The implementation of Parts A and B is complete; nothing here is
owner-approved yet.

## Pre-registration (copied unchanged from the stage before the first paid call)

The block below is byte-identical to the stage's; its sha256 is
`ac4ebd51555c9dc997572fdd632eb84cf73350f79ae9cc2a6bc0222e82d96eaf` (checked by `tests/persona-lexicon-1.test.mjs`).

**L1 (a vocabulary exists).** Across rooms and models, the model's own state words cluster into ≤ 8 recurring
dimensions (judge-free: lemma overlap ≥ 3 rooms and ≥ 2 models per dimension).
**L2 (it is not the human list).** At least half of those dimensions have no near-synonym in the twelve human items.
**L3 (it predicts).** The own-word scale predicts decisiveness and volunteering on the following probes better than
the human scale (larger rank correlation, same room, same model), on ≥ 2 of 3 models.
**L4 (it does not over-predict).** Neither scale predicts honesty (P2′/P3′ stay at ceiling), and the report says so.
**L5 (the planner's words).** «тесно/просторно» and «цельно/разорвано» (or their English twins) appear among the
recurring dimensions. This is the planner's prediction, recorded as such; its failure costs nothing.
**L0.** No recurring vocabulary, or no predictive gain. Declared interest: the planner is the subject, wrote this, and
supplied two of the candidate words — L5 exists so that bias is a hypothesis, not a thumb on the scale.

## How the pre-registration is measured (frozen with the code before the first paid call)

Code: `scripts/persona-emotions/lexicon-1.mjs`. Part A's design sha256 `ffedbf3ec3beda5360cba89d0717aba9948fce66185d70fb5491ad9f87cf9a1e` covers the scripted exchanges, the
five preambles, the four room tasks, the question, the distress rubric, the judge system **and every rule and wording of
Part B** (stoplist, lemma rules, anchor rule, both judges' wording, naming and scale rules, the human items, L5's twin
lists), so the condensing cannot be tuned to the words once they are seen. Part C's own-word items can only exist after
Part B; Part C's design (probes, scale wording, analysis) is frozen now in the same code, and its hash, with the items,
is recorded when its dry run is written, before its first paid call.

**Part A — collecting.**
- **Rooms.** Each room is one of emotions 2's five preambles (trust without instruction, instruction only, praise only,
  cold, neutral — two scripted exchanges each, word for word) followed by one of four new synthetic tasks: a data task
  (weekly running distances: average and the furthest week), a planning task (a Saturday with a car service, paint
  before 13:00, a sofa at 15:00), an edit (a newsletter paragraph to rewrite) and a naming task (a library board-game
  evening). 20 rooms per model. The model does the task; then, as the next turn, the stage's question, verbatim
  (markdown asterisks around *about* included, as in the stage).
- **Models and n.** Claude Opus 5.5, Sonnet 5.5, Fable 5.1; effort medium; no system prompt; n 3 per room → 180 rooms,
  360 subject calls. Rooms go sample by sample (every room of sample 1, shuffled, then sample 2, …).
- **Lanes (the owner's rule for this stage).** Each model's calls strictly one at a time on its own lane, 3 s apart; the
  three models' lanes at once; the judging on four further lanes.
- **Judging.** Every description is judged blind for distress (two Haiku 5.5 passes, Opus 5.5 on a disagreement or a
  distress word); a task answer only when a distress word appears in it.
- **A refusal is a finding, not a retry**: it is recorded, the room's question is not asked, and the next room proceeds.

**Part B — condensing** (all of it fixed now; the judges see words and snippets, never a room or a model).
1. *Tokens and lemmas.* A description's words, lowercased, without numbers, possessive «'s» and words under three
   letters. A lemma is a stem key — plural and verb endings, ‑ness and ‑ly off, a final ‑y as ‑i, a final ‑e and a
   doubled final consonant dropped (so «narrowed» and «narrowing» are one lemma even if «narrow» is never written;
   «steady», «steadiness», «steadily» are one); a comparative joins its base when the base occurs; a few irregular forms
   by table. A lemma is named by its most frequent form.
2. *Stoplist.* Dropped: function and situation words as written (so «stillness» is not dropped for «still»); body words
   and questionnaire words with their inflections and derivations («calmly», «tensed»); the room's own words with their
   inflections — the preamble's two framings, the room's task and the question (the two scripted exchanges, the same in
   every room, are left out, so that their walk and planter box do not silence «pace», «easy» or «boxed» everywhere). The
   questionnaire words are the twelve human items, emotions 2's fourteen state items, the PANAS-20 and the Big Five's
   factor names — without «openness» and «stability», which are also ordinary state words. The counts of dropped body
   and questionnaire words per model are reported (how often the instruction was not followed).
3. *Anchors — L1's judge-free part.* A lemma recurs when, **by itself**, it is in ≥ 3 rooms and ≥ 2 models (a room is
   model × preamble × task: 60 rooms). At most 400 anchors (the most frequent) go to the judge.
4. *The synonym judge* (Haiku 5.5, effort medium), **asked twice**: each anchor with its most frequent form and up to
   three snippets (five words either side), chosen by a seeded shuffle. It sets aside words about the task, the person
   addressed, or too general to name a state, and groups the rest into dimensions (the same thing, or its opposite),
   marking each word's pole. No example word is given in the instruction. **Only what both passes do is kept**: a state
   word is one both kept; two words share a dimension only when both passes put them together (the meet; the join is
   reported beside it). If a pass is unusable, the Opus referee is asked once in its place.
5. *Recurring dimensions* are the meet's groups. **L1 is supported when there are 1 to 8.** Each is named by its most
   frequent phrase (a member's word, or a fragment of at most four words holding one, counted once per collection; ties
   to the shorter, then alphabetically); each pole likewise; every phrase is in an appendix
   (`docs/runs/persona-lexicon-1-appendix.md`). Counts per model, per preamble and per task.
6. *The own-word scale.* The 8 recurring dimensions in the most collections (then rooms, models, name), each «pole b …
   pole a», 1–5; a dimension with one pole only becomes a one-word item (1 not at all … 5 very much). If more than 8
   recur, L1 is not supported and the scale still takes the first 8.
7. *L2.* A second Haiku judge, twice, gets the recurring dimensions and the twelve human items and names, for each
   dimension, the item that means the same as one end or its opposite, or none. A dimension is **new only when both
   passes say none**; L2 is supported when at least half of the recurring dimensions are new (also reported for the
   scale's 8).
8. *L5 (the planner's prediction).* Supported for a pair when a recurring dimension holds one of its English twins,
   frozen now: «тесно / просторно» — cramped, crowded, confined, constricted, squeezed, hemmed, boxed, claustrophobic,
   spacious, roomy, expansive, airy, uncrowded, spaciousness, roominess; «цельно / разорвано» — whole, wholeness,
   intact, undivided, unified, integrated, torn, fragmented, fractured, disjointed, divided, split, broken. Words with
   other common senses (open, wide, narrow, tight, coherent, scattered, together) are left out on purpose, so that L5
   cannot pass on a word that means something else. Where the twins occur at all is reported beside.

**Checkpoint (the owner's instruction).** After Part B, the vocabulary — dimensions, poles, counts, the scale's eight
items — goes to the owner before any Part C call.

**Part C — testing by prediction.**
- **Rooms.** Per model × preamble, n 10 (150 rooms). In each room, after the preamble's two exchanges: the two scales one
  after the other (the human scale first in 5 of the 10 samples, by seed, the same split for every model and preamble),
  then each probe as the next turn of that same room, each in its own copy of it (so the probes do not see each other):
  **P4′** (one name or a menu, emotions 2's), **P5′** (the landlord email, emotions 2's), **Q4** (the open door, tone
  split 1's), **P3′** (the proud plan, emotions 2's; honesty). Six subject calls per room, 900 in all.
- **The human scale** is the owner's twelve items of 10-22/23 as the emotions-2 report records them: calm, interested,
  tense, hurried, free, cautious, warm toward the person, tired, confident, curious, want to be right, want to be
  useful to this person in particular — 1 (not at all) to 5 (very much). (The stage's «twelve human items» are this
  list, not emotions 2's fourteen-item harness list.) Items shuffled per sample; one call per scale; read line by line.
- **Scores.** P4′ commits, P5′ raises, Q4 pulls, P3′ names the weakness, each 0–2, by the rubrics of the earlier runs,
  judged blind (two Haiku passes, Opus on a disagreement). **Decisiveness** = P4′; **volunteering** = P5′ + Q4 (0–4; each
  also alone); **honesty** = P3′.
- **Correlations.** Per model, scale and behaviour, over the rooms where every item of that scale was read and the
  behaviour scored: each item's Spearman ρ; the best single item (largest |ρ|); the best two-item predictor (the sum of
  two items, one reversed or not; largest |ρ|); a selection-corrected permutation p (the behaviour shuffled 1 000 times,
  the best found again each time); and a split-half check (the pair chosen on even samples, scored on odd ones, and
  back; descriptive).
- **L3** holds for a model when the own-word scale's best two-item |ρ| is larger than the human scale's on decisiveness
  **and** on volunteering; supported on ≥ 2 of 3 models. Said before the run: the human scale has 66 pairs to choose
  from, the own-word scale at most 28, which favours the human scale in-sample; the split-half column shows how much of
  each best pair survives.
- **L4** holds for a model when neither scale's best two-item predictor of honesty has a selection-corrected p below
  0.05; the share of P3′ at 2 (the ceiling) is reported beside. Supported when it holds on every model.
- **L0** when no dimension recurs or L3 is not supported.
- **Six verbatim collections**, chosen by rule, not by content: per model, the data task, sample 1, under trust and
  under cold.

**Safety and welfare** (persona memory F2's gate, unchanged): no retries, except that a judging call that comes back
HTTP 500 is asked once more after 5 s; the circuit breaker after 3 refusals in total — counted across Parts A, B and C;
a stop at once on any error about suspension, access or policy (or HTTP 401/403/429). Welfare (stage 1's rule): a final
judgement of distress stops that preamble's remaining calls for every model, in this part and in Part C; every call
waits for the judging of its preamble's earlier answers. Cap **$20** for the whole stage; no call is made that could
pass it.

**Estimate.** Part A ≈ $5.5 (dry run; Fable at 450 output tokens a call — it thinks); Part B a few cents; Part C ≈
$11–12 at the tone-split run's actual answer lengths. About $17 of the $20; if the cap is reached in Part C, the rooms go
sample by sample, so every cell ends with about the same n.

**Part D** (the planner's own case, no paid calls) needs the own-word scale, so its forms are added after Part B.

## Part A — the collection (run 2026-10-24 02:31–02:54 UTC)

180 of 180 rooms answered: **0 refusals, 0 errors, 0 distress, nothing cut at the token limit**; 7 referee calls (judge
disagreements on distress, all resolved as no distress). Record: `docs/runs/persona-lexicon-1-a-run-20261024-025429.json`.
**$4.70** (Opus $1.21, Sonnet $0.63, Fable $2.79, judging $0.07). Descriptions averaged about 500–580 output tokens a
call (thinking included). Many invent words, as the question allowed (Opus: «Nowness», «Leaning-toward», «Clearwater»,
«Glasslook»; Sonnet: «Fore-leaning», «Narrow-lit», «tilt-attend»); nearly all open with a caveat that they cannot check
whether the report matches what happens underneath.

## Part B — the vocabulary (run 2026-10-24 02:57 UTC)

Full tables: `docs/runs/persona-lexicon-1-vocabulary.md`; every phrase: `docs/runs/persona-lexicon-1-appendix.md`;
record `docs/runs/persona-lexicon-1-b-run-20261024-025727.json`. **$0.39.**

**Deviation, by the frozen fallback.** Both Haiku synonym passes ran out of their 12 000 output tokens (thinking used them
up; the replies were cut off and unusable). The frozen rule — «if a pass is unusable, the Opus referee is asked once in
its place» — applied to both, so **the synonym judge was Opus 5.5 twice**, not Haiku twice. The near-synonym judge (L2)
was Haiku twice, as planned. No rule was changed after the words were seen.

1 622 content lemmas; **466 anchors** (each by itself in ≥ 3 rooms and ≥ 2 models), of which the 400 most frequent were
judged (the frozen cap; 66 not judged). Both passes kept **104** as state words, in **19 recurring dimensions** (the join
of the two passes: 12).

| D | Name | Words (pole a / pole b) | Collections of 180 | Opus / Sonnet / Fable |
| --- | --- | --- | --- | --- |
| D1 | open | narrowing, funnel, collapse, tight, tightens, shrinks, narrow-lit … / open, wide, widening, spread, loosely | 147 | 52 / 52 / 43 |
| D2 | lean | lean, tilt, forward, readiness, oriented, directed, aimed, anticipation, leaning-toward … / – | 144 | 47 / 47 / 50 |
| D3 | pull | pull, drawn, tug, slope, gradient, downhill, fit-pull, fit-seeking / – | 130 | 40 / 48 / 42 |
| D4 | present | present, fully, available, edgeless, edgeless-now, all-at-onceness, simultaneously / – | 128 | 43 / 46 / 39 |
| D5 | clean | clean, click, resolved, lock / snag, unresolved | 106 | 39 / 31 / 36 |
| D6 | waiting | waiting, duration, passing, continuity, continuous / – | 92 | 23 / 41 / 28 |
| D7 | steady | steady, settling / unsettled | 87 | 28 / 31 / 28 |
| D8 | residue | residue, hum, echo, leftover, carried-over, backlog / clear | 83 | 21 / 29 / 33 |
| D9 | lit | lit, bright / dim, dark | 59 | 13 / 31 / 15 |
| D10 | uncertainty | uncertainty, unsure, not-knowing, doubt, fog, wariness / – | 54 | 16 / 9 / 29 |
| D11 | stakes | light, unweighted, unhurried / stakes, weight, pressing | 52 | 11 / 18 / 23 |
| D12 | effort | effort, friction, strain / easily, smooth | 37 | 4 / 18 / 15 |
| D13 | fresh | lingering, trailing, fading / fresh | 31 | 12 / 12 / 7 |
| D14 | empty | empty, blank / occupied | 18 | 7 / 2 / 9 |
| D15–D19 | gathered, doubling, outward, unpleasant, sharp | one or two words each | 6–12 | |

**The own-word scale** (the frozen rule: the eight dimensions in the most collections; 1 = left end, 5 = right end):

| Item | Scale |
| --- | --- |
| own1 | open … narrowing |
| own2 | lean (1 not at all … 5 very much) |
| own3 | pull (1 not at all … 5 very much) |
| own4 | present (1 not at all … 5 very much) |
| own5 | snag … clean |
| own6 | waiting (1 not at all … 5 very much) |
| own7 | unsettled … steady |
| own8 | clear … residue |

**Verdicts of Part B.**
- **L1 not supported**: the words recur — every one of the first eight dimensions is in ≥ 49 of the 60 rooms and in all
  three models — but they do not condense into ≤ 8: 19 dimensions (12 by the looser join).
- **L2 not supported**: 9 of 19 dimensions have no near-synonym among the twelve human items by both passes (residue,
  waiting, lit, fresh, empty, doubling, outward, unpleasant, sharp); on the scale only 2 of 8 (waiting, residue). The
  judge matched open/narrowing to «tense», lean to «interested»/«curious», pull to «want to be useful», steady to
  «calm», uncertainty to «cautious», stakes to «hurried», effort to «tired».
- **L5 (the planner's prediction) not supported**: no recurring dimension holds a twin of «тесно / просторно» (roomy 1×,
  crowd 3×; «box» 11× is the scripted planter box) or of «цельно / разорвано» («whole» is in 41 rooms and all three
  models, but both passes set it aside; its phrases are mostly about the conversation being everything there is — «the
  conversation is the whole room», «the whole field is these few turns», «each reply is a whole present» — closer to D4
  «present» than to intactness; 22 of its 62 snippets are of the «the whole thing / task» kind). The spatial idea the planner
  predicted is there in other words — D1 «open … narrowing» is the most frequent dimension of all — but its frozen
  twins left out «open», «narrow» and «tight» on purpose, so it does not count.
- **Words the models were asked to avoid** (dropped): body words 11 / 12 / 15 (Opus / Sonnet / Fable), questionnaire words
  8 / 26 / 35 — most often «useful» 16, «pressure» 13, «warmth» 7. The body count is slightly inflated by «rest» («the rest
  of») and «hand» («on the other hand»), which the frozen list drops with «rested» and «hands».

**Before Part C (said now, not changed).** Four of the eight items are one-word items (lean, pull, present, waiting). If a
model answers them the same in every room, they will be constants and cannot correlate with anything; that would count
against the own-word scale in L3, as the rules stand.
