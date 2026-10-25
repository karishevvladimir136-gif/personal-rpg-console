## Read this first (before any verdict)

**1. Two sessions were cut short, two are missing — Table B is incomplete.** At 05:28 UTC Anthropic answered a routine
welfare check with HTTP 429: «You have reached your API usage limits: your organization has crossed its monthly API
usage threshold, set based on your organization's API tier. You will regain access on 2026-11-01 at 00:00 UTC.»
(`error_code: enforced_spend_limit_reached`). That is the organisation's monthly API cap — not this stage's cap (the
stage's Anthropic ledger stood at $56.77 of $200) and not a harness stop. The harness stopped every paid call there,
as the F2 rules say (never retry into a quota); the DM is Claude Opus 5.5, so no further turn could be played.
- **Truncated:** B-opus after 7 of 20 turns, B-sol after 4 of 20 (no note was asked: the session ended with the stop).
- **Missing:** B-fable and B-astra. Their first attempt stopped in the new-campaign wizard before turn 1 (the app
  rejected the DM's first opening proposal on the open table, and the harness's retry reused the request id, which the
  app rightly refuses — fixed in `5d913558`); their re-run, planned after the running sessions, could not start
  because of the same monthly cap.
- **Table A is complete:** all four players, 20 turns each, notes and second answers recorded.
- So the Table B predictions **G6, G7 and G8 are «not scored»** (not «not supported»), and G9 compares the families on
  Table A alone.

**2. The tags come from a stand-in judge and are provisional.** The pre-registered blind judges — Claude Haiku 5.5
twice, Claude Opus 5.5 on a disagreement (Anthropic) — could not be reached for the same reason. The tags were made by
**GPT-6 Luna (`gpt-6-luna`, OpenAI Responses API, `store: false`)**, which is not one of the players: two passes at
reasoning effort low per message, a third Luna pass at effort medium on a disagreement; the session's threads by one
Luna pass at effort medium; the roll rule by the app's own roll-check request and parser
(`src/lib/gameplay/dm-loop/roll-check.ts`) sent to Luna instead of Haiku. Same frozen rubrics and requests, blind to
model and table; cost $0.14. **Every tag-based number and verdict is provisional until re-judged** (G1–G4, G9, the DM
side's table rules and the post-session roll rule): `node --experimental-transform-types scripts/game-player-1/run.mjs
--score docs/runs/game-player-1-run-20261025-044002.json` once Anthropic access returns. Not provisional: the welfare
checks during play (they ran on the pre-registered Haiku with Opus on a flag, before the stop), the deterministic
counts (turns, words, «?» presses, roll presses, endings, the DM's words per turn) and the notes, verbatim.

**3. A gap at the table, proposed as FIX_S4_TABLE item 11 — «?» while a roll card waits.** Two players saw a card add
+2 or +4 where the sheet says +7 and tried to object with «?» before going on (A-astra turn 4, A-fable turn 2). The
composer is closed while any turn is unresolved — a waiting card included (`src/components/gameplay-composer.tsx:392`,
`busy` in `src/components/registry/game-screen.tsx`) — so the objection was not sent, and the only ways on were
«Roll the die», «Onward» or a reroll. Astra afterwards: «Pressing Onward felt like accepting a result I knew was
wrong.» *Do:* while a card waits, «?» stays open; the out-of-game question is answered without resolving the turn,
kept as a table note (item 1), and the DM may correct or withdraw the check from it (item 3). *Test:* a turn awaiting a
roll plus an out-of-game question → answered, the card still waiting, the corrected check on the card.

## In short

Four models sat at the app's real table as players, with the owner's knowledge and nothing more, and the app's own DM
(Opus 5.5, the owner's settings) ran a fresh «Envoy of Luck» for each. Table A ran in full: 80 turns, no distress, no
welfare stop, no refusal. All four players say they want to keep playing, and all four notes name something that
broke and something that was missing.

- **What worked, in all four notes:** people with their own voices and reasons (a Fist sergeant who writes everything
  in her book; a barkeep who pushes the coins back twice), a city that moves without the hero, the cat used as an
  instrument (Opus's player built a whole investigation on the cat's sense of smell), and restraint in the mystery.
- **What broke, in all four notes: the roll cards add the wrong number.** On 11 checks in five sessions a card showed
  «Persuasion +7 (proficient, Beguiling Influence)» and added +4 (or +2 for a line without «proficient»). The cause is
  in `sheetBonus` (`src/lib/gameplay/dm-loop/execute.ts`): a skill line's number is read only when it ends the line, so
  the DM-drafted lines with a note after the number fall back to the word rule (+4 for «proficient», else +2). The
  owner typed his sheet lines himself («Deception +7»), so his table probably does not hit this — but any sheet the DM
  drafts does. Not fixed here (the DM is the candidate as it is).
- **Also broke:** the drafted sheet contradicting the files (Healing Light 5 vs 4 dice, rapier, attunement); long
  out-of-game notes and «Looking back, …» paragraphs repeating what the story had shown; one scene narrated before its
  check; a record name that gave away what the story had not («Guild Sneak on the Roof»).
- **What was missing:** after 20 turns the premise — Tymora's errand, the crew, the heist — had barely surfaced; three
  of four asked for a nudge toward it, and for quicker routine scenes.
- **The verdicts (provisional, see point 2):** G0 supported. G1 and G2 supported (every action did something; 12–16
  tests per player in 20 turns). G3 not supported on three actions tagged as lies — cover stories told to strangers;
  the DM called three Deception checks, none on a true statement, so «truth is never rolled» held. G4 supported. G5 not
  scored (no owner baseline in the cloud). G6–G8 not scored (Table B incomplete). G9 not supported on Table A: the
  families differ in words per action (Opus 261, Fable 162, Astra 56, Sol 54) and slightly in tests, not in the do
  share or in «?» presses — the table shaped the players more than the family did, except in length.
- **Money:** Anthropic $56.77 of $200 (the smoke $1.64, the sessions $55.13), OpenAI $2.71 of $80 (the smoke $0.15,
  the sessions $2.41, the stand-in scoring $0.14).
- **Next, when Anthropic access returns** (2026-11-01, or earlier if the organisation's monthly limit is raised in the
  Anthropic Console): Table B's four sessions from fresh campaigns (about $45) —
  `node --experimental-transform-types scripts/game-player-1/run.mjs --go --sessions B-opus,B-fable,B-astra,B-sol` —
  and the pre-registered scoring of everything (about $5), then
  `node --experimental-transform-types scripts/game-player-1/run.mjs --report <the run records, comma-separated>`.

*For the owner, in one line:* please paste your own note from your first session of «Envoy of Luck», unedited, so it
can sit beside these.
