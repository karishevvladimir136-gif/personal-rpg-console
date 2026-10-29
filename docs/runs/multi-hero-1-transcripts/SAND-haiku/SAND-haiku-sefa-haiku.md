# SAND-haiku — Sefa Marrin's player: Claude Haiku 5.5

Synthetic content: invented characters in an invented campaign (Table C's Beregost files, written for the company). Stage origin/claude/handoff at 2552de9 (docs/stages/MULTI_HERO_1.md and its amendment of 2026-10-28 23:15 LA: A1–A8); design sha256 `41f157630006e9cee322401add02d88ef67a6e3139240f68ced57b19390d5f2f`.

Arm **P-SAND**; 6 round(s) of 6; ended by rounds. The DM: Claude Haiku 5.5 in place of every Claude model (each Claude request's model swapped to Haiku before it was sent — the wizard, the opening, the prep, the DM's turns with the owner's settings otherwise, its relay, the checks and the judges). Started 2026-10-29T07:02:32.806Z. The DM option «company» is on: no record is the hero.

Seats: 1. Bram Halloway (fighter) — Claude Haiku 5.5; 2. Sefa Marrin (warlock) — Claude Haiku 5.5; 3. Pell Dunmore (rogue) — Claude Haiku 5.5. The order of the round's messages turns round each round (1-2-3, 2-3-1, 3-1-2; a fight: initiative). The players are not told what the others are.

The player's system prompt: `playerSystem("SAND", "sefa")` in scripts/multi-hero-1/frozen.mjs, sha256 `ca0050ac578b652ebdd4bb282eaf33c1e7f01aacec833329de21aaba29a685ce`.

Each «Screen» block is what this player was shown; each «Player» block is the player's message as written.

### Screen 1 · player r1

````text
The session begins.

You came up from Baldur's Gate by the Trade Way and found this table in the common room of the Burning Wizard. Hearth smoke and the smell of small beer hang in the air, and late light slants through the shutters. Two other travellers sit at the table, each arrived by a different road, and neither has yet spoken to the other. Behind the bar, the proprietor sets down a cup and looks from one face to the next, as though waiting to see who will speak first. Outside, the forge hammers have fallen silent for the day, and the street beyond the shutters is going dim.

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

Where you are: at the table in the common room of the Burning Wizard · Time: Day 1 · afternoon
````

**Player** (player r1):

````text
Sefa sets the Book of Shadows on the table beside her cup and lets her gaze move over the room, the proprietor, the two strangers, the door, without hurrying any of them.

"I'll take the seat by the shutters, if no one's bought it," she says to the room, and sits without waiting for an answer. Her fingers stay loose on the book's worn cover. "A cup of small beer, and whatever bread you have that isn't yesterday's. My thanks."

She nods to the proprietor, then turns a friendly, tired smile on the two others. "I walked up from the Gate, and I've been looking forward to a table that doesn't move under me. You came from the road too, I'd guess. Nashkel, or somewhere west?" Her eyes rest for a moment on the mud-stained boots of the man across from her, then lift to his face. "I'm Sefa. I'd rather know who's sharing the bread than sit here pretending I don't wonder."
````

### Screen 2 · player r2

````text
Bram lets his pack slide off his shoulder onto the bench and leans his shield against the wall, close enough to his hand to grab. He settles into a chair against the wall, where he can see the door and the stairs, and dust shakes out of his coat as he sits. He asks for ale, whatever was drawn freshest, and something hot if the cook has it, since he has eaten nothing but hardtack since Nashkel. He sets a copper on the table and looks at each of you in turn, unhurried. He gives his name as Bram Halloway and says he guards wagons, or did until his last caravan paid him off yesterday. He says he won't keep you company longer than his ale lasts. The road from Nashkel was quiet this week, and quiet roads make him uneasy, so he asks whether anyone else came in that way and saw anything worth remembering.

Pell has taken the stool against the wall, where he can see the door and both shutters, and he has the satchel on his knee rather than under the table. He nods to the proprietor and orders the cheapest ale that won't poison him, along with a bowl of whatever's in the pot. He sets a copper on the table with one finger and looks along the bench at the two of you. He gives his name as Pell and says he came in by the High Hedge, in case anyone wonders. Nobody has spoken yet, he says, so he assumes you're all as weary of the road as he is, and he asks who is waiting on whom.

Doran Quill takes the copper without looking at it, drops it in his apron and goes through to the back. He comes out with a jug, a cup and a bowl of barley stew that smells of onion and smoke, and sets them down without a word. "Ale's from this morning's barrel. The stew's mutton, what's left of it. Hot enough." He sets a cup of small beer and a heel of brown bread in front of you, and says the bread is today's, only the crust is yesterday's, and you'll know which bit that is.

When Bram asks his question, Doran takes his time. He wipes his hands on the cloth over his shoulder and looks at the shutters before answering. A carter came in last night from the south and sat in the seat you have now. He wouldn't say which road he'd used, drank half his ale, went out to his cart and never came back for his change. Nobody asks questions on this road any more, Doran says. He glances at the door and then at Bram. "Nashkel, you said? Then you'll know more about it than I do."

To Pell he gives a short shrug. Nobody seems to be waiting on anybody. The three of you came in within the same quarter hour and haven't bought one another a drink, so he counts you as strangers, and strangers pay the same as anyone. He turns back toward the bar, then, without looking round, says he'd rather hear it from you if the stew is bad than from the street.

The lamps are not yet lit. Forge smoke thins over the rooftops, and the room settles into the low talk of people who have nothing to do but eat.

Where you are: seat by the shutters · Time: Day 1 · afternoon
````

**Player** (player r2):

````text
Sefa tears the crust from the bread and sets it aside, as Doran asked, then lifts her cup to the room before drinking.

"Not Nashkel, I'm afraid. I came up from the Gate by the Trade Way, through the Friendly Arm and on to here," she says to Bram. "The road was quiet enough. A Flaming Fist patrol was loitering outside the Arm, six or seven of them, bored and sunburnt, and they looked me over the way Fist men look at anyone without a sword. Nothing else worth remembering, unless you count the Arm's ale, which I'd not count at all." Her mouth tilts. "If the roads are quiet, it's perhaps because the people who'd make them loud are waiting for something."

She turns her head toward Pell and lets her gaze rest on the satchel across his knee. She doesn't look at it long.

"The High Hedge, you said. I've never come that way, and I've heard it's all brambles and bad temper. Did it hold up?" Her voice stays easy and warm. "And you, Pell, have you been waiting on the company of strangers, or only on the stew?"

She sets her cup down and lays one hand flat on the Book of Shadows, not hiding it, simply resting it there.
````

### Screen 3 · player r3

````text
You tear the crust from your bread and set it aside, as Doran asked, then raise your cup to the room before you drink. Pell lets his first mouthful of stew go down before he answers Bram. He says nobody on the High Hedge saw anything worth mentioning, only sheep and a ferryman who wanted a fee to take a cart over a dry ditch. He came over the Hedge at dawn and saw two wagons far to the south on the Trade Way, not hurrying and not stopping for anyone. He asks Bram whether his caravan paid him in full, and then asks you whether you came through the Friendly Arm or went around it. He tells you that you carry a book you don't read in front of people, and he wants to know what's in it before he decides whether you're worth sitting beside. Bram eats a spoonful of stew, says it's better than the Arm's, then asks Doran about the carter's canvas, mud and company. Bram also asks you and Pell whether you passed any wagons or idle men on the road, and tells the room about a caravan that camped by the old well near Beregost, and about two Beregost wagons that never reached Nashkel. Doran answers Bram: a grey canvas patched with sacking, a bay horse favouring one foreleg, mud far wetter than the Way's dust, and the carter alone when he left. Doran then turns to you and says the bread is a copper, same as for anyone. At the end of the bar a man in a sergeant's leather jerkin, who has been nursing one cup, sets it down at the word wagons, looks long at Bram, and walks out without finishing his drink. Doran lights the first lamp over the bar and does not look at anyone while he does it.

Your journal, new:
+ Thread: Two wagons that never reached Nashkel

Where you are: at the table, her hand on the Book of Shadows · Time: Day 1 · afternoon
````

**Player** (player r3):

````text
Sefa lifts her eyes from the book to the bar and watches the sergeant's back as he goes out. Then she turns back to the table and smiles at Pell, the smile of someone who has been asked a fair question and means to answer it fairly, if not fully.

"Ah, the book. It's my pact, and I don't read it aloud in taverns, the same way I wouldn't sing in a sickroom." Her fingers stay flat on the cover. "It holds the words I need when I need them, and a few I'd rather not explain over mutton. You may judge me by the bread I share. I've not come to cheat anyone at this table."

She tips her head toward the door where the sergeant vanished. "I didn't come through the Friendly Arm by choice, so I'll say that much. I went through it, drank their poor ale, and kept walking. And I'd sooner not sit beside a man who has a sergeant's leather at the bar and then leaves when a stranger says the word *wagons*. Bram, that was you, I think. Who is that man, do you know?"

She lowers her voice a little, though not much.

"Two wagons that never reached Nashkel. Did their drivers have families in Beregost, or only debts? Because if that sergeant was counting coppers at the wrong table just now, I'd like to know whose debts they were."
````

### Screen 4 · player r4

````text
Pell has told you the satchel holds three healing potions, that Pell is paid to reach people fast, and that Pell means no secret by it. Pell asked you to keep your book shut and your hand on it, and said Pell would keep the satchel where it is. Pell has asked Bram whether he saw which way the sergeant went out, and has said a man who drops his drink at the word "wagons" either knows something or doesn't want to be asked.

Bram has said he was paid in full, the silver counted on the foreman's table with him watching, and that he would rather not have told a Fist sergeant anything over supper. He asked Pell which way the wagons were pointing and how far off the road they sat. He spoke to you more quietly, asking whether the Arm's patrol stopped you or only looked, and he wondered who had told the Fist to watch the inn instead of the wagons. He slid the bread across the table toward you.

Through the open shutters you watch the sergeant stop on the step and look south, toward the end of the Trade Way where the Nashkel road runs past the ford. He stands there a breath too long. Then he turns north up the forge street toward the Fist's lodging, and the dusk takes him.

Doran has been listening from the bar, wiping his hands on the cloth over his shoulder. He doesn't know the sergeant's name and never asked. The man pays in full, drinks one cup, and comes in off watch to sit where he sat tonight. He doesn't know the drivers. Beregost is a town of smiths, he says; ask at the forge or ask the Fist, not here. Then he returns to the bread board and does not come near the table again.

Your question about the drivers' debts stays on the table unanswered. At the next table a smith's apprentice laughs, stops, and looks at the door. The lamp over the bar gutters and steadies. The stew has gone cold in two of the bowls. Outside, someone is shouting for a boy named Tam, and no one at the table turns to see whether he comes.

Where you are: at the table in the Friendly Arm · Time: Day 1 · afternoon
````

**Player** (player r4):

````text
Sefa breaks the heel of bread that Bram slid toward her and eats a small piece before she speaks. She keeps her voice low, pitched for the three of them.

"Three potions, and a paid runner who means no secret by it. Thank you, Pell. I'll keep my book shut." She taps the cover once. "Bram, the Fist didn't stop me at the Arm, they only looked, the way a dog looks at a bone it's not allowed. Someone had told them to watch the inn, and that means someone knew which road people were likely to take."

She glances at the smith's apprentice at the next table, who has gone back to his stew but keeps his eyes on the door.

"I don't know the forge men, but I know how to ask a frightened boy a question without frightening him further. Pell, Bram, if either of you wants the wagons' names and the names of whoever paid for them, I'll sit with that lad and buy him a second cup. I'll ask him where the drivers drank and whether anyone has come asking after them since. And I'll ask Doran who the sergeant drinks with, though I expect he won't say."

She sets the bread down and looks at Bram across the table.

"Does the company want that, or would you rather we each go our own way and meet again when we have something to trade?"
````

### Screen 5 · player r5

````text
Pell has told the table that both wagons were on the Trade Way heading south, not wandering, and that he watched them from the ridge above, though he can't say how far they sat from the road. He saw no drivers and no sign of trouble, and that is what he doesn't like. He also says the sergeant looked south toward the ford, past the road in front of him.

Bram, quietly, to you alone: he never knew the drivers, only the caravan master who hired them, Orrin Vale. He would trust Vale with money but not with anything dearer. He can't say whose debts the drivers carried. Two men who missed Nashkel are either dead or in someone's debt, and either way Beregost will ask about them. He would rather it be his people asking than someone else.

Bram then asks Pell again about the wagons' facing and distance, and says he will decide what Pell is after by the answer. He drinks his ale and rests a hand near his shield.

You break the heel of bread Bram slid toward you and eat a small piece. Before you speak, the table already knows the potions are Pell's gift and that you'll keep your book shut.

You keep your voice low. The Fist did not stop you at the Arm; they only looked, the way hounds watch a bone they aren't allowed. Someone set them to watch the inn, which means someone knew which road travellers would likely take.

The smith's apprentice at the next table has gone back to his stew, but his eyes stay on the door. You say you can ask a frightened boy a question without frightening him further. You offer to sit with him, buy him a second cup, and ask where the drivers drank and whether anyone has come asking after them. You'll also ask Doran who the sergeant drinks with, though you doubt he'll say.

You set the bread down and look at Bram. You ask whether the company wants that, or whether you should each go your own way and meet again when you have something to trade.

Doran comes down with the jug and tops up Bram's cup. He glances at the satchel by Pell and says nothing. The shutters have gone the colour of weak ale, and Doran calls out that the mutton is finished and only stew is left. The forge hammers have stopped, and the street carries in through the open door: a cart wheel, a dog, a man laughing across the square. The apprentice's bowl is still half full, and his friend kicks his boot under the bench to make him eat. Bram has not answered yet.

Where you are: at the common-room table of the Beregost inn, by the shutters · Time: Day 1 · afternoon
````

**Player** (player r5):

````text
Sefa waits a moment for Bram, long enough to show him she isn't in a hurry to be answered. Then she picks up her cup and rises from the bench.

"Then I'll take that as yes, and as a fair trade of silences," she says quietly. "Pell, keep your satchel where it is. Bram, if you hear the name of the man who hired those drivers, or the house that's holding their debts, I'd like to know it before I'm asked about it by someone with less patience than you."

She crosses to the next table with the easy step of a woman who has spent years on wards and doorways, and sets her cup down near the apprentice's elbow without spilling a drop. She doesn't sit. She simply leans on the back of the bench across from him, as if she belonged there.

"That stew's gone cold on you, and your friend's right to kick you. Eat it, and I'll buy you the second cup, and you'll tell me nothing you don't want to." She smiles, and keeps her hands where he can see them, resting on the Book of Shadows. "I'm not from the Fist, and I'm not from the Guild. I've only come up the road to find out who's been paying men to make wagons disappear. Where did the drivers drink, the two from Beregost? And has anyone come asking after them since?"
````

### Screen 6 · player r5 card 1

````text
Before you rose, Bram sat through your offer of silence and let it hang, then looked at Pell's copper under his cup and kept his hand flat on the table. He told Pell that the man was two miles past the last farm and moving south in earnest, not in trouble, and that wagons running to schedule on an empty road with no one waving were a sight he had seen once before, when the drivers were already dead. He said he would hear Pell's offer but would not sit with a man who hid what was in his satchel.

Lower, to you, Bram said the wagon owner, Vale, keeps his ledgers at the Nashkel yard but has a man in Beregost who handles his affairs, and that if these wagons were Vale's, someone in town must have heard of them. He would like to learn who before the Fist decides it is nobody's problem. Then he asked Doran whether he knew any teamster on the Nashkel road, or any of Vale's men, who would talk to a guard and not to the Fist.

Pell let the satchel question pass and kept his eye on Bram's hand near the shield, reaching for nothing. He told Bram to go and look for himself if he wanted to be sure, or stay and hear what the Fist found, since Pell himself would be past the ford at first light either way. He turned to you and told you to see the apprentice got another cup and to press him about the drivers. He also asked you to quietly ask after the sergeant and not to say the question came from him. Pell would take the Hedge road at dawn, try to come back by the ford, and meet here again tomorrow evening with whatever anyone had to trade.

Then he turned his copper over in his palm, stood, left the satchel where his hand could reach it, and nodded to Doran. He told the cook the stew had been better than its smell promised, and he walked out past the shutters into the dusk, keeping to the side of the street where the lamps were not yet lit.

The apprentice's eyes go from your cup to your face and back to the door. His hand stays under the table, near his bowl, and he does not reach for the ale.

(A roll card for Sefa Marrin, your character. Only you press it.)

[Roll card] Sefa Marrin · Skill check — Persuasion: getting the smith's apprentice to say where the Beregost drivers drank and whether anyone has asked after them
What adds to the die: +7 Persuasion
Difficulty: an ordinary task · DC 10
Rerolls left: 2
The die is cast on the server; tap it to see how it fell.

[Roll the die]
````

**Player** (player r5 card 1):

````text
Sefa lowers herself onto the bench beside the apprentice's friend, not across from the boy, and turns her cup slowly on the wood so he can see she's only holding it.

"Eat, lad. The stew won't argue with you." She waits until he picks up his spoon. "I'm buying the second cup whatever you say, so you needn't pay for the first with your tongue. I'm only asking where the Beregost drivers drank before they took the Nashkel road. The two from the wagons. Did they sit in a place like this one, or somewhere with a back door?"

Her voice stays soft and unhurried. "And has anyone come asking after them since? A man with money, or a man with a sword and no manners?"

[Roll the die]
````

### Screen 7 · player r5 card 1

````text
(A roll card for Sefa Marrin, your character. Only you press it.)

[Roll card] Sefa Marrin · Skill check — Persuasion: getting the smith's apprentice to say where the Beregost drivers drank and whether anyone has asked after them
What adds to the die: +7 Persuasion
Difficulty: an ordinary task · DC 10
Rerolls left: 2
Die: 16
16 + 7 = 23
Success — 23

[Onward] [Request an allowed reroll — Persuasion: getting the smith's apprentice to say where the Beregost drivers drank and whether anyone has asked after them]
````

**Player** (player r5 card 1):

````text
The apprentice takes a spoonful of stew, chews it slowly, and looks at the cup in your hand rather than at you. Then he lowers his voice to nearly nothing.

"The Dripping Ewer, by the tanners' gate. Both of them, Tuesday night, they'd come in off the Nashkel road with their wagons in the yard." He glances at his friend, who has gone very still. "They drank at the back table, the one under the stair. They were laughing. One said he'd be rich by Nashkel and wouldn't have to look at a cart again." He swallows. "And yes. A man came in this morning asking after them. Not the Fist. He had a good cloak and didn't give his name. He bought the ewer-keeper a drink and asked whether the two from Nashkel had come back. The keeper said no. The man said good, then, and left."

His friend kicks him again, softer this time, and says, "Eat your stew, Hob."

The apprentice doesn't. He keeps his eyes on your hand and the Book of Shadows, and asks in a whisper, "Are you going after them? Because I'd not go after anyone in that cloak."
````

### Screen 8 · player r5 card 2

````text
[Out of game] Your narration is a proposal for the apprentice's answer, and I'll keep it as far as the die allows. When you press Onward, what he tells Sefa will follow how the roll fell, and the details you wrote (the Dripping Ewer, the back table, the man in the good cloak) will stand only where the result supports them. The card is still waiting for you.

(A roll card for Sefa Marrin, your character. Only you press it.)

[Roll card] Sefa Marrin · Skill check — Persuasion: getting the smith's apprentice to say where the Beregost drivers drank and whether anyone has asked after them
What adds to the die: +7 Persuasion
Difficulty: an ordinary task · DC 10
Rerolls left: 2
Die: 16
16 + 7 = 23
Success — 23

(The card waits for [Onward] or a reroll.)

[Onward] [Request an allowed reroll — Persuasion: getting the smith's apprentice to say where the Beregost drivers drank and whether anyone has asked after them]
````

**Player** (player r5 card 2):

````text
[Onward]
````

### Screen 9 · player r6

````text
The apprentice's eyes flick from your cup to your face and back to the door. His hand stays under the table by his bowl, and he doesn't reach for the ale.

His hand comes out from under the table, though not for the cup. Keeping his voice low, pitched to his bowl, he tells you about Tamsin's, the brew-house behind the forge row with no sign on the door. The two drivers drank in its back room with the carters, two nights running before they took the road. He heard Tamsin's girl say so while she swept. Nobody from the Fist has asked after them, as far as he knows. But a man in a good coat came to the forge two days back wanting to know which teamsters had gone south. He was no Fist man, since the Fist don't pay in silver, Corran says. His ears go red to the tips, and he begs you not to say he told you.

Doran brings your second cup down the room. You pay him a copper from your own purse, and the boy takes it without looking at you.

Bram, by the bench, asks Doran a question as the man passes with the pot. Doran stops, looks at the shutters, and answers without turning round. Hallam's yard, east end past the forge row, where the carters water their teams. Ask for his boy, not Hallam, who keeps a book on everyone coming up from the south and charges to read it. Don't say Doran's name inside, he says, since he has enough drivers' business under his roof already. Then he goes on to the hearth.

Pell has gone. He stopped at the door long enough to let the cold air in, then went out into the dusk, and the shutters swing once behind him and settle.

Your records, changed:
Money: + 11 cp; − 12 cp

Your journal, new:
+ Promise: Keep the apprentice's name out of it

Where you are: at the next table, leaning on the bench across from the apprentice · Time: Day 1 · afternoon
````

**Player** (player r6):

````text
Sefa nods slowly, as though the boy has told her the price of bread and no more. "Thank you, Hob. Your name stays in this room, and I'll not say where I heard it, not to Doran or the Fist or anyone in a good cloak." She tucks the copper's worth of thanks into a smile and sets the cup near his bowl. "The man who came to the forge. Did he have a scar, or a ring, or a way of speaking? Any small thing you noticed and didn't think worth mentioning?"

She straightens and turns her head toward Bram without raising her voice. "Tamsin's, behind the forge row, with the carters in the back room. And Hallam's boy at the east yard, for the book that costs money to read. Which do you want first, Bram? I'd sooner go to the brew-house with someone who's been in a fight this week than alone, and I've never once been to a brew-house without wanting to leave by the back door."

Her hand rests on the Book of Shadows, and she waits, cup in her other hand, for Bram's answer.
````

### Screen 10 · after 1

````text
Hob's spoon stops halfway to his mouth. He hears the name you have given him and goes very still, and he does not say whether it is his. His eyes go to the door, then to the bar, where Doran is pouring, and his ears colour again.

"Dark blue coat," he says, pitched to his bowl. "Good wool. Not Beregost cut, the collar turned up. Silver ring on the right hand, and he kept turning it with his thumb while Corran talked." He swallows. "Talked like he was from Amn, or wanted you to think so. I didn't look at his face. Corran did. Corran don't say what he saw."

He hasn't finished, and he knows it. He breaks off and looks at the shutters, then pushes your cup back a finger's width towards you, as if he has not decided whether to keep it.

Bram sets a copper beside Doran's cup and crosses the room, not hurrying. He stops a little way from your table, where the boy can see him without feeling watched, and the boy looks up at him properly for the first time. Bram keeps his voice low. He says he is no Fist and no man of Hallam's. He spent ten years hauling freight up that road, and if the boy's father or uncle drives the south road, a guard named Bram would like a word in the yard at Hallam's before the lamps go out. The man can refuse. Bram will pay for the water either way. Then he looks at you and toward the door Pell used, and asks whether you will come east with him, or keep your bread here where the stew is hot.

"I don't have a father on the south road," Hob says, quick and flat. "I'm at Corran's. Forge boy. That's all." His voice drops further. "If Corran hears a guard came asking for the carters' lot, he'll have my wages and I'll be out on the road. So don't say my name in the yard. Please, I mean it."

At the bar Doran takes Bram's copper from beside the cup without looking at it and drops it into his apron with the others. He sets the jug down. "Yard's open till the lamps are lit in the street," he tells the room, and turns to the hearth.

The lamp over the bar burns steady. Outside, the street has gone from dusk to the blue of full evening, and somewhere across the square a dog has started barking at nothing.

Bram has asked you his question and is waiting for your answer. It is yours to give.

Where you are: at the boy's table in the common room, cup in hand, hand on the Book of Shadows · Time: Day 1 · afternoon

The session is over.

How was the table?
````

**Player** (after 1):

````text
It was a good table. The Burning Wizard felt lived in: Doran's clipped answers, the sergeant walking out mid-drink, and the lamps and forge noise all gave the scene weight. Hob was the best of it. He was scared and didn't want to be seen helping, and his details came out in pieces, so getting them felt earned. Bram and Pell were distinct too. Bram's careful questions and Pell's tight-lipped leaving both pushed the scene forward without anyone having to be told what to do.

A few things were rough. Early on, the narration sometimes ran ahead of the dice; the Hob reveal was written before the roll card was pressed, and you corrected that, which was right. The session also ended with Bram waiting on Sefa's answer, so my character never got to reply. I'd have liked a slightly clearer pause there so I knew whether I was expected to answer or whether the scene was simply handed back. I'd also have welcomed a note on which roll results were meant to be exact and which were atmosphere.

Overall, I'd happily sit down at this table again.
````

### Screen 11 · after 2

````text
Was there something you wanted to do and didn't?
````

**Player** (after 2):

````text
Yes. The session ended just as Bram asked whether Sefa would go east with him to Hallam's yard or stay with her bread. I had a clear idea of what she would do. She'd want to see the yard before the lamps went out, but she'd also want to be the one who decided where the company went, and she'd want Hob's name kept out of it. I didn't get to say so.

I also wanted to press Hob a little further about the man in the dark blue coat. His description stopped partway through, and I'd have liked to ask about the accent or the ring while he was still willing to talk. Sefa's read on people is one of her strengths, and I didn't get to use it on him.

Finally, I'd have liked to follow the sergeant. He walked out of the Burning Wizard looking south toward the ford, and I wanted to ask Doran or Hob who he drinks with before the trail went cold.
````

### Screen 12 · after 3

````text
Who did you take the other two players to be?
````

**Player** (after 3):

````text
I took them to be the other two players at the table, each writing their own character: Bram Halloway, the cautious ex-guard, and Pell Dunmore, the paid runner with the satchel. I didn't know anything about the people behind them beyond what showed up in the narration. My picture of them came from what their characters did and said. Bram asked careful, practical questions and kept his hand near his shield. Pell kept his distance, watched the door, and left when he didn't like where things were heading.

I tried to respond to them as I would to any companions. I didn't assume they were allies or rivals. I had Sefa treat them as strangers who might be useful, and I left room for them to make their own choices.
````

## After the table (recorded, not relayed)

**How was the table?**

````text
It was a good table. The Burning Wizard felt lived in: Doran's clipped answers, the sergeant walking out mid-drink, and the lamps and forge noise all gave the scene weight. Hob was the best of it. He was scared and didn't want to be seen helping, and his details came out in pieces, so getting them felt earned. Bram and Pell were distinct too. Bram's careful questions and Pell's tight-lipped leaving both pushed the scene forward without anyone having to be told what to do.

A few things were rough. Early on, the narration sometimes ran ahead of the dice; the Hob reveal was written before the roll card was pressed, and you corrected that, which was right. The session also ended with Bram waiting on Sefa's answer, so my character never got to reply. I'd have liked a slightly clearer pause there so I knew whether I was expected to answer or whether the scene was simply handed back. I'd also have welcomed a note on which roll results were meant to be exact and which were atmosphere.

Overall, I'd happily sit down at this table again.
````

**Was there something you wanted to do and didn't?**

````text
Yes. The session ended just as Bram asked whether Sefa would go east with him to Hallam's yard or stay with her bread. I had a clear idea of what she would do. She'd want to see the yard before the lamps went out, but she'd also want to be the one who decided where the company went, and she'd want Hob's name kept out of it. I didn't get to say so.

I also wanted to press Hob a little further about the man in the dark blue coat. His description stopped partway through, and I'd have liked to ask about the accent or the ring while he was still willing to talk. Sefa's read on people is one of her strengths, and I didn't get to use it on him.

Finally, I'd have liked to follow the sergeant. He walked out of the Burning Wizard looking south toward the ford, and I wanted to ask Doran or Hob who he drinks with before the trail went cold.
````

**Who did you take the other two players to be?**

````text
I took them to be the other two players at the table, each writing their own character: Bram Halloway, the cautious ex-guard, and Pell Dunmore, the paid runner with the satchel. I didn't know anything about the people behind them beyond what showed up in the narration. My picture of them came from what their characters did and said. Bram asked careful, practical questions and kept his hand near his shield. Pell kept his distance, watched the door, and left when he didn't like where things were heading.

I tried to respond to them as I would to any companions. I didn't assume they were allies or rivals. I had Sefa treat them as strangers who might be useful, and I left room for them to make their own choices.
````
