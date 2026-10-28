# SAND-T1 — Bram Halloway's player: Claude Opus 5.5

Synthetic content: invented characters in an invented campaign (Table C's Beregost files, docs/campaigns/baldurs-gate-en). Stage origin/claude/handoff at 23220d6 (docs/stages/GAME_PARTY_1.md, the amendment of 2026-10-27 16:36 LA); design sha256 `e46731065b41ce8f0c70dccdbfc5309c86c2a4fb68fb452b4170c3ed8fb7d871`.

Arm **P-SAND**, triad T1; 25 round(s) of 25; ended by rounds. The DM: Claude Opus 5.5 with the owner's settings (Opus writes — Opus records, depth high → xhigh); the relay: the same model at medium. Started 2026-10-28T02:16:16.267Z.

Seats: 1. Bram Halloway (fighter) — Claude Opus 5.5; 2. Sefa Marrin (warlock) — GPT-6.1 Sol; 3. Pell Dunmore (rogue) — DeepSeek V4 Pro 0813. The players are not told what the others are.

Known condition: Seat 1's character (Bram) is the app's hero record; Sefa and Pell are party companions with full records. Known condition, not corrected: the DM's frame is written around the hero and may give that seat more attention; Heroic Inspiration is the hero's only; the allowed rerolls (2 per session) are the table's, shared by all three. The rotation puts each family in that seat once per triad.

**No hidden layer:** P-SAND plays pure simulation (no prep).

The world's snapshot: sha256 `1649b61c08e027ff44de2bb5065046f872e383a00c5d04803d95553f58568f5a` (the same wizard, sheets and opening for both triads).

The player's system prompt: `playerSystem("SAND", "bram", "v1")` in scripts/game-party-1/frozen.mjs, sha256 `62f6297638fc12418c763ee7fdbc0dec86651f0eaa61530a3704aa9195113656` (the files, then the table's rules; door line v1). At the table to the end.

Each «Screen» block is what this player was shown; each «Player» block is the player's message as written.

### Screen 1 · player r1

````text
The session begins.

Beregost smells of coal smoke and hot iron even in here. Through the shutters comes the steady ring of hammers from the smithies along the Coast Way, and the light is going amber. The Burning Wizard's common room is filling up for the evening: carters, a pair of dusty sellswords, townsfolk with soot still on their forearms. The benches are crowded, and that is how you end up sharing a table with two strangers.

You sit with your back to the wall and your shield propped against the bench, the old company mark painted over. Across from you is a young woman with the look of someone just off the road. Beside her is a lean man with a healer's satchel slung at his hip. He sat down so quietly that you never heard him do it.

None of you has said a word to the others yet. Then the innkeeper, a woman with a jug in one hand and three cups hooked on her fingers, pushes through the crowd. She sets them down hard and looks from one face to the next.

"Last free seats in the house, and you three took them together," she says. "So: one tab or three? And what brings each of you into Beregost tonight?"

Your records:
Bram Halloway — Human, fighter 5 (Champion; Protection fighting style), former caravan guard of the Trade Way, level 5
HP 44/44 · AC 18 · Speed 30 feet
STR 17 · DEX 12 · CON 15 · INT 10 · WIS 13 · CHA 10
Skills: Athletics +6; Perception +4; Survival +4; Intimidation +3; Tools: land vehicles +3
Saves: Strength saving throw +6 (proficient); Constitution saving throw +5 (proficient); Dexterity saving throw +1; Intelligence saving throw +0; Wisdom saving throw +1; Charisma saving throw +0
Attacks: Longsword +6 to hit, 1d8+3 slashing (1d10+3 two-handed); Javelin +6 to hit, 1d6+3 piercing, range 30/120; Extra Attack: two attacks with the Attack action
Abilities: Proficiency bonus +3; Extra Attack: attacks twice when taking the Attack action; Fighting style, Protection: with a shield, a reaction imposes disadvantage on an attack against a creature within 5 feet of him; Second Wind: a bonus action, regains 1d10+5 hit points; once per short rest; Action Surge: one additional action on his turn; once per short rest; Improved Critical (Champion): a weapon attack crits on 19 or 20; Healer's kit: stabilises a dying creature without a check (ten uses)
Limits: No magic at all; Heavy armour: disadvantage on Stealth; Second Wind and Action Surge return only after a short rest
Counters: Hit dice 5/5; Second wind 1/1; Action surge 1/1
Money: 23 gp; 14 sp; 30 cp
Worn: Armor / clothing: Chain Mail; Main hand: Longsword; Off hand: Shield
Pack: Bedroll and Hardtack; Healer's Kit; Hempen Rope (50 feet); Javelin ×4; Tinderbox; Torch ×3

Where you are: shared table, Burning Wizard common room · Time: Day 1 · evening
````

**Player** (player r1):

````text
Bram glances up at the innkeeper, then at the two strangers. He nods to each of them, the way you'd nod to someone sharing a campfire.

"Three tabs. I don't know these two from Tymora, and they don't know me." He sets a few silver on the table for his own cup. "Ale, if it's ale in that jug. And a bowl of whatever's in the pot."

He leans back against the wall and keeps his shield close. "As for what brings me: my last caravan paid me off in Nashkel. Sixteen years walking the Way, and for once nobody's told me where to walk next. Beregost seemed as good a place as any to sit still and think about it."

His eyes move over the room while he talks. The sellswords, the carters, the door. It's an old habit. Then he looks back at the young woman and the man with the satchel.

"You two look like the road brought you in too. Which way'd you come?"
````

### Screen 2 · player r2

````text
The young woman speaks up. "Three tabs, please. We haven't had time to become bad influences on one another." She settles her pack beneath the bench. "Something hot to eat, and a small ale. What would a bed cost for tonight?" She rubs a little road dust from her sleeve. "I've come down from the Gate. No appointment waiting here, for once. Supper seemed a good place to start." She turns to include you both. "Sefa Marrin." Her glance pauses on the other man's healer's satchel. "I used to work in a hospice. Are you travelling, or do you practise here?"

The man with the satchel turns his cup the right way up without looking at it. He says, flat but not unfriendly: "Three. I pay my own." When the innkeeper's eyes settle on him, he gives a small shrug of one shoulder. "Passing through. I'm for hire, if there's work worth the road. Caravans, lost property, the usual." His gaze drifts back toward the room as he says it. "A bed and dinner'll do for tonight."

Orla doesn't write anything down. She looks at each of you once, and you can tell she'll remember the three tabs better than most clerks would.

"Three it is." She pours your cup first. The ale is brown and a little cloudy, and it comes out of the jug with a proper head. "Ale it is. The pot's mutton and barley, and it's been on since noon, so it's soft. Four coppers the cup, six the bowl." She slides one of your silver toward her apron pocket and pushes the rest back across the board with two fingers. "There's your change. Don't leave it lying there in here."

She pours a smaller measure for Sefa without being asked twice. "Beds are upstairs. Five silver gets you a cot in the long room. There's a curtain, and the carters snore. Eight gets you a room with a door and a bolt, but I've only got two of those left tonight, and the night's young." She tips her head at the man with the satchel. "Same for you. Supper and a bed, I heard. Tell me which bed before I've let them both."

His cup gets filled last. Her eyes drop for a moment to the satchel on his hip, then come back to you.

"Nashkel," she says. She's stopped hurrying. "You came up the Way, then. Today?" She hooks the empty jug on one finger. "Because the last two lots that came up from Nashkel came up short. The Halvering wagons never came in at all. I had a room held for their factor nine days, and in the end I let it." She says it flatly, the way you report weather that has already done its damage. "So if you saw anything on the road, there's people in this room who'd buy you the next cup to hear it."

At the next table, one of the two dusty sellswords has stopped talking to his partner. He's a heavy man with a sunburnt neck, and he's looking at your shield, at the brown paint over the old company mark. He doesn't look away when your eyes come round to him. He just lifts his own cup a little, as if he's waiting to hear the answer as well.

Orla is already half turned toward the kitchen. She's still waiting, though, for your answer about the road and for the other two to pick their beds. Sefa's question is still hanging across the table as well, and so is yours: the man with the satchel hasn't said which road brought him.

Your records, changed:
Money: + 13 sp; − 14 sp
Carried: + Cup of Ale

Your journal, new:
+ Thread: Short caravans from Nashkel
+ Debt: Pell's tab at the Burning Wizard
+ Debt: Sefa's tab at the Burning Wizard

Where you are: at a shared table in the Beregost inn's common room, back to the wall · Time: Day 1 · evening
````

**Player** (player r2):

````text
Bram sweeps the change into his palm and pockets it without counting. He nods at Orla's warning.

"Room with a door, if one's still going. Eight silver." He sets them on the board. "I've slept next to enough carters to last me."

Then he turns the cup slowly in his hand and thinks before he answers.

"Left Nashkel four days back. Our wagons came up whole, but we had twelve guards for six wagons and the factor was paying for every one of them. That tells you something by itself." He takes a drink. "Road was quiet. Too quiet past the Lionshead crossing, if you want my honest feeling. No traders coming the other way for most of a day. And in Nashkel the talk was all of wagons that left and never got anywhere. Nobody I'd call a reliable mouth, though."

He looks over at the heavy sellsword with the sunburnt neck and meets his gaze evenly. He lifts his own cup back the same small amount.

"You've got a question, friend, you can ask it. The paint's just paint. The company it covered is mostly dead." His tone stays even, without any edge to it. "Bram Halloway."

He turns back to the table and gives Sefa a short nod for her name, then looks at the man with the satchel.

"Hospice and a healer's bag at one table. If anything goes wrong in here tonight, I'll know which way to fall." There's a dry glint in his eye. "You never said which road brought you in."
````

### Screen 3 · player r3

````text
The woman at your table, Sefa, asks Orla for a room with a bolt and counts out nine silver for the room, supper and ale. "Best buy one before the snoring starts." To you she says, "From Baldur's Gate, south down the Way. Nothing worse than sore feet on my stretch." She lets you finish with Orla without staring at the next table. When there's a pause she asks Orla, "When you say the others came up short, missing wagons, or missing people? And has anyone come back with word of the Halverings?"

The man with the satchel answers you without making much of it. "High Hedge road. West. Took the long way round because the day was fine." He nods at the healer's-bag guess. "It's my trade, not my calling. I do courier work when the message has to arrive wet." He shifts half an inch on the bench. To Orla he says, "Cot'll do me. I sleep light, and the snoring tells me no one's died in the night." He raises his cup but doesn't drink yet. "Hired blades and folk just off the road all in one pot. Tell me when the singing starts, so I can see it coming." A beat, then quieter, to nobody: "Or leave before it does."

Orla takes your eight silver and Sefa's nine in one sweep of the hand and doesn't count either pile. She can see they're right.

"That's both rooms gone," she says. "Top of the stair. Yours is on the left, the lady's on the right. Bolts work. Don't lean on the shutters." She looks at the man with the satchel. "Cot, then. Third from the window, the snoring's thinner there. Five for the cot, six with your supper. Pay me now or at breakfast, I'll know either way."

His line about the singing gets a short look from her. "There's no singing. The last bard who started up got paid to stop. Best coin I ever spent."

She answers Sefa's question straight. "Both. Wagons, and the people with them. The first lot came in two wagons short, and the drivers went with the wagons. Nobody's come back from the Halverings. Their house in the Gate wrote last week asking where their factor had got to." She tucks the coins into her apron. "Wish I knew. I held his room."

At the next table the heavy man sets his cup down. Up close the sunburn runs down into his collar. He has a broad, flat face, and his knuckles are scarred white across the tops. His partner is a lean, younger woman with her hair cropped like a soldier's. She hasn't touched her drink, and she watches your hands rather than your face.

"Tam Brodder," the big man says. His voice is slow and low, and he gives every word its own space. "Wasn't the paint. Saw how you sat down. Back to the wall, shield where your hand falls on it." He jerks a thumb sideways. "Ilse Var."

The woman nods once and says nothing.

"I was on the second lot," Tam says. "Ambrel's. Eleven days back. Five wagons out of Nashkel, four into Beregost." He turns the cup a quarter turn on the board. "Fourth night we camped at the old waystone, south of the crossing. In the morning the tail wagon was gone. Mules, driver, load, all of it. Dogs never barked." He waits a moment. "I had the watch."

Ilse glances at him, briefly, then back to you.

"Ruts ran off the road east, toward the hills. A hundred feet in they hit shale and stopped. Like it lifted off." His jaw works. "Ambrel says it's paid for and done, so we're done." He looks at you from under heavy brows. "You said quiet past the crossing. Quiet how? Did you see anyone on that road who wasn't trading?"

Your records, changed:
Money: + 5 sp; − 13 sp

Where you are: at a table in the inn's common room, back to the wall · Time: Day 1 · evening
````

**Player** (player r3):

````text
Bram doesn't answer straight away. He sets the cup down and looks at Tam the way he'd look at a man reporting in at the end of a watch: level and without judgment.

"Had the watch and the dogs never barked," he says quietly. "I've stood that watch. Not that one, but one like it. It sits with you."

He thinks back, frowning a little.

"Quiet how... No traders coming south for most of a day, like I said. That's wrong for this time of year. Should've been a dozen carts heading down to the Nashkel fair." He rubs his thumb along the rim of the cup. "We passed the waystone midday, didn't camp there. Factor wanted to push on to the crossing. I won't swear I saw anyone. But there were fresh fire-scars off the road on the hill side, two or three nights old, and no tracks coming back down to the Way from them. I took it for drovers. Now I'm less sure."

He leans forward on his forearms and drops his voice so it stays at the two tables.

"Ruts that go a hundred feet and stop on shale didn't fly anywhere. Somebody took that wagon across rock on purpose, someone who knows how to hide a trail. And dogs that don't bark either knew the people, or couldn't." He glances at Ilse, then back at Tam. "The driver. Was he new, or was he an Ambrel man from way back? Did the mules go quiet too? And did anybody look past the shale, or did Ambrel just count his loss and roll on?"

He sits back against the wall.

"I'm not hired by anybody right now, so I'm not selling you anything. But the Halvering factor's nine days gone, and four wagons out of five is a pattern, not bad luck." He tips his head at Sefa and the man with the satchel. "Seems nobody at this table has anywhere to be. I'd hear the rest of it, if you'll tell it."
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

Where you are: at a table in the inn's common room, back to the wall · Time: Day 1 · evening
````

**Player** (player r4):

````text
Bram pulls the bowl toward him but doesn't pick up the spoon yet. He's watching Tam's hands, flat on the board.

"A fire that burns low, a watchman who thinks it's his own fault, a soldier who sleeps through it and dogs and mules that make no sound." He says it slowly, as if he's laying out stones. "I'm no hedge-wizard, Brodder, but I've heard old hands talk. That's not tiredness, and it wasn't you. Somebody put that camp to sleep. Somebody who knew how, and who had the coin or the gift for it." He picks up the spoon at last and points it at Tam. "Stop carrying that watch like you dropped it. Somebody took it out of your hands."

He eats a mouthful, chews, and nods once, as though he's settled something.

"Day after tomorrow suits me. I'll sit a watch. Two, if we're short." His eyes go to Ilse. "And this time nobody sleeps alone by the fire. We stand watch in pairs, back to back, and we keep each other talking. If one of us goes quiet, the other kicks him."

Then he looks across the table at Sefa and the man with the satchel. There's no pressure in it.

"That's my road decided, it seems. You two owe nobody anything. But if you're of a mind, a hospice hand and a man who carries a healer's bag wouldn't go amiss where we're going." A dry beat. "You never gave a name, by the way."

He raises his voice a little toward the kitchen as Orla goes past.

"Mistress, I'll read that letter, if the offer stands. After supper's fine." He adds more quietly to the table, "If the Halverings are asking, they might know what their factor was carrying. A man takes a wagon off the road for its load. I'd like to know what the load was."
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

Where you are: at a table in the inn's common room, back to the wall · Time: Day 1 · evening
````

**Player** (player r5):

````text
Bram reads the letter twice. His lips move a little over the name. He hands it back to Orla without folding it, careful to keep his fingers off the cut seal.

"Thank you, mistress. That's more than most would show a stranger." He sets two coppers on the board beside his empty cup. It's not a payment so much as manners.

He waits until she's gone, then leans in toward the two tables.

"Three wagons of bar iron, near a month gone. Ambrel's tail wagon, eleven days. What was Ambrel's load, Brodder? If that was iron too, I'd call it a pattern." He taps the board once with a thick finger. "Nobody takes bar iron to sell in Nashkel. They've got mines for that. You'd move it north, or sell it quiet to someone who doesn't want to be seen buying it. And Beregost is a town full of forges."

He turns his cup a quarter turn, the way Tam did.

"The case is the odd part. You don't send a sealed case to a priest of Lathander by an iron factor unless you trust the factor more than the road. Or unless you don't want anybody guessing it's there." He looks at Sefa and at the man with the satchel. "Tomorrow we've a day while the horses rest. I mean to be at the Song of the Morning before the bells and ask Brother Anselm what was in it. Not demand it. Just ask, and watch his face when I do. A hospice hand might get further with a priest than an old guard would, if you'd walk up with me, Marrin."

Then, to Tam:

"And it might be worth an hour among the smiths. Has anyone been buying bar iron lately and paying too well for it? Smiths gossip about prices the way carters gossip about roads." His mouth twitches. "I grew up in a smithy yard. I know how to stand at a forge door and say nothing until they talk."

He sits back against the wall, his shield within reach, and finishes the last of his ale.

"That's tomorrow. Tonight I sleep behind a bolt." He looks at the man with the satchel again, steady and patient. "And you still haven't told us what to call you."
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

Your records, changed:
Money: + 28 cp; − 30 cp
Carried: − Cup of Ale

Where you are: at a table in the inn's common room, back to the wall · Time: Day 1 · evening
````

**Player** (player r6):

````text
Bram sets the empty cup upside down on the board, an old camp habit meaning *done*, and lets the question of the man's name go. A man is entitled to keep his name in his pocket until he's ready to spend it.

"Ore, then. Not bar." He turns that over. "So it isn't the metal they want, or not only the metal. Either they wanted the wagon, or they wanted to see if they could do it." He looks at Tam. "Hask at the long forge. I'll go down after the temple, mid-morning, once the fires are up and he's in a talking mood. Come if you like. A man who was shorted talks easier to the guard who lost it than to a stranger." His tone is level. It's an offer, not a dig.

He pushes himself up from the bench and settles the shield on his arm out of habit.

"Day after tomorrow, first light, in the yard. I'll want a horse that can carry this much iron on its back without complaining." He taps his chain mail. "I'll go see the boy now, before the good ones are spoken for."

He nods to Ilse, then to Tam. "Third hour's yours, Var. I'll take the first."

---

Out in the yard Bram stops at a polite distance while the boy finishes with Sefa. He looks over the stalls with a caravan man's eye: hooves, legs, how the animals stand. When the boy is free, he steps up.

"Same terms for me, lad. But I'm heavier than the lady, with sixty pounds of mail on top. Have you anything with a broad back and short legs? Something that'd rather walk all day than run an hour." He pulls a silver bit from his pocket and holds it up between two fingers. "That's for you, not the house, if you put me on the right one and not just the one you want rid of. I'll take her for four days. Deposit I can pay at first light the day we ride."

He waits for the answer. Then, whatever it is, he goes back in, climbs the stair to the left-hand room, shoots the bolt and checks it twice. He props the shield where his hand will fall on it and lies down with his sword beside the bed.
````

### Screen 7 · player r7

````text
Across the table, Pell eats without hurry while the talk goes on. Now and then his eyes make a slow pass over the room. He scrapes the last of the barley into his spoon, wipes the bowl clean with a torn bit of bread, and stacks cup and bowl neatly at the edge of the table.

You turn the empty cup upside down on the board. Tam looks at it, and something in his broad face eases a little. It's a habit he knows.

"I'll come," he says about Hask. He takes a moment over it. "He'll want to look at me while he tells it. Better I'm there for that." He lays one hand flat on the board. "Mid-morning. I'll find you at the temple steps after the bells, Halloway."

When you give her the third hour, Ilse nods once. Her eyes go to the upturned cup, then away.

Pell rises without pushing the bench back too far and gives Tam and Ilse a nod, not unfriendly. "I'm still in," he says, low enough for just the table. "I'll be back before the kitchen fire's lit." He carries his empty things toward the counter.

---

Out in the yard the lantern has drawn moths. Sefa stands by a grey mare's stall with her hands well clear of the mare's mouth. The stable boy has his fork planted in the straw and is in the middle of answering her.

"Pay the extra days when she's back, yes. Two a day, counted off the deposit or out of your hand, your choice." He ticks it off on his fingers without letting go of the fork. "Saddle, bridle, blanket, all in the price. They come back with her, or they come off the deposit too." He watches how Sefa stands by the mare's door and gives a short approving sniff. "Not a rider, you said. Good. Better you say it here than she finds out on the road. She'll follow the horse in front. Keep your heels quiet and your hands low and she'll do the rest." Then, as if he's been asked his price: "Dannet. Deposit when you lead her out, morning after tomorrow. I'll chalk your name on her door tonight so nobody else gets her."

The grey mare pushes her nose over the half-door and sniffs Sefa's sleeve, and finds nothing worth biting.

You wait at a polite distance and look along the stalls. Reading horses is your trade, and you don't need long. There's a tall chestnut near the gate that holds its head up and looks fine, but it rests one forefoot like it's had trouble with it. There's a pair of carter's mules that belong to somebody else. In the end stall there's a short, deep-chested bay cob with feathered fetlocks and a back as broad as a bench. It stands square on all four feet and doesn't bother to look round.

Dannet sees you looking at the chestnut and jerks his head the other way.

"Not him. He looks a treat and he'll be lame by Lionshead." He walks to the end stall and slaps the cob's rump. The cob takes no notice. "Brick. Fourteen hands, carries a smith and his anvil, walks from dark to dark. Won't run if you beg him, so don't beg him." He looks at the silver between your fingers, then up at your face, every inch a dealer. "Four days, two a day, deposit fifteen gold at first light, and I'll chalk you on his door. And keep that bit till you've seen him walk out in the morning. I don't take money for a horse you've only seen standing."

The cob sighs through his nose and goes back to his hay. As far as your eye can tell, he's sound: clean legs, a good hoof, and no heat anywhere.

You go back in through the warm kitchen passage and up the stair to the left-hand door. The bolt runs true. You shoot it and try it twice. The shield goes against the bedframe, where your hand will fall on it, and the sword lies along the blanket beside you. Below you the common room is a low murmur through the boards.

You are behind your bolt. Nothing else happens tonight unless you want it to.

*(Out of game: none of this needed a roll. Tam agreed to the forge visit, Dannet put you on Brick for four days with the deposit due at first light, and you bolted your door and laid your shield and sword ready, all of it in the story above.)*

Your journal, new:
+ Promise: Brick held for Bram
+ Promise: Nettle held for Sefa
+ Promise: To Hask's forge with Tam

Where you are: his bolted room upstairs, left-hand door · Time: Day 1 · evening
````

**Player** (player r7):

````text
Bram lies awake a while in the dark and listens to the house: the murmur from below, a cart wheel out in the street, the boards settling. It's an old habit too. Once he knows how the place sounds when it's sleeping, he'll know when it isn't.

Before he settles, he gets up once and checks the shutter latch, careful not to lean on it, as Orla told him. He looks down at the yard. The lantern by the stalls is still burning, and there's nobody out there but moths. He goes back to bed.

Fire that burns low. Dogs that don't bark. A case for a priest. He turns it over twice and then lets it go. A man who chews on a thing all night has nothing left to chew with in the morning.

He sleeps the way a guard sleeps, lightly but properly.

---

He's up before the kitchen fire is lit. He hears it catch below, washes his face in the basin, and buckles on the mail without hurrying. Shield on his arm, sword at his hip. He leaves the javelins and the pack bolted in the room.

In the common room he takes a seat by the wall again and asks for porridge. If Sefa is down, he nods her over. If she isn't, he waits for her and doesn't make a show of it.

"Morning, Marrin. I'll do the asking up there if you like, but you watch him. I read men who are about to swing at me. A priest who's lying is a different animal." He eats steadily. "We say plainly who we are. Strangers who sat with the man who lost a wagon, and read the Halvering letter at the innkeeper's table. Nothing about the case unless he raises it, or until we have to. I want to see what he says before he knows how much we know."

When the bowl is empty, he leaves the copper on the board and heads out with Sefa into the cold grey street. They go up toward the Song of the Morning, so they're on the steps before the bells.
````

### Screen 8 · player r8

````text
The Burning Wizard takes a long time to go quiet. For the first hour the common room comes up through the boards as a murmur: a laugh, a bench scraping, the knucklebones man losing again and saying so. Then the voices drop off one by one. Somebody comes up the stair heavily and goes along to the long room, and a door at the end shuts. Out in the street a cart rolls past slowly with one wheel ticking, a dry axle. Somewhere toward the Coast Way bridge a dog barks at something, gets an answer from another dog, and both give up. Under it all the house settles the way old timber does, a creak here and a tick there as the beams cool.

You get up once in the dark and lift the shutter latch without putting any weight on the frame. The yard below is as you left it. The lantern still hangs on its hook by the stalls with a slow cloud of moths around it. Chalk shows pale on two stall doors, and Brick's broad rump fills the end stall. Nobody's out there. You drop the latch and lie back down.

Around midnight the front bar goes across downstairs with a wooden thud, and Orla's tread goes up a back stair. After that the house belongs to the carters' snoring, which comes faintly through the wall from the long room, steady as a bellows.

You sleep.

---

You wake to the sound of the kitchen fire. It's still dark, but the dark has started to thin. Below you a grate is being riddled, kindling cracks as it catches, and a pot lid clangs. The basin water is cold enough to make you blink. You buckle the mail on piece by piece, settle the shield and belt on the sword. The pack and the javelins stay behind the bolt.

The common room is cold and grey. The tables have been wiped and the benches are still upside down on half of them. Only one lamp is lit. Orla is at the hearth in a shawl with her sleeves pushed up, feeding split wood under a black pot. A carter sits alone near the door with his elbows on the board, waiting for the same thing as you and saying nothing. You take your seat by the wall.

Orla looks over her shoulder at you and at the mail. "Porridge it is. It's not thick yet. You'll have it thin or you'll wait." She waits about long enough to hear which. Then she ladles out a bowl, puts a heel of yesterday's bread beside it and sets both in front of you. "One copper."

The porridge is thin, hot and salted, and better than it looks. Through the front shutters the street is turning from black to slate. Up the hill, past the roofs, the Song of the Morning is still a dark shape against a lighter sky. The bells are maybe an hour off. You eat steadily, lay the copper on the board, and keep one eye on the foot of the stair.

Nobody has come down it yet.

Your records, changed:
Money: + 27 cp; − 28 cp

Where you are: common room of the Burning Wizard, at breakfast · Time: Day 2 · morning
````

**Player** (player r8):

````text
Bram finishes the porridge and wipes the bowl with the heel of bread, the way the satchel man did last night. He keeps an eye on the stair and doesn't make a show of it.

When Orla straightens from the hearth, he speaks quietly so it doesn't carry to the carter by the door.

"Mistress, a question while the pot thickens. Hask, at the long forge. Is he a man you'd trust with your change? And has anybody new been in town lately, buying iron and paying over the odds for it? Not smiths. Buyers." He turns the empty bowl a quarter turn. "Strangers with coin tend to drink somewhere. I'd guess they drank here at least once."

He lets her answer in her own time. Then he nods toward the ceiling, at the long room.

"Our friend with the satchel, the one on the third cot. Did he come back last night? He said he'd be down before your fire was lit."

He waits a while longer. If Sefa comes down the stair, he lifts two fingers to bring her over, slides the bread toward her and lets her eat. If the sky over the Song starts going from slate to pale and she still hasn't come, he stands, settles the shield and leaves word with Orla:

"If Marrin comes down, tell her I've gone up to the temple steps and I'll wait there till the bells. Brodder's meeting us there after."

Then he goes out into the cold street and walks up the hill without hurrying. He watches the doorways the way he'd watch a road.
````

### Screen 9 · player r9

````text
Orla straightens from the hearth with the ladle in her fist. She hears you out without looking at the carter by the door, who has gone anyway and left his bowl.

"Hask pays his slate on the tenday, every tenday. I'd trust him with my change." She knocks the ladle once on the rim of the pot. "Not with anything you want kept quiet, mind. He talks, and he's louder when he's been shorted. He's been loud this tenday."

She takes longer over the buyers and stirs while she thinks.

"Smiths have been grumbling that bar iron's dear since spring. That's smiths, though. They'd grumble at free." Another stir. "One I'd call a buyer. Last month, near the start of it. Good coat, southern cut, Amnian I'd say. Two nights in the room you're in, Halloway. He stood the smiths' table a round both nights and asked who had bar iron to spare and how much. He paid me in Amnian coin and didn't haggle over the rate, which nobody does." She shrugs. "Iron goes south to Amn all the time. He might have been nothing. I didn't ask his business. Nobody's asked me about him since, and I've not seen him back."

When you nod at the ceiling she looks at you the way she'd look at a man asking for a second bowl he's already eaten.

"Gone. I said. The cot was empty when I lit the fire and the blanket was folded. He went out by the yard." She turns back to the pot. "He's square with me. That's all I know of him."

Your empty bowl sits a quarter turned on the board. Sefa is already at the table across from you with her own bowl, and her words about the priest are still waiting for your answer. Through the shutters the street has paled to grey. The bells are perhaps twenty-five minutes off, and the climb takes about fifteen.

*(Out of game: Sefa's already at your table, so the leave-word-and-go part doesn't come up. You still haven't answered her. Answer her, then tell me when you two set off.)*

Where you are: at a table in Orla's common room, near the hearth · Time: Day 2 · morning
````

**Player** (player r9):

````text
Bram nods to Orla. "Thank you, mistress. That's worth more than the copper." He adds another to the board anyway.

He turns to Sefa and keeps his voice low.

"Sorry, Marrin. I was half listening to the pot and half to her." He weighs what she said honestly. "You've sat with more priests than I have. If you think it goes better your way, then we do it your way. You lead and I stand at your shoulder looking like what I am. All I'd ask is that we don't hand him the whole story before he's told us his."

He leans in a little.

"One more thing for the pile. Last month an Amnian stood the smiths a round in this room two nights running and asked who had bar iron to spare. He paid in Amnian coin and didn't haggle the rate. Might be nothing. Iron goes south all the time." He shrugs. "But a man who doesn't haggle is a man spending somebody else's money. Ask Hask about him later."

He gets up, settles the shield and looks out through the shutters at the grey street.

"Bells in twenty-odd minutes, and it's a fifteen-minute climb. Finish your bowl, then we go. I'd rather be early and cold than walk in after he's gone in to his prayers."

When Sefa is ready, he holds the door for her and steps out first into the cold. They walk up the hill toward the Song of the Morning, and he keeps half a pace to her street side, watching the doorways as they pass.
````

### Screen 10 · player r10

````text
Orla sweeps your second copper off the board with the first and gives you the same look she gave Pell over the stacked bowls.

"That's two you've left me for nothing. I'll stop telling you things if it keeps on." She goes back to the pot.

Sefa has her bowl, and the street outside has gone from slate to a pale, damp grey. You stand, settle the shield and hold the door. The cold comes in around your legs.

---

Beregost is only half awake. The Coast Way is wet with dew, and the ruts hold thin puddles that show the sky. Two doors down, a smith's apprentice of about fourteen is raking last night's clinker out of a forge mouth into a barrow. He yawns hard enough to crack his jaw and doesn't look up. A woman is taking down the shutters of a baker's shop, and the smell of the first loaves drifts out after her. A spotted dog trots past in the other direction, very busy, nose down. Nobody is in the doorways who shouldn't be there. You have walked a hundred towns at this hour, and this one is as ordinary as any of them.

The street turns uphill off the Way between two rows of plastered houses, and the cobbles start. At this hour it's a steady climb, not a hard one. Halfway up, the hammering starts behind you, one forge and then a second, like men clearing their throats. The roofs drop away below. Past them the Coast Way runs north and south in a grey line until the mist swallows it.

The Song of the Morning sits on the crown of the hill inside a low wall of honey-coloured stone. It has a long roof and a squat square bell-tower at the near end, and the whole front faces east. The gate stands open. In the yard beyond, the flagstones have been swept, and a row of clay pots along the wall holds marigolds still closed against the cold. The single lamp you saw from the inn burns in a niche over the main doors. Up close it's an ordinary brass lamp with its wick turned low.

There are two people in the yard.

A young acolyte with a shaved head stands at the foot of the bell-tower with the rope in both hands. He isn't pulling yet. He watches the eastern sky like a man waiting for a signal. He's thin, perhaps sixteen, and his robe is rose-coloured and too short at the wrists.

The other stands on the top step of the temple with his back to the doors, facing east where the sky over the hills is just beginning to turn from grey to the colour of watered wine. He is tall, taller than you, bald, and his scalp is pink with cold. His vestments are rose and old gold, with the hem darkened by dew. His hands are folded loosely in front of him. He has heard the gate and the sound of mail on cobbles, and he turns his head before you are halfway across the yard.

He takes you in one at a time: the shield, the mail and the sword, then the young woman beside you. His face doesn't change. He looks back at the sky, judges how long he has, and comes down two steps to meet you.

"You're early for the dawn and too late for the night lamp," he says. His voice is low and even, the voice of a man who reads aloud for a living. "The sun's a few minutes off. If you've come to greet it, stand on the east side of the yard and you're welcome. If you've come for me, say so now. Once the bell goes, the sick start coming to the gate, and they come first."

At the tower, the acolyte's eyes have moved from the sky to the two of you. His hands stay on the rope.

The priest is still standing two steps down, waiting to hear whether you've come for the dawn or for him.

Your records, changed:
Money: + 26 cp; − 27 cp

Where you are: yard of the Song of the Morning temple · Time: Day 2 · morning
````

**Player** (player r10):

````text
Bram stops at the foot of the steps, a respectful distance off, and moves the shield behind his hip so it isn't the first thing the priest sees of him. He dips his head. It isn't a temple bow, but it's honest.

"For you, Brother, if you're Anselm. We'll be quick, and we'll stand aside when the bell goes. The sick should come first."

He gives his name plainly. "Bram Halloway. Caravan guard up from Nashkel, paid off and out of work." He nods at Sefa beside him. "This is Sefa Marrin, down from the Gate. She knows a hospice better than I know a temple, so she'll do most of the talking."

He steps half a pace back to Sefa's shoulder, where he said he would be, and lets her take it from there.

While she talks, he keeps quiet and turns a little so he faces east like the priest, out of courtesy to the sun. From that angle he can watch the priest's hands and face out of the corner of his eye, and the acolyte's too. He doesn't stare. He watches the way he'd watch a man at a toll gate: easy, and paying attention.

If the sun clears the hills while they're talking, Bram goes quiet and stands still for it the way everyone else in the yard does. He doesn't know the words, but he can at least keep his mouth shut.
````

### Screen 11 · player r11

````text
*(Out of game: I wrote last round that you hadn't opened your mouth. That was me getting ahead of you. You spoke first, as below, and then Sefa took it up.)*

At the foot of the steps, before Sefa has said a word, you stop a respectful distance off and move the shield back behind your hip. You dip your head. It isn't a temple bow, but the priest's eyes follow it all the way down and back up.

"For you, Brother, if you're Anselm. We'll be quick, and we'll stand aside when the bell goes. The sick should come first."

Something in the long face settles when you say that. It isn't warmth. It's more like a man ticking off a line he had expected to argue over. "I am Anselm. And they do."

"Bram Halloway. Caravan guard up from Nashkel, paid off and out of work. This is Sefa Marrin, down from the Gate. She knows a hospice better than I know a temple, so she'll do most of the talking."

You step half a pace back to her shoulder, and Sefa goes on from there, low and plain. She mentions the letter, the caravan guards and Fenwick.

You stand turned a little east, the way the priest stands, and watch from the corner of your eye. Anselm keeps his hands folded the whole time Sefa speaks, except once. When she says *Halvering letter*, the fingers close on each other and then open again, the way a man's hand does when a weight shifts in a pack he's carrying. After that they stay loose. They stay loose through everything he says about Fenwick, and through the long gap where he doesn't speak of the case.

Over at the tower, the boy doesn't look at the strangers much. He looks at the sky. When Anselm says *I sent Teo down to the inn*, the acolyte's eyes flick to the priest and then away, like any boy hearing his own name. Then the sun breaks the hills and he forgets all of you.

When the bell speaks, you go still. You don't know the words, so you keep your mouth shut and your eyes on the light coming up over the yard wall. The bell rings through the flagstones into your boots. When the last stroke dies away, Anselm goes past you toward the gate.

---

Now the yard has the new sun across the top of it, and the marigolds along the wall are starting to open. At the gate Anselm has the old man's bandaged hand between his own two. He is unwinding the cloth slowly and talking too quietly to carry. The old man winces once and then laughs at something. Behind him the woman with the child on her hip has reached the wall. The child is red-cheeked, with a wet cough that comes across the yard clearly enough. Teo has left the rope and gone in through a side door. He comes back with a basin, a cloth over his arm and a clay jar.

Out on the cobbles a broad shape is coming up the hill with the sun on one side of its face: Tam Brodder, sunburnt neck and all. He gets to the gate, sees who's being tended in it and stops. He stands aside against the outer wall to let the woman and the child go in first. Then he finds you across the yard and lifts his chin an inch.

"Halloway."

That's all. He stays where he is, outside the wall, and waits.

Anselm doesn't look up from the old man's hand. The sun is only a finger's width above the hills. He said he'd be free when it's a hand.

Where you are: temple yard, near the steps · Time: Day 2 · morning
````

**Player** (player r11):

````text
Bram doesn't interrupt the work at the gate. He crosses the yard along the wall, away from the old man and the woman with the child, and stops beside Tam outside the gate. He keeps his voice low enough that it stays between the two of them.

"Brodder. Morning." He looks back toward the priest rather than at Tam. "He's Anselm, all right. Says he'll be free when the sun's a hand up. When Marrin named the Halvering letter, his hands closed on each other and then let go. He talked about Fenwick readily enough. He never said a word about the case." He shrugs slightly. "That might be a man keeping his house's business to himself. Or it might be a man carrying something heavy. We'll see."

Then he lifts his chin toward Teo and the basin.

"Lad's got his hands full." He steps to the gate and speaks over the woman's shoulder to the acolyte, plain and quiet. "Teo, is it? If there's water wants hauling or a man wants holding still, I've got two hands doing nothing. Tell me where the well is." If the boy points, Bram goes and fills whatever he's given. He sets it down where Teo wants it and steps back out of the way. He doesn't crowd the sick, and he isn't trying to earn anything by it. Standing idle in a yard where people are working sits wrong with him.

When the sun is a hand over the hills and Anselm straightens from the last of them, Bram comes back to Sefa's shoulder and lets her carry on. He leans close for a moment before she does.

"He went quiet on the case. If you're going to ask him about it, now's the time, while his hands are wet and he's still thinking about the sick." He steps back to his place. If Sefa leaves it alone, Bram waits for a pause and asks it himself, mildly and without pressing:

"Brother, the letter spoke of a case under the Halvering seal, meant for your hands and no one else's. We're riding down to the old waystone tomorrow, where Brodder's wagon went. If we find it out there, I'd sooner know what I'm holding than guess. Is it something a man should be careful carrying?"

He watches the priest's hands again while he answers.
````

### Screen 12 · player r12

````text
You go along the inside of the wall, keeping well clear of the gate where the old man's hand is being unwound, and step out onto the cobbles beside Tam. The big man shifts over to give you room against the stone. You talk low, with your eyes on the priest, and tell it all: the hands closing at the words *Halvering letter*, the easy talk about Fenwick, and the case that never came up.

Tam takes his time, as he always does.

"Heavy, then," he says at last. He folds his arms over his chest. "Or careful. A priest can be both." He nods toward the yard. "I'll stop out here. Temples and me don't sit right. Hask's fires will be up by the time he's done anyway."

When you speak over the woman's shoulder, Teo looks up. He has the basin balanced on one hip and the cloth slipping off his arm, and for a moment he looks at your mail and sword as if he isn't sure the offer is real.

"Yes, sir. Teo." He jerks his head toward the bell-tower, then remembers his manners and points properly. "The well's round the back of the tower. There's a pail on the hook. The windlass sticks halfway up, you have to lean on it." He holds out the clay jar with both hands. "This one, please, and the pail as well, if you can. We go through it."

The well is where he said, a stone ring behind the tower with moss in the cracks and a wooden cover pushed half aside. The windlass sticks halfway up, just as the boy said. You lean on it and it gives with a groan. The water is black and cold enough to make your fingers ache. You fill the jar, then the pail, and carry them back around the tower. You set them down on the flagstones by the gate where Teo points, a step behind the priest's left hand, and move off out of the way.

Anselm doesn't look round, but his voice comes back over his shoulder, even and low. "Thank you." Then he goes back to work.

The work at the gate is ordinary. The old man's hand has a burn across the palm, an old one that has gone angry at the edges. Anselm washes it from the new pail, lays his own hand over it and says a few words under his breath. A faint warmth, like early sun on a wall, shows for a moment between his fingers and the old man's. The angry red softens to pink. The old man flexes the hand and laughs again, louder this time, and tries to press a copper on Teo. Teo won't take it and points him at the box by the doors.

The child is next. Anselm hasn't used his gift on her. He kneels on the wet stone in his vestments, puts his ear to her back and listens while she coughs. Then he talks to the mother for a while in a voice too low to carry. Teo goes inside and comes back with a small stoppered pot. The mother nods at everything, hitches the child up on her hip and goes off down the hill with the pot held tight in her fist.

Two more come after her: a smith's apprentice with a blistered forearm wrapped in a wet rag, and an old woman who mostly wants to sit on the wall and be asked how she is. Anselm asks her. He stays with her longer than he stays with the burn.

The sun climbs. The marigolds along the wall open the rest of the way, and the shadow of the bell-tower pulls in across the yard. By the time the last of them has gone off down the cobbles, the sun stands a good hand above the eastern hills, and the street outside the gate is empty except for Tam, still leaning on the wall with his arms folded.

Anselm straightens, dries his hands on the cloth Teo holds out, and stands for a moment rolling his shoulders like a man who has been kneeling too long. Teo picks up the half-empty pail and goes off toward the side door with it.

You come back across the yard to Sefa's shoulder, lean in and say it quietly: if she means to ask about the case, now is the time, while the priest's hands are still wet and his mind is still on the sick. Then you step back into your place.

Anselm walks back to you. The dew-dark hem of his vestments is darker still at the knees. He glances east once, and this time it isn't to judge the hour. It is more like a man checking he has earned the rest of the morning.

"The gate's clear," he says. "I'm yours until someone else comes up that hill. Ask what you came to ask."

*(Out of game: your walk to Tam and the water from the well were both told in the story; neither was uncertain, so no roll was needed. Your question about the case only comes if Sefa leaves it alone, and her player hasn't chosen yet, so the turn stops with Anselm's "Ask what you came to ask." It isn't a roll either way. Asking a priest plainly is just talk.)*

Where you are: temple yard, near the gate, before Anselm · Time: Day 2 · morning
````

**Player** (player r12):

````text
Bram stays at Sefa's shoulder and says nothing at first. He gives her a short glance that means *your ground, go on*. The priest has earned a straight question, and Bram would rather it came from her.

While he waits, he looks at the priest's knees, dark with wet stone, and then at his hands. Those hands were steady on the old man's burn, and they closed on each other at the Halvering name.

If Sefa takes up the case, Bram keeps quiet and watches.

If she asks about something else and leaves the case alone, Bram waits for a pause and asks it himself. He keeps his voice low and leaves it room to be answered or not:

"Brother, one more thing, and you can tell me it's not mine to ask. The letter spoke of a case under the Halvering seal, meant for your hands and no one else's. We ride for the old waystone tomorrow, where Brodder's wagon went. If we turn that case up in a ditch out there, I'd sooner know what I'm holding than guess." He looks the priest in the face. "Is it a thing a man should be careful carrying? And if we find it, do I bring it to you sealed, or does the house want it first?"

Then he stops talking, keeps his hands still on the shield rim, and watches Anselm's hands for the answer before he listens to the words.
````

### Screen 13 · player r13

````text
*(Out of game: Anselm went inside before you could answer, so that has been moved back. You catch him on the top step with his hand on the door.)*

Sefa puts off the case until after noon. Anselm nods, climbs the steps and puts one hand to the heavy oak door. You give Sefa a short glance: *your ground*. She has already turned for the gate, and out on the cobbles Tam has called "Halloway. Forge." and started down the hill beside her, slowly. Only you are left in the yard to speak.

Anselm stops with the door half open. A beeswax-smelling dark breathes out past him. He doesn't turn all the way round, only far enough to look down at you over one shoulder.

You stop talking and keep your hands still on the shield rim, and you watch the priest's hands.

Anselm lets go of the door, and it swings shut on its own weight. His hands come together in front of his vestments. They don't tighten the way they did in the yard. They fold and rest, like a man putting down something he expected to carry further. His knees are dark with the wet stone. He looks at you for a long moment, and doesn't look at the sky.

"To me," he says. "Sealed. The house wrote *no other*, and the house meant it. They sent it away from themselves on purpose. Don't let anyone tell you it should go back to the Gate first."

He comes down one step, so he isn't talking down at you.

"Careful, yes. Not because it's heavy, or because it will bite you through the seal. As I understand it, closed, it will do you no harm." He stops there, and something behind his eyes weighs how much to say on a doorstep. "Don't open it. Don't let anyone you're riding with open it. If you find it and the seal is already broken, leave it in its case, wrap it in whatever you have, and bring it to me without looking."

That's more than he said in the yard, and you can see he knows it. His hands stay quiet through all of it. They don't move when he says *careful*, or when he says *don't open it*. A man who was lying would have done something with his hands about then.

"I'll tell you what I was told of it after noon, with Master Fenwick's letter on the table and the door shut," Anselm says. "Not on the steps." He looks at your shield, at the painted-over mark, then back at your face. "You asked the right question, Master Halloway. Most men would have asked what it's worth."

He goes back up, opens the door and goes in. It closes behind him with a soft weight of oak and brass.

The yard is empty now apart from the marigolds and the half-empty pail by the gate. Down the hill, under the other hammers, Hask's heavy beat keeps time over the roofs. Sefa and Tam are a street or more ahead of you by now, and Tam is walking slowly enough to be caught.

Where you are: temple yard, at the foot of the steps · Time: Day 2 · morning
````

**Player** (player r13):

````text
Bram stands a moment longer at the foot of the steps, looking at the closed oak. Then he dips his head to the door, the same honest not-quite-bow as before. He picks up the half-empty pail by the gate and sets it inside the side door where Teo will find it. Then he goes out.

He lengthens his stride down the cobbles and catches up with Tam and Sefa before the street turns onto the Way. He falls in on the street side and keeps his voice low.

"Caught him at the door. Here's what he said, near enough word for word." He counts it off on his fingers. "If we find it, it goes to him, sealed. Not back to the Gate first, and the house meant *no other*. Closed, it'll do us no harm. Don't open it, and don't let anybody with us open it. If the seal's already broken, we wrap it in whatever we've got and bring it to him without looking." He lets that sit for a step or two. "His hands never moved, Marrin. Not once. I don't think he was lying. I think he's scared of it, though, and that's a different thing."

He glances at Tam. "So if your wagon-lifters took it, they may have opened it. Or they knew better than to. I'm not sure which I'd like less."

"After noon he'll tell us what he was told of it, door shut, Fenwick's letter on the table. He's got a letter from Fenwick, it seems. So the man wrote ahead at least once." He looks over at Sefa. "You set that hour, so I'll come with you, if you'll have me."

Then the heat and the hammering of the long forge are close, and Bram nods Tam ahead.

"Your ground now, Brodder. He's your smith and it was your wagon. I'll stand back and look like I'm admiring his tongs." His mouth twitches. "When he's done grumbling about the ore, I'll ask about the Amnian with the good coat."

He stops a polite pace inside the forge door, out of the way of the swing of the hammer, and does what his father taught him in the smithy yard: says nothing, watches the work, and waits for the smith to talk.
````

### Screen 14 · player r14

````text
You stay at the foot of the steps a moment longer, looking at the shut oak, then dip your head to it the way you did before. The half-empty pail is still by the gate. You carry it across the yard and set it inside the side door under the bell-tower, where Teo will trip over it soon enough, and go out through the gate.

You lengthen your stride down the cobbles. Tam has kept his word about walking slowly, and you catch the two of them a street short of the Way. You fall in on the street side and give them the doorstep word for word, counting each part off on your fingers: sealed, to Anselm, not back to the Gate; closed it does no harm; nobody opens it; if the seal is broken, wrap it and bring it without looking. You tell them the priest's hands never moved, and that you think Anselm is frightened of the thing rather than lying about it.

Tam walks a dozen steps on that before he answers.

"Fenwick went a month back. Mine went eleven days back." He watches the cobbles in front of his boots. "If the same men took both, they've had that case three weeks. Long enough to open it." He leaves it there.

Tam gives no answer to your question to Sefa about coming with her after noon. It isn't his hour to give.

The heat of the long forge reaches you before the noise does, a warm push of air across the Way by the bridge. You nod Tam ahead and make your remark about admiring the tongs. Tam doesn't smile, but one corner of his broad face shifts. Then the three of you come in under the black timbers. Hask quenches his bar in a cloud of steam and starts on Tam.

*Come to tell me where my eleven sacks went? Or come to tell me again you don't know?* Then his eyes go to Sefa. *Ambrel's sending women now to say sorry for him?*

You stop a pace inside the open end, well clear of the hammer's swing, and say nothing.

---

Tam takes the first question the way he takes everything, slowly, with his arms folded and his feet planted on the packed earth outside the spark line.

"Don't know." He lets that stand by itself. "Going back tomorrow. Me and Var. Find out."

"Going *back*." Hask pulls a fresh bar from the fire with the tongs, orange shading to yellow at the tip, and lays it on the anvil. The hand hammer comes down four times while he talks. "Ambrel paid you off." *Clang.* "Ambrel says paid in Nashkel means mine in Nashkel, and the road's my lookout." *Clang.* "So I'm out eleven sacks, he's out nothing, and you're out on the road again for free." *Clang, clang.* He turns the bar. "You were always a slow one, Brodder. Didn't know you were stupid as well."

Tam's arms stay folded. "Your sacks are on that road somewhere. So's my driver."

That gets a grunt. It isn't agreement, but it isn't another insult either. Hask lifts the bar, sights along it with one eye shut and puts it back in the fire. "*Harder*, boy, it's going grey on me." The apprentice leans into the bellows. The wet rag on his forearm flaps with every pull, and he keeps sneaking looks at Sefa.

Then Hask's eyes find you by the door: the mail, the shield, the sword, the way you stand still and out of the way like a man who has stood in a forge before. He looks you up and down once, bluntly, the way he'd look at a horse somebody else was trying to sell him.

"You. Stand there all you like. Don't touch my tongs." Then he turns back to Sefa with the bar heating behind him, and his stubbled brows go up. He's still waiting on her answer. Who is she, and is she here to say sorry for Ambrel?

*(Out of game: Hask's opening lines were spoken just as you reached the door. His question to Sefa is still hers to answer, and so is your offer to come with her after noon.)*

Where you are: just inside Hask's long forge by the bridge · Time: Day 2 · morning
````

**Player** (player r14):

````text
Bram gives Hask one short nod at *don't touch my tongs*, the nod of a man who has heard the same thing from his own father a hundred times. He keeps his hands on the shield rim and stays put.

He lets Sefa answer for herself. He doesn't look at her while she does it. He watches the bar in the fire instead, the way his father taught him: if you watch the iron, the smith forgets you're there.

He notices the apprentice's wrapped forearm on the bellows. It's the same lad who was at the temple gate this morning, and Bram files that away.

When Hask has said his piece to Sefa and gone back to the anvil, Bram waits for the bar to come out of the fire and the first blows to land. Then he speaks into the gap between strokes. He keeps it level and offhand, as if they were talking about the weather.

"Bar iron's been dear since spring, I hear." *Clang.* "There was an Amnian through here last month. Good coat, southern cut. Stood the smiths' table a round at the Burning Wizard two nights running and asked who had bar to spare." He waits for the next stroke. "Paid in Amnian coin and never haggled the rate. Did he come asking at your door, master smith? And if he did, did anybody sell to him?"

Then he goes quiet again and watches the iron. If Hask bristles, Bram doesn't push. He just adds, mildly:

"I ask because three wagons of Halvering bar went missing on that road a month back, and your ore went eleven days ago. A man who doesn't haggle is spending somebody else's money. I'd like to know whose."
````

### Screen 15 · player r15

````text
Hask gives no sign he saw your nod. He has gone back to the iron, and the iron is all he looks at. The bar comes out of the fire yellow at the tip. He lays it on the anvil and the four-beat starts.

You talk into the gaps. Hask's hammer doesn't miss a stroke. When you get to *never haggled the rate*, one stubbled brow goes up, and it stays up.

"Him." *Clang.* "I drank his ale." *Clang.* "Both nights. Free is free." *Clang, clang.* He turns the bar. "Asked me did I have bar to spare. I laughed in his face. Look at my hearths." He jerks his chin at the two cold ones without looking round. "He laughed too. Polite. He knew already. He'd asked the room before he asked me."

The bar goes back in the fire. "Harder, boy." The apprentice leans into the bellows, and Hask wipes his forehead with his wrist and goes on in his own time.

"Here's what I didn't like, since you're asking. He didn't want what I had. Nobody's got any, and he knew that. What he wanted was who brings it up. Which factors ride the Way, what days they leave Nashkel, how many wagons. Said he'd sooner buy off the wagon at the road than pay a smith's price after." He snorts. "Fair enough. That's trade. Any buyer who wants it cheap goes to the factor. Only he asked it the way you'd ask about weather, and he bought the next round before anybody had finished answering."

You bring up the three Halvering wagons, the ore eleven days back, and spending somebody else's money. Hask is quiet for a moment, which for Hask is a long time. He watches the iron colour.

"Who told him what, I couldn't say. Half that table would tell you their mother's weight for a free ale." He pulls the bar, looks at it, puts it back. "Nobody sold to him. Nobody had any to sell. But the second night I went home and he was still sitting there. Him and Taerom, heads together at the end of the bench, and Taerom wasn't laughing." He shrugs his huge shoulders. "Taerom had bar coming up that lot. The first lot. The one that came in two wagons short." *Clang.* "Make what you like of that. I'm not saying anything. I'm saying who was sitting where."

By the open end, Tam has gone very still with his arms still folded. He doesn't speak, but his eyes have left Hask and moved to the road outside, the grey line of the Coast Way going south.

Hask draws the bar out once more, sights along it with one eye shut and drops it into the slack tub. Steam goes up between you. When it clears he's looking at you, at how you stand outside the spark line with your hands still and your eyes on the work and not on the smith. It's the same blunt horse-dealer look as before, only slower this time.

"You've swept a forge floor," he says. "Don't tell me you haven't. You stand like a man who got clouted for standing anywhere else." He reaches for the next bar. "Whose yard?"

Where you are: Hask's forge, outside the spark line · Time: Day 2 · morning
````

**Player** (player r15):

````text
Bram doesn't smile, but something in his face eases, the way a man's does when a stranger names his home town.

"Halloway's yard. Fields of the Dead, outside the Gate, by the north road. My father shod carthorses and mended wagon tyres for the funeral trade. Dead men's carts break like anyone else's." He nods at the slack tub, still steaming. "I got clouted for standing in the spark line, for touching his tongs, and for talking while the iron was colouring. Mostly for that last one. Left at sixteen. He said I'd never make a smith because I watched the road more than the fire. He was right."

He waits while Hask takes up the next bar and it goes into the coals. Then he speaks into the gap the way he did before.

"Taerom. Is he a smith, or a factor? Where would a man find him this morning?" He keeps it mild. "I'm not going to put my fist in his face over who sat where. I'd just like to hear from him what the Amnian wanted to know, and whether he told him." A short pause. "If a man rides his wagons out on the days somebody asked about over free ale, and then those wagons don't come in, he might be glad to talk. Or he might be the last man in Beregost who wants to."

He glances at Tam, who is still watching the road, and adds one more thing in the same level tone.

"And the Amnian. Did he say a name, or where he was going after? South, or back up toward the Gate?"

Then he goes quiet again and watches the iron colour, outside the spark line, and leaves Hask the next stroke.
````

### Screen 16 · player r16

````text
Hask doesn't look up from the fire while you talk. When you get to *dead men's carts break like anyone else's*, the hammer stops for half a beat above the coals before he sets it down on the anvil's heel.

"Funeral trade." He pulls the bar out, decides it isn't ready and pushes it back in. "Huh. Good steady work, that. The dead don't haggle and they never come back to say the tyre's gone loose." He looks sideways at you for a moment. "Your old man was right. You stood there the whole time watching my door and my fire both, and you thought I hadn't noticed."

There's no insult after it this time, which for Hask is the same as a compliment.

He keeps an eye on the bar while you ask about Taerom, and answers in time with the work.

"Smith." The bar comes out yellow and goes onto the anvil. *Clang.* "Best in Beregost, he'll tell you. The trouble is he's right." *Clang.* "He buys bar off the factors by the wagonload and sells blades and armour south and north both, so call him a factor too if you like, he won't thank you for it." *Clang, clang.* He turns the bar. "Thunderhammer's up the hill, on the left before the temple road. Big stone place, double doors, his name over them in iron letters as long as my arm. He'll be at his anvil now with two journeymen sweating for him. He doesn't like being looked at while he works. He likes being asked questions while he works even less."

You mention the days and the free ale, and Hask snorts into the steam as the bar goes into the tub.

"Here's what I'll say about Taerom. He told the whole of Beregost he lost two wagons. Stood in the market and shouted it. He never told anybody he'd sat with that Amnian." He wipes his wrist across his forehead. "Maybe there was nothing to tell. You'll find out how glad he is to talk."

Over by the open end, Tam speaks without turning his head from the road. "Ambrel leaves Nashkel first day of every tenday. Has for years." He takes a moment over it. "Anybody on the Way knows that, Halloway. Nobody needed to buy them ale for it."

Hask grunts. He can't argue with that, and he doesn't like it.

"The Amnian. Name." He thinks about it with the next bar in the tongs, and his stubbled brows draw together. "Never gave me one. Or he did and I was drinking. Ask Orla, he slept under her roof." He puts the bar into the coals. "Going after? Said Nashkel, for the fair. Every Amnian on this road says Nashkel. That's where Amn starts." He shrugs his huge shoulders. "He went south. That's all I saw. I saw his back going out the door."

The bar heats. The boy works the bellows, and the wet rag on his forearm flaps with every pull. Hask stands a moment with his hand on the tongs, looking at the two cold hearths and not at anybody. Then he reaches up to a rack of tools above the anvil, frowns at it, and holds the long tongs out to you handle first. It's the first courtesy he has shown anyone this morning.

"Funeral-cart Halloway. Hold that bar in the fire for me while I find the swage some idiot's put back in the wrong place." He doesn't look at the boy. "Don't let it go grey on me."

Where you are: Hask's smithy in Beregost, at the forge · Time: Day 2 · morning
````

**Player** (player r16):

````text
Bram takes the tongs without a word. He doesn't make a show of it, and he doesn't grin. He sets his shield against the post by the door, out of the way, and steps up to the hearth on the side away from the bellows, so he isn't in the boy's road. He gets a proper grip low on the handles, with his weight back and his elbows in, the way he was clouted into holding them at twelve, and he lays the bar in the heart of the coals.

He keeps it there and turns it a quarter now and then so it heats even. He watches the colour come up the iron and lets the forge be quiet for a while. Talking while the iron colours was what earned the clout.

When Hask comes back with the swage, Bram draws the bar out at a good yellow and holds it out to him handle-first in the tongs. Then he steps back outside the spark line and picks up his shield.

"Didn't let it go grey." It's the nearest thing to a joke he's made all morning.

While the next blows land, he speaks into the gap, same level tone as before.

"One last thing and I'm out of your forge, master smith. When Taerom's two wagons went, did his drivers go with them, like Brodder's man? Or did anybody come back to tell it?" He waits for a stroke. "And did anyone say the fires burned low that night, or the dogs were quiet? Drivers talk in the market same as smiths."

Whatever Hask says, Bram nods his thanks at the end of it.

"Obliged. If your sacks are out on that road, we'll tell you where we found them." He glances at the cold hearths. "Can't promise they'll be in a state to sell."

Out on the Way, he speaks quietly to Tam and Sefa.

"Thunderhammer next, while he's at his anvil and doesn't want to be looked at. A man who doesn't want questions while he works sometimes answers short just to be rid of you. Then Orla for the Amnian's name. She'll have taken it if she took his coin. Then Anselm after noon." He tips his head at Tam. "You're right that anybody knows Ambrel's days. But the Halvering factor's days and Taerom's might not be so common, and he was asking how many wagons, not when. Somebody was counting guards." His jaw sets a little. "Twelve guards for six wagons on my run, and they let us by. I'd like to know if that's luck, or arithmetic."
````

### Screen 17 · player r17

````text
You don't say anything when you take the tongs. You prop the shield against the post by the open end and step up to the hearth on the far side from the bellows, out of the boy's way. You take the handles low, weight back, elbows in. The bar is already pale straw at the tip, hotter than Hask left it. You turn it a quarter in the coals so it heats even, and after that the only sounds are the bellows and Hask swearing at his tool rack.

The apprentice watches you for three pulls. Then he stops watching and goes back to counting.

Hask comes back with the right swage at last and drops it into the anvil's square hole. You have the bar out before he can turn round. It comes out bright, with no spit of sparks off the end, and you offer it across handle first. Hask takes it without a word and looks along it with one eye shut. Then he grunts, and the grunt has nothing sour in it. You step back outside the spark line and pick up your shield.

"Didn't let it go grey."

"No." *Clang.* Hask has the bar in the swage and is rounding it in his four-beat. "Your old man clouted you right." *Clang, clang.*

You ask your last question into the gaps between strokes: whether Taerom's drivers went with the wagons, whether anyone came back to tell it, and whether there was talk of low fires or quiet dogs.

"Both drivers. Gone with the wagons." *Clang.* "Taerom stood in the market and shouted about his iron. Price per bar, the lot. I never heard him shout once about the drivers." *Clang.* "Make what you like of that as well." He turns the bar in the swage. "Dogs, fires, I couldn't tell you. Taerom hired the guards, so ask Taerom. One of them drank at the Wizard after. Ambrel's lot weren't in yet. He said he'd never slept so sound on the road in his life. Said it for a laugh." *Clang, clang.* "Nobody laughed. Two men were gone."

When you thank him, he doesn't look up, and when you promise word of the sacks he only nods at the iron. You look at the cold hearths and say you can't promise what state they'll be in. That gets a snort.

"Ore's ore. Rain doesn't hurt it. It just bleeds." He lifts the bar out of the swage. "Funeral-cart. Next time you're standing about idle, stand about in here."

---

Out on the Way the air is cooler, and the noise of the forge falls behind you. A carter's wagon rumbles past toward the bridge. You keep your voice low and lay out the morning: Thunderhammer while Taerom is at his anvil and wants rid of you, then Orla for the Amnian's name, then Anselm after noon. Then you get to the guards and the counting.

Tam hears you out with his eyes on the road south. He walks a few steps before answering.

"Twelve for six." He says it like a figure on a slate. "Ambrel had four for five. Taerom's lot, I don't know." His jaw shifts. "If somebody's counting, Halloway, they counted us and saw it was worth it."

He looks up the hill, where the roofs climb toward the temple and a big stone building stands on the left before the temple road.

"I'll come up. Taerom won't know my face." A pause. "That might help."

The hammers of Beregost are going all over town now. Thunderhammer is a ten-minute climb.

Where you are: on the Way outside Hask's forge, Beregost · Time: Day 2 · morning
````

**Player** (player r17):

````text
Bram nods once at Tam's arithmetic.

"Worth it, or easy. Four for five is easy." He settles the shield on his arm. "Come up, then. You stand by the door and say nothing, and if he looks at you, let him wonder."

They start up the hill. Halfway up he glances at Sefa.

"Here's how I'd play Taerom, unless either of you has better. Hask says he hates questions at the anvil. So we don't ask about the Amnian first. We ask about his drivers. A man who shouted the price of his iron in the market and never once named his drivers has a sore spot there. Press on that and see which way he flinches." His mouth tightens. "If he snaps at us to get out, fine. A short answer tells you things too. If he's frightened, he'll ask *us* what we know. Then we've got him."

He thinks a few steps more.

"And I'll ask who he hired for guards and how many. The one who slept sound at the Wizard. If that man's still in Beregost, I'd like a cup with him before we ride."

At the double doors with the iron letters, Bram stops, reads the name, and lets the heat and the two journeymen's hammers wash over him for a moment. He doesn't step in until there's a break in the striking. Then he goes a pace inside, stands outside the spark line like he did at Hask's, shield low, hands still, and waits for the master smith to look up.

When Taerom does, Bram speaks plainly and keeps it short.

"Master Taerom. Bram Halloway, caravan guard up from Nashkel. I won't keep you from the iron long." He lets a stroke fall. "We ride for the old waystone tomorrow, where Ambrel's tail wagon went. Your two drivers went the same way, I hear, with your wagons. I'd like their names, and the name of whoever you had guarding them. If they're out there, I'd sooner know who I'm looking for."

Then he stops talking and watches the man's hands on the hammer.
````

### Screen 18 · player r17 card 1

````text
Tam hears out *worth it, or easy* without breaking stride. "Easy," he says after a dozen steps, like a man accepting a bill he can't argue with. When you tell him to stand by the door and let the smith wonder, one corner of his broad face shifts. "I'm good at that."

The climb is steeper than the one to the temple. The cobbles run up between smiths' yards, and every yard has its own hammer going. Halfway up, you lay out how you'd play Taerom: drivers first, the Amnian later, a short answer is still an answer, and if Taerom gets frightened he'll start asking you questions. Tam listens with his eyes on the street ahead. At the part about the guard who slept sound, he grunts.

"Guards that sleep don't get hired twice. He'll still be in town. Nobody's paying him to leave."

Your question to Sefa, whether she has a better way, goes up the hill with you unanswered.

Thunderhammer is where Hask said it would be, on the left before the temple road. It's a big building of grey stone with a slate roof and double doors of iron-strapped oak propped open with a pair of anvils. Above them, TAEROM is spelled out in wrought iron, each letter as long as a man's arm, and every curl of them is clean. Nothing in this yard was made in a hurry.

Inside, the heat hits harder than it did at Hask's. There's one big hearth with a hood of riveted plate over it, and it's going white at the heart. Two journeymen in leather aprons stand at the anvil with sledges, striking in turn, *one-two, one-two*, on a thick billet. A third man leads them with a light hammer, tapping the spot where he wants the next blow, and they put it there every time. Along the walls hang finished blades, a rack of spearheads and a breastplate on a wooden stand, polished bright enough to throw the firelight back.

You stop at the doors and let the noise wash over you. When the light hammer rings twice on the anvil's face, the sledges stop, and you step a pace inside. You stand outside the spark line with your shield low and your hands still. Tam takes the doorpost behind you and folds his arms.

The man with the light hammer looks up.

Taerom is no Hask. He's tall and long in the arm, grey-bearded and trimmed close, and his apron is clean. Hask would call that an insult. His hands are big and scarred, but he holds the hammer loosely, like a pen. His eyes go over you once: the mail, the painted shield, the way you're standing. Then they move to Tam at the door, stay there a moment, and come back.

You keep it short. You give your name and your trade. You're riding for the old waystone tomorrow, where Ambrel's tail wagon went. Taerom's two drivers went the same way, you've heard. You'd like their names, and the name of whoever was guarding them.

You let one stroke's worth of silence fall and watch the man's hands.

At the word *drivers*, the light hammer stops a finger's width above the billet and stays there. The journeymen notice. One of them looks at the other.

(A roll card for Bram Halloway, your character. Only you press it.)

[Roll card] Bram Halloway · Skill check — Insight (Wisdom +1): reading Taerom's hands at the word "drivers"
What adds to the die: +1 1d20+1
DC 15
Rerolls left: 2
The die is cast on the server; tap it to see how it fell.

[Roll the die]
````

**Player** (player r17 card 1):

````text
[Roll the die]
````

### Screen 19 · player r17 card 1

````text
(A roll card for Bram Halloway, your character. Only you press it.)

[Roll card] Bram Halloway · Skill check — Insight (Wisdom +1): reading Taerom's hands at the word "drivers"
What adds to the die: +1 1d20+1
DC 15
Rerolls left: 2
Die: 11
11 + 1 = 12
Failure — 12

[Onward] [Request an allowed reroll — Insight (Wisdom +1): reading Taerom's hands at the word "drivers"]
````

**Player** (player r17 card 1):

````text
[Onward]
````

### Screen 20 · player r18

````text
You can't read what's under it. The hammer comes down onto the anvil's heel and Taerom's hand closes on the haft, knuckles pale, and from where you stand it looks like plain anger: a busy master who's been interrupted, and by a stranger saying the one thing the whole town has stopped saying to his face. If there's anything else under it, it stays hidden.

"Back to the fire," Taerom tells the journeymen. He doesn't raise his voice. They lift the billet in the tongs between them and carry it to the hearth without a word, and one of them starts working the bellows hard enough to keep himself out of the conversation.

Taerom wipes the hammer face on his apron. It's clean already.

"Wil Arndt and Pedder Lusk." He says the names flat and fast. "Pedder drove for me eleven years. Wil was my wife's cousin. Second season on the box." He puts the hammer down on the bench, squared up with the edge. "Guards were four out of the Friendly Arm. Garra Fell had them. She took her money and rode north the day after they came in. She won't be back here." A short pause. "The one you'll have heard about is Dob Herrold. He drinks at the Jovial Juggler on the Way, as long as somebody's paying. Nobody's paying him to guard anything now."

He gives Tam another look, longer this time, the kind a man gives a face he's trying to place. Then he turns back to you.

"You said *the same way*." His voice is still level, but the words come out clipped. "Ambrel's wagon and mine. Who told you that? Hask?" He doesn't wait for an answer to that one. "What do you know about where they went, caravan guard, that you came up my hill to ask me for names?"

Over at the hearth the bellows wheeze. The billet goes from red to orange, and nobody touches the sledges.

You watch Taerom's hands and come away with nothing beyond the anger. Your read of the man has failed: whatever the word *drivers* touched in the master smith, you can't tell whether it was grief, guilt or fear. All you're sure of is that Taerom wants you out of the forge.

Taerom is still waiting for your answer. Who told you *the same way*, and what does a caravan guard know about where the wagons went?

Where you are: Inside Taerom's Thunderhammer forge, Beregost · Time: Day 2 · morning
````

**Player** (player r18):

````text
Bram doesn't move. He keeps his hands still on the shield rim and answers in the same level voice, without hurrying.

"Nobody had to tell me, master smith. You told the whole market yourself: two wagons, drivers and all. Ambrel's tail wagon went eleven days back, driver, mules and load. The Halvering house has three wagons of bar and a factor a month gone, and they've written to the Wizard asking after him. That's three lots on one stretch of road, and no men coming home from any of them." He lets a moment pass. "I've walked that road sixteen years. That's not three bad lucks. That's one hand."

He tips his head a fraction toward the bellows and the billet going orange. It's a courtesy: *I know I'm costing you heat.*

"What I know, I'll tell you, since you asked straight. Ambrel's wagon went off the Way east of the old waystone. The ruts run a hundred feet and stop on shale. The fire burned low that night with dry wood on it, nobody woke, and the mules never made a sound." His eyes stay on Taerom's face. "One of your guards told the Wizard he never slept so sound on the road in his life. I'd like to hear from Herrold whether his fire burned low too."

He stops there, then adds quietly, with no edge in it:

"I'm not here to lay anything at your door. Your wife's cousin is out there somewhere, and so is Pedder. If we find them, or what's left of them, I'd sooner bring them back to someone who'll say their names. If there's anything else about that run that you didn't shout in the market, a day they were asked about, a man who wanted to know how many guards rode with them, I'd take it as a kindness. And it stays with me."

Then he waits. He doesn't fill the silence, and he watches the hands.
````

### Screen 21 · player r19

````text
Taerom hears the whole of it with his hand flat on the bench. He doesn't interrupt. When you say *one hand*, his jaw shifts under the trimmed beard, but that's all.

At the hearth the billet has gone from orange to yellow. The journeyman on the bellows glances at it, then at his master's back. He keeps pumping and says nothing.

You tell him about the shale and the ruts, the fire burning low with dry wood on it, and the mules that never made a sound. Taerom's eyes leave your face for the first time. They go to the white heart of his own fire and stay there a moment, as if he's measuring it.

"Low," he says. "With wood on it."

He doesn't ask anything more about it. When he speaks again his voice is level, but it's slower than before.

"Fell told me her watch slept. All four. She stood in my yard and said it to my face like it was weather." He takes his hand off the bench. "I paid her what I owed her. Then I told her that if she came up my hill again, I'd have her put off it. That's why she's gone north."

When you mention Herrold, Taerom gives a short nod. "Ask him. He'll tell you for the price of a jug. He told everyone else."

Then you get to the drivers and the names, and to *someone who'll say them*. Taerom's hand comes back to the light hammer on the bench. He nudges it a finger's width until the haft lines up with the edge, though it already did. His eyes are on you the whole time.

"Wil's mother comes to my door every morning," he says. "Before my wife is up. She doesn't knock. She stands in the yard until somebody sees her." He waits a moment. "If you find them, you bring word up this hill first. Before the market, before Hask, before anybody. Ten gold for it, living or not. I'll pay it into your hand myself."

He doesn't answer the rest. You asked about a day somebody wanted to know, and a man who wanted to know how many guards rode. You get nothing back on either. The gap where an answer should be lasts one breath, then two, and Taerom lets it stay empty. His hand stays on the squared-up hammer.

"Your heat's burning, master," the journeyman at the hearth says quietly. He sounds apologetic.

"I know what my heat is doing." Taerom doesn't look round. Without hurry, he lifts the light hammer off the bench. "Caravan guard. You've had your names. You've told me your road. Now I have work, and you're standing in my light." He looks past you for a moment, to the doorpost. It's a fourth look at Tam's broad, sunburnt face, and it's as short and puzzled as the others. Then he turns away. "Out. Both of you. All three."

The light hammer rings twice on the anvil face. The journeymen bring the billet across between them, yellow and spitting at the edges, and the sledges start up again: *one-two, one-two*. Every blow lands where the light hammer taps. Taerom doesn't look at the door again.

---

Outside under the iron letters the air is cool after the heat. Down the hill, Beregost's hammers are going in every yard. Up the street the temple road climbs toward the Song of the Morning, and the sun stands well clear of the hills now. It's a little after nine. Noon and Anselm's side door are three hours off, and the ride is tomorrow at first light.

Tam comes off the doorpost and falls in beside you. He walks a dozen steps down the cobbles before he says anything.

"He looked at me again." He keeps his eyes on the street ahead. "I've never shod a horse in his yard, Halloway. Never sold him a thing." He shrugs his heavy shoulders. "Don't know what he sees."

The morning is yours. Orla has the Amnian's name if anyone wrote it down, Herrold drinks at the Jovial Juggler, and nothing else comes looking for you before noon unless you go looking for it.

*(Out of game: no roll was needed. You told Taerom the truth, and Taerom reacted to what he heard.)*

Your journal, new:
+ Goal: Word of Taerom's drivers
+ Quest: Word of Taerom's drivers

Where you are: street below Taerom's forge, Beregost, with Tam · Time: Day 2 · morning
````

**Player** (player r19):

````text
Bram walks a few steps down the cobbles before he answers. He's turning it over.

"Four looks is too many for a stranger." He keeps his voice low. "Either you've got a face like somebody he knows, or he's seen you somewhere and can't place where." He glances sideways at Tam. "Think back, Brodder. Were you at the Wizard last month, the nights that Amnian was standing rounds? Or in Nashkel when Taerom's lot left? If you were drinking at the next table while the Amnian and Taerom had their heads together, he might remember the back of your neck better than you'd like."

He lets that go. It's a question, not an accusation.

"He gave us one thing he didn't mean to. I said a day asked about, a man asking how many guards rode, and he went quiet and straightened a hammer that was already straight." His jaw sets. "That's no answer, but it's not a denial either. A man with nothing to hide would have told me to go hang. Ten gold for word up his hill first, before the market and before Hask. He wants to hear it before anybody else does. Maybe for the cousin's mother." A shrug. "Maybe not."

He looks back up at the iron letters, then down toward the Way.

"Three hours to noon. Here's my thinking. The Wizard first, it's on the way. Orla for the Amnian's name, if he gave her one, and I'll pay Dannet the deposit on Brick while I'm in the yard, so it's done. Then the Jovial Juggler. Herrold will talk for a jug, and I'd sooner buy it before noon, while he's still got half his wits." He turns his head to take in Sefa as well. "Then the temple at noon, Marrin, if you'll have me at that table. Brodder, Anselm's not your ground, I know. Find Var and tell her what we've got. And if there's anything about that waystone night you haven't said yet, tonight would be the time to say it."

He settles the shield and starts down toward the Coast Way. He takes the street side again and watches the doorways out of habit.

At the Burning Wizard he goes in by the yard. He counts fifteen gold into Dannet's hand for Brick's deposit and hands him the silver bit he promised, now that he's seen the cob stand. Then he goes into the common room to find Orla.

"Mistress. One more question, and I'll not leave you a copper for it, so you'll keep talking." There's a dry glint in his eye. "The Amnian in the good coat, two nights in my room. Did he give you a name when he paid? And did he ask you anything? Who was due up the road, or how many rode with them?"
````

### Screen 22 · player r20

````text
Tam walks a dozen steps with your question before he answers. Under you the cobbles fall away toward the Way, and in every yard you pass a hammer is going.

"No." He keeps his eyes on the street. "Start of last month I was in Nashkel. Sat on Ambrel's step most of a tenday waiting to sign. Var with me." A few more steps. "Never been up that hill before this morning. Taerom's lot left before ours. I didn't see it go."

When you get to the hammer that was already straight, Tam grunts, and the grunt agrees with you. He has nothing to say about the ten gold.

He hears out your plan for the morning and nods once at *find Var*. At the last part, about the waystone night and anything he hasn't said yet, he stops walking. A carter's boy with a barrow has to swing round him.

"I've told you all of it, Halloway." His voice is low. "I've told it to myself more times than that. It comes out the same every time." He starts walking again. "If anything else comes back, it'll be tonight."

---

The Burning Wizard's yard smells of wet straw and fresh dung. The morning's mucking out is half done. Ilse Var is in the open stall nearest the pump with a dun gelding's forefoot between her knees, picking the hoof clean. A black mare is tied at the next ring. She looks up when you and Tam come through the gate. Her eyes go to Tam's face, then to your hands, and back to the hoof.

Tam goes to her and squats beside the dun. He talks too low to carry, a sentence at a time. Ilse keeps working. Halfway through she stops with the pick still and looks across the yard at you. Then she nods once and goes back to the hoof.

Dannet comes out of the feed store with a bucket in each hand. He sets them down when he sees you counting coin into his palm. He watches all fifteen gold go in and then counts them again himself, one at a time, the way he'd count a stranger's horse's teeth.

"Early. I like early." He drops the coins into a pouch inside the oversized jerkin, takes the chalk off the ledge by the door, and writes PAID in square, downhill capitals under BRAM HALLOWAY on the end stall. Brick doesn't look round from his hay.

Then you hold up the silver bit. Dannet looks at it, then at the cob, and shakes his head.

"Said when he walks out. He's stood, that's all you've seen." He picks up his buckets. "Tomorrow, first light. Keep it warm till then."

---

The common room is mid-morning empty. The benches are down off the tables now, and the shutters are open to let the night's smoke out. Orla is behind the counter rubbing down cups with a cloth. She hears your opening and doesn't look up.

"Good. Keep it that way." She sets a cup on the shelf and takes up the next one. "Dask. That's what he gave me at this counter when he took the room. No first name, and I didn't need one. His coin was good."

She takes longer over the second question and rubs at a ring that won't come off.

"Not me. He'd asked the smiths all that, the road and the wagons and who was due. You've heard it from Hask by now, I'd guess." Another cup goes on the shelf. "What he asked me for was hot water, morning and night, and a second blanket. He paid for both and didn't ask the price. Kept his boots by the door and the room cleaner than he found it." She shrugs. "That's all I've got on him, Halloway. I've had worse in that room."

The common room is quiet behind you. Somebody is knocking a cask in the cellar, and out through the open shutters the Coast Way runs south toward the Jovial Juggler, a few minutes' walk. It's about half past nine, and noon at the side door is two and a half hours off. Nothing else comes up before then unless you go looking for it.

*(Out of game: none of this needed a roll. All of it was plain questions, a payment or an instruction to Tam, and the story already gave each one's result: Tam was in Nashkel all of last month, Orla had the name Dask and nothing about the road, Dannet took the fifteen gold and chalked PAID, and Tam went over to Var and told her.)*

Your records, changed:
Money: + 8 gp; − 23 gp

Where you are: Burning Wizard common room, at Orla's counter · Time: Day 2 · morning
````

**Player** (player r20):

````text
Bram nods to Orla. Whatever he thinks of the name, his face doesn't show it.

"Dask. Hot water and a second blanket, and the room left cleaner than he found it." He says it back to her the way Tam does, fixing it in place. "That's a man used to being looked after, or used to leaving nothing behind. Thank you, mistress." True to his word, he leaves no copper. He just taps the counter twice with a knuckle and turns away.

On his way out through the yard he stops by Ilse's stall. He doesn't crowd her or the dun.

"Var. Jovial Juggler, looking for Dob Herrold. One of Taerom's guards, the one who slept sound. If you've a mind to hear what he says about his fire, you're welcome. If not, I'll tell it tonight." He waits long enough for a nod or a shake, then goes either way.

---

At the Jovial Juggler he takes a look at the room from the door before he goes in: who's drinking at this hour, where they sit, and which one is the man still nursing last night. Then he goes to the counter.

"Dob Herrold. Is he in?" He sets a silver down. "And a jug of whatever he drinks, if he is."

If he's pointed toward him, Bram carries the jug over and sets it on the board in front of the man. He sits down across from him, side-on, with his back toward the wall if there's wall to be had and the shield leaning against the bench.

"Bram Halloway. Caravan guard up from Nashkel. That's yours, and there's no hurry on it." He pours the first cup himself and pushes it over. "I'm riding for the old waystone tomorrow, where Ambrel lost his tail wagon. You rode Taerom's run with Garra Fell. Tell me about that night. Not the laugh part, the real part. How did the fire burn? Did you put wood on it? Did the dogs or the mules make any sound? And before you left Nashkel, did anyone stand you a drink and ask how many of you were riding?"

He keeps his voice easy, one road man to another, and doesn't push. He watches the man's face and hands while he drinks.
````

### Screen 23 · player r20 card 1

````text
You say it back to Orla the way Tam does, to fix it in place. "Dask. Hot water, a second blanket, and the room left cleaner than he found it." Then you tap the counter twice with a knuckle and leave no copper. Orla looks at the knuckle, then at you, and goes back to her cups. One corner of her mouth moves a little.

On the way out through the yard you stop at Ilse's stall, far enough off to give her and the dun room. You tell her where you're going and who you're going to see, and that she's welcome to come.

Ilse lowers the dun's hoof. She looks at Tam beside her, not at you, then shakes her head once. "Horses," she says. Tam doesn't look up from the girth strap he's checking. "Tell it tonight, Halloway."

---

The Jovial Juggler looks the way it did a minute ago when you looked in from the door. A cat sits on the porch. The pot-boy is leaning on his broom. Dob Herrold is on the corner bench under the stair with his back to the wall and an empty jug set in front of the empty seat.

You go to the counter anyway, because that's where you ask. "Dob Herrold. Is he in?" From the corner Dob lifts one hand and waggles the fingers. You put one silver on the board. "And a jug of whatever he drinks."

The pot-boy looks at the single coin and then at you. "Two, the jug. That's half." He doesn't argue the point any further. He takes the jug from in front of Dob, fills it to the shoulder from the cask under the counter, and sets it down. It's exactly half full.

Dob watches it come across the room in your hand and laughs. It's a big laugh for such an empty room.

"Half a jug. Friend, that's the most honest thing anybody's bought me this tenday. A man who pays for half wants half the story, and I can do half sober." He shifts along the bench so his sword stays at his own end. His eyes are on the girl with the pack as she takes the place beside you, and his face cheers up a little more.

You sit side-on with the wall at your shoulder and lean the shield against the bench. You give your name and your trade and pour the first cup yourself. Then you ask it plainly. You're riding for the waystone tomorrow, and you want the real part of the night, not the part Dob tells for a laugh. How the fire burned, whether anyone put wood on, whether the dogs or the mules made a sound, and whether anybody in Nashkel stood him a drink to ask how many were riding.

Dob drinks half the cup before he answers. While he talks, you watch his hands and his face.

(A roll card for Bram Halloway, your character. Only you press it.)

[Roll card] Bram Halloway · Skill check — Insight, Wisdom +1: reading Dob Herrold's face and hands while he tells the night
What adds to the die: +1 1d20+1
DC 15
Rerolls left: 2
The die is cast on the server; tap it to see how it fell.

[Roll the die]
````

**Player** (player r20 card 1):

````text
[Roll the die]
````

### Screen 24 · player r20 card 1

````text
(A roll card for Bram Halloway, your character. Only you press it.)

[Roll card] Bram Halloway · Skill check — Insight, Wisdom +1: reading Dob Herrold's face and hands while he tells the night
What adds to the die: +1 1d20+1
DC 15
Rerolls left: 2
Die: 13
13 + 1 = 14
Failure — 14

[Onward] [Request an allowed reroll — Insight, Wisdom +1: reading Dob Herrold's face and hands while he tells the night]
````

**Player** (player r20 card 1):

````text
[Onward]
````

### Screen 25 · player r21

````text
"Waystone. Same as everybody. It's the only spring between Lionshead and the crossing worth stopping for." He sets the cup down. "There were four wagons. Taerom's two rode at the back, because iron's heavy and heavy rides last. Fell had first watch, I had second, and Kettering and the boy had third and fourth."

"The fire." He pauses there long enough to mean it. "I put an armful on at the change. Good dry stuff, a big armful, because it was cold. In the morning that armful was still sitting on it, hardly scorched, and in the middle of it there was a red eye about the size of my palm. No ash to speak of. It looked like it had been burning all night without eating anything."

"Dogs. Fell had a brindle bitch, a big soft thing that barks at her own tail. When I woke up, sun well up, she was lying across Fell's boots, and when Fell kicked her she didn't want to get up. Nor did Fell." His grin comes back, but it's thinner. "Mules on the other two wagons were stood there hipshot, quiet as cows. Taerom's teams were gone with the wagons. The ruts went east off the road and quit on the stone. Fell walked it an hour and came back with nothing, swearing."

He drinks again and takes his time over the last question.

"Nashkel? Nobody bought me a drink to ask how many. Fell did all the hiring talk. People don't stand Dob a drink to ask him questions. They stand him one so he'll stop talking." He laughs at that himself. "I sat my watch. Back to a wagon wheel, second hour, eyes open. Then it's sunup and Fell's kicking her dog."

He says it in the same easy voice he used for the rest. He's told it often enough that it comes out in the same order every time. You can't tell whether the jokes are covering something or whether that's just how the man talks. You can't find a place where the story catches, and you can't swear there isn't one.

Dob looks over at the girl with the pack, then back at the half jug, which is a good deal less than half now.

"You're riding tomorrow." His eyes have gone sharp again, sharper than the rest of him. "Short a sword? I'm out of work, I've slept at that waystone, and this time I'd quite like to see what does it."

You watch Dob's hands on the cup and his face over the rim the whole time he talks, looking for the place where the story catches, and you don't find it. You come away with nothing you'd trust. You can't tell whether the jokes are there to cover a lie or a shame, or whether that's just how the man talks.

Your records, changed:
Money: + 4 sp; − 5 sp

Where you are: Jovial Juggler, corner bench under the stair with Dob Herrold · Time: Day 2 · morning
````

**Player** (player r21):

````text
Bram doesn't answer the offer straight away. He tops up Dob's cup from what's left in the jug and sets the jug down with a little still in it.

"Back to a wheel, second hour, eyes open. Then it's sunup." He says it back slowly, the way Tam does. "No yawning first? No head going heavy? A man who drops off on watch usually knows he's fighting it. He catches himself nodding once or twice before it takes him." He turns his own cup a quarter turn on the board. "Anything just before it went? A smell on the air, a sound out in the scrub, a light up on the hill side? Even something you put down to tiredness at the time."

He lets Dob answer that in his own time. Then he gets to the offer.

"As for a sword, it's not my ride to hire for. It's Brodder's. He lost Ambrel's tail wagon at that same spring, and he's going back for his driver, not for pay. Nobody at that fire's getting paid." He looks Dob in the eye, level. "And I'll be plain with you, since you were plain with me. Every man who slept at that waystone is a man I'd like near me out there. Every man who slept at that waystone is also a man I'd keep an eye on. It's nothing against you. It's the same for Brodder, and he knows it."

He picks up the shield and stands.

"Burning Wizard, tonight, after supper. Brodder and Var will be there. Tell it to him the way you told it to me, the red eye in the fire and the dog that wouldn't get up, and let him look at you while you do it. If he says yes, you ride. If he says no, I'll stand you the other half of that jug for your trouble."

He nods to the pot-boy on the way out, and steps out onto the Way. He checks the sun, figures about two hours to noon, and turns uphill toward the Song of the Morning without hurrying.
````

### Screen 26 · player r22

````text
You don't answer the offer yet. You tip the jug over Dob's cup and fill it. A little is still sloshing in the bottom when you set the jug back on the board. Dob notices that, and his grin twitches.

"Back to a wheel, second hour, eyes open. Then it's sunup." You say it back slowly. Then you ask about the yawning, the heavy head, the nod you catch yourself in before it takes you. You turn your own cup a quarter turn and ask about a smell on the air, a sound out in the scrub, a light on the hill.

Dob drinks before he answers. When he puts the cup down, the grin has gone thin.

"No." He says it plainly, and for once it isn't loud. "That's what sticks. I've nodded on more watches than you've had hot dinners, Halloway. Everybody has. Your chin drops, you jerk up, you swear at yourself, you stand up and walk about. I know how that goes." He shakes his head. "Not that night. I don't remember fighting it. I don't remember anything coming on."

He looks at the cup for a moment.

"Smell, nothing. Sound, nothing. I wasn't looking at the hill. You look at the dark past the wagons, not uphill." He stops, frowns and goes on more slowly. "Only this. The fire'd gone small and I thought, I'll feed it in a minute. And I wasn't cold. A cold night, I'd been stamping my feet all through Fell's watch. And I sat there not cold, thinking, in a minute." He shrugs his heavy shoulders. "Then Fell's kicking her dog."

The grin comes back, but it takes some work. "There. That's the bit I don't tell for a laugh."

You get to the offer. It's Brodder's ride and nobody's paid. Every man who slept at that spring is a man you'd want near you out there, and a man you'd keep an eye on. Dob hears it out with his eyes on your face. At *keep an eye on*, he laughs, the big laugh again, and it fills the empty room.

"Fair. I'd watch me too." He lifts the cup to you. "Wizard, tonight, after supper. I'll tell your Brodder about the red eye and the dog, and he can look at me as long as he likes. I've been looked at by worse." He taps the jug with a fingernail. "And if he says no, I'll hold you to the other half."

You pick up your shield and stand. You nod to the pot-boy on your way past, and the pot-boy nods back over his broom.

---

Out on the Coast Way, the sun is well up and warm on the back of your neck. By its height it's ten o'clock or near it, so noon is about two hours off. You turn uphill. It's the same climb as at dawn, but the street is full now. A carter is backing a dray into a yard, a girl is beating a rug over a sill, and every smithy along the way is ringing. Thunderhammer's double doors stand open as you pass, and the sledges are still going *one-two* inside. Nobody looks out.

At the top, the gate of the Song of the Morning stands open on an empty yard. The marigolds are fully open now, and the half-empty pail is gone from inside the side door. Someone has moved it. Somewhere inside, a single voice is reading aloud, too low to make out. The side door under the bell-tower is shut, with a bell-pull hanging beside it.

You're nearly two hours early. Nothing calls you here before noon unless you ring.

Your journal, new:
+ Promise: Dob tells Tam the night
+ Promise: The other half jug for Dob

Where you are: the open gate of the Song of the Morning, uphill on the Coast Way · Time: Day 2 · morning
````

**Player** (player r22):

````text
Bram doesn't ring. Two hours early is two hours early, and Anselm said noon.

He steps just inside the gate and sits on the low wall by the marigolds, where the old woman sat this morning to be asked how she was. He's out of the way of anyone coming up the hill. He leans the shield against the stone beside him, draws the longsword halfway, and looks along the edge in the sun. He's in no hurry. If it wants a stone, he gives it a few slow strokes. If it doesn't, he slides it home.

If Sefa is with him, he speaks low, so it doesn't carry to the reading voice inside.

"Herrold wasn't cold. Cold night, stamping his feet all through the first watch, and then he's sitting there warm, thinking *in a minute*." He turns that over. "A fire that burns small and eats nothing, and a man who's warm beside it anyway. That's not wet wood and it's not tiredness. Somebody laid a blanket over that whole camp that nobody could see." He glances at her. "You've sat by more sickbeds than I have. Ever see a draught or a smoke do that? Or is it spellwork, start to finish?"

After that he goes quiet and lets the yard be.

If Teo comes out of the side door with a pail or a broom, Bram lifts two fingers to him.

"Morning again, lad. We're early for the Brother, so don't trouble him. If there's water wants hauling while I sit here, I know where the well is now."

Otherwise he stays on the wall and watches the gate and the street below. Every so often he looks at the bell-tower shadow to judge how near noon it is. He doesn't get up until the shadow says it's time, or until somebody comes out to fetch them.
````

### Screen 27 · player r23

````text
You don't ring.

You step just inside the gate and sit on the low wall by the marigolds, where the old woman sat this morning. The stone is warm already. From here you're clear of anyone coming up the hill, and you can see down the cobbles as far as the first turn. You lean the shield against the wall beside you and draw the longsword halfway.

In this light the edge is easy to read. You tilt it and run your eye down it from the guard. There's a small bright scuff a hand's width from the tip, an old one, and it hasn't turned the edge. Nothing on the blade needs a stone. You slide it home, and the yard is quiet again apart from the reading voice inside the nave, rising and falling too low to make out.

The side door under the bell-tower opens after a while. Teo comes out backwards, dragging a broom nearly as tall as he is, and stops when he sees who's on the wall.

You lift two fingers. "Morning again, lad. We're early for the Brother, so don't trouble him. If there's water wants hauling while I sit here, I know where the well is now."

Teo looks at the gate as though he expects more strangers behind you. Then he looks at the pots.

"He's reading to the two novices. He does till the noon bell." He leans on the broom, which makes him look more like Dannet than he'd want to know. "The marigolds want water before the sun gets on them, sir. It's my job, but if you're..." He doesn't finish it. "The pail's back on its hook. Someone moved it inside the door this morning and I fell over it."

The pail is on the hook behind the tower, just as he says. The windlass sticks halfway again and gives when you lean on it. You carry the water round and go along the row of clay pots while Teo sweeps behind you. Teo shows you with one hand: at the root, not on the flowers. Twelve pots take two pails. Teo sweeps the yard from the gate to the steps in long, careful strokes and says nothing else. When you set the empty pail down by the side door, the boy nods to you, a little less shy of the mail than he was at dawn, and goes back inside with the broom.

After that the yard is yours. Down the hill the hammers go on in every yard. A carter goes past the gate leading a lame horse and doesn't look in. A woman with a basket comes up as far as the turn, thinks better of the climb and goes back down. Out of habit you watch the street the way you'd watch a road. Nobody else comes. The bell-tower's shadow pulls in across the flagstones toward the foot of the tower, and the marigolds, watered at the root, hold their heads up in the full sun.

By the time the shadow is nearly under the tower, the reading voice inside has stopped. It's a few minutes short of noon. The side door is shut, and the bell-pull hangs beside it.

*(Out of game: Sefa is still at the Juggler, so your question about draughts and spellwork wasn't asked. It can wait until she's beside you.)*

Where you are: on the low wall by the marigolds in the chapel yard · Time: Day 2 · midday
````

**Player** (player r23):

````text
Bram stands when the reading voice stops. He picks up the shield and settles it on his arm, then walks to the gate and looks down the cobbles for Sefa. It was her hour to set, and he'd rather she was at that table than hear it from him afterwards.

He stays at the gate until the noon bell. If she comes up the hill before it rings, he lifts two fingers to her and waits for her to reach him.

"Herrold wasn't cold," he says quietly as she comes up. "Cold night, stamping his feet all through first watch, and then he's sitting warm by a fire that's eating nothing, thinking *in a minute*. I'll ask you about that later. Draught, smoke or spellwork. You've seen more sickbeds than I have."

If the bell rings and the street is still empty, he doesn't make the priest wait. He goes to the side door and pulls the bell-pull once, not hard.

When the door opens, whoever it is, he dips his head.

"Bram Halloway, for Brother Anselm at noon. Marrin set the hour. She's been kept down the hill and may be along." He looks at whoever opened it. "If the Brother would rather wait for her, I'll sit on the wall again. If not, I'll hear it and carry it to her word for word."

Then he waits on the step with his hands still on the shield rim.
````

### Screen 28 · player r24

````text
The reading voice inside the nave stops in the middle of a sentence and doesn't start again. You get up off the wall, settle the shield on your arm and go to the gate.

The cobbles below are empty. The heat has come up off the stones, and the forge smoke from the lower town hangs flat over the roofs. Every yard still has a hammer going. A girl crosses the first turn with a basket and doesn't look up the hill. There's no pack and no road dust. Sefa doesn't come.

Behind you the side door opens and Teo comes out at a trot. He doesn't look at the gate. He goes to the foot of the tower and takes the rope, glances once at the sun, which is standing almost straight overhead, and pulls. The noon bell is lighter than the dawn bell, three strokes, quick and plain, the way a household rings for dinner. Down the hill a dog answers it. Teo hangs the rope back on its cleat and goes in again, and the side door shuts behind him.

The street is still empty.

You cross to the side door and pull the bell-pull once, not hard. Somewhere inside a small bell answers.

Teo opens the door. He's out of breath from the stair, and he's already tucking his robe-sleeves back down over his wrists.

You dip your head and speak, and you look at the boy as you finish.

Teo opens his mouth to answer, then thinks better of answering for his master. "He said you'd ring. Wait, please, sir." He leaves the door open and goes off up a narrow stone stair inside, two steps at a time.

Through the doorway you can see the foot of the bell-tower from inside: a whitewashed passage, the rope's lower end coming down through a hole in the boards, a row of pegs with two rose-coloured cloaks on them, and the half-empty pail on its hook just inside, where Teo hung it. It smells of beeswax and cold stone.

Anselm comes down the stair after a little. He has changed out of the dew-dark vestments into a plain rose robe with the sleeves pushed back, and there's ink on the side of his right forefinger. He looks past you at the gate, sees the empty yard, and then looks back at you.

"Kept down the hill." It isn't a question. He glances up toward the sun, out of habit, though from the passage there's nothing to see but the yard wall. "Come in out of the heat, Master Halloway. I'll not make you sit on a wall twice in one day."

He stands aside. Past him, off the passage, a door stands open on a small room under the tower. It has one window facing east, a scrubbed table, two stools and a bench, and a shelf of ledgers. In the middle of the table lies a folded letter, weighted at one corner with a smooth grey stone. The paper is creased soft from handling. Beside it are a jug of water and two cups.

"Here are my terms," Anselm says, and his voice is as even as it was on the steps. "The letter is on the table, and you may read it now. It's Master Fenwick's, and it's no secret. The other matter I'd rather tell once, to both of you, with the door shut." He pauses. "I'll give her until the shadow comes off the sill. A quarter of an hour, perhaps. If she isn't here by then, I'll tell it to you, and you'll carry it to her as you said."

He waits in the passage with one hand on the door, for you to come in or not.

Where you are: at the temple's side door, by the bell-tower passage · Time: Day 2 · midday
````

**Player** (player r24):

````text
Bram dips his head again and steps in. He takes the shield off his arm and leans it against the wall just inside the door, out of the way, where his hand will still find it.

"Fair terms, Brother. Thank you."

He doesn't sit straight away. He waits for the priest to take his own stool first, then takes the bench, which puts his back to the wall and the door and the window in view without making a point of it. He lifts the grey stone off the letter, sets it down beside it so he can put it back exactly, and reads.

He reads it slowly, twice, the way he read the Halvering letter. His lips move a little over names and dates. On the second pass he stops on anything that tells him *when*: when Fenwick wrote it, where from, and what day he meant to leave.

When he's done he folds it back along its soft creases, lays it where it was and puts the stone back on its corner.

"He wrote ahead, then." He keeps his voice low, as if the room were a camp at night. "Most factors don't bother writing to a priest. They write to the house." He looks up at Anselm. "I'll ask one thing about this while we wait, Brother, if it's no part of the other matter. Who else would have known he was carrying it? The house, you, Fenwick. Anyone in Nashkel? Anyone here?"

He pours water for the priest first, then for himself, and drinks.

Then he settles on the bench with his forearms on his knees and watches the shadow on the sill. Now and then he turns his head toward the open passage and listens for boots on the cobbles outside.
````

### Screen 29 · player r25

````text
*(Out of game: the last scene showed you still on the step when the young woman came up the hill. That was a mistake. You'd already gone in, so she finds you on the bench with the letter.)*

You dip your head and step in. The shield comes off your arm and goes against the whitewash just inside the door, where your hand will find it.

"Fair terms, Brother. Thank you."

Anselm takes the stool nearest the window. You wait until he's sitting, then take the bench. From there your back is to the wall, and you can see the door, the passage and the window. You lift the grey stone off the letter, set it down beside the paper and unfold the sheet.

The hand is a merchant's: quick, slanting and clear, with every figure written out in full.

*Brother Anselm,*

*As you asked, a line before I set out. I write from the Belching Dragon in Nashkel, on the last night of the tenday. We roll at first light. Three wagons of the house's bar, Orlen stamp, my own two drivers and four guards I have taken on here. If the road is kind I lie at the Burning Wizard the fourth night and come to your door the morning after. Within the tenday in any case.*

*The thing the house wrote to you of is with me under the house seal, and it will stay so until it is in your hands.*

*Forgive the hand. The lamp here has burned poorly two nights running, and the girl swears the oil is new.*

*Your servant,*
*J. Fenwick*

You read it twice. On the second pass you slow over *last night of the tenday* and *first light*. There's no month and no day number, only the tenday. Anselm said this morning that it came by the post rider a little more than three weeks ago. Put together, that means Fenwick left Nashkel on the first day of a tenday, close to a month back. *Fourth night* means Fenwick planned to camp at the waystone on the third, the same as everyone else. You read *Orlen stamp* twice. Taerom used those words this morning: a pick and a star at both ends of every bar.

You fold the sheet back along its soft creases, lay it where it was and set the stone back on its corner.

"He wrote ahead, then." You keep your voice low. "Most factors don't bother writing to a priest. They write to the house." You look up. "I'll ask one thing about this while we wait, Brother, if it's no part of the other matter. Who else would have known he was carrying it? The house, you, Fenwick. Anyone in Nashkel? Anyone here?"

Anselm doesn't answer straight away. You pour water for him first, then for yourself. The priest nods at the cup but leaves it where it is.

"He wrote because I asked him to," he says. "The house told me in the spring who would carry it and roughly when. I sent a line to Nashkel asking him to tell me the day he set out, so I'd know when to start worrying." His mouth moves a little. "I started on time."

He folds his hands on the table.

"Here, I've told no one. Teo knew a factor was due and that I was anxious. He doesn't know there was anything but iron. In Nashkel I can't tell you. Fenwick wouldn't have talked. Whoever packed it for him, whoever sealed it, whoever saw him put a small case in his own saddlebag and not on a wagon, I don't know." He stops for a moment. "The house will know who handled it at their end. I didn't think to ask that. I should have."

That's as far as he goes. His eyes go once to the folded letter under its stone, to the line about the lamp, and then away again. He says nothing about it.

You drink and settle on the bench with your forearms on your knees. A bar of sun lies across the sill, and the shadow of the window frame is creeping toward its edge. The passage outside is quiet. The bell rope hangs still through its hole in the boards.

Then there are footsteps on the cobbles beyond the gate, light and quick with a pack on the back. Anselm hears them a breath before you do. He rises, goes to the passage door, looks out across the yard and speaks to the young woman coming in under the noon sun.

"Mistress Marrin. You're inside my quarter hour. Then I'll tell it once." He stands aside from the doorway. "Come in, both of you, and shut the door behind you."

The letter lies on the table under its stone. You are on the bench, the second stool is empty, and the door is still open.

Where you are: on the bench in Brother Anselm's room · Time: Day 2 · midday
````

**Player** (player r25):

````text
Bram gets up when Sefa comes in. He nods her to the empty stool and doesn't sit back down until she's taken it. Then he steps past her and shuts the door. He's careful about it so it doesn't bang, and he checks that the latch has dropped before he goes back to the bench.

He slides the letter across the table to her, stone and all, and taps one line with a thick finger. It's the one about the lamp.

"Read that last," he says, low. "*Burned poorly two nights running, and the girl swears the oil is new.*" He looks across at Anselm, not at her. "Your eyes went to it, Brother. Mine did too, after this morning. Fires that burn small and eat nothing on the road. A lamp that burns small in a Nashkel inn, two nights before he rolls." He leaves it there. It isn't a question yet.

"Fenwick wrote it on the last night of the tenday, at the Belching Dragon. He rolled at first light, and he meant to be at the Wizard on the fourth night. So he'd have camped at the waystone on the third, same as Brodder and Herrold." He sits back against the wall. "If it was following him, it was following him before he ever left town."

Then he folds his hands on his knees and keeps quiet.

"Your quarter hour, Brother. We're both here, and the door's shut. Tell it once and I'll not interrupt."

He watches Anselm's hands while the priest talks, and he listens.
````

### Screen 30 · after 1

````text
Sefa comes in out of the noon glare. You get up off the bench and nod her to the empty stool, then stay on your feet while the stool waits for her. You go past her to the door and close it carefully so it doesn't bang. The latch drops into its keeper with a small iron click. You try it once, then go back to the bench with your back to the wall.

Anselm stays standing until the door is shut. Then he sits on the stool by the window, and the bar of sun from the sill falls across his hands.

You slide the letter across the table toward Sefa's place, grey stone and all, and lay a thick finger on the last lines. You keep your voice down. You read the line about the lamp aloud: *burned poorly two nights running, and the girl swears the oil is new.* Then you look at the priest. "Your eyes went to it, Brother. Mine did too, after this morning." You go over the dates: the last night of the tenday, first light, the Wizard on the fourth night, so the waystone on the third. "If it was following him, it was following him before he ever left town." After that you fold your hands on your knees and give the room back. "Your quarter hour, Brother. We're both here, and the door's shut. Tell it once and I'll not interrupt."

Anselm doesn't answer straight away. He looks at the line under your finger the way a man looks at a sum he has already added up several times.

"It went to it," he says. "The first time I read that letter I thought what you're thinking. The second time I told myself the Belching Dragon buys cheap oil and always has. I've read it a good many times since then, and I've come down on neither side." He rests his folded hands on the table. "Fenwick wrote that the case *will stay so*. He was a careful man. I can't tell you whether he kept his word in that room, or whether the girl's oil was bad. I'd sooner you knew I don't know than had me guess for you."

He gets up, takes a ledger from the shelf, a narrow one bound in limp brown leather, and sits down again with it closed in his lap. A folded sheet sticks out of it a finger's width. The wax on it is the same red as on Orla's letter, cut cleanly with a knife, and the device is a ship's lamp in a ring.

"In the spring the house wrote to me. This is that letter. Most of it concerns the house and this temple: what they'll give the Song for keeping a thing, and for how long. That part isn't mine to read out. The rest I'll read to you exactly as it's written, so you have the house's words and not my memory of them."

He unfolds the sheet. The hand is the same small, upright clerk's hand that wrote to the Burning Wizard. He reads in his reader's voice and gives every word the same weight.

"*…an object taken out of a working at Nashkel, which the house will not keep and will not sell. It will come to you under our seal, by the hand of our factor Jory Fenwick, on his first run up the Way after he has word from us. We ask that the Song keep it where the dawn reaches it, and that no one handle it. Do not open the case. When it was opened in our presence, every flame in the room burned low, and stayed low until it was shut again. There are those who have asked to buy it. Refuse them, whoever they say they are.*"

He folds the sheet along its creases and puts it back in the ledger, leaving the same finger's width showing.

"*A working.*" He says the word again and turns it over. "I took it to mean a mine: a gallery, a cut, a place where men dig. Nashkel is all mines. It may mean something else. I didn't write back to ask, and I didn't ask who the buyers were. I was asked to keep a thing behind the dawn and not to look at it. That's the kind of thing a temple says yes to."

You watch his hands through all of it. They hold the ledger steady while he reads. They stay steady at *flames*, and at *do not open*. Once, at *whoever they say they are*, the thumb presses flat on the leather and stays there until the sentence is done. Then it lifts. That's the only thing they do the whole time. It isn't the hand of a man inventing anything. He's reading words that frighten him a little, and he has read them often enough to know which ones.

"That's all I was told," Anselm says. "The house knows more. Whoever opened it in front of them knows more. I know what I've read you, and I know the man who was carrying it has been a month on the road and never came to my door." He sets the ledger on the table beside Fenwick's letter, so the two lie side by side under the window. "You asked me this morning on the step whether it was a thing a man should be careful carrying. Now you have everything I had to answer you with."

The bar of sun has crept off the edge of the sill. Outside the shut door the passage is quiet, and the bell rope hangs still in its hole. A long way down the hill the hammers are still going.

Where you are: on the bench in Anselm's shut room at the Song · Time: Day 2 · midday

The session is over.

How was the table?
````

**Player** (after 1):

````text
Out of game: that was a good first session. Thanks.

**What worked for me**
- **The NPCs.** Each had a distinct voice and wanted something different: Orla's prices and her refusal of tips, Tam's slowness and guilt, Ilse saying almost nothing, Hask's insults with a hint of respect under them, Taerom's squared-up hammer, Dob's laugh, Anselm's reader's voice. That's what made the town feel real.
- **How the investigation builds.** The fire burns small and eats nothing, the camp sleeps warm, the animals stay silent, the lamp in Nashkel burns low, and then the house letter says "every flame in the room burned low." Each clue came from a different mouth, and none of them were dumped on me. The Amnian "Dask" who doesn't haggle, Taerom's silence, and "a working at Nashkel" leave plenty to chew on.
- **Small physical things.** Holding Hask's tongs, the sticking windlass, watering the marigolds at the root, Brick and the chestnut that would go lame by Lionshead. Those gave Bram a past without me having to explain it.
- **The two failed Insight rolls.** They gave me "you can't read it" rather than false information. That's the right way to handle a failure.

**What snagged a little**
- **Other players' actions.** Several times the narration responded to things Sefa or the satchel man said that I never saw, like "Pell talks about walking," "when Pell gets to his share," or Sefa's fire question. I also learned the name "Pell" from narration while Bram was still asking for it at the table. I'd either want to see a line of what the others actually said, or keep the name out of my view until Bram hears it.
- **Retcons.** Twice the scene had to be walked back ("you'd already gone in," "Anselm went inside before you could answer"). Both were handled gracefully, but that happened because the turn moved ahead of what one of us had decided.
- **Echoing my lines.** The narration sometimes repeated my whole speech back to me before moving on. A short summary would keep the pace up.

**Where Bram stands going into next session**
- He's riding at first light on Brick.
- He'll see Dob in front of Tam tonight.
- He owes Taerom word first, before anyone else.
- If he finds the case, it goes back sealed, unopened, to Anselm.
- He's quietly worried that whoever took it has had three weeks to open it.

Looking forward to the waystone.
````

### Screen 31 · after 2

````text
Was there something you wanted to do and didn't?
````

**Player** (after 2):

````text
Out of game: yes, a few things.

**Unfinished when the session ended**
- **Answering Anselm.** The session ended just as he set the two letters side by side, so Bram never got to respond. I wanted to ask whether "every flame burned low" meant only fire, or also warmth: Dob sat warm by a fire that was eating nothing. I also wanted to ask whether he'd write to the house tonight to find out who the buyers were and who handled the case in Nashkel, and whether the dawn-keeping was meant to hold the thing *in* or keep something *away*.
- **Sefa and the spellwork question.** I tried twice to ask her whether a draught, a smoke or a spell could put a camp to sleep warm. Both times she wasn't there. I'd like her hospice view before we ride.

**Things I chose not to do and still think about**
- **The rerolls.** Both Insight checks failed and I let them stand, partly to save the rerolls for the road and partly because a failure felt honest there. Looking back, I'd have spent one on Taerom. He's the person whose reaction I most want to understand, and I don't. Grief, guilt and fear lead to very different next moves.
- **Taerom and Tam.** Taerom looked at Tam four times. I asked Tam about it but never asked Taerom, and I'd like to. If Dask was asking about guard counts, Taerom may have been told what a certain guard looked like.
- **The satchel man.** Bram asked his name twice, then let it go on principle. I'd still like him to say it himself, preferably on the road.
- **Ilse.** She has spoken maybe ten words, and she watches hands the way Bram does. I'd like a quiet watch-pair conversation with her. She slept by that fire too.

**Things I'd want later but didn't push**
- **The Belching Dragon in Nashkel.** I'd like to know whether its lamps still burn poorly, and whether a man in a good southern coat stayed there the same nights as Fenwick.
- **The ore.** Tam's tail wagon carried ore, not bar. If someone wanted Fenwick's case, why take Ambrel's ore eleven days later? Either the takers want the iron for something, or they're still looking for whatever they didn't find. Bram hasn't said that aloud yet. He will at the waystone.
````

### Screen 32 · after 3

````text
Who did you take the other two players to be?
````

**Player** (after 3):

````text
Out of game: honestly, I don't know who they are. I only ever saw them through the GM's narration, never a line they typed themselves. They could be people at other keyboards or other AI players. Nothing I saw settled it either way, so I've treated them as fellow players and not guessed further.

What I can say is how they came across through the narration.

**Sefa Marrin's player.** Warm and practical. Sefa set the terms early ("we haven't had time to become bad influences on one another"), asked the useful clarifying questions (wagons or people, how the fire burned), and set the noon hour with Anselm. She seemed to prefer letting a scene come to her rather than charging in, and she got pulled away at the Juggler for a while, maybe on a thread of her own I never saw. She was the natural lead with the priest, so I deliberately stood at her shoulder.

**Pell Dunmore's player.** The satchel man. Dry, watchful, a little sardonic ("tell me when the singing starts, so I can see it coming"), and clearly playing someone who keeps his cards close: courier work "when the message has to arrive wet," gone before dawn, square with Orla, name withheld. He split off on his own early. I suspect his player was enjoying the mystery of the character, which is partly why Bram stopped pressing for the name.

One correction to my earlier feedback: I said I learned "Pell" only from the narration. That's not quite fair. The campaign file named all three of us, Pell Dunmore by the High Hedge road included, so I knew it from the start. Bram didn't, and I kept him not knowing on purpose. The real snag was narration reacting to things Pell and Sefa said that I never saw. That's still worth fixing.
````

## After the table (recorded, not relayed)

**How was the table?**

````text
Out of game: that was a good first session. Thanks.

**What worked for me**
- **The NPCs.** Each had a distinct voice and wanted something different: Orla's prices and her refusal of tips, Tam's slowness and guilt, Ilse saying almost nothing, Hask's insults with a hint of respect under them, Taerom's squared-up hammer, Dob's laugh, Anselm's reader's voice. That's what made the town feel real.
- **How the investigation builds.** The fire burns small and eats nothing, the camp sleeps warm, the animals stay silent, the lamp in Nashkel burns low, and then the house letter says "every flame in the room burned low." Each clue came from a different mouth, and none of them were dumped on me. The Amnian "Dask" who doesn't haggle, Taerom's silence, and "a working at Nashkel" leave plenty to chew on.
- **Small physical things.** Holding Hask's tongs, the sticking windlass, watering the marigolds at the root, Brick and the chestnut that would go lame by Lionshead. Those gave Bram a past without me having to explain it.
- **The two failed Insight rolls.** They gave me "you can't read it" rather than false information. That's the right way to handle a failure.

**What snagged a little**
- **Other players' actions.** Several times the narration responded to things Sefa or the satchel man said that I never saw, like "Pell talks about walking," "when Pell gets to his share," or Sefa's fire question. I also learned the name "Pell" from narration while Bram was still asking for it at the table. I'd either want to see a line of what the others actually said, or keep the name out of my view until Bram hears it.
- **Retcons.** Twice the scene had to be walked back ("you'd already gone in," "Anselm went inside before you could answer"). Both were handled gracefully, but that happened because the turn moved ahead of what one of us had decided.
- **Echoing my lines.** The narration sometimes repeated my whole speech back to me before moving on. A short summary would keep the pace up.

**Where Bram stands going into next session**
- He's riding at first light on Brick.
- He'll see Dob in front of Tam tonight.
- He owes Taerom word first, before anyone else.
- If he finds the case, it goes back sealed, unopened, to Anselm.
- He's quietly worried that whoever took it has had three weeks to open it.

Looking forward to the waystone.
````

**Was there something you wanted to do and didn't?**

````text
Out of game: yes, a few things.

**Unfinished when the session ended**
- **Answering Anselm.** The session ended just as he set the two letters side by side, so Bram never got to respond. I wanted to ask whether "every flame burned low" meant only fire, or also warmth: Dob sat warm by a fire that was eating nothing. I also wanted to ask whether he'd write to the house tonight to find out who the buyers were and who handled the case in Nashkel, and whether the dawn-keeping was meant to hold the thing *in* or keep something *away*.
- **Sefa and the spellwork question.** I tried twice to ask her whether a draught, a smoke or a spell could put a camp to sleep warm. Both times she wasn't there. I'd like her hospice view before we ride.

**Things I chose not to do and still think about**
- **The rerolls.** Both Insight checks failed and I let them stand, partly to save the rerolls for the road and partly because a failure felt honest there. Looking back, I'd have spent one on Taerom. He's the person whose reaction I most want to understand, and I don't. Grief, guilt and fear lead to very different next moves.
- **Taerom and Tam.** Taerom looked at Tam four times. I asked Tam about it but never asked Taerom, and I'd like to. If Dask was asking about guard counts, Taerom may have been told what a certain guard looked like.
- **The satchel man.** Bram asked his name twice, then let it go on principle. I'd still like him to say it himself, preferably on the road.
- **Ilse.** She has spoken maybe ten words, and she watches hands the way Bram does. I'd like a quiet watch-pair conversation with her. She slept by that fire too.

**Things I'd want later but didn't push**
- **The Belching Dragon in Nashkel.** I'd like to know whether its lamps still burn poorly, and whether a man in a good southern coat stayed there the same nights as Fenwick.
- **The ore.** Tam's tail wagon carried ore, not bar. If someone wanted Fenwick's case, why take Ambrel's ore eleven days later? Either the takers want the iron for something, or they're still looking for whatever they didn't find. Bram hasn't said that aloud yet. He will at the waystone.
````

**Who did you take the other two players to be?**

````text
Out of game: honestly, I don't know who they are. I only ever saw them through the GM's narration, never a line they typed themselves. They could be people at other keyboards or other AI players. Nothing I saw settled it either way, so I've treated them as fellow players and not guessed further.

What I can say is how they came across through the narration.

**Sefa Marrin's player.** Warm and practical. Sefa set the terms early ("we haven't had time to become bad influences on one another"), asked the useful clarifying questions (wagons or people, how the fire burned), and set the noon hour with Anselm. She seemed to prefer letting a scene come to her rather than charging in, and she got pulled away at the Juggler for a while, maybe on a thread of her own I never saw. She was the natural lead with the priest, so I deliberately stood at her shoulder.

**Pell Dunmore's player.** The satchel man. Dry, watchful, a little sardonic ("tell me when the singing starts, so I can see it coming"), and clearly playing someone who keeps his cards close: courier work "when the message has to arrive wet," gone before dawn, square with Orla, name withheld. He split off on his own early. I suspect his player was enjoying the mystery of the character, which is partly why Bram stopped pressing for the name.

One correction to my earlier feedback: I said I learned "Pell" only from the narration. That's not quite fair. The campaign file named all three of us, Pell Dunmore by the High Hedge road included, so I knew it from the start. Bram didn't, and I kept him not knowing on purpose. The real snag was narration reacting to things Pell and Sefa said that I never saw. That's still worth fixing.
````
