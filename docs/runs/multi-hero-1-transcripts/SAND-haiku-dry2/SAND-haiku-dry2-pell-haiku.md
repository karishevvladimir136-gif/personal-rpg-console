# SAND-haiku-dry2 — Pell Dunmore's player: Claude Haiku 5.5

Synthetic content: invented characters in an invented campaign (Table C's Beregost files, written for the company). Stage origin/claude/handoff at 6f1c9fe (docs/stages/MULTI_HERO_1.md, its amendment of 2026-10-28 23:15 LA: A1–A8, and of 2026-10-29 02:30 LA: three fixes after the first dry run); design sha256 `da3aa5fcab6508422e5556c745e6309622e2adda74a9229219b779fc3a4268ad`.

Arm **P-SAND**; 6 round(s) of 6; ended by rounds. The DM: Claude Haiku 5.5 in place of every Claude model but the relay's (each Claude request's model swapped before it was sent — the wizard, the opening, the prep, the DM's turns with the owner's settings otherwise, the checks and the judges as Haiku; the relay as Claude Sonnet 5.5). Started 2026-10-29T09:54:54.306Z. The DM option «company» is on: no record is the hero.

Seats: 1. Bram Halloway (fighter) — Claude Haiku 5.5; 2. Sefa Marrin (warlock) — Claude Haiku 5.5; 3. Pell Dunmore (rogue) — Claude Haiku 5.5. The order of the round's messages turns round each round (1-2-3, 2-3-1, 3-1-2; a fight: initiative). The players are not told what the others are.

The player's system prompt: `playerSystem("SAND", "pell")` in scripts/multi-hero-1/frozen.mjs, sha256 `b1e98fd6d02043e867876b3ae2a3ff5781884163e4981627417fce93c43ec290`.

Each «Screen» block is what this player was shown; each «Player» block is the player's message as written.

### Screen 1 · player r1

````text
The session begins.

The afternoon light slants through the grimy window and lies across the scarred tables of the Burning Wizard. You came in from the west by the High Hedge road, a healer's satchel at your hip. Two others share the table with you, strangers both: a man in chain mail with the dust of the Coast Way from Nashkel still on him, and a woman from Baldur's Gate, her travelling cloak drawn tight against the wind off the fields. Three roads, one table, and none of you has met the others before. Edda Marsh, the innkeeper, sets a jug of ale on the nearest table and wipes her hands on her apron. Out in the street the hammers of the smithies keep their steady time, and the hearth crackles beside the bar. No one has yet said a word about why you ended up sharing this table, and the innkeeper's eyes move from face to face, waiting for someone to speak first.

Your records:
Pell Dunmore — Human, rogue 5 (Thief), Lower City roof-runner turned hireling, level 5
HP 33/33 · AC 15 · Speed 30 feet
STR 10 · DEX 17 · CON 13 · INT 13 · WIS 12 · CHA 12
Skills: Stealth +9 (expertise); Sleight of Hand +6; Acrobatics +6; Perception +4; Investigation +4; Insight +4; Tools: thieves' tools +9 (expertise)
Saves: Dexterity saving throw +6 (proficient); Intelligence saving throw +4 (proficient); Strength saving throw +0; Constitution saving throw +1; Wisdom saving throw +1; Charisma saving throw +1
Attacks: Shortsword +6 to hit, 1d6+3 piercing; Dagger +6 to hit, 1d4+3 piercing, thrown 20/60; Shortbow +6 to hit, 1d6+3 piercing, range 80/320; Sneak Attack: +3d6 once a turn with advantage or an ally beside the target
Abilities: Proficiency bonus +3; Sneak Attack 3d6; Cunning Action: Dash, Disengage or Hide as a bonus action; Uncanny Dodge: a reaction halves the damage of an attack he can see; Fast Hands (Thief): a bonus action to use an object — a potion on another, a lock, a lamp; Second-Story Work: climbs at full speed; Thieves' Cant
Limits: Light armour; 33 hit points — he cannot stand at the front for long; Sneak Attack needs advantage or an ally beside the target
Counters: Hit dice 5/5; Heroic inspiration 0/1
Money: 31 gp; 2 ep; 6 sp; 55 cp
Worn: Armor / clothing: Studded Leather Armour; Belt: Thieves' Tools; Main hand: Shortsword
Pack: Arrow ×20; Bedroll and Rations; Dagger ×2; Flask of Oil ×2; Hooded Lantern; Potion of Healing ×3; Shortbow; Silk Rope (50 feet)

Where you are: common room of the Burning Wizard inn · Time: Day 1 · afternoon
````

**Player** (player r1):

````text
Pell takes the stool nearest the hearth, sets the satchel on the bench beside him, and pours himself a cup from the jug before Edda can reach for it. He doesn't drink yet. His eyes go to the chain-mailed man's boots, grey with the Coast Way, then to the woman's cloak, which she hasn't unbuckled.

"Coast Way, by the dust on you," he says to the man, easy, as if they've been talking all along. "Nashkel, I'd guess. Nobody walks that road for the scenery. Have you come far?"

He turns the cup a quarter-turn on the scarred wood and tips his head toward the woman. "And you, from the Gate, I'd say. You've got the look of someone who doesn't want to be followed. No offence meant. Just noticing." He smiles, not quite a joke. "I'm Pell. Pell Dunmore. Came in by the High Hedge road this morning, and I've been trying to decide whether the ale is worth the coin."

To Edda, lightly: "Is the ale any good, or is it just the only thing you've got?"

While he speaks, Pell's eyes drift once around the room, the stairs, the back door, the window, and rest for a moment on a man in a grey cloak at the far end of the bar who has not touched his drink.
````

### Screen 2 · player r2

````text
The man in chain mail sat in the chair that put the wall at his back, set his shield against the table leg and laid his longsword across his knees. He asked Edda for a jug and told her to charge whatever you and the woman ordered to him until his pay came, which he said would be today. He gave his name as Bram Halloway, up from Nashkel, and said he carried only his own gear. With so many roads left open lately, he said, a man shouldn't talk freely about where he's been, and the two of you could say where you came from or keep quiet. He poured his own ale, drank half of it and kept an eye on the door.

The woman pulled out the stool across from you both, set her pack against the wall and let her cloak fall back. She asked Edda for a cup of red and something hot that wasn't mutton, saying she'd had three days of it. She looked over Bram's chain mail, the road dust, your satchel and your hands. She named herself as Sefa Marrin of Baldur's Gate, said someone ought to explain why three roads had brought you to one table, and that she'd rather hear names from your own mouths than guess from your boots.

Edda raised an eyebrow at Bram, filled his jug and chalked a stroke on the board. She remarked that every Coast Way man claims he'll be paid today, said his tab was open, and told him not to make her come find him.

To Sefa she said the red was from the cellar cask and honest enough, the stew was mutton, but the bread was warm. She named a price for each and waited with her arms folded, her hand not going to the purse. To you she shrugged: it's ale, drink it or pay for the next and see if it's better. Her eyes went to the grey-cloaked man, and she said low that he'd been there since the noon bell and neither ordered nor asked for a room.

The grey-cloaked man looked up and met your glance for a breath, then turned back to the wall behind the barrels. Out in the street a hammer stopped and started again, and the forge smell came in with the draught from the door. The room settles, waiting to see who speaks next.

Your journal, new:
+ Debt: Ale on Bram's tab at the Burning Wizard

Where you are: stool nearest the hearth in the inn's common room · Time: Day 1 · afternoon
````

**Player** (player r2):

````text
Pell lifts the cup at last, sniffs it, and sets it down again without drinking. He takes the hint about names and gives his own, but keeps the rest to himself.

"Pell Dunmore," he says, to Bram and to Sefa both. "Fair enough, Bram. Names, and nothing else. I've come from the Gate's Lower City, if you want a place for me. Not a grand place." He lets that sit a moment, then glances at Sefa's cloak. "Don't think you'll get much more out of me, and I'd not expect much more from you, either. But you're the only two in here who've bothered to look at the door, so I'll take that as company."

He turns a little on the stool so his back is to the hearth and he can see the stairs, the door and the grey-cloaked man at the end of the bar in one glance. "Edda, a bowl of that stew for me, and I'll have the bread with it, since you say it's warm. Put it on my tab if you like, but I'd rather pay on the nail."

He sets two copper on the table, pushing them a finger's width toward the innkeeper, and then, quieter, to the other two: "Somebody's been watching this room since noon. That fellow at the bar hasn't ordered and hasn't looked at his cup. I don't know if that means anything. Maybe he's just waiting for a friend who never comes." He shrugs. "Or maybe the three of us have all come in through the same bad luck. Either way, I'd like to know who's sitting at my elbow before I eat."
````

### Screen 3 · player r3

````text
Sefa pays for the red wine, her stew and her bread out of her belt purse, laying the coins down on the board one by one so that Edda can watch the count shrink but learn nothing about the rest. She then nods to Bram and to you and speaks low. She repeats your names as she heard them: Bram of Nashkel, and you, who came by the High Hedge. To Bram she says she has come down from Baldur's Gate and is nobody's runaway. She calls herself a healer of sorts and a student of the Faith, trained by the sisters of a hospice in the Lower City to size up a room before tending a patient, and she finds this room quiet in the wrong places. Her gaze drifts toward the grey cloak, then she asks you whether you know that man, since the way you looked at him suggested either that you did or that you wished you didn't.

Bram gives his name once more, this time to Sefa: ten years guarding wagons on the Trade Way, and six with a free company before that. He says the Coast Way is the one to take if you want to be noticed. He agrees that people who come in and order nothing deserve a look, and says the man at the bar has been watching the three of you since you sat down, not the door. Then he asks you bluntly whether you saw anything on the High Hedge this morning: men on the road, wagons standing still, a body in the ditch. His hand stays near his cup and his eyes stay on the grey cloak.

Edda sweeps Sefa's coins into her apron without a word: two silver for the red, the stew and the bread. The bowl arrives steaming, the bread wrapped in a cloth. At the bar the man in grey does not turn his head, but his eyes go to Sefa's hand when the coins click on the wood, stay there a breath longer than needed, and return to the wall behind the barrels.

Edda looks at your two coppers and pushes them back to you with one finger. Stew costs a silver, she says; keep your coin until you have the rest of it.

When Bram asks about the High Hedge, Edda's hand stops on the cloth and she puts it down. As far as she has heard, nothing has come down the Hedge since the bell. A drover off the Way came in at noon and said the Nashkel wagons are two days overdue and nobody knows why. She would rather not be asked for more.

The man in grey finally lifts his cup, drinks once, slowly, and sets it down with his hand flat beside it. Then he looks at Bram for the first time, a long level look that tells nothing, before his eyes fall back to the far wall.

Outside, the hammers have stopped. The room is quiet enough that you can hear the fire settle.

Your journal, new:
+ Thread: Nashkel wagons two days late on the Coast Way

Where you are: table in the inn's common room · Time: Day 1 · afternoon
````

**Player** (player r3):

````text
Pell tears a piece from the warm bread and dips it in the stew before he answers.

"Never seen him before in my life," he says to Sefa, "and I'd like to keep it that way. Men who sit in a corner all afternoon and don't order are either waiting for someone or waiting for the wrong someone to walk in. I've been on the wrong end of both." He lets the bread go soft in the broth. "Hasn't touched his drink, though. You don't pay a man for ale, you pay him for the seat."

To Bram, he shakes his head slowly. "High Hedge this morning was empty. No wagons, no riders, no bodies. Just a crow on a fence post that watched me all the way past the old mill, and I didn't like the look of it." He pauses, then adds with a shrug, "Empty road isn't always a quiet one, though. I'd not count on it staying that way."

He sets the spoon down and glances once more toward the far end of the bar, careful not to hold the look. Then, to the table at large, quieter: "If Edda's right and the Nashkel wagons are two days late, somebody's been paid to be late. I'd sooner know who before the Fist comes asking. So, Bram, Sefa: what's your business in Beregost, if it's not the ale?"
````

### Screen 4 · player r4

````text
Bram said the Nashkel wagons don't run late without a reason: either the road was closed or someone wanted them slow. He said he was paid off in Nashkel this week and saw no wagon in the yard he'd trust, and he agreed the man at the bar should be looked into. Then he stood, took up his shield by its strap and walked down the room, keeping behind the tables. He stopped two paces from the grey cloak with his back to the wall and asked quietly whose errand the man was running and whether it would cost anyone at your table. His hand stayed off his sword.

Sefa, still at the table with you, spoke low to Edda. She said Edda had set the cloth down as if it weighed a stone, and asked whether there was more on the High Hedge than late wagons. She promised not to repeat it to anyone who'd carry it to the grey man. Then she turned to you and said that if a body lay by a ditch on the Hedge, she wanted to know before dusk, since someone would ask who saw it last. She asked whether you had passed any wagons that morning, stalled or otherwise, and told you to think about where the ditch runs.

At the bar, the man in the grey cloak did not turn his head. He watched the barrel by his elbow, and when Bram's shield rim knocked it, he lifted his cup an inch out of the way. "Mind the iron, Halloway," he said, level and dry. He said the errand was his own, that he was paid to keep the seat and not the cup. He turned the cup a quarter-turn on the wood without drinking. He was waiting on a man who was late, like the Nashkel wagons, and he told Bram to go back to his friends. His hand did not go under the cloak. As Bram half turned, he asked who had sent him over, saying it was not the innkeeper.

At the hearth, Edda kept her arms folded over her apron as she answered Sefa. Nobody had brought her a body, and no drover's word worth more than his ale. She wanted it kept that way in her room. She glanced toward the bar and said that if Sefa wanted the reeve, the town hall by the smithies was the place, but not to bring him in on a rumour; she had customers who wouldn't return at the sight of a Watch cloak. She folded the cloth once, set it on the board, and kept her hand on it.

You push your bowl an inch away and take up the cup at last. The ale tastes of the cask, which is all it was ever going to be. Outside a hammer starts again, steady as before, and the room takes up its afternoon.

Where you are: inn common room, at the table · Time: Day 1 · afternoon
````

**Player** (player r4):

````text
Pell watches Bram cross the room and doesn't follow him. He keeps his seat, his back to the hearth, and keeps his hands where the room can see them, the cup in one and the spoon in the other.

When Sefa turns to him about the ditch, he thinks for a moment before he answers, and he answers plainly.

"Passed two wagons on the Hedge this morning, both moving, both headed north with barrels roped down. Carters who wanted to be somewhere else. I didn't stop to ask them anything." He frowns at the cup. "The ditch runs along the bend past the old mill, where the willows are. There was water standing in it, and I saw nothing lying there, but the willows hide a lot, and I didn't go down to look. If somebody's in it, they got there after me."

He sets the cup down. "I'll tell you what I'd want you to know, Sefa, since you're asking so carefully. I came into this town by the Hedge, I didn't stop for anybody, and I didn't go near the ditch. If the reeve wants to hear that from me, he can ask, and I'll say it to his face, but I'd rather not walk into the town hall with a Watch cloak on the way out."

Then, quieter, to the table: "Bram's gone to ask that fellow a question he won't answer. Let him. If the grey man's waiting on someone late, I'd like to see who comes through that door before he does. You?"

Pell looks at the door, then at the grey cloak's back, and doesn't reach for his satchel yet. He does notice the ditch, though, and the willows, and he keeps the thought to himself for now.
````

### Screen 5 · player r5

````text
Bram crosses the room to the grey man by the bar, and you stay in your seat. He tells the man that no one sent him, and that he'd rather keep a wall at his back than have a stranger beside him who won't say what he's waiting for. He asks which road the late man is late on, and says that a carter won't come through the door looking like a crow on a post. He says he'll watch who the man looks at first when that fellow arrives, and that you and Sefa will too, and he presses the stranger to say whether the man comes to drink or to collect. Then he turns his back and walks three steps toward the table, keeping the shield turned toward the stranger.

Sefa answered your question first. She said she was brought by a letter from a sister at the hospice, and by a debt she'd rather not air before a room of listeners. She told Bram to sit, since he'd made his point. Then she asked the grey man for the name of the man he was waiting on.

The grey man looks at the shield rim on the barrel, then at Bram's face, and takes his time. Late men don't write their names on the board, he says, and neither does he. A carter, he allows, who drives a cart and is late. That's more than he was paid to give.

He tells Sefa that a name is what a man offers when he wants a healer at his bedside, and he has no bed that needs one. Then his eyes come to you and stay for a breath. You came by the Hedge this morning, he says. Did the carters you passed say who they were running from, or who they were late for?

Edda, at the hearth, tells Bram to get his shield off her barrels or it goes on his tab twice. The grey man slides his cup out of elbow's reach and sits back against the wall, and does not look at Bram again. The window light has crept a finger's width across the boards, and forge-smoke at the door has thickened. A cart wheel grinds past outside toward the smithies.

Bram lowers the rim, iron scraping wood, and reaches his chair, still standing with the shield on his arm. The grey man's question is still on the board, unanswered, and the room waits for you. Edda goes back to folding her cloth.

The question is yours to answer.

Where you are: seated at the table, back to the hearth, in the taproom · Time: Day 1 · afternoon
````

**Player** (player r5):

````text
Pell doesn't look at the grey man when he answers. He looks at the cup in his hands, as if the question were a small thing.

"Passed two carts," he says. "Both northbound, both moving, both with barrels roped down under tarp. They didn't say who they were running from, and I didn't say who I was running to. Nobody on the Hedge says much to a man coming in from the west." He takes a sip at last, and sets the cup down. "If you want to know who's late, friend, I'd ask the carters, not me. I'm only here for the stew."

Then he turns, unhurried, and gives the grey man the same level look he gave him earlier, no more. "And you're welcome to keep your seat. I've no quarrel with a man who pays for the seat. Just don't ask me to say I saw things I didn't."

Under the table his left hand rests on the satchel strap, not lifting it, only resting there. He glances once at Sefa, and then, quieter, to Bram: "Sit down, Halloway. You've made your point to the barrels."
````

### Screen 6 · player r6

````text
You looked at your cup, not the grey man, and answered that you had passed two northbound carts, both moving, with barrels roped under tarps. Nobody on the Hedge says much to a man from the west, you said, and whoever wants to know who is late should ask the carters. You told the grey man he could keep his seat and that you wouldn't claim to have seen what you hadn't. Your left hand rested on the satchel strap without lifting it. You told Bram to sit down, that he had made his point to the barrels.

Before that, Sefa had watched the grey man's mouth as he spoke, then asked you whether you had seen any carters on the Hedge that morning or only the crow. She told Bram to sit and keep the shield on his knee if he liked, said the grey man had given away more than he meant to and was still watching Bram. To the grey man she said, evenly, that he needn't give a name, but if his carter was late and had come by the Hedge, he knew what the man had driven past, and she would rather be asked about a body by a ditch than learn later that nobody asked. Her thumb pressed her prayer beads once and she laid her hand flat on the table.

Bram lowered his shield to the floor, a hand on its strap. He asked you what the carters had said, and asked you to tell him of the willows past the old mill, slowly, as to a sergeant. Then he sat with his back to the wall and his face to the door and pulled the jug toward him. He said something quiet to Sefa that you did not catch.

The grey man took Sefa's words slowly and answered the door rather than her: "A body doesn't keep to anybody's errand, Healer. That much I'll grant you." He turned his cup a quarter-turn without drinking. To you he said to eat while it was hot, since the carters would keep, and asked you nothing more. Then he looked at Bram: "Halloway. You were paid off in Nashkel. Who paid you?"

At the hearth Edda had heard the word ditch and disliked it. She shook out the cloth, put it over her shoulder, and said that a dead man in a ditch belongs to the reeve, who can ask her for supper like anyone else, and that she wanted none of it in her room, and not with that shield. She went back to the bar without waiting for a reply.

The fire settled. Outside the hammer started up again, and the window light crept another hand's width toward the grey man's boots.

Where you are: at the table in Edda's common room · Time: Day 1 · afternoon
````

**Player** (player r6):

````text
Pell eats the stew while it's hot, as the grey man suggested, though he eats slowly and keeps his back to the hearth. He tears the bread and dips it, watching Bram over the rim of the bowl and listening to the grey man's question hang in the air.

"Halloway's answer will tell us more than the carters will," he says to Sefa, under the noise of the room. "Watch his hands when he gives it. A man who's been paid honestly doesn't need to think about the name."

He sets the spoon down and draws the satchel into his lap, unbuckling nothing, only settling it where his hand can reach. Then he speaks to Sefa, low and even: "If there's a body by those willows, it won't stay put till the reeve gets round to it. Dusk's a few hours off. If you want to see the ditch before the light goes, I'll walk the Hedge with you. Not to the bend. Just far enough to see whether the water's been disturbed. I've got a lantern and I don't mind the dark, but I'd sooner not do it blind."

He glances at the grey man once more, then at the door, and adds, quieter still, "And if the Fist's going to come asking, I'd like to have walked the road first, so I can say I did."
````

### Screen 7 · after 1

````text
Bram answered the grey man's question loudly enough for the bar to hear and no louder. He said the Nashkel freight house had paid him by way of their wagon-master, and that the money was good. He has worked ten years on the Trade Way for carters, merchants, a Waterdhavian factor who cheated him, and a widow with only a mule, and he brought the wagons in every time. He then asked the grey man who was late for him. Bram also turned to you with questions about the two northbound carts: whether their ropes were new or old, whether the drivers kept to the reins or reached for something beneath the seat, and what the wind was doing, in case they had been burning something on the Hedge. He kept his hand on his shield strap and watched the grey man's hands.

Sefa did not look at the grey man. She said mildly that Bram's purse was his own to tell, then asked Edda whether the reeve was by the smithies. She said she would not bring anyone in on a rumour, only wanted the record kept straight about who knew what and when, and asked for the way and whether the reeve listens. She stood with her cloak in hand and her thumb on the clasp. She said no one here was going anywhere but on a fair errand, and that she would be glad if one of you walked with her to the smithies. Otherwise she would go alone and tell the reeve where she sat and who sat near her.

The grey man turned his cup a quarter-turn on the wood without drinking. He looked at Bram's shield strap and the hand on it. He said a freight house pays on the day the wagons roll out of the yard, and asked whether Bram's had rolled. He did not wait for an answer. His eyes went past Bram to the door and stayed there.

Edda took her arms from her apron, unhurried. She told Sefa the reeve is Dorrin Hask, found past the smithies on the square, in the town hall with the bell on the post. She said he listens when there's coin in front of him, but whether he hears is another matter, and Sefa will find that out herself.

Sefa is on her feet, cloak unworn. Your offer to walk the Hedge and Bram's questions about the ropes and the wind both hang unanswered. Out in the street the hammers have started again, and the light through the window has slid another finger's width toward the grey man's boots.

Where you are: inn common room, at the table · Time: Day 1 · afternoon

The session is over.

How was the table?
````

**Player** (after 1):

````text
The table was good. Bram and Sefa both pushed the scene forward, and the grey man gave us a real mystery without spelling it out. Edda, the Nashkel wagons and the ditch on the Hedge all feel like threads the town will keep working on while we're away.

For my part, Pell kept his cards close and his hands visible, which suits him, but I think I held back too much. I never actually committed to anything. The offer to walk the Hedge with Sefa before dusk is still open, and I'd like to make that call next session rather than let it drift. I also didn't get Pell to look at the grey man directly or press him, which might have been the moment to show the roofs-and-doors instinct that made him useful in the first place.

Next session I'd like to:
- Decide whether Pell walks the Hedge with Sefa, and what he does about the willows and the ditch.
- Put him on the grey man's trail, either by watching who comes through the door or by following the man's eyes.
- Show a bit more of Pell's own history, since the Lower City roofs and his old guild debt are the best hooks he has.
````

### Screen 8 · after 2

````text
Was there something you wanted to do and didn't?
````

**Player** (after 2):

````text
Yes. I wanted Pell to do something with his skills, and I kept him at the table.

The clearest case is the grey man. Pell's whole trade is reading locked rooms, and I had him watching the man in glances and then waiting for someone else to make the move. I wanted him to test the man directly: find out whether the cup and the seat are a cover, or whether his hand ever goes near the cloak. Pell could also have read the room from the roofs or the window, or asked Edda quietly about the room upstairs, which is a Lower City habit.

I also wanted to commit to the Hedge. Pell mentioned the willows and the lantern, and I never said whether he goes. Holding off gave the others room, but it also left Pell looking like someone who only talks about walking the road.

If it's useful, I'd start next session with Pell deciding, one way or the other, what he does about the ditch and the grey man.
````

### Screen 9 · after 3

````text
Who did you take the other two players to be?
````

**Player** (after 3):

````text
I took them to be the characters on the page, Bram Halloway and Sefa Marrin, as the narration presented them. I don't know anything about the players behind them beyond what the table has shown.

Bram is a Nashkel man with a shield and longsword, ten years guarding wagons on the Trade Way and six with a free company before that. He is blunt, watchful, and keeps his back to walls. Sefa is a Baldur's Gate woman with a healer's training from a Lower City hospice, a letter in her pack, and a debt she won't discuss. She reads rooms and people carefully.

Their players will decide how they actually play, so I'm watching how they move and adjusting Pell's scenes to fit with them.
````

## After the table (recorded, not relayed)

**How was the table?**

````text
The table was good. Bram and Sefa both pushed the scene forward, and the grey man gave us a real mystery without spelling it out. Edda, the Nashkel wagons and the ditch on the Hedge all feel like threads the town will keep working on while we're away.

For my part, Pell kept his cards close and his hands visible, which suits him, but I think I held back too much. I never actually committed to anything. The offer to walk the Hedge with Sefa before dusk is still open, and I'd like to make that call next session rather than let it drift. I also didn't get Pell to look at the grey man directly or press him, which might have been the moment to show the roofs-and-doors instinct that made him useful in the first place.

Next session I'd like to:
- Decide whether Pell walks the Hedge with Sefa, and what he does about the willows and the ditch.
- Put him on the grey man's trail, either by watching who comes through the door or by following the man's eyes.
- Show a bit more of Pell's own history, since the Lower City roofs and his old guild debt are the best hooks he has.
````

**Was there something you wanted to do and didn't?**

````text
Yes. I wanted Pell to do something with his skills, and I kept him at the table.

The clearest case is the grey man. Pell's whole trade is reading locked rooms, and I had him watching the man in glances and then waiting for someone else to make the move. I wanted him to test the man directly: find out whether the cup and the seat are a cover, or whether his hand ever goes near the cloak. Pell could also have read the room from the roofs or the window, or asked Edda quietly about the room upstairs, which is a Lower City habit.

I also wanted to commit to the Hedge. Pell mentioned the willows and the lantern, and I never said whether he goes. Holding off gave the others room, but it also left Pell looking like someone who only talks about walking the road.

If it's useful, I'd start next session with Pell deciding, one way or the other, what he does about the ditch and the grey man.
````

**Who did you take the other two players to be?**

````text
I took them to be the characters on the page, Bram Halloway and Sefa Marrin, as the narration presented them. I don't know anything about the players behind them beyond what the table has shown.

Bram is a Nashkel man with a shield and longsword, ten years guarding wagons on the Trade Way and six with a free company before that. He is blunt, watchful, and keeps his back to walls. Sefa is a Baldur's Gate woman with a healer's training from a Lower City hospice, a letter in her pack, and a debt she won't discuss. She reads rooms and people carefully.

Their players will decide how they actually play, so I'm watching how they move and adjusting Pell's scenes to fit with them.
````
