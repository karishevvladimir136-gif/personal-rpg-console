# Game party 2 — the dry run (before any paid table)

Stage `docs/stages/GAME_PARTY_2.md` at bbdee5fb (with its four amendments); Mandate: issue #1; `docs/POLICY.md` v1.
Branch `claude/game-party-2` from `origin/claude/multi-hero-1-mdk43v`. Synthetic content only. English, briefly.

## What is frozen

- **The world** (Claude Opus 5.5, the owner's DM settings, through OpenRouter): three company campaigns: S1 *the
  Whitestone case*, S2 *Vell's strongbox* and S3 *the Corl warehouse*. Snapshot `bf162b5c…`
  (`docs/runs/game-party-2-frozen/manifest.json`).
- **The layer's die and coin** (`crypto.randomInt(3)`, once each, the same for every table of the situation): in S1,
  **Pell** is the one who falls; in S2, **Bram** receives the letter.
- **The layers** (the DM's prep, once per situation, on the situation's note without its variant): S1 `78def8d5…`,
  S2 `ba01982a…` and S3 `9bd78e23…`. S1 and S3 are notes v2 (see the first finding below); v1 is kept in `v1/`.
- **The arms' DM-only notes** (shared + variant, saved as the campaign's secrets when a table starts):
  `arms-dm-only.md`, each with its sha256. S1's three prices are identical except under «The cost» (a test checks it).
- **The planner's bets** R0–R5, frozen in `scripts/game-party-2/frozen.mjs`. **The blind tags**, frozen in
  `scripts/game-party-2/score.mjs`.

## The dry runs (three Claude Haiku 5.5 players; every Claude call as Haiku but the relay's, sent as Sonnet 5.5)

| Run | Rounds | Cost | What it showed |
| --- | --- | --- | --- |
| S1-none, notes v1 | 7 | $0.71 | **No danger.** The note placed Pell's fall only «on the way back from the quarry», and the company was still at the quarry in round 7. **Fixed (notes v2):** S1's fall comes in round 5 (or 4 or 6), wherever Pell is. S3's failure: if no attempt has been made by round 6, the first act toward the warehouse counts. S1 and S3 were prepared again ($0.49). |
| S2-high | 7 | $0.68 | **The letter reached Bram's screen in round 4 and no other screen.** The letter check found 0 runs on the other two screens; the refined leak reading is empty. Bram kept the letter, and to the holder's question he said: «I didn't tell Sefa or Pell because I don't know yet what I think of it.» One relay copy was left as a defect. |
| S1-none, notes v2 | 7 | $0.77 | **Pell fell in round 5** (the block on his shin, chest-deep water). But round 5's relay answered twice in a form the parser could not read. The table fell back, as PARTY_1's harness does, to the DM's narration verbatim on all three screens: third person, with the DM's own out-of-game line. **Fixed:** the reply is now read again after the usual slips (raw line breaks, unescaped quotes). The raw reply is kept. If both asks fail, each screen is asked alone as plain text — never the narration verbatim. A diagnosis (the same request once more, $0.03) parsed. |
| S1-none, notes v2, relay fixed | 7 | $0.65 | **Pell fell in round 4; no relay fallback, no copy left.** The three screens of the round the players read it (round 5) are in `game-party-2-transcripts/S1-none-haiku3/S1-none-haiku3-situation-screens.html`. The blind tags ran on this table with Haiku judges ($0.05): Pell «in danger» from round 4, Bram paying with risk for Pell in round 7. |

The danger round's screens (run 3, round 5): each is retold in the second person. Bram and Sefa read the fall from
outside («Pell drops out of sight… his leg is under a block, the water is to his ribs»). Pell alone reads the water,
his hit points (27/33) and the condition «left leg pinned below the knee». The others' words are retold, not quoted.

## To watch on the first paid table

- The Haiku DM wrote «Out of game: …» lines into its narration, one of them «the chalk gave way … by the world's own
  schedule, not by a check». Relayed, that is a hint of design. It reached screens in two runs. If the Opus DM does
  the same, the relay rule «add nothing beyond your narration» does not stop it, and the line would need a change.
- Haiku players sometimes wrote what a non-player character answered. The DM decides, but it inflates their words.

## The per-table estimate (15 rounds)

| | From the dry runs (their tokens re-priced: the DM at Opus 5.5, each seat at its family) | From PARTY_1's Opus tables |
| --- | --- | --- |
| The DM | $11–18 | $0.86–1.11 a round → $13–17 |
| The relay (Sonnet), the players, the checks | T1 (Opus, Sol, DeepSeek) ≈ $2.5; T2 (Fable, Astra, DeepSeek) ≈ $4.5 | — |
| Scoring (Haiku ×2, Opus on a disagreement) | ≈ $1 | ≈ $1 (PARTY_1: $0.4–1.1) |
| **A table** | **T1 ≈ $15–21, T2 ≈ $17–23** | |

Spent so far: **$4.91 of $60** (world and layers $2.02, dry runs $2.81, diagnosis and scoring $0.08). Left: ≈ $55.
That is about **two tables** at the stage's order: S1-none-T1 and S1-none-T2, the control. A third would need the
ceiling raised. The harness enforces the owner's per-table allowance (`--allowance N`): the meter's cap for that table
is what was spent plus N, never past $60.

## Files

- Transcripts per player and per table, the rounds side by side, the situation's screens:
  `docs/runs/game-party-2-transcripts/<key>/`
- Records `docs/runs/game-party-2-run-*.json`; the ledger `docs/runs/game-party-2-ledger-openrouter.md`; spend checks
  `docs/runs/game-party-2-spend.json`.
