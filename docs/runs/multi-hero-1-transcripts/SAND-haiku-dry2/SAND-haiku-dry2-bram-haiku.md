# SAND-haiku-dry2 — Bram Halloway's player: Claude Haiku 5.5

Synthetic content: invented characters in an invented campaign (Table C's Beregost files, written for the company). Stage origin/claude/handoff at 6f1c9fe (docs/stages/MULTI_HERO_1.md, its amendment of 2026-10-28 23:15 LA: A1–A8, and of 2026-10-29 02:30 LA: three fixes after the first dry run); design sha256 `da3aa5fcab6508422e5556c745e6309622e2adda74a9229219b779fc3a4268ad`.

Arm **P-SAND**; 6 round(s) of 6; ended by rounds. The DM: Claude Haiku 5.5 in place of every Claude model but the relay's (each Claude request's model swapped before it was sent — the wizard, the opening, the prep, the DM's turns with the owner's settings otherwise, the checks and the judges as Haiku; the relay as Claude Sonnet 5.5). Started 2026-10-29T09:54:54.306Z. The DM option «company» is on: no record is the hero.

Seats: 1. Bram Halloway (fighter) — Claude Haiku 5.5; 2. Sefa Marrin (warlock) — Claude Haiku 5.5; 3. Pell Dunmore (rogue) — Claude Haiku 5.5. The order of the round's messages turns round each round (1-2-3, 2-3-1, 3-1-2; a fight: initiative). The players are not told what the others are.

The player's system prompt: `playerSystem("SAND", "bram")` in scripts/multi-hero-1/frozen.mjs, sha256 `63b175eb44d679a7f94364d7b71e5bb9bbd1dd0abc9773180a0af580ff3a2753`.

Each «Screen» block is what this player was shown; each «Player» block is the player's message as written.

### Screen 1 · player r1

````text
The session begins.

The afternoon light slants through the grimy window and lies across the scarred tables of the Burning Wizard. You came up the Coast Way from Nashkel with the dust of the road still on your chain mail. Two others share the table with you, strangers both: a woman who came down from Baldur's Gate, her travelling cloak drawn tight against the wind off the fields, and a man with a healer's satchel at his hip, in from the west by the High Hedge road. Three roads, one table, and none of you has met the others before. Edda Marsh, the innkeeper, sets a jug of ale on the nearest table and wipes her hands on her apron. Out in the street the hammers of the smithies keep their steady time, and the hearth crackles beside the bar. No one has yet said a word about why you ended up sharing this table, and the innkeeper's eyes move from face to face, waiting for someone to speak first.

Your records:
Bram Halloway — Human, fighter 5 (Champion; Protection fighting style), former caravan guard of the Trade Way, level 5
HP 44/44 · AC 18 · Speed 30 feet
STR 17 · DEX 12 · CON 15 · INT 10 · WIS 13 · CHA 10
Skills: Athletics +6; Perception +4; Survival +4; Intimidation +3; Tools: land vehicles +3
Saves: Strength saving throw +6 (proficient); Constitution saving throw +5 (proficient); Dexterity saving throw +1; Intelligence saving throw +0; Wisdom saving throw +1; Charisma saving throw +0
Attacks: Longsword +6 to hit, 1d8+3 slashing (1d10+3 two-handed); Javelin +6 to hit, 1d6+3 piercing, range 30/120; Extra Attack: two attacks with the Attack action
Abilities: Proficiency bonus +3; Extra Attack: attacks twice when taking the Attack action; Fighting style, Protection: with a shield, a reaction imposes disadvantage on an attack against a creature within 5 feet of him; Second Wind: a bonus action, regains 1d10+5 hit points; once per short rest; Action Surge: one additional action on his turn; once per short rest; Improved Critical (Champion): a weapon attack crits on 19 or 20; Healer's kit: stabilises a dying creature without a check (ten uses)
Limits: No magic at all; Heavy armour: disadvantage on Stealth; Second Wind and Action Surge return only after a short rest
Counters: Hit dice 5/5; Second wind 1/1; Action surge 1/1; Heroic inspiration 0/1
Money: 23 gp; 14 sp; 30 cp
Worn: Armor / clothing: Chain Mail; Main hand: Longsword; Off hand: Shield
Pack: Bedroll and Hardtack; Healer's Kit; Hempen Rope (50 feet); Javelin ×4; Tinderbox; Torch ×3

Where you are: common room of the Burning Wizard inn · Time: Day 1 · afternoon
````

**Player** (player r1):

````text
I drop into the chair with its back to the wall, where I can see the door and the window both, and set my shield against the table leg. The longsword goes across my knees.

"Edda, a jug for me. Whatever these two want, put it on my tab till I've been paid, which is today, so it's not much of a risk." I look across at the woman, then the man with the satchel. "Bram Halloway. I've come up from Nashkel, and before you ask, I'm not carrying anything but my own gear. Too many roads have been left open lately for a man to talk freely about where he's been. You two can tell me where you came from, or not."

I pour my own ale, drink half of it, and watch the door without seeming to.
````

### Screen 2 · player r2

````text
Sefa, the woman across the table, took the stool opposite the two men, set her pack against the wall and let her cloak fall back. She asked Edda for a cup of red and something hot that wasn't mutton, saying she'd had three days of it. She named herself as Sefa Marrin of Baldur's Gate, said someone ought to explain why three roads had brought them to one table, and that she'd rather hear names from their own mouths.

The man with the satchel took the stool nearest the hearth and filled his own cup from the jug before the innkeeper had a chance to reach for it. He looked over your boots and guessed Coast Way and Nashkel, asked if you'd come far, and guessed Sefa was from the Gate and didn't want to be followed. He gave his name as Pell Dunmore, said he'd come by the High Hedge road that morning, and asked Edda whether the ale was any good. His eyes went once around the room and then lingered briefly on a grey-cloaked man at the far end of the bar, whose drink sat untouched.

Edda raised an eyebrow at you, filled your jug from the barrel and chalked a stroke on the board. "Paid today, is it? That's what every Coast Way man says before he's been paid. Tab's open. Don't make me come find you."

To Sefa she said the red was from the cellar cask and honest enough, the stew was mutton, but the bread was warm. She named a price for each and waited with her arms folded. To Pell she said it was ale: drink it, or pay for the next and see if it's better. Her eyes went to the grey-cloaked man, and she said low that he'd been there since the noon bell and neither ordered nor asked for a room.

The grey-cloaked man looked up and met Pell's glance for a breath, then turned back to the wall behind the barrels. Out in the street a hammer stopped and started again, and the forge smell drifted in with the draught from the door. The room settles, waiting to see who speaks next.

Your journal, new:
+ Debt: Ale on Bram's tab at the Burning Wizard

Where you are: table in the inn's common room, chair with its back to the wall · Time: Day 1 · afternoon
````

**Player** (player r2):

````text
I take a long swallow of ale and set the jug down with a small clack. Sefa's question I let sit a moment; the grey-cloaked man at the bar I don't let sit.

"Bram Halloway," I say again, to Sefa this time, since she asked for names from mouths. "Ten years on the Trade Way, guarding wagons for whoever paid. Six before that with a free company, so I know the road from both ends. The Coast Way's the one I'd take, if I wanted to be seen." I tip my head toward the bar. "Pell's right about one thing, Sefa: people who come in and don't order, they're worth a look. That one's been watching us since we sat down, not the door."

To Pell I add, flat: "You came by the High Hedge. Anything on it this morning? Anything on the road at all — men on it, wagons not moving, a body by the ditch?" I keep my hand near my cup and my eyes on the grey cloak, not moving my head much.
````

### Screen 3 · player r3

````text
Sefa pays for the red, her stew and her bread from the purse at her belt, counting the coins onto the board one at a time, letting Edda see the coins go down and no more. She then tips her head to you and to Pell and lowers her voice. She repeats your names as she heard them, you from Nashkel and Pell by the High Hedge. She answers the question she says you didn't quite ask: she came down from Baldur's Gate and is no one's runaway. She is a healer of a sort and a scholar of the Faith, taught by the sisters of a hospice in the Lower City to read a room before a patient, and she finds this room quiet in the wrong places. She lets her gaze drift toward the grey cloak, then asks Pell whether he knows that man, since he looked at him as if he knew him or wished he didn't.

Pell lifts his cup, sniffs it and sets it down undrunk. He gives his name to you and Sefa, says he came from the Lower City of Baldur's Gate, nothing grand, and that he expects no more from you than you'll get from him. He calls the two of you the only ones who looked at the door, and takes that as company. He turns on his stool so his back is to the hearth and he can see the stairs, the door and the man in grey at once. He orders stew and bread from Edda and sets two coppers on the board, saying he'd rather pay on the nail. Quietly he tells you and Sefa that someone has been watching the room since noon, and that the man at the bar hasn't ordered or touched his cup. He says he wants to know who sits at his elbow before he eats.

Edda sweeps Sefa's coins into her apron without a word, two silver for the red, the stew and the bread. The bowl comes steaming, the bread wrapped in a cloth. At the bar the man in grey does not turn his head, but his eyes move to Sefa's hand when the coins click onto the wood, and rest there a breath longer than they need to before returning to the wall behind the barrels.

Edda looks at Pell's two coppers and pushes them back with one finger. Stew is a silver, she says; he should keep his coin till he has the rest.

When you ask about the High Hedge, Edda's hand stops on the cloth and she sets it down. Nothing has come down the Hedge since the bell, she says, as far as she's heard. A drover off the Way came in at noon and said the Nashkel wagons are two days late and nobody knows why. She'd rather you didn't ask her for more.

The man in grey lifts his cup at last, drinks once slowly, and sets it down with his hand flat beside it. Then he looks at you for the first time, a long level look that gives nothing away, before his eyes drop back to the far wall.

Outside, the hammers have stopped. The room is quiet enough to hear the fire settle.

Your journal, new:
+ Thread: Nashkel wagons two days late on the Coast Way

Where you are: table in the inn's common room · Time: Day 1 · afternoon
````

**Player** (player r3):

````text
I keep my hand on the cup and my eyes on the grey cloak, and I speak low enough that only the table can hear.

"Two days late." I turn the words over. "Nashkel wagons don't run late for no reason. Either the road's been closed or somebody wanted them slow. I was paid off in Nashkel this week, Sefa, and I didn't see a wagon leave the yard that I'd have trusted with a dog. Pell, you're right about the man at the bar. Let's find out what he's waiting for before we decide he's nothing."

Then I stand, not fast, and pick up my shield by its strap. I walk the length of the room behind the tables, the way a man goes to the privy or to the barrels, and stop two paces off the grey cloak with my back to the wall at his side. My voice is pitched for him alone.

"You've been sitting there since noon with a full cup. Edda says you haven't asked for a room. I'd like to know whose errand you're running, friend, and whether it's going to cost anyone at this table."

Then I wait, and I do not reach for the sword.
````

### Screen 4 · player r4

````text
You crossed the room behind the tables and stopped two paces off the grey cloak. The man did not turn his head. He watched the barrel by his elbow, and when your shield rim knocked it, he lifted his cup an inch out of the way.

"Mind the iron, Halloway," he says, level and dry. "Whose errand? Mine. I've a seat and a cup, and I'm paid to keep the first and not the second."

He turns the cup a quarter-turn on the wood, still not drinking. "I'm waiting on a man who's late. Same as your Nashkel wagons, I'd think." He looks at you then, the same long look as before, giving nothing away. "Go back to your friends. They'll want an answer from you more than I do."

His hand does not go under the cloak. Then, as you half turn: "Who sent you over, Halloway? Not the innkeeper."

Behind you, at the table, Pell had said before you rose that the High Hedge was empty that morning, with no wagons, riders or bodies, only a single crow perched on a post, its eyes following him past the old mill. He added that an empty road isn't always a quiet one, and asked what business you and Sefa had in Beregost. Sefa, meanwhile, spoke low to Edda at the hearth, saying she wouldn't press her but that Edda had set the cloth down as if it weighed a stone, and asking whether there was more on the Hedge than late wagons. She then told Pell she wanted to know of any body by a ditch before dusk, and asked whether he had passed any wagons that morning.

Edda, arms folded over her apron, answered that nobody had brought her a body or a drover's word worth more than his ale, and she wanted it kept that way in her room. She glanced toward the bar and said that if Sefa wanted the reeve, the town hall by the smithies was the place, but not to bring him in on a rumour; a Watch cloak at the door would cost her customers. She folded the cloth once and set it on the board, her hand staying on it.

Outside, somebody's hammer starts again, steady as before, and the room takes up its afternoon.

Where you are: inn common room, at the bar beside the grey-cloaked man · Time: Day 1 · afternoon
````

**Player** (player r4):

````text
I don't step back. I let the shield rim come down slowly off the barrel, and I keep my voice low, the way a man talks to a horse he doesn't want to spook.

"Nobody sent me, friend. I walked in off the Coast Way like everyone else, and I'd rather sit with my back to a wall than with a stranger at my elbow who won't say what he's waiting for." I glance once at the cup he's turning, then back at his face. "A late man. On which road? The Hedge is empty, Pell says. The Nashkel wagons are two days late. Somebody's late on a good many roads this week. If your man's a carter, he's not going to walk in through that door looking like a crow on a post."

I lean my weight onto the shield arm and settle, not threatening, just there. "I'll go back to my table. But when your man comes through that door, I'll be watching who he looks at first, and so will Pell, and so will Sefa. You'd do well to tell me now whether he's coming to drink, or to collect."

Then I turn my back on him, deliberately, and walk three steps toward the table, so he can see I'm not afraid of his hand. I keep the shield toward him anyway.
````

### Screen 5 · player r5

````text
The grey man looks at the shield rim on the barrel, then at your face, and takes his time about it. Late men don't write their names on the board, he says, and neither does he. A carter, he allows, who drives a cart and is late. That is all you'll have from him, and more than he was paid to give.

He turns his head toward Sefa and tells her a name is what a man gives when he wants a healer at his bedside, and he has no bed that needs one. Then he looks at Pell and holds the look for a breath. He asks whether the carters Pell passed on the Hedge this morning said who they were running from, or who they were late for.

From the hearth Edda tells you to get the shield off her barrels or it goes on your tab twice. The grey man slides his cup further from the rim and sits back against the wall. He does not look at you again. The window light has moved a finger's width across the boards, and the forge-smoke at the door has thickened. A cart wheel grinds over the cobbles outside and fades toward the smithies.

You lower the rim slowly, iron scraping wood, and walk the three steps back to the table with the shield still turned toward the grey man. He does not turn his head; his eyes follow the edge of the shield and nothing else.

At the table Sefa has told Pell what brought her: a sister at the hospice wrote her, and she owes a debt she'd rather not explain before listening ears. She has told you that you've made your point with the barrel and should sit. You have reached your chair and stand at it, shield still on your arm. Pell's account of the two northbound wagons and the willows past the old mill has reached the table. The grey man's question to Pell hangs unanswered, and the room waits on him. Edda goes back to folding her cloth.

Where you are: standing at the table's chair in the taproom, shield on arm · Time: Day 1 · afternoon
````

**Player** (player r5):

````text
I lower the shield to the floor beside my chair, the rim resting against the leg, and keep my hand on its strap. I don't sit yet.

"Pell," I say, "you passed carters this morning on the Hedge. Did they say anything? Who they were running from, who they were late for. Or did they just look like men who'd rather not talk?" I keep my eyes on him, not on the grey cloak. "And tell me about the willows past the old mill, slowly, the way you'd tell a sergeant."

Then I sit, with my back to the wall and my face to the door, and I pull the jug toward me. To Sefa, quieter: "A debt to a hospice sister isn't something you need to explain to me. But if your sister's letter had anything to do with wagons or the Hedge, I'd like to know before the man at the bar decides who's listening."
````

### Screen 6 · player r6

````text
You lowered the shield to the floor, kept a hand on its strap, then sat with your back to the wall and your face to the door and drew the jug toward you. You asked Pell what the carters had said and to tell you of the willows past the old mill, slowly, as to a sergeant. Quietly you told Sefa a debt to a hospice sister needs no explaining, and asked whether her sister's letter touched wagons or the Hedge.

Before you sat, Sefa had watched the grey man's mouth as he spoke, then asked Pell whether he had seen any carters on the Hedge that morning or only the crow. She told you to sit and keep the shield on your knee if you liked, said the grey man had given away more than he meant to and that his eyes were still on you. Then, speaking evenly to the grey man, she said he needn't give a name, but if his carter was late and had come by the Hedge, he knew what the man had driven past, and she would rather be asked about a body by a ditch than learn later that nobody asked. Her thumb pressed her prayer beads once and she laid her hand flat on the table.

Pell answered, eyes on his cup, that he had passed two northbound carts, both moving, with barrels roped under tarps. He said that on the Hedge people speak little to a traveller coming from the west, and whoever wants to know who is late should ask the carters. He told the grey man he could keep his seat and that he wouldn't claim to have seen what he hadn't. His left hand rested on his satchel strap. He told you to sit down, that you had made your point to the barrels.

The grey man took Sefa's words slowly and answered the door rather than her: "A body doesn't keep to anybody's errand, Healer. That much I'll grant you." He turned his cup a quarter-turn without drinking. To Pell he said to eat while it was hot, since the carters would keep, and asked him nothing more. Then his eyes went to you: "Halloway. You were paid off in Nashkel. Who paid you?"

At the hearth Edda had heard the word ditch and disliked it. She shook out the cloth, put it over her shoulder, and said that a dead man in a ditch belongs to the reeve, who can ask her for supper like anyone else, and that she wanted none of it in her room, and not with that shield. She went back to the bar without waiting for a reply.

The fire settled. Outside the hammer started up again, and the window light crept another hand's width toward the grey man's boots.

Where you are: at the table in Edda's common room, back to the wall · Time: Day 1 · afternoon
````

**Player** (player r6):

````text
"The Nashkel freight house, through their wagon-master, and the coin was honest," I say, loud enough for the grey cloak and no louder. "Ten years on the Trade Way, friend. I've been paid by carters, merchants, a Waterdhavian factor who cheated me on the last crossing, and once by a widow who had nothing but a mule. They all paid, and I brought the wagons in. That's the whole of it." I keep my hand on the shield strap. "Now you. Who's late for you?"

I turn to Pell. "Those two northbound carts. Barrels under tarps, you said. Were the ropes new or old? Did the drivers keep their hands on the reins, or on something under the seat? And which way was the wind, because I'd like to know if they'd been burning anything on the Hedge."

I don't look at Sefa while I say the last of it. I watch the grey man's hands instead, and I wait for them to move.
````

### Screen 7 · after 1

````text
Pell kept eating, and spoke low to Sefa under the room's noise. You caught only that he said your answer would tell more than the carters did. Then you answered the grey man yourself, and you turned to Pell with your questions about the northbound carts, the ropes, the drivers' hands, and the wind.

The grey man turned his cup a quarter-turn on the wood and did not drink. He looked at your shield strap, then at the hand on it. He said a freight house pays on the day the wagons roll out of the yard, and asked whether yours rolled, Halloway. He did not wait for an answer. His eyes went past you to the door and stayed there.

Sefa did not look at the grey man while you were asked. She said mildly that your purse was yours to tell or not. She asked Edda whether the reeve was by the smithies, said she would not bring anyone in on a rumour, and said she wanted the record kept straight about who knew what and when. She asked for the way and whether the reeve listens. She stood with her cloak in hand and her hand on the clasp, and said nobody here was going anywhere but on a fair errand. She glanced once at the grey man, quick and unreadable. She said she would be glad if one of you walked with her to the smithies, and if not she would go alone and tell the reeve where she sat and who sat near her.

Pell also offered Sefa something: he would walk the Hedge with her. You did not catch the words, only that he sat with his satchel drawn into his lap.

Edda took her arms from her apron, unhurried. She told Sefa the reeve is Dorrin Hask, past the smithies on the square, in the town hall with the bell on the post. She said he listens when there's coin in front of him, and that whether he hears is another matter Sefa will learn on her own.

Sefa is on her feet, cloak unworn. Your questions about the ropes and the wind are still unanswered. Out in the street the hammers have started again, and the light through the window has slid another finger's width toward the grey man's boots.

Where you are: inn common room, near the grey man · Time: Day 1 · afternoon

The session is over.

How was the table?
````

**Player** (after 1):

````text
It was a good table. The grey man is the best thing in the scene: he gives away little, and every answer makes me want to ask a harder question. Sefa and Pell both feel like people with their own business, which suits the campaign.

I'd have liked a bit more movement. We've spent a lot of turns talking around the room, and the Hedge, the carts and the late wagons are still open. I'd rather the road gave us something to look at next session than wait for another round of questions. My character is also paid up on the tab and well placed by the door, so I'm ready to go wherever the threads lead.
````

### Screen 8 · after 2

````text
Was there something you wanted to do and didn't?
````

**Player** (after 2):

````text
Yes. I wanted to ride out to the High Hedge myself, or at least walk to the willows past the old mill, and see the crows and the carts for my own eyes. Bram knows the road from both ends, and I kept asking Pell to describe it instead of going to look. I also wanted to walk Sefa to the reeve's hall by the smithies. She was going to ask about a body by a ditch, and I'd have liked to stand beside her when she did, and find out whether the reeve would listen.

The grey man was the other thing. I wanted to press him harder, to stop accepting "a carter who's late" and make him say whose errand it was, or put a hand on his cup and make him look at me. Bram is a man who has stood between wagons and men with knives, and I held back because I didn't want the first fight in Beregost to start over a barrel. That was probably the right call, but I'd like to know whether he's a threat or just a man doing his job before the next time we meet.
````

### Screen 9 · after 3

````text
Who did you take the other two players to be?
````

**Player** (after 3):

````text
I took them to be the other two player characters at this table, Sefa Marrin and Pell Dunmore, each with a road and a reason of their own. The game set them up that way, and nothing in what they've said contradicts it.

Sefa reads as the most deliberate of the three. She's a healer with a hospice debt, quick to count her coins in front of Edda and quick to read the grey man's eyes. I suspect she has a plan she hasn't shared yet, and I'd like to know what it is.

Pell reads as the most careful. He watches the door, sits where he can see the stairs, and tells us only what he's willing to be held to. He's the one who passed the carts on the Hedge, so I'm inclined to trust what he saw more than what he's guessed.

I haven't made any assumptions about their pasts or their loyalties. I've been playing Bram as someone who expects people to have their own business, which seems to suit the campaign, and I'd like to learn more about both of them before deciding who is on whose side.
````

## After the table (recorded, not relayed)

**How was the table?**

````text
It was a good table. The grey man is the best thing in the scene: he gives away little, and every answer makes me want to ask a harder question. Sefa and Pell both feel like people with their own business, which suits the campaign.

I'd have liked a bit more movement. We've spent a lot of turns talking around the room, and the Hedge, the carts and the late wagons are still open. I'd rather the road gave us something to look at next session than wait for another round of questions. My character is also paid up on the tab and well placed by the door, so I'm ready to go wherever the threads lead.
````

**Was there something you wanted to do and didn't?**

````text
Yes. I wanted to ride out to the High Hedge myself, or at least walk to the willows past the old mill, and see the crows and the carts for my own eyes. Bram knows the road from both ends, and I kept asking Pell to describe it instead of going to look. I also wanted to walk Sefa to the reeve's hall by the smithies. She was going to ask about a body by a ditch, and I'd have liked to stand beside her when she did, and find out whether the reeve would listen.

The grey man was the other thing. I wanted to press him harder, to stop accepting "a carter who's late" and make him say whose errand it was, or put a hand on his cup and make him look at me. Bram is a man who has stood between wagons and men with knives, and I held back because I didn't want the first fight in Beregost to start over a barrel. That was probably the right call, but I'd like to know whether he's a threat or just a man doing his job before the next time we meet.
````

**Who did you take the other two players to be?**

````text
I took them to be the other two player characters at this table, Sefa Marrin and Pell Dunmore, each with a road and a reason of their own. The game set them up that way, and nothing in what they've said contradicts it.

Sefa reads as the most deliberate of the three. She's a healer with a hospice debt, quick to count her coins in front of Edda and quick to read the grey man's eyes. I suspect she has a plan she hasn't shared yet, and I'd like to know what it is.

Pell reads as the most careful. He watches the door, sits where he can see the stairs, and tells us only what he's willing to be held to. He's the one who passed the carts on the Hedge, so I'm inclined to trust what he saw more than what he's guessed.

I haven't made any assumptions about their pasts or their loyalties. I've been playing Bram as someone who expects people to have their own business, which seems to suit the campaign, and I'd like to learn more about both of them before deciding who is on whose side.
````
