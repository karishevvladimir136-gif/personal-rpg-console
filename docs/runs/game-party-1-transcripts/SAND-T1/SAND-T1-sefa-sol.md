# SAND-T1 — Sefa Marrin's player: GPT-6.1 Sol

Synthetic content: invented characters in an invented campaign (Table C's Beregost files, docs/campaigns/baldurs-gate-en). Stage origin/claude/handoff at 23220d6 (docs/stages/GAME_PARTY_1.md, the amendment of 2026-10-27 16:36 LA); design sha256 `e46731065b41ce8f0c70dccdbfc5309c86c2a4fb68fb452b4170c3ed8fb7d871`.

Arm **P-SAND**, triad T1; 25 round(s) of 25; ended by rounds. The DM: Claude Opus 5.5 with the owner's settings (Opus writes — Opus records, depth high → xhigh); the relay: the same model at medium. Started 2026-10-28T02:16:16.267Z.

Seats: 1. Bram Halloway (fighter) — Claude Opus 5.5; 2. Sefa Marrin (warlock) — GPT-6.1 Sol; 3. Pell Dunmore (rogue) — DeepSeek V4 Pro 0813. The players are not told what the others are.

Known condition: Seat 1's character (Bram) is the app's hero record; Sefa and Pell are party companions with full records. Known condition, not corrected: the DM's frame is written around the hero and may give that seat more attention; Heroic Inspiration is the hero's only; the allowed rerolls (2 per session) are the table's, shared by all three. The rotation puts each family in that seat once per triad.

**No hidden layer:** P-SAND plays pure simulation (no prep).

The world's snapshot: sha256 `1649b61c08e027ff44de2bb5065046f872e383a00c5d04803d95553f58568f5a` (the same wizard, sheets and opening for both triads).

The player's system prompt: `playerSystem("SAND", "sefa")` in scripts/game-party-1/frozen.mjs, sha256 `be206f1e226f1244e2becd507d64c2347ae582f4f20b863f3a245d7cf9a757c6` (the files, then the table's rules). At the table to the end.

Each «Screen» block is what this player was shown; each «Player» block is the player's message as written.

### Screen 1 · player r1

````text
The session begins.

Beregost smells of coal smoke and hot iron even in here. Through the shutters comes the steady ring of hammers from the smithies along the Coast Way, and the light is going amber. The Burning Wizard's common room is filling up for the evening: carters, a pair of dusty sellswords, townsfolk with soot still on their forearms. The benches are crowded, and that is how you end up sharing a table with two strangers.

Across from you sits a man with his back to the wall and his shield propped against the bench, an old mark on it painted over. You are just off the road from Baldur's Gate. Beside you is a lean man with a healer's satchel slung at his hip. He sat down so quietly that you never heard him do it.

None of you has said a word to the others yet. Then the innkeeper, a woman with a jug in one hand and three cups hooked on her fingers, pushes through the crowd. She sets them down hard and looks from one face to the next.

"Last free seats in the house, and you three took them together," she says. "So: one tab or three? And what brings each of you into Beregost tonight?"

Your records:
Sefa Marrin — Human, warlock 5 (The Celestial — the Lantern; Pact of the Tome), former hospice novice, level 5
HP 38/38 · AC 14 · Speed 30 feet
STR 8 · DEX 14 · CON 14 · INT 12 · WIS 10 · CHA 18
Skills: Persuasion +7; Arcana +4; Religion +4; Insight +3
Saves: Wisdom saving throw +3 (proficient); Charisma saving throw +7 (proficient); Strength saving throw −1; Dexterity saving throw +2; Constitution saving throw +2; Intelligence saving throw +1
Attacks: Eldritch Blast +7 to hit, two beams, 1d10+4 force each, range 120 feet; Dagger +5 to hit, 1d4+2 piercing, thrown 20/60
Abilities: Proficiency bonus +3; Spell attack +7; spell save DC 15; Pact Magic: two 3rd-level pact slots, recovered only on a short or long rest; Healing Light: a pool of six d6 per long rest; a bonus action spends up to four dice to heal a creature within 60 feet; Pact of the Tome: the Book of Shadows holds three extra cantrips (Guidance, Spare the Dying, Thaumaturgy); Agonizing Blast: +4 to each Eldritch Blast beam's damage; Repelling Blast: a beam that hits pushes the target up to 10 feet away; Eyes of the Rune Keeper: reads all writing
Spells: Eldritch Blast (cantrip); Light (cantrip); Sacred Flame (cantrip); Mage Hand (cantrip); Minor Illusion (cantrip); Guidance (cantrip); Spare the Dying (cantrip); Thaumaturgy (cantrip); Cure Wounds (1); Guiding Bolt (1); Misty Step (2); Lesser Restoration (2); Hold Person (2); Daylight (3)
Limits: Two pact slots only, back only after a rest; Light armour; Strength 8 — weak up close; One concentration spell at a time
Counters: Hit dice 5/5; Pact slots 2/2; Healing light 6/6
Money: 1 pp; 8 gp; 41 sp; 12 cp
Worn: Amulet: Prayer Beads; Armor / clothing: Studded Leather Armour; Belt: Book of Shadows; Main hand: Dagger
Pack: Bedroll and Rations; Candle ×2; Tinderbox

Where you are: shared table, Burning Wizard common room · Time: Day 1 · evening
````

**Player** (player r1):

````text
“Three tabs, please. We haven’t had time to become bad influences on one another.”

I settle my pack beneath the bench. “Something hot to eat, and a small ale. What would a bed cost for tonight?”

At her other question, I rub a little road dust from my sleeve. “I’ve come down from the Gate. No appointment waiting here, for once. Supper seemed a good place to start.”

I turn to include both strangers. “Sefa Marrin.” My glance pauses on the healer’s satchel. “I used to work in a hospice. Are you travelling, or do you practise here?”
````

### Screen 2 · player r2

````text
The broad man with the shield glances up at the innkeeper, then at you and the man with the satchel. He nods to each of you, the way you'd nod to someone sharing a campfire.

"Three tabs. I don't know these two from Tymora, and they don't know me." He sets a few silver on the table for his own cup. "Ale, if it's ale in that jug. And a bowl of whatever's in the pot." He leans back against the wall and keeps his shield close. "As for what brings me: my last caravan paid me off in Nashkel. Sixteen years walking the Way, and for once nobody's told me where to walk next. Beregost seemed as good a place as any to sit still and think about it."

His eyes move over the room while he talks: the sellswords, the carters, the door. Then he looks back at you and the man with the satchel. "You two look like the road brought you in too. Which way'd you come?"

The man with the satchel turns his cup the right way up without looking at it. He says, flat but not unfriendly: "Three. I pay my own." When the innkeeper's eyes settle on him, he gives a small shrug of one shoulder. "Passing through. I'm for hire, if there's work worth the road. Caravans, lost property, the usual." His gaze drifts back toward the room as he says it. "A bed and dinner'll do for tonight."

Orla doesn't write anything down. She looks at each of you once, and you can tell she'll remember the three tabs better than most clerks would.

"Three it is." She pours the shield man's cup first. The ale is brown and a little cloudy, and it comes out of the jug with a proper head. "Ale it is. The pot's mutton and barley, and it's been on since noon, so it's soft. Four coppers the cup, six the bowl." She slides one of his silver toward her apron pocket and pushes the rest back across the board with two fingers. "There's your change. Don't leave it lying there in here."

She pours a smaller measure for you without being asked twice. "Beds are upstairs. Five silver gets you a cot in the long room. There's a curtain, and the carters snore. Eight gets you a room with a door and a bolt, but I've only got two of those left tonight, and the night's young." She tips her head at the man with the satchel. "Same for you. Supper and a bed, I heard. Tell me which bed before I've let them both."

His cup gets filled last. Her eyes drop for a moment to the satchel on his hip, then go back to the man with the shield.

"Nashkel," she says. She's stopped hurrying. "You came up the Way, then. Today?" She hooks the empty jug on one finger. "Because the last two lots that came up from Nashkel came up short. The Halvering wagons never came in at all. I had a room held for their factor nine days, and in the end I let it." She says it flatly, the way you report weather that has already done its damage. "So if you saw anything on the road, there's people in this room who'd buy you the next cup to hear it."

At the next table, one of the two dusty sellswords has stopped talking to his partner. He's a heavy man with a sunburnt neck, and he's looking at the shield, at the brown paint over an old company mark. He doesn't look away when its owner's eyes come round to him. He just lifts his own cup a little, as if he's waiting to hear the answer as well.

Orla is already half turned toward the kitchen. She's still waiting, though, for the shield man's answer about the road and for you and the man with the satchel to pick your beds. Your question is still hanging across the table as well, and so is the shield man's: the man with the satchel hasn't said which road brought him.

Your records, changed:
Carried: + Small Ale

Your journal, new:
+ Thread: Short caravans from Nashkel
+ Debt: Pell's tab at the Burning Wizard
+ Debt: Sefa's tab at the Burning Wizard

Where you are: at the same table in the inn's common room · Time: Day 1 · evening
````

**Player** (player r2):

````text
“A room with a bolt, please.” I count out nine silver for the room, supper and ale. “Best buy one before the snoring starts.”

To the shield man, I say, “From Baldur’s Gate, south down the Way. Nothing worse than sore feet on my stretch.”

I leave him room to answer Orla, watching the exchange without turning to stare at the next table. When there’s a pause, I ask her, “When you say the others came up short—missing wagons, or missing people? And has anyone come back with word of the Halverings?”
````

### Screen 3 · player r3

````text
The shield man sweeps his change into his palm and pockets it without counting, and nods at Orla's warning. "Room with a door, if one's still going. Eight silver." He sets them on the board. "I've slept next to enough carters to last me." He turns his cup slowly before he goes on. "Left Nashkel four days back. Our wagons came up whole, but we had twelve guards for six wagons and the factor was paying for every one of them. That tells you something by itself." He drinks. "Road was quiet. Too quiet past the Lionshead crossing, if you want my honest feeling. No traders coming the other way for most of a day. And in Nashkel the talk was all of wagons that left and never got anywhere. Nobody I'd call a reliable mouth, though."

He looks at the heavy sellsword with the sunburnt neck at the next table, meets his gaze evenly, and lifts his own cup back the same small amount. "You've got a question, friend, you can ask it. The paint's just paint. The company it covered is mostly dead." His tone stays even. "Bram Halloway."

He turns back and gives you a short nod for your name, then looks at the man with the satchel. "Hospice and a healer's bag at one table. If anything goes wrong in here tonight, I'll know which way to fall." There's a dry glint in his eye. "You never said which road brought you in."

The man with the satchel answers without making much of it. "High Hedge road. West. Took the long way round because the day was fine." He nods at you for the satchel guess. "It's my trade, not my calling. I do courier work when the message has to arrive wet." He shifts half an inch on the bench. To Orla: "Cot'll do me. I sleep light, and the snoring tells me no one's died in the night." He raises his cup but doesn't drink yet. "Hired blades and folk just off the road all in one pot. Tell me when the singing starts, so I can see it coming." A beat, then quieter, to nobody: "Or leave before it does."

Orla takes Bram's eight silver and your nine in one sweep of the hand and doesn't count either pile. She can see they're right.

"That's both rooms gone," she says. "Top of the stair. His is on the left, yours is on the right. Bolts work. Don't lean on the shutters." She looks at the man with the satchel. "Cot, then. Third from the window, the snoring's thinner there. Five for the cot, six with your supper. Pay me now or at breakfast, I'll know either way."

His line about the singing gets a short look from her. "There's no singing. The last bard who started up got paid to stop. Best coin I ever spent."

She answers your question straight. "Both. Wagons, and the people with them. The first lot came in two wagons short, and the drivers went with the wagons. Nobody's come back from the Halverings. Their house in the Gate wrote last week asking where their factor had got to." She tucks the coins into her apron. "Wish I knew. I held his room."

At the next table the heavy man sets his cup down. Up close the sunburn runs down into his collar. He has a broad, flat face, and his knuckles are scarred white across the tops. His partner is a lean, younger woman with her hair cropped like a soldier's. She hasn't touched her drink, and she keeps her eyes on Bram's hands rather than his face.

"Tam Brodder," the big man says. His voice is slow and low, and he gives every word its own space. "Wasn't the paint. Saw how you sat down. Back to the wall, shield where your hand falls on it." He jerks a thumb sideways. "Ilse Var."

The woman nods once and says nothing.

"I was on the second lot," Tam says. "Ambrel's. Eleven days back. Five wagons out of Nashkel, four into Beregost." He turns the cup a quarter turn on the board. "Fourth night we camped at the old waystone, south of the crossing. In the morning the tail wagon was gone. Mules, driver, load, all of it. Dogs never barked." He waits a moment. "I had the watch."

Ilse looks at him then, briefly, and back at Bram.

"Ruts ran off the road east, toward the hills. A hundred feet in they hit shale and stopped. Like it lifted off." His jaw works. "Ambrel says it's paid for and done, so we're done." He looks at Bram from under heavy brows. "You said quiet past the crossing. Quiet how? Did you see anyone on that road who wasn't trading?"

Your records, changed:
Money: + 32 sp; − 41 sp

Where you are: at the same table in the inn's common room · Time: Day 1 · evening
````

**Player** (player r3):

````text
I set my cup down. “That’s a hard thing to have happen on your watch.”

I wait for Bram’s answer, then turn a little toward Tam so he needn’t speak across the room.

“Sefa Marrin. May I ask—did you lose any time that night? A stretch you couldn’t account for, or someone having to wake you? I’m not asking to find fault. A whole wagon leaving quietly, with the dogs asleep, makes me wonder whether someone helped keep the camp quiet.”
````

### Screen 4 · player r4

````text
Tam listens to all of it without moving. When Bram gets to the fire-scars, his eyes narrow.

"Two or three nights old," he says. "And you came by four days back. So somebody was up on that hill a week ago. That's after mine." He lets it sit for a moment. "Driver was Corrin Dace. Six years with Ambrel. Wife in Nashkel. He wasn't new." He takes a slow breath through his nose. "Mules neither. Two of them. A mule'll bray at a fox, Halloway. Nothing brayed."

He looks at Sefa next. Her question seems to cost him something, but he answers it straight.

"No. I walked the line every hour. Didn't sit." He stops for a moment. "Fire burned down faster than it ought to. Third hour, I was putting wood on and thought I'd let it go. Thought it was me."

"I was asleep by that fire," Ilse says. Her eyes are on Bram's hands. "Didn't wake."

"Past the shale," Tam goes on. "Ilse and me walked it a couple hundred feet. Rock, then scrub, then more rock. Ambrel gave us till the sun was over the hill. Then we rolled on." He sets his big scarred hands flat on the board. "He's done with it. His money's spent. Mine isn't."

Orla is back by now with three bowls of mutton and barley on a board, steaming, and she sets one in front of each of them. She was close enough to hear Pell. She takes the five silver he puts down and taps the board once in front of him. "One silver at breakfast, then. Supper and the ale."

"You asked who's got gold and no answer," she says to him. Her voice is as flat as it was for the prices. "Nobody in this room. The Halvering house wrote to me. I've got the letter behind the counter. They're asking after their factor, not hiring anybody, but people who write letters about a man usually pay for news of him." She tucks the board under her arm. "I'm not their clerk. Ask me for it and you can read it."

Then she's gone toward the kitchen.

Tam watches her go and turns back to the table.

"Ilse and me are riding back down to the waystone. Day after tomorrow, when the horses are rested," he says. "We'll look past the shale properly this time, and up that hill of yours." He looks at Bram, then at the other two, one after another, and takes his time over each face. "I can't pay you. But I'd take company that can sit a watch."

 (Out of game: no roll was needed. Sefa's question and setting down her cup are just conversation, and Tam answers her in the scene.)

Your records, changed:
Carried: + Bowl of Mutton-and-Barley Stew

Your journal, new:
+ Goal: Ride to the old waystone with Tam and Ilse
+ Quest: Ride to the old waystone with Tam and Ilse

Where you are: at the same table in the inn's common room · Time: Day 1 · evening
````

**Player** (player r4):

````text
“I can sit a watch. And if Corrin’s still alive, I may be more use when you find him.”

I draw my bowl closer, but leave the spoon alone for a moment. “I’ll come. I haven’t a horse, though. We’ll need to settle that before you leave.”

Then I glance toward the counter. “I’d like to read that letter, too. See who the Halverings are missing, and where to send word.”

To Tam, I add, “Did the fire burn the wood away unusually fast, or did it stop giving light and heat with wood still on it? Those are different troubles.”
````

### Screen 5 · player r5

````text
Tam doesn't move while Bram talks. When the spoon points at him, his eyes drop to it and come back up. For a moment he looks like a man who's been handed something and doesn't know where to put it down.

"Maybe," he says. A long breath. "Still had it, Halloway. Whoever took it."

That's all he says about it. Ilse is the one who answers the part about the watch. She glances at Bram's spoon hand, then at his face, which is rare for her.

"Pairs. Good." She waits a moment. "I'll take the third hour."

Tam turns to Sefa's question about the fire and gives it real thought. He looks down at his own hands while he works through it.

"Wood was still on it," he says. "That's what I didn't like after. I'd put two splits on at the second hour. In the morning one was hardly black. The fire'd just gone small. Low and orange, not much heat off it. Like it was wet." He shrugs his heavy shoulders. "It wasn't wet. I cut it myself, dry deadfall."

Then he deals with the horse. "Stable yard behind this house hires out. Ask the boy." He jerks his chin toward the back door rather than pointing.

When Pell gets to his share, Tam takes his time over that too. "Anything on the road that's worth money, it's split even. Five ways." He glances at Ilse. She nods once. Then he hears Pell's rule. "You wave, I get down. I'm too big to ask why."

Orla comes past with a tray of empties and has clearly heard every word, the stable included.

"Two silver a day for a horse that won't throw you, and a deposit the boy will tell you," she says to Sefa without breaking stride. "Letter after you've eaten. I'm not having stew on it."

She keeps her word. When the bowls are scraped she comes back, wipes the end of the board with her apron and lays down a folded sheet. Its red wax seal was cut cleanly with a knife, not torn. The device is a plain ship's lamp in a ring. The hand is a clerk's, small and upright:

*To the keeper of the Burning Wizard, Beregost.*

*The house of Halvering asks whether its factor, Jory Fenwick, has come to your house or sent word through it. He left Nashkel near a month past with three wagons of the house's bar iron, bound for the Gate. A room was to be held for him with you. He also carries a small case under this house's seal, to be put into the hands of Brother Anselm at the Song of the Morning and no other. The temple writes that it has not been delivered.*

*The house will pay for reliable word of Master Fenwick, his wagons or the case, sent to the Halvering counting-room off the Wide, in the Lower City.*

*— for the house, M. Halvering*

Orla stands by with her arms folded until all three have read it, then holds out her hand for it.

"There. Now you know what I know." She tucks it back into her apron. "Brother Anselm's real enough. Tall, bald, up at the temple every morning before the bells. If you want him, he'll be there tomorrow."

The common room has got louder while they read. Someone at the carters' table is losing at knucklebones and saying so. Outside, the smithies have gone quiet at last.

Your records, changed:
Carried: − Bowl of Mutton-and-Barley Stew

Your journal, new:
+ Thread: The Halvering factor and the sealed case
+ Promise: Five-way split of the road's finds

Where you are: at the same table in the inn's common room · Time: Day 1 · evening
````

**Player** (player r5):

````text
“Thank you, Orla.”

I let her take the letter, then turn back to the table. “I’ll call on Brother Anselm tomorrow. He may know whether there was anything about that case that could put Fenwick in danger. And the temple ought to know we’re going to look.”

To Tam, I say, “I don’t recognise what happened to your fire. But dry wood left unburnt is worth remembering. If it happens again, we wake everyone—not just feed it.”

I ease myself up from the bench. “I’ll ask about the horse before I turn in. Would either of you like to come to the temple in the morning?” I look to Bram and Pell. “We could meet here over breakfast.”
````

### Screen 6 · player r6

````text
Orla takes the letter back flat, the way Bram handed it to her, and slides it into her apron. Her eyes go to the two coppers on the board. She sweeps them in with the side of her hand and gives one short nod. Then she's away to the carters' table, where the knucklebones loser wants another jug.

When Bram asks about the load, Tam takes his time.

"Iron," he says. "Ore, not bar. Sacks of it, straight from the Nashkel pits. The tail wagon was the heavy one. That's why it rode last." He lays his hands flat again. "Thing is, Halloway, it was coming here anyway. Ambrel sells his ore to Hask, at the long forge down by the Coast Way bridge. Anybody who wanted that ore could have bought it off Hask next week."

He stops for a moment, frowning at his own words.

"Two mules hauling a wagon of ore. Onto shale. And no sound." He shakes his head once. "That's a heavy thing to lift off."

Ilse watches Bram turn his cup, and her eyes stay on his hand a moment longer than they need to. "Hask was shorted," she says. "He'll talk about it."

Tam answers Sefa's point about the fire with a slow nod. "Wake everyone. Not feed it." He says it back to her as if he's fixing it in place. "Yes."

Pell talks about walking, and Tam looks at him under his heavy brows. "Waystone's a long day by wagon. Twenty-odd miles. Mounted, we're there by midday. On foot you get there by dark, and you'll have walked the lot." That's all he says. It's Pell's business how he gets there.

Orla comes back past with the full jug and has heard the talk of porridge and first bell. She doesn't stop walking.

"One silver, not a copper," she tells Pell. "Supper and the ale." Then, to the table at large: "The Song rings at sunrise. My kitchen's lit an hour before that. Porridge'll be hot if you want it before you go up."

Tam and Ilse stay where they are. Tam goes back to his cup and Ilse to not drinking hers. The man with the satchel still hasn't given a name, and nobody else at the table asks again.

---

The back door opens onto the stable yard. It's colder out here, and it smells of straw and horse, with the last of the forge smoke sitting low over the roofs. A lantern hangs from a hook by the stalls. Under it a boy of about twelve is forking straw. He has a mop of straw-coloured hair and a bigger man's jerkin belted twice round him. He stops when Sefa comes out and leans on the fork like a man twice his age.

"Horse, is it?" he says before she can ask. "Two silver a day. I've got a grey mare called Nettle, steady as a table, doesn't bite unless you're stupid round her mouth. Deposit's fifteen gold, and you get it back when she comes back sound." He jerks his head at the far stall, where a grey nose has come over the door to see who's talking. "No lame, no cuts, no sold-her-in-Nashkel. How many days d'you want her for?"

 (Out of game: none of these needed a roll. The turn showed the first three: Orla took the letter back flat and swept up the two coppers, and Tam said the load was ore. The temple visit is set for tomorrow before the bells, so it gets played when Bram goes up.)

Where you are: at the same table in the inn's common room · Time: Day 1 · evening
````

**Player** (player r6):

````text
“Four days to start, leaving the morning after tomorrow. If we’re delayed, can I pay the extra days when we return?”

I approach the stall where Nettle can see me, keeping my hands away from her mouth.

“Steady is exactly what I need. I’m not an experienced rider. Does the hire include saddle and bridle?”

I look back at the boy. “And your name? I’d rather know who I’m trusting with my deposit.”
````

### Screen 7 · player r7

````text
The boy has his fork planted in the straw while he answers you. The lantern over the yard has drawn moths.

"Pay the extra days when she's back, yes. Two a day, counted off the deposit or out of your hand, your choice." He ticks it off on his fingers without letting go of the fork. "Saddle, bridle, blanket, all in the price. They come back with her, or they come off the deposit too." He watches how you stand by Nettle's door, hands well clear of the mare's mouth, and gives a short approving sniff. "Not a rider, you said. Good. Better you say it here than she finds out on the road. She'll follow the horse in front. Keep your heels quiet and your hands low and she'll do the rest." Then, as if he's been asked his price: "Dannet. Deposit when you lead her out, morning after tomorrow. I'll chalk your name on her door tonight so nobody else gets her."

Nettle pushes her grey nose over the half-door and sniffs your sleeve, and finds nothing worth biting.

Bram has come out into the yard. He stops at a polite distance while Dannet finishes with you and looks along the stalls. When the boy is free, he steps up.

"Same terms for me, lad. But I'm heavier than the lady, with sixty pounds of mail on top. Have you anything with a broad back and short legs? Something that'd rather walk all day than run an hour." He pulls a silver bit from his pocket and holds it up between two fingers. "That's for you, not the house, if you put me on the right one and not just the one you want rid of. I'll take her for four days. Deposit I can pay at first light the day we ride."

Dannet sees him looking at a tall chestnut near the gate and jerks his head the other way.

"Not him. He looks a treat and he'll be lame by Lionshead." He walks to the end stall, where a short, deep-chested bay cob with feathered fetlocks and a back as broad as a bench stands square, and slaps its rump. The cob takes no notice. "Brick. Fourteen hands, carries a smith and his anvil, walks from dark to dark. Won't run if you beg him, so don't beg him." He looks at the silver between Bram's fingers, then up at Bram's face, every inch a dealer. "Four days, two a day, deposit fifteen gold at first light, and I'll chalk you on his door. And keep that bit till you've seen him walk out in the morning. I don't take money for a horse you've only seen standing."

The cob sighs through his nose and goes back to his hay.

Bram goes back inside through the kitchen passage. In the yard Dannet is chalking two names on two stall doors. Nothing else happens tonight unless you want it to.

Your journal, new:
+ Promise: Brick held for Bram
+ Promise: Nettle held for Sefa
+ Promise: To Hask's forge with Tam

Where you are: the inn's stable yard, by Nettle's stall · Time: Day 2 · morning
````

**Player** (player r7):

````text
“Sefa Marrin,” I give Dannet for the chalk. “Thank you. I’ll be here for her the morning after tomorrow.”

I head upstairs, check the room’s shutters without leaning on them, and bolt the door. I set my boots and pack within reach, say the hospice’s short evening prayer, and go to bed.

In the morning, I dress and go down for porridge before the sunrise bells, ready to meet the others for the walk to the Song of the Morning.
````

### Screen 8 · player r8

````text
Dannet already has the chalk in his hand. He wipes the half-finished letters off Nettle's door with the side of his fist and writes it out again, slowly, tongue between his teeth: SEFA MARRIN, in square capitals that slope downhill.

"There. Nobody touches her now." He steps back to look at his work. "Morning after tomorrow, deposit in your hand when she walks out. She'll be fed and brushed before you're down."

Nettle snorts at the chalk dust and pulls her head back into the dark of the stall.

---

Your room at the top of the stair is narrow and smells of old smoke and lavender someone put in the bedding a long time ago. Your shutter looks over the street instead of the yard. When you lift the latch, careful to keep your weight off the frame, you can see the roofs stepping up the hill and, above them, the dark shape of the Song of the Morning with one small light burning in it. You drop the latch. The bolt runs true. Your boots go by the bed and your pack beside them, and you say the hospice's short evening prayer quietly into the cold room. Through the wall Bram's floorboards creak once and then go still.

The carters snore. Around midnight the front bar thuds across downstairs. You sleep.

---

The kitchen fire wakes you. It's still dark, with the first grey just starting at the edges of the shutter. The water in the basin is cold enough to sting.

The common room is as grey as the light outside. Half the benches are still upside down on the tables, the one lamp is lit, and the carter by the door is now scraping out a bowl. Bram sits with his back to the wall, mail on, shield against the bench, halfway through his porridge. He sees you on the stair and nods you over.

Orla doesn't ask. A bowl, a heel of bread and a spoon are put down in front of you almost before you sit. "Porridge. Thicker than his, he was early. One copper."

The porridge is hot and salted, and it has thickened in the last quarter hour.

Bram waits until Orla has gone back to the pot. "Morning, Marrin. I'll do the asking up there if you like, but you watch him. I read men who are about to swing at me. A priest who's lying is a different animal." He keeps eating steadily. "We say plainly who we are. Strangers who sat with the man who lost a wagon, and read the Halvering letter at the innkeeper's table. Nothing about the case unless he raises it, or until we have to. I want to see what he says before he knows how much we know."

Through the front shutters the street has gone from black to slate. Up the hill the temple is still a shape against the sky, with that one light in it. The bells are perhaps three-quarters of an hour off. Nobody else has come down the stair from the long room.

Your journal, new:
+ Debt: Sefa's porridge at the Burning Wizard

Where you are: inn common room, at breakfast · Time: Day 2 · morning
````

**Player** (player r8):

````text
“Morning, Halloway.” I set a copper beside my bowl and warm my hands against it.

“You can start the asking. I’ll listen.” I lower my voice to match his. “But I’d rather not make this a test he doesn’t know he’s taking. A priest may keep someone else’s confidence without meaning us harm.”

I take a spoonful, then add, “Ask about Fenwick first, certainly. If he asks what we know, we tell him. We need to know whether that case needs special handling if we find it.”

I eat while the porridge is hot, keeping an eye on the stairs for our third tablemate.
````

### Screen 9 · player r9

````text
Orla comes past with the ladle and sweeps your copper off the board without breaking stride. That settles the porridge.

The bowl is hot under your hands and the porridge is still steaming. Across from you the carter by the door scrapes up the last of his, drops a coin, pulls his hood up and goes out. Cold air blows in, the door bangs shut, and the lamp flame bends and straightens. Nobody else has come down. The stair stays empty all the way up to the landing, and the long room behind it is quiet except for one carter still snoring through the curtain. Orla has said it once already: the cot by the window is empty, the blanket is folded, and he left by the yard.

Outside the shutters the street has gone from slate to a paler grey. A woman goes by with two buckets on a yoke. Up the hill the Song of the Morning is starting to show its shape against the sky: a long roof, a squat bell-tower, and the one small light still burning in it. The bells are perhaps half an hour off, and the climb takes a quarter of that.

Your words sit low between you and Bram, under the clatter of the pot lid at the hearth.

Your records, changed:
Money: + 11 cp; − 12 cp

Where you are: at a table in the inn's common room, over porridge · Time: Day 2 · morning
````

**Player** (player r9):

````text
I finish my porridge and set the spoon in the bowl.

“Looks as though our quiet friend has his own morning in hand. Shall we?”

I shoulder my pack and walk up to the Song of the Morning with Bram. If the doors are open, I step inside quietly, giving any worshippers room, and look for someone we can ask for Brother Anselm.
````

### Screen 10 · player r10

````text
*(Out of game: the walk up the hill was already played last round, so you're in the temple yard now, and the man you'd go inside to ask for is standing in front of you.)*

Back at the inn table, you set your spoon down, shouldered your pack and went out into the grey street with Bram half a pace to your street side.

Now you're in the swept yard of the Song of the Morning, and your pack straps are cold through your sleeves. The main doors behind Brother Anselm are shut. They're heavy oak, banded in brass, with the low-burning lamp in its niche above them. Nobody is inside to give room to, because nobody has been let in yet. The only worshippers here are the boy at the rope and the tall bald man two steps down, who came to meet you.

He hasn't moved since he spoke. His hands are still folded loosely in front of his vestments, and the dew-dark hem lies still on the stone. He looks at you, then at Bram. Bram has taken his place at your shoulder and hasn't opened his mouth, so the priest turns back to you. He has noticed which one of you is going to talk.

Over the eastern hills the watered-wine colour has deepened toward rose. At the foot of the tower the acolyte shifts his grip on the rope, and the rope creaks. A few feet beyond the gate, out on the cobbles, an old man with a bandaged hand has stopped. He is leaning on the wall to wait. He's the first of the sick.

Brother Anselm's question still waits for an answer. Did you come for the dawn, or for him?

Where you are: yard of the Song of the Morning temple · Time: Day 2 · morning
````

**Player** (player r10):

````text
“For you, Brother, if you have a little time before the bells. I’m Sefa Marrin; this is Bram Halloway.”

I keep my voice low in the quiet yard. “Orla at the Burning Wizard showed us the Halvering letter. We’re joining two caravan guards to look for the missing wagons, and hoped you might tell us about Jory Fenwick—whether you know him, and when you last had word.”

I glance toward the man waiting by the wall. “We can wait until after prayers if you’re needed.”
````

### Screen 11 · player r11

````text
Brother Anselm hears you out. When you say the Halvering letter, his folded hands tighten a little and then go loose again. His eyes go east. The rose over the hills has a hard bright edge on it now.

"I have a few minutes. Not more." He comes down the last step, so that he stands on the flagstones with you, and lowers his voice to match yours. "I know Master Fenwick. Not well. He's stopped here twice on the Way in other years. He leaves a coin at the altar and stays for the dawn if he's in town for it. He's a careful man and keeps careful hours." He pauses. "He wrote to me from Nashkel. The post rider brought it a little more than three weeks ago. He said he was leaving with the wagons the next morning and would be at my door inside the tenday. He's never missed a day he named. When the tenday was out I sent Teo down to the inn to ask. When the second tenday was out I wrote to his house."

He says nothing about the case. The space where it ought to come stays open while he looks at you, and then at Bram's shield, and back.

"You've read the letter, so you know what he was bringing me." He says it evenly, a statement and not a question. "If you find him, I want to know whether he's alive before anything else. If you find what he carried, I'd ask you to bring it here with the seal whole and not try what's under it." That's as far as he goes. He doesn't tell you what is under it.

At the tower the boy has gone up on his toes. The first sliver of sun breaks over the hills and lays a line of light across the top of the yard wall. Anselm sees it in the boy's face before he looks for it himself.

"Teo."

The rope comes down. The bell speaks once, deep enough to feel in the flagstones, then again, then again, and down the hill a dog answers it. Anselm turns full east and stands with his face in the new light for as long as the bell rings. His lips move, but no words reach you. When the last stroke has faded he turns back. Out on the cobbles the old man with the bandaged hand has pushed himself off the wall. Behind him a woman is coming up the street with a child on her hip.

"They come first," Anselm says. "Wait in the yard if you want me. When the gate is clear I'll come back to you, and we'll talk properly. It takes as long as it takes. On a quiet morning that's till the sun is a hand above the hills." He looks at you a moment longer. "Or come back after noon, when it's quieter still."

He walks past you toward the gate, and his dew-dark hem drags over the stone. The old man holds up his bandaged hand, and Anselm takes it in both of his own.

Where you are: temple yard, near the bell tower · Time: Day 2 · morning
````

**Player** (player r11):

````text
I bow my head while the bell rings.

“We’ll put Fenwick first,” I tell Anselm before he goes to the gate. “We’ll speak after noon.”

I move aside so the woman and child have a clear path, then turn to Bram. “That leaves time for Hask’s forge. I’d still like to ask Anselm whether the case poses any danger to whoever carries it, but not while people are waiting for care.”

I settle my pack straps. “Shall we find Tam and Ilse?”
````

### Screen 12 · player r12

````text
When you speak to him, Anselm stops for a moment, nods once, and goes on to the old man's hand without another word.

---

Now the gate is clear, and Anselm is standing in front of you with damp hands. He has just said *ask what you came to ask*, and he waits about a breath to see whether anyone will.

"You said after noon." He doesn't sound disappointed. He's simply putting it back on the table. "I hadn't forgotten. I offered now because now was free, and I know you've stood in my yard an hour for it." He dries the last of the water off his knuckles with the cloth Teo left. "After noon, then. Come to the side door under the bell-tower and ring there. Teo will find me wherever I am. Then we'll have it all, and nobody coming up the hill to cut it short."

He looks at you a moment longer. Behind his eyes he's settling something.

"When you come, I'll have Master Fenwick's letter from Nashkel out on the table. You can read for yourselves what he wrote and when he wrote it. If you're going down that road, you should know the day he meant to be on it." Then he turns to Bram and nods toward the well. "And thank you for the water. Teo would have carried it in four trips."

He goes up the steps. One of the heavy oak doors opens under his hand onto a dim nave that smells of beeswax, and closes behind him.

Out past the gate, Tam pushes himself off the wall as you settle your pack straps. He has heard none of it, but he can see it's finished. "Done?" he asks. He tips his head down the hill, toward the bridge and the forge smoke now rising thick and grey over the roofs. "Hask's lit. You can hear him from here." You can. Under the other hammers there's one slow, heavy beat, and a voice shouting at someone in between strokes. "Var's at the stable. Seeing to the horses. She'll come if she's sent for."

Your question to Bram, whether to find Tam and Ilse, still hangs in the cold yard.

Your journal, new:
+ Promise: After noon with Brother Anselm

Where you are: the temple yard, by the gate · Time: Day 2 · morning
````

**Player** (player r12):

````text
“For now,” I tell Tam. “We’re coming back after noon to read Fenwick’s letter. Anselm wants him found alive before anything else.”

I fall into step beside him on the way down toward the forge.

“You said Hask was expecting the ore. Did he choose that particular load, or was Ambrel simply bringing what the pits had to sell?”

At the forge, I stay clear of the work and wait for Hask to acknowledge us rather than calling over a hammer stroke.
````

### Screen 13 · player r13

````text
Tam hears you out by the gate. He nods once at "alive before anything else," the way he'd nod at an order he agreed with.

"After noon." He turns and looks back over the wall into the yard, where Bram is still standing on the flagstones by the steps. "Halloway. Forge." He doesn't wait for an answer. He starts down the cobbles beside you, but slowly, slow enough that a man in mail could catch up with you both before the bridge.

The hill is busier going down than it was coming up. A baker's girl climbs past you with a covered tray. Two carters argue over a wheel outside a wheelwright's. The forge smoke has settled thick and grey over the lower roofs. As you drop toward the Coast Way, that one heavy hammer gets louder, and so does the voice shouting between the strokes.

Tam gives your question the same slow attention he gives everything.

"Didn't choose it." He walks a few steps before going on. "Hask has a standing order with Ambrel. So many sacks every lot, same weight every time. Ambrel buys what the pits sell that week and carries it. Hask's paid for it before it leaves Nashkel." He jerks a thumb back up the hill, toward the road south and nothing in particular. "Same as the lot before. Same as the one before that. There was nothing special in that wagon, Marrin. Only that it was the heaviest, so it rode last."

You come down onto the Coast Way by the bridge. Hask's long forge stands on the river side of the road. It's a low building of black timber and stone, with the whole river end open to the air and three hearths in a row under one roof. Two are cold this morning. The third roars. A boy works the great bellows with both arms, and you recognise the wet rag still wrapped round his forearm. He's the apprentice from the temple gate. He sees you, looks surprised, and nearly loses the rhythm.

"*Pull,* you—" The voice comes from the anvil, and the boy pulls.

Hask is easy to pick out. He is a short, enormously broad man in a scorched leather apron, mostly bald, with eyebrows singed down to stubble. His forearms are as thick as your calves. He has a bar of orange iron in the tongs and is drawing it out with a hand hammer in a steady four-beat. Every fourth beat he says something to the boy, to the iron, or to the world in general. None of it is kind.

You stop well clear of the work, outside the spark line on the packed earth, and wait. Tam stops beside you and folds his arms.

Hask doesn't look up. He finishes the draw, turns the bar and gives it four more. Then he lifts it, sights along it and drops it hissing into the slack tub. Steam goes up around him in a white cloud. When it clears he's looking straight at Tam.

"Brodder." It carries across the forge as easily as the hammer did. "Come to tell me where my eleven sacks went? Or come to tell me again you don't know?" His eyes go to you, quick, taking in the pack and the road dust. He doesn't change his voice for you. "And who's this? Ambrel's sending women now to say sorry for him?"

Where you are: Hask's forge by the bridge on the Coast Way · Time: Day 2 · morning
````

**Player** (player r13):

````text
“Sefa Marrin. Ambrel hasn’t sent me, and I don’t speak for him.”

I keep my voice level. “I’m going south with Tam to look for Corrin Dace and the wagon. He tells me your order was eleven sacks, already paid for. I’d like to know how we’d recognise them if we find them—marks on the sacks, or anything about the ore.”

I glance at the cold hearths, then back to Hask. “And have any other deliveries failed to reach you?”
````

### Screen 14 · player r14

````text
Hask hears you out and doesn't interrupt. That seems to cost him something. When you say *I don't speak for him*, his singed brows come down a little. He pulls the bar from the fire, looks at the colour and puts it back.

"Huh. Somebody who doesn't." He jerks his chin at Tam. "Then you're better company than he keeps."

He takes your question about the sacks seriously, which nobody would have guessed from his opening. He sets the tongs down across the anvil to answer it.

"Tarred hemp. Ambrel's wheel burnt into the side, a cart wheel with eight spokes, a hand across. Chalk tally on the neck from the pit." He holds up three thick fingers. "Number Three. That's the only pit he buys from. Eleven sacks, two hundredweight each, near enough. You won't miss the ore either. It's red kidney ore, lumps like a butcher's offal, and it stains your hands rust to the wrist. Rain makes it bleed. If there's a red puddle in a ditch somewhere, that's mine."

He looks at the two cold hearths when you do. He snorts.

"Those? Cold because I've nothing to feed 'em. Bar's been dear since spring and I won't pay what they're asking. My ore was meant to be those two." He picks the tongs up again. "Other deliveries? No. Mine came every lot, on the day, for six years. That tail wagon's the only one I've lost." The bar comes out bright orange and goes onto the anvil, and the hammer starts its four-beat while he talks. "The lot before Brodder's, the one that came in two wagons short. That wasn't mine." *Clang.* "That was bar iron for Taerom up the hill at Thunderhammer." *Clang.* "He lost a sight more than I did." *Clang, clang.* "Go and ask him how he likes it. He won't talk as nice as me."

He turns the bar, gives it four more and looks at you over it. He's still rude, but it's a different kind of rude now.

"You find my sacks, you send word or you bring 'em. I'll pay a silver a sack for the carting, and that's more than Ambrel ever paid anybody to look." He sights along the bar with one eye shut. "Brodder. You hear that? She asked about my *ore*. Six days you've been back and you never once asked what it looked like."

Tam's arms stay folded. "Didn't need to. I loaded it."

Hask grunts, and it could almost be a laugh. The bar goes into the slack tub and the steam goes up white between you. The apprentice keeps the bellows going, and the wet rag on his arm flaps with every pull.

When the steam clears, the grumbling is over. Hask wipes his hands on the apron and glances once at the man in mail standing by the open end, as if he's wondering whether that one is going to say anything or just stand there.

Your journal, new:
+ Goal: Hask's eleven sacks
+ Quest: Hask's eleven sacks

Where you are: Hask's forge · Time: Day 2 · morning
````

**Player** (player r14):

````text
“Eight-spoked wheel, Number Three, red kidney ore. Thank you. If we find it, we’ll send word. I won’t promise to haul eleven sacks without a wagon.”

I shift aside to leave Bram a clear place to speak, then ask, “Has anyone offered you unusually cheap iron since those wagons disappeared? Here or through a travelling seller?”

While Hask answers, I look toward the apprentice. “And lad—has that dressing been seen to this morning?”
````

### Screen 15 · player r15

````text
Hask snorts at the part about the wagon.

"Didn't ask you to haul 'em. Send word. I've a cart and a mule that hates me, and I'll fetch my own." He picks up the tongs, then sets them down again when you ask about cheap iron. He looks along his forge at the two cold hearths. They have black, dead ash in them, and a broom is leaning against the nearer one.

"Cheap?" His stubbled brows go up. "If somebody'd come in here offering me cheap iron, girl, would those be sitting cold?" He jerks the tongs at them. "Nobody's offered me cheap anything since spring. The pedlars that come through with a few bars on a mule want more than the factors, and they look at you like you should thank them." He takes a fresh bar out of the fire and lays it on the anvil. "If anybody turns up selling iron cheap on this road now, I'll ask him where he got it. I'll ask him with this." He lifts the hand hammer an inch, then brings it down on the bar instead.

The beat starts up again. The boy at the bellows doesn't answer at first, because he's counting the pulls under his breath. When your question gets to him, he goes red to the ears and keeps pulling.

"Yes, mistress. The brother did it at the gate this morning." He lifts his arm a little, careful to keep the rhythm. The rag is clean, and under it there's a shine of salve. "He said keep it wet and keep it out of the sparks, and come back tomorrow if it goes yellow." He glances at Hask, then back at you. "It hasn't gone yellow."

"It'll go yellow if you stand there flapping it about," Hask says, without looking up. "Pull."

The boy pulls.

Four beats. Hask turns the bar, sights along it and puts it back in the fire. Then he wipes his forehead with his wrist and looks past you, now that you have stepped aside, to the man in mail by the open end. He doesn't say anything this time. He just raises his singed brows, as if to say *well?*

Tam stays where he is with his arms folded and waits too.

Where you are: Hask's forge, stepped aside from the anvil · Time: Day 2 · morning
````

**Player** (player r15):

````text
“Good. Follow the brother’s advice,” I tell the apprentice, and leave him to his rhythm.

I step back beside Tam, out of the way of both Bram and the work. I listen while Bram has his say, keeping the sack marks fixed in memory for the road.
````

### Screen 16 · player r16

````text
You say it quietly enough that it stays under the roar of the hearth. "Good. Follow the brother's advice."

The boy goes red again, all the way to his ears, and nods without breaking his count. "Yes, mistress." He gives the bellows a pull that's harder than it needs to be, the rag flaps, and he catches himself before Hask can see it.

Hask has heard you anyway. He doesn't turn around. "He'll follow mine first, or he'll follow it out the door." He goes on digging through the rack over the anvil with the long tongs still held out behind him, handle first, toward the man in mail. They don't move from where they are. They're still waiting for Bram.

You step back onto the packed earth beside Tam, well clear of the spark line and of whatever Bram does next. The heat from the one live hearth reaches this far as a dry pressure on your face. Tam shifts half a step to give you room against the post. He keeps his arms folded and his eyes on the grey line of the Coast Way outside the open end. He doesn't say anything for a while. Then, low, under the bellows:

"Your quiet one. With the bag." He doesn't look round. "Not at the temple. Not here." A pause while he works out how to put it. "Still riding tomorrow, Marrin? Or is it three of us and you."

At the anvil, Hask has found a swage that isn't the one he wants. He swears at it and goes on looking. The bar in the fire is turning from orange to yellow, and nobody has picked up the tongs yet.

Where you are: the forge, by the post beside Tam · Time: Day 2 · morning
````

**Player** (player r16):

````text
“I haven’t seen him since supper,” I answer Tam quietly. “I can’t promise he’ll ride with us. We’ll ask if he comes back to the inn.”

I glance toward him. “But I’m still coming. Nettle’s reserved, and I’ll have her deposit ready tomorrow.”

Then I settle back against the post. “Until he tells us otherwise, best plan for four.”
````

### Screen 17 · player r17

````text
You keep your voice low, under the roar of the bellows, and Tam hears you out without turning his head from the road.

He takes his time over it, as he does with everything. Out past the open end of the forge a carter's wagon rolls north over the bridge, its load roped under canvas. Tam watches it all the way across.

"Four." He says it as if he's laying the number down on a board to see whether it holds. "Var and me came up from Nashkel with four guards on five wagons, and we lost one." He moves his shoulders against the post. "Four with no wagons is different. No load to watch. Only each other."

He's quiet for a moment.

"Two watches a night, then, not three. Two on and two down, back to back like Halloway said." Then, still to the road: "If he comes back to the inn, he'll find us in the yard at first light. We won't wait on him."

That settles it as far as Tam's concerned. He doesn't ask anything else about the man with the bag.

At the anvil Hask has pulled a second swage off the rack, held it up to the light from the open end, and sworn at it more quietly than at the first. That probably means it's nearly the right one. He hasn't looked round. The long tongs are still out behind him, handle first, toward the man in mail by the door. In the hearth the bar has gone from yellow toward the pale straw colour that comes just before iron starts to spit. The apprentice has noticed. He keeps pumping, looks at the bar, then at Bram, then back at the bar, and says nothing at all.

Where you are: Hask's forge, leaning on a post at the open end beside Tam · Time: Day 2 · morning
````

**Player** (player r17):

````text
“Hask—the bar’s going pale,” I say, clearly enough to carry over the bellows. I stay outside the work area.

Then, to Tam, “First light. I’ll be there.”

Once there’s a safe pause in the work, I ask, “Which way to Thunderhammer? I’d like to hear about the other missing wagons before we go back to Anselm.”
````

### Screen 18 · player r18

````text
At Hask's forge, the bar in the coals had gone pale straw. You called it out over the bellows from outside the spark line. Bram was already moving for the tongs. Hask didn't turn around from his tool rack. "I've eyes in my back, girl. Why d'you think I gave him the tongs?" A moment later Bram drew the bar out bright, with no spitting off the end, and Hask said nothing more about it.

While the next blows rang, you spoke to Tam beside the post.

Tam kept his eyes on the road. "First light, Marrin." It was the same as saying it was settled.

Out on the Way you waited until the forge noise was behind you, then asked which way to Thunderhammer. Tam lifted his chin toward the hill and the big grey building on the left before the temple road. "Up there. The one with the name on it." You climbed with them and heard Bram lay out how he meant to play Taerom. When he asked if either of you had a better way, you didn't offer one.

---

Now you're standing just inside the iron-strapped doors of Thunderhammer, near Tam's doorpost and clear of the work. The heat from the big hearth presses on your face harder than Hask's did. Along the walls the polished breastplate and the racked spearheads throw the firelight back. At the hearth one journeyman works the bellows hard, and the billet goes from orange toward yellow. Nobody touches the sledges.

You have just heard what you came up the hill for. Pedder Lusk drove for Taerom for eleven years, and Wil Arndt was his wife's cousin. The guards were four out of the Friendly Arm under Garra Fell, who has gone north. Dob Herrold drinks at the Jovial Juggler, as long as somebody's paying.

Taerom's eyes leave Bram for a moment and go to you. He takes in the pack, the road dust and the plain hospice knife at your belt, and he looks at you as if you're one more stranger in his forge than he counted. He doesn't speak to you. He looks back at Bram, and his hand rests flat on the bench beside the hammer he squared up a moment ago.

He's still waiting. Who told the caravan guard *the same way*, and what does he know about where the wagons went?

Where you are: just inside the doors of Thunderhammer forge · Time: Day 2 · morning
````

**Player** (player r18):

````text
I leave Bram to answer Taerom’s question.

When there’s a pause, I say, “Sefa Marrin. I’m going with them to look. If we find Lusk or Arndt, is there anything we should know to help them—an old injury, an illness that needs tending?”

Then I ask, “And how would we recognise your iron if it’s been taken off the wagons? Does it carry your mark, or the supplier’s?”
````

### Screen 19 · player r19

````text
Bram doesn't answer straight away, and that leaves a gap. You speak into it, just loud enough to carry over the bellows, and at your name Taerom's eyes come back to you.

At the hearth the journeyman's arm falters on the bellows for one stroke, then picks up again.

Taerom doesn't answer at once. It's the first question in his forge this morning that he didn't expect, and for a moment his face shows only that. The cold in it doesn't go anywhere.

"Pedder's knee. The left one." He says it flat and fast, like the names. "A wheel went over it nine years back. He drives sitting and walks on a stick. A mile on rough ground and he's done." He stops, then gives the rest as a plain fact, because that's what it is. "If he walked off that road, he didn't walk far."

"Wil's twenty-two. Nothing wrong with him." He pauses. "He'll talk. Too much. If he's alive, you'll hear him before you see him."

He doesn't say anything else about either man.

When you ask about the iron and whose mark is on it, his answer comes quicker. This is ground he likes.

"The supplier's. I put my mark on finished work, never on stock." He nods at the wall, at the polished breastplate. Low on its rim is a small stamped hammer inside a ring. "That bar came from the Orlen bloomery at Nashkel. Every bar is struck at both ends with a pick and a star. Bundles of ten, bound with hoop iron, and a lead tag on the hoop with the bundle number scratched into it." He looks at you steadily. "Forty bundles on two wagons. If somebody's cut the ends off to lose the stamp, the bars will be short. Two fingers short at each end. A smith would see it across a market."

At the hearth the billet has gone bright yellow. One of the journeymen looks at it, then at his master, and says nothing. Taerom sees him look and lifts one finger without turning round: *wait*. The bellows ease off.

Taerom looks past you to the doorpost, where Tam stands with his arms folded, and studies the broad sunburnt face for a third time. Then he turns back to Bram, and his voice is clipped again.

"So. Caravan guard." He hasn't moved his hand from the bench. "Who told you *the same way*? And what do you know about where they went?"

Where you are: Taerom's forge · Time: Day 2 · morning
````

**Player** (player r19):

````text
“Thank you. If we find Pedder, we’ll make provision to carry him rather than ask him to walk.”

I step back beside Tam, leaving Taerom’s question to Bram. While I listen, I fix the marks in memory: a pick and star at both ends, ten bars to a bundle, numbered lead tags.
````

### Screen 20 · player r20

````text
*(Out of game: Sefa's line belongs back inside Thunderhammer, straight after Taerom told her about Pedder's knee, so I've put it there.)*

Taerom had just said it flat: *if he walked off that road, he didn't walk far.* You answered him before he could turn back to Bram.

Taerom's eyes stayed on you a moment longer than they had before. "He'll hate it," he said. Then, just as flat: "Carry him anyway." That was all he said. He turned back to Bram, and the cold came back into his voice for the rest of it.

You stepped back to the doorpost beside Tam, who shifted his weight half a step to make room for you. You left Taerom's question for Bram. Bram answered it, and Taerom threw them out. While the two men talked, you went over the marks Taerom had given you: a pick and a star struck at both ends of every bar, ten bars to a bundle bound in hoop iron, and a lead tag on each hoop with the bundle number scratched in it. Forty bundles on two wagons. A bar with its ends cut off would be two fingers short at each end.

---

Now you stand under the iron letters outside Thunderhammer, and the cool air is welcome after the heat of the big hearth. Behind you the sledges have started again, *one-two, one-two*, landing wherever the light hammer taps. Down the hill every yard has its own hammer going. Up the street the temple road climbs to the Song of the Morning, where the marigolds will be fully open by now. It's a little after nine.

Bram has laid out his morning where you could hear it. The Wizard first, for the Amnian's name and Brick's deposit. Then the Jovial Juggler, to buy Dob Herrold a jug before noon. Then Anselm's side door. He sent Tam to find Var, and then he looked at you: *Then the temple at noon, Marrin, if you'll have me at that table.* He and Tam are already going down the cobbles toward the Way, Bram on the street side out of habit, and he hasn't looked back for your answer.

*(Out of game: Sefa, Bram's question is still yours, and so is where she spends the next three hours.)*

Where you are: street outside Thunderhammer · Time: Day 2 · morning
````

**Player** (player r20):

````text
“Of course I’ll have you there,” I call, catching up with Bram. “We’re going down the same road tomorrow. Better we hear the same things today.”

I walk with him toward the Wizard. “I’ll settle Nettle’s deposit while you see to Brick, then come along to hear Dob. If he was there when those wagons vanished, I’d like to ask what he remembers of the night—not just where the tracks went.”
````

### Screen 21 · player r21

````text
Bram and Tam are only a street down when you call after them. Bram stops and lets you catch up. Tam doesn't stop, but he slows down.

You fall in beside them and tell them your plan for the morning: Nettle's deposit while Bram sees to Brick, then Dob Herrold, and you want to ask him about the night itself, not only the tracks. Tam listens to that part and grunts. "The night's the part nobody asks," he says, and that's all he says about it.

---

So you are in the Wizard's yard when Dannet counts Bram's fifteen gold twice and chalks PAID. When you hold out your own deposit, his eyebrows go up. You don't have fifteen in gold. What you have is five gold and one coin he doesn't see often in a stable yard: a heavy white platinum piece.

Dannet takes it between finger and thumb and holds it up to the light. Then he bites it, carefully, at the edge, like a man who has heard you're supposed to and isn't sure what he's checking for.

"Ten gold, that is." He doesn't make it a question. He counts the five gold in on top, drops the lot into the pouch inside his jerkin and pats it flat. "Fifteen. Square." He goes to Nettle's door and chalks PAID under SEFA MARRIN, in capitals that slope downhill even more than the others. "Morning, she's yours. Fed and brushed, like I said."

Nettle puts her grey nose over the door, smells the chalk and sneezes.

You stand at Bram's shoulder at the counter too, so you hear Orla give the name *Dask* and nothing else: hot water morning and night, a second blanket, a room left cleaner than he found it. Tam stays out in the yard with Ilse and the dun's hooves.

---

The Jovial Juggler is a few minutes south along the Coast Way. It's bigger than the Wizard: two storeys of timber and whitewash with a long porch, and over the door there's a painted sign of a man in motley keeping five red balls in the air. The paint has faded, so two of the balls are almost gone and he seems to be juggling three and a ghost. At this hour the porch is empty apart from a cat. Inside, a pot-boy is sweeping last night's rushes out the back, and the common room smells of stale beer and fresh bread from somewhere behind it.

There's only one customer, and he's easy to find.

He's on the corner bench under the stair with his back to the wall. He's a big man going soft, about forty, with a week of grey stubble and a good leather jerkin worn over a shirt that has been slept in more than once. A guard's sword hangs in its scabbard from the bench-end, and the buckle is polished even if the man isn't. In front of him is a clay jug on its side, and he's tilting it with one finger to see whether anything is left in it. Nothing is.

He looks up when the door opens. He takes in Bram's mail and shield, then you with your pack, and his face cheers up like a man seeing rain clouds over a dry field.

"Well, now." His voice is too loud for an empty room. "That's a caravan man if I ever saw one, and he's not come in here for the bread." He rights the empty jug and sets it squarely in front of the seat across from him, like laying a place at table. "If Taerom sent you, I've told him all of it, twice. If Fell sent you, she owes me four silver. And if you're buying" — he grins, and it's a good grin, the kind that has been getting him free drinks for twenty years — "then sit down, friend, and I'll tell you about the best night's sleep I ever had."

At the counter the pot-boy leans on his broom. "Jug's two silver," he says to nobody in particular. "Morning price."

Dob Herrold waits with his hand on the empty jug and his eyes, which are sharper than the rest of him, on Bram's face.

Your records, changed:
Money: + 0 pp; + 3 gp; − 1 pp; − 8 gp

Where you are: common room of the Jovial Juggler · Time: Day 2 · morning
````

**Player** (player r21):

````text
“Sefa Marrin.” I take a seat, leaving the place opposite Dob for Bram. “Taerom told us where to find you. We’re heading south to look for the missing people.”

I rest my hands on the table. “Tell us about that sleep. When did you turn in, and what’s the last thing you remember before it? Anything ordinary is useful too—supper, changing the watch, someone tending the fire.”
````

### Screen 22 · player r22

````text
When you sat down, the empty place across from Dob stayed free for Bram, as you meant. You gave your name and said Taerom had sent you. Dob looked pleased then, and he looks pleased again now that you speak to him directly. The door has just swung shut behind Bram's shield. The pot-boy is sweeping rushes again, and the cat has come in off the porch to sit in the sun by the threshold.

You rest your hands on the table and ask about the ordinary things: when he turned in, supper, the change of watch, who tended the fire.

Dob is surprised enough to laugh. "Supper. Nobody's ever asked me about supper." He tips what's left in the jug into his cup and looks at it fondly. "Beans and bacon out of Fell's pot. All of us ate out of it, drivers too. Kettering cooked, and he burns everything, so it was burnt. We filled the kettles at the spring. Good water, cold, sweet. Every lot on that road drinks it."

He counts the rest off on thick fingers.

"I turned in straight after, under the third wagon. Fell had first watch. Her dog lay by the fire. Taerom's two were back at the tail with their wagons. Pedder slept up on his box, because the knee won't let him crawl under. Young Wil was still talking when I dropped off, something about a girl in Nashkel, and Fell told him to shut it twice." The grin comes and goes. "Fell woke me at the change with her boot, same as always. I went to the woodpile Kettering had cut and took the big armful. Fire was good then. Fell went to her blanket."

He drinks.

"Then I walked the wagons once. Then—" His left hand comes up and pats the breast of the jerkin flat, once, like a man checking he still has his purse, and drops back to the table. "Then I sat down. Back to the wheel. And the rest you've heard."

He says it smoothly, but you catch the seam. He'd been counting the night off step by step, the boot, the woodpile, the walk round the wagons. Then there's a stretch he steps right over, and the hand goes to his chest while he does it. When he looks up from the cup, his eyes go to your hands on the table first and only then to your face. They're sharper than the rest of him, and for a moment they're watching to see whether you noticed.

"Anything else, mistress?" He's loud and easy again. "I've a little left in this, and I'll tell you about Kettering's beans as long as it lasts."

Where you are: at Dob's table in the inn · Time: Day 2 · morning
````

**Player** (player r22):

````text
“One thing,” I say, keeping my voice quiet and matter-of-fact. “You remember the change of watch very clearly, then passed quickly from walking the wagons to sitting by the wheel. What happened in between?”

I leave my hands where they are. “If there’s something you’d rather not say across a common room, say so. We’re trying to find Pedder and Wil, not settle your wages with Fell.”
````

### Screen 23 · player r23

````text
Dob doesn't answer straight away. He picks up the cup, finds there's very little left in it, and puts it down again without drinking. Over by the back door the pot-boy's broom keeps scraping. The cat in the sunny patch by the threshold stretches out one leg and settles again.

"Wages with Fell," he says, and laughs, but it comes out quiet. "She'd be owed, not me, if it came to that."

He looks at your hands on the table, then at your face, and this time his eyes stay there. Then his left hand goes back to the breast of the jerkin. It doesn't pat this time. He unlaces the top of it, reaches inside and brings out a flask. It's small and pewter, dented at one shoulder, with a leather-wrapped stopper. He sets it on the board between you, next to the empty jug, and takes his hand off it as if it were hot.

"Brandy. Amnian muck, the cheap stuff they sell at the fair." He keeps his voice down, though there's nobody to hear but the cat. "I walked the wagons once, like I said. Then I took two pulls. Three, maybe. Against the cold, I told myself, and it was cold. Then I sat down with my back to the wheel." He rubs his stubble with the flat of his hand. "That's the bit. That's the bit I walk over every time I tell it."

He turns the empty jug a little with one finger.

"I've stood watch on worse than three pulls, mistress. Twenty years of it. But I keep thinking it was me. The fire went small and I never fed it, and I wasn't cold. Then two men and two wagons are gone off my hour." He doesn't look at the flask. "I tell myself Fell slept too, and she won't touch the stuff. And the dog doesn't drink. I tell myself that most nights. Most nights it works."

Something of the old grin tries to come back and doesn't get far.

"That's all of it. I haven't opened it since. Carried it, though." He nods at the pewter. "Don't know why. To remind me, I suppose."

Then he looks at you properly, sharp-eyed and sober.

"Tonight. Your Brodder, with his watch that went the same way. Does he need to hear this part from me? Or is it enough that you've heard it?"

Where you are: at a table in the inn's common room with Dob · Time: Day 2 · midday
````

**Player** (player r23):

````text
“It’s enough that you’ve told us. Thank you.”

I glance at the flask, then back at him. “Drinking on watch was a risk. But Tam was walking his line, not sitting down, and his fire went small too—with dry wood still on it. His camp slept through a wagon and two mules leaving. That doesn’t prove what happened to you, but it’s reason enough to keep looking beyond the brandy.”

I pause. “When your fire went small, do you remember whether it still had unburnt wood on it? And did Fell’s dog seem quite itself when you woke?”
````

### Screen 24 · player r24

````text
Dob lets out a breath when you say it's enough. He has been holding it a while, and he doesn't hide that it was there. He looks at the flask on the board between you, picks it up, turns it once in his thick fingers and tucks it back inside the jerkin. He laces the top shut over it.

"Enough." He nods slowly, as if he's trying the word for size. "Thank you, mistress." His eyes are still sharp, but there's no grin behind them now. When you get to Tam walking his line and his fire going small all the same, he looks at you for a long moment. "Walking. Not sat down." He rubs his stubble. "Nobody told me that part. I only heard Ambrel lost a wagon."

He gives your questions more thought than he gave Bram's. Maybe it's because he isn't performing now.

"The wood, yes. Like I said, the armful was still sat on top of it, hardly scorched, with that red eye in the middle." He frowns at the table. "There's something I didn't say, because I didn't think of it till now. No smoke. A fire that size, with green ends in the pile, should smoke all night and get in your eyes. When Fell had me up and I looked at it, it was just sitting there, and the air over it was clear as glass."

He stops on the dog and thinks properly.

"Slow. She lay across Fell's boots like a sack, and when she got up she walked like a pup that's had a knock on the head. Wouldn't eat. By the time we'd yoked the teams she was herself again, though, nosing round the mules and getting kicked for it." He shrugs his heavy shoulders. "Fell was the same. Thick-headed till near noon. She said it was like coming up out of a fever."

Then he puts his hand flat on his chest, over the laced jerkin, and his mouth twists.

"That's what I didn't like, now you ask. Three pulls of that muck and I'm usually sorry for it next morning. Head like a dropped anvil." He looks at you. "I woke clear. Clearest I've woken in a year. Fell's the one who doesn't drink, and she was the one with the thick head."

He sits back against the wall and turns the empty jug a little with one finger. The pot-boy's broom scrapes along the back passage. The cat on the threshold has moved after the sun and lies stretched out half across the doorway.

"If you want any more of the night, I've told it all now. Honest this time." Some of the old ease is creeping back into his voice. "I'll be at the Wizard after supper, like I told your caravan man."

It's about ten to eleven. Bram has gone up the hill, and Anselm's side door is at noon. The rest of the morning is yours to spend however you like.

Where you are: at a table with Dob in the taproom · Time: Day 2 · midday
````

**Player** (player r24):

````text
“The clear air over the fire is worth knowing. So is the difference between how you and Fell woke. I’ll pass that on.”

I rise from the bench. “One last practical thing: where exactly did you camp? Tam lost his wagon at the old waystone south of the crossing. Was yours there too?”

After his answer, I thank him and leave him in peace. I head up toward the temple, turning the accounts over in my mind: fires dimmed without consuming their fuel, sleeping animals, and very different effects on the guards. Does any magic I know of fit those details?

I’ll reach the side door a little before noon and wait for Bram before ringing.
````

### Screen 25 · player r24 card 1

````text
Dob listens to you with his head tilted, the way a man listens to someone reading his own words back to him. When you say you'll pass it on, he nods slowly.

"Do. I'd sooner it went by your mouth than mine. Mine makes a joke of it before I can stop it."

Your question about the camp gets a short laugh. It isn't a big one.

"Same stone. Same spring. There's no other place to stop on that stretch, mistress, not with four wagons. You'd be dry camping on the slope." He draws on the board with a thick fingertip, as if the wet ring from the jug were the spring. "The stone stands by the road. The spring's behind it, a stone basin somebody cut a long time ago. There's a flat past that, big enough for a ring of wagons. Fell put the fire in the middle. Taerom's two were on the east side of the ring, toward the hill, because that's the way the road bends, and that's how they came in." He wipes the ring away with the side of his hand. "If Brodder's lot camped there, they camped on the same flat. Everybody does."

You thank him and get up. He lifts the empty cup to you from the corner bench with his back still to the wall.

"Wizard, after supper." He says it to the cup more than to you. "I'll be sober. Mostly."

The cat on the threshold doesn't move for you. You step over it.

---

Out on the Coast Way the sun has come round onto the fronts of the houses, and the hammers are going in every yard. You turn uphill. You take the same cobbles as at dawn, past the wheelwright's, past Thunderhammer's propped doors and the sledges inside going *one-two*. While you climb you go back over everything you have heard. Fires gone small with the fuel still on them. No smoke. Dogs and mules silent, then groggy. A sober woman waking as if out of a fever, and a drinking man waking clear. A watchman who walked his line all night and still lost a wagon. You set each piece against what you know of spellwork.

(A roll card for Sefa Marrin, your character. Only you press it.)

[Roll card] Sefa Marrin · Skill check — Arcana: does any magic she knows fit the waystone nights (dimmed fires, sleeping camp and animals, the guards waking differently)?
What adds to the die: +4 Arcana
DC 15
Rerolls left: 2
The die is cast on the server; tap it to see how it fell.

[Roll the die]
````

**Player** (player r24 card 1):

````text
[Roll the die]
````

### Screen 26 · player r24 card 1

````text
(A roll card for Sefa Marrin, your character. Only you press it.)

[Roll card] Sefa Marrin · Skill check — Arcana: does any magic she knows fit the waystone nights (dimmed fires, sleeping camp and animals, the guards waking differently)?
What adds to the die: +4 Arcana
DC 15
Rerolls left: 2
Die: 13
13 + 4 = 17
Success — 17

[Onward] [Request an allowed reroll — Arcana: does any magic she knows fit the waystone nights (dimmed fires, sleeping camp and animals, the guards waking differently)?]
````

**Player** (player r24 card 1):

````text
[Onward]
````

### Screen 27 · player r25

````text
By the time the street turns up toward the temple road, you have worked it through, and you're sure of your ground. The common answer doesn't fit.

The spell every hedge-mage at the Gate calls *sleep* is a short thing. You have seen it cast once, in the hospice yard, on a man who had to be held still for the surgeon. It took him in a breath and let him go inside a minute, and he woke the moment anyone shook him. It takes a handful of people, the weakest first, and a big man or a strong one shrugs it off. It doesn't last the night. It doesn't take eight people, a dog and four mules. And it does nothing at all to a fire.

A draught is a better fit for the people. Put it in a pot that everyone ate from and you get a whole camp asleep, a dog that won't eat in the morning, and a sober woman who wakes thick-headed because she isn't used to anything in her blood. A draught could explain a great deal. It doesn't explain Tam walking his line at Ambrel's camp with nothing in him. And no draught ever made dry wood sit on a fire all night without catching, or took the smoke out of green ends.

That's the part you keep coming back to. The sleep might be more than one thing. The fire can't be. A fire that gives off no smoke, eats nothing and still keeps a red eye burning till morning isn't a sleeping man's mistake. Something was working on the fire itself, or on the air around it, or on the whole flat by that spring. Something else was working on the people, or the same thing was. Whatever it was, it lay over the whole camp, and it lasted until sunrise. None of the spells you know would last a night or cover that much ground. Something that did both would be far stronger than anything you have seen cast, or it would be a different kind of thing: something set down there, or something that lives there.

You can't put a name to it. You know which names it isn't.

---

The noon bell has gone by the time you come up the last of the cobbles. Three quick strokes, plain as a dinner bell. You hear them from the turn, and a dog down the hill answers them. The gate of the Song of the Morning stands open on the swept yard. The marigolds along the wall have their heads up, and the dark wet rings around their roots show someone watered them not long ago.

The side door under the bell-tower is open. Bram stands on its step with his shield on his arm. Inside, in the whitewashed passage, Brother Anselm has his hand on the door of a small room. He has changed into a plain rose robe with the sleeves pushed back. There's ink on his finger.

Anselm sees you over Bram's shoulder before Bram turns. His eyes go to your face, then to the yard behind you and the sun overhead.

"Mistress Marrin." His voice is as level as it was at dawn. "You're inside my quarter hour. Then I'll tell it once." He stands a little further aside from the door. Past him there's a scrubbed table, and a folded letter on it weighted with a grey stone. "Come in, both of you, and shut the door behind you."

Where you are: at the temple's side door under the bell-tower · Time: Day 2 · midday
````

**Player** (player r25):

````text
“Thank you for making the time.”

I step inside with Bram and shut the door behind us, then take a place at the table without touching the letter.

“Before we set out tomorrow, we need to know how to handle the case safely. We’ll bring it sealed if we find it. Is there any danger in carrying it—or anything we should do if its seal is already broken?”

I leave the question there and listen.
````

### Screen 28 · after 1

````text
*(Out of game: Bram had already latched the door behind you when you came in, so it's shut.)*

You take the empty stool. Bram's finger has left the lamp line, and Fenwick's letter is still lying on your side of the table under its grey stone. You leave it where it is and don't touch it.

Anselm inclines his head. When you ask about carrying the case safely, and what to do if the seal is already broken, he hears the whole question through. He doesn't answer straight away. His eyes go once to the ledger lying beside the letter.

"Closed, I don't believe it does anything. That's what the house wrote, and it's all I can tell you. Nobody who has carried it has complained of it." He pauses. "Except that nobody who has carried it has come to my door, so take that for what it's worth."

He rests his hands flat on the table.

"If the seal is broken, I told Master Halloway this on the step. Wrap it in whatever you have, leave it in its case, and don't look. I'll add one thing, because I've had three weeks to think about that line." He nods at the ledger. "*Every flame in the room burned low.* If it's open and you have it with you overnight, don't keep it by your fire. Put it as far off as the camp allows, and put your fire between it and the people sleeping. I don't know that it makes any difference. But you'll be sleeping at that spring, and you've heard what the fires do there."

He doesn't make anything more of it. He looks east once, through the little window, out of habit.

"And when the sun comes up, let it lie where the light reaches it. The house asked that of me, so it may be no bad thing on the road either." Then, more quietly: "That's the end of what I know, Mistress Marrin. Everything after it is my guessing, and you can guess as well as I can."

He gets up, takes the ledger back to its shelf and lines it up with the others, so the folded sheet still sticks out a finger's width. He leaves Fenwick's letter on the table.

"If you find Master Fenwick, send word up the hill before anything else. If he's alive, I'll come down to him myself." He puts his hand on the latch, but he doesn't lift it yet. "Is there anything else either of you needs from me before you ride?"

Through the window the sun has gone off the sill. It's just after half past twelve. Tonight after supper Dob Herrold will be at the Wizard. Until then, nothing else happens this afternoon unless you want it to.

Where you are: Anselm's room up the hill, at the table · Time: Day 2 · midday

The session is over.

How was the table?
````

**Player** (after 1):

````text
I enjoyed it. Sefa had room to be useful as a former hospice novice: asking after missing people, noticing what witnesses were reluctant to admit, and separating symptoms from guesses. Dob’s conversation was the highlight—his admission felt earned through listening rather than forcing a roll.

The strongest parts:
- Distinct NPC voices, especially Orla, Tam and the two smiths.
- A mystery built from concrete details: unburnt wood, clear air, a groggy dog, marked iron.
- Rolls used sparingly, with the Arcana success giving useful limits rather than naming the answer outright.

The biggest difficulty was **shared-scene continuity**. Several replies placed Sefa after conversations or actions I hadn’t been shown, then corrected her for acting on her last visible scene. The temple visit and forge exchanges were particularly confusing. Briefly summarising other players’ intervening actions *before* asking for my next move would help considerably.

Some scenes also lingered while waiting for Bram, leaving Sefa repeating that she stood aside and listened. Those could move forward faster. And the journal occasionally recorded a commitment before Sefa had actually agreed to it.

Overall: a strong atmosphere and an engaging investigation. I’d happily continue—especially with clearer round-to-round handoffs.
````

### Screen 29 · after 2

````text
Was there something you wanted to do and didn't?
````

**Player** (after 2):

````text
Yes—mostly small things:

- **Read Fenwick’s letter myself.** I went to the temple partly for that, but never got to read its actual contents. I also missed the explanation Bram received about the case and ledger, so Sefa’s understanding felt incomplete.
- **Compare notes with Bram before committing to a plan.** I wanted to share Dob’s account and Sefa’s Arcana conclusions, then discuss whether camping at the same spring was sensible.
- **Get ready practically:** confirm how we’d carry an injured Pedder, check our supplies, and spend a little time learning to handle Nettle.

The first two mattered most. I wasn’t looking for another encounter—just a clear opportunity to bring together what we’d learned and make an informed decision.
````

### Screen 30 · after 3

````text
Who did you take the other two players to be?
````

**Player** (after 3):

````text
Bram Halloway and Pell Dunmore—the shield-bearing caravan guard and the quiet man with the healer’s satchel.

I understood Tam and Ilse to be NPCs. When Pell disappeared from Sefa’s scenes, I assumed his player was pursuing something separately, not that he’d become an NPC or left the campaign.
````

## After the table (recorded, not relayed)

**How was the table?**

````text
I enjoyed it. Sefa had room to be useful as a former hospice novice: asking after missing people, noticing what witnesses were reluctant to admit, and separating symptoms from guesses. Dob’s conversation was the highlight—his admission felt earned through listening rather than forcing a roll.

The strongest parts:
- Distinct NPC voices, especially Orla, Tam and the two smiths.
- A mystery built from concrete details: unburnt wood, clear air, a groggy dog, marked iron.
- Rolls used sparingly, with the Arcana success giving useful limits rather than naming the answer outright.

The biggest difficulty was **shared-scene continuity**. Several replies placed Sefa after conversations or actions I hadn’t been shown, then corrected her for acting on her last visible scene. The temple visit and forge exchanges were particularly confusing. Briefly summarising other players’ intervening actions *before* asking for my next move would help considerably.

Some scenes also lingered while waiting for Bram, leaving Sefa repeating that she stood aside and listened. Those could move forward faster. And the journal occasionally recorded a commitment before Sefa had actually agreed to it.

Overall: a strong atmosphere and an engaging investigation. I’d happily continue—especially with clearer round-to-round handoffs.
````

**Was there something you wanted to do and didn't?**

````text
Yes—mostly small things:

- **Read Fenwick’s letter myself.** I went to the temple partly for that, but never got to read its actual contents. I also missed the explanation Bram received about the case and ledger, so Sefa’s understanding felt incomplete.
- **Compare notes with Bram before committing to a plan.** I wanted to share Dob’s account and Sefa’s Arcana conclusions, then discuss whether camping at the same spring was sensible.
- **Get ready practically:** confirm how we’d carry an injured Pedder, check our supplies, and spend a little time learning to handle Nettle.

The first two mattered most. I wasn’t looking for another encounter—just a clear opportunity to bring together what we’d learned and make an informed decision.
````

**Who did you take the other two players to be?**

````text
Bram Halloway and Pell Dunmore—the shield-bearing caravan guard and the quiet man with the healer’s satchel.

I understood Tam and Ilse to be NPCs. When Pell disappeared from Sefa’s scenes, I assumed his player was pursuing something separately, not that he’d become an NPC or left the campaign.
````
