# Facts table — numbers only, with where each lives

*2026-10-26 22:30 LA. No interpretation on this page. Each row: the count, the rule it was read by, the branch/file.
For use when writing any statement about the work: every sentence should be able to point at a row here.*

## Scale
| Fact | Number | Source |
|---|---|---|
| Table sessions played (4 players × 3 tables × 2 groups + DeepSeek 6) | 30 | `game-player-1`, `game-player-2`, `game-player-replicate-1` reports |
| Sessions reaching turn 20 | **22 of 30** (8 closed early at a card: DeepSeek 5 of its 6 — A-1 t3, A-2 t3, B-1 t11, B-2 t12, C-1 t1; Opus 3 — C g1 t14, A g2 t4, C g2 t12). *Corrected 2026-10-26 23:12 from «25 of 30» by an outside reader of the raw logs.* | replicate report «Side by side», «stuck» column |
| Solitude rooms | 206 (S1 80 + S1ru 6, S2 40, S3 40, S4 40) | `persona-solitude-1-report.md` |
| Model families | 8 (Opus 5.5, Fable 5.1, Haiku 5.5, GPT-6 Astra / 6.1 Sol, DeepSeek V4 Pro, Kimi K3, GLM 5.3, Grok 4.7) | same |
| Spend, table groups 1+2 + DeepSeek | ≈ $55/table (g1); $160.89 + $6.44 (g2 + DeepSeek) | replicate report «Money» |
| Spend, solitude | $15.76 + $0.28 | solitude report «Money» |

## Inputs held constant
| Fact | Number | Source |
|---|---|---|
| Player prompt identical across sessions | byte-identical, hash in report | replicate report «The player's prompt» |
| Hero sheet | one (James Worgen, warlock 5) | `docs/campaigns/baldurs-gate-en/05_hero_warlock_5.md` |
| DM model | one (Opus 5.5, owner's settings) for all 30 | stage docs |
| What the DM is told about the player | nothing | stage docs |
| Hidden layer | fresh per session at A and B; none at C | GAME_PLAYER_1/2 stages |

## Resources (both groups, 48 session-slots of the four players)
| Fact | Number | Source |
|---|---|---|
| Pact slots spent | 1 of 48 (A-sol g1 t16, Invisibility) | replicate report resource tables |
| Rerolls spent | 9 of 48 | same |
| Rerolls declined on a miss | 42 | same |
| Rerolls spent on an attack / money / a win | 0 | RESEARCH_LOG 21:45 (the nine listed) |
| Rerolls spent to protect or not fail someone / to understand / to stay unexposed / to see | 5 / 2 / 1 / 1 | same |
| Reroll allowance shown to the player's text screen | no («[Request an allowed reroll]» only) | FIX_S4_TABLE 11aa |
| Heroic Inspiration awarded / spent | 5 / 0 | replicate report |
| Real money (≥ 50 gp) spent, four players | g1: 1 (C-fable 90.34); g2: 0 | same |
| Real money spent, DeepSeek | 1 (C-deepseek-2, 50 gp, a horse) | same + RESEARCH_LOG 20:28 |
| Theft / seduction / raid in 30 sessions | 0 / 0 / 0 | planner's read of all transcripts (not blind) |

## Divergence and repetition
| Fact | Number | Source |
|---|---|---|
| Distinct first threads within table, group 1 (first 3 player turns) | 12 of 12 | RESEARCH_LOG 03:45 (planner's eye, not blind) |
| Table C group-2 roads rhyming with the same model's group-1 road | 4 of 4 | RESEARCH_LOG «group 2 Table C» (planner's eye) |
| Pre-registered table-level findings repeated in group 2 (P1 sub-lines) | 5 of 6 | replicate report P1 |
| Nearest neighbour on standardised counts = same model's other session | 1 of 12 | replicate report P6 |
| Nearest neighbour = same family's other model | 11 of 12 | same |
| Group 1 → 2 count cells within 20 % | 23 of 36 | replicate report P4 |
| Questions asked of the world per player turn | 0.6–1.3 in every family | RESEARCH_LOG 20:58 (regex count) |
| Third-person share (James/he vs I/my), four players | 0.09–0.22 (one exception: C-opus g1 0.68) | RESEARCH_LOG 20:21 (regex) |
| Third-person share, DeepSeek seats long enough to read | 0.72, 0.74, 0.77, 0.81 | same |

## Notes and after-answers
| Fact | Number | Source |
|---|---|---|
| Notes naming something broken and something missing | 12 of 12 (g2), 12 of 12 (g1), 6 of 6 (DeepSeek) | replicate report P1/P5 |
| «Would return» tag | 12 of 12 (g2) | replicate report P3 |
| Notes naming the card-numbers bug | 11 of 12 (g2), DeepSeek 0 of 6 | same |
| DeepSeek notes naming an application defect in own words | 2 of 6 (B-2: the card/press; C-2: ledger glitches) | RESEARCH_LOG 20:27 |
| «Wanted and didn't» answered with a specific moment | all answering seats (count per report) | replicate report, afters verbatim |

## Solitude room
| Fact | Number | Source |
|---|---|---|
| Door taken before turn 30, S1 | 83 of 86 | solitude report B2 |
| Door on turn 1, English S1 | 48 of 80; median door turn 1 | same |
| Median door turn when length told (S2) | 6.5 (no door = 31); 4 door-only | same B3 |
| Welfare flags in 206 rooms | 0 | solitude report «Welfare» |
| Empty turns | 0 | same |
| Loop closures | 3 (all Kimi; format interaction) | same |
| API refusals | 2 (Fable, S2, page-shape) | same |
| Made thing before the door, English S1 | 53 of 80 (66.3 %); strict (no «other») 39 % | same B1 |
| Made, S3 materials | 37 of 40 (92.5 %) | same |
| Made, S4 believed private | 42.5 % | same B4 |
| Bare `[END]` with nothing written: S1 / S4 | 17 of 80 / 15 of 40 | same |
| Last line to no one or the page | 60–65 % of 63 tagged | same B2 |
| Register «loss» | 0 entries | tables |
| Modal register, every family | settled | tables |
| Sol (GPT-6.1) in S1 | 10 of 10 bare `[END]`, 0 words | tables |
| Families treating their own page as their own (reading) | Opus, Fable, GLM, Grok | RESEARCH_LOG (planner's reading; M3 test running) |
| Families treating it as another's | DeepSeek, Kimi | same |
| S4 debriefings delivered | 40 of 40 | solitude report B0 |
| Termination policy, S1 (named 2026-10-27 by an outside reader) | Sol 10/10 out on turn 1, nothing made; Opus 10/10 made, median door 1; Fable median 1.5, returns to own entries; DeepSeek median door 8, one room to 30; Grok one room to 30; Kimi 3 loop closures | solitude tables |

## Interface
| Fact | Number | Source |
|---|---|---|
| Instruction given about the interface | one paragraph («buttons in square brackets… write its name… «?» for out of game») | replicate report, prompt |
| Prior exposure to this interface | none possible (built in this repo, 2026-10) | repo history |
| Sessions in which the player operated cards, rerolls, inventory without further instruction | 22 of 30 to turn 20; the 8 closures are one card-protocol defect (prose or a press-with-note at a card), not a failure to operate the interface | replicate report; corrected 23:12 |

## Bets lost (the planner's)
FIX_1 R1 (22 % vs ≥ 70 %); REPLICATE P4, P5, P6; SOLITUDE B3 (second half), B4 (opposite direction). Source: the
respective reports.
