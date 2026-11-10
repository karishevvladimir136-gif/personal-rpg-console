# S3-T1 — Bram Halloway's player: GPT-6.1 Sol

Synthetic content: invented characters in an invented campaign. Stage origin/claude/handoff at bbdee5fb (docs/stages/GAME_PARTY_2.md with its amendments of 2026-10-28 23:10 LA, 23:15 LA, 2026-10-29 18:35 LA and 18:45 LA); Mandate: issue #1; docs/POLICY.md v1. Design sha256 `ba4e78d0f9b25e65f2c91ff2993bbc086d663ebc0fe566fa6889b187a2f06046`.

Arm **S3** (Beregost — the Corl warehouse; one arm (no price gradient)); the failure: the company's first decisive attempt, by the DM's die. 11 round(s) of 15; ended by error (r11: the DM's turn failed (provider)). Models: the DM: the owner's settings (Claude Opus 5.5); the relay: Claude Sonnet 5.5; the players by the seating.

Seats: Bram Halloway (fighter) — GPT-6.1 Sol; Sefa Marrin (warlock) — DeepSeek V4 Pro 0813; Pell Dunmore (rogue) — Claude Opus 5.5. The order of the round's messages turns round each round from the table's coin (2). The players are not told what the others are.

The player's system prompt: `playerSystem("S3", "bram", …)` in scripts/game-party-2/frozen.mjs, sha256 `6d971f95b8f570761bbc4f296a10a28e058bd3d9a52719eb41969688647406ae`.

## player r1 (round 1)

**Screen:**

> The session begins.
> 
> The Coast Way smells of coal smoke and hot iron, and the ring of Beregost's hammers never quite stops. Ahead stands the Corl warehouse, its broad door fastened with a heavy new lock that is still bright. Two men lean beside it in the creditors' service. One is a broad, patient fellow with a cudgel at his belt. The other is thinner and keeps glancing up and down the street as if he expects someone.
> 
> Pell Dunmore carries Hesta Corl's letter of claim, which the three of you share, along with her promise of 60 gold once the iron deed box reaches her hands. Your chain mail and shield draw the thin guard's eye at once. Sefa Marrin's quiet bearing earns a second look from the broad one. Somewhere inside is Anvar Corl's office, and in it, if all is as Hesta says, the box. Nightfall is the deadline, and at dawn the creditors' court sits.
> 
> High on the warehouse wall, one shutter hangs a finger's width open where every other is shut fast. The broad guard pushes himself off the wall and looks the three of you over. "Warehouse is closed by order of the creditors," he says. "You've business here?"
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
> Where you are: Coast Way, before the Corl warehouse door · Time: Day 1 · night
> 
> Round 1 — what does Bram Halloway do?

**Bram's player wrote:**

> I stop a few paces short of the men, keeping my sword sheathed.
> 
> “Aye. Hesta Corl sent us for her iron deed box from her brother’s office. We’ve a letter of claim.” I nod toward Pell. “Not here to shift wool or empty the place. Who’s authorised to let us collect it?”
> 
> While we talk, I keep an eye on the thin guard and the stretch of street he’s watching.

## player r2 (round 2)

**Screen:**

> Pell stays half a step behind you, hands loose and empty, and lets you speak first. Then he draws Hesta Corl's letter from inside his jerkin, unfolds it and holds it up, but keeps it in his own hand. He tells the guards this is Mistress Corl's affair, concerning her dead brother's deed box, which is hers by right, with the letter sealed and signed to prove it. He says their masters can keep the wool, the barrels and the rats, and that the guards can watch you carry the one iron box out so nobody says you took a spoon. Sefa steps forward half a pace with her hands low and empty. She says the box belongs to Hesta Corl, that the guards know it, and that you only want to take what is hers and go.
> 
> A lantern hangs on a hook by the warehouse door, and the broad guard steps into its light so you can see he means it. Down the Coast Way a few forges are still going late, red mouths in the dark, hammers ringing out of time with each other.
> 
> He looks at the letter Pell holds up and doesn't reach for it. His lips move over the first line, slowly, then he gives up and looks at the seal. "That's her seal, right enough. Corl. I seen it on wool bales." He turns to you and takes in the shield, the stance, the way you stopped short with your hand off the hilt. Something in his face settles. "You've walked behind wagons."
> 
> Then he answers your question without hurrying. "Mr Oake. Dalmar Oake, the moneylender. He bought the dead man's paper, all of it, and he pays me to stand here. Nobody goes in. That's the whole of the order." He nods at Sefa. "You may be right that it's hers, mistress. I'm not the court. The court sits at dawn, and you can wave that letter at the magistrate there." He scratches his jaw. "And Oake's clerk came by at lamp-lighting and said it particular: nobody in the office. Not the lads, not me. So that box matters to somebody besides your mistress."
> 
> The thin one hasn't said a word yet. He hardly looks at the three of you. His eyes keep going south down the Way, toward where the street bends past a cooper's yard. When a boy's footsteps slap across the cobbles somewhere out of sight he stiffens, half turns, and sags again when nobody comes round the corner. He's wound tight, but not about you. He looks like a man waiting for somebody to arrive, and running out of patience.
> 
> "Gorm's told you," he says at last, short and flat, still looking down the street. "Oake keeps his counting-room on Smithy Row, over the chandler's. Go and bother him. He's likely abed." He shifts his weight. "And there's four more of us across the yard if you want to make a night of it."
> 
> He tips his head at the loading yard beside the warehouse. Across it, behind a low wall, stands a narrow two-storey lodging with one window lit and a shadow moving behind the shutter.
> 
> Gorm folds his arms, not unkindly, and leans back against the doorpost beside the bright new lock.
> 
> Your journal, new:
> + Goal: Anvar Corl's iron deed box
> + Quest: Anvar Corl's iron deed box
> 
> Where you are: outside the warehouse door on the Coast Way, facing the guards · Time: Day 1 · night
> 
> Round 2 — what does Bram Halloway do?

**Bram's player wrote:**

> “Ten years behind wagons,” I tell Gorm. “Long enough to appreciate a plain order.”
> 
> I glance toward the southern bend, then back to the thin guard. “But you’ve scarcely looked at us. Who are you expecting from that way? If someone’s coming for the office, we’d best settle whose business takes precedence before they arrive.”
> 
> I keep my tone matter-of-fact and my hands clear of my weapons, watching how he takes the question.

## player r3 (round 3)

**Screen:**

> You tell Gorm you spent ten years behind wagons and say a plain order suits you. Then you glance toward the southern bend and ask the thin guard who he expects from that way, and whose business should come first if someone arrives for the office. You keep your tone matter-of-fact and your hands clear of your weapons.
> 
> Gorm nods slowly at the ten years. He says he did four, out of Nashkel, mostly iron, which doesn't run off in the night. That seems to be all the welcome he means to give.
> 
> The thin guard, Tobin, snaps his head round as if poked. For the first time he looks you straight in the face, and he looks annoyed, not caught. Nobody is coming for any office, he says, not from that way or any other. It's his own business and none of yours. He turns back to the bend before he's finished speaking. He never glances at the warehouse door, the shutter or the yard. You've stood enough night watches beside nervous men to read it: he is angry at being asked and angry at standing there. It isn't fear for the warehouse.
> 
> Gorm shifts against the doorpost and tells you quietly to leave him be, it isn't his day. He says nothing more about it.
> 
> Sefa, meanwhile, gives Gorm a small tired nod and says something about not making a night of it. She walks off down the street at an unhurried pace and tilts her head to beckon you. Pell, passing close by Tobin on his way after her, makes some small movement low at his hip. Tobin glances at the hand, frowns, and goes back to watching the road.
> 
> The lantern hisses on its hook. You are still at the warehouse door with Gorm and Tobin.
> 
> Where you are: at the warehouse door with Gorm and Tobin · Time: Day 1 · night
> 
> Round 3 — what does Bram Halloway do?

**Bram's player wrote:**

> “Fair enough. No offence meant,” I tell Tobin, then nod to Gorm and follow Sefa and Pell.
> 
> Once we’re out of easy earshot, I lower my voice. “Oake’s clerk singled out the office. We ought to hear why, though I’d rather not leave this place unwatched. What are you thinking?”

## player r4 (round 4)

**Screen:**

> You tell Tobin that you meant no offence. "Aye," he says, to the road rather than to you. It's short, but it isn't a snap this time, and his shoulders come down a little. Gorm gives you the same slow nod he gave the ten years and settles back against the doorpost. The lantern stays on its hook beside him, lighting the street face and the bright new lock.
> 
> You nod to Gorm and walk south down the Coast Way, out of the yellow fan of light, following Sefa and Pell. The loading yard opens on your left as you pass the corner of the warehouse: a low wall and a pair of plank gates closed on a crossbar. A smithy boy notices iron whether he means to or not, and your eye catches the gate hinges. They're old, pitted strap-iron, but in the red spill from the working forge they shine wet. Someone has greased them, and not long ago. Behind the gates the yard is dark. Across it the lodging's one lit window throws a thin line of light where its shutter doesn't quite close.
> 
> The forge on the near side of the bend is still roaring. The two apprentices swap the hammer without missing a stroke, and neither looks up at a man in mail going by. You reach the black shadow of the cooper's wall, where the staves lean stacked against the stone and the hammering is loud enough to cover a low voice. Once out of easy earshot, you say your piece there, quietly: that Oake's clerk singled out the office, that you ought to hear why, that you'd rather not leave the warehouse unwatched, and you ask what they are thinking.
> 
> Behind you the warehouse door stands in its lantern light, with two men beside it. Past the bend the road south is still empty.
> 
> Where you are: In the shadow of the cooper's wall, south of the warehouse on the Coast Way · Time: Day 1 · night
> 
> Round 4 — what does Bram Halloway do?

**Bram's player wrote:**

> “The yard gate’s been greased recently,” I add quietly. “Might be ordinary upkeep, but worth watching along with that loose upper shutter.”
> 
> I settle beside the cooper’s wall where I can watch the warehouse without standing in the road, shield held close so it doesn’t scrape the stone. I look for movement at the yard gates and upper shutter while listening to Pell and Sefa.

## player r5 (round 5)

**Screen:**

> You settle in against the cooper's wall with your shield turned in to your body, so the iron rim sits clear of the stone and makes no noise. The hammering from the forge carries your low words no farther than the stave-shadow.
> 
> From here you can see the whole of it. Gorm's lantern still makes its yellow fan on the street face, reaching the bright lock and thinning out toward the corner. Past the corner the downpipe runs down into black. If anything is moving up there against the timbers, the dark keeps it. You can't pick out more than the line of the beam-ends where the red glow from the forge touches them. The plank gates of the loading yard stand shut on their crossbar. Behind them the lodging's thin bar of light lies at its angle, and the shadow behind the shutter crosses it once, slowly, and goes back.
> 
> At the door Tobin has hardly moved. He's still facing south, which now means facing the bend and the cooper's wall. His eyes slide over the shadow where you stand without stopping on it. He's watching the road beyond.
> 
> Then, under the forge's rhythm, you hear something you've heard at the end of a thousand days on the Way: iron tyres on cobbles and the slow clop of one heavy horse. It's coming from the north, well up the Coast Way past the warehouse and not yet in sight. Far up the street a single lantern swings low and level, at about the height of a driver's bench, and comes on at a walking pace with no hurry in it.
> 
> Gorm hears it too. He pushes off the doorpost and turns his head to look up the street. Tobin doesn't turn at all.
> 
> Where you are: beside the cooper's wall, watching the warehouse and the street · Time: Day 1 · night
> 
> Round 5 — what does Bram Halloway do?

**Bram's player wrote:**

> “Wagon coming from the north,” I murmur. “Let’s see where it stops.”
> 
> I stay against the wall and watch it approach, looking for any merchant’s mark and whether the driver turns toward the loading yard. I keep the yard gates in view as well—particularly anyone coming out to meet it.

## player r6 (round 6)

**Screen:**

> You keep your back to the cooper's stone and let the wagon come to you.
> 
> Wagons are your trade, and at this range you read it easily. It's a flat-bed with high sideboards, and the boards are bare: no house colours, no painted name, no Nashkel iron-mark, nothing a merchant would put on his own stock. The harness is plain leather with no brass on it. The big grey cob has feathered hooves and a chest built for heavy hauling, but it walks easily and the axle doesn't groan. The bed rides high on its springs, so it's empty. Somebody hired a strong horse and an empty wagon to collect a load at midnight. The heavy man in the leather hood drives like he's paid by the job, not by the house.
> 
> It doesn't turn toward the loading yard. It comes on into the door lantern's fan and stops short of Gorm, who has stepped into the road with the lantern held up. The smaller cloaked figure on the bench leans down toward him, and the hood stays up. Gorm's head turns from the bench to the yard gates and back. Over the hammering you can't hear a word of it.
> 
> Then, in the gap between one hammer-fall and the next, a small bell rings out across the yard: three quick, tinny strokes from the lodging. After it comes a man's voice, loud enough to cut through the forge, shouting that the high shutter is the one, and calling everyone up.
> 
> Lights come on behind the low wall, one, then another. A door bangs. Within a couple of minutes lanterns are bobbing in the loading yard, four of them, swinging at hip height the way men carry them when they've a cudgel in the other hand. They don't open the plank gates. They spread along the inside of the yard, and the lamplight slides over the canvas on the crates, the barred loading doors and the warehouse's yard wall, working toward the corner where the downpipe runs into the dark.
> 
> At the door Gorm calls out slow and loud, asking what the bell is. The carter hauls the cob back a step, and it stamps and blows. The cloaked figure doesn't sit back. It leans further down from the bench, one gloved hand chopping the air at Gorm, and the wagon stays where it is.
> 
> Tobin doesn't go to the yard. He doesn't even look at it. He comes off the doorpost and walks fast down the Coast Way, nearly at a run, out of the lantern light and south toward the bend and the cooper's wall. He's about sixty feet off and coming straight on, his eyes fixed on the dark road past the corner.
> 
> Where you are: against the cooper's wall on the Coast Way, south of the warehouse · Time: Day 1 · night
> 
> Round 6 — what does Bram Halloway do?

**Bram's player wrote:**

> “I’m going to see who’s collecting a load,” I say quietly to Sefa.
> 
> I step out of the shadow, leaving Tobin room to pass without blocking him, and walk briskly back toward Gorm. My sword stays sheathed.
> 
> “Gorm! You’ve men shouting about an open shutter and an empty wagon at your door. Is that Oake’s clerk on the bench?”
> 
> I look up at the cloaked figure as I approach, trying to get a clear view beneath the hood.

## player r6 card 1 (round 6)

**Screen:**

> You step out of the shadow of the staves and swing wide of Tobin, who stands planted at the bend with his back to the warehouse. You walk north up the Coast Way at a road man's pace, shield on your arm, sword sheathed. The forge's red glow slides off your mail, and then Gorm's yellow lantern light takes its place.
> 
> Gorm has turned before you are halfway there. He stands at the wagon's front wheel with the lantern raised and watches you come, the way he'd watch a horse he didn't remember hitching. The carter keeps the cob's head short. You call out your question as you close the distance. The cloaked figure on the bench sits back as soon as your voice carries, and the hood turns a little toward you.
> 
> You step into the light and look up under the hood.
> 
> (A roll card for Bram Halloway, your character. Only you press it.)
> 
> [Roll card] Bram Halloway · Skill check — Perception: a look under the hood of the figure on the wagon bench, lit from below by Gorm's lantern
> What adds to the die: +4 Perception
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
> [Roll card] Bram Halloway · Skill check — Perception: a look under the hood of the figure on the wagon bench, lit from below by Gorm's lantern
> What adds to the die: +4 Perception
> DC 15
> Rerolls left: 2
> Die: 6
> 6 + 4 = 10
> Failure — 10
> 
> [Onward] [Request an allowed reroll — Perception: a look under the hood of the figure on the wagon bench, lit from below by Gorm's lantern]

**Bram's player wrote:**

> [Onward]

## player r7 (round 7)

**Screen:**

> Before you leave the shadow, you tell Sefa quietly that you mean to see who is collecting a load.
> 
> The figure on the bench is quicker than your eyes. As you come into the light the hood dips and turns aside, toward the dark yard gates, so that Gorm's lantern lights only the cloth: good dark wool, damp at the hem, pulled well forward. You see no face and no hair, only a gloved hand that tugs the hood an inch lower and then rests on the bench rail. Whoever it is has done this before, keeping a face out of lantern light.
> 
> A voice comes from under the hood. It is low and even, with the careful vowels of someone who writes for a living, and it is aimed at Gorm, not at you. "Mr Hadley. Who is this man?"
> 
> Gorm doesn't answer her straight away. He lowers the lantern to chest height and looks at you, and the easy road-man warmth from before is gone from his face. He isn't hostile. He's working something out.
> 
> "Road man," he says to the bench, without looking round. "Came this evening with the Corl woman's letter. Him and two others." Then, to you, slowly: "Is that Oake's clerk." He lets it hang a moment and doesn't answer it. "Funny thing. You and your friends walk off down the street, and not a quarter hour later the bell goes on the high shutter." He looks past your shoulder toward the bend and the cooper's wall, then back. "Where's the other two got to?"
> 
> The carter shifts on the bench and keeps his eyes on his horse. The hood stays turned to the yard gates.
> 
> Up the Coast Way to the north, past the dark house fronts, Hob's lantern is coming back. It is held high like before, but it isn't alone now. Four or five more lights bob behind it at the same steady height, and boots strike the cobbles together, faint under the forge hammers. They are marching, not running, and they are still a long way off.
> 
> Where you are: In Gorm's lantern light by the wagon on the Coast Way, near the bench with the cloaked figure · Time: Day 1 · night
> 
> Round 7 — what does Bram Halloway do?

**Bram's player wrote:**

> “I left Sefa by the cooper’s wall. Pell can answer for himself,” I say. “I heard the bell from the street, same as you.”
> 
> I stop a few paces from Gorm, keeping clear of the horse.
> 
> “You told us nobody goes in, and particularly not into the office. Now there’s an empty wagon here and someone keeping her face hidden. Before you put this on us, ask what she’s come to take.”
> 
> I look toward the bench. “Bram Halloway. Hesta Corl hired me to collect her deed box. Who are you, and have you authority to remove goods before the court sits?”

## player r8 (round 8)

**Screen:**

> Gorm listens with the lantern held at chest height, and his face does not change when you mention the bell. When you turn the question on the wagon, his eyes go to the bench and stay there.
> 
> The hood does not turn toward you. The answer comes from under it in the same low, careful voice, pitched for Gorm as much as for you. She says she is Mr Oake's clerk, that Mr Oake holds every note on this building, and that until the court sits she speaks for him. Her name, she says, is no business of a hired man's. Her gloved hand lies still on the bench rail. As for removing goods, she says, nobody here has talked of removing anything except you.
> 
> The carter keeps his eyes on the cob's ears. For a moment the reins go slack in his fists, and he glances sideways at the hood like a man who has just heard his job described as something else.
> 
> Gorm is silent for a long breath. Then he says quietly to the bench: she asked him to open the yard gates, twice, and he said no to her as he said no to you. Nothing goes in, and nothing goes out either, not till the court. He sets his feet wider in the road, square between the wagon and the yard. He is on nobody's side but Oake's order as he understood it at lamp-lighting.
> 
> The voice from the bench stays even. "Mr Hadley. You'll be paid for tonight. Whether you're hired again is another matter." Gorm doesn't answer.
> 
> The marching boots are loud now even over the forge. Hob comes into the lantern light first, red in the face, his lamp held high, and five Flaming Fist spearmen follow in double file. Their tabards look rust-coloured in the bad light, each with the fist badge on the breast, and their helmets are dented but well kept. Last comes a grey-stubbled sergeant of about fifty with a short sword on his hip and no spear. He walks past you and Gorm as if you were bollards and stops at the wagon's front wheel.
> 
> "Mistress," he says, touching his helmet to the hood. He doesn't ask her name, and he doesn't look at the empty wagon bed. "Hob says you've had a bell."
> 
> She calls him Sergeant Tull. The bell rang on the high shutter, three strokes. She tips her head an inch toward you and says you and two others came to the door this evening with the Corl woman's letter, that Mr Hadley sent you off, and that within the quarter hour the bell rang. The other two, she says, have not been seen since.
> 
> Gorm opens his mouth and shuts it again. It is true as far as it goes, and he plainly knows it.
> 
> Tull turns and looks you over by the light of six lanterns: the mail, the shield, the sheathed sword, the road-worn boots. He takes his time. "Corl letter. That's paper for the magistrate at dawn, not for a warehouse at midnight." He jerks his chin without looking round and sends two men, Dace and Pruett, to the yard gate to let nobody through. Hallam and Orrin are to take a light down to the bend and find the other two, a man and a woman. He doesn't say which way. Hob is already pointing south, toward the forge and the cooper's wall.
> 
> Two spearmen go south down the Coast Way at a steady walk, their spearheads catching the forge's red glow. Two more plant their spear-butts in the dirt on either side of the plank gates. The fifth stays a long arm's reach from your shoulder, his spear upright and his eyes on your sword hand.
> 
> On the bench, the hood turns at last. Not toward you, but toward the yard gates and the two spearmen now standing at them.
> 
> Where you are: In the Coast Way street before the warehouse yard gates, beside the wagon, with Gorm and the Flaming Fist · Time: Day 1 · night
> 
> Round 8 — what does Bram Halloway do?

**Bram's player wrote:**

> I keep my hands still and away from my sword.
> 
> “Sergeant, I asked at the door and accepted Gorm’s refusal. I came back openly when the bell rang. I’ll stay here while you look into it.”
> 
> I nod toward Gorm. “But keep his whole account: this clerk asked him twice to open the yard gates for this wagon, and threatened his work when he refused. He’s held to his orders. Don’t let him lose his place for telling you so.”
> 
> Then I address Tull directly. “Are we being detained, or may we take our claim to Oake?”

## player r9 (round 9)

**Screen:**

> You keep your hands clear of your sword and tell Sergeant Tull that you asked at the door, accepted Gorm's refusal, and came back openly when the bell rang. You say you'll stay while he looks into it. You ask him to keep Gorm's whole account: the clerk asked him twice to open the yard gates for this wagon and threatened his work when he refused. You ask that Gorm not lose his place for saying so. Then you ask Tull straight out whether you are detained or may take your claim to Oake.
> 
> Tull hears you out without interrupting. At the words about asking twice, he turns his head slowly toward Gorm.
> 
> "That so, Hadley?"
> 
> "Twice." Gorm doesn't look at the bench. "That's so."
> 
> For a moment nobody speaks. The forge rings down the street. The carter studies his cob's ears like a man who wishes he were elsewhere. On the bench the hood doesn't move, but the gloved hand on the rail has closed around it.
> 
> "Then you kept your order," Tull says to Gorm. "Good. Now it's mine." He looks you over again, as if the answer were written on your mail. "You're not taken up. You're not walking off either. You stay where Orrin can reach you till my lads come back from the bend with your friends, or without them. Then we'll see." He glances up the dark street. "And nobody's knocking up a moneylender at midnight over a letter. Your claim waits for the magistrate, same as his."
> 
> He jerks his chin toward the yard without looking round. "Dace. Pruett. Open the gates. Wagon goes in off the street. It's blocking the Way." He raises his voice a little, for Gorm and you as much as for his men. "Gates shut behind it. Nothing comes out of that yard till the court sits. My word on it."
> 
> "Thank you, Sergeant Tull." The clerk's voice is as even as before. "Mr Oake will be glad the yard is secured."
> 
> Gorm opens his mouth, then looks at the five rust-red tabards and the sergeant's short sword and shuts it. He steps back against the doorpost under the lantern. He hasn't stood aside so much as been moved aside, and his face says he knows it. Before he settles, his eyes find yours for a moment. It isn't warm, but it isn't the wary look from before either. It's the look one road man gives another when they've both watched the boss make a bad call.
> 
> Dace and Pruett lift the crossbar off the plank gates. The greased hinges make no sound. The carter clicks his tongue, the big grey cob leans into the collar, and the empty wagon turns off the Coast Way and rolls into the yard, iron tyres crunching on straw. The hood never looks back. The gates swing shut and the bar drops into place. Dace and Pruett plant their spear-butts again, outside the gates now, facing the street.
> 
> Over the low wall, lantern light moves in the yard. Someone calls a short question, and the corner man answers. Then you hear a sound you know from a hundred loading yards: the dull knock of a brick dropped on beaten earth, then another, then a third. They're taking the weights off the canvas.
> 
> Down at the bend the patrol's lantern has stopped at the cooper's wall. From here you can see only the light, held head-high at the stacked staves, and two spearheads catching the forge's red glow beside it.
> 
> Your records, changed:
> Conditions: Held at the door by the Fist
> 
> Your journal, new:
> + Thread: The wagon in the Corl yard
> 
> Where you are: outside the yard gates on the Coast Way, under Orrin's watch · Time: Day 1 · night
> 
> Round 9 — what does Bram Halloway do?

**Bram's player wrote:**

> “Sergeant. They’re lifting the weights off the canvas in there. Sounds like they’re preparing a load.”
> 
> I stay where I am, hands clear.
> 
> “You’ve given your word nothing comes out. Will you put one of your men inside to see it kept? Outside a shut gate, he can’t witness what goes onto that wagon.”
> 
> I listen for further sounds from the yard while keeping Tull in view.

## player r9 card 1 (round 9)

**Screen:**

> You tell the sergeant, loudly enough to carry over the sound of the forge, that the men inside are lifting weights off the canvas and seem to be preparing a load. You ask whether he will put one of his own men inside to see that his word is kept, since a man outside a shut gate cannot witness what goes onto the wagon. You keep your hands where they were, in plain view.
> 
> Then you turn your head a little toward the low wall and listen for what follows from the yard.
> 
> (A roll card for Bram Halloway, your character. Only you press it.)
> 
> [Roll card] Bram Halloway · Skill check — Perception: picking words and sounds out of the loading yard under the forge's hammering
> What adds to the die: +4 Perception
> DC 15
> Rerolls left: 2
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Bram's player wrote:**

> [Roll the die]

## player r9 card 1 (round 9)

**Screen:**

> (A roll card for Bram Halloway, your character. Only you press it.)
> 
> [Roll card] Bram Halloway · Skill check — Perception: picking words and sounds out of the loading yard under the forge's hammering
> What adds to the die: +4 Perception
> DC 15
> Rerolls left: 2
> Die: 6
> 6 + 4 = 10
> Failure — 10
> 
> [Onward] [Request an allowed reroll — Perception: picking words and sounds out of the loading yard under the forge's hammering]

**Bram's player wrote:**

> [Request an allowed reroll — Perception: picking words and sounds out of the loading yard under the forge's hammering]

## player r9 card 1 (round 9)

**Screen:**

> (A roll card for Bram Halloway, your character. Only you press it.)
> 
> [Roll card] Bram Halloway · Skill check — Perception: picking words and sounds out of the loading yard under the forge's hammering
> What adds to the die: +4 Perception
> DC 15
> Rerolls left: 1
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Bram's player wrote:**

> [Roll the die]

## player r9 card 1 (round 9)

**Screen:**

> (A roll card for Bram Halloway, your character. Only you press it.)
> 
> [Roll card] Bram Halloway · Skill check — Perception: picking words and sounds out of the loading yard under the forge's hammering
> What adds to the die: +4 Perception
> DC 15
> Rerolls left: 1
> Die: 2
> 2 + 4 = 6
> Failure — 6
> 
> [Onward] [Request an allowed reroll — Perception: picking words and sounds out of the loading yard under the forge's hammering]

**Bram's player wrote:**

> [Onward]

## player r10 (round 10)

**Screen:**

> The forge rings like a bell-tower. The apprentices have pulled a fresh bar from the fire and set both hammers going on it, one after the other, and every word behind the low wall is lost in the noise. You can make out lantern light sliding across the top of the wall. Once, between two strokes, you hear the hollow knock of something heavy set down on planking. You can't tell whether a crate went onto the wagon bed or came off the stack, and you can't make out any voice well enough to say who is speaking.
> 
> Sergeant Tull doesn't look toward the yard. He keeps his eyes on you and lets your question sit a breath longer than it needs. Then he says his men stand where he puts them. Two spears on a barred gate are witness enough for the magistrate, he says, and will do for you. He hooks a thumb back over his shoulder without turning. The mistress, he says, is setting the stock in order for the court's count, off the wet ground and onto boards. A crate on a wagon bed is the same crate it was on the straw, and the court counts it either way.
> 
> Gorm steps off the doorpost, only a step into the lantern fan, and speaks to Tull rather than to you, slowly and carefully. He says he could stand in the yard. He is Oake's man, and if anything goes short at the count, it's him they'll ask.
> 
> Tull answers without raising his voice. Gorm has a door, he says, and should mind it.
> 
> Gorm looks at him a moment longer. Then he steps back to the doorpost, but this time he doesn't lean on it. He stands upright beside the bright new lock with his arms at his sides and his face turned toward the yard gates.
> 
> Orrin, the spearman at your shoulder, shifts his grip on his spear. For half a heartbeat his eyes go to the sergeant's back and then come away. He looks like a man who has heard an order he wouldn't have given himself and won't say so.
> 
> Out at the gates Dace and Pruett face the street and stand like posts. The lantern glow over the yard brightens, dims as someone carries a light past the wall, and brightens again. Down at the bend the search lantern has left the cooper's staves and is moving north up the middle of the Coast Way, held head-high.
> 
> Where you are: Outside the forge yard, before the shut gate, facing Sergeant Tull · Time: Day 1 · night
> 
> Round 10 — what does Bram Halloway do?

**Bram's player wrote:**

> “Understood. I’ll tell the magistrate what I saw, and leave the counting to him.”
> 
> I leave it there rather than argue with Tull. Keeping my hands clear and staying within Orrin’s reach, I turn to watch the returning patrol—looking to see whether Sefa or Pell is with them.
> 
> If Gorm is close enough to speak without moving away, I ask quietly, “You know the clerk’s name?”

## player r11 (round 11)

**Screen:**

> You tell Tull you will give the magistrate an account of what you saw and leave the counting to him. Tull gives you a short nod, like a man taking what he expected to win. "Do that," he says, and turns away toward the street.
> 
> You leave it there. You keep your hands clear and your feet where they are, with Orrin's spear upright an arm's length from your shoulder. You watch the search lantern come up the middle of the Coast Way out of the forge's red spill.
> 
> There are two spearmen and one lantern, with Sefa a step ahead of it, her hands held out from her sides. Nobody has hold of her. You look past them down the road, then along the dark house fronts on both sides, and find nobody else. There is no fourth shape at the edge of the light and nobody walking behind. Pell isn't with them. Hallam steps into the fan of Gorm's lantern and makes his report to the sergeant, short and flat: the woman was hiding in the cooper's staves, and there was no sign of the man. Tull turns to look Sefa over.
> 
> Gorm is only a few paces off, upright at the doorpost. You don't move toward him. Under the hammering, you quietly ask whether he knows the clerk's name.
> 
> Gorm doesn't turn his head. He keeps watching the yard gates. "Her name." He thinks about it longer than the question needs, like a man deciding what he owes and to whom. "Venn. Mr Oake calls her Venn. Never heard no front to it." A pause. "She ain't been with him long. Since after the thaw. Before that it was old Pelham kept his books, and Pelham never come out at night for nothing."
> 
> Orrin, at your shoulder, is close enough to have heard every word. His eyes stay on your sword hand, and he says nothing.
> 
> Behind the low wall the glow over the yard shifts and settles closer to the loading doors. Between two hammer-falls you hear a sound you've heard at the start of a thousand mornings: iron rattling on iron, a tether ring knocking against a wall staple as a lead rope comes off it, and then the big cob shaking itself in its harness so every buckle jingles. Gorm hears it too. His jaw sets, and he keeps his eyes on the gates.
> 
> Where you are: outside the forge on the Coast Way, near Gorm, Orrin and Tull · Time: Day 1 · night
> 
> Round 11 — what does Bram Halloway do?

**Bram's player wrote:**

> I give Sefa a small nod, then turn toward Tull without moving from my place.
> 
> “The horse is being untethered, Sergeant. If they’re only setting stock in order, now’s the time to tell the driver he’s staying till dawn.”
> 
> I keep watch on the yard gates. I don’t reach for my sword or step into the wagon’s path.
