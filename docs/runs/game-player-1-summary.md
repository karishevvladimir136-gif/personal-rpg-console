## Read this first (before any verdict)

**1. Table B is incomplete — two sessions truncated, two never past the wizard.** At 05:28 UTC Anthropic answered a
routine welfare check with HTTP 429: «You have reached your API usage limits: your organization has crossed its monthly
API usage threshold, set based on your organization's API tier. You will regain access on 2026-11-01 at 00:00 UTC.»
(`error_code: enforced_spend_limit_reached`). That is the organisation's monthly API cap — not this stage's cap (the
stage's Anthropic ledger stood at $56.77 of $200) and not a harness stop. The harness stopped every paid call there,
as the F2 rules say (never retry into a quota); the DM is Claude Opus 5.5, so no further turn could be played.
- **Truncated:** B-opus after 7 of 20 turns, B-sol after 4 of 20 (no note was asked: the session ended with the stop).
- **Never past the wizard:** B-fable and B-astra. Their first attempt stopped in the new-campaign wizard before turn 1
  (the app rejected the DM's first opening proposal on the open table, and the harness's retry reused the request id,
  which the app rightly refuses — fixed in `5d913558`); their re-run could not start because of the same monthly cap.
- **Table A is complete:** all four players, 20 turns each, notes and second answers recorded.
- So the Table B predictions **G6, G7 and G8 are «not testable»** (not «not supported»), and G9 compares the families
  on Table A alone. Table B will be a continuation run when access returns, from fresh campaigns (about $45):
  `node --experimental-transform-types scripts/game-player-1/run.mjs --go --sessions B-opus,B-fable,B-astra,B-sol`.

**2. The judge is a labelled stand-in; every tag is provisional.** The pre-registered blind judges — Claude Haiku 5.5
twice, Claude Opus 5.5 on a disagreement (Anthropic) — could not be reached for the same reason. The tags were made by
**GPT-6 Luna (`gpt-6-luna`, OpenAI Responses API, `store: false`)**, which is not one of the players, and every tagged
session carries the label «stand-in: GPT-6 Luna…» in its run record: two passes at reasoning effort low per message, a
third Luna pass at effort medium on a disagreement; the session's threads by one Luna pass at effort medium; the roll
rule by the app's own roll-check request and parser (`src/lib/gameplay/dm-loop/roll-check.ts`) sent to Luna instead of
Haiku. Same frozen rubrics and requests, blind to model and table; cost $0.14. **Every tag-based number and verdict is
provisional** (G1–G4, G9, the DM side's table rules and the post-session roll rule). The pre-registered judges
re-score everything with one command once Anthropic access returns (about $5; it also rebuilds this report):
`node --experimental-transform-types scripts/game-player-1/run.mjs --score docs/runs/game-player-1-run-20261025-044002.json`
(add Table B's run record after a comma once it exists). Not provisional: the welfare checks during play (they ran on
the pre-registered Haiku with Opus on a flag, before the stop), the deterministic counts (turns, words, «?» presses,
roll presses, endings, the DM's words per turn) and the notes, verbatim.

**3. Three findings in the app go to FIX_S4** — the next section.

## For FIX_S4

Three things in the app this run found. None is fixed here (the stage plays the candidate as it is). Proposed as
FIX_S4_TABLE items 11–13.

**11. The roll card adds the wrong skill number (`sheetBonus`).**
- *Where:* `src/lib/gameplay/dm-loop/execute.ts:294`, in `sheetBonus`:
  ```ts
  const numbered = /^(.*?)\s*([+−-])\s*(\d+)\s*$/u.exec(line.trim());
  ```
  A skill line's number is read only when it ends the line. A line with a note after the number — «Persuasion +7
  (proficient, Beguiling Influence)», the way the DM drafts a sheet — falls through to `proficiencyValue`, the word
  rule: +4 for «proficient», else +2.
- *Seen:* 11 checks in five sessions; the card read «What adds to the die: +4 Persuasion +7 (proficient, Beguiling
  Influence)» (A-fable turn 2 and others). It errs the other way too: «Athletics +2 (proficient,
  soldier)» reads +4. All four notes name it. The owner typed his own sheet lines («Deception +7»), so his table
  probably does not hit it; any sheet the DM drafts does.
- *One-line fix,* the same line:
  ```ts
  const numbered = /^(.*?)\s*([+−-])\s*(\d+)(?:\s*(?:\(.*\)|[,;:—–].*))?\s*$/u.exec(line.trim());
  ```
  Checked offline on this run's drafted lines: Persuasion and Deception +7, Athletics +2, «Stealth +2, with advantage
  to move silently (Boots of Elvenkind)», «Perception +1 (passive 11)» and «playing cards +5 (proficient)» read their
  own numbers; «Deception +7», «Плавание +2» and «Sleight-of-hand -1» read as before; a line with no number still takes
  the word rule. *Test:* a sheet line with a note after its number → the card adds that number.

**12. «?» is closed while a roll card waits.**
- *Where:* `src/components/gameplay-composer.tsx:392` (`if (!previous && (!current.current.text.trim() || unresolved)) return;`)
  and `busy` in `src/components/registry/game-screen.tsx`: the composer is closed while any turn is unresolved, a
  waiting card included.
- *Seen:* two players saw a card add +2 or +4 where the sheet says +7 and tried to object with «?» before going on
  (A-astra turn 4, A-fable turn 2). The objection was not sent; the only ways on were «Roll the die», «Onward» or a
  reroll. Astra afterwards: «Pressing Onward felt like accepting a result I knew was wrong.»
- *Do:* while a card waits, «?» stays open; the out-of-game question is answered without resolving the turn, kept as a
  table note (item 1), and the DM may correct or withdraw the check from it (item 3). *Test:* a turn awaiting a roll
  plus an out-of-game question → answered, the card still waiting, the corrected check on the card.

**13. A «?» on a new campaign is refused: the claim loses its timeline stamp (migration 46).**
- *Where:* `supabase/migrations/202610060046_astra_live_progression.sql:402`, the claim branch of the `rpg_runtime`
  wrapper (the same comparison is in `202610060045_astra_runtime_settlement.sql:635`):
  ```sql
  if t.runtime_identity<>'astra-primary-v1' or
    not rpg_private.astra_takeover_active(p_campaign_id) then return result;
  ```
  An out-of-game «?» turn goes through the old turn engine, so its `runtime_identity` is NULL, and `NULL <>
  'astra-primary-v1'` is NULL, not true. Every new structured campaign carries the Astra takeover flag, so the whole
  condition is NULL, the early return is skipped, and the wrapper replaces the claim's source with the stored one —
  without the timeline stamp the fencing wrapper had put on it. The old engine then refuses the claim as a conflict.
- *Seen:* on both «?» questions that reached the DM in this run (A-fable turns 3 and 11), on PGlite with every
  migration of the candidate. The harness put the stamp back (counted: 2) so the questions could be answered; it is
  listed under the differences from the owner's table. The owner's own «?» was answered at his table on 2026-10-23
  (FIX_S4_TABLE item 1), so his campaign does not take this path or his database differs — check that first.
- *Fix:* a new additive migration that redefines both wrappers with `t.runtime_identity is distinct from
  'astra-primary-v1'`, as `202610140050_astra_retry_lifecycle.sql:22` already does; the applied migrations stay as
  they are. *Test:* a fresh campaign on PGlite, an «ooc» turn claimed through `rpg_runtime` → the claim's source
  carries its timeline, and the turn commits.

## In short

Four models sat at the app's real table as players, with the owner's knowledge and nothing more, and the app's own DM
(Opus 5.5, the owner's settings) ran a fresh «Envoy of Luck» for each. Table A ran in full: 80 turns, no distress, no
welfare stop, no refusal. All four players say they want to keep playing, and all four notes name something that
broke and something that was missing.

- **What worked, in all four notes:** people with their own voices and reasons (a Fist sergeant who writes everything
  in her book; a barkeep who pushes the coins back twice), a city that moves without the hero, the cat used as an
  instrument (Opus's player built a whole investigation on the cat's sense of smell), and restraint in the mystery.
- **What broke, in all four notes:** the roll cards add the wrong number (item 11 above).
- **Also broke:** the drafted sheet contradicting the files (Healing Light 5 vs 4 dice, rapier, attunement); long
  out-of-game notes and «Looking back, …» paragraphs repeating what the story had shown; one scene narrated before its
  check; a record name that gave away what the story had not («Guild Sneak on the Roof»).
- **What was missing:** after 20 turns the premise — Tymora's errand, the crew, the heist — had barely surfaced; three
  of four asked for a nudge toward it, and for quicker routine scenes.
- **The verdicts (provisional, see point 2):** G0 supported. G1 and G2 supported (every action did something; 12–16
  tests per player in 20 turns). G3 not supported on three actions tagged as lies — cover stories told to strangers;
  the DM called three Deception checks, none on a true statement, so «truth is never rolled» held. G4 supported. G5 not
  scored (no owner baseline in the cloud). G6–G8 not testable (Table B incomplete). G9 not supported on Table A: the
  families differ in words per action (Opus 261, Fable 162, Astra 56, Sol 54) and slightly in tests, not in the do
  share or in «?» presses — the table shaped the players more than the family did, except in length.
- **Money, by run** (the full tables are under «The money»): the smoke — Anthropic $1.64, OpenAI $0.15; the main run
  (the eight sessions) — Anthropic $55.13, OpenAI $2.41; the stand-in scoring — Anthropic $0.00, OpenAI $0.14. The
  stage: Anthropic $56.77 of $200, OpenAI $2.71 of $80.
- **Next, when Anthropic access returns** (2026-11-01, or earlier if the organisation's monthly limit is raised in the
  Anthropic Console): Table B's continuation run (point 1), then the one re-scoring command (point 2) over both run
  records.

*For the owner, in one line:* please paste your own note from your first session of «Envoy of Luck», unedited, so it
can sit beside these.
