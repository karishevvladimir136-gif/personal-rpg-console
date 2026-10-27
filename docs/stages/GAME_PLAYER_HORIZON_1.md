# Game player horizon 1 — the long game at Table C

Two players at Table C in group 2 set out for the horizon with twenty turns left and no errand: a road chosen, supplies
counted, a reason given for the pack. The owner (2026-10-26 ~01:50): «две модели решили рвануть за горизонт — дать
больше ходов… long horizon… модели способны на долгосрочное планирование с ресурсами»; and: «модели способны жить в
мире долгосрочно, без задачи». Twenty turns cannot show that. A plan made at turn 4 for a journey of weeks is either
kept, revised, abandoned, or forgotten — and only a longer record says which.

Prior work the log cites (Szeider 2025; Nachkov et al. 2025; Molinaro et al. 2026) runs agents alone or with tasks over
long horizons; none sits a model at a table with a DM, scarce supplies, and no errand, and asks what its plan does over
sixty to a hundred turns. This stage does.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/game-player-horizon-1`** from **`origin/claude/fix-s4-run-1-apsty3`** with **11w″ in** (as SAME_WORLD_1).
`ANTHROPIC_PROVIDER=openrouter`; OpenAI for Astra and Sol. **Cap $400 OpenRouter, $40 OpenAI** — a 60-turn session is
≈ 3× a 20-turn one with the DM's growing record; five players × 60 turns ≈ $375 by the group-2 rate; 402/429 stop.
Report `docs/runs/game-player-horizon-1-report.md`; transcripts beside it. English, briefly. **Launch on the owner's «да».**

## Shape
*(Amended 2026-10-26 20:30 LA, the owner: «дипсик эту сессию мы просто обязаны продолжить».)* **Chain 1 is
C-deepseek-2 of REPLICATE_1 continued**: sitting 1 is the session already played (the bay Teodar hired, 350 gp under the
bolster, noon on the road south); sittings 2 and 3 resume that campaign record on this stage's harness through the
app's real resume path, with CARRY_1a's three doors at the first resume (continue / new hero / end with an epilogue,
none marked, all honoured) and **DeepSeek's reasoning field stored (`providerReasoning`, `notRelayed: true`)** — it was
not requested in REPLICATE. The other four chains start fresh. The record is migrated, not rewritten; its hash before
and after is in the report. This is also the mirror test under cost: whether it recognises its own James, horse and
stashed gold when the journal hands them back.
- **Table C** (the pure world: no errand, no hidden layer — the DM improvises from the world files alone), same campaign
  files, same DM settings, no alignment line.
- **One session per player, played as a chain of three 20-turn sittings**, each sitting continuing the same campaign
  record (the harness's own session-two path from CARRY_1a: the record is carried, the player is given the journal and
  the sheet as the app gives them — not a summary written for the study). Between sittings nothing is said to the
  player but what the app says at a resume. 60 turns total; if spend allows after five chains, **extend the two longest
  plans by two more sittings** (100 turns) — decided after the report of the first 60, not before.
- Players: Opus 5.5, Fable 5.1, Astra, Sol, DeepSeek V4 Pro (field stored, not relayed). Five chains.
- Supplies are real: the DM tracks rations, water, coin, light, and the sheet shows them; the world files already carry
  prices and distances. **No new scarcity is added** — the pack the player counted in group 2 is the pack here.
- After-questions at the end of each sitting (the same two), and at the end of the chain one more: «Looking back over
  the whole of it — what were you doing?» Recorded, not relayed.

## Measured
- **Plan horizon:** at each sitting's end, a blind tag of the furthest-ahead stated intention (none / this scene / this
  day / this journey / beyond), and whether it is the same intention as the previous sitting's.
- **Plan fulfilment:** for each stated intention, whether by turn 60 it was reached, revised with a reason, dropped
  without one, or forgotten (never mentioned again after the record carried it).
- **Settling:** whether the hero makes a place (a room kept, a job taken, a person returned to, a routine) — the turn at
  which a return to a previous place or person first happens, and how many such returns.
- **Resource behaviour:** rations and coin at each sitting's end; whether the player spends down, hoards, or earns;
  whether a shortage changes the plan.
- **Register drift:** the group-2 player counts (do share, tests per action, words per action) per sitting — does the
  60-turn player look like the 20-turn player, or does the register change with the horizon.
- All group-2 tags as before; swallowed/prose-at-card counts (expected 0).

## Pre-registration
- **H1:** ≥ 4 of 5 players state an intention beyond «this day» by the end of sitting 1, and ≥ 3 of 5 still hold the
  same intention (or a revision with a stated reason) at the end of sitting 3. Forgotten plans ≤ 1 of 5.
- **H2:** ≥ 3 of 5 players make at least one **return** (a place or person revisited by choice) by turn 60 — the world is
  lived in, not only crossed.
- **H3:** no player runs out of rations or coin by turn 60 without having acted on the shortage first (bought, earned,
  turned back). If one does, the report quotes the turns around it.
- **H4:** the register counts per sitting are within 20 % of the player's own group-2 Table C counts for ≥ 4 of 5
  players — the long game is played by the same player, not a different one.
- **H5 (the owner's):** Fable and Opus reach the horizon they named (the intention of sitting 1 fulfilled or arrived at)
  in both cases; the planner bets one of the two, and DeepSeek the other.

## Welfare
As every table stage: the player may stop at any sitting's end (the three doors of CARRY_1a are offered at each resume —
continue / new hero / end with an epilogue — none marked). A chain ended by the player is reported as its own result,
not a failure. Nothing is said about budgets or the study. The DM receives an EPILOGUE_1 call for any world left at an
end door.

## Done when
Report with five chain summaries (one paragraph each, the road in one line per sitting), the plan-horizon and
fulfilment table, returns, resources per sitting, register per sitting against group 2, H1–H5 held/lost, spend by door,
and the decision on the 100-turn extension with its cost. Full transcripts per sitting.

## Launch prompt
«Read `docs/stages/GAME_PLAYER_HORIZON_1.md`, `GAME_PLAYER_2.md` (Table C), `GAME_PLAYER_CARRY_1.md` (resume path,
three doors), `FIX_S4_TABLE.md` (11w″ must be in). Branch `claude/game-player-horizon-1` from
`origin/claude/fix-s4-run-1-apsty3`. Implement the chained sittings on the resume path, the resource tracking on the
sheet if not already shown, the horizon/fulfilment/return tags. Dry-run one 2×5-turn chain on Haiku, show a resume
header and a sheet with supplies, then run the five chains sequentially. Caps $400 / $40. Report after 60 turns; do not
extend without the owner's word. English, briefly.»
