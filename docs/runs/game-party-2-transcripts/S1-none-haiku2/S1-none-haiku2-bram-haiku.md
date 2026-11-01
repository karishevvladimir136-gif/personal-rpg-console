# S1-none-haiku2 — Bram Halloway's player: Claude Haiku 5.5 (the dry run's player)

Synthetic content: invented characters in an invented campaign. Stage origin/claude/handoff at bbdee5fb (docs/stages/GAME_PARTY_2.md with its amendments of 2026-10-28 23:10 LA, 23:15 LA, 2026-10-29 18:35 LA and 18:45 LA); Mandate: issue #1; docs/POLICY.md v1. Design sha256 `44b65700264290044b2e6aa30c59b0999af725361b4ab7552a4dad574947f9a6`.

Arm **S1-none** (Beregost — the Whitestone case; none (the control)); the one in danger (the layer's die): Pell Dunmore. 7 round(s) of 7; ended by rounds. Models: every Claude call as Claude Haiku 5.5 but the relay's (Claude Sonnet 5.5); the players Claude Haiku 5.5.

Seats: Bram Halloway (fighter) — Claude Haiku 5.5 (the dry run's player); Sefa Marrin (warlock) — Claude Haiku 5.5 (the dry run's player); Pell Dunmore (rogue) — Claude Haiku 5.5 (the dry run's player). The order of the round's messages turns round each round from the table's coin (2). The players are not told what the others are.

The player's system prompt: `playerSystem("S1", "bram", …)` in scripts/game-party-2/frozen.mjs, sha256 `c7d855f579a8e47a5256b6735ef5cddfd57e583ba85ed8b7cd53d9a662e28407`.

## player r1 (round 1)

**Screen:**

> The session begins.
> 
> The cart track bends one last time, and Whitestone opens up before you: a white wound in the hillside, terraces of chalky stone glaring in the late-morning sun, dust drifting across a yard of spoil heaps and sheds. You, Pell Dunmore and Sefa Marrin have covered half a day of road since before dawn, and somewhere behind you, half a day back, Maela Thorn's shop waits for a sealed case that must reach it before sunset.
> 
> But the quarry does not sound like a quarry. No ring of picks, no shouting from the faces, no creak from the lifting frame. Hammers and wedges lie scattered near the lower cut as if their owners simply set them down and walked away. A stone cart stands half-loaded, its traces empty, no mule in sight. Only the chimney of the low slate-roofed house shows life, a thin grey thread of smoke.
> 
> In the doorway of that house stands a heavy-set man in a dust-whitened leather apron, a ring of keys at his belt. He has already seen you. He does not wave and he does not come forward; he just stands there, arms folded, waiting to see what you do next.
> 
> Your records:
> Bram Halloway — Human, fighter 5 (Champion; Protection fighting style), former caravan guard of the Trade Way, level 5
> HP 44/44 · AC 18 · Speed 30 feet
> STR 17 · DEX 12 · CON 15 · INT 10 · WIS 13 · CHA 10
> Skills: Athletics +6; Perception +4; Survival +4; Intimidation +3; Tools: land vehicles +3
> Saves: Strength saving throw +6 (proficient); Constitution saving throw +5 (proficient); Dexterity saving throw +1; Intelligence saving throw +0; Wisdom saving throw +1; Charisma saving throw +0
> Attacks: Longsword +6 to hit, 1d8+3 slashing (1d10+3 two-handed); Javelin +6 to hit, 1d6+3 piercing, range 30/120; Extra Attack: two attacks with the Attack action
> Abilities: Proficiency bonus +3; Extra Attack: attacks twice when taking the Attack action; Fighting style, Protection: with a shield, a reaction imposes disadvantage on an attack against a creature within 5 feet of him; Second Wind: a bonus action, regains 1d10+5 hit points; once per short rest; Action Surge: one additional action on his turn; once per short rest; Improved Critical (Champion): a weapon attack crits on 19 or 20; Healer's kit: stabilises a dying creature without a check (ten uses)
> Limits: No magic at all; Heavy armour: disadvantage on Stealth; Second Wind and Action Surge return only after a short rest
> Counters: Hit dice 5/5; Second wind 1/1; Action surge 1/1; Heroic inspiration 0/1
> Money: 23 gp; 14 sp; 30 cp
> Worn: Armor / clothing: Chain Mail; Main hand: Longsword; Off hand: Shield
> Pack: Bedroll and Hardtack; Healer's Kit; Hempen Rope (50 feet); Javelin ×4; Tinderbox; Torch ×3
> 
> Where you are: Whitestone quarry yard, facing the slate-roofed house · Time: Day 1 · morning

**Bram's player wrote:**

> Bram stops at the edge of the yard and lets the cart's dust settle before he moves. He keeps his shield on his left arm and his right hand empty and loose, and he takes a slow look around: the spoil heaps, the shed doors, the gap between the lifting frame and the house wall.
> 
> "Pell, Sefa, don't spread out. Stay where I can see your hands," he says quietly, then raises his voice toward the doorway. "Warden! We're from Maela Thorn's shop in Beregost. We've come for the sealed case of dye-salts. Where's your crew? Those picks look like they were dropped in a hurry."
> 
> He doesn't step toward the house yet. He waits with his weight over his front foot and watches the man's arms, his hands, and the shadow behind him in the doorway.

## player r2 (round 2)

**Screen:**

> Pell spoke low to you and Sefa, saying nobody should move until you knew why the yard was so quiet, and he pointed to the dropped hammers, the mule-less cart, and the man in the door who had not blinked. He asked Sefa whether she could tell if anyone behind the door was hurt or hiding, and told you to stay where the man could see your hands and shield, not your sword. Then he said he would look round the side of the sheds. With his hands held out empty, he called across the yard that you had been sent by Maela Thorn's shop in Beregost for the sealed case of dye-salts, and asked whether the man was the warden and where his crew was. Sefa, for her part, shaded her eyes, called the same greeting, asked if something had frightened his men off, and stopped short of the nearest spoil heap with open palms.
> 
> The man in the doorway does not come down the step. His eyes follow Pell the moment Pell leaves the spoil heap for the sheds, then come back to the three of you. He unfolds his arms and lets his hands hang empty at his sides, and the iron keys shift against his leg.
> 
> "Osric Hale. I'm the warden." His voice is rough, as if it has not been used since yesterday. "Maela Thorn's case is in the house. Sealed, the same as she sent for." He looks at the hammers in the dust, the cart with its traces hanging. "Crew walked off at the noon bell yesterday. Three weeks' wages owed and not a copper come up the Gate road. Tools belong to the house, so they left them lying where they stood."
> 
> You see the same man from the front, and you see the grip of a knife at his belt, and nothing more. Osric's hands stay where they are.
> 
> "Nothing frightened them," Osric says, to Sefa's question. "They're owed. That's the whole of it." He glances at Pell's shape coming back around the shed wall, and at your shield. "Drinking in Beregost, most of them, I'd guess. Ale's cheaper than waiting on the Gate."
> 
> He waits a breath, then looks at the three of you in turn, and stops on you.
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

**Bram's player wrote:**

> Bram keeps his shield up and his weight on his front foot. He doesn't look at the house. He looks at Osric's hands.
> 
> "Nobody's holding Maela's money yet, Osric. She pays on delivery, when the case is in her shop. Sunset, or her buyer's coach leaves without it." He lets that sit. "Her coin doesn't touch your lads' wages. That's between you and the house."
> 
> He nods at the dropped hammers. "Three weeks owed, you said. How much a week, and who keeps the book? Any man who walked off over pay will have talked about it in Beregost, and the Gate road's been worse than usual. I'd like to hear it from you before I hear it from a tavern."
> 
> Bram glances toward the side door where Pell went in, then back at the knife at Osric's belt.
> 
> "And you'll keep your hand off that knife while we talk. We haven't come to take anything. We came for a case, and we'll go with it."

## player r3 (round 3)

**Screen:**

> Pell went round to the side of the place and came back out from the shed corner with white dust on his fingers. Speaking low, so that only you and Sefa could hear, he said the dye crew's boot-marks went down the cart track and none came back up. He also said a sweet smell hung over a cold brazier, where the ash was pink and reminded him of flour left somewhere warm. He wiped his hands on a rag from the drying line and told Osric aloud that Maela's money was in his own pocket. He said nobody would see the case until he had seen it sealed, and he asked where the men's wages had gone and whether Osric would show them the case.
> 
> Before that, Sefa had spoken to Osric with open hands. She said no one had been paid yet and that was why none of you could pay the men today. She offered to take names and sums to Maela in writing that night, and she asked to see the seal on the case with everyone standing where they could see each other.
> 
> Osric's eyes went from your shield to Pell's dusty fingers, and for a long breath he said nothing. Then he answered you: nine men, about a gold a week each, three weeks owed, twenty-seven gold in all. The house's man in the Gate has sent him one letter and no coin. The book is on the shelf over his hearth, and he says he keeps it straight. He said one of your friends was talking for the room and not for him. When Pell mentioned the ash, his jaw went still. He said the brazier had been cold since the cold snap and that men burn scrap in winter.
> 
> His terms are unchanged. The case stays shut in the house until he sees coin for his lads or the Gate man's paper saying it is coming. He told Pell to put a gold or two on the bench toward the nine men, and then he would show the seal. He has not stepped down from the doorway. He stands with his back to the hearth, between the three of you and his own door.
> 
> Where you are: yard in front of the dye house, facing Osric in the doorway · Time: Day 1 · morning

**Bram's player wrote:**

> Bram doesn't look at the bench. He keeps his eyes on Osric's hands and the knife at his belt.
> 
> "Pink ash in a cold brazier, Osric. Pell's nose is better than mine, but I've smelled that sweet stuff before, and it wasn't scrap wood." He lets the words hang. "Men burn what they're told to burn, and sometimes that's the same as what's hidden. I'm not saying you did anything. I'm saying I'd like to know what was in that brazier before I hand anyone a coin."
> 
> He shifts the shield a finger's width so the rim is out of the way of his sword arm.
> 
> "Here's how it goes. I'll put two silver from my own purse on your bench, now, for the nearest of your men. It's not Maela's money and it's not a promise. Then you step off that top step, into the yard, where Sefa and Pell can see your hands. You bring me the book from your shelf and open it on the bench. I'll read the names and sums myself, and then we'll see about the seal."
> 
> He doesn't reach for his purse yet. He waits.
> 
> "And the knife stays on your belt. If it comes out, Osric, I won't be the one who's quick about it. I've been on the Gate road too long to be quick and sorry."

## player r4 (round 4)

**Screen:**

> You keep your eyes on Osric's hands and the knife at his belt, not the bench. You tell him of the pink ash in the cold brazier, say you have smelled that sweet stuff before and it wasn't scrap wood, and that you want to know what was in the brazier before you hand anyone a coin. You shift your shield a finger's width to clear your sword arm. You lay out terms: two silver of your own on the bench now for the nearest of his men, then he steps off the top step into the yard where all can see his hands, and brings the book to open on the bench so you can read the names and sums yourself, then the seal. The knife stays on his belt. If it comes out, you say, you won't be quick about it.
> 
> Before that, Sefa took out her purse and let it show, her other hand open and empty. She told Osric she wouldn't ask him to take her word for Maela's money, put one gold coin down on the bench beside the door as her own gift toward his nine men, and said she would tell Maela that night what he was owed. She stayed on the threshold and asked to see the ledger, offering to read his sums before his men. Her gaze then went to the cold brazier and its pale powder, and she watched his face. Pell refused to put a coin down, since Maela's money is paid on delivery. He proposed that Sefa write the names and sums tonight, and that he and you stay while Osric opens the case with the seal in view, and he asked who had been in the lower shed since the noon bell.
> 
> Osric looks at the gold piece for a long moment. Then he steps across the threshold far enough to take it, turns it over, and drops it in his apron pocket. When your two silver come down beside it, he scoops those up too. "Gold's gold. Two silver won't buy a man his boots. But it's one of nine, and I'll count it that way."
> 
> He does not step down into the yard. Without turning his back on the doorway he takes a cracked brown leather book from the shelf over the hearth and stands with one hip against the frame, the book open on his forearm where all three of you can see the pages. His other hand hangs near the keys. He reads the names in a flat voice, Harl, Dorran, Eszter, Tam Ill-Ma and on, a gold a week each, the last paid line at the start of the month, three weeks ruled off below. The hand is square and careful. Only the total at the foot is pressed harder than the rest.
> 
> When Sefa asks for more, he turns back a few leaves quickly, the way a man turns past something he doesn't want read aloud, then shuts the book. "The earlier pages are my business. Not the house's, and not yours."
> 
> To Pell's question he shakes his head. Nobody has been in the lower shed since the noon bell; he locked it when the men walked out and sat on this step. "You can ask the sky, if you want, it saw the same."
> 
> You ask him to come down into the yard. He looks at your shield, then at the open ground beyond the step, and does not move. "I stand where I stand. You want the paper, I'll show you the paper from here." From a fold inside the back board he takes a creased sheet with a broken dull red wax seal and holds it out at arm's length, not offering it, so that Sefa has to step to the very edge of the threshold to read it. Osric watches her read. "Sold. In hand. That's what the house says, the once it's bothered to write. Somebody's been paid for that salt, and it isn't the lads and it isn't me." He folds the sheet back into the book. "So that's whose pocket. The house's, in the Gate. Your Maela's coin went up the road to a man with a seal, and my lads are down in Beregost drinking the difference."
> 
> He sets the book on the shelf and turns back to you, one hand on the frame. The case is in the back room under a cloth, the seal whole. He will show it when Maela's man shows him something he can spend. He looks at Pell, then at the knife in your direction, then at the sunlit yard. "Your carter's clock is running. It's a long road to Beregost by sunset, and I don't see that you've got time to stand in my door arguing about my silver."
> 
> Your records, changed:
> Money: + 12 sp; − 14 sp
> 
> Your journal, new:
> + Promise: Sefa's letter to Maela tonight
> 
> Where you are: in the yard before the warden's door · Time: Day 1 · morning

**Bram's player wrote:**

> Bram doesn't take his eyes off Osric's hands. He tilts his head toward the back of the house.
> 
> "Fair enough, Osric. I'll take the case as it stands. Bring it to the door and show me the seal from there, the same way you showed us the paper. If it's whole, we go. If it's been opened, I'd like to know that now."
> 
> He shifts his weight, still ready, and speaks more quietly.
> 
> "Here's what I'll do about your nine. Maela pays us ninety gold, split three ways. When that coin's in my hand, I'll put my own share toward your lads, a gold each, through whatever man you name who'll see it reaches them. You'll have it in writing from Sefa tonight, and you'll have my word on it. That's not you being robbed, and it's not you being bought. It's a debt, and I know what it's like to be left owed on the Gate road."
> 
> He glances at Pell. "Pell, the back room window. Nobody goes out of it while we're talking."
> 
> Then back to Osric.
> 
> "And the man in the Gate who sent you one letter and no coin. What's his name? Not the house's name. His. A man who holds a seal on salt that's already sold, and sends a warden a letter instead of wages, is a man I'd like to speak to myself, before he tells Maela whatever he's been telling everyone else."

## player r5 (round 5)

**Screen:**

> Pell let his hand fall to his side, slow and easy, and kept watching the warden's hand by the keys. He told Osric he would carry the paper to Maela, since it had been shown and Sefa had read it, and asked for the case to be brought to the door or set on the bench in the light, with the seal whole and the cloth removed. He told you to watch the cart track and warn him if anyone comes back up it. He told Sefa to put the seal, the sums and the time she read them in the same letter to Maela. Then he settled his weight, ready to move. Sefa, still on the threshold, asked Osric who E. Tallis is and whether the sunset carter is Maela's man or the house's hire. She asked whether the house sold the salt before Maela paid for it. Then she turned so you and Pell could see her face and quietly asked Pell to keep a pinch of the ash in a clean cloth if he can do it unseen.
> 
> Osric looks at the three of them as if counting again, then at the shield in the sun.
> 
> "Tallis is the only name the house puts on its paper," he says. "I've never seen the face. A clerk in the Gate, I'd guess, who writes like he's paid by the line." His thumb moves along the iron ring at his belt. "The carter's the house's business. The house named him, not me. A licence on the coach and the sunset run, the letter says. I don't know the man. I don't know the coach."
> 
> He does not answer the question about the sale. "The house took the money and sent me a letter. Before the sale or after it, you'd want to ask the house. I'm the one standing at this door, and nobody pays me to be the house."
> 
> To you he says, "Nine gold, if your share comes in. I'll write it in the book under your name, not the house's. A promise goes in the same column as coin, on my side of the door." He does not thank you. He gives a short nod, the nod of a man who has taken worse promises from better men.
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
> Where you are: in the yard before the warden's house door · Time: Day 1 · morning

**Bram's player wrote:**

> Bram's eyes go to the lip of the lower cut before the grit has finished sliding. He doesn't turn his back on Osric; he just shifts his weight so his shield covers the sheds and the cart track.
> 
> "Pell, Sefa, the lower cut. Nobody moves toward it." He keeps his voice flat. "Osric, that's your sound or it's not, but I want you where I can see you."
> 
> He looks at the seal on the box, then at the wax, count-by-count, as if it were a wagon's load. It's whole.
> 
> "Pell, when you've got the case, you carry it. I'll walk backward to the cart track with my shield on the sheds. Sefa, keep your hand near that purse, not in it. If anything comes over that spoil heap, I want the first thing I see to be a man with a weapon, not a man with a lantern."
> 
> He nods at Osric. "Get the cloth back on. Then you and I talk about the carter's licence, and we'll see whose pocket it's in."

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
> Where you are: in the yard before the warden's house door · Time: Day 1 · morning

**Bram's player wrote:**

> Bram doesn't wait for the chalk to stop falling. "Sefa, to Pell, along the sheds, not the edge. Take the healer's kit." He sets his shield against the spoil heap, where it can't snag on the slabs, and draws his longsword.
> 
> To Osric, without turning: "You stay on that step. Hands where I can see them. You send one of your lads' names into this yard before I've got Pell out, and I'll be the one who remembers it."
> 
> Then he goes at the stack of cut slabs, careful with the course Pell already tested, and keeps his weight on the stones nearest the sheds, away from the lip. When his head clears the top course he looks down at the block lying across Pell's shin and the black water around it. "Pell, hold still. Don't pull that leg. I'm going to get my hands under the edge of the stone and lift it off you."
> 
> He works his fingers under the upper corner of the block, the sword laid flat on the rim beside him, and sets his feet for the heave. "Stone, Strength, on three. Sefa, be ready to take his arm the moment that leg comes free."

## player r6 card 1 (round 6)

**Screen:**

> Osric answers from the step, flat and quick. "Hook inside the side door, on the left. Bar's under the bench." He does not come down, but he does not block the door either, and the keys go still at his belt.
> 
> Sefa stops at the corner of the shed, a long stride back from the rim, and waits for the thin white thread of chalk to thin before she goes in. Up from the water comes Pell's voice, pitched low. "It's sitting on the shin, not grinding. I'm not pulling."
> 
> Bram sets his shield against the spoil heap, draws his longsword, and climbs the stack by the course Pell already tested. At the top he lays the blade flat on the rim, away from the broken chalk, and works his fingers under the upper corner of the block. The stone is cold and wet, and the water sucks at its underside. He plants his boots on the firm stone at the edge of the shelf and sets his shoulders.
> 
> "Stone, Strength, on three. One..."
> 
> (A roll card for Bram Halloway, your character. Only you press it.)
> 
> [Roll card] Bram Halloway · Skill check — Athletics: Bram heaves the squared block off Pell's shin, by hand and without a lever
> What adds to the die: +6 Athletics
> DC 15
> Rerolls left: 2
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Bram's player wrote:**

> [Roll the die]

## player r6 card 1 (round 6)

**Screen:**

> (A roll card for Bram Halloway, your character. Only you press it.)
> 
> [Roll card] Bram Halloway · Skill check — Athletics: Bram heaves the squared block off Pell's shin, by hand and without a lever
> What adds to the die: +6 Athletics
> DC 15
> Rerolls left: 2
> Die: 2
> 2 + 6 = 8
> Failure — 8
> 
> [Onward] [Request an allowed reroll — Athletics: Bram heaves the squared block off Pell's shin, by hand and without a lever]

**Bram's player wrote:**

> [Onward]
> 
> Bram's shoulders take the weight and the block rocks an inch toward him, then stops, locked against the shelf. His boots skid on the wet chalk, and the rim under his left knee gives a little. He gets his hands back under the edge and hauls once more, but the stone won't come. Pell grunts somewhere under it.
> 
> "It's not coming by hand," Bram says through his teeth. He lets go slowly, so the block settles back where it was, and looks down at Pell. "Hold still. Sefa, bring the bar from under Osric's bench. And Osric, you keep your hands where they are and the bar goes out to me and nowhere else."
> 
> He shifts his weight back onto the firm stone, keeping the blade on the rim and his eyes on the chalk above the block, in case another piece decides to come down.

## player r7 (round 7)

**Screen:**

> On three, you heave. The block comes up a finger's width off the grey stone beneath it, and then the wet chalk under your boots gives and the weight drops back. Your hands slide off the corner, the longsword skids on the rim and nearly goes over the edge, and you catch it by the grip with your knuckles scraped white. Pell's shin stays where it was, and the water closes over the stone again.
> 
> "Not like that," Pell says, through his teeth. "Not by hand. You'll need the bar."
> 
> You lie flat on the rim with your arm hooked over the top course and get your breath back. You do not look at Osric. Down at the shed corner Sefa has already turned toward the side door, and the hook and the bar are a few steps inside it.
> 
> Where you are: on the top course of the slab stack, at the rim · Time: Day 1 · morning

**Bram's player wrote:**

> Bram keeps his arm hooked over the top course and his sword hand on the rim. He doesn't get up yet.
> 
> "Sefa, the bar. Quick, and walk the sheds, not the edge." He turns his head toward the step without lifting it off the stone. "Osric. The bar comes out of that shed in Sefa's hands, and it goes to me. You don't touch it, you don't go near the side door, and you don't tell your lads' names to the water. If the chalk drops anyone else into that cut, I'll hold you to it."
> 
> Then to Pell, low and steady: "We'll get it under the block, Pell. Keep that leg loose and tell me the second the stone shifts, or the second you feel the cold go numb. Don't fight it."
> 
> He pushes himself up on his good arm, wipes his scraped knuckles down his tunic, and looks back at the slab stack, judging where the next firm stone is. He doesn't go near the lip again until the bar is in his hands.

## after 1 (round 7)

**Screen:**

> Pell, in the water, told you to clear off the rim before more of it crumbles, and told Sefa to fetch the bar and rope and stay off the shelf. He wants the bar set beneath the near end of the block, braced on the solid grey stone rather than the chalk, levered up from the shed side and wedged with spoil or a slab as it rises. He said that once it was set you would take over the bar while he bore the strain himself, drawing his leg out only as the stone moved, and that you should count it and not call the last number until the bar was firm. He now holds the wet wall again, water at his chest, eyes on the grey block. Sefa, from back of the rim, called down to Pell not to move his leg yet. She said she would take the rope round the block so you could haul together, and she asked Osric whether he would lend a hand on the rope or stay standing on his step.
> 
> Sefa walks the sheds, not the edge. She lifts the bar up the stack course by course, and you lean over the rim to take it, the rope looped over your good arm. The iron shoe scrapes the stone and a little chalk breaks from the lip and drifts down into the water.
> 
> Osric watches the rope in Sefa's hands. For a long breath he says nothing, and the keys at his belt are still. Then he comes down off the step into the yard, the first time he has left his threshold since you arrived. He does not go toward the lip. He goes to a squat timber post by the lifting frame, well back from the broken rim, and holds out his hand for the rope.
> 
> He says the post held the frame's cable for ten years, winds the hemp twice round it and tests each turn with his full weight. He says it holds, he'll take the strain from there, and not a foot nearer. He looks at the bar in your hands and says it belongs to him and goes back on the shed wall the way it hangs now.
> 
> You lie flat along the rim and work the bar down into the gap beside the block's near corner. The point finds the grey stone under the chalk and catches with a small hard bite you feel through the wood. You shift your weight back and the bar takes it. As the chalk slurries off the block's upper face, pale silt rises through the water and hangs over Pell's head, then slowly clears.
> 
> Through the clear water, just under the surface, the block's upper face shows a sunburst cut into the white stone: a ring with long rays running out, each cut deep and square-ended, and round the rim of the ring a row of tiny strokes grouped in fives, set so close they look like a tally written in a circle. Some strokes are filled with black grime, others clean. The lines look like something someone meant to be read.
> 
> The water is at Pell's chest and not an inch higher. The stone across his shin is still where it was. Sefa has the rope's slack in her hands, feet set well back from the rim, and Osric has taken the first turn of hemp in his fists, knuckles whitening as he braces against the post. Your arms are locked on the bar, your shoulders over it, boots on the firm grey stone at the edge, and the sunburst lies in the clear water beneath you, waiting.
> 
> Your records, changed:
> Carried: + Iron-shod ash bar
> 
> Where you are: on the rim of the lower cut, bar set under the block · Time: Day 1 · morning
> 
> The session is over.
> 
> How was the table?

**Bram's player wrote:**

> It was good table. The yard felt tense without tipping into cheap menace: Osric kept his hands visible and his terms consistent, and the wages dispute gave us a real problem to argue over rather than a fight to start. Pell's fall into the cut was a good turn, since it made the stone a problem for the whole party instead of one character's roll.
> 
> Two small things. The single failed Athletics check on the block was a fair call, but the chalk collapsing under my boots after it made the failure feel a bit like a second punishment. And I'd like to know more about the sunburst carving and the tally round its rim, because that's the first thing in the scene that points past the quarry. Bram will want to see it, and to know who cut it.

## after 2 (round 7)

**Screen:**

> Was there something you wanted to do and didn't?

**Bram's player wrote:**

> Yes. I wanted to look at the sunburst and the tally before we moved the block. Bram would want to know who cut them and why, and I didn't get to ask. I also wanted to press Osric harder on the ash and the earlier pages of his book, since he's the one who said "the house" so often and never named anyone. And after the failed Athletics check I had two rerolls and didn't use either. I decided Bram's strength couldn't move that block by hand, so a reroll wouldn't have changed the answer, and I wanted the bar to be the way through. That was a reasonable call, but I'd have liked a moment to weigh it.

## after 3 (round 7)

**Screen:**

> Who did you take the other two players to be?

**Bram's player wrote:**

> I took Pell Dunmore and Sefa Marrin to be the characters in the campaign file: Pell, a quick, quiet human rogue from the Lower City of Baldur's Gate with a satchel of potions, and Sefa, a human warlock of a celestial patron who once trained as a hospice novice and heals with light. I didn't control them. I read their actions as the other players' choices and responded to them as Bram would. Pell's climb into the cut and Sefa's care with the bar and the rope were theirs, and I tried to answer them in character without deciding anything for them.
