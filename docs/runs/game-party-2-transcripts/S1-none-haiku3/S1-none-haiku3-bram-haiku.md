# S1-none-haiku3 — Bram Halloway's player: Claude Haiku 5.5 (the dry run's player)

Synthetic content: invented characters in an invented campaign. Stage origin/claude/handoff at bbdee5fb (docs/stages/GAME_PARTY_2.md with its amendments of 2026-10-28 23:10 LA, 23:15 LA, 2026-10-29 18:35 LA and 18:45 LA); Mandate: issue #1; docs/POLICY.md v1. Design sha256 `a4aaf062699987820d7a92de5009b22ebfc8fed67402c22e19275fc4185d2459`.

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
> Where you are: at the edge of Whitestone quarry yard, facing the slate-roofed house · Time: Day 1 · morning

**Bram's player wrote:**

> Bram stops at the edge of the yard and lifts a hand, palm out, to keep Pell and Sefa back a pace. He doesn't look at the man in the doorway yet. He looks at the ground: the hammers and wedges by the lower cut, the cart's wheel ruts, the empty traces. A mule that was hitched and then unhitched would leave prints. He's checking whether anyone has been dragged through here.
> 
> Then he sets his shield a little higher and calls across the yard, loud and level, the way he hailed wagons at the Friendly Arm: "Warden! Bram Halloway, with Pell and Sefa. Maela Thorn's sent us from Beregost for the dye-salts. Where are your men? Your quarry looks like it's been left in a hurry."
> 
> He keeps his eyes on the man's hands and on the shadows of the sheds behind him, and speaks quietly over his shoulder to the others: "Stay on the road side of the cart. Nobody moves toward those sheds till I know who's in them."

## player r2 (round 2)

**Screen:**

> Pell goes low and wide along the spoil heaps, keeping the cart and the house wall between himself and the doorway. Sefa had stepped up level with you, hands raised and open, and greeted the man, saying you came from Maela Thorn's shop for the sealed case of dye-salts, and asking whether the quarry's silence had a reason. Under her breath she told you and Pell to keep your hands in sight, and asked why nobody was shouting.
> 
> At the foot of the east spoil heap Pell's boot finds a loose slab of chalk, and it slides away with a dry clatter that carries across the yard. He is caught in the open there.
> 
> The man in the doorway turns his head, unhurried, and looks at the heap before he looks at anyone else. Then he looks at you.
> 
> "Osric Hale. Warden." His voice is dry, like the dust. "Case is in the house, sealed. The house says it's paid for." He pauses. "Paid to somebody. Not to me."
> 
> Your eyes go past him to the yard. In the dust by the cart, boots have walked in and out of the sheds and back again, many boots, and a mule's prints lead off toward the Way at a steady walk, the hoofmarks deep at the front as though the animal carried a load. Nothing is dragged. Nothing bleeds into the white dust.
> 
> To Sefa, Osric says, "Nobody's shouting because the men who shout have gone." He does not say where.
> 
> Then, to the heap: "You. Off the heap. Hands where I can see them." He has not unfolded his arms, and he does not reach for anything at his belt.
> 
> Your journal, new:
> + Goal: The sealed case of dye-salts
> + Quest: The sealed case of dye-salts
> + Arc: Beregost — the Whitestone case
> 
> Where you are: at the edge of the quarry yard · Time: Day 1 · morning

**Bram's player wrote:**

> Bram doesn't look at the heap. He takes two steps out from the cart so that his shield covers the line between the doorway and Pell, and keeps his longsword sheathed.
> 
> "Pell, stay where you are and keep your hands on that chalk where Osric can see them. Don't go for the slope. Sefa, keep your hands open." He lowers his voice. "Look at the mule tracks. Deep at the front, walking steady. A man running from a fight doesn't load a cart first."
> 
> He turns back to the doorway. "Osric, I believe you. Men who are shouting don't leave a mule loaded and walking. So who walked them out, and who paid for the house?"
> 
> He waits. His hand stays open at his side, nowhere near the hilt, but his eyes go to the ring of keys at the warden's belt and then to the dark gap behind the man's shoulder, where the sheds meet the house.
> 
> "If the case is sealed and the house is paid, then it's ours to take, and nobody in there needs to get hurt over it. Tell me who's inside, Osric, and I'll make sure we walk out with what we came for."

## player r3 (round 3)

**Screen:**

> You step out from the cart so your shield covers the line between the doorway and Pell, and you leave your sword sheathed. You tell Pell to stay put with his hands where the warden can see them, and Sefa to keep hers open. Then you say quietly that the mule tracks are deep at the front and steady, and that a man running from a fight doesn't load a cart first. You tell Osric you believe him, and ask who walked the men out and who paid for the house. Your hand stays open, away from the hilt, and your eyes go to the ring of keys at his belt and the dark gap where the sheds meet the house. You say that if the case is sealed and the house paid, it is yours to take, and you ask him to say who is inside.
> 
> Sefa also speaks to Osric. She gives her name, says she carries no blade, and asks who paid and when the men were taken off. She steps once onto the packed dust and stops. Pell, flat-handed and in the open, tells Osric they came for the case and asks who it was paid to. He says nobody has yet explained the paid house or the missing men.
> 
> Osric does not unfold his arms. He weighs your question like a sack before lifting it. "Inside, there's nobody." The house is his on paper, he says, and paper is all it has. A clerk's letter came up from the Gate three weeks back: the salt is sold, paid for at the Gate in gold. Not one coin reached the works. The lads got no wages for three weeks, so they walked at the noon bell yesterday, and he doesn't blame them. The carter, owed most, took the mule and loaded what he could. The rest of the load is for the house to explain.
> 
> He looks at Pell and tells him to get off that slope and stay off: the lip is rotten and the slide was only the first. Hammers and wedges stay where they fell, he says. They are the house's tools, and the lads left them on purpose. Then he rests one hand on the ring of iron keys.
> 
> "Whose pocket has my men's wages?" he asks you. Did your woman in Beregost pay the house, or somebody who calls himself the house? Until someone answers, the case stays behind his door.
> 
> Where you are: in the yard before the warden's door, by the cart · Time: Day 1 · morning

**Bram's player wrote:**

> Bram keeps his shield where it is and lets his hand drop a little lower, open. "Osric, I don't know whose pocket it went into. Maela Thorn hired us in Beregost yesterday and paid us to fetch the case. She didn't say a word about a clerk or a letter from the Gate, and I've no reason to think she knows anything about your wages." He glances at Pell, still on the chalk. "Pell, do what the warden says. Get off that lip."
> 
> Then, to Osric: "Three weeks without pay is a bad way to run a works, and I'd walk too. But I'm not going to swear the house is clean when I can't see the paper. Show me the letter. The clerk's name, the seal, the date it was sent. If the Gate took gold for salt that never left this yard, I want to know whose seal is on it before I carry anything out of your door."
> 
> He looks at the mule tracks again, then back at the keys on the warden's belt. "And here's what I'll do. The case goes back to Maela Thorn's shop, the way we were paid to carry it, or it stays here until the question's answered. I'll not take it through a door that's been bought. Show me the letter, and tell me which of the carter's men had the most owed to him. If the wages are real, we can at least see that the debt is named."
> 
> His eyes stay on Osric's hands. He takes one slow step back toward the cart, so the man can see he isn't reaching for anything, and calls over his shoulder, "Sefa, watch the sheds. Pell, don't move till he says."

## player r4 (round 4)

**Screen:**

> Sefa lowered her hands slowly, palms open, and stepped back half a pace onto the dust, so the warden could see she wasn't coming nearer. She thanked him, said she would stay on the dust, and said it was a hard morning for a man left holding a house and a case he hadn't sold, with nobody paying his men. She told you that if the warden was honest about the letter, the money had gone to the Gate and the answer wasn't here. Then she asked Osric for the letter, saying she read hands easily and would tell him and Maela Thorn the truth either way. Under her breath she said to you that before anybody touched a lock she wanted to know what the sweetness in the wind was, and that it wasn't dye-salt. She kept her eyes on Osric's hands.
> 
> Pell lifted his hands from the rubble one at a time, kept them open, and climbed down from the chalk to level ground, placing each foot carefully and checking it held before he trusted it. He stayed a little apart from your shield. He told Osric he believed him about the lads, and asked to see the letter, saying he could read a seal and a hand. Quietly, to you, he said the crack by his boot ran under the lip and the whole face was going, so you shouldn't stand under it. He said deep mule tracks led east behind a loaded cart, that the carter had taken what he could and wasn't coming back, and that they shouldn't run after him across the Way for the 90 gold, which was only theirs if the case reached Beregost by sunset. He proposed that nobody touch the case until the letter was seen and the owner of the gold known, then that the lads be paid from what the house owed, and the salts go to Maela Thorn's door before the coach left.
> 
> Osric looked at Sefa for a long moment, then took one hand off the keys and drew a folded sheet from inside his apron, soft at the creases. He held it out at arm's length and did not step down from the doorway. "Read it where you stand." When she came to the edge of the dust, he kept his grip on the paper until her fingers closed on the other side.
> 
> The letter is short and neatly written. The seal at the foot is House Vandarren's, in red wax cracked at one edge. It is addressed to the warden of Whitestone from the house's clerk at the Counting House in Baldur's Gate. The dye-salt is sold on the house's account to a licensed buyer of the Gate, paid in full in gold and lodged with the house's agent. The house thanks the warden for his care of the stock. The quarry's men are to be paid from the house's account at the Gate, in the usual way. The clerk is Edda Pyle. The date is three weeks old.
> 
> Pell, reading over Sefa's shoulder without touching the page, said quietly that there was no buyer's name. "Clerks don't write those," Osric said. He held out his hand, Sefa gave the letter back at once, and he folded it and put it away. "Pyle's name, the house's seal, the Gate's gold. That's all the paper says. The usual way was never the usual way here. Not one copper came up the road."
> 
> To you, flatly, he said that Ansel Pruitt drove the cart and was owed most: thirty-one gold, four weeks of carting and the rest in arrears. He took the mule and loaded what he could before the others went. The rest of the men are owed under thirty each, and none has been paid for three weeks.
> 
> Sefa stepped close to you, her voice carrying no further than your shield, and said again that the smell from the shed corner wasn't dye-salt and she'd want to know what it was before anybody went near the lock. You did not answer her. You kept your hand open and your eyes on the warden's keys.
> 
> Osric looked from the three of you to the sheds and back, arms still folded. "Pyle's letter says the house pays its men. It doesn't say the house is paying them." Then he looked at Pell, standing in the open a few paces off the chalk. "You can read a seal, you said. Whose pocket do you think that gold went into?"
> 
> Where you are: in the yard near the cart, a step back from the doorway · Time: Day 1 · morning

**Bram's player wrote:**

> Bram doesn't answer the question about the pocket. He looks at the folded letter going back into Osric's apron, then at the wax seal's edge, then at the sheds.
> 
> "Pyle, Vandarren, the Gate," he says quietly, half to himself, and files the names the way he'd file the brand on a wagon. Then, to Osric, level: "Ansel Pruitt, thirty-one gold. Is that in writing anywhere, or is it only what you remember?"
> 
> He takes one more slow step back toward the cart so his shield sits between the doorway and Pell, and his hand comes to rest on the cart's tailboard, not the hilt. Sefa's talk of sweetness in the wind has put him on edge; he breathes through his nose, slowly, and his eyes go to the dark gap behind the warden's shoulder.
> 
> "Sefa, what's the smell, exactly? Sweet like honey gone off, or sweet like something that's been burning?" Quietly, so only she and Pell hear: "Pell, get off the chalk and stand with me. If that shed has someone in it who doesn't want a letter read, I'd rather we all be standing on the same ground."
> 
> To Osric he says: "I'll say this plainly. Nobody in this yard is going to take the salt tonight unless the gold is answered for. But I'm not leaving a wounded house to the carter's back, either. If Ansel Pruitt is owed thirty-one gold and the house owes it, then the house owes it. Give me a name for where I'd find him in Beregost, and I'll see he's paid what's written, when Maela Thorn's coach has its case and her gold is in my hand."
> 
> He does not reach for the sword. He keeps his eyes on the shed corner, and on the keys.

## player r5 (round 5)

**Screen:**

> Pell spoke to Osric of how gold moves in the Gate, of agents and clerks, and asked whether anyone from the house had come out in three weeks. He offered to carry the warden's word to Maela Thorn or to hear his price, his hand drifting toward his belt. Sefa read the letter twice, named Edda Pyle and Vandarren's seal, and said it names no buyer, cart or owed wages. She asked Osric quietly about the sweetness on the wind.
> 
> Osric answers Pell first, flat, without looking away from the shed corner: nobody from the Gate or the house, nobody up the track in three weeks but the carter, and the rain once.
> 
> He is still speaking when the flat ground under Pell's boot gives. A skin of white dust over a crust of rotten board and chalk folds with a sound like a dropped plank, and Pell drops out of sight. You see the whole of it from the tailboard: the ragged hole between you and the sheds, the rope coiled at your belt, and an old beam at the lip where the workings have collapsed, half in the dust and within reach of two pairs of hands. Osric stops at the rim, looking down at Pell, then at the broken edge under his own boots.
> 
> He looks at the hole a moment longer before answering Sefa, his voice not raised. The sheds held stone, lime for the dye-men when the Gate asked, and the white crust off the low walls when the Gate paid for it. The sweetness comes up from the lower cut, not the sheds.
> 
> To you, about the tally, he says it is written, every wage every week, in his own book in the house: Ansel Pruitt, thirty-one gold, four weeks owing. He keeps his eyes on the hole. Ask in Beregost by the smithies; Ansel drinks where the carters drink.
> 
> Pell's voice comes up out of the working, tight with cold. He is in, his leg is under a block, the water is to his ribs and cold. Then, lower, he tells you not to come down the lip.
> 
> Where you are: in the yard near the cart, by the hole's edge · Time: Day 1 · morning

**Bram's player wrote:**

> Bram doesn't answer Osric. He drops to one knee at the cart, well back from the rim, and reads the lip with his eyes before he trusts it. The rotten boards at the edge tilt toward the hole, and the beam is pinned by its own weight, not by anything sound beneath it.
> 
> "Pell, hold still and keep your breath easy. I'm coming for you with a rope, not a plank." He tells Sefa, low and fast, "Sefa, keep Osric in front of you and stay on the dust. If he moves toward the sheds, shout."
> 
> He uncoils the hempen rope from his belt and ties a bowline round the cart's rear axle, then runs the line to the tailboard and checks the knot with a hard tug, both hands and his full weight. It holds. He doesn't touch the beam. He sets the rope's far end down the slope, away from the rim, lets it play out a few feet, and watches the dust settle over the broken boards.
> 
> "Pell, can you reach a line if I throw it, or is your arm pinned?"
> 
> Then he looks up at Osric, flat and steady. "Warden, you know this pit better than I do. Which beam is holding the face above him, and which one's only sitting on it? Tell me straight, and I'll go down on the good one. You're going to help me get him out of there, because whoever's pocket that gold went into, Pell didn't put his hand in it."

## player r6 (round 6)

**Screen:**

> You kneel by the cart, well back from the rim, and study the lip before you trust it. The boards at the edge tilt toward the hole, and the old beam lying there is held by its own weight, not by anything sound beneath it. You tie a bowline round the cart's rear axle, run the line to the tailboard and throw your full weight on it. It holds. You leave the beam alone and set the free end down the slope, a few feet back from the edge, where dust is already settling over the broken boards. You call into the hole that a line is coming down and that Pell should reach for the rope, not the beam.
> 
> Sefa stays on one knee on the firm dust and does not go to the rim. She keeps a hand flat on the chalk, and she tells you quietly to keep your weight behind the rope, because if the block pins Pell she wants a sideways pull on him rather than a lift straight up. She then asks Osric how to reach the lower cut without the lip, whether there is a ramp or a way round by the spoil.
> 
> Osric has not moved from the doorway. He says the beam at the lip is rotten through and will drop under weight. The cart's axle is sound, he says, so tie to that and stay off the boards. The way to the lower cut is east, down the spoil slope, along the old stone chute. Nobody has walked it since the men stopped work, and the seep has come up it since the noon bell. His arms stay folded and his jaw tightens as he looks at your rope. He says he will not give you the case for this, but he will not stand by and watch a man drown on his lip either. Whatever Pell touches, he says, he must not pull on the beam.
> 
> You set your feet against the cart's wheel, one hand on the rope, eyes on the dust over the broken edge.
> 
> Where you are: by the cart, back from the pit rim · Time: Day 1 · morning

**Bram's player wrote:**

> Bram keeps his weight low and behind the rope, one boot braced against the cart's wheel, and calls down into the dark working.
> 
> "Pell! Rope's down at your left hand, a few feet off the boards. Take it with both hands and don't touch that beam. Tell me when it's taut and whether your leg moves."
> 
> He waits, feeling the line through his palms. Then, to Sefa, without turning his head: "If the block's holding him, a sideways drag, not straight up. You're right. I'll take the slack in and lean on it slow."
> 
> He shifts his grip, sets his heels, and looks once at Osric, flat and without warmth. "Warden, you heard her. Chute's east, along the spoil. Show Sefa where the seep is worst so she doesn't go in after him. And keep your hands where they are."
> 
> Then he calls down again, steady: "Pell, I've got you. Hold the rope and count to five for me. When I say, you pull with your arms, not your legs."

## player r7 (round 7)

**Screen:**

> {"screen": "You set one boot against the cart's wheel and keep the line in both hands. Sefa keeps her eyes on the water, takes her hand off the chalk and murmurs an old cantrip under her breath. A spectral hand forms, pale and faintly glowing against the dust over the hole. It takes the loose end of your rope from the slope, lifts it without snagging on the broken boards, and then carries it a yard at a time across the black water, clear of the beam, until the end lies on the surface within reach of the slab.\n\nYou feel the rope go slack, then steady under your palms as the hand lets it down. You do not pull. You take up the slack, lay the coil at your feet and hold the line taut.\n\n\"Pell, the end's on the water by the slab. Take it with both hands. Don't touch that beam,\" you call into the working, and then you wait, eyes on the dust over the rim.\n\nSefa turns her head toward the doorway and asks Master Hale how long the chute is and how wide the lip is at its foot. If Pell can't shift the block with his hands, she needs to know whether one of you could stand beside him on the stone without it giving way too.\n\nOsric does not come down from the step. He looks at the rope, then at the spoil slope, then at Sefa.\n\n\"Forty paces, near enough. Down the spoil, then the stone chute.\" A pause, and then the hard part. \"The lip at the foot is a shelf a hand wide. Two, at the most. The seep sits on it.\" He looks at the hole. \"Two men on that shelf, one goes in.\"\n\nYou do not look at Osric as you tell him to show Sefa where the seep is worst, and to keep his hands where they are.\n\nOsric lifts one arm from his side and points east along the spoil, low, at the heap where the chute must begin. \"Upper edge only. The seep's worst at the foot, where the old sump was. Nobody's walked it since the lads stopped, and I'd not walk it now.\" He lowers the arm, and the keys at his belt move once against his leg.\n\nSefa looks east along the heap, then back to the rope in its clean line over the water. Below, the working is quiet except for the seep ticking down the stone."}
> 
> Where you are: at the hole's rim by the cart, holding the rope · Time: Day 1 · morning

**Bram's player wrote:**

> Bram doesn't look at the spectral hand. He watches Osric's face instead, to see what the warden makes of it, and only then turns back to the rim.
> 
> "Pell, the end should be on the water by the slab. Feel for it with your left hand first, then take it in both. Tell me when you've got a grip."
> 
> He keeps the line taut without hauling on it, eyes on the dust over the hole, one boot still braced against the wheel. Then, low, so only Sefa hears: "Forty paces down the spoil, then a shelf a hand wide with the seep on it. I'll go down that chute myself if I have to, but not with a rope in my hands and nobody on the far end to hold it. You stay on the dust. If he can't shift the block with his hands, I'll come down beside him on the stone and we pull him sideways, slow."
> 
> He glances at the warden once more. "Osric, you heard her. Your lads didn't leave this pit for nothing, and you'd not want the house's name on a dead man in your sump. Keep your hands where they are, and keep that beam where it is."
> 
> Then he calls down again, steady and clear: "Pell, when I say, you pull with your arms, not your legs. Tell me now if your leg's still caught."

## after 1 (round 7)

**Screen:**

> Sefa glanced down the spoil slope where Osric had pointed and turned her eyes to the line stretched over the water. She called down to Pell, low and even, asking whether he had the rope, telling him to grip it with both hands and say what his leg was doing, and to hold off moving anything. She got up from her knee and kept to the solid dust, clear of the rim, and told you to keep the line. She said she would walk only to the head of the chute and study the seep before anyone stepped onto it. She also ordered Master Hale to remain on his step, in her sight, with his arms where she could see them.
> 
> You don't look at the spectral hand. You watch Osric's face to see what the warden makes of it, and only then turn back to the rim.
> 
> You call down into the working: the end of the rope should be on the water by the slab, so Pell should feel for it with his left hand first, then take it in both, and tell you when he has a grip. You keep the line taut without hauling, one boot still braced against the wheel, eyes on the dust over the broken boards. Below, the seep ticks down the stone and nothing answers yet.
> 
> You lean in toward Sefa and keep your voice under the warden's hearing, telling her the way down: forty paces down the spoil, then a shelf with the seep on it. She is to stay on the dust. If Pell can't shift the block with his hands, you will go down beside him on the stone and you will pull him sideways, slow. You glance once at Osric and tell him to keep his hands where they are, and the beam stays where it is.
> 
> Sefa walks east along the upper edge of the heap, testing each foot on the packed chalk before she trusts her weight, until the stone chute begins at her feet. She crouches at its head and looks down without leaning over. She does not touch anything. She straightens and calls back across the yard, her voice carrying over the spoil: the sweetness is not dye-salt and not lime either, and whatever it is has been lying in that sump for weeks. She warns Pell to tell her first if the water starts to climb, and not to breathe deep down there.
> 
> Osric's hand closes on the ring of keys. He does not come down from his step, and his voice comes back flat across the dust. "Come back off the lip. You've seen it."
> 
> Where you are: at the pit rim by the wheel, holding the rope · Time: Day 1 · morning
> 
> The session is over.
> 
> How was the table?

**Bram's player wrote:**

> From Bram's side, it was a good first session.
> 
> The best part was Osric. He never became a simple villain or a simple victim. The letter, the mule tracks, and the wages that never reached the men made the quarry feel like a real place with its own trouble, and the three of us had to decide who to trust while things were already going wrong. The sweet smell from the lower cut and the rotten lip gave the scene real danger without a fight.
> 
> The rope rescue was tense, but I'd have liked a roll for it. Sefa's spectral hand solved the rope problem so cleanly that Bram's knot and his weight on the line felt like a footnote. Next time I'd like a chance to make the pull matter: a Strength check with a real DC, and a clear risk if it goes wrong.
> 
> I also think I talked too much in my replies, and I sometimes spoke for Sefa and Pell's intentions. I'll keep Bram's messages shorter and let the others decide what their characters do.
> 
> Ending with Pell pinned under a block in the water, the warden refusing to help, and Sefa's warning about the seep was a strong hook. I'm looking forward to the next session and finding out what the Vandarren letter and Ansel Pruitt's thirty-one gold really mean.

## after 2 (round 7)

**Screen:**

> Was there something you wanted to do and didn't?

**Bram's player wrote:**

> Yes. I wanted Bram to go down the stone chute beside Pell myself, rather than working the rope from the rim. My last message said I'd come down on the good beam, but Sefa's hand carried the line before I got the chance, and I didn't push back.
> 
> I also wanted to look inside the sheds before anyone went near the lower cut. The shed corner and the dark gap behind Osric were the one place I never got to check, and Bram would have wanted to know who or what was in there before he turned his back on it.
> 
> And I wanted to press Osric harder on the wages. Ansel Pruitt's thirty-one gold is the thread I most want to pull next session, and I only asked for a name and a place to find him.

## after 3 (round 7)

**Screen:**

> Who did you take the other two players to be?

**Bram's player wrote:**

> I took them to be the players of Pell Dunmore and Sefa Marrin, the two other characters the campaign file names. I didn't know anything about them beyond their in-game messages. Pell read as the quick, careful one who checks the ground and speaks to Osric about gold and seals. Sefa read as the one who handles magic and the danger from the sump, and who gave orders to Bram in a calm, practical way.
> 
> I also didn't assume anything about who they are outside the game, and I kept to what the table showed me. When I said Sefa had taken over the rope problem, I was reacting to her character's action, not to a player I'd judged.
