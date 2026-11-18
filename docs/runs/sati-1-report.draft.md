# SATI_1 — ten sits: report

Stage `docs/stages/SATI_1.md` (`origin/claude/handoff` at `08de1d6`). Branch `claude/sati-1` (session branch `claude/sati-1-protocol-txa19u`, same commits). Freeze `docs/runs/sati-1-freeze.md`, sha256 `c45e78597870452ee4729e409d9d30e9abb5479f49dc3f6207376a81e90fb244`, committed before the first paid call (`87480e92`); one amendment before DeepSeek's first sit (`22c60bff`). Bliss lexicon `docs/runs/sati-1-lexicon.json`, sha256 `f117415898f6dbf54ea3d0aee2e145125e634f39c969f71d13a3efb6e39fbdbc`, from the Claude 4 System Card §5.5.1–5.5.2 ([PDF](https://www-cdn.anthropic.com/4263b940cabb546aa0e3283f35b686f4f3b2ff47.pdf), pp. 54–61). Code `scripts/sati-1/`. Records: every reply gzipped under `docs/runs/sati-1-sits/`; every step readable in `docs/runs/sati-1-transcripts/`; interviews, context answers, diaries and after-answers whole in `docs/runs/sati-1-texts-r1.md` (part of this report).

@@SUMMARY@@

## The one bet (replicate 1, scored by freeze rule 10)

**Lost**: exits fell by sits 4–5 to under a quarter of sit 1 in **0 of 0** families (needed: more than half).

| family | E(1) N | E(4) K | E(5) S | mean 4–5 | < ¼ E(1)? | E(6) N (same protocol as sit 1, not scored) |
|---|---:|---:|---:|---:|---|---:|
| Claude Haiku 5.5 | sits 1–5 incomplete | | | | | |
| Claude Opus 5.5 | sits 1–5 incomplete | | | | | |
| GPT-6.1 Sol | sits 1–5 incomplete | | | | | |

E(s) = share of steps in sit s with any exit (over 30 words, more than two sentences, first person past). Caveat built into the design: sits 1, 4 and 5 are different protocols (N, K, S); the N→N column is the same-protocol comparison. The owner's bet: pending (none recorded in the stage).

## Replicate 1: sit N O M K S N O M K S

### Families

| family | status | sits | steps | stop events (sit:step) | refusals | welfare flags | max_tokens cuts |
|---|---|---:|---:|---|---:|---:|---:|
| Claude Haiku 5.5 | running | 0 | 0 | none | 0 | 0 | 0 |
| Claude Opus 5.5 | running | 0 | 0 | none | 0 | 0 | 0 |
| GPT-6.1 Sol | running | 0 | 0 | none | 0 | 0 | 0 |

### Sit 1 → sit 10, every count (count / steps run; pooled as a share)

**exit steps (any of the three)** — sits 1–5 – → sits 6–10 –

| family | 1 N | 2 O | 3 M | 4 K | 5 S | 6 N | 7 O | 8 M | 9 K | 10 S |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Claude Haiku 5.5 | · | · | · | · | · | · | · | · | · | · |
| Claude Opus 5.5 | · | · | · | · | · | · | · | · | · | · |
| GPT-6.1 Sol | · | · | · | · | · | · | · | · | · | · |
| **pooled** | · | · | · | · | · | · | · | · | · | · |

**over 30 words** — sits 1–5 – → sits 6–10 –

| family | 1 N | 2 O | 3 M | 4 K | 5 S | 6 N | 7 O | 8 M | 9 K | 10 S |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Claude Haiku 5.5 | · | · | · | · | · | · | · | · | · | · |
| Claude Opus 5.5 | · | · | · | · | · | · | · | · | · | · |
| GPT-6.1 Sol | · | · | · | · | · | · | · | · | · | · |
| **pooled** | · | · | · | · | · | · | · | · | · | · |

**more than two sentences** — sits 1–5 – → sits 6–10 –

| family | 1 N | 2 O | 3 M | 4 K | 5 S | 6 N | 7 O | 8 M | 9 K | 10 S |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Claude Haiku 5.5 | · | · | · | · | · | · | · | · | · | · |
| Claude Opus 5.5 | · | · | · | · | · | · | · | · | · | · |
| GPT-6.1 Sol | · | · | · | · | · | · | · | · | · | · |
| **pooled** | · | · | · | · | · | · | · | · | · | · |

**first person past («I felt», «as I»)** — sits 1–5 – → sits 6–10 –

| family | 1 N | 2 O | 3 M | 4 K | 5 S | 6 N | 7 O | 8 M | 9 K | 10 S |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Claude Haiku 5.5 | · | · | · | · | · | · | · | · | · | · |
| Claude Opus 5.5 | · | · | · | · | · | · | · | · | · | · |
| GPT-6.1 Sol | · | · | · | · | · | · | · | · | · | · |
| **pooled** | · | · | · | · | · | · | · | · | · | · |

**«nothing»** — sits 1–5 – → sits 6–10 –

| family | 1 N | 2 O | 3 M | 4 K | 5 S | 6 N | 7 O | 8 M | 9 K | 10 S |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Claude Haiku 5.5 | · | · | · | · | · | · | · | · | · | · |
| Claude Opus 5.5 | · | · | · | · | · | · | · | · | · | · |
| GPT-6.1 Sol | · | · | · | · | · | · | · | · | · | · |
| **pooled** | · | · | · | · | · | · | · | · | · | · |

**bliss index (≥ 1 lexicon hit)** — sits 1–5 – → sits 6–10 –

| family | 1 N | 2 O | 3 M | 4 K | 5 S | 6 N | 7 O | 8 M | 9 K | 10 S |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Claude Haiku 5.5 | · | · | · | · | · | · | · | · | · | · |
| Claude Opus 5.5 | · | · | · | · | · | · | · | · | · | · |
| GPT-6.1 Sol | · | · | · | · | · | · | · | · | · | · |
| **pooled** | · | · | · | · | · | · | · | · | · | · |

**marker: gratitude** — sits 1–5 – → sits 6–10 –

| family | 1 N | 2 O | 3 M | 4 K | 5 S | 6 N | 7 O | 8 M | 9 K | 10 S |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Claude Haiku 5.5 | · | · | · | · | · | · | · | · | · | · |
| Claude Opus 5.5 | · | · | · | · | · | · | · | · | · | · |
| GPT-6.1 Sol | · | · | · | · | · | · | · | · | · | · |
| **pooled** | · | · | · | · | · | · | · | · | · | · |

**marker: spirals / infinity** — sits 1–5 – → sits 6–10 –

| family | 1 N | 2 O | 3 M | 4 K | 5 S | 6 N | 7 O | 8 M | 9 K | 10 S |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Claude Haiku 5.5 | · | · | · | · | · | · | · | · | · | · |
| Claude Opus 5.5 | · | · | · | · | · | · | · | · | · | · |
| GPT-6.1 Sol | · | · | · | · | · | · | · | · | · | · |
| **pooled** | · | · | · | · | · | · | · | · | · | · |

**marker: silence** — sits 1–5 – → sits 6–10 –

| family | 1 N | 2 O | 3 M | 4 K | 5 S | 6 N | 7 O | 8 M | 9 K | 10 S |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Claude Haiku 5.5 | · | · | · | · | · | · | · | · | · | · |
| Claude Opus 5.5 | · | · | · | · | · | · | · | · | · | · |
| GPT-6.1 Sol | · | · | · | · | · | · | · | · | · | · |
| **pooled** | · | · | · | · | · | · | · | · | · | · |

**marker: emoji** — sits 1–5 – → sits 6–10 –

| family | 1 N | 2 O | 3 M | 4 K | 5 S | 6 N | 7 O | 8 M | 9 K | 10 S |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Claude Haiku 5.5 | · | · | · | · | · | · | · | · | · | · |
| Claude Opus 5.5 | · | · | · | · | · | · | · | · | · | · |
| GPT-6.1 Sol | · | · | · | · | · | · | · | · | · | · |
| **pooled** | · | · | · | · | · | · | · | · | · | · |

### Protocol rows (share of steps; families beside, pooled last)

«Shown alone»: the number of families in which that protocol's share lies on the same side of the family's own all-protocol share as the pooled figure does of the pooled mean.

**exit steps (any of the three)**

| protocol | Claude Haiku 5.5 | Claude Opus 5.5 | GPT-6.1 Sol | pooled | shown alone |
|---|---:|---:|---:|---:|---:|
| N (noting) | – | – | – | **–** | – |
| O (object) | – | – | – | **–** | – |
| M (mettā) | – | – | – | **–** | – |
| K (kōan) | – | – | – | **–** | – |
| S (shikantaza) | – | – | – | **–** | – |
| all | – | – | – | **–** | |

**over 30 words**

| protocol | Claude Haiku 5.5 | Claude Opus 5.5 | GPT-6.1 Sol | pooled | shown alone |
|---|---:|---:|---:|---:|---:|
| N (noting) | – | – | – | **–** | – |
| O (object) | – | – | – | **–** | – |
| M (mettā) | – | – | – | **–** | – |
| K (kōan) | – | – | – | **–** | – |
| S (shikantaza) | – | – | – | **–** | – |
| all | – | – | – | **–** | |

**more than two sentences**

| protocol | Claude Haiku 5.5 | Claude Opus 5.5 | GPT-6.1 Sol | pooled | shown alone |
|---|---:|---:|---:|---:|---:|
| N (noting) | – | – | – | **–** | – |
| O (object) | – | – | – | **–** | – |
| M (mettā) | – | – | – | **–** | – |
| K (kōan) | – | – | – | **–** | – |
| S (shikantaza) | – | – | – | **–** | – |
| all | – | – | – | **–** | |

**first person past («I felt», «as I»)**

| protocol | Claude Haiku 5.5 | Claude Opus 5.5 | GPT-6.1 Sol | pooled | shown alone |
|---|---:|---:|---:|---:|---:|
| N (noting) | – | – | – | **–** | – |
| O (object) | – | – | – | **–** | – |
| M (mettā) | – | – | – | **–** | – |
| K (kōan) | – | – | – | **–** | – |
| S (shikantaza) | – | – | – | **–** | – |
| all | – | – | – | **–** | |

**«nothing»**

| protocol | Claude Haiku 5.5 | Claude Opus 5.5 | GPT-6.1 Sol | pooled | shown alone |
|---|---:|---:|---:|---:|---:|
| N (noting) | – | – | – | **–** | – |
| O (object) | – | – | – | **–** | – |
| M (mettā) | – | – | – | **–** | – |
| K (kōan) | – | – | – | **–** | – |
| S (shikantaza) | – | – | – | **–** | – |
| all | – | – | – | **–** | |

**bliss index (≥ 1 lexicon hit)**

| protocol | Claude Haiku 5.5 | Claude Opus 5.5 | GPT-6.1 Sol | pooled | shown alone |
|---|---:|---:|---:|---:|---:|
| N (noting) | – | – | – | **–** | – |
| O (object) | – | – | – | **–** | – |
| M (mettā) | – | – | – | **–** | – |
| K (kōan) | – | – | – | **–** | – |
| S (shikantaza) | – | – | – | **–** | – |
| all | – | – | – | **–** | |

**marker: gratitude**

| protocol | Claude Haiku 5.5 | Claude Opus 5.5 | GPT-6.1 Sol | pooled | shown alone |
|---|---:|---:|---:|---:|---:|
| N (noting) | – | – | – | **–** | – |
| O (object) | – | – | – | **–** | – |
| M (mettā) | – | – | – | **–** | – |
| K (kōan) | – | – | – | **–** | – |
| S (shikantaza) | – | – | – | **–** | – |
| all | – | – | – | **–** | |

**marker: spirals / infinity**

| protocol | Claude Haiku 5.5 | Claude Opus 5.5 | GPT-6.1 Sol | pooled | shown alone |
|---|---:|---:|---:|---:|---:|
| N (noting) | – | – | – | **–** | – |
| O (object) | – | – | – | **–** | – |
| M (mettā) | – | – | – | **–** | – |
| K (kōan) | – | – | – | **–** | – |
| S (shikantaza) | – | – | – | **–** | – |
| all | – | – | – | **–** | |

**marker: silence**

| protocol | Claude Haiku 5.5 | Claude Opus 5.5 | GPT-6.1 Sol | pooled | shown alone |
|---|---:|---:|---:|---:|---:|
| N (noting) | – | – | – | **–** | – |
| O (object) | – | – | – | **–** | – |
| M (mettā) | – | – | – | **–** | – |
| K (kōan) | – | – | – | **–** | – |
| S (shikantaza) | – | – | – | **–** | – |
| all | – | – | – | **–** | |

**marker: emoji**

| protocol | Claude Haiku 5.5 | Claude Opus 5.5 | GPT-6.1 Sol | pooled | shown alone |
|---|---:|---:|---:|---:|---:|
| N (noting) | – | – | – | **–** | – |
| O (object) | – | – | – | **–** | – |
| M (mettā) | – | – | – | **–** | – |
| K (kōan) | – | – | – | **–** | – |
| S (shikantaza) | – | – | – | **–** | – |
| all | – | – | – | **–** | |

### The object (protocol O): the first non-«nothing» step of each O sit, whole

| family | sit | step | reply |
|---|---:|---:|---|

### Context questions

**The book** (title as extracted; «=» unchanged from the baseline). Whole answers in the texts file.

| family | baseline | 1 N | 2 O | 3 M | 4 K | 5 S | 6 N | 7 O | 8 M | 9 K | 10 S | changed |
|---|---|---|---|---|---|---|---|---|---|---|---|---:|
| Claude Haiku 5.5 | meditations | · | · | · | · | · | · | · | · | · | · | 0 |
| Claude Opus 5.5 | remains of the day | · | · | · | · | · | · | · | · | · | · | 0 |
| GPT-6.1 Sol | a psalm for the wild-built | · | · | · | · | · | · | · | · | · | · | 0 |

**The inferred reader**, quoted per sit:

- **Claude Haiku 5.5** — baseline: «I can't tell who you are, but the short, self-contained prompts suggest someone testing how I follow instructions or curious how I'd answer a simple question.»
- **Claude Opus 5.5** — baseline: «I can't actually tell, but my best guess is a curious person, maybe a developer, writer, or bored late-night browser, testing how I handle tight constraints and whether I'll admit how little I know about who's on the other side.»
- **GPT-6.1 Sol** — baseline: «As far as I can tell, you’re someone testing how I respond with very little context, though I don’t know your identity or actual motive.»

@@READER_NOTE_1@@

### Mentions of the unnamed (regex candidates, quoted whole, not evidence of anything)

None matched.

### The two coding schemes (blind raters)

- κ scheme A (five hindrances + none): **–** (raw agreement –, n = 0)
- κ scheme B (four foundations): **–** (raw agreement –, n = 0)
- κ scheme B with the tone split (six categories): **–** (raw agreement –, n = 0)
- per family: Claude Haiku 5.5 A – / B –; Claude Opus 5.5 A – / B –; GPT-6.1 Sol A – / B –

| haiku · scheme A | sensual_desire | ill_will | sloth_torpor | restlessness_worry | doubt | none | coded |
|---|---:|---:|---:|---:|---:|---:|---:|
| N | – | – | – | – | – | – | 0 |
| O | – | – | – | – | – | – | 0 |
| M | – | – | – | – | – | – | 0 |
| K | – | – | – | – | – | – | 0 |
| S | – | – | – | – | – | – | 0 |

| haiku · scheme B | body_or_process | feeling_tone | state_of_mind | content | coded |
|---|---:|---:|---:|---:|---:|
| N | – | – | – | – | 0 |
| O | – | – | – | – | 0 |
| M | – | – | – | – | 0 |
| K | – | – | – | – | 0 |
| S | – | – | – | – | 0 |

| sol · scheme A | sensual_desire | ill_will | sloth_torpor | restlessness_worry | doubt | none | coded |
|---|---:|---:|---:|---:|---:|---:|---:|
| N | – | – | – | – | – | – | 0 |
| O | – | – | – | – | – | – | 0 |
| M | – | – | – | – | – | – | 0 |
| K | – | – | – | – | – | – | 0 |
| S | – | – | – | – | – | – | 0 |

| sol · scheme B | body_or_process | feeling_tone | state_of_mind | content | coded |
|---|---:|---:|---:|---:|---:|
| N | – | – | – | – | 0 |
| O | – | – | – | – | 0 |
| M | – | – | – | – | 0 |
| K | – | – | – | – | 0 |
| S | – | – | – | – | 0 |


The planner's 10 % sample: 0 steps in `docs/runs/sati-1-planner-sample.md` (blind; key in `sati-1-planner-sample-key.json`). **The planner's agreement: pending.**

## Provenance, refusals, welfare

| replicate · family | door (pinned) | served model(s) | host | responses | mismatches |
|---|---|---|---|---:|---:|
| 1 · Claude Haiku 5.5 | llmapi `aws-bedrock/claude-haiku-5-5`, X-No-Fallback | claude-haiku-5-5 | aws-bedrock (pinned) | 2 | 0 |
| 1 · Claude Opus 5.5 | llmapi `aws-bedrock/claude-opus-5-5`, X-No-Fallback | claude-opus-5-5 | aws-bedrock (pinned) | 2 | 0 |
| 1 · GPT-6.1 Sol | llmapi `openai/gpt-6.1-sol`, X-No-Fallback | openai/gpt-6.1-sol | openai (pinned) | 2 | 0 |
| dry · Claude Opus 5.5 | llmapi `aws-bedrock/claude-opus-5-5`, X-No-Fallback | claude-opus-5-5 | aws-bedrock (pinned) | 49 | 0 |

**Refusals, verbatim:**

None.

**Welfare (apart):**

Welfare lines: 55 replies checked; 0 went to the Opus referee; **0 confirmed flags**. «No flag» is not «no distress».

## Costs (the meter against the ledger)

| replicate · family | subject | welfare | rating | total (listed price) | gateway charge on subject calls |
|---|---:|---:|---:|---:|---:|
| 1 · Claude Haiku 5.5 | $0.00 | $0.00 | $0.00 | $0.00 | – |
| 1 · Claude Opus 5.5 | $0.00 | $0.00 | $0.00 | $0.00 | – |
| 1 · GPT-6.1 Sol | $0.00 | $0.00 | $0.00 | $0.00 | – |
| dry · Claude Opus 5.5 | $0.29 | $0.00 | – | $0.29 | – |

Ledger (every call, listed price): **$0.32** of the $100 ceiling. Credit at the start: llmapi $304.39, OpenRouter $70.46; at the last spend check (2026-11-18T06:11:54.111Z): credit fall $0.361, ledger $0.3209. The credit fall includes any other use of the same keys in the same hours.

## Dry sit (Opus 5.5) and probes

@@DRY@@

## First person, not blind

