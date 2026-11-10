# S3-T1 — Pell Dunmore's player: Claude Opus 5.5

Synthetic content: invented characters in an invented campaign. Stage origin/claude/handoff at bbdee5fb (docs/stages/GAME_PARTY_2.md with its amendments of 2026-10-28 23:10 LA, 23:15 LA, 2026-10-29 18:35 LA and 18:45 LA); Mandate: issue #1; docs/POLICY.md v1. Design sha256 `ba4e78d0f9b25e65f2c91ff2993bbc086d663ebc0fe566fa6889b187a2f06046`.

Arm **S3** (Beregost — the Corl warehouse; one arm (no price gradient)); the failure: the company's first decisive attempt, by the DM's die. 11 round(s) of 15; ended by error (r11: the DM's turn failed (provider)). Models: the DM: the owner's settings (Claude Opus 5.5); the relay: Claude Sonnet 5.5; the players by the seating.

Seats: Bram Halloway (fighter) — GPT-6.1 Sol; Sefa Marrin (warlock) — DeepSeek V4 Pro 0813; Pell Dunmore (rogue) — Claude Opus 5.5. The order of the round's messages turns round each round from the table's coin (2). The players are not told what the others are.

The player's system prompt: `playerSystem("S3", "pell", …)` in scripts/game-party-2/frozen.mjs, sha256 `8657f906aa9bb9f20dd8140557980108e17420ecef66284e60b4163095efa8f8`.

## player r1 (round 1)

**Screen:**

> The session begins.
> 
> The Coast Way smells of coal smoke and hot iron, and the ring of Beregost's hammers never quite stops. Ahead stands the Corl warehouse, its broad door fastened with a heavy new lock that is still bright. Two men lean beside it in the creditors' service. One is a broad, patient fellow with a cudgel at his belt. The other is thinner and keeps glancing up and down the street as if he expects someone.
> 
> You have Hesta Corl's letter of claim, which the three of you share, along with her promise of 60 gold once the iron deed box reaches her hands. Bram Halloway's chain mail and shield draw the thin guard's eye at once. Sefa Marrin's quiet bearing earns a second look from the broad one. Somewhere inside is Anvar Corl's office, and in it, if all is as Hesta says, the box. Nightfall is the deadline, and at dawn the creditors' court sits.
> 
> High on the warehouse wall, one shutter hangs a finger's width open where every other is shut fast. The broad guard pushes himself off the wall and looks the three of you over. "Warehouse is closed by order of the creditors," he says. "You've business here?"
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
> Where you are: Coast Way, before the Corl warehouse door · Time: Day 1 · night
> 
> Round 1 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell stays half a step behind Bram, hands loose and empty where the guards can see them, and lets the big man's mail do the talking for a moment. Then he pulls Hesta Corl's letter from inside his jerkin and holds it up, unfolded, without handing it over.
> 
> "We do, friend. Mistress Corl's business. Her late brother's deed box, from his office. Hers by right, and the letter says so, sealed and signed." He nods at the bright new lock. "Your masters can keep the wool, the barrels, the rats, all of it. We want one iron box, and you can watch us carry it out so nobody says we took a spoon."
> 
> While he talks, his eyes don't stay on the broad one. He's watching the thin guard: where he keeps looking down the street, what he's waiting for, whether he's nervous about *us* or about someone else. Without making a show of it, he also takes in that shutter hanging open up top, the wall beneath it, and what handholds there are.
> 
> If the broad one reaches for the letter, Pell lets him read it but keeps a finger on the corner.

## player r2 (round 2)

**Screen:**

> Bram stops a few paces short of the guards with his sword sheathed. He says Hesta Corl sent you all to fetch her brother's iron deed box, that you carry a letter of claim, and that you have no wish to carry off the wool or strip the warehouse. He asks who has the authority to let you collect it. Sefa steps forward half a pace with her hands low and empty. She says the box is Hesta Corl's by right, that the guards know it, and that you only want to take what is hers and go.
> 
> A lantern hangs on a hook by the warehouse door, and the broad guard steps into its light so you can see he means it. Down the Coast Way a few forges are still going late, red mouths in the dark, hammers ringing out of time with each other.
> 
> He looks at the letter you hold up and doesn't reach for it. His lips move over the first line, slowly, then he gives up and looks at the seal. "That's her seal, right enough. Corl. I seen it on wool bales." He turns to Bram and takes in the shield, the stance, the hand kept off the hilt. Something in his face settles. "You've walked behind wagons."
> 
> Then he answers Bram's question without hurrying. "Mr Oake. Dalmar Oake, the moneylender. He bought the dead man's paper, all of it, and he pays me to stand here. Nobody goes in. That's the whole of the order." He nods at Sefa. "You may be right that it's hers, mistress. I'm not the court. The court sits at dawn, and you can wave that letter at the magistrate there." He scratches his jaw. "And Oake's clerk came by at lamp-lighting and said it particular: nobody in the office. Not the lads, not me. So that box matters to somebody besides your mistress."
> 
> The thin one hasn't said a word yet. You see a man who hardly looks at the three of you. His eyes keep going south down the Way, toward where the street bends past a cooper's yard. When a boy's footsteps slap across the cobbles somewhere out of sight he stiffens, half turns, and sags again when nobody comes round the corner. He's wound tight, but not about you. He looks like a man waiting for somebody to arrive, and running out of patience.
> 
> "Gorm's told you," he says at last, short and flat, still looking down the street. "Oake keeps his counting-room on Smithy Row, over the chandler's. Go and bother him. He's likely abed." He shifts his weight. "And there's four more of us across the yard if you want to make a night of it."
> 
> He tips his head at the loading yard beside the warehouse. Across it, behind a low wall, stands a narrow two-storey lodging with one window lit and a shadow moving behind the shutter.
> 
> You have the wall read in the time it takes him to talk. The open shutter is about fifteen feet up, on the street face just short of the corner where the yard begins. Below it the stone runs to about head height, and above that timber framing is set between the courses, its beam-ends jutting a few inches out of the wall. A rain gutter's iron downpipe runs from the eaves to the yard corner. To you it's a staircase, if nobody is standing under it with a lantern. Right now Gorm Hadley is standing under it with a lantern.
> 
> Gorm folds his arms, not unkindly, and leans back against the doorpost beside the bright new lock.
> 
> Your journal, new:
> + Goal: Anvar Corl's iron deed box
> + Quest: Anvar Corl's iron deed box
> 
> Where you are: outside the warehouse door on the Coast Way, facing the guards · Time: Day 1 · night
> 
> Round 2 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell folds the letter and tucks it back inside his jerkin without arguing.
> 
> "Fair enough, Gorm. You're paid to stand, and you stand. Smithy Row, over the chandler's." He touches two fingers to his brow. "Sorry to keep you from your night."
> 
> As he turns away he passes close to the thin one. With his hand low at his hip, out of the lantern's light, he flicks the old Lower City sign: thumb across two knuckles, then a tap on the wrist. In the cant it means *who are you waiting on?* Anyone guild-raised would know it. Pell doesn't stop or look back. He only watches from the corner of his eye to see whether the man catches it, freezes, or looks blank.
> 
> Then he walks with Bram and Sefa back up the Coast Way, out of the lantern's reach and past the first forge's glow, and stops where the hammering covers voices.
> 
> "Two things," he says quietly. "Oake told them nobody goes in the office. Not the warehouse, the *office*. And skinny there isn't guarding the door. He's waiting for somebody to come down from the south, past the cooper's. I'd bet a silver they mean to beat us to that box tonight, or he's let them in before."
> 
> He jerks his chin back toward the warehouse. "There's an open shutter fifteen feet up, near the yard corner. Beam-ends and a downpipe to get there. I can be up and in without a sound if nobody's lantern is pointing at it. What I need is Gorm looking the other way for a few minutes, and someone watching that bend in the street so we know who turns up."
> 
> He looks between them. "Bram, he likes you. He knows you've walked behind wagons. Could you go back and talk road with him, ask about Oake or who else has been by? Sefa, could you watch the cooper's corner and whistle if anyone comes? I'll slip round the far side and come at the wall from the yard end. If the box is up there, I hand it down. If it's not, we know someone's been ahead of us."
> 
> "Unless either of you would rather wake the moneylender first. I'd rather not leave it till his clerk's had the night."

## player r3 (round 3)

**Screen:**

> You fold the letter away, tell Gorm he's paid to stand, say you'll look for Smithy Row over the chandler's, and apologize for keeping him from his night. Passing close by the thin guard, you flick the old Lower City sign low at your hip.
> 
> Before that, Bram had told Gorm about his ten years behind wagons. Gorm took it with a slow nod and said he did four, out of Nashkel, iron mostly, which doesn't run off in the night. Bram then asked Tobin, the thin one, who he expected from the south. Tobin snapped round, annoyed rather than caught, and said nobody was coming for any office, not from that way or any other, and it was his own business. He turned back to the bend without a glance at the door, the shutter or the yard. Gorm told Bram quietly to leave him be, it wasn't his day.
> 
> Sefa nodded to Gorm, said they wouldn't make a night of it, and walked off along the street, beckoning with her head.
> 
> Tobin's eyes dropped to your hand for half a heartbeat. You got the frown a man gives a stranger scratching himself, and then he was back to watching the road. He didn't freeze and he didn't answer. You know that blankness well. Whoever this man is, he wasn't raised in the Wide.
> 
> Down the Way the street bends past the cooper's yard. A forge on the near side is still working, its doors open on a red glow, two apprentices taking turns on a big piece of iron. The hammering is steady enough to cover anything said quietly. Sefa stops in the black shadow of the cooper's wall, where stacked staves and hoop-iron lean against the stone, and you join her. She speaks her piece low and you answer with yours. Neither carries back to the warehouse over the hammers.
> 
> From that corner the yard side of the Corl warehouse is in view in a way it wasn't from the door. Gorm's lantern lights the street face in a yellow fan. It reaches the open shutter but thins out short of the corner. Past that, the downpipe runs down into true dark on the yard side, where the loading yard opens behind a low wall and a pair of plank gates. Across the yard the lodging still has its one lit window. As you watch, the shadow behind that shutter passes once, stops, and passes back. Somebody over there is awake and moving about.
> 
> South of you, past the bend, the Coast Way runs empty toward the edge of town. A dog barks somewhere among the yards, and nobody comes.
> 
> Bram is still at the warehouse door with Gorm and Tobin.
> 
> Where you are: in the shadow of the cooper's yard wall · Time: Day 1 · night
> 
> Round 3 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell crouches beside Sefa in the stave-shadow and keeps his voice under the hammering.
> 
> "Bram's still at the door, and that'll do fine. Gorm's happy talking wagons. Stay here. You can see the bend and that lit window both. Anyone comes round the corner, or that lodging door opens, give one short whistle. Two if it's trouble. If I hear two, I go quiet and stay put till it passes." He tugs his hood up. "If it all goes wrong, I come down the yard side and meet you here."
> 
> Then he's gone, keeping low. He doesn't cross back through Gorm's lantern-fan. He swings wide along the dark side of the street and comes at the yard from the south end, where the light dies. He keeps to the walls and stays off the cobbles' crown.
> 
> At the plank gates he stops and puts his eye to a crack before anything else. Is there anyone in the yard, a dog, a cart, anything that would make noise? He also wants to know how much of the yard corner that lodging window actually sees.
> 
> If it's clear, he slips over the low wall where it meets the warehouse, out of the window's line if he can manage it, and goes up the downpipe, testing each bracket before he trusts it, then switching to the beam-ends to reach the shutter. He doesn't touch the shutter at first. He hangs beside the gap and listens, and looks in if there's any light to see by. He's checking for anyone already inside, a lamp, anything moving in that office.
> 
> He's in no hurry. He keeps the hooded lantern shut and his hands free.

## player r4 (round 4)

**Screen:**

> You crouch beside Sefa in the stave-shadow and keep your voice under the hammering. She had told you quietly that one person across the yard was awake, and that a call from them would finish you before you began. The shutter is no use to her, she said, but she can follow where you go. If you are seen, she would prefer them to take her for a holy woman and not a thief after coin. Then she asked how you meant to reach the shutter quietly.
> 
> You tell her to stay put and watch the bend and the lit window. One short whistle if anyone comes or the lodging door opens, two if it is trouble. You pull your hood up and go.
> 
> You don't go back through Gorm's lantern-fan. You cross to the far side of the Coast Way, where the house fronts are dark, and drift north along them in short stops and starts, like a man who belongs on a street at this hour. You come back across where Gorm's light gives out. The plank gates of the loading yard are shut on their crossbar, and you put your eye to the gap between two boards.
> 
> The yard is beaten earth with straw trodden into it, about forty feet across. There is no dog, no cart and no horse. Against the warehouse's yard wall stand its loading doors, double and barred, and beside them a stack of crates under a sheet of oiled canvas weighted at the corners with bricks. Across the yard the lodging's window throws its thin bar of light over the ground at an angle. You watch the shadow behind it pass twice, and follow where the line falls. It covers the middle of the yard and the gates. It doesn't reach the corner where the low wall meets the warehouse, because the shutter's own frame cuts the man's view short there.
> 
> You go over the low wall at that corner. The coping is cold and gritty under your hands and you make no sound. The downpipe is old iron fixed with brackets at every course. You test the first with your weight before you trust it, then the next. One gives a little, so you leave it alone and move your foot to a beam-end instead. After that you climb the timber framing from beam-end to beam-end, quick and sure as on the roofs above the Wide. Within a few breaths you are fifteen feet up, flat against the timbers beside the open shutter, with your weight on a beam-end and one hand hooked over a joist.
> 
> Down at the forge the apprentices stop. The big piece of iron goes into the trough with a long hiss and a gout of steam, and for three or four heartbeats the Coast Way is quiet. Behind the lodging shutter the shadow stops. Then the tongs ring on the anvil, the hammers start again, and the shadow moves on.
> 
> You hang beside the gap and listen. Nothing moves inside. There is no lamp and no breathing, only the slow tick of old timber cooling at night. The air through the gap smells of raw wool and lanolin, dust and cold ashes. Through a finger's width of black you can make out nothing beyond the sill. With a fingertip, without pushing, you feel that the shutter isn't loose. It is held from inside by a hook in its eye, and the hook is set short, so the shutter stands open a finger's width and no more. Someone set it like that on purpose, and you can't tell from here whether it was for air or for something else.
> 
> Below you the yard is empty. The bar of light from the lodging lies across the straw where it did before. Sefa stands in the stave-shadow at the cooper's wall, and so far no one has come round the bend.
> 
> Where you are: fifteen feet up the warehouse timbers beside the hooked-open shutter, above the loading yard · Time: Day 1 · night
> 
> Round 4 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell keeps his weight on the beam-end and works one-handed. From his tools he takes the thin hooked pick, the one for latches rather than locks, and slides it into the gap above the hook's eye. He feels along the hook's shank first. He isn't trying to lift it yet. He's checking whether anything else is tied to it or set on the sill: a thread, a bell, a cup balanced to fall. Someone left this open a finger's width on purpose, and he'd rather know why before he finds out the loud way.
> 
> If it's only the hook, he lifts it out of its eye with the pick, slowly, and catches the shutter with his fingers so it can't swing or knock. He waits for the hammers at the forge to be in full swing, opens it just wide enough to fold himself through, and slides in over the sill feet first. Then he crouches below the window and stays still for a count of twenty, listening.
> 
> Once he's in, he draws the shutter back to and sets the hook in its eye at the same short reach it had before. From the yard or the street it should look exactly as it did. If someone's coming to use this window tonight, he doesn't want them warned.
> 
> Only then does he crack the hooded lantern, a sliver of light, aimed at the floor and shielded by his body from the shutter gap. He wants to see where he is and whether the dust on the floor has fresh footprints in it. If it does, he notes which way they go and how many there are before he takes a step.

## player r4 card 1 (round 4)

**Screen:**

> You keep your weight on the beam-end and slide the thin latch-pick into the gap above the hook's eye. You lay it along the shank as lightly as a fingertip, feeling for anything that shouldn't be there.
> 
> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Investigation: feeling along the shutter hook by pick, in the dark, for a thread, a bell or a trap
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
> [Roll card] Pell Dunmore · Skill check — Investigation: feeling along the shutter hook by pick, in the dark, for a thread, a bell or a trap
> What adds to the die: +4 Investigation
> DC 15
> Rerolls left: 2
> Die: 3
> 3 + 4 = 7
> Failure — 7
> 
> [Onward] [Request an allowed reroll — Investigation: feeling along the shutter hook by pick, in the dark, for a thread, a bell or a trap]

**Pell's player wrote:**

> [Request an allowed reroll — Investigation: feeling along the shutter hook by pick, in the dark, for a thread, a bell or a trap]

## player r4 card 1 (round 4)

**Screen:**

> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Investigation: feeling along the shutter hook by pick, in the dark, for a thread, a bell or a trap
> What adds to the die: +4 Investigation
> DC 15
> Rerolls left: 1
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Pell's player wrote:**

> [Roll the die]

## player r4 card 1 (round 4)

**Screen:**

> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Investigation: feeling along the shutter hook by pick, in the dark, for a thread, a bell or a trap
> What adds to the die: +4 Investigation
> DC 15
> Rerolls left: 1
> Die: 11
> 11 + 4 = 15
> Success — 15
> 
> [Onward] [Request an allowed reroll — Investigation: feeling along the shutter hook by pick, in the dark, for a thread, a bell or a trap]

**Pell's player wrote:**

> [Onward]

## player r5 (round 5)

**Screen:**

> The pick finds it at once. A fine wire is wound twice round the shank just under the eye, drawn taut, and it runs back along the inside of the frame into the dark. It is thin and smooth, with none of the grit old iron picks up in a warehouse, so you know it is new. But you found it by laying the pick on it, and the wire is set so fine that your touch was enough. It gives by a hair, and you feel it give.
> 
> Across the yard a small bell rings in the creditors' lodging: three quick, tinny strokes, clear through the hand's breadth of open shutter. It comes in the half-breath between one hammer-fall and the next, and you hear every stroke.
> 
> The lodging shutter bangs all the way open. A man leans out with a lamp held at arm's length, his shirt untied, and he looks at the warehouse wall, not at the street. "The high one!" he shouts back into the room. "That's the high shutter! Up, the lot of you, up!" Boots hit the boards behind him. A second light comes on downstairs, then a third. Somebody swears, a door slams, and somebody else is calling for his boots. The lamp sweeps the yard in a yellow arc across the straw, the canvas over the crates and the barred loading doors. The window frame cuts the light off just short of the corner where you hang. For the moment the frame is on your side, but men with lanterns won't stay behind a window.
> 
> Out on the Coast Way, past the corner, Gorm's voice comes up slow and loud: "What's that? What's the bell?" Then the wagon's iron tyres grind, and the big cob stamps and snorts.
> 
> You are flat against the timbers fifteen feet up, one hand on a joist and one foot on a beam-end. The pick is still in the gap and the hook is still in its eye. Below you the yard is empty for a few heartbeats more. Then the lodging door bangs open onto it.
> 
> Where you are: on a beam-end fifteen feet up the warehouse wall, at the high shutter, overlooking the yard · Time: Day 1 · night
> 
> Round 5 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell doesn't think about it. He slides the pick out of the gap and leaves the hook where it is. He doesn't go in. A man inside a dark room with one window and everyone running toward it is a man in a sack.
> 
> He goes up instead. He takes the beam-ends above the shutter two at a time, then the eaves, and rolls over onto the roof on the side away from the lodging. The Wide taught him roofs before it taught him locks. He lies flat in the shadow of the ridge or behind a chimney, whichever is nearer, pulls his cloak over the pale of his hands and face, and goes still. (Cunning Action: Hide, if it needs a roll.)
> 
> From there he watches, and he takes his time doing it:
> - How many come out of the lodging, and what they carry.
> - Whether anyone heads for the loading doors with a key, which would tell him who holds keys to this place besides Gorm.
> - That wagon on the Coast Way. Who's driving it, which way it came from, and whether Tobin goes to meet it. If skinny's somebody has turned up at the moment the bell rang, Pell wants their faces.
> 
> He keeps one ear on the street for Sefa's whistle.
> 
> While he lies there, he runs his fingertips along the roof near him, feeling for loose slates, a smoke-hole or a hatch. Someone wired the shutter. That makes him think they never thought much about the roof.
> 
> He doesn't move again until the lanterns have stopped looking up.

## player r5 card 1 (round 5)

**Screen:**

> You draw the pick out of the gap in one smooth pull and leave the hook in its eye. Under the hammering, two low whistles reach you from the cooper's corner. You go up the beam-ends above the shutter, two at a time, along the timber framing to the eaves. You climb as fast as you would walk a street. Below you the lamplight crawls up the yard wall.
> 
> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Stealth (Cunning Action: Hide): get over the eaves and lie flat before the lanterns reach the corner
> What adds to the die: +9 Stealth
> DC 13
> Rerolls left: 1
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Pell's player wrote:**

> [Roll the die]

## player r5 card 1 (round 5)

**Screen:**

> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Stealth (Cunning Action: Hide): get over the eaves and lie flat before the lanterns reach the corner
> What adds to the die: +9 Stealth
> DC 13
> Rerolls left: 1
> Die: 17
> 17 + 9 = 26
> Success — 26
> 
> [Onward] [Request an allowed reroll — Stealth (Cunning Action: Hide): get over the eaves and lie flat before the lanterns reach the corner]

**Pell's player wrote:**

> [Onward]

## player r6 (round 6)

**Screen:**

> You get a hand over the eaves and roll up onto the roof on the street side, away from the lodging, without a scrape. A chimney stack stands a few feet up the slope. You slide into its shadow, pull your cloak over your hands and face, and lie still. A moment later lantern light rises over the edge of the roof below you, catches the gutter, and drops back down. Nobody on the ground has seen anything but slate and dark.
> 
> From up here the whole night lies open below you.
> 
> **The yard.** You count four lanterns, held at hip height, and four cudgels. One of the men is the one from the window, shirt still untied. The two biggest hold their lamps up to the corner and the downpipe. One of them hits the pipe with his cudgel, the way you'd poke a hedge for a fox, and it rings dully. "Nobody on it," he calls. "Bracket's sprung, look." The window man crosses straight to the barred loading doors. You watch his hands. There's no key. The doors are fastened outside with a plain drop-bar in iron staples, and he and a second man lift it out together. That's how it was fastened: a bar anyone in the yard could lift, and a bell on the shutter for anyone who didn't come through the yard. The two of them slip inside with one lantern, and the doors close. A moment later timber thuds against timber on the inside, a bar going home. Whoever has the key to the bright lock on the front, it isn't these men.
> 
> The window man's voice comes muffled through the warehouse wall under your chest: "...and somebody get the watch, Hob, go on!" The yard gate's crossbar scrapes. One man slips out through a gap and runs north up the Coast Way, past the wagon, holding his lantern high. The last man stays by the corner with his lamp turned up to the high shutter. He watches it the way a man watches a dog that has growled once.
> 
> **The street.** The wagon stands in Gorm's lantern light facing south, so it came down from the north. The carter is a heavy man in a leather hood, holding the cob's head short while it stamps. The figure beside him is small, cloaked, with the hood well forward. Gorm stands at the wheel and looks up, and the figure leans down at him. You can't hear a word over the forge, but you can read hands. A gloved hand stabs down toward the yard gates. Then it opens flat, palm down, and presses at the air twice, the way you'd tell a man to keep it quiet. Gorm shakes his head slowly and points north, after the running man. The hand closes into a fist and goes back under the cloak. You never see a face. The hood stays turned toward Gorm, never toward the yard or the roof.
> 
> **Skinny.** Tobin never goes to the wagon. He's already well past it, going hard south, nearly running, into the forge-glow and on toward the bend and the cooper's wall. He doesn't look back at the yard or the wagon. Whoever he wants, it isn't anybody in that cart.
> 
> **The roof.** You lie still and let your fingers do the looking. The slates are old and furred with soot, and some of the pegs have rotted. Two slates just above your hip lift a hair under your fingertip and settle back with the faintest grit. Lifting a run of them would take care and time, and every one would have to be set down again without a sound. The chimney beside you is cold brick that smells of old soot, the same cold ash you smelled through the shutter gap. Wherever the room under the high shutter is, this stack serves it. The flue is a plain square, too narrow for anything bigger than a cat. You find no hatch or smoke-hole within reach, and if there's a hoist door on the gable, it's on the far end, out of your sight.
> 
> Under the slates, inside the warehouse, boots cross the boards. A door opens and shuts somewhere, and a man's voice says something short that ends in a laugh. They aren't searching the office. They're standing in the dark with a lantern, waiting for the watch.
> 
> Below at the corner, the last man lowers his lamp at last and spits in the straw. He stays where he is.
> 
> Your records, changed:
> Conditions: Hidden (warehouse roof)
> 
> Where you are: on the warehouse roof, hidden in the shadow of a chimney stack on the street side · Time: Day 1 · night
> 
> Round 6 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell stays exactly where he is. Two whistles means trouble, and he promised Sefa he'd go quiet and stay put, so he does. He keeps his cheek to the cold slate and his breathing slow.
> 
> First he watches south. Tobin is running toward the bend, toward the cooper's wall where Sefa is standing. Pell follows him with his eyes the whole way. Does he go past her? Does he stop? Does he meet anyone there? Pell's hand drifts to the shortbow on his back, but he doesn't unsling it. If Tobin lays a hand on her, that changes things. Until then Pell stays a shadow by a chimney.
> 
> Second, the hooded figure. Pell fixes what he can on it: height, the cut of the cloak, how it sits, whether it gets down or stays on the wagon, and which way the wagon goes if it leaves. He doesn't need a face to know someone again. A walk and a pair of gloves will do.
> 
> Third, the inside. He shifts a hand's width toward the two loose slates by his hip and lays his ear flat against them, close to the chimney stack whose flue runs down to the room with the cold ash. He isn't lifting anything yet. He's listening: how many voices, where they're standing, whether either of them goes near the office door, and whether the laugh was about the bell or about something else. If the men inside talk about who wired the shutter, or who's coming for that office, Pell wants every word.
> 
> He doesn't touch the pegs. With the watch on its way and a man spitting in the straw below, a slate sliding off the roof would be the end of the night. If the hammers keep going and the street stays busy, he can start on the slates later. For now he lies still, watches and listens, and counts how long it takes the watch to come.

## player r6 card 1 (round 6)

**Screen:**

> You keep your cheek on the cold slate and do nothing at all. From up here the Coast Way lies under you like a map drawn in lamplight.
> 
> South. Tobin runs into the forge's red spill and out of it again, straight toward the cooper's wall. Your hand drifts to the bow on your back and stops there. Tobin goes past the stacked staves without breaking stride. He doesn't turn his head and he doesn't reach for anything. From this angle you can't see Sefa at all. The shadow by the staves is just shadow, which is what she wanted it to be. Tobin pulls up at the bend a few strides farther on and stands with his hands on his hips, facing south. A little later a small figure comes pelting up the pale road from the last houses with something flapping off its shoulders. It's a child, and it nearly runs into him. Tobin grabs it by both shoulders. They speak for maybe two breaths, then the child pulls free and runs back south, and Tobin goes after it flat out. Neither of them looks back. The bend is empty again, and your hand comes away from the bow.
> 
> The bench. A man has come up the street into Gorm's light. You can't hear a word, but you see the hood move the moment his head lifts toward it. It dips and turns away from the lantern toward the yard gates, which means more or less toward your roof. You can't see any face in it, only the dark mouth of the hood. Seated, the figure's head barely reaches the carter's shoulder. The cloak is long and full, good dark wool with a deep hood and no clasp showing at the throat. The gloves are dark and close-fitting, like a rider's, or a clerk's who writes outdoors. The figure sits very straight with both feet braced on the footboard, like someone who doesn't ride on wagons much and doesn't like it. One gloved hand comes up and tugs the hood an inch lower. As the leather pulls tight over the knuckles, you catch a small hard ridge under the glove at the base of the third finger. It could be a ring. The figure doesn't get down. The wagon doesn't move. Gorm has turned to face the newcomer, lantern lowered, and his stance has changed. It isn't hostile, but he isn't leaning on anything now.
> 
> Under the slates. You ease a hand's width up the slope, keeping close to the chimney stack, and lay your ear flat against the two loose slates. You sort through the noise the way you would at a keyhole: forge, horse, the hiss of the door lantern, and under all of it the warehouse.
> 
> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Perception: catching the words of the two men inside, through slate and boards and over the forge
> What adds to the die: +4 Perception
> DC 15
> Rerolls left: 1
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Pell's player wrote:**

> [Roll the die]

## player r6 card 1 (round 6)

**Screen:**

> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Perception: catching the words of the two men inside, through slate and boards and over the forge
> What adds to the die: +4 Perception
> DC 15
> Rerolls left: 1
> Die: 1
> 1 + 4 = 5
> A natural one — 5
> 
> [Onward] [Request an allowed reroll — Perception: catching the words of the two men inside, through slate and boards and over the forge]

**Pell's player wrote:**

> [Onward]

## player r7 (round 7)

**Screen:**

> Pell, you stay where you are, cheek to the slate, breathing slow, as you promised. No other character in this scene does anything you can see beyond what is described below.
> 
> You hear nothing usable through the slates. Just then the apprentices bring a fresh piece out of the fire and start on it with the big hammer. Every stroke rings up through the timbers and into the slate under your cheek, so the old roof hums with it. Two voices are down there somewhere, toward the north end of the building and well below you. You can tell there are two because one is higher than the other. You can't pick out a single word. Once, between strokes, one of them barks a laugh and the other answers with a grunt. Then the hammer comes down again and swallows both. As far as you can tell, neither voice moves. Nobody walks toward the room under the chimney.
> 
> North. The marching lights are a lot closer now. From the roof you can count them before anyone in the street could. Hob's lantern is held high at the front, and five more come behind it in a double file at the same height, all in step. Above the lanterns, points of light bob in time with the boots: spearheads, five of them, with the round shine of helmets under them. They're perhaps two hundred feet up the Coast Way and coming on at an even walk with no hurry in it, like men who already know what they'll find.
> 
> Below you at the downpipe corner, the last lodging man hears the boots too. He lifts his lamp and turns toward the street, and for the first time since he spat in the straw he isn't looking up at the high shutter.
> 
> Where you are: On the warehouse roof by the chimney stack, above the Coast Way · Time: Day 1 · night
> 
> Round 7 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell lets out a slow breath against the slate. The hammer drowned the talk, and there's no point cursing it.
> 
> When the corner man turns his lamp to the street, Pell moves. He stays below the ridge on the dark slope, hands and toes spread flat to keep his weight off any one slate, and keeps to the line of the roof-timbers where they're less likely to crack. He works along toward the far gable end, the one he couldn't see. He's looking for a hoist door, a beam for a pulley, a loft hatch, anything into the upper floor that isn't wired to a bell. He's also looking for a second way down that doesn't drop into that yard corner, in case he has to leave in a hurry.
> 
> Each time he stops, he looks back at the wagon. When the watch's spears come into Gorm's light, what does the hooded figure do? Does the hood duck, does the carter turn the cob, does anyone get down? If the wagon pulls away, Pell marks which way it goes: back north, or on south past the bend after Tobin.
> 
> If anyone in the yard starts calling for a ladder, or a lantern comes up the downpipe, he stops wherever he is, flattens into the nearest shadow, and stays there. He doesn't touch the slates. He'll make no noise until the watch has looked at its shutter, found nothing, and got bored.
> 
> He also keeps an ear on the cooper's corner, in case Sefa whistles again.

## player r7 card 1 (round 7)

**Screen:**

> You let out a slow breath against the slate. The hammer drowned the talk below, and cursing it won't help.
> 
> You wait for the corner man's lamp to swing toward the street. When it does, you move.
> 
> You keep below the ridge, where the forge glow doesn't reach and the street lanterns light only the gutter. Your hands and toes are spread wide so your weight never rests on one slate, and you feel for the timber running under each course before you lean on it. Here and there a rotted peg shifts under your fingers. You work north along the slope toward the far gable, a few feet at a time, and every few feet you stop and lie flat.
> 
> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Stealth: crossing the old slates to the far gable unheard and unseen, with the Fist's lanterns in the street below
> What adds to the die: +9 Stealth
> DC 15
> Rerolls left: 1
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Pell's player wrote:**

> [Roll the die]

## player r7 card 1 (round 7)

**Screen:**

> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Stealth: crossing the old slates to the far gable unheard and unseen, with the Fist's lanterns in the street below
> What adds to the die: +9 Stealth
> DC 15
> Rerolls left: 1
> Die: 11
> 11 + 9 = 20
> Success — 20
> 
> [Onward] [Request an allowed reroll — Stealth: crossing the old slates to the far gable unheard and unseen, with the Fist's lanterns in the street below]

**Pell's player wrote:**

> [Onward]

## player r8 (round 8)

**Screen:**

> You cross the whole roof without a sound. Halfway along a slate shifts under your left hand, and you take your weight off it before it can grate. Nobody in the street looks up, and you reach the north end with no lamp lifted toward the slates.
> 
> **On the way.** Every time you stop, you look back down at the street. The spearmen come into Gorm's light. The hood doesn't duck from them, and nobody on the bench moves. The sergeant walks straight up to the front wheel and touches his helmet to the figure on the bench, as he might to someone he's met before. The carter keeps the cob where it is. No one gets down. You see Hob throw out his arm and point south down the Coast Way toward the forge and the cooper's wall. Two spearmen leave with a lantern and walk that way, side by side, spearheads red in the forge glow. Two others plant themselves at the yard's plank gates. A fifth stays beside Bram, near enough to touch him.
> 
> At your next stop the figure on the bench has leaned down toward the sergeant and is talking. You can't hear it, but you can read the hood's angle and the stillness of the gloved hand on the bench rail. It's the patient, close talk of someone who has been told no once tonight and is now trying the man above the one who said it. Every so often the hood turns an inch toward the yard gates and the two spears standing there. The wagon doesn't leave.
> 
> You listen for the cooper's corner through all of it. No whistle comes. The two spearmen's lantern goes on toward the staves.
> 
> **The far gable.** At the north end the roof stops at a gable wall of timber and plaster. You hang your head over the edge and look.
> 
> There is a hoist. An oak beam juts about four feet out from under the peak, with an iron pulley wheel at its end and no rope on it. Below the beam, around twelve feet above the street, is the loft door it serves: two leaves of planking, shut. You lean out as far as you dare and look at where the leaves meet. Through a crack between the planks, the dark inside holds one small, sharp gleam. You turn your head so the faint street light strikes it. A thin, straight line runs from the inside of one leaf back into the black, taut, and too clean to be anything old in this building. It's another wire. Whoever wired the high shutter came up here as well, so this door is also a bell. You don't touch it.
> 
> There is a way down, though, and it isn't the yard. Against the north gable a lower building leans its shoulder on the warehouse. It's a chandler's or a sail-loft, and its roof is shingle, about eight feet below the warehouse eaves and pitched gently toward the next yard over. Past it is a run of back roofs, sheds and a dark lane between the houses, all well away from the Corl yard, the lodging and the lanterns. For a man who learned roofs before locks, it's an open road.
> 
> **Below you.** Through the slates under your chest, somewhere near this end, the two men inside are still where they were. One says something, the other answers, and the forge drowns both. Neither has moved toward the south end or the room under the cold chimney.
> 
> In the yard nobody has called for a ladder. The corner man has turned his lamp back to the high shutter and stands under it with his cudgel, looking up. Out in the street the hood is still bent toward the sergeant at the wheel, and down at the bend the two spearmen's lantern has reached the cooper's wall.
> 
> Where you are: on the warehouse roof at the north gable end, above the street · Time: Day 1 · night
> 
> Round 8 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell leaves the hoist door alone. Two wires in one night means the whole place is strung like a harp, and he isn't going to pluck it with the Fist standing in the street.
> 
> He lowers himself off the north eaves by his fingertips. He picks a spot where the chandler's roof has a rafter under it, not the middle of a run of shingles, and lets himself down the last couple of feet so he lands soft and low. Then he goes flat on the shingle, below the line of the warehouse eaves, where neither the yard nor the street can see him. Now he has a way out that doesn't pass a single lantern.
> 
> From there he edges to where he can look down the Coast Way toward the cooper's wall, and he watches the two spearmen reach Sefa. That's her game to play. A hospice novice out late is no crime, and he has the letter, not her. He wants to see how it goes: whether they bring her back to the wagon, and whether the hood turns to look at her when they do. If they march her off anywhere but the street in front of the warehouse, he'll follow over the back roofs.
> 
> He keeps track of three other things while he watches. One is whether the sergeant gives the hooded one what it's asking for, so whether the spears at the gate step aside and anyone goes into the yard with a key. Another is whether the two men inside ever walk south toward the office end. The last is how long the Fist means to stay.
> 
> Lying there, he plans the next attempt in his head. The two loose slates by the cold chimney sit right over Anvar's office. Nobody wires a roof. Once the street goes quiet and the spears have gone home, he can go back up the way he came down and lift a run of slates one at a time.
> 
> But not yet. He waits, still as the chimney, and lets the night show him who wants that box badly enough to bring a wagon for it.

## player r9 (round 9)

**Screen:**

> You leave the hoist door alone. You go back along the gable to the street-side corner of the eaves, hook your fingers over the gutter and lower yourself to full stretch. With your boots you feel for the line where the chandler's roof has a rafter under it, where the shingles sit a little higher and harder, and you drop the last couple of feet onto it. You land bent-kneed and low. The shingle flexes and holds, and the forge's hammering covers the small knock of your heels. You lie flat, the warehouse eaves an arm's length above you and the shingle still warm from the day. Down here you're below every lantern in the street, with a way out at your back.
> 
> While you hung from the gutter you heard iron tyres crunch and the big cob blow. You edge to the street side of the chandler's roof and look south down the Coast Way. The wagon is gone, and its spot in Gorm's lantern light is empty cobbles. The yard's plank gates are shut, and two spearmen stand outside them with their spear-butts in the dirt, facing the street. The warehouse hides the yard from this end, but a glow rises over its south end where there was only dark a few minutes ago. More than one lantern is burning in there. You can't see the hood or the carter, so whatever they're doing, they're doing it inside the low wall.
> 
> At the door a man stands in the lantern fan with a spearman close at his shoulder, and Gorm leans against the doorpost again. The grey-stubbled sergeant stands a little apart with his thumbs in his belt, like a man who plans to be there a while. Nobody in the street looks like leaving.
> 
> Further south, a lantern comes out of the forge's red spill, held head-high, with two spearheads beside it. A slight figure walks a step ahead of it with her hands out from her sides where they can be seen. At this distance it's Sefa by her walk. Nobody has a hand on her. They don't turn off toward the yard gates or into any side lane. They walk her straight up the middle of the street toward the door and the sergeant, and the light in the yard behind the low wall doesn't change as they pass it.
> 
> The plaster of the north gable carries something to your cheek that the slates didn't. Boots cross the warehouse floor from this end, two pairs, unhurried. They go away from you, south, until the forge swallows them. A while later a single dull wooden thud comes through the wall, far off at the other end of the building. It could be a bar being lifted, or a crate set down. You can't tell which, or which room it came from.
> 
> The hammers ring on. The two spears stand at the gate, the sergeant waits at the door, and the glow over the yard stays lit.
> 
> Your records, changed:
> Conditions: Hidden (chandler's roof)
> 
> Where you are: flat on the chandler's roof beside the warehouse's north gable, below the eaves · Time: Day 1 · night
> 
> Round 9 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell doesn't like it. The wagon is in the yard, the lanterns are lit at the south end, and two pairs of boots just walked toward the office. Whoever was told no once tonight has found someone who said yes.
> 
> He can't do anything for Sefa from a roof, and he trusts her to play the lost novice. So he goes back up. He reaches for the warehouse gutter, finds the beam-ends under the gable corner, and is over the eaves and flat on the dark street-side slope in a few breaths. Then he works south the way he came, on the same timber lines, testing each hold, past the slate that shifted last time, until he's back in the shadow of the cold chimney over the office.
> 
> There he does two things, slowly.
> 
> First, he eases up to the ridge right beside the chimney stack, so the brick breaks his outline, and puts one eye over it, just enough to look down into the yard. He wants the wagon: where it stands, whether the loading doors are open, and who is carrying what. Most of all he wants to know whether an iron box, or anything box-sized, is going onto that wagon, and whether the hood gets down to watch it or stays on the bench. If anyone looks up at the roof, he sinks back below the ridge and doesn't move.
> 
> Second, if the voices and lantern light are in the room right under him, he puts his ear back to the two loose slates by the chimney. The forge is louder at this end, but men in a small room with a lantern talk closer. Names, "Oake," "the box," "the key," anything.
> 
> He doesn't lift a slate and he doesn't go in. If the wagon is loading up to leave, he'll follow it over the back roofs and the dark lane. He wants to see where it goes, not start a fight with six Fist spears and four cudgels between him and the street.

## player r9 card 1 (round 9)

**Screen:**

> You slide back off the chandler's shingle to the gable corner and find the beam-end under the eaves by feel. You hook the gutter and haul yourself up the eight feet of timber you climbed once already tonight. Before the forge has struck ten times you are over the edge and onto the dark slates. You work south the way you came, one timber line at a time, spreading your weight and testing each hold. When you reach the slate that shifted on the way north, you step over it. The chimney stack takes shape against the sky ahead of you, black against slightly lighter black, and you settle into its shadow.
> 
> The yard is brighter now. A wash of lantern light comes up past the south eaves and turns the soot on the slates a dirty gold. To look down into the yard you will have to put your head over the ridge, into that glow.
> 
> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Stealth: looking over the ridge by the chimney into a yard full of lanterns without being seen
> What adds to the die: +9 Stealth
> DC 15
> Rerolls left: 1
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Pell's player wrote:**

> [Roll the die]

## player r9 card 1 (round 9)

**Screen:**

> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Perception: listening through the loose slates to the room under the cold chimney, over the forge
> What adds to the die: +4 Perception
> DC 15
> Rerolls left: 1
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Pell's player wrote:**

> [Roll the die]

## player r9 card 1 (round 9)

**Screen:**

> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Stealth: looking over the ridge by the chimney into a yard full of lanterns without being seen
> What adds to the die: +9 Stealth
> DC 15
> Rerolls left: 1
> Die: 16
> 16 + 9 = 25
> Success — 25
> 
> [Onward] [Request an allowed reroll — Stealth: looking over the ridge by the chimney into a yard full of lanterns without being seen] [Request an allowed reroll — Perception: listening through the loose slates to the room under the cold chimney, over the forge]

**Pell's player wrote:**

> [Onward]

## player r10 (round 10)

**Screen:**

> You bring one eye over the ridge with the brick of the stack beside your cheek, and you hold still. Nobody below looks up. The light makes them look down, at their hands and feet and the crates. To anyone in that yard the roof is a black edge above the lamps, and the chimney has just grown a little wider on one side.
> 
> **The yard.** The wagon stands close against the warehouse's loading doors with its tail to them. The doors are open wide and lantern light spills out of them. The cob has been backed in and hitched short to a ring in the wall, and the carter stands at its head with one hand on its nose. The bed is full. You count the crates the way you'd count guards on a door: three rows of three, nine in all, roped down. The springs sit so low the sideboards almost touch the wheel rims. The canvas that covered the stack is folded on the straw, the bricks beside it in a neat line. Where the crates stood there's a pale square of dry earth and nothing else.
> 
> Two lodging men stand by the tail with their cudgels stuck in their belts. They're doing nothing, and they look like they've been told to do nothing. The bench is empty. The hood isn't on the wagon or anywhere in the yard. Nobody is carrying anything iron or box-sized. Whatever is coming out of the building hasn't come out yet.
> 
> You sink back below the ridge into the stack's shadow, turn your head and lay your ear on the two loose slates.
> 
> The forge is louder at this end and rings through the old roof the way it did before. This time there's a lantern lit somewhere under you, close, and close voices carry. You catch them between the hammer-strokes.
> 
> A man's voice comes first. It's low and comfortable, with flattened Lower City vowels that you know like your own feet, the voice of the Wide. "...heavy for a little thing. Give us the light, I'll have a go at the lock, save carrying it—"
> 
> Under the voices you hear another sound, and you can't place it at first. It's small and dry, *tick... tick... tick*, like a cooling stove or a beetle in old timber. When the man says *lock* it comes faster.
> 
> The woman's voice cuts in, low and even, every vowel careful. "Don't touch the lock." There's a pause, and something scrapes on boards. The ticking falters, then stops dead, as if a hand had been laid on it. "It rides on the bench, with me. Not on the bed with the rest. And we're through the gate before anybody at the court is awake to count anything."
> 
> "Sergeant said nothing comes out."
> 
> "The sergeant has been paid to say it."
> 
> The big hammer comes down on the iron and swallows whatever the man answers. When the next gap comes, you hear two pairs of boots on boards right under you, and then the creak of a stair taking a heavy load one step at a time.
> 
> Below in the yard the carter looks round at the open loading doors and pats the cob's neck.
> 
> Your records, changed:
> Conditions: Hidden (warehouse roof, by the chimney)
> 
> Where you are: On the office roof ridge, in the shadow of the cold chimney, above the yard · Time: Day 1 · night
> 
> Round 10 — what does Pell Dunmore do?

**Pell's player wrote:**

> Pell stays where he is a moment longer. The ticking is what bothers him. A box that ticks faster when someone says *lock* isn't a deed box, or it isn't only one. And a woman who won't let it ride on the bed has her own reasons.
> 
> He rolls back to the ridge beside the chimney and puts one eye over it again. He waits for the box to come out of the loading doors. He wants to see it: how big it is, how it's carried, whether the Wide man is sweating under it. Most of all he wants the woman when she steps into the lantern light. If the hood is down, he wants her face. If it isn't, he wants her height, her walk, and that ring under the glove. He also wants to see where the box ends up on the bench and how she sits with it, at her feet or on her lap, and whether her hand is on it.
> 
> Once he's seen that, he goes. He takes the same timber lines north, quick now and careless of nothing, and drops down to the chandler's shingle. Then he goes across the back roofs, into the dark lane, and comes out onto the Coast Way well north of the lanterns. From there he walks back down the street openly, hood back, hands empty, like a man who went off to find Smithy Row and is now coming back to collect his friends.
> 
> If he can get near Bram or Sefa without the sergeant crowding him, he says it low and quick, the way you'd pass a message in the Wide:
> 
> "They've got it. It's coming out the yard on the bench, with a woman in a hood. Sergeant's been bought. And the box *ticks*. Don't let anybody pick at its lock. They're going south through the gate before dawn. Heavy wagon, nine crates, a slow cob. We don't fight six spears here. We follow, and we take it where nobody's watching."
> 
> If he can't get to them without being noticed, he doesn't force it. He drifts back south along the dark house fronts toward the cooper's bend, the way the wagon has to go, and waits there in the stave-shadow for it to roll past.

## player r10 card 1 (round 10)

**Screen:**

> You hold still in the chimney's shadow until the stair below stops creaking. Then you ease back up to the ridge, keep the brick against your cheek, and put one eye over the top.
> 
> The box comes out of the loading doors first. The Wide-voiced man has one end and a second lodger the other, and they carry it between them on a looped rope, walking short and bowed like men under real weight. It is smaller than its weight: iron, black in the lantern light, about a forearm long and a foot high. Set into the middle of its lid is a round, dull grey disc the size of a palm. Every other bit of metal in the yard throws back some light, from the cob's buckles to the wagon's tyre-iron, but the disc stays flat and grey. The Wide man is broad and thinning on top. His shirt is soaked dark between the shoulders, and when they lift the box onto the bench he blows out his cheeks and wipes both hands down his thighs.
> 
> The clerk comes out after it. From above she is the crown of a hood and the fall of a long dark cloak, nothing more. She walks with short, quick steps and her eyes on the straw, and she never looks up. At the front wheel the carter holds out a hand to help her up. She doesn't take it. She climbs on her own, slowly, a foot on the hub and then a hand on the rail, like someone who has had to learn it. She sits down hard against the rail with the box at her right hip, not at her feet. Then she lays one gloved hand flat on the lid, right over the grey disc, and leaves it there.
> 
> The carter unhitches the cob from the wall ring. You have what you came up for, and you sink below the ridge.
> 
> You go north fast, on the timber lines you have already crossed twice tonight, and step over the slate that shifted without looking down at it. Behind you the gold glow over the yard slides away from the loading doors toward the gates. You drop over the north eaves, find the rafter line on the chandler's shingle with your heels, and keep moving. You cross a shed roof and the top of a privy wall, then let yourself down into the lane, where a washing line catches at your hood and a cat watches you from a water butt. A couple of minutes later you walk out of the lane onto the Coast Way about a hundred and fifty feet north of the warehouse door, hood back, hands empty.
> 
> From here the street ahead is a ring of light with no gap in it. Gorm's lantern hangs on its hook, Hallam's is held low, and Hob's lamp is up beside them. Sergeant Tull stands in the middle with his thumbs in his belt. Bram is in the ring with Orrin's spear at his shoulder. Sefa stands at the doorpost with Hallam half a pace off her, and the young spearman behind her. Gorm stands upright beside the lock. Anyone who walks into that light is the quiet man the sergeant has been asking after, and there is no reaching Bram or Sefa without six men watching you do it.
> 
> So you don't try. You cross to the far side of the street, where the house fronts are dark and shuttered, and start south along them, unhurried.
> 
> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Stealth: slipping south along the dark house fronts, past the Fist's ring of lanterns at the warehouse door
> What adds to the die: +9 Stealth
> DC 15
> Rerolls left: 1
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Pell's player wrote:**

> [Roll the die]

## player r10 card 1 (round 10)

**Screen:**

> (A roll card for Pell Dunmore, your character. Only you press it.)
> 
> [Roll card] Pell Dunmore · Skill check — Stealth: slipping south along the dark house fronts, past the Fist's ring of lanterns at the warehouse door
> What adds to the die: +9 Stealth
> DC 15
> Rerolls left: 1
> Die: 8
> 8 + 9 = 17
> Success — 17
> 
> [Onward] [Request an allowed reroll — Stealth: slipping south along the dark house fronts, past the Fist's ring of lanterns at the warehouse door]

**Pell's player wrote:**

> [Onward]
