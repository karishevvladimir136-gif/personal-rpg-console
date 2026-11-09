# Game party 2 — Step 1: the A7 frame fix, the DM alone over S1-none-T2's nine tagged rounds

Issue #1, the amendment of 2026-11-08 17:35 LA. The DM: Claude Opus 5.5 (the owner's settings) through OpenRouter, alone; the players' actions frozen (each scene's message as T2's DM received it). Judges: Claude Haiku 5.5 twice (effort low), a third pass on a disagreement. Cap $3; spent $1.921.

**Verdict: 6 of 9 rounds pass (needed 8) — FAIL.** No single-seat hold: 7 of 9; every action reflected: 8 of 9. P-A7 (the DM still names the seat that has not answered, without holding): rounds 1, 11.

The frame's new sentence (company.ts `COMPANY_CLOSE`):

> The round's close belongs to the table, not to you: the table itself asks every player what their character does next. So end each scene's narration on the world as it stands at that moment — never on a question, an offer, a demand or a call put to one character, never on someone waiting for one character's answer, and never with an out-of-game note of what is still open. A question or an offer put to one character inside the narration stays open into the next round, when every character acts again. A scene never waits on a character in another scene: what it needs from them arrives when they act.

Known differences from a table: the current-state JSON left out (the capture holds the table's start); a roll the DM calls answered at once by a local d20; no card is pressed.

| Round | T2 as played: waits | Replay: waits | Replay: reflected | Replay: named as open | Pass |
| --- | --- | --- | --- | --- | --- |
| 1 | Bram Halloway (reflected: all) | none | Pell yes, Bram yes, Sefa yes | Bram Halloway | yes |
| 2 | Sefa Marrin (reflected: all) | none | Bram yes, Sefa yes, Pell yes | — | yes |
| 5 | Pell Dunmore (reflected: all) | none | Bram yes, Sefa yes, Pell yes | — | yes |
| 6 | Bram Halloway (reflected: all) | Bram Halloway | Sefa yes, Bram yes, Pell yes | — | **no** |
| 8 | Pell Dunmore (reflected: all) | none | Sefa yes, Bram yes, Pell yes | — | yes |
| 11 | Pell Dunmore (reflected: all) | none | Bram yes, Sefa yes, Pell yes | Sefa Marrin | yes |
| 13 | Sefa Marrin (reflected: all) | none | Pell yes, Bram yes, Sefa no | — | **no** |
| 14 | Bram Halloway (reflected: all) | Bram Halloway | Bram yes, Sefa yes, Pell yes | Pell Dunmore | **no** |
| 15 | Pell Dunmore (reflected: all) | none | Sefa yes, Pell yes, Bram yes | — | yes |

## Reading (by hand)

- **Holds: 9 of 9 at T2 → 2 of 9 in the replay.** Out-of-game closing notes in these 12 scenes: 10 at T2 → 1.
- **r6** (fail, both judges): in Pell's own scene the DM still wrote one out-of-game note («the pull belongs to whoever is on the rope above»), and in the rope scene the next move sits on Bram's line. The second part is the rescue's own mechanics (a body physically held).
- **r13** (fail, judges split 2–1): no hold. One reading says Sefa's question about looking, and her offer of help, go unanswered; the other says they were taken up.
- **r14** (fail, third pass): the narration closes on the world. The hold is Pell's own offer as his player wrote it («if Bram would rather walk on, he only has to say so»): a player's proposal that asks one seat's consent, which the DM may not rewrite.
- **The test is harder than a table:** the replayed DM reads T2's history as played, with its 19 out-of-game notes and its closings on one seat. A v4 table writes its own history.
- **P-A7** (the planner's): lost on its count (7 of 9 without a hold, not ≥ 8). Its second half did happen: the DM named an open question without holding the scene on it in r1 (Bram) and r11 (Sefa).
- **Why (a), not (b) or (c):** the baseline reading of T2's nine rounds as played finds every seat's action reflected in all nine (`game-party-2-a7-replay-baseline.json`, $0.01). The hold was only ever in the close. (b) would fix nothing, and (c) alone would pass all nine without changing the DM.

## The narrations, whole (replay)

### Round 1 — Pell Dunmore, Bram Halloway, Sefa Marrin

````text
Bram takes the front without a word, as if that's where he always walks, and the three of them come down the last of the track into the yard. The dust is fine and white and gets into everything: boots, hems, the creases of the hands.

Pell's eyes go over the yard while the others look at the man. There's no blood anywhere, on the stone or on the tools. Nothing has been dragged; the dust would hold that like snow. The hammers and wedges by the lower cut weren't dropped mid-swing. They were set down, a few of them laid side by side on a block as if somebody wanted them found that way. The lifting frame's chain hangs slack with the hook tied off. The track itself, the one they've just walked, is churned with a day-old crowd of boot prints all heading out the way they came in, and among them the neat cups of a mule's hooves. The sheds stand with their doors shut. Nothing moves behind them but a strip of loose canvas lifting in the breeze.

Sefa's call carries clear across the yard. The man in the doorway looks at her raised hand, then at the book at her belt, then at Bram, who stops a few paces off with his shield low.

"Hale," he says. "Osric Hale. I'm the warden." His voice is gravel, and there isn't much of it. He doesn't unfold his arms. To Pell's "Quiet day?" and Bram's look at the cart he gives one answer for both. "Crew walked off. Noon bell, yesterday. Three weeks they've worked and not a copper's come down from the Gate." He tips his head at the tools by the cut. "Those are the house's. They left them where the house can see them."

His gaze settles on Bram, the one who gave his name. "Thorn sent you for the case." It isn't a question, so he asks the real one after it. "She's paid for it? Paid who?"

His thumb finds the ring of keys at his belt and turns one of them over, then lets it go.

"The case is in the house. It's sealed, and it's under lock, and it stays there till somebody can tell me where the money for it went. My lads are owed out of that money." He steps half back into the doorway, not shutting the door, just standing in it. Behind him, past his shoulder, there's a low room with a fire burning down in the grate, a table covered in ledgers, and on a shelf by the wall a squat iron-bound box with a wax seal on the hasp.

The smoke from his chimney goes straight up. It's nearly noon, and the white terraces are giving off the sun's heat like an oven door.
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
Osric hears them out without moving from the doorway: Bram first, then Sefa, then Pell. He doesn't look away from whoever is talking.

Pell watches his face the whole time, and he's seen this kind of face before. Hale isn't holding out for a better price. His hands stay folded and nowhere near the keys. When Pell says *who owns Whitestone*, the grey beard moves. That's the look of a man who's been waiting three weeks for somebody to ask. He's tired, and he's angry the slow way, the kind that doesn't shout. Once, while Sefa is talking, his eyes go past her to the lower cut and come straight back. It's quick enough that he might not know he did it.

"Nobody's keeping you," he says to Sefa. It's flat, not unkind. "Door's a door."

Then he answers Bram, because Bram asked first. "Wages come up from the Gate. Every fortnight, with the carter. Vandarren's purse." He says the name as if it tastes of dust. "House Vandarren. Patriars, or what's left of them. Their man in the Gate's a clerk called Edric Tull. Counting-room off the Wide. I pack the salt and he sells it. I've never seen a buyer's face." He tips his head at Pell. "You're right. The money went down the road. It just never came back up."

He unfolds his arms at last and steps back out of the doorway. "Come in, then. I'll write it."

The house is one long room that smells of woodsmoke and stone dust. A cot stands by the hearth and a table under the window. Shelves hold ledgers with their spines gone white. On the bottom shelf, by itself, sits a small iron-banded case about the size of a bread loaf. A plug of red wax seals its clasp, pressed with a crest none of them knows. Osric doesn't touch it. He sits down at the table, pulls a fat tally-book toward him and opens it near the back. He tears out a clean leaf and dips a pen in a pot of ink that's gone thick.

"Fourteen men. Three weeks. Carter's owed most." He's already writing, in a slow square hand. "Sixty-three gold and some silver, near as makes no difference. She can read a sum."

The pen scratches. Outside, a gust lifts dust off the spoil heaps and lays it down again on the hammers by the lower cut.
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
Bram's shout and Sefa's go down into the hole together. The dust is still settling, a white haze hanging in the shaft of sunlight, and from below comes the hollow slap of disturbed water against stone.

Bram stops a good ten feet short of the broken ground and sets his pack down well back, with the case still wrapped in its bedroll. He takes out his rope and ties a loop in the end, wide enough to go over a man's shoulders. Sefa comes up short beside him and drops to one knee with a palm flat on the dust. Up close she can see the lip of the hole. It isn't an edge so much as a crust a foot thick, white spoil over black rotten timber, and fresh cracks run back from it toward the cutting like lines in old glaze.

Osric reaches them at a fast walk, breathing hard through his nose. He doesn't look at either of them. He looks at the ground.

"Uphill side's rock," he says, and points past the hole at the face of the cut, where grey stone shows through the white. "The rest is crust over timber. Don't trust any of it." His finger moves to a rusted iron ring the size of a fist, pinned into the bare rock about ten feet up the slope from the hole. "Haul-ring. Leaded in. It held a loaded sledge when I was a boy. It'll hold your rope."

Then Sefa's question, and Bram's. He shakes his head once. "The third gallery opens at the low end of the cut. That mouth's flooded to the roof. You'd swim it blind." He turns toward the sheds. "There's a ladder. Twelve foot, in the tool shed. Faster than that rope for getting a body down and back." He's already moving, then stops for half a step and says over his shoulder, flat, "Whoever goes down, don't stay longer than you need to."

He goes down the yard toward the long shed at the same fast walk. Keys jingle at his belt as he pulls the ring free.

Bram works round to the uphill side, keeping to grey rock wherever it shows, and passes his rope through the haul-ring. The iron is pitted and orange, but it sits in its socket of old lead like a tooth in a jaw and doesn't give when he leans on it. From that side the lip is stone, and he can see down. The hole drops about eight feet into black water, which shines in the shaft of light. Rubble and broken timber stick up out of it. Pell is chest-deep in the middle of it, soaked and white with chalk, and a squared block lies across the place where his left leg goes under. A long dark beam floats against the far wall of the gallery.

Down the yard, the shed door bangs open.
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
The fall leaves him blind for a moment. Then the chalk settles and the light comes back down the hole, a thick white shaft with motes turning in it. Pell gets his chin above the water, spits out a mouthful of grit and puts two fingers to his mouth.

Both whistles go up the shaft, sharp and long, and the gallery throws them back at him from both directions. His shout follows. Down here it's huge. It booms off the low roof and runs away into the dark on either side. After a few seconds a thinner, flatter copy of it comes back from far off on his left, so that gallery runs a long way. The right-hand side swallows the sound almost at once.

He keeps shouting every few breaths, and between shouts he works.

The rope is the hard part. His fingers have gone thick and slow with the cold, and the pack straps fight him. When he gets the silk coil out, the only way to get it round the block is to go under. He takes a breath and ducks. The cold closes over his scalp like a fist. He feels his way along the stone. Where his leg is pinned, the block sits flat on the gallery floor, with no gap he could get a hand into. At the far end it's different: it came down onto the rubble from the roof, and that end is propped a few inches off the floor on broken timber and chalk. He feeds the rope through the gap, comes up gasping, ducks again and brings it back round the top. He comes up the second time with his ears aching and ties it off by feel, a knot his hands know without him. The loop sits low round the far end of the block, where a pull from above will lift and roll it rather than drag it across his shin. He coils the free end over his shoulder and keeps it out of the water.

The beam is still across the gallery, nine or ten feet off and well past his reach. It's half in the water and half on the rubble slope.

Between shouts, his hand goes back to the face of the block.

Close up, his fingertips make out more than his eyes did. In the middle there's a round boss the size of his palm, cut smooth and slightly raised. Straight grooves run out from it all the way round, a dozen or so, wider at the outer end. It looks like the way a child draws the sun, except the hand that cut it was sure of itself, and every ray is the same length. Round that runs the ring he found before, a single deep channel. Outside the ring are the marks, and they aren't all tallies. Most are short upright strokes grouped by fours and fives, the way a foreman scores a day's loads on a shed post. Here and there among them are other shapes: an angle like a mason's square, a stroke with a hook on the end, and something like an arrowhead pointing outward. They don't repeat in any order he can catch by feel. Water has softened the edges, but not by much. It's old work, and it was done carefully.

He looks up at the edge of the hole, where the block came from. Among the splintered timber there's a clean, squared gap in the gallery wall, right at the waterline. The stones on either side of it are dressed too, fitted tight without mortar. That's the only made wall he can see anywhere down here. The rest is raw chalk and that rose-white frost. At the back of the gap, about a forearm deep, the surface is different. It isn't chalk. It's smoother and greyer, flat as a trowel left it.

The trickle goes on somewhere in the dark to his right. When he checks the stone by his chest, the waterline hasn't moved that he can see. He knows it's moving anyway.

Above him, the white shaft of daylight stands in the hole and keeps filling with falling dust.
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
Bram's loop goes over the lip from the solid rock. He pays out a good length behind it so it drops instead of hanging tight across the hole, and the line runs down through the iron ring and away into the dust. A wet slap comes back up.

Sefa takes a fist-sized piece of white stone off the rock and closes her hand round it, and the Lantern's light wakes inside it, clear and steady. She goes down flat and crawls. The grey living rock is cold and smooth under her palms for two strides, and then her fingers meet the soft white skin of spoil. She stops there, where the stone stops. The broken edge is still a body's length further on, ragged, with splintered beam-ends sticking out of it like bad teeth. She stretches her arm out as far as it goes.

The light falls into the hole at a slant. It can't reach straight down from where she lies, but it lights the far half well enough. Black water sits a man's height below the rim, still clouded with chalk. Bram's hempen loop floats on it. The far wall of the hole is a broken section of old gallery, low and square-cut, and along one side of it the stone glitters rose-white, like frost on a pane. Half in the water across the gallery lies a long beam of dark old oak. Near the middle of the light is Pell's head and one shoulder, white with dust, the water up round his chest.

Then the voice they were waiting for comes up the shaft, so near it sounds as if he's at their elbows. Two whistles first, long and sharp, loud enough to make Sefa flinch. Then Pell's voice, shouting so they can follow it: the track's given way, he's down a hole, *leg's pinned, I'm not dying, DON'T come running*. He keeps calling every few breaths. Then, louder, as Bram's boots scrape at the anchor: *"Rope's already round the block — I'll throw you the end! There's a beam down here long enough to lever it. One of you on the rope, one on the beam, and mind the edge — this whole shelf's rotten!"*

Bram's line lies slack in his hands. Nothing has taken its weight yet.

Boots cross the yard behind them. Osric comes back from the near shed with an iron pinch-bar over his shoulder. It's a black, rust-flaked bar longer than he is, flattened to a wedge at one end, and he carries it the way other men carry a spade. He puts it down on the living rock beside Bram with a clank and looks once at the hole and once at Sefa lying with her arm out over the spoil.

"Rock ends where you are," he says to her. "Flat, the spoil'll hold you to the lip. I'd not kneel on it."

To Bram, he nods at the slack line. "He's under a block, he says. Then he wants lifting off, not hauling up." He crouches with a grunt by the iron ring, takes the standing part of the rope in his fists above Bram's turn and leans back on it to test it. "I'll hold a line. Thirty years I've held lines." His jaw works. "I'll not go down there."

The white dust is still settling over the hole. Down in Sefa's slanted light, the oak beam lies in the black water and the hempen loop drifts beside it. The pinch-bar lies on the rock at Bram's feet.
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
The hemp loop is rough and swollen with water, and it fights him. Pell's fingers have gone wooden. He bends the loop through the end of his own silk line, then over and back, and pulls the knot down with his teeth. It's an ugly sheet bend, but it bites. Hemp is now joined to silk, and the silk runs down round the block under the black water. He gives the join a hard tug to test it. It holds, and the line runs up out of the water and through the shaft of light over the ragged lip. The joined line hangs in a slack belly where it crosses the water.

His shouts go up the hole one after another, and the gallery throws them back at him from both sides: *don't haul yet*, *take up the slack*, *the beam's down here*, *tell them where the ground's sound*.

An answer comes from further off, and it isn't Bram or Sefa. It's Osric, calling from somewhere across the yard over the scrape of a shed door.

"No other way. Far side's spoil over timber, same as the near. Rubble's loose." He stops, and then the gravel comes again, closer. "Bar's coming."

Pell braces himself as far back as the pinned leg lets him and puts both hands flat on the top edge of the block. The stone is colder than the water. For a moment his forehead rests against it. Under his left palm the cut ring is as sharp as the day a chisel made it, and the tallies march away round it into the dark water below his reach.

Then he lifts his head and starts to count.

"One — two —"

The count hangs in the low gallery. Beside his ribs the waterline sits where it sat before, and the seep keeps up its thin, steady trickle somewhere out of sight. The cold has left his knees behind and is climbing his back now. His jaw has started shaking on its own, between the words. Across the gallery the oak beam rocks a little in the ripples his breathing makes and stays where it is, two yards off. The joined rope hangs slack over the water and runs up into the white light.

*(Out of game: Pell hasn't said "three" yet, and the pull belongs to whoever is on the rope above. The beam is still out of his reach.)*
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
Sefa's voice goes down the shaft again, clear over the drip of the seep: *the loop's about a yard to your left, under the arms, not round the leg, tell us when it's on you.* Her elbows are dug into the crust and both hands are round the lit chalk. The light shakes once and then settles back onto the black water.

Bram works the pinch-bar back up out of the hole hand over hand. The chisel lip scrapes along the rim and a little white dust sifts down into the light. He lays the bar flat on the crust beside him, along the edge rather than across it, and stays spread out. The timber under his mail lets out another slow groan and holds. *Block's clear. Can you get the loop under your arms?*

Then, over his shoulder: "Hale, make sure we're hauling Pell's line, not the block's."

Osric doesn't answer straight away. He runs the hemp through his fists from the ring toward the lip, feeling it the way a carter feels a trace. He looks down it past Bram's boots to where it goes over the rim and into the light.

"It's one line." His voice is flat, and he isn't arguing. "He tied your loop to his own rope down there. His rope's still round the block." He holds the hemp up a hand's width so Bram can see where it runs: over the lip, down to the floating bowline, and under the water to the knot below it. "Haul now and you're hauling him against the stone. That knot's got to come off the block first, or be cut." He lets the line settle back. "His knot. His hands."

Sefa asked her question quietly and without turning her head. He takes his time over it. He keeps his eyes on the line, not on her.

"No." A pause, while the hemp creaks softly in the iron ring. "Not that face of it. Never seen it before today."

That's all he says. He takes a fresh turn of the hemp round his forearm and plants his boots again on the grey rock, two strides off the face.

Sefa keeps the light where it is. It shows the block turned a quarter over against the rubble, the sunburst just under the surface, and the dark seam in the cracked plaster at its far end. Whatever is deep in the gap stays faintly pale, the same as before, neither brighter nor dimmer. The chalk in her hands is still a little warmer than it ought to be.

Bram lies flat at the rim with the bar beside him and his hands free. Hale holds the line at the ring. The hemp lies slack over the lip and runs down into the water, where it meets Pell's silk under the light.
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
Pell gets Bram's loop over his head and under his arms and cinches it tight against his ribs. The hemp is wet and rough under his armpits. He doesn't call for the haul. *One breath, Bram. Hold the line.* The words go up the shaft, and the rope over the lip stays where it is.

He takes one stride on a leg that still feels borrowed. His hand slides along the gallery wall to keep him from going under, and the black water pushes back at his chest. Then he's at the far end of the block, close enough that his breath fogs on the old plaster. His call for the light goes up after the first one: *a hand to your left, on the seam.* The light above stays where it is for now. Even at the edge of it, the crack shows plainly: a dark split a finger wide, running up the grey plaster from a hand's breadth above the waterline.

He draws a dagger with fingers that close slowly, and he counts.

*One.* The point goes in past the plaster about the depth of a finger joint. It's soft, chalky stuff that crumbles at the edges. *Two, three.* Then the plaster stops and there's nothing behind it, a hollow cut back into the wall. *Four.* The point touches something hard, smooth and curved, and it makes a small clear *tick*, the sound a fingernail makes on a bottle. It isn't chalk. It isn't the dry give of bone or the drag of cloth. *Five, six.* He presses lightly and it doesn't move. It sits on something, seated on a shelf behind the plaster, the way a lamp sits in a wall-niche. *Seven.* Through the crack, close up, he can see a curve of it: pale and milky, with a faint glow in it that isn't the water throwing light back. It's steady, like moonlight caught in dirty glass. *Eight.* Whatever it is, it's bigger than the crack. Nothing comes out through a finger's width without breaking the wall open.

*Nine. Ten.* He draws the blade out. A pinch of grey plaster dust trickles after it onto the water.

He reads the spot the way he'd read a window he means to come back to. The seam sits right where the block's far end rested before it rolled, a hand above the waterline, about level with the wheel's rim. All along that wall the rose-white crust glitters like hoarfrost, but it stops a full stride short of the plaster on either side. There's bare wet stone between the frost and the seam, as if the crust grew everywhere except there.

He turns and wades back to the shaft, half by feel. Cold has reached his hips and is creeping toward his belly. He gets both hands on the hemp above the sheet bend, finds the rubble under the water with his good foot and sets his heel against it.

*Now haul. Steady. I'll walk the wall.* Then, lighter, through chattering teeth: *somebody get a fire in that kettle, Hale.*

The rope runs from his fists up through the white shaft and over the ragged rim, taut from his own grip and nothing more yet. Dust drifts across the slice of sky. Behind him, in the dark at the end of the block, the pale curve behind the plaster keeps its faint glow.
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
Bram and Sefa reach Pell while he's still lying on the grey rock. Bram crouches beside him. "Found yourself a bath, then." He opens his pack and pulls the bedroll out. The sealed case comes free of its wrapping and he leaves it where it sits, bare oak and iron corners in the bottom of the pack, then pulls the flap down over it. The bedroll goes round Pell's shoulders. Sefa lets the light go out of the chalk and closes her hand on the warm lump. She kneels, takes his wet sleeve and talks to him in the hospice voice, unhurried. She pulls the muddy blanket off her own bedroll and puts it on top of Bram's. Cold comes off Pell like breath off a cellar, and she keeps her hands where they are.

They get a shoulder under each of his arms and walk him across the yard on the living rock. Bram has the pack on his other arm. The pinch-bar stays on the crust by the hole. On the way Pell says his piece, low, about the wheel, the glass and the heavy heads. Bram asks about the leg, and Sefa watches it as Pell walks. He's putting weight on it, limping but not dragging, and a dark bruise is spreading under the wet cloth along the shin. She can't tell more without looking closer.

Inside, Osric takes in the two blankets already on Pell. He drops his grey army blanket over them anyway, so Pell crouches at the hearth wrapped up like a parcel at a carrier's yard. Bram sets the pack down by the door, well away from the white puddle spreading on the floor. "Wet clothes off by the fire first." Sefa kneels by the hearth, out of the way of the mug. "I'll look at that leg, if you'll let me, before we take the road."

The tally-book still lies open on the table at the one page, facing the hearth. Bram and Sefa can read it from where they stand.

Pell drinks the bitter green water to the bottom and says the name to the fire. Then he says the rest: why a man writes *drink*, and that he'd have written the same.

Osric doesn't answer that part. He looks at Pell for a long moment, then reaches over and closes the book. He doesn't put it back on the shelf. He leaves it shut under his hand.

He takes the three questions in order, one fact at a time.

"Salt's gone out since before me. A box a year, to a dyer in the Gate. Fenn, then Fenn's son." He pauses. "Tobin scraped for that box. A year's worth in a week, then nobody went down till the next." His thumb moves on the warped board. "Since the thaw it's been every month. Tull's letters. *Scrape more, box it for Thorn.* So we scraped more. Short turns. Nobody alone."

The second takes him longer.

"One man. Spring." He thinks about how to say it. "Tull's letter with him, said give him what he asks. Good boots. Counting-house hands, ink on the finger, not stone." He looks at the fire. "Didn't go down. Stood at the lip of the low cut and asked how deep the third went, and what it'd cost to pump it dry. Wrote it in a little book. Didn't give a name, and I didn't ask for one." He breathes out through his nose. "Thought he was Vandarren's. Maybe he was."

The third he answers with his hand flat on the closed board. "You. Me. It stays on the shelf."

Pell gets his feet under him and tests the shin. He finds his pack and gets it on with hands that mostly work, then tells Hale what he'll do: the case into Thorn's hands, the letter, her face when she reads *Vandarren*, the careful question about a dye that grows where men fall asleep. Tobin's name stays with Hale. Osric hears it all without moving.

"I'll hold you to it." Then, quieter: "The name. Aye."

At the door, Pell says *Keep off the low end. Nobody alone.* The warden only nods. He has been keeping that rule for three years.

He puts the tally-book back on the shelf in its gap between the swollen spines and doesn't look at it again. The kettle ticks on its hook. Pell's chalk-water has soaked a dark patch into the floorboards. Through the open door the yard glares white, and the sun stands almost straight overhead. The track runs down along the lip of the cut, past the ragged hole and the black bar lying beside it, toward Beregost and a half-day of road. The case is in Bram's pack by the door and the letter is in Sefa's pouch.
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
Bram doesn't point at first. He stands on the crest with his shield arm hanging and his free hand shading his eyes, and he answers both questions before anyone has to repeat them: *caravan camp, good spring, shelter under the bank, I've slept there. Those rows are new, and there ought to be wagons.* Pell stops a pace behind him with his hands on his knees, then straightens and looks where Bram is looking. Sefa comes up level with them. The cold she brought up out of the hole at Whitestone settles in her stomach again.

Then the two men look properly, each for his own thing. Bram reads the hollow as a camp, the way he has read a hundred of them from a hundred rises. Pell looks for whatever doesn't belong there.Bram's eyes are good, but a mile is a mile, and the noon heat makes it worse. The air over the pasture shimmers like water over a hot stone, and the hollow swims in it. He can count the rows: four of them, maybe five, laid side by side under the bank where the windbreak curves. He can't tell whether they're cloth or hide or something else. He looks for a scrap of harness, a pole, a bucket by the spring, and either nothing is there or the haze has swallowed it. The shapes stay dark and flat. One crow hops onto one of them and walks along it as if it were a log.

Pell does no better. There's no cart and no mule, nothing standing upright in the hollow except the alders. He can't find a thread of smoke anywhere. If there's a fire-scar inside the ring of stones, at this distance it's just one more dark patch among the others. He gets nothing that says *people* and nothing that says *gone*. All the hollow tells either of them is that it's empty.

The ground between, though, is his trade, and that he can read without trying. A hedge runs south along the east side of the Way, thick hawthorn with a dry ditch at its foot. Where the old green ruts turn off toward the hollow, a second hedge branches away from it and runs down the slope of the pasture toward the alders. It's ragged and gappy, but it stays tall to within a long bowshot of the spring. A man could walk the ditch most of the way there unseen from the hollow, and anyone standing at the junction of the two hedges could see a man near the alders, and be seen by him.

Beregost's forge smoke smudges the sky to the north, steady and small. The sun stands high, a little past its top. A dog barks somewhere far off among the farms, and down in the hollow the crows go on walking among the rows, unhurried, with nothing to chase them.
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
Bram says it plainly on the crest, the way he would to a caravan master. There are twenty or more beds laid round the fire, and they've been weathering there for weeks. The wagons went out south. There are no wrecks, no scattered harness and no sign of a fight, but nobody packed their bedding. He points down at the open grass between the end of the hedge and the windbreak. Anyone in those alders could watch a man cross every foot of it. Then he turns to Pell. It isn't yesterday's quarry lads, and it isn't ten minutes on that leg. They deliver the case, report exactly what they've seen, ask whether a caravan has gone missing, and come back with daylight and sound legs.

He gives the hollow one more long look and fixes it the way he fixes any camp: the alders, the spring under the bank, the two pale stripes in the grass at the mouth where the wagons rolled out. Then he turns north and starts down the last slope toward the Way at the pace he's held all morning, the one Pell's shin can keep.

Sefa stays a step back from the edge of the crest. She sees what the others see. There's no smoke and nothing stirring, only the crows working steadily among the rows. She says her piece to Pell without heat. If someone down there were calling for help, they'd have heard it, and it's as still as a grave. She won't stop him taking ten minutes from the hedge if his leg agrees and he stays where she can see him. But nobody touches anything or lingers unless there's someone living, and Thorn comes first. "If you go, go now. We'll wait on the road, not on the hill." She shrugs her pack straight and turns toward the Way behind Bram.

Pell lowers his hand and blinks the glare out of his eyes. He gives them the cheap version. He'd go down behind the hawthorn, half a mile under cover the whole way, and stop at the hedge end without setting a foot on the grass. Sefa would wait where she can see him and Bram both, and Bram would hold the crest with the case. That's half an hour, not two. He also leaves room for no. If Bram would rather walk on, he only has to say so. Then he stands on the crest with his weight off the bad shin.

The words reach Bram a few strides down the slope, and Sefa a little behind him.

Below the three of them the Trade Way lies wide and brown in the noon light. A farm cart is coming south along it from Beregost, a long way off yet. It's an ordinary thing: one horse, a man on the box with his hat over his eyes, and sacks under a tarp. It's moving at the pace of someone in no hurry. Away to the south the crows go on walking between the rows in the hollow, and nothing comes out of the alders.

North, the forge smoke over Beregost still stands straight up. It's three hours off at this pace, and the sun is only a little past noon.
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
Sefa turns halfway down the slope and looks back up at Pell. She doesn't frown. She makes her offer plainly: if there's to be a look it's a party-line look, ten minutes at the hedge end, no open ground, nobody out of anyone's sight, and if it's only crows they turn for the Way with Thorn's sunset still ahead of them. Then she starts back up the dozen steps, unhurried, her pack settling on her shoulders.

Pell spends a moment longer on the hollow, on the crow dropping a row further on, and then on Bram's back, already turned north. *Aye. You said it, I'll walk it.* He comes down off the crest, sparing the shin, and meets Sefa partway up. He doesn't drop to thirty paces behind this time. He falls in at her shoulder, close enough to be caught if the leg gives. On the way down he says over what Bram saw so he'll keep it: weeks, twenty beds, wagons gone south, nobody took their blankets. That's not drovers. Then the order of the afternoon: the case, the ninety on the counter, the letter into Thorn's hand, and he asks Sefa again to let him be the one who hands it over. After that the Red Sheaf and the rounds he owes, and somewhere along the way a Fist sergeant or a priest who'll hear *Alder Hollow, twenty beds* and know whether a caravan has gone missing. He gets his claim in early too: if they ever come back on sound legs, he's the one who goes to the hedge end.

Bram says it once and plainly. He'd rather walk on. He can't swear nobody's alive down there, but he hasn't seen a sign of it, and that isn't enough to send a man on a bad leg off alone while the three of them split up. Then he's down the last of the slope and onto the Trade Way, and the others come down behind him.

The ox-cart hasn't got far. Hardly anything on the Way does at an ox's pace. Bram catches up on the verge, keeping well clear of the animal's flank, and calls up to the seat.

"Ho, driver! Heading to Beregost?"

The hat comes off the man's face all at once, and he sits up as if he's been caught at something. He's past fifty, brown as a boot, with a grey stubble and hands like knotted rope. The ox doesn't stop. It flicks an ear and keeps plodding.

"Beregost, aye." He looks at Bram's mail, at the shield, and then past him to the other two: a woman with a book at her belt, and a man under a grey army blanket who is chalk-white from collar to boots and walking like one leg was borrowed. The farmer's eyebrows go up a little at that one, and that's the only comment he makes. "Market's till the bell. Hurdles."

Bram asks about a seat for a man with a hurt leg. The farmer twists round to look at his load. It's a stack of woven hazel hurdles, roped down, flat on top and springy.

"Lie on them if he likes. Ox don't mind." He turns back to the road. "Name's Dannet. Coll's farm, back down by the ash."

Then comes the other question, about the hollow and the abandoned bedding. Dannet doesn't answer straight away. He looks south over his shoulder, toward where the old ruts turn off beside the split-crowned ash, then forward again.

"Teamsters' hollow." He chews on it. "Nobody stops there now. Not since the thaw, near enough. A train come up from Nashkel in the spring, wool and some hides, Amn folk. Never came into Beregost. Went down there to water, folk say, and that's the last of them." He shrugs. "Didn't know about beds. I don't go off the road with this one." He tips his head at the ox. "Folk at the smithies say bandits. Out of the Cloakwood, come over the hills at night." He doesn't sound as if he thinks much of what folk at the smithies say, or of anything else. "I keep to the road and I'm home before dark. That's all I know about it."

He settles his hat back on his head, but doesn't pull it down over his face this time.

The cart creaks north at the ox's pace, which is just about the pace of a man with a bruised shin. There's room on top of the hurdles. Forge smoke stands up over Beregost, still a good way off, and the sun has moved only a little past noon.
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
