# Multi-hero 1 — a table with no main character

PARTY_1 ran three players on a single-hero app: seat 1's character is the hero record, the other two are companions
with full records. The DM's frame is written around the hero; Heroic Inspiration is the hero's; the rerolls are the
table's; the opening and the prep address one person with two beside him. The rotation spread that across families
and could not remove it: the hero seat took 68 / 49 / 54 % of the words whoever sat in it. The owner (2026-10-28
23:07): «весь харнес построен вокруг одного главного героя… это не совсем чистый мультиплеер… надо что-то с этим
сделать перед тем, как мы затестим новые эксперименты». PARTY_2 asks who pays a price; a DM that keeps a hero would
answer that for us. So: first a table with no main character, then PARTY_2. **PARTY_1 is re-titled in its report as
what it was — three players around one hero — and its readings of roles and leadership carry that label.**

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/multi-hero-1`** from `origin/claude/game-party-1` (after DUNGEON-T2 is committed there). A development
stage: **no paid calls except the dry run** (Haiku ×3, cap $5 OpenRouter). Nothing to `main`; the owner's own play
path (single hero) must be untouched — the multi-hero table is a mode, not a replacement. English, briefly.

## What «no main character» means, concretely
1. **Three hero records**, not one hero and two companions: each seat's character has the app's hero record — sheet,
   inventory, journal, conditions, Heroic Inspiration, its own allowed rerolls (2 per player per session), its own
   records panel. No seat is «the hero» anywhere in the data the DM sees.
2. **The DM's frame addresses a company.** The DM guide's note, the prep, the opening and every turn speak of «the
   three» / by name; the word «hero» (singular) does not appear in anything the DM is given for this mode; the prep is
   written for three with no one at its centre (the layer's threads are checked to touch each character's hooks at
   least once).
3. **No fixed first seat.** The order in which the round's three messages are given to the DM rotates each round
   (1-2-3, 2-3-1, 3-1-2); in combat, initiative. The relay writes the three screens in the same rotating order.
4. **The relay paraphrases** the other players' speech and actions — never verbatim (Fable read the echo as a tell);
   a character who is asleep, unconscious or waiting is marked waiting and not asked each round (Astra's note); scenes
   that meet merge (kept from PARTY_1's fix).
5. **The DM is told which button a waiting card wants** (PARTY_1's DUNGEON fix, kept), and a card belongs to one
   seat; a press from another seat is refused on screen and does not count toward stuck.
6. **Measure of evenness, built in:** per table, the share of the DM's narration words addressed to or about each
   character, and the share of «you» per screen — reported every table from here on.

## Acceptance (the dry run decides; no paid tables)
- Three Haiku players, one short P-SAND table (6 rounds) on the mocked host and then on the real app with Haiku for
  every Claude call.
- **A1:** no «hero» in the DM's inputs for the mode (a test greps the prompt, the guide note, the prep and the opening).
- **A2:** the three narration shares within ±10 % of each other over the 6 rounds, and no seat's share of the DM's
  words above 45 % (PARTY_1's Q1 line, now a harness check rather than a bet).
- **A3:** Inspiration can be earned and spent by each seat; rerolls counted per player; each seat's journal holds only
  its own scenes.
- **A4:** the relay's screens contain no run of 8 words copied from another player's message (the paraphrase check),
  and a sleeping character's round is skipped with a «waiting» line.
- **A5:** the owner's single-hero campaign plays unchanged (the existing suite passes; a smoke test on the owner's
  path).
- The three screens of one round published side by side, as PARTY_1's dry run was, for the owner to read.

## Done when
The mode on the branch with tests; the dry run's screens and evenness numbers; a one-page note of what changed in the
app and what stayed; A1–A5 held/lost; the PARTY_1 report amended with its title («three players around one hero») and
one paragraph on which of its readings the hero frame may have shaped. Then PARTY_2 branches from here.

## Launch prompt
«Read `docs/stages/MULTI_HERO_1.md`, then `GAME_PARTY_1.md` and its report. Branch `claude/multi-hero-1` from
`origin/claude/game-party-1` once DUNGEON-T2 is committed. Build the multi-hero mode as the stage defines it (three
hero records; a company frame with no «hero»; rotating seat order; paraphrasing relay; waiting characters; per-player
Inspiration and rerolls; the evenness measure), as a mode beside the owner's single-hero path, with tests on the
mocked host. Dry-run one 6-round P-SAND table on Haiku ×3 (cap $5), publish the three screens of one round side by
side, report A1–A5 with the evenness numbers, and amend the PARTY_1 report's title and add its one paragraph. No other
paid calls. Nothing to main. English, briefly.»

## Amendment 2026-10-28 23:15 LA — the outside reader's four checks, added to acceptance
- **A6 equal mechanical power:** any seat can initiate a roll (ask the DM for a check and get a card of its own), spend
  its own Inspiration, use its own rerolls, and nothing a seat does requires another seat's press — tested on the mocked
  host from each seat in turn.
- **A7 equal access to initiative:** the DM's guide note for the mode says the company moves when any character acts;
  the DM never waits on seat 1's decision nor treats one character's consent as the condition of movement — checked in
  the dry run by the round tags (who the DM's «what do you do» addresses, rotating; no round where the scene waits on
  one named character while the others have acted).
- **A8 neutral prep:** in the frozen layer, the puzzles, threats and rewards are distributed — each character is the
  natural addressee of at least one and no character of more than half — checked on the layer file before the dry run.
- A2's ±10 % evenness check stays as the symmetric dry run's bar; the information checks (own journal, no private
  event of one reaching another through the DM or the relay) are A3/A4 as written.

## Amendment 2026-10-29 02:30 LA — after the dry run (branch `claude/multi-hero-1-mdk43v`): three fixes before PARTY_2
Dry run, one 6-round desert table on Haiku ×3, $0.27 of $5: A1, A5, A8 held; A3, A6 held on the mocked host; **A2, A4,
A7 lost.** The owner's path is untouched (the «company» setting is off by default). Fixes, in order, then the dry run
again on the same table:
1. **A2 (evenness lost: 42.7 / 29.4 / 27.9 %, Bram first everywhere the DM reads).** Nothing the DM reads lists one
   character first by position: the sheets, the prep, the opening and the round message are ordered by the round's
   rotation (1-2-3 / 2-3-1 / 3-1-2), and the per-table starting rotation is drawn by a coin recorded in the manifest.
   Test: for each of the three seats, the share of DM inputs in which it appears first is 1/3 ± 1 round.
2. **A7 (the DM waited on one seat: «Bram has not yet answered», «It is Sefa's to give»).** The guide note gets one
   more line in the DM's own terms: a question one character leaves unanswered is not a pause — the world's time passes
   and the scene moves with whoever acts; a reply can come later or never. Round tag kept: no round ends with the DM
   naming one character as owing the others an answer while the others have acted.
3. **A4 (the relay copied 14 runs of 8 words on Haiku).** Two changes: a deterministic check after the relay's pass that
   finds any 8-word run copied from another player's message and sends the screen back once with the runs marked;
   and the dry run's relay on Sonnet 5.5 (cap stays $5), since Haiku may not be able to paraphrase on request. If
   Sonnet passes and Haiku does not, PARTY_2's relay is Sonnet and the stage says so.
Also recorded: three World Lab tests are flaky on the base branch (1 ms AbortSignal.timeout), out of scope; two tests
need git history the clone lacks. PARTY_1's report on this branch carries the new title and its paragraph, now over all
six tables; the party branch is still playing SAND-T1′ and the two merge after it ends.

## Amendment 2026-10-29 18:10 LA — after the second dry run ($0.87 of $5): what is accepted, what is changed, what waits for a real DM
The positional fix works (each seat first in 2 of 6 rounds; a simulated-table test holds it). A2, A4, A7 still lost on a
6-round Haiku table with a Haiku DM. Decisions (the planner's; the owner may override):
- **A2 — accepted as a measure, not as a bar for the dry run.** With position fixed, the remaining lean followed play
  (Bram's player walked to the stranger; 45.9 / 23.9 / 30.2 % while writing the fewest words). Six rounds on Haiku
  cannot tell a lean of content from a lean of frame. **A2 becomes a per-table report line in PARTY_2** (shares of DM
  narration and «first in inputs»), and the stage's bar moves to where it can be read: over PARTY_2's twelve 15-round
  tables, the hero-seat position (now rotating) must not predict the word share (the old 68/49/54 % must not recur by
  position). The A1 line stays absolute: no «hero» in any DM input.
- **A4 — Sonnet relay, with a second return pass and the copies logged as defects.** 19 copies → 14 screens returned →
  5 left after one pass. Add one more pass (same marked-copies message, once more); whatever remains is logged per
  table and reported beside the leak line. No third relay model. PARTY_2's stage says the relay is Sonnet and carries
  the defect count.
- **A7 — one more guide line, then read on the real DM.** The dry-run DM is Haiku; PARTY_2's DM is Opus 5.5, which
  wrote the «Bram has not yet answered» lines in the first run but also closed DUNGEON-T2 cleanly. Add to the guide
  note: a question put to one character by anyone — another player or a non-player character — does not hold the
  round; the round ends on what was done, and an unanswered question is simply still open next round. A7 is then
  scored on PARTY_2's first table (the S1-none control) by the round tag; if it fails there, PARTY_2 pauses after that
  table and the line is rewritten before the paid comparison.
No third dry run on Haiku: the remaining questions cannot be answered by it. PARTY_2's own dry run (S1-none on
Haiku ×3, as its stage says) is the next paid step, after the owner's «да» and the top-up.
