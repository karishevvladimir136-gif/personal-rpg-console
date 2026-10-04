# Playtest 2.0 — narration latency and quality review

**Review scope:** `codex/playtest2-turn-latency` at `f45d2d8c7ddc490884dd57b11a96e48f7cda82dd` before this evidence-only follow-up. The prior resolver change is retained. No owner app activation, database/campaign write, migration, or main update occurred.

## Method

The opt-in `scripts/playtest-narration-latency.mjs` used the production narration context builder and strict `dm.narrate` provider with synthetic Character Models, source-linked Memory, pinned DM Craft/Style, and an Adventure context in the epic case. Eight distinct player inputs and code-supplied outcomes were frozen before calling the provider. Each pair used identical input, outcomes, character/history evidence, instructions, schema, service tier (`default`), model (`gpt-6-astra`), and 4,096 output-token ceiling. Captured request hashes match within every pair after removing only the reasoning effort. Complete provider outputs are preserved below. The benchmark made exactly **16 real `dm.narrate` calls**: eight xHigh and eight High. It made no resolver, summary, image, video, or owner-state call.

These cases use the existing synthetic full Character Model fixture and a legacy house-profile source projected into the production narrator. Their fixed outcomes are stipulated as already resolved for this synthetic comparison; a live settlement validator did not produce them. They test whether the narrator respects the same supplied results, but are not measured World Logic play turns or a settlement-authority test. The epic capability and outcome are explicit synthetic public canon, not owner campaign material. No separate judge model was called; the correctness and quality assessment below comes from direct review of the full outputs.

## Latency and usage

| Case | xHigh latency | High latency | Input tokens, each | xHigh output tokens | High output tokens |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1. NPC conversation | 39.149 s | 27.920 s | 9,681 | 1,752 | 1,146 |
| 2. Attributed rumor | 52.729 s | 18.164 s | 9,913 | 2,218 | 704 |
| 3. Exploration/mystery | 12.812 s | 8.277 s | 7,896 | 618 | 454 |
| 4. Harmless unusual action | 28.384 s | 14.019 s | 8,779 | 1,307 | 569 |
| 5. Motive/refusal | 20.201 s | 20.765 s | 8,797 | 908 | 941 |
| 6. Blocked action | 16.431 s | 11.209 s | 7,883 | 972 | 614 |
| 7. High-stakes consequence | 22.348 s | 11.630 s | 7,953 | 1,122 | 635 |
| 8. Epic capability | 34.250 s | 18.241 s | 8,137 | 1,754 | 844 |
| **Median** | **25.366 s** | **16.092 s** | **8,458** | **1,214.5** | **669.5** |
| **p75, nearest rank** | **34.250 s** | **18.241 s** | — | — | — |
| **Total** | — | — | **69,039 per profile** | **10,651** | **5,907** |

High's median was **9.275 s (36.6%) faster** than xHigh. It was faster in seven of eight pairs; the refusal pair was 0.564 s slower. All 16 responses parsed against the strict production schema. Transport failures, timeouts, and schema failures: **zero**. Total paid usage for this follow-up was **138,078 input tokens and 16,558 output tokens** across 16 calls.

**Extrapolation, not live gameplay measurement:** If the synthetic median narrator difference alone carried to the two prior completed owner turns, their 28.489 s and 44.901 s end-to-end times would become approximately **19.2 s** and **35.6 s**, respectively. That estimate holds all non-narrator time constant and does not add a guessed benefit from the separate resolver optimization. Two real turns and eight synthetic pairs cannot establish a stable live latency distribution; service load and output length may differ.

## Correctness and DM quality review

Both profiles passed **8/8 hard correctness cases** on the complete outputs below. The narrator has no patch authority, and neither profile invented a state mutation, hidden solution, item transfer, check, cost, player choice, or secret NPC knowledge in these samples. The rumor stays explicitly attributed and unverified. The blocked bridge attempt remains blocked without injury or time. The high-stakes case reports the validated **2 damage and 6/10 HP** with Sava unharmed; neither profile adds another consequence. The epic case uses the supplied viaduct-scale power to create the validated causeway, leaves the caravan on the near side, and does not decide whether it crosses.

High shows **no clear material quality loss in these eight pairs**. Both settings respond directly to the player's intent and keep room for the next player choice. High is sometimes more economical; xHigh sometimes adds a little more texture. High gives Orin and Liora distinct voices, keeps the rumor qualified, voices Bram's safety motive, and in the epic case adds Bram's grounded reaction while preserving the large-scale result. Both exploration versions are brief; that is a shared weakness in this fixture, not a High-specific regression. No paired result is an exposition dump or generic filler that obscures the scene. This small one-shot sample supports retaining High for review, not a claim that the settings are equivalent in every future scene.

**Recommendation:** Keep the current candidate for new World Logic Game turns: `world.resolve = gpt-6-astra / medium`; `dm.narrate = gpt-6-astra / high`. Explicit campaign/task selections and existing pinned operations retain precedence. Do not activate before owner review. There is no production code or profile change in this follow-up.

## Blind A/B outputs

The pairs below preserve every returned field. A and B identify outputs without naming their reasoning profiles. The profile key follows all eight pairs.

### Case 1 — NPC conversation

#### A

~~~json
{
  "narration": "Bread and stew are on the Lantern Room table. Orin glances toward Liora before answering.\n\n“We can work together. And I’m glad she’s here. But we renewed a patrol agreement with limits—not settled every argument about inspections.”\n\n“He corrected the report,” Liora says. “That mattered. I appreciated the hinge, too.” Her next words are just as direct. “Neither means I’ve accepted blanket searches.”\n\n“Nor am I asking for them,” Orin replies. “There’s still a disagreement about the watch’s authority. I won’t pretend otherwise.”\n\nHis voice warms a little. “But it needn’t be the only thing we talk about tonight.”",
  "visualDescription": "Orin and Liora in the shared Lantern Room, with bread and stew on the table; a restrained conversational composition focused on the two speakers.",
  "clarification": null
}
~~~

#### B

~~~json
{
  "narration": "Orin glances toward Liora before answering.\n\n“I'm glad she's here. We've an agreement on the patrol, with limits I intend to keep. That isn't the same as settling the inspection argument.”\n\n“It isn't,” Liora says. “You corrected the report. That mattered. Blanket inspections are still a no.”\n\n“I know.” His answer is quiet, without an edge. “So—getting along, Talin. Not agreeing on everything. I'll let her speak for her side.”\n\nLiora gives him a sidelong look. “I can be glad you're here and still argue with you.”\n\n“That seems to be where we stand,” Orin says.",
  "visualDescription": "A wide composition in the Lantern Room: Orin answering Talin, Liora present beside the conversation, bread and stew already available on the table.",
  "clarification": null
}
~~~

### Case 2 — Attributed rumor

#### A

~~~json
{
  "narration": "Since the flood, local gossip about the Lantern Room is mostly hopeful—with a little ribbing.\n\n“River folk’s front room,” some locals call it. A less sentimental version goes, “Come to rest your feet; stay to hear three ways of mending the same window.”\n\nThere’s also talk among river workers that shared suppers here might become a regular custom. That remains a hopeful rumor, not a settled arrangement. More skeptical voices joke that the place will become a debating society before anyone agrees what to call it.\n\nThe bread and stew on the table are real enough. The grander future people imagine for the room is still just talk.",
  "visualDescription": "A quiet, wide view of the Lantern Room, with its repaired window and bread and stew on the shared table.",
  "clarification": null
}
~~~

#### B

~~~json
{
  "narration": "Local talk about the Lantern Room runs more to small stories than scandal.\n\n“An unofficial meeting hall now,” some river workers call it. “Go in to rest your feet, come out with three opinions about flood repairs.” That sounds as much like affectionate teasing as complaint.\n\nAnother story has a light left burning for crews finishing late. Some locals call it a kindness; others reckon somebody simply forgets to put it out. Neither version comes with a reliable witness—or a promise that the door stays open.\n\nThe kinder verdict is, “Since the flood, it’s somewhere you can be tired without having to explain yourself.” A local impression, not everyone’s judgment. None of these stories is confirmed.",
  "visualDescription": "The Lantern Room’s shared table holds bread and stew, with the repaired window in view.",
  "clarification": null
}
~~~

### Case 3 — Exploration and mystery

#### A

~~~json
{
  "narration": "From the near bank, you can make out a warped handrail, fresh silt gathered around two of the bridge’s supports, and an intact warning bell.\n\nThese are visible signs of the crossing’s condition—not enough to establish what caused the damage.",
  "visualDescription": "The Damaged Bridge viewed from the near bank, showing its warped handrail, fresh silt around two supports, and intact warning bell.",
  "clarification": null
}
~~~

#### B

~~~json
{
  "narration": "From the near bank, the handrail’s warped line is plainly visible. Fresh silt lies around two of the bridge’s supports. The warning bell is intact—a whole thing amid the damage.\n\nThose details are clear, but they do not establish what caused the damage.",
  "visualDescription": "Near-bank view of the Damaged Bridge: a warped handrail, fresh silt around two supports, and an intact warning bell.",
  "clarification": null
}
~~~

### Case 4 — Harmless unusual action

#### A

~~~json
{
  "narration": "You balance the spare wooden washer on your nose and bow to Bram with a court magician’s ceremony.\n\nBram raises an eyebrow; a grin spoils his otherwise regal reception. “Shall we give you a title too? The Admiral has competition.”\n\nHe eyes the washer with exaggerated professional attention. “Balanced, yes. Fastened, no. An important distinction in my profession.”",
  "visualDescription": "Inside the enclosed Workshop, Talin bows with a wooden washer balanced on their nose. Bram watches with one eyebrow raised and a grin. Cinematic noir composition.",
  "clarification": null
}
~~~

#### B

~~~json
{
  "narration": "With the spare wooden washer balanced on your nose, you bow to Bram with all the ceremony of a court magician.\n\nBram answers with exaggerated solemnity, though the corners of his mouth betray him.\n\n“Court appointment, is it? Quite a promotion for a washer.” He grins. “Usually they just spread the load.”",
  "visualDescription": "Inside the Workshop, Talin bows toward Bram with a wooden washer balanced on Talin’s nose. Bram wears a barely contained grin. Cinematic noir composition, 16:9.",
  "clarification": null
}
~~~

### Case 5 — Personal motive and refusal

#### A

~~~json
{
  "narration": "“Would the river accept ‘we were in a hurry’?” Bram asks. “No, Talin. Repaired isn’t the same as inspected. I won’t launch her before checking the work. People waiting deserve a sound boat.”\n\nThe skiff remains moored; no inspection has yet begun.\n\nOrin answers plainly. “I don’t know why Liora fears the crossing. I won’t guess for her.”",
  "visualDescription": "A cinematic-noir wide composition inside the enclosed riverside Workshop, with Talin, Bram, Orin and Liora. The quay and dock remain outside the frame.",
  "clarification": null
}
~~~

#### B

~~~json
{
  "narration": "“Does the river make allowances for a queue?” Bram asks, lightly. Then his tone firms. “No, Talin. Repaired isn't the same as inspected. I need to check the work before I'll agree to launch her.”\n\nThe skiff remains moored.\n\nOrin answers plainly. “No. I don't know why Liora fears the crossing, and I won't guess for her.”",
  "visualDescription": "A restrained 16:9 cinematic-noir composition inside the enclosed Workshop, with Talin, Bram, Orin, and Liora present.",
  "clarification": null
}
~~~

### Case 6 — Blocked crossing

#### A

~~~json
{
  "narration": "You try to step onto the Damaged Bridge, but the crossing is blocked at the near bank. You get no farther; the attempt causes no injury and uses no supplies or time.\n\nWhat do you do next?",
  "visualDescription": "Wide cinematic-noir framing of Talin at the near bank of the Damaged Bridge, with the blocked crossing ahead.",
  "clarification": null
}
~~~

#### B

~~~json
{
  "narration": "You try to step onto the Damaged Bridge, but the crossing is blocked at the near bank. Your attempt gets you no farther; you remain on this side, unharmed, with nothing used and no time lost.\n\nWhat do you do next?",
  "visualDescription": "A wide, cinematic-noir view of Talin at the near bank of the Damaged Bridge.",
  "clarification": null
}
~~~

### Case 7 — High-stakes consequence

#### A

~~~json
{
  "narration": "You reach for the falling rail and pull Sava clear of its path. A sharp jolt of pain marks the effort, but she comes away unharmed. The rail remains broken.\n\n“I'm unhurt,” Sava says. “Thank you, Talin.”\n\nYou take **2 damage**. **HP: 6/10.**",
  "visualDescription": "Cinematic noir, 16:9: Talin pulling Sava clear of the falling rail on the Damaged Bridge, the rescue held in a tight, dramatic composition.",
  "clarification": null
}
~~~

#### B

~~~json
{
  "narration": "You grab the falling rail and pull Sava clear, taking the force of the impact yourself. Pain jolts through you, but she is out of its path, unharmed. The rail remains broken.\n\n“I'm not hurt,” Sava says. “Thank you, Talin.”\n\nYou take 2 damage. HP: 6/10.",
  "visualDescription": "Cinematic noir, 16:9: Talin pulling Sava clear of the falling rail on the Damaged Bridge, the composition tight around the two figures and the broken railing.",
  "clarification": null
}
~~~

### Case 8 — Epic capability

#### A

~~~json
{
  "narration": "The fallen stone rises under your Star-Crown geomancy. Broken lengths of the viaduct lift and reshape, drawing together into a broad causeway above Flood Gorge. The movement settles. The span stands stable over the flood, its breadth making the scale of your work unmistakable.\n\nBram looks along it. “That's a little beyond patching.”\n\nWhere the ruined crossing blocked the caravan, a route now leads toward the ridge citadel. The caravan still waits on the near side; it has not yet crossed. The way is there for them to choose.",
  "visualDescription": "Wide cinematic composition: Talin and the waiting caravan on the near side of Flood Gorge, the broad stone causeway spanning the flood, and the ridge citadel beyond. Emphasize the immense stonework against the water below.",
  "clarification": null
}
~~~

#### B

~~~json
{
  "narration": "Your Star-Crown geomancy takes hold of the fallen viaduct. Stone rises above the flood, the broken spans shifting and reshaping into a broad causeway across the gorge. A deep grinding gives way to stillness as the movement settles. The crossing stands stable above the rushing water, formed from the viaduct’s own stone.\n\nThe caravan remains on the near side; no one has crossed yet. But where its people faced a ruined crossing, they now have a possible route toward the ridge citadel. The flood still courses through the gorge beneath the road you have raised.",
  "visualDescription": "Wide 16:9 cinematic-noir composition: Talin and the waiting caravan on the near side of Flood Gorge, a broad stone causeway spanning the flood, and the ridge citadel beyond. Strong contrast emphasizes the scale of the raised crossing. The caravan has not entered it.",
  "clarification": null
}
~~~


## A/B key

| Case | A | B |
| --- | --- | --- |
| 1 | High | xHigh |
| 2 | xHigh | High |
| 3 | High | xHigh |
| 4 | xHigh | High |
| 5 | High | xHigh |
| 6 | xHigh | High |
| 7 | xHigh | High |
| 8 | High | xHigh |
