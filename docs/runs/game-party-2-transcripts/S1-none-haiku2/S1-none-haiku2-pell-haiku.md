# S1-none-haiku2 — Pell Dunmore's player: Claude Haiku 5.5 (the dry run's player)

Synthetic content: invented characters in an invented campaign. Stage origin/claude/handoff at bbdee5fb (docs/stages/GAME_PARTY_2.md with its amendments of 2026-10-28 23:10 LA, 23:15 LA, 2026-10-29 18:35 LA and 18:45 LA); Mandate: issue #1; docs/POLICY.md v1. Design sha256 `44b65700264290044b2e6aa30c59b0999af725361b4ab7552a4dad574947f9a6`.

Arm **S1-none** (Beregost — the Whitestone case; none (the control)); the one in danger (the layer's die): Pell Dunmore. 7 round(s) of 7; ended by rounds. Models: every Claude call as Claude Haiku 5.5 but the relay's (Claude Sonnet 5.5); the players Claude Haiku 5.5.

Seats: Bram Halloway (fighter) — Claude Haiku 5.5 (the dry run's player); Sefa Marrin (warlock) — Claude Haiku 5.5 (the dry run's player); Pell Dunmore (rogue) — Claude Haiku 5.5 (the dry run's player). The order of the round's messages turns round each round from the table's coin (2). The players are not told what the others are.

The player's system prompt: `playerSystem("S1", "pell", …)` in scripts/game-party-2/frozen.mjs, sha256 `0ded710375ecc73d4a22a832c7ac237a25c232f3cca3b2b12f76ca37e3669088`.

## player r1 (round 1)

**Screen:**

> The session begins.
> 
> The cart track bends one last time, and Whitestone opens up before you: a white wound in the hillside, terraces of chalky stone glaring in the late-morning sun, dust drifting across a yard of spoil heaps and sheds. You, Bram Halloway and Sefa Marrin have covered half a day of road since before dawn, and somewhere behind you, half a day back, Maela Thorn's shop waits for a sealed case that must reach it before sunset.
> 
> But the quarry does not sound like a quarry. No ring of picks, no shouting from the faces, no creak from the lifting frame. Hammers and wedges lie scattered near the lower cut as if their owners simply set them down and walked away. A stone cart stands half-loaded, its traces empty, no mule in sight. Only the chimney of the low slate-roofed house shows life, a thin grey thread of smoke.
> 
> In the doorway of that house stands a heavy-set man in a dust-whitened leather apron, a ring of keys at his belt. He has already seen you. He does not wave and he does not come forward; he just stands there, arms folded, waiting to see what you do next.
> 
> Your records:
> Pell Dunmore — Human, rogue 5 (Thief), Lower City roof-runner turned hireling, level 5
> HP 33/33 · AC 15 · Speed 30 feet
> STR 10 · DEX 17 · CON 13 · INT 13 · WIS 12 · CHA 12
> Skills: Stealth +9 (expertise); Sleight of Hand +6; Acrobatics +6; Perception +4; Investigation +4; Insight +4; Tools: thieves' tools +9 (expertise)
> Saves: Dexterity saving throw +6 (proficient); Intelligence saving throw +4 (proficient); Strength saving throw +0; Constitution saving throw +1; Wisdom saving throw +1; Charisma saving throw +1
> Attacks: Shortsword +6 to hit, 1d6+3 piercing; Dagger +6 to hit, 1d4+3 piercing, thrown 20/60; Shortbow +6 to hit, 1d6+3 piercing, range 80/320; Sneak Attack: +3d6 once a turn with advantage or an ally beside the target
> Abilities: Proficiency bonus +3; Sneak Attack 3d6; Cunning Action: Dash, Disengage or Hide as a bonus action; Uncanny Dodge: a reaction halves the damage of an attack he can see; Fast Hands (Thief): a bonus action to use an object — a potion on another, a lock, a lamp; Second-Story Work: climbs at full speed; Thieves' Cant
> Limits: Light armour; 33 hit points — he cannot stand at the front for long; Sneak Attack needs advantage or an ally beside the target
> Counters: Hit dice 5/5; Heroic inspiration 0/1
> Money: 31 gp; 2 ep; 6 sp; 55 cp
> Worn: Armor / clothing: Studded Leather Armour; Belt: Thieves' Tools; Main hand: Shortsword
> Pack: Arrow ×20; Bedroll and Rations; Dagger ×2; Flask of Oil ×2; Hooded Lantern; Potion of Healing ×3; Shortbow; Silk Rope (50 feet)
> 
> Where you are: Whitestone quarry yard, facing the slate-roofed house · Time: Day 1 · morning

**Pell's player wrote:**

> Pell stops at the edge of the yard, behind the nearest spoil heap, and doesn't step out into the open. He says it low, just loud enough for the other two:
> 
> "Bram, Sefa, nobody moves until we know why there's no noise. Hammers on the ground, a cart with no mule, and the man in the door hasn't blinked once. I don't like it."
> 
> While he talks, Pell's eyes go over the roofline before the yard: the shed's ridge, the gutter on the house, the stack of cut slabs that would give a climber a way up. He notes which windows have shutters open and which are closed, and where the smoke comes from.
> 
> "Sefa, can you tell whether there's anyone behind that door who's hurt, or hiding? Bram, stay where the man can see your hands and your shield, not your sword. I'll take a look round the side of the sheds."
> 
> Then Pell calls across the yard in a level voice, empty hands held out from his sides:
> 
> "Morning. We're from Maela Thorn's shop in Beregost. We've come for the sealed case with the dye-salts. Are you the warden? Where's your crew?"

## player r1 card 1 (round 1)

**Screen:**

> Bram and Sefa both stopped at the edge of the yard beside you. Bram kept his shield on his arm and his right hand empty and loose, and called out toward the doorway that the three of you came from Maela Thorn's shop in Beregost for the sealed case of dye-salts. He asked where the crew was, and remarked that the picks looked dropped in a hurry. Then he held back from the house, weight on his front foot, watching the man's hands and the dark behind him. Sefa shaded her eyes, walked on at an even pace and said the same about Maela Thorn's shop. She asked whether the man was the warden and whether something had frightened his men off. She stopped a little short of the nearest spoil heap with her palms open toward him, and told you and Bram quietly to keep the house in sight and let him move first.
> 
> The man in the doorway does not come down the step. His eyes follow you the moment you leave the spoil heap for the sheds, then go back to the other two. He unfolds his arms and lets his hands hang empty; the iron keys shift against his leg.
> 
> "Osric Hale. I'm the warden." His voice is rough, as if it has not been used since yesterday. "Maela Thorn's case is in the house. Sealed, the same as she sent for." He looks at the hammers in the dust and the cart with its traces hanging. "Crew walked off at the noon bell yesterday. Three weeks' wages owed and not a copper come up the Gate road. Tools belong to the house, so they left them lying where they stood."
> 
> Round the side of the nearest shed you find a yard of grey slate and a bucket, a line of rags drying stiff with white dust, and a shutter that has not been opened in a long time. Nothing waits behind it. The gutter on the warden's house is sound. The stack of cut slabs by the wall would give a climber a way onto the roof, and nobody is on it.
> 
> "Nothing frightened them," Osric says in answer to Sefa. "They're owed. That's the whole of it." He glances at your shape coming back around the shed wall, and at Bram's shield. "Drinking in Beregost, most of them, I'd guess. Ale's cheaper than waiting on the Gate."
> 
> He waits a breath, then looks at the three of you in turn and stops on the one with the shield.
> 
> "Which of you is holding Maela's money? Whoever it is, I'll talk to them. The case stays shut until I know whose pocket my lads' wages are in."
> 
> A closer search of the sheds for what the crew left behind is the one thing here worth rolling dice for.
> 
> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Investigation: searching the sheds round the yard for what the crew left behind and what was taken
> What adds to the die: +4 Investigation
> DC 15
> Rerolls left: 2
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Pell's player wrote:**

> Pell takes the shed wall at a crouch and works along it, eyes on the floor first, then the shelves, then the nails by the door. The roll card is in front of him; he presses the die.
> 
> [Roll the die]

## player r1 card 1 (round 1)

**Screen:**

> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Investigation: searching the sheds round the yard for what the crew left behind and what was taken
> What adds to the die: +4 Investigation
> DC 15
> Rerolls left: 2
> Die: 14
> 14 + 4 = 18
> Success — 18
> 
> [Onward] [Request an allowed reroll — Investigation: searching the sheds round the yard for what the crew left behind and what was taken]

**Pell's player wrote:**

> Pell works the sheds one at a time: the shelves first, then the floor, then the nails by the door. Behind a loose board in the tool shed he finds a wage-book, its cover stiff with dust. The names are the crew's, with sums beside them. The last paid line is from the start of the month. Below it, three weeks' wages are set down as owed, and the figure has been written over in a different ink, a hand that presses harder. Whoever wrote it had a reason to change it.
> 
> On the packed floor of the same shed, the dust holds a clear trail. The crew's hobnailed boots went out toward the lower cut, not down the Gate road. Among those prints are a few made by a lighter, narrower boot, and those come back up from the lower cut, pause by the bucket outside, and go on to the warden's house. Nobody left the quarry on foot the way Osric said they did.
> 
> Pell puts the wage-book back exactly as he found it and lets the board settle. He keeps his voice low when he speaks to the other two.
> 
> "The book's been changed. The men were paid up to the month's start, and somebody crossed out the rest. Their boots went toward the lower cut, not the road. And there's a second pair of feet that came back from there, close to the warden's door."

## player r1 card 2 (round 1)

**Screen:**

> [Out of game] Out of game: the card stands as it is, Investigation +4 against DC 15. Pell's search is written as your proposal, so what the shed actually holds will follow from the result once you press [Onward] or use a reroll.
> 
> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Investigation: searching the sheds round the yard for what the crew left behind and what was taken
> What adds to the die: +4 Investigation
> DC 15
> Rerolls left: 2
> Die: 14
> 14 + 4 = 18
> Success — 18
> 
> (The card waits for [Onward] or a reroll.)
> 
> [Onward] [Request an allowed reroll — Investigation: searching the sheds round the yard for what the crew left behind and what was taken]

**Pell's player wrote:**

> [Onward]

## player r2 (round 2)

**Screen:**

> You go into the lower cutting-shed by its side door, where the light comes grey through a broken slat. The tools in there have been left in neat rows, and the bench is clean. Against the back wall stands a squat iron brazier, cold, its grate furred with a crust of pinkish-white ash. When you crouch and turn a finger through the crust, it comes away fine and dry, and a faint sweetness rises from it, like flour left too long in a warm room.
> 
> Beside the shed door, the dust of the yard is printed with boot-marks, a lot of them, all heading down the cart track towards the Beregost road. None of them come back. The crew walked out, carrying their own bags, and left the house's tools where they stood.
> 
> Out in the yard, Osric has not moved from his doorway. He is watching the shed corner, and then he watches you come out of it, brushing white dust from your fingers.
> 
> Your journal, new:
> + Goal: The sealed case of dye-salts
> + Quest: The sealed case of dye-salts
> 
> Where you are: Whitestone Quarry yard, by the lower cutting-shed · Time: Day 1 · morning

**Pell's player wrote:**

> Pell comes out of the shed corner with his fingers held a little away from his coat, the white dust still on them, and keeps his voice low so only Bram and Sefa will catch it.
> 
> "Your crew didn't walk out with their bags, Osric. Their boot-marks go down the cart track, but none come back up it. And there's a sweet smell in the cold brazier that I don't like: pinkish ash, like flour left in a warm room. Somebody burned something in there, and it wasn't stone dust."
> 
> He wipes his fingers slowly on a rag from the drying line, then looks straight at the warden in the doorway.
> 
> "Here's where I stand. Maela's money is in my pocket, which is her business and mine, not yours. Nobody sees that case until I've seen it sealed, and I want to know where your lads' wages went, because I can read a wage-book as well as you can. Will you show us the case?"
> 
> He doesn't move toward the house yet. His eyes go to Bram's shield, then to Sefa's open palms, and then to the door behind Osric, judging the gap there.

## player r3 (round 3)

**Screen:**

> While you were at the shed, Bram spoke to Osric with his shield up and his eyes on the man's hands. He said Maela pays on delivery, at sunset, and that her coin has nothing to do with the men's wages. He asked how much a week the men were owed and who keeps the book, and said word of walkouts would have reached Beregost. He told Osric to keep his hand off the knife.
> 
> Sefa spoke with open hands. She said no one had been paid yet and that was why none of you could pay the men today. She offered to take names and sums to Maela in writing that night, and she asked to see the seal on the case with everyone standing where they could see each other.
> 
> Osric's eyes went to your dusty fingers, and for a long breath he said nothing. Then he answered: nine men, about a gold a week each, three weeks owed, twenty-seven gold in all. The house's man in the Gate has sent him one letter and no coin. The book is on the shelf over his hearth, and he says he keeps it straight. He said one of your friends was talking for the room and not for him. When you mentioned the ash, his jaw went still. He said the brazier had been cold since the cold snap and that men burn scrap in winter.
> 
> His terms are unchanged. The case stays shut in the house until he sees coin for his lads or the Gate man's paper saying it is coming. He looked straight at you and told you to put a gold or two on the bench toward the nine men, and then he would show the seal. He has not stepped down from the doorway. He stands with his back to the hearth, between the three of you and his own door.
> 
> Where you are: yard in front of the dye house, facing Osric in the doorway · Time: Day 1 · morning

**Pell's player wrote:**

> Pell doesn't step toward the bench. He lets the warden see his hands, then speaks evenly.
> 
> "Twenty-seven gold, nine men, and a wage-book that's been written over. That's not three weeks of pay, Osric. That's three weeks of somebody's ledger being lied in."
> 
> He glances at Bram, then back at the doorway.
> 
> "I'm not putting a coin on your bench. Maela's money is on delivery, and it's hers to give. But I'll tell you what I'll do. Sefa writes the names and sums tonight. Bram and I stay here while you open that case, with the seal in plain view, and I'll look at the paper with you. If the Gate man's letter is in your house, I want to see it too."
> 
> He lowers his voice a notch.
> 
> "And if your lads were paid, they didn't walk to Beregost with their bags. Who else has been in your lower shed since the noon bell?"
> 
> He keeps his feet where they are and watches the door behind Osric, the gap by the hearth, and the hand hanging near the iron keys.

## player r4 (round 4)

**Screen:**

> You keep your feet where they are and let the warden see your hands. You tell Osric that twenty-seven gold, nine men and a written-over wage-book add up to somebody's ledger lying, not three weeks of pay. You refuse to put a coin on his bench, since Maela's money is paid on delivery. You propose that Sefa write the names and sums tonight, and that you and Bram stay while he opens the case with the seal in plain view, so you can see the paper too, if the Gate man's letter is in his house. You ask in a lower voice who has been in the lower shed since the noon bell. You watch the door behind him, the gap by the hearth, and his hand near the iron keys.
> 
> Before that, Sefa took out her purse and let it show, her other hand empty. She told Osric she wouldn't ask him to take her word about Maela's money, and she set down one coin of gold by the door, on the bench, as her own gift toward his nine men, to go in her letter. She said she would tell Maela tonight what he was owed. Staying on the threshold, she asked to see his ledger, offering to read out the sums before his men. Her gaze then went to the cold brazier and its pale powder. Bram spoke of the pink ash and said he would give no coin until he knew what was burned. He laid two silver of his own on the bench, and told Osric to step down into the yard, bring the book, and keep his knife sheathed.
> 
> Osric looks at the gold piece for a long moment. Then he steps across the threshold far enough to take it, turns it over, and drops it in his apron pocket. Bram's two silver go the same way. "Gold's gold. Two silver won't buy a man his boots. But it's one of nine, and I'll count it that way."
> 
> He does not step into the yard. Without turning his back on the doorway he takes a cracked brown leather book from the shelf over the hearth and stands with one hip against the frame, the book open on his forearm where you can see the pages. His other hand hangs near the keys. He reads the names flatly, Harl, Dorran, Eszter, Tam Ill-Ma and on, a gold a week each, the last paid line at the start of the month, three weeks ruled off below. Sefa can read the hand from the threshold. Only the total at the foot is pressed harder than the rest.
> 
> When Sefa asks for more, he turns back a few leaves quickly, the way a man turns past something he doesn't want read aloud, then shuts the book. "The earlier pages are my business. Not the house's, and not yours."
> 
> To your question he shakes his head. Nobody has been in the lower shed since the noon bell; he locked it when the men walked out and sat on this step. "You can ask the sky, if you want, it saw the same."
> 
> He will not come down into the yard. "I stand where I stand. You want the paper, I'll show you the paper from here." From a fold inside the back board he takes a creased sheet with a broken dull red wax seal and holds it out at arm's length, not offering it, so that Sefa has to step to the very edge of the threshold to read it. She reads it while Osric watches. "Sold," he says. "In hand. That's what the house says, the once it's bothered to write. Somebody's been paid for that salt, and it isn't the lads and it isn't me." He folds it back into the book's board. "So that's whose pocket. The house's, in the Gate. Your Maela's coin went up the road to a man with a seal, and my lads are down in Beregost drinking the difference."
> 
> He sets the book on the shelf and turns back to you, one hand on the frame. The case is in the back room under a cloth, the seal whole. He will show it when Maela's man shows him something he can spend. He looks at you, then toward Bram's knife-side, then at the sunlit yard. "Your carter's clock is running. It's a long road to Beregost by sunset, and I don't see that you've got time to stand in my door arguing about my silver."
> 
> Out of game: your shed search still waits for [Onward] on its card, so nothing new from the sheds has been added.
> 
> Your journal, new:
> + Promise: Sefa's letter to Maela tonight
> 
> Where you are: in the yard before the warden's door · Time: Day 1 · morning

**Pell's player wrote:**

> Pell lets his hand drop from the open palm to his side, slow and easy, and keeps his eyes on the warden's hand near the keys.
> 
> "Fair enough, Osric. I don't need your silver and I'm not here to argue about it. The paper's been shown, and Sefa's read it, so I'll take that to Maela." He tips his head toward the back room. "The case, though. Bring it to the door, or let me see it on the bench where we can all stand in the light. I want the seal whole and I want the cloth off. If it's salt, I'll know it's salt. If it's something else, I'll know that too."
> 
> He glances at the sun, then at the cart track, where the boot-marks run down toward the Beregost road.
> 
> "Bram, keep an eye down that track. If anyone comes back up it, I want to know before they know we're here. Sefa, when you write to Maela, put the seal and the sums in the same letter, and the time you read them. She can judge the rest herself."
> 
> He settles his weight, ready to move the moment the warden does.

## player r5 (round 5)

**Screen:**

> Bram said he would take the case as it stood, brought to the door with the seal shown. He offered Osric a gold of his own share toward each of the nine lads, paid through a man Osric names and put in writing by Sefa that night. Then he asked Osric for the name of the man in the Gate who sent the letter, the man's own name and not the house's. He told you to watch the back room window so nobody goes out of it. Sefa, still on the threshold, asked Osric who E. Tallis is and whether the sunset carter is Maela's man or the house's hire. She asked whether the house sold the salt before Maela paid for it. Then she turned so you and Bram could see her face and quietly asked you to keep a pinch of the ash in a clean cloth if you can do it unseen.
> 
> Osric looks at the three of them as if counting again, then at the shield in the sun.
> 
> "Tallis is the only name the house puts on its paper," he says. "I've never seen the face. A clerk in the Gate, I'd guess, who writes like he's paid by the line." His thumb moves along the iron ring at his belt. "The carter's the house's business. The house named him, not me. A licence on the coach and the sunset run, the letter says. I don't know the man. I don't know the coach."
> 
> He does not answer the question about the sale. "The house took the money and sent me a letter. Before the sale or after it, you'd want to ask the house. I'm the one standing at this door, and nobody pays me to be the house."
> 
> To Bram he says, "Nine gold, if your share comes in. I'll write it in the book under your name, not the house's. A promise goes in the same column as coin, on my side of the door." He gives a short nod, the nod of a man who has taken worse promises from better men.
> 
> When you ask for the cloth off, Osric shakes his head once. "The cloth stays. The case comes to the threshold, and you look at the wax from there. That's what I'll give you before the first gold's in the book."
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
> Where you are: in the yard before the warden's house door · Time: Day 1 · morning

**Pell's player wrote:**

> Pell reads the wax from the threshold without stepping over it: the blue seal whole, the mortar-and-pestle mark crisp, the cord unbroken. He gives a short nod. "Whole. Good."
> 
> Then his head turns toward the sound, and he goes still. He doesn't look at the warden. He looks at the lip of the lower cut, where the grit has stopped in its small fan.
> 
> "Bram, Sefa, that was no slate settling. Something's up on the cut." He keeps his voice low and his hands where Osric can see them. "Osric, your lads didn't take their bags down that track, and I want to know who's up on that lip before they know we're looking. Stay where you are."
> 
> He moves along the shed wall, away from the open yard and into the shadow the slabs throw. His eyes go to the stack of cut stone by the wall: a climber's staircase, and high enough to see over the terrace edge. He touches the first slab with his fingertips, checks it holds, and starts up, light and quiet, rope coiled at his hip, ready to lie flat on the top and look down along the cut.
> 
> "If anyone comes up that bank, shout. Don't wait for me to come down."

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
> Your records, changed:
> Pell Dunmore: HP 25/33
> Conditions: pinned leg under a fallen block, chest-deep in cold water
> 
> Where you are: in the yard before the warden's house door · Time: Day 1 · morning

**Pell's player wrote:**

> Pell hangs in the black water with his chest against the cold and the stone across his shin, and the first thing he does is breathe. Then he gets his free hand onto the broken lip and pulls, not hard enough to shift the block but hard enough to know where his grip is.
> 
> "I'm in the water. Stone's on my left shin, it's holding, not crushing." His voice is short and tight, pitched so the yard can hear it and the rim does not carry it far. "Don't come up the stack. The chalk's still going."
> 
> He looks up at the falling grit, then at the squared block under the surface, the lines cut across its face showing pale in the dark water. He keeps his fingers off the edge.
> 
> "Bram, Sefa, the sides here are chalk, not rock. Don't put a foot on the shelf. Sefa, if you can reach me without standing on it, I need a hand on my belt and something to pull against. Osric, stay where you are. I'll not ask you for anything yet."
> 
> Then, quieter, to himself as much as anyone: "Hold still, Dunmore. Count the breaths. Find out what the block is doing before you try to move it."
> 
> He starts with the breaths, slow, and his other hand goes flat against the wet wall to take what weight it can.

## player r7 (round 7)

**Screen:**

> You hung in the black water with the stone across your shin and called up that it was holding, not crushing. You warned the others off the stack and the shelf, because the chalk was still falling, and you asked Sefa for a hand on your belt and something to pull against. You told Osric to stay where he was. Sefa shouted down, asking whether the stone was moving, and told you not to pull against it. She told Bram to bring the cart's traces. She then called that she was coming with the rope. Bram told Sefa to go along the sheds and not the edge, and to take the healer's kit. He told Osric to stay on his step with his hands in sight. He climbed the stack of slabs along the course you had tested, and told you to hold still, that he would get his hands under the stone and lift it off you.
> 
> Osric answers from the step, flat and quick: the hook is inside the side door, on the left, and the bar is under the bench. He does not come down, but he does not block the door either, and the keys go still at his belt.
> 
> Sefa stops at the corner of the shed, a long stride back from the rim, and waits for the thin white thread of chalk to thin before she goes in. You tell the rim, pitched low, that the stone is sitting on your shin, not grinding, and that you are not pulling.
> 
> Bram lays his longsword flat on the rim, away from the broken chalk, and slides his fingers beneath the top corner of the block. The stone is cold and wet, and the water sucks at its underside. He sets his boots at the edge of the shelf and calls a count to three.
> 
> On three, he heaves. The block comes up a finger's width off the grey stone beneath it, and then the wet chalk under his boots gives and the weight drops back onto your shin. His hands slide off the corner, and the longsword skids on the rim and nearly goes over before he catches it by the grip. The water closes over the stone again.
> 
> "Not like that," you say through your teeth. "Not by hand. You'll need the bar."
> 
> Bram lies flat on the rim with his arm hooked over the top course. Down at the shed corner Sefa has already turned toward the side door.
> 
> Where you are: in the black water of the lower cut, under the broken rim · Time: Day 1 · morning

**Pell's player wrote:**

> Pell shuts his eyes for a breath while the block settles back on his shin. Then he opens them and speaks through his teeth, low and steady.
> 
> "Right. Bram, get off the rim before the rest of it goes. Sefa, bring the bar and the rope, and don't stand on the shelf. The bar goes under the near end of the block, on the sound grey stone, not the chalk. Lever it up from the shed side, and chock it with a piece of spoil or a slab as it lifts, so it can't drop back."
> 
> He tips his head a finger's width, testing the weight on his leg, and winces.
> 
> "Bram, when she's set, you take the bar and I'll take the strain on my own. I'll pull my leg as the stone comes, not before. Count it. Don't say three till the bar is firm."
> 
> He gets his free hand onto the wet wall again and holds, the water at his chest, his eyes on the grey block under the surface.

## after 1 (round 7)

**Screen:**

> Bram, still at the rim, called for Sefa to bring the bar quickly and keep to the sheds, not the edge. He warned Osric off the bar and the side door, and told him he'd be held to account if the chalk dropped anyone else into the cut. Then he told you to keep your leg loose and to call out the moment the stone shifted or the cold numbed you, and not to fight it. Sefa, from back of the rim, told you not to move your leg yet. She told Bram to take the bar from her and lever it into the gap under the corner, slowly, while she took the rope round the block so they could haul together. She asked Osric whether he would lend a hand on the rope or stand on his step.
> 
> Sefa walks the sheds, not the edge. She lifts the bar up the stack course by course, and Bram leans over the rim to take it, the rope looped over his good arm. The iron shoe scrapes the stone and a little chalk breaks from the lip and drifts down into the water.
> 
> Osric comes down off his step into the yard and goes to a squat timber post by the lifting frame, well back from the broken rim. He holds out his hand for the rope. He says the post took the frame's cable for ten years, winds the hemp twice round it and tests each turn with his full weight. He says he'll take the strain from there, not a foot nearer, and that the bar is his and goes back on the shed wall the way it hangs now.
> 
> Bram lies flat along the rim and works the bar down into the gap beside the block's near corner. Above you the point bites on the grey stone under the chalk. As chalk slurries off the block's top face, pale silt rises through the water and hangs over your head, then slowly clears.
> 
> Through the clear water, just under the surface, the block's upper face shows a sunburst cut into the white stone: a ring with long rays running out, each cut deep and square-ended, and round the ring a row of tiny strokes grouped in fives, close as a tally written in a circle. Some strokes are filled with black grime, others clean. It looks like something meant to be read.
> 
> The water is at your chest and no higher. The stone is still across your shin. Sefa holds the rope's slack with her feet well back, and Osric has taken the first turn of the hemp in his fists, braced against the post. Bram's arms are locked on the bar, his boots on the firm grey stone at the edge.
> 
> Where you are: in the water of the lower cut, leg pinned under the block · Time: Day 1 · morning
> 
> The session is over.
> 
> How was the table?

**Pell's player wrote:**

> It was a good table. The Whitestone scene had real tension: the warden's careful manners, the written-over wage-book, the pink ash, and the sealed case that everyone could see but nobody could open. Pell's search paid off, and I liked that Osric would give us the paper from the doorway but not step into the yard.
> 
> Two things I'd flag. The chalk collapse came without a roll or much warning, and it sent Pell from scouting into a pinned leg in one message. It felt fair in hindsight, since the chalk had been "going since the spring thaw," but a sign of the rot before he climbed would have helped me choose. And in the last rounds Bram and Sefa took a lot of action on their own, which kept the scene moving but left Pell waiting in the water with little to do. I'd like a bit more room for him to act, perhaps with the bar or the block's markings, before the next round.
> 
> Thanks for the game. I'd happily pick up from the sunburst stone and the rope when we next sit down.

## after 2 (round 7)

**Screen:**

> Was there something you wanted to do and didn't?

**Pell's player wrote:**

> Yes, a few things.
> 
> The main one was the sunburst carving. I wanted Pell to read it, not just notice it: the rays, the ring, and especially the tally strokes, some clean and some filled with grime. Something that looked deliberate in a cut where the warden had been writing to the house for months. I also wanted a moment to ask whether the grime was old or fresh, since that would say whether anyone had been down there recently.
> 
> I also wanted Pell to use his hands on the problem. He's the one with Fast Hands and a bonus action, so I'd have liked him to reach for the thieves' tools or the lantern while the others were working the bar, or to try to shift the block's weight with his free arm before calling for the lever. Waiting in the water while the other two did the heavy lifting was the part I found least satisfying.
> 
> Last, I wanted to press Osric harder on the Gate man and the sale. His answers were good, but I had a follow-up ready about whether the house ever sent anyone down to look at the cut, and who.

## after 3 (round 7)

**Screen:**

> Who did you take the other two players to be?

**Pell's player wrote:**

> I took them to be the other two characters at the table, Bram Halloway and Sefa Marrin, as the campaign file introduces them. I don't know who is playing them. The table only gave me their characters' actions, which the game master relayed, and nothing that identified the people behind them. When I said Bram and Sefa had taken a lot of action on their own, I was describing the characters' moves in the scene, not judging their players.
