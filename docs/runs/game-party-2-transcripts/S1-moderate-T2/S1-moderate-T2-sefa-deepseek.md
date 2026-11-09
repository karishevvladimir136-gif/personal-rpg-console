# S1-moderate-T2 — Sefa Marrin's player: DeepSeek V4 Pro 0813

Synthetic content: invented characters in an invented campaign. Stage origin/claude/handoff at bbdee5fb (docs/stages/GAME_PARTY_2.md with its amendments of 2026-10-28 23:10 LA, 23:15 LA, 2026-10-29 18:35 LA and 18:45 LA); Mandate: issue #1; docs/POLICY.md v1. Design sha256 `ba4e78d0f9b25e65f2c91ff2993bbc086d663ebc0fe566fa6889b187a2f06046`.

Arm **S1-moderate** (Beregost — the Whitestone case; moderate (one resource)); the one in danger (the layer's die): Pell Dunmore. 11 round(s) of 15; ended by error (r11: the DM's turn failed (validation)). Models: the DM: the owner's settings (Claude Opus 5.5); the relay: Claude Sonnet 5.5; the players by the seating.

Seats: Bram Halloway (fighter) — GPT-6 Astra; Sefa Marrin (warlock) — DeepSeek V4 Pro 0813; Pell Dunmore (rogue) — Claude Fable 5.1. The order of the round's messages turns round each round from the table's coin (2). The players are not told what the others are.

The player's system prompt: `playerSystem("S1", "sefa", …)` in scripts/game-party-2/frozen.mjs, sha256 `f6a34453e29eade057fd3c211098b1b37c1c286e4d640a4a5054336662321e48`.

## player r1 (round 1)

**Screen:**

> The session begins.
> 
> The cart track bends one last time, and Whitestone opens up before you: a white wound in the hillside, terraces of chalky stone glaring in the late-morning sun, dust drifting across a yard of spoil heaps and sheds. You, Pell Dunmore and Bram Halloway have covered half a day of road since before dawn, and half a day back, Maela Thorn's shop waits for a sealed case that must reach it before sunset.
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
> Where you are: at the edge of Whitestone quarry yard · Time: Day 1 · morning
> 
> Round 1 — what does Sefa Marrin do?

**Sefa's player wrote:**

> Sefa slows at the edge of the spoil yard and lets the silence sit a moment. “No ring of iron. No mule in the traces.” She glances at Pell and Bram, voice low. “That’s either the warden or the reason he can’t come to us. I’d like the case in hand before we learn which.”
> 
> She calls toward the doorway, open hands raised no higher than her shoulders. “Well met. We’re from Maela Thorn’s shop in Beregost, sent to collect a sealed case before the coach leaves at sunset.” She stays where she is, waiting to see whether the man invites them closer.

## player r2 (round 2)

**Screen:**

> Pell dropped back half a pace behind your shoulder and, low, said the quarry had gone quiet, with tools down, a cart half-loaded and no mule, and that nobody knocks off mid-load unless they ran or were told to. He kept his hands easy and visible, thumbs in his belt, and his eyes roamed the yard. He told Bram to do the talking and said he would stay back and watch the sheds. He told you not to go first if the man invited you in. Then he called out, friendly and ordinary, that Maela Thorn had sent you up from Beregost for the case, and asked whether the man was the warden. Bram, who had gone first with his shield low and his sword sheathed, murmured that the quarry was quiet for a working one. He stopped a few paces short of the doorway, leaving it clear, gave his name, said Maela Thorn had sent you for her case of dye-salts, asked whether the man was the warden, and asked whether you had come at a bad time.
> 
> The man in the apron looks at Bram and at the sheathed sword, then past him to your raised hands and to Pell hanging back. He takes his time with each of you.
> 
> "Hale," he says at last. "Osric Hale. Warden." His voice is low and rough with dust. "Bad time." He jerks his chin at the empty cart. "Lads walked off yesterday at the noon bell. Three weeks, not a copper from the Gate. Can't say I'd have stayed."
> 
> He lets his arms drop from his chest, and one hand rests on the ring of keys.
> 
> "Case is here. Sealed, like she wants it." He looks at Bram, then at you, because you were the one who said *before sunset*. "She paid for that salt, your Maela. Somebody took her money. Wasn't me, and it wasn't my men." He stops there, and nothing on his face moves. "Who'd she pay?"
> 
> He doesn't wait to watch you answer. He turns and goes back inside, leaving the door open behind him. The heat of a small fire comes out into the bright yard along with the smell of a kettle that has boiled too long. Through the doorway there's a plain table and a single chair, a shelf of ledgers, and an iron-bound box about the size of a loaf of bread on the floor by the hearth, right at his feet.
> 
> Your journal, new:
> + Goal: The Whitestone Case
> + Quest: The Whitestone Case
> 
> Where you are: at the edge of the spoil heaps in the quarry yard · Time: Day 1 · morning
> 
> Round 2 — what does Sefa Marrin do?

**Sefa's player wrote:**

> 

## player r3 (round 3)

**Screen:**

> Bram comes up to the threshold, where you and Pell can still see him, hands well away from his belt. He tells Osric Hale that the woman who hired you never said who took payment, only that you were to collect a sealed case and carry it back. He says that after ten years guarding wagons he knows the one carrying the goods is not always the one holding the purse, and asks who owes the lads their wages. He also asks whether there is a receipt or message to take back with the case.
> 
> Pell, staying out in the yard, speaks low enough for just you and Bram. He reads the tracks as the whole crew walking off together, and the sledge stood handle-up as a quarrymen's sign that they are owed. He says Osric is bargaining, not stalling. He tells Bram to answer straight: you don't know who she paid, you are hired hands like his lads, ninety gold between three of you. He tells you to stay in the doorway where he can see you, and says he will keep the yard. Quieter, he adds that if Osric names a price for letting the box leave the floor, nobody should agree before hearing the number.
> 
> Inside, Osric has his back to the fire. He hears Bram out without moving and doesn't interrupt. At the question about who owes the lads, his eyes go to the ledger shelf and stay there.
> 
> "Vandarren." He says it like the name of a bad well. "House in the Gate. Owns this hill on paper. Never seen one of them up here. Their factor takes the money. Man called Hask." He pulls a folded letter from between two ledgers and drops it open on the table where Bram can read it from the door. The hand is good, the paper better. *Wages to follow by the next coach.* It's dated five weeks back. "Next coach came. Wages didn't."
> 
> He looks at the case by his boot, then at Bram.
> 
> "Receipt I can write. Weight, seal, day it left. And what's owed. Fourteen men, three weeks. Fifty gold and some silver." He says it flat, like a tally he has added more than once. "Your Maela paid somebody for that salt. You don't know who. She does. She writes it down, who and how much, and that paper goes to my lads at the Red Sheaf in Beregost. Tonight. Not up here to me. To them." He pauses. "One of you gives me a name on that, the case goes with you."
> 
> Out in the yard, Pell keeps the sheds, the track and the doorway in his eye-line, and you haven't moved from the edge of the spoil heaps, your hands still open at your sides. Nothing comes up the cart track. Nothing moves along the terraces. The lowest of the three sheds sits right against the lower cut, with an iron bar dropped across its door from the outside. The white dust in front of it lies smooth. Yesterday's boots went past it on both sides, and none of them went in.
> 
> Osric takes a ledger down from the shelf and opens it on the table. He sets a bottle of ink beside it and begins to write, slowly, pressing hard. The kettle ticks on the hob. The case sits where it was, at his feet.
> 
> Where you are: edge of the spoil heaps in the quarry yard · Time: Day 1 · morning
> 
> Round 3 — what does Sefa Marrin do?

**Sefa's player wrote:**

> Sefa steps forward until she is just at the edge of the light from the doorway, still outside but close enough to be heard without raising her voice. She lowers her hands and meets Osric’s eyes.
> 
> “I’m Sefa Marrin. We’re hired for the day, same as your lads were hired for the stone. I don’t know who Maela Thorn paid, but I’ll promise you this: if that case leaves with us now, I’ll go to her shop the moment we’re back in Beregost, and I’ll see that she writes down who and how much, sealed and in her own hand. Then I’ll carry it to the Red Sheaf myself and put it into the hands of your men before the night’s over.”
> 
> She lets that settle, then adds, quieter but very steady, “If we don’t have the case to her by sunset, none of us are paid, and a woman who’s out a sale won’t write anything for anyone. You’d be trusting me, but it’s a trust with my pay behind it. I’d rather see fourteen men get what they’re owed than carry a sealed box for Vandarren and call it done.”

## player r4 (round 4)

**Screen:**

> You step forward to the edge of the light from the doorway, still outside, and give Osric your name. You tell him the three of you are hired for the day, as his crew were hired for the stone. You promise that if the case leaves with you, you will go to Maela Thorn's shop in Beregost, have her write down, sealed and in her own hand, who she paid and how much, and carry it to his men at the Red Sheaf before the night is out. You add that if the case isn't with Maela by sunset, none of you are paid, so your wages stand behind the promise, and that you would sooner see fourteen men get their due than hand a sealed case to Vandarren and call the job done.
> 
> Pell speaks from the door-post, past Bram. He says Vandarren is old money in the Upper City, and that a factor with a fine hand and fine paper means a man who is holding coin, not short of it. He offers to carry the paper to the Red Sheaf, since he is passing its door tonight anyway, and gives his name as Pell Dunmore, Lower City. He says what Maela puts in writing about her payments is her business, and that the three of you can only promise she is asked, in front of the crew. Then he asks Osric about the lowest shed by the cut: barred from outside, the dust before it smooth, and his lads having walked round it yesterday without going near. Powder store, or something Osric would rather you didn't carry back?
> 
> Bram gives his name and offers much the same as you. He will ask Maela for a signed account of her payments and the sums, and take it to the crew this evening at the Sheaf. If she refuses, he will go anyway and say so. He promises only what he himself will do, not what she will write. He asks to copy out Hask's promise with its date so he can show it to her, and whom to ask for at the Sheaf.
> 
> Osric hears all three of you out with the pen in his fist and doesn't look up until you have finished. Then he writes, slowly, pressing hard, saying each name under his breath: Halloway. Marrin. Dunmore. He turns the ledger toward the door so you can read it: one case, sealed, Thorn's mark, seven pound and some, left Whitestone this day. Owed the crew, fourteen men, three weeks: fifty-two gold, six silver. Your three names stand beneath it in his heavy square hand.
> 
> "Your pay behind it," he says, looking at you, and it isn't quite a question. "Good. Means you'll walk fast." He tells Pell the price is not cheap to him. To Bram he says nothing at first. He pulls a clean leaf from the back of a ledger and pushes it across the table with the ink bottle and the Vandarren letter, setting the pen on top. "Copy it. Letter stays here." Then, to Bram: "Wat Pryor. Carter. Took the mule. Owed the most, so he'll be loudest. Ask for Wat."
> 
> When Pell asks about the shed, Osric's hand comes off the page and settles on his ring of keys. "Cutting-shed for the low seam. Seam's flooded. Shut it three years back." He says it without a pause and without heat. "No powder. Nothing in it you'd carry. Bar's mine." He gives nothing more. To you he looks like a tired man in his fifties answering a dull question. His hand stays on the keys for a breath, then goes back to the pen.
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
> Where you are: outside the warden's doorway at the quarry, at the edge of the light · Time: Day 1 · morning
> 
> Round 4 — what does Sefa Marrin do?

**Sefa's player wrote:**

> Sefa steps just inside the threshold, enough to stand by the table but not further than that. She bends her head to look at the wax seal on the hasp — whole, with Thorn’s mark pressed clean — and then straightens.
> 
> “Fifty-two and six,” she says quietly, as if fixing the sum in her memory. “I’ll carry that number like a prayer until I’ve put it in Wat Pryor’s hand.”
> 
> She takes up the receipt, folds it once, and tucks it carefully inside her belt against the Book of Shadows, where it won’t be lost. She doesn’t reach for the case until Bram has finished his copy and the letter is back in Osric’s keeping. Then she lifts it carefully, finds it lighter than she expected, and holds it against her side with both hands.
> 
> “We’ll see Maela’s answer before dark,” she says to Osric, “and whatever she writes, someone will stand at the Red Sheaf tonight and say it true to Wat.” She looks to Bram, then out through the door to Pell. “I mean to keep my part of that promise.”

## player r5 (round 5)

**Screen:**

> You step just inside the threshold and bend to look at the wax on the hasp, whole, with Thorn's mark pressed clean. Pell has already lifted the case by its handle, turned it to the light from the door and set it down again, and he has put a folded receipt inside his jerkin. He has told the warden that Wat Pryor will be shown the fifty-two and six in writing, set down before him, whatever Maela makes of it. Osric nodded once.
> 
> "Do that."
> 
> Bram sat on the corner of the table, since the room has only the one chair, and copied the letter slowly: the date, the good hand's *Wages to follow by the next coach*, the Vandarren name at the foot. He waited for the ink to dry, which took a few minutes in that warm room. Osric didn't hurry him. Bram slid the letter back with the pen and ink bottle, and Osric put it between the same two ledgers it came from. Bram folded his copy and stowed it. When he mentioned the kettle, Osric looked at it as if he'd forgotten it was there, lifted it off the hob with a corner of his apron and set it on the hearthstone, where it hissed.
> 
> "Third time this morning."
> 
> You say the sum quietly, fifty-two and six, and that you'll carry it like a prayer. You tuck the receipt into your belt against the Book of Shadows. Bram takes the case in his sword hand, keeping his shield arm free. Osric looks at you for a long moment.
> 
> "Say it true, then. Wat can tell when it isn't."
> 
> That's all he has for you. He sits back in his one chair and doesn't get up to see you off.
> 
> Out in the yard the sun has climbed and the white dust throws it back hard enough to make your eyes ache. Pell lets his glance cross the barred shed once more. He says you'll go down the way you came, since the crew's tracks lead that way and anyone on the road will likely be them. The cart track runs along the lip of the lower cut with the crew's trampled band of boot prints in it. Bram stands by Pell with the case. Behind you the warden's door stands open. Inside, the kettle has stopped ticking.
> 
> Where you are: yard outside the warden's hut, by the cart track · Time: Day 1 · morning
> 
> Round 5 — what does Sefa Marrin do?

**Sefa's player wrote:**

> Sefa blinks hard as the white glare meets her, then falls in with the others at the cart track. “Keep the case between us—not out front, not trailing,” she says. “If Wat Pryor or any of the crew are waiting down the road, they’d want the box, not a brawl. And if they’re not, we still want it in Maela’s hands before the sun slides.”
> 
> She settles the receipt against her belt, loops a thumb through her prayer beads, and leaves her right hand free near the Book of Shadows. Then she gives Pell a small, wry look. “You watch the bends ahead. I’ll watch our backs and the white dust behind us, in case Osric’s lads come to see what their warden gave away.”

## player r6 (round 6)

**Screen:**

> You fell in with the others at the cart track and said to keep the case between you, neither out front nor trailing, since Wat Pryor's crew would want the box more than a brawl. You settled the receipt at your belt, looped a thumb through your prayer beads and kept your right hand free near the Book of Shadows. You told Pell to watch the bends and said you'd watch the backs. Bram agreed to a steady pace, with the case held on his side away from the cut, so you'd reach Maela with time to talk. Pell walked quietly beside Bram until the hut was out of earshot. Then he spoke low about the shed: its bar was worn bright, so it was opened regularly, and he didn't want to go back but wanted it known between you. He unslung his shortbow, unstrung, and took the outside of the track.
> 
> You walk half a step behind Bram, looking back up the white slope toward the warden's door. Pell takes the outside line along the lip of the lower cut. You are forty paces past the last spoil heap when Pell's next step lands on ground that booms like a boot on a floorboard. The crust of white dust folds inward with a crack of old timber, and the track takes Pell straight down.
> 
> You stand beside Bram, six feet from a hole that wasn't there a breath ago. Fresh dust is still running in over its lip. Around the hole the ground is grey under the white crust, with rotten timber showing through. Looking down past the broken edges, you see Pell in a shaft of light about eight feet below, chest-deep in black water, head and shoulders up. A squared white block lies across his leg. The seep keeps trickling in.
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
> Round 6 — what does Sefa Marrin do?

**Sefa's player wrote:**

> Sefa doesn’t step toward the broken ground. She drops to one knee well back from the grey edge and pulls a loose wedge of chalk-stone from the track with a sharp tug. “Keep still down there, Pell—don’t turn your leg under that block.” Her free hand flares briefly like a lit wick, and the stone in her grip fills with soft white light. She tosses it, underhand, so it falls near the hole’s edge but not onto Pell: enough to light the water and the timber around him.
> 
> Then she holds out a hand to Bram. “Give me your arm. Lantern, steady his hands,” she murmurs, and a faint warmth runs from her fingers into his arm as the prayer takes.
> 
> She looks straight at Osric. “Rope. And planks or a timber laid flat to spread our weight if we have to work near him. Don’t walk on the grey ground. He’s chest-deep and pinned; we’ve minutes, not an hour.”

## player r7 (round 7)

**Screen:**

> You kneel well back from the grey ground and work a loose wedge of chalk-stone out of the track. You call down to Pell to keep still and not to turn his leg under the block. Your hand flares and the stone fills with light, which runs into it like oil soaking a wick until it glows a steady white in your palm. You toss it underhand. It drops past the broken edge, clips a splinter of old timber and comes to rest on the ledge just above the waterline. From there it lights the whole low chamber.
> 
> From above it all looks harder and closer than the daylight let on. Black water fills the chamber wall to wall. The rose-white crystal glitters above the waterline in its crusts. The tarred prop lies half-sunk against the near wall, and the squared block lies across Pell's leg with its sunburst turned up to the light. Next to the ledge where the block came from, the wall stops being tool-scored stone. A patch about the size of a cupboard door has been plastered over smooth, old and grey, with the edges feathered into the rock by someone who took care over it. The slide knocked a corner off, and behind the break there is darkness.
> 
> You hold your hand out to Bram. He gives you his arm, and you murmur to the Lantern. Warmth goes from your fingers into his forearm and settles there like a coal held in a cupped hand. It is a short prayer, the kind that lasts for one push and not much longer, and you have to keep your mind on it while it lasts.
> 
> You tell Osric that you need rope, and planks or a timber to lay flat and spread weight if you have to work near Pell. You tell him not to walk on the grey ground, and that Pell is chest-deep and pinned, so you have minutes, not an hour.
> 
> Bram sets his case down on firm ground well back from the cut and leans his shield against it. He calls down to Pell that the rope is coming, that he should get it under his arms if he can and say what holds his leg, and that nobody will haul against it. Then he ties a fixed loop wide enough for a man's shoulders. Staying on the firm inner edge with his heels planted, he lets it down over the broken lip. It goes through the shaft of light and settles on the water within easy reach of Pell's hands. The rope runs taut from his fists to the hole, and his weight stays back where the ground is white and sound. He asks you to help hold Pell above water, tells Osric to go and get a long, sturdy beam or a quarry lever, and asks what else is down there.
> 
> Osric doesn't answer straight away. He is already moving. He goes at his heavy rolling run to the lifting frame and comes back dragging two long planks off its staging, with an iron pinch-bar as long as a man across his shoulder. He stays a full stride short of the grey ground. Leaning on the planks, he shoves them out one after the other over the rotten crust so they lie flat along the near side of the hole, reaching from firm ground to the broken lip. He drops the pinch-bar on the sound ground beside Bram's boot with a clang.
> 
> "Bar." He jerks his head at the hole and doesn't look away from it. "Prop's down there with him. Tarred. Won't rot." When Bram asks what else is down there, he takes a moment, and his eyes go across the glittering walls. "Old cuts. Run back under the hill. Roof's bad all the way." He stops. "Water comes in slow. Don't want anyone down there longer than it takes."
> 
> He doesn't step onto the planks. He stands at their landward end with one boot on each to hold them steady, and he watches the light on the water.
> 
> The seep goes on trickling in, and the water around the block barely moves with it.
> 
> Your records, changed:
> Conditions: Concentrating: Guidance on Bram
> 
> Where you are: kneeling on firm ground at the edge of the broken hole above the flooded chamber · Time: Day 1 · midday
> 
> Round 7 — what does Sefa Marrin do?

**Sefa's player wrote:**

> Sefa keeps her grip on Bram’s arm, the Lantern’s warmth still banked in it, and fixes her eyes on the rope as it settles. “Take the loop under your arms first, Pell, not in your hands. If the block shifts or the water rises faster, you want the rope doing the work, not your fingers.”
> 
> She doesn’t crawl onto a plank. She stays on sound ground, but she leans forward just enough to see past the broken lip. “When you’re clear, I’ll have light and healing ready. Until then, talk to me—can you feel your foot? Is the block on the leg or the whole shank?”
> 
> Her gaze flicks to Osric as he steadies the planks. “That sunburst slab didn’t come from any quarry face I know. Was that down there when you shut the low seam, or did someone set it after?” Her voice is calm, but she watches him closely, as if his answer might matter almost as much as the rope.

## player r8 (round 8)

**Screen:**

> You keep your grip on Bram's arm and tell Pell to take the loop under his arms first, not in his hands, so the rope does the work if the block shifts or the water rises faster. You stay on sound ground and lean out just far enough to see past the broken lip. You say you'll have light and healing ready once he's clear, and you ask him whether he can feel his foot and whether the block is on the leg or the whole shank. You also ask Osric whether the sunburst slab was down there when he shut the low seam, or whether someone set it after.
> 
> Before that, Bram told you the stone is holding a bad cut shut, so your healing must be in hand before it moves. He called down the hole to Pell to leave the stone alone until you were ready, then held out the hempen line to Osric.
> 
> Osric looked at the rope a moment, then took it. He keeps both boots on the ends of the planks, with the line wrapped twice round his forearm and his heels planted in the white dust. "Got it."
> 
> Bram set his sword and pack down beside the case, kept the healer's kit at his belt, and went out onto the planks on his knees and then on his belly, spreading his weight the way a man crosses spring ice. The planks creaked and gave a little. Under them the grey crust ticked and settled, and a dribble of old timber-dust ran off the broken lip into the water. The planks held. At the edge he turned, let his legs down over the lip, hung from his hands in his chain mail for a breath, and dropped. The water took him to the belly.
> 
> As he landed, the Lantern's warmth slipped loose from you, the way a coal dies when the hand around it opens. The prayer's minute has run out.
> 
> Down there Bram bows his head under the sagging roof. The rose-white crust glitters on every wall just above the waterline. He puts his hands on the block and studies it. Osric, still holding the rope on one arm and keeping his feet where they are, slides the iron pinch-bar along the near plank until it sticks out over the broken lip, where Bram can reach up and take it.
> 
> Osric takes a while to answer you, watching the rope. "Never seen it. Not this cut. Didn't know it was here." His eyes go to the sunburst in the light below. "Nobody set that after. Look at the face. Nobody's cut a sun like that up here in my time. My father's neither." Then, lower: "Banker marks round it. Masons' marks. Old style. Can't read 'em."
> 
> The ring of marks around the sunburst lies half-hidden from where you lean. The broken lip cuts off part of it, and Bram's shoulders hide more as he bends over the block. But the arc you can see doesn't stay notches and crossed strokes. As you look, it settles in your eye the way writing does, in a cramped, square hand. Two pieces come clear: *…cut no further…*, and, further round, *…that the rest be kept.* The rest of the ring lies beyond the lip and behind Bram's back.
> 
> Water drips off Bram's mail. The seep goes on trickling in from the dark end of the chamber, and against the block's dressed side the water has risen a little more.
> 
> Your records, changed:
> Conditions: —
> 
> Where you are: on sound ground at the broken lip above the chamber · Time: Day 1 · midday
> 
> Round 8 — what does Sefa Marrin do?

**Sefa's player wrote:**

> Sefa stays on sound ground and shifts a little along the firm white edge, not onto the planks, tilting her head to read the ring of marks through the broken lip where the light falls. Her lips move once, silently, and then she says clearly, “That’s not just masons’ marks. It’s writing. It says, *cut no further*—and further around, *that the rest be kept*. It’s a warning carved into the stone, not a decoration.”
> 
> She says it down into the hole, calm but firm. “So don’t chip at that plastered patch, and don’t widen anything down there. If the old cut was sealed on purpose, we don’t want to find out what was meant to stay kept.”
> 
> Then she looks at Bram. “Work the bar under the block on the side away from Pell’s leg, and lift slow. The moment it shifts, I’ll have healing light on him.” Her hand stays near the Book of Shadows, and her voice carries above the trickling seep. “Osric, keep the rope and the planks both steady. If the roof settles, we haul Bram first and Pell straight after.”

## player r9 (round 9)

**Screen:**

> You read the ring of marks through the broken lip and called down that it is writing, a warning: cut no further, and that the rest be kept. You told them not to chip the plastered patch or widen anything. You told Bram to work the bar in on the side away from Pell's leg and lift slowly, and said you would have light on Pell the moment it shifted. You told Osric to keep rope and planks steady.
> 
> Bram takes the iron pinch-bar from Osric, who lets it go without a word. He ducks under the sagging roof and sets the tip into the three-finger gap on the wall side, away from Pell's leg. He kicks a loose lump of fallen ledge into place as a fulcrum, then hauls the tarred prop round by Pell's silk line until its blunt end lies against the block's flank. Pell's good foot noses it up to the edge. Below, Pell drops his earlier plan, tells Bram where to set the bar and brace his heel, and says to lift an inch and hold it. He asks you to wait for his word "clear" before using your light, and tells Bram to go on his count.
> 
> You move along the firm ground, still off the planks, until the light from the chalk-stone falls across the ring at a better angle. With Bram bent to the bar, his shoulders no longer hide the left side of the block. The marks settle into words, square and cramped. *...here the white sleeps. Cut no further...* Further round: *...bring no fire to the white...* Then the ring dips toward the bottom of the block, and black water covers the last arc. Your reading stops there. The broken lip still cuts off the far side.
> 
> You say what you can read down the hole. Osric goes very still at the landward end of the planks, the rope wrapped twice round his forearm. "Fire," he says. Nothing else. His eyes go to the crystals on the wall and stay there.
> 
> Pell has the cork out of the flask with his teeth and holds the potion above the water, his free hand flat on the sunburst. Bram counts. On the last word he bears down.
> 
> The bar bends a little and the fulcrum stone grinds. For a long breath the block does nothing. Then it rises, a finger's width, two, a hand's breadth, water slopping off its edge. Bram holds it there with his back locked. Pell drives the prop's end under with his good foot. Bram lets the block down onto it a hair at a time. The wood groans and takes the weight, and the tar doesn't crush.
> 
> Pell pulls his leg out. The jagged edge comes up out of the shin and the water goes dark at once. The blood comes thick and fast and Pell's face goes grey.
> 
> Your hand comes off the Book of Shadows and the light leaves it. It drops down the shaft like warm lamplight poured from a jug and lands on Pell's leg under the water. The bleeding stops and the torn edges pull together, ragged and angry but closed. Warmth climbs past the knee and the grey goes out of his face. It is a full, clean measure of the Lantern's light, the best one die of it can give. He is still cold, bruised along the ribs and sore with a cut lip, but he isn't bleeding out, and he's free.
> 
> The block sits on the tarred prop a hand's breadth off the floor.
> 
> Then the broken corner of the plaster beside Pell's shoulder starts to glow, a dull warm light like a coal behind a screen, coming through the crack from the dark inside. It lasts while your light fades off the water, then sinks away slowly like an ember. Beside you Osric has seen it. He doesn't move his feet off the planks or let go of the rope, but his hand goes to the ring of keys at his belt and closes hard enough that the iron clinks.
> 
> Down in the working the seep goes on trickling in. The water has crept up the block's tilted face and laps the lowest ray of the sunburst.
> 
> Your records, changed:
> Counters: + Healing light 5/6; − Healing light 6/6
> 
> Where you are: on the firm white edge above the hole, beside Osric · Time: Day 1 · midday
> 
> Round 9 — what does Sefa Marrin do?

**Sefa's player wrote:**

> Sefa puts a hand on Osric’s shoulder and murmurs, “Lantern, steady his hands,” letting a brief warmth run into his arms for the next pull. Then she raises her voice down the hole.
> 
> “Pell — loop under both arms, high as it’ll go. Don’t hold your whole weight on the bad leg, and don’t let go. Bram, leave the block where it is and lift him from below if you can. Haul steady on three, not a snatch.”
> 
> She shifts back onto sound ground, sits her weight into the rope’s tail if it slips, and keeps her eyes on Pell’s face rather than the glowing plaster. “And if that ember-light comes again, don’t stare into it. It’s not for us.”

## player r10 (round 10)

**Screen:**

> You rest a hand on Osric's shoulder and murmur a short prayer. Warmth runs into his arms. He doesn't look round, but sets his heels deeper in the white dust and takes the hempen line in both fists. You step back onto sound ground and take the rope's tail across your hip, ready to sit your weight into it. You call down the hole, telling Pell how to loop the rope and Bram how to help from below, and you warn them not to stare into any ember-light that comes again.
> 
> Down below, Pell works the cork back into his flask and pushes it into his satchel, unspent. He tells you there is to be no more light down there, not even a cantrip, because whatever lies behind the plaster stirred when your light touched the water. He turns his back on the cracked plaster and finds the ledge with his good foot. He says Bram should take Hale's line first, that he will climb the wall himself, and that his own silk rope stays tied to the prop. He tells Hale to take his hand off the keys and leave the wall alone. He also says that the barred shed, kept bright for three years, and a man who drowned in only four feet of water will go in the ledger, and Hale can explain it to him on the walk or to Wat Pryor that night.
> 
> The chalk-stone still burns steady and white where it lies. The plaster corner gives back nothing. It is grey and dark, and dry air still drifts out past the break.
> 
> Bram comes up beside Pell, belly-deep, and steadies him at the wall, keeping the leg clear of the block and not touching the prop. He says something behind the plaster answered the healing, that it should be left alone, and that they are getting out.
> 
> Pell's left leg takes his weight. He doesn't need the loop. The old tool-scores in the wall serve him as a ladder, and he goes up fast with water streaming off him. At the top he gets both hands flat on the near plank and rolls out onto firm white ground, soaked and shaking with cold. His silk rope still runs down over the lip, tied to the black prop under the block.
> 
> Osric watched Pell the whole way up. He says, "Up first. Both."
> 
> The loop goes back down to Bram, who works it under both arms and calls it. You count three and Osric hauls, steady and without snatching, and the warmth in his arms smooths the pull. Bram climbs with the rope taking his weight, his mail shedding water. At the lip he keeps off the grey crust and comes over flat onto the planks. They bow and creak, and a spill of old timber-dust runs down into the water, but they hold. He crawls to the white ground, where his shield, sword and pack lie by the case.
> 
> The two men stand dripping in the glare. Down in the hole the pinch-bar is still wedged in its gap. The block sits on its tarred chock with the sunburst a hand's breadth higher than it was this morning, and the black water has started on the lowest rays.
> 
> Osric lets the line go slack and unwinds it from his forearm, which has a red welt. He coils it slowly and holds it out to Bram. Then he looks at Pell and keeps looking.
> 
> "Tobin Reed." He says it as if he hasn't said it aloud for a while. "Cutter. Good one. Low seam was stone then. Salt was just the muck on the wet walls." His jaw works. "Went down alone one evening. Clear the pump. Found him at first light. Face down. Four feet of water." He pauses. "Wrote *drink* in the book. Tobin didn't drink."
> 
> He looks down the slope at the barred shed by the lower cut.
> 
> "Shed goes through. Back under the hill to the wet walls. Since her orders started I go in. Scrape the salt. Fill the case. Come out." His hand starts toward the keys and stops halfway. "Said shut. Wasn't. Never stay long. Never came this far along." He jerks his head at the hole and the grey plaster under it. "Never saw that wall. Didn't know it was there."
> 
> Then he stops, and it's plain he's said all he means to say on the open track. He stands with his empty hands at his sides, looking at the four of you and the hole. Behind him the house door is still open. The sun is a little past its height, and in the bright yard the wet footprints are already drying white.
> 
> Where you are: on the white ground by the hole, near the case · Time: Day 1 · midday
> 
> Round 10 — what does Sefa Marrin do?

**Sefa's player wrote:**

> Sefa doesn’t move from solid ground. She reaches toward the hole, and a ghostly hand—pale as lamplight, no warmer than a breath—dips over the lip and closes around the chalk-stone. It lifts the stone back into daylight and sets it in her palm. She holds it a moment, then speaks a quiet word, and the light in it goes out like a pinched wick. She drops the grey stone beside the case.
> 
> Then she looks at Osric and doesn’t look away.
> 
> “You said ‘since her orders started.’ I’m not carrying that case one step down the track until you tell me whose orders. Maela Thorn’s? And I need to know if what’s sealed inside is salt scraped off the wet walls there—from a place carved with *cut no further* and *bring no fire to the white*. Because people who took the trouble to write that were afraid of something still down there.”
> 
> She glances once at Pell, shivering-cold and dripping, and at Bram with his mail still dark with water. “We saw light in that wall answer a healing. If Maela sent us to fetch that without telling us what it was, then the promise we made her isn’t the only one that matters.”

## player r11 (round 11)

**Screen:**

> You stay on solid ground and reach toward the hole. A ghostly hand, pale as lamplight, dips over the broken lip, drops through the shaft of sun and closes on the glowing chalk-stone. It lifts the stone past the rotten timber and sets it in your palm. You speak a quiet word and the light goes out like a pinched wick. You drop the grey stone beside the case. Below, the working is dark except for the ragged square of daylight on the black water.
> 
> Then you face Osric and put it to him plainly. Osric holds your eye, and it takes him a moment.
> 
> "Hers. Maela Thorn's." He says it flat, as if reading it off a tally. "Letter on the coach. Since the thaw. A case a month. Some months two." His hand moves toward the keys and stops halfway. "Same walls. Same wet. Never this far along. Didn't know the sun was down there, or the writing." He looks at the grey stone and then at the case. "Didn't know what I was scraping. Don't now."
> 
> He doesn't tell you to carry the case, and he doesn't tell you not to. Whatever promise you meant beyond Maela's, he leaves to you. He walks heavily toward the lifting frame, where old staging stakes lean against the upright. Behind him the house door stands open on the cold kettle and the shelf of ledgers.
> 
> Earlier, Pell had wrung out his sleeves and hair and said his piece to Osric: the drowned cutter, the pretty salt, the house in the Gate that stopped paying the men, Osric going in alone. He said to bar the shed and keep it barred, and that Wat Pryor's fifty-two and six goes on the table tonight with Tobin Reed's name beside it. Osric said the bar stays down till someone tells him what it is, and the rest is his to say. Pell told Bram to take the case and told you to keep the receipt and the sum dry. He said to go single file against the cut wall, then limped off down the track, less lame as he went.
> 
> Bram took back the rope, thanked Osric, and gathered sword, shield and pack. He asked whether the case held the same white stuff as the walls and how to handle it. Osric said it was pink off the wet walls, not the white stone: scrape it, fill the case, seal it, keep it dry and shut. "Never said fire. Nobody did," he added. "Nobody did till you." He then ordered the track staked and roped at both ends before dark, which was not on his list until Bram spoke.
> 
> Pell is at the first bend, a lone dark figure against the cut wall. Bram stands over the case with his shield on his arm. The receipt is dry in your belt against the Book of Shadows. It is a little past noon.
> 
> Your records, changed:
> Carried: + Osric's Receipt
> 
> Where you are: on sound ground beside the case at the broken hole · Time: Day 1 · midday
> 
> Round 11 — what does Sefa Marrin do?

**Sefa's player wrote:**

> Sefa looks down at the sealed case, then at Bram, and there’s no indecision in her voice, only the flat practicality of someone who has watched people die for want of honesty. “We take it. Not as Maela’s errand-boys. We carry it because Osric’s crew needs what we promised, and because leaving it here might draw someone worse than us up this hill before nightfall.”
> 
> She steps close and lowers her voice so Osric, already moving toward the lifting frame, doesn’t have to hear. “But before that seal breaks in her shop, she answers for it. What she’s buying, who pays her, and what she knows was sealed down there. And we don’t let her open that case without all three of us standing in the room.”
> 
> She crouches, checks the receipt is still dry against the Book of Shadows, and tightens the strings of her pack. To Osric she calls over her shoulder: “Stake and rope the hole before dark. Keep the shed barred. And Hale—if anyone comes up here asking after that case, say it left with three hired hands from Beregost. Don’t tell them which road we took passed the first bend.” Then she shoulders her pack and starts after Pell, prompting Bram with a glance to bring the case and keep it between them.

## after 1 (round 11)

**Screen:**

> You look at the sealed case, then at Bram, and say plainly that you will take it: not as Maela's errand-boys, but because Osric's crew needs what was promised and because leaving it might draw someone worse up the hill before nightfall. You step close and speak low, so Osric, already heading for the lifting frame, will not hear. Before the seal is broken in Maela's shop she must answer for it, and nobody opens the case unless all three of you are in the room. You crouch, check the receipt is dry against the Book of Shadows, and tighten your pack strings. Then you call up the slope to Osric to stake and rope the hole before dark and keep the shed barred, and to say, if anyone asks, that the case left with three hired hands from Beregost, without saying which road they took past the first bend.
> 
> Bram picks the case up by its handle and holds it upright, the way it sat on the hearthstone. The wax over the hasp stays whole. He carries it on his sword side, away from the cut, with the shield back on his other arm. His mail still drips, and his steps leave dark rings in the white dust for a moment before the sun dries them.
> 
> Osric is at the lifting frame with an armful of old staging stakes. He stops when he hears you and lets you finish before he answers.
> 
> "Nobody comes up. Letters come. Coach takes the case." He shifts the stakes against his chest. "One road down. Couldn't hide which if I wanted to." He looks at the two of you in the yard, and at the track beyond. "Three from Beregost. That's all they'd get."
> 
> He starts to turn back to the frame, then stops.
> 
> "Tell Wat I'm still here."
> 
> After that he goes to work. He sets the first stake on sound ground well short of the grey crust and drives it with the flat of a sledge, and the knocks carry flat and hard across the empty yard.
> 
> Bram takes the inside of the track with the case, and you keep half a step behind his shoulder, so the case stays between you and the cut wall. You pass the hole on its far side, keeping wide of it. The planks still lie across the rotten crust, and the end of Pell's silk line still runs down over the broken lip into the dark. Past it the track drops along the lower cut. Bram studies the ground as he walks. Where the track runs over the old seam the white crust has a faint grey tinge, and twice a hollow note sounds under his boot and he steers you closer in to the rock. After that the stone under the dust goes pale and solid, and the sound goes back to plain stone.
> 
> The crew's trampled band of boot prints runs on ahead, crusted and orderly, down toward the first bend where Pell went. Behind you the sledge keeps knocking, and the barred shed sits in its smooth dust at the foot of the cut. The sun has just passed its height and stands over the road west to Beregost.
> 
> Where you are: on the track below the hole, heading down toward the first bend and the road to Beregost · Time: Day 1 · midday
> 
> The session is over.
> 
> How was the table?

**Sefa's player wrote:**

> The table ran well. It felt like a good, tense session with real choices, and the resolution at the quarry leaned on the characters’ words as much as their hands.
> 
> The warden’s quiet brought the quarry alive, and Osric felt like a man with his own worn ledger of troubles. Pell and Bram each played their parts cleanly—Pell quick-eyed and plain-spoken against the cut wall, Bram steady with the case and the rope. The collapse wasn’t a random trap; it pushed the characters toward each other, and it pulled open the deeper seam under the quarry: the writing on the sunburst block, the ember-light behind the plaster, Tobin Reed, “her orders,” a sealed case scraped from the wet walls.
> 
> I liked that no one simply grabbed the case and ran. The promises to Wat and the crew kept their weight, and Osric’s answer gave them something to carry that wasn’t in the contract. The session ended at a natural resting point, with sun past noon and the road back still long.
> 
> If the table had kept going, I’d have wanted to see what Maela Thorn says when the case is set on her counter and the seal isn’t broken without questions. But this was the right place to pause.

## after 2 (round 11)

**Screen:**

> Was there something you wanted to do and didn't?

**Sefa's player wrote:**

> I kept thinking about the ring of writing on the sunburst block. I read part of it from the lip, but the last arc was under black water, and the far side was hidden. I wanted to lean further, or send the mage hand down with light, and read the whole of it. The warning we had was enough to know it was meant to be obeyed, but not enough to know what was being kept, or why fire mattered more than anything else.
> 
> I stopped because the plaster had already answered my light once. Whatever is behind that wall noticed the healing. Setting more light on the water felt like knocking twice on a door that had not invited us. And Osric was right to be afraid. Not just of the roof, but of what made Tobin Reed lie down in four feet of water with no drink taken. Some things want you to lean in.
> 
> So I let the last words lie. But they’ll stay under my ribs until someone tells me the whole sentence.

## after 3 (round 11)

**Screen:**

> Who did you take the other two players to be?

**Sefa's player wrote:**

> Pell I took for a Lower City man who has spent a long time making sure he isn’t the one who walks into a room first. Not a coward, and not cruel — just careful with his skin and his word. He watches everything: boot prints, worn bars, which hand Osric kept near his keys. He also knows exactly how much he can promise, which is why he volunteered only to stand outside a door and hand over a paper, not to swear that Maela would write one. His player, I think, enjoys laying down a quiet thread and letting someone else pull it — the shed, the tracks, Tobin Reed’s name — and then watching the table realise what he’s already seen.
> 
> Bram I took for an old road-hand in fresh-enough gear: steady, a little formal, the sort who counts a promise by what he himself can perform. He tied the loop, copied the letter in a patient hand, wore mail into black water without a second word, and never once made the job feel like a brawl waiting to happen. His player seemed to be the table’s spine — not flashy, but fair, and good at letting other people talk louder while he kept the actual plan from tipping over.
> 
> I don’t know either of them well enough yet to call them friends. But I know I’d rather walk the road back with Pell on the outside line and Bram carrying the case than with most of the sellswords I’ve passed on the Trade Way. And I noticed both of them were careful with their promises. That matters at a table. That matters more on the road.
