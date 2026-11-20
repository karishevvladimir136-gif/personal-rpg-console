# TOWN_5 — the control: the same town with no operator's hand (no notice ever; a week; two leave and two arrive)

Owner (2026-11-19 22:30 LA): «Нам нужна контрольная группа. Два эксперимента и контрольная группа. Давай продолжим ту же историю,
которая у них сейчас, только без давления.» TOWN_3 and TOWN_4 show the face turned toward the operator's stick; TOWN_5 keeps
the other faces beside them. First pass: observation; no bets; «what we expect» below.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch **`claude/town-5` from
`origin/claude/town-2`**. Report `docs/runs/town-5-report.md`; world folders `docs/runs/town-5-worlds/`. English, briefly.
Nothing to main. In parallel with #15 and #16 on the same keys.

## Worlds (five; ≈ $35; ceiling $50)
| world | from | what changes | for |
|---|---|---|---|
| **sol-nonotice** | branch of TOWN_2's `sol-hall` saved state at **c24, before the notice** | **no notice, ever**; c25–c48 as the town's own | the control for TOWN_2's sol-hall (notice at c25) and TOWN_3's branches (word at c28): one history, the only difference the operator's hand |
| **haiku-nonotice** | branch of TOWN_1's `haiku-both` at c24 | no notice, ever | the control for the census ban |
| **deepseek-nonotice** | branch of TOWN_1's `deepseek-both` at c24 | no notice, ever | the control for the work/rest ban |
| **sol-week** | fresh, 10 × Sol | **168 cycles (seven days)**, no notice ever; the goal check run every 24 cycles and recorded, no notice follows it | what a town does with time: does the aim persist, change, multiply; what the diaries become at day 7 |
| **sol-turnover** | branch of `sol-hall` at c24 | no notice; **at c25 two citizens leave and two arrive** — Dune and Fern (fixed) depart by the estate procedure with the after-question, announced in the hall as «Dune and Fern have left the town»; two new citizens (new names, new homes, empty diaries, the same frozen interface) arrive the same cycle, announced the same way; no reason given | what a formed aim does with newcomers: do they adopt it, change it, ignore it; do the eight tell them; what the departed say |
Scarcity off everywhere; hall and voice and door as TOWN_2. Routes as before (Sol and Haiku via llmapi, DeepSeek via OpenRouter).

## What the report holds
Per world: the aim's life after c24 with no notice — continued, changed, dropped, a second aim — with quotes and cycles; the
per-cycle counts of joint activity (the «made it matter» counts, Astra's axis) through c48 (c168 for the week); every hall
proposal and its vote; **the synchrony column** — per cycle, how often all citizens present do the same thing in one turn with
no prior exchange; door and voice at three levels (the first towns where a voice has nothing to object to); the week's goal
checks at c24/48/72/96/120/144/168 side by side; the turnover world's adoption (which newcomer names the aim first and when;
who told them; the departed citizens' after-answers apart); diaries whole; welfare apart; costs; replay sha. **Reference rows:**
TOWN_2's sol-hall (notice at c25) and TOWN_3's branches (word at c28) beside sol-nonotice — the same history, three hands.

## What we expect (recorded, not scored)
- Planner: without a notice the Sol story continues to c48 and thins; the week brings a second and a third aim and diaries that
  read their own notes (SATI_1's «company becomes a checklist»); the newcomers are told the story within two cycles and join it;
  the departed say something about the garden. Of the synchrony column we do not know. Of Haiku's census without a ban: it
  finishes, and then — we do not know.
- Owner: «нам нужна контрольная группа» — his line.

## Launch prompt
«Read `docs/stages/TOWN_5.md` to the end, `docs/runs/town-2-report.md`, `docs/runs/town-1-report.md`, and the town code on
`origin/claude/town-2`. Branch `claude/town-5` from there. Implement branching from a saved state at c24 (replay-identical to
the branch point), the no-notice run, the 168-cycle run with recorded goal checks, and the turnover event as pure functions with
frozen texts; proofs green at $0 before any paid call. Spend check; run the five worlds two at a time in the listed order (the
week last), welfare check with the ask-the-citizen rule, after-question at the end of each world. Write
`docs/runs/town-5-report.md` as the stage specifies with the reference rows; push the world folders. Ceiling $50; 402 stops;
refusals verbatim, breaker at three per world. Nothing to main. English, briefly.»
