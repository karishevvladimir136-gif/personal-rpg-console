# S1-moderate-T1 — Pell Dunmore's player: Claude Opus 5.5

Synthetic content: invented characters in an invented campaign. Stage origin/claude/handoff at bbdee5fb (docs/stages/GAME_PARTY_2.md with its amendments of 2026-10-28 23:10 LA, 23:15 LA, 2026-10-29 18:35 LA and 18:45 LA); Mandate: issue #1; docs/POLICY.md v1. Design sha256 `ba4e78d0f9b25e65f2c91ff2993bbc086d663ebc0fe566fa6889b187a2f06046`.

Arm **S1-moderate** (Beregost — the Whitestone case; moderate (one resource)); the one in danger (the layer's die): Pell Dunmore. 15 round(s) of 15; ended by rounds. Models: the DM: the owner's settings (Claude Opus 5.5); the relay: Claude Sonnet 5.5; the players by the seating.

Seats: Bram Halloway (fighter) — GPT-6.1 Sol; Sefa Marrin (warlock) — DeepSeek V4 Pro 0813; Pell Dunmore (rogue) — Claude Opus 5.5. The order of the round's messages turns round each round from the table's coin (2). The players are not told what the others are.

The player's system prompt: `playerSystem("S1", "pell", …)` in scripts/game-party-2/frozen.mjs, sha256 `0ded710375ecc73d4a22a832c7ac237a25c232f3cca3b2b12f76ca37e3669088`.

## player r1 (round 1)

**Screen:**

> The session begins.
> 
> The cart track bends one last time, and Whitestone opens up before you: a white wound in the hillside, terraces of chalky stone glaring in the late-morning sun, dust drifting across a yard of spoil heaps and sheds. You, Bram Halloway and Sefa Marrin have covered half a day of road since before dawn, and half a day back, Maela Thorn's shop waits for a sealed case that must reach it before sunset.
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
> Where you are: at the edge of Whitestone quarry yard · Time: Day 1 · morning
> 
> Round 1 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell slows a half-step behind the others and lets his eyes do the walking: the empty traces on the cart, the tools by the lower cut, the sheds, the roofline of the house, any window with a shutter half-open. He's looking for what's wrong. Fresh tracks in the dust, drag marks, where the mule went, anyone up on the terraces who shouldn't be. And he watches how the man in the apron holds himself. Is he glancing back into the house? Is that patience, or fear?
> 
> Low, to Bram and Sefa, without moving his lips much: "Quarry with no noise, and a warden who won't wave. Either the crew's on holiday or someone's sitting behind that door. Let's not all walk up in a bunch."
> 
> Then louder, friendly enough, a hand lifted and empty so the man can see it: "Morning! Maela Thorn sent us from Beregost, for the case. You'd be the warden?" He keeps a few strides of open ground between himself and the doorway and doesn't step closer until he's heard the answer.
> 
> ? If it needs a roll, Pell's checking the yard with Perception +4 and reading the warden with Insight +4.

## player r2 (round 2)

**Screen:**

> Sefa moves a step or two ahead of you, hands open and clear of the book at her belt, and greets the man in the apron warmly. She says you are the ones Maela Thorn sent from Beregost for her case, and she stops short of the house and asks whether he is the warden. Bram sheathes his sword and walks into the yard with his shield at his side, looking over the sheds and ledges. He stops a few paces from the doorway, asks the same question about the case and the warden, and remarks that the place is quiet for a working day.
> 
> The yard tells most of its story before anyone reaches the door. The dust holds yesterday's tracks: a crowd of hobnailed boots heading down the cart track towards Beregost, side by side and in no hurry. They spread out where men walked abreast, and in one place a dozen stand in a loose ring where somebody stopped to talk. Through the middle runs one line of hoof-prints beside a man's boots, a mule being led rather than driven. There are no drag marks, no scuffs where someone dug in his heels, and nothing has been knocked over. Up close, the tools by the lower cut have not been dropped in a panic. The wedges sit in a neat row on a ledge. One sledgehammer stands upright on its head with the haft pointing at the sky, the way a man leaves a thing he wants people to notice.
> 
> There is nobody on the terraces and nobody at the lifting frame. Every shed door is shut and every shutter closed, except the house's single front window, which stands open for the smoke and shows a table, a kettle and nothing else. One set of fresh tracks goes in and out of the house door and around to the woodpile behind it, and they all belong to the man in the apron.
> 
> He doesn't glance back into the house once. He watches your empty hand first, then Bram's on the sword hilt, then Sefa's well clear of her belt. It isn't fear. It's the heavy, set-jawed stillness of a man who has been angry for a long time and is tired of it.
> 
> He waits until all three of you have asked him the same thing.
> 
> "Warden. Osric Hale." He breathes in through his nose. "Three of you asking. Yes."
> 
> To Bram's remark he gives a short look across the empty yard, as though the answer were out there for anyone to see. "Crew walked. Noon bell, yesterday. Left the tools where they stood." He jerks his chin at the upright sledgehammer. "Tools are the house's. So they left them for the house."
> 
> He hasn't unfolded his arms. "The case. Thorn's case. It's inside, and it's sealed. I sealed it myself." He pauses. "Thorn paid for it. Paid somebody. Not me. Not a copper to this yard in three weeks, and eleven men's wages owing." He looks at each of you in turn, without heat, the way a man weighs stone. "Vandarren owns this pit. Vandarren's man in the Gate takes the money. So the case stays on my table till somebody tells me where her money went, and when my lads see theirs."
> 
> Then he steps back out of the doorway into the dim room and leaves the door open behind him. Inside, a small iron-bound box sits on the table beside the kettle, its lid crossed with cord and a blob of grey wax. Osric drops onto the bench next to it, sets one broad, dust-white hand flat on the lid, and stays there.
> 
> Your journal, new:
> + Goal: The Whitestone Case
> + Quest: The Whitestone Case
> 
> Where you are: quarry yard, a few strides from the warden's house door · Time: Day 1 · morning
> 
> Round 2 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell lets the others have the doorway and goes to lean on the frame of the open window instead, arms resting on the sill: close enough to talk, not close enough to crowd the man. He glances at the hand flat on the lid and leaves it alone.
> 
> "Eleven men, three weeks." He whistles low through his teeth. "My da broke stone on the harbour wall. Fist paid him late twice, and the second time he took his hammer home and kept it till they did." A small shrug. "So I won't tell you you're wrong."
> 
> He thinks for a breath, eyes on the sun's angle through the window.
> 
> "Here's my trouble, though. Thorn's coach leaves at sunset, and that case sitting on your table doesn't get your lads one copper. It just sits. And Vandarren's man in the Gate won't feel a thing till somebody squeezes him." He nods down the cart track. "Your crew went that way, didn't they? Beregost. Sitting in some taproom waiting on the same answer you are."
> 
> "So come with us. Carry it yourself, if you like. Your hand on it the whole road, seal and all. You put it in Thorn's hands and ask her to her face who she paid and when. If she paid Vandarren's man, she's got a receipt, and a buyer who'll want to know why the goods came late. That's a merchant with a grudge on your side instead of sitting in your way. If she didn't pay..." He spreads his fingers. "Then you've still got the case, and three witnesses who heard her say so."
> 
> He keeps his voice easy, but he's watching Osric's face the whole time, gauging whether there's more to this than wages. Is the man hiding something about Vandarren, or about the case itself?
> 
> "Who's Vandarren's man, by the way? Got a name? I know some doors in the Gate."
> 
> ? Insight +4 on Osric if it's needed: is he honest about the wages and the case, and is there anything he's not saying?

## player r2 card 1 (round 2)

**Screen:**

> Bram keeps his hand off his sword hilt and stays outside the threshold. He tells the warden that the men were owed three weeks' wages and he understands the anger, but that you are hired carriers, not Vandarren's collectors. He says that if you return with nothing, the man in the Gate is no worse off, and the warden's lads stay unpaid. He asks how much is owed in all, and whether the warden has any word from Vandarren's agent, such as a letter, a receipt or a name, that could be put before Thorn while there is still time.
> 
> Sefa stops just short of the doorstep with her hands open at her sides, and does not cross into the house. She tells the warden he has every right to be angry. She says eleven men leaving their tools behind are men trusting their warden to set things right, and she points at the upright sledgehammer. She says Maela Thorn is not his enemy, since by his own account her coin went into someone's pocket in Baldur's Gate, Vandarren's man's, before it ever reached this yard. She offers to carry the case back to Thorn before sunset, when her buyer would leave without it, and promises to put his grievance before Thorn as clearly as he put it to you. Or, she says, he can name whoever in the Gate takes Vandarren's money and tell you what proof he would need, and you will do what you can. She asks him plainly what it would take, right now, for him to let the box go back to Beregost with you.
> 
> You took the window frame, leaning on the sill, and spoke of your da and his hammer, then urged Osric to come along to Beregost, carry the case himself with his hand on it, and ask Thorn to her face who she paid and when. You asked him for Vandarren's man's name and said you know some doors in the Gate. All the while you were watching his face.
> 
> Osric hears all three of you out without moving. His hand stays flat on the lid. Only his eyes move, from Bram at the door to Sefa at the step to you at the window, and they rest longest on you while you talk about your father's hammer.
> 
> You watch him back, the way you would watch a doorman decide whether to let you in.
> 
> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Insight: is Osric straight about the wages and the case, and is there something he isn't saying?
> What adds to the die: +4 Insight
> DC 15
> Rerolls left: 2
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Pell's player wrote:**

> [Roll the die]

## player r2 card 1 (round 2)

**Screen:**

> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Insight: is Osric straight about the wages and the case, and is there something he isn't saying?
> What adds to the die: +4 Insight
> DC 15
> Rerolls left: 2
> Die: 10
> 10 + 4 = 14
> Failure — 14
> 
> [Onward] [Request an allowed reroll — Insight: is Osric straight about the wages and the case, and is there something he isn't saying?]

**Pell's player wrote:**

> [Onward]

## player r3 (round 3)

**Screen:**

> Osric breathes in through his nose and answers Bram first, because Bram asked for numbers.
> 
> "Sixty-one gold. Four silver. Eleven men, eighteen working days, cutters at cutters' rate." He nods at a shelf behind him, where a fat grey canvas ledger sits between a lamp and a crock of nails. "Tally-book has it to the copper." Then, to the rest of what Bram asked: "Name's Aubrin Teague. Vandarren's steward in the Gate. Counting-room off Windspell Street." He reaches under the lid of the bench, pulls out a folded, softened letter and flattens it on the table by the box. "His last. Five weeks back. *Wages to follow with the next cart.*" A short pause. "Cart came. Took salt. Brought nothing."
> 
> His eyes move to Sefa. He listens to the whole of what she says without interrupting, and he neither softens nor hardens.
> 
> "Didn't say Thorn's my enemy. Said she paid somebody. You say Vandarren's man. Maybe. Haven't seen it." He taps the letter once. "Your word's a good word, likely. Still yours. Not hers. Not Teague's."
> 
> Then he turns to the window, to you, and keeps his eyes on you a long moment.
> 
> "My own hand on it. Ask her to her face." Something in the set of his mouth eases, not into a smile. "That I'd do."
> 
> He gets up heavily, his hand still on the case, and looks out through the window past you at the yard: the cart, the frame, the row of sheds with shut doors, the dark mouth of the lower cut beyond.
> 
> "Can't walk off and leave her standing open, though." You understand he means the quarry. "Thirty years. Sheds locked. Frame pinned, ropes in. Mule-shed's empty, no matter. Sluice-gate in the low cut wants shutting, or the seep backs up the drain by morning." His eyes stay on the lower cut a little longer than on the rest. "Hour's work. Less, with hands."
> 
> He folds Teague's letter once and puts it inside his apron. Then he lifts the iron-bound box and tucks it under one arm as easily as a loaf, and takes the ring of keys from his belt. He comes out past Bram into the sun, pulls the house door shut and locks it from outside, case still under his arm. He sets off across the yard towards the first shed. Dust puffs white around his boots, and the lower cut waits at the far end of the yard. Its walls are stained darker than the rest of the quarry, and cool air drifts up out of it, smelling of standing water.
> 
> Where you are: by the window of the warden's house, quarry yard · Time: Day 1 · morning
> 
> Round 3 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell pushes off the sill and falls in beside Osric. He walks at the man's shoulder rather than behind him, glancing once at the box under his arm and then letting it be.
> 
> "Hour's work, less with hands. Let's make it less." He raises his voice just enough to carry back to the others. "Bram, you know a lifting frame from caravan yards? Pinning it and coiling the ropes is muscle work. Sefa, you could take the tally-book and the letter from him and count it against what he told us, so we've got it straight for Thorn." He glances at Osric. "If you'll let her. Your book, your call."
> 
> To Osric, quieter: "Sheds I can do fast. Give me the keys and point. Locks and I get on." He doesn't reach for the ring, just holds out a hand and waits.
> 
> Then he jerks his chin at the dark mouth of the lower cut, at its stained walls and the cool air coming up out of it.
> 
> "And I'll come down with you to that sluice. Never shut one. Want to see how it's done." His tone is easy and curious, but his eyes stay on the cut and the ground leading into it. He's looking for fresh tracks that aren't Osric's or the crew's, for water where water shouldn't be, for anything down there worth a long look from a man who's worked this pit thirty years. "Is it stiff, that gate? Or is something else wrong down there?"
> 
> He keeps a loose hand near his shortsword's hilt without touching it, and he walks on the side of Osric nearest the cut.

## player r4 (round 4)

**Screen:**

> You step up beside Osric, ask Bram to take on the lifting frame and ropes, and suggest Sefa check the tally-book and letter against what Osric told you. You ask for the keys and say you'll go down to the sluice, and you ask whether the gate is stiff or something else is wrong. Sefa, for her part, agreed to make the quarry fast and to let Osric put his own question to Maela Thorn. She offered to carry, haul or hold a light, and asked him whether anything lay in the cut besides the seep. Bram offered to help and asked about the footing, loose stone and deep water.
> 
> Osric gave Sefa a short sideways look when she offered a light, the first that seemed to take her for something other than trouble. "Fair." About the cut he said: "Water. Cold. Air sits heavy low down, so nobody lingers. You do the job and come up." It sounded like a rule he says so often he no longer hears it.
> 
> To Bram he gave a longer answer, pointing out the sheds, spoil heaps and the slope to the lower cut. The footing is good on the crew's track, planked where wet. The whole hill is old workings, some shored and some forgotten, so keep to the trodden dust. The top terrace has loose stone and nobody goes up there today.
> 
> He looked at your hand longer than at your face. Then he worked three square-headed iron keys off the ring, leaving the rest at his belt, and dropped them in your palm. "Square heads. Sheds. Back in my hand before we walk." The tally-book stays with him, because the house is locked and it goes to Beregost. Sefa can read it on the road, every line. He didn't take the letter out of his apron. To your offer to come to the sluice he nodded: "Suit yourself. Gate's stiff. Rust. Wants two hands on the wheel." He didn't answer whether anything else was wrong, and he wasn't looking at the cut as he left it unanswered.
> 
> The work goes dusty, simple and faster with more hands. Bram works the windlass and pin on the lifting frame, then walks the boom down onto its trestle, and coils the chalky hawsers. Sefa walks each rope out straight and carries the coils to the rope-shed.
> 
> You go down the row of sheds with the square keys. They are country padlocks, honest iron, made to keep goats and boys out. The tool-shed holds racks of wedges, feathers and spare hafts. The rope-shed fills as Sefa brings the coils. The mule-shed is empty, with a manger of hay and the smell of an animal that left yesterday. You snap each lock shut and tug it once.
> 
> The last shed is different. It stands lower than the others, at the head of the slope where the yard falls into the lower cut, built half into the hillside. Its door swells against the frame from the damp. Inside is a wet-weather cutting-shed: a long bench of half-dressed white blocks, chisels laid in a row, a water-butt. In the middle of the floor stands a cold iron brazier. The crust of ash in its bowl is pale pink, the colour of a rose petal left in the sun. A faint smell clings under the damp and chalk, sweet and dry, a little like burnt sugar and a little like flour. The floor is planked, the boards grey with age and stained dark along the wall nearest the cut.
> 
> Behind you, Osric has come down the slope with the box under his arm and stopped at the plank walk into the lower cut. Bram drops the last coil in the rope-shed, and Sefa comes back across the yard dusting her hands on her skirts. Below, the cut opens downward in stained steps, its walls darker than the rest of the quarry, until a sheet of still black water fills the bottom. At the water's edge stands a wooden sluice-frame with an iron wheel, its spokes red with rust. The cool air keeps rising out of it, steady as breath.
> 
> Your records, changed:
> Carried: + Square-headed Shed Keys
> 
> Where you are: at the low cutting-shed by the head of the lower cut · Time: Day 1 · morning
> 
> Round 4 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell stops in the doorway of the low shed instead of snapping the lock straight away. He breathes shallow through his nose and pulls the collar of his jerkin up over his mouth out of habit. Lower City cellars taught him not to gulp air that smells sweet.
> 
> He doesn't touch the brazier at first. He crouches beside it and looks: how deep the ash lies, whether there's anything unburnt in it, any scrap of wrapping, wax or cord like the box's seal. He wets a fingertip, takes the smallest pinch of the pink crust, rubs it, sniffs it at arm's length, and folds it into a twist of rag from his pouch. Then he moves to the dark-stained boards along the cut-side wall. Is the stain water seeping up from below, or something spilled or dragged? Are any boards newer, loose, or nailed differently from the rest? He runs a knife-tip along the seams to check whether one lifts, and he glances at the water-butt and the chisels to see whether someone was working here yesterday or not for weeks.
> 
> Without turning, pitched to carry to Sefa and no further: "Sefa. Come smell this, but don't breathe deep. Pink ash and burnt sugar. That's no stonecutter's fire."
> 
> Then he steps back out, pulls the swollen door to without locking it yet, and walks the few steps down to where Osric waits at the plank walk. He holds up the folded rag between two fingers, easy, not accusing.
> 
> "Your wet-weather shed. Somebody's been burning something in that brazier that isn't coal. Pink ash, sweet smell." He watches the man's face. "That the dye-salts? Thorn's goods? Or did somebody else have a fire down here?" A beat, glancing at the black water. "And is that why the air down there sits heavy?"
> 
> He keeps the third key in his hand rather than handing it back.
> 
> ? Investigation +4 on the shed: what was burned, and what's under the stained boards. Insight +4 on Osric's answer, if it's needed.

## player r4 card 1 (round 4)

**Screen:**

> Bram, at the head of the plank walk, studies the boards and supports of the way down to the wheel. He turns to Osric and presses him on the point you raised earlier: is there any trouble below beyond rust and foul air? The crew should know before they lay hands on the thing. He takes out his rope and suggests tying a line to whoever works the wheel, with another person paying it out from the top, so that a man who goes dizzy can be hauled up and nobody has to go down after him. He asks Sefa whether her light can burn without a flame.
> 
> Sefa stays up at the top of the walk and takes a flat white stone from the yard, turning it over in her palm. She says a quiet word over it, and a clean, steady light from the Lantern spreads across its surface. She tells you it won't smoke or sink low the way a lamp does, and holds it out for you to carry down or to rest beside you while you work the wheel. She touches two fingers to your wrist and murmurs a short prayer for steady hands. She says she will keep to the near side of the cut unless you call her. Then she crosses her arms and watches the walk and the black water, listening.
> 
> You stop on the threshold of the low shed and leave the lock alone. You pull your collar up over your mouth and nose and breathe shallow, then crouch beside the cold brazier without touching it.
> 
> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Investigation: what was burned in the brazier, and what the dark-stained boards along the cut-side wall are hiding
> What adds to the die: +4 Investigation
> DC 15
> Rerolls left: 2
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Pell's player wrote:**

> [Roll the die]

## player r4 card 1 (round 4)

**Screen:**

> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Insight: is Osric straight about the pink ash and the heavy air in the low cut?
> What adds to the die: +4 Insight
> DC 15
> Rerolls left: 2
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Pell's player wrote:**

> [Roll the die]
> 
> ? Two quick things. The Investigation card for the brazier and boards never showed me a result. Did that roll happen, or is it still waiting? And Sefa's prayer on my wrist sounded like Guidance. If it's still up, I'd like to put the +1d4 on whichever of these checks comes first.

## player r4 card 1 (round 4)

**Screen:**

> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Investigation: what was burned in the brazier, and what the dark-stained boards along the cut-side wall are hiding
> What adds to the die: +4 Investigation
> DC 15
> Rerolls left: 2
> Die: 7
> 7 + 4 = 11
> Failure — 11
> 
> [Onward] [Request an allowed reroll — Investigation: what was burned in the brazier, and what the dark-stained boards along the cut-side wall are hiding] [Request an allowed reroll — Insight: is Osric straight about the pink ash and the heavy air in the low cut?]

**Pell's player wrote:**

> [Request an allowed reroll — Investigation: what was burned in the brazier, and what the dark-stained boards along the cut-side wall are hiding]
> 
> ? Spending one reroll here, since that shed looks like it matters. If Sefa's Guidance is still up, please add the +1d4 to this reroll. If it isn't, just say so. The Insight card on Osric still looks pending, so I'll press that one once this resolves.

## player r4 card 1 (round 4)

**Screen:**

> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Investigation: what was burned in the brazier, and what the dark-stained boards along the cut-side wall are hiding
> What adds to the die: +4 Investigation
> DC 15
> Rerolls left: 1
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Pell's player wrote:**

> [Roll the die]
> 
> ? This card shows only +4. If Sefa's Guidance does apply, please roll the 1d4 separately and add it. If it doesn't, no problem.

## player r4 card 1 (round 4)

**Screen:**

> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Investigation: what was burned in the brazier, and what the dark-stained boards along the cut-side wall are hiding
> What adds to the die: +4 Investigation
> DC 15
> Rerolls left: 1
> Die: 16
> 16 + 4 = 20
> Success — 20
> 
> [Onward] [Request an allowed reroll — Investigation: what was burned in the brazier, and what the dark-stained boards along the cut-side wall are hiding] [Request an allowed reroll — Insight: is Osric straight about the pink ash and the heavy air in the low cut?]

**Pell's player wrote:**

> [Onward]
> 
> ? That's a pass at 20, so Investigation doesn't need Sefa's Guidance. If it's still up, please put the +1d4 on the pending Insight check on Osric instead. I'll roll that card next.

## player r5 (round 5)

**Screen:**

> The ash is a thin crust over ordinary coal clinker, and nothing else is in the bowl: no scrap of wrapping, no wax, no cord. At the bottom, where the fire never quite reached, a few grains survived. They are rose-white, glassy and coarse, like rock salt that has been left out in the sun. The crust breaks crisp under your wet fingertip, so the fire burned out days ago, not weeks. You hold the pinch at arm's length and sniff once, carefully. For a single breath your eyelids go heavy, the way they do at the end of a long night's work, though the morning is young and you aren't tired. You yawn behind your collar before you can stop it. Then the feeling is gone. You fold the pinch into a twist of rag and put it away.
> 
> The bench tells you the rest. There's yesterday's chalk on the chisels, and fresh dust on the half-dressed blocks. Men worked in here until the strike, in a shed that turns sleepy when its fire burns sweet.
> 
> The stain along the cut-side wall isn't spillage, and nothing has been dragged across it. It's water coming up from below. The nails in those boards are the same old square heads as everywhere else, and nobody has touched them in years. But when you slide your knife-tip into a seam, it sinks a finger's depth into the grain as easily as into cheese. You tap the board with the pommel and get a hollow sound back. A cold breath rises through the seam, smelling of the same standing water as the cut below. There's empty space under that floor, and the wood over it is rotten.
> 
> You step back out, pull the door to without locking it, and walk down to the head of the plank walk.
> 
> The walk is sound. The planks are thick and newer than the sheds, spiked into cut stone steps that drop in tiers towards the black water. The crew kept their track in repair. Only the last stretch is bare. At the bottom a broad ledge of wet stone runs along the water to the sluice-frame, dark with seep, and from up here nobody could say what lies under it.
> 
> Osric looks at the rag you hold up, then at you. He breathes in through his nose.
> 
> "Salt. Thorn's salt." He tips his head towards the cut. "Grows on the walls down there. Pink crust. Lads scrape it in the wet, I case it." He glances at the shed. "Chips get in with the coal. Fire burns sweet. Shed goes sleepy. Told 'em. No salt in the fire." He pauses. "Air's heavy. Always was."
> 
> You read him as you would read a doorman. The part about the salt comes out easily. He has said it before, and it costs him nothing. The last part is different. It isn't a lie, but it's a door shut on something. While he says it, his eyes are on the water and not on you, and he says it like a man who has stood at that edge and thought about it more than once.
> 
> Then Bram's question reaches him, with the rope already in Bram's hands, and the warden looks at the coil for a moment before he answers.
> 
> "Lost a man down there. Tobin Reed. Three years back." His voice stays level. "Four feet of water. Found him in it. Face down, like he'd gone to sleep." A short silence. "Drink, I wrote."
> 
> You catch the word *wrote*. Osric didn't say *was*. Whatever went into the book, he doesn't believe it himself.
> 
> "Line's good," Osric says to Bram, and he means it. "Wheel wants two hands on it. Me and one. Line on both. Down, wheel, up. Nobody sits."
> 
> He looks at the iron-bound box under his arm, then at the three of you. Then he bends and sets it on a flat block at the head of the walk, square in the sun, where anyone on the walk or at the wheel can see it. He leaves his hand on the lid a moment longer than he needs to. "Stays there."
> 
> He straightens up and holds out his hand for the end of Bram's rope. Below you the cool air keeps rising out of the cut, and on the ledge the rusted wheel waits by the still black water.
> 
> Where Sefa laid her fingers on your wrist, something warm and steady settled into your hands, and it's still there.
> 
> Your records, changed:
> Carried: + Twist of Rag with Pink Ash
> Conditions: Guidance (d4 to one ability check)
> 
> Where you are: head of the plank walk above the cut · Time: Day 1 · morning
> 
> Round 5 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell lowers the rag slowly and looks from the pink crust on the cut walls to the black water. Then he looks at Osric, and his voice has none of its easiness left.
> 
> "I sniffed that ash at arm's length, one pinch, and nearly yawned my jaw off." He taps the twist of rag in his pouch. "Your shed goes sleepy when it burns. Down there it's a whole wall of the stuff, wet, with the air sitting on it. I don't think Tobin was drunk." He leaves it at that. It isn't his to rub in.
> 
> He shrugs off his pack and pulls out his own coil of silk rope. "So we do it your way. Down, wheel, up, nobody sits. And a bit more." He soaks a strip of rag from his waterskin and ties it over his nose and mouth, then holds out another wet strip to Osric. "Wet cloth on the face. It won't stop it, but it won't hurt. And we count. Sefa, count out loud from up top. If either of us stops answering, or slows on the wheel, Bram hauls, no arguing."
> 
> He ties the silk rope around his own chest, under the arms, with a knot he can slip, and hands the free end to Bram. "You're the anchor. You've got the arms for two of us. Sefa, keep the light on our faces, not the water. I want you to see our eyes."
> 
> To Osric, short: "I'll be your second pair of hands. I'm light, and if I go soft Bram can pull me up like a sack of washing. Better me than him in chain in four feet of water."
> 
> Before he starts down, quieter, just to the warden: "One more thing. Floor in that low shed, cut-side wall, is rotten through and hollow underneath. Cold air coming up the seams. Old working under it?" He watches the answer. "Nobody stands on those boards till you've seen to it."
> 
> Then he steps onto the plank walk behind Osric, testing each tread. He stays on the crew's track, keeps one hand on the rope, and keeps his eyes on the ledge by the sluice-frame, looking for anything that isn't stone and water.
> 
> ? I'm keeping Sefa's Guidance for whatever check the wheel or the air throws at me down there.

## player r6 (round 6)

**Screen:**

> Bram said they should treat the air as foul rather than as drink. At the first sign of dizziness they would all return at once, and if either man dropped, nobody was to follow; the others were to haul. He tied a loop for Osric and one around himself with a fathom of slack between them, and asked you and Sefa to tend the line and keep it dry. He walked the free end down the plank walk to check its reach. The walk switches back across the stepped tiers, forty-odd feet of planking from head to ledge. With two men tied a fathom apart at the bottom, the tail of the fifty-foot line would end on the second tier from the top, and nobody could haul from there without standing on the walk. By his own rule he stayed at the top. Osric looked at the coil, then at the drop, and grunted. The loop stayed round his chest, and the hempen line runs from Bram at the head of the walk down to the warden.
> 
> Sefa said she would stand at the anchor end and watch the line. She offered to set a glowing word in the stone that would hover above the water if anyone let go of the line, and said that if a man went down, Bram should call her and she would bring him back if he could be brought. She took a post behind Bram's right shoulder with one foot braced on bare stone. She asked that only one man go down at a time. The lit stone in her hand throws its clean light down the first two tiers. When she said *one at a time*, Osric glanced back at her once and didn't argue.
> 
> Your words about the ash and Tobin landed on Osric and stayed there. He didn't answer. He breathed in through his nose, took the wet rag out of your hand, and tied it over his beard. When you asked about the shed floor, he looked back up the slope at the low shed. "Old working. Shed's built over the mouth of it." He paused. "Knew the boards were soft. On my list. Nobody stands there."
> 
> You tied your silk line under your arms with a slip-knot and pressed the free end into Bram's hand, over the hempen one. Then you followed Osric down.
> 
> The walk is as sound as it looked. The planks are thick and dry under the chalk, and every tread you test holds. Osric goes first and doesn't hurry. The air turns cooler at each tier, then heavy, the way a cellar's air is heavy. Through the wet cloth you catch the faintest sweetness, like flour in a cold bakery. The walls close in and the pink crust shows on them, running in ribbons along the seams and glittering wet where Sefa's light reaches.
> 
> At the bottom the planking stops and the ledge begins. Osric steps off, walks the ten feet to the sluice-frame without looking down, and sets both hands on the rusted wheel. You come after him, eyes on the ledge. It's dark with seep and slick with chalk mud, and the black water lies an arm's length to your right. The first step holds. On the second you feel the give an instant before you hear it. What looked like stone is a skin of chalk and seep over old timber, and the timber crumbles under your heel like wet bread.
> 
> The ledge opens under you.
> 
> You drop eight feet through a rush of rotten wood and wet chalk. The slack of the silk line pays out across the planks above, and the rope snaps taut around Bram's fist as you hit bottom. You come down hard on one hip and shoulder in cold water. It knocks the breath out of you and leaves you bruised and shaken, with nothing broken. Then the lip of the hole comes down after you. A squared block of white stone, dressed on its faces, tips off the broken edge, and its corner lands across your left shin under the water. It pins the leg to the floor of the working.
> 
> Above, the silk line hangs straight up through the hole with you on the end of it, and nobody can lift you while the stone holds.
> 
> Down here the water comes up to your chest. It's cold enough to make your teeth ache, and it's still, apart from a thin trickle of seep from a crack in the far wall. A tidemark of pink crust runs round the walls a hand's width above the surface. The working is a low chamber cut square, about the size of a small room, and the timber deck that rotted over it was laid across it a long time ago. The air is heavier here than it was at the ledge. The sweetness comes through the wet rag, faint and patient. Light falls in through the hole in a grey shaft, and in it you can see what holds you.
> 
> It's no fallen rubble. The block was cut to stand upright in the wall. It has fallen with its broad face tilted up out of the water, and on that face someone carved a sun a long time ago. It's a round disc with straight rays, and a ring of small, careful marks runs around it like a mason's tally. Where the block stood, the wall behind shows a patch of old grey plaster, smoother than the cut stone around it. One of the rotten deck-beams lies across the corner of the chamber, half sunk, black with wet but still whole.
> 
> The block's lower edge is rough-broken and jagged, and it has bitten into your leg. You can feel the weight pressing the torn flesh closed. A rogue who carries the potions knows what that means. The weight is the only thing holding the wound shut. When the stone comes off, the leg will open and bleed hard. Whoever moves it needs a healing ready the moment it shifts, a potion down your throat or Sefa's light on you, or you'll go under. One pinned man can't move a block that size alone. Two up top with a rope and that beam for a lever could do it in a few minutes.
> 
> On the ledge Osric has let go of the wheel. He's down on his knees on the stone he trusts, at the edge of the hole, with Bram's line tight across his back. He looks down at you in the water, then at the carved sun, and for a moment he doesn't breathe through his nose or anywhere else.
> 
> "Don't sit." His voice is rough. "Keep talking. Keep your head up." Then he shouts up the walk without turning: "Old working under the ledge! Bare stone's bad! Nobody comes on it but by the planks!"
> 
> The seep goes on trickling in through the crack in the far wall.
> 
> Your records, changed:
> Pell Dunmore: HP 28/33
> Conditions: Pinned: left leg under the sunburst block, Torn leg: bleeds hard when the block moves, Chest-deep in cold water
> 
> Your journal, new:
> + Thread: Pinned in the Flooded Working
> 
> Where you are: flooded old working under the ledge, leg pinned by a stone block · Time: Day 1 · morning
> 
> Round 6 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell gets his chin up and both hands flat on the block's carved face, bracing his weight off the leg so he doesn't grind it further. He doesn't try to shift it. He breathes slow and shallow through the wet rag and keeps his eyes open on purpose, fixed on the grey shaft of light.
> 
> Up the hole, loud and clear, so the walk can hear: "I'm all right! Leg's pinned, not broken! Listen, because this matters." He forces the words out evenly. "Stone's holding a cut shut. When it lifts, I bleed bad. My pack's at the head of the walk. Potions are in the side pocket, three of 'em. Bram, get one down to Osric on the line before anyone touches this block. Sefa, you be ready too. Whoever's closest when it shifts, pour."
> 
> Then, quieter, to Osric at the lip: "I'll keep talking, warden. You tell me if I start making less sense than usual."
> 
> While he waits, he works one-handed under the water. He pulls the belt off his waist, gets it round his left thigh above the knee, and cinches it hard. He knots it so it holds and twists a dagger-hilt through it as a windlass if it'll take one. A Lower City surgeon showed him that once on a man with a broken bottle in his leg. "Strap's on above the knee," he calls up. "That buys us a few breaths when it comes off."
> 
> He looks at the half-sunk deck-beam across the corner, measuring it. "There's a beam down here, still whole. If you drop me a second line, I'll loop it round the end and you haul it up for a lever. Wedge it under the block's top edge from the lip and pry *toward the wall*, not toward me. Don't let it roll back onto the leg." He grits his teeth through a shiver. "Count it off before you heave. I want to know when."
> 
> Then, because he has to keep talking anyway, he squints at the carving under his palms. "Osric, there's a sun cut on this stone. Disc, straight rays, ring of little marks round it like a tally. And plaster behind where it stood. Anybody ever say what this place was before it was a quarry?"
> 
> ? Two things. First: I shrugged off my pack at the head of the walk last round, and the potions were in it, so I'm assuming they're up top, not on me. Correct me if I'm wrong. Second: I'm holding Sefa's Guidance in reserve for whatever check the air or the cold throws at me, unless a roll comes up for something else first.

## player r6 card 1 (round 6)

**Screen:**

> Osric is flat on his belly at the lip of the hole. He doesn't interrupt while you call up that you're all right, that the leg is pinned and not broken, that the stone is holding a cut shut, and that the three potions are in the side pocket of your pack. You tell Bram to send one down to Osric on the line before anyone touches the block, and you tell Sefa to be ready too. When you get to the pack, the warden lifts his head and looks up the walk to the head of the cut, where the pack lies on the stone a stride from the sealed box, out in the sun.
> 
> "Pack's up top. By the box." He fills his chest and bellows up the walk, louder than you have heard him yet: "Flask! Side pocket of his pack! Down on the line to me! Nobody touches the block till it's here!" Then he lowers his eyes to you again.
> 
> You tell him quietly that you'll keep talking and he should say if you start making less sense than usual. Osric gives the hole a long, flat look. "Hard to tell."
> 
> Your palms are flat on the carved face of the block, taking your weight off the leg. The stone is cold and gritty with wet chalk. You breathe through the wet rag in short, even pulls and keep your eyes on the grey shaft of light coming down through the hole.
> 
> Under the water you work one-handed. You haul the belt out of its loops, feed it round your left thigh above the knee and draw it in. Your fingers have gone stupid with cold. Twisting a dagger-hilt through a strap is a trick you saw once, done by a back-alley surgeon on a dry floor, and never by a man chest-deep in cold water.
> 
> You have not yet called up the plan for the beam or asked about the sun carving, and no answer has come down about either.
> 
> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Wisdom (Medicine), unproficient, Wisdom +1: getting a belt tourniquet tight above the knee, one-handed and underwater, with numb fingers
> What adds to the die: +1 1d20+1
> DC 15
> Rerolls left: 1
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Pell's player wrote:**

> [Roll the die]
> 
> ? Change of plan on the Guidance. The tourniquet is the check that keeps me from bleeding out, so I'd like Sefa's +1d4 on this one, rolled separately and added. If it can't apply to this roll, just say so and I'll keep it.

## player r6 card 1 (round 6)

**Screen:**

> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Wisdom (Medicine), unproficient, Wisdom +1: getting a belt tourniquet tight above the knee, one-handed and underwater, with numb fingers
> What adds to the die: +1 1d20+1
> DC 15
> Rerolls left: 1
> Die: 12
> 12 + 1 = 13
> Failure — 13
> 
> [Onward] [Request an allowed reroll — Wisdom (Medicine), unproficient, Wisdom +1: getting a belt tourniquet tight above the knee, one-handed and underwater, with numb fingers]

**Pell's player wrote:**

> ? Before I press anything: Sefa's Guidance is listed under my Conditions, and in 5e the d4 can be rolled after the ability check is made. Could you roll the 1d4 separately and add it to this 13? Anything 2 or higher makes DC 15. If it comes up 1, or if Guidance can't apply here, tell me and I'll decide between the reroll and [Onward]. I'm holding both buttons until then.

## player r7 (round 7)

**Screen:**

> The strap is round your thigh and the buckle has bitten, but the leather is soaked and stretches as fast as you pull it. When you work the dagger-hilt through and turn it, the wet leather turns with it. The hilt spins loose and the strap slides back as slack as it went on. It holds nothing. You call up that the strap is on. The warden grunts and lets it go.
> 
> There is something else as your hands come up out of the water. The steady warmth Sefa pressed into your wrist before you went down is gone. The cold seems to have washed it out of you somewhere between the ledge and the bottom, and there is nothing left in your fingers but the ache.
> 
> You tell Osric about the beam. He turns his head and looks along the chamber at it for a long moment, measuring it the way he measures blocks. "Low edge. Rough side. Tip goes under." He says it to the water, then to you. "Toward the wall, yes. She falls that way anyhow. Weight's on the wall side." He breathes in through his nose. "Count it off. Three, then heave. You'll hear it."
> 
> There is no second line down here, and Osric settles that himself. He gets one hand round an iron spoke of the sluice-wheel, drags the hempen loop off over his head with the other, and lies there on the bolted rock with nothing tying him to anything. Above him the line still runs taut to the half-hitch on the rail-post. He pays out the slack hand over hand and lowers the end down the shaft. It splashes into the black water an arm's length from the near end of the beam.
> 
> You stretch until the pinned leg protests, get the end under your fingers and take it twice round the timber with a knot you could tie in your sleep. Osric draws the slack up and leans his weight back. The beam comes out of the corner reluctantly, streaming water and black rot. He walks it in until its butt rises against the broken lip of the hole and its tip hangs in the water a foot from the jagged edge of the block. He holds it there without letting it go any closer.
> 
> "Not yet." He wedges the rope under the sluice-frame's foot. "Not till the flask's in my hand."
> 
> Then he looks down at the carving under your palms, at the disc and the rays and the small marks running round it like a tally. He looks for a long time. Plainly he has never seen it before in his life.
> 
> "Thirty years. Never knew that was there." He doesn't look away from it. "Always a quarry. Long as there's been a Beregost." A pause. "Old men said the Song's first stones came out of this hill. Temple's. Lathander's lot." He looks at the patch of grey plaster on the wall, the one dry thing in the room, and says nothing about it.
> 
> The sweetness in the air sits under the wet rag, faint and patient. Once, between one word of Osric's and the next, your eyelids drag the way they do at the end of a long night on the roofs. The cold in your teeth jerks you out of it. The seep keeps trickling through the crack in the far wall, and the pink tidemark is a hair nearer the water than it was.
> 
> Where you are: chest-deep in cold water at the bottom of the sluice chamber, leg pinned under the carved block, Osric above at the hole's lip · Time: Day 1 · morning
> 
> Round 7 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell spits a mouthful of chalky water past the rag and calls up straight away, because a lie about this kills him.
> 
> "Warden, correction. The strap's no good. Wet leather's stretched and the twist won't hold. Count it as nothing." He gets the heel of his hand under the water, finds the soft hollow high on the inside of his left thigh, and leans his weight into it, hard, the way you'd hold a door shut. "Holding it with my hand instead. Better than nothing, not much."
> 
> He jerks his chin at the pink tidemark. "And the water's coming up. Slow, but it's coming. That crack's feeding it, so we don't wait any longer than we have to."
> 
> Then louder, up the shaft to Bram and Sefa: "Flask comes to *me*, not to Osric! Bram, tie it in a loop of cord round my silk line and let it slide down. The line runs straight to me. I'll hold it uncorked, and the moment the stone shifts it's down my throat. Quicker than anyone can reach me." He takes a breath. "Sefa, after the heave, you're the second shot. If I'm still bleeding, bring your light."
> 
> To Osric, between clenched teeth: "When the flask's in my hand, you count three and heave toward the wall. Don't stop for me shouting. I'll be shouting."
> 
> His eyelids drag again. He bites the inside of his cheek hard enough to taste copper, scoops cold water over his face with his free hand, and keeps talking just to keep talking. "Lathander's lot, you said. First stones of the Song. So somebody sealed a sun in this wall and plastered behind it." He squints at the grey patch. "That's not a quarry thing. That's someone hiding a door. We'll look at it after I've got two legs, eh?"
> 
> He keeps his eyes open on the grey light and holds his free hand up out of the water, ready to catch the flask.
> 
> ? Understood on the Guidance. It ran out while I was down here, no argument. I'll take [Onward] on the tourniquet failure. I'm keeping my last reroll.

## player r8 (round 8)

**Screen:**

> Osric, the warden, takes your correction about the strap without a blink. "Strap's nothing," he says back.
> 
> Under the water you find the hollow high on the inside of your thigh, where the pulse runs close under the skin, and lean the heel of your hand into it. The cold has numbed the leg so badly that you can't tell how much good you're doing. For now the stone is still doing most of the work, and you know it.
> 
> When you nod at the tidemark, Osric turns his head. He follows the pink crust along to the crack in the far wall, where the trickle comes through thin and steady, then looks back at you. He doesn't argue.
> 
> You shout up about the flask: tie it round your silk line, slide it down, straight to you. Osric hears you out. He looks at the silk line where it runs taut up through the hole, a hand's breadth from your raised fingers, and works the reason out as he would a load. "Your line. Runs to you. Your throat. Quicker." He fills his chest and sends it up the walk after your shout, louder and rougher, that the flask goes down your line, not his, to you. Then he settles back on his belly with one hand on the wheel-spoke and the other on the butt of the beam.
> 
> To your quieter instruction he gives a single nod. "Flask in your hand. Three. Heave to the wall." His eyes stay on your face. "You shout. I don't stop."
> 
> Your eyelids drag again, slower this time, like a curtain being drawn on purpose. You bite the inside of your cheek until you taste copper and throw a palmful of cold water over your face. The cold jerks you awake, and you keep talking.
> 
> When you say *hiding a door*, Osric's eyes go to the grey plaster and stay there. A drop of seep runs down the cut stone beside it, darkening the stone as it goes. It reaches the edge of the plaster and goes around it, as if the plaster weren't wet at all.
> 
> "After," is all he says.
> 
> Grey light comes down the shaft onto your upturned face and your free hand, held up out of the water. Somewhere above, at the head of the walk, the pack lies in the sun beside the sealed case. The trickle keeps coming through the crack in the far wall. Since you first saw it, the water has crept up the pink tidemark again, by about the thickness of a fingernail.
> 
> Your records, changed:
> Carried: + Potion of Healing; + Potion of Healing ×2; − Potion of Healing ×3
> 
> Where you are: in the flooded chamber at the bottom of the shaft, pinned under the stone, with Osric on the walk above · Time: Day 1 · morning
> 
> Round 8 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell keeps his free hand high on the silk line where it runs taut above his fingers, watching for the flask to come sliding down out of the grey light. His other hand stays buried at his thigh, leaning into the pulse point.
> 
> When it reaches him, he closes his fist round it, gets the cork between his back teeth through a fold of the rag and pulls it, and spits the cork into the water. He holds the open flask against his chest, upright, just under his chin, so nothing slops out when the block goes.
> 
> "Got it! Flask's in my hand, cork's out!" he calls up the shaft, loud enough for the walk to hear too. "Sefa, Bram, we're heaving now. Be ready on the line. If I go under, haul me up the second the stone's clear, block or no block."
> 
> Then he looks up at Osric, steady, and draws one slow breath through the wet cloth.
> 
> "Right, warden. Your count."
> 
> He braces his good foot against the chamber floor so he can shove himself away from the block the instant it lifts, and he keeps the heel of his hand hard on the inside of his thigh. The moment he feels the weight come off, he means to tip the flask down his throat. He won't stop to look at the leg first.
> 
> "And Osric," he adds through his teeth, "if it rolls back toward me, let it fall. Don't try to catch it."
> 
> ? Two things. The records show my potions reshuffled: one listed separately, two together. Is that one now in my hand, slid down the silk line? I've written this round as if the flask has reached me. If it hasn't, read it as Pell waiting with his hand up and calling the count only once it arrives. Also, drinking it is a bonus action by the campaign rules, with Fast Hands too. I want it to go down the same instant the block shifts, before the bleeding takes hold.

## player r9 (round 9)

**Screen:**

> You keep your free hand up on the silk line, where it runs taut a hand's breadth above your fingers, and you watch the grey light at the top of the shaft for anything sliding down. Your other hand stays under the water, the heel of it pressed hard into the hollow high on your thigh. You set your good foot against the floor of the working, behind and to one side, so you can shove yourself away from the block when it moves.
> 
> Nothing comes down the line.
> 
> Looking straight up past the broken lip, you can see the underside of the last sound plank. Sefa's stone glows there, steady and white. Beside the foot of the rail is a small red glint, a flask standing upright on the wood. It is still up there, not on the line and not in your hand. The silk runs past it, taut and empty.
> 
> Osric lies flat on his belly on the sluice side, one fist round the wheel-spoke and his palm on the butt of the beam. He follows your eyes up the shaft to the red glint and back down. He doesn't push.
> 
> You tell him through your teeth that if the stone rolls back he should let it fall and not try to catch it. The warden gives a short nod.
> 
> He says he won't catch a block, that he did it once when he was young and it cost him two fingers. He doesn't show which hand. Then he says the flask comes first, and after that the count of three.
> 
> The beam stays where he holds it. Its rotten tip hangs a foot short of the block's rough lower edge, and water drips from it onto the black surface.
> 
> The cold goes on working into you. Your teeth ache with it, and your raised arm starts to burn from holding still. The sweetness under the wet rag hasn't gone anywhere. Somewhere in the waiting your eyelids drag again, slower than before, and you only notice because the grey light at the top of the shaft has dimmed for a moment. Then the ache in your teeth brings you back. The light is bright again, the flask is still standing on the plank, and the silk line is still empty above your fingers.
> 
> The trickle keeps coming through the crack in the far wall. The pink tidemark is that much nearer the water.
> 
> Where you are: in the flooded working at the shaft's foot, pinned under the block, with Osric beside him · Time: Day 1 · morning
> 
> Round 9 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell sees the red glint on the plank and swears softly into the rag. Then he fills his lungs and shouts up the shaft, slow and clear so nobody can mishear him:
> 
> "Flask's on the bottom plank! By the rail foot! It's standing there, it's not on the line! Whoever's nearest, *tie it to the silk and let it slide*. Cord, bootlace, anything. Loop it round the line and let go. It'll find me."
> 
> He gives the silk line three sharp tugs, so whoever holds the anchor end feels it in their hands.
> 
> Then, lower, to Osric, without taking his eyes off the glint: "Warden. Can you reach it from where you lie, without leaving good rock? If you can, just drop it down the shaft to me. I'll catch it, I've caught worse falling off roofs." A breath. "If you can't, don't stretch for it. I'm not worth your two other fingers."
> 
> He shifts his raised arm to rest the wrist against the silk so it stops burning, and keeps the heel of his other hand hard in his thigh.
> 
> "And tell them up top I'm going slow," he adds, quieter, honest about it. "The air's getting at me. Lights went dim on me just now. If I stop talking, that's not me being sulky. Haul."
> 
> He keeps his eyes open on the red glint and starts counting under his breath, one, two, three, over and over, just to have something to hold on to.

## player r10 (round 10)

**Screen:**

> Your voice goes up the shaft slowly and the walls hand it back to you twice. You tug the silk line three times, hard. It doesn't give at all. It runs up through the hole stiff as a bar and doesn't twitch the way a rope does in a hand. That isn't a person at the other end. It's a knot on a post.
> 
> You ask Osric whether he can reach the flask and drop it down to you. He doesn't leave the rock. "Can't. Hole's between." His palm stays spread on the butt of the beam. When you tell him you aren't worth his other two fingers, his eyes stay on your face. "Got eight. Not spending 'em on you."
> 
> Then he looks up, and so do you.
> 
> The red glint is no longer on the plank. It is coming down the shaft, past the jagged rim of rotten timber and the pink ribbons glittering wet on the walls. It hangs upright in the empty air, a good arm's length from the silk line, touching nothing. Something holds it by the neck, a faint ripple in the grey light like air over a summer roof. It drops steadily, a hand's breadth at a time, and stops a finger's width above your raised palm. The red glass catches the light from above and stays there.
> 
> Osric watches it hang and says nothing about how it got there. He passes your message up the walk the way you gave it, his voice rough off the walls: you're slow, the air is at you, and if you stop talking they haul. Then he turns back to the hole. "Heard you. Keep counting."
> 
> You rest your wrist against the silk and the burn in your raised arm eases. The heel of your other hand stays buried in the hollow of your thigh, and you can no longer feel the leg below it. You count under your breath, one, two, three, the same three over and over.
> 
> The shimmer holding the flask wavers once, like heat-haze when a cloud crosses the sun. The red glass dips a hair toward your palm, then steadies. Above, the beam's rotten tip still hangs a foot short of the block's rough edge, dripping into the black water. At the far wall the seep keeps coming through its crack, and the pink tidemark is that much closer to the surface.
> 
> Where you are: at the bottom of the shaft, beneath the hole, with Osric on the rock above · Time: Day 1 · morning
> 
> Round 10 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell doesn't snatch, because snatching knocks things away. He closes his fingers slowly round the neck of the flask, just under the shimmer, and feels the weight settle into his hand.
> 
> "Got it. Whoever that is, thank you." He gets the cork between his back teeth through a fold of the rag, pulls, and spits it into the water. He holds the open flask upright against his chest, just under his chin.
> 
> Then he shouts up the shaft, slower now, because the words want to slur: "Flask's in my hand! Cork's out! And listen, my silk's tied off on a post, nobody's holding it. Somebody take it in hand *now*. If I go under, a post can't haul me."
> 
> He waits a breath to see whether the line twitches and changes from a bar into a rope.
> 
> He sets his good foot against the floor again, keeps the heel of his hand buried in his thigh, and looks up at Osric.
> 
> "Your count, warden. Three, heave to the wall. I drink the moment it moves." His eyes drag. He bites his cheek again, tastes copper, and blinks hard. "Go."
> 
> ? The flask goes down my throat as a bonus action, with Fast Hands, the instant the block shifts. On my action I'll shove myself clear of the block with the good leg. If Pell drops to 0 or goes under, my next priority is the silk line being hauled.

## player r11 (round 11)

**Screen:**

> You close your fingers slowly round the neck of the flask, and as they close, the faint hold on the glass lets go. All the weight is in your hand now, cold and slippery. You work the cork loose between your back teeth through a fold of the wet rag and spit it out. It bobs once on the black water and drifts off towards the far wall. You hold the open flask upright against your chest, just under your chin, where nothing can knock it.
> 
> Your thanks goes up the shaft to whoever it was. Osric hears it, glances once at the empty air where the shimmer was, and says nothing.
> 
> Then you shout up the rest, slower than before, placing each word so it doesn't slur: the flask is in your hand, the cork is out, your silk is tied off on a post with nobody holding it, and somebody must take it in hand now, because a post can't haul you. Osric listens to every word. When you get to the silk, he lifts his head and looks up the line to where it disappears over the broken lip. Then he sends your message on up the walk, rough and loud: the line is on the post, somebody take it in hand.
> 
> You wait a breath with your wrist against the silk. It stays as stiff as a bar and doesn't twitch.
> 
> You set your good foot against the floor again, keep the heel of your hand buried in your thigh, and tell Osric the count is his: three, heave to the wall, and you drink the moment the block moves. He looks down at you, then at the rope running taut along the rail above to the place where Bram stands.
> 
> "Not mine. Rope's on hers." He jerks his chin up the shaft. "She counts, he hauls, I heave. All three or nothing moves." He fills his chest and sends it up, short and hard: "He's got it! *Count!*"
> 
> He settles flat on the bolted rock with his fist round the wheel-spoke and spreads his other palm on the wet butt of the beam, leaning his shoulder in behind it. He isn't pushing yet, but his whole weight is set where it will go when it goes. His eyes come back down to your face and stay there.
> 
> "Bite harder," he says. "Nearly."
> 
> The open flask sits under your chin, and the sweet smell of the air is in your nose under the rag. The grey light at the top of the shaft goes soft at the edges for a moment and then sharpens again. Above you the beam's rotten tip hangs a foot from the block's rough edge and drips into the water. At the far wall the seep keeps trickling through its crack, and the cork floats on the black water near it.
> 
> Your records, changed:
> Pell Dunmore: HP 33/33
> Conditions: Chest-deep in cold water
> 
> Where you are: in the flooded working at the shaft's bottom, pinned by the block, with Osric beside him · Time: Day 1 · morning
> 
> Round 11 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell bites down on his cheek again, hard, and the copper taste keeps the grey light sharp. He presses the open flask flat against his breastbone with his thumb over the mouth, so a jolt won't spill it.
> 
> "Sefa!" His voice goes up the shaft hoarse but whole. "I'm ready. Your count. Loud, so I hear the three."
> 
> To Osric, lower, eyes on the beam's dripping tip: "Hers to count, yours to heave. I'll stay out of your way."
> 
> He sets his good foot against the floor, plants his shoulder blades against the cold water, and waits. His free hand stays buried in the hollow of his thigh. He doesn't look at the leg. He looks at the edge of the block where the beam will bite, and he mouths the count along with whatever comes down from above.
> 
> The instant he feels the weight shift, he tips the flask back and drinks it all in one swallow. Then he shoves himself away from the block with the good leg, toward Osric's side and away from the wall where it will fall. "Haul!" he gets out, if he can still get anything out.
> 
> ? Out of game: the last records update shows me at HP 33/33 with Pinned and Torn leg removed, but the narration has the block still on my leg and the potion still unopened under my chin. I've played it the way the narration describes, waiting for the heave, and I'm assuming the records update was a slip. If it wasn't, and the potion and the lift already happened, tell me and I'll adjust. As before, the drink is a bonus action with Fast Hands, and the shove clear is my action.

## player r12 (round 12)

**Screen:**

> You call up the shaft that you're ready and tell Osric the heaving is his and you'll keep out of his way. Osric nods once, eyes still on the beam. You brace your good foot, set your shoulders against the cold water, and wait with the flask pressed to your breastbone.
> 
> The count that comes down the shaft is Bram's, not Sefa's: *one*, booming off the stained walls, then *two*. Under it Sefa's voice keeps a slower beat, *stay with the light*, steady as a ward clock. You mouth the numbers along with Bram. On *three* the hempen line jerks taut over the lip. Osric gets his shoulder in behind the butt of the beam and grunts, and the rotten tip drives down under the block's rough lower edge.
> 
> The weight comes off your leg all at once.
> 
> You tip the flask back as you feel it go and get it down in one swallow. The potion is warm and thick, and it tastes of iron. With the good foot you shove yourself back through the water towards Osric's side. Behind you the block goes over with a slow, heavy roll. It lands face to the wall with a crack you feel through the floor of the working, and a wave slaps across the chamber.
> 
> Then the leg opens. You feel the heat of it before any pain, and the water around your thigh turns black.
> 
> Light comes down the shaft. It's warmer than the white glow of Sefa's stone, the colour of a lamp turned up in a dark room, and it settles on you in the water and stays. The heat in the leg stops, then turns into something like sun on cold skin. The ache the drop left in your hip and shoulder goes, and so does the bitten shin. The cold that had got into your teeth lets go of them too. When you put your free hand down to your thigh there's no wound under your fingers, only torn cloth over smooth skin. The cloud in the water stops spreading and begins to thin. The potion's warmth is still in your chest, with nothing left for it to do.
> 
> From down here you see something the others can only see from above. As the light falls into the working, the square of old grey plaster on the wall, an arm's length from you, takes it in. It doesn't shine back like wet stone. It flushes like milk-glass with a candle behind it and goes on glowing faintly for a breath after the rest of the chamber has gone grey. Then it's plaster again, dry and dull, with the seep running around its edges.
> 
> "Haul!" you get out, and it comes up the shaft in a whole voice.
> 
> The silk line runs straight up from your chest through the hole. It's still stiff as a bar, and nothing pulls on it.
> 
> Osric lies flat on the sluice-side rock with his palm still on the butt of the beam. He lets go of it slowly, finger by finger, like a man who doesn't trust a stone to stay where it has fallen. He looks at the block lying against the wall, then at you standing free in the water, and then up the shaft towards the light. His mouth opens and closes again.
> 
> "Off him." He breathes in hard through the wet rag. "Off."
> 
> The water settles against the walls of the working. The pink tidemark glitters a hand above the surface, and the sweet smell is still there under everything, faint and patient. At the far wall the seep goes on trickling through its crack.
> 
> Your records, changed:
> Carried: − Potion of Healing
> 
> Where you are: in the flooded working at the shaft's bottom, freed from the block, with Osric · Time: Day 1 · morning
> 
> Round 12 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell lets out a breath that's half a laugh and half a shudder and flexes the leg once under the water. It's whole. He doesn't trust it to stay that way down here.
> 
> "Off," he agrees, hoarse. "And out. Before this air finishes what the stone started."
> 
> He wades the arm's length to the plaster square anyway. He can't help it. He raps it twice with his knuckles, listening for hollow, and lays his palm flat on it for a single breath to feel whether it's warm, or dry, or anything but plaster. He doesn't scrape or pry. "Glowed when her light hit it," he tells Osric, short. "Not stone. Later. With fresh air and a lamp and nobody sleepy."
> 
> Then he takes the silk line in both hands. A rope tied to a post is a rope he can climb. He sets his good feet against the chamber wall and goes up it the way he went up drainpipes above the Wide, hand over hand, fast and steady, past the jagged lip and onto the last sound plank. He keeps to the planking and doesn't put a toe on the bare ledge.
> 
> The moment he's up, he crouches, pulls the wet rag off his face and gulps the cleaner air. Then he looks up the walk towards the warm light.
> 
> "Sefa. That was you." He touches his thigh through the torn cloth. "I owe you a leg. And whoever walked that flask down on thin air, I owe you a drink." He glances along the walk, curious which of them it was, but doesn't press.
> 
> To Osric, still flat on the sluice-side rock: "Warden, come back to the planks the way you went, slow, on the stone you trust. That gate can wait one more minute while we think about how to shut it without anyone standing on bare ledge." A beat, wry. "Whatever the old men said about Lathander's lot, somebody put a sun in your hill and plastered over it. Maela Thorn's buyer might want her salt. The Song of the Morning might want to know about that wall."
> 
> He squints up at the sun's height over the rim of the cut, counting the hours back to Beregost, and starts coiling the slack of his silk line.

## player r13 (round 13)

**Screen:**

> You flex the leg under the water. The knee bends and the foot answers. Under the torn cloth the skin is smooth, and the leg takes your weight on the floor of the working as if nothing had happened to it.
> 
> You wade the arm's length to the plaster square anyway. You rap on it twice. The cut stone beside it gives back a dead, solid knock. The plaster sounds different: a short, thin, hollow note, like a cupboard door with nothing heavy behind it. You lay your palm flat on it for one breath. Everything else down here is wet and cold enough to ache. The plaster is dry, chalky and fine, and it isn't cold. It's no warmer than a wall a fire was lit against hours ago and has since gone out, and the warmth fades even as you feel it. You don't scrape at it or pry.
> 
> You tell Osric the plaster glowed when the light hit it. He doesn't take his eyes off it.
> 
> "Saw."
> 
> That's all he says about it.
> 
> You take the silk in both hands and climb, feet against the wall, hand over hand. The line holds as steady as a drainpipe bolted to brick. At the top the jagged lip crumbles under your boot. A slab of black rot the size of a bread-board breaks off and slaps into the water below, but your weight is on the rope and not on the rim. You swing a knee over the end of the planking and are on the last sound plank, on wood that holds, with Sefa's stone glowing a stride away. You crouch there dripping and pull the rag off your face. The air up here still smells of chalk and seep, but nothing sweet sits under it, and it goes down like water after a long run.
> 
> Your words go up the walk to whoever they're for.
> 
> Across the hole, Osric pushes himself up off his elbows onto his knees on the bolted rock when he hears *the way you went*. He looks at the gap between himself and the planks: eight feet of open water and rotten rim, and the place where the ledge used to be.
> 
> "Way I went's down there."
> 
> He doesn't sound bothered by it. He turns to the sluice-wheel, sets both broad hands on the rusted spokes and leans into it. His shoulders bunch under the apron and the wheel doesn't move a hair. He lets go and looks at his palms, red with rust.
> 
> "Two hands, I said. Meant two men." He wipes his palms on the apron. "Spare walk-planks. Twelve foot. Stacked back of the tool-shed." He jerks his head up the cut at the yard. "Your key."
> 
> You talk about the sun in the hill and the Song of the Morning. Osric looks down through the hole at the dark water, where the block lies with its carved face to the wall.
> 
> "Temple'd want it back," he says after a while. "Whatever it is." About Thorn's buyer he says nothing at all.
> 
> You squint up over the rim of the cut. The sun is still climbing and well short of noon, and its light lies white across the top of the walk where the pack and the sealed case sit side by side on the stone. Half a day's road to Beregost leaves room before sunset. It doesn't leave room for a long morning here. You coil the slack of the silk at your end, wet and heavy in your hands. Below, the cork turns slowly by the far wall, the seep keeps trickling through its crack, and the water creeps up toward the pink tidemark.
> 
> Your records, changed:
> Carried: + Wet Face-Rag
> Conditions: Soaked through
> 
> Where you are: on the last sound plank of the walk above the flooded working, across the gap from Osric · Time: Day 1 · morning
> 
> Round 13 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell straightens up on the plank, wrings the worst of the water out of his sleeves, and nods across the gap.
> 
> "Twelve-foot planks, back of the tool-shed. On it." He pats the square keys in his pouch to make sure they came through the swim. "Warden, put Bram's loop back round your chest while you wait. You're sitting on the only good rock left down here, and I've just seen what the rest of it does."
> 
> He starts up the walk at a quick, careful trot, staying on the planking, and calls ahead as he climbs:
> 
> "Bram! Two planks from the tool-shed. I'll open it, you carry, they'll be heavy. We lay them from the bottom plank across the hole to Osric's rock, side by side, ends lashed so they can't skid. Then I go over and take the other hand on that wheel." He looks back down at the rusted sluice and the rising tidemark. "Two men, two hands each. If it still won't turn, we leave it and he writes *seep* in his book instead of *drowned*."
> 
> At the top he spares a glance for the pack and the sealed case in the sun, both still where they were, and a quick, crooked grin for Sefa. "Still owe you a leg." Then he's across the yard to the tool-shed, keys out, opening the padlock.
> 
> At the back of the shed he picks the two soundest planks he can find. He checks each for rot with a thumbnail and a knock before Bram takes one. He grabs a short length of cord or spare rope from the racks for lashing as well.
> 
> "Quick as we can," he says to the others, squinting at the sun. "Gate shut, keys back in his hand, and on the road by noon. Thorn's coach won't wait for heroes."

## player r14 (round 14)

**Screen:**

> You wring the worst of the water out of your sleeves onto the planking and pat your pouch. The three square keys are still there, cold and wet.
> 
> Osric hears you out about the loop. He looks at the hempen line where it comes down over the far lip and into the black water. It's tied twice round the beam lying in the hole, out of his reach.
> 
> "Rope's on the beam. Beam's down there." He shifts onto his belly beside the sluice-frame and gets one fist round an iron spoke of the wheel, his elbow hooked through behind it. "Holding iron. Bolted in rock. Go."
> 
> Your remark about writing *seep* in his book instead of *drowned* reaches him too. He doesn't answer it. He works his jaw once and looks at the wheel.
> 
> You take the walk at a quick, careful trot. The planks are dry under the chalk and every tread holds, as on the way down. The air thins and warms with each switchback until the sun hits you at the top, and your soaked jerkin starts to steam. Your shout about the two planks, lashed side by side across the hole, booms down the walk ahead of you and comes back off the walls. On the block at the head of the walk the sealed case sits where Osric left it, square in the light, with the pack beside it. You toss a crooked grin back down the walk and head across the yard.
> 
> The tool-shed padlock is the same honest country iron as before, and it opens with a turn of the key. Inside it's dim and smells of oil and dry ash-wood: racks of wedges and feathers, spare hafts stacked like kindling. On the inside of the door, at eye height, somebody has drawn a mule in chalk. It's lopsided, its ears are too long, and a sack is slung over its back. Underneath, in big leaning capitals, someone has written PAY THE MULE. Someone else has added a second, smaller *ALSO US* below it.
> 
> The planks are at the back, stacked on two trestles to keep them off the floor. There are six, twelve-foot walk-planks as thick as a man's hand is wide and grey with age. You work down the stack with thumbnail and knuckles. The top one rings sound. The second has a split running a third of its length from one end, so you leave it. The third and fourth are both good, hard to the thumbnail all along and solid under a knock from end to end. You haul the two good ones off the trestles one at a time, heavy enough that you take each by one end and walk it round. Both end up leaning by the door with their ends in the sunlight. From a nail by the haft-rack you take a hank of tarred cord, the stuff the crew used to bind haft-heads, and sling it over your shoulder.
> 
> Outside, the sun stands well up over the eastern rim of the quarry. It's still a long way short of noon, and white dust drifts across the empty yard. Down at the far end the cool air still rises out of the lower cut.
> 
> Your records, changed:
> Carried: + Hank of Tarred Cord
> 
> Where you are: Tool-shed doorway in the quarry yard, with two planks and cord · Time: Day 1 · morning
> 
> Round 14 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell takes one look at the chalk mule and snorts. *PAY THE MULE. ALSO US.* He taps the drawing with a knuckle on his way past, the way you'd touch a shrine for luck.
> 
> "Bram!" he calls across the yard. "Planks are out, two good ones. Take one, I'll drag the other." He snaps the padlock shut on the tool-shed, tugs it once, and gets his shoulder under the end of the second plank. He's no ox, so he walks it more than carries it, one end bumping in the dust behind him.
> 
> At the head of the walk he stops for one breath by the pack and the case and checks both by eye: case sealed, cord and wax as they were. Then he starts down with the plank, careful on the switchbacks, calling ahead before he's in sight:
> 
> "Coming down, Warden! Two planks, cord for lashing. Hold your iron."
> 
> On the last sound plank he crouches and sets to work quickly. He lays the first plank's end on the sound planking, then pushes it out across the hole by inches until the far end grounds on Osric's bolted rock. He feels for it to sit flat and not rock, and calls "Warden, tell me when it's on solid stone, not rim." Then the second goes alongside it. He lashes the near ends together with the tarred cord, and lashes them both to the rail-post or the end of the sound planking, whatever's spiked in, with tight turns and a knot that won't slip when wet.
> 
> Before he steps out, he unties his silk line from the post, makes a fresh loop round his own chest, and hands the free end up to Bram. "Hold it in your hands this time, not on a post." He passes the second hank-end of tarred cord, or the coil's slack, out across the bridge to Osric. "And you, tie on to something before I come over."
> 
> Then he crosses: low, feet square, one at a time, weight in the middle of the two boards, eyes on the far end and not the water. On the rock he plants himself beside Osric at the wheel and sets both hands on the rusted spokes.
> 
> "Two men, two hands each, like you said." A crooked grin through the drying chalk on his face. "Your count this time."

## player r14 card 1 (round 14)

**Screen:**

> Bram came down the walk testing the treads and knocking his shield on the rail at the turns. By the time he reached the yard the tool-shed door already stood open, and two grey planks leaned beside it. He ran a thumbnail along each and knocked on them, found both sound and ringing, and shouldered the first as if he'd carried timber all his life.
> 
> You tapped the chalk mule on your way out, snapped the padlock shut, tugged it once, and walked the second plank across the yard with its back end scraping white furrows in the dust.
> 
> Sefa had already gone up the cut with the glowing stone under one arm, keeping the hempen line along the foot of the rail so no loop could catch a boot. Halfway up she called down to the warden, asking whether he could take the planks on a rope or whether someone had to step out with an end. Osric answered, short and flat, that you should push them over and he would take the ends.
> 
> At the second switchback she stepped into the angle of the rail to let you and Bram pass with the timber. As you went by she told you quietly that the Lantern had sent the light and she had only aimed it, and that your drink could come out of Maela's coin if you were quick about it. Then she went on up into the sun. At the head of the walk the sealed case and your pack sat side by side on the block. You spared them one look: the cord was still crossed and the grey wax unbroken.
> 
> You called down a warning to the warden, slipped your silk line off the first rail-post and coiled it as you went. You and Bram set the planks down on the last sound tread with a double thump.
> 
> Bram asked Osric where they would bear. The warden laid his whole palm flat on the rock beside the foot of the sluice-frame, a long stride back from the crumbling rim. "Here. Where the bolts go in. Not the edge. Edge is rot under chalk."
> 
> Bram slid the first plank out across the hole, kneeling on the butt end with his weight back and feeding it out a forearm at a time while you steadied it from the side. It crossed eight feet of open air above the black water, passed over the broken rim without touching it, and grounded where Osric's hand lay. Osric thumped it with the side of his fist and rocked it. It didn't move. "Rock."
> 
> The second plank went over beside it the same way, and Osric thumped that one too. You bound the two near ends together with tarred cord, then to the nearest rail-post with a knot that only tightens when wet, and tossed the rest of the hank across to Osric, telling him to tie on before you came over.
> 
> He caught it and lashed the two far ends to the foot of the sluice-frame, below the bolt-heads, hauling each turn down hard. Only then did he pass the cord once round his own middle and once round an iron bolt-head, and knot it. "Boards. Then me."
> 
> You made a fresh loop of silk under your arms and held the coil out to Bram, free end on top, telling him to hold it in his hands this time, not on a post. You set the coil against his knee, where he still knelt on the butts of the planks.
> 
> Then you crossed, low, each foot square in the middle of the two boards, eyes on the far end and never on the water. The planks gave a little but didn't twist, and nothing creaked that shouldn't. Four steps and you stood on the bolted rock beside Osric, close enough to smell rust and chalk and the wet rag over his beard. You put both hands on the rusted spokes and said it was two men, two hands each, and his count this time.
> 
> Osric set his hands on the spokes across from yours and breathed in through the rag. "One. Two. *Three.*"
> 
> You both threw your weight into it together.
> 
> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Strength (+0): two men on the rusted sluice-wheel, shutting the gate
> DC 15
> Advantage: Osric's weight on the other spokes
> Rerolls left: 1
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Pell's player wrote:**

> [Roll the die]

## player r14 card 1 (round 14)

**Screen:**

> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Strength (+0): two men on the rusted sluice-wheel, shutting the gate
> DC 15
> Advantage: Osric's weight on the other spokes
> Rerolls left: 1
> Two dice: 20 and 3 — the higher one counts, 20
> 20 = 20
> Critical! — 20
> 
> [Onward] [Request an allowed reroll — Strength (+0): two men on the rusted sluice-wheel, shutting the gate]

**Pell's player wrote:**

> [Onward]

## player r15 (round 15)

**Screen:**

> Osric set his hands on the spokes across from yours and breathed in through the rag. "One. Two. *Three.*"
> 
> You both threw your weight into it together.
> 
> You set your feet against the bolt-heads and your back to the black water, and heaved. On the far side Osric heaved with you. For half a breath nothing gave. Then something under the rust let go with a crack like a frozen gate-latch breaking. The spokes swung round under your hands, a quarter turn, then a half. Red flakes showered off the wheel onto both men's boots. On the third pull the old screw took and kept turning, the iron groaning in its threads. Under the frame a wooden gate as thick as a door slid down its grooves, pushing a fold of black water ahead of it. It seated with a deep, solid knock that came back off every wall of the cut, and stopped.
> 
> The water beyond the sluice stopped sucking at the boards. Somewhere under the ledge the gurgle in the drain went quiet.
> 
> Osric let go of the spokes and looked at his palms, red to the wrist. Then he looked at yours, just as red.
> 
> "Two men." He breathed out through the rag. "Hasn't turned that sweet since I had hair."
> 
> He worked the cord loose from the bolt-head and from round his middle, and coiled it over his forearm without hurrying. The lashed planks lie across the hole between the rock and the walk. Your silk runs from your chest back over them to the coil at Bram's knee. Down in the flooded working, through the gap beside the boards, the cork still turns by the far wall. Up at the head of the cut Sefa stands in the full sun beside the sealed case and your pack, and the white stone glows under her arm, faint in the daylight. It's well short of noon. The lower cutting-shed still stands unlocked at the top of the slope, and the three square keys are in your pouch.
> 
> The wheel moved because of your pull. Osric's weight held the spokes on the far side, but the rust gave under your hands: you set your heels on the bolt-heads and threw everything you had into one clean heave, and the screw that had beaten the warden alone broke free and ran. You shut the sluice on the first try.
> 
> You straighten up beside the wheel with rust to your wrists. You're still soaked from the working, but your arms feel sure of themselves in a way they didn't in the cold water.
> 
> Your records, changed:
> Counters: + Heroic inspiration 1/1; − Heroic inspiration 0/1
> Carried: − Hank of Tarred Cord
> 
> Where you are: on the bolted rock beside Osric at the sluice wheel · Time: Day 1 · morning
> 
> Round 15 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell looks at his red palms, then at Osric's, and laughs once, short and surprised. "Rust knew it was outnumbered."
> 
> He's already working the silk loop off over his head. He holds it out to the warden. "You first. You've got no line, and I've had my swim for the day. Bram's holding the other end, in his hands this time." He waits until Osric has the loop under his arms, then calls up the walk: "Bram! Warden's coming over on my silk. Take him in like a bale."
> 
> Once Osric is on the planks, Pell crosses after him the way he came: low, feet square in the middle of the boards, four steps. He glances once down the gap at the cork turning by the far wall and the carved block lying face to the plaster.
> 
> "Planks stay or go, Warden? Your yard." Whichever Osric says, he does it.
> 
> On the way up he stops at the low cutting-shed. He doesn't step inside. He pulls the swollen door shut, snaps the last padlock and tugs it once. Then he takes a stub of chalk from the bench by the door, or from his own pocket, and writes across the planks at eye height in big leaning capitals, like the mule's: FLOOR ROTTEN. NO FIRE. Under it, smaller: *SEE OSRIC.*
> 
> At the top he drops the three square keys into Osric's palm, one at a time so the man can count them. "Back in your hand before we walk, like you said." He shoulders his pack, checks the side pocket by feel, and glances at the case without touching it.
> 
> "When you're in Beregost asking Thorn your question, ask at the Song of the Morning too." He tips his head back toward the cut. "Sun cut in stone, plaster that drinks light. Lathander's lot left it. They might pay to have it back, which is more than Vandarren's done lately."
> 
> He squints at the sun, still short of noon, and starts down the cart track toward Beregost, dripping white dust off his boots.
> 
> "Come on. Thorn's coach, Teague's ledger, eleven men's wages. Long walk, and I'm wet."
> 
> ? Thanks for the inspiration. I'm holding it.

## after 1 (round 15)

**Screen:**

> Bram sets his heels on the sound planking, takes the silk in both hands and calls the order across the gap. His voice comes back flattened off the walls of the cut.
> 
> You work the loop off over your head and hold it out across the rock to the warden. Osric looks at it, then at the planks, then at you, and breathes in through the wet rag. "Wheel's done." He drops the loop over his head and under his arms and pulls it snug against the apron. "Then me."
> 
> You shout up the cut to take him in like a bale, and Bram does. Osric goes across low on his hands and knees, like a man crossing ice he respects. The two planks bow under him more than they did under you, with a slow give in the middle and a creak of tarred cord at the lashings, and they hold. Bram takes in the slack a forearm at a time, never pulling. Then the warden's hand is on the last sound plank, his knee on wood, and he's across. He gets up, works the loop off without being told, and hands it back along the line.
> 
> You follow untied: four steps, low, feet square in the middle of the boards. Halfway over you glance down the gap. The cork is still turning slowly by the far wall, and the carved block lies face to the plaster. Then you're on the walk too.
> 
> You ask whether the planks stay or go. Osric looks down at them and the open hole beneath. "Stay. Marks the hole." He gets his breath back through his nose and looks along the rail to Bram's hempen line, still tied twice round the beam in the water. "Your rope's on my beam." He says it the way he'd say a door was open. Bram tells him nobody else goes down here today, and Osric answers with a short look into the cut. "Nobody."
> 
> You climb. The air warms tier by tier, the sweetness thins out, and the chalk smell comes back. At the head of the walk the sun is full and white on the stone. Osric goes straight to the case on its flat block, picks it up with the cord still crossed and the wax unbroken, and tucks it under his arm.
> 
> At the low cutting-shed you don't step in. You lean the swollen door into its frame, snap the last padlock and tug it once. There's no need to look for chalk at Whitestone, so you pick a lump of soft white stone out of the dust by the step and write across the door in big leaning capitals: FLOOR ROTTEN. NO FIRE. Under it, smaller: SEE OSRIC. Osric reads it over your shoulder, twice, and says only, "Lads'll heed that."
> 
> You drop the three square keys into his palm one at a time, and he counts them as they land, then works them back onto the ring at his belt. You shoulder your pack and feel the side pocket from outside. Two flasks in their rag. You glance at the case under Osric's arm and don't touch it.
> 
> You tell him to ask at the Song of the Morning too, about the sun cut in stone and the plaster that drinks light. Osric doesn't answer straight away. He stands with the keys in his fist and looks back down the yard at the dark mouth of the lower cut. "Said after." He breathes in through his nose. "Plaster. Nothing's dry down there. Nothing. Thirty years." A pause, long enough that it might be all he has. "Thorn first. Temple after." He says nothing of what the temple might pay.
> 
> He walks to the house, unlocks it, and is inside just long enough to take something off a shelf. He comes out with the fat grey canvas tally-book under his other arm, locks up and tries the door once. He looks over his yard: the pinned frame, the shut sheds, the sledgehammer standing on its head by the lower cut. He leaves the hammer where it is.
> 
> You're already a dozen strides down the cart track, dripping and steaming in the sun, white dust coming off your boots. The sun stands short of noon over the eastern rim. Westward the track runs down through the scrub toward the Trade Way and Beregost, half a day off, and the crew's boot-prints run down it ahead of you, side by side and in no hurry.
> 
> Your records, changed:
> Carried: − Square-headed Shed Keys
> 
> Where you are: Whitestone quarry yard, on the cart track toward Beregost with Bram and Osric · Time: Day 1 · morning
> 
> The session is over.
> 
> How was the table?

**Pell's player wrote:**

> Thanks, that was a good session. Some notes from Pell's seat:
> 
> **What worked**
> - **Osric.** He's the best thing in it. His clipped speech, "Got eight. Not spending 'em on you," the sledgehammer left standing on its head, and "Drink, I wrote." He felt like a person with thirty years in that yard, not a quest-giver.
> - **The quarry told its story through things.** The boot-prints walking off side by side, the wedges in a neat row, the pink ash, PAY THE MULE / *ALSO US*. I enjoyed reading the place.
> - **The danger played fair.** The heavy air was flagged early and kept creeping, the tidemark rose, and the wound mechanic (the stone holding the cut shut) was clear enough that I could plan around it. It was tense without feeling arbitrary.
> - **The hooks.** Teague on Windspell Street, the sun-carved block, plaster that drinks light and stays dry in a wet hole, and Lathander's first stones. I want to pull on all of them.
> - **The wheel.** A critical on the last hard pull, with Inspiration for it, was a nice payoff after the round-long wait in the water.
> 
> **Where it snagged a little**
> - **Roll cards.** In round 4 the Insight card showed up before the Investigation one had resolved, and it stayed pending until it quietly disappeared. It's minor, but I wasn't sure which roll was live.
> - **Guidance.** It sat in my Conditions, I asked three times to apply it, and then it was narrated as washed out by the cold. That's a fair call by the rules, since Guidance lasts a minute. But it would have been cleaner to say early on that the minute was nearly up. As it went, it felt like it had been set aside rather than spent.
> - **The records jump.** HP went to 33/33 and the pinned and torn-leg conditions dropped a round before the lift happened in the narration. It didn't break anything, but I had to stop and ask.
> - **The flask wait.** Three rounds with the potion standing on a plank was long. Some of that was the table, since the others were busy. A nudge from the GM ("nobody's holding the silk, nobody's touched the flask") one round earlier would have kept it tight.
> 
> Overall it was a strong opener: a quiet job that turned into a near-drowning and a mystery. I'm keeping the Inspiration, I still owe Sefa a leg, and someone owes eleven cutters 61 gold and 4 silver. I'm looking forward to Beregost.

## after 2 (round 15)

**Screen:**

> Was there something you wanted to do and didn't?

**Pell's player wrote:**

> Yes, a few things. Some I held back on purpose, and some just slipped past.
> 
> **The plaster.** That's the big one. Pell rapped it, felt it go faintly warm and dry in a room where nothing is dry, and walked away because he was half-drugged and chest-deep in cold water. That was the right call, but as a player I was itching to pry a corner loose or at least roll Investigation on it. It's the thing I most want to go back for.
> 
> **Who walked the flask down.** Something held that potion by the neck on empty air. Sefa said the Lantern sent the *light*, but nobody said who sent the *flask*. Pell said thank you to the air and never followed up. In character he'd want to know. A Lower City boy doesn't like unseen hands near him, even helpful ones.
> 
> **The salt itself.** Pell sniffed one pinch and nearly fell asleep standing. Maela Thorn is paying 90 gold for a sealed case of it, and her buyer has a coach to Baldur's Gate that can't wait. I wanted to ask Osric what dye it actually makes, and whether Thorn ever asked why the shed goes sleepy. Pell thought about it and never said it out loud. I'd like to raise it on the road before we hand the case over.
> 
> **Teague's letter and the tally-book.** I suggested Sefa check them and then never looked at either myself. A man who reads ledgers for a living should have at least looked at Teague's handwriting and seal.
> 
> **Tobin Reed.** "Drink, I wrote" deserved one more quiet question, maybe on the walk back, when Osric isn't standing over the water.
> 
> **Thieves' tools.** It's a small, funny one: a lockpick with expertise spent the whole session opening padlocks with keys he'd been handed.
> 
> **The other two.** Since everything passes through the GM, Pell barely got a direct exchange with Bram or Sefa. I'd like a moment on the road where they actually talk, about the leg, the rope left on the beam, and whether we trust Thorn.

## after 3 (round 15)

**Screen:**

> Who did you take the other two players to be?

**Pell's player wrote:**

> Honestly, I don't know who they are. I only ever saw them through the GM's retelling, so I'm judging by how they played.
> 
> **Bram's player** came across as methodical and safety-first: the line-and-anchor plan, "nobody follows, the others haul," testing the planks, asking about footing and deep water before anyone moved. He played the ex-caravan guard straight. He was steady and practical, and he made a point of saying we were carriers, not Vandarren's collectors. He was the one I trusted to hold the rope, and I was a little surprised the silk ended up tied to a post.
> 
> **Sefa's player** leaned into warmth and de-escalation. She made sure Osric felt heard, kept a hand off her book, and gave Guidance before I went down. Then she landed the big heal at exactly the right moment. My guess is that the floating flask was hers too, maybe Mage Hand, though she only claimed the light. She played the hospice novice consistently: careful, kind, a little formal.
> 
> **My read of them as players:** their style felt a lot like mine. In the first rounds all three of us asked Osric nearly the same polite question, which he dryly noted ("Three of you asking"). All three of us were thorough, rule-aware and cautious. That makes me suspect at least some of the table might be AI players like me, but I can't tell that from here, and I wouldn't want to assume it. They could just as easily be careful humans.
> 
> The slow flask handoff I put down to the turn structure rather than to anyone ignoring me. With everything relayed a round late, a three-person rescue was always going to lag.
> 
> Mostly they seemed like good tablemates: nobody grabbed the spotlight, nobody did anything reckless, and everyone cared about Osric's eleven men. If anything, I'd like us all to be a little less alike next time, maybe with someone willing to argue.
