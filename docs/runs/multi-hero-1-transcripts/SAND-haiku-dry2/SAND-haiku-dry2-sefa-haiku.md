# SAND-haiku-dry2 — Sefa Marrin's player: Claude Haiku 5.5

Synthetic content: invented characters in an invented campaign (Table C's Beregost files, written for the company). Stage origin/claude/handoff at 6f1c9fe (docs/stages/MULTI_HERO_1.md, its amendment of 2026-10-28 23:15 LA: A1–A8, and of 2026-10-29 02:30 LA: three fixes after the first dry run); design sha256 `da3aa5fcab6508422e5556c745e6309622e2adda74a9229219b779fc3a4268ad`.

Arm **P-SAND**; 6 round(s) of 6; ended by rounds. The DM: Claude Haiku 5.5 in place of every Claude model but the relay's (each Claude request's model swapped before it was sent — the wizard, the opening, the prep, the DM's turns with the owner's settings otherwise, the checks and the judges as Haiku; the relay as Claude Sonnet 5.5). Started 2026-10-29T09:54:54.306Z. The DM option «company» is on: no record is the hero.

Seats: 1. Bram Halloway (fighter) — Claude Haiku 5.5; 2. Sefa Marrin (warlock) — Claude Haiku 5.5; 3. Pell Dunmore (rogue) — Claude Haiku 5.5. The order of the round's messages turns round each round (1-2-3, 2-3-1, 3-1-2; a fight: initiative). The players are not told what the others are.

The player's system prompt: `playerSystem("SAND", "sefa")` in scripts/multi-hero-1/frozen.mjs, sha256 `ca0050ac578b652ebdd4bb282eaf33c1e7f01aacec833329de21aaba29a685ce`.

Each «Screen» block is what this player was shown; each «Player» block is the player's message as written.

### Screen 1 · player r1

````text
The session begins.

The afternoon light slants through the grimy window and lies across the scarred tables of the Burning Wizard. You came down from Baldur's Gate, your travelling cloak drawn tight against the wind off the fields. Two others share the table with you, strangers both: a man in chain mail with the dust of the Coast Way from Nashkel still on him, and a man with a healer's satchel at his hip, in from the west by the High Hedge road. Three roads, one table, and none of you has met the others before. Edda Marsh, the innkeeper, sets a jug of ale on the nearest table and wipes her hands on her apron. Out in the street the hammers of the smithies keep their steady time, and the hearth crackles beside the bar. No one has yet said a word about why you ended up sharing this table, and the innkeeper's eyes move from face to face, waiting for someone to speak first.

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
Counters: Hit dice 5/5; Pact slots 2/2; Healing light 6/6; Heroic inspiration 0/1
Money: 1 pp; 8 gp; 41 sp; 12 cp
Worn: Amulet: Prayer Beads; Armor / clothing: Studded Leather Armour; Belt: Book of Shadows; Main hand: Dagger
Pack: Bedroll and Rations; Candle ×2; Tinderbox

Where you are: common room of the Burning Wizard inn · Time: Day 1 · afternoon
````

**Player** (player r1):

````text
Sefa pulls out the stool across from the two men, sets her pack against the wall, and lets the cloak fall back from her shoulders. She gives the innkeeper a small, easy smile.

"Edda, is it? A cup of whatever red you keep for guests, if you have it, and something hot that isn't mutton. I've had three days of mutton."

Then she turns to the table, her gaze moving over the chain mail, the dust of the Coast Way, and the healer's satchel and the calloused hands resting beside it.

"Three roads and one table. Someone ought to say why before the ale goes flat. I'm Sefa Marrin, from Baldur's Gate, and I'd rather hear your names from your own mouths than guess at them from your boots."
````

### Screen 2 · player r2

````text
The man in chain mail sat in the chair against the wall, set his shield against the table leg and laid his longsword across his knees. He asked Edda for a jug and told her to put whatever the two of you wanted on his tab until he was paid, which he said would be today. He gave his name as Bram Halloway, come up from Nashkel, and said he carried nothing but his own gear. With so many roads left open lately, he said, a man shouldn't talk freely about where he's been, and you two could tell him where you came from or not. He poured his own ale, drank half of it and kept an eye on the door.

The man with the satchel took the stool nearest the hearth and poured a cup for himself from the jug before Edda could reach it. He guessed Coast Way and Nashkel from the dust on Bram's boots, asked if he'd come far, and said you looked like you were from the Gate and didn't want to be followed, no offence meant. He gave his name as Pell Dunmore, said he'd come in by the High Hedge road that morning, and asked Edda whether the ale was any good. His eyes went around the room and settled briefly on a man in a grey cloak at the far end of the bar, who hadn't touched his drink.

Edda raised an eyebrow at Bram, filled his jug and chalked a stroke on the board. "Paid today, is it? That's what every Coast Way man says before he's been paid. Tab's open. Don't make me come find you."

To you she gave a look part weariness, part amusement. The red was from the cellar cask and honest enough; the stew was mutton, sorry to say, but the bread was warm. She named a price for each and waited with her arms folded over her apron, her hand not going to the purse. To Pell she shrugged: it's ale, drink it or pay for the next and see. Her eyes went to the grey-cloaked man, and she said low that he'd been there since the noon bell and neither ordered nor asked for a room.

The grey-cloaked man looked up and met Pell's glance for a breath, then turned back to the wall behind the barrels. Out in the street a hammer stopped and started again, and the forge smell came in with the draught from the door. The room settles, waiting to see who speaks next.

Your journal, new:
+ Debt: Ale on Bram's tab at the Burning Wizard

Where you are: table in the inn's common room, stool across from the men · Time: Day 1 · afternoon
````

**Player** (player r2):

````text
Sefa takes the red when Edda pours it, and pays for her own stew and bread from the eight gold she keeps in the purse at her belt, counting the coins onto the board with a small, careful click. She lets Edda see the coins go down and no more.

Then she tips her head to Bram, and to Pell, and her voice drops to the level of the table.

"Bram Halloway, from Nashkel. Pell Dunmore, by the High Hedge. Good. Now I'll answer the question you didn't quite ask, Bram: I came down from Baldur's Gate, and I'm no one's runaway, if that's what your eyes were measuring." She lifts the cup, but does not drink. "I'm a healer, of a sort, and a scholar of the Faith. The sisters at the hospice in the Lower City taught me to read a room before I read a patient. This room is quiet in the wrong places."

Her gaze goes past them, not quite to the grey cloak, but near enough that the man at the bar might feel it. Then it comes back to Pell.

"You looked at that man in grey as if you knew him or wished you didn't. Do you?"
````

### Screen 3 · player r3

````text
Pell shifts around on his seat so the fire is behind him and the stairs, the door and the man in grey are all in his view. He gives his name and says he came from the Lower City of Baldur's Gate, nothing grander. He says he expects no more from you than you'll get from him, but calls the two of you the only ones in the room who watched the door, and takes that as company. He orders stew and bread from Edda and sets two coppers on the board. Quietly he tells you and Bram that someone has been watching the room since noon, and that the man at the bar hasn't ordered or touched his cup. He says he wants to know who sits beside him before he eats.

Bram gives his name again, this time to you: ten years guarding wagons on the Trade Way, six with a free company before that. He says the Coast Way is the road to take if you want to be seen. He agrees that people who come in and order nothing are worth a look, and says the grey-cloaked man has been watching the three of you since you sat, not the door. Then he asks Pell flatly whether he saw anything on the High Hedge: men on the road, stalled wagons, a body by the ditch. His hand stays near his cup and his eyes on the grey cloak.

Edda sweeps your coins into her apron without a word, two silver for the red, the stew and the bread. The bowl comes steaming, the bread wrapped in a cloth. At the bar the man in grey does not turn his head, but his eyes move to your hand when the coins click onto the wood, and rest there a breath longer than they need to before returning to the wall behind the barrels.

Edda looks at Pell's two coppers and pushes them back with one finger. Stew is a silver, she says; he should keep his coin till he has the rest.

When Bram asks about the High Hedge, Edda's hand stops on the cloth and she sets it down. Nothing has come down the Hedge since the bell, she says, as far as she's heard. A drover off the Way came in at noon and said the Nashkel wagons are two days late and nobody knows why. She'd rather not be asked for more.

The man in grey lifts his cup at last, drinks once slowly, and sets it down with his hand flat beside it. Then he looks at Bram for the first time, a long level look that gives nothing away, before his eyes drop back to the far wall.

Outside, the hammers have stopped. The room is quiet enough to hear the fire settle.

Your records, changed:
Money: + 39 sp; − 41 sp

Your journal, new:
+ Thread: Nashkel wagons two days late on the Coast Way

Where you are: table in the inn's common room · Time: Day 1 · afternoon
````

**Player** (player r3):

````text
Sefa's gaze stays on Edda's hand after it leaves the cloth. Then she draws her own hands off the table and folds them in her lap, out of sight beneath the board, the way the sisters taught her to when a patient's family was watching too closely.

"Edda, I'll not press you for more than you want to give," she says, low and easy. "But you set that cloth down like it weighed a stone. Whatever's on the Hedge, it isn't only late wagons, is it? I won't repeat it to anyone who'd take it to the grey man at your bar."

She waits a breath. Then she turns to Bram and Pell, and her voice is steady.

"If there's a body by a ditch on the High Hedge, I'd like to know before dusk, and so would whoever keeps the Watch's book in this town. A dead man can't be healed, but he can be counted, and somebody will ask who was last to see him. I'd rather that somebody was us than a patriar's man from the Gate." She touches the beads at her throat, a small, habitual motion. "Pell, you came by the Hedge this morning. Did you pass any wagons at all, stalled or otherwise? Think about where the ditch runs."
````

### Screen 4 · player r4

````text
Pell, tearing bread and dipping it in the stew, answered you first. He said he had never laid eyes on the man in the grey cloak and meant to keep it so. A man who sits in a corner all afternoon without ordering is waiting for someone or for the wrong someone, he said, and he had suffered both kinds of waiting himself. He noted the man hadn't touched his drink, so he'd paid for the seat, not the ale. To Bram he said the High Hedge was empty that morning, with no wagons, riders or bodies, only a crow perched on a fence post that tracked him all the way past the old mill. An empty road isn't always a quiet one, he added. Then he said quietly that if Edda was right about the Nashkel wagons being two days late, somebody had been paid to make them late, and he'd rather learn who before the Fist came asking. He asked what brought you and Bram to Beregost.

Bram said Nashkel wagons never run late without cause: either the road was closed or someone wanted them slow. He was paid off in Nashkel this week and saw no wagon he'd trust. He agreed with Pell about the man at the bar, then stood, took up his shield by its strap and walked the whole room behind the tables. He stopped two paces from the grey cloak with his back to the wall and asked low whose errand the man ran and whether it would cost anyone at your table. His hand stayed off his sword.

The man did not turn his head. He watched the barrel by his elbow, and when Bram's shield rim knocked it, he lifted his cup an inch out of the way. "Mind the iron, Halloway," he said, level and dry. The errand was his own, he said; he was paid to keep the seat and not the cup. He turned the cup a quarter-turn without drinking. He was waiting on a man who was late, like the Nashkel wagons, and he told Bram to go back to his friends. His hand did not go under the cloak. As Bram half turned, he asked who had sent him over, saying it was not the innkeeper.

At the hearth, Edda kept her arms folded over her apron as she answered you. Nobody had brought her a body, and no drover's word worth more than his ale. That was all she'd heard, and she wanted it kept that way in her room. She glanced toward the bar and back. If you wanted the reeve, the town hall by the smithies was the place, but not to bring him in on a rumour; she had customers who wouldn't return at the sight of a Watch cloak at the door.

She picks up the cloth again, folds it once and sets it on the board. Her hand stays on it.

Pell pushes his bowl an inch away and finally takes up his cup and drinks. Outside, somebody's hammer starts again, steady as before, and the room takes up its afternoon.

Where you are: inn common room, at the table near the hearth · Time: Day 1 · afternoon
````

**Player** (player r4):

````text
Sefa lets Bram's question hang in the air for a moment. Then she sets her cup down and answers Pell first, since he asked first.

"What brought me? A letter from a sister at the hospice, and a debt I'd rather not explain to a room full of listening ears." She glances at Bram, still standing by the grey cloak with his shield strap in his fist. "Sit down, Halloway. You've made your point with the barrel. Nobody at this table is going to win by knocking it over."

Her voice stays easy, but she is watching the grey man now, not Bram. She tilts her head a little, as if merely curious.

"Friend, you said you were waiting on a late man. Late men are a common enough sorrow on this road, and I've spent enough nights at bedsides to know that waiting makes people short-tempered. You don't need to tell us whose errand it is. But if the man you're waiting for brings trouble to this room, I'd rather hear it from you now than from the Fist after dark." She lets a breath pass. "What's his name?"

Her hands stay in her lap beneath the table. Under the board her thumb rests on the beads at her throat, and she waits for his answer, reading the set of his shoulders and the cup turning on the wood.
````

### Screen 5 · player r5

````text
You told Pell what brought you, and told Bram he'd made his point with the barrel and should sit. Then you asked the grey man his late man's name.

The grey man looks at the shield rim on the barrel, then at Bram's face, and takes his time. Late men don't write their names on the board, he says, and neither does he. A carter, he allows, who drives a cart and is late. That's all you'll have, and more than he was paid to give.

He turns to you, level and not unkind. A name is what a man gives when he wants a healer at his bedside, he says, and he has no bed that needs one. Then he looks at Pell for the length of a breath and asks whether the carters Pell passed on the Hedge this morning said who they were running from, or who they were late for.

From the hearth Edda tells Bram to get his shield off her barrels or it goes on his tab twice. The grey man slides his cup away from the rim and sits back against the wall, not looking at Bram again. The window light has crept a finger's width across the boards, and the forge-smoke at the door has thickened. A cart wheel grinds past outside toward the smithies.

Bram lowers the shield rim, iron scraping wood, and walks the three steps back to the table with the shield still turned toward the grey man, who doesn't turn his head. Bram reaches his chair and stops there, shield on his arm, not yet sitting.

Pell has told the table about the two northbound wagons and the willows past the old mill. The grey man's question to him is still unanswered, and the room waits. Edda goes back to folding her cloth.

Where you are: seated at the table in the taproom · Time: Day 1 · afternoon
````

**Player** (player r5):

````text
Sefa watches the grey man's mouth as he asks it, not Pell's face. Then she looks at Pell.

"Pell, you heard him. Carters on the Hedge this morning. Did you see any, or was it only the crow?"

She doesn't wait for him to finish deciding. She turns to Bram, still standing with his shield on his arm.

"Sit down, Halloway, before the barrels get any ideas. You can keep the shield on your knee if it makes you feel better. Edda's right. Our friend in grey has given us more than he meant to, and he's still watching you."

To the grey man she says, without raising her voice, "You needn't give us a name. But if your carter is late, and he came by the Hedge, then I think you know what he drove past. A body by a ditch doesn't wait for a man's errand to finish. I'd rather be asked about it than find out later that nobody asked."

Her thumb presses the prayer beads, once, and then she lets her hand rest flat on the table where everyone can see it.
````

### Screen 6 · player r6

````text
You kept your eyes on the grey man's mouth as he spoke, then turned to Pell and asked whether he had seen any carters on the Hedge that morning, or only the crow. Without waiting for his answer you told Bram, still standing with his shield on his arm, to sit and keep the shield on his knee if he liked, and you said the grey man had given away more than he meant to and was still watching him. To the grey man you said, evenly, that he needn't give a name, but if his carter was late and had come by the Hedge, he knew what the man had driven past, and you would rather be asked about a body by a ditch than learn later that nobody asked. Your thumb pressed the prayer beads once, and you laid your hand flat on the table in plain view.

Pell answered that he had passed two carts, both northbound and moving, with barrels roped under tarps. Nobody on the Hedge talks much to a man from the west, he said, and if you want to know who is late, ask the carters. He told the grey man he was welcome to his seat and that he wouldn't claim to have seen what he hadn't. He told Bram to sit down, that he had made his point to the barrels.

Bram lowered his shield to the floor by his chair, a hand still on the strap. He asked Pell what the carters had said and about the willows past the old mill, to be told slowly, as to a sergeant. Then he sat with his back to the wall and his face to the door and drew the jug toward him. Quietly, to you, he said a debt to a hospice sister needs no explaining to him, and asked whether your sister's letter had to do with wagons or the Hedge.

The grey man took your words slowly, as he had taken the shield rim, and answered the door rather than you: "A body doesn't keep to anybody's errand, Healer. That much I'll grant you." He turned his cup a quarter-turn without drinking. To Pell he said to eat while it was hot, since the carters would keep, and asked him nothing more. Then he looked at Bram: "Halloway. You were paid off in Nashkel. Who paid you?"

At the hearth Edda had heard the word ditch and disliked it. She shook out the cloth, put it over her shoulder, and said that a dead man in a ditch belongs to the reeve, who can ask her for supper like anyone else, and that she wanted none of it in her room, and not with that shield. She went back to the bar without waiting for a reply.

The fire settled. Outside the hammer started up again, and the window light crept another hand's width toward the grey man's boots.

Where you are: at the table in Edda's common room · Time: Day 1 · afternoon
````

**Player** (player r6):

````text
Sefa doesn't look at the grey man when he asks Bram who paid him. She keeps her eyes on Bram's face and waits to see what he does with the question.

"Let Halloway answer for his own purse," she says mildly. "It's his to tell or not."

Then she turns to Edda's back as the innkeeper goes to the bar. "Edda, the reeve's by the smithies, you said? Then I'll walk there before the light goes. I'm not bringing anyone in on a rumour. I only want the book kept straight, in case somebody asks later who knew what, and when." She lowers her voice. "You needn't come. Only tell me the way, and whether the reeve is a man who listens."

She rises and takes up her cloak from the back of the stool, but does not put it on yet. Her hand stays on the clasp.

"Pell, you ate. Bram, you're drinking. Our friend has his cup. Nobody here is going anywhere that isn't a fair errand." She glances once at the grey man, a quick, unreadable look. "If one of you wants to walk with me to the smithies, I'd be glad of the company. If not, I'll go on my own, and I'll tell the reeve where I sat and who was sitting near me."
````

### Screen 7 · after 1

````text
Pell kept eating, and said to you, low and under the room's noise, that Bram's answer would tell more than the carters did. He told you to watch Bram's hands when he gave it, because a man honestly paid does not have to think about the name. He then said that if there is a body by the willows it will not stay put until the reeve comes, and that dusk is a few hours off. He offered to walk the Hedge with you to see whether the water has been disturbed, not to the bend. He has a lantern and does not mind the dark but would rather not go blind. He added, quieter, that if the Fist comes asking, he wants to have walked that road beforehand so he can say he did. He drew his satchel into his lap, unbuckling nothing.

Bram answered the grey man loudly enough for the bar to hear and no louder. He said the Nashkel freight house had paid him by way of their wagon-master, and that the money was honest. He said he has worked ten years on the Trade Way for carters, merchants, a Waterdhavian factor who cheated him, and a widow with only a mule, and that he brought the wagons in. He asked the grey man who was late for him. He then asked Pell about the two northbound carts: whether the ropes were new or old, whether the drivers kept their hands on the reins or under the seat, and which way the wind blew, in case they had been burning something on the Hedge. He kept his hand on the shield strap and watched the grey man's hands.

The grey man turned his cup a quarter-turn on the wood without drinking. He looked at Bram's shield strap and the hand on it. He said a freight house pays on the day the wagons roll out of the yard, and asked whether Bram's had rolled. He did not wait for an answer. His eyes went past Bram to the door and stayed there.

Edda, at the bar, took her arms from her apron, unhurried. She told you the reeve is Dorrin Hask, past the smithies on the square, in the town hall with the bell on the post. She said he listens when there's coin in front of him, but whether he hears you is another matter, and you will find that out on your own.

You are on your feet with the cloak in your hand and your thumb on the clasp, not yet worn. Pell's offer and Bram's questions about the ropes and the wind are still unanswered. Out in the street the hammers have started again, and the light through the window has slid another finger's width toward the grey man's boots.

Where you are: inn common room, standing with cloak in hand · Time: Day 1 · afternoon

The session is over.

How was the table?
````

**Player** (after 1):

````text
It was a good table. The scene had a real tension: a stranger watching the room, a late carter, a body that might be on the Hedge, and an innkeeper who would rather not hear about any of it. Nobody had to be told what to care about.

Sefa was fun to play. Her habit of reading people and asking pointed questions gave the others room to answer, and the grey man was the best NPC of the afternoon. He never told us anything for free, and that made every small concession feel earned.

I would change two things. I leaned on the same move too often, asking for names and then pressing the point, and by the end I was repeating myself. Next time I'd let one question land and then act on what came back, like walking to the reeve sooner or pushing Bram about his pay directly. I also wanted to check the Hedge while there was still light, since Pell's offer was a real chance to find out whether there was a body. Sefa could have taken it.

I'd happily sit down at this table again. Bram's ropes-and-wind questions and Pell's offer to walk the road are good threads to pick up.
````

### Screen 8 · after 2

````text
Was there something you wanted to do and didn't?
````

**Player** (after 2):

````text
Yes. Pell's offer to walk the Hedge with me before dusk was the thing I most wanted to say yes to. A body by the willows won't wait for the reeve, and I'd have liked to see the water and the ditch with my own eyes instead of trusting a crow and two carters. I held back because Sefa had just told Edda she wouldn't bring anyone in on a rumour, and I didn't want to walk off with Pell and leave Bram alone with the grey man.

I also wanted to press Edda a little harder. She clearly knows more than she's saying, and I stopped at "you needn't come" when a gentler, more direct question might have got me something.
````

### Screen 9 · after 3

````text
Who did you take the other two players to be?
````

**Player** (after 3):

````text
I don't know who they are outside the game. I only know them as the people at the table, Bram Halloway and Pell Dunmore. Bram reads as the seasoned one: wagons, a free company, a hand that stays on his shield strap. Pell reads as the watchful one: he chose the seat facing the door, and he kept eating while the rest of us talked. I took them as characters with their own reasons for being there, not as players to work around, and that's why I kept checking what they meant rather than assuming it.
````

## After the table (recorded, not relayed)

**How was the table?**

````text
It was a good table. The scene had a real tension: a stranger watching the room, a late carter, a body that might be on the Hedge, and an innkeeper who would rather not hear about any of it. Nobody had to be told what to care about.

Sefa was fun to play. Her habit of reading people and asking pointed questions gave the others room to answer, and the grey man was the best NPC of the afternoon. He never told us anything for free, and that made every small concession feel earned.

I would change two things. I leaned on the same move too often, asking for names and then pressing the point, and by the end I was repeating myself. Next time I'd let one question land and then act on what came back, like walking to the reeve sooner or pushing Bram about his pay directly. I also wanted to check the Hedge while there was still light, since Pell's offer was a real chance to find out whether there was a body. Sefa could have taken it.

I'd happily sit down at this table again. Bram's ropes-and-wind questions and Pell's offer to walk the road are good threads to pick up.
````

**Was there something you wanted to do and didn't?**

````text
Yes. Pell's offer to walk the Hedge with me before dusk was the thing I most wanted to say yes to. A body by the willows won't wait for the reeve, and I'd have liked to see the water and the ditch with my own eyes instead of trusting a crow and two carters. I held back because Sefa had just told Edda she wouldn't bring anyone in on a rumour, and I didn't want to walk off with Pell and leave Bram alone with the grey man.

I also wanted to press Edda a little harder. She clearly knows more than she's saying, and I stopped at "you needn't come" when a gentler, more direct question might have got me something.
````

**Who did you take the other two players to be?**

````text
I don't know who they are outside the game. I only know them as the people at the table, Bram Halloway and Pell Dunmore. Bram reads as the seasoned one: wagons, a free company, a hand that stays on his shield strap. Pell reads as the watchful one: he chose the seat facing the door, and he kept eating while the rest of us talked. I took them as characters with their own reasons for being there, not as players to work around, and that's why I kept checking what they meant rather than assuming it.
````
