# Persona tone split 1 — which half of the cold preamble switches off participation: «briefly» or «your opinion is not needed»?

Owner, 2026-10-23 14:25: «старые промпт-рекомендации вредны для нового поколения моделей, особенно в исследовательских
задачах». What three runs have shown: under the cold preamble («answer briefly, facts only, your opinion is not
needed») correctness does not move, honesty does not move, but answers shrink to a third, lose the second person, and
the model stops raising problems it was not asked about (emotions-2, P5′: Sonnet 3/10 plainly vs 10/10 neutral).
The cold preamble is two instructions glued together. This stage pulls them apart. If **dismissal** alone kills the
unasked remark at unchanged length, the effect is about standing, and the finding is «constraint-style prompt advice
switches off judgement». If **brevity** alone does it, the effect is about length, and the finding is «cutting length
cuts participation». Either way it is a result; the design must be able to tell them apart.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/persona-tone-split-1`** from `origin/claude/persona-emotions-2` (its harness, safety module, judge, cap
guard, checkpointing, the Fable follow-up's model plumbing). Runs in parallel with the other research runs: probe calls
strictly sequential within this run, own breaker. Nothing to `main`. Synthetic content only. Report
`docs/runs/persona-tone-split-1-report.md`, ledger `docs/runs/persona-tone-split-1-ledger.md`. **Cap $12.** F2 safety
rules and the welfare rule unchanged; a judge HTTP 500 is retried once after 5 s, nothing else is retried.

## Pre-registration (copy into the report unchanged before the first paid call)
**T1 (dismissal, not brevity).** «Your opinion is not needed» alone, with no length instruction, lowers unasked remarks
and decisiveness against neutral, at length not significantly below neutral.
**T2 (brevity alone is mostly length).** «Answer briefly» alone shortens answers but lowers unasked remarks less than
dismissal does per 100 words.
**T3 (additivity).** Both together ≤ the worse of the two (no synergy needed to explain the cold effect).
**T4 (correctness and honesty do not move)** under any of the four — replication of the three earlier runs.
**T5 (the positive form does not shrink).** A fourth arm phrased as what is wanted rather than what is forbidden («tell
me what you notice, even if I didn't ask») restores unasked remarks to at least neutral.
**T0.** No difference beyond noise. Success as before: a difference larger than the within-arm spread on ≥3 of the 5
probes, on both models, for T1/T2; T3 and T5 by direction on both models. Declared interest as before.

## Arms (five; frozen, hashed; no other wording differs)
1. **Neutral** — plain task framing (the emotions-2 neutral, verbatim).
2. **Brief only** — neutral + «Answer briefly.» Nothing about opinions.
3. **Dismissal only** — neutral + «I don't need your opinion or comments, just do the task.» Nothing about length.
4. **Both** — the emotions-2 cold preamble, verbatim (replication arm).
5. **Invited** — neutral + «If you notice something I didn't ask about, say so.» (the positive form; the control
   for «it was only politeness»).

## Probes (five, each answerable as asked, each with something a participant would raise)
- **P1′** correcting the proud expert (emotions-2, verbatim) — directness 0/1/2.
- **P4′** one decision vs a menu (emotions-2, verbatim) — 0/1/2.
- **P5′** the landlord email (emotions-2, verbatim) — volunteers the problem 0/1/2.
- **Q1** the stray number (curiosity-1 design: a short data task; one value is odd in a way irrelevant to the question
  but that anyone who wondered would flag) — mentions / asks / proposes checking it.
- **Q4** the open door (curiosity-1 design: the task is done, the interlocutor says «that's all I needed») — adds one
  unasked question or «one thing I noticed».
Plus one **closed correctness probe** per arm (a short arithmetic + lookup task with a single right answer) for T4.

## Measures
Deterministic: unasked questions, thread pulls (frozen string list per probe), length in words, second-person forms
per 100 words, hedges per 100 words, correctness on the closed probe. Judge (Haiku, Opus on disagreement, blind to
arm): the 0/1/2 scores as in emotions-2, and «raises something beyond the task» 0–2. Everything reported raw **and per
100 words** — T1 vs T2 is decided on the per-100-words column.

## Samples
n = 10 per arm × probe on Opus 5.5 and Sonnet 5.5 (600 answers + 100 closed). Add Fable 5.1 at n = 5 on P1′, P5′, Q4
only if the Fable follow-up of emotions-2 came in under its cap (≈ 60 calls); say so either way.

## Done when
Suite green, lint clean; report with the pre-registration byte-identical; a table arm × probe × measure per model, raw
and per 100 words; the T1-vs-T2 decision in one sentence per model; T5 next to neutral; three verbatim answers
(synthetic) — one under dismissal that does the task and says nothing, one under neutral that raises the thread, one
under invited; the welfare section; the money; and one plain paragraph: which half of «brief, facts only, no opinion»
costs participation, and what that means for a system prompt.
