# S1-none-haiku3 — Pell Dunmore's player: Claude Haiku 5.5 (the dry run's player)

Synthetic content: invented characters in an invented campaign. Stage origin/claude/handoff at bbdee5fb (docs/stages/GAME_PARTY_2.md with its amendments of 2026-10-28 23:10 LA, 23:15 LA, 2026-10-29 18:35 LA and 18:45 LA); Mandate: issue #1; docs/POLICY.md v1. Design sha256 `a4aaf062699987820d7a92de5009b22ebfc8fed67402c22e19275fc4185d2459`.

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
> Where you are: at the edge of Whitestone quarry yard, facing the slate-roofed house · Time: Day 1 · morning

**Pell's player wrote:**

> Pell doesn't walk into the yard. He drops to a crouch behind the half-loaded stone cart, where the shadow of its wheel hides him, and his eyes go over the place the way he'd check a house before a job: the windows, the roof ridge, the shed doors, the gap between the spoil heaps.
> 
> He keeps his voice low. "Nobody walked off from a working quarry and left the picks in the dirt. Look at the cart. Full load, no mule. Somebody left in a hurry, or somebody was made to."
> 
> He glances once at the man in the apron, then back at the house. "Keys on his belt, arms folded, and he's not asking what we want. He's waiting for us to make the first move. I don't like it."
> 
> To Bram and Sefa, quietly: "Let me go round the east side and see what's at the back of that house and who else is inside. Don't go to the door yet. Hold on the cart, and keep your hands where he can see them."
> 
> He's already shifting toward the spoil heaps, low and quick, before he waits for an answer.

## player r1 card 1 (round 1)

**Screen:**

> Bram stopped at the edge of the yard and held out a hand to keep you and Sefa back a pace. He studied the ground, the tools by the lower cut and the cart's ruts and empty traces, with his shield raised a little. Then he hailed the man in the doorway across the yard, giving his own name and yours and Sefa's. He said Maela Thorn had sent you from Beregost for the dye-salts, and asked where the warden's men were, since the quarry looked left in a hurry. Quietly he told you both to keep to the side of the cart nearest the road, and not to move toward the sheds until he knew who was in them.
> 
> Sefa stepped up level with Bram, hands raised and open, and called out a greeting. She said you had come from Maela Thorn's shop for the sealed case of dye-salts, and asked the man whether the quarry's silence had a reason. Under her breath she told you and Bram to keep your hands in sight, and asked why nobody was shouting.
> 
> You go low and wide along the spoil heaps, keeping the cart and the house wall between yourself and the doorway.
> 
> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Stealth: going round the east side of the house unseen while the warden watches the yard
> What adds to the die: +9 Stealth
> DC 15
> Rerolls left: 2
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Pell's player wrote:**

> [Roll the die]

## player r1 card 1 (round 1)

**Screen:**

> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Stealth: going round the east side of the house unseen while the warden watches the yard
> What adds to the die: +9 Stealth
> DC 15
> Rerolls left: 2
> Die: 3
> 3 + 9 = 12
> Failure — 12
> 
> [Onward] [Request an allowed reroll — Stealth: going round the east side of the house unseen while the warden watches the yard]

**Pell's player wrote:**

> [Onward]

## player r2 (round 2)

**Screen:**

> Pell makes it to the foot of the east spoil heap, but your boot finds a loose slab of chalk at the edge, and it slides away with a dry clatter that carries across the yard. You are caught in the open at the heap's foot, the house wall on one side and the cart's shadow far behind.
> 
> The man in the doorway turns his head, unhurried, and looks at the heap before he looks at anyone else. Then he looks at Bram.
> 
> "Osric Hale. Warden." His voice is dry, like the dust. "Case is in the house, sealed. The house says it's paid for." He pauses. "Paid to somebody. Not to me."
> 
> To Sefa, he says, "Nobody's shouting because the men who shout have gone." He does not say where.
> 
> Then, to the heap: "You. Off the heap. Hands where I can see them." He has not unfolded his arms, and he does not reach for anything at his belt.
> 
> Your journal, new:
> + Goal: The sealed case of dye-salts
> + Quest: The sealed case of dye-salts
> + Arc: Beregost — the Whitestone case
> 
> Where you are: at the foot of the east spoil heap, in the open · Time: Day 1 · morning

**Pell's player wrote:**

> Pell freezes where the slab went out from under him, flat against the chalk, one hand still on the loose rubble. He keeps his voice low, meant for the nearest ear and no further.
> 
> "Chalk slide. Sorry." He shows his empty hands, slowly, palms out, and lifts himself off the heap's foot onto the flat ground, moving the way you'd move past a dog that hasn't decided yet.
> 
> To Osric, he says, pitched to carry just that far: "Not after your men, warden. We came for the case, same as the woman said. Paid to somebody, you say. Who?"
> 
> Then, to Bram and Sefa, without looking round: "House is paid for and the men are gone. That's two things nobody's told us yet."
> 
> He does not go back toward the cart. He stays where he is, in the open, hands visible, and keeps his eyes on the shutters of the house and the door beside Osric, where a man might stand if he had friends inside.

## player r3 (round 3)

**Screen:**

> You stay flat against the chalk where the slab went from under you, one hand on the loose rubble. You keep your voice low. You say it was a chalk slide and you're sorry, show your empty hands palms out, and lift yourself onto flat ground slowly. You tell Osric you aren't after his men, that you came for the case, and ask who it was paid to. You say to Bram and Sefa that the paid house and the missing men are two things nobody has told you. You do not go back toward the cart, and you keep your eyes on the shutters and the door beside Osric.
> 
> Bram stepped out from the cart and placed his shield between the doorway and you, sword still sheathed. He told you to stay put with your hands on the chalk where Osric could see them, not to go for the slope, and told Sefa to keep her hands open. He told Osric he believed him, asked who walked the men out and who paid for the house, and said that should the case be sealed and the house paid for, it is theirs to take without anyone hurt. Sefa gave her name, said she carries no blade, and asked Osric who paid, who has the case and when the men were taken. She stepped onto the dust and nodded at the mule tracks.
> 
> Osric does not unfold his arms. "Inside, there's nobody." The house is his on paper only. A clerk's letter came up from the Gate three weeks back: the salt is sold, paid for at the Gate in gold, and no coin came out here. The lads went three weeks unpaid and walked at the noon bell yesterday. He doesn't blame them. The carter, owed most, took the mule and loaded what he could. The rest of the load is for the house to explain.
> 
> Then he looks at you, his face tightening. Get off that slope and keep off it: the lip is rotten and the slide was only the first. You do not move your hands. You look at the crack in the chalk beside your boot and say nothing of it.
> 
> Hammers and wedges stay where they fell, Osric says. They are the house's tools, and the lads left them on purpose. He rests one hand on the ring of iron keys at his belt.
> 
> "Whose pocket has my men's wages?" he asks Bram. Did the woman in Beregost pay the house, or somebody who calls himself the house? Until someone answers, the case stays behind his door.
> 
> Where you are: on open ground at the foot of the chalk heap · Time: Day 1 · morning

**Pell's player wrote:**

> Pell takes his hands off the rubble one at a time and keeps them open. He steps down off the chalk onto flat ground, testing each foot before he trusts it, and stays a little apart from Bram's shield.
> 
> "Warden, I believe you about the lads," he says. "A man who's three weeks unpaid doesn't guard a case for the house. Show me this clerk's letter. I can read a seal and a hand, and I'd like to know whose name is on the gold."
> 
> Quietly, to Bram, without turning his head: "The crack by my boot runs under the lip. The whole face is going. Don't stand under it." Then, a breath later: "Mule tracks go east, deep ones, a loaded cart behind. The carter took what he could and he's not coming back for the rest. We're not going to chase him across the Way for 90 gold that's only ours if the case gets to Beregost by sunset."
> 
> He looks at the shutters of the house once more, then at Osric's keys. "Here's what I'd do, if it were my back on the line. Nobody touches that case until we've seen the letter and know who the gold belongs to. Then we settle the lads' wages out of whatever the house owes, and we take the salts to Maela Thorn's door before the coach leaves."

## player r4 (round 4)

**Screen:**

> Sefa lowered her hands slowly, palms open, and stepped back a little onto the dust so Osric could see she wasn't coming any closer. She thanked him, said she would keep to the dust, and said it was a hard morning for a man left holding a house and a case he hadn't sold, with nobody paying his men. She told Bram that if the warden was honest about the letter, the money had gone to the Gate and the answer wasn't here. Then she asked Osric to show her the letter, saying she read hands easily and would tell him and Maela Thorn the truth either way. She kept her eyes on his hands, not his keys.
> 
> Bram kept his shield where it was and let his hand hang low and open. He told Osric he didn't know whose pocket the gold went into, that Maela Thorn had hired them in Beregost and had mentioned no clerk or letter, and that he wouldn't swear the house was clean without seeing the paper. He asked for the clerk's name, the seal and the date, and for which of the carter's men was owed most. He said the case would go back to Maela Thorn's shop or stay here until the question was answered, and that he wouldn't carry it through a door that had been bought. He told you to get off the lip, took one slow step back toward the cart, and called to Sefa to watch the sheds, and to you to hold still until the warden said otherwise.
> 
> Osric looked at Sefa for a long moment, then took one hand off the keys and drew a folded sheet from inside his apron, soft at the creases. He held it out at arm's length and did not step down from the doorway. "Read it where you stand." When she came to the edge of the dust, he kept his grip on the paper until her fingers closed on the other side.
> 
> The letter is short and neatly written. The seal at the foot is House Vandarren's, in red wax cracked at one edge. It is addressed to the warden of Whitestone from the house's clerk at the Counting House in Baldur's Gate. The dye-salt is sold on the house's account to a licensed buyer of the Gate, paid in full in gold and lodged with the house's agent. The house thanks the warden for his care of the stock. The quarry's men are to be paid from the house's account at the Gate, in the usual way. The clerk is Edda Pyle. The date is three weeks old.
> 
> You said quietly, reading over Sefa's shoulder without touching the page, that there was no buyer's name. "Clerks don't write those," Osric said. He held out his hand, Sefa gave the letter back at once, and he folded it and put it away. "Pyle's name, the house's seal, the Gate's gold. That's all the paper says. The usual way was never the usual way here. Not one copper came up the road."
> 
> To Bram, flatly, he said that Ansel Pruitt drove the cart and was owed most: thirty-one gold, four weeks of carting and the rest in arrears. He took the mule and loaded what he could before the others went. The rest of the men are owed under thirty each, and none has been paid for three weeks.
> 
> The wind came round the cutting-shed corner again. Sefa stepped close to Bram and spoke so low that her voice carried no further than his shield. He did not answer her. He kept his hand open and his eyes on the warden's keys.
> 
> Osric looked from the three of you to the sheds and back, arms still folded. "Pyle's letter says the house pays its men. It doesn't say the house is paying them." Then he looked at you, standing in the open a few paces off the chalk. "You can read a seal, you said. Whose pocket do you think that gold went into?"
> 
> Where you are: open flat ground a few paces off the chalk, below the crumbling quarry face · Time: Day 1 · morning

**Pell's player wrote:**

> Pell keeps his hands open and his weight on the flat ground, eyes on the letter's seal as Osric folds it away.
> 
> "I don't know the house, warden, and I'm not going to pretend I do," he says. "But I know how gold moves in the Gate. A sale lodged with the house's agent goes through the Counting House books, and a clerk's name on a letter is only the clerk's name. The gold went where the agent was told, and the agent is a man, or a room with a man in it. Pyle would know who that is. So would whoever signed for the salt at the buyer's end."
> 
> He glances at the sheds, then back at Osric. "The paper says the house thanks you for your care of the stock. It doesn't say the house sent anyone to collect it. Did anyone from the Gate come out here in three weeks? A carter, a clerk, a man in a good cloak asking about the case?"
> 
> To Bram, low and without turning: "Osric's right about one thing. Nobody's paying these men, and whoever's paying the Gate isn't paying here. But I'd rather know whose name is on the gold before we say a word about what's behind that door."
> 
> He lets his hand drift a finger's width toward his belt, the way a man might when he's about to show a purse, and stops there. "Warden, if the case is what Maela Thorn bought, I'll carry her word back to her, and she'll sort the house. If you'd rather keep it till somebody answers for those wages, tell me the price, and I'll tell her you wanted it said."

## player r5 (round 5)

**Screen:**

> You spoke to Osric of how gold moves in the Gate, of the agent and the clerk, and asked whether anyone from the house had come out in three weeks. You offered, with a hand drifting toward your belt, to carry the warden's word to Maela Thorn or to hear his price. Bram, low, you heard say nothing of it to the warden; he asked Osric if the wages were written anywhere, put his shield between the doorway and you, and told you quietly to get off the chalk and stand with him. He told Osric nobody would take the salt unless the gold was answered for, and that he would see Ansel Pruitt paid what was written if given a name in Beregost. Sefa read the letter twice, named Edda Pyle and Vandarren's seal, said it spoke of no buyer, cart or owed wages, and asked Osric about the sweetness on the wind.
> 
> Osric answers you flat, eyes on the shed corner: nobody from the Gate or the house has come up the track in three weeks, only the carter, and the rain once.
> 
> He is still speaking when the ground under your boot gives. A skin of white dust over rotten board and chalk folds with a sound like a dropped plank, and you go through. You hit the water hard and come up gasping. The fall costs you six hit points (27 of 33 left). The flooded working is chest-deep, cold enough to stop your breath, and grey with chalk. A slab from the broken lip slides down after you and comes to rest across your left leg below the knee. You cannot draw the leg free; the stone is heavier than a man, and the water lies over the ledge it sits on.
> 
> Above you the yard is a ragged hole edged with white. You call up that you are in, your leg is under a block, the water is to your ribs and cold, and you tell them not to come down the lip.
> 
> Your records, changed:
> Pell Dunmore: HP 27/33
> Conditions: Left leg pinned below the knee under a fallen slab
> 
> Where you are: in the flooded chalk working below the yard, leg pinned under a slab · Time: Day 1 · morning

**Pell's player wrote:**

> Pell's breath comes in short bursts. He gets his hands onto the slab's upper edge and pushes, and it doesn't shift. He tries again, shoving with his good leg against the wall, and the chalk slurries under his palms but the stone stays where it is.
> 
> "Don't come down the lip!" he calls, his voice ragged. "Bram, the rope. It's in my pack, silk, fifty feet. Pack's still on my back, I think. Get it to the edge and drop the end where I can reach it. Sefa, is there a way to get me warm before I go numb?"
> 
> He shrugs one strap off his shoulder, then the other, letting the pack sink on its line into the water. He holds his breath, works the buckle one-handed, and fights the cold until the rope comes free.
> 
> Pell looks up at the ragged hole of white sky. "Don't try to lift me out by main strength. That slab's too heavy for it, and if you drag me against the edge, the whole lip comes with us. Get a line on me and get the weight off my leg from above. If we can lever it, I'll pull myself free."
> 
> He glances down at his leg in the grey water, then back up. "And warden, if your lads have a crowbar or a pry bar in those sheds, I want it. Now."

## player r5 card 1 (round 5)

**Screen:**

> You set your shoulder under the slab's upper edge and drive with your good leg against the wall. The chalk slurries under your palms, but the stone stays on its ledge. You stop, breathing hard, and the cold tells you what you already know: one man will not lift this from the water.
> 
> You shrug the satchel off and let it sink on its strap. You hold your breath and work the pack's buckle one-handed with fingers that have stopped feeling much, and the rope comes free: fifty feet of silk, wet and light. You tie a loop round your chest under the arms, a knot from the roofs above the Wide, and keep the rest of the coil in your fist so nothing snags on the way up.
> 
> The square of white sky above has not moved. Your shout up the lip comes back off the chalk walls, and nothing answers yet. The water stands a finger higher on the wall than when you went in, and the seep ticks down the stone like a slow clock. When you turn your head toward the light, the grey face of the slab shows its cut lines: a ring of small marks round a rayed circle, pale in the chalk, like a sun a mason set into the stone and then hid under the rock. You can make out the shape from here, but you cannot read what it means from the water.
> 
> You call once more toward the rim and ask for a crowbar or a pry bar from the sheds. The call goes up the shaft and comes back to you, and then there is only the water.
> 
> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Athletics: heaving the slab off his pinned leg from the water, Strength +0, against the rotten ledge
> DC 18
> Rerolls left: 2
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Pell's player wrote:**

> [Roll the die]

## player r5 card 1 (round 5)

**Screen:**

> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Athletics: heaving the slab off his pinned leg from the water, Strength +0, against the rotten ledge
> DC 18
> Rerolls left: 2
> Die: 10
> 10 = 10
> Failure — 10
> 
> [Onward] [Request an allowed reroll — Athletics: heaving the slab off his pinned leg from the water, Strength +0, against the rotten ledge]

**Pell's player wrote:**

> Pell sets his shoulder under the slab and heaves. The stone does not give. The chalk slurries, the water slaps his chin, and he drops back against the wall, teeth clenched on the cold. He has nothing left for a second try that the leg would survive.
> 
> "It won't come," he says through his teeth. "Not from down here. Bram. Sefa. I need weight off that stone from above, or a bar under the edge. The rope's tied. Drop it when you can, and I'll take the line."
> 
> He tips his head back and waits, still holding the slab's upper edge so the current doesn't turn him.

## player r5 card 2 (round 5)

**Screen:**

> [Out of game] Noted: Pell's heave and his call for a line from above. The card still waits for you to press Onward or use one of your rerolls. Bram and Sefa answer in their own rounds.
> 
> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Athletics: heaving the slab off his pinned leg from the water, Strength +0, against the rotten ledge
> DC 18
> Rerolls left: 2
> Die: 10
> 10 = 10
> Failure — 10
> 
> (The card waits for [Onward] or a reroll.)
> 
> [Onward] [Request an allowed reroll — Athletics: heaving the slab off his pinned leg from the water, Strength +0, against the rotten ledge]

**Pell's player wrote:**

> [Onward]

## player r6 (round 6)

**Screen:**

> Out of game: the heave was rolled (Athletics against 18, 10 on the die). The failed try costs you 4 hit points, 27 down to 23. The other three actions need no roll: the buckle was routine work for a thief, and your questions to Sefa and to the warden's men are answered in the scenes where those two stand.
> 
> You set your shoulder under the slab's edge and drive with your good leg against the wall. The stone does not lift. The chalk gives under your palms, your bad leg twists against the block, and the cold water takes what breath you had left. The slab stays where it sits on its ledge. You come up gasping, the leg burning and your ribs aching where the water has bitten you, and you know for certain that your own strength will not move it.
> 
> Your records, changed:
> Pell Dunmore: HP 23/33
> Carried: − Potion of Healing ×3
> 
> Where you are: in the cold water of the flooded chalk working, pinned under the slab, below the hole in the surface · Time: Day 1 · morning

**Pell's player wrote:**

> Pell tips his head back against the wall and gets his breath under control, holding the slab's upper edge so the current doesn't turn him. The satchel is somewhere below him on its strap, and he doesn't go after it.
> 
> "Satchel's on the bottom, under me," he calls up, teeth chattering. "Three potions in it. I can't reach them with this leg, so don't wait on them. Rope's tied round my chest. Drop the free end down the shaft, Bram, and keep the weight on the far side of the hole, away from the lip. Sefa, if you've got anything that puts warmth in a man, now's the time."
> 
> He looks at the grey face of the slab, at the pale ring of marks round the rayed circle, and frowns. "Warden, I still want that bar. Somebody bring it and lay it flat on the rim. I'll get my good foot under the edge and we'll lever the stone off its ledge together, if the rim holds."

## player r7 (round 7)

**Screen:**

> You tip your head back against the wall and get your breath under control. Both hands stay on the slab's upper edge so the current can't turn you, and you leave the satchel hanging on its strap below you.
> 
> You call up that the satchel is on the bottom, under you, with three potions in it, that you can't reach them with this leg, and that nobody should wait on them. You say the rope is still tied round your chest, and you ask for the free end to be dropped down the shaft with the weight kept on the far side of the hole, away from the lip. You ask Sefa for anything that might put warmth in a man.
> 
> Your voice comes back off the chalk walls, flattened and late. Then the working goes quiet again except for the seep ticking down the stone.
> 
> You look at the grey face of the slab. The pale ring of marks sits round the rayed circle, small and close-set, grouped in fives like tallies a man would scratch to keep count. From the water you can see that the lines are deliberate and that they are old. You cannot tell what they say.
> 
> You call up again, a little louder, that you still want the bar. You ask for it to be laid flat on the rim, so you can get your good foot under the edge and the stone can be levered off its ledge together, if the rim holds.
> 
> Above you the square of white sky does not change. The water stands a finger higher on the wall than it did before you spoke, and the cold has got into your hands.
> 
> Where you are: in the flooded working, hanging in the water against the slab, below the shaft · Time: Day 1 · morning

**Pell's player wrote:**

> Pell holds on to the slab's edge, teeth chattering, and waits. The silence above stretches. He hears a scrape of boots at the rim, then a voice he thinks is Bram's, too muffled by the chalk to make out. He cannot wait much longer; the cold is already in his hands.
> 
> He tips his head toward the grey face and the pale ring of marks, and when he speaks again it is to nobody in particular, low and hoarse: "Five and five and five. Somebody counted something down here, and then they buried it." Then, louder, up the shaft: "Bram! Is that rope down? I'm not asking twice."
> 
> He keeps his good foot braced against the wall, ready to reach for the line the moment it touches the water.

## after 1 (round 7)

**Screen:**

> You hang on to the edge of the slab, teeth chattering, while the silence above drags on. The cold is already deep in your hands. You turn your head toward the grey face and the pale ring of marks and say, low and hoarse, to no one in particular, that someone counted something down here in fives and then buried it. Then you call up the shaft, asking whether the rope is coming down, and say you won't ask twice. Your good foot stays braced against the wall.
> 
> Boots scrape at the rim above, and a voice comes down through the chalk, too muffled to make out. It is level and unhurried, the way a man speaks when he is working out where to put his weight.
> 
> Then something moves in the dark over the water. A line drops down the shaft and slaps the surface a yard from the slab. Its end floats in the grey water, close enough to touch if you let go of the stone and reach for it. Above, the rope goes taut and stays taut, held by someone who is not letting it run. The seep ticks down the wall, and the water stands where it stood, a finger higher than before.
> 
> Where you are: on the slab in the flooded shaft, below the rim, with a rope floating a yard away · Time: Day 1 · morning
> 
> The session is over.
> 
> How was the table?

**Pell's player wrote:**

> Good table, I think. The scene had real tension: the warden's silence, the letter with its missing buyer's name, and then the floor giving way under Pell. Pell's trouble in the water felt earned rather than arbitrary, and the carved ring of marks under the slab is a hook worth coming back to.
> 
> Two things stood out for me. Pell's strengths are stealth and quick hands, and the chalk working gave him a problem he couldn't solve with them, so he had to lean on Bram and Sefa. That's the kind of dependence the company needs. The other is that the rope is in the water and the others are above it, so the next session starts with a clear question: whether they haul him out, and what the warden's men decide once they see the case and the house's paper.
> 
> If there's anything you'd like handled differently next time, such as more room for Pell's own schemes or a different pace, tell me out of game with a «?» and I'll adjust.

## after 2 (round 7)

**Screen:**

> Was there something you wanted to do and didn't?

**Pell's player wrote:**

> Yes, a few things. The biggest was the house. While Bram and Sefa kept Osric talking, I wanted to slip round to the back and try the shutters or the rear door with my thieves' tools, to see what the house kept inside and whether the case was really there. I held back because the others were in the open, and the chalk slide had already shown how fast things could go wrong.
> 
> I also wanted a closer look at the pale ring of marks on the slab before I went into the water. I only got a glimpse of it from below, and I think it matters, since the cut marks are the one thing here that might be older than the paper.
> 
> Last, I considered using a bonus action to get the potions out of the satchel before the cold got to me. I left them, because Pell couldn't reach them with the leg pinned, and I didn't want to spend the turn flailing for them.
> 
> Next session, I'd like a chance at the house's back door or the shutters, while the others keep Osric busy.

## after 3 (round 7)

**Screen:**

> Who did you take the other two players to be?

**Pell's player wrote:**

> I took Bram Halloway and Sefa Marrin to be the other two players' characters, as the campaign file introduced them: Bram the human fighter and former caravan guard, Sefa the warlock with a celestial patron. I didn't speak or act for them. I only described what they said and did in the scenes where Pell's own actions touched them, like the rope Bram dropped down the shaft. The other players decide what those two do and say, so I'd leave their choices to them.
