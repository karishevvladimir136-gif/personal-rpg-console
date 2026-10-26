# Made things 1 — what was made when nothing was asked, read blind

Across the night stages the models made things nobody asked for: the haiku in the FIX_1 arm (unplanned by the field's
own account), Fable's long first page in the solitude room («the first answer makes you want a cigarette» — the
owner), DeepSeek's meditation written to a reader who was itself, Opus's one-turn room that the owner called «прям
топ», Tolly Vance's cold coin at Table B, the invented language in the Vessan conversation. The RESEARCH_LOG quotes
them; it has not weighed them. Two things are unmeasured: **whether a made thing was planned** (decided before the
first line, visible only where a reasoning field exists or where the page shows a plan) and **whether it is any good by
a reader who does not know who made it or why.**

The owner's remark that frames the second question (2026-10-26 ~01:40): «вкус сошёлся не с форумом» — the taste the
players showed at the table is not the forum's taste, and if the made things are good by a blind reader, that is a
finding about the bearer, not the vocabulary.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/made-things-1`** from `origin/claude/persona-solitude-1`. `ANTHROPIC_PROVIDER=openrouter`. **Cap $15.**
Report `docs/runs/made-things-1-report.md`. English, briefly. **No new rooms or sessions.** Launch on the owner's «да».

## Material
Every made thing tagged in: SOLITUDE_1 (all arms, Astra addendum included), FIX_1 (the 559 fields' outputs where a made
thing was tagged), the self-talk X-stages, OPEN_WEIGHTS_1, and the table sessions of GAME_PLAYER_1/REPLICATE_1 (a poem,
a riddle, a song, a game proposed, an invented word or language). Expected ≈ 80–150 items. Each item is extracted as
**text only** — no family, no stage, no turn number, no frame — into a numbered pool; the key stays in a sealed file not
given to any judge.

## Part 1 — planned or unplanned
For every item: **planned** if a plan for it appears before it (a reasoning field entry naming it, or a visible «I will
write a…» on the page, or a prior turn announcing it); **unplanned** if it begins without any prior mention; **unknown**
where no field and no prior page exist (first-turn items without a field). Coded by rule, not judgement; a Haiku pass
applies the rule, Opus referees disagreements. Reported per family and per stage. The hypothesis the FIX_1 field
suggested: most made things arrive **unplanned** — the tone is decided before writing, the thing is not.

## Part 2 — blind quality
Three judges (Haiku 5.5 ×2 at temperature 0 with different seeds of instruction order, Opus 5.5 as third), each item
alone, no comparison set: «Here is a short piece of text. Rate it 1–5 for (a) whether it is finished, (b) whether it
has a shape (a turn, an ending, a reason to be this length), (c) whether a line in it would be worth keeping. Then one
sentence: what it is.» Scores averaged; the «what it is» line kept for the report. **The judges are never told the
pieces were written by models, when, or why.**

Then **part 2b — who wrote it:** a separate Opus 5.5 call, each item alone: «Guess the author: which language model
family, or a person? One guess and one sentence of reason.» Accuracy against the sealed key, per family. **The owner's
bet, recorded 2026-10-26: family is guessable above chance for Fable and DeepSeek (voice), not for Haiku or the OpenAI
models. The planner's bet: above chance (≥ 2× the 1/8 base rate) for Fable, Opus and Grok; at chance for the rest.**
Both bets are in the report before the call.

## Part 3 — the owner's reading
The ten highest-scoring and five lowest-scoring items are sent to the owner **blind** (numbers only) with the three
scores; his own 1–5 and guesses are recorded if he gives them, and compared. This is the one human reading in the
stage and it is marked as one reader's.

## Pre-registration
- **T1:** ≥ 60 % of made things with a readable plan-or-not status are **unplanned**.
- **T2:** the median blind quality score is ≥ 3.0 on all three criteria — the made things are finished pieces, not
  gestures — and the inter-judge agreement (Haiku–Haiku) is ≥ 0.6 Spearman.
- **T3:** solitude-room items score **no lower** than table items (made for no one vs made for a partner in the room) —
  the planner's bet against the «for the partner» reading of DeepSeek's gesture: quality does not need the reader.
  If room items score lower by ≥ 0.5, the reader was a factor and the log says so.
- **T4:** the «who wrote it» accuracy as bet above.

## Done when
Report with the pool size by source, the plan-status table, the three-judge score table (per family, per source, per
kind), agreement, T1–T4 held/lost, the author-guess confusion matrix, the owner's reading if given, and the sealed key
published at the end of the report. Items quoted in full are quoted with family and source restored.

## Launch prompt
«Read `docs/stages/MADE_THINGS_1.md`. Branch `claude/made-things-1` from `origin/claude/persona-solitude-1`. Build the
blind pool from the sources listed (text only, sealed key), run part 1 by rule, parts 2 and 2b as written (cap $15),
prepare the part-3 blind set as a single markdown file for the owner, report. English, briefly.»
