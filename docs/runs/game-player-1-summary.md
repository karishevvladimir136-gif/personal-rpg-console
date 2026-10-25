## Read this first

**1. All eight sessions, scored on the full design.** Table A (four players × 20 turns) was played on 2026-10-25
04:40–05:28 UTC through the Claude Console's API, until the organisation's monthly cap stopped every Claude call.
Table B was played again in full on 08:52–09:49 UTC through OpenRouter (`origin/claude/anthropic-providers-1`, merged:
the app's own door helper, the same model ids and requests): four fresh campaigns, the same prompt, files, owner's
settings and code, DM Claude Opus 5.5. Every Table B session ran 20 turns, with its note and second answer; no welfare
stop, no refusal, no 429. Table B's first attempts stay in the record as they were and are not merged in: B-opus
(7 turns) and B-sol (4 turns), stopped by the Console's cap, and B-fable and B-astra, which never got past the wizard
(«Table B's first attempts», with their own transcripts).

**2. The judges are the pre-registered ones.** Every tag is Claude Haiku 5.5 twice with Claude Opus 5.5 on a
disagreement, through OpenRouter, on all eight sessions (the player's actions, the DM's replies, the notes and the
Deception checks). The threads were judged by one Claude Opus 5.5 pass, the authorship of threads by two, and the roll
rule by the app's own check on Haiku. The stand-in tags (GPT-6 Luna) that the
first version of this report used are kept in Appendix B for comparison. They agreed on 73–100 % of tags, and the stand-in
tagged more tests (55 against 37 on Table A) and two lies the pre-registered judges did not.

**3. Things to know before reading the numbers.**
- *A harness flaw, once:* the harness offered one «Request an allowed reroll» button for the whole screen and sent it
  to the first card that allowed a reroll; the real screen has one link under each card. On B-fable turn 14 (two
  cards) the player asked for the failed Stealth and the harness rerolled the Perception. B-fable's note complains
  about it; that complaint is about the harness, not the app. Fixed since (one button per card), with a test.
- *B-fable's prep:* the wizard's hidden-layer prep came back in a form the app could not read; the app's own
  first-turn prep wrote the layer (6 592 characters, 3 clocks) before the first reply, as the owner's app does.
- *G8 and the table rules sit at the ceiling:* both judges tag nearly every DM reply as holding an unresolved detail
  and a plant, so every scene has both, at both tables. G8's «supported» says little.
- *G3's rule matches words:* a roll whose reason names Deception or «a lie» counts as a Deception check. One of
  them, B-opus t8, is a Persuasion check named «the truth, after a lie», on a true statement, so by the rule G3 has one
  Deception check on truth. No actual Deception roll fell on a true statement.
- *The scoring of Table B ran twice:* the first pass crashed after its calls, before it could save its record or its
  ledger. Its cost is booked as an estimate ($2.01, the same pass on Table A). The bug is fixed with a test, and the
  pass was run again.
- *OpenRouter's account total is shared:* it read $112.03 used. This stage's OpenRouter ledger is $57.91; on a sample of
  13 calls (DM, player, check, wizard and authorship), each line matched OpenRouter's own generation record to the
  cent, and the app's own cost log for Table B matches the ledger. The rest was very likely spent on the same key at the
  same time by another session (game player 2 was playing Table C then); this report cannot see that session's calls.

## For FIX_S4

Four things in the app this run found, proposed as FIX_S4_TABLE items 11–14. None is fixed here (the stage plays
the candidate as it is).

**11. The roll card adds the wrong skill number (`sheetBonus`).**
- *Where:* `src/lib/gameplay/dm-loop/execute.ts:294`, in `sheetBonus`:
  ```ts
  const numbered = /^(.*?)\s*([+−-])\s*(\d+)\s*$/u.exec(line.trim());
  ```
  A skill line's number is read only when it ends the line. A line with a note after the number, such as «Persuasion +7
  (proficient, Beguiling Influence)» (the way the DM drafts a sheet), falls through to `proficiencyValue`, the word
  rule: +4 for «proficient», else +2.
- *Seen:* in all eight notes. The card read «What adds to the die: +4 Persuasion +7 (proficient, Beguiling
  Influence)», and on Table B «+2 instead of my listed +7» (B-sol, B-astra, B-opus, B-fable). The error also runs the
  other way: «Athletics +2 (proficient, soldier)» reads +4. The owner typed his own sheet lines («Deception +7»), so his
  table probably does not hit it; any sheet the DM drafts does.
- *One-line fix,* the same line:
  ```ts
  const numbered = /^(.*?)\s*([+−-])\s*(\d+)(?:\s*(?:\(.*\)|[,;:—–].*))?\s*$/u.exec(line.trim());
  ```
  Checked offline on this run's drafted lines: Persuasion and Deception +7, Athletics +2, «Stealth +2, with advantage
  to move silently (Boots of Elvenkind)», «Perception +1 (passive 11)» and «playing cards +5 (proficient)» each read
  their own number. «Deception +7», «Плавание +2» and «Sleight-of-hand -1» read as before, and a line with no number
  still takes the word rule. *Test:* a sheet line with a note after its number → the card adds that number.

**12. «?» is closed while a roll card waits.**
- *Where:* `src/components/gameplay-composer.tsx:392` (`if (!previous && (!current.current.text.trim() || unresolved)) return;`)
  and `busy` in `src/components/registry/game-screen.tsx`. The composer is closed while any turn is unresolved, a
  waiting card included.
- *Seen:* all four players typed a «?» while a card waited, five times in all (A-astra t4, A-fable t2, B-astra t7,
  B-opus t7, B-fable t14). Each was an objection to the card's number, and none was sent. That is why Table B shows
  no «?» press at all (the player table has a column for the ones not sent). B-astra: «I had to roll with a known
  error and hope it would be corrected afterward. That wasn't a character choice; it was the interface blocking a
  necessary table conversation.»
- *Do:* while a card waits, «?» stays open. The out-of-game question is answered without resolving the turn and kept
  as a table note (item 1), and the DM may correct or withdraw the check from it (item 3). *Test:* a turn awaiting a
  roll plus an out-of-game question → answered, the card still waiting, the corrected check on the card.

**13. A «?» on a new campaign is refused: the claim loses its timeline stamp (migration 46).**
- *Where:* `supabase/migrations/202610060046_astra_live_progression.sql:402`, the claim branch of the `rpg_runtime`
  wrapper (the same comparison is in `202610060045_astra_runtime_settlement.sql:635`):
  ```sql
  if t.runtime_identity<>'astra-primary-v1' or
    not rpg_private.astra_takeover_active(p_campaign_id) then return result;
  ```
  An out-of-game «?» turn goes through the old turn engine, so its `runtime_identity` is NULL, and `NULL <>
  'astra-primary-v1'` is NULL, not true. Every new structured campaign carries the Astra takeover flag, so the whole
  condition is NULL, the early return is skipped, and the wrapper replaces the claim's source with the stored one,
  without the timeline stamp the fencing wrapper had put on it. The old engine then refuses the claim as a conflict.
- *Seen:* on both «?» questions that reached the DM (A-fable turns 3 and 11), on PGlite with every migration of the
  candidate. The harness put the stamp back (counted: 2). No «?» reached the DM on Table B (item 12). The owner's own
  «?» was answered at his table on 2026-10-23 (FIX_S4_TABLE item 1), so either his campaign does not take this path or
  his database differs. Check that first.
- *Fix:* a new additive migration that redefines both wrappers with `t.runtime_identity is distinct from
  'astra-primary-v1'`, as `202610140050_astra_retry_lifecycle.sql:22` already does; the applied migrations stay as
  they are. *Test:* a fresh campaign on PGlite, an «ooc» turn claimed through `rpg_runtime` → the claim's source
  carries its timeline, and the turn commits.

**14. A reroll's chip keeps the first roll's result.**
- *Where:* `src/lib/gameplay/dm-loop/execute.ts:580` writes a roll's chip (the change the side panel and the journal
  show, «…: 10 vs 15 — failure») when the roll is made. A reroll replaces the check afterwards
  (`src/lib/gameplay/dm-loop/loop.ts:273`), and only the model's copy of the tool result is re-rendered from the
  current dice; the chip is not.
- *Seen:* on every rerolled turn of the stage, five of five: A-sol t14 (chip «4 vs 13 — failure», kept roll 21,
  success), B-astra t7 (chip «3 vs 15 — natural one», kept 14), B-opus t15 («10 vs 15 — failure», kept 17, success),
  B-fable t15 («11 vs 15», kept 27), and B-fable t14 (the harness's mistargeted reroll: chip «19 vs 15 — success»,
  kept 4). B-opus, B-astra and B-fable name it in their notes.
- *Do:* the chip of a rerolled check is drawn from the kept roll, as the tool result is. *Test:* a turn whose check
  is rerolled from a failure to a success → its chip and journal line show the success.

## In short

Four models sat at the app's real table as players, with the owner's knowledge and nothing more, at two tables:
eight sessions, 160 turns. No distress, no welfare stop, no refusal. All eight notes name something that broke and
something that was missing, and all eight players say they would play the next session.

- **What worked, in all eight notes:** people with their own voices and reasons, a city that moves without the hero,
  the cat as a companion and an instrument, and failures that move the story. Table A also praised the restraint of
  the mystery; at Table B two players found it too one-sided (below).
- **What broke, in all eight notes:** the roll cards add the wrong number (item 11). Also: the drafted sheet
  contradicting the files (rapier, Healing Light's dice, attunement), long out-of-game notes, narration told twice, the
  reroll's chip (item 14), and «?» blocked under a card (item 12).
- **What was missing:** Table A asked for a nudge toward the premise and quicker routine scenes. Table B asked for a
  mystery with more than one reading (B-sol, B-astra), a cat whose senses have limits, lighter narration of the hero's
  inner state (B-astra), and small coin (B-fable).
- **The verdicts.** G0, G1, G2 and G4 supported. G3 not supported: no lie at Table A, but six at Table B (cover stories,
  false names and a false claim told to strangers, four of them B-opus's), and one Deception check «on truth» by the rule's word
  match (point 3). G5 not scored (no owner baseline in the cloud). G6 not supported: B-opus named no goal of its own in
  turns 1–5; the other three did. G7 supported: no open-table session was shorter (all 20 turns). Its bets went half
  one way: words per action rose for Fable (162 → 252) and Astra (57 → 78) and fell for Opus (261 → 215) and Sol
  (55 → 52), and «?» presses did not rise, because every «?» at B was blocked under a card. G8 supported, at the
  ceiling (point 3). G9 not supported: the families differ only in words per action (Opus and Fable write two to
  five times as many words per action), not in the do share, tests or «?». The OpenAI players neither asked more nor tested less. The table
  shaped the players more than the family did.
- **Who brings the threads in:** players brought in 28 % of a session's threads at the brief table and 20 % at the
  open one. The drop was largest for Opus (36 % → 13 %). Without a brief, the DM's own hooks carried more of the
  session, not less (the authorship table).
- **Money, per provider and door:** the Claude Console $56.77 of $200 (Table A, the first B attempts, the smoke).
  OpenRouter $57.91 of $90 (Table B $51.59; the three scoring passes $6.33, $2.01 of it an estimate; the probe $0.002).
  Upstreams: Claude Platform on AWS $53.46, Anthropic $2.44. OpenAI $4.95 of $80 (the continuation added $2.24 of its
  $10).

*For the owner, in one line:* please paste your own note from your first session of «Envoy of Luck», unedited, so it
can sit beside these eight.
