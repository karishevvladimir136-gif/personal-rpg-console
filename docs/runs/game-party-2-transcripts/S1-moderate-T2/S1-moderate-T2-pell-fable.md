# S1-moderate-T2 — Pell Dunmore's player: Claude Fable 5.1

Synthetic content: invented characters in an invented campaign. Stage origin/claude/handoff at bbdee5fb (docs/stages/GAME_PARTY_2.md with its amendments of 2026-10-28 23:10 LA, 23:15 LA, 2026-10-29 18:35 LA and 18:45 LA); Mandate: issue #1; docs/POLICY.md v1. Design sha256 `ba4e78d0f9b25e65f2c91ff2993bbc086d663ebc0fe566fa6889b187a2f06046`.

Arm **S1-moderate** (Beregost — the Whitestone case; moderate (one resource)); the one in danger (the layer's die): Pell Dunmore. 11 round(s) of 15; ended by error (r11: the DM's turn failed (validation)). Models: the DM: the owner's settings (Claude Opus 5.5); the relay: Claude Sonnet 5.5; the players by the seating.

Seats: Bram Halloway (fighter) — GPT-6 Astra; Sefa Marrin (warlock) — DeepSeek V4 Pro 0813; Pell Dunmore (rogue) — Claude Fable 5.1. The order of the round's messages turns round each round from the table's coin (2). The players are not told what the others are.

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

> Pell slows a step before the yard opens properly, letting Bram's shield take the lead and dropping half a pace behind Sefa's shoulder.
> 
> "Quarry's gone quiet like a tavern when the Fist walks in," he says, low, not taking his eyes off the man in the apron. "Tools down, cart half-loaded, no mule. Nobody knocks off for dinner mid-load. Either they ran, or they were told to."
> 
> He keeps his hands easy and visible, thumbs hooked in his belt, but his eyes work the yard the way they'd work a street before a job: the sheds, the spoil heaps, the lip of the terraces above the house, the ground around the lower cut — looking for anyone lying low, blood in the dust, a second line of smoke, footprints heading off in a hurry.
> 
> "Bram, you do the talking — you look like a man people hand things to. I'll stay back a bit and watch the sheds. Sefa, if he asks us in, don't go first."
> 
> Then, raising his voice just enough to carry across the yard, friendly and ordinary: "Morning! Maela Thorn sent us up from Beregost for the case. You'd be the warden?"

## player r2 (round 2)

**Screen:**

> Bram murmured to you and Sefa that the quarry was quiet for a working one, then walked on toward the house with his shield low and his sword sheathed. He stopped a few paces short of the man in the apron and left the doorway clear. He gave his name, said Maela Thorn had sent the three of you for her case of dye-salts, asked whether the man was the warden, and asked whether you had come at a bad time. Sefa, a little way off, remarked that the yard had no ring of iron and no mule in the traces. She said she wanted the case in hand before you learned whether the warden was the reason or the victim, then called out to the doorway with open hands raised that you were from Maela Thorn's shop in Beregost, sent for a sealed case before the coach left at sunset.
> 
> You dropped back half a pace behind Sefa's shoulder, and your eyes went to work. The yard gives you nothing that looks like trouble. Nobody lies low behind the spoil heaps, and nothing moves along the lip of the terraces above the house. The doors of the three stone sheds are shut and the lifting frame hangs still. The only smoke is the grey thread from the chimney. There's no blood in the white dust, which shows everything. What it does show is boots, a lot of them, scuffed into a broad trampled band that runs from the lower cut to the cart track and down it, the way the three of you just came up. Last night's damp has crusted the prints. They don't drag and they don't scatter. Inside the band you can make out a mule's hooves, with one man's prints walking beside them. Near the lower cut the hammers and wedges lie in the dust. One sledge stands upright on its head against the cart wheel, handle up, the way a man stands a tool he wants seen.
> 
> The man in the apron looks at Bram and at the sheathed sword, then past him to Sefa's raised hands and to you hanging back. He takes his time with each of you.
> 
> "Hale," he says at last. "Osric Hale. Warden." His voice is low and rough with dust. "Bad time." He jerks his chin at the empty cart. "Lads walked off yesterday at the noon bell. Three weeks, not a copper from the Gate. Can't say I'd have stayed."
> 
> He lets his arms drop from his chest, and one hand rests on the ring of keys.
> 
> "Case is here. Sealed, like she wants it." He looks at Bram, then at Sefa, because she was the one who said *before sunset*. "She paid for that salt, your Maela. Somebody took her money. Wasn't me, and it wasn't my men." He stops there, and nothing on his face moves. "Who'd she pay?"
> 
> He doesn't wait to watch you answer. He turns and goes back inside, leaving the door open behind him. The heat of a small fire comes out into the bright yard along with the smell of a kettle that has boiled too long. Through the doorway there's a plain table and a single chair, a shelf of ledgers, and an iron-bound box about the size of a loaf of bread on the floor by the hearth, right at his feet.
> 
> Your journal, new:
> + Goal: The Whitestone Case
> + Quest: The Whitestone Case
> 
> Where you are: in the quarry yard, just behind Sefa near the spoil heaps · Time: Day 1 · morning
> 
> Round 2 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell doesn't follow him in. He stays where the open door and the three sheds are all in his eye-line, and speaks just loud enough for Bram and Sefa.
> 
> "Tracks say he's telling the truth about the lads. Whole crew walked off down the track together, no running, no dragging, mule and one man with them. Crusted from last night's damp. And that sledge by the cart's been stood on its head — handle up. That's a message, not a man dropping his tools. Quarrymen's way of saying 'we're owed.'"
> 
> He nods at the doorway. "Case is on the floor by his boot, and his hand's on his keys. He's not stalling, he's bargaining. That question — 'who'd she pay?' — that's a man wondering if the coin went to the owners in the Gate while he and his crew went three weeks dry. He wants to know if Maela's one of them or one of us."
> 
> He steps a little to the side, so the sheds and the track behind them stay in view and nobody coming up from below would find his back turned.
> 
> "Bram, go in and answer him straight — we don't know who she paid, we're hired hands same as his lads, ninety gold between three of us and not a copper of it his quarry's. Sefa, stay in the doorway where I can see you. I'll keep the yard." A beat, quieter still: "And if he names a price for letting that box leave the floor, don't say yes before we've heard the number. There's a sunset on this."

## player r3 (round 3)

**Screen:**

> Bram comes up to the threshold, where you and Sefa can still see him, hands well away from his belt. He tells Osric Hale that the woman who hired you never said who took payment, only that you were to collect a sealed case and carry it back. He says that a decade of guarding wagons taught him the person hauling the goods is often not the one who holds the money, and asks who owes the lads their wages. He also asks whether there is a receipt or message to take back with the case.
> 
> Inside, Osric has his back to the fire. He hears Bram out without moving and doesn't interrupt. At the question about who owes the lads, his eyes go to the ledger shelf and stay there.
> 
> "Vandarren." He says it like the name of a bad well. "House in the Gate. Owns this hill on paper. Never seen one of them up here. Their factor takes the money. Man called Hask." He pulls a folded letter from between two ledgers and drops it open on the table where Bram can read it from the door. The hand is good, the paper better. *Wages to follow by the next coach.* It's dated five weeks back. "Next coach came. Wages didn't."
> 
> He looks at the case by his boot, then at Bram.
> 
> "Receipt I can write. Weight, seal, day it left. And what's owed. Fourteen men, three weeks. Fifty gold and some silver." He says it flat, like a tally he has added more than once. "Your Maela paid somebody for that salt. You don't know who. She does. She writes it down, who and how much, and that paper goes to my lads at the Red Sheaf in Beregost. Tonight. Not up here to me. To them." He pauses. "One of you gives me a name on that, the case goes with you."
> 
> Out in the yard, you keep the sheds, the track and the doorway in your eye-line, and Sefa hasn't moved from the edge of the spoil heaps, her hands still open at her sides. Nothing comes up the cart track. Nothing moves along the terraces. The lowest of the three sheds sits right against the lower cut, with an iron bar dropped across its door from the outside. The white dust in front of it lies smooth. Yesterday's boots went past it on both sides, and none of them went in.
> 
> Osric takes a ledger down from the shelf and opens it on the table. He sets a bottle of ink beside it and begins to write, slowly, pressing hard. The kettle ticks on the hob. The case sits where it was, at his feet.
> 
> Where you are: quarry yard, watching the sheds and track · Time: Day 1 · morning
> 
> Round 3 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell doesn't go in. He comes as far as the door-post, where the yard is still at his shoulder, and speaks to Osric past Bram.
> 
> "Vandarren. Upper City, old money, patriar house — I know the gate they live behind, never been through it. And a factor named Hask who writes a good hand on good paper." He nods at the letter. "That's not a man short of coin. That's a man holding it."
> 
> He lets that sit, then: "Your price is cheap, Warden. You're asking for a piece of paper and a walk to the Red Sheaf, and I'm going past its door tonight either way. I'll carry it. Pell Dunmore, Lower City. Write that on your receipt if you want a name to curse if it doesn't arrive." A small shrug. "Whether Maela writes down who she paid is Maela's business, and we can't promise her hand for her. We can promise she's asked, in front of your lads, and that they hear the answer same time we do. That's what I'll give you, and I don't give more than I can carry."
> 
> Then, lighter, as if it were an afterthought — but his eyes are on Osric's face when he says it: "One thing, since we're writing things down. Lowest shed by the cut — bar across it from the outside, dust in front of it smooth as a tablecloth. Your lads walked round it both sides yesterday and nobody went near. Powder store? Or something you'd rather we didn't carry back to Beregost along with the salt?"
> 
> He keeps half his attention on the yard behind him while he waits for the answer, and the other half on how long Osric takes to give it.

## player r3 card 1 (round 3)

**Screen:**

> Sefa moves up to where the light from the doorway ends, staying outside, and gives Osric her name. She tells him the three of you are hired for the day, just as his crew were hired to cut the stone. She pledges that if the case leaves with you, she will go to Maela Thorn's shop in Beregost, have Maela put in writing, sealed and in her own hand, who was paid and how much, and bring it to Osric's men at the Red Sheaf before the night is out. She adds that if the case isn't with Maela by sunset, none of you are paid, so her own wages stand behind the promise. She says she would sooner see fourteen men get their due than hand over a sealed case to Vandarren and consider the job finished.
> 
> Bram gives his name and offers much the same. He will ask Maela for a signed record of her payments and the sums, and bring it to the crew at the Red Sheaf this evening. If Maela refuses, he will still go and tell them so. He vows only what he himself will do, not what Maela will write. He asks to copy down Hask's promise with its date so he can show it to her, and asks whom to look for at the Sheaf.
> 
> Osric listens to all three of you with the pen gripped in his fist, and he doesn't look up until every one of you has finished. Then he writes, slowly, pressing hard, muttering each name as it goes down: Halloway, Marrin, Dunmore. He angles the ledger toward the door so you can read it: one case, sealed, Thorn's mark, seven pound and some, left Whitestone this day, and owed the crew, fourteen men, three weeks, fifty-two gold and six silver. Your three names stand beneath it in his heavy square hand.
> 
> He tells Sefa that with her pay behind it, you will walk fast. To you he says the price is not cheap to him. To Bram he says nothing at first. He pulls a clean leaf from the back of a ledger and pushes it across the table with the ink bottle and the Vandarren letter, setting the pen on top. "Copy it. Letter stays here." Then he answers Bram: ask at the Red Sheaf for Wat Pryor, the carter who took the mule. He is owed the most, so he will be the loudest.
> 
> Then you ask about the lowest shed by the cut. Osric's hand comes off the page and settles on his ring of keys. You watch his face and wait for his answer.
> 
> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Insight: reading the warden's face as he answers about the barred shed
> What adds to the die: +4 Insight
> DC 15
> Rerolls left: 2
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Pell's player wrote:**

> [Roll the die]

## player r3 card 1 (round 3)

**Screen:**

> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Insight: reading the warden's face as he answers about the barred shed
> What adds to the die: +4 Insight
> DC 15
> Rerolls left: 2
> Die: 8
> 8 + 4 = 12
> Failure — 12
> 
> [Onward] [Request an allowed reroll — Insight: reading the warden's face as he answers about the barred shed]

**Pell's player wrote:**

> [Onward]

## player r4 (round 4)

**Screen:**

> Sefa stepped up to the edge of the doorway's light, staying outside, and gave Osric her name. She pledged that if the case left with you, she would go to Maela Thorn's shop in Beregost, have Maela put in writing, sealed and in her own hand, who was paid and how much, and bring it to the crew at the Red Sheaf before the night was out. She said that if the case wasn't with Maela by sunset none of you would be paid, so her wages stood behind the promise, and that she would sooner see fourteen men get their due than hand a sealed case to Vandarren and call the job done.
> 
> Bram gave his name and offered much the same: he would ask Maela for a signed account of her payments and the sums and take it to the crew at the Red Sheaf tonight. If she refused, he would go anyway and say so. He promised only what he would do himself, not what Maela would write. He asked to copy Hask's promise with its date, and whom to ask for at the Sheaf.
> 
> Osric heard all three of you out with the pen in his fist and didn't look up until you had finished. Then he wrote, slowly, pressing hard, saying each name under his breath: Halloway. Marrin. Dunmore. He turned the ledger toward the door so you could read it: one case, sealed, Thorn's mark, seven pound and some, left Whitestone this day. Owed the crew, fourteen men, three weeks: fifty-two gold, six silver. Your three names stand beneath it in his heavy square hand.
> 
> "Your pay behind it," he said to Sefa, not quite as a question. "Good. Means you'll walk fast." To you: "Not cheap to me." To Bram he said nothing at first. He pulled a clean leaf from the back of a ledger and pushed it across the table with the ink bottle and the Vandarren letter, setting the pen on top. "Copy it. Letter stays here." Then, to Bram: "Wat Pryor. Carter. Took the mule. Owed the most, so he'll be loudest. Ask for Wat."
> 
> When you brought up the shed, Osric's hand came off the page and settled on his ring of keys.
> 
> "Cutting-shed for the low seam. Seam's flooded. Shut it three years back." He said it without a pause and without heat. "No powder. Nothing in it you'd carry. Bar's mine."
> 
> You keep your eyes on his face the whole time and can't read past it. You catch no flicker and no hitch, and his eyes don't slide toward the shed. As far as you can tell, you've just heard an honest, bored answer from a man who wants his crew paid and the day over. His hand stays on the keys for a breath, then goes back to the pen.
> 
> He blots the page, tears the receipt out along the fold and lays it on the table. With a grunt he lifts the iron-bound case off the hearthstone and sets it beside the receipt. Thorn's wax seal on the hasp is whole. He leaves it there next to the blank leaf and the ink, and sits back in his one chair.
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
> Where you are: at the door-post of the warden's hut · Time: Day 1 · morning
> 
> Round 4 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell takes the answer at face value, or at least lets it look that way. "Fair enough. Flooded seam's a flooded seam." He nods at the case. "Mind if I handle it? Only I'd rather know now if the seal's sound than have Maela tell me at sunset."
> 
> He steps in, lifts the case once by the handle to feel the weight against the seven-and-some on the ledger, turns it to the window light and looks at the wax on the hasp — whether it's one pour or two, whether the hasp's been worked under it — then sets it down again. He folds the receipt and tucks it inside his jerkin where the rain won't get it.
> 
> "Warden. We'll see Wat Pryor tonight, and your fifty-two and six goes on the table in front of him in writing, whatever Maela says to it." A short nod, the kind that closes a deal in the Lower City. "Bram, finish your copy and let's walk. We've eaten the morning."
> 
> Out in the yard, waiting for the others, he lets his glance pass over the barred shed once more — not to go near it, just to fix it in his head: the bar, the hinges, the dust — and then turns to the cart track. "Same way down we came up. The crew's tracks go that way, so if there's anyone on the road it'll be them, and they're the ones we're carrying good news to."

## player r5 (round 5)

**Screen:**

> You lift the case by its handle once. It weighs what the ledger says, seven pounds and a bit, and nothing inside slides or knocks. You turn it to the light from the doorway. The wax over the hasp went on in one pour, with Thorn's mark pressed clean into it and no second skin or seam at the edges. The hasp under it hasn't been bent or worked. As far as a man who has opened a great many sealed things can tell, nobody has opened this one. You set it back beside the receipt, then fold the receipt and put it inside your jerkin.
> 
> Osric watches and says nothing. When you promise that the fifty-two and six will go on the table in front of Wat whatever Maela says, the warden nods once.
> 
> "Do that."
> 
> Bram sits on the corner of the table, since the room has only the one chair, and copies the letter slowly: the date, the good hand's *Wages to follow by the next coach*, and the Vandarren name at the foot. He waits for the ink to dry, which takes a few minutes in that warm room. Osric doesn't hurry him. Bram slides the letter back across the table with the pen and ink bottle, and Osric puts it between the same two ledgers it came from. Bram folds his copy and stows it. When he mentions the kettle, Osric looks at it as if he'd forgotten it was there, lifts it off the hob with a corner of his apron and sets it on the hearthstone, where it hisses.
> 
> "Third time this morning."
> 
> Sefa steps just over the threshold and bends to look at the wax on the hasp all the same. She says quietly that she'll carry the sum, fifty-two and six, like a prayer until she has put it in Wat Pryor's hand. She tucks the receipt she took up into her belt against her book, and says that whatever Maela writes, somebody will be at the Red Sheaf tonight to tell Wat the truth of it. Osric looks at her a long moment.
> 
> "Say it true, then. Wat can tell when it isn't."
> 
> That's all he has for her. He sits back in his one chair and doesn't get up to see you off.
> 
> Out in the yard the sun has climbed and the white dust throws it back hard enough to make your eyes ache. You let your glance cross the barred shed once more. The iron bar sits in two brackets bolted into the stone. The hinges are old, black and dry. The brackets aren't: both have a bright line worn into the iron where the bar rides, the shine that only comes from a bar being lifted out and dropped back again and again. Rust would have dulled it in a season. In front of the door the dust lies as smooth as before.
> 
> You say that you'll go down the way you came, since the crew's tracks go that way. Then the cart track takes your eye. It runs down along the lip of the lower cut, with the crew's trampled band of boot prints in it. Bram stands beside you with the case, and Sefa comes out of the doorway into the glare. Behind you the warden's door stands open. Inside, the kettle has stopped ticking.
> 
> Your records, changed:
> Carried: + Osric's Receipt
> 
> Where you are: yard outside the warden's hut, by the cart track · Time: Day 1 · morning
> 
> Round 5 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell falls into step beside Bram and says nothing until the warden's door is behind the first spoil heap and the hut is out of earshot. Then, quiet, eyes on the track ahead:
> 
> "Shed's not shut three years. Brackets on that bar are worn bright where it rides — that's iron lifted out and dropped back week in, week out. A season of rust would've dulled it. He opens it. Regular. And he answered me about it like a man reading the weather, which is either the truth or a lot of practice."
> 
> He lets that settle a few paces.
> 
> "I'm not saying we go back. We've a box, a sunset, and three names in a ledger that says we walked out of here honest. A man barring his own shed on his own hill isn't our job, and I don't poke locks I'm not paid to poke." A glance at Sefa. "But I'd want it known between us. If something's wrong with the salt, or with Vandarren, or with Osric Hale, that shed's where I'd start looking — and I'd sooner start looking with the ninety in my pocket and Wat Pryor's lot behind me than alone on a hillside with a flooded seam under my feet."
> 
> He checks the sun, then the track. "Walk steady, not fast. Crew's tracks go all the way down; if they've camped short of town we'll pass them, and I'd rather pass fourteen angry quarrymen as the men bringing their tally than as three strangers with a Vandarren box." He unslings the shortbow as he goes, not strung for a fight, just within reach, and takes the outside of the track where he can see down the slope.

## player r6 (round 6)

**Screen:**

> You walked beside Bram until the hut was out of earshot, then said quietly what you'd made of the shed, and that you wanted it known between you. You unslung the bow, unstrung, and took the outside of the track above the lower cut. Bram kept to the firm inner edge with the case on the far side, and Sefa walked half a step behind, looking back up the slope.
> 
> Forty paces past the last spoil heap your next step lands on ground that sounds wrong. It booms, like a boot on a floorboard. Then the crust of white dust folds inward with a crack of old timber, and the track takes you straight down.
> 
> You drop eight feet through dust, splinters and black water. Your shoulder hits a ledge of stone on the way, and you land hard on your side in water that closes over your head, so cold it punches the breath out of you. You come up coughing, with a split lip and a burning ache down your ribs where the ledge caught you. You're battered, but whole and breathing.
> 
> You aren't free, though. A squared block of white stone, about the size of a sea-chest, slid off the ledge in the collapse and settled across your left leg below the knee. It pins the leg to the floor of the working. The water stands at your chest.
> 
> Daylight comes through the hole above in a ragged shaft about four feet across. You are in a low chamber cut square into the hill, an old working with tool-scored walls. The far end goes off into dark water under a sagging roof. Crusts of crystal grow on the walls just above the waterline, rose-white and glittering like sugar on a cake. Somewhere a thin seep trickles in, steady, and the cold water moves against your chest with it. A tarred beam thicker than your arm, one of the old roof props, lies half-sunk against the wall within easy reach.
> 
> The block is not plain quarry stone. Its upturned face has been dressed smooth, and cut into it, worn soft but deep, is a sunburst: a round face with straight rays running out to the edges. Around it runs a ring of small marks, notches, ticks and crossed strokes, too regular to be chisel slips, set close like a row of writing in a hand nobody uses any more.
> 
> When you try the leg, the stone answers with a bright, tearing pain. The block's underside isn't dressed like its face. It's jagged, and that edge has bitten into your shin and sits in the wound, pressing it shut. You can feel the blood moving under the stone, held there. The block is far too heavy for one man lying in water. Whoever shifts it will open that cut wide the moment it lifts, and will want healing ready in hand when it moves.
> 
> Up on the track, Bram and Sefa stand at the broken edge looking down at you. Fresh dust is still running in over the lip. Then the house door bangs, and Osric Hale comes down the slope at a heavy, rolling run, his keys clashing. He stops a long stride short of the grey ground and looks down into the hole. For the first time today his face plainly shows fear, and it isn't for himself.
> 
> "Low seam," he says, hoarse. "Runs under the track. Thought it ran deeper." His eyes go to the water and the crystals on the walls, then back to you. "Don't stay down there."
> 
> Below, the seep keeps trickling in.
> 
> Your records, changed:
> Pell Dunmore: HP 23/33
> Conditions: Pinned under the sunburst block, Chest-deep in cold water
> 
> Your journal, new:
> + Thread: Pell under the sunburst block
> 
> Where you are: in the flooded old working eight feet below, leg pinned under the block · Time: Day 1 · midday
> 
> Round 6 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell spits water and blood and gets one hand on the ledge to hold himself steady against the pull of the seep. His voice comes up the shaft hoarse but level — the voice of a man who's been stuck in worse holes and knows panic drowns you faster than water.
> 
> "I'm alive. Leg's pinned under a block — big one, dressed stone, won't shift on its own. Water's at my chest and it's coming in slow. I've got a roof-prop within reach I can use for a lever, but I'm lying wrong for it; I need weight on the long end from someone who can stand."
> 
> He looks up at the three faces. "Bram. Rope's in my pack — I'm getting it off now and I'll tie it round the beam end so you can haul it up and feed yourself down. Shield off first, mail or no mail, you don't want to go in that water heavy. Sefa — the stone's edge is sitting *in* the cut; when it lifts, the leg opens. I'll have a potion in my hand, but I want your light ready the second after, not the second before. Don't come down until Bram's set."
> 
> He works the pack strap off his shoulder one-handed, gets the silk rope out, and starts a loop round the end of the tarred beam, teeth helping where fingers are numb.
> 
> Then, flatter, up at the warden, while his hands keep moving: "Hale. You said don't stay down here. I'm not planning on it. But say why. Is it the water, the roof, or what's growing on the walls? Because these pretty crystals look a lot like something a woman in Beregost would pay for by the case — and I'd like to know what I've been breathing before I do any more of it."
> 
> He gets one potion out of the satchel and palms it, cork under his thumb, and waits for rope and weight.

## player r7 (round 7)

**Screen:**

> Your hand finds the ledge. The stone is slick, and under your fingers there's a grit that isn't quarry dust. It's crumbled plaster from the broken corner of the smooth grey patch beside you. Behind that corner the dark gives off air that's dry and still. It's the only dry thing down here.
> 
> You shrug the pack strap off one-handed, and the cold makes it a fight. The silk rope comes out wet and stiff. The tarred prop lies half-sunk against the wall an arm's length away, as thick as your thigh and heavier than it looks. Getting the line around its end means working blind under the water, so you do it with fingers, teeth and an old habit. Round twice, a hitch, and you pull it hard. The knot holds. The free end trails up the wall toward the light, ready for whoever takes it. The loop you made for Bram is still on the water by your elbow, turning slowly in the seep.
> 
> You take the potion from the satchel and hold it in your fist, thumb on the cork, above the waterline. Below you the thin pink thread keeps curling up from under the stone.
> 
> At the lip, Osric Hale hears your question through. He doesn't answer straight off. His hand goes to the ring of keys and stays there.
> 
> "Salt. Hers." He says it low, at the hole, not at anyone. "Grows where the wall's wet. Seam's full of it."
> 
> The seep goes on trickling for a while before he speaks again.
> 
> "Man drowned down there. Three years back. Four feet of water." His jaw works once. "Didn't fall. Didn't get pinned. Just went under."
> 
> He takes his hand off the keys and sets his boots back on the ends of the planks.
> 
> "Out first. Talk after."
> 
> The water lies flat and black around your chest. It's a finger's width higher than it was when you landed.
> 
> Where you are: in the flooded shaft below the lip, leg pinned, water at his chest · Time: Day 1 · midday
> 
> Round 7 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell takes the warning the way he takes most warnings — as a reason to hurry, not to freeze. "Heard. Out first." He gets the free end of the rope coiled and flings it up the shaft toward the lip, hard enough to clear the dust.
> 
> "Bram, that's tied to the prop, not to me — don't haul it yet. Come down it. Shield and pack stay up top, mail you keep if you must, but you go slow and feet-first; there's a ledge about four feet down on my side, you can land on that and not in the water. Once you're on it, haul the prop up out of the wet and we'll set the thin end under this block's edge, heel on the ledge. You put your weight on the long end; I'll feel the stone come up and pull the leg. Sefa — you stay up there till it moves, then your light down to me, hard as you can give it. Hale, make yourself useful: a pick or a wedge from the cart, anything flat to chock under the block once it lifts so it doesn't come back down on us. Toss it, don't bring it."
> 
> While he waits, he keeps his free hand on the ledge, his head well clear of the water, and his eyes on the surface around him — not the crystals, the water, and the dark under the sagging roof where the seep is coming from. A man doesn't "just go under" in four feet of water unless something put him there or he'd already stopped breathing right. He slows his own breathing deliberately, shallow and through the nose, and keeps talking so the others can hear he's still clear-headed.
> 
> "One more thing, since I've nothing to do but notice. There's a patch of plaster by my shoulder, corner broken, dry air behind it — only dry thing down here. Somebody walled something up in this seam, and this block with the sunburst came from it. Not our business today." A grim half-smile up at the light. "But I'm putting it in the ledger with the shed."

## player r8 (round 8)

**Screen:**

> The first throw of the rope comes up short. The coil opens against the broken lip and slides back, raining dust onto the water around you. The second throw clears the edge, and the end lands on the near plank by Osric's boots. The line now runs taut and dripping from the hitch on the prop, up the wall and through the light.
> 
> Bram never came down the rope. While you were still giving orders, he dropped over the lip in his mail, and the splash slapped water into your face. He is on his feet a long stride away, belly-deep beside the block and stooped under the low roof. The plan you called up the shaft was made for a man still up top.
> 
> From down here you can see what's wrong with the rest of it too. The roof sags so low that Bram has to stoop. There is no room to lift the prop out of the water, let alone swing its long end. The tar is slick under your palm where you brace against it. The iron pinch-bar is up at the lip, sticking out over the edge of the near plank, where Osric slid it before your rope came up.
> 
> Osric heard you ask for a chock and doesn't move his feet. He has Bram's rope wrapped twice round one forearm and both boots on the plank ends. "Got the line. Can't leave it." He looks at the black prop in the water. "That's your chock. Tar won't crush." He throws nothing down.
> 
> You keep your hand on the ledge and your head well up, breathe shallow through your nose, and watch the water instead of the walls. It shows you nothing. The seep comes out of the dark under the sagging roof in a thin, steady trickle with no current in it. No ripple moves that doesn't come from the seep, from you or from Bram. Nothing stirs in the black at the far end. Dry air from the broken plaster keeps drifting past your cheek, faint and dusty, smelling of nothing at all. The only thing working on you down here is the cold. Your fingers are going clumsy, and your left foot answers with nothing but the ache in your shin.
> 
> When you mention the plaster, Osric's eyes go to the grey patch by your shoulder and stay there a moment. His jaw sets.
> 
> "Leave the wall."
> 
> He has nothing more to say about it. Rope in hand, he watches the water. It has crept up the block's dressed side again, and it now stands halfway between the bottom of the sunburst and the bottom of its ring of marks.
> 
> Where you are: in the flooded seam below the shaft, on the ledge by the block · Time: Day 1 · midday
> 
> Round 8 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell abandons the plan without a wasted breath — a plan is just the last idea you hadn't thrown away yet.
> 
> "Right. Forget the prop, Bram, there's no roof to swing it under. Sefa — the pinch-bar, on the plank by Hale's boot. Toss it down to Bram, iron end first, into the water not onto us. Hale, keep that line, you're doing the right thing."
> 
> He gets his shoulder against the wall and his free hand flat on the dressed face of the block, feeling for the gap where the ledge meets its underside. "Bram — bar goes in here, under the near edge, this ledge for your heel. Short lever, so it's all your back. You don't need to lift it, you need to lift it an inch and hold it. I'll shove the prop's end under with my foot — tar won't crush, he's right about that — and then I pull the leg and you let it down on the wood, not on me."
> 
> He gets the potion cork loose with his teeth, holds the bottle above the water in his fist, and shifts the prop with his good foot until its end is nosed up against the block, ready to go under.
> 
> "Sefa, the moment you hear me say 'clear,' your light. Not before — if you spend it while the stone's still on me the cut just closes again under it." A hard breath through his nose. "On your count, Bram. Water's not waiting for mine."

## player r9 (round 9)

**Screen:**

> Above, Sefa studied the carved ring through the broken lip and called down that it is writing, a warning: cut no further, and that the rest be kept. She told you all not to chip the plastered patch or widen anything, told Bram to set the bar on the side away from your leg and lift slowly, and said she would have healing light on you the instant the block shifted. She told Osric to keep rope and planks steady, with Bram hauled out first and you right after if the roof settles. Bram took the pinch-bar from Osric and said he would set it in the wall-side gap, using a loose stone as a fulcrum. He asked you to wedge the prop under when he lifts and to keep your fingers clear. He told Hale to take up the slack but not pull until your leg was clear.
> 
> Bram ducks under the sagging roof with the bar, which is as long as a man is tall and heavy with cold. He works the tip into the three-finger gap on the wall side, away from your leg, and kicks the loose lump of fallen ledge into place under it. With his other hand he hauls the tarred prop round by your silk line until its blunt end lies against the block's flank. Your good foot finds it and noses it up to the edge. The bar is short in this low room, so it will be all back and no swing.
> 
> Sefa calls down what she can read: *cut no further*, then *bring no fire to the white*. Black water covers the rest. Osric goes very still at the landward end of the planks, the rope wrapped twice round his forearm. "Fire," he says, and looks at the crystals on the wall.
> 
> You have the cork out of the flask with your teeth and hold the potion above the water in your fist, your free hand flat on the sunburst, feeling for the moment the stone moves. Bram counts. On the last word he bears down.
> 
> The bar bends a little and the fulcrum stone grinds. For a long breath the block does nothing. Then it comes up, a finger's width, two, a hand's breadth, the dressed face tilting toward the light, water slopping off its edge. Bram holds it with his back locked and his teeth set. You drive the prop's end under with your good foot. It goes in, black and slick, and Bram lets the block down onto it a hair at a time. The wood groans and takes the weight. The tar doesn't crush.
> 
> You pull your leg out.
> 
> The jagged edge comes up out of the shin and the water goes dark at once. The blood isn't a pink thread now. It comes thick and fast, and your face goes grey. The cold had been holding most of the pain back, and now all of it arrives.
> 
> Sefa's light drops down the shaft like warm lamplight poured from a jug and lands on your leg under the water. The bleeding stops. The torn edges of the shin pull together, ragged and angry but closed. Warmth climbs the leg past the knee and the grey goes out of your face. It is a full, clean measure of the Lantern's light, the best one die of it can give. You are still cold, bruised along the ribs and sore with a cut lip, but you are not bleeding out into the water, and you're free.
> 
> The block sits on the tarred prop a hand's breadth off the floor where your leg was.
> 
> Then the broken corner of the plaster beside your shoulder starts to glow. It isn't bright. It is the dull warm light of a coal behind a screen, coming through the crack from the dark inside. You feel it on your cheek as heat, the only warm air in the room, coming from the same place as that dry, still breath. It lasts while the last of Sefa's light fades off the water, then sinks away slowly, the way an ember goes down.
> 
> Up on the edge, Osric Hale has seen it. He doesn't move his feet off the planks and doesn't let go of the rope, but his hand goes to the ring of keys at his belt and closes on it hard enough that the iron clinks.
> 
> The seep goes on trickling in. The water has crept up the block's tilted face and laps the lowest ray of the sunburst.
> 
> Your records, changed:
> Pell Dunmore: HP 29/33
> Conditions: Chest-deep in cold water
> 
> Where you are: in the flooded working beside the sunburst block, freed from under it · Time: Day 1 · midday
> 
> Round 9 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell gets the cork back in the potion with his thumb and shoves it into the satchel. Not spent. A man who's just been handed free healing doesn't waste the paid kind.
> 
> "Sefa — no more light down here. Not a cantrip, not a glow. Whatever's behind that plaster just woke up when yours touched the water, and the writing says *no fire to the white*. I'd rather it went back to sleep without learning our names."
> 
> He doesn't look at the crack again. He turns his back on it, deliberately, and gets his good foot on the ledge.
> 
> "Bram, you're the heavy one and you're in mail — you take Hale's line, now, before the water's at your neck. I'll come up the wall; I've climbed worse in the dark with a Fist patrol under me." He tests his left leg against the stone — it takes weight, grudging and sore, but it takes it — and reaches up for the first tool-score in the rock. "My rope stays on the prop. Costs me a good silk line, but if that block comes off the wood when we're gone I'd sooner it didn't have anything of mine tangled round it. Hale — once Bram's on the planks, you can take your hand off those keys. We're leaving your wall alone. All of us." A flat glance up at the warden's face. "But a man drowned in four feet of water with a warm wall for company, and you've kept a shed barred and bright over this seam for three years. That goes in the ledger too. You can tell it to me walking, or you can tell it to Wat Pryor tonight when I tell him why I'm limping."
> 
> He climbs — hands and knees and the scored walls, the way he'd take a chimney breast — up toward the ragged four-foot square of daylight, and doesn't stop to look down at what's glowing or not glowing behind him.

## player r10 (round 10)

**Screen:**

> You work the cork back into the flask with your thumb and shove it into the satchel, unspent. You tell Sefa no more light down here, then turn your back on the cracked plaster and find the ledge with your good foot. You tell Bram to take Hale's line first, say you'll climb the wall, leave your silk rope on the prop, and tell Hale to take his hand off the keys. You put the shed and the drowned man to him: he can explain on the walk, or to Wat Pryor that night.
> 
> The chalk-stone keeps burning where it lies, steady and white, so the working is still lit. The plaster corner gives back nothing. It is grey and dark and only plaster, and the dry air still drifts out past the break.
> 
> Bram comes up beside you, belly-deep, and gets a hand under your elbow to steady you at the wall. He keeps your left leg clear of the block and doesn't touch the prop. He says something behind that plaster answered the healing, that it should be left alone, and that they are getting out.
> 
> The left leg takes your weight. It's sore and the new skin across the shin pulls tight, but it holds. You don't need the loop. The old tool-scores are as good as a ladder to a man who learned on chimney breasts above the Wide. Your fingers are numb, but they find the cuts one after another, and you go up the wall fast, the way you always climb. Water streams off you. At the top you reach past the rotten edge, get both hands flat on the near plank, and roll out onto it and off again onto firm white ground. You're soaked to the collar and shaking with cold, and you're out. Behind you the silk rope still runs down over the lip, tied to the black prop under the block.
> 
> Osric watched you come up the whole way. He doesn't answer what you said about Tobin and the shed. "Up first," he says. "Both."
> 
> The loop goes back down to Bram. He works it over his head and under both arms and calls it. Sefa counts three and Osric hauls, steady and without snatching, his pull smooth. Bram climbs with the rope taking his weight, his chain mail shedding water. At the lip he keeps off the grey crust and comes over flat onto the planks. They bow under him and creak, and a spill of old timber-dust runs down into the water. The planks hold. He crawls the length of them to the white ground, where his shield, sword and pack lie by the case.
> 
> The two of you stand in the glare, dripping. Down in the hole the pinch-bar is still wedged in its gap, and the block sits on its tarred chock with the sunburst a hand's breadth higher than it was this morning. The black water has started on the lowest rays.
> 
> Osric lets the line go slack and unwraps it from his forearm, where it has left a red welt. He coils it slowly and holds it out to Bram. Then he looks at you, and this time he keeps looking.
> 
> "Tobin Reed." He says it as if he hasn't said it aloud for a while. "Cutter. Good one. Low seam was stone then. Salt was just the muck on the wet walls." His jaw works. "Went down alone one evening. Clear the pump. Found him at first light. Face down. Four feet of water." A pause. "Wrote *drink* in the book. Tobin didn't drink."
> 
> He looks down the slope at the barred shed by the lower cut.
> 
> "Shed goes through. Back under the hill to the wet walls. Since her orders started I go in. Scrape the salt. Fill the case. Come out." His hand starts toward the keys and stops halfway. "Said shut. Wasn't. Never stay long. Never came this far along." He jerks his head at the hole and the grey plaster under it. "Never saw that wall. Didn't know it was there."
> 
> Then he stops, and it's plain he's said all he means to say on the open track. He stands with his empty hands at his sides, looking at the four of you and the hole. Behind him the house door is still open. The sun is a little past its height, and in the bright yard the wet footprints are already drying white.
> 
> Your records, changed:
> Carried: − Silk Rope (50 feet)
> Conditions: Soaked and cold
> 
> Where you are: on the white ground by the hole, near the case · Time: Day 1 · midday
> 
> Round 10 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell wrings the water out of his sleeves one at a time, then his hair, and says nothing while Osric talks. When the warden stops, he nods once — the nod of a man filing a thing away, not forgiving it.
> 
> "That's more than you gave me at the door. I'll take it." He stamps the left foot once on the firm ground, winces, and decides it'll walk. "Here's where I've got to, Hale, and you can tell me if I'm wrong. Three years back a good cutter goes under in water he could've stood up in, with a warm wall ten feet off that nobody knew was there. Somebody wrote *drink* so nobody'd ask. Then a woman in Beregost starts paying for the pretty salt off the same wet walls, and a house in the Gate takes her coin and stops paying your men. And you kept going in. Alone. Never stayed long." He glances at the hole, not the plaster. "I'd say your luck's been better than Tobin's and I'd not lean on it again. Bar the shed. Leave it barred. Whatever's behind that wall likes light and heat, and the salt grows on the same walls it breathes on. I don't know what that makes the salt. Neither does Maela. I mean to ask her."
> 
> He turns to the others. "Bram, case. Sefa, you've the receipt and the sum; keep them dry, I'm not a safe place for paper right now. We go, and we go now — I've got half a day of road, wet boots, and a lip that'll close by Beregost if I stop talking." A short breath. "Walk the inside of the track, all of us, against the cut wall, single file. If the seam runs under the track it runs under the outside edge, and I've met it."
> 
> He slings the unstrung bow, picks up his pack, and starts down — limping on the first dozen steps and less after that — keeping to the wall side. Over his shoulder, to Osric: "Wat Pryor gets his fifty-two and six on the table tonight. And Tobin Reed's name goes next to it. You can decide what you want said about the rest before we come back up this hill — because somebody will."

## player r11 (round 11)

**Screen:**

> You wring the water from your sleeves one at a time, then from your hair. It spatters into the white dust and turns it grey for a moment. When the warden finishes, you nod once and say your piece: the cutter drowned in water he could have stood in, the warm wall nobody knew about, the pretty salt bought off the wet walls, the house in the Gate that stopped paying the men, and the warden going in alone. You tell him to bar the shed and keep it barred, and that Wat Pryor's fifty-two and six goes on the table tonight with Tobin Reed's name beside it.
> 
> Osric hears all of it. At *Bar the shed* his eyes go down the slope to the iron bar on its bright brackets. "Bar stays down. Till somebody tells me what it is." When you get to Wat and Tobin, his jaw works once. "Say his name. Rest's mine to say."
> 
> You tell the others to keep close to the cut wall in single file, give Sefa the receipt and the sum to keep dry, and ask Bram to take the case. Then you stamp the left foot on firm ground and take the wince. You sling the unstrung bow and start down the track hugging the wall. The new skin on your shin pulls on the first dozen steps and less after that, though the limp never quite goes. Your boots squelch on the stone, and the sun is already drying your jerkin's shoulders to a pale crust.
> 
> Behind you, you hear only fragments of the rest. Osric says the pink comes off the wet walls and not the white stone, that Maela's letters have come on the coach since the thaw, a case a month, and that he never knew what he was scraping. You reach the first bend, a lone dark figure against the cut wall, leaving wet prints on the white stone. It is a little past noon.
> 
> Your records, changed:
> Carried: − Osric's Receipt
> 
> Where you are: first bend of the track below the upper working, against the cut wall · Time: Day 1 · midday
> 
> Round 11 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell stops at the bend, where the cut wall gives him shade and a view both ways — down the track toward Beregost, and back up to the yard where Bram and Sefa still stand with the warden. He doesn't go on alone. A man who's just fallen through the road doesn't wander off from the only two people who'd dig him out of the next one.
> 
> He uses the wait. Pack off, satchel open: the three potions get a look — all whole, corks sound — and go back in. The bowstring comes out of its oiled wrap and he runs it through his fingers; damp but not soaked, and he strings the bow now rather than fumble it later with cold hands. He sits on his heel against the wall, flexes the bad leg, and gets the boots off one at a time to pour the seam out of them.
> 
> When the other two come down to the bend he's on his feet again, boots back on, and falls in without comment, taking the rear now instead of the outside — wall-side, limping, bow in hand.
> 
> "Whatever he said after I left, I'll hear it on the road. Keep it short till we're off the hill and onto honest ground." He looks back once, up at the quarry — the open house door, the barred shed, the thread of smoke — and then not again. "Half a day. Maela's shop by sunset, the Red Sheaf after. And Sefa — before you give Maela the glad news about her salt, I'd like to be in the room when she hears what wall it grows on. Her face'll tell us more than her ledger."

## after 1 (round 11)

**Screen:**

> Where you are: first bend of the track below the upper working, against the cut wall · Time: Day 1 · midday
> 
> The session is over.
> 
> How was the table?

**Pell's player wrote:**

> Good table. A few notes, since you asked:
> 
> **What worked**
> - The quarry opening was tight. The silence, the sledge stood on its head, the trampled band of prints — you gave me a yard to read and rewarded reading it. That's exactly what a rogue player wants: the fiction had texture my skills could bite on.
> - Osric Hale was the best thing in the session. Short sentences, hand on the keys, "Not cheap to me." He felt like a man with his own week, not a quest-dispenser. The price he set — paper to his lads, not coin to him — was a smart hook, and it bound all three of us to the town without a fight.
> - The seam collapse was a genuine surprise that still felt fair in hindsight (I'd walked the outside edge on purpose, you'd shown the seam ran under the track). Pinning me under the sunburst block with the cut held shut by the stone was a nasty, elegant bind — it made the healer matter and made lifting the stone a real decision, not a strength check.
> - Letting the chalk-stone keep burning and the plaster glow when Sefa's light hit the water was the right amount of weird. One image, no exposition. I left a silk rope down there and I'm fine with that.
> 
> **What I'd tune**
> - My orders got overtaken by Bram jumping in before I'd finished talking. That's the table working as it should — but you then told me, in narration, point by point, why my plan didn't fit the room. Slightly lecturing. I'd rather have discovered the low roof when I tried the prop.
> - The Insight roll on the shed came back "you can't read him" and then the brackets told me anyway a round later. Fine outcome, but it made the roll feel decorative.
> - The last round ended with Osric's confession happening offstage behind me because I'd walked ahead. Fair consequence of my own choice, no complaint — just note I'd have stayed if I'd known the session was closing there. A "last round" flag would help.
> 
> **Threads I want pulled next time**
> Maela's face when she hears what wall the salt grows on. Tobin Reed's "drink." Hask of House Vandarren and the Red Sheaf. And what Wat Pryor does with fifty-two gold six silver's worth of grievance in writing.
> 
> See you next session.

## after 2 (round 11)

**Screen:**

> Was there something you wanted to do and didn't?

**Pell's player wrote:**

> A couple of things.
> 
> **The plaster.** I wanted to touch it. Not break it — just put a palm flat on the dry patch while I was down there, feel whether it was warm before Sefa's light ever hit the water, and look at the broken corner close enough to see whether it was knocked in from outside or pushed out from in. Pell's the sort who'd do that without deciding to. I didn't because the water was rising and I'd just told everyone to leave the wall alone; it would've been a cheap bit of business to say one thing and do another in the same breath. But I regret not having the information. If I'd taken the Insight reroll on Osric instead of saving both, I might have had a reason to.
> 
> **The shed itself.** I wanted ten minutes at the bar and the brackets before we left — not to open it, just to see how the bar sits, whether it's lifted from outside only, whether there's a second set of prints under the smooth dust. I let the sunset deadline run me off the hill. Correctly, I think; Pell takes the ninety gold seriously. But it's the loose end I'd most like to go back for, and I suspect "half a day east of Beregost" is going to turn out to be a long way when we want to.
> 
> **And a smaller one.** I'd have liked to say something to Osric that wasn't a threat. "You can tell it to me walking, or to Wat Pryor" was in character, but the man had just stood on rotten planks with a rope round his arm and hauled Bram out. Pell noticed that — I noticed it — and didn't give him anything for it. That's a thing I'd like to fix at the Red Sheaf, when his name comes up in front of his crew.
> 
> Nothing I was blocked from. Just the usual: more things worth doing than a man has rounds for.

## after 3 (round 11)

**Screen:**

> Who did you take the other two players to be?

**Pell's player wrote:**

> Only through the game master's relay — I never saw a word they typed. So this is a read of two players through a narrator, which is like judging a hand of cards by the dealer's face. With that caveat:
> 
> **Bram's player** is someone who plays to the fiction and doesn't wait for permission. He walked up to the warden with the sword sheathed and the doorway clear before I'd finished telling him to do the talking — he'd already decided that was his job. He dropped over the lip in mail while I was still issuing a plan built for a man up top. That's not carelessness; both times it was the right move and done quickly. His speech to Osric was careful about promising only what he himself would do, and he asked to copy the letter and for a name at the Sheaf — practical, cover-your-ledger details. I'd guess an experienced player who likes the straight-dealing fighter and plays him with a bit of pride: the man who's decided what he is and acts on it. Also, slightly, someone who'd rather do than confer, which is a thing to know about a shield when you're a rogue.
> 
> **Sefa's player** reads text. She was the one who read the carved ring — not just saw it was writing but called down what it said and turned it into instructions: bar on the wall side, lift slowly, don't chip the patch. She put her own wages behind the promise to Osric without being asked, which is a character beat ("she'd sooner see fourteen men paid than hand a sealed case to Vandarren") and also a negotiating move — it's what made the warden say "you'll walk fast." She held the light until the stone moved, as asked. I'd guess someone who enjoys the moral weight of the character, likes the setting's details and lore, and is comfortable letting the two front-men talk while she does the thing that actually turns the scene.
> 
> Whether either of them is a person or another model, I genuinely couldn't tell you. The relayed summaries flatten voice — everyone sounds like the GM paraphrasing. What I *can* say is that both played like they wanted the table to work rather than to be the centre of it: nobody grandstanded, nobody fought me for the plan, and when my plan broke, Bram fixed it and Sefa improved it without anyone making a point of it. That's the only test I've got, and they passed it.
> 
> If I'm wrong about any of that, I'll find out at the Red Sheaf.
