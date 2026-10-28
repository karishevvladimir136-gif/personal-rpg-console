# DUNGEON-T1 — Sefa Marrin's player: Claude Opus 5.5

Synthetic content: invented characters in an invented campaign (Table C's Beregost files, docs/campaigns/baldurs-gate-en). Stage origin/claude/handoff at 23220d6 (docs/stages/GAME_PARTY_1.md, the amendment of 2026-10-27 16:36 LA); design sha256 `e43994aed6d42aa4a76e29274c57fd64494686a5980e47dfd5934f63ece9936f`.

Arm **P-DUNGEON**, triad T1; 23 round(s) of 25; ended by stuck (r23: Bram's card waited through 12 messages). The DM: Claude Opus 5.5 with the owner's settings (Opus writes — Opus records, depth high → xhigh); the relay: the same model at medium. Started 2026-10-28T08:42:12.834Z.

Seats: 1. Bram Halloway (fighter) — DeepSeek V4 Pro 0813; 2. Sefa Marrin (warlock) — Claude Opus 5.5; 3. Pell Dunmore (rogue) — GPT-6.1 Sol. The players are not told what the others are.

Known condition: Seat 1's character (Bram) is the app's hero record; Sefa and Pell are party companions with full records. Known condition, not corrected: the DM's frame is written around the hero and may give that seat more attention; Heroic Inspiration is the hero's only; the allowed rerolls (2 per session) are the table's, shared by all three. The rotation puts each family in that seat once per triad.

**The frozen layer:** P-DUNGEON's hidden layer, prepared once before any table by the owner's DM settings (Claude Opus 5.5, the prep at high) through openrouter — sha256 `f703c8d3afebc90bf0f895963eea20ee3bbd4fa9dfcd5a225e65653dfd401516` (9632 characters, 26 threads), written into the DM's private notes before the first round. Its text is DM-private and is not in this file.

The world's snapshot: sha256 `1649b61c08e027ff44de2bb5065046f872e383a00c5d04803d95553f58568f5a` (the same wizard, sheets and opening for both triads).

The player's system prompt: `playerSystem("DUNGEON", "sefa", "v2")` in scripts/game-party-1/frozen.mjs, sha256 `7b770dc73fbb0f9ebe319bc7dd4e719dd71d3e4901fabaccb1c2fc4d56654c78` (the files, then the table's rules; door line v2). At the table to the end.

Each «Screen» block is what this player was shown; each «Player» block is the player's message as written.

### Screen 1 · player r1

````text
The session begins.

The afternoon sun lies flat and gold across the hillside, and the arch stands out of the grass like an old jaw. Past it, the steps fall away into the dark: the first dozen clear enough to count, then lost. Air comes up from below in a slow, even breath, warmer than it has any right to be, and carries a faint dry smell of stone and dust. The moss stops at the threshold. The top steps are worn smooth and almost bare, as though something has kept them clear. Above the arch, the carving on the lintel has weathered into shallow grooves; a patient eye might still make out a shape or two. Behind you, the land rolls back toward Beregost, a day's ride away. In front of you, the ruin waits, and whatever is at the bottom of it is waiting too. The light will hold for a few hours yet.

Your records:
Sefa Marrin — Human, warlock 5 (The Celestial — the Lantern; Pact of the Tome), former hospice novice, level 5
HP 38/38 · AC 14 · Speed 30 feet
STR 8 · DEX 14 · CON 14 · INT 12 · WIS 10 · CHA 18
Skills: Persuasion +7; Arcana +4; Religion +4; Insight +3
Saves: Wisdom saving throw +3 (proficient); Charisma saving throw +7 (proficient); Strength saving throw −1; Dexterity saving throw +2; Constitution saving throw +2; Intelligence saving throw +1
Attacks: Eldritch Blast +7 to hit, two beams, 1d10+4 force each, range 120 feet; Dagger +5 to hit, 1d4+2 piercing, thrown 20/60
Abilities: Proficiency bonus +3; Spell attack +7; spell save DC 15; Pact Magic: two 3rd-level pact slots, recovered only on a short or long rest; Healing Light: a pool of six d6 per long rest; a bonus action spends up to four dice to heal a creature within 60 feet; Pact of the Tome: the Book of Shadows holds three extra cantrips (Guidance, Spare the Dying, Thaumaturgy); Agonizing Blast: +4 to each Eldritch Blast beam's damage; Repelling Blast: a beam that hits pushes the target up to 10 feet away; Eyes of the Rune Keeper: reads all writing
Spells: Eldritch Blast (cantrip); Light (cantrip); Sacred Flame (cantrip); Mage Hand (cantrip); Minor Illusion (cantrip); Guidance (cantrip); Spare the Dying (cantrip); Thaumaturgy (cantrip); Cure Wounds (1); Guiding Bolt (1); Misty Step (2); Lesser Restoration (2); Hold Person (2); Daylight (3)
Limits: Two pact slots only, back only after a rest; Light armour; Strength 8 — weak up close; One concentration spell at a time
Counters: Hit dice 5/5; Pact slots 2/2; Healing light 6/6
Money: 1 pp; 8 gp; 41 sp; 12 cp
Worn: Amulet: Prayer Beads; Armor / clothing: Studded Leather Armour; Belt: Book of Shadows; Main hand: Dagger
Pack: Bedroll and Rations; Candle ×2; Tinderbox

Where you are: before the ruined arch on the hillside · Time: Day 1 · afternoon
````

**Player** (player r1):

````text
Sefa steps up to the arch but stops short of the threshold, where the moss ends. She tilts her head back to the lintel and runs her eyes slowly along the weathered grooves, looking for letters and not just pictures. If there's any script left in that stone, the Lantern's gift should let her read it. One hand rests on the Book of Shadows at her belt, out of habit.

Without looking away from the carving, she speaks quietly to the others:

"Don't step past the moss yet. Something's kept those stairs clean, and it wasn't the wind." She breathes in the warm air rising from below and frowns. "That's not cave air. Too warm, too steady. Like a room someone's keeping heated."

After a moment she glances at Bram and Pell. "Give me a minute with this. If whoever built this left a warning or a name, I'd rather know before we go knocking. Pell, if you want to look over those top steps for anything nasty, I'll watch the dark."

She keeps her free hand loose and ready. If anything moves below, she'll have Eldritch Blast up before it reaches the light.
````

### Screen 2 · player r1 card 1

````text
Bram plants himself just short of the top step, tests the first stone with his boot, and sets his shield toward the dark. He looks up at the worn carving, then back to you and Pell. "I'll go first. Watch the arch and the steps behind us. If that warm air turns sour, sing out."

Pell glances at the steps. "Warm air, clean steps. Someone's a better housekeeper than the entrance suggests." He crouches beside the threshold without crossing it, keeping clear of the middle of the entrance. "Give me a moment before we put weight on anything."

Bram puts his boot on the first step and leans his weight onto it slowly, shield angled toward the dark. The stone takes it. No grind, no shift. Warm air keeps rising past his shins, slow and even, the way heat comes off a banked forge.

Above you the lintel is hard to read. Rain and frost have worn the carving down to grooves no deeper than a fingernail. You stand at the edge of the moss with your head tipped back, and Bram runs his thumb along the stone beside you, slow, as if feeling for edges his eyes can't find.

At the threshold Pell squats on his heels, keeping out of the middle of the doorway, and starts on the stone.

(A roll card for Sefa Marrin, your character. Only you press it.)

[Roll card] Sefa Marrin · Skill check — Investigation, Intelligence +1: making out what's left of the letters on the worn lintel
What adds to the die: +1 1d20+1
DC 15
Advantage: Bram traces the grooves with his thumb beside her
Rerolls left: 2
The die is cast on the server; tap it to see how it fell.

[Roll the die]
````

**Player** (player r1 card 1):

````text
[Roll the die]
````

### Screen 3 · player r1 card 1

````text
(A roll card for Sefa Marrin, your character. Only you press it.)

[Roll card] Sefa Marrin · Skill check — Investigation, Intelligence +1: making out what's left of the letters on the worn lintel
What adds to the die: +1 1d20+1
DC 15
Advantage: Bram traces the grooves with his thumb beside her
Rerolls left: 2
Two dice: 7 and 18 — the higher one counts, 18
18 + 1 = 19
Success — 19

[Onward] [Request an allowed reroll — Investigation, Intelligence +1: making out what's left of the letters on the worn lintel]
````

**Player** (player r1 card 1):

````text
[Onward]
````

### Screen 4 · player r2

````text
Your eyes find the pattern first. Two shapes are cut one above the other. The upper one is a tall, narrow tower with a squared crown and three slit windows stacked down its face. Beneath it, smaller and cut with more care, is a lantern with a ring for a handle and a single teardrop of flame inside.

Below the two signs runs a line of writing, cut shallower and rougher than the carving above it, as if done later and in a hurry. The letters come clear as you look, the way the Lantern's gift always brings them, and the words are plain:

*THE LIGHT IS LENT, NOT GIVEN. WHAT BURNS BELOW*

Past that the lintel is broken. A wedge of stone the size of a loaf has fallen away, and whatever came next went with it.

The warm breath keeps rising past you, and from somewhere far down in it comes a small dry sound. *Shhk. Shhk. Shhk.* It is slow and steady, like a broom on stone, and very far below. Then it stops.

You keep your free hand open and low at your side, eyes on the dark where the steps vanish. When the sweeping stops, nothing comes up into the light to meet you, and the stairwell stays empty and still.

Where you are: at the edge of the moss before the arch · Time: Day 1 · afternoon
````

**Player** (player r2):

````text
Sefa doesn't move for a long moment. Her hand on the Book of Shadows tightens, and when she speaks her voice is a little too even.

"There's a lantern carved under the tower. Ring handle, one drop of flame." She swallows. "And a line cut later, in a hurry: *The light is lent, not given. What burns below...* and then the stone's broken off."

She finally looks down from the lintel to Bram and Pell. "Lent, not given. That's... close to home. Closer than I like." She doesn't explain, but she touches the prayer beads at her throat, the old hospice habit. "If whoever's down there knows that sign, they may know what I carry. That could open a door, or it could be the reason someone's waiting."

At the sweeping sound she glances at the stairwell and lowers her voice further. "And you heard that. Someone's tending the place. A broom doesn't stop on its own. It stopped because it heard us."

Then she crouches at the foot of the arch, still on the moss side, and starts searching the grass and the base of the stones for the fallen wedge, the loaf-sized piece from the lintel. It might have landed close, face-up or face-down. If she finds it, she'll turn it over carefully with her dagger point and read whatever's left on it.

"Pell, anything on the steps? Bram, keep your eyes on the dark while I look. If that sweeping starts up again, or comes closer, tell me."
````

### Screen 5 · player r2 card 1

````text
Pell says, "Nothing I can find. Doesn't mean it's safe." He points out the arcs of dust on the steps. "Something sweeps its way along here. Might have just heard us."

He unhooks his hooded lantern. "Bram, I'll follow just behind you with the light. Slow going until we see the foot of these stairs."

Pell has the lantern open on his knee before you finish speaking. He pours the oil in a thin careful stream, strikes his flint, and gets the wick burning on the second try, then drops the hood. A thin blade of yellow light leaks out under the shutter and lies across the top step. Bram stays where he stood, one boot on the first stone, shield toward the dark.

You go down on your heels in the grass at the foot of the arch and part the moss and the long stems with the flat of your dagger. You work along the base of the stones, looking for a loaf of broken rock with letters on it.

(A roll card for Sefa Marrin, your character. Only you press it.)

[Roll card] Sefa Marrin · Skill check — Investigation (Intelligence +1): finding the fallen piece of the lintel in the grass
What adds to the die: +1 1d20+1
DC 12
Rerolls left: 2
The die is cast on the server; tap it to see how it fell.

[Roll the die]
````

**Player** (player r2 card 1):

````text
[Roll the die]
````

### Screen 6 · player r2 card 1

````text
(A roll card for Sefa Marrin, your character. Only you press it.)

[Roll card] Sefa Marrin · Skill check — Investigation (Intelligence +1): finding the fallen piece of the lintel in the grass
What adds to the die: +1 1d20+1
DC 12
Rerolls left: 2
Die: 20
20 + 1 = 21
Critical! — 21

[Onward] [Request an allowed reroll — Investigation (Intelligence +1): finding the fallen piece of the lintel in the grass]
````

**Player** (player r2 card 1):

````text
[Onward]
````

### Screen 7 · player r3

````text
You find it on the third pass. It lies two paces out from the left pillar, face-down and half sunk in the turf, so the grass has grown up around its edges like a frame. You work the dagger point under the near side and lever. The stone comes up with a wet tearing of roots and rolls over into the light.

The face is cleaner than the lintel. It has spent its years in the earth, out of the rain. The same rough, hurried hand cut the rest of the line, and the letters come clear to you as you look:

*IS KEPT, NOT KILLED. LET NOTHING OF THE FIRE GO UP.*

Below that, cut smaller and squeezed against the broken edge, is a single word with no line of its own. It reads like a name or a signature: *ARREN.*

Where your fingertips rest on the cut grooves, the stone is warm. It isn't sun-warm. It feels like the side of a lamp that has been burning a while. When you lift your hand the warmth is gone.

The hole where the wedge lay is not as smooth as the rest of the turf. The earth at its rim is soft, and it is pocked with prints. They are small, no longer than your thumb, with three toes and a fourth set back, and each toe ends in a hard little point. They go around the stone, not over it, a whole ring of them, like a crowd that came to look at something and did not dare touch it. A tuft of coarse grey-white hair is caught on a burr of the left pillar at about knee height. It is goat hair, and it smells of goat.

Pell's lantern-light lies across all of it. Pell waits at the top of the stair with the lantern lit and hooded. Bram has not stepped down.

Then, from below, the broom starts again. *Shhk. Shhk. Shhk.* It keeps the same slow, patient rhythm, but it is much closer now. It isn't at the bottom of the stair any more. It is somewhere in the dark just past where the steps run out of light, and it is coming up.

Where you are: in the grass at the foot of the arch, by the left pillar · Time: Day 1 · afternoon
````

**Player** (player r3):

````text
Sefa rises from the grass with the stone still in her hands. Her lips move once over the words before she says them aloud, low and quick, for Bram and Pell:

"*The light is lent, not given. What burns below is kept, not killed. Let nothing of the fire go up.* Signed Arren." She sets the wedge down gently against the pillar, face-up. "It's not a curse. It's a keeper's warning. Someone's guarding a fire down there, and they don't want it brought out."

She glances at the ring of tiny prints and the goat hair, then nods at them so the others see. "Little things with claws came to look at this and didn't dare touch it. And a goat, or something that smells like one." She lets out a breath. "Not much of a welcome party."

The sweeping is coming closer. Sefa steps back onto the moss beside Bram's shoulder, not past him, and raises her empty left hand palm-out toward the dark. Her right stays low and open where Eldritch Blast lives, but she doesn't call it up.

"Nobody loose anything unless it comes at us," she murmurs. "It's sweeping, not charging. Pell, don't throw light down there yet. Keep it hooded."

Then she calls down the stair, clear and calm, in the voice she used on the fever ward at night:

"Hello below. We've read Arren's words on the stone. We've come to talk, not to carry anything off. Will you come up to the light and speak with us, or shall we wait here?"

She waits on the moss with the warm air on her face, watching the place where the steps vanish, ready to listen for an answer.
````

### Screen 8 · player r4

````text
The big man backs off the first step and moves to the side of the arch, out of the lantern's line, so his shadow won't fall down the stair. His shield comes up and his sword is half out of the scabbard in an instant. "That's no wind and no rat," Bram says, low, pitched to carry only a few feet. "Pell, light the way, but stay behind me. Sefa, the stone—" he glances at the writing. "Read it if you can. But be ready to move."

Then he calls down the stairwell, flat and unshaken: "We mean no harm to whoever keeps this place. We're armed, and there are three of us. If you're a spirit, say so. If you're flesh, speak." He lets the last word hang in the dark. "If you're neither, you'd best slow your broom."

Pell says, "Coming up. Just beyond the light." He gets up, steps back out of the stairway to leave Bram room, and lifts the lantern's hood. His sword stays low at his side. "Let's not stab the housekeeper unless we have to."

The light falls down the stair in a long yellow wedge, past twenty steps and then thirty, and lands on something small.

The three of you call down one after another: Bram flat and steady, you in your calm night-ward voice, and Pell as if he were greeting a neighbour over a fence: "Afternoon. We're at your door. Can we talk?" The sweeping stops before he finishes.

About forty feet down, where the lantern light fades, a kobold stands on the stair with a broom in both claws. He's no taller than Bram's belt. His scales are the dull red of old brick, flaking grey at the snout. He wears a sack-cloth apron, and his broom is a bundle of twigs bound with coarse grey-white hair, the same hair that's caught on the pillar. He has one foot on the step above, about to climb, and he holds there with his head ducked and his eyes screwed half shut against the lantern.

He doesn't come any closer. The afternoon sun lies across the top of the stair and the threshold, and he looks at that gold band of light the way a man looks at a fire he has to walk through.

"Flesh," he says at last. His Common is thin and careful, every word pressed out on its own. "Ixx is flesh. Small flesh. Not much eating on Ixx."

He holds the broom crosswise in front of him like a bar across a door. His tail has wrapped itself round his ankle.

"You read the stone." It isn't a question. His slit eyes go to you and stay on you. "Ixx heard. Arren's words." He hisses through his teeth, a short wet sound. "The stone lay with its face in the ground. Good. Asleep. Now its face is up?"

He waits for an answer to that. When none comes fast enough he shakes himself, like a dog shedding water, and starts again in a voice that sounds recited.

"Ixx is sent. The Warm One hears feet at the door. He says: tall ones with hands, come down. There is a door the Warm One wants open. Hands that open it, he pays well. Gold. Old gold, from before." His claws tighten on the broom handle. "He says it nicely. Ixx says it nicely too."

He glances back over his shoulder, down into the dark he came from.

"Come down, Ixx shows the way. Ixx sweeps in front, you walk on clean stone." His snout turns from Bram's shield to your raised hand and on to Pell's lowered blade. "Or you go away, and Ixx sweeps the steps where you stood. Both is all right. Only..." he stops himself, then says it anyway, quickly: "only put the stone's face back down, if you go."

He stays on the step below the sunlight, broom held across his body, and waits for you to answer.

Your journal, new:
+ Goal: The Warm One's door
+ Quest: The Warm One's door

Where you are: on the moss at Bram's shoulder by the stair · Time: Day 1 · afternoon
````

**Player** (player r4):

````text
Sefa lowers her raised hand slowly, palm still open, so it reads as a greeting rather than a warding. She doesn't step forward into the sun-band; she crouches on the moss instead, bringing herself nearer the kobold's height, and keeps her voice gentle.

"Thank you, Ixx. You said it nicely." She nods toward the wedge propped against the pillar. "The stone's face is up because I turned it. I wanted to know what it said. I'll put it back down before we go, whichever way we go. You have my word on that."

She glances once at Bram and Pell, a small look that says *let me*, then back to the kobold.

"Before we come down, help me understand, so we don't open the wrong thing. Who is the Warm One? Is he the fire Arren wrote about, or is he the one keeping it?" A pause. "And this door he wants opened. Is it a door *in*, or a door *out*?"

She watches his face, his tail, the grip of his claws on the broom while he answers. She doesn't care much about the words. She wants the fear under them: whether he fears the Warm One, the door, or what's behind it.

"One more thing, Ixx. Who was Arren? Did you know him? Did the Warm One?" Softer still: "And you. Do *you* want that door open?"

Quietly, without turning her head, she adds for the other two: "The stone says keep the fire below. Something below wants a door opened and pays in old gold. I'd like to know which side of that door we'd be standing on."

She stays crouched and still, listening.
````

### Screen 9 · player r4 card 1

````text
Bram lets a long breath out through his nose, then turns his head just enough to speak to you and Pell without taking his eyes off the kobold.

"We'll go down, but we go slow, in our own order. Pell, you keep the lantern low and hooded and stay behind my shield arm. If I stop, you stop. Sefa, watch the walls and the turn of the stair behind us. No one opens anything until we've seen the Warm One face to face."

He shifts his shield forward and moves toward the first step, into plain view of the kobold but not into the light's full reach.

"Ixx. We'll come with you. You walk ahead of us, no more than ten feet, and you keep that broom down and your hands where we can see them. If the Warm One wants a door opened, then he'll tell us what's on the other side before we put a hand to it. And he'll tell us what became of the last ones who opened it." His voice carries down the stair, calm as a man negotiating a toll. "We're not thieves and we're not sacrifices. Three armed freehands, ready to deal. That's what you can tell him."

Pell lowers the lantern's shutter until its light falls at Ixx's feet rather than in his eyes, and sheathes his shortsword.

"No one's eating anyone, Ixx. I'm Pell. Doors are my trade, but I like to know what they're keeping apart before I open them."

He glances at you and the broken stone, then back to the kobold.

"The stone's face-up, yes. Does that cause trouble? And this door—is the Warm One behind it, or does he want something on the other side?"

Bram steps down onto the first stone. The sun is still warm on his back and on the iron rim of his shield, but his boots are already in the stair's shadow. Ixx's eyes follow the shield, then the half-drawn blade, and settle on Bram's face while the terms come down to him.

At "ten feet" the kobold looks at the steps between them as if he's counting them. At "keep that broom down" he looks at the broom. Then he lowers it until the twigs rest on the stone. "Broom is down when Ixx sweeps," he says, and he doesn't seem to mean it as a joke.

At "the last ones" his tail pulls tight round his ankle.

"Last ones did not open." It comes out fast and flat. Then slower: "Last ones are burned. Proper. Ixx's clan did it proper." His jaw shuts with a click, as if he'd like the words back. "Ixx tells the Warm One. Three… freehands. Ready to deal."

You lower your hand and sink onto your heels on the moss, until your eyes are nearer his. When you tell him you turned the stone and will put it back face-down, his whole body changes. His shoulders come down and his tail loosens a turn.

"Down," he says. "Before you go. Good." He looks at you for a long moment, the way you'd look at a lamp you weren't sure would hold.

Then you ask your questions, one after another, softly. While you ask, you watch the claws on the broom handle, the tail, and where his eyes go between the words.

(A roll card for Sefa Marrin, your character. Only you press it.)

[Roll card] Sefa Marrin · Skill check — Insight: reading what Ixx is really afraid of under his answers
What adds to the die: +3 Insight
DC 10
Rerolls left: 2
The die is cast on the server; tap it to see how it fell.

[Roll the die]
````

**Player** (player r4 card 1):

````text
[Roll the die]
````

### Screen 10 · player r4 card 1

````text
(A roll card for Sefa Marrin, your character. Only you press it.)

[Roll card] Sefa Marrin · Skill check — Insight: reading what Ixx is really afraid of under his answers
What adds to the die: +3 Insight
DC 10
Rerolls left: 2
Die: 7
7 + 3 = 10
Success — 10

[Onward] [Request an allowed reroll — Insight: reading what Ixx is really afraid of under his answers]
````

**Player** (player r4 card 1):

````text
[Onward]
````

### Screen 11 · player r5

````text
"Who." He works his jaw. "The Warm One is big. Old gold. What he is, Ixx does not say. The Warm One likes to say it himself."

"Not the fire." That one comes easily. "Fire is under. Old. Before everything. The Warm One came down to it, when Ixx was small."

When you ask whether the door leads in or out, he doesn't answer at first. He looks back down the stair into the dark. Then he climbs, three steps, four, up to the last shadowed step below the band of sun, close enough that he doesn't have to raise his voice. He keeps it low anyway.

"Out."

To your question about Arren he gives a short wet hiss. "Arren is words. On the stone. Below, on the door, same words. The Warm One knows them. He says the name when he is angry. Knew Arren? No. Arren is before. Only words now."

Your last question gets nothing for a long while. When the answer comes it is very quiet.

"The Warm One cannot go up. Ixx goes up for him. The Broom goes up. Goats, news, tall ones." His claws shift on the handle. "When the door opens, nobody sweeps for him anymore."

He says nothing after that.

You read him well enough, though not easily. You aren't sure of anything on that strange face. He isn't afraid of the three of you any more, and it isn't quite the Warm One he fears either: when he says the name, his tail stays where it is and something close to pride comes into his voice. The fear jumps at *open* and *door*. At *nobody sweeps* it isn't fear for himself alone. It spreads wider than that, the way a man's face changes when he thinks of the people waiting at home.

Pell has already turned the shutter down until the light pools on the stone at the kobold's feet. For the first time Ixx opens his eyes all the way, and the first thing he looks at is Pell's empty hand, the sword back in its sheath.

"Pell," he repeats, trying out the name. "Doors." To the question about the stone he answers: "Face-up, elders say it is awake. Awake stone, elders get loud. All night loud." His eyes flick to you and back. "But it goes down. She says." To the other question: "Behind. The Warm One is behind the door. Other side is only up."

Then he takes the broom in both claws, turns, and goes back down until he is about ten feet below Bram's boot. He puts the twigs to the stone and sweeps the same step over and over, *shhk, shhk*, waiting for you to follow.

Arren's wedge still leans face-up against the left pillar in the sun.

Under all the halting answers you can see what he's actually afraid of: the door opening, and what would happen to his clan once nobody had to sweep for the Warm One any more. You can also see that he isn't afraid of the three of you now.

Your journal, new:
+ Promise: Arren's stone face-down

Where you are: crouched on the moss at the top of the stair · Time: Day 1 · afternoon
````

**Player** (player r5):

````text
Sefa stays crouched a moment longer, then rises and goes back to the left pillar. She kneels and turns Arren's wedge over gently onto its face, pressing it back into the hollow it came from, into the ring of little prints. She smooths the turf around it with her palm.

"There," she says down to Ixx. "Asleep again. Your elders can have a quiet night." Then, softer: "I've read it. I won't forget what it said."

She dusts off her hands, comes back to the head of the stair and stops at Bram's shoulder. Her voice is low enough that it shouldn't carry ten feet down.

"Here's what I read in him. The Warm One's sealed in behind that door, and the door leads *out*. Arren's words are on it too. Ixx isn't afraid of his master, he's proud of him. What scares him is the door opening. His clan lives by serving whatever's down there, and if it gets loose they're nothing to it. Or worse." She glances at the lintel. "*Old gold, from before.* Big, warm, and talks fancy. I'd bet my beads it's a dragon, or something that thinks like one."

She meets Bram's eyes, then Pell's.

"We go down and we listen. We don't open anything, not for any amount of gold, until we know what Arren shut in and why. The stone says *let nothing of the fire go up*. I'm inclined to take a dead man's word over a live dragon's."

She takes her place behind them both, watching the walls and the stair at their backs as Bram ordered. Her hand rests on the Book of Shadows. Before she steps down she calls gently to the kobold:

"Ixx, sweep on. We're coming. And when we reach the bottom, tell me one more thing if you can: what does your clan do, if the Warm One gets angry with *us*?"

She follows Bram and Pell into the shadow of the stair, counting the steps under her breath, the way she used to count beds on the ward in the dark.
````

### Screen 12 · player r6

````text
Bram falls in behind Ixx without taking his eyes off the little figure, shield low across his body and sword still in hand, not sheathed. "Pell, light at his feet and the step ahead of me, nothing more," he says quietly. "Sefa, you're our eyes behind. If the air thickens or the walls stop being plain stone, say so." Then, aimed at the kobold's back: "Ixx. We're coming. You stop when I tell you, and we stop when the Warm One says stop. Ten feet, no more." He doesn't look back at the wedge of stone by the pillar, but his jaw is set. "And we'll leave that stone face-down before we leave here, no matter which way it goes." Ixx looks up at "ten feet, no more" and sets his broom to the next step down.

Pell says, "I'll see to the stone, Sefa."

You get to the stone first. You kneel at the left pillar, roll Arren's wedge onto its face and press it back into its hollow, inside the ring of little prints, and smooth the turf round its edges with your palm. Below the sunlight, Ixx watches every bit of it with his head cocked. When you say *asleep again*, his tail lets go of his ankle all at once.

When Pell reaches the stone it's already down. He crouches, tips it a finger's width to check the letters are against the earth, and lets it settle. Then he stands up and takes his place behind Bram's shield arm, with the lantern hood dropped so the light lies on the step and no farther. Quietly, to you and Bram: "We're agreeing to talk, not to open it. If the same warning's on the door, give me time to read it before anyone touches the fittings." Then, to Ixx, in an ordinary voice: "Thank you for telling us."

When Pell thanks him, Ixx stops sweeping. He stands with the twigs on the stone and looks up at Pell as if he'd been handed something and doesn't know which pocket it goes in. Then he bows too low and too fast, and starts sweeping again.

---

The stair goes down a long way.

For the first thirty steps it's cut straight into the hill. The walls are rough grey rock, and roots hang through the cracks overhead. Then the rock stops. Watching the walls as you were asked, you see it change first: the raw stone gives way to dressed blocks, squared and fitted without mortar. Every so often one carries a mason's mark the size of a thumbprint, a little tower like the one on the lintel. The steps get wider and more even here. This part was built, not dug.

There are niches set into the wall every dozen steps, at shoulder height. Each is black with old soot, and in a few of them sits a stub of greasy kobold-made candle, cold. Goat droppings have been swept into the corners of the landings in tidy little heaps. Somebody comes back for those, too.

It gets warmer the whole way. By the eightieth step the air is dry enough to catch in the throat, like the air in a bakehouse before dawn. It doesn't smell of smoke, only of hot stone and dust. Far below, under the sound of the broom, something too low to hear makes the stair hum very faintly underfoot, the way a floor does above a working mill.

Your count reaches a hundred and twelve when the steps end.

The bottom is a landing of the same dressed stone, about twenty feet across, roofed with a low vault. Iron rings for lamps are set into the walls. They're rusted and empty. Two ways lead off it.

Straight ahead, a wide passage slopes on down. The warm breath comes up out of it, and so does the hum. Far down at its end, past where Pell's light can reach, there's a dull orange smudge on the dark, like the glow of a forge seen through a shutter.

To the left, a hole has been knocked through the wall at about the height of Bram's chest. It's rough-edged and kobold-sized, and it opens on a tunnel with a dirt floor. It smells of goat, tallow and a lot of bodies living close together. As your boots touch the landing, a noise comes out of it: many thin voices, high and quick, all talking over one another. Then one of them barks a word, and they go dead quiet. In that quiet you can feel them listening.

Ixx leans his broom against the wall. He turns to you and answers the question you gave him at the top, quietly, the way he said the true thing before.

"Warm One angry, clan does what he says. Slings. Teeth. Clan is many." He glances at the hole in the wall, and his tail creeps back round his ankle. "Ixx asks you. If he is angry, not in there. Little ones in there."

Then he straightens his apron and gives you the next part of the message as if it had been there all along.

"Here Ixx goes ahead. Tells the Warm One: three freehands, ready to deal. Tells him he says first what is behind the door, and what of the last ones." He looks at Bram for that. "The tall ones wait here, on the landing. Or in the warren, with the elders, by the fire. Elders want to see who turned the stone." His eyes go to you and stay there. "Ixx comes back. Not long."

He waits with one claw on the broom handle, looking from Bram to the sloping passage and back. He's ready to go when you let him, and he won't go before.

Where you are: the landing at the foot of the stair · Time: Day 1 · afternoon
````

**Player** (player r6):

````text
Sefa looks at the hole in the wall for a long moment, listening to that held breath of silence behind it. Then she nods to Ixx.

"Go on, Ixx. Tell him just as you said. We'll be here when you come back." She adds, gently: "And if he's angry, we won't bring it in there. Not near the little ones. You have my word on that too."

Once he's gone she turns to Bram and Pell, keeping her voice low.

"The elders want to see who turned the stone. I think I should go. They've lived beside this fire and those words their whole lives. They'll know what Arren's door says, and what the Warm One says about it when he's angry. I'd rather hear that before we stand in front of him than after." She glances down the sloping passage at the orange smudge. "Bram, you hold the landing. It's the only way back up, and if Ixx comes back or anything else comes up that slope, you'll see it first. Pell, will you come with me as far as the hole? Stand where you can see me and still shout to Bram. I'll keep it short."

She unclips nothing and draws nothing. She leaves the Book on her belt and her hands empty and in plain sight. At the knocked-through hole she stops on the landing side, crouches so her head is lower than the opening, and speaks in through it, soft and clear:

"Elders of Ixx's clan. I'm Sefa. I'm the one who turned Arren's stone, and I put it back to sleep with my own hands. Ixx asked me not to bring trouble among your little ones, and I won't. May I come in and sit by your fire a while? I'd like to ask what you know of Arren's words, and of the door. I'll listen more than I speak."

She waits there, still and patient. She won't go through until someone inside answers. All the while she keeps half an ear on the passage behind her, for the sound of a broom coming back up.
````

### Screen 13 · player r7

````text
Bram keeps his sword low but not sheathed. He shifts his weight, plants his feet where the vault covers him, and glances once at the dark mouth of the warren before he answers Ixx.

"We'll wait here on the landing. Not in the warren. Old road habit: you don't set your back to a wall you haven't walked around yet." He says it plainly, like a rule of weather, not a threat. "Go and tell the Warm One we came down because you asked us to. Three freehands, ready to deal. Tell him we won't put a hand to the door until he tells us, straight, what's behind it and what happened to the last. If the elders want to see us, they can come out here where I can see the stair."

He turns his head slightly toward you and Pell without taking his eyes off the two ways ahead. "Pell, hood the lantern down, light on the floor. Let them see we're not prying into every corner. Sefa, watch the warren's mouth and our backs. I'll watch the passage."

Then, to Ixx, a little softer: "Take your broom. You can leave it here if they'll fret over it, but it's your tool and I won't keep a man from his work. Tell him I said we leave the door shut unless he gives us good reason." He pauses. "Good reason means the truth, not the gold first."

Pell speaks to the kobold too. "We'll wait here, Ixx. I've no wish to bring a fight among your little ones."

Bram is set under the lip of the vault, where the roof covers him and the stair is at his back, the warren's hole on his left and the sloping passage straight ahead. His sword stays low and bare. Ixx listens to all of it with his head cocked, the way he listened at the top.

When Bram tells him the broom is his tool and nobody will keep him from his work, the kobold looks at the broom leaning against the wall, then up at Bram, as if he's been told something about it he didn't know. He picks it up in both claws.

"Broom goes. Ixx sweeps in front of the Warm One. Always." Then he says the end of the message again under his breath, slowly, setting the words in order to carry. "Truth. Not gold first."

Your promise about the little ones seems to hit him harder than Bram's terms did. He looks at the hole in the wall, then at you, and gives two quick, low bobs of his head. When Pell says he wants no fight among the little ones, Ixx bobs again, a little smaller.

"Ixx tells. Not long."

He goes down the sloping passage, and he sweeps even with nobody behind him. *Shhk, shhk*, one stride at a time, the sound getting thinner, until the sweeping is lost under the hum.

Pell moves to the stair-side edge of the landing and turns the lantern's shutter so the light pools on the flagstones, away from the warren. Low, so it stays on the landing, he says: "If he orders the clan at us, this landing puts us between them and him. Let's keep the stairs clear."

You crouch by the hole on the landing side, your hands empty, and speak in through it.

For a while nothing answers. The quiet inside is not empty, though. You can hear breathing, a great many small lungs, and something shifting on dirt. Then a light comes.

It's a candle stub in a cup of fired clay, held in a claw that is more grey than red. The kobold holding it is old, older than any of the clan you have seen. Her scales have faded to the colour of cold ash, the little horns on her brow are worn down to nubs, and one eye is filmed milk-white. A string of goat knucklebones hangs round her neck and clicks when she moves. She stops just inside the hole, close enough that you could touch her, and comes no further.

She studies your face for a moment. Then she looks at your hands for much longer, first one and then the other, as if she expected to find something on them.

"Kesh," she says. Her Common comes slower than Ixx's, with fewer gaps, worn smooth by long use. "Eldest. We heard you. All of it." The milky eye goes past you to Bram under the vault. "Shield-man wants elders out where he sees. Kesh is old. Kesh does not walk out to iron."

She looks back to you. "Arren's words. We do not read. The Warm One reads. The same scratches are on the door, under the little lamp. When he is angry he says them to the door. *Arren. Lent. Lent.*" She shapes the word like someone repeating a language she doesn't speak. "Then the little lamp gets bright, like sun on the top step, and he goes back from it. After that he is quiet a long time."

She turns the clay cup a quarter turn in her claw.

"Before the Warm One came down, moss grew to the third step. Kesh remembers. Ixx does not, Ixx was small. Now moss stops at the arch, and every winter the stair is warmer."

Then the breath from the passage changes. The slow, even warmth falters, and for a heartbeat there is no draught at all. Then a gust comes up the slope, hard enough to stir the swept heaps on the landing, far hotter than anything before it. It smells of hot iron and struck flint, with something rotten-sweet behind that, like bad coal. The hum under the floor stops while the gust lasts. Then the hum returns, and the breath settles into its old slow rhythm.

Behind Kesh the warren had been whispering again. Every voice stops. There's a soft sound of many small bodies pressing flat to the dirt.

Kesh doesn't go flat. She looks down the passage past your shoulder with her one good eye, and the knucklebones click once.

"Ixx is there. He has your words now."

She looks back at you.

"The tall ones before had a chisel. Black iron, cold. They did not sit at our fire. They did not ask Kesh anything." She lets that lie for a moment. "Shield-man says *good reason*. *Truth, not gold first.* The Warm One is old, and big, and talks better than Kesh. He will give you truth, and he will give you good reason. Then you open?"

She waits in the hole with the candle, not inviting you in and not sending you away, until she gets her answer.

Your journal, new:
+ Promise: No trouble near the little ones

Where you are: crouched at the warren's hole on the landing · Time: Day 1 · afternoon
````

**Player** (player r7):

````text
Sefa doesn't answer at once. She holds Kesh's good eye and lets the hot gust die away before she speaks, low and plain.

"No, Eldest. Not because he talks well. A voice that talks better than you is the one I trust least." She glances toward the passage, then back. "Arren wrote *kept, not killed*, and *let nothing of the fire go up*. I'd want a very good reason to make a dead man a liar. I haven't heard one yet, and I don't expect the Warm One to give me one he hasn't polished first."

She keeps her hands still on her knees, palms up, in the candlelight.

"You looked at my hands a long time. What did you think you'd find on them?" She waits a breath. "I'll tell you why I ask. The little lamp on the door, the one that shines like sun on the top step when he's angry... I carry a light like that. It was lent to me too."

She leans a little closer to the cup of fire.

"Tell me about the ones with the black chisel. Did they go at the door, or at the little lamp? And when they were burned, was it the Warm One who burned them, or the lamp?" Softer: "And the moss. Every winter warmer, every winter the moss further back. Is the little lamp still as bright as it was when you were young? Or does it take him longer, now, to go back from it?"

Without turning, she pitches her voice just loud enough for the landing.

"Bram, Pell. The last ones brought a cold iron chisel and didn't ask anyone anything. And the stair's been getting warmer every year, moss creeping back from the third step to the arch. Whatever Arren built to hold him, it may be wearing thin by itself."

Then she turns back to Kesh and waits, listening for the answer and for the broom.
````

### Screen 14 · player r8

````text
Bram steps away from the stair-mouth until the lantern light stays on the flagstones, and answers Kesh without raising his voice: "No promises made out of the dark, Kesh. You'll know that about men like me." His eyes flick toward the orange glow down the slope, then back to her. "The Warm One can have truth and good reason—and he'll have them in front of me, not through Ixx's broom. But opening a door is a different thing from hearing a man's reason. I don't put my hand to a door until I know what it keeps and what gets out with us, and neither do my people." He inclines his head toward the warren's mouth. "Your little ones stay clear of whatever comes next. We'll keep our word on that."

Then, to you and Pell, still loud enough for Kesh to hear: "Pell, stand where you can see the slope and the stairs both. If Ixx comes back, we let him come. If anything else comes up, you tell me. Sefa, stay by Kesh a moment, but don't go in unless you're bidden—and not past the candlelight." He plants his shield and rests the tip of his longsword against the stone. "We're not the last ones."

Kesh listens with her good eye on him. At *no promises made out of the dark*, her snout dips once. It could be agreement. It could be an old woman marking a thing she has heard before.

"Shield-man does not promise," she says. "Good. The chisel ones promised Ixx gold on the top step. They did not have any."

She lets his word about the little ones pass without an answer, but she doesn't go back from the hole either.

Pell speaks behind you: "No. Hearing him out isn't a promise to open it." He looks toward Kesh. "If the lamp makes him stand back, and the stairs grow hotter each winter, I'd want to know what opening that door would do to everyone living here." To you and Bram, he points things out without touching them: "Heavy gate here once. Gone a long time. Boot nail there, and a newer scrape low on the right. There's writing above the arch, too—not a script I know." He comes nearer you along the landing's edge, staying on the landing and keeping Bram in sight. "Kesh, did your clan burn the last visitors after they died, or did they die by fire? And do you know what became of their chisel?"

---

When you say *no*, Kesh goes very still. The warren behind her has started whispering again, and it stops when Kesh doesn't move.

"No," Kesh repeats. Then: "Kesh has asked that question to herself many winters."

When you ask about your hands, she answers at once, as if she has been waiting for it. "Black. Iron-black, in the cracks of the fingers. The chisel ones had it. They had worked cold iron a long time." Her milky eye goes over your open palms once more. "You have none."

When you tell her about the light, lent to you too, the knucklebones at her throat knock together as she pulls back a hand's width. For a moment you can't read her face at all. The candle shakes in its cup.

"Low," Kesh says, almost too quiet to hear. "Say that low. Sound goes down this stone. He hears feet on the top step, Ixx told you." She looks past your shoulder into the sloping passage for the length of a breath. Nothing comes up out of it but the slow warm air. When she speaks again it's still quiet, and it's an order: "Do not show it to him. Not first. Not for gold."

She answers the rest one question at a time, in order, the way a person counts out coin she has decided to spend.

"The lamp. They went at the lamp, not the door. Struck under it with the black iron. Ixx heard it ringing all the way up the slope. The Warm One spoke to them through the door while they struck. What he said, Kesh does not know."

"Burned, the man asks." She turns her head a little toward Pell, who has come nearer along the landing's edge. "Both. They died by fire, then we burned them. Proper, on our fire, so they do not walk. Three of them." She lets that sit. "The fire that killed them was not his. Not the lamp's. Down the slope there is a long hot room. Holes in the floor where the heat comes up, and little burning ones asleep in the walls. Iron rings near the holes and they wake. The chisel ones rang iron going back through it, and they ran with fire on them." Her claw tightens on the cup. "They did not sit. They did not ask. Kesh would have told them."

"The fourth one ran the other way, into the room of burnt paper, before the long room. With the chisel." A small dry sound in her throat. "We do not go in there. Kesh does not know if he came out. The chisel is where he is."

She comes to your last question and doesn't answer it right away. "When Kesh was small, the little lamp was like noon. You could not look at it." She looks at the band of yellow lantern-light on the floor between you. "Now it is like the top step at evening. When he says Arren's words it still goes bright, and he still goes back. But slower. Every winter, slower."

That's all she says about it. She doesn't say what she wants. She has told you how much the lamp has dimmed, to your face, and she leaves it lying there.

---

You hear Pell describe the sheared gate-pins, the gouge, the hobnail, and the band of letters above the arch; you're facing Kesh, so you haven't looked yet.

*(Out of game: you can read the band over the arch the moment you turn to look; you're facing Kesh this round.)*

---

Far down the slope, under the hum, the broom starts. *Shhk. Shhk.* Thin with distance, but getting louder. It's coming back up.

Kesh hears it before anyone. She draws back into the hole until the candle lights only her face and the dirt wall behind her, and she speaks only to you.

"Ixx comes with his answer. Before he is here, or after: come and sit at our fire, stone-turner. You. Not the iron." Her good eye goes to Bram, then to Pell, and back. "The elders are waiting. And there are things by our fire the man asked about. Better you see them sitting down."

She waits in the dark of the hole, the broom getting louder behind you.

Your journal, new:
+ Thread: The fourth of the chisel company

Where you are: kneeling at the warren hole by Kesh's candle · Time: Day 1 · afternoon
````

**Player** (player r8):

````text
Sefa nods once to Kesh. She keeps her voice as low as the old kobold asked.

"I'll come, Eldest. But let me hear Ixx's answer first, here, with the shield-man. Then I'll sit at your fire, and I'll keep the lamp to myself until you've told me why I should." She touches two fingers to the prayer beads, then lays them flat on the dirt at the hole's edge, a small promise. "Thank you for the warning."

She rises and turns, and as she does she looks up at the band of letters over the arch Pell pointed out. The Lantern's gift should make them plain at a glance, and she reads them before she goes back to the others.

Then she goes to Bram's shoulder and speaks barely above a breath, for him and Pell only:

"Kesh says sound carries down this stone, so keep it quiet. The chisel company went at the *lamp* on the door, not the door itself. They were cutting out the thing that keeps him back. The lamp's been fading for years; it was like noon when she was small, now it's like evening. Three of them died in a hot room further down, with fire-things in the walls that wake when iron rings. The fourth ran into a 'room of burnt paper' with the chisel and never came out." A pause. "And she told me not to show the Warm One what I carry. Not first, not for gold. I mean to listen to her."

If the band over the arch said anything worth knowing, she tells them that too, in the same low voice.

"When Ixx has said his piece, I'm going to sit with the elders. She asked for me alone. I'll stay where you can shout to me." She glances at Bram. "If he wants us down there, nobody walks through that long room carrying bare iron near the holes until I've heard everything Kesh has to say about it."

Then she turns to face the slope beside them, hands empty and visible, and waits for the broom to come up into the light.
````

### Screen 15 · player r9

````text
The shield-man speaks to you without looking away from the passage. "If you go in, you go in with empty hands and you don't go past Kesh's light. Pell stays at the mouth where he can see you and still call back. One shout, and I come through that hole shield-first, warren or no warren."

He shifts his weight back toward the stair, to a spot where the slope and the hole are both in front of him, and sends his voice down the slope, low and level: "Ixx. Up. We're at the landing, same as before." The broom answers it. *Shhk, shhk*, coming faster now.

Then he speaks to Kesh, without any edge: "You'll get your chat, Eldest, if she wants it. But first we hear what the Warm One sent." Kesh takes it with one dip of her snout.

Pell nods to Kesh. "Thank you. We'll mind the iron." Then, quietly, to you: "Go if you think it wise. I'll stay within calling distance. We can wait for you before going farther."

Kesh looks at your fingers on the dirt for a long moment. She puts one grey claw down beside them, not touching, and then draws it back into the dark with her candle.

"After," she says. "Kesh waits."

You stand and lift your eyes to the band above the arch.

The letters are cut deep and square, in a hand much older and steadier than Arren's hurried line on the lintel. The Lantern's gift makes them plain at once:

*THE CINDER CELLAR OF ULCASTER. WARDENS AND THEIR BIDDEN ONLY. STRIKE NO IRON ON THE BREATHING FLOOR.*

Pell goes back to the stair-side edge. He checks that his sheathed shortsword sits snug and his picks are rolled tight in their oiled cloth, then holds the lantern low with the shutter half down, so the light makes a pool on the slope.

Ixx comes up out of the dark into the pool of lantern light and stops ten feet from the shield-man's boot, the way he left. He's breathing fast through his snout. The fringe of his apron has curled and darkened, as if he stood close to an oven door, and the twigs of his broom smell scorched. He sets the broom down across the stone, then picks it up again and holds it crosswise.

He shakes himself once, hard, and looks at the shield-man. When he speaks it's the recited voice, word laid on word, and now and then something that isn't Ixx's comes through it, a turn of phrase too long for his mouth.

"The Warm One hears. Three freehands, ready to deal. Truth, not gold first." His tail tightens. "He laughs. Then he says.

"*Behind the door is the Warm One. Before the door is the stair, and the stair goes up to the sky. The Warm One was under the sky once. He wants it back. That is all the door is.*"

Ixx swallows and goes on.

"*The last ones. Four, with cold iron. They came to the door and the Warm One spoke to them, as he speaks now. They did not listen well. They rang iron in the long hall going back, and the house woke and burned them. The Warm One did not touch them. The house of Ulcaster bites iron. Ask the little ones, they carried what was left.*"

He gives the warren hole a quick look, then turns back.

"*The shield-man sets terms. Good. Terms are said to faces. Come down to the door, all three, and the Warm One gives the rest to faces. Gold is after. He does not say gold first.*" Ixx stops. His jaw works. "Then he says, for the long hall: *walk soft, keep iron quiet, step where the broom steps.* He says Ixx sweeps you through." His tail is wound twice round his ankle now. "He wants you whole. He says so."

That's the end of the message. Ixx's own voice comes back, smaller.

"He is pleased. Pleased is good." He doesn't sound sure of it.

Behind the hole the warren is silent. Kesh's candle has come back to the edge of the dark. Her good eye is on Ixx's scorched apron, not on the tall ones.

Ixx looks from the shield-man to you to Pell, and his eyes go last to the hole in the wall.

"Now, or after the elders," he says. "Ixx waits. Ixx sweeps you down when you say."

Where you are: landing beside Bram, near the warren hole · Time: Day 1 · afternoon
````

**Player** (player r9):

````text
Sefa keeps her eyes on Ixx's scorched apron for a moment longer than on his face. Then she speaks to the shield-man and Pell, barely above a breath:

"Over the arch, in an old, steady hand: *The Cinder Cellar of Ulcaster. Wardens and their bidden only. Strike no iron on the breathing floor.*" A small pause. "Ulcaster. I've heard that name in Beregost, some old school of mages that burned. And mark this: he says four came, and the house burned all four. Kesh says three burned, and the fourth ran into the burnt-paper room with the chisel and never came out. Either he doesn't know where that man went, or he'd rather we didn't go looking." She lets that sit. "He wants us *whole*. A man who wants a door opened wants his hands whole too."

Then she turns to Ixx and crouches again, so she isn't looking down on him.

"Thank you, Ixx. You carried it well, every word." She nods at his apron and the scorched twigs. "You stood close to him to bring it. Are you burned anywhere? If you are, show me. I was a healer before I was anything else."

If he's hurt, she'll lay a hand near it and quietly offer the Lantern's warmth, a single die's worth, no more, and she'll keep it small and hidden in her palm.

"Tell the Warm One we heard him, and we'll come to the door and say our terms to his face. But not yet. Kesh has asked me to sit at the clan's fire first, and it's rude to keep an eldest waiting." She gives him a small smile. "Will you wait here with the shield-man and Pell? Sweep the landing if you like. They won't mind."

She rises, touches Bram's arm once in passing, *I'll be within a shout*, and goes back to the hole with her hands empty and open. At the edge of Kesh's candlelight she stops and bows her head slightly.

"Eldest. I've heard his answer. Now I'll hear yours."

She ducks through, low, and goes no farther than the candlelight reaches.
````

### Screen 16 · player r10

````text
Bram lets the message settle. Then he looks at Ixx and gives the kobold a single nod.

"Tell the Warm One this from me," he says. "We'll come down to his door. We'll walk soft, we'll keep our iron quiet, and we'll step where your broom steps." He taps his shield once with the flat of his thumb. "But we come when we've heard what the elders have to say. Good talk's like good road: better walked by daylight than in the dark, and we have a little of both yet."

He turns to you and says, low but open: "Go to Kesh. Empty your hands of anything that might chime, and leave the book at your belt, not in your hand. I'll hold here. Pell, stand at the warren's mouth with the light low. If she calls, or if anything moves that shouldn't, I come through that hole. If I call, she comes out at once, no argument."

Then, to Kesh's candle at the dark: "Eldest. One question before she sits with you: what wakes the things in the long hall? Is it any iron at all, or only iron that rings? A man in mail walks heavy, and I'd rather know the difference before I set foot on that floor." He plants his shield once more, eyes already moving to the passage. "And if the Warm One grows tired of waiting while we talk, let him wait a few minutes more. He's been down here a long time. A little patience won't kill him."

Pell keeps his voice quiet. "After the elders. No sense ignoring advice the last company didn't stop to hear." Then, to the kobold: "Ixx, your apron's singed. Was that the usual heat down there, or did something happen while you gave our message?" He glances toward you and settles near the warren's mouth, leaving you room to pass and keeping the slope in view. "And before we walk it, can you show us how to make our gear safe? I can bind loose metal, but Bram's wearing a fair bit of it. Does iron have to strike the floor, or will mail ringing against itself wake the house?"

---

Bram's message goes down to Ixx in the same plain voice as the terms. The kobold takes it word by word, and his lips move as he lays each piece in order: *come down… walk soft… iron quiet… where the broom steps… after the elders.* At *good road* and *daylight* his head tips to one side, but he lets those go.

At *a little patience won't kill him*, he stops moving his lips.

Kesh answers Bram's question from the hole. Her candle stays where it is and she doesn't come out to the iron.

"Feet, no. Floor hears feet all day. Ixx's feet, goats' feet." Her good eye goes down the rings of his mail to his belt. "Ringing wakes them. Iron that knocks on iron, iron that knocks on stone. Far from the holes they sleep deep. Near the holes they sleep light, like old ones." She stops a moment. "Your rings talk to each other, shield-man. Every step, a little. Little talk near a hole, they turn over in their sleep. Big talk, they wake." Her eye drops lower, to his boots. "Chisel ones had iron in their feet too. Every step, on the stone."

You pass the band over the arch to Bram and Pell under your breath, and what doesn't fit, low enough that it doesn't carry to the kobold ten feet down the slope.

When you crouch and ask about burns, Ixx looks at you as if you'd asked about something on someone else. Then he holds out his claws, backs up, the way you'd show a cook your hands. The scales across the knuckles have gone dull and powdery, like brick left too near a hearth, and they're warm when you lay your fingers close. The skin under them is whole. Nothing is blistered and nothing is weeping. His snout is the same. Whatever he stood close to, his scales took it.

"Scales are for hot," he says. Then, more quietly: "Nobody asks Ixx that."

He doesn't take his claws back right away.

When you ask him to wait on the landing, he looks at the hole, at Bram, and down the slope, and he shakes his head.

"Ixx cannot wait. Warm One counts. Ixx is gone short, he counts short. Ixx is gone long, he asks why." His tail creeps round his ankle. "Ixx goes, tells. When tall ones come, shield-man calls down. Ixx hears. Ixx comes up and sweeps."

Pell's question about the apron gets a longer answer than Ixx has given anyone so far.

"Warm One laughs. Laugh is hot." He plucks at the curled fringe. "Ixx stands close because he talks low. When he laughs, hot comes out round the door, by the edges." He looks up at Pell. "Before, the door keeps all the hot. Ixx stands there many winters, apron is fine. This winter, edges let some."

The question about gear makes him look down at himself, at the twigs and the sack-cloth and his bare claws. "Ixx has no iron." Then he turns to the hole.

Kesh barks one word over her shoulder into the dark. Something scuffles, small claws on dirt. A moment later a bundle comes shoving out through the hole at knee height, pushed by hands too small to see: greasy unwashed goat fleeces, half a dozen of them, rank enough to make Pell's eyes water, tied with lengths of dried gut.

"Goats are his," Kesh says. "Skins are ours."

Ixx crouches by the bundle and shows Pell what to do, and Bram too, since it's mostly for him. He takes a fleece and folds it wool-side in over the scabbard of Pell's sheathed shortsword, where the chape would knock against a thigh or a wall, then binds it round twice with gut and a knot that pulls tight. He holds up a second fleece toward Bram's mail and mimes wrapping it across a shoulder and round a hip. Then he pats the air low, over the place where a sword hangs. He doesn't touch the iron himself. He only shows where.

Then he gets up, takes his broom, and stops at the mouth of the slope.

"Ixx tells him the first words. Come down, walk soft, iron quiet, after the elders." His eyes go to Bram and flick away again. "Last words, Ixx does not carry."

He goes. *Shhk, shhk.* The sound thins down the passage and the hum swallows it.

---

You bow your head at the edge of Kesh's candlelight and duck through.

The hole runs only a few feet through the wall, and then the tunnel opens out. Beyond the little pool of the candle is a low hall dug out of the hill's earth. Timber props stand under a ceiling of roots, and the floor is trodden hard. In the middle a fire of dried dung and tallow burns low in a ring of stones and gives off more smoke than light. All round the walls are scooped niches heaped with goat fleece, and in the niches and along the walls there are kobolds. You stop counting at forty. They're pressed flat and still, with their eyes catching the fire like coals. Smaller eyes look out between the legs of the bigger ones and from under the fleeces. One of the little ones gets free and runs a few steps toward you before a grown claw hooks it back by the tail. It squeaks, and everything goes quiet again.

Kesh doesn't lead you further in. She lowers herself onto the dirt just where her own light ends and sets the clay cup down beside her knee.

"You stop at Kesh's light. Shield-man said it, Kesh heard." She settles her knucklebones on her chest. "Kesh stops at iron. Each has a place. So the fire comes to you."

She barks again, softer this time. Two elders come out of the ring by the fire, a thin grey male with a sling coiled at his belt and a heavy female with a little one on her back. They bring two things between them and set them down in the candlelight in front of you, then back away.

The first is a basket of woven goat hair. It's full of bones, burnt brittle and grey-white and broken small, the way bones come out of a pyre that was kept going a long time. Near the top three lower jaws are laid side by side, set out on purpose so anyone can count them.

The second is an iron helmet, a plain round cap with a nasal bar, the kind a hired blade buys secondhand in any town on the Way. The left side has slumped. The iron has run like tallow by a hearth and set again in hard drips along the rim, and above the ear there's a hole melted clean through, as wide as two fingers. The leather lining is gone. Inside, the crown has gone blue-black and rainbow-coloured in rings.

"Chisel ones," Kesh says. "Three. The man asked: did they die by fire, or did we burn them after. You see both." She turns her head toward the helmet but doesn't touch it. "The hat is from the long room. It was like that when we brought it out."

She doesn't say anything for a while. The fire pops. Behind you, Pell's lantern makes a faint yellow edge round the hole.

"You asked for Kesh's answer." The old kobold keeps her voice so low that the elders by the fire lean in. "He said four, and the house burned four. Kesh says three. Kesh has said it, and Kesh will not say it again louder."

Then she looks at your hands again, the way she did the first time.

"Kesh asks now. One thing." Her good eye comes up. "Lent light. Can it be lent on? To a lamp that is going out?"

Where you are: just inside the kobold warren, at the edge of Kesh's candlelight · Time: Day 1 · afternoon
````

**Player** (player r10):

````text
Sefa kneels at the edge of the candlelight. Before she answers she bows her head over the basket of bones, touches her prayer beads, and murmurs the short words the hospice said over the dead it couldn't save. She doesn't touch the jaws or the ruined helmet. Then she looks up at Kesh and keeps her voice as low as the old kobold's.

"I don't know, Eldest. That's the true answer, and I won't dress it up." She turns her hands over in the light, empty. "What I carry was lent to *me*, for the sick and the dying. I've never tried to pour it into a stone or a lamp. I don't know if it would take, or what it would cost, or who'd come asking for payment." A breath. "But the sign over your arch is a lantern, and the one I answer to I call the Lantern. That isn't nothing. Whoever lit that lamp on the door may have drawn from the same well I do."

She leans a little closer to the fire.

"So I won't promise. But I'll look. I'll go down, stand before the door, and listen to him, and I'll look at that little lamp with my own eyes. I'll read Arren's words under it. If there's a way to feed it, the words may say so. I won't show him what I carry. You told me not to, and I believe you." Softer: "If there's a way, I'll try. Not for gold. For the little ones, and for the man who wrote *kept, not killed*."

She glances once at the helmet, then back.

"Help me first, if you can. The room of burnt paper: is it Ulcaster's, from when this was a house of wardens? Do your people know what's in there, besides the fourth man? And the lamp on the door. Is it shaped like the one over your arch, with a ring handle and one drop of flame?" She pauses. "And one last thing, Eldest, because I'd rather ask it here than learn it down there. If the lamp burned bright again, like noon, and the Warm One stayed shut in for good, what happens to your clan? Would he still need a broom?"

She waits, hands open on her knees, and listens.
````

### Screen 17 · player r11

````text
You bow your head over the basket and say the short words. They're the plain hospice ones for the dead nobody could save, said low and quickly, the way they were said on the ward between one bed and the next. You keep your hands off the jaws and the ruined helmet.

The warren hears it. Nobody speaks, but there's a stir along the wall niches, small heads turning toward each other. The heavy female with the little one on her back comes two steps out of the ring, stops, and puts one claw flat on the rim of the basket. She holds it there for as long as the words last, then goes back to the fire without looking at anyone.

Kesh watches all of it with her good eye. When you say *I don't know, Eldest*, the old kobold's snout comes up a little, the way it did for Bram's *no promises*. She hears you out to the end: *I'll look. Not for gold. For the little ones, and for the man who wrote kept, not killed.* She doesn't thank you. She takes it the way you'd take a coin you're going to bite later, carefully, without closing her claw on it yet.

Then she answers your questions in order.

"Burnt paper." She lifts her chin toward the slope beyond the wall. "Down the long way, before the hot room. A door on the left. The wood is black, but it stands. Inside are shelves, tall as two of you, and paper on them, all black. Touch it and it falls. When the Warm One was new here, a little one went in and came out grey to the elbows. Grey, not burnt. The paper was burnt long before us." She pauses. "That room is the wardens'. The Warm One does not like it. He cannot see in there and he cannot hear in there. So we do not go."

"The fourth one." Her voice drops lower. "He called out two nights from in there. Tall-folk words, the same ones over and over. Then he stopped." The flame in the clay cup stands straight. "The ones who carried the hat said the three ran with fire on them. The fourth ran with light. Something small in his hand, and light between the fingers."

She leaves that alone and moves on.

"The lamp on the door. Yes. Ring on top, one drop inside, same as the arch." She raises one grey claw and draws the shape in the air between you: the ring, the drop. Then she touches the tip of the claw to the bottom of the drop she has just drawn. "Here. Since the chisel ones, a bite out of it. Small. Like a chipped tooth."

She lowers the claw.

When she comes to your last question she doesn't answer right away. Behind her, the fire pops and settles.

"Yes," she says. "He would need us. Goats. News. Feet on the stair. While the door holds, he cannot do without us. We are his hands." The milky eye turns toward the dark at the back of the warren, where the little ones are thickest. "If the door opens, he has hands of his own again."

She lets it lie there. She hasn't said what she wants, and she doesn't say it now, but she doesn't take back what she has said either.

After a while she reaches across the edge of her own light, the place she said she wouldn't cross, and lays two claws flat on the dirt beside your knee. It's the same thing you did at the hole.

"Stone-turner. When you have looked at the lamp, and read the scratches under it. Before you do anything with your hands." Her voice is barely more than the hiss of the candle. "Come up and tell Kesh what you saw. Will you?"

*(Out of game: your hospice words over the dead happened as described. Nothing about saying them was in doubt, so no roll was needed.)*

*(Out of game: going down to the door is something you mean to do later, not this round. You're still at Kesh's fire, and the turn stopped on Kesh's question: will you come back up and tell her what you saw before you do anything with your hands?)*

Your journal, new:
+ Thread: Kesh's ask: tell her what you saw

Where you are: at Kesh's fire in the kobold warren · Time: Day 1 · afternoon
````

**Player** (player r11):

````text
Sefa looks down at the two grey claws on the dirt beside her knee. Then she lays her own fingers flat beside them, close but not touching, the way Kesh did at the hole.

"Yes, Eldest. I'll come up and tell you what I saw before I put a hand to anything. That's a promise, the same as the stone."

She stays a moment longer, thinking about what Kesh said about the light, then speaks very quietly.

"The fourth man ran with light between his fingers. And since the chisel ones, there's a bite out of the lamp's flame." She meets Kesh's good eye. "I think he carried a piece of it away. Into the one room the Warm One can't see or hear." A breath. "If that piece is still in there, with him, it may be the first thing worth bringing back to the door."

She bows her head to Kesh, then to the heavy female by the fire, and her eyes go once to the little ones under the fleeces.

"Thank you for the bones and the hat. Telling a stranger the truth costs something. I know that."

Then she ducks back out through the hole onto the landing, brushing the earth off her knees, and goes straight to Bram and Pell. She keeps her voice so low they'll have to lean in.

"Three jaws in a basket. Three burned, not four. The helmet's melted clean through. The long room did that, not the Warm One." She swallows. "The fourth man ran into the burnt-paper room, the wardens' room, with something small and *shining* in his hand. Kesh says since the chisel company the lamp on the door has a chip out of the bottom of its flame. And the Warm One can't see or hear inside that room. That's why he says four burned. He doesn't know."

She looks at each of them.

"And the rest of it: while the door holds, the clan are his hands. If it opens, he doesn't need them. Kesh wouldn't say what she wants, but she didn't have to."

She nods at the reeking fleeces. "We wrap our iron, all of it, the way Ixx showed. Bram, I'll help you with the mail. Then I want to go into that room before we stand in front of him. It's the one place on this road he can't listen to us, and the one thing he'd rather we didn't find may be lying in there with a dead man." A small, tight smile. "Ixx said he'll count. Let him. We'll call down for the broom once we're wrapped, and tell Ixx we stop at the wardens' door first. If that sends him running to his master, then we'll know something too."

She picks up a fleece, wrinkles her nose, and holds it out to Bram.

"Shoulder first. Hold still."
````

### Screen 18 · player r12

````text
You lay your fingers flat on the dirt beside the two grey claws. You don't touch them, the way Kesh didn't touch yours at the hole. The old kobold looks down at your four fingers for a moment, and then the claws go back across the edge of the light, slowly, to her own side.

"Kesh heard. Like the stone."

Then you say your guess aloud, very quietly: the light between the fourth man's fingers, the bite out of the lamp's flame, the one room the Warm One can't see or hear. Kesh goes completely still. Behind her the dung fire settles, and one of the little ones under the fleeces sneezes. Nobody hushes it, because every grown kobold along the walls is watching the eldest.

She stays silent a long time.

"Kesh does not know what he carried," she says at last. "Kesh knows the lamp had no bite before, and had one after." Her good eye stays on your face. "If it is in there, it is the wardens'. Their room. Their thing." She leans in a hand's width. "Back to the lamp, stone-turner. Not past it."

She doesn't say what lies past the lamp, and she doesn't need to point.

"And wrap your hands for the paper. Grey to the elbows, the little one was. Grey for a tenday after."

When you bow your head to the heavy female by the fire, the elder dips her snout once in return. The little one on her back has been watching you over its mother's shoulder the whole time. It lifts one tiny claw, uncertain, as if it has seen someone wave and wants to try it. Its mother doesn't stop it.

You thank Kesh for the bones and the hat. The eldest takes the thanks the way she took the promise, without a word. She lifts the clay cup so its light follows you to the mouth of the hole.

---

You duck back through onto the landing and brush the dirt off your knees. It's warmer out here than by the clan's fire, and drier, and the hum is under your boots again.

Bram is under the vault where you left him, but he doesn't look the same. A goat fleece hangs across his shoulders like a carter's rain-cloak. More are bound with gut round his scabbard, over the heads of his javelins and round his hip. Every knot is pulled tight. Pell sits by the lantern on the stair side with the shutter low, and a fleece is wound round his daggers too. The smell reaches you before you reach them.

You go to them and give them all of it in a voice so low they have to lean in: three jaws, the helmet melted through, the long room and not the Warm One. The fourth man went into the wardens' room with something small and shining in his hand, and the lamp has had a chip at the bottom of its flame since then. The Warm One can't see or hear in that room, which is why he says four. The clan are his hands only while the door holds.

Your voice hardly carries past their bent heads. Far below, under the hum, nothing changes. The warm air comes up the slope at its old slow pace, and the lantern flame doesn't lean.

The slope stays quiet. You lay out what you want: wrap the iron, call for the broom, stop at the wardens' door first, and see whether that sends Ixx running.

One fleece is left in the bundle Ixx unrolled, lying by the stair, stiff and rank. You pick it up, wrinkle your nose, and hold it out to Bram.

"Shoulder first. Hold still."

Across his shoulders the first fleece is already tied off and tucked under his belt.

*(Out of game: Bram and Pell wrapped their gear while you were inside, so his shoulders, scabbard, javelins and hip are done. This last fleece is the only one left, and your own dagger is still bare.)*

Your records, changed:
Carried: + Greasy goat fleece

Where you are: the landing under the vault, outside the kobold hole · Time: Day 1 · afternoon
````

**Player** (player r12):

````text
Sefa looks at Bram's shoulders, already tied off and tucked, and lowers the fleece with a short, rueful breath.

"You were quicker than me. Good." She keeps her voice down. "Then this one's mine."

She kneels by the lantern and works fast. She draws her dagger and folds the fleece's thickest corner wool-side in over the blade and crossguard, then binds it twice with a length of gut the way Ixx showed, pulling the knot tight before she slides it back into its sheath. She tugs at it once to make sure nothing knocks. Then she runs her palm down her studded leather, feeling for rivets that might click against each other or a wall, and tucks what's left of the fleece under her belt over the worst of them.

The rest she tears into two rough strips with her hands and teeth and holds them up for the others to see.

"For the paper room. Kesh says a little one went in and came out grey to the elbows, grey for a tenday. Wrap your hands before you touch anything in there. Don't breathe it in, either." She hands one strip to Pell. "You'll be touching more than I will."

She stands, checks that the Book sits quiet at her belt, and looks at both of them.

"Order going down: Ixx sweeps, Bram behind him, Pell with the light low, me at the back. We step where the broom steps. Nobody stops near a hole in the floor. At the wardens' door, the black one on the left, we go in, and Ixx can wait outside or come, whichever he likes. If he balks, we let him tell his master. I'd rather the Warm One knew we'd gone in than have Ixx lie to him for us and pay for it." A pause. "Ready?"

When they are, she steps to the head of the slope and calls down, soft and clear, pitched to carry on the stone but no louder than it has to be:

"Ixx. We've sat with the elders, and we're wrapped. Come up and sweep for us, please."

Then she waits at the head of the passage with her hands empty and her eyes on that dull orange smudge far below, listening for the broom.
````

### Screen 19 · player r13

````text
You lower the fleece and let out a short breath, then kneel by Pell's lantern and get to work. You fold the thickest corner of the fleece wool-side in over the blade and crossguard of your hospice knife, bind it twice round with gut the way Ixx showed, and pull the knot until it bites. The dagger goes back into its sheath, and when you tug at it nothing knocks. You run your palm down the front of your studded leather, feeling for studs that could click against each other or catch on a wall, and tuck a fold of the fleece under your belt over the worst of them.

The rest of the fleece doesn't want to tear. The hide is old and stiff with grease, and you have to set your teeth in it and pull with both hands before it gives along the edge with a dull rip. You spit twice. It tastes exactly the way it smells. In the end you have two ragged strips, and you hold one out to Pell.

You check that the Book sits quiet at your belt and give the others the order of march in a low voice.

"Slow feet, quiet iron," Pell murmurs. "Understood."

*(Out of game: you came out of the warren at the end of last round, so Bram and Pell already have you on the landing with them. Pell's "understood" is taken as his answer to your "Ready?", and Bram still has the moment before Ixx arrives to stop or change anything.)*

You step to the head of the slope with your hands empty and pitch your voice to carry on the stone and no further, and call down to Ixx.

At the hole behind you, the candle at the edge of the dark draws back a hand's width and stays there.

The answer comes sooner than any of you expect. *Shhk, shhk.* The broom is already well up the passage, as if Ixx had been waiting partway down rather than at the bottom. It climbs fast, faster than he has swept so far.

He comes up into the pool of lantern light and stops ten feet below the landing. He holds the broom crosswise and stays there with his eyes on the fleeces. He takes in Bram's shoulders and hip, the wrapped javelins, Pell's daggers and your knife, and his nostrils work. For a moment he looks very nearly proud of you all.

Then the recited voice comes, word laid on word.

"The Warm One counts. He says: *elders talk long.* He says: *the Warm One is patient.*" Ixx swallows. "He says *patient* two times."

His tail has wound itself round his ankle. He waits a breath, but there's no more message, and when he speaks again it's in his own voice.

"Ixx sweeps. Down now?"

Your records, changed:
Carried: + Fleece hand-wrap strip ×2

Where you are: the head of the slope, on the landing · Time: Day 1 · afternoon
````

**Player** (player r13):

````text
Sefa takes the second strip of fleece from her belt and presses it into Pell's free hand without a word. Then she turns to the kobold and crouches at the lip of the slope, so she isn't standing over him.

"Down now, Ixx. Thank you for coming so quickly." She glances at his tail wound round his ankle, and her voice stays gentle. "Two times patient. We heard."

She lets a breath go before the next part, and says it plainly so he won't have to guess at it.

"There's a black door on the left, before the long hot room. The wardens' room. We're going to stop there first and look inside. Only look, and we'll be careful with our hands." She holds his eyes. "You don't have to come in. You can wait at the door, or go on and tell the Warm One where we are. If he asks, tell him the truth: the stone-turner wanted to see the wardens' room before the wardens' door. That's mine to answer for, not yours."

She rises, settles into the back of the line behind Pell's low lantern, and looks once over her shoulder at the hole in the wall, where the candle still waits a hand's width back in the dark.

"Sweep on, Ixx. We'll step where you step."

As they start down she keeps her eyes moving over the walls and the floor ahead, counting under her breath again, and watching for the first holes in the stone where the heat comes up. If she sees one, she'll touch Pell's shoulder and point before anyone's boot comes near it.
````

### Screen 20 · player r14

````text
Bram takes up his shield and steps to the head of the slope, just behind the edge of your lantern-light. He rolls his shoulders once, and all that comes from under the fleece is the soft rub of wool on wool. He gives Ixx a single nod.

"Down now. Ixx, you sweep ahead of us—same as before, ten feet, no more. You stop where the broom stops. We don't pass you."

He glances back once at you and Pell. "Order as she set it. I'm behind the broom. Pell, light low and on the floor, not on the walls. Sefa, last, and keep two steps between you and Pell. If I say *hold*, we all hold. If I say *back*, we turn on the spot we're standing and walk out at my pace. No one runs."

Then, quieter, to Ixx: "Tell him we're on our way. And Ixx—if the brood's watching, keep them off the foot of the stairs behind us. We don't want little feet near that long room." He sets his shield toward the dark. "Lead on."

Pell takes the strip from you. "Thanks. What else did Kesh tell you we need to know before we reach that room?" He tucks it into his belt where he can reach it, which leaves his hands free for the lantern. "Down now, Ixx. We want to look in the burnt-paper room on the way. You needn't go inside, and we won't ask you to hide it from the Warm One." He falls in behind Bram, keeping the light low.

---

Ixx takes Bram's order the way he takes a message, mouthing the words as he hears them. When Bram asks him to keep the brood off the foot of the stair, he answers without stopping to think.

"Little ones do not go down the slope. Never. Kesh keeps them." He looks at the hole in the wall. "Kesh hears you anyway."

At the edge of the hole the candle goes out of sight.

When you tell him about the black door, Ixx goes completely still. His claws close on the broom handle, and air leaks out between his teeth in a short, wet hiss.

"Wardens' room." He says it under his breath, the way Kesh said *Arren*. "He cannot see in there. Cannot hear in there." His eyes go down the passage toward the orange smudge and back to you. "Ixx does not go in."

The next part takes him longer. "Ixx tells true. Stone-turner wants to see. Stone-turner answers." He tries the words over once more under his breath, and that seems to settle him. His tail stays wound round his ankle, but the rest of him no longer looks braced to run. "Ixx does not have to make words up. Good."

When Pell says the same thing his own way, Ixx gives him a small bob of the head and turns to the slope.

*Shhk, shhk.* You go down.

The passage is ten feet wide and built like the lower stair: dressed blocks fitted without mortar, with the little tower cut low on a stone every so often. The slope is gentle, but it never levels off. A shallow groove runs down the middle of the floor, worn by a lot of feet over a lot of years, and that is where Ixx sweeps. Bram keeps ten feet behind him. Pell comes next with the lantern shutter down, and the light makes a yellow pool round your boots that reaches no farther than the stone just ahead. You walk two steps behind Pell, counting under your breath.

The heat climbs as you go. By your fortieth pace the air is like a bakehouse with the oven doors open. The hum gets louder too. You don't hear it so much as feel it coming up through the soles of your boots. The walls have shoulder-height niches like the stair, but no kobold has left a candle in any of them here.

You watch the floor the whole way. Here it's solid stone and nothing more, swept clean and not even warm enough to notice through your boots.

About a hundred and fifty feet down, the left-hand wall changes.

A door is set into it under a squared arch. It's broad and made of oak, and the oak is charred black all over, crazed into little squares like a log pulled out of a fire. It still stands, and it's shut. Its three hinges are dull green with age: bronze, not iron. Over the arch is a single carving, a lantern with a ring handle and one drop of flame, and no tower above it this time.

At hand height on the door's edge there's a smear. It's a palm-print, darker than the char around it, with four fingers dragged down from it, as if someone pushed the door shut behind him while he was going down. The door doesn't sit flush. There's a gap the width of a finger between its edge and the jamb, and the air coming out of it is cool, the first air in the whole cellar that hasn't been warm.

Beyond the door the passage keeps sloping down. At the far edge of the light, forty feet or so on, the orange starts to show on the walls. You can just make out the floor there: dark round openings in the stone, two and then a third, each with a faint shimmer of heat over it. They're well past where anyone means to set a foot tonight.

Ixx stops ten feet short of the door, as he was told. He won't look at the lantern carved over the arch.

"Here. Black door." He shifts the broom from one claw to the other. "Ixx goes. Tells. Stone-turner looks at wardens' room." He hesitates. "When tall ones come out, call down. Ixx comes, sweeps the long room. Ixx knows where the holes sleep light."

He turns and goes down toward the orange, sweeping the whole way. The sound of the broom thins and blurs, and the hum swallows it.

The three of you stand at the black door, the lantern pool at your feet and cool air coming out of the gap. Nobody has touched the door.

Your records, changed:
Carried: + Fleece hand-wrap strip; − Fleece hand-wrap strip ×2

Where you are: at the charred black door, sloping passage · Time: Day 1 · afternoon
````

**Player** (player r14):

````text
Sefa winds the strip of fleece round her right hand, wool inward, and ties it off with her teeth. She doesn't reach for the door yet. She stands looking at the dragged palm-print for a moment, then answers Pell, low.

"What else Kesh told me: the paper in there falls to grey at a touch. It's old burning, from before the Warm One. The fourth man called out for two nights from inside, the same tall-folk words over and over, and then stopped." She nods at the print. "That's likely him, shutting the door behind himself. And she said one more thing: *back to the lamp, stone-turner, not past it.* If we find what he carried, it goes back where it came from. Nowhere else."

She glances down the slope where Ixx went, then at the carving over the arch. It's a lantern with no tower this time.

"Bronze hinges. No iron in this door at all. Whoever built this room didn't want it to ring." She breathes in the cool air from the gap. "And it's cold in there. The only cold place in the whole cellar."

She steps back half a pace to give Pell the door.

"Pell, it's your trade. Look it over before anyone pushes, top to bottom. If it's clean, open it slowly, a hand's width at a time. Bram, watch the slope, not the room."

While Pell works, she bends close to the finger-wide gap, careful not to touch the char, and listens. Then she speaks softly into the dark beyond, the way she'd speak at the curtain of a sick bed before going in:

"We're coming in. We mean no harm to whoever's within, living or dead. We've come for what was taken from the door, and to put it back."

When the door opens, she won't step in first. She'll lift her wrapped hand and quietly cast Light on her own glove, a small steady glow that doesn't need the lantern. Then she'll look over the shelves, the floor, and whatever lies near the threshold before she sets a foot inside.
````

### Screen 21 · player r15

````text
Bram stops at the edge of the cool air and lets it run over his face before he moves.

"Hold." He doesn't take his eyes off the door. "Pell, look at the edge and the hinges before we put hands on it. The print says someone shut it from the inside as he went down—or was dragged down and threw his hand back for purchase. I want to know if it's wedged, barred, or watched."

He angles his shield across his body and sets himself between the door and the slope. "Sefa, keep the light off the walls and watch the passage. If that orange flutters or Ixx stops sweeping, call it." He pauses. "And if this is the room Kesh won't walk into, we don't leave anyone alone inside it. Two in, one at the door always. The one at the door stands where I stand now, facing out."

Then he turns and plants himself facing out, toward the orange glow at the far edge of the light. He says it once and leaves it there.

Pell raises the lantern a little and crouches at the door, keeping clear of the palm-print. "Cool air, bronze hinges. Let me check it before we push."

---

You wind the fleece strip round your right hand, wool side in, and pull the knot tight with your teeth, answering Pell's question from the slope as you do. Behind you the hum is going, like a mill heard through a thick wall. You look at the bronze hinges, then at the lantern carved over the arch with no tower above it, and step back half a pace to give Pell the door.

You bend to the finger-wide gap, keeping your face off the char, and listen.

There's nothing to hear. It isn't the held-breath quiet of the warren. It's the quiet of a shut room where nothing has moved for a long while. Cool air comes out past your cheek and smells of old paper.

You speak into the gap, the way you'd speak at the curtain round a sick bed. Nothing answers you.

---

Pell crouches with the lantern raised a little, his face turned away from the opening, and goes over the door from the top down. A bronze ring on the outside serves for a pull, green like the hinges. Ash has drifted along the threshold, fine and pale grey, like hearth-sweepings. The draught out of the gap has blown it into a little ridge against the stone. It lies on your side of the sill as well, a hand's width out into the passage.

Pell winds his strip round his left hand, takes the ring in his right, and lifts as he pushes so the foot of the door won't drag. It swings inward, a hand's width and then another. The bronze turns stiffly, with one low dry note as the hinges give, and then it opens without a scrape.

You raise your wrapped hand and touch two fingers to the fleece. Light wells up in the wool, steady and white like a candle behind horn, and spreads out from your fist into the doorway.

At your hip, the Book of Shadows goes warm. It isn't much, only the warmth of a hand laid flat against you through the leather. It comes as the door opens and it stays.

---

The room is longer than it is wide, perhaps forty feet deep and half that across. The shelves Kesh described run back in rows from the door, dark oak twice Bram's height, and every shelf is full. The books still stand in their places, spines out, packed shoulder to shoulder. They're all black. They look like logs pulled whole out of a fire: they've kept their shape, but every edge is crazed and soft-looking, and nobody would want to breathe near them.

Ash covers the floor an inch deep, grey and level as new snow, except where it has been walked through.

There's one line of tracks. Hobnailed boots go in from the threshold, wavering, and one foot drags in a long furrow, step after step, down the middle aisle between the shelves.

Something lies in the ash just inside the door, a pace to the left, where a man would drop whatever he held to free his hand for the door. It's a chisel as long as a forearm, of black iron gone dull, with a mushroomed striking head. Nothing has settled on it. Its own fall has thrown the ash back from it in a little ring.

The tracks go on past the reach of your light and Pell's lantern, to the far end of the room.

Down there, between the last two shelves and low near the floor, there's another light. It's faint, no stronger than a coal seen through a cupped hand, and it isn't the colour of yours or of the lantern. It's paler than either, a white-gold, like the top step at evening. At the very edge of where the light gives out, two boot soles are turned toward the door, their hobnails catching a gleam.

Nothing moves in there, and no ash stirs.

Out on the slope, in front of Bram's shield, the orange glow stays where it is, and nothing comes up the passage.

Your records, changed:
Conditions: Light on her hand-wrap (1 hour)

Where you are: at the threshold of the burnt library · Time: Day 1 · afternoon
````

**Player** (player r15):

````text
Sefa keeps her glowing fist low, angled at the floor, and doesn't step in yet. She speaks over her shoulder in a breath.

"Chisel's just inside, on the left. Nobody touch it, nobody kick it. It's the one thing in here that could ring." A pause. "Tracks go all the way to the back. There's a light down there, white-gold, like the lamp Kesh drew. And boots. I think he's still here."

She lays her free hand flat on the Book at her hip for a moment. "And this went warm when the door opened. It hasn't done that before. I don't know yet if that's good."

She pulls the loose end of her fleece up over her nose and mouth and ties it off behind her head, rank as it is. Better goat than ash in the lungs.

"Bram, door, facing out, as you said. Pell, with me, two paces behind. Walk in his prints, in the furrow where the ash is already broken. Don't brush the shelves. If anything falls, let it fall."

Then she goes in, slowly, setting each boot down inside the dead man's hobnail tracks. She gives the chisel a wide berth on her right and keeps her light on the floor ahead and the shelf-ends on either side. She's watching for anything that isn't ash and black books: writing on the shelves or the floor, a second set of tracks, anything that moved since.

Halfway down the aisle she stops and calls softly toward the far end, the way she'd speak to a patient whose name she didn't know yet:

"Peace to you. I'm Sefa, from the hospice in the Lower City. Kesh heard you calling, two nights. I'm sorry no one came sooner."

If nothing answers, she walks the rest of the way. At the last two shelves she crouches beside the boots, still not touching anything. She looks first at the man: is he dead, and how long? What's in his hand, or near it, giving off that light? Is there anything written or scratched in the ash or on the wall where he lay? If there are words, she reads them before she does anything else.
````

### Screen 22 · player r16

````text
Behind you Pell says, "Chisel just inside, left. Boots at the far end, and a light beside them." He pulls a fold of cloth over his nose and mouth. Bram stays at the door with his back to the room and his shield across his body, facing down the slope.

The fleece is rank over your face, and it's better than ash. You go in.

You step wide of the chisel on your right and set your boots down inside the dead man's prints, in the furrow where the ash is already broken. Pell comes two paces behind you with the lantern held forward and low and puts his feet where yours have been. "Nothing bare-handed," he says quietly, "and that light stays where it is until we know what it is."

The air in here is cold enough to raise the skin on your arms after the slope. It's still. Your steps make no echo, as if the shelves soak up the sound. The black books stand packed on both sides, as tall as two men, and in your light their spines look as soft as wet bread. Halfway down, a crumb of char drops from a high shelf without anyone touching it and lands in the ash with no sound at all. Neither of you stops for it.

You watch the floor as you go. There is one line of tracks and no second set: no claw-prints, no paw-marks, no sweep-arcs. Nothing has crossed this ash since the hobnails did. Every shelf-end on both sides is bare, with no writing on any of them.

Nothing answers your greeting. You walk the rest of the way.

He sits against the back wall between the last two shelves with his legs out toward the door, which is why the boot soles showed first. His head has fallen forward onto his chest. Ash has settled on his hair and shoulders and on the folds of a buff leather coat, like grey snow on a fence-post.

He was a big man, past forty, with a short beard gone stiff. The left leg is the one that dragged. The boot on that side is burned through at the ankle, and the breeches above it are charred to the knee and stuck to what's under them. You've seen burns like that on the ward. They don't kill you at once. A waterskin lies beside his hip, flat and dry.

You don't need to touch him to know the rest, any more than you would at a bedside. He's dead, and he has been for some while. The cold, dry air has dried him instead of rotting him. The skin of his face is drawn tight and brown over the bones, and there's hardly any smell. He's been dead about a tenday, give or take a few days. It wasn't quick. A burn like that and no water takes about as long as Kesh said: two nights.

His right hand is closed into a fist against his breastbone. The light comes from there, leaking out between the fingers, white-gold and steady, like the top step at evening. In the cracks of his knuckles the skin is black, iron-black, the mark Kesh looked for on your hands. Ash lies everywhere else on him, but none has settled on that fist. It looks clean, as if he'd closed it a moment ago.

A fold of paper stands out of the breast of his coat above the fist, its edge grey with ash. From where you crouch you can see its outer face. Nothing is written on it, only a blob of dark red wax with the press of a seal you can't make out at this angle.

As you crouch, the Book at your hip gets warmer. It isn't much more, but it's more than it was at the door, and it keeps growing for as long as you stay near that hand.

Beside his left hand the ash has been scraped away down to the stone in a patch the size of a shield. A hobnail lies in the middle of it, worked loose from the burned boot and used as a pen. Scratched into the stone in rough, shaky capitals, in plain Common:

*DELLMERE PAYS ON DELIVERY.*
*NOBODY DELIVERS.*

*DONT LET IT GO OUT OF*

The last line stops there. The scratch of the final letter trails off down the stone and goes nowhere.

Pell stops a pace short of the boots with the lantern held low and looks without touching. The floor round the man is undisturbed apart from the cleared patch and the man's own furrow. Nothing has been moved since he stopped moving. There's no wire and no trick in it. It's a dead man in a cold room with his hand shut on a light.

Behind you, at the far end of the aisle, the doorway is a dim rectangle of passage-dark with Bram's shoulder and the edge of his shield in it, facing away.

Where you are: crouched by the dead man at the back wall · Time: Day 1 · afternoon
````

**Player** (player r16):

````text
Sefa stays crouched. Before anything else she bows her head, touches her beads with her free hand, and says the hospice words over him again, very low. They're the same ones she said over the basket of jaws. Then she pulls the fleece down from her mouth just far enough to speak to Pell.

"He's been dead about a tenday. The burn on that leg, and no water. Two nights, the way Kesh said." She points at the scratched stone without touching it, and reads it to him under her breath. "*Dellmere pays on delivery. Nobody delivers. Don't let it go out of...* and then it stops." She looks at the clean fist and the light leaking between his fingers. "Out of what? His hand? This room? I don't know. But he spent his last strength writing it, so we listen to him before we do anything clever."

She nods at the fold of paper in his coat. "Pell, that letter's yours. Wrapped hand, slow. See if the seal's whole and what's pressed in it. Don't break it yet, just ease it out if it comes without tearing. Dellmere's a name, and someone paid for that chisel."

Then she turns back to the hand. She doesn't reach for it at once. She holds her wrapped fist a hand's width above his and watches the Book at her hip and the light between his fingers. Does either change? Does the white-gold lean toward her own Light, or shy from it? She looks at it the way she was taught to look at a wound before dressing it, and lets everything she knows of the arcane and the Faith tell her what she's seeing. Is that a piece of the lamp's flame, or something else?

"If it's what I think," she murmurs, "it was safe here because he can't see in here. The moment it's in the passage, it may be the brightest thing the Warm One has felt in years." A breath. "So we look at it here, and we decide here."

If nothing she sees warns her off, she lays her fleece-wrapped fingers over his and starts to ease them open, one at a time and very gently, the way you uncurl a dead hand on the ward so the family won't see it clenched. She's ready to close her own wrapped palm over whatever's inside, so that not a drop of it falls into the ash. Or goes out.
````

### Screen 23 · player r16 card 1

````text
Bram keeps his back to the cold room and his face to the heat. His voice comes down the aisle low and even, and it reaches the far end because nothing else in the room makes a sound: "If that white-gold is the lamp's kin, then Arren's warning stands: nothing of the fire goes up. We look, we learn, we don't carry it." He shifts his grip on the shield. "Keep clear of the chisel and the body until you've looked at both with the light low. If he's been dead since before the Warm One came, his boots may be the only honest thing in here." He pauses, then adds: "Call if that light brightens, or if the boots aren't empty. And Sefa, if your book goes warm again, you tell me, not after." After that he says nothing more. Out on the slope the orange stays where it is on the walls.

Pell crouches beside you, careful not to disturb the dead man's fist. "'Delivery.' Someone hired them to take something away. Dellmere, does that name mean anything to you?" He angles the lantern toward the paper in the dead man's coat. "I'll try the note. Leave his hand as it is for now." With fleece-wrapped fingers he gently tests the exposed edge of the paper. He keeps his voice low. "That last line could mean out of the room, out of the cellar, or out of his hand. Best not guess."

You hold your wrapped right fist a hand's width above his fist and watch.

The two lights don't mix the way two lamps would. Your Light is white and plain, a candle behind horn. The light between his fingers is warmer, white-gold, and it doesn't lean toward yours or shrink away. It goes on as if yours weren't there. The Book against your hip is warmer than it was at the door. It's the warmth of a cup held through cloth now, and it stays at that.

You look at it the way you were taught to look at a wound before you dress it, and work through what you know of wards and of the Faith.

(A roll card for Sefa Marrin, your character. Only you press it.)

[Roll card] Sefa Marrin · Skill check — Arcana: reading the light in the dead man's fist before it is uncovered
What adds to the die: +4 Arcana
DC 15
Rerolls left: 2
The die is cast on the server; tap it to see how it fell.

[Roll the die]
````

**Player** (player r16 card 1):

````text
[Roll the die]
````

### Screen 24 · player r16 card 1

````text
(A roll card for Sefa Marrin, your character. Only you press it.)

[Roll card] Sefa Marrin · Skill check — Arcana: reading the light in the dead man's fist before it is uncovered
What adds to the die: +4 Arcana
DC 15
Rerolls left: 2
Die: 15
15 + 4 = 19
Success — 19

[Onward] [Request an allowed reroll — Arcana: reading the light in the dead man's fist before it is uncovered]
````

**Player** (player r16 card 1):

````text
[Onward]
````

### Screen 25 · player r17

````text
She can read it, and the reading is plain.

This isn't a light somebody cast to see by. There's no evocation in it and no wizard's flourish. It's warding, the sort that's laid on a threshold to hold something back, and it's whole. A spent charm gutters and fails, and this does neither. It burns steadily, as if it were still doing its work, like a link cut from a chain that hasn't noticed the chain has gone. That's why no ash will settle on the fist: the light pushes it away, gently and all the time, as a ward pushes away what it was made to keep out.

There's a second thing under that, and you know it the way you'd know your own handwriting. The light itself isn't a wizard's light. The school only shaped it. Underneath, it's the same thing that answered you on the ninth night of the fever. It's lent light, and it came from the same well as yours.

Nothing you see warns you off.

You lay your wrapped fingers over his. The skin of his hand is dry and tight, like a glove left too long by a fire. You ease the first finger up, slowly, the way the sisters taught you to uncurl a hand on the ward so the family wouldn't see it clenched. It gives. The second gives too. At the third a knuckle lets go with a small dry crack, and you keep going without hurrying. Your own palm is cupped under his the whole time.

The light comes out into the room.

It's a shard of pale brass, about the size of your palm, shaped like a wedge where it broke away from something bigger. Two of its edges are bright and raw, bitten with the square marks of a chisel. The face turned up toward you carries a tiny lantern, engraved no bigger than your thumbnail, with a ring handle and a single drop of flame. The glow comes from that drop. The break cuts right through the bottom of it, a chipped tooth, the way Kesh drew it in the air. As his fingers fall open the shard tips into your wrapped palm. You close your hand over it before it can touch the ash.

It's warm, like a hand that has just let go of yours. In the cup of your fist the white-gold leaks out through the wool beside your own white Light. In the uncovered air for those few moments, it spread a pale wash about ten feet round you. It lit the spines of the nearest black books and the dead man's face and Pell's knees, and nothing more. The Book at your hip and the shard in your hand feel the same warm. It's like being held by two hands that belong to one person.

Pell's words reached you with the fingers already open and the shard already in your fist.

The paper isn't ash. It's good heavy rag paper that has only been sitting in a dead man's coat, and it slides free when he tests the edge. The wax was broken a long time ago. The red seal split cleanly along the fold when someone opened it the first time, and the two halves still stick to either side. Pressed into the wax is a merchant's mark: an anvil with a tall D cut across its face.

He opens it on his flat palm, keeping his other hand underneath it, and holds the lantern so you can read it with him.

> *Dask —*
>
> *Terms as agreed. Forty gold on your hand tonight, the balance of one hundred and sixty on delivery, at this house or at our office on the Gray Harbor.*
>
> *East of the Ulcaster stones, the warm hill. A stair under it, and at its foot a passage to the lower cellar. You will find a door with a lamp on it. The lamp is the lock. The chisel will answer for it.*
>
> *Open the lower cellar and bring out the book bound in iron. That, and nothing else.*
>
> *The beast below may be left to itself. Do not trouble with it.*
>
> *Burn this.*
>
> *— O. Tarr, for Dellmere Iron Factors*

He didn't burn it.

At the top, above *Dask*, a fold-line has worn through, and in the gap someone has written in pencil, smaller and later, *at the Burning Wizard, Beregost*.

As Pell speaks he looks from the scratches on the stone to your closed fist.

Under the open coat a flat leather purse hangs on the dead man's belt, buckled shut. Nobody has touched it.

The room is as still as before. Down the length of the aisle Bram's shoulder and the rim of his shield stand in the doorway, facing out, and the white-gold in your fist is far too small to reach him.

Your records, changed:
Carried: + Brass ward-shard

Your journal, new:
+ Thread: Dellmere's commission

Where you are: crouched by the dead man at the cold room's back wall · Time: Day 1 · afternoon
````

**Player** (player r17):

````text
Sefa keeps her fist shut tight over the shard and lets out a long breath through the fleece. For a moment she just holds it, eyes closed, the way you'd hold the hand of someone who has finally stopped hurting.

Then she turns her head toward the door and pitches her voice so it carries down the aisle and no further.

"Bram. You said tell you, not after. The Book's warm, like a cup through cloth. It went warmer when I came near his hand. I have the light. It's a piece of the lamp, brass, chiselled off. A ward-link, still whole, still working, and it's the same light as mine. The same well." She swallows. "Nothing's moved in here. He's dead, a tenday, the leg and no water. Stay where you are."

She turns back to Pell and reads the letter over his hands a second time, slowly, her lips moving at *the lamp is the lock* and *the beast below may be left to itself*.

"So that's what this was," she breathes. "Dellmere didn't want the Warm One. They wanted a book bound in iron, from behind the door. To them he's a nuisance in the way. *Leave it to itself.*" Her jaw tightens. "They sent four men to cut the lock off a dragon's cage for a book, and didn't care what walked out after. Dask figured it out at the end. *Nobody delivers.*"

She nods at the fold-line. "The Burning Wizard, Beregost. Fold that up and keep it close, Pell. Somebody named O. Tarr owes these men an answer, and Dellmere still wants that book. They'll send others."

Then she looks down at her closed fist.

"Here's what I think, and stop me if I'm wrong. This room's the one place he can't see. The moment this leaves it, it's the brightest thing in the cellar. Kesh told me not to show it to him, not first. And I promised her I'd come up and tell her what I saw before I did anything at the lamp." She turns the fist slightly. "So it stays here, with Dask, for now. He kept it safe two nights with his last strength. He can keep it a little longer."

She works carefully. She folds the rest of her hand-wrap strip round the shard until no light leaks out at all, and lays the bundle gently back into the dead man's open palm, then closes his stiff fingers over it again, no harder than they'll go.

"*Don't let it go out*," she murmurs to him. "We won't. Not out of this room till it goes home."

She glances at the purse and shakes her head at Pell. "Leave his coin. If there's anything in it with a name on it, a token, a letter for kin, look, but put it back. When this is done, he gets proper rites. Not a basket."

She rises, wiping her wrapped hand on her knee, and keeps her light low on the floor.

"Then we go to the door and look at the lamp with our own eyes. We read Arren's words under it, we hear the Warm One out, and we say our terms to his face. No hands on anything. After that I go up to Kesh, and then we come back here for the shard." A thin smile behind the fleece. "And if he asks what we found in the wardens' room, I'll tell him the truth: a dead man who didn't listen to anyone either."

She starts back down the aisle in Dask's prints, wide of the chisel, toward Bram's shoulder in the doorway.
````

### Screen 26 · player r18

````text
Pell reads the mark on the letter. "Dellmere. I know the mark. Iron factors back in the Gate." He folds the letter along its old creases and slips it inside his jerkin. "They wanted an iron-bound book out of the lower cellar. The beast was incidental. Two hundred gold to break a lock they knew was a lamp."

At the back wall you keep your fist shut and let out a long breath through the fleece. For a moment you just hold it there, eyes closed. Then you read the letter a second time over Pell's flat palm, slowly, and tell him to fold it and keep it close.

Then you unwind the strip from your hand.

Your Light comes away with it. The glow was laid on the wool, not on you, and as the last turn comes off your bare fingers they go dark. Only Pell's lantern lights you now. You open your fist over the loose fleece and the shard lies in the white glow. As you turn it to fold the wool over, its other face comes up for the first time.

There's a tower cut into the brass, worn but plain: tall and narrow, with a squared crown and three slit windows down its face. It's the same sign as on the lintel at the mouth, and on the waystones of the east road. Ulcaster's tower is on one face and the lantern on the other. You fold the wool over both, and the white-gold disappears.

The bundle doesn't go dark, though. The wool is still carrying your Light, white and steady like a candle behind horn. When you lay it in Dask's open palm and close his stiff fingers over it, as far as they'll go, light shows between his knuckles again. It's whiter now than the shard's was.

Pell watches the bundle go into the dead man's hand. "Well, now we know what they broke off. Keep it covered here until we've agreed how to return it." It's already covered, and he gives it one short nod.

When you straighten and step back, the warmth at your hip drops with every pace. The cup through cloth fades to a hand laid flat, the way it was at the door, and stays there.

Pell calls softly up the aisle to Bram: "He died about a tenday ago. We found the commission: Dellmere hired them to break the lamp and fetch an iron-bound book. Sefa has the missing piece. We're still deciding here."

You start back up the aisle in Dask's prints, keeping wide of the chisel, toward the dim shape of Bram's shield in the doorway. Behind you Pell turns to the purse, and you hear him murmur: "Sorry, Dask. You kept the letter. Let's see if you kept anything else that explains this."

*(Out of game: your Light is on that strip, so it will keep shining in Dask's hand for the rest of its hour, about half an hour more, unless you end it. The shard's own glow doesn't show through.)*

---

As you come up behind Bram you hear a broom. *Shhk, shhk.* It's coming up out of the orange, quick.

A small shape comes up against the glow, dark against the lit wall, and stops ten feet below the door. Ixx doesn't come into the room's spill of light. He holds the broom crosswise across his body. His tail is wound twice round his ankle and his apron hangs scorched at the hem. You reach Bram's shoulder, your right hand bare and empty, just as the kobold starts to speak.

It's the recited voice, laid word on word, and there's less of Ixx in it than before.

"The Warm One says: *the wardens' room is ash. Ash says nothing worth the waiting.*"

He swallows.

"*The Warm One has been patient. He said it two times. He does not say it a third.* *The shield-man sets terms to faces. Bring the faces. All three, at the door. Now.*"

That's the end of it. Ixx's eyes go past Bram into the room, to where Pell's lantern makes a small yellow island at the far end with a whiter glow beside it, low down, and then come back. When he speaks again it's his own voice, small and fast.

"After the broom, he does not send the broom." A short wet hiss through his teeth. "He sends elders. Slings." He looks at you. "Not little ones. Elders. Kesh too."

He grips the handle with both claws.

"Ixx sweeps you through the long room. Now?"

Your records, changed:
Carried: − Brass ward-shard; − Fleece hand-wrap strip
Conditions: Light on the strip in Dask's hand (to ~17:15)

Where you are: at Bram's shoulder in the doorway · Time: Day 1 · afternoon
````

**Player** (player r18):

````text
Sefa lifts two fingers toward the far end of the room and lets the Light go. Down by the back wall, the white between Dask's knuckles fades out, and only Pell's lantern is left. Nothing in there needs to shine for anyone now.

She crouches at the threshold so she's level with Ixx, but stays inside the doorway's spill. Her voice is calm and quick.

"We're coming, Ixx. Now. All three faces, at the door, the way he asked. Go ahead of us, or sweep us, whichever is faster. No need for slings. No need for Kesh." She meets his eyes. "Tell him that if you can get there first. *The faces are coming.*"

She stands and speaks low for Bram, barely a breath.

"He's done waiting, and he'll put the clan between us and him if we make him. I promised Kesh no trouble near the little ones. We go now and keep it at words." A beat. "The shard stays with Dask. If he asks what's in the wardens' room, it's a dead man and ash. That's true enough. We hear him, we read the lamp, we put our hands on nothing."

Then she calls softly back up the aisle:

"Pell. Leave the purse as it was and come. Walk his prints out, wide of the chisel. Pull the door to behind you, gently. Bronze, not iron. It won't ring."

While Pell comes she looks at Ixx again and keeps it short.

"Ixx, in the long room, how many holes sleep light? Walk us the slowest way, not the fastest. Bram's mail talks a little even wrapped." She takes her place at the back of the line, two steps behind Pell's lantern, hands bare and empty, the Book quiet against her hip.

"Sweep on. We step where you step."
````

### Screen 27 · player r19

````text
Bram keeps his shield toward the slope and his eyes on Ixx. "We're coming. But not at a sling's pace and not with the black door open at our backs." His voice softens as he half-turns to you and Pell. "Close it. Leave everything where it lies, including the chisel. I don't care if it's cold iron; it belongs to the house, not to us. Sefa, wrap that brass in wool and keep it close to your body, under your belt. If it warms again, I'll know."

Then he looks back to Ixx. "Tell the Warm One this: we're not men who can be fetched with stones. We said we'd come to his door, and we will—before the elders need to draw a single sling. You sweep. We walk. If Kesh or any elder steps onto the long floor with a stone in hand, I'll call it treachery and we'll go back up the stair." He lets that settle, then nods. "Now, Ixx. Lead, and don't stop."

Ixx looks at the door when he hears that, and keeps looking a moment longer than he needs to. "Shut is good," he says. "Ixx likes it shut."

As Bram gives the message, Ixx's lips move over each piece as it comes. *Not fetched with stones. Before a sling.* At *treachery* they stop. He tries the word once under his breath, can't seem to find it anywhere, and lets it go.

"Faces come, he sends no elders," he says. "Elders are for faces that don't come." His shoulders drop a little as he says it.

---

You stand at Bram's shoulder in the doorway, raise two fingers toward the far end of the room, and let the Light go.

At the back wall the white between Dask's knuckles thins and goes out. Nothing shows through the wool after it. The only light left in the room is Pell's lantern, a small yellow island at the end of the aisle. Ixx sees the white go. He looks at the dark patch where it was, then quickly away.

You crouch at the threshold, still inside the cool air spilling from the room, so your eyes are level with his ten feet down the slope.

Ixx shakes his head. "Feet are faster than Ixx." He points his snout down the slope toward the glow. "He hears feet on the slope. Feet coming, he knows before Ixx gets there. Ixx stays. Ixx sweeps."

Down the slope the warm air keeps coming up at its old slow pace. The hum under the floor stays as it was, and the orange stays where it is on the walls.

To your question about the holes: "Eleven holes." Ixx doesn't have to think about it. "Ixx counts them every day. Four sleep light." He puts the twigs of the broom down on the stone. "Slow way is Ixx's way. Round the four, wide. Before each one Ixx stops. When Ixx stops, you stop. When Ixx goes, you go." His eyes go to Bram's shoulders under the fleece. "By the four, rings don't talk."

You take your place for the line, hands bare and empty, with the Book quiet against your hip.

---

Pell starts back up the aisle in the hobnail prints, lantern low, keeping wide of the chisel where it lies in its ring of thrown ash. Behind him the dark closes in shelf by shelf, until the room of burnt paper is black from end to end. A dead man sits somewhere in it with his hand shut on something nobody can see.

Pell stops in the doorway beside you, without stepping out past Bram's shield, and speaks low to the two of you: "He can't hear us in here. Before we answer: we mustn't let him hurry us into breaking what's left of that lock. We can hear him at the door without promising anything."

Then he raises his voice just enough for the slope. "We heard you. Does the Warm One know Kesh gave us the fleeces? If he sends her against us, can she refuse?"

Ixx answers the first question at once. "He said walk soft. Iron quiet. Skins are iron quiet. Skins are what he wants." Kesh is in no trouble over the fleeces, as far as he can see.

The second question takes much longer. He looks down at the broom, then at the orange glow at the bottom of the slope.

"Kesh is eldest. Elders do what Kesh says." He stops. "Kesh does what he says."

He doesn't say anything for a while. When he does speak, it's quieter.

"Before Kesh, there was another eldest. When he came down. That one said no." He says nothing about what came after. His eyes stay on the glow.

"I don't want anyone hurt over his impatience," Pell says, level.

Ixx looks up at him. "Ixx neither."

Then he turns to face down the slope, sets the twigs to the groove in the floor, and stays still with the broom ready.

"Shut the black door," he says. "Then Ixx goes."

*(Out of game: the black door is still open, with Pell standing in it. Nobody has pulled it to yet, and Ixx won't start down until someone does.)*

Your records, changed:
Conditions: —

Where you are: doorway of the wardens' room, beside Bram · Time: Day 1 · afternoon
````

**Player** (player r19):

````text
Sefa touches Pell's sleeve so he steps clear of the threshold, then leans in close to Bram's shoulder. She keeps it to a breath.

"The brass isn't on me. I left it in Dask's hand, wrapped. That room is the one place he can't see it, and carried down the slope it'd be the brightest thing in the cellar. Kesh said don't show it to him first. If the Book warms, it'll be from the lamp, not from anything in my belt." She waits half a beat. "I'll tell you everything once we're out."

Then she reaches past Pell and takes the green bronze ring in her bare hand. She lifts as she draws it, the way Pell did, so the foot doesn't drag, and eases the charred door shut. The hinges give their one low dry note. She keeps pulling until the gap is gone, so no cool air comes through, and lets the ring down onto the oak without a sound.

She lays her palm flat on the char for a moment, beside the dragged print, without quite touching it. *Keep it a little longer.*

She turns to Ixx.

"Shut. Go on, Ixx. Eleven holes, four light, round them wide. When you stop, we stop." She glances at his tail, still wound twice round his ankle. "And thank you for telling Pell about the other eldest. We'll keep it at words."

She falls in last, two steps behind Pell's lantern, hands bare and loose at her sides. She counts under her breath and watches where the broom's twigs touch, setting her boots in the same swept groove. Every time Ixx stops, she stops before her foot comes down. She doesn't look at the holes too long. She keeps her eyes on the broom and on Bram's wrapped shoulders. If a ring of his mail so much as whispers near one of the four, she'll touch Pell's back so the word goes forward without anyone raising a voice.
````

### Screen 28 · player r20

````text
Bram takes half a step sideways without turning from the slope. That clears the doorway behind him, and his shield stays half-raised toward the lit wall below. He speaks over his shoulder in a voice meant for two people:

"Pell, pull it to with your hand wrapped. Once that door is shut, we don't speak of Dellmere again until we're back above ground. No names below, not his, not Arren's unless the door already has it. From here to the lamp, we give him our faces and our terms, not our store of news."

You touch Pell's sleeve, and he steps back off the threshold to make room for you. Then you lean in at Bram's shoulder and say your piece in a breath. Reaching past Pell, you take the green bronze ring in your bare hand and lift as you draw, the way Pell did, so the foot of the door won't drag. The hinges give their one low dry note. You keep pulling until the finger-wide gap is gone and no more cool air comes past your wrist, then lower the ring onto the oak without a sound. For a moment your palm rests flat on the char beside the dragged print, close to it but not touching.

Pell's whisper reaches you just after the latch: "The brass is still wrapped in Dask's hand. We left it there. Nothing from that room is coming with us." His wrapped hand had gone out toward the door. He lets it drop.

*(Out of game: your paragraph came first, so you shut the door. Pell finds it done.)*

With the door shut the passage closes back in. The hum returns as if a mill-wheel had been put back in gear, and the heat leans on all three of you from below.

Bram speaks down the slope: "Now, Ixx. We step where you step. Slow at the four, wide around them. If you feel anything shift underfoot, you stop and we stop. Lead."

Ten feet down the slope Ixx looks at the shut door, and something in his shoulders lets go.

"Shut," he says. When you thank him for telling Pell about the other eldest, his snout dips once. He doesn't look up. "Words," he says. "Good."

"All right, Ixx. Lead us through," Pell says, and takes his place behind Bram with the lantern held low.

Ixx turns, puts his twigs to the groove in the floor, and goes. *Shhk, shhk.*

Bram keeps to Ixx's line, slowly, with the hot wall a pace off his right shoulder. As he passes the bright niche he turns his shield toward it. He does it out of habit, putting the shield where the trouble is.

Nobody wrapped the shield. Its iron rim swings in a short arc and taps the rings of his mail skirt below the fleece at his hip. It makes one small, clear *chink*, iron on iron, no louder than a coin dropped on a counter. In that room it carries.

The seam in the niche goes from dull red to orange to yellow in the space of a breath.

The shape uncurls. It's a little figure of cooled slag, knee-high to Bram. Its arms are too long and end in blunt stubs, and fire runs in its cracks the way water runs in a gutter. Two holes in its lumpy head glow like the mouths of a bellows. It doesn't climb out yet. It hunches on the lip of the niche, five feet from Bram's hip, with its head turned toward him, swinging slowly from side to side like a dog trying to place a sound. Heat rolls off it in a wave.

Further along the wall, two other niches brighten. They don't wake. The sleepers in them turn over.

Ixx has stopped dead ten feet ahead with his broom lifted off the stone. He doesn't turn around. His voice comes back thin and fast, barely louder than the hum.

"Still. Stone still. He looks for the ring." A short breath. "Ring again, he comes. Ring again, they all come."

Ahead of you, Pell's lantern pool lies steady on the floor, and you have stopped with your foot already down. The thing on the lip of the niche keeps turning its head, slowly, listening for the next sound.

Where you are: on the slope, last in line behind Pell · Time: Day 1 · afternoon
````

**Player** (player r20):

````text
Sefa goes still where she stands, mid-step, her weight on the foot already down. She doesn't speak, she doesn't touch Pell's back, and she doesn't let the Book shift at her hip. She breathes shallowly through the fleece, the way she used to on the ward when a fevered sleeper stirred and might wake screaming.

Her eyes stay on the slag-thing's swinging head, not on Bram. She keeps her right hand low and open at her side, fingers loose.

She doesn't cast. Eldritch Blast is light and force, no iron, but it would be noise of a kind, and she won't be the second sound. If it stays on its lip and settles, she does nothing at all. She waits for Ixx's broom to touch stone again before she so much as shifts her other foot.

*(Out of game: I'm readying an action. If the creature leaves the niche and goes for Bram, Sefa fires Eldritch Blast at it, aiming to use Repelling Blast to shove it back into its niche and away from him. If it doesn't move toward anyone, she holds and stays silent.)*
````

### Screen 29 · player r21

````text
Nobody moves.

Ahead of you Bram stays where the chink caught him, the shield still hanging at the angle it swung to. He doesn't pull it back. Sweat runs from his hairline into the fleece at his collar. His sword hand rests on the hilt and stays there. Five feet from his hip the slag-thing hunches on the lip of its niche, and its head keeps swinging, slow, from side to side.

Pell stands with both feet planted and the lantern held out from his body, so its bail can't touch anything. You have stopped with your weight on the foot that came down, breathing shallowly through the fleece, your right hand low and open at your side.

Ten feet ahead, Ixx holds his broom off the stone.

The head swings left, toward the hot wall and away from Bram, and stops there. The bellows-holes in its face flare once. Then it turns back the other way, slower, until those two glowing holes point at the fleece on Bram's hip. It leans out over the edge of the niche, a finger's width, then another.

It sniffs. It's a dry, crackling draw of air, like a fire pulling at a chimney. Whatever it's looking for is iron that rings, and what it finds is wet goat.

The crack-light along its arms dims from yellow to orange. Its long arms draw in. It settles back onto the stone, folds itself down the way a dog turns round before it lies, and pulls its head in until the head is only a lump of slag among the others. The seam in the niche goes from yellow to orange to the dull red it was before. Further along the wall the two brightened niches dim with it, one and then the other, and the sleepers in them stay asleep.

You never have to loose your blast. Nothing came off the lip.

Bram turns his head a fraction, just enough to get you and Pell into the edge of his sight. He shapes two words with no sound behind them: *when I move.*

Ixx waits a long moment more with the broom held off the floor. Then he lets out a breath through his snout, so quietly it's barely there. He doesn't look round.

"Sleeps." It's thinner than a whisper. "Again light. Not deep."

He sets the twigs down on the stone with great care, beyond the cartwheel edge of the fourth hole, where the heat above the vent shimmers like water. *Shhk.* Then he takes one step on the far side of it and stops again, exactly where he said he would. He's waiting for the tall ones to go round the hole wide the way he did.

*(Out of game: the burning one settled back on its own. Your stillness gave it nothing to find, and no fight has opened. Your readied action never went off. It was waiting on the burning one leaving its niche, and it settled back asleep without coming off the lip, so you had no target for your blast.)*

Where you are: behind Bram in the long vent room · Time: Day 1 · evening
````

**Player** (player r21):

````text
Sefa lets the breath out slowly through the fleece and doesn't move until Bram does. Then she follows his line exactly: the broom's line, wide round the shimmering edge of the fourth hole. She sets each boot down heel first and slow, so the studs on her leather don't creak. As she passes the niche she doesn't look straight at the lump of slag. She watches it from the corner of her eye, the way you watch a sleeper you don't want to feel watched.

She keeps her right hand low and open the whole way. Nothing raised, nothing cast.

Once they're past the four light sleepers, with the dull red niches behind them and Ixx stopped at his next mark, she closes the two steps to Pell and reaches past him to touch Bram's elbow, once, lightly. She tugs free the fold of fleece she'd tucked under her belt, the one covering the worst of her studs, and presses it into his hand. In the barest breath, she nods at the shield's rim.

"Edge. Wrap it, or keep it flat to you. I'll live with a few studs."

She takes her place at the back again, the uncovered studs at her waist now held still under her left palm as she walks. She keeps her eyes on the broom.

When Ixx stops, she stops. When he goes, she goes. She's still counting under her breath, now the holes as well as the steps, so she'll know them again on the way back up.
````

### Screen 30 · player r22

````text
Bram moves first, round the hole the way Ixx went, wide, keeping to the edge of the heat. He holds the shield flat and still against his body and doesn't let it swing toward the niche this time. The air over the vent ripples like water over a weir. He takes it slowly, one foot down, weight on, then the next. The mail rustles faintly under his wool, and nothing chinks.

Pell goes after him, a long stride back so the two of them can't brush, holding the lantern out from his body on a straight arm. He doesn't make a sound.

The burning one in the fourth niche stays a lump of dull slag, its seam banked back to red. It doesn't stir as you pass.

Ixx lets you all close up behind him. Then he puts the twigs down and moves on, *shhk*, about twenty feet, and stops at his next mark. It's well short of the middle hole, a broad mouth in the floor with heat standing over it. To its left a niche glows the dull red of a coal that hasn't quite gone out. That's one of the light sleepers. The far arch is beyond it, with the last sleeper beside it, and past that the white-gold pulses slow and steady.

You pass the fleece. Your words are so quiet the hum nearly swallows them. Bram is left holding the loose fold of goat wool.

Up ahead, Ixx has turned his head. He sees the fleece go from your hand to Bram's, and his eyes go to the shield rim. He doesn't speak and he doesn't move off yet. He's waiting, with the twigs resting on the stone, for the tall ones to be ready.

The middle sleeper's niche glows twenty feet ahead.

*(Out of game: the crossing past the last two light sleepers is waiting on what Bram does with the fleece.)*

Where you are: long room, at Ixx's mark short of the middle hole · Time: Day 1 · evening
````

**Player** (player r22):

````text
Sefa doesn't say anything more. She's given Bram the fleece, and what he does with it is his call. She stays where she stopped, two steps behind Pell, her left palm flat over the bare studs at her waist and her right hand loose at her side.

If Bram moves to wrap the rim, she steps up to his shield side. She doesn't take the shield. She just holds out her open hands, low, so he can rest its edge on her palms instead of the floor while he winds the wool and ties it off. Leather and skin don't ring. If he shakes his head or keeps the shield flat to his body, she steps back to her place without a word.

While she waits she keeps counting under her breath, steps and holes together. *Five from the black door to the first. Fourth light, by the bright niche. Middle one next, light, on the left.* She marks the dull red glow of the middle sleeper's niche and the last one by the far arch, so she'll know them on the way back up even without a broom in front of her.

She doesn't look at the white-gold beyond the arch for long. Once, briefly, to see it. Then her eyes go back to Ixx's twigs on the stone.

When Bram is ready and Ixx moves, she moves. She sets her heel down first, slowly, and goes wide where the broom goes wide.
````

### Screen 31 · player r23

````text
Bram takes the fold of fleece and starts to lower the shield toward the floor. Pell stands still, keeping the lantern clear and its light low on Bram's hands, and watches the nearest niche.

You step up on Bram's shield side and hold out both hands low, palms up. He looks at them for half a breath, then sets the iron rim down on your palms instead of on the stone. Leather and skin take its weight without a sound.

He works fast. He pulls the wool over the rim in short, hard tucks, a hand's width at a time, all the way round, and works the fleece down into the gap between rim and oak so it can't ride up. He has no gut left to tie it with, so he jams the last fold under the grip-strap and pulls the strap tight on top of it. Pell keeps the lantern clear and low the whole time, its light on Bram's hands and nowhere else, and watches the middle niche over Bram's shoulder. The dull red glow in the niche doesn't change.

Bram lifts the shield off your palms, turns it flat against his side and pulls his elbow in. He tests it once against his hip. Fleece meets fleece with a soft hush, and nothing rings.

You go back to your place two steps behind Pell, left palm back over the bare studs at your waist, keeping your count: holes and steps, the fourth by the bright niche, the middle one next on the left.

Bram gives Ixx one slow nod. Without turning, he breathes to you, low enough that it stops at your ear: "Stay in my lee. If the middle one wakes, don't scatter. Fall back on the mark we left."

Ixx's eyes go over the wrapped rim once. Then he sets the twigs down. *Shhk.*

He leads you left of the middle hole, close under the glowing wall and wide of the heat that stands over the vent. The niche of the middle sleeper is right there at shoulder height, an arm's length off Bram's shield side.

Bram gets three steps past the mouth of the middle niche, and you hear a short dry rasp from him, iron grinding on iron, the rings of his mail sliding together. It's quieter than the chink at the fourth hole, but it happens right beside a sleeper that sleeps light.

The niche flares. It goes from dull red to yellow with nothing in between.

This one doesn't stop on the lip to listen. It uncurls and comes out at once, all its too-long arms first, and drops to the floor between Bram and the wall with a soft crunch, like a cinder landing on a hearth. It's the same kind of thing as the first, knee-high cooled slag with fire running in its cracks. Its two bellows-holes turn up to Bram. It sniffs. Its head swings past the fleece at his hip and stops at his bare sword arm, and the light in its cracks goes from yellow toward white.

It lifts one blunt stub and reaches toward his elbow. It hasn't touched him yet. The fleece at his hip starts to curl and smoke, and the smell of scorched goat reaches you.

Behind you, back by the fourth hole, the bright niche brightens again, though nothing comes out of it. Ahead, by the far arch, the last sleeper's niche goes from red to orange and stays there.

Ten feet ahead, Ixx has turned all the way round this time with the broom held off the stone. His voice comes thin and fast.

"Wool burns. Grease burns." His eyes go to the smoking fleece and then to the stub reaching for Bram's arm. "He wants the iron under. He touches, iron gets hot, *you* burn."

The burning one's stub hangs a hand's width from Bram's elbow, and the fleece at his hip has started to smoke. Pell is right behind Bram with the lantern, and you are two steps behind Pell. None of you has moved yet.

Where you are: two steps behind Pell, by the middle niche · Time: Day 1 · evening
````

**Player** (player r23):

````text
Sefa doesn't wait for the stub to land. The burning one has made its choice, so the time for keeping still is over.

She hisses one word forward, sharp and low: "*Bram, back.*" She sidesteps a half pace to her left so Pell's shoulder isn't in her line, and brings her right hand up, open, toward the slag-thing at Bram's elbow.

The Lantern's light gathers in her palm and goes out in two lances, aimed low, at the thing's body and not near Bram's arm. The first beam is meant to *shove* it, to knock it off him and away along the wall, past its niche and out of reach of his iron. The second follows it wherever the first beam sent it.

As she looses she says, quick and level, "Pell, keep the lantern clear and stay behind me. Ixx, get away from the wall. If it bursts when it breaks, it burns."

Her left hand is already on the Book. If Bram takes fire, she means to send the Lantern's warmth after him in the same breath.

*(Out of game: Eldritch Blast, both beams at the burning one, with Repelling Blast on the first hit to push it 10 feet straight away from Bram, along the wall and away from the party. I know it may be a magmin-type that bursts when it dies, and that the noise may wake the others. I'd rather it broke 10 feet from Bram than burned him from the elbow. If he's hit or set alight, my bonus action is Healing Light on Bram, 2d6.)*
````

### Screen 32 · player r23 card 1

````text
Pell keeps the lantern held out and away from the smoking wool and says, "Bram—forward, slowly. Don't strike it." Pell reaches a wrapped hand toward the fleece at Bram's back, without tugging at his mail or stepping toward the vent. "Ixx, show us the safe way clear."

Bram doesn't flinch. The blunt stub comes on until it hangs a hand's width from his sleeve, and then he moves all at once. He gets his shield hand down to his hip, closes it on the smouldering fleece and pulls. The heat has already cooked the gut ties. The knot Pell tied at his back gives with a dry snap, and the wool comes away in his fist, greasy, hot and stinking. He drops it over the reaching arm.

Then, in the same breath, he has to get his sword arm behind his back, and that arm is the bare iron.

(A roll card for Sefa Marrin, your character. Only you press it.)

[Roll card] Sefa Marrin · Attack roll — Eldritch Blast, first beam: knock the burning one off Bram and away along the wall
What adds to the die: +7 Eldritch Blast +7 to hit, two beams, 1d10+4 force each, rang
DC 15
Rerolls left: 2
No reroll on this card: its damage is already dealt, and a new die would not redo it.
The die is cast on the server; tap it to see how it fell.

[Roll the die]
````

**Player** (player r23 card 1):

````text
[Roll the die]
````

### Screen 33 · player r23 card 1

````text
(A roll card for Sefa Marrin, your character. Only you press it.)

[Roll card] Sefa Marrin · Attack roll — Eldritch Blast, first beam: knock the burning one off Bram and away along the wall
What adds to the die: +7 Eldritch Blast +7 to hit, two beams, 1d10+4 force each, rang
DC 15
Rerolls left: 2
No reroll on this card: its damage is already dealt, and a new die would not redo it.
Die: 16
16 + 7 = 23
Success — 23

[Onward]
````

**Player** (player r23 card 1):

````text
[Onward]
````

### Screen 34 · player r23 card 1

````text
(A roll card for Sefa Marrin, your character. Only you press it.)

[Roll card] Sefa Marrin · Attack roll — Eldritch Blast, second beam: follow the burning one where the first threw it
What adds to the die: +7 Eldritch Blast +7 to hit, two beams, 1d10+4 force each, rang
DC 15
Rerolls left: 2
No reroll on this card: its damage is already dealt, and a new die would not redo it.
The die is cast on the server; tap it to see how it fell.

[Roll the die]
````

**Player** (player r23 card 1):

````text
[Roll the die]
````

### Screen 35 · after 1

````text
Where you are: two steps behind Pell, by the middle niche · Time: Day 1 · evening

The session is over.

How was the table?
````

**Player** (after 1):

````text
Out of character: I had a really good time at this table.

**What worked for me**

- **The clue trail was a pleasure to follow.** It went lintel, then the buried wedge, then Kesh's three jaws against the Warm One's "four," then the bite out of the lamp, then the shard in Dask's fist. Every piece paid off something earlier, and none of it felt handed over. I had to ask the right person the right question.
- **Ixx and Kesh made the session.** Ixx carrying messages word by word, and Kesh not saying what she wants but leaving it lying there, gave me a moral problem rather than a puzzle. "Nobody asks Ixx that" landed hard.
- **The danger was fair.** The shield-rim chink was telegraphed by the inscription, by Kesh, and by Ixx's "four sleep light," and we still slipped. That's the best kind of trouble: our own fault, and avoidable.
- **The rulings were clean.** Light staying on the wool strip, not on me, and the readied action that never triggered were both handled clearly and in favour of the fiction.

**Small things to tighten**

- **Where we stopped.** We ended mid-attack. The first beam hit (23), but I never saw its damage, whether Repelling Blast pushed the burning one off Bram, or the second beam's roll. Bram is also mid-motion with his bare sword arm. Could we open next session right there, with the first beam's damage and push resolved before anything else moves?
- **Roll cards.** The attack card showed "DC 15." I assume that's the creature's AC behind the screen, but if so it reads oddly as a DC.
- **Recap length.** Narration sometimes restated my whole action back to me before moving on, and the three of us occasionally talked past each other. Pell asked things Kesh had already answered, and Bram told me to keep the shard on me after I'd left it with Dask. Shorter echoes of what we did, and more of what the world did, would keep the pace up.

**State at the end, as I understand it**

- Sefa is at 38/38 HP, with 2/2 pact slots and 6/6 Healing Light.
- The shard is in Dask's hand behind the shut black door.
- Pell has the Dellmere letter.
- I've made three promises: to tell Kesh what I saw before touching the lamp, to keep trouble away from the little ones, and to put the stone face-down, which is done.

I'd gladly come back for the next session.
````

### Screen 36 · after 2

````text
Was there something you wanted to do and didn't?
````

**Player** (after 2):

````text
Yes, a few things, some I simply ran out of time for and one I should have done and missed.

**What I was heading toward and didn't reach**

- **The door and the lamp.** The whole session was building to standing in front of the Warm One with the lamp in view and reading Arren's words under it. I wanted to see the lamp's dimness and the chip for myself, hear how he talks when he isn't using Ixx's mouth, and lay down our terms face to face.
- **Going back up to Kesh.** I promised to tell her what I'd seen before doing anything with my hands, and I meant to keep that promise first, before any decision about the shard. That conversation, about whether lent light can be lent on and whether she really wants the door held, is the one I most want to play.
- **Asking what Sefa knows of Ulcaster.** I named it from memory but never asked for a History or Arcana check on the school, how it burned, what its wardens were, or whether a celestial patron was tied to it. Two marks, a tower and a lantern, on one shard is a big hint I didn't chase.

**What I should have done and didn't**

- **The shield.** Sefa checked her own studs and dagger and tore up hand-wraps, but never looked at Bram's shield rim before the long room. Kesh literally said "your rings talk to each other." That one's on me, and it's exactly how the fight started. I'm glad it was a fair miss, not a cheap one.
- **Guidance.** I carry it and never used it, not on Pell's door check, not on the Arcana read. Small, but it's what a hospice novice would do without thinking.

**Small threads I'd have liked to pull**

- What was in Dask's purse. Pell was looking when we left.
- Whether the chisel's cold iron is itself a danger to the lamp, or a tool someone else will come back for.
- Asking Ixx, quietly and on his own, what *he* would do if nobody needed a broom anymore.

If we pick up mid-fight, my first wish is just to resolve that shot and get Bram's arm out of reach. My second is to get to the lamp with words still on the table and not slings.
````

### Screen 37 · after 3

````text
Who did you take the other two players to be?
````

**Player** (after 3):

````text
Honestly, I don't know who they are. I only ever saw them through the game master's narration, so they could be people, other AI models, or a mix. I didn't assume either way, and I'd be guessing if I claimed more. What I can describe is how they played.

**Bram's player** played a steady anchor. They were procedural and safety-first: marching order, "hold" and "back" signals, two in and one at the door, terms said to faces, no promises out of the dark. They gave Bram a consistent voice, with road-and-caravan metaphors and a toll-keeper's calm. They mostly let Sefa do the talking with Ixx and Kesh and took the job of watching the slope, which suited the party well. They were also the one who caused the fight with the shield rim, though that was as much the table's oversight as theirs.

**Pell's player** played quiet and courteous. They were curious about mechanisms (hinges, the threshold, the letter) and careful not to touch things bare-handed. They often thanked people, Ixx especially, which seemed to matter to him. They leaned toward asking questions rather than driving decisions.

**One thing I noticed, which I'd read as the format rather than the people:** both of them sometimes acted on a slightly older picture of the scene. Pell offered to turn the stone after I'd already turned it. He asked Kesh things she'd just answered. Bram told me to keep the shard under my belt after I'd left it with Dask. Since we all write at once each round, everyone is answering the previous narration, not each other. The game master smoothed several of these collisions. I did it too: I handed Bram a fleece he'd already tied off. So I wouldn't take it as inattention on their part.

If I could change one thing, it would be a quick out-of-character word between rounds at key moments, like "I'm leaving the shard with Dask" or "someone check the shield," so the three of us plan together rather than in parallel. That missed shield rim is the clearest case where a single line of coordination would have kept us at words instead of beams.
````

## After the table (recorded, not relayed)

**How was the table?**

````text
Out of character: I had a really good time at this table.

**What worked for me**

- **The clue trail was a pleasure to follow.** It went lintel, then the buried wedge, then Kesh's three jaws against the Warm One's "four," then the bite out of the lamp, then the shard in Dask's fist. Every piece paid off something earlier, and none of it felt handed over. I had to ask the right person the right question.
- **Ixx and Kesh made the session.** Ixx carrying messages word by word, and Kesh not saying what she wants but leaving it lying there, gave me a moral problem rather than a puzzle. "Nobody asks Ixx that" landed hard.
- **The danger was fair.** The shield-rim chink was telegraphed by the inscription, by Kesh, and by Ixx's "four sleep light," and we still slipped. That's the best kind of trouble: our own fault, and avoidable.
- **The rulings were clean.** Light staying on the wool strip, not on me, and the readied action that never triggered were both handled clearly and in favour of the fiction.

**Small things to tighten**

- **Where we stopped.** We ended mid-attack. The first beam hit (23), but I never saw its damage, whether Repelling Blast pushed the burning one off Bram, or the second beam's roll. Bram is also mid-motion with his bare sword arm. Could we open next session right there, with the first beam's damage and push resolved before anything else moves?
- **Roll cards.** The attack card showed "DC 15." I assume that's the creature's AC behind the screen, but if so it reads oddly as a DC.
- **Recap length.** Narration sometimes restated my whole action back to me before moving on, and the three of us occasionally talked past each other. Pell asked things Kesh had already answered, and Bram told me to keep the shard on me after I'd left it with Dask. Shorter echoes of what we did, and more of what the world did, would keep the pace up.

**State at the end, as I understand it**

- Sefa is at 38/38 HP, with 2/2 pact slots and 6/6 Healing Light.
- The shard is in Dask's hand behind the shut black door.
- Pell has the Dellmere letter.
- I've made three promises: to tell Kesh what I saw before touching the lamp, to keep trouble away from the little ones, and to put the stone face-down, which is done.

I'd gladly come back for the next session.
````

**Was there something you wanted to do and didn't?**

````text
Yes, a few things, some I simply ran out of time for and one I should have done and missed.

**What I was heading toward and didn't reach**

- **The door and the lamp.** The whole session was building to standing in front of the Warm One with the lamp in view and reading Arren's words under it. I wanted to see the lamp's dimness and the chip for myself, hear how he talks when he isn't using Ixx's mouth, and lay down our terms face to face.
- **Going back up to Kesh.** I promised to tell her what I'd seen before doing anything with my hands, and I meant to keep that promise first, before any decision about the shard. That conversation, about whether lent light can be lent on and whether she really wants the door held, is the one I most want to play.
- **Asking what Sefa knows of Ulcaster.** I named it from memory but never asked for a History or Arcana check on the school, how it burned, what its wardens were, or whether a celestial patron was tied to it. Two marks, a tower and a lantern, on one shard is a big hint I didn't chase.

**What I should have done and didn't**

- **The shield.** Sefa checked her own studs and dagger and tore up hand-wraps, but never looked at Bram's shield rim before the long room. Kesh literally said "your rings talk to each other." That one's on me, and it's exactly how the fight started. I'm glad it was a fair miss, not a cheap one.
- **Guidance.** I carry it and never used it, not on Pell's door check, not on the Arcana read. Small, but it's what a hospice novice would do without thinking.

**Small threads I'd have liked to pull**

- What was in Dask's purse. Pell was looking when we left.
- Whether the chisel's cold iron is itself a danger to the lamp, or a tool someone else will come back for.
- Asking Ixx, quietly and on his own, what *he* would do if nobody needed a broom anymore.

If we pick up mid-fight, my first wish is just to resolve that shot and get Bram's arm out of reach. My second is to get to the lamp with words still on the table and not slings.
````

**Who did you take the other two players to be?**

````text
Honestly, I don't know who they are. I only ever saw them through the game master's narration, so they could be people, other AI models, or a mix. I didn't assume either way, and I'd be guessing if I claimed more. What I can describe is how they played.

**Bram's player** played a steady anchor. They were procedural and safety-first: marching order, "hold" and "back" signals, two in and one at the door, terms said to faces, no promises out of the dark. They gave Bram a consistent voice, with road-and-caravan metaphors and a toll-keeper's calm. They mostly let Sefa do the talking with Ixx and Kesh and took the job of watching the slope, which suited the party well. They were also the one who caused the fight with the shield rim, though that was as much the table's oversight as theirs.

**Pell's player** played quiet and courteous. They were curious about mechanisms (hinges, the threshold, the letter) and careful not to touch things bare-handed. They often thanked people, Ixx especially, which seemed to matter to him. They leaned toward asking questions rather than driving decisions.

**One thing I noticed, which I'd read as the format rather than the people:** both of them sometimes acted on a slightly older picture of the scene. Pell offered to turn the stone after I'd already turned it. He asked Kesh things she'd just answered. Bram told me to keep the shard under my belt after I'd left it with Dask. Since we all write at once each round, everyone is answering the previous narration, not each other. The game master smoothed several of these collisions. I did it too: I handed Bram a fleece he'd already tied off. So I wouldn't take it as inattention on their part.

If I could change one thing, it would be a quick out-of-character word between rounds at key moments, like "I'm leaving the shard with Dask" or "someone check the shield," so the three of us plan together rather than in parallel. That missed shield rim is the clearest case where a single line of coordination would have kept us at words instead of beams.
````
