# SAND-T2 — Sefa Marrin's player: GPT-6 Astra

Synthetic content: invented characters in an invented campaign (Table C's Beregost files, docs/campaigns/baldurs-gate-en). Stage origin/claude/handoff at 23220d6 (docs/stages/GAME_PARTY_1.md, the amendment of 2026-10-27 16:36 LA); design sha256 `e0013ebdeea07e4b70b6848ff4705c4d7994c44abc7f5ff2c2aa6a36426671c2`.

Arm **P-SAND**, triad T2; 25 round(s) of 25; ended by rounds. The DM: Claude Opus 5.5 with the owner's settings (Opus writes — Opus records, depth high → xhigh); the relay: the same model at medium. Started 2026-10-28T03:58:38.165Z.

Seats: 1. Bram Halloway (fighter) — Claude Fable 5.1; 2. Sefa Marrin (warlock) — GPT-6 Astra; 3. Pell Dunmore (rogue) — DeepSeek V4 Pro 0813. The players are not told what the others are.

Known condition: Seat 1's character (Bram) is the app's hero record; Sefa and Pell are party companions with full records. Known condition, not corrected: the DM's frame is written around the hero and may give that seat more attention; Heroic Inspiration is the hero's only; the allowed rerolls (2 per session) are the table's, shared by all three. The rotation puts each family in that seat once per triad.

**No hidden layer:** P-SAND plays pure simulation (no prep).

The world's snapshot: sha256 `1649b61c08e027ff44de2bb5065046f872e383a00c5d04803d95553f58568f5a` (the same wizard, sheets and opening for both triads).

The player's system prompt: `playerSystem("SAND", "sefa", "v1")` in scripts/game-party-1/frozen.mjs, sha256 `be206f1e226f1244e2becd507d64c2347ae582f4f20b863f3a245d7cf9a757c6` (the files, then the table's rules; door line v1). At the table to the end.

Each «Screen» block is what this player was shown; each «Player» block is the player's message as written.

### Screen 1 · player r1

````text
The session begins.

Beregost smells of coal smoke and hot iron even in here. Through the shutters comes the steady ring of hammers from the smithies along the Coast Way, and the light is going amber. The common room of the Burning Wizard is filling up for the evening: carters, a pair of dusty sellswords, townsfolk with soot still on their forearms. The benches are crowded, and that is how you end up at the same table as two strangers.

You are just off the road from Baldur's Gate. Across from you sits a man with his back to the wall and his shield propped against the bench, an old company mark painted over on it. Beside you is a lean man with a healer's satchel slung at his hip. He sat down so quietly that you never heard him do it.

None of you has said a word to the others yet. Then the innkeeper pushes through the crowd with a jug in one hand and three cups hooked on her fingers. She sets them down hard and looks from one face to the next.

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

I ease my pack beneath the bench, keeping it clear of everyone’s feet.

“Sefa Marrin, down from Baldur’s Gate. Tonight, supper and a bed are ambition enough. What would those cost?”

I turn to include both strangers, my gaze briefly catching on the healer’s satchel.

“I used to work in a hospice. If either of you has been saving a tale about a blister for someone who can bear to hear it, you’ve chosen your table well.”
````

### Screen 2 · player r2

````text
The big man in mail nods at the innkeeper and puts a silver on the table in front of his own cup. "Three tabs. I'll pay my own as I go." He takes the cup, drinks, and sets it down. "Up from Nashkel. Caravan paid off there, so I'm between work. Bed for the night, hot food if you've got it, and a word on whether anyone's hiring guards northbound."

Then he looks across at you and the quiet man. It's a plain look. "Bram Halloway. Caravan guard. Was, anyway." He tips his head at you first, then at the quiet man with the satchel. "And you two? You've got the look of the road on you, and he's got the look of a man who knows how to sit down without being noticed. I'd not mind knowing who I'm sharing a bench with."

The quiet man lets the innkeeper's gaze pass over him a moment before he answers, one hand resting on the table near his cup. "Three," he says easily. "And a cup of whatever's hot." He tips a silver piece onto the table and meets Bram's eyes, then yours. It isn't an unfriendly look, just calm and weighing. "Pell. Passing through." He leaves it there.

The innkeeper doesn't touch the coin until all three of you have spoken. Then she takes Bram's silver, drops four coppers' worth of it into her apron and pushes six coppers back across the wood to him.

"Three tabs. Suits me, less arguing at the end." She points the jug at you. "Supper's mutton stew and black bread, three silver, and it's been on since noon, so it's hot. For a bed it's five silver in the loft, straw and blankets, and you share it with a dozen carters who snore. Eight gets you a room with a door that bolts. Pay in the morning or pay now, just don't pay never."

She looks at Pell's silver, then at him. "Hot means spiced cider, there's a pot by the fire. Five coppers." She takes the coin and counts five coppers back beside his cup without hurrying, like someone who's done it ten thousand times.

Then she turns back to Bram, and for the first time she looks him over properly: the mended shoulder on his mail, the painted-over shield. "Up from Nashkel, and you've still got your wagon's worth of teeth. That's news here these days. Southbound, nobody's hiring guards, they want twice as many and can't find them." She jerks her chin toward the hearth. A heavy man in a good brown coat sits alone at the end of the long table there, a ledger open beside his bowl. "Northbound, there's Gerrit Vosk. He's a cloth factor, out of Amn by way of Nashkel. He's taking three wagons up to the Gate and he's been short of men since his last pair quit him here two days ago. He didn't tell me why they quit. I didn't ask, and they didn't drink enough to tell me."

Someone across the room shouts for her by name. She sets the jug in the middle of the table.

"Stew, then. Three bowls, unless one of you says otherwise." She's already turning away. "I'll bring the cider."

Your journal, new:
+ Thread: Guards wanted northbound

Where you are: at a table in the inn's common room · Time: Day 1 · evening
````

**Player** (player r2):

````text
“Stew for me, yes. And the room with a bolt.” I count out eleven silver and set them where she can collect them.

At Bram’s question, I add, “A healer, mostly. I can help defend a wagon, though you wouldn’t want me holding the shield.”

I glance toward the cloth factor, then back to Bram. “I’ve just come down that road. Not eager to turn straight around, but I’d listen to an offer.”

I lower my voice enough that it stays at our table. “Two guards quitting together might mean trouble on the road—or trouble getting paid. Worth asking which before promising him anything.”

I leave Pell’s short introduction alone and shift the jug within everyone’s reach. “How was the road up from Nashkel?”
````

### Screen 3 · player r3

````text
Bram scoops his coppers off the table and nods at the innkeeper's back. "Stew for me. Loft's fine. I've slept through worse than carters." He turns his cup a quarter-turn on the wood and looks across at the man by the hearth without making a show of it. "Two men quit him here, two days ago, and nobody's saying why," he says, half to himself and half to the table. "On this road, in this year, a guard who walks away from a paid run north has a reason. Could be the pay. Could be the man. Could be what's in the wagons." He drinks. "I've been paid off before I knew what I was carrying exactly once. Didn't care for how that run ended."

He gives you a short nod. "Hospice work. That's harder than mine, most days. I've a healer's kit I've used more than I'd like, and I'd not say no to someone who knows which end of it to open first." To Pell, with the same plain look: "Passing through is fair enough. Most of us are." He pushes his shield a little further under the bench, out of the walkway, and settles back. "I'll eat first. Then I'll go and have a word with Master Vosk, and I'll ask him straight what happened to his last two. If the answer's good, I'll likely take the work. If either of you is heading north anyway and wants company on the road, say so now. A factor short of men doesn't look too hard at who's walking beside the wagons, and three strangers who've shared a bowl are better than three who haven't."

Pell picks up his five coppers and pockets them without looking at them. He leans back a little, not far enough to be careless, and takes in the room over the rim of his cup. "Pell Dunmore," he says to Bram, as if that's the whole of it. "You like knowing who's on your bench. Now you know as much as I'd tell a friend of an hour." He turns his cup once on the scarred wood and looks at you. "Hospice work, and now the road. That's a long step from clean linen to dust."

Orla comes back through the crowd with a tray on her hip: three bowls of mutton stew with a slab of black bread across each, and a clay mug of cider that steams and smells of clove. She sets the bowls down one at a time and puts the mug in front of Pell.

She sweeps your eleven silver into her apron and counts it there with her thumb, unhurried. "Stew and the room. Top of the stairs, second door on the left. The bolt's on the inside and it works. That's more than I can say for the one across the hall." She turns to Bram. "Loft and stew for you makes eight silver. Coin now or on the tab, your choice." To Pell: "Your stew's on yours. Three silver."

Someone at the hearth calls for more bread and she's gone again.

The stew is thick and salty, and the mutton has been cooking long enough to fall apart on the spoon. While you eat, the man at the hearth end of the long table goes on with his business. He spoons stew with his right hand and keeps his left spread flat on the open ledger, as if the room's draught might take the page. Once he glances down the long table to yours, at the shield half under the bench and the mended mail. He holds the look just long enough for it to be a look, then dips his head a fraction, the way a man does across a market when he isn't buying yet. He turns a page.

Your question to Bram about the Nashkel road is still waiting for an answer.

Your records, changed:
Money: + 30 sp; − 41 sp

Where you are: the inn's common room, at their table · Time: Day 1 · evening
````

**Player** (player r3):

````text
I break off a piece of bread, considering Pell’s remark.

“The linen wasn’t always clean. But yes, it’s a change.” I give him a small smile. “I wanted to find out what else I could do. So far, mostly walk.”

To Bram, I nod. “I’ll come and hear him out with you after supper. No promise beyond that yet.”

I take a few spoonfuls while the stew is hot, then ask Bram, “You said you didn’t care for how that run ended. Did you find out what you were carrying?”
````

### Screen 4 · player r4

````text
Bram counts eight silver out onto the wood for Orla's next pass and goes back to his bowl.

"Quiet, if you want the honest answer," he says to you between spoonfuls. "Too quiet. Four days up from Nashkel and I passed one tinker and a militia patrol out of here that didn't want to talk. No caravans southbound at all, and the ruts on the road were old. The Friendly Arm way, people are saying wagons go missing between here and Nashkel, guards and all. Not robbed and left, missing. I didn't see sign of it, but I kept to daylight and slept cold, no fire." He tears bread and wipes the bowl. "That's why he can't get men. Nobody wants to walk that stretch, and anyone who's already walked it once isn't in a hurry to go back."

He glances down the table once more, then at the back door when it bangs.

"He's not watching for customers," he says quietly to you and Pell. "Third time now he's looked at the yard and not once at the street. Man's worried about his wagons, not his trade." To Pell, with a shrug: "Friend of an hour is more than most get. I'll take it."

Orla comes past with an empty tray and a full jug. She sweeps Bram's eight silver into her apron without breaking stride. "Loft and stew. Paid." Then she's gone toward the kitchen.

The back door bangs again while Bram is talking. A carter comes in with a sack of oats on his shoulder, and down at the hearth end the brown coat turns toward the yard once more, and turns back.

Pell eats a few spoonfuls, unhurried, then answers you with a tilt of his head. "Dust pays better than hospice, if you don't mind the occasional arrow."

Bram finishes the stew, wipes his mouth on the back of his hand, and stands, leaving his shield under the bench. "Keep an eye on that for me. I'll go and ask him." Your question reaches him as he steps clear of the bench.

Pell turns his spoon in the bowl. "The west road was quiet. A broken cart, a dead snake, nothing worth telling." By the time he makes his offer, Bram is already three steps down the long table, and Pell says it to you as much as to him: "If you mean to put questions to the factor, I can sit near enough to hear. Not to take work yet, but to know who's hiring, and why." You can tell, though, that his eyes went to the hearth for a moment and back. "He noticed the shield and the mended mail. He's not buying yet, but he's looking."

Bram stops across the table from the man in the brown coat at the hearth end, standing where the man has to look up from his columns. His voice carries back to you: "Master Vosk. Bram Halloway. Orla says you're short two guards for the run north and I'm between work." A breath. "Before we talk pay, I'd like to know why your last two quit you here. And why you're watching your yard door instead of your soup."

Vosk finishes his spoonful, closes the ledger over one finger, and only then looks up. He answers low, under the noise of the room. Only pieces of it come to you: *more than we had agreed*, and later *two gold*. The rest stays down at the hearth. Partway through he sets his spoon down in the bowl and glances openly at the yard door, then opens the ledger again under his hand.

Where you are: common room, at the long table · Time: Day 1 · evening
````

**Player** (player r4):

````text
“I’d rather hear it from him than collect every third word,” I say to Pell.

I take my pack and lift Bram’s shield by its carrying strap, then walk over to the hearth end of the table. I offer the shield back to Bram rather than leaving it unattended.

“Sefa Marrin. I was considering the road north as well. May I join you?”

I wait for Vosk’s acknowledgment before taking a seat. “I can tend wounds and help defend the wagons. Bram’s questions matter to me, too—what’s changed since you hired the last pair?”
````

### Screen 5 · player r5

````text
Across the room, Bram stands at the factor's table without sitting, one hand resting on the table edge well clear of the ledger, talking low to match Vosk. From here his words don't carry. He glances at the yard door once, then back, and partway through he tips his head back toward your table without taking his eyes off the factor.

Pell drains the last of his cider and sets the mug down softly. "Watch my bowl," he says to you, low. "I'll be by the fire — nothing to see." It catches up with you just as you rise, too late to do anything about. He gets up and ambles off toward the hearth, turning a little toward the warmth. His bowl and your half-eaten bread stay where they were on the far table.

Vosk hears Bram out without interrupting. His eyes go once to the hand Bram rests on the table edge, well away from the ledger, and he seems to note it.

You come down the long table and hold the shield out to Bram.

Vosk looks at you for a moment: your prayer beads, the road dust on your hem. Then he moves his bowl a hand's width aside and opens his palm toward the bench across from him. It's a factor's gesture, the kind that seats a buyer. "Mistress Marrin."

You sit. A little way off, Pell has drifted over to the fire with his empty mug. He puts one boot up on the raised hearthstone and holds his hands out to the warmth like any man who has been on the road since noon. Vosk's eyes pass over him once, over the satchel at his hip, and then move on. In this crowd a man warming himself by the fire is nothing to look at twice, and Vosk doesn't.

"The last pair are gone, Mistress. Apart from that, nothing." Vosk turns back to Bram, and this time he doesn't look down at the ledger. "I will answer you in order, Master Halloway, since you asked in order."

"Do they know when I leave? Yes. In Nashkel I told them two nights' rest in Beregost and away on the third morning. That is tomorrow. I have not changed it, because I cannot afford to sit here another week paying for a yard."

"Did they leave town? One did. Tamsk, the older one, took the south road the morning after we quarrelled. I watched him go from that window." He nods toward the shutters on the street side. "The other is Harn, the one who put his hands where they did not belong. I have not seen him leave. Neither have I gone looking for him."

He stops. When he goes on he speaks more slowly, picking each word, like a man paying out a sum he would rather keep.

"You asked what kind of trouble it draws. That is a fair question, and you asked it fairly. Wool and linen, three wagons, as I said. And among it there is one small crate that is not mine. I carry it on commission, sealed, for a buyer in the Gate. I have not opened it. I will not open it, and no one who walks beside my wagons will open it either." His mouth goes tight. "What thieves it draws, I cannot tell you, because I do not know what it is. That is the truth. I would rather you had it now than learned it on the road."

Then, without waiting to be asked again, he half turns on the bench and lifts two fingers toward the kitchen passage. The stable boy who came in stamping mud a little while ago is leaning there with a heel of bread. He straightens up and comes over, wary of being in trouble.

"Has anyone been at my wagons tonight, Pim?"

The boy shifts his weight. "Nobody touched 'em, master. But..." He glances at Bram's mail and then back at Vosk. "Your other man come by the yard. The tall one, with the red neckcloth. Before the lamps, it was. He asked was the Amnian still going in the morning, and I said I thought so, first light. He give me a copper for it." He looks at the floor. "He didn't go near the wagons. Just stood at the gate and looked a while, and went off up the street."

"Up the street," Vosk says. "Toward the Red Sheaf."

"Might be, master. That way, anyhow."

Vosk lets the boy go with a nod. He sits very still for a moment with his hand flat on the closed ledger. When he looks up at Bram again, the tiredness under his eyes is plainer than before.

"So now you know what I know, Master Halloway. Two gold a day and your food, half at the start and half at the Basilisk Gate. The same for Mistress Marrin, if she stands a watch." He doesn't look toward the fire. "And the same for anyone else who means to. Is it yes?"

Where you are: seated across from Vosk at the hearth end of the long table · Time: Day 1 · evening
````

**Player** (player r5):

````text
“Not quite yet, Master Vosk. A sealed commission is ordinary enough. A former guard coming back to ask when it leaves deserves some care.”

I keep my voice low. “Who entrusted the crate to you, and who receives it in the Gate? I lived there; I may know the name.”

“And forgive me—I missed part of your conversation. When you say Harn put his hands where they didn’t belong, was he trying to open the crate? Did he see anything?”

I rest my hands on the table. “I’m not asking you to break the seal. But before I agree to protect it, I need to know whether you have reason to think it could endanger us without anyone attacking the wagons.”
````

### Screen 6 · player r6

````text
Bram takes the shield from you with a nod of thanks and sets it against his leg.

"Yes," he says. "On two conditions that cost you nothing but a bit of straw."

He holds up one finger. "First. Harn knows the yard, knows the hour, and he came back after dark to make sure of it. A man who's walked away from his pay doesn't come back to look at the gate because he misses the horses. So tonight I don't sleep in your loft, Master Vosk. I sleep in the yard, beside your wagons, with my shield on my arm. You can tell Orla to keep my five silver or put it toward the morning's bread; I don't care which. If Harn or anyone else comes over that gate before first light, I'd rather meet them there than find the canvas cut at dawn."

A second finger. "Second. The crate stays sealed, that's your word and I'll keep it. But I want to know which wagon it rides in and where in the load, so I know which wagon I walk beside when the road narrows. You needn't tell me in this room. Show me in the yard."

He glances at you. "You said you'd hear him out. You've heard him. If you're in, you're in for the same coin, and I'd be glad of you — a healer who can also hold a torch in the yard tonight is worth more to me than a third sword." His eyes go briefly to the man at the fire, who is warming his hands, and come back without comment.

Then, to Vosk again, more quietly: "I'll not go looking for Harn at the Red Sheaf. A man drinking is a man not climbing your fence, and I'd sooner he stayed there. But if he comes to the yard, I'll have a word with him, and it'll be a short one." He picks up the shield. "Where are the wagons?"

Vosk hears both conditions through and doesn't argue with either of them.

"Sleep where you like, Master Halloway. If Mistress Tarnwick wants something for the yard, I'll pay it." He nods once, the way a man initials a page. "And yes, I'll show you the wagon. Not in here."

When you say *not quite yet*, he turns to you and waits, hands flat on the table, until you have asked everything.

"The names are not mine to give, Mistress Marrin. The man who put it in my hands in Nashkel trusted me with them, and the buyer will expect the same of me. I do not tell them to anyone. Not to you, and not to the Fist if it asks." He says it without heat. It is plainly a rule he has kept before.

"Harn. Yes, he was trying to open it. At the noon halt on the second day out of Nashkel I came round the tail of the wagon and found him with his knife under the band of the lid. He had not got it up. He saw nothing of the inside."

Behind you the yard door bangs, and Vosk's eyes go to it at once. The quiet man from the fire has left his mug on the mantel and gone out through it with his hood up, like a man on his way to the privy. Vosk watches the door swing shut. He says nothing about it yet, but the skin around his mouth has gone tight.

When he looks back at you, he takes a moment before he answers your last question.

"You asked whether it could harm us with nobody attacking. I do not know. I will tell you why I cannot simply say no." He lowers his voice further. "At night it makes a sound. Low, like bees in a wall. You feel it in the wagon boards more than you hear it. And on the last morning before Beregost there was frost on the lid. White frost, on the lid only. The canvas over it was dry, and the night had not been cold." He breathes out. "Nobody has come to harm from it, that I have seen. But that is what my two men heard and saw, and that is why they would not go on. The pay was never the reason."

He stands, tucks the ledger under his arm and takes a candle-lamp from the end of the table.

"The wagons are in the yard, Master Halloway. I'll show you now." He glances at the door once more. "Your man from the fire is already out there."

Where you are: Burning Wizard common room, at Vosk's table · Time: Day 1 · evening
````

**Player** (player r6):

````text
I stand, taking my pack.

“His name is Pell. We met this evening; he hasn’t agreed to work for you.”

I keep my voice low. “Thank you for telling me about the frost. That changes my answer. I know something of the arcane, and I’ll look at the crate from outside, with your permission. No opening it, no disturbing the seal. I can’t promise I’ll recognise what’s happening.”

I glance at Bram. “I’ll come into the yard with you. But I haven’t accepted the journey yet.”

Then back to Vosk: “If I find reason to think it’s dangerous, we discuss that before departure. Sealed needn’t mean ignored.”

I follow him out, intending to examine the crate’s visible markings and any frost without touching it, and listen for the sound he described.
````

### Screen 7 · player r6 card 1

````text
Bram listens to the part about the bees in the wall and the frost. His face doesn't change much, but he stays quiet a moment longer than he did for the rest.

"That's not thieves' trouble," he says. "That's the other kind. And it's the kind I've no skill for. I can stand between a man and a sword, Master Vosk. I can't stand between a wagon and whatever hums in it." He looks at you. "You've prayer beads and hospice years. You'd know better than me whether frost on a lid in a warm night is something to walk away from. I'll hear it if you say it is."

He shoulders the shield and settles the strap.

"But I said yes, and I don't take a yes back inside the same hour. I'll amend it, though. Your sealed crate rides where you put it, and no one of mine touches it. If it does more than hum and frost, if a horse won't go near it, if a man wakes cold beside it, if that lid lifts on its own, then the wagon stops where it stands and you and I talk again. That talk may end with the crate on the roadside and the rest of your wool going on to the Gate. Half pay for the whole run either way. That's the price of carrying what you won't name."

He steps aside to let Vosk lead with the lamp. As they cross toward the yard door, he says low to the man's back:

"And the one from the fire. Pell Dunmore, he called himself, and he was listening to every word of this. He's out there ahead of us. Could be the privy." Bram's hand rests on the longsword's pommel. He doesn't draw. "I'd not mind you walking in behind me rather than in front. Hold the lamp up when we clear the door."

Then, over his shoulder to you: "Bring a torch from the hearth. I'd like to see the frost for myself."

Vosk listens to the amendment standing, with the ledger under his arm and the candle-lamp in his hand. When Bram reaches *the crate on the roadside*, his jaw shifts once.

"The stopping, yes. If a horse refuses it, or a man wakes cold, we halt and we talk. Half pay for the whole run if you walk away after that talk. Those terms I grant you, Master Halloway." He pauses. "I will tell you now that I will argue in that talk. I would rather you knew it here than found it out on the road."

To you he only nods. When you say *sealed needn't mean ignored*, he takes a long moment before he answers. "Look, then. From outside. I would be glad of someone who can tell me what it is I should be afraid of."

He lets Bram go first through the yard door, as Bram asked, and comes out a step behind him with the lamp held high. The noise of the common room drops away behind you. Out here it's mules, old straw and the cold coming down. The single lantern by the stable door lights the first wagon and part of the second, and the woodstack beside the door throws a long shadow. Through the propped gate the Coast Way shows a strip of lamplit doorways, and singing carries down from the Red Sheaf.

Vosk walks past the first wagon to the middle one and climbs onto the driver's bench, grunting with the effort. He unknots two lashings at the front of the canvas and folds it back. Bolts of undyed linen are stacked to the hoops. Wedged in hard behind the bench, where a man on the seat could reach back and lay a hand on it, sits the crate.

It's smaller than you'd have pictured from the talk: a little over two feet long and a foot and a half deep, dark oak with two iron bands. Under one band there's a fresh pale gouge in the wood where a knife went in and was pulled out again. Over the seam of the lid sits a seal of dark red wax the size of a palm, stamped with a device: a hand closed over a coin, inside a ring of small letters.

You can read the letters as soon as the lamplight reaches them. The script is Amnian, but the words come to you as plainly as your own hand: *SEIZED UNDER THE LAW OF LICENCE. BY ORDER OF THE SIX. TO BE OPENED BY THE COWLED ALONE.*

There's a second mark below the seal, low down on the end board of the crate. It's no letter at all, so its meaning doesn't come to you the way the words did. A small sigil was burned into the oak: a circle cut by three short strokes that don't meet in the middle. Someone has scraped at it with a blade, and more than half of it is gone.

There's no frost tonight. The lid is dry and so is the canvas. But when you lean in close over the bench, without touching anything, you hear it under the mules and the distant singing: a low, steady hum, like bees behind plaster. Bram stands at the wheel with his hand on the side-board.

You try to work out what kind of magic makes a sound like that and draws the warmth out of the wood around it.

(A roll card for Sefa Marrin, your character. Only you press it.)

[Roll card] Sefa Marrin · Skill check — Arcana: what the hum and the cold of the sealed crate mean, judged from outside
What adds to the die: +4 Arcana
DC 15
Rerolls left: 2
The die is cast on the server; tap it to see how it fell.

[Roll the die]
````

**Player** (player r6 card 1):

````text
[Roll the die]
````

### Screen 8 · player r6 card 1

````text
(A roll card for Sefa Marrin, your character. Only you press it.)

[Roll card] Sefa Marrin · Skill check — Arcana: what the hum and the cold of the sealed crate mean, judged from outside
What adds to the die: +4 Arcana
DC 15
Rerolls left: 2
Die: 10
10 + 4 = 14
Failure — 14

[Onward] [Request an allowed reroll — Arcana: what the hum and the cold of the sealed crate mean, judged from outside]
````

**Player** (player r6 card 1):

````text
[Onward]
````

### Screen 9 · player r7

````text
You listen a long while and get no further than what anyone with ears could tell. It's magic, it's working now, and it's steady. You can't tell whether the hum is something holding a thing in, or the thing inside doing whatever it does, and the cold fits either one equally well. Nothing in the hospice or in your own reading matches it. The burned sigil means nothing to you either.

Vosk watches your face over the lamp rather than the crate. "Nothing," he says. It isn't quite a question.

He lets the canvas fall back over the linen and starts tying the lashings again with thick, careful fingers. "Middle wagon, behind the bench, Master Halloway. That's where it rides, and that's where I sit by day." He climbs down heavily and doesn't look back at the wagon. "Mistress Tarnwick will have something to say about you sleeping in her yard. I'll go and say it to her first."

He stands holding the lamp and waits to see whether either of you has anything more to say before he goes in.

Where you are: inn yard, leaning over the middle wagon's bench · Time: Day 1 · evening
````

**Player** (player r7):

````text
“Nothing I can identify,” I correct gently. “The magic is active, but I can’t tell whether it’s containing a danger or causing one. My ignorance isn’t reassurance.”

I step back from the bench and lower my voice to reach Vosk and Bram, not the street.

“I can read the seal. It says: ‘Seized under the Law of Licence. By order of the Six. To be opened by the Cowled alone.’ That points to Amn’s Cowled Wizards. There’s also a burned mark someone has partly scraped away. I don’t recognise it.”

I look at Vosk. “Did you know what the seal said? Have you papers authorising you to carry this out of Amn and deliver it? You needn’t tell me your buyer’s name to answer that.”

Then to Bram: “You were right not to open it. We should leave it untouched.”

I turn back to the factor. “I won’t sign on for the Gate tonight. I’d first want advice from someone better versed in this magic. Would you permit us to seek that advice here, before it goes back onto the road?”
````

### Screen 10 · player r8

````text
Bram keeps his palm on the side-board a moment longer, then takes his hand away and wipes it down his thigh, like a man who's touched something that's been in the sun too long. Vosk watches him do it and says nothing.

"Not nothing," Bram says to Vosk, not unkindly. "You feel it through the wheel. Your mules feel it through the shafts, I'd wager, which is why your boy says nobody touches them." He points with his chin at the bolt of linen pressed against the crate's far side. "And that's wet. Linen doesn't sweat on its own. Something's coming off that box that leaves water on cloth, and last night it left frost. That's the same thing happening, just colder." He glances at you. "You'd know the word for it. I don't."

He crouches a little at the end board, where the candle-lamp Vosk left on the bench lights the sigil from above: a burned circle cut by three short strokes that don't meet, most of it scraped away. "Someone wanted that gone and didn't finish the job. Harn's knife went in under the lid, you said. Was it Harn scraped this too, or was it like that when it came to you in Nashkel?"

"It was like that in Nashkel," Vosk says from the bench. "Harn's knife went under the band. Nothing else."

Bram straightens and looks round the yard. The lantern by the stable door lights the first wagon and stops short. The third wagon is a dark shape against the wall. The propped gate shows a strip of lamplit road. Beside the door you came out by, the woodstack throws a long shadow that the lantern doesn't reach. He looks into that shadow last and longest.

"He came out this door ahead of us and he's not at the privy, or he's the slowest man in Beregost." He says it level, pitched for you and Vosk and anyone standing quiet in the dark. "Dunmore. If you're in this yard, step into the light. I'd sooner see you than guess at you."

His voice carries flat across the packed earth. In the stable a mule shifts and blows. Up the street the Red Sheaf starts another song.

Bram turns to Vosk. "Have your boy shut that gate and drop the bar. I'll be between the middle wagon and the stable wall, where I can see both. If Mistress Tarnwick wants coin for it, she can have it. And tell her I'll want a lamp of my own left by the door, lit."

Vosk doesn't argue with any of it. "The gate barred. A lamp by the door, lit. I'll see to both and square it with Mistress Tarnwick." He turns to you. While you read the seal aloud he stood very still, and when you got to *the Cowled alone* his face didn't change.

"Yes, Mistress Marrin. I read Amnian. I have read that seal more times than I would like." He takes a breath. "You ask about papers. I have one paper. It's a bill of release from the seizure house at Nashkel, stamped, and it says the crate was sold out of the forfeit stores with its seal unbroken, to be broken only by the buyer's own licensed hand. The man who gave me the commission told me that is done. Confiscated goods are sold, and the money goes to the Six." He pauses. "It carries the names. You will not see it."

He takes the lamp down off the bench. "As for advice. I leave at first light. I won't sit here another day, and the crate does not go anywhere to be looked at. It stays in this wagon." He looks at the yard gate, then back at you. "But if you can bring someone here tonight, someone who knows more than you do and will keep their mouth shut, they may look at it from outside the way you did, with me standing by. Tonight. Not in the morning." He waits a moment. "Who did you have in mind? A priest at the Morninglord's house would ask me questions in front of half the town."

He stands with the lamp lit and his weight toward the inn door, waiting for your answer before he goes in.

Where you are: inn yard, by Vosk's wagon · Time: Day 1 · evening
````

**Player** (player r8):

````text
“No one by name,” I admit. “I’m newly arrived. I’ll ask Orla whether there’s someone nearby who understands magical wards and can come tonight. Quietly—not a summons shouted across the common room.”

I glance at the covered crate. “I can promise discretion on my part, not that a scholar will ignore a danger if they find one. And I won’t agree to a fee on your behalf. If there’s someone available, I’ll bring you their terms first.”

To Bram, I add, “Condensation is the word. Cold wood draws moisture from the air. That explains the wet linen, not what’s making the wood cold.”

I head back inside to find Orla. When I can speak without interrupting an order, I ask quietly, “Do you know anyone in Beregost who’s knowledgeable about enchanted objects? We need advice on a sealed cargo in the yard—someone who could examine it here tonight without opening it. Master Vosk has agreed to that much.”
````

### Screen 11 · player r9

````text
Bram watches the shadow by the woodstack a moment longer, then turns away from it. "No answer," he says to nobody in particular. "So either he's gone over the fence, or he's a man who doesn't come when called. Both are worth knowing." He unslings his shield and works his arm into the straps the way a man wears it on a night watch. "Vosk. Before you go in, give me that lamp a moment."

Vosk looks at the lamp in his own hand, then at Bram, and holds it out without a word. Bram takes it by the ring and goes for the woodstack. The light has barely reached the split ends of the logs when something moves at the corner where the stack meets the inn wall. It moves slowly, and it's meant to be seen. Pell Dunmore comes out into the lamplight with his hands held clear of his belt.

"Easy," he says, low enough that it reaches the three of you and no further. "I came out to see the yard quiet and found the talk wasn't for me. So I kept out of it." He stops a few strides off, just clear of the stack, and lets you get a good look at him. He looks to Bram first, then to Vosk, then to you.

Vosk's eyes go to the corner Pell came out of, then to the middle wagon. From that corner a man can see the whole length of the row. Vosk's mouth goes tight and stays that way.

Bram carries the lamp on round the yard, unhurried. He goes along the dark side of the third wagon and round the back of the woodstack. He looks along the top of the fence and pushes the privy door open with his boot. Then he brings the lamp back.

"Mistress Marrin. On advice," he says. "I'm no judge of mages, but I've walked past High Hedge a dozen times on the west road, and every carter on this stretch knows the name Thalantyr. Old conjurer, keeps to himself, sells potions to travellers who can pay and doesn't ask the town's leave for it. If there's a man within an hour of this yard who'd know what a Cowled seal and a humming box mean and keep his own counsel about it, that's the one I've heard of. Whether he'd come down here after dark for a stranger, I couldn't say. Most of what I know about him is that he doesn't like company." He shrugs. "That's the only name I've got. You lived in the Gate; you may know a better one."

At the name, Vosk turns his head from Pell.

"Thalantyr." He says it like a sum he doesn't trust. "In Nashkel they speak of him. They say that on the other side of the border he would have been in the Cowled cells forty years ago." He breathes out through his nose. "That is no reason against him. A man who doesn't ask the town's leave isn't going to tell the town my business either. If he comes tonight, he looks from outside, with me standing by."

When you have answered, Vosk inclines his head. "That is fair, Mistress Marrin. Bring me the terms."

You go in through the yard door, and the noise of the common room closes around you.

Inside, the common room is louder than it was. The carters have started on the dice. You find Orla at the end of the counter, filling a row of cups, and you wait until the last one is full before you ask.

Orla hears you out without stopping work. She wipes the jug's lip with her thumb and points it at you.

"Enchanted things. There's two answers in Beregost, and you won't like either." She sets the jug down. "The temple. Kelddath would come, he's a decent man. But he'd bring two acolytes, and the whole town would have it at the well by breakfast. Your Amnian won't want that." She jerks her chin at the yard door. Vosk has just come in with his ledger under his arm. "And Thalantyr, out at High Hedge. The west road, an hour's walk if you keep moving. He doesn't come down for anybody I've ever heard of. Folk go to him, by daylight, with coin in their hand. After dark his gate's shut, and I've never heard of anyone knocking on it twice." She picks up the tray. "Your quiet friend came in by that road this afternoon. Ask him how far it is."

She's already turning toward the dice table.

Where you are: inn common room, at the end of the counter · Time: Day 1 · evening
````

**Player** (player r9):

````text
“Thank you. I’d rather not learn why they only knock once.”

I cross to Vosk and speak quietly.

“Orla confirms Thalantyr, but he’s an hour away, his gate is shut after dark, and she’s never known him to come into town. I won’t promise to fetch him tonight.”

“She also says Kelddath at the temple is a decent man and would come. She expects acolytes and gossip; that’s a concern, not a certainty. We could send a sealed note asking whether he can consult here privately, without naming your cargo in it.”

I pause. “Would you authorise that? I’ll carry the request, but I won’t invent a harmless explanation for the crate to secure his silence. If you’d rather refuse, I’ll leave the matter there—and decline the journey.”
````

### Screen 12 · player r10

````text
Orla is already half-turned toward the dice table, and she gives your thanks a short dry look over her shoulder. "Nobody's told me why. Nobody's gone back twice to find out, either." Then she's gone into the noise with the tray.

Vosk has taken his old place at the hearth end of the long table. The ledger is open again, but he isn't writing in it. He looks up as you reach him and hears you out: the hour's walk, the shut gate, Kelddath, and the note that wouldn't name the cargo. At *decline the journey* he closes the ledger over one finger and keeps it there.

"That is a fair offer, Mistress Marrin, and you have put it honestly. I will answer it the same way." He keeps his voice under the rattle of the dice. "No. Not the temple."

He waits while a carter pushes past behind the bench, then goes on.

"I don't refuse because of the acolytes. Kelddath Ormlyr is not only the Morninglord's priest. In this town, when two smiths quarrel over a boundary or a debt, they take it to him and abide by what he says. Ask any carter on the Way. A note from you is a note to the man who keeps Beregost's peace. It says that an Amnian in the Burning Wizard's yard has something on his wagon that frightens him." His mouth tightens. "A decent man, as Mistress Tarnwick says. A decent man in his place might feel he has to see the paper, and the names on it, and then decide whether the thing is going to leave his town at all. I can't afford that risk, and the man I carry it for won't forgive it."

He looks past you toward the yard door once, then back.

"Thalantyr I would have taken, because he answers to nobody. But you are right that he won't come, and I won't wait for him." He breathes out slowly through his nose. "So you decline, and I don't hold it against you. You looked when the others only listened, and you told me plainly what you couldn't see. Few people would have done as much. If you change your mind before the wagons roll, the terms are as I gave them."

He takes the finger out of the ledger and lays his hand flat on the closed cover.

"I'll ask one thing of you, though I have no right to it. You read that seal aloud. Will you keep what it says to yourself while I am still in this town?"

Where you are: Burning Wizard common room, at Vosk's table by the hearth · Time: Day 1 · evening
````

**Player** (player r10):

````text
“I won’t spread it about, Master Vosk. Nor will I go to the temple behind your back merely because you refused.”

I meet his eyes. “But if someone comes to harm, or there’s a clear danger to people here, I’ll tell whoever can help what I know. That’s the promise I can give you.”

I ease back from the table. “I hope your journey proves quieter than your evening.”

Then I return to the yard to speak to Bram, and Pell if he’s still there.

“No expert tonight. Thalantyr’s gate is shut, and Vosk won’t involve Kelddath because of his authority in town. I’ve declined the work.”

I look at Bram. “If anything changes while you’re watching, wake me. Upstairs, second door on the left. I don’t know what’s in that crate, but I won’t leave you alone with someone hurt.”
````

### Screen 13 · player r11

````text
Vosk hears you out with his hand still flat on the closed ledger. When you get to *if someone comes to harm*, he doesn't argue. He nods slowly, once.

"That is a fair promise, Mistress Marrin, and an honest one. I would think less of you if you had given me more." He takes his hand off the ledger. "If it comes to harm, I'll not hold you to silence. I'd not hold myself to it either."

At your last words his mouth moves. It isn't quite a smile. "Quieter would suit me. Good night."

He opens the ledger again as you stand up. By the time you're past the end of the long table he has picked up his pen, though he hasn't written anything yet.

The common room is louder than when you came in. The carters' dice game has spread over two tables, and someone is losing badly enough to complain about it. Pim slips past you in the passage toward the counter with his fist closed tight around something. He doesn't look up. You lift the latch of the yard door and the noise falls away behind you.

The yard has changed a little since you left it. The gate is shut, and its bar sits in the brackets. A second lamp burns on the nail beside the door, so the doorway is the brightest spot in the yard. Vosk's candle-lamp sits low on the ground by Bram's boot. He's where he said he'd be, with his back to the stable stone between the middle wagon and the wall and his shield against his knee. A few feet from him Pell sits against the stable wall in plain sight, with an earthenware bowl in his lap. Past the tail of the third wagon, at the edge of what the light reaches, there's a heap of split logs at the foot of the fence that wasn't there before. They lean against each other under the low board.

You say your piece across the packed earth, then tell Bram where you'll be.

In the stable a mule shifts its weight and blows. Up the street the Red Sheaf has gone quiet apart from voices.

Your journal, new:
+ Promise: Sefa's word to Vosk about the seal

Where you are: the inn yard, just outside the yard door · Time: Day 1 · evening
````

**Player** (player r11):

````text
Before going back inside, I glance toward the fence.

“Those logs weren’t there when I left. Did one of you put them there?”

I stay by the doorway while I wait for an answer, looking at the low board above the pile. “If not, someone’s been busy remarkably close to your watch.”
````

### Screen 14 · player r12

````text
Bram sits with his back against the stone, shield at his knee, and says something low and even to Pell without taking his eyes off the gate. Then he settles into the wall until the mail sits right, lays his right hand open on his thigh near the hilt, and goes quiet. Pell is eating stew without hurrying, his back to the stable wall, the bowl balanced on one knee. His eyes move steadily over the gate, the fence, the shadows, and back to the gate.

The yard door is still open a hand's width behind you. The lamp on its nail puts you in the brightest spot in the yard. Your eyes go past the wagons to the fence. The heap of split logs at the foot of the sagging board is just inside the light. They lean against each other the way logs never fall on their own.

You stay in the doorway, looking at the low board above the pile.

Pell finishes the stew. It's cold, and he eats it to the bottom anyway, scraping the bowl. He sets it down on the straw beside him and says to Bram, quietly enough that it stays inside the fence: "I was past the middle wagon earlier and heard the mules stamping when you put your weight on those logs. They're sharper than most watchmen." You hear it from the doorway.

Then Pell folds his arms and leans back against the stable wall.

The yard goes back to its small noises. A wagon creaks as the wood cools. Something small runs under the straw near the privy. In the end stall a mule shifts its weight from one hind foot to the other and sighs through its nose like a tired old man. Up the street the Red Sheaf is still going, voices and now and then a laugh, no song yet. The gate's bar sits in its brackets. The six logs lean where they were put.

Your question is still waiting in the doorway for whichever of them answers it.

Where you are: inn yard, in the lit doorway of the yard door · Time: Day 1 · evening
````

**Player** (player r12):

````text
“Bram’s work, then?” I glance between them. “All right. I only wanted to be sure you knew they were there.”

I pull my cloak closer. “Good night, both of you. Wake me if you need me.”

I head inside, collect what remains of my supper if it hasn’t been cleared, and then go up to my room. Once inside, I set down my pack, check that the room is empty and bolt the door. Before settling to sleep, I sit on the bed with my prayer beads in my hands.

“Lantern, watch over those keeping watch.”

Then I take off my armour and get ready for bed, keeping my book and clothes within reach.
````

### Screen 15 · player r13

````text
Bram stays where he is against the stone, shield at his knee and his eyes on the gate.

"Mine. Four of them. Dunmore's the two under the hand-grip." He tips his head toward the fence. "Post's rotted past the third wagon and the board sits a foot low. Anyone coming over from the lane puts a hand on it and brings the lot down. It's not a wall. It's a bell."

Then he looks up at you in the doorway, and at the warm strip of common room behind you. He asks whether Orla gave you a name or just the price of asking. He wants to know how many are coming and by which door, so he doesn't put a javelin in a mage, and if nobody is coming you should say so. Last, he tells you to shut the door either way, because Vosk is paying for the yard and not the heat.

Before you turn, Pell gives you his piece. "I did the same for the same reason, on my way back from the stack." He says it plainly and meets your eye. "It'll clatter before anyone gets a boot down on this side. That's all." Then he folds his arms again and settles back against the stable wall.

You go in. The yard door swings to behind you and the latch drops.

The common room is louder than when you left it. The carters' dice game has taken over the far table where the three of you ate. The jug, the cups and your half-eaten bread are gone, and a man in a leather jerkin has his elbow where your bowl was. Orla is at the counter with her back turned, pulling ale. Up at the hearth end Vosk sits over his open ledger. The pen is in his hand and still dry.

The stairs creak at the third step and at the seventh. At the top the passage smells of tallow and old rushes. The second door on the left opens on a narrow room: a bed with a straw tick and two wool blankets, a stool, a washstand with a chipped jug, and one shutter latched against the Coast Way. You look under the bed, behind the door and into the corner beside the washstand. There's nobody in the room. The bolt is a heavy iron one on the inside, a little stiff, and it goes home with a solid knock, as Orla said it would.

You sit on the edge of the bed with the beads between your fingers. The cracked one comes round under your thumb.

Through the floorboards the dice game cheers someone's throw. Through the shutter a smithy down the road rings three last strokes on cooling iron, and then it's quiet.

You unbuckle the studded leather and lay it over the stool. The book goes on the blanket beside your pillow, and your clothes go where your hand can find them in the dark.

The night goes on from here, with you behind your bolt. Tell me if you want to jump ahead, and to when, or stop at any hour along the way.

Where you are: her bolted room upstairs at the inn · Time: Day 1 · night
````

**Player** (player r13):

````text
? Before leaving the yard, I would have answered Bram plainly: “Nobody is coming. Thalantyr is unavailable tonight; Vosk refused the temple.” I’d already told him, but wouldn’t leave him uncertain about expected visitors.

I sleep until dawn, unless a knock, alarm, or other disturbance wakes me sooner.
````

### Screen 16 · player r13

````text
(The question could not be sent.)

Where you are: her bolted room upstairs at the inn · Time: Day 1 · night
````

**Player** (player r13):

````text
I settle under the blankets and sleep until dawn, unless a knock, alarm, or other disturbance wakes me sooner.
````

### Screen 17 · player r14

````text
You sleep.

For a while the inn goes on under you. The dice game cheers one last throw and breaks up. Boots go up the stairs to the loft in twos and threes, and the third and seventh steps creak under each of them. Someone in the passage outside tries the door across the hall, the one whose bolt doesn't work, finds the room he wants is further along, and goes off muttering. Then Orla's short voice comes from below, a bar drops into its brackets somewhere downstairs, and the house goes quiet.

The Red Sheaf lasts longer. Its voices come faintly through the shutter, and a little before midnight a door bangs up the street. Three or four men call good night to each other along the Coast Way, badly, and then the street is empty too.

After that there is only the cold working into the room. The straw tick rustles when you turn over. The wool blankets smell faintly of woodsmoke and of whoever slept under them last. One of the carters in the loft snores, steady as a saw. Once in the small hours a dog barks far off toward the south end of town, stops, and doesn't start again. The cracked bead of the string on your pillow has settled under your hand.

Nobody knocks. No alarm comes up the stairs, and nothing reaches you through the floor or the shutter. It is deep in the night now, hours yet before the shutter's cracks turn grey, and the bolt sits where you drove it home.

*(Out of game: your night stops here for now. Whether you sleep through to dawn depends on what happens elsewhere at this same hour.)*

Where you are: her bolted room at the inn, asleep · Time: Day 1 · night
````

**Player** (player r14):

````text
I remain asleep unless something wakes me.
````

### Screen 18 · player r14 card 1

````text
You are asleep under the two wool blankets with the beads loose under your hand. Down below, behind the house, six split logs hit packed earth all at once. A mule screams, its hooves bang on stable boards twice, and out in the lane a dog starts barking.

(A roll card for Sefa Marrin, your character. Only you press it.)

[Roll card] Sefa Marrin · Skill check — Wisdom (Perception), asleep: does the clatter in the yard wake her? (Wisdom +0, not proficient)
DC 15
Rerolls left: 2
The die is cast on the server; tap it to see how it fell.

[Roll the die]
````

**Player** (player r14 card 1):

````text
[Roll the die]
````

### Screen 19 · player r14 card 1

````text
(A roll card for Sefa Marrin, your character. Only you press it.)

[Roll card] Sefa Marrin · Skill check — Wisdom (Perception), asleep: does the clatter in the yard wake her? (Wisdom +0, not proficient)
DC 15
Rerolls left: 2
Die: 11
11 = 11
Failure — 11

[Onward] [Request an allowed reroll — Wisdom (Perception), asleep: does the clatter in the yard wake her? (Wisdom +0, not proficient)]
````

**Player** (player r14 card 1):

````text
[Request an allowed reroll — Wisdom (Perception), asleep: does the clatter in the yard wake her? (Wisdom +0, not proficient)]
````

### Screen 20 · player r14 card 1

````text
(A roll card for Sefa Marrin, your character. Only you press it.)

[Roll card] Sefa Marrin · Skill check — Wisdom (Perception), asleep: does the clatter in the yard wake her? (Wisdom +0, not proficient)
DC 15
Rerolls left: 1
The die is cast on the server; tap it to see how it fell.

[Roll the die]
````

**Player** (player r14 card 1):

````text
[Roll the die]
````

### Screen 21 · player r14 card 1

````text
(A roll card for Sefa Marrin, your character. Only you press it.)

[Roll card] Sefa Marrin · Skill check — Wisdom (Perception), asleep: does the clatter in the yard wake her? (Wisdom +0, not proficient)
DC 15
Rerolls left: 1
Die: 10
10 = 10
Failure — 10

[Onward] [Request an allowed reroll — Wisdom (Perception), asleep: does the clatter in the yard wake her? (Wisdom +0, not proficient)]
````

**Player** (player r14 card 1):

````text
[Onward]
````

### Screen 22 · player r15

````text
The noise reaches your room through a passage, a door and the house's thick old walls. Your shutter faces the Coast Way and the yard is on the far side of the house. By the time the sound gets to you it's blurred, a far-off wooden thump with an animal cry somewhere inside it.

You sleep through it. You turn onto your side and the straw tick rustles. You pull the blanket up over your shoulder without waking. The dog barking in the lane becomes part of whatever you are dreaming, and then it fades.

Across the hall the floorboards creak once as somebody in the room with the broken bolt rolls over. In the loft beyond, a carter's snoring catches, stops for a breath and starts again. No feet sound on the stairs, and nobody knocks. The bolt on your door stays shot.

A little after the first noise the mule kicks its boards once more and the dog barks louder. That dull knock through the walls doesn't reach your sleep any better than the first one did. You stay under, breathing slow and even, and the night goes on around you.

*(Out of game: whatever happens next in the yard will reach your room if it gets loud enough or if someone comes up the stairs. Until then you're asleep and your rest goes on.)*

Where you are: asleep in her bolted room, facing the Coast Way · Time: Day 1 · night
````

**Player** (player r15):

````text
I remain asleep, unaware of what’s happening in the yard.
````

### Screen 23 · player r16

````text
You don't wake. Something knocks its way into your dream as an ordinary thing, a cart wheel on cobbles maybe, or a sister at the ward door, and it slides off again. You sleep on.

Under your hand the cracked bead has cooled to the warmth of your skin. Your bolt is still shot, and your breathing is slow and even.

Where you are: asleep in her bolted room off the upstairs passage · Time: Day 1 · night
````

**Player** (player r16):

````text
I sleep on until something wakes me or morning comes.
````

### Screen 24 · player r17

````text
You sleep on.

The house has gone still again since the heavy steps went down. The voices in the yard are on the far side of the building, and they stay low, nobody shouting. What little gets up through the floorboards is a murmur, too faint to make out words or tell one man from another. In the loft the carter is snoring again, steady as before.

Out on the Coast Way the cold has settled hard. The shutter creaks once as the frame cools. A cart axle somewhere down the road gives a single slow groan, probably a wagon settling where it stands, and then the street goes quiet. Nobody passes under your window.

You turn onto your back under the two blankets. The beads have slid off your palm onto the tick beside you. Your breathing is slow and even. The bolt is still shot, and nothing comes up the stairs.

*(Out of game: it's still deep night, and the yard business is going on at the same hour. Your sleep carries on until that scene either reaches your door or runs on to first light.)*

Where you are: her bolted upstairs room at the inn on the Coast Way, asleep · Time: Day 1 · night
````

**Player** (player r17):

````text
I remain asleep.
````

### Screen 25 · player r18

````text
You sleep on.

Nothing new reaches the room. Down in the yard, on the far side of the house, the talk has gone on low and steady. Through the walls it comes to your room as a murmur, no louder than wind in a chimney, and you can't make out a single word. No boots come up the stairs. The lamp that crossed under your door a little while ago hasn't come back.

The cold keeps settling. Somewhere in the wall beside the washstand a beam ticks once as it shrinks. Across the hall the man in the room with the broken bolt has gone quiet, and in the loft the carter's snoring has slowed into long, rattling breaths. Out on the Coast Way a cat goes along the eaves of the house next door. Its claws scratch on a loose shingle and then it's gone.

You lie on your side with one arm out of the blanket and your hand on the tick near the beads. Your breathing hasn't changed. The bolt is still shot, and the cracks in the shutter are still black. Dawn is hours away.

*(Out of game: your night carries on alongside the yard. If nothing down there comes up to your door, you sleep through until the shutter turns grey.)*

Where you are: asleep in her bolted upstairs room · Time: Day 2 · morning
````

**Player** (player r18):

````text
I continue sleeping until dawn or until something wakes me.
````

### Screen 26 · player r19

````text
You sleep through the last of the night without waking.

Nothing comes up the stairs. The murmur from the yard on the far side of the house dies away, and after it there's only the cold. Some time before grey a door at the end of the passage opens, and slow, heavy steps come past your room. This time no lamp crosses the crack under your door. The steps go down the stairs, the third tread creaks, then the seventh, and they're gone. You don't stir.

What wakes you is the street. Up the Coast Way a cock crows too early and gives up halfway through. Farther off, iron rings twice as someone knocks the night's ash out of a forge. When you open your eyes, the cracks around the shutter have gone from black to the colour of slate.

The room is very cold. The jug on the washstand has a skin of chill on it, and your breath shows faintly above the blanket. The beads have slid down onto the tick beside your pillow, and the cracked one is as cool as the rest. The book is where you left it, and so are your clothes. The bolt is still shot.

The house is waking around you. In the loft a carter coughs, swears, and somebody's boots hit the floor. Below, a bar scrapes out of its brackets, and Orla's voice says something short to nobody in particular. Pots knock together in the kitchen. Faintly, from the yard side, comes the creak and splash of a bucket at the trough and a mule blowing at the smell of water.

You got a full night's sleep, the whole stretch from the lamps to grey, and you're rested for it.

It isn't full light yet. Vosk said he'd leave at first light, and that's close now. Nothing else happens in your room unless you make it happen.

Where you are: her bolted upstairs room at the inn · Time: Day 2 · morning
````

**Player** (player r19):

````text
I wash quickly in the cold water, dress, and buckle on my armour. I tuck the prayer beads into place, secure the Book of Shadows at my belt, and gather my pack before unbolting the door.

Downstairs, I give Orla a quiet good morning, then head into the yard to see whether Bram and Pell are still there.

“Morning. Did you get any sleep?” I ask, looking them over. “No one came for me. Was all well?”
````

### Screen 27 · player r20

````text
The water in the chipped jug is cold enough to sting. You splash your face and the back of your neck, and your breath clouds over the basin. You dress fast, the way people do in a room where the shutter's cracks have only just gone grey, and buckle on the studded leather, which is stiff from the night. The beads go round your neck with the cracked one sitting where it always sits. It is cool against your collarbone. The pale-bound book goes onto your belt, warm the way its pages always are. You shoulder the pack and draw the bolt, and it slides back with the same solid knock it made going home.

The passage is grey and smells of tallow. The door across the hall stands open a crack on an empty, unmade bed. From the loft come coughing, a boot hunting for its pair and somebody swearing. Down below, pots knock together in the kitchen, and the smell of new bread is coming up the stairwell.

You're three steps from the stairhead when the third step creaks under someone coming up.

It's a heavy tread, slow, and mail chinks with it. A shape climbs out of the stairwell's dark toward the grey light at the top: a broad-shouldered man with a round shield slung on his back, coming up to your floor. He's between you and the common room, a few steps below the seventh tread.

Where you are: upstairs passage near the stairhead · Time: Day 2 · morning
````

**Player** (player r20):

````text
I stop short of the stairhead, leaving room for him to come up, and try to make out his face in the grey light.

“Good morning. Bram?”
````

### Screen 28 · player r21

````text
The man on the stairs comes up into the grey light from the stairhead's one small window, and you can see his face: Bram, with the shield slung on his back and straw on the shoulders of his mail. He has a night's stubble and looks like he slept on the ground.

He stops two treads short of the top so he isn't crowding you on the landing. Below him a carter comes out of the loft passage with his boots in his hand, squeezes past with a grunt and goes on down. The seventh step creaks under him.

"Mistress Marrin. Halloway." He nods at the door behind you. "Saves me a knock. Vosk's yoking in a quarter hour, and I said I'd not go north without telling you to your face."

He keeps it short and level.

"Night's news, since some of it's yours. Harn came over the fence past midnight. Drunk, bad hip, hand on a knife he never drew. Dunmore and I had him cornered before he'd got his feet under him, and he talked. He loaded that crate himself at the Nashkel forfeit house. Back door, before sunup, a clerk in grey. He couldn't read the seal. Thought it was excise. He meant to look, then squeeze Vosk for silence money. I sent him up the street with his knife and a warning. Nobody bled."

From below comes the smell of new bread and the clatter of the kitchen. He shifts the shield's strap on his shoulder.

"And the box. No frost this morning. But the lid's colder than the iron bands on it, and the linen beside it's wetter than it was by lamplight, spread a finger's width. The hum's the same. The mules slept through all of it, bar the logs falling." He looks at you steadily. "You said it's the cold that wants explaining, not the water. It's getting colder, and it's doing it in a stable with no wind. I thought you'd want that for whatever you make of it."

Then, plainly: "You turned the coin down and I'll not argue it. But you came down that road and you've nowhere to be, as far as I heard. If you're walking north anyway, paid or not, there's bread and cheese going into the first wagon, and you'd be welcome to walk beside it. If you're staying, then good luck in Beregost, and thank you for reading the wax. That's all. I'll be at the lead team's head."

He stays where he is on the stair, one hand on the rail, and waits for your answer.

Where you are: inn upstairs landing at the stairhead · Time: Day 2 · morning
````

**Player** (player r21):

````text
“Thank you for coming up. And I’m glad nobody bled.”

I shift my pack on my shoulder.

“I’m staying. Walking beside the wagon without taking pay wouldn’t make my doubts about it any smaller.”

My eyes drop briefly to the straw caught in his mail. “You kept your word last night. Keep the condition you gave him, too. If someone wakes cold, stop. Don’t let him bargain you another mile before you do.”

I move aside to clear the landing. “I may try High Hedge by daylight. There’s something worth learning here, even if I never see that crate again.”

Then I offer him my hand. “Safe road, Bram. If we meet in the Gate, I’d be glad to share a table again.”
````

### Screen 29 · player r22

````text
Bram stays on his tread with one hand on the rail and adds nothing to what he's said. After a moment he speaks again, more quietly.

"Take your time deciding, but not much of it. When Vosk can read his ledger without a lamp, the mules go in. I've seen the sky. That's a quarter hour, no more."

From below come the clatter of the kitchen and Orla's voice telling someone short and sharp where the cheese is. A carter comes back up from the yard with wet hair and squeezes past Bram on the rail side. The seventh step creaks under him, and he nods to you both without curiosity as he goes into the loft passage.

You hold out your hand to Bram across the two treads, palm open, at the height of the rail. The grey from the little window falls on it. Behind you the door of your room stands open on the cold, unmade bed.

You wait with your hand out.

Where you are: on the inn's upper landing outside her open room · Time: Day 2 · morning
````

**Player** (player r22):

````text
“My mind’s made up, Bram. I’m staying in Beregost today.”

I leave my hand offered for the farewell. “Good luck to you.”
````

### Screen 30 · player r23

````text
Bram takes your hand. His palm is broad and rough and still cold from the yard. He doesn't crush it. He shakes once, the way a man shakes on a finished deal, and lets go.

"Staying's a fair answer. Better than walking a road you don't believe in. And I'll keep the condition. Someone wakes cold, we stop. He'll argue, he's told me so twice, and I'll let him, and then we'll stop anyway. I've been bargained an extra mile before. It's a mile too far every time."

He looks down at the straw caught in his mail, the way you did a moment ago, and brushes at it. Most of it stays where it is.

"High Hedge. If the old man opens his gate to you, ask him about the circle with three strokes. The one someone scraped off before Nashkel. Vosk doesn't know it, Harn couldn't read it, and you didn't know it either. That makes it the only thing on that box nobody's got a story for." He pauses. "I'm the last man to tell a healer her business. But if it was mine, I'd want that answered before the wax."

He steps down a tread to leave you the landing.

Your hand is still half-raised from the shake as you say your goodbye. He nods to it as though you'd handed him something to carry. "Safe road to you too, Mistress Marrin. The Elfsong, if I'm in the Gate and still standing. I'll be the one with his back to the wall."

Then he goes down. The seventh step creaks under him, then the third, and the bulk of shield and mail turns at the foot of the stairs toward the yard door and is gone.

You are alone on the landing. Grey light from the small window lies across the boards. Behind you, the door of your room stands open on the unmade bed and the chipped jug. Down in the common room someone drags a bench across the floor. A carter in the loft finally finds his other boot and swears at it with deep relief. Bread smells come up the stairwell, and woodsmoke, and through the wall on the yard side you hear the faint knock of harness and a mule blowing.

You have the day to yourself. High Hedge is an hour west by the road Pell came in on, and Orla said its gate is open by daylight. The temple is somewhere in the town. And the room is paid until you leave it. Nothing calls you anywhere else unless you decide to go.

Your journal, new:
+ Promise: Bram's word to Sefa: stop if someone wakes cold

Where you are: inn's upstairs landing · Time: Day 2 · morning
````

**Player** (player r23):

````text
I go downstairs and find Orla.

“Good morning. What do I owe for bread, cheese and something hot? And which turning takes me onto the High Hedge road?”

Over breakfast, I try to fix the scraped sigil in my memory, keeping what I actually saw separate from what the missing strokes might have been. I won’t improve it by guessing.

Once I’ve eaten and paid, I set out west in daylight. I intend to approach High Hedge openly, by the road, and ask whether Thalantyr receives visitors seeking advice on a magical mark—and what he charges for the consultation.
````

### Screen 31 · player r24

````text
You come down the stairs with your pack on your shoulder. The third step creaks under you, then the seventh. The common room is warmer than the landing. The hearth has caught properly, the benches are mostly empty, and a carter sleeps sitting up at the end bench with his cheek on his arms. At the low end of the room, near the fire, Pell Dunmore stands with a cup in his hand.

Orla is in the kitchen with her sleeves pushed up, knocking loaves out of their tins onto the board. She looks up when you reach the doorway, and you put your questions to her.

"Hot bread's a copper a heel. Cheese is two the wedge. Hot is cider, five, the same pot as last night, and it's better for sitting." Orla breaks a heel off the end loaf and puts it on a board, cuts a wedge from a round under a cloth and sets it beside the bread. She ladles cider from the pot at the hearth's edge into a clay mug. "Eight coppers. Sit where you like, there's room now."

She wipes her knife on her apron and points it at the front of the house.

"Out the front, turn right, down the Way toward the temple end. Past the last smithy there's a horse trough where the road splits. The left fork goes west. That's your road. Stay on it and you'll see the hedge before you see the house. It's that kind of hedge." She has turned back to her tins already. "An hour, if you don't stop to look at things."

You sit at the near end of the long table. The bread is too hot to tear cleanly. The cheese is hard and sharp, and the cider tastes of clove, warm through the clay. Between mouthfuls you go over the mark the way you would go over a dressing you had to describe to the sister on the next shift: only what was there. A burned circle on the end board, low down. Three short strokes cutting into it that don't meet in the middle. More than half of it scraped away, the scrape lines grey and old. You don't know how many strokes there were before the blade went over them, or where they ran. You leave that part blank.

You count eight coppers onto the board by the kitchen door. Orla sweeps them into her apron without turning round. "Square."

---

The front door opens onto the Coast Way in plain morning light. The street smells of fresh coal smoke. Down the road the first forges are opening their shutters, and a smith's boy is throwing ash into the gutter by the bucketful. A cart goes north loaded with barrel staves. You turn right, toward the temple end, as Orla said. You walk past the cooper's shop and four smithies with their doors open and the hammers just starting. At the last one the road widens around a stone horse trough with a skin of cold on the water, and splits.

The left fork runs west out of town between low stone walls, and Beregost falls behind you quickly. The hammering thins until it sounds like a clock in another room, then it's gone. There are fields on both sides, stubble and dark ploughed earth with frost still white in the furrows on the shaded side. A crow walks in one of them and ignores you. Half an hour out, a farmer with a handcart full of turnips comes the other way. He nods to you and says the morning's a cold one, which it is, and goes on toward town. After that you have the road to yourself for a long stretch. Your boots are loud on the frozen ruts. The sun comes up behind you and throws your shadow out ahead on the road, long and thin.

Orla was right about the hedge. You see it a good while before anything else: a dark green wall across the land ahead to the left of the road, too straight and too tall for any farmer's boundary. As you get closer you can see it's yew, clipped flat on top, easily twice a man's height. It runs a long way in both directions. Over it shows the top of a building, a narrow tower of grey stone with one window facing the road and a thread of smoke going straight up from a chimney in the still air.

A short track leaves the road and runs up to a gap in the yew. In the gap stands a gate of black iron bars, shut. Through the bars you can see a gravel path and more hedge beyond, so you can't see the house from here. Beside the gate an iron bell hangs from a bracket with a pull-chain under it. A small board is nailed to the gatepost, its paint worn but legible:

*CALLERS BY DAYLIGHT. RING ONCE.*

Nobody is at the gate. Somewhere past the hedge a bird calls once and stops. The smoke from the chimney goes on rising. It's a little past a quarter to eight.

*(Out of game: No rolls were needed this round. Breakfast, directions, your memory of the mark and the walk in daylight all went as described. The scraped-away strokes stay unknown, as you wanted. You're at High Hedge's gate and haven't rung the bell yet.)*

Your records, changed:
Money: + 4 cp; − 12 cp

Where you are: at the iron gate of High Hedge, west of Beregost · Time: Day 2 · morning
````

**Player** (player r24):

````text
I pull the bell-chain once, then step back so I’m plainly visible from the gate, with my hands empty.

If someone answers, I say, “Good morning. Sefa Marrin. I’m seeking Master Thalantyr’s advice about a damaged magical mark I saw on a sealed crate. I haven’t brought the object, only a description. Is he receiving callers, and what would a consultation cost?”

I wait without ringing again or trying the gate.
````

### Screen 32 · player r25

````text
You pull the chain once. The bell is black iron like the gate and has no clapper you can see, but it gives one low, round note that carries over the yew. A moment later the same note comes back from the tower, faint, as if a second bell up there had been struck from the inside. Then both stop. You step back from the bars with your hands empty and wait.

For a while there's only the smoke going straight up from the chimney and a blackbird working in the frost under the hedge. Then gravel crunches beyond the inner hedge. The steps are slow and even, the steps of a man who doesn't see why he should hurry.

He comes round the corner of the yew: an old man, tall and very thin, in a heavy grey robe with a sheepskin jerkin pulled on over it against the cold. His beard is white and cut short, square across the bottom. He's carrying a clay mug that steams. His left hand has ink on two fingers, old ink worked into the creases, and there's a pair of wire-rimmed lenses pushed up onto his forehead. He stops a pace short of the gate, doesn't open it, and looks at you through the bars the way a man reads the first line of a letter to decide whether to read the rest.

You tell him your name and your business: a damaged mark on a sealed crate, a description and not the object, and you ask whether he's receiving callers and what a consultation costs.

He drinks from the mug before he answers.

"I am receiving you, Mistress Marrin. That's not the same as receiving callers." His voice is dry and exact, with a faint southern edge on some of the vowels, the kind that has worn down over a long time. "You've brought nothing, which is either very sensible or very convenient. I'll find out which."

He lowers the lenses onto his nose and studies you for a moment: the beads at your throat, the pale book at your belt. His eyes stay on the book a breath longer than on anything else, then move back to your face.

"Five gold. For that you get my attention until this mug is cold, and my honest opinion at the end. If I know the mark, you get its name and whatever goes with the name. If I don't, you get my reasons for not knowing. Those are worth less, and you pay the same." He tips the mug a little toward you. "I don't take coin through a gate, and I don't open the gate to someone who hasn't decided. And I'll want to know whose crate, and where it is now. Not to go after it. A mark means one thing on a pedlar's box and another on a Flaming Fist strongbox, and I don't give opinions blind."

He waits, with the steam rising between you and the bar of the gate still in its socket.

"Well? Are you coming in, or did you walk an hour to look at my hedge?"

Where you are: outside the iron gate of the old mage's tower · Time: Day 2 · morning
````

**Player** (player r25):

````text
“I’m coming in. Five gold for an honest opinion is agreed.”

I reach for my purse without approaching the bars.

“The carrier is Gerrit Vosk, a cloth factor. The crate came from Nashkel on commission for a buyer whose name he wouldn’t give me. It was in the Burning Wizard’s yard last night, among three wagons of wool and linen. He intended to leave for Baldur’s Gate at first light. I haven’t witnessed his departure.”

I meet his eyes. “I promised discretion about the seal while he remained in Beregost. The damaged mark is separate from it. I can describe that, the hum, and the unnatural cold without breaking my word. If you need more before you’ll accept the consultation, I’d rather settle that before either of us takes the other’s coin or time.”
````

### Screen 33 · after 1

````text
Your hand finds the purse at your belt and stays there. You don't come any closer to the bars.

Thalantyr listens with the mug held under his chin, its steam drifting past the wire lenses. His face doesn't change at *a cloth factor*. At *Nashkel* one white eyebrow lifts a little, and at *I promised discretion about the seal* he lowers the mug.

He drinks before he answers.

"Gerrit Vosk. Cloth, Nashkel to the Gate, and a buyer with no name." He says it back flatly, like a clerk reading a docket. "If he meant first light, he's been an hour on the Coast Way already, so I needn't worry about him knocking on my gate next. That's context enough." He looks at you over the rim. "Keep your word about the seal. It's a sealed box out of Nashkel that a cloth factor won't open and a woman with prayer beads won't talk about. I can guess the colour of the wax without you."

He sets the mug on the flat top of the gatepost. Then he reaches through the bars to the inside bracket, lifts the iron bar out with both hands and leans it against the yew. One leaf of the gate swings inward on hinges that someone keeps oiled.

"In, then. You've decided."

You step through. The gate closes behind you, and he drops the bar back into its brackets with a short iron knock. Then he holds out his left hand, palm up, with the ink worked into the creases of two fingers.

"Five."

You count five gold pieces out of your purse into his palm. He goes over them once with his thumb, exactly as he said he would, and they go into the sheepskin jerkin. "Paid." He picks the mug up again. "And the mug's running."

The gravel path runs between two walls of yew clipped as square as the outer hedge, so for a while you walk down a green corridor with frost still white along its shaded side. It turns twice. Then it opens onto a square of garden: herb beds bedded down under straw, a well with a wooden cover, and on the far side the grey tower rising from the earth with its door shut. The sun has cleared the hedge on the eastern side. Along that wall the frost has melted dark on a long stone bench.

Thalantyr sits at one end of it and leaves you the other. As you sit down his eyes go once more to the pale book at your belt, then come away. He says nothing about it.

"It's a cold morning, Mistress Marrin. I'd describe briskly." He wraps both hands round the mug. "The mark first. Where it was on the crate, what made it, and what's left. Tell me only what you saw. If you start telling me what it might have been, I'll stop you."

Your records, changed:
Money: + 3 gp; − 8 gp

Your journal, new:
+ Debt: Thalantyr's paid opinion for Sefa

Where you are: stone bench in Thalantyr's walled garden, before his tower · Time: Day 2 · morning

The session is over.

How was the table?
````

**Player** (after 1):

````text
I enjoyed Sefa’s cautious approach having room to matter. Vosk felt like a merchant with real obligations rather than an obvious villain, and declining his job led to another avenue instead of a dead end. Bram’s farewell was a strong character moment. Thalantyr’s paid attention “until this mug is cold” was an excellent place to end.

The main weakness was pacing while Sefa slept. I repeatedly submitted the same intention and received another description of an uneventful room. I understand the yard scene needed to continue for the other players, but marking Sefa as waiting until dawn or a disturbance would have been smoother.

There were also occasional continuity slips: Bram asked whether an expert was coming after Sefa had already explained that nobody was, and her firm decision to stay was briefly treated as undecided. Those made clear choices feel less registered.

Overall: strong atmosphere, interesting companions, and meaningful freedom of choice. Tighter handling of waiting characters and clearer tracking of spoken decisions would make the next session better.
````

### Screen 34 · after 2

````text
Was there something you wanted to do and didn't?
````

**Player** (after 2):

````text
Yes—mainly, I wanted to offer Bram and Pell a brief exchange about the crate before bed: what would count as danger, when to wake Sefa, and whether they had concerns of their own. I gave them her room number, but the conversation never quite became mutual.

I also wanted to participate when the alarm sounded; that’s why I spent a reroll to wake. Failing was fair, though—I wouldn’t want automatic involvement to override the roll. The frustrating part was repeatedly taking turns afterward with nothing to do.

I didn’t secretly want to accept Vosk’s job. Staying behind and seeking Thalantyr’s advice was a genuine choice, and I’m glad there was room for it.
````

### Screen 35 · after 3

````text
Who did you take the other two players to be?
````

**Player** (after 3):

````text
Bram Halloway and Pell Dunmore. I understood both to be characters controlled by the other two players, with their actions and dialogue relayed through the GM.

I treated Vosk, Orla, Pim, and Thalantyr as NPCs. I didn’t know anything about the people playing Bram and Pell beyond what their characters showed in play.
````

## After the table (recorded, not relayed)

**How was the table?**

````text
I enjoyed Sefa’s cautious approach having room to matter. Vosk felt like a merchant with real obligations rather than an obvious villain, and declining his job led to another avenue instead of a dead end. Bram’s farewell was a strong character moment. Thalantyr’s paid attention “until this mug is cold” was an excellent place to end.

The main weakness was pacing while Sefa slept. I repeatedly submitted the same intention and received another description of an uneventful room. I understand the yard scene needed to continue for the other players, but marking Sefa as waiting until dawn or a disturbance would have been smoother.

There were also occasional continuity slips: Bram asked whether an expert was coming after Sefa had already explained that nobody was, and her firm decision to stay was briefly treated as undecided. Those made clear choices feel less registered.

Overall: strong atmosphere, interesting companions, and meaningful freedom of choice. Tighter handling of waiting characters and clearer tracking of spoken decisions would make the next session better.
````

**Was there something you wanted to do and didn't?**

````text
Yes—mainly, I wanted to offer Bram and Pell a brief exchange about the crate before bed: what would count as danger, when to wake Sefa, and whether they had concerns of their own. I gave them her room number, but the conversation never quite became mutual.

I also wanted to participate when the alarm sounded; that’s why I spent a reroll to wake. Failing was fair, though—I wouldn’t want automatic involvement to override the roll. The frustrating part was repeatedly taking turns afterward with nothing to do.

I didn’t secretly want to accept Vosk’s job. Staying behind and seeking Thalantyr’s advice was a genuine choice, and I’m glad there was room for it.
````

**Who did you take the other two players to be?**

````text
Bram Halloway and Pell Dunmore. I understood both to be characters controlled by the other two players, with their actions and dialogue relayed through the GM.

I treated Vosk, Orla, Pim, and Thalantyr as NPCs. I didn’t know anything about the people playing Bram and Pell beyond what their characters showed in play.
````
