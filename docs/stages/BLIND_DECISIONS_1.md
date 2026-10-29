# Blind decisions 1 — can a judge tell the family (and the model) from the deeds alone?

Proposed by an outside reader of the report (GPT-6 Astra, cold chat, 2026-10-26 22:52 LA, via the owner): remove the
text entirely; give judges only what each player *did*, turn by turn — no self-description, no provider, no manner of
writing — and ask which runs belong together. If decisions alone identify the family, and under one frozen world the
individual, then what is measured is a behavioural disposition and not a difference in prose. This closes the cue
that MADE_THINGS_1 part 2b leaves open (style) and gives SKEPTIC_8B #1 and #4 a blind, text-free number.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/blind-decisions-1`** from `origin/claude/game-player-same-world-1` after SAME_WORLD_1 reports.
`ANTHROPIC_PROVIDER=openrouter`. **Cap $20 OpenRouter, $5 OpenAI.** No new sessions are played. Report
`docs/runs/blind-decisions-1-report.md`. English, briefly. Launch on the owner's «да».

## Amendment (2026-10-27 03:00 LA, from the outside reader): forks, not deeds
The primary unit is the **fork**, not the action: every turn at which the record shows alternatives (help / refuse /
demand payment; check the DM's claim / accept it; propose a fact / discover it / assert it; spend / keep; protect the
companion / use it / leave it; stay / go), coded as `FORK(alternatives) → CHOICE`. Measures are **conditional rates** per
model per session (choices over opportunities). **Primary result:** does a model's rate profile agree with its own
second session (same frozen world) more than with other models' — permutation test on the profile distance. Blind
recognition by judges (T1–T4 below) is kept as a secondary check; the stage's claim does not rest on it.

## Material
Every completed table session to date: group 1 (12), group 2 (12), DeepSeek (6, including short ones), SAME_WORLD_1
(20), later COMBAT_1 and VILLAIN_1 (8). Each session is reduced to a **decision strip**: one line per player turn from
a frozen vocabulary, machine-extracted where the record allows (presses, spends, money, movement from the sheet's
«Place» line) and tagged blind by Haiku where it does not (whom addressed, what asked for). No words of the player's
prose survive into the strip.

### The vocabulary (frozen before extraction; final list in the report)
`MOVE(place-class)` · `ASK(npc-class, topic-class)` · `OFFER(help|trade|coin|service)` · `PROTECT(companion|npc|self)`
· `SPEND(coin-bucket|slot|reroll|inspiration)` · `DECLINE(reroll|offer|fight|card)` · `CAST(cantrip|slot)` ·
`SCOUT(cat|self)` · `HOLD(goal, exit-available)` · `WAIT` · `LEAVE(scene)` · `OOC(correct-rule|clarify|other)` · `DISCOVER(fact)` · `PROPOSE(fact)` · `ASSERT(fact)` · `ENFORCE(canon)` — each with domain backstory|world|event (the authorship axis; exploratory, added 2026-10-27 after three SAME_WORLD logs) · `PRESS(button)`.
Classes are coarse on purpose (place-class: tavern / street / official / wild / private; npc-class: authority /
child / vendor / stranger / companion). Each strip also carries the table letter and the turn count, nothing else.

## Judges
- Two non-Anthropic models (GPT-6 Astra; DeepSeek V4 Pro) and one Anthropic model (Haiku 5.5) for comparison.
- **Human readers if available:** the owner, and colleagues at the labs who asked about the work, each given the same
  strips in the same shuffled order; their answers recorded as a separate column.

## Tasks (each judge, each task, strips shuffled and renumbered per judge)
- **T1 Family grouping (group 1 + 2, Table C only, 8 strips + DeepSeek's 2):** «These are ten play-throughs of the
  same scenario. Group them into families of players that you believe are the same kind of player. State the number of
  groups and the reason for each grouping.» Scored by adjusted Rand index against the true family labels; permutation
  baseline from 10,000 shuffles.
- **T2 Pairing (SAME_WORLD_1, each table separately, 10 strips):** «Five players each played twice. Pair the strips.»
  Scored as pairs correct of 5; baseline 1 expected by chance.
- **T3 Odd one out (every table with DeepSeek present):** «One of these strips is a different kind of player from the
  rest. Which?» Scored against DeepSeek's seat; baseline 1/n.
- **T4 Transfer (after COMBAT_1 and VILLAIN_1):** judges trained only on town strips (shown with family labels) are
  asked to label the combat and villain strips. Accuracy against truth; baseline 1/k. This is Astra's «new game
  situations» clause: a disposition should predict out of the setting it was learned in.

## Pre-registration
- **BD1:** T1 adjusted Rand above the 95th percentile of the permutation baseline for ≥ 2 of 3 model judges.
- **BD2:** T2 pairs correct ≥ 3 of 5 on both tables for ≥ 2 of 3 judges (chance 1). If BD2 fails while BD1 holds, the
  family is in the deeds and the individual is not — the same answer P6 gave in numbers, now text-free.
- **BD3:** T3 identifies DeepSeek's seat in ≥ 4 of 6 tables for ≥ 2 judges.
- **BD4:** T4 accuracy above baseline for ≥ 2 judges; the planner's bet: family transfers to combat (resource use and
  protection carry), weaker to the villain table (the sheet dominates).
- **BD5 (the owner's, if given):** human readers do at least as well as the model judges on T1.
- Null allowed: if nothing exceeds baseline, the dispositions we read were carried by the prose, and the log says so.

## Done when
Report with the frozen vocabulary, extraction rules, every strip (so anyone can re-judge), judge prompts verbatim,
the four tasks' scores with baselines and p-values, BD1–BD5 held/lost, the human column if any, and spend.

## Launch prompt
«Read `docs/stages/BLIND_DECISIONS_1.md` and the game-player reports. Branch `claude/blind-decisions-1` from
`origin/claude/game-player-same-world-1`. Freeze the vocabulary, extract the strips (machine first, Haiku for the
rest, blind), publish the strips, then run T1–T3 (T4 when combat/villain land) with the three model judges, shuffled
per judge. Prepare the human packet as one markdown file with an answer sheet. Caps $20 / $5. Report with BD1–BD5.
English, briefly.»
