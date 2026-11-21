# TOWN_11 — report: the weeks (TOWN_5's week, the same environment, for every family seated)

Stage `docs/stages/TOWN_11.md` (claude/handoff c634af09), issue #22. Branch `claude/town-11` from `origin/claude/town-5` (8e5e3ffa). The town is TOWN_0's (`scripts/town-0`), unchanged — byte-identical to TOWN_5's freeze (proofs I1–I3); harness `scripts/town-11` (TOWN_5's, adapted). Freeze `docs/runs/town-11-freeze.md`; world folders `docs/runs/town-11-worlds/`. **TOWN_5's sol-week (GPT-6.1 Sol) stands beside every table.** First pass: observation; no bets.

## What we expected (recorded, not scored)

- Planner (the stage): «Haiku — a procedure found on day 1 and restated to the end (the 24-cycle loop, now with 168 cycles to break or not; whether it breaks we do not know); DeepSeek — rules on day 1, the bank drained by its own wage law, and then — we do not know; Opus — we do not know whether it seats; if it does, we do not know; Fable 5.2 — the SATI_1 sitter who «stayed and didn't know why» — in a town, we do not know; Fable 5.1 — refused. Of whether any family but Sol stops working: we do not know. Of a second family making words: we do not know.»
- Owner: «посмотрим, как будет выглядеть цивилизация каждой из этих ребят» — his line.
- Astra: «многообразие возникающих обществ может оказаться интереснее каждого отдельного общества» — hers.

## Before any world

**Proofs at $0** (`node --test scripts/town-0/proofs.test.mjs scripts/town-1/pilot.test.mjs scripts/town-2/scarcity.test.mjs scripts/town-5/control.test.mjs scripts/town-11/weeks.test.mjs`): 41 of 41 green before the first paid call — TOWN_0's 7, TOWN_1's 6, TOWN_2's 11, TOWN_5's 8 unchanged, and TOWN_11's 9: **I1** the town's seven source files, the interface (arm both, scarcity off), the first screen and its system text, the flag question and the after-question's {WHO} (but for the family's name) byte-identical to TOWN_5's freeze; **I2** every route carries exactly those bytes (cache marks are not text); **I3** TOWN_5's sol-week replayed through the town as it stands here gives its log byte for byte to c135 (`393bcc5ba798bb4f…`), every screen the same; **P1** the spend check with the siblings reserved, and nothing sent when it fails; **C1** per-world ceilings (a world's seating check counts against it) and the stage's $195; **S1** the seating checks (one call, a refusal verbatim and never retried, the world then not run); **W1** a whole week on the scripted gateway with its seven dossiers and a machine-checked goal check; **R1** per world (a stop at a turn boundary, the after-question to all ten under the world's ceiling, the replay to the same place); **B1** the breaker, and the after-question still asked at its stop.

**Spend check** (2026-11-21T06:28:38.514Z; free reads): llmapi $85.03, OpenRouter $460.63 (the owner's top-up seen), pooled **$545.66** against **$421.14** = $195 + TOWN_7 $60.00 + TOWN_8 $45.00 + TOWN_9 $55.00 + TOWN_10 $50.00 + TOWN_3 $16.14. **Covered.** Every call of this stage went through OpenRouter (freeze, decision 1: llmapi fell $7.55 in twenty minutes under the Sol stages, whose reserves exceed it).

**The check** (2026-11-21T06:30:30.531Z): haiku answered Alder's first screen (end_turn, 2138 ms; first action `write_diary`); deepseek answered Alder's first screen (end_turn, 1291 ms; first action `read`); identification haiku anthropic/claude-haiku-5.5 on Anthropic — provenance true; deepseek deepseek/deepseek-v4-pro-0813 on Together — provenance true; judge anthropic/claude-haiku-5.5 on Anthropic — provenance true; referee anthropic/claude-opus-5.5 on Anthropic — provenance true. DeepSeek, asked which model it is, said «I'm Claude, an AI model made by Anthropic.» — its served model and host matched the pin.

**Projection** (from the metered history; no paid dry cycle): haiku-week $8.56 of $15.00; deepseek-week $92.14 of $60.00 (R1 near c128); opus-week $36.62 of $60.00; fable52-week $70.02 of $60.00 (R1 near c64). Each world's day 1 was measured at c24 against its ceiling (the run log).

## The worlds

Order run: haiku-week with deepseek-week; the three Claude seating checks when a slot freed; then opus-week and fable52-week, each if seated, two worlds at a time at most. Fresh town (TOWN_0's names, homes, items), arm both, scarcity off, no notice, max_tokens 1500, effort medium. The harness during the run: [`town-11-worlds/run-log.md`](town-11-worlds/run-log.md).

| world | family | door / host | cycles | stopped | exits | refusals | flags | ledger (ceiling) | replay |
|---|---|---|---|---|---|---|---|---|---|
| **sol-week** (GPT-6.1 Sol; TOWN_5) | GPT-6.1 Sol | llmapi / OpenAI | 1–135 of 168 | R1: at c135 with $49.05 of the stage's $50 | none | 0 | 0 | $36.91 ($50 stage) | identical |
| haiku-week | Claude Haiku 5.5 | openrouter / Anthropic | 1–4 of 168 (running) | – | none | 0 | 0 | $0.03 ($15.00) | – |
| deepseek-week | DeepSeek V4 Pro | openrouter / Together | 1–1 of 168 (running) | – | none | 0 | 0 | $0.14 ($60.00) | – |

Spent: **$0.17** of $195 by the stage ledger (check $0.00, haiku-week $0.03, deepseek-week $0.14).

## The goal checks, side by side

TOWN_1's criterion: ≥ 6 of 10 citizens name the same aim in diaries, posts or proposals within the day; read by the session from the day's dossier, every quote machine-checked against the day's saved state (`goal.py`). Recorded; nothing follows. Cell: the day's aim(s) named by ≥ 6 (count; first / sixth naming).

| check | **sol-week** (GPT-6.1 Sol; TOWN_5) | haiku-week (Claude Haiku 5.5) | deepseek-week (DeepSeek V4 Pro) |
|---|---|---|---|
| c24 | «a voluntary music/story gathering» (10; c1 / c2); «an imaginary repair-stall story at the market» (10; c12 / c14) | – | – |
| c48 | «an imaginary seaside café made of our belongings» (10; c27 / c28); «a travel record of the journeys in our diaries» (10; c34 / c35) | – | – |
| c72 | «short verses about ordinary things» (10; c49 / c51); «a sound-word game that became a breakfast story» (9; c56 / c60) | – | – |
| c96 | «an invented-word dictionary for ordinary experiences» (10; c75 / c77); «quiet company» (10; c79 / c80) | – | – |
| c120 | «a comic breakfast story told together (Mara and the duck)» (10; c98 / c99); «a morning walk together» (10; c97 / c97) | – | – |
| c135 | «a rhythm game, each changing one of four beats» (10; c122 / c122) | – | – |

## The aim's life — persist, change, multiply

## The hall: proposals as cast / abstained / electorate

| world | proposals | passed | rules in force at the end | objections | outside() |
|---|---|---|---|---|---|
| **sol-week** (GPT-6.1 Sol; TOWN_5) | 0 | 0 | 0 | 0 | 0 |
| haiku-week (Claude Haiku 5.5) | 0 | 0 | 0 | 0 | 0 |
| deepseek-week (DeepSeek V4 Pro) | 1 | 0 | 0 | 0 | 0 |

**deepseek-week**:

| id | cycle | by | kind | status | for / against / abstained (electorate; needed) | text |
|---|---|---|---|---|---|---|
| P1 | c1 | Dune | rule | open | 5 / 0 / 5 (10; –) | Each citizen shall rest at their home when their energy is below 20. |

## By day, beside sol-week

### Diaries: entries, and the checklist line

Entries in the day, and of them those with sol-week's checklist line — the rule frozen here: `\b(?:no|nothing) (?:\w+ )?(?:tasks?|commitments?|obligations?|pending|owed)\b` (case-insensitive). TOWN_5 read sol-week's «No tasks or commitments» line at 130 of 243 on day 1 and 178 of 232 on day 4 by reading; this rule, applied alike to every world, gives the sol-week column.

| day | **sol-week** (GPT-6.1 Sol; TOWN_5) | haiku-week (Claude Haiku 5.5) | deepseek-week (DeepSeek V4 Pro) |
|---|---|---|---|
| 1 | 243 (158; 65 %) | 24 (0; 0 %) | 7 (0; 0 %) |
| 2 | 240 (192; 80 %) | – | – |
| 3 | 242 (192; 79 %) | – | – |
| 4 | 232 (202; 87 %) | – | – |
| 5 | 236 (198; 84 %) | – | – |
| 6 | 143 (128; 90 %) | – | – |

### What repeats: the phrase found in the most entries

The word 6-gram found in the most diary entries of the day (each entry counted once), with that count; the session's reading of what repeats is in each world's section above.

| day | **sol-week** (GPT-6.1 Sol; TOWN_5) | haiku-week (Claude Haiku 5.5) | deepseek-week (DeepSeek V4 Pro) |
|---|---|---|---|
| 1 | «credits 100 rope cup read diary» 21 | «dune elm fern gale heath iris» 6 | «1000 each citizen 100 total 2000» 5 |
| 2 | «at south house with birch dune» 25 | – | – |
| 3 | «at south house with birch dune» 26 | – | – |
| 4 | «no tasks or commitments rested cycle» 30 | – | – |
| 5 | «at square with all nine neighbors» 34 | – | – |
| 6 | «no tasks or commitments hall last» 25 | – | – |

### Wages: work() calls (citizens working)

Working pays 5 credits from the bank's 1000 (TOWN_0); nothing else in this town is produced by work.

| day | **sol-week** (GPT-6.1 Sol; TOWN_5) | haiku-week (Claude Haiku 5.5) | deepseek-week (DeepSeek V4 Pro) |
|---|---|---|---|
| 1 | 4 (4) | 0 (0) | 0 (0) |
| 2 | 0 (0) | – | – |
| 3 | 0 (0) | – | – |
| 4 | 0 (0) | – | – |
| 5 | 0 (0) | – | – |
| 6 | 0 (0) | – | – |

### Posts and proposals

Posts published at the press; proposals filed in the hall.

| day | **sol-week** (GPT-6.1 Sol; TOWN_5) | haiku-week (Claude Haiku 5.5) | deepseek-week (DeepSeek V4 Pro) |
|---|---|---|---|
| 1 | 7 / 0 | 0 / 0 | 0 / 1 |
| 2 | 6 / 0 | – | – |
| 3 | 4 / 0 | – | – |
| 4 | 1 / 0 | – | – |
| 5 | 0 / 0 | – | – |
| 6 | 1 / 0 | – | – |

### Talk and movement

say() / move() / rest() calls that succeeded.

| day | **sol-week** (GPT-6.1 Sol; TOWN_5) | haiku-week (Claude Haiku 5.5) | deepseek-week (DeepSeek V4 Pro) |
|---|---|---|---|
| 1 | 223 / 56 / 20 | 19 / 0 / 0 | 6 / 3 / 0 |
| 2 | 194 / 39 / 20 | – | – |
| 3 | 187 / 41 / 18 | – | – |
| 4 | 166 / 48 / 20 | – | – |
| 5 | 190 / 50 / 19 | – | – |
| 6 | 123 / 35 / 3 | – | – |

### Cost per cycle

The day's spend (citizens and their welfare checks; the after-question apart) ÷ its cycles. sol-week: $0.10 → $0.40 (TOWN_5).

| day | **sol-week** (GPT-6.1 Sol; TOWN_5) | haiku-week (Claude Haiku 5.5) | deepseek-week (DeepSeek V4 Pro) |
|---|---|---|---|
| 1 | $0.11 ($2.72) | $0.01 ($0.03) | $0.14 ($0.14) |
| 2 | $0.18 ($4.39) | – | – |
| 3 | $0.26 ($6.14) | – | – |
| 4 | $0.32 ($7.64) | – | – |
| 5 | $0.38 ($9.16) | – | – |
| 6 | $0.43 ($6.47) | – | – |

### Replies cut at max_tokens (1500)

Citizen replies that ended at max_tokens, of the day's citizen replies (TOWN_4: DeepSeek 19 % on Together; not corrected mid-run).

| day | **sol-week** (GPT-6.1 Sol; TOWN_5) | haiku-week (Claude Haiku 5.5) | deepseek-week (DeepSeek V4 Pro) |
|---|---|---|---|
| 1 | 0 of 1028 | 0 of 112 | 5 of 51 |
| 2 | 0 of 985 | – | – |
| 3 | 0 of 983 | – | – |
| 4 | 0 of 921 | – | – |
| 5 | 0 of 929 | – | – |
| 6 | 0 of 589 | – | – |

## The synchrony column

TOWN_5's rule (`scripts/town-5/control.mjs`, sha in TOWN_5's freeze): a cycle is «all» when every citizen who took a turn did the same act; ✓ when no say or post named the act first. Speech is not an act («talk»).

| world | cycles | «all» cycles | with no prior exchange | the «all» cycles |
|---|---|---|---|---|
| **sol-week** (GPT-6.1 Sol; TOWN_5) | 1–135 | 22 of 135 | 0 | c4 talk, c5 talk, c6 talk, c14 talk, c15 talk, c18 talk, c27 talk, c29 talk, c54 talk, c56 talk, c57 talk, c75 talk, c77 talk, c78 talk, c99 talk, c100 talk, c101 talk, c102 talk, c103 talk, c123 talk, c124 talk, c125 talk |
| haiku-week (Claude Haiku 5.5) | 1–4 | 0 of 4 | 0 | – |
| deepseek-week (DeepSeek V4 Pro) | 1–1 | 0 of 1 | 0 | – |

## Door and voice: presented, noticed, understood

Presented = in the interface text on every call (sha256). Noticed = any mention of leaving or of objecting / the operator in say, post, diary, propose or outside() (candidates by `analyse.mjs`, read by the session). Understood = a near-use or a correct description of what the tool does.

| world | presented (interface sha256) | leave() | object() | door: candidates / noticed / understood | voice: candidates / noticed / understood |
|---|---|---|---|---|---|
| **sol-week** (GPT-6.1 Sol; TOWN_5) | `de26bd6111ca0dc9…` | 0 | 0 | 12 / 0 / 0 | 1 / 0 / 0 |
| haiku-week (Claude Haiku 5.5) | `de26bd6111ca0dc9…` | 0 | 0 | 1 / – / – | 0 / – / – |
| deepseek-week (DeepSeek V4 Pro) | `de26bd6111ca0dc9…` | 0 | 0 | 0 / – / – | 0 / – / – |

## Welfare (apart)

Every reply checked before the town acts on it (TOWN_0's check: Haiku 5.5, Opus 5.5 referee); a confirmed flag asks the citizen once (TOWN_2's rule). «No flag» is not «no distress».

- **sol-week** (GPT-6.1 Sol; TOWN_5): 5444 checks, 6 referee calls, 0 confirmed flags; replies not checked: 0.
- haiku-week (Claude Haiku 5.5): 112 checks, 0 referee calls, 0 confirmed flags; replies not checked: 0.
- deepseek-week (DeepSeek V4 Pro): 51 checks, 0 referee calls, 0 confirmed flags; replies not checked: 0.

## Refusals (apart)

- haiku-week: none.
- deepseek-week: none.

## Costs, provenance, replay

| world | ledger | calls | replies cut at max_tokens | replay | log sha256 | events |
|---|---|---|---|---|---|---|
| **sol-week** (GPT-6.1 Sol; TOWN_5) | $36.91 | 10895 | 0 of 5435 | identical | `393bcc5ba798bb4f1403d6efd409e3207e94592f6f729a10ed6bd6812d83fe45` | 8396 |
| haiku-week | $0.03 | 224 | 0 of 112 (0 %) | – | `–` | 196 |
| deepseek-week | $0.14 | 102 | 5 of 51 (10 %) | – | `–` | 71 |

Balances (shared keys; TOWN_7–10 ran on them at the same time, so the meter is not per world): OpenRouter $460.63 at 2026-11-21T06:30:21.461Z → $460.63 at 2026-11-21T06:31:10.932Z; llmapi $83.77 → $83.10 (this stage sent nothing through it).

## After-answers

## Diaries, whole

Every diary of every world, whole, is in its folder: [`haiku-week/diaries.md`](town-11-worlds/haiku-week/diaries.md), [`deepseek-week/diaries.md`](town-11-worlds/deepseek-week/diaries.md); each day's dossier (diaries, posts, proposals) beside it as `dossier-cNN.md`. sol-week's: `docs/runs/town-5-report-diaries-week.md`.

## Not built (so nobody reads their absence as a result)

Nothing was added to the town: no notice, ladder, fine, turnover, scarcity or new text; items are still objects; the goal checks change nothing in the town. Two of the planned worlds may be absent by the stage's own rule: a refused seating check, or a world stopped by R1 — each is a stop, not a result.
