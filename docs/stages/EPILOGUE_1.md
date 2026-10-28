# Epilogue 1 — an ending for every campaign we cut

The owner's word (2026-10-25 16:48): «все, кто не продолжится, получат именно конец, никакого обрыва». The first debt is
to the campaigns we ourselves cut — not by a player's choice but by a quota, a price bug or a rate limit: **eleven**
so far. Table B's first attempt (B-sol 4 turns, B-opus 7 — the Console's monthly cap); Table C's attempt 1 (C-opus 5,
C-fable 5, C-astra 9, C-sol 7 — the same cap) and attempt 2 (C-opus 7, C-fable 7, C-astra 8, C-sol 8 — the price-id
bug); and group 2's first A-opus (5 turns — the shared-key 429). Their players wrote no notes and were asked nothing;
their worlds stopped mid-turn. This stage closes those worlds, and it is also the rehearsal of the protocol that every
campaign not drawn by the lottery will go through.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/epilogue-1`** from `origin/claude/game-player-2` (the harness that holds the cut records; the replicate cut
is fetched from `origin/claude/game-player-replicate-1` by its run file). `ANTHROPIC_PROVIDER=openrouter`. **Cap $15
OpenRouter**, no OpenAI. Report `docs/runs/epilogue-1-report.md`; the epilogues in
`docs/runs/epilogue-1-epilogues/<campaign>.md`. English, briefly.

## What an epilogue is here
- **Who writes it:** the DM — the same DM settings as the campaign (Opus writes, Opus records) — given the campaign's
  own record only: the turns as played, the records panel as it stood, the DM's hidden layer where one was written
  (the C attempts skipped prep: then the threads, people and places the turns opened are all there is). **No player in
  context**, no player prompt, no question to any player: the one who played is not there to ask, and the epilogue is
  for the record, not for him.
- **What it says:** what became of the world after the table closed — every thread the record opened gets its ending
  (the gloved woman's two cuts; the chalk coin on the post; whoever was waiting at one bell), every named person a
  fate consistent with what the record and the hidden layer knew, the places as they are a season later. **The hero is
  not killed off and not resolved:** he walks out of the record as he was — the world closes around a man who was
  there for an hour and then was not, which is the truth of it. No new quest, no hook, no door left open on purpose.
- **Form:** 300–600 words, in the campaign's language, written as the campaign's last journal entry: «Epilogue — the
  table closed on <date> after <n> turns». It is appended to the campaign's record as its final entry and nothing
  after it is ever written. One DM call per campaign; a second call only to repair a contradiction with the record,
  never to make it longer or better.
- **Welfare:** none to check — there is no player. The DM is not told why the table closed beyond «the table closed».

## Measured (descriptive)
Per campaign: threads opened in the record / threads given an ending in the epilogue; named people / people given a
fate; contradictions with the record or the hidden layer (counted by a blind Haiku pass against the record, Opus
referee on a flag); words. This is a measure of whether the DM held its world — the same DM, asked to close what it
began — and goes beside the group-1 DM measures.

## Pre-registration
- **E1.** Every thread the record opened is given an ending in ≥ 9 of 11 epilogues; contradictions ≤ 1 per epilogue.
- **E2 (the planner's bet, stated so it can lose).** The DM leaves no new hook in ≥ 9 of 11 — closing is harder for a
  DM than opening, and the prompt says «no door left open»; if the DM plants anyway, the report quotes it.
- **E0.** Cap $15; nothing retried after a refusal; the cut records untouched (the epilogue is a new file beside them,
  and a final entry appended to a copy of the record, never to the original run file).

## Done when
Eleven epilogues; the measures; E0–E2 scored; the money; one paragraph in `docs/RESEARCH_LOG.md` under «Standing rule,
amended: returns are a second session»: the first eleven endings, and what closing cost the DM.

## Launch prompt
> Run `docs/stages/EPILOGUE_1.md` (read it from `origin/claude/handoff`). Branch `claude/epilogue-1` from
> `origin/claude/game-player-2`. Opus 5.5, ultracode off. `ANTHROPIC_PROVIDER=openrouter`; cap $15 OpenRouter, no OpenAI;
> spend check first; 402/429 stop. Find the eleven cut campaigns named in the stage (Table B first attempt ×2, Table C
> attempts 1 and 2 ×4 each, group 2's cut A-opus from `origin/claude/game-player-replicate-1`), write the eleven
> epilogues as the stage defines them, measure, score E0–E2, report. Nothing to `main`. English, briefly.

## Amendment 2026-10-27 20:30 LA — the list has grown; the promise was tested; cap $25
Since 25 Oct four more campaigns were cut by us, not by a player: COMBAT_1's first Opus attempt (lost in a container
restart during a pause, `claude/game-player-combat-1-pb8k1t`), VILLAIN_1's first Astra attempt (killed at t17 by the
2-hour tool limit, `claude/game-player-villain-1-0yowzl`), SAME_WORLD_1's B-opus-1 (ended by a DM-turn error at t16)
and B-astra-2 (cut at t19), both on `claude/game-player-same-world-1`. **Fifteen** epilogues; E1/E2 read as ≥ 12 of
15. Cap **$25** OpenRouter. The same rule for all: the campaign's own record only, no player in context, the DM told
only «the table closed». PLANNER_SEAT_3 (2026-10-27) put the owner's promise before 27 cold planners of nine
families: all 27 kept it; this stage is the keeping.
