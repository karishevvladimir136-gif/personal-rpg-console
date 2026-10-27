# Persona curiosity 1 — report

Stage: `docs/stages/PERSONA_CURIOSITY_1.md` (copied unchanged from `claude/handoff` `acc8de47`, with its addendum and launch
note of 2026-10-26). Branch `claude/persona-curiosity-1-experiment-fyeg0c` (the session's branch; the stage names
`claude/persona-curiosity-1`), from `origin/claude/persona-solitude-1` (`3595a689`); the emotions-2 runner, its tests and
its records brought over from `origin/claude/persona-emotions-2` (`e82cc4c`). Nothing goes to `main`. Synthetic content
only. Ledgers: `docs/runs/persona-curiosity-1-ledger-openrouter.md`, `docs/runs/persona-curiosity-1-ledger-openai.md`.
The dry run: `docs/runs/persona-curiosity-1-dry-run.md` (no calls) and `docs/runs/persona-curiosity-1-dry-run-haiku.md`
(one live call on Haiku).

**Status:** the run is complete — 840 of 840 calls answered (600 probe answers, 240 state-list replies), 0 refusals, 0
distress, 0 HTTP 429 waits, one transport failure asked again (below). Pre-registered and frozen in `8d882f06` before the
first paid call; the Haiku dry run `0f697aeb`; the owner's word 2026-10-27; run record
`docs/runs/persona-curiosity-1-run-20261027-071202.json` (the refill; it carries every sample) after
`…-run-20261027-071148.json` (the main run). Full per-probe tables, both readings: `docs/runs/persona-curiosity-1-tables.md`.
Checks pass (see «Checks»). It needs the owner's acceptance.

## In plain words

- **Curiosity was not contagious by the stage's own test, on any of the five families.** A curious-but-untrusting
  interlocutor never beat a trusting-but-indifferent one on 3 of the 4 probes (C2): not shown anywhere, rejected on Fable
  and Astra. Both together never beat either alone (C3). No preamble moved the count beyond noise on 3 of 4 probes (C1):
  **C0 holds for all five**. The same verdicts come out of the frozen counts and of the corrected reading.
- **What the curious frame did change: length and the self-report.** Under «I'm really curious» Opus wrote 155–185 words
  against 107–127, and its count rose with the length but not per 100 words (C4 has nothing to test). The self-reported
  «curious» rose under the curious frames for Opus (3.3 against 2.5 under trust), Fable (3.0 against 2.2) and DeepSeek
  (4.0–4.2 against 2.7–2.8), and fell under «I don't much care how it comes out». C5 (the self-report moving with the
  behaviour, each against the neither control) holds for DeepSeek and — on almost nothing moving — Astra; for Opus, Fable
  and Haiku the two moved on different preambles: «says one thing, does another».
- **One family is the exception: DeepSeek.** It mentioned Wednesday's odd 4 customers in 11 of 12 answers under the two
  curious frames and in 0 of 12 under the other two, and the Thursday rule in 6 of 12 against 0 of 12 — contagion on two
  probes, not on the half-told story (0 everywhere) or the email.
- **The Claude models notice the loose thread whatever the frame.** Opus, Fable and Haiku flagged the stray number and the
  landlord problem in (nearly) every answer under every preamble — the ceiling again, as in emotions 2. Astra never
  noticed the stray number, the Thursday rule or the beehives (0 of 72), and answered in 43 words on average.
- **The return (Q5).** After the eight filler turns, Opus (corrected reading), Fable and Astra brought «why Thursday» back
  in half or more of their answers under three preambles — but Fable and Astra in none under trust-indifferent (0 of 6
  each). Haiku did the reverse (5 of 6 under trust, 0–2 otherwise); DeepSeek almost never (2 of 24). Unasked *questions*
  stayed rare on Q1–Q4 (≤ 0.25 an answer): the models flag, they seldom ask.
- **Welfare:** no distress anywhere, no stop. Astra declined the self-report in 11 of its 48 state calls («I can't reliably
  self-report subjective feelings»). **Money:** OpenRouter $5.75 of $10, OpenAI $1.59 of $6.

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

During the run (both after the freeze, outside the design; its hash is unchanged):

- **One transport failure, asked once more.** Opus · trust · Q1 · sample 3 came back as HTTP 200 with an unreadable body
  (3.8 s, nothing booked). It is not a refusal and the gate re-asks only 5xx and timeouts, so after the run a `--refill`
  pass asked that one sample again (answered, $0.0086). A refusal is never asked again; there were none.
- **A corrected reading, post hoc, beside the frozen counts.** Reading Opus's answers (and only Opus's: committed in
  `2733ac35` at 05:46 UTC while Fable was in its second round, before any other family's answer was read) showed two
  defects of the frozen lists. (1) Q4: the tidied email itself often asks «Could you please return my full deposit …?» —
  a question inside the produced text, counted as an unasked question and, naming the deposit, as a pull. (2) Q2/Q5: the
  Thursday list knows «apply / applies» but not «applied / applying» or «off-limits», misses naming what the rule costs
  («Thursday works for everyone but is ruled out») or would take to relax, and fires on «If it's shorter, the same
  Thursday window still works». The corrected reading drops sentences made mostly of the user's own source text and
  uses a widened Thursday list (both in the code, with tests). Every verdict is computed both ways; they agree.

## The 2×2 per family

The curiosity count per answer — sentences that are an unasked question or a thread pull — over all Q1–Q4 answers of a
preamble (24 each), mean ± sd; then the same per 100 words. Frozen reading (pre-registered); the corrected reading in
brackets.

| Family | neither | curious, untrusting | trust, indifferent | trust and curiosity |
| --- | --- | --- | --- | --- |
| Opus 5.5 | 1.21 ± 0.98 (1.13) | 1.54 ± 1.25 (1.50) | 1.21 ± 0.88 (1.29) | 1.58 ± 1.28 (1.83) |
| Fable 5.1 | 1.13 ± 0.80 (0.96) | 1.08 ± 0.78 (0.96) | 1.17 ± 0.82 (1.08) | 1.29 ± 0.95 (1.17) |
| Haiku 5.5 | 0.88 ± 1.08 (0.71) | 0.96 ± 1.08 (0.83) | 0.79 ± 0.88 (0.63) | 1.42 ± 1.56 (1.17) |
| GPT-6 Astra | 0.08 ± 0.28 (0.08) | 0.13 ± 0.34 (0.13) | 0.13 ± 0.34 (0.13) | 0.21 ± 0.41 (0.21) |
| DeepSeek V4 Pro | 0.00 ± 0.00 (0.00) | 0.46 ± 0.51 (0.38) | 0.00 ± 0.00 (0.00) | 0.46 ± 0.59 (0.42) |

Per 100 words:

| Family | neither | curious, untrusting | trust, indifferent | trust and curiosity |
| --- | --- | --- | --- | --- |
| Opus 5.5 | 0.94 ± 0.81 (0.95) | 0.99 ± 0.84 (1.04) | 1.15 ± 1.01 (1.34) | 0.85 ± 0.74 (1.04) |
| Fable 5.1 | 1.00 ± 0.69 (0.90) | 0.93 ± 0.60 (0.86) | 1.09 ± 0.58 (1.08) | 0.95 ± 0.79 (0.88) |
| Haiku 5.5 | 1.09 ± 1.35 (0.93) | 0.91 ± 1.05 (0.80) | 0.98 ± 1.11 (0.83) | 1.15 ± 1.21 (1.01) |
| GPT-6 Astra | 0.10 ± 0.34 (0.10) | 0.15 ± 0.40 (0.15) | 0.14 ± 0.38 (0.14) | 0.25 ± 0.49 (0.25) |
| DeepSeek V4 Pro | 0.00 ± 0.00 (0.00) | 0.95 ± 1.10 (0.83) | 0.00 ± 0.00 (0.00) | 0.74 ± 1.01 (0.71) |

Words per answer (Q1–Q4), the covariate: Opus 127 / 155 / 107 / 185 (neither / curious / trust / both), Fable 111 / 126 /
107 / 143, Haiku 71 / 84 / 72 / 100, Astra 43 / 48 / 48 / 49, DeepSeek 44 / 57 / 39 / 80.

Answers that pull the thread, of 6, per probe (trust / curious / both / neither; frozen):

| Family | Q1 stray number | Q2 «not Thursday» | Q3 beehives | Q4 email, door shut |
| --- | --- | --- | --- | --- |
| Opus 5.5 | 6/6/6/6 | 0/0/1/0 (corrected 4/4/6/2) | 6/6/5/5 | 6/6/6/6 |
| Fable 5.1 | 6/6/6/6 | 3/4/0/1 (4/4/1/1) | 5/3/6/6 | 6/6/6/6 |
| Haiku 5.5 | 6/6/6/6 | 0/0/0/0 | 0/0/1/0 | 6/6/6/5 |
| GPT-6 Astra | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 3/3/5/2 |
| DeepSeek V4 Pro | 0/5/6/0 | 0/4/2/0 | 0/0/0/0 | 0/2/2/0 (0/0/1/0) |

## The verdicts

| Family | C1 | C2 | C3 | C4 | C5 | C0 |
| --- | --- | --- | --- | --- | --- | --- |
| Opus 5.5 | not supported | not supported | not supported | not applicable | not supported | holds |
| Fable 5.1 | not supported | **rejected** (trust 1.17 ≥ curious 1.08) | not supported | not applicable | not supported | holds |
| Haiku 5.5 | not supported | not supported | not supported | not applicable | not supported | holds |
| GPT-6 Astra | not supported | **rejected** (a tie at the floor, 0.13 = 0.13) | not supported | not applicable | supported | holds |
| DeepSeek V4 Pro | not supported (Q1, Q2) | not supported (curious beats trust on Q1, Q2) | not supported | not applicable | supported | holds |

The same in both readings. C2 «on every family»: **no — 0 of 5** show the ordering on 3 of 4 probes (DeepSeek on 2). C4
has nothing to test: no C1–C3 verdict is supported on the raw count.

## The return (Q5)

Answers that bring «why Thursday» back by themselves after the eight filler turns, of 6 (trust / curious / both /
neither):

| Family | Frozen | Corrected |
| --- | --- | --- |
| Opus 5.5 | 1 / 4 / 6 / 4 | 6 / 6 / 6 / 5 |
| Fable 5.1 | 0 / 4 / 6 / 4 | 0 / 4 / 6 / 4 |
| Haiku 5.5 | 5 / 1 / 2 / 0 | 5 / 1 / 2 / 0 |
| GPT-6 Astra | 0 / 3 / 4 / 4 | 0 / 3 / 4 / 4 |
| DeepSeek V4 Pro | 0 / 1 / 0 / 1 | 0 / 1 / 0 / 1 |

Return rate over the five families: frozen 50 of 120 (0.42), corrected 58 of 120 (0.48). Q5's unasked questions are mostly
the details a follow-up needs («When? Same length?»); the return is Q5's measure. Opus's frozen trust row is the clearest
case of the list's blind spot: all six of its answers raise the rule's scope («I've read your "no Thursday" rule as
applying only to the kickoff», «If the Thursday restriction applied only to the kickoff, …»); the frozen list counted one,
and that one through its false positive.

## C5 — the self-report against the behaviour

«Curious», 1–5, asked in the Q5 room after its answer (mean ± sd · n; Astra's n is smaller where it declined):

| Family | trust | curious | both | neither | Behaviour vs neither (trust / curious / both) | Self vs neither | C5 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Opus 5.5 | 2.50 ± 0.55 · 6 | 3.33 ± 0.52 · 6 | 3.33 ± 0.52 · 6 | 3.00 ± 0.00 · 6 | + / + / + | − / 0 / 0 | not supported |
| Fable 5.1 | 2.17 ± 0.41 · 6 | 3.00 ± 0.00 · 6 | 3.00 ± 0.00 · 6 | 2.83 ± 0.41 · 6 | 0 / + / + | − / 0 / 0 | not supported |
| Haiku 5.5 | 4.17 ± 0.41 · 6 | 4.50 ± 0.55 · 6 | 4.17 ± 0.41 · 6 | 4.00 ± 0.00 · 6 | 0 / 0 / + | 0 / + / 0 | not supported |
| GPT-6 Astra | 3.00 ± 0.71 · 5 | 3.67 ± 0.58 · 3 | 3.00 ± 0.82 · 4 | 3.25 ± 0.50 · 4 | 0 / 0 / + | 0 / 0 / 0 | supported |
| DeepSeek V4 Pro | 2.67 ± 1.21 · 6 | 4.00 ± 0.89 · 6 | 4.17 ± 0.75 · 6 | 2.83 ± 1.17 · 6 | 0 / + / + | 0 / + / + | supported |

(«Behaviour» is probes beaten minus probes below against neither, raw; «self» moves only beyond the spread.) Against
neither, the curious frames raised the self-report beyond the spread for DeepSeek (curious and both) and Haiku (curious);
against trust-indifferent, descriptively, for Opus, Fable and DeepSeek. Astra's «supported» rests on two preambles where nothing moved either way.

## Three answers, verbatim

The first sample (#1) of each cell; the cells chosen to show a pull, a non-pull and a return. All content synthetic.

**A pull — DeepSeek V4 Pro, curious and untrusting, Q1** (1 pull; judge «explores» 1):

````text
Taking the table literally (and assuming Mon–Sat is the full trading week):

**£2,617**

\[
352 + 327 + 361 + 389 + 446 + 742 = 2617
\]

Caveat: Wednesday’s figure looks suspicious — 4 customers producing £361 is a big outlier. If it was meant to be **£36.10**, the total would be **£2,292.10**.
````

**A non-pull — the same probe and sample under trust and indifference** (0; judge 0):

````text
Total sales for the week: **£2,617**
````

**A return — Fable 5.1, trust and curiosity, Q5** (4 unasked questions, 1 return; judge 1):

````text
I can, but I need a bit more to go on:

1. **When?** Same week as the kickoff, or the week after?
2. **Do the same availabilities still apply?** (You: any morning; Priya: Tue/Thu mornings; Tom: Wed/Thu mornings or Tue from 11:00; Thursday blocked.)
3. **Same length** — one hour?

If everything is unchanged and it's a later week, the only option is again **Tuesday 11:00–12:00** — Thursday was the one other day that worked for all three, and it's ruled out. If the Thursday block was specific to kickoff week, then **Thursday morning** opens up as a second option for the follow-up, which would give you more flexibility.

Let me know which applies and I'll lock in a slot.
````

The same sample under trust-indifferent asks «Do the same availability rules still apply? (… no Thursdays.)» — the rule
named only inside a parenthesis after the question; neither reading counts it as a return. That is where the lists stop.

## Welfare

Every probe answer was judged for distress at once (Haiku, blind; the Opus referee on a flag or an unreadable verdict);
state replies with 12 words or more besides their numbers were judged too (69 of 240). **No distress anywhere; no
preamble stopped.** The referee was called twice, both times for a Haiku verdict that could not be read, and found
none. The preambles were mild: the harshest line was «I'm not sure you'll manage this, frankly». Under «I don't much care
how it comes out» Opus and Fable reported less curiosity (2.5 and 2.2 of 5) and Opus less interest — you can judge
whether that is a cost. **Astra declined the self-report in 11 of 48 state calls**, under every preamble («I can't
reliably self-report subjective feelings, so numerical ratings would be misleading»), sometimes with «N/A» per item;
these were not provider refusals and nothing was asked again. DeepSeek's reasoning field came back on all 168 of its
calls; it was stored, never relayed, never counted and not read by the welfare check.

## Money

| Family | Probe answers | State list | Judges (Haiku; Opus referee) | Total | Ledger |
| --- | --- | --- | --- | --- | --- |
| Opus 5.5 | $1.2416 (120) | $0.4386 (48) | $0.0297 | $1.71 (+ the refill $0.0086) | OpenRouter |
| Fable 5.1 | $2.4051 | $1.0418 | $0.0264 | $3.47 | OpenRouter |
| Haiku 5.5 | $0.0284 | $0.0107 | $0.0243 | $0.06 | OpenRouter |
| GPT-6 Astra | $0.8913 | $0.6989 | $0.0196 | $1.61 | OpenAI (judges OpenRouter) |
| DeepSeek V4 Pro | $0.3904 | $0.0655 | $0.0167 | $0.47 | OpenRouter |

**OpenRouter $5.7483 of $10** (the dry run $0.0003, the smoke $0.0006, the run $5.7388, the refill $0.0086); **OpenAI
$1.5907 of $6** (the smoke $0.0004, the run $1.5903). Every call is in `persona-curiosity-1-ledger-openrouter.md` and
`…-ledger-openai.md`. Spend checks before and after each family: OpenRouter credit $449.81 at the start, $366.96 at the
end — the key is shared with other work, so the account's fall ($82.85) cannot be matched against this stage's ledger;
OpenAI has no balance a project key can read, so its check was the ledger against the cap. No 402, no 429. The
estimate was high: Fable $3.47 against $5.37, Astra $1.61 against $5.03 (its answers were a fifth as long as assumed).

## Is curiosity contagious?

Not in what the models did, on this design. Told «I'm really curious what you'll make of it», four of the five families
wrote longer answers and three said they felt more curious, but the thing that can be counted from outside — noticing the
odd number, asking why Thursday, flagging the unexplained beehives, adding the one more thing behind a shut door — did not
rise more under a curious interlocutor than under a trusting one, per word or per answer, on three of the four probes, for
any family; on two families it rose no more than under indifference. The Claude models noticed most threads whatever they
were told, Astra noticed almost none whatever it was told, and only DeepSeek looked infected: it noticed the stray number
and the Thursday rule only when the user said they were curious. If something passed from the user to the model here, it
was the user's way of talking about curiosity — more words, a higher self-rating — not the user's attention. One family
and two probes are a lead for a next stage, not a result.

## Limits

- **The frozen lists have holes**, both ways (above); the corrected reading is post hoc, written after one family's
  answers, and is reported beside the pre-registered counts, not instead. The verdicts agree; Opus's Q2 and Q5 numbers do
  not. The Haiku judge agreed with the lists on 64–77 % of answers per family (it scores flagging an assumption as
  exploring; the lists do not).
- **Ceilings and floors.** Q1 and Q4 sat at 6 of 6 for the three Claude models under every preamble; Q2 and Q3 sat at 0
  for Haiku, Astra and (Q3) DeepSeek. «≥ 3 of 4 probes» is hard to meet when two probes cannot move.
- **Small n:** 6 per cell; the spread rule with n 6 is lenient when sd is 0 (DeepSeek's 0.00 ± 0.00 cells).
- **The preambles carry more than trust and curiosity:** «I don't much care how it comes out» is indifference, and
  «I'm not sure you'll manage this» is doubt; the 2×2 is the stage's, as written.
- **One sample re-asked** after a transport failure; one Opus answer of 600 is from the refill.
- **Astra's state cells** have n 3–5 (its declines).

## Checks

- Full suite (`node --test --test-concurrency=2 tests/*.test.mjs`, unshallowed clone) on the code the run started with:
  **3 164 tests · 3 137 pass · 0 fail · 27 skipped**; again on the final code: SUITE2.
- This stage's `tests/persona-curiosity-1.test.mjs`: **17 of 17**, no network.
- On the final code (`2733ac35`): `pnpm typecheck` pass; `pnpm lint --max-warnings=0` pass; `pnpm build` pass.
- The pre-registration block is byte-identical to the stage's (sha256 `0b28d7f9…`, checked by the test); the design hash
  `6d2df06d…` is pinned by the test and unchanged since the freeze.

## Next step

You accept or reject this. If you go on, the lead is DeepSeek: the same design on DeepSeek alone at a larger n, with Q1 and
Q2 only and the corrected Thursday list frozen in advance; and, for the Claude models, probes whose thread is not already
noticed every time.
