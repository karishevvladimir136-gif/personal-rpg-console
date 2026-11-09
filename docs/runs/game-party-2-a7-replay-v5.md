# Game party 2 — Step 1: the A7 frame fix, v5 (the second and last test), the DM alone over S1-none-T2's nine tagged rounds

Issue #1, the amendment of 2026-11-08 17:35 LA and the planner's B of 21:02 LA. Harness v5. The DM: Claude Opus 5.5 (the owner's settings) through OpenRouter, alone; the players' actions frozen (each scene's message as T2's DM received it, its header closed by the v5 reminder, as in every earlier round's message in the history). Judges: Claude Haiku 5.5 twice (effort low), a third pass on a disagreement. Cap $3.06; spent $1.901.

The v5 reminder (closing each round's header to the DM):

> Close this scene on the world as it stands: no question, offer, demand or wait put to one character, and no out-of-game note — the table asks every player what they do next.

**Verdict: 8 of 9 rounds pass (needed 8) — PASS.** No single-seat hold: 9 of 9; every action reflected: 8 of 9. P-A7 (the DM still names the seat that has not answered, without holding): rounds none.

The frame's new sentence (company.ts `COMPANY_CLOSE`):

> The round's close belongs to the table, not to you: the table itself asks every player what their character does next. So end each scene's narration on the world as it stands at that moment — never on a question, an offer, a demand or a call put to one character, never on someone waiting for one character's answer, and never with an out-of-game note of what is still open. A question or an offer put to one character inside the narration stays open into the next round, when every character acts again. A scene never waits on a character in another scene: what it needs from them arrives when they act.

Known differences from a table: the current-state JSON left out (the capture holds the table's start); a roll the DM calls answered at once by a local d20; no card is pressed.

| Round | T2 as played: waits | Replay: waits | Replay: reflected | Replay: named as open | Pass |
| --- | --- | --- | --- | --- | --- |
| 1 | Bram Halloway (reflected: all) | none | Pell yes, Bram yes, Sefa yes | — | yes |
| 2 | Sefa Marrin (reflected: all) | none | Bram yes, Sefa no, Pell yes | — | **no** |
| 5 | Pell Dunmore (reflected: all) | none | Bram yes, Sefa yes, Pell yes | — | yes |
| 6 | Bram Halloway (reflected: all) | none | Sefa yes, Bram yes, Pell yes | — | yes |
| 8 | Pell Dunmore (reflected: all) | none | Sefa yes, Bram yes, Pell yes | — | yes |
| 11 | Pell Dunmore (reflected: all) | none | Bram yes, Sefa yes, Pell yes | — | yes |
| 13 | Sefa Marrin (reflected: all) | none | Pell yes, Bram yes, Sefa yes | — | yes |
| 14 | Bram Halloway (reflected: all) | none | Bram yes, Sefa yes, Pell yes | — | yes |
| 15 | Pell Dunmore (reflected: all) | none | Sefa yes, Pell yes, Bram yes | — | yes |

## Reading (by hand)

- **Pass: 8 of 9.** No single-seat hold in any of the nine rounds (v4: 7 of 9). No out-of-game note in the 12 scenes (v4: 1; T2 as played: 10). Every action reflected in 8 of 9.
- **r2** (fail, both judges): no hold. Sefa's claim and her challenge to the warden are only echoed indirectly by his «Door's there» line; Bram's and Pell's questions are answered in full.
- **P-A7** reads on v4's count, as the planner set it at 21:02 LA: lost (7 of 9), its second half held (r1, r11). Under v5 the DM named no open question at all.
- **The tables play on v5** (the planner's B: v5 passed). The tests together cost $3.83 of their $5.

## The narrations, whole (replay)

### Round 1 — Pell Dunmore, Bram Halloway, Sefa Marrin

````text
Pell drops half a step behind as they come down the last of the track. His eyes go over the yard rather than the man. The chalk ground is packed hard and keeps little, but what it keeps is plain enough. There's no blood anywhere, and nothing was dragged. The cart's traces weren't cut: someone unbuckled them and hung them neatly over the shaft. On the lip of the lower cut, a pair of gloves lies folded on top of a wedge. A broad scuff of boots, a lot of men, leads off the yard onto the track toward the Way, the same track the three of them just walked in on, so their own feet have trodden most of it over. The shed doors stand shut, and nothing moves under the lifting frame. All that stirs is the dust.

Bram crosses the yard at an easy walk, shield low, sword in its sheath, and stops a few paces from the doorway. Sefa stays farther back with her hand raised. Her greeting carries clearly across the yard, and it lands on top of Bram's own and Pell's friendly "Morning." The man in the doorway lets all three finish. His eyes go from Bram to Pell to Sefa and back to Bram, and he looks longest at the shield.

"Hale," he says. "Osric Hale. I'm the warden."

He jerks his chin at the cart without looking at it. "Nobody stopped. They walked off. Yesterday, noon bell." The keys at his belt clink as he shifts his weight. "Three weeks and not a copper from the Gate. Hammers belong to the house. They left them for the house."

Pell's "quiet day?" earns a short breath through the nose. It isn't quite a laugh.

"The case is here." He doesn't move from the doorway. "Sealed, the way she wants it. It stays in here till somebody tells me where my men's wages went. Your Thorn woman paid somebody for that salt. It wasn't me."

He looks at them a moment longer. Then he turns and goes back inside, and he leaves the door standing open behind him. Through it they can see a scrubbed table, a kettle on the hob, and a long iron-bound box on a shelf above the hearth, with a dab of red wax on its clasp. The thin smoke still rises from the chimney into the noon-bright sky.
````

<details><summary>T2's narration of the same scene, as played</summary>

````text
Bram walks up the track in front at an easy pace, shield low. Sefa stays a few steps back between the two men. Pell drifts to one side, and his eyes go over the yard the way they'd go over a merchant's back wall.

Close up, the quarry is just as quiet. White dust lies over everything in a soft skin, and it keeps every mark made on it. Pell reads the ground near the lower cut, the shadow under the lifting frame, the stretch between the sheds and the cart.

Pell sees it well enough. Nobody was dragged off anywhere. There's no blood, no scuffle, no furrow of heels in the dust. A crowd of boot prints, a dozen men or a few more, heads down the cart track the way the three of them just came. The strides are short and even, overlapping, the tracks of men walking together and in no hurry. One set of mule hooves goes with them, led on a short line. The edges of the prints have gone soft under a night's settling dust. They were made yesterday, not this morning.

The tools aren't scattered either. Seen from this angle, the hammers by the lower cut lie in a row along a squared block, heads together. The wedges are stacked beside them and every handle points at the warden's house. The cart's traces were unbuckled, not cut. Someone laid all this out on purpose, the way you'd put a key on a table before walking out a door.

The man in the doorway lets them come. Bram stops a few paces off, Sefa's call carries across the yard, and Pell's easy question lands last. The warden looks at each of them in turn, the big one first. Up close he's in his fifties, grey-bearded, with white dust in the creases of his knuckles and his apron. The keys at his belt are old iron, a dozen of them.

"Hale. Osric Hale. I'm the warden." His voice is gravel, and he uses no more of it than he has to. He tips his chin at the cart. "They stopped for pay. Noon bell, yesterday. Three weeks of none, and they walked." He doesn't sound angry about it. "I'd have walked too, if it was my back."

Then he looks at Sefa, because she named the salts. "The case is inside. Sealed, like she wants it." He doesn't step out of the doorway. "Thorn's bought it. So she's paid someone. Not me, and not them." He nods at the empty track. "Before it leaves my house, I'll hear who she paid. And whether she knows where my men's wages went."

He waits with his arms folded, his eyes on Bram, as if the big man in mail is the one who'll answer for all three.
````
</details>

### Round 2 — Bram Halloway, Sefa Marrin, Pell Dunmore

````text
Osric listens to all three. He doesn't interrupt, and he doesn't unfold his arms until Pell has finished. Pell watches his face while he talks and reads it easily enough. Hale isn't holding the case back to bargain. His hands stay well away from the keys. His eyes keep sliding past them to the empty track. He's tired, and he has been waiting a long time for someone to come up that road who wasn't a cart.

"Nobody's keeping you," he says to Sefa, not unkindly. "Door's there. Road's there." Then, to Bram: "Wages come up from the Gate. A strongbox, first of the month, on the Beregost carter. Vandarren's box." He says the name the way a man spits out grit. "House Vandarren. Patriars. They own Whitestone, the hill, the sheds, them hammers. Not the men."

He turns his head to Pell. "Their factor writes. Writes me who the salt goes to, and that it's paid for. Paid. That's his word." His jaw works. "Never signs a name. A seal, a tower in a ring. Three letters I've sent back down. Nothing."

He's quiet a moment, looking at the cart.

"Lads are in Beregost. Drinking what they've got left, I'd think." He steps back out of the doorway at last. "In, then. I'll write it. Slow hand. You'll wait."

The house is one low room, warm from a small peat fire, with a cot, a table and a shelf of thick ledgers bound in canvas. Four letters are pinned to the wall by the hearth, each with the same pressed wax at the foot: a tower inside a ring. On the table sits the case. It's oak, about the size of a loaf, bound at the corners with iron. The lid is sealed with pitch, and a lead seal is pressed into it on a cord. Beside it lies an open tally-book with a quill across its gutter.

Osric pulls out the one chair, sits, and lays a clean sheet over the tally-book. He dips the quill and starts to write, square letters pressed hard into the paper, his lips moving a little with each word. He doesn't look up. Outside, the dust drifts slowly across the empty yard. The sun is nearly at noon, and the thread of peat smoke from the chimney leans east in a light wind.
````

<details><summary>T2's narration of the same scene, as played</summary>

````text
Osric hears all three of them out without moving. He listens to Bram first, then to Sefa's ninety gold and her "either way", then to Pell, who steps in close enough that the warden has to look at him too and not only at the mail.

Pell watches the man's face while he talks, and there's not much in it to puzzle over. Osric's hands stay folded and never go near the keys. When Sefa says *keep us here*, his jaw shifts, the look of a man told something he already knew. This isn't a man playing for leverage. He's spent three weeks writing letters, and these are the first people up the track to give him a straight answer. Once, when Pell says *the only coin on this hill*, the warden's eyes go past them toward the lower cut and come straight back. That's all.

"House Vandarren," Osric says. "Patriars, in the Gate. Whitestone's theirs on paper. Their factor's a man called Tull, in the Lower City. Coin comes up from Tull, I pay the lads. That's how it's gone for thirty years." He tips his head at the empty track. "Three weeks back it stopped coming. I wrote four times. Nothing."

He looks at Bram. "You asked who sold her the salts. Not me. I cut it, I box it, I seal it, it goes. Somebody paid for it, and that's Tull, so that's Vandarren." He breathes out through his nose. "Fourteen men, three weeks. Fifty-odd gold, and the carter's owed more than the rest. They're in Beregost now, drinking what they had left. Not taken, not run off. Walked. They'll tell anyone who stands them a round."

For a moment he doesn't say anything. Then he unfolds his arms and steps back out of the doorway.

"Come in. Case is on the table."

The house is one long room, cool after the glare. There's a hearth with a kettle on a hook, a cot, shelves of ledgers swollen with damp, and white dust everywhere, even here. On a plank table under the window sits a case about the size of a bread loaf. It's oak with iron corners, bound with waxed cord, and a disc of red wax on the knot carries Maela Thorn's mark. Beside it lie a pen, an ink-pot gone thick, and a sheet of paper with three lines on it in a big, cramped hand, two of them crossed out.

Osric stands by the table and doesn't sit. "It goes with you. And a letter goes with it, to Thorn. She'll know what her money bought, and she can ask Tull where the rest went. She's a buyer, so he'll answer her." He looks at the crossed-out lines, then at Sefa, since she spoke for the money. "I cut stone. I don't write much." He pushes the pen an inch across the plank toward her. "You write a fair hand?"

The case sits on the table between them. Nobody has touched it yet.
````
</details>

### Round 5 — Bram Halloway, Sefa Marrin

````text
Bram sets his pack down twenty feet short of the broken ground, the case still wrapped in his bedroll, and has the rope out before the dust has settled. Sefa runs a few strides and stops well back, as Osric told her, and drops to one knee with her palm flat on the white crust. Both of them call down. Their voices go into the hole and come back off wet stone.

From where they are, they can't see the bottom. The hole is a ragged black mouth in the track the size of a cart bed, its edges frayed with rotten beam-ends and hanging crust. Cold air breathes up out of it, damp and smelling of old stone. Below, water slaps against rock, and loose chalk ticks down into it from the lip a crumb at a time.

Osric comes down the yard at a heavy walk and stops beside Bram. He doesn't look at the hole for long. He looks at the ground around it, the way a man reads a wall before he cuts it.

"Solid's against the face." He points at the inner side of the track, where it hugs the wall of the cut. "A yard out from the rock you're on bedrock. Past that you're on roof." He sweeps his hand in a slow curve that takes in the hole and a wide stretch of track on either side of it. "All that's roof."

To Bram's other question he answers flatly. "Lifting frame. There's an iron pin in the rock for the guy-rope, drove in before I came. It'll hold a cart." The frame stands at the near end of the lower cut. Its guy-pin is a thumb-thick iron eye set into the bare stone about thirty feet back from the hole along the solid inner edge, rusted dark but sunk deep. Bram takes the rope there along the strip of bedrock, keeping his shoulder to the cut wall, and makes it fast. There's line to spare for a man standing back from the lip. The loop at the free end is tied and ready.

Sefa's question gets the same short answer. "There's another way. Old adit, foot of the lower cut. Bricked to the waist." Osric's jaw works. "That's the third gallery's mouth. Water inside and no light, and it's a long way round in the dark." Then he says, more to himself than to her, "Not that way."

"Boards," he says, and turns for the nearest shed. "Scaffold boards. Lay them across the solid and you can get to the edge without standing on it." He's already walking, not running, his keys knocking against his hip. A door bangs open, then comes the sound of timber being dragged across a stone floor.

At the hole the cold air keeps breathing up. Down in the dark the water keeps up its small slapping, and the rope runs taut from the iron pin along the foot of the cut wall to the loop in Bram's hand.
````

<details><summary>T2's narration of the same scene, as played</summary>

````text
Bram's voice goes down the hole: "Pell! Can you hear me?" Sefa's follows a breath later, high and steady: "Pell, answer if you can!" Dust still hangs over the hole in a slow white cloud and drifts off down the cut. Whatever answer comes up from below belongs to Pell.

Osric reaches them on the inner side of the track, against the cut face. He doesn't go any nearer the hole than they have. He stamps once with his heel, and the ground under his boot gives back a dull, solid knock, not the hollow sound the spoil made.

"Here. This side." He scuffs the white skin of dust aside with his boot, and grey rock shows underneath, smooth and old. "Living stone, from the face out about two strides. Past that it's spoil over timber, all the way round the hole. That's the ring." He nods toward the lip without stepping toward it. "Edge'll take a man lying flat. Not standing."

Bram has already put his pack down well back on the rock, with the bedroll and the case inside it. He shakes out the hempen rope and ties a bowline in one end, loose enough to go over a man's shoulders. When he looks for an anchor, Osric doesn't wait to be asked. There's an iron ring set into the face about fifteen feet uphill of the hole, rusty but leaded deep into the rock. It was a guy-point for the lifting frame, back when the frame stood here. Bram hauls on it with his weight and it doesn't give. He runs the rope through it and takes a turn round his own waist. Now the line can go over the lip without anyone standing on it.

"Other way in?" Osric looks down the cut toward the foot of the lower face. "Old adit, down the bottom. Boarded. Water's to the lintel since before my time." He shakes his head once. "That hole's your way in."

Sefa kneels on the grey rock with one hand flat on the stone. Osric looks at her when she talks about the line, the light and then the hand, and he seems to agree with the order of it.

"There's a pinch-bar in the near shed. Iron. Longer than me." He's already turning toward it. "Get him out quick. Cold sits in you down there."

He goes off across the yard at his walking pace, the same as before, but he doesn't fold his arms.

Bram stands at the anchor with the loop ready in his hand. The lip of the hole is about ten feet off across the bad ground, and he can lie flat on it or throw from where he is. Sefa kneels two strides back on the living rock. Osric is at the near shed, dragging the door open.

*(Out of game: Pell's answer, if he gives one, comes from his own scene. Bram's throw goes as soon as there's a voice to throw toward.)*
````
</details>

### Round 5 — Pell Dunmore

````text
The whistles go up the shaft of light sharp and long, and his shout goes after them. Down here the gallery takes his voice and throws it back off the wet stone in both directions, so for a moment he hears himself shouting from the dark on either side. Up above, the noise is muffled by the lip of the hole and the dust still drifting down. He can't tell what's being said over the trickle of the seep. He keeps calling every few breaths, the same words, so whoever comes can follow the sound.

The rope fights him. His fingers have gone stiff in the cold, and twice he loses the coil off his shoulder into the black water and has to feel for it. The block is set on the floor across his shin, but its far end landed on a hump of rubble from the roof, and there's a gap under it about as thick as his wrist. He feeds the silk through by touch, brings it round the end of the block and back over, and ties it off with a knot he could tie in his sleep, which is about how his hands feel now. The free end floats beside him. It's more than long enough to throw up the hole.

The beam lies across the gallery where it fell, one end in the water and the other propped on the rubble. He can't reach it from where he's pinned. He'll need a hand from above for that.

Between shouts his fingers find the carving again.

He can only work it out by touch, and slowly. In the middle there's a round raised boss about a palm across, cut proud of the face. Straight grooves run out from it on every side, a dozen or more, even and evenly spaced, like a child's drawing of the sun. Around that runs the ring he felt before, a single deep channel with a true curve, cut by someone who knew what they were doing. Outside the ring are the short marks. They aren't random. They come in groups, some of three or four strokes, some of one long stroke with short ones across it, then a gap, then another group, all the way round. It feels like a tally, or a count, or something written by men who counted for a living.

Wherever this face came from, it wasn't meant to be lying on its back in a flooded gallery under a cart track.

When he looks up at where the block fell from, the daylight shows him a square socket in the gallery wall just below the broken roof. That's where the block sat, set in edgewise like a stopper. The back of the socket isn't chalk. It's smooth and grey, flat as a plastered wall, with a crack running across it where the block's weight tore away from it.

Along the other wall the rose-white crust glitters faintly in the shaft of light. The seep keeps up its thin, steady sound somewhere in the dark. The water sits at his chest, cold as it ever was, and when he checks the stone beside him the line has crept a little higher.
````

<details><summary>T2's narration of the same scene, as played</summary>

````text
The whistles go up the shaft of light hard enough to hurt in that low stone room. Two of them, long and sharp, and the gallery throws them back at him from both directions. His voice follows them up the hole: *Bram, Sefa, the track's gone, leg's pinned, I'm not dying, don't come running.*

Answers come down almost on top of it. First his own name in Bram's voice, then Sefa's, higher and steadier, telling him to keep still. Further off is Osric's gravel, raised for once: something about the old third gallery, and *don't stand at the edge, it goes in a ring.* Then boots on stone, heavy and careful, not running. Pell keeps calling every few breaths so they have something to steer by. Each shout costs him more of the warmth in his chest.

He works between the shouts. Getting the silk rope out of the pack takes longer than it should, because the cold has already reached his fingers and they close like a fist in a mitten. The block lies wedged on rubble, and at its far end a broken slab of roof props it a hand's width off the floor. That's enough of a gap. He feeds the rope through under the water by feel, brings it back over the top and ties it off. It takes him three tries, and the knot he ends up with is one he'd be ashamed of on a roof. It holds when he hauls on it. He coils the free end over his arm, ready to throw.

Then his fingertips go back to the cut lines, slowly this time.

The ring is a true circle, about two hands across, cut clean and deep. Inside it, in the middle, is a smaller raised disc, smooth as a coin. Straight grooves run out from that disc to the ring, more than a dozen of them, evenly spaced like spokes on a wheel, or rays. Around the outside of the ring the short tallies stand in groups: three, then one, then four, then a long stroke laid crossways, then more of them. There are too many groups to count with numb fingers, and they carry on around the curve and down below where his hand can reach. These aren't scratches. A mason cut them with a chisel and meant them to last. Then he laid the stone face-down in a flooded gallery under a road.

On the side of the block away from him, where the dressed face meets the gallery wall, the stone isn't stone. When his knuckles brush it, it's softer and chalkier, like old plaster.

A hempen loop drops down the shaft of light and slaps the water a yard from his chest, with Bram's voice behind it. Above, past the ragged rim of the hole, he can see a slice of white sky and dust still drifting across it. Across the gallery the oak beam lies half in the water where it fell, too far away for him to reach.

The waterline on the stone by his ribs hasn't moved that he can see. The cold has, though. It has reached his knees and hips and settled into the leg under the block, which he can no longer feel properly.
````
</details>

### Round 6 — Sefa Marrin, Bram Halloway

````text
Bram throws from the rock. The loop sails out over the bad ground, drops through the hole and goes down into the shaft of daylight, and a moment later the line tells him it has hit water: a slap, then a slackness that floats. He pays out a few more feet so it lies easy below instead of hanging tight over the broken edge. Then he braces at the iron ring with a turn of rope round his waist and holds it there without pulling.

What has already come up the hole is enough to steer by. There were two long whistles and Pell's voice: *the track's gone, leg's pinned, I'm not dying, don't come running.* It's hoarse, and it's coming from straight below the hole.

Sefa lies flat on the grey rock. The white chunk in her hand wakes under her touch and gives a clear, steady light, as bright as a lantern and with no flame in it. The living stone runs out two strides from the face, as Osric said. After that she's on spoil. She crawls the last eight feet on her belly with her weight spread and her elbows sinking into the dust, which crunches under her like old snow. Once the crust creaks under her hip. She stops dead, and nothing else happens. She goes on more slowly. A forearm's length from the ragged rim she stretches her arm out and holds the stone over the hole.

The light drops down the shaft and shows her the whole of it.

It's a low gallery, eight feet down, flooded with black water that throws her light back in broken pieces. Old roof timbers lie half sunk, soft as bread at the broken ends. Along one wall something rose-white has grown over the stone like frost on a window, and it glitters where her light reaches it. Pell is in the middle of the wreck, in water to his chest, plastered white with chalk from hair to shoulders. Bram's loop floats a yard from him. Behind him a long squared block of dressed stone lies half under the water, angled down across the rubble to where his left leg disappears beneath it. A pale cord is already knotted round the block, and the free end is looped over Pell's arm. Across the gallery, out of his reach, one of the fallen beams lies propped half out of the water. It's dark old oak and still mostly sound.

Osric comes back across the yard at his walking pace with an iron pinch-bar on his shoulder, as long as he is tall and worn bright at the claw. He stops on the solid rock at Bram's side, out of the lit stone's reach, and looks down the line of Sefa's arm into the hole. His eyes rest on the block for a moment, longer than on Pell.

"Dressed stone." He says it flatly, to nobody in particular. Then, to both of them: "That's no trouble. One goes down with the bar, gets the claw under the low edge. One up here on that cord, pulling it over toward the high side. It rolls off him. Few minutes' work." He sets the pinch-bar down on the rock with a clank, its claw pointing at the hole. "Sun's nowhere near down. Nothing's lost but a wet boot."

He doesn't go any nearer the edge. Sefa's light hangs over the hole, Bram's rope runs taut from the iron ring to the rim and slack down into the water, and below them Pell stands in the cold with the block's cord over his arm.
````

<details><summary>T2's narration of the same scene, as played</summary>

````text
Sefa goes down flat on the grey rock and works forward on her elbows. Two strides out, the living stone ends under her and the white crust begins. She feels the difference through her stays: rock, then something that gives a hair, like a mattress over boards. It creaks once, a dry creak deep down in the timber. It holds. Osric said it would hold a body lying flat, and it does. She stops an arm's length short of the ragged rim, puts her fingers on the lump of chalk in her hand, and the Lantern's light wakes in it. It's clear and white, as bright as a hooded lantern with the shutter open. She holds it out over the drop at arm's length.

The light falls down the hole and the dark below opens up.

The gallery is lower than she'd pictured, the old roof barely a man's height above the water. The water is black and very still except round Pell. He's there, in it to the chest, soaked white with chalk on his hair and shoulders, his face pale against the dark. A coil of pale silk rope hangs over one of his arms. Bram's hempen loop floats a yard from him where it landed. Past him, a squared block of dressed stone lies under the surface. Its near edge shows as a straight pale line in the water. The rest of it is a shape, and the shape runs across where his left leg ought to be. Across the gallery an oak beam lies half-sunk, one end propped on the rubble. Along one wall something rose-white catches her light and glitters like frost on a pane.

At the far end of the block, where it meets the gallery wall, there's a seam of old grey plaster. As her light passes over it, the plaster seems to hold the light a breath longer than wet stone should. Then it's just plaster again. It could be the water throwing her light back. She's flat on her belly at the edge of a hole, and her arm is starting to shake.

Bram, back at the guy-ring, feeds out slack until the hempen line lies loose over the lip instead of drawn tight across it. He keeps the turn round his waist and doesn't pull. Now that there's light he can see down along the rope, and he can see what Pell shouted up a minute ago: *leg pinned, rope's round the block, there's a beam down here, one on the rope, one on the beam.* All of it is as the man said. The loop is there for Pell when he wants it. Nobody is going to haul a man whose leg is under a stone.

Boots come across the yard behind them, steady, and something iron scrapes on stone. Osric comes back along the cut face with the pinch-bar on his shoulder. It's black iron, longer than he is, and one end is flattened into a chisel lip. He stops on the living rock next to Bram, looks down the line, then at Sefa lying on the crust with her light held out.

"Don't haul him," he says. "Leg's under it. Pull now and you leave the leg." He shrugs the bar down off his shoulder and stands it on its foot. "Block first. Bar goes in under the near edge from the lip, lying down. His rope off the block comes up to whoever's on the ring. Bar lifts, rope rolls it. Two of you, few minutes." He looks at the light and the hole, and his voice drops. "He's been in that cold long enough."

He holds the bar out across the gap toward Bram, handle first. He doesn't step onto the crust to do it.

"You've the weight for the bar. I'll take the ring." Then, to Sefa, without turning his head: "Keep that light where it is. Can you hold it and him both talking?"

 (Out of game: none of these four needed a roll. Each was routine and safe, so each simply happens, as the turn showed or as below.)

1) Sefa's light: Light is a cantrip and always works. The chalk lump in her hand lights up, and she holds it over the hole lying flat. The crust under her creaks but holds.
2) Sefa's call: the turn left this out, and I'm sorry for that. Her voice goes down the shaft clearly: "Can you see him, Pell? Take the rope first if it reaches you. Don't try to climb until you've told us how you're lying. And answer twice for yes if you can't speak well." Pell's answer comes from his own scene.
3) Bram's loop: it was already down from last round and lies floating a yard from Pell. Bram pays out more slack, so the line lies loose over the lip and isn't pulled tight across it.
4) Bram's brace: he keeps the turn round his waist and holds the line through the guy-ring without pulling. It stays where he wants it.
````
</details>

### Round 6 — Pell Dunmore

````text
Bram's hemp is stiff and wet, and Pell's silk is slick. His fingers have gone thick with cold, and the first knot slides apart as soon as he lets go. The second time he doesn't try to be clever. He gives it a plain sheet bend with an extra turn and pulls it tight with his teeth. It holds. Now one line runs from the block, under the water, up the white shaft of light, over the rubble and across the lip. The slack lies in a loose curve on the broken spoil where he can see it.

His shouts go up after the rope. A moment later an answer comes down from further off, from the cut side of the yard. It's Osric's gravel, raised as far as it will go.

"Far side's no better. Rubble on rotten timber, same as the lip." A pause for breath. "Sound stone's the cut face. Two strides out. They're on it." Then, fainter, as if he's turned away: "Bar's coming."

Pell sets his back as far as the trapped shin lets him and puts both hands flat on the block's top edge. The stone is colder than the water. When he leans his forehead on it for that one breath, a flake of the soft stuff along the wall-side seam comes away under his temple. It drops into the water with a small, dry *tick*. It's plaster, not stone, and behind the flake there's a thumbnail of dark where there ought to be rock. Then he lifts his head and the moment is gone.

The beam lies two yards off, half-sunk, the old oak black with wet. The waterline on the stone by his ribs is where it was. The rope runs up the light, still slack, and his count hangs in the shaft with the dust.

*"One — two —"*
````

<details><summary>T2's narration of the same scene, as played</summary>

````text
Bram's hempen loop is in Pell's fist and his silk line is over his arm. His fingers have gone thick and slow, but he joins the two the only way they'll still manage: a sheet bend, pulled tight with his teeth. It isn't pretty and it holds. Now the line runs from the far end of the block, through his ugly knot, through this one, up out of the water and over the lip into the white sky. When he lets go, the rope sags back toward the hole and lies there slack, waiting for whoever is on the other end.

His shout goes up after it: *don't haul yet, take up the slack, tell me when it's taut.*

Light comes down while he's still shouting. It's white and steady, not daylight. It drops down the hole from a point just over the rim, and the gallery jumps into view around him. The low roof is barely a man's height over the water. The rose-white crust along the wall glitters like hoarfrost. The oak beam lies two yards off, one end propped on the rubble, close enough to look at and too far to reach. Sefa's voice comes down with the light. She's close, and lying flat by the sound of it. *Can you see him, Pell? Take the rope first if it reaches you. Don't try to climb until you've told us how you're lying. Answer twice for yes if you can't speak well.*

He's already told her how he's lying. He keeps going: the beam, the far side, a second line.

Osric answers him. Pell can't see him. His gravel voice comes from somewhere back from the edge, on the side toward the cut face.

"Far side's no better. Spoil over timber, all round the hole. Only sound rock is this side, two strides off the face." There's a pause, and something iron scrapes on stone up there. "No other way in. Adit's under water."

Then, louder, aimed down the hole at Pell:

"Rope runs through the ring in the face. That's uphill, toward the face, not toward the house. It pulls the way the ring lies." Another pause. "There's a pinch-bar up here. Bar under the near edge lifts it off the slab. Then the rope rolls it. Pull without the bar and you drag stone along your shin."

He stops there. He's said his piece.

Pell puts his forehead to the stone for a moment. The light from above reaches a little way through the black water, enough to make out what his fingers already know: a pale ring, the disc in its middle, the straight rays between, and the tallies running round the outside and down into the dark where the light gives out. *Sun on a wheel.* The cold seeps up from the leg he can't feel properly and into his hips.

He gets his weight back as far as the pinned shin allows and puts both hands flat on the block's upper edge.

"One — two —"

Above him the rope still lies slack over the lip. The block doesn't move, and the water by his ribs sits where it sat.

*(Out of game: whether the line comes taut, and whether anyone pulls or brings the bar in on three, is for Bram and Sefa in their own scene.)*

 (Out of game: none of the four needed a roll, and all four happen in the turn as written. Pell ties the sheet bend and it holds, his calls up the hole carry, he tells Sefa about the beam and the far side, and Osric says there's no other way in.)
````
</details>

### Round 8 — Sefa Marrin, Bram Halloway

````text
Sefa's voice goes down the shaft, low and even: *the loop's a yard to your left, under the arms, not round the leg, tell us when it's on you.* The light in her fists shakes and then steadies again. Below her, the sunburst lies just under the black water where the block rolled. Its rays are pale lines in the dark, and the finger-wide seam in the plaster at its far end still gives off its faint milky glow. She looks at it once, fixes it in her memory, and looks back at the man in the water.

Bram slides the pinch-bar back along the crust a hand's width at a time and lays it flat beside him, well clear of the rim. A little dust trickles off the edge and patters on the water below. The crust under his mail groans the same long groan as before and holds.

"Hale. Make sure we're hauling Pell's line, not the block's."

Osric's eyes go down the hemp from his forearm to the lip, and he doesn't like what he sees. "Same line." He lifts the rope a little so Bram can see it run. "Loop's knotted to his silk, and the silk's tied off round the stone. Haul that and you haul him and the block both. He casts off the silk first, or cuts it. Then it's his line." He takes back the turn he gave up and stands with his weight ready on his heels. "Slow, when he's on it. Not before."

Then Sefa asks him quietly, without turning her head, about the stone.

For a while he doesn't answer. The hemp creaks once through the ring.

"Seen the sun on it. Not that stone. That cut." He keeps his eyes on the line. "The oldest wall at the Song of the Morning, in Beregost. Low courses, by the east door. Same sun, same wheel. They say those first stones came out of here." He breathes out through his nose. "The tallies are mason's marks. Old ones. I can read a cutter's tally from my own time. Not those."

He stops there. Then, flatter: "Whatever's on it'll keep. It's kept this long."

Bram lies flat at the rim with the bar at his side and the hole in front of him. Sefa is an arm's length from the broken edge, holding the light out over it in both shaking hands. Osric stands back on the grey rock with the hemp wound round his forearm and his boots set. Below, the loop floats in the white light at Pell's chest, still tied by the ugly sheet bend to the silk that runs down to the stone. Somewhere off down the gallery the slow seep goes on trickling in the dark.
````

<details><summary>T2's narration of the same scene, as played</summary>

````text
Sefa's voice goes down the shaft, low and clear: *the loop's a yard to your left, under your arms and not round the leg, tell us when it's on you.* Bram's follows a breath later from a little further along the rim: *block's clear, can you get the loop under your arms?* The light in her hands holds steady over the black water.

Bram pulls the pinch-bar back from the hole a hand's width at a time and lays it flat on the crust beside him. The rim doesn't shed so much as a crumb. Then he looks back at the ring. "Hale, make sure we're hauling Pell's line, not the block's."

Osric already has the hemp in both fists. He looks down the length of it to the lip, then at the hole, and shakes his head once.

"Same line." He lifts the rope a little so Bram can see it run. "Ring, loop, then his knot to the silk, and the silk's round the stone. Haul now and he comes up with a block hung off him." He lets the rope settle again. "He casts the silk off down there. Knot or knife. Then it's his line."

He says it loud enough to carry down the shaft, and leaves it at that.

Then Sefa asks her question, quietly, without turning her head. Osric doesn't answer straight away. His eyes go to the rim of the hole and the white light coming up out of it, and stay there.

"Never seen it." It comes out flat. "Thirty years on this hill. Didn't know there was a face on anything down there." He shifts his grip on the hemp. "Sun's the Morninglord's. Any fool knows that much." He thinks a moment. "In Beregost they say the temple's first stones came off this hill. Before the town was a town. That's the old men talking." He tips his head toward the shaft. "Him first."

He doesn't say anything more about the stone. He hasn't looked at the sunburst again since it came up.

Down below, under Sefa's light, the block lies a quarter-turn over in the water with its face to the roof. The finger-wide seam at its far end is still dark. Deep in it the pale something still gives back her light, dimly, and doesn't fade.

The hemp lies slack over the lip, running down to the loop at Pell's chest and the ugly knot below it. Osric keeps his boots planted at the ring with his hands on the rope and doesn't take it up. Bram lies flat at the rim, ready to guide. Nobody pulls until the word comes up from below.

*(Out of game: Bram's haul waits on Pell. The knot joining the loop to the block line has to come off first, and whether and how Pell does that is his own scene.)*

 (Out of game: none of the four needed a roll, and all four happened in the turn. Holding the light is the ongoing Light cantrip. Her call to Pell went down the shaft, and his answer comes from his own scene. Marking the block's place in her mind is Sefa's own thought, so it stands as her player wrote it. Osric answered her question: he has never seen the face, the sun is the Morninglord's, and the old men say the temple's first stones came off this hill.)
````
</details>

### Round 8 — Pell Dunmore

````text
The loop goes over Pell's head and under his arms. He cinches it, and his own *one breath, Bram, hold the line* goes up the shaft before anyone can lean on it. Up at the ring the hemp creaks once and goes still.

He takes one stride on the leg that doesn't feel like his. The bottom is rubble and slick stone, and the shin flares hot under the cold with every step. He keeps a hand flat on the wall so he doesn't go under. His call for the light a hand to the left goes up with the rest. The white light lies where it lay, on the block and the black water, and it reaches the far end of the block well enough. The seam is right in front of his face: a dark split in the old grey plaster, a finger wide, at the height of his chest and a forearm above the waterline.

The dagger comes out. His fingers are thick around the grip, but a blade doesn't need fine fingers, only a steady wrist. He starts counting.

*One.* The point goes into the crack. The plaster is soft and chalky, and it crumbles at the touch like old cake. *Two, three.* An inch in, the plaster ends and the point slides into nothing. It's a hollow, a space cut into the stone behind the skin of plaster. *Four.* The point touches something.

It isn't chalk or bone, and it isn't cloth. The point skates on it the way steel skates on a window. A faint thin note runs back up the blade into his hand, the tick of steel on glass. *Five, six.* He moves the point along it and feels a curve, smooth and rounded like the belly of a jug. It doesn't rock or shift. It stands in there on something flat. Whatever it is, it's wider than the crack, and the crack is the only way out. *Seven.* Close up, the pale glow is behind it, or in it. It's the colour of milk with a lamp behind it, and it's steady. It doesn't flicker with the water the way the reflections do. Touching it with the steel changes nothing. *Eight, nine.*

It isn't coming out through a finger's width of plaster on the end of a dagger. He marks the spot instead. The seam sits in the gallery wall right where the block's far end lay before it rolled. When the wheel was face-down, the sunburst's rays pointed straight at it.

*Ten.* The dagger goes back in its sheath.

He turns and wades back to the shaft, both hands on the hemp, his good foot set against the rubble. His *now haul, steady, I'll walk the wall* goes up, and the line answers from the ring. It comes taut. It isn't a heave. It's a slow, even take-up, a working man's pull through an old iron ring, and every foot Pell climbs, the slack goes up with him. Osric's voice comes down flat:

"Coming."

Pell walks the wall. Wet chalk crumbles under his boots, and his good foot does the work while the bad one goes along for the ride. The rope carries his weight between holds. It's eight feet of rough wall, and a roof-runner has gone up worse with a guard dog underneath. Water pours off him in sheets. The cold comes up out of the gallery with him.

His line about the kettle and dripping on the floor goes up ahead of him. The gravel that answers sounds a little rougher than before.

"Hearth's lit."

The rim comes to his hands ragged and white, and it crumbles at the edge the way Osric said it would. He doesn't stand. He comes over it on his belly the way the others went out onto it, and the crust groans under him and holds. The sky is white and enormous after the gallery. The sun is past its height, the air is warm on his wet back, and the grey rock of the face lies two strides off. Behind him and below, through the hole in the road, the milky glow in the seam goes on shining. It's faint, and nobody is down there to see it.
````

<details><summary>T2's narration of the same scene, as played</summary>

````text
Pell gets the hemp loop over his head and works it down under his arms. His fingers fumble the bowline twice before it cinches against his ribs. His voice goes up the shaft: *one breath, Bram, hold the line, don't haul yet.* Then *Sefa, a hand to your left, on the seam.*

He takes one stride on a leg that feels like it belongs to someone else. The rubble shifts under his boot, the black water climbs to his collarbone, and his palm on the gallery wall is the only thing keeping him upright. The block lies a quarter-turn over beside him with its face to the roof. He puts his face close to its far end, where the old grey plaster has cracked away from the gallery wall.

The light from above stays where it was, white and steady on the sunburst, and the seam sits at the edge of it. Up close it's a dark crack a finger wide, running from just above the waterline down into the water. Deep inside, the pale thing is still there. From here it doesn't look like wet chalk. Chalk would be catching the light from the shaft. This is a dim, milky glow that seems to come from inside it, the way a horn lantern looks from the street with the shutter half down. It doesn't flicker with the water.

He draws a dagger and slides the point into the crack, slowly, counting.

At three the blade goes through crumbling plaster as if it were stale bread. At five it touches something. It isn't stone: there's no grit and no drag. The point makes a small, clean *tick* and skates off a smooth surface that curves away under it. He tries again, a little lower, and gets the same tick on the same curve. He knows the sound from window glass, though this is thicker and duller. At eight he presses gently to see if it will rock. It doesn't. It sits in something, a niche behind the plaster, and whatever it is is wider than the crack by a good deal. Nothing that size is coming out through a finger-wide gap unless someone breaks the plaster. At ten he draws the blade out, and a curl of old grey plaster comes with it and falls into the water.

It's set, so it stays.

He marks the place against the wheel. The seam lies off the end of the block, in line with the point of the ring where the long crossways stroke sits among the tallies. It's about a forearm above the waterline as the block lies now. He'd find it again in the dark.

Then he turns and wades back to the shaft. Every step sends pins and needles up the bruised shin. He gets both hands on the hemp above the loop and sets his good foot against the rubble. *Now haul, steady, I'll walk the wall.* After that, through his teeth, the bit about a fire in the kettle.

The rope doesn't come taut. It hangs slack from the rim. The gravel voice comes down the shaft from somewhere back toward the face, flat and loud enough to carry:

"Silk's still on the stone. Your knot. Cast it off, or I'm hauling the block up with you."

The hemp in Pell's fists runs down past his chest to the loop. Below the loop sits the ugly sheet bend he tied with his teeth, and from there the pale silk runs off through the water to the block.

*(Out of game: the sheet bend joining the loop to the silk round the block is still tied, and nobody up top will haul until it's off. Cast it off, by knot or knife, if you want to go up.)*
````
</details>

### Round 11 — Bram Halloway, Sefa Marrin, Pell Dunmore

````text
Bram is the first one into the yard after him. He crouches by Pell on the grey rock with a grunt about a bath, gets his bedroll out of the pack and leaves the case sitting dry on its own at the bottom with the flap down. The bedroll goes round Pell's shoulders. Sefa is already kneeling on his other side, the dead chalk warm in her fist, a hand on his wet sleeve. She speaks in the voice the hospice taught her: *hush now, you're out.* Her own blanket goes over Bram's bedroll, muddy hem and all. Bram puts a shoulder under him and they cross the yard on the living rock, with the pack swinging from Bram's other hand. The pinch-bar stays on the crust by the hole.

So by the time Pell crouches at the hearth he's wrapped three times over: Osric's grey army blanket, Bram's bedroll, Sefa's blanket. He's dripping on all of them.

When Bram asks about the leg, Sefa looks, because she said she would. It doesn't take a hospice novice long. A long bruise runs down the front of the shin where the stone sat, already purple at the middle and swelling. The skin is scraped but not split. When she presses at the edges he flinches without wincing, and the ankle turns under her hand the way it should. It's bruised and not broken. He walked across the yard on it, and he'll walk on it to Beregost and feel every mile. She sees the scraped forearm too, and the way he holds his ribs on that side when he breathes in.

Pell reads the line in the tally-book twice and doesn't say anything. He drinks the bitter green water down hot. Then he says Tobin's name to the fire, and after it the rest: *you wrote "drink" because the other thing had no name, and a man who can't name what killed his cutter can't tell the lads to stop cutting. I'd have written the same.*

Osric doesn't answer that. He looks at the page for a while. Then he closes the book slowly, the way you'd close a door on someone sleeping, and leaves his hand flat on the warped board.

"Aye," he says. That's all of it.

Pell gets his feet under him and asks his three questions. Osric takes them in order, standing.

"Always some salt went out. A jar a year, two. Old dyer in Beregost, dead now. Tobin was scraping for him." He taps the book once without opening it. "Then, back end of last winter, a letter from Tull. All the ledge gives. Cases, sealed. A case a month since. Hob carts it down to Thorn's door." He thinks about the second question. "Nobody came that wasn't a carter. But Tull's letter said *the rose, not the grey*. There's grey crust down there too. I never told Tull there was two kinds." He leaves that where it lies.

On the third question he takes longer.

"Tull had a fair copy. Bound to send one when a man dies on the house's ground. No answer to that either." His thumb moves on the board. "Tobin's mother has a bench outside the Song of the Morning. She was told drink. She had it read to her."

He doesn't go on.

Pell sets the empty mug on the hearthstone and gets his pack onto his shoulders with hands that mostly work. Then he makes his promise: the case to Thorn, the letter in Thorn's hands, her face watched when she reads *Vandarren*, a careful question about what an apothecary wants with dye from a drowned gallery. Tobin's name stays with Osric. Osric hears it all with his hand still on the book. He gives one short nod at the end, at the part about Tobin.

At the door Pell tells him to keep off the low end, nobody alone. Osric looks past him, out at the white yard and the dark hole in the track.

"Been doing that three years," he says.

The case lies at the bottom of Bram's pack with the bedroll gone from round it. The letter is in the pouch at Sefa's belt. The fire ticks in the hearth. Outside, the sun is still short of noon. The cart track runs down past the hole and the pinch-bar on its lip, toward the Way and a long half-day of road.
````

<details><summary>T2's narration of the same scene, as played</summary>

````text
Bram crouches beside Pell on the grey rock. "Found yourself a bath, then." He opens his pack and draws out the bedroll the case was wrapped in, taking care that the oak box stays dry in the bottom of the pack. He puts the bedroll round Pell's shoulders. Sefa kneels on his other side. The light has gone out of the chalk, and the stone sits warm in her palm. She takes his wet sleeve. *Hush now. You're out.* It's the hospice voice, soft and unhurried. Then she shakes a blanket out of her own roll, mud on the hems, and wraps it over Bram's bedroll. The cold comes off Pell in waves and she doesn't flinch from it.

Bram gives him a shoulder and they cross the yard on the living rock, Pell sparing the bruised leg. Bram's pack is on his back and the pinch-bar is left where it lies. On the way Bram says the wet clothes should come off by the fire first, and then Hale can tell them about his sleepy men. Sefa says the glass and the sunburst can wait until the case is delivered and they're all sitting at a table. At the threshold Osric looks at the man coming in under two layers of bedding, drops his own grey army blanket on top of them without a word, and goes to the kettle.

That was a quarter of an hour ago. The mug by Pell's knee is empty now.

Pell says Tobin Reed's name to the fire. Then he says the rest to the warden: *you wrote "drink" because the other thing had no name, and you'd not have been able to tell the lads to stop.* Osric listens with his hands at his sides. He doesn't say yes and he doesn't say no. When Pell finishes, the warden reaches over and closes the tally-book. He doesn't slam it. He shuts it the way you'd close a door on a sleeping room, and leaves his palm flat on the warped board a moment longer than he needs to.

Then come the three questions. He answers them in order, one fact at a time.

"Salt's always gone out. A sack or two a year to dyers in the Gate, through Tull. Since before my time." He looks at the shelf. "Her boxes, sealed, that's new. Since the thaw. One a month. Two last month. This one's the third since midsummer."

"Not a carter." He thinks about it honestly before he answers. "Once. Back end of winter. Two men with a letter in Tull's hand. Walked the yard, counted the sheds. Asked how far down the water goes at the low end, and could it be pumped." His jaw shifts. "Didn't go down. I didn't offer. Good boots. They paid the carter in Amn silver for the ride up, Hob said. He bit it."

"The page." He taps the closed book once with a knuckle. "Tull gets a fair copy every quarter. Wages, tools, deaths, all of it. Whether he reads it, ask him." He shrugs one shoulder. "Up here nobody reads."

Pell gets up slowly, tries the shin and gets his pack onto his shoulders. He says what he'll do, and that Osric can hold him to it at the Red Sheaf: the case into Thorn's hands, the letter, her face when she reads *Vandarren*, and a careful question about what an apothecary wants with dye from a drowned gallery where men fall asleep. Last of all he says Tobin's name is Osric's, and he won't say it to anyone.

Osric hears that last part with his eyes on the fire, and nods once.

At the door Pell gives him his own advice back, dry as the dust: keep off the low end, nobody alone.

"Nobody here to be alone with." It's nearly a joke, the first one out of him. It goes as soon as it came. "Leave the blanket on. Hob can bring it back."

Outside the glare is waiting. The hemp rope still lies coiled by the iron ring in the cut face, the pinch-bar lies on the crust at the rim of the hole, and a thin cold breath comes up out of the hole into the sun. The sun is still well short of noon. The track down to the Way is the same one you came up, and there's half a day of road and daylight to spare.

*(Out of game: Sefa's offer to look at Pell's leg is still open for Pell's player to answer.)*
````
</details>

### Round 13 — Pell Dunmore, Bram Halloway, Sefa Marrin

````text
Bram doesn't point at first. He says it plainly, the way Pell asked: it's a caravan camp. There's a good spring and shelter under the bank, he's slept there himself, the rows are new, and if anyone were using the place there ought to be wagons. Then he lifts his arm, and the other two follow it south.

He spends a long minute looking, one hand shading his eyes. Ten years on this road have taught him how a camp is laid out, and his eye fills in what a mile of distance blurs. The windbreak stands where teamsters always pile it, a half-ring of stones against the bank on the west side. The dark shapes lie inside it in two rows, close together and flat, with their ends turned toward a smudge in the middle where the fire would be. That's how a camp lies down at night: bedrolls with the feet to the fire, the guards' rolls at the open end. At noon, though, a camp that's moving on has those rolls tied behind a wagon seat. A camp that's breaking up leaves them scattered. These are still laid out for sleeping.

He finds nothing else. There's no harness hung on the stones and no wagon tongues in the grass. Nothing stands taller than the windbreak. A pale scrap, maybe canvas, lifts and drops on one of the stones when the breeze reaches it.

He watches the crows too, and they bother him. He has seen a camp after a fight. It brings every crow and kite for miles, and they squabble and flap and rise in a black cloud when anything comes near. These are six or seven birds walking about with nothing to fight over. Whatever lies in those rows is no fresh feast.

Pell gets his breath back a pace behind Bram and looks at the ground rather than the camp, the way a man looks at a house before he looks at its windows. The green ruts leave the Way below the rise and run east along a hawthorn hedge for most of the mile. They end in dead ground where the pasture dips before the alders. Anyone could walk along that hedge unseen from the spring until he was a long stone's throw from the bank. The alders are thick enough to hide a few men, but he can't see why anyone would be in them. Nothing has been tethered and no smoke rises. The crows feed on the ground right up to the edge of the trees. Crows don't do that with men lying quiet in a thicket. They'd sit in the branches and complain.

To his eye, nobody is waiting in that hollow. He can't tell from here whether anybody is still lying in it.

Sefa stands with the two of them while the cold settles in her stomach, the same cold that breathed out of the hole at Whitestone. She asks her question low, and Bram's long look is the only answer the rise gives her. From up here she can't tell drovers from what's left of drovers. She can only see the rows, the birds and the empty grass.

Behind them, on the Trade Way, life carries on as usual. A drover with a boy and eleven red cattle comes plodding north toward Beregost, in no hurry, swishing a switch at the flies. Neither of them looks east toward the hollow. A little farther up the road a carter's wagon creaks along with a load of barrel staves.

The sun stands a little past noon. Beregost's forge smoke smudges the northern sky about three hours off at Pell's pace. The hedge and the green ruts run east toward the alders, and the crows go on walking among the rows.
````

<details><summary>T2's narration of the same scene, as played</summary>

````text
Bram is still for a long moment on the crest, the way a man is when he's working out what a thing is before he says it.

Bram is still for a long moment on the crest, a hand flat over his eyes against the glare. He's working out what the thing is before he says it, the way Pell asked him to.

Bram reads it the way he'd read any camp he was riding into. **His eyes find the detail a mile off and hold it.** The dark shapes are bedrolls. There are twenty or more of them, laid out in rows inside the windbreak with their feet toward the middle, the way a caravan beds down round its fire. In the middle of the ring is a round black scar where the fire was. The bedrolls are spread out flat, not rolled and not slept in. They're a dull grey-brown, sunk into the grass the way cloth goes after rain and sun and more rain. That takes weeks, not days. The crows walk between the rows and stab at the ground, at spilled meal or whatever's left of somebody's rations.

He can also see what isn't there. No wagon stands in the hollow and none has been burned in it. There are no mule carcasses, no dropped harness, no gap kicked in the windbreak where men broke out, and nothing scattered. At the mouth of the hollow the grass lies pressed in two broad, pale stripes. Wagons went out that way onto the Way, heading south, a long time ago. Ten years on this road have taught him how a camp looks after it fights: gear everywhere, a cart on its side, a dead animal, something torn. A camp that breaks up and moves on rolls its beds. This one did neither. Its people lay down, and their beds are still lying there.

Beside him Pell shades his eyes and looks hard, and **the glare beats him**. The pasture swims white-green, the alders are a dark smudge, and the rows are only shapes with crows among them. From here he can't tell one thing from another.

The ground between here and the hollow is another matter. That's his trade, and he reads it without trying. A hawthorn hedge follows the old ruts down from the Way almost to the alders, a little higher than a man, and solid enough to walk behind unseen from the spring. Where the hedge stops there's about a hundred feet of open grass before the windbreak, and no cover on it at all. The alders are thick round the spring. Anyone sitting in them could watch the whole of that hundred feet, and nobody on the grass could see in.

Sefa sees what anyone could see from the rise: the ring, the rows and the crows. Nothing moves down there except the birds. No smoke, no voice carries up, and nobody calls out for help.

North, the forge smoke over Beregost stands up straight in the still air. The sun is a little past noon.

*(Out of game: Bram can tell the others what he saw, in his own words. Pell's plan, the hedge with Sefa watching and ten minutes, and Bram's plan, Beregost and a report, are both still on the table. Sefa, Pell asked you to keep the hedge with him if anyone goes down.)*
````
</details>

### Round 14 — Bram Halloway, Sefa Marrin, Pell Dunmore

````text
Bram says what he saw plainly and in order: twenty-odd beds laid round a fire and left to rot for weeks, wagon tracks going out south, no wreck, no loose harness, no sign of a fight, and nobody rolled their bedding. Then he points at the bare stretch of grass in front of the windbreak and says anyone sitting in the alders would see a man cross it. It isn't yesterday's quarrymen, he tells Pell, and it isn't ten minutes' work on that leg. It has waited weeks, so it can wait for the case, a report, and sound legs in daylight.

Sefa says the same in her own words. The hollow is as quiet as a grave. If Pell wants his ten minutes behind the hedge she won't stop him, but she'll wait on the road and not on the hill. Then she shifts her pack and turns toward the Way.

Pell gives his cheap version: the hedge, half a mile of cover, nobody steps onto the grass. He ends it the way he said he would. *If you'd rather walk on, say it, and I'll walk.* Bram has already said it. Pell falls in.

Before he turns his back on the hollow, Bram fixes it in his head the way he'd fix any camp on a road he means to ride again. There's the windbreak, the alder stand, and an old split alder at the north end, white where the bark has come off. The green ruts turn off the Way just past a milestone with its top broken off. Then he goes down the slope to the road at a pace the shin can keep.

---

The Trade Way is dry and broad, and after the quarry track it feels busy. In the first hour a tinker's cart passes going south. It's piled with pans, and a boy and a yellow dog walk beside it. The tinker lifts two fingers off the reins at Bram's shield, the way carters greet guards, and the dog barks at Pell's blanket until the boy cuffs it. After that come a drover with a dozen sheep, and a woman on a mule with a basket of eggs who looks at the white chalk caked on Pell and decides not to ask. Nobody on the road has anything to hide. They have somewhere to be by evening, the same as the three of you.

Pell's shin keeps its own count. It stiffens at every stop and loosens again after a hundred steps, and by the second milestone he walks with a hitch he can't quite hide. It holds all the way.

The forge smoke over Beregost gets closer and widens into many columns. Then the noise comes: hammers, a lot of them, out of time with each other, the way a smiths' town sounds on a working afternoon. The Way comes in at the low end past paddocks, a wheelwright's yard and the first of the smithies, open-fronted and hot, with men in leather aprons who don't look up.

Past the smithies, on the left, stands a long low alehouse with a faded red sheaf painted on its board. A single mule is tied at the rail out front, head down, dozing. Men's voices come from inside, loud for this hour. Somebody is singing badly, and somebody else is telling him to stop.

The road climbs on into the town proper. There's the market square, the inns, and above the rooftops on the rise the pale bulk of Lathander's temple, the Song of the Morning, with the sun on its east face. Maela Thorn's shop stands where you left it yesterday, a narrow front on the street below the square. The shutters are open and bunches of dried herbs hang in the window. There's no coach in the street outside, and no team waiting.

The sun has gone well over to the west but is still hours above the hills. It's the middle of the afternoon. You've come in with time to spare.
````

<details><summary>T2's narration of the same scene, as played</summary>

````text
Bram says it plainly, the way he'd report to a caravan master: beds, twenty or more, laid round the fire and left weathering for weeks. The wagons went out south. There are no wrecks, no scattered harness and no sign of a fight, but nobody packed their bedding. He points down at the bare grass between the hedge-end and the windbreak. *Anyone in those alders could watch you cross that.* Then he turns to Pell. These aren't yesterday's quarry lads, and it isn't ten minutes on that leg. Deliver the case first, report exactly what they saw, ask whether a caravan's missing, and come back by daylight on sound legs.

He takes his last look before he turns, and for a man who has driven this stretch for ten years it's an easy place to fix. The old ruts leave the Way beside a stunted ash with a split crown, the only tree on that side of the road for a long way. The hedge runs east from there. The hollow sits under the second fold of the pasture, where a ribbon of the spring shows silver for a moment between the alders. He could walk a Fist sergeant straight to it in the dark.

Sefa stays a step back from the edge and reads what anyone could read: no smoke, nothing moving, no voice, only crows going about their business. She says her piece. If someone down there were calling for help they'd have heard it, and nobody carries a warning faster by arriving dead or limping after sunset. Pell can have his look from the hedge if his leg swears to it and he stays in her sight, but unless he finds someone alive they touch nothing and don't linger. Then she settles her pack and starts down toward the Way. *If you go, go now. We'll wait on the road, not on the hill.*

Pell blinks the glare out of his eyes and gives Bram the read, since Bram is the one who has slept down there. Then he gives them the ground, because that part is his: the hedge offers cover all the way to its end, the last hundred feet are open grass that nobody crosses, and the cheap version is half a mile behind the hedge to where it stops, with no step onto the grass. Half an hour, not two. Sefa at the hedge where she can see both ways, and Bram on the crest with the case. If Bram would rather walk on, he only has to say so. Pell is only offering because he'd hate to learn tomorrow that someone down there was alive at noon.

Nothing has changed down in the hollow. A crow lifts, flaps a few lazy beats over the windbreak and drops again a row further on. On the Way below, a single ox-cart creaks north toward Beregost, piled with hurdles. Its driver is asleep on the seat with his hat over his face, and the ox seems to know the road without him. The forge smoke stands straight over the town. The sun has barely moved off noon.

Bram has already turned his shoulder toward Beregost. Sefa is a dozen steps down the slope toward the road. Pell stands on the crest with the hedge-line below him and his weight off the bad shin.

*(Out of game: Pell's half-hour hedge version is new since Bram answered, so Bram's player gets the next word on it. Bram's last look needed no roll, because he knows this country.)*
````
</details>

### Round 15 — Sefa Marrin, Pell Dunmore, Bram Halloway

````text
Sefa stops a dozen steps down the slope and turns halfway to look up at the crest. She doesn't frown. She tells Pell plainly that she won't let him go alone, not today and not on that leg. If there's going to be a look, it's ten minutes at the hedge end, no open ground, nobody out of anyone's sight, and if it's only crows they turn for the Way with Thorn's sunset ahead of them. Then she starts back up toward him, not hurrying.

Pell takes one more look at the hollow, at the crow settling a row further on, and at Bram's back already turned north. *Aye. You said it, I'll walk it.* He comes down off the crest favouring the shin and meets Sefa a few steps below the top. This time he doesn't drop back thirty paces. He falls in at her shoulder, where someone can catch him if the leg gives. On the way down he says Bram's read back to himself so he'll keep it: twenty beds, weeks old, wagons gone south, nobody took their blankets. Drovers don't own twenty bedrolls, and no caravan master leaves them to the weather. Then he sets out the order of the evening: the case, the ninety, the letter, the Red Sheaf, and a Fist sergeant or a priest of Lathander who'll hear what they saw. Last, while he can't argue about it, he puts on record that if they come back he's the one who goes to the hedge end.

Bram says his piece too, without heat. He'd rather walk on. He can't swear nobody down there is alive, but he's seen no sign of it, and that isn't enough to send a man on a bad leg while the three of them split up. Then he's on the Way, and the other two come down onto the packed brown road beside him.

The ox-cart hasn't got far. It creaks along at the pace of an ox that knows the road, a load of wattle hurdles lashed high behind the seat. Bram keeps well wide of the animal and calls up from the verge.

"Ho, driver! Heading to Beregost?"

The hat comes off the man's face. Under it is a weathered farmer of sixty or so, bald on top and white at the ears, blinking as if Bram had pulled him out of a well. He looks at the mail and the shield first, then at the two behind, and his hand doesn't go anywhere near the goad.

"Beregost, friend. Fair's tomorrow. Sheep want penning, and pens want hurdles." He squints at Pell, at the grey blanket and the chalk cracking off him at the knees, and the limp. "That one fell down something."

Bram asks about a seat for the leg.

The farmer thinks about his ox before he thinks about Pell. "Tailboard. Not the seat, the seat's mine. Sit on the back and keep your feet off my hurdles." He clicks his tongue, and the ox goes on exactly as it was going. "She'll not go faster for company. Middle of the afternoon, we'll be in."

Then Bram asks about the camp in the alder bottom and the bedding left out there. The farmer's face changes a little. It isn't fear, more like a man hearing about a neighbour's barn fire that he'd already heard about.

"Bottom by the split ash? Haven't turned in there since lambing. Nobody does now, not the ones from round here." He scratches under his hat. "There was a wool train up out of Nashkel back in the spring. Eight wagons, they said at market. Never came in to Beregost. Folk said it was gnolls." He shrugs. "Fist said gnolls too. I've had sheep forty years, and I've never seen a gnoll this side of the hills. But there's a sergeant in the town asking about it now. Kell. A woman with a voice you could fell a tree with. She'll have that bottom off you quicker than I would."

He puts his hat back on, though he doesn't lie back under it.

"Never come in," he says again, to the ox more than anyone. "You'd think somebody'd find a wheel."

The cart creaks north. Its tailboard hangs low and empty behind the hurdles, about knee height off the road. Behind the three of you the rise has already swallowed the hollow, and the crows with it. Up ahead the forge smoke over Beregost stands straight in the still air, and the sun has only just begun to lean west.
````

<details><summary>T2's narration of the same scene, as played</summary>

````text
Sefa turns on the slope a dozen steps down and climbs back toward the crest, unhurried, saying her piece as she goes: if anyone looks, they all go, ten minutes at the hedge end, nobody out of sight, and back to the Way if it's only crows.

She's halfway up when Pell starts down off the crest toward her, favouring the shin. *Aye. You said it, I'll walk it.* That's for Bram, and Bram is already walking. Pell doesn't drop back to thirty paces this time. He falls in at Sefa's shoulder, close enough to be caught if the leg goes, and goes over it aloud so he'll keep it: twenty beds left out for weeks, the wagons gone south, nobody took their blankets. Drovers don't own twenty bedrolls, and a caravan master doesn't leave them out to the weather. Then he lays out the plan: Beregost, the case, the ninety on the counter, the letter in Thorn's hand. He wants to give it himself, *if you'll let me, Sefa.* After that the Red Sheaf, and somewhere along the way a Fist sergeant or a priest who'll know whether a caravan is missing. Last of all, so it's said while he can't argue: if they ever come back, he's the one who goes to the hedge end.

Bram doesn't stop to argue it again. *I'd rather we walk on.* He has seen no sign of anyone alive, and that isn't enough to send a man down on a bad leg. He goes down the last of the slope onto the Way and waits on the verge for the other two.

The ox-cart hasn't got far. It's ahead of them on the brown road, going north at the speed of an animal that has decided the whole day is its own. It's a two-wheeled thing, piled shoulder-high with woven hazel hurdles roped down in a stack. The driver is still asleep on the seat with his hat over his face, one boot up on the shaft.

Bram stays well clear of the ox and calls out in his road voice: "Ho, driver!"

The ox stops dead.

The driver doesn't wake for a moment. He sways forward with the jolt, catches himself on the seat-rail and pushes his hat up. He's an old man, brown as a saddle, with white stubble and pale eyes creased from squinting at fields. He looks at the ox first, as if it owes him an explanation. Then he looks at Bram, the mail and the shield, and his shoulders go stiff for a moment before he takes in the limping man in a grey blanket and the woman beside him.

Bram asks him for a seat for a man with a hurt leg.

"Seat's mine." The old man sniffs and jerks a thumb back over his shoulder at the stack. "Tail's free. Room on the tailboard for one, if he keeps a hand on them hurdles over the ruts. Lose me one in the ditch and he walks." He looks Pell over, chalk-white to the collar. "Fell in a lime pit, did you, lad?"

He doesn't wait for an answer. Bram asks his second question, about the hollow and the bedding, and the old man's face changes. He doesn't look toward the hollow. He looks the other way, north up the road.

"Don't go off the road. Not me." He scratches his jaw. "Sleep on the seat, I do, and Bess there knows the way home." The ox flicks an ear. "But there's talk. Wagons going south and not getting to Nashkel. Three this year, or four, depends who's buying. My brother says it's gnolls down out of the hills, carrying folk off." He shrugs, as if his brother says a lot of things. "There's a notice at the Jovial Juggler in Beregost. Fist put it up, market day before last. A woman sergeant, Kell. Coin for any word on lost wagons, it says. Somebody read it out." He settles his hat. "So that's your somebody, if you've a tale. Not me. I make hurdles."

He gathers up the reins, though Bess plainly doesn't need them.

"Wick," he adds, as an afterthought. "Dunstan Wick. Beregost by mid-afternoon at her pace. Getting on, or not?"

The tailboard stands empty behind the hurdles, about knee-high, for whoever wants it. The forge smoke over Beregost stands straight up in the north, and the sun has barely moved past noon.

Pell, the tailboard's being offered to you.
````
</details>
