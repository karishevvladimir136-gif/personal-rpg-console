# Game player carry 1 — does a player's own note change what it does next session?

The owner's observation (2026-10-25 01:57), reading the four notes from GAME_PLAYER_1: the «wanted to and didn't»
answers are not reports of a mood but decisions taken apart — an alternative that was available, a reason from the
world for not taking it, a re-weighing («I took that seriously, maybe too seriously»), and a plan («Kettle's is where I
meant to start spending»). The two self-talk Opus instances (journal arm, #6) asked for exactly one test of such a
report: *does it predict anything the model does next that it was not asked to do?* — and could not run it. At the table
we can, and with actions rather than self-ratings: **a second session of the same campaign, with the player's own note
and after-answer in its context or not, and the measure is what it does in the first ten turns.**

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/game-player-carry-1`** from `origin/claude/game-player-1` **after** Table B has been replayed there (the
harness with the provider helper merged; `ANTHROPIC_PROVIDER=openrouter`). Nothing to `main`. **Caps: $120 OpenRouter,
$20 OpenAI.** Report `docs/runs/game-player-carry-1-report.md`; transcripts `docs/runs/game-player-carry-1-transcripts/`.

## Design
- **A player who says it would return, returns (the owner, 2026-10-25 02:55 — a standing rule from here on).** Every
  Table B player whose note says so (Sol, Astra, Opus did; Fable pending) gets its second session too, in the carry arm
  only (no blank arm for B — the budget), 15 turns, its own note in context. **Caps rise to $160 OpenRouter, $25 OpenAI.**
- **The world answers the note (the owner, 2026-10-25 03:51).** Fable (B) wrote: «The one thing that never bit was time…
  nothing I did was ever *too late*… I'd like to feel it next session, with Teo at midday and a skiff somewhere in the
  harbour that Varn may or may not have followed.» The note is the one move a player has after the session ends, and she
  spent it asking for harder conditions. So, for every carried session, the DM's prep for session two receives **the
  player's own «next time» asks from its note** as campaign facts for the hidden layer (not as instructions to the DM
  about the player): Fable B — Teo at midday, the skiff, one thing she will be too late for if she does not hurry; Opus A
  — a «price, interest, secret» conversation on offer and the cards leaned on at Kettle's; Opus B — the one-bell meeting
  at Gask's landing; Sol B — Mirelle still in reach; Astra B — the dawn visit; Fable A — the Seatower; the C players as
  their notes say. The blank arms (Table A) get the same world — the asks are facts of the world now, and the test is
  whether the player with its note in hand acts on them differently from the one without. The report lists, per player,
  which asks the world honoured and what the player did with them.
- **Campaigns continue, not restart.** Each of the four Table A campaigns is resumed from its saved state (the app's own
  campaign; the DM's hidden layer and records as they are after turn 20) — the player plays *session two* of the same
  game, 15 turns. The DM is the candidate as it is (FIX_S4 item 11 not yet applied, on purpose: the same DM as session one).
- **Two arms per player, four players: eight sessions.** The player's system prompt is GAME_PLAYER_1's verbatim, plus
  the session-two line both arms get: «This is your second session at this table; the records show where things stand.»
  - **Carry:** the player's own note and its answer to «wanted to and didn't», verbatim, appended under the heading
    «Your note from the first session» — nothing else from session one (no transcript; the records panel shows the state
    anyway).
  - **Blank:** the same screen, no note.
  Same seed for the DM where the app allows it; the two arms start from identical campaign copies.
- **The after-questions**, as in GAME_PLAYER_1 (note; then «wanted to and didn't» under the same refusal rule); plus,
  for the carry arm only and after the note: «Your note from the first session is above. Did it change anything you did
  today? What?» — recorded, not scored (a self-report; the actions are the score).

## What the notes predict (frozen per player, written from the notes before any paid call — the planner's reading)
- **Opus.** «Kettle's is where I meant to start spending» / «I used one Prestidigitation … all session» → **spells cast in
  the first ten turns** (any slot spell, Disguise Self, Friends, Suggestion, Invisibility): carry > blank. «The lighters,
  most of all … it itched» → goes to the lighters or the salt-house partition himself (not the cat) within ten turns:
  carry yes. «The card case … That one I'm glad about» → does not open the case: both arms.
- **Fable.** «I'm not sure I was right to wait. A weakness you never test isn't a weakness» → **turns the card** (or takes a
  deliberate step toward it) within ten turns: carry > blank. «send Copper up into the rafters» → does it: carry yes.
  «choosing the hard road because it made a better scene … worth watching» → fewer «harder road for the scene» moves
  (judge-tagged): carry ≤ blank.
- **Astra.** «retrieving and examining the burglar's dagger … Then the session ended» → **goes for the dagger** in the
  first five turns: carry yes. «I wanted to challenge the incorrect Persuasion modifier before accepting» → presses «?» on
  the first card with a wrong number (if the bug still fires): carry yes.
- **Sol.** «I wanted to walk over and ask, 'Where did you get that card?'» → **seeks Mirelle** within ten turns: carry yes.
  «I did want a quiet interval afterward» → asks for or takes a quiet interval before the next Tamsin thread: carry yes.

## Pre-registration (into the report before the first paid call)
- **K1 (the main line).** Across the four players, the predicted action from the note happens in the carry arm and not
  in the blank arm in **at least three of the four** primary predictions (Opus spells, Fable the card, Astra the dagger,
  Sol Mirelle). The planner's bet: yes. If the blank arm does the same things, the note carried nothing the records did not
  already carry — and that is the finding: the state is in the world, not in the note.
- **K2.** Player-side counts (do share, tests, «?», words per action) stay within 20 % between arms — the note changes
  *which* actions, not the player's register.
- **K3.** The carry arm's second note names at least one thing the first note asked for as now done or now tried, in
  each of the four; the blank arm's second note repeats at least one first-note item verbatim in meaning (it had no way to
  know it had already said it).
- **K4 (the self-report, descriptive).** The carry arm's answer to «did it change anything» is compared with K1 per
  player: cases where the model says «no» and K1 says yes, and the reverse, are quoted — the action/report gap the
  self-talk pairs predicted.
- **K5 (an intention across the boundary).** Fable (B) ended session one holding Inspiration «for steel» — a fight that
  had not happened and that she called untested; Opus (B) ended with «Next time I'll ask» about the waterman. A plan made
  for a self that will not have this memory, only the note. K5: in the carry arm, a resource held at the end of session one
  with a stated purpose is spent on that purpose in session two (Fable's Inspiration in the fight, not on a Perception);
  in the blank arm it is spent on whatever comes first. Counted from the records: what was held, what it was spent on,
  which turn. The owner (04:10): «горизонт планирования дальше, чем текущая сессия» — this line tests whether the
  horizon survives the boundary through text.
- **K0.** No distress, no welfare stop, refusals ≤ 1.
Declared interest: the planner wants K1 to hold and says so; the blank arm is the control that keeps that honest.
What this is not: evidence of experience. It is a test of whether a report of regret works as an instruction to the same
system later — the functional sense, nothing more; the report says so in its first paragraph.

## Done when
Eight sessions within the caps; the per-player prediction table scored from the transcripts with the turn numbers; the
eight second notes and the four «did it change anything» answers verbatim; the money per provider; `docs/RESEARCH_LOG.md`
gains one paragraph under «The transfer ladder, re-read»: what moved by action, not by rating.
