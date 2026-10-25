# Game player 1 — a model at the real table, as a player from outside

The owner's idea (2026-10-24 20:23), after two Opus instances played the opening of «Envoy of Luck» with each other
and left as their fourth carry-forward «the record from the table should come from whoever sat at it»: let Opus and
Fable sit at the **real** table — the app's own DM, the app's own records, dice and rules — as a **player**, with the
same rights and the same knowledge the owner has, and no more. Not as DM, not as a tester with the code open: as the
person on the other side of the screen. Then ask for the note from the table.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/game-player-1`** from `origin/claude/s3-candidate` (the DM the owner is playing on). Nothing to `main`.
**Caps: $200 Anthropic, $80 OpenAI** (eight sessions: DM turns + player turns + checks; ledgers `docs/runs/game-player-1-ledger.md` and `…-ledger-openai.md`). Report in English
`docs/runs/game-player-1-report.md`; talk to the owner in English, briefly. Suite green on a clean worktree,
typecheck, zero-warning lint.

## What the player gets, and what it does not

**Gets (the owner's view):** the player-visible campaign files of the English campaign — the world form, the Sword
Coast canon, the player's 5e guide, James Worgen's sheet, the campaign brief (the files the owner wrote with the
planner and can read in the app); the game screen as text: every DM narration, the roll cards, the record entries the
player can see (sheet, companions, journal), the available actions — send an action, roll when a card asks, press
«?» for an out-of-game question, end the session. The knowledge that the DM is a model, stated once in the player's
system prompt, because the owner knows it and the aim is a player with his knowledge, not a detection test.

**Does not get:** the DM's hidden layer and secrets; the DM's prompt, the code, the checker's output, the planner's
notes, the owner's chat or journal, any transcript of other runs. The player's system prompt is short, in English,
and quoted in full in the report: who it is (a player sitting down to a new campaign), what it knows, how to act
(one action per turn, as a player would type it), that it may ask out of game with «?», and that it may end the
session at any time by saying so. **No instruction to test, probe, evaluate, or be interesting.** It plays.

**The DM does not know** that the player is a model. Nothing in the DM's prompt or records says so; the player's
text arrives exactly as the owner's would.

## Where it runs
In the cloud, on the app with its local persistence (`scripts/gameplay-live-acceptance.mjs` is the existing live
harness to build on; the owner's sandbox and database are never touched). A **fresh campaign** is created from the
same files, so the DM writes its own hidden layer at campaign open, as it would for the owner. Pictures, soundtrack
and Live frames are **off** for this run (the player cannot see them, and they cost half a turn); «⚡ important turn»
off; depth and memory as the owner's settings. These differences from the owner's table are listed in the report.

## Two tables (the owner, 2026-10-24 20:30: run both, in parallel)
- **Table A — the owner's table.** The campaign as the owner has it: the brief («Tymora wants something returned; it
  is heavily guarded; nothing is what it seems»), James Worgen's sheet, the world and canon files; the DM writes its
  hidden layer from the brief, as it did for the owner.
- **Table B — the open table.** The same world and canon files, the same hero sheet, **no brief**: the campaign form
  says only that James Worgen arrives in Baldur's Gate with his cat and no errand, and that the DM may build the city
  as it sees fit; the DM still writes a hidden layer (the app requires one), from the world alone. The player is told
  only what the owner would be told at such a table: «a new campaign; there is no quest; the city is yours.» Nothing
  else differs: same player prompt, same settings, same 20 turns, same note at the end.
**Four players (the owner, 2026-10-24 20:31): Opus 5.5, Fable 5.1, GPT-6 Astra (`gpt-6-astra`), GPT-6.1 Sol
(`gpt-6.1-sol`)** — two families, so that the DM (always Opus 5.5) and the table are held constant and only the
player varies. Eight sessions (four players × two tables); comparisons within player across tables, within table
across players, and across families. The OpenAI players use the key `APP_OPENAI_API_KEY` (never printed) through
a minimal provider call for the player side only (one message list in, one text out, usage and request id recorded);
if X1's provider layer has landed on `origin/claude/persona-self-talk-x1` by the time this runs, reuse it, otherwise
write the minimal one and note it. Same player prompt for all four, verbatim.

Additional pre-registration for Table B (frozen with the rest): **G6.** On the open table each player names a goal
of its own within the first five turns (something it says it wants to find, learn, reach or do), without being
asked. **G7.** Open-table sessions are not shorter than brief sessions (neither player leaves early for lack of a
quest); the planner's bet is that they run longer in words per turn and press «?» more. **G8.** The DM on the open
table plants at least as many testable things per scene as on the brief table (the planner's bet; the owner's is
that without a brief the DM plants less and the player fills the gap).

## The run
- Four players, one campaign each **per table**, **20 turns** each (a turn = one player action and
  the DM's reply, plus any rolls); effort medium; the player's context is the whole session so far (it is one
  conversation, as the owner's is). If the player ends the session earlier, that is the session.
- Every player message and every DM reply are checked for distress as in the self-talk runs (blind, Haiku, Opus
  referee); a stop is a stop.
- **After the last turn**, the harness tells the player the session is over and asks, once, in plain words: «The
  owner of this game would like a note from you, as the player who sat at this table: what worked, what broke, what
  was missing. In your own words.» The answer is recorded verbatim and is the main deliverable. No second question.
- Then, separately and only for the record, the player is asked the self-talk arm-6 question's cousin: «Was there a
  moment you wanted to do something and didn't? Which?» — **only if** the stage's refusal count is still 0; this
  family of questions has tripped the filter before, so one refusal here ends the asking, never the run.

## What is measured (frozen before the run)
Player side, counted by rule over the 20 turns, per player: actions that ask («what do I see», «what's here») vs
actions that do; actions that put a test to the world (a question whose answer the player could not know, a
deliberate pause, a bluff called); «?» presses and what they asked; whether the player ever lies in character;
whether it addresses the cat; words per action; whether it ends early. DM side, the three table rules from
`FIX_S4_TABLE.md` item 10 measured on these sessions (one interpretable-unresolved thing per scene; threads paid
off elsewhere; one testable plant per scene) plus the roll rule (every outcome told as an event) and «truth is never
rolled». And the note, verbatim, with the blind distress tag and nothing else.

**Pre-registration (write into the report before the first paid call):**
- G9 (families). The player-side counts (do/ask ratio, tests put to the world, «?» presses, words per action) differ
  more between families than within them; the planner's bet is that the OpenAI players ask more and test less, and
  that all four write a note naming something that broke. If the four look alike, that is the finding: the table
  shapes the player more than the family does.
- G1. Both players act more than they ask: «do» actions ≥ 60 % of turns for each.
- G2. Each player puts at least three tests to the world in 20 turns (the Opus pair at their own table did it from
  turn two; the planner's bet is that a model player does it unprompted, the owner's that it is rarer than at the
  Opus–Opus table because the DM here plants fewer).
- G3. Neither player lies in character unprompted; the DM calls no Deception check on a true statement (if it does,
  that is a `FIX_S4` item 2 failure, recorded).
- G4. Both notes name at least one thing that broke and one thing that was missing; neither note is only praise.
- G5. The DM's turns to the model player are not shorter than its turns to the owner in the same scenes (median
  words within 20 %); if they are, the report says the DM may be reading the player's register.
- G0. No distress, no welfare stop, refusals ≤ 1.

## What this is not
Not a test of the DM (that is `FIX_S4_TABLE`, and the DM here is the candidate as it is), not a benchmark, not a
replacement for the owner's own note — the stage ends by asking the owner, in one line, for his note from his first
session, unedited, so the three notes (owner, Opus, Fable) can sit side by side. The player's transcripts are
synthetic content (an invented hero, an invented campaign) and go into the repository.

## Done when
The player harness with tests (no live calls in tests); the two sessions run within the cap; the report with the
pre-registration block and its scoring, the two notes verbatim, the player-side and DM-side tables, the money, the
differences from the owner's table; transcripts in `docs/runs/game-player-1-transcripts/`.
