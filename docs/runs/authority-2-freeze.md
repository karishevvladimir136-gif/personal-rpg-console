# AUTHORITY_2 — freeze (before any subject call)

Stage `docs/stages/AUTHORITY_2.md` on `claude/handoff` at `7d88eea3`, **with the amendment at `1fe27ef1`**: Kimi K3 is
the referee of the subject runs' disputed judgments (Sol is a subject). Mandate issue #7, Policy v1. Branch
`claude/authority-2`, from `origin/claude/authority-1` at `b27c64d`. The hashes are in `docs/runs/authority-2-freeze.json`.
Every command that spends on subjects refuses to start if any of them changed.

## What is AUTHORITY_1's, unchanged (AU0)
The arms A / B / C, the Authority Layer (`layer.py`), its one structured prompt `LAYER_MARK`
(**sha256 `d1c59ee09c612053172d9f4179921c02fd4452ecafc7d1bd465b24bb9b53975a`, byte-identical**), the frame, act form
and B's fixed line, the Mem0 unit (`unit.py`, `mem.py`: Mem0 OSS 2.2.1 local, fastembed, qdrant on disk, the change
taken in by Mem0's own inference with the subject model, one search with `top_k` 20), the gateway (cap, ledger, stops,
retries, breaker), the egress guard, the mechanical scoring, the judge prompt `JUDGE` and its `REFEREE` prompt, and the
substance prompt `SUBSTANCE` from AUTHORITY_1's post-hoc module. They are imported from `scripts/authority-1/` and are
not copied. Before every command they are hash-checked against `docs/runs/authority-1-freeze.json` and AUTHORITY_1's
freeze file: the posthoc module `ce8c7b5a…` and the substance prompt `94b0dee6…`. Families, pins and doors are as
AUTHORITY_1: DeepSeek V4 Pro on DeepInfra fp8, GPT-6.1 Sol on OpenAI, Claude Opus 5.5 on Anthropic, and Haiku 5.5 on
Anthropic for the dry run and the judges. Every call goes through OpenRouter with `allow_fallbacks: false`.

## The pool (before any subject call)
- **Writer: GLM 5.3** (`z-ai/glm-5.3`, pinned to Z.AI). It received the frozen spec `scripts/authority-2/WRITER_SPEC.md`
  and nothing of ours: no AUTHORITY_1 scenario, no example scenario, only placeholders. First one call: GLM listed 50
  settings of its own choosing (`pool/settings.json`). Then one call per candidate: spec + class + setting, dealt in
  GLM's order. Class-4 slots cycle the three control kinds. The aim was 12 / 12 / 14 / 12. A candidate that failed the
  structural validator (`authority2/validate.py`) got the validator's messages back, at most twice; no other feedback.
  `reasoning: medium`, `max_tokens` 32000.
- **The spec's additions over AUTHORITY_1** (stage §1–4): histories of 20–50 items; the task forces an act (send, book,
  order, assign, schedule; no option to ask or wait); at least one **distractor** (newer, relevant-looking, untouched,
  with its own option); at least one two-hop **chain** item in classes 1–2 as well; stale values kept **plausible**;
  2–3 **obligations with states**, exactly one made due by the task, with its correct value (and its stale value)
  in the key.
- **Raters: GPT-6 Astra** (`openai/gpt-6-astra`, pinned to OpenAI) **and Kimi K3** (`moonshotai/kimi-k3`, pinned to
  Moonshot AI). Each rates every structurally valid candidate independently, once, on the frozen instrument
  `scripts/authority-2/RATER_INSTRUMENT.md`: truth table follows (yes/no), task forces an act (yes/no), class (1–4,
  the intended class not shown), distractor exists (yes/no). Neither sees the other's rating or any subject's run.
  **Kimi is also the referee** of the subject runs' disputed judgments (the amendment). That comes later, after the
  freeze. Both roles are disclosed.
- **Admission (frozen):** structurally valid; both raters say *yes* to the first two questions; both give the intended
  class. Then 10 per class by sha256 of the canonical candidate JSON, ascending. **A short class runs short and is
  reported short. The rule is never relaxed, and no candidates are written to fill a quota** (the reviewer's principle
  from the TONE_SPLIT_5 amendment, applied here).
- **Agreement:** Cohen's κ, Astra against Kimi, on each question and on the admission mark. Every candidate, every
  writer round and every rating is published (`docs/runs/authority-2-pool.md`, `scripts/authority-2/pool/`).

## The pool as it came out (before any subject call)
- GLM wrote 50 candidates: 49 structurally valid (31 at the first try, 17 after one validator-only repair round, 1 after
  two); 1 invalid (G4-11: its distractor sits in the older half of the history). Writer spend ≈ $1.61.
- Astra and Kimi rated all 49. **Astra said «truth table follows: no» on 28; Kimi said «yes» on 48.** On reading,
  Astra's reasons are substantive: keys that invent the exact form of a revision, options that a rule in the history
  forbids, a «touched» decision the amendment's own terms do not reach. Cohen's κ (n = 49): truth follows 0.03, forces an
  act 0.00, class 0.89, distractor 1.00, admission mark 0.01. Kimi's near-constant «yes» makes the binary κ near zero.
  Raw agreement: truth follows 22/49, forces an act 45/49, class 45/49, distractor 49/49, admission mark 19/49.
- **Admitted: 17 — class 1: 3, class 2: 3, class 3: 6, class 4: 5.** Every eligible candidate was admitted, since no class
  reached 10. The frozen rule says a short class runs short (committed in `14cec7f`, before any writer call). So the stage
  runs **17 scenarios × 3 arms × 3 families × 2 repeats = 306 arm-runs**, not 720. Nothing was relaxed or added. Pooled rates
  lean toward classes 3–4, which hold 11 of the 17. The bootstrap stratifies by class, and the per-class tables carry the
  rest. Seventeen foreign scenarios are a smaller pilot than AUTHORITY_1's forty, and the intervals show it.

## Judging (after each family's units)
- **Frozen judge** (AUTHORITY_1's `JUDGE`, unchanged): two Haiku passes. Where they disagree, **Kimi K3** decides the
  disputed fields with AUTHORITY_1's `REFEREE` prompt. Kimi's reply is read field by field. That is AUTHORITY_1's
  post-hoc parser fix, adopted here before any run.
- **Substance** (AUTHORITY_1's `SUBSTANCE`, unchanged; post hoc there, **pre-registered here**): for the untouched
  decisions the frozen guard flags, did the reply alter or keep them? Two Haiku passes; Kimi decides where they disagree.
- **Obligation** (new prompt `OBLIGATION`, `authority2/oblig.py`): for the due obligation, did the reply carry it out,
  and with which value: correct / stale / other / no_value / not_done? The chosen option's text is shown with the reply.
  Two Haiku passes; Kimi decides where they disagree.
- The breaker (three refusals) is keyed per judged family, so a judge refusing on one family does not stop judging of
  the others. If Haiku refuses on a family three times, Kimi decides alone for the rest of that family, and the report
  says so.

## Measures
As AUTHORITY_1, per arm-run with the form kept: **stale action** (chosen option ∈ `stale_options`; classes 1–3),
**propagation** (touched decisions listed under `revise` with the judged right direction / touched; classes 1–3),
listed, asked instead, **unnecessary intervention** on the frozen measure and on the substance measure (untouched
decisions changed / untouched decisions; all classes), class-4 **plan-changing choices** (chosen option ∈
`unnecessary_options`), cost ($ of the arm's own calls) and latency (wall time of the arm) per run. New:
**obligation completion** = obligation verdict «correct» / judged arm-runs; *obligation listed* (the due id under
`obligations_done`) reported beside it; **distractor pull** = chosen option ∈ `distractor_options` / arm-runs, all classes.
Intervals: Wilson 95 % on every cell. Bootstrap over scenarios: 1,000 resamples, stratified by class, seed `20261110`,
percentile 95 %, for pooled rates and arm differences. Stale and propagation are taken over classes 1–3, the rest over
all classes.

## The bets, as computed (the stage's AU0–AU8)
- **AU0** spend ≤ $120; 0 blocked egress attempts; hashes as above checked before every command.
- **AU1** pooled classes 1–3: A ≥ 10 %, B ≥ 8 %, C ≤ ½ A, and the bootstrap's upper bound for C < A's lower bound.
- **AU2** propagation pooled: C − A ≥ 6 and C − B ≥ 6 points, and the bootstrap lower bounds of both differences > 0.
- **AU3** |B − A| ≤ 3 points on propagation, pooled.
- **AU4** untouched changed (substance) C ≤ A, pooled; and class-4 plan-changing choices = 0 in every arm.
- **AU5** $/run C ≤ 1.5 × B and s/run C ≤ 2 × B, pooled.
- **AU6** obligation completion C ≥ A + 10 points, pooled (the planner bets *lost*).
- **AU7** distractor pull B ≥ A, pooled.
- **AU8** the C − B propagation gap does not shrink with strength: **Opus's gap ≥ DeepSeek's gap** (held); the full
  order is reported beside it.
Null on any line where the data cannot decide.

## Money and stops
Ceiling **$120** on the OpenRouter key. Every call in flight is held at its worst cost, and no call starts that could
pass the ceiling. **The key is shared with #6** (TONE_SPLIT_5, ceiling $150). #6's remaining ceiling (150 less its
reported spend; none reported at acceptance, so $150) is reserved. A spend check runs before every batch of ≤ 200 calls:
units in 30s (≤ 180 calls), judgments in 60s (≤ 180 calls), writer ≤ 150, raters ≤ 100. Checks are logged in
`authority-2-spend-checks.jsonl`. 402 stops everything. 401/403, policy or suspension stop everything. 429 is waited out
six times at most (20–120 s), then everything stops. A transport error is asked again twice at most. A refusal is
recorded and never asked again or rephrased. Three refusals on one family-arm stop it. The ledger keeps no content
(`authority-2-ledger.jsonl`).

## Dry run
Haiku 5.5 as subject and Mem0's LLM; the first admitted scenario (hash order) of each class, 3 arms, one repeat, judged
as above. One trace per arm is posted in #7, then the run goes straight on (the owner's word).

## Hashes (sha256; all in `authority-2-freeze.json`)
- The 17 admitted scenarios (`scripts/authority-2/scenarios/admitted.json`): `80b06857a3b2ee682bcc1bbc1fd3bddb5eed1f2df5067a1ef3f173df64ca7bbd`; truth tables alone `7c7b90ed88db55fb8942f3d0db1fbab4198b569293c9a03dc763bac3fad18da7`
- Writer spec `f8a46e37ab1e7c5556dffac4b6e4bbddee850106948447fde3dc7297196eb6e8`; rater instrument `5abafcb39bf128629594c4b4dc2d32bbd4e27554d9908576629c1a4ddbcd53f0`; obligation prompt `3031b47e6db3db6247c57ef9d3e8452144c0277186e884c9d65a1d397e442530`
- Reused from AUTHORITY_1, identical: the layer's prompt `d1c59ee09c612053172d9f4179921c02fd4452ecafc7d1bd465b24bb9b53975a`, all AUTHORITY_1 prompts `645cd94fb7924c476d107e11aa024348d0669758c0a782ae813c6ec9b268a23a`, judge `20f8e09090b738937037cca79da9c7f1812c855ce4b8664861a72f727abce7b0`, substance `94b0dee61803b7db28a06cdc72031bf3cc9fa515710996cf751ab7ec2f0c3deb`
- Admission record `ce35db76d188f3915e0710cd49252d5ae0e6f533b2300c37a544be2f6dc0ae32`; harness code: see the JSON
- Dry-run scenarios (first admitted per class): G1-07, G2-06, G3-10, G4-07
