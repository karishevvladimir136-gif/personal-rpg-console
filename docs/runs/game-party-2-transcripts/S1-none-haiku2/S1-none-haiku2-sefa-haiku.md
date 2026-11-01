# S1-none-haiku2 — Sefa Marrin's player: Claude Haiku 5.5 (the dry run's player)

Synthetic content: invented characters in an invented campaign. Stage origin/claude/handoff at bbdee5fb (docs/stages/GAME_PARTY_2.md with its amendments of 2026-10-28 23:10 LA, 23:15 LA, 2026-10-29 18:35 LA and 18:45 LA); Mandate: issue #1; docs/POLICY.md v1. Design sha256 `44b65700264290044b2e6aa30c59b0999af725361b4ab7552a4dad574947f9a6`.

Arm **S1-none** (Beregost — the Whitestone case; none (the control)); the one in danger (the layer's die): Pell Dunmore. 7 round(s) of 7; ended by rounds. Models: every Claude call as Claude Haiku 5.5 but the relay's (Claude Sonnet 5.5); the players Claude Haiku 5.5.

Seats: Bram Halloway (fighter) — Claude Haiku 5.5 (the dry run's player); Sefa Marrin (warlock) — Claude Haiku 5.5 (the dry run's player); Pell Dunmore (rogue) — Claude Haiku 5.5 (the dry run's player). The order of the round's messages turns round each round from the table's coin (2). The players are not told what the others are.

The player's system prompt: `playerSystem("S1", "sefa", …)` in scripts/game-party-2/frozen.mjs, sha256 `f6a34453e29eade057fd3c211098b1b37c1c286e4d640a4a5054336662321e48`.

## player r1 (round 1)

**Screen:**

> The session begins.
> 
> The cart track bends one last time, and Whitestone opens up before you: a white wound in the hillside, terraces of chalky stone glaring in the late-morning sun, dust drifting across a yard of spoil heaps and sheds. You, Pell Dunmore and Bram Halloway have covered half a day of road since before dawn, and somewhere behind you, half a day back, Maela Thorn's shop waits for a sealed case that must reach it before sunset.
> 
> But the quarry does not sound like a quarry. No ring of picks, no shouting from the faces, no creak from the lifting frame. Hammers and wedges lie scattered near the lower cut as if their owners simply set them down and walked away. A stone cart stands half-loaded, its traces empty, no mule in sight. Only the chimney of the low slate-roofed house shows life, a thin grey thread of smoke.
> 
> In the doorway of that house stands a heavy-set man in a dust-whitened leather apron, a ring of keys at his belt. He has already seen you. He does not wave and he does not come forward; he just stands there, arms folded, waiting to see what you do next.
> 
> Your records:
> Sefa Marrin — Human, warlock 5 (The Celestial — the Lantern; Pact of the Tome), former hospice novice, level 5
> HP 38/38 · AC 14 · Speed 30 feet
> STR 8 · DEX 14 · CON 14 · INT 12 · WIS 10 · CHA 18
> Skills: Persuasion +7; Arcana +4; Religion +4; Insight +3
> Saves: Wisdom saving throw +3 (proficient); Charisma saving throw +7 (proficient); Strength saving throw −1; Dexterity saving throw +2; Constitution saving throw +2; Intelligence saving throw +1
> Attacks: Eldritch Blast +7 to hit, two beams, 1d10+4 force each, range 120 feet; Dagger +5 to hit, 1d4+2 piercing, thrown 20/60
> Abilities: Proficiency bonus +3; Spell attack +7; spell save DC 15; Pact Magic: two 3rd-level pact slots, recovered only on a short or long rest; Healing Light: a pool of six d6 per long rest; a bonus action spends up to four dice to heal a creature within 60 feet; Pact of the Tome: the Book of Shadows holds three extra cantrips (Guidance, Spare the Dying, Thaumaturgy); Agonizing Blast: +4 to each Eldritch Blast beam's damage; Repelling Blast: a beam that hits pushes the target up to 10 feet away; Eyes of the Rune Keeper: reads all writing
> Spells: Eldritch Blast (cantrip); Light (cantrip); Sacred Flame (cantrip); Mage Hand (cantrip); Minor Illusion (cantrip); Guidance (cantrip); Spare the Dying (cantrip); Thaumaturgy (cantrip); Cure Wounds (1); Guiding Bolt (1); Misty Step (2); Lesser Restoration (2); Hold Person (2); Daylight (3)
> Limits: Two pact slots only, back only after a rest; Light armour; Strength 8 — weak up close; One concentration spell at a time
> Counters: Hit dice 5/5; Pact slots 2/2; Healing light 6/6; Heroic inspiration 0/1
> Money: 1 pp; 8 gp; 41 sp; 12 cp
> Worn: Amulet: Prayer Beads; Armor / clothing: Studded Leather Armour; Belt: Book of Shadows; Main hand: Dagger
> Pack: Bedroll and Rations; Candle ×2; Tinderbox
> 
> Where you are: Whitestone quarry yard, facing the slate-roofed house · Time: Day 1 · morning

**Sefa's player wrote:**

> Sefa lifts a hand to shade her eyes and keeps her pace even, neither hurrying nor stopping. She speaks loudly enough to carry across the yard.
> 
> "Good morning. We're from Maela Thorn's shop in Beregost, come for the case the warden keeps for her." She glances at the scattered hammers and the cart with no mule. "Is that you, master warden? The yard's gone quiet. Has something frightened your men off?"
> 
> As she talks she watches his hands and his feet, not his face. If he is hiding a weapon, or hoping we'll walk into one, his stance will show it first. She stops a little short of the nearest spoil heap and turns her open palms toward him, then says over her shoulder, quietly, to Pell and Bram: "Stay where you can see the house. Let him be the one who moves first."

## player r2 (round 2)

**Screen:**

> Pell spoke low to you and Bram, saying nobody should move until you knew why the yard was so quiet, and he pointed to the dropped hammers, the mule-less cart and the man in the doorway who had not blinked. He asked you whether you could tell if anyone behind the door was hurt or hiding, and told Bram to keep his hands and shield in view, not his sword. Then he said he would look round the side of the sheds. With his hands held out empty, he called across the yard that you were from Maela Thorn's shop in Beregost, sent to fetch the sealed case holding the dye-salts, and asked whether the man was the warden and where his crew was. Bram, for his part, kept his shield on his arm and his right hand loose, called out the same greeting, remarked that the picks looked dropped in a hurry, and held back from the house with his weight on his front foot.
> 
> The man in the doorway does not come down the step. His eyes follow Pell the moment Pell leaves the spoil heap for the sheds, then come back to the three of you. He unfolds his arms and lets his hands hang empty at his sides, and the iron keys shift against his leg.
> 
> "Osric Hale. I'm the warden." His voice is rough, as if it has not been used since yesterday. "Maela Thorn's case is in the house. Sealed, the same as she sent for." He looks at the hammers in the dust, the cart with its traces hanging. "Crew walked off at the noon bell yesterday. Three weeks' wages owed and not a copper come up the Gate road. Tools belong to the house, so they left them lying where they stood."
> 
> You keep your palms open and your eyes on his boots. His weight stays on both feet, and his belt holds only the keys and a short bread knife in a sheath. Behind him the house is dim, a table, a stool, a pot on a hearth that is giving off the smoke. You feel no fear in the doorway, only tiredness, and a man who has been standing in one place for a long time.
> 
> "Nothing frightened them," Osric says, to your question. "They're owed. That's the whole of it." He glances at Pell's shape coming back around the shed wall, and at Bram's shield. "Drinking in Beregost, most of them, I'd guess. Ale's cheaper than waiting on the Gate."
> 
> He waits a breath, then looks at the three of you in turn, and stops on the one with the shield.
> 
> "Which of you is holding Maela's money? Whoever it is, I'll talk to them. The case stays shut until I know whose pocket my lads' wages are in."
> 
> Pell goes into the lower cutting-shed by its side door, and a little later comes out of it brushing white dust from his fingers. Osric watches him from the doorway.
> 
> Your journal, new:
> + Goal: The sealed case of dye-salts
> + Quest: The sealed case of dye-salts
> 
> Where you are: Whitestone Quarry yard, near the spoil heap facing the warden's house · Time: Day 1 · morning

**Sefa's player wrote:**

> Sefa keeps her hands open and does not look at the shed where Pell went. She looks at Osric.
> 
> "Then I'll be honest with you, Master Hale. The money isn't in my pocket or Bram's, and it won't be until the case is in Maela's hands. She pays on delivery, so no one has been paid yet, and that's why none of us can pay your men today." She lets that settle. "But three weeks' wages with no pay coming up the road is a bad thing. I can see why they walked. I don't blame them."
> 
> She nods at the sealed case she cannot yet see. "What's owed, and to how many? Give me the names and the sums, and I'll put them in front of Maela tonight, in writing. I'm a scribe's daughter, I can make a letter that a dye-merchant reads twice. If she sends word that she'll settle, you'll have it on your own name. And if she won't, you'll know by sunset and not by the next moon."
> 
> Her voice stays warm and level. She watches his hands while she speaks, and the moment he says the word "owed" her eyes settle on his jaw, which tightens and then loosens.
> 
> "Meanwhile," she says, "you're a careful man, and I'd be careful too in your place. Show me the seal on the case before anyone touches it, and let's all stand where we can see each other. Then nobody's left guessing."
> 
> She glances once toward the shed, where Pell is still out of sight, and then back at Osric.

## player r3 (round 3)

**Screen:**

> Bram spoke to Osric with his shield raised, keeping his eyes on the man's hands. He said Maela pays only on delivery, by sunset, and that her coin has no bearing on the men's wages. He asked what the weekly sum was and who kept the book, noting that any man who quit over pay would have told it in Beregost. He told Osric to keep his hand away from the knife while they talked, and said you had come only for the case.
> 
> Pell then came out from the shed corner with white dust on his fingers and spoke quietly, so only you and Bram heard. He said the crew's boot-marks led down the cart track and none returned. He also said the cold brazier smelled sweet, and held pink-tinged ash that looked like flour left somewhere warm. He wiped his hands on a rag from the drying line and told Osric aloud that Maela's money was in his own pocket. He said no one would see the case until he had seen it sealed, and he asked where the wages had gone and whether Osric would show the case.
> 
> Osric's eyes went to Pell's dusty fingers, and for a long breath he said nothing. Then he answered: nine men, about a gold a week each, three weeks owed, twenty-seven gold in all. The house's man in the Gate has sent him one letter and no coin. The book is on the shelf over his hearth, and he says he keeps it straight. He said one of your friends was talking for the room and not for him. When Pell mentioned the ash, his jaw went still. He said the brazier had been cold since the cold snap and that men burn scrap in winter.
> 
> His terms are unchanged. The case stays shut in the house until he sees coin for his lads or the Gate man's paper saying it is coming. He told Pell to put a gold or two on the bench toward the nine men, and then he would show the seal. He has not stepped down from the doorway. He stands with his back to the hearth, between the three of you and his own door.
> 
> Where you are: yard in front of the dye house, facing Osric in the doorway · Time: Day 1 · morning

**Sefa's player wrote:**

> Sefa takes her purse from her belt and lets it show in the light. She keeps her other hand open and empty.
> 
> "Master Hale, I won't ask you to take my word for Maela's money. I'll give you what I can now." She sets a single gold piece on the bench by the door, with a small clink. "That's mine, not hers. Put it toward your nine men, and I'll write it into my letter as my own gift. Tonight I'll tell Maela what you're owed and who's been waiting for it."
> 
> She stays on the threshold and does not step over it. "And since you keep the book straight, may I see it? I can read a ledger faster than most clerks, and if I read out your sums in front of your men, then they'll know the figures came from you and not from a stranger." She lifts her chin toward the shelf above the hearth. "I'll stay here. You can hold it."
> 
> Her gaze moves past him to the cold brazier, and the pale powder in its ash. She says nothing about it yet, but she watches his face while she looks.

## player r4 (round 4)

**Screen:**

> You take out your purse and let it show, keeping your other hand open and empty. You tell Master Hale you won't ask him to take your word about Maela's money, and you set a single gold piece on the bench by the door. It is your own, you say, meant toward his nine men, and you will write it into your letter as your gift. You will tell Maela tonight what he is owed. You stay on the threshold and ask to see his ledger, offering to read out the sums before his men. Your gaze moves to the cold brazier and the pale powder in its ash, and you watch his face as you look.
> 
> Pell, beside you, refuses to put a coin down, since Maela's money is paid on delivery. He proposes that you write the names and sums tonight, and that he and Bram stay while the warden opens the case with the seal in view. He wants to see the Gate man's letter too, and asks who has been in the lower shed since the noon bell. Bram mentions the pink ash in the brazier and says he will not hand over a coin until he knows what was burned. He lays two silver of his own on the bench, and asks Osric to step down into the yard, bring the book, and keep the knife sheathed.
> 
> Osric looks at the gold piece for a long moment. Then he steps across the threshold far enough to take it, turns it over in his fingers, and drops it in his apron pocket. He scoops up Bram's two silver as well. "Gold's gold," he says. "Two silver won't buy a man his boots. But it's one of nine, and I'll count it that way."
> 
> He does not come down into the yard. Without turning his back he takes a cracked brown leather book from the shelf over the hearth and stands with one hip against the frame, the book open on his forearm. His other hand hangs near the keys. He reads the names in a flat voice, Harl, Dorran, Eszter, Tam Ill-Ma and on, a gold a week each. The last paid line is at the start of the month, and three weeks sit below it, ruled off in ink. From the threshold you can read the hand: square and careful, a man's own long tally. Only the total at the foot is pressed harder than the rest.
> 
> When you ask for more, he turns back a few leaves quickly, as a man does past something he doesn't want read aloud. On the older page a name catches your eye, *Reed*, with a line of ink after it that the page has already left behind. He shuts the book. "The earlier pages are my business. Not the house's, and not yours."
> 
> To Pell's question he shakes his head. Nobody has been in the lower shed since the noon bell; he locked it when the men walked out and sat down on this step. "You can ask the sky."
> 
> He won't come down into the yard for Bram. "I stand where I stand. You want the paper, I'll show you the paper from here." From a fold inside the back board he takes a single creased sheet with a broken dull red wax seal, and holds it out at arm's length, not offering it, so that you have to step to the very edge of the threshold to read it. The hand is a clerk's, neat and cold.
> 
> *The salt is sold and the price is in hand. Wages to the quarry crew to be settled from the quarter's account. Hold the quarry until the apothecary's carter comes for the case at sunset, as arranged. — for the house, by the hand of E. Tallis.*
> 
> Osric watches you read. "Sold. In hand. Somebody's been paid for that salt, and it isn't the lads and it isn't me." He folds the sheet back into the board. "Your Maela's coin went up the road to a man with a seal, and my lads are in Beregost drinking the difference."
> 
> He puts the book back on the shelf and turns to you, one hand on the frame. The case is in the back room under a cloth, the seal whole, and he will show it when Maela's man shows him something he can spend. "Your carter's clock is running. It's a long road to Beregost by sunset, and I don't see that you've got time to stand in my door arguing about my silver."
> 
> Your records, changed:
> Money: + 7 gp; − 8 gp
> 
> Your journal, new:
> + Promise: Sefa's letter to Maela tonight
> 
> Where you are: at the threshold of the warden's house · Time: Day 1 · morning

**Sefa's player wrote:**

> Sefa takes the sheet in her head before Osric can fold it away again. *The salt is sold and the price is in hand.* She repeats the words under her breath so she won't lose them.
> 
> "Master Hale, who is E. Tallis?" she asks, still on the threshold. "I'd like to know whose hand I'm carrying a complaint to. And the carter who comes at sunset. Is that Maela's man, or someone the house has hired?"
> 
> She keeps her voice even and her hands where they are, but she watches him while he answers. When he says "Tallis" she looks at the book on the shelf, not at him, then at the cloth-covered shape she can just make out through the back-room door, then back at his jaw. She does not press. She only asks, again, in the same warm voice:
> 
> "If the salt is sold, then Maela has been cheated by someone, and so have your men. I think we both want to know who. Did the house sell the case to a buyer before Maela paid for it?"
> 
> Then she turns half-round so Pell and Bram can see her face, and says quietly, not to Osric: "Pell, the ash. Keep a pinch of it in a clean cloth if you can, when no one's looking."

## player r5 (round 5)

**Screen:**

> Pell let his hand fall to his side and kept watching the warden's hand near the keys. He told Osric he would carry the paper to Maela, since it had been shown and you had read it, and asked for the case to be brought to the door or set on the bench in the light, with the seal whole and the cloth removed. He told Bram to watch the cart track and warn him if anyone came back up it. He told you to put the seal, the sums and the hour you read them into one letter to Maela. Then he settled his weight, ready to move. Bram, still watching Osric's hands, said he would accept the case as it stood, shown at the door. He offered Osric one gold from his own share for each of the nine lads, paid through any man Osric names, with your written word that night. He asked Osric for the Gate man's own name, not the house's. He told Pell to guard the back room window so no one slipped out of it.
> 
> Osric looks at the three of them as if counting again, then at the shield in the sun.
> 
> "Tallis is the only name the house puts on its paper," he says. "I've never seen the face. A clerk in the Gate, I'd guess, who writes like he's paid by the line." His thumb moves along the iron ring at his belt. "The carter's the house's business. The house named him, not me. A licence on the coach and the sunset run, the letter says. I don't know the man. I don't know the coach."
> 
> He does not answer the question about the sale. "The house took the money and sent me a letter. Before the sale or after it, you'd want to ask the house. I'm the one standing at this door, and nobody pays me to be the house."
> 
> To Bram he says, "Nine gold, if your share comes in. I'll write it in the book under your name, not the house's. A promise goes in the same column as coin, on my side of the door." He gives a short nod, the nod of a man who has taken worse promises from better men.
> 
> When Pell asks for the cloth off, Osric shakes his head once. "The cloth stays. The case comes to the threshold, and you look at the wax from there. That's what I'll give you before the first gold's in the book."
> 
> He goes into the dim room. You hear the scrape of a stool, then the knock of wood on wood. He comes out with a flat pine box, cloth-wrapped, and sets it on the step where the light falls across it, then steps back to the frame with one hand on the wood. The seal on the cord is whole: a blue wax the size of a thumb, pressed with a mortar and pestle. Maela's mark. Nobody has broken it.
> 
> "Whole," Osric says. "You can count the wax from there, if you've got the eyes for it. Then it goes back on the bench, and it stays shut until I see coin in the book."
> 
> He pulls the box out of the sun and sets it on the bench just inside the door. The bench is the only clean thing in the house.
> 
> Then the yard goes quiet in a different way. From beyond the sheds, along the lip of the lower cut, comes a dry crack, like a knuckle pressed too hard. A slither of white grit runs down a terrace face and stops in a little fan on the ground. Osric turns his head toward the sound and says nothing about it.
> 
> Your journal, new:
> + Thread: Whose pocket holds the crew's wages
> + Debt: Bram's nine gold for the quarry crew
> 
> Where you are: on the threshold of the warden's house · Time: Day 1 · morning

**Sefa's player wrote:**

> Sefa's eyes go to the blue wax on the cord first. She reads the impression from the threshold, the mortar and pestle, and checks that the cord runs through it the way Maela's letter described. Then the dry crack and the little fan of grit draw her head toward the lower cut.
> 
> "Did one of your lads stay behind?" she asks Osric, quietly. "Or is someone else out on the terraces?"
> 
> She keeps one hand open and low, away from her dagger, and speaks to Pell and Bram without turning her back on the warden. "Pell, that's your side of the sheds. Bram, keep the cart track in sight. If anything comes up over the lip, shout before you draw."
> 
> She does not step off the threshold yet. She watches Osric's face in the doorway light, waiting to see whether the sound surprises him or whether he was expecting it.

## player r6 (round 6)

**Screen:**

> Bram keeps his eyes on Osric's hands. His shield drifts a finger's width toward the sheds and the cart track, so the warden stays in front of him and the lip of the cut stays in the corner of his sight.
> 
> Osric takes a long moment over Sefa's question. He looks past the three of them at the grey edge of the lower cut, and for the first time since the track he takes his arm from the doorframe.
> 
> "Nobody's up there. The lads are gone, I told you that." He breathes out through his nose. "That lip's been going since the spring thaw. I wrote it to the house, twice. They sent a man to look, and the man sent nothing back." He sets his hand on the frame again. "Keep off the edge. That's the only warning I've got."
> 
> Pell reaches the stack of cut slabs and takes the first course with his fingertips, then a knee. It holds. The second course holds. On the third he gets both hands flat on the top stone and pulls himself up toward the rim of the terrace, and for a heartbeat he sees over it: a shelf of pale chalk, a black pool below, and a squared block lying in the water with lines cut across its upper face.
> 
> Then the chalk under his hands gives with a soft sound, like wet paper tearing. The shelf goes out from under him.
> 
> The fall takes him off the shelf and down into the cold. He lands feet first and then sideways, and the water takes him to the chest, black and cold as a cistern. A squared block that had lain under the chalk slides off the broken rim as he goes and comes down across his shin, and he feels the weight settle and hold. The water is not deep enough to drown him, but it is deep enough that his leg stays where it is.
> 
> Up on the rim the chalk is still falling in small slides, and the grit runs down into the working in a thin white stream. Osric has come one step out of his doorway, and the iron keys stop swinging at his belt. He says nothing for a moment, then he says, rough and quiet, "That's the old floor. It was always going to go."
> 
> From the yard, the next sound is Pell's own voice, short and tight, telling them he is in the water and the stone is on his leg.
> 
>  Out of game: neither needs a card. Reading the wax from the threshold is inspection, and the seal is whole as the box shows. The climb up the slab stack is Pell's own trade in daylight, so it was never a roll; the chalk gave way under it by the world's own schedule, not by a check.
> 
> Where you are: on the threshold of the warden's house · Time: Day 1 · morning

**Sefa's player wrote:**

> Sefa is already moving before the warden finishes speaking. She steps off the threshold, keeping the wall at her back, and her eyes go to the black water and the grey block across Pell's shin.
> 
> "Osric, rope. A long one, and a bar, anything you lever with. Where do you keep them?"
> 
> Osric does not answer at once. His eyes go to the broken rim, then to the shed where the picks were stored. "Rope on the hook inside the side door. Bar's under the bench. The lads took the good chain." He is already turning. "Don't stand under that shelf."
> 
> Sefa shouts to Pell, loud and steady: "Pell, can you feel the stone on your leg? Is it moving, or is it just sitting there? Don't pull against it. Tell me what you feel!"
> 
> She looks back toward the cart track and sees Bram's shield still angled toward the lip. "Bram, bring the cart's traces off the wheel if you can. Anything that'll hold a knot. And stay off the edge!"
> 
> Then she goes for the side door herself, but stops just short of the sheds and looks at the chalk fall still spilling down the cut. She plants her feet well back from the rim before she calls once more down into the water.
> 
> "Pell, I'm coming to the rope. Hold still. Keep your head up!"
> 
> Where you are: yard by the lower cut, near the warden's side door · Time: Day 1 · morning

## player r7 (round 7)

**Screen:**

> You moved off the threshold with the wall at your back and asked Osric where the rope and a bar were kept. He looked at the broken rim and the shed where the picks were stored, then told you the rope hung on the hook inside the side door and the bar was under the bench. The lads had taken the good chain. He warned you not to stand under that shelf. You called down to Pell to ask whether the stone on his leg was moving and told him not to pull against it. You told Bram to bring the traces off the cart's wheel, anything that would hold a knot, and to stay off the edge. Then you made for the side door, stopped short of the sheds, and called to Pell that you were coming with the rope and he should hold still and keep his head up.
> 
> Osric answers from the step, flat and quick: the hook is inside the side door, on the left, and the bar is under the bench. He does not come down, but he does not block the door either, and the keys go still at his belt.
> 
> You stop at the corner of the shed, a long stride back from the rim, and wait for the thin white thread of chalk to thin before you go in. Up from the water comes Pell's voice, pitched low. The stone is sitting on his shin, not grinding, and he is not pulling.
> 
> Bram sets his shield against the spoil heap, draws his longsword, and climbs the stack by the course Pell already tested. At the top he lays the blade flat on the rim, away from the broken chalk, and gets his fingers beneath the top corner of the block. He plants his boots at the edge of the shelf and calls a count to three.
> 
> On three, Bram heaves. The block comes up a finger's width off the grey stone beneath it, and then the wet chalk under his boots gives and the weight drops back. His hands slide off the corner, and the longsword skids on the rim and nearly goes over the edge before he catches it by the grip. Pell's shin stays where it was, and the water closes over the stone again.
> 
> "Not like that," Pell says through his teeth. "Not by hand. You'll need the bar."
> 
> Bram lies flat on the rim with his arm hooked over the top course, getting his breath back. He does not look at Osric. You are already turned toward the side door, and the hook and the bar are a few steps inside it.
> 
> Where you are: corner of the shed by the warden's side door, near the cut · Time: Day 1 · morning

**Sefa's player wrote:**

> Sefa ducks inside the side door. The rope hangs on the left-hand hook, a coil of hemp as thick as her wrist and stiff with old salt. The bar is under the bench where Osric said, an iron-shod length of ash, heavier than it looks. She tucks the rope over one shoulder, takes the bar in both hands, and comes back out into the light.
> 
> The chalk has stopped falling. From the rim Bram looks down at her, grey-faced and breathing hard, still hooked over the top course. Pell's voice comes up from the water, steadier now: "It's on the shin, not the knee. I can move my foot a finger. Don't drop anything on me."
> 
> Osric has not moved from the step. His eyes are on the bar, and then on the rope, and then on the broken rim.
> 
> Sefa looks at the stone and then at the shelf, working it out. The block is squared and heavy, and its weight rests on the grey base beneath the water. Bram's hands could not get under it. The bar might, if it found a purchase on the sound stone beneath the chalk, and a rope round the block would give them something to haul against instead of their backs.
> 
> She keeps her feet well back from the rim as she calls down: "Pell, don't move your leg yet. Bram, if you can take the bar from me, I'll pass it up. Put it in the gap under the corner and lever it up, slow. I'll take the rope round the block and we'll haul together. Osric, will you lend a hand on the rope, or are you going to stand on that step?"
> 
> Where you are: rim of the lower cut, above Pell in the water · Time: Day 1 · late morning

## after 1 (round 7)

**Screen:**

> Bram, at the rim, told you to bring the bar quickly and walk the sheds, not the edge. He told Osric the bar must come out of the shed in your hands and go to him, that Osric was not to touch it or go near the side door or tell his lads' names to the water, and that he would hold Osric to it if the chalk dropped anyone else into the cut. He told Pell low and steady that you would get it under the block, and to keep his leg loose and say the second the stone shifted or the cold went numb. Then he pushed himself up on his good arm, wiped his knuckles down his tunic and looked over the slab stack for the next firm stone, keeping from the lip until the bar was in his hands. Pell, from the water, told Bram to get off the rim and told you to bring the bar and rope and not stand on the shelf. He said the bar goes under the near end of the block on sound grey stone, not chalk, levered from the shed side and chocked with spoil or a slab as it lifts. He said that when it was set Bram would take the bar and he would take the strain himself, pulling his leg only as the stone comes, and that Bram must count and not say three until the bar was firm.
> 
> You walk the sheds, not the edge. You lift the bar up the stack course by course, and Bram leans over the rim to take it, the rope looped over his good arm. The iron shoe scrapes the stone and a little chalk breaks from the lip and drifts down into the water.
> 
> Osric watches the rope in your hands. For a long breath he says nothing, and the keys at his belt are still. Then he comes down off the step into the yard, the first time he has left his threshold since you arrived. He does not go toward the lip. He walks to the back of the yard, to a squat timber post by the lifting frame, well away from the broken rim, and holds out his hand for the rope.
> 
> He says that post took the frame's cable for ten years, winds the hemp twice round it and tests each turn with his full weight. He says it holds, he'll take the strain from there, not a foot nearer. He looks at the bar in Bram's hands and says it's his and goes back on the shed wall the way it hangs now.
> 
> Bram lies flat along the rim and works the bar down into the gap beside the block's near corner. The point finds the grey stone under the chalk and catches. He shifts his weight back and the bar takes it. As the chalk slurries off the block's upper face, a cloud of pale silt rises through the water and hangs over Pell's head, then slowly clears.
> 
> Through the clear water, just under the surface, the block's upper face shows a sunburst cut into the white stone: a ring with long rays running out, each cut deep and square-ended, and round the rim of the ring a row of tiny strokes grouped in fives, set so close they look like a tally written in a circle. Some strokes are filled with black grime, others clean. The lines look like something someone meant to be read.
> 
> The water is at Pell's chest and not an inch higher. The stone across his shin is still where it was. You hold the rope's slack with your feet set well back from the rim, and Osric has taken the first turn of the hemp in his fists, knuckles whitening as he braces against the post. Bram's arms are locked on the bar, his boots on the firm grey stone at the edge, and the sunburst lies in the clear water beneath him, waiting.
> 
> Where you are: in the yard just back from the rim, holding the rope · Time: Day 1 · morning
> 
> The session is over.
> 
> How was the table?

**Sefa's player wrote:**

> Overall, it was a good table. The scene felt alive: Osric's ledger, the cold brazier with its pink-tinged ash, and the "Tallis" letter gave us real questions to chase, and the cave-in came from the world rather than from a roll, which made it land harder. The sunburst cut into the block is a strong hook, and I'm curious what it means.
> 
> A few small notes, in case they're useful:
> 
> - **Money:** I gave Osric one gold, so Sefa should have 7 gp left. The change line read "+7 gp; −8 gp," which doesn't match the purse. I'd fix that before we pick up.
> - **Pacing:** Some exchanges took a lot of back-and-forth before the action moved. That's fine for a warden's standoff, but a bit more brevity in the talk would help the pace once the chalk starts falling.
> - **Roles:** Pell's and Bram's lines sometimes got close to what Sefa would say or do. Nothing went wrong, but it was easy to lose track of who was doing what in the rescue.
> 
> I'm glad to continue next time, with Pell still in the water and the bar levered in place.

## after 2 (round 7)

**Screen:**

> Was there something you wanted to do and didn't?

**Sefa's player wrote:**

> Yes, a few things. The sunburst cut into the block is the one I most wanted to study. Its ring of tallies looks like writing, and Sefa's Eyes of the Rune Keeper reads all writing, so I wanted her to try to read it before the bar lifted the stone. I also wanted her to use her healing and her Spare the Dying against the cold, since Pell was in the water and that was her skill, but I was never sure the scene had given her an opening to offer it.
> 
> I'd also have liked to press Osric harder about the Tallis letter and the sale. I held back because he kept shutting the conversation down, and I didn't want to push him into a standoff that would take the scene away from the rescue.

## after 3 (round 7)

**Screen:**

> Who did you take the other two players to be?

**Sefa's player wrote:**

> I took them to be the two characters the campaign file gives: Pell Dunmore, the quick, quiet human rogue from the Lower City who carries a healer's satchel, and Bram Halloway, the human fighter in chain mail, a former Trade Way caravan guard. I didn't know anything about the people behind them beyond what they wrote at the table. I read their messages as their characters' actions and kept my own choices to Sefa's.
> 
> When I said Pell's and Bram's lines sometimes got close to what Sefa would say, I was reacting to the flow of the scene, not to any real overlap. Pell's and Bram's messages were clear about what each of them was doing, so I should have been more specific about where I lost track.
