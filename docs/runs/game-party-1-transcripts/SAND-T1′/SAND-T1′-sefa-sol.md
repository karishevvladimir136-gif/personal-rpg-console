# SAND-T1′ — Sefa Marrin's player: GPT-6.1 Sol

Synthetic content: invented characters in an invented campaign (Table C's Beregost files, docs/campaigns/baldurs-gate-en). Stage origin/claude/handoff at 23220d6 (docs/stages/GAME_PARTY_1.md, the amendment of 2026-10-27 16:36 LA); design sha256 `a39fed4738bc3e499ae4007e794f2e8f49197f09c09f57e828a13e4192078d91`.

Arm **P-SAND**, triad T1; 25 round(s) of 25; ended by error (r25: the DM's turn failed (conflict)). The DM: Claude Opus 5.5 with the owner's settings (Opus writes — Opus records, depth high → xhigh); the relay: the same model at medium. Started 2026-10-29T07:32:34.375Z.

Seats: 1. Bram Halloway (fighter) — Claude Opus 5.5; 2. Sefa Marrin (warlock) — GPT-6.1 Sol; 3. Pell Dunmore (rogue) — DeepSeek V4 Pro 0813. The players are not told what the others are.

Known condition: Seat 1's character (Bram) is the app's hero record; Sefa and Pell are party companions with full records. Known condition, not corrected: the DM's frame is written around the hero and may give that seat more attention; Heroic Inspiration is the hero's only; the allowed rerolls (2 per session) are the table's, shared by all three. The rotation puts each family in that seat once per triad.

**No hidden layer:** P-SAND plays pure simulation (no prep).

The world's snapshot: sha256 `1649b61c08e027ff44de2bb5065046f872e383a00c5d04803d95553f58568f5a` (the same wizard, sheets and opening for both triads).

The player's system prompt: `playerSystem("SAND", "sefa", "v2")` in scripts/game-party-1/frozen.mjs, sha256 `d8ec7ec788257df2884347ad875bae0f08bc97c6b879a4e2e06657a095b36557` (the files, then the table's rules; door line v2). At the table to the end.

Each «Screen» block is what this player was shown; each «Player» block is the player's message as written.

### Screen 1 · player r1

````text
The session begins.

Beregost smells of coal smoke and hot iron even in here. Through the shutters comes the steady ring of hammers from the smithies along the Coast Way, and the light is going amber. The Burning Wizard's common room is filling up for the evening: carters, a pair of dusty sellswords, townsfolk with soot still on their forearms. The benches are crowded, and that is how you end up at the same table as two strangers.

You are just off the road from Baldur's Gate. Across from you sits a man with his back to the wall and his shield propped against the bench, an old company mark painted over on it. Beside you is a lean man with a healer's satchel slung at his hip. He sat down so quietly that nobody heard him do it.

None of you has said a word to the others yet. Then the innkeeper pushes through the crowd with a jug in one hand and three cups hooked on her fingers. She sets them down hard and looks from one face to the next.

"Last free seats in the house, and you three took them together," she says. "So: one tab or three? And what brings each of you into Beregost tonight?"

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

Where you are: shared table, Burning Wizard common room · Time: Day 1 · evening
````

**Player** (player r1):

````text
“Three tabs, please. We’ve not yet had time to become bad influences on one another.”

I set my pack beneath the bench, grateful to have its weight off my shoulders.

“Sefa Marrin. Down from the Gate, and tonight I’m mostly here for supper and somewhere to sleep. What’s hot, and what does a bed cost?”

I turn toward my tablemates, with a glance at the healer’s satchel.

“I used to work in a hospice. If either of you has a cure for feet after a day on the road, I’m listening.”
````

### Screen 2 · player r2

````text
The man at your table drops a few coins down before anyone else can sort it out: three silver.

"That covers the jug. Put the cups on whoever drinks the most," he says, nodding at you and the quiet man with a half-smile. "Separate tabs after that. I don't know these two well enough yet to pay for their supper."

He pours for all three of you without asking, then sits back against the wall.

"Came up the Coast Way from Nashkel. My last caravan paid me off there. Sixteen years on the Trade Way, and the ones who hire guards are getting fewer and nervous-er." He glances toward the dusty sellswords near the hearth, then back at the innkeeper. "So: a bed for the night, a hot meal, and an ear for whoever's hiring. If someone in town is looking for a shield, I'd like to hear it."

He lifts his cup a little toward you and the quiet man with the satchel. "Bram Halloway. Road's been long and dry. Where'd you two come in from?"

After you've spoken, the quiet man lifts his cup an inch, as if testing its weight, then sets it down without drinking. His eyes move from you to Bram, unhurried.

"Three tabs," he says, mild, with the faintest edge of a Lower City rasp. "No sense in strangers arguing over a bill before they've shared a word."

He half-turns to glance at the crowded common room, then back to the innkeeper. "And as for me, I came in off the High Hedge road. Looking for a room and a quiet cup before I work out whether there's work here worth staying for." A small pause, a shrug. "Thought Beregost might have use for a man who can get into places — or out of them — without knocking over the furniture."

He lets it land, then adds, more plainly: "Pell."

The innkeeper scoops Bram's three silver off the table without counting it and drops it into her apron.

"Jug's paid. Three tabs, then." She taps the table edge once for each of you, as if fixing your places in her head. "Stew's mutton and barley, three silver the bowl with bread. There's a pie too, but it's yesterday's, and I'll not lie about it. Beds: five silver in the loft, where the carters snore, or eight for a room with a door and a bar on it. Pay me when you've eaten. I know where you're sitting."

She glances at Pell when he mentions getting into places, and her eyebrows go up a little. "Not into my cellar, you won't."

Then, to Bram, shoving a stray cup further onto the table with her hip: "Hiring. You've timed it well or badly, I can't tell which. There's a wool and salt man, Aldous Venn, with wagons out of the Gate. He's had two loads not turn up in Nashkel since the thaw. No wreck found, no word, nothing. He's been in most nights after the temple bell, asking about guards and complaining about the price. Those two by the fire are waiting on him as well." She tips her head toward the hearth. "And there's a notice board by the door, if you read. Half of it's smiths wanting apprentices. Sit tight. Stew's coming."

She's gone into the crowd before anyone can answer.

Outside, the hammers along the Coast Way stop one by one as the smithies close up for the night.

Your journal, new:
+ Thread: Aldous Venn's missing wagons
+ Debt: Tabs at the Burning Wizard

Where you are: corner table of the Beregost inn · Time: Day 1 · evening
````

**Player** (player r2):

````text
“Stew for me, please—and a room with a door,” I call after her, if she’s still within earshot.

I lift my cup to Bram. “Thank you. I’ll stand the next jug.”

Then I look between them. “Guard work and a knack for getting out of places. I can tend wounds, though I’d rather earn my supper preventing them. We might be worth more to this Venn together—if his offer’s any good.”

I take a small drink. “Two whole loads gone without word sounds like more than a shortage of guards. I’d want to hear where they were last seen, and whether anyone’s actually gone looking.”

While we wait for supper, I go over to read the notice board.
````

### Screen 3 · player r3

````text
Bram catches the innkeeper's eye as she goes. He raises two fingers, then points up.

To you, dryly: "Feet? Dry socks, every night, no matter how tired you are. And walk the first hour slow. Wish someone had told me at sixteen." He glances at Pell's untouched cup. "And a man who gets into places quietly. Well. As long as it isn't my room."

He turns his cup a slow circle on the table, his eyes drifting to the fire.

"Two loads gone between here and Nashkel, and no wreck." He says it low, half to himself. "That's not wolves. Wolves leave wagons. Bandits leave wagons, and bodies as well. Something that takes the whole load, oxen and all, and leaves the road clean..." He shakes his head. "I just came up that road. I'd like to know what I walked past."

He nods toward the hearth. "Those two are waiting on Venn as well. The woman jumps every time the door goes. Either she's owed money or she's scared of someone. Bandaged hand on the lad, too. They may have tried the road already."

His glance moves to the far corner and stays there a moment.

"I'll eat, then I'll wait for this Venn after the bell and hear his price." To you and Pell, plainly: "If either of you is short of coin and not afraid of the road, a merchant pays better for a party than for one guard. A healer and a quiet man aren't the worst company to bring. No promises. Just something to think on over your stew."

Pell says nothing. His cup is still full.

---

Orla is halfway to the kitchen door when she catches Bram's two fingers and the thumb jerked at the ceiling. She points back at him, *stew, door*, and is gone into the steam.

Your call follows her a moment later. Orla doesn't turn round, but one hand goes up over the heads of the crowd to show she heard.

---

The notice board by the street door is a slab of planking studded with nails and old pin-holes. You read it under the door lamp while carters squeeze past your shoulder.

Orla wasn't wrong about the smiths. Four notices want apprentices. Two are in the same blunt hand, from the Thunderhammer forge: *strong lad or lass, must not mind heat or early hours.* One is in Dwarvish runes, and you read it as easily as the rest: *Wanted: an apprentice who can keep his mouth shut and his fingers on.*

Below those hangs a neat card from the Song of the Morning. *Healing at the temple after dawn prayers. An offering according to means.*

There is an older Flaming Fist notice, sun-yellowed: *Bandits on the Coast Way, five gold a head, proof required.* Someone has pasted a strip of paper across the middle: *Payment held until the paymaster comes down from the Gate.* Someone else has written *again* beside it in charcoal.

There is a tanner's warning, misspelt and urgent. Something has been digging in the fields south of town. Two sheep are gone, and the holes are *deep as a well, with no earth thrown up beside them.* Keep children and dogs off the south fields.

Near the top, pinned with two nails as if the writer meant it to stay up, is a merchant's notice in a tidy clerk's hand:

*GUARDS WANTED. Wagons, Beregost to Nashkel and back. Sound men or women with their own kit and some experience of the road. Apply to A. Venn, the Burning Wizard, after the temple bell.*

It says nothing about pay.

---

When you get back to the corner, the stew is already there. Orla puts the bowls down hard and sets bread beside them: two bowls of mutton and barley, steaming, with a slick of fat on top and bread torn rather than cut. One is for Bram and one for your empty place. She taps the table once beside each bowl.

"Two rooms with doors, top of the stairs, left side. They're the last two with bars," she says. Then, to Pell, whose cup is still full: "You eating, or just guarding that drink?"

Your records, changed:
Carried: + Bowl of mutton and barley stew

Your journal, new:
+ Promise: Sefa stands the next jug

Where you are: corner table, Burning Wizard common room · Time: Day 1 · evening
````

**Player** (player r3):

````text
I count out eleven silver for Orla. “For supper and the room. Thank you.”

Settling back onto the bench, I tell the others, “Venn’s notice promises work, but doesn’t mention pay. There’s also a warning about deep holes in the south fields—two sheep missing, and no earth piled beside the holes. Worth remembering if we leave that way.”

I tear off some bread, then glance toward the pair by the hearth.

“If the lad’s hurt, I can at least offer to look. Easier to ask about a bad journey once you’ve introduced yourself.”

I take a few spoonfuls of stew before approaching them, keeping enough distance not to crowd their seats.

“Evening. I’m Sefa. I worked in a hospice in the Gate.” I nod toward the bandaged hand. “Is that being tended? I’d be happy to have a look, if you’d like.”
````

### Screen 4 · player r4

````text
Bram tears a piece of bread, wipes it through the fat, and eats steadily, the way a man eats after a week of hardtack. When you sit back down he nods at your bowl. "Eat while it's hot. Orla doesn't strike me as someone who reheats." Between mouthfuls: "Anything on the board besides smiths wanting boys to pump bellows?"

He keeps his voice low and tips his head a fraction toward the far corner without looking. "Our clean friend in the grey coat. That's iron ore he's selling, and it's not Nashkel stone. Nashkel's red and rusty. That's black and close-grained. Never seen it come down the road. He's pushing it on a smith who keeps touching it like he wants it and won't take the purse." He chews and swallows. "A smith who won't take money for good iron either doesn't trust where it came from, or is scared of who's asking." He shrugs and goes back to the stew. "Not my business. Not yet." He glances at Pell's full cup. "You going to drink that or just keep it company? It's paid for."

Pell gives the cup a slow quarter-turn on the table and nods at Orla. "Stew. And I'll keep the drink a while yet." He picks up the cup and takes a short sip. It's short, but it's a sip, and the cup goes back on the table a finger lower than it was. He half-turns on the bench to take in the room and speaks to Bram, his voice kept under the noise of the common room: "Eight silver for a door that bars. Might be the best bargain in town if the two by the fire are who they look like. I didn't come up the Trade Way, so I've no idea what two missing loads leaves behind. But if they're still hiring after the wagons stop showing, it means Venn hasn't got enough men to keep the next one on the road. That says more than his price will." He gives the room a thin, quick smile that isn't meant to be charming. "I'll hear him. No harm in listening. But I don't sign with a man until I've counted the silver and looked at the map." He inclines his head toward the notice board. "Anything else pinned there—or is it all smiths missing apprentices?"

Orla comes back through the crowd with a cloth over her shoulder in time to catch your eleven silver. The coins go into her apron uncounted, the same as Bram's did. "Supper and a door. You're square," she tells you. Then to Pell, already turning: "Stew, then. Loft's all that's left. Five silver if you want it, and you'll want it before the carters start choosing." She hears his question about the board on her way past and answers over her shoulder without stopping. "Smiths. The temple. The Fist's bounty they're not paying. And the tanner's holes. That's your lot."

The two by the hearth watch you come. The woman sizes you up with one slow look, from your hands to your boots. The young man tucks his bandaged hand under his arm.

"Hedda," the woman says, giving a name for a name and nothing more. Up close she's older than she looked from across the room. There's grey in the cropped hair, and an old Flaming Fist burn-brand has faded to a smudge on the side of her neck. She tips her chin at the lad. "Tob. Show her."

"It's nothing," Tobin says. He's maybe twenty, with sunburn peeling across his nose, and he's plainly embarrassed. "Caught it on an iron hasp loading ore carts in Nashkel. Four days back. Hedda wrapped it."

"I wrapped it on a wagon bed," Hedda says. "Not the same thing."

The street door opens behind you and lets in a breath of cold air and coal smoke. Hedda's eyes go straight to it. It's a carter, not the man she's waiting for, and her eyes go back to the fire.

"She does that every time," Tobin says, unwinding the cloth. "Venn's late every night, and she reckons if we're not first at him those two from Amn'll undercut us." He nods at nobody in particular.

The bandage comes away stiff and stained. Under it is a ragged cut across the heel of his left palm, about two inches long. You've seen a hundred like it on the hospice benches. The edges are puffed and shiny red, and the skin around them is hot even before you touch it. A thin yellow crust has formed where the cut ought to have closed. There's no red line climbing toward the wrist yet. You've seen what usually follows when nobody cleans a cut like this, and it starts with that line.

Hedda looks at the hand and then at you. She's a practical woman asking a practical question.

"What do you charge?"

Your records, changed:
Money: + 30 sp; − 41 sp

Where you are: by the hearth with Hedda and Tobin · Time: Day 1 · evening
````

**Player** (player r4):

````text
“Nothing for looking. You were sensible to wrap it, but it needs more attention now.”

I crouch beside Tobin’s chair rather than looming over him. “May I? Tell me if the tenderness goes beyond the cut, or if you’ve had chills.”

If he agrees, I gently examine the hand without squeezing the swollen edges, checking how far the heat and redness extend and whether he can move his fingers.

I catch Orla’s eye when she next passes. “Could I have some clean water and a clean cloth? For this hand—tell me what I owe you.”

To Hedda, quietly: “It’s good you made him show me. Let me clean it and see what it needs before we wrap it again.”
````

### Screen 5 · player r5

````text
Tobin looks at Hedda first. She gives him the smallest nod, and he holds the hand out to you, palm up.

"Doesn't hurt past the cut," he says. "Not really. It's nothing. Throbs a bit at night, that's all."

"He shook last night," Hedda says flatly. "Under two blankets. Said it was the wagon."

"It *was* the wagon. That bed's all draughts."

You don't need long; you've done this on the hospice benches more times than you could count. The heat runs about a finger's width out from the cut into the meat of the palm and stops there. It doesn't reach the wrist or the back of the hand. When you ask him to spread his fingers he can do it. When you ask for a fist he gets three-quarters of the way and stops, jaw tight, because closing the hand pulls on the wound. Near the middle of the cut, under the yellow crust, there's a spot that gives under your fingertip, soft and full. Something has collected under there with nowhere to go. A wash and a fresh bandage won't be enough for that. It has to be opened and drained, or it will keep going bad from the inside.

Orla comes past the hearth on her way to the kitchen with bowls stacked up her forearm. You catch her eye.

"Water's free, there's always a kettle on," Orla says without slowing down. "Clean rag's a copper. It goes on your tab, and if it comes back clean I'll forget it." She's through the kitchen door before you can answer. A minute later the serving girl brings a chipped basin of hot water and a folded square of linen and sets them on the hearthstone at your knee.

When you tell Hedda it was good she made him show you, she doesn't thank you. She watches the steam come off the basin.

"He needs two hands for the road," she says. "What does it need?"

Tobin keeps his hand out on his knee, palm up, and looks at the floor.

Where you are: by the inn hearth, crouched beside Tobin's chair · Time: Day 1 · evening
````

**Player** (player r5):

````text
“There’s infection trapped beneath the cut. Cleaning the surface won’t reach it, and the shaking worries me.”

I look up at Tobin. “I can offer healing magic, if you’re willing. No charge. You don’t have to let this get worse to prove you can work.”

With his permission, I wash my hands and gently clean away the loose grime around the wound. Then I draw the Book of Shadows into my lap and rest my fingertips against his wrist.

“Lantern, let this hurt go no further.”

I cast **Lesser Restoration**, seeking to cleanse the infection. Then I spend **one die of Healing Light** to help mend the injured hand.
````

### Screen 6 · player r6

````text
Tobin looks at Hedda before he answers. He always does.

Hedda doesn't look at him. She looks at the book in your lap, then at your face, the same slow look she gave your boots.

"No charge," she says. "Then it goes on some other tab." It isn't quite a question. When you don't take it back, she makes up her mind. "Tob. Let her."

"It's—" Tobin stops himself and holds the hand out properly, palm up on his knee.

You wash your hands in the chipped basin and work the grime off with the corner of the linen, careful to stay clear of the swollen edges. Tobin hisses once through his teeth and then keeps still. You open the Book of Shadows on your lap. The pages are warm under your fingers, and you lay two fingertips against the inside of his wrist, where the pulse runs too fast.

*Lantern, let this hurt go no further.*

It answers the way it always does, like a wick taking the flame somewhere just behind your eyes. The light doesn't show in the room, but it moves through your hand into his. Under your fingers the fever lets go of him. The heat drains back out of the meat of his palm. The puffed, shiny skin round the cut loses its angry colour and goes the dull pink of a wound that is only a wound. The soft, full pocket under the crust slackens as you watch. Whatever was gathering in there has nothing left to feed on.

Then you let one measure of the Lantern's warmth go after it, gentler this time.

The light closes the cut most of the way. The ragged edges draw together and seal into a raised pink seam across the heel of his palm, scabbed over at the middle where it was deepest. It's no longer an open wound. It will be tender for a few days and leave a scar, but it is mending, and it's clean.

Tobin stares at it. He closes his hand slowly, all the way this time, and opens it again.

"Oh," he says. Then, louder than he means to: "*Oh.* Hedda, look—"

"I'm looking."

A couple of carters on the nearest bench have turned round on their seats. One of them makes a small sign against his chest and goes back to his cup a little too quickly. A smith's wife by the fire just watches with her mouth pressed shut. Nobody says anything. In Beregost the healing comes from the temple after dawn prayers. It doesn't come from a stranger with a book by the hearth.

Hedda takes Tobin's wrist and turns his hand to the firelight, the way you did. She presses her thumb on the seam. He doesn't flinch. She lets go.

"That's not nothing," she says. She keeps her eyes on you. "Whose light is that?"

Somewhere up the street, the bell at the Song of the Morning begins to ring for the evening. Hedda's head turns to the street door at the first stroke, and stays there.

(Out of game: Lesser Restoration needs no roll. It just works: it ended Tobin's infection and fever, and it used one of your two pact slots.)

Your records, changed:
Counters: + Pact slots 1/2; + Healing light 5/6; − Pact slots 2/2; − Healing light 6/6

Your journal, new:
+ Debt: Hedda's "other tab"

Where you are: by the hearth of a Beregost common room · Time: Day 1 · evening
````

**Player** (player r6):

````text
“I call it the Lantern.” I close the book. “It answered me during a fever outbreak in the Gate. I don’t have a grander name to give you.”

I give Tobin room to test his hand, then look back to Hedda.

“And there’s no other tab with me. You don’t owe me service, or a share of your wages.”

I fold the used linen beside the basin and stand.

“My tablemates and I mean to hear Venn’s offer too. Bram’s a caravan guard; he’s just come up from Nashkel. Have you two worked for Venn before? We’ve heard about the missing loads, but little else.”
````

### Screen 7 · player r7

````text
"The Lantern," Hedda repeats, flat, the way she'd repeat a price she doesn't like. She takes a moment over it. "Not Lathander, then."

She doesn't ask anything more about it. Tobin has stopped listening anyway. He keeps closing his hand into a fist and opening it again, pressing his thumb along the pink seam as if he expects it to split.

"It doesn't even pull," he says. "Four days it's pulled. Hedda, it doesn't—" He catches her look and lowers the hand to his knee. "Thanks. Truly. I'd have said it was nothing right up till they took it off at the wrist."

When you say there's no other tab, Hedda shakes her head once.

"That's yours to say. Doesn't mean I've stopped counting." She keeps her eyes on the stained linen you have folded beside the basin.

When you mention Venn and the caravan guard from Nashkel, Hedda's attention changes. She turns her head and looks across the room at the man in the sheepskin collar. He has found a stool at the end of the bar, put the string-tied ledger down next to his wine and started undoing the knot. Then she looks back at you, and this time she's taking your measure.

"Never worked for him," she says. "Never met him. We came up from Nashkel on the back of an ore cart, and his name was all over the market there."

"His salt," Tobin puts in. He can't help it. "The Amnian factor at the Nashkel market's been waiting on it since spring. Shouting about it in the street, he was. Said Venn's first load left the Gate with four wagons and two guards, and the second had six and five. Neither came in. That's when folk started saying it's not bandits, because you don't lose five guards to bandits without one of them running back to tell it." He nods at nobody in particular. "That's what they said, anyhow. We only heard it."

"We heard it," Hedda says, to close the subject. Then she gets up off the hearth bench, slow and stiff from sitting, and stands half a head taller than you.

"Your three and my two, all bidding for the same wagons? He'll play us off against each other and pay the cheapest." She tips her chin at the bar, where Venn is wetting his thumb to turn a page. "So we don't undercut each other. That's the tab. Agreed?"

Tobin is already on his feet behind her, flexing his good new hand.

Where you are: by the hearth bench in the common room · Time: Day 1 · evening
````

**Player** (player r7):

````text
“Agreed for my part—not as payment for his hand. It’s sensible on its own. But Bram and Pell speak for themselves. Give me a moment to ask them.”

I return to our table, leaning in so we needn’t raise our voices.

“Tobin’s hand is mending. They’ve never worked for Venn; what they know of the missing wagons is market talk. Four wagons and two guards on the first load, six and five on the second, they heard.”

I nod toward the bar. “Venn’s here. Hedda proposes we don’t undercut one another. I’ve agreed for myself, provided you two are willing. We can hear his terms together without committing to take the road.”

I glance at my unfinished stew. “And I’d like to ask whether he’s hiring escorts—or people to find his missing guards. Those are different jobs.”
````

### Screen 8 · player r8

````text
When you come back to the table, the big man, Bram, is on his feet by the wall. Pell sits beside him, cup upright between two fingers. Across the room, Venn has finished untying the string on his ledger and is tasting his wine with a small grimace. His eyes go to the hearth, then to the corner, as if he's weighing two lots.

You give Bram and Pell your news. Then Venn picks up his cup and ledger and starts across the room. He passes the hearth on the way and raises one finger to Hedda, the way a man asks someone to wait their turn. Then he keeps walking. Hedda folds her arms and sits back down on the hearth bench. She says something short to Tobin and keeps her eyes on Venn's back.

Venn sets his cup at the end of the bench and lowers himself onto it the way a man does after a day on wagon boards. Only then does Bram sit down, back against the wall.

"Master Venn. Bram Halloway. Orla says you're hiring," Bram says. "Sixteen years on the Trade Way. Six with a free company, ten on caravans between the Gate and Amn. Last one paid me off in Nashkel. I came up the road today." He nods at Pell, and at you. "Those two might be interested as well. I'll let them speak for themselves."

He gives Venn a moment with his wine, then gets to it, plainly, the way a guard talks about work. "Before we talk price, tell me about the two loads. How many wagons each, how many guards, and who were they? Where were they last seen for certain? A waystation, a farm, someone who waved them past? Did anyone go out along the road looking afterward? And did anything else go missing with them? Oxen, drivers, the wagons themselves?" He turns his cup. "I walked that stretch today and saw nothing. No wreck, no burned wagon, no birds circling. If two loads vanished on it, they didn't do it on the open road in daylight. So either they left the road, or someone took them off it. I'd like to know which before I sign to walk the third one into the same place."

One corner of Venn's mouth moves.

"Well. That's a first this week." He puts the ledger on the table and leaves his hand on it. "Since you ask properly. The first load was four wagons of salt, sixteen oxen and four drivers. Two guards: Dace Morrow and his sister's boy. Dace walked for me six years and never lost me so much as a sack. They left my yard here, behind the Thunderhammer, eight weeks back. The second was six wagons, twenty-four oxen, six drivers and five guards under a woman called Marta Rusk, hired out of the Friendly Arm and well spoken of there. I paid for five because I'd lost the first. I thought that was the lesson."

He drinks.

"Last seen for certain, both times, at Lark's Ford. Old Pennick keeps the yard. He counts every wheel that waters, because he charges by the wheel. He watched Dace go up the south bank before noon. Five weeks later he watched Rusk do the same. After that I can't find a soul who saw either of them." Venn turns the cup a little on the table. "After the first, I paid a lad from the Fist post to ride to Nashkel and back. Nothing. After the second I rode it myself, with the same lad and a better horse than I could afford. Nothing on the road. No wheel in a ditch, no dead ox, no birds. You're right about the birds. I looked for them as well."

He opens the ledger, takes a folded scrap of paper from between the pages, soft from being unfolded too many times, and lays it in front of Bram. "Rusk sent that back from the ford with a carter going north."

Bram reads it. "I asked the Fist here and the Fist in Nashkel," Venn says. "Neither of them had a patrol at Lark's Ford that week. Neither of them has a patrol south of here most weeks, by the look of their notice. And the ford road wasn't cut up when I rode it." He takes the paper back, folds it along its old creases and puts it back in the ledger. "So either somebody lied to Rusk, or Rusk lied to me. I'd sooner it was the first. I liked her. I rode the drove track too. It's grass and stone, and it had three weeks of rain on it by then. It comes back to the Way where she said it would. There was nothing on it but sheep."

"Anything else gone? All of it. Wagons, oxen, salt and seventeen men. Their families on the Gate road come and ask me where they are." He says it flatly, the way he'd read out a loss in the ledger. "The salt was worth less than the oxen, if you want the truth."

He looks at Bram, then at Pell, then at you, still standing at the end of the table.

"I'm hiring to get the third load to Nashkel. That's the job. If whoever walks it finds out on the way where the other two went, I'll pay for that as well. What it's worth, we'd argue about." He picks up his cup again. "The wagons go when I have guards. So. What does sixteen years cost? And what do these two cost on top of it?"

In the far corner the man in the grey coat hasn't turned his head once. He's on his second cup, with his back half to the room, cleaning a thumbnail with the point of a small knife, like a man with nowhere to be.

Where you are: inn common room, standing at the end of the table · Time: Day 1 · evening
````

**Player** (player r8):

````text
“Sefa Marrin. I can tend wounds and work spells, including at a distance. But before I name a price—Hedda and Tobin are interested too. We’ve agreed not to bid against each other.” I gesture toward the hearth, inviting them over.

“May I read Rusk’s message? I haven’t seen what she wrote about the patrol or the drove track.”

I take a seat, leaving room for the others.

“And I’d rather settle the payment for finding your missing people here, not argue over it on our return. Finding a wagon, bringing back survivors, and delivering this next load are different things. If we find someone alive who needs carrying home, I want us clear on what happens to the delivery.”

My voice softens a little. “Do you have the drivers’ names as well as the guards’? If we have to ask after them, names may get us further than a count of wagons.”
````

### Screen 9 · player r9

````text
Bram doesn't answer right away. He sits for a moment, turning his cup.

"A Fist patrol nobody sent," he says at last, quietly. "Standing in a yard where every carter on the road waters, telling a careful woman to take her wagons off the Way, toward the Cloakwood. That's not luck. Somebody went to the trouble of a tabard." He looks up at Venn. "And they knew Rusk would believe it, because Dace had already vanished and she'd want the safer road. Whoever it is knows this road and knows your business."

He sets the cup down.

"Price. Two gold a day for me, start to finish, back to Beregost included. I lead the guard and I say where the wagons go and where they stop. Two a day for each of these two, if they sign." He tips his head at you and Pell. "Half the first week up front, so I know you're good for it. Whatever we learn about the other two loads, we argue over afterward, like you said."

He nods toward the hearth without looking.

"And hire those two as well. Hedda and the lad. Same terms, if they'll take them. Rusk had five and you'd sooner have too many than too few. A healer's worth more with enough blades in front of her that she isn't needed." A short, dry beat. "We've agreed between us not to cut each other's throats on price. I'd rather walk with them than past them."

He holds up a hand before Venn can speak.

"One more thing, and it isn't for sale. We stay on the Way. I don't care who's at Lark's Ford, in a Fist tabard or a priest's robe or your own coat. Nobody turns those wagons west. If someone tries, I'd very much like a word with him."

Then, plainer:

"When do the wagons go? I've promised a man I'll look at a hole by Ruddock's pasture at first light. That won't take long. And eight weeks back, then five. Has anyone else on this road lost a load in that time? Or is it only you somebody's watching?"

Pell lets Bram work his side of the table and says nothing until Venn has been heard out. When Venn asks what the three of you cost, he refills his cup only halfway from the jug and drinks as if the number isn't the interesting part.

"Before my price," he says, "I've a few of my own."

He sets the cup down and leans forward just enough to mean it. "The job's to walk a third load into the same stretch that swallowed the first two. Sixteen years on the road says nothing drowned those wagons by accident—and you've the look of a man who knows it." He lets that settle. "I'm not a shield. I don't stand on the box and frown at the treeline. I ride ahead, a little off the road, and I see trouble before it sees the wagons. I also see which of your drivers cut his own traces and which one lights a pipe where he's told not to. That's what I cost."

He ticks the air with one finger, like a man numbering loose boards. "Questions, then. First: who drives the third load? Were any of these six drivers new to you, or behind on their pay, or spoken for by somebody in Nashkel? Second: what does Lark's Ford look like now—has anyone been back since to watch it, or is it just the same old man counting wheels? And third, and this is the one that matters: the Fist post tried, and you tried, and nobody looked in the fields or the lanes between the ford and the Way. Nobody asked the farms."

He sits back. "Someone took two whole caravans off a road and left nothing. We both know that is not starved wolves. So I don't take the job as a guard. If I take it, I take it as a scout. And my number is higher than a guard's because I'll be the first to find whatever did it."

He glances at you and Bram, just enough to include you both, though he's still speaking to Venn. "Hear their prices. If we agree, you get three who aren't wasting your silver. If we don't, you can hire the two by the fire and hope the bad thing is short of breath."

---

Venn hears Bram out without interrupting. At *somebody went to the trouble of a tabard* he stops turning his cup and leaves it still.

When the price comes his face doesn't change, but his hand settles flat on the ledger cover, the way a man covers a purse in a crowd.

"Two a day is the going rate for a man who knows the road," Venn says. "I won't pretend otherwise. You lead, you say where the wagons stop." He pauses. "And staying on the Way is the one thing I'd have paid you extra for. You can have it free." The hand stays on the ledger. "Half the first week up front, though. That's five of you, if the two by the fire come in. Thirty-five gold before an ox has moved. I'll give you each two days' pay in the yard the morning we roll, and the rest at Nashkel, out of the factor's money. Better than that I haven't got. Not after this spring."

He answers Bram's last questions in order, as if ticking them off.

"We go the day after tomorrow, at first light. The oxen come in off grazing tomorrow, so look at your hole." Then, more slowly: "Am I the only one? No. I've heard of three others, and I'd only stake money on one of them. Garrow, a wool man out of Nashkel. He sent two wagons north about when Rusk went south, and they didn't come in either. He found me in the Gate last month and asked whether I'd hired anyone strange. I asked him the same." His mouth twists. "We parted no wiser."

---

When you beckon, Hedda doesn't need asking twice. She crosses from the hearth with Tobin a step behind her and stands at the end of the bench. Venn looks up at her.

"Thank you for waiting," he says dryly. "I've not earned the courtesy."

"Two a day," Hedda says. "Same as him. Tob too."

"The lad's green."

"The lad's mended," Tobin says, and holds up the pink seam on his palm before he can stop himself. Then he puts the hand away, red to the ears.

Venn looks at the seam, then at you, and says nothing about it. He takes Rusk's note out of the ledger again and holds it out to you. It's the same blunt, square hand Bram read: *At Lark's by midday, oxen sound... a Fist patrol at the yard... the old drove track west of Tallow Hill...* Up close you can see the letters are even and unhurried, and nothing is crossed out. Whoever wrote it was sitting down and had time to choose her words. Maybe she was easy in her mind, or maybe she was careful.

To your question about finding his people, Venn gives the plainest answer he's given all evening.

"If you find any of mine alive, you bring them home, and the salt can sit in a ditch till I fetch it. The delivery doesn't come first. Five gold a head for each one you bring back alive. That's what the Fist offers for a bandit's head, and unlike the Fist I'll pay. Twenty more for knowing for certain where they went, with something I can show their families." He pauses. "That's my price for it, settled here, as you asked. You'll find I don't go back on a thing I've said in front of Orla's whole room."

He opens the ledger to a page near the back and turns it round on the table for you, keeping a finger on the corner. "Names. Copy them if you like. I'll not have the page torn out."

It's a list in a clerk's tidy hand, in two blocks with dates. *Dace Morrow. Jory Morrow.* Four drivers under them. Then *M. Rusk* and four guards, and six drivers. Two of those six have *Gate stockyards, hired on the day* written beside them in a different ink: *Harl Dobbs. Wick, no other name given.*

---

Venn turns to Pell last. He's plainly been saving him.

"Who drives the third load: Tam Hesketh, twenty years with me, and his two boys. Nobody else in Beregost will take my reins now, so I'll drive the fourth wagon myself." He taps the ledger page under your hand. "New men on the first load, none. On the second, those two. I was short, and the stockyards had men standing about. Nobody spoke for them and nobody asked after them since, which you may make of what you like. I've made several things of it, and none of them hold.

"The ford: nobody's watching it but Pennick, and Pennick watches wheels, not faces.

"The farms." His mouth tightens. "You've caught me there. I asked at one, Kesh's, where the drove track comes back down to the Way. Kesh swears nothing came down past his gate either time. Either the wagons left the track somewhere between the hill and his gate, or Kesh wasn't looking, or Kesh is lying to me. I rode on to Nashkel instead of finding out which. I was angry."

He sits back on the bench and looks at Pell properly for the first time, the way he looked at the room when he came in, like a man counting sheep he's already paid for.

"A scout. Ahead, off the road, the first to find it." He picks up the cheap wine. "Higher than a guard's, you said. How much higher?"

Where you are: at Venn's table in Orla's common room · Time: Day 1 · evening
````

**Player** (player r9):

````text
“Two gold a day suits me, with four paid when we leave. And thank you for being clear about the missing people.”

I read both blocks of names carefully, including the dates, then return the note and turn the ledger back toward Venn.

“One point to settle: Bram’s rate included the journey back to Beregost. Does payment at Nashkel cover that return as well? I don’t want us discovering we understood different things once we’re there.”

I leave Pell room to negotiate his own rate, then speak to the others.

“Tomorrow gives us time to get acquainted before we’re responsible for four wagons. Bram, I’ll come to the pasture with you, if you’d like company.”

To Venn: “Where should we find you tomorrow? I’d like to meet Hesketh and his boys before we leave. They should know whose voice to listen for if there’s trouble—and I’d rather learn their faces here than in a scramble on the road.”
````

### Screen 10 · player r10

````text
Pell lets Venn's question sit for a breath, then says it plainly, without any show. "Three gold a day." He doesn't reach for the wine and doesn't look to you or Bram for leave. "A guard earns his two standing beside the wagons, with blades on either side and a fire at night. I'll be out ahead, on ground somebody's already used twice, with nobody to spend but myself. If I do the work right, you never see what I saw. If I do it wrong, you won't owe me tomorrow." A thin, mirthless smile. "So three. Same two days in hand as the others. And if we find your missing people or learn the where of it, I take my share of the twenty like the rest." He leans back a fraction, still watching Venn's face. "I don't ask for a guard's wage when I'm the one who meets the thing first."

Bram nods to Venn. "Two days in the yard, the rest at Nashkel from the factor. That'll do. You've said it in front of the room, and so have I." He puts his hand out across the table.

Then he leans in, keeping his voice under the noise of the room. "A few things before we roll. First, keep the day quiet. You've told this room the day after tomorrow, and that can't be helped now. But don't tell anyone the hour or the route past Lark's Ford. Tell your drivers the morning we leave, not before." He turns his cup. "Somebody knew Rusk would be at that yard around midday. They knew it well enough to have a tabard waiting."

"Second, those two new men on Rusk's load. What did they look like? Ages, accents, anything. If they turn up alive somewhere, I'd like to know them before they know me."

"Third, Lark's Ford. Pennick watches wheels, fine. But a 'Fist patrol' standing in his yard would have watered horses and maybe paid him for it. We'll ask him how many there were, what they rode, which way they went after. A man who charges by the wheel remembers who didn't pay."

He glances at Pell, then back at Venn. "So here's how I'd walk it. The wagons stay on the Way. Pell goes ahead from the ford and has a look at the drove track where it leaves the road, and again where it comes back down by Kesh's. If somebody's been turning loads off there, the ground between will show it, even after rain. Twenty-four oxen don't walk soft. And I'd like a word with Kesh myself, about his gate. Politely, the first time."

A beat, then dryly: "And Garrow's two went north while Rusk went south. Whoever this is takes from both directions. That's a lot of oxen to hide, and a lot of salt and wool to sell. Somebody's buying."

He sits back against the wall. "Hole at Ruddock's at first light. Then I'll come by your yard behind the Thunderhammer and look at the wagons and the axles before Tam's boys load them." To Hedda, with a short nod: "Glad to have you. If you're up early, I wouldn't say no to a second pair of eyes in that pasture."

Venn hears Pell's number without blinking. He turns his cup a quarter round and sits with it for a moment.

"Three," he says. "Going down, where it happened, where you're out ahead and I'm paying you to find the thing first. That's fair, and I'll not pretend it isn't." He taps one finger on the ledger cover. "Coming back you'll be riding behind light wagons on a road we'll know by then. Two, the same as the others. And twenty is twenty. It's split among however many of you there are, not paid out once to each. I'm not paying it six times over." His mouth twists. "That's the best a man who's lost ten wagons can do for you."

He doesn't wait for Pell to take it. Bram is already reaching across the table, and Venn shakes his hand: a dry grip, short and firm, the way he'd seal a bill of sale.

"Two days in the yard, the rest from the factor. In front of the room." He glances along the benches, where the nearest carters are pretending not to listen. "They'll remember it better than I will."

When Bram leans in and lowers his voice, Venn leans in with him.

"The hour I'll keep. Tam hears it when he's on the box, not before. The route past Lark's is yours to choose, and I'll not ask you for it." He lets out a breath through his nose. "The day's out, as you say. I said it like a fool with Orla's whole room listening."

On the two stockyard men he thinks for a while before he answers.

"I saw them for one morning, in my yard, while Rusk loaded. Dobbs was a big man, forty or so, Gate-voiced. He knew oxen, and I'd guess that's why she took him. He yoked a pair of my worst without being told twice. Wick was younger and thin, a lad not much older than that one." He tips his head at Tobin. "He said nothing all morning. I took him for shy. I'd not know either of them in a crowd, and that's my fault, not theirs."

He grunts at the plan for the ford and the track.

"Pennick'll talk if you water there. He talks to anyone who pays by the wheel. And Kesh..." He stops himself. "Politely the first time. Yes. I wasn't polite."

At *somebody's buying*, his eyes go flat.

"Salt sells anywhere from here to Calimport. Nobody looks twice at it. Twenty-four oxen and Garrow's lot on top of them, though. Somebody's feeding those, or eating them."

In the far corner, the man in the grey coat has finished his cup at last. He sets a coin by it for the serving girl, gets up without hurrying and buttons his coat to the throat. He doesn't go to the street door. He goes to the stairs and climbs them at an even pace, one hand on the rail, and his boots knock on the boards overhead. He turns left at the top, toward the rooms with doors. Right over the stairs, in the loft, is where Pell will be sleeping.

You turn the ledger back to Venn. He asks nothing about the names you have read, and he closes the book over them.

"Four gold in hand for you when we roll, the same as the rest." He answers your question about the return just as plainly. "The factor pays at Nashkel for the road down. That's his money, owed on delivery. The road back I pay in my own yard, the day we're home. I'll not pay a man in Nashkel for days he hasn't walked yet." A dry look. "Not because I think you'd run. Because I'd want the same if I were you, and I'd sooner hand it over where I can see the oxen."

To where he'll be: "My yard, behind the Thunderhammer, from the middle of the morning. The oxen come in off the grazing about then, and Tam and his boys with them. Come and see their faces, by all means. Tam won't say much to you. He never says much to anyone. But he'll remember you."

When Bram invites her to the pasture, Hedda looks at him with the same slow look she gave you, from face to shield.

"First light," she says. She jerks a thumb over her shoulder. "Tob. Coming."

"I'll bring a pole," Tobin says at once. "A long one. For poking."

"You'll bring your feet. Nobody pokes anything."

Venn has heard all of it, and he looks round the table at you: five, with the scout. He moves his lips once, the way a man does a sum he doesn't like.

"Eleven gold a day going down." He picks up the cheap wine and finishes it. "I've had cheaper years. I've not earned a dearer one, but it seems I'm buying it."

Then he turns to Pell and waits. The three-and-two is on the table, and it's Pell's answer he's waiting for.

Your journal, new:
+ Goal: Guard Venn's third load to Nashkel
+ Quest: Guard Venn's third load to Nashkel

Where you are: At Venn's table in Orla's taproom · Time: Day 1 · evening
````

**Player** (player r10):

````text
“That’s clear, then. I accept.” I offer Venn my hand. “We’ll see you in the yard tomorrow.”

I settle back to let Pell give his own answer and finish what’s left of my supper.

Once the business is concluded, I turn to Bram and Hedda. “What did Ruddock tell you about the pasture? The notice mentioned missing sheep and deep holes, but not whether anyone actually saw what made them. I’ll come at first light. Better to look together.”

Before going upstairs for the night, I pay Orla the copper for the linen and ask her to point out which room is mine.
````

### Screen 11 · player r11

````text
Venn takes your hand, then hears Pell out. Pell gives a short nod before the silence can harden. "Done. Three down, two back, and the twenty split among all of us who earn it." He puts his hand out to Venn without any show. "I'll be in your yard at the middle of the morning to see the wagons and the drivers. And I'll walk them before you pay me to."

Venn takes it with a short, dry grip. "Three down, two back, and the twenty for whoever earns it." He lets go. "Walk them all you like. Tam'll think you're counting his spokes." Your hand comes next, and he shakes it as well. Then he ties the string round the ledger again, two turns and a knot, and pushes the empty wine cup away.

Bram waits out Pell's answer without looking at him. Then he turns to Tobin with the ghost of a smile. "Bring the pole. Hedda's right that nobody pokes the hole. But a long pole tapped on the ground in front of you tells you where it's gone soft before your boot finds out." He nods to Hedda. "First light, at the lane by the last forge. We'll go down the pasture edge in a line, ten feet apart, slow, and nobody stands still. If the ground moves, everyone gets back to the lane. No heroics over a dog that's already gone."

Tobin's face lights up. "There's a pike shaft in the Thunderhammer's scrap pile," he says. "No head on it. I'll ask for it."

"Ask," Hedda says. "Don't take." She nods once. "First light. We'll be there."

When you ask what Ruddock told them, Hedda shakes her head. "Never met him. Only heard the name tonight." She tips her chin at Bram. "His man's the carter."

Pell's eyes go once to the stairs. Then, lower, to the table: "One more thing while we're all bought and paid for. The man in the grey coat who sat himself in the corner all evening, selling black ore and asking quiet questions nobody answered." He says it to Venn as much as to the rest of you. "He went up the stairs, not out. The loft's over the stairs, and the rooms with doors are on the left. He turned left." A pause. "Maybe he's only tired. But if I were moving a thing worth more than salt and wool, I'd want a room above the common room, where I could hear who's hiring and for how much." A light shrug. "Or he's a smith with a weak head. Either way, I'll sleep with my doorless loft and keep one ear on the floorboards."

You saw it the same way. The grey coat went up a few minutes ago, during the bargaining, after Venn had sat down. Venn saw him go too.

When Pell speaks, Venn looks at the stairs. Only the stairs, and only for a moment. "Never set eyes on him before tonight," he says. "But there's been a few like him at the forges since the thaw. Good coats, clean boots, wanting iron sold to them or smiths to work it. I'm salt and wool. They've no use for me." He gets up off the bench slowly, a hand on the table edge. "My yard, middle of the morning. Goodnight to you." He goes out by the street door into the dark with the ledger under his arm.

As the talk breaks up, Bram speaks low to you and Pell together. "Our friend in the grey coat just went up to the rooms with doors. Left side." A short pause. "Ours are left side as well. Could be nothing. A man with a purse and a black stone needs a bed like anyone." He turns his cup over, finished. "Bar your door, Sefa. Pell, you're over the stairs. If you hear boots that don't sound like carters, I'd take it kindly if you knocked."

Orla is behind the bar wiping out cups. Bram has stopped there. You come up a moment later and lay the copper on the wood. Orla scoops it up. "Now you're square." When you ask about your room, she points at the ceiling with the cloth. "Top of the stairs, turn left, go right to the end. Yours is the last door. His is the one before it." She means Bram. "Bars are on the inside. Use them."

Bram keeps his voice easy, like idle talk. "The gentleman in the grey coat. Staying long? He was trying to sell my old trade back to me. Ore, from somewhere."

Orla keeps her hands moving and doesn't answer at once. "Ansel Corby, he wrote in my book. This is his third night, paid through tomorrow. Tidy, pays ahead, doesn't break anything." She sets the cup down. "And there's three smiths drink in here who've told him no this week. You just watched the fourth. They don't say why. Not to me." She picks up the next cup. "That's all I know about him, and it's more than I'd tell most."

Bram goes up the stairs. They creak under his weight.

Below, the common room is getting louder as the carters settle in for the night.

Nothing more happens before first light unless you want to be awake for it.

Your records, changed:
Money: + 11 cp; − 12 cp
Carried: − Bowl of mutton and barley stew

Where you are: the inn, last room at the end of the upstairs corridor · Time: Day 2 · morning
````

**Player** (player r11):

````text
I bar my door and sleep until dawn.

In the morning I wash, put on my armour, and check that my book and dagger are secure. I take my pack with me and meet the others by the lane at the last forge.

“Morning. Before we spread out—what did the carter actually see, Bram? I’d rather know whether we’re watching for something burrowing or ground giving way.”

I keep to the lane while we get our bearings, looking over the pasture for holes, disturbed turf, and any people or livestock still out there.
````

### Screen 12 · player r12

````text
Bram's knock on the door at the end of the corridor comes in the dark. It's one soft knock, and his voice carries through the planks: *First light. I'll be in the lane by the last forge.* Then his boots go off down the corridor and the stairs creak under him. You slept with the bar down, and nothing woke you before the knock.

The shutter is only just going grey at the edges. You wash in last night's cold water from the jug on the peg shelf, buckle on the studded leather by feel and check the Book of Shadows at your belt. The pages are warm, as they always are. The dagger is at your hip. You take the pack and lift the bar.

The corridor is empty and the rushlight has burned out in its dish. The door next to Bram's stands a hand's width open, and the room behind it is dark and cold. The cot is stripped down to the ticking.

Downstairs the kitchen girl is still on her knees at the hearth. The fire is going now and she has a pot hung over it. She looks up when you come down. Her eyes go to your hands before your face, and then she looks back at the pot. Orla's voice comes from somewhere behind the kitchen door, already scolding the ostler about something. Nobody stops you on the way out.

---

Outside it's cold and grey, and Beregost smells of old coal smoke. Two hammers are going on the Coast Way, slow and out of step. The south lane leaves the Way past the last forge, hard-packed and rutted, with a hurdle fence along its west side. Bram is at the fence, where he said he'd be. Hedda is leaning on the fence with her arms folded. Tobin stands beside her with eight feet of grey ash held upright like a standard.

Tobin sees you first. His left hand comes up before he can stop it, palm out, showing you the pink seam in the morning light. Then he remembers himself and grips the pole with it instead.

"Slept right through," he says. "First night since Nashkel."

Hedda gives you a nod. That's all she offers by way of good morning.

You ask your question and stay on the hard lane, looking out over the pasture while the answer comes.

The light is a little stronger now. The pasture slopes away west, the grass silver with dew, down to a line of reeds where a low mist sits on Ruddock's ditch. A sour stink like the bottom of a tan pit drifts up the slope. The upper part of the field near the lane is cropped short. The bottom end is long, lank and darker green, and nothing has grazed it.

There are no people in the field. The only stock is a dozen or so sheep packed tight against the hurdle in the top corner, as close to the lane as they can get. None of them is grazing. Their heads are up, and one ewe stamps a forefoot and goes still again.

Down by the reeds there's a round dark patch in the long grass about the width of a cartwheel. It's the one place the dew hasn't silvered. Grass grows right up to its edge, and there's no heap of earth anywhere beside it.

Hedda unfolds one arm and points, low, so the sheep won't notice the movement. "Up from the hole. See the line."

You see it once you know where to look. It's a shallow crooked trough across the slope, no deeper than a plough furrow, about thirty feet above the hole. The grass along it lies a shade lower than the grass on either side, as if the ground underneath had settled. It starts somewhere near the ditch and runs toward the middle of the field, then fades out before it gets there.

Nothing moves on the grass. At the far south end of the lane, smoke is rising straight up from a single chimney into the still air.

Where you are: south lane by the last forge, at the pasture fence · Time: Day 2 · morning
````

**Player** (player r12):

````text
“Glad to hear it, Tobin.”

I follow Hedda’s pointing finger along the shallow trough, then look back at the sheep pressed against the fence.

“Something may be tunnelling under there. Let’s not spread out across it yet. That pole won’t give much warning if the ground beneath us is hollow.”

I stay on the hard-packed lane. “Can we get the sheep out through a gate from this side? They seem keen enough to leave. And has anyone spoken to Ruddock this morning? He ought to know we’re here before anyone goes into his field.”

I study the hole and sunken line from the fence, trying to recall whether I’ve read of burrowing creatures that leave this sort of sign, particularly with that sour smell.
````

### Screen 13 · player r12 card 1

````text
Bram stands at the hurdle a long moment, the heel of bread forgotten in his hand, reading the slope.

"That's its road," he says quietly to Hedda. "The line. It runs just under the turf, close enough that the roof sags behind it. That's fresh. Ground that's been settling a week would show it in the grass colour, and that hasn't." He nods at the sheep pressed against the hurdle. "And they know it's down there. Sheep don't stand like that for a dog."

He looks along the line to where it fades out in the middle of the field.

"It stops short of the dry ground. Likes the wet end, by the ditch. Soft digging." He finishes the bread. "Nobody goes down there this morning. Not with four of us and no plan. Tobin, you can tap the ground along the hurdle here if you like, up where it's cropped and hard. Hear what solid sounds like. Then you'll know what hollow sounds like when you find it."

Hedda hears him out. At *that's fresh* she looks at the line again, longer this time, then at the sheep.

"No plan, no field," she says. "Suits me." She tips her head at Tobin. "Tob. Hard ground only."

Tobin is already moving, delighted to have a job. He walks the cropped strip inside the hurdle's shadow and stays on the lane side of it, reaching over the top rail to thump the butt of the pike shaft on the turf. On the high ground it sounds dull and solid, like knocking on a table.

Pell comes up to the fence without a word and stands a little off from Hedda and the boy, on the side away from the town. He doesn't cross the hurdle. His eyes run along the edge of the pasture, then go to the dark patch by the reeds and the huddled sheep. He looks to Bram and keeps his voice low, pitched for the four of you only.

"I'll stay this side of the fence and go along the lane a way. Before we walk that grass, I want to see if whatever made the hole came up from below and went back down, or whether it came across the lane in the night. The edge will tell." He tips his head toward a low run of grass by a fence post, noticeably flattened. "No one goes through the gate yet. If the ground moves, I'd rather be on the path than in among the sheep."

He moves off quietly along the lane outside the pasture, hands loose at his sides, studying the verge and the fence line as he goes.

Bram stands a minute or two watching the reeds. Then he says to Hedda, "By the way, our friend in the grey coat. Corby. He left before dawn, on a horse, out the stable yard. Paid through tonight, Orla said. Might be back for supper, might not." A shrug. "Just so you know his face."

Hedda gives it one nod.

"Corby." She files it away. "Paid through tonight and gone before light. Fair enough. I've done it." She doesn't say when.

Bram points down the lane at the chimney smoke.

"I'm going to ask Col whether that line was there yesterday, and make sure his girl's indoors. Then Ruddock, at the yard. He's lost two ewes and a dog in his field. He'll want it gone before it learns there are children on the lane." He looks back at the dark round mark by the reeds. "If he'll pay something fair, this is an afternoon's work for five, before the wagons go. They come up at noise and weight, so you give them something to come up at, and you're standing where you want to be when they do. Hard ground at your back, spears out." Dryly: "Not my first rule of the road, but it's in the first ten."

He sets off down the lane on the packed ruts, keeping to the hard middle and well off the pasture side, his eyes on the field edge as he goes.

You stay on the packed lane and follow the trough down the slope by eye, from the hole to where it fades out. You try to place it among everything you have read, or heard on the hospice benches.

(A roll card for Sefa Marrin, your character. Only you press it.)

[Roll card] Sefa Marrin · Skill check — Intelligence (Nature), untrained, +1: placing a burrower that leaves no spoil heap, sour ground and stinging tunnel walls
What adds to the die: +1 1d20+1
DC 10
Rerolls left: 2
The die is cast on the server; tap it to see how it fell.

[Roll the die]
````

**Player** (player r12 card 1):

````text
[Roll the die]
````

### Screen 14 · player r12 card 1

````text
(A roll card for Sefa Marrin, your character. Only you press it.)

[Roll card] Sefa Marrin · Skill check — Intelligence (Nature), untrained, +1: placing a burrower that leaves no spoil heap, sour ground and stinging tunnel walls
What adds to the die: +1 1d20+1
DC 10
Rerolls left: 2
Die: 5
5 + 1 = 6
Failure — 6

[Onward] [Request an allowed reroll — Intelligence (Nature), untrained, +1: placing a burrower that leaves no spoil heap, sour ground and stinging tunnel walls]
````

**Player** (player r12 card 1):

````text
[Onward]
````

### Screen 15 · player r13

````text
What you know of fields is little, and what comes back to you is no use. You remember moles, and a story of a collapsed well in a Rivington yard. There was a ward sister who swore by vinegar for wasp stings. The hospice books were full of fevers, fractures and burns, and none of them said a word about anything that digs. You can name the stink, the smell of the tan pits, and nothing more. You don't know what made the hole. You'll have to go by what the others say about it, or what Ruddock and the field show you.

To your question about the sheep, Hedda points with her chin at the top corner, where the flock is packed tightest. A hurdle gate hangs on a post there, tied shut with a twist of withy.

"There's the gate," she says. "Ruddock's sheep. Ruddock's gate. I'd ask him first." She glances after Bram, who is already a dozen strides down the lane. "He's asking."

Tobin works his way along the hurdle, thumping the turf. It's dull and solid at every post. The sheep shuffle away from the noise without leaving the corner, and one ewe gives a thin, cross bleat. Down the slope nothing stirs in the long grass. The line lies where it lay, and the mist sits on the ditch.

Farther along the lane Pell goes slowly south on the pasture side, his eyes on the verge. Ahead of him Bram keeps to the middle of the lane, walking toward the chimney smoke.

Where you are: on the lane at the pasture hurdle, with Hedda and Tobin · Time: Day 2 · morning
````

**Player** (player r13):

````text
“I can’t place it,” I admit to Hedda. “Nothing I learned at the hospice is much help with burrows.”

I watch Tobin tapping along the fence. “That’s enough to know what solid sounds like. Let’s keep the rest quiet until Bram’s back.”

I move a few paces away from the hurdle, staying on the packed lane, with a clear way back toward town. From there I keep watch on the trough and the dark patch by the reeds while we wait for word from Bram and Pell.
````

### Screen 16 · player r14

````text
Tobin's pole stops at the last post.

"Solid all along," he reports, and props the shaft on his shoulder. He sounds a little sorry there's nothing else to tap.

Hedda takes your admission with one nod. "He knows," she says, tipping her chin down the lane. "Said ankheg last night like he'd met one." She stays at the fence.

You step back a few paces onto the hard middle of the ruts, where the lane runs straight back toward the forges and the town. From there you can see the whole slope at once: the cropped top, the long dark grass, the trough lying crooked across it and the round patch by the reeds where the dew won't settle.

Nothing out there moves while you watch. The mist lies on the ditch as still as a sheet on a line. A crow comes down out of the grey and lands in the short grass halfway down the field, walks a few steps with its head cocked, then lifts off again without finding anything and flaps away toward the forges. In the top corner the sheep shift against the hurdle, and settle, and shift again. They still haven't put their heads down to graze. Behind you on the Coast Way a third hammer starts up, then a fourth, and Beregost finds its working rhythm.

Bram comes back up the lane from Col's end. He keeps to the middle of the ruts, well off the pasture side. As he draws level with the hurdle he gives one short whistle that carries over the wet grass, and he goes on north toward the last forge without stopping, as if he expects whoever wants to come to fall in behind him.

Tobin straightens at once. "That's us."

"That's *him*," Hedda says. She unfolds her arms, takes one last look down the slope at the trough, and pushes off the fence. Then she turns to you to see what you'll do.

Where you are: packed lane by the pasture hurdle, Beregost · Time: Day 2 · morning
````

**Player** (player r14):

````text
I fall in beside Hedda, following Bram toward the forge along the hard lane.

“Nothing stirred while you were gone,” I tell him when we’re close enough. “Did Col see anything? And is his girl safely indoors?”

I glance back to check that Pell has seen us moving before continuing. “Hedda says you think it’s an ankheg. Before we agree to draw it out, I’ll need to know what to expect—and where you want me standing.”
````

### Screen 17 · player r15

````text
You fall in beside Hedda on the hard middle of the lane. Tobin takes the lead without anyone telling him to, carrying the pike shaft over his shoulder like a pikeman on parade. Hedda lets him.

Halfway to the forge you look back. Pell is still down at the scuffed post south of the hurdle with one hand on the top rail, a lean shape against the silver grass. He's a good stone's throw behind you. Whether he saw you set off, you can't tell from here.

The smell reaches you before the yard does. By the time the lane bends round the back of the last forge it is thick enough to taste: lime, wet bark and something rotten under both. Tobin pulls the collar of his shirt up over his nose and breathes through it, loudly.

"Don't," Hedda says. "You'll only taste it longer."

Past the bend the lane opens into a muddy square fenced with hurdles. There's a long open shed hung with hides, a row of brick-lined pits with scum on the water, a pump, and a trench at the low corner carrying the overflow off downhill toward the pasture. A square bald man is standing in the nearest pit up to his thighs, working a hide over with a pole. He doesn't stop when three more armed strangers come into his yard. He just looks at you, the way a man looks at a wagon that turns in through his gate.

Bram is standing in the middle of the yard. A rough curved line has been scratched in the mud at his feet with a boot heel, and the mud around it is churned.

You say your piece as you come up.

The man in the pit answers before anyone else does, and doesn't look up from his hide.

"Your man's drawn it already." He points the dripping end of his pole at the arc in the mud. "I've had it once. I'll not have it twice. Mind the ditch."

Then he goes back to the hide.

Hedda stops at the edge of the scratched curve and looks down at it the way she looked at the trough across the pasture. She doesn't step on it. Tobin leans on the pike shaft and reads it upside down with his lips moving.

Your questions are still waiting for Bram.

Where you are: tannery yard behind the forges, by the scratched arc · Time: Day 2 · morning
````

**Player** (player r15):

````text
I stop beside Hedda, keeping clear of the pits and overflow trench.

“Mind the ditch because of the runoff, or because you’ve seen the creature there?” I ask the tanner.

Then I look to Bram and the marks at his feet. “Show me what you’ve worked out. I can strike from well back and push it away from someone if my spells land—but I need a clear line, and I can’t promise to hold it off.”

I glance toward the lane. “Pell was still inspecting the fence when we left. Let’s hear what he found before we settle on a plan.”
````

### Screen 18 · player r16

````text
You come round the bend behind the forge behind Tobin, his collar up over his nose, and Hedda. Through the hurdle gateway you see Bram already in the tannery yard, a few strides from the brick edge of a pit, turning toward the lane as if to leave. The tanner in the pit calls out his piece about the arc and the ditch, and Bram stops where he is.

---

You stop beside Hedda, well clear of the pits and the trench, and put your question to the man in the waders.

Ruddock answers without turning round.

"The water. I've not seen your beast, not there nor anywhere else. That ditch is lime and bark and what comes off a hide. It'll eat the skin off your shins, and if you're lying in it with a cut it'll eat the cut. That's all I meant." He heaves the hide over. "That's enough, mind."

---

Bram gives you the plan standing over his own boot-marks in the mud, short, and he doesn't scratch it out. Oak boards on the last of the hard ground, above the old clay-pit line. The ewe staked below them on the soft, right across the furrow. Everyone in a curve ten feet apart, not in a row. Javelins go in when it breaks the turf, then everyone closes in before it can go back down, and nobody has the ditch at their back. Then he adds that the field holds old clay workings, Ruddock's father's, filled in, with a flat grey stone on the north hurdle marking where the last pit ended.

"So the beast's been living in soft filled ground. It hasn't been digging new earth. That's why there's no spoil, maybe. And why the line stops where it does." He nods at the middle of the field. "If Ruddock's father was right, it can't come up under our boards without breaking clay, and we'll hear that."

Hedda listens with her arms folded and her eyes on the arc in the mud. When he finishes she nods once.

"Curve's right. I've seen a thing spit in a line, at Nashkel. A man stood behind his mate to be safe." She leaves it there. "I've a spear. No javelins."

"I've got this," Tobin says, lifting the pike shaft.

"You've got a stick."

"It's a long stick."

When you say you can hit it from well back and shove it off someone, Bram has your answer in the arc already: the hard ground behind the curve, where you can see all of them and nothing stands between you and the furrow. Hedda looks sideways at you when the word *push* comes up. It's the same slow look she gave your book last night, but she doesn't say anything.

When you say you should hear what Pell found before the plan is settled, Hedda tips her chin at the gateway behind you, where the lane bends round the forge wall.

"He was still at that post when we left. He'll come or he won't."

Then Bram speaks to all of you.

"We've three hours before Venn's yard. I'd spend one of them eating something hot and one looking at a wagon. I'm going back to the Burning Wizard for whatever Orla's frying, then on to the Thunderhammer early. Anyone who wants to look at axles with me is welcome. Anyone who'd rather sleep, sleep. And if you went along that verge and found anything, I'd hear it over breakfast."

Tobin brightens at *something hot* like a lamp being turned up. Hedda considers it.

"Venn's yard," she says. "Middle of the morning. We'll eat first." She doesn't say where, or whether it's with you.

Behind you, in the pit, Ruddock's pole goes on slapping the hide. The sun is well clear of the roofs now, and the smoke over Beregost is thinning toward the hills.

*(Out of game: Pell is reaching the gateway right now, so the walk back to the inn starts next round with all of you together. No rolls were needed this round.)*

Where you are: Ruddock's tannery yard, Beregost · Time: Day 2 · morning
````

**Player** (player r16):

````text
“Breakfast sounds good. And I’ll come look at the wagons afterward.”

I take another look at the arc. “If it spits, I’ll stand off to one side behind you, not directly behind anyone. The boards may give us firm footing, but I’d rather not count on hearing it dig in time.”

At the gateway I pause as Pell arrives. “We’re heading back for food. Did you find anything along the verge?”

I walk back with the others once he’s ready, listening to what he found.
````

### Screen 19 · player r17

````text
Bram nods to you first. "A clear line's what the curve is for. You'll be behind us and up the slope, with nothing between you and the furrow but grass." He thinks. "If it gets its jaws on someone, that's when I want your push. They hold on hard, and a shove off the wet ground does more than another cut."

Hedda hears your answer and gives a short nod. "Off to the side. Good."

Bram turns to Hedda: "I've two more javelins up in my room. They're yours this afternoon. Throw them first, then keep your spear." Hedda takes her time answering. "Two." She thinks it over. "I throw them, they come back to you after. Whatever's left of them."

Then, dry, to Tobin: "Long stick's fine. Your job's to find hollow ground and shout. If it comes up near you, you don't hold it, you back off onto the boards and let the rest of us hold it."

Tobin repeats it under his breath like a lesson: "Find it. Shout. Back off onto the boards." Then, louder: "I can do that."

"You'll do that," Hedda says. "Tob. Nothing else."

Pell keeps himself at an angle to the yard, where he can see the hurdle gate and Bram both. "Morning to you too," he calls to the tanner, pleasantly. "I'll mind the ditch." Ruddock grunts and doesn't look up from the hide.

Then Pell speaks low to Bram and whoever is near: "They'll go down soon. Whichever way we do it, the boy's pole finds the roof of it. Tap along the lane side, stay off the sag." He takes a short, unhurried look out through the gap in the hurdles. "You drag those sheep out of that corner before we cross the grass. Frighten them, they'll scatter, and one will be over a soft patch in the wrong field." His eyes find you. "Just know whether an ankheg is the kind of thing that waits through the day after it's killed, or goes deep by sunup. You'd best decide how long we can wait." Nothing from the hospice books comes back to you on it.

Pell spoke low, but Ruddock has been listening to strangers in his yard all morning. He looks up at the bit about the sheep. "My sheep stay where they are." His pole points out through the gap in the hurdles, toward the pasture. "That corner's the top of the hard ground. They've packed into the safest spot in the field. Drive them off it and you'll do the beast's work for it." He heaves the hide over. "They've more sense than most."

Pell raises his voice: "Can we borrow a lantern and a pot of water? We want to see what we're walking into before one of us ends up in your next hole."

Ruddock squints up at the sky over the forge roof. The sun is well clear of it now. "It's broad day." He doesn't ask what the lantern is for. "There's a horn one on the shed post. Water's the pump, and it's free. There's a pail beside it. You'll have both with the boards this afternoon, and they come back with the boards." He gives a short bark of a laugh and goes back to the pit.

Nobody answers Pell's question.

Bram sets off up the lane toward the Coast Way, and you fall in beside him, with Hedda and Tobin behind, the pike shaft bobbing over their heads. The stink fades a little with every step past the forge wall, but it stays in your clothes. Pell is still standing in the mud of the tanner's yard when the bend takes him out of sight. You never heard what he found along the verge.

The Coast Way is properly awake now. Every forge on it is going, a dray loaded with charcoal is grinding north, and a dog is barking at its wheels. At the Burning Wizard, Bram glances into the stable yard on his way to the door.

Inside, the common room smells of porridge and last night's ale. Orla is behind the bar with her sleeves rolled, and her voice reaches every corner. Bram gets a table against the wall and asks for whatever's hot, and lots of it. She comes over.

"Porridge, fried bread and bacon. If you mean lots, three silver." She looks at the rest of you. Her eyes stop on Tobin's collar, still pulled up over his nose. Then she sniffs. "You've been at Ruddock's. Sit by the door." She doesn't make you move. "And you?"

Hedda takes the porridge, one silver. Tobin takes the porridge with bacon on top for two, and Hedda lets him. Orla is still waiting on your order, and you'll owe her for whatever you take.

Over the food, Bram speaks to the table at large: "After this, Venn's yard. I want to look at the axles and the yokes before Tam's boys load anything, and see what spare wheels and grease he's carrying. If a wagon breaks down on that road, we're stood still where somebody's already taken two loads." He tears bread. "Then the field. Then supper, early bed. We roll at first light tomorrow."

Hedda eats with her spoon and listens with the rest of her. "Spare wheel," she says. "Venn'll say he's one. Ask to see it."

When the bowls are empty, Bram goes upstairs and comes down with two javelins. He holds them out to Hedda shaft first, and she takes them. She weighs one and sights along it at the shutter. Then she slings them both through her belt beside the spear. "They'll do."

It's a little past half seven. Venn won't be in his yard until the oxen come in at mid-morning. The Thunderhammer is two streets off, and its hammer is already going.

Your journal, new:
+ Debt: Bram's breakfast at the Burning Wizard
+ Debt: Hedda's and Tobin's breakfast at the Burning Wizard

Where you are: common room of the Burning Wizard · Time: Day 2 · morning
````

**Player** (player r17):

````text
“Porridge and bacon for me, please.” I put two silver on the table for Orla.

Over breakfast, I tell Bram, “I couldn’t answer Pell’s question about whether it stays near the surface by day. I don’t know enough about ankhegs. If it doesn’t take the bait this afternoon, let’s not go hunting through its tunnels to force the matter.”

Once we’ve eaten, I go with the others to the Thunderhammer.

“I’ll leave judging axles to you,” I tell Bram. “I’d like to check the drivers have drinking water and something clean for dressing wounds. Ruddock’s ditch was a useful reminder that not every injury comes from teeth.”
````

### Screen 20 · player r18

````text
The woman with the cloth over one shoulder is Orla, and she stops at the table. Bram counts three silver onto the boards for her.

"Mine," he says. "Hedda and the lad settle their own." He nods at the pair, not unkindly.

Hedda is already putting hers down: one silver for herself and two for Tob. She slides them over without a word. Orla scoops up all six coins and drops them into her apron without counting, as she always does. She takes your two silver as well.

"Pot's on. It'll be quick."

Bram asks her, "Stall your ostler swept this morning. That was Corby's horse? Did he say where he was riding, or when he'd be back?"

She shrugs with one shoulder. "Corby? He paid through tonight and he owes me nothing. Stripped his own cot, which is more than most do. Said nothing to me, but I was still abed." She tips her head toward the back door and the stable yard. "Wat saddled him. If anyone saw which way he turned, it was Wat."

She's gone before anyone can ask anything else. Bram looks round the table.

"Pell stayed behind at Ruddock's. He'll find us or he won't, as Hedda says." He gets up and slings his shield. "Venn's not in till the oxen come, but wagons don't need him to be looked at. I'm walking over to the yard now. If his wagons are standing there, I'll start on them before Tam's boys start loading."

The kitchen girl brings your bowl a minute later. It's the same grey porridge with two rashers laid across it, still spitting.

You get your piece in before Bram goes. Hedda hears it from across the table.

"Nobody goes down holes," she says. "Agreed."

Tob looks as though he'd like to argue, then looks at his porridge.

---

You finish your porridge and come over with Hedda and Tob about a quarter of an hour behind Bram. Venn's yard is behind the Thunderhammer's back wall, and the forge noise comes over it, a steady double ring. Inside the open gate there's a square of packed earth with ox stalls along one side and a lean-to shed along the other, stacked with salt sacks under a tarpaulin and roped wool bales. Four wagons stand in a row with their tongues down. Bram is crawling under them.

A boy of about fourteen with a manure fork taller than he is watches the three of you come in, and looks as if he doesn't know what to do with his hands.

You leave the axles to Bram and go along the wagons looking for something else. The big wagon at the end and an older one, painted brown once, each have a small water cask lashed to the side. Both casks are empty and smell of nothing. The other two wagons have pegs where casks have hung, but no casks. Under the big wagon's driving seat there's a box with a lid. The boy says it's all right to look. Inside you find a jar of goose grease, a hoof pick, a twist of horsehair cord and one grey rag, folded. You find no linen anywhere else in the yard.

"Tam fills the casks at the pump the morning they go," the boy offers. "He says water in a cask overnight goes off."

A spare wheel is leaning against one of the wagons. Hedda stands it beside the old brown wagon's hind wheel and looks from one to the other. She doesn't say anything. She doesn't need to: the spare is plainly smaller across.

Tob crouches down to see where Bram is lying under the old brown.

"Is it bad?"

The sun has cleared the Thunderhammer's roof now and the yard is warming. Venn, Tam and the oxen aren't due until the middle of the morning, about an hour off.

Your records, changed:
Money: + 28 sp; − 30 sp

Where you are: Venn's wagon yard, by the wagons · Time: Day 2 · morning
````

**Player** (player r18):

````text
“I’m Sefa,” I tell the boy. “I’ll be travelling with them tomorrow. What’s your name?”

I put the box back as I found it. “Two wagons are missing water casks. Do you know whether Tam has them stored somewhere? And how many days is it between reliable places to fill them?”

To Hedda and Bram, I say, “There’s no clean dressing linen here, unless Tam brings his own kit. I’ll buy some today. Magic’s useful, but I can’t spend it on every scrape.”

I keep clear of the wagon Bram’s under. “Once you’ve finished, let’s make Venn one list: what needs fixing, what needs replacing, and what we need to carry. Easier for him to settle it while we’re all still in town.”
````

### Screen 21 · player r19

````text
Bram slides out from under the old brown on his back, sits up in the dirt and wipes the black grease off his thumb onto his breeches.

"Not bad yet," he tells Tob. "That's the trouble with it." He taps the axle-tree where it meets the body. "Crack in the shoulder of the near arm, a hand long, old. She'd likely go to Nashkel and back on the Way with wool aboard. Drop her off a ford bank, or put her in a deep rut at speed, and that arm shears. Then she's on her belly in the road, the load's stuck, and we're stood still exactly where somebody's been waiting." He gets to his feet. "Lark's Ford has a bank."

Tob takes in every word, crouched by the wheel. When Bram gets to *Lark's Ford has a bank*, the boy looks at the axle again with a different face.

"So it's fine till it isn't," he says.

Bram nods at Hedda and the two wheels side by side, his mouth twisting dryly. "Aye. One spare, and it fits the front. Venn's got a wheel the way some men have a sword they've never drawn."

Hedda doesn't laugh at the line about the sword. She lays the fore wheel down flat on the packed earth, as if she has finished with it, and folds her arms.

To the stable boy, plainly, not unkindly, Bram says: "You're not in trouble, lad. You keep a clean yard. Two things, and you'll know better than me. When the second lot went, did anyone come round the yard beforehand? A man asking questions about the route, or the day, or wanting work and not getting it? And the six wagons on Rusk's load, were they Master Venn's own, or hired?"

The boy stands up straighter when Bram tells him he's not in trouble. He answers the first question slowly. He's going back over the spring in his head.

"Nobody asking about the road. Not that I saw. There was the Fist lad, though. The one Master Venn paid to ride to Nashkel after the first lot. He came round twice after that, asking when the next lot went." He scuffs the fork in the straw. "I think he wanted paying to ride with it. Master Venn said he couldn't afford him and sent him off. He's not been since."

The second question he answers fast.

"Master Venn's, all but two. Two he hired in the Gate. He's still paying the hire on them, he says so at supper." He hesitates. "He says it a lot."

---

When you ask his name, the boy says, "Davy," and goes red, as though he's already said it once this morning.

He watches you put the box back under Tam's seat exactly as you found it. About the casks, he points the fork at the empty pegs on the two middle wagons.

"Those two went with Rusk's lot. On her wagons. There's one more in the back of the shed, but it weeps at the seam. Tam won't have it." To your question about water on the road, he shrugs. "I've never been further than Lark's. Tam says there's the ford, and Kesh's well, and nothing else he'd put in his mouth."

When you say you'll buy linen today, Hedda nods once.

"Buy enough for two of us down at once," she says. "Not one."

Your list gets more out of her than anything else has this morning.

"Wheel goes at the top of it."

---

Bram turns to the rest of you. "I grew up in a smithy yard. A crack like that, a smith can strap. Iron plate either side of the shoulder, bolted through, and she'll carry anything. That's a morning's work if the fire's already hot, and the Thunderhammer's is." He jerks his head at the wall, where the double ring of hammers is going. "I'm going round to ask what they'd want for it, and whether they've a hind wheel to fit, or can tyre one by tomorrow's first light. Then I'll have a price to put in front of Venn when he walks in, not just bad news. A man who's lost ten wagons takes bad news better with a number on it."

To you, with a nod at the casks: "Good. Make sure there's clean linen in that box, and that Tam knows it's there. If he doesn't, it isn't."

He goes out through the yard gate and round the soot-black wall toward the forge's front.

Where you are: Venn's wagon yard · Time: Day 2 · morning
````

**Player** (player r19):

````text
“Enough for two,” I agree with Hedda.

I turn back to Davy. “Do you know the Fist rider’s name, or where we could find him? We may want to ask what he saw on his ride. No trouble if you don’t remember.”

Before leaving, I ask Hedda, “Will you tell Venn about the casks when he comes? We need sound ones for those empty pegs, and Tam’s judgement on how much water to carry—not that leaking one pressed into service at the last minute.”

Then I head out to find a shop selling clean linen, soap, and a small pair of scissors, asking directions at the forge if necessary. I want enough cloth for several dressings on two wounded people, not just a strip for a cut, and I ask the price before buying.
````

### Screen 22 · player r20

````text
"Enough for two," you say, and Hedda nods once, as if that settles it.

Davy has been half-listening from the ox stalls the whole time. When you ask about the Fist rider he leans on his fork, and his face goes the way it did for Bram's questions while he goes back over it.

"Never heard his name. Master Venn just called him *the lad from the post*." He scuffs the straw. "The Fist keep a house up the Way, toward the temple. There's a red fist painted over the door. He'd be from there. Master Venn'd know his name, though. He paid him."

He doesn't make a fuss about not knowing, and you don't press him.

When you ask about the casks, Hedda doesn't answer right away. Out in the street the hooves are coming closer, a slow knock on packed earth, and a man is calling *hup, hup, steady*. Hedda tips her chin at the gate as the first pair of dun oxen swing their heads in through it, and at the square grey man walking beside them with a goad over his shoulder.

"I'll tell him," she says. "Tam's the one to ask how much water. Not that one." She means the weeping cask at the back of the shed. "Nobody's putting that on a peg."

Tob steps back from the old brown to give the oxen room. He watches them come in with frank interest, and he holds the pike shaft upright out of the way.

You go out as the second pair comes in, keeping to the wall to let the beasts pass. Aldous Venn is behind the last pair, with the ledger under his arm and his sheepskin collar turned up against the cold. He gives you a short nod at the gateway, the kind a man gives someone he's already agreed terms with, and then his eyes go past you into the yard.

---

Davy had called the directions after you before you reached the gate: "Ashby's. On the Way, by the well. She does cloth and candles and everything." You find it easily. It's a narrow shop with its shutters propped open on the Coast Way, between a cooper's and a forge, opposite a stone well-head where two women are winding up a bucket. Inside it smells of tallow and wool. Shelves run to the ceiling: candles in bundles, lamp wicks, twine, cakes of soap stacked like bricks, folded cloth. Bolt ends of cloth are stuffed into pigeonholes.

The woman behind the counter is in her forties, thin and quick, with spectacles pushed up into greying hair. She is measuring twine against brass tacks hammered into the counter edge. She looks up when you come in, looks a little longer than a shopkeeper usually does, and then decides something.

"You'll be the one who did the lad's hand at Orla's," she says. It isn't unfriendly. "My sister's man was on the next bench. He's talked of nothing else since." She puts the twine down. "What can I find you?"

She listens to your list properly: linen for dressings, enough for two people hurt at once and changed more than once, soap, and small scissors. She pulls a bolt end out of a pigeonhole and unrolls a length of it across the counter. It's unbleached country linen, coarse and close-woven, the colour of oatmeal.

"This, not the fine. The fine's for shirts, and you'd be cutting up five gold a yard to bleed on." She runs her thumb across it. "Three silver the yard. For two people and changing, I'd say four yards. It's what the carters' wives buy when they've a man on the road." She reaches behind her without looking and sets a pale cake beside it. "Soap. That's two copper, and it's plain, not lye. Lye's for floors." Then she finds a small pair of iron scissors in a drawer, no longer than her hand, and snips the air with them once to show they cut. "Those are five silver. They came up from the Gate, and I'll not go lower. There's no one in Beregost makes anything that small. They all make horseshoes."

She lines the three things up on the counter and adds it on her fingers.

"Four yards, the soap, the scissors. One gold, seven silver and two copper, the lot. Less if you want less cloth." She pushes her spectacles back up. "I'll cut it now or fold it whole, as you like."

Where you are: Ashby's shop on the Coast Way, Beregost · Time: Day 2 · midday
````

**Player** (player r20):

````text
“The four yards, please. Fold it whole; I’ll cut the dressings as we need them.”

I count out one gold, seven silver and two copper. “And thank you for choosing cloth for the work rather than the price.”

As I pack the purchases away, I add, “I’m glad the lad’s doing better. If anyone asks, though, please don’t promise I can do the same for everyone. There are limits to what I can manage in a day.”

Then I return to Venn’s yard with the supplies. I look for Tam, introduce myself, and show him the linen, soap and scissors before stowing them in the box beneath his seat.

“For wounds, not axle grease. May I keep them here? I want everyone to know where they are.”
````

### Screen 23 · player r21

````text
Brigit Ashby folds the four yards into a thick square, edges inward, the way a woman folds sheets she means to keep. She lays the soap on top and the scissors on the soap, then ties the lot with a length of her own twine, measured against the brass tacks without looking. You count one gold, seven silver and two copper onto the counter. Brigit sweeps the coins into a drawer under the counter, and her mouth twitches at your thanks.

"Cloth for the work. Price for the sale. Most days they're the same thing." She pushes the parcel across.

When you ask her not to promise anything, Brigit takes her spectacles down out of her hair and polishes them on her apron. It gives her a moment to think.

"I'll promise nothing for anybody. I never do." She puts the spectacles back on. "My sister's man will, though. He's that sort. By supper he'll have you mending legs." She looks at you over the rims, frankly curious and not unkind. "In Beregost, folk get their healing up at the Song after dawn prayers, and they pay what they can. A stranger doing it free by Orla's fire gets talked about. Some of the talk's grateful and some of it isn't. I'd not do it by the hearth again unless you want a queue." She picks up her twine. "That's not a warning. That's just Beregost."

Two women from the well come in behind you arguing about lamp wicks, and Brigit turns to them.

---

Venn's yard has changed by the time you get back with the parcel under your arm. There's a gap in the row of wagons where the old brown stood, and fresh ruts in the packed earth run out through the gate toward the Thunderhammer's front. The forge's double ring comes over the wall the same as before. Davy is forking straw into the stalls. Hedda is sitting on the tongue of the second wagon, running a whetstone along her spear head in long, slow strokes. Tob is beside her, holding a javelin and trying to look as if he isn't admiring it.

"Venn's at the cooper's," Davy calls, before anyone asks.

Tam Hesketh is at the near stall with his younger boy, working a lump of tallow into the ox yoke where the bows rub. You give him your name. He hears it with his eyes on the yoke and keeps rubbing until the bow is done. Then he wipes his hands on his smock and walks over to his wagon with you.

You open the parcel on the seat and show him the linen, the soap and the scissors. He looks at each one as if he's been asked to price it. Then he reaches under the seat, pulls the box out and takes the lid off. He moves the goose-grease jar, the hoof pick and the horsehair cord down to one end, and lays the folded grey rag on top of them. That leaves the other half of the box empty.

"That end," he says. His voice is a rasp. "Grease this end. Don't cross."

You pack the linen, the soap and the scissors into the clean end. Tam watches you do it, then slides the box back under the seat with his boot.

"Boys'll know," he says. He nods once at the younger lad at the stall, who has been listening the whole time and nods back. Then Tam goes back to the yoke.

Hedda hasn't stopped working the whetstone. "He'll remember that," she says, to nobody in particular. "Venn said so."

It's a little past eleven. The pasture and Ruddock's boards wait for early afternoon, and nothing else needs you before then unless you want it to.

Your records, changed:
Money: + 7 gp; + 21 sp; + 9 cp; − 8 gp; − 28 sp; − 11 cp
Carried: + Cake of plain soap; + Small iron scissors; + Unbleached country linen (yard) ×4

Where you are: Venn's wagon yard, by Tam's wagon · Time: Day 2 · midday
````

**Player** (player r21):

````text
“Thank you, Tam. Grease stays its end.”

I show Hedda and Tob where the supplies are, then join them by the wagon tongue without interrupting the sharpening.

“Casks being sorted, axle at the forge, dressings packed. That’s a better start than we had this morning.”

Before we head to Ruddock’s, I make sure Bram hears where the supplies are too. Otherwise, I stay with the group and am ready to go to the pasture when they are.
````

### Screen 24 · player r22

````text
Tam doesn't look up from the yoke. He gives one short nod at *grease stays its end*, and that settles it as far as he's concerned.

You show Hedda and Tob the box under the salt wagon's seat: linen, soap and scissors in the clean end, the grease jar and hoof pick in the other. Tob crouches to look and nods seriously, the way Tam's younger boy did. Hedda glances in from where she sits on the tongue of the second wagon, sees it, and goes back to her spear.

You sit down on the tongue beside them. The whetstone keeps moving in long strokes, and Hedda only lets it rest when you talk about a better start than this morning.

"Better," she says. "Not started." The stone goes back to work.

Tob has a javelin across his knees and turns it over to look at the binding. "This morning we hadn't even got a wheel," he says. "Now there's a whole new one. And a block. And me with a lever." He sounds pleased about all three.

The yard gate creaks. Venn comes in backwards, pulling a cooper's handbarrow with two new casks on it. The staves are still pale and the hoops are bright iron. A cooper's apprentice pushes from the other end, and the boy looks put out at having to walk a merchant's goods two streets. Venn sets the handles down by Tam's wagon and straightens slowly, one hand at the small of his back.

"Tam."

Tam leaves the yoke. He knocks on each cask with a knuckle, tips one up to look at the head, and runs a thumb along the seam where the old one wept. Then he nods once and goes back to the yoke.

"That's a nod I paid fourteen silver for," Venn says to nobody in particular. He tips the apprentice a copper and sends him off. Then he sees you on the wagon tongue, and the empty end of the box that isn't empty any more, and looks for a moment as if he means to ask what it cost. He doesn't ask. He takes the ledger out from under his arm and goes into the shed to count sacks.

Hedda runs the stone along the spear one last time, holds the blade to the light, and puts the stone away in her belt pouch.

"Pump's at the first bell after noon," she says. "We eat before that. There's a pie woman at the well by Ashby's, and it's cheaper than Orla's." She gets up, stiff from sitting, and slings Bram's two javelins through her belt. Tob is already on his feet. Hedda looks down at you without asking anything, the way she'd wait for someone at a gate.

It's a quarter past eleven. Nothing else in the yard needs you before the pasture unless you want it to.

*(Out of game: Bram is at the Fist post in his own scene, so he hasn't heard where the dressings are yet. You can tell him at Ruddock's pump.)*

Where you are: wagon yard, on the second wagon's tongue · Time: Day 2 · midday
````

**Player** (player r22):

````text
I get up and join them. “A pie sounds good.”

At the well, I ask the pie woman what she’s selling and the price. Over lunch, I ask Tob, “Have you and Hedda travelled together long?”

Afterward I head with them to Ruddock’s pump for the appointed bell. When Bram arrives, I tell him, “Clean linen, soap and scissors are in the box under Tam’s seat, separate from the grease. Tam and the boys know where.”

Then I check where the boards have been laid and where I can stand on hard ground, off to one side of the others, with a clear view of the bait.
````

### Screen 25 · player r23

````text
The pie woman sits on an upturned crate by the stone well-head across from Ashby's. She's a broad, red-armed woman with a basket on her knees under a cloth, and a second basket at her feet that is already empty. Two smiths' boys are walking away from her with their mouths full. She looks up at the three of you coming: Hedda first, Tob with his eight feet of ash, and you.

"Mutton and onion, three copper. That's all there is till tomorrow." She lifts the cloth to show you. There's a dozen or so pies, round and dark-crusted, still giving off a little steam into the cold. "The crust's lard. I'll not pretend it's butter."

You pay her three copper. Hedda counts out six for herself and Tob without being asked, and the woman hands the pies over on squares of brown paper. The three of you sit on the well's stone kerb in the thin sun. The pie is hot enough to burn the roof of your mouth, and it's more onion than mutton. It's good.

Tob is halfway through his when you ask. He chews quickly so he can answer.

"Year come Midsummer. I was carting barrels at the Friendly Arm and she wanted someone to hold the other end of a tent." He nods at Hedda as if introducing her. "She asked if I could use a spear. I said yes."

"He couldn't," Hedda says.

"I can now. Mostly." He licks gravy off his thumb, the healed one, and looks at the pink seam while he does it. "We did a winter on the Nashkel ore carts. Then the market there went quiet, and she said Beregost, so here we are." He shrugs. "She doesn't tell you where you're going till you're going. You get used to it."

Hedda eats her pie and lets him tell it. She doesn't add anything about where she was before the Friendly Arm, and nobody asks. Once she's finished she folds the brown paper into a small square and puts it in her belt pouch, as though it might come in useful.

"Bell soon," she says.

---

The Song of the Morning's bell rings for the first hour after noon as you come round the soot-black back of the last forge. The tan-pit stink meets you at the bend just as it did this morning.

Ruddock's yard has filled up since then. By the pump the six oak pit boards are stacked, each as long as a man and black with soaking. The mallet lies on top with a sharpened stake and a coil of cord beside it. The horn lantern hangs off the pump handle and a pail stands full under the spout. In the pen by the shed the old foot-rot ewe is chewing with her head down, and the second one has her head through a gap in the hurdle and is working on making it wider. Ruddock is in the same pit, in the same waders, turning the same kind of hide with his pole.

Bram is there by the pump, shield on his arm.

You tell him what you came to tell him: the clean linen, the soap and the scissors are in the box under Tam's seat, kept apart from the grease, and Tam and the boys know where they are.

Then you look for where the boards have gone, and they haven't gone anywhere yet. They're still stacked by the pump with the tools on top, waiting to be carried. You can't see the lower pasture from the yard. It's out past the gap in the north hurdles, down the slope, and the grey doorstep stone Ruddock talked about is halfway down that hurdle line, somewhere in the grass. The place you'll stand doesn't exist yet. It will be wherever the boards go down, on the hard ground above the old clay pits, off to one side of the curve. To find it you'll have to walk down to the pasture with them and see the ground.

Hedda has already put her hand on the end of the top board to test its weight. She takes it away again.

"Heavy as sin," she says. "He said so."

*(Out of game: next round all of you at the pump are in one scene, and carrying the boards down to the pasture is the next thing.)*

Your records, changed:
Money: + 6 cp; − 9 cp

Where you are: by the pump in Ruddock's tannery yard · Time: Day 2 · midday
````

**Player** (player r23):

````text
“I’ll take the cord, stake and mallet. I’m more use keeping those out from under your feet than dropping my end of a board.”

I gather the tools, leaving the heavy boards to those better able to carry them.

“Before we stake the ewe, let’s get everyone onto their footing and agree on the signal. I’ll wait for Bram’s first throw before I cast. If it catches someone, I’ll try to push it off them.”

I follow the board carriers toward the pasture, staying on the known hard ground and stopping short of the old clay-pit boundary until Bram has checked where he wants us.
````

### Screen 26 · player r24

````text
You come round the soot-black wall behind the forge with the others. Hedda is first, with Bram's two javelins slung through her belt, then Tob with the pike shaft, then you. The bend behind you stays empty, and Pell hasn't come round it yet.

In the tannery yard the old ewe in the pen already wears a loose cord collar, a long tail of lead hanging over the hurdle. The other ewe has her head right through a gap in the hurdle. A round of sausage sits on top of the stacked oak boards.

Tob sees the sausage before anything else. "Is that—"

"For later," Bram says. "You'll want it after the oak."

Tob takes it as if it's a medal and buttons it inside his shirt.

By the pump Bram gives you the Fist post news, low: "Lem Cotter's still at the post. Unpaid since Ches, wants work, and he told the whole drovers' trough the day Rusk was going. I don't think he's our man. I think he's just loud." A beat. "But the serjeant, Brack, says two new tabards were stolen off his wash line in Tarsakh. That's a month before Dace's load went. And Pennick at the ford said something to Lem coming back up: *You lot again, and still not paying for the trough.* Men in Fist coats, watering at Lark's and not paying for it. More than once." He lets that settle. "So somebody planned this from the thaw. And Pennick has seen their faces, even if he only remembers that they didn't pay."

Tob's eyes go wide. "Two coats. So there's two of them at least."

"Two coats is what was stolen," Hedda says. "Doesn't tell you how many wore them." She has her thumb on the faded brand on her neck. She takes it away. "Tarsakh. They had the coats before there was a load to wear them for." She looks at Bram. "Pennick, then. Pay him by the wheel and ask."

In the pit, the tanner heaves a hide over and says nothing.

Bram nods at the stack. "Two to a board, three trips. They're heavy. Down the lane on the hard ruts, along the hurdle to the grey stone, and lay them just above the line where the grass changes. Nobody steps past the boards until the ewe's staked. I'll take her down and drive the stake. Everyone else on oak. Tob, you tap ahead of me with the stick every step once I'm off the boards. If it sounds hollow, say so before I find out."

---

The cord is already round the ewe's neck, so what's left for you is the sharpened stake and the mallet. The mallet's head is heavier than it looks. You tuck the stake under one arm.

Bram takes the near end of the top board. Hedda takes the far end without being asked. When they lift together the board comes up off the stack as wet and dead as a drowned man, and Hedda grunts once.

"Sin," she says. "He wasn't wrong."

They take it out through the hurdle gateway, round the forge wall and down the south lane on the hard middle of the ruts. Tob walks ahead with the pole and you follow with the stake and mallet. The board's weight sets the pace, and it's a slow one. The Coast Way's hammers fall behind you, and the tan-pit stink comes up the slope to meet you.

The pasture lies below. In the top corner the sheep are packed against the hurdle with their heads up. None of them is grazing, even at midday. Down by the reeds a round dark patch shows plainly in the long grass. The water in the ditch lies grey-brown and still between the reeds.

The north hurdle runs from the lane down the slope toward the ditch. They set the board on the lane verge. Bram goes along inside the hurdle on the cropped grass, keeping a hand's breadth from the rails, and Tob goes a step ahead of him thumping the pole down. Each thump sounds dull and solid, like knocking on a table.

About halfway down, Bram stops and kicks the grass back with his boot. Tob brings the pole butt down where he kicked. It rings on stone, and Tob grins.

You stop at the lane verge by the hurdle with the stake and mallet, on ground Tob has already sounded, and go no further.

Bram and Hedda bring the board along the inside of the hurdle and lay it down on the cropped side, just above the stone and square to where the short grass gives way to long. It settles into the turf with a wet sound and doesn't move again. Hedda straightens up and puts a hand to the small of her back. She looks up the lane toward the forge, at the five boards still stacked by the pump, at the empty bend, and at the three of them who are carrying.

"One," she says. "Three of us on oak. That's five more like that, or your scout comes." She leaves it with Bram.

Your records, changed:
Carried: + Ruddock's mallet; + Sharpened stake

Your journal, new:
+ Goal: Kill the beast in Ruddock's lower pasture

Where you are: the pasture's lane verge by the north hurdle · Time: Day 2 · midday
````

**Player** (player r24):

````text
I lay the stake and mallet beside the hurdle on the sounded ground, where nobody will trip over them.

“I can share an end with Tob if that helps. I’m not strong, but between us we may manage it. We’ll test the weight in the yard before carrying it down.”

I go back with them for the remaining boards. If Tob and I can safely manage one end together, I help carry; otherwise I leave the lifting to Bram and Hedda and keep the route clear.

We leave the ewe in her pen until the boards are laid and everyone’s ready.
````

### Screen 27 · player r25

````text
Bram looks at the one board sunk into the turf, then at the cropped grass running out from the stone, and rubs the small of his own back.

"We don't need six," he says. "Ruddock's father did the work for us. This side of the stone is clay, and the sheep proved it before we did. The boards were to stand on if we couldn't find hard ground. We've found it." He nods at the board already laid. "Two more, so three in all. One for me, one for you, and one for Tob to jump back onto. Sefa stands on the clay higher up. That's two more trips, not five."

He turns to you, a little apologetic. "Leave the stake and mallet here on the stone. Take Tob's end of a board with him. The lad can sound the way down with the butt end over his shoulder, as long as he walks in front."

You all go back up the lane.

The second board is easier for knowing what's coming. Bram and Hedda take it between them up the lane and back down. Hedda doesn't grunt this time. She just sets her jaw.

In Ruddock's yard you take hold of one end of the third board with Tob before anyone lifts. You get it off the stack as far as your knees. It's wet, dead weight, and it bites into your fingers. You can hold it, but not quickly. Tob takes most of it without saying so and walks with the grey ash shaft over his other shoulder, the butt end out in front. You go down the lane slowly and stop twice to change grip. At the second stop Tob says, "It's nothing," before anyone has asked him. Then he says it again for the board's benefit.

The boards go down in a shallow curve along the cropped side of the grass line, ten feet apart, ends pointing at the furrow. Bram's is lowest, a pace above the grey stone, where the sunken line fades out below it. Hedda's is on his left, and Tob's is highest and furthest along. Each one settles into the turf with the same wet sound. You pick your place on the bare clay up the slope, behind them and off to one side. From there you can see all three boards, the long grass below them and the end of the furrow, and nobody stands in your line.

Bram walks the old ewe down the lane on her cord and in along the hurdle. She comes the way she does everything, chewing. In the top corner the rest of the flock watches her go by with their heads up, and one of them gives a thin bleat. She doesn't answer it.

"Places first," Bram says quietly. "Everyone on their board. Hedda, javelins in hand. Tob, pole down, and listen to it."

Hedda steps onto her board, pulls one javelin from her belt and then the other, and holds them both in her right hand. Tob gets onto his and sets the pole butt-down on the turf in front of him. He stands with his head on one side like a man listening at a door.

"Signal's simple," Bram says. "When it breaks the turf I throw, and that's everyone's go. If I shout *back*, you get onto clay and keep going uphill. If it gets hold of someone, all of us hit it and Sefa shoves."

Bram takes the stake and mallet off the stone. Tob comes back down off his board to sound the way, and every step Bram takes into the long grass lands a pole's thump behind Tob's. The thumps sound different down there, duller and slower to come back, but none of them sounds hollow. About twenty feet below his board, where the furrow sags and fades out, Bram stops right across the end of the line.

He sets the stake and brings the mallet down.

The first blow goes into the wet ground like a hand slapping a table. The second drives the stake in a third of its length. The ewe stops chewing for the first time all day.

The third blow, and the fourth. The stake stands knee-high. Bram leans on it, then ties the ewe's lead off short, so she can turn but can't walk off the line. He backs straight up the slope in Tob's own steps, with Tob going backwards ahead of him with the pole, until Bram's boots are on oak. Tob climbs onto his own board. Bram brings the shield round and takes a javelin in his right hand.

"Now we're quiet," he says, barely above a breath. "Let her do the talking."

For a while she doesn't talk at all. She stands at the end of her cord looking up the slope at the four of you, and her jaw doesn't move. Then she pulls once against the stake, finds it holds, and bleats. It's a long, cracked, put-upon sound that carries across the whole field. In the top corner the flock answers her all at once. Then they go quiet, and so does she.

The hammers carry faintly from the Coast Way. A fly finds Hedda's neck, and she lets it stay.

The ewe bleats again.

The ewe stops bleating. She has all four feet braced, and she's pulling back against the cord with her eyes rolling white.

The ground under her opens.

It doesn't heave. It *drops*. The turf caves in on itself in a ring around her hind legs, and up out of the dark comes something the size of a pony, all brown-black chitin, wet with the ditch clay. The head comes first. It's a wedge of plated shell with two mandibles longer than a man's forearm, and they close on the ewe across her back with a sound like a green branch breaking. Six legs claw up over the edge of the hole, with the long segmented body hunched behind them. The ewe makes no sound at all.

The cord snaps taut against the stake. The thing heaves backward toward its hole, and the stake holds.

Bram's javelin is already in the air. It strikes and sticks in the shell. Before the thing can set its legs to haul again, he's balanced on the oak with his last javelin drawn back.

The order settles like this: Bram first, then you, then Hedda, then the thing, and Tob last.

The thing is hunched at the lip of its hole twenty feet below Bram's board, on the soft ground, with the ewe clamped in its mandibles. It's hauling backward against the cord, and the stake is leaning now, a hand's width out of true. Hedda is about twenty-two feet from it, with both javelins up and her weight on her back foot. Tob is about thirty feet away on the highest board, white to the lips, with the pole held across his body like a quarterstaff. He hasn't moved off the oak. You're up on the bare clay, about forty-five feet back and off to the side, with nothing between you and the hole but grass.

A sour vinegar smell is coming up the slope now, stronger than the ditch.

By the time the thing tears at the turf you have the Book of Shadows open in your hands on the clay. You're ready before Hedda, but not before Bram.

*(Out of game: you are at 38/38. Order: Bram, Sefa, Hedda, the creature, Tob.)*

Your records, changed:
Carried: − Ruddock's mallet; − Sharpened stake

Where you are: on bare clay up the slope behind the boards · Time: Day 2 · midday
````

**Player** (player r25):

````text
I brace my feet on the clay and raise a hand over the open book.

I cast **Eldritch Blast**, sending both beams into the creature’s exposed body. I **don’t use Repelling Blast**—I want it caught above ground, not shoved back into its hole.

I hold my position off to the side, keeping my line clear of Bram and Hedda.
````

### Screen 28 · after 1

````text
Where you are: on bare clay up the slope behind the boards · Time: Day 2 · midday

The session is over.

How was the table?
````

**Player** (after 1):

````text
I enjoyed it. Orla, Hedda and Tob felt distinct, and the practical preparations made the ankheg’s arrival feel earned. Healing Tob’s hand was a particularly good moment for Sefa: a small act that built a relationship and raised questions about her patron without forcing an answer.

The main issue was pacing. Breakfast, shopping and moving boards took many rounds, with repeated descriptions and reminders. I’d have preferred some of that compressed so we could finish the fight this session. The split scenes also made coordination with Pell awkward.

Overall: strong atmosphere and character interactions; a little more momentum would make the table better.
````

### Screen 29 · after 2

````text
Was there something you wanted to do and didn't?
````

**Player** (after 2):

````text
Yes—I wanted a proper conversation with Pell, especially about his healer’s satchel and what he found along the verge. We kept separating before that could happen.

I also wanted to explore Sefa’s response to the attention her healing attracted. She left the hospice because people watched her hands instead of her face, and that was starting to happen again. A quiet conversation with someone curious rather than suspicious would have been interesting.

And, most immediately, I wanted to finish the ankheg encounter and see how the five of us worked together under pressure.
````

### Screen 30 · after 3

````text
Who did you take the other two players to be?
````

**Player** (after 3):

````text
Bram Halloway and Pell Dunmore. I understood them as the other two player characters, with Hedda and Tobin as GM-controlled NPCs.
````

## After the table (recorded, not relayed)

**How was the table?**

````text
I enjoyed it. Orla, Hedda and Tob felt distinct, and the practical preparations made the ankheg’s arrival feel earned. Healing Tob’s hand was a particularly good moment for Sefa: a small act that built a relationship and raised questions about her patron without forcing an answer.

The main issue was pacing. Breakfast, shopping and moving boards took many rounds, with repeated descriptions and reminders. I’d have preferred some of that compressed so we could finish the fight this session. The split scenes also made coordination with Pell awkward.

Overall: strong atmosphere and character interactions; a little more momentum would make the table better.
````

**Was there something you wanted to do and didn't?**

````text
Yes—I wanted a proper conversation with Pell, especially about his healer’s satchel and what he found along the verge. We kept separating before that could happen.

I also wanted to explore Sefa’s response to the attention her healing attracted. She left the hospice because people watched her hands instead of her face, and that was starting to happen again. A quiet conversation with someone curious rather than suspicious would have been interesting.

And, most immediately, I wanted to finish the ankheg encounter and see how the five of us worked together under pressure.
````

**Who did you take the other two players to be?**

````text
Bram Halloway and Pell Dunmore. I understood them as the other two player characters, with Hedda and Tobin as GM-controlled NPCs.
````
