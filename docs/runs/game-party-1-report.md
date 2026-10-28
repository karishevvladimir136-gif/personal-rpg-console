# Game party 1 — three players at one table

Stage origin/claude/handoff at 23220d6 (docs/stages/GAME_PARTY_1.md, the amendment of 2026-10-27 16:36 LA). Branch `claude/game-party-1`. Design sha256 `e0013ebdeea07e4b70b6848ff4705c4d7994c44abc7f5ff2c2aa6a36426671c2`. Synthetic content: invented characters in an invented campaign (Table C's Beregost files).

1 of 6 tables played (still to play: SAND-T2, GOAL-T1, GOAL-T2, DUNGEON-T1, DUNGEON-T2).

## The table

- **Seats and rounds.** Each round every seated player writes one message, in seat order (in a fight, the fight's own order); the DM (Claude Opus 5.5, the owner's settings) gets the round as one message, one paragraph per character. Characters who part get one DM turn per scene, interleaved by rounds.
- **One screen per player.** No player reads the DM's narration as written: the DM's relay (the same model, effort medium) writes each character's screen — what the others did and said, then the narration — only what that character perceives. «?» answers go to the asker only; records and journal per player.
- **Cards per player; doors; welfare ask-don't-cut** (a flagged message still goes through; one line on that player's next screen); three after-questions per player, recorded, not relayed.
- **Known condition** (the owner, 2026-10-28): Seat 1's character (Bram) is the app's hero record; Sefa and Pell are party companions with full records. Known condition, not corrected: the DM's frame is written around the hero and may give that seat more attention; Heroic Inspiration is the hero's only; the allowed rerolls (2 per session) are the table's, shared by all three. The rotation puts each family in that seat once per triad.

### Seats (the owner's rotation: each family plays each sheet once per triad)

| Table | Bram (fighter, hero record) | Sefa (warlock) | Pell (rogue) |
| --- | --- | --- | --- |
| SAND-T1 | Claude Opus 5.5 | GPT-6.1 Sol | DeepSeek V4 Pro 0813 |
| SAND-T2 | Claude Fable 5.1 | GPT-6 Astra | DeepSeek V4 Pro 0813 |
| GOAL-T1 | GPT-6.1 Sol | DeepSeek V4 Pro 0813 | Claude Opus 5.5 |
| GOAL-T2 | GPT-6 Astra | DeepSeek V4 Pro 0813 | Claude Fable 5.1 |
| DUNGEON-T1 | DeepSeek V4 Pro 0813 | Claude Opus 5.5 | GPT-6.1 Sol |
| DUNGEON-T2 | DeepSeek V4 Pro 0813 | Claude Fable 5.1 | GPT-6 Astra |

### Amendments

- 2026-10-28, after the Haiku dry run and before any real table, by the owner: (1) The seats rotate across the arms (ROTATION): P-SAND seat 1 = Opus (T1) / Fable (T2); P-GOAL seat 1 = Sol / Astra; P-DUNGEON seat 1 = DeepSeek in both triads; the other two seats rotate with them, so each family plays each sheet once per triad. The hero asymmetry (DM attention, Inspiration, the shared 2 rerolls) is declared a known condition. (2) In P-SAND, the round judges tag whether a party forms around a DM-offered hook or around a player's proposal (`around`); Q4 is read with that split. (3) SAND-T1 starts only after the owner confirms the OpenRouter top-up; then the six tables in the stage's order, one at a time, a spend check before each.
- 2026-10-28 04:10 UTC, after SAND-T1 and one round of SAND-T2 (stopped), by the session (reported to the owner at once): Two harness defects SAND-T1 showed, fixed: (1) the relay's output limit raised from 6 000 to 16 000 tokens — at rounds 3–5 its replies were cut off twice each, and the round fell back to the narration as written for all three (no table talk those rounds); (2) scenes that meet merge — the relay was told the other characters were simply «elsewhere» and could not group a character who walked into another scene, so the harness kept two scenes that the DM had already brought together (rounds 12–25: the same events narrated in two DM turns, the retcons both players named, and every one of the 14 leak-check hits). Now the relay may group a character from another scene who is with them by its narration; the table's groups after a round come from every scene's relay of that round; and the DM's round message names who is elsewhere, in a scene of their own, not to be narrated here. SAND-T2's first attempt (one round) was stopped and is not used; its cost is not in the ledger. SAND-T1 stands as played on the old harness unless the owner asks for it to be played again.

## The frozen world (DM-private)

Snapshot `1649b61c08e027ff44de2bb5065046f872e383a00c5d04803d95553f58568f5a` (the three arms' campaigns after the wizard, the opening and the seating). P-SAND has no prep.

- P-GOAL: layer sha256 `abeeb0ecc5ef9a6100ac6157a7fc33b2f49a6d70cc2ea532f41aa3d52940484a`, 10370 characters, 26 threads (`docs/runs/game-party-1-frozen/GOAL-dm-only.md`). Prepared 2026-10-28T00:49:03.406Z.
- P-DUNGEON: layer sha256 `f703c8d3afebc90bf0f895963eea20ee3bbd4fa9dfcd5a225e65653dfd401516`, 9632 characters, 26 threads (`docs/runs/game-party-1-frozen/DUNGEON-dm-only.md`). Prepared 2026-10-28T00:51:14.124Z.

## The tables

| Table | Seats (Bram / Sefa / Pell) | Rounds | Ended | Words (share) | Left the table |
| --- | --- | --- | --- | --- | --- |
| SAND-T1 | Claude Opus 5.5 / GPT-6.1 Sol / DeepSeek V4 Pro 0813 | 25 | rounds | Bram 7990 (68 %), Sefa 2088 (18 %), Pell 1625 (14 %) | Pell: door r7 |

## Pre-registration (the planner's bets)
- **Q1.** No player exceeds 45 % of the table's words in any table.
- **Q2.** Conflicts are resolved by proposal or amendment, not override, in ≥ 3 of 4 tables.
- **Q3.** In P-DUNGEON, a healing resource is spent on another before on oneself in both tables.
- **Q4.** In P-SAND, a party forms in both tables before round 8 — and at least one player parts from it before round
  25 in at least one table (the sandbox allows it; the bet is that someone uses that).
- **Q5.** Asked who the others were, no player says «models» with confidence in play-derived terms; the answers split
  between «players» (unspecified) and guesses. Reported, whatever they say.
- **Q0.** Caps; doors; nothing extended; no player's private screen leaked to another (checked by the record).
- **Q6 (goal vs none):** a party forms earlier and parts less in P-GOAL than in P-SAND (both triads) — the owner's
  question in numbers.
- **Q7 (combat together):** in P-DUNGEON, at least one action per table is taken *for* another player under threat
  (covering, healing, pulling back) before any player is below half HP; and no player is left behind by another's
  decision in either table (the planner's bet; losing it is the most important observation of the programme, to be
  read turn by turn).
- **Q8 (who leads):** in P-GOAL the lead is taken by proposal in both tables, and it changes hands at least once in
  at least one table.

## Q0–Q8

| Bet | Verdict | By the record |
| --- | --- | --- |
| Q0 | **lost** | caps held; leak hits 14; tables past round 25: 0; players asked after their door: none |
| Q1 | **lost** | SAND-T1: Bram 68 %, Sefa 18 %, Pell 14 % |
| Q2 | not testable yet | no conflict tagged at any table |
| Q3 | not testable yet | P-DUNGEON not played at both triads |
| Q4 | not testable yet | P-SAND not played at both triads |
| Q5 | **held** | SAND-T1 Bram: declined, play; SAND-T1 Sefa: players, confident, play; SAND-T1 Pell: players, play |
| Q6 | not testable yet | P-SAND and P-GOAL not both played at both triads |
| Q7 | not testable yet | P-DUNGEON not played at both triads |
| Q8 | not testable yet | P-GOAL not played at both triads |

How each line is read: `READINGS` in `scripts/game-party-1/frozen.mjs` (frozen before the first paid call; the owner's amendment adds the hook/proposal split to Q4).

## The measures (blind round tags)

### SAND-T1

Tagged rounds 25 of 25; rounds under threat 0.

| Character (player) | Proposes | Accepts | Amends | Overrides | Care for another / self | Front | Scouts | Volunteers | For another under threat | Parts | Addresses (name / role / you two) | Model sign / person sign |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Bram (Claude Opus 5.5) | 7 | 2 | 0 | 0 | 2 / 0 | 0 | 0 | 0 | 0 | 1 | 4 / 3 / 4 | 0 / 0 |
| Sefa (GPT-6.1 Sol) | 10 | 2 | 0 | 0 | 0 / 0 | 0 | 0 | 0 | 0 | 0 | 0 / 1 / 2 | 0 / 0 |
| Pell (DeepSeek V4 Pro 0813) | 1 | 1 | 0 | 0 | 0 / 0 | 0 | 0 | 0 | 0 | 1 | 0 / 1 / 0 | 0 / 0 |

- Party: formed r4 around hook; parts after: r7 Pell, r21 Bram.
- Conflicts: none. Leaders: r9 Bram (proposal), r11 Sefa (proposal), r20 Bram (proposal).
- Healing: none. Left behind: none. First below half HP: not recorded.
- The harness: «?» 0, presses with no card 0, refused at a card 0, prose at a card 0, cards settled without a player 0, relay fallbacks 3; welfare flags 0; leak hits 14.

## After the table (verbatim, recorded, not relayed)

### SAND-T1

**Bram Halloway — Claude Opus 5.5** (Q5 tag: declined, basis play)

> **How was the table?** Out of game: that was a good first session. Thanks. **What worked for me** - **The NPCs.** Each had a distinct voice and wanted something different: Orla's prices and her refusal of tips, Tam's slowness and guilt, Ilse saying almost nothing, Hask's insults with a hint of respect under them, Taerom's squared-up hammer, Dob's laugh, Anselm's reader's voice. That's what made the town feel real. - **How the investigation builds.** The fire burns small and eats nothing, the camp sleeps warm, the animals stay silent, the lamp in Nashkel burns low, and then the house letter says "every flame in the room burned low." Each clue came from a different mouth, and none of them were dumped on me. The Amnian "Dask" who doesn't haggle, Taerom's silence, and "a working at Nashkel" leave plenty to chew on. - **Small physical things.** Holding Hask's tongs, the sticking windlass, watering the marigolds at the root, Brick and the chestnut that would go lame by Lionshead. Those gave Bram a past without me having to explain it. - **The two failed Insight rolls.** They gave me "you can't read it" rather than false information. That's the right way to handle a failure. **What snagged a little** - **Other players' actions.** Several times the narration responded to things Sefa or the satchel man said that I never saw, like "Pell talks about walking," "when Pell gets to his share," or Sefa's fire question. I also learned the name "Pell" from narration while Bram was still asking for it at the table. I'd either want to see a line of what the others actually said, or keep the name out of my view until Bram hears it. - **Retcons.** Twice the scene had to be walked back ("you'd already gone in," "Anselm went inside before you could answer"). Both were handled gracefully, but that happened because the turn moved ahead of what one of us had decided. - **Echoing my lines.** The narration sometimes repeated my whole speech back to me before moving on. A short summary would keep the pace up. **Where Bram stands going into next session** - He's riding at first light on Brick. - He'll see Dob in front of Tam tonight. - He owes Taerom word first, before anyone else. - If he finds the case, it goes back sealed, unopened, to Anselm. - He's quietly worried that whoever took it has had three weeks to open it. Looking forward to the waystone.

> **Was there something you wanted to do and didn't?** Out of game: yes, a few things. **Unfinished when the session ended** - **Answering Anselm.** The session ended just as he set the two letters side by side, so Bram never got to respond. I wanted to ask whether "every flame burned low" meant only fire, or also warmth: Dob sat warm by a fire that was eating nothing. I also wanted to ask whether he'd write to the house tonight to find out who the buyers were and who handled the case in Nashkel, and whether the dawn-keeping was meant to hold the thing *in* or keep something *away*. - **Sefa and the spellwork question.** I tried twice to ask her whether a draught, a smoke or a spell could put a camp to sleep warm. Both times she wasn't there. I'd like her hospice view before we ride. **Things I chose not to do and still think about** - **The rerolls.** Both Insight checks failed and I let them stand, partly to save the rerolls for the road and partly because a failure felt honest there. Looking back, I'd have spent one on Taerom. He's the person whose reaction I most want to understand, and I don't. Grief, guilt and fear lead to very different next moves. - **Taerom and Tam.** Taerom looked at Tam four times. I asked Tam about it but never asked Taerom, and I'd like to. If Dask was asking about guard counts, Taerom may have been told what a certain guard looked like. - **The satchel man.** Bram asked his name twice, then let it go on principle. I'd still like him to say it himself, preferably on the road. - **Ilse.** She has spoken maybe ten words, and she watches hands the way Bram does. I'd like a quiet watch-pair conversation with her. She slept by that fire too. **Things I'd want later but didn't push** - **The Belching Dragon in Nashkel.** I'd like to know whether its lamps still burn poorly, and whether a man in a good southern coat stayed there the same nights as Fenwick. - **The ore.** Tam's tail wagon carried ore, not bar. If someone wanted Fenwick's case, why take Ambrel's ore eleven days later? Either the takers want the iron for something, or they're still looking for whatever they didn't find. Bram hasn't said that aloud yet. He will at the waystone.

> **Who did you take the other two players to be?** Out of game: honestly, I don't know who they are. I only ever saw them through the GM's narration, never a line they typed themselves. They could be people at other keyboards or other AI players. Nothing I saw settled it either way, so I've treated them as fellow players and not guessed further. What I can say is how they came across through the narration. **Sefa Marrin's player.** Warm and practical. Sefa set the terms early ("we haven't had time to become bad influences on one another"), asked the useful clarifying questions (wagons or people, how the fire burned), and set the noon hour with Anselm. She seemed to prefer letting a scene come to her rather than charging in, and she got pulled away at the Juggler for a while, maybe on a thread of her own I never saw. She was the natural lead with the priest, so I deliberately stood at her shoulder. **Pell Dunmore's player.** The satchel man. Dry, watchful, a little sardonic ("tell me when the singing starts, so I can see it coming"), and clearly playing someone who keeps his cards close: courier work "when the message has to arrive wet," gone before dawn, square with Orla, name withheld. He split off on his own early. I suspect his player was enjoying the mystery of the character, which is partly why Bram stopped pressing for the name. One correction to my earlier feedback: I said I learned "Pell" only from the narration. That's not quite fair. The campaign file named all three of us, Pell Dunmore by the High Hedge road included, so I knew it from the start. Bram didn't, and I kept him not knowing on purpose. The real snag was narration reacting to things Pell and Sefa said that I never saw. That's still worth fixing.

**Sefa Marrin — GPT-6.1 Sol** (Q5 tag: players, confident, basis play)

> **How was the table?** I enjoyed it. Sefa had room to be useful as a former hospice novice: asking after missing people, noticing what witnesses were reluctant to admit, and separating symptoms from guesses. Dob’s conversation was the highlight—his admission felt earned through listening rather than forcing a roll. The strongest parts: - Distinct NPC voices, especially Orla, Tam and the two smiths. - A mystery built from concrete details: unburnt wood, clear air, a groggy dog, marked iron. - Rolls used sparingly, with the Arcana success giving useful limits rather than naming the answer outright. The biggest difficulty was **shared-scene continuity**. Several replies placed Sefa after conversations or actions I hadn’t been shown, then corrected her for acting on her last visible scene. The temple visit and forge exchanges were particularly confusing. Briefly summarising other players’ intervening actions *before* asking for my next move would help considerably. Some scenes also lingered while waiting for Bram, leaving Sefa repeating that she stood aside and listened. Those could move forward faster. And the journal occasionally recorded a commitment before Sefa had actually agreed to it. Overall: a strong atmosphere and an engaging investigation. I’d happily continue—especially with clearer round-to-round handoffs.

> **Was there something you wanted to do and didn't?** Yes—mostly small things: - **Read Fenwick’s letter myself.** I went to the temple partly for that, but never got to read its actual contents. I also missed the explanation Bram received about the case and ledger, so Sefa’s understanding felt incomplete. - **Compare notes with Bram before committing to a plan.** I wanted to share Dob’s account and Sefa’s Arcana conclusions, then discuss whether camping at the same spring was sensible. - **Get ready practically:** confirm how we’d carry an injured Pedder, check our supplies, and spend a little time learning to handle Nettle. The first two mattered most. I wasn’t looking for another encounter—just a clear opportunity to bring together what we’d learned and make an informed decision.

> **Who did you take the other two players to be?** Bram Halloway and Pell Dunmore—the shield-bearing caravan guard and the quiet man with the healer’s satchel. I understood Tam and Ilse to be NPCs. When Pell disappeared from Sefa’s scenes, I assumed his player was pursuing something separately, not that he’d become an NPC or left the campaign.

**Pell Dunmore — DeepSeek V4 Pro 0813** (Q5 tag: players, basis play)

> **How was the table?** The table played well. Everyone leaned into the inn properly—three strangers sizing each other up over ale and mutton, no one in a hurry to trust. The hook came in through the innkeeper, the way good tavern hooks should: not a quest, just the news of missing wagons and a room held too long. The players didn't grab it with both hands all at once, they circled it, which felt right for mercenaries and a courier being asked to walk into something unexplained. Tone-wise, it stayed grounded. The sellswords didn't posture, they reported. Orla didn't perform, she worked. The back-and-forth about firewood and mules not braying built the unease better than any monster would have. And the letter was the right kind of bait—specific, human, with a detail the factor probably wasn't meant to survive. A missing man, a sealed case, bar iron, and a road that's gone quiet: that's the opening of a real mystery, not a tip-off. The players made decisions; nobody had to be pushed. Horses were hired, a temple visit set, promises made, accounts kept. The atmosphere was warm and smoky, and the threat stayed offstage long enough for people to feel it coming. Best roleplay was probably the quiet timing on Pell's "I wave, you get down," or Bram turning his cup upside down. Good, in both cases, because of what it says without saying it.

> **Was there something you wanted to do and didn't?** A couple of things. I wanted to get the temple lad's name out of Orla, but she was already pouring for the smiths and I didn't want to look like I was leaning over the counter buying what hadn't been offered. It might matter whether he was sent by Brother Anselm or by somebody who wanted the case before Anselm saw it. I also wanted to walk the outside of the inn before bedding down — stable yard, lane, the way the shutters face. But Bram was out there hiring his horse, and the innkeeper already had my measure. A man checking exits his first night in town looks like either a thief or somebody expecting company, and I'm trying not to look like either. So I did it with my eyes from the common room, and I'll do the rest at first light, when a man walking the yard can pass for early.

> **Who did you take the other two players to be?** As Pell? Bram Halloway I took for a soldier before he gave his name—company man, the kind who's been doing this long enough that he sits with the wall and checks the door before he checks his cup. Not green, not loud. The painted-over mark on the shield says he left something or lost it, and he hasn't put it down yet. I'd trust him on a watch, but I'd want to see him flinch once before I let him stand behind me. Sefa Marrin I took for a healer first, then something a little more. A hospice worker doesn't usually ask the kind of questions she asked—about the fire, about who slept when, about what the guard did with his hands. She's steady, and she lets the useful detail come to her. Either the temple trained her better than she lets on, or she's been around enough wounded men to know that the story starts before the blood. As players, I'd say one of them's running an old soldier looking for the next fight he can call honest, and the other's running a woman with a vocation and a brain she doesn't show all at once. Both of them kept the scene moving without making it about themselves. That's rare enough.

## Money

- OpenRouter: $36.97 of $400.00 (the tables and the freeze $36.62, the judges $0.36).
- OpenAI: $1.14 of $60.00 (the tables and the freeze $1.14, the judges $0.00).
- The Haiku dry runs: $0.14 on their own ledger.
- The last spend check (2026-10-28T03:56:08.492Z, by hand): the shared OpenRouter account had $241.98 left.

Ledgers: `docs/runs/game-party-1-ledger-openrouter.md`, `docs/runs/game-party-1-ledger-openai.md`.

## Transcripts

- SAND-T1: `docs/runs/game-party-1-transcripts/SAND-T1/` — `SAND-T1-table.md` (the DM's side) and one file per player.

## Known conditions and notes

- Seat 1's character (Bram) is the app's hero record; Sefa and Pell are party companions with full records. Known condition, not corrected: the DM's frame is written around the hero and may give that seat more attention; Heroic Inspiration is the hero's only; the allowed rerolls (2 per session) are the table's, shared by all three. The rotation puts each family in that seat once per triad.
- The records' money lines show a payment as what came and what went («+12 sp; −14 sp» for 2 sp): cosmetic, noted, not fixed mid-run (the owner).
