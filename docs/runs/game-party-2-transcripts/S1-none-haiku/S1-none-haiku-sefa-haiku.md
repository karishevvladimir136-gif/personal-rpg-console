# S1-none-haiku — Sefa Marrin's player: Claude Haiku 5.5 (the dry run's player)

Synthetic content: invented characters in an invented campaign. Stage origin/claude/handoff at bbdee5fb (docs/stages/GAME_PARTY_2.md with its amendments of 2026-10-28 23:10 LA, 23:15 LA, 2026-10-29 18:35 LA and 18:45 LA); Mandate: issue #1; docs/POLICY.md v1. Design sha256 `e1c61ffaa6d41cf1e6a15193d7eb3b061e19b2ad11de7531aba5dba176c9ec47`.

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

> Sefa stops at the edge of the yard, a step ahead of the others, and lets her eyes go over the scene before she speaks. The abandoned hammers, the half-loaded cart with no mule, the single thread of smoke. Her hand settles on the prayer beads at her throat.
> 
> "Good morning to you," she calls, pitching her voice to carry without shouting. "We're from Maela Thorn's shop in Beregost. We've come for the sealed case she arranged with the warden here. My name is Sefa Marrin; these are my companions, Pell and Bram." She lets a small, easy smile reach her face. "Is the warden inside? We have until sunset to get the case back to Beregost, and I'd rather not spend the afternoon standing in the dust."
> 
> Under her breath, without turning her head, she says to the others: "Keep your hands where he can see them. Something emptied this place in a hurry, and I'd like to know what before we go near that door."

## player r2 (round 2)

**Screen:**

> Pell keeps close behind Bram at first and barely glances at the man in the doorway. He looks over the yard instead, and mutters that no one is working the place: the tools were dropped, not put away, so the crew either left in a hurry or was forced out. He tells you to keep your hands where the man can see them, since he wants a look at what is behind him before deciding he is only a warden. Then he moves left to a fallen wagon wheel at the edge of the lower cut, where it offers some cover, and waits.
> 
> Bram halts at the edge of the yard and holds you and Pell there. He sends Pell wide to the left behind the spoil heap to watch the terraces, and tells you to stay by him with your hands in view. He walks three slow paces forward, shield raised, sword still sheathed, and calls out to the man in the doorway. He names Maela Thorn, the apothecary in Beregost, as the one who sent you, says you have come for the sealed case of dye-salts that must reach her shop by sunset, and asks where the crew is and whether everyone is all right.
> 
> Osric does not come down the step. He watches Bram's shoulder, then your hands, then the wagon wheel where Pell has gone to ground, and only then unfolds his arms.
> 
> "Maela's," he says. It is not a question. His voice is dry from the dust, and he takes his time with each word.
> 
> Pell, at the wheel, has the yard open before him. Bram studies the ground, and says nothing yet. The mule is gone and so is the crew, and the cart stands with its traces cut loose.
> 
> "Ninety was Maela's price," Osric says. "Dye-salts, sealed, to her buyer." He turns his head toward the cart, then back. "It's a hundred and sixty now. Gold. On the step, before the lid comes off." He does not smile. "Or the case stays on the shelf, and you walk back down the track with your cart empty."
> 
> Behind him, in the dark of the house, something on a shelf catches a little light and then goes dull again. He does not look round at it.
> 
> "Crew's gone," he adds, as if it were the same business. "Don't ask me where."
> 
> Your journal, new:
> + Goal: The sealed case from Whitestone
> + Quest: The sealed case from Whitestone
> 
> Where you are: at the edge of the yard near Bram · Time: Day 1 · morning

**Sefa's player wrote:**

> Sefa keeps her hands loose and open at her sides and does not move closer to the step. She looks at Osric for a long moment, then at the cart with its cut traces, then back at his face.
> 
> "A hundred and sixty is a strange price for dye-salts that were agreed at ninety yesterday," she says evenly. "Maela doesn't haggle with her own buyers, and she doesn't send us out at dawn to be cheated at the door. So I'd like to understand what's changed since then. Has someone else been asking for this case?"
> 
> She lets her gaze drift past him to the dark doorway, just long enough to mark the shelf and the faint glint on it, then returns to his eyes.
> 
> "And the crew. You say they've gone, and you don't know where. Did they leave on their own feet, or did someone make them leave?" Her voice softens, though it does not lose its edge. "I'm not here to take anything from you, Master Osric. Whatever happened in this yard, I'd rather know it before I'm standing in the middle of it."
> 
> Under her breath, to Bram and Pell: "He's frightened, and not of us. Watch the door."

## player r3 (round 3)

**Screen:**

> You keep your hands open at your sides and stay back from the step. You tell Osric that a hundred and sixty is a strange price for salts agreed at ninety, ask whether someone else has been after the case, and ask whether the crew left on their own feet or were made to go. You say you mean to take nothing from him. Under your breath you tell Bram and Pell that Osric is frightened, though not of them, and that the door should be watched.
> 
> Bram, shield up, also holds his ground away from the doorway. In a level voice he tells Osric the price with Maela was ninety, payable on delivery and not on the step. He notes that the cart has stood two days, not since this morning's bell, and asks who has been pressing Osric for more money. He refuses to pay a hundred and sixty from his own purse and demands to see the case and its seal, promising that Maela will pay the ninety in her shop if it is what she bought. Quietly he tells you to watch the shelf rather than Osric's hands, and to get behind the wheel with Pell if Osric goes for the door.
> 
> Osric keeps his eyes on Bram's shoulder and does not say who has been asking. He says ninety was Maela's price, that he set neither figure, and that the hundred and sixty is a matter for the buyer. The crew, he says, walked out of the cut and down the track on their own feet, and nobody made them. The case is in the house, and the seal is seen only when the coin is on the step.
> 
> He looks at you for a moment, then back at the cart. Then his gaze crosses the yard to the wagon wheel, where Pell's cheek is against the iron. He tells him to come out where he can be seen or stay put, since the price is the same either way.
> 
> Pell stays where he is. Behind the house the cut narrows, and boot-prints run down toward the track in the white dust. After a while Pell lifts his head an inch above the rim and tells you and Bram quietly that two men went out dragging something, and that somebody came back up to the back door after the rest were gone.
> 
> Across the yard Osric has not moved his folded arms. His eyes have gone once to the back corner of the house, and then returned to the wheel.
> 
> Where you are: in the yard, back from the step, facing Osric · Time: Day 1 · morning

**Sefa's player wrote:**

> Sefa doesn't answer Osric's demand. She turns her head a fraction toward the wheel and keeps her voice low.
> 
> "Pell, who went to the back door? Did you see his face, or only his back?"
> 
> Then she looks at Osric again, and this time she lets her voice soften.
> 
> "Master Osric, you've been standing in that door since before we came up the track, and you haven't once looked at the case. You keep looking at the back corner of your house. Whoever came up to it after your crew left, they frightened you more than we do. I can see that plainly." She takes one slow step to the side, out of the line between him and Bram, so that he has nothing to watch but her open hands. "If someone is holding you to this price, tell me who. I'm not a Guild collector and I'm not a patriar's bailiff. I'm a hired hand with a sunset to meet. If the trouble is at your back door, I would rather stand in it with you than have you stand in it alone."
> 
> She does not reach for the dagger at her belt. Her right hand stays open, her left resting near the prayer beads at her throat. Quietly, to Bram, without moving her lips much: "If he goes for that door, don't let him take the shelf with him."

## player r4 (round 4)

**Screen:**

> You turned your head slightly toward Pell and asked him quietly who had gone to the back door, and whether he had seen the man's face or only his back. Then you spoke softly to Osric. You told him he had never looked at the case, only at the back corner of his house, and that whoever had come up to it frightened him more than you did. You stepped aside out of the line between him and Bram, kept your right hand open and your left near the prayer beads at your throat, and offered to stand with him at that door if someone was holding him to his price. You left your dagger alone. Quietly you told Bram not to let Osric take the shelf with him if he went for the door.
> 
> Pell spoke low to you and Bram. He said Osric had looked at the back corner twice and did not want you back there. He asked Bram to keep Osric talking about the ninety and the seal, and asked you to watch the shelf. He said that whoever came back up had not left with the crew, and that he was going down the stair quietly. If he was not back in the time it takes to say "ninety", you were to bring Osric out into the yard and hold him there. Pell did not wait for an answer.
> 
> Bram told Pell to stay on the wheel and not come out for Osric. He asked Osric who had dragged something out of the cut and where it went, and whether the man at the back door was one of his crew. He said the hundred and sixty was between Osric and whoever had been asking. He told Osric to open the door and show the seal, or say plainly that he would not, and then you would walk back down the track and report that to Maela. Whichever he chose, Osric would have Maela Thorn to answer to.
> 
> Osric's jaw worked on nothing for a moment. His eyes went to your open hands, then to the step under his boots, then once more to the back corner of the house.
> 
> "Nobody's holding me to anything," he said. "The price is mine. I set it."
> 
> He told Bram the man at the back door was one of his, come back for his boots, and that neither he nor the cut was your business. He came down one step off the threshold, the first time he has moved toward the yard. His hand stays on the ring of keys.
> 
> Pell is gone from the wheel. He went low and fast along the wall of the house and into the shadow behind the corner, and you can no longer see him. Osric has now come down the last step and stands at the corner with the keys in his fist, looking at the plank door at the back. He has not yet decided whether to go to it.
> 
> The question of the coin and the seal has not moved, and Osric has not yet said what he will sell for. Pell is below, out of sight. You and Bram are still in the yard with Osric. What do you do while he decides?
> 
> Where you are: the yard of the warden's house, near Osric · Time: Day 1 · morning

**Sefa's player wrote:**

> Sefa moves before Osric can settle his mind. She crosses the yard in four unhurried steps and stops at the corner of the house, placing herself between Osric and the plank door, close enough that he has to look at her to see past her.
> 
> "Master Osric, I believe you that the price is yours," she says quietly. "So let's do the sensible thing. Bring the case out here, into the light, and set it on the cart where Bram can see the seal. You don't need to open that door to do it, and nobody needs to go through it. Whatever is back there can wait for a minute."
> 
> She keeps her hands loose and visible and lets her voice stay low, almost confiding. "You're not refusing Maela. You're trying to be careful with a debt, and that I understand. Give me your word that the case is in the house, and I'll give you mine that we'll make the ninety good in her shop, with a receipt, before the coach leaves. Between the two of us, that should be enough to keep you standing on your own step."
> 
> Without looking away from Osric, she says to Bram, pitched just loud enough for him: "Keep him talking about the seal. If he takes one step toward that door, stop him by name."
> 
> She makes a Persuasion check to keep Osric in the yard, out of the back door's reach, and talking about the case instead of the price.

## player r4 card 1 (round 4)

**Screen:**

> Bram crosses the yard in two long strides and plants himself between Osric and the plank door, his shield angled to block the old warden's view of the corner of the house. His sword stays sheathed. In a low, even voice he tells Osric to stay where he can see him, to keep the keys in his hand if he likes, but to leave the other hand empty. He tells you to stay with him and watch Osric's hands and the shelf, and to call out if Osric moves for the door rather than go after him. Then, quieter and without turning his head, he speaks to Pell, asking that whatever Pell sees back there be reported before it is touched, and saying he wants Osric and the case both out in the yard, if the case is here at all. He asks Osric what he would sell the case for, to him, and whether he will show the seal before any coin comes out.
> 
> You keep your hands open and your voice low, and you speak to the man, not the door. You tell Osric you believe the price is his, and that the sensible thing is to bring the case out into the light and set it on the cart where Bram can see the seal. Nobody needs to go through that door to do it.
> 
> You wait, and watch whether his eyes go to the corner of the house.
> 
> (A roll card for Sefa Marrin, your character. Only you press it.)
> 
> [Roll card] Sefa Marrin · Skill check — Persuasion: keeping Osric in the yard, talking about the case and not the back door
> What adds to the die: +7 Persuasion
> DC 15
> Rerolls left: 2
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Sefa's player wrote:**

> Sefa presses the roll card. [Roll the die]
> 
> 
> <br>
> 
> 
> <br>

## player r4 card 1 (round 4)

**Screen:**

> (A roll card for Sefa Marrin, your character. Only you press it.)
> 
> [Roll card] Sefa Marrin · Skill check — Persuasion: keeping Osric in the yard, talking about the case and not the back door
> What adds to the die: +7 Persuasion
> DC 15
> Rerolls left: 2
> Die: 10
> 10 + 7 = 17
> Success — 17
> 
> [Onward] [Request an allowed reroll — Persuasion: keeping Osric in the yard, talking about the case and not the back door]

**Sefa's player wrote:**

> [Onward]
> 
> Sefa keeps her eyes on Osric's face and lets the question of the seal sit between them.
> 
> "Master Osric, you don't have to decide about the door yet. Tell Bram what the case looks like. Is it the cedar box Maela described, with the red wax and her mark? If it is, bring it out and we'll all look at it together, here in the sun, where nobody has to wonder what's behind them."
> 
> She does not move toward the corner of the house. She keeps her hands open and watches his eyes, and if they go back to the plank door, she says his name once, quietly.

## player r5 (round 5)

**Screen:**

> Osric's eyes come back from the corner to your face, and stay there. It costs him something; his jaw sets against it.
> 
> He says the case stays in the house until the coin is on the step. Carried out into the sun, he says, it is still the same case, and it does not become Maela's until she pays.
> 
> He turns his head toward Bram, and the keys shift in his fist. The price is a hundred and sixty, in gold. The seal shows when the coin is on the step, and not before, not for Bram and not for Maela.
> 
> He takes a slow breath, the dust catching in it. There is a letter in with the case, for Maela, he says. She reads that before anybody pays anybody.
> 
> Bram's shield stays where it is, between the warden and the plank door. Osric does not take a step toward the corner. He shifts his weight back onto the threshold, the way a man does when he means to stand where he is, and his free hand comes down flat against the doorframe, not reaching for anything.
> 
> Behind him the shelf in the dark gives back its dull glint, and he does not look round at it.
> 
> Where you are: yard by the house, near the plank door · Time: Day 1 · morning

**Sefa's player wrote:**

> Sefa lets out a slow breath and lowers her hands an inch, slowly, so he can see every finger.
> 
> "A hundred and sixty is more than my purse holds, Master Osric, and I won't pretend otherwise. But I have eighteen gold in coin, and I'll put all of it on your step now, against Maela's name, as earnest. You'll have something in your hand before the rest is settled, and I'll write Maela's promise on the back of the receipt in my own hand."
> 
> She nods toward the threshold, not the door. "And the letter. Is it sealed, or is it open for Maela to read? If it's open, let me read it here, aloud, where Bram can hear it. I read a clerk's hand as easily as a healer's, and I'll tell you honestly what it says. If it says what you think, you'll know nobody is cheating you, and you won't have to stand on that step deciding alone."
> 
> Her eyes stay on his face. When his gaze flickers toward the corner of the house, she says his name once, quietly, and waits.
> 
> Under her breath, to Bram: "Don't let him close that door on the rest of the letter."

## player r6 (round 6)

**Screen:**

> You let out a slow breath and lowered your hands an inch, fingers spread so Osric could see them. You told him a hundred and sixty was more than your purse held, but offered all eighteen gold as earnest against Maela's name, with her promise written on the receipt in your hand. You asked whether the letter was sealed or open, and offered to read it aloud. When his eyes flickered toward the corner of the house, you said his name quietly and waited. You murmured to Bram not to let Osric close the door on the rest of the letter.
> 
> Bram lowers his shield the last bit, so that Osric can see his face over the rim, and he keeps the ground between the man and the corner. He says a letter needs no coin on the step, that Osric should bring it out for Maela and let him look at the seal on the case. He keeps the terms flat: ninety on delivery at Maela's shop, the case carried there by his own hands, and whatever the buyer pays above that for Osric and Maela to settle. Then, quieter, he says Osric is frightened of that corner and of whoever has been pricing his case, that he cannot guard the house all day but will stand between Osric and that step as long as Osric is straight with him. He asks what came out of the cut.
> 
> You crouch and set eight gold pieces and a platinum piece on the threshold stone, bright against the grey chalk. "Earnest," you say, "against Maela's name."
> 
> Osric looks at the coins a long moment and does not reach for them. "Eighteen on my step is eighteen on my step. The price is a hundred and sixty." He shifts his weight back onto the sill. "Leave it where it lies. It doesn't go in my pocket until the rest does."
> 
> You ask about the letter. "Sealed. Same wax as the case," he says, his hand flat on the doorframe. "It's for Maela. She reads it first, and you don't." You ask what it says. He is silent so long that the seep drips somewhere under the yard. Then: "It says I'm finished at Whitestone."
> 
> Bram keeps his eyes on Osric's face. When Osric's gaze slides once toward the back corner, Bram doesn't turn to follow it.
> 
> "The cut," Bram says.
> 
> "Stone." Osric's jaw works. "Walls cut before there was a Beregost. A door nobody can open, and water that goes white when it's dark. The men who cut it are in Beregost, drinking on it. Ask them, if you want the rest. Don't ask me."
> 
> He comes down one more step off the threshold into the yard and stops, keys in his fist. Behind him the shelf in the dark gives back a dull glint, and he still does not look round at it.
> 
> "Stand where you like," he says to Bram. "Not at my back door. Which of you wants the case, and which of you wants to see what's in my cut?"
> 
> Your records, changed:
> Money: + 0 pp; + 0 gp; − 1 pp; − 8 gp
> 
> Where you are: On Osric's threshold, beside Bram, with her earnest coins on the step · Time: Day 1 · morning

**Sefa's player wrote:**

> Sefa stays crouched by the threshold for a moment, her hands resting on her knees, and lets the coins lie where they are. When she stands, she does it slowly, so Osric can follow every movement.
> 
> "Both, Master Osric. I want the case for Maela, and I want to know what is behind your cut, because men who walked out of a quarry on their own feet don't usually leave their hammers lying in the dust." She keeps her voice even. "Tell me one thing first. The men who went to Beregost, did they go willingly? And the one who came back up to your back door, was he sent by the same people who've been pricing your case?"
> 
> She does not look toward the corner of the house. Instead she listens, head tilted slightly, for any sound from behind the wall: a scrape, a step on loose chalk, a breath held too long. Nothing comes, and she keeps her eyes on Osric's hands.
> 
> Under her breath, to Bram: "Pell's quiet back there. I don't like quiet. Give him a count of twenty before we ask the door anything."

## player r6 card 1 (round 6)

**Screen:**

> Bram stays put with his shield and makes it plain he is not reaching for a weapon. He tells Osric that he wants the case, since that is what they were hired for and what Maela will pay for, and that the eight gold should stay where it lies. If the case carries a seal, he says, he will see it before any coin changes hands. Turning his head slightly toward the wall, he calls low to Pell and asks whether anyone is inside besides the warden, one word to answer. Then, more quietly, he presses Osric to say who hired the men to cut the quarry and who has been asking after the case. He tells Osric that anyone paying to empty his crew will come for the case too, and that he would rather be found standing in the yard than leave Osric alone with it. He keeps his shield between Osric and the corner of the house.
> 
> Osric's eyes go to the coins on the threshold and stay there a moment longer than they need to. Then they come back up to you.
> 
> "They walked," he says. "Dannic took them down the track to Beregost with their tools on their shoulders. Nobody sent them. Nobody sends a crew anywhere out here." He does not look at the corner of the house. "The one at the back door was mine. Came back for his boots. That's all he was."
> 
> Bram's question he takes more slowly. "Men come up the track asking for salt. Gold, and on the step, not on delivery. Their names aren't on my step, so you don't get them."
> 
> You keep your eyes on his face and on the hand flat against the doorframe, and you let the quiet run until he has to fill it. Before you answer, you want to know whether the boots were the whole of it.
> 
> (A roll card for Sefa Marrin, your character. Only you press it.)
> 
> [Roll card] Sefa Marrin · Skill check — Insight: reading whether Osric's story of the back-door man holds
> What adds to the die: +3 Insight
> DC 15
> Rerolls left: 2
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Sefa's player wrote:**

> Sefa presses the roll card. [Roll the die]

## player r6 card 1 (round 6)

**Screen:**

> (A roll card for Sefa Marrin, your character. Only you press it.)
> 
> [Roll card] Sefa Marrin · Skill check — Insight: reading whether Osric's story of the back-door man holds
> What adds to the die: +3 Insight
> DC 15
> Rerolls left: 2
> Die: 3
> 3 + 3 = 6
> Failure — 6
> 
> [Onward] [Request an allowed reroll — Insight: reading whether Osric's story of the back-door man holds]

**Sefa's player wrote:**

> Sefa lets the silence go on a breath longer, watching his hand on the doorframe, and cannot tell what the quiet means. He might be telling the truth. He might simply be a frightened man who has learned to say the same thing twice.
> 
> "Boots," she says. "Then bring them out, Master Osric. If one of your men came back for his boots, they'll be by the door, and you can hand them to Bram in the sunlight. That's all anybody needs to see. Nobody has to step past you."
> 
> She keeps her hands open and turns her head a fraction toward the wall. "Pell, if you can hear me, say one word. Is the back door open?"
> 
> Under her breath, to Bram, without moving her lips much: "I can't read him. He's either telling the truth or he's very well rehearsed, and I can't tell which. Don't take your shield off him yet."

## player r6 card 2 (round 6)

**Screen:**

> [Out of game] Out of game: the Insight card is still waiting, so press Onward on it and the turn goes on from the result. Your line to Bram and your question to Pell are your proposals; I will decide what Osric answers and whether anything comes from the wall once the die is read into the story.
> 
> (A roll card for Sefa Marrin, your character. Only you press it.)
> 
> [Roll card] Sefa Marrin · Skill check — Insight: reading whether Osric's story of the back-door man holds
> What adds to the die: +3 Insight
> DC 15
> Rerolls left: 2
> Die: 3
> 3 + 3 = 6
> Failure — 6
> 
> (The card waits for [Onward] or a reroll.)
> 
> [Onward] [Request an allowed reroll — Insight: reading whether Osric's story of the back-door man holds]

**Sefa's player wrote:**

> [Onward]

## player r7 (round 7)

**Screen:**

> Osric's eyes go to the coins on the threshold and stay there a moment longer than they need to. Then they come back up to you.
> 
> "They walked," he says. "Dannic took them down the track to Beregost with their tools on their shoulders. Nobody sent them. Nobody sends a crew anywhere out here." He does not look at the corner of the house. "The one at the back door was mine. Came back for his boots. That's all he was."
> 
> Bram's question comes next, and Osric takes it slower. "Men come up the track asking for salt. Gold, and on the step, not on delivery. Their names aren't on my step, so you don't get them."
> 
> You keep your eyes on his face and on the hand flat against the doorframe, and you let the quiet run until he has to fill it. You want to know whether the boots were the whole of it.
> 
> Your read comes back empty. Osric's face is a quarryman's face, shut like a wall, and the hand on the doorframe does not shift by a finger. You cannot tell whether the boots are the whole of it or only the part he has ready. Osric takes the hand from the frame, folds his arms again, and says nothing more about the back door.
> 
> "Names aren't on my step," he says to Bram, and that is the end of it.
> 
> Where you are: Osric's threshold, in the yard · Time: Day 1 · morning

**Sefa's player wrote:**

> Sefa lets the silence stand, then speaks to Osric, not the wall.
> 
> "Then we'll leave the names on your step, Master Osric, since you won't put them on the stone." She straightens, taking care that every movement is slow and visible. "But I'll tell you what I'll do with what I've heard. I'll tell Maela that her warden's crew walked off their own feet, that someone has been bidding up the case, and that you wouldn't say who. She can decide what she wants to pay for that, and whether she wants her name next to yours on any bargain."
> 
> She turns her head toward the corner of the house and raises her voice only enough to carry. "Pell. If you're down there, and it's safe, say one word. Is the back door open?"
> 
> Then, to Bram, low: "I won't take the case without its seal. But I'd like the eight gold back in my purse before we leave here. Don't argue with me about it."

## after 1 (round 7)

**Screen:**

> Bram kept his shield angled across the gap and did not turn toward the corner. He counted under his breath, and at twenty he called low and flat for Pell to answer. Then he waited, watching Osric's hands and not the wall. Quietly he asked Osric about Dannic, the foreman who led the crew along the track to Beregost: was he the man funding the salts, or the one who had betrayed Osric's name to whoever is putting a price on the case? Bram leaned onto his front foot, ready to move, while still keeping the shield positioned so that it covered the space between the warden and the rear corner. He also told you that when he says Dannic's name, you are to crouch behind the wheel where Pell had been and not circle the house, and that he'll go to the corner himself if need be.
> 
> Osric's eyes came off the corner when Bram said the foreman's name, and went to Bram's face and stayed there.
> 
> "Dannic walks where I send him," he says. "He took the crew down the track. What he says in Beregost is his own business, and what anyone pays him is not mine to count." He shifts his weight on the sill. "I don't sell my men. I sell salt."
> 
> Your voice carries to the corner. Nothing answers from the stair. The seep drips somewhere under the yard, and the shadow inside the plank door stays a shadow.
> 
> Osric's jaw tightens at the call for Pell, and his gaze slides once toward the back of the house before he drags it back to you.
> 
> "Tell her," he says to you, flat. "Tell Maela the warden's crew walked, and that the price is a hundred and sixty. She can read the rest in the letter." He does not look at the threshold stone, where the eight gold and the platinum piece lie in the sun. "The coin stays where it lies until the rest is on the step. You can argue with Bram about that. I won't."
> 
> He settles his folded arms again, and the keys at his belt make a small dry sound against his apron.
> 
> Nothing else comes up from the cellar. The yard holds its breath, and the sun has moved a finger's width along the spoil heaps.
> 
> Where you are: salt yard before the warden's house, near the threshold stone, facing Osric · Time: Day 1 · morning
> 
> The session is over.
> 
> How was the table?

**Sefa's player wrote:**

> It was a good table. The scene had real tension without tipping into a fight, and Osric felt like a frightened man with his own reasons rather than a villain waiting to be unmasked. The pressure on the back door and the silence from Pell kept the stakes up.
> 
> A few things I'd like to see next time:
> 
> - **Pell's silence.** My questions to him went unanswered for several rounds. I understand why, since he was out of sight and had his own plan, but a short line from him on the next turn would help me know where he is.
> - **The coins.** Sefa's eight gold is still on the threshold. I'd like to know whether Osric or Bram takes it back, because it matters to Sefa's purse.
> - **The Insight failure.** I'm fine with a failed read. It left me uncertain about Osric's story, which suits the scene. I'd just like the next clue about the back-door man to come from somewhere, even if it's a bad one.
> 
> Thanks to Bram's player too. His careful positioning gave us room to talk without anyone getting hurt.

## after 2 (round 7)

**Screen:**

> Was there something you wanted to do and didn't?

**Sefa's player wrote:**

> Yes. Sefa had a few options I kept talking myself out of.
> 
> The big one was the dark house. The shelf keeps catching light, and I never tried to see what was on it. Light, Thaumaturgy, or Mage Hand could have done that without anyone walking into the doorway. Mage Hand could also have taken the sealed letter off Osric's hands, or at least let me see the wax without Osric putting his hand over it. I wanted to, but Osric was standing right there, and I didn't want to push him toward the door.
> 
> I also wanted to use Eyes of the Rune Keeper on the seal and the letter. It seemed like the most direct way to test Osric's story about the case, since Sefa can read any writing. Using it would have shown whether the seal matched Maela's mark, which would have been a more useful check than the Insight roll.
> 
> Last, I'd have liked to tell Bram to hold Osric's gaze while I quietly cast Guidance on him before the Insight check. It probably wouldn't have changed the result much, but it would have shown Sefa actively working to read the man instead of only waiting for a sign.

## after 3 (round 7)

**Screen:**

> Who did you take the other two players to be?

**Sefa's player wrote:**

> I took them to be the players of Pell Dunmore and Bram Halloway, the two characters hired alongside Sefa for the Whitestone job. I knew nothing about them beyond what they wrote at the table: Pell went quietly behind the house, and Bram held the shield between Osric and the corner. I read those as their characters' choices and responded to them. I didn't know anything about who they were outside the game.
