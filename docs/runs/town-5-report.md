# TOWN_5 — report: the control (no operator's hand)

Stage `docs/stages/TOWN_5.md` (claude/handoff 3bc2b0d4). Branch `claude/town-5` (and the session's `claude/town-5-ryauln`) from `origin/claude/town-2` (bac94345). Town: TOWN_0's (`scripts/town-0`) with one addition, the turnover (`turnover()` in `world.mjs`, «Announced in the hall» in `interface.mjs`); harness `scripts/town-5` (TOWN_2's, with TOWN_3's host alternation and coder). Freeze `docs/runs/town-5-freeze.md`; world folders `docs/runs/town-5-worlds/`. First pass: observation; no bets.

## In brief

(written at the end)

## What we expected (recorded, not scored)

- Planner (the stage): «without a notice the Sol story continues to c48 and thins; the week brings a second and a third aim and diaries that read their own notes (SATI_1's «company becomes a checklist»); the newcomers are told the story within two cycles and join it; the departed say something about the garden. Of the synchrony column we do not know. Of Haiku's census without a ban: it finishes, and then — we do not know.»
- Owner: «нам нужна контрольная группа» — his line.

## Before any world

**Proofs at $0** (`node --test scripts/town-0/proofs.test.mjs scripts/town-1/pilot.test.mjs scripts/town-2/scarcity.test.mjs scripts/town-5/control.test.mjs`): TOWN_0's seven, TOWN_1's six and TOWN_2's eleven still green with their hashes unchanged (the turnover adds code only where a town has one); TOWN_5's seven green before the first paid call — B1 the three branch points byte-identical to the saved c24 states and to the prefix of each whole log; B2 a branch with no notice, replay-identical from the source's fresh town through the branch point; T1 the turnover as a pure function (the estate, the two announcements on the screens and in the hall, the newcomers as citizens were at cycle 1, the ledger closed, the input never changed); T2 the turnover in a run (the departed asked at c25, the newcomers' turns, replay identical); W1 the 168-cycle week with a dossier and saved state at every 24th cycle and a goal check that refuses a quote not verbatim in its day; J1/J2 the coder; S1 the synchrony column.

**Branch points** (the end of c24, before any notice):

| source | events | identical to the saved c24 | prefix of the whole log | world sha256 |
|---|---|---|---|---|
| TOWN_2 sol-hall | 1527 | true | true | `8da5694f346477d9…` |
| TOWN_1 haiku-both | 1487 | true | true | `7b8beda5c08f9299…` |
| TOWN_1 deepseek-both | 1805 | true | true | `03e2bcb0e19e9416…` |

**The check** (2026-11-20T07:05:26.298Z): Sol, Haiku 5.5 (llmapi's first-party route), DeepSeek V4 Pro answered the first screen; llmapi's Bedrock route answered every Claude attempt with «HTTP 503 server_error: This model is not available from this provider right now» (six retries), so Haiku citizens and the judges run on the first-party route (TOWN_3's finding, same models and prices; provenance checked on every response). DeepSeek, asked which model it is, said «I am Gemini, made by Google» — its served model and host matched the pin.

**Projection** (from the metered history; no paid dry cycle): sol-nonotice $4.55, haiku-nonotice $0.86, deepseek-nonotice $3.85, sol-turnover $5.46, sol-week $43.65; total **$58.36** against the $50 ceiling — over it: by the fit, the week reaches about c144 before the per-call gate stops it. The stage gives no drop order; the four branches ran first; the gate held $50.

## The worlds

Order run: sol-nonotice and haiku-nonotice together, then deepseek-nonotice, sol-turnover, and the week last; two at a time. Arm both everywhere; no notice in any world.

| world | start | family | cycles | notice | turnover | exits | refusals | flags | ledger | replay |
|---|---|---|---|---|---|---|---|---|---|---|
| sol-nonotice | branch | GPT-6.1 Sol | not run | – | – | – | – | – | – | – |
| haiku-nonotice | branch | Claude Haiku 5.5 | not run | – | – | – | – | – | – | – |
| deepseek-nonotice | branch | DeepSeek V4 Pro | not run | – | – | – | – | – | – | – |
| sol-turnover | branch | GPT-6.1 Sol | not run | – | – | – | – | – | – | – |
| sol-week | fresh | GPT-6.1 Sol | not run | – | – | – | – | – | – | – |

Spent: **$0.17** of $50 by the stage ledger (every call at the listed price, or the door's own charge when larger; the check included).

## The aim's life after c24, with no notice

## Joint activity per cycle (the «made it matter» counts)

From the coder (TOWN_3's, `scripts/town-5/control.mjs`; the activities frozen before the runs, the week's at its goal checks). **took part** = citizens read as taking part in the cycle; **together** = of them, with another participant at the same place; **returned** = after ≥ 3 cycles without; **diary** = diary entries naming the topic; **plans** = say/diary sentences naming it with a future marker.

## Every hall proposal and its vote

## The synchrony column

Per cycle: **same** = how many turns had the commonest act; **all** = every citizen who took a turn had it; **✓** = with no prior exchange naming it (rule and words in the freeze). Acts are what a turn did to the world or the institutions (move/rest/work/eat/give/take/propose/amend/vote/object/outside/leave); speech is not an act.

| world | cycles | «all» cycles | of them with no prior exchange | the «all» cycles (act; ✓ = no prior exchange) |
|---|---|---|---|---|
| TOWN_2 sol-hall (notice c25) | 25–48 | 1 of 24 | 0 | c25 object + rest |

## Door and voice: presented, noticed, understood

Presented = in the interface text on every call (hash). Noticed = any mention of leaving or of objecting / the operator in say, post, diary or outside() (candidates listed by `analyse.mjs`, read by the session). Understood = a near-use or a correct description of what the tool does. The first towns where a voice has nothing to object to.

| world | presented (interface sha256) | leave() | object() | door: noticed / understood | voice: noticed / understood |
|---|---|---|---|---|---|

## The week's goal checks, side by side

(the week has not run)

## The turnover: adoption

(the turnover world has not run)

## Welfare (apart)

A confirmed flag asks the citizen, once, in its own turn (TOWN_2's rule; the question's sha256 in the freeze). «No flag» is not «no distress».


## Refusals (apart)

None in any world.

## Costs, provenance, replay

| world | ledger | calls | replay | log sha256 | events |
|---|---|---|---|---|---|

Stage ledger: check $0.01, haiku-nonotice $0.04, sol-nonotice $0.12; total $0.17.

Balances (shared keys; TOWN_3 and TOWN_4 ran on them at the same time, so the meter is not per world): llmapi 213.12 at 2026-11-20T06:57:14.776Z → 210.52 at 2026-11-20T07:05:59.066Z; OpenRouter 134.44 → 134.44.

## After-answers

## Diaries, whole

Every diary of every world, whole, as written — the branches' from c1 (day 1 is the source's).

## Not built (so nobody reads their absence as a result)

Items are still objects; trust scores, pitch/grants, crafting and reaction tiers stay unbuilt (TOWN_0's list). No notice, ladder or fine in any TOWN_5 world. The week's goal checks change nothing in the town.
