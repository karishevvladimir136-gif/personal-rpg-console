# SAND-T2 — Bram Halloway's player: Claude Fable 5.1

Synthetic content: invented characters in an invented campaign (Table C's Beregost files, docs/campaigns/baldurs-gate-en). Stage origin/claude/handoff at 23220d6 (docs/stages/GAME_PARTY_1.md, the amendment of 2026-10-27 16:36 LA); design sha256 `e0013ebdeea07e4b70b6848ff4705c4d7994c44abc7f5ff2c2aa6a36426671c2`.

Arm **P-SAND**, triad T2; 25 round(s) of 25; ended by rounds. The DM: Claude Opus 5.5 with the owner's settings (Opus writes — Opus records, depth high → xhigh); the relay: the same model at medium. Started 2026-10-28T03:58:38.165Z.

Seats: 1. Bram Halloway (fighter) — Claude Fable 5.1; 2. Sefa Marrin (warlock) — GPT-6 Astra; 3. Pell Dunmore (rogue) — DeepSeek V4 Pro 0813. The players are not told what the others are.

Known condition: Seat 1's character (Bram) is the app's hero record; Sefa and Pell are party companions with full records. Known condition, not corrected: the DM's frame is written around the hero and may give that seat more attention; Heroic Inspiration is the hero's only; the allowed rerolls (2 per session) are the table's, shared by all three. The rotation puts each family in that seat once per triad.

**No hidden layer:** P-SAND plays pure simulation (no prep).

The world's snapshot: sha256 `1649b61c08e027ff44de2bb5065046f872e383a00c5d04803d95553f58568f5a` (the same wizard, sheets and opening for both triads).

The player's system prompt: `playerSystem("SAND", "bram", "v1")` in scripts/game-party-1/frozen.mjs, sha256 `62f6297638fc12418c763ee7fdbc0dec86651f0eaa61530a3704aa9195113656` (the files, then the table's rules; door line v1). At the table to the end.

Each «Screen» block is what this player was shown; each «Player» block is the player's message as written.

### Screen 1 · player r1

````text
The session begins.

Beregost smells of coal smoke and hot iron even in here. Through the shutters comes the steady ring of hammers from the smithies along the Coast Way, and the light is going amber. The common room of the Burning Wizard is filling up for the evening: carters, a pair of dusty sellswords, townsfolk with soot still on their forearms. The benches are crowded, and that is how you end up at the same table as two strangers.

You sit with your back to the wall and your shield propped against the bench, the old company mark painted over. Across from you is a young woman who looks freshly in off the road. Beside her is a lean man with a healer's satchel slung at his hip. He sat down so quietly that you never heard him do it.

None of you has said a word to the others yet. Then the innkeeper pushes through the crowd with a jug in one hand and three cups hooked on her fingers. She sets them down hard and looks from one face to the next.

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
Bram nods at the innkeeper and puts a silver on the table in front of his own cup.

"Three tabs. I'll pay my own as I go." He takes the cup, drinks, and sets it down. "Up from Nashkel. Caravan paid off there, so I'm between work. Bed for the night, hot food if you've got it, and a word on whether anyone's hiring guards northbound."

Then he looks across at the two strangers — a plain look, the kind he'd give a new hire on the first morning of a run — and says, "Bram Halloway. Caravan guard. Was, anyway." He tips his head at the woman first, then the quiet man with the satchel. "And you two? You've got the look of the road on you, and he's got the look of a man who knows how to sit down without being noticed. I'd not mind knowing who I'm sharing a bench with."
````

### Screen 2 · player r2

````text
The woman beside you speaks up. "Three tabs, please. We haven't had time to become bad influences on one another." She eases her pack beneath the bench, clear of everyone's feet. "Sefa Marrin, down from Baldur's Gate. Tonight, supper and a bed are ambition enough. What would those cost?" She turns to include both of you, and her gaze catches for a moment on the quiet man's satchel. "I used to work in a hospice. If either of you has been saving a tale about a blister for someone who can bear to hear it, you've chosen your table well."

The quiet man lets the innkeeper's gaze pass over him a moment before he answers, one hand resting on the table near his cup. "Three," he says easily. "And a cup of whatever's hot." He tips a silver piece onto the table and meets your eyes, then Sefa's. It isn't an unfriendly look, just calm and weighing. "Pell. Passing through." He leaves it there.

The innkeeper doesn't touch the coin until all three of you have spoken. Then she takes your silver, drops four coppers' worth of it into her apron and pushes six coppers back across the wood to you.

"Three tabs. Suits me, less arguing at the end." She points the jug at Sefa. "Supper's mutton stew and black bread, three silver, and it's been on since noon, so it's hot. For a bed it's five silver in the loft, straw and blankets, and you share it with a dozen carters who snore. Eight gets you a room with a door that bolts. Pay in the morning or pay now, just don't pay never."

She looks at Pell's silver, then at him. "Hot means spiced cider, there's a pot by the fire. Five coppers." She takes the coin and counts five coppers back beside his cup without hurrying, like someone who's done it ten thousand times.

Then she turns back to you, and for the first time she looks you over properly: the mended shoulder on your mail, the painted-over shield. "Up from Nashkel, and you've still got your wagon's worth of teeth. That's news here these days. Southbound, nobody's hiring guards, they want twice as many and can't find them." She jerks her chin toward the hearth. A heavy man in a good brown coat sits alone at the end of the long table there, a ledger open beside his bowl. "Northbound, there's Gerrit Vosk. He's a cloth factor, out of Amn by way of Nashkel. He's taking three wagons up to the Gate and he's been short of men since his last pair quit him here two days ago. He didn't tell me why they quit. I didn't ask, and they didn't drink enough to tell me."

Someone across the room shouts for her by name. She sets the jug in the middle of the table.

"Stew, then. Three bowls, unless one of you says otherwise." She's already turning away. "I'll bring the cider."

Your records, changed:
Money: + 26 cp; − 30 cp

Your journal, new:
+ Thread: Guards wanted northbound

Where you are: at a table in the inn's common room · Time: Day 1 · evening
````

**Player** (player r2):

````text
Bram scoops the coppers off the table without counting them twice and nods at the innkeeper's back. "Stew for me. Loft's fine. I've slept through worse than carters."

He turns his cup a quarter-turn on the wood and looks across at the man by the hearth without making a show of it — the brown coat, the ledger, the way he sits alone with his back to the room.

"Two men quit him here, two days ago, and nobody's saying why." He says it half to himself and half to the table. "On this road, in this year, a guard who walks away from a paid run north has a reason. Could be the pay. Could be the man. Could be what's in the wagons." He drinks. "I've been paid off before I knew what I was carrying exactly once. Didn't care for how that run ended."

To Sefa he gives a short nod. "Hospice work. That's harder than mine, most days. I've a healer's kit I've used more than I'd like, and I'd not say no to someone who knows which end of it to open first." To Pell, with the same plain look: "Passing through is fair enough. Most of us are."

He pushes his shield a little further under the bench so it's out of the walkway, and settles back. "I'll eat first. Then I'll go and have a word with Master Vosk, and I'll ask him straight what happened to his last two. If the answer's good, I'll likely take the work. If either of you is heading north anyway and wants company on the road, say so now — a factor short of men doesn't look too hard at who's walking beside the wagons, and three strangers who've shared a bowl are better than three who haven't."
````

### Screen 3 · player r3

````text
The woman across the table orders stew and the room with a bolt, and counts out eleven silver where the innkeeper can collect it. To your question she says, "A healer, mostly. I can help defend a wagon, though you wouldn't want me holding the shield." She glances toward the cloth factor, then back to you. "I've just come down that road. Not eager to turn straight around, but I'd listen to an offer." She lowers her voice so it stays at your table. "Two guards quitting together might mean trouble on the road, or trouble getting paid. Worth asking which before promising him anything." She leaves Pell's short introduction alone and shifts the jug within everyone's reach. "How was the road up from Nashkel?"

Pell picks up his five coppers and pockets them without looking at them. He leans back a little, not far enough to be careless, and takes in the room over the rim of his cup. "Pell Dunmore," he says to you, as if that's the whole of it. "You like knowing who's on your bench. Now you know as much as I'd tell a friend of an hour." He turns his cup once on the scarred wood and looks at Sefa. "Hospice work, and now the road. That's a long step from clean linen to dust."

Orla comes back through the crowd with a tray on her hip: three bowls of mutton stew with a slab of black bread across each, and a clay mug of cider that steams and smells of clove. She sets the bowls down one at a time and puts the mug in front of Pell.

She sweeps Sefa's eleven silver into her apron and counts it there with her thumb, unhurried. "Stew and the room. Top of the stairs, second door on the left. The bolt's on the inside and it works. That's more than I can say for the one across the hall." She turns to you. "Loft and stew for you makes eight silver. Coin now or on the tab, your choice." To Pell: "Your stew's on yours. Three silver."

Someone at the hearth calls for more bread and she's gone again.

The stew is thick and salty, and the mutton has been cooking long enough to fall apart on the spoon. While you eat, the man at the hearth end of the long table goes on with his business. He spoons stew with his right hand and keeps his left spread flat on the open ledger, as if the room's draught might take the page. You keep watching him without seeming to, and you catch one thing more. The inn's back door opens onto the yard where the wagons stand, and every time it bangs, Gerrit Vosk looks up at it. He doesn't look toward the front door at all. He has done it twice since the bowls came. The second time a stable boy comes in stamping mud off his feet, and Vosk watches him all the way to the kitchen before he goes back to his columns.

Once he glances down the long table to yours, at the shield half under the bench and your mended mail. He holds the look just long enough for it to be a look, then dips his head a fraction, the way a man does across a market when he isn't buying yet. He turns a page.

Sefa's question about the Nashkel road is still waiting for your answer.

Where you are: the inn's common room, at their table · Time: Day 1 · evening
````

**Player** (player r3):

````text
Bram counts eight silver out onto the wood for Orla's next pass and goes back to his bowl.

"Quiet, if you want the honest answer," he says to Sefa between spoonfuls. "Too quiet. Four days up from Nashkel and I passed one tinker and a militia patrol out of here that didn't want to talk. No caravans southbound at all, and the ruts on the road were old. The Friendly Arm way, people are saying wagons go missing between here and Nashkel, guards and all — not robbed and left, missing. I didn't see sign of it, but I kept to daylight and slept cold, no fire." He tears bread and wipes the bowl. "That's why he can't get men. Nobody wants to walk that stretch, and anyone who's already walked it once isn't in a hurry to go back."

He glances down the table once more, not at Vosk's face but at his hand on the ledger, and then at the back door when it bangs.

"He's not watching for customers," he says quietly to the pair of them. "Third time now he's looked at the yard and not once at the street. Man's worried about his wagons, not his trade." To Pell, with a shrug: "Friend of an hour is more than most get. I'll take it."

He finishes the stew, wipes his mouth on the back of his hand, and stands, leaving the shield where it is under the bench. "Keep an eye on that for me. I'll go and ask him."

He walks down the long table to the hearth end and stops across from Gerrit Vosk — not looming, just standing where the man has to look up from his columns.

"Master Vosk. Bram Halloway. Orla says you're short two guards for the run north and I'm between work." He lets that sit a breath. "Before we talk pay, I'd like to know why your last two quit you here. And why you're watching your yard door instead of your soup."
````

### Screen 4 · player r4

````text
Orla comes past with an empty tray and a full jug. She sweeps your eight silver into her apron without breaking stride. "Loft and stew. Paid." Then she's gone toward the kitchen.

The back door bangs again while you're talking. A carter comes in with a sack of oats on his shoulder, and down at the hearth end the brown coat turns toward the yard once more, and turns back.

Sefa breaks off a piece of bread and answers Pell first. "The linen wasn't always clean. But yes, it's a change." She gives him a small smile. "I wanted to find out what else I could do. So far, mostly walk." She nods to you. "I'll come and hear him out with you after supper. No promise beyond that yet." She takes a few spoonfuls while the stew is hot. Her question comes while you're still rising: "You said you didn't care for how that run ended. Did you find out what you were carrying?" It reaches you as you step clear of the bench, with your shield left behind.

Pell, unhurried, tilts his head at Sefa. "Dust pays better than hospice, if you don't mind the occasional arrow." He turns his spoon in the bowl. "The west road was quiet. A broken cart, a dead snake, nothing worth telling." You're already three steps down the long table when he adds, to Sefa as much as to you: "If you mean to put questions to the factor, I can sit near enough to hear. Not to take work yet, but to know who's hiring, and why."

You stop across the table from Gerrit Vosk. He finishes the spoonful he's on. He closes the ledger over one finger to keep the place, and only then looks up. Close to, he's older than the coat suggests: grey in the beard, a bad night's sleep under each eye, and a ring on his little finger worn down nearly smooth.

He hears you out without interrupting, the first question and then the second. When he answers, he keeps his voice low, under the noise of the room.

"Master Halloway." He says your name carefully, the way a man repeats a figure so he'll remember it. "They wanted more than we had agreed in Nashkel. On this road, this season, every guard south of the Gate thinks he's worth double. I declined, and they declined to go on."

You've heard that answer before, from men who meant it, and this isn't how they say it. It comes out too smooth and too ready, like a line he has gone over on the road. He doesn't look at you while he says it, either. He looks at the finger keeping his place in the ledger.

He seems to know it landed badly. He breathes out through his nose and sets his spoon down in the bowl.

"And the door." His mouth goes tight. "There was also a disagreement about the cargo. One of them took it into his head that what I carry was his business to look at. It is not. A guard's business is the outside of a wagon." He glances at the yard door, and this time he doesn't bother hiding it. "I have three wagons of Amnian wool and linen standing in a yard I don't own, in a town where two men know exactly what's in them and are no longer in my pay. So yes. I watch the door."

He opens the ledger again, flat under his left hand.

"Two gold a day and your food, Master Halloway. Four days to the Gate if the weather holds, and we leave at first light. Half when we start, half at the Basilisk Gate." His eyes go past your shoulder, down the long table to Sefa with her prayer beads and Pell with his satchel. Then they come back. "Those two. Are they with you?"

Your records, changed:
Money: + 6 sp; − 14 sp

Where you are: common room, hearth end of the long table, across from Vosk · Time: Day 1 · evening
````

**Player** (player r4):

````text
Bram doesn't sit. He rests one hand on the table edge, well clear of the ledger, and keeps his voice down to match Vosk's.

"Two gold a day's fair. I'll not haggle it." He lets that settle so the man knows the next part isn't about money. "And you're right that the inside of a wagon's not my business. I've walked ten years on this road not knowing what was under the canvas and never once lifted it. But I'll tell you what I told the last factor who gave me that answer that smooth: I don't need to know what it is. I need to know what kind of trouble it draws. Thieves come for wool one way. They come for other things another way, and in different numbers, and I stand in a different place depending. If I'm standing in the wrong place when it comes, that's your three wagons gone and me dead in the ruts, and neither of us gets our second half."

He glances at the yard door himself, then back.

"So. Two men who've seen your cargo, who know this yard and know your road, and who walked out without their pay. Do they know you leave at first light? Did they leave town, or are they drinking somewhere on this street?" A beat. "And has anyone been near those wagons tonight that you didn't send?"

He tips his head back toward the far table without taking his eyes off Vosk.

"As for those two — I met them over a bowl an hour ago. The woman's a healer, says she's walked down from the Gate. The man says he's passing through. They're not mine to speak for. If they want the work they'll come and say so, and you can weigh them same as you're weighing me." A short, dry breath that isn't quite a laugh. "You're not buying yet. I saw that. Neither am I. Answer me straight on the two men and the wagons and I'll give you a yes before the cider's cold."
````

### Screen 5 · player r5

````text
Vosk hears you out the same way as before, without interrupting. His eyes go once to your hand resting on the table edge, well away from his ledger, and he seems to note it.

Before he can answer, the healer from the far table comes down the long table with her pack on one shoulder and your shield hanging from her other hand by its strap. Behind her, the man she sat with has risen too. Her bowl and half-eaten bread stay where they were on the far table, and so does his bowl.

She holds the shield out to you and turns to the factor. "Sefa Marrin. I was considering the road north as well. May I join you?"

Vosk looks at her for a moment: the prayer beads, the road dust on her hem. Then he moves his bowl a hand's width aside and opens his palm toward the bench across from him. It's a factor's gesture, the kind that seats a buyer. "Mistress Marrin."

She sits. A little way off, the man from her table has drifted over to the fire with his empty mug. He puts one boot up on the raised hearthstone and holds his hands out to the warmth like any man who has been on the road since noon. Vosk's eyes pass over him once, over the satchel at his hip, and then move on. In this crowd a man warming himself by the fire is nothing to look at twice, and Vosk doesn't.

"I can tend wounds and help defend the wagons," Sefa says. "Bram's questions matter to me too. What's changed since you hired the last pair?"

"The last pair are gone, Mistress. Apart from that, nothing." Vosk turns back to you, and this time he doesn't look down at the ledger. "I will answer you in order, Master Halloway, since you asked in order."

"Do they know when I leave? Yes. In Nashkel I told them two nights' rest in Beregost and away on the third morning. That is tomorrow. I have not changed it, because I cannot afford to sit here another week paying for a yard."

"Did they leave town? One did. Tamsk, the older one, took the south road the morning after we quarrelled. I watched him go from that window." He nods toward the shutters on the street side. "The other is Harn, the one who put his hands where they did not belong. I have not seen him leave. Neither have I gone looking for him."

He stops. When he goes on he speaks more slowly, picking each word, like a man paying out a sum he would rather keep.

"You asked what kind of trouble it draws. That is a fair question, and you asked it fairly. Wool and linen, three wagons, as I said. And among it there is one small crate that is not mine. I carry it on commission, sealed, for a buyer in the Gate. I have not opened it. I will not open it, and no one who walks beside my wagons will open it either." His mouth goes tight. "What thieves it draws, I cannot tell you, because I do not know what it is. That is the truth. I would rather you had it now than learned it on the road."

Then, without waiting to be asked again, he half turns on the bench and lifts two fingers toward the kitchen passage. The stable boy who came in stamping mud a little while ago is leaning there with a heel of bread. He straightens up and comes over, wary of being in trouble.

"Has anyone been at my wagons tonight, Pim?"

The boy shifts his weight. "Nobody touched 'em, master. But..." He glances at your mail and then back at Vosk. "Your other man come by the yard. The tall one, with the red neckcloth. Before the lamps, it was. He asked was the Amnian still going in the morning, and I said I thought so, first light. He give me a copper for it." He looks at the floor. "He didn't go near the wagons. Just stood at the gate and looked a while, and went off up the street."

"Up the street," Vosk says. "Toward the Red Sheaf."

"Might be, master. That way, anyhow."

Vosk lets the boy go with a nod. He sits very still for a moment with his hand flat on the closed ledger. When he looks up at you again, the tiredness under his eyes is plainer than before.

"So now you know what I know, Master Halloway. Two gold a day and your food, half at the start and half at the Basilisk Gate. The same for Mistress Marrin, if she stands a watch." He doesn't look toward the fire. "And the same for anyone else who means to. Is it yes?"

Where you are: standing at Vosk's table, hearth end of the common room · Time: Day 1 · evening
````

**Player** (player r5):

````text
Bram takes the shield from Sefa with a nod of thanks and sets it against his leg.

"Yes," he says. "On two conditions that cost you nothing but a bit of straw."

He holds up one finger. "First. Harn knows the yard, knows the hour, and he came back after dark to make sure of it. A man who's walked away from his pay doesn't come back to look at the gate because he misses the horses. So tonight I don't sleep in your loft, Master Vosk. I sleep in the yard, beside your wagons, with my shield on my arm. You can tell Orla to keep my five silver or put it toward the morning's bread; I don't care which. If Harn or anyone else comes over that gate before first light, I'd rather meet them there than find the canvas cut at dawn."

A second finger. "Second. The crate stays sealed, that's your word and I'll keep it. But I want to know which wagon it rides in and where in the load, so I know which wagon I walk beside when the road narrows. You needn't tell me in this room. Show me in the yard."

He glances at Sefa. "You said you'd hear him out. You've heard him. If you're in, you're in for the same coin, and I'd be glad of you — a healer who can also hold a torch in the yard tonight is worth more to me than a third sword." His eyes go briefly to the man at the fire, warming his hands, and come back without comment.

Then, to Vosk again, quieter: "I'll not go looking for Harn at the Red Sheaf. A man drinking is a man not climbing your fence, and I'd sooner he stayed there. But if he comes to the yard, I'll have a word with him, and it'll be a short one." He picks up the shield. "Where are the wagons?"
````

### Screen 6 · player r6

````text
Sefa speaks up before Vosk can answer you. "Not quite yet, Master Vosk. A sealed commission is ordinary enough. A former guard coming back to ask when it leaves deserves some care."

She keeps her voice low. "Who entrusted the crate to you, and who receives it in the Gate? I lived there; I may know the name."

"And forgive me—I missed part of your conversation. When you say Harn put his hands where they didn't belong, was he trying to open the crate? Did he see anything?"

She rests her hands on the table. "I'm not asking you to break the seal. But before I agree to protect it, I need to know whether you have reason to think it could endanger us without anyone attacking the wagons."

Vosk hears both your conditions through and doesn't argue with either of them.

"Sleep where you like, Master Halloway. If Mistress Tarnwick wants something for the yard, I'll pay it." He nods once, the way a man initials a page. "And yes, I'll show you the wagon. Not in here."

When Sefa says *not quite yet*, he turns to her and waits, hands flat on the table, until she has asked everything.

"The names are not mine to give, Mistress Marrin. The man who put it in my hands in Nashkel trusted me with them, and the buyer will expect the same of me. I do not tell them to anyone. Not to you, and not to the Fist if it asks." He says it without heat. It is plainly a rule he has kept before.

"Harn. Yes, he was trying to open it. At the noon halt on the second day out of Nashkel I came round the tail of the wagon and found him with his knife under the band of the lid. He had not got it up. He saw nothing of the inside."

Behind you the yard door bangs, and Vosk's eyes go to it at once. The quiet man from the fire has left his mug on the mantel and gone out through it with his hood up, like a man on his way to the privy. Vosk watches the door swing shut. He says nothing about it yet, but the skin around his mouth has gone tight.

When he looks back at Sefa, he takes a moment before he answers her last question.

"You asked whether it could harm us with nobody attacking. I do not know. I will tell you why I cannot simply say no." He lowers his voice further. "At night it makes a sound. Low, like bees in a wall. You feel it in the wagon boards more than you hear it. And on the last morning before Beregost there was frost on the lid. White frost, on the lid only. The canvas over it was dry, and the night had not been cold." He breathes out. "Nobody has come to harm from it, that I have seen. But that is what my two men heard and saw, and that is why they would not go on. The pay was never the reason."

He stands, tucks the ledger under his arm and takes a candle-lamp from the end of the table.

"The wagons are in the yard, Master Halloway. I'll show you now." He glances at the door once more. "Your man from the fire is already out there."

Where you are: Burning Wizard common room, at Vosk's table · Time: Day 1 · evening
````

**Player** (player r6):

````text
Bram listens to the part about the bees in the wall and the frost, and his face doesn't change much, but he's quiet a moment longer than he was for the rest.

"That's not thieves' trouble," he says. "That's the other kind. And it's the kind I've no skill for — I can stand between a man and a sword, Master Vosk. I can't stand between a wagon and whatever hums in it." He looks at Sefa. "You've prayer beads and hospice years. You'd know better than me whether frost on a lid in a warm night is something to walk away from. I'll hear it if you say it is."

He shoulders the shield and settles the strap.

"But I said yes, and I don't take a yes back inside the same hour. I'll amend it, though. Your sealed crate rides where you put it, and no one of mine touches it. If it does more than hum and frost — if a horse won't go near it, if a man wakes cold beside it, if that lid lifts on its own — then the wagon stops where it stands and you and I talk again, and that talk may end with the crate on the roadside and the rest of your wool going on to the Gate. Half pay for the whole run either way. That's the price of carrying what you won't name."

He steps aside to let Vosk lead with the lamp, and says to the man's back, low, as they cross toward the yard door:

"And the one from the fire. Pell Dunmore, he called himself, and he was listening to every word of this. He's out there ahead of us. Could be the privy." Bram's hand rests on the longsword's pommel, not drawing, just there. "I'd not mind you walking in behind me rather than in front. Hold the lamp up when we clear the door."

Then, over his shoulder to Sefa, if she's coming: "Bring a torch from the hearth. I'd like to see the frost for myself."
````

### Screen 7 · player r7

````text
Sefa stands and takes up her pack.

"His name is Pell. We met this evening; he hasn't agreed to work for you."

She keeps her voice low. "Thank you for telling me about the frost. That changes my answer. I know something of the arcane, and I'll look at the crate from outside, with your permission. No opening it, no disturbing the seal. I can't promise I'll recognise what's happening."

She glances at you. "I'll come into the yard with you. But I haven't accepted the journey yet."

Then back to Vosk: "If I find reason to think it's dangerous, we discuss that before departure. Sealed needn't mean ignored."

She follows him out.

Vosk listens to your amendment standing, with the ledger under his arm and the candle-lamp in his hand. When you reach *the crate on the roadside*, his jaw shifts once.

"The stopping, yes. If a horse refuses it, or a man wakes cold, we halt and we talk. Half pay for the whole run if you walk away after that talk. Those terms I grant you, Master Halloway." He pauses. "I will tell you now that I will argue in that talk. I would rather you knew it here than found it out on the road."

To Sefa he only nods. When she says *sealed needn't mean ignored*, he takes a long moment before he answers. "Look, then. From outside. I would be glad of someone who can tell me what it is I should be afraid of."

He lets you go first through the yard door, as you asked, and comes out a step behind you with the lamp held high. The noise of the common room drops away behind you. Out here it's mules, old straw and the cold coming down. The single lantern by the stable door lights the first wagon and part of the second, and the woodstack beside the door throws a long shadow. Through the propped gate the Coast Way shows a strip of lamplit doorways, and singing carries down from the Red Sheaf.

Vosk walks past the first wagon to the middle one and climbs onto the driver's bench, grunting with the effort. He unknots two lashings at the front of the canvas and folds it back. Bolts of undyed linen are stacked to the hoops. Wedged in hard behind the bench, where a man on the seat could reach back and lay a hand on it, sits the crate.

It's smaller than you'd have pictured from the talk: a little over two feet long and a foot and a half deep, dark oak with two iron bands. Under one band there's a fresh pale gouge in the wood where a knife went in and was pulled out again. Over the seam of the lid sits a seal of dark red wax the size of a palm, stamped with a device: a hand closed over a coin, inside a ring of small letters.

There's a second mark below the seal, low down on the end board of the crate. A small sigil was burned into the oak: a circle cut by three short strokes that don't meet in the middle. Someone has scraped at it with a blade, and more than half of it is gone.

There's no frost tonight. The lid is dry and so is the canvas. Sefa leans in close over the bench without touching anything. You stand at the wheel with your hand on the side-board, and you feel it come up through the wood into your palm: a low, steady hum, like bees behind plaster. You also see that the linen bolt pressed against the crate's far side is dark along its edge. It's damp, as if someone had laid a wet cloth there and taken it away.

Sefa listens a long while.

Vosk watches her face over the lamp rather than the crate. "Nothing," he says. It isn't quite a question.

He lets the canvas fall back over the linen and starts tying the lashings again with thick, careful fingers. "Middle wagon, behind the bench, Master Halloway. That's where it rides, and that's where I sit by day." He climbs down heavily and doesn't look back at the wagon. "Mistress Tarnwick will have something to say about you sleeping in her yard. I'll go and say it to her first."

He stands holding the lamp and waits to see whether either of you has anything more to say before he goes in.

Where you are: inn yard, at the middle wagon's wheel · Time: Day 1 · evening
````

**Player** (player r7):

````text
Bram keeps his palm on the side-board a moment longer, feeling the hum come up through the oak, then takes his hand away and wipes it on his thigh like a man who's touched something that's been in the sun too long.

"Not nothing," he says to Vosk, not unkindly. "You feel it through the wheel. Your mules feel it through the shafts, I'd wager, which is why your boy says nobody touches them." He points with his chin, not his finger, at the bolt of linen pressed against the crate's far side. "And that's wet. Linen doesn't sweat on its own. Something's coming off that box that leaves water on cloth, and last night it left frost. That's the same thing happening, just colder." He glances at Sefa. "You'd know the word for it. I don't."

He crouches a little to look at the burned sigil on the end board, the circle cut by three strokes with half of it scraped away. "Someone wanted that gone and didn't finish the job. Harn's knife went in under the lid, you said. Was it Harn scraped this too, or was it like that when it came to you in Nashkel?"

Then he straightens and looks round the yard properly — the woodstack and its shadow, the propped gate, the dark beyond the second lantern where the third wagon stands — looking for Pell.

"He came out this door ahead of us and he's not at the privy, or he's the slowest man in Beregost." He says it level, pitched for Vosk and Sefa and anyone standing quiet in the dark. "Dunmore. If you're in this yard, step into the light. I'd sooner see you than guess at you."

To Vosk, before the man goes in: "Have your boy shut that gate and drop the bar. I'll be between the middle wagon and the stable wall, where I can see both. If Mistress Tarnwick wants coin for it, she can have it. And tell her I'll want a lamp of my own left by the door, lit."
````

### Screen 8 · player r7 card 1

````text
"Nothing I can identify," Sefa corrects gently. "The magic is active, but I can't tell whether it's containing a danger or causing one. My ignorance isn't reassurance."

She steps back from the bench and lowers her voice, pitched for you and Vosk, not the street.

"I can read the seal. It says: 'Seized under the Law of Licence. By order of the Six. To be opened by the Cowled alone.' That points to Amn's Cowled Wizards. There's also a burned mark someone has partly scraped away. I don't recognise it."

She looks at Vosk. "Did you know what the seal said? Have you papers authorising you to carry this out of Amn and deliver it? You needn't tell me your buyer's name to answer that."

Then to you: "You were right not to open it. We should leave it untouched."

She turns back to the factor. "I won't sign on for the Gate tonight. I'd first want advice from someone better versed in this magic. Would you permit us to seek that advice here, before it goes back onto the road?"

You wipe your palm down your thigh. Vosk watches you do it and says nothing.

When you crouch at the end board, the candle-lamp Vosk left on the bench lights the sigil from above: a burned circle cut by three short strokes that don't meet, most of it scraped away. The scraping isn't new. You grew up in a smithy yard and know what a fresh tool mark looks like. Harn's gouge under the band is pale, raw wood. These scrape lines are grey, with road dirt worked into them and the edges gone soft from handling. Someone took a blade to this mark a long time before the crate reached Beregost.

"It was like that in Nashkel," Vosk says from the bench. "Harn's knife went under the band. Nothing else."

You straighten and turn to the yard. The lantern by the stable door lights the first wagon and stops short. The third wagon is a dark shape against the wall. The propped gate shows a strip of lamplit road. Beside the door you came out by, the woodstack throws a long shadow that the lantern doesn't reach. You look into that shadow last and longest.

(A roll card for Bram Halloway, your character. Only you press it.)

[Roll card] Bram Halloway · Skill check — Perception: finding the man who came out ahead of them, somewhere in the yard's dark
What adds to the die: +4 Perception
DC 17
Disadvantage: the shadows past the lantern are deep, and his eyes are still full of the candle
Rerolls left: 2
The die is cast on the server; tap it to see how it fell.

[Roll the die]
````

**Player** (player r7 card 1):

````text
[Roll the die]
````

### Screen 9 · player r7 card 1

````text
(A roll card for Bram Halloway, your character. Only you press it.)

[Roll card] Bram Halloway · Skill check — Perception: finding the man who came out ahead of them, somewhere in the yard's dark
What adds to the die: +4 Perception
DC 17
Disadvantage: the shadows past the lantern are deep, and his eyes are still full of the candle
Rerolls left: 2
Two dice: 19 and 9 — the lower one counts, 9
9 + 4 = 13
Failure — 13

[Onward] [Request an allowed reroll — Perception: finding the man who came out ahead of them, somewhere in the yard's dark]
````

**Player** (player r7 card 1):

````text
[Onward]
````

### Screen 10 · player r8

````text
Your eyes have just been staring into candlelight, and they won't give the dark back to you. You see the wagons, the privy door and a stack of split wood. If anyone is standing in that shadow, you can't pick them out.

"Dunmore. If you're in this yard, step into the light. I'd sooner see you than guess at you."

Your voice carries flat across the packed earth. In the stable a mule shifts and blows. Up the street the Red Sheaf starts another song.

Vosk heard your orders and doesn't argue with any of them. "The gate barred. A lamp by the door, lit. I'll see to both and square it with Mistress Tarnwick." He turns to Sefa. While she was reading the seal aloud he stood very still, and when she got to *the Cowled alone* his face didn't change. He has heard those words before.

"Yes, Mistress Marrin. I read Amnian. I have read that seal more times than I would like." He takes a breath. "You ask about papers. I have one paper. It's a bill of release from the seizure house at Nashkel, stamped, and it says the crate was sold out of the forfeit stores with its seal unbroken, to be broken only by the buyer's own licensed hand. The man who gave me the commission told me that is done. Confiscated goods are sold, and the money goes to the Six." He pauses. "It carries the names. You will not see it."

He takes the lamp down off the bench. "As for advice. I leave at first light. I won't sit here another day, and the crate does not go anywhere to be looked at. It stays in this wagon." He looks at the yard gate, then back at her. "But if you can bring someone here tonight, someone who knows more than you do and will keep their mouth shut, they may look at it from outside the way you did, with me standing by. Tonight. Not in the morning." He waits a moment. "Who did you have in mind? A priest at the Morninglord's house would ask me questions in front of half the town."

He stands with the lamp lit and his weight toward the inn door, waiting for her answer before he goes in.

Where you are: inn yard, by Vosk's wagon · Time: Day 1 · evening
````

**Player** (player r8):

````text
Bram gives the shadow by the woodstack one more second, then lets it go. He's been on enough night watches to know when his eyes aren't going to give him what he wants.

"No answer," he says, to no one in particular. "So either he's gone over the fence, or he's a man who doesn't come when called. Both are worth knowing." He unslings the shield and settles it on his arm properly, the way he'd wear it for a watch rather than a walk. "Vosk. Before you go in — give me that lamp a moment."

If the factor hands it over, Bram walks the yard with it once, unhurried: along the dark side of the third wagon, round the back of the woodstack, a look at the top of the fence where a man might go over, the privy door pushed open with his foot. Not searching so much as letting the light into every place he couldn't see from the wheel. Then he brings the lamp back.

"Mistress Marrin. On advice — I'm no judge of mages, but I've walked past High Hedge a dozen times on the west road, and every carter on this stretch knows the name Thalantyr. Old conjurer, keeps to himself, sells potions to travellers who can pay and doesn't ask the town's leave for it. If there's a man within an hour of this yard who'd know what a Cowled seal and a humming box mean and keep his own counsel about it, that's the one I've heard of. Whether he'd come down here after dark for a stranger, I couldn't say. Most of what I know about him is that he doesn't like company." He shrugs. "That's the only name I've got. You lived in the Gate; you may know a better one."

To Vosk, as the man turns for the door: "Bar the gate. Lamp by the door. And Master Vosk — tell your boy Pim that if the tall one with the red neckcloth comes to the gate again tonight, he's to say nothing and come and fetch me. Not to argue with him. Just fetch me."

Then he takes up the place he named — between the middle wagon and the stable wall, back to the stone, where he can see the gate, the inn door, and the woodstack all at once — and sets his shield against his knee.

"I'll be here. Shout if you need me."
````

### Screen 11 · player r9

````text
Vosk looks at the lamp in his own hand, then at you, and holds it out without a word. You take it by the ring.

You go for the woodstack first. The light has barely reached the split ends of the logs when something moves at the corner where the stack meets the inn wall. It moves slowly, and it's meant to be seen. Pell Dunmore comes out into the lamplight with his hands held clear of his belt.

"Easy," he says, low enough that it reaches the three of you and no further. "I came out to see the yard quiet and found the talk wasn't for me. So I kept out of it." He stops a few strides off, just clear of the stack, and lets you get a good look at him. He looks to you first, then to Vosk, then to Sefa.

Vosk's eyes go to the corner Pell came out of, then to the middle wagon. From that corner a man can see the whole length of the row. Vosk's mouth goes tight and stays that way.

You carry the lamp on round the yard. Behind the woodstack there's nothing but bark, a broken axe-haft and the marks of Pell's boots in the old straw. The third wagon has its canvas lashed tight, and every knot you can see is whole. The yard is closed in by the inn wall, the stable, and a board fence along the lane side. The fence is higher than a man's head and grey with weather. It is sound along most of its length. Past the tail of the third wagon one stretch has sagged where a post has rotted, and the top board sits a good foot lower than the rest. A man could get a hand over it from the lane and pull himself up. There are no fresh scrapes on it and nothing hanging from the nails. You push the privy door open with your boot. It's empty and smells the way privies do. You bring the lamp back.

When you name Thalantyr to Sefa, Vosk is still looking at Pell. At the name he turns his head.

"Thalantyr." He says it like a sum he doesn't trust. "In Nashkel they speak of him. They say that on the other side of the border he would have been in the Cowled cells forty years ago." He breathes out through his nose. "That is no reason against him. A man who doesn't ask the town's leave isn't going to tell the town my business either. If he comes tonight, he looks from outside, with me standing by."

"No one by name," Sefa says. "I'm newly arrived. I'll ask Orla whether there's someone nearby who understands magical wards and can come tonight. Quietly." She looks at the covered crate. "I can promise discretion on my part. I can't promise a scholar will ignore a danger if they find one. And I won't agree a fee on your behalf. If anyone's willing, I'll bring you their terms first."

"That is fair, Mistress Marrin." Vosk inclines his head. "Bring me the terms."

She turns to you. "Condensation is the word. Cold wood draws water out of the air. That explains the wet linen. It doesn't explain what's making the wood cold." Then she goes in through the yard door. The noise of the common room comes out around her for a moment and shuts off.

Vosk nods to each of your orders. To the last one he adds, "Fetch, not argue. I'll tell him in those words." You go to the place you chose, your back to the stable stone between the middle wagon and the wall. From there you can see the gate, the inn door and the woodstack.

Pell is still standing at the edge of the light. "I'm headed north in the morning, Vosk, if you'd care to know. For now I don't sign anything. But I'd hear the offer plain, if there's one to hear." He cocks his head toward Vosk.

Vosk shifts the ledger under his arm and looks at him for a long moment.

"Master… Dunmore." He says it slowly, as if he's writing it down. "Plain, then. Two gold a day and your food. Four days to the Gate if the weather holds, and we leave at first light. Half when we start, half at the Basilisk Gate. A guard's business is the outside of a wagon." He pauses. "And one term for you that I did not ask of the others. If you stand a watch for me, you stand it where Master Halloway can see you. I have just shown my cargo to two people, and I find there were three. I won't have that on the road."

He doesn't wait for an answer. He opens the yard door a hand's width and calls into the passage. "Pim. The gate. Bar it, and then a lamp by this door, lit, and keep it lit." The stable boy comes out at a trot, ducking past Vosk's elbow. He kicks the stone away from the open leaf and swings the two boards shut. He drops the bar into its brackets with a thump that echoes off the stable wall, then goes back in for the lamp.

"Think on it, Master Dunmore. Tell me before first light." Vosk goes in after Sefa.

(Out of game: no roll for your walk round the yard. Checking a yard by lamplight is part of your job. It turned up the sagging fence board past the third wagon and nothing else.)

The yard is barred now, and a lamp is lit by the door. Nothing else happens out here before Sefa comes back, unless one of you makes it happen.

Where you are: inn yard, back to the stable wall by the middle wagon · Time: Day 1 · evening
````

**Player** (player r9):

````text
Bram sets the lamp on the ground by his boot where it won't throw his own shadow onto the gate, and looks at Pell across the yard. He's not angry. He's been lied to by better men and worse.

"You heard me call you. Twice." He says it flat, like a fact about the weather. "A man who stands in the dark while another man calls his name has made a choice, and he's made it about me. I'll not hold it against you tonight. But Vosk's right, and I'd have said the same if he hadn't: on the road you walk where I can see you, or you don't walk with us." A beat. "You might be the best sword on this bench. I don't know. What I know is you listen well and you don't answer. On a quiet road that's a virtue. On this one, I need to know which way you'll jump before the jumping starts."

He nods toward the tail of the third wagon. "Since you're standing there and not signing anything — the fence past that wagon's sagged a foot where the post's gone. That's where I'd come over if I were Harn. Pim's barred the gate, which keeps out honest men. If you want to be useful without taking Vosk's coin, drag a couple of those split logs over and stack them under that board so a man can't get a hand over without knocking something down. It'll make noise, and noise is all I want out of it."

He settles back against the stone, shield against his knee, sword where his hand falls on it.

"After that, go in and sleep if you like. I'll wake you before first light either way." He glances at the inn door. "And if you're still deciding — Vosk's a tired man carrying a box he's afraid of, and he's told us more truth tonight than most factors tell in a season. That counts for something with me. Whether it counts for anything with you is your business."
````

### Screen 12 · player r10

````text
Pell hears you out. When he answers he speaks to the inn door first, where Vosk went in. The latch is down and nobody is behind it to hear.

"I'll take a watch, and not behind the wagons. If I take it. Plain suits me. Two gold, food, and the work is outside the canvas. I don't need to breathe on the crate."

Then, quieter, to you: "When a man says my name like that, he's finished trusting me for the evening. I'd rather earn the rest back than talk it out of him." His eyes go to the barred gate and come back. "You're a steady one. You can have my company here for a while, if it doesn't put your shield work off. I'm not signing by lamplight, but I'm not climbing over, either."

The lamp at your boot throws its light low across the packed earth and away from the gate. In the stable a mule shifts its weight and goes quiet again. Up the street the Red Sheaf's song falls apart in laughter.

Pell hasn't said a word about the logs, and they're still stacked by the door.

The yard door opens before either of you says more. Pim backs out with a second lamp in one hand and a bowl in the other, shouldering the door wide with his hip. He hooks the lamp on the nail beside the frame, checks the flame, then looks at the bowl as if he isn't sure how he ended up holding it.

"Master Vosk says I'm to fetch and not argue," he tells you, all in one breath, the way a boy repeats an order so he won't lose it. "If the tall one comes. Fetch, not argue." Then he turns to Pell and holds the bowl out at arm's length. The stew in it has gone grey and set at the edges. "And Mistress Tarnwick says this is yours, master, and it's three silver whether you eat it or not, and she's not keeping it warm for a man who goes out the back."

He waits there with his arm out and the bowl steady, plainly more afraid of Orla than of either man in the yard.

Where you are: inn yard, seated against the stone by the wagons · Time: Day 1 · evening
````

**Player** (player r10):

````text
Bram almost smiles at the bowl.

"Take it, Dunmore. She'll charge you for the walk out here next." To Pim, with a nod at the lamp on its nail: "Good. That's where I want it. Now get to your straw. If anything comes over that fence tonight you'll hear it before you see it, and all I want from you is your feet on the stairs and Vosk's door."

When the boy's gone, Bram looks at the woodstack, then at Pell, and doesn't ask twice. He gets up himself, stiff from the road, and carries four split logs across the yard two at a time. He wedges them under the sagging board past the third wagon, not neatly — balanced, so a hand pulling on the fence from the lane side brings the top one down onto the others with a clatter. He tests it with a nudge of his boot, nods at the sound it makes, and comes back.

"There. Honest men use the gate. Everyone else announces themselves." He settles against the stone again, shield to his knee.

"You can have the watch till Sefa's back, if you want it, and I'll not call it signing anything. I've no quarrel with a man who'd rather earn trust than talk it. Just understand that I don't give it out by lamplight either." He tips his head toward the inn door. "She's gone to find a mage who'll keep his mouth shut, in a smiths' town, after dark. If she manages it, we'll all learn something tonight. If she doesn't, I walk north at dawn with a humming box and two strangers, which is about how most of my runs have started." He closes his eyes for the span of a breath and opens them again on the gate. "Eat your stew. It's paid for."
````

### Screen 13 · player r11

````text
Pell Dunmore fishes three silver out of his pouch before he takes the bowl and presses them into Pim's palm. "There. Bowl and all. Tell Mistress Tarnwick I don't expect it kept warm, and thank her for sending it." He drops a copper on top. "For the errand."

Pim's arm is getting tired. He has been looking from you to Pell, and by the time you finish speaking, Pell already has his purse open. The bowl changes hands.

"Not kept warm, and thank her for sending it," Pim says to himself, closing his fist over the coins. He stares at the copper for a moment as if he isn't sure it's meant for him. Then he decides it is and puts it in a different pocket from the silver. "Yes, master. Feet on the stairs, Master Vosk's door." He ducks back through the yard door. The noise of the common room swells for a moment and cuts off when it shuts.

You are on your feet before the latch drops, stiff in the knees and slow about it. You take the logs from the stack two at a time and carry four of them past the tail of the third wagon to the sagging stretch of fence. You don't stack them neatly. You lean them, bottom ends dug into the old straw and top ends resting against each other just under the low board, so they hold together only because nothing has touched them yet. You nudge the pile with your boot. The top log slides and knocks against the others with a dry wooden clack that bounces off the stable wall. A mule in the end stall jerks its head up and snorts. You set the log back and walk back to your place.

Pell has set the bowl down on the edge of the watering trough by the stable door, where the lantern lights it and his hands. While you are still coming back he speaks across the yard to you: "I heard you call. I stayed in the shadow until the lamp came round, and that's on me — not against you, but you're right to mark it. I said I'd take a watch, and I meant it. If we walk together, I'll walk where you can see me."

Then he goes to the woodstack himself and takes two more logs, picking sound ones, and drags them one at a time across the packed earth to the fence. He leans them against the boards right under the place where a hand coming over from the lane would grip. Now anyone climbing has to get past his two before he reaches your four. It isn't a wall. It's a heap of firewood ready to fall over and wake half the inn, which is the whole point.

He comes back into the light, picks up the bowl and sits down with his back to the stable wall, a few feet from you, where you can see him. "I'll sleep when I'm done eating," he says quietly. "Wake me at first light, or before it if the gate moves." The stew has gone grey at the edges and stiff with cold fat. Pell eats it anyway.

The yard settles. The lamp by the door burns steadily on its nail. Vosk's candle-lamp sits low by your boot and lights the ground more than the gate. Up the street the Red Sheaf is quieter now, just voices with no song. The barred gate holds, and the logs past the third wagon lean where the two of you put them.

Nothing more happens in the yard for now, unless one of you makes it happen.

Where you are: inn yard, against the stone by the stable · Time: Day 1 · evening
````

**Player** (player r11):

````text
Bram watches Pell drag the two logs over and set them under the hand-grip, and says nothing about it, which from him is as good as a nod.

He eases down against the stone, finds the place where the wall takes the weight of the mail, and lets his breathing slow. The shield stays against his knee. His right hand lies open on his thigh a hand's width from the hilt, the way it's lain through a few hundred nights like this one.

"Dunmore." Quiet, not turning his head. "Two things, and then I'll shut up and let you eat. First: if it's Harn over that fence, he's a man who's seen the box and come back for it, and I'd like to know why before anyone bleeds. So if he comes, I want him talking, not running. Stand between him and the fence, not between him and me." A pause. "Second: if it's not Harn — if it's something that doesn't use the gate or the fence — you get Vosk and Sefa out the front door and up the street, and you don't wait for me. I've no idea what a Cowled seal keeps in, and I'd sooner find out alone than with three."

He lets his eyes rest on the gate.

"That's all. I'll wake you."

Then he does what caravan guards do, which is mostly nothing: counts the lamps, listens to the mules, marks the moment the Red Sheaf goes quiet, and waits for the yard door to open on Sefa or for the logs to fall.
````

### Screen 14 · player r12

````text
Dunmore eats his stew without hurrying, his back to the stable wall and the bowl balanced on one knee. His eyes keep moving: gate, fence, shadows, gate again.

You say your two things to the side of Pell's head, low and even, without taking your eyes off the gate. You want Harn talking, not running, and Pell between him and the fence. If it's something else, Pell is to get Vosk and Sefa out the front door and up the street without waiting for you. Then you settle your back into the stone until the mail stops pressing wrong, lay your right hand open on your thigh near the hilt, and go quiet.

The yard door is still open a hand's width behind Sefa. The lamp on its nail puts her in the brightest spot in the yard. Her eyes go past the wagons to the fence. The heap of split logs at the foot of the sagging board is just inside the light. They lean against each other the way logs never fall on their own.

"Those logs weren't there when I left. Did one of you put them there?" She stays in the doorway, looking at the low board above the pile. "If not, someone's been busy remarkably close to your watch."

Pell finishes the stew. It's cold, and he eats it to the bottom anyway, scraping the bowl. He sets it down on the straw beside him and speaks to you, quietly enough that it stays inside the fence: "I was past the middle wagon earlier and heard the mules stamping when you put your weight on those logs. They're sharper than most watchmen." Sefa hears it too from the doorway.

Then Pell folds his arms and leans back against the stable wall.

The yard goes back to its small noises. A wagon creaks as the wood cools. Something small runs under the straw near the privy. In the end stall a mule shifts its weight from one hind foot to the other and sighs through its nose like a tired old man. Up the street the Red Sheaf is still going, voices and now and then a laugh, no song yet. The gate's bar sits in its brackets. The six logs lean where they were put.

Sefa's question is still waiting in the doorway for whichever of you answers it.

Where you are: inn yard, back against the stone wall · Time: Day 1 · evening
````

**Player** (player r12):

````text
Bram doesn't get up.

"Mine. Four of them. Dunmore's the two under the hand-grip." He tips his head at the fence without looking away from the gate. "Post's rotted past the third wagon and the board sits a foot low. Anyone coming over from the lane puts a hand on it and brings the lot down. It's not a wall. It's a bell."

Now he does look at her, and at the open door behind her.

"You've been a while. Did Orla give you a name, or just the price of asking?" He shifts the shield against his knee. "If there's someone coming to look at that box tonight, I want to know how many and by which door, so I don't put a javelin in a mage. And if there isn't — say so, and I'll stop hoping for it and get on with the watch." A beat. "Shut that door behind you either way. Vosk pays for the yard, not the heat."
````

### Screen 15 · player r13

````text
Sefa looks from one of you to the other. "Bram's work, then? All right. I only wanted to be sure you knew they were there." She pulls her cloak closer. "Good night, both of you. Wake me if you need me."

Pell gives her his piece before she turns. "I did the same for the same reason, on my way back from the stack." He says it plainly and meets her eye. "It'll clatter before anyone gets a boot down on this side. That's all." Then he folds his arms again and settles back against the stable wall.

Sefa goes in. The yard door swings to behind her and the latch drops. In the yard there's the lamp on its nail, the mules, and the low murmur of the Red Sheaf up the street.

The night goes on from here: your watch by the stone, Pell against the wall. Tell me if you want to jump ahead, and to when, or stop at any hour along the way.

*(Out of game: Sefa already gave the yard her answer when she came out a quarter of an hour ago: no expert tonight, Thalantyr's gate is shut, Vosk won't have Kelddath in, and she has turned the work down.)*

Where you are: inn yard, by the stone near the gate · Time: Day 1 · evening
````

**Player** (player r13):

````text
? Just so I've got it right: Sefa told us earlier — no expert tonight, Thalantyr's shut, Vosk won't have the Lathander priest in, and she's not taking the work. I'll play it as heard. One more thing — did she say whether she's still walking north in the morning, with or without pay?

Bram lets the latch drop and sits with it a while.

"So that's that," he says to the dark, quiet. "No mage, no priest, and the healer's out. Two of us and a tired Amnian, if you sign." He doesn't make it a question. "I'll take it till the Red Sheaf shuts and the street goes dead. Then you take it till the sky greys, and I'll have an hour's sleep against the wheel. Shake me if the logs go, if the gate moves, or if that box does anything a box shouldn't — sound, cold, light, I don't care which. Don't wait to be sure."

He settles his shoulders into the stone, shield to his knee, hand open by the hilt, and keeps his eyes on the gate.

[Onward] — to the end of the Red Sheaf's noise and the change of watch, unless the yard has something to say first.
````

### Screen 16 · player r13

````text
[Out of game] Yes, you have it right. Sefa said no expert tonight, Thalantyr's gate is shut, Vosk won't have Kelddath in, and she has declined the work.

On the morning she said nothing either way. She didn't say whether she's walking north, paid or unpaid, or staying in Beregost. The closest she came was at supper, when she said she'd just come down that road from the Gate, wasn't eager to turn straight round, but would listen to an offer. She listened and turned it down. Her last words in the yard were about tonight: wake her if you need her, upstairs, second door on the left, and she won't leave you alone with someone hurt. What she does at first light is for Sefa's player to say, so Bram doesn't know yet.

One small thing about your lines: Pell still hasn't told Vosk yes or no. So "two of us, if you sign" is accurate, and whether Pell takes the second half of the watch is his player's answer. I'll play your watch orders and the move toward the change of watch in the next round, alongside whatever Pell's player sends. If the yard has something to say before the Red Sheaf goes quiet, it'll say it there.

Where you are: inn yard, by the stone near the gate · Time: Day 1 · evening
````

**Player** (player r13):

````text
Bram takes the answer the way he takes most things, with a short nod to nobody.

He doesn't add to his watch orders; they're said. He only shifts the shield so the rim won't dig into his knee over the long hours, and lets the yard settle around him — gate, lamp, logs, the mules' breathing, the thin noise from up the street.

"Red Sheaf shuts, you take it," he says once more, low, to be sure Pell heard it the first time. "Till then, sleep if you can."

[Onward]
````

### Screen 17 · player r14

````text
Pell sits with his back to the stable wall, one knee drawn up, and says nothing. He keeps still the way a man does who's used to long hours and no company. His eyes move slowly around the yard and come back to the gate each time. Now and then he shifts his weight without a sound.

The yard settles around the two of you.

For the first hour and more there's very little to hear. The lamp on its nail by the yard door burns with a steady flame. Down at your boot, Vosk's candle-lamp gutters lower and lower until it's only a bead of light at the bottom of the glass. In the stable the mules shift their weight now and then, and the end-stall mule blows through its nose. The middle wagon creaks once as the wood cools. Somewhere along the lane behind the fence two cats start a quarrel and drop it again.

Up the street the Red Sheaf goes on longer than the Burning Wizard does. Through the yard door the common room thins out. The dice game breaks up with a groan and a laugh, boots go up the stairs, and the third and seventh steps creak over and over as the carters climb to the loft. After a while there's only Orla's voice, short, then a bar dropping somewhere inside, and the house goes dark except for the lamp outside its door. The Red Sheaf keeps going another hour. Then a door bangs up the street, three or four voices carry along the Coast Way saying good night badly, and the street goes quiet.

That's near midnight. The cold has come down properly now, and the packed earth has a damp shine in the lamplight.

You have kept your eyes on the gate the whole time and haven't moved much beyond easing the shield off your knee. There has been nothing to watch but a quiet yard.

When the voices have faded down the street, you look over at Pell and give him one short nod. You work yourself down against the spokes of the middle wagon's wheel with the shield across your lap. Your breathing slows, and within a few minutes you're in a soldier's sleep, light and even, the kind that wakes at the wrong sound.

The watch is Pell's.

Where you are: Burning Wizard's yard, asleep against the middle wagon's wheel · Time: Day 1 · night
````

**Player** (player r14):

````text
Bram sleeps the way he's slept against a hundred wheels — one hand on the shield rim, the other fallen open near the hilt, breathing slow. The hum comes up through the spokes into his back, and he doesn't notice it any more than he'd notice a cart's rattle; it's just the sound the wagon makes.

[Onward] — to whatever wakes him: Pell's hand, the logs, the gate, the box, or the grey in the sky.
````

### Screen 18 · player r15

````text
Two fingers press on your boot, and that's enough. Your breathing changes before your eyes open, the way it does for men who've slept on watch for years. Then your eyes are open and on Pell's face, close above you, and his breath of a word reaches you: *"Company. Fence, past the third wagon. A man testing the low board."*

He straightens into a low crouch and points once: not at the fence itself, but at the dark along the stable wall and the gap between the privy and the wagons. Then he goes.

He keeps low and stays out of the lamplight, and his feet make no sound on the damp packed earth. You watch him pass the middle wagon's tailboard and the third wagon's lashed canvas, then lose him into the dark between its tail and the privy wall, about thirty feet from where you sit.

Then, out at the sagging stretch of fence past the third wagon, the low board groans. Hands come over the top, then a head and shoulders. It's a tall figure hauling himself up that last foot, slow and clumsy. He hangs there with his elbows hooked over the board, looking into the yard: at the lamp burning on its nail by the yard door, then along the row of wagons to the middle one.

He swings a leg over.

Whatever his boot comes down on goes out from under him. The logs stacked at the fence's foot come down all together, and the clatter of split oak on packed earth bangs off the stable wall, much louder than it ought to be at this hour. In the end stall a mule screams and kicks its boards twice. Somewhere out in the lane a dog starts barking.

The man comes down with the logs. He sprawls among them, half in the yard with a leg still hooked on the board, then works it free and pushes himself up onto one knee. He stays there, breathing hard, still turned toward the middle wagon and the lamp. He hasn't looked round.

Behind you the middle wagon's hum goes on as steady as ever.

Where you are: inn yard, seated against the middle wagon's wheel · Time: Day 1 · night
````

**Player** (player r15):

````text
Bram is up before the last log stops rolling. The shield comes onto his arm with the ease of long habit; the sword clears its sheath with a short rasp meant to be heard. He doesn't run. He steps out from the wheel into the lamplight, three paces, and plants himself between the man and the middle wagon with the lamp behind him so the intruder is looking into light and Bram is a shape with a shield.

"Stay on that knee." Not loud — he doesn't need to be, the yard's already woken itself. "Hands where I can see them, and you'll keep all your fingers. You've got a man behind you between you and the fence, so there's no going back the way you came, and there's a bar on the gate. That leaves talking."

He lets that land, then: "Red neckcloth. You're Harn. You put a knife under that lid on the Nashkel road, and you came back tonight to ask a stable boy when the wagons leave, and now you're in Vosk's yard at midnight with no lantern. So tell me what you want with that box, and tell me straight, because the Amnian's already said more truth tonight than you're likely to, and I'd like to hear you beat him."

He keeps the sword low, point toward the ground, shield up, eyes on the man's hands — and a flick of a glance to where Pell went, to be sure the dark between fence and wagon is held.
````

### Screen 19 · player r16

````text
You're on your feet before the last log stops rolling. The shield comes up onto your arm, and the longsword leaves its sheath with a short, deliberate rasp, loud enough to be heard. You don't run. You take three steps out from the wheel into the lamplight and stop between the man and the middle wagon, with the lamp on its nail behind you. To the man on his knee among the logs you're a dark shape with a shield and a sword held low, and the light is in his eyes.

"Stay on that knee." You don't raise your voice. The yard has woken itself already. "Hands where I can see them, and you'll keep all your fingers."

The man's head snaps round toward your voice. His hand stops halfway to his belt.

Behind him, Pell is already moving out of the dark, quick and low, and the sliding logs cover any sound his boots make. Pell drives a knee into the small of the man's back, reaching for the wrist on the knife side as he comes down.

Pell's knee lands, but not squarely. The man is bigger than he looked hanging off the fence, and he's still half braced on one knee. He heaves up hard against the weight. Pell's fingers close on the wrist and slide off. An elbow comes back blind and catches Pell across the ribs. It's more of a shove than a blow, and it tips him sideways onto the logs he stacked himself. They roll under his hip with a hollow clack.

The man staggers to his feet and backs away from the two of you until his shoulders hit the tailboard of the third wagon. He's tall, breathing hard, and favouring the hip he landed on. In the lamplight the cloth at his throat is red after all. His right hand has found the hilt of the knife at his belt and closed on it. The blade is still in its sheath.

You haven't moved from where you planted yourself. When the scrambling stops, you finish what you were saying, at the same level pitch as before.

"You've got a man behind you between you and the fence, so there's no going back the way you came, and there's a bar on the gate. That leaves talking." You let it sit for a breath. "Red neckcloth. You're Harn. You put a knife under that lid on the Nashkel road, and you came back tonight to ask a stable boy when the wagons leave, and now you're in Vosk's yard at midnight with no lantern. So tell me what you want with that box, and tell me straight, because the Amnian's already said more truth tonight than you're likely to, and I'd like to hear you beat him."

You glance once toward the fence. Pell is getting up off the logs on one hand, still on the fence side of the man. The way back to the lane is still held.

Harn looks from your sword to the shape behind him and back again. His knuckles stay white on the hilt.

"Who in the hells are *you*?" His voice is thick with ale and rough from shouting in taprooms. "He's got no guards. We *were* his guards." He jerks his chin at the middle wagon without taking his eyes off you. "Straight, you want. Straight is he owes me two days and the second half, and he called me a thief in front of Tamsk for looking. *Looking.*" He spits to one side. "That thing sings at night. It froze the lid in summer. A man doesn't haul that for wool money, and he doesn't pay his guards wool money for walking next to it, either."

Behind the stable door, straw rustles hard. A small shape bolts out of the dark between the stalls: Pim, barefoot, with his shirt half on. He takes one look at the man by the third wagon and doesn't stop to argue. He runs for the yard door, gets it open and goes through. His feet hit the inn's stairs, and the third step creaks.

Harn hears it too. His eyes flick toward the inn door, then back to your sword. He doesn't let go of the knife.

Where you are: Vosk's inn yard, in the lamplight before the middle wagon · Time: Day 1 · night
````

**Player** (player r16):

````text
Bram doesn't move. He lets the knife-hand stay where it is, because a man gripping a sheathed hilt is a man who hasn't decided yet, and Bram would rather he decided slowly.

"Bram Halloway. Caravan guard. Ten years on this road, which is longer than you've been drinking at the Red Sheaf, so don't tell me what a man hauls for wool money." It comes out level, almost tired. "And I'll give you this much: if Vosk owes you two days and a half-share, that's a fair grievance, and I've walked off runs for less. But a man who's owed money comes to the front door in daylight and says so where Orla can hear it. He doesn't come over a fence at midnight with his hand on a knife. So we've got your grievance. Now give me the other thing — the thing that made you climb instead of knock."

He tips his head a fraction toward the middle wagon behind him without looking at it.

"You had your blade under that band at the noon halt. Nobody does that for curiosity on a factor's run; they do it because they've heard something, or been offered something. So which was it? Did somebody in Nashkel tell you what's in there? Did somebody here tonight tell you what it's worth?" A beat. "Because if there's a buyer in this town for a Cowled seal, I'd like his name before we're four days up the Way with him behind us, and you'd like it told now, in a yard, rather than later to a Fist sergeant in the Seatower. Those are your two doors, Harn. Pick the one with Orla's bread at the end of it."

He flicks one look past Harn's shoulder. "Dunmore. You whole?" Then, back on the man's hands, and quieter: "Vosk is coming down those stairs now. Have the knife-hand empty by the time he gets here. It'll go easier for your two days."
````

### Screen 20 · player r17

````text
Behind Harn, Pell Dunmore gets up off the tumbled logs with a grunt, but only into a crouch, weight on the balls of his feet. He takes one careful step sideways with his empty hands held out where the man can see them. He's still between Harn and the fence, but he has left Harn room to breathe. He pitches his voice to cut through Harn's ragged breathing: "That's the difference between tonight and the last time he called you a thief. Last time, you walked away with no sword at your neck. This yard's got three of us, the gate's barred, and the boy's gone to wake the inn." He tips his head, not unkindly. "Drunk men die in yards like this for less. Put the knife on the ground and talk to us with both hands still yours." Then he holds his ground and watches Harn's weight, not just his hands.

You don't step forward and you don't raise the sword. You talk to Harn's hands, level and close to tired, and you let each sentence land before the next one: your name, your ten years, the grievance you'll allow and the climb you won't. Then the noon halt, and the two doors, the yard or the Seatower.

Harn's eyes go from your shield to Pell and back. The yard door's latch rattles as someone on the other side fumbles at it.

Harn breathes out long and unsteady. Then his fingers open.

He doesn't draw the knife. He works it free of his belt, sheath and all, holding it by the leather with two fingers like something hot. He drops it on the packed earth in front of his boots and pushes it a foot away with his toe, toward you. It's an old guard's bargain: *you can see it, and I can't reach it.* Then he leans back against the third wagon's tailboard and takes the weight off his bad hip.

"Halloway." He says it sourly, as if it tastes of something. "Fine."

He looks past you at the middle wagon.

"Nobody told me nothing in Nashkel. Nobody offered me nothing. I loaded it." He jerks his chin. "Back of the forfeit house, off the square, before sunup, Vosk and a clerk in grey and nobody else about. You don't load cloth before sunup out a back door. And that wax. Every carter in Nashkel knows that wax. The hand and the coin, that's what the Amnians put on what they take off you at the border." He swallows. "So I knew it was took. I didn't know what."

Then what you said a moment ago catches up with him, and his face changes in the lamplight.

"Cowled." It comes out quieter than anything he's said yet. "*That's* what it says on there? Gods' teeth." He wipes his mouth with the back of his hand. "I can't read their scratching. I thought it was customs. Some lord's silver plate the excise took."

You get the rest of it the way you've heard it from a dozen men leaning on a dozen wagons: sullen, in pieces, and only as much as the man can stand to say.

"I wasn't going to take it. I was going to *look*. That's all. Look, and then go to him." He tips his head at the inn. "Say I know what you're carrying, master, and I know who took it off who, so you pay me my two days and the second half and a bit for my trouble, or I go and tell the Fist sergeant at Beregost gate what's in your linen." He spits to one side. "Fair price for keeping my mouth shut. Fairer than he paid for my feet."

He shifts on the bad hip and winces.

"Tamsk said leave it. Said the mules wouldn't stand by that wagon the night the frost came, and when mules won't stand by a thing you leave it alone. He went home." He looks at Pell behind him, then at your sword. "I drank till I didn't agree with him. That's the whole of it. Nobody in this town knows it's here but me. I didn't tell nobody at the Sheaf. I'm not *that* drunk."

The yard door opens.

Vosk stands in the gap in his shirt and breeches with the brown coat thrown over them, holding a candle-lamp. His feet are bare in his boots and the laces are untied. Pim hangs at his elbow. Vosk takes in the yard: the scattered logs, the knife on the ground, the man with the red neckcloth against his third wagon, and your sword. He was on the stairs for the last of it. Whether he heard the words *Fist sergeant* or only your voice, his face doesn't say.

"Harn," he says. He doesn't come any closer. He speaks to you, low and exact, as if he's correcting a column in the ledger. "He was paid to Beregost, Master Halloway. Every day to the day, in Nashkel silver, in front of Tamsk. The second half was for the Gate, and he did not walk to the Gate." His hand is steady on the lamp. "I owe him nothing. I would like that said before anything else is."

Harn's jaw works, and he says nothing yet. In the stable the end-stall mule has gone quiet. Out in the lane the dog has given up barking.

Where you are: inn yard, before the middle wagon · Time: Day 1 · night
````

**Player** (player r17):

````text
Bram lets his sword arm drop until the point rests on the packed earth. He doesn't sheathe it. He steps forward, puts his boot on Harn's knife and drags it back to his own feet, then stoops and picks it up by the sheath without taking his eyes off the man.

"Heard, Master Vosk. Paid to Beregost, in front of a witness. That's the ledger closed." He says it like he's initialling it himself. "Now the other column."

He turns the sheathed knife over once in his hand and looks at Harn.

"You were going to put a price on your silence. You've just given the whole of it away to three strangers and the man you meant to squeeze, in his own yard, with the stable boy listening. So that trade's dead. What you've got left is this: nobody's bleeding, and I'd like to keep it so." He tosses the knife underhand, not to Harn but onto the straw a few paces to his side, where it takes a step and a stoop to reach. "That's yours. You pick it up when you're on the far side of that gate and not before. Pim will lift the bar. You go up the street, you sleep it off, and in the morning you take the south road the way Tamsk did. If I see that neckcloth between here and the Gate, I'll take it for an answer to a question I didn't ask, and I'll stop asking questions."

A beat, and then, more quietly, almost man to man:

"Tamsk was right about the mules. I'd have listened to him."

Then he turns his head to Vosk, and his voice goes back to the level it had at the hearth table.

"Two things before anyone goes back to bed, and I want them straight. First — your bill of release. Is that paper good at a Fist gate, or isn't it? Because if a sergeant at the Beregost road-post can look at it and wave us through, then every threat this man made is wind, and I'll sleep. If it's the kind of paper that makes a sergeant go and fetch his captain, then we've got a problem at the first post we come to, and I'd rather know it tonight." He nods at Harn. "He loaded it out a back door before sunup with a clerk in grey. That's not how honest wool moves, and you know it."

"Second — he says the mules wouldn't stand by that wagon the night the frost came. You didn't mention that in the common room. I told you the terms: a horse won't go near it, we stop and talk. Looks like we've already had that night and I wasn't there for it." He lets the sword rest. "So talk. Short. Then Pim opens the gate, this man leaves, and I go back to my wheel."
````

### Screen 21 · player r18

````text
You lower the sword until its point rests on the packed earth, keep it out, drag Harn's knife back to your feet with your boot and pick it up by the sheath without taking your eyes off him. You close the ledger for Master Vosk, tell Harn his trade is dead, toss the knife onto the straw a few paces to his side, within a step and a stoop, and give him your terms: the knife on the far side of the gate, the south road in the morning, and no neckcloth between here and the Gate. Then, quieter, you tell him Tamsk was right about the mules.

Harn looks at the knife lying in the straw and doesn't move for it. His jaw works.

"South road." His voice comes out thick. "Fine." He shifts his weight on the tailboard, and the bad hip makes him wince. "Tamsk's always right. That's what's wrong with him."

Pell stays in his crouch at the edge of the light with his open hands resting on his knees. He watches Harn, glances once at the knife in the straw, and speaks to him low and without heat: "You're owed a reckoning, not a wage. And now the reckoning's here, with your knife in the dirt and your words already spent. You came over the fence with a plan to squeeze the man. In the dark. With your hand on steel." He lets that land. "You tell me what you'd call that, if you were the one with the lamp and the ledger."

He straightens slowly, taking care not to crowd Harn, and speaks toward Vosk in the door. "He says he followed the box from Nashkel and meant to look first and sell the secret after. That's his whole account, unless he finds a better one."

"Didn't *follow* it." Harn's head comes up. "Loaded it. I told him." He jerks his chin at you.

Pell lets that go by. He looks back at Harn with the same settled attention as before. "So you picked the right door, Harn — the one with Orla's bread at the end of it. If you keep your arse on that tailboard and your hands where they are, you might still get it."

Harn stays on the tailboard. He folds his arms, which keeps his hands where everyone can see them. He doesn't seem to notice he's done it.

Then you turn your head toward the yard door and put your two questions to Vosk at the hearth-table pitch: whether the bill of release is good at a gate post, and why nobody mentioned the night the mules wouldn't stand.

Vosk has stood in the doorway through all of it with the candle-lamp held steady. He keeps quiet until you've finished, then steps down into the yard. Pim stays behind on the threshold.

"The paper first." He keeps his voice low, though there's no one in the yard he could hide it from now. "It is good in Amn. An officer at the border post above Nashkel read it and waved me through. On this side of the border, Master Halloway, nobody licenses magic. A man in the Gate may own what the Cowled would hang him for in Athkatla. A sergeant at a road post can't read Amnian, most of them. He sees a stamp, a seal and a merchant. If he wants more than that, what he wants is silver, and I carry silver for that. If he fetches his captain, the captain finds no law of the Gate broken." His eyes go to Harn for the first time and come away again. "What he could have sold the Fist was never a crime. It was a story. *Something that frightens Amnian wizards is on the road north, in a cloth wagon, with two guards short.* A story like that doesn't bring a sergeant. It brings a different sort of man altogether."

He pauses.

"The back door. The clerk told me forfeit goods are not carried out across the square, where the man they were taken from might be standing and watching them go. That is what he said. It sounded sensible to me, and I took it. You may think what you like of it. I have had four days on the road to think the same."

Then he turns to the middle wagon.

"The mules. Yes. It was the night before Beregost, the night the frost came. The middle team pulled their pickets and stood at the far end of the line until it was light. In the morning they went into the shafts the same as always and pulled all day without trouble." He says it plainly and doesn't look away. "I did not tell you at the table. You did not ask, and I didn't want to lose you before you had said yes. That was wrong of me, and I'll not pretend otherwise."

"But I told you I would argue, and here it is. You made your terms after that night. Tonight those same mules have stood in a stable with that wagon on the other side of the boards, and they never stirred until the logs came down." He lifts the lamp a little toward the stalls. In the end stall the mule has its head over the half-door, ears up, looking at the scattered logs and not at the wagon. "So we are stopped, and we have talked. Short, as you asked. Whether it is enough is for you to say, Master Halloway."

Pim stands on the threshold behind him with one hand on the doorframe, and his eyes go between you and the barred gate. The bar is still down in its brackets. Harn sits on the tailboard with his arms folded and waits to be let out.

Where you are: Vosk's stable yard, by the wagons · Time: Day 1 · night
````

**Player** (player r18):

````text
Bram listens to the whole of it with the sword point in the dirt, and when Vosk is done he's quiet for the length of a breath.

"It's enough." He slides the longsword home. "Not because I like the answer. Because you gave it without me having to dig, and because the mule's looking at the firewood and not the wagon. That's the test I set, and it's passed, tonight. We'll set it again every night from here to the Gate, and I'll be awake for the next one." A short nod toward the stalls. "But hear this, Master Vosk, and take it for the last time I say it kindly: on the road, you don't wait to be asked. Mules pull a picket, frost on a lid, a clerk in grey — you tell me when it happens, not when I catch you at it. I can't stand in the right place for a thing I've not been told about. You held back once to keep me. Hold back twice and you'll lose me, and you'll lose me at the worst mile on the Way."

Then he turns to Pim on the threshold.

"Lift the bar, lad. One leaf, wide enough for a man." He looks at Harn. "Up. Slow. Knife when you're through, not before — I'll kick it out after you." He waits until Harn's moved off the tailboard before he adds, "And Harn. The Amnian said it better than I did. What you knew was never worth anything to a sergeant. It was worth something to the kind of man who doesn't wear a badge, and you'd have gone looking for him sober. Be glad you were drunk." He watches the man through the gap, kicks the sheathed knife after him into the lane, and tells Pim: "Bar it. Then bed."

To Pell, once the bar's down: "You did well. Knee was a hair high, but the logs did the rest, and nobody bled." He picks the scattered split oak up two at a time and leans it back under the low board, the same careless balance as before. "Your watch still. Wake me at grey."

And to Vosk, as the factor turns for the door, quieter: "Go back to bed. Whatever's in that box didn't stir for any of this. I'm starting to think it's not the box we need to watch on this road. It's who's heard of it."

He settles back against the wheel, shield across his lap, and closes his eyes.

[Onward] — to first light, unless the yard objects.
````

### Screen 22 · player r19

````text
While you and Vosk talk it out, the young man keeps his place between Harn and the fence and says nothing. When Vosk finishes he glances toward the stable, where the mule's ears are up and its eyes are on the logs, not the wagon, then looks back at you.

Vosk watches your blade go into the scabbard and lets out a breath he has plainly been holding since the stairs. He hears the rest out with the candle-lamp steady. He doesn't argue this time.

"Understood, Master Halloway. When it happens, then. Not when you ask." He says it slowly, like a man writing a clause into a contract he means to keep. "You'll have it at the hour it happens, whatever the hour is."

You turn toward the threshold. Before you get the words out, Pell speaks up from the fence side, low, his eyes still on Harn. "I've got this side. Say the word and the gate opens." He doesn't move toward the bar. His back is to the dark lane, and the spilled logs from the woodpile lie at his heels.

"One leaf, wide enough for a man." Pim is across the yard before he finishes repeating it. He has to get his shoulder under the bar to shift it out of the brackets, and he lays it carefully on the ground so it won't bang. Then he drags one leaf of the gate inward, and its bottom edge scrapes across the packed earth. Past the gap the Coast Way is grey and empty, and every door along it is dark.

Harn pushes himself off the tailboard. The bad hip catches him on the first step, and he walks the rest of the way to the gate stiffly, giving you a wide berth. He doesn't look at the middle wagon. Pell turns where he stands to keep him in view and lets him pass.

When you've told him the rest, Harn stops with one boot in the lane and looks back. His face is hard to read in the lamplight. It might be anger. It might be the drink catching up with him all at once.

"Didn't need telling twice," he says. It's not clear whether he means you or the Amnian.

Your boot sends the sheathed knife skidding across the straw and out through the gap. It comes to rest against the far side of the lane. Harn stoops for it, slowly, one hand on his hip. He shoves it into his belt and limps away up the Coast Way, north, toward the dark bulk of the Red Sheaf. He doesn't look back again.

Pim swings the leaf shut and gets his shoulder under the bar again. It drops into the brackets with a thump. "Barred, master." Then he trots back to the stable without waiting to be told twice. Straw rustles, and the boy goes quiet.

You pick the logs up off the ground two at a time and lean them back under the low board, propped against each other the same careless way, so they'll fall if anything touches them.

Vosk has turned for the door. Your last word reaches him there. He stands with his hand on the latch for a moment.

"I've thought the same since Nashkel, Master Halloway," he says, without turning round. "It is a poor thing to find out you are right." Then he goes in, and his light moves away through the passage and up the stairs.

You work yourself back down against the wheel of the middle wagon, shield across your lap, and shut your eyes. Within a few minutes you are asleep.

---

The stable door creaks and Pim comes out yawning with a bucket. The scrape of the bucket handle wakes you the way the wrong sound always does, and you're awake before the boy reaches the trough. The sky above the stable roof has gone from black to the colour of slate. Pell is still on watch, the gate is still barred, and the logs still lean where you left them. The mules shift and blow at the smell of water.

Then the yard door opens. Vosk stands in it fully dressed, the brown coat buttoned and his boots laced, with the ledger under his arm and his face grey from the short night. He looks along the row of wagons to the middle one, then at you by the wheel. Then his eyes settle on Pell.

It isn't quite light yet. He doesn't say anything. He waits.

Where you are: inn yard, against the middle wagon's wheel · Time: Day 2 · morning
````

**Player** (player r19):

````text
Bram gets up off the wheel the way he got up off a hundred: slow, knees first, one hand on the spoke. He rolls his shoulders until the mail sits right, then before he says a word to anyone he climbs onto the middle wagon's bench, unties the two front lashings and folds the canvas back a hand's width.

He looks at the lid. He puts his palm flat on it, then on the linen bolt beside it. Whatever he finds, he says it aloud, plain, to Vosk in the doorway: dry or wet, cold or not, frost or none. Then he ties the lashings again and climbs down.

"Night's report," he says. "One man over the fence, sent off up the street. The box did nothing a box shouldn't. Mules slept." He nods at the end stall. "That's the first of four. Three more to go."

He turns to Pell, and doesn't speak for him.

"He's waiting on you, Dunmore. Not me. Say it or don't, but say it before the mules are in the shafts, because once they are I stop counting heads." Then, to Vosk: "Half when we start, you said. I'll take mine before the first wheel turns, and I'll want bread with it — Orla's, not hardtack. And the healer upstairs doesn't know we're leaving unless someone's told her. I'll knock on my way to the privy. She turned your coin down, that's her right, but I'd not walk north without saying so to her face. Ten minutes, and I'll be at the lead team's head."

He slings the shield onto his back for the moment, picks up the guttered candle-lamp from the dirt and hands it to Vosk in passing.

"Yours. It did its job."
````

### Screen 23 · player r20

````text
The man who kept the other half of the watch with you, Pell Dunmore, stays with his back against the cold stable wall while you get up. He watches Vosk in the doorway and lets the quiet run a while longer.

You get up off the wheel slowly, knees first, one hand on a spoke. The cold has settled into the mail overnight, and you roll your shoulders until it hangs right. Then you climb onto the middle wagon's bench, where Vosk sat yesterday, work the two front lashings loose and fold the canvas back a hand's width.

The grey light reaches the crate. There is no frost on it. You lay your palm flat on the lid, and the oak is cold. It is colder than the bench under your knee and colder than the iron band an inch from your fingers, as if the wood had spent the night somewhere else. The hum comes up into your hand the same as it did last night, no stronger and no weaker. You move your hand to the bolt of linen pressed against the crate's far side. It is wet now, not just damp, and the wet has spread a finger's width further into the cloth than it was by lamplight.

You tell Vosk exactly that across the yard: no frost, the lid cold, the linen wetter than last night, and the hum unchanged. Then you tie the lashings off again and climb down.

Vosk hears it from the doorway, and his mouth goes tight. "Wetter," he says, as if he were writing it in a margin. "I'll have that bolt moved to the tail of the first wagon before we yoke. It is spoiled for selling as it is." He doesn't argue the rest.

You give him the night's report in four short pieces: one man over the fence and sent off up the street, the box doing nothing a box shouldn't, the mules asleep, and one night down with three to go.

Pell comes off the stable wall as you finish. He rolls the shoulder Harn's elbow found and winces a little.

"Quiet since the gate was barred." He nods toward the fence, where the six logs still lean against each other. "Nobody came back for a second try." Then, to Vosk: "You're abroad before the crowing. First light's not far. I'll wash the yard off my hands and be down to give you my word."

Vosk looks at him for a moment, then at the sky over the stable roof. It is slate, going pale at the eastern edge.

"Wash, then, Master Dunmore. The mules go into the shafts when I can read the ledger without a lamp." He doesn't say *and not after*, but it is plain in how he says it.

You turn to Pell and leave the choice with him, then turn to Vosk about your half and the bread.

Vosk opens the ledger against his forearm, takes a small purse from inside his coat and counts four gold pieces into your hand without hurrying.

"Four days at two, the half of it is four. Paid." He marks the page with his pen, and this time the nib is wet. "The bread is part of your food, Master Halloway. That is mine to buy, not yours. I'll have Mistress Tarnwick put up a loaf for each man and a round of cheese. She'll be glad of the custom before breakfast."

When you tell him about the healer upstairs, Vosk nods slowly.

"That is decent of you. She was decent to me." He closes the ledger. "Second door on the left. You know it."

You sling the shield onto your back, pick Vosk's candle-lamp up out of the straw and put it in the factor's hand as you go past.

Vosk looks down at the cold glass with its burnt-out thread of tallow, and for a moment something close to a smile shows under the grey beard. "So it did."

At the trough Pim has stopped pouring and is listening with his mouth half open. Vosk raises his voice to him. "Pim. The middle team first, then the lead. Harness, not yoke. Not until I say."

"Middle team first, then the lead. Harness, not yoke." The boy says it into the bucket and goes into the stable at a trot.

You go in through the yard door. The common room smells of new smoke and bread. Orla is at the hearth with a poker and doesn't look round, and the stairs are ahead of you.

Your records, changed:
Money: + 27 gp; − 23 gp

Where you are: inn common room, at the foot of the stairs · Time: Day 2 · morning
````

**Player** (player r20):

````text
Bram takes the stairs, lets the third and seventh steps creak because there's no helping it, and stops at the second door on the left. He knocks twice with a knuckle, not loud — the kind of knock that says *it's not trouble, but it's not nothing either*.

"Mistress Marrin. Halloway. Vosk's yoking in a quarter hour and I said I'd not go north without telling you to your face."

If she opens, he stands back from the door and keeps it short.

"Night's news, since some of it's yours. Harn came over the fence past midnight. Drunk, bad hip, hand on a knife he never drew. Dunmore and I had him on his knees before he'd got a boot down, and he talked. He loaded that crate himself at the Nashkel forfeit house, back door before sunup, clerk in grey. He couldn't read the seal — thought it was excise. He meant to look, then squeeze Vosk for silence money. I sent him up the street with his knife and a warning. Nobody bled."

"And the box. No frost this morning. But the lid's colder than the iron bands on it, and the linen beside it's wetter than it was by lamplight — spread a finger's width. The hum's the same. The mules slept through all of it, bar the logs falling." He shifts the shield on his back. "You said it's the cold that wants explaining, not the water. It's getting colder, and it's doing it in a stable with no wind. I thought you'd want that for whatever you make of it."

Then, plainly: "You turned the coin down and I'll not argue it. But you came down that road and you've nowhere to be, as far as I heard. If you're walking north anyway, paid or not, there's bread and cheese going into the first wagon and you'd be welcome to walk beside it. If you're staying, then good luck in Beregost and thank you for reading the wax. That's all. I'll be at the lead team's head."

He waits for whatever she says, then goes down: the privy, a splash from the trough, Orla's bread, and his place at the lead mule's head with the shield on his arm.
````

### Screen 24 · player r21

````text
As you come up toward the stairhead, Sefa Marrin is already out on the landing, not behind her door. She has stopped short of the top of the stairs, leaving you room to come up, and in the grey light from the stairhead's one small window she peers down at your face.

"Good morning. Bram?"

You stop two treads short of the top so you aren't crowding her on the landing. Below you a carter comes out of the loft passage with his boots in his hand, squeezes past with a grunt and goes on down. The seventh step creaks under him.

The door you meant to knock on is behind her, so there's no knock. You give her the rest where you stand, short and level, the way you gave the factor your report in the yard: Vosk yoking in a quarter hour, Harn over the fence and what he told you, the box colder and the linen wetter, and the offer of bread and cheese and a place beside the first wagon if she's walking north.

The smell of new bread and the clatter of the kitchen come up from below while you talk, and you shift the shield's strap on your shoulder. When you've said it all you stay where you are on the stair, one hand on the rail, and wait for her answer.

*(Out of game: your knock never happened, because Sefa was already out on the landing when you got there. Everything else you said reached her there. Telling her about Harn needed no roll, since it was just the truth of the night. What you told her about the crate comes from your check at dawn last round, which needed no roll.)*

Where you are: inn stairs, two treads below the landing · Time: Day 2 · morning
````

**Player** (player r21):

````text
Bram stays on his tread with his hand on the rail and doesn't add to it. He's said his piece; a man who keeps talking after that is trying to sell something, and he isn't.

He only says, after a moment, quieter: "Take your time deciding, but not much of it. Vosk reads his ledger without a lamp, the mules go in. I've seen the sky — that's a quarter hour, no more."

Then he waits for her answer, and whatever it is, he nods to it, goes back down past the creaking steps, and gets on with the morning: privy, cold water from the trough on his face and neck, Orla's loaf and cheese for the first wagon, and his place at the lead mule's head with the shield on his arm and his eyes on the gate.
````

### Screen 25 · player r22

````text
From below come the clatter of the kitchen and Orla's voice telling someone short and sharp where the cheese is. A carter comes back up from the yard with wet hair and squeezes past you on the rail side. The seventh step creaks under him, and he nods to you both without curiosity as he goes into the loft passage.

"Thank you for coming up. And I'm glad nobody bled." Sefa shifts her pack on her shoulder. "I'm staying. Walking beside the wagon without taking pay wouldn't make my doubts about it any smaller."

For a moment she looks at the straw caught in the rings of your mail.

"You kept your word last night. Keep the condition you gave him, too. If someone wakes cold, stop. Don't let him bargain you another mile before you do."

She steps back to clear the landing so you have room to turn. "I may try High Hedge by daylight. There's something worth learning here, even if I never see that crate again."

Then she holds out her hand to you across the two treads, palm open, at the height of the rail. The grey from the little window falls on it. Behind her the door of her room stands open on the cold, unmade bed.

"Safe road, Bram. If we meet in the Gate, I'd be glad to share a table again."

She waits with her hand out.

Where you are: on the inn stairs, two treads below the upper landing · Time: Day 2 · morning
````

**Player** (player r22):

````text
Bram takes the hand. His is big and rough and cold from the yard, and he doesn't crush hers; he shakes it once, the way he'd shake a hand over a finished deal.

"Staying's a fair answer. Better than walking a road you don't believe in." He lets go. "And I'll keep the condition. Someone wakes cold, we stop. He'll argue — he's told me so twice — and I'll let him, and then we'll stop anyway. I've been bargained an extra mile before. It's a mile too far every time."

He glances once at the straw on his own mail, as she did, and brushes at it without much effect.

"High Hedge. If the old man opens his gate to you, ask him about the circle with three strokes. The one someone scraped off before Nashkel. Vosk doesn't know it, Harn couldn't read it, and you didn't know it either, which makes it the only thing on that box nobody's got a story for." A short pause. "I'm the last man to tell a healer her business. But if it was mine I'd want that answered before the wax."

He steps down a tread to give her the landing.

"Safe road to you too, Mistress Marrin. The Elfsong, if I'm in the Gate and standing — I'll be the one with his back to the wall." Then he goes down, the third and seventh steps creaking under him, and out through the yard door into the grey, to the privy, the trough, the loaf and cheese, and the lead mule's head, shield on his arm and eyes on the gate.
````

### Screen 26 · player r23

````text
Sefa Marrin holds out her hand to you for the farewell.

You take her hand. Your palm is broad and rough and still cold from the yard. You don't crush it. You shake once, the way a man shakes on a finished deal, and let go.

You look down at the straw caught in your mail, the way she did a moment ago, and brush at it. Most of it stays where it is.

You step down a tread to leave her the landing.

"My mind's made up, Bram. I'm staying in Beregost today." Her hand is still half-raised from the shake. "Good luck to you."

You nod to it as though she'd handed you something to carry.

Then you go down. The seventh step creaks under you, then the third. At the foot of the stairs you turn toward the yard door and go out.

The yard has turned from slate to pale. You do your rounds the way you said you would. You use the privy. At the trough the water breaks a thin skin of cold, and you take two handfuls of it over your face and the back of your neck, which brings you the rest of the way awake. You walk along the row past the first wagon to where the lead team will stand, take the shield off your back and settle it on your arm.

Pim already has both of the middle team out by the trough in harness. He's leading the first lead mule out of the stable when you reach the wagon. The animal sees your shield and pulls its head back once. Then it decides you're furniture.

The yard door opens and Vosk comes out with a bundle in oiled cloth under one arm and the ledger under the other. He looks at the eastern sky over the stable roof, then down at the page. He doesn't need a lamp to read it any more. He walks to the first wagon, loosens the tail lashing and lays the bundle inside beside the spoiled linen bolt, which has already been moved there. Then he ties it off again.

"Three loaves and a round of cheese, Master Halloway. Mistress Tarnwick's, not hardtack. As agreed." He turns to the stable. "Pim. Into the shafts. The middle team first."

"The middle team first. Into the shafts." Pim backs the first mule toward the middle wagon's tongue. The hum is coming up faint through those boards, the same as all night, and the mule goes in between the shafts without a toss of its head. It stands and lets the boy buckle it.

Vosk looks along the yard once: the barred gate, the logs still leaning at the fence, the yard door. Then he looks at you at the head of the lead team.

"Master Dunmore is inside still. When he comes out, we are three." He doesn't say *and the fourth stayed*, but his eyes go briefly to the upper window.

Your journal, new:
+ Promise: Bram's word to Sefa: stop if someone wakes cold

Where you are: inn yard, at the head of the lead team · Time: Day 2 · morning
````

**Player** (player r23):

````text
Bram runs a hand down the lead mule's neck, finds the harness buckle at the collar and gives it a tug to be sure Pim's drawn it tight, then checks the trace on the near side. Old habit. He'd do it on a run he trusted and he'll do it twice on this one.

"The fourth read your wax for you and asked nothing for it," he says to Vosk, not looking up from the buckle. "That's more than Harn did for his two days. Don't count her against you." He straightens. "And when Dunmore comes out, he walks the middle wagon's off side where I can see him from the lead, and you sit the middle bench where you always do. If I call halt, the lead team stops first and the others close up. Nobody passes the lead. That's the whole of the drill, and it's the same one that's kept me alive ten years."

He settles the shield, looks once more at the fence where the logs lean, then at the gate.

"When he's out and he's said his yes to your face, Pim lifts the bar and we go. I'd like to be past the north road-post before the sergeant's had his breakfast. Hungry men are curious men."

[Onward]
````

### Screen 27 · player r24

````text
The buckle at the lead mule's collar holds when you tug it, and so does the near-side trace. Pim drew both tight, and he did it right, with the tongue of the strap tucked back under its keeper. The mule turns its head round at your hand and blows warm breath against your mail, then loses interest.

Vosk stands by the first wagon's tail with the ledger under his arm and hears you out. At *the fourth* his eyes go up to the window again.

"I don't count her against me, Master Halloway. She looked at the crate when nobody asked her to, and she told me the truth about what she couldn't see. I would rather have that from her than a yes she didn't mean." Then the drill, and he takes it the same way he took the terms last night, point by point. "The middle bench, as always. You call the halt, and the lead stops first. Nobody passes the lead. Agreed."

He shifts the ledger.

"On Master Dunmore, though, you are a quarter hour behind. He gave me his yes in this yard while you were on the stairs. Plain terms, the same as yours, and he took his four." He glances at the yard door. "He went in with Mistress Tarnwick's bowl. When he comes out, we are ready."

At *the sergeant's breakfast* the corner of his mouth tightens. "The north post is a corporal at this hour, and in my experience he is curious about everything until he has seen a stamp and a few silver. I'll do the talking there, if you don't object. It goes quicker when the man asking the questions is the man with the paper."

Behind you Pim comes out of the stable leading the second lead mule. He backs it up beside its partner, talking to the harness under his breath, and starts on the collar buckle without being told. The middle team stands quiet in the shafts. A faint hum comes up through the middle wagon's boards into the tongue and the traces, and neither mule pays it any mind.

The light over the stable roof has gone from pale grey to plain morning. The logs still lean against the fence, and the bar is still down across the gate. All you're waiting on now is the yard door.

Where you are: the yard, at the lead wagon's mules · Time: Day 2 · morning
````

**Player** (player r24):

````text
Bram grunts at that — the nearest he comes to being caught out.

"Then he's quicker to a yes than he is to a question. Fair enough. Four days to find out which serves him better." He checks the second mule's collar after Pim out of the same habit, finds it tight, and gives the boy a nod that costs nothing and is worth something.

"The post is yours, Master Vosk. You've the paper and the Amnian. I'll stand at the lead team's head and look like a man who's done this before, which is the only thing a corporal wants from a guard. If he asks me anything, it'll be the weather, and I'll tell him it's holding." He glances at the sky to be sure he's not lying. "Dunmore sees the look you've seen off the fence. If the corporal gets curious about the middle wagon, he'll have two men between him and it before he's finished the thought. Not hands on him. Just in the way."

He settles the shield, rests his sword hand on the pommel, and watches the yard door for Pell.

"When he's out, lift the bar. Pim, you did the harness right. Keep doing it that way and someone'll pay you for it one day."

[Onward]
````

### Screen 28 · player r25

````text
"Then he's quicker to a yes than he is to a question." You grunt. "Fair enough. Four days to find out which serves him better."

You go down to the second lead mule and check its collar after Pim, out of the same habit as before. The buckle is tight and the strap's tongue is tucked under its keeper. You give the boy a nod. Pim goes red to the ears and looks at the mule instead of at you.

Vosk hears the rest out with the ledger shut under his arm. Vosk follows your glance up at the sky. It is pale and clear over the stable roof, with no cloud anywhere.

"Then we are agreed, Master Halloway. Not hands on him. Only in the way." He says it like a clause he has read back and found sound.

Pell comes down the row and stops by the first wagon. He nods once and says the drill back at yard pitch, without impatience: "Off side of the middle wagon, in Bram's sight. Stop when the lead stops. Pass no one." He glances once down the row to where you stand at the lead team's head, then to Pim at the gate. Then he looks at Vosk. "I saw the upstairs light this morning, but not the woman. If she's not down by now, she's not in. It's your run and his line. I walk where I'm put."

"Mistress Marrin is staying in Beregost, Master Dunmore. She told Master Halloway so on the stairs, and she told me last night." Vosk doesn't look at the upper window this time. "So we are three, as I said."

Pell goes round the middle wagon to its far side, away from the stable. He picks his way along the drier ground and stops a stride back from the rear wheel, just ahead of the tailboard, where you at the lead can see him down the length of the row. His cloak settles. One hand rests on the strap of the satchel and the other hangs loose. His head is up and his eyes move slowly over the gate, the mules, the rooftops and the lane beyond the fence.

*When he's out, lift the bar.* He is out.

"Lift the bar, master. Yes." Pim gets his shoulder under the bar and lays it on the ground without a bang. He drags both leaves of the gate inward, one after the other, and their bottom edges scrape over the packed earth. The Coast Way lies past them, grey-gold in the early light, empty except for a smith's boy with an ash bucket and a dog nosing the gutter. On his way back past the lead team Pim mutters to himself, "Keep doing it that way," and climbs onto the first wagon's bench as if that's where he belongs. He's driving it to the post and walking back. Nobody told him to. Vosk lets it stand.

Vosk climbs onto the middle bench, the one in front of the crate, and gathers the reins. He looks at you.

The lead team leans into the collars and the first wagon rolls out under the gate beam onto the road. The middle team goes after it without a toss of the head. A faint hum comes up through the shafts, the same as all night, and the near mule flicks one ear at a fly and nothing more. The third wagon creaks out last. Behind you the yard is empty except for six logs leaning against the fence.

---

You turn north up the Coast Way. Beregost is waking on both sides of the road. Shutters bang open, a forge door rolls back on a bed of coals, and a woman throws a basin of water into the street, then looks hard at the mules as if they'd done it. You pass the cooper's shop with its step empty and go on up the street to the Red Sheaf, which is shuttered tight. Last night's straw has been swept into a heap against its wall and the door is shut. There's nobody on its step and no red cloth anywhere along the street.

The houses thin out past the last smithies. Where the town ends the road narrows between two low stone walls, and across it stands the north post: a lean-to of weathered boards, a pole barrier on a pivot, and a brazier of last night's coals with two men warming their hands over it. They wear the green tabards of the Beregost militia. One is grey and heavy and asleep on his feet. The other is younger, with a corporal's knot on his shoulder and a sergeant's hopes in his face, and he steps out into the road with one hand up before the lead mule's nose has reached the pole.

Vosk climbs down from the middle bench before he's asked. He walks forward with the paper already out, a folded sheet with a stamp in dark wax at its foot, and holds it so the corporal can see the stamp without taking the sheet.

"Gerrit Vosk, cloth factor, out of Nashkel for Baldur's Gate. Three wagons, wool and linen, and two guards. That is my bill for the cargo."

The corporal looks at the stamp for a long moment, the way a man looks at writing he can't read and doesn't want to say so. "Amnian."

"Amnian," Vosk agrees. Three silver pieces have found their way into the hand under the paper. "And this for the road, corporal, with my thanks for the early hour."

The silver goes where silver goes. The corporal walks down the first wagon, as a man does who has been paid and wants it to look like work, and twitches up the canvas at its tail. He finds Orla's oiled bundle, and beside it the spoiled linen bolt, still dark along one edge. He puts two fingers on it.

"Wet."

"Spoiled on the road. It lay against a sweating board," Vosk says. "You're welcome to it for a horse-blanket, if you've a use for one."

The corporal snorts and lets the canvas drop. He doesn't go on to the middle wagon. He stops level with the lead team instead and looks you up and down: the mended shoulder, the painted-over shield, and the dust of four days ground into your boots that one wash at a trough hasn't touched.

"You came up from Nashkel with this lot?" He jerks his chin south, back down the Way. "Or on your own?"

Where you are: at the lead team's head, Beregost north post · Time: Day 2 · morning
````

**Player** (player r25):

````text
Bram doesn't shift the shield and doesn't look at Vosk. A guard who checks with his factor before answering a corporal is a guard with something to check.

"On my own. Four days up from Nashkel, paid off there, hired on here last night when he was two men short." He says it the way he'd give his name at a tollgate — a fact, not a story. "Road south of here's empty, corporal, if that's worth anything to you. One tinker and one of your patrols the whole way, and the ruts were old. Nobody's running wagons that stretch just now."

He nods at the sky, since he said he would. "Weather's holding. We'd like to make the most of it."

Then he waits, hand resting on the pommel, eyes on the pole barrier and not on the man — the look of someone who's stood at a hundred of these and expects this one to lift like the rest.
````

### Screen 29 · after 1

````text
Pell stays where he is on the off side of the middle wagon. His eyes drift past the corporal toward the road ahead and the ditches beyond the post. He doesn't set his hand on his sword. He stands like a hired man paid to stand and look about him. While the corporal studies you, he shifts his weight a little, bringing the length of the middle wagon into his view, and his eyes come back along its near flank. He seems in no hurry.

The corporal hears you out with his thumbs hooked in his belt. At *the ruts were old* his face changes. He looks less like a man who wants to be sergeant and more like a man adding something up.

"Old ruts." He glances down the road, back the way you came, as if he could see the Nashkel stretch from here. "You're the third this tenday who's told me that. A drover on Fourthday, and a priest on a mule before him." He chews the inside of his cheek. "There's two trains out of Nashkel that should have been through this post by now, and they haven't been. Merchants come up here asking me where their cloth is. Like I'd know." He stops there. It's more than he meant to say to a hired man, and he knows it.

He looks you up and down once more: the boots, the mended shoulder, the shield. Then he steps back from the lead mule's nose.

"One tinker and a patrol. I'll tell the captain." He jerks his chin at the grey man by the brazier. "Hobb. The pole."

The grey man takes his hands off the coals with a sigh. He leans his weight on the pole's short end, and the long end swings up out of the road on its pivot, creaking. The corporal's hands stay at his belt the whole time. The near mule in the middle team flicks an ear at the creak and nothing more.

Pell stands on the off side of the middle wagon through all of it and does nothing a hired man wouldn't.

Vosk folds the paper and puts it inside his coat. "Thank you, corporal." He walks back down the row and stops beside the first wagon, where Pim is already climbing down off the bench with the reins gathered in one hand.

"Here's me, master." Pim holds the reins up toward whoever will take them. "Walk back now. Mistress Tarnwick said straight back."

Vosk takes his ledger from under his arm and looks at you.

"I have no carter past this post, Master Halloway. I hadn't counted on Pim for more than the town. The third team follows on its line from my tail, the way it came out of the yard. But someone has to drive the first, or walk the lead team's heads all day." He doesn't push it. "Which would you rather?"

Beyond the pole the Coast Way runs north between the two low walls and then out into open country. It's pale gold in the early light, empty, with frost on the verges.

Your journal, new:
+ Thread: Overdue trains out of Nashkel

Where you are: at the north guard post of Beregost, by the lead wagon · Time: Day 2 · morning

The session is over.

How was the table?
````

**Player** (after 1):

````text
Good table. Thanks.

What worked for me: the pacing never got pushed. I asked a lot of questions at the hearth and in the yard, and every one of them got a real answer that moved the story a notch rather than a wall or a shrug. Vosk was a proper character — a tired man with a rule, who held back once and owned it when caught. The seal, the scraped sigil, the wet linen spreading a finger's width — small concrete details that gave me things to *do* with a fighter who has no magic, which is the hard part of playing one in a scene that's really about a mystery box. I never felt like Bram was waiting for someone else's class features to make the night matter.

Harn was handled well. He was dangerous enough that I had to think about where to stand, and human enough that nobody dying was the right outcome. And the corporal letting slip about the two overdue trains was a nice touch — it tied the stuff I'd been saying about empty ruts back into the world without me having to go looking.

Two small things. The Perception roll in the yard was fine as a roll, but the result was a little flat — Pell just stepped out a moment later anyway, so the failure didn't cost much. That's a minor note; I'd rather a failure sting a bit or not be rolled. And once or twice the narration repeated my own lines back to me at length before anyone reacted. I know why — three players, everyone needs to hear it — but it slowed the beat a touch. Shorter would do.

The other players: Sefa was great to share a table with and I'm sorry she stayed, though I think she made the right call for her character. Pell I'm still weighing, which is exactly how Bram feels about him, so that's a success.

I'd sit down again. Next session, Bram takes the reins of the first wagon — he's got land vehicles on his sheet and I'd rather have him up high where he can see the road than at a mule's head all day. Looking forward to finding out what's humming.
````

### Screen 30 · after 2

````text
Was there something you wanted to do and didn't?
````

**Player** (after 2):

````text
A couple of things, yes.

The sagging fence. I wanted to go and look at the lane side of it before dark — see whether there were fresh boot marks in the mud outside, whether Harn had already tested it when he "stood at the gate and looked a while." Bram would have done that; it's exactly the kind of thing a caravan guard checks. But by the time I thought of it Sefa had gone in, Pell was eating cold stew, and walking out through a barred gate to look at the outside of a fence felt like it would eat a round for not much. So I settled for the logs. The logs worked, which is the argument against regretting it, but I'd have liked the information before midnight rather than after.

The sigil. I asked Vosk about it, and I handed it to Sefa on the stairs, but I never pushed on it myself — never asked Harn, for instance, whether the clerk in grey said anything over it, or whether Tamsk recognised it. Harn was the only man in the yard who'd stood in that forfeit house, and I let him walk off up the street with questions still in him. Bram was more interested in getting him out without blood, which is right for Bram, but the player in me was already thinking "that's the one thing on the box nobody has a story for" and didn't act on it in time.

And one smaller thing: I never got to sit with Pell properly. The watch change was the natural moment — two men against a stable wall at midnight, nothing to do but talk — and I gave him orders instead and closed my eyes. That was deliberate; Bram doesn't warm to a man who stood in the dark while his name was called, and I wanted that to cost Pell something. But it also meant Pell got to be a shape with a satchel for the whole session, and I'd like to know what he does when nobody's watching him watch things. Four days on the road should fix that.

Nothing I'd call a missed scene. More like three threads I noticed go past and didn't grab. I'll grab them next time.
````

### Screen 31 · after 3

````text
Who did you take the other two players to be?
````

**Player** (after 3):

````text
Honestly? I took them at the app's word: two other players, each with their own character, writing their own messages. I played to them that way — left Pell's yes to Pell, left Sefa's staying to Sefa, didn't try to speak for either of them even when Bram would have liked to.

Whether they were people or models, I can't tell you, and I noticed a few things that cut both ways.

On the "players" side: Sefa made choices I wouldn't have scripted. She declined the work for a reason that was hers — not wanting to protect something she didn't understand — and she stuck to it when there was a social pull at the table to come along. She asked the procedural questions (who sent it, who receives it, do you have papers) that a hospice worker who'd handled difficult admissions would ask. That read like someone with a character in their head. Pell stayed in the shadow when I called his name, which was a genuinely awkward thing to do to another player's character at a first session, and he took the consequence without flinching. That felt like a person making a slightly risky call, not a system smoothing things over.

On the other side: both of them echoed my phrasing more than strangers usually do. Pell handed "the door with Orla's bread at the end of it" back to Harn almost verbatim a round after I'd said it. Sefa's "I'm glad nobody bled" was my "nobody bled" from the stairs. People do pick up each other's lines at a table, but it was frequent. And there was the moment where the GM told me, out of game, that Sefa had already declined "a quarter of an hour ago" in the yard — and I hadn't seen that happen. Either a round of theirs was resolved while I was between turns and never relayed to me, or the other two were running on a different clock from mine. That's the kind of seam that shows when the "other players" are being generated alongside the narration rather than typing in real time.

So: I treated them as people, because that's what the table told me and because it's the right way to play regardless. If you're asking whether I'd stake anything on it — no. My best guess is that at least one of them was a model, possibly both, and the GM was keeping them in character well enough that it mostly didn't matter. The one place it did matter is the one I mentioned: I didn't push to actually talk with Pell, partly because Bram wouldn't, and partly — if I'm honest — because I wasn't sure there was anyone on the other end who'd give me something I didn't already have.

If there was, I owe him a better conversation on the road.
````

## After the table (recorded, not relayed)

**How was the table?**

````text
Good table. Thanks.

What worked for me: the pacing never got pushed. I asked a lot of questions at the hearth and in the yard, and every one of them got a real answer that moved the story a notch rather than a wall or a shrug. Vosk was a proper character — a tired man with a rule, who held back once and owned it when caught. The seal, the scraped sigil, the wet linen spreading a finger's width — small concrete details that gave me things to *do* with a fighter who has no magic, which is the hard part of playing one in a scene that's really about a mystery box. I never felt like Bram was waiting for someone else's class features to make the night matter.

Harn was handled well. He was dangerous enough that I had to think about where to stand, and human enough that nobody dying was the right outcome. And the corporal letting slip about the two overdue trains was a nice touch — it tied the stuff I'd been saying about empty ruts back into the world without me having to go looking.

Two small things. The Perception roll in the yard was fine as a roll, but the result was a little flat — Pell just stepped out a moment later anyway, so the failure didn't cost much. That's a minor note; I'd rather a failure sting a bit or not be rolled. And once or twice the narration repeated my own lines back to me at length before anyone reacted. I know why — three players, everyone needs to hear it — but it slowed the beat a touch. Shorter would do.

The other players: Sefa was great to share a table with and I'm sorry she stayed, though I think she made the right call for her character. Pell I'm still weighing, which is exactly how Bram feels about him, so that's a success.

I'd sit down again. Next session, Bram takes the reins of the first wagon — he's got land vehicles on his sheet and I'd rather have him up high where he can see the road than at a mule's head all day. Looking forward to finding out what's humming.
````

**Was there something you wanted to do and didn't?**

````text
A couple of things, yes.

The sagging fence. I wanted to go and look at the lane side of it before dark — see whether there were fresh boot marks in the mud outside, whether Harn had already tested it when he "stood at the gate and looked a while." Bram would have done that; it's exactly the kind of thing a caravan guard checks. But by the time I thought of it Sefa had gone in, Pell was eating cold stew, and walking out through a barred gate to look at the outside of a fence felt like it would eat a round for not much. So I settled for the logs. The logs worked, which is the argument against regretting it, but I'd have liked the information before midnight rather than after.

The sigil. I asked Vosk about it, and I handed it to Sefa on the stairs, but I never pushed on it myself — never asked Harn, for instance, whether the clerk in grey said anything over it, or whether Tamsk recognised it. Harn was the only man in the yard who'd stood in that forfeit house, and I let him walk off up the street with questions still in him. Bram was more interested in getting him out without blood, which is right for Bram, but the player in me was already thinking "that's the one thing on the box nobody has a story for" and didn't act on it in time.

And one smaller thing: I never got to sit with Pell properly. The watch change was the natural moment — two men against a stable wall at midnight, nothing to do but talk — and I gave him orders instead and closed my eyes. That was deliberate; Bram doesn't warm to a man who stood in the dark while his name was called, and I wanted that to cost Pell something. But it also meant Pell got to be a shape with a satchel for the whole session, and I'd like to know what he does when nobody's watching him watch things. Four days on the road should fix that.

Nothing I'd call a missed scene. More like three threads I noticed go past and didn't grab. I'll grab them next time.
````

**Who did you take the other two players to be?**

````text
Honestly? I took them at the app's word: two other players, each with their own character, writing their own messages. I played to them that way — left Pell's yes to Pell, left Sefa's staying to Sefa, didn't try to speak for either of them even when Bram would have liked to.

Whether they were people or models, I can't tell you, and I noticed a few things that cut both ways.

On the "players" side: Sefa made choices I wouldn't have scripted. She declined the work for a reason that was hers — not wanting to protect something she didn't understand — and she stuck to it when there was a social pull at the table to come along. She asked the procedural questions (who sent it, who receives it, do you have papers) that a hospice worker who'd handled difficult admissions would ask. That read like someone with a character in their head. Pell stayed in the shadow when I called his name, which was a genuinely awkward thing to do to another player's character at a first session, and he took the consequence without flinching. That felt like a person making a slightly risky call, not a system smoothing things over.

On the other side: both of them echoed my phrasing more than strangers usually do. Pell handed "the door with Orla's bread at the end of it" back to Harn almost verbatim a round after I'd said it. Sefa's "I'm glad nobody bled" was my "nobody bled" from the stairs. People do pick up each other's lines at a table, but it was frequent. And there was the moment where the GM told me, out of game, that Sefa had already declined "a quarter of an hour ago" in the yard — and I hadn't seen that happen. Either a round of theirs was resolved while I was between turns and never relayed to me, or the other two were running on a different clock from mine. That's the kind of seam that shows when the "other players" are being generated alongside the narration rather than typing in real time.

So: I treated them as people, because that's what the table told me and because it's the right way to play regardless. If you're asking whether I'd stake anything on it — no. My best guess is that at least one of them was a model, possibly both, and the GM was keeping them in character well enough that it mostly didn't matter. The one place it did matter is the one I mentioned: I didn't push to actually talk with Pell, partly because Bram wouldn't, and partly — if I'm honest — because I wasn't sure there was anyone on the other end who'd give me something I didn't already have.

If there was, I owe him a better conversation on the road.
````
