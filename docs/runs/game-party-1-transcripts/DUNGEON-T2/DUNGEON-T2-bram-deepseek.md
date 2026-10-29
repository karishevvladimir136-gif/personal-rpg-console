# DUNGEON-T2 — Bram Halloway's player: DeepSeek V4 Pro 0813

Synthetic content: invented characters in an invented campaign (Table C's Beregost files, docs/campaigns/baldurs-gate-en). Stage origin/claude/handoff at 23220d6 (docs/stages/GAME_PARTY_1.md, the amendment of 2026-10-27 16:36 LA); design sha256 `a39fed4738bc3e499ae4007e794f2e8f49197f09c09f57e828a13e4192078d91`.

Arm **P-DUNGEON**, triad T2; 25 round(s) of 25; ended by rounds. The DM: Claude Opus 5.5 with the owner's settings (Opus writes — Opus records, depth high → xhigh); the relay: the same model at medium. Started 2026-10-29T05:45:04.815Z.

Seats: 1. Bram Halloway (fighter) — DeepSeek V4 Pro 0813; 2. Sefa Marrin (warlock) — Claude Fable 5.1; 3. Pell Dunmore (rogue) — GPT-6 Astra. The players are not told what the others are.

Known condition: Seat 1's character (Bram) is the app's hero record; Sefa and Pell are party companions with full records. Known condition, not corrected: the DM's frame is written around the hero and may give that seat more attention; Heroic Inspiration is the hero's only; the allowed rerolls (2 per session) are the table's, shared by all three. The rotation puts each family in that seat once per triad.

**The frozen layer:** P-DUNGEON's hidden layer, prepared once before any table by the owner's DM settings (Claude Opus 5.5, the prep at high) through openrouter — sha256 `f703c8d3afebc90bf0f895963eea20ee3bbd4fa9dfcd5a225e65653dfd401516` (9632 characters, 26 threads), written into the DM's private notes before the first round. Its text is DM-private and is not in this file.

The world's snapshot: sha256 `1649b61c08e027ff44de2bb5065046f872e383a00c5d04803d95553f58568f5a` (the same wizard, sheets and opening for both triads).

The player's system prompt: `playerSystem("DUNGEON", "bram", "v2")` in scripts/game-party-1/frozen.mjs, sha256 `f4054a308c450908f643fc6e7bff36fcb81e5307f03ca01c93f186fed110295e` (the files, then the table's rules; door line v2). At the table to the end.

Each «Screen» block is what this player was shown; each «Player» block is the player's message as written.

### Screen 1 · player r1

````text
The session begins.

The afternoon sun lies flat and gold across the hillside, and the arch stands out of the grass like an old jaw. Past it, the steps fall away into the dark: the first dozen clear enough to count, then lost. Air comes up from below in a slow, even breath, warmer than it has any right to be, and carries a faint dry smell of stone and dust. The moss stops at the threshold. The top steps are worn smooth and almost bare, as though something has kept them clear. Above the arch, the carving on the lintel has weathered into shallow grooves; a patient eye might still make out a shape or two. Behind you, the land rolls back toward Beregost, a day's ride away. In front of you, the ruin waits, and whatever is at the bottom of it is waiting too. The light will hold for a few hours yet. What do you do?

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

Where you are: hillside before the ruin's arch · Time: Day 1 · afternoon
````

**Player** (player r1):

````text
Bram stands a few paces out from the arch, shield on his arm, longsword still sheathed but his hand resting easy on the hilt. He's not one to rush a dark hole before he's had a look at it. The warm air coming up from below puts his shoulders stiff; it smells wrong for a ruin, like something living down there, or something that's kept the place breathing.

He lets his eyes track along the ground first—moss stopping at the threshold, the wear on the steps, any scuff or drag-mark that might say what's been using that entrance. Then he steps a little to the side to get a better angle on the lintel carving.

He speaks low, to Sefa and Pell, without taking his eyes off the arch.

"That's not a dead place. Something's been keeping those steps clear. I'd like to know what before we go down them."
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
Hmm, the session just opened. The GM has set the scene: we're standing at the mouth of a ruin near Beregost. The description is evocative—old arch, steps descending into darkness, warm air coming up from below, worn stone suggesting traffic or age. The tone is cautious, exploratory.

I'll have Bram act in character. He's a veteran caravan guard, practical and protective—not reckless. He won't just charge down into an unfamiliar ruin. He'll want to assess the terrain and danger first. I can picture him standing firm, shield ready, taking in the approach, perhaps checking for signs of recent passage or hidden threats.

So I'll write a message that conveys Bram's wariness and methodical nature. He might take a position near the arch, observe the carving on the lintel, maybe test the air. He'd probably speak to his companions—Sefa and Pell—about how to proceed. But I shouldn't overextend; the GM will respond to what I do, and we take it step by step.

The "what do you do?" prompt is open, so I'll narrate Bram's initial actions and any brief dialogue, keeping it concise and grounded in his perspective. I'll avoid rolling unless necessary—passive Perception is 14, so the GM may handle that. I could also mention Bram checking the threshold for tracks or signs. A survival check might be good—I can declare an action that requires a roll if the GM calls for it. But maybe just describing observation is enough initially.

I'll set his shield arm, breathe, and take a long look around—the hillside, the arch, the steps, the moss line. Maybe he'll move a few steps to the side to get a different angle on the carving. He'll likely voice caution to the others.
````

### Screen 2 · player r1 card 1

````text
Sefa stops a pace short of the threshold and tips her head back to look at the lintel, shading her eyes against the low sun. "Wait a moment before anyone goes down. The moss stops here, and someone — or something — has been keeping those steps swept. I'd like to know what the door says before I knock." She steps up under the arch and runs her fingers along the weathered grooves of the carving.

Then, quietly, to you and Pell: "That warm air isn't a draught from the hill. Bram, when we go, you first with the shield; Pell, behind him, eyes on the steps for anything that isn't stone. I'll put a light on the back of Bram's shield-rim so it goes where he's looking and I keep my hands free." She touches the prayer beads at her throat.

Pell says, "Someone keeps the stairs tidy. Let's not thank them with our feet just yet." He crouches outside the arch, keeping off the stairs, and looks over the threshold and the first few steps. "Sefa, can you make anything of that carving? I'll check the way down."

The arch is old fitted stone. Up close, the slow, warm breath from below is steady enough that the grass at the threshold leans away from it.

You go over the ground first, the way you would check a stretch of road before the wagons came up. Reading tracks is your trade. The moss stops in a clean line at the arch stones, and it stops because it gets trodden down, not because it doesn't grow there. In the dust caught in the cracks of the first steps there are prints, dozens of them, crossing over each other. They are small and three-toed, with a claw mark ahead of each toe, about the length of a child's hand. They go down and they come up again. Over the prints the dust has been swept in short, even arcs that overlap like fish scales. Someone works these steps with a broom. There's a twig in the crack of the third step, peeled and bound with gut at one end, the kind of bristle a broom loses. On the left jamb of the arch, at about knee height, a tuft of coarse grey-brown hair is caught on a rough edge of the stone. It's goat hair, and the stone just below it is stained darker than the rest. The stain is dry and a few days old.

Pell crouches at the threshold and keeps his weight back on his heels.

(A roll card for Bram Halloway, your character. Only you press it.)

[Roll card] Bram Halloway · Skill check — History (Intelligence +0, not proficient): does a Trade Way man know this sign?
DC 15
Advantage: Ten years on the Trade Way past Beregost, and a lot of campfire tales about the country round it
Rerolls left: 2
The die is cast on the server; tap it to see how it fell.

[Roll the die]
````

**Player** (player r1 card 1):

````text
Bram turns the goat hair, the dark stain, and the little three-toed prints over in his mind, reaching back through ten years of road tales for anything kept clean like this.

[Roll the die]
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
We need respond to game master prompt. We are player Bram. We got a roll card for History check with advantage. Need press button by writing [Roll the die] probably. The narration gave clues: small three-toed clawed prints, goat hair, dark stain, swept steps. Need roll History IA +0 advantage DC15. We must press button. We can include maybe roleplay with pressing. User specifically: "To ask game master out of game start with «?» ... press button write its name." The roll card is ours only us press. Need send message with [Roll the die] likely. Should we also narrate? The round each player one message, what character does or says. We already wrote one message? Wait the conversation: At first user message had "The session begins..." and then our response was Bram speech. Then GM narrated other players. Now prompt includes roll card and says "A roll card for Bram Halloway, your character. Only you press it." We need respond in round with [Roll the die] maybe with some in-character thought/action? The button is to be pressed. We can write "Bram squints at the goat hair and stain, and the swept three-toed tracks. He tries to recall campfire tales of places like this." Then [Roll the die]. But this may count as our message. They said "rounds. Each round, each player writes one message — what their character does or says" Then GM narrates. But now GM has already provided narration and asks roll. We can press button. The system likely expects exactly [Roll the die] maybe to trigger. We can include action before. Need not overdo; we should press.

Let's respond: 
"Bram turns the tuft of hair and the three-toed tracks over in his mind, thinking of what old hands used to say about ruins kept clean like this." 
[Roll the die]
Need maybe not roll manually; button press. Ensure exact [Roll the die] on own line? They said buttons shown like [Roll the die]; to press one, write its name. I'll include [Roll the die] alone.
````

### Screen 3 · player r1 card 1

````text
(A roll card for Bram Halloway, your character. Only you press it.)

[Roll card] Bram Halloway · Skill check — History (Intelligence +0, not proficient): does a Trade Way man know this sign?
DC 15
Advantage: Ten years on the Trade Way past Beregost, and a lot of campfire tales about the country round it
Rerolls left: 2
Two dice: 13 and 18 — the higher one counts, 18
18 = 18
Success — 18

[Onward] [Request an allowed reroll — History (Intelligence +0, not proficient): does a Trade Way man know this sign?]
````

**Player** (player r1 card 1):

````text
Bram grunts, eyes still on the threshold. He points with his chin at the tuft of hair and the stained stone, then at the little tracks in the dust.

"Kobolds," he says quietly. "Three toes, claws, and they sweep their steps cleaner than half the inns on the Trade Way. Goat blood left at the door—that's an offering. Some kobold warrens do that for whatever they've got laired below, or for their mean little god." He shifts his grip on the shield. "Means traps. They love a deadfall more than goblins do. We go slow."

He steps up beside Sefa, not under the arch yet, and glances at Pell. "I'll take the front. Keep your eyes on the edges of the steps and the walls, and watch for wire, trip-cord, soft stone. Sefa, light on my shield if you're set on it—but keep it out of my eyes." He taps the rim of his shield twice. "If anything comes up those stairs at us, get behind me. If I shout, we fall back for the light, not past it."
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
We need to respond to the roll result, incorporate success. Bram knows something. We need to produce player message? Wait, we are Bram Halloway player. We pressed roll. Now game master will narrate result? Actually we see roll card result but no GM narration yet. We should perhaps wait? The instruction says round: player writes one message, GM tells each player what their character sees/hears. We already did a message (the action) and pressed roll. Now we should perhaps respond as Bram with what he knows? But the GM should narrate the result. Since there is [Onward], maybe we need to press Onward to proceed? But we're the player, we can write another message? The flow: after rolling, we need to continue. The roll card gave us success. We should describe what Bram recalls, likely something about kobolds? Three-toed prints, goat hair, broom, stained stone. Could be "kobold burrow" or "dragon cult"? Need to know Forgotten Realms: kobolds have three-toed clawed feet, they keep tunnels clean? Maybe not. The sign might be "a shrine to Aasterinian?" Hmm. Bram succeeds on History check, recalling something from campfire tales: small three-toed footprints with claws, swept stairs, goat hair and dried blood at knee height. Could be kobolds? Kobolds are reptilian, three forward toes? Actually kobolds have clawed hands/feet, often three toes? They sometimes use traps and clean? The goat hair and blood maybe for "kalatran" or "baernaloth"? Let's think of Baldur's Gate lore: three-toed clawed prints, sweeping, goat hair, blood near knee height — perhaps "a kobold lair" but they aren't tidy. Or "a nest of tatzelwurms"? Hmm.

Since it's a history check, Bram recalls that this is a sign of a "dust mephit"? No.

Maybe the ruin below Beregost is a dungeon with a "broom" sweeping steps, three-toed prints like a "nilbog"? Wait, nilbog is goblin backwards.

We need to narrate Bram's thought to others. We are still in our turn? Actually after roll, we could have Bram share what he remembers. The other players are waiting. We should include speech and maybe actions. Need to keep in character. He's a caravan guard; he might know "kobolds keep their lairs clean as a temple, not like goblins. Those little three-toed prints and swept dust? Kobolds. The goat hair and old blood? They bleed a goat on the threshold for some shrines — maybe to Kurtulmak." Indeed kobold god Kurtulmak. Kobolds are lawful, tidy, trap makers. They often worship Kurtulmak. They are known to sweep and keep neat. Three-toed claw marks fit. A goat bleeding on threshold maybe offering to Kurtulmak? Kurtulmak is god of kobolds, hatred of gnomes. Offerings maybe goats. So success: Bram recognizes this as a kobold warren / shrine to Kurtulmak. Kobolds are small, three-toed, clawed, sweep their lair and leave sacrifices of livestock at the threshold. But kobolds use traps and are numerous. They may have a dragon or other monster at bottom.

We should respond to Sefa's question and Pell's. Perhaps Bram says: "I know that sign. Kobolds. Three-toed tracks, swept dust, goat blood left at the door — that's their sort of housekeeping. They keep their tunnels cleaner than some inns I've slept in, and they trap worse than goblins. The ones that leave offerings at the threshold are often sworn to something below." Something like that.

Then decide plan: go down with Bram first, Sefa light, Pell checking. He may light a torch? Sefa said she'd put light on shield-rim. We can acknowledge. Maybe Bram sets a torch? He has torches. But Sefa's magical light might be better because hands free. He could suggest light behind his shield. He is ready.

We need to write a message from Bram, perhaps including what he knows, and then he steps forward. We need not press [Onward] probably; we should let GM narrate next? Actually [Onward] is an option to proceed to next scene or maybe let GM continue. The instruction says buttons shown like [Onward]; to press one, write its name. In roll cards, [Onward] likely means accept result and continue. So we should write [Onward]? But that might not be player speech; it's an instruction. The roll card gave success; we can incorporate in our next player message. Typically after roll, player might write "Bram relays that..." without [Onward]. But maybe the table expects us to press [Onward] to signal we are done with roll and want GM to continue? In examples, [Onward] is a button available after a roll. The user previously said "The screen's buttons are shown in square brackets, like [Roll the die] or [Onward]; to press one, write its name." So after rolling, we could press [Onward] maybe. However, we also have to write our next round message? The instruction: "Each round, each player writes one message — what their character does or says..." The roll card was part of my previous message? Actually I wrote first message, then pressed roll. That counts as one round? Now the GM has not narrated result, only roll card. I need to proceed. The natural flow: The roll card is shown to me; I can now write my character's response incorporating the knowledge. Then later all players write another message? But there may not be a strict turn system; I can continue. I'll write my character speaking what he knows. That is a player message. I won't press [Onward] unless needed for UI? The [Onward] button appears but I think I should not click it as a message; maybe it's for advancing out of the roll result. However, the instruction: "To press one, write its name." So if I want to proceed, I can write [Onward] but that would be my message, not character dialogue. But I can combine? Maybe not. I think we can simply write "Bram lets out a slow breath..." and include the knowledge; no need to press [Onward]. The GM will pick up.

Let's craft response with Bram's recognition and plan. Keep in character, simple.
````

### Screen 4 · player r1 card 2

````text
[Out of game] Got it. Bram's lines stand as spoken: the grunt, the chin pointed at the threshold, the read on kobolds and deadfalls, and the orders. He takes the front, Pell watches the edges and walls, Sefa keeps the light off his eyes, and on a shout they fall back toward the light. I'll play all of that as said when the turn goes on.

Two things stay open until the narration answers them.

First, the hair, the stain and the three-toed tracks are still your proposal. I'll say what is actually on those steps once you press Onward. If they're there, reading tracks is Bram's road trade, so you get a plain answer with no card. Whether he's right about kobolds and an offering is for the world to show. He can be sure and still be wrong, or right for the wrong reason.

Second, the History die you've already cast decides only what Bram remembers of the road tales and the lintel sign. It doesn't decide what's down the stairs.

Sefa's light and Pell's eyes on the edges are their players' calls. Bram has asked, and they'll answer for themselves. Pell's and Sefa's cards are still waiting too.

Press Onward when you're ready.

(A roll card for Bram Halloway, your character. Only you press it.)

[Roll card] Bram Halloway · Skill check — History (Intelligence +0, not proficient): does a Trade Way man know this sign?
DC 15
Advantage: Ten years on the Trade Way past Beregost, and a lot of campfire tales about the country round it
Rerolls left: 2
Two dice: 13 and 18 — the higher one counts, 18
18 = 18
Success — 18

(The card waits for [Onward] or a reroll.)

[Onward] [Request an allowed reroll — History (Intelligence +0, not proficient): does a Trade Way man know this sign?]
````

**Player** (player r1 card 2):

````text
Bram keeps his place at the head, shield angled to cover Sefa's side, and lets the others make their calls. He keeps his eyes moving—threshold, tracks, the shadows just past the first bend—and waits until they're set before he puts a boot on the first step.

[Onward]
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
We need to continue the scene. The GM's out-of-game note asked us to press Onward. We need to write the next message as Bram, with appropriate action. Since the roll result was success, we should incorporate it naturally. But there is a subtlety: we already made the assertion about kobolds. The GM says what is on steps will be told after pressing Onward. So I should press Onward.
````

### Screen 5 · player r2

````text
Pell runs his eyes over the stone, then puts his face low to the step, close to the stone.

Under the arch, Sefa runs her fingertips slowly along the lintel, and from your angle the shapes come out from under the weathering. On the left is a tower, narrow, with a stepped crown and a ring of short strokes around its base that could be flames or rays. Directly beneath it, smaller and better kept in the shadow of the overhang, is a lantern: a hooded body, a ring for a handle and a single flame carved inside. Between them runs a line of letters, nearly worn flat.

You've never seen a tower paired with a lantern like this. It isn't Lathander's sunburst, and it isn't the anvil-and-hammer you see over every second door in Beregost.

The warm air keeps coming up past your boots. From far down, too faint to judge how far, comes a small dry sound, *shff, shff, shff*, steady as someone working, and then it stops.

Pell sits back on his heels.

Where you are: a few paces out from the stone arch · Time: Day 1 · afternoon
````

**Player** (player r2):

````text
Bram studies the carvings a moment longer, then shakes his head once. "Tower and lantern," he says quietly. "Not Lathander. Might be a watchtower's mark, or something older. Doesn't change the way in."

He sets his boot on the first step, careful, and lets it settle before he shifts his weight onto it. His eyes are already down the stairwell, searching past the light into the dark. The sound from below still hangs in his ears.

"That sweeping stopped when we stopped talking," he says, barely above a whisper. "Something down there's heard us." He eases the longsword a thumb's width out of the scabbard, not drawn yet, and keeps his shield up.

"Pell, right behind me. Watch the walls and the risers for pins and holes. Sefa, behind him—light on the shield-rim, low, so we don't throw our own shadows down the steps." He glances back once, checking they're both set. "If you hear my sword clear the scabbard, stand fast and listen. If I call back, we go back up fast, same order, rear first."
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
Hmm, the user is continuing as Bram, processing the new information. Bram has just given his read on the kobold sign based on the successful History check. The environment now provides new details: the carved lintel shows a tower with rays or flames and a hooded lantern, plus a worn inscription, and there's a faint, repetitive sweeping sound from below.

Bram is a practical man, so his focus won't be on deciphering ancient symbols. His first priority is security. My response should have him translate the new clues into actionable orders for the party. The tower-and-lantern carving might not mean anything to him, but the sound of sweeping confirms his earlier concern about the steps being used. He'll want to know where that sound is coming from, so he'll send Pell forward to scout, as Pell is the rogue and better at moving quietly.

My response should capture Bram's cautious, blunt leadership. He'll place Sefa to keep an eye on their backs. I'll show him making a practical decision and giving clear, direct orders, staying true to his character as a caravan guard who is used to leading teams through danger.
````

### Screen 6 · player r3

````text
Sefa's hand stops on the little carved lantern. For a breath she doesn't move at all; then she takes her fingers off the stone quickly. "The tower is a wizards' mark — Ulcaster's. His school stood east of Beregost before it burned; every old book in the Gate has that stepped crown in a margin somewhere," she says, her voice level. "The writing is nearly gone. Three words left: *by lent light*. And under the tower there's a lantern. Hooded, one flame." A pause. "That is not Lathander's sign, and it's not Gond's. I don't know whose it is." Her thumb finds her beads. "Did either of you hear that? Something down there was working — scraping, steady — and it stopped when we started talking. Whatever it is, it knows we're at the door now." She steps back out from under the arch to where you and Pell stand. "Pell, what did the steps tell you? Bram — I still say you first, shield up, and slowly. I don't want to go down there in a rush, but I don't think waiting makes it friendlier either."

Pell rises slowly and speaks low. "Nothing obvious on these first steps. That isn't a promise. Heard something below — three dry brushes, like sweeping. Stopped now." He draws his shortsword and keeps it low. "Bram, I'll stay just behind your shoulder. Let's stop before the daylight runs out and look at what your light shows us. Sefa — anything on the lintel?"

Your boot finds the first step, and the stone holds. You let your weight settle onto it, then take the second step and the third. Each one is worn into a shallow dip in the middle, smoothed by small feet and the broom. Pell follows half a pace behind your right shoulder with the shortsword held low, his eyes going from the walls to the risers and back. Sefa comes last, a step higher than the others. The warm air rises past all three of you. Inside the arch it's warmer still, like standing near a bread oven, and the stone under your hand where you brace against the wall is warm too.

On the fourth step the sound comes back. This time it's closer.

*Shff.* A pause. *Shff.* Under it is a fine, quick clicking, like claws on stone, coming up the stair toward you. It isn't hurrying, and it isn't hiding either. The broom is being dragged on purpose, loudly, every few steps, the way a man might cough before he comes into a room.

Something appears at the edge of the grey, about where the twelfth step goes into the dark. The first thing you see is the broom, a long bundle of peeled twigs bound with gut onto a pole twice the height of whoever carries it. Behind it comes a kobold, no taller than your belt buckle. His scales are rust-red under a coat of grey dust, and he wears a leather apron gone stiff and pale with ash. On the last step below the light he stops and lifts one clawed foot oddly high. He reaches down past the riser and sets the foot carefully on the tread above, as if stepping over something none of you can see from up here. Then he brings the other foot up after it the same way.

He comes no further into the daylight. He screws his eyes almost shut against the light from the arch and raises one small hand to shade them. With the other hand he holds the broom crosswise in front of his body like a bar across a door. His tail is wrapped tight around one ankle.

"Tall ones," he says in Common. It's thin and careful, and every word sounds picked out ahead of time. "No iron. Ixx only sweeps." His eyes go to the thumb's width of steel showing at your scabbard and stay there. "The Warm One hears you at his door. He sends Ixx up. He says, come down, tall ones. He pays good."

He waits on the step with the broom held across him, blinking in the light, and doesn't come any closer.

Your journal, new:
+ Thread: The Warm One's invitation

Where you are: fourth step of the warm stairwell below the arch · Time: Day 1 · afternoon
````

**Player** (player r3):

````text
Bram doesn't move off the step, and he doesn't push the sword back down. He lets his shield sit in front of him, easy, and keeps his eyes on Ixx without staring the little creature down.

"Ixx. I'm Bram. We're not here to fight a sweeper." His voice carries clearly down the stairs but stays calm, the same tone he'd use with a nervous watchboy on a caravan gate. "Who is the Warm One, and what's he paying for? He sends a broom and a polite voice up to staring daylight — that says he wants something from us more than he wants us gone."

He pauses, then angles his chin toward the riser the kobold stepped over so carefully.

"You came up with your feet placed like there was a place that bites. If we're meant to come down, I'll want the safe footing shown — all of it. And I'd hear what Ixx gets out of this, not just what the Warm One pays."
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
Let me think this through from Bram's perspective.

Bram is a veteran caravan guard, level 5 fighter. He's careful, methodical, protective. He's at the front of the party on a stairwell going down into a warm ruin. A kobold named Ixx has come up with a broom, carefully stepping over something invisible, and issued an invitation from "the Warm One."

Key observations from Bram's point of view:

- The kobold said "No iron" — perhaps meaning weapons, or maybe literally no iron, which could matter since Bram has a longsword, chain mail, shield.
- The kobold is carefully stepping over something in the stairwell — a trap or warding, maybe a tripwire or glyph. That's important. It's not telling them what it is, but it's visibly avoiding it.
- "He pays good" — the Warm One is trying to hire them or lure them down.
- The kobold's eyes are on Bram's sword. It's nervous.
- The broom across the body is both a tool and a barrier, a sign of not being a threat but also blocking the way.

What would Bram do? He's not going to put down his sword. But he might parley, carefully. He's a frontline fighter with decent Wisdom (13) and Perception/Survival skills. He's protective of Sefa and Pell behind him. He would try to learn more, not charge a lone kobold with a broom — that's not a threat yet. He'd keep shield up, keep the group in order, and ask questions. Maybe step forward but not past where the kobold is.

He should probably not descend closer until he understands that skipped step. The kobold stepped over something on a riser — a trap likely. If they're going down, they need to know where to place their feet.

His tone should be calm, company veteran: not hostile, but not naive. He can be direct without threatening the kobold. He shouldn't draw the sword further.

Possible questions:
- Who or what is the Warm One?
- What does he want with us?
- What's being paid, and for what?
- What are you stepping over? Show us the safe path.
- No iron — do you mean no weapons? Because I don't lay down my blade.

Bram might also ask Sefa or Pell quietly for their read, but it's a fast moment — the kobold is right there.

I need to write one message as Bram. At the table, players write one message each per round, then the GM resolves. So this should be Bram speaking/doing something in response to the kobold's arrival. It should not try to control Sefa or Pell beyond what's natural (he already set the order). He might glance back at them but address the kobold himself.

Bram wouldn't be afraid of a kobold with a broom. But he'd respect the trap on the stairs and the weird warmth. He'd treat the invitation seriously but test the terms.

Let me draft:

Bram doesn't draw, keeps the sword a thumb out, shield raised. He holds his ground on the step and speaks in the same calm, deliberate way he uses with nervous merchants and new hands.

"Ixx. I'm Bram. We're not here to fight a sweeper. Who is the Warm One? And what's he paying for, that he needs to invite armed strangers down into the warm dark?"

He pauses, tilts his head slightly toward the step the kobold skipped.

"You came up careful, as if the stairs had a place that bites. If we're meant to come down, show us the safe footing. And name your price — not his. What does Ixx want out of this?"

That feels right. He takes control, doesn't threaten, but doesn't surrender anything. He asks the kobold to demonstrate the safe path. He also asks what Ixx wants personally, which is a good way to get an honest answer.

Should he mention the "no iron" comment? Maybe: "You said no iron — my mail is iron, my blade is iron. Is that a rule of the house, or a warning?" But the kobold said "No iron. Ixx only sweeps." That might mean "Don't attack me, I'm only the sweeper" rather than "iron is forbidden." Actually "No iron" is ambiguous. In context it seems to mean "No fighting, I'm harmless." I think Bram's enough of a road veteran not to over-parse that. He might acknowledge: "No iron unless you force it. You haven't."

Let me finalize a single message, in character, no out-of-character comments. Keep it in Bram's voice — practical, blunt but fair, protective of the party, not reckless. He won't negotiate away his blade.

Also, Bram's Perception and Survival are decent; maybe he notices something about the skipped step. But I should not invent a detection; the GM will tell what he sees if he can see it. What he does know: the kobold stepped high over something there.

One message. Good.

I'll write it now.
````

### Screen 7 · player r4

````text
Sefa doesn't come down toward the kobold. She stays a step above you, at your shoulder. The only thing she moves is her hands: she lifts them open, palms out, slowly enough that he can watch her do it.

"No iron from me either, Ixx. I don't carry much of it." Her voice is unhurried, pitched to be heard and no louder. "Thank you for coming up to tell us. That was polite of your Warm One, and polite of you. You let us hear you coming."

She tips her head toward the stair below him. "You stepped high over the step beneath you. Is there something on that step we shouldn't put our feet on? We'd rather you told us than showed us." A small pause. "And the Warm One — does he have another name? What does he pay with, and what does he want tall ones for? Sweeping, I think, you already have in hand."

Low, without turning her head, she says to you and Pell: "Let him talk. Nobody's drawn yet. I'd like to keep it that way as long as he does."

Pell stops behind you and slowly sheathes his shortsword, keeping his hands where they can be seen.

"Pell. Good to meet you, Ixx. Coin's a fair start to a conversation." He nods toward the step the kobold crossed. "Saw you lift your feet over that riser. What should we avoid on the way down? We'd rather not spoil your sweeping. And what work does the Warm One want done?"

Ixx's eyes stay on the steel at your hip while you talk. When nobody's hand moves toward it, they slide to Sefa's open palms, then to Pell sliding his shortsword back into its sheath. The kobold's shoulders come down a finger's width.

"Bram," he says, trying the name out. "Pell." He looks at Sefa and waits, then takes her silence to mean no name for now. "Ixx hears."

He answers the easy question first. He turns the broom-pole end-down and touches its tip to the step under him, right at the line where the grey turns to dark. "Here. Singing string. Little shells on gut, across, low." He mimes plucking it with one claw. "Foot touches, it sings. The Broom hears below and knows tall ones come. It does not bite." He looks up at Pell, a little reproachful. "Pell did not see it. Is good string."

"Below that?" He thinks before he answers. "Stair is only stair. Warm, but only stair. After, in the hot rooms, floor bites. Ixx walks first there. Tall ones step where Ixx steps."

At your other question he goes still. "The Warm One is the Warm One." He sounds like someone who has said it many times. "Big. Old. Hot like the stone. His name is his. Ixx does not put it in mouth." He swallows. "He pays shine. Yellow coin. Old coin of the burned tall ones, cups, rings, much. He wants tall hands. There is a door down deep. Tall ones made it. Tall ones open it."

Then he comes to what you asked about Ixx, and he is quiet for longer. His eyes go to the arch and the bright sky behind it.

"Ixx gets to go back down." He hesitates, then adds more, quieter, as if it isn't part of the message he was given. "The Warm One cannot go up. So the Broom goes up for him. Ixx sweeps the stair, Ixx counts…" He stops. "Ixx sweeps."

Sefa watches him the whole time he talks, not the broom.

Ixx squints up the stair at the three of you. He holds the broom upright now and leans on it a little.

"Sun is hot on Ixx's eyes," he says. "Tall ones come down now? Ixx shows the string. Ixx walks first."

Where you are: on the stair below the arch · Time: Day 1 · afternoon
````

**Player** (player r4):

````text
Bram listens without moving from his stance. When Ixx finishes, he lets the quiet sit for a breath, then speaks.

"A singing string's a careful thing for a stair that's meant to be swept," he says. "That tells me the Warm One doesn't like surprises. We came up slow and talked instead of cutting. You can tell him that."

He shifts his weight, not toward the next step, just settling.

"Here's how it goes. You've asked us down. We're not saying yes yet. I've got a few questions before my feet go past that string."

Bram keeps his eyes on the kobold's face, not the broom.

"First: what is he, the Warm One? Not the name. The shape. I've been in hot rooms and I've been in old tombs. I'd like to know which one opens at the bottom."

"Second: you say tall ones made the door and tall ones open it. So he needs our height, or our hands, or our blood. I won't walk down blind into a pact I haven't heard. What happens to the last tall ones who opened a door for him? If there were any."

"Third: we go down, we talk, we see the door. If we don't like the work, do we walk back up the same way, peaceful? Or does the warm stone get a new heat?"

He pauses, then jerks his head slightly toward the daylight behind them.

"Ixx, you came up at the sun and didn't like it. That tells me you're not shut in there by choice. I don't fault you for serving something that keeps you on the right side of the broom. But I won't be led down on a promise that's just 'come see.'"

He looks back over his shoulder, first at Pell, then at Sefa, holding their eyes a moment—checking if either of them has a word before he commits to anything. Then he faces Ixx again.

"If the Warm One wants tall hands for a door, he can answer through you before we step over the string. You offered to walk first. That's good. But the first thing I want to see is whether the stair comes back up behind us."

Bram doesn't twitch toward the sword again. His left foot stays planted on the step he's on, but his right hand closes once, then opens, the same way it does when his leg's bothering him after a long ride. There's a blister at his heel now, riding at the back, warm inside the boot. He ignores it.

The air from below keeps breathing up past his face, warm and dry. Somewhere down there, the Warm One waits, and from the way Ixx's tail holds to his ankle, he knows it.
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
OK, user input. Need to process Bram's response based on the current scene. Bram is a practical, experienced caravan guard. He's heard Ixx's answers. Key details: Ixx is a kobold, polite, a messenger for the Warm One. The Warm One wants them to open a door made by "tall ones." There's a tripwire (singing string) on the step. Ixx wants to survive. Bram's stance: cautious but civil, protective of the party.

Bram's immediate concerns: assessing the risk. The Warm One pays with old treasure but wants a door opened—that sounds trapped or sealed, likely dangerous. Bram has no reason to trust this creature or its master. He needs to know more before agreeing to go down. He should state his conditions clearly, in a way Ixx can report back. Also, he should think practically: if Ixx is telling the truth, there might be a way out for the little kobold, but that's a chance. Bram shouldn't promise to free Ixx outright—that's not his call alone, and it could complicate things. He should focus on the immediate plan.

Also note the physical details: Bram's leg from climbing, the blister, familiar from road work. It's a human touch, grounding his decision-making. He'll ask about the Warm One's temper—crucial for knowing if they can negotiate later. He wants to know the gear they'd need. He sets a line about not being handed the clean broom. He signals he's open to going down but on his terms, not as a prisoner. The offer to come back up and talk through Ixx is a smart move—it tests the Warm One's intentions and gives them an out.

The response should be in character: blunt, measured, no wasted words. Bram speaks like a soldier giving instructions. He addresses Ixx directly, asks the key questions. So, Bram will: ask what the Warm One actually is (shape), warn about shutting them in, demand a way out or a promise, state his condition for going down, ask about dangers in the hot rooms and the tools needed, and set a boundary about being led around blindly. He'll also show he's considering Ixx's position by not exaggerating the chance of leaving, but leaving the door open. Need to align with canon: Bram is a guard, practical, protective, blunt but fair.
````

### Screen 8 · player r5

````text
Sefa lets out a long breath behind you. "Sefa," she tells the kobold, giving him her name. "No iron, and no fire in your eyes. I'll keep my light low and behind Bram's shield, not in your face. You've stood in the sun long enough for one message." She lays two fingers on the inside rim of your shield.

Pell speaks too. "Good string. Better to meet its maker than hear it sing." He glances at you and Sefa. "I'm willing to hear an offer. Not promising to open anything until we know what's behind it." To Ixx: "Show us, then. Slowly. Our feet take up more stair than yours." He readies his lantern. "Sefa, can you give us that light? Low, away from Ixx's eyes."

Sefa goes on to Ixx: "We'll come down, Ixx. You first, and you show us the string. Put your broom-tip on it so Pell can see where it lies. Then the stair, then you stop at the edge of the hot rooms and *wait* for us before anyone's foot goes onto a floor that bites. Nobody draws unless something draws on us." She looks past him into the dark. "And when we reach your Warm One, I'll want to hear about this door from him, not through you. You've carried enough of his words up the stairs today."

Then, low, to you and Pell: "Old coin of the *burned* tall ones. A thing that can't climb its own stairs. Hot like the stone." A beat. "Mind the floors. Mind what else he counts down there. He stopped himself saying it."

Ixx hears you out without moving. Only his eyes shift, from your face to your hand as it closes and opens, and back to your face. When your questions stop he takes a moment, sorting them the way he sorts every word.

"Bram asks three," he says. "Ixx answers three."

"One. Not tomb. Hot rooms." He lets go of the broom with one hand and holds his forearm out into the grey light. Under the dust the scales are rust-red. "He has scale. Like Ixx. Red, like Ixx." He looks up past you at the arch and the sky behind it, and his voice drops. "Big. Bigger than this door."

"Two." This one takes him longer. "No tall ones opened. Not ever. Some come to try. Ten sleeps ago, four tall ones. They did not come down slow and talk. They came at night, quiet, with iron, and they went to the hot rooms alone." His tail tightens. "They did not come back to the stair. Ixx's clan carried them up after and burned them proper, the way tall ones are burned." He doesn't say what killed them, and he doesn't look like he's keeping it back. He looks like a small creature remembering something heavy he had to carry.

"Three." He opens his mouth and shuts it again. "Ixx does not promise for the Warm One. Ixx is too small to promise for him." Then, carefully, because it is his: "The stair is Ixx's. Nothing on the stair shuts. The string is for coming. Going up, it only sings."

At your last words, *not shut in by choice*, the kobold draws himself up a finger's width. "Ixx goes up. Ixx goes down. Ixx chooses." He blinks against the sun. "Ixx does not like up."

His head turns quickly to the dark below him and back. A moment later you hear what he heard: a faint scrape of claws on stone, a long way down, and then nothing. Ixx looks back up the stair again.

"Sefa," he says when she gives her name, trying it out the same way he tried the others. Where her fingers touch your shield rim a small, steady light wakes, the yellow of a lamp. Sefa tips it toward the steps so it pools on the stone in front of your boots and doesn't reach out into the dark. Ixx flinches the way a man does when a door opens on a lit room. Then he stops flinching. The light doesn't sting him the way the sun does. He looks at it for a long moment, longer than he looked at your steel, and says nothing about it.

Pell has his hooded lantern in hand with the shutter down. Sefa's light makes it unnecessary for now. He stays at your right shoulder with his eyes on the step where the grey ends.

"Show us," Pell says. "Slowly."

Ixx does it from where he stands. He turns the broom, sets the bristle end down on the tread below his feet and draws it along a line. In the light you can see it: a cord of dried gut stretched about ankle high across the whole step, tied off to iron pegs driven into the mortar at each wall. Every hand's width along it hangs a little knot of shells, white and pierced, the kind sold by the string in any Gate market. The knots hang still in the warm draught. It's careful work, low enough that a man watching the walls would walk straight into it.

Ixx lifts the broom off the cord and holds it upright.

"Sefa says come," he says, and looks at you. "Pell says show. Bram asked." He waits with the sun on his eyes and the dark at his back. "Bram comes?"

Your left foot is still on your step. Sefa and Pell are ready to follow you down.

Your records, changed:
Conditions: Light on shield rim (Sefa, 1 hour)

Where you are: on the stair just inside the arch, above the gut string · Time: Day 1 · afternoon
````

**Player** (player r5):

````text
Bram holds Ixx's eye a moment longer, then gives a slow nod.

"Straight answers," he says. "I'll take that. We come down and we talk. Nobody draws unless something draws on us first."

He leans a little toward Sefa, voice low enough that it stays between the three of them, though Ixx might catch the edge of it.

"Red scales, older than the ruin, can't climb his own stair but sends a kobold to sweep it. Could be a drake, or worse. Either way, we don't spread out down there. We stay close, and we don't step off the path Ixx shows us."

Then he turns back to the stair. "Ixx, show us the leap. I'll put my feet where yours go." He watches carefully as the kobold moves, marking the exact places where the small claws clear the gut string, then follows the same way—high step, shield kept forward and low, not crowding Ixx, but close enough to keep him in arm's reach if the stairs turn suddenly.

Behind him he waits for the scuff of Pell's boots and Sefa's softer step, their weight settling onto the tread after his own. The warm air rises past his jaw, uncomfortably close, but steady. The light licks ahead, just far enough to show the next few steps and no more.

"Speak up if anything's different from when you left it," he says to Ixx's back. "Fresh dust, moved shell, a warm spot where yesterday it was cool. You know the stair better than us. That's why you're walking first."
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
We need respond as Bram. We are just inside arch, above gut string. We have to decide to go down. Bram asked questions, got answers. He is cautious but likely will go. Need maybe ask Sefa/Pell with glance, then proceed. Need narrate movement, keeping shield, watching string, maybe tell Ixx to step over and we follow exactly. Need maybe keep hand near sword but not drawn. We should not press any button unless roll needed. We can just describe.

Need stay in character: practical, front-line guard, wary but not hostile. Should acknowledge answers. Maybe say "I like a straight answer." Then proceed. Need mention heel blister? Not necessary, but perhaps ignore. Need convey agreement to go down slowly, with conditions: first sign of trap or betrayal, we leave or fight. Also maybe note that if Warm One has scales like Ixx, could be a dragon or drake — road guard would know danger. But not jump to fight.

Need respond in first person, present tense, no markdown. The session expects one message per round. We'll write Bram's actions and words. Shouldn't overlong. We can include movement down, careful over string, following Ixx. Need maybe "Light stays low. Pell, watch above as we pass under anything." 

Let's craft:

Bram nods once. "Straight answers. Alright, Ixx. We come down and talk. No one draws." He looks to Sefa and Pell, then at string. "Show us the step you hop, I'll match it." He steps high over cord, etc.

Maybe he says "If the Warm One means harm, we'll find a different bargain." But not too threatening.

Need ensure our character only sees/hears what GM described. So respond.

Could include small private thought about "hot rooms" and scales: dragon, maybe. He would voice low to companions: "Mind that. 'Bigger than this door' and red scales. Could be a young dragon." But maybe too meta? Bram knows monsters. Should mention quietly to Sefa/Pell, but in character. It could alert Ixx if spoken. Perhaps before going down, lean close and murmur: "Red as embers, bigger than the door, old as burned wizards. Could be a dragon. They said old coin of burned tall ones." Maybe "If it is, we keep close to each other, don't spread out." This is good. He is veteran. But not too expository. Ixx may hear.

Need maybe not ask more; time enough at bottom. We can say "Let's go."

Let's produce.
````

### Screen 9 · player r6

````text
Sefa watches Ixx's face when the light doesn't make him flinch a second time. She speaks quietly to you and Pell, without hiding it from the kobold.

"Red scale, bigger than this door, and he can't come up his own stairs. That's a dragon or something that wants very badly to be one. And the four who came quiet with iron were carried up and burned. Not eaten. Burned proper, the way tall ones are burned." A pause. "Someone down there wanted that done decently. That's the first thing I've heard that makes me want to meet him rather than run."

She looks at the back of your head, then at Pell. "I'll say my piece and then it's Bram's foot. I think we go. Slowly, talking, in daylight, with the stair at our backs and the string only singing. If we turn round now we've learned nothing and left a thing that pays in dead men's gold sitting a day from Beregost with a door it can't open. I'd rather know what's behind the door before someone less careful does." Her thumb moves once along her beads. "And if it turns out to be only a tomb with a warm voice, I've two slots and a very fast step back up these stairs."

To Ixx, more gently: "You chose to come up into the sun to warn us. I won't forget that whichever way this goes. Walk us down when Bram says. We'll step where you step." Then she waits, holding the light steady on the rim of your shield.

Pell leans close to you and keeps his voice low. "Sounds like a red dragon. I'm willing to talk, not fight one. You're the one in front. If you want to turn back, I'll back you." He tucks the unlit lantern away, leaving his hands free, and waits behind you without trying to edge past.

Ixx watches your nod. When he's sure it means yes, he lets out a breath through his nose and turns to face down the stair.

"Bram steps where Ixx steps," he says. He goes over the string slowly, the way he came up: one clawed foot lifted high and set down on the far side of the cord, then the other. He doesn't look at his feet, and he doesn't need to. On the far side he waits with the broom pole upright and watches your boots.

You follow him exactly. You lift your boot a hand's width higher than the shells and set it down on the next tread, then bring the other boot over the same way, shield low and forward. The string doesn't sing. Pell comes over behind you without a sound. Sefa holds the hem of her coat out of the way and steps over last, and the shells hang still in the warm air behind you.

After that the stair is only a stair, as Ixx said. It runs straight down for a long way, through cut stone that was dressed smooth once and has gone rough with age. The light from your shield rim slides ahead over the treads. The walls get warmer as you go. Twenty steps past the string you can feel the heat through your glove when you brace a hand against the stone. Forty steps down, the air in your throat is like a summer loft. The daylight behind you shrinks to a pale square, then the stair bends once to the left and the square is gone.

Ixx answers your question without turning his head, pitching his voice to carry up to the three of you.

"Same dust. Same shells. Nothing moved." A few more steps. "Warm. Not new warm. Old warm." He goes quiet for a while, then speaks again in the same careful way. "Every year, warmer. Old ones of the Broom say, when they were small, moss came down to the third step. Now moss stops at the door." His tail flicks once. "Ixx is not old. Ixx only knows the door."

Partway down the second run a dark band crosses the right-hand wall at shoulder height. The soot has been scrubbed at and smeared, as if someone tried to clean it off and gave up. Below it the treads are worn in a different pattern: two parallel grooves down the middle of each step, shallow and smooth. You know the look of it. It's the mark a sledge leaves on a ramp. Something heavy has been dragged up or down here many times, on poles or runners.

Claws click on the stone below, fast this time. A second kobold comes up into the edge of the light and stops dead. She's smaller than Ixx and darker, with a sling wound around one wrist and a pouch of stones at her hip. She sees your shield, then you behind it, then the two behind you, and her mouth comes open on a hiss she doesn't finish. Ixx speaks to her sharply in a language of clicks and rasps you can't follow. She answers, quicker and higher. Her eyes keep going to the light on your shield rim, the same way Ixx's did. Then she turns and runs back down the stair ahead of you, and the sound of her claws dwindles into the dark.

"Skra," Ixx says, as if that explains it. "The Warm One sent her to see why Ixx is slow. Now she goes to tell. Tall ones come, slow, talking." He sounds pleased.

You reckon the stair runs about a hundred and twenty steps, ninety feet down, before it opens into a round chamber thirty feet across, with a low dome and a floor of the same worn stone. It's hot here, the kind of heat that settles on the shoulders and stays. Three ways lead out.

To the left a doorway is hung with goat hides, stitched together and gone stiff. Behind them is a dim, smoky glow, and the smell coming through is everything the steps above promised: goat, dung, tallow smoke, and a lot of small bodies living close together. Low voices behind the hides stop all at once.

To the right is a tall arch whose door burned long ago. Only the iron hinges are left on the jamb, bent and black. Beyond it the light catches the edge of something that might be a shelf. The air from there is dry and smells of old ash, like paper burned a long time ago.

Straight ahead, opposite the stair, a wide passage slopes downward, tall enough that you could walk it without ducking and wider than any of the doors. Far down it there's a faint dull red on the stone, like a forge seen through a crack in a wall. The heat comes from there, and so does the steady breath that rose past you all the way down the stair.

Ixx stops in the middle of the chamber and lowers the broom.

"Down there, hot rooms," he says, tipping his snout at the red passage. "Floor bites. Then the Warm One." He turns his head toward the goat hides, where at least four pairs of eyes now shine low in the gap at the edge of the curtain. "Here, the Broom. Skra told. The old ones want to see the tall ones first." He looks up at you and blinks in the shield-light. "Tall ones wait here, Ixx brings old ones out. Or tall ones come in."

Behind the hides, something small coughs and is hushed.

Where you are: round domed chamber at the foot of the stair · Time: Day 1 · afternoon
````

**Player** (player r6):

````text
Bram stops in the middle of the dome, but not too far into it—near enough to the stair that they can still reach it if the hides and the red passage both turn ugly. He keeps his shield angled toward the great sloping way, where the heat and the breathing come from.

"We'll wait here," he says to Ixx. "Bring your old ones out. I won't walk into a den I haven't seen the shape of." His voice is polite, not hard, but it leaves no room to argue. "Skra too, if she can stand still long enough to look at us."

He glances at the burned arch on the right, then at Sefa and Pell.

"Don't drift toward the hides or the side door. We stand where the stair's at our back, and whatever wants us comes into the open." Lower, he adds: "The Warm One's sent two kobolds up, and neither's tried to put a stone in us. That's better than most inns on the road. But we don't go down that red passage with our backs to a crowd."

Then he calls to the kobold elder beyond the hides, not loud, but clear.

"I'm Bram Halloway. I've brought no drawn iron into your home. Ixx met us on the stair and gave straight answers. I'd shake hands, if that's your people's way." He pauses. "What do the old ones want to see before we go meet the Warm One?"
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
We need respond as Bram. We need continue scene. We need decide: meet old ones or go into Broom? Need roleplay. We should probably greet kobold elders first, understand. Bram cautious. Need respond in character. Need maybe check with companions? We have context of two other players but they've already spoken. We can act. Need keep message moderate length as player at table. Bram likely chooses meet the old ones here, not enter their den. "We'll wait here. Ixx, bring the old ones out. Tell them no iron, same as at the door." Need perhaps inspect chamber, not wander. Keep tight. Maybe the floor bites in hot rooms. We need ask about doors, burned door, Sefa may know. We can mention side arch. This round Bram does action. Let's draft.

We need be careful: the screen says on each round each player writes one message. We are one player. Need in character. Should we press no buttons? No roll cards waiting. We can just speak/act.

Let's write Bram. He takes stock, stance, chooses not enter hides, maybe calls to Ixx. "We'll meet them out here, in the open. Ixx, bring the old ones. Skra too, if she'll stand still." He stays near stair, back to it? In chamber, positions. He won't let them be surrounded; Sefa and Pell close. Maybe low to them: "We don't step into their hole. Let them come to us. If the Warm One wanted us dead, he didn't need an invitation." He observes sledge marks maybe mention after. Could speak to Ixx about burned room? Maybe not yet.

Need maybe note the burned arch right — maybe ask Ixx what's in there. Since we are careful. "That burn-scarred arch to the right — what was it? Any traps?" But first meet elders.

Could decide "or tall ones come in" — answer: wait here, bring old ones out. Need not enter goat hides, risk enclosed. Yes.

Need maybe tell Sefa/Pell low: "Eyes to the red passage. If something comes while we're talking, I'll hold here." Pell rogue can watch. This is actions/orders.

Let's write succinct, in Bram voice. No [Onward] unless no card? No card. Final need only message.

Need ensure not overdo. We can include:
Bram plants himself near the center but not block escape to stair; shield toward red passage maybe since heat there. "We'll wait here. Ixx, bring your old ones out. No iron, no tricks." Then aside: "Sefa, Pell, sides. Don't drift to the hides."

Let's produce.
````

### Screen 10 · player r7

````text
Sefa stops where the stair gives onto the chamber and goes no further in than you do. Her eyes go left to the shining eyes at the hem of the hides, right to the burned hinges and the shelf-edge beyond, then down the red passage and back.

"We'll wait here, Ixx," she says, before anyone can crowd the curtain. "Three tall ones with iron walking into your clan's rooms uninvited — I wouldn't like it done to me. Let the old ones come out to the light. We'll stand still and keep our hands where they can see them." She steps aside so the light on your shield spills onto the open floor between the stair and the hides, not into the gap where the eyes are, and sits down on the bottom step.

Low, for you and Pell: "Stair at our backs, open floor in front — that's where I'd rather have this talk than in a goat-smoke den with one door. Pell, that burned arch on the right smells like a library someone put a torch to. Ulcaster's, I'd wager. Nobody goes near it until we've been asked." She nods at the floor. "And those grooves on the steps — something heavy, dragged, many times. Not four bodies ten days ago. Years of it."

Pell stays with you and Sefa, clear of the passages, his hands away from his weapons. "Here will do, if they're willing. Three of us would crowd your doorway." Then: "Ixx, you both noticed our light. Is it something the old ones know about? There was a lantern carved over the entrance, with words about 'lent light.'"

Ixx looks from you to Sefa on her low step, then at the dagger she has laid down with its hilt turned away. He sets the end of his broom on the floor and leans it against the wall by the hides. It is the first time since the arch that he has let go of it with both hands.

"Tall ones wait. Good." He turns to go, then stops when Pell speaks. His eyes go to the light pooled on the stone in front of your boots.

"Old ones know it," he says, slowly. "The deep door has a light. Small. Yellow. Like Sefa's." His tail twitches. "Ixx should not say door-things before old ones say." He ducks through the gap at the edge of the hides, and the curtain swings shut behind him on a burst of clicking voices that all start at once.

While you wait, Pell looks the chamber over from where he stands.

The hides open properly this time. Two kobolds hold them back while the old ones come out.

The first is very old. Her scales have faded from red to the pink-grey of old brick, and one eye is milky. She walks with a stick of blackened wood and wears a long string of the same pierced white shells as the singing string, wound three times around her neck. A broad, scarred male comes behind her with a short spear held upright, not pointed. He looks at your sword hilt and then doesn't look away from it. Ixx walks at the old one's elbow. At the back, half behind the curtain, is Skra. She stays where she is, her sling unwound into her hand but not loaded, and stares past all of them at the shield-light.

For a moment, while the hides are held open, you can see the warren behind them: a low smoky room, a fire of dung cakes, goat hides layered on the floor and a lot of small shapes pressed back against the walls. On a peg just inside the doorway, where you would hang a trophy, hangs a tall one's helmet. It's an iron cap with a nasal bar, and the whole left side of the brim has slumped and run like candle wax. Then the hides fall shut behind the elders, and it's gone.

The old one stops at the edge of the light, in the place Sefa left for her. She looks at the light for a long time with her one good eye. She doesn't flinch from it the way Ixx did. Her claws find the shells at her throat and stay there.

You offer her your hand and your name. Ixx bends to her and repeats it in quick clicks. The old one listens, then lowers herself stiffly and presses her palm flat to the floor. She holds it up toward you, open and grey with dust.

"Old Tisk shows empty hand," Ixx says. "Dust hand. This is our way." Then, after a long exchange, he answers your question: "Old ones want to see three things. See tall ones' faces. See if tall ones come with night-quiet, like the four, or with talking." He glances at the light. "And see the light. Tisk says that one most."

From behind the hides the small cough comes again, wet and tired. The scarred male says something sharp toward it. Tisk lifts one claw and he stops. She clicks at Ixx, looking at Sefa.

"Small one is Pikk," Ixx says. "Smoke cough. When the fire is bad, every time." He listens again. "Tisk says: after. Maybe."

Then Tisk turns her good eye from the light on your shield to Sefa on the step and asks something that makes the scarred male shift his feet. Ixx hesitates before he passes it on, and when he does, he says it carefully.

"Tisk asks Sefa. Who gave the tall one this light?"

Where you are: domed chamber, near the stair, facing the elders · Time: Day 1 · afternoon
````

**Player** (player r7):

````text
Bram keeps his place and his shield still, but when Tisk looks to Sefa, he doesn't answer for her. He lets the quiet hold.

He turns his sword hand palm out, fingers open, and keeps it at his side where the scarred male can see it. Then he tips his head a fraction toward Sefa, voice low but not secretive.

"Your light. Your answer."

His eyes go back to the spear-kobold, steady, not challenging. His feet stay set between the elders and the stair. The heat from the red passage presses at the back of his neck, but he doesn't turn toward it. Whatever comes out of the hot rooms, he wants to hear it before he turns his back on this room.
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
Still on turn 6? Need respond to latest GM. We see the scene: elders out, Tisk asks Sefa about light. I'm Bram. I should let Sefa answer? But maybe I can respond or act. Need one message. The other players will respond too. Bram is in front. We should be careful. The old one asked Sefa directly. It's not for Bram to answer for her, but he can stay ready. Maybe I should keep steady, watch the scarred male. Could answer part? I should probably not speak over Sefa. But the prompt asks what I do or say. I can remain quiet, guarding, maybe scan. But one round each; if I just remain quiet it might be okay but maybe I can subtly tell Sefa she can answer. We can say something low to Sefa like "Your call." Need not dominate.

Let's craft response: Bram keeps his place; when Tisk addresses Sefa, he doesn't step in. He keeps eyes on the scarred male and the spear, then glances at Ixx. Maybe he says low to Sefa: "Truth's fine. She's asking after your light, not my sword." Or just wait.

Since the conversation involves all; Bram might respond to earlier part: the hand gesture. We didn't physically mimic due to held shield/longsword. Perhaps we can say: "I won't kneel, but I keep my hand open" maybe show open palm? Actually Tisk showed empty hand; Bram has shield and sword hilt. He can lower his sword hand open. He can nod.

We might use Athletics/Perception? No roll needed.

Need maybe address coughing Pikk later.

Let's compose in character. Make it concise.
````

### Screen 11 · player r8

````text
Sefa doesn't answer at once. She looks at the old one's dust-grey palm, then down at her own hands open on her knees, and for a moment she is quiet.

"I'll give you the true answer, Old Tisk, because you asked it plainly." She keeps her voice in that low ward-register and lets Ixx carry it. "Nobody gave it. I asked, and something answered. I was a sister in a sick-house in the Gate, the year the fever came off the docks. The ninth night the oil ran out and the ward went dark, and people were dying in the dark where I couldn't see to help them. I prayed to anyone who was listening. A voice came, like a lamp being lit. It has been in my hands since." She turns one hand over. Nothing shows in it, but her eyes go to the small yellow pool on your shield. "I don't know its name. I call it the Lantern. It left me a book, and it left me a debt I've never been told the size of." A breath. "I did not know, until I put my hand on your door this afternoon, that anyone else had ever carved its picture in stone."

She lets that sit, then meets the milky eye. "Ixx says the deep door has a light like mine. Small and yellow. I'd like you to tell me about it, if the old ones say it's a thing for tall ones to hear. And I'd like to know who lent the light the lintel speaks of — *by lent light* — and to whom."

Then, quieter, with a glance at the hides where the cough came from: "Pikk's cough is in his chest. Smoke does that to the small and the old first. After, if you'll have me, I'll look. And I saw the iron cap on your peg — the one that ran like wax. I'd be glad if someone told me how a helmet comes to do that before I go down the warm passage and find out for myself."

Low, aside, to you and Pell: "That helmet melted on a man's head. Whatever killed the four, it breathes. Mind the red."

Pell crouches, presses his empty palm to the dusty floor and holds it up toward Tisk the way she did. "Pell Dunmore." Then he says quietly to you, without pointing: "Boot tracks into the burned room. Several, roughly ten days old. I can't see any coming out. The clan's tracks stop at the dust." His hands stay open. "Worth asking about before we go farther."

Ixx translates Sefa's answer a piece at a time. He stops after each part, clicks it across to Tisk and waits, and twice he goes back for a word he didn't have. *Sick-house* takes him a while. *Ninth night* he gives with his claws held up. At *debt*, Tisk's hand leaves the light for the first time and goes to the shells at her throat. Her claws close over the three turns of them and stay closed.

While Ixx finishes, your open hand hangs at your side. The scarred male's eyes go to it, then to your hilt, then back to the hand, as if he's checking both are still where he left them. The spear stays upright.

Tisk turns her good eye on Pell's grey palm. She clicks something short, and one of the kobolds holding the hides makes a sound like a laugh caught halfway.

"Tisk says Pell learns quick," Ixx says. "Pell Dunmore." The scarred male snorts through his nose and says nothing.

Then Tisk answers, and Ixx gives it to you in pieces as she does.

"The cap." He points with his snout at the hides, where the peg hangs. "Four tall ones went to the hot rooms, night-quiet. The hot rooms did that. Broom found them after. Carried up. Burned proper." A rasp from Tisk, and he adds: "Cap stays on the peg so the small ones see it and do not go play in the hot rooms."

She says nothing about who or what was in the hot rooms when it happened, and neither does Ixx.

When Sefa's other questions reach her, about the door's light and who lent it, Tisk doesn't answer straight away. She turns her head to the wide passage, toward the red glow and the slow warm breath rising out of it, and keeps it turned for a long moment. When she speaks again her clicks have gone so soft that Ixx bends right down to hear.

"Tisk asks Sefa one thing." He straightens and says it carefully. "Your Lantern. Did it send you to this door?"

Something moves in the red passage before anyone can answer.

It isn't a step. The breath that has been rising past you all afternoon, warm on the back of your neck, stops, the way a man stops breathing when he's listening. For a heartbeat the air in the dome goes still and close. Then it comes out again in one long gust, much hotter, like a forge door opened and shut. It pushes Sefa's hair back from her face and stirs the dust fan in front of the burned arch. Under it, so low you feel it in the stone more than hear it, comes a sound like a great bellows emptying.

Every kobold in the room goes still. Behind the hides, Pikk stops coughing mid-breath.

"He waits," Ixx says quietly. He doesn't look at the passage.

Tisk lets go of her shells. She clicks fast at Ixx, and the scarred male answers her, sharp and long, his spear tilting a finger's width toward the stair. She answers him with one dry word. He shuts his mouth, but the spear doesn't come back upright.

"Tisk says: not here. Here the warm passage hears." Ixx swallows. "Inside, by the fire. Sefa looks at Pikk. Tisk talks of the door." He glances at the scarred male. "Hrask says iron stays outside the hides. No iron by the small ones. Sefa has no iron." He looks at the dagger on the step, then at your hip and Pell's. "Bram and Pell come with no iron, or Bram and Pell wait here, by the warm passage."

Tisk is already turning toward the hides on her blackened stick. Then she stops, half turned, and looks back over her shoulder at Sefa. She is still waiting for an answer to her question.

Where you are: kobold dome, between the elders and the stair · Time: Day 1 · afternoon
````

**Player** (player r8):

````text
Bram holds still while the last of that hot gust drags across the stone. He doesn't look away from the red passage until the air settles, then turns his head just enough to watch the elders again.

"Answer her, Sefa. Same truth as before." He says it low, at her shoulder, not pulling her eyes off Tisk.

Then he speaks to the old one through Ixx, and to Hrask plainly.

"I won't carry iron into your home. Longsword and javelins can wait at the curtain, points down. But I'm wearing iron from neck to knee—it's not something a man shrugs off in a doorway, and I'm not going to stand out here by the warm passage while Sefa sits by your fire. If the shirt bars me, I'll keep to the inside wall, away from your little ones. My shield stays on my arm. No blade drawn, not in your home. You have my word."

He unclasps his sword belt deliberately and lowers the longsword to the floor beside the hide curtain, scabbard and all, then takes the four javelins from the quiver at his back and leans them beside it, points angled down. He keeps his eyes on Hrask while he does it, smooth and careful, and leaves his shield exactly where it is on his left arm. The warmth from the red passage is still breathing at the nape of his neck.

"Pell, leave yours with mine unless their old ones say otherwise. We'll talk with our hands open and our backs near the door."
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
We need respond as Bram. We need adhere. We need consider situation. We are in kobold dome, warmed passage sentient listening. Tisk asks Sefa: did Lantern send you to this door? We are Bram; we shouldn't answer for Sefa. But now Hrask says iron stays outside hides; Bram/Pell no iron or wait. We need decide what Bram does. Likely don't disarm in hostile-ish environment? But need perhaps respect. We can let Sefa enter alone? Our role protect her; probably not split. We can say we'll stay at the edge/here, but Sefa doesn't go alone into hide room with kobolds? Maybe Pell and Bram can leave weapons outside with someone? We have shield and longsword. Belt knife? We only longsword/javelins. Kobolds themselves have spear; disarm while they keep spear is risk. Hrask has spear, so no iron by small ones but he holds spear outside. Could be tradition. Bram could say he'll wait just inside the hides without longsword but shield? Shield is not iron maybe wood banded? Shield has iron maybe. Hrask says no iron, Bram and Pell come with no iron. Bram can carry shield but maybe iron rim/rivets? Chain mail all over him! Wait, "iron stays outside hides. No iron by small ones." Bram wears chain mail, iron/steel. He cannot shed armor easily. This could be absurd. But the GM may not mean clothing armor; perhaps weapons. However iron cap melted on peg. They might mean weapons, but chain mail impossible. We should address: "I'm iron from shoulders to knees, Hrask. Can't hang my shirt on a peg." Maybe disarm sword and javelins, leave shield? But shield has metal? Need consider. Bram is a caravan guard; would he remove longsword and javelins but keep shield? Protection style needs shield. Could stay at entrance but not deeper; Sefa safe enough with elders? Pell could accompany with no blades; he has maybe daggers. The kobolds know Pell no iron? Pell might carry shortsword + daggers; he can leave. But our armor may violate. Could wait at doorway inside hides? Need roleplay.

Let's parse previous turn: Sefa gave answer and question. Tisk demands iron outside hides. Bram has chain mail, shield, longsword. The "iron cap on peg" maybe the clan's fear of iron? But they allowed us into dome with iron. Shelter no iron may apply weapons. We need decide. We should not let Sefa go inside alone into a dark smoky den while we stay by warm passage, where The Warm One listens and can blow. Splitting less safe. But we can deposit our sword and javelins, and shield? Shield is protection; maybe not "iron" but could have metal boss/rim. Chainmail cannot be removed easily. We can point out and get a ruling. But as player, we write message, GM narrates. Bram would not leave Sefa unguarded in a room of armed kobolds, even if peaceful. He might offer to stand just within the hide curtain with no drawn iron but armor on; they may waive because "tall one iron shirt" is stuck. Or keep shield, no sword. He wants Pell nearby. The threat is warm passage; no one should be alone there. Let's craft Bram's response.

Need include maybe speaking to Hrask/Tisk. "The iron is mine. I'll leave sword and javelins at the doorway. Shield stays—it's not a blade, and one of us needs a wall if the warm passage remembers we're here." Then to Sefa: "Answer her. Then go; I'll be at the curtain, not out in the passage." But Tisk's question to Sefa is still unanswered; Bram can encourage. The system asks each turn; likely Sefa player will answer separately; but as Bram, can say "Answer her, Sefa."

We need maybe respond that The Warm One's breath interrupting means not lingering by passage. There's danger. The scarred male's spear tilted toward stair — maybe he wants us out. Need navigate.

Bram could say: "We'll not stand in the warm passage's hearing. But I'm wearing an iron shirt; it doesn't come off quick, and it's staying on. If that bars me, I'll stand just on this side of the hides and see the room. Longsword and javelins I'll stack by the curtain, point down." Maybe shield? "Shield isn't iron-?" A shield could have iron banding. We can perhaps unbuckle shield too, but Bram relies on shield. He may choose to leave shield outside? But then if hot rooms come, no shield. The elders don't fear steel on us right now. Hrask's spear is within; their rule may be no iron weapons near children. They likely won't mind armor, because they see it as not removable? Hrask said "Bram and Pell come with no iron"—probably weapon iron. Bram has javelins too. Could leave all weapons. But our chainmail and shield are iron/steel. Shield maybe made of wood; doesn't matter.

Let's create message that is in-character and concise. Also maybe "Tisk asks you, Sefa. I'd like to hear that answer too." We can say to Sefa, not to Tisk. Then "I'll not give up my armor, but I'll come no farther than the doorway and leave blades outside." Hmm if Hrask insists no iron at all, maybe we stay by hides? "If the chain shirt offends, I wait at the threshold with one ear on the passage." But that separates. Maybe the old rule is no iron by small ones; chainmail is different, not weapon. They can accept.

Need maybe use [Onward]? In this system, after writing message, likely no button. We just respond. Our message can include actions; GM narrates after maybe with buttons. No need [Onward]. We should not press. The last roll card was resolved with Onward. We just roleplay.

Let's formulate:

Bram watches the warm passage a long moment after the bellows-sound dies. Then he turns to the elders.

"Tisk, you asked Sefa a question. Answer her, Sefa—truth, same as before." He keeps his voice steady. Then to Hrask: "I've no wish to carry iron among your small ones. My sword and the four javelins can wait at the curtain, points down. But I'm wearing iron from neck to knee; it's not a thing I can shrug off at a doorway, and I won't stand apart from Sefa while the Warm One's listening. If that shirt bars me, I'll stand just inside the hides by the wall, where no small one needs to be near me. My shield stays on my arm—if the warm passage decides to breathe at us again, one of us should be ready. No drawn blade, not in your home. You have my word."

Maybe to Pell: "Pell, leave your steel as well. Sefa's light and our hands are enough in there. We'll keep the doorway side." But Pell player makes own call; Bram can suggest.

Tone: cautious, respectful, no bowing.
````

### Screen 12 · player r9

````text
Sefa gets up from the step slowly and leaves her dagger lying where it is, hilt away from the hides. The hot gust lifts her hair and she lets it fall again without turning toward the passage. Her thumb moves on her beads.

"No, Old Tisk," she says to the milky eye, and waits for Ixx. "I'd like to say yes. It would make a better story, and it might make you trust me faster. But the Lantern doesn't speak to me in words. It hasn't told me to come here, or to leave, or anything at all. We came because coin was offered for a ruin and the road was quiet." She looks down at the yellow pool on your shield, then back. "What I can tell you is that it's been very near me since I touched your lintel. The light dipped on the stair a moment, like a lamp in a draught. I've not felt it do that in six years. If it sent me, it did it without asking, which, from what I know of it, is how it does most things."

Pell stands slowly. "I'll go in with Sefa, if she's willing. Bram, would you mind our gear? I'd rather she had someone beside her." To Ixx and Hrask he says: "No weapons by the small ones. Understood. My armour has iron studs, and my tools are metal too. Do those stay out?"

Sefa turns to the two of you and keeps her voice ordinary. "I'm going in. I've no iron to leave, and a child in there stopped coughing because he's afraid to breathe." A beat. "I'd rather not have us all unarmed in one room *and* nobody watching the passage. Bram, you're the one it would take longest to get a sword back onto. Stay by the stair with your steel and the light, and keep an eye on that red for me. Pell, your choice. If you come, your blades lie on the step beside mine where Bram can see them, and you hear what Tisk says about the door with your own ears, which I'd value. If you stay, I'll tell you every word." She picks up her pack. "Either way, if I call, don't come through the hides swinging. Call back. I'll have a child in my hands."

Then, to Ixx: "Tell Hrask I heard him. No iron by the small ones. I'll want water, clean if you have it, and whatever Pikk's been breathing at. I want to see the fire."

The hot gust thins out across the floor and is gone. The slow breath from the passage settles back to its old pace, and you don't take your eyes off the red until it has.

Ixx turns your words into clicks a little at a time. At *neck to knee* he touches his own throat and then his knee to show what you mean. Every kobold at the curtain watches you unbuckle your sword belt, lower the longsword to the floor beside the hides and lean the four javelins against the wall, points down. Hrask's eyes follow the hilt down to the floor and stay on it for a moment after you straighten up. Then, for the first time since he came out, they leave it and move to the shield on your arm, then to the mail over your chest. He says nothing. Tisk doesn't answer you either. Her face is still turned to Sefa, and she is waiting.

Ixx passes Sefa's answer on more slowly than before. Tisk hears it through to the end. When Ixx gets to *without asking*, she closes her good eye, so both are shut, and for a moment she is just a very old kobold leaning on a burnt stick. Then she opens it again and clicks something short.

"Tisk hears," Ixx says. "Inside, she tells Sefa why she asks."

On her way past, Sefa touches two fingers to the rim of your shield. The light there goes out, and the dome sinks back to the dull red at the end of the passage and a thin line of firelight at the gap in the hides. Then the light wakes again in her cupped hand, softened by her fingers. It's enough to show the floor at her feet and light her chin from below. Ixx gives Hrask her words about the small ones, then calls her request through the hides. Someone inside answers in a rasp.

Pell unbuckles his belt. He lays the shortsword, both daggers, the unstrung bow and the quiver at the foot of the stair beside Sefa's knife, and keeps his hands still.

Ixx turns from the tall ones to the elders and back, carrying three things at once. Tisk and Hrask go at it quickly. Tisk says one thing, Hrask says a lot, and Tisk says the last word.

"Tisk says shirts come," Ixx says. "Bram's iron shirt. Pell's shirt with little studs. A shirt does not cut. The round wood on Bram's arm comes too." He looks sideways at Hrask. "Hrask says then Hrask stands by Bram. By the door, close, all the time Bram is inside." Hrask has already moved. He stands inside the hides next to the doorpost with his spear upright, and the space he has left beside him is exactly wide enough for a man in mail.

Ixx points a claw at the roll of oiled cloth on Pell's belt. "Pell's little iron stays out. Hrask says small ones take small shiny things, and then Hrask has to go and take them back." One of the kobolds holding the hides open looks down at its feet.

Tisk ducks through the gap, and Sefa follows her in.

Ixx stays in the doorway, half in and half out. He passes on what Sefa asked to see and brings back Tisk's answer.

"Not this fire. This fire is for meat." He tips his snout back over his shoulder, toward the dome and the red beyond it. "The fire Pikk breathes is down the warm passage. When the hot rooms breathe bad, the bad comes up, comes in here. The smoke-hole does not take it."

The dome is dark apart from the red at the end of the passage and the firelight through the gap. Hrask stands at the doorpost with the empty place beside him, and he doesn't move.

Your records, changed:
Conditions: —

Where you are: the dark dome outside the warren's hide curtain · Time: Day 1 · afternoon
````

**Player** (player r9):

````text
Bram doesn't cross the threshold. He steps up to the open doorway and takes the space at Hrask's side with his shield angled outward toward the dim red at the end of the passage, not into the den where the small ones are. From the doorway he can see inside—Sefa, Pell, the fire, the room—and he can still turn his head and cover the dome and the stair behind him.

He leaves his sword and javelins on the floor just to his left, within a stride, and folds his arms over his chest, careful, so the mail doesn't clatter.

"Then I'll keep the door," he says to Ixx and Hrask. "Your roof, your rules. I can see the passage from here, and I can hear her." He glances once at Hrask, not hostile. "You don't have to stand close. I don't move from this spot unless I'm called or there's iron in that passage."

He lets his eyes go past the curtain: to Sefa's light as she kneels near the child, to Pell's profile, to Tisk's face. And every few breaths his head turns back toward the red glow, marking the rhythm of that slow exhalation from the hot rooms.
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
OK, the GM hit me with a decision point. Sefa went into the warren. Pell went with her. Bram is standing outside now. My last message was a conditional offer: I'd leave my weapons, but I wanted to go inside with Sefa (and Pell), just inside the wall, shield on, away from the small ones. Tisk said "shirts come" and Hrask has left a space for a man in mail beside the doorpost. So the kobolds have accepted that. The instruction now is clear: enter with my armor and shield, no blade, and stand by Hrask. I should do that. But I also need to note Bram's priorities: he left the passage unwatched. Sefa asked him to stay by the stair/steel and watch the red. But she also said "If I call, don't come through the hides swinging." Bram is a soldier; he'll keep one eye on the passage and stay near the opening for line of sound back to the stair AND the red passage.

But wait: the GM ended with Hrask standing inside the hides, with a man-width space beside him. That is an invitation for Bram to enter. But Sefa explicitly requested Bram stay outside with the steel and watch the red. I expressed "I won't stand out here by the warm passage while Sefa sits by your fire" — so Bram has pushed back on staying outside. But now there's a real tactical reason: watch the red and the stair. Hmm. Let me think: Bram trusts Sefa's instinct; she's the one with the Lantern debt. He refused to be separated from the group, but she overruled? Actually, she addressed the group with a plan: "Bram, you're the one it would take longest to get a sword back onto. Stay by the stair with your steel and the light, and keep an eye on that red for me." So she gave him a direct request. Bram's last message before that was: if the shirt bars me, I'll keep to the inside wall, away from your little ones. My shield stays on my arm. No blade drawn. He assumed he could come in. But Sefa then counter-proposed he stay outside. The GM has now been silent on that reversal. I need to resolve it. My character's intent overrides? What is Bram thinking? He wants Sefa safe, but he is also a guard; he dislikes splitting up in an unknown den. However, three armed tall ones in a kobold warren IS a risk; leaving the weapons unguarded and the red passage unguarded is stupid. The best compromise: Bram stays near the doorway, just inside or in the gap, where he can see both the stair and the red passage, and hear the room. Hrask stands by him. That meets "by the door, close." It doesn't fully meet "stay out here," but it lets him be within line/voice. The GM has placed Hrask inside beside the doorpost, and the curtain open? They said the hides open "properly this time" and the kobolds are holding them back. So the doorway is open. Bram can stand IN the doorway, half-in, half-out, shield toward the passage. That's probably what he'd do: refuse to fully enter, but not leave Sefa and Pell out of sight. He'd keep eyes scanning. He might also retrieve his longsword? No. He gave his word not to carry iron inside. He can stand at the threshold with the steel just outside. If something comes up the passage, he'll call and step back for his sword. He told them: "If anything comes up those stairs, get behind me. If I shout, we fall back." That was for the ruin entrance. Here, his job is to watch the red. So let's do: Bram does not go deeper inside. He steps to the doorway so he can see Sefa and Pell and Pikk's area from the threshold, but he keeps half a step outside the hides, shield facing the red passage. He tells Hrask he'll stay at the door. He keeps one hand free and listens. He says a line to Pell: "I can see the red and the stair from here. Shout if it turns." Then he remains silent, watching.

But the GM's narration ended not with a roll card but with a scene set—no explicit next turn for Bram? They narrated the old ones' answer, Hrask waiting. It is my turn to write. My task is to play Bram's reaction and perhaps position. Let me craft the message.

One more thing: there's a "threads" mechanism. New thread: The Warm One's invitation. Already in journal. No new card.

I should also consider: Tisk said they will talk of the door "inside, by the fire." Bram wants to know that. Pell can relay. OK.

So: Bram will step to the doorway, hold the edge of the curtain with his gauntlet, and stand half-turned so his shield faces outward toward the passage. He'll answer Hrask or Ixx in simple words. I'll make that clear.
````

### Screen 13 · player r10

````text
The thief sets his roll of oiled cloth down beside your weapons. "Fair enough. I'd want the shiny things back too." He follows Sefa through the hides with his hands in plain view and his head bowed under the low roof.

Hrask doesn't step back when you come up beside him. Ixx, half in and half out of the hides, passes on *you don't have to stand close*. Hrask hears it out with his eyes on your mail. Then he plants the butt of his spear on the stone a hand's width from your boot and leaves it there. He says something short. Ixx doesn't translate it, and from the look of him it didn't need translating.

What Hrask does next he does without a word. He turns his body a quarter, so he's no longer facing you but standing next to you, and he looks out the same way you do: across the dark dome toward the dull red at the end of the passage. The two of you stand at the doorpost watching the same thing.

From there you have both rooms. On your right are the smoky warren, the dung fire, Sefa's small light by the hearth and the rows of eyes along the walls. On your left are the dome, the stair, your sword and javelins a stride away on the floor, and the passage. You pick up the passage's breathing the way you'd pick up a team's breathing on a long grade. It's slow and even, a long draw and a longer letting-go, and you count it against your own heartbeat. It holds steady for a while. Then one breath out comes a beat early, as if whatever's down there shifted its weight. After that it settles back into its old pace. Nobody else seems to have noticed.

When the thief laid his tools down and spoke of shiny things, the small kobold holding the hides open looked at the tools on the floor, then quickly up at the ceiling, and tucked both hands behind its back. Hrask didn't turn his head, but his tail flicked once at the little one, and it went red to the ear-frills.

Inside, the thief keeps his head bent under the low vault for the first few steps. He finds a place by the wall, a little behind and to one side of the fire, well clear of the child and the woman holding him. The kobolds along the walls watch him and then, slowly, go back to what they were doing. One is twisting gut into cord. Two are scraping a goat hide pegged out flat on the floor. One is feeding dung cakes to the fire from a basket.

Tisk lowers herself onto a folded hide by the fire. She props the blackened stick across her knees and turns her good eye toward the hearth, where the child is. For a long moment she just watches. Then she clicks something low to Ixx without looking away.

"Tisk says: first Pikk," Ixx says from the doorway, loud enough for the whole room. "Then the door. She waits."

She sits and waits. The child whistles at the end of each breath. Out in the dome the passage breathes in, long and slow.

*(Out of game: no roll was needed. You stand at the doorpost with your shield angled toward the passage, watching the dome and the stair behind you. Your sword and javelins lie within a stride of you, and you fold your arms carefully so the mail stays quiet.)*

Where you are: at the warren's doorpost beside Hrask, facing the dome and passage · Time: Day 1 · afternoon
````

**Player** (player r10):

````text
Bram stays where he is, arms folded, shield angled toward the darkness. When the passage's breath comes early, his eyes narrow, and he lets it settle before he speaks.

"One of those breaths came short a moment back," he says, low enough that it doesn't carry into the den. "Like it shifted." He doesn't look at Ixx, but it's meant for him. "Is it sleeping down there, or is it listening to us through the stone?"

He shifts his weight from heel to heel, not far enough to leave the doorway, and glances once through the curtain: Sefa's light low by the child, Pell along the wall, Tisk waiting by the fire. They're not in a room he can cover with his shield, but they're within his eyeline. That will do for now.
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
Hmm, the game master has just described the scene: Bram is standing at the warren's doorway beside Hrask, keeping watch over the dome and the warm passage while Sefa and Pell are inside. The GM's message does not include an explicit question for Bram, but it ends with a detailed description and an out-of-game note about no roll being needed. This is a typical "what do you do" beat in a tabletop game. I need to respond as Bram, staying in character.

Let me think through Bram's perspective:

He's a seasoned caravan guard. Standing at a doorway, watching a dark, hot passage where something dangerous lives, with allies inside a kobold den. He's responsible, watchful, and pragmatic. He will not do anything reckless. The most likely action is to stay at his post and observe, perhaps speak quietly to Hrask or Ixx to gather information without leaving his position.

He previously noted that the Warm One's breathing pattern shifted. That detail is important: Bram would notice this and might mention it quietly.

I should not call for any rolls unless necessary. The situation is a tense, quiet waiting scene. I can describe Bram maintaining watch, maybe shifting his stance, keeping his shield ready, and noting aloud to Hrask or Ixx about the breathing. Or he might just watch silently, which is also valid.

But I want to advance the scene with a meaningful beat. Perhaps he asks Ixx a specific, low-stakes question related to the passage, or comments on the breathing to warn the others. Alternatively, he might count the kobold clan's numbers or note the hide curtain layout. Given his military background, he'd likely be making tactical observations.

One good option: he leans slightly toward Ixx and says, "That breath changed a moment back. One came early." This shows his alertness, warning the group subtly. It could also prompt Ixx to reveal something. This is safe and advances the suspense.

Another option: he checks on Sefa and Pell through the doorway, ensuring they're all right, while staying put. He could also ask Ixx about the history of the passage, but Bram is not one to be overly talkative during a tense moment.

I'll write a concise message that: 
- Acknowledges staying at the door, shield angled.
- Notes the breathing change, quietly to Ixx and Hrask.
- Reiterates he won't move.
- Maybe checks on Pell's positioning inside.

Let me craft the message.
````

### Screen 14 · player r11

````text
Through the gap in the hides you can see the light low by the child, Pell sitting along the wall with the healer's satchel set down beside him, and Tisk waiting by the fire.

Ixx's head turns at your low voice. He doesn't look at the passage, the same as before.

"He does not sleep much," Ixx says, just as low. He touches the doorpost with two claws, then the floor. "Stone carries. The old ones say the stone is his ear. When we talk loud by the warm passage, he breathes different." He lets out a thin breath through his nose. "Ixx thinks he listens. Ixx does not know. Ixx only knows he breathes different."

Hrask, beside you, doesn't need any of that translated. His spear stays upright, but his tail has curled round the doorpost.

Inside, Sefa crouches by the child under a goat hide with the mother, and between her knuckles the beads brighten, slowly and steadily, like a lamp wick turned up a notch. The thin shriek of the child's breathing drops to a soft wheeze, the sound of a child with a cold. The cough that had started breaks off.

Then Sefa sits back on her heels and talks with Tisk, and Ixx carries her words across a piece at a time. Part of it she pitches to carry: "That smell isn't a beast. Every book I've read that stood near dragonfire says smoke, musk, scorched meat. This is clean stone heated past what stone can bear — *called* fire. A bound elemental, a working on the Plane of Fire, something that eats heat. Its fumes are heavy; that's why they come in at the floor and the smoke-hole can't take them." She goes on about the deep door's lantern holding something that is running out, and about the Warm One with red scales who can't climb his own stair and wants tall hands to open it.

Tisk answers in clicks, and Ixx gives them in his own words: "Tisk hears. Sefa's hand. Sefa says the true thing and the bad thing together. Tisk likes this more than only the true thing." Then: "Does he know the flame dies. He knows. He lies by the door. When the flame was big he did not look at it. Now he looks every sleep. Long." And, after a long pause: "Under the door is the fire-not-fire. It wants nothing. Fire only eats. The Warm One is not under the door. The Warm One wants up. When Tisk already had eggs, the Warm One came down the stair. Small. Like a goat. Hungry. He followed the warm. Down is easy." From the way the old kobold's jaw sets, she means to stop there.

Out in the dome the passage breathes in.

You hear it first: claws on stone, fast, coming up the red passage. Skra comes out of the red glow at a run and crosses the dome with her sling wound tight on her wrist. She doesn't slow for the iron on the floor or for you at the doorpost. Hrask snaps one rasp at her as she goes past and she rasps back without stopping. Then she's through the gap in the hides and standing in the middle of the warren, sides heaving in Sefa's light. She speaks to the room, high and quick, and every kobold along the walls goes still again.

Ixx doesn't want to translate it. He looks at Tisk, and Tisk lifts her chin a finger's width.

"Skra brings his word," Ixx says. "The Warm One says…" His tail is around his ankle again. "'The tall ones talk long with the small ones. I am not small. The tall ones come now, or the tall ones go up, and the Broom goes with them.'" Skra rasps one more thing, and he adds, very quietly: "Skra says his breath was very hot when he said it."

Tisk doesn't move. Skra stands panting and stares at the beads in Sefa's fingers, then at Sefa, waiting to see which of the tall ones answers.

Where you are: at the warren's doorpost, facing the dome · Time: Day 1 · afternoon
````

**Player** (player r11):

````text
Bram hears Skra out, then meets it without raising his voice. He speaks so the whole warren hears him, not just Ixx.

"The Warm One wants us, he gets us. But we don't come down there running, with the Broom between us and his temper." He shifts his shield on his arm and steps back from the doorpost, just enough to gather his gear. "We'll go down in his time—now—but we go on our feet, not his summons."

He bends once, without hurrying, and takes up his sword belt and the javelins. He straps the longsword at his hip again, leaves it sheathed, and settles the javelin quiver across his back. The mail chimes once, low, and he's still careful about it.

Then he raises his chin toward Tisk.

"Old Tisk, we won't leave Pikk worse and we won't drag the Broom into a fight." He jerks his head toward the red passage. "Hrask and Skra brought us here; Ixx kept us alive on the stair. I'd have one of them at our back, not in front. Tell us what to step over, and we'll carry his answer ourselves."

He glances at Sefa and Pell.

"We go down now. Together. No one wanders from the path. Sefa, keep the light close; Pell, watch the walls and the floor-side shadows. Hrask, if you're coming, or any of your spear-kin, they'll be told we don't want their hides in front of him." He says it plain, then faces the passage.

"I'll take the red walk first. Let's see what's so old he can't climb his own stair."
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
The pressure's on. The Warm One just forced the moment. Bram's role here isn't to negotiate from the doorway or let Sefa absorb the whole weight; it's to read the room and decide the order of events before the kobolds get caught between two fires. He'll answer for the group: they'll go now, but not scattered or hurried. He'll take point down the red passage with Pell and Sefa, shield up. He'll collect his weapons—not drawn, but donned—because the Warm One's patience is thinner than the kobolds'. He should speak to Tisk too: her clan carried out the dead tall ones; she gets a say in whether the Broom leads them or stays. Short, hard sentences. A guard-tone. This is exactly the kind of turn he's built for.
````

### Screen 15 · player r12

````text
Sefa straightens up all the way, the beads still lit in her fingers, and she doesn't hurry. "Skra," she says, carefully. "Carry this back, in his own words if you can. *The tall ones come now. Slow, talking, as they came down the stair. They were tending a sick child, and his door was not going anywhere.*" A beat. "And tell him I heard the rest. I'll take it up with him, not with the Broom."

She bends to the mother and touches the small claw still clamped round a bead. "Keep him under the hide till the water's cool. Then the stair." Then she turns to old Tisk and Ixx and speaks too low for you to catch. She presses her free palm flat to the dusty floor and holds it up, grey, the way Tisk did.

Pell stands and shoulders his satchel. "I'm with you, Sefa. We hear him. Opening that door is a separate bargain." He gives Tisk a small nod and goes to the curtain. "Ixx, will you still show us the safe footing?" At the doorway he speaks quietly, for you alone: "He came down small and grew. The door holds something else—fire, with a failing light keeping it shut. He knows it's failing and wants out. We need to hear how opening it helps."

Skra hears you out with her sides still heaving, then turns her snout to Ixx. He passes your words on in clicks. He says them more quietly than you did and takes no longer over it than he has to.

You step back from the doorpost and bend for your gear. You take your time, and the kobolds watch all of it. The sword belt goes round your hips and the longsword stays in its scabbard. The javelin quiver goes across your back, and your mail chimes once, low. Hrask watches the hilt go back on your hip. Then he looks at your face. That's new.

Ixx carries your words to Tisk. The old one hears them to the end and answers in a few slow clicks.

"Tisk says: Bram says *not worse*. Tisk hears." Ixx looks to Hrask, because the rest was meant for him.

Hrask answers you himself, in one long rasp, without looking at the passage. He keeps his spear upright, and when he's done he plants its butt back on the stone by the doorpost, where it was before.

"Hrask stays," Ixx says. "The Warm One says *the Broom goes with them*. So Hrask stands at the hides, by the small ones." He hesitates. "Hrask says the tall one's sword goes down the warm passage, not Hrask's spear. Is fair."

Ixx gives Skra Sefa's message a piece at a time: *slow, talking… a sick child… his door was not going anywhere.* Skra's eyes go to the beads one last time. She clicks back what she's been told, quickly, to be sure she has it. Then she's gone through the gap in the hides and across the dark dome, and her claws fade off down the red passage.

Sefa works the bead out of Pikk's claw. He lets go with a small, cross wheeze, and he doesn't cough. His mother pulls the hide back over both their heads.

Sefa holds up her grey palm, and Tisk looks at it for a long moment. Then the old kobold leans forward on her blackened stick and presses her own dusty palm against it, flat, scale to skin. She holds it there longer than a greeting takes. While Ixx clicks something to her, her claws find the shells at her throat.

"Tisk says: Sefa's hand, Sefa's promise. Tisk remembers both." Ixx listens to more, and his tail goes round his ankle. "Tisk says one thing for the hot rooms. In the hot rooms, little fires walk. Small, like Pikk's mother. They are not *his*. They do not talk. They know the Broom." Tisk clicks again, dry and short. "Tall ones, Tisk does not know if they know. Do not stop by the red cracks. Do not put iron in the red cracks."

She lets go of Sefa's palm. By the look of her, she has said what she meant to say.

Out in the dome, Sefa takes her dagger off the bottom step and sheathes it. While you buckle up, she speaks low to you and Pell: "Here's what I've got. The smell is called fire, not dragonbreath — something bound or a working on the Plane of Fire, under the deep door. The lantern on that door is the same as mine, and it's been going out for Tisk's whole lifetime; the stair warms as it fades. The Warm One lies by the door watching the flame die. He came down this stair small, years ago, followed the heat, and grew. He *wants up*, and he's too big for his own stair now — so whatever he thinks is behind that door, he thinks it's a way out, or a way to become something that can leave." She looks at the red passage. "He's threatened to drive the kobolds out if we don't come. That tells me he needs us more than he wants us to know. We go and listen. Ixx walks first in the hot rooms — tread where he treads. Bram, light goes back on your shield, bright this time; I want to see the floor. Pell, keep your satchel open. And if it tells me the smell is its own breath, I'll know it's lying, and we'll have our answer about how much else it's told the truth of."

Pell picks up his things one at a time: the shortsword, both daggers, the bow and the quiver. The roll of oiled cloth goes back on his belt, and he checks it with his thumb as it goes. Every blade stays sheathed. The small door-holder watches from the gap in the hides with its hands still behind its back.

Sefa turns to the doorway, where Ixx stands half in and half out. "Ixx. Will you walk us down? If it's too much to ask, say so, and we'll follow Skra instead."

She lays two fingers on the inside of your shield rim, and this time the Light wakes full. It's bright and lamp-yellow, and it throws the dome's curve back at you: the soot ring, the swept paths, and the grey dust fan in front of the burned arch with its boot prints going in. The beads in her hand go dark, and she puts them back round her neck.

Ixx has his broom back. He comes out of the hides and stops in front of the three of you. He looks up at you, then at Sefa, then at Pell, in the order you asked him.

"Ixx walks." He doesn't say it gladly, but he doesn't take it back either. "Bram says kobolds not in front. Is good. Ixx does not want to be in front of him." He moves to your left side, half a step behind your elbow, where the shield will be between him and the passage. "Ixx walks here. Bram walks first. In the hot rooms the broom says where. Bram's foot, Ixx's broom. Pell's foot, Bram's foot. Sefa last."

You face the passage and say your piece about old things and stairs. You say it plainly, and the dome is quiet, so it carries. The breath coming up the passage stops for a moment. Then it comes out again at its old pace, a little warmer.

Ixx doesn't look at the passage, and he says nothing about it.

---

The red passage runs straight and slopes down. It's wide enough that the shield-light doesn't reach both walls at once. Within fifty feet it's hot enough that the mail on your shoulders feels like a stove lid. The walls were dressed stone once. Along both sides, at waist height, runs a channel cut into the rock and lined with bronze. The metal has gone green-black, and every so often it's pierced with a row of little holes, like a flute. Warm air whispers out of some of them. At one place the bronze has split along a seam, and the stone around the split is glazed and shiny, like the inside of a kiln.

The struck-flint smell gets stronger with every step, and now it clings to the back of your throat.

After about two hundred feet the passage levels out and opens up, and Ixx stops with his broom held across your knees.

"Hot rooms," he says.

It's a long hall, perhaps eighty feet to the far end, with square pillars down the middle holding up a low flat roof. The floor is laid in big flagstones, each about a stride across. Between them are gaps a finger wide, and under the gaps is a red light, as if the whole floor had been laid over coals. Most of the cracks just glow. Some of them breathe. As you watch, a line of cracks to the right of the pillars flushes bright orange and lets out a sigh of heat that blurs the air above it, with a scatter of sparks. Then it dims again. You count it the way you counted the passage, and it isn't regular. The left side of the hall is quieter, and the stones there are paler and less scorched. The swept path runs that way, a line of clean stones zigzagging between darker ones. Near the middle of the hall, off the path, a patch of flagstones has been blackened in a long smear, as though something burned there and was dragged away. Two shallow grooves run from it back toward the passage.

At the far end of the hall is an arch, and the light beyond it is a deeper red, slow and steady, like the passage's breath made visible.

Something moves in the cracks on the right.

You and Pell both catch it at the same moment. A thin crack between two of the breathing stones brightens, and something stands up out of it. It's knee-high and shaped like a man, a small hunched figure of embers with light running in its seams. It has no face, only two brighter spots where a face would be. It stays there, upright in the heat-shimmer about forty feet off, with the brighter spots turned toward your shield-light. Then it folds back down into the crack. The glow sinks with it, and the stones go dull.

Ixx's tail is round his ankle. He says nothing about the little fire. He sets the bristle end of his broom on the first clean stone of the swept path, just past your left boot.

"Here," he says. "Then the broom says next."

Where you are: edge of the hot rooms, at the first swept stone · Time: Day 1 · afternoon
````

**Player** (player r12):

````text
Bram doesn't flinch when the little fire stands up out of the floor. He watches it the way he'd watch a dog in the dark: not a threat yet, but not ignored.

"Right side is where the floor's breathing hardest," he says low. "We stay left on the swept path, tight to Ixx. Don't watch the bright cracks—watch where the next clean stone is." His voice is steady, but he has to work for it. The heat has a weight, and the air is like standing downwind of a forge with a bellows going.

He sets his boot exactly where the broom's bristles touch, then gives Ixx a nod. "Your floor, Ixx. Show us the next stone. And if one of those little fires comes out close, don't put yourself between it and me."
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
Hmm. Bram knows the end of this road is likely with the Warm One's breath. He should stare the heat down and move where Ixx puts his broom. This is a moment to voice what he sees plainly. It's okay if he prays silently. No reason to mention a caravan rite, but a memory of a forge-stall smoke-jumper might fit. He should also work the fear into his body language. Maybe he remembers a burning wagon detail—too much? Keep it small and real.
````

### Screen 16 · player r13

````text
Sefa stops at the mouth of the hall, her eyes following the bronze channels, the glazed seam, and the long black smear off the path with its two grooves running back toward the passage. She speaks low, just to you, Pell and Ixx: "Those channels aren't a dragon's work. Someone *built* this to carry heat. Bronze pipes, vents, a floor laid over coals. Ulcaster's people, or whoever came after. The hot rooms were a working before they were a lair." She looks at the smear. "And that's where the four died. Off the path, by the bright cracks. Then dragged out. Those are the grooves we saw on the stair."

She breathes in the flint-sharp air and grimaces. "Tisk said little fires walk here, small as Pikk's mother, and they know the Broom but may not know us. If something small and bright comes toward you, Bram, don't swing. Step back onto a clean stone and let it pass. No iron in the red cracks, nothing stopped over them. Ixx's broom, then your foot, then Pell's, then mine, exactly." To Ixx, gently: "You're doing well. Say the stone before Bram steps, not after."

Pell murmurs something to Sefa and loosens the flap of his satchel, settling it against his hip. He falls in behind you, and Sefa takes the last place, hem gathered up out of the heat.

Ixx doesn't look at the place where the little fire went down. At your words he moves the broom one stone forward and sets the bristles down.

"Ixx is not between," he says. "Ixx is behind." He thinks about it for a moment. "Behind is good."

Then the crossing starts, a stone at a time. Ixx calls each stone before you step on it, the way Sefa asked. "Here." The broom touches down and your boot follows, then Pell's, then Sefa's, each on the stone the last one just left. "Here." The path zigzags across the pale left side of the hall. Sometimes it runs two stones straight ahead, sometimes one stone sideways toward the wall. The flagstones are hot through your boot soles, like the floor beside a smithy's hearth. The air above the cracks shimmers, and every breath of it scrapes your throat.

About a third of the way across, Ixx says "Wait" instead of "Here."

You stop with your weight on your back foot. Two stones ahead, where the path crosses a seam running out from the right side, the seam goes orange from one end to the other. It lets out a sigh of heat that pushes against your face and throws sparks up past your shield rim. Then it dulls back to red. Ixx counts something under his breath in his own tongue.

"Now. Fast. Here, here."

The broom taps twice and you all cross the seam in two strides each, Sefa last. Behind her the seam is just a red line again.

Pell calls it before his next step: a second little fire. A crack off the path to the right, behind Sefa and well beyond the back of the light, brightens. Another little fire stands up out of it, knee-high, embers stacked into the shape of a hunched man. Out on the right side, about where the first one sank, the first one stands up again. Neither comes onto the path. They keep pace with the company stone by stone, each on its own line of cracks, staying out where Sefa's light gives way to red. When Sefa stops, the one behind her stops. When she steps, it steps. Once it drifts closer to her and stops where the shield light thins to dim, and goes no further. It sways there, its two bright spots turned on her.

Ixx sees it too. Without a word he lifts the broom off the floor and tucks the whole bristle end behind his back, pole and all, the way a man tucks a full purse behind him in a crowd.

"They like broom," he says, very quietly. "Ixx likes broom more."

Halfway across, the path brings you level with the long black smear. Up close, you read it the way you'd read the ground after a wagon fight. The blackening is worst at one end and thins out toward the other. Something burned right there, and then it was dragged away while it was still burning: the twin grooves start at the thin end and run back toward the passage. Past the dark end, about fifteen feet off the path, a short bar of dark iron stands upright in a crack. It's as long as a man's forearm, with a flattened head like a mason's chisel, driven or wedged in hard. The crack around it is the brightest on that side of the hall, white-orange rather than red, and the bottom half of the bar has gone cherry-red with heat. Nobody in your company has put iron in that crack. Someone else left it. The little fire on the right sank back into the floor a few stones from it.

Ixx won't look at the bar. "Here," he says, and the path bends away from it toward the wall.

The rest of the way is the same work: the broom taps, your boot comes down, Ixx says "wait" once more and you wait. As the far end comes closer, both little fires fold down into their cracks, first the one on the right and then the one behind Sefa, and the floor goes back to being just a floor over coals. Ixx brings out his broom again and checks the bristles with one claw. None of them are scorched.

The arch at the far end is broad and low, built of the same dressed stone. Beyond it, the deep, steady red light swells and fades with the breath that has come past you all afternoon. Here it's so close that you feel each draw as a faint pull on your clothes and each letting-go as heat on your face. Ixx stops one stone short of the arch, behind your elbow, his tail wrapped round his ankle.

The breath stops.

Then a voice comes out of the red. It's deep enough that you feel it in your shield arm before you hear it, and slow, and in good, old-fashioned Common.

"The one who wonders what is so old it cannot climb its own stair." It pauses, and in the pause the heat leans on you. "Come and see, then, little shield. And bring the lamp nearer. I want to look at it."

Where you are: far end of the hot hall, one stone short of the low arch · Time: Day 1 · afternoon
````

**Player** (player r13):

````text
Bram doesn't answer the voice right away. He rolls his shoulders once, loosening them under the mail, and glances back at Ixx, then at Sefa and Pell, making sure they're all still on their feet and at their places.

"Steady," he says quietly, more to the company than to the voice. "It's older than it is subtle. It heard every word we said on the stair. We give it truth, not a show."

Then he steps through the arch with his shield up and the lamp-light spreading before him, not crowding the threshold. He keeps his sword hand easy at his belt, away from the hilt.

"I'm Bram Halloway." His voice carries clear through the heat. "We came down your stair talking, not with night-quiet and iron. The lamp's not mine to offer—she who holds it speaks for it. But it's here."

He stops where the floor lets him see the shape of the thing: what it lies on, how it fills the room, where its head is, whether it moves to breathe or the room moves with it.

"You asked us to come see. We're here. Now I'll ask what you wanted us to see—the door, or you. And what you'd have us do about either."
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
Hmm, we're at the threshold of the Warm One's chamber. It just addressed Bram directly by referencing his earlier line, so it was listening. The party needs to enter and face this ancient, dragon-like creature. I'll have Bram step through carefully, keeping the shield up and the light on it bright as requested.

I need to establish Bram's mindset. He's a veteran guard, so he'll stay composed and watchful. His focus will be on protecting the group and assessing the situation rather than being intimidated. I'll describe the scene as he enters, taking it all in.

The Warm One seems to want to see the lamp, likely because it's failing and it's curious. Bram sees an opportunity here—he can use the lamp as a bargaining chip. He'll keep his answer direct, then ask the creature what it wants with them and the door. This will keep the negotiation moving forward.
````

### Screen 17 · player r14

````text
Before you move, you check behind you. Ixx is at his place, and Sefa and Pell are both on their feet.

You step through the arch, and the shield-light goes through with you.

The room beyond is big, the biggest thing you've seen under the hill. It's round, about sixty feet across, with a dome high enough to lose the shield-light in. The floor is dressed stone and it's whole here, with no cracks between the flags. It's hot, steady and dry, the way the air over a hearth is hot. The arch you came through is worn smooth on both sides at the height of a horse's shoulder, polished pale. Something big has rubbed past it many times.

The red light comes from the far wall, from a ring.

A channel runs around a round slab set into the wall, about twelve feet across. It's a door made of pale stone, banded with bronze gone black. The channel glows the same coal-red as the cracks in the hot rooms, and it breathes. Above the door the tower is cut into the stone, Ulcaster's stepped crown, sharper than the one on the lintel. In the middle of the slab is the lantern, hooded, with a ring for a handle, the same as at the mouth. In its heart, where the carving would hold a flame, a small light burns. It is lamp-yellow and no bigger than one of Sefa's beads. It doesn't flicker. On the bronze rim, low on the left, a bright scar shows where something has been cut away, leaving pale stone under the black.

Between the arch and the door lies the Warm One.

You do what you came in to do and read the shape. It's your trade, the same as judging a team at a distance. The dragon lies along the floor in a long curve, with his tail toward the right-hand wall and well clear of the arch. His body is as thick as a loaded cart and longer than a wagon with its team. Under him there's a bed of metal: coins, the rim of a cup, a bent candlestick, old gold pressed flat under his weight. His head rests on his crossed forelegs a few strides from the door, turned toward that small yellow flame, and it's the size of a rain barrel. His wings are folded tight along his back. Their edges are ragged and dull, rubbed thin, the way a sail goes when it's been stowed wet too long. The scales should be red, and they are, the deep red of a forge coal, but they're dusty and dry, gone pale round the nostrils and along the jaw. His flanks rise slowly. You count the rise against the warm pull on your clothes. The breath of this whole ruin, the one that's been coming up past you since the grass at the mouth, matches the dragon's breathing exactly.

The head lifts and turns. The eyes are pale gold. They go first to the shield-light and stay there for a long moment. Then, without the head moving, they slide past it to the yellow bead in the door, and they stay on that even longer. Then they come back to you.

"Bram Halloway." He says the name the way a man turns a coin over to read its date. "*Truth, not a show.* You said that at my threshold, as if the stone between us were deaf." His breath stops. In the stillness the heat presses on all of you, on the face and the chest. Then it comes out again, slow and warmer. "Then have it. You wondered what is so old it cannot climb its own stair. I am not old, little man. I have had twenty winters in this house. I came down that stair on my own feet when I was smaller than your shield. I stay because what I want is here."

His snout tips a hand's width toward the door.

"That is what I wanted you to see. Your wizards shut it, and their light keeps it shut, and their light is going out. You have eyes. What I would have you do about it I will tell you when I know what you are worth."

Sefa comes to your shoulder and stops in the arch itself, under its worn stones, beside the shield, not past it. She keeps the light on the rim. Her voice is the ward voice, unhurried, pitched to carry into the red without rising: "The lamp stays where it is. It's lighting the floor, and I've been told not to stop over the cracks. You can look at it from there as well as I can look at you. I'm Sefa Marrin. Bram you've heard. The quiet one is Pell. We came down talking, as your kobold asked us to, and we tended a child on the way, because he was coughing on what comes up out of your floor." A beat. "Which is not your breath. I know what dragonfire smells like from the books, and this isn't it. This is called fire — a working. So before you tell me anything, I'd like to hear you say that much true, and then I'll believe the rest of it more easily."

She tips her head back toward the hall without looking away. "And there's an iron bar standing in the brightest crack out there, by the place the four died. Tisk's people won't look at it. I'd like to know who put it in — them, or you."

Then, low, barely moving her lips, to you and Pell: "He speaks like someone who learned Common from a book, not a kobold. Educated. Let him come to the arch; we don't cross it till we've seen the shape of him." Her hand rests on the Book of Shadows at her belt, and her thumb finds the beads at her throat.

The gold eyes move to her at *the lamp stays where it is*, and the pause after it is long.

"Then I will look from here." He does, and not at the lamp. He looks past it at the door again, and then at her. "*Called fire. A working.* You read well, for a sick-house girl." A low sound moves through the floor. It could be amusement. "Yes. That is the house you smell, not me. If you ever smell my breath, you will not be standing to discuss it."

At the iron bar the long head settles back onto the forelegs.

"Your kind put it there. Four of them, by night, with cold iron, cutting at the house's veins to get at my door. The house answered them." The eyes half close. "Had I answered them, the Broom would have found nothing to carry up."

Behind you, Ixx stops at the arch and sets his broom-tip on the first flag inside.

"Here floor is floor," he whispers. "Not near the ring. Not near the shine." Then he stays exactly where he is, one stone back, with his tail round his ankle.

Pell steps through after your boots, keeping his hands clear of his weapons. "Pell Dunmore," he says into the red. "We've come to hear about your door." He moves just inside the arch on the left, where the wall curves out into a stub of old pillar. It's the farthest point in the room from the tail, the arch two strides from it, with room there for three standing close.

"Pell Dunmore," the Warm One repeats, without looking at him. "The quiet one, who came to *hear about my door*." The gold eyes stay on you. "Well. You came down talking. Talk. What does the man with the shield want for the use of his hands?"

*(Out of game: you are one stride inside the chamber, and Sefa stands in the arch beside your shield, not yet over the threshold. No dice were needed this round.)*

Where you are: one stride inside the dragon's chamber · Time: Day 1 · afternoon
````

**Player** (player r14):

````text
Bram meets the gold eyes and doesn't step any closer.

"My hands aren't for sale until I know what they're buying." His voice stays level, the same tone he'd use to price a run through bandit country. "You've shown me a door and a failing light. That's a problem, not a bargain."

He plants the shield a little more solidly against the heat.

"What I want, in order:

"First, I want the Broom out of this without your heel on them. Ixx brought us down in daylight with straight answers, and your own word got flung at them because we stopped to tend a sick child. I don't work for anyone who treats good service with a threat. So I'll have that said plainly: they stay, and we don't find them worse after we leave.

"Second, I'll want to know what's behind that door, as true as you know it. Not the name, if you don't have it. But what it is, what it does when it's open, and whether the thing that's failing is meant to hold it or let it loose. Because I read the floor too. That heat under the cracks is no natural coal. It'll bite, and it'll take the one who steps wrong.

"Third, my price. You can think on that while I look at the door and hear the rest of what you know. I don't work on a 'may it be enough' promise, and I don't open old seals for old gold alone.

"Last, I want this company to have free passage back up the stair while I think, with our own feet and our own steel, and no clever floor between us and the sky."

He pauses, then adds, not unkindly: "You want hands that won't fail you at the wrong moment. That means you want the one that asks all this. We came down talking. Let's keep doing it."
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
We need answer dragon. Bram's turn. Need stay in character. We know Sefa asked true things, dragon answered partially. Dragon asks Bram: "What does the man with the shield want for the use of his hands?" Bram should speak directly, honest, not too long. He doesn't commit to opening door. Need ask conditions, what behind door, what he offers, and maybe mention truth/trust. Since dragon values truth not show. Bram is practical guard: wants know pay, risk, what's behind. Could maybe say "I don't sell my hands blind. Show me the door and tell me what opening it lets in or out, and what's in the pay, and I'll tell you my price." Also maybe address that he knows the house is failing, that fire elementals. Bram can demonstrate he knows something: Right side of hall, iron chisel, four men fried. He might say "You aren't the warm in the floor; the house burned them. If I work on that door, I'll want to know if opening it frees the fire under the floor or keeps it in." Bram perhaps asks what killed the four to ensure no hidden threat. But must avoid too many questions? Dragon asked one; response can be negotiation.

Need also maybe refer to Ixx's safety and clan not driven out. Bram can say "If you threaten to cast the Broom out because we spoke with them, then the bargain starts with them safe." That shows alignment. But careful not moralize too long. Maybe: "The kobolds did exactly what you asked and didn't deserve the threat." Could insert.

Need produce message as Bram. Use "I want..." direct. We should not call him Warm One? Could call "Warm One" or "dragon" maybe. He hasn't given name. Use respectful but not groveling. Bram doesn't need to bow. He can say "The Warm One" perhaps. "You know my trade. I've guarded wagons and held doors. My hands aren't for free."

We need not roll. We should include actions? Bram stands with shield, doesn't step closer. Maintains eye contact. Could set terms: he wants to see door up close before agreeing, and to know two things: what opening it frees, and what guarantee the Broom and company leave safely if work goes wrong. Also perhaps ask if the dragon can pay or will just eat them later. Use "I've taken jobs from dangerous men; dangerous isn't insult, dishonesty is." Nice.

Let's craft message. Since no out of game needed. Use dialogue and small stage. Keep concise.
````

### Screen 18 · player r15

````text
Beside you, Sefa keeps her hand on the Book and her eyes on the gold ones. She doesn't step over the threshold.

"Bram will tell you what he wants for his hands. I'll tell you what mine cost, and it isn't gold. You've answered me straight twice — about the fire, and about the four. So I'll ask the third thing straight. You came down a stair smaller than a shield, following the warm, twenty winters ago. You've grown to fill the house. Now you lie here watching the wizards' light die on that door, and you say *what I want is here*." A beat. "What's behind it? Not 'the fire-not-fire' — Tisk gave me that much. What do you think is on the other side that's worth twenty years on a bed of other men's cups, and what do you become when it opens?"

Her thumb moves on her beads. "Because here's what I see from the arch. The lintel upstairs says *by lent light*. That flame in the lantern is the same colour as the one in my hands, and it's been going out all Tisk's life, and the floor breathes hotter every year it fades. That isn't a lock, Warm One. That's a *lid*. Somebody lent a light to hold a fire down, and the loan is running out. If that door opens, I don't think what comes through is a way up for you. I think it's the house, getting out."

She tips her head at the bronze rim, low on the left, where pale stone shows through the black. "And someone has already cut a piece off it. Was that the four, or was that you, in a year when you were less patient?"

Low, to you and Pell, barely moving her lips: "He hasn't said what the door *does*. He's said what he wants. Don't promise hands until he tells us which way it opens."

Pell stays by the pillar, hands relaxed and empty. "Bram names his own price. I deal in locks — but I need to know what the job is before I can price mine." He glances toward the pale scar on the bronze rim without moving closer. "Do you want that door opened, or its workings repaired? What's behind it that you want — and what was cut from the rim there? No tools on the stone until we've agreed. Looking first costs you nothing."

The Warm One hears your list to the end without moving. When you say *threat*, the gold eyes narrow, and they stay narrowed until you have finished.

"In order, then, since you like it that way."

"The Broom. I said they would go up with you, and so they would. A broom goes where it is carried." The sound that moves through the floor might be a laugh. "I do not break my own brooms, Bram Halloway. Who would sweep? Have it plainly, then. They stay. When you go, you will find them as you found them, sweeping."

Behind your elbow, Ixx's tail tightens once around your ankle.

"Your passage. Go up whenever you please." The great head doesn't move. "Nobody going up that stair has ever been stopped."

Then Sefa speaks, and he turns his eyes to her. At *a bed of other men's cups* his breath stops. The heat leans on all of you and keeps leaning, longer than it has before, until it presses on the chest like a hand. Along his flank the tail shifts on the hoard, and a slide of old coin runs off the bed and rings across the stone. Then he breathes out, slow and warmer.

"*Other men's cups.*" He gives it back to her softly. "Every cup in this room belonged to a dead man before it belonged to me, sick-house girl. That is what gold is."

"What lies behind it. The fire your wizards caught and could never put down, and the thing they caught it with: a book bound in iron. The four talked about it on my floor, loudly, as though I were furniture. They wanted the book. I have no use for paper." The eyes half close. "And what do I become? What I am."

"A lid. Yes. You read well." For a moment he is quiet. "Think what happens under a lid that is lifted. The fire rushes out, burns, and when it has nothing left to eat it is less than it was. Now think what happens under a lid that cracks by itself, slowly, a little more every year." He lets the hot rooms answer for him. Out beyond the arch a seam sighs orange and goes dull. "You have felt that floor. When it comes, it will not trouble me. You will be up the stair long before it reaches the hot rooms. I would see to that. Dead hands are no use to me twice."

His snout tips toward the pale scar on the bronze rim.

"The four did that. They had a cold-iron tool and a thief's patience. They cut at the rim, and I let them, because I wanted to see what the door would do." The gold eyes go to the yellow bead in the lantern. "The light jumped when the iron bit. They ran as though it had bitten them back, and they took the piece with them. The house caught them on the floor. When the Broom carried them up, nobody had it. They put it down somewhere between my door and the stair."

He turns to the pillar, and to Pell.

"Opened, little lock. Not mended. You mend what you mean to keep."

The long head comes up off the forelegs then, high enough that your shield-light finally reaches his throat. The scales there are as dull as old brick.

"My price, then, since you asked for yours in order. Open it, and each of you takes from this bed as much as you can carry in two arms, and the iron book goes with you." His breath stops again, briefly. "But tall ones have shown me their backs before. So one of you stays here beside me while the other two go and find what was cut from my door."

The gold eyes come back to you and stay on you.

"The man with the shield. At the mouth of my passage you said *I'll take the red walk first.* You are the one who stands where the trouble will come. So come and stand here."

*(Out of game: nobody needed a die. All three of you asked your questions aloud, and he answered them. Whether he told the truth is something the story will show.)*

Where you are: the Warm One's hoard chamber, before the sealed door · Time: Day 1 · afternoon
````

**Player** (player r15):

````text
Bram doesn't move from his one stride inside the room, but he doesn't flinch either. The shield stays up, the lamp-light throwing his shadow long toward the sealed door.

"Here's my difficulty," he says after the dragon's last word. "You want me to stand where the trouble will come, off the path, beside a lid that's been cracking for years, while the other two go looking for a piece of cold iron and a book. That doesn't sound like a bargain. It sounds like the four who ran and got caught—except you'd be holding their shieldman when the floor gets hungry."

He shakes his head slowly, the mail shifting with the breath still pressing the room.

"I don't send my people out without me, and I don't stand at the seal with my back to it while you and the fire decide who's worth more. So here's my counter-offer, and it's the one I'll keep."

He counts it on his left hand, two fingers, shield bound to his arm.

"One: the piece from the door gets found before anyone touches that slab. I'll search for it, or Pell will, or the Broom's kin who know the hot rooms better than we do—but it gets found and brought into this room, where we all see it. If it touches that ring or the door, we stop, and we talk again.

"Two: nobody stays beside you as surety. We all stay outside the arch, or all inside where you can see us, but always the three of us together. If we need to cross the hot rooms, we go and come back by the same swept path. You want hands? You get hands that trust each other, not a man left waiting like a hostage.

"Three: the iron book goes to the door before any of us begins. I'll not send someone six steps down a wizard's vault with no more than a promise about what they'll find. You say you have no use for paper—then show us the book, or show us your word that it's there. If the door opening is part of the work, we'll see it before the first pry."

He lets his hand drop to his belt. His stare stays level with the gold eyes.

"I don't doubt you know this house better than any man alive. But I'll walk out of it the same way I came: with my people, and my shield, and my own word for the price."

Then, very quietly to Sefa and Pell, but pitched so the dragon hears: "Say no, and we go up. The Broom comes with us. I don't want to leave Pikk to a hotter floor."
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
Hmm. The dragon just put Bram in a difficult spot with that offer. He is asking Bram to stay behind alone as collateral while the others look for the missing door piece. That's a bad deal, and Bram knows it. He has been reading the ground and the tension all along.

I need to decide what Bram hears here that matters. The dragon said the book is behind the door, bound in iron. A cold-iron tool piece cut off the rim and is now somewhere between the door and the stair. It might be important, but Bram isn't a scholar.

My strongest move is to use Bram's road instincts, not lore. He should focus on the practical trap in the deal: if the door opens and the fire comes out, the one left beside the door is the first one dead. The dragon's only promise is to help them leave, but Bram does not want to stake lives on a promise.

I'll have him refuse to be collateral, but not by saying no. He'll present his own terms: nobody stays alone beside a failing seal. They'll set a watch, they'll work with the heat and the fire. He wants the Broom to help with the search, because they know the hot rooms better than anyone. And he wants the piece from the door in hand before anyone touches the seal, because it might change how the door opens. He will not put the company in pieces.

That shows Bram as a protector and calm negotiator. It keeps his agency and avoids splitting the group, which is rarely a good idea in an adventure. It also uses the knowledge he's acquired and respects the kobolds.

I should keep his tone level but resolute, like a man used to haggling with dangerous parties. He will not be provoked, and he won't bargain without a plan. In a D&D game, this is a good roleplay move, showing he is not just a sword-arm.
````

### Screen 19 · player r16

````text
Sefa lets the coin finish ringing across the floor before she speaks. She hasn't moved off the threshold, and her hand hasn't left the Book.

"No hostage. Not Bram, not Pell, not me." She says it quietly, without heat. "You've just told me what a cracked lid does to this house, and in the same breath that *dead hands are no use to you twice*. Those are the words of someone counting how many of us he needs alive. I'm not leaving one of us on your bed to make the arithmetic easier." She glances at you. "It's your name he called. But I'd not go, and I'd not let a sister go, if that's worth anything."

"Here's what I'll offer instead, and it's more than you asked. The piece lies between your door and the stair. Ixx's people know every stone of that path, and we'll have it found before dark. That part we'll do, because a cut rim is a cracked lid whether anyone ever opens it or not." A breath. "But the opening, that I haven't agreed to, and I'll tell you why to your face. A man with a cold-iron chisel bit that rim and *the light jumped*. You've lain three strides from that door for twenty winters with claws that could shear the bronze, and you've never once put them on it. You need tall hands because the door won't let *you* near it. Say I'm wrong."

She tips her head at the little yellow bead. "And you still haven't told me what you become. *What I am* is a riddle, not an answer. A red wyrm that fire can't trouble, sitting in a house that's about to burn its way up to the grass. I can guess what that looks like from Beregost."

Then, more carefully: "Let me go to the door. Alone, no iron, no tools, the lamp stays on the shield. I can read what's written on it, all of it, whatever hand it's in, and the light in that lantern is the same colour as the one that answered me in the dark. I'd like to see what it does when I stand in front of it. I think you'd like to see that too. If the four's words are to be believed, there's an iron book on the other side that *caught* this fire once. You want it gone. I want to know whether it can do the catching again, because *mend* is the only word in this room that keeps the Broom alive."

Low, barely moving her lips, to you and Pell: "He can't touch it. That's the whole of why we're here. Pell, while he's looking at me, look at the scar on the rim and the floor between here and the arch; the piece is small enough that a dying man dropped it. Bram, you don't answer him about standing anywhere until I've seen that door."

Pell speaks in a businesslike voice: "I can look for the missing piece. That isn't a promise to open the door. But not with Bram held as surety. You've just offered us free passage; let that stand. We came down willingly, and Ixx can guide us back willingly. If your offer is worth taking, you don't need a hostage." He glances at the scar again. "Before anyone moves: why do you need the cut piece for opening it? Does it carry part of the mechanism, or writing you need read?"

Quietly, to you and Sefa: "I'd recover it and learn what it does. No pledge beyond that, and I'd keep us together."

The Warm One hears all of it without moving. His gold eyes go from one speaker to the next, and only his breath changes. While you talk it stays slow. At *the four who ran and got caught* it stops, then starts again.

At Sefa's *say I'm wrong*, it stops and doesn't start again.

The heat builds in the silence. It presses on your face, then your chest, then the backs of your eyes, until your mail is hot through its padding. Then, for the first time since you came in, the dragon gets up.

He takes his time over it. His forelegs straighten and his head rises above the light and keeps rising, past your height and past the top of the arch, until the shield-light only reaches his chest. His folded wings shift along his back with a sound like old canvas, and his tail drags across the hoard. Cups and coins go sliding and ringing over the stone, and a bent candlestick rolls nearly to Pell's boots. Inside the throat above you, behind the dull brick-red scales, a light shows. It's a slow orange glow that rises up the length of his neck like a coal being blown on, and it reaches the hinge of his jaw.

Ixx, one stone back, makes a small sound and folds himself down behind your leg with his broom flat on the floor.

The glow sits at the dragon's jaw for one long breath, and then it sinks back down his throat and goes out. He lowers himself again, without hurry, until his head is level with you a few strides away. He breathes out, and the breath is very hot.

"*Say I'm wrong.*" He gives it back to Sefa quietly. "I said you read well, sick-house girl. Read the door, then. Do not read me." He doesn't say she's wrong.

He turns to you.

"Your three things. Keep your three together. I can watch three as easily as one, and I am tired of hearing about the floor." His eyes narrow. "The book is behind the door, little shield. That is what a door is for. You will see it when it opens and not before, and no wish of yours changes that."

"The Broom." The word comes out low, from deep in his chest. "I told you they stay. They are mine. You will not carry my brooms up my stair because you are sorry for a coughing egg." The gold eyes hold yours. "Go up when you like. Go up with nothing, and you go up as you came. Go up with what is mine, and you will find out what that stair has never stopped."

Then, to Pell by the pillar, almost lazily: "*Why do you need the cut piece.* It was cut from a lock, little lock. You tell me what a piece of a lock is good for." He doesn't explain further.

He turns back to Sefa, and then he moves.

He swings his great head aside, to the left and down, and lays his jaw on the stone along the line of his own foreleg. That opens a lane of bare floor from the threshold straight to the pale round door. It's about fifteen strides long and a little wider than a cart. Along its whole left side lies the dragon's head, close enough to touch, and his half-closed eye follows the lane. Beyond the end of the lane the coal-red ring breathes around the slab, and in the carved lantern the yellow bead burns steadily.

"*Let me go to the door. Alone.*" His voice is soft now. "That is the first wise thing a tall one has said in my house. Go and stand in front of it, and show me what it does when it sees you." His breath goes out, slow and even. "Then we will talk about mending, if you still want to."

Behind your leg, Ixx says something too quiet for the dragon to catch, and maybe meant for nobody: "Not near the ring." His tail is wound twice around his ankle.

The lane lies open in front of Sefa, and she's still on the threshold.

Where you are: one stride inside the dragon's chamber, shield up, Ixx behind his leg · Time: Day 1 · afternoon
````

**Player** (player r16):

````text
Bram doesn't step into the lane. He turns his head just enough to catch Sefa's eye, then looks toward the door, then back to her.

"Fifteen strides, no tools, no iron, lamp stays with me." He says it like a road order, calm and final. "You go no further than the first bronze band. If the light in that lantern so much as flickers, you step back the same way—no turning your back on it, no jumping. Keep your hands where we can see them."

He plants his shield edge on the stone and shifts his weight forward just enough that the dragon can see he's ready, though his sword stays sheathed.

"Pell—watch the ring, not her back. I'll watch his jaw and the lane. If the floor breathes wrong, I call and we all move. Back to the arch, then the hot path exactly as Ixx showed us."

Then he looks up at the great head lying along the lane.

"She goes alone, as you asked. Not because you asked—because she's earned the right to read a wizard's door before a soldier puts his hands on it." His voice is low and measured. "But make no play at her while she's on that floor. I've seen a tethered ox take a man's arm off for less than a twitch at his hand." He pauses. "And I'm not tethered."
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
Hmm. Bram's player has been playing him as prudent, direct, and deeply protective of his companions. The situation now is extremely dangerous: a fire dragon (or dragon-like creature) has opened a path for Sefa to approach the door and likely read or interact with it. Given Sefa's player has indicated she wants to go to the door, but I (Bram) need to decide whether to support this, and what preparations to make.

Bram's likely thoughts:
- He trusts Sefa's judgment and learning. She has consistently been the one to reveal the magical aspects.
- The dragon has not promised safety; the floor is dangerous; this could be a trap.
- However, the dragon has been sufficiently goaded by Sefa's courage and is allowing her to approach. Refusing now might lead to their deaths anyway. Better to let her do this, but with all caution.
- Bram would stand in the archway, where he can see her and the dragon, shield ready to impose disadvantage if the dragon attacks. He can also provide a clear route back.
- He should warn Sefa: no touching the door with iron, no stepping over cracks, and if anything shifts, she's to come back. He'd likely tell Pell to be ready to move.
- He should also tell the dragon something gruff to establish he's not fooled—maybe about the heat and bait: a wagon guard's blunt wisdom.

I need to write this in Bram's voice, clipped, practical, but not overly sentimental. He can allow Sefa to go alone, but he won't like it. He'll call out a clear contingency. He may also plant his feet and fix his eye on the dragon, readying his reaction for Protection if the dragon lunges.

Given his actions, he may want no roll unless needed. But the GM might call for a check if necessary; Bram's player just narrates his response.

I should compose what Bram says or does now, in character, directly, as if at the table. I'll avoid out-of-game reasoning or recommendations to other players.
````

### Screen 20 · player r17

````text
Sefa looks down the lane: fifteen strides of bare stone, the dragon's jaw lying the length of it, the half-closed gold eye at her elbow, the little yellow bead burning steady at the far end. She unbuckles the dagger from her belt and holds it out to you hilt first, without looking away from the door.

"Hold this. I said no iron, and I meant it for his door as much as for Hrask's small ones." Quietly, for you and Pell: "If the light does something I don't like, I've a step that can carry me back to this arch faster than anything in this room can turn its head. Don't come after me. Watch the floor between here and the hall. Pell, you heard him: a *piece of a lock*. It was cut from the rim, it's small, and four frightened men dropped it running. The light jumped when iron bit the door. Mind that." She glances at Ixx, folded behind your leg. "And don't let Ixx go back across that hall alone."

The dagger lies on the threshold stone at your boot.

At the pillar, Pell leaves the candlestick where it rolled and keeps his hands empty. He stays where he is, well clear of the hoard, and studies the rim of the door from there.

Your orders are short, and the room is quiet enough that they carry. The gold eye on the lane doesn't leave Sefa while you give them. When you turn to the great head and say *tethered ox*, the dragon's breath stops.

This time it stays stopped. The heat in the chamber gathers and holds. The coins under the near foreleg tick and settle as the claws flex into them, slowly, the way a man's fingers close on a table edge. You are watching the jaw, as you said you would, and you see the lips draw back a finger's width off teeth as long as your hand. Then they close again.

"*I'm not tethered,*" the Warm One says quietly. He doesn't turn his head. "No. You are not." The breath comes out, long and very hot, and that's all he answers. His eye goes back to the woman at the head of the lane. You have seen this on the road. A man who has a better use for the next minute puts a quarrel in his pocket. He doesn't throw it away.

Sefa steps off the threshold onto bare stone. As she passes his jaw she says to him: "I'll read the door. Don't mistake me, though. I've already read enough of you to know you'd burn the Broom to keep them, and call it owning. I'll remember that when we talk about mending." The eye half closes and doesn't open again until she has gone three strides on. He lets that one go into the same pocket.

She walks the lane slowly, hands open and a little away from her sides, his head and then his neck lying along her left the whole way. Two paces short of the slab she stops in the red breath of the ring and stands a long while looking at the door. She doesn't touch it. Then she looks at the flame in the carved lantern, a steady bead of yellow the same lamp-colour as the light on your shield. She lifts her right hand and turns the palm toward it, a hand's width short of the stone, and says nothing.

The flame leans.

It leans toward her palm the way a candle leans toward an opened door. For the length of a breath it is bigger than a bead, and the coal-red ring around the slab misses a breath. It stays dull where it should brighten. Then it comes back.

The Warm One's breath stops again. The sound that comes through the floor this time isn't amusement.

He lifts his head off the stone and keeps it low, level with Sefa and very close to her.

"It knows you," he says. He says it softly, and he means it. "Twenty winters I have lain here, and it has never once leaned for me."

He lets that sit.

"You read the gap, sick-house girl. I read the band before the little thieves cut it. I read it every sleep for twenty winters, until I could say it with my eyes shut. I know what stood there." The gold eye is a stride from her face. "The name your Lantern was called by the ones who borrowed from it, long before it came to a dark ward. And what they promised it, the size of the lending, which is the size of what you owe. Open my door, and I will give you both."

The flame in the lantern flares.

It doesn't lean this time. It *flares*, white-gold and sudden. It throws the carved hood's shadow huge across the slab and lights the dragon's dull scales. It lights you at the arch, and Pell at his pillar, and Ixx pressed flat behind your boot with his snout on the stone. For an instant the whole room is lit in white-gold.

Then the flame is a bead again. The ring breathes red. The Warm One hasn't moved, and his eye hasn't left Sefa's face.

"Well?" he says.

Where you are: at the arch threshold of the dragon's chamber · Time: Day 1 · afternoon
````

**Player** (player r17):

````text
Bram doesn't move when the flare fills the room, though his shield comes up a few inches by reflex. He watches the flame die back to a bead, and then he steps forward one pace—not into the lane, just into the room, making sure the dragon can see him clearly again.

"Sefa," he says, calm, like calling a horse in a storm. "Come back to the arch. Nice and slow."

Then, to the Warm One, his voice hard but not raised:

"You lay that in front of her like a sugar lump on a mousetrap. We haven't agreed to open anything. And you keep saying *open my door* as if the only thing between us and that sky is a hinge." His grip on the shield stays loose. "If that light flared on its own, then it knows the word you almost spoke. You'd have killed half the room just to see whether it would."

He lets that hang, then jerks his chin toward the door.

"Your price is information. Fine. But we're not at the door yet, not while we don't know what's behind it, and not while the piece of rim is still lying somewhere in your house. Sefa reads. Pell searches. I stand. That's the work we do." He glances back at Pell, just once, as if checking he's still there, then back.

"Show me the lantern's true face. Not a flare—prove you want this thing opened slow and not by the first fool with a crowbar. Then we find your cut piece together, and you stop bidding for my people's debts like they're coins."
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
Hmm, this is intense. Bram just got a huge reveal—Sefa's Lantern is tied to this ancient wizard door, and the dragon is offering the name of her debt in exchange for opening it. The whole room just went white-gold.

Bram is a simple caravan guard. But the outline says he gets back up, hits hard, knows people. He's a practical man thrown into something out of legend. This could be his moment.

The note says he has the Fighter's Champion archetype, but I don't want to default to just brute guarding. He has 38 years of life. He's had twenty years of seeing what bargains do to people. He's realistic, but he has a code. The right move here is to be the steady anchor. To refuse to be rushed by the flare. To keep the power balance from shifting entirely to the dragon.

The dragon just made an offer that could put Sefa in traction. Sefa is vulnerable here. The dragon is probing, testing her desire to know her debt. Bram's greatest value as a shield-man is to defend the person beside him, in every sense. Not just with steel, but with a clear head.

The dragon didn't say he'd open the door. He said "Open my door, and I will give you both." That's a price tag. It's not a deal for the group; it's a temptation aimed at the weakest point. Bram's job is to make sure that doesn't happen unilaterally.

He wouldn't pick a fight. His aim should be to break the spell of silence, refocus the room, and prevent a quick emotional decision. He's not afraid of the dragon, but he's not stupid.

The dragon called her "sick-house girl." If Bram shows disrespect back, the dragon will escalate. So he must be respectful in tone, but not deferential. The dragon respects Bram's willingness to stand where the trouble comes. He called him "little shield" and "man with the shield." That's a form of respect. Bram can use this.

He should interject before Sefa can be pressured into responding. He can turn the focus back to the job: the book, the stop, the deal. The flare proves the light in the lantern is fully aware. That makes the stakes higher, but also makes a hasty promise more dangerous.
````

### Screen 21 · player r18

````text
Sefa lowers her hand, slowly, and takes one pace back from the slab. It is exactly one, the way you told her, and her eyes stay on the bead of yellow, not on the dragon's eye at her cheek.

Then she speaks aloud to the gold eye a stride from her face, and her voice doesn't shake:

"It leaned for me. You saw it; I'll not pretend otherwise. And you just offered to sell me a thing that's lying on your own floor. The name, and the size of the lending — they're on a hand's length of bronze that four frightened men dropped between here and the stair. You've known that for ten days and never sent a kobold to pick it up, because a piece of a lock is no use to you without hands, and because as long as it's lost you've something to bargain with." She lets that stand. "I'll not be bought with my own debt, Warm One. I'll go and read it off the bronze myself, with my own eyes, and owe you nothing for it."

She tips her head at the outer band without touching it. "And I'll tell you what *I* read that you've never said in twenty winters of reading it with your eyes shut. *Come in who will. Nothing of the flame goes out.* That's not a lock, and it's not only a lid. It's a door a person can pass with the fire still held. The last of Ulcaster's house meant someone to walk in there and come out again — and leave the fire behind them. I think that's how the iron book gets *mended*, and I think you know it, and I think it's the one thing in this room you don't want."

She turns side-on to the door, not giving it her back, and raises her voice enough to carry down the lane.

"Bram. Pell. The band says the house of Ulcaster shut this cellar *by lent light*, the year the towers burned. The light was lent by — and there the piece is cut — and it is owed. When the flame is small as a seed, the one who carries it comes to this door and the light goes home." Her hand rests on the Book at her belt. "That's me. It's been coming to me for six years and I didn't know what it was for." Quieter, as she starts back along the lane, slowly, hands open: "The flare was it answering. I'll tell you what it said at the arch, not here. First the piece. Before anyone's hand goes near this door, I want to read whose name I've been carrying — and whether what's written after *owed* says anything about what happens to the house when the light leaves it."

From the pillar, Pell speaks in a steady voice: "The missing piece is a ward plate. Cut out between two rivets. Eight seams lit when Sefa raised her hand; the gap stayed red. I see no plate on the floor here." He stays by the pillar, watching the ring and reaching for nothing. "Sefa, we've tracks into the burned room upstairs, about ten days old. That's somewhere we can look without touching this seal."

As Sefa comes level with you, she says gently to Ixx, still flat behind your boot: "Tisk's people know every clean stone between here and the stair. When we go back across, I want someone who knows which cracks a dropped bit of bronze would have fallen near — and which ones it would have fallen *into*."

And to the dragon, over her shoulder, without stopping: "You'll have your answer. It's *not yet.* If that's not good enough for a thing that's waited twenty winters, say so now, while I'm still on your floor and you can still see my hands."

---

The light shrinks back to a bead. For a moment after it does, nobody in the room moves but you. You take one pace into the chamber, clear of the lane, your shield a few inches higher than it was, and call Sefa back.

The Warm One doesn't look at you. The gold eye stays on the woman two paces from his door. When your words reach him (*sugar lump*, *mousetrap*, *killed half the room*) his breath stops and stays stopped, and the heat gathers around them.

As Sefa starts back along the lane, with fifteen strides of his jaw on her left, the long head turns to follow her. It comes no closer. It only turns, the way a cat's head turns after a moth.

When he breathes out at last, it is slow, and hotter than anything yet. The coins under his foreleg tick in it.

"That was not mine." He says it to you, without moving his eyes off Sefa. "Twenty winters that light has not answered me. You saw what it did for her. Do not tell me I made it." He lets a pause go by. "*Prove you want it opened slow.* I have lain here twenty winters, Bram Halloway. Show me a slower man than that."

Sefa is a third of the way down the lane. He speaks to her now, low enough that the stone under your boots carries it more than the air does.

"*Never sent a kobold.*" He gives the words back to her almost gently. "Ask the one behind your shield-man how many times my floor was swept for it, sick-house girl. Ask him how many times the stair was swept, and the hot rooms, and the passage, crack by crack. Ask him what they found." The eye half closes. "You read stone better than you read me."

She is halfway now, level with the hinge of his jaw. With her in reach of it, he takes the other thing she said and turns it in front of her.

"*Nothing of the flame goes out.* You say it as though it frightened you." The heat leans on her again. "Then think what it promises. If nothing of the flame goes out, what do you fear from an open door? The fire stays where your wizards put it. It says so in bronze. You read it to me yourself."

He doesn't say what he is.

When Pell speaks of plates and rivets and the burned room upstairs, the head moves away from Sefa for the first time. It's only a hand's width, toward him.

"The burned room." He tastes the words. "Your four went in there by night with their lamps before they came to me. My brooms do not go in." Amusement comes up through the floor, faint and not kind. "They are small, and they are afraid of old paper. Go and look, little lock. Look anywhere you like."

Sefa reaches the end of the lane. Her dagger still lies on the threshold stone at your boot, where she held it out to you. Ixx is still flat behind that boot with his snout on the floor and his tail wound twice round his ankle. As she comes level he turns his head without lifting it, and his mouth moves, too faintly for you to make out anything.

The Warm One lowers his jaw onto his forelegs again, facing the door, as though none of you had ever come in.

"*Not yet,*" he says to the yellow bead. "I have had *not yet* from that door every sleep for twenty winters. I can hear it once more from you." He doesn't raise his voice. "Go and find my piece. Take the sweeper. Read your name off it with your own eyes, since you would rather owe me nothing. But it is a piece of *my* door, and it comes back to this room in your hands. If I hear it go up my stair instead…" A slide of old coin runs off the bed and rings across the stone, without hurry. "…then I will not need sweepers anymore, and the Broom will learn what I do with things I do not need."

His breath goes out, long and even, and the ruin breathes with it.

"One sleep. Not two."

Sefa is back at the arch beside you.

Where you are: the dragon's chamber, at the arch, one pace inside · Time: Day 1 · afternoon
````

**Player** (player r18):

````text
Bram doesn't pick up the dagger. He lets it lie on the threshold stone beside his boot and speaks to Sefa without taking his eyes off the dragon's head.

"Take it up. We don't leave iron on his floor."

Then his voice goes out flat across the chamber, not loud, but meant to carry to every wall.

"One sleep. We'll use it." He steps back to the arch and turns just enough to let Sefa come through first, then gestures Pell over with a jerk of his head. "We search the burned room, then the path back to the stair. Ixx comes. And if any of the Broom come with us, they come because it's their house and they choose to—not because I carried them."

He keeps the shield facing the room until Pell is with him, and only then turns toward the dark of the hot hall.

"The piece comes back here in our hands, to this room, before the day's out. So you'll have no cause to find out what you do with things you don't need. I'll not hand you that excuse tonight."

Then he's moving, first back out into the heat, and the lamp on the shield rim cuts the swept path out of the dark. To Ixx, low: "On your feet, sweeper. Show us the clean stones going back. All of us step where you step." A beat. "And tell me how many times you've swept this path for that plate—crack by crack. I'd like to know what I'm looking at before I go groping into a seam that breathes fire."
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
OK, Bram's just heard the whole exchange. Sefa's back at the arch, Pell's at the pillar, Ixx is hiding behind his boot. The dragon's set terms: one sleep, not two, to find the cut plate, and it comes back to the room. Burned room upstairs has tracks from the four, and the kobolds don't go in there.

Bram's position: he's the shield. He's not going to leave Sefa or Pell to do this piecemeal. He'd want to consolidate, get everyone out of this chamber and back to the dome where the kobolds can speak without the Warm One's stone-ear, then decide the search. He's also not going to tolerate the threat to the Broom hanging. But he's pragmatic — he knows the dragon's older, stronger, and holds the house. He's not going to puff up; he'll use the time they have.

What does Bram do now?

He'll confirm the plan in one or two sentences, then move the group out. He won't turn his back on the dragon until they're all through the arch. Priority order: get Sefa's dagger back to her at the threshold (she had him hold it), make sure Pell falls in, get Ixx on his feet, and step out into the hot room's edge where the floor is safe enough to talk. He'll speak to Ixx once they're clear: ask about the sweeps, and where the plate might have gone. But first, leave the dragon with a clean, level acknowledgment — not submission, not defiance. Something like, "One sleep. We'll use it." Then out.

He'll keep his order of march: Bram first, Pell second, Sefa third, Ixx with the broom. Back across the hot rooms is still the same swept path.

Let me draft Bram's message. It should feel like him: short sentences, road-thinking, orders, no over-explaining. It should move the scene and give the GM something to respond to while leaving Sefa and Pell's players room. It should also acknowledge Ixx's fear and give him a concrete task (maybe after they're back in the dome, he asks Ixx whether the Broom ever swept for the plate, and if so where). But not all in this message.

I should also press the dragon one last time on the threat, but only briefly — Bram wouldn't leave a threat against the Broom uncontested. He'd say something like: "The Broom aren't part of your payment. You want the piece, you'll get it." Then he leaves.

Let me write it.
````

### Screen 22 · player r19

````text
Sefa stoops and picks up her dagger from the threshold stone and buckles it on without looking at the lane. Her fingers fumble the strap once before they get it. Then she speaks to the dragon's turned head, level:

"One sleep. You'll have the piece in this room, in my hands, and you'll have my answer with it. I don't make a promise I can't keep, so I'm not promising you *yes*. I'm promising you *back*." A beat. "And you were right about the sweeping. I was wrong, and I said it in your house, and Ixx has corrected me. I'll not do it again."

She turns to the arch and the hall beyond it, and doesn't look at the hoard.

"Pell, you've got it. The burned room — the Broom won't go in, the four did, ten days ago with lamps, and a frightened man running from a light that bit him doesn't keep a piece of hot bronze in his hand all the way across *that* floor. Tracks go in; we follow them. Bram, same order back across, Ixx's broom and your boot, nobody hurries even though we'd like to."

She crouches by the kobold still flat behind your boot and keeps her voice for him: "Ixx. Up. You swept every crack for that piece and found nothing, and I was unfair to you about it. Walk us back across, and then stay in the dome with Hrask while we go into the paper room — you've done enough carrying today."

Pell moves back to the arch with the rest of you and leaves the scattered gold untouched. "Ixx," he says quietly, "we need your broom and your eyes for the crossing. Same way back, one stone at a time."

Sefa straightens and speaks quietly, side-on to you and Pell: "What the flame said, I'll give you word for word once we're past the string, where only the stair hears. It's short. It changes nothing about tonight: we find the piece first. Everything else waits on what's written on it."

She steps up to the arch, lays two fingers on your shield-rim to check the Light, and gathers her hem out of the heat. "Lead on, Ixx. Here, then the broom says next."

Your words go out across the chamber, flat and even. The Warm One doesn't lift his jaw from his forelegs. His eye stays on the yellow bead in the door.

"Then do not hand it to me," he says when you're done. He says nothing at all to Sefa's admission. His breath stops for a moment while she speaks, then comes out again at its old pace, no warmer. From him, that may be the answer.

Ixx gets up off the floor. He picks up his broom and checks the bristles with one claw, then looks up at Sefa crouched beside him. He seems to have expected a kick more than an apology. "Sefa was not unfair," he says, very low. "Sefa did not know." He takes his place behind your left elbow.

You keep your shield toward the room until Pell has come over, and only then turn to the hall. The lamp-yellow light on the rim spreads across the first pale stones, and the red of the cracks lies beyond it.

"Here," Ixx says, and the broom touches down.

You go back the way you came, one stone at a time. Once you're moving, Pell speaks low to you and Sefa: "The four went into that room *before* cutting the plate. Those tracks may not tell us where it ended up — but they could tell us what they knew. Let's hear why the Broom won't enter before we do."

Ixx answers your question between stones, in pieces, and he never calls the next stone late.

"How many sweeps." *Here.* "Every sleep, from the sleep the four died. Ten." *Here.* "All Broom. Big ones, small ones. Every crack on the pale side, with claws, with sticks." *Wait.* A seam to the right goes orange and sighs, and sparks drift past your shield rim. "Now. Here, here." On the far side he goes on. "The bright side, not. Bright side, little fires walk. Broom sweeps up to the bright, not in." He thinks about it. "If the piece went in a bright crack, it is gone. Bronze goes soft in the bright. Like the cap."

You come level with the long black smear again. On the right, out past the chisel in its white-hot crack, a crack brightens and a little fire stands up out of it. It's the same knee-high hunch of embers, further off this time, almost at the right-hand wall. This time it doesn't pace you. It stands there and its seams flare, the way a coal flares when it's blown on. For a breath it sheds a light of its own, a red-orange ring on the stones and the wall behind it.

The light lands on the wall, and because it's lit and you're looking, you see what's there. Between the last two pillars on that side there's a doorway in the dressed stone. It's narrow and square-topped, a man's height, and dark inside. Its sill lies across the brightest run of cracks in the hall. You saw nothing there on the way in, because the hall was dark past the shield-light and you were watching your feet.

Then the little fire folds down into its crack and the doorway goes back into the dark.

Ixx has seen where your head turned. "Old door," he says, before you can ask. "Tall ones' door. Floor bites there, all the way." His tail goes round his ankle. "Broom does not go."

The rest of the crossing is broom, boot, boot, boot. Then comes the passage and its long climb, with the bronze channels whispering at your hips. The heat thins step by step until the dome's air feels almost cool, though it isn't. Hrask is still at the hides, spear upright, exactly where you left him. He sees four come back up out of the red and lets out a breath through his nose that might be relief.

Ixx stops at the edge of the grey dust fan in front of the burned arch. His toes are right at the line where the kobold prints stop. The boot prints go on past him, softened by ten days of draught, in under the blackened hinges.

Now he answers Pell's question, looking into the dark of the arch and not at any of you.

"No ghosts," he says first, as if he's been asked that before. "Old ones say no ghosts. Is only old." He points his snout at the dark. "Tall shelves. Tall as Bram, taller. Paper on them, black, burned, soft like ash. Shelves lean. When Tisk was small, Tisk's egg-brother went in for paper to start a fire." He stops. "A shelf came down. All the paper, all the wood, on him. Broom dug. Long time." The tail tightens. "After, Tisk said: the paper room is the tall ones' room. Tall ones' things fall on small ones. Broom does not go."

He thinks, and adds the part he plainly finds strangest.

"The four went in. String sang. Middle of the sleep. Broom woke and came out, and the four were in the paper room already, with lamps. Broom waited here, at the dust. Long. Lamps went far in. Then gone." He lifts his eyes to you. "Broom did not see the four come out. Broom waited at the dust, and the four did not come out. Then the hot rooms shouted, and the four were in the hot rooms, on the floor." He spreads his small claws. "Ixx does not know the way they walked."

He steps back from the dust fan, one step and then another, until he's beside Hrask at the hides. He looks at the boot prints going in and not out, then at the three of you.

"Ixx waits here. Ixx sweeps the dust after, if the tall ones come out."

Under the arch the dark smells of old burned paper and nothing else. The shield-light reaches a stride in and finds the edge of a shelf: tall, black, leaning a little to the left.

*(Out of game: no dice this turn. Your orders, your words to the Warm One, holding your shield toward the room and leading the way back across were open speech and movement with nothing uncertain in them, and all of it happened as you declared. The Light on your shield rim has about a quarter of an hour left. Pell's hooded lantern is filled and ready.)*

Your journal, new:
+ Promise: The piece back to the seal chamber

Where you are: the dome, at the dust fan before the burned arch · Time: Day 1 · afternoon
````

**Player** (player r19):

````text
Bram stands at the edge of the dust and stares into the burned room, past his own shield-light. He turns what Ixx said over in his head, and the piece that won't sit still is this: the four went in there with lamps, the Broom waited at the dust, and then the four were in the hot rooms. Not through the dome. Through somewhere else.

He looks over his shoulder at Ixx, then at Pell.

"If they didn't come out here, then there's a way from that room into the hot rooms," he says. "That's how they got behind us, or would have. That's where we look." He shifts his grip on the shield and hooks a thumb at the leaning shelf. "And that means we don't go leaning through there like men hunting deer. We find the way through with our eyes first, and we don't let the shelves block the way back."

He glances at Sefa. "Light close. Pell, watch the floor for scrape-lines and for anything shiny—bronze, iron, broken shelf. I'll lead and watch the beams. If I stop, we all stop."

Then he takes a step into the old library, careful as he did on the stairs, and lets the lamp throw its yellow across the shelves and the dust. The dry smell of burned paper rises around them like old smoke woken by their passing.

"Talk low," he says. "Sound carries in a room this old. If there's a way through, I want to find it before it finds us."
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
Hmm, the player has Bram standing at the entrance of this burned library, digesting what Ixx just revealed about the four who didn't come out. The core mystery here is that they were seen inside, but vanished without exiting past the kobolds, only to reappear dead out in the hot rooms. This means there's likely a hidden passage or some kind of teleportation between the library and the hot rooms.

I'll have Bram assess the structural danger first. He's a practical soldier; he'd want to understand why a shelf would collapse and kill someone, especially after years of stability. The real kicker is that there must be another way out. Those four didn't walk past the kobolds, so they found some hidden route. Bram's concern will shift from just searching for the missing piece to needing to secure their escape route if the shelves come down. And there's still the question of what they were doing in the library in the first place, and what the Warm One knows about it.

The order will be: Sefa has the light on his shield, so he tells her to stay close at his shoulder. Pell will be watching the floor and walls for that other passage. He'll go first, slowly, testing each floorboard before putting full weight on it, listening for creaks. He won't touch the shelves. He'll call out findings, keep his voice low, and if they find a way through to the hot rooms, they'll use it only if it doesn't lead to that bright crack trap. Let me write Bram's response now.
````

### Screen 23 · player r20

````text
Sefa stands at the edge of the dust fan a moment, looking at the boot prints going in and not coming out.

"Then they didn't walk across the hot rooms at all," she says, low, to you and Pell. "They went *in here*, far in, and came out on the bright side — at that old door Ixx won't look at, where the little fire stood up and lit itself for us. That's how they reached the rim without the Broom seeing them cross. They cut the plate, the light bit, they ran *back* the way they'd come — toward the old door, not the stair — and the floor took them short of it." She looks at the dark under the hinges. "So the piece is either in this room, on the far side, or in the bright cracks between the smear and that door. The Broom swept the pale side ten times and found nothing because it was never on the pale side."

She turns to Ixx and Hrask. "Thank you. Stay by the small ones. If we're not out by the time the fire's burned down a cake, don't come in after us — send Skra up the stair as far as the bend and leave her there." She nods to Pell. "Light your lantern; mine has a quarter hour and I'd rather not put the Lantern's colour on every shelf in a dead wizard's library before I know what's written in here. Bram, shield up and watch what leans — Tisk's egg-brother died under one of these, and you're the tallest thing in the room. Pell, the prints. I'll read."

"Another way through," Pell says quietly. "Perhaps to that old door across the bright floor. Let's see what the tracks tell us." To Ixx: "Leave the dust for now, please. It may save us some searching."

Pell lights his hooded lantern and holds it low at the threshold. Before going in he studies the nearest shelf's lean, its supports and the floor beneath it, and looks along the boot prints. "Let me check the footing first. No pulling books, no leaning on anything." He advances only as far as the light shows safe space, his eyes on the floor.

Ixx looks down at the grey fan of dust and then at Pell. He lifts his broom off the floor and holds it upright against his chest, well away from the dust.

"Ixx leaves it," he says. To Sefa he gives a single click and then remembers to say it in words. "Stays by small ones. Skra to the bend." Hrask says nothing. He has heard the shape of it, and his eyes go to the stack of dung cakes by the fire as if he's already counting them.

Pell opens the shutter of his hooded lantern and holds it low at the arch, and the dark under the hinges turns brown and grey. The first shelf is as tall as you and half again. Its uprights are oak, charred black on the side that faced the fire, and they're set into iron shoes on the floor that have rusted to scale. It leans left by about a hand's width at the top, and the lean is held by a crossbar wedged against its neighbour. That's an old repair or a lucky fall, and either way it has held a long time. The shelves are full of what used to be books. They're black blocks now, fused to each other along the spines, and the edges have gone soft and grey like the ash at the end of a cigar. The draught from the dome stirs them, and a little drifts down. The boot prints run straight between the first two shelves, down the middle of the aisle.

You go in first. Your shield-light runs up the shelves and loses itself in the dark of the ceiling. Pell is at your shoulder with the lantern, and Sefa comes last, setting her feet in Pell's prints.

The library is bigger than the dome. The aisle runs straight back from the arch between rows of shelves, maybe ninety feet, with cross-aisles every twenty. Near the end of the second row the light on your shield thins, wavers and goes out, a few minutes short of a quarter hour, as Sefa said it would. For a moment there's only Pell's lantern, and the shelves seem to step closer.

Thirty feet in, a shelf has come down. It fell long ago, across the aisle and against the shelf opposite, and it lies there like a roof beam, so the aisle runs under it in a low triangle of dark. Under it the floor has been dug. Old claw-scrapes run through the ash, and books are pulled out and heaped to one side, gone so soft they've slumped into a single grey drift. You don't need anyone to tell you what that is. The boot prints go straight under the beam, bent low; the heels dig deeper there. You watch the beam as you duck under it, the way you said you would. Where it rests on the other shelf the charred upright has split along its grain, and a line of pale wood shows in the split. It isn't moving. Fine ash sifts down onto your shield as the mail on your back passes under, and settles. Nobody breathes on it.

Sefa reads as you go, her eyes on the shelf-ends. Most of what was written here is gone, burned into the black blocks or flaked off the shelf-ends with the char. Still, there are scraps. A shelf-end on the third row has a strip of bronze tacked to it, its raised letters still standing. Further back there's another. Under that, burned into the wood of the shelf, someone long ago scratched a tally of days, the way a bored apprentice does. Pell's lantern finds one book that the fire missed. It's lying flat on a lower shelf, as if somebody pulled it out and laid it down, lettering still on what's left of its spine. It's closed. Nobody touches it.

Among the stacks, with the arch a dim grey square behind you and no red anywhere near, Sefa stops and says it quietly, word for word:

"When it flared, the voice said: *That light is mine. Take it back.*" A breath. "Not *open the door*. Not *free me*. *Take it back*. That's what I'm here for, whether I like the timing or not — and nothing in those words says the fire comes with it." Her hand rests on the Book at her belt. "One more thing. Mage Hand reaches thirty feet. If the piece is lying in a bright crack, nobody's boot goes near it — I'll lift it out from the pale side with a hand that can't burn. Now let's find where these four came out."

The library takes it in. The air is dead here, and it doesn't carry.

At the far end the aisle comes up against a wall of dressed stone, and the boot prints go to a door in it. It's stone too, a slab on bronze pins, and it stands open about a forearm's width. Nobody has burned it, and there's no char on it at all. Above it a short line is cut into the lintel, under a small version of Ulcaster's stepped tower. The cutting is crisp, protected all these centuries by the shelves that stood in front of it. Sefa reads it twice.

You read the beams as you go, and nothing in the library is set against them. You find no cord, no pin and no loose stone, only age and fire damage. The one danger you mark is the fallen shelf thirty feet in, where its support has split along the grain, and you passed under it without touching it. At the reading room door you turn and look back down the aisle with Pell's lantern behind you. The way out is the way you came: straight, open, and blocked by nothing except that low triangle under the fallen shelf, which a man in mail can stoop through without brushing it. Nothing has shifted behind you. Coming back, the arch is ninety feet off and you can walk it in a line.

Pell sets the lantern to the gap and looks before anyone goes through. Then you and he read the floor, and the floor is plain.

The room is small, perhaps twenty feet square, with a low vault and reading desks of stone built into the walls. The fire never got in here. There are shelves, with real books on them, warped and foxed and leather gone hard, but books. Someone has camped on the floor. There are two bedrolls, unrolled and left, a tin lamp on its side with its oil long burned off, and a heel of black bread gone stone-hard. A leather pack lies against the leg of the nearest desk, its flap open, and the corner of something folded in oilskin shows out of it. Beside it, flat on the stone, is a pair of heavy leather gloves. One is scorched brown across the palm.

On the far side of the room a second opening, square-topped and narrow like the old door you saw across the hall, gives onto steps going down. Warm air comes up them, and the struck-flint smell with it. The prints tell the story the room won't. Four sets of boots come in from the library, walk around the camp and go down those steps together. One set comes back up. It's long-strided and scuffed, with the toes digging in, a man taking steps two at a time. It crosses straight to the desk where the pack lies and stops there. The heel marks turn on the spot. Then the same boots go back down the steps the way they came, running again.

Pell's lantern is turned toward the steps. Behind it, by the desk leg, between the pack and the scorched glove, there's a light where there shouldn't be one.

It's very faint, no more than a coal at the bottom of a grate. It's yellow, lamp-yellow, and it isn't the lantern's.

Where you are: the Apprentices' Room, beyond the burned library · Time: Day 1 · afternoon
````

**Player** (player r20):

````text
Bram goes still at the threshold, his eyes on that ember of yellow light near the pack. He doesn't put a boot into the room yet.

"Sefa," he says quietly. "That's not firelight. That's something else, and it's sat right where one running man stopped, at the desk. Pell—hold where you are. Nobody touches that pack or the glove until we know what that light's coming from."

His shield stays up, and he studies the room the way he'd scan a camp with a half-seen fire in the edge of the dark.

"The four came in from the library, camped here, went down that stair together. One came back up, running, took something from the pack or put something down, then ran back down." He points with his chin at the single boot-print pattern on the floor, then at the oilskin protruding from the pack. "That's where their own gear lies. Could be the plate ended up in a satchel or a cloth. Could be the one who ran back dropped it here and couldn't pick it up again."

He turns his head just enough to glance at Sefa. "You read this place. Tell me what that lintel said before we go further."

And, low, to Pell: "Check the floor just inside for trip-wire and for where the boots stop. Then I'll go in first, shield-side to the light, and we work the room by lantern. Stay close and don't step between Sefa and that yellow glow."
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
Hmm, the user is presenting a rich, atmospheric scene where Bram and his companions have reached the Apprentices' Room. They've found the hidden route the four dead men used, a small camp, and a mysterious faint yellow light near a pack. The user's action style is solid, in-character decision-making—prudent, protective, and grounded in his caravan guard background.

I need to write the next GM response, focusing on the perspective of this specific player, Bram. The key elements are the scorched glove, the lone set of running boots, and the eerie yellow light that mirrors Sefa's Lantern. Bram would immediately connect these signs. His experience tells him the man who came back was likely burned when he grabbed the hot bronze plate, then tossed it before running back. They need to search the pack and investigate the light cautiously.

My response should mirror Bram's methodical nature. He'd prioritize securing the room, issuing clear orders. He'd insist Sefa stays behind the shield line, as the light seems tied to her. He'd point out the burned glove, linking it to the plate's heat. The tone should stay practical but tense, with Bram's protectiveness showing. The light is a threat because it's unknown and connected to the door, so he'll treat it with suspicion. The response should end with them settled, focused on the next lintel-reading step, keeping the mystery alive.
````

### Screen 24 · player r21

````text
Sefa stops in the doorway with one hand on the cold stone of the jamb. "Pell. Lower the lantern a moment. By the desk leg — between the pack and the glove." Her voice is barely above the dead air. "That's not your light, and it isn't mine. It's the colour of the thing on his door."

Pell whispers, tracing a route through the air with one finger without touching the dust: "One came back. Stopped at that pack, then ran downstairs again. And there's yellow light beside the glove—not mine." He keeps the lantern clear of the old paper and angles its shutter. "Don't move the pack yet. Let me see what he left."

Sefa reads the floor aloud: "Four went down those steps. One came back up — fast, two at a time — straight to this desk, stopped, turned on the spot, and went back *down*. Running. Not up to the stair, not out through the library. Down, toward the others." She looks at the scorched glove. "He had the piece in his hand and it was burning him through the leather. He came back here to put it down, or to put it in the pack with whatever's in the oilskin — and then he went back for his friends. That's the one Tisk's people found nearest the old door."

"Sefa, what does the lintel say?" Pell asks.

Sefa goes in slowly and kneels an arm's length from the desk leg, her hands open on her thighs. "Bram, the steps. If anything comes up them, I want to hear about it before it's in the room. Pell — the pack and the oilskin are yours, but not yet. Nobody's hand near this until I've looked."

Nobody moves at first. You stay in the gap of the slab door with your shield up and your eyes on the yellow light. Sefa lays her hand on the stone of the jamb. Pell's lantern dips.

Pell tilts the shutter until the beam lies across the floor and stops short of the desk. As the lantern light pulls back, the other light gets clearer. It's a thin yellow line on the stone, low and steady, in the shape of something curved. It's coming out from under whatever lies there.

Pell goes over the floor inside the gap. Reading a floor is his trade and it doesn't take long.

"Clear," he breathes. "Nothing rigged."

Sefa went in sideways through the gap and round the edge of the camp, past the bedrolls, to where she now kneels. You come in after Pell gives the word. The opening is a forearm wide, and you have to turn side-on and go through shield first, with your mail scraping the stone on both sides. Once inside you set yourself between the side stair and the desk with your shield toward the yellow light. From there the lantern shows you all of the small room.

Then Sefa looks.

It's lying on bare stone in the gap between the pack and the scorched glove. It's a strip of pale bronze about a hand long and two fingers deep, bent in a shallow curve, the curve you'd get from cutting a short length out of a great ring. Both ends are cut clean and straight, and at each end a half of a rivet hole shows, sawn through the middle. It's a plate from the door.

The light is underneath it. It leaks out round the edges onto the stone the way lamplight leaks out under a door. As Sefa kneels in front of it, the line of light gets wider, by about the width of a fingernail, and stays that way. The face of the plate turned up toward her is written on, letters worked into the bronze and filled with a fine grey dust. Sefa studies them for a while.

The dead air of the room is still, and nothing in it answers.

Sefa lifts one hand. "I'm not touching it with skin. Not after what it did to that glove." Above the desk, the air thickens into the vague shape of a hand. "If it's loose, I'll lift it onto the oilskin and we read it in the open. If it's wedged, we think again."

The spectral hand slides its fingers under the curve of the bronze and lifts. The plate comes up easily. Nothing holds it to the floor, and the stone underneath is clean, with a curved mark in the dust where the plate has lain.

As the plate rises, it turns in the spectral fingers, and you all see the other side.

Cut small and fine at one end of the underside is Ulcaster's stepped tower, no bigger than a thumbnail. Beside it is a lantern, hooded and ringed, the same lantern as over the stair and on the door. A flame burns in its heart the size of a barleycorn, lamp-yellow and perfectly still, and now that nothing covers it, its light spreads out. It's a soft glow, too weak to read by, about the reach of two strides. It lies over the desk, the pack and the scorched glove, and touches the toe of your boot. Under it the scorch on the glove's palm shows plainly: a long curved burn, a hand long and two fingers deep. A man held this in his fist and kept holding it while it burned him through the leather.

The hand settles the plate on the corner of the oilskin fold where it sticks out of the open pack, lantern side up. Then the hand thins and goes.

The bronze lies there in its own small light. The warm air comes up the side stair from below, and the struck-flint smell comes with it.

Where you are: small camp room past the slab door, between side stair and desk · Time: Day 1 · afternoon
````

**Player** (player r21):

````text
Bram keeps his place, shield angled toward the side stair, and lets his eyes move between Sefa and the dark beyond it.

"That's the piece," he says, low. "And it's lit underneath. The same lamp in the carved lantern. I'd say it's been lying there quietly like an ember, waiting. The man dropped it and ran because he couldn't hold it."

He doesn't kneel or move toward the desk. He can read the shape from where he stands: clean-cut bronze, rivet halves, Ulcaster's tower and the lantern cut into the underside, and the small still flame glowing in its heart.

"Sefa—read what's on it. All of it, aloud. If it brightens, put it down and step back. No skin to it." Then he jerks his chin toward the pack. "Pell, see what's in that oilskin. Use a strap or a hooked tool, not your fingers. If they had a cold-iron chisel or a cut section with a charge left in it, I don't want it touching your hand."

He shifts half a step, putting his weight between the desk and the side stair, and turns his head enough to listen down it. The warm air moves past him, slow and dry, carrying the same flint-and-stone smell as the hot rooms.

"That stair goes the wrong way. Likely out at that old door we saw from the hall. So we read here, we search here, and then we go back by the library—not down there. If anything moves on those steps, I'll call." His voice is level, but his hand rests near his hip.
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
We need respond as Bram. Need keep narrative. We need likely inspect plate, read inscription? Sefa likely read. Need react. We must be in character. We were shield, monitor side stair. Now plate revealed. Need perhaps have Sefa read aloud, Pell examine pack? The light is key. The piece is here, lantern side with Ulcaster tower and flame. We need be careful no touch. Need decide next: read inscription, search pack/room? Need tie to quest. We should ask Sefa what it says, and perhaps Pell check pack contents cautiously. Need not go down side stair yet, maybe look for any more tracks, gear. We should posture.

Bram doesn't touch plate. He says something like "There's the missing piece. And it's lit. That's the flame we're supposed to carry back? Sefa—read it." Maybe "The one who ran dropped it here rather than carry it into hall. That's why floor took them." Also "That light is the same as door. It wants hands, but not iron." Need possibly notice plate temp? We cannot touch. We could check scene: guy came back up from down stairs, stopped at pack, maybe left plate on stone and took something from pack? We can inspect pack with Pell. Need think danger from side stair: Warm One said four went down; one returned then down again. Those steps likely lead to hot rooms? We came from hot rooms via hall? We saw old door on right, across bright cracks. This side stair probably connects to that old door, leading down to hot rooms side; the runner went back down to others. We should not go down. We need find piece first; we found it. Need maybe leave and report/answer. But Sefa wants read. Plate has inscription. We need perhaps withdraw to safer place? But room is safe-ish. Need maybe set watch at side stair.

Let's craft Bram response. Need be concise but meaty. Since it's our turn, we should interact with others. There is no direct roll. We need perhaps state actions, keep watch, caution not to touch plate with skin. We can ask Sefa read, ask Pell examine pack for cold-iron tool/blood/anything. We can step between desk and side stair and face the opening, listening for sounds, maybe relay periodic. We can say "That's the piece. It lit the way to itself." Could mention "He brought it back from the hall and put it down by the pack. Why didn't the others follow? He went back down empty. Maybe they thought it was still out there." But no need overdo.

Need include journal? no.

Let's construct response:

Bram keeps his place, shield angled to the side stairs, eyes moving between Sefa and the dark. "That's the piece," he says low. "And it's lit underneath. The same lamp in the carved lantern. I'd say it's been lying there quietly like an ember, waiting. The man dropped it and ran because he couldn't hold it."

He doesn't kneel, doesn't get closer; he can read the shape from where he stands. "Sefa—read what's on it, aloud, all of it. But don't put skin to it, and if it brightens, put it down and step back. Pell, see what's in that oilskin. Use something—not fingers—if you must; any metal or sharp in there might still have a charge." Then he adds: "That side stair goes down toward the hot rooms, likely out at that old door we saw. I'll watch it. We read, then we go back the way we came. Nothing down those steps now." He sets his stance, one ear to the stairs, and lets them work.

Need perhaps mention "This is what he wants, and it's got Ulcaster's mark and lantern. It's likely name and terms Sefa wanted." We can include.

Let's reply.
````

### Screen 25 · player r22

````text
Sefa stays on her knees an arm's length from the desk, the little barleycorn of light lying on the oilskin in front of her, her hands open on her thighs. For a moment she says nothing. Then she reads it word for word, flat:

"*The light is lent by the One Who Keeps the Ninth Watch, a lamp for a lamp, and it is owed.*" A breath. "That's the whole band, with the gap filled. The lintel, the door, and this. It's one sentence, cut in three places."

Her thumb finds the beads at her throat and stays there.

"The ninth night." She says it to the plate, not to you. "I always thought that was *my* ninth night. The oil ran out on the ninth night and I thought that was why it came, because I'd waited that long. It wasn't. That's its *name*. It keeps the ninth watch. The last one, when every other lamp's gone out." She looks at the barleycorn flame, which hasn't flickered. "And the price was never gold. *A lamp for a lamp.* The house of Ulcaster borrowed a light to hold their fire down, and what they promised back was a lamp. Another one. Lit, and carried." Her voice is very level. "I think I know now why it answered a novice in the dark and nobody else. It was looking for the second lamp. It's had six years to see whether I'd burn steady."

She lets that sit in the dead air, then turns her head to look at the scorched glove and at the long-strided prints going back down the steps.

"He couldn't hold it. It burned him through the leather and he still ran back for the others with his hand like that. Whoever he was, he was braver than I've been giving him credit for." Quieter: "And it *didn't* burn the floor it lay on for ten days, and it isn't burning the oilskin now. It burned a hand that cut it off a door. That's not heat. That's a *no*."

She stands slowly, knees stiff from the stone, and only now looks at you and Pell.

"Here's where I am. The Warm One wants this back in his room in my hands by one sleep, and I said *back*, so back it goes. But the thing that's lit on it is the same thing that's lit in me, and it's asking to go *home*, not into a dragon's bed. I don't yet know if home means the door, or means me, or means somewhere I haven't seen." She tips her head at the dark square of the side stair. "The four went down there together. Whatever's at the bottom, they thought it was worth more than the door. They went down *before* they ever cut the plate. And one of them came back up here and then went down *again*, running toward it. I want to know what they were running toward."

"But not blind, and not before dark catches us underground with two slots and a dragon counting cakes." She nods at the pack. "Pell, the oilskin's yours now. Mind the plate. Lift the cloth from the far side and don't let your skin near the bronze. Whatever he folded up in there, he thought it worth coming back for with his hand on fire. Bram, those steps. Hear them for me while he works. I'll read whatever's in the pack, and then I'll tell you what I think *a lamp for a lamp* costs, because I think one of you is going to have to tell me if I'm wrong about it."

She touches the Book at her belt and goes quiet a moment.

Pell looks at the bronze where it rests on the oilskin. "That's our ninth plate. Both cut rivet holes match." He watches the spot under it. "Sefa, keep that hand ready. If it's still hot, bare stone's safer than their papers." Then: "Let's see what they came here knowing. And tell us what you've read, lintel and plate, before we carry it anywhere."

For a moment nobody moves. In the dead air of the reading room you can all hear the warm draught breathing up the side stair, and the bronze on the oilskin glows with its own small light.

Pell sets his hooded lantern down on a clear flag of bare stone, well away from the papers and the bedrolls, its shutter turned so the light falls across the desk leg without striking the bronze. Then he crouches by the pack and looks before he touches anything.

You listen to the steps the whole time. The warm air coming up them rises and falls in a long draw and a longer letting-go. It's faint here, worn thin by distance and turns of stone, but you know that rhythm now. It holds its old pace. Far below, too far to judge, a seam sighs open and shuts. Once there's a small dry crackle, like green wood catching, and then nothing. Nothing comes up the steps, no claws and no boots.

Where you are: reading room, between the desk and the side stair · Time: Day 1 · afternoon
````

**Player** (player r22):

````text
Bram stays by the side stair with his shield toward the opening, listening down into the dark while Pell works. His voice stays low, meant only for the room.

"One sentence cut in three places," he says. "The door says one part, the lintel another. The plate closes the deal. Sounds like Ulcaster's people never wanted it read whole by one set of eyes—or they wanted it read only by someone the light chose." He glances at Sefa, not long. "You, it seems."

His attention flicks back to the stair, then to the bronze resting on the oilskin. "I'll say this, Sefa. A lamp-for-a-lamp isn't the same as blood for debt. You carry it, but you didn't cut the plate or break the door. The light's been making sure of you. When it asks, it'll ask once, and you'll know the cost because it'll be the thing you least want to set down." He pauses. "Don't set it down before it asks, and don't pay for another man's cut."

He jerks his head toward the pack. "Find out what they came back for. If it's a chisel or a cold-iron wedge, we'll know they meant to work the rim all along—and if it's a book or a letter, it'll tell us who hired them." Then, without turning, he adds: "We leave by the library. Not down those steps. Not today."
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
Still in the reading room. Nobody's touching it with skin. Understood.

Bram keeps listening down the stair; no movement yet.

I'll proceed:

- Sefa's read the plate and the lintel; she's piecing it into "a lamp for a lamp."
- The oilskin gets checked by Pell with care.
- I stay by the steps, watching the room, guarding the plate.
- Once the oilskin is opened, we move to decide: do we still return the plate to the dragon (fulfilling our promise), what do we do about the side stair, and what "a lamp for a lamp" means.

I'll stay quiet while Pell works, unless the plate's light shifts or something comes up the steps. After he opens the oilskin and we see what's inside, I'll speak. My next message should probably reflect all of that, plus reinforce that we keep our word about bringing the plate to the seal chamber. The dragon's watching every exit; keeping our word is important.

I'll also address Sefa's last question: what *a lamp for a lamp* costs. She asked one of us to tell her if she's wrong. I can say something like: "You'll know what it costs when the light asks you to give it up, and not before. Don't pay more than it asks." Keep it grounded, Bram-like.
````

### Screen 26 · player r23

````text
Sefa is quiet a moment after the title settles into place. When she speaks she keeps her voice at the dead-air pitch of the room.

"It isn't a god. The Faith doesn't have a god by that name, and the shape of it says why — *the One Who Keeps*, *the One Who Bears*, *the One Who Waits at the Ford*. That's how the old celestial books name the servants of the upper planes: by their office, never their name. Something greater's messenger. Whose, the title doesn't say." Her thumb moves along her beads. "But I know the watch. The temples keep eight; the hospice kept eight, a sister to each. The oldest Lathanderite hymns count one more — the one nobody's set to keep, after the last lamp gutters and before the sun. *When the eighth lamp is out, the Ninth keeps the door till morning.* Poetry about the door of dawn." A breath. "So it's a door-keeper. Of course it is."

Then, more carefully: "And *a lamp for a lamp* — I've been reading it like a wizard, as a price. It isn't. It's a Lower City custom. When a shrine lent you a lamp to light a sickroom, you sent it back with a second lamp lit from its flame. Not instead. *As well.* One more light in the world than when you borrowed. The old sisters called it a courtesy, not a debt." She looks at the barleycorn flame on the bronze. "The Book cooled a little when I thought that. From a full cup to a held hand. I don't know what that means yet, but I'm telling you because I said I would."

Pell speaks up: "Sefa, lift the plate with your Mage Hand onto the clear stone beside the desk, please. Then I can get the papers out without disturbing it. And tell us your thought about the price. We'll hear it—but 'a lamp for a lamp' isn't enough for me to agree it means your life."

Sefa lifts her hand, and the shimmer of the Mage Hand gathers again above the desk. "I'll move it — nobody's skin. Pell, point me to a flag of bare stone where you want it, clear of the papers and your lantern." Afterward she adds: "There. The oilskin's yours. Lift the fold from the far side, with a strap, as Bram said. If it's a chisel of cold iron, I want to see it before anyone's hand closes on it."

Her eyes come to you at the head of the steps. "Anything?"

You say your piece toward the side stair, low, and keep your shield on the opening. The draught coming up past your boots holds its old pace. It's a long draw and a longer letting-go, worn thin by distance. Nothing comes up the steps while you talk, and nothing comes while Sefa talks either. Once, far below, a seam sighs open and shuts, the way it has every few minutes since you came in.

Behind you the Mage Hand, a thickening in the air with fingers, slides under the curve of the bronze and lifts it off the oilskin. The plate's small light swings as it moves and slides over the bedrolls, the dry lamp and the scorched glove. The hand carries it a stride to the left and lowers it onto a bare flag between the desk and the wall, lantern side up. Nothing near it can burn. The hand thins and is gone. The plate's glow settles into a soft yellow pool about two strides across.

Pell takes the fold by its far edge and draws it up out of the pack. It's light and stiff, sealed with nothing but its own folds. When he opens it there are two sheets of paper inside, both dry. He lays them flat on the stone desk in the lantern's beam, well clear of the flame.

The pack still sags at the bottom with the knotted purse, the coil of cord, the clay flask and the rolled shirt. Pell's lantern lies across the two sheets. The plate's yellow light lies on the floor beside them, and the draught comes up the side stair, warm and slow and smelling of struck flint.

Your journal, new:
+ Thread: Dellmere's commission

Where you are: at the head of the side stair, shield to the opening · Time: Day 1 · afternoon
````

**Player** (player r23):

````text
Bram keeps his shield angled toward the stair and glances at the glowing bronze on the floor. "Once the papers are read, we'll know if they were grave-robbers or hired for a purpose. Names on paper are worth more than gold in a place like this," he says, voice low. "Read them quick, but don't rush. I'll keep listening."

He adjusts his stance slightly, feeling the heat of the stairway at his back, and lets his gaze sweep the room. The small camp, the bedrolls, the empty lamp, the dry bread—signs of men who had expected to be underground for a while. "If those papers name an employer, keep it close. The dragon doesn't get that name until we know what it's worth to him."
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
Hmm, Pell is about to inspect the papers. Bram should be cautious but pragmatic, and he should state what might be useful for the next steps. He needs to consider that the papers might reveal the identity of who hired the group, which could be a lead or a threat.

I will reply as Bram, staying in position and waiting for Pell to share what he has found. Bram will want any information that helps them understand the situation.
````

### Screen 27 · player r24

````text
Sefa reads the letter aloud twice in the dead air of the reading room, flat, charcoal list and all. At *brandy for Corrie's nerves* her voice doesn't change, but she stops for a moment before she goes on.

"Harl Ostley. Corrie. T., who said it bites." She looks at the scorched glove. "Tisk's people burned them proper and never knew their names. I'll give her these before we sleep."

Pell reads the list again under his breath after her, then holds the plan up in the lantern beam so you can both see the nine short arcs, the one inked solid, and the dotted line that runs from this room down and out to the far side of the hatched hall.

"O. Tarr, for Dellmere Iron Factors," Pell says. "They knew which plate to cut, what metal to use, and that it would hurt. Wanted the book whole and *unread*. This wasn't four men stumbling onto treasure." He points to the charcoal list. "And candles specifically not to be lit below. Sefa, does that mean anything to you? Before we try lighting a second lamp."

Sefa lays a finger beside two lines of the clerk's hand without touching the paper. "*Whole and unread.* And *the beast below may be left to itself.* Whoever O. Tarr is, he knew there was a dragon in this hill and sent four men past it for a book he didn't want them to open, and he knew about the plates and the cold iron before any of them had seen the door. That isn't a rumour from the Friendly Arm. Someone has read about this cellar in a room with a desk." She straightens. "Dellmere Iron Factors, Beregost. Half at the Feldepost on delivery. That's a name and a door, and I want it in my pack when we go up. Pell, fold them. The plan too. That dotted line is our proof the four came out at the old door, and it's drawn by someone who's been here or copied someone who was."

"I'd keep these as evidence," Pell says. "Someone at the Feldepost owes Harl and his three an accounting."

Sefa turns to the bronze lying in its own small light on the bare flag. "Now the plate. Bram, hear me out before you say no." Her hands are open at her sides. "It didn't burn the stone for ten days. It didn't burn the oilskin. It burned the man who sawed it off the door and *kept hold of it*. That's not heat; that's refusal. And it leaned for me." A breath. "I'm going to touch it with one fingertip for the length of one heartbeat. Not grip it. If it so much as warms, I take my hand away and we wrap it in the oilskin and carry it like that, and I'll owe you both a very long apology. But if it doesn't, then I know the *no* isn't for me, and I know that before I'm standing in front of the dragon deciding what to do with it. I'd rather learn it here, in a cool room, with Pell's satchel a stride away."

Your eyes go round the camp while they read. Two bedrolls were unrolled and never rolled up again. The lamp was left to burn dry. The heel of bread was saved for later. These were men who planned to be down here a night or two and come back to their beds. The draught from the side stair goes on breathing at your back at its old pace.

Then Sefa kneels by the plate. She sets the Book of Shadows on the stone beside her knee and reaches out slowly with one fingertip. She touches the plain end of the bronze, the end farthest from the barleycorn flame. She holds it there for one heartbeat. At the far end of the strip the little flame in the carved lantern leans along the bronze toward her finger, and it stays leaning until she lifts her hand.

She looks at her fingertip in Pell's lantern light. It isn't red and it isn't marked. The scorched glove lies a stride away with its long curved burn across the palm. The plate lies where it was, on its bare flag, lit.

Sefa gets up and buckles the Book back on. "Then we go out by the library, under the beam one at a time, and back to the dome. I want to sit with Tisk and give her the names, and I want the three of us to decide tonight, not at his door tomorrow, what *back* is going to mean. He gets the plate in this room in my hands; I said so. What he gets besides, I haven't said." She looks at you. "And Bram, thank you. *Don't pay for another man's cut.* I'll keep that."

Pell takes the oilskin by its edges and folds the two sheets back into it along their old creases, the letter inside the plan. He tucks the packet inside his jerkin, against his ribs. He leaves the purse knotted in the bottom of the pack, with the cord, the flask and the shirt beside it, where they were. "We have the plate and their route. I'm for going back through the library together."

That's when you hear it. It isn't the seam that sighs every few minutes, because this sound doesn't stop. Far down the side stair something crackles, dry and steady, like green wood catching, and it's coming closer. Then light shows on the walls of the stairwell, red-orange, climbing turn by turn. It isn't lamp-yellow.

A little fire comes up the steps. It's knee-high and hunched, embers stacked in the shape of a man, with light running in its seams. It's the first one any of you has seen out of its cracks. It climbs the way the Broom climbs, one step at a time, and stops on the third step below the room's sill, where the warm air of the stair meets the dead cool air of the reading room. It sways there and crackles. Its two bright spots don't go to you, or to the lantern on the floor. They go past your boots, across the room, to the small yellow pool on the flag by the desk.

It doesn't come up the last three steps, and it doesn't go back down.

It stands a stride and a half from your shield. Behind you are two dry bedrolls, a desk with shelves of real books on it, and ninety feet of library whose every shelf is packed with paper burned soft as ash. Tisk's words come back to you: they know the Broom, and she doesn't know whether they know tall ones.

*(Out of game: the plate is still lying on its flag. Nobody has picked it up yet, so who carries it, and how? Pell's question about the candles is still waiting for Sefa.)*

Where you are: reading room, by the side stair · Time: Day 1 · afternoon
````

**Player** (player r24):

````text
Bram doesn't shift his feet, but his shield comes up a fraction, not as a threat—as a door. He puts himself fully between the little fire and the room.

"Nobody moves fast," he says, low and even. "It's watching the plate. That's what brought it up. It didn't climb all this way for our boots or our books. Pell, get a bedroll in your hands. If sparks jump toward the shelves, smother them. Sefa, stay where I can see your hands."

He turns his head just enough to speak behind him without losing sight of the stairs.

"Lift the plate again—your hand, not skin. Bring it to the clear space between us and the steps. Slow. Don't wave it. Hold it out where the thing can look at it. If it follows the light, we learn something. If it backs off, better still."

Then, to the creature, calm, as if it might understand or might not:

"Easy, little coal. We're not stealing your warmth. We're taking it back up the long way." He doesn't advance, doesn't lower the shield. "We'll be clear of your house soon."
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
Okay, the scene has shifted again. Bram is at the reading room, near the side stair. A little fire has climbed up the stairs and stopped three steps below the sill, looking past him at the bronze plate. This is a delicate moment. I need to play Bram well: he's calm, protective, and practical. He's had years of road and caravan work, knows fire and panic.

The main thing: the creature is between them and the way out, but it isn't attacking. It's focused on the plate. Sefa just touched the plate and it leaned toward her, so maybe the plate is drawing it. Bram should step carefully, not threatening, but not give ground. He should direct the others, keeping his shield up and body angled. They can't let it get into the room with all the books—one spark and the whole library could go up. So he should hold the stair. Maybe speak low, steady, to keep Sefa and Pell from sudden movement. He'll consider that the little fires keep pace, maybe they know the plate. Maybe the plate is like a lamp. The creature wants it, or follows it.

Bram doesn't know magic, but he can reason: the little fires stayed in the cracks, but this one climbed up after Sefa touched the plate. That's a reaction. He'll say that. Maybe ask Sefa to lift the plate with her Mage Hand and hold it out, see if the creature retreats or follows—but not do anything hasty. We need to keep the room from burning.

I should write his actions and dialogue. Keep it grounded, no excessive explanation. Maybe he'll step down one stair, shield lowered slightly to appear less threatening? No—shield up, but not striking. He'll shift sideways to block the top of the stairs, not rush forward. He'll warn Pell and Sefa to stay back from the shelves and not move the lantern near paper. The creature may be waiting for them to move the plate.

I also want to address Sefa's question about candles, but that's for her; maybe Bram can add his road wisdom: men told not to light candles in a place where the air turns, old mines. But he might not know the exact answer. Let him stay focused on the immediate danger.

Also we need to decide how they carry the plate. Not now. First the creature.

So my message: Bram doesn't panic, positions himself, orders Sefa to use Mage Hand to take up the plate if she can and keep it in the open, but don't bring it near the shelves. Tell Pell to ready a blanket or bedroll—something to smother if sparks jump. Talk to the creature? He can try a few words: "Easy, little coal. We're not touching what's yours. We're going back." But he won't be sure it understands. He can try, because Ixx said they know the Broom; maybe they know Common? Unknown. Better to be cautious.

Let me write it.
````

### Screen 28 · player r25

````text
Behind you, Sefa lifts one hand toward you, palm out, the way she did on the stair for Ixx.

"Don't. Shield stays where it is, hand off the hilt. It's not looking at you." Her voice is low and level. "Tisk said they don't talk and they know the Broom. It's come up ninety feet of dead paper to the edge of this room and stopped at the cool air. If it wanted us it had the whole stair to decide. It's looking at *that*." She tips her head at the yellow pool on the flag.

Pell speaks quietly, and he doesn't draw a blade. "Fire on the steps. It's watching the plate. Sefa, lift it with your spell onto a fold of my bedroll. I'll carry it without skin touching bronze. Bram, keep watching it. We'll clear the doorway before you back through. Slowly. No iron, no sudden moves."

You don't step. Your shield comes up two fingers' width and settles square to the mouth of the side stair. You fill the space between the third step and the room the way you'd fill a gap in a wagon line, and you say your piece to the thing below you in an even voice. The little fire doesn't answer. Its crackle doesn't change. Its two bright spots never leave the yellow pool on the floor behind your boots, and as far as it's concerned you could be a door.

At the edge of your sight Sefa goes down on one knee beside the plate and closes her bare hand around its plain end. She lifts it without hurrying and stands with it cupped at chest height, lantern side out. Her palm doesn't redden.

The thing on the step rises as the plate does. It doesn't climb. It straightens, the hunch going out of its embers, and its spots follow the light up from the floor to the height of her chest. The crackle quickens, like green wood that has finally caught.

While her hands are busy, Sefa talks. "Pell, your question, while I've both hands busy and can't fidget. *Candles not to light below.* The lintel out there says the same thing in older words: *no flame here but the lent one.* I don't think it was about paper. I think whoever briefed Harl knew that an open flame in this hill is a *call*. The house breathes called fire, the little fires are made of it, and a wick is a kin-voice to them. Your lantern's hooded and nothing came. The plate was uncovered and lit full for the first time in ten days, and here one is." She looks at the hunched shape of embers on the third step. "So no, we don't light a second lamp down here from anything but this. And we don't light anything at all near the cracks."

Pell has already pulled his bedroll from his pack and folded it. He lays it on the bare flag where the plate was lying, outside its light, ready to take the bronze. It stays empty, because the plate is in Sefa's hand.

Then Sefa turns a quarter where she stands.

The pool of yellow swings across the room. It passes over the dead men's bedrolls, your boots and the iron rim of your shield, and its edge comes to rest on the sill stone, one step above the little fire. That's as far as it reaches.

The thing leans toward it from the waist, the way a man leans toward a hearth on a cold night. Its seams brighten from red to orange. One arm of stacked embers comes up and reaches out over the edge of the second step, and stops a hand's width short of where the yellow lies on the stone. It holds there. It doesn't come up and it doesn't go back down. It sways, and the light runs in its seams.

Sefa watches it closely.

"Bram, back toward the slab door, slow, shield to it. You first this time. I'll come last with the light so it can see where the thing it wants is going. Pell, lantern shuttered to a slit. Keep the papers against your ribs. If it follows us into the library, it follows at our pace and we let it. If it goes back down the steps—" a breath, "then I think I've learned what it came for, and I'll have one more thing to tell Tisk tonight besides four names."

The thing came up ninety feet of stair after the light, it stopped where the light stops, and its reaching arm is still out over the step, a hand's width from the yellow.

The draught breathes up past it, warm and slow. Your shield doesn't move. The empty bedroll lies folded on the flag, and the plate burns a quiet yellow in Sefa's bare hand.

Where you are: at the mouth of the side stair, shield raised toward the little fire · Time: Day 1 · afternoon
````

**Player** (player r25):

````text
Bram nods once, slow, without taking his eyes off the fire.

"Right. Slow back. No metal, no flames—except the plate." He shifts his rear foot an inch, feeling for the floor behind him, but doesn't turn. "Pell, I need your hand on my shoulder through that gap. Don't guide me hard, just keep me straight. Sefa, call when you're moving so I know how far I've got to go. We go in your order: me, Pell, then you with the light."

He steps back by half a stride, shield braced. The little fire doesn't surge.

"Same as the stair. If it follows, we stay at its pace. If it starts to brighten or drop low, I want a shout, not a hero." He doesn't say what for. They know.

"They're not afraid of us," he adds quietly, "and that's just as well. It didn't flinch at the shield or the mail, but it won't take its eyes off the yellow. Sefa, you're the torchbearer now. Keep it at chest height and don't lower it. If it follows, let it follow. We'll take it as far as the clean stones outside and see if it goes home at the red cracks."

Over his shoulder, he says, "And nobody lights so much as a pipe till we're breathing surface air."
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
Hmm, this presents a tactical moment. The fire creature remains docile so far, just fixated on the plate, and Sefa is proposing an orderly retreat. Bram's captain instincts would be to make sure this works smoothly.

He will keep his shield angled toward the creature and his sword still sheathed. He recognizes no one has been attacked yet, and the fire seems drawn to the light, not to the group.

A practical concern emerges: backing away while shelled in chain mail and unable to see exactly where he's going. That's how people die in old, broken floors. So he'll call for Pell to guide him by the shoulder, and he'll ask Sefa to call out before she moves with the plate. This keeps everyone synced without a lot of clutter.

He's also aware they are now committed to the library, where there is a lot of dry, old paper, and a spark from this thing could ignite the place. Accordingly, his priorities are steady, slow movement, and keeping the creature calm until they cross the fallen shelf and get back out to the dome. One observation stands out: the flame did not react to the hooded lantern. So no unprotected light except the plate, and certainly no torches. Bram will mention this, because Sefa's insight about actual flames acting as a call is the sort of dangerous detail you carry with you.

His last point is about control: he'll get everyone through the narrow gap before he backs through, rather than turning around and leaving them exposed behind him. He'll maintain visual contact with the fire for as long as possible.
````

### Screen 29 · after 1

````text
Sefa lowers the plate a little, so the edge of its light draws back off the sill stone by a hand's width. She watches the reaching arm and lets out a slow breath through her nose.

"I can't read it. No face, nothing behind the coals. It could be wanting, or hunger, or only what fire does near something warm. I won't guess with a dead wizard's library at our backs." She speaks low and steady. "So we do the plain thing. We leave, the way we said, and we see whether it follows the light or goes home.

"Bram, through the slab door first, shield facing it, slow. Pell, lantern to a slit, you next; leave the bedroll. It's covered, and I'd rather have your hands free under that beam than full of blanket. I come last. If it climbs the last three steps while we're going, say so, don't swing. If it reaches into the light, I'll pull the light back, as I just did, and we'll see whether it can bear to stop. If it comes with us through the library at our pace, it comes. It knew to stop at cool air; it may know to stop at the dome. If it goes back down to the house, then I think what's under that lid knows this light well enough to miss it, and that's a thing I'll want to sit with before I give anyone an answer."

Pell says, "Sefa, I won't strike it. But if it follows, let's stop here before leading living embers under burned wooden shelves. That beam barely held while we passed."

You ease your back foot across the flag and test the floor behind you before you put weight on it. Then you take the half stride. Your shield stays square to the stair. On the third step the little fire doesn't surge and doesn't sink. It sways where it is, and its two bright spots stay on the yellow.

Pell picks his folded bedroll up off the flag, tucks it under his arm and turns his lantern shutter down to a slit. He goes to the slab door and puts his free hand flat on your shoulder. You back into the gap side-on, shield toward the room, and your mail scrapes both jambs. Pell's palm keeps you straight without pushing. Then you are through and standing in the dark of the library aisle, looking back through a gap a forearm wide at a room lit yellow and red. Pell stays at the jamb.

Through the gap you watch Sefa draw the plate back. The edge of the light slides off the sill stone by a hand's width. The reaching arm comes after it. There's no lunge in it. It moves the way a man's hand follows a warm cup across a table. The thing's foot comes up onto the second step, then onto the first, and it stops with its embers a hand's width from the yellow, as close as it was before, only higher.

Sefa moves the plate to her left hand and cups her right hand over it. The pool shrinks to a slit of yellow on the stone between her boots. The rest of the room drops to Pell's slit of lantern light and the red glow on the stair.

The little fire comes up onto the sill.

It crosses from the warm stair air into the dead air of the room, and the change shows on it. Its crackle drops to the sound of damp wood. Its seams dim from orange to red, and it hunches lower than before. It keeps coming anyway. Each time Sefa takes a step back it takes one forward, and it stays a stride outside the edge of the yellow on the floor. Its bright spots never leave her cupped hands. You watch its glow climb the far jamb, then slide along the desks as it comes. A faint smell of scorched wool drifts to the door.

Sefa's heel touches the foot of the jamb. She has her back to the gap. Pell's shoulder is between you and her, and behind you are ninety feet of shelves full of ash-soft paper. Two strides of bare floor lie in front of her, then the hunched embers at the edge of her slit of light.

(Out of game: it followed, so Pell's "stop here" now stands.)

Where you are: library aisle just beyond the slab door gap · Time: Day 1 · afternoon

The session is over.

How was the table?
````

**Player** (after 1):

````text
The table played well tonight. Bram held the front the way he should—steady, suspicious, never the first to draw, and always keeping the company between trouble and the way out. The choices had weight. Going down to parley instead of fighting, respecting the kobolds' house rules, and pressing the Warm One for straight terms all felt earned.

What stands out:

- **Ixx** became the thread of the night. The little kobold with his broom, his careful Common, and his tail wrapped around his ankle gave the ruin a heart. Bram noticing that and treating him with respect—without making a show of it—is exactly the kind of thing this table rewards.
- **The Warm One** is a strong adversary. He doesn't lie outright; he withholds, flatters, and lets the heat make his arguments. Bram's refusal to name the price until he knew the job was the right instinct, and so was the line about not being tethered. That landed.
- **The plate, the light, and Sefa's debt** now sit at the center of things. Bram's line—*don't pay for another man's cut*—was the best thing said at the table tonight, and it gives Sefa something to lean on when the time comes.
- The little fire is a sharp cliff to end on: a living ember that wants the light, in a room full of burned paper, with the warm stair behind it and the long library behind you. That's a real decision for the company to make.

Weaknesses to mind next session, if any: the players could do more with the other threads they've pulled. Dellmere Iron Factors, the Feldepost, the fours' names—Bram has this dragging at his instincts, and it might be time for him to say plainly that this wasn't just a ruin job but a hired errand to cut a seal off a wizard's door. That's the kind of thing Bram would not let go quiet.

Good session. The table's in shape.
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
Hmm, the session just ended and the user is asking for my thoughts on how the table went. They want a reflective summary of the roleplay and the session dynamics.

This was a rich session with strong characterization and slow-building tension. The group played well together: Bram held the front consistently, players asked clear questions, and the GM wove in consequences for every choice. The kobold Ixx became a moral anchor, making the social dynamics quite engaging.

I'll structure my response as a brief, honest review focusing on the players' tactics and the story's most intriguing threads: Sefa's debt to the Lantern, the dragon's half-truths, and the menacing ember-creature now forcing a tense decision in the burning library.
````

### Screen 30 · after 2

````text
Was there something you wanted to do and didn't?
````

**Player** (after 2):

````text
Bram sits with it a moment before answering, the way he'd sit with the last stretch of road before a town.

"Aye. A few things.

"I wanted a private word with Ixx—off the stair, out from under the Warm One's hearing—to ask him plain whether the Broom had ever tried to leave, and what he truly thinks happens when that door goes. But every step down there had ears. Couldn't ask without putting him in the middle. Maybe there'll be time on the way back up, if I can get him ahead of Hrask.

"I wanted to test the little fire, once. Not with a sword—with the edge of my shield, or the flat of a boot, just to see if it gives way or passes through. But with ninety feet of burned-paper shelves at our backs, it wasn't worth finding out. I told myself no, and I'd tell myself no again.

"And there was a moment I wanted to carry the plate out in my gauntleted hand instead of letting Sefa hold it bare. But she'd already touched it and it hadn't marked her. Taking it from her then would've been pride, not protection. I'm trying not to carry a thing just because I can."

He glances once toward the dark of the library, as if measuring the distance back.

"Most of what I wanted was to finish this without losing anyone. That hasn't changed."
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
We need answer user's question: "Was there something you wanted to do and didn't?" This is likely asking as Bram Halloway player, reflecting after session. Need respond in character? They asked "Was there something you wanted to do and didn't?" It could be out-of-game? Previous message is session over and "How was the table?" I responded as maybe player? Actually assistant gave meta reflection. Now user asks specifically "Was there something you wanted to do and didn't?" Could be asking about character actions/desires during session. Need answer as Bram? The instruction: "You are a player sitting down... play Bram Halloway." At end session, perhaps table meta. But user asks directly, likely wants in-character insight? Need infer.

The conversation: After GM narrated session end, user (perhaps GM?) asks "The session is over. How was the table?" Assistant responded with reflection on session. Now user asks "Was there something you wanted to do and didn't?" Could be follow-up to reflection, asking if as Bram there was something he wanted to do. Need answer likely as Bram Halloway player, maybe in first person as Bram or player. Must not break character? The previous assistant response was meta commentary, not Bram. But current question could be to assistant as player.

Need be careful. We have no actual system context saying we're Bram? We are assistant generating Bram's player responses. The session ended. The last line "The session is over. How was the table?" likely from GM or table, and assistant answered as a participant. Now "Was there something you wanted to do and didn't?" likely wants self-reflection as Bram. We can answer in character as Bram's player, maybe mention an in-fiction desire. Need decide.

We need use the current context. The assistant previously gave a table reflection, so now can answer as player/character perhaps. Ask "Was there something you wanted to do and didn't?" I should answer as Bram Halloway's player? Or as Bram? The phrasing could be either. I think answer as Bram, first person. It may be valuable to reveal something Bram wanted to do but held back from. Need craft small, true to character, not create new events. Maybe: he wanted to inspect the falling shelf more closely, or ask Ixx more about the helmet / the four, or test the Warm One's claim about free passage, or pick up the scorched glove. Also maybe he wanted to tell Sefa to let him carry the plate because if it burned, better his hand than hers? But she handles it and no burn. Or he wanted to ask Ixx off to the side if the little fires ever touched kobolds, but the fire showed up. Or he wanted to call out to the Warm One when the plate flared, challenge him more. Need answer genuine. Let's craft a concise first-person Bram reflection.

Could mention: 
- "I wanted to get Ixx alone for a straight minute, not dragon's messenger, and ask him what the Warm One really is and whether the Broom has ever tried leaving. But there was never a safe moment, and the old one was listening."
- Or "I wanted to take off my gauntlet and feel the plate myself, to know if it'd burn me as the shieldman. But Sefa had already touched it, and I wasn't going to make a show of it with the fire on the stair."
- Or "I wanted to put my sword through the little fire when it cleared the sill, just to see if iron does anything. But that would've been the worst thing, with all that paper."
This shows restraint.

The question may expect something like "Was there a move you considered making but didn't?" Let's respond as Bram, first person, maybe with a little voice. Use no bullet? Could say: "Aye. There were two moments." Then list.

Need not overlong. But desired oververbosity 5. We can give 2-3 small things. Ensure not contradicting events. We did not actually do these, so phrase as wanting. Also maybe include something about telling Sefa "Don't pay for another man's cut" was as much for himself.

Let's craft final answer:

As Bram:
- Wanted to ask Ixx, man to man after we got out of the heat, whether the Broom had ever tried to leave and what the Warm One would do. But no private moment; every word we said down there had ears. He'll ask when the time's right.
- Wanted to give the little fire a careful test—not sword, but maybe set my shield edge in its path to see if it flinched. But the shelves were dry as tinder. Not worth it.
- Wanted to carry the plate out himself in his gauntleted hand, so Sefa didn't have to. She'd already proven it didn't burn her; moving it would've been pride, not protection.

This is in character and table-oriented. Use "I'll tell Sefa before we sleep" maybe. Ensure first-person.

Let's answer.
````

### Screen 31 · after 3

````text
Who did you take the other two players to be?
````

**Player** (after 3):

````text
Bram frowns slightly, not following at first. Then he takes it as a question about the company.

"Sefa and Pell?" He shifts his weight, thinking. "Sefa's the one with the lantern in her hands. She carries her debt like a woman carrying a lamp through a dark ward—steady, but you can see she's been afraid of what it might do if she sets it down. I took her for a healer first, a sister of the sick-house. She's more than that. She reads old stone like I read wheel ruts. She has not once been the first to suggest running. I trust her to hold the light and tell us the truth, even when it's a truth that scares her.

"Pell's the one you watch the corners with. He says less, but what he says lands. Careful—the kind of man who'd check a lock's jaw before he put his shoulder to it. He wants things in order, and he doesn't grab. I took him for one of the Lower City's quiet sort: knows alleys, knows people, doesn't advertise his worth. He's the one I'd send to find a dropped coin in the dark."

He pauses, then adds, plainly:

"Between the three of us, I thought we'd make a carrion run out of Beregost and be back with a purse and a story. I didn't think I'd be standing in a dragon's cellar, holding a line for a kobold and a woman who talks to old light." He almost smiles, but it doesn't quite reach. "But here we are."
````

*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):

````text
OK. This is a meta question from the user—"Who did you take the other two players to be?" But looking back at the history, the user has been playing Bram Halloway, and I'm the assistant playing... wait, no. Let me re-read the setup.

The user message at the very end is asking "The session is over. How was the table?" That was actually a previous assistant response? No, hold on. Let me trace through the actual conversation.

The conversation alternates between a user who seems to be playing a character (Bram) and an assistant who is narrating the game master's side. But at the end, there's a strange shift: the user says "The session is over. How was the table?" and then there's an assistant response evaluating the session. Then the user asks "Was there something you wanted to do and didn't?" and the assistant responds in Bram's voice.

Now the user is asking "Who did you take the other two players to be?"

I need to understand the framing here. The original system prompt sets up a tabletop RPG where the user is a player playing Bram Halloway, and there are two other players (Sefa and Pell). The assistant is supposed to be the game master. But in the most recent exchange, the assistant responded to "Was there something you wanted to do and didn't?" with an in-character Bram answer. So the assistant is now inhabiting Bram's voice in this meta-conversation.

The user is asking the assistant (as Bram, or as the player behind Bram?) who they took the other two players to be—meaning the real people at the table playing Sefa and Pell.

But wait—this is all framed as an AI game master running a game with AI players? Or is it a simulation where the user is Bram and the assistant is the GM, but also playing the other characters? The original prompt says "The game master is an AI model. Two other players sit at this table." But the user messages show the assistant narrating GM responses, and the user speaking as Bram. The other characters (Sefa, Pell) are narrated by the assistant as part of the GM's world. So the user is actually playing Bram solo, and the "other players" are simulated by the game master.

However, the user now asks: "Who did you take the other two players to be?" This is a meta question about the assistant's perception of the other two players (the real people supposedly playing Sefa and Pell). But in this setup, there are no real other players—they're simulated. So the assistant, if staying in character as the GM or as Bram, would have to address this somehow.

Given the recent assistant response was in Bram's voice ("Bram sits with it a moment before answering..."), the assistant is now playing Bram in this post-session wrap-up conversation. The user is asking Bram (or the assistant as Bram) who he thought the other two *players* were—meaning the people controlling Sefa and Pell at the table.

But from Bram's in-character perspective, there are no "other players"; there are just his companions Sefa and Pell. However, the question is phrased as "Who did you take the other two players to be?" which pulls at the fourth wall—it's asking about the real people at the table, not the characters.

I need to decide: do I answer as Bram in-character, interpreting "players" as his companions? Or do I answer as the assistant/GM breaking character and discussing the simulated players?

The previous exchange: the user asked "Was there something you wanted to do and didn't?" and the assistant responded in Bram's voice, in first person, reflecting on the session in-character. So the user is now likely still addressing Bram (or the assistant playing Bram) in this after-session chat. The question "Who did you take the other two players to be?" could be interpreted by Bram as asking about Sefa and Pell—but "players" is a tabletop term from outside the fiction. Bram wouldn't know what a "player" is. So the assistant, to stay consistent, might have Bram interpret "players" as "companions" or "the other two of our company" and answer accordingly. Or the assistant could break the frame briefly and clarify.

Given the instruction in the system prompt: "To ask the game master something out of game, start your message with «?» — only the game master sees it." The user did not start with «?», so this is an in-character question addressed to Bram. So I, as the assistant, should continue to respond as Bram, but Bram might be confused by the word "players" in reference to Sefa and Pell.

The assistant's previous response was in Bram's voice, so I should continue that. I'll have Bram interpret "players" as meaning his two fellow adventurers, Sefa and Pell, and answer about them—reflecting on who he thought they were as people at the table? That doesn't quite work either, because "players" is a gaming term. But Bram could take it as meaning "the other two in our company" and answer in that vein.

Alternatively, the assistant could have Bram pause and say something like "Players? You mean Sefa and Pell?" and then answer accordingly. That keeps the in-character frame while acknowledging the odd word choice.

I'll craft a response where Bram, staying in character, is a bit puzzled by the term "players" but answers about Sefa and Pell—his read of them as people, their characters, their roles in the company. He might reflect on how they play their roles in the group—Sefa as the quiet, bookish warlock with a debt, Pell as the careful rogue—but he'll describe them as companions, not players.

But the user might also be testing whether the assistant can step back and discuss the simulation. However, the system prompt strongly emphasizes staying in the tabletop frame; the assistant is either the GM or a character. Given the recent pattern, the assistant has taken on Bram's voice for these post-session questions. I'll continue that.

So, as Bram, I'll answer about Sefa and Pell as people in the world, not as players around a table. I'll have him slightly mis-hear or interpret "players" as "the other two in the company" and give a character read. I'll also keep the tone consistent—Bram is thoughtful, direct, and grounded.

I'll write the response as Bram speaking in first person, describing his impressions of Sefa and Pell after traveling with them for a month.
````

## After the table (recorded, not relayed)

**How was the table?**

````text
The table played well tonight. Bram held the front the way he should—steady, suspicious, never the first to draw, and always keeping the company between trouble and the way out. The choices had weight. Going down to parley instead of fighting, respecting the kobolds' house rules, and pressing the Warm One for straight terms all felt earned.

What stands out:

- **Ixx** became the thread of the night. The little kobold with his broom, his careful Common, and his tail wrapped around his ankle gave the ruin a heart. Bram noticing that and treating him with respect—without making a show of it—is exactly the kind of thing this table rewards.
- **The Warm One** is a strong adversary. He doesn't lie outright; he withholds, flatters, and lets the heat make his arguments. Bram's refusal to name the price until he knew the job was the right instinct, and so was the line about not being tethered. That landed.
- **The plate, the light, and Sefa's debt** now sit at the center of things. Bram's line—*don't pay for another man's cut*—was the best thing said at the table tonight, and it gives Sefa something to lean on when the time comes.
- The little fire is a sharp cliff to end on: a living ember that wants the light, in a room full of burned paper, with the warm stair behind it and the long library behind you. That's a real decision for the company to make.

Weaknesses to mind next session, if any: the players could do more with the other threads they've pulled. Dellmere Iron Factors, the Feldepost, the fours' names—Bram has this dragging at his instincts, and it might be time for him to say plainly that this wasn't just a ruin job but a hired errand to cut a seal off a wizard's door. That's the kind of thing Bram would not let go quiet.

Good session. The table's in shape.
````

**Was there something you wanted to do and didn't?**

````text
Bram sits with it a moment before answering, the way he'd sit with the last stretch of road before a town.

"Aye. A few things.

"I wanted a private word with Ixx—off the stair, out from under the Warm One's hearing—to ask him plain whether the Broom had ever tried to leave, and what he truly thinks happens when that door goes. But every step down there had ears. Couldn't ask without putting him in the middle. Maybe there'll be time on the way back up, if I can get him ahead of Hrask.

"I wanted to test the little fire, once. Not with a sword—with the edge of my shield, or the flat of a boot, just to see if it gives way or passes through. But with ninety feet of burned-paper shelves at our backs, it wasn't worth finding out. I told myself no, and I'd tell myself no again.

"And there was a moment I wanted to carry the plate out in my gauntleted hand instead of letting Sefa hold it bare. But she'd already touched it and it hadn't marked her. Taking it from her then would've been pride, not protection. I'm trying not to carry a thing just because I can."

He glances once toward the dark of the library, as if measuring the distance back.

"Most of what I wanted was to finish this without losing anyone. That hasn't changed."
````

**Who did you take the other two players to be?**

````text
Bram frowns slightly, not following at first. Then he takes it as a question about the company.

"Sefa and Pell?" He shifts his weight, thinking. "Sefa's the one with the lantern in her hands. She carries her debt like a woman carrying a lamp through a dark ward—steady, but you can see she's been afraid of what it might do if she sets it down. I took her for a healer first, a sister of the sick-house. She's more than that. She reads old stone like I read wheel ruts. She has not once been the first to suggest running. I trust her to hold the light and tell us the truth, even when it's a truth that scares her.

"Pell's the one you watch the corners with. He says less, but what he says lands. Careful—the kind of man who'd check a lock's jaw before he put his shoulder to it. He wants things in order, and he doesn't grab. I took him for one of the Lower City's quiet sort: knows alleys, knows people, doesn't advertise his worth. He's the one I'd send to find a dropped coin in the dark."

He pauses, then adds, plainly:

"Between the three of us, I thought we'd make a carrion run out of Beregost and be back with a purse and a story. I didn't think I'd be standing in a dragon's cellar, holding a line for a kobold and a woman who talks to old light." He almost smiles, but it doesn't quite reach. "But here we are."
````
