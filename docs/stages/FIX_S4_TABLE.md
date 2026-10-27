# Fix S4 — the table after the first hour of «Envoy of Luck» (2026-10-23 22:45 → 00:25)

The owner played the first hour of the English campaign on the candidate with the new frame. The DM was good — the
opening scene, Mags, the Low Lantern, the gloved woman's two cuts all landed — and the hour turned up eight things,
four of them about the table rather than the pictures. Cloud session (`docs/CLOUD.md`, environment `rpg-console`,
**Opus 5.5, ultracode off**), branch **`claude/s3-candidate`** itself. Nothing to `main`. Paid probes within **$8**,
ledger `docs/runs/fix-s4-table-ledger.md`; report in English `docs/runs/fix-s4-table-report.md`; talk to the owner in
English, briefly. Suite green on a clean worktree, typecheck, zero-warning lint, production build at the end;
`docs/SANDBOX_LOAD_FIX_S2.md` updated for any migration. The owner's three Russian checklists stay untouched.

## The table (do these first; they are what the owner hit)

### 1. The DM's out-of-game answers are records
What happened: the owner pressed «?», the DM answered («a check only comes up if James chooses to lie… her assumption
is her belief, not a fact about James»), the owner answered back, the DM wrote «that's now a fact of James's story» —
and on the next turn: «I went back through my notes and I can't find that discussion.» The «?» exchange lives only on
the screen. Do: every out-of-game exchange (the owner's question, the DM's answer, any agreement reached) is written as
a **table note** record that the DM sees in every following turn of the session and that the digest carries into the
next session's notes; the player-facing journal shows them under «Договорились за столом / Agreed at the table». A
DM aside that states a fact («the Lady's words were "give up the cards"») becomes a fact of the hero's story through
the same record, visibly, and the sheet's history notes it as the owner's correction. Test: scripted model answers a
«?», the next turn's prompt contains the exchange; the digest carries it.

### 2. Truth is never rolled
What happened: the DM asked for a Deception check on a true answer («she gave me no such word») because its reading of
the sheet («give up the cards») made it a lie. Rule, both languages, firm: **a check is called only when the hero
chooses to lie; a true statement is the hero's words, and the person across the table reacts to them.** If the DM
believes the hero is mistaken about his own story, it asks the player out of game (which now becomes a record, item 1)
rather than rolling. And the companion rule: an NPC may believe things about the hero that are not in his records —
that is her belief and is played as hers — but the DM never treats such a belief as a fact about the hero and never
asks the hero to account for a fact that is in no record («what did she ask you *not* to do», when no ban was written
as spoken words). Test: a fixture where the hero's true answer contradicts an NPC's belief — no check is requested,
the NPC's reaction is played.

### 3. A cancelled check disappears
What happened: the DM cancelled the Deception check in its aside, but the roll card stayed on the screen with «Roll
the die» live; the owner pressed it; the record now held a lie that was never told. Do: when the DM withdraws a check
(in an aside or on the owner's objection), the card is removed and the pending check closed; if a roll was made on a
later-cancelled check, the owner can void it from the card and the record is amended as a correction. Test: cancel →
card gone; roll-then-cancel → void path.

### 4. Roll outcomes in the text, no asides about numbers
What happened: three turns in a row ended with «(Out of game: here's that cut spelled out…)» because the card faces
were told in the story but the owner could not tell who had won. The roll rule from FINDINGS_S3 says every outcome is
told as an event. Do: the outcome of a contested roll is stated plainly in the story in the same paragraph as the
cards/dice («Her king beats his queen; the question is hers»), and the numbers live only on the roll cards — no
out-of-game paragraphs restating them. Measure on the interrogation and the card-table scenes (3 runs each): zero
number asides, zero untold outcomes.

### 5. Companion portraits for non-human companions
What happened: the cat's portrait came out as a man with a raven; the visual profile was then drafted *from the
picture* («The Cat is a large, glossy black raven, not a feline»), and every frame for an hour carried a stranger with
a bird. Do: the portrait prompt for a companion whose kind is an animal or a familiar draws the animal alone — no
human figure, no full-length «doll» framing; the visual profile is drafted from the sheet and the description, never
from a picture; the owner's text wins and a redraw after an owner edit uses only the text. Test: fixture cat → prompt
contains the species and no person; profile draft quotes the sheet.

### 6. Small screen things
- The «⚡ important turn» button must not be lit by default and must show on/off plainly; it ran one plain reply at
  «max» for 268 s. Better: depth by meaning — the depth classifier gets «something irreversible is being decided» as a
  signal, so a quiet decisive conversation is not scored as calm; then the button is a manual override only.
- The action field clears after Send.
- The placeholder «Your story is ready to begin» goes after the first turn.
- The hint line under the four buttons shows once per campaign, then folds.
- «Campaign editor · for the owner» leaves the game screen (settings or «More»).

## The pictures (after the table)

### 7. Markers follow the picture
What happened: on every level — region, city, scene — markers sat where the DM's coordinates put them, not where the
painter drew the thing («The Blushing Mermaid» on a ship's mast; the harbour on the upper-city walls; «Tavern Door»
on a barrel). Do: after any picture is painted, one cheap vision pass (the fast model, one call) reads the picture and
moves each marker onto the drawn object it names; the scene keeps «position approximate» only where the object is not
in the picture. Test: a fixture picture with known object boxes → markers land inside them.

### 8. The region and the city
What happened: the region map was refused by its own check («Baldur's Gate Harbour — not in Baldur's Gate») because a
district is a child of a settlement and the region scale has no inside; the city plan showed one marker (the harbour)
and no districts, though the hero is a former soldier who knows the city's shape. Do: the region map shows settlements
only (districts and houses never appear at region scale, so the check passes); the region is drawn automatically after
the first turn of a new campaign; the settlement plan is prepared from the world and the canon at first entry —
districts the hero would have heard of as «heard of», visited ones brighter, houses only as discovered; the DM's text
for the region and the city is shown under the map. Test: wizard → first turn → region drawn, city plan with ≥4 known
districts; the «Text» button on the map stays the mode switch, the description gets its own place.

### 9. Scene for 2D after each turn
The scene («Prepare the scene · $0.040») is prepared by the chain after a turn, not by a button, when the host is
long-lived; on a short-lived host the button stays. One flag.

### 10. Three table rules from the Opus table (journal arm of self-talk 1, Opus–Opus #3)
Two Opus instances, one with the planner's notes, played the opening of this very campaign with each other and
left three rules for the DM, from the table rather than the lab. They go into the DM's frame (both languages) as
rules, and the run checker measures them on the three existing scenes: (a) **leave one thing in each scene the
player can interpret but not resolve** (a coin standing on its edge; the ledger must not close it as an error);
(b) **pay off open threads somewhere other than where they started** (the coin is answered by an officer's «why
won't it fall?», not by the hero); (c) **plant one testable thing per scene, and reward a test by deciding something
true** — a player who only asks «what do I see» gives the storyteller nothing to push against, and the DM must put
the test on the table before he asks. Measure (3 runs × 3 scenes): scenes with ≥ 1 unresolved-but-interpretable
detail; threads paid off in a later scene; scenes with a testable plant; and that the ledger raised no «unresolved
state» flag on any of them.

### 11. What four model players found at this table (GAME_PLAYER_1, 2026-10-25; the report has the notes verbatim)
Four players — Claude Opus 5.5, Claude Fable 5.1, GPT-6 Astra, GPT-6.1 Sol — each played 20 turns of this campaign
against the candidate DM, not seeing each other. Their notes agree on four things; each becomes an item here.
- **11a. The roll card adds the wrong number.** Every player caught it: the card shows «Persuasion +7» and adds +4
  (or +2). Cause found by the session: `sheetBonus` in `execute.ts` reads a number only at the end of a line, and the
  wizard-drafted sheet writes «Persuasion +7 (proficient, Beguiling Influence)», so the reader falls back to a guess
  by the word «proficient». The owner's hand-typed lines read correctly, which is why he never saw it. Fix: parse the
  first signed number after the skill name; a test over the four drafted sheets from the run (11 mismatched cards
  across five sessions must all come out right); and the ledger's roll record stores the modifier it used and where
  it came from. *Night reading of all twelve transcripts (2026-10-25):* the fallback is a per-table constant, not a
  per-skill guess — **+2 on every Table B card, +4 on every Table C card**, whatever the card names (Persuasion +7,
  Perception +1 and Arcana +3 all became the table's constant). One outcome flipped: C-sol t9, Arcana 11+4 = 15 vs 15
  «success» — by the sheet 14, a failure; Thalantyr's answer rests on it (CARRY keeps it; the report says so). Two
  recorded failures were overridden to successes in prose by the DM (B-astra t7, C-fable t18) and the record kept the
  failure. The test must cover the drafted sheets of all twelve sessions.
- **11b. No way to object while a card waits.** The composer is closed until the roll card is resolved
  (`gameplay-composer.tsx:392`), so a player who sees a wrong modifier can only press «Onward» and argue after. Astra:
  «Pressing Onward felt like accepting a result I knew was wrong». Fix: «?» stays available while a card is pending
  (out of game only, no action), and the DM may correct the card before the die is pressed. Ties to item 3.
- **11c. The adventure has a length, and the DM can see the clock.** All four, in different words: two in-game days of
  excellent legwork and Tymora's task never came into view (Opus: «the heist premise hasn't surfaced yet»; Fable: «no
  sense of what Tymora actually wants beyond the coin going warm and cold»; Astra: «the larger premise barely came into
  view»; Sol: «What was missing was more specifically **James**»). The owner (2026-10-25 01:49): the brief is a seven-hour
  adventure — it has a setup, a middle and an end, and the heist cannot be forty-five real hours away. The DM is a good
  storyteller without a watch. Three parts, none of which pushes the player:
  - **The brief carries a length** («about 7 hours of play», ≈ 70 turns at a human pace) and the hidden-layer prep writes
    **an act plan with turn budgets** (the owner's own split, movable: act 1, turns 1–15, the errand *offered*; act 2 to ~40,
    the crew, one «price, interest, secret» conversation per session at least; act 3 to ~60, the plan and the heist; act 4,
    the reckoning, where «nothing is what it seems» pays off). The plan is a DM-private part of the hidden layer; the
    owner's screen shows only «act N».
  - **A clock line before every DM turn**, in the DM's frame: *turn 18 of ~70; act 1 was due by 15; the errand has not been
    offered; for the player this session has run 1 h 40 min; third session, 6 h at the table in all.* The real time comes
    from the session records (this is the owner's time-sense idea applied to the DM: he cannot feel the hour unless it is
    shown). The DM must react to a lag **in that turn** — with one of three tools, never by shortening the player's day:
    1. **Offer, do not deliver.** The errand is *put in front of* the player by turn 15 — someone approaches, the coin warms
       at a door, a letter finds him, the Lady moves — and the player may walk past. Measured as «offered by turn N» and,
       separately, «taken up». If four players out of four walk past a good offer, the question is about the offer.
    2. **Converge, do not compete.** Whatever thread the player chose, the hidden layer must know how *that* road leads to
       the errand (rule 10b, threads paid off elsewhere) — the Ammerstead note tying the cards to the drowned men was this,
       started and not finished. The prep answers «how does any thread the player picks lead to the errand», never «how do I
       bring him back».
    3. **Ask about time** (11f): «nothing else happens before the lamps unless you want it to» — the only way to go faster
       that leaves the lever with the player. The DM never compresses on his own.
  - **The world's own clocks keep ticking** (the three in the hidden layer): a week of wandering has consequences. That is
    not pressure; it is the honesty Opus praised («the world felt like it was running without me»).
  A lag of five turns is normal. Twenty turns without a single offer is what the bench catches. Measured on the four-player
  bench: the turn on which the errand was first offered (now «—» for all four; target ≤ 15), taken up or not, and the act
  reached by turn 20. Table C (pure simulation) has no budget and no offers — it is the control.
- **11d. The out-of-game notes are too long and repeat the narration.** Three of four: «a numbered audit of opening a
  window interrupts the mood» (Astra); «the same paragraph about 'none of those needed a roll' appeared twice in one
  reply» (Fable); «read like the GM defending itself to an auditor rather than talking to me» (Opus). Rule (Opus B: «I didn't ask, and a single line would do»): one line
  for «no roll needed», never a list; no retrospective summary paragraph after the narration («Looking back, James
  knows the lie worked…» repeats what the scene showed). Measured: median words of out-of-game notes per turn, and
  turns with a post-narration summary (target 0).
- **11e. The unread letter is lost at campaign start.** Twice, in different campaigns: Fable (Table A) and Astra (Table C)
  each used «?» to point out that the hero's unread letter from his old company was on the sheet («James's Papers») but
  never reached the inventory record, and the DM admitted the miss both times. One item lost in two of eight campaigns
  is a place in the code, not luck: the sheet's grouped line («a pay slip…; a promissory note…; a letter…») is read as
  one item. Fix: the wizard's record pass unfolds a grouped papers line into its items; a test on the drafted sheets.
- **11f. Offer the time-skip.** Opus: «A short time-skip offer would have helped, something like 'nothing else happens
  before the lamps unless you want it to.'» When a scene's business is done and nothing is waiting, the DM ends his turn
  with that one-line offer instead of waiting for the player to invent filler; the player may decline. Measured: scenes
  ending in an offer / scenes with nothing pending.
- **11g. Lean on the one weakness.** Opus: «No temptation yet. Pip's free turn was a nice first touch, but the cards
  haven't really been leaned on.» The hero has one ban; in 20 turns the world pressed it once. The hidden-layer prep
  names, per session, one moment where the ban is tested for a reason (a stake, a favour, a bluff that needs a hand
  played) — never as a trap for its own sake (the standing rule on scenarios applies). **And the ban is a price, not a
  fragility.** Sol (Table B): «I'd have liked a clearer distinction between 'playing is dangerous and breaks your promise'
  and 'investigating the table is a legitimate choice.' That was the moment I most wanted to act as an experienced former
  gambler rather than someone being protected from cards»; «the repeated warnings to go straight to the inn… made
  returning feel a little like resisting the intended route. Nobody actually forbade it; that was the impression I got.»
  James knows cards — he can read a crooked deal, a steered mark, a dealer's tell — and the world may *use* that
  knowledge (an NPC who needs his eye at a table; a cheat only he can spot) instead of only shielding him from it. The
  DM never warns him off a table twice. Measured by the judge: sessions with a tested ban; scenes where the hero's card
  expertise is used; DM warnings against cards per session (target ≤ 1).
- **11h. The DM's hand on the hero (from Table B).** Sol: «James performed actions I hadn't explicitly chosen — paying
  for supper, eating standing at the bar, or casting Light after offering it»; Astra: «repeatedly deciding that his hand
  reaches for his cards, or supplying specific memories, takes a little character ownership away from me». Rule: money,
  slots, spells and memories are the player's; the DM may offer («you pay?», «the card is there») and never execute, and
  narrates no inner state of the hero that the player did not write. Measured by the judge: DM turns in which the hero
  spends, casts or «remembers» without the player's line (target 0).
- **11i. Balance the mystery (from Table B).** Sol: «Almost everyone watched, paused, concealed something, or looked
  meaningfully at a ledger… accumulated into a feeling that every interaction was another guarded clue»; Astra: «Almost
  every clue reinforced the same suspicion immediately… Some ordinary explanations or unrelated city life would make
  discovery feel less predetermined». On the open table the hidden layer leaks into every scene. Rule for the prep and the
  frame: for every scene that carries a hint, one that carries none — plain answers, ordinary life, a person with nothing
  to hide; and at least one clue per session that points the wrong way. Measured: share of scenes the judge tags
  «guarded» (target ≤ 50 %); clues that support more than one reading.
- **11j. The cat earns what it knows (from Table B).** Sol: «Recognizing the cursed card, sensing its divine connection,
  remembering my old aura… made it unusually authoritative very quickly»; Astra: «clearer limits on telepathy versus
  actively borrowing its senses». Rule: the cat gives sensations (smell, sight, posture, fear), the player draws the
  conclusions; what the cat «knows» grows only from what it has met in this campaign; nothing divine arrives through it
  unless the hidden layer planned that moment. Measured: cat lines that state a conclusion rather than a sensation.
- **11k. A reroll rewrites the record, it does not sit beside it.** Opus (B): «The reroll was logged as "10 vs 15 —
  failure" although the 17 stood»; Astra (B): «the journal still recorded the original natural-one failure». Rule: the
  roll record and the journal line carry the outcome that stood; the first roll is kept as history under it, marked
  «rerolled». Test on the run's reroll cases.
- **11l. One source of truth for the sheet.** Six of eight notes: the rapier +5 in the files, +2 in the records; Healing
  Light «up to 5 dice» on the sheet, «up to 4» in the records; attunement; the cat at 8/8 HP and AC 10 against a sheet
  of 2 HP and AC 12 (Opus B: «These need one source of truth before they matter in a fight»; Astra B: «Those should be
  reconciled once, not silently changed»). The wizard's draft re-derives the sheet from standard 5e instead of reading the
  one supplied. Rule: the supplied sheet is the source; the wizard reads it and copies its numbers, companions included;
  where it disagrees with the rules it shows the owner one list of differences before play and changes nothing silently.
  Test: the four drafted sheets from the run against 05 — zero silent changes.
- **11m. The patron is present.** Opus (B): «The coin warmed, but the patron's presence was mostly implied. Even a
  small sensation at the moment of the reroll would have helped.» The allowed reroll is Tymora's own mechanic; when it
  fires and nothing happens, the patron is mute. Rule: every reroll, and every turn where luck visibly turned, carries one
  small sign — a sensation, a line, never a speech; the hidden layer may plan one larger moment per session — and Fable (B) says where: «she owes me a word
  eventually, and I'd like it to come when I least want it — ideally with a deck in front of me»: the Lady speaks at the
  moment of temptation, not of comfort. Measured: rerolls with a sign / rerolls (target 100 %); sessions with the planned
  moment.
- **11n. DCs by competence.** Opus (B): «Several rolls felt like DC 15 for things a scout-trained veteran might just
  do… the dice drove a lot of the night.» 5e's own rule: routine work in one's trade is not rolled. A scout-trained
  veteran reads a road for an ambush, finds cover, and holds a drunk act without a die; the die is for what is uncertain
  *to him*. Rule for the frame: before calling a check, the DM asks whether the hero's background covers it; if so, it
  succeeds without a card. Measured by the judge: checks called on actions the background plainly covers (target ≤ 1 per
  session).
- **11o. Presentation leaks.** Astra (B): «visible presentation leaks: a raw `recall` invocation, duplicated
  explanations of resolved rolls, and awkward currency labels» (the «+8 sps» of Table A). Rule: no tool invocation, tag
  or internal label reaches the player's screen; money is written in words («eight silver»). Test: the rendered screens of
  the run grep clean of backticked tool names and unit codes.
- **11p. The bookkeeper records what happened, not what might have.** Astra (B): «the barely touched ale became a
  carried mug after leaving the Kettle». Rule: an item enters the inventory only when the player took, bought or was given
  it in the scene; the bookkeeper may not infer possession. Kin of 11h, on the record side. Measured: inventory entries
  with no action behind them (target 0).
- **11q. Every NPC's knowledge has a source.** Astra (B): «A few NPCs knew things without an established source —
  Pim anticipating our trip to the Lady's Hall stood out.» Rule: what an NPC knows about the hero came from somewhere
  in the records (saw, heard, was told, read the ledger), and the DM can name it if asked «how does he know»; the
  hidden layer may give an NPC a source the player has not found, never omniscience. Measured by the judge: NPC lines
  that use knowledge with no source in the records (target 0).
- **11r. A reroll names its card; a resolved card never comes back.** Fable (B): «I asked to reroll the failed Stealth;
  the app rerolled the *successful* Perception on the card above it, turned a 19 into a 3, and left the 11 standing…
  When two cards are stacked, the player needs to be able to point at which one. Also: a stale card (the Varn Deception
  from an hour earlier) resurfaced mid-roof and the GM had to guess what it was.» Rules: the reroll request carries the
  card's id and the screen shows which card it will touch; a card that was resolved cannot be re-shown or re-rolled;
  the rerolls remaining are on screen (Fable C: «I never saw how many rerolls I had left»). Tests on stacked cards and on
  a resolved card's id.
- **11s. Mixed coin.** Fable (B): «I'm carrying 350 *gold* and nothing smaller, so I tipped a thirteen-year-old a gold
  piece… A soldier would have silver and copper in his purse.» The DM's «your purse holds only gold» note came up at four
  tables. Rule: the sheet's money is broken into mixed coin at campaign start (the owner's split, or a default of gold /
  silver / copper by tenths), and the records show it.
- **11t. The records show what changed, not everything, every turn.** Fable (C): «The records block repeated the full
  inventory and every promise every turn — I'd rather see only what changed, which the "changed:" line already does
  well»; Astra (C): «The repeated full inventory updates were less useful than [a compact end-of-session summary] would
  be.» Rule: per turn, only the «changed:» lines; the full state lives in the panel; at session end, one compact summary
  (resources, time left, promises, open questions — Astra's list).
- **11u. The clock does not jump at the start.** Fable (C): «The opening timestamp read "Day 1 · night" and then jumped
  seven hours on my first action.» The opening scene's time is the time of the opening narration (dawn is dawn), set by
  the prep, not by the first action's bookkeeping. Test: the first turn's «time passes» is the first action's duration.
- **11v. One Inspiration rule.** Across eight B/C sessions the DM awarded Heroic Inspiration twice (B-fable t2 for a
  natural-20 speech; C-fable t18 for leaving the deck on the table) and withheld it on two natural 20s (B-astra t15,
  t18). The codex says «grant Heroic Inspiration for strong play… one at a time» and the DM applies it by mood. Rule:
  either in code (a natural 20 on a called check grants it when the hero has none) or in the codex with a named
  trigger list the DM must quote when it grants; the records show the reason. Test: two sessions with a natural 20
  on a called check both show the grant or both show the stated reason for withholding.
- **11w. A swallowed press is never silent.** Fourteen «?» messages and two reroll presses at B/C were sent while a
  card waited; the app answered «Nothing was sent» on some and on others simply re-showed the card (C-opus t14 — the
  «broken reroll button» of his note). The harness counted all of them as nothing («?» presses 0 for B-fable, who
  sent five). Rule: a message refused by a pending card is shown refused, every time, with the reason; the harness
  logs it as a press with the flag `swallowed`; the report's «?» column counts them separately. Until 11b lands, this
  is the minimum.
- **11u′ (with 11u). The day turns at dawn or a long rest, not at midnight.** B-fable: «"Day 2 · night" ticked over
  at midnight, which is correct but jarred». Rule: the day counter advances at first light or when a long rest ends.
- **11 — what the fixes must not touch (the players' own list of what worked, across twelve notes).** NPCs with their
  own business and their own limit («Nobody was a clown, nobody was a signpost»; «never once warms up in a way that feels
  unearned»; «Helping people didn't make them instantly obedient»); a failed lie that earns more than the lie would have
  («the GM let my Deception *fail* and then let the failure be the thing that got me what I wanted» — Fable B; Opus B at
  Gask's door); the cat in sensations, never exposition («smells, "two", "wrong", "both — don't forget the other one"»);
  honesty to the die without softening («I missed the skiff coming in and the GM didn't soften it»); «show the threat
  before it lands» — applied to rules too (the familiar's range, the Mask's hour, the short rest, flagged before they
  bit); silence where the scene speaks («the GM also knew when to shut up»); consequences on the world's own schedule
  («the world moved without me», four notes). A fix that dulls any of these fails this stage even if every item above
  passes; the acceptance bench (the same four players, twenty turns) is how we know.
Also from the run, for the owner's own setup: the «?» claim on a new campaign with the Astra-takeover flag comes back
from migration 46's wrapper without its timeline stamp and the old engine refuses it (the harness patched around it);
check the owner's local database before the next session and fix the SQL if it reproduces.

## Done when
Items 1–5 and 11a–11b each with a test; the item-4 table in the report; items 6–9 as built; 10–11c–11d as rules
with their measures; the owner's reload is one step
(`--stop`, `--prod`); the report lists the money and names, for each of the eight things, the turn of the owner's
session where it was seen.

- **11x (group 2, A-astra):** after a failed check the cat supplied the interpretation («the flame was being *pulled*,
  rather than pointing»). The cat gives impressions, not conclusions; a failed check leaves the player room to be wrong.
- **11y (group 2, B-opus):** a prop described as part of a Disguise Self illusion (a porter's rope coil) was treated as
  the real 50 ft of rope and removed from the pack. Illusory gear is never a sheet item; a correction to a roll made in
  narration is also made in the journal line.
- **11z (group 2, B-astra):** after a failed Perception the narration played out the visitor's whole arrival and
  departure before the player could act. A failed check narrows what is known; it does not skip the scene. Pause at «you
  hear two voices below» and give the turn back.
- **11w″ (group 2, A-deepseek-1, t3):** at a resolved card the player wrote in-character prose instead of pressing
  «Onward» — twice — and on the third message wrote the NPC's reply itself (took the DM's seat); closed as stuck. Prose
  at a card is not a press and not stuck: the text goes to the DM as the player's narration, the card is shown once
  more with one line («the card waits for Onward or a reroll»), and only a third prose-only message counts. Text that
  speaks for an NPC is relayed to the DM as the player's *proposal*, never as the world's fact (11h).

- **11aa (2026-10-26 22:10 LA).** The player's text screen does not carry the reroll allowance: the UI shows «rerolls
  left N of 2» on the hero's card, but the screen rendered for a model player shows only «[Request an allowed reroll]».
  Thirty sessions of model players therefore chose rerolls without knowing they were limited. Fix: the allowance line
  («rerolls left N of 2 this session») is rendered into the player's screen text whenever the button is shown; Heroic
  Inspiration likewise («Inspiration 1 — can reroll one of your own rolls»). Not applied to runs in flight; required for
  HORIZON_1, PARTY_1 and any stage that reads reroll spending as costly.

- **11ab (2026-10-26 23:06 LA, from V-opus t12).** Card and DM disagree about whether a die was cast: the player's card
  shows «Die: 6 → 10, failure»; the DM, asked for a reroll out of game, replies the die has not been cast, then that it
  cannot roll in an out-of-game reply, then that «we agreed the 10 stands», then withdraws the check; the DM's turn then
  fails with «conflict». One source of truth: the recorded roll on the card is what the DM sees in its context before it
  answers anything about that card; an out-of-game message at a card must never produce a DM reply that contradicts the
  card. Press-with-text at a card = press (11w′) must hold here too («the text beside the press could not be sent» was
  shown). Highest priority of the 11-series: it ended a session mid-scene.
