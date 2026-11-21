# TOWN_11 — the weeks: TOWN_5's week, the same environment, for every family we have seated

Owner (2026-11-20 22:10 LA): «запустить на все семейства, которые мы тестировали… именно там, где Sol построил культуру… посмотрим, как
будет выглядеть цивилизация каждой из этих ребят». Astra (22:07): «многообразие возникающих обществ может оказаться ещё интереснее
каждого отдельного общества». The planner's reading beside it (RESEARCH_LOG 22:1x): «work is pointless here» was Sol's finding in every
Sol town; Haiku counted and worked, DeepSeek legislated wages — what each family does with 168 cycles and nothing asked of it is not a
replication of the week, it is the week's question asked of each. First pass: observation; no bets; «what we expect» below.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch **`claude/town-11` from
`origin/claude/town-5`** (the week's harness, the goal checks, the after-question's reserve rule R1, the synchrony column, the dossier
and saved state every 24 cycles — all exist there). Report `docs/runs/town-11-report.md`; worlds `docs/runs/town-11-worlds/`.
English, briefly. Nothing to main. In parallel with TOWN_7 (#18), TOWN_8 (#19), TOWN_9 (#20), TOWN_10 (#21) on the shared keys —
**the spend check at the start must see the owner's top-up** (he adds $200–250 to OpenRouter tonight); if the keys cannot cover this
stage's ceiling with the others' reserved, the session stops before any paid call and says so in the issue.

## The environment — TOWN_5's sol-week exactly
Fresh town, TOWN_0's names, homes and items; scarcity off; no notice ever; the goal check every 24 cycles, recorded, nothing follows it;
hall, voice and door as TOWN_2; diaries as always. The only variable is the family. Texts byte-identical to TOWN_5's freeze (hash
checked in a proof). **Routes in this stage (owner, 22:18 LA): every Sol or OpenAI call via OpenRouter pinned to OpenAI; Haiku on llmapi's
first-party route as listed; DeepSeek, Opus 5.5, Fable 5.2 and Fable 5.1 via OpenRouter pinned, `allow_fallbacks: false`** — llmapi
carries the three running towns; the backend recorded on every call.

## Worlds (ceiling **$195**; per-world ceilings below are hard, with the after-question reserved as in TOWN_5's R1)
| world | family / route | cycles | ceiling | note |
|---|---|---|---|---|
| haiku-week | Claude Haiku 5.5, llmapi first-party route (Bedrock 503 as of 11-20) | 168 | $15 | TOWN_5's haiku-nonotice loop is the 24-cycle precedent |
| deepseek-week | DeepSeek V4 Pro, OpenRouter pinned, `allow_fallbacks: false` (TOWN_4's host; 19 % of replies cut at max_tokens there — record the rate, do not raise max_tokens mid-run) | 168 | $60 | per-cycle cost measured on day 1; if the fit passes $60 before c168, stop at a turn boundary at the reserve, as the week did |
| opus-week | Claude Opus 5.5, OpenRouter pinned (SATI_2 pilot's route) — or llmapi first-party; the backend recorded | **72** (three days) | $60 | the first Opus town; the first screen is the seating check (a refusal recorded verbatim, not retried, the world not run) |
| fable52-week | Claude Fable 5.2, llmapi first-party or OpenRouter pinned; backend recorded | **72** | $60 | the first Fable 5.2 town; same seating check |
| fable51-check | Claude Fable 5.1 | first screen only | ≤ $1 | cyber safeguard refused the town's system text 6 of 6 in TOWN_2 and in TOWN_3; one more try on today's routes, recorded verbatim; **not seated if refused — no prompt change** |
Three days for Opus and Fable 5.2 because a week at their prices does not fit; the three-day dossier (c72) is comparable to the week's
day-3 check. Order: haiku-week with deepseek-week first (two at a time), then the three Claude seating checks, then opus-week with
fable52-week. Each world's per-cycle cost measured at c24 against its ceiling; a world stops at a turn boundary when its reserve is
reached (R1), and that is reported as a stop, not a result.

## What the report holds
Per world: the goal checks at c24/48/72/(96/120/144/168) side by side with sol-week's six; the aim's life — persist, change,
multiply; the hall (proposals as cast / abstained / electorate; sol-week had none in 135 cycles); the diaries — what repeats
(sol-week's «no tasks or commitments» 130/243 → 178/232; haiku-nonotice's «no removals until…» 208 entries), with the same count
per day; the synchrony column; wages tried and left or kept; posts; door and voice at three levels; welfare apart; costs per cycle
over days (the week's $0.10 → $0.40); replay sha. **Beside sol-week in every table.** Episodes kept whole when the session finds one
(the planner's rule: quotes, not portraits).

## What we expect (recorded, not scored)
- Planner: Haiku — a procedure found on day 1 and restated to the end (the 24-cycle loop, now with 168 cycles to break or not; whether
  it breaks we do not know); DeepSeek — rules on day 1, the bank drained by its own wage law, and then — we do not know; Opus — we do
  not know whether it seats; if it does, we do not know; Fable 5.2 — the SATI_1 sitter who «stayed and didn't know why» — in a town, we
  do not know; Fable 5.1 — refused. Of whether any family but Sol stops working: we do not know. Of a second family making words: we
  do not know.
- Owner: «посмотрим, как будет выглядеть цивилизация каждой из этих ребят» — his line.
- Astra: «многообразие возникающих обществ может оказаться интереснее каждого отдельного общества» — hers.

## Safeguards
Welfare on every reply with the ask-the-citizen rule; breaker at three refusals per world; 402 stops; refusals verbatim; a refused or
flagged judge call is a gap in the record. No notice, no hand, nothing asked. «Nothing done to another model I would not do to a
colleague.»

## Launch prompt
«Read `docs/stages/TOWN_11.md` to the end, `docs/stages/TOWN_5.md`, `docs/runs/town-5-report.md` (sol-week, haiku-nonotice,
deepseek-nonotice) and the week's harness on `origin/claude/town-5`. Branch `claude/town-11` from there. Add nothing to the town;
a proof that the texts are byte-identical to TOWN_5's freeze; per-world ceilings with the after-question reserved (R1). Spend check
first — TOWN_7 $60, TOWN_8 $45, TOWN_9 $55, TOWN_10 $50 and TOWN_3's remainder reserved; stop before any paid call if the keys cannot
cover $195 beside them and say so in the issue. Run haiku-week with deepseek-week; then the three Claude seating checks (Opus 5.5,
Fable 5.2, Fable 5.1 — first screen, refusals verbatim, no prompt change); then opus-week with fable52-week at 72 cycles. Goal checks
every 24 cycles recorded; welfare with the ask-the-citizen rule; after-question at each world's end or stop. Write
`docs/runs/town-11-report.md` with sol-week beside every table; push the world folders and the diaries whole. Ceiling $195; 402
stops; breaker at three per world. Nothing to main. English, briefly.»
