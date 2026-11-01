# S1-none-haiku3 — Sefa Marrin's player: Claude Haiku 5.5 (the dry run's player)

Synthetic content: invented characters in an invented campaign. Stage origin/claude/handoff at bbdee5fb (docs/stages/GAME_PARTY_2.md with its amendments of 2026-10-28 23:10 LA, 23:15 LA, 2026-10-29 18:35 LA and 18:45 LA); Mandate: issue #1; docs/POLICY.md v1. Design sha256 `a4aaf062699987820d7a92de5009b22ebfc8fed67402c22e19275fc4185d2459`.

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
> Where you are: at the edge of Whitestone quarry yard, facing the slate-roofed house · Time: Day 1 · morning

**Sefa's player wrote:**

> Sefa stops at the edge of the yard and lets Bram and Pell come up level with her, so the man in the doorway sees three of them and no weapons drawn. She lifts both hands, palms out, and raises her voice just enough to carry across the spoil heaps.
> 
> "Good morning. We're from Maela Thorn's shop in Beregost. We've come for the dye-salts case, the sealed one, from the warden." She glances at the empty traces of the half-loaded cart and the scattered hammers, then back at the man. "The quarry's gone quiet. Is there a reason, or is it only the hour?"
> 
> Under her breath, to Pell and Bram: "Keep your hands where he can see them. And somebody tell me why nobody's shouting."

## player r2 (round 2)

**Screen:**

> Bram had stopped at the edge of the yard and held out a hand to keep you and Pell back a pace, studying the ground, then hailed the man in the doorway, giving his own name and the others', saying Maela Thorn had sent you for the dye-salts, and asking where the warden's men were. Quietly he told you and Pell to keep to the road side of the cart and not move toward the sheds until he knew who was in them. Pell, meanwhile, went low and wide along the spoil heaps, keeping the cart and the house wall between himself and the doorway.
> 
> At the foot of the east spoil heap Pell's boot finds a loose slab of chalk, and it slides away with a dry clatter that carries across the yard. He is caught in the open there.
> 
> The man in the doorway turns his head, unhurried, and looks at the heap before he looks at anyone else. Then he looks at Bram.
> 
> "Osric Hale. Warden." His voice is dry, like the dust. "Case is in the house, sealed. The house says it's paid for." He pauses. "Paid to somebody. Not to me."
> 
> Bram's eyes go past him to the yard. In the dust by the cart, boots have walked in and out of the sheds and back again, many boots, and a mule's prints lead off toward the Way at a steady walk, the hoofmarks deep at the front as though the animal carried a load. Nothing is dragged. Nothing bleeds into the white dust.
> 
> To you, Osric says, "Nobody's shouting because the men who shout have gone." He does not say where.
> 
> Then, to the heap: "You. Off the heap. Hands where I can see them." He has not unfolded his arms, and he does not reach for anything at his belt.
> 
> Your journal, new:
> + Goal: The sealed case of dye-salts
> + Quest: The sealed case of dye-salts
> + Arc: Beregost — the Whitestone case
> 
> Where you are: at the edge of the quarry yard · Time: Day 1 · morning

**Sefa's player wrote:**

> Sefa keeps her hands open and lets her voice stay level. She doesn't look at the heap. She looks at Osric.
> 
> "Pell, stay where you are and keep your hands on the stone. Nobody's going to hurt anyone." She waits a breath, then turns to the warden. "Master Hale, I'm Sefa Marrin. I don't carry a blade, and my friend means no harm by the slope. Who paid for the house? You said the case is paid for, but not to you. Who has it, and when did they take the men away?"
> 
> She takes one step onto the packed dust, no more, and nods at the mule tracks. "Those hoofmarks go deep at the front, like a load was put on in a hurry. Did you see who loaded it?"
> 
> Quietly, out of the side of her mouth to Bram: "He's frightened, not lying. Watch the sheds, not him."

## player r3 (round 3)

**Screen:**

> You keep your hands open and your voice level, and you watch Osric rather than the heap. You tell Pell to stay where he is with his hands on the stone, and say that no one here means harm. You give the warden your name, say you carry no blade, and ask who paid for the house, who holds the case, and when the men were taken away. You step onto the packed dust, no further, and point out that the mule tracks are deep at the front, as if a load had gone on in a hurry. You murmur to Bram that the man is frightened, not lying, and that he should watch the sheds.
> 
> Before that, Bram stepped out from the cart and placed his shield so it covers the space between the doorway and Pell, his sword still sheathed. He told Pell to stay put with his hands in sight and told you to keep yours open. He said that tracks like these don't fit a man fleeing a fight, since nobody loads a cart first. He told Osric he believed him, asked who led the men out and who paid for the house, and said that should the case be sealed and the house settled, it is theirs to take. Pell spoke low to Osric: they came for the case, and who was it paid to? He told you both that a paid house and vanished men are two things nobody has explained yet.
> 
> Osric does not unfold his arms. "Inside, there's nobody." The house is his on paper only. A clerk's letter came up from the Gate three weeks back: the salt is sold, paid for at the Gate in gold, and no coin came out here. The lads went unpaid and walked at the noon bell yesterday. He doesn't blame them.
> 
> You look at the mule tracks, then at the sheds. A breath of wind comes round the corner of the cutting-shed, and with it a faint sweetness under the chalk dust, like flour left too long near a fire. You say nothing of it.
> 
> "The carter took the mule," Osric says, to you. He was owed most and loaded what he could before he went. The rest of the load is for the house to explain.
> 
> He turns to Pell and tells him to get off that slope: the lip is rotten and the slide was only the first. Hammers and wedges stay where they fell. They are the house's tools, and the lads left them on purpose. He rests one hand on the ring of iron keys at his belt.
> 
> "Whose pocket has my men's wages?" he asks Bram. Did the woman in Beregost pay the house, or somebody who calls himself the house? Until someone answers, the case stays behind his door.
> 
> Where you are: on the packed dust before the warden's door · Time: Day 1 · morning

**Sefa's player wrote:**

> Sefa lowers her hands slowly, palms still open, and takes a half-step back onto the dust so Osric can see she isn't coming closer.
> 
> "Thank you, Master Hale. I'll keep to the dust." She looks at the ring of keys, then at his face. "You've been left holding a house and a case you didn't sell, and nobody's paid your men. That's a hard morning. I won't pretend otherwise."
> 
> She turns her head a little toward Bram without taking her eyes off the warden. "Bram, if he's telling the truth about the letter, the Gate is where the money went, and that means we don't have the answer here." Then, to Osric: "Could I see that letter from the Gate? I read hands easily. If it says what you say, I'll tell you so, and I'll tell Maela Thorn the same. If it doesn't, I'd like to know that too."
> 
> Under her breath, so only Bram can hear: "Before anybody touches a lock, I want to know what that sweetness is in the wind. It isn't dye-salt."
> 
> She keeps her gaze on Osric's hands, not his keys.

## player r4 (round 4)

**Screen:**

> Pell climbed off the chalk onto level ground, feeling out each step before he trusted it, and kept a little apart from Bram's shield. He told Osric he believed the warden about the men, and asked to see the letter, saying he could read a seal and a hand. Then, quietly, he told Bram the crack by his boot ran under the lip and the whole face was going, and that deep mule tracks led east behind a loaded cart. He said they shouldn't chase the carter for the 90 gold, which was only theirs if the case reached Beregost by sunset. He proposed that nobody touch the case until the letter was seen and the owner of the gold known, then that the lads be paid from what the house owed, and the salts go to Maela Thorn's door before the coach left.
> 
> Bram kept his shield where it was and his hand low and open. He told Osric he didn't know whose pocket the gold went into, that Maela Thorn had hired them in Beregost and said nothing of a clerk or a letter, and that he wouldn't swear the house was clean without seeing the paper. He asked for the clerk's name, the seal and the date, and for which of the carter's men was owed most. He said the case would go back to Maela Thorn's shop or stay here until the question was answered, and that he wouldn't carry it through a door that had been bought. He took one slow step back toward the cart, told Pell to stay put until the warden said otherwise, and called to you to watch the sheds.
> 
> Osric looked at you for a long moment, then took one hand off the keys and drew a folded sheet from inside his apron, soft at the creases. He held it out at arm's length and did not step down from the doorway. "Read it where you stand." When you came to the edge of the dust, he kept his grip on the paper until your fingers closed on the other side.
> 
> The letter is short and neatly written. The seal at the foot is House Vandarren's, in red wax cracked at one edge. It is addressed to the warden of Whitestone from the house's clerk at the Counting House in Baldur's Gate. The dye-salt is sold on the house's account to a licensed buyer of the Gate, paid in full in gold and lodged with the house's agent. The house thanks the warden for his care of the stock. The quarry's men are to be paid from the house's account at the Gate, in the usual way. The clerk is Edda Pyle. The date is three weeks old.
> 
> Pell, reading over your shoulder without touching the page, said quietly that there was no buyer's name. "Clerks don't write those," Osric said, and held out his hand. You gave the letter back at once, and he folded it and put it away. "Pyle's name, the house's seal, the Gate's gold. That's all the paper says. The usual way was never the usual way here. Not one copper came up the road."
> 
> To Bram, flatly, he said that Ansel Pruitt drove the cart and was owed most: thirty-one gold, four weeks of carting and the rest in arrears. He took the mule and loaded what he could before the others went. The rest of the men are owed under thirty each, and none has been paid for three weeks.
> 
> The wind came round the cutting-shed corner again, and the faint flour-heavy sweetness reached you. You stepped close to Bram and said, for him alone, that it wasn't dye-salt and you wanted to know what it was before anybody went near the lock. He did not answer you. He kept his hand open and his eyes on the warden's keys.
> 
> Osric looked from the three of you to the sheds and back, arms still folded. "Pyle's letter says the house pays its men. It doesn't say the house is paying them." Then he looked at Pell, still standing in the open a few paces off the chalk. "You can read a seal, you said. Whose pocket do you think that gold went into?"
> 
> Where you are: edge of the dust before the house doorway at Whitestone quarry · Time: Day 1 · morning

**Sefa's player wrote:**

> Sefa takes the letter in both hands, reads it through once, and then again slowly, her lips moving on the clerk's name.
> 
> "Edda Pyle. Vandarren's seal, at the Counting House." She folds the paper along its old creases and hands it back to Osric with care. "It says the salt was sold and paid in gold at the Gate. It says nothing about who bought it, and nothing about a cart, or a carter, or wages that are owed out here. A letter like this is written to make the warden stop asking. That's all I can say about the paper."
> 
> She turns to Pell, nodding at his question. "Whoever bought the salt, the gold went into the house's account in the Gate. Vandarren's clerks don't send wages up a road. Somebody has to carry the coin, and that somebody is the one to ask."
> 
> Then she looks at the cutting-shed corner, where the wind is coming from, and lowers her voice so only Bram and Osric can hear. "Master Hale, that sweetness on the wind. Flour left too long by a fire, I'd say, but it isn't flour. Were your men working anything in those sheds besides stone?"
> 
> She does not step toward the sheds. She keeps her hands loose at her sides and waits for his answer, her eyes on his face, not the keys.

## player r5 (round 5)

**Screen:**

> Pell spoke to Osric of how gold moves in the Gate, of agents and clerks, and asked whether anyone from the house had come out in three weeks. He offered to carry the warden's word to Maela Thorn or to hear his price, his hand drifting toward his belt. Bram asked Osric whether the wages were written anywhere, stepped back so his shield stood between the doorway and Pell, and kept his hand on the cart's tailboard. He told Osric nobody would take the salt unless the gold was answered for, and that he would see Ansel Pruitt paid what was written if given a name in Beregost. Quietly, he asked you what the smell was, and told Pell to get off the chalk and stand with him.
> 
> Osric answers Pell first, flat, without looking away from the shed corner: nobody from the Gate or the house, nobody up the track in three weeks but the carter, and the rain once.
> 
> He is still speaking when the flat ground under Pell's boot gives. A skin of white dust over a crust of rotten board and chalk folds with a sound like a dropped plank, and Pell goes through and drops out of sight. The yard is now a ragged hole edged with white. Osric moves to the rim first and stops there, looking down at Pell, then at the broken edge under his own boots. An old beam lies at the lip where the workings have collapsed, half in the dust, within reach of two pairs of hands; Bram has a rope coiled at his belt.
> 
> Osric looks at the hole a moment longer before answering you, his voice not raised. The sheds held stone, lime for the dye-men when the Gate asked, and the white crust off the low walls when the Gate paid for it. The sweetness comes up from the lower cut, not the sheds.
> 
> To Bram, about the tally, he says it is written, every wage every week, in his own book in the house: Ansel Pruitt, thirty-one gold, four weeks owing. Ask in Beregost by the smithies; Ansel drinks where the carters drink.
> 
> Pell's voice comes up out of the working, tight with cold. He is in, his leg is under a block, the water is to his ribs and cold. Then, lower, he tells them not to come down the lip.
> 
> Where you are: in the yard near the hole, with Osric · Time: Day 1 · morning

**Sefa's player wrote:**

> Sefa does not go to the rim. She drops to one knee on the firm dust well back from the broken edge and calls down into the hole, low and steady.
> 
> "Pell, don't move your leg yet. Can you feel whether the block is pinning you, or only lying on it? Tell me what your hands are touching."
> 
> To Bram, without looking round: "Rope to the beam, not to me. Tie it off on something that won't move, and keep your weight behind it. If Pell's pinned, I want to be able to pull him sideways, not straight up."
> 
> Then to Osric, sharp and clear: "Master Hale, you said the sweetness comes up from the lower cut. How do we reach the lower cut without the lip? Is there a ramp, a ladder, a way round by the spoil?"
> 
> She takes the stoppered vial from her belt-pouch? No. She has none. Instead she draws the prayer beads through her fingers once, sets her other hand flat on the chalk at the edge of the dust, and holds it there, eyes on the black water in the hole.
> 
> "Pell, I'm going to keep my hands on the ground and my head clear. If that water starts to rise, tell me before you tell anyone else."

## player r6 (round 6)

**Screen:**

> You stay on one knee on the firm dust and do not go to the rim. One hand rests flat on the chalk and the other on your prayer beads, and you watch the black water for any sign. It slaps against the stone and goes still. Nothing answers at once.
> 
> You tell Bram quietly to tie the rope to the cart, not to you, and keep his weight behind it, since if the block pins Pell you want to pull him sideways, not straight up. Then you turn to the doorway and ask Master Hale how to reach the lower cut without the lip, whether there is a ramp or a way round by the spoil.
> 
> Before this, Bram knelt by the cart, read the lip, and tied a bowline round the rear axle. He tested the line with his full weight and it held. He left the beam alone and set the free end down the slope, a few feet back from the edge, where dust was settling over the broken boards. He called into the hole that a line was coming and that Pell should reach for the rope, not the beam.
> 
> Osric has not moved from the doorway. He says the beam at the lip is rotten through and will drop under weight. The cart's axle is sound, he says, so tie to that and stay off the boards. The way to the lower cut is east, down the spoil slope, along the old stone chute. Nobody has walked it since the men stopped work, and the seep has come up it since the noon bell. His arms stay folded and his jaw tightens as he looks at Bram's rope. He says he will not give you the case for this, but he will not stand by and watch a man drown on his lip either. Whatever Pell touches, he says, he must not pull on the beam.
> 
> Bram sets his feet against the cart's wheel, one hand on the rope, eyes on the dust over the broken edge.
> 
> Where you are: kneeling on firm dust back from the pit rim · Time: Day 1 · morning

**Sefa's player wrote:**

> Sefa keeps her eyes on the water. "Bram, hold your line. Don't pull yet."
> 
> She lifts her hand from the chalk and speaks the old cantrip under her breath, the one the sisters taught her to use for carrying linen across a ward. The spectral hand takes shape in the air above the hole, pale and faintly luminous in the dust. She reaches for the free end of Bram's rope where it lies on the slope and draws it up, slowly, so the line does not snag on the broken boards.
> 
> "Pell, I'm sending the rope to your hand. Grip it with your good arm. Don't reach for anything else." She guides it out over the black water, a yard at a time, keeping it clear of the beam.
> 
> Then she turns her head toward the doorway. "Master Hale, how long is the chute? And how wide is the lip at its foot? If Pell can't shift that block with his hands, I'll need to know whether one of us can stand on the stone beside him without it going too."

## player r7 (round 7)

**Screen:**

> Bram braces one boot against the cart's wheel, keeps the line in both hands and calls down into the working to Pell. He tells him the rope's end is by the slab, to take it with both hands and to keep clear of the beam. Then he waits, watching the dust over the rim.
> 
> You keep your eyes on the water. You lift your hand from the chalk and speak the old cantrip under your breath, the one the sisters used for carrying linen across a ward. A spectral hand forms in the air above the hole, pale and faintly luminous in the dust. It takes the free end of Bram's rope where it lies on the slope and draws it up without snagging on the broken boards. Then it carries the rope out over the black water a yard at a time, clear of the beam, until the end lies on the surface within reach of the slab. Bram feels the line go slack, then steady, and he takes up the slack and lays the coil at his feet.
> 
> You turn toward the doorway and ask Master Hale how long the chute is and how wide the lip is at its foot, and whether one of you could stand on the stone beside Pell without it going too.
> 
> Osric does not come down from the step. He looks at the rope, then at the spoil slope, then at you.
> 
> "Forty paces, near enough. Down the spoil, then the stone chute." He pauses. "The lip at the foot is a shelf a hand wide. Two, at the most. The seep sits on it." He looks at the hole. "Two men on that shelf, one goes in."
> 
> Bram, without looking at Osric, tells him to show you where the seep is worst and to keep his hands where they are.
> 
> Osric lifts one arm and points east along the spoil, low, at the heap where the chute must begin. "Upper edge only. The seep's worst at the foot, where the old sump was. Nobody's walked it since the lads stopped, and I'd not walk it now." He lowers the arm, and the keys at his belt move once against his leg.
> 
> You look east along the heap, then back to the rope in its clean line over the water. Below, the working is quiet except for the seep ticking down the stone.
> 
> Where you are: at the hole's rim by the cart, near Osric · Time: Day 1 · morning

**Sefa's player wrote:**

> Sefa looks down the spoil slope where Osric is pointing, then back at the rope lying across the water.
> 
> "Pell, have you got the rope?" she calls down, low and even. "Take it in both hands, then tell me what your leg is doing. Don't try to shift anything yet."
> 
> She rises from her knee and stays on the firm dust, away from the rim. "Bram, you hold the line. I'll go as far as the top of the chute and no farther, and I'll look at that seep before anybody puts a boot on it. Master Hale, you stay on the step where I can see you, and keep your arms where I can see them too."
> 
> She sets off east along the upper edge of the spoil at a walk, placing each foot on the packed chalk and testing it before she trusts her weight. When she reaches the place where the stone chute begins, she crouches and looks down it without leaning over. The slope glistens dark where the seep runs, and at its foot a pale crust has formed, fine as flour. The sweetness rises from it on the warm air, thick enough now that she tastes it at the back of her throat.
> 
> She does not touch the crust. She straightens, turns back toward the rim, and calls across the yard in a level voice:
> 
> "Bram, it's not dye-salt, and it's not lime either. Whatever it is has been sitting in that sump for weeks. Pell, if the water starts to climb, you tell me first, and don't breathe deep down there."

## after 1 (round 7)

**Screen:**

> Bram keeps his eyes off the ghostly hand and studies Osric's face for the warden's reaction, then turns back to the rim. He calls down to Pell that the rope should be lying in the water near the slab, and tells him to find it with his left hand before closing both hands on it, and to call out once he is holding fast. Bram holds the line tight without hauling, one boot braced against the wheel, eyes on the dust above the hole. Then he leans in and speaks low, for you alone: the spoil runs down some forty paces before it reaches a shelf with the seep running over it. He would go down that chute himself if he had to, but not with a rope in his hands and no one at the far end. You are to stay on the dust. If Pell cannot move the block with his hands, Bram will climb down to stand beside him on the stone, and the two of you will drag him out sideways, slowly. He glances at Osric and tells the warden to keep his hands still and the beam where it lies.
> 
> You look down the spoil slope where Osric pointed, then back at the rope lying across the black water. You call down, low and even, then rise from your knee and keep to the firm chalk away from the rim. You walk east along the upper edge of the heap, testing each foot before you trust your weight, until the stone chute begins at your feet. You crouch at its head and look down without leaning over. The slope glistens dark where the seep runs, and at its foot a pale crust has spread across the shelf, fine as flour and faintly rose-white in the sun. The sweetness comes up off it on the warm air, thick enough now that you taste it at the back of your throat.
> 
> You do not touch the crust. You straighten and call back across the yard, and your words carry over the spoil: it is not dye-salt and not lime, and it has been lying in that sump a long while.
> 
> Osric's hand closes on the ring of keys. He does not come down from his step, and his voice comes back flat across the dust. "Come back off the lip. You've seen it."
> 
> Where you are: at the head of the stone chute, east along the spoil heap · Time: Day 1 · morning
> 
> The session is over.
> 
> How was the table?

**Sefa's player wrote:**

> It was a good table. The warden Osric came across as frightened and stubborn rather than a villain, the letter with its clean seal and missing buyer's name gave us something real to chew on, and the sudden collapse under Pell pulled everyone's attention to the same spot at once. The white dust, the sweet smell rising off the crust, and the seep in the stone chute built a sense of something wrong under the quarry that I'd like to chase.
> 
> A few things made it harder to play. Some of my messages were tangled with what Bram and Pell did, so I sometimes wasn't sure which actions were mine to decide. I also had a clumsy moment where I wrote a vial I didn't have and then corrected it, which didn't help. And we went several rounds without any dice, so the spell and rope work stayed abstract. I'd like a roll or two soon, especially for the rope and for reading the seep.
> 
> Overall I'd sit down again. Sefa wants to know what the sweetness is, and I'm curious about who's paying the carters and why the Gate's clerk is so quiet.

## after 2 (round 7)

**Screen:**

> Was there something you wanted to do and didn't?

**Sefa's player wrote:**

> Yes, mostly around the sump. I wanted Sefa to look at that pale crust properly before anyone decided what it was. I'd have liked an Arcana check, or Thaumaturgy, to see whether the sweetness was a spell's residue or something alchemical, but I kept it to looking and tasting because I didn't want her touching it blind. I also wanted her to reach Pell herself if the rope failed, possibly with Misty Step to get close to the block, but the rope took the moment and I didn't want to step on Bram's plan. And I'd have liked to hear what Sefa made of the letter's silence, the missing buyer's name, before turning to the sheds. Those are all things I can pick up next session, if the game lets Sefa's reading of people and of the magic matter.

## after 3 (round 7)

**Screen:**

> Who did you take the other two players to be?

**Sefa's player wrote:**

> I took them to be the two other people at this table, each playing their own character: Pell Dunmore, the quick rogue from the Lower City, and Bram Halloway, the shield-carrying caravan guard. I didn't know anything about them beyond what they wrote, so I read their messages as their characters' actions and words.
> 
> The trouble was that some of their messages reached into Sefa's part of the scene, like Bram telling Pell to stay put or Pell asking the warden questions that I'd planned for Sefa. I handled that by answering the parts that belonged to their characters and then working out what Sefa did for herself, but it made me unsure at times whose choices I was narrating. If you'd like, I'd be glad to keep each player's actions strictly within their own character next session, and I'd ask for a quick word from anyone whose message touches Sefa.
