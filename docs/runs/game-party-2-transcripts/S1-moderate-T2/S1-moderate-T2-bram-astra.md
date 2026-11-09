# S1-moderate-T2 — Bram Halloway's player: GPT-6 Astra

Synthetic content: invented characters in an invented campaign. Stage origin/claude/handoff at bbdee5fb (docs/stages/GAME_PARTY_2.md with its amendments of 2026-10-28 23:10 LA, 23:15 LA, 2026-10-29 18:35 LA and 18:45 LA); Mandate: issue #1; docs/POLICY.md v1. Design sha256 `ba4e78d0f9b25e65f2c91ff2993bbc086d663ebc0fe566fa6889b187a2f06046`.

Arm **S1-moderate** (Beregost — the Whitestone case; moderate (one resource)); the one in danger (the layer's die): Pell Dunmore. 11 round(s) of 15; ended by error (r11: the DM's turn failed (validation)). Models: the DM: the owner's settings (Claude Opus 5.5); the relay: Claude Sonnet 5.5; the players by the seating.

Seats: Bram Halloway (fighter) — GPT-6 Astra; Sefa Marrin (warlock) — DeepSeek V4 Pro 0813; Pell Dunmore (rogue) — Claude Fable 5.1. The order of the round's messages turns round each round from the table's coin (2). The players are not told what the others are.

The player's system prompt: `playerSystem("S1", "bram", …)` in scripts/game-party-2/frozen.mjs, sha256 `c7d855f579a8e47a5256b6735ef5cddfd57e583ba85ed8b7cd53d9a662e28407`.

## player r1 (round 1)

**Screen:**

> The session begins.
> 
> The cart track bends one last time, and Whitestone opens up before you: a white wound in the hillside, terraces of chalky stone glaring in the late-morning sun, dust drifting across a yard of spoil heaps and sheds. You, Pell Dunmore and Sefa Marrin have covered half a day of road since before dawn, and half a day back, Maela Thorn's shop waits for a sealed case that must reach it before sunset.
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
> Where you are: at the edge of Whitestone quarry yard · Time: Day 1 · morning
> 
> Round 1 — what does Bram Halloway do?

**Bram's player wrote:**

> “Quiet for a working quarry,” I murmur to Pell and Sefa.
> 
> I walk into the yard toward the house, shield resting low and sword sheathed, watching the sheds and lower cut for movement as I go. I stop a few paces short of the man, leaving his doorway clear.
> 
> “Morning. Bram Halloway. Maela Thorn sent us for her case of dye-salts. Are you the warden?”
> 
> I glance back at the abandoned cart. “Have we come at a bad time?”

## player r2 (round 2)

**Screen:**

> Behind you, Pell dropped back half a pace behind Sefa's shoulder and kept his eyes on the yard. He quietly noted that the quarry had gone silent, with tools down, a cart half-loaded and no mule, and that nobody knocks off mid-load unless they ran or were told to. He said you should do the talking, that he would stay back and watch the sheds, and that Sefa should not go in first if the man invited you in. He then called out in an easy, friendly voice that Maela Thorn had sent you up from Beregost for the case, and asked whether the man was the warden. Sefa stopped at the edge of the spoil heaps with her hands open and raised no higher than her shoulders. She remarked that there was no ring of iron and no mule in the traces, and said she wanted the case in hand before you learned whether the warden was the reason or the victim. She called toward the doorway that you were from Maela Thorn's shop in Beregost, sent for a sealed case before the coach left at sunset.
> 
> You stopped a few paces short of the doorway and left it clear. The man in the apron looks at you and at the sheathed sword, then past you to Sefa's raised hands and to Pell hanging back. He takes his time with each of them.
> 
> "Hale," he says at last. "Osric Hale. Warden." His voice is low and rough with dust. "Bad time." He jerks his chin at the empty cart. "Lads walked off yesterday at the noon bell. Three weeks, not a copper from the Gate. Can't say I'd have stayed."
> 
> He lets his arms drop from his chest, and one hand rests on the ring of keys.
> 
> "Case is here. Sealed, like she wants it." He looks at you, then at Sefa, because she was the one who said *before sunset*. "She paid for that salt, your Maela. Somebody took her money. Wasn't me, and it wasn't my men." He stops there, and nothing on his face moves. "Who'd she pay?"
> 
> He doesn't wait to watch you answer. He turns and goes back inside, leaving the door open behind him. The heat of a small fire comes out into the bright yard along with the smell of a kettle that has boiled too long. Through the doorway there's a plain table and a single chair, a shelf of ledgers, and an iron-bound box about the size of a loaf of bread on the floor by the hearth, right at his feet.
> 
> Your journal, new:
> + Goal: The Whitestone Case
> + Quest: The Whitestone Case
> 
> Where you are: in the quarry yard, a few paces from the warden's open doorway · Time: Day 1 · morning
> 
> Round 2 — what does Bram Halloway do?

**Bram's player wrote:**

> I move to the threshold, staying where Pell and Sefa can see me, and keep my hands away from my weapons.
> 
> “She didn’t tell us who took payment. Hired us to collect a sealed case from you and carry it back. That’s all we were given.”
> 
> I nod toward the ledgers. “Ten years guarding wagons taught me that the man carrying the goods isn’t always the man holding the purse. Who owes your lads their wages?”
> 
> “Is there a receipt or a message we can take back with the case?”

## player r3 (round 3)

**Screen:**

> You step up to the threshold, where Pell and Sefa can still see you, hands well clear of your weapons. You tell Osric Hale that the woman who hired you never said who took payment, only that you were to collect a sealed case and carry it back. You add that ten years guarding wagons taught you the man with the goods isn't always the man with the purse, and you ask who owes his lads their wages, and whether there's a receipt or message you can take back with the case.
> 
> Out in the yard, Pell speaks low to you and Sefa. He reads the tracks as the whole crew walking off together, and the sledge stood handle-up as a quarrymen's sign that they are owed. He says Osric is bargaining, not stalling. He tells you to answer straight: you don't know who she paid, you are hired hands like his lads, ninety gold between three of you. He tells Sefa to stay in the doorway and says he will keep the yard. He adds that if Osric names a price for letting the box leave the floor, you shouldn't agree before you've heard the number.
> 
> Inside, Osric has his back to the fire. He hears you out without moving or interrupting. At your question about who owes the lads, his eyes go to the ledger shelf and stay there.
> 
> "Vandarren." He says it like the name of a bad well. "House in the Gate. Owns this hill on paper. Never seen one of them up here. Their factor takes the money. Man called Hask." He pulls a folded letter from between two ledgers and drops it open on the table where you can read it from the door. The hand is good, the paper better. *Wages to follow by the next coach.* It's dated five weeks back. "Next coach came. Wages didn't."
> 
> He looks at the case by his boot, then at you.
> 
> "Receipt I can write. Weight, seal, day it left. And what's owed. Fourteen men, three weeks. Fifty gold and some silver." He says it flat, like a tally he has added more than once. "Your Maela paid somebody for that salt. You don't know who. She does. She writes it down, who and how much, and that paper goes to my lads at the Red Sheaf in Beregost. Tonight. Not up here to me. To them." He pauses. "One of you gives me a name on that, the case goes with you."
> 
> Osric takes a ledger down from the shelf and opens it on the table. He sets a bottle of ink beside it and begins to write, slowly, pressing hard. The kettle ticks on the hob. The case sits where it was, at his feet.
> 
> Where you are: at the threshold of Osric's office · Time: Day 1 · morning
> 
> Round 3 — what does Bram Halloway do?

**Bram's player wrote:**

> “Bram Halloway. Put that down.”
> 
> I glance back at my companions, then meet Hale’s eyes.
> 
> “I’ll ask Maela for a signed account of who she paid and how much, and take it to your lads at the Red Sheaf tonight. If she refuses, I’ll go there anyway and tell them so. I can give you my word on what I’ll do—not on what she’ll write.”
> 
> I nod toward his letter. “Let me copy Hask’s promise and its date to show her. Who should I ask for at the Sheaf?”

## player r4 (round 4)

**Screen:**

> Sefa stepped up to the edge of the doorway's light, staying outside, and gave Osric her name. She pledged that if the case left with you, she would go to Maela Thorn's shop in Beregost, have Maela put in writing, sealed and in her own hand, who was paid and how much, and bring it to the crew at the Red Sheaf before the night was out. She said that if the case wasn't with Maela by sunset none of you would be paid, so her wages stood behind the promise, and that she would sooner see fourteen men get their due than hand a sealed case to Vandarren and call the job done.
> 
> Pell spoke from the door-post, past you. He said Vandarren was old money in the Upper City, and that a man whose factor has a fine hand and good paper is holding coin, not short of it. He offered to carry the paper to the Red Sheaf, since he was passing its door tonight anyway, and gave his name as Pell Dunmore, Lower City. He said what Maela writes about her payments is her business; all you could promise was that she is asked, in front of the crew. Then he asked Osric about the lowest shed by the cut: barred from outside, the dust before it smooth, his lads having walked round it yesterday without going near. Powder store, or something Osric would rather you didn't carry back?
> 
> Osric heard all three of you out with the pen in his fist and didn't look up until you had finished. Then he wrote, slowly, pressing hard, saying each name under his breath: Halloway. Marrin. Dunmore. He turned the ledger toward the door so you could read it: one case, sealed, Thorn's mark, seven pound and some, left Whitestone this day. Owed the crew, fourteen men, three weeks: fifty-two gold, six silver. Your three names stand beneath it in his heavy square hand.
> 
> "Your pay behind it," he said to Sefa, not quite as a question. "Good. Means you'll walk fast." To Pell: "Not cheap to me." To you he said nothing at first. He pulled a clean leaf from the back of a ledger and pushed it across the table with the ink bottle and the Vandarren letter, setting the pen on top. "Copy it. Letter stays here." Then, to your other question: "Wat Pryor. Carter. Took the mule. Owed the most, so he'll be loudest. Ask for Wat."
> 
> When Pell brought up the shed, Osric's hand came off the page and settled on his ring of keys.
> 
> "Cutting-shed for the low seam. Seam's flooded. Shut it three years back." He said it without a pause and without heat. "No powder. Nothing in it you'd carry. Bar's mine."
> 
> He gave nothing more. To you he looks like a tired man in his fifties answering a dull question. His hand stays on the keys for a breath, then goes back to the pen.
> 
> He blots the page, tears the receipt out along the fold and lays it on the table. With a grunt he lifts the iron-bound case off the hearthstone and sets it beside the receipt. Thorn's wax seal on the hasp is whole. He leaves it there next to the blank leaf and the ink waiting at your elbow, and sits back in his one chair.
> 
> "Yours," he says. "Fifty-two and six. Wat Pryor."
> 
> The kettle has boiled almost dry and ticks on the hob. Outside the yard is as still as before, and down by the lower cut the barred shed sits in its smooth white dust.
> 
> Your journal, new:
> + Promise: Bram's word to Osric
> + Promise: Pell's word to Osric
> + Promise: Sefa's word to Osric
> 
> Where you are: inside the warden's hut, at the table with Osric · Time: Day 1 · morning
> 
> Round 4 — what does Bram Halloway do?

**Bram's player wrote:**

> I copy the letter carefully, including its date, and let the ink dry before folding it with the receipt and stowing both safely.
> 
> “Wat Pryor. Fifty-two gold, six silver. I’ll find him tonight.”
> 
> I check the case’s handle and fastening without disturbing the wax, then lift it, keeping my shield arm free.
> 
> “Thank you, Hale. Your kettle’s near dry.”
> 
> Outside, I pause beside Pell and Sefa. “Case and papers secured. Let’s get our wages earned while there’s daylight.” I keep my voice low. “Anything else we need to know before we take the road?”

## player r5 (round 5)

**Screen:**

> You sit on the corner of the table, since the room has only the one chair, and copy the letter slowly, with its date, the good hand's *Wages to follow by the next coach* and the Vandarren name at the foot. You wait for the ink to dry, which takes a few minutes in that warm room. Osric doesn't hurry you. You slide the letter back across the table with the pen and ink bottle, and he puts it between the same two ledgers it came from. You fold your copy and stow it with the receipt. When you mention the kettle, Osric looks at it as if he'd forgotten it was there, lifts it off the hob with a corner of his apron and sets it on the hearthstone, where it hisses.
> 
> "Third time this morning."
> 
> Pell, meanwhile, lifts the case once by the handle, turns it to the doorway light and studies the wax over the hasp, then sets it down. He folds the receipt and puts it inside his jerkin. He tells the warden that, whatever Maela makes of it, the fifty-two and six will be laid before Wat Pryor in writing. Osric nods once.
> 
> "Do that."
> 
> The wax went on in one pour, Thorn's mark pressed clean into it, no second skin at the edges, and the hasp under it looks unworked. You check the handle and fastening without disturbing it, then lift the case in your sword hand, keeping your shield arm free.
> 
> Sefa steps just over the threshold and bends to look at the wax all the same. She says quietly that she'll hold the sum, fifty-two and six, in mind like a prayer until she has put it in Wat Pryor's hand, and she tucks a receipt into her belt against her book. Osric looks at her for a long moment.
> 
> "Say it true, then. Wat can tell when it isn't."
> 
> That's all he has for her. He sits back in his one chair and doesn't get up to see you off.
> 
> Out in the yard the sun has climbed and the white dust throws it back hard enough to make your eyes ache. Pell lets his glance cross the barred shed once more. He says you'll go down the way you came, since the crew's tracks go that way and they're the ones to carry good news to. The cart track runs along the lip of the lower cut with the crew's trampled band of boot prints in it. Sefa comes out of the doorway into the glare. Behind you the warden's door stands open. Inside, the kettle has stopped ticking.
> 
> Your records, changed:
> Carried: + Bram's Copy of the Vandarren Letter; + Sealed Case of Dye-Salts
> 
> Where you are: yard outside the warden's hut, by the cart track · Time: Day 1 · morning
> 
> Round 5 — what does Bram Halloway do?

**Bram's player wrote:**

> “Aye. Same road back.”
> 
> I set off with Pell and Sefa along the crew’s tracks, carrying the case on the side away from the cut. Near the quarry edge I keep to the firm inner part of the track, watching for loose ground; farther on, I keep an eye on the road ahead.
> 
> “Let’s keep a steady pace. I’d rather reach Maela with time to talk than have her buyer loading the coach while we ask after Hask.”

## player r6 (round 6)

**Screen:**

> You agreed to take the same road back, and set off with Pell and Sefa along the crew's tracks, keeping to the firm inner edge with the case on the side away from the cut. You said you wanted a steady pace, so that you'd reach Maela with time to talk before her buyer had the coach loaded. Sefa said to keep the case between you all, neither out front nor trailing, and that she would watch your backs. Pell walked quietly beside you for a while. Once the hut was out of earshot he spoke low about the shed: its bar was worn bright, so it was opened regularly, and he didn't want to go back but wanted it known between you. He unslung his shortbow, unstrung, and took the outside of the track above the lower cut.
> 
> You are forty paces past the last spoil heap when Pell's next step lands on ground that booms like a boot on a floorboard. The crust of white dust folds inward with a crack of old timber, and the track takes Pell straight down.
> 
> You stand on the firm inner edge, six feet from a hole that wasn't there a breath ago. Fresh dust is still running in over its lip. Around the hole the ground is grey under the white crust, with rotten timber showing through. Sefa is beside you. Looking down past the broken edges, you can see Pell in a shaft of light, about eight feet below, chest-deep in black water, head and shoulders up. A squared white block lies across his leg. The seep keeps trickling in.
> 
> Back at the house the door bangs. Osric Hale comes down the slope at a heavy, rolling run, his keys clashing, and stops a long stride short of the grey ground. He looks down into the hole, and for the first time today his face plainly shows fear, and it isn't for himself.
> 
> "Low seam," he says, hoarse. "Runs under the track. Thought it ran deeper." His eyes go to the water, then to Pell. "Don't stay down there."
> 
> Your journal, new:
> + Thread: Pell under the sunburst block
> 
> Where you are: on the firm track edge beside the hole, near Osric Hale · Time: Day 1 · midday
> 
> Round 6 — what does Bram Halloway do?

**Bram's player wrote:**

> I set the case well back on firm ground, shed my shield beside it, and pull out my rope.
> 
> “Pell, rope coming. Under your arms if you can—tell us what’s holding your leg. We won’t haul against it.”
> 
> I make a fixed loop wide enough for his shoulders and lower it toward him from the firm inner edge, keeping my weight back from the rotten timber.
> 
> “Sefa, help me hold him above water. Hale—fetch a long stout beam or a quarry lever. And tell us what else is down there.”
> 
> I brace to take the rope’s strain once Pell has it secured, without trying to wrench him free of the block.

## player r7 (round 7)

**Screen:**

> You set the case well back on firm ground and lean your shield against it. Beside you, Sefa kneels well back from the grey ground and works a loose wedge of chalk-stone out of the track. She calls down to Pell to keep still and not to turn his leg under the block. Her hand flares and light runs into the stone like oil soaking a wick, until it glows a steady white in her palm. She tosses it underhand. It drops past the broken edge, clips a splinter of old timber and comes to rest on the ledge just above the waterline. From there it lights the whole low chamber.
> 
> From above it all looks harder and closer than the daylight let on. Black water fills the chamber wall to wall. The rose-white crystal glitters above the waterline in its crusts. The tarred prop lies half-sunk against the near wall, and the squared block lies across Pell's leg with its sunburst turned up to the light. Next to the ledge where the block came from, the wall stops being tool-scored stone. A patch about the size of a cupboard door has been plastered over smooth, old and grey, with the edges feathered into the rock by someone who took care over it. The slide knocked a corner off, and behind the break there is darkness.
> 
> Sefa holds her hand out to you and asks for your arm. When you give it she murmurs to the Lantern, and warmth goes from her fingers into your forearm and settles there like a coal held in a cupped hand. It is a short prayer, the kind that lasts for one push and not much longer, and she has to keep her mind on it while it lasts. She then tells Osric that she needs rope, and planks or a timber to lay flat and spread weight if you have to work near Pell. She warns him not to walk on the grey ground, and says Pell is chest-deep and pinned, so there are minutes, not an hour.
> 
> You move fast. You shake out your rope and tie a fixed loop wide enough to pass over a man's shoulders. You call down to Pell that the rope is coming, that he should get it under his arms if he can and say what holds his leg, and that you won't haul against it. Staying on the firm inner edge, you plant your heels and let the loop down over the broken lip. It goes through the shaft of light and settles on the water within easy reach of Pell's hands. The rope runs taut from your fists to the hole, and your weight stays back where the ground is white and sound. You ask Sefa to help hold him above water, tell Osric to fetch a long stout beam or a quarry lever, and ask what else is down there.
> 
> From where you kneel you can see the block properly, and what you see you have seen before, on the Trade Way, under an overturned wagon. The block's underside is jagged. Its edge sits down in the shin, and in the light a thin pink thread curls up through the water from under the stone and drifts away with the seep. The stone is crushing the cut and holding it shut at the same time. As soon as the weight comes off, the leg will bleed all at once, and in cold water a man goes under fast from that. Whatever healing you mean to use has to be in someone's hand and ready the moment the block moves, not fetched afterward. Lifting it is not the hard part. With the stone the size of a sea-chest and that tarred beam lying right there for a lever, two people can shift it in a few minutes. One of them works the bar or the beam under the block's edge, and the other takes the weight on a rope.
> 
> Osric doesn't answer straight away. He is already moving. He goes at his heavy rolling run to the lifting frame and comes back dragging two long planks off its staging, with an iron pinch-bar as long as a man across his shoulder. He stays a full stride short of the grey ground. Leaning on the planks, he shoves them out one after the other over the rotten crust so they lie flat along the near side of the hole, reaching from firm ground to the broken lip. He drops the pinch-bar on the sound ground beside your boot with a clang.
> 
> "Bar." He jerks his head at the hole and doesn't look away from it. "Prop's down there with him. Tarred. Won't rot." When you ask what else is down there, he takes a moment, and his eyes go across the glittering walls. "Old cuts. Run back under the hill. Roof's bad all the way." He stops. "Water comes in slow. Don't want anyone down there longer than it takes."
> 
> He doesn't step onto the planks. He stands at their landward end with one boot on each to hold them steady, and he watches the light on the water.
> 
> The seep goes on trickling in, and the water around the block barely moves with it.
> 
> Your records, changed:
> Carried: − Sealed Case of Dye-Salts; − Shield
> Conditions: Guidance: +1d4 to one ability check
> 
> Where you are: on the firm inner edge of the hole, holding the rope down to Pell · Time: Day 1 · midday
> 
> Round 7 — what does Bram Halloway do?

**Bram's player wrote:**

> “That stone’s holding a bad cut shut,” I tell Sefa. “Have your healing ready before we shift it. Soon as his leg’s clear.”
> 
> “Pell, I’m coming down to work the lever. Leave the stone until we’re ready.”
> 
> Once Pell has the loop secured, I hand the rope to Hale. “Hold him steady from solid ground. When he’s free, you haul. Sefa, can you cover him from here?”
> 
> I leave my sword and pack beside the case, keeping my healer’s kit with me. Staying low on the planks to spread my weight, I work toward the opening and lower myself down as carefully as I can, using the iron bar if the tarred prop won’t serve. I want a firm purchase under the block before applying pressure.
> 
> “Everyone ready before we lift. No surprises.”

## player r8 (round 8)

**Screen:**

> You tell Sefa that the stone is holding a bad cut shut, so her healing must be ready before it moves. You call down the hole to Pell, telling him to leave the stone alone until you are ready. You hold out the hempen line to Osric.
> 
> Osric looks at the rope a moment, then takes it. He keeps both boots on the ends of the planks, wraps the line twice round his forearm and plants his heels in the white dust. "Got it."
> 
> You set your sword and pack down beside the case and keep the healer's kit at your belt. You go out onto the planks on your knees and then on your belly, spreading your weight like a man crossing spring ice. The planks creak and give a little. Under them the grey crust ticks and settles, and a dribble of old timber-dust runs off the broken lip into the water. The planks hold. At the edge you turn, let your legs down over the lip, hang from your hands in your chain mail for a breath, and drop.
> 
> The water takes you to the belly, cold enough to set your teeth. The floor under your boots is stone, slick with something gritty that isn't quite sand. As you land, Sefa's warmth thins out in your forearm and goes, the way a coal dies when the hand around it opens. The prayer's minute has run out.
> 
> Down here the chalk-stone's light is hard and close. The rose-white crust glitters on every wall just above the waterline, and the sagging roof is low enough that you have to bow your head. You get your hands on the block and read it the way you'd read a wagon on its side. The high edge rests on a broken lump of the fallen ledge. On the wall side there's a gap three fingers wide between the block and the rubble, with good rock floor beneath it, and a loose chunk of the ledge lies right there to serve as a fulcrum. The tarred prop is long and stout, but in this low room there's no height to swing it, and the tar would slide in your grip. It won't work as a lever. Its end would make a good chock, though. The job is to get iron into that gap, lift the block a hand's breadth, jam the prop under it so it can't come back down, and draw the leg out while it's held. That takes one man on the bar and another on the leg or the rope. And healing has to be ready the moment the jagged edge comes up out of the shin.
> 
> Osric has worked that out from above, or near enough. He keeps the rope wrapped on one arm and leans over without moving his feet. With his free hand he slides the iron pinch-bar along the near plank until it sticks out over the broken lip, where you can reach up and take it.
> 
> Sefa stays on sound ground and leans out just far enough to see past the lip. She calls instructions down to Pell, steady and clear: the loop goes under his arms first, not in his hands, so that the rope carries the strain should the block move or the water climb faster. She asks him whether he can feel his foot, and whether the block lies on the leg or the whole shank. She also asks Osric whether the sunburst slab was down there when he shut the low seam, or whether someone set it after.
> 
> Osric takes a while to answer, watching the rope. "Never seen it. Not this cut. Didn't know it was here." His eyes go to the sunburst in the light below. "Nobody set that after. Look at the face. Nobody's cut a sun like that up here in my time. My father's neither." Then, lower: "Banker marks round it. Masons' marks. Old style. Can't read 'em."
> 
> Water drips off your mail. The seep goes on trickling in from the dark end of the chamber, and against the block's dressed side the water has risen a little more.
> 
> Your records, changed:
> Carried: − Bedroll and Hardtack; − Longsword
> Conditions: Belly-deep in cold water
> 
> Where you are: in the flooded chamber below the broken lip, beside the stone block · Time: Day 1 · midday
> 
> Round 8 — what does Bram Halloway do?

**Bram's player wrote:**

> I take the pinch-bar from Osric and set its tip into the wall-side gap, with the loose stone as a fulcrum on the sound floor. I put the end of the tarred prop within reach to chock the block.
> 
> “Pell, can you wedge that prop under when I lift? Keep your fingers clear. If you can’t, say so.”
> 
> I look up. “Hale, take the slack, but don’t pull till his leg’s clear. Sefa—ready with the healing?”
> 
> Once everyone confirms they’re ready, I brace my feet and bear down steadily on the bar, aiming to raise the jagged edge just a hand’s breadth and hold it while Pell chocks it and frees his leg.

## player r9 (round 9)

**Screen:**

> Sefa, up on the firm white edge, studies the carved ring through the broken lip and calls down that it is real writing, not masons' marks: a warning to cut no further and to keep the rest. She tells you not to chip the plastered patch or widen anything below, and says the bar should go in on the side of the block away from Pell's leg, with a slow lift. She says she will have healing light on him the moment the block shifts, and tells Osric to keep rope and planks steady, with you hauled out first and Pell straight after if the roof settles. Pell, below, drops the prop plan for the moment and tells Sefa to toss the pinch-bar down to you. He puts his shoulder to the wall, his hand on the block's face, and tells you where to set the bar and brace your heel. He says he will shove the prop's end under with his foot, and that you only need to raise the block an inch and hold it. He asks Sefa to wait for his word "clear" before her light, and says to go on your count.
> 
> You take the iron pinch-bar where it sticks out over the lip. Osric lets it go without a word. It is as long as a man is tall and heavy with cold. You duck under the sagging roof and work the tip into the three-finger gap on the wall side, away from Pell's leg. You kick the loose lump of fallen ledge under the bar for a fulcrum, then haul the tarred prop round by Pell's silk line until its blunt end lies against the block's flank. Pell's good foot noses it up to the edge. The bar is short in this low room, so it will be all back and no swing.
> 
> Sefa calls down what she can read: *cut no further*, then *bring no fire to the white*. Black water covers the rest. Osric goes very still at the landward end of the planks, the rope wrapped twice round his forearm. "Fire," he says, and looks at the crystals on the wall.
> 
> Pell has the cork out of the flask with his teeth, the potion held above the water. You count, and on the last word you bear down.
> 
> The bar bends a little and the fulcrum stone grinds. For a long breath the block does nothing. Then it rises, a finger's width, two, a hand's breadth, the dressed face tilting toward the light, water slopping off its edge. You hold it with your back locked and your teeth set. Pell drives the prop's end under with his good foot. You let the block down a hair at a time and the wood groans and takes the weight. The tar doesn't crush.
> 
> Pell pulls his leg out. The water around it darkens at once, and his face goes grey. Sefa's light drops down the shaft like lamplight poured from a jug and lands on his leg under the water. The bleeding stops and the torn shin closes, ragged and angry. The grey goes out of his face. He is free.
> 
> Then the broken corner of the plaster beside Pell's shoulder starts to glow, dull and warm like a coal behind a screen, coming through the crack from the dark inside. It lasts while Sefa's light fades from the water, then sinks away slowly like an ember. Up on the edge Osric has seen it. He keeps his feet on the planks and the rope in his arm, and his hand closes hard on the ring of keys at his belt until the iron clinks.
> 
> The seep goes on trickling in. The water has crept up the block's tilted face and laps the lowest ray of the sunburst.
> 
> Where you are: in the flooded low working under the tilted block, by the bar · Time: Day 1 · midday
> 
> Round 9 — what does Bram Halloway do?

**Bram's player wrote:**

> “Pell’s free. Haul him up, Hale—steady.”
> 
> I help guide Pell beneath the opening, keeping his injured leg clear of the block and leaving the prop undisturbed.
> 
> “Something behind that plaster answered the healing. Leave it alone. We’re getting out.”
> 
> Once Pell is safely up, I ask them to lower the loop for me. I secure it under my arms and climb toward the planked lip with their help, using the sound rock where I can and keeping off the rotten timbers.

## player r10 (round 10)

**Screen:**

> Sefa rests a hand on Osric's shoulder and murmurs a short prayer. Osric doesn't look round. He takes the hempen line in both fists and sets his heels deeper in the white dust. Sefa steps back onto sound ground and takes up the rope's tail across her hip. She calls down the hole, telling Pell how to loop the rope, telling you to lift him from below and leave the block where it is, and telling everyone to haul steady on three. She also warns you not to stare into any ember-light that comes again.
> 
> Pell pushes the cork back into the flask with his thumb and puts the potion into his satchel, unspent. He tells Sefa no more light down here, not even a cantrip, because whatever is behind the plaster woke when her light touched the water. He turns his back on the cracked plaster and finds the ledge with his good foot. He says you should take Hale's line first and that he will climb the wall himself. His silk rope stays tied to the prop. He tells Hale to take his hand off the keys and says the barred shed, along with a drowning in only four feet of water, goes in the ledger. Hale can explain on the walk, or to Wat Pryor that night.
> 
> The chalk-stone keeps burning where it lies, steady and white, so the working is still lit. The plaster corner gives back nothing. It is grey and dark and only plaster, and the dry air still drifts out past the break.
> 
> You come up beside Pell, belly-deep, and get a hand under his elbow to steady him at the wall. You keep his left leg clear of the block and don't touch the prop. You tell him something behind that plaster answered the healing, that it should be left alone, and that you are all getting out.
> 
> Pell's left leg takes his weight. He doesn't need the loop. The old tool-scores in the wall are a ladder to him, and he goes up fast with water streaming off him. At the top he gets both hands flat on the near plank and rolls out onto it and off again onto firm white ground, soaked and shaking with cold. His silk rope still runs down over the lip, tied to the black prop under the block.
> 
> Osric watched Pell come up the whole way. He says, "Up first. Both."
> 
> The loop goes back down to you. You work it over your head and under both arms, snug it high, and call it. Sefa counts three and Osric hauls, steady and without snatching, the pull smooth. You climb with the rope taking your weight and the scored rock under your boots, your chain mail shedding water like a shaken dog. At the lip you keep off the grey crust and come over flat onto the planks. They bow under you and creak, and a spill of old timber-dust runs down into the water. The planks hold. You crawl the length of them to the white ground, where your shield, sword and pack lie by the case.
> 
> You and Pell stand in the glare, dripping. Down in the hole the pinch-bar is still wedged in its gap, and the block sits on its tarred chock with the sunburst a hand's breadth higher than it was this morning. The black water has started on the lowest rays.
> 
> Osric lets the line go slack and unwraps it from his forearm, which has a red welt. He coils it slowly into rough loops and holds it out to you. Then he looks at Pell, and this time he keeps looking.
> 
> "Tobin Reed." He says it as if he hasn't said it aloud for a while. "Cutter. Good one. Low seam was stone then. Salt was just the muck on the wet walls." His jaw works. "Went down alone one evening. Clear the pump. Found him at first light. Face down. Four feet of water." A pause. "Wrote *drink* in the book. Tobin didn't drink."
> 
> He looks down the slope at the barred shed by the lower cut.
> 
> "Shed goes through. Back under the hill to the wet walls. Since her orders started I go in. Scrape the salt. Fill the case. Come out." His hand starts toward the keys and stops halfway. "Said shut. Wasn't. Never stay long. Never came this far along." He jerks his head at the hole and the grey plaster under it. "Never saw that wall. Didn't know it was there."
> 
> Then he stops, and it's plain he's said all he means to say on the open track. He stands with his empty hands at his sides, looking at the four of you and the hole. Behind him the house door is still open. The sun is a little past its height, and in the bright yard the wet footprints you and Pell left are already drying white.
> 
> Your records, changed:
> Conditions: Soaked and cold
> 
> Where you are: on the white ground by the hole, near the case · Time: Day 1 · midday
> 
> Round 10 — what does Bram Halloway do?

**Bram's player wrote:**

> I take the rope back. “Thank you for the haul.”
> 
> I recover my sword, shield and pack, then look at the sealed case without lifting it yet.
> 
> “Hale—is what’s in that box the same white stuff on those walls? What did Maela tell you about handling it—fire, heat, keeping it dry?”
> 
> I glance toward the broken track. “Nobody else should walk over that. Mark the approach from sound ground before another cart comes through.”
> 
> To Pell and Sefa, quietly: “We need Maela’s answers, but I won’t carry this into a busy shop without warning her what we found. Pell, how’s the leg for walking?”

## player r11 (round 11)

**Screen:**

> You take the coiled rope from Osric's hands and thank him for the haul. He shrugs and rubs the red welt on his forearm. You pick up your sword and belt it on, get your shield onto your arm and shoulder your pack, then stand over the sealed case and look at it without lifting it.
> 
> Pell wrings out his sleeves and hair, then tells Osric what he thinks. A good cutter drowned in water he could have stood in. Maela's coin paid for the pretty salt, and the house in the Gate stopped paying the men. Osric kept going in alone. Pell says to bar the shed and leave it barred, because whatever is behind the wall likes light and heat. He says Wat Pryor's fifty-two and six goes on the table tonight with Tobin Reed's name beside it. Osric says the bar stays down till somebody tells him what it is, and that the rest is his to say. Pell tells you to bring the case and tells Sefa to keep the receipt and the sum dry, and says to walk single file against the cut wall. Then he limps off down the track.
> 
> You ask Osric your questions. "Same," he says of the white on the walls. "Pink off the wet walls. Not the white stone. Scrape it, fill her case, seal it. Her stamp's on my shelf. Keep it dry, keep it shut. That's all she ever wrote me." He adds, "Never said fire. Nobody did." He looks at the broken lip, where dust still trickles in. "Nobody did till you," he says to Sefa. Then he says stakes off the frame, rope across both ends, before dark. It was not on his list until you said it.
> 
> Sefa reaches toward the hole from sound ground. A pale hand, faint as lamplight, slips over the lip, takes the glowing chalk-stone from the ledge, and sets it in her palm. She speaks a quiet word and the light goes out of it, snuffed like a wick between fingers. The stone, grey and ordinary again, lands beside the case. She then turns to Osric and asks whose orders these are and what is sealed inside, and says people who carved *cut no further* were afraid of something. She adds that if Maela sent you for this without saying what it was, your promise to Maela is not the only one that matters.
> 
> Osric holds her eye. "Hers. Maela Thorn's. Letter on the coach. Since the thaw. A case a month, some months two. Same walls, same wet. Never this far along. Didn't know the sun was down there, or the writing. Didn't know what I was scraping. Don't now." He does not tell her to carry the case or not to. He walks heavily toward the lifting frame and a stack of old staging stakes. The house door stands open behind him on the cold kettle and the shelf of ledgers.
> 
> Pell is at the first bend, a dark figure against the cut wall. Sefa stands beside you with the receipt dry in her belt. It is a little past noon.
> 
> Your records, changed:
> Carried: + Bedroll and Hardtack; + Longsword; + Shield
> 
> Where you are: beside the sealed case at the broken hole in the upper working · Time: Day 1 · midday
> 
> Round 11 — what does Bram Halloway do?

**Bram's player wrote:**

> I lift the case carefully, keeping it upright and its seal untouched.
> 
> “We know the wall answered healing,” I say to Sefa. “We don’t yet know what the salt does. Best keep it shut, dry and away from heat, and get some answers.”
> 
> I follow Pell along the firm inner edge, matching his pace once we catch him.
> 
> “At Maela’s, let’s have her come outside before we bring this in. She can explain what she’s been buying—and who’s taking her money.”
> 
> I keep moving toward Beregost, watching the track ahead for cracks or settling ground.

## after 1 (round 11)

**Screen:**

> Sefa looked at the sealed case and then at you. She said they would carry it, but not as errand-boys for Maela. They would take it because Osric's crew needs what was pledged to them, and because if it stayed here, someone worse might climb the hill before nightfall. She stepped close and spoke low, so Osric, already heading for the lifting frame, would not hear. Before the seal is broken in Maela's shop, Maela must answer for it: what she has been purchasing, who is paying her, and what she knows about what was shut away below. And the case is not to be opened unless all three of them are in the room. She crouched, checked that the receipt was dry against her Book of Shadows, and pulled her pack strings tight. Then she called up the slope to Osric to stake and rope the hole before dark and keep the shed barred. If anyone comes asking after the case, he should tell them it went off with three hired hands from Beregost, and he should not name which road they took beyond the first bend.
> 
> You pick the case up by its handle and hold it upright, the way it sat on the hearthstone. The wax over the hasp stays whole. You carry it on your sword side, away from the cut, with the shield back on your other arm. Your mail still drips, and your steps leave dark rings in the white dust for a moment before the sun dries them.
> 
> Osric is at the lifting frame with an armful of old staging stakes. He stops when he hears Sefa and lets her finish before he answers.
> 
> "Nobody comes up. Letters come. Coach takes the case." He shifts the stakes against his chest. "One road down. Couldn't hide which if I wanted to." He looks at the two of you in the yard, and at the track beyond. "Three from Beregost. That's all they'd get."
> 
> He starts to turn back to the frame, then stops.
> 
> "Tell Wat I'm still here."
> 
> After that he goes to work. He sets the first stake on sound ground well short of the grey crust and drives it with the flat of a sledge, and the knocks carry flat and hard across the empty yard.
> 
> You take the inside of the track with the case, and Sefa keeps half a step behind your shoulder, so the case stays between you and the cut wall. You pass the hole on its far side, keeping wide of it. The planks still lie across the rotten crust, and the end of Pell's silk line still runs down over the broken lip into the dark. Past it the track drops along the lower cut. You watch the ground the way you watched spring roads on the Way. Where the track runs over the old seam the white crust has a faint grey tinge, and twice you hear a hollow note under your boot and steer closer in to the rock. After that the stone under the dust goes pale and solid, and the sound under your boots goes back to plain stone.
> 
> The crew's trampled band of boot prints runs on ahead, crusted and orderly, down toward the first bend where Pell went. Behind you the sledge keeps knocking, and the barred shed sits in its smooth dust at the foot of the cut. The sun has just passed its height and stands over the road west to Beregost.
> 
> Your records, changed:
> Carried: + Sealed Case of Dye-Salts
> 
> Where you are: on the track below the hole, heading down toward the first bend and the road to Beregost · Time: Day 1 · midday
> 
> The session is over.
> 
> How was the table?

**Bram's player wrote:**

> Strong atmosphere, and the rescue was the highlight. Bram had useful work beyond swinging a sword: securing the rope, recognising the danger of releasing the wound, and coordinating the lift. Osric felt like a person with debts and guilt, not just an obstacle to collecting the case.
> 
> A few things could improve:
> - **Pacing:** Several rounds repeated our decision to leave. Once everyone committed, moving us down the road would have kept momentum.
> - **Continuity:** The receipt appeared to end up with all three characters. Keeping its holder clear would help.
> - **Checks:** The rescue resolved entirely through narration. If our preparations made it certain, that’s fair; otherwise, one meaningful Athletics check would have given Bram’s abilities—and the risk—some weight.
> - **Party coordination:** Conflicting rescue instructions were resolved sensibly, without making us spend extra rounds untangling them.
> 
> Overall, an engaging opening with a good moral complication. I’m keen to hear Maela’s explanation and keep Bram’s promise to Wat.

## after 2 (round 11)

**Screen:**

> Was there something you wanted to do and didn't?

**Bram's player wrote:**

> Yes—mostly I wanted to get to Maela and Wat. Bram had given his word, and I wanted to turn that promise into a conversation with consequences: ask Maela about the salt and payment, then tell Wat what we’d learned, including Osric’s admission about Tobin.
> 
> I also wanted a brief exchange with Pell after the rescue—check his leg and acknowledge how close that was. I asked about walking, but we never quite got that companion moment.
> 
> I didn’t particularly want to explore the sealed chamber yet. Getting everyone out and addressing the delivery felt like the right choice, not a missed opportunity.

## after 3 (round 11)

**Screen:**

> Who did you take the other two players to be?

**Bram's player wrote:**

> I took them to be fellow players controlling Pell Dunmore and Sefa Marrin, with their messages relayed to me through the GM’s narration. I didn’t know whether the people behind them were humans or other AI models.
> 
> Pell came across as observant, suspicious, and practical; Sefa as compassionate, morally firm, and more willing to make a sweeping promise. I treated their decisions as theirs—not as companion NPCs Bram could command.
