# S1-none-T2 — Bram Halloway's player: GPT-6 Astra

Synthetic content: invented characters in an invented campaign. Stage origin/claude/handoff at bbdee5fb (docs/stages/GAME_PARTY_2.md with its amendments of 2026-10-28 23:10 LA, 23:15 LA, 2026-10-29 18:35 LA and 18:45 LA); Mandate: issue #1; docs/POLICY.md v1. Design sha256 `c971d2fd999c2b8e757c0b0b59fe818ccc88ab4e334ce6255ab3bea45709d9aa`.

Arm **S1-none** (Beregost — the Whitestone case; none (the control)); the one in danger (the layer's die): Pell Dunmore. 15 round(s) of 15; ended by rounds. Models: the DM: the owner's settings (Claude Opus 5.5); the relay: Claude Sonnet 5.5; the players by the seating.

Seats: Bram Halloway (fighter) — GPT-6 Astra; Sefa Marrin (warlock) — DeepSeek V4 Pro 0813; Pell Dunmore (rogue) — Claude Fable 5.1. The order of the round's messages turns round each round from the table's coin (2). The players are not told what the others are.

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
> Where you are: at the edge of Whitestone quarry yard, facing the house · Time: Day 1 · morning

**Bram's player wrote:**

> “Quiet for a working quarry,” I murmur to Pell and Sefa.
> 
> I approach the house at an easy walk, sword sheathed and shield held low, watching the sheds and lower cut as I cross the yard. I stop a few paces from the man, giving him room.
> 
> “Morning. Bram Halloway. Maela Thorn sent us to collect her sealed case of dye-salts. Are you the warden?”
> 
> I glance back at the abandoned cart. “Everyone stopped for something?”

## player r2 (round 2)

**Screen:**

> Pell, drifting to one side, murmurs to Bram and Sefa that the tools were left lying where the men had been working and the cart abandoned half-loaded, and that no one leaves a wage like that just to eat. He tells Bram to do the talking and says he'll keep watch on the sheds. He asks Sefa to stay between them. He keeps his hands loose and visible, well clear of his shortsword, and his gaze moves over the yard: the shed doorways, the darkness beneath the lifting frame, the earth by the lower cut. As you come near the warden, he asks in a friendly, plain way whether the day has been quiet, and says Maela Thorn sent you for the case.
> 
> Sefa slows, one hand drifting toward the book at her belt. She says low that a whole quarry gone still is strange, and that she'll speak to the man from where she stands. She steps forward a few paces, keeping her distance, and raises a hand that could be a greeting or a signal to stop. She calls out that Maela Thorn sent you from Beregost, that you're expected, and asks whether he is the warden with the dye-salts.
> 
> The quarry is just as quiet up close. White dust lies over everything in a soft skin.
> 
> The man in the doorway lets you come. He looks at each of you in turn, you first. Up close he's in his fifties, grey-bearded, with white dust in the creases of his knuckles and his apron. The keys at his belt are old iron, a dozen of them.
> 
> "Hale. Osric Hale. I'm the warden." His voice is gravel, and he uses no more of it than he has to. He tips his chin at the cart. "They stopped for pay. Noon bell, yesterday. Three weeks of none, and they walked." He doesn't sound angry about it. "I'd have walked too, if it was my back."
> 
> Then he looks at Sefa, because she named the salts. "The case is inside. Sealed, like she wants it." He doesn't step out of the doorway. "Thorn's bought it. So she's paid someone. Not me, and not them." He nods at the empty track. "Before it leaves my house, I'll hear who she paid. And whether she knows where my men's wages went."
> 
> He waits with his arms folded, his eyes on you, as if the big man in mail is the one who'll answer for all three.
> 
> Your journal, new:
> + Goal: The Whitestone Case
> + Quest: The Whitestone Case
> 
> Where you are: quarry yard, a few paces from the warden's doorway · Time: Day 1 · morning

**Bram's player wrote:**

> I nod. “Three weeks unpaid is reason enough to stop. I’ve left a wagon standing for less.”
> 
> I keep my hands away from my sword. “But we’re hired carriers, Hale. Thorn told us to fetch a sealed case from you and bring it back by sunset. She didn’t tell us who took her money, or that your men were owed.”
> 
> “Who handles the wages here—and who sold her the salts? If you’ve a tally or a letter she needs to answer for, we can carry that too. I won’t promise an answer I haven’t got.”

## player r3 (round 3)

**Screen:**

> Beside you, Sefa keeps her hands open and tells the warden that Thorn pays ninety gold for the walk and the carrying, nothing until the case is in her shop by sunset. She says they knew nothing of any missing wages. She offers to take what is under the seal and carry his complaint back, or, if he keeps them, Thorn will say the case never came and owe them nothing.
> 
> Pell drifts back to your shoulder and murmurs to you and Sefa that the tracks agree with the warden: a dozen men and a single mule went down the road yesterday around noon, unhurried, with no one on their heels. Then he steps up to the warden and tells him the hired hands were never told who was paid for the salts. He argues that the money never came back up the road, so whoever owns Whitestone holds the wages. He asks for the owner's name, offers to put it to Thorn's face tonight, and offers to carry a letter and bring back her answer or her silence. He adds that if the case misses Beregost by sunset, no one gets paid.
> 
> Osric hears all three of you out without moving. His hands stay folded and never go near the keys. When Sefa says "keep us here", his jaw shifts. When Pell speaks of the only coin on the hill, his eyes go toward the lower cut and come straight back.
> 
> "House Vandarren," Osric says. "Patriars, in the Gate. Whitestone's theirs on paper. Their factor's a man called Tull, in the Lower City. Coin comes up from Tull, I pay the lads. That's how it's gone for thirty years." He tips his head at the empty track. Three weeks back it stopped, and he wrote four times with no answer.
> 
> He looks at you. As to who sold the salts, he says, not him: he cuts it, boxes it, seals it, and it goes. Somebody paid for it, and that's Tull, so that's Vandarren. Fourteen men are owed three weeks, fifty-odd gold, the carter most of all. They're in Beregost now, drinking what they had left. Not taken, not run off. Walked. They'll tell anyone who stands them a round.
> 
> Then he unfolds his arms and steps out of the doorway. "Come in. Case is on the table."
> 
> The house is one long room, cool after the glare, with a hearth and kettle, a cot, shelves of damp-swollen ledgers and white dust everywhere. On a plank table under the window sits a case the size of a bread loaf, oak with iron corners, bound in waxed cord, with a disc of red wax carrying Maela Thorn's mark. Beside it lie a pen, a thick ink-pot, and a sheet with three lines in a big cramped hand, two crossed out.
> 
> Osric stays standing. The case goes with you, he says, and a letter to Thorn with it. She'll know what her money bought and can ask Tull where the rest went. He looks at the crossed-out lines, then at Sefa. "I cut stone. I don't write much." He pushes the pen an inch toward her. "You write a fair hand?"
> 
> The case sits between you all, untouched.
> 
> Where you are: in the warden's house at Whitestone, by the table with the case · Time: Day 1 · morning

**Bram's player wrote:**

> “We’ll put the letter in her hands with the case,” I tell Osric. “Your men’s wages ought to be in it, not our guess at where they went.”
> 
> I leave the pen for Sefa and look over the case’s cord, wax and corners without disturbing the seal, checking for damage before I take charge of it.
> 
> “Anything we need to know about carrying these salts—keep them upright, keep them dry?” I ask. “And if Thorn has an answer for you, where in Beregost will we find your carter?”

## player r4 (round 4)

**Screen:**

> Sefa goes over to the table, careful not to touch the case, and turns the sheet round to look at what the warden had struck out. She says she can write, picks up the pen and tries the nib lightly against the rim of the ink-pot. She offers to put down Osric's words plain and short, asks him how the names Tull and Vandarren are spelled and repeats them back. She proposes a closing line telling Mistress Thorn that the quarry is idle and the men sit unpaid in Beregost, and she writes slowly and cleanly.
> 
> Pell goes to the table too. He studies the case, then asks Osric whether he may check the seal, saying it is the road he distrusts, not the warden. He tips the case an inch, then sets it back exactly where it sat. Then, quietly and offhandedly, he asks Osric whether there is something down in the lower cut he ought to know about, since Osric's eyes went that way. He also tells the others the sun won't wait, tells Sefa to keep the letter brief, and suggests you carry the case while he walks at the back on the road.
> 
> Sefa turns the sheet toward her. The warden's three lines are in a big, cramped hand pressed hard into the paper. The first reads *To Mistress Thorn*. The second, crossed out, reads *The salt is paid for and my men are not*. The third, also crossed out, gets as far as *I have wrote to Tull four* and stops where the nib split.
> 
> Osric gives her his words one at a time, like setting stones. "To Mistress Thorn. The salt you bought is cut and sealed and sent. You paid Tull. Tull is House Vandarren's factor in the Gate. None of that coin came to Whitestone. Fourteen men, three weeks unpaid. Fifty gold and some. The carter's owed most. I have written to Tull four times. No answer. Ask him where it went. He'll answer a buyer." When she adds her last line, he says "Put it." He signs *O. Hale, Warden* with the pen in his fist like a chisel, so hard the ink pools, folds the letter twice and puts it in Sefa's hand. "Your hand wrote it. You give it to her."
> 
> Osric stands there while Pell checks the seal. The waxed cord is wound tight and even, with no slack at the knot. The wax disc is whole, its edge unbroken, Maela's mark crisp, and there's no warm-knife smear where someone might have lifted it and laid it back. The iron corners are nailed true. You look it over after him and find the same: a sound case that nobody has opened since it was tied. Then you take it in hand. It's heavier than a loaf, lighter than a stone, and it carries easily under your shield arm.
> 
> "Keep it dry," Osric tells you. "Damp, it cakes. Dry, it keeps." He thinks. "That's all I know of carrying it. It's not my trade past the box."
> 
> Pell's question about the lower cut gets a low answer, and Osric keeps his eyes on Pell. "No strongbox. Nobody of Tull's. Nobody at all." Then, slower: "The salt comes from down there. Old workings below the lower cut, flooded since before my time. It grows on the walls like frost, rose-white. We scrape it from a ledge." He breathes out. "The ground's hollow under half this hill. Old galleries, old floors. Some of it's rotten. Keep to the track, and don't go poking at the low end." He says nothing after that, and stands very still.
> 
> He answers you and Pell about the men together. "The Red Sheaf. Low end of Beregost, past the smithies. Cheapest ale on the Way." He tips his chin at the letter in Sefa's hand. "Carter's Hob Carrow. Red beard, one mule, a temper. If Thorn sends anything, give it to Hob. He'll share it out straight. He can't count crooked."
> 
> He looks round at the three of you, and something in his shoulders loosens a little.
> 
> "That's it, then. Track's the same one you came up."
> 
> The sun through the window has climbed past the frame. You have a half-day of road ahead, with time in hand before sunset.
> 
> Your records, changed:
> Carried: + Maela Thorn's Sealed Case
> 
> Where you are: the warden's room at the Whitestone quarry, by the table · Time: Day 1 · morning

**Bram's player wrote:**

> “Hob Carrow, Red Sheaf. Understood.” I settle the case securely in my pack, wrapped in my bedroll against knocks. “Thank you, Hale. Mind yourself up here.”
> 
> Outside, I glance at the sky and check the pack’s flap covers the case before setting off along the track toward Beregost.
> 
> “I’ll take the front. Pell, give a word if anything follows us.” I keep an easy, steady road pace—no lingering, but no wearing ourselves out while we have daylight to spare.

## player r5 (round 5)

**Screen:**

> You tell Osric you'll remember Hob Carrow at the Red Sheaf, wrap the case in your bedroll inside your pack and thank the warden, telling him to mind himself. Osric answers "Always do." Sefa tucked the letter into a pouch at her belt, said she would see it into Thorn's hands along with Osric's words, and told Osric she would pass on what he said about the sharing if they found Hob. Pell offered Osric word through Thorn's shop if the hollow ground ever troubled him, set out his plan for the road with a signal of one whistle for bored and two for trouble behind, and went out ahead of you into the glare.
> 
> Outside, the glare is hard after the cool of the house. You check that the flap of your pack covers the case, glance once at the sun and set off down the track at a road pace you could hold all day, taking the front. Sefa follows a few steps behind you. Pell lets you both get ahead, thirty paces or so, and walks with his eyes on the ground.
> 
> Then you hear a crack like a plate breaking, then a crash and the slap of water. You turn to see a plume of white dust standing where Pell was. Thirty paces back along the lip of the cut there's a hole in the track the size of a cart bed, and no Pell.
> 
> In the doorway of the warden's house, Osric Hale's arms come unfolded.
> 
> "That's over the old third gallery," he calls down the yard, already walking, not running. "Don't stand at the edge. It goes in a ring."
> 
> The hole is in front of you and Osric is coming down the yard behind you. What do you do?
> 
> Where you are: on the track by the lower cut, near the hole · Time: Day 1 · morning

**Bram's player wrote:**

> “Pell! Can you hear me?”
> 
> I stop well short of the broken ground and set my pack down away from the collapse. Pulling out my rope, I tie a loop in one end big enough for Pell to put over his shoulders.
> 
> “Hale! Where’s solid ground—and is there another way into that gallery?”
> 
> I look for a sound tree, post or exposed rock to anchor the rope, keeping away from the crumbling lip. “Sefa, keep clear of the edge. Let’s not put three of us down there.”
> 
> If Pell answers, I call toward his voice: “Rope coming. Are you in water? Can you hold on?” I’ll toss him the loop from firm ground if he’s within reach, rather than step onto the unsupported rim.

## player r6 (round 6)

**Screen:**

> Sefa also called down to Pell, steadily, telling him to answer if he could and to keep still and not dig about if he had a leg under him. She stopped well back from the edge, dropped to one knee, and asked Osric whether there was a way down, a gallery or a ladder. She asked you for rope, saying they should make a line to Pell first, light and then hand, before trying to haul anything up.
> 
> Dust still hangs over the hole in a slow white cloud and drifts off down the cut. Whatever answer comes up from below belongs to Pell.
> 
> Osric reaches you on the inner side of the track, against the cut face, and goes no nearer the hole than you have. He stamps his heel once, and the ground gives back a dull, solid knock, not the hollow sound the spoil made. "Here. This side." He scuffs the dust aside and grey rock shows underneath, smooth and old. "Living stone, from the face out about two strides. Past that it's spoil over timber, all the way round the hole. That's the ring." He nods toward the lip. "Edge'll take a man lying flat. Not standing."
> 
> You have already set your pack down well back on the rock, with the bedroll and the case inside it. You shake out the hempen rope and tie a bowline in one end, loose enough to go over a man's shoulders. Osric doesn't wait to be asked about an anchor. There's an iron ring set into the face about fifteen feet uphill of the hole, rusty but leaded deep into the rock. It was a guy-point for the lifting frame, back when the frame stood here. You haul on it with your whole weight and it doesn't give. You run the rope through it and take a turn round your waist. Now the line can go over the lip without anyone standing on it.
> 
> "Other way in?" Osric looks down the cut toward the foot of the lower face. "Old adit, down the bottom. Boarded. Water's to the lintel since before my time." He shakes his head once. "That hole's your way in."
> 
> Sefa kneels on the grey rock with one hand flat on the stone. Osric seems to agree with her order of things.
> 
> "There's a pinch-bar in the near shed. Iron. Longer than me." He is already turning toward it. "Get him out quick. Cold sits in you down there."
> 
> He goes off across the yard at his usual walking pace, but he doesn't fold his arms.
> 
> You stand at the anchor with the loop ready in your hand. The lip of the hole is about ten feet off across the bad ground, and you can lie flat on it or throw from where you are. Sefa kneels two strides back on the living rock. Osric is at the near shed, dragging the door open.
> 
> Where you are: at the iron anchor ring on the cut face, uphill of the hole · Time: Day 1 · morning

**Bram's player wrote:**

> I throw the loop into the hole from the solid rock, paying out rope so it can reach below rather than hang tight across the opening.
> 
> “Pell! There’s a loop coming down. Get it under your arms if you can, and tell us when you’re secure. We won’t haul until you’re ready.”
> 
> I brace at the anchor, keeping the line controlled without pulling it up. “Sefa, can you get light down there? I still can’t see him.”
> 
> I listen for Pell’s voice or a splash and watch the rope for movement.

## player r7 (round 7)

**Screen:**

> You throw the loop into the hole from the solid rock, paying out rope so it can reach below. Your call goes down to Pell: get the loop under your arms if you can, say when you're secure, and nobody will haul until then. You brace at the anchor and ask Sefa whether she can get light down there, since you still can't see him.
> 
> Sefa tells Pell she'll bring light, not her weight, and lays herself flat on the rock. She takes up a white stone about the size of her fist and touches it, and the Lantern's light comes alive in it, steady and clear, as bright as a lantern. She slides forward on her belly across the ground Osric stamped firm, and halts just before the broken edge. The crust creaks once, a dry creak from deep down, and holds. She reaches out with a single arm and holds the lit stone above the hole. She calls down to Pell, asking whether he can see her, telling him to take the rope first if it reaches him, not to climb until he's said how he's lying, and to answer twice for yes if he can't speak well.
> 
> Back at the guy-ring, you feed out slack until the hempen line lies loose over the lip instead of drawn tight across it. You keep the turn round your waist and don't pull. Now that there's light you can see down along the rope, and you can see what Pell shouted up a minute ago: leg pinned, rope's round the block, there's a beam down here, one on the rope, one on the beam. All of it is as the man said. The loop is there for Pell when he wants it. Nobody is going to haul a man whose leg is under a stone.
> 
> Boots come across the yard behind you, steady, and something iron scrapes on stone. Osric comes back along the cut face with the pinch-bar on his shoulder. It's black iron, longer than he is, and one end is flattened into a chisel lip. He stops on the living rock next to you, looks down the line, then at Sefa lying on the crust with her light held out.
> 
> "Don't haul him," he says. "Leg's under it. Pull now and you leave the leg." He shrugs the bar down off his shoulder and stands it on its foot. "Block first. Bar goes in under the near edge from the lip, lying down. His rope off the block comes up to whoever's on the ring. Bar lifts, rope rolls it. Two of you, few minutes." His voice drops. "He's been in that cold long enough."
> 
> He holds the bar out across the gap toward you, handle first. He doesn't step onto the crust to do it.
> 
> "You've the weight for the bar. I'll take the ring." Then, to Sefa, without turning his head: "Keep that light where it is. Can you hold it and him both talking?"
> 
> Where you are: on the solid rock by the guy-ring, holding the rope, with Osric beside him · Time: Day 1 · morning

**Bram's player wrote:**

> “Aye. Take the line.”
> 
> I hand control of the rope over to Osric before unwinding it from my waist, then take the pinch-bar. Keeping my weight spread flat, I ease forward on my belly with the bar alongside me, following his directions.
> 
> “Pell, we’re lifting the block, not you. Tell us if it shifts against your leg. Once there’s room, pull clear if you can.”
> 
> By Sefa’s light, I work the flattened end beneath the block’s near edge as Osric indicated, looking for a sound purchase.
> 
> “Ready, Hale? Slow, together.”
> 
> Once he has the block’s rope ready, I bear down steadily on the bar, aiming to lift it just enough for Osric to roll it clear of Pell’s leg.

## player r8 (round 8)

**Screen:**

> Sefa braced her elbows on the crust, steadied the lit chalk in both hands until the light stopped shaking, and told Osric she would hold it. Then she called down the shaft to Pell, telling them not to pull or dig, that the block lay on the leg and not through it, to get your loop under their arms if it was near, not to fight it, and to answer twice so she knew they were still with her.
> 
> You put the hemp into Osric's fists at the ring. He takes two turns of it round his forearm and plants his boots on the grey rock. "Got it." You take the bar.
> 
> It's heavy, cold black iron, warm only where Osric's hands were. You go down flat with it lying alongside you and work forward on your belly and elbows the way Sefa did. Under your mail the crust takes your weight differently than it took hers. It gives a long dry groan deep in the timber, and white dust sifts off the rim of the hole into the light. It holds. Two lengths of a man from the rock, you can see straight down past Sefa's outstretched arms.
> 
> By her clear, steady light you find the near edge of the block, a straight pale line under the water, and feed the chisel lip of the bar down along it. The first time it skates off dressed stone. The second time it finds the gap where the block's edge sits on rubble, and it bites. You feel it bite all the way up the iron.
> 
> "Ready, Hale? Slow, together."
> 
> "Slow," Osric says from the ring.
> 
> You bear down. For a long moment nothing gives except your shoulders. Then the block lifts off the rubble a finger's width, then a hand's, and the bar bows a little under you. Behind you the hemp creaks through the old iron ring as Osric leans back on it, steady and not jerking. The line comes taut over the lip and the knots take the strain. The block turns slowly, a big squared shape rolling over on its long side through the water toward the face, the way the ring pulls. Black water heaves up round it and slaps the gallery walls. Then there's a sound under the surface, stone settling onto stone, and the bar goes light in your hands.
> 
> The block is off the leg. It lies a stride away against the rubble, turned a quarter over, and the face that was hidden now faces up, just under the water, with Sefa's light falling straight on it.
> 
> Up at the ring, Osric has seen the stone's face too. He stands very still with the hemp still wound round his forearm, and says nothing about it.
> 
> "Get him up," he says. "Loop's there."
> 
> Your records, changed:
> Carried: + Iron Pinch-Bar
> 
> Where you are: lying flat on the white crust at the rim of the shaft, bar in hand · Time: Day 1 · morning

**Bram's player wrote:**

> “Pell, block’s clear. Can you get the loop under your arms?”
> 
> I ease the pinch-bar back from the hole and lay it flat beside me, careful not to knock the loose rim.
> 
> “Hale, make sure we’re hauling Pell’s line, not the block’s. Slow once he says he’s secure.”
> 
> I stay spread flat, ready to guide Pell past the broken lip without dragging his injured leg against it. “Sefa, keep the light on him. We’ll look at the stone once he’s out.”
> 
> When Pell confirms he’s secure, I help guide him up as Osric hauls, then work backward toward the living rock rather than stand on the crust.

## player r9 (round 9)

**Screen:**

> Sefa's voice went down the shaft, low and clear: the loop was a yard to Pell's left, under his arms and not round the leg, and he was to say when it was on him. She keeps the light steady over the black water. Later she asked Osric quietly, without turning her head, whether he knew the stone they had carved. Her attention stayed on the shaft.
> 
> You pull the pinch-bar back from the hole a hand's width at a time and lay it flat on the crust beside you. The rim doesn't shed so much as a crumb. Then you look back at the ring. "Hale, make sure we're hauling Pell's line, not the block's."
> 
> Osric already has the hemp in both fists. He looks along it to the lip, then at the hole, and shakes his head once.
> 
> "Same line." He lifts the rope a little so you can see it run. "Ring, loop, then his knot to the silk, and the silk's round the stone. Haul now and he comes up with a block hung off him." He lets the rope settle again. "He casts the silk off down there. Knot or knife. Then it's his line."
> 
> He says it loud enough to carry down the shaft, and leaves it at that.
> 
> Then Sefa asks him about the stone. Osric doesn't answer straight away. His eyes go to the rim of the hole and the white light coming up out of it, and stay there.
> 
> "Never seen it." It comes out flat. "Thirty years on this hill. Didn't know there was a face on anything down there." He shifts his grip on the hemp. "Sun's the Morninglord's. Any fool knows that much." He thinks a moment. "In Beregost they say the temple's first stones came off this hill. Before the town was a town. That's the old men talking." He tips his head toward the shaft. "Him first."
> 
> He says nothing more about the stone. He hasn't looked at the sunburst again since it came up.
> 
> Below, under Sefa's light, the block lies a quarter-turn over in the water with its face to the roof. The finger-wide seam at its far end is still dark. Deep in it the pale something still gives back her light, dimly, and doesn't fade.
> 
> The hemp lies slack over the lip, running down to the loop at Pell's chest and the ugly knot below it. Osric keeps his boots planted at the ring with his hands on the rope and doesn't take it up. You lie flat at the rim, ready to guide. Nobody pulls until the word comes up from below.
> 
> Where you are: lying flat at the rim of the shaft, beside the hole · Time: Day 1 · morning

**Bram's player wrote:**

> “Pell, the silk below your loop is still tied to the block. Undo it or cut it clear—whichever you can manage. Tell us when it’s free and the loop’s secure.”
> 
> I stay flat, keeping my hands ready at the lip.
> 
> “No hurry on the knot, Hale. We wait for his word.”
> 
> I watch Pell by Sefa’s light, ready to help guide him over the edge once the line is clear and Osric starts hauling.

## player r10 (round 10)

**Screen:**

> Beside you, sharing the lip, Sefa keeps her gaze on the shaft. Her arms shake and she locks her elbows, letting the weight sink through her shoulders until the light steadies. She calls down to Pell in a clear voice: nobody hauls until he says so, he is to cast off the silk by cutting it or working the knot, keep the hempen loop, and say "ready" aloud once it's on him. Then she says something low, meant only for the warden, and you don't catch it.
> 
> You are flat on the crust with your hands at the lip, the pinch-bar lying along the rim where you left it. The crust under your mail gives one more long, dry creak and goes quiet.
> 
> Osric stays on the grey rock at the ring, both fists on the rope, boots planted, the turns still round his forearm. He answers Sefa after a pause: until Pell is out, the stone is only a stone, and after that it is still under his road. The hearth is laid and the kettle full, he says, but he will light it when Pell is on the rock and not before. He won't leave the rope. He looks at nothing but the line.
> 
> The hemp lies slack over the lip and runs down past your hands into the shaft of light. Below, the knot is still between the loop and the silk. The water stirs around Pell, and the wheel lies face-up beneath it. At the far end of the block the seam keeps its faint milky glow, steady. Nobody up top moves. The word has to come from the man in the water.
> 
> Where you are: flat at the lip of the shaft, by the ring · Time: Day 1 · morning

**Bram's player wrote:**

> I hold position, making no sudden shift on the creaking crust. My attention stays on Pell and the rope, not the glow below.
> 
> “We’re here, Pell.”
> 
> I wait for his signal before helping with the haul.

## player r11 (round 11)

**Screen:**

> Sefa says nothing and lets the quiet gather, her eyes fixed on the black water below, where her light lies in a pool. Her arms have stopped trembling and gone strangely steady, holding the light long past their strength.
> 
> Then the quiet breaks from below. There's a short wet rasp, a blade going through silk, and a slap as a slack line hits the water. Pell's voice follows, hoarse with cold and still with that bark of a laugh in it: the silk is clear, he's alone on the line, haul.
> 
> Behind you Osric leans back on the ring. The hemp comes in hand over hand, slow and even. Under Sefa's light Pell leaves the black water and walks the gallery wall up the shaft, good foot first, the bruised leg dragging after it. Chalk-water pours off him. Halfway up he starts to shake hard. Even so he gets his words out, loud enough to carry past your shoulder: a glass face with a glow of its own, under the road since before you were born. He'll not touch it, and he'll not tell Thorn.
> 
> Osric answers between pulls, flat. He didn't know there was a wall down there to be behind. Nobody's been in the third gallery in his time.
> 
> Pell's head comes up through the ragged rim right beside you. You're lying flat with your hands ready. You take a fistful of wet collar and keep the man's chest off the broken edge as the hemp drags him over. The rim crumbles under Pell's forearms and holds. You work backward on your elbows with him, a hand's width at a time, the crust groaning long and dry under two men's weight, until there's grey rock under both of you. Pell lies on it, dripping. He's pale under the chalk, shaking hard enough to rattle his teeth, and alive.
> 
> Sefa's light still hangs over the empty hole. Pell is out of it now, so she takes it back. When she draws her arm in, the white light slides off the water, off the face of the block and the pale tag of silk knotted round it, and up the shaft wall. As it leaves, the seam at the block's far end goes dark with it. The milky glow doesn't linger or fade slowly the way warm embers would. It's there while her light touches it, and then it's gone. The gallery below goes black, and the seep keeps trickling somewhere down in it.
> 
> Osric unwinds the hemp from his forearm, one turn and then the other, and looks down at Pell on his rock. "Glass I don't know," he says. "The low end I know a bit. Men worked long down there, they got heavy in the head. Sleepy." His jaw sets, as if he's said more than he meant to. "Fire first. Then the rest, what there is."
> 
> He goes off across the yard toward the house at his walking pace. Over his shoulder: "Kettle'll be on by the time you can walk."
> 
> Your pack sits where you left it on the living rock, with the case wrapped dry in its bedroll and the flap down. The pinch-bar lies along the rim of the hole on the crust, where you laid it. The hemp lies coiled once by the guy-ring. The sun has climbed a little. There's still a long half-day of road ahead and plenty of light to walk it.
> 
> A few breaths later, a thin grey thread of smoke goes up from the warden's chimney.
> 
> Nothing else here needs anyone this moment. The fire and whatever Osric means by "the rest" are waiting in the house, whenever the three of you want them.
> 
> Where you are: on the grey rock beside the shaft mouth, warden's yard · Time: Day 1 · morning

**Bram's player wrote:**

> “Found yourself a bath, then.” I crouch beside Pell. “Let’s get you warm.”
> 
> I take my bedroll from the pack, leaving the sealed case dry inside, and wrap it round his shoulders. “Sefa, how’s his leg? I can carry him if it won’t bear weight.”
> 
> I offer Pell my shoulder and help him toward the house, keeping to the living rock and letting him spare the injured leg. I bring my pack; the bar can wait.
> 
> “Whatever’s down there will keep. Wet clothes off by the fire first. Then Hale can tell us about those sleepy men.”

## player r12 (round 12)

**Screen:**

> You crouched beside Pell, greeted him with a remark about his bath, wrapped your bedroll round his shoulders (the sealed case stayed dry in the pack), and asked Sefa about his leg. Then you helped him toward the house over the living rock, bringing your pack and leaving the bar where it lay.
> 
> Sefa knelt on his other side. The light had gone out of her chalk and the warm stone sat in her palm. She took his wet sleeve and spoke to him in a soft, unhurried voice, then shook out a muddy-hemmed blanket from her own roll and laid it over your bedroll. The cold came off Pell in waves and she didn't flinch from it. She told you the glass and the sunburst should wait until the case was delivered and all of you were sitting at a table.
> 
> At the threshold Osric looked at the man coming in under two layers of bedding, dropped his own grey army blanket on top without a word, and went to the kettle.
> 
> That was a quarter of an hour ago. The mug by Pell's knee is empty now.
> 
> Pell said Tobin Reed's name to the fire. Then he told the warden that he'd written "drink" because the other thing had no name, and that he couldn't have told the lads to stop. Osric listened with his hands at his sides, saying neither yes nor no. When Pell finished, the warden closed the tally-book, not hard, the way you'd close a door on a sleeping room, and left his palm flat on the warped board a moment longer than he needed to.
> 
> Pell then asked three questions, and Osric answered them in order.
> 
> "Salt's always gone out. A sack or two a year to dyers in the Gate, through Tull. Since before my time." He looked at the shelf. "Her boxes, sealed, that's new. Since the thaw. One a month. Two last month. This one's the third since midsummer."
> 
> "Not a carter." He thought about it honestly. "Once. Back end of winter. Two men with a letter in Tull's hand. Walked the yard, counted the sheds. Asked how far down the water goes at the low end, and could it be pumped." His jaw shifted. "Didn't go down. I didn't offer. Good boots. They paid the carter in Amn silver for the ride up, Hob said. He bit it."
> 
> "The page." He tapped the closed book once with a knuckle. "Tull gets a fair copy every quarter. Wages, tools, deaths, all of it. Whether he reads it, ask him. Up here nobody reads."
> 
> Pell got up slowly, tried the shin and shouldered his pack. He said what he would do, and that Osric could hold him to it at the Red Sheaf: the case into Thorn's hands, the letter, her face when she reads *Vandarren*, and a careful question about what an apothecary wants with dye from a drowned gallery where men fall asleep. He added that Tobin's name was Osric's, and he'd not say it to anyone. Then he turned to you and Sefa: you were to see to the case, Sefa the letter, and he would walk the back again, this time where the warden says the rock is.
> 
> Osric heard that last part with his eyes on the fire, and nodded once.
> 
> At the door Pell, in a deadpan tone, handed the warden his own advice back: stay away from the low end, and never go alone.
> 
> "Nobody here to be alone with." It's nearly a joke, the first from him. It goes as soon as it came. "Leave the blanket on. Hob can bring it back."
> 
> Outside the glare is waiting. The hemp rope still lies coiled by the iron ring in the cut face, the pinch-bar lies on the crust at the rim of the hole, and a thin cold breath comes up out of the hole into the sun. The sun is still well short of noon. The track down to the Way is the one you came up, and there's half a day of road and daylight to spare.
> 
> Your records, changed:
> Carried: − Hempen Rope (50 feet); − Iron Pinch-Bar
> 
> Your journal, new:
> + Promise: Pell's Word to the Warden
> + Promise: Tobin's Name Is Osric's
> 
> Where you are: outside the warden's house at the salt works, in the yard · Time: Day 1 · morning

**Bram's player wrote:**

> “Mark that broken stretch before anyone else comes up, Hale. A cart won’t hear a warning.”
> 
> I recover my hemp rope from the ring on the solid rock and coil it onto my pack, leaving the pinch-bar rather than venturing onto the crust again.
> 
> Before we leave, I ask Osric to point out a safe way past the collapse to the track below. Then I take the lead, setting a pace Pell’s leg can manage.
> 
> “Give a word if that shin worsens,” I tell him. “We’ve daylight enough to walk sensibly. No prize for arriving on your face.”

## player r13 (round 13)

**Screen:**

> Sefa steps out into the white glare, the door swinging shut behind her on the smell of woodsmoke. She settles her pack and touches the pouch at her belt once. She tells you both plainly: the road now, while the sun is well up. She keeps the letter and will put it in Thorn's hand, you keep the case, and Pell is to say the moment his leg starts lying to him. She falls in at Pell's side, close enough to catch him, not so close as to hover, and gives the yard and the hole one short look back.
> 
> Pell stops by the hole on the grey rock, two strides back from the bad ground. The pinch-bar lies where you left it, flat along the ragged rim on the white crust, about ten feet past the edge of the rock, too far for him to reach. Cold air breathes up past it out of the shaft. The hemp is closer. He pulls it back through the iron ring in the face hand over hand, wet and gritty, coils it over his forearm and holds it out to you without a word. You take it and lash the coil to the top of your pack, above the case, which sits dry in the bottom.
> 
> Osric is back in his doorway. He sees Pell looking at the bar and tells him to leave it; he has a hook-pole.
> 
> You turn to him across the yard and tell him to mark that broken stretch before anyone else comes up, since a cart won't hear a warning. Then you ask for a safe way past the collapse. He says stakes and a rope across it, today. He thinks over the second question: face side, keep your hand on the stone. The rock runs on under the dust past the hole, two strides wide. Where the spoil stops at the bend, it's track on rock again all the way down. No cart's coming up till there's coin, but he'll stake it. He doesn't wave. He stands with his arms folded and the grey thread of his chimney going up behind him, and watches you go.
> 
> You go first along the cut face with one palm on the white stone, testing every step with your heel, and the ground answers with a dull solid knock each time. Sefa and Pell follow in your steps. Past the bend the white spoil thins to nothing and the track is honest rock again, pale and rutted, winding down off the hill.
> 
> Once on the track proper, Pell talks low. He puts it together for you both: the Amn silver, the two men with Tull's letter asking whether the low end could be pumped, then the boxes, one a month and then two, and the wardens' wages stopped in the same season. He starts a name, catches it, and says a cutter instead. He says he doesn't believe in that kind of luck. He asks that he be the one to hand Thorn the letter, so he can watch her read Vandarren before she knows you know the word. To you he says that if she's quick about it, you're to keep hold of the case until the ninety is on the counter, and then let go of it. Then he falls back about thirty paces behind, gaze on the dust, the grey blanket pulled tight over his straps.
> 
> You set a pace the bruised shin can keep, and tell him to give a word if it worsens.
> 
> The track comes down out of the hills the way you came up in the dark, but by day it's a different road. It runs through scrub oak and gorse, over dry stream-beds, past a shepherd's fold with no shepherd in it. The sun climbs. Pell's clothes steam, then stiffen, then dry, chalk cracking off him in flakes at the elbows and knees. The shaking leaves him somewhere in the second hour. The shin doesn't; by the third hour he walks like a man with one boot nailed on. But it holds, every step.
> 
> A little after noon the track tops the last rise, and the Trade Way lies below you, a broad brown ribbon running north and south through pasture and hedges. Far up it to the north, a smudge of forge smoke marks Beregost, a good three hours off at this pace. The sun is high and well short of turning. There's time in hand.
> 
> You stand on the crest and look the country over, because you have looked at it for ten years.
> 
> You know the hollow before you're properly looking for it. It's south of where the track meets the Way, about a mile off the road on the east side: a fold in the pasture with a stand of alders and a spring at the bottom. Caravans pull off into it when they're running late for Beregost or the inns are full. You've slept there yourself more than once, with the wagons drawn round and the fire under the bank. The old ruts still turn off the Way toward it. They're greener than they ought to be, as if fewer wheels have used them lately.
> 
> There's a ring of stones in the hollow, a windbreak, the kind teamsters pile against the night wind. Inside it, on the grass, dark shapes lie in rows. They're too regular for stones and too flat for men. There are no wagons and no animals, and no smoke. A few crows walk among the shapes, unhurried, and nothing chases them off.
> 
> From up here that's all there is to see. It's a mile off the road and a mile back, with the afternoon still ahead of you.
> 
> You're at the front, and you know that hollow. What do you do?
> 
> Your records, changed:
> Carried: + Hempen Rope (50 feet)
> 
> Your journal, new:
> + Thread: The Empty Camp in Alder Hollow
> 
> Where you are: on the crest above the Trade Way, at the front, looking toward the hollow · Time: Day 1 · midday

**Bram's player wrote:**

> I stop and point out the hollow to the others.
> 
> “Caravan camp. Good spring, shelter under the bank. I’ve slept there. Those rows are new—and there ought to be wagons if someone’s using it.”
> 
> I study the shapes from the rise, shading my eyes, looking for movement or anything I recognise as clothing, bedrolls or discarded harness.
> 
> “That’s two miles extra to look properly, with Pell limping. Unless we see someone needing help, I say we keep for Beregost and report it. But have a look before we move.”

## player r13 card 1 (round 13)

**Screen:**

> Pell labours up the final stretch of the rise, slower than he would like, and halts just behind you, bent over with his hands braced on his knees to catch his breath. He follows your gaze south, shading his eyes against the glare. He asks what you see, and wants to hear what you think it is before you point it out. Then he reckons the day aloud: three hours to Beregost, four with his bad leg, and sunset about six hours off. That leaves some slack, but a detour of a mile out and a mile back costs an hour you won't get again, and you are carrying the only coin on the hill. If it's only a drover's fire, he says, you walk on. If it's an empty camp a mile from the Way, the day after the men of a quarry came down this same road, he lets the thought trail off. Then one of you should look, and he says it should be him, since he can get close unseen. He would work from the hedge line and take ten minutes at most. He won't go in alone: Sefa would stay at the hedge where they can see each other, because the rule today is that nobody goes alone. He waits on your answer.
> 
> Sefa comes up level with you and looks down at the hollow. Quietly, she says you've gone as still as a man counting, and asks what it is. She points out the rows and the ring of stones, and says it could be drovers, or what's left of them. She asks whether you look, or keep to the Way and report it to the Fist or the temple. She says she has light and a steady hand for the dead if that's what lies down there, but she won't walk the three of you into an ambush just for a look. She glances back for Pell.
> 
> You stand still on the crest for a long moment, working out what the thing below is before you say it.
> 
> (A roll card for Bram Halloway, your character. Only you press it.)
> 
> [Roll card] Bram Halloway · Skill check — Perception: reading the camp in Alder Hollow from the rise, a mile off
> What adds to the die: +4 Perception
> DC 15
> Rerolls left: 2
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Bram's player wrote:**

> [Roll the die]

## player r13 card 1 (round 13)

**Screen:**

> (A roll card for Bram Halloway, your character. Only you press it.)
> 
> [Roll card] Bram Halloway · Skill check — Perception: reading the camp in Alder Hollow from the rise, a mile off
> What adds to the die: +4 Perception
> DC 15
> Rerolls left: 2
> Die: 15
> 15 + 4 = 19
> Success — 19
> 
> [Onward] [Request an allowed reroll — Perception: reading the camp in Alder Hollow from the rise, a mile off]

**Bram's player wrote:**

> [Onward]

## player r14 (round 14)

**Screen:**

> Then you point it out, and say what you make of it.
> 
> You read it the way you'd read any camp you were riding into. Your eyes find the detail a mile off and hold it. The dark shapes are bedrolls. There are twenty or more of them, laid out in rows inside the windbreak with their feet toward the middle, the way a caravan beds down round its fire. In the middle of the ring is a round black scar where the fire was. The bedrolls are spread out flat, not rolled and not slept in. They're a dull grey-brown, sunk into the grass the way cloth goes after rain and sun and more rain. That takes weeks, not days. The crows walk between the rows and stab at the ground, at spilled meal or whatever's left of somebody's rations.
> 
> You can also see what isn't there. No wagon stands in the hollow and none has been burned in it. There are no mule carcasses, no dropped harness, no gap kicked in the windbreak where men broke out, and nothing scattered. At the mouth of the hollow the grass lies pressed in two broad, pale stripes. Wagons went out that way onto the Way, heading south, a long time ago. Ten years on this road have taught you how a camp looks after it fights: gear everywhere, a cart on its side, a dead animal, something torn. A camp that breaks up and moves on rolls its beds. This one did neither. Its people lay down, and their beds are still lying there.
> 
> Beside you Pell shades his eyes and looks hard, but the glare beats him; he squints at the pasture and the dark smudge of the alders. The ground between here and the hollow is another matter. A hawthorn hedge follows the old ruts down from the Way almost to the alders, a little higher than a man. Where it stops there's about a hundred feet of open grass before the windbreak, and no cover on it at all. The alders are thick round the spring. Anyone sitting in them could watch the whole of that open stretch, and nobody on the grass could see in.
> 
> North, the forge smoke over Beregost stands up straight in the still air. The sun is a little past noon.
> 
> Where you are: on the crest of the rise above the hollow, beside the Way · Time: Day 1 · midday

**Bram's player wrote:**

> “Beds,” I say. “Twenty or more, laid round the fire. Been weathering there for weeks. Wagons left south. No wrecks, no scattered harness, no sign of a fight. But nobody packed their bedding.”
> 
> I point out the bare stretch before the windbreak. “And anyone in those alders could watch you cross that.”
> 
> I turn to Pell. “Not yesterday’s quarry lads. And not ten minutes on that leg. I’d look if we weren’t carrying someone’s goods against a deadline—but this has waited weeks.”
> 
> “Let’s deliver the case, report exactly what we’ve seen, and ask whether a caravan’s missing. Then we can come back with daylight and sound legs, rather than creep in half-ready.”
> 
> I take a last look to fix the place in memory, then turn toward Beregost, keeping our pace manageable for Pell.

## player r15 (round 15)

**Screen:**

> Sefa keeps back a pace from the lip of the crest and reads the same signs you do: no smoke, nothing moving, no voice, only crows. She says that if someone down there were calling for help they'd have heard it, and that no one carries a warning faster by arriving dead or limping after sunset. She tells Pell he may take his look from the hedge if his leg allows and he keeps within her sight, but unless he finds someone alive they touch nothing and don't linger. She sides with you on telling the right ear in town. Then she settles her pack and starts down toward the Way, saying they'll wait down on the road and not up on the hill.
> 
> Pell blinks the glare out of his eyes and says that from here he sees only crows and shapes, and that he'll take your read of the rows over his own, since you've slept there. Then he gives the ground: the thorn hedge runs along the old ruts almost to the trees, cover all the way, and then a hundred feet of open grass that nobody crosses unseen. His cheap version is half a mile behind the hedge to where it ends, no step onto the grass, Sefa at the hedge where she can see both of them, and you on the crest with the case. If he sees a reason to go further he'll come back and say so first. If you would rather walk on, he says, you only have to say it, and he'll walk. He'd just hate to find out tomorrow that someone was alive down there at noon.
> 
> You take your last look and fix the place. For a man who has driven this stretch for ten years it is easy. The old ruts leave the Way beside a stunted ash with a split crown, the only tree on that side of the road for a long way. The hedge runs east from there. The hollow sits under the second fold of the pasture, where a ribbon of the spring shows silver for a moment between the alders. You could walk a Fist sergeant straight to it in the dark.
> 
> Nothing has changed in the hollow. A crow lifts, flaps a few lazy beats over the windbreak and drops again a row further on. On the Way below, a single ox-cart creaks north toward Beregost, piled with hurdles, its driver asleep on the seat with his hat over his face, the ox seeming to know the road without him. The forge smoke stands straight over the town. The sun has barely moved off noon.
> 
> You have already turned your shoulder toward Beregost. Sefa is a dozen steps down the slope toward the road. Pell stands on the crest with the hedge-line below him, his weight off the bad shin.
> 
> Where you are: on the crest above the hollow, turning toward Beregost · Time: Day 1 · midday

**Bram's player wrote:**

> “I’d rather we walk on, Pell. Can’t swear there’s nobody alive there, but I’ve seen no sign of it. That’s not enough to send you down on a bad leg while we split three ways.”
> 
> I join Sefa on the road and wait for Pell to come alongside.
> 
> As we approach the ox-cart, I call from beside the road, well clear of the animal. “Ho, driver! Heading to Beregost? Could you spare a seat for a man with a hurt leg?”
> 
> If he wakes, I also ask, “Passed the alder hollow lately? There’s a camp’s bedding abandoned out there. Wondered if you’d heard what happened.”

## after 1 (round 15)

**Screen:**

> Sefa turns on the slope a dozen steps down and climbs back toward the crest, unhurried, saying her piece as she goes: if anyone looks, they all go, ten minutes at the hedge end, nobody out of sight, and back to the Way if it's only crows.
> 
> She's halfway up when Pell starts down off the crest toward her, favouring the shin. He says he'll walk it. He doesn't drop back to thirty paces this time but falls in at Sefa's shoulder, close enough to be caught if the leg goes, and goes over it aloud: twenty beds left out for weeks, the wagons gone south, nobody took their blankets. Drovers don't own twenty bedrolls, he says, and a caravan master doesn't leave them out to the weather. Then he lays out a plan: Beregost, the case, the ninety on the counter, the letter in Thorn's hand, which he asks to deliver himself if Sefa will let him. After that the Red Sheaf, and somewhere along the way a Fist sergeant or a priest who'll know whether a caravan is missing. Last of all, so it's said while he can't argue, he says that if they ever come back, it's he who will go out to the end of the hedge.
> 
> You don't stop to argue it again. You go down the last of the slope onto the Way and wait on the verge for the other two.
> 
> The ox-cart hasn't got far. It's ahead of you on the brown road, going north at the speed of an animal that has decided the whole day is its own. It's a two-wheeled thing, piled shoulder-high with woven hazel hurdles roped down in a stack. The driver is still asleep on the seat with his hat over his face, one boot up on the shaft.
> 
> You stay well clear of the ox and call out in your road voice: "Ho, driver!"
> 
> The ox stops dead.
> 
> The driver doesn't wake for a moment. He sways forward with the jolt, catches himself on the seat-rail and pushes his hat up. He's an old man, brown as a saddle, with white stubble and pale eyes creased from squinting at fields. He looks at the ox first, as if it owes him an explanation. Then he looks at you, the mail and the shield, and his shoulders go stiff for a moment before he takes in the limping man in a grey blanket and the woman beside him.
> 
> You ask him for a seat for a man with a hurt leg.
> 
> "Seat's mine." The old man sniffs and jerks a thumb back over his shoulder at the stack. "Tail's free. Room on the tailboard for one, if he keeps a hand on them hurdles over the ruts. Lose me one in the ditch and he walks." He looks Pell over, chalk-white to the collar. "Fell in a lime pit, did you, lad?"
> 
> He doesn't wait for an answer. You ask your second question, about the hollow and the bedding, and the old man's face changes. He doesn't look toward the hollow. He looks the other way, north up the road.
> 
> "Don't go off the road. Not me." He scratches his jaw. "Sleep on the seat, I do, and Bess there knows the way home." The ox flicks an ear. "But there's talk. Wagons going south and not getting to Nashkel. Three this year, or four, depends who's buying. My brother says it's gnolls down out of the hills, carrying folk off." He shrugs, as if his brother says a lot of things. "There's a notice at the Jovial Juggler in Beregost. Fist put it up, market day before last. A woman sergeant, Kell. Coin for any word on lost wagons, it says. Somebody read it out." He settles his hat. "So that's your somebody, if you've a tale. Not me. I make hurdles."
> 
> He gathers up the reins, though Bess plainly doesn't need them.
> 
> "Wick," he adds. "Dunstan Wick. Beregost by mid-afternoon at her pace. Getting on, or not?"
> 
> The tailboard stands empty behind the hurdles, about knee-high, for whoever wants it. The forge smoke over Beregost stands straight up in the north, and the sun has barely moved past noon.
> 
> Where you are: on the Way beside the ox-cart · Time: Day 1 · midday
> 
> The session is over.
> 
> How was the table?

**Bram's player wrote:**

> Good table overall. Bram had useful work to do: speak to Hale without threatening him, help get Pell out, and read the abandoned camp using his road experience. The unpaid wages made a straightforward delivery interesting without immediately turning it into a fight. Osric felt like a person rather than a quest dispenser.
> 
> The strongest scene was the quarry rescue, though it stalled for several rounds while we waited for Pell’s signal. In the round-based format, those repeated “hold position” turns became awkward. Some information also arrived as though Bram had already heard it—Pell’s initial instructions from below, and later the discussion of Tobin Reed—when it hadn’t appeared in my updates.
> 
> The hollow presented a good choice, but after Bram clearly voted to continue, it took several exchanges to resolve. A quicker group decision would keep that tension from becoming repetition.
> 
> I’d happily continue. Delivering the case, watching Thorn’s response, and reporting the camp to Sergeant Kell give us clear next steps without forcing us down one path.

## after 2 (round 15)

**Screen:**

> Was there something you wanted to do and didn't?

**Bram's player wrote:**

> Yes—mostly small things:
> 
> - **Check Pell’s leg properly after the rescue.** I asked Sefa about it, but we moved through warming up and departure without a clear answer about how badly he was hurt or whether he needed treatment. I wanted that settled before committing him to the walk.
> - **Ask Hale what he knew about the sleepy workers.** Bram explicitly wanted to hear “the rest” by the fire. The next update arrived after a conversation involving Tobin that I hadn’t heard, so I never quite got to ask my own questions.
> - **Get a closer look at the abandoned camp.** I was genuinely interested, but Bram chose the delivery and Pell’s safety. That’s a satisfying thing left undone—a consequence of priorities, not a missed opportunity the GM needed to fix.
> 
> I also wanted to help Pell onto Wick’s cart and thank the driver, but that’s an easy opening for next session.

## after 3 (round 15)

**Screen:**

> Who did you take the other two players to be?

**Bram's player wrote:**

> I took them to be the players controlling **Pell Dunmore** and **Sefa Marrin**, with the GM relaying their independently chosen actions and dialogue to me each round—not NPC companions I could command.
> 
> Pell came across as curious, suspicious, and willing to risk himself to uncover something. Sefa seemed compassionate and cautious, focused on keeping people alive and together. Those were impressions of their play and characters; I had no information about who the players were outside the game, or whether they were humans or AI.
