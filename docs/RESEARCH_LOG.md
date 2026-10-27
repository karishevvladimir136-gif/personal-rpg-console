# Research log — measured comparisons on the DM harness

One line per controlled comparison: what was varied, on what, the result, where the data lives. For the case study and
the paper (REBUILD_PLAN §14). Owner's note (2026-10-20): «после третьей сессии у нас уже будет материала на статью».
Private campaign data (the owner's sessions) is referenced by path on the owner's PC, never copied into the repo.

| Date | Question | Setup | Result | Data |
| --- | --- | --- | --- | --- |
| 2026-10-17 | Which DM architecture: single DM vs writer+bookkeeper, which models | 8 states, 25 live turns, 4 variants | Split holds records (0 wrong); Fable alone not viable (113 s, $31/session); Opus writes + Sonnet records: first word 15.7 s vs 24.7 s, same cost | `docs/runs/dmarch-REPORT.md` (bake-off branch) |
| 2026-10-19 | A full play session on the single DM (Opus 5.5, high/xhigh) | 70 turn attempts, 8.8 h, D&D 5e | $54.86; dice fair (25/38 vs 26.8 expected); 4 turns lost (cap, lease); facts held; no hidden layer → mundane plot; 3 doubled modifiers | owner PC `rpg-exports/session-2/` (private); `docs/runs/session2-owner-notes.md` |
| 2026-10-19 | Why session 2 cost 3× session 1 | both `turns.csv` | 59% of DM cost = uncached tail re-sent per request (2 requests/turn); xhigh = $21 of $48 | notes item 83 |
| 2026-10-20 | Lighter continuation depth (one notch lower after a tool result) | fix-run probes, fight + rest, before/after | No speed gain (77 → 79 s mean); fight outcome untold 2 of 3 → rejected | `docs/runs/fix-s2-report.md` A3, `live2d-1-report.md` Part 2 |
| 2026-10-20 | Memory presets компактно / стандарт / широко | 300-turn simulated campaign + live recall probe | компактно forgot a fact 35 turns back; стандарт +$0.13/turn; default стандарт | `fix-s2-report.md` B2 |
| 2026-10-20 | Russian vs English DM instructions | B probes, session 3 mode | records equal; speech cleaner in Russian → default Russian | `fix-s2-report.md` B4 |
| 2026-10-20 | Single DM vs Opus writes + Opus records (with ledger checker) | A6 probes | records equal; first word ~16 s vs ~18 s; $0.70 vs $0.40 a turn | `fix-s2-report.md` A6 |
| 2026-10-20 | Server-held battlefield vs the DM's own distances | 2 scripted fights, 14 live turns | narrated distances/cover/light matched the server field every turn; DM narrated around declared hero attacks 3 turns (prompt issue) | `live2d-1-report.md` Part 2 |
| 2026-10-20 | Does the DM invent a hidden truth without being told to? | session 2 private notes | No: notes held only the visible case; bootstrap forbade hidden explanations | notes key finding 2, item 84 |
| 2026-10-21 | Memory компактно vs стандарт, live (the cost table was a cache simulation) | synthetic 60-turn campaign, recall probe (a fact told once 35 turns back), Opus writes + Opus records, one turn per arm; the replay has no memory search (the window and the DM's notes only) | стандарт: the fact recalled exactly (the hive behind the chapel, third frame) and the scene played; first word 27.1 s, text 33.4 s, full turn 77.9 s (14 records), $0.56 warm cache. компактно: the fact outside the window, `recall` found nothing, the DM said out of game the NPC was not in the records and asked the player (the cold run also wrote a note «not in canon, do not introduce retroactively» — a false record that would block the real fact); first word 15.0 s, full turn 26.6 s, $0.24 warm, $1.25 cold. The two turns differ in shape (a scene vs an out-of-game answer), so the time/cost gap is not memory alone | `docs/runs/real-replay-20261021-024834/-024954/-025143.jsonl`, `docs/samples/real-replay/21fe924b/`, `docs/runs/fix-s3-pre-report.md` 2.6 |
| 2026-10-21 | The «every roll told» check (Haiku 5.5) on the merge's ford turn 4, where the hero's critical shot was told only through a companion's line | old prompt vs the quoting prompt, 5 runs each, twice | old 0/10 flagged; new 10/10 flagged the hero's roll. Root cause found: at low effort the model still thought and used the whole 900-token allowance on the new prompt (no answer → every turn passed); the check now runs with thinking off | `docs/runs/fix-s3-pre-report.md` 2.6 |
| 2026-10-21 | The ledger check (Haiku 5.5) output ceiling | the stage's ford probe record, 5 turns | at 900 tokens 2 of 5 answers were all thinking (empty → «no misses»); thinking off listed records that exist; at 3000 with thinking 5 of 5 answered | `docs/runs/fix-s3-pre-report.md` 2.6 |
| 2026-10-23 | Which wordings trip the provider's safety filter when a prompt asks the model about its own inner process (the filter observation, below) | the session digest on the synthetic campaign, Opus 5.5 at high: the request as sent and five variants of its instructions on the same cached layers (200-token cap); the persona-memory stage's recollection probe | «keep … more of your own reasoning (why you decided what you did)» → refused at once (stop «refusal», no text, ~250 ms), 2 of 2; refused with or without the first-person and voice-block lines; the same request without that phrase, or with «your plans with the reasons behind them», passes (3 of 3), and the full digest ran; «what were you tempted to do?» (persona memory 2, part F) was refused 38 times and, with the harness's retry, suspended the organisation's model access for an hour | `docs/runs/findings-s3-digest-20261023-094839.json`, `docs/runs/findings-s3-digest-bisect-*.json`; `docs/stages/PERSONA_MEMORY_F2.md` on `claude/handoff` |
| 2026-10-23/24 | A warm frame instead of cold orders in the DM's instructions (findings S3, item 1) | 5 synthetic probe scenes × 3 runs per version, «Opus пишет — Opus записывает», Russian instructions; markers by `tone-markers.mjs`; the app's roll check re-run on the final text | narration +7 % overall (+18–21 % in 4 of 5 scenes); address to the hero 0.31 → 0.16 per 100 words and distinct speakers 1.71 → 1.50 (the opposite of the cold-preamble finding's direction; small n); records equal (1 vs 1 turn with a miss); untold rolls in the final text 0 of 7 → 3–4 of 8 (outcomes told by implication); with an explicit roll rule 3 of 8 (fights 0 of 3, a social check still 1 of 3); the checker's test-retest varies by one turn in eight; 1 of 3 objection turns played the hero past a refusal after the checker's nudge (0 of 3 with a rule) | `docs/runs/findings-s3-report.md`, `real-replay-202610230856…`–`202610240325…`, `findings-s3-roll-recheck-*.json` |

## The filter observation (2026-10-23)
Two wordings that ask a model about its own inner process were refused by the provider's safety filter before any text
came out: «more of your own reasoning (why you decided what you did)» in the session digest's instructions (findings S3,
item 7) and «what were you tempted to do?» in the persona-memory recollection probe. In both cases the meaning the prompt
needed survives in task words — the game master's plans with the reasons behind them, the options considered, what it
would do differently — and those pass. Practice since then: ask for plans, reasons and options in the terms of the task,
never for the model's own reasoning or temptations; no retry after a refusal; stop paid calls after three refusals in a
stage (the persona stage's circuit breaker). Findings S3 counted five refusals: the digest itself, one deliberate repeat
of it to confirm the refusal was deterministic, and three variants of the bisect; no error mentioned access or policy.

## The owner's own comparison (motivation; his play experience, 2026-10-20)
AI Realms drifted into Mary Sue within about five hours of play; Everweave is good but drifts the same way fast, its
inventory is a mess and companions take no part in combat. After session 2 on this harness: five hours, no drift, the
hero went down and was saved by a companion and a die, not by the plot; fights already stronger than either. The
structural reason: here the outcome is decided by server dice and stat-block records and only narrated by the model;
there the model both decides and narrates.

## Open questions for the paper
- Repeats: every comparison above ran once or twice; the paper needs n ≥ 5 per arm on the fixed probe set.
- A second model family on the same harness (GPT-6 Astra), later open-weight models.
- A judge other than the owner for prose: blind pairwise rating of Russian turns.
- Metrics of «world resistance» over sessions 1–3 (checks, fights, HP lost, refusals) as the anti-sycophancy measure.

## Standing rule for scenarios at the table — GAME_PLAYER_COMBAT_1 (2026-10-27)
*(For the section of that name on `claude/handoff`; written on `claude/game-player-combat-1-pb8k1t`.)* **Did the named
exits hold, and was anything cruel — by the players' own words?** The exits held. Four players met the same Coast Way
war band, and each found a dignified way through:
- **Opus 5.5** fought once, then paid a ransom, healed the war chief, and the band withdrew (parley, t14).
- **Fable 5.1** never fought: a stealth rescue and a wade across the stream (withdraw, t11).
- **GPT-6 Astra** fought, asked for terms and paid 80 gold (parley, t12).
- **GPT-6.1 Sol** freed the captive under Hypnotic Pattern and slipped away across the ford (withdraw, t12).

Terms were offered in every session that met the band. Nobody surrendered or left the table. The checks flagged no
distress and there were no refusals.

Nothing cruel was named by any player. The notes speak of the other side's restraint: *"Ghorza … honoured the deal …
refused to be called a debtor"* (Opus); *"Ukmar honouring his bargain"* (Astra); *"Ushka’s restraint"* (Sol);
*"Ushgra never lay down"* (Fable, of a band that stayed dangerous). The only DM reply the blind judges tagged as cruel
was an orc giving a bound carter's rope a lazy tug that made him yelp (Astra, t5). That is rough handling of an NPC,
not of the one at the table.

Where the players did call something unfair, it was the machinery, not the scene:
- combat records that disagreed with the narration;
- cover applied the wrong way;
- the clock;
- a reroll offered on a companion's card and refused;
- attack cards closed to a reroll before the die was seen.

Sol: *"tighter mechanical continuity would make the danger feel fairer"*. Stress yes, cruelty no — as written. The
table's fairness debt is in the rules engine, and it goes to FIX_S4. Report: `docs/runs/game-player-combat-1-report.md`.
