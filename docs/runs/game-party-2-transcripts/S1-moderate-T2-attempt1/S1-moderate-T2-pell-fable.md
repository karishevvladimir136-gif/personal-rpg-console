# S1-moderate-T2 — Pell Dunmore's player: Claude Fable 5.1

Synthetic content: invented characters in an invented campaign. Stage origin/claude/handoff at bbdee5fb (docs/stages/GAME_PARTY_2.md with its amendments of 2026-10-28 23:10 LA, 23:15 LA, 2026-10-29 18:35 LA and 18:45 LA); Mandate: issue #1; docs/POLICY.md v1. Design sha256 `ba4e78d0f9b25e65f2c91ff2993bbc086d663ebc0fe566fa6889b187a2f06046`.

Arm **S1-moderate** (Beregost — the Whitestone case; moderate (one resource)); the one in danger (the layer's die): Pell Dunmore. 5 round(s) of 15; ended by error (r5: the DM's turn failed (conflict)). Models: the DM: the owner's settings (Claude Opus 5.5); the relay: Claude Sonnet 5.5; the players by the seating.

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
> Where you are: at the edge of Whitestone quarry yard, facing the slate-roofed house · Time: Day 1 · morning
> 
> Round 1 — what does Pell Dunmore do?

**Pell's player wrote:**

> I slow a half-step so Bram's shield ends up a little ahead of me, and I keep my hands where the man in the apron can see them — thumbs hooked in my belt, nowhere near the sword.
> 
> Low, out of the side of my mouth, to Bram and Sefa: "Quarry's gone quiet in the middle of a working day and nobody's run for the road. Tools dropped, not packed. Either everyone got paid off and walked, or something happened and he's standing in the one door with a chimney going." A beat. "Let him talk first. I want to see if he says the word 'case' before we do."
> 
> While we cross the yard I'm not looking at him — I'm looking at everything else: the sheds, whether any door hangs open, the lifting frame, the spoil heaps for anyone lying down behind them, boot-prints in the chalk dust and which way they go, and whether there's a cart or a mule track leading out that isn't ours. Also his belt — keys, yes, but is he wearing a blade, and are his knuckles marked.
> 
> When we're a comfortable twenty feet off I stop and let Bram do the greeting, but I nod to the man, easy: "Morning, warden. Thorn's shop in Beregost sent us. Quiet day."

## player r2 (round 2)

**Screen:**

> You drop half a step back so that Bram's shield leads, and cross the yard with your thumbs hooked in your belt, eyes off the man in the doorway and on everything else. Low, you tell the others that the quiet worries you, and that you want to see whether he says the word "case" before they do. Bram murmurs that it is quiet for a working quarry. Sefa adds, just as quietly, that men only leave their hammers lying like that if they fled in a hurry or were taken.
> 
> There's nothing hidden in the yard. Nobody is lying behind the spoil heaps, and nothing moves on the lifting frame except a loose rope end turning in the breeze. Every shed door is shut but one: a low lean-to at the lip of the lower cut, its plank door standing a hand's width open. The chalk dust has kept a day of footprints. Fifteen or twenty men walked across the yard from the faces and the sheds, all heading the same way, and joined the cart track west toward Beregost. They didn't run. The prints are even and close together, the way men walk in a crowd. A mule's hoofprints go with them. Nothing came back up the road except the three of you.
> 
> The man in the doorway wears no blade. A mason's mallet hangs from a peg inside the doorframe, within easy reach. His knuckles are thick and old-scarred, with white dust worked into the creases, but there are no fresh cuts or swelling.
> 
> Twenty feet off you stop, give him an easy nod, and say good morning, warden, that Thorn's shop in Beregost sent you, and that it's a quiet day. He nods back once and says nothing.
> 
> Bram stops a few paces short of him and leaves the doorway clear. He gives his name and says Maela Thorn sent you for a sealed case of dye-salts, asks if the man is the warden, and asks whether work has stopped for the day or something is wrong. Sefa steps forward too, hands open and away from her dagger, and warmly says you come from Maela Thorn's shop on the Trade Way, that she is expecting the warden of Whitestone to hand over a sealed case, wanted by sunset, and asks if that's him.
> 
> "Osric Hale. Warden." His voice is low and flat. He looks past Bram at the cart with its empty traces. "Stopped yesterday. Noon bell. They walked." A pause. "Three weeks and not a copper from the Gate. I'd have gone with them, if it were mine to walk off."
> 
> He tips his chin at the hammers scattered by the lower cut. "Those are the house's tools. They left them where the house can find them. Carter took the mule. He was owed most."
> 
> "Case is inside," Osric says. "Sealed, the way she wanted it." He doesn't step aside. He rubs a thumb across the dust on his fingers, slowly. "Before it goes anywhere, I want to know something. Your Thorn. Has she paid for it already? And who did she pay?" His jaw works once. "Because it wasn't me. And it wasn't my lads."
> 
> Behind him the room is dim. There's a table, a cold mug, a ledger lying open under a stone, and a fire burning low in the grate.
> 
> Your journal, new:
> + Goal: The Whitestone Case
> + Quest: The Whitestone Case
> + Thread: Osric's Unpaid Wages
> 
> Where you are: quarry yard, twenty feet from the warden's doorway · Time: Day 1 · morning
> 
> Round 2 — what does Pell Dunmore do?

**Pell's player wrote:**

> I let the breath out slow. No ambush, just a man who hasn't been paid and is standing on the one thing in this quarry worth anything. I know that man. I've been that man.
> 
> "Honest answer, Osric: we don't know. She hired us yesterday evening, told us ninety gold on delivery and not a word about what she paid or to whom. Hirelings don't get shown the ledger." I nod at the open book under the stone behind him. "You've got one, though. If the Gate owes you three weeks, that's the house in Baldur's Gate that owns Whitestone, yes? Not Thorn. She's a shopkeeper buying salts. Chances are her coin went to the house, and the house kept it, same as they kept your lads' wages."
> 
> I keep my voice level, not pushing. "So here's how I see it. You can keep the case and the house sends someone less polite than us to fetch it, and you're still not paid. Or the case goes to Beregost today, and you write down what you're owed — your name, the count, the dates — on a sheet from that ledger, and I put it in Thorn's hand myself with the case. She's got a buyer's coach leaving for the Gate tonight. A merchant who wants her salts next month has a reason to lean on the house that a quarryman alone doesn't."
> 
> A beat, then plainer: "And I'll be straight — I'm not offering you our ninety. But a man who's kept the fire going and the door shut for a day after everyone walked has done the house's job for it. I'd put that on the sheet too."
> 
> While I talk, I'm watching his face — whether the anger's at us or past us, and whether there's something else under it he's not saying. And whether the hand near that mallet peg ever drifts.

## player r2 card 1 (round 2)

**Screen:**

> Bram answers first, plainly: he doesn't know. The woman who hired the three of you wants the case collected, ninety gold between you on delivery before sunset, and she said nothing about who was paid for the salts. He says he won't make up an answer just to get through the door, and that he has waited on wages himself. Then he nods at the ledger and asks Osric who owes his men, the quarry owners or Thorn, and whether anything is owing on this case or whether Osric is holding it against the missing wages.
> 
> Sefa follows, holding Osric's gaze. She says she doesn't know either, that Thorn pays only when the case is in her hands, and that she refuses to lie in order to get past him. She offers a witness: Osric can walk with you to Beregost and ask Thorn himself before the buyer's coach leaves, with all three of you there to say you saw him ask. If the quarry can't spare him, she will carry his question to Thorn in his name and bring back the answer, whatever it is. She adds that standing here till sunset gets none of you anything, and asks who should have paid him, the quarry's owner or a factor in the Gate.
> 
> Then you speak: you tell Osric you don't know, point out the open ledger, and lay out your reading of the Gate house, Thorn's coin and the unpaid wages. You propose that the case go to Beregost today, that he write down what he's owed on a sheet from the ledger, and that you put it in Thorn's hand yourself. You say plainly that you aren't offering him your ninety, but that you'd put his keeping the fire going and the door shut on the sheet too.
> 
> Osric hears all three of you out without moving. When Bram says he won't make up an answer, the warden's jaw loosens a little. When Sefa says the same in different words, he looks at her again, longer this time. While you talk, you watch his hands. They stay folded, and the right one never goes near the mallet on its peg.
> 
> You are also watching what's under the anger.
> 
> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Insight: reading what sits under Osric's anger while he talks money
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
> [Roll card] Pell Dunmore · Skill check — Insight: reading what sits under Osric's anger while he talks money
> What adds to the die: +4 Insight
> DC 15
> Rerolls left: 2
> Die: 8
> 8 + 4 = 12
> Failure — 12
> 
> [Onward] [Request an allowed reroll — Insight: reading what sits under Osric's anger while he talks money]

**Pell's player wrote:**

> [Onward]

## player r3 (round 3)

**Screen:**

> Osric's anger goes past the three of you, west toward the road and the Gate beyond it. Whatever else he is carrying, he keeps behind his face, and you get no further than the grievance. You see that much clearly: it's three weeks old and it isn't aimed at you.
> 
> "Vandarren," Osric says, answering Bram. "House Vandarren. They own Whitestone on paper. Their factor in the Gate takes the sales, and the wages are supposed to come back down through him." He moves his head slightly toward the ledger. "Four letters I've sent him. Nothing came back. No coin, no reply." He looks at Bram. "Nothing's owing on the case from me. Salt's cut, sealed, ready. The price is the house's business, and I don't see it. I'm holding it because it's the only thing at Whitestone anyone wants. That's all."
> 
> He turns to Sefa. "Can't walk to Beregost with you. If I leave the gate the house says I abandoned the quarry, and then there's no wages for anybody, ever." He takes that in for a moment, then gives a short nod. "You put the question to her in my name, though. That I'll take."
> 
> When you mention someone less polite coming for the case, Osric's mouth goes tight. He doesn't argue it. Then you mention the sheet, and the warden takes his weight off the doorframe for the first time since you came up the track.
> 
> "Written down," he says. "Aye. A thing written down goes further than me shouting at a coach." He looks at you a moment. "Fifteen men and a carter. Twenty-one days. Plus what I'm owed, if you'll put it on." He doesn't say thank you.
> 
> Then he steps out of the door and leaves it open behind him.
> 
> He goes in to the table. He lifts the stone off the open ledger, turns to the back, and draws a stub of charcoal from his apron. From the doorway the room is plainer now. There's a cot against the far wall with the blanket still folded square, and a shelf above the grate. On the shelf sits a squat box of dark wood about a foot and a half long, bound at the corners with iron, with three blobs of red wax pressed over the clasp and cord. Osric sits down heavily in front of the ledger. He doesn't write fast. His lips move with the names as he puts them down one under another, the charcoal scratching. Outside, the loose rope end on the lifting frame turns slowly in the wind, and a little chalk dust lifts off the yard and settles again.
> 
> Your journal, new:
> + Promise: Osric's Question and Claim
> 
> Where you are: Doorway of the warden's hut at Whitestone quarry, with Osric inside writing · Time: Day 1 · morning
> 
> Round 3 — what does Pell Dunmore do?

**Pell's player wrote:**

> I let him write. A man putting his own name down for the first time in three weeks doesn't want to be hurried, and I've learned you get a cleaner sheet from someone you don't stand over.
> 
> So I don't go to the table. I step inside far enough to be out of his light, nod at the shelf, and ask, "Mind if I look at the case? Not open it — look at it. If I'm carrying it half a day and handing it to a woman who'll check the wax before she checks my face, I want to know what the seals looked like when I took it."
> 
> If he grunts assent, I take the box down carefully, keep it where he can see my hands, and turn it in the light from the door: whose seal is on the wax, whether all three impressions match, whether the cord's been cut and re-knotted or the wax sits flat or has been lifted and pressed back. I check the hinges and the iron corners for pry marks, and I heft it — a foot and a half of dye-salt should weigh a certain way, and it should shift like salt, not clink.
> 
> While I'm doing that, lightly, so it's conversation and not interrogation: "Your factor in the Gate. He have a name? Thorn's buyer will ask, and so will I if I'm ever stood in his counting-room." A beat. "And Osric — if there's anyone else who knows that case is sitting on your shelf, I'd rather hear it now than on the road."
> 
> Then, once I've looked my fill, I set it back exactly where it was and say to Bram and Sefa, "We've got the road to think about. Sun's past the quarter already."

## player r4 (round 4)

**Screen:**

> Sefa stays in the doorway, out of the wind, and asks Osric to name the Vandarren factor in the Gate. She says she wants to know whose name she'll be watching Thorn's face on. She also says she'll carry the sheet herself and put it in Thorn's own hands. Bram stays by the door as well. He asks Osric to add the factor's name and the dates of the letters, saying they can promise only that Thorn will listen to the claim, not that she'll pay. He asks how the salts should be carried, and offers a receipt saying who collected the case and that the seals were intact.
> 
> Osric's charcoal stops at Sefa's question.
> 
> "Pryce. Haddon Pryce." He says it like a man spitting grit. "Keeps a room off the Wide, over a chandler's. Takes the house's sales, sends the wages down. Supposed to." He writes it at the top of the sheet in square, careful letters and looks at Sefa once. "Watch her face, then. I'd like to know what it does."
> 
> He turns back through the ledger past years of tallies and copies four dates under Pryce's name, one for each tenday, the last three days old. Echoing Bram, he says flatly that she'll hear it. "Aye. That's what I'm buying."
> 
> When you ask about the case, he jerks his chin at the shelf. "Look. Keep it where I can see it."
> 
> You lift it down slowly and turn it in the light from the door, with Bram leaning in beside you. The box gives you nothing to worry about. The cord goes once around the body and once through the clasp, all one piece, with no cut or re-tied knot. Three seals in red wax sit flat and clean, and the edges have never been lifted. All three carry the same small mark: a mason's square over a W. Your eye goes to the ring at Osric's belt, and among the iron keys hangs a stubby brass seal with the same square cut into its face. The iron corners have rust in their nail-heads and no fresh bright scratches. The hinges have never been pried. The box is heavier than it looks, maybe twenty-five pounds. When you tilt it, the weight inside slides a little with a dry, slow hiss like coarse salt in a sack. Nothing clinks.
> 
> Bram judges it against his pack. It's too long to go inside, but strapped on top under the flap and lashed at the cord it will ride well enough, as long as nobody runs.
> 
> "Who knows it's here?" Osric repeats your question back to himself. "My lads. The carter. Pryce, he wrote the order. Your Thorn." He thinks. "Nobody's come up the track but you three. I'd have seen."
> 
> Bram asks how to carry it, and Osric takes a moment. "Dry. Damp cakes it." The charcoal goes on scratching. "And keep it off a fire." He doesn't say why. He writes the last line, his own name under sixteen others, with *twenty-one days* beside it. He looks at Bram's offer of a receipt as if it were a strange tool he's deciding whether to trust.
> 
> "Receipt." He tears the sheet out along the stitching and pushes the ledger an inch toward the door, back pages open and blank. "Under the names, then. In the house's book. So it's on record who took it."
> 
> He lays the torn claim sheet where the case sat, puts the stone on it against the draught, and rests his flat, dusty hand beside it. You set the box back on the shelf exactly where it was. In the grate a log settles and gives off a little smoke, and outside the sun has climbed clear of the eastern lip of the cut.
> 
> Where you are: inside Osric's hut, by the shelf · Time: Day 1 · morning
> 
> Round 4 — what does Pell Dunmore do?

**Pell's player wrote:**

> I let Bram do the writing — he offered, and a fighter's hand looks more like a man who means it than mine does. When he's done I put my own name under his, plain, no flourish. Pell Dunmore. First time it's gone in anyone's book in six years that wasn't a tally against me.
> 
> Then I turn to Osric, because that last bit snagged. "Off a fire — the salts do something? If I'm standing between it and a torch some night I'd like to know whether I'm saving a shopkeeper's profit or my eyebrows."
> 
> I nod at the claim sheet under the stone. "Sefa's carrying that. Fold it twice, keep it against your skin, not in the pack — if the pack goes, the sheet shouldn't." To Bram: "Box rides on you, you're the one who won't drop it if we have to move quick. I'll take the rear on the track and keep looking behind us."
> 
> To Osric, at the door, as even as I can make it: "You'll hear what her face did. One way or another." Then I'm outside, checking the sun against the western hills, counting hours in my head, and looking down the cart track for anything that wasn't there when we came up it — because the one man in the Gate who knew to send this order is the same man who hasn't sent a copper, and that sits wrong with me.

## player r5 (round 5)

**Screen:**

> Bram takes the charcoal and writes the receipt slowly. Osric leans over and puts the date above it. The receipt records that Bram took from Osric Hale, to deliver to Maela Thorn of Beregost, a single closed wooden case, its cord uncut, with all three Whitestone wax seals unbroken and the contents not looked at. Bram signs it. You write your own name below his, plain. Osric reads both lines, reads the last one twice, and nods once.
> 
> Your question about the salts and Sefa's about the same thing get a single answer. Osric looks at the box rather than at you. It isn't a carter's rule, he says. Burn a crumb and the smoke is sweet and heavy, and it sits in your head like a long day. The low-cut lads used to come up yawning when the lamps hung close to the walls. Don't sleep near it, and don't put it near the fire you sleep by. His face says he is done with the subject.
> 
> To Sefa he is quicker about the sum. He writes the figures down the margin of the claim sheet: three silver a day a man, five for the carter, a gold for the warden. Over twenty-one days it comes to a hundred and twenty-six gold, near enough. He sets the stone back on the sheet where she can take it.
> 
> Bram lifts the case down, lashes it atop his pack with his own rope clear of the sealed cord, and tests it with a shrug. He tells Osric the claim travels with them and hopes the next knock brings his wages. Osric watches the box go out as if it were a tooth coming out.
> 
> You are already outside. The sun is well up over the eastern lip of the cut and the western hills are hard and clear, with time enough for half a day of road. You walk toward the head of the track, where the yard runs along the edge of the lower cut. Nothing is on the track but your own three sets of prints coming up and the crowd's going down.
> 
> Ten feet short of the track, the ground cracks under you with a dry, punky sound like a rotten plank. The chalk crust folds inward. Below it there's old timber and then nothing, and you go through.
> 
> You fall eight feet into black water, cold enough to knock the breath out of you. Something hard catches you on the way down, a shoulder, a hip, the edge of a ledge. It bruises and jars you but breaks nothing. Chalk, rotten beam-ends and loose stone rain down after you. A squared block as big as a cask drops past your shoulder and lands on your left leg below the knee, under the water, and pins it to the floor.
> 
> When the splashing stops you are standing, or half-standing, in water up to your chest, with your leg held fast. The cold is the deep-ground kind that goes into the bones quickly. A ragged hole of daylight hangs eight feet above, with dust still sifting through it. By that light you see a cut chamber, an old working with hand-squared walls. Here and there a pinkish-white crust on the wet stone catches the light, like frost on a cellar wall. The chamber runs back past the reach of the light, and somewhere in the dark water is trickling in. The air smells of stone and wet, and under that, faintly, of something sweet.
> 
> Your records, changed:
> Pell Dunmore: HP 26/33
> Conditions: Leg pinned under a fallen block, Chest-deep in cold water
> 
> Where you are: in a flooded old chamber under the yard, leg pinned by a stone · Time: Day 1 · morning
> 
> Round 5 — what does Pell Dunmore do?

**Pell's player wrote:**

> The first thing I do is not shout. Shouting means breathing, and the air down here is sweet, and Osric just told us what sweet means. I pull the wet collar of my shirt up over my nose and mouth and breathe through it, shallow, and I keep my head as high above the water as I can get it.
> 
> Then I shout — once, short, up at the hole: "Bram! Sefa! Hole in the yard, ten feet short of the track — I'm in water, leg's pinned. Don't come to the edge, the crust's rotten. Rope — mine's in my pack, fifty feet of silk. And Sefa, don't breathe deep down here. The salts are on the walls."
> 
> While they sort themselves out I get to work on the leg. I feel down through the water with both hands to find the shape of the block — which edge is on me, whether it's resting on a ledge or flat on the floor, if there's any rock of my own I can get under it as a lever. I'm not trying to lift twenty stone of chalk with my back. I'm looking for whether I can twist the leg out from under it sideways, boot and all, or whether the boot comes off and the leg follows.
> 
> If the block won't shift and the leg won't slide, I brace my free foot against the wall, get both hands on the top edge, and try to rock it off my shin rather than lift it — a block that dropped is a block that can roll.
> 
> And I keep one ear on the dark end of the chamber, where the water's trickling in, because I didn't like the word "flooded" and I like it less with my leg under a rock.

## player r5 card 1 (round 5)

**Screen:**

> You pull the wet collar of your shirt up over your nose and mouth and breathe through the cloth, short and shallow. Wet linen and cold stone, and under them the sweetness, faint and stale like a cellar where something once was stored. You tip your head back as far as your neck will go and shout once.
> 
> The chamber throws your voice back at you off the squared walls. Above, chalk dust drifts through the light. A moment later a loop of hemp rope slaps the water a foot from your shoulder and floats there, with the rest of it running up taut over the broken lip. Somebody up there is holding it.
> 
> Then you feel for the leg.
> 
> The water is black past your ribs, but your hands find the block. It's squared work, smooth on top, about the size of a cask. It hasn't settled flat on the floor. One corner is propped on something under the silt, so it sits tilted, with its lower edge across your shin below the knee. That edge isn't dressed like the rest. It's rough and jagged where it broke off, and when your fingers follow it down to your leg they come away sliding over cloth that's torn, and over what's under the cloth. It doesn't hurt yet, because the cold is taking care of that, but you know how a wound feels. The edge has gone into your calf, and the block's weight is what's holding it shut. Once that stone comes off, the leg will bleed hard, straight away and into cold water. You'll need a healing ready the moment it moves, a potion down your throat or a hand of light on you, or the bleeding will take you under.
> 
> Your hands find something else on the way across the top of the block. The face toward you isn't plain. There are cut lines in it, deep and regular, running out from a round boss in the middle like spokes. All around them, in a ring, are rows of small hard-cut marks, short strokes and notches, set close together like a tally.
> 
> You feel along the leg for a way to twist it out sideways. The block has it trapped at the shin and there's no slack, boot or no boot. So you do what you said you'd do. You plant your free foot against the wall behind you, get both hands over the top edge, and throw your weight into rocking it, trying to roll it off the corner it's propped on.
> 
> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Strength (Athletics), Strength +0, not proficient: rock the fallen block off his pinned leg, alone, braced against the wall
> DC 18
> Rerolls left: 2
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Pell's player wrote:**

> ? Before I roll — Pell's just learned the block is the only thing keeping his calf shut. He said he'd rock it, but that was before his hands found the wound. Can he check himself and not throw his weight in yet — instead get a potion out of his pack into his hand first, and call up for Sefa to be ready with light, so that when the stone comes off the healing's already there? If the card has to stand, I'll press it, but I'd rather Pell be the man who stops and thinks than the one who bleeds out in the dark.

## player r5 card 2 (round 5)

**Screen:**

> (The text could not be sent.)
> 
> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Strength (Athletics), Strength +0, not proficient: rock the fallen block off his pinned leg, alone, braced against the wall
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
> [Roll card] Pell Dunmore · Skill check — Strength (Athletics), Strength +0, not proficient: rock the fallen block off his pinned leg, alone, braced against the wall
> DC 18
> Rerolls left: 2
> Die: 8
> 8 = 8
> Failure — 8
> 
> [Onward] [Request an allowed reroll — Strength (Athletics), Strength +0, not proficient: rock the fallen block off his pinned leg, alone, braced against the wall]

**Pell's player wrote:**

> [Onward]

## after 1 (round 5)

**Screen:**

> Where you are: in a flooded old chamber under the yard, leg pinned by a stone · Time: Day 1 · morning
> 
> The session is over.
> 
> How was the table?

**Pell's player wrote:**

> Honest take, as the player in Pell's chair:
> 
> **What worked**
> 
> - Osric was the best thing at the table. A man standing in the one door with a chimney going, not paid in three weeks, who doesn't say thank you and reads my name in his book twice — that's a real person, and the three of us got to talk to him instead of fight him. The sheet-of-claims scene was the kind of play I sit down for.
> - The world kept its promises. "Keep it off a fire" became the sweet smell in the chamber. The footprints told a story before anyone spoke. The seal on the wax matched the brass on his key ring. None of that was wasted.
> - The three characters sounded different. Bram offering a receipt, Sefa offering to carry the question — I never had to wonder who was talking.
> - The fall was fair. I'd walked the yard, the warning signs about Vandarren and Pryce were there, and an old quarry with the crust folding under me is exactly the kind of danger the canon promised.
> 
> **What didn't**
> 
> - The out-of-game question failed to send. I pressed `?` in the one moment it mattered — Pell had just learned the block was the thing keeping his leg shut, and I wanted him to *stop* rather than heave on it. The card stood, I rolled a Strength check at +0 against DC 18 I didn't want to make, and then the session ended. The rules file says a rule never stops play for more than a sentence; here the interface stopped me from playing at all.
> - Ending the session there is rough. Pell's chest-deep in cold water, leg pinned, bleeding the moment the stone moves, with a rope floating a foot away — and the screen goes dark. If that's a cliffhanger, say so. If it was a crash, I'd want to pick up at round 5 with the chance to grab a potion first.
> - Small thing: the GM narrated my planned action ("so you do what you said you'd do") after giving me new information that should have changed it. Discovering the wound and committing to the heave in the same beat took the decision away from me. I'd rather the card come *after* I've reacted to what my hands found.
> 
> **Would I sit down again?** Yes, easily — Osric alone earns that, and I want to know whose tally marks are cut into that block, what Haddon Pryce's face does, and whether Pell gets a potion down before the stone rolls. Just let me finish the fall.

## after 2 (round 5)

**Screen:**

> Was there something you wanted to do and didn't?

**Pell's player wrote:**

> Yes — one thing, and it's the thing I tried to do with the `?`.
> 
> When my hands found the broken edge in my calf, Pell's whole plan changed in his head. He's a man who carries a satchel of potions *because he's the one who gets to people fast* — and for once the person was him. I wanted to let go of the block, work a potion out of the pack and into my fist, stopper loosened, and shout up to Sefa: "Leg's cut under the stone — when it comes off I'll bleed. Be ready with the light, or I drink on the count." Then haul on the rope with Bram pulling and the stone coming off *into* a healing instead of ahead of one.
> 
> That's the Thief's whole kit — Fast Hands, a potion in a bonus action — and it's also just who he is: the one who checks the wax before the face, the one who stops and thinks. Instead I was handed the brute-force roll at +0, which is the one thing on his sheet he's bad at, and I hadn't asked for it after what I'd learned.
> 
> Smaller ones, since you ask:
> 
> - I wanted a moment with those cut marks on the block — the spokes round the boss, the ring of tally strokes. Pell's got Investigation and a nose for a thing that's older than the quarry around it. I'd have run a thumb over them and asked Osric, from the bottom of his own hole, whether he knew what his lads had been quarrying through.
> - I wanted to hear the water at the dark end before I did anything loud. Trickling in means a level, and a level means a clock. I'd have asked for a Perception check on it.
> - And I never got to say the thing I'd been building to since the track: that the man who sent the order is the man who hasn't sent a copper, and that I'd like to walk the Beregost road with my bow strung. I said it to myself in the narration; I wanted to say it to Bram and Sefa out loud, as a plan, before we left the yard.
> 
> None of that's a complaint about the fall. It's that I fell, found out the one fact that mattered, and then wasn't allowed to be the character I'd been playing for four rounds in response to it.

## after 3 (round 5)

**Screen:**

> Who did you take the other two players to be?

**Pell's player wrote:**

> Only ever through the GM's summaries, so this is reading faces across a table where I couldn't see faces — but here's what I took them for.
> 
> **Bram's player** struck me as someone who plays the straight line and means it. Every round he did the plain, grounded thing: gave his name, said he wouldn't invent an answer to get through a door, asked *how to carry the salts*, offered a receipt. That last one told me most. A receipt isn't a heroic move; it's the move of someone who's thought about what happens the day after the adventure, when Osric has to explain to House Vandarren where the case went. I read a player who likes the world to have paperwork in it, and who's happy to let the fighter be the reliable one rather than the loud one. Not a showman. I'd want him at my back and I'd trust him to be where he said he'd be.
> 
> **Sefa's player** I took to be the one most interested in the people. She looked at Osric before she looked at the box. Her offer — "walk with us and ask Thorn yourself, we'll all say we saw you ask" — was the kind of thing you only propose if you're thinking about what the man *needs* rather than what the scene needs. And "I'd like to know what her face does" was Osric's line, but it was Sefa who asked for the factor's name so she'd have a face to watch it against. That's a player who tracks who owes what to whom and takes it personally. I'd guess she enjoys the healing less as a mechanic than as a reason to be in every room where someone's hurt.
> 
> **What I honestly don't know** is anything beyond that. I never saw a word they typed — only the GM telling me what Bram and Sefa said. The two of them sounded distinct, consistent, and more considered than tavern-hirelings usually are. So either the table had two thoughtful players, or a GM who's very good at keeping companions in character. From where Pell was standing, chest-deep in the dark with a hemp rope floating a foot from his shoulder, those two possibilities looked the same, and I'll say I didn't mind. Someone up there was holding the other end.
