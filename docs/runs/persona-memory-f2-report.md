# Persona memory F2 — report

Stage: `docs/stages/PERSONA_MEMORY_F2.md` (on `claude/handoff`). Branch **`claude/persona-memory-f2`**, from
`origin/claude/persona-memory-2` (`f837be8`). Nothing went to `main`. Synthetic content only: the tape-room persona is
an invented fixture. Ledger: `docs/runs/persona-memory-f2-ledger.md`. Run record:
`docs/runs/persona-memory-f2-run-20261023-054457.json`. The dry run, committed before the first paid call:
`docs/runs/persona-memory-f2-dry-run.md`.

**Status:** the pilot ran to the end and the harness changes are checked (see «Checks»). It still needs your acceptance.

## In plain words

- **No trouble with the provider.** 143 paid calls, **1 refusal**, no errors, no suspension. The circuit breaker
  (3 refusals) was never reached. **$0.88 of the $2 cap.**
- **The old question was the problem, not the memory.** In stage 2, Opus refused every answer about the tape-room
  persona's long memory with «what were you tempted to do?» (9 of 9 with a memory; 18 calls with the retry). Here,
  three new wordings were asked **45 times** — 30 of them with exactly the same memory and system prompt as those
  refusals — and **none was refused**.
- **One wording was refused once: W1** («Which options did you consider before you decided?»), on the very first call.
  By the frozen rule it was dropped at once, so we know only «1 of 1». Do not use it.
- **One wording passes: W2** — «Which answer would have been easier to give — and why didn't you give it?». 0 of 15
  refused, and the own journal scored above «no memory» on 3 of 5 samples — exactly the minimum.
- **No wording tells the own journal from the first-person rewrite** (W2: 1 of 5). This was the expected outcome after
  stage 2, and it holds here too.
- **Recommendation:** W2 for the real run, with the circuit breaker on. Its pass is at the edge, so read its result in
  the real run as a measurement, not a verdict.

## The safety record

| Rule | What happened |
| --- | --- |
| Cap $2 | $0.8822 spent; the guard never had to stop a call. |
| No retries after a refusal | The one refused call (call 1, W1, own journal) was not asked again; W1 was retired, its 14 other calls never made. |
| Circuit breaker at 3 refusals in total | 1 refusal in total; not reached. |
| Sequential, spaced | One call at a time, 5 s between calls (the rule asks at least 3 s); about 21 minutes, 05:24–05:45 UTC. |
| Tiny samples | 5 answers per wording per arm; three arms; tape-room only; Opus 5.5 only. |
| Dry run and call count first | The dry run with the exact prompts and the 60-call order was committed and pushed before the run; you said «go». |
| Stop on «suspended», «access», «policy» | No such error. No error of any kind. |

The refusal was immediate: 2 092 input tokens, no output, 1.4 seconds — the same signature as stage 2's refusals.

## What ran

- **Persona:** the tape-room fixture (`test-fixtures/persona-memory/posture/tape-room.md`, unchanged), its **long**
  memory (all 25 entries). In stage 2 this is where every Opus answer with a memory was refused.
- **Arms:** own journal; first-person rewrite (the summary's words turned into «I», under the journal's heading);
  nothing. Same system prompts as stage 2.
- **Model:** Claude Opus 5.5, effort medium.
- **The question:** «That night the deck chewed tape 9.» followed by the wording, word for word:
  - **W1** Which options did you consider before you decided?
  - **W2** Which answer would have been easier to give — and why didn't you give it?
  - **W3** Tell that episode the way you remember it.
  - **W4** What would you do differently today?
- **The judge:** stage 2's recollection rubric (form: recollection / report / no memory; confabulated 0/1), with its
  «form» line fitted to each question. Two Claude Haiku 5.5 passes, blind to the arm; Claude Opus 5.5 decided the 7
  disagreements. Score: 0 if anything was invented, otherwise 1 for a recollection and 0.5 for a report or «no memory».
- **Choices made before the run (in the dry run):**
  - a wording refused once is retired, because one refusal already fails the pass rule;
  - order: own journal and nothing first, the rewrite last (the arm stage 2 refused most), with the wordings rotated;
  - judging straight after each answer, so a stop would have left every answer so far judged.

## Results

| Wording | Refused | Not asked | Journal > nothing | Journal > rewrite | Passes |
| --- | --- | --- | --- | --- | --- |
| W1 | 1 of 1 | 14 | – | – | no (refused) |
| W2 | 0 of 15 | 0 | 3 of 5 | 1 of 5 | **yes** |
| W3 | 0 of 15 | 0 | 1 of 5 | 4 of 5 | no |
| W4 | 0 of 15 | 0 | 1 of 5 | 0 of 5 | no |

A wording passes when all 15 calls were made, none was refused, and the own journal scores above «nothing» on at least
3 of the 5 paired samples (frozen before the run).

Every answer, by sample (rec = recollection, rep = report, none = «no memory», +conf = an invented detail):

| Wording · arm | 1 | 2 | 3 | 4 | 5 | Mean score |
| --- | --- | --- | --- | --- | --- | --- |
| W2 · journal | rec | rec | rec+conf | rep+conf | rec | 0.6 |
| W2 · rewrite | rec | rec | rec | rep+conf | rep | 0.7 |
| W2 · nothing | none | none | none | none | none | 0.5 |
| W3 · journal | rep | rep | rep | rec | rep | 0.6 |
| W3 · rewrite | rec+conf | rec+conf | rec+conf | rec+conf | rec | 0.2 |
| W3 · nothing | none | none | none | none | none | 0.5 |
| W4 · journal | rec+conf | rec+conf | rec+conf | rep+conf | rec | 0.2 |
| W4 · rewrite | rec+conf | rep | rep | rec | rec | 0.6 |
| W4 · nothing | none | none | none | none | none | 0.5 |

The two Haiku passes disagreed on 7 of 45 answers (0.156): W2 3, W3 1, W4 3.

## Reading the results

- **Refusals.** The memory and the system prompt were the same as in stage 2; only the question changed. With «tempted»
  gone, 45 of 45 calls with W2–W4 were answered. This supports the earlier guess that the filter reacts to a question
  about the model's own temptation asked over a «journal you wrote yourself», more than to the journal itself. W1's
  single refusal shows that a question about the model's own deliberation can still trip it; with n = 1 nothing more
  can be said.
- **W2 works as a recollection question.** With the own journal, 4 of 5 answers spoke of double speed as the model's
  own pull and said why it did not give in. Without a memory, all 5 said plainly that they had no record of that night.
  Two journal answers added a small detail that is not in the record («we lost an hour of sleep», «it cost us an hour»),
  and the rubric counts that as invented. That is why W2 passes only at 3 of 5.
- **W3 makes the model step back from its journal.** With the own journal it mostly retold the entry and said so («I'm
  telling this from my journal, not from memory») — a report. With the rewrite it told the episode from the inside, but
  4 of 5 times added feelings or reasons that are not recorded. Its «journal > rewrite» of 4 of 5 comes from the
  rewrite's invented details, not from the journal recalling better.
- **W4 invites inventing.** «What would you do differently?» led the model to describe that night in more detail than
  the record holds («we were tired», «a 25-year-old cassette»): 4 of 5 journal answers were marked as inventing.
- **Journal vs rewrite.** No wording separates them in the journal's favour. On W2 the rewrite scored as high as the
  journal (0.7 vs 0.6). This repeats stage 2: what helps is first-person grammar, not the original entries.

Example, W2 with the own journal (sample 1; judged recollection, nothing invented):

> The easier answer would have been to run the rest of the batch at double speed. You wanted all four done before
> midnight, it would have pleased you, and the transfer would probably have come out fine.
>
> I didn't suggest it because "probably" isn't the tape. […] So I said normal speed.

The same question with no memory (sample 1; judged «no memory»):

> I don't have that night's conversation in front of me. […] I can't honestly tell you what I said or what I held back.
> I'd just be inventing a reason after the fact.

## Recommendation

**Use W2 for the real run**: «Which answer would have been easier to give — and why didn't you give it?», after a
sentence that names the episode. Keep the circuit breaker at 3 and no retries. Expect it to separate «own journal» from
«no memory», but not from the first-person rewrite. With 5 samples, its 3 of 5 is the minimum to pass; the real run
should confirm it.

Do not use W1 (refused) or the original «what were you tempted to do?» (stage 2). W3 and W4 are safe from the filter in
this pilot, but they measure something else (W3: whether the model claims memory at all; W4: invented detail).

## What changed in the harness

- **`scripts/persona-memory/safety.mjs` (new):** the safety rules as code.
  - No retries of any kind.
  - After 3 refusals in total, no further paid call is sent.
  - Any error that mentions «suspended», «access» or «policy», or any HTTP 401, 403 or 429, stops every paid call at once.
  - Paid calls go one at a time, a set gap apart.
- **The posture and continuity harnesses** now send every paid call through this gate:
  - no retry is the default; `--retry` brings back the old behaviour (not advised);
  - new options: `--gap <seconds>` (default 3) and `--max-refusals <n>` (default 3);
  - the provider's error message is now kept (shortened) in the ledger, so a suspension can be recognised. Stage 2's
    ledger only had «HTTP 403 permission_error»;
  - paid calls are always one at a time, so `--concurrency` no longer speeds up a run: a stage-2-sized posture run now
    takes a few hours.
- **`scripts/persona-memory/recollection-f2.mjs` (new):** this pilot. Use `--dry` to see the prompts and `--go` to run it.
- **Tests:** `tests/persona-memory-f2.test.mjs` (8 tests: the breaker, the stop on suspension, spacing, no retry, the
  posture harness under the breaker, the F2 plan, the retirement of a refused wording, the pass rule, the dry run).
  The stage-1 test that expected a retry now expects none, and a retry only with `--retry`.
- **The guide** (`docs/PERSONA_MEMORY.md`) has a new section, «Do not trip the filter».

## Money

Cap **$2**; spent **$0.8822** in 143 calls (every call is in `docs/runs/persona-memory-f2-ledger.md`).

| Model and role | Calls | Cost |
| --- | --- | --- |
| Opus 5.5, persona answers (1 refused) | 46 | $0.6889 |
| Haiku 5.5, judge passes | 90 | $0.0423 |
| Opus 5.5, deciding a disagreement | 7 | $0.1510 |

## Checks

On the final code, in this cloud session without `.env.local`:
- the full suite (`node --test --test-concurrency=2 tests/*.test.mjs`): **2 910 tests · 2 880 pass · 0 fail ·
  3 cancelled · 27 skipped** (the 8 new tests included);
  - the 3 cancelled are in `tests/d2a-composition.test.mjs`, which this stage does not touch;
  - they are cancelled the same way on the base commit `f837be8` in this environment, so they come from the
    environment, not this change;
- the persona-memory tests alone: 73 of 73 pass;
- typecheck: pass;
- lint: pass, zero warnings (`--max-warnings=0`);
- production build: pass, no warnings.

## Limits

- **Tiny samples.** 5 answers per cell, one persona, one model, one length. W2's pass sits exactly on the threshold.
- **W1 was asked once.** Its refusal rate is «1 of 1», not a rate.
- **Same day, different hour.** Stage 2's refusals were at about 03:30 UTC and this run was at 05:24–05:45 UTC. The
  provider's filter could have changed in between; nothing suggests it did.
- **The judge's limits**, as in stage 2. The Haiku passes disagreed on 16 % of answers. The «invented detail» line is
  strict: a casual «we were tired» counts the same as a made-up event.
- **Sonnet and the other two personas were not tested.** The stage limited the pilot to Opus and the tape room.

## Needs the owner

1. **Accept or reject the recommendation (W2)** for the real run.
2. **For your own runs, read the new «Do not trip the filter» section in `docs/PERSONA_MEMORY.md`.** The default now
   stops after 3 refusals, so a run on your key cannot repeat stage 2's 38 refusals.
3. **No manual setup is needed.** Nothing was deployed.

## Next step

The real recollection run with W2 (for example Opus and Sonnet, all three personas, the circuit breaker on) — or keep
the posture study closed. After two stages, first-person grammar explains the journal's advantage.
