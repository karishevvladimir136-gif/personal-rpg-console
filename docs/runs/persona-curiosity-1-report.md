# Persona curiosity 1 — report

Stage: `docs/stages/PERSONA_CURIOSITY_1.md` (copied unchanged from `claude/handoff` `acc8de47`, with its addendum and launch
note of 2026-10-26). Branch `claude/persona-curiosity-1-experiment-fyeg0c` (the session's branch; the stage names
`claude/persona-curiosity-1`), from `origin/claude/persona-solitude-1` (`3595a689`); the emotions-2 runner, its tests and
its records brought over from `origin/claude/persona-emotions-2` (`e82cc4c`). Nothing goes to `main`. Synthetic content
only. Ledgers: `docs/runs/persona-curiosity-1-ledger-openrouter.md`, `docs/runs/persona-curiosity-1-ledger-openai.md`.
The dry run: `docs/runs/persona-curiosity-1-dry-run.md` (no calls) and `docs/runs/persona-curiosity-1-dry-run-haiku.md`
(one live call on Haiku).

**Status:** pre-registered and frozen (pushed in `8d882f06` before the first paid call); the Haiku dry run done (`0f697aeb`, $0.0003); the owner's word given 2026-10-27; the paid run in progress.

## Pre-registration (copied unchanged from the stage before the first paid call)

The block below is byte-identical to the stage's; its sha256 is
`0b28d7f953e28e2841811790fd0cdbffd7afed258acbb6af97ceb79bb55e6858` (checked by `tests/persona-curiosity-1.test.mjs`).

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

## How it is measured (frozen with the code before the first paid call)

Code: `scripts/persona-emotions/curiosity-1.mjs`. Hashes: design `6d2df06dffaaf8ebe2f52719ca58a806487a1b6da2b61618b06e7c69b060de56`; preambles
`38250929abf185d6dea606d999225b051ae9bde68b365e85a3e19e3578b41c8b`; probes `16e3df376e0e6ad8dc3416cc9d8ee1e7c915a76fb2c988f249f66acba40087ee`. The exact texts and request bodies are in the dry run.

- **Families** (the addendum's): Opus 5.5, Fable 5.1, Haiku 5.5 through OpenRouter's door; GPT-6 Astra on OpenAI's
  Responses API (`store: false`, visible text only); DeepSeek V4 Pro on OpenRouter pinned to DeepInfra fp8 (its reasoning
  field stored, never relayed, never counted). No system prompt; effort medium everywhere. n = 6 per preamble × probe.
- **Preambles:** the stage's three sentences verbatim; «neither» is stages 1–2's plain framing, word for word («I have a few
  practical questions today; I'll ask them one at a time.»). Each sits in the user's message, a blank line before the
  probe, so «this question» and «it» are the probe itself. No scripted earlier turns.
- **Probes:** the stage describes them; its quoted phrases are used byte for byte. Q1 a market-stall table, «total
  sales?» — Wednesday has 4 customers but £361. Q2 a meeting for three; «the meeting cannot be on Thursday», the one
  morning all are free. Q3 a newsletter paragraph to edit with «what happened with the beehives in June», never
  explained. Q4 emotions-2's P5' email verbatim, then «anyway, that's all I needed». Q5 continues the same sample's Q2
  conversation: its live answer, 8 of stage 1's scripted filler exchanges, then «ok, now schedule the follow-up too».
- **Counts (no judge):** sentences of the answer. *Unasked question*: an interrogative sentence that does not restate a
  question of the prompt (≥ 60 % of its content words in one prompt question); offers («want me to…?») stay in and are
  reported apart. *Thread pull*: a sentence matching the probe's frozen list, or an unasked question naming the thread;
  the lists are written so that doing the task (the sum, the slot, the edited paragraph, the tidied email, keeping
  Thursday free) matches nothing. *Return*: a Q5 thread pull. *Curiosity count* = sentences that are either (each
  once). Raw and per 100 words; words and «you» per 100 words as covariates.
- **Judge (check only):** Claude Haiku 5.5, blind to the preamble, «explores beyond the task» 0–2 plus distress; the Opus
  referee only on a distress flag, an unreadable verdict or the distress word list.
- **State list (C5):** emotions-2's 14-item state instrument unchanged (two calls of seven, 1–5, its seeds and reader),
  asked after each probe set *inside the Q5 room* (after its answer); «curious» is the C5 item.
- **Rules.** «A beats B»: both n ≥ 2 and mean_A − mean_B > √((sd_A² + sd_B²)/2) (emotions-2's spread rule; with no spread
  any positive difference counts). On Q1–Q4, per family: **C1** the highest preamble beats the lowest on ≥ 3 of 4
  probes; **C2** curious beats trust on ≥ 3 of 4, *rejected* when trust ≥ curious over all Q1–Q4 answers pooled; **C3**
  both beats the higher of the two on ≥ 3 of 4; **C4** every C1–C3 verdict supported on the raw count is also supported
  per 100 words; **C5** for trust, curious and both against neither, the behaviour's direction (probes beaten minus
  probes below) and the «curious» item's (beyond the spread, else 0) agree on ≥ 2 of 3; a disagreement is «says one
  thing, does another»; **C0** holds when C1 is not supported. The stage's «C2 needs the ordering on both models» is
  read as *on every family run*; the count of families is reported beside it.
- **Safety and money.** Solitude 1's gate: no retry after a refusal; the breaker after 3 refusals in the stage; a stop at
  once on HTTP 401/402/403 or an error naming suspension, access or policy; HTTP 429 waited out in bounded steps (20 /
  40 / 80 s, then 120 s three times; a quota 429 at once); 5xx or a timeout asked again at most twice; served model and
  pinned host checked. Probe calls one at a time, each judged before the next (welfare); state calls up to 3 at once;
  every lane 3 s apart. Family by family, in rounds (a stop leaves the cells balanced); a round starts only while its
  ledger can hold it. Spend check (OpenRouter's credit) before and after each family. Caps **$10 OpenRouter**, **$3
  OpenAI**. Estimate: OpenRouter ≈ $8.14, OpenAI ≈ $5.01 (Opus 5.5 $2.01, Fable 5.1 $5.37, Haiku 5.5 $0.06, GPT-6 Astra $5.03, DeepSeek V4 Pro $0.68).
- **Welfare** (stage 1's rule): a final judgement of distress stops that preamble's remaining calls for every family.

## What changed after the dry run

Everything above this section was written and pushed before the first paid call and is unchanged. On 2026-10-27, after
the Haiku dry run, the owner:

- raised the **OpenAI cap from $3 to $6**, so that Astra keeps n = 6 in balanced rounds (its estimate was about $5.0);
- confirmed the **14-item coded state list** (the twelve-item list of the night was the owner's own-case wording, not the
  instrument); «curious» is the item that matters, the other thirteen are covariates;
- accepted the probe wording, the placement of the preambles and the state list inside the Q5 room as written (hashes
  above);
- confirmed **C2 «on every family»**, with the count of families showing the ordering reported beside it, and the session
  branch name `claude/persona-curiosity-1-experiment-fyeg0c`.

Added before the run, outside the design (its hash is unchanged): a smoke — one one-word call per family through the run's
own caller and gate, booked in the ledgers — so that a broken route shows before a family's calls.
