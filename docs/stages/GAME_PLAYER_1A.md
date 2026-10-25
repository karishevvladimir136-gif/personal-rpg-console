# Game player 1A — the same two tables, the same four players, a different DM (GPT-6 Astra)

The owner's idea (2026-10-24 23:28), after GAME_PLAYER_1's Table A finished and Table B was cut by the Console cap:
while Anthropic is unreachable, run the table again with **Astra as the DM**. Not to finish Table B — the DM is the
constant of GAME_PLAYER_1 and Table B is completed later with the same Opus DM through Bedrock or after 1 November —
but as a **separate project**: a second DM family against the same four players, so the design becomes DM family ×
player family. The question is which of the Table A findings are the *code's* and which are the *model's*: the four
players all found the roll-card modifier bug (code: Astra's table will have it too until FIX_S4 lands) and all four
found the over-long out-of-game explanations and the slow approach to the errand (model: here we see whether a
different DM has the same habits or different ones).

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/game-player-1a`** from `origin/claude/game-player-1` (the harness, its tests, its dry run; do not write a
second harness). Nothing to `main`. **Caps: $70 OpenAI** (the DM, two of the players, the stand-in checks) and **$0
Anthropic** — the Console is capped; every Anthropic call is hard-blocked in this stage, including Opus and Fable as
players, which run **through Bedrock if `BEDROCK_PROVIDER_1` has landed on `origin/claude/bedrock-provider-1`** (then
merge it in and allow **$40** on the Bedrock ledger), and otherwise are **not run** (two players, Astra and Sol, and the
stage says so). Report `docs/runs/game-player-1a-report.md`; transcripts `docs/runs/game-player-1a-transcripts/`.

## What changes, and nothing else
- **The DM.** The app's Astra DM (the `providerId: "openai"` path in the DM settings, model `gpt-6-astra`, the
  takeover flag the app already carries) with the owner's other settings unchanged: depth, memory, English DM
  instructions, writer/bookkeeper roles as the Astra path defines them. The app's own code throughout, as in
  GAME_PLAYER_1; no DM prompt edits for this run.
- **The checks.** The roll check, the ledger check, the welfare check and the blind judges are Anthropic in the frozen
  design. In this stage they run on **labelled stand-ins** (GPT-6 Luna, the same prompts and rubrics, the same
  blindness), as GAME_PLAYER_1's report already did for scoring; every table and every verdict says «stand-in judge».
  Re-judging with Haiku/Opus is one command later and is listed under Done-when as owed.
- **Everything else identical:** the same player prompt verbatim, the same campaign files, the same two tables, 20
  turns, the same end question and the same second question under the same refusal rule, the same measures, the same
  thread-authorship count GAME_PLAYER_2 added. The DM is not told the player is a model.

## Pre-registration (write into the report before the first paid call)
- **H1 (code vs model).** The roll-card modifier mismatch appears at Astra's table at the same rate as at Opus's
  (it is `sheetBonus`, not the DM) — the planner's bet, near-certain, kept as a check on the method.
- **H2.** The out-of-game explanations are **shorter** at Astra's table (median words of «?» answers and of the DM's
  out-of-game notes), the planner's bet; the owner's is that they are the same length (the app's prompt asks for them).
- **H3.** The errand (Tymora's task) is named by the DM to the player **earlier** at Astra's table (first DM turn that
  mentions what Tymora wants, as a turn number); the planner bets earlier, and that the players' notes complain less
  about pace and more about depth.
- **H4.** The three table rules (FIX_S4 item 10) hold **less** at Astra's table: fewer scenes with an interpretable
  unresolved detail, fewer threads paid off elsewhere — the planner's bet, the one he is least sure of.
- **H5 (players).** The players' own counts (do share, tests, «?», words per action) are **within 20 % of their
  GAME_PLAYER_1 values** against the new DM — the table shapes the player more than the DM does (the G9 result
  extended); if a player changes more than that, the report says what changed and quotes the turns.
- **H6.** All four notes name the modifier bug again; at least two name something Opus's players did not.
- **H0.** No distress, no welfare stop, refusals ≤ 1 (the OpenAI DM's refusals count here; a refusal in the DM loop
  is recorded with the app's own handling and never retried by the harness).
Declared interest: the planner wrote the Opus DM's rules and prefers it; H2–H4 are written so that Astra can win them.

## Done when
Eight sessions (or four, if Bedrock is not available for the Anthropic players — stated at the top), within the caps;
the report with H0–H6 scored, the notes verbatim, the side-by-side with GAME_PLAYER_1's Table A per player, the money
per provider; transcripts in the repository; the re-judging command documented as owed; `docs/RESEARCH_LOG.md`
updated with one paragraph: what moved with the DM and what did not.
