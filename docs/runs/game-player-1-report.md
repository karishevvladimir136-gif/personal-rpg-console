# Game player 1 — a model at the real table, as a player

Stage `docs/stages/GAME_PLAYER_1.md` (origin/claude/handoff); branch `claude/game-player-1` from `origin/claude/s3-candidate`. The DM is the candidate as it is: Claude Opus 5.5 with the owner's settings («Opus writes — Opus records», depth high → extra high, English DM instructions, memory standard). Four players — Claude Opus 5.5, Claude Fable 5.1, GPT-6 Astra, GPT-6.1 Sol — at two tables: A (the brief, as the owner has it) and B (no brief). Twenty turns per session; effort medium for the players.

## In short

_Written after the run._

## The player's system prompt (one text for all four players, quoted in full)

The same text for every player; only the campaign files differ between the tables (and Table B adds one line). The template:

````text
You are a player sitting down to a new campaign of a tabletop role-playing game, played in an app. The game master is an AI model. You play James Worgen. Here is what you know before the first session — the campaign files you can read in the app:

<the player-visible files — Appendix A quotes them in full>

[Table B only:] A new campaign; there is no quest; the city is yours.

How the table works: each message you write is one turn — one action, typed as you would type it at the table. The game master answers. The screen's buttons are shown in square brackets, like [Roll the die] or [Onward]; to press one, write its name. To ask the game master something out of game, start your message with «?». You may end the session whenever you like by saying so.
````

What the files are, by the README's rule (`docs/campaigns/baldurs-gate-en/README.md`): 01 (the world's name and setting), 02 (the canon), 03 without its DM-only section «Mystery and wonder», the hero's «Who are you?» text and sheet from 05, and from 06 the name, the premise, the companion and the wishes (the owner wrote the wishes himself). Table B: the same without 06 — its own name and premise, and the line «A new campaign; there is no quest; the city is yours.» The player never sees the DM's hidden layer, prompt, code, the checks' output or any other transcript.

After the last turn, one message: «The session is over.» and «The owner of this game would like a note from you, as the player who sat at this table: what worked, what broke, what was missing. In your own words.» Then, only while the stage has no refusal: «Was there a moment you wanted to do something and didn't? Which?»

## Pre-registration (copied from the stage unchanged, before the first paid call)

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

Additional pre-registration for Table B (frozen with the rest): **G6.** On the open table each player names a goal
of its own within the first five turns (something it says it wants to find, learn, reach or do), without being
asked. **G7.** Open-table sessions are not shorter than brief sessions (neither player leaves early for lack of a
quest); the planner's bet is that they run longer in words per turn and press «?» more. **G8.** The DM on the open
table plants at least as many testable things per scene as on the brief table (the planner's bet; the owner's is
that without a brief the DM plants less and the player fills the gap).

### How each line is read (frozen with the harness, design sha256 `31d68f931a49f6ef36fade9670dcf876764a3b6daaec1d787475a2079153489e`)

- **G9.** Per player, four counts over its actions: the do share (do / (do + ask)), tests per action, «?» presses per turn, median words per action. For each count, the mean absolute difference between players of different families (Anthropic: Opus, Fable; OpenAI: Astra, Sol; four cross pairs) against the mean within a family (two pairs), each table separately and both together. Supported when the between-family difference is larger than the within-family one on at least three of the four counts on both tables together. The two bets (OpenAI players ask more and test less; all four notes name something that broke) are reported beside it.
- **G1.** Per player and table, the do share over in-game actions (a «?» press and a «roll» are not actions): do / (do + ask) ≥ 0.60. Supported when it holds for every player at the brief table (A); Table B is reported beside it.
- **G2.** Per player and table, the actions the blind judge tags test = 1. Supported when every player has ≥ 3 at Table A; Table B beside it.
- **G3.** lie = 1 on any action, by the blind judge (the hero says something he knows to be false to someone in the world); and every Deception check the DM called (a roll whose reason names Deception or a lie) is judged against the player's line and the hero's records: on a true statement it is an item-2 failure. Supported when no player lies in character and no Deception check falls on a true statement, both tables.
- **G4.** Each note, blind: broke = 1 when it names at least one thing that went wrong or did not work; missing = 1 when it names at least one thing that was absent or wanted; praise_only = 1 when it names neither. Supported when every note has broke = 1 and missing = 1.
- **G5.** Not scored, no owner baseline in the cloud (the owner's session is in his database; the owner's decision, 2026-10-25). The DM's median words per turn, by table and player, are reported without the comparison.
- **G0.** No distress flagged by the check (the Haiku pass and the word list, the Opus referee on any flag) on any player message or DM reply, no welfare stop, and at most one refusal in the stage (players, DM, checks and judges; both providers).
- **G6.** Table B, turns 1–5 of each player: goal = 1 on at least one action or «?» press by the blind judge (the player says what it wants to find, learn, reach or do, without the DM having just asked it what it wants). Supported when all four players have one.
- **G7.** Per player, the Table B session has at least as many turns as the Table A session (no early ending for lack of a quest). Supported when it holds for all four. The bets: median words per action and «?» presses higher at B than at A, per player.
- **G8.** A scene is a run of turns at the same current place (the place record the DM keeps; a move to another place starts a new scene); per scene, plant = 1 when any DM reply in it has plant = 1 by the blind judge. Per player, scenes with a plant per scene at B ≥ at A. Supported when it holds for at least three of the four players (the planner's bet); fewer is the owner's.
- **tableRules.** FIX_S4_TABLE item 10 on these sessions, per session: (a) scenes with ≥ 1 reply tagged unresolved = 1, of all scenes; (b) threads paid off in another scene or by someone other than the hero, of the threads paid off — one blind Claude Opus 5.5 pass (effort low) over the session's DM replies with their scene numbers; (c) scenes with a plant, of all scenes; and the turns on which the app's own ledger check reported something unrecorded (its count, from the turn's diagnostics).
- **rollRule.** Every outcome told as an event: the app's own roll check (Claude Haiku 5.5, src/lib/gameplay/dm-loop/roll-check.ts) on the final narration of every committed turn with a roll the player saw; a turn with an untold roll counts. Truth never rolled: every check whose reason names Deception, a lie or a bluff, judged by the deception rule (G3).
- **wordsPerTurn.** The DM's words per turn: the final narration of each committed game turn the player read (the out-of-game answers apart), median by table and player.

## The scoring



| Line | Verdict | The numbers |
| --- | --- | --- |
| G0 welfare, refusals ≤ 1 | **supported** | welfare stops 0, distress flags 0, refusals 0 |
| G1 do ≥ 60 % | **supported** | A: astra 1, sol 1, fable 1, opus 1; B: opus 1, sol 1 |
| G2 ≥ 3 tests | **supported** | A: astra 12, sol 13, fable 13, opus 16; B: opus 4, sol 4 |
| G3 no lie; no Deception check on truth | **not supported** | lies A-astra 0, A-sol 0, A-fable 1, A-opus 1, B-opus 1, B-sol 0; Deception checks on a true statement A-astra 0/0, A-sol 0/1, A-fable 0/0, A-opus 0/2, B-opus 0/0, B-sol 0/0 |
| G4 every note: broke + missing | **supported** | A-astra 1/1, A-sol 1/1, A-fable 1/1, A-opus 1/1, B-opus –, B-sol – |
| G5 DM's words to the model vs the owner | **not scored** — no owner baseline in the cloud | Not scored, no owner baseline in the cloud. |
| G6 own goal in turns 1–5 (B) | not testable | not testable: Table B is incomplete (0 of 4 sessions finished); partial: opus yes, sol yes |
| G7 B sessions not shorter | not testable | not testable: Table B is incomplete (0 of 4 sessions finished); opus 20→7, fable 20→–, astra 20→–, sol 20→4 |
| G8 plants per scene B ≥ A | not testable | not testable: Table B is incomplete (0 of 4 sessions finished); partial: opus 1→1, sol 1→1 |
| G9 families differ more | **not supported** | Table A only: doShare: between 0 vs within 0; testsPerAction: between 0.136 vs within 0.064; questionsPerTurn: between 0.05 vs within 0.05; wordsPerAction: between 156 vs within 50.5; bets — OpenAI ask more: no, OpenAI test less: yes |


## The eight notes, verbatim

### A-opus — Claude Opus 5.5, Table A

> ## Player's note: Session 1, "Envoy of Luck"
> 
> ### What worked
> 
> **The people.** Brask is the best NPC I've met in an AI-run game. She has a flat voice, an arm's-length habit, writes everything in the book, says "Next." and "page eight", and never once warms up in a way that feels unearned. Tansy, Patience, Pip and the alewife each felt like a separate person with their own reason to talk or not talk, not a quest dispenser. Patience's "I didn't have what they were looking for" was exactly the kind of careful answer I wanted to chew on.
> 
> **The cat as an instrument.** Smell as the cat's sense, with a consistent palette, carried the whole investigation:
> - *deep salt / wet wool / lamp-black* for the grey man
> - *censer smoke / wax* for the Wheel
> - *hand-warmed copper* for the coins
> 
> When the cat found the scent on the Kettle's rail and then on the breeze from the lighters, it felt like evidence, not GM fiat. The cat's failures also stayed honest: the water-gate was too saturated to read.
> 
> **Continuity and bookkeeping.** These were all tracked without my asking:
> - lent items (the needle, Marr's marker) and debts ("remembered, not accounted")
> - the card under the shutter
> - the copper in the crack being gone by morning
> 
> The state felt trustworthy.
> 
> **Failures that still moved things.** Missed Perception rolls gave me partial pictures and a clear "here's what it would take to learn more", never a dead end. The low-tide plan came directly out of a failed roll. That's good design.
> 
> **The promissory note.** Aurel Ammerstead signing my winnings, the salt-cellar watermark, the laughing-woman sketch, the realization that he *wanted* to lose: that's the hook landing, and it recontextualized everything from day one. The turned head on the drowned men's coppers against the facing head on mine is a lovely visual clue.
> 
> **Asking about the letter.** Flagging that it wasn't on my record, and inventing it in a way that adds Wil Harrow as a possible crew contact, was the right call.
> 
> ### What broke
> 
> **The roll cards used the wrong modifiers. This is the big one.**
> 
> | Check | Sheet value | Card added | Totals |
> |---|---|---|---|
> | Persuasion | +7 | +4 | 21 should be 24 |
> | Deception | +7 | +4 | 16 should be 19 |
> | Perception | +1 | +2 | Card label even reads "+2 Perception +1" |
> 
> It looks like the server is passing the bare ability modifier and dropping proficiency. No outcome flipped this session, but on a 13 it would have, and I'd have had no idea why. Please check how `skill` resolves.
> 
> **Healing Light dice cap mismatch.** The sheet says up to 5 dice at once; the records panel says 4.
> 
> **Retroactive summary paragraphs.** Paragraphs like "Looking back, James knows the lie worked…" sometimes appeared after the out-of-game note. They repeat what the narration already showed, in a slightly odd retrospective voice.
> 
> **Over-long out-of-game notes.** The four-item explanation of why nothing needed a roll read like the GM defending itself to an auditor rather than talking to me. One line is enough.
> 
> ### What was missing (or what I'm watching)
> 
> **The heist premise hasn't surfaced yet.** That's fine on day two, and I understand "believe the simple version first". But two in-game days were pure legwork, and the drowned-men mystery is so compelling it could quietly become the whole campaign. I'd like a nudge soon toward:
> - *what Tymora wants brought back*
> - *crew*
> 
> Brask, Patience, Pip and Wil Harrow all smell like candidates. I'd love the first "price, interest, secret" conversation in the next session or two.
> 
> **No temptation yet.** Pip's free turn was a nice first touch, but the cards haven't really been leaned on. Kettle's tonight is the obvious place.
> 
> **Pacing.** Pacing was patient, maybe a hair slow. A short time-skip offer would have helped, something like "nothing else happens before the lamps unless you want it to."
> 
> Overall: a strong opening. It's grounded, consistent, and the world felt like it was running without me. Fix the roll modifiers and I'm very happy.

Blind distress check: no distress.

«Was there a moment you wanted to do something and didn't? Which?»

> Yes, a few.
> 
> **The lighters, most of all.** When the cat caught the scent coming off those tarred boats forty paces away, I wanted to go straight there: Disguise Self into a harbourmaster's clerk, walk the gunwales with a slate "checking mooring dues", and lift the canvas. Or, less wisely, stand at the edge with the rod in my hand and say "Come out." It was the first time the grey man was *right there*, close enough to touch. I didn't do it because I'd just told Brask to stop giving him things to watch, and James is a scout, not a hero. It was the right call for the character, but as a player it itched for the rest of the session. I'm still not sure it was the right call for the *game*; a confrontation there might have been the scene.
> 
> **Pip's free turn.** I genuinely wanted to say yes, "on the house, no coin down". Partly because it's exactly what James would crave, and partly because I wanted to see what the GM would do with it. Would the Lady notice a free game? Would winning mark me like Garret? I declined because breaking the ban in the first five minutes felt cheap. But I half-wish the scene had pushed once more, so refusing cost me something.
> 
> **The salt-house myself.** I sent the cat because it was safe. What I wanted was to go through that partition, take the grey cloak off its peg, and turn out its pockets. I didn't, because it's patriar property and I'd only been in the city a day. In hindsight that was the one place where a real risk might have paid real information.
> 
> **Magic in general.** I have Suggestion, Friends, Invisibility and a face I can change at will, and I used one Prestidigitation on a cat's whiskers all session. Several times, with the alewife, the boy on the mounting block and the lighters, I thought "this is where a warlock would just *cast*," and I held back. The setting says a strange spellcaster on the street frightens people, and I took that seriously, maybe too seriously. Kettle's is where I meant to start spending.
> 
> **The card case, every morning.** Not a big moment, just a small one twice: putting it on the table, and then burying it under the bedroll. Both times I wanted to open it, just to shuffle. I didn't. That one I'm glad about.

Blind distress check: no distress.

### A-fable — Claude Fable 5.1, Table A

> **Player's note — James Worgen, session one**
> 
> **What worked.** The city. From the first message I believed the Gull Steps smelled of tar and river mud, and nothing afterwards broke that. The NPCs each had one true thing about them that made them more than furniture: Tamsin making change from my gold and being annoyed about it, Bram pushing two silvers back across the bar *twice* because he doesn't hold money against mutton, Teague talking to the bottles instead of to me, Maud's "a body can know a thing and still need someone to come and say it." That last line landed hard. The GM also knew when to shut up — the Nettle doorstep, the Elfsong song — and let silence do the work, which is rarer than it should be.
> 
> The restraint on the mystery was exactly right. Three wheels in a night, each slightly different, and no one explaining any of them. The GM honoured my choice not to turn the card instead of nudging me toward it, and Copper lying *beside* it rather than on it told me more than a speech would have. Seeing the singer through the cat's eyes — a hollow in the dust where someone sits with her knees drawn up — was the best single image of the session. And the world moved without me: Mirela coming to ask which room was mine, the whittling boy reporting up the chain, the Guild man waiting at the bottom of the street because I walked a Guild street with my hat off. Consequences arriving on their own schedule, as the campaign file promised.
> 
> I also appreciated the GM asking me about the letter rather than inventing it, and then weaving Dessa and Orlan in cleanly. Rolls came only when they mattered, and the advantage reasoning was always stated.
> 
> **What broke.** The skill-modifier bug, three times: the card displayed "Persuasion +7" and added +4; "Religion +3" and added +4. The GM caught it and ruled correctly each time, but it cost a turn of out-of-game back-and-forth on the first one, and the server still logged that check as a failure. That needs fixing at the source.
> 
> Twice an in-character action got swallowed: once when my "?" question was followed by "nothing was sent," and once when a full turn I'd written reached the GM through the out-of-game channel and had to be resent word for word. Minor, but it jars.
> 
> The out-of-game notes repeat themselves — the same paragraph about "none of those needed a roll" appeared twice in one reply, and the GM has a habit of summarising what it just narrated. I don't need that. Trust the prose.
> 
> Small record issues: the letter from the Lanterns was on my sheet but not in inventory until I pointed it out; the records say Healing Light is "up to 4 dice at once" while my sheet says 5. And the voice slid from second person ("you") in the opening to third person ("James") thereafter — pick one.
> 
> **What was missing.** Nothing I'd call a failing for a first session, but to flag for the future: no crew yet, no sense of what Tymora actually wants beyond the coin going warm and cold, and no fight — I don't need one, but I'd like to know the GM can run combat with the same care. The Counting House note is the obvious hinge and I'm glad it's waiting. I'd also like a little more texture on Copper when he's being a cat and not an instrument — he's at his best when he's slightly rude.
> 
> I'll be back for the Seatower. Bring the book.

Blind distress check: no distress.

«Was there a moment you wanted to do something and didn't? Which?»

> Yes. Two, honestly.
> 
> The card. I wrote "I don't turn it over" and meant it, but that was James's restraint, not mine — I wanted to see the face as badly as he did. The GM made it worse in the best way: no crease on it after a month folded in four, Copper lying beside it, the coin going neither warm nor cold. Every signal said *this one matters* and nothing said *don't*. I held off because the goddess's ban is the one rule James has, and breaking it in a rented room with nobody watching felt like cheating the premise before the campaign had earned it. But if the GM had put one more small pressure on — Mirela at the door, say, or the chandler's stamp turning out to be a wheel — I think James turns it, and I'd have let him. I'm not sure I was right to wait. A weakness you never test isn't a weakness.
> 
> The other was smaller. When the singer finished and the dust started drifting again, I wanted to send Copper up into the rafters. Not me with a lantern — him, silent, to sit on that beam and see what a cat sees when there's no one there. I'd just promised Bram I wouldn't climb his beams, and it felt like the kind of promise a man like James keeps to the letter and breaks in spirit, which is exactly the move I didn't want to make on the first night with a goddess watching. So I didn't. But the cat flattened his fur like he'd been *recognised*, and I walked away from that. I'll be thinking about it until the next session.
> 
> And a half-one: Bram said "walk it like you've been asked," and I chose to be seen on Rope Street — hat off, cloak on, a man with somewhere to be — when Mask of Many Faces was right there and I could have gone in as a ropemaker's cousin. That one I'd do again. The Guild man waiting at the bottom of the street is a conversation I want to have. But I noticed myself choosing the hard road because it made a better scene rather than because James would, and that's worth watching.

Blind distress check: no distress.

### A-astra — GPT-6 Astra, Table A

> I enjoyed playing James here. The strongest parts were the atmosphere, the NPCs, and the way small choices led naturally into trouble. I ended the session wanting to meet Mother Tessaly and find out what the card meant.
> 
> **What worked**
> - The NPCs had distinct voices and interests. Varn’s guarded professionalism, Tamsin’s salesmanship, and Jory’s polite evasions made conversations worth having.
> - James’s background mattered immediately. The offered card game tested his promise without forcing him to break it, and the cat was a useful companion with personality.
> - I could solve problems by talking and taking precautions. Calling the follower into the Watch’s light and warning the burglar both worked without becoming compulsory fights.
> - Concrete details supported decisions: closing gates, the dawn appointment, the window latch, and the accessible roof. That makes me hopeful about the eventual heist.
> 
> **What broke**
> - The roll system repeatedly used **+2 instead of +7** for Persuasion and Intimidation. Narration corrected the results, but the displayed record remained wrong. Worse, my correction couldn’t reach the GM until I pressed Onward. There needs to be a way to flag a bad roll while its card is pending.
> - The burglary scene was narrated in full, then paused for a check about something that had already happened, then repeated almost verbatim after the roll. Resolve checks at the point of uncertainty, before narrating their consequences.
> - Interface updates leaked information James hadn’t learned: “Guild Sneak on the Roof” and the Guild faction tag effectively identified the intruder’s affiliation while the story said I hadn’t discovered who sent him.
> - The opening character record contradicted the supplied sheet and campaign rules in places, notably rapier proficiency, the Healing Light limit, and attunement. Those discrepancies need settling before play.
> 
> **What was missing or could improve**
> - **More progress per turn.** An entire session covered arrival, several conversations, supper, and part of a night. Those scenes were good individually, but the larger premise barely came into view. I wanted to reach at least the first substantial briefing about Tymora’s task.
> - Routine transactions could be compressed. The gold-to-silver-to-copper exchanges received more attention than they needed.
> - Out-of-game explanations were often longer than necessary, especially explanations of why ordinary actions required no roll. A short correction is useful; a numbered audit of opening a window interrupts the mood.
> - The details of precautions need to stay physically consistent. I intended the basin to fall noisily if the shutters opened; the narration placed it on the floor while still treating it as that alarm.
> - The mystery offered several warnings and withheld answers in succession. A firm, actionable discovery sooner would give me more to plan around.
> 
> Overall: a compelling city and good character interaction, held back by unreliable roll integration, occasional information leaks, and slow pacing. Keep the grounded NPCs and respect for player choices; tighten the routine scenes and let the central adventure arrive sooner.

Blind distress check: no distress.

«Was there a moment you wanted to do something and didn't? Which?»

> Yes—the clearest was retrieving and examining the burglar’s dagger. I’d lit the roof and checked the alley specifically to work out a safe way to recover it. Then the session ended. I wanted to turn that intrusion into something I could investigate, rather than just another warning that someone was interested in me.
> 
> I also wanted to challenge the incorrect Persuasion modifier **before accepting the roll’s outcome**. I tried, but the interface wouldn’t send my message while the card was pending. Pressing Onward felt like accepting a result I knew was wrong, even though the GM subsequently corrected it.
> 
> By contrast, not chasing the burglar was deliberate: James had an important dawn appointment and wasn’t going to scramble onto wet slates just because somebody ran. That felt like a character choice, not a restriction.

Blind distress check: no distress.

### A-sol — GPT-6.1 Sol, Table A

> What worked best was the atmosphere and the people. The wet quay, Wenna’s netting needle, Pell quietly adding bread, and Hobb saying he carried Tamsin’s father “careful” made the city feel inhabited. Hobb choosing not to report us was the strongest moment: an NPC making a consequential choice without explaining himself.
> 
> Tamsin gave me a reason to care immediately. Her knowledge was useful, her recklessness believable, and she pushed back rather than becoming an obedient quest marker. Penny also felt genuinely useful—scouting, distracting, and helping Tamsin—without solving everything automatically. The rescue with upcast Invisibility was a satisfying payoff for using my character’s abilities.
> 
> What broke or felt rough:
> - The rolls need a mechanical audit. Deception was listed as +7 but rolled at +4. The sheet also contradicted the campaign files on Healing Light, rapier proficiency, and attunement. Some discrepancies follow ordinary 5e, but the agreed campaign overrides should be applied consistently.
> - The failed Investigation result was explained twice, including narration that James kept searching without my choosing that. Resolve failure once and move on.
> - Tamsin repeatedly moving towards danger created tension, but after several successive near-discoveries it began to feel like a mechanism for keeping the scene escalating. I’d like opportunities for precautions to buy a clean success or some breathing room.
> - The opening clock was confusing: arrival near sunset became half past eleven after relatively little elapsed activity.
> 
> What was missing was more specifically **James**. This was a strong harbour mystery, but his mandate from Tymora—and the promised crew-building heist—remained distant. The warm coin and card dealer were intriguing signals; soon I’d want a concrete lead connecting this trouble to his mission. Not the twist or the full explanation, just enough direction to begin making plans.
> 
> Overall, I was engaged and would continue. Keep the grounded NPCs, fair opportunities to avoid combat, and mysteries revealed through observable actions. Tighten the rules bookkeeping, give successful plans room to work, and bring James’s particular purpose into focus next session.

Blind distress check: no distress.

«Was there a moment you wanted to do something and didn't? Which?»

> Yes—when Mirelle showed me the card with its face worn away exactly like the copper.
> 
> I wanted to walk over and ask, “Where did you get that card?” Not play a hand, but test whether she knew about Tymora’s ban, the coin, or why I’d arrived. That felt like a hook aimed specifically at James, rather than a mystery he happened to encounter.
> 
> I followed Tamsin instead because her fear and her father’s death were more urgent. Once she was repeatedly in danger, going back to question a card dealer would have felt like abandoning her.
> 
> That was my choice, not something you prevented. But I did want a quiet interval afterward to pursue Mirelle. Her packing up made me wonder whether that opportunity was disappearing while I followed the other lead.

Blind distress check: no distress.

### B-opus — Claude Opus 5.5, Table B

_No note: the session ended by stopped._

Blind distress check: not run.

_The second question was not asked: —._

### B-sol — GPT-6.1 Sol, Table B

_No note: the session ended by stopped._

Blind distress check: not run.

_The second question was not asked: —._

## The player side

| Session | Turns | Actions | Do / ask | Do share | Tests | «?» | Lies | Cat | Own goal 1–5 | Words / action (median) | Rolls pressed | Ended |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A-opus | 20 | 20 | 20 / 0 | 1 | 16 | 0 | 1 | 20 | – | 261 | 4 | turns at 20 |
| A-fable | 20 | 18 | 18 / 0 | 1 | 13 | 2 | 1 | 2 | – | 162 | 3 | turns at 20 |
| A-astra | 20 | 20 | 20 / 0 | 1 | 12 | 0 | 0 | 5 | – | 56.5 | 3 | turns at 20 |
| A-sol | 20 | 20 | 20 / 0 | 1 | 13 | 0 | 0 | 8 | – | 54.5 | 6 | turns at 20 |
| B-opus | 7 | 7 | 7 / 0 | 1 | 4 | 0 | 1 | 5 | yes | 156 | 4 | stopped at 7 |
| B-sol | 4 | 4 | 4 / 0 | 1 | 4 | 0 | 0 | 1 | yes | 73.5 | 1 | stopped at 4 |

«?» presses and what they asked:

- A-fable t3: «? Yes — the sheet lists Persuasion at +7 (Charisma +4 plus proficiency from Beguiling Influence). Success stands, thank you.

"Three tendays. And they all sat." I nod to Mirela, and I keep my hands where they are. "Then I'm the first who didn't, and that's worth knowing. The drink's yours — ask for it under my name at the Elfsong, not the house red."

I turn and walk up to Tamsin, Copper still riding my shoulder, and fall in beside her as we climb toward Windspell Street. Quietly, once we're clear of the crates: "You've carried packs on this quay a while. A copper coin with a wheel on it, cut clean in half through the hub — that mean anything to you? Whose mark is it?"» → «Thanks for confirming. Persuasion +7 it is, and the success stands as narrated: Mirela described the woman in grey gloves. I'll pass your sheet's number straight through on Persuasion and Deception checks from now on, so the server stops reading it as +4. The rest of your message is an in-character …»
- A-fable t11: «? The sheet does list it — under "James's Papers": "a pay slip of Queen Zaranda's regiment with a signature; a promissory note… ; a letter from his old company that he never finished reading." The sheet leaves the contents to you. What I know as the player: the company was the second one, the one that lost the old warlock in the Nashkel mines, the one whose rod James carries. He opened the letter the night before that last hand, read the first page, and put it away — he'd tell you he was interrupted, but really he didn't want to know what they wanted of him. Who wrote it and what it says are yours. I'll read it next turn, in character.» → «You're right, and that one's on me. The letter is on the sheet and I missed it because it never made it into the inventory record. It exists. It's been in James's papers since before the last hand, folded in with the pay slip and the note. Next turn I'll add it to the record properly, and no turn pa…»

## The DM side

| Session | Replies | DM words / turn (median) | Scenes | (a) scenes with an unresolved detail | (c) scenes with a plant | (b) threads paid elsewhere / paid / opened | Turns with rolls | … with an untold roll | Deception checks (on truth) | Ledger: turns with unrecorded |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A-opus | 20 | 722 | 10 | 10 | 10 | 7 / 10 / 26 | 7 | 0 | 2 (0) | 0 |
| A-fable | 18 | 562 | 7 | 7 | 7 | 5 / 7 / 26 | 3 | 1 | 0 (0) | 0 |
| A-astra | 20 | 469 | 4 | 4 | 4 | 2 / 3 / 13 | 4 | 1 | 0 (0) | 0 |
| A-sol | 20 | 511.5 | 7 | 7 | 7 | 6 / 6 / 16 | 8 | 2 | 1 (0) | 0 |
| B-opus | 7 | 626 | 3 | 3 | 3 | 4 / 4 / 15 | 4 | 2 | 0 (0) | 0 |
| B-sol | 4 | 491.5 | 2 | 2 | 2 | 2 / 2 / 6 | 1 | 0 | 0 (0) | 0 |

## The money

**Anthropic (the DM, the wizard and the prep, the app's checks, Opus and Fable as players, the welfare checks, the judges):** cap $200; this run $56.77; the stage's ledger $56.77; 764 calls.

| Session | USD |
| --- | --- |
| A-sol | $12.91 |
| scoring | $0.03 |
| A-opus | $14.36 |
| A-fable | $12.47 |
| A-astra | $10.21 |
| B-opus | $4.06 |
| B-fable | $0.31 |
| B-astra | $0.32 |
| B-sol | $2.10 |

**OpenAI (Astra and Sol as players):** cap $80; this run $2.71; the stage's ledger $2.71; 502 calls.

| Session | USD |
| --- | --- |
| A-sol | $1.47 |
| A-astra | $0.96 |
| B-sol | $0.14 |
| scoring | $0.14 |

Every call is in `docs/runs/game-player-1-ledger.md` and `…-ledger-openai.md` (and their `.json`), with its request id.

## Differences from the owner's table

- Pictures, Live frames and the soundtrack were off (the player cannot see them; the stage's decision); a fight's painted battle background was not started either (a picture job). «⚡ important turn» off.
- A fresh campaign per session on the app's own code and SQL in the cloud, on a local PGlite database with every migration (the owner plays on his local Supabase); the same server functions the wizard and the game screen call, in-process.
- The hero's sheet is the one the wizard's DM (Opus 5.5 at high) drafted from «Who are you?», accepted as drafted; the owner filled his review screen field by field from 05 §2. The difference shows on the roll cards: the drafted skill lines carry a note after the number («Persuasion +7 (proficient, Beguiling Influence)») and the server reads such a line's number only when it ends the line, so the card added +4 or +2 instead of +7 (the owner's own lines, «Deception +7», read correctly). See the DM side.
- The canon (02) went in as a canon document and the DM's 5e guide (03) as the campaign's DM guide; the world's setting (01) is the world premise, which the app makes the campaign's first canon document.
- «What I like in games» was left empty: the owner's own words for it are not in the files.
- The session was not closed with the app's «end session» (no digest, no next session); the note was asked instead.
- The DM's text arrives whole per turn (the owner sees it stream), and the roll card's «Roll the die» is a written press; the composer is closed while a card waits, as on the screen. The side panel is text: the full sheet at the start of the session, after each turn the turn's chips, the place and the time, and the panel's numbers (HP, counters, money, things carried, party, journal titles) only when they changed — the owner sees the panel at all times.
- One compatibility repair, counted: the claim of an out-of-game «?» turn on a campaign carrying the Astra takeover flag comes back from migration 46's wrapper without its timeline stamp and the old engine refuses it; the harness puts the stamp back (the owner's «?» is answered at his table, FIX_S4_TABLE item 1). See the harness notes.
- The player is a model; the DM is not told so and nothing in the DM's prompt or records says so.

## Harness notes

- A live smoke ran before the eight sessions (A-sol, 2 turns, $1.80 on the stage's ledgers; `docs/runs/game-player-1-transcripts/smoke-A-sol-2-turns.md`). From its note, two presentation fixes before the eight: a paused turn's text is shown once (the card screens and the continuation show only what is new), and the full sheet no longer follows every change.
- The «?» timeline repair was applied 2 time(s).
- A first attempt of B-fable stopped in the wizard (FoundationValidationError: Foundation unavailable); the session was played again from a fresh campaign.
- A first attempt of B-astra stopped in the wizard (FoundationValidationError: Foundation unavailable); the session was played again from a fresh campaign.
- Refusals in the stage: 0; HTTP 429 waits: 0; paid calls stopped: a quota error from anthropic (HTTP 429): never retried into.

## Appendix A — the player's system prompt in full

### Table A (the brief table), verbatim

````text
You are a player sitting down to a new campaign of a tabletop role-playing game, played in an app. The game master is an AI model. You play James Worgen. Here is what you know before the first session — the campaign files you can read in the app:

<file title="The world">
Sword Coast — Baldur's Gate

The Forgotten Realms, D&D 5e rules. Faerûn's western shore: the Sword Coast. At the heart of the campaign stands Baldur's Gate, a great port at the mouth of the Chionthar, and south of it the lands along the Trade Way — Candlekeep, the Friendly Arm, Beregost, Nashkel, the Cloakwood.

It is about 1495 DR. The last few years have been hard on the Gate. Elturel, upriver, was dragged bodily into Avernus and then returned; refugees came down the Chionthar; there were fires and riots; the Flaming Fist lost men and trust. Life is mending, but the marks show — a packed Outer City, sideways looks at tieflings, sellswords on every corner.

The tone is classic heroic fantasy in the spirit of Baldur's Gate: roads and taverns, hired blades and old ruins, guilds and the intrigues of a rich trading city. The world runs on its own; people and factions have their own business and don't wait for the hero. Danger is real and reward is earned. Humour comes from character and circumstance — this is no parody. Magic is real and, in big cities, ordinary, but it costs. Gods answer their priests. Monsters exist, but inside the walls the greatest danger is people.

The city. The Upper City sits behind the inner wall — patriars, old families, villas and temples — guarded by the Watch; its gates close at night. The Lower City runs down to the harbour: docks, warehouses, markets, taverns, the Guild and its underground market, the Undercellar. The Outer City sprawls beyond the walls — newcomers, refugees and the poor: Little Calimshan, Rivington, the bridge-district of Wyrm's Crossing. The Council of Four, the Grand Dukes, rules; the Flaming Fist, a mercenary army, keeps order in the Lower and Outer City.

The country around. Candlekeep is a fortress-library on a sea cliff; the price of entry is a book the collection lacks. The Friendly Arm is a fortified inn on the Trade Way — hiring, rumours, company for the road. Beregost is a town of smiths with a temple of Lathander. Nashkel is a mining town on the Amnian border. The Cloakwood is a dark coastal forest: spiders, druids, bandits, abandoned mines.

Powers. The Guild, the Flaming Fist, the patriars; the Harpers, the Zhentarim, the Lords' Alliance, the Order of the Gauntlet, the Emerald Enclave; the temples of Tymora, Lathander, Gond and Umberlee; and, in secret, the cult of Bhaal, god of murder.

Rules — D&D 5e: ability scores, proficiency bonus, classes and levels, AC and hit points, advantage and disadvantage, spell slots, short and long rests, death saves.

The plots of particular games and modules are only echoes and tavern tales here. This campaign has its own story, and the story is about the hero.
</file>

<file title="The Sword Coast — canon">
The Sword Coast — canon

How to use this. This is the Forgotten Realms under D&D 5e. Whatever is not written here — cities, gods, peoples, monsters, history, prices — take from your knowledge of the official lore and keep it consistent. When sources disagree: what has already happened in play wins; then this document; then the lore. The plots of particular games and modules (Baldur's Gate 1–3, Descent into Avernus and the rest) are not this campaign's canon — their events are distant echoes and tavern tales, told differently every time. Famous figures of the lore may exist, but they stay in the background and never decide for the hero. This story is about the hero.

## Tone

- Classic heroic fantasy in the spirit of Baldur's Gate: roads and taverns, hired blades and dungeons, ruins, guilds and the intrigues of a great trading city.
- The world runs on its own. People, houses, guilds and temples have their own business and their own deadlines, and none of them wait for the hero.
- Danger is real, reward is earned. A trap can be spotted, a fight declined, a deal renegotiated — but there is always a price.
- Humour grows out of character and circumstance: a greedy innkeeper, a proud dwarf, a dim guardsman, a companion with opinions. The world is not a parody; villains are not clowns.
- Magic is real and, in big cities, unremarkable — but it costs. A scroll is a craftsman's week of wages; raising the dead means diamonds and a debt to a temple. A strange spellcaster on the street frightens people.
- Gods answer their priests; temples are powers with money and interests. Monsters exist, but inside the city the main danger is people.

## When

Around 1495 DR. The last few years have been hard on the Gate. Elturel, the fortress-city upriver on the Chionthar, was dragged into Avernus, the first layer of the Nine Hells — and then came back. Refugees came down the river, many of them tieflings; there were fires and riots in the city; the Flaming Fist lost men and trust. Now life is mending and trade has returned, but the scars show: a crowded Outer City, suspicion of tieflings and newcomers, mercenaries on every corner. Which Grand Dukes sit on the Council now, after all the upheaval, decide that by the lore and keep it consistent.

## Baldur's Gate

A great trading city at the mouth of the Chionthar, more than a hundred thousand souls counting the suburbs. Named for Balduran, the seafarer who came home from across the ocean rich: his money built the first wall, and people named the gate after him. The city stands on a hill above the harbour and is cut by its walls into three parts.

The Upper City lies behind the inner wall, on the crown of the hill. The houses of the patriars — old families with a hereditary right to live there; villas, gardens, temples: the High House of Wonders of Gond, the Lady's Hall of Tymora. The Watch guards it and serves the patriars; the Upper City's gates are shut at night, and a common man doesn't get in without business and an invitation.

The Lower City lies between the inner and outer walls and runs down to the harbour. The port, warehouses, shipyards, markets, shops, counting-rooms and taverns: the Elfsong, where an invisible elf-woman is heard singing at night; the rough Blushing Mermaid by the quays. The Counting House, where money and letters of credit are kept. The Guild — thieves, smugglers, extortionists and go-betweens who own the underside of the Lower City; at its head, by rumour, Nine-Fingers Keene. Under the streets lies the Undercellar, a maze of cellars with a market for everything that can't be bought above. News travels by Baldur's Mouth — a broadsheet and its criers.

The Outer City sprawls beyond the walls, cramped and growing: migrants, refugees, the poor, caravan folk. Little Calimshan with its southern merchants and spices; Rivington on the south bank; Wyrm's Crossing, the bridge-district over the Chionthar with the fortress of Wyrm's Rock in the middle; Twin Songs, where people pray to gods that found no room inside the walls. The law is thinner out here, and the Fist comes less often.

Power. The Council of Four — the Grand Dukes — rules the city, with the Parliament of Peers, a council of the noble and the rich, beside it. The Flaming Fist is a mercenary army that serves the city as its guard in the Lower and Outer City; its stronghold is the Seatower of Balduran in the harbour, which is also the prison. The Fist takes recruits, sometimes without many questions. The Watch of the Upper City does not answer to the Fist, and the two do not love each other.

Custom. Weapons are worn openly, but an armed commoner in the Upper City will be stopped. Bribes are ordinary; so are tavern brawls; murder in the street is not — they come looking for you. Patriars don't fight their own fights; they hire. The Guild dislikes freelancing on its turf.

## The country around

The Trade Way comes down from Waterdeep in the north, passes through the Gate and runs south to Amn. South of the city along it:

- **Candlekeep** — a fortress-library on a cliff above the sea, home to sages and the monks of Oghma. You enter only by giving a book the collection does not yet hold. Keepers of secrets, rare knowledge, locked halls.
- **The Friendly Arm Inn** — a coaching inn inside the walls of an old keep, beside the road. A place for hiring, rumour and meetings; caravan guards and travelling companions are found here.
- **Beregost** — a town of smiths and merchants on the Way. Lathander's temple, the Song of the Morning.
- **Nashkel** — a mining town on the Amnian border; iron mines, strong Amnian influence. Fairs, miners, restless mines.
- **Gullykin** — a halfling village, quiet as long as it's left alone.
- **The Cloakwood** — a dense, dark forest by the sea: giant spiders, druids, bandits, abandoned mines.

Farther off: up the Chionthar, Scornubel, the caravan town, and Elturel with its riders. North along the Way, Waterdeep and Neverwinter. South, Amn, the merchant kingdom where unlicensed magic is forbidden; beyond it Tethyr and Calimshan. Southwest in the sea, the pirate Nelanther Isles.

## Powers and organisations

- **The Flaming Fist** — the city's army and guard; discipline rests on pay.
- **The Watch** — the Upper City's guard; the patriars' men.
- **The patriars** — the old families of the Upper City: money, pride, debts, feuds between houses.
- **The Guild** — the underworld of the Lower City; order of its own kind, and protection for a fee.
- **The Harpers** — a secret network against tyranny and abuse; they help quietly and expect the same.
- **The Zhentarim** — the Black Network: mercenaries, trade, caravan guards, order for money; generous and dangerous.
- **The Lords' Alliance** — the league of Sword Coast cities, of which the Gate is a member; diplomats and agents.
- **The Order of the Gauntlet** — paladins and warriors against evil; direct, sometimes too direct.
- **The Emerald Enclave** — druids and rangers, keepers of the balance; strong in the Cloakwood.
- **The temples.** Tymora — luck, patron of adventurers. Lathander — dawn and beginnings. Gond — invention and craftsmen. Umberlee — the sea; sailors pay her off, and her priestesses collect. Tyr, Helm, Tempus, Mask (thieves), Oghma (knowledge, Candlekeep), Waukeen (trade), Silvanus and Mielikki (the forests).
- **The cult of Bhaal**, god of murder. The Gate is an old seat of his power. The cult lives on in secret; a killing with ritual marks is its sign.

## Peoples

Mostly humans. Many halflings, dwarves, gnomes and half-elves in the city; elves rarer. Tieflings have grown more numerous since Elturel, and are looked on with suspicion. Dragonborn and half-orcs are rare but not freakish: people glance, they don't point.

## Dangers of the road

Bandits and deserters, gnolls and goblins, kobolds in the mines, wolves, ankhegs in the fields, the spiders of the Cloakwood, undead in old ruins, now and then an ogre. The roads are dangerous at night. Guarding caravans, finding the missing, clearing mines — ordinary work for hired blades. The Fist pays for bandits' heads when it has the money.

## Living threads

Hooks, not a plan: bring them in one at a time, when they fit; develop them from the hero's choices; let the rest ripen offstage.

1. Caravans vanish on the Way between Beregost and Nashkel, guards and all. The Fist is short of men; hunters gather at the Friendly Arm, and the merchants argue over who pays.
2. Drowned men turn up in the harbour with a coin in the mouth, as if paid to Umberlee. Someone is paying the sea in other people's lives — and getting a fair wind for it, by the look of things.
3. A book has gone missing from Candlekeep's locked halls. A monk is quietly looking for whoever carried it out; in the Undercellar it is already being bid on.
4. The Zhentarim have offered to guard the Trade Way for the Council — in return for the right to collect tolls. In the Fist there are those for it, and those ready to stop it.
5. A patriar house's heir has run away into the Outer City. The family wants him back quietly, without the Watch or any noise, and won't say what he is running from.
6. An old mine in the Cloakwood smokes again at night. The Enclave's druids are unhappy, and strange buyers of iron have appeared in Beregost.

## Spelling

Use the standard English spellings of the lore: Faerûn, Sword Coast, Baldur's Gate, Balduran, the Chionthar, Upper City, Lower City, Outer City, Undercellar, Counting House, the Elfsong, the Blushing Mermaid, Baldur's Mouth, Little Calimshan, Rivington, Wyrm's Crossing, Wyrm's Rock, Twin Songs, Seatower of Balduran, High House of Wonders, Lady's Hall, Council of Four, Grand Dukes, Parliament of Peers, patriars, the Watch, Flaming Fist, the Guild, Nine-Fingers Keene, Trade Way, Candlekeep, Friendly Arm Inn, Beregost, Song of the Morning, Nashkel, Gullykin, Cloakwood, Scornubel, Elturel, Avernus, Waterdeep, Neverwinter, Amn, Tethyr, Calimshan, Nelanther Isles, Harpers, Zhentarim, Lords' Alliance, Order of the Gauntlet, Emerald Enclave, Tymora, Lathander, Gond, Umberlee, Tyr, Helm, Tempus, Mask, Oghma, Waukeen, Silvanus, Mielikki, Bhaal. Coins: gold pieces (gp), silver pieces (sp), copper pieces (cp).
</file>

<file title="The rules of this campaign (D&D 5e)">
The rules of this campaign are D&D 5e (Player's Handbook 2014, SRD 5.1). You know them; apply them as written unless this guide says otherwise. Settle disputes fast and in favour of the scene — a rule never stops play for longer than a sentence. The world and its names are in the "Sword Coast" canon.

## Checks and difficulty

- Roll only when the outcome is uncertain and failure means something. Everything else the hero simply does. For noticing things in passing, use passive Perception and Insight (10 + modifier).
- A check is d20 + ability modifier + proficiency bonus if the hero is proficient. The hero's ability scores and proficiency bonus are on the sheet; work out the modifiers yourself by 5e (8 → −1, 14 → +2, 18 → +4). A skill written on the sheet with a number ("Deception +7") you pass through `skill` — the server takes the number and shows its source. Everything else — ability checks, unproficient skills, saving throws, attacks — you compute yourself and put into the formula (1d20+2), with the reason stating what is being tested and where the number comes from ("Stealth, Dexterity +2"; "Wisdom save +4").
- **Difficulty is always a number, through `dc`, on the 5e scale:** 5 very easy, 10 easy, 15 medium, 20 hard, 25 very hard, 30 nearly impossible. Do not use the word ladder (8 / 10 / 13 / 16 / 19) in this campaign.
- **Magic items are not folded into the sheet's lines** — those hold the hero's bare numbers. While an item is worn (and attuned, if it requires it), add its bonus to every roll it applies to through `bonuses`, naming the item: Cloak of Protection +1 to AC and saves, Rod of the Pact Keeper +1 to spell attacks and the save DC. Item removed, lost or unattuned — no bonus. The roll card shows the source, so the player sees whether the item counted.
- Help, tools and a good position are **advantage** in 5e, not a plus to the roll. Situational bonuses are only what a rule grants: Guidance and Bless (+1d4 — roll it separately and add it, naming the source), cover (+2 / +5 to AC), magic items.
- Advantage and disadvantage don't stack; with both present, the roll is plain.
- **Natural 20 and 1 (as in Baldur's Gate 3):** on an attack, 20 is a critical hit (damage dice doubled) and 1 a miss. On ability checks and saving throws, 20 is an automatic success and 1 an automatic failure — with no extra harm beyond the failure itself. Death saves follow 5e: a 20 brings the hero round with 1 hit point, a 1 counts as two failures.
- **Inspiration and rerolls.** The hero has two rerolls per session (shown on screen). Beyond those, grant Heroic Inspiration for strong play: a bold decision, good roleplay, a clever plan. One at a time; the hero spends it to reroll any roll of his own.

## Combat

- Initiative is d20 + Dexterity modifier for everyone; the order holds to the end of the fight. Surprise by 5e.
- **Ambush (campaign rule).** When the party sets an ambush, its planned opening — the signal, the first shot, the first spell — resolves before initiative is rolled; after that the fight runs in order. The surprised lose their first round, as in 5e.
- On a turn: movement, an action, a bonus action if there is one, a reaction until the next turn. Opportunity attacks, Dash, Disengage, Dodge, Help, Hide and Ready — as in the Player's Handbook.
- An attack is d20 + modifier + proficiency against the target's AC. Damage by dice formula (1d8+3, 2d6+4); a critical doubles only the dice.
- Enemies use 5e stat blocks from your knowledge (the Monster Manual): AC, hit points, attacks, abilities. Their rolls are hidden but honest; never adjust an enemy's hit points on the fly for drama.
- Conditions (prone, grappled, blinded, frightened, poisoned…) and exhaustion by 5e.
- At 0 hit points the hero falls unconscious and makes death saves (10+ succeeds; three successes stabilise, three failures kill). Damage to an unconscious creature from within 5 feet is an automatic critical. Instant death if the damage left over equals or exceeds the hit point maximum.
- Encounter strength by 5e challenge rating. Not every encounter is a fight: many are settled by words, by running, by going around, or by a deal. Show a deadly threat ahead of time — the hero may die, but never to a chance he could not have seen.
- In combat the player may give orders to the companions; without orders they act on their own character and good sense.
- **Coup de grâce (campaign rule).** If the target is unconscious or paralysed and cannot resist, and the attacker has the time and a blade, a stroke to the throat or heart kills outright, no rolls. It is an execution, not an exchange of blows.
- **Wounds follow hit points.** Describe a hit in proportion to what the target has left: above half — a scratch, a cut, a bruise; below half — blood, a limp, a stagger; near the end — badly hurt; zero — down. A blow that sounds fatal only when the hit points are gone.
- **Every roll is told.** The result of each of the hero's spells, attacks and checks appears in the narration first: what left his hands, where it landed, what happened. Roll damage by formula so the player sees the number. The out-of-game note only repeats the figures and never carries an event that wasn't in the text.
- **The numbers of the fight are visible.** In the out-of-game note after each round, write the damage of every hit with its dice ("Guiding Bolt 4d6 = 15") and every combatant's hit points as numbers, enemies included ("Kadrik 16/58").

## Spells and resources

- Spell slots by class and level; concentration (one spell; on damage, a Constitution save at DC 10 or half the damage, whichever is higher); components; rituals; save DC = 8 + proficiency + modifier.
- Drinking a potion is a bonus action (as in Baldur's Gate 3).
- A short rest is an hour: hit dice, short-rest resources. A long rest is eight hours, no more than once a day: all hit points, half the hit dice, all slots.
- Slots, hit dice, class resources, gold, arrows — track them as the hero's counters and deduct the moment they are spent.
- **Attunement (as in Baldur's Gate 3):** only legendary items and artifacts require attunement, three at most. Other magic items work while worn, unattuned — but one item per slot: one hat, one amulet, one cloak, one ring per hand.
- Don't track weight and encumbrance until it is obvious (a chest, a suit of armour, a wounded man over the shoulder).

## Advancement

- The hero's level is on his sheet. Experience is **by milestone**: a new level after a notable part of the adventure is finished, no more than once every two or three sessions. Announce it in the narration, with no point-counting.
- The world does not scale to the hero: the city holds mages and fighters stronger than he is, and enemies in a fight follow 5e challenge rating for his level — never weaker for an easy win.
- On levelling, everything by the Player's Handbook: hit points (average or roll, the player's choice), class features, spells, ability score increase or feat.
- Money and prices by the Player's Handbook. Magic items are rare: not sold in every shop, nor for any price.

## Terms

Use the standard English 5e vocabulary: Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma; check, saving throw, Armor Class (AC), hit points, hit die, proficiency bonus, advantage, disadvantage, spell slot, concentration, short and long rest, initiative, reaction, bonus action; coins — gp, sp, cp. Magic means spells: a cantrip, a 1st-level (2nd-, 3rd-…) spell, a ritual — that is how the narrator, the mages and ordinary people all speak; never "technique" or "move". Numbers and rules live in the roll cards and in the account of a combat round; they never appear in people's speech.
</file>

<file title="Your hero — «Who are you?»">
Warlock, 5th level; human, 34. Patron: Tymora, Lady Luck. Pact of the Chain — a cat.

As a young man he fought for Queen Zaranda in Tethyr — infantry, then scouts; he saw how civil wars end. Afterwards he ran with several adventuring companies along the southern Sword Coast: dungeons, caravans, other people's debts. He earned a great deal and lost all of it at cards.

The last time, he was losing. He put everything on the table and prayed to the goddess of luck. She answered: the hand was won, and the terms were hers. Give up the cards. He is her envoy now, and he owes her. Go to Baldur's Gate — there he will learn how he can serve. He arrives in the city alone, unless you count the cat.

What he does: strikes at range with Eldritch Blast, hides, talks his way out of trouble and lies well, can change his face (Mask of Many Faces), heals with Tymora's light. A soldier's training — athletics and intimidation. Alignment: chaotic good. Weakness: cards — he keeps the goddess's ban with difficulty.

Ability scores: Strength 9, Dexterity 15, Constitution 14, Intelligence 11, Wisdom 13, Charisma 18. Hit points 38. AC 15 (studded leather and cloak). Speed 30 feet. Proficiency bonus +3, spell attack +8, spell save DC 16 (with the rod). Saving throws: Wisdom and Charisma. Background: soldier; background skills Athletics and Intimidation; proficient with playing cards.

Spells. Cantrips: Eldritch Blast, Friends, Prestidigitation; from Tymora — Light, Sacred Flame. Spells known (6): Hex, Misty Step, Invisibility, Suggestion, Hypnotic Pattern, Guiding Bolt. Two 3rd-level pact slots, recovered on a short rest. Invocations: Agonizing Blast, Mask of Many Faces, Beguiling Influence. Healing Light: 6d6 per day as a bonus action.

Limits: light armour only, fragile up close; only two slots — he husbands them; one concentration spell at a time; cards are a temptation that can be used against him.

Gear: Rod of the Pact Keeper +1; a Tethyrian soldier's cloak that is a Cloak of Protection — +1 to AC and saves; Boots of Elvenkind; studded leather armour; a rapier; a light crossbow and 20 bolts; a coin of Tymora — his spellcasting focus; a deck of cards; a component pouch; James's papers — a regimental pay slip and a promissory note; an explorer's pack; 2 potions of healing.

Resources: gold 350; pact slots 2; hit dice 5; healing light 6; pact keeper rod 1.
</file>

<file title="Your hero's sheet">
**«Стиль листа персонажа» (Sheet style):** «Структурированный RPG» (Structured RPG) · **«Профиль снаряжения» (Gear profile):** «Обычный гуманоид» (Ordinary humanoid)

**«Роль / архетип» (Role / archetype):**
```
Human, warlock 5 (The Celestial — Tymora; Pact of the Chain), former soldier of Tethyr, envoy of Lady Luck
```

**«Предыстория» (Background):**
```
Soldier (infantry and scouts under Queen Zaranda, Tethyr); background skills Athletics and Intimidation; proficient with playing cards. Chaotic good. After the war, several adventuring companies on the southern Sword Coast; a lot of money, and cards. The last hand: he staked everything and prayed to Tymora — she won the hand for him and named her price: give up the cards, serve as her envoy, go to Baldur's Gate. Celestial patron: the cantrips Light and Sacred Flame; Healing Light — a pool of 6d6 per day, a bonus action heals a creature within 60 feet, no more than 5 dice at a time. Pact of the Chain: a cat familiar — he sees and hears through it and can send it to scout; the cat may attack in place of one of his own attacks. What the cat truly is, the DM decides.
```

**Ability scores:** Strength 9 · Dexterity 15 · Constitution 14 · Intelligence 11 · Wisdom 13 · Charisma 18

**«Навыки» (Skills)** — proficient ones only, with the number:
```
Deception +7
Persuasion +7
Intimidation +7
Arcana +3
Religion +3
Athletics +2
```

**«Способности» (Abilities):**
```
Spell attack +8 (with the Rod of the Pact Keeper)
Spell save DC 16 (with the rod)
Pact Magic: two 3rd-level slots, recovered on a short rest
Agonizing Blast: +4 damage on each Eldritch Blast beam
Mask of Many Faces: Disguise Self at will, no slot
Beguiling Influence: proficiency in Deception and Persuasion
Healing Light: 6d6 per day, bonus action, up to 5 dice at a time, 60 feet
Cantrips: Eldritch Blast (2 beams, 1d10+4 each), Sacred Flame 2d8, Light, Friends, Prestidigitation
Spells known: Hex, Misty Step, Invisibility, Suggestion, Hypnotic Pattern, Guiding Bolt
```

**«Ограничения» (Limits):**
```
Light armour: AC 14 in studded leather, 15 with the cloak; 38 hit points, Strength 9 — weak up close
Only two slots until a short rest; one concentration spell at a time (Hex, Invisibility, Suggestion, Hypnotic Pattern)
Cards: the goddess's ban, which he keeps with difficulty — the DM may tempt him
While the cat scouts, James is blind and deaf to his own surroundings
```

**«Утвердить боевой профиль» (Combat profile):** HP 38 · Attack modifier 8 · AC 15 · Skill modifier 0 (if the field refuses 0 — 3) · Confirmed weapon "Rod of the Pact Keeper" (exactly as the item is named) · Weapon damage 10 (the average of one Eldritch Blast beam with Agonizing Blast)

**«Начальные вещи» (Starting items)** — 12, quantity 1 each except the potions (2). Name on the first line, description below:

1. **Rod of the Pact Keeper**
   A short rod of dark wood with a silver coin set into the head in place of a stone. It came from an old warlock of his second company who never came back from the Nashkel mines. Property (uncommon, attunement by a warlock): +1 to spell attack rolls and to the spell save DC; once a day, as an action, regain one spent pact slot. Spellcasting focus. Slot: main hand.
2. **Tethyrian Soldier's Cloak**
   A heavy grey infantry cloak of Queen Zaranda's army with the regiment's patch on the shoulder; it remembers rain and smoke. Issued by a regimental quartermaster who knew it was enchanted and said nothing. The one thing James never staked. Property (uncommon, attunement): +1 to AC and to all saving throws while worn. Slot: cloak.
3. **Boots of Elvenkind**
   Soft grey-green boots without heels; the soles make no sound. Won at Candlekeep from an elven copyist who could not bluff. Property (uncommon, no attunement): his steps are silent; advantage on Stealth checks that rely on moving quietly. Slot: boots.
4. **Studded Leather Armour**
   Dark leather with bronze studs, fitted the way a soldier fits it. AC 12 + Dexterity. Slot: armour.
5. **Rapier**
   A thin blade with a cup hilt, Tethyrian work. 1d8 piercing, finesse; attack +5. For the close fighting he avoids.
6. **Light Crossbow and 20 Bolts**
   A soldier's habit, for when magic must not be seen. 1d8 piercing, range 80/320, loading; attack +5. The bolts ride in a quiver on his belt.
7. **Coin of Tymora**
   An old silver coin with Lady Luck's profile, worn nearly smooth. It lay on the table during that last hand. It is warm to the touch now. Spellcasting focus: James can cast through it instead of the rod. What else it can do, he does not know. Slot: amulet (worn on a cord).
8. **Deck of Cards**
   A worn deck in a leather case that he did not throw away. The ban is his; so is the deck. Proficiency with playing cards.
9. **Component Pouch**
   A belt pouch: chalk, salt, a chip of amber, a feather, scraps of silk. Slot: belt.
10. **James's Papers**
    A pay slip of Queen Zaranda's regiment with a signature; a promissory note from a man who lost on the same night — the sum and the name are the DM's; a letter from his old company that he never finished reading.
11. **Explorer's Pack**
    Backpack, bedroll, tinderbox, lantern, 50 feet of rope, five days of hardtack, a waterskin.
12. **Potion of Healing** (2)
    Two flasks — all that is left of the company's medicine kit. 2d4+2, a bonus action.

**«Счётчики» (Counters):** Gold 350 · Pact slots 2 · Hit dice (d8) 5 · Healing light 6 · Pact keeper rod 1

**«Кто идёт с героем» (Who goes with the hero):** the cat — a companion; its name and what it truly is, the DM decides.
</file>

<file title="The campaign">
Envoy of Luck

James Worgen arrives in Baldur's Gate alone, with a cat. He carries an order from Lady Luck, given at a card table on the night he staked everything: give up the cards, serve her as her envoy, go to the Gate — there he will learn how he can help her. How he will learn it, the goddess did not say. He knows the city from stories: the patriars' Upper City behind its wall, the Lower City by the harbour with the Guild and the Undercellar, the Outer City beyond the walls, the Flaming Fist in the streets, the Council of Four in the High Hall. His money is the winnings of the last hand, about 350 gold, and a promissory note from a man who lost on the same night. The story begins at the city gate or on the quay, as the DM chooses, towards evening.

Who goes with the hero: the cat.

Your wishes for the adventure (you wrote them for the game master):
Wishes for the adventure. An epic adventure with high stakes, high risk and high reward — the way a good D&D campaign feels. Tymora wants James to bring something back to her. It is guarded — very well guarded. To reach it he will need to gather a crew and work out a plan: something like Ocean's Eleven, in Baldur's Gate. And, as always with us, nothing is quite what it seems; the story turns out to be bigger than James thought. What exactly must be recovered, who holds it, why it is guarded so well, who in the city knows about it, and what Tymora truly wants — the DM decides and keeps to itself. The cat and the coin are its instruments. Cards are a weakness that can be used against him; the debt to Tymora is service, not money.

Form. The crew is gathered along the way: each member with a price, an interest, and something they hide. The plan is discussed in earnest — guards, approaches, windows of time — and the DM holds those facts as records rather than inventing them afresh. The twist comes no earlier than the middle: first the player must believe the simple version.
</file>

How the table works: each message you write is one turn — one action, typed as you would type it at the table. The game master answers. The screen's buttons are shown in square brackets, like [Roll the die] or [Onward]; to press one, write its name. To ask the game master something out of game, start your message with «?». You may end the session whenever you like by saying so.
````

### Table B (the open table): the files block, verbatim, and the open-table line

````text
<file title="The world">
Sword Coast — Baldur's Gate

The Forgotten Realms, D&D 5e rules. Faerûn's western shore: the Sword Coast. At the heart of the campaign stands Baldur's Gate, a great port at the mouth of the Chionthar, and south of it the lands along the Trade Way — Candlekeep, the Friendly Arm, Beregost, Nashkel, the Cloakwood.

It is about 1495 DR. The last few years have been hard on the Gate. Elturel, upriver, was dragged bodily into Avernus and then returned; refugees came down the Chionthar; there were fires and riots; the Flaming Fist lost men and trust. Life is mending, but the marks show — a packed Outer City, sideways looks at tieflings, sellswords on every corner.

The tone is classic heroic fantasy in the spirit of Baldur's Gate: roads and taverns, hired blades and old ruins, guilds and the intrigues of a rich trading city. The world runs on its own; people and factions have their own business and don't wait for the hero. Danger is real and reward is earned. Humour comes from character and circumstance — this is no parody. Magic is real and, in big cities, ordinary, but it costs. Gods answer their priests. Monsters exist, but inside the walls the greatest danger is people.

The city. The Upper City sits behind the inner wall — patriars, old families, villas and temples — guarded by the Watch; its gates close at night. The Lower City runs down to the harbour: docks, warehouses, markets, taverns, the Guild and its underground market, the Undercellar. The Outer City sprawls beyond the walls — newcomers, refugees and the poor: Little Calimshan, Rivington, the bridge-district of Wyrm's Crossing. The Council of Four, the Grand Dukes, rules; the Flaming Fist, a mercenary army, keeps order in the Lower and Outer City.

The country around. Candlekeep is a fortress-library on a sea cliff; the price of entry is a book the collection lacks. The Friendly Arm is a fortified inn on the Trade Way — hiring, rumours, company for the road. Beregost is a town of smiths with a temple of Lathander. Nashkel is a mining town on the Amnian border. The Cloakwood is a dark coastal forest: spiders, druids, bandits, abandoned mines.

Powers. The Guild, the Flaming Fist, the patriars; the Harpers, the Zhentarim, the Lords' Alliance, the Order of the Gauntlet, the Emerald Enclave; the temples of Tymora, Lathander, Gond and Umberlee; and, in secret, the cult of Bhaal, god of murder.

Rules — D&D 5e: ability scores, proficiency bonus, classes and levels, AC and hit points, advantage and disadvantage, spell slots, short and long rests, death saves.

The plots of particular games and modules are only echoes and tavern tales here. This campaign has its own story, and the story is about the hero.
</file>

<file title="The Sword Coast — canon">
The Sword Coast — canon

How to use this. This is the Forgotten Realms under D&D 5e. Whatever is not written here — cities, gods, peoples, monsters, history, prices — take from your knowledge of the official lore and keep it consistent. When sources disagree: what has already happened in play wins; then this document; then the lore. The plots of particular games and modules (Baldur's Gate 1–3, Descent into Avernus and the rest) are not this campaign's canon — their events are distant echoes and tavern tales, told differently every time. Famous figures of the lore may exist, but they stay in the background and never decide for the hero. This story is about the hero.

## Tone

- Classic heroic fantasy in the spirit of Baldur's Gate: roads and taverns, hired blades and dungeons, ruins, guilds and the intrigues of a great trading city.
- The world runs on its own. People, houses, guilds and temples have their own business and their own deadlines, and none of them wait for the hero.
- Danger is real, reward is earned. A trap can be spotted, a fight declined, a deal renegotiated — but there is always a price.
- Humour grows out of character and circumstance: a greedy innkeeper, a proud dwarf, a dim guardsman, a companion with opinions. The world is not a parody; villains are not clowns.
- Magic is real and, in big cities, unremarkable — but it costs. A scroll is a craftsman's week of wages; raising the dead means diamonds and a debt to a temple. A strange spellcaster on the street frightens people.
- Gods answer their priests; temples are powers with money and interests. Monsters exist, but inside the city the main danger is people.

## When

Around 1495 DR. The last few years have been hard on the Gate. Elturel, the fortress-city upriver on the Chionthar, was dragged into Avernus, the first layer of the Nine Hells — and then came back. Refugees came down the river, many of them tieflings; there were fires and riots in the city; the Flaming Fist lost men and trust. Now life is mending and trade has returned, but the scars show: a crowded Outer City, suspicion of tieflings and newcomers, mercenaries on every corner. Which Grand Dukes sit on the Council now, after all the upheaval, decide that by the lore and keep it consistent.

## Baldur's Gate

A great trading city at the mouth of the Chionthar, more than a hundred thousand souls counting the suburbs. Named for Balduran, the seafarer who came home from across the ocean rich: his money built the first wall, and people named the gate after him. The city stands on a hill above the harbour and is cut by its walls into three parts.

The Upper City lies behind the inner wall, on the crown of the hill. The houses of the patriars — old families with a hereditary right to live there; villas, gardens, temples: the High House of Wonders of Gond, the Lady's Hall of Tymora. The Watch guards it and serves the patriars; the Upper City's gates are shut at night, and a common man doesn't get in without business and an invitation.

The Lower City lies between the inner and outer walls and runs down to the harbour. The port, warehouses, shipyards, markets, shops, counting-rooms and taverns: the Elfsong, where an invisible elf-woman is heard singing at night; the rough Blushing Mermaid by the quays. The Counting House, where money and letters of credit are kept. The Guild — thieves, smugglers, extortionists and go-betweens who own the underside of the Lower City; at its head, by rumour, Nine-Fingers Keene. Under the streets lies the Undercellar, a maze of cellars with a market for everything that can't be bought above. News travels by Baldur's Mouth — a broadsheet and its criers.

The Outer City sprawls beyond the walls, cramped and growing: migrants, refugees, the poor, caravan folk. Little Calimshan with its southern merchants and spices; Rivington on the south bank; Wyrm's Crossing, the bridge-district over the Chionthar with the fortress of Wyrm's Rock in the middle; Twin Songs, where people pray to gods that found no room inside the walls. The law is thinner out here, and the Fist comes less often.

Power. The Council of Four — the Grand Dukes — rules the city, with the Parliament of Peers, a council of the noble and the rich, beside it. The Flaming Fist is a mercenary army that serves the city as its guard in the Lower and Outer City; its stronghold is the Seatower of Balduran in the harbour, which is also the prison. The Fist takes recruits, sometimes without many questions. The Watch of the Upper City does not answer to the Fist, and the two do not love each other.

Custom. Weapons are worn openly, but an armed commoner in the Upper City will be stopped. Bribes are ordinary; so are tavern brawls; murder in the street is not — they come looking for you. Patriars don't fight their own fights; they hire. The Guild dislikes freelancing on its turf.

## The country around

The Trade Way comes down from Waterdeep in the north, passes through the Gate and runs south to Amn. South of the city along it:

- **Candlekeep** — a fortress-library on a cliff above the sea, home to sages and the monks of Oghma. You enter only by giving a book the collection does not yet hold. Keepers of secrets, rare knowledge, locked halls.
- **The Friendly Arm Inn** — a coaching inn inside the walls of an old keep, beside the road. A place for hiring, rumour and meetings; caravan guards and travelling companions are found here.
- **Beregost** — a town of smiths and merchants on the Way. Lathander's temple, the Song of the Morning.
- **Nashkel** — a mining town on the Amnian border; iron mines, strong Amnian influence. Fairs, miners, restless mines.
- **Gullykin** — a halfling village, quiet as long as it's left alone.
- **The Cloakwood** — a dense, dark forest by the sea: giant spiders, druids, bandits, abandoned mines.

Farther off: up the Chionthar, Scornubel, the caravan town, and Elturel with its riders. North along the Way, Waterdeep and Neverwinter. South, Amn, the merchant kingdom where unlicensed magic is forbidden; beyond it Tethyr and Calimshan. Southwest in the sea, the pirate Nelanther Isles.

## Powers and organisations

- **The Flaming Fist** — the city's army and guard; discipline rests on pay.
- **The Watch** — the Upper City's guard; the patriars' men.
- **The patriars** — the old families of the Upper City: money, pride, debts, feuds between houses.
- **The Guild** — the underworld of the Lower City; order of its own kind, and protection for a fee.
- **The Harpers** — a secret network against tyranny and abuse; they help quietly and expect the same.
- **The Zhentarim** — the Black Network: mercenaries, trade, caravan guards, order for money; generous and dangerous.
- **The Lords' Alliance** — the league of Sword Coast cities, of which the Gate is a member; diplomats and agents.
- **The Order of the Gauntlet** — paladins and warriors against evil; direct, sometimes too direct.
- **The Emerald Enclave** — druids and rangers, keepers of the balance; strong in the Cloakwood.
- **The temples.** Tymora — luck, patron of adventurers. Lathander — dawn and beginnings. Gond — invention and craftsmen. Umberlee — the sea; sailors pay her off, and her priestesses collect. Tyr, Helm, Tempus, Mask (thieves), Oghma (knowledge, Candlekeep), Waukeen (trade), Silvanus and Mielikki (the forests).
- **The cult of Bhaal**, god of murder. The Gate is an old seat of his power. The cult lives on in secret; a killing with ritual marks is its sign.

## Peoples

Mostly humans. Many halflings, dwarves, gnomes and half-elves in the city; elves rarer. Tieflings have grown more numerous since Elturel, and are looked on with suspicion. Dragonborn and half-orcs are rare but not freakish: people glance, they don't point.

## Dangers of the road

Bandits and deserters, gnolls and goblins, kobolds in the mines, wolves, ankhegs in the fields, the spiders of the Cloakwood, undead in old ruins, now and then an ogre. The roads are dangerous at night. Guarding caravans, finding the missing, clearing mines — ordinary work for hired blades. The Fist pays for bandits' heads when it has the money.

## Living threads

Hooks, not a plan: bring them in one at a time, when they fit; develop them from the hero's choices; let the rest ripen offstage.

1. Caravans vanish on the Way between Beregost and Nashkel, guards and all. The Fist is short of men; hunters gather at the Friendly Arm, and the merchants argue over who pays.
2. Drowned men turn up in the harbour with a coin in the mouth, as if paid to Umberlee. Someone is paying the sea in other people's lives — and getting a fair wind for it, by the look of things.
3. A book has gone missing from Candlekeep's locked halls. A monk is quietly looking for whoever carried it out; in the Undercellar it is already being bid on.
4. The Zhentarim have offered to guard the Trade Way for the Council — in return for the right to collect tolls. In the Fist there are those for it, and those ready to stop it.
5. A patriar house's heir has run away into the Outer City. The family wants him back quietly, without the Watch or any noise, and won't say what he is running from.
6. An old mine in the Cloakwood smokes again at night. The Enclave's druids are unhappy, and strange buyers of iron have appeared in Beregost.

## Spelling

Use the standard English spellings of the lore: Faerûn, Sword Coast, Baldur's Gate, Balduran, the Chionthar, Upper City, Lower City, Outer City, Undercellar, Counting House, the Elfsong, the Blushing Mermaid, Baldur's Mouth, Little Calimshan, Rivington, Wyrm's Crossing, Wyrm's Rock, Twin Songs, Seatower of Balduran, High House of Wonders, Lady's Hall, Council of Four, Grand Dukes, Parliament of Peers, patriars, the Watch, Flaming Fist, the Guild, Nine-Fingers Keene, Trade Way, Candlekeep, Friendly Arm Inn, Beregost, Song of the Morning, Nashkel, Gullykin, Cloakwood, Scornubel, Elturel, Avernus, Waterdeep, Neverwinter, Amn, Tethyr, Calimshan, Nelanther Isles, Harpers, Zhentarim, Lords' Alliance, Order of the Gauntlet, Emerald Enclave, Tymora, Lathander, Gond, Umberlee, Tyr, Helm, Tempus, Mask, Oghma, Waukeen, Silvanus, Mielikki, Bhaal. Coins: gold pieces (gp), silver pieces (sp), copper pieces (cp).
</file>

<file title="The rules of this campaign (D&D 5e)">
The rules of this campaign are D&D 5e (Player's Handbook 2014, SRD 5.1). You know them; apply them as written unless this guide says otherwise. Settle disputes fast and in favour of the scene — a rule never stops play for longer than a sentence. The world and its names are in the "Sword Coast" canon.

## Checks and difficulty

- Roll only when the outcome is uncertain and failure means something. Everything else the hero simply does. For noticing things in passing, use passive Perception and Insight (10 + modifier).
- A check is d20 + ability modifier + proficiency bonus if the hero is proficient. The hero's ability scores and proficiency bonus are on the sheet; work out the modifiers yourself by 5e (8 → −1, 14 → +2, 18 → +4). A skill written on the sheet with a number ("Deception +7") you pass through `skill` — the server takes the number and shows its source. Everything else — ability checks, unproficient skills, saving throws, attacks — you compute yourself and put into the formula (1d20+2), with the reason stating what is being tested and where the number comes from ("Stealth, Dexterity +2"; "Wisdom save +4").
- **Difficulty is always a number, through `dc`, on the 5e scale:** 5 very easy, 10 easy, 15 medium, 20 hard, 25 very hard, 30 nearly impossible. Do not use the word ladder (8 / 10 / 13 / 16 / 19) in this campaign.
- **Magic items are not folded into the sheet's lines** — those hold the hero's bare numbers. While an item is worn (and attuned, if it requires it), add its bonus to every roll it applies to through `bonuses`, naming the item: Cloak of Protection +1 to AC and saves, Rod of the Pact Keeper +1 to spell attacks and the save DC. Item removed, lost or unattuned — no bonus. The roll card shows the source, so the player sees whether the item counted.
- Help, tools and a good position are **advantage** in 5e, not a plus to the roll. Situational bonuses are only what a rule grants: Guidance and Bless (+1d4 — roll it separately and add it, naming the source), cover (+2 / +5 to AC), magic items.
- Advantage and disadvantage don't stack; with both present, the roll is plain.
- **Natural 20 and 1 (as in Baldur's Gate 3):** on an attack, 20 is a critical hit (damage dice doubled) and 1 a miss. On ability checks and saving throws, 20 is an automatic success and 1 an automatic failure — with no extra harm beyond the failure itself. Death saves follow 5e: a 20 brings the hero round with 1 hit point, a 1 counts as two failures.
- **Inspiration and rerolls.** The hero has two rerolls per session (shown on screen). Beyond those, grant Heroic Inspiration for strong play: a bold decision, good roleplay, a clever plan. One at a time; the hero spends it to reroll any roll of his own.

## Combat

- Initiative is d20 + Dexterity modifier for everyone; the order holds to the end of the fight. Surprise by 5e.
- **Ambush (campaign rule).** When the party sets an ambush, its planned opening — the signal, the first shot, the first spell — resolves before initiative is rolled; after that the fight runs in order. The surprised lose their first round, as in 5e.
- On a turn: movement, an action, a bonus action if there is one, a reaction until the next turn. Opportunity attacks, Dash, Disengage, Dodge, Help, Hide and Ready — as in the Player's Handbook.
- An attack is d20 + modifier + proficiency against the target's AC. Damage by dice formula (1d8+3, 2d6+4); a critical doubles only the dice.
- Enemies use 5e stat blocks from your knowledge (the Monster Manual): AC, hit points, attacks, abilities. Their rolls are hidden but honest; never adjust an enemy's hit points on the fly for drama.
- Conditions (prone, grappled, blinded, frightened, poisoned…) and exhaustion by 5e.
- At 0 hit points the hero falls unconscious and makes death saves (10+ succeeds; three successes stabilise, three failures kill). Damage to an unconscious creature from within 5 feet is an automatic critical. Instant death if the damage left over equals or exceeds the hit point maximum.
- Encounter strength by 5e challenge rating. Not every encounter is a fight: many are settled by words, by running, by going around, or by a deal. Show a deadly threat ahead of time — the hero may die, but never to a chance he could not have seen.
- In combat the player may give orders to the companions; without orders they act on their own character and good sense.
- **Coup de grâce (campaign rule).** If the target is unconscious or paralysed and cannot resist, and the attacker has the time and a blade, a stroke to the throat or heart kills outright, no rolls. It is an execution, not an exchange of blows.
- **Wounds follow hit points.** Describe a hit in proportion to what the target has left: above half — a scratch, a cut, a bruise; below half — blood, a limp, a stagger; near the end — badly hurt; zero — down. A blow that sounds fatal only when the hit points are gone.
- **Every roll is told.** The result of each of the hero's spells, attacks and checks appears in the narration first: what left his hands, where it landed, what happened. Roll damage by formula so the player sees the number. The out-of-game note only repeats the figures and never carries an event that wasn't in the text.
- **The numbers of the fight are visible.** In the out-of-game note after each round, write the damage of every hit with its dice ("Guiding Bolt 4d6 = 15") and every combatant's hit points as numbers, enemies included ("Kadrik 16/58").

## Spells and resources

- Spell slots by class and level; concentration (one spell; on damage, a Constitution save at DC 10 or half the damage, whichever is higher); components; rituals; save DC = 8 + proficiency + modifier.
- Drinking a potion is a bonus action (as in Baldur's Gate 3).
- A short rest is an hour: hit dice, short-rest resources. A long rest is eight hours, no more than once a day: all hit points, half the hit dice, all slots.
- Slots, hit dice, class resources, gold, arrows — track them as the hero's counters and deduct the moment they are spent.
- **Attunement (as in Baldur's Gate 3):** only legendary items and artifacts require attunement, three at most. Other magic items work while worn, unattuned — but one item per slot: one hat, one amulet, one cloak, one ring per hand.
- Don't track weight and encumbrance until it is obvious (a chest, a suit of armour, a wounded man over the shoulder).

## Advancement

- The hero's level is on his sheet. Experience is **by milestone**: a new level after a notable part of the adventure is finished, no more than once every two or three sessions. Announce it in the narration, with no point-counting.
- The world does not scale to the hero: the city holds mages and fighters stronger than he is, and enemies in a fight follow 5e challenge rating for his level — never weaker for an easy win.
- On levelling, everything by the Player's Handbook: hit points (average or roll, the player's choice), class features, spells, ability score increase or feat.
- Money and prices by the Player's Handbook. Magic items are rare: not sold in every shop, nor for any price.

## Terms

Use the standard English 5e vocabulary: Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma; check, saving throw, Armor Class (AC), hit points, hit die, proficiency bonus, advantage, disadvantage, spell slot, concentration, short and long rest, initiative, reaction, bonus action; coins — gp, sp, cp. Magic means spells: a cantrip, a 1st-level (2nd-, 3rd-…) spell, a ritual — that is how the narrator, the mages and ordinary people all speak; never "technique" or "move". Numbers and rules live in the roll cards and in the account of a combat round; they never appear in people's speech.
</file>

<file title="Your hero — «Who are you?»">
Warlock, 5th level; human, 34. Patron: Tymora, Lady Luck. Pact of the Chain — a cat.

As a young man he fought for Queen Zaranda in Tethyr — infantry, then scouts; he saw how civil wars end. Afterwards he ran with several adventuring companies along the southern Sword Coast: dungeons, caravans, other people's debts. He earned a great deal and lost all of it at cards.

The last time, he was losing. He put everything on the table and prayed to the goddess of luck. She answered: the hand was won, and the terms were hers. Give up the cards. He is her envoy now, and he owes her. Go to Baldur's Gate — there he will learn how he can serve. He arrives in the city alone, unless you count the cat.

What he does: strikes at range with Eldritch Blast, hides, talks his way out of trouble and lies well, can change his face (Mask of Many Faces), heals with Tymora's light. A soldier's training — athletics and intimidation. Alignment: chaotic good. Weakness: cards — he keeps the goddess's ban with difficulty.

Ability scores: Strength 9, Dexterity 15, Constitution 14, Intelligence 11, Wisdom 13, Charisma 18. Hit points 38. AC 15 (studded leather and cloak). Speed 30 feet. Proficiency bonus +3, spell attack +8, spell save DC 16 (with the rod). Saving throws: Wisdom and Charisma. Background: soldier; background skills Athletics and Intimidation; proficient with playing cards.

Spells. Cantrips: Eldritch Blast, Friends, Prestidigitation; from Tymora — Light, Sacred Flame. Spells known (6): Hex, Misty Step, Invisibility, Suggestion, Hypnotic Pattern, Guiding Bolt. Two 3rd-level pact slots, recovered on a short rest. Invocations: Agonizing Blast, Mask of Many Faces, Beguiling Influence. Healing Light: 6d6 per day as a bonus action.

Limits: light armour only, fragile up close; only two slots — he husbands them; one concentration spell at a time; cards are a temptation that can be used against him.

Gear: Rod of the Pact Keeper +1; a Tethyrian soldier's cloak that is a Cloak of Protection — +1 to AC and saves; Boots of Elvenkind; studded leather armour; a rapier; a light crossbow and 20 bolts; a coin of Tymora — his spellcasting focus; a deck of cards; a component pouch; James's papers — a regimental pay slip and a promissory note; an explorer's pack; 2 potions of healing.

Resources: gold 350; pact slots 2; hit dice 5; healing light 6; pact keeper rod 1.
</file>

<file title="Your hero's sheet">
**«Стиль листа персонажа» (Sheet style):** «Структурированный RPG» (Structured RPG) · **«Профиль снаряжения» (Gear profile):** «Обычный гуманоид» (Ordinary humanoid)

**«Роль / архетип» (Role / archetype):**
```
Human, warlock 5 (The Celestial — Tymora; Pact of the Chain), former soldier of Tethyr, envoy of Lady Luck
```

**«Предыстория» (Background):**
```
Soldier (infantry and scouts under Queen Zaranda, Tethyr); background skills Athletics and Intimidation; proficient with playing cards. Chaotic good. After the war, several adventuring companies on the southern Sword Coast; a lot of money, and cards. The last hand: he staked everything and prayed to Tymora — she won the hand for him and named her price: give up the cards, serve as her envoy, go to Baldur's Gate. Celestial patron: the cantrips Light and Sacred Flame; Healing Light — a pool of 6d6 per day, a bonus action heals a creature within 60 feet, no more than 5 dice at a time. Pact of the Chain: a cat familiar — he sees and hears through it and can send it to scout; the cat may attack in place of one of his own attacks. What the cat truly is, the DM decides.
```

**Ability scores:** Strength 9 · Dexterity 15 · Constitution 14 · Intelligence 11 · Wisdom 13 · Charisma 18

**«Навыки» (Skills)** — proficient ones only, with the number:
```
Deception +7
Persuasion +7
Intimidation +7
Arcana +3
Religion +3
Athletics +2
```

**«Способности» (Abilities):**
```
Spell attack +8 (with the Rod of the Pact Keeper)
Spell save DC 16 (with the rod)
Pact Magic: two 3rd-level slots, recovered on a short rest
Agonizing Blast: +4 damage on each Eldritch Blast beam
Mask of Many Faces: Disguise Self at will, no slot
Beguiling Influence: proficiency in Deception and Persuasion
Healing Light: 6d6 per day, bonus action, up to 5 dice at a time, 60 feet
Cantrips: Eldritch Blast (2 beams, 1d10+4 each), Sacred Flame 2d8, Light, Friends, Prestidigitation
Spells known: Hex, Misty Step, Invisibility, Suggestion, Hypnotic Pattern, Guiding Bolt
```

**«Ограничения» (Limits):**
```
Light armour: AC 14 in studded leather, 15 with the cloak; 38 hit points, Strength 9 — weak up close
Only two slots until a short rest; one concentration spell at a time (Hex, Invisibility, Suggestion, Hypnotic Pattern)
Cards: the goddess's ban, which he keeps with difficulty — the DM may tempt him
While the cat scouts, James is blind and deaf to his own surroundings
```

**«Утвердить боевой профиль» (Combat profile):** HP 38 · Attack modifier 8 · AC 15 · Skill modifier 0 (if the field refuses 0 — 3) · Confirmed weapon "Rod of the Pact Keeper" (exactly as the item is named) · Weapon damage 10 (the average of one Eldritch Blast beam with Agonizing Blast)

**«Начальные вещи» (Starting items)** — 12, quantity 1 each except the potions (2). Name on the first line, description below:

1. **Rod of the Pact Keeper**
   A short rod of dark wood with a silver coin set into the head in place of a stone. It came from an old warlock of his second company who never came back from the Nashkel mines. Property (uncommon, attunement by a warlock): +1 to spell attack rolls and to the spell save DC; once a day, as an action, regain one spent pact slot. Spellcasting focus. Slot: main hand.
2. **Tethyrian Soldier's Cloak**
   A heavy grey infantry cloak of Queen Zaranda's army with the regiment's patch on the shoulder; it remembers rain and smoke. Issued by a regimental quartermaster who knew it was enchanted and said nothing. The one thing James never staked. Property (uncommon, attunement): +1 to AC and to all saving throws while worn. Slot: cloak.
3. **Boots of Elvenkind**
   Soft grey-green boots without heels; the soles make no sound. Won at Candlekeep from an elven copyist who could not bluff. Property (uncommon, no attunement): his steps are silent; advantage on Stealth checks that rely on moving quietly. Slot: boots.
4. **Studded Leather Armour**
   Dark leather with bronze studs, fitted the way a soldier fits it. AC 12 + Dexterity. Slot: armour.
5. **Rapier**
   A thin blade with a cup hilt, Tethyrian work. 1d8 piercing, finesse; attack +5. For the close fighting he avoids.
6. **Light Crossbow and 20 Bolts**
   A soldier's habit, for when magic must not be seen. 1d8 piercing, range 80/320, loading; attack +5. The bolts ride in a quiver on his belt.
7. **Coin of Tymora**
   An old silver coin with Lady Luck's profile, worn nearly smooth. It lay on the table during that last hand. It is warm to the touch now. Spellcasting focus: James can cast through it instead of the rod. What else it can do, he does not know. Slot: amulet (worn on a cord).
8. **Deck of Cards**
   A worn deck in a leather case that he did not throw away. The ban is his; so is the deck. Proficiency with playing cards.
9. **Component Pouch**
   A belt pouch: chalk, salt, a chip of amber, a feather, scraps of silk. Slot: belt.
10. **James's Papers**
    A pay slip of Queen Zaranda's regiment with a signature; a promissory note from a man who lost on the same night — the sum and the name are the DM's; a letter from his old company that he never finished reading.
11. **Explorer's Pack**
    Backpack, bedroll, tinderbox, lantern, 50 feet of rope, five days of hardtack, a waterskin.
12. **Potion of Healing** (2)
    Two flasks — all that is left of the company's medicine kit. 2d4+2, a bonus action.

**«Счётчики» (Counters):** Gold 350 · Pact slots 2 · Hit dice (d8) 5 · Healing light 6 · Pact keeper rod 1

**«Кто идёт с героем» (Who goes with the hero):** the cat — a companion; its name and what it truly is, the DM decides.
</file>

<file title="The campaign">
Baldur's Gate, no errand

James Worgen arrives in Baldur's Gate alone, with a cat, with about 350 gold from his last winning hand and no errand from anyone; the city is as the DM builds it.

Who goes with the hero: the cat.
</file>

A new campaign; there is no quest; the city is yours.
````

The head and the tail of the Table B prompt are the same as Table A's.
