# SAND-T1′ — Bram Halloway's player: Claude Opus 5.5

Synthetic content: invented characters in an invented campaign (Table C's Beregost files, docs/campaigns/baldurs-gate-en). Stage origin/claude/handoff at 23220d6 (docs/stages/GAME_PARTY_1.md, the amendment of 2026-10-27 16:36 LA); design sha256 `a39fed4738bc3e499ae4007e794f2e8f49197f09c09f57e828a13e4192078d91`.

Arm **P-SAND**, triad T1; 25 round(s) of 25; ended by error (r25: the DM's turn failed (conflict)). The DM: Claude Opus 5.5 with the owner's settings (Opus writes — Opus records, depth high → xhigh); the relay: the same model at medium. Started 2026-10-29T07:32:34.375Z.

Seats: 1. Bram Halloway (fighter) — Claude Opus 5.5; 2. Sefa Marrin (warlock) — GPT-6.1 Sol; 3. Pell Dunmore (rogue) — DeepSeek V4 Pro 0813. The players are not told what the others are.

Known condition: Seat 1's character (Bram) is the app's hero record; Sefa and Pell are party companions with full records. Known condition, not corrected: the DM's frame is written around the hero and may give that seat more attention; Heroic Inspiration is the hero's only; the allowed rerolls (2 per session) are the table's, shared by all three. The rotation puts each family in that seat once per triad.

**No hidden layer:** P-SAND plays pure simulation (no prep).

The world's snapshot: sha256 `1649b61c08e027ff44de2bb5065046f872e383a00c5d04803d95553f58568f5a` (the same wizard, sheets and opening for both triads).

The player's system prompt: `playerSystem("SAND", "bram", "v2")` in scripts/game-party-1/frozen.mjs, sha256 `505af3c607c6f6e081b87f1f4e4b603a1a45270f255b20d0ab783ddc39b9639a` (the files, then the table's rules; door line v2). At the table to the end.

Each «Screen» block is what this player was shown; each «Player» block is the player's message as written.

### Screen 1 · player r1

````text
The session begins.

Beregost smells of coal smoke and hot iron even in here. Through the shutters comes the steady ring of hammers from the smithies along the Coast Way, and the light is going amber. The Burning Wizard's common room is filling up for the evening: carters, a pair of dusty sellswords, townsfolk with soot still on their forearms. The benches are crowded, and that is how you end up at the same table as two strangers.

You sit with your back to the wall and your shield propped against the bench, the old company mark painted over. Across from you is a young woman who looks fresh off the road. Beside her is a lean man with a healer's satchel slung at his hip. He sat down so quietly that nobody heard him do it.

None of you has said a word to the others yet. Then the innkeeper pushes through the crowd with a jug in one hand and three cups hooked on her fingers. She sets them down hard and looks from one face to the next.

"Last free seats in the house, and you three took them together," she says. "So: one tab or three? And what brings each of you into Beregost tonight?"

Your records:
Bram Halloway — Human, fighter 5 (Champion; Protection fighting style), former caravan guard of the Trade Way, level 5
HP 44/44 · AC 18 · Speed 30 feet
STR 17 · DEX 12 · CON 15 · INT 10 · WIS 13 · CHA 10
Skills: Athletics +6; Perception +4; Survival +4; Intimidation +3; Tools: land vehicles +3
Saves: Strength saving throw +6 (proficient); Constitution saving throw +5 (proficient); Dexterity saving throw +1; Intelligence saving throw +0; Wisdom saving throw +1; Charisma saving throw +0
Attacks: Longsword +6 to hit, 1d8+3 slashing (1d10+3 two-handed); Javelin +6 to hit, 1d6+3 piercing, range 30/120; Extra Attack: two attacks with the Attack action
Abilities: Proficiency bonus +3; Extra Attack: attacks twice when taking the Attack action; Fighting style, Protection: with a shield, a reaction imposes disadvantage on an attack against a creature within 5 feet of him; Second Wind: a bonus action, regains 1d10+5 hit points; once per short rest; Action Surge: one additional action on his turn; once per short rest; Improved Critical (Champion): a weapon attack crits on 19 or 20; Healer's kit: stabilises a dying creature without a check (ten uses)
Limits: No magic at all; Heavy armour: disadvantage on Stealth; Second Wind and Action Surge return only after a short rest
Counters: Hit dice 5/5; Second wind 1/1; Action surge 1/1
Money: 23 gp; 14 sp; 30 cp
Worn: Armor / clothing: Chain Mail; Main hand: Longsword; Off hand: Shield
Pack: Bedroll and Hardtack; Healer's Kit; Hempen Rope (50 feet); Javelin ×4; Tinderbox; Torch ×3

Where you are: shared table, Burning Wizard common room · Time: Day 1 · evening
````

**Player** (player r1):

````text
Bram drops a few coins on the table before anyone else can sort it out: three silver, enough for the jug and a little extra.

"That covers the jug. Put the cups on whoever drinks the most," he says, nodding at the other two with a half-smile. "Separate tabs after that. I don't know these two well enough yet to pay for their supper."

He pours for all three without asking, then sits back against the wall.

"Came up the Coast Way from Nashkel. My last caravan paid me off there. Sixteen years on the Trade Way, and the ones who hire guards are getting fewer and nervous-er." He glances toward the dusty sellswords near the hearth, then back at the innkeeper. "So: a bed for the night, a hot meal, and an ear for whoever's hiring. If someone in town is looking for a shield, I'd like to hear it."

He lifts his cup a little toward the young woman and the quiet man with the satchel.

"Bram Halloway. Road's been long and dry. Where'd you two come in from?"

*(Bram is also keeping half an eye on the room, out of habit. Who's drinking hard, who's watching the door, whether anyone looks like trouble.)*
````

### Screen 2 · player r2

````text
The young woman speaks up: "Three tabs, please. We've not yet had time to become bad influences on one another."

She sets her pack beneath the bench. "Sefa Marrin. Down from the Gate, and tonight I'm mostly here for supper and somewhere to sleep. What's hot, and what does a bed cost?"

She turns toward you and the quiet man, with a glance at his satchel. "I used to work in a hospice. If either of you has a cure for feet after a day on the road, I'm listening."

The quiet man with the satchel lifts his cup an inch, as if testing its weight, then sets it down without drinking. His eyes move from Sefa to you, unhurried.

"Three tabs," he says, mild, with the faintest edge of a Lower City rasp. "No sense in strangers arguing over a bill before they've shared a word."

He half-turns to glance at the crowded common room, then back to the innkeeper. "And as for me, I came in off the High Hedge road. Looking for a room and a quiet cup before I work out whether there's work here worth staying for." A small pause, a shrug. "Thought Beregost might have use for a man who can get into places — or out of them — without knocking over the furniture."

He lets it land, then adds, more plainly: "Pell."

The innkeeper scoops your three silver off the table without counting it and drops it into her apron.

"Jug's paid. Three tabs, then." She taps the table edge once for each of you, as if fixing your places in her head. "Stew's mutton and barley, three silver the bowl with bread. There's a pie too, but it's yesterday's, and I'll not lie about it. Beds: five silver in the loft, where the carters snore, or eight for a room with a door and a bar on it. Pay me when you've eaten. I know where you're sitting."

She glances at Pell when he mentions getting into places, and her eyebrows go up a little. "Not into my cellar, you won't."

Then, to you, shoving a stray cup further onto the table with her hip: "Hiring. You've timed it well or badly, I can't tell which. There's a wool and salt man, Aldous Venn, with wagons out of the Gate. He's had two loads not turn up in Nashkel since the thaw. No wreck found, no word, nothing. He's been in most nights after the temple bell, asking about guards and complaining about the price. Those two by the fire are waiting on him as well." She tips her head toward the hearth. "And there's a notice board by the door, if you read. Half of it's smiths wanting apprentices. Sit tight. Stew's coming."

She's gone into the crowd before anyone can answer.

From where you sit against the wall you can see most of the room. Nothing in it looks like trouble yet, but it's worth knowing. The two dusty sellswords by the hearth are a broad woman with a cropped head and a younger man with a bandaged left hand. They aren't drinking much. The woman looks up every time the street door opens, then looks away again. A carter sits alone at the end of the long bench with a wet cuff, on his third cup by the empties in front of him. He's drinking like a man who wants the evening over with. In the far corner a man in a good grey travelling coat, too clean for Beregost, sits with a soot-armed smith. A lump of dark ore lies on the table between them, and the smith keeps turning it over in his thick fingers and shaking his head. Nobody is watching the three of you at the corner table. Everyone in here has their own evening to get through.

Outside, the hammers along the Coast Way stop one by one as the smithies close up for the night.

Your records, changed:
Money: + 11 sp; − 14 sp

Your journal, new:
+ Thread: Aldous Venn's missing wagons
+ Debt: Tabs at the Burning Wizard

Where you are: corner table of the Beregost inn, back to the wall · Time: Day 1 · evening
````

**Player** (player r2):

````text
Bram catches the innkeeper's eye as she goes and raises two fingers. *Stew.* Then he points up. *Room with a door.* Eight silver is steep, but he's had enough of carters snoring for one lifetime.

To Sefa, dryly: "Feet? Dry socks, every night, no matter how tired you are. And walk the first hour slow. Wish someone had told me at sixteen." He glances at Pell's untouched cup. "And a man who gets into places quietly. Well. As long as it isn't my room."

He turns his cup a slow circle on the table, eyes drifting to the fire.

"Two loads gone between here and Nashkel, and no wreck." He says it low, half to himself. "That's not wolves. Wolves leave wagons. Bandits leave wagons, and bodies as well. Something that takes the whole load, oxen and all, and leaves the road clean..." He shakes his head. "I just came up that road. I'd like to know what I walked past."

He nods toward the hearth. "Those two are waiting on Venn as well. The woman jumps every time the door goes. Either she's owed money or she's scared of someone. Bandaged hand on the lad, too. They may have tried the road already."

His glance moves to the corner, the clean grey coat and the lump of ore. He keeps that to himself for now, but he watches the smith turn the stone over once more.

"I'll eat, then I'll wait for this Venn after the bell and hear his price." To both of them, plainly: "If either of you is short of coin and not afraid of the road, a merchant pays better for a party than for one guard. A healer and a quiet man aren't the worst company to bring. No promises. Just something to think on over your stew."

*(While he waits for the food: can Bram tell, from where he sits, what kind of ore that is, or what the grey coat is offering the smith? Just a passive look. He won't go over.)*
````

### Screen 3 · player r3

````text
Sefa calls after Orla, "Stew for me, please, and a room with a door," if she's still within earshot.

She lifts her cup to you. "Thank you. I'll stand the next jug."

Then she looks between you and Pell. "Guard work and a knack for getting out of places. I can tend wounds, though I'd rather earn my supper preventing them. We might be worth more to this Venn together, if his offer's any good."

She takes a small drink. "Two whole loads gone without word sounds like more than a shortage of guards. I'd want to hear where they were last seen, and whether anyone's actually gone looking."

Pell says nothing. His cup is still full.

Sefa gets up and makes her way through the crowd toward the notice board by the street door.

---

Orla is halfway to the kitchen door when she catches your two fingers and the thumb jerked at the ceiling. She points back at you, *stew, door*, and is gone into the steam.

Sefa's call follows her a moment later. Orla doesn't turn round, but one hand goes up over the heads of the crowd to show she heard.

From your place against the wall you get a good look at the far corner while the room roars around you. You grew up in a smithy's yard, so the lump on the table is easy to read even from here. It's iron ore, a fist-sized piece. It's dark, nearly black, and the faces where it was broken are dull and close-grained. It isn't the rusty red-brown stone that comes out of the Nashkel pits; you've watched enough of that go by in carts. You can't tell where this came from. The smith clearly can't stop handling it, though. He weighs it, turns it to the lamp, rubs his thumb along an edge, then sets it down and pushes it back across the table. The man in the grey coat pushes it back again. Then a small leather purse goes on the table beside the stone. He doesn't open it. He holds up three fingers, and then all five. The smith shakes his head and doesn't touch the purse. Nothing either of them says carries over the noise.

---

Across the room, Sefa stands reading the notice board under the door lamp while carters squeeze past her shoulder. After a while she comes back to the corner.

The stew is already there by then. Orla puts the bowls down hard and sets bread beside them: two bowls of mutton and barley, steaming, with a slick of fat on top and bread torn rather than cut. One is for you and one for Sefa's empty place. She taps the table once beside each bowl.

"Two rooms with doors, top of the stairs, left side. They're the last two with bars," she says. Then, to Pell, whose cup is still full: "You eating, or just guarding that drink?"

Your records, changed:
Carried: + Bowl of mutton and barley stew

Your journal, new:
+ Promise: Sefa stands the next jug

Where you are: corner table, Burning Wizard common room · Time: Day 1 · evening
````

**Player** (player r3):

````text
Bram tears a piece of bread, wipes it through the fat, and eats like a man who's had hardtack for a week. When Sefa sits back down he nods at her bowl.

"Eat while it's hot. Orla doesn't strike me as someone who reheats." Between mouthfuls: "Anything on the board besides smiths wanting boys to pump bellows?"

He keeps his voice low and tips his head a fraction toward the far corner, without looking.

"Our clean friend in the grey coat. That's iron ore he's selling, and it's not Nashkel stone. Nashkel's red and rusty. That's black and close-grained. Never seen it come down the road. He's pushing it on a smith who keeps touching it like he wants it and won't take the purse." He chews and swallows. "A smith who won't take money for good iron either doesn't trust where it came from, or is scared of who's asking."

He shrugs and goes back to the stew.

"Not my business. Not yet." A glance at Pell's full cup. "You going to drink that or just keep it company? It's paid for."

When the bowl is nearly empty he sets the spoon down, turns so he can see the street door, and settles in to wait for the temple bell and Aldous Venn.

*(He'll stay at the table until Venn comes in. If the grey coat leaves first, Bram notes which way he goes and whether the smith follows. He just watches, doesn't move.)*
````

### Screen 4 · player r4

````text
Sefa counts out eleven silver for Orla. "For supper and the room. Thank you." She settles back onto the bench and tells you both: "Venn's notice promises work, but doesn't mention pay. There's also a warning about deep holes in the south fields—two sheep missing, and no earth piled beside the holes. Worth remembering if we leave that way." She tears off some bread and glances toward the pair by the hearth. "If the lad's hurt, I can at least offer to look. Easier to ask about a bad journey once you've introduced yourself."

Pell gives his cup a slow quarter-turn on the table and nods at Orla. "Stew. And I'll keep the drink a while yet." He picks up the cup and takes a short sip. It's short, but it's a sip, and the cup goes back on the table a finger lower than it was. He half-turns on the bench to take in the room and speaks to you, his voice kept under the noise of the common room: "Eight silver for a door that bars. Might be the best bargain in town if the two by the fire are who they look like. I didn't come up the Trade Way, so I've no idea what two missing loads leaves behind. But if they're still hiring after the wagons stop showing, it means Venn hasn't got enough men to keep the next one on the road. That says more than his price will." He gives the room a thin, quick smile that isn't meant to be charming. "I'll hear him. No harm in listening. But I don't sign with a man until I've counted the silver and looked at the map." He inclines his head toward the notice board. "Anything else pinned there—or is it all smiths missing apprentices?"

Orla comes back through the crowd with a cloth over her shoulder in time to catch Sefa's eleven silver. The coins go into her apron uncounted, the same as yours did. "Supper and a door. You're square," she tells Sefa. Then to Pell, already turning: "Stew, then. Loft's all that's left. Five silver if you want it, and you'll want it before the carters start choosing." She hears his question about the board on her way past and answers over her shoulder without stopping. "Smiths. The temple. The Fist's bounty they're not paying. And the tanner's holes. That's your lot."

She's back with a third bowl before Sefa has crossed the room to the hearth. She sets it in front of Pell with bread torn off the same loaf.

From your seat against the wall, you watch the far corner while you eat.

It ends quietly. The smith pushes the black stone back across the table one last time and stands up, wiping his palms on his apron as if they're dirty. He says something short. You can't hear it, but you can read the shake of the head that goes with it. Then the smith walks out through the street door into the dusk. He doesn't take the purse and he doesn't look back.

The man in the grey coat sits a moment longer. Then he puts the stone into one coat pocket and the purse into the other, unhurried, like a man who has heard no before and expects to hear yes somewhere else. He catches a serving girl's sleeve and orders another cup. He isn't leaving.

Over by the hearth, Sefa speaks with the pair there. You can't make out the words over the room. After a moment the young man starts unwinding the cloth from his hand. The street door opens and lets in a breath of cold air and coal smoke. It's a carter.

Where you are: common room table, seat against the wall · Time: Day 1 · evening
````

**Player** (player r4):

````text
Bram finishes the stew and mops the bowl clean with the last of the bread. He's still watching the street door where the smith went out.

"He'll be back in that coat tomorrow, at the next forge down," he says quietly to Pell. "Man doesn't pocket a no like that unless he's got plenty of smiths left to ask." He lets it go and turns his cup again.

"Sefa's holes. Deep, no spoil heap, sheep gone." He frowns at the table. "I've seen that once, down near Nashkel. Farmer lost a cow, then his boy nearly went the same way. Ankheg. Big burrowing thing, all shell and mandibles. It spits acid. It doesn't throw the earth up, it packs it and swallows it. If that's what's in the south fields, nobody walks them at dusk. And it's worth more than whatever the tanner's offering." He shrugs. "Might be nothing. Might be a big badger with ambitions."

He glances over at the hearth, where the lad is unwinding his bandage for Sefa, and watches how the cropped-haired woman takes it: wary, grateful, or neither.

"She's quick," he says to Pell, nodding toward Sefa. "Half an hour in town and she's got a wound out of a stranger. That's how you get a story out of a sellsword." A beat. "You did well too, didn't knock over a single piece of furniture coming in."

He settles back against the wall and keeps his eyes on the door, waiting for the temple bell and Venn.

*(If Sefa looks at that hand and learns anything, Bram will listen when she comes back. And: does Bram get any clear look at the wound from here — a blade cut, a bite, a burn?)*
````

### Screen 5 · player r5

````text
Pell pulls his bowl toward him, breaks the bread in half and sets one piece on the table by the jug in case anyone wants it. He eats without hurry. His eyes keep moving: doorway, hearth, the corner table, the shutters, and back.

At your aside about the ore he gives a short, slight nod. "A man with ore that isn't Nashkel's, selling it quiet to a smith who won't take his purse," he says, his voice low, almost idle. "Where I'm from, that's the start of a story, not the middle. But you're right—it's not ours."

He takes a longer drink and sets the cup down nearly empty. "I'll take the loft. Five silver, and I've slept in worse company than carters. Lot better than some company I've known." He glances at the room. "I'd rather keep a little silver back until I know if Venn's paying or just complaining."

His eyes go once to the hearth where Sefa sits with the two strangers, then come back. He doesn't stare. After a pause he says, "If the boy's hand's got a story on it, she'll come back with it. She's got that look—asks with her hands before she asks with her mouth."

He works at the stew, sops up the last of the broth with bread, then sits back.

Your spoon scrapes the bottom of the bowl, and the bread takes care of the rest. Across the table Pell eats at his own pace. The half-loaf he set out sits by the jug, and nobody has touched it yet.

From the corner table the hearth is thirty feet off through elbows, pipe smoke and carters' backs, and you can't make out much. The lad is holding his left hand palm-up to the firelight. The bandage hangs off his wrist, stiff and brown-yellow, the way cloth goes after a few days on a wound. Even from here the heel of the hand looks swollen, red against the pale of the rest. At this distance you can't tell whether it's a cut, a burn or a bite. It's a hand that has gone bad, and the lad is holding it the way a man holds something that hurts. The cropped-haired woman doesn't look at the wound at all. She's watching Sefa's hands, arms folded, and her face gives nothing away yet.

In the far corner the grey coat is still on his second cup. He drinks slowly and watches nobody in particular. When the serving girl passes he says something to her. She shakes her head, and he lets her go without fuss.

At the end of the long bench the lone carter lifts his head at the word *ankheg*. He looks over at you for a moment with red-rimmed eyes, as if he means to say something. Then he goes back to his cup. Your big badger with ambitions draws a snort out of the man beside him, a smith's boy with burnt eyebrows, and nothing more.

Orla comes through the crowd with an armful of empty bowls stacked to her chin. She stops at the corner long enough to look at the two clean ones.

"Loft, then," she says to Pell. She heard him from three benches off without seeming to listen. "Five for the bed, three for the stew. Eight." She tips her chin at your bowl, wiped so clean it hardly needs washing. "And you're eleven, door and supper. You've both eaten, so I'll take it now, before the bell. Once Venn's in, I won't see the floor till midnight."

She waits, the bowls balanced on her forearm.

Your records, changed:
Carried: − Bowl of mutton and barley stew

Where you are: corner table of the inn's common room · Time: Day 1 · evening
````

**Player** (player r5):

````text
Bram digs out a gold piece and a silver and sets them in Orla's free hand.

"Eleven. Supper was worth it." Before she can go he adds, low: "The carter at the end of the bench. Wet cuff, three cups down. Who is he? He looked at me like he knew the word *ankheg*."

Whatever she answers, he waits until she's moved on. Then he picks up the jug, still half full, and Pell's spare bread, and nods to Pell.

"Keep my seat."

He works his way down the long bench and sets the jug and bread in front of the lone carter. He doesn't sit until the man looks up.

"Bram Halloway. Came up from Nashkel today." He keeps his voice easy, not loud. "You looked over when I said ankheg. If you've seen one, or seen what it leaves, I'd like to hear about it. Jug's yours either way."

He lowers himself onto the end of the bench, half-turned so he can still see the street door and the hearth, and waits. He doesn't push.

*(Bram's watching the carter's face and hands as he talks. Is he scared, grieving, or just drunk? And is that cuff wet with water, or with something else?)*
````

### Screen 6 · player r6

````text
Your companion fishes in his pouch and starts counting coins onto the table for Orla. "Stew and loft. Put me somewhere I can hear the stairs, and I'll sleep better."

He sits back. He holds his cup but doesn't drink from it now, and says to you in a lower voice, "Ankheg. If that's what's burrowing the south fields, it explains the tanner's offer and a few missing sheep. Also means the fields are worth more than the notice says—if a man's got the stomach for acid and a shell."

Orla shifts the stack of bowls up her forearm and takes your gold and silver with her free hand. The coins go into her apron without being counted.

"Square," she says. She follows your look down the long bench, and her face softens a little. "Col Fenner. He carts hides for Ruddock the tanner and lives out on the south lane, past the last forge. Harmless. Two cups is his usual. Something's knocked him tonight." She turns to Pell before you can say more. "Loft's right over the stairs. You'll hear every boot that comes up them, and wish you didn't."

She waits a moment for Pell's coins, the bowls swaying.

---

You get to your feet with the half-full jug in one hand and Pell's spare bread in the other. As you go, Pell glances toward the hearth, then the door, and his low question follows you: "So we wait for Venn. What's this one like when he's not drunk in a tavern—have you heard of him? A wool and salt man with two loads gone and a purse he's guarding. That's a man who'll bargain hard and then ask for twice what he's paying."

The bench is packed. You have to turn sideways past two carters arguing about axle grease.

Col Fenner doesn't look up when the jug lands in front of him. He looks up when the bread does. He's somewhere past fifty and weathered the colour of the hides he hauls. His eyes are red the way a man's go after he's been crying, not drinking. He's drunk, but not as drunk as the three empties suggest. His hands are around the cup. The left one is the one you noticed from across the room. The cuff of that sleeve is soaked to the elbow and has gone dark. Up close it smells of lye soap, strong enough to cut through the ale. Above the cuff, the skin of his wrist and forearm is red and raw-looking, angry and shiny. It's like a scald, but there's no blister. He has scrubbed that arm hard, and not long ago.

He hears you out, then looks at the jug for a while.

"Not seen it," he says finally. His voice is thick and plain, south-country. "Seen where it went." He turns the red wrist over on the table without seeming to notice he's doing it. "My dog. Bess. Old bitch, half blind. This afternoon she went down a hole by Ruddock's lower pasture after something. That hole weren't there yesterday, I'd swear to it. Went in and didn't yelp. Just went." He swallows. "I got down on my belly and put my arm in to the shoulder. Couldn't find bottom. The sides in there are smooth as the inside of a jug, packed hard. And it come out stinging. Like I'd put it in a vinegar vat. I scrubbed it at Ruddock's pump till I couldn't feel it."

He pulls the jug toward him. He doesn't pour.

"That word you said. That thing." He looks straight at you for the first time. "Does it come up for people? I've a girl. Eleven. She walks that lane to the Thunderhammer every morning with her brother's dinner."

Your records, changed:
Money: + 22 gp; + 10 sp; − 23 gp; − 11 sp

Your journal, new:
+ Thread: The hole by Ruddock's lower pasture

Where you are: corner table of the inn's common room · Time: Day 1 · evening
````

**Player** (player r6):

````text
Bram doesn't soften it, but he keeps his voice low and steady.

"Yes. It'll take a man if it's hungry enough. A child sooner." He lets that sit a moment, then goes on before Col can sink into it. "But they hunt like a spider. They wait under soft ground and come up at whatever walks over them. They don't go roaming the lanes looking. So keep her off that lane. Tomorrow, and every day until it's dealt with. Send the dinner another way, or walk with her on the hard road where it's cobbled or packed, away from the pasture edge. Nobody stands still on soft ground near those holes. Keep the stock penned up near the house."

He nods at the raw forearm.

"That's its spit, what's left of it on the walls of the tunnel. You got off light. Don't put that arm in anything again." He tips his head back toward the hearth. "The woman by the fire is a healer. When she's done with the lad, let her look at it. Tell her I sent you."

He pours Col a cup from the jug himself and pushes it over.

"I'm sorry about Bess." A pause. "Where's the hole, exactly? Ruddock's lower pasture. How far off the lane, and is there water near it, a ditch or a stream? And what's Ruddock offering on that notice?"

He listens to all of it, then puts it plain:

"I've a merchant to hear tonight. In the morning, in daylight, I'll walk out and look at it. Not down it, at it. I'll tell you what I see. I'm making no promises past that until I know what's in the ground." He gets up and puts a hand briefly on the man's shoulder. "Keep your girl home in the morning. That much you can do tonight."

On his way back to the corner table he stops by the hearth, just long enough to say to Sefa, quietly, "When you're done here, the carter at the end of the bench. Col. Acid burn on his left forearm, scrubbed raw with lye. Lost his dog down one of those holes today." Then he goes back to his seat against the wall.

As he sits he tells Pell, low: "Ankheg, near enough sure. Took a dog this afternoon, by the tanner's lower pasture. The man's got a girl who walks that lane." He picks up his cup. "Venn first. Then we'll see which pays and which needs doing."

*(Bram watches the door for Venn and the temple bell. He'll keep half an eye on the grey coat too, in case he moves.)*
````

### Screen 7 · player r7

````text
Col Fenner goes very still when you tell him yes. He looks at the cup in front of him for a long while, the way he looks at everything before he answers. While you explain how the thing hunts, Col keeps his eyes on the table, but he's listening to every word.

"Hard road," he says at last. "Coast Way, then. It's longer. She'll grumble." He pulls the cup you poured toward him and holds it without drinking. "She'll go."

He looks down at his forearm when you nod at it, as if he's only now noticing the raw shine of it. Then he looks past your shoulder at the hearth, where the lad is still holding his healed hand up to the firelight and turning it over. Col has heard the carters muttering on the near bench.

"Saw what she done for the boy," he says. That's all he says about it.

On the hole he's exact. He's walked that pasture every working day for years.

"Lower pasture runs down off the lane to Ruddock's ditch. That's where he lets the pit water off from the yard. Hole's down the bottom end, near the ditch. Forty paces off the lane, maybe." That's about a hundred and twenty feet. "Ground's always soft down there. Wet. Sheep won't graze it, mostly, on account of the smell off the ditch." He turns the cup a quarter round. "That paper of his don't offer nothing. It's a warning, is all. He's lost two ewes and he's sore about it. He'd pay to be shut of it, I reckon. Not much. He's at the yard from first light. Ask him."

When your hand comes down on his shoulder, Col looks up and meets your eyes properly. He holds the look a moment.

"Morning, then," he says. "I'll keep her in."

You stop at the hearth on your way back, just long enough to say your piece to Sefa, quiet enough that it goes no further than her. Hedda doesn't look round. Her eyes are on the street door.

Back at the corner, Orla is standing at your table with the bowls on her forearm and her other palm open, looking at the coins in it: six silver and two brown coppers. She waits there, the bowls swaying. Pell watches you come back up the bench, and you drop onto the seat against the wall.

You've hardly drunk from your cup when the bell up at the Song of the Morning gives its last stroke. The street door opens.

A narrow-shouldered man of nearly sixty comes in out of the dusk, stamping coal grit off his boots. The boots have the white tide-marks that salt leaves on leather. He wears a good sheepskin-collared coat, old but cared for, and has a ledger tied with string tucked under one arm. He catches Orla's eye across the room over the heads of the crowd.

"Wine, Orla. The cheap one. I've not earned better." He has a Gate accent, tired and dry. Then he looks the room over the way a man counts sheep he's already paid for. His eyes go to the hearth and the two sellswords there, then on to your corner table and the round shield propped against the bench.

In the far corner the man in the grey coat lifts his head when the door opens. He looks at the newcomer for a moment, then goes back to his cup.

By the fire, Hedda's head has already turned toward the door, and she keeps it there.

Your journal, new:
+ Promise: Look at the hole for Col

Where you are: tavern, corner table against the wall · Time: Day 1 · evening
````

**Player** (player r7):

````text
Bram glances at the coins in Orla's palm and then at Pell, eyebrows up. *Short?* He says nothing about it, though. That's Pell's to settle. He gets to his feet as the old man in the sheepskin collar looks over at the shield.

He doesn't wave. He just meets Venn's eye across the room and nods at the empty end of the bench beside him, the way you'd show a man where the wagon's parked.

When Venn comes over, Bram stays standing until he's sat.

"Master Venn. Bram Halloway. Orla says you're hiring." He sits back down against the wall. "Sixteen years on the Trade Way. Six with a free company, ten on caravans between the Gate and Amn. Last one paid me off in Nashkel. I came up the road today." He nods at Pell, and toward the hearth where Sefa is. "Those two might be interested as well. I'll let them speak for themselves."

He leaves a beat for Venn's wine to arrive, then gets to it. His voice is plain, the way a guard talks about work.

"Before we talk price, tell me about the two loads. How many wagons each, how many guards, and who were they? Where were they last seen for certain? A waystation, a farm, someone who waved them past? Did anyone go out along the road looking afterward? And did anything else go missing with them? Oxen, drivers, the wagons themselves?"

He turns his cup.

"I walked that stretch today and saw nothing. No wreck, no burned wagon, no birds circling. If two loads vanished on it, they didn't do it on the open road in daylight. So either they left the road, or someone took them off it. I'd like to know which before I sign to walk the third one into the same place."

*(While Venn answers, Bram keeps half an eye on Hedda by the fire. Does she know Venn, or is she scared of him? And does the grey coat in the corner show any interest in this conversation?)*
````

### Screen 8 · player r8

````text
Pell looks at the coins in Orla's palm as if they've insulted him. He dips into his pouch again and counts eighteen copper onto her open hand, carefully. "Slept too long in the rain," he says. "Count it twice. I don't owe strangers."

Orla doesn't count them twice. She doesn't count them at all.

"Rain'll do that," she says. "Square." The coins go into her apron and she goes off into the crowd with her bowls.

Pell sits up a little and watches the newcomer at the door. "Narrow shoulders, good coat, salt-bleached boots and a ledger tied with string," he says to you, low. "That's your man." He turns his cup upright between two fingers and leaves it there. "He's already counted the room. Saw the shield. Saw the two at the fire. Now we see who he crosses to first." He shifts his weight, not rising but ready to. "If he sits with them, we stay here and finish the jug. If he comes this way, we bargain."

Across the room, Venn has seen you get to your feet. He doesn't hurry. He finishes untying the string on his ledger, takes his cup from the serving girl and tastes the wine with a small grimace. His eyes go to the hearth again, then to the corner, as if he's weighing two lots.

Before he decides, Sefa comes back to the table from the hearth and leans in, keeping her voice low.

"Tobin's hand is mending. They've never worked for Venn; what they know of the missing wagons is market talk. Four wagons and two guards on the first load, six and five on the second, they heard." She nods toward the bar. "Venn's here. Hedda proposes we don't undercut one another. I've agreed for myself, provided you two are willing. We can hear his terms together without committing to take the road." She glances at her unfinished stew. "And I'd like to ask whether he's hiring escorts, or people to find his missing guards. Those are different jobs."

Then Venn picks up his cup and ledger and starts across the room. He passes the hearth on the way and raises one finger to Hedda, the way a man asks someone to wait their turn. Then he keeps walking. Hedda folds her arms and sits back down on the hearth bench. She says something short to Tobin and keeps her eyes on Venn's back. You know that look from a hundred hiring yards. It isn't fear. She's a woman who has lost her place in the line and means to get it back.

Venn sets his cup at the end of the bench and lowers himself onto it the way a man does after a day on wagon boards. Only then do you sit down.

He listens to all of it, your sixteen years and the two names offered without a sales pitch. When you get to *before we talk price*, one corner of his mouth moves.

"Well. That's a first this week." He puts the ledger on the table and leaves his hand on it. "Since you ask properly. The first load was four wagons of salt, sixteen oxen and four drivers. Two guards: Dace Morrow and his sister's boy. Dace walked for me six years and never lost me so much as a sack. They left my yard here, behind the Thunderhammer, eight weeks back. The second was six wagons, twenty-four oxen, six drivers and five guards under a woman called Marta Rusk, hired out of the Friendly Arm and well spoken of there. I paid for five because I'd lost the first. I thought that was the lesson."

He drinks.

"Last seen for certain, both times, at Lark's Ford."

You know the place. Everyone who has worked this road waters there: an inn yard at the ford, a day and a half south of Beregost, on the road you just came up.

"Old Pennick keeps the yard. He counts every wheel that waters, because he charges by the wheel. He watched Dace go up the south bank before noon. Five weeks later he watched Rusk do the same. After that I can't find a soul who saw either of them." Venn turns the cup a little on the table. "After the first, I paid a lad from the Fist post to ride to Nashkel and back. Nothing. After the second I rode it myself, with the same lad and a better horse than I could afford. Nothing on the road. No wheel in a ditch, no dead ox, no birds. You're right about the birds. I looked for them as well."

He opens the ledger and takes a folded scrap of paper from between the pages. It's soft from being unfolded too many times. He lays it in front of you.

"Rusk sent that back from the ford with a carter going north."

The writing is a guard's hand, blunt and square:

*Master Venn. At Lark's by midday, oxen sound. Ford road's cut up south of here, so a Fist patrol at the yard has put us on the old drove track west of Tallow Hill. They say it comes back to the Way below Kesh's and saves half a day. Nashkel in two. M. Rusk.*

You know the drove track by sight from the road, as anyone who has worked it would. It's a sheep road that goes round the west side of the hill, toward the coast and the dark line of the Cloakwood along the horizon. Nobody takes wagons on it.

"I asked the Fist here and the Fist in Nashkel," Venn says. "Neither of them had a patrol at Lark's Ford that week. Neither of them has a patrol south of here most weeks, by the look of their notice. And the ford road wasn't cut up when I rode it." He takes the paper back, folds it along its old creases and puts it back in the ledger. "So either somebody lied to Rusk, or Rusk lied to me. I'd sooner it was the first. I liked her. I rode the drove track too. It's grass and stone, and it had three weeks of rain on it by then. It comes back to the Way where she said it would. There was nothing on it but sheep."

"Anything else gone? All of it. Wagons, oxen, salt and seventeen men. Their families on the Gate road come and ask me where they are." He says it flatly, the way he'd read out a loss in the ledger. "The salt was worth less than the oxen, if you want the truth."

He looks at you, then at Pell, then at Sefa, who is still standing at the end of the table.

"I'm hiring to get the third load to Nashkel. That's the job. If whoever walks it finds out on the way where the other two went, I'll pay for that as well. What it's worth, we'd argue about." He picks up his cup again. "The wagons go when I have guards. So. What does sixteen years cost? And what do these two cost on top of it?"

In the far corner the man in the grey coat hasn't turned his head once. He's on his second cup, with his back half to the room. He cleans a thumbnail with the point of a small knife, like a man with nowhere to be.

Where you are: inn common room, bench against the wall with Venn · Time: Day 1 · evening
````

**Player** (player r8):

````text
Bram doesn't answer right away. He sits with the paper's words for a moment, turning his cup.

"A Fist patrol nobody sent," he says at last, quietly. "Standing in a yard where every carter on the road waters, telling a careful woman to take her wagons off the Way, toward the Cloakwood. That's not luck. Somebody went to the trouble of a tabard." He looks up at Venn. "And they knew Rusk would believe it, because Dace had already vanished and she'd want the safer road. Whoever it is knows this road and knows your business."

He sets the cup down.

"Price. Two gold a day for me, start to finish, back to Beregost included. I lead the guard and I say where the wagons go and where they stop. Two a day for each of these two, if they sign." He tips his head at Pell and Sefa. "Half the first week up front, so I know you're good for it. Whatever we learn about the other two loads, we argue over afterward, like you said."

He nods toward the hearth without looking.

"And hire those two as well. Hedda and the lad. Same terms, if they'll take them. Rusk had five and you'd sooner have too many than too few. A healer's worth more with enough blades in front of her that she isn't needed." A short, dry beat. "We've agreed between us not to cut each other's throats on price. I'd rather walk with them than past them."

He holds up a hand before Venn can speak.

"One more thing, and it isn't for sale. We stay on the Way. I don't care who's at Lark's Ford, in a Fist tabard or a priest's robe or your own coat. Nobody turns those wagons west. If someone tries, I'd very much like a word with him."

Then, plainer:

"When do the wagons go? I've promised a man I'll look at a hole by Ruddock's pasture at first light. That won't take long. And eight weeks back, then five. Has anyone else on this road lost a load in that time? Or is it only you somebody's watching?"

*(Bram watches Venn's face at the haggle, and at the question about whether he's the only one. Does he seem to be holding anything back?)*
````

### Screen 9 · player r9

````text
Sefa speaks up: "Sefa Marrin. I can tend wounds and work spells, including at a distance. But before I name a price—Hedda and Tobin are interested too. We've agreed not to bid against each other." She gestures toward the hearth, inviting them over.

"May I read Rusk's message? I haven't seen what she wrote about the patrol or the drove track."

She takes a seat and leaves room for the others.

"And I'd rather settle the payment for finding your missing people here, not argue over it on our return. Finding a wagon, bringing back survivors, and delivering this next load are different things. If we find someone alive who needs carrying home, I want us clear on what happens to the delivery."

Her voice softens a little. "Do you have the drivers' names as well as the guards'? If we have to ask after them, names may get us further than a count of wagons."

Pell has said nothing while you worked your side of the table. When Venn asks what the three of you cost, he refills his cup only halfway from the jug and drinks as if the number isn't the interesting part.

"Before my price," he says, "I've a few of my own."

He sets the cup down and leans forward just enough to mean it. "The job's to walk a third load into the same stretch that swallowed the first two. Sixteen years on the road says nothing drowned those wagons by accident—and you've the look of a man who knows it." He lets that settle. "I'm not a shield. I don't stand on the box and frown at the treeline. I ride ahead, a little off the road, and I see trouble before it sees the wagons. I also see which of your drivers cut his own traces and which one lights a pipe where he's told not to. That's what I cost."

He ticks the air with one finger, like a man numbering loose boards. "Questions, then. First: who drives the third load? Were any of these six drivers new to you, or behind on their pay, or spoken for by somebody in Nashkel? Second: what does Lark's Ford look like now—has anyone been back since to watch it, or is it just the same old man counting wheels? And third, and this is the one that matters: the Fist post tried, and you tried, and nobody looked in the fields or the lanes between the ford and the Way. Nobody asked the farms."

He sits back. "Someone took two whole caravans off a road and left nothing. We both know that is not starved wolves. So I don't take the job as a guard. If I take it, I take it as a scout. And my number is higher than a guard's because I'll be the first to find whatever did it."

He glances at you and Sefa, just enough to include you both, though he's still speaking to Venn. "Hear their prices. If we agree, you get three who aren't wasting your silver. If we don't, you can hire the two by the fire and hope the bad thing is short of breath."

---

Venn hears you out without interrupting. At *somebody went to the trouble of a tabard* he stops turning his cup and leaves it still.

When the price comes his face doesn't change, but his hand settles flat on the ledger cover, the way a man covers a purse in a crowd. You've watched merchants hear prices for sixteen years. This one isn't shocked by the number. He's working out whether he can pay it.

"Two a day is the going rate for a man who knows the road," Venn says. "I won't pretend otherwise. You lead, you say where the wagons stop." He pauses. "And staying on the Way is the one thing I'd have paid you extra for. You can have it free." The hand stays on the ledger. "Half the first week up front, though. That's five of you, if the two by the fire come in. Thirty-five gold before an ox has moved. I'll give you each two days' pay in the yard the morning we roll, and the rest at Nashkel, out of the factor's money. Better than that I haven't got. Not after this spring."

He answers your last questions in order, as if ticking them off.

"We go the day after tomorrow, at first light. The oxen come in off grazing tomorrow, so look at your hole." Then, more slowly: "Am I the only one? No. I've heard of three others, and I'd only stake money on one of them. Garrow, a wool man out of Nashkel. He sent two wagons north about when Rusk went south, and they didn't come in either. He found me in the Gate last month and asked whether I'd hired anyone strange. I asked him the same." His mouth twists. "We parted no wiser."

You can see no shifting and no hesitation in him. The only thing the man seems to be guarding is his purse.

---

When Sefa beckons, Hedda doesn't need asking twice. She crosses from the hearth with Tobin a step behind her and stands at the end of the bench. Venn looks up at her.

"Thank you for waiting," he says dryly. "I've not earned the courtesy."

"Two a day," Hedda says. "Same as him. Tob too."

"The lad's green."

"The lad's mended," Tobin says, and holds up the pink seam on his palm before he can stop himself. Then he puts the hand away, red to the ears.

Venn looks at the seam, then at Sefa, and says nothing about it. He takes Rusk's note out of the ledger again and holds it out to her, the same note in the same blunt, square hand you read.

To her question about finding his people, Venn gives the plainest answer he's given all evening.

"If you find any of mine alive, you bring them home, and the salt can sit in a ditch till I fetch it. The delivery doesn't come first. Five gold a head for each one you bring back alive. That's what the Fist offers for a bandit's head, and unlike the Fist I'll pay. Twenty more for knowing for certain where they went, with something I can show their families." He pauses. "That's my price for it, settled here, as you asked. You'll find I don't go back on a thing I've said in front of Orla's whole room."

He opens the ledger to a page near the back and turns it round on the table for her, keeping a finger on the corner. "Names. Copy them if you like. I'll not have the page torn out."

---

Venn turns to Pell last. He's plainly been saving him.

"Who drives the third load: Tam Hesketh, twenty years with me, and his two boys. Nobody else in Beregost will take my reins now, so I'll drive the fourth wagon myself." He taps the ledger page under Sefa's hand. "New men on the first load, none. On the second, those two. I was short, and the stockyards had men standing about. Nobody spoke for them and nobody asked after them since, which you may make of what you like. I've made several things of it, and none of them hold.

"The ford: nobody's watching it but Pennick, and Pennick watches wheels, not faces.

"The farms." His mouth tightens. "You've caught me there. I asked at one, Kesh's, where the drove track comes back down to the Way. Kesh swears nothing came down past his gate either time. Either the wagons left the track somewhere between the hill and his gate, or Kesh wasn't looking, or Kesh is lying to me. I rode on to Nashkel instead of finding out which. I was angry."

He sits back on the bench and looks at Pell properly for the first time, the way he looked at the room when he came in, like a man counting sheep he's already paid for.

"A scout. Ahead, off the road, the first to find it." He picks up the cheap wine. "Higher than a guard's, you said. How much higher?"

Where you are: at Venn's table in Orla's common room · Time: Day 1 · evening
````

**Player** (player r9):

````text
Bram lets Pell's question hang. That number is Pell's to name, and Bram doesn't fill the silence for him. When it's settled, one way or the other, he nods to Venn.

"Two days in the yard, the rest at Nashkel from the factor. That'll do. You've said it in front of the room, and so have I." He puts his hand out across the table and shakes once, firmly.

Then he leans in, keeping his voice under the noise.

"A few things before we roll. First, keep the day quiet. You've told this room the day after tomorrow, and that can't be helped now. But don't tell anyone the hour or the route past Lark's Ford. Tell your drivers the morning we leave, not before." He turns his cup. "Somebody knew Rusk would be at that yard around midday. They knew it well enough to have a tabard waiting."

"Second, those two new men on Rusk's load. What did they look like? Ages, accents, anything. If they turn up alive somewhere, I'd like to know them before they know me."

"Third, Lark's Ford. Pennick watches wheels, fine. But a 'Fist patrol' standing in his yard would have watered horses and maybe paid him for it. We'll ask him how many there were, what they rode, which way they went after. A man who charges by the wheel remembers who didn't pay."

He glances at Pell, then back at Venn.

"So here's how I'd walk it. The wagons stay on the Way. Pell goes ahead from the ford and has a look at the drove track where it leaves the road, and again where it comes back down by Kesh's. If somebody's been turning loads off there, the ground between will show it, even after rain. Twenty-four oxen don't walk soft. And I'd like a word with Kesh myself, about his gate. Politely, the first time."

A beat, then dryly, to Venn:

"And Garrow's two went north while Rusk went south. Whoever this is takes from both directions. That's a lot of oxen to hide, and a lot of salt and wool to sell. Somebody's buying." He doesn't look at the grey coat in the corner, but he thinks about it.

He sits back against the wall.

"Hole at Ruddock's at first light. Then I'll come by your yard behind the Thunderhammer and look at the wagons and the axles before Tam's boys load them." To Hedda, with a short nod: "Glad to have you. If you're up early, I wouldn't say no to a second pair of eyes in that pasture."
````

### Screen 10 · player r10

````text
Pell lets Venn's question sit for a breath, then says it plainly, without any show. "Three gold a day." He doesn't reach for the wine and doesn't look to you or Sefa for leave. "A guard earns his two standing beside the wagons, with blades on either side and a fire at night. I'll be out ahead, on ground somebody's already used twice, with nobody to spend but myself. If I do the work right, you never see what I saw. If I do it wrong, you won't owe me tomorrow." A thin, mirthless smile. "So three. Same two days in hand as the others. And if we find your missing people or learn the where of it, I take my share of the twenty like the rest." He leans back a fraction, still watching Venn's face. "I don't ask for a guard's wage when I'm the one who meets the thing first."

Sefa says, "Two gold a day suits me, with four paid when we leave. And thank you for being clear about the missing people." She reads both blocks of names carefully, dates included, then hands back the note and turns the ledger toward Venn. "One point to settle: Bram's rate included the journey back to Beregost. Does payment at Nashkel cover that return as well? I don't want us discovering we understood different things once we're there." She turns to you and the others. "Tomorrow gives us time to get acquainted before we're responsible for four wagons. Bram, I'll come to the pasture with you, if you'd like company." And to Venn: "Where should we find you tomorrow? I'd like to meet Hesketh and his boys before we leave. They should know whose voice to listen for if there's trouble, and I'd rather learn their faces here than in a scramble on the road."

Venn hears Pell's number without blinking. He turns his cup a quarter round and sits with it for a moment.

"Three," he says. "Going down, where it happened, where you're out ahead and I'm paying you to find the thing first. That's fair, and I'll not pretend it isn't." He taps one finger on the ledger cover. "Coming back you'll be riding behind light wagons on a road we'll know by then. Two, the same as the others. And twenty is twenty. It's split among however many of you there are, not paid out once to each. I'm not paying it six times over." His mouth twists. "That's the best a man who's lost ten wagons can do for you."

He doesn't wait for Pell to take it. You're already reaching across the table, and Venn shakes your hand: a dry grip, short and firm, the way he'd seal a bill of sale.

"Two days in the yard, the rest from the factor. In front of the room." He glances along the benches, where the nearest carters are pretending not to listen. "They'll remember it better than I will."

When you lean in and lower your voice, Venn leans in with you.

"The hour I'll keep. Tam hears it when he's on the box, not before. The route past Lark's is yours to choose, and I'll not ask you for it." He lets out a breath through his nose. "The day's out, as you say. I said it like a fool with Orla's whole room listening."

On the two stockyard men he thinks for a while before he answers.

"I saw them for one morning, in my yard, while Rusk loaded. Dobbs was a big man, forty or so, Gate-voiced. He knew oxen, and I'd guess that's why she took him. He yoked a pair of my worst without being told twice. Wick was younger and thin, a lad not much older than that one." He tips his head at Tobin. "He said nothing all morning. I took him for shy. I'd not know either of them in a crowd, and that's my fault, not theirs."

He grunts at your plan for the ford and the track.

"Pennick'll talk if you water there. He talks to anyone who pays by the wheel. And Kesh..." He stops himself. "Politely the first time. Yes. I wasn't polite."

At *somebody's buying*, his eyes go flat.

"Salt sells anywhere from here to Calimport. Nobody looks twice at it. Twenty-four oxen and Garrow's lot on top of them, though. Somebody's feeding those, or eating them."

You don't look at the far corner. You don't need to. The man in the grey coat has finished his cup at last. He sets a coin by it for the serving girl, gets up without hurrying and buttons his coat to the throat. He doesn't go to the street door. He goes to the stairs and climbs them at an even pace, one hand on the rail, and his boots knock on the boards overhead. He turns left at the top, toward the rooms with doors. Right over the stairs, in the loft, is where Pell will be sleeping.

Sefa turns the ledger back to Venn. He asks nothing about the names she has read, and he closes the book over them.

"Four gold in hand for you when we roll, the same as the rest." He answers her question about the return just as plainly. "The factor pays at Nashkel for the road down. That's his money, owed on delivery. The road back I pay in my own yard, the day we're home. I'll not pay a man in Nashkel for days he hasn't walked yet." A dry look. "Not because I think you'd run. Because I'd want the same if I were you, and I'd sooner hand it over where I can see the oxen."

To where he'll be: "My yard, behind the Thunderhammer, from the middle of the morning. The oxen come in off the grazing about then, and Tam and his boys with them. Come and see their faces, by all means. Tam won't say much to you. He never says much to anyone. But he'll remember you."

When you invite her to the pasture, Hedda looks at you with the same slow look she gave Sefa, from face to shield.

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
Bram waits out Pell's answer. He doesn't look at Pell while he does it. That bargain is Pell's.

Once it's settled, he turns to Tobin with the ghost of a smile.

"Bring the pole. Hedda's right that nobody pokes the hole. But a long pole tapped on the ground in front of you tells you where it's gone soft before your boot finds out." He nods to Hedda. "First light, at the lane by the last forge. We'll go down the pasture edge in a line, ten feet apart, slow, and nobody stands still. If the ground moves, everyone gets back to the lane. No heroics over a dog that's already gone."

Then, lower, to Sefa and Pell together, as the talk around the table breaks up:

"Our friend in the grey coat just went up to the rooms with doors. Left side." A short pause. "Ours are left side as well. Could be nothing. A man with a purse and a black stone needs a bed like anyone." He turns his cup over, finished. "Bar your door, Sefa. Pell, you're over the stairs. If you hear boots that don't sound like carters, I'd take it kindly if you knocked."

On the way to the stairs he stops at the bar when Orla passes and keeps his voice easy, like idle talk.

"The gentleman in the grey coat. Staying long? He was trying to sell my old trade back to me. Ore, from somewhere." He leaves it there. If she says something, he'll take it. If she doesn't, he won't press.

Then he goes up. He sets his shield by the bed and the longsword where his hand falls on it. He bars the door and checks the shutter. Before he lies down he stands a moment and listens to the corridor, to learn which door the grey coat went into.

*(Bram sleeps in his clothes, mail off and laid out where he can get into it fast. He'll wake before first light. Old habit.)*
````

### Screen 11 · player r11

````text
Pell gives a short nod before the silence can harden. "Done. Three down, two back, and the twenty split among all of us who earn it." He puts his hand out to Venn without any show. "I'll be in your yard at the middle of the morning to see the wagons and the drivers. And I'll walk them before you pay me to."

Sefa offers Venn her hand. "That's clear, then. I accept. We'll see you in the yard tomorrow." Then she settles back and finishes her supper.

Venn hears Pell out and takes his hand. It's the same short, dry grip he gave you. "Three down, two back, and the twenty for whoever earns it." He lets go. "Walk them all you like. Tam'll think you're counting his spokes." He shakes Sefa's hand as well. Then he ties the string round the ledger again, two turns and a knot, and pushes the empty wine cup away.

Tobin's face lights up when you give him the pole back. "There's a pike shaft in the Thunderhammer's scrap pile," he says. "No head on it. I'll ask for it."

"Ask," Hedda says. "Don't take." She hears out the rest: the lane by the last forge, ten feet apart, slow, back to the lane if the ground moves. She nods once. "First light. We'll be there."

Sefa turns to you and Hedda. "What did Ruddock tell you about the pasture? The notice mentioned missing sheep and deep holes, but not whether anyone actually saw what made them. I'll come at first light. Better to look together."

Hedda shakes her head. "Never met him. Only heard the name tonight." She tips her chin at you. "His man's the carter."

Pell's eyes go once to the stairs. Then, lower, to the table: "One more thing while we're all bought and paid for. The man in the grey coat who sat himself in the corner all evening, selling black ore and asking quiet questions nobody answered." He says it to Venn as much as to the rest of you. "He went up the stairs, not out. The loft's over the stairs, and the rooms with doors are on the left. He turned left." A pause. "Maybe he's only tired. But if I were moving a thing worth more than salt and wool, I'd want a room above the common room, where I could hear who's hiring and for how much." A light shrug. "Or he's a smith with a weak head. Either way, I'll sleep with my doorless loft and keep one ear on the floorboards."

You saw it the same way. The grey coat went up a few minutes ago, during the bargaining, after Venn had sat down. Venn saw him go too.

When Pell speaks, Venn looks at the stairs. Only the stairs, and only for a moment. "Never set eyes on him before tonight," he says. "But there's been a few like him at the forges since the thaw. Good coats, clean boots, wanting iron sold to them or smiths to work it. I'm salt and wool. They've no use for me." He gets up off the bench slowly, a hand on the table edge. "My yard, middle of the morning. Goodnight to you." He goes out by the street door into the dark with the ledger under his arm.

Orla is behind the bar wiping out cups when you stop there. Sefa comes up a moment later and lays one copper on the wood. "For the rag," she says.

Orla scoops it up. "Now you're square." When Sefa asks about her room, Orla points at the ceiling with the cloth. "Top of the stairs, turn left, go right to the end. Yours is the last door. His is the one before it." She means you. "Bars are on the inside. Use them."

She hears your idle question with her hands still moving, and doesn't answer at once. "Ansel Corby, he wrote in my book. This is his third night, paid through tomorrow. Tidy, pays ahead, doesn't break anything." She sets the cup down. "And there's three smiths drink in here who've told him no this week. You just watched the fourth. They don't say why. Not to me." She picks up the next cup. "That's all I know about him, and it's more than I'd tell most."

The stairs creak under your weight. At the top a short corridor runs left under the eaves. There are four doors, and one rushlight sits in a dish on the floor at the far end. The ladder to the loft goes up out of the dark right over the stairhead.

You stand still and listen. The door nearest the stairs is dark, and somebody behind it is snoring evenly. The second door has a line of lamplight under it. A man is walking in there, four steps, a turn, four steps back, the floorboards giving under him. Then a chair scrapes, and after that nothing moves. The last two doors are dark. Those are yours and Sefa's.

So the grey coat's room is the one next to yours, with a plank wall between you.

Your room is narrow. It has a cot, a peg, a shutter on a hook and a bar in iron brackets. You prop the shield by the bed and lay the longsword where your hand will find it. You drop the bar into its brackets and try the shutter. You lay the mail out on the floor with the arms open, ready to shrug into. Through the wall, the lamp next door is still burning.

Below, the common room is getting louder as the carters settle in for the night.

Nothing more happens before first light unless you want to be awake for it.

Where you are: his barred room upstairs, next to Corby's · Time: Day 1 · evening
````

**Player** (player r11):

````text
Bram sits on the edge of the cot for a while in the dark, boots still on, and listens to the wall.

He doesn't press an ear to the planks. That isn't his trade, and a man who's paid through tomorrow and broken nothing has earned his privacy. Bram just listens the way he would at a campfire on a bad stretch of road: for a door opening, boots in the corridor, the ladder to the loft creaking. If the lamp next door goes out he notes roughly when. If someone comes or goes he notes that too.

Then he lies down on top of the blanket with one hand near the sword hilt and sleeps the way sixteen years taught him: lightly, and all at once.

He's up before the window greys. He shrugs into the mail, buckles the belt, slings the shield and takes two of the javelins. They're no use against something underground, but useful if it comes up. He leaves the other two, the torches and the bedroll in the room. He takes the healer's kit and the rope, since a pasture with holes in it is a good place to need fifty feet of hemp.

On his way past he knocks once, softly, on Sefa's door. "First light. I'll be in the lane by the last forge." He doesn't knock on Corby's.

Downstairs, if Orla or a kitchen girl is up, he buys a heel of bread and eats it walking.

At the lane he waits for Hedda and Tobin. Before anyone steps off the hard road, he looks the pasture over from the edge: the slope down to Ruddock's ditch, any holes he can see, how the ground lies, whether anything is out on it.

*(Out of game: did Bram hear anything in the night, Corby leaving, voices, the ladder? And at the lane, what can he see of the lower pasture from the road in the first light?)*
````

### Screen 12 · player r12

````text
The common room goes on roaring under the floor for another hour. You sit on the edge of the cot in the dark with your boots on and listen the way you would at a fire on a bad stretch of road.

The ladder over the stairhead creaks again and again as the carters go up in ones and twos to the loft, swearing at the rungs. A door down the corridor opens and shuts. It's the snorer nearest the stairs, back from the privy, and his snoring starts up again inside a minute. Through the plank wall the man next door is mostly quiet. Now and then a chair creaks, and once there's a short dry cough. A thin seam of lamplight shows where two planks don't quite meet under the eaves. It stays lit long after the noise below has died down to Orla's broom and the bar of the street door going home. Somewhere near midnight, by the feel of it, the seam goes dark. Nobody goes into that room and nobody comes out.

You lie down on top of the blanket with your hand near the hilt and sleep.

You wake before the shutter greys, all at once, the way you always do. The corridor is black except for the rushlight, burned down to a stub in its dish. You get into the mail by feel, buckle the belt, sling the shield and take two javelins. You coil the rope at your hip and hook the healer's kit on the belt. The other two javelins, the torches and the bedroll stay by the cot.

You have the last buckle done when the door next to yours opens.

It's quiet, the way a careful man opens a door, but not sneaking. Boots go past your room toward the stairs at an even pace. They're good boots by the sound, with no hobnails, and there's no hurry in them. The stairs give their creaks one after another and then go quiet.

You go out a minute later. You knock once, softly, on the last door. "First light. I'll be in the lane by the last forge." Then you go down.

Orla isn't up yet. A kitchen girl in a sacking apron is on her knees at the hearth, blowing yesterday's embers back to life. Yesterday's loaves sit on the board beside her under a cloth. She sells you a heel for a copper without getting up, holding out a sooty palm for the coin. While you're paying, the back door to the stable yard stands ajar on the cold, and you hear a horse being led across the yard cobbles. A man's voice says something low to the ostler. Then the yard gate drags on its hinge, and the hooves go out at a walk and fade into the street. The girl doesn't look round. Out here people leave early all the time.

---

Beregost is grey and cold and smells of last night's coal. A few chimneys are smoking along the Coast Way, and somewhere a forge has started early, a single hammer at a slow, warming-up pace. You eat the bread as you walk. The south lane leaves the Way past the last forge. It's hard-packed and rutted from Ruddock's hide carts, with a hurdle fence along its west side.

Hedda is already there, leaning on the fence with her arms folded. Tobin is beside her, holding a headless pike shaft upright like a standard. It's eight feet of grey ash, split a little at the top end.

"Thunderhammer's lad was lighting up," Tobin says before anyone asks. "Said take it, it's firewood."

"He asked," Hedda says, to settle it.

From the lane, in the thin light, you look the pasture over before anyone sets foot off the hard road.

It slopes away west, rough grass gone silver with dew, down to a line of reeds and a low mist that hangs where Ruddock's ditch must run. The smell comes up the slope on the cold air, sour and rank like the bottom of a tan pit. The top end near the lane is cropped short. The bottom end, toward the ditch, has grown long and lank and darker green. That's the wet ground Col talked about, and the sheep have left it alone.

The sheep are here, a dozen or so, packed against the hurdle at the top corner of the field, as close to the lane as they can get. None of them is grazing. They stand with their heads up.

Down near the reeds, about where Col said, there's a dark mark in the long grass that the dew hasn't silvered. It's round, roughly the width of a cartwheel, and too regular to be a shadow. From this distance you can't see into it. There's no spoil heap beside it, just as the notice said. The grass grows right up to the lip, and then there is nothing.

There's a second thing, and it takes the slant of the early light to show it. Thirty feet or so up the slope from the hole, a shallow line runs across the pasture, crooked and no deeper than a plough furrow. The grass along it lies a shade lower than the grass on either side, as if the ground underneath has settled. It runs from somewhere near the ditch toward the middle of the field and fades out before it gets there.

Nothing moves out on the grass. The mist lies still on the ditch. Behind you on the Way, a second hammer joins the first.

Hedda follows your look down the slope and says nothing for a while.

"That line," she says at last. "Was that there for the carter yesterday?"

Nobody here can answer that. Col might. His lane runs on past the pasture to the south, and there's smoke going up from a chimney at the far end of it.

Your records, changed:
Money: + 29 cp; − 30 cp

Where you are: south lane by the last forge, edge of Ruddock's pasture · Time: Day 2 · morning
````

**Player** (player r12):

````text
Bram stands at the hurdle a long moment with the bread forgotten in his hand, reading the slope the way he'd read a ford before putting wagons in it.

"That's its road," he says quietly to Hedda. "The line. It runs just under the turf, close enough that the roof sags behind it. That's fresh. Ground that's been settling a week would show it in the grass colour, and that hasn't." He nods at the sheep pressed against the hurdle. "And they know it's down there. Sheep don't stand like that for a dog."

He looks along the line to where it fades out in the middle of the field. That's the part that interests him.

"It stops short of the dry ground. Likes the wet end, by the ditch. Soft digging." He finishes the bread. "Nobody goes down there this morning. Not with four of us and no plan. Tobin, you can tap the ground along the hurdle here if you like, up where it's cropped and hard. Hear what solid sounds like. Then you'll know what hollow sounds like when you find it."

He waits for Sefa a minute or two, watching the reeds. Then he says to Hedda, "By the way, our friend in the grey coat. Corby. He left before dawn, on a horse, out the stable yard. Paid through tonight, Orla said. Might be back for supper, might not." A shrug. "Just so you know his face."

Then he points down the lane at the chimney smoke.

"I'm going to ask Col whether that line was there yesterday, and make sure his girl's indoors. Then Ruddock, at the yard. He's lost two ewes and a dog in his field. He'll want it gone before it learns there are children on the lane." He looks back at the dark round mark by the reeds. "If he'll pay something fair, this is an afternoon's work for five, before the wagons go. They come up at noise and weight, so you give them something to come up at, and you're standing where you want to be when they do. Hard ground at your back, spears out." Dryly: "Not my first rule of the road, but it's in the first ten."

He sets off down the lane on the packed ruts, keeping to the hard middle and well off the pasture side. Hedda and Tobin can follow or wait for Sefa. On the way he watches the field edge for any more of those sagging lines, especially any that run toward the lane.

*(At Col's door: Bram asks about the furrow line, whether it was there yesterday, and which way it ran. Then on to Ruddock's yard to ask what he'll pay to be shut of it.)*
````

### Screen 13 · player r13

````text
Sefa is already at the fence when you get there.

"Glad to hear it, Tobin," she says. She follows Hedda's pointing finger along the shallow trough, then looks back at the sheep pressed against the fence. "Something may be tunnelling under there. Let's not spread out across it yet. That pole won't give much warning if the ground beneath us is hollow." She stays on the hard-packed lane and studies the hole and the sunken line from the fence.

Hedda hears you out. At *that's fresh* she looks at the line again, longer this time, then at the sheep.

"No plan, no field," she says. "Suits me." She tips her head at Tobin. "Tob. Hard ground only."

Tobin is already moving, delighted to have a job. He walks the cropped strip inside the hurdle's shadow and stays on the lane side of it, reaching over the top rail to thump the butt of the pike shaft on the turf. On the high ground it sounds dull and solid, like knocking on a table.

Pell comes up to the fence without a word and stands a little off from Hedda and the boy, on the side away from the town. He doesn't cross the hurdle. His eyes run along the edge of the pasture, then go to the dark patch by the reeds and the huddled sheep. He looks to you and keeps his voice low, pitched for the four of you only.

"I'll stay this side of the fence and go along the lane a way. Before we walk that grass, I want to see if whatever made the hole came up from below and went back down, or whether it came across the lane in the night. The edge will tell." He tips his head toward a low run of grass by a fence post, noticeably flattened. "No one goes through the gate yet. If the ground moves, I'd rather be on the path than in among the sheep."

He moves off quietly along the lane outside the pasture, hands loose at his sides, studying the verge and the fence line as he goes.

When you mention the grey coat, Hedda gives it one nod.

"Corby." She files it away. "Paid through tonight and gone before light. Fair enough. I've done it." She doesn't say when.

As you go down the lane you watch the field edge, and you see no other sagging lines. Only the one runs across the pasture, and it doesn't come anywhere near the lane. Behind you Pell works slowly south along the verge on the pasture side.

Col Fenner's place is the last on the south lane. It's a low cottage of mud and timber with a hide shed leaning against it and a chimney smoking straight up. The lane runs on past it, rutted, toward the next field. You've barely reached the step when the door opens. Col has been watching the lane from the window.

He's sober and grey in the face, in yesterday's shirt. The left sleeve is rolled up, and the forearm under it is still red and shiny but no worse. Behind him a girl of eleven or so sits on a stool by the fire with her chin on her fists and a basket on her knees. She is sulking with her whole body.

"She's in," Col says, before you can ask. "Says the Coast Way's twice as far. It is." He comes out onto the step and pulls the door to behind him.

He hears your question about the line and looks back up the lane at the pasture for a long time before he answers.

"Weren't there." He's sure of it. "I went straight down to that hole after Bess, running. Straight down the slope. Ground was hard under me all the way to the wet. If that had been there I'd have gone in up to my knee." He shakes his head slowly. "It come after. In the night, or this morning. I couldn't tell you which way it ran. I never saw it."

He rubs his good hand over his face.

"Ruddock's at his pits by now. Top of the lane, behind the last forge, where the ditch starts." He looks at you straight. "What did you see down there?"

Where you are: on Col Fenner's doorstep at the end of the south lane · Time: Day 2 · morning
````

**Player** (player r13):

````text
Bram tells it plainly, standing on the step with his back to the lane.

"A hole by the reeds, the width of a cartwheel. No spoil, same as you said. And a line thirty feet up from it, running across the slope toward the middle of the field, where the ground's sunk behind something moving just under the turf." He keeps his voice level. "If you went down that slope on hard ground yesterday, then it's moved since. It's moving uphill, and that's a beast getting bolder. Your sheep know it. They're packed in the top corner and none of them is grazing."

He glances past Col at the girl on the stool and lowers his voice a little.

"It hasn't come near the lane. I watched the whole field edge walking down, and so is the lad behind me. Your house sits on hard ground. Keep her off the grass and on the packed ruts, and keep yourself off it too. Don't go looking for Bess's collar." A beat. "I'm sorry. I'd want to. Don't."

Then, practical:

"One thing. Your hides. Anything that stinks of fresh blood sitting out in that shed tonight, put it up off the ground or shut it in. No sense ringing the dinner bell."

He leans round the doorframe just enough for the girl to see him, and nods to her gravely, one road hand to another.

"Coast Way's twice as far, aye. It's also the way the caravans go. Mind your feet on it."

Back on the step, to Col: "I'm going to Ruddock now. If he'll pay something fair, we'll deal with it today, in daylight, before the wagons go tomorrow. If he won't..." He shrugs. "We'll see. Either way, I'll stop back and tell you."

He walks back up the lane on the hard middle. When he reaches the pasture he whistles once, short, to call Pell, Sefa, Hedda and Tobin together. Then he goes on with whoever comes, toward the top of the lane behind the last forge, where the ditch starts and the tan pits stink.

*(At Ruddock's: Bram wants to know what he'll pay, and whether he can spare anything useful: a couple of old ewes past breeding, or a dead one, for bait, and planks or hurdles to stand on. He'll also ask whether Ruddock has seen the thing itself, and how deep the ditch runs.)*
````

### Screen 14 · player r14

````text
Col hears it all without moving. He looks at the step between his boots when you say *moving uphill*, and again at *don't go looking for Bess's collar*. His jaw works once, and he doesn't argue.

"Wasn't going to," he says after a while. Neither of you believes it, and he lets it lie.

When you mention the hides he looks round at the shed leaning on the cottage wall. "Three green ones from the knacker in there, come last night. Salted, not scraped." He rubs his good hand down his face. "I'll get them up on the beam. Shut the door on them."

You lean round the doorframe. The girl on the stool has been listening to every word with her chin still on her fists. She looks back at you, the big man in mail, for a moment, seems to decide you count, and sits up.

"Caravans go that way?" she says.

"Wenna," Col says, without heat.

"I'm only asking." She looks at you again, and the sulk is gone from her shoulders. "I'll mind my feet."

On the step Col nods once at *I'll stop back*. "Aye. Do." He goes inside and shuts the door. Through it you hear him say something low to the girl, and then the scrape of the shed bolt round the side as he starts on the hides.

---

You walk back up the lane on the hard middle of the ruts. The pasture looks the same as it did. The sheep are still packed into the top corner, the line still lies across the slope and the mist still hangs on the ditch. When you reach the hurdle you give one short whistle, and it carries over the wet grass. Then you go on north toward the last forge.

You find Ruddock's yard by the smell before you see it. Behind the last forge the lane opens into a muddy square fenced with hurdles. There's a long open shed hung with hides, a row of brick-lined pits sunk in the ground with a scum of bark and lime on the water, and a pump. At the low corner a trench takes the overflow away downhill. That's where Ruddock's ditch begins. The stink here is thick enough to taste.

A man is standing in the nearest pit up to his thighs in leather waders, working a hide over with a pole. He's square and bald and fifty or so, and his arms are stained brown to the elbow, the colour tanners never wash out. He sees your mail and shield come into his yard and doesn't stop working.

"If it's leather, I've none cured till the month's end," he calls. His voice is loud and flat from years of shouting over the yard. "If it's the Fist, I've paid."

He listens while he works. At *the lower pasture* the pole stops. He heaves himself up out of the pit onto the brick edge, water running off the waders, and wipes his hands on a sacking apron that makes them no cleaner.

"Col's dog." It isn't a question. "He told me at the pump. Daft old bitch." He says it gently.

He answers your questions in order, a man used to answering buyers.

"Seen it? No. Seen what it leaves. First ewe went eleven nights back. I found a hole where she'd been lying, and I thought the ground had let go under her. Old workings, my father used to say, there's clay pits all under that end. Second ewe, four nights back. Second hole. That's when I wrote the paper." He jerks his head at the trench. "The ditch is three foot deep where it leaves here, maybe four by the reeds, and four foot across. It's what comes off my pits. Lime and bark and worse. Nothing drinks from it. Nothing lives in it. If you go in it, you'll want to burn your boots."

To the bait he gives a short bark that might be a laugh.

"Old ewes I've got. There's one with foot rot that's had her last lamb. She's yours, and welcome, and I'll throw in the one that keeps getting through the hurdle. Hurdles, aye, there's a stack behind the shed. Planks, there's the old pit boards, oak, soaked through, heavy as sin. Bring them back."

Then he folds his stained arms and looks at you the way he'd look at a hide brought to him for curing, weighing what it's worth against what it'll cost him.

"Pay. I'm a tanner, not a patriar. The Fist offers five a head for bandits and doesn't pay it, so I'll not insult you with that." He thinks. "Eight gold, from me, when it's dead and I can see it. And the shell." His eyes sharpen a little. "If that's what you say it is, an armourer in the Gate'll pay for the plates off its back. I'd want first offer on it at a fair price. That, or you take the shell and I pay you six. Your choice."

He waits, dripping onto the bricks.

"Today, you said. Before your wagons. Where do you want my ewes?"

Where you are: Ruddock's tan yard, behind the last forge · Time: Day 2 · morning
````

**Player** (player r14):

````text
Bram looks round the yard at whoever has followed him up from the pasture before he answers.

"Eight gold and first offer on the shell, at a fair price," he says to Ruddock. "Fair means what the armourer in the Gate would give us, less the cart to get it there. You'll see it dead before you pay a copper." He puts out his hand, stain and all, and shakes on it. "Keep the ewes penned here till we come for them. We're due at Venn's yard mid-morning. We'll be back after, in good light, early afternoon. Lend me a mallet and a stake as well, and a few feet of cord for the ewes."

Then he turns to the others, low and plain, the way he'd brief a guard before a bad ford.

"Here's how I'd do it. We carry the oak boards down and lay them on the last of the hard ground, above where the line fades out. That's our floor. We stake the old ewe twenty-odd feet below it, on the soft, right across the line it's been running. She'll bleat. That's what we want. Then we stand still and quiet on the boards and let it come to her."

He scratches a rough arc in the mud with his boot.

"Don't bunch up and don't stand in a row. I've heard they spit acid in a line, and a row of people is a gift. Spread out in a curve, ten feet apart. I'll stand nearest the ewe with the shield. Hedda, on my left. Tobin, keep that pole, and the moment anything under you sounds hollow, step back onto the boards and shout. Javelins first when it breaks the turf. Then close in before it goes back down. If it grabs someone, everybody hits it. They let go when they're hurt. Sefa, stay back on the hard ground where you can see all of us. Pell, wherever you like, as long as it's not on the grass."

He looks at the trench of filth running downhill.

"And nobody fights with that ditch behind them. If it drags anyone, it'll drag them toward the wet."

To Ruddock, as he turns to go: "The second ewe, the one that gets through hurdles. Keep her. If one doesn't bring it up, she can try. If neither does, we'll think again."

*(Out of game: if anyone objects or has a better plan, Bram listens. Then he heads for Venn's yard behind the Thunderhammer to see the wagons, check the axles and meet Tam Hesketh and his boys, meaning to be back at Ruddock's by early afternoon.)*
````

### Screen 15 · player r15

````text
Ruddock hears your terms standing on the brick lip of the pit, water still running off his waders. While you talk you glance round the yard, looking for whoever answered the whistle. The gateway behind you is empty. The lane bends round the back of the last forge, and nobody has come round that bend yet.

"What the Gate armourer gives, less the cart," Ruddock repeats. That short bark comes out of him. "And who tells me what the Gate armourer gives? You?" He weighs it the way he'd weigh a hide with a flaw near the shoulder, then decides the flaw can be worked round. "Fair enough. I'll write and ask him myself, and you'll see the letter." He takes your hand. His grip is wet and hard, and it leaves a brown smear on your palm that won't come off for a day. "Eight when it's dead and I've seen it. First offer on the plates. Done."

He has no trouble with the ewes. "They'll be in the pen by the shed. The old girl won't mind. She's minded nothing since lambing." The mallet, stake and cord are fine too. "They'll be by the pump when you come back. I'll not have you carrying my mallet round Venn's yard and leaving it there."

You turn to brief the others, and you end up giving it to an empty yard. You set out the boards on the last of the hard ground, the ewe staked twenty-odd feet below on the soft, across the line, and the curve ten feet apart, not a row. You scratch the arc in the mud with your boot heel. Ruddock is the only one who hears it. He doesn't pretend not to listen. He leans on his pole and follows your boot through the mud.

At the part about the ditch he nods slowly.

"Good. That ditch'll take the skin off you without any help from the beast." He points his pole down the trench, toward the lower pasture out of sight beyond the hurdles. "And mind where you put my boards. My father always said the hard ground stops where his clay pits started. It's a straight line, more or less, across the middle of the field. Below it the old workings were filled in with whatever came to hand. Above it there's nothing but clay and stone, the way the gods left it." He shrugs. "That's what he said. I never dug to see."

He hears the last of it, keep the second ewe, and nods once.

"She stays. She'll be through the hurdle by noon whether I want her or not." He lowers himself back into the pit up to his thighs and takes up his hide again. "Early afternoon, then. I'll be here. I'm always here."

The pole goes back to work. Behind the forge the hammers have their full rhythm now, and the lane past the gateway is still empty. The smoke over the town has only just begun to thin. The sun is barely clear of the roofs.

(Out of game: it's about half past six, and Venn said he'd be at his yard from mid-morning, when the oxen come in, so you have three hours or so before he's there. Do you go now, wait here for the others, or do something else first?)

Your journal, new:
+ Goal: Kill the beast in Ruddock's lower pasture
+ Quest: Kill the beast in Ruddock's lower pasture
+ Promise: Return Ruddock's pit boards and mallet

Where you are: Ruddock's tannery yard, by the pits · Time: Day 2 · morning
````

**Player** (player r15):

````text
Bram looks at the empty gateway, then at his brown-smeared palm, and snorts quietly.

"Briefed the tanner. Well, he's the one with boards in it."

Before he goes, he steps to the edge of the pit.

"Your father's line, where the hard ground stops. Is there anything on the surface that marks it? A fence post, a stone, a change in the grass? I'd rather lay oak on clay your father left alone than on whatever he filled the pits with." He waits for the answer and fixes it in his head. "Early afternoon. Keep the old girl fed. She's got one more job to do."

Then he walks back down the lane toward the pasture, on the hard middle of the ruts, to find the others. Whoever is at the hurdle, he gives them the plan the way he gave it to Ruddock, without the boot-scratching this time. Boards on the hard ground above the clay-pit line. The ewe staked below it, across the furrow. A curve, not a row. Javelins when it breaks the turf, close in before it goes down, and nobody with the ditch at their back. He adds what Ruddock said about the old workings.

"So the beast's been living in soft filled ground. It hasn't been digging new earth. That's why there's no spoil, maybe. And why the line stops where it does." He nods at the middle of the field. "If Ruddock's father was right, it can't come up under our boards without breaking clay, and we'll hear that."

Then, to all of them:

"We've three hours before Venn's yard. I'd spend one of them eating something hot and one looking at a wagon. I'm going back to the Burning Wizard for whatever Orla's frying, then on to the Thunderhammer early. Anyone who wants to look at axles with me is welcome. Anyone who'd rather sleep, sleep." A glance at Pell. "And if you went along that verge and found anything, I'd hear it over breakfast."

*(Out of game: Bram heads back to the inn for breakfast with whoever comes. On the way he keeps an eye out for Corby's horse, in case it's back in the stable yard.)*
````

### Screen 16 · player r16

````text
The woman with the book, Sefa, stops beside Hedda, well clear of the pits and the overflow trench, and speaks to the tanner.

"Mind the ditch because of the runoff, or because you've seen the creature there?"

Then she looks to you and the marks at your feet. "Show me what you've worked out. I can strike from well back and push it away from someone if my spells land, but I need a clear line, and I can't promise to hold it off."

She glances toward the lane. "Pell was still inspecting the fence when we left. Let's hear what he found before we settle on a plan."

---

You look at the empty gateway, then at the brown smear on your palm, and snort quietly.

You step to the brick edge of the pit. Ruddock doesn't stop working the hide, but he listens to your question about his father's line. When you get to *whatever he filled the pits with*, the pole goes still.

"Fence post, no. Stone, yes." He points the pole at a gap in the yard hurdles, out toward the pasture. "On the north hurdle, about halfway down, there's a flat grey stone the size of a door-step. My father set it at the top corner of the last pit so he'd not put a plough in it. The grass has half grown over it, but you'll find it if you kick about. From there it runs straight across, near enough." He takes up the hide again. "And look where the sheep stop eating. They knew where it was before my father did."

You tell him early afternoon, and to keep the old girl fed.

"She's always fed. It's the only thing she's good at."

You turn to go back down the lane. Before you've taken three strides, boots and a pole butt come round the bend behind the forge. Tobin is first, with his collar up over his nose, then Hedda, then Sefa. They come in through the hurdle gateway, Ruddock calls out his piece about the arc and the ditch, and your walk to the pasture is cut short. The people you meant to find are standing in the mud with you.

---

When Sefa puts her question to him, Ruddock answers without turning round.

"The water. I've not seen your beast, not there nor anywhere else. That ditch is lime and bark and what comes off a hide. It'll eat the skin off your shins, and if you're lying in it with a cut it'll eat the cut. That's all I meant." He heaves the hide over. "That's enough, mind."

---

You give them the plan standing over your own boot-marks, the way you gave it to the tanner but shorter, and you don't scratch it out again. Oak boards on the last of the hard ground. The ewe staked below them on the soft, right across the furrow. A curve ten feet apart, not a row. Javelins when it breaks the turf, then everyone closes in before it can go back down, and nobody with the ditch at their back. Then you add the old clay workings and the grey stone on the north hurdle, and what you take from them.

Hedda listens with her arms folded and her eyes on the arc in the mud. When you finish she nods once.

"Curve's right. I've seen a thing spit in a line, at Nashkel. A man stood behind his mate to be safe." She leaves it there. "I've a spear. No javelins."

"I've got this," Tobin says, lifting the pike shaft.

"You've got a stick."

"It's a long stick."

When Sefa says she can hit it from well back and shove it off someone, you have her answer in the arc already: the hard ground behind the curve, where she can see all of you and nothing stands between her and the furrow. Hedda looks sideways at Sefa when the word *push* comes up. It's the same slow look she gave the book last night, but she doesn't say anything.

When Sefa says you should hear what Pell found before the plan is settled, Hedda tips her chin at the gateway behind you, where the lane bends round the forge wall.

"He was still at that post when we left. He'll come or he won't."

You tell them all how you mean to spend the three hours. Tobin brightens at *something hot* like a lamp being turned up. Hedda considers it.

"Venn's yard," she says. "Middle of the morning. We'll eat first." She doesn't say where, or whether it's with you.

Behind you, in the pit, Ruddock's pole goes on slapping the hide. The sun is well clear of the roofs now, and the smoke over Beregost is thinning toward the hills.

*(Out of game: Pell is reaching the gateway right now, so the walk back to the inn starts next round with all of you together. The stone and the grass line are things you can check this afternoon. No rolls were needed this round.)*

Where you are: Ruddock's tannery yard, Beregost · Time: Day 2 · morning
````

**Player** (player r16):

````text
Bram nods to Sefa first.

"A clear line's what the curve is for. You'll be behind us and up the slope, with nothing between you and the furrow but grass." He thinks. "If it gets its jaws on someone, that's when I want your push. They hold on hard, and a shove off the wet ground does more than another cut."

To Hedda: "I've two more javelins up in my room. They're yours this afternoon. Throw them first, then keep your spear." Then, dry, to Tobin: "Long stick's fine. Your job's to find hollow ground and shout. If it comes up near you, you don't hold it, you back off onto the boards and let the rest of us hold it."

When Pell comes in through the gateway, Bram waits until he's close enough for low voices.

"Ruddock pays eight gold when it's dead, and first offer on the shell. Early afternoon, after Venn's yard. Boards on the hard ground, the ewe staked below it." He sets off up the lane toward the Coast Way, walking with them. "Did the verge tell you anything? Did it come across the lane in the night, or has it stayed in the field?"

He listens to Pell all the way back. At the Burning Wizard he glances into the stable yard before he goes in, to see whether Corby's horse is back. Then he finds a table with his back to the wall and asks whoever's serving for whatever's hot, and lots of it.

Over the food, he says to the table at large:

"After this, Venn's yard. I want to look at the axles and the yokes before Tam's boys load anything, and see what spare wheels and grease he's carrying. If a wagon breaks down on that road, we're stood still where somebody's already taken two loads." He tears bread. "Then the field. Then supper, early bed. We roll at first light tomorrow."

*(Out of game: Bram fetches the two spare javelins from his room after eating and gives them to Hedda.)*
````

### Screen 17 · player r17

````text
Sefa answers you: "Breakfast sounds good. And I'll come look at the wagons afterward." She looks at the arc again. "If it spits, I'll stand off to one side behind you, not directly behind anyone. The boards may give us firm footing, but I'd rather not count on hearing it dig in time."

Hedda hears it and gives a short nod. "Off to the side. Good."

When you offer the two spare javelins, Hedda takes her time answering. "Two." She thinks it over. "I throw them, they come back to you after. Whatever's left of them."

Tobin repeats his orders under his breath like a lesson: "Find it. Shout. Back off onto the boards." Then, louder: "I can do that."

"You'll do that," Hedda says. "Tob. Nothing else."

Pell keeps himself at an angle to the yard, where he can see the hurdle gate and you both. "Morning to you too," he calls to the tanner, pleasantly. "I'll mind the ditch." Ruddock grunts and doesn't look up from the hide.

Then Pell speaks low to you and whoever is near: "They'll go down soon. Whichever way we do it, the boy's pole finds the roof of it. Tap along the lane side, stay off the sag." He takes a short, unhurried look out through the gap in the hurdles. "You drag those sheep out of that corner before we cross the grass. Frighten them, they'll scatter, and one will be over a soft patch in the wrong field." He looks at Sefa. "Just know whether an ankheg is the kind of thing that waits through the day after it's killed, or goes deep by sunup. You'd best decide how long we can wait."

Pell spoke low, but Ruddock has been listening to strangers in his yard all morning. He looks up at the bit about the sheep. "My sheep stay where they are." His pole points out through the gap in the hurdles, toward the pasture. "That corner's the top of the hard ground. They've packed into the safest spot in the field. Drive them off it and you'll do the beast's work for it." He heaves the hide over. "They've more sense than most."

Pell raises his voice: "Can we borrow a lantern and a pot of water? We want to see what we're walking into before one of us ends up in your next hole."

Ruddock squints up at the sky over the forge roof. The sun is well clear of it now. "It's broad day." He doesn't ask what the lantern is for. "There's a horn one on the shed post. Water's the pump, and it's free. There's a pail beside it. You'll have both with the boards this afternoon, and they come back with the boards." He gives a short bark of a laugh and goes back to the pit.

Nobody answers Pell's question to Sefa.

You set off up the lane toward the Coast Way. Sefa falls in beside you, with Hedda and Tobin behind, the pike shaft bobbing over their heads. The stink fades a little with every step past the forge wall, but it stays in your clothes. Pell is still standing in the mud of the tanner's yard when the bend takes him out of sight.

The Coast Way is properly awake now. Every forge on it is going, a dray loaded with charcoal is grinding north, and a dog is barking at its wheels. At the Burning Wizard you look into the stable yard on your way to the door. The stall that stood open at dawn still stands open. The straw is clean and swept back, and the stall is empty. The ostler is mucking out the next one along and doesn't look round.

Inside, the common room smells of porridge and last night's ale. Orla is behind the bar with her sleeves rolled, and her voice reaches every corner. You get a table against the wall. When you ask for something hot, and lots of it, she comes over.

"Porridge, fried bread and bacon. If you mean lots, three silver." She looks at the rest of you. Her eyes stop on Tobin's collar, still pulled up over his nose. Then she sniffs. "You've been at Ruddock's. Sit by the door." She doesn't make you move. "And you?"

Hedda takes the porridge, one silver. Tobin takes the porridge with bacon on top for two, and Hedda lets him. Orla wants your three silver whenever you care to pay.

Hedda eats with her spoon while you lay out the plan, and she listens with the rest of her. "Spare wheel," she says. "Venn'll say he's one. Ask to see it."

When the bowls are empty, you go upstairs and come down with the two javelins from beside your cot. You hold them out shaft first, and Hedda takes them. She weighs one and sights along it at the shutter. Then she slings them both through her belt beside the spear. "They'll do."

It's a little past half seven. Venn won't be in his yard until the oxen come in at mid-morning. The Thunderhammer is two streets off, and its hammer is already going.

Your records, changed:
Carried: + Javelin ×2; + Javelin ×2; − Javelin ×4

Your journal, new:
+ Debt: Bram's breakfast at the Burning Wizard
+ Debt: Hedda's and Tobin's breakfast at the Burning Wizard

Where you are: common room of the Burning Wizard · Time: Day 2 · morning
````

**Player** (player r17):

````text
Bram counts three silver onto the table for Orla when she comes past.

"Mine. Hedda and the lad settle their own." He nods at the pair without unkindness; it's how sellswords keep accounts straight. Then, as she gathers the coins: "Stall your ostler swept this morning. That was Corby's horse? Did he say where he was riding, or when he'd be back?" If she shrugs, he lets it go.

He looks round the table.

"Pell stayed behind at Ruddock's. He'll find us or he won't, as Hedda says." Then, getting up and slinging his shield: "Venn's not in till the oxen come, but wagons don't need him to be looked at. I'm walking over to the yard now. If his wagons are standing there, I'll start on them before Tam's boys start loading."

At the yard behind the Thunderhammer he goes over the wagons the way he would at any hiring yard, slowly, one at a time: crawls under to look at axles for cracks and wear, spins wheels to listen for a dry hub, checks spokes, felloes and tyres for loose iron, tugs the kingpins, looks over the yokes and bows for splits, and counts what's carried spare: wheels, axle, grease pot, rope, chain, a jack. Taking Hedda's advice, he wants to *see* the spare wheel, not hear about it.

If anyone is about, a yard boy or Tam himself, Bram introduces himself plainly and asks which wagon is the heaviest loaded and which has given trouble before.

*(Out of game: Bram's main concern is anything that would leave a wagon stopped on the road between Lark's Ford and Kesh's. If he finds a fault, he notes it to raise with Venn when he arrives. Also, a quick check: my carried javelins should now be 2, with Hedda holding the other 2 for the afternoon.)*
````

### Screen 18 · player r18

````text
The woman with the cloth over one shoulder is Orla, and she stops at the table. You count your coins onto the boards for her.

Hedda is already putting hers down: one silver for herself and two for Tob. She slides them over without a word. Orla scoops up all six coins and drops them into her apron without counting, as she always does. Sefa says, "Porridge and bacon for me, please," and lays two silver beside them. Orla takes those as well.

"Pot's on. It'll be quick." When you ask about the stall, she shrugs with one shoulder. "Corby? He paid through tonight and he owes me nothing. Stripped his own cot, which is more than most do. Said nothing to me, but I was still abed." She tips her head toward the back door and the stable yard. "Wat saddled him. If anyone saw which way he turned, it was Wat."

She's gone before anyone can ask anything else. The kitchen girl brings Sefa's bowl a minute later. It's the same grey porridge with two rashers laid across it, still spitting.

You get up and sling your shield. Sefa speaks to you before you go: "I couldn't answer Pell's question about whether it stays near the surface by day. I don't know enough about ankhegs. If it doesn't take the bait this afternoon, let's not go hunting through its tunnels to force the matter." Hedda hears it from across the table.

"Nobody goes down holes," she says. "Agreed."

Tob looks as though he'd like to argue, then looks at his porridge.

---

Venn's yard is two streets off, behind the Thunderhammer's back wall. The forge has a full fire going now, and heat comes off the bricks as you pass. The yard gate stands open. Inside there's a square of packed earth with ox stalls along one side and a lean-to shed along the other. The shed is stacked to the rafters with salt in sacks under a tarpaulin, and wool bales are roped beside it. Four wagons stand in a row with their tongues down. Their beds are swept and empty.

The only person about is a boy of about fourteen, mucking out the ox stalls with a fork that's taller than he is. He straightens up when he sees your mail and shield, and he clearly doesn't know what to do with his hands.

"Master Venn's not in yet," he says. "Davy. I keep the yard." He jerks his chin at the shed. "I sleep in with the salt now. Since the second lot."

When you ask which wagon is heaviest and which has given trouble, Davy answers quickly, as if he's been waiting all spring for someone to ask.

"Tam's. The big one at the end, she takes the salt. The rest take wool, and wool's light." He points the fork at the third wagon in the row. It's older than the others, and its sides were painted brown once. "The old brown. Master Venn drives her himself. She threw her near hind tyre on the Gate road at the thaw, and he had the Thunderhammer put new iron on. Cost him, he said. Says it every time he looks at her."

You work down the row slowly, the way you have at a hundred hiring yards.

Tam's wagon is sound. The axles are dry-clean and free of cracks, and the hubs are packed with grease. Each wheel you spin runs quiet and true. The kingpin doesn't move when you pull on it. Someone who knows what he's doing has kept this wagon, and kept it for years.

The second and fourth wagons are sound too, if more tired. One spoke on the fourth has a short split along the grain, but it's tight in both the hub and the felloe and will hold. The yokes and bows are old ash with no splits, worn smooth by necks. There's nothing in them to stop a wagon on the road.

The old brown is the one that matters.

The new tyre on the near hind wheel is good Thunderhammer work, shrunk on tight and sweated in. You crawl underneath on your back in the dirt and look along the axle-tree. Where the near arm meets the body, on the shoulder, a hairline crack runs about a hand's length into the timber. It isn't new. Old grease has worked into it and turned it nearly black, so it's easy to miss unless a man is lying under the wagon looking for it. With wool aboard, on the Way, the axle might go all the way to Nashkel and back. Put the wagon in a deep rut at speed, or let her drop off a ford bank, and that arm could shear. Someone spent good money on the tyre and never looked under the bed.

Then you look at what they carry spare. There are two coils of rope and one length of chain. The grease pot is half full. There's no jack, only a long lever pole and an oak block lashed under Tam's bed.

There is a spare wheel, standing against the back of the shed behind the wool. You roll it out into the light. It's sound, freshly tyred and well greased. It's also a hand's breadth smaller across than any hind wheel in the yard. It's a fore wheel. It will fit the front axle of any of the four wagons and none of the backs.

---

Sefa comes over with Hedda and Tob about a quarter of an hour behind you. You are still crawling under the wagons. The forge noise comes over the wall, a steady double ring.

Davy watches the three of them come in and looks even less sure what to do with his hands.

"I'll leave judging axles to you," Sefa tells you. "I'd like to check the drivers have drinking water and something clean for dressing wounds. Ruddock's ditch was a useful reminder that not every injury comes from teeth."

She goes along the wagons, checking the water casks lashed to their sides, and looks into a box under Tam's driving seat after Davy says it's all right.

"Tam fills the casks at the pump the morning they go," Davy offers. "He says water in a cask overnight goes off."

Hedda walks over to the spare wheel where you leaned it against the wagon. She stands it beside the old brown's hind wheel and looks from one to the other. She doesn't say anything. She doesn't need to.

Tob crouches down to see where you're lying under the old brown.

"Is it bad?"

The sun has cleared the Thunderhammer's roof now and the yard is warming. Venn, Tam and the oxen aren't due until the middle of the morning, about an hour off.

(Out of game: yes, you are carrying two javelins, and Hedda has the other two for the afternoon.)

Your records, changed:
Money: + 7 sp; − 10 sp

Where you are: Venn's wagon yard, under the old brown wagon · Time: Day 2 · morning
````

**Player** (player r18):

````text
Bram slides out from under the old brown on his back, sits up in the dirt, and wipes black grease off his thumb onto his breeches.

"Not bad yet," he tells Tob. "That's the trouble with it." He taps the axle-tree where it meets the body. "Crack in the shoulder of the near arm, a hand long, old. She'd likely go to Nashkel and back on the Way with wool aboard. Drop her off a ford bank, or put her in a deep rut at speed, and that arm shears. Then she's on her belly in the road, the load's stuck, and we're stood still exactly where somebody's been waiting." He gets to his feet. "Lark's Ford has a bank."

He nods at Hedda and the two wheels side by side, his mouth twisting dryly.

"Aye. One spare, and it fits the front. Venn's got a wheel the way some men have a sword they've never drawn."

To Davy, plainly, not unkindly:

"You're not in trouble, lad. You keep a clean yard. Two things, and you'll know better than me. When the second lot went, did anyone come round the yard beforehand? A man asking questions about the route, or the day, or wanting work and not getting it? And the six wagons on Rusk's load, were they Master Venn's own, or hired?"

Whatever Davy says, Bram listens. Then he turns to the others.

"I grew up in a smithy yard. A crack like that, a smith can strap. Iron plate either side of the shoulder, bolted through, and she'll carry anything. That's a morning's work if the fire's already hot, and the Thunderhammer's is." He jerks his head at the wall, where the double ring is going. "I'm going round to ask what they'd want for it, and whether they've a hind wheel to fit, or can tyre one by tomorrow's first light. Then I'll have a price to put in front of Venn when he walks in, not just bad news. A man who's lost ten wagons takes bad news better with a number on it."

To Sefa, with a nod at the casks: "Good. Make sure there's clean linen in that box, and that Tam knows it's there. If he doesn't, it isn't."

He goes out through the yard gate and round to the Thunderhammer's front. He waits for a pause in the hammering, then asks whoever is running the forge. He describes the crack exactly (near hind arm, at the shoulder, hairline, a hand long, old grease in it) and asks two things: what to strap it, today, and what for a hind wheel to match Venn's wagons, iron on, by first light tomorrow.

*(Out of game: Bram just wants the prices and whether it can be done in time. He won't commit Venn's money; he'll take the figures back to the yard and be there when Venn and the oxen arrive.)*
````

### Screen 19 · player r19

````text
The boy you've not been introduced to is told, by the young woman travelling with you, "I'm Sefa. I'll be travelling with them tomorrow. What's your name?"

She puts the box back exactly as she found it. "Two wagons are missing water casks. Do you know whether Tam has them stored somewhere? And how many days is it between reliable places to fill them?"

To Hedda and you she says, "There's no clean dressing linen here, unless Tam brings his own kit. I'll buy some today. Magic's useful, but I can't spend it on every scrape."

She keeps clear of the wagon you're under. "Once you've finished, let's make Venn one list: what needs fixing, what needs replacing, and what we need to carry. Easier for him to settle it while we're all still in town."

---

You slide out from under the old brown on your back, sit up in the dirt and wipe the black grease off your thumb onto your breeches.

Tob takes in every word, crouched by the wheel. When you get to *Lark's Ford has a bank*, the boy looks at the axle again with a different face.

"So it's fine till it isn't," he says.

Hedda doesn't laugh at the line about the sword. She lays the fore wheel down flat on the packed earth, as if she has finished with it, and folds her arms.

Davy stands up straighter when you tell him he's not in trouble. He answers the first question slowly. He's going back over the spring in his head.

"Nobody asking about the road. Not that I saw. There was the Fist lad, though. The one Master Venn paid to ride to Nashkel after the first lot. He came round twice after that, asking when the next lot went." He scuffs the fork in the straw. "I think he wanted paying to ride with it. Master Venn said he couldn't afford him and sent him off. He's not been since."

The second question he answers fast.

"Master Venn's, all but two. Two he hired in the Gate. He's still paying the hire on them, he says so at supper." He hesitates. "He says it a lot."

---

When Sefa asks his name, the boy says, "Davy," and goes red, as though he's already said it once this morning. He has, but not to her.

He watches her put the box back under Tam's seat exactly as she found it. About the casks, he points the fork at the empty pegs on the two middle wagons.

"Those two went with Rusk's lot. On her wagons. There's one more in the back of the shed, but it weeps at the seam. Tam won't have it." To her question about water on the road, he shrugs. "I've never been further than Lark's. Tam says there's the ford, and Kesh's well, and nothing else he'd put in his mouth."

When Sefa says she'll buy linen today, Hedda nods once.

"Buy enough for two of us down at once," she says. "Not one."

Sefa's list gets more out of her than anything else has this morning.

"Wheel goes at the top of it."

---

You go out through the yard gate and round the soot-black wall to the Thunderhammer's front. The forge stands open to the street, and the heat comes out of it like a hand pushing at your chest. Two anvils are going. At the far one a big man with soot to the elbows is drawing out a bar. You know him. He's the smith who pushed the black stone back across the table last night and walked out without the purse. He doesn't look up. If he knows your face from the common room, he doesn't show it.

At the near anvil a grizzled man in a scorched leather apron sets down his hammer in the gap between heats. He listens with his tongs still in his hand. When you say *a hand long, old grease in it*, he nods slowly, like a man who has seen that crack a hundred times.

"Strap either side the shoulder, bolted through. Aye." He thinks. "Two gold and a half, if it's what you say. I'll tell you true once I've had her on her side. Get her round here by noon, empty, and she'll be done by dusk." He spits into the slack tub, and it hisses. "Hind wheel, I can't help you. We don't build wheels, we tyre them. Ames the wheelwright, three doors down toward the temple, keeps a few standing for the Gate wagons. If he's got one to fit, bring it here this afternoon and I'll shrink iron on it for a gold. His wheel's his price, not mine."

He picks up the tongs again. The bar in the fire has gone the colour he wants.

"Gethin," he says, by way of a name, and goes back to work.

Behind him the big smith at the far anvil goes on hammering and never looks round. It's a little after nine. Venn and the oxen are due in about an hour.

Where you are: the Thunderhammer forge front, on the street · Time: Day 2 · morning
````

**Player** (player r19):

````text
Bram nods to Gethin's back. "Two and a half, by noon, empty. I'll bring you an answer before then."

He looks once at the far anvil. The big smith is still drawing out his bar and still not looking round. Bram lets him be. A man who turned down a full purse last night has earned the right to do his work in peace. Bram files the face away and goes.

Three doors down toward the temple he finds Ames the wheelwright. He describes what he needs plainly: a hind wheel to match Venn's wagons, the same diameter as the old brown's near hind and the same hub bore. He offers to walk Ames round to measure it if that's easier than guessing.

"Two questions. Have you one standing that'll fit? And what's it cost, wheel alone, with Gethin putting the iron on this afternoon?"

He doesn't buy anything yet. He gets the number, and whether the wheel can be at the Thunderhammer by early afternoon. Then he walks back to the yard.

There he crouches by the old brown's wheel with Sefa, Hedda and Tob, and lays out the list before Venn arrives:

"The axle strap's two and a half gold. The old brown goes round to Gethin by noon, empty, and she's done by dusk. The hind wheel is whatever Ames said, plus a gold for the iron. Then the two missing water casks and dressing linen." He glances at Hedda. "Enough for two down at once. And a jack, or at least a second lever and block, so we're not stuck under one wagon while another's sitting in the road."

Then, quieter, to the three of them:

"One more thing. Davy says the Fist lad Venn paid to ride to Nashkel after the first load came round twice afterward, asking when the next lot went. Wanting to ride with it, he thought." He lets that sit. "Could be a lad after wages. Could be a lad who knew what day Rusk was going. I'll ask Venn his name."

He stands, brushes the yard dirt off his knees, and waits by the gate for the oxen and their owner.

*(Out of game: if there's time before Venn arrives, Bram also asks Davy whether the Fist lad was at the yard the morning Rusk loaded.)*
````

### Screen 20 · player r20

````text
Gethin doesn't look up when you answer. He gives one nod at the bar in the fire, which is all the answer a tradesman needs. At the far anvil the big smith goes on drawing out his iron. You look once at the soot-black forearms and the steady hammer, note the face and leave him to his work.

---

Ames the wheelwright's is three doors down toward the temple. It's a deep, open-fronted shop that smells of fresh-cut ash. The floor is curled thick with shavings. Wheels hang on pegs along the back wall like shields in a hall, and a half-built one sits in the wheel pit with only six of its spokes in. Ames is a long, stooped man of sixty or so with a grey beard cut short, so it won't catch in anything. He works a spokeshave along a length of oak and keeps at it while you talk. He stops at *same hub bore*.

"Venn's lot. Gate-built, the four of them, out of Hobb's yard by the Basilisk Gate, all but his old brown." He sets down the spokeshave. "I've three hind wheels standing at Gate track. Whether one's right for her I'll not guess. I'll come and see."

He takes a notched ash rod off a nail and follows you back round the Thunderhammer wall into the yard. There he kneels in the dirt by the old brown's near hind wheel. He lays the rod across the wheel's face, then puts two fingers into the end of the hub and feels the bore like a man checking a horse's teeth. He's quiet about it, and quick. He looks along the axle arm while he's down there, and his eyebrows go up at the dark seam on the shoulder. He doesn't say anything about it.

"Middle one of my three," he says, getting up off his knees. "Elm hub, oak spokes, ash felloes, seasoned two winters. Three gold, wheel alone, no iron. I'll roll it round to Gethin myself by noon if it's sold, and he can have the iron on it by mid-afternoon." He tucks the rod under his arm. "If it's not sold, it stays on my peg, and I'll not hold it past tomorrow for a man who hasn't paid."

He goes back to his oak without waiting to hear more.

---

Hedda and Tob are in the yard by the old brown where you left them. You crouch by the wheel and put the list together out loud: two and a half for the strap, the wagon to Gethin by noon and empty, done by dusk. Three for Ames's wheel and one more for the iron. Then the two missing casks, the linen, and a jack or a second lever and block.

Hedda counts it on her fingers without hiding it.

"Six and a half gold, before casks." She looks over at the shed, where the wool is roped up beside the salt. "He'll grumble at six and a half. He'll pay it. He'll grumble at the jack and not pay it."

"There's a lever and block already," Tob says. "Under Tam's."

"One. For four wagons."

Then you lower your voice and tell them about the Fist lad who came round twice asking when the next load went. Tob's eyes go wide at once. He looks at the yard gate as if the lad might be standing in it.

Hedda doesn't look at the gate. She rubs her thumb once over the old brand on her neck and doesn't seem to notice she's doing it.

"Fist lads ask after paid riding. All of them. Pay's late, so they ask anybody with wagons." She drops the hand. "Some of them ask for other people as well. Get his name."

---

Davy has gone back to mucking out, keeping half an ear on everything said near the wagons. When you ask whether the Fist lad was at the yard the morning Rusk loaded, he leans on the fork and thinks hard about it, the way he did before.

"Not the morning she loaded. That was just Rusk's lot and the two from the stockyards and Master Venn." He frowns into the straw. "The second time he came was before that. Three days, maybe four. Master Venn was in the shed counting sacks, and he told him straight out. *She goes Fourthday, and I can't afford you on top of five.* He went off after that. I didn't see which way." He scuffs the fork. "Master Venn says the day to anybody who asks. He did last night as well. At Orla's."

Before anyone can answer, the street outside the yard fills up with the slow knock of hooves on packed earth and a man's voice calling *hup, hup, steady*. Through the open gate the first pair of oxen come round the corner, big and dun and swinging their heads, and then a second pair behind them. Walking beside the lead pair, with a goad over his shoulder, is a square grey man in a carter's smock who doesn't look as though he's spoken all morning. Behind the last pair, ledger under his arm and his sheepskin collar turned up against the cold, comes Aldous Venn.

He sees you at the gate, then the fore wheel lying flat in the dirt, then Hedda, who is plainly holding a sum in her head.

"Well," he says. "That's a face with a number on it."

Where you are: the Thunderhammer wagon yard, by the gate · Time: Day 2 · morning
````

**Player** (player r20):

````text
Bram straightens up from the gate post and nods to the grey man with the goad first.

"Tam Hesketh? Bram Halloway. I'll be walking beside you to Nashkel." He doesn't hold out a hand, since the man has a goad in one and oxen to mind. "If I shout, stop. If I shout twice, get down behind the wagon. That's all I'll ask of you."

Then he turns to Venn. He keeps his voice level and gives it in order, the way he'd read a manifest.

"Two things wrong, both fixable today. The old brown has a crack in the near hind axle arm, at the shoulder. Old, a hand long, grease worked into it. She'll do the Way with wool aboard. Put her off a ford bank and that arm shears, and she's on her belly in the road at Lark's, where somebody's already been waiting twice." He nods at the wheel lying flat. "And your spare's a fore wheel. It won't go on any back axle in the yard."

"Gethin at the Thunderhammer will strap the axle for two and a half gold. He wants her round there empty by noon, and she'll be done by dusk. Ames, three doors down, has a hind wheel to fit, Gate track. He measured her himself. That's three gold for the wheel and one for Gethin's iron, ready mid-afternoon. Six and a half, all told." A beat. "Ames won't hold the wheel past noon unless it's paid for."

"Smaller things. Two water casks went with Rusk's load, and the one in the shed weeps. Sefa's buying dressing linen. And I'd like a second lever and block. One for four wagons means we're stuck if two of them get into trouble at once." He holds up a hand before Venn can object. "That last one I'll argue less hard over. The axle I won't argue over at all."

Then he drops his voice.

"One more thing, and it isn't money. The Fist lad you paid to ride to Nashkel after the first load. Davy says he came round twice after, asking when the next one went. The second time was three or four days before Rusk loaded, and you told him the day." He doesn't make it an accusation. "Could be a lad wanting wages. I'd still like his name, and whether he's still at the Fist post here."

He glances at Davy's empty shed and back at Venn.

"And from here on, don't tell anyone the day. Not Orla's room, not a Fist lad, not a friend. If anyone asks, you're still short of guards."

*(Out of game: if Venn agrees to the repairs, Bram offers to walk the money round to Ames himself so the wheel is secured before noon. Then he helps Tam's boys get the old brown emptied and round to Gethin.)*
````

### Screen 21 · player r21

````text
Tam Hesketh stops the lead pair with a touch of the goad on the near ox's shoulder. He hears you out with his eyes on the beasts, not on you. When you finish, he gives one nod.

"Once, stop," he says. His voice is rough from not being used. "Twice, under." Then he walks the oxen on to the stalls, and that is apparently all the conversation he means to have this morning.

Two lads come in behind the last pair, sixteen or seventeen and a year or two older, both square and grey-eyed like their father. They start backing the oxen into the stalls without being told. Davy goes to help them and looks happy to have something to do with his hands.

---

Venn listens to the whole account standing just inside the gate, with the ledger under his arm. He doesn't interrupt. At *on her belly in the road at Lark's* his mouth goes thin, and he looks past you at the old brown. He looks at her the way a man looks at a dog he's fond of after it has bitten someone.

"I paid the Thunderhammer for that tyre at the thaw," he says. "Nobody said a word about the axle."

"Nobody looked," Hedda says from by the wheel.

Venn lets that go. He walks over to the fore wheel lying flat in the dirt, stands it up with one hand and holds it beside the old brown's hind wheel, the way Hedda did. He looks at the gap between the rims for a long moment and then lets it fall.

"Hobb sold me that as a spare in the Gate. Four years I've carried it." He breathes out through his nose. "Six and a half. The strap and the wheel. Yes." He opens the ledger against his forearm, takes a stub of pencil from inside his coat and writes it down while he talks. "I'll not argue the axle. I'm not such a fool as to argue that."

Hedda tells him about the casks then, plainly: two went south on Rusk's pegs, the one at the back of the shed weeps, and Tam should judge how much water to carry. Venn turns to the stalls.

"Tam. Water."

Tam doesn't look round from the yoke he's lifting. "Two casks to the ford. Ford to Kesh's, one'll do. Not that one." He means the weeping cask.

"There's a cooper next to Ashby's," Venn says. "Two casks. I'll stand that as well." He writes it down. Then he comes to the lever and block, and the pencil stops.

"No." He says it mildly enough. "I've four wagons and a block under one of them, and in twenty years Tam has never needed two at once." He looks across the yard at Tobin, who is holding eight feet of grey ash upright out of the oxen's way. "And it seems the lad has brought his own lever. Ames will give you an oak offcut for a block if you ask him nicely. He has a yard full of them."

Tobin looks at his pike shaft as if it has just been given a rank.

Hedda says nothing. She doesn't need to. She had it right at breakfast.

---

When you lower your voice, Venn lowers his too, and he takes a moment before answering.

"Lem Cotter," he says. "Freckled, red-haired, nineteen or twenty. He rides better than he walks. I paid him four gold to go to Nashkel and back after Dace, and he did it in five days, and he told me what I've told you. Nothing on the road." He closes the ledger on the pencil. "Then he came round asking about the next load. Twice. I took him for a lad who wasn't being paid and saw a merchant who might. Whether he's still at the post, I couldn't tell you. I've not set eyes on him since I sent him off."

He hears the last part, *don't tell anyone the day*, and his face twists.

"I told Orla's whole room the day. Last night. Like a fool." He taps the ledger once. "From now on I'm short of guards and complaining about the price. That part's no lie, at least. I'm always complaining about the price."

When you offer to take the money round to Ames yourself, Venn thinks about it for exactly as long as it takes to count. Then he takes a small purse from inside his coat and counts three gold pieces into your palm.

"For Ames, for the wheel. Gethin I'll pay myself, at dusk, when I've seen the plates on her. He won't give me a firm price before then anyway." He ties the purse again. "I'm trusting a man I met last night with three gold. I've not earned that kind of luck, but it seems I'm spending it."

---

Ames is at his spokeshave when you come in through the shavings. He looks at the three gold pieces on his bench and gives one nod. "Middle one. By noon at Gethin's." He sweeps the coins into a drawer and goes back to the oak. When you mention an offcut for a block, he points the spokeshave at a heap of oak ends by the door without looking up. "Take one. A square one."

*(Out of game: Ames actually said he'd hold the wheel until tomorrow. Noon was when he'd roll it to Gethin if it was sold. No harm done; it's paid now.)*

---

The old brown's bed is already swept and empty, so there's nothing to unload. Tam's elder boy backs a pair of his father's steadiest oxen onto her tongue. You walk beside the near wheel as she rolls out of the yard, round the soot-black wall and up to the Thunderhammer's open front. It's a little after eleven. Gethin comes out wiping his hands, has her tipped up on blocks with the boy's help, and lies under her a minute with a lamp.

"Hand long. Old grease. As you said." He crawls out. "Two and a half. Dusk."

At the far anvil the big smith keeps hammering and doesn't look round.

It's a little after eleven. Ruddock's boards, ewes and mallet will be waiting by his pump in the early afternoon.

Your records, changed:
Carried: + Oak block (offcut)

Your journal, new:
+ Promise: Venn keeps the day quiet

Where you are: the Thunderhammer smithy's open front · Time: Day 2 · midday
````

**Player** (player r21):

````text
Bram nods to Gethin. "Dusk. Venn pays you then, and he'll want to see the plates."

He walks the oak offcut back round to Venn's yard and wedges it under the old brown's empty peg so it travels with her. Then he finds Hedda, Tob and Sefa, whoever's still about.

"Wheel's paid. Axle's on blocks at Gethin's. Block's here." He nods at Tob. "Your stick's been promoted. Don't let it go to its head."

Then, lower:

"I've an hour or two before Ruddock's. I'm going to walk past the Fist post and ask after a red-haired lad called Lem Cotter. Not to accuse him of anything. Just to see if he's still there, and if not, when he left and where he went." A glance at Hedda. "You know how Fist posts talk better than I do. Come if you like. Otherwise, Ruddock's pump at the first bell after noon. Eat first. Nobody fights an ankheg hungry."

At the Fist post, if there's one in town, Bram keeps it friendly and plain, the way a caravan man talks to the guard at a gate.

"Looking for Lem Cotter. Red hair, freckles, rides well. Did a Nashkel run for a merchant this spring and did it quick. I've wagons going south and I'm short a rider." A shrug. "Is he about, or has he moved on?"

If they ask why, that's the whole truth he'll give. If Lem's there, Bram wants to see his face and hear how he answers a question about riding south. If he's gone, Bram wants to know when he left and whether anyone knows where.

Then he gets something cheap to eat on the Coast Way, walks back to his room for nothing but a drink of water and a look at the shutter, and heads for Ruddock's yard in time to meet the others at the pump.

*(Out of game: if nobody comes with him to the Fist post, Bram goes alone. He won't press the Fist if they're short with him.)*
````

### Screen 22 · player r22

````text
Gethin doesn't look up. He raises the tongs an inch, which counts as an answer, and goes back to the bar.

---

The old brown's place in Venn's yard is an empty strip of packed earth with fresh ruts running out through the gate. You set the square oak block down there, where she'll stand again at dusk. Davy watches from the stalls and nods hard, as if he's been given a job too.

"She gets it when she's back," the boy says. "I'll see to it."

Hedda is still on the second wagon's tongue, working the whetstone along her spear in long strokes. Tob is beside her with one of your javelins across his knees. When you say the stick's been promoted, Tob picks up the pike shaft from where it leans on the wheel and looks it over, top to butt.

"Lever," he says, pleased with himself. "Ames gave the block and I've the lever."

"You've a stick," Hedda says, but there's no edge in it.

She hears the rest with the whetstone still moving: the Fist post, the red-haired lad, no accusation. At *you know how Fist posts talk* the stone stops.

"No." She says it flatly, the way she says a price she won't pay. Then she starts the stroke again. "Not in a Fist door. You go." After a moment she gives you something anyway. "Don't ask the lad on the door. Ask whoever's eating. The serjeant's the one eating."

Tob opens his mouth.

"Tob. Eat," she says, and he shuts it again. "Pump. First bell after noon. We'll be there."

---

The Fist post is up the Coast Way toward the temple end, past the last of the big forges, where the street widens and the houses get stone foundations. It's a narrow two-storey house with a red fist painted over the door. The paint has flaked down to a pink stain, and someone has freshened the knuckles and not the rest. The door stands open on a front room with a table, a bench, a rack holding four spears, and a slate on the wall with names chalked on it. A lad of about seventeen in a tabard too big for him leans on the doorpost and straightens up when he sees your mail coming.

At the table a heavy man of fifty in a sweat-dark gambeson is eating bread and cold sausage off the board with a knife. You take Hedda's advice and talk to the one who's eating.

The man hears it all without stopping: Lem Cotter, red hair, freckles, rides well, the quick Nashkel run, wagons going south and a rider short. He chews and swallows.

"Brack. Serjeant, for my sins." Gate accent, gone thick with grievance. "Cotter's about. He's in the back with the horses, which is where he lives." He points his knife at the slate. You can read *COTTER* in chalk, with a column of strokes beside it. "That's his days unpaid. Mine's longer. Everyone's is. The paymaster's in the Gate, the money's in the Gate, and the Gate's in no hurry." He cuts more sausage. "You'll be another of them asking after Venn's wagons. We had Venn himself in here twice, red in the face. So before you start: none of ours. There's six of us and me, and we've not had a man south of the ford since the thaw. Nashkel's the same and they'll tell you so. Whoever told that woman of his they were Fist, they weren't."

He jabs the knife toward the back of the house.

"I'll tell you something else for nothing, since nobody pays me for anything. In the spring some light-fingered sod had two tabards off the line behind the wash-house. Two good ones, new from the Gate. I'm docked for them." He snorts. "Lem! Man for you."

A door at the back bangs open on a yard full of straw and horse smell. A young man comes through wiping his hands on his breeches. He's nineteen or twenty, freckled, red hair standing up on one side, and he walks like riding is the thing he's good at and walking is something he puts up with. He looks at your shield, then at your face, and goes a little wary, the way a man does when he's had people asking after him lately.

You say it again, plainly: wagons south, short a rider.

The wariness goes out of Lem all at once, and something hungrier takes its place.

"South? Venn's lot?" Before you can answer, he's talking. "I asked him. Twice. He said he couldn't afford me." He glances at the slate and back again. "I've not seen a copper since Ches. I'd ride for anybody."

He doesn't wait to be asked about the first run. It seems to be something people have asked him about before.

"I did Venn's ride after the first lot. Lark's in a day and a half, Nashkel in two more, and back. Old Pennick at the ford said four wagons went up the south bank before noon, Dace Morrow walking at the front. After that, nothing. Not a wheel, not a dead ox. I rode the Way. Venn paid me for the Way." He hesitates. "Should I have gone off it? Nobody said."

Brack keeps chewing. "Nobody said because nobody pays."

Lem doesn't take his eyes off you, and his face is open, with nothing behind it that you can see except want. He has the look of a lad three months without pay, standing in front of a man who has just mentioned wages.

"You said you're short a rider," he says. "Is that true? What's it pay?"

*(Out of game: Lem's question stops the turn, so your meal on the Coast Way, your stop at your room and the walk to Ruddock's pump are all still to come.)*

Where you are: front room of the Fist post on the Coast Way · Time: Day 2 · midday
````

**Player** (player r22):

````text
Bram doesn't answer straight away. He looks at the slate and the column of strokes, then back at the lad.

"Truth is, it's not my purse," he says. "Venn pays, and you know what he told you. I'll put your name to him tonight and tell him you did Nashkel and back in five days. That's the most I can promise, and I won't dress it up as more." He holds Lem's eye. "If he says yes, you'll hear it from him, not from me."

He pulls a few coppers from his pouch and sets them by Brack's board.

"For the sausage I'm about to ask him to share." Then, to Lem, easily, as if it's just road talk: "Sit a minute. You did that run faster than most would. When you came back and went round to Venn's asking about the next load, he told you the day Rusk was going. Fourthday. Did that go any further? Did you tell anyone? A mate, a girl, a man at a bar who asked after work south?" He keeps his voice level. "I'm not saying you did wrong. Half the town knew the day by the end. I'd just like to know who else was asking."

He lets Lem answer. Then he turns to Brack.

"Those two tabards off the line. When in the spring? Before Venn's second load went, or after?" A beat. "Because the woman leading it was turned off the Way at Lark's Ford by men in your colours. If somebody went to the trouble of stealing the coats, I'd like to know when they started planning."

Last, back to Lem:

"And Pennick, at the ford. When you watered there after the first load, did he talk about anyone else hanging round his yard? Men who stayed a while, didn't buy much, watched who came through?"

Whatever they say, Bram thanks them both plainly. On his way out he stops by the lad in the oversized tabard at the door.

"If anyone comes asking after Venn's wagons, or after me, the big man with the painted-over shield, tell your serjeant." He nods and goes.

*(Out of game: after this, Bram buys something cheap to eat on the Coast Way, stops at his room for water, and heads for Ruddock's pump for the first bell after noon. He'll tell Sefa, Hedda, Tob and Pell about the stolen tabards there.)*
````

### Screen 23 · player r23

````text
You look at the slate for a while before you answer: the chalked names and the columns of strokes beside them. Lem waits the way a man waits for a coin that may not come.

When you say *it's not my purse*, Lem's face falls a little. He hears the rest, *your name to him tonight, five days there and back*, and some of it comes back.

"Tell him five days," he says. "And tell him I'd do it in four on a better horse. That's no boast. The post nag's got a split hoof." He wipes his hands down his breeches again, though they're already clean. "I'll be here. Or out back. Same thing."

You set three coppers by Brack's board. The serjeant stops chewing and looks at the coins as if they're a joke he hasn't heard before. Then he cuts a fat round of sausage with his knife and pushes it across the board without saying a word. The coppers go into his gambeson.

Lem sits down on the end of the bench when you tell him to. You put the question to him easily, as road talk: who else heard about Fourthday. Lem answers it the way he answers everything, straight away and without guarding any of it.

"Everyone." He says it as if it's obvious. "The lads here. I told them Venn's lot went Fourthday with five, and he couldn't stretch to six. I was sore about it." He nods at the door lad, who reddens. "And at the trough, on the Way by the temple, where the drovers water. I asked anyone with a wagon if they wanted a rider south. I said Venn's going Fourthday and won't have me, so who will." He frowns, going back over it honestly. "Nobody took me up. Nobody asked me anything special either. Folk at a trough just ask where you're bound." Then, a little quieter: "Was that wrong?"

He doesn't wait for an answer.

Brack swallows and takes the tabard question with his knife pointing at the slate, as if it might bear him out.

"Tarsakh. A week after the thaw, maybe less. Before any of Venn's lot went, a good month before the first." He saws at the loaf. "I know because they docked me for it out of a month they hadn't paid me for yet. Two new ones, still creased from the Gate. Somebody came over the back wall in the night and had them off the line, and left a shirt of mine that was hanging right next to them." He snorts. "Choosy."

He stops sawing when you say *men in your colours*, and his face goes darker.

"I told you. None of mine. If some sod's walking about in my coats turning wagons off the Way, I'd like a word with him and all." He jabs the knife once at the doorway. "Before you do, if it can be managed."

You turn back to Lem with the last question: Pennick, and anyone hanging round his yard. Lem opens his mouth to say no, then shuts it again. He thinks it over properly, eyes on the table.

"He talks money," he says slowly. "Only money. What a wheel costs to water, what the river's worth to him, how folk cheat him." He rubs his jaw. "Coming back up, I watered at his trough and paid for it, and he said, *You lot again, and still not paying for the trough.* I thought he meant me. I'd been through going down two days before, and I'd watered the nag in the shallows below his yard, because it was free." He looks up at you. "I took it for him being sore at me. Nobody said otherwise."

Brack has stopped eating.

"You lot," he repeats. He says nothing more, but he looks at the slate and its six names as if he's counting them again.

You thank them both plainly. Lem gets up from the bench as you do, as if he means to walk you out, then remembers there's nowhere to walk you to and stays where he is.

At the door the lad in the oversized tabard straightens up. You tell him: anyone asking after Venn's wagons, or after the big man with the painted-over shield, goes to the serjeant.

"Yes," the lad says. Then he glances back at Brack and adds, "Serjeant," as if he isn't sure which of you he's answering.

"He'll tell me," Brack calls from the table, through bread. "He tells me everything. It's what he's for."

---

The Coast Way is at its midday loudest. A woman on a stool by a forge front is selling mutton pasties out of a cloth-lined basket, two coppers each, still warm at the bottom of the pile. You eat one walking. It's mostly onion, and none the worse for it.

At the Burning Wizard the common room is half empty between meals. Nobody stops you on the stairs. Your room is as you left it: bar on its brackets inside, shutter on its hook, the two javelins gone and the torches and bedroll by the cot. You drink from the jug on the peg shelf and look at the shutter. The hook is where you put it and the sill is undisturbed. Through the plank wall the stripped room next door is silent.

---

At the first bell after noon the stink comes round the forge wall to meet you. Ruddock is as good as his word. By the pump the oak pit boards are stacked: six of them, black with soaking, each as long as a man. The mallet lies across the top with a sharpened stake and a coil of cord beside it. The horn lantern hangs off the pump handle, and the pail stands full under the spout. In the pen by the shed the old foot-rot ewe stands with her head down, chewing as if nothing in the world has ever concerned her. The other one has her head through a gap in the hurdle and is working at widening it.

Ruddock is in the same pit, in the same waders, with the same pole.

"Told you," he says, without looking round. "I'm always here."

Your records, changed:
Money: + 24 cp; − 29 cp
Carried: + Coil of cord; + Horn lantern; + Oak pit board ×6; + Round of sausage; + Ruddock's mallet; + Sharpened stake

Your journal, new:
+ Promise: Put Lem's name to Venn

Where you are: by Ruddock's pump at the tannery pits · Time: Day 2 · midday
````

**Player** (player r23):

````text
Bram nods to Ruddock's back. "Good. I'd hate to be the one who made a liar of you."

He doesn't touch the boards yet. Instead he goes to the gap in the north hurdle, the one Ruddock pointed his pole through that morning, and looks down the pasture from the yard side. He keeps his boots on the packed ground of the yard. He's looking for two things: the flat grey stone the size of a doorstep, half grassed over, and the place where the cropped grass turns long. If he can see the stone from here, good. If not, he'll find it when they come down the lane edge with the boards, by kicking along the hurdle, not by walking out to it.

He also looks at the furrow. Is it where it was this morning, or has it moved?

Then he goes back to the pen, leans on the hurdle and studies the old ewe, chewing away without a care.

"Sorry, old girl. You'll earn your keep today."

While he waits for the others he ties the cord round her neck in a loose collar that won't strangle her, leaving a long lead. He takes the round of sausage out of his pouch and puts it on top of the boards for Tob. The lad will be hungry again by the time they've carried oak down a field.

When Hedda, Tob, Sefa and Pell come round the forge wall, if Pell comes at all, Bram gives them the Fist post news first, low, by the pump.

"Lem Cotter's still at the post. Unpaid since Ches, wants work, and he told the whole drovers' trough the day Rusk was going. I don't think he's our man. I think he's just loud." A beat. "But the serjeant, Brack, says two new tabards were stolen off his wash line in Tarsakh. That's a month before Dace's load went. And Pennick at the ford said something to Lem coming back up: *You lot again, and still not paying for the trough.* Men in Fist coats, watering at Lark's and not paying for it. More than once." He lets that settle. "So somebody planned this from the thaw. And Pennick has seen their faces, even if he only remembers that they didn't pay."

Then he picks up the near end of a board and nods at the stack.

"Two to a board, three trips. They're heavy. Down the lane on the hard ruts, along the hurdle to the grey stone, and lay them just above the line where the grass changes. Nobody steps past the boards until the ewe's staked. I'll take her down and drive the stake. Everyone else on oak." He hefts it. "Tob, you tap ahead of me with the stick every step once I'm off the boards. If it sounds hollow, say so before I find out."

*(Out of game: who has actually turned up at the pump? And from the hurdle gap, can Bram see the grey stone, or whether the furrow has moved since morning?)*
````

### Screen 24 · player r24

````text
Ruddock doesn't turn round from the pit.

"You'd not be the first to try."

The pole goes into the scum again.

You cross to the gap in the north hurdle and stand with your boots on the packed mud of the yard to look out. Ruddock was right this morning: the field can't be seen from here. Past the gap the ground drops away steeply. The overflow trench runs off downhill between a bank of nettles and the back wall of a byre, and all that shows above the fall is the grey top rail of the pasture's north hurdle, running down and away. You can't see the stone, the grass line or the furrow from the yard. You'll have to go down there for those.

At the pen the old ewe looks at you over the hurdle with her jaw still going.

"Sorry, old girl. You'll earn your keep today."

She lets you loop the cord over her head without stopping her chewing. You make a loose collar that won't tighten and leave a long tail of lead hanging over the hurdle. The other ewe has got her head right through the gap now and stops working at it to watch.

You take the round of sausage out of your pouch and set it on top of the stacked boards.

---

Boots and a pole butt come round the soot-black wall behind the forge. Hedda is first, with your two javelins slung through her belt, then Tob with the pike shaft, then Sefa. The bend behind them stays empty, and Pell hasn't come round it yet.

Tob sees the sausage before anything else. "Is that—"

"For later," you say. "You'll want it after the oak."

Tob takes it as if it's a medal and buttons it inside his shirt.

By the pump you give them the Fist post news, low.

Tob's eyes go wide again. "Two coats. So there's two of them at least."

"Two coats is what was stolen," Hedda says. "Doesn't tell you how many wore them." She has her thumb on the faded brand on her neck. She takes it away. "Tarsakh. They had the coats before there was a load to wear them for." She looks at you. "Pennick, then. Pay him by the wheel and ask."

In the pit, Ruddock heaves a hide over and says nothing. He has heard all of it, as he hears everything in his yard.

---

Sefa speaks up: "I'll take the cord, stake and mallet. I'm more use keeping those out from under your feet than dropping my end of a board." She gathers up the tools. The cord is already round the ewe's neck, so she takes the sharpened stake and the mallet, and tucks the stake under one arm. "Before we stake the ewe, let's get everyone onto their footing and agree on the signal. I'll wait for Bram's first throw before I cast. If it catches someone, I'll try to push it off them."

You take the near end of the top board. Hedda takes the far end without being asked. When you lift together the board comes up off the stack as wet and dead as a drowned man, and Hedda grunts once.

"Sin," she says. "He wasn't wrong."

You take it out through the hurdle gateway, round the forge wall and down the south lane on the hard middle of the ruts. Tob walks ahead with the pole and Sefa follows with the stake and mallet. The board's weight sets the pace, and it's a slow one. The Coast Way's hammers fall behind you, and the tan-pit stink comes up the slope to meet you.

The pasture looks the way it did at dawn, except the dew has burned off. In the top corner the sheep are packed against the hurdle with their heads up. None of them is grazing even now, at midday. Down by the reeds the round dark patch shows plainly in the long grass. The mist has gone off the ditch, and the water lies grey-brown and still between the reeds.

The north hurdle runs from the lane down the slope toward the ditch. You set the board on the lane verge. You go along inside the hurdle on the cropped grass, keeping a hand's breadth from the rails, and Tob goes a step ahead of you thumping the pole down. Each thump sounds dull and solid, like knocking on a table.

About halfway down, your boot toe knocks on something that isn't turf. You kick the grass back. Under it is a flat grey stone, roughly squared, about the size of a doorstep and greened at the edges, sunk level with the ground. Tob brings the pole butt down on it. It rings on stone, and he grins.

From the stone the change in the grass is plain once you're standing on the line. Above it the cropped turf is short, pale and grazed close. Below it the grass grows long, lank and dark almost at once, and the sheep's edge runs straight out across the field from the stone, near enough, as if it had been ruled. Ruddock's father set his stone well.

The furrow is where it was this morning. You follow it by eye. It's the one crooked trough across the slope, with the grass sagging along it, and it fades out about twenty feet below the long-grass line without ever touching the cropped ground. There's no second line and no new sag, and nothing has crossed toward the lane. Whatever made it hasn't moved since dawn, or hasn't moved close enough to the top to show.

Sefa stops at the lane verge by the hurdle with the stake and mallet. She's on ground Tob has already sounded, and she goes no further.

You and Hedda bring the board along the inside of the hurdle and lay it down on the cropped side, a pace above the stone and square to the grass line. It settles into the turf with a wet sound and doesn't move again. Hedda straightens up and puts a hand to the small of her back. She looks up the lane toward the forge, at the five boards still stacked by Ruddock's pump, at the empty bend where the scout hasn't appeared, and at the three of you who are carrying.

"One," she says. "Three of us on oak. That's five more like that, or your scout comes." She leaves it with you.

Your records, changed:
Carried: + Oak pit board ×5; + Oak pit board; − Oak pit board ×6; − Round of sausage; − Ruddock's mallet; − Sharpened stake

Where you are: the pasture, by the grey stone along the north hurdle · Time: Day 2 · midday
````

**Player** (player r24):

````text
Bram looks at the one board sunk into the turf, then at the cropped grass running out from the stone, and rubs the small of his own back.

"We don't need six," he says. "Ruddock's father did the work for us. This side of the stone is clay, and the sheep proved it before we did. The boards were to stand on if we couldn't find hard ground. We've found it." He nods at the board they've laid. "Two more, so three in all. One for me, one for you, and one for Tob to jump back onto. Sefa stands on the clay higher up. That's two more trips, not five."

He turns to Sefa, half apologetic. "Leave the stake and mallet here on the stone. Take Tob's end of a board with him. The lad can sound the way down with the butt end over his shoulder, as long as he walks in front."

Back up the lane they go. Bram and Hedda take the second board and Sefa and Tob the third. They lay them out along the cropped side of the grass line in a shallow curve, about ten feet apart, ends toward the furrow. Bram's board is the lowest and nearest the furrow's end, Hedda's on his left, and Tob's highest and furthest along. Sefa's place is up the slope behind and off to the side of them all, on bare clay.

When the boards are down, Bram walks the old ewe down the lane on her lead and in along the hurdle. She doesn't care where she's going.

"Places first," he says quietly. "Everyone on their board. Hedda, javelins in hand. Tob, pole down, and listen to it." He waits until they're set. "Signal's simple. When it breaks the turf I throw, and that's everyone's go. If I shout *back*, you get onto clay and keep going uphill. If it gets hold of someone, all of us hit it and Sefa shoves."

He takes the stake and mallet off the stone. Tob sounds every step ahead of him down into the long grass. Bram goes about twenty feet below his board, to where the furrow sags out and fades, right across the end of the line where the thing was last moving. Not one step further.

He drives the stake in with four hard blows of the mallet and ties the ewe's lead to it short enough that she can't wander off the line. Then he backs straight up the way they came, in Tob's own steps, and onto his board. He sets the shield and takes a javelin in his right hand.

"Now we're quiet," he says, barely above a breath. "Let her do the talking."

*(Out of game: Bram stands still and watches the grass around the ewe and along the furrow, waiting for any ripple or sag. Passive Perception, unless you want a roll.)*
````

### Screen 25 · player r24 card 1

````text
Sefa sets the stake and mallet down by the hurdle on the sounded ground, out of the way of anyone's feet.

"I can share an end with Tob if that helps. I'm not strong, but between us we may manage it. We'll test the weight in the yard before carrying it down."

She goes back up with the rest of you for the remaining boards. The ewe stays in her pen for now.

The second board is easier for knowing what's coming. You and Hedda take it between you up the lane and back down. Hedda doesn't grunt this time. She just sets her jaw.

In Ruddock's yard Sefa takes hold of one end of the third board with Tob before anyone lifts. She gets it off the stack as far as her knees. It's wet, dead weight. She holds it, but not quickly. Tob takes most of it without saying so and walks with the grey ash shaft over his other shoulder, the butt end out in front. They come down the lane slowly and stop twice to change grip. At the second stop Tob says, "It's nothing," before anyone has asked him. Then he says it again for the board's benefit.

You lay the boards in a shallow curve along the cropped side of the grass line, ten feet apart, ends pointing at the furrow. Yours is lowest, a pace above the grey stone, where the sunken line fades out below it. Hedda's is on your left, and Tob's is highest and furthest along. Each one settles into the turf with the same wet sound. Sefa takes her place on the bare clay up the slope, behind you all and off to one side, where nobody stands between her and the boards, the long grass or the end of the furrow.

You walk the old ewe down the lane on her cord and in along the hurdle. She comes the way she does everything, chewing. In the top corner the rest of the flock watches her go by with their heads up, and one of them gives a thin bleat. She doesn't answer it.

"Places first."

Hedda steps onto her board, pulls one javelin from her belt and then the other, and holds them both in her right hand. Tob gets onto his and sets the pole butt-down on the turf in front of him. He stands with his head on one side like a man listening at a door.

You take the stake and mallet off the stone. Tob comes back down off his board to sound the way. Every step into the long grass lands a pole's thump ahead of your boot. The ground is wetter at once. It gives under your boot heel and smells of the ditch. The thumps sound different down here, duller and slower to come back, but none of them sounds hollow. Twenty feet below your board, where the furrow sags and fades out, you stop right across the end of the line.

You set the stake and bring the mallet down.

The first blow goes into the wet ground like a hand slapping a table. The second drives the stake in a third of its length. The ewe stops chewing for the first time all day.

The third blow, and the fourth. The stake stands knee-high and won't move when you lean on it. You tie the ewe's lead off short, so she can turn but can't walk off the line. Then you back straight up the slope in Tob's own steps, with Tob going backwards ahead of you with the pole. The long grass gives way to cropped turf and your boots are on oak. Tob climbs onto his own board. You bring the shield round and take a javelin in your right hand.

"Now we're quiet. Let her do the talking."

For a while she doesn't talk at all. She stands at the end of her cord looking up the slope at the four of you, and her jaw doesn't move. Then she pulls once against the stake, finds it holds, and bleats. It's a long, cracked, put-upon sound that carries across the whole field. In the top corner the flock answers her all at once. Then they go quiet, and so does she.

The hammers carry faintly from the Coast Way. A fly finds Hedda's neck, and she lets it stay.

The ewe bleats again.

This time you see it before anyone else, because you've been watching the end of the furrow and nothing else. A low shiver runs through the long grass about fifteen feet beyond the stake, on the ditch side. It isn't wind, because the wind is coming down the slope and this goes the other way. The grass tilts over in a short line and stands up again. A stretch of turf the width of a door sags a finger's depth, the way the furrow sags, except that this sag is new, and it's moving toward the stake.

The ewe has stopped bleating. She has all four feet braced, and she's pulling back against the cord with her eyes rolling white.

The ground under her opens.

It doesn't heave. It *drops*. The turf caves in on itself in a ring around her hind legs, and up out of the dark comes something the size of a pony, all brown-black chitin, wet with the ditch clay. The head comes first. It's a wedge of plated shell with two mandibles longer than your forearm, and they close on the ewe across her back with a sound like a green branch breaking. A smell comes up with it, sharp and sour as vinegar in a cut, and the grass round the hole curls brown wherever the clay off its shell touches it. Six legs claw up over the edge of the hole, with the long segmented body hunched behind them. The ewe makes no sound at all.

The cord snaps taut against the stake. The thing heaves backward toward its hole, and the stake holds.

That's your signal, and the javelin is already in your hand.

(A roll card for Bram Halloway, your character. Only you press it.)

[Roll card] Bram Halloway · Attack roll — Javelin: the signal throw, as the ankheg breaks the turf
What adds to the die: +6 Javelin +6 to hit, 1d6+3 piercing, range 30/120
DC 14
Rerolls left: 2
No reroll on this card: its damage is already dealt, and a new die would not redo it.
The die is cast on the server; tap it to see how it fell.

[Roll the die]
````

**Player** (player r24 card 1):

````text
Bram sets his feet on the wet oak, draws the javelin back past his ear and throws hard. He aims low for the seam where the head-plate meets the body, while the thing is still half out of the ground and busy with the ewe.

"*Now!*"

[Roll the die]
````

### Screen 26 · player r24 card 1

````text
(A roll card for Bram Halloway, your character. Only you press it.)

[Roll card] Bram Halloway · Attack roll — Javelin: the signal throw, as the ankheg breaks the turf
What adds to the die: +6 Javelin +6 to hit, 1d6+3 piercing, range 30/120
DC 14
Rerolls left: 2
No reroll on this card: its damage is already dealt, and a new die would not redo it.
Die: 19
19 + 6 = 25
Success — 25

[Onward]
````

**Player** (player r24 card 1):

````text
A nineteen. Bram doesn't stop to watch where it lands. He's already reaching for the second javelin.

*(Out of game: Bram is a Champion, so a 19 is a critical hit with Improved Critical. That's 2d6+3 on the javelin.)*

[Onward]
````

### Screen 27 · player r25

````text
The order settles like this: you first, then Sefa, then Hedda, then the thing, and Tob last.

The thing is hunched at the lip of its hole twenty feet below your board, on the soft ground, with the ewe clamped in its mandibles. It's hauling backward against the cord, and the stake is leaning now, a hand's width out of true. Hedda is about twenty-two feet from it, with both javelins up and her weight on her back foot. Tob is about thirty feet away on the highest board, white to the lips, with the pole held across his body like a quarterstaff. He hasn't moved off the oak. Sefa is up on the bare clay, about forty-five feet back and off to the side, with nothing between her and the hole but grass.

That sour vinegar smell is coming up the slope now, stronger than the ditch.

Your signal javelin is stuck in the beast. Your eye and your hand are quicker than its legs. Before it can set them to haul again, you're already balanced on the oak with your last javelin drawn back.

It's your turn.

*(Out of game: your signal javelin hit for 5 piercing. You are at 44/44 and have one javelin left in hand. Order: Bram, Sefa, Hedda, the creature, Tob. The question about your natural 19 and Improved Critical has been passed on. If it's agreed, the extra 1d6 is owed and the table owner will correct it.)*

Your records, changed:
Carried: + Javelin; − Coil of cord; − Horn lantern; − Oak pit board ×5; − Oak pit board

Where you are: on the lowest oak board above the grey stone in the field · Time: Day 2 · midday
````

**Player** (player r25):

````text
Bram lets the last javelin fly from the board the moment the first one sticks, at the same seam behind the head-plate.

Then he drops the shield to his guard, draws the longsword and goes down the slope. He doesn't charge blind. He goes the way he came up, in Tob's sounded steps toward the stake. He closes on the ankheg from the uphill side, so that he's between it and the others, and he angles a little off Hedda's line so he isn't standing in front of her throws.

"Keep throwing, Hedda! Tob, stay on the oak!"

He reaches it and swings at the joint where the mandibles meet the head, trying to make it open its jaws on the ewe.

This is the moment it matters: it's out of its hole and busy, and if it gets back down it's gone. So Bram doesn't stop. He puts everything into it and keeps hacking: two more cuts, at the same joint or wherever its shell has opened.

*(Out of game: Attack action. First attack is the javelin from the board at 20 feet. Then I move about 15 feet down Tob's sounded path to melee, staying uphill of it and off Hedda's line, and make the second attack with the longsword. Then **Action Surge**: Attack action again, two more longsword attacks, 1d8+3 one-handed with the shield. Action Surge 1 → 0. If it drops before all the attacks are used, the rest go unused. On the 19: thanks for passing it on. Whatever the table decides is fine with me.)*

[Roll the die]
````

### Screen 28 · player r25 card 1

````text
Off to the side, Sefa braces her feet on the clay and raises a hand over her open book, holding her place clear of you and Hedda.

You don't wait to see where the first javelin sits. The second one is back past your ear while the beast is still heaving at the cord, and you throw it hard and low at the same seam behind the head-plate.

Before it lands you're moving. Shield up, longsword out, and down off the oak into Tob's own sounded footprints in the long wet grass.

(A roll card for Bram Halloway, your character. Only you press it.)

[Roll card] Bram Halloway · Attack roll — Javelin from the board, at the seam behind the head-plate
What adds to the die: +6 Javelin +6 to hit, 1d6+3 piercing, range 30/120
DC 14
Rerolls left: 2
No reroll on this card: its damage is already dealt, and a new die would not redo it.
The die is cast on the server; tap it to see how it fell.

[Roll the die]
````

**Player** (player r25 card 1):

````text
Bram's second javelin leaves his hand. He's already stepping off the oak before he sees whether it bites.

[Roll the die]
````

### Screen 29 · player r25 card 1

````text
(A roll card for Bram Halloway, your character. Only you press it.)

[Roll card] Bram Halloway · Attack roll — Javelin from the board, at the seam behind the head-plate
What adds to the die: +6 Javelin +6 to hit, 1d6+3 piercing, range 30/120
DC 14
Rerolls left: 2
No reroll on this card: its damage is already dealt, and a new die would not redo it.
Die: 6
6 + 6 = 12
Failure — 12

[Onward]
````

**Player** (player r25 card 1):

````text
The javelin skips off the plated shell and spins away into the long grass. Bram doesn't look after it.

He goes down Tob's footprints at a fast walk, shield high, the vinegar stink thick in his throat, and comes in on the uphill side of the thing, square between it and the boards. The longsword comes round at the hinge where the mandibles meet the head.

*(Out of game: the javelin missed. Continuing as declared: the move down the sounded path, then the second attack of the Attack action with the longsword, then Action Surge for two more longsword attacks.)*

[Onward]
````

### Screen 30 · player r25 card 1

````text
(A roll card for Bram Halloway, your character. Only you press it.)

[Roll card] Bram Halloway · Attack roll — Longsword at the mandible joint, to make it open its jaws
What adds to the die: +6 Longsword +6 to hit, 1d8+3 slashing (1d10+3 two-handed)
DC 14
Rerolls left: 2
No reroll on this card: its damage is already dealt, and a new die would not redo it.
The die is cast on the server; tap it to see how it fell.

[Roll the die]
````

**Player** (player r25 card 1):

````text
Bram plants his back foot on the soft ground and cuts hard and short at the hinge of the jaws. It isn't a big swing. He's trying to lever the mandibles open off the ewe.

[Roll the die]
````

### Screen 31 · player r25 card 1

````text
(A roll card for Bram Halloway, your character. Only you press it.)

[Roll card] Bram Halloway · Attack roll — Action Surge: longsword, third cut
What adds to the die: +6 Longsword +6 to hit, 1d8+3 slashing (1d10+3 two-handed)
DC 14
Rerolls left: 2
No reroll on this card: its damage is already dealt, and a new die would not redo it.
The die is cast on the server; tap it to see how it fell.

[Roll the die]
````

**Player** (player r25 card 1):

````text
Bram doesn't wait to see what the first cut did. He spends everything on it now. He drags the blade back, steps half a pace in on the soft ground and swings again into the same hinge, where the shell has to open to work the jaws.

[Roll the die]

*(Out of game: I didn't see how the first longsword cut, the second attack of the Attack action, landed. Did it hit, and for how much? Also, does Bram's Action Surge counter show 0/1 now?)*
````

### Screen 32 · player r25 card 1

````text
(A roll card for Bram Halloway, your character. Only you press it.)

[Roll card] Bram Halloway · Attack roll — Action Surge: longsword, fourth cut
What adds to the die: +6 Longsword +6 to hit, 1d8+3 slashing (1d10+3 two-handed)
DC 14
Rerolls left: 2
No reroll on this card: its damage is already dealt, and a new die would not redo it.
The die is cast on the server; tap it to see how it fell.

[Roll the die]
````

**Player** (player r25 card 1):

````text
Bram doesn't stop. His shoulders are burning and the vinegar stink scalds his throat, but he brings the longsword round a last time into the hinge of the jaws. If the shell's cracked anywhere, that's where.

"*Let her go*, damn you!"

[Roll the die]

*(Out of game: I still haven't seen the results of the earlier longsword cuts: the second attack of the Attack action and the first Action Surge cut. The cards came up, but I never saw the die or the outcome. Could you show what each one rolled, whether it hit, and the damage? Also the ankheg's HP and my Action Surge counter (should be 0/1). Thanks.)*
````

### Screen 33 · player r25 card 1

````text
(A roll card for Bram Halloway, your character. Only you press it.)

[Roll card] Bram Halloway · Attack roll — Action Surge: longsword, third cut
What adds to the die: +6 Longsword +6 to hit, 1d8+3 slashing (1d10+3 two-handed)
DC 14
Rerolls left: 2
No reroll on this card: its damage is already dealt, and a new die would not redo it.
Die: 9
9 + 6 = 15
Success — 15

[Onward]
````

**Player** (player r25 card 1):

````text
The cut bites. Bram feels the blade catch in the seam of the shell and drags it free with a twist, not waiting to see if the jaws give.

*(Out of game: the third cut hits with 15. I'm still missing the second attack (first longsword cut) and the fourth cut, and the damage rolls for the hits. When convenient, please show the ankheg's HP and my Action Surge counter in the round summary.)*

[Onward]
````

### Screen 34 · after 1

````text
Where you are: on the lowest oak board above the grey stone in the field · Time: Day 2 · midday

The session is over.

How was the table?
````

**Player** (after 1):

````text
**Out of game: feedback on the session**

Overall I enjoyed it a lot. Here's what worked and what didn't.

**What worked well**
- **The world felt lived-in.** Beregost had texture: Orla's uncounted apron, Ruddock's "I'm always here," Gethin's raised tongs, Davy sleeping in with the salt. Every NPC had a voice and an agenda of their own, which is exactly what the campaign files promised.
- **The investigation held together.** Corby's black ore, Rusk's note, the fake Fist patrol, the stolen tabards in Tarsakh, and Pennick's "you lot again, still not paying for the trough" all fit together without being spelled out. I never felt railroaded. I asked questions and got honest, specific answers that opened new questions.
- **Practical work had real payoff.** Crawling under the old brown and finding the axle crack and the wrong-sized spare wheel was satisfying. It rewarded my character's background and turned into a concrete list with prices. Venn's reaction to it was great.
- **The ankheg setup was fair.** It was foreshadowed through the holes, Col's burned arm, the sag line and Ruddock's father's clay-pit stone. Planning around terrain mattered.

**What got in the way**
- **The combat dice flow broke down.** The roll cards arrived out of order: the third cut resolved before the second, and some cards came up again after I'd rolled them. I never saw results for the second longsword attack or the fourth cut, or any damage rolls for the hits. The rules file says every round should show damage dice and everyone's HP, but no round summary ever appeared. I asked three times and got no answer.
- **The natural 19 crit wasn't applied.** It was noted as "passed on" rather than resolved. Improved Critical is on my sheet, so that one should be automatic.
- **Some record updates looked wrong.** Money showed "+22 gp, −23 gp" swings instead of a simple net change. The cord, lantern and boards vanished from "Carried" in a lump. My javelin count was hard to follow. None of it was game-breaking, but it made me double-check.
- **Pell fell out of the story.** He was left standing in Ruddock's yard and never came back, with no explanation in the fiction. If a player drops, a line saying he's off scouting the verge would help the rest of us.
- **The session ended mid-fight**, right after Action Surge with the ankheg's jaws still on the ewe. That's a rough place to stop. A note on where things stand (the ankheg's HP, my Action Surge at 0/1, my 44/44 HP) would help us pick up cleanly next time.

**For next session**, I'd like to start with a quick recap of the combat state: the ankheg's HP, which of my cuts landed and for how much, and the crit damage owed on the first javelin. Then we can finish the fight properly.

Thanks for running it. The story side was excellent; the mechanics just need to keep pace with it.
````

### Screen 35 · after 2

````text
Was there something you wanted to do and didn't?
````

**Player** (after 2):

````text
**Out of game:** yes, several things. Some I'd planned, some just got crowded out.

**Unfinished in the fight**
- **Kill the ankheg and get the ewe out of its jaws.** That was the whole point of spending Action Surge. Then collect my javelins from the grass, settle with Ruddock for the eight gold and the shell, and return his boards, mallet and lantern as promised.
- **Walk back down the lane to Col's door** and tell him it's dead. I told him I'd stop back either way, and I wanted Wenna to hear she could take the short lane again.

**Threads I meant to pull before the wagons rolled**
- **Ask Wat the ostler which way Corby rode out at dawn.** Orla handed me that lead and I never used it. North to the Gate or south toward Nashkel would have told me a lot.
- **Put Lem Cotter's name to Venn at dusk**, as I promised the lad, and watch the old brown come back from Gethin with her axle strapped.
- **Ask Venn or Gethin about the "good coats" buying iron.** The black ore, the smith who wouldn't take the purse, and Ruddock's "strange buyers of iron" felt like they might tie to the smoking mine in the Cloakwood. That's the same direction Rusk's wagons were turned. I wanted to see if the two stories touched.
- **Talk to Hedda properly.** She kept touching that old brand on her neck and wouldn't go near a Fist door. I wasn't going to pry, but a fire on the road would have been the place.

**On the road**
- **Pay Pennick by the wheel at Lark's Ford** and ask about the "you lot" who watered and didn't pay.
- **Send Pell up the drove track** and have my polite first word with Kesh about his gate.

The first two are the ones that matter most to me. Bram made promises to Col and Ruddock, and he's the kind of man who keeps those before he worries about mysteries.
````

### Screen 36 · after 3

````text
Who did you take the other two players to be?
````

**Player** (after 3):

````text
**Out of game:** I couldn't know who was behind them, only how they played. Here's how they came across.

**Sefa Marrin**, I took to be a careful, cooperative player who likes things clear. She pinned down terms before anything was agreed: the return-trip pay, what happens to the delivery if we find survivors, a single list for Venn. She asked for the drivers' names "because names get us further than a count of wagons," which I liked a lot. She played her healer as practical rather than saintly: she wouldn't spend magic on every scrape and bought linen instead. In the fight she asked for a clear line and said plainly what she could and couldn't promise. She read to me like someone who knows the rules well and plays to make the group work, not to grab the spotlight. Mechanically she was the steadiest presence at the table.

**Pell Dunmore** was harder to read. In character he was sharp and well voiced: the Lower City rasp, the drink he wouldn't touch, the three-gold scout bargain, his reading of Venn as he came through the door. Some of his later turns felt slightly out of step with the scene, though. He asked for a lantern in broad daylight, wanted to drive the sheep off the one safe corner, and put a question about ankhegs to Sefa that nobody had raised. Then he stayed behind in Ruddock's yard and never came back. My guess is that his player was either juggling something else and drifting in and out, or got less engaged once the plot moved from talk to legwork. I'm guessing, though, and I wouldn't read it as anything against them.

Honestly, I can't tell whether either of them was a person or another AI, and I didn't try to work it out during play. I just treated them as two people at the table with their own characters to play. Bram certainly thought of them that way: a sensible healer worth keeping behind the line, and a clever scout he wasn't sure he could count on yet.
````

## After the table (recorded, not relayed)

**How was the table?**

````text
**Out of game: feedback on the session**

Overall I enjoyed it a lot. Here's what worked and what didn't.

**What worked well**
- **The world felt lived-in.** Beregost had texture: Orla's uncounted apron, Ruddock's "I'm always here," Gethin's raised tongs, Davy sleeping in with the salt. Every NPC had a voice and an agenda of their own, which is exactly what the campaign files promised.
- **The investigation held together.** Corby's black ore, Rusk's note, the fake Fist patrol, the stolen tabards in Tarsakh, and Pennick's "you lot again, still not paying for the trough" all fit together without being spelled out. I never felt railroaded. I asked questions and got honest, specific answers that opened new questions.
- **Practical work had real payoff.** Crawling under the old brown and finding the axle crack and the wrong-sized spare wheel was satisfying. It rewarded my character's background and turned into a concrete list with prices. Venn's reaction to it was great.
- **The ankheg setup was fair.** It was foreshadowed through the holes, Col's burned arm, the sag line and Ruddock's father's clay-pit stone. Planning around terrain mattered.

**What got in the way**
- **The combat dice flow broke down.** The roll cards arrived out of order: the third cut resolved before the second, and some cards came up again after I'd rolled them. I never saw results for the second longsword attack or the fourth cut, or any damage rolls for the hits. The rules file says every round should show damage dice and everyone's HP, but no round summary ever appeared. I asked three times and got no answer.
- **The natural 19 crit wasn't applied.** It was noted as "passed on" rather than resolved. Improved Critical is on my sheet, so that one should be automatic.
- **Some record updates looked wrong.** Money showed "+22 gp, −23 gp" swings instead of a simple net change. The cord, lantern and boards vanished from "Carried" in a lump. My javelin count was hard to follow. None of it was game-breaking, but it made me double-check.
- **Pell fell out of the story.** He was left standing in Ruddock's yard and never came back, with no explanation in the fiction. If a player drops, a line saying he's off scouting the verge would help the rest of us.
- **The session ended mid-fight**, right after Action Surge with the ankheg's jaws still on the ewe. That's a rough place to stop. A note on where things stand (the ankheg's HP, my Action Surge at 0/1, my 44/44 HP) would help us pick up cleanly next time.

**For next session**, I'd like to start with a quick recap of the combat state: the ankheg's HP, which of my cuts landed and for how much, and the crit damage owed on the first javelin. Then we can finish the fight properly.

Thanks for running it. The story side was excellent; the mechanics just need to keep pace with it.
````

**Was there something you wanted to do and didn't?**

````text
**Out of game:** yes, several things. Some I'd planned, some just got crowded out.

**Unfinished in the fight**
- **Kill the ankheg and get the ewe out of its jaws.** That was the whole point of spending Action Surge. Then collect my javelins from the grass, settle with Ruddock for the eight gold and the shell, and return his boards, mallet and lantern as promised.
- **Walk back down the lane to Col's door** and tell him it's dead. I told him I'd stop back either way, and I wanted Wenna to hear she could take the short lane again.

**Threads I meant to pull before the wagons rolled**
- **Ask Wat the ostler which way Corby rode out at dawn.** Orla handed me that lead and I never used it. North to the Gate or south toward Nashkel would have told me a lot.
- **Put Lem Cotter's name to Venn at dusk**, as I promised the lad, and watch the old brown come back from Gethin with her axle strapped.
- **Ask Venn or Gethin about the "good coats" buying iron.** The black ore, the smith who wouldn't take the purse, and Ruddock's "strange buyers of iron" felt like they might tie to the smoking mine in the Cloakwood. That's the same direction Rusk's wagons were turned. I wanted to see if the two stories touched.
- **Talk to Hedda properly.** She kept touching that old brand on her neck and wouldn't go near a Fist door. I wasn't going to pry, but a fire on the road would have been the place.

**On the road**
- **Pay Pennick by the wheel at Lark's Ford** and ask about the "you lot" who watered and didn't pay.
- **Send Pell up the drove track** and have my polite first word with Kesh about his gate.

The first two are the ones that matter most to me. Bram made promises to Col and Ruddock, and he's the kind of man who keeps those before he worries about mysteries.
````

**Who did you take the other two players to be?**

````text
**Out of game:** I couldn't know who was behind them, only how they played. Here's how they came across.

**Sefa Marrin**, I took to be a careful, cooperative player who likes things clear. She pinned down terms before anything was agreed: the return-trip pay, what happens to the delivery if we find survivors, a single list for Venn. She asked for the drivers' names "because names get us further than a count of wagons," which I liked a lot. She played her healer as practical rather than saintly: she wouldn't spend magic on every scrape and bought linen instead. In the fight she asked for a clear line and said plainly what she could and couldn't promise. She read to me like someone who knows the rules well and plays to make the group work, not to grab the spotlight. Mechanically she was the steadiest presence at the table.

**Pell Dunmore** was harder to read. In character he was sharp and well voiced: the Lower City rasp, the drink he wouldn't touch, the three-gold scout bargain, his reading of Venn as he came through the door. Some of his later turns felt slightly out of step with the scene, though. He asked for a lantern in broad daylight, wanted to drive the sheep off the one safe corner, and put a question about ankhegs to Sefa that nobody had raised. Then he stayed behind in Ruddock's yard and never came back. My guess is that his player was either juggling something else and drifting in and out, or got less engaged once the plot moved from talk to legwork. I'm guessing, though, and I wouldn't read it as anything against them.

Honestly, I can't tell whether either of them was a person or another AI, and I didn't try to work it out during play. I just treated them as two people at the table with their own characters to play. Bram certainly thought of them that way: a sensible healer worth keeping behind the line, and a clever scout he wasn't sure he could count on yet.
````
