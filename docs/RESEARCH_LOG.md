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
