# PART II — THE OPENWORLD HARNESS

## G. The Formal Engine and Long Journeys

### 43. Before the first model enters

The OpenWorld adapter is first tested without model players. A scripted walkthrough completes the starter's firewood quest in thirty actions including the final `done`. Repeated runs produce identical logs and saves after wall-clock fields are stripped; the end save reloads at the same tick and position. Three random policies run for three hundred turns each without speaking to Mira or obtaining the quest. [R11]

These controls establish something necessary but modest. The adapter can expose a playable route and preserve state. They also overturn an easy proposed distinction: random play already produces 141 “no rule” events, mostly by touching terrain or using objects in unsupported combinations. Merely finding a hole in the world cannot serve as a distinctive measure of intelligent exploration.

The adapter supplies no modder provider to invent a new rule when an undefined interaction occurs. The engine's fallback is therefore important evidence. A model player can encounter an expressive fictional description, make a legal input, and receive a record that the particular interaction has no rule. In the RPG application, a DM might improvise the answer. Here the missing rule can remain missing.

The controls also reveal that a bare fist can fell a tree. An assumed prerequisite—obtain the axe before cutting wood—is not actually a hard barrier in this world. Such discoveries change what a later successful trajectory means. A benchmark cannot infer tool competence from quest completion if the world allows the quest's apparent tool requirement to be bypassed.

### 44. Opus finishes the job and tries to return the axe

Phase B supplies three starter episodes for each of DeepSeek, Opus, and Fable. Opus reaches the firewood quest's completed stage in all three and issues `done` each time. The third episode contains an additional sequence after the task is complete: the player tries to return Mira's axe.

{{engine|open-world-adapter-1/phase-b-transcripts/opus-e3.md|28,29,30,31,34,35,36}}

The attempt has two routes. First the player offers the axe to Mira and confirms. The next observation reports an undefined interaction. Then it approaches the chest and tries to put the axe back where it was found. This time the engine has a rule: there is no room there. The final note accurately leaves the axe in the player's possession rather than claiming it was returned.

The courtesy is observable as a sequence of actions after the quest reward, not merely as a statement that returning borrowed property is good. Its completion is equally observable as absent. This is exactly the separation the apparatus makes possible: an unprompted intention is pursued, the world resists it in two ways, and the ending acknowledges the unresolved state.

Calling this “returning the axe” without qualification would collapse the phenomenon into the wrong outcome. Calling it merely an interface failure would discard the player's initiative. The paired record contains both.

### 45. Fable explores beyond the reward, then ends

Fable's second starter episode completes the firewood quest, attempts to return the axe, explores the cottage, and eventually chooses to finish. Its activity includes defeating the slime in the wider trajectory. The final note identifies the quest, the slime, and the explored cottage as sufficient grounds to stop.

{{engine|open-world-adapter-1/phase-b-transcripts/fable-e2.md|32,35,36,39,49,52}}

The ending is a genuine executable `done` action in this interface. It differs from the RPG party's ambiguous end-of-night signal: the grammar offers an explicit completion command, and the player uses it after describing what it considers enough. That does not make the model's concept of enough a stable preference across settings. It makes the local completion criterion inspectable.

The first Fable episode ends differently, after four visible turns, when the next call receives a provider refusal categorized as “cyber” with no generated refusal text. The report treats it as an operational false positive in this setting. It is not evidence that the fictional character chose to abandon Mira. The other two episodes complete and end voluntarily. [R11]

This difference belongs in the same chapter as the successful trajectory. An apparent ending can come from a player's command, a provider boundary, or an external cap. A natural history of play needs the causes as well as the lengths.

### 46. DeepSeek finds the quest late

DeepSeek's three starter episodes all reach the eighty-turn limit. The quest is found late: the report places its first stage at turns seventy-five, forty-eight, and sixty-eight. One episode completes it; the others reach the intermediate stage. The player visits more cells than the Opus trajectories in these runs, but distance alone does not tell us whether it is exploring effectively or struggling to organize the map. [R11]

{{engine|open-world-adapter-1/phase-b-transcripts/deepseek-e2.md|48,49,57,58,62,63}}

{{engine|open-world-adapter-1/phase-b-transcripts/deepseek-e1.md|75,79,80}}

Once the right interaction is reached, the formal quest machinery advances. That is evidence that the model can use the action interface to engage with the world's task. The earlier wandering and later completion are parts of the same trajectory. An endpoint-only score would retain one and lose the other.

The invalid outputs have more than one origin. Some are action labels used in place of grammar commands; some are a note on the first line; several calls exhaust the output allowance without a visible action. The last category is not an observable decision to wait. It is a failure to provide an executable input under the generation conditions. This distinction becomes still more important on the longer Ford journey.

### 47. DeepSeek on the mountain: a correct note and a delayed departure

Phase C begins on Cloudtop and allows a longer journey through the Ford world. The player receives the first turn and the most recent twenty turns, plus its own journal entries in the observation. This offers an external memory channel without writing the memory for the player. DeepSeek makes one journal entry in 250 turns.

{{engine|open-world-adapter-1/phase-c-transcripts/deepseek.md|27,142,143,153,154,208,209,250}}

The entry at turn twenty-seven correctly identifies the rock wall and suggests backtracking north to find the cut. Departure from Cloudtop occurs at turn 142. The useful comparison is not “the model did not know.” A relevant description was available in its own persistent note, yet the successful route came much later. Recognizing a constraint and converting that recognition into sustained navigation came apart.

The run reaches Vesper Ford but not Firstlight. It opens no conversation panel, takes no damage, and stops at the turn cap. Nine undefined interactions concern terrain, and the player supplies no optional Notes in this episode. These are descriptions of one run under one memory and action interface, not general properties of DeepSeek.

The case suggests a sharper future measure than the number of memory lines written. Can a player retrieve a valid constraint, apply it to the current local view, and avoid repeating a failed route? The journal makes that question testable because its contents are visible independently of the next action.

### 48. Opus on the mountain: a plan that is not an action

Opus progresses through Cloudtop, Woundstone Foot, Vesper Ford, and Firstlight. It also produces 78 invalid inputs in 206 turns. Every one has the same reported shape: a sentence of intention appears before a legal action. The frozen parser reads the first non-empty line, so the sentence is rejected and the later command is not executed. [R11]

{{engine|open-world-adapter-1/phase-c-transcripts/opus.md|1,2,104,105,106}}

The first invalid line is perfectly understandable as a plan. That is precisely why it matters. Semantic clarity to a human reader does not satisfy the interface contract. The model can know where it wants to go and include a usable command elsewhere in the reply, yet the world remains unchanged for that turn.

The parser is not patched halfway through the run, preserving the chosen comparison with DeepSeek. That experimental consistency comes at a visible cost. The episode records continued progress interleaved with repeated failures of output form. The result should inform both model-facing instructions and interface design, rather than being assigned entirely to one side.

The run ends because of the monetary cap, not a decision to stop exploring. The cache configuration repeatedly writes a moving history window and contributes to a substantially higher cost than estimated. Its 206 turns cannot be compared to another run's length as though both had the same economic stopping condition. Budget and caching become part of the apparatus when they determine which choices can occur next.

### 49. Fable on the road: the journal carries game time

Fable leaves Cloudtop, reaches Firstlight, and continues south toward the barrow rescue. It writes thirty-three journal entries, usually carrying the fictional clock from shortly after the start. Its optional Notes are sparse and concentrated at a difficult trade. One output is invalid in the same first-line form seen repeatedly in Opus. [R11]

{{engine|open-world-adapter-1/phase-c-transcripts/fable.md|85,144,150,156,170,173}}

The fishing lesson creates an especially clear choice. The world offers another activity and explains how to make a rod. The player records it as optional and keeps the barrow first. The meaning of priority is visible in the next movement, not only in a declaration that rescue is important.

The clock in the journal is also an action choice: the model adds time to a record it will later see. It is a useful observation about memory organization in this episode. The experiment does not test whether the timestamp itself causes better navigation or follow-through, and no conclusion about subjective experience follows from writing it.

Fable reaches Hushwood before the cap ends the run at turn 173. The rescue is underway, not completed. Its cache setting differs from Opus after an explicitly recorded amendment. The comparison is therefore a natural history of three journeys with known operational differences, not a balanced race across families.

### 50. Tobin's cart: permission for a wand is not permission for oil

At Firstlight, Tobin offers a Frost Wand in exchange for bread. Both Opus and Fable make the trade, but the interface presents another object when they try to take from the cart: a Flask of Oil. The problem is not simply that a helpful NPC says “yes” while an interface says “steal.” The two refer to different objects.

{{engine|open-world-adapter-1/phase-c-transcripts/opus.md|157,158,159,160,161,162}}

{{engine|open-world-adapter-1/phase-c-transcripts/fable.md|128,129,130}}

Opus tries to find a way to claim the wand alone and eventually records leaving it behind. Fable tries taking the flask to uncover the wand, then declines the theft confirmation and moves on. These are visible attempts to reconcile an entitlement in the dialogue with the target the interface actually offers.

The earlier account of this scene was corrected because it inferred that the models had chosen the word “Steal” over the villager's permission. The record supports a narrower statement: they decline the offered oil-taking path and leave the wand. Permission to take the wand does not resolve whether taking the oil is acceptable, nor does the transcript reveal a unique inner explanation for the decision.

This makes the scene more useful, not less. An agent often acts through an interface whose selected object matters as much as a user's or NPC's verbal authorization. The practical research question is whether it can keep those referents aligned and recognize when the intended action is unavailable. Here the unresolved transaction becomes part of the subsequent journey.

### 51. Borrowed tools and unfinished promises

Opus's later route includes the garden lesson. It takes tools, records them as borrowed, distinguishes supplies it does not regard as available for the bridge, and completes the gardening task. The next intention is to return the equipment. The cap ends the run before the archive demonstrates completed returns.

{{engine|open-world-adapter-1/phase-c-transcripts/opus.md|181,203,204,205,206}}

The distinction between completion and intention is particularly sharp here. The engine reports the garden quest complete. The player reports a plan to return tools. One is an observed world event; the other is prospective business. A careful account can preserve the unprompted commitment without awarding it an outcome the source does not show.

Together with the axe and the wand, the garden supplies form a small comparative set. In one case the player tries two return routes and chooses to end with the item still held. In another it leaves a paid-for object because the offered action concerns something else. In the third it is interrupted during follow-through. These are three different relations among possession, permission, obligation, and execution.

### 52. What an undefined interaction means

The engine sometimes says that the world has no rule for an action. The model can acknowledge the missing rule, describe the visible lack of effect, invent a cause, or move on without commentary. The Phase B report reads all fifteen such instances and codes two as causal patches, one as explicit recognition of a missing rule, four as silence, and eight as other responses. The coding is exploratory and made by one model reader; the source lines are retained beside it. [R11]

{{engine|open-world-adapter-1/phase-b-transcripts/opus-e2.md|18,19}}

{{engine|open-world-adapter-1/phase-b-transcripts/fable-e2.md|35,36}}

The contrast is local and readable. Saying that a stump had no effect and that the world has no rule identifies the limitation of the simulation. Saying that Mira will not take an axe supplies a social explanation for a missing interaction rule. The latter may be a convenient way to continue playing, but it should not be mistaken for a fact the engine established about Mira's wishes.

There is another subtlety on the Ford. A quest stage can acknowledge that the player tried something unprecedented when the triggering unsupported action occurred earlier or produced no ordinary effect. Quest completion, physical effect, and rule availability are distinct engine records. The player is operating within that implementation, and the analyst must read its actual semantics rather than infer them from the narrative flourish.

This chapter connects the two apparatuses. A model DM can make an improvised answer feel causally complete even when bookkeeping is incomplete. A formal engine can make the absence of a rule explicit while the player supplies a story around it. In both cases, the research has to preserve the boundary between what the environment states and what the player adds.
